// utils/database.js
// Postgres pool + schema ensure + handy helpers (idempotent)
// Creates/repairs: conversations, ai_memory

"use strict";

const { Pool } = require("pg");

const CONN_STR = process.env.DATABASE_URL;
if (!CONN_STR) {
  console.warn("[db] DATABASE_URL not set — database module will still load, but queries will fail");
}

const pool = new Pool({
  connectionString: CONN_STR,
  // Railway/most managed PG need SSL; disable by setting PGSSL=false
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_MS || 30000),
  connectionTimeoutMillis: Number(process.env.PG_CONN_MS || 10000),
});

async function q(sql, params) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

// Create/repair schema safely (run every boot)
async function ensureSchema() {
  // conversations: what your code expects to INSERT into
  await q(`
    CREATE TABLE IF NOT EXISTS conversations (
      id BIGSERIAL PRIMARY KEY,
      chat_id TEXT NOT NULL,
      user_message TEXT,
      assistant_response TEXT,
      meta JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Add missing columns if table already existed with a different shape
  await safeAlter("conversations", "assistant_response", "TEXT");
  await safeAlter("conversations", "meta", "JSONB", "'{}'::jsonb");
  await safeAlter("conversations", "created_at", "TIMESTAMPTZ", "NOW()");
  await q(`CREATE INDEX IF NOT EXISTS idx_conversations_chat_created ON conversations(chat_id, created_at DESC);`);

  // ai_memory: what your memory layer expects to UPSERT into
  await q(`
    CREATE TABLE IF NOT EXISTS ai_memory (
      chat_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'fact',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NULL,
      PRIMARY KEY (chat_id, key)
    );
  `);

  await safeAlter("ai_memory", "type", "TEXT", "'fact'");
  await safeAlter("ai_memory", "created_at", "TIMESTAMPTZ", "NOW()");
  await safeAlter("ai_memory", "expires_at", "TIMESTAMPTZ");
  await q(`CREATE INDEX IF NOT EXISTS idx_ai_memory_expires ON ai_memory(expires_at) WHERE expires_at IS NOT NULL;`);
}

// Adds a column if it doesn’t exist (idempotent)
async function safeAlter(table, col, type, defaultExpr) {
  const exists = await q(
    `SELECT 1
       FROM information_schema.columns
      WHERE table_name = $1 AND column_name = $2;`,
    [table, col]
  );
  if (exists.rowCount === 0) {
    const def = defaultExpr ? ` DEFAULT ${defaultExpr}` : "";
    const ddl = `ALTER TABLE ${table} ADD COLUMN ${col} ${type}${def};`;
    try {
      await q(ddl);
      console.log(`[db] Added ${table}.${col} (${type})`);
    } catch (e) {
      console.warn(`[db] safeAlter failed (${table}.${col}): ${e.message}`);
    }
  }
}

// Public API
async function initialize() {
  try {
    await ensureSchema();
    console.log("[db] Schema ensured ✔");
  } catch (e) {
    console.error("[db] ensureSchema failed:", e.message);
    // Don’t throw — keep server running; health endpoints will show degraded
  }
}

async function healthCheck() {
  try {
    const r = await q("SELECT NOW() as now;");
    return { ok: true, now: r.rows[0].now };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function close() {
  try {
    await pool.end();
  } catch (e) {
    console.warn("[db] pool.end error:", e.message);
  }
}

// Conversations
async function saveConversation(chatId, userMessage, assistantResponse, meta) {
  try {
    await q(
      `INSERT INTO conversations (chat_id, user_message, assistant_response, meta)
       VALUES ($1,$2,$3,COALESCE($4::jsonb,'{}'::jsonb));`,
      [String(chatId), String(userMessage || ""), String(assistantResponse || ""), JSON.stringify(meta || {})]
    );
  } catch (e) {
    console.error("[db] saveConversation failed:", e.message);
  }
}

async function getConversationHistoryDB(chatId, limit) {
  try {
    const r = await q(
      `SELECT user_message, assistant_response, meta, created_at
         FROM conversations
        WHERE chat_id = $1
        ORDER BY created_at DESC
        LIMIT $2;`,
      [String(chatId), Number(limit || 100)]
    );
    // map to shape dualCommandSystem expects
    return r.rows
      .map((row) => ({
        timestamp: row.created_at,
        userMessage: row.user_message,
        assistantResponse: row.assistant_response,
        metadata: row.meta || {},
      }))
      .reverse(); // oldest → newest
  } catch (e) {
    console.error("[db] getConversationHistoryDB failed:", e.message);
    return [];
  }
}

// Memory
async function saveToMemory(chatId, payload) {
  // payload: { type, key, value, createdAt, expiresAt }
  try {
    const type = payload && payload.type ? String(payload.type) : "fact";
    const createdAt = payload && payload.createdAt ? payload.createdAt : new Date().toISOString();
    const expiresAt = payload && payload.expiresAt ? payload.expiresAt : null;
    await q(
      `INSERT INTO ai_memory (chat_id, key, value, type, created_at, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (chat_id, key)
       DO UPDATE SET value = EXCLUDED.value,
                     type = EXCLUDED.type,
                     created_at = EXCLUDED.created_at,
                     expires_at = EXCLUDED.expires_at;`,
      [String(chatId), String(payload.key), String(payload.value), type, createdAt, expiresAt]
    );
  } catch (e) {
    console.error("[db] saveToMemory failed:", e.message);
  }
}

async function getPersistentMemoryDB(chatId) {
  try {
    // purge expired then return live facts
    await q(`DELETE FROM ai_memory WHERE expires_at IS NOT NULL AND expires_at < NOW();`);
    const r = await q(
      `SELECT key, value, type, created_at, expires_at
         FROM ai_memory
        WHERE chat_id = $1
          AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC
        LIMIT 500;`,
      [String(chatId)]
    );
    return r.rows;
  } catch (e) {
    console.error("[db] getPersistentMemoryDB failed:", e.message);
    return [];
  }
}

module.exports = {
  // lifecycle
  initialize,
  healthCheck,
  close,

  // conversations
  saveConversation,
  getConversationHistoryDB,

  // memory
  saveToMemory,
  getPersistentMemoryDB,
};
