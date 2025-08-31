// utils/database.js
// IMPERIUM VAULT — Defensive Postgres wrapper + auto-migrations
// Exposes: initialize, shutdown, query, saveConversation, getConversationHistoryDB
//          upsertMemoryFact (optional), ensureSchemaAll

'use strict';
require('dotenv').config();

const SLEEP = (ms) => new Promise(r => setTimeout(r, ms));

let Pool, pool;
try {
  ({ Pool } = require('pg'));
} catch (e) {
  console.warn('[db] pg not installed; database features disabled');
}

/*──────────────────────────────────────────────────────────────────────────────*/

function getPool() {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) {
    console.warn('[db] No DATABASE_URL; running in memory-only mode');
    return null;
  }
  if (!Pool) return null;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    max: Number(process.env.PG_POOL_MAX || 5),
    idleTimeoutMillis: 30000
  });
  return pool;
}

async function query(sql, params) {
  const p = getPool();
  if (!p) throw new Error('No database pool');
  const client = await p.connect();
  try {
    return await client.query(sql, params || []);
  } finally {
    client.release();
  }
}

/*──────────────────────────────────────────────────────────────────────────────*
 *                             MIGRATION HELPERS
 *──────────────────────────────────────────────────────────────────────────────*/

async function ensureTable(name, createSQL) {
  await query(createSQL);
  // small delay helps on some managed PGs where DDL visibility lags
}

async function addColumnIfMissing(table, addSQL) {
  try {
    await query(addSQL);
  } catch (e) {
    if (!/already exists/i.test(e.message)) throw e;
  }
}

async function tryRenameColumn(table, from, to) {
  try {
    await query(`ALTER TABLE ${table} RENAME COLUMN "${from}" TO ${to}`);
  } catch (e) {
    // ignore if it doesn't exist
    if (!/does not exist/i.test(e.message)) throw e;
  }
}

async function createIndexSafe(sql) {
  try {
    await query(sql);
  } catch (e) {
    // skip unique/partial index if existing data conflicts
    console.warn('[db] index creation skipped:', e.message);
  }
}

async function tableHasColumn(table, column) {
  const r = await query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return r.rowCount > 0;
}

/*──────────────────────────────────────────────────────────────────────────────*
 *                                SCHEMA
 *──────────────────────────────────────────────────────────────────────────────*/

async function ensureSchemaMemory() {
  // 1) Base table (old installs may lack created_at/expires_at)
  await ensureTable(
    'ai_memory',
    `CREATE TABLE IF NOT EXISTS ai_memory (
       id BIGSERIAL PRIMARY KEY,
       chat_id TEXT NOT NULL,
       type TEXT NOT NULL,
       mem_key TEXT NOT NULL,
       mem_value TEXT NOT NULL
     )`
  );

  // 2) Column migrations (camelCase → snake_case, add if missing)
  await tryRenameColumn('ai_memory', 'createdAt', 'created_at');
  await tryRenameColumn('ai_memory', 'expiresAt', 'expires_at');

  await addColumnIfMissing('ai_memory',
    `ALTER TABLE ai_memory ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  );
  await addColumnIfMissing('ai_memory',
    `ALTER TABLE ai_memory ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL`
  );

  // 3) Indexes
  await createIndexSafe(`CREATE INDEX IF NOT EXISTS ai_memory_chat_idx ON ai_memory(chat_id)`);
  await createIndexSafe(`CREATE INDEX IF NOT EXISTS ai_memory_key_idx ON ai_memory(mem_key)`);

  // Partial unique index (one live row per (chat, key)); will skip if duplicates exist
  await createIndexSafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS ai_memory_unique_latest
       ON ai_memory(chat_id, mem_key) WHERE expires_at IS NULL`
  );
}

async function ensureSchemaConversations() {
  // 1) Base table
  await ensureTable(
    'conversations',
    `CREATE TABLE IF NOT EXISTS conversations (
       id BIGSERIAL PRIMARY KEY,
       chat_id TEXT NOT NULL,
       user_message TEXT,
       ai_response TEXT,
       meta JSONB
     )`
  );

  // 2) Column migrations (camelCase → snake_case)
  await tryRenameColumn('conversations', 'createdAt', 'created_at');

  // 3) Add created_at if missing
  await addColumnIfMissing('conversations',
    `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  );

  // 4) Indexes
  await createIndexSafe(`CREATE INDEX IF NOT EXISTS conv_chat_idx ON conversations(chat_id)`);
  await createIndexSafe(`CREATE INDEX IF NOT EXISTS conv_created_idx ON conversations(created_at)`);
}

async function ensureSchemaAll() {
  await ensureSchemaMemory();
  await ensureSchemaConversations();
}

/*──────────────────────────────────────────────────────────────────────────────*
 *                                LIFECYCLE
 *──────────────────────────────────────────────────────────────────────────────*/

async function initialize() {
  const p = getPool();
  if (!p) {
    console.warn('[db] initialize: no pool (memory-only mode)');
    return { backend: 'none' };
  }
  let lastErr = null;
  for (let i = 1; i <= 3; i++) {
    try {
      await ensureSchemaAll();
      console.log('[db] schema ready');
      return { backend: 'postgres' };
    } catch (e) {
      lastErr = e;
      console.warn(`[db] ensureSchema failed (attempt ${i}/3): ${e.message}`);
      await SLEEP(400 * i);
    }
  }
  console.error('[db] DB init failed:', lastErr && lastErr.message);
  throw lastErr;
}

async function shutdown() {
  if (pool) {
    try { await pool.end(); } catch (e) { /* ignore */ }
  }
}

/*──────────────────────────────────────────────────────────────────────────────*
 *                                   API
 *──────────────────────────────────────────────────────────────────────────────*/

async function saveConversation(chatId, userMessage, aiResponse, meta) {
  // If no DB, just pretend success so the app keeps running
  if (!getPool()) return false;
  const m = meta ? JSON.stringify(meta) : null;
  await query(
    `INSERT INTO conversations (chat_id, user_message, ai_response, meta)
     VALUES ($1, $2, $3, COALESCE($4::jsonb, '{}'::jsonb))`,
    [String(chatId), String(userMessage || ''), String(aiResponse || ''), m]
  );
  return true;
}

async function getConversationHistoryDB(chatId, limit) {
  if (!getPool()) return [];
  const lim = Math.max(1, Math.min(Number(limit || 50), 200));
  const r = await query(
    `SELECT user_message, ai_response, created_at
       FROM conversations
      WHERE chat_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
    [String(chatId), lim]
  );
  return r.rows.map(row => ({
    timestamp: row.created_at,
    userMessage: row.user_message || '',
    aiResponse: row.ai_response || ''
  }));
}

// Optional: some callers log facts via database when memory module is absent
async function upsertMemoryFact(chatId, key, value, expiresAtIso) {
  if (!getPool()) return false;

  // Ensure columns exist (defensive if called before initialize)
  const hasCreated = await tableHasColumn('ai_memory', 'created_at').catch(() => false);
  if (!hasCreated) await ensureSchemaMemory();

  // Use an UPSERT keyed by (chat_id, mem_key) when expires_at IS NULL
  // To keep it simple and portable, we store only one live row per key and
  // treat "expiresAtIso" as the new expiry.
  try {
    await query(
      `INSERT INTO ai_memory (chat_id, type, mem_key, mem_value, created_at, expires_at)
       VALUES ($1, 'fact', $2, $3, NOW(), $4)
       ON CONFLICT (chat_id, mem_key) WHERE ai_memory.expires_at IS NULL
       DO UPDATE SET mem_value = EXCLUDED.mem_value,
                     created_at = NOW(),
                     expires_at = EXCLUDED.expires_at`,
      [String(chatId), String(key), String(value), expiresAtIso || null]
    );
    return true;
  } catch (e) {
    // If partial index conflict rules differ in older DBs, fallback to two-step
    console.warn('[db] upsertMemoryFact UPSERT fallback:', e.message);
    await query(
      `DELETE FROM ai_memory WHERE chat_id = $1 AND mem_key = $2 AND (expires_at IS NULL OR expires_at > NOW())`,
      [String(chatId), String(key)]
    );
    await query(
      `INSERT INTO ai_memory (chat_id, type, mem_key, mem_value, created_at, expires_at)
       VALUES ($1, 'fact', $2, $3, NOW(), $4)`,
      [String(chatId), String(key), String(value), expiresAtIso || null]
    );
    return true;
  }
}

// utils/database.js

async function health() {
  // … your existing health logic (e.g., run SELECT 1, check tables, etc.)
  return { ok: true, details: { ping: 'ok' } };
}

// 👇 Add this alias so index.js can call healthCheck()
async function healthCheck() {
  return health();
}

module.exports = {
  // … your other exports
  initialize,
  saveConversation,
  getConversationHistoryDB,
  upsertMemoryFact,
  health,
  healthCheck, // 👈 make sure this is exported
};

/*──────────────────────────────────────────────────────────────────────────────*/

module.exports = {
  // lifecycle
  initialize,
  shutdown,
  // sql
  query,
  // app helpers
  saveConversation,
  getConversationHistoryDB,
  upsertMemoryFact,
  // migrations (optional external use)
  ensureSchemaAll
};
