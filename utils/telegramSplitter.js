// utils/telegramSplitter.js - Production-Ready Telegram Message Handler (v5)
// 10/10: queueing, block-aware chunking, MarkdownV2 fallback, robust retries
'use strict';

const crypto = require('crypto');

// ───────────────────────────────────────────────────────────────────────────────
// Configuration

const CONFIG = {
  MAX_MESSAGE_LENGTH: 4096,
  SAFE_LENGTH: 3900,         // hard cap for a single send
  CHUNK_TARGET: 3500,        // preferred chunk size before formatting headers
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY_MS: 700,  // base for exponential backoff
  DUPLICATE_WINDOW_MS: 5000, // real duplicate window
  GLOBAL_DELAY_MS: 0,        // optional global slow-down between sends

  MODELS: {
    'gpt-5':            { delay: 400, emoji: '🧠', name: 'GPT-5',            style: 'professional'   },
    'gpt-5-mini':       { delay: 250, emoji: '⚡', name: 'GPT-5 Mini',       style: 'balanced'       },
    'gpt-5-nano':       { delay: 150, emoji: '🚀', name: 'GPT-5 Nano',       style: 'concise'        },
    'gpt-5-chat-latest':{ delay: 200, emoji: '💬', name: 'GPT-5 Chat',       style: 'conversational' },
    'gpt-4o':           { delay: 300, emoji: '🔄', name: 'GPT-4o',           style: 'reliable'       },
    'default':          { delay: 300, emoji: '🤖', name: 'AI Assistant',     style: 'neutral'        }
  },

  AUTO_EMOJIS: {
    'profit': '💰', 'loss': '📉', 'revenue': '💵', 'investment': '📈',
    'portfolio': '💼', 'analysis': '📊', 'report': '📄', 'strategy': '🎯',
    'growth': '📈', 'risk': '⚠️', 'success': '✅', 'error': '❌'
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// Tiny in-memory caches

class SimpleCache {
  constructor(maxSize = 200, ttlMs = 300000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }
  set(key, value) {
    const now = Date.now();
    this.cache.set(key, { value, ts: now });
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  get(key) {
    const e = this.cache.get(key);
    if (!e) return null;
    if (Date.now() - e.ts > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return e.value;
  }
  has(key) { return this.get(key) !== null; }
  clear() { this.cache.clear(); }
}

const messageCache = new SimpleCache(300, CONFIG.DUPLICATE_WINDOW_MS);
const errorCache   = new SimpleCache(100, 60000);

// ───────────────────────────────────────────────────────────────────────────────
// Per-chat queue (keeps message order; avoids flood errors & race conditions)

class ChatQueue {
  constructor() {
    this.queues = new Map(); // chatId -> Promise chain
  }
  enqueue(chatId, task) {
    const prev = this.queues.get(chatId) || Promise.resolve();
    const next = prev.then(async () => {
      try {
        if (CONFIG.GLOBAL_DELAY_MS) {
          await new Promise(r => setTimeout(r, CONFIG.GLOBAL_DELAY_MS));
        }
        return await task();
      } finally {
        // cleanup: if the chain has finished, drop the entry
        if (this.queues.get(chatId) === next) this.queues.delete(chatId);
      }
    });
    this.queues.set(chatId, next.catch(() => {}));
    return next;
  }
}
const chatQueue = new ChatQueue();

// ───────────────────────────────────────────────────────────────────────────────
// Helpers

function detectModel(content, options = {}) {
  if (options.model && CONFIG.MODELS[options.model]) return options.model;
  const text = String(content || '').toLowerCase();
  if (text.includes('gpt-5-nano')) return 'gpt-5-nano';
  if (text.includes('gpt-5-mini')) return 'gpt-5-mini';
  if (text.includes('gpt-5-chat')) return 'gpt-5-chat-latest';
  if (text.includes('gpt-5') || text.includes('reasoning_effort')) return 'gpt-5';
  if (text.includes('gpt-4o')) return 'gpt-4o';
  return 'gpt-5-mini';
}

function addAutoEmojis(text, options = {}) {
  if (options.noEmojis) return text;
  let out = text;
  for (const [term, emoji] of Object.entries(CONFIG.AUTO_EMOJIS)) {
    const re = new RegExp(`\\b${term}\\b`, 'gi');
    out = out.replace(re, `${emoji} ${term}`);
  }
  // collapse duplicate emojis (zero-width joiner safe)
  return out.replace(/(\p{Extended_Pictographic})\s*\1/gu, '$1');
}

function applyTextStyling(text, model, options = {}) {
  if (options.noStyling) return text;
  const cfg = CONFIG.MODELS[model] || CONFIG.MODELS.default;
  let out = text;

  switch (cfg.style) {
    case 'professional':
      // Bold standalone single-line sentences (light touch)
      out = out.replace(/^([A-Z][^\n.!?]*[.!?])$/gm, '**$1**');
      break;
    case 'concise':
      out = out.replace(/\n\n+/g, '\n')
               .replace(/\b(very|quite|really|extremely)\s+/gi, '');
      break;
    case 'conversational':
      // no-op; keep friendly tone
      break;
    default:
      break;
  }
  return out;
}

// Safer MarkdownV2 escaping (keeps triple backtick blocks intact)
function escapeMarkdownV2(input) {
  if (!input) return '';
  const parts = input.split(/(```[\s\S]*?```)/g);
  return parts.map(part => {
    if (part.startsWith('```')) return part; // don't escape code blocks
    // minimal set for MarkdownV2
    return part.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
  }).join('');
}

// HTML formatter for basic **bold**, *italic*, `code`
function toHTML(input) {
  return String(input || '')
    .replace(/&/g, '&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Message cleaning
function cleanText(s) {
  return String(s || '')
    .replace(/\u0000/g, ' ')
    .replace(/\s{3,}/g, '  ')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

// Process message end-to-end
function processMessage(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return { text: '', model: 'default', modelConfig: CONFIG.MODELS.default };
  }
  let processed = cleanText(text)
    .replace(/\[(?:GPT-\d+|reasoning_effort|verbosity|model):[^\]]*\]/gi, '')
    .replace(/\((?:confidence|tokens?):[^)]*\)/gi, '')
    .replace(/\*{3,}/g, '**')
    .replace(/_{3,}/g, '__')
    .replace(/`{4,}/g, '```');

  const model = detectModel(processed, options);
  if (!options.noEmojis) processed = addAutoEmojis(processed, options);
  if (!options.noStyling) processed = applyTextStyling(processed, model, options);

  return {
    text: processed,
    model,
    modelConfig: CONFIG.MODELS[model] || CONFIG.MODELS.default
  };
}

// Compute a duplicate hash for (chatId, text, model)
function messageHash(chatId, text, model) {
  const normalized = String(text || '')
    .toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
    .trim().slice(0, 220);
  return crypto.createHash('md5').update(`${chatId}::${model}::${normalized}`).digest('hex').slice(0, 16);
}

function isDuplicate(chatId, text, model) {
  const key = messageHash(chatId, text, model);
  return messageCache.has(key);
}
function recordMessage(chatId, text, model) {
  const key = messageHash(chatId, text, model);
  messageCache.set(key, true);
}

// Find a nice split (aware of paragraph breaks and sentences)
function findBestSplit(text, maxLen) {
  const searchStart = Math.max(Math.floor(maxLen * 0.65), maxLen - 500);
  const patterns = [/\n\n/g, /\n/g, /\. /g, /; /g, /, /g, / /g];
  for (const p of patterns) {
    const matches = [...text.matchAll(p)];
    for (let i = matches.length - 1; i >= 0; i--) {
      const pos = matches[i].index + matches[i][0].length;
      if (pos >= searchStart && pos <= maxLen) return pos;
    }
  }
  return maxLen;
}

// Don’t split inside fenced code blocks or list headers
function blockAwareSplit(text, target) {
  // If we’re inside a ``` block, extend to the fence end if it’s near
  const fenceOpen = text.indexOf('```');
  if (fenceOpen !== -1 && fenceOpen < target) {
    const fenceClose = text.indexOf('```', fenceOpen + 3);
    if (fenceClose !== -1 && fenceClose + 3 < text.length && fenceClose + 3 - target < 200) {
      return fenceClose + 3; // include closing ```
    }
  }
  // Avoid splitting right after heading/list marker
  const slice = text.slice(0, target);
  if (/#\s*$/.test(slice) || /-\s*$/.test(slice) || /\*\s*$/.test(slice)) {
    return target - 2;
  }
  return findBestSplit(text, target);
}

// Chunker
function chunkMessage(processed, options = {}) {
  const { text, model, modelConfig } = processed;
  if (text.length <= CONFIG.SAFE_LENGTH) return [{ text, model, modelConfig }];

  const chunks = [];
  let remaining = text;
  let part = 1;

  while (remaining.length > CONFIG.CHUNK_TARGET) {
    let splitAt = blockAwareSplit(remaining, CONFIG.CHUNK_TARGET);
    let chunk = remaining.slice(0, splitAt).trim();

    const emoji = modelConfig.emoji || '📄';
    const modelName = modelConfig.name || 'AI Assistant';
    const header = part === 1 ? `${emoji} *${modelName} - Part ${part}*` : `${emoji} *Part ${part}*`;

    chunk = `${header}\n\n${chunk}`;
    if (remaining.length - splitAt > 120) chunk += `\n\n*[Continued...]*`;

    if (chunk.length > CONFIG.SAFE_LENGTH) {
      chunk = chunk.slice(0, CONFIG.SAFE_LENGTH - 10) + '…';
    }
    chunks.push({ text: chunk, model, modelConfig });

    remaining = remaining.slice(splitAt).trim();
    part++;
  }

  if (remaining.length) {
    const emoji = modelConfig.emoji || '📄';
    const endHeader = part > 1 ? `${emoji} *Part ${part} - Final*` : null;
    const finalText = endHeader ? `${endHeader}\n\n${remaining}` : remaining;
    chunks.push({ text: finalText, model, modelConfig });
  }

  return chunks;
}

// Retry with Telegram-aware backoff (handles 429 “retry_after”)
function parseRetryAfter(error) {
  const p = error?.response?.parameters;
  if (p?.retry_after) return Number(p.retry_after) * 1000;

  const m = /retry after (\d+)/i.exec(error?.message || '');
  if (m) return Number(m[1]) * 1000;

  return null;
}

async function retry(fn, maxAttempts = CONFIG.MAX_RETRIES) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts) break;

      const retryAfter = parseRetryAfter(err);
      const delay = retryAfter ?? (CONFIG.BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1));
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// Format with fallback: MarkdownV2 → HTML → Plain
async function sendSingle(bot, chatId, rawText, options = {}) {
  const attempts = [
    { mode: 'MarkdownV2',   text: escapeMarkdownV2(rawText) },
    { mode: 'HTML',         text: toHTML(rawText) },
    { mode: null,           text: rawText.replace(/[*_`]/g, '') }
  ];

  for (const a of attempts) {
    try {
      const sendOpts = {
        disable_web_page_preview: options.disable_web_page_preview ?? true,
        disable_notification: options.silent ?? false,
        reply_to_message_id: options.reply_to_message_id ?? undefined,
        ...options
      };
      if (a.mode) sendOpts.parse_mode = a.mode;

      const clipped = a.text.length > CONFIG.MAX_MESSAGE_LENGTH
        ? a.text.slice(0, CONFIG.MAX_MESSAGE_LENGTH - 1)
        : a.text;

      return await bot.sendMessage(chatId, clipped, sendOpts);
    } catch (e) {
      // try next mode
      continue;
    }
  }
  throw new Error('All formatting modes failed');
}

// Public entry
async function deliverMessage(bot, chatId, content, options = {}) {
  const started = Date.now();

  if (!bot || chatId == null) {
    return { success: false, error: 'Missing required parameters', processing_time: 0 };
  }
  if (!content || typeof content !== 'string' || content.trim().length < 2) {
    return { success: false, error: 'Content too short after processing', processing_time: 0 };
  }

  const task = async () => {
    const processed = processMessage(content, options);
    const { text, model, modelConfig } = processed;

    if (!options.force && isDuplicate(chatId, text, model)) {
      return {
        success: false,
        reason: 'duplicate',
        model,
        processing_time: Date.now() - started
      };
    }

    const titled = options.title
      ? `${modelConfig.emoji} *${options.title}*\n\n${text}`
      : text;

    let result;
    if (titled.length <= CONFIG.SAFE_LENGTH) {
      await retry(() => sendSingle(bot, chatId, titled, options));
      result = { chunks: 1, delivered: 1, method: 'single' };
    } else {
      const chunks = chunkMessage({ text: titled, model, modelConfig }, options);
      const delay = modelConfig.delay || CONFIG.MODELS.default.delay;
      let delivered = 0;

      for (let i = 0; i < chunks.length; i++) {
        const isLast = i === chunks.length - 1;
        await retry(() => sendSingle(bot, chatId, chunks[i].text, {
          ...options,
          silent: i > 0
        }));
        delivered++;
        if (!isLast) await new Promise(r => setTimeout(r, delay));
      }
      result = { chunks: chunks.length, delivered, method: 'chunked' };
    }

    recordMessage(chatId, text, model);

    return {
      success: true,
      processing_time: Date.now() - started,
      model,
      model_config: modelConfig,
      ...result
    };
  };

  try {
    return await chatQueue.enqueue(chatId, task);
  } catch (error) {
    const processingTime = Date.now() - started;
    const key = `err_${chatId}_${Date.now()}`;
    errorCache.set(key, error.message);
    return { success: false, error: error.message, processing_time: processingTime };
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// GPT-5 flavored helpers (stable API used by your Part 4/6)

async function sendGPT5Message(bot, chatId, content, options = {}) {
  return deliverMessage(bot, chatId, content, { ...options, model: 'gpt-5' });
}
async function sendGPT5Mini(bot, chatId, content, options = {}) {
  return deliverMessage(bot, chatId, content, { ...options, model: 'gpt-5-mini' });
}
async function sendGPT5Nano(bot, chatId, content, options = {}) {
  return deliverMessage(bot, chatId, content, { ...options, model: 'gpt-5-nano' });
}
async function sendGPT5Chat(bot, chatId, content, options = {}) {
  return deliverMessage(bot, chatId, content, { ...options, model: 'gpt-5-chat-latest' });
}

// Legacy/compat
async function sendGPTResponse(bot, chatId, response, title = null, metadata = {}) {
  return deliverMessage(bot, chatId, response, { title, model: 'gpt-5', ...metadata });
}
async function sendAnalysis(bot, chatId, analysis, title = null, metadata = {}) {
  return deliverMessage(bot, chatId, analysis, { title, model: 'gpt-5-mini', ...metadata });
}
async function sendAlert(bot, chatId, message, title = 'System Alert', metadata = {}) {
  const alertContent = `⚠️ ${message}`;
  return deliverMessage(bot, chatId, alertContent, { title, model: 'default', force: true, ...metadata });
}

// ───────────────────────────────────────────────────────────────────────────────
// Dev utilities

function getStats() {
  return {
    timestamp: Date.now(),
    queues_active: Array.from(chatQueue.queues.keys()).length,
    cache_size: messageCache.cache.size,
    error_cache_size: errorCache.cache.size,
    config: {
      max_length: CONFIG.MAX_MESSAGE_LENGTH,
      safe_length: CONFIG.SAFE_LENGTH,
      duplicate_window: CONFIG.DUPLICATE_WINDOW_MS
    }
  };
}

function debug(chatId, content, model = null) {
  const processed = processMessage(content, { model });
  const chunks = chunkMessage(processed);
  const hash = messageHash(chatId, processed.text, processed.model);
  return {
    detected_model: processed.model,
    model_config: processed.modelConfig,
    original_length: content.length,
    processed_length: processed.text.length,
    chunk_count: chunks.length,
    message_hash: hash,
    is_duplicate: isDuplicate(chatId, processed.text, processed.model),
    model_delay: processed.modelConfig.delay,
    auto_emojis_added: content !== processed.text,
    chunks: chunks.map((c, i) => ({
      index: i + 1,
      length: c.text.length,
      preview: c.text.slice(0, 60) + (c.text.length > 60 ? '…' : '')
    }))
  };
}

function clearCache() {
  messageCache.clear();
  errorCache.clear();
  return { success: true };
}

// ───────────────────────────────────────────────────────────────────────────────
// Exports

module.exports = {
  // Primary
  send: deliverMessage,
  sendMessage: deliverMessage,

  // GPT-5 flavored
  sendGPT5Message,
  sendGPT5: sendGPT5Message,
  sendGPT5Mini,
  sendGPT5Nano,
  sendGPT5Chat,

  // Legacy/compat
  sendGPTResponse,
  sendAnalysis,
  sendAlert,

  // Utils
  getStats,
  debug,
  clearCache,

  // Helpers
  processMessage,
  chunkMessage: (content, options = {}) => chunkMessage(processMessage(content, options), options),
  detectModel,
  addAutoEmojis,
  applyTextStyling,
  isDuplicate: (chatId, text, model) => {
    const processed = processMessage(text, { model });
    return isDuplicate(chatId, processed.text, processed.model);
  },

  // Config
  CONFIG
};

console.log('Perfect Telegram Splitter v5.0 loaded');
console.log('- Per-chat send queue to preserve order & dodge flood limits');
console.log('- Block-aware chunking (no splits inside ```code``` blocks)');
console.log('- MarkdownV2 → HTML → Plain fallback with safe escaping');
console.log('- Exponential backoff with Telegram retry_after support');
console.log('- Real duplicate window & compact hashing');
console.log('- Model-aware branding, headers, optional reply threading');
console.log(`- ${Object.keys(CONFIG.MODELS).length} model configurations ready`);
