// utils/memory.js
// IMPERIUM VAULT — Memory layer (TTL, chitchat-aware, Postgres + in-memory fallback)
// Exposes: saveToMemory, getPersistentMemory, buildConversationContext, getMemoryStats,
//          deleteMemoryKey, resetUserMemory, pruneExpiredMemory, healthCheck, initialize, shutdown

'use strict';
require('dotenv').config();

const os = require('os');
const crypto = require('crypto');

// ───────────────────────────────────────────────────────────────────────────────
// TTL presets (ms)
const TTL = {
  FACT: 7 * 24 * 60 * 60 * 1000,              // 7 days
  LAST_COMPLETION: 14 * 24 * 60 * 60 * 1000,   // 14 days
  LAST_TOPIC: 48 * 60 * 60 * 1000,             // 48 hours
  DEFAULT: 7 * 24 * 60 * 60 * 1000
};

// ───────────────────────────────────────────────────────────────────────────────
// Helpers

function nowIso() { return new Date().toISOString(); }
function toIso(ts) { return ts ? new Date(ts).toISOString() : null; }

function isGreetingOnly(s) {
  if (!s) return false;
  const raw = String(s).trim();
  const lower = raw.toLowerCase();
  const isGreet =
    /^(hi|hello|hey|yo|sup|gm|good\s+(morning|afternoon|evening)|how\s+are\s+you)\b/.test(lower) &&
    raw.split(/\s+/).length <= 6;
  return isGreet;
}

function normalizeAssistantText(text) {
  if (!text) return '';
  return String(text)
    .replace(/^(Assistant:|AI:|GPT-?5?:)\s*/i, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 8000);
}

// ───────────────────────────────────────────────────────────────────────────────
// Storage backends: Postgres (preferred) → in-memory fallback

let pgPool = null;
let database = null;
let usingDatabaseModule = false;

// Try to reuse your database wrapper first (recommended)
try {
  database = require('./database');
  // must expose either query(sql, params) OR pool with pool.query
  if (database && typeof database.query === 'function') {
    usingDatabaseModule = true;
    console.log('🧠 memory.js: using ./utils/database.query for persistence');
  } else if (database && database.pool && typeof database.pool.query === 'function') {
    usingDatabaseModule = true;
    console.log('🧠 memory.js: using ./utils/database.pool for persistence');
  } else {
    database = null;
  }
} catch (_) {
  // ignore
}

// If no database module, connect to Postgres directly (DATABASE_URL)
if (!usingDatabaseModule && process.env.DATABASE_URL) {
  try {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX || 5),
      idleTimeoutMillis: 30000
    });
    console.log('🧠 memory.js: connected to Postgres via pg Pool');
  } catch (e) {
    console.warn('🧠 memory.js: Postgres client not available:', e.message);
  }
} else if (!usingDatabaseModule) {
  console.warn('🧠 memory.js: no database module and no DATABASE_URL, using in-memory store only');
}

// In-memory fallback store
const memStore = new Map(); // key: chatId -> { items: [], lastGc: ts }

// ───────────────────────────────────────────────────────────────────────────────
// SQL helpers (if Postgres available)

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS ai_memory (
  id BIGSERIAL PRIMARY KEY,
  chat_id TEXT NOT NULL,
  type TEXT NOT NULL,           -- e.g., 'fact'
  mem_key TEXT NOT NULL,        -- logical key ('last_topic', 'next_action', etc)
  mem_value TEXT NOT NULL,      -- payload string
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS ai_memory_chat_idx ON ai_memory(chat_id);
CREATE UNIQUE INDEX IF NOT EXISTS ai_memory_unique_latest
  ON ai_memory(chat_id, mem_key)
  WHERE expires_at IS NULL; -- one live row per (chat, key)
`;

const UPSERT_SQL = `
INSERT INTO ai_memory (chat_id, type, mem_key, mem_value, created_at, expires_at)
VALUES ($1, $2, $3, $4, NOW(), $5)
ON CONFLICT (chat_id, mem_key) WHERE ai_memory.expires_at IS NULL
DO UPDATE SET mem_value = EXCLUDED.mem_value, created_at = NOW(), expires_at = EXCLUDED.expires_at
RETURNING id
`;

const SELECT_LIVE_SQL = `
SELECT type, mem_key, mem_value, created_at, expires_at
FROM ai_memory
WHERE chat_id = $1
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY created_at DESC
LIMIT $2
`;

const DELETE_KEY_SQL = `
DELETE FROM ai_memory
WHERE chat_id = $1
  AND mem_key = $2
`;

const DELETE_ALL_SQL = `
DELETE FROM ai_memory
WHERE chat_id = $1
`;

const PRUNE_SQL = `
DELETE FROM ai_memory
WHERE expires_at IS NOT NULL
  AND expires_at <= NOW()
`;

// ───────────────────────────────────────────────────────────────────────────────
// Low-level DB query wrapper

async function dbQuery(sql, params) {
  if (usingDatabaseModule) {
    const runner = database.query
      ? database.query.bind(database)
      : database.pool.query.bind(database.pool);
    return runner(sql, params);
  }
  if (pgPool) return pgPool.query(sql, params);
  throw new Error('No database backend available');
}

// ───────────────────────────────────────────────────────────────────────────────
// Schema / lifecycle

async function ensureSchema() {
  try {
    await dbQuery(SCHEMA_SQL);
    return true;
  } catch (e) {
    console.warn('memory.js: ensureSchema failed →', e.message);
    return false;
  }
}

async function initialize() {
  if (pgPool || usingDatabaseModule) {
    await ensureSchema();
  }
  // periodic prune
  const every = Number(process.env.MEMORY_PRUNE_EVERY_MS || 10 * 60 * 1000);
  setInterval(() => pruneExpiredMemory().catch(() => {}), every);
  console.log('🧠 memory.js initialized (prune every ' + Math.round(every/1000) + 's)');
}

async function shutdown() {
  try {
    if (pgPool) await pgPool.end();
  } catch (e) {
    console.warn('memory.js: shutdown warning →', e.message);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Public API

/**
 * saveToMemory(chatId, entry)
 * entry: { type, key, value, createdAt?, expiresAt? }  (strings)
 */
async function saveToMemory(chatId, entry) {
  if (!chatId || !entry || !entry.type || !entry.key) return false;

  // avoid saving trivial greetings as topics
  if (entry.key === 'last_topic' && isGreetingOnly(entry.value)) {
    return true; // silent skip
  }

  const value = String(entry.value || '').slice(0, 8000);
  const expiresAt = entry.expiresAt ? new Date(entry.expiresAt) : null;

  // Try DB first
  try {
    if (pgPool || usingDatabaseModule) {
      await dbQuery(UPSERT_SQL, [
        String(chatId),
        String(entry.type),
        String(entry.key),
        value,
        expiresAt ? toIso(expiresAt) : null
      ]);
      return true;
    }
  } catch (e) {
    console.warn('memory.saveToMemory DB upsert failed →', e.message);
  }

  // In-memory fallback
  const bucket = memStore.get(chatId) || { items: [], lastGc: Date.now() };
  // Drop existing live key
  bucket.items = bucket.items.filter(i => !(i.mem_key === entry.key));
  bucket.items.push({
    type: String(entry.type),
    mem_key: String(entry.key),
    mem_value: value,
    created_at: nowIso(),
    expires_at: expiresAt ? toIso(expiresAt) : null
  });
  memStore.set(chatId, bucket);
  return true;
}

/**
 * getPersistentMemory(chatId, limit = 100)
 * returns [{ type, key, value, createdAt, expiresAt }]
 */
async function getPersistentMemory(chatId, limit) {
  const lim = Math.max(1, Math.min(Number(limit || 100), 500));

  // DB path
  if (pgPool || usingDatabaseModule) {
    try {
      const r = await dbQuery(SELECT_LIVE_SQL, [String(chatId), lim]);
      return r.rows.map(row => ({
        type: row.type,
        key: row.mem_key,
        value: row.mem_value,
        createdAt: row.created_at,
        expiresAt: row.expires_at
      }));
    } catch (e) {
      console.warn('memory.getPersistentMemory DB failed →', e.message);
    }
  }

  // memory fallback
  const bucket = memStore.get(chatId);
  if (!bucket) return [];
  const now = Date.now();
  return bucket.items
    .filter(i => !i.expires_at || new Date(i.expires_at).getTime() > now)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, lim)
    .map(i => ({
      type: i.type,
      key: i.mem_key,
      value: i.mem_value,
      createdAt: i.created_at,
      expiresAt: i.expires_at
    }));
}

/**
 * buildConversationContext(chatId, opts?)
 * Combines short system preamble + persistent facts + (optional) recent conversation
 * opts: { includeConversation: true, conversationLimit: 12, preamble?: string }
 * Returns: { context, memoryData }
 */
async function buildConversationContext(chatId, opts) {
  opts = opts || {};
  const includeConv = !!opts.includeConversation;
  const limitConv = Math.max(1, Math.min(Number(opts.conversationLimit || 12), 50));

  // 1) Gather memory
  const facts = await getPersistentMemory(chatId, 200);

  // filter boring chitchat topic
  const filteredFacts = facts.filter(f => !(f.key === 'last_topic' && String(f.value).toLowerCase() === 'chitchat'));

  // 2) Optional conversation (from database.js if available)
  let convo = [];
  try {
    if (database && typeof database.getConversationHistoryDB === 'function' && includeConv) {
      convo = await database.getConversationHistoryDB(chatId, limitConv);
    }
  } catch (e) {
    // ignore
  }

  // 3) Build text
  const sys = (opts.preamble || 'SYSTEM: Use these brief memories to stay consistent; do not invent facts.').trim();
  const memBlock = filteredFacts.length
    ? 'MEMORY:\n' + filteredFacts.map(m => `- [${m.key}] ${String(m.value).slice(0, 500)}`).join('\n')
    : 'MEMORY: (none)\n';

  const convBlock = includeConv && convo && convo.length
    ? 'RECENT CONVERSATION:\n' + convo.slice(-limitConv).map(
        (r, idx) => `${idx + 1}. USER: ${String(r.userMessage || '').slice(0, 400)}\n   ASSISTANT: ${normalizeAssistantText(r.aiResponse || '').slice(0, 600)}`
      ).join('\n')
    : '';

  const context = [sys, memBlock, convBlock].filter(Boolean).join('\n\n');

  return {
    context,
    memoryData: {
      persistentMemory: filteredFacts,
      conversationHistory: convo || []
    }
  };
}

/**
 * deleteMemoryKey(chatId, key)
 */
async function deleteMemoryKey(chatId, key) {
  if (!chatId || !key) return false;

  // DB path
  if (pgPool || usingDatabaseModule) {
    try {
      await dbQuery(DELETE_KEY_SQL, [String(chatId), String(key)]);
      return true;
    } catch (e) {
      console.warn('memory.deleteMemoryKey DB failed →', e.message);
    }
  }

  // Memory fallback
  const bucket = memStore.get(chatId);
  if (!bucket) return true;
  bucket.items = bucket.items.filter(i => i.mem_key !== key);
  memStore.set(chatId, bucket);
  return true;
}

/**
 * resetUserMemory(chatId, scope = 'facts'|'all')
 */
async function resetUserMemory(chatId, scope) {
  const mode = (scope || 'facts').toLowerCase();

  // DB path
  if (pgPool || usingDatabaseModule) {
    try {
      if (mode === 'all') {
        await dbQuery(DELETE_ALL_SQL, [String(chatId)]);
      } else {
        // For now, facts are the only records; same as ALL
        await dbQuery(DELETE_ALL_SQL, [String(chatId)]);
      }
      return true;
    } catch (e) {
      console.warn('memory.resetUserMemory DB failed →', e.message);
    }
  }

  // Memory fallback
  memStore.delete(chatId);
  return true;
}

/**
 * pruneExpiredMemory()
 */
async function pruneExpiredMemory() {
  // DB path
  if (pgPool || usingDatabaseModule) {
    try {
      await dbQuery(PRUNE_SQL);
    } catch (e) {
      console.warn('memory.pruneExpiredMemory DB failed →', e.message);
    }
  }

  // Memory fallback
  const now = Date.now();
  for (const [chatId, bucket] of memStore.entries()) {
    bucket.items = bucket.items.filter(i => !i.expires_at || new Date(i.expires_at).getTime() > now);
    memStore.set(chatId, bucket);
  }
  return true;
}

/**
 * getMemoryStats(chatId?)
 */
async function getMemoryStats(chatId) {
  let total = 0, userCount = 0;
  // DB path quick stats
  if (pgPool || usingDatabaseModule) {
    try {
      const r = await dbQuery(`SELECT COUNT(*)::int AS c FROM ai_memory WHERE expires_at IS NULL OR expires_at > NOW()`);
      total = (r.rows && r.rows[0] && r.rows[0].c) || 0;
    } catch (_) {}
  } else {
    total = Array.from(memStore.values()).reduce((acc, b) => acc + (b.items ? b.items.length : 0), 0);
    userCount = memStore.size;
  }

  const perUser = chatId ? (await getPersistentMemory(chatId, 200)).length : undefined;
  return {
    backend: (pgPool || usingDatabaseModule) ? 'postgres' : 'memory',
    totalActive: total,
    usersInMemory: userCount || undefined,
    forChat: chatId ? perUser : undefined,
    host: os.hostname()
  };
}

/**
 * healthCheck()
 */
async function healthCheck() {
  const backend = (pgPool || usingDatabaseModule) ? 'postgres' : 'memory';
  if (backend === 'memory') {
    return { ok: true, backend, note: 'in-memory only' };
  }
  try {
    await ensureSchema();
    const r = await dbQuery(`SELECT NOW() as ts`);
    return { ok: !!(r && r.rows && r.rows.length), backend };
  } catch (e) {
    return { ok: false, backend, error: e.message };
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Convenience helpers used by dualCommandSystem

async function rememberLastTopic(chatId, userMessage) {
  const raw = String(userMessage || '').trim();
  const topic = isGreetingOnly(raw) ? 'chitchat'
    : (raw.length < 30 ? raw : raw.slice(0, 60));
  return saveToMemory(chatId, {
    type: 'fact',
    key: 'last_topic',
    value: topic,
    expiresAt: new Date(Date.now() + TTL.LAST_TOPIC).toISOString()
  });
}

async function rememberNextAction(chatId, assistantResponse) {
  const match = String(assistantResponse || '').match(
    /(?:^|\n)\s*(?:next\s*steps?|todo|action(?:s)?)[^\n]*$/im
  );
  if (!match) return false;
  return saveToMemory(chatId, {
    type: 'fact',
    key: 'next_action',
    value: match[0].slice(0, 200),
    expiresAt: new Date(Date.now() + TTL.FACT).toISOString()
  });
}

// ───────────────────────────────────────────────────────────────────────────────
// Exports

module.exports = {
  // Core
  saveToMemory,
  getPersistentMemory,
  buildConversationContext,
  deleteMemoryKey,
  resetUserMemory,
  pruneExpiredMemory,
  getMemoryStats,
  healthCheck,
  // Convenience
  rememberLastTopic,
  rememberNextAction,
  // Lifecycle
  initialize,
  shutdown,
  // TTL constants (optional external use)
  TTL
};

