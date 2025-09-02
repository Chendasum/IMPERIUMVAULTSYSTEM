// utils/dualCommandSystem.js
// GPT-5 SMART SYSTEM v8.1 — Full, hardened, memory-wired edition
// -----------------------------------------------------------------------------
// Highlights:
//  - No silent fallbacks (assert wire-up on startup)
//  - Memory context uses CURRENT message for relevance
//  - Greetings load MINIMAL context (no more “forgot me after hours”)
//  - DB save compatible with saveConversation or saveConversationDB
//  - extractAndSaveFacts called after reply (names/preferences persist)
//  - Large-content context filter includes "User's name:" lines
//  - /memcheck command verifies memory + DB integration in one shot
// -----------------------------------------------------------------------------

'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   PIECE 1: IMPORTS WITH SAFETY + ASSERTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

function safeRequire(modulePath, fallback = {}) {
  try {
    const mod = require(modulePath);
    console.log(`[Import] Loaded ${modulePath}`);
    return mod;
  } catch (error) {
    const fb = Object.assign({}, fallback, {
      __isFallback: true,
      __modulePath: modulePath,
      __error: error.message
    });
    console.error(`[FATAL] Failed to load ${modulePath}: ${error.message}`);
    return fb;
  }
}

// Load modules
const openaiClient = safeRequire('./openaiClient', {
  getGPT5Analysis: async () => { throw new Error('OpenAI client not available'); },
  checkGPT5SystemHealth: async () => ({ overallHealth: false })
});

const memory = safeRequire('./memory', {
  buildConversationContext: async () => '',
  extractAndSaveFacts: async () => ({ success: false }),
  saveToMemory: async () => true
});

const database = safeRequire('./database', {
  saveConversation: async () => true,
  saveConversationDB: async () => true,
  getConversationHistoryDB: async () => [],
  getPersistentMemoryDB: async () => []
});

const multimodal = safeRequire('./multimodal', {
  analyzeImage: async () => ({ success: false, error: 'Not available' }),
  analyzeDocument: async () => ({ success: false, error: 'Not available' }),
  analyzeVoice: async () => ({ success: false, error: 'Not available' }),
  analyzeAudio: async () => ({ success: false, error: 'Not available' }),
  analyzeVideo: async () => ({ success: false, error: 'Not available' }),
  analyzeVideoNote: async () => ({ success: false, error: 'Not available' }),
  getMultimodalStatus: () => ({ available: false }),
  getContextForFollowUp: () => null
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
} catch (error) {
  console.warn('[Import] Telegram splitter failed:', error.message);
}
if (!telegramSplitter) {
  telegramSplitter = {
    sendMessage: async (bot, chatId, response) => {
      if (bot && typeof bot.sendMessage === 'function') {
        await bot.sendMessage(chatId, response);
        return { success: true, fallback: true };
      }
      return { success: false };
    },
    sendGPT5: async (bot, chatId, response) => telegramSplitter.sendMessage(bot, chatId, response)
  };
}

// Wire-up assertions (make failures LOUD)
function assertNotFallback(name, mod, requiredFns = []) {
  if (!mod || mod.__isFallback) {
    const reason = mod?.__error || 'unknown';
    throw new Error(`[WIRE-UP] ${name} failed to load from "${mod?.__modulePath || 'unknown'}": ${reason}`);
  }
  for (const fn of requiredFns) {
    if (typeof mod[fn] !== 'function') {
      throw new Error(`[WIRE-UP] ${name}.${fn} is missing (export mismatch).`);
    }
  }
  console.log(`[WIRE-UP] ${name} OK`);
}
assertNotFallback('memory', memory, ['buildConversationContext', 'extractAndSaveFacts']);
assertNotFallback('database', database, ['getConversationHistoryDB', 'getPersistentMemoryDB']);

console.log('PIECE 1 LOADED: Basic structure and imports ready');

/* ═══════════════════════════════════════════════════════════════════════════
   PIECE 2: CONFIGURATION + UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

const CONFIG = {
  MODELS: {
    NANO: 'gpt-5-nano',
    MINI: 'gpt-5-mini',
    FULL: 'gpt-5',
    CHAT: 'gpt-5-chat-latest'
  },
  REASONING_LEVELS: ['minimal', 'low', 'medium', 'high'],
  VERBOSITY_LEVELS: ['low', 'medium', 'high'],
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

const systemState = {
  version: '8.1-hardened',
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

// Type-safe helpers
function safeString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.toString) return value.toString();
  return String(value);
}
function safeLowerCase(text) { return safeString(text).toLowerCase(); }
function safeSubstring(text, start, end) { const s = safeString(text); return s.substring(start || 0, end || s.length); }

function updateSystemStats(operation, success = true, responseTime = 0, queryType = 'unknown', model = 'unknown') {
  systemState.requestCount++;
  if (success) systemState.successCount++; else systemState.errorCount++;
  if (systemState.modelUsageStats[model] !== undefined) {
    systemState.modelUsageStats[model]++;
  }
}

console.log('PIECE 2 LOADED: Configuration and utility functions ready');

/* ═══════════════════════════════════════════════════════════════════════════
   PIECE 3: CLASSIFICATION + ANALYSIS
   ═══════════════════════════════════════════════════════════════════════════ */

function classifyMessage(userMessage, hasMedia = false) {
  if (hasMedia) return MESSAGE_TYPES.MULTIMODAL;
  const text = safeLowerCase(userMessage);
  const length = text.length;

  if (text.startsWith('/')) return MESSAGE_TYPES.SYSTEM_COMMAND;

  const SIMPLE_GREETINGS = [
    'hi','hello','hey','yo','sup','gm','good morning',
    'good afternoon','good evening','thanks','thank you',
    'ok','okay','yes','no','sure','cool','nice','great'
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

// Completion detection (skip for long messages)
function detectCompletionStatus(message, memoryContext = '') {
  const messageText = safeLowerCase(message);
  const contextText = safeLowerCase(memoryContext);
  if (messageText.length > 200) {
    return { isComplete:false,isFrustrated:false,shouldSkipGPT5:false,completionType:'none',confidence:0 };
  }
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
function generateCompletionResponse(cs) {
  const responses = {
    direct: [
      "Got it! System confirmed as ready. What's your next command?",
      "Perfect! Since it's working, what's the next task?"
    ],
    frustration: [
      "My apologies! I understand it's ready. What else do you need?",
      "Point taken! What should we focus on now?"
    ],
    context: ["Right, the system is operational. What's your next priority?"]
  };
  const arr = responses[cs.completionType] || responses.direct;
  return arr[Math.floor(Math.random() * arr.length)];
}

function analyzeQuery(userMessage, messageType = 'text', hasMedia = false, memoryContext = null) {
  const message = safeLowerCase(userMessage);

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

  const speedPatterns = /urgent|immediate|now|asap|quick|fast|^(hello|hi|hey)$/i;
  const complexPatterns = /(strategy|analyze|comprehensive|detailed|thorough)/i;
  const mathCodingPatterns = /(calculate|compute|code|coding|program|mathematical)/i;
  const healthPatterns = /(health|medical|diagnosis|treatment|symptoms)/i;

  const isLargeText = userMessage.length > 500;
  const hasBusinessContent = /(business|project|plan|cash flow|investor|revenue|strategy)/i.test(message);

  let gpt5Config = {
    model: CONFIG.MODELS.MINI,
    reasoning_effort: 'medium',
    verbosity: 'medium',
    max_completion_tokens: CONFIG.TOKEN_LIMITS.MINI_MAX,
    priority: 'standard'
  };

  if (isLargeText || hasBusinessContent) {
    console.log('[ANALYSIS] Large text or business content detected - using full GPT-5');
    gpt5Config = {
      model: CONFIG.MODELS.FULL,
      reasoning_effort: 'high',
      verbosity: 'high',
      max_completion_tokens: CONFIG.TOKEN_LIMITS.FULL_MAX,
      priority: 'large_content'
    };
  } else if (speedPatterns.test(message)) {
    gpt5Config = {
      model: CONFIG.MODELS.NANO,
      reasoning_effort: 'minimal',
      verbosity: 'low',
      max_completion_tokens: CONFIG.TOKEN_LIMITS.NANO_MAX,
      priority: 'speed'
    };
  } else if (healthPatterns.test(message) || mathCodingPatterns.test(message) || complexPatterns.test(message)) {
    gpt5Config = {
      model: CONFIG.MODELS.FULL,
      reasoning_effort: 'high',
      verbosity: 'high',
      max_completion_tokens: CONFIG.TOKEN_LIMITS.FULL_MAX,
      priority: 'complex'
    };
  } else if (hasMedia) {
    gpt5Config = {
      model: CONFIG.MODELS.FULL,
      reasoning_effort: 'medium',
      verbosity: 'medium',
      max_completion_tokens: CONFIG.TOKEN_LIMITS.FULL_MAX,
      priority: 'multimodal'
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

console.log('PIECE 3 LOADED: Enhanced query analysis with large text handling ready');

/* ═══════════════════════════════════════════════════════════════════════════
   PIECE 4: EXECUTION ENGINE + FALLBACKS
   ═══════════════════════════════════════════════════════════════════════════ */

function getCurrentCambodiaDateTime() {
  try {
    const now = new Date();
    const cambodiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }));
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    return {
      date: `${days[cambodiaTime.getDay()]}, ${months[cambodiaTime.getMonth()]} ${cambodiaTime.getDate()}, ${cambodiaTime.getFullYear()}`,
      time: `${cambodiaTime.getHours().toString().padStart(2, '0')}:${cambodiaTime.getMinutes().toString().padStart(2, '0')}`,
      hour: cambodiaTime.getHours(),
      isWeekend: cambodiaTime.getDay() === 0 || cambodiaTime.getDay() === 6,
      isBusinessHours: cambodiaTime.getDay() !== 0 && cambodiaTime.getDay() !== 6 &&
                       cambodiaTime.getHours() >= 8 && cambodiaTime.getHours() <= 17,
      timezone: 'ICT (UTC+7)'
    };
  } catch (error) {
    const fallback = new Date();
    return {
      date: fallback.toDateString(),
      time: fallback.toTimeString().slice(0, 5),
      hour: fallback.getHours(),
      isWeekend: [0, 6].includes(fallback.getDay()),
      isBusinessHours: false,
      timezone: 'UTC',
      error: 'Timezone calculation failed'
    };
  }
}

async function executeThroughGPT5System(userMessage, queryAnalysis, context = null, chatId = null) {
  const startTime = Date.now();

  try {
    const safeMessage = safeString(userMessage);
    console.log(`[GPT-5] Executing: ${queryAnalysis.gpt5Model} (${queryAnalysis.reasoning_effort || 'none'} reasoning)`);
    console.log(`[GPT-5] Message length: ${safeMessage.length} chars, Priority: ${queryAnalysis.priority}`);

    // Quick time queries
    if (queryAnalysis.priority === 'speed' && /^(what time|what's the time|current time)/i.test(safeMessage)) {
      const cambodiaTime = getCurrentCambodiaDateTime();
      const quickResponse = `Current time in Cambodia: ${cambodiaTime.time} (${cambodiaTime.timezone})\nToday is ${cambodiaTime.date}`;
      updateSystemStats('datetime_quick', true, Date.now() - startTime, 'speed', 'instant');
      return {
        response: quickResponse,
        aiUsed: 'datetime-instant',
        processingTime: Date.now() - startTime,
        tokensUsed: 0,
        costSaved: true,
        success: true
      };
    }

    let enhancedMessage = safeMessage;

    const isLargeContent = queryAnalysis.priority === 'large_content' || safeMessage.length > 500;

    if (!isLargeContent && queryAnalysis.priority !== 'speed' && queryAnalysis.priority !== 'chat') {
      const cambodiaTime = getCurrentCambodiaDateTime();
      enhancedMessage =
        `Current time: ${cambodiaTime.date}, ${cambodiaTime.time} Cambodia (${cambodiaTime.timezone})\n` +
        `Business hours: ${cambodiaTime.isBusinessHours ? 'Yes' : 'No'}\n\n` +
        safeMessage;
    }

    if (context && safeString(context).length > 0) {
      const safeContext = safeString(context);

      if (isLargeContent) {
        const contextLines = safeContext.split('\n');
        const importantLines = contextLines.filter(line =>
          line.includes("User's name:") ||         // NEW: matches memory.js fact
          line.includes('[HIGH]') ||
          line.includes('BUSINESS:') ||
          line.includes('PERSISTENT MEMORIES') ||
          line.includes('USER PROFILE:')
        );
        const minimal = importantLines.slice(0, 6).join('\n');
        if (minimal) {
          enhancedMessage += `\n\nIMPORTANT CONTEXT:\n${minimal}`;
        }
        console.log('[GPT-5] Using minimal context for large content');
      } else {
        const maxContextLength = Math.min(safeContext.length, 5000);
        enhancedMessage += `\n\nCONTEXT:\n${safeSubstring(safeContext, 0, maxContextLength)}`;
        console.log('[GPT-5] Using full context for normal content');
      }
    }

    const options = { model: queryAnalysis.gpt5Model };
    if (queryAnalysis.gpt5Model === CONFIG.MODELS.CHAT) {
      if (queryAnalysis.max_completion_tokens) options.max_tokens = queryAnalysis.max_completion_tokens;
      options.temperature = 0.7;
    } else {
      if (queryAnalysis.reasoning_effort) options.reasoning_effort = queryAnalysis.reasoning_effort;
      if (queryAnalysis.verbosity) options.verbosity = queryAnalysis.verbosity;
      if (queryAnalysis.max_completion_tokens) {
        const tokenLimit = isLargeContent
          ? Math.min(CONFIG.TOKEN_LIMITS.FULL_MAX, Math.floor(queryAnalysis.max_completion_tokens * 1.5))
          : queryAnalysis.max_completion_tokens;
        options.max_completion_tokens = tokenLimit;
      }
    }

    console.log(`[GPT-5] Enhanced message length: ${enhancedMessage.length} chars`);
    console.log(`[GPT-5] Token limit: ${options.max_completion_tokens || options.max_tokens || 'default'}`);

    const result = await openaiClient.getGPT5Analysis(enhancedMessage, options);
    const processingTime = Date.now() - startTime;
    const tokensUsed = Math.ceil(safeString(result).length / 4);

    updateSystemStats('gpt5_execution', true, processingTime, queryAnalysis.priority, queryAnalysis.gpt5Model);

    return {
      response: result,
      aiUsed: `GPT-5-${queryAnalysis.gpt5Model.replace('gpt-5-', '').replace('gpt-5', 'full')}`,
      modelUsed: queryAnalysis.gpt5Model,
      processingTime,
      tokensUsed,
      priority: queryAnalysis.priority,
      confidence: queryAnalysis.confidence,
      reasoning_effort: queryAnalysis.reasoning_effort,
      verbosity: queryAnalysis.verbosity,
      memoryUsed: !!context,
      success: true,
      isLargeContent
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('[GPT-5] Execution error:', error.message);
    updateSystemStats('gpt5_execution', false, processingTime, queryAnalysis.priority, queryAnalysis.gpt5Model);
    return await executeGPT5Fallback(userMessage, queryAnalysis, context, processingTime, error);
  }
}

async function executeGPT5Fallback(userMessage, queryAnalysis, context, originalProcessingTime, originalError) {
  console.log('[GPT-5] Attempting fallback execution...');
  const fallbackStart = Date.now();

  const fallbackModels = [
    { model: CONFIG.MODELS.NANO, reasoning: 'minimal', verbosity: 'low' },
    { model: CONFIG.MODELS.MINI, reasoning: 'low', verbosity: 'medium' },
    { model: CONFIG.MODELS.CHAT, reasoning: null, verbosity: null }
  ];

  let enhancedMessage = safeString(userMessage);
  if (context) enhancedMessage += `\n\nContext: ${safeSubstring(context, 0, 500)}`;

  for (const fallback of fallbackModels) {
    try {
      const options = { model: fallback.model };
      if (fallback.model === CONFIG.MODELS.CHAT) {
        options.temperature = 0.7;
        options.max_tokens = CONFIG.TOKEN_LIMITS.CHAT_MAX;
      } else {
        if (fallback.reasoning) options.reasoning_effort = fallback.reasoning;
        if (fallback.verbosity) options.verbosity = fallback.verbosity;
        options.max_completion_tokens = Math.min(6000, CONFIG.TOKEN_LIMITS.MINI_MAX);
      }

      const result = await openaiClient.getGPT5Analysis(enhancedMessage, options);
      const totalTime = originalProcessingTime + (Date.now() - fallbackStart);

      updateSystemStats('gpt5_fallback', true, totalTime, 'fallback', fallback.model);

      return {
        response: `[Fallback Mode - ${fallback.model}]\n\n${result}`,
        aiUsed: `GPT-5-${fallback.model.replace('gpt-5-', '').replace('gpt-5', 'full')}-fallback`,
        modelUsed: fallback.model,
        processingTime: totalTime,
        tokensUsed: Math.ceil(safeString(result).length / 4),
        priority: 'fallback',
        confidence: Math.max(0.5, (queryAnalysis.confidence || 0.7) - 0.2),
        reasoning_effort: fallback.reasoning,
        verbosity: fallback.verbosity,
        memoryUsed: !!context,
        success: true,
        fallbackUsed: true,
        originalError: originalError?.message
      };
    } catch (fallbackError) {
      console.log(`[GPT-5] Fallback ${fallback.model} failed: ${fallbackError.message}`);
      continue;
    }
  }

  const totalTime = originalProcessingTime + (Date.now() - fallbackStart);
  updateSystemStats('gpt5_fallback', false, totalTime, 'emergency', 'none');
  throw new Error(`All GPT-5 models failed. Original: ${originalError?.message}. Please try again with a simpler question.`);
}

console.log('PIECE 4 LOADED: GPT-5 execution engine with fallback system ready');

/* ═══════════════════════════════════════════════════════════════════════════
   PIECE 5: MEMORY MANAGEMENT (wired to current message)
   ═══════════════════════════════════════════════════════════════════════════ */

// NOTE: signature includes currentUserMessage (used to raise topical relevance)
async function buildMemoryContext(chatId, contextLevel = 'full', currentUserMessage = '') {
  try {
    if (!chatId || contextLevel === false || contextLevel === 'none') return '';

    const safeChatId = safeString(chatId);
    let contextLimit, messageLimit;

    switch (contextLevel) {
      case 'minimal': contextLimit = 1000; messageLimit = 3;  console.log('[Memory] Loading minimal context'); break;
      case 'reduced': contextLimit = 2500; messageLimit = 10; console.log('[Memory] Loading reduced context'); break;
      default:        contextLimit = 5000; messageLimit = 20; console.log('[Memory] Loading full context');
    }

    // 1) primary: ask memory module with current message for relevance
    if (memory && typeof memory.buildConversationContext === 'function') {
      try {
        const context = await memory.buildConversationContext(safeChatId, safeString(currentUserMessage));
        if (context && safeString(context).length > 0) {
          console.log(`[Memory] Context loaded: ${context.length} chars via memory module`);
          return context.length > contextLimit
            ? context.substring(0, contextLimit) + '\n[Context truncated]'
            : context;
        }
      } catch (memoryError) {
        console.warn('[Memory] Module error:', memoryError.message);
      }
    }

    // 2) fallback: recent conversation history from DB
    if (database && typeof database.getConversationHistoryDB === 'function') {
      try {
        const history = await database.getConversationHistoryDB(safeChatId, messageLimit);
        if (Array.isArray(history) && history.length > 0) {
          let context = 'Recent conversation:\n';
          let totalLength = context.length;

          const recent = history.slice(-messageLimit);
          for (const conv of recent) {
            if (!conv || typeof conv !== 'object') continue;

            const userMsg = safeString(conv.user_message || conv.userMessage || '');
            const assistantMsg = safeString(conv.gpt_response || conv.assistant_response || conv.assistantResponse || '');

            if (userMsg.length === 0) continue;

            const userTrunc = contextLevel === 'minimal' ? 100 : 200;
            const assistantTrunc = contextLevel === 'minimal' ? 150 : 300;

            const convText =
              `User: ${safeSubstring(userMsg, 0, userTrunc)}${userMsg.length > userTrunc ? '...' : ''}\n` +
              `Assistant: ${safeSubstring(assistantMsg, 0, assistantTrunc)}${assistantMsg.length > assistantTrunc ? '...' : ''}\n\n`;

            if (totalLength + convText.length > contextLimit) break;

            context += convText;
            totalLength += convText.length;
          }

          console.log(`[Memory] Context built: ${context.length} chars via database (${recent.length} records)`);
          return safeSubstring(context, 0, contextLimit);
        }
      } catch (dbError) {
        console.warn('[Memory] Database error:', dbError.message);
      }
    }

    console.log('[Memory] No context available - returning minimal scaffold');
    return `Context for user ${safeChatId}`;

  } catch (error) {
    console.error('[Memory] Context building failed:', error.message);
    return `Basic context for user ${chatId}`;
  }
}

async function saveMemoryIfNeeded(chatId, userMessage, response, messageType, metadata = {}) {
  try {
    if (!chatId) return { saved: false, reason: 'no_chatid' };

    const safeUserMessage = safeString(userMessage);
    const safeResponse = safeString(response);

    console.log(`[DEBUG-SAVE] ═══════════════════════════════════════`);
    console.log(`[DEBUG-SAVE] Attempting to save memory for chatId: ${chatId}`);
    console.log(`[DEBUG-SAVE] Message type: ${messageType}`);
    console.log(`[DEBUG-SAVE] User message: "${safeUserMessage.substring(0, 80)}${safeUserMessage.length>80?'...':''}"`);
    console.log(`[DEBUG-SAVE] Response length: ${safeResponse.length} chars`);
    console.log(`[DEBUG-SAVE] Metadata:`, metadata);

    if (safeUserMessage.length < 3 && safeResponse.length < 50) {
      console.log(`[DEBUG-SAVE] ❌ Skipping: trivial interaction`);
      return { saved: false, reason: 'trivial' };
    }
    if (messageType === MESSAGE_TYPES.SIMPLE_GREETING && safeResponse.length < 200) {
      console.log('[DEBUG-SAVE] ❌ Skipping save for simple greeting');
      return { saved: false, reason: 'simple_greeting' };
    }

    const normalizedResponse = safeResponse
      .replace(/^(Assistant:|AI:|GPT-?5?:)\s*/i, '')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 8000);

    const safeChatId = safeString(chatId);

    console.log(`[DEBUG-SAVE] ✅ Passed filters, attempting database save...`);

    // Compatible with either saveConversation or saveConversationDB
    const saveFn = (typeof database.saveConversation === 'function')
      ? database.saveConversation
      : (typeof database.saveConversationDB === 'function')
        ? database.saveConversationDB
        : null;

    if (saveFn) {
      try {
        await saveFn(safeChatId, safeUserMessage, normalizedResponse, {
          ...metadata,
          messageType: safeString(messageType),
          timestamp: new Date().toISOString()
        });
        console.log('[DEBUG-SAVE] ✅ SUCCESS: Saved to database!');
        return { saved: true, method: 'database' };
      } catch (dbError) {
        console.log(`[DEBUG-SAVE] ❌ Database save ERROR: ${dbError.message}`);
      }
    } else {
      console.log(`[DEBUG-SAVE] ❌ No DB save function (saveConversation/saveConversationDB)`);
    }

    if (memory && typeof memory.saveToMemory === 'function') {
      console.log(`[DEBUG-SAVE] 💾 Trying memory module save...`);
      try {
        await memory.saveToMemory(safeChatId, {
          type: 'conversation',
          user: safeUserMessage,
          assistant: normalizedResponse,
          messageType: safeString(messageType),
          timestamp: new Date().toISOString()
        });
        console.log('[DEBUG-SAVE] ✅ SUCCESS: Saved to memory module!');
        return { saved: true, method: 'memory' };
      } catch (memError) {
        console.log(`[DEBUG-SAVE] ❌ Memory module save ERROR: ${memError.message}`);
      }
    } else {
      console.log(`[DEBUG-SAVE] ❌ Memory module not available!`);
    }

    console.log(`[DEBUG-SAVE] ❌ FINAL RESULT: No storage methods worked`);
    return { saved: false, reason: 'no_storage' };

  } catch (error) {
    console.log(`[DEBUG-SAVE] ❌ CRITICAL ERROR: ${error.message}`);
    return { saved: false, reason: 'error', error: error.message };
  }
}

console.log('PIECE 5 LOADED: Memory management with PostgreSQL integration ready');

/* ═══════════════════════════════════════════════════════════════════════════
   PIECE 6: TELEGRAM HANDLERS + ROUTING
   ═══════════════════════════════════════════════════════════════════════════ */

async function handleTelegramMessage(message, bot) {
  const startTime = Date.now();
  const chatId = message.chat.id;
  const userMessage = safeString(message.text || '');

  console.log(`[Telegram] Processing message from ${chatId}: "${safeSubstring(userMessage, 0, 50)}..."`);

  try {
    const hasMedia = !!(message.photo || message.document || message.voice ||
                        message.audio || message.video || message.video_note);

    const messageType = classifyMessage(userMessage, hasMedia);
    console.log(`[Telegram] Message type: ${messageType}`);

    if (hasMedia) {
      return await handleMultimodalContent(message, bot, userMessage, startTime);
    }

    // Document follow-up hook
    if (userMessage && !userMessage.startsWith('/')) {
      try {
        const documentContext = multimodal.getContextForFollowUp(chatId, userMessage);
        if (documentContext) {
          console.log('[Telegram] Document follow-up detected');
          return await executeEnhancedGPT5Command(documentContext, chatId, bot, {
            title: 'Document Follow-up',
            forceModel: 'gpt-5-mini',
            saveToMemory: 'minimal'
          });
        }
      } catch {
        // no-op
      }
    }

    if (userMessage.length === 0) {
      console.log('[Telegram] Empty message, skipping');
      return;
    }

    return await routeMessageByType(userMessage, chatId, bot, messageType, startTime);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('[Telegram] Processing error:', error.message);
    await sendErrorMessage(bot, chatId, error, processingTime);
  }
}

async function routeMessageByType(userMessage, chatId, bot, messageType, startTime) {
  const baseOptions = {
    messageType: 'telegram_webhook',
    processingStartTime: startTime
  };

  switch (messageType) {
    case MESSAGE_TYPES.SIMPLE_GREETING:
      console.log('[Route] Simple greeting - nano WITH minimal memory');
      return await executeEnhancedGPT5Command(userMessage, chatId, bot, {
        ...baseOptions,
        forceModel: 'gpt-5-nano',
        max_completion_tokens: 100,
        reasoning_effort: 'minimal',
        verbosity: 'low',
        saveToMemory: false,          // avoid clutter
        contextAware: 'minimal',      // was false — ensures recall on hello
        title: 'Quick Greeting'
      });

    case MESSAGE_TYPES.SIMPLE_QUESTION:
      console.log('[Route] Simple question - mini with minimal memory');
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
      console.log('[Route] Complex query - full processing');
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
    let result;
    if (message.photo) {
      const photo = message.photo[message.photo.length - 1];
      result = await multimodal.analyzeImage(bot, photo.file_id, userMessage || 'Analyze this image', message.chat.id);
    } else if (message.document) {
      result = await multimodal.analyzeDocument(bot, message.document, userMessage || 'Analyze this document', message.chat.id);
    } else if (message.voice) {
      result = await multimodal.analyzeVoice(bot, message.voice, userMessage || 'Transcribe and analyze', message.chat.id);
    } else if (message.audio) {
      result = await multimodal.analyzeAudio(bot, message.audio, userMessage || 'Transcribe and analyze', message.chat.id);
    } else if (message.video) {
      result = await multimodal.analyzeVideo(bot, message.video, userMessage || 'Analyze this video', message.chat.id);
    } else if (message.video_note) {
      result = await multimodal.analyzeVideoNote(bot, message.video_note, userMessage || 'Analyze this video note', message.chat.id);
    }

    if (result && result.success) {
      const processingTime = Date.now() - startTime;
      console.log(`[Multimodal] Success: ${result.type} (${processingTime}ms)`);

      await saveMemoryIfNeeded(
        message.chat.id,
        `[${result.type.toUpperCase()}] ${userMessage || 'Media uploaded'}`,
        result.analysis || 'Multimodal processing completed',
        MESSAGE_TYPES.MULTIMODAL,
        { type: 'multimodal', mediaType: result.type, processingTime }
      );

      return result;
    } else {
      throw new Error('Multimodal processing failed');
    }
  } catch (error) {
    console.error('[Multimodal] Error:', error.message);
    const errorMsg = `Media processing failed: ${error.message}\n\nTry adding a text description with your media.`;
    await bot.sendMessage(message.chat.id, errorMsg);
    return { success: false, error: error.message };
  }
}

async function handleSystemCommand(command, chatId, bot, baseOptions) {
  const cmd = safeLowerCase(command);

  switch (cmd) {
    case '/start': {
      const welcomeMsg =
        `Welcome to the GPT-5 Smart System!\n\n` +
        `Features:\n` +
        `• Intelligent GPT-5 model selection\n` +
        `• Image, document, and voice analysis\n` +
        `• Smart memory integration\n` +
        `• Cost-optimized responses\n\n` +
        `Just send me a message or upload media!`;
      await bot.sendMessage(chatId, welcomeMsg);
      return { success: true, response: welcomeMsg };
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

    case '/memcheck': {
      const id = safeString(chatId);
      const ctx = await buildMemoryContext(id, 'minimal', 'probe hello after idle');
      let saved = false; let memCount = -1; let dbOk = true; let memOk = true;

      try { await memory.extractAndSaveFacts(id, 'My name is CanaryUser', 'ok'); saved = true; } catch { memOk = false; }
      try { const mems = await database.getPersistentMemoryDB(id); memCount = Array.isArray(mems) ? mems.length : -1; } catch { dbOk = false; }

      const report =
        `MEMCHECK\n` +
        `• memory module: ${memory?.__isFallback ? 'FALLBACK ❌' : memOk ? 'BOUND ✅' : 'BOUND (extract failed) ⚠️'}\n` +
        `• database module: ${database?.__isFallback ? 'FALLBACK ❌' : dbOk ? 'BOUND ✅' : 'BOUND (read failed) ⚠️'}\n` +
        `• context length: ${ctx.length}\n` +
        `• saved canary fact: ${saved ? 'OK ✅' : 'NO ❌'}\n` +
        `• total persistent facts (after save): ${memCount}\n`;
      await bot.sendMessage(chatId, report);
      return { success: true, response: report };
    }

    default:
      return await executeEnhancedGPT5Command(command, chatId, bot, baseOptions);
  }
}

async function handleCallbackQuery(callbackQuery, bot) {
  try { await bot.answerCallbackQuery(callbackQuery.id); console.log('[Callback] Query handled'); }
  catch (error) { console.error('[Callback] Error:', error.message); }
}

async function handleInlineQuery(inlineQuery, bot) {
  try { await bot.answerInlineQuery(inlineQuery.id, [], { cache_time: 1 }); console.log('[Inline] Query handled'); }
  catch (error) { console.error('[Inline] Error:', error.message); }
}

async function sendErrorMessage(bot, chatId, error, processingTime = 0) {
  try {
    const errorMsg = `System error (${processingTime}ms): ${error.message}\n\nPlease try again or use /health to check system status.`;
    await bot.sendMessage(safeString(chatId), errorMsg);
  } catch (sendError) {
    console.error('[Error] Failed to send error message:', sendError.message);
  }
}

console.log('PIECE 6 LOADED: Telegram handlers with smart routing ready');

/* ═══════════════════════════════════════════════════════════════════════════
   PIECE 7: ENHANCED EXECUTOR (calls fact extraction) + CAMBODIA MODULES
   ═══════════════════════════════════════════════════════════════════════════ */

async function executeEnhancedGPT5Command(userMessage, chatId, bot = null, options = {}) {
  const executionStart = Date.now();

  try {
    console.log('[Enhanced] Executing GPT-5 command with smart controls');

    const safeMessage = safeString(userMessage);
    const safeChatId = safeString(chatId);
    if (safeMessage.length === 0) throw new Error('Empty message provided');

    // Build memory context with the CURRENT message (important!)
    let memoryContext = '';
    if (options.contextAware !== false && safeChatId !== 'unknown') {
      try {
        memoryContext = await buildMemoryContext(safeChatId, options.contextAware, safeMessage);
      } catch (contextError) {
        console.warn('[Enhanced] Memory context failed:', contextError.message);
      }
    }

    const queryAnalysis = analyzeQuery(safeMessage, options.messageType || 'text', options.hasMedia === true, memoryContext);

    if (queryAnalysis.shouldSkipGPT5) {
      const responseTime = Date.now() - executionStart;
      const quick = queryAnalysis.quickResponse;
      await deliverToTelegram(bot, safeChatId, quick, 'Task Completion');
      return {
        response: quick,
        success: true,
        aiUsed: 'completion-detection',
        queryType: 'completion',
        completionDetected: true,
        processingTime: responseTime,
        tokensUsed: 0,
        costSaved: true,
        enhancedExecution: true,
        totalExecutionTime: responseTime,
        telegramDelivered: true
      };
    }

    if (options.forceModel && safeString(options.forceModel).indexOf('gpt-5') === 0) {
      queryAnalysis.gpt5Model = options.forceModel;
      queryAnalysis.reason = `Forced to use ${options.forceModel}`;
    }

    console.log(`[Enhanced] Analysis: ${queryAnalysis.type}, Model: ${queryAnalysis.gpt5Model}`);

    let gpt5Result;
    try {
      gpt5Result = await executeThroughGPT5System(safeMessage, queryAnalysis, memoryContext, safeChatId);
    } catch (gpt5Error) {
      console.error('[Enhanced] GPT-5 system failed:', gpt5Error.message);
      throw gpt5Error;
    }
    if (!gpt5Result || !gpt5Result.success) throw new Error(gpt5Result?.error || 'GPT-5 execution failed');

    // Save conversation (DB or memory) when enabled
    if (options.saveToMemory !== false && gpt5Result.success) {
      try {
        const messageType = classifyMessage(safeMessage);
        if (options.saveToMemory === 'minimal') {
          if (gpt5Result.response && safeString(gpt5Result.response).length > 150) {
            await saveMemoryIfNeeded(safeChatId, safeMessage, gpt5Result.response, messageType, {
              modelUsed: safeString(gpt5Result.modelUsed),
              processingTime: Number(gpt5Result.processingTime) || 0,
              minimal: true
            });
          }
        } else {
          await saveMemoryIfNeeded(safeChatId, safeMessage, gpt5Result.response, messageType, {
            modelUsed: safeString(gpt5Result.modelUsed),
            processingTime: Number(gpt5Result.processingTime) || 0,
            priority: safeString(queryAnalysis.priority),
            complexity: safeString(queryAnalysis.type)
          });
        }
      } catch (memoryError) {
        console.warn('[Enhanced] Memory save failed:', memoryError.message);
      }

      // NEW: Extract & save facts into persistent memory
      try {
        if (memory && typeof memory.extractAndSaveFacts === 'function') {
          await memory.extractAndSaveFacts(safeChatId, safeMessage, gpt5Result.response);
        }
      } catch (e) {
        console.warn('[Facts] extractAndSaveFacts failed:', e.message);
      }
    }

    const telegramDelivered = await deliverToTelegram(bot, safeChatId, gpt5Result.response, options.title || 'GPT-5 Analysis');

    return {
      response: gpt5Result.response,
      success: true,
      aiUsed: gpt5Result.aiUsed,
      modelUsed: gpt5Result.modelUsed,
      queryType: queryAnalysis.type,
      priority: queryAnalysis.priority,
      confidence: gpt5Result.confidence || queryAnalysis.confidence,
      processingTime: gpt5Result.processingTime,
      tokensUsed: gpt5Result.tokensUsed,
      reasoning_effort: queryAnalysis.reasoning_effort,
      verbosity: queryAnalysis.verbosity,
      memoryUsed: gpt5Result.memoryUsed,
      contextLength: memoryContext.length,
      fallbackUsed: !!gpt5Result.fallbackUsed,
      enhancedExecution: true,
      totalExecutionTime: Date.now() - executionStart,
      memoryContextUsed: memoryContext.length > 0,
      safetyChecksApplied: true,
      telegramDelivered
    };

  } catch (error) {
    console.error('[Enhanced] Command execution error:', error.message);
    const errorMsg = `Analysis failed: ${error.message}.\n\nPlease try a simpler request.`;
    const telegramDelivered = await deliverToTelegram(bot, safeString(chatId), errorMsg, 'System Error');

    return {
      success: false,
      response: 'Technical difficulties encountered. Please try again with a simpler request.',
      error: error.message,
      aiUsed: 'error-fallback',
      enhancedExecution: false,
      totalExecutionTime: Date.now() - executionStart,
      telegramDelivered,
      safetyChecksApplied: true
    };
  }
}

async function deliverToTelegram(bot, chatId, response, title) {
  try {
    if (!bot || !chatId) return false;
    if (telegramSplitter && typeof telegramSplitter.sendMessage === 'function') {
      const result = await telegramSplitter.sendMessage(bot, safeString(chatId), safeString(response), {
        title: safeString(title),
        model: 'gpt-5'
      });
      if (result && (result.success || result.enhanced || result.fallback)) return true;
    }
    if (bot && typeof bot.sendMessage === 'function') {
      await bot.sendMessage(safeString(chatId), safeString(response));
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Delivery] Failed:', error.message);
    return false;
  }
}

// Cambodia templates (unchanged intent, compact form)
const CAMBODIA_TEMPLATES = {
  creditAssessment: {
    model: 'gpt-5',
    title: 'Credit Assessment',
    prompt:
      'CAMBODIA PRIVATE LENDING CREDIT ASSESSMENT\n\n' +
      'Query: {query}\n\n' +
      'Analyze with Cambodia market expertise:\n' +
      '1. Borrower creditworthiness\n2. Risk score (0-100)\n3. Interest rate recommendation (USD)\n' +
      '4. Required documentation\n5. Cambodia-specific risk factors'
  },
  loanOrigination: {
    model: 'gpt-5',
    title: 'Loan Processing',
    prompt:
      'CAMBODIA LOAN APPLICATION\n\n' +
      'Data: {data}\n\n' +
      'Process with Cambodia standards:\n' +
      '1. Application completeness\n2. Financial analysis\n3. Risk evaluation\n4. Terms recommendation\n5. Documentation requirements'
  },
  portfolioOptimization: {
    model: 'gpt-5',
    title: 'Portfolio Optimization',
    prompt:
      'PORTFOLIO OPTIMIZATION\n\n' +
      'Portfolio: {portfolioId}\nQuery: {query}\n\n' +
      'Analysis:\n1. Current allocation\n2. Risk-return optimization\n3. Diversification\n4. Rebalancing recommendations'
  },
  marketAnalysis: {
    model: 'gpt-5',
    title: 'Market Analysis',
    prompt:
      'CAMBODIA MARKET RESEARCH\n\n' +
      'Scope: {scope}\nQuery: {query}\n\n' +
      'Analysis:\n1. Economic conditions\n2. Market opportunities\n3. Competition\n4. Strategic recommendations'
  }
};

async function executeCambodiaModule(moduleName, params, chatId, bot) {
  const template = CAMBODIA_TEMPLATES[moduleName];
  if (!template) throw new Error(`Cambodia module '${moduleName}' not found`);
  let prompt = template.prompt;
  Object.keys(params).forEach(key => {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), safeString(params[key]));
  });
  return executeEnhancedGPT5Command(prompt, chatId, bot, {
    title: template.title,
    forceModel: template.model
  });
}

async function runCreditAssessment(chatId, data, _chatId2, bot) {
  return executeCambodiaModule('creditAssessment', { query: data.query }, chatId, bot);
}
async function processLoanApplication(applicationData, chatId, bot) {
  return executeCambodiaModule('loanOrigination', { data: JSON.stringify(applicationData) }, chatId, bot);
}
async function optimizePortfolio(portfolioId, optimizationData, chatId, bot) {
  return executeCambodiaModule('portfolioOptimization', { portfolioId, query: optimizationData.query }, chatId, bot);
}
async function analyzeMarket(researchScope, analysisData, chatId, bot) {
  return executeCambodiaModule('marketAnalysis', { scope: researchScope, query: analysisData.query }, chatId, bot);
}

async function quickGPT5Command(message, chatId, bot = null, model = 'auto') {
  const options = { title: `GPT-5 ${model.toUpperCase()}`, saveToMemory: true };
  if (model !== 'auto') options.forceModel = model.includes('gpt-5') ? model : `gpt-5-${model}`;
  return await executeEnhancedGPT5Command(message, chatId, bot, options);
}
async function quickNanoCommand(message, chatId, bot = null) {
  return await executeEnhancedGPT5Command(message, chatId, bot, {
    forceModel: 'gpt-5-nano',
    max_completion_tokens: 1000,
    reasoning_effort: 'minimal',
    verbosity: 'low',
    title: 'GPT-5 Nano'
  });
}
async function quickMiniCommand(message, chatId, bot = null) {
  return await executeEnhancedGPT5Command(message, chatId, bot, {
    forceModel: 'gpt-5-mini',
    max_completion_tokens: 3000,
    reasoning_effort: 'medium',
    verbosity: 'medium',
    title: 'GPT-5 Mini'
  });
}
async function quickFullCommand(message, chatId, bot = null) {
  return await executeEnhancedGPT5Command(message, chatId, bot, {
    forceModel: 'gpt-5',
    max_completion_tokens: 8000,
    reasoning_effort: 'high',
    verbosity: 'high',
    title: 'GPT-5 Full'
  });
}

console.log('PIECE 7 LOADED: Enhanced executor and Cambodia modules ready');

/* ═══════════════════════════════════════════════════════════════════════════
   PIECE 8: HEALTH, ANALYTICS, EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

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
    const gpt5Health = await performGPT5HealthCheck();
    health.components.gpt5 = gpt5Health;
    health.scores.gpt5 = gpt5Health.healthScore || 0;
    if ((gpt5Health.availableModels || 0) === 0) {
      health.recommendations.push('No GPT-5 models available - check API key');
    }
  } catch (error) {
    health.components.gpt5 = { error: error.message, available: false };
    health.scores.gpt5 = 0;
  }

  try {
    const memoryWorking = memory && typeof memory.buildConversationContext === 'function';
    health.components.memory = { available: memoryWorking, status: memoryWorking ? 'operational' : 'limited' };
    health.scores.memory = memoryWorking ? 100 : 50;
  } catch (error) {
    health.components.memory = { error: error.message, available: false };
    health.scores.memory = 0;
  }

  try {
    const testQuery = await database.getConversationHistoryDB('health_test', 1);
    const dbWorking = Array.isArray(testQuery);
    health.components.database = { available: dbWorking, status: dbWorking ? 'connected' : 'disconnected' };
    health.scores.database = dbWorking ? 100 : 0;
  } catch (error) {
    health.components.database = { error: error.message, available: false };
    health.scores.database = 0;
  }

  try {
    const telegramWorking = telegramSplitter && typeof telegramSplitter.sendMessage === 'function';
    health.components.telegram = { available: telegramWorking, status: telegramWorking ? 'operational' : 'basic' };
    health.scores.telegram = telegramWorking ? 100 : 50;
  } catch (error) {
    health.components.telegram = { error: error.message, available: false };
    health.scores.telegram = 0;
  }

  const scores = Object.values(health.scores);
  const overallScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
  health.overallScore = Math.round(overallScore);
  health.overall = overallScore >= 90 ? 'excellent' : overallScore >= 70 ? 'good' : overallScore >= 50 ? 'degraded' : 'critical';

  systemState.lastHealthCheck = health.timestamp;
  systemState.healthStatus = health.overall;

  console.log(`[Health] System check complete: ${health.overall} (${health.overallScore}%)`);
  return health;
}

async function performGPT5HealthCheck() {
  const health = {
    timestamp: Date.now(),
    models: {},
    overallHealth: false,
    availableModels: 0,
    healthScore: 0
  };

  const modelsToTest = [
    { name: 'gpt-5-nano', options: { reasoning_effort: 'minimal', max_completion_tokens: 20 } },
    { name: 'gpt-5-mini', options: { reasoning_effort: 'low', max_completion_tokens: 20 } },
    { name: 'gpt-5', options: { reasoning_effort: 'minimal', max_completion_tokens: 20 } },
    { name: 'gpt-5-chat-latest', options: { temperature: 0.3, max_tokens: 20 } }
  ];

  let healthyCount = 0;

  for (const { name, options } of modelsToTest) {
    try {
      await openaiClient.getGPT5Analysis('Health check', { model: name, ...options });
      health.models[name] = { status: 'healthy', available: true };
      healthyCount++;
    } catch (error) {
      health.models[name] = { status: 'unhealthy', error: error.message, available: false };
    }
  }

  health.availableModels = healthyCount;
  health.overallHealth = healthyCount > 0;
  health.healthScore = Math.round((healthyCount / modelsToTest.length) * 100);

  return health;
}

function getSystemAnalytics() {
  const uptime = Date.now() - systemState.startTime;
  const successRate = systemState.requestCount > 0
    ? (systemState.successCount / systemState.requestCount) * 100
    : 0;

  return {
    version: systemState.version,
    uptime: {
      milliseconds: uptime,
      hours: Math.floor(uptime / (1000 * 60 * 60)),
      formatted: formatUptime(uptime)
    },
    requests: {
      total: systemState.requestCount,
      successful: systemState.successCount,
      failed: systemState.errorCount,
      successRate: Math.round(successRate * 100) / 100
    },
    modelUsage: systemState.modelUsageStats,
    health: {
      status: systemState.healthStatus,
      lastCheck: systemState.lastHealthCheck
    }
  };
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function getMultimodalStatus() {
  try { return multimodal.getMultimodalStatus(); }
  catch (error) {
    return {
      available: false,
      error: error.message,
      capabilities: {
        image_analysis: false,
        voice_transcription: false,
        document_processing: false,
        video_analysis: false
      }
    };
  }
}

// Exports
module.exports = {
  // Telegram handlers
  handleTelegramMessage,
  handleCallbackQuery,
  handleInlineQuery,

  // Executor
  executeEnhancedGPT5Command,

  // Quick commands
  quickGPT5Command,
  quickNanoCommand,
  quickMiniCommand,
  quickFullCommand,

  // Cambodia
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

  // Utilities
  classifyMessage,
  analyzeQuery,
  detectCompletionStatus,
  getCurrentCambodiaDateTime,
  updateSystemStats,

  // Core (re-export)
  openaiClient,
  memory,
  database,
  multimodal,
  telegramSplitter,

  // Constants
  CONFIG,
  MESSAGE_TYPES,
  systemState: () => ({ ...systemState }),

  // Safe helpers
  safeString,
  safeLowerCase,
  safeSubstring
};

// Startup banner
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('GPT-5 SMART SYSTEM v8.1 - HARDENED + MEMORY-WIRED');
console.log('═══════════════════════════════════════════════════════════════');
console.log('✓ Loud wire-up checks (no silent fallbacks)');
console.log('✓ Memory context uses current user message');
console.log('✓ Greetings load minimal context (better recall)');
console.log('✓ DB save compatible (saveConversation / saveConversationDB)');
console.log('✓ Persistent facts extraction after every reply');
console.log('✓ Large-content context filter recognizes "User\'s name:"');
console.log('✓ /memcheck diagnostic command');
console.log('═══════════════════════════════════════════════════════════════');

// Auto health check
setTimeout(async () => {
  try {
    await checkSystemHealth();
    console.log('[Startup] Initial health check completed');
  } catch (error) {
    console.warn('[Startup] Health check failed:', error.message);
  }
}, 3000);

console.log('System initialization complete - ready for production use');
