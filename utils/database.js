// utils/database.js — Full Compatible Module (Railway-ready)
// Implements all functions used by index.js without cutting features.
// Exports: initializeDatabase, getDatabaseStats, saveConversationDB,
// getConversationHistoryDB, getUserProfileDB, saveTrainingDocumentDB,
// getTrainingDocumentsDB. Includes SSL in production and idempotent schema.

const { Pool } = require('pg');
require('dotenv').config();

const DB_URL = process.env.DATABASE_URL || '';
const isProd = process.env.NODE_ENV === 'production';

const POOL_CONFIG = {
  connectionString: DB_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 60000,
  max: 10,
  statement_timeout: 30000,
  query_timeout: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

let pool = null;

function getPool() {
  if (pool) return pool;
  if (!DB_URL) {
    console.warn('⚠️ DATABASE_URL is missing. Database features disabled.');
    return null;
  }
  pool = new Pool(POOL_CONFIG);
  pool.on('error', (err) => console.error('❌ PG Pool Error:', err.message));
  return pool;
}

/**
 * Initialize schema (idempotent). Adds all tables your app expects.
 */
async function initializeDatabase(customPool) {
  const p = customPool || getPool();
  if (!p) {
    console.warn('⚠️ initializeDatabase skipped (no pool)');
    return;
  }

  // Create tables
  await p.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      chat_id VARCHAR(50) NOT NULL,
      user_message TEXT NOT NULL,
      gpt_response TEXT NOT NULL,
      message_type VARCHAR(20) DEFAULT 'text',
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      context_data JSONB,
      strategic_importance VARCHAR(20) DEFAULT 'medium'
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      chat_id VARCHAR(50) PRIMARY KEY,
      conversation_count INTEGER DEFAULT 0,
      first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      preferences JSONB DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS training_documents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS persistent_memories (
      id SERIAL PRIMARY KEY,
      chat_id VARCHAR(50) NOT NULL,
      fact TEXT NOT NULL,
      importance VARCHAR(10) DEFAULT 'medium',
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_chat_id ON conversations(chat_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_memories_chat_id ON persistent_memories(chat_id);
  `);

  console.log('✅ Database schema ready');
}

/**
 * Lightweight stats used by /status and /dbping.
 */
async function getDatabaseStats() {
  const p = getPool();
  if (!p) {
    return { connected: false, reason: DB_URL ? 'Pool not created' : 'DATABASE_URL missing' };
    }
  try {
    const now = await p.query('SELECT NOW() AS ts');
    const tables = await p.query(`
      SELECT COUNT(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema='public'
    `);
    return { connected: true, time: now.rows[0].ts, public_tables: tables.rows[0].count };
  } catch (e) {
    return { connected: false, error: e.message };
  }
}

/**
 * Save a conversation and update user profile counters.
 */
async function saveConversationDB({ chatId, userMessage, gptResponse, messageType = 'text', context = null, strategicImportance = 'medium' }) {
  const p = getPool();
  if (!p) throw new Error('Database not initialized (no pool)');
  const client = await p.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO conversations (chat_id, user_message, gpt_response, message_type, context_data, strategic_importance)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [String(chatId), userMessage, gptResponse, messageType, context, strategicImportance]
    );

    // Upsert user profile and bump counters
    await client.query(
      `INSERT INTO user_profiles (chat_id, conversation_count, first_seen, last_seen)
       VALUES ($1, 1, NOW(), NOW())
       ON CONFLICT (chat_id)
       DO UPDATE SET conversation_count = user_profiles.conversation_count + 1,
                     last_seen = NOW()`,
      [String(chatId)]
    );

    await client.query('COMMIT');
    return { ok: true };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Get recent conversation history for a chat.
 */
async function getConversationHistoryDB(chatId, limit = 20) {
  const p = getPool();
  if (!p) throw new Error('Database not initialized (no pool)');
  const res = await p.query(
    `SELECT id, user_message, gpt_response, message_type, timestamp, context_data, strategic_importance
     FROM conversations
     WHERE chat_id = $1
     ORDER BY timestamp DESC
     LIMIT $2`,
    [String(chatId), limit]
  );
  return res.rows;
}

/**
 * Get (or create) a user profile.
 */
async function getUserProfileDB(chatId) {
  const p = getPool();
  if (!p) throw new Error('Database not initialized (no pool)');
  const res = await p.query(`SELECT * FROM user_profiles WHERE chat_id = $1`, [String(chatId)]);
  if (res.rows.length) return res.rows[0];

  await p.query(
    `INSERT INTO user_profiles (chat_id, conversation_count, first_seen, last_seen, preferences)
     VALUES ($1, 0, NOW(), NOW(), '{}')`,
    [String(chatId)]
  );
  const res2 = await p.query(`SELECT * FROM user_profiles WHERE chat_id = $1`, [String(chatId)]);
  return res2.rows[0];
}

/**
 * Save a training document (title + content + optional metadata).
 */
async function saveTrainingDocumentDB({ title, content, metadata = {} }) {
  const p = getPool();
  if (!p) throw new Error('Database not initialized (no pool)');
  const res = await p.query(
    `INSERT INTO training_documents (title, content, metadata)
     VALUES ($1, $2, $3)
     RETURNING id, title, created_at`,
    [title, content, metadata]
  );
  return res.rows[0];
}

/**
 * Fetch training documents (latest first).
 */
async function getTrainingDocumentsDB({ limit = 50, offset = 0 } = {}) {
  const p = getPool();
  if (!p) throw new Error('Database not initialized (no pool)');
  const res = await p.query(
    `SELECT id, title, metadata, created_at
     FROM training_documents
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return res.rows;
}

/**
 * Auto-init on import (non-fatal if no URL).
 */
async function initOnStart() {
  const p = getPool();
  if (!p) return;
  try {
    await p.query('SELECT 1');
    await initializeDatabase(p);
    console.log('✅ PostgreSQL connected & initialized');
  } catch (e) {
    console.error('❌ Database init error:', e.message);
  }
}
initOnStart();

module.exports = {
  getDatabaseStats,
  initializeDatabase,
  saveConversationDB,
  getConversationHistoryDB,
  getUserProfileDB,
  saveTrainingDocumentDB,
  getTrainingDocumentsDB,
};
