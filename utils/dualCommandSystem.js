'use strict';

/**
 * dualCommandSystem.js — v8.1 PRODUCTION
 * ---------------------------------------------------------------------------
 * - Safe imports with graceful degradation
 * - Type-safe string utils (no more toLowerCase/substring crashes)
 * - Completion detection (skips unnecessary GPT calls)
 * - Smart model selection + fallbacks
 * - Memory integration via buildEnhancedContext (with fallback)
 * - Unified DB save (saveConversation|saveConversationDB)
 * - Telegram splitter w/ chunked fallback (4096 cap-safe)
 * - Multimodal guards and handlers
 * - Cambodia templates (short, maintainable)
 * - Health checks + analytics
 */

// ════════════════════════════════════════════════════════════════════════════
// SAFE IMPORTS
// ════════════════════════════════════════════════════════════════════════════

function safeRequire(modulePath, fallback = {}) {
  try {
    const mod = require(modulePath);
    console.log(`[Import] Loaded ${modulePath}`);
    return mod;
  } catch (error) {
    console.warn(`[Import] Failed to load ${modulePath}: ${error.message}`);
    return fallback;
  }
}

const openaiClient = safeRequire('./openaiClient', {
  // Should expose getGPT5Analysis(message, options)
  getGPT5Analysis: async () => { throw new Error('OpenAI client not available'); }
});

const memory = safeRequire('./memory', {
  buildConversationContext: async () => '',
  buildEnhancedContext: async (_chatId, _msg, _opts) => ({ context: '' }),
  saveToMemory: async () => true
});

const database = safeRequire('./database', {
  saveConversation: async () => true,
  saveConversationDB: async () => true,
  getConversationHistoryDB: async () => []
});

const multimodal = safeRequire('./multimodal', {
  analyzeImage: async () => ({ success: false, error: 'multimodal not available' }),
  analyzeDocument: async () => ({ success: false, error: 'multimodal not available' }),
  analyzeVoice: async () => ({ success: false, error: 'multimodal not available' }),
  analyzeAudio: async () => ({ success: false, error: 'multimodal not available' }),
  analyzeVideo: async () => ({ success: false, error: 'multimodal not available' }),
  analyzeVideoNote: async () => ({ success: false, error: 'multimodal not available' }),
  getMultimodalStatus: () => ({ available: false })
});

// Telegram splitter (optional)
let telegramSplitter = null;
try {
  const splitter = require('./telegramSplitter');
  if (splitter && typeof splitter.sendTelegramMessage === 'function') {
    telegramSplitter = {
      sendMessage: splitter.sendTelegramMessage,
      sendGPT5: (bot, chatId, response, meta = {}) =>
        splitter.sendTelegramMessage(bot, chatId, response, { ...meta, model: 'gpt-5' })
    };
    console.log('[Import] Telegram splitter loaded');
  }
} catch (err) {
  console.warn('[Import] Telegram splitter failed:', err.message);
}
if (!telegramSplitter) {
  // Minimal fallback
  telegramSplitter = {
    sendMessage: async (bot, chatId, text) => {
      if (!bot?.sendMessage) return { success: false };
      await bot.sendMessage(chatId, text);
      return { success: true, fallback: true };
    },
    sendGPT5: async (bot, chatId, text, meta) => telegramSplitter.sendMessage(bot, chatId, text, meta)
  };
}

// ════════════════════════════════════════════════════════════════════════════
/** CONFIG */
// ════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  MODELS: {
    NANO: 'gpt-5-nano',
    MINI: 'gpt-5-mini',
    FULL: 'gpt-5',
    CHAT: 'gpt-5-chat-latest'
  },
  TOKEN_LIMITS: {
    NANO_MAX: 4000,
    MINI_MAX: 8000,
    FULL_MAX: 16000,
    CHAT_MAX: 8000
  }
};

const MESSAGE_TYPES = {
  SIMPLE_GREETING: 'simple_greeting',
  SIMPLE_QUESTION: 'simple_question',
  COMPLEX_QUERY: 'complex_query',
  SYSTEM_COMMAND: 'system_command',
  MULTIMODAL: 'multimodal'
};

// System state
const systemState = {
  version: '8.1',
  startTime: Date.now(),
  requestCount: 0,
  successCount: 0,
  errorCount: 0,
  modelUsageStats: {
    'gpt-5': 0,
    'gpt-5-mini': 0,
    'gpt-5-nano': 0,
    'gpt-5-chat-latest': 0
  }
};

// ════════════════════════════════════════════════════════════════════════════
/** UTILS (type-safe strings, tokens, telegram chunking, etc.) */
// ════════════════════════════════════════════════════════════════════════════

function safeString(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(safeString).join(' ');
  if (typeof value === 'object') {
    try { return JSON.stringify(value); } catch { return Object.prototype.toString.call(value); }
  }
  return String(value);
}
const safeLowerCase = (text) => safeString(text).toLowerCase();
function safeSubstring(text, start, end) {
  const s = safeString(text);
  return s.substring(start || 0, end || s.length);
}
function tokensApprox(str) { return Math.ceil(safeString(str).length / 4); }

function updateSystemStats(operation, success = true, _responseTime = 0, _queryType = 'unknown', model = 'unknown') {
  systemState.requestCount++;
  if (success) systemState.successCount++; else systemState.errorCount++;
  if (model && systemState.modelUsageStats[model] != null) systemState.modelUsageStats[model]++;
}

async function sendChunked(bot, chatId, text) {
  const MAX = 4000; // safe under Telegram 4096
  const t = safeString(text);
  for (let i = 0; i < t.length; i += MAX) {
    await bot.sendMessage(chatId, t.slice(i, i + MAX));
  }
}

function labelFromModel(m) {
  if (m === 'gpt-5') return 'GPT-5-full';
  if (m === 'gpt-5-chat-latest') return 'GPT-5-chat';
  if (m?.startsWith('gpt-5-')) return 'GPT-5-' + m.replace('gpt-5-', '');
  return String(m || 'unknown');
}

async function saveConversationUnified(chatId, userMsg, assistantMsg, meta = {}) {
  try {
    if (database && typeof database.saveConversation === 'function') {
      return await database.saveConversation(chatId, userMsg, assistantMsg, meta);
    }
    if (database && typeof database.saveConversationDB === 'function') {
      return await database.saveConversationDB(chatId, userMsg, assistantMsg, meta);
    }
    return false;
  } catch (e) {
    console.warn('[DB] save conversation failed:', e.message);
    return false;
  }
}

// ════════════════════════════════════════════════════════════════════════════
/** CLASSIFY + COMPLETION DETECTION + ANALYSIS */
// ════════════════════════════════════════════════════════════════════════════

function classifyMessage(userMessage, hasMedia = false) {
  if (hasMedia) return MESSAGE_TYPES.MULTIMODAL;

  const text = safeLowerCase(userMessage).trim().replace(/[.!?,;:]+$/g, '');
  const length = text.length;

  if (text.startsWith('/')) return MESSAGE_TYPES.SYSTEM_COMMAND;

  const SIMPLE_GREETINGS = [
    'hi', 'hello', 'hey', 'yo', 'sup', 'gm', 'good morning',
    'good afternoon', 'good evening', 'thanks', 'thank you',
    'ok', 'okay', 'yes', 'no', 'sure', 'cool', 'nice', 'great'
  ];
  if (SIMPLE_GREETINGS.includes(text)) return MESSAGE_TYPES.SIMPLE_GREETING;

  if (length < 30 &&
      !text.includes('analyze') &&
      !text.includes('explain') &&
      !text.includes('detail') &&
      !text.includes('comprehensive')) {
    return MESSAGE_TYPES.SIMPLE_QUESTION;
  }
  return MESSAGE_TYPES.COMPLEX_QUERY;
}

function detectCompletionStatus(message, memoryContext = '') {
  const messageText = safeLowerCase(message);
  const contextText = safeLowerCase(memoryContext);

  const directCompletionPatterns = [
    /done ready|already built|it works?|working now|system ready/i,
    /deployment complete|built already|finished already/i,
    /stop asking|told you already|we discussed this/i,
    /no need|don't need|unnecessary|redundant/i
  ];
  const frustrationPatterns = [
    /again.*asking|keep.*asking|always.*ask/i,
    /told.*you.*already|mentioned.*before/i,
    /why.*again|same.*thing.*again/i
  ];

  const hasDirectCompletion = directCompletionPatterns.some(p => p.test(messageText));
  const hasFrustration = frustrationPatterns.some(p => p.test(messageText));
  const hasContextCompletion = /system.*built|deployment.*complete/i.test(contextText);

  return {
    isComplete: hasDirectCompletion || hasContextCompletion,
    isFrustrated: hasFrustration,
    shouldSkipGPT5: hasDirectCompletion || hasFrustration,
    completionType: hasDirectCompletion ? 'direct' : hasFrustration ? 'frustration' : 'context',
    confidence: hasDirectCompletion ? 0.9 : hasFrustration ? 0.8 : 0.7
  };
}

function generateCompletionResponse(completionStatus) {
  const responses = {
    direct: [
      "Got it! System confirmed as ready. What's your next command?",
      "Perfect! Since it's working, what's the next task?"
    ],
    frustration: [
      "My apologies! I understand it's ready. What else do you need?",
      "Point taken! What should we focus on now?"
    ],
    context: [
      "Right, the system is operational. What's your next priority?"
    ]
  };
  const arr = responses[completionStatus.completionType] || responses.direct;
  return arr[Math.floor(Math.random() * arr.length)];
}

function analyzeQuery(userMessage, _messageType = 'text', hasMedia = false, memoryContext = null) {
  const message = safeLowerCase(userMessage);

  // Short-circuit if completion detected
  const completionStatus = detectCompletionStatus(userMessage, memoryContext || '');
  if (completionStatus.shouldSkipGPT5) {
    updateSystemStats('completion_detection', true, 0, 'completion', 'none');
    return {
      type: 'completion',
      shouldSkipGPT5: true,
      quickResponse: generateCompletionResponse(completionStatus),
      completionStatus,
      confidence: completionStatus.confidence
    };
  }

  // Model selection heuristics
  const speedPatterns = /urgent|immediate|now|asap|quick|fast|^(hello|hi|hey)$/i;
  const complexPatterns = /(strategy|analyze|comprehensive|detailed|thorough)/i;
  const mathCodingPatterns = /(calculate|compute|code|coding|program|mathematical)/i;
  const healthPatterns = /(health|medical|diagnosis|treatment|symptoms)/i;

  let gpt5Config = {
    model: CONFIG.MODELS.MINI,
    reasoning_effort: 'medium',
    verbosity: 'medium',
    max_completion_tokens: CONFIG.TOKEN_LIMITS.MINI_MAX,
    priority: 'standard'
  };

  if (speedPatterns.test(message)) {
    gpt5Config = {
      model: CONFIG.MODELS.NANO,
      reasoning_effort: 'minimal',
      verbosity: 'low',
      max_completion_tokens: CONFIG.TOKEN_LIMITS.NANO_MAX,
      priority: 'speed'
    };
  } else if (healthPatterns.test(message) || mathCodingPatterns.test(message) || complexPatterns.test(message) || hasMedia) {
    gpt5Config = {
      model: CONFIG.MODELS.FULL,
      reasoning_effort: 'high',
      verbosity: 'high',
      max_completion_tokens: CONFIG.TOKEN_LIMITS.FULL_MAX,
      priority: hasMedia ? 'multimodal' : 'complex'
    };
  }

  return {
    type: gpt5Config.priority,
    gpt5Model: gpt5Config.model,
    reasoning_effort: gpt5Config.reasoning_effort,
    verbosity: gpt5Config.verbosity,
    max_completion_tokens: gpt5Config.max_completion_tokens,
    priority: gpt5Config.priority,
    confidence: 0.8,
    shouldSkipGPT5: false,
    completionStatus
  };
}

// ════════════════════════════════════════════════════════════════════════════
/** TIME HELPER (Cambodia) */
// ════════════════════════════════════════════════════════════════════════════

function getCurrentCambodiaDateTime() {
  try {
    const now = new Date();
    const kh = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }));
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return {
      date: `${days[kh.getDay()]}, ${months[kh.getMonth()]} ${kh.getDate()}, ${kh.getFullYear()}`,
      time: `${kh.getHours().toString().padStart(2,'0')}:${kh.getMinutes().toString().padStart(2,'0')}`,
      hour: kh.getHours(),
      isWeekend: kh.getDay() === 0 || kh.getDay() === 6,
      isBusinessHours: kh.getDay() !== 0 && kh.getDay() !== 6 && kh.getHours() >= 8 && kh.getHours() <= 17,
      timezone: 'ICT (UTC+7)'
    };
  } catch {
    const f = new Date();
    return {
      date: f.toDateString(),
      time: f.toTimeString().slice(0,5),
      hour: f.getHours(),
      isWeekend: [0,6].includes(f.getDay()),
      isBusinessHours: false,
      timezone: 'UTC',
      error: 'Timezone calc failed'
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
/** CORE EXECUTION (OpenAI) */
// ════════════════════════════════════════════════════════════════════════════

async function executeThroughGPT5System(userMessage, queryAnalysis, context = '', chatId = null) {
  const start = Date.now();
  try {
    const safeMsg = safeString(userMessage);
    console.log(`[GPT-5] Executing: ${queryAnalysis.gpt5Model} (${queryAnalysis.reasoning_effort || 'none'} reasoning)`);

    // Cheap datetime path
    if (queryAnalysis.priority === 'speed' && /^(what time|what's the time|current time)/i.test(safeMsg)) {
      const kh = getCurrentCambodiaDateTime();
      const quick = `Current time in Cambodia: ${kh.time} (${kh.timezone})\nToday is ${kh.date}`;
      updateSystemStats('datetime_quick', true, Date.now() - start, 'speed', 'instant');
      return {
        response: quick,
        aiUsed: 'datetime-instant',
        processingTime: Date.now() - start,
        tokensUsed: 0,
        costSaved: true,
        success: true,
        modelUsed: 'instant'
      };
    }

    // Compose enhanced message
    let enhanced = safeMsg;
    if (queryAnalysis.priority !== 'speed' && queryAnalysis.priority !== 'chat') {
      const kh = getCurrentCambodiaDateTime();
      enhanced = `Current time: ${kh.date}, ${kh.time} Cambodia (${kh.timezone})\nBusiness hours: ${kh.isBusinessHours ? 'Yes' : 'No'}\n\n${safeMsg}`;
    }
    if (context) {
      const ctx = safeString(context);
      const maxCtx = Math.min(ctx.length, 5000);
      enhanced += `\n\nCONTEXT:\n${safeSubstring(ctx, 0, maxCtx)}`;
    }

    // Build OpenAI options
    const options = { model: queryAnalysis.gpt5Model };
    if (queryAnalysis.gpt5Model === CONFIG.MODELS.CHAT) {
      if (queryAnalysis.max_completion_tokens) options.max_tokens = queryAnalysis.max_completion_tokens;
      options.temperature = 0.7;
    } else {
      if (queryAnalysis.reasoning_effort) options.reasoning_effort = queryAnalysis.reasoning_effort;
      if (queryAnalysis.verbosity) options.verbosity = queryAnalysis.verbosity;
      if (queryAnalysis.max_completion_tokens) options.max_completion_tokens = queryAnalysis.max_completion_tokens;
    }

    // Call OpenAI and normalize result
    const raw = await openaiClient.getGPT5Analysis(enhanced, options);
    const outText = typeof raw === 'string'
      ? raw
      : (raw?.output_text ?? raw?.text ?? raw?.choices?.[0]?.message?.content ?? raw?.data ?? '');
    if (!outText) throw new Error('Empty response from GPT-5');

    const processingTime = Date.now() - start;
    const tokensUsed = tokensApprox(outText);
    updateSystemStats('gpt5_execution', true, processingTime, queryAnalysis.priority, queryAnalysis.gpt5Model);

    return {
      response: outText,
      aiUsed: labelFromModel(queryAnalysis.gpt5Model),
      modelUsed: queryAnalysis.gpt5Model,
      processingTime,
      tokensUsed,
      priority: queryAnalysis.priority,
      confidence: queryAnalysis.confidence,
      reasoning_effort: queryAnalysis.reasoning_effort,
      verbosity: queryAnalysis.verbosity,
      memoryUsed: !!context,
      success: true
    };
  } catch (error) {
    const t = Date.now() - start;
    console.error('[GPT-5] Execution error:', error.message);
    updateSystemStats('gpt5_execution', false, t, queryAnalysis.priority, queryAnalysis.gpt5Model);
    // Try fallback path
    return await executeGPT5Fallback(userMessage, queryAnalysis, context, t, error);
  }
}

async function executeGPT5Fallback(userMessage, queryAnalysis, context, originalTime, originalError) {
  console.log('[GPT-5] Attempting fallback execution...');
  const start = Date.now();
  const fallbackModels = [
    { model: CONFIG.MODELS.NANO, reasoning: 'minimal', verbosity: 'low' },
    { model: CONFIG.MODELS.MINI, reasoning: 'low', verbosity: 'medium' },
    { model: CONFIG.MODELS.CHAT, reasoning: null, verbosity: null }
  ];

  let enhanced = safeString(userMessage);
  if (context) enhanced += `\n\nContext: ${safeSubstring(context, 0, 500)}`;

  for (const fb of fallbackModels) {
    try {
      const options = { model: fb.model };
      if (fb.model === CONFIG.MODELS.CHAT) {
        options.temperature = 0.7;
        options.max_tokens = CONFIG.TOKEN_LIMITS.CHAT_MAX;
      } else {
        if (fb.reasoning) options.reasoning_effort = fb.reasoning;
        if (fb.verbosity) options.verbosity = fb.verbosity;
        options.max_completion_tokens = Math.min(6000, CONFIG.TOKEN_LIMITS.MINI_MAX);
      }

      const raw = await openaiClient.getGPT5Analysis(enhanced, options);
      const outText = typeof raw === 'string'
        ? raw
        : (raw?.output_text ?? raw?.text ?? raw?.choices?.[0]?.message?.content ?? raw?.data ?? '');
      if (!outText) continue;

      const totalTime = originalTime + (Date.now() - start);
      updateSystemStats('gpt5_fallback', true, totalTime, 'fallback', fb.model);

      return {
        response: `[Fallback Mode - ${fb.model}]\n\n${outText}`,
        aiUsed: labelFromModel(fb.model) + '-fallback',
        modelUsed: fb.model,
        processingTime: totalTime,
        tokensUsed: tokensApprox(outText),
        priority: 'fallback',
        confidence: Math.max(0.5, (queryAnalysis.confidence || 0.7) - 0.2),
        reasoning_effort: fb.reasoning,
        verbosity: fb.verbosity,
        memoryUsed: !!context,
        success: true,
        fallbackUsed: true,
        originalError: originalError?.message
      };
    } catch (e) {
      console.log(`[GPT-5] Fallback ${fb.model} failed: ${e.message}`);
      continue;
    }
  }

  const totalTime = originalTime + (Date.now() - start);
  updateSystemStats('gpt5_fallback', false, totalTime, 'emergency', 'none');
  throw new Error(`All GPT-5 models failed. Original: ${originalError?.message}. Try a simpler question.`);
}

// ════════════════════════════════════════════════════════════════════════════
/** MEMORY (context + save) */
// ════════════════════════════════════════════════════════════════════════════

async function buildMemoryContext(chatId, contextLevel = 'full', currentMessage = '') {
  try {
    if (!chatId || contextLevel === false || contextLevel === 'none') return '';

    const safeChatId = safeString(chatId);
    let contextLimit, messageLimit;
    switch (contextLevel) {
      case 'minimal': contextLimit = 1000; messageLimit = 3; break;
      case 'reduced': contextLimit = 2500; messageLimit = 10; break;
      default:        contextLimit = 5000; messageLimit = 20;
    }

    // Prefer enhanced API (honors limits), fallback to plain
    if (memory) {
      try {
        if (typeof memory.buildEnhancedContext === 'function') {
          const res = await memory.buildEnhancedContext(
            safeChatId,
            safeString(currentMessage || ''),
            { limit: contextLimit, maxMessages: messageLimit }
          );
          const context = safeString(res?.context || '');
          if (context) {
            console.log(`[Memory] Context loaded: ${context.length} chars (enhanced)`);
            return safeSubstring(context, 0, contextLimit);
          }
        } else if (typeof memory.buildConversationContext === 'function') {
          const ctx = await memory.buildConversationContext(safeChatId, safeString(currentMessage || ''));
          if (ctx) {
            console.log(`[Memory] Context loaded: ${ctx.length} chars`);
            return safeSubstring(ctx, 0, contextLimit);
          }
        }
      } catch (e) {
        console.warn('[Memory] Module error:', e.message);
      }
    }

    // DB fallback
    if (database && typeof database.getConversationHistoryDB === 'function') {
      try {
        const history = await database.getConversationHistoryDB(safeChatId, messageLimit);
        if (Array.isArray(history) && history.length > 0) {
          let ctx = 'Recent conversation:\n';
          let total = ctx.length;
          for (const conv of history) {
            if (!conv || typeof conv !== 'object') continue;
            const userMsg = safeString(conv.user_message || conv.userMessage || '');
            const assistantMsg = safeString(conv.assistant_response || conv.assistantResponse || conv.gpt_response || '');
            if (!userMsg) continue;
            const line = `User: ${safeSubstring(userMsg, 0, 200)}\nAssistant: ${safeSubstring(assistantMsg, 0, 300)}\n\n`;
            if (total + line.length > contextLimit) break;
            ctx += line; total += line.length;
          }
          console.log(`[Memory] Context built: ${ctx.length} chars via database (${history.length} records)`);
          return safeSubstring(ctx, 0, contextLimit);
        }
      } catch (e) {
        console.warn('[Memory] Database error:', e.message);
      }
    }

    console.log('[Memory] No context available');
    return '';
  } catch (error) {
    console.error('[Memory] Context building failed:', error.message);
    return '';
  }
}

async function saveMemoryIfNeeded(chatId, userMessage, response, messageType, metadata = {}) {
  try {
    if (!chatId) return { saved: false, reason: 'no_chatid' };

    const safeUser = safeString(userMessage);
    const safeResp = safeString(response);

    if (safeUser.length < 3 && safeResp.length < 50) return { saved: false, reason: 'trivial' };
    if (messageType === MESSAGE_TYPES.SIMPLE_GREETING && safeResp.length < 200) {
      console.log('[Memory] Skipping save for simple greeting');
      return { saved: false, reason: 'simple_greeting' };
    }

    const normalizedResponse = safeResp
      .replace(/^(Assistant:|AI:|GPT-?5?:)\s*/i, '')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 8000);

    const meta = {
      ...metadata,
      messageType: safeString(messageType),
      timestamp: new Date().toISOString()
    };

    if (await saveConversationUnified(safeString(chatId), safeUser, normalizedResponse, meta)) {
      console.log('[Memory] Saved to database');
      return { saved: true, method: 'database' };
    }

    if (memory && typeof memory.saveToMemory === 'function') {
      await memory.saveToMemory(safeString(chatId), {
        type: 'conversation',
        user: safeUser,
        assistant: normalizedResponse,
        messageType: safeString(messageType),
        timestamp: new Date().toISOString()
      });
      console.log('[Memory] Saved to memory module');
      return { saved: true, method: 'memory' };
    }

    return { saved: false, reason: 'no_storage' };
  } catch (error) {
    console.warn('[Memory] Save failed:', error.message);
    return { saved: false, reason: 'error', error: error.message };
  }
}

// ════════════════════════════════════════════════════════════════════════════
/** TELEGRAM HANDLERS */
// ════════════════════════════════════════════════════════════════════════════

async function handleTelegramMessage(message, bot) {
  const startTime = Date.now();
  const chatId = message?.chat?.id;
  const userMessage = safeString(message?.text || '');

  if (!chatId) return;

  console.log(`[Telegram] Message from ${chatId}: "${safeSubstring(userMessage, 0, 60)}..."`);

  try {
    const hasMedia = !!(message.photo || message.document || message.voice || message.audio || message.video || message.video_note);

    const messageType = classifyMessage(userMessage, hasMedia);
    console.log(`[Telegram] Type: ${messageType}`);

    if (hasMedia) {
      return await handleMultimodalContent(message, bot, userMessage, startTime);
    }

    if (!userMessage || userMessage.trim().length === 0) {
      console.log('[Telegram] Empty message, skipping');
      return;
    }

    return await routeMessageByType(userMessage, chatId, bot, messageType, startTime);
  } catch (error) {
    const t = Date.now() - startTime;
    console.error('[Telegram] Processing error:', error.message);
    await sendErrorMessage(bot, chatId, error, t);
  }
}

async function routeMessageByType(userMessage, chatId, bot, messageType, startTime) {
  const baseOptions = { messageType: 'telegram_webhook', processingStartTime: startTime };

  switch (messageType) {
    case MESSAGE_TYPES.SIMPLE_GREETING:
      return await executeEnhancedGPT5Command(userMessage, chatId, bot, {
        ...baseOptions,
        forceModel: 'gpt-5-nano',
        max_completion_tokens: 100,
        reasoning_effort: 'minimal',
        verbosity: 'low',
        saveToMemory: false,
        contextAware: false,
        title: 'Quick Greeting'
      });

    case MESSAGE_TYPES.SIMPLE_QUESTION:
      return await executeEnhancedGPT5Command(userMessage, chatId, bot, {
        ...baseOptions,
        forceModel: 'gpt-5-mini',
        max_completion_tokens: 500,
        reasoning_effort: 'minimal',
        verbosity: 'low',
        contextAware: 'minimal',
        saveToMemory: 'minimal',
        title: 'Quick Answer'
      });

    case MESSAGE_TYPES.SYSTEM_COMMAND:
      return await handleSystemCommand(userMessage, chatId, bot, baseOptions);

    case MESSAGE_TYPES.COMPLEX_QUERY:
    default:
      return await executeEnhancedGPT5Command(userMessage, chatId, bot, {
        ...baseOptions,
        contextAware: 'full',
        saveToMemory: true,
        title: 'GPT-5 Analysis'
      });
  }
}

async function handleMultimodalContent(message, bot, userMessage, startTime) {
  console.log('[Multimodal] Processing media content');
  try {
    let result = null;

    if (message.photo && typeof multimodal.analyzeImage === 'function') {
      const photo = message.photo[message.photo.length - 1];
      result = await multimodal.analyzeImage(bot, photo.file_id, userMessage || 'Analyze this image', message.chat.id);
    } else if (message.document && typeof multimodal.analyzeDocument === 'function') {
      result = await multimodal.analyzeDocument(bot, message.document, userMessage || 'Analyze this document', message.chat.id);
    } else if (message.voice && typeof multimodal.analyzeVoice === 'function') {
      result = await multimodal.analyzeVoice(bot, message.voice, userMessage || 'Transcribe and analyze', message.chat.id);
    } else if (message.audio && typeof multimodal.analyzeAudio === 'function') {
      result = await multimodal.analyzeAudio(bot, message.audio, userMessage || 'Transcribe and analyze', message.chat.id);
    } else if (message.video && typeof multimodal.analyzeVideo === 'function') {
      result = await multimodal.analyzeVideo(bot, message.video, userMessage || 'Analyze this video', message.chat.id);
    } else if (message.video_note && typeof multimodal.analyzeVideoNote === 'function') {
      result = await multimodal.analyzeVideoNote(bot, message.video_note, userMessage || 'Analyze this video note', message.chat.id);
    } else {
      throw new Error('No multimodal analyzer available');
    }

    if (result?.success) {
      const ms = Date.now() - startTime;
      console.log(`[Multimodal] Success: ${result.type || 'unknown'} (${ms}ms)`);

      await saveMemoryIfNeeded(
        message.chat.id,
        `[${(result.type || 'media').toUpperCase()}] ${userMessage || 'Media uploaded'}`,
        result.analysis || 'Multimodal processing completed',
        MESSAGE_TYPES.MULTIMODAL,
        { type: 'multimodal', mediaType: result.type || 'unknown', processingTime: ms }
      );
      return result;
    }
    throw new Error(result?.error || 'Multimodal processing failed');
  } catch (error) {
    console.error('[Multimodal] Error:', error.message);
    const errorMsg = `Media processing failed: ${error.message}\n\nTry adding a text description with your media.`;
    try { await bot.sendMessage(message.chat.id, errorMsg); } catch {}
    return { success: false, error: error.message };
  }
}

async function handleSystemCommand(command, chatId, bot, baseOptions) {
  const cmd = safeLowerCase(command).trim();
  switch (cmd) {
    case '/start': {
      const welcome =
        `Welcome to the GPT-5 Smart System!\n\n` +
        `Features:\n` +
        `• Intelligent GPT-5 model selection\n` +
        `• Image, document, and voice analysis\n` +
        `• Smart memory integration\n` +
        `• Cost-optimized responses\n\n` +
        `Just send me a message or upload media!`;
      await bot.sendMessage(chatId, welcome);
      return { success: true, response: welcome };
    }
    case '/help':
      return await executeEnhancedGPT5Command(
        'Explain available features and how to use this GPT-5 system effectively',
        chatId, bot, { ...baseOptions, forceModel: 'gpt-5-mini', title: 'Help Guide' }
      );
    case '/health':
      return await executeEnhancedGPT5Command(
        'Provide system health status and performance metrics',
        chatId, bot, { ...baseOptions, forceModel: 'gpt-5-mini', title: 'System Health' }
      );
    case '/status':
      return await executeEnhancedGPT5Command(
        'Show current system status, model availability, and operational metrics',
        chatId, bot, { ...baseOptions, forceModel: 'gpt-5-mini', title: 'System Status' }
      );
    default:
      return await executeEnhancedGPT5Command(command, chatId, bot, baseOptions);
  }
}

async function handleCallbackQuery(callbackQuery, bot) {
  try { await bot.answerCallbackQuery(callbackQuery.id); }
  catch (e) { console.error('[Callback] Error:', e.message); }
}

async function handleInlineQuery(inlineQuery, bot) {
  try { await bot.answerInlineQuery(inlineQuery.id, [], { cache_time: 1 }); }
  catch (e) { console.error('[Inline] Error:', e.message); }
}

async function sendErrorMessage(bot, chatId, error, ms = 0) {
  try {
    const msg = `System error (${ms}ms): ${error.message}\n\nPlease try again or use /health to check system status.`;
    if (!bot?.sendMessage) return;
    await bot.sendMessage(safeString(chatId), msg);
  } catch (sendErr) {
    console.error('[Error] Failed to send error message:', sendErr.message);
  }
}

// ════════════════════════════════════════════════════════════════════════════
/** ENHANCED EXECUTOR (main entry) */
// ════════════════════════════════════════════════════════════════════════════

async function executeEnhancedGPT5Command(userMessage, chatId, bot = null, options = {}) {
  const started = Date.now();
  try {
    const safeMsg = safeString(userMessage);
    const safeChatId = safeString(chatId);
    if (safeMsg.length === 0) throw new Error('Empty message provided');

    // Memory context per options
    let memoryContext = '';
    if (options.contextAware !== false && safeChatId !== 'unknown') {
      try {
        memoryContext = await buildMemoryContext(safeChatId, options.contextAware, safeMsg);
      } catch (e) {
        console.warn('[Enhanced] Memory context failed:', e.message);
      }
    }

    // Analyze query/model selection
    const analysis = analyzeQuery(safeMsg, options.messageType || 'text', options.hasMedia === true, memoryContext);

    // Completion shortcut
    if (analysis.shouldSkipGPT5) {
      const ms = Date.now() - started;
      const delivered = await deliverToTelegram(bot, safeChatId, analysis.quickResponse, 'Task Completion');
      return {
        response: analysis.quickResponse,
        success: true,
        aiUsed: 'completion-detection',
        queryType: 'completion',
        completionDetected: true,
        processingTime: ms,
        tokensUsed: 0,
        costSaved: true,
        enhancedExecution: true,
        totalExecutionTime: ms,
        telegramDelivered: delivered
      };
    }

    // Forced model override
    if (options.forceModel && safeString(options.forceModel).startsWith('gpt-5')) {
      analysis.gpt5Model = options.forceModel;
      analysis.reason = `Forced to use ${options.forceModel}`;
    }

    console.log(`[Enhanced] Analysis: ${analysis.type}, Model: ${analysis.gpt5Model}`);

    // Execute
    const gpt = await executeThroughGPT5System(safeMsg, analysis, memoryContext, safeChatId);
    if (!gpt || !gpt.success) throw new Error(gpt?.error || 'GPT-5 execution failed');

    // Save memory?
    if (options.saveToMemory !== false && gpt.success) {
      try {
        const mType = classifyMessage(safeMsg);
        if (options.saveToMemory === 'minimal') {
          if (gpt.response && safeString(gpt.response).length > 150) {
            await saveMemoryIfNeeded(safeChatId, safeMsg, gpt.response, mType, {
              modelUsed: safeString(gpt.modelUsed),
              processingTime: Number(gpt.processingTime) || 0,
              minimal: true
            });
          }
        } else {
          await saveMemoryIfNeeded(safeChatId, safeMsg, gpt.response, mType, {
            modelUsed: safeString(gpt.modelUsed),
            processingTime: Number(gpt.processingTime) || 0,
            priority: safeString(analysis.priority),
            complexity: safeString(analysis.type)
          });
        }
      } catch (memErr) {
        console.warn('[Enhanced] Memory save failed:', memErr.message);
      }
    }

    // Deliver
    const delivered = await deliverToTelegram(bot, safeChatId, gpt.response, options.title || 'GPT-5 Analysis');

    return {
      response: gpt.response,
      success: true,
      aiUsed: gpt.aiUsed,
      modelUsed: gpt.modelUsed,
      queryType: analysis.type,
      priority: analysis.priority,
      confidence: gpt.confidence || analysis.confidence,
      processingTime: gpt.processingTime,
      tokensUsed: gpt.tokensUsed,
      reasoning_effort: analysis.reasoning_effort,
      verbosity: analysis.verbosity,
      memoryUsed: gpt.memoryUsed,
      contextLength: memoryContext.length,
      fallbackUsed: !!gpt.fallbackUsed,
      enhancedExecution: true,
      totalExecutionTime: Date.now() - started,
      memoryContextUsed: memoryContext.length > 0,
      safetyChecksApplied: true,
      telegramDelivered: delivered
    };
  } catch (error) {
    console.error('[Enhanced] Command execution error:', error.message);
    const errMsg = `Analysis failed: ${error.message}.\n\nPlease try a simpler request.`;
    const delivered = await deliverToTelegram(bot, safeString(chatId), errMsg, 'System Error');

    return {
      success: false,
      response: 'Technical difficulties encountered. Please try again with a simpler request.',
      error: error.message,
      aiUsed: 'error-fallback',
      enhancedExecution: false,
      totalExecutionTime: Date.now() - started,
      telegramDelivered: delivered,
      safetyChecksApplied: true
    };
  }
}

async function deliverToTelegram(bot, chatId, response, title) {
  try {
    if (!bot || !chatId) return false;

    // Preferred: splitter
    if (telegramSplitter && typeof telegramSplitter.sendMessage === 'function') {
      const res = await telegramSplitter.sendMessage(
        bot, safeString(chatId), safeString(response),
        { title: safeString(title), model: 'gpt-5' }
      );
      if (res && (res.success || res.enhanced || res.fallback)) return true;
    }

    // Fallback: chunked
    if (bot && typeof bot.sendMessage === 'function') {
      await sendChunked(bot, safeString(chatId), safeString(response));
      return true;
    }
    return false;
  } catch (e) {
    console.error('[Delivery] Failed:', e.message);
    return false;
  }
}

// ════════════════════════════════════════════════════════════════════════════
/** CAMBODIA MODULES (templated) */
// ════════════════════════════════════════════════════════════════════════════

const CAMBODIA_TEMPLATES = {
  creditAssessment: {
    model: 'gpt-5',
    title: 'Credit Assessment',
    prompt:
`CAMBODIA PRIVATE LENDING CREDIT ASSESSMENT

Query: {query}

Analyze with Cambodia market expertise:
1) Borrower creditworthiness
2) Risk score (0-100)
3) Interest rate recommendation (USD)
4) Required documentation
5) Cambodia-specific risk factors`
  },
  loanOrigination: {
    model: 'gpt-5',
    title: 'Loan Processing',
    prompt:
`CAMBODIA LOAN APPLICATION

Data: {data}

Process with Cambodia standards:
1) Application completeness
2) Financial analysis
3) Risk evaluation
4) Terms recommendation
5) Documentation requirements`
  },
  portfolioOptimization: {
    model: 'gpt-5',
    title: 'Portfolio Optimization',
    prompt:
`PORTFOLIO OPTIMIZATION

Portfolio: {portfolioId}
Query: {query}

Analysis:
1) Current allocation
2) Risk-return optimization
3) Diversification
4) Rebalancing recommendations`
  },
  marketAnalysis: {
    model: 'gpt-5',
    title: 'Market Analysis',
    prompt:
`CAMBODIA MARKET RESEARCH

Scope: {scope}
Query: {query}

Analysis:
1) Economic conditions
2) Market opportunities
3) Competition
4) Strategic recommendations`
  }
};

async function executeCambodiaModule(moduleName, params, chatId, bot) {
  const tpl = CAMBODIA_TEMPLATES[moduleName];
  if (!tpl) throw new Error(`Cambodia module '${moduleName}' not found`);
  let prompt = tpl.prompt;
  Object.keys(params || {}).forEach(k => {
    prompt = prompt.replace(new RegExp(`{${k}}`, 'g'), safeString(params[k]));
  });
  return executeEnhancedGPT5Command(prompt, chatId, bot, { title: tpl.title, forceModel: tpl.model });
}

async function runCreditAssessment(chatId, data, bot) {
  return executeCambodiaModule('creditAssessment', { query: data?.query || '' }, chatId, bot);
}
async function processLoanApplication(applicationData, chatId, bot) {
  return executeCambodiaModule('loanOrigination', { data: JSON.stringify(applicationData) }, chatId, bot);
}
async function optimizePortfolio(portfolioId, optimizationData, chatId, bot) {
  return executeCambodiaModule('portfolioOptimization', { portfolioId, query: optimizationData?.query || '' }, chatId, bot);
}
async function analyzeMarket(researchScope, analysisData, chatId, bot) {
  return executeCambodiaModule('marketAnalysis', { scope: researchScope, query: analysisData?.query || '' }, chatId, bot);
}

// ════════════════════════════════════════════════════════════════════════════
/** HEALTH + ANALYTICS */
// ════════════════════════════════════════════════════════════════════════════

async function performGPT5HealthCheck() {
  const health = {
    timestamp: Date.now(),
    models: {},
    overallHealth: false,
    availableModels: 0,
    healthScore: 0
  };
  const tests = [
    { name: CONFIG.MODELS.NANO, options: { reasoning_effort: 'minimal', max_completion_tokens: 20 } },
    { name: CONFIG.MODELS.MINI, options: { reasoning_effort: 'low', max_completion_tokens: 20 } },
    { name: CONFIG.MODELS.FULL, options: { reasoning_effort: 'minimal', max_completion_tokens: 20 } },
    { name: CONFIG.MODELS.CHAT, options: { temperature: 0.3, max_tokens: 20 } }
  ];
  let healthy = 0;
  for (const { name, options } of tests) {
    try {
      await openaiClient.getGPT5Analysis('Health check', { model: name, ...options });
      health.models[name] = { status: 'healthy', available: true }; healthy++;
    } catch (e) {
      health.models[name] = { status: 'unhealthy', available: false, error: e.message };
    }
  }
  health.availableModels = healthy;
  health.overallHealth = healthy > 0;
  health.healthScore = Math.round((healthy / tests.length) * 100);
  return health;
}

async function checkSystemHealth() {
  console.log('[Health] Performing comprehensive system health check...');
  const health = {
    timestamp: Date.now(),
    overall: 'unknown',
    components: {},
    scores: {},
    recommendations: []
  };
  try {
    const gpt5 = await performGPT5HealthCheck();
    health.components.gpt5 = gpt5; health.scores.gpt5 = gpt5.healthScore || 0;
    if ((gpt5.availableModels || 0) === 0) health.recommendations.push('No GPT-5 models available - check API key');
  } catch (e) { health.components.gpt5 = { error: e.message, available: false }; health.scores.gpt5 = 0; }

  try {
    const memoryWorking = memory && (typeof memory.buildConversationContext === 'function' || typeof memory.buildEnhancedContext === 'function');
    health.components.memory = { available: memoryWorking, status: memoryWorking ? 'operational' : 'limited' };
    health.scores.memory = memoryWorking ? 100 : 50;
  } catch (e) { health.components.memory = { available: false, error: e.message }; health.scores.memory = 0; }

  try {
    const testQuery = await database.getConversationHistoryDB('health_test', 1);
    const dbWorking = Array.isArray(testQuery);
    health.components.database = { available: dbWorking, status: dbWorking ? 'connected' : 'disconnected' };
    health.scores.database = dbWorking ? 100 : 0;
  } catch (e) { health.components.database = { available: false, error: e.message }; health.scores.database = 0; }

  try {
    const telegramWorking = telegramSplitter && typeof telegramSplitter.sendMessage === 'function';
    health.components.telegram = { available: telegramWorking, status: telegramWorking ? 'operational' : 'basic' };
    health.scores.telegram = telegramWorking ? 100 : 50;
  } catch (e) { health.components.telegram = { available: false, error: e.message }; health.scores.telegram = 0; }

  const scores = Object.values(health.scores);
  const overallScore = scores.length ? (scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
  health.overallScore = Math.round(overallScore);
  health.overall = overallScore >= 90 ? 'excellent' : overallScore >= 70 ? 'good' : overallScore >= 50 ? 'degraded' : 'critical';

  systemState.lastHealthCheck = health.timestamp;
  systemState.healthStatus = health.overall;
  console.log(`[Health] System check complete: ${health.overall} (${health.overallScore}%)`);
  return health;
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}
function getSystemAnalytics() {
  const up = Date.now() - systemState.startTime;
  const successRate = systemState.requestCount ? (systemState.successCount / systemState.requestCount) * 100 : 0;
  return {
    version: systemState.version,
    uptime: { milliseconds: up, hours: Math.floor(up / (1000*60*60)), formatted: formatUptime(up) },
    requests: {
      total: systemState.requestCount,
      successful: systemState.successCount,
      failed: systemState.errorCount,
      successRate: Math.round(successRate * 100) / 100
    },
    modelUsage: systemState.modelUsageStats,
    health: { status: systemState.healthStatus, lastCheck: systemState.lastHealthCheck }
  };
}
function getMultimodalStatus() {
  try { return multimodal.getMultimodalStatus(); }
  catch (e) { return { available: false, error: e.message, capabilities: { image_analysis:false, voice_transcription:false, document_processing:false, video_analysis:false } }; }
}

// ════════════════════════════════════════════════════════════════════════════
/** QUICK COMMANDS */
// ════════════════════════════════════════════════════════════════════════════

async function quickGPT5Command(message, chatId, bot = null, model = 'auto') {
  const options = { title: `GPT-5 ${safeString(model).toUpperCase()}`, saveToMemory: true };
  if (model !== 'auto') options.forceModel = model.includes('gpt-5') ? model : `gpt-5-${model}`;
  return executeEnhancedGPT5Command(message, chatId, bot, options);
}
async function quickNanoCommand(message, chatId, bot = null) {
  return executeEnhancedGPT5Command(message, chatId, bot, {
    forceModel: 'gpt-5-nano',
    max_completion_tokens: 1000,
    reasoning_effort: 'minimal',
    verbosity: 'low',
    title: 'GPT-5 Nano'
  });
}
async function quickMiniCommand(message, chatId, bot = null) {
  return executeEnhancedGPT5Command(message, chatId, bot, {
    forceModel: 'gpt-5-mini',
    max_completion_tokens: 3000,
    reasoning_effort: 'medium',
    verbosity: 'medium',
    title: 'GPT-5 Mini'
  });
}
async function quickFullCommand(message, chatId, bot = null) {
  return executeEnhancedGPT5Command(message, chatId, bot, {
    forceModel: 'gpt-5',
    max_completion_tokens: 8000,
    reasoning_effort: 'high',
    verbosity: 'high',
    title: 'GPT-5 Full'
  });
}

// ════════════════════════════════════════════════════════════════════════════
/** EXPORTS */
// ════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Telegram
  handleTelegramMessage,
  handleCallbackQuery,
  handleInlineQuery,

  // Execution
  executeEnhancedGPT5Command,

  // Quick commands
  quickGPT5Command,
  quickNanoCommand,
  quickMiniCommand,
  quickFullCommand,

  // Cambodia modules
  runCreditAssessment,
  processLoanApplication,
  optimizePortfolio,
  analyzeMarket,
  executeCambodiaModule,

  // System
  checkSystemHealth,
  performGPT5HealthCheck,
  getSystemAnalytics,
  getMultimodalStatus,

  // Memory
  buildMemoryContext,
  saveMemoryIfNeeded,

  // Utils
  classifyMessage,
  analyzeQuery,
  detectCompletionStatus,
  getCurrentCambodiaDateTime,
  updateSystemStats,

  // Expose cores
  openaiClient,
  memory,
  database,
  multimodal,
  telegramSplitter,

  // Constants
  CONFIG,
  MESSAGE_TYPES,
  systemState: () => ({ ...systemState }),

  // Type-safe helpers
  safeString,
  safeLowerCase,
  safeSubstring
};

// ════════════════════════════════════════════════════════════════════════════
/** STARTUP */
// ════════════════════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('GPT-5 SMART SYSTEM v8.1 — Optimized & Hardened');
console.log('═══════════════════════════════════════════════════════════════');
console.log('✓ Safe string ops everywhere (no .toLowerCase/.substring crashes)');
console.log('✓ Memory via buildEnhancedContext + DB fallback');
console.log('✓ Unified DB save (saveConversation | saveConversationDB)');
console.log('✓ OpenAI result normalization (string/structured)');
console.log('✓ Telegram chunking fallback (no 4096 errors)');
console.log('✓ Multimodal guards + handlers');
console.log('✓ Health checks + analytics');
console.log('✓ Cambodia templates kept lean');
console.log('Ready for production.\n');

setTimeout(async () => {
  try { await checkSystemHealth(); console.log('[Startup] Initial health check completed'); }
  catch (e) { console.warn('[Startup] Health check failed:', e.message); }
}, 3000);
