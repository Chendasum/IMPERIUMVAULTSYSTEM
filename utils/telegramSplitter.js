'use strict';
// telegramSplitter.js — 10/10 Production v3 (Ultra‑Compat, Node-safe)
// - NO optional chaining, NO RegExp look‑behind, CommonJS, ASCII‑only
// - Safe Markdown (V1) with sanitizer and auto HTML fallback
// - 4096 split with paragraph/line/code-fence awareness + Part X/Y
// - Per‑chat + global throttling, rate-limit retries (retry_after), circuit breaker
// - Rich helpers: setupTelegramHandler, sendGPTResponse, sendSystemStatus, sendError, sendSuccess
// - Drop‑in with your existing commands (/memory, /health, etc.)

var crypto = require('crypto');

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------
var CONFIG = {
  MAX_MESSAGE_LENGTH: 4096,
  SOFT_SPLIT: 3800,      // aim before hard limit to leave space for prefixes
  PREF_CHUNK: 3500,      // paragraph/sentence chunk target

  // Delivery
  PER_CHAT_MIN_MS: 1100, // Telegram-friendly (>=1 msg/sec per chat)
  GLOBAL_MIN_MS: 33,     // tiny global spacing
  MAX_RETRIES: 3,
  RETRY_BASE_MS: 800,

  // Formatting
  PARSE_MODE: 'Markdown', // Use Markdown (V1) for max compatibility
  AUTO_EMOJI: true,
  SMART_SPACING: true,
  ENHANCED_MARKDOWN: true,
  VISUAL_SEPARATORS: true,
  MAX_LINE_LENGTH: 80
};

// -----------------------------------------------------------------------------
// Internal state (throttles)
// -----------------------------------------------------------------------------
var lastSentAtByChat = Object.create(null);
var lastGlobalSendAt = 0;

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------
function now() { return Date.now(); }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function isString(x) { return typeof x === 'string'; }
function isNumber(x) { return typeof x === 'number' && !isNaN(x); }
function str(x) { return x === undefined || x === null ? '' : String(x); }
function safeObj(x) { return x && typeof x === 'object' ? x : {}; }
function clamp(n, a, b) { return n < a ? a : (n > b ? b : n); }

function mdTrim(s) {
  if (!isString(s)) return '';
  return s.replace(/[\t\v\f\r]+/g, ' ')
          .replace(/ +\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
}

// -----------------------------------------------------------------------------
// Markdown & HTML helpers (safe for Telegram)
// -----------------------------------------------------------------------------
function sanitizeForTelegramMarkdown(text) {
  text = str(text);
  // Protect fenced code blocks first
  var blocks = [];
  text = text.replace(/```([\s\S]*?)```/g, function (_m, code) {
    blocks.push(code);
    return '§§§BLOCK§§§';
  });

  // Escape unmatched * and _ (that break Markdown entity parsing)
  // Note: simple but effective approach for Markdown V1
  text = text.replace(/([*_])(?![^\1]*\1)/g, '\\$1');

  // Restore blocks
  var i = 0;
  text = text.replace(/§§§BLOCK§§§/g, function () {
    var c = blocks[i++] || '';
    return '```' + c + '```';
  });
  return text;
}

function formatMarkdownBasic(text) {
  text = str(text);
  // Convert **bold** -> *bold* (Telegram V1 style)
  text = text.replace(/\*\*(.*?)\*\*/g, '*$1*');
  // Convert *italic* (single asterisks) -> _italic_ (Node-safe: NO look-behind)
  text = text.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1_$2_');
  // Convert ~~strike~~ -> ~strike~
  text = text.replace(/~~([^~]+)~~/g, '~$1~');
  return text;
}

function enhanceHeaders(text) {
  // # -> bold line; #### -> bold prefix
  return text.replace(/^(#+)\s*(.+)$/gm, function (_m, hashes, title) {
    var level = hashes.length;
    var emoji = headerEmoji(title);
    if (level === 1) {
      var up = String(title).toUpperCase();
      return '\ud83d\udd25 *' + up + '*\n' + Array(Math.min(up.length, 20) + 1).join('\u2550');
    }
    if (level === 2) {
      return emoji + ' *' + title + '*\n' + Array(Math.min(String(title).length, 15) + 1).join('\u2500');
    }
    return emoji + ' *' + title + '*';
  });
}

function enhanceLists(text) {
  var r = text;
  // Bullets
  r = r.replace(/^[\-*]\s+(.+)$/gm, '\u2022 $1');
  // Numbered lists: 1. -> 1\ufe0f\u20e3 label (simple 1️⃣ style)
  r = r.replace(/^(\d+)[\.)]\s+(.+)$/gm, function (_m, d, rest) { return d + '\ufe0f\u20e3 ' + rest; });
  // Lettered lists -> small square
  r = r.replace(/^([a-zA-Z])[\.)]\s+(.+)$/gm, '\u25ab\ufe0f $2');

  // Status keywords
  r = r.replace(/^\u2022\s+(.*(?:complete|done|finished|ready|working|success).*)$/gmi, '\u2705 $1')
       .replace(/^\u2022\s+(.*(?:todo|pending|waiting|failed|error|issue).*)$/gmi, '\u274c $1')
       .replace(/^\u2022\s+(.*(?:progress|processing|loading|running).*)$/gmi, '\u23f3 $1');
  return r;
}

function addSeparators(text) {
  var lines = text.split('\n');
  var out = [];
  var inCode = false;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (/^```/.test(line)) inCode = !inCode;
    out.push(line);
    if (!inCode && /^(\ud83d\udd25|\u2728|\ud83d\udca1|\ud83d\udcca|\u26a1|\ud83c\udf1f)/.test(line) && i < lines.length - 1 && str(lines[i + 1]).trim() !== '') {
      out.push(Array(26).join('\u2504'));
    }
  }
  return out.join('\n');
}

function toHtmlFallback(text) {
  text = str(text);
  // Escape basic HTML entities first
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Code blocks
  text = text.replace(/```([\s\S]*?)```/g, function (_m, code) {
    var c = String(code).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '<pre><code>' + c + '</code></pre>';
  });
  // Bold *...*
  text = text.replace(/\*(.*?)\*/g, '<b>$1<\/b>');
  // Italic _..._
  text = text.replace(/_(.*?)_/g, '<i>$1<\/i>');
  // Bullets
  text = text.replace(/^\u2022\s+/gm, '&#8226; ');
  return text;
}

// -----------------------------------------------------------------------------
// Emoji helpers
// -----------------------------------------------------------------------------
var keywordEmojis = {
  // Tech
  'gpt-5': '\ud83e\udd16', 'gpt5': '\ud83e\udd16', 'ai': '\ud83e\uddea', 'error': '\u274c', 'success': '\u2705',
  'working': '\u2705', 'failed': '\u274c', 'loading': '\u23f3', 'complete': '\ud83d\udc4c', 'processing': '\u2699\ufe0f',
  // Financial
  'cost': '\ud83d\udcb0', 'price': '\ud83d\udcb5', 'tokens': '\ud83e\ude99', 'usage': '\ud83d\udcca',
  // Status
  'online': '\ud83d\udfe2', 'offline': '\ud83d\udd34', 'ready': '\u2705', 'busy': '\ud83d\udfe1', 'maintenance': '\u2699\ufe0f',
  // Actions
  'sending': '\ud83d\udce4', 'received': '\ud83d\udce5', 'updated': '\ud83d\udd04', 'created': '\u2728', 'deleted': '\ud83d\uddd1\ufe0f',
  // Time
  'today': '\ud83d\udcc5', 'now': '\u23f0', 'urgent': '\ud83d\udea8', 'scheduled': '\u23f0'
};

function headerEmoji(title) {
  var lower = String(title).toLowerCase();
  if (lower.indexOf('error') >= 0 || lower.indexOf('problem') >= 0) return '\ud83d\udea8';
  if (lower.indexOf('success') >= 0 || lower.indexOf('complete') >= 0) return '\u2705';
  if (lower.indexOf('warning') >= 0 || lower.indexOf('caution') >= 0) return '\u26a0\ufe0f';
  if (lower.indexOf('info') >= 0 || lower.indexOf('note') >= 0) return '\u2139\ufe0f';
  if (lower.indexOf('config') >= 0 || lower.indexOf('setting') >= 0) return '\u2699\ufe0f';
  if (lower.indexOf('result') >= 0 || lower.indexOf('output') >= 0) return '\ud83d\udcca';
  if (lower.indexOf('api') >= 0 || lower.indexOf('gpt') >= 0) return '\ud83e\udd16';
  if (lower.indexOf('cost') >= 0 || lower.indexOf('price') >= 0) return '\ud83d\udcb0';
  if (lower.indexOf('time') >= 0 || lower.indexOf('schedule') >= 0) return '\u23f0';
  if (lower.indexOf('file') >= 0 || lower.indexOf('data') >= 0) return '\ud83d\udcc1';
  if (lower.indexOf('system') >= 0 || lower.indexOf('status') >= 0) return '\ud83d\udda5\ufe0f';
  if (lower.indexOf('user') >= 0 || lower.indexOf('account') >= 0) return '\ud83d\udc64';
  return '\ud83d\udccb';
}

function addAutoEmojis(text) {
  var r = text;
  for (var k in keywordEmojis) {
    if (!Object.prototype.hasOwnProperty.call(keywordEmojis, k)) continue;
    var re = new RegExp('\\b' + k + '\\b', 'gi');
    r = r.replace(re, keywordEmojis[k] + ' ' + k);
  }
  // headers
  r = r.replace(/^(#+\s*)(.+)$/gm, function (_m, hashes, title) {
    return hashes + headerEmoji(title) + ' ' + title;
  });
  return r;
}

function improveSpacing(text) {
  return str(text)
    .replace(/\.([A-Z])/g, '. $1')
    .replace(/:([^\s:])/g, ': $1')
    .replace(/^(\u2022|[-*])\s*/gm, '$1 ')
    .replace(/(```[\s\S]*?```)/g, '\n$1\n')
    .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2');
}

// -----------------------------------------------------------------------------
// Splitter (paragraph/sentence/word, preserves code fences)
// -----------------------------------------------------------------------------
function balanceFencesInChunk(chunk, remaining, hardCap) {
  var ticks = (chunk.match(/```/g) || []).length;
  if (ticks % 2 !== 0) {
    var rest = remaining;
    var nextClose = rest.indexOf('```');
    if (nextClose !== -1 && (chunk.length + nextClose + 3) <= hardCap) {
      return { chunk: chunk + rest.slice(0, nextClose + 3), consumed: nextClose + 3 };
    }
    // close in place and reopen next
    return { chunk: chunk + '\n```', consumed: 0, reopenNext: true };
  }
  return { chunk: chunk, consumed: 0 };
}

function smartSplit(text, hardCap, softCap, pref) {
  text = str(text);
  var hard = isNumber(hardCap) ? hardCap : CONFIG.MAX_MESSAGE_LENGTH;
  var soft = isNumber(softCap) ? softCap : CONFIG.SOFT_SPLIT;
  var target = isNumber(pref) ? pref : CONFIG.PREF_CHUNK;
  if (text.length <= hard) return [text];

  var out = [];
  var remaining = text;

  while (remaining.length) {
    if (remaining.length <= hard) { out.push(remaining); break; }

    var slice = remaining.slice(0, soft);
    var cut = -1;
    var idxPara = slice.lastIndexOf('\n\n');
    var idxLine = slice.lastIndexOf('\n');
    var idxSpace = slice.lastIndexOf(' ');

    if (idxPara > 200) cut = idxPara + 2;
    else if (idxLine > 200) cut = idxLine + 1;
    else if (idxSpace > 200) cut = idxSpace + 1;
    else cut = slice.length;

    var chunk = remaining.slice(0, cut);
    var bal = balanceFencesInChunk(chunk, remaining.slice(cut), hard);
    chunk = bal.chunk;
    remaining = bal.reopenNext ? ('```\n' + remaining.slice(cut + (bal.consumed || 0)))
                               : remaining.slice(cut + (bal.consumed || 0));

    out.push(chunk);
  }

  // prefix Part X/Y later
  return out;
}

// -----------------------------------------------------------------------------
// Core send with retries, sanitize, HTML fallback
// -----------------------------------------------------------------------------
function nextAllowedSendDelay(chatId) {
  var t = now();
  var lastChat = lastSentAtByChat[chatId] || 0;
  var lastGlobal = lastGlobalSendAt || 0;
  var waitChat = lastChat ? (CONFIG.PER_CHAT_MIN_MS - (t - lastChat)) : 0;
  var waitGlobal = lastGlobal ? (CONFIG.GLOBAL_MIN_MS - (t - lastGlobal)) : 0;
  var wait = Math.max(0, waitChat, waitGlobal);
  return wait;
}
function recordSendMoment(chatId) { var t = now(); lastSentAtByChat[chatId] = t; lastGlobalSendAt = t; }

function sendMessageWithRetry(bot, chatId, text, options) {
  options = safeObj(options);
  var attempts = 0;

  function attempt(parseMode, alreadySanitized, usedHtml) {
    var opts = safeObj(options);
    if (parseMode) opts.parse_mode = parseMode;

    var wait = nextAllowedSendDelay(chatId);
    var enqueue = wait > 0 ? sleep(wait) : Promise.resolve();

    return enqueue.then(function () {
      return botSend(bot, chatId, text, opts);
    }).then(function (res) {
      recordSendMoment(chatId);
      return res;
    }).catch(function (err) {
      attempts += 1;
      var info = classifyTelegramError(err);

      if (info.isRate && attempts <= CONFIG.MAX_RETRIES) {
        var back = info.retryAfterMs || (CONFIG.RETRY_BASE_MS * attempts);
        return sleep(back).then(function () { return attempt(parseMode, alreadySanitized, usedHtml); });
      }

      if (info.isEntity && parseMode === 'Markdown' && !alreadySanitized) {
        text = sanitizeForTelegramMarkdown(text);
        return attempt('Markdown', true, usedHtml);
      }

      if ((info.isEntity || info.isBadReq) && !usedHtml) {
        var html = toHtmlFallback(text);
        text = html;
        return attempt('HTML', true, true);
      }

      var e = new Error('Telegram send failed: ' + info.description);
      e.original = err; throw e;
    });
  }

  return attempt(options.parse_mode || CONFIG.PARSE_MODE, false, false);
}

function botSend(bot, chatId, text, options) {
  // Support node-telegram-bot-api or telegraf-like
  if (bot && typeof bot.sendMessage === 'function') return bot.sendMessage(chatId, text, options);
  if (bot && bot.telegram && typeof bot.telegram.sendMessage === 'function') return bot.telegram.sendMessage(chatId, text, options);
  if (typeof bot === 'function') return bot(chatId, text, options);
  return Promise.reject(new Error('Invalid bot instance - no sendMessage method'));
}

function classifyTelegramError(error) {
  var desc = '';
  var status = 0;
  var retryAfterMs = 0;
  try {
    if (error && error.response && error.response.body && error.response.body.description) desc = String(error.response.body.description);
    else if (error && error.description) desc = String(error.description);
    else if (error && error.message) desc = String(error.message);
  } catch (_e) {}
  try {
    status = Number(error.code || (error.response && error.response.statusCode) || 0);
  } catch (_e2) {}
  try {
    if (error && error.response && error.response.body && error.response.body.parameters && error.response.body.parameters.retry_after) retryAfterMs = Number(error.response.body.parameters.retry_after) * 1000;
    else if (error && error.parameters && error.parameters.retry_after) retryAfterMs = Number(error.parameters.retry_after) * 1000;
  } catch (_e3) {}

  var isRate = retryAfterMs > 0 || /too many requests|retry after|429/i.test(desc);
  var isEntity = /can't parse entities|Bad Request: can't parse/i.test(desc);
  var isBadReq = status === 400 || /Bad Request/i.test(desc);

  return { description: desc || ('HTTP ' + status), status: status, retryAfterMs: retryAfterMs, isRate: isRate, isEntity: isEntity, isBadReq: isBadReq };
}

// -----------------------------------------------------------------------------
// Formatter + Model header
// -----------------------------------------------------------------------------
function detectModelFromText(response, metadata) {
  metadata = safeObj(metadata);
  if (metadata.model) return { model: metadata.model, source: 'metadata', confidence: 'high' };

  var patterns = [
    { re: /\[GPT-5\]/i, model: 'gpt-5', conf: 'high' },
    { re: /\[gpt-5-mini\]/i, model: 'gpt-5-mini', conf: 'high' },
    { re: /\[gpt-5-nano\]/i, model: 'gpt-5-nano', conf: 'high' },
    { re: /\[GPT-4o\]/i, model: 'gpt-4o', conf: 'high' },
    { re: /\[.*Fallback.*\]/i, model: 'gpt-4o-fallback', conf: 'medium' },
    { re: /\[CACHED\]/i, model: 'cached-response', conf: 'low' }
  ];
  for (var i = 0; i < patterns.length; i++) {
    if (patterns[i].re.test(response)) return { model: patterns[i].model, source: 'response_text', confidence: patterns[i].conf };
  }

  if (response.length > 8000) return { model: 'gpt-5', source: 'inference', confidence: 'low' };
  if (response.length < 1000 && (response.indexOf('brief') >= 0 || response.indexOf('quick') >= 0)) return { model: 'gpt-5-nano', source: 'inference', confidence: 'low' };
  if (response.indexOf('reasoning') >= 0 || response.indexOf('analysis') >= 0) return { model: 'gpt-5', source: 'inference', confidence: 'medium' };
  return { model: 'gpt-5-mini', source: 'default', confidence: 'medium' };
}

function modelEmoji(m) {
  var map = { 'gpt-5': '\ud83d\ude80', 'gpt-5-mini': '\u26a1', 'gpt-5-nano': '\ud83d\udca8', 'gpt-5-chat-latest': '\ud83d\udcac', 'gpt-4o': '\ud83d\udd04', 'gpt-4o-fallback': '\ud83d\udd04', 'cached-response': '\ud83d\udcbe' };
  return map[m] || '\ud83e\udd16';
}

function buildHeader(meta) {
  meta = safeObj(meta);
  var title = meta.title || '\ud83d\ude80 GPT-5 Smart Analysis';
  var parts = [];
  if (meta.model) parts.push('Model: ' + meta.model);
  if (meta.tokens) parts.push('Tokens: ' + meta.tokens);
  if (meta.cost) parts.push('Cost: $' + meta.cost);
  if (meta.ms) parts.push(meta.ms + 'ms');
  if (meta.cbState) parts.push('CB: ' + meta.cbState);
  var line2 = parts.length ? ('\n' + parts.join(' \u2022 ')) : '';
  return '*' + title + '*' + line2 + '\n\n';
}

function prepareTextForSend(text, cfg) {
  text = str(text);
  var out = mdTrim(text);
  if (cfg.AUTO_EMOJI) out = addAutoEmojis(out);
  if (cfg.SMART_SPACING) out = improveSpacing(out);
  if (cfg.ENHANCED_MARKDOWN) out = formatMarkdownBasic(out);
  if (cfg.VISUAL_SEPARATORS) out = addSeparators(out);
  out = sanitizeForTelegramMarkdown(out);
  return out;
}

// -----------------------------------------------------------------------------
// TelegramFormatter class
// -----------------------------------------------------------------------------
function TelegramFormatter(customConfig) {
  this.config = safeObj(customConfig);
  // merge defaults
  for (var k in CONFIG) if (Object.prototype.hasOwnProperty.call(CONFIG, k) && !Object.prototype.hasOwnProperty.call(this.config, k)) this.config[k] = CONFIG[k];

  this.circuitBreaker = { failures: 0, isOpen: false, lastFailure: 0, resetTime: 60000 };
  this.metrics = { totalSent: 0, totalFailed: 0, averageDelay: 200, lastSuccessTime: now() };
}

TelegramFormatter.prototype.resetCircuitBreaker = function () { this.circuitBreaker.isOpen = false; this.circuitBreaker.failures = 0; this.circuitBreaker.lastFailure = 0; };
TelegramFormatter.prototype.getMetrics = function () {
  var up = now() - this.metrics.lastSuccessTime;
  var total = this.metrics.totalSent + this.metrics.totalFailed;
  var rate = total > 0 ? ((this.metrics.totalSent / total) * 100).toFixed(2) : '100.00';
  return { totalSent: this.metrics.totalSent, totalFailed: this.metrics.totalFailed, successRate: rate, averageDelay: Math.round(this.metrics.averageDelay), circuitBreakerOpen: this.circuitBreaker.isOpen, lastSuccessTime: new Date(this.metrics.lastSuccessTime).toISOString(), uptimeSinceLastSuccess: Math.round(up / 1000) + 's' };
};

TelegramFormatter.prototype.formatMessage = function (text, options) {
  var cfg = safeObj(options);
  // derive full cfg from default + per-call overrides
  var merged = {};
  for (var k in this.config) if (Object.prototype.hasOwnProperty.call(this.config, k)) merged[k] = this.config[k];
  for (var k2 in cfg) if (Object.prototype.hasOwnProperty.call(cfg, k2)) merged[k2] = cfg[k2];

  return prepareTextForSend(text, merged);
};

TelegramFormatter.prototype.formatMessageWithModel = function (response, metadata) {
  var info = detectModelFromText(str(response), safeObj(metadata));
  var header = modelEmoji(info.model) + ' *AI Response*\n_Model: ' + info.model + '_';
  if (info.confidence) {
    var confEmoji = info.confidence === 'high' ? '\u2705' : (info.confidence === 'medium' ? '\u26a0\ufe0f' : '\u2753');
    header += '\n_Detection: ' + confEmoji + ' ' + info.confidence + '_';
  }
  if (metadata && metadata.tokens) header += '\n_Tokens: ' + metadata.tokens + ' \ud83e\ude99_';
  if (metadata && metadata.cost) header += '\n_Cost: $' + metadata.cost + ' \ud83d\udcb0_';
  if (metadata && metadata.executionTime) header += '\n_Time: ' + metadata.executionTime + 'ms \u23f1\ufe0f_';
  if (metadata && metadata.costTier) header += '\n_Tier: ' + metadata.costTier + '_';

  var cleaned = String(response).replace(/^\[.*?\]\s*/gm, '').replace(/^GPT-\d+.*?:\s*/gm, '').trim();
  var finalText = header + '\n\n' + cleaned;
  return { formatted: this.formatMessage(finalText), modelInfo: info, metadata: metadata };
};

TelegramFormatter.prototype.splitMessage = function (text) {
  var chunks = smartSplit(text, this.config.MAX_MESSAGE_LENGTH, this.config.SOFT_SPLIT, this.config.PREF_CHUNK);
  if (chunks.length <= 1) return chunks;
  var out = [];
  for (var i = 0; i < chunks.length; i++) {
    var suffix = '\n\n\ud83d\udcc4 *Part ' + (i + 1) + '/' + chunks.length + '*';
    out.push(chunks[i] + suffix);
  }
  return out;
};

TelegramFormatter.prototype.splitAndSendMessage = function (text, bot, chatId, options) {
  var self = this;
  options = safeObj(options);
  var start = now();

  return new Promise(function (resolve) {
    try {
      if (self.circuitBreaker.isOpen) {
        var since = now() - self.circuitBreaker.lastFailure;
        if (since < self.circuitBreaker.resetTime) throw new Error('Circuit breaker open. Retry in ' + Math.ceil((self.circuitBreaker.resetTime - since) / 1000) + 's');
        self.resetCircuitBreaker();
      }

      var pack = self.formatMessageWithModel(text, options.metadata || {});
      var body = pack.formatted;
      var chunks = self.splitMessage(body);

      var results = [];
      var delay = 200;

      (function sendSeq(idx) {
        if (idx >= chunks.length) {
          var okCount = 0; var failCount = 0;
          for (var z = 0; z < results.length; z++) { if (results[z].success) okCount++; else failCount++; }
          var exec = now() - start;
          self.metrics.averageDelay = Math.round((self.metrics.averageDelay + delay) / 2);
          if (okCount > 0) self.metrics.lastSuccessTime = now();
          return resolve({ success: failCount === 0, enhanced: true, totalChunks: chunks.length, sentChunks: okCount, failedChunks: failCount, executionTime: exec, modelInfo: pack.modelInfo, results: results });
        }
        var piece = chunks[idx];
        var opts = { parse_mode: CONFIG.PARSE_MODE, disable_web_page_preview: true };
        if (options.telegramOptions) { for (var k in options.telegramOptions) if (Object.prototype.hasOwnProperty.call(options.telegramOptions, k)) opts[k] = options.telegramOptions[k]; }

        sendMessageWithRetry(bot, chatId, piece, opts)
          .then(function (res) {
            self.metrics.totalSent++;
            results.push({ chunkIndex: idx, messageId: res && res.message_id ? res.message_id : null, length: piece.length, attempts: 1, success: true });
            if (idx < chunks.length - 1) sleep(delay).then(function () { sendSeq(idx + 1); }); else sendSeq(idx + 1);
          })
          .catch(function (e) {
            self.metrics.totalFailed++; self.circuitBreaker.failures++;
            if (self.circuitBreaker.failures >= 3) { self.circuitBreaker.isOpen = true; self.circuitBreaker.lastFailure = now(); }
            results.push({ chunkIndex: idx, error: e.message, attempts: CONFIG.MAX_RETRIES, success: false });
            if (idx < chunks.length - 1) sleep(delay).then(function () { sendSeq(idx + 1); }); else sendSeq(idx + 1);
          });
      })(0);
    } catch (err) {
      resolve({ success: false, enhanced: false, error: err.message, totalChunks: 0, sentChunks: 0, failedChunks: 1, executionTime: 0 });
    }
  });
};

// -----------------------------------------------------------------------------
// Message handler facade
// -----------------------------------------------------------------------------
function TelegramMessageHandler(bot, defaultOptions) {
  this.bot = bot;
  this.formatter = new TelegramFormatter(safeObj(defaultOptions) && defaultOptions.config);
  this.defaultOptions = safeObj(defaultOptions);
  this.queue = [];
  this.processing = false;
  this.queueDelay = 300;
  console.log('\u2705 Telegram message handler v3 ready');
}

TelegramMessageHandler.prototype.sendFormattedMessage = function (text, chatId, options) {
  var messageOptions = {};
  var base = this.defaultOptions || {};
  var opt = safeObj(options);
  for (var k in base) if (Object.prototype.hasOwnProperty.call(base, k)) messageOptions[k] = base[k];
  for (var k2 in opt) if (Object.prototype.hasOwnProperty.call(opt, k2)) messageOptions[k2] = opt[k2];

  var self = this;
  return this.formatter.splitAndSendMessage(text, this.bot, chatId, messageOptions)
    .then(function (r) {
      if (r && r.success) return r;
      return self.basicFallback(text, chatId, options);
    })
    .catch(function (_e) { return self.basicFallback(text, chatId, options); });
};

TelegramMessageHandler.prototype.basicFallback = function (text, chatId, _options) {
  var self = this;
  return botSend(this.bot, chatId, text, {})
    .then(function () { return { success: true, enhanced: false, fallback: true, totalChunks: 1, sentChunks: 1, failedChunks: 0 }; })
    .catch(function (finalError) {
      return { success: false, enhanced: false, fallback: true, error: finalError.message, totalChunks: 1, sentChunks: 0, failedChunks: 1 };
    });
};

TelegramMessageHandler.prototype.formatGPTResponse = function (response, metadata) {
  var header = '\ud83e\udd16 *GPT Response*';
  var meta = safeObj(metadata);
  var parts = [];
  if (meta.model) parts.push('\n_Model: ' + meta.model + '_');
  if (meta.tokens) parts.push('\n_Tokens: ' + meta.tokens + '_');
  if (meta.cost) parts.push('\n_Cost: ' + meta.cost + '_');
  return this.formatter.formatMessage(header + parts.join('') + '\n\n' + str(response));
};

TelegramMessageHandler.prototype.formatSystemStatus = function (status) {
  status = safeObj(status);
  var lines = [];
  lines.push('\ud83d\udda5\ufe0f *System Status Report*');
  lines.push('\ud83d\udcc5 ' + new Date().toISOString());
  lines.push('');
  lines.push('\ud83e\udd16 *AI Models*');
  lines.push('\u2022 GPT-5: ' + (status.gpt5Available ? '\ud83d\udfe2 Online' : '\ud83d\udd34 Offline'));
  lines.push('\u2022 GPT-5 Mini: ' + (status.gpt5MiniAvailable ? '\ud83d\udfe2 Online' : '\ud83d\udd34 Offline'));
  lines.push('\u2022 GPT-5 Nano: ' + (status.gpt5NanoAvailable ? '\ud83d\udfe2 Online' : '\ud83d\udd34 Offline'));
  if (typeof status.fallbackWorking !== 'undefined') lines.push('\u2022 Fallback: ' + (status.fallbackWorking ? '\ud83d\udfe2 Ready' : '\ud83d\udd34 Unavailable'));
  lines.push('');
  if (status.metrics) {
    lines.push('\ud83d\udcca *Performance*');
    if (typeof status.metrics.successRate !== 'undefined') lines.push('\u2022 Success Rate: ' + status.metrics.successRate + '% \u2705');
  }
  lines.push('\u26a1 *Circuit Breaker*: ' + (status.circuitBreakerState || 'CLOSED'));
  if (status.currentModel) lines.push('\ud83c\udfaf *Active Model*: ' + status.currentModel);
  return this.formatter.formatMessage(lines.join('\n'));
};

TelegramMessageHandler.prototype.formatError = function (error, context) {
  var t = '\ud83d\udea8 *Error Report*';
  if (context) t += '\n*Context:* ' + str(context);
  t += '\n*Error:* ' + str(error && error.message ? error.message : error);
  t += '\n*Time:* ' + new Date().toISOString();
  return this.formatter.formatMessage(t);
};

TelegramMessageHandler.prototype.formatSuccess = function (message, details) {
  var t = '\u2705 *Success*\n\n' + str(message);
  details = safeObj(details);
  var keys = Object.keys(details);
  if (keys.length) {
    t += '\n\n*Details:*\n' + keys.map(function (k) { return '\u2022 ' + k + ': ' + details[k]; }).join('\n');
  }
  return this.formatter.formatMessage(t);
};

TelegramMessageHandler.prototype.queueMessage = function (text, chatId, options) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.queue.push({ text: text, chatId: chatId, options: options, resolve: resolve, reject: reject, ts: now() });
    if (!self.processing) self.processQueue();
  });
};

TelegramMessageHandler.prototype.processQueue = function () {
  var self = this;
  if (self.processing || self.queue.length === 0) return;
  self.processing = true;
  (function step() {
    if (self.queue.length === 0) { self.processing = false; return; }
    var job = self.queue.shift();
    self.sendFormattedMessage(job.text, job.chatId, job.options)
      .then(function (r) { job.resolve(r); })
      .catch(function (e) { job.reject(e); })
      .finally(function () { sleep(self.queueDelay).then(step); });
  })();
};

TelegramMessageHandler.prototype.getQueueStatus = function () {
  return { queueLength: this.queue.length, isProcessing: this.processing, oldestMessage: this.queue.length ? new Date(this.queue[0].ts).toISOString() : null };
};

TelegramMessageHandler.prototype.getMetrics = function () { return this.formatter.getMetrics(); };
TelegramMessageHandler.prototype.resetCircuitBreaker = function () { this.formatter.resetCircuitBreaker(); };

// -----------------------------------------------------------------------------
// Public helpers (drop-in)
// -----------------------------------------------------------------------------
function sendTelegramMessage(bot, chatId, gptResponse, metadata) {
  var handler = new TelegramMessageHandler(bot);
  metadata = safeObj(metadata);
  return handler.sendFormattedMessage(gptResponse, chatId, { metadata: metadata })
    .then(function (result) {
      var model = (result && result.modelInfo && result.modelInfo.model) ? result.modelInfo.model : 'detected';
      console.log('\u2705 Telegram delivery: ' + (result && result.enhanced ? 'enhanced' : 'basic') + ' (' + model + ')');
      return result;
    })
    .catch(function (e) {
      console.error('\u274c Telegram delivery failed:', e.message);
      return { success: false, error: e.message };
    });
}

function setupTelegramHandler(bot, config) {
  return new TelegramMessageHandler(bot, safeObj(config));
}

// -----------------------------------------------------------------------------
// Demo (run file directly)
// -----------------------------------------------------------------------------
function demonstrateEnhancedTelegram(bot) {
  var handler = setupTelegramHandler(bot, { config: { AUTO_EMOJI: true, SMART_SPACING: true, ENHANCED_MARKDOWN: true } });
  var gptResponse = 'Here\'s a comprehensive analysis of GPT-5 capabilities. Key features include: 272,000 token window, better factual accuracy, and improved coding.';
  return handler.sendGPTResponse ? handler.sendGPTResponse(gptResponse, { model: 'gpt-5-mini', tokens: 1250, cost: 0.00125, executionTime: 2340, costTier: 'economy' }, 'demo_chat')
    : handler.sendFormattedMessage(gptResponse, 'demo_chat', { metadata: { model: 'gpt-5-mini' } });
}

// Extend handler with convenience senders
TelegramMessageHandler.prototype.sendGPTResponse = function (response, metadata, chatId) {
  var txt = this.formatGPTResponse(response, metadata);
  return this.sendFormattedMessage(txt, chatId, { metadata: metadata });
};
TelegramMessageHandler.prototype.sendSystemStatus = function (status, chatId) {
  var txt = this.formatSystemStatus(status);
  return this.sendFormattedMessage(txt, chatId, { metadata: { title: '\ud83e\udd7a System Status' } });
};
TelegramMessageHandler.prototype.sendError = function (error, context, chatId) {
  var txt = this.formatError(error, context);
  return this.sendFormattedMessage(txt, chatId, {});
};
TelegramMessageHandler.prototype.sendSuccess = function (message, details, chatId) {
  var txt = this.formatSuccess(message, details);
  return this.sendFormattedMessage(txt, chatId, {});
};

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------
module.exports = {
  CONFIG: CONFIG,
  TelegramFormatter: TelegramFormatter,
  TelegramMessageHandler: TelegramMessageHandler,
  sendTelegramMessage: sendTelegramMessage,
  setupTelegramHandler: setupTelegramHandler,
  demonstrateEnhancedTelegram: demonstrateEnhancedTelegram,
  // low-level helpers (if you need them)
  sanitizeForTelegramMarkdown: sanitizeForTelegramMarkdown,
  toHtmlFallback: toHtmlFallback,
  sendMessageWithRetry: sendMessageWithRetry,
  smartSplit: smartSplit
};

// If run directly, do a quick demo with a mock bot
if (require.main === module) {
  var mockBot = {
    sendMessage: function (chatId, text, options) {
      console.log('\ud83e\udd16 MockBot -> ' + chatId + ': ' + (text.length > 60 ? text.slice(0, 60) + '...' : text));
      return new Promise(function (res) { setTimeout(function () { res({ message_id: Math.floor(Math.random() * 100000) }); }, 80); });
    }
  };
  demonstrateEnhancedTelegram(mockBot).then(function () {
    console.log('\n\ud83c\udf89 Demo complete');
  });
}
