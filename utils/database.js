// utils/database.js
// IMPERIUM VAULT — PostgreSQL driver (Pool-based)
// Safe defaults, schema auto-heal, and tiny helpers for conversations + memory.
// Exports:
//   initialize(), health(), healthCheck(), close()
//   saveConversation(chatId, userMsg, assistantMsg, meta)
//   getConversationHistoryDB(chatId, limit)
//   upsertMemoryFact(chatId, key, value, { expiresAt })
//   getPersistentMemoryDB(chatId, limit)
//   getMemoryFacts(chatId, { includeExpired })
//   deleteMemoryFact(chatId, key)
//   pruneExpiredFacts()
//   query(text, params)

"use strict";

require("dotenv").config();
const { Pool } = require("pg");

// ───────────────────────────────────────────────────────────────────────────────
// Pool configuration (DATABASE_URL preferred; Railway-friendly SSL)
// ───────────────────────────────────────────────────────────────────────────────
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.PG_URL ||
  null;

const inferredSSL =
  process.env.PGSSLMODE === "disable"
    ? false
    : { rejectUnauthorized: false };

const pool =
  connectionString
    ? new Pool({ connectionString, ssl: inferredSSL })
    : new Pool({
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "",
        database: process.env.PGDATABASE || "postgres",
        ssl: inferredSSL,
      });

pool.on("error", (err) => {
  console.error("[db] Pool error:", err && err.message ? err.message : err);
});

// ───────────────────────────────────────────────────────────────────────────────
// Low-level query helper
// ───────────────────────────────────────────────────────────────────────────────
async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params || []);
  } finally {
    client.release();
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Schema management (idempotent, “auto-heal”)
// ───────────────────────────────────────────────────────────────────────────────
async function ensureSchema() {
  // 1) Base tables
  await query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id                BIGSERIAL PRIMARY KEY,
      chat_id           TEXT NOT NULL,
      user_message      TEXT,
      assistant_response TEXT,
      meta              JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS memory_facts (
      id          BIGSERIAL PRIMARY KEY,
      chat_id     TEXT NOT NULL,
      key         TEXT NOT NULL,
      value       TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at  TIMESTAMPTZ NULL,
      UNIQUE (chat_id, key)
    );
  `);

  // 2) “Auto-heal” missing columns (handles your previous error)
  await query(`ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();`);
  await query(`ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'::jsonb;`);

  await query(`ALTER TABLE memory_facts
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();`);
  await query(`ALTER TABLE memory_facts
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();`);
  await query(`ALTER TABLE memory_facts
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL;`);

  // 3) Indices
  await query(`CREATE INDEX IF NOT EXISTS idx_conversations_chat_created
               ON conversations (chat_id, created_at DESC);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_memory_facts_chat
               ON memory_facts (chat_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_memory_facts_expiry
               ON memory_facts (expires_at);`);
}

// ───────────────────────────────────────────────────────────────────────────────
// Initialization + health
// ───────────────────────────────────────────────────────────────────────────────
async function initialize() {
  const tries = 3;
  for (let i = 1; i <= tries; i++) {
    try {
      console.log(`[db] ensureSchema attempt ${i}/${tries}…`);
      await ensureSchema();
      console.log("[db] Schema ready");
      // First opportunistic prune (non-fatal if fails)
      try { await pruneExpiredFacts(); } catch (_e) {}
      return;
    } catch (err) {
      console.warn(`[db] ensureSchema failed (attempt ${i}/${tries}): ${err.message}`);
      if (i === tries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

async function health() {
  try {
    const r = await query("SELECT 1 as ok");
    const ok = r && r.rows && r.rows[0] && r.rows[0].ok === 1;
    return {
      ok: !!ok,
      details: {
        poolTotal: pool.totalCount,
        poolIdle: pool.idleCount,
        poolWaiting: pool.waitingCount,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    return {
      ok: false,
      error: e.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Alias for index.js expectation
async function healthCheck() {
  return health();
}

// ───────────────────────────────────────────────────────────────────────────────
// Conversations (used by dualCommandSystem + emergency save)
// ───────────────────────────────────────────────────────────────────────────────
async function saveConversation(chatId, userMessage, assistantResponse, meta) {
  try {
    const payload = meta && typeof meta === "object" ? meta : {};
    await query(
      `INSERT INTO conversations (chat_id, user_message, assistant_response, meta)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [String(chatId), String(userMessage || ""), String(assistantResponse || ""), JSON.stringify(payload)]
    );
    return { ok: true };
  } catch (e) {
    console.warn("[db] saveConversation failed:", e.message);
    return { ok: false, error: e.message };
  }
}

async function getConversationHistoryDB(chatId, limit) {
  const lim = Math.max(1, Math.min(Number(limit || 100), 1000));
  try {
    const r = await query(
      `SELECT id, chat_id, user_message, assistant_response, meta, created_at
         FROM conversations
        WHERE chat_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
      [String(chatId), lim]
    );
    return r.rows || [];
  } catch (e) {
    console.warn("[db] getConversationHistoryDB failed:", e.message);
    return [];
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Memory Facts (TTL, upsert, fetch) — used by memory.js + Part 6 helpers
// ───────────────────────────────────────────────────────────────────────────────
async function upsertMemoryFact(chatId, key, value, options) {
  const expiresAt =
    options && options.expiresAt
      ? new Date(options.expiresAt)
      : null;

  try {
    await query(
      `INSERT INTO memory_facts (chat_id, key, value, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (chat_id, key)
       DO UPDATE SET value = EXCLUDED.value,
                     expires_at = EXCLUDED.expires_at,
                     updated_at = NOW()`,
      [String(chatId), String(key), String(value), expiresAt]
    );
    return { ok: true };
  } catch (e) {
    console.warn("[db] upsertMemoryFact failed:", e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * Return only non-expired facts by default.
 * @param {string} chatId
 * @param {object} opts { includeExpired?: boolean, limit?: number }
 */
async function getMemoryFacts(chatId, opts) {
  const includeExpired = !!(opts && opts.includeExpired);
  const lim = Math.max(1, Math.min(Number((opts && opts.limit) || 500), 2000));

  try {
    const r = includeExpired
      ? await query(
          `SELECT chat_id, key, value, created_at, updated_at, expires_at
             FROM memory_facts
            WHERE chat_id = $1
            ORDER BY updated_at DESC
            LIMIT $2`,
          [String(chatId), lim]
        )
      : await query(
          `SELECT chat_id, key, value, created_at, updated_at, expires_at
             FROM memory_facts
            WHERE chat_id = $1
              AND (expires_at IS NULL OR expires_at > NOW())
            ORDER BY updated_at DESC
            LIMIT $2`,
          [String(chatId), lim]
        );

    return r.rows || [];
  } catch (e) {
    console.warn("[db] getMemoryFacts failed:", e.message);
    return [];
  }
}

// Backward-compat name used elsewhere in your code
async function getPersistentMemoryDB(chatId, limit) {
  return getMemoryFacts(chatId, { limit: limit || 500, includeExpired: false });
}

// Convenience wrapper used by your Part 6 memory helpers (if memory module absent)
async function saveToMemory(chatId, fact) {
  // fact: { type: 'fact', key, value, createdAt, expiresAt }
  if (!fact || !fact.key) {
    return { ok: false, error: "invalid fact" };
  }
  return upsertMemoryFact(chatId, fact.key, fact.value, {
    expiresAt: fact.expiresAt || null,
  });
}

async function deleteMemoryFact(chatId, key) {
  try {
    const r = await query(
      `DELETE FROM memory_facts WHERE chat_id = $1 AND key = $2`,
      [String(chatId), String(key)]
    );
    return { ok: true, deleted: r.rowCount || 0 };
  } catch (e) {
    console.warn("[db] deleteMemoryFact failed:", e.message);
    return { ok: false, error: e.message };
  }
}

async function pruneExpiredFacts() {
  try {
    const r = await query(
      `DELETE FROM memory_facts WHERE expires_at IS NOT NULL AND expires_at <= NOW()`
    );
    if (r && typeof r.rowCount === "number" && r.rowCount > 0) {
      console.log(`[db] Pruned ${r.rowCount} expired memory facts`);
    }
    return { ok: true, pruned: r.rowCount || 0 };
  } catch (e) {
    console.warn("[db] pruneExpiredFacts failed:", e.message);
    return { ok: false, error: e.message };
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Graceful close
// ───────────────────────────────────────────────────────────────────────────────
async function close() {
  try {
    await pool.end();
    console.log("[db] Pool closed");
  } catch (e) {
    console.warn("[db] Pool close failed:", e.message);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Optional: hourly auto-prune (silent if it fails)
// ───────────────────────────────────────────────────────────────────────────────
setInterval(() => {
  pruneExpiredFacts().catch(() => {});
}, 60 * 60 * 1000);

// ───────────────────────────────────────────────────────────────────────────────
// Exports
// ───────────────────────────────────────────────────────────────────────────────
module.exports = {
  // lifecycle
  initialize,
  health,
  healthCheck, // alias expected by index.js
  close,

  // low-level
  query,

  // conversations
  saveConversation,
  getConversationHistoryDB,

  // memory
  saveToMemory,
  upsertMemoryFact,
  getMemoryFacts,
  getPersistentMemoryDB,
  deleteMemoryFact,
  pruneExpiredFacts,
};
