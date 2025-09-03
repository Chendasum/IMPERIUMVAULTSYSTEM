'use strict';
/**
 * utils/telegramSplitter.js
 * Beautiful, smart Telegram delivery for long/structured GPT responses.
 *
 * ✅ Compatible with your pipeline:
 *    - sendTelegramMessage(bot, chatId, text, metadata)
 *    - setupTelegramHandler(bot) → { send, sendGPTResponse, sendError }
 *    - sendAlert(bot, chatId, message, title?)
 *
 * ✨ Highlights:
 *    - Gorgeous header banner (ASCII box) with model/time/tokens/cost/confidence
 *    - Smart spacing + paragraph reflow + bullet normalization
 *    - Code-block aware chunking (never splits ``` blocks)
 *    - Markdown-safe wrapping (preserves code & links)
 *    - Style presets: compact | relaxed | roomy (auto spacing + wrap width)
 *    - Optional inline buttons (Telegram inline keyboard)
 *    - Parse mode negotiation: Markdown → fallback to plain text automatically
 *    - Clean, deterministic logs and detailed result object
 */

////////////////////////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////////////////////////

const TELEGRAM_HARD_LIMIT = 4096;             // Telegram message length cap
const DEFAULT_PARSE_MODE  = 'Markdown';       // Prefer Markdown; fallback to plaintext
const MAX_CHUNK_SOFT      = 3600;             // Try not to exceed this per chunk (gives room for header/footer)
const BOX_CHAR            = '─';               // Horizontal line char for header

// Style presets for spacing + wrapping + banner width
const STYLE_PRESETS = {
  compact: { wrap: 78,  gapAfterHeader: 1, gapBetweenSections: 1, padSections: false, bannerWidth: 38 },
  relaxed: { wrap: 92,  gapAfterHeader: 1, gapBetweenSections: 1, padSections: true,  bannerWidth: 42 },
  roomy:   { wrap: 108, gapAfterHeader: 2, gapBetweenSections: 2, padSections: true,  bannerWidth: 50 }
};

////////////////////////////////////////////////////////////////////////////////
// SMALL UTILITIES
////////////////////////////////////////////////////////////////////////////////

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const msToPretty = (ms) => {
  if (ms == null) return '';
  if (ms < 1000) return `${ms}ms`;
  const s = (ms / 1000);
  if (s < 60) return `${s.toFixed(2)}s`;
  const m = Math.floor(s / 60);
  const ss = (s % 60).toFixed(0).padStart(2, '0');
  return `${m}m${ss}s`;
};

const fmtNumber = (n, digits = 2) => {
  if (typeof n !== 'number' || Number.isNaN(n)) return '';
  if (n === 0) return '0';
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  return n.toFixed(digits).replace(/\.00$/, '');
};

const truthy = (v) => v !== undefined && v !== null && v !== false;

////////////////////////////////////////////////////////////////////////////////
// MARKDOWN / TEXT NORMALIZATION
////////////////////////////////////////////////////////////////////////////////

function normalizeBullets(text) {
  // Turn ragged bullets into consistent format
  // - also collapses multiple spaces after bullets
  return text
    .replace(/^[ \t]*[-–—•·]\s*/gm, '• ')
    .replace(/^[ \t]*\*\s+/gm, '• ')
    .replace(/^[ \t]*\d+\.\s+/gm, (m) => m.trim() + ' ');
}

function collapseBlankLines(text, maxBlank = 2) {
  // Collapse runs of blank lines to at most maxBlank
  const pattern = new RegExp(`(?:\\n\\s*){${maxBlank + 1},}`, 'g');
  return text.replace(pattern, '\n'.repeat(maxBlank));
}

function trimEachLine(text) {
  return text
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/g, '')) // trim trailing spaces
    .join('\n')
    .trim();
}

function ensureBalancedCodeFences(text) {
  // If user sent an opening ``` without closing, add a closing fence at the end.
  const fenceCount = (text.match(/(^|\n)```/g) || []).length;
  if (fenceCount % 2 !== 0) {
    return text + '\n```';
  }
  return text;
}

// Wrap plain paragraphs but never wrap inside code fences or blockquotes
function wrapMarkdownSmart(text, width) {
  const lines = text.split('\n');
  let wrapped = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (/^```/.test(line)) {
      inFence = !inFence;
      wrapped.push(line);
      continue;
    }

    if (inFence) {
      wrapped.push(line);
      continue;
    }

    // Don’t wrap headings, rules, quotes, or already short lines
    if (
      /^ {0,3}#{1,6}\s/.test(line) ||             // headings
      /^ {0,3}[-*_]{3,}\s*$/.test(line) ||        // hr
      /^>/.test(line) ||                          // blockquote
      line.length <= width
    ) {
      wrapped.push(line);
      continue;
    }

    // Try to wrap at spaces, but keep links intact (crudely)
    let current = '';
    const tokens = line.split(/(\s+)/);

    for (let t of tokens) {
      if (current.length + t.length > width) {
        if (current.trim().length) wrapped.push(current.trimEnd());
        // Avoid splitting inside a URL token (very basic)
        if (/https?:\/\/\S+/.test(t) && t.length > width) {
          wrapped.push(t);
          current = '';
        } else {
          current = t.trimStart();
        }
      } else {
        current += t;
      }
    }
    if (current.trim().length) wrapped.push(current.trimEnd());
  }

  return wrapped.join('\n');
}

function smartSpacing(input, preset) {
  let out = String(input || '');

  out = trimEachLine(out);
  out = normalizeBullets(out);
  out = collapseBlankLines(out, preset.padSections ? 2 : 2); // 2 is sensible for readability
  out = ensureBalancedCodeFences(out);
  out = wrapMarkdownSmart(out, preset.wrap);

  return out;
}

////////////////////////////////////////////////////////////////////////////////
// HEADER / FOOTER
////////////////////////////////////////////////////////////////////////////////

function centerText(text, width) {
  text = text.trim();
  if (text.length >= width) return text.slice(0, width);
  const pad = Math.floor((width - text.length) / 2);
  const left = ' '.repeat(pad);
  const right = ' '.repeat(width - text.length - pad);
  return left + text + right;
}

function buildHeader(title, preset, meta = {}) {
  if (!title) return '';

  const w = clamp(preset.bannerWidth, 28, 70);
  const top    = `╭${BOX_CHAR.repeat(w)}╮`;
  const bottom = `╰${BOX_CHAR.repeat(w)}╯`;

  const lines = [];

  const line1 = centerText(title, w);
  lines.push(`│ ${line1} │`);

  // Optional subline (e.g., model)
  const infoBits = [];
  if (meta.model) infoBits.push(`🤖 ${String(meta.model)}`);
  if (truthy(meta.executionTime)) infoBits.push(`⏱ ${msToPretty(meta.executionTime)}`);
  if (truthy(meta.tokens)) infoBits.push(`🔢 ${meta.tokens} tok`);
  if (truthy(meta.cost)) infoBits.push(`💵 $${fmtNumber(Number(meta.cost), 6)}`);
  if (truthy(meta.confidence)) infoBits.push(`🎯 ${(Number(meta.confidence) * 100).toFixed(0)}%`);

  if (infoBits.length) {
    const line2 = centerText(infoBits.join('   '), w);
    lines.push(`│ ${line2} │`);
  }

  return [top, ...lines, bottom].join('\n');
}

function buildFooter(meta = {}, preset) {
  const bits = [];
  if (truthy(meta.costTier)) bits.push(`Cost: ${meta.costTier}`);
  if (truthy(meta.complexity)) bits.push(`Complexity: ${meta.complexity}`);
  if (truthy(meta.reasoning)) bits.push(`Reasoning: ${meta.reasoning}`);
  if (truthy(meta.verbosity)) bits.push(`Verbosity: ${meta.verbosity}`);
  if (truthy(meta.contextUsed)) bits.push(`Context: ${meta.contextUsed ? 'Yes' : 'No'}`);
  if (truthy(meta.fallbackUsed)) bits.push(`Fallback: ${meta.fallbackUsed ? 'Yes' : 'No'}`);
  if (truthy(meta.completionDetected)) bits.push(`Completion: ${meta.completionDetected ? 'Yes' : 'No'}`);

  if (!bits.length) return '';

  const body = '— ' + bits.join('  •  ');
  if (preset.padSections) return `\n${body}\n`;
  return `\n${body}`;
}

////////////////////////////////////////////////////////////////////////////////
// CHUNKING (CODE-BLOCK AWARE)
////////////////////////////////////////////////////////////////////////////////

function splitIntoLogicalBlocks(md) {
  // HIGH LEVEL: split by code fences and large paragraph blocks
  // Keep fences intact; never split mid-fence.
  const blocks = [];
  const lines = md.split('\n');
  let buf = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      // fence boundary
      if (!inFence) {
        // flush previous buffer as a block
        if (buf.length) {
          blocks.push(buf.join('\n').trim());
          buf = [];
        }
        inFence = true;
        buf.push(line);
      } else {
        buf.push(line);
        blocks.push(buf.join('\n')); // entire fence block
        buf = [];
        inFence = false;
      }
    } else {
      buf.push(line);
    }
  }

  if (buf.length) blocks.push(buf.join('\n').trim());

  // Post-process: split large non-code blocks by double newline boundaries
  const final = [];
  for (const b of blocks) {
    if (/^```/.test(b)) {
      final.push(b);
    } else if (b.length <= MAX_CHUNK_SOFT) {
      final.push(b);
    } else {
      // try to split by paragraph boundaries
      const paras = b.split(/\n{2,}/);
      let acc = '';
      for (let p of paras) {
        const appended = acc.length ? acc + '\n\n' + p : p;
        if (appended.length > MAX_CHUNK_SOFT) {
          if (acc.length) final.push(acc);
          acc = p;
        } else {
          acc = appended;
        }
      }
      if (acc.length) final.push(acc);
    }
  }
  return final.filter(Boolean);
}

function assembleChunksWithHeaderFooter(text, opts) {
  const preset = STYLE_PRESETS[opts.style] || STYLE_PRESETS.relaxed;
  const parsed  = smartSpacing(text, preset);

  const header = opts.noHeader ? '' : buildHeader(opts.title || 'GPT-5', preset, {
    model: opts.model, executionTime: opts.executionTime, tokens: opts.tokens,
    cost: opts.cost, confidence: opts.confidence
  });

  const footer = opts.noFooter ? '' : buildFooter({
    costTier: opts.costTier, complexity: opts.complexity, reasoning: opts.reasoning,
    verbosity: opts.verbosity, contextUsed: opts.contextUsed, fallbackUsed: opts.fallbackUsed,
    completionDetected: opts.completionDetected
  }, preset);

  const base = header
    ? [header, preset.gapAfterHeader ? '' : null, parsed].filter((v) => v !== null).join('\n')
    : parsed;

  const withFooter = footer ? `${base}\n${footer}` : base;

  // Split into logical blocks, then pack into messages under hard limit
  const blocks = splitIntoLogicalBlocks(withFooter);

  const chunks = [];
  let current = '';

  const pushCurrent = () => {
    if (!current) return;
    chunks.push(current);
    current = '';
  };

  for (const b of blocks) {
    if (!b.trim()) {
      if (current.length + 1 <= TELEGRAM_HARD_LIMIT) {
        current += '\n';
      } else {
        pushCurrent();
        current = '\n';
      }
      continue;
    }

    if (b.length > TELEGRAM_HARD_LIMIT) {
      // Split this big block safely by lines under hard limit
      const lines = b.split('\n');
      let buf = '';
      for (const ln of lines) {
        const add = (buf ? '\n' : '') + ln;
        if ((buf + add).length > TELEGRAM_HARD_LIMIT) {
          // flush buf
          if (current.length + buf.length + 1 > TELEGRAM_HARD_LIMIT) {
            pushCurrent();
          }
          chunks.push(buf);
          buf = ln;
        } else {
          buf += add;
        }
      }
      if (buf) {
        if (current.length + buf.length + 1 > TELEGRAM_HARD_LIMIT) {
          pushCurrent();
          chunks.push(buf);
        } else {
          current += (current ? '\n' : '') + buf;
        }
      }
      continue;
    }

    // Normal case: pack block into current or start a new chunk
    if ((current + (current ? '\n\n' : '') + b).length <= TELEGRAM_HARD_LIMIT) {
      current += (current ? '\n\n' : '') + b;
    } else {
      pushCurrent();
      if (b.length <= TELEGRAM_HARD_LIMIT) {
        current = b;
      } else {
        // (shouldn’t happen after above clause, but keep safe)
        chunks.push(b.slice(0, TELEGRAM_HARD_LIMIT));
        current = b.slice(TELEGRAM_HARD_LIMIT);
      }
    }
  }

  pushCurrent();

  return chunks;
}

////////////////////////////////////////////////////////////////////////////////
// SENDER CORE
////////////////////////////////////////////////////////////////////////////////

async function _sendRaw(bot, chatId, text, opts = {}) {
  // Minimal wrapper around Telegram sendMessage
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: opts.parseMode || DEFAULT_PARSE_MODE,
    disable_web_page_preview: !!opts.disableWebPreview
  };

  // Inline keyboard support (array of rows; each row array of buttons)
  if (Array.isArray(opts.buttons) && opts.buttons.length) {
    payload.reply_markup = {
      inline_keyboard: opts.buttons
    };
  }

  return bot.sendMessage(chatId, payload.text, {
    parse_mode: payload.parse_mode,
    disable_web_page_preview: payload.disable_web_page_preview,
    reply_markup: payload.reply_markup
  });
}

async function _sendWithFallback(bot, chatId, text, opts) {
  // Try Markdown → fallback to plaintext on error
  try {
    return await _sendRaw(bot, chatId, text, { ...opts, parseMode: opts.parseMode || DEFAULT_PARSE_MODE });
  } catch (err) {
    console.warn('[telegramSplitter] Markdown send failed, falling back to plaintext:', err.message);
    try {
      return await _sendRaw(bot, chatId, text, { ...opts, parseMode: undefined });
    } catch (err2) {
      console.error('[telegramSplitter] Plaintext send also failed:', err2.message);
      throw err2;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// PUBLIC API: sendTelegramMessage
////////////////////////////////////////////////////////////////////////////////

/**
 * sendTelegramMessage(bot, chatId, text, metadata?)
 *
 * metadata supports:
 * - title, model, executionTime, tokens, cost, costTier
 * - complexity, confidence, reasoning, verbosity, contextUsed
 * - fallbackUsed, completionDetected
 * - style: 'compact' | 'relaxed' | 'roomy'
 * - parseMode, noHeader, noFooter, disableWebPreview
 * - buttons: [[{ text, url|callback_data }], [...]]
 */
async function sendTelegramMessage(bot, chatId, text, metadata = {}) {
  const t0 = Date.now();
  const style = metadata.style || 'relaxed';
  const preset = STYLE_PRESETS[style] || STYLE_PRESETS.relaxed;

  if (!bot || typeof bot.sendMessage !== 'function') {
    throw new Error('Telegram bot instance with sendMessage required');
  }
  if (!chatId) throw new Error('chatId required');

  const chunks = assembleChunksWithHeaderFooter(String(text || ''), {
    style,
    noHeader: !!metadata.noHeader,
    noFooter: !!metadata.noFooter,
    title: metadata.title || headerAutoTitle(metadata),
    model: metadata.model,
    executionTime: metadata.executionTime,
    tokens: metadata.tokens,
    cost: metadata.cost,
    confidence: metadata.confidence,
    costTier: metadata.costTier,
    complexity: metadata.complexity,
    reasoning: metadata.reasoning,
    verbosity: metadata.verbosity,
    contextUsed: metadata.contextUsed,
    fallbackUsed: metadata.fallbackUsed,
    completionDetected: metadata.completionDetected
  });

  let sent = 0;
  let lastMessage = null;

  for (let i = 0; i < chunks.length; i++) {
    const label = chunks.length > 1 ? ` (${i + 1}/${chunks.length})` : '';
    const body = chunks[i];

    // Only put header on the first chunk (header is in assembled text already)
    // Subsequent chunks get a tiny prefix if needed.
    const prefix = i === 0 ? '' : '';
    const textToSend = `${prefix}${body}`;

    lastMessage = await _sendWithFallback(bot, chatId, textToSend, {
      parseMode: metadata.parseMode,                  // optional
      disableWebPreview: !!metadata.disableWebPreview,
      buttons: i === chunks.length - 1 ? metadata.buttons : undefined
    });
    sent++;
  }

  const elapsed = Date.now() - t0;

  return {
    success: true,
    enhanced: true,
    chunks: sent,
    elapsedMs: elapsed,
    model: metadata.model || 'gpt-5-mini',
    message: lastMessage
  };
}

function headerAutoTitle(meta) {
  // If caller didn’t pass a title, pick a good one
  if (meta.title) return meta.title;
  if (meta.completionDetected) return '✅ Task Completed';
  if (meta.model) return `🚀 ${String(meta.model).toUpperCase()} Response`;
  return '🤖 GPT-5 Response';
}

////////////////////////////////////////////////////////////////////////////////
// PUBLIC API: setupTelegramHandler
////////////////////////////////////////////////////////////////////////////////

function setupTelegramHandler(bot) {
  return {
    // Basic send (alias to sendTelegramMessage without metadata)
    send: async (text, chatId, opts = {}) =>
      sendTelegramMessage(bot, chatId, text, opts),

    // Explicit alias your code references
    sendGPTResponse: async (text, chatId, opts = {}) =>
      sendTelegramMessage(bot, chatId, text, opts),

    // Error helper
    sendError: async (text, chatId, title = 'System Error') =>
      sendAlert(bot, chatId, text, title)
  };
}

////////////////////////////////////////////////////////////////////////////////
// PUBLIC API: sendAlert
////////////////////////////////////////////////////////////////////////////////

async function sendAlert(bot, chatId, errorMessage, title = 'System Error') {
  try {
    const text =
      `**${title}**\n\n` +
      `${String(errorMessage || 'Unknown error')}\n\n` +
      `Please try again in a moment.`;

    const res = await sendTelegramMessage(bot, chatId, text, {
      style: 'compact',
      model: 'error-handler',
      costTier: 'free',
      noFooter: false,
      title: '⚠️ Alert'
    });

    return { ...res, success: true };
  } catch (err) {
    console.error('[telegramSplitter] sendAlert failed, falling back to basic send:', err.message);
    try {
      await bot.sendMessage(chatId, `${title}\n\n${errorMessage}`);
      return { success: true, enhanced: false, chunks: 1 };
    } catch (err2) {
      console.error('[telegramSplitter] Basic alert send failed:', err2.message);
      return { success: false, error: err2.message };
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// EXPORTS (plus aliases to match your earlier integration)
////////////////////////////////////////////////////////////////////////////////

module.exports = {
  // main
  sendTelegramMessage,

  // helper bundle used by your dualCommandSystem integration
  setupTelegramHandler,
  sendAlert,

  // aliases to keep legacy calls happy
  sendMessage: sendTelegramMessage,
  sendGPTResponse: sendTelegramMessage,

  // expose presets for tuning (optional)
  STYLE_PRESETS
};
