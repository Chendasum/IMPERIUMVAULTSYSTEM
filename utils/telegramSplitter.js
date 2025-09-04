// utils/telegramSplitter.js — PRO CLEAN + EMOJI + MDV2 SAFE (v2.4.0)
// ───────────────────────────────────────────────────────────────────────────
// Features:
// • MarkdownV2-safe escaping that PRESERVES intended *bold* / _italic_
// • Auto core-emoji + label styling (LAW, STRATEGY, ACTION, DRILL, LOG, …)
// • Optional breathing space for dense paragraphs (env toggle)
// • Bullet normalization, tidy spacing, sentence-aware chunking
// • Code-block aware: never escapes or splits inside ```fences``` or `inline`
// • Header banner + compact "📄 Part N/M" follow-ups
// • Exponential retry + emergency fallback
// ───────────────────────────────────────────────────────────────────────────

'use strict';

console.log('📱 Loading Telegram Splitter • Pro v2.4.0');

const CONFIG = {
  TELEGRAM_LIMIT: 4096,
  SAFE_CHUNK_SIZE: parseInt(process.env.TELEGRAM_CHUNK_SIZE) || 3800,
  MAX_CHUNKS: parseInt(process.env.MAX_TELEGRAM_CHUNKS) || 15,
  RATE_LIMIT_DELAY: parseInt(process.env.TELEGRAM_DELAY_MS) || 120,
  MAX_RETRIES: parseInt(process.env.TELEGRAM_MAX_RETRIES) || 3,
  RETRY_DELAY: parseInt(process.env.TELEGRAM_RETRY_DELAY) || 900,
  ENABLE_COMPRESSION: process.env.TELEGRAM_COMPRESS === 'true',
  ENABLE_BREATHING_SPACE: process.env.TELEGRAM_READABLE === 'true', // 👈 add spacing if true
  DEBUG_MODE: process.env.TELEGRAM_DEBUG === 'true',
  PARSE_MODE: (process.env.TELEGRAM_PARSE_MODE || 'MarkdownV2')
};

// Visual headers
const HEADERS = {
  gpt5: {
    top:    '╭──────────────────────────────────────────╮',
    title:  '│                🚀 GPT-5 Reply               │',
    model:  '│                  🤖 {MODEL}                 │',
    meta:   '│          {TIMESTAMP} • {CHUNKS} part(s)      │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  completion: {
    top:    '╭──────────────────────────────────────────╮',
    title:  '│                ✅ Task Complete             │',
    model:  '│                  🤖 {MODEL}                 │',
    meta:   '│              {TIMESTAMP} • {TIME}           │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  error: {
    top:    '╭──────────────────────────────────────────╮',
    title:  '│                ⚠️ System Alert              │',
    model:  '│                  🔧 {MODEL}                 │',
    meta:   '│        {TIMESTAMP} • Error {CODE}           │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  multimodal: {
    top:    '╭──────────────────────────────────────────╮',
    title:  '│               🎥 Multimodal AI              │',
    model:  '│                👀 {MODEL} Vision            │',
    meta:   '│     {TIMESTAMP} • {TYPE} Analysis           │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  simple: {
    top:    '╭──────────────────────────────────────────╮',
    title:  '│                   💬 Reply                  │',
    model:  '│                  🤖 {MODEL}                 │',
    meta:   '│                  {TIMESTAMP}                │',
    bottom: '╰──────────────────────────────────────────╯'
  }
};

// Core emoji rules for Vault/Codex style
const CORE_EMOJI = [
  { key: 'LAW', emoji: '⚖️' },
  { key: 'STRATEGY', emoji: '🧠' },
  { key: 'ACTION', emoji: '🎯' },
  { key: 'DRILL', emoji: '🥋' },
  { key: 'LOG', emoji: '📓' },
  { key: 'RISK', emoji: '🛡️' },
  { key: 'CAPITAL', emoji: '🏦' },
  { key: 'RESULT', emoji: '🏁' },
  { key: 'PURPOSE', emoji: '🔥' },
  { key: 'METRICS', emoji: '📊' },
  { key: 'OATH', emoji: '🗝️' }
];

// ───────────────────────────────────────────────────────────────────────────
// Utility: safe stringify
function safeString(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}

// ───────────────────────────────────────────────────────────────────────────
// MarkdownV2 escaping while PRESERVING intended *bold* / _italic_ outside code

// Escape set (Telegram MDV2): _ * [ ] ( ) ~ ` > # + - = | { } . !
function escapeMarkdownV2Segment(s) {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

// Protect / restore markers so escaping doesn't kill our formatting
function protectFormatting(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '«B2»$1«B2»')
    .replace(/\*([^*]+)\*/g,     '«B1»$1«B1»')
    .replace(/__([^_]+)__/g,     '«I2»$1«I2»')
    .replace(/_([^_]+)_/g,       '«I1»$1«I1»');
}
function restoreFormatting(text) {
  return text
    .replace(/«B2»([^«]+)«B2»/g, '*$1*')  // Telegram uses * for bold
    .replace(/«B1»([^«]+)«B1»/g, '*$1*')
    .replace(/«I2»([^«]+)«I2»/g, '_$1_')
    .replace(/«I1»([^«]+)«I1»/g, '_$1_');
}

// Split into text/code segments (triple fences or single backticks)
function splitCodeBlocks(text) {
  const parts = [];
  let i = 0, start = 0;
  while (i < text.length) {
    if (text.slice(i, i+3) === '```') {
      if (i > start) parts.push({ type: 'text', value: text.slice(start, i) });
      const end = text.indexOf('```', i+3);
      if (end === -1) { parts.push({ type: 'code', value: text.slice(i) }); return parts; }
      parts.push({ type: 'code', value: text.slice(i, end+3) });
      i = end + 3; start = i; continue;
    }
    if (text[i] === '`') {
      if (i > start) parts.push({ type: 'text', value: text.slice(start, i) });
      const end = text.indexOf('`', i+1);
      if (end === -1) { parts.push({ type: 'text', value: text.slice(i) }); return parts; }
      parts.push({ type: 'code', value: text.slice(i, end+1) });
      i = end + 1; start = i; continue;
    }
    i++;
  }
  if (start < text.length) parts.push({ type: 'text', value: text.slice(start) });
  return parts;
}

function escapeMarkdownV2(text) {
  return splitCodeBlocks(text).map(seg => {
    if (seg.type === 'code') return seg.value;
    const protectedSeg = protectFormatting(seg.value);
    const escaped = escapeMarkdownV2Segment(protectedSeg);
    return restoreFormatting(escaped);
  }).join('');
}

// ───────────────────────────────────────────────────────────────────────────
// Optional readability pass for dense paragraphs
function addBreathingSpace(s) {
  if (!CONFIG.ENABLE_BREATHING_SPACE) return s;
  return s
    // ensure blank line before a bullet block
    .replace(/([^\n])\n(• )/g, '$1\n\n$2')
    // break long sentences: add newline after period/exc/quest followed by uppercase/(
    .replace(/([.!?])\s+(?=[A-Z(])/g, '$1\n')
    // normalize multiple blank lines outside code (handled later too)
    ;
}

// ───────────────────────────────────────────────────────────────────────────
// Compression outside code blocks
function compressText(text) {
  if (!CONFIG.ENABLE_COMPRESSION) return text;
  return text
    .split(/(```[\s\S]*?```)/g)
    .map((seg, idx) => {
      if (idx % 2 === 1) return seg; // code untouched
      return seg
        .replace(/\r/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{3,}/g, '  ')
        .trim();
    })
    .join('');
}

// ───────────────────────────────────────────────────────────────────────────
// Code boundary detection
function detectCodeBlocks(text) {
  const blocks = [];
  const re = /```[\s\S]*?```|`[^`]*`/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    blocks.push({ start: m.index, end: m.index + m[0].length });
  }
  return blocks;
}
function isInsideCodeBlock(text, idx) {
  return detectCodeBlocks(text).some(b => idx >= b.start && idx < b.end);
}

// ───────────────────────────────────────────────────────────────────────────
// Breakpoint selection for chunking
function findOptimalBreakpoint(text, max) {
  if (text.length <= max) return text.length;
  const searchStart = Math.max(0, max - 400);
  const searchEnd = Math.min(text.length, max);
  const scope = text.slice(searchStart, searchEnd);

  // 1) Paragraph break
  let i = scope.lastIndexOf('\n\n');
  if (i !== -1) {
    const pos = searchStart + i + 2;
    if (!isInsideCodeBlock(text, pos)) return pos;
  }
  // 2) Code fence boundary
  const codeUpToEnd = text.slice(0, searchEnd);
  const re = /```[\s\S]*?```/g;
  let m, lastEnd = -1;
  while ((m = re.exec(codeUpToEnd)) !== null) lastEnd = m.index + m[0].length;
  if (lastEnd !== -1 && lastEnd >= searchStart) return lastEnd;

  // 3) Sentence endings
  for (const token of ['. ', '! ', '? ', '.\n', '!\n', '?\n']) {
    i = scope.lastIndexOf(token);
    if (i !== -1) {
      const pos = searchStart + i + token.length;
      if (!isInsideCodeBlock(text, pos)) return pos;
    }
  }
  // 4) Line break
  i = scope.lastIndexOf('\n');
  if (i !== -1) {
    const pos = searchStart + i + 1;
    if (!isInsideCodeBlock(text, pos)) return pos;
  }
  // 5) Space
  i = scope.lastIndexOf(' ');
  if (i !== -1) return searchStart + i + 1;

  return max - 10;
}

// ───────────────────────────────────────────────────────────────────────────
// Emoji + label injection (outside code)
const CORE_LABEL_RE = new RegExp(
  `^\\s*(?:${CORE_EMOJI.map(e => e.key).join('|')})(?:\\s*[:：\\-→])`,
  'i'
);
function injectCoreEmojisAndLabels(text) {
  return text
    .split(/(```[\s\S]*?```)/g)
    .map((seg, idx) => {
      if (idx % 2 === 1) return seg; // code
      return seg.split('\n').map(line => {
        // Normalize bullets
        line = line.replace(/^(\s*)[-*•]\s+/, '$1• ');
        // Core label emphasis
        if (CORE_LABEL_RE.test(line)) {
          const label = line.split(/[:：\-→]/)[0].trim().toUpperCase();
          const rule = CORE_EMOJI.find(e => label.startsWith(e.key));
          if (rule) {
            return line.replace(
              /^(\s*)([A-Za-z]+)(\s*[:：\-→]\s*)/i,
              (_, p, k, sep) => `${p}${rule.emoji} *${k.toUpperCase()}*${sep}`
            );
          }
        }
        // Bold common sections
        line = line.replace(/^(\s*)(Result|Purpose|Metrics|Notes)(\s*[:：\-→]\s*)/i, '$1*$2*$3');
        return line;
      }).join('\n');
    })
    .join('');
}

// ───────────────────────────────────────────────────────────────────────────
// Header building
function getModelInfo(meta = {}) {
  const model = (meta.model || meta.modelUsed || meta.aiUsed || 'gpt-5') + '';
  const map = {
    'gpt-5-nano': { name: 'GPT-5 Nano', emoji: '⚡' },
    'gpt-5-mini': { name: 'GPT-5 Mini', emoji: '🔥' },
    'gpt-5-chat': { name: 'GPT-5 Chat', emoji: '💬' },
    'gpt-5':      { name: 'GPT-5',      emoji: '🚀' },
    'gpt-4o':     { name: 'GPT-4o',     emoji: '👁️' },
    'whisper':    { name: 'Whisper',    emoji: '🎵' },
    'vision':     { name: 'Vision',     emoji: '👀' }
  };
  const key = Object.keys(map).find(k => model.toLowerCase().includes(k)) || 'gpt-5';
  return { name: map[key].name, emoji: map[key].emoji };
}
function headerType(meta = {}) {
  if (meta.multimodal || meta.vision || meta.image) return 'multimodal';
  if (meta.completionDetected) return 'completion';
  if (meta.error) return 'error';
  if (meta.model || meta.modelUsed || meta.aiUsed) return 'gpt5';
  return 'simple';
}
function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function center(text, width = 42) {
  const len = [...text].length;
  const pad = Math.max(0, Math.floor((width - len) / 2));
  return ' '.repeat(pad) + text + ' '.repeat(Math.max(0, width - len - pad));
}
function buildHeader(meta, chunkInfo = {}) {
  const type = headerType(meta);
  const mi = getModelInfo(meta);
  const tpl = HEADERS[type] || HEADERS.simple;
  const rep = {
    MODEL: mi.name,
    TIMESTAMP: ts(),
    CHUNKS: chunkInfo.total || 1,
    TIME: meta.processingTime || 'fast',
    CODE: meta.errorCode || '500',
    TYPE: meta.analysisType || 'Content'
  };
  const process = line => {
    let s = line;
    for (const [k, v] of Object.entries(rep)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    if (s.includes('│') && !/^[│╭╰─]+$/.test(s)) {
      const inner = s.replace(/^│\s*/, '').replace(/\s*│$/, '');
      return `│${center(inner)}│`;
    }
    return s;
  };
  return [tpl.top, tpl.title, tpl.model, tpl.meta ? process(tpl.meta) : null, tpl.bottom]
    .filter(Boolean)
    .map(process)
    .join('\n');
}

// ───────────────────────────────────────────────────────────────────────────
// Chunker
class TextSplitter {
  constructor(opts = {}) {
    this.opts = {
      maxChunkSize: opts.maxChunkSize || CONFIG.SAFE_CHUNK_SIZE,
      maxChunks: opts.maxChunks || CONFIG.MAX_CHUNKS,
      enableCompression: opts.enableCompression !== false
    };
  }
  async split(text, onProgress) {
    let t = safeString(text).trim();
    if (CONFIG.ENABLE_BREATHING_SPACE) t = addBreathingSpace(t);
    if (this.opts.enableCompression) t = compressText(t);
    if (!t) return [];

    const chunks = [];
    let rem = t;
    let n = 0;
    const est = Math.ceil(t.length / this.opts.maxChunkSize);

    while (rem.length > 0 && n < this.opts.maxChunks) {
      if (onProgress && n % 2 === 0) onProgress(n, est, chunks.length);
      if (rem.length <= this.opts.maxChunkSize) { chunks.push(rem.trim()); break; }
      const bp = findOptimalBreakpoint(rem, this.opts.maxChunkSize);
      const chunk = rem.slice(0, bp).trim();
      if (chunk) chunks.push(chunk);
      rem = rem.slice(bp).trim();
      n++;
      if (n % 5 === 0) await new Promise(r => setImmediate(r));
    }

    if (rem.length > 0 && n >= this.opts.maxChunks) {
      const last = chunks[chunks.length - 1] || '';
      if ((last.length + rem.length) <= CONFIG.TELEGRAM_LIMIT * 1.05) {
        chunks[chunks.length - 1] = last + '\n\n' + rem;
      } else {
        chunks.push('\n\n…[response truncated: content too long]');
      }
    }
    return chunks.filter(Boolean);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Sender with retries
class MessageSender {
  constructor(bot) { this.bot = bot; }
  async sendWithRetry(chatId, text, options = {}, maxRetries = CONFIG.MAX_RETRIES) {
    let lastErr = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await this.bot.sendMessage(chatId, text, {
          parse_mode: options.parse_mode || CONFIG.PARSE_MODE,
          disable_web_page_preview: true,
          ...options
        });
        return { success: true, result: res, attempts: attempt };
      } catch (err) {
        lastErr = err;
        // First retry: drop parse_mode (Telegram sometimes picky)
        if (attempt === 1 && (options.parse_mode || CONFIG.PARSE_MODE).toLowerCase().includes('markdown')) {
          try {
            const res = await this.bot.sendMessage(chatId, text, { disable_web_page_preview: true });
            return { success: true, result: res, fallback: true, attempts: attempt };
          } catch { /* continue */ }
        }
        if (attempt < maxRetries) {
          const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    return { success: false, error: lastErr ? lastErr.message : 'Unknown error', attempts: maxRetries };
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Main send
async function sendTelegramMessage(bot, chatId, text, metadata = {}) {
  const start = Date.now();
  try {
    if (!bot || typeof bot.sendMessage !== 'function') throw new Error('Invalid Telegram bot instance');
    if (!chatId) throw new Error('Chat ID required');

    const raw = safeString(text).trim();
    if (!raw) throw new Error('Empty message content');

    const splitter = new TextSplitter({
      maxChunkSize: CONFIG.SAFE_CHUNK_SIZE - 220,
      maxChunks: CONFIG.MAX_CHUNKS,
      enableCompression: CONFIG.ENABLE_COMPRESSION
    });

    // 1) Decorate (emoji + bold labels, bullets), respecting code
    const decorated = injectCoreEmojisAndLabels(raw);

    // 2) Split before escaping
    const chunks = await splitter.split(decorated);

    // 3) Header + sender
    const chunkInfo = { total: chunks.length };
    const header = buildHeader(metadata, chunkInfo);
    const sender = new MessageSender(bot);

    const results = [];
    let successCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const body = chunks[i];
      const isFirst = i === 0;
      const isLast = i === chunks.length - 1;

      // Compose
      let composed = isFirst
        ? `${header}\n\n${body}`
        : `📄 *Part ${i + 1}/${chunks.length}*\n\n${body}`;

      // Escape outside code for MarkdownV2 (with bold/italic preservation)
      composed = composed
        .split(/(```[\s\S]*?```)/g)
        .map((seg, idx) => (idx % 2 === 1 ? seg : escapeMarkdownV2(seg)))
        .join('');

      // Length guard
      if (composed.length > CONFIG.TELEGRAM_LIMIT) {
        const reserve = 80;
        composed = composed.slice(0, CONFIG.TELEGRAM_LIMIT - reserve) + '\\n\\n…\\[truncated\\]';
      }

      const r = await sender.sendWithRetry(chatId, composed, { parse_mode: 'MarkdownV2' });
      results.push(r);
      if (r.success) successCount++;

      if (!isLast && CONFIG.RATE_LIMIT_DELAY > 0) {
        await new Promise(res => setTimeout(res, CONFIG.RATE_LIMIT_DELAY));
      }
    }

    const processingTime = Date.now() - start;
    const mi = getModelInfo(metadata);

    return {
      success: successCount === chunks.length,
      enhanced: true,
      version: '2.4.0',
      chunks: chunks.length,
      sent: successCount,
      failed: chunks.length - successCount,
      processingTime,
      model: mi.name,
      headerType: headerType(metadata),
      originalLength: raw.length,
      processedLength: decorated.length,
      results,
      fallbackUsed: results.some(r => r.fallback),
      retryCount: results.reduce((s, r) => s + ((r.attempts || 1) - 1), 0)
    };

  } catch (error) {
    const processingTime = Date.now() - start;
    try {
      const emergency = `⚠️ System Recovery\\n\\n${escapeMarkdownV2(safeString(text).slice(0, 800))}\\n\\n…`;
      await bot.sendMessage(chatId, emergency, { parse_mode: 'MarkdownV2', disable_web_page_preview: true });
      return { success: true, enhanced: false, emergency: true, error: error.message, processingTime };
    } catch (e2) {
      return { success: false, enhanced: false, error: error.message, emergencyError: e2.message, processingTime };
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Factory
function createTelegramHandler(bot, options = {}) {
  const cfg = { ...CONFIG, ...options };
  return {
    send: (chatId, text, meta = {}) => sendTelegramMessage(bot, chatId, text, meta),
    sendMessage: (chatId, text, meta = {}) => sendTelegramMessage(bot, chatId, text, meta),
    sendGPTResponse: (chatId, text, meta = {}) => sendTelegramMessage(bot, chatId, text, meta),

    sendError: (chatId, errText, opt = {}) =>
      sendTelegramMessage(bot, chatId, errText, {
        model: 'error-handler',
        error: true,
        title: opt.title || 'System Error',
        errorCode: opt.code || '500',
        ...opt
      }),

    sendSuccess: (chatId, okText, opt = {}) =>
      sendTelegramMessage(bot, chatId, okText, {
        model: 'completion-handler',
        completionDetected: true,
        title: opt.title || 'Task Complete',
        ...opt
      }),

    sendMultimodal: (chatId, analysis, opt = {}) =>
      sendTelegramMessage(bot, chatId, analysis, {
        model: opt.model || 'gpt-4o-vision',
        multimodal: true,
        analysisType: opt.type || 'Analysis',
        title: opt.title || 'Multimodal Analysis',
        ...opt
      }),

    getConfig: () => ({ ...cfg }),
    updateConfig: (ncfg) => Object.assign(cfg, ncfg)
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Exports
module.exports = {
  // main
  sendTelegramMessage,
  createTelegramHandler,
  // classes
  TextSplitter,
  MessageSender,
  // utils
  safeString,
  escapeMarkdownV2,
  compressText,
  injectCoreEmojisAndLabels,
  // constants
  CONFIG,
  HEADERS,
  CORE_EMOJI,
  VERSION: '2.4.0'
};

// Boot log
if (CONFIG.DEBUG_MODE) {
  console.log('⚙️ TELEGRAM SPLITTER CONFIG', JSON.stringify(CONFIG, null, 2));
}
