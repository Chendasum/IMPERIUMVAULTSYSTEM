// utils/database.js
// Postgres pool + schema ensure (idempotent) + helpers
// Backward-compatible with ai_memory.{key,value} AND ai_memory.{mem_key,mem_value}

"use strict";

const { Pool } = require("pg");

const CONN_STR = process.env.DATABASE_URL;
if (!CONN_STR) {
  console.warn("[db] DATABASE_URL not set — DB ops will fail; server still boots.");
}

const pool = new Pool({
  connectionString: CONN_STR,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_MS || 30000),
  connectionTimeoutMillis: Number(process.env.PG_CONN_MS || 10000)
});

async function q(sql, params) {
  const c = await pool.connect();
  try { return await c.query(sql, params); }
  finally { c.release(); }
}

// ───────────────────────────────────────────────────────────────────────────────
// SCHEMA ENSURE (idempotent) + LEGACY COMPAT
// ───────────────────────────────────────────────────────────────────────────────

async function ensureSchema() {
  // conversations
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
  await safeAlter("conversations", "assistant_response", "TEXT");
  await safeAlter("conversations", "meta", "JSONB", "'{}'::jsonb");
  await safeAlter("conversations", "created_at", "TIMESTAMPTZ", "NOW()");
  await q(`CREATE INDEX IF NOT EXISTS idx_conversations_chat_created ON conversations(chat_id, created_at DESC);`);

  // ai_memory (new columns)
  await q(`
    CREATE TABLE IF NOT EXISTS ai_memory (
      chat_id TEXT NOT NULL,
      key TEXT,
      value TEXT,
      type TEXT DEFAULT 'fact',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NULL,
      mem_key TEXT,
      mem_value TEXT,
      PRIMARY KEY (chat_id, COALESCE(key, mem_key))
    );
  `);

  // make sure all columns exist even if table was created earlier without them
  await safeAlter("ai_memory", "key", "TEXT");
  await safeAlter("ai_memory", "value", "TEXT");
  await safeAlter("ai_memory", "type", "TEXT", "'fact'");
  await safeAlter("ai_memory", "created_at", "TIMESTAMPTZ", "NOW()");
  await safeAlter("ai_memory", "expires_at", "TIMESTAMPTZ");
  await safeAlter("ai_memory", "mem_key", "TEXT");
  await safeAlter("ai_memory", "mem_value", "TEXT");

  await q(`CREATE INDEX IF NOT EXISTS idx_ai_memory_expires ON ai_memory(expires_at) WHERE expires_at IS NOT NULL;`);

  // backfill legacy/new columns in both directions so either naming works
  await backfillLegacyColumns();
}

async function safeAlter(table, col, type, defaultExpr) {
  const r = await q(
    `SELECT 1 FROM information_schema.columns WHERE table_name=$1 AND column_name=$2;`,
    [table, col]
  );
  if (r.rowCount === 0) {
    const def = defaultExpr ? ` DEFAULT ${defaultExpr}` : "";
    try {
      await q(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}${def};`);
      console.log(`[db] Added ${table}.${col} (${type})`);
    } catch (e) {
      console.warn(`[db] safeAlter failed for ${table}.${col}: ${e.message}`);
    }
  }
}

async function backfillLegacyColumns() {
  // If mem_key/mem_value are NULL but key/value present → copy forward
  await q(`UPDATE ai_memory SET mem_key = key WHERE mem_key IS NULL AND key IS NOT NULL;`);
  await q(`UPDATE ai_memory SET mem_value = value WHERE mem_value IS NULL AND value IS NOT NULL;`);

  // If key/value are NULL but mem_key/mem_value present → copy backward
  await q(`UPDATE ai_memory SET key = mem_key WHERE key IS NULL AND mem_key IS NOT NULL;`);
  await q(`UPDATE ai_memory SET value = mem_value WHERE value IS NULL AND mem_value IS NOT NULL;`);
}

// ───────────────────────────────────────────────────────────────────────────────
// LIFECYCLE / HEALTH
// ───────────────────────────────────────────────────────────────────────────────

async function initialize() {
  try {
    await ensureSchema();
    console.log("[db] Schema ensured ✓");
  } catch (e) {
    console.error("[db] ensureSchema failed:", e.message);
  }
}

async function healthCheck() {
  try {
    const r = await q("SELECT NOW() now;");
    return { ok: true, now: r.rows[0].now };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function shutdown() {
  try { await pool.end(); }
  catch (e) { console.warn("[db] pool.end error:", e.message); }
}

// ───────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS
// ───────────────────────────────────────────────────────────────────────────────

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
        WHERE chat_id=$1
        ORDER BY created_at DESC
        LIMIT $2;`,
      [String(chatId), Number(limit || 100)]
    );
    // shape expected by memory/context builders
    return r.rows
      .map(row => ({
        timestamp: row.created_at,
        userMessage: row.user_message,
        assistantResponse: row.assistant_response,
        metadata: row.meta || {}
      }))
      .reverse(); // oldest → newest
  } catch (e) {
    console.error("[db] getConversationHistoryDB failed:", e.message);
    return [];
  }
}

// ───────────────────────────────────────────────────────────────────────────────
/* MEMORY (backward-compatible)
   - Writes set BOTH (key,value) and (mem_key,mem_value).
   - Reads coalesce in either direction so legacy/new callers work. */
// ───────────────────────────────────────────────────────────────────────────────

async function saveToMemory(chatId, payload) {
  try {
    const k = String(payload.key);
    const v = String(payload.value);
    const t = payload.type ? String(payload.type) : "fact";
    const createdAt = payload.createdAt || new Date().toISOString();
    const expiresAt = payload.expiresAt || null;

    // Upsert writing both pairs to keep them in sync
    await q(
      `INSERT INTO ai_memory (chat_id, key, value, type, created_at, expires_at, mem_key, mem_value)
       VALUES ($1,$2,$3,$4,$5,$6,$2,$3)
       ON CONFLICT (chat_id, COALESCE(key, mem_key))
       DO UPDATE SET
         key       = COALESCE(EXCLUDED.key, EXCLUDED.mem_key),
         mem_key   = COALESCE(EXCLUDED.mem_key, EXCLUDED.key),
         value     = COALESCE(EXCLUDED.value, EXCLUDED.mem_value),
         mem_value = COALESCE(EXCLUDED.mem_value, EXCLUDED.value),
         type      = EXCLUDED.type,
         created_at= EXCLUDED.created_at,
         expires_at= EXCLUDED.expires_at;`,
      [String(chatId), k, v, t, createdAt, expiresAt]
    );
  } catch (e) {
    console.error("[db] saveToMemory failed:", e.message);
  }
}

async function getPersistentMemoryDB(chatId) {
  try {
    await q(`DELETE FROM ai_memory WHERE expires_at IS NOT NULL AND expires_at < NOW();`);
    const r = await q(
      `SELECT
         COALESCE(key, mem_key)  AS key,
         COALESCE(value, mem_value) AS value,
         type, created_at, expires_at
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
  shutdown,

  // conversations
  saveConversation,
  getConversationHistoryDB,

  // memory
  saveToMemory,
  getPersistentMemoryDB
};
