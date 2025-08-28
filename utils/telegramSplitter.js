// utils/telegramSplitter.js — SMART MULTI‑MODEL SPLITTER (v2)
// -----------------------------------------------------------------------------
// Purpose:
//   • Accept replies from multiple AI models (GPT‑5 Full/Mini/Nano, Claude, etc.)
//   • Guarantee single‑voice delivery (when desired) with reservation + priority
//   • Prevent true duplicates (exact same content/model within windows)
//   • Chunk long messages safely for Telegram with Markdown or HTML output
//   • Provide observability: stats, health, cleanup, debug helpers
//
// Notes:
//   • This is a full, drop‑in replacement (>500 lines) with battle‑tested guards.
//   • Default is “single‑voice mode” (MAX_RESPONSES_PER_QUERY = 1). Flip to
//     council mode by increasing the value. Aggregator variant is included and
//     can be used to wait briefly and pick highest‑priority.
// -----------------------------------------------------------------------------

'use strict';

const crypto = require('crypto');

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                              CONFIGURATION                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const TELEGRAM_CONFIG = {
  MAX_MESSAGE_LENGTH: 4096,            // Telegram hard cap
  SAFE_MESSAGE_LENGTH: 4000,           // Leave headroom for formatting
  OPTIMAL_CHUNK_SIZE: 3800,            // Natural chunk target
  FAST_DELAY: 250,                     // Fast cadence
  STANDARD_DELAY: 450,                 // Standard cadence

  // Duplicate prevention windows
  DUPLICATE_WINDOW: 3000,              // ms for exact same requestId resend
  MULTI_MODEL_WINDOW: 30000,           // ms for multiple models per query

  // Single‑voice vs Council
  MAX_RESPONSES_PER_QUERY: 1,          // 1 = single‑voice; >1 = council

  // Rendering
  DEFAULT_PARSE_MODE: 'Markdown',       // 'Markdown' | 'HTML'
  HTML_FALLBACK_FROM_MARKDOWN: true,    // If Markdown fails, try HTML

  // Aggregator (optional) — wait briefly to collect multiple replies then pick best
  AGGREGATOR_WINDOW_MS: 1200,           // Soft wait for other models
  AGGREGATOR_HARD_TIMEOUT_MS: 5000,     // Absolute cap
  AGGREGATOR_ENABLED: false             // Disabled by default; enable if desired
};

// Message types / model metadata (priority decides winner)
const MESSAGE_TYPES = {
  'nano':      { emoji: '⚡', delay: 150, description: 'GPT‑5 Nano',       priority: 1 },
  'mini':      { emoji: '🔥', delay: 250, description: 'GPT‑5 Mini',       priority: 2 },
  'full':      { emoji: '🧠', delay: 450, description: 'GPT‑5 Full',       priority: 3 },
  'gpt-5':     { emoji: '🤖', delay: 450, description: 'GPT‑5',            priority: 3 },
  'chat':      { emoji: '💬', delay: 250, description: 'Chat',             priority: 1 },
  'analysis':  { emoji: '📊', delay: 450, description: 'Analysis',         priority: 3 },
  'error':     { emoji: '❌', delay: 100, description: 'Error',            priority: 0 },
  'credit':    { emoji: '🏦', delay: 350, description: 'Credit Analysis',  priority: 2 },
  'risk':      { emoji: '⚠️', delay: 350, description: 'Risk Assessment',  priority: 2 },
  'recovery':  { emoji: '💰', delay: 350, description: 'Loan Recovery',    priority: 2 },
  'compliance':{ emoji: '🔍', delay: 350, description: 'Due Diligence',    priority: 2 }
};

// Treat aliases as the same voice (prevents confusing stats/titles)
const MODEL_ALIAS = { 'gpt-5': 'full' };

function normalizeModelType(t) {
  return MODEL_ALIAS[t] || t || 'analysis';
}

function maxPriorityValue() {
  return Object.values(MESSAGE_TYPES).reduce((m, v) => Math.max(m, v.priority || 0), 0);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                          STATE / IN‑MEMORY REGISTRIES                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// Concurrency + delivery governance
const activeRequests = new Map();            // requestId -> timestamp
const requestHistory = new Map();            // requestId -> { timestamp, modelType, queryId }
const responseCounter = new Map();           // queryId -> count delivered
const responseReservations = new Map();      // queryId -> boolean (slot reserved)

// Aggregator (optional)
const aggregatorBuckets = new Map();         // queryId -> { startedAt, timer, hardTimer, responses: [] }

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                              UTILITY HELPERS                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function baseMessageForId(message) {
  return (message || '')
    .replace(/\s+/g, ' ')             // collapse whitespace
    .replace(/\*|\_|`|~|\[|\]/g, '') // strip common md markers
    .trim()
    .slice(0, 300);                    // stable seed
}

function generateQueryId(chatId, cleanedMessage) {
  const queryContent = `${chatId}_${baseMessageForId(cleanedMessage)}`;
  return crypto.createHash('md5').update(queryContent).digest('hex').substring(0, 12);
}

function generateRequestId(chatId, cleanedMessage, title, modelType) {
  const qid = generateQueryId(chatId, cleanedMessage);
  const mt = normalizeModelType(modelType);
  return `${qid}_${mt}`;
}

function getTypeConfig(modelType) {
  const nt = normalizeModelType(modelType);
  return MESSAGE_TYPES[nt] || MESSAGE_TYPES.analysis;
}

function labelFor(modelType) {
  const t = getTypeConfig(modelType);
  return `${t.emoji || ''} ${t.description || modelType}`.trim();
}

function nowMs() { return Date.now(); }

function tsCambodia() {
  try {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Phnom_Penh', hour12: false
    }) + ' Cambodia';
  } catch {
    return new Date().toISOString();
  }
}

function tsZurich() {
  try {
    return new Date().toLocaleTimeString('en-CH', {
      timeZone: 'Europe/Zurich', hour12: false
    }) + ' Zurich';
  } catch {
    return new Date().toISOString();
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                              MESSAGE CLEANING                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function cleanMessage(text) {
  if (!text || typeof text !== 'string') return '';

  let out = text
    // Remove GPT‑5 specific tags / meta
    .replace(/\[reasoning_effort:\s*\w+\]/gi, '')
    .replace(/\[verbosity:\s*\w+\]/gi, '')
    .replace(/\[model:\s*gpt-5[^\]]*\]/gi, '')
    .replace(/\[gpt-5[^\]]*\]/gi, '')
    .replace(/\(confidence:\s*\d+%\)/gi, '')
    .replace(/\(model:\s*gpt-5[^\)]*\)/gi, '')

    // Normalize code fences to inline for Telegram Markdown safety
    .replace(/```[\w]*\n?([\s\S]*?)\n?```/g, '`$1`')

    // Convert bold headers like # H1 into *H1*
    .replace(/#{1,6}\s*(.*)/g, '*$1*')

    // Collapse excessive newlines
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/^\n+|\n+$/g, '')
    .trim();

  // Convert **bold** to *bold* for Telegram
  out = out.replace(/\*\*(.*?)\*\*/g, '*$1*');

  return out;
}

// Optional: HTML conversion if Markdown fails hard
function toPlainText(m) {
  return (m || '')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[*_`~\[\]]/g, '');
}

function toHTML(m) {
  if (!m) return '';
  let s = m
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // naive Markdown -> HTML (bold/italic/code/headers)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1<\/b>');
  s = s.replace(/\*([^*]+)\*/g, '<b>$1<\/b>'); // Telegram HTML supports <b>
  s = s.replace(/`([^`]+)`/g, '<code>$1<\/code>');
  s = s.replace(/^# (.*)$/gm, '<b>$1<\/b>');
  s = s.replace(/^## (.*)$/gm, '<b>$1<\/b>');

  // Convert newlines to <br>
  s = s.replace(/\n/g, '<br>');
  return s;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                             MESSAGE SPLITTING                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function splitMessage(message, modelType = 'analysis') {
  if (!message || message.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
    return [message];
  }

  const chunks = [];
  let remaining = message;
  let partNumber = 1;

  while (remaining.length > TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE) {
    let splitPoint = TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE - 100;

    const splitPatterns = [
      { pattern: /\n\n#{1,6}\s/g, priority: 1 },  // headers
      { pattern: /\n\n\d+\.\s/g, priority: 2 },  // numbered lists
      { pattern: /\n\n•\s/g, priority: 3 },       // bullets
      { pattern: /\n\n/g, priority: 4 },          // paragraphs
      { pattern: /\.\s+/g, priority: 5 },           // sentences
      { pattern: /;\s+/g, priority: 6 },             // semicolons
      { pattern: /,\s+/g, priority: 7 }              // commas
    ];

    let bestSplitPoint = null;
    let bestPriority = 999;

    for (const { pattern, priority } of splitPatterns) {
      const matches = [...remaining.matchAll(pattern)];
      for (let i = matches.length - 1; i >= 0; i--) {
        const matchEnd = matches[i].index + matches[i][0].length;
        if (matchEnd >= splitPoint * 0.6 && matchEnd <= splitPoint && priority < bestPriority) {
          bestSplitPoint = matchEnd;
          bestPriority = priority;
          break;
        }
      }
      if (bestSplitPoint) break;
    }

    splitPoint = bestSplitPoint || splitPoint;

    let chunk = remaining.substring(0, splitPoint).trim();
    const typeConfig = getTypeConfig(modelType);
    chunk = `📄 *Part ${partNumber}* ${typeConfig.emoji}\n\n${chunk}`;

    chunks.push(chunk);
    remaining = remaining.substring(splitPoint).trim();
    partNumber++;
  }

  if (remaining.length > 0) {
    if (partNumber > 1) {
      const typeConfig = getTypeConfig(modelType);
      remaining = `📄 *Part ${partNumber} - Final* ${typeConfig.emoji}\n\n${remaining}`;
    }
    chunks.push(remaining);
  }

  return chunks;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                            TELEGRAM SENDERS                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function sendSingleMessage(bot, chatId, message, retryCount = 0) {
  const mode = TELEGRAM_CONFIG.DEFAULT_PARSE_MODE;
  try {
    if (mode === 'Markdown') {
      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    } else {
      await bot.sendMessage(chatId, toHTML(message), {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    }
    return true;
  } catch (markdownError) {
    console.log(`⚠️ Primary mode failed (${mode}), trying fallback: ${markdownError.message}`);

    try {
      if (TELEGRAM_CONFIG.HTML_FALLBACK_FROM_MARKDOWN && mode === 'Markdown') {
        await bot.sendMessage(chatId, toHTML(message), {
          parse_mode: 'HTML',
          disable_web_page_preview: true
        });
        return true;
      }

      const plain = toPlainText(message);
      await bot.sendMessage(chatId, plain, { disable_web_page_preview: true });
      return true;
    } catch (plainError) {
      console.error(`❌ Send failed (attempt ${retryCount + 1}):`, plainError.message);

      if (retryCount < 2 && (plainError.message.includes('network') || plainError.message.includes('timeout'))) {
        const waitMs = (retryCount + 1) * 1000;
        console.log(`🔄 Retrying in ${waitMs}ms...`);
        await new Promise(r => setTimeout(r, waitMs));
        return sendSingleMessage(bot, chatId, message, retryCount + 1);
      }

      return false;
    }
  }
}

async function sendChunkedMessage(bot, chatId, message, delay = 250, modelType = 'analysis') {
  const chunks = splitMessage(message, modelType);
  let successCount = 0;

  console.log(`📦 Sending ${chunks.length} chunks for ${modelType} model`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const isLast = i === chunks.length - 1;

    console.log(`📤 Sending chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

    const sent = await sendSingleMessage(bot, chatId, chunk);
    if (sent) {
      successCount++;
      console.log(`✅ Chunk ${i + 1}/${chunks.length} delivered`);
    } else {
      console.log(`❌ Chunk ${i + 1}/${chunks.length} failed`);
    }

    if (!isLast && sent) {
      const adaptiveDelay = successCount === i + 1 ? delay : delay * 1.5;
      await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
    }
  }

  console.log(`📊 Delivery summary: ${successCount}/${chunks.length} chunks sent (${((successCount / chunks.length) * 100).toFixed(1)}%)`);
  return successCount > 0;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                     DUPLICATE PREVENTION & RESERVATIONS                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function isActualDuplicate(requestId, queryId, modelType) {
  const t = nowMs();

  // Exact same request throttling (same requestId)
  const lastRequest = requestHistory.get(requestId);
  if (lastRequest && (t - lastRequest.timestamp) < TELEGRAM_CONFIG.DUPLICATE_WINDOW) {
    console.log(`🚫 Exact duplicate blocked: ${requestId}`);
    return true;
  }

  // Single‑voice reservation gate (prevents race where two senders both pass count=0)
  const currentCount = responseCounter.get(queryId) || 0;
  const reserved = responseReservations.get(queryId) || false;
  if (TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY <= 1 && (currentCount >= 1 || reserved)) {
    console.log(`🛑 Slot unavailable for ${queryId} (count=${currentCount}, reserved=${reserved})`);
    return true;
  }

  // Same model already sent for this query within window
  const sameModelAlreadySent = Array.from(requestHistory.values()).some(data =>
    data.queryId === queryId &&
    data.modelType === normalizeModelType(modelType) &&
    (t - data.timestamp) < TELEGRAM_CONFIG.MULTI_MODEL_WINDOW
  );
  if (sameModelAlreadySent) {
    console.log(`🔄 Same model already sent for query ${queryId} (${modelType})`);
    return true;
  }

  return false;
}

function recordRequest(requestId, queryId, modelType) {
  const t = nowMs();
  requestHistory.set(requestId, {
    timestamp: t,
    modelType: normalizeModelType(modelType),
    queryId
  });

  const current = responseCounter.get(queryId) || 0;
  responseCounter.set(queryId, current + 1);
  console.log(`📝 Request recorded: ${requestId} (Query: ${queryId}, Model: ${modelType}, Count: ${current + 1})`);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                           AGGREGATOR (OPTIONAL)                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
// Use this when you want to “ask many → show one” by waiting briefly and picking
// the highest‑priority response. Enable via TELEGRAM_CONFIG.AGGREGATOR_ENABLED.

function aggregatorStart(queryId) {
  if (aggregatorBuckets.has(queryId)) return aggregatorBuckets.get(queryId);
  const bucket = {
    startedAt: nowMs(),
    responses: [],
    timer: null,
    hardTimer: null
  };
  aggregatorBuckets.set(queryId, bucket);
  return bucket;
}

function aggregatorAdd(queryId, modelType, text) {
  const bucket = aggregatorStart(queryId);
  bucket.responses.push({ modelType: normalizeModelType(modelType), text, createdAt: nowMs() });
}

function aggregatorPickBest(responses) {
  if (!responses || !responses.length) return null;
  const sorted = responses.slice().sort((a, b) => {
    const pa = getTypeConfig(a.modelType).priority || 0;
    const pb = getTypeConfig(b.modelType).priority || 0;
    if (pb !== pa) return pb - pa;
    return a.createdAt - b.createdAt; // earlier if same priority
  });
  return sorted[0];
}

function aggregatorBuildOutgoing(best, title) {
  if (!best) return '';
  const label = labelFor(best.modelType);
  const header = title ? `${label}: *${title}*\n\n` : `${label}:\n\n`;
  return header + best.text;
}

async function aggregatorFinalize(queryId, bot, chatId, modelTypeFallback, title) {
  const bucket = aggregatorBuckets.get(queryId);
  if (!bucket) return false;

  const best = aggregatorPickBest(bucket.responses);
  aggregatorBuckets.delete(queryId);

  if (!best) return false;

  const delay = getTypeConfig(best.modelType).delay || TELEGRAM_CONFIG.STANDARD_DELAY;
  const outgoing = best.text.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH
    ? best.text
    : null; // will be split by sendChunkedMessage

  if (outgoing) {
    return sendSingleMessage(bot, chatId, aggregatorBuildOutgoing(best, title));
  }

  // If long, send chunked with the winning model type
  return sendChunkedMessage(bot, chatId, aggregatorBuildOutgoing(best, title), delay, best.modelType);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                       MAIN ENTRY: sendGPT5Message                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function sendGPT5Message(bot, chatId, message, title = null, metadata = {}) {
  const modelTypeRaw = metadata.modelUsed || metadata.aiUsed || 'analysis';
  const modelType = normalizeModelType(modelTypeRaw);

  // Clean first; build IDs from cleaned content for stability
  let cleanedMessage = cleanMessage(message);
  if (!cleanedMessage || cleanedMessage.length < 10) {
    console.log('⚠️ Message too short or empty after cleaning');
    return false;
  }

  const queryId = generateQueryId(chatId, cleanedMessage);
  const requestId = generateRequestId(chatId, cleanedMessage, title, modelType);

  try {
    console.log(`📱 Processing message for ${chatId}`);
    console.log(`🔍 Query ID: ${queryId}, Request ID: ${requestId}, Model: ${modelType}`);

    // Duplicate checks
    if (isActualDuplicate(requestId, queryId, modelType)) {
      return false;
    }

    // Reserve slot early for single‑voice mode
    if (TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY <= 1) {
      if (responseReservations.get(queryId)) {
        console.log(`🛑 Another sender already reserved slot for ${queryId}`);
        return false;
      }
      responseReservations.set(queryId, true);
    }

    // Mark active
    activeRequests.set(requestId, nowMs());

    // Optional aggregator: collect before sending
    if (TELEGRAM_CONFIG.AGGREGATOR_ENABLED) {
      const bucket = aggregatorStart(queryId);

      // Add this response now
      aggregatorAdd(queryId, modelType, title ? `${labelFor(modelType)}\n\n${cleanedMessage}` : cleanedMessage);

      // Arm timers if first time
      if (!bucket.timer) {
        bucket.timer = setTimeout(async () => {
          await aggregatorFinalize(queryId, bot, chatId, modelType, title);
        }, TELEGRAM_CONFIG.AGGREGATOR_WINDOW_MS);
      }
      if (!bucket.hardTimer) {
        bucket.hardTimer = setTimeout(async () => {
          await aggregatorFinalize(queryId, bot, chatId, modelType, title);
        }, TELEGRAM_CONFIG.AGGREGATOR_HARD_TIMEOUT_MS);
      }

      // In aggregator mode, don’t send immediately; finalize() will send one
      return true;
    }

    // Compose title and model label (only show model on subsequent responses of same query)
    const typeConfig = getTypeConfig(modelType);
    const responseCount = responseCounter.get(queryId) || 0;
    let outgoing = cleanedMessage;
    if (title) {
      const enhancedTitle = `${typeConfig.emoji} *${title}*${responseCount > 0 ? ` (${typeConfig.description})` : ''}`;
      outgoing = `${enhancedTitle}\n\n${cleanedMessage}`;
    }

    // Decide sending path
    const delay = typeConfig.delay || TELEGRAM_CONFIG.STANDARD_DELAY;
    const sent = outgoing.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH
      ? await sendSingleMessage(bot, chatId, outgoing)
      : await sendChunkedMessage(bot, chatId, outgoing, delay, modelType);

    if (sent) recordRequest(requestId, queryId, modelType);

    const status = sent ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`${status} Message delivery for ${modelType}: ${requestId}`);
    return sent;

  } catch (error) {
    console.error('❌ Send error:', error.message);
    try {
      const fallbackMsg = `🚨 *Delivery Error*\n\nModel: ${modelType}\nError: ${error.message.substring(0, 100)}...\n\n⏰ ${tsCambodia()}`;
      await bot.sendMessage(chatId, fallbackMsg);
      return true;
    } catch (fallbackError) {
      console.error('❌ Fallback failed:', fallbackError.message);
      return false;
    }
  } finally {
    activeRequests.delete(requestId);
    if (responseReservations.get(queryId)) {
      responseReservations.delete(queryId);
    }
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                      LEGACY COMPAT & CONVENIENCE WRAPPERS                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function sendGPTResponse(bot, chatId, response, title, metadata = {}) {
  return sendGPT5Message(bot, chatId, response, title, { ...metadata, modelUsed: 'gpt-5' });
}

async function sendClaudeResponse(bot, chatId, response, title, metadata = {}) {
  return sendGPT5Message(bot, chatId, response, title, { ...metadata, modelUsed: 'analysis' });
}

async function sendDualAIResponse(bot, chatId, response, title, metadata = {}) {
  return sendGPT5Message(bot, chatId, response, title, { ...metadata, modelUsed: 'full' });
}

async function sendAnalysis(bot, chatId, analysis, title, metadata = {}) {
  return sendGPT5Message(bot, chatId, analysis, title, { ...metadata, modelUsed: 'analysis' });
}

async function sendAlert(bot, chatId, alertMessage, title = 'Alert', metadata = {}) {
  const alertContent = `🚨 *${title}*\n\n${alertMessage}\n\n⏰ ${tsCambodia()}`;
  return sendGPT5Message(bot, chatId, alertContent, null, { ...metadata, modelUsed: 'error' });
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                STATS / HEALTH                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function getStats() {
  const t = nowMs();
  let activeCount = 0;
  let historyCount = 0;

  for (const [, timestamp] of activeRequests.entries()) {
    if (t - timestamp < 300000) activeCount++; // 5 min
  }

  for (const [, data] of requestHistory.entries()) {
    if (t - data.timestamp < 300000) historyCount++; // 5 min recent
  }

  const uniqueQueries = responseCounter.size;

  return {
    status: TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY <= 1
      ? 'SINGLE‑VOICE MODE'
      : 'SMART MULTI‑MODEL MODE',
    defaultParseMode: TELEGRAM_CONFIG.DEFAULT_PARSE_MODE,
    duplicateWindow: TELEGRAM_CONFIG.DUPLICATE_WINDOW,
    multiModelWindow: TELEGRAM_CONFIG.MULTI_MODEL_WINDOW,
    maxResponsesPerQuery: TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY,
    aggregatorEnabled: TELEGRAM_CONFIG.AGGREGATOR_ENABLED,
    activeRequests: activeCount,
    recentHistory: historyCount,
    uniqueQueries
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                  CLEANUP                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function autoCleanup() {
  const t = nowMs();
  let cleaned = { requests: 0, history: 0, queries: 0, aggregators: 0 };

  // Active requests older than 5 minutes
  for (const [requestId, timestamp] of activeRequests.entries()) {
    if (t - timestamp > 300000) { // 5 minutes
      activeRequests.delete(requestId);
      cleaned.requests++;
    }
  }

  // History older than 1 hour
  for (const [requestId, data] of requestHistory.entries()) {
    if (t - data.timestamp > 3600000) { // 1 hour
      requestHistory.delete(requestId);
      cleaned.history++;
    }
  }

  // Queries with no recent history (30 minutes)
  const toRemove = [];
  for (const [queryId] of responseCounter.entries()) {
    const hasRecent = Array.from(requestHistory.values()).some(data =>
      data.queryId === queryId && (t - data.timestamp) < 1800000 // 30 min
    );
    if (!hasRecent) toRemove.push(queryId);
  }
  toRemove.forEach(qid => { responseCounter.delete(qid); cleaned.queries++; });

  // Aggregator buckets older than hard timeout
  for (const [qid, bucket] of aggregatorBuckets.entries()) {
    if (t - bucket.startedAt > TELEGRAM_CONFIG.AGGREGATOR_HARD_TIMEOUT_MS) {
      aggregatorBuckets.delete(qid);
      cleaned.aggregators++;
    }
  }

  if (cleaned.requests || cleaned.history || cleaned.queries || cleaned.aggregators) {
    console.log(`🧹 Auto cleanup: ${cleaned.requests} active, ${cleaned.history} history, ${cleaned.queries} queries, ${cleaned.aggregators} aggregators`);
  }
}

function manualCleanup() {
  console.log('🧹 Starting manual cleanup...');
  autoCleanup();
  console.log('📊 Post‑cleanup stats:', getStats());
}

// Schedule auto cleanup every 10 minutes
setInterval(autoCleanup, 600000);

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                               DEBUG HELPERS                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function generateRequestIdDebug(chatId, message, title, modelType) {
  // Uses cleaned form inside to ensure real behavior
  const cleaned = cleanMessage(message);
  return generateRequestId(chatId, cleaned, title, modelType);
}

function generateQueryIdDebug(chatId, message) {
  const cleaned = cleanMessage(message);
  return generateQueryId(chatId, cleaned);
}

function isActualDuplicateDebug(chatId, message, title, modelType) {
  const cleaned = cleanMessage(message);
  const qid = generateQueryId(chatId, cleaned);
  const rid = generateRequestId(chatId, cleaned, title, modelType);
  return isActualDuplicate(rid, qid, modelType);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                  EXPORTS                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

module.exports = {
  // Main
  sendGPT5Message,
  sendGPTResponse,
  sendClaudeResponse,
  sendDualAIResponse,
  sendAnalysis,
  sendAlert,

  // Utilities
  cleanMessage,
  splitMessage,
  getStats,
  manualCleanup,
  autoCleanup,

  // Debug
  generateRequestId: generateRequestIdDebug,
  generateQueryId: generateQueryIdDebug,
  isActualDuplicate: isActualDuplicateDebug,

  // Config
  TELEGRAM_CONFIG,
  MESSAGE_TYPES
};

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                  BOOT LOG                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

console.log('🚀 Telegram Splitter v2 loaded');
console.log(`✅ Mode: ${TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY <= 1 ? 'SINGLE‑VOICE' : 'SMART MULTI‑MODEL'}`);
console.log(`🛡️ Duplicates: ${TELEGRAM_CONFIG.DUPLICATE_WINDOW}ms exact, ${TELEGRAM_CONFIG.MULTI_MODEL_WINDOW}ms multi‑model`);
console.log(`🧰 Aggregator: ${TELEGRAM_CONFIG.AGGREGATOR_ENABLED ? 'ENABLED' : 'disabled'} (window ${TELEGRAM_CONFIG.AGGREGATOR_WINDOW_MS}ms)`);
console.log(`🕒 Timezones: ${tsCambodia()} | ${tsZurich()}`);
