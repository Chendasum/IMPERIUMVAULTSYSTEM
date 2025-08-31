// utils/database.js
// Production-grade PostgreSQL helper for IMPERIUM VAULT
// - Safe connection pooling (keepAlive, SSL)
// - Automatic schema creation
// - Query retries with backoff
// - Heartbeat to prevent idle disconnects
// - Drop-in functions used by index.js & dualCommandSystem.js

'use strict';

const { Pool } = require('pg');

// ───────────────────────────────────────────────────────────────────────────────
// ENV & CONFIG

const USE_URL = !!process.env.DATABASE_URL;
const SSL_ENABLED = String(process.env.PG_SSL || 'true').toLowerCase() !== 'false';

const poolConfig = USE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: SSL_ENABLED ? { rejectUnauthorized: false } : false,
      max: Number(process.env.PG_POOL_MAX || 5),
      idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30_000),
      connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS || 10_000),
      keepAlive: true
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'postgres',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      ssl: SSL_ENABLED ? { rejectUnauthorized: false } : false,
      max: Number(process.env.PG_POOL_MAX || 5),
      idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30_000),
      connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS || 10_000),
      keepAlive: true
    };

const QUERY_RETRIES = Number(process.env.PG_QUERY_RETRIES || 2);
const HEARTBEAT_MS = Number(process.env.PG_HEARTBEAT_MS || 0); // 0 = disabled

const log = (...args) => console.log('[db]', ...args);
const warn = (...args) => console.warn('[db]', ...args);
const err  = (...args) => console.error('[db]', ...args);

// ───────────────────────────────────────────────────────────────────────────────
// POOL

const pool = new Pool(poolConfig);

pool.on('error', (e) => {
  // Unhandled errors on an idle client.
  err('Pool error:', e.message);
});

// ───────────────────────────────────────────────────────────────────────────────
// RETRY WRAPPER

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function withRetries(fn, label) {
  let attempt = 0;
  let lastErr;
  const delays = [200, 600, 1200];

  while (attempt <= QUERY_RETRIES) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const msg = (e && e.message) ? e.message : String(e);
      warn(`${label || 'query'} failed (attempt ${attempt + 1}/${QUERY_RETRIES + 1}): ${msg}`);
      // transient-ish errors
      const transient =
        /terminat|reset|timeout|ECONNRESET|connection.*closed|read ECONNRESET|no\s*pg_hba|could not connect/i.test(msg);

      if (attempt >= QUERY_RETRIES || !transient) break;
      await sleep(delays[Math.min(attempt, delays.length - 1)]);
      attempt++;
    }
  }
  throw lastErr;
}

// ───────────────────────────────────────────────────────────────────────────────
// SCHEMA

const SQL = {
  CREATE_CONVERSATIONS: `
    CREATE TABLE IF NOT EXISTS conversations (
      id BIGSERIAL PRIMARY KEY,
      chat_id TEXT NOT NULL,
      user_message TEXT,
      assistant_response TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `,
  INDEX_CONVERSATIONS: `
    CREATE INDEX IF NOT EXISTS idx_conversations_chat_time
      ON conversations (chat_id, created_at DESC);
  `,
  CREATE_MEMORY_FACTS: `
    CREATE TABLE IF NOT EXISTS memory_facts (
      id BIGSERIAL PRIMARY KEY,
      chat_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      expires_at TIMESTAMPTZ
    );
  `,
  INDEX_MEMORY_FACTS1: `
    CREATE INDEX IF NOT EXISTS idx_memory_facts_chat_key
      ON memory_facts (chat_id, key);
  `,
  INDEX_MEMORY_FACTS2: `
    CREATE INDEX IF NOT EXISTS idx_memory_facts_expires
      ON memory_facts (expires_at);
  `
};

async function ensureSchema() {
  await withRetries(async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(SQL.CREATE_CONVERSATIONS);
      await client.query(SQL.INDEX_CONVERSATIONS);
      await client.query(SQL.CREATE_MEMORY_FACTS);
      await client.query(SQL.INDEX_MEMORY_FACTS1);
      await client.query(SQL.INDEX_MEMORY_FACTS2);
      await client.query('COMMIT');
      log('Schema ready');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }, 'ensureSchema');
}

// ───────────────────────────────────────────────────────────────────────────────
// CORE QUERIES

async function query(text, params, label) {
  return withRetries(async () => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const ms = Date.now() - start;
    if (ms > 500) log(`${label || 'query'} took ${ms}ms`);
    return res;
  }, label || 'query');
}

async function saveConversation(chatId, userMessage, assistantResponse, metadata) {
  if (!chatId) return false;
  await query(
    `
      INSERT INTO conversations (chat_id, user_message, assistant_response, metadata)
      VALUES ($1, $2, $3, $4)
    `,
    [String(chatId), String(userMessage || ''), String(assistantResponse || ''), metadata || null],
    'saveConversation'
  );

  // If this was a fact fallback (user_message like [FACT:key]), mirror into memory_facts
  const m = /^\[FACT:(.+?)\]$/i.exec(String(userMessage || '').trim());
  if (m && m[1]) {
    const key = m[1];
    const expiresAt = metadata && metadata.expiresAt ? new Date(metadata.expiresAt) : null;
    await upsertMemoryFact(chatId, key, String(assistantResponse || ''), expiresAt);
  }
  return true;
}

async function upsertMemoryFact(chatId, key, value, expiresAt) {
  if (!chatId || !key) return false;

  // If a newer fact with the same key exists, replace value & dates; else insert
  await query(
    `
      INSERT INTO memory_facts (chat_id, key, value, expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `,
    [String(chatId), String(key), String(value || ''), expiresAt || null],
    'insertMemoryFact'
  );

  // Optional: If you want "latest wins", you can update existing rows as well:
  await query(
    `
      UPDATE memory_facts
         SET value = $3,
             expires_at = $4,
             created_at = now()
       WHERE chat_id = $1 AND key = $2
    `,
    [String(chatId), String(key), String(value || ''), expiresAt || null],
    'updateMemoryFact'
  );

  return true;
}

// Read latest N messages for a chat
async function getConversationHistoryDB(chatId, limit) {
  const lim = Math.max(1, Math.min(Number(limit || 100), 1000));
  const res = await query(
    `
      SELECT chat_id, user_message, assistant_response, metadata, created_at
      FROM conversations
      WHERE chat_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `,
    [String(chatId), lim],
    'getConversationHistoryDB'
  );

  // Return oldest→newest (better for context building)
  const rows = res.rows || [];
  rows.reverse();
  return rows.map(r => ({
    chatId: r.chat_id,
    userMessage: r.user_message || '',
    assistantResponse: r.assistant_response || '',
    metadata: r.metadata || {},
    timestamp: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
  }));
}

// Read persistent memory (prefer memory_facts, also fall back to facts saved via conversations)
async function getPersistentMemoryDB(chatId, limit) {
  const lim = Math.max(1, Math.min(Number(limit || 200), 1000));

  // 1) memory_facts (primary)
  const primary = await query(
    `
      SELECT key, value, created_at, expires_at
      FROM memory_facts
      WHERE chat_id = $1
        AND (expires_at IS NULL OR expires_at > now())
      ORDER BY created_at DESC
      LIMIT $2
    `,
    [String(chatId), lim],
    'getPersistentMemoryDB.primary'
  );

  const facts = [];
  const seenKeys = new Set();
  for (const r of primary.rows || []) {
    const item = {
      key: r.key,
      value: r.value || '',
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null
    };
    facts.push(item);
    seenKeys.add(String(r.key));
  }

  // 2) conversations fallback where user_message = [FACT:key]
  const fallback = await query(
    `
      SELECT user_message, assistant_response, created_at,
             (metadata->>'expiresAt')::timestamptz AS expires_at
      FROM conversations
      WHERE chat_id = $1
        AND user_message LIKE '[FACT:%]'
      ORDER BY created_at DESC
      LIMIT $2
    `,
    [String(chatId), lim],
    'getPersistentMemoryDB.fallback'
  );

  for (const r of fallback.rows || []) {
    const m = /^\[FACT:(.+?)\]$/i.exec(String(r.user_message || '').trim());
    const key = m && m[1] ? m[1] : null;
    if (!key || seenKeys.has(key)) continue;
    facts.push({
      key,
      value: String(r.assistant_response || ''),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null
    });
    seenKeys.add(key);
  }

  return facts;
}

// Simple health probe
async function healthCheck() {
  try {
    const res = await query('SELECT 1 AS ok', [], 'healthCheck');
    return { ok: true, result: res.rows && res.rows[0] && res.rows[0].ok === 1 };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Orderly shutdown
async function shutdown() {
  try {
    log('Shutting down DB pool…');
    await pool.end();
    log('DB pool closed');
  } catch (e) {
    warn('Pool close error:', e.message);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// HEARTBEAT (optional)

let heartbeatTimer = null;

function startHeartbeat() {
  if (!HEARTBEAT_MS || HEARTBEAT_MS < 5000) return;
  if (heartbeatTimer) return;

  heartbeatTimer = setInterval(async () => {
    try {
      await query('SELECT 1', [], 'heartbeat');
      // log('heartbeat ok'); // keep silent to reduce noise
    } catch (e) {
      warn('heartbeat failed:', e.message);
    }
  }, HEARTBEAT_MS);

  heartbeatTimer.unref?.(); // don’t keep the process alive
}

// ───────────────────────────────────────────────────────────────────────────────
// INIT

(async function init() {
  try {
    log('Connecting to Postgres…');
    await ensureSchema();
    startHeartbeat();
    log('Database ready (pool max=%s, ssl=%s)', poolConfig.max, SSL_ENABLED ? 'on' : 'off');
  } catch (e) {
    err('DB init failed:', e.message);
    // Keep running; callers will fallback to in-memory logic if needed
  }
})();

// ───────────────────────────────────────────────────────────────────────────────
// EXPORTS

module.exports = {
  // core
  query,
  // conversation storage
  saveConversation,
  getConversationHistoryDB,
  // memory
  getPersistentMemoryDB,
  upsertMemoryFact,
  // ops
  healthCheck,
  shutdown
};
