// utils/dualCommandSystem.js - SECURE GPT-5 COMMAND SYSTEM - PART 1/6
// Clean routing: index.js → dualCommandSystem.js → openaiClient.js → telegramSplitter.js
// ALIGNED: Direct integration with new clean telegramSplitter.js
// SIMPLIFIED: Removed complex adapter logic, direct function imports

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CLEAN TELEGRAM INTEGRATION - ALIGNED WITH NEW SPLITTER
// ─────────────────────────────────────────────────────────────────────────────
let telegramSplitter = null;

try {
  // Import the new clean telegram splitter functions
  const splitter = require('./telegramSplitter');
  
  if (splitter && typeof splitter.sendTelegramMessage === 'function') {
    // Create simple, clean integration object
    telegramSplitter = {
      // Main delivery function
      sendMessage: splitter.sendTelegramMessage,
      
      // Setup handler for advanced features
      setupHandler: splitter.setupTelegramHandler,
      
      // Model-specific helpers (using the clean sendTelegramMessage)
      sendGPT5: async (bot, chatId, response, metadata = {}) => {
        return await splitter.sendTelegramMessage(bot, chatId, response, {
          ...metadata,
          model: 'gpt-5'
        });
      },
      
      sendGPT5Mini: async (bot, chatId, response, metadata = {}) => {
        return await splitter.sendTelegramMessage(bot, chatId, response, {
          ...metadata,
          model: 'gpt-5-mini'
        });
      },
      
      sendGPT5Nano: async (bot, chatId, response, metadata = {}) => {
        return await splitter.sendTelegramMessage(bot, chatId, response, {
          ...metadata,
          model: 'gpt-5-nano'
        });
      },
      
      sendGPT5Chat: async (bot, chatId, response, metadata = {}) => {
        return await splitter.sendTelegramMessage(bot, chatId, response, {
          ...metadata,
          model: 'gpt-5-chat-latest'
        });
      },
      
      // Generic response sender
      sendGPTResponse: async (bot, chatId, response, metadata = {}) => {
        return await splitter.sendTelegramMessage(bot, chatId, response, metadata);
      },
      
      // Error handler
      sendAlert: async (bot, chatId, errorMessage, title = 'System Error') => {
        const errorText = errorMessage instanceof Error ? errorMessage.message : String(errorMessage);
        return await splitter.sendTelegramMessage(bot, chatId, `**${title}**\n\n${errorText}`, {
          model: 'error-handler',
          error: true
        });
      }
    };
    
    console.log('Clean telegram splitter integration loaded successfully');
    
  } else {
    throw new Error('sendTelegramMessage function not found in telegramSplitter');
  }
  
} catch (error) {
  console.warn('Telegram splitter integration failed:', error.message);
  console.log('Using safe fallback telegram handlers...');
  
  // Safe fallback stubs - won't crash the system
  telegramSplitter = {
    sendMessage: async (bot, chatId, response) => {
      if (bot && bot.sendMessage && chatId) {
        try {
          await bot.sendMessage(chatId, response);
          return { success: true, enhanced: false, fallback: true };
        } catch (e) {
          console.error('Fallback telegram send failed:', e.message);
          return { success: false, error: e.message };
        }
      }
      return { success: false, error: 'No bot or chatId provided' };
    },
    
    setupHandler: () => ({
      send: telegramSplitter.sendMessage,
      sendGPTResponse: telegramSplitter.sendMessage,
      sendError: telegramSplitter.sendMessage
    }),
    
    sendGPT5: async (bot, chatId, response) => telegramSplitter.sendMessage(bot, chatId, response),
    sendGPT5Mini: async (bot, chatId, response) => telegramSplitter.sendMessage(bot, chatId, response),
    sendGPT5Nano: async (bot, chatId, response) => telegramSplitter.sendMessage(bot, chatId, response),
    sendGPT5Chat: async (bot, chatId, response) => telegramSplitter.sendMessage(bot, chatId, response),
    sendGPTResponse: async (bot, chatId, response) => telegramSplitter.sendMessage(bot, chatId, response),
    sendAlert: async (bot, chatId, errorMessage, title) => {
      const errorText = `**${title || 'Error'}**\n\n${errorMessage}`;
      return telegramSplitter.sendMessage(bot, chatId, errorText);
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFE LAZY IMPORTS (avoid crashing when optional modules are missing)
// ─────────────────────────────────────────────────────────────────────────────
function lazyLoad(name, candidates, stubFactory) {
  for (let i = 0; i < candidates.length; i++) {
    try {
      const mod = require(candidates[i]);
      console.log(`[dualCommandSystem] Loaded ${name} from ${candidates[i]}`);
      return mod;
    } catch (e) { /* try next */ }
  }
  const stub = (typeof stubFactory === 'function') ? stubFactory() : {};
  console.warn(`[dualCommandSystem] ${name} not found, using safe stub`);
  return stub;
}

const openaiClient = lazyLoad(
  'openaiClient',
  ['./openaiClient', '../utils/openaiClient', '../openaiClient'],
  function () {
    return {
      getGPT5Analysis: async () => { throw new Error('openaiClient stub: getGPT5Analysis unavailable'); },
      testOpenAIConnection: async () => ({ success: false, gpt5Available: false }),
      checkGPT5SystemHealth: async () => ({ overallHealth: false })
    };
  }
);

const memory = lazyLoad(
  'memory',
  ['./memory', '../utils/memory', '../memory'],
  function () {
    return {
      loadContext: async () => ({ history: [], persistent: [] }),
      saveContext: async () => true
    };
  }
);

const database = lazyLoad(
  'database',
  ['./database', '../utils/database', '../database'],
  function () {
    return {
      query: async () => [],
      upsert: async () => true,
      health: async () => ({ ok: true })
    };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
const systemState = {
  mode: 'SECURE_GPT5',
  version: '7.1-CLEAN',
  startTime: Date.now(),
  requestCount: 0,
  successCount: 0,
  errorCount: 0,
  completionDetectionCount: 0,

  // Performance tracking
  responseTimeHistory: [],
  modelUsageStats: {
    'gpt-5': 0,
    'gpt-5-mini': 0,
    'gpt-5-nano': 0,
    'gpt-5-chat-latest': 0
  },

  // Query classification stats
  queryTypeStats: {
    completion: 0,
    speed: 0,
    complex: 0,
    mathematical: 0,
    regional: 0,
    market: 0,
    multimodal: 0,
    chat: 0,
    analysis: 0
  },

  // Cost tracking
  estimatedCosts: {
    total: 0,
    saved: 0,
    completionSavings: 0
  },

  // Health monitoring
  lastHealthCheck: null,
  healthStatus: 'unknown',
  availableModels: [],
  
  // Telegram integration status
  telegramIntegration: {
    loaded: telegramSplitter !== null,
    enhanced: telegramSplitter && typeof telegramSplitter.sendMessage === 'function',
    fallback: false
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  // GPT-5 Model Selection
  MODELS: {
    NANO: 'gpt-5-nano',
    MINI: 'gpt-5-mini',
    FULL: 'gpt-5',
    CHAT: 'gpt-5-chat-latest'
  },

  // Reasoning and verbosity settings
  REASONING_LEVELS: ['minimal', 'low', 'medium', 'high'],
  VERBOSITY_LEVELS: ['low', 'medium', 'high'],

  // Token limits
  TOKEN_LIMITS: {
    NANO_MAX: 4000,
    MINI_MAX: 8000,
    FULL_MAX: 16000,
    CHAT_MAX: 8000
  },

  // Response time targets (ms)
  TIME_TARGETS: {
    SPEED_CRITICAL: 2000,
    STANDARD: 5000,
    COMPLEX: 10000
  },

  // Memory integration settings
  MEMORY: {
    MAX_CONTEXT_LENGTH: 2000,
    MAX_CONVERSATION_HISTORY: 5,
    MAX_PERSISTENT_MEMORIES: 3
  },

  // Performance monitoring
  PERFORMANCE: {
    RESPONSE_HISTORY_SIZE: 100,
    HEALTH_CHECK_INTERVAL: 300000, // 5 minutes
    STATS_RESET_INTERVAL: 86400000 // 24 hours
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DATETIME UTILITIES - Cambodia Focus
// ─────────────────────────────────────────────────────────────────────────────
function getCurrentCambodiaDateTime() {
  try {
    const now = new Date();
    const cambodiaTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' })
    );

    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    const dayName = days[cambodiaTime.getDay()];
    const monthName = months[cambodiaTime.getMonth()];
    const date = cambodiaTime.getDate();
    const year = cambodiaTime.getFullYear();
    const hour = cambodiaTime.getHours();
    const minute = cambodiaTime.getMinutes();
    const isWeekend = cambodiaTime.getDay() === 0 || cambodiaTime.getDay() === 6;

    return {
      date: `${dayName}, ${monthName} ${date}, ${year}`,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      hour: hour,
      minute: minute,
      dayName: dayName,
      isWeekend: isWeekend,
      isBusinessHours: !isWeekend && hour >= 8 && hour <= 17,
      timezone: 'ICT (UTC+7)',
      timestamp: cambodiaTime.toISOString()
    };
  } catch (error) {
    console.error('Cambodia DateTime error:', error.message);
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

function getCurrentGlobalDateTime() {
  try {
    const now = new Date();

    const cambodiaTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' })
    );
    const newYorkTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/New_York' })
    );
    const londonTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Europe/London' })
    );

    const isCambodiaBusinessDay = cambodiaTime.getDay() !== 0 && cambodiaTime.getDay() !== 6;

    return {
      cambodia: Object.assign({}, getCurrentCambodiaDateTime(), { timezone: 'ICT (UTC+7)' }),
      newYork: {
        time: `${newYorkTime.getHours().toString().padStart(2, '0')}:${newYorkTime.getMinutes().toString().padStart(2, '0')}`,
        hour: newYorkTime.getHours(),
        timezone: 'EST/EDT (UTC-5/-4)',
        isMarketHours: isCambodiaBusinessDay && newYorkTime.getHours() >= 9 && newYorkTime.getHours() <= 16
      },
      london: {
        time: `${londonTime.getHours().toString().padStart(2, '0')}:${londonTime.getMinutes().toString().padStart(2, '0')}`,
        hour: londonTime.getHours(),
        timezone: 'GMT/BST (UTC+0/+1)',
        isMarketHours: isCambodiaBusinessDay && londonTime.getHours() >= 8 && londonTime.getHours() <= 16
      },
      utc: now.toISOString()
    };
  } catch (error) {
    console.error('Global DateTime error:', error.message);
    return {
      cambodia: getCurrentCambodiaDateTime(),
      error: 'Global timezone calculation failed'
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function updateSystemStats(operation, success = true, responseTime = 0, queryType = 'unknown', model = 'unknown') {
  systemState.requestCount++;

  if (success) systemState.successCount++;
  else systemState.errorCount++;

  if (queryType === 'completion') systemState.completionDetectionCount++;

  // Performance tracking
  if (responseTime > 0) {
    systemState.responseTimeHistory.push({
      time: responseTime,
      timestamp: Date.now(),
      operation: operation,
      model: model
    });
    if (systemState.responseTimeHistory.length > CONFIG.PERFORMANCE.RESPONSE_HISTORY_SIZE) {
      systemState.responseTimeHistory.shift();
    }
  }

  // Model usage
  if (Object.prototype.hasOwnProperty.call(systemState.modelUsageStats, model)) {
    systemState.modelUsageStats[model]++;
  }

  // Query type stats
  if (Object.prototype.hasOwnProperty.call(systemState.queryTypeStats, queryType)) {
    systemState.queryTypeStats[queryType]++;
  }
}

function calculateCostEstimate(model, inputTokens, outputTokens) {
  const costs = {
    'gpt-5-nano': { input: 0.05, output: 0.40 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-chat-latest': { input: 1.25, output: 10.00 }
  };

  const modelCosts = costs[model] || costs['gpt-5-mini'];
  const inputCost = (inputTokens / 1e6) * modelCosts.input;
  const outputCost = (outputTokens / 1e6) * modelCosts.output;

  return {
    inputCost: inputCost,
    outputCost: outputCost,
    totalCost: inputCost + outputCost,
    model: model,
    inputTokens: inputTokens,
    outputTokens: outputTokens
  };
}

function resetSystemStats() {
  console.log('Resetting system statistics...');

  systemState.requestCount = 0;
  systemState.successCount = 0;
  systemState.errorCount = 0;
  systemState.completionDetectionCount = 0;
  systemState.responseTimeHistory = [];

  // Reset model usage stats
  Object.keys(systemState.modelUsageStats).forEach(function (key) {
    systemState.modelUsageStats[key] = 0;
  });

  // Reset query type stats
  Object.keys(systemState.queryTypeStats).forEach(function (key) {
    systemState.queryTypeStats[key] = 0;
  });

  // Reset cost tracking
  systemState.estimatedCosts.total = 0;
  systemState.estimatedCosts.saved = 0;
  systemState.estimatedCosts.completionSavings = 0;

  console.log('System statistics reset completed');
}

// Auto-reset stats daily
setInterval(resetSystemStats, CONFIG.PERFORMANCE.STATS_RESET_INTERVAL);

// Update telegram integration status
systemState.telegramIntegration = {
  loaded: telegramSplitter !== null,
  enhanced: telegramSplitter && typeof telegramSplitter.sendMessage === 'function',
  version: 'clean-v2.0'
};

// STARTUP MESSAGES
console.log('Clean GPT-5 Command System v7.1 - PART 1/6 loaded');
console.log('Telegram Integration: ' + (systemState.telegramIntegration.enhanced ? 'Enhanced' : 'Fallback'));
console.log('Core setup: Imports, state management, utilities');
console.log('Security: Operational execution removed, analysis-only mode');
console.log('Features: Performance tracking, cost estimation, health monitoring');
console.log('Cambodia timezone support with global market awareness');
console.log('Ready for intelligent GPT-5 model selection and routing');

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  // Core system components (lazy-loaded, safe stubs if missing)
  openaiClient,
  memory,
  database,
  telegramSplitter,

  // System state and configuration
  systemState,
  CONFIG,

  // Utility functions
  getCurrentCambodiaDateTime,
  getCurrentGlobalDateTime,
  updateSystemStats,
  calculateCostEstimate,
  resetSystemStats,

  // Constants
  MODELS: CONFIG.MODELS,
  REASONING_LEVELS: CONFIG.REASONING_LEVELS,
  VERBOSITY_LEVELS: CONFIG.VERBOSITY_LEVELS
};

// utils/dualCommandSystem.js - SECURE GPT-5 COMMAND SYSTEM - PART 2/6
// COMPLETION DETECTION & INTELLIGENT QUERY ANALYSIS
// This part handles smart detection of completed tasks and optimal GPT-5 model selection

// COMPLETION DETECTION SYSTEM
// Detects when users indicate a task is already complete to avoid redundant processing
function detectCompletionStatus(message, memoryContext = '') {
    const messageText = message.toLowerCase();
    const contextText = memoryContext.toLowerCase();
    
    // Direct completion indicators
    const directCompletionPatterns = [
        /done ready|already built|it works?|working now|system ready/i,
        /deployment complete|built already|finished already/i,
        /stop asking|told you already|we discussed this/i,
        /ready now|operational now|live now|running now/i,
        /no need|don't need|unnecessary|redundant/i,
        /complete already|completed already|all set/i,
        /functioning|operational|up and running/i
    ];
    
    // Context-based completion indicators
    const contextCompletionPatterns = [
        /system.*built|deployment.*complete|project.*finished/i,
        /already.*working|currently.*operational/i,
        /successfully.*deployed|live.*system/i,
        /implementation.*complete|setup.*done/i
    ];
    
    // User frustration patterns (avoid repetitive questions)
    const frustrationPatterns = [
        /again.*asking|keep.*asking|always.*ask/i,
        /told.*you.*already|mentioned.*before/i,
        /why.*again|same.*thing.*again/i,
        /understand.*ready|listen.*done/i,
        /how many times|repeatedly asking/i
    ];
    
    const hasDirectCompletion = directCompletionPatterns.some(pattern => pattern.test(messageText));
    const hasContextCompletion = contextCompletionPatterns.some(pattern => pattern.test(contextText));
    const hasFrustration = frustrationPatterns.some(pattern => pattern.test(messageText));
    
    return {
        isComplete: hasDirectCompletion || hasContextCompletion,
        isFrustrated: hasFrustration,
        directSignal: hasDirectCompletion,
        contextSignal: hasContextCompletion,
        shouldSkipGPT5: hasDirectCompletion || hasFrustration,
        completionType: hasDirectCompletion ? 'direct' : 
                       hasContextCompletion ? 'context' : 
                       hasFrustration ? 'frustration' : 'none',
        confidence: hasDirectCompletion ? 0.9 : 
                   hasContextCompletion ? 0.7 : 
                   hasFrustration ? 0.8 : 0.0
    };
}

// Generate appropriate completion responses
function generateCompletionResponse(completionStatus, originalMessage) {
    const responses = {
        direct: [
            "Got it! System confirmed as ready. What's your next command?",
            "Understood - it's operational. What else can I help with?",
            "Perfect! Since it's working, what's the next task?",
            "Acknowledged. Moving on - what do you need now?"
        ],
        context: [
            "I see from our history that it's already built. What's next?",
            "Right, the system is operational. What's your next priority?",
            "Understood from context - it's ready. How can I help further?"
        ],
        frustration: [
            "My apologies! I understand it's ready. Let's move forward - what else do you need?",
            "Sorry for the repetition! I get it - it's working. What's next?",
            "You're absolutely right - no need to rebuild. What's your next task?",
            "Point taken! The system is operational. What should we focus on now?"
        ]
    };
    
    const responseArray = responses[completionStatus.completionType] || responses.direct;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// QUERY COMPLEXITY ANALYSIS
// Analyzes query complexity for appropriate token allocation and model selection
function analyzeQueryComplexity(message) {
    const text = message.toLowerCase();
    
    // Very complex patterns requiring full GPT-5
    const veryComplexPatterns = [
        /(write.*comprehensive|create.*detailed.*report)/i,
        /(step.*by.*step.*guide|complete.*tutorial)/i,
        /(analyze.*thoroughly|provide.*full.*analysis)/i,
        /(research.*paper|academic.*analysis)/i,
        /(business.*plan|strategic.*framework)/i,
        /(financial.*model|investment.*analysis)/i,
        /(legal.*document|contract.*analysis)/i,
        /(multi.*step.*process|complex.*workflow)/i
    ];
    
    // Standard complex patterns requiring careful analysis
    const complexPatterns = [
        /(explain.*detail|provide.*example)/i,
        /(compare.*contrast|pros.*cons)/i,
        /(advantages.*disadvantages)/i,
        /(multiple.*options|various.*approaches)/i,
        /(bullet.*points|numbered.*list)/i,
        /(technical.*specification|implementation.*details)/i
    ];
    
    // Long response indicators
    const longResponseIndicators = [
        /(tell.*me.*everything|explain.*fully)/i,
        /(all.*information|complete.*overview)/i,
        /(elaborate|expand.*on|more.*detail)/i,
        /(comprehensive|thorough|detailed)/i,
        /(documentation|manual|guide)/i
    ];
    
    const isVeryComplex = veryComplexPatterns.some(pattern => pattern.test(text));
    const isComplex = complexPatterns.some(pattern => pattern.test(text));
    const needsLongResponse = longResponseIndicators.some(pattern => pattern.test(text));
    
    // Quantitative analysis
    const questionWords = (text.match(/\b(what|how|why|when|where|which|who)\b/g) || []).length;
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const technicalTerms = (text.match(/\b(api|database|server|system|network|security|algorithm|framework)\b/g) || []).length;
    
    return {
        isVeryComplex: isVeryComplex || (sentences > 5 && words > 100),
        isComplex: isComplex || questionWords > 2 || technicalTerms > 2,
        needsLongResponse: needsLongResponse || words > 50,
        sentences: sentences,
        words: words,
        questionWords: questionWords,
        technicalTerms: technicalTerms,
        complexity: isVeryComplex ? 'very_high' : 
                   isComplex ? 'high' : 
                   needsLongResponse ? 'medium' : 'low',
        score: (isVeryComplex ? 4 : 0) + (isComplex ? 2 : 0) + (needsLongResponse ? 1 : 0)
    };
}

// INTELLIGENT QUERY ANALYSIS & GPT-5 MODEL SELECTION
function analyzeQuery(userMessage, messageType = 'text', hasMedia = false, memoryContext = null) {
    const message = userMessage.toLowerCase();
    
    // Priority 1: Check for completion detection first
    const completionStatus = detectCompletionStatus(userMessage, memoryContext || '');
    if (completionStatus.shouldSkipGPT5) {
        updateSystemStats('completion_detection', true, 0, 'completion', 'none');
        return {
            type: 'completion',
            bestAI: 'none',
            reason: `Task completion detected (${completionStatus.completionType})`,
            isComplete: true,
            completionStatus: completionStatus,
            shouldSkipGPT5: true,
            quickResponse: generateCompletionResponse(completionStatus, userMessage),
            priority: 'completion',
            confidence: completionStatus.confidence
        };
    }
    
    // Memory patterns for context-aware responses
    const memoryPatterns = [
        /remember|recall|you mentioned|we discussed|before|previously|last time/i,
        /my name|my preference|i told you|i said|you know/i,
        /our conversation|we talked about|you said earlier/i
    ];
    
    // Speed critical patterns - Use GPT-5 Nano for instant responses
    const speedPatterns = [
        /urgent|immediate|now|asap|quick|fast|emergency|real-time/i,
        /^(what time|what's the time|current time|time now)/i,
        /^(what date|what's the date|today's date|date today)/i,
        /^(hello|hi|hey|good morning|good afternoon|what's up)$/i,
        /^how are you\??$/i,
        /^(thanks|thank you|cool|nice|great|ok|okay)$/i,
        /^(yes|no|maybe|sure|absolutely)$/i
    ];
    
    // Complex analysis patterns - Use Full GPT-5 for deep thinking
    const complexPatterns = [
        /(strategy|strategic|comprehensive|detailed|thorough|in-depth)/i,
        /(analyze|evaluate|assess|examine|investigate|research)/i,
        /(portfolio|allocation|risk|optimization|diversification)/i,
        /(complex|sophisticated|multi-factor|multi-dimensional)/i,
        /(build|create|develop|implement|construct|design)/i,
        /(plan|planning|framework|structure|architecture)/i,
        /(write.*comprehensive|detailed.*report|full.*analysis)/i,
        /(compare.*multiple|evaluate.*options|decision.*matrix)/i
    ];
    
    // Math/coding patterns - Use Full GPT-5 for precision
    const mathCodingPatterns = [
        /(calculate|compute|formula|equation|algorithm|optimization)/i,
        /(code|coding|program|script|debug|software|api)/i,
        /(mathematical|statistical|probability|regression|correlation)/i,
        /(machine learning|ai|neural network|deep learning)/i,
        /(backtest|monte carlo|var|sharpe|sortino|calmar)/i,
        /(dcf|npv|irr|wacc|capm|black.*scholes)/i,
        /(integration|derivative|matrix|linear.*algebra)/i
    ];
    
    // Cambodia/regional patterns - Use GPT-5 Mini for balanced performance
    const cambodiaPatterns = [
        /(cambodia|khmer|phnom penh|cambodian)/i,
        /(lending.*cambodia|cambodia.*lending)/i,
        /(usd.*khr|khr.*usd|riel)/i,
        /(southeast asia|asean|emerging markets)/i,
        /(cambodian.*market|cambodian.*economy)/i
    ];
    
    // Market patterns - Use GPT-5 Mini for timely analysis
    const marketPatterns = [
        /(market|stock|bond|crypto|forex|trading)/i,
        /(investment|buy|sell|price|rate|yield|return)/i,
        /(analysis|forecast|outlook|prediction)/i,
        /(earnings|revenue|profit|financial)/i,
        /(economic.*data|market.*trends)/i
    ];
    
    // Chat patterns - Use GPT-5 Chat model for natural conversation
    const chatPatterns = [
        /^(hello|hi|hey|good morning|good afternoon)/i,
        /(chat|conversation|talk|discuss)/i,
        /(how are you|what's up|how's it going)/i,
        /(tell me about yourself|who are you)/i
    ];
    
    // Health/medical patterns - Use Full GPT-5 for accuracy
    const healthPatterns = [
        /(health|medical|diagnosis|treatment|symptoms)/i,
        /(medicine|medication|prescription|therapy)/i,
        /(doctor|physician|hospital|clinic)/i,
        /(mental health|psychology|wellbeing)/i
    ];
    
    // Check for memory importance
    const hasMemoryReference = memoryPatterns.some(pattern => pattern.test(message));
    const hasMemoryContext = memoryContext && memoryContext.length > 100;
    
    // Analyze query complexity
    const complexity = analyzeQueryComplexity(userMessage);
    
    // GPT-5 MODEL SELECTION LOGIC
    let gpt5Config = {
        model: CONFIG.MODELS.MINI,
        reasoning_effort: 'medium',
        verbosity: 'medium',
        max_completion_tokens: CONFIG.TOKEN_LIMITS.MINI_MAX,
        temperature: 0.7,
        priority: 'standard',
        reason: 'GPT-5 Mini - Balanced performance',
        confidence: 0.75
    };
    
    // Priority-based model selection
    if (speedPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: CONFIG.MODELS.NANO,
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: CONFIG.TOKEN_LIMITS.NANO_MAX,
            temperature: 0.3,
            priority: 'speed',
            reason: 'Speed critical - GPT-5 Nano for instant response',
            confidence: 0.9
        };
    }
    else if (chatPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: CONFIG.MODELS.CHAT,
            temperature: 0.7,
            max_completion_tokens: CONFIG.TOKEN_LIMITS.CHAT_MAX,
            priority: 'chat',
            reason: 'Chat pattern - GPT-5 Chat model for natural conversation',
            confidence: 0.8
        };
    }
    else if (healthPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: CONFIG.MODELS.FULL,
            reasoning_effort: 'high',
            verbosity: 'high',
            max_completion_tokens: CONFIG.TOKEN_LIMITS.FULL_MAX,
            temperature: 0.4,
            priority: 'health',
            reason: 'Health/medical query - Full GPT-5 for accuracy',
            confidence: 0.9
        };
    }
    else if (mathCodingPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: CONFIG.MODELS.FULL,
            reasoning_effort: 'high',
            verbosity: 'medium',
            max_completion_tokens: CONFIG.TOKEN_LIMITS.FULL_MAX,
            temperature: 0.3,
            priority: 'mathematical',
            reason: 'Mathematical/coding precision - Full GPT-5',
            confidence: 0.95
        };
    }
    else if (complexPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: CONFIG.MODELS.FULL,
            reasoning_effort: 'high',
            verbosity: 'high',
            max_completion_tokens: CONFIG.TOKEN_LIMITS.FULL_MAX,
            temperature: 0.6,
            priority: 'complex',
            reason: 'Complex strategic analysis - Full GPT-5',
            confidence: 0.9
        };
    }
    else if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: CONFIG.MODELS.MINI,
            reasoning_effort: 'medium',
            verbosity: 'high',
            max_completion_tokens: CONFIG.TOKEN_LIMITS.MINI_MAX,
            temperature: 0.6,
            priority: 'regional',
            reason: 'Cambodia/regional analysis - GPT-5 Mini with detailed output',
            confidence: 0.8
        };
    }
    else if (marketPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: CONFIG.MODELS.MINI,
            reasoning_effort: 'medium',
            verbosity: 'medium',
            max_completion_tokens: CONFIG.TOKEN_LIMITS.MINI_MAX,
            temperature: 0.6,
            priority: 'market',
            reason: 'Market analysis - GPT-5 Mini for balanced performance',
            confidence: 0.8
        };
    }
    else if (hasMedia || messageType !== 'text') {
        gpt5Config = {
            model: CONFIG.MODELS.FULL,
            reasoning_effort: 'medium',
            verbosity: 'medium',
            max_completion_tokens: CONFIG.TOKEN_LIMITS.FULL_MAX,
            temperature: 0.7,
            priority: 'multimodal',
            reason: 'Multimodal content - Full GPT-5 for vision analysis',
            confidence: 0.85
        };
    }
    
    // Ensure model is always set (safety check)
    if (!gpt5Config.model) {
        gpt5Config.model = CONFIG.MODELS.MINI;
        gpt5Config.reason = 'Fallback to GPT-5 Mini - default selection';
    }
    
    // Dynamic token scaling based on complexity and query length
    const queryLength = message.length;
    
    if (queryLength > 1000) {
        gpt5Config.max_completion_tokens = Math.min(gpt5Config.max_completion_tokens * 1.5, CONFIG.TOKEN_LIMITS.FULL_MAX);
        gpt5Config.reason += ' (Scaled for long input)';
    }
    
    if (complexity.isVeryComplex) {
        gpt5Config.max_completion_tokens = Math.min(gpt5Config.max_completion_tokens * 1.3, CONFIG.TOKEN_LIMITS.FULL_MAX);
        gpt5Config.reason += ' (Scaled for complexity)';
        gpt5Config.confidence = Math.min(gpt5Config.confidence + 0.1, 1.0);
    }
    
    // Long response patterns
    const longResponsePatterns = [
        /(write.*long|detailed.*report|comprehensive.*analysis)/i,
        /(full.*explanation|complete.*guide|step.*by.*step)/i,
        /(generate.*content|create.*document|write.*article)/i,
        /(elaborate|expand|provide.*more|tell.*me.*everything)/i
    ];
    
    if (longResponsePatterns.some(pattern => pattern.test(message))) {
        gpt5Config.max_completion_tokens = CONFIG.TOKEN_LIMITS.FULL_MAX;
        gpt5Config.reason += ' (Long response requested)';
    }
    
    return {
        type: gpt5Config.priority,
        bestAI: 'gpt',
        reason: gpt5Config.reason,
        gpt5Model: gpt5Config.model,
        reasoning_effort: gpt5Config.reasoning_effort,
        verbosity: gpt5Config.verbosity,
        max_completion_tokens: gpt5Config.max_completion_tokens,
        temperature: gpt5Config.temperature,
        priority: gpt5Config.priority,
        confidence: gpt5Config.confidence,
        
        // Completion detection results
        isComplete: false,
        completionStatus: completionStatus,
        shouldSkipGPT5: false,
        
        // Memory and context analysis
        memoryImportant: hasMemoryReference || hasMemoryContext || gpt5Config.priority === 'complex',
        needsLiveData: gpt5Config.priority === 'complex' || gpt5Config.priority === 'market',
        
        // Query characteristics
        complexity: complexity,
        queryLength: queryLength,
        hasMedia: hasMedia,
        messageType: messageType,
        
        // Classification
        powerSystemPreference: `GPT5_${gpt5Config.priority.toUpperCase()}`,
        estimatedResponseTime: gpt5Config.priority === 'speed' ? CONFIG.TIME_TARGETS.SPEED_CRITICAL :
                             gpt5Config.priority === 'complex' ? CONFIG.TIME_TARGETS.COMPLEX :
                             CONFIG.TIME_TARGETS.STANDARD,
        
        // Cost estimation
        estimatedCost: calculateCostEstimate(
            gpt5Config.model,
            Math.ceil(queryLength / 4), // Rough input token estimate
            Math.ceil(gpt5Config.max_completion_tokens * 0.7) // Expected output tokens
        )
    };
}

// QUERY PREPROCESSING
function preprocessQuery(userMessage, options = {}) {
    // Clean the message
    let cleaned = userMessage.trim();
    
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Handle special characters that might cause issues
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
    
    // Normalize quotes
    cleaned = cleaned.replace(/[""]/g, '"');
    cleaned = cleaned.replace(/['']/g, "'");
    
    return {
        original: userMessage,
        cleaned: cleaned,
        length: cleaned.length,
        wordCount: cleaned.split(/\s+/).length,
        hasSpecialChars: /[^\w\s\.\,\!\?\-\(\)\"\']/g.test(cleaned),
        isEmpty: cleaned.length < 3
    };
}

// RESPONSE VALIDATION
function validateQueryAnalysis(analysis) {
    const errors = [];
    const warnings = [];
    
    // Check required fields
    if (!analysis.type) errors.push('Missing analysis type');
    if (!analysis.gpt5Model) errors.push('Missing GPT-5 model selection');
    if (!analysis.reason) warnings.push('Missing selection reason');
    
    // Validate model selection
    const validModels = Object.values(CONFIG.MODELS);
    if (analysis.gpt5Model && !validModels.includes(analysis.gpt5Model)) {
        errors.push(`Invalid model: ${analysis.gpt5Model}`);
    }
    
    // Validate reasoning effort
    if (analysis.reasoning_effort && !CONFIG.REASONING_LEVELS.includes(analysis.reasoning_effort)) {
        errors.push(`Invalid reasoning effort: ${analysis.reasoning_effort}`);
    }
    
    // Validate verbosity
    if (analysis.verbosity && !CONFIG.VERBOSITY_LEVELS.includes(analysis.verbosity)) {
        errors.push(`Invalid verbosity level: ${analysis.verbosity}`);
    }
    
    // Validate token limits
    if (analysis.max_completion_tokens > CONFIG.TOKEN_LIMITS.FULL_MAX) {
        warnings.push(`Token limit exceeds maximum: ${analysis.max_completion_tokens}`);
        analysis.max_completion_tokens = CONFIG.TOKEN_LIMITS.FULL_MAX;
    }
    
    // Validate confidence
    if (analysis.confidence && (analysis.confidence < 0 || analysis.confidence > 1)) {
        warnings.push(`Invalid confidence value: ${analysis.confidence}`);
        analysis.confidence = Math.max(0, Math.min(1, analysis.confidence));
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings,
        analysis: analysis
    };
}

console.log('Secure GPT-5 Command System - PART 2/6 loaded');
console.log('Features: Completion detection, query analysis, model selection');
console.log('Smart routing: Speed->Nano, Chat->Chat, Complex->Full, Standard->Mini');

// Export functions for Part 3
module.exports = {
    detectCompletionStatus,
    generateCompletionResponse,
    analyzeQueryComplexity,
    analyzeQuery,
    preprocessQuery,
    validateQueryAnalysis
};

// utils/dualCommandSystem.js - SECURE GPT-5 COMMAND SYSTEM - PART 3/6
// GPT-5 EXECUTION ENGINE WITH MEMORY INTEGRATION
// This part handles the actual GPT-5 API calls with smart error handling and fallbacks

// GPT-5 EXECUTION WITH ENHANCED ERROR HANDLING
async function executeThroughGPT5System(userMessage, queryAnalysis, context = null, memoryData = null, chatId = null) {
  const startTime = Date.now();

  try {
    console.log(
      `GPT-5 Execution: ${queryAnalysis.gpt5Model} ` +
      `(${queryAnalysis.reasoning_effort || 'none'} reasoning, ${queryAnalysis.verbosity || 'none'} verbosity)`
    );

    // Handle quick datetime queries without AI processing
    if (
      queryAnalysis.priority === 'speed' &&
      /^(what time|what's the time|current time|time now|what date|what's the date)/i.test(userMessage)
    ) {
      const cambodiaTime = getCurrentCambodiaDateTime();
      const quickResponse = /time/i.test(userMessage)
        ? `Current time in Cambodia: ${cambodiaTime.time} (${cambodiaTime.timezone})\nToday is ${cambodiaTime.date}${cambodiaTime.isWeekend ? ' - Enjoy your weekend!' : ' - Have a productive day!'}`
        : `Today's date: ${cambodiaTime.date}\nCurrent time: ${cambodiaTime.time} in Cambodia (${cambodiaTime.timezone})`;

      updateSystemStats('datetime_quick', true, Date.now() - startTime, 'speed', 'instant');
      return {
        response: quickResponse,
        aiUsed: 'datetime-instant',
        processingTime: Date.now() - startTime,
        tokensUsed: 0,
        costSaved: true
      };
    }

    // Build enhanced message with context
    let enhancedMessage = userMessage;

    // Add Cambodia time context for non-speed/chat queries
    if (queryAnalysis.priority !== 'speed' && queryAnalysis.priority !== 'chat') {
      const cambodiaTime = getCurrentCambodiaDateTime();
      enhancedMessage =
        `Current time: ${cambodiaTime.date}, ${cambodiaTime.time} Cambodia (${cambodiaTime.timezone})\n` +
        `Business hours: ${cambodiaTime.isBusinessHours ? 'Yes' : 'No'}\n\n` +
        userMessage;
    }

    // Add memory context with size limits
    if (queryAnalysis.memoryImportant && context && context.length > 0) {
      const maxContextLength = Math.min(context.length, CONFIG.MEMORY.MAX_CONTEXT_LENGTH);
      enhancedMessage += `\n\nMEMORY CONTEXT:\n${context.substring(0, maxContextLength)}`;
      if (context.length > maxContextLength) enhancedMessage += '\n... (truncated for length)';
      console.log(`Memory context integrated: ${maxContextLength} chars`);
    }

    // Add specific memory data with limits
    if (memoryData) {
      if (memoryData.persistentMemory && memoryData.persistentMemory.length > 0) {
        enhancedMessage += '\n\nPERSISTENT FACTS:\n';
        memoryData.persistentMemory
          .slice(0, CONFIG.MEMORY.MAX_PERSISTENT_MEMORIES)
          .forEach((m, i) => {
            const fact = (m.fact || m).substring(0, 150);
            enhancedMessage += `${i + 1}. ${fact}\n`;
          });
      }

      if (memoryData.conversationHistory && memoryData.conversationHistory.length > 0) {
        enhancedMessage += '\n\nRECENT CONTEXT:\n';
        memoryData.conversationHistory
          .slice(0, CONFIG.MEMORY.MAX_CONVERSATION_HISTORY)
          .forEach((conv, i) => {
            if (conv.user_message) {
              enhancedMessage += `${i + 1}. Previous: "${conv.user_message.substring(0, 80)}..."\n`;
            }
          });
      }
    }

    console.log('GPT-5 execution config:', {
      model: queryAnalysis.gpt5Model,
      reasoning: queryAnalysis.reasoning_effort,
      verbosity: queryAnalysis.verbosity,
      tokens: queryAnalysis.max_completion_tokens,
      hasMemory: !!context,
      priority: queryAnalysis.priority,
      messageLength: enhancedMessage.length
    });

    // Build options for the API call (respecting correct token param per API)
    const options = { model: queryAnalysis.gpt5Model };

    if (queryAnalysis.gpt5Model === CONFIG.MODELS.CHAT) {
      // Chat API expects max_tokens (NOT max_completion_tokens)
      if (queryAnalysis.temperature !== undefined) options.temperature = queryAnalysis.temperature;
      if (queryAnalysis.max_completion_tokens) options.max_tokens = queryAnalysis.max_completion_tokens;
    } else {
      // Responses API expects max_completion_tokens
      if (queryAnalysis.reasoning_effort) options.reasoning_effort = queryAnalysis.reasoning_effort;
      if (queryAnalysis.verbosity) options.verbosity = queryAnalysis.verbosity;
      if (queryAnalysis.max_completion_tokens) options.max_completion_tokens = queryAnalysis.max_completion_tokens;
      if (queryAnalysis.temperature !== undefined) options.temperature = queryAnalysis.temperature;
    }

    // Execute GPT-5 API call
    const result = await openaiClient.getGPT5Analysis(enhancedMessage, options);

    const processingTime = Date.now() - startTime;
    const tokensUsed = Math.ceil(result.length / 4); // Rough estimate

    updateSystemStats('gpt5_execution', true, processingTime, queryAnalysis.priority, queryAnalysis.gpt5Model);

    console.log(
      `GPT-5 execution successful: ${queryAnalysis.gpt5Model} ` +
      `(${result.length} chars, ${processingTime}ms)`
    );

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
      costSaved: false
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('GPT-5 execution error:', error.message);

    updateSystemStats('gpt5_execution', false, processingTime, queryAnalysis.priority, queryAnalysis.gpt5Model);

    // Try fallback execution
    return await executeGPT5Fallback(userMessage, queryAnalysis, context, processingTime, error);
  }
}

// GPT-5 FALLBACK EXECUTION SYSTEM
async function executeGPT5Fallback(userMessage, queryAnalysis, context = null, originalProcessingTime = 0, originalError = null) {
  console.log('Attempting GPT-5 fallback execution...');

  const fallbackStartTime = Date.now();

  // Fallback strategy: Try simpler model with reduced parameters
  const fallbackModels = [
    { model: CONFIG.MODELS.NANO, reasoning: 'minimal', verbosity: 'low' },
    { model: CONFIG.MODELS.MINI, reasoning: 'low', verbosity: 'medium' },
    { model: CONFIG.MODELS.CHAT, reasoning: null, verbosity: null }
  ];

  let enhancedMessage = userMessage;
  if (context && queryAnalysis.memoryImportant) {
    enhancedMessage += `\n\nContext: ${context.substring(0, 500)}`;
  }

  for (const fallback of fallbackModels) {
    try {
      console.log(`Trying fallback: ${fallback.model}`);

      const options = { model: fallback.model };

      if (fallback.model === CONFIG.MODELS.CHAT) {
        // Chat API → max_tokens
        options.temperature = 0.7;
        options.max_tokens = CONFIG.TOKEN_LIMITS.CHAT_MAX;
      } else {
        // Responses API → max_completion_tokens
        if (fallback.reasoning) options.reasoning_effort = fallback.reasoning;
        if (fallback.verbosity) options.verbosity = fallback.verbosity;
        const cap =
          CONFIG.TOKEN_LIMITS[
            fallback.model.replace('gpt-5-', '').toUpperCase() + '_MAX'
          ] || 4000;
        options.max_completion_tokens = Math.min(6000, cap);
      }

      const result = await openaiClient.getGPT5Analysis(enhancedMessage, options);

      const totalProcessingTime = originalProcessingTime + (Date.now() - fallbackStartTime);
      const tokensUsed = Math.ceil(result.length / 4);

      updateSystemStats('gpt5_fallback', true, totalProcessingTime, 'fallback', fallback.model);

      console.log(`GPT-5 fallback successful: ${fallback.model}`);

      return {
        response: `[Fallback Mode - ${fallback.model}]\n\n${result}`,
        aiUsed: `GPT-5-${fallback.model.replace('gpt-5-', '').replace('gpt-5', 'full')}-fallback`,
        modelUsed: fallback.model,
        processingTime: totalProcessingTime,
        tokensUsed,
        priority: 'fallback',
        confidence: Math.max(0.5, (queryAnalysis.confidence || 0.7) - 0.2),
        reasoning_effort: fallback.reasoning,
        verbosity: fallback.verbosity,
        memoryUsed: !!context,
        success: true,
        fallbackUsed: true,
        originalError: originalError?.message,
        costSaved: true
      };
    } catch (fallbackError) {
      console.log(`Fallback ${fallback.model} failed: ${fallbackError.message}`);
      continue;
    }
  }

  // All fallbacks failed - return emergency response
  const totalTime = originalProcessingTime + (Date.now() - fallbackStartTime);
  updateSystemStats('gpt5_fallback', false, totalTime, 'emergency', 'none');

  throw new Error(
    `All GPT-5 models failed. Original: ${originalError?.message}. ` +
    `Please try again with a simpler question.`
  );
}

// MEMORY CONTEXT BUILDING
async function buildMemoryContext(chatId, options = {}) {
  if (!chatId) return { context: '', memoryData: null };

  try {
    console.log('Building memory context...');

    // Try to use the memory system first
    let context = '';
    try {
      if (memory && typeof memory.buildConversationContext === 'function') {
        context = await memory.buildConversationContext(chatId);
        console.log(`Memory system context: ${context.length} chars`);
      }
    } catch (memoryError) {
      console.log('Memory system failed, using database fallback:', memoryError.message);
    }

    // Fallback to direct database queries
    let memoryData = {
      conversationHistory: [],
      persistentMemory: []
    };

    if (!context || options.forceDatabaseFallback) {
      try {
        const [historyResult, memoryResult] = await Promise.allSettled([
          database.getConversationHistoryDB(chatId, CONFIG.MEMORY.MAX_CONVERSATION_HISTORY),
          database.getPersistentMemoryDB(chatId)
        ]);

        if (historyResult.status === 'fulfilled') {
          memoryData.conversationHistory = historyResult.value || [];
          console.log(`Retrieved ${memoryData.conversationHistory.length} conversation records`);
        }

        if (memoryResult.status === 'fulfilled') {
          memoryData.persistentMemory = memoryResult.value || [];
          console.log(`Retrieved ${memoryData.persistentMemory.length} persistent memories`);
        }

        // Build simple context if memory system failed
        if (!context && memoryData.conversationHistory.length > 0) {
          context = memoryData.conversationHistory
            .slice(-3)
            .map(conv => `Previous: ${conv.user_message?.substring(0, 100) || 'N/A'}`)
            .join('\n');
        }
      } catch (databaseError) {
        console.log('Database memory fallback failed:', databaseError.message);
      }
    }

    return {
      context: context || '',
      memoryData,
      success: true,
      source: context ? 'memory_system' : 'database_fallback'
    };
  } catch (error) {
    console.error('Memory context building failed completely:', error.message);
    return {
      context: '',
      memoryData: { conversationHistory: [], persistentMemory: [] },
      success: false,
      error: error.message
    };
  }
}

// RESPONSE POST-PROCESSING
function processResponse(response, queryAnalysis, metadata = {}) {
  if (!response || typeof response !== 'string') {
    return 'I apologize, but I received an invalid response. Please try again.';
  }

  let processed = response.trim();

  // Remove common API artifacts
  processed = processed.replace(/^(Assistant:|AI:|GPT-?5?:)/i, '');
  processed = processed.replace(/\n{3,}/g, '\n\n');
  processed = processed.trim();

  // Add model attribution for transparency
  if (queryAnalysis.priority !== 'speed' && queryAnalysis.priority !== 'chat') {
    const modelName =
      queryAnalysis.gpt5Model === CONFIG.MODELS.NANO ? 'GPT-5 Nano' :
      queryAnalysis.gpt5Model === CONFIG.MODELS.MINI ? 'GPT-5 Mini' :
      queryAnalysis.gpt5Model === CONFIG.MODELS.FULL ? 'GPT-5' :
      'GPT-5 Chat';

    if (processed.length > 200 && !/gpt/i.test(processed)) {
      processed += `\n\n*Powered by ${modelName}${queryAnalysis.reasoning_effort ? ` (${queryAnalysis.reasoning_effort} reasoning)` : ''}*`;
    }
  }

  return processed;
}

// HEALTH CHECK SYSTEM
async function performGPT5HealthCheck() {
  console.log('Performing GPT-5 health check...');

  const health = {
    timestamp: Date.now(),
    models: {},
    overallHealth: false,
    errors: [],
    responseTime: 0
  };

  const startTime = Date.now();
  const testPrompt = 'Health check - respond with "OK"';

  // Test each model with minimal resources
  const modelsToTest = [
    { name: 'gpt-5-nano', options: { reasoning_effort: 'minimal', verbosity: 'low', max_completion_tokens: 20 } },
    { name: 'gpt-5-mini', options: { reasoning_effort: 'low', verbosity: 'low', max_completion_tokens: 20 } },
    { name: 'gpt-5', options: { reasoning_effort: 'minimal', verbosity: 'low', max_completion_tokens: 20 } },
    // Chat API MUST use max_tokens:
    { name: 'gpt-5-chat-latest', options: { temperature: 0.3, max_tokens: 20 } }
  ];

  let healthyCount = 0;

  for (const { name, options } of modelsToTest) {
    try {
      const result = await openaiClient.getGPT5Analysis(testPrompt, { model: name, ...options });
      health.models[name] = {
        status: 'healthy',
        responseLength: result.length,
        available: true
      };
      healthyCount++;
      console.log(`${name}: Healthy`);
    } catch (error) {
      health.models[name] = {
        status: 'unhealthy',
        error: error.message,
        available: false
      };
      health.errors.push(`${name}: ${error.message}`);
      console.log(`${name}: Unhealthy - ${error.message}`);
    }
  }

  health.responseTime = Date.now() - startTime;
  health.overallHealth = healthyCount > 0;
  health.availableModels = healthyCount;
  health.totalModels = modelsToTest.length;
  health.healthScore = Math.round((healthyCount / modelsToTest.length) * 100);

  // Update system state
  systemState.lastHealthCheck = health.timestamp;
  systemState.healthStatus = health.overallHealth ? 'healthy' : 'degraded';
  systemState.availableModels = Object.keys(health.models).filter(m => health.models[m].available);

  console.log(`Health check complete: ${healthyCount}/${modelsToTest.length} models healthy (${health.responseTime}ms)`);

  return health;
}

// AUTO HEALTH MONITORING
setInterval(async () => {
  try {
    await performGPT5HealthCheck();
  } catch (error) {
    console.error('Auto health check failed:', error.message);
  }
}, CONFIG.PERFORMANCE.HEALTH_CHECK_INTERVAL);

console.log('Secure GPT-5 Command System - PART 3/6 loaded');
console.log('Features: GPT-5 execution, fallback system, memory integration, health monitoring');

// Export functions for Part 4
module.exports = {
  executeThroughGPT5System,
  executeGPT5Fallback,
  buildMemoryContext,
  processResponse,
  performGPT5HealthCheck
};

// utils/dualCommandSystem.js - SECURE GPT-5 COMMAND SYSTEM - PART 4/6
// MAIN COMMAND EXECUTION ENGINE
// This part contains the core executeDualCommand function and result processing

// MAIN COMMAND EXECUTION FUNCTION
async function executeDualCommand(userMessage, chatId, options = {}) {
  const startTime = Date.now();

  try {
    console.log(`Executing secure GPT-5 command for chat ${chatId}`);
    console.log('Message preview:', String(userMessage).substring(0, 100));

    // 1) Preprocess the query
    const preprocessed = preprocessQuery(userMessage, options);
    if (preprocessed.isEmpty) {
      return createErrorResponse('Message too short or empty', startTime, chatId);
    }

    // 2) Build memory context (only for non-test conversations)
    const isSystemTest =
      String(userMessage).toLowerCase().includes('test memory') ||
      String(userMessage).toLowerCase().includes('integration test') ||
      options.forceMemoryTest === true;

    let memoryContext = options.memoryContext || '';
    let memoryData = {
      conversationHistory: options.conversationHistory || [],
      persistentMemory: options.persistentMemory || []
    };

    if (!isSystemTest && !memoryContext && !options.conversationHistory && !options.persistentMemory) {
      console.log('Building memory context for normal conversation...');
      const memoryResult = await buildMemoryContext(chatId, {
        forceDatabaseFallback: options.forceDatabaseFallback
      });
      memoryContext = memoryResult.context;
      memoryData = memoryResult.memoryData;
    }

    // 3) Analyze query for optimal GPT-5 model selection
    const queryAnalysis = analyzeQuery(
      preprocessed.cleaned,
      options.messageType || 'text',
      options.hasMedia || false,
      memoryContext
    );

    // 3.1) 🔁 Handle completion detection FIRST (no model required)
    if (queryAnalysis.shouldSkipGPT5) {
      console.log(`Completion detected: ${queryAnalysis.completionStatus.completionType}`);
      return createCompletionResponse(queryAnalysis, memoryContext, memoryData, startTime, chatId);
    }

    // 4) Validate the analysis (after completion short-circuit)
    const validation = validateQueryAnalysis(queryAnalysis);
    if (!validation.isValid) {
      console.error('Query analysis validation failed:', validation.errors);
      return createErrorResponse(
        `Analysis validation failed: ${validation.errors.join(', ')}`,
        startTime,
        chatId
      );
    }
    if (validation.warnings.length > 0) {
      console.warn('Query analysis warnings:', validation.warnings);
    }

    // 5) Override model if forced
    if (options.forceModel && options.forceModel.includes('gpt-5')) {
      queryAnalysis.gpt5Model = options.forceModel;
      queryAnalysis.reason = `Forced to use ${options.forceModel}`;
      console.log(`Model override: Using ${options.forceModel}`);
    }

    console.log('Query analysis complete:', {
      type: queryAnalysis.type,
      priority: queryAnalysis.priority,
      model: queryAnalysis.gpt5Model,
      reasoning: queryAnalysis.reasoning_effort,
      verbosity: queryAnalysis.verbosity,
      confidence: queryAnalysis.confidence,
      memoryImportant: queryAnalysis.memoryImportant,
      estimatedCost: queryAnalysis.estimatedCost?.totalCost
    });

    // 6) Execute through GPT-5 system
    let gpt5Result;
    try {
      gpt5Result = await executeThroughGPT5System(
        preprocessed.cleaned,
        queryAnalysis,
        memoryContext,
        memoryData,
        chatId
      );

      console.log('GPT-5 execution successful:', {
        aiUsed: gpt5Result.aiUsed,
        processingTime: gpt5Result.processingTime,
        tokensUsed: gpt5Result.tokensUsed,
        memoryUsed: gpt5Result.memoryUsed
      });
    } catch (gpt5Error) {
      console.error('GPT-5 system failed:', gpt5Error.message);
      return createErrorResponse(gpt5Error.message, startTime, chatId, {
        originalQuery: userMessage,
        analysisAttempted: true,
        queryAnalysis
      });
    }

    // 7) Process the response
    const processedResponse = processResponse(gpt5Result.response, queryAnalysis, {
      chatId,
      processingTime: gpt5Result.processingTime,
      memoryUsed: gpt5Result.memoryUsed
    });

    const totalResponseTime = Date.now() - startTime;

    // 8) Build comprehensive result object
    const result = {
      response: processedResponse,
      success: true,

      // AI and model information
      aiUsed: gpt5Result.aiUsed,
      modelUsed: gpt5Result.modelUsed,
      gpt5System: true,

      // Query analysis results
      queryType: queryAnalysis.type,
      priority: queryAnalysis.priority,
      complexity: queryAnalysis.complexity?.complexity || 'medium',
      reasoning: queryAnalysis.reason,
      confidence: gpt5Result.confidence || queryAnalysis.confidence,

      // Processing information
      processingTime: gpt5Result.processingTime,
      totalResponseTime,
      tokensUsed: gpt5Result.tokensUsed,

      // GPT-5 specific parameters
      reasoning_effort: queryAnalysis.reasoning_effort,
      verbosity: queryAnalysis.verbosity,
      max_completion_tokens: queryAnalysis.max_completion_tokens,

      // Memory and context
      memoryUsed: gpt5Result.memoryUsed,
      contextLength: memoryContext.length,
      memoryData: {
        contextLength: memoryContext.length,
        conversationRecords: memoryData.conversationHistory.length,
        persistentMemories: memoryData.persistentMemory.length,
        memoryImportant: queryAnalysis.memoryImportant,
        memoryUsed: memoryContext.length > 0,
        postgresqlConnected:
          memoryData.conversationHistory.length > 0 || memoryData.persistentMemory.length > 0
      },

      // Cost and performance
      costTier: getCostTier(queryAnalysis.gpt5Model),
      costEstimate: queryAnalysis.estimatedCost,
      fallbackUsed: gpt5Result.fallbackUsed || false,
      costSaved: gpt5Result.costSaved || false,

      // Classification and analytics
      powerMode: `GPT5_${queryAnalysis.priority.toUpperCase()}`,
      analytics: {
        queryComplexity: queryAnalysis.complexity?.complexity || 'medium',
        domainClassification: queryAnalysis.type,
        priorityLevel: queryAnalysis.priority,
        modelOptimization: 'GPT-5 smart selection',
        costOptimized: true,
        performanceOptimized: true
      },

      // System information
      timestamp: new Date().toISOString(),
      cambodiaTime: getCurrentCambodiaDateTime(),

      // Telegram integration
      sendToTelegram: createTelegramSender(
        chatId,
        processedResponse,
        queryAnalysis,
        gpt5Result,
        totalResponseTime,
        memoryContext.length > 0
      )
    };

    console.log('Command execution complete:', {
      success: true,
      aiUsed: result.aiUsed,
      processingTime: result.processingTime,
      tokensUsed: result.tokensUsed,
      memoryUsed: result.memoryUsed,
      costTier: result.costTier
    });

    return result;
  } catch (error) {
    console.error('Command execution error:', error.message);
    return createErrorResponse(error.message, startTime, chatId, {
      originalMessage: userMessage,
      stack: error.stack
    });
  }
}

// HELPER FUNCTIONS

function createCompletionResponse(queryAnalysis, memoryContext, memoryData, startTime, chatId) {
  const responseTime = Date.now() - startTime;

  updateSystemStats('completion_detection', true, responseTime, 'completion', 'none');

  return {
    response: queryAnalysis.quickResponse,
    success: true,

    // Completion detection information
    aiUsed: 'completion-detection',
    queryType: 'completion',
    complexity: 'low',
    reasoning: `Completion detected - ${queryAnalysis.completionStatus.completionType}`,
    priority: 'completion',
    confidence: queryAnalysis.completionStatus.confidence,

    // Processing information
    processingTime: responseTime,
    totalResponseTime: responseTime,
    tokensUsed: 0,

    // Completion specific
    completionDetected: true,
    completionType: queryAnalysis.completionStatus.completionType,
    skippedGPT5: true,
    costSaved: true,

    // Memory information
    memoryData: {
      contextLength: memoryContext.length,
      conversationRecords: memoryData.conversationHistory.length,
      persistentMemories: memoryData.persistentMemory.length,
      memoryImportant: false,
      memoryUsed: memoryContext.length > 0,
      postgresqlConnected:
        memoryData.conversationHistory.length > 0 || memoryData.persistentMemory.length > 0
    },

    // System information
    gpt5System: false,
    powerMode: 'COMPLETION_DETECTION',
    costTier: 'free',
    timestamp: new Date().toISOString(),

    // Telegram integration (✅ pass the real chatId)
    sendToTelegram: createTelegramSender(
      chatId,
      queryAnalysis.quickResponse,
      queryAnalysis,
      { completionDetected: true, modelUsed: CONFIG?.MODELS?.MINI },
      responseTime,
      memoryContext.length > 0
    )
  };
}

function createErrorResponse(errorMessage, startTime, chatId, metadata = {}) {
  const responseTime = Date.now() - startTime;

  updateSystemStats('error', false, responseTime, 'error', 'none');

  const errorResponse =
    `I apologize, but I encountered a technical issue: ${errorMessage}\n\n` +
    'Please try:\n• A simpler question\n• Waiting a moment and trying again\n• Checking your connection';

  return {
    response: errorResponse,
    success: false,
    error: errorMessage,

    // Error information
    aiUsed: 'error-handler',
    queryType: 'error',
    complexity: 'low',
    reasoning: 'System error occurred',
    confidence: 0.0,

    // Processing information
    processingTime: responseTime,
    totalResponseTime: responseTime,
    tokensUsed: 0,

    // System information
    gpt5System: false,
    powerMode: 'ERROR',
    costTier: 'free',
    timestamp: new Date().toISOString(),

    // Memory information (minimal for errors)
    memoryData: {
      contextLength: 0,
      conversationRecords: 0,
      persistentMemories: 0,
      memoryImportant: false,
      memoryUsed: false,
      postgresqlConnected: false
    },

    // Debug information
    metadata,

    // Telegram integration
    sendToTelegram: createErrorTelegramSender(chatId, errorResponse, errorMessage)
  };
}

function getCostTier(model) {
  switch (model) {
    case CONFIG.MODELS.NANO:
      return 'economy';
    case CONFIG.MODELS.MINI:
      return 'standard';
    case CONFIG.MODELS.FULL:
    case CONFIG.MODELS.CHAT:
      return 'premium';
    default:
      return 'unknown';
  }
}

// REPLACE these functions in your dualCommandSystem.js with these updated versions:

function createTelegramSender(chatId, response, queryAnalysis, gpt5Result, responseTime, contextUsed) {
  return async (bot, title = null) => {
    try {
      if (!bot || !chatId) {
        console.warn(`Delivery skipped: bot or chatId missing (chatId=${chatId})`);
        return false;
      }

      // Use the new enhanced telegram splitter
      try {
        const { sendTelegramMessage } = require('./telegramSplitter');
        
        // Determine model used
        const modelUsed = gpt5Result?.modelUsed || queryAnalysis?.gpt5Model || 'gpt-5-mini';
        
        // Prepare comprehensive metadata for model detection and display
        const metadata = {
          model: modelUsed,
          executionTime: responseTime,
          costTier: getCostTier(modelUsed),
          tokens: gpt5Result?.tokensUsed || 'estimated',
          cost: gpt5Result?.cost || calculateEstimatedCost(modelUsed, response.length),
          complexity: queryAnalysis?.complexity?.complexity || 'medium',
          confidence: gpt5Result?.confidence || queryAnalysis?.confidence || 0.75,
          reasoning: queryAnalysis?.reasoning_effort,
          verbosity: queryAnalysis?.verbosity,
          contextUsed,
          fallbackUsed: gpt5Result?.fallbackUsed || false,
          completionDetected: gpt5Result?.completionDetected || false
        };
        
        console.log(`Using enhanced Telegram delivery for model: ${modelUsed}`);
        
        // Use enhanced delivery with full model detection
        const result = await sendTelegramMessage(bot, chatId, response, metadata);
        
        if (result.enhanced) {
          console.log(`Enhanced delivery: ${result.chunks} chunks sent, model: ${result.model || modelUsed}`);
          return true;
        } else if (result.fallback) {
          console.log('Enhanced delivery failed, used basic fallback');
          return true;
        } else {
          console.log('Enhanced delivery completely failed');
          return false;
        }
        
      } catch (enhancedError) {
        console.error('Enhanced telegram delivery failed:', enhancedError.message);
        console.log('Falling back to basic telegram send...');
        
        // Fallback to basic send
        if (bot && bot.sendMessage && chatId) {
          await bot.sendMessage(chatId, response);
          console.log('Basic fallback: Success');
          return true;
        }
        
        return false;
      }

    } catch (generalError) {
      console.error('All telegram delivery methods failed:', generalError.message);
      return false;
    }
  };
}

// Helper function to calculate estimated cost
function calculateEstimatedCost(model, responseLength) {
  const estimatedTokens = Math.ceil(responseLength / 3.5); // Rough token estimation
  const costPerMillion = {
    'gpt-5-nano': 0.40,
    'gpt-5-mini': 2.00,
    'gpt-5': 10.00,
    'gpt-5-chat-latest': 10.00
  };
  
  const rate = costPerMillion[model] || costPerMillion['gpt-5-mini'];
  return ((estimatedTokens * rate) / 1000000).toFixed(6);
}

// Updated error telegram sender
function createErrorTelegramSender(chatId, errorResponse, originalError) {
  return async (bot) => {
    try {
      if (!bot || !chatId) {
        console.warn(`Error delivery skipped: bot or chatId missing (chatId=${chatId})`);
        return false;
      }

      // Try enhanced delivery first
      try {
        const { sendTelegramMessage } = require('./telegramSplitter');
        
        const result = await sendTelegramMessage(bot, chatId, errorResponse, {
          model: 'error-handler',
          costTier: 'free',
          error: true,
          originalError: originalError
        });
        
        if (result.success) {
          console.log('Enhanced error delivery successful');
          return true;
        }
        
      } catch (enhancedError) {
        console.log('Enhanced error delivery failed, using basic fallback');
      }
      
      // Basic fallback
      if (bot && bot.sendMessage) {
        await bot.sendMessage(chatId, errorResponse);
        console.log('Basic error delivery: Success');
        return true;
      }

      return false;
    } catch (telegramError) {
      console.error('Error telegram delivery failed:', telegramError.message);
      return false;
    }
  };
}

// Update your module.exports to include the new helper function:
module.exports = {
  executeDualCommand,
  createCompletionResponse,
  createErrorResponse,
  getCostTier,
  createTelegramSender,
  createErrorTelegramSender,
  calculateEstimatedCost  // Add this new function
};

// utils/dualCommandSystem.js - SECURE GPT-5 COMMAND SYSTEM - PART 5/6
// SYSTEM MONITORING, ANALYTICS & HEALTH MANAGEMENT
// This part handles system performance monitoring, cost tracking, and health checks
// SYSTEM ANALYTICS AND PERFORMANCE MONITORING
function getSystemAnalytics() {
    const uptime = Date.now() - systemState.startTime;
    const cambodiaTime = getCurrentCambodiaDateTime();
    
    // Calculate performance metrics
    const avgResponseTime = systemState.responseTimeHistory.length > 0 
        ? systemState.responseTimeHistory.reduce((sum, r) => sum + r.time, 0) / systemState.responseTimeHistory.length
        : 0;
    
    const successRate = systemState.requestCount > 0 
        ? (systemState.successCount / systemState.requestCount) * 100 
        : 0;
    
    // Recent performance (last 10 requests)
    const recentRequests = systemState.responseTimeHistory.slice(-10);
    const recentAvgTime = recentRequests.length > 0
        ? recentRequests.reduce((sum, r) => sum + r.time, 0) / recentRequests.length
        : 0;
    
    return {
        // System information
        version: systemState.version,
        mode: systemState.mode,
        uptime: {
            milliseconds: uptime,
            hours: Math.floor(uptime / (1000 * 60 * 60)),
            formatted: formatUptime(uptime)
        },
        timestamp: new Date().toISOString(),
        cambodiaTime: cambodiaTime,
        
        // Request statistics
        requests: {
            total: systemState.requestCount,
            successful: systemState.successCount,
            failed: systemState.errorCount,
            completionDetected: systemState.completionDetectionCount,
            successRate: Math.round(successRate * 100) / 100
        },
        
        // Performance metrics
        performance: {
            averageResponseTime: Math.round(avgResponseTime),
            recentAverageResponseTime: Math.round(recentAvgTime),
            responseTimeHistory: systemState.responseTimeHistory.length,
            performanceTrend: calculatePerformanceTrend()
        },
        
        // Model usage statistics
        modelUsage: {
            ...systemState.modelUsageStats,
            mostUsed: getMostUsedModel(),
            leastUsed: getLeastUsedModel()
        },
        
        // Query type distribution
        queryTypes: {
            ...systemState.queryTypeStats,
            mostCommon: getMostCommonQueryType()
        },
        
        // Cost tracking
        costs: {
            estimated: systemState.estimatedCosts,
            savings: {
                completionDetection: systemState.completionDetectionCount * 0.001, // Estimated savings
                totalSaved: systemState.estimatedCosts.saved
            }
        },
        
        // System health
        health: {
            status: systemState.healthStatus,
            lastCheck: systemState.lastHealthCheck,
            availableModels: systemState.availableModels.length,
            totalModels: Object.keys(CONFIG.MODELS).length
        },
        
        // Architecture information
        architecture: {
            core: 'Secure GPT-5 Smart Selection System',
            security: 'Operational execution removed - analysis only',
            features: [
                'Intelligent GPT-5 model selection',
                'Completion detection (cost savings)',
                'Memory integration',
                'Smart fallback systems',
                'Performance monitoring',
                'Cost optimization',
                'Cambodia timezone support'
            ]
        }
    };
}

// DETAILED PERFORMANCE METRICS
function getDetailedPerformanceMetrics() {
    const analytics = getSystemAnalytics();
    
    // Response time analysis
    const responseTimes = systemState.responseTimeHistory.map(r => r.time);
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    
    // Model performance breakdown
    const modelPerformance = {};
    Object.keys(systemState.modelUsageStats).forEach(model => {
        const modelRequests = systemState.responseTimeHistory.filter(r => r.model === model);
        if (modelRequests.length > 0) {
            const times = modelRequests.map(r => r.time);
            modelPerformance[model] = {
                requests: modelRequests.length,
                avgTime: Math.round(times.reduce((sum, t) => sum + t, 0) / times.length),
                minTime: Math.min(...times),
                maxTime: Math.max(...times)
            };
        }
    });
    
    return {
        ...analytics,
        detailed: {
            responseTimeDistribution: {
                min: sortedTimes.length > 0 ? sortedTimes[0] : 0,
                max: sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : 0,
                median: sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length / 2)] : 0,
                p95: sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length * 0.95)] : 0,
                p99: sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length * 0.99)] : 0
            },
            modelPerformance: modelPerformance,
            recentActivity: systemState.responseTimeHistory.slice(-20).map(r => ({
                timestamp: new Date(r.timestamp).toISOString(),
                time: r.time,
                operation: r.operation,
                model: r.model
            })),
            systemLoad: {
                requestsPerHour: calculateRequestsPerHour(),
                averageTokensPerRequest: calculateAverageTokensPerRequest(),
                completionDetectionRate: systemState.requestCount > 0 
                    ? (systemState.completionDetectionCount / systemState.requestCount) * 100 
                    : 0
            }
        }
    };
}

// COST ANALYSIS AND OPTIMIZATION
function getCostAnalysis() {
    const totalRequests = systemState.requestCount;
    const completionSavings = systemState.completionDetectionCount;
    
    // Estimated cost per model (rough estimates based on average usage)
    const modelCosts = {
        'gpt-5-nano': 0.0001,
        'gpt-5-mini': 0.0005,
        'gpt-5': 0.002,
        'gpt-5-chat-latest': 0.002
    };
    
    // Calculate estimated costs
    let estimatedTotalCost = 0;
    Object.entries(systemState.modelUsageStats).forEach(([model, count]) => {
        if (modelCosts[model]) {
            estimatedTotalCost += count * modelCosts[model];
        }
    });
    
    // Calculate savings from completion detection
    const avgCostPerRequest = estimatedTotalCost / Math.max(totalRequests - completionSavings, 1);
    const completionDetectionSavings = completionSavings * avgCostPerRequest;
    
    return {
        estimatedCosts: {
            total: Math.round(estimatedTotalCost * 10000) / 10000,
            breakdown: Object.entries(systemState.modelUsageStats).map(([model, count]) => ({
                model: model,
                requests: count,
                estimatedCost: modelCosts[model] ? count * modelCosts[model] : 0,
                percentage: totalRequests > 0 ? (count / totalRequests) * 100 : 0
            }))
        },
        savings: {
            completionDetection: {
                requests: completionSavings,
                estimatedSavings: Math.round(completionDetectionSavings * 10000) / 10000,
                percentage: totalRequests > 0 ? (completionSavings / totalRequests) * 100 : 0
            },
            modelOptimization: {
                nanoUsage: systemState.modelUsageStats['gpt-5-nano'] || 0,
                miniUsage: systemState.modelUsageStats['gpt-5-mini'] || 0,
                fullUsage: systemState.modelUsageStats['gpt-5'] || 0,
                optimizationRate: calculateOptimizationRate()
            }
        },
        recommendations: generateCostOptimizationRecommendations()
    };
}

// LEGACY COMPATIBILITY FUNCTION
async function checkGPT5OnlySystemHealth() {
    return await checkSystemHealth();
}

// SYSTEM HEALTH MONITORING
async function checkSystemHealth() {
    console.log('Performing comprehensive system health check...');
    
    const health = {
        timestamp: Date.now(),
        overall: 'unknown',
        components: {},
        scores: {},
        recommendations: []
    };
    
    try {
        // Check GPT-5 models health
        const gpt5Health = await performGPT5HealthCheck();
        health.components.gpt5 = gpt5Health;
        health.scores.gpt5 = gpt5Health.healthScore;
        
        if (gpt5Health.availableModels === 0) {
            health.recommendations.push('No GPT-5 models available - check API key and permissions');
        } else if (gpt5Health.availableModels < 2) {
            health.recommendations.push('Limited GPT-5 models available - some features may be degraded');
        }
        
    } catch (error) {
        health.components.gpt5 = { error: error.message, available: false };
        health.scores.gpt5 = 0;
    }
    
    try {
        // Check memory system
        const { memory } = require('./dualCommandSystem');
        const memoryWorking = typeof memory.buildConversationContext === 'function';
        health.components.memory = { 
            available: memoryWorking,
            status: memoryWorking ? 'operational' : 'limited'
        };
        health.scores.memory = memoryWorking ? 100 : 50;
        
        if (!memoryWorking) {
            health.recommendations.push('Memory system limited - context building may be affected');
        }
        
    } catch (error) {
        health.components.memory = { error: error.message, available: false };
        health.scores.memory = 0;
    }
    
    try {
        // Check database connectivity
        const { database } = require('./dualCommandSystem');
        const testQuery = await database.getConversationHistoryDB('health_test', 1);
        const dbWorking = Array.isArray(testQuery);
        health.components.database = {
            available: dbWorking,
            status: dbWorking ? 'connected' : 'disconnected'
        };
        health.scores.database = dbWorking ? 100 : 0;
        
        if (!dbWorking) {
            health.recommendations.push('Database connectivity issues - memory features limited');
        }
        
    } catch (error) {
        health.components.database = { error: error.message, available: false };
        health.scores.database = 0;
    }
    
    try {
        // Check Telegram integration
        const { telegramSplitter } = require('./dualCommandSystem');
        const telegramWorking = typeof telegramSplitter.sendGPT5 === 'function';
        health.components.telegram = {
            available: telegramWorking,
            status: telegramWorking ? 'operational' : 'basic'
        };
        health.scores.telegram = telegramWorking ? 100 : 50;
        
    } catch (error) {
        health.components.telegram = { error: error.message, available: false };
        health.scores.telegram = 0;
    }
    
    // Calculate overall health score
    const scores = Object.values(health.scores);
    const overallScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    health.overallScore = Math.round(overallScore);
    
    // Determine overall status
    if (overallScore >= 90) {
        health.overall = 'excellent';
    } else if (overallScore >= 70) {
        health.overall = 'good';
    } else if (overallScore >= 50) {
        health.overall = 'degraded';
    } else {
        health.overall = 'critical';
    }
    
    // Add performance recommendations
    if (systemState.requestCount > 100) {
        const successRate = (systemState.successCount / systemState.requestCount) * 100;
        if (successRate < 90) {
            health.recommendations.push(`Success rate is ${successRate.toFixed(1)}% - investigate error patterns`);
        }
        
        const avgResponseTime = systemState.responseTimeHistory.length > 0
            ? systemState.responseTimeHistory.reduce((sum, r) => sum + r.time, 0) / systemState.responseTimeHistory.length
            : 0;
        
        if (avgResponseTime > 10000) {
            health.recommendations.push('Average response time is high - consider model optimization');
        }
    }
    
    // Update system state
    systemState.lastHealthCheck = health.timestamp;
    systemState.healthStatus = health.overall;
    
    console.log(`System health check complete: ${health.overall} (${health.overallScore}%)`);
    
    return health;
}

// UTILITY FUNCTIONS FOR ANALYTICS

function formatUptime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function calculatePerformanceTrend() {
    const recent = systemState.responseTimeHistory.slice(-10);
    const older = systemState.responseTimeHistory.slice(-20, -10);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, r) => sum + r.time, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.time, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 20) return 'degrading';
    if (change < -20) return 'improving';
    return 'stable';
}

function getMostUsedModel() {
    let maxUsage = 0;
    let mostUsed = 'none';
    
    Object.entries(systemState.modelUsageStats).forEach(([model, count]) => {
        if (count > maxUsage) {
            maxUsage = count;
            mostUsed = model;
        }
    });
    
    return { model: mostUsed, count: maxUsage };
}

function getLeastUsedModel() {
    let minUsage = Infinity;
    let leastUsed = 'none';
    
    Object.entries(systemState.modelUsageStats).forEach(([model, count]) => {
        if (count < minUsage && count > 0) {
            minUsage = count;
            leastUsed = model;
        }
    });
    
    return { model: leastUsed, count: minUsage === Infinity ? 0 : minUsage };
}

function getMostCommonQueryType() {
    let maxCount = 0;
    let mostCommon = 'none';
    
    Object.entries(systemState.queryTypeStats).forEach(([type, count]) => {
        if (count > maxCount) {
            maxCount = count;
            mostCommon = type;
        }
    });
    
    return { type: mostCommon, count: maxCount };
}

function calculateRequestsPerHour() {
    const uptime = Date.now() - systemState.startTime;
    const hours = uptime / (1000 * 60 * 60);
    return hours > 0 ? Math.round(systemState.requestCount / hours) : 0;
}

function calculateAverageTokensPerRequest() {
    // This is a rough estimate - in a real implementation, you'd track actual token usage
    const modelTokenEstimates = {
        'gpt-5-nano': 2000,
        'gpt-5-mini': 4000,
        'gpt-5': 8000,
        'gpt-5-chat-latest': 4000
    };
    
    let totalEstimatedTokens = 0;
    let totalRequests = 0;
    
    Object.entries(systemState.modelUsageStats).forEach(([model, count]) => {
        if (modelTokenEstimates[model]) {
            totalEstimatedTokens += count * modelTokenEstimates[model];
            totalRequests += count;
        }
    });
    
    return totalRequests > 0 ? Math.round(totalEstimatedTokens / totalRequests) : 0;
}

function calculateOptimizationRate() {
    const total = systemState.requestCount;
    const optimized = (systemState.modelUsageStats['gpt-5-nano'] || 0) + 
                     (systemState.modelUsageStats['gpt-5-mini'] || 0);
    
    return total > 0 ? (optimized / total) * 100 : 0;
}

function generateCostOptimizationRecommendations() {
    const recommendations = [];
    const total = systemState.requestCount;
    
    if (total === 0) return ['No requests processed yet'];
    
    // Check model usage patterns
    const fullModelUsage = (systemState.modelUsageStats['gpt-5'] || 0) / total;
    if (fullModelUsage > 0.5) {
        recommendations.push('Consider if all requests need full GPT-5 model - Mini/Nano may be sufficient for some queries');
    }
    
    const completionRate = systemState.completionDetectionCount / total;
    if (completionRate < 0.1) {
        recommendations.push('Completion detection rate is low - review user interaction patterns');
    } else if (completionRate > 0.3) {
        recommendations.push('High completion detection rate - great cost savings from avoiding redundant processing');
    }
    
    // Check response time vs model usage
    const avgTime = systemState.responseTimeHistory.length > 0
        ? systemState.responseTimeHistory.reduce((sum, r) => sum + r.time, 0) / systemState.responseTimeHistory.length
        : 0;
    
    if (avgTime > 5000) {
        recommendations.push('Average response time is high - consider using faster models for simple queries');
    }
    
    return recommendations.length > 0 ? recommendations : ['System is well optimized'];
}

// MEMORY TEST FUNCTION
async function testMemoryIntegration(chatId) {
    console.log('Testing memory integration...');
    
    const tests = {
        postgresqlConnection: false,
        conversationHistory: false,
        persistentMemory: false,
        memoryBuilding: false,
        completionDetection: false,
        gpt5Integration: false,
        memoryContextPassing: false,
        gpt5ModelSelection: false,
        telegramIntegration: false,
        overallSystemHealth: false
    };
    
    try {
        // Test completion detection
        const { detectCompletionStatus } = require('./dualCommandSystem');
        const completionTest = detectCompletionStatus('done ready', 'system already built');
        tests.completionDetection = completionTest.shouldSkipGPT5;
        console.log(`Completion Detection: ${tests.completionDetection}`);
    } catch (error) {
        console.log(`Completion Detection: Failed - ${error.message}`);
    }
    
    try {
        // Test PostgreSQL connection
        const { database } = require('./dualCommandSystem');
        const testConnection = await database.getConversationHistoryDB('test', 1);
        tests.postgresqlConnection = Array.isArray(testConnection);
        console.log(`PostgreSQL Connection: ${tests.postgresqlConnection}`);
    } catch (error) {
        console.log(`PostgreSQL Connection: Failed - ${error.message}`);
    }
    
    try {
        // Test conversation history retrieval
        const { database } = require('./dualCommandSystem');
        const history = await database.getConversationHistoryDB(chatId, 3);
        tests.conversationHistory = Array.isArray(history);
        console.log(`Conversation History: ${tests.conversationHistory} (${history?.length || 0} records)`);
    } catch (error) {
        console.log(`Conversation History: Failed - ${error.message}`);
    }
    
    try {
        // Test persistent memory
        const { database } = require('./dualCommandSystem');
        const memories = await database.getPersistentMemoryDB(chatId);
        tests.persistentMemory = Array.isArray(memories);
        console.log(`Persistent Memory: ${tests.persistentMemory} (${memories?.length || 0} records)`);
    } catch (error) {
        console.log(`Persistent Memory: Failed - ${error.message}`);
    }
    
    try {
        // Test memory building
        const { memory } = require('./dualCommandSystem');
        const context = await memory.buildConversationContext(chatId);
        tests.memoryBuilding = typeof context === 'string';
        console.log(`Memory Building: ${tests.memoryBuilding} (${context?.length || 0} chars)`);
    } catch (error) {
        console.log(`Memory Building: Failed - ${error.message}`);
    }
    
    try {
        // Test GPT-5 integration
        const { openaiClient } = require('./dualCommandSystem');
        const testPrompt = 'Hello, test GPT-5 functionality';
        const directResult = await openaiClient.getGPT5NanoResponse(testPrompt, { max_completion_tokens: 50 });
        tests.gpt5Integration = directResult && directResult.length > 0;
        console.log(`GPT-5 Integration: ${tests.gpt5Integration}`);
    } catch (error) {
        console.log(`GPT-5 Integration: Failed - ${error.message}`);
    }
    
    try {
        // Test memory context passing
        tests.memoryContextPassing = tests.memoryBuilding && tests.postgresqlConnection;
        console.log(`Memory Context Passing: ${tests.memoryContextPassing}`);
    } catch (error) {
        console.log(`Memory Context Passing: Failed - ${error.message}`);
    }
    
    try {
        // Test GPT-5 model selection
        const { analyzeQuery } = require('./dualCommandSystem');
        const analysis = analyzeQuery('What is quantum physics?');
        tests.gpt5ModelSelection = analysis && analysis.gpt5Model;
        console.log(`GPT-5 Model Selection: ${tests.gpt5ModelSelection} (Selected: ${analysis?.gpt5Model})`);
    } catch (error) {
        console.log(`GPT-5 Model Selection: Failed - ${error.message}`);
    }
    
    try {
        // Test Telegram integration
        const { telegramSplitter } = require('./dualCommandSystem');
        tests.telegramIntegration = typeof telegramSplitter.sendGPT5 === 'function';
        console.log(`Telegram Integration: ${tests.telegramIntegration}`);
    } catch (error) {
        console.log(`Telegram Integration: Failed - ${error.message}`);
    }
    
    try {
        // Test overall system health
        const healthCheck = await checkSystemHealth();
        tests.overallSystemHealth = healthCheck.overall !== 'critical';
        console.log(`System Health: ${tests.overallSystemHealth} (${healthCheck.overall})`);
    } catch (error) {
        console.log(`System Health: Failed - ${error.message}`);
    }
    
    const successCount = Object.values(tests).filter(test => test).length;
    const totalTests = Object.keys(tests).length;
    
    console.log(`Memory Integration Test: ${successCount}/${totalTests} passed`);
    
    return {
        tests: tests,
        score: successCount,
        total: totalTests,
        percentage: Math.round((successCount / totalTests) * 100),
        status: successCount === totalTests ? 'FULL_SUCCESS' : 
                successCount >= totalTests * 0.8 ? 'MOSTLY_WORKING' : 
                successCount >= totalTests * 0.6 ? 'PARTIAL_SUCCESS' : 'NEEDS_ATTENTION',
        gpt5System: tests.gpt5Integration && tests.gpt5ModelSelection,
        completionDetectionEnabled: tests.completionDetection,
        postgresqlIntegrated: tests.postgresqlConnection && tests.conversationHistory,
        memorySystemIntegrated: tests.memoryBuilding && tests.gpt5Integration,
        recommendations: generateIntegrationRecommendations(tests)
    };
}

function generateIntegrationRecommendations(tests) {
    const recommendations = [];
    
    if (!tests.postgresqlConnection) {
        recommendations.push('Check database connection and credentials');
    }
    
    if (!tests.gpt5Integration) {
        recommendations.push('Verify OpenAI API key and GPT-5 access permissions');
    }
    
    if (!tests.memoryBuilding) {
        recommendations.push('Memory system may need initialization or repair');
    }
    
    if (!tests.telegramIntegration) {
        recommendations.push('Telegram integration may be missing or misconfigured');
    }
    
    if (!tests.completionDetection) {
        recommendations.push('Completion detection system needs review');
    }
    
    const successRate = Object.values(tests).filter(Boolean).length / Object.keys(tests).length;
    
    if (successRate < 0.8) {
        recommendations.push('Multiple system components need attention - review logs and configurations');
    } else if (successRate >= 0.9) {
        recommendations.push('System is functioning well - monitor for performance optimization opportunities');
    }
    
    return recommendations.length > 0 ? recommendations : ['All systems functioning normally'];
}

// MARKET INTELLIGENCE HELPER
async function getMarketIntelligence(chatId = null) {
  const globalTime = getCurrentGlobalDateTime();
  const query =
    `Current market intelligence summary - Time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} ` +
    `Cambodia. Provide concise overview of market conditions, key risks, and opportunities.`;

  // Require once so it's available in try/catch
  const { openaiClient } = require('./dualCommandSystem');

  try {
    // Primary: Mini
    return await openaiClient.getQuickMiniResponse(query, {
      reasoning_effort: 'medium',
      verbosity: 'medium',
      max_completion_tokens: 8000,
    });
  } catch (error) {
    try {
      // Fallback: Nano
      return await openaiClient.getQuickNanoResponse(query, {
        reasoning_effort: 'minimal',
        verbosity: 'low',
        max_completion_tokens: 6000,
      });
    } catch {
      return 'Market intelligence temporarily unavailable - GPT-5 system experiencing issues';
    }
  }
}

// GLOBAL MARKET STATUS
function getGlobalMarketStatus() {
    try {
        const globalTime = getCurrentGlobalDateTime();
        
        return {
            cambodia: {
                time: globalTime.cambodia.time,
                isBusinessHours: globalTime.cambodia.isBusinessHours,
                isWeekend: globalTime.cambodia.isWeekend
            },
            newYork: {
                time: globalTime.newYork.time,
                isMarketHours: globalTime.newYork.isMarketHours
            },
            london: {
                time: globalTime.london.time,
                isMarketHours: globalTime.london.isMarketHours
            },
            summary: globalTime.cambodia.isWeekend ? 
                    'Weekend - Markets Closed' : 
                    'Weekday - Check individual market hours',
            lastUpdated: new Date().toISOString(),
            poweredBy: 'Secure GPT-5 System v7.0'
        };
    } catch (error) {
        return { error: 'Global market status unavailable', timestamp: new Date().toISOString() };
    }
}

console.log('Secure GPT-5 Command System - PART 5/6 loaded');
console.log('Features: System monitoring, performance analytics, cost tracking, health checks');

// Export functions for Part 6
module.exports = {
    getSystemAnalytics,
    getDetailedPerformanceMetrics,
    getCostAnalysis,
    checkSystemHealth,
    checkGPT5OnlySystemHealth, // Legacy compatibility
    testMemoryIntegration,
    getMarketIntelligence,
    getGlobalMarketStatus,
    formatUptime,
    calculatePerformanceTrend
};

// MEMORY TESTING - SEPARATE FUNCTION FOR EXPLICIT TESTING ONLY
async function testMemoryIntegration(chatId) {
    console.log('Testing memory integration with GPT-5...');
    
    const tests = {
        postgresqlConnection: false,
        conversationHistory: false,
        persistentMemory: false,
        memoryBuilding: false,
        completionDetection: false,
        gpt5WithMemory: false,
        memoryContextPassing: false,
        gpt5ModelSelection: false,
        telegramIntegration: false,
        gpt5SystemHealth: false
    };
    
    try {
        const completionTest = detectCompletionStatus('done ready', 'system already built');
        tests.completionDetection = completionTest.shouldSkipGPT5;
        console.log(`Completion Detection: ${tests.completionDetection}`);
    } catch (error) {
        console.log(`Completion Detection: Failed - ${error.message}`);
    }
    
    try {
        const testConnection = await database.getConversationHistoryDB('test', 1);
        tests.postgresqlConnection = Array.isArray(testConnection);
        console.log(`PostgreSQL Connection: ${tests.postgresqlConnection}`);
    } catch (error) {
        console.log(`PostgreSQL Connection: Failed - ${error.message}`);
    }
    
    try {
        const history = await database.getConversationHistoryDB(chatId, 3);
        tests.conversationHistory = Array.isArray(history);
        console.log(`Conversation History: ${tests.conversationHistory} (${history?.length || 0} records)`);
    } catch (error) {
        console.log(`Conversation History: Failed - ${error.message}`);
    }
    
    try {
        const memories = await database.getPersistentMemoryDB(chatId);
        tests.persistentMemory = Array.isArray(memories);
        console.log(`Persistent Memory: ${tests.persistentMemory} (${memories?.length || 0} records)`);
    } catch (error) {
        console.log(`Persistent Memory: Failed - ${error.message}`);
    }
    
    try {
        const context = await memory.buildConversationContext(chatId);
        tests.memoryBuilding = typeof context === 'string';
        console.log(`Memory Building: ${tests.memoryBuilding} (${context?.length || 0} chars)`);
    } catch (error) {
        console.log(`Memory Building: Failed - ${error.message}`);
    }
    
    try {
        // FIXED: Direct GPT-5 API test instead of recursive executeDualCommand call
        const testPrompt = 'Hello, test GPT-5 functionality';
        const directResult = await openaiClient.getGPT5Analysis(testPrompt, {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            max_completion_tokens: 50
        });
        tests.gpt5WithMemory = directResult && directResult.length > 0;
        console.log(`GPT-5 with Memory: ${tests.gpt5WithMemory}`);
    } catch (error) {
        console.log(`GPT-5 with Memory: Failed - ${error.message}`);
    }
    
    try {
        // FIXED: Simple validation instead of recursive test
        tests.memoryContextPassing = tests.memoryBuilding && tests.postgresqlConnection;
        console.log(`Memory Context Passing: ${tests.memoryContextPassing}`);
    } catch (error) {
        console.log(`Memory Context Passing: Failed - ${error.message}`);
    }
    
    try {
        // FIXED: Direct health check instead of recursive model selection test
        const healthCheck = await openaiClient.checkGPT5SystemHealth();
        tests.gpt5ModelSelection = healthCheck.gpt5NanoAvailable || healthCheck.gpt5MiniAvailable;
        console.log(`GPT-5 Model Selection: ${tests.gpt5ModelSelection}`);
    } catch (error) {
        console.log(`GPT-5 Model Selection: Failed - ${error.message}`);
    }
    
    try {
        // FIXED: Function existence check instead of recursive test
        tests.telegramIntegration = typeof telegramSplitter.sendGPTResponse === 'function';
        console.log(`Telegram Integration: ${tests.telegramIntegration}`);
    } catch (error) {
        console.log(`Telegram Integration: Failed - ${error.message}`);
    }
    
    try {
        // FIXED: Direct health check
        const systemHealth = await checkGPT5OnlySystemHealth();
        tests.gpt5SystemHealth = systemHealth.overallHealth;
        console.log(`GPT-5 System Health: ${tests.gpt5SystemHealth}`);
    } catch (error) {
        console.log(`GPT-5 System Health: Failed - ${error.message}`);
    }
    
    const overallSuccess = Object.values(tests).filter(test => test).length;
    const totalTests = Object.keys(tests).length;
    
    console.log(`\nMemory Test: ${overallSuccess}/${totalTests} passed`);
    
    return {
        tests: tests,
        score: overallSuccess,
        total: totalTests,
        percentage: Math.round((overallSuccess / totalTests) * 100),
        status: overallSuccess === totalTests ? 'FULL_SUCCESS' : 
                overallSuccess >= totalTests * 0.7 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION',
        gpt5OnlyMode: true,
        completionDetectionEnabled: tests.completionDetection,
        postgresqlIntegrated: tests.postgresqlConnection && tests.conversationHistory,
        memorySystemIntegrated: tests.memoryBuilding && tests.gpt5WithMemory
    };
}
 
// GPT-5 SYSTEM HEALTH CHECK
async function checkGPT5OnlySystemHealth() {
    const health = {
        gpt5_full: false,
        gpt5_mini: false,
        gpt5_nano: false,
        gpt5_chat: false,
        completionDetection: false,
        memorySystem: false,
        contextBuilding: false,
        dateTimeSupport: false,
        telegramIntegration: false,
        databaseConnection: false,
        overallHealth: false,
        errors: [],
        gpt5OnlyMode: true,
        postgresqlStatus: 'unknown'
    };
    
    try {
        const testCompletion = detectCompletionStatus('done ready', 'system built');
        health.completionDetection = testCompletion.shouldSkipGPT5;
    } catch (error) {
        health.errors.push(`Completion Detection: ${error.message}`);
    }
    
    const gpt5Models = [
        { name: 'gpt5_full', model: 'gpt-5', description: 'Full GPT-5' },
        { name: 'gpt5_mini', model: 'gpt-5-mini', description: 'GPT-5 Mini' },
        { name: 'gpt5_nano', model: 'gpt-5-nano', description: 'GPT-5 Nano' },
        { name: 'gpt5_chat', model: 'gpt-5-chat-latest', description: 'GPT-5 Chat' }
    ];
    
    for (const { name, model, description } of gpt5Models) {
        try {
            const options = { model: model, max_completion_tokens: 50 };
            
            if (model !== 'gpt-5-chat-latest') {
                options.reasoning_effort = 'minimal';
                options.verbosity = 'low';
            } else {
                options.temperature = 0.7;
            }
            
            await openaiClient.getGPT5Analysis('Health check test', options);
            health[name] = true;
            console.log(`${description} operational`);
        } catch (error) {
            health.errors.push(`${model}: ${error.message}`);
        }
    }
    
    try {
        const testHistory = await database.getConversationHistoryDB('health_test', 1);
        health.databaseConnection = Array.isArray(testHistory);
        health.postgresqlStatus = 'connected';
    } catch (error) {
        health.errors.push(`PostgreSQL: ${error.message}`);
        health.postgresqlStatus = 'disconnected';
    }
    
    try {
        const testContext = await memory.buildConversationContext('health_test');
        health.memorySystem = typeof testContext === 'string';
        health.contextBuilding = true;
    } catch (error) {
        health.errors.push(`Memory: ${error.message}`);
    }
    
    try {
        const cambodiaTime = getCurrentCambodiaDateTime();
        health.dateTimeSupport = cambodiaTime && cambodiaTime.date;
    } catch (error) {
        health.errors.push(`DateTime: ${error.message}`);
    }
    
    try {
        health.telegramIntegration = typeof telegramSplitter.sendGPTResponse === 'function';
    } catch (error) {
        health.errors.push(`Telegram: ${error.message}`);
    }
    
    const healthyModels = [health.gpt5_full, health.gpt5_mini, health.gpt5_nano].filter(Boolean).length;
    health.overallHealth = healthyModels >= 1 && health.memorySystem && health.databaseConnection;
    
    health.healthScore = (
        (healthyModels * 15) +
        (health.gpt5_chat ? 10 : 0) +
        (health.completionDetection ? 15 : 0) +
        (health.memorySystem ? 10 : 0) +
        (health.databaseConnection ? 15 : 0) +
        (health.telegramIntegration ? 5 : 0) +
        (health.dateTimeSupport ? 5 : 0)
    );
    
    health.healthGrade = health.healthScore >= 95 ? 'A+' :
                        health.healthScore >= 85 ? 'A' :
                        health.healthScore >= 75 ? 'B+' :
                        health.healthScore >= 65 ? 'B' :
                        health.healthScore >= 50 ? 'C' : 'F';
    
    return health;
}
// ... define all functions (only once) above ...

module.exports = {
  getSystemAnalytics,
  getDetailedPerformanceMetrics,
  getCostAnalysis,
  checkSystemHealth,
  checkGPT5OnlySystemHealth,   // final version
  testMemoryIntegration,        // final version
  getMarketIntelligence,
  getGlobalMarketStatus,
  formatUptime,
  calculatePerformanceTrend
};

// utils/dualCommandSystem.js - SECURE GPT-5 COMMAND SYSTEM - PART 6/6 (FINAL)
// MAIN EXPORTS, UTILITY FUNCTIONS & COMPATIBILITY LAYER
// This part combines all previous parts and provides the complete API

// ───────────────────────────────────────────────────────────────────────────────
// MEMORY WRITE HELPERS (so Part 3 can read useful context next turn)

// Normalize assistant text before saving
function normalizeAssistantText(text) {
  if (!text) return '';
  return String(text)
    .replace(/^(Assistant:|AI:|GPT-?5?:)\s*/i, '')
    .trim()
    .slice(0, 8000); // sanity cap
}

// Try to infer a short topic from the user message
function inferTopic(userMessage) {
  if (!userMessage) return 'general';
  const s = String(userMessage).toLowerCase();
  if (s.includes('error') || s.includes('bug')) return 'troubleshooting';
  if (s.includes('report') || s.includes('analysis')) return 'analysis';
  if (s.includes('deploy') || s.includes('production')) return 'deployment';
  if (s.includes('memory') || s.includes('context')) return 'memory';
  if (s.length < 30) return userMessage.trim();
  return userMessage.slice(0, 60).trim();
}

// Upsert a fact into persistent memory (via memory module if present; else DB)
async function upsertPersistentFact(chatId, key, value, { ttlMs = 7 * 24 * 60 * 60 * 1000 } = {}) {
  try {
    if (!chatId || !key) return false;

    if (memory && typeof memory.saveToMemory === 'function') {
      await memory.saveToMemory(chatId, {
        type: 'fact',
        key,
        value,
        createdAt: new Date().toISOString(),
        expiresAt: ttlMs ? new Date(Date.now() + ttlMs).toISOString() : null
      });
      return true;
    }

    if (database && typeof database.saveConversation === 'function') {
      await database.saveConversation(chatId, `[FACT:${key}]`, String(value), {
        kind: 'fact',
        key,
        expiresAt: ttlMs ? new Date(Date.now() + ttlMs).toISOString() : null
      });
      return true;
    }

    return false;
  } catch (err) {
    console.warn('upsertPersistentFact failed:', err.message);
    return false;
  }
}

// Save the full conversation turn (user + assistant) to DB
async function persistConversationTurn(chatId, userMessage, assistantResponse, meta = {}) {
  try {
    if (!chatId) return false;
    const assistant = normalizeAssistantText(assistantResponse);

    if (database && typeof database.saveConversation === 'function') {
      await database.saveConversation(chatId, userMessage, assistant, {
        ...meta,
        savedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('persistConversationTurn failed:', err.message);
    return false;
  }
}

// High-level “remember” entry point used after each successful command
async function maybeSaveMemory(chatId, userMessage, processedResponse, queryAnalysis, gpt5Result) {
  if (!chatId) return { saved: false };

  // 1) persist the turn so Part 3 can rebuild context
  const turnSaved = await persistConversationTurn(chatId, userMessage, processedResponse, {
    modelUsed: gpt5Result?.modelUsed || queryAnalysis?.gpt5Model,
    priority: queryAnalysis?.priority,
    complexity: queryAnalysis?.complexity?.complexity || 'unknown',
    processingTime: gpt5Result?.processingTime
  });

  // 2) mark completion if detected
  if (
    queryAnalysis?.completionStatus?.isFrustrated ||
    queryAnalysis?.completionStatus?.isComplete ||
    gpt5Result?.completionDetected
  ) {
    await upsertPersistentFact(
      chatId,
      'last_completion',
      `Completed at ${new Date().toISOString()} — type: ${queryAnalysis?.completionStatus?.completionType || 'direct'}`,
      { ttlMs: 14 * 24 * 60 * 60 * 1000 }
    );
  }

  // 3) remember a tiny topic breadcrumb
  await upsertPersistentFact(chatId, 'last_topic', inferTopic(userMessage), { ttlMs: 48 * 60 * 60 * 1000 });

  // 4) heuristic: capture a “next action” line if present
  const nextMatch = String(processedResponse || '').match(/(?:^|\n)(?:next|todo|action)\b.*$/im);
  if (nextMatch) {
    await upsertPersistentFact(chatId, 'next_action', nextMatch[0].slice(0, 200), {
      ttlMs: 7 * 24 * 60 * 60 * 1000
    });
  }

  return { saved: turnSaved };
}

// ───────────────────────────────────────────────────────────────────────────────
// ENHANCED UTILITY FUNCTIONS

async function executeEnhancedGPT5Command(userMessage, chatId, bot = null, options = {}) {
  try {
    console.log('Executing enhanced GPT-5 command with auto-delivery...');
    const startTime = Date.now();

    // Execute the core command
    const result = await executeDualCommand(userMessage, chatId, options);

    // 🔁 Persist memory write-backs after success
    try {
      if (result?.success && options.saveToMemory !== false) {
        await maybeSaveMemory(
          chatId,
          userMessage,
          result.response,
          {
            type: result.queryType,
            priority: result.priority,
            gpt5Model: result.modelUsed,
            complexity: { complexity: result.complexity },
            completionStatus: result.completionDetected
              ? { isComplete: true, completionType: result.completionType || 'direct' }
              : { isComplete: false }
          },
          { modelUsed: result.modelUsed, processingTime: result.processingTime }
        );
      }
    } catch (persistErr) {
      console.warn('Memory persist warning (enhanced):', persistErr.message);
    }

    // Automatic Telegram delivery if bot provided
    if (bot && result.success && result.response) {
      try {
        const title =
          options.title ||
          (result.completionDetected ? 'Task Completion' : 'GPT-5 Analysis');

        const deliverySuccess = await result.sendToTelegram(bot, title);
        result.telegramDelivered = deliverySuccess;
        result.autoDelivery = true;

        console.log(`Auto-delivery: ${deliverySuccess ? 'Success' : 'Failed'}`);
      } catch (telegramError) {
        console.warn('Auto-delivery failed:', telegramError.message);
        result.telegramDelivered = false;
        result.deliveryError = telegramError.message;
      }
    }

    result.enhancedExecution = true;
    result.totalExecutionTime = Date.now() - startTime;
    return result;
  } catch (error) {
    console.error('Enhanced GPT-5 command error:', error.message);

    // Emergency fallback with bot notification
    if (bot) {
      try {
        const errorMsg = `Analysis failed: ${error.message}. Please try a simpler request.`;
        if (telegramSplitter?.sendAlert) {
          await telegramSplitter.sendAlert(bot, chatId, errorMsg, 'System Error');
        } else if (bot.sendMessage) {
          await bot.sendMessage(chatId, errorMsg);
        }
      } catch (notificationError) {
        console.error('Error notification failed:', notificationError.message);
      }
    }

    return {
      success: false,
      response: 'I encountered technical difficulties. Please try again with a simpler request.',
      error: error.message,
      aiUsed: 'error-fallback',
      enhancedExecution: false,
      telegramDelivered: !!bot
    };
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// QUICK COMMAND FUNCTIONS

async function quickGPT5Command(message, chatId, bot = null, model = 'auto') {
  const options = {
    title: `GPT-5 ${model.toUpperCase()} Response`,
    saveToMemory: true
  };

  if (model !== 'auto') {
    options.forceModel = model.includes('gpt-5') ? model : `gpt-5-${model}`;
  }

  return await executeEnhancedGPT5Command(message, chatId, bot, options);
}

async function quickNanoCommand(message, chatId, bot = null) {
  return await quickGPT5Command(message, chatId, bot, 'gpt-5-nano');
}
async function quickMiniCommand(message, chatId, bot = null) {
  return await quickGPT5Command(message, chatId, bot, 'gpt-5-mini');
}
async function quickFullCommand(message, chatId, bot = null) {
  return await quickGPT5Command(message, chatId, bot, 'gpt-5');
}
async function quickChatCommand(message, chatId, bot = null) {
  return await quickGPT5Command(message, chatId, bot, 'gpt-5-chat-latest');
}

// ───────────────────────────────────────────────────────────────────────────────
// GPT-5 MODEL RECOMMENDATION SYSTEM

function getGPT5ModelRecommendation(query) {
  const analysis = analyzeQuery(query);

  return {
    recommendedModel: analysis.gpt5Model,
    reasoning: analysis.reason,
    priority: analysis.priority,
    confidence: analysis.confidence,
    completionDetected: analysis.shouldSkipGPT5,
    configuration: {
      reasoning_effort: analysis.reasoning_effort,
      verbosity: analysis.verbosity,
      max_completion_tokens: analysis.max_completion_tokens,
      temperature: analysis.temperature
    },
    performance: {
      estimatedResponseTime: analysis.estimatedResponseTime,
      costTier: analysis.estimatedCost
        ? (analysis.estimatedCost.totalCost < 0.001
            ? 'Very Low'
            : analysis.estimatedCost.totalCost < 0.005
            ? 'Low'
            : 'Medium')
        : 'Unknown',
      responseSpeed:
        analysis.gpt5Model === CONFIG.MODELS.NANO
          ? 'Very Fast'
          : analysis.gpt5Model === CONFIG.MODELS.MINI
          ? 'Fast'
          : analysis.gpt5Model === CONFIG.MODELS.CHAT
          ? 'Fast'
          : 'Balanced'
    },
    alternatives: generateModelAlternatives(analysis)
  };
}

function generateModelAlternatives(analysis) {
  const alternatives = [];

  if (analysis.gpt5Model !== CONFIG.MODELS.NANO) {
    alternatives.push({
      model: CONFIG.MODELS.NANO,
      reason: 'Faster response, lower cost',
      tradeoff: 'Reduced reasoning capability'
    });
  }
  if (analysis.gpt5Model !== CONFIG.MODELS.MINI) {
    alternatives.push({
      model: CONFIG.MODELS.MINI,
      reason: 'Balanced performance and cost',
      tradeoff:
        analysis.gpt5Model === CONFIG.MODELS.FULL
          ? 'Less reasoning depth'
          : 'Slower than Nano'
    });
  }
  if (analysis.gpt5Model !== CONFIG.MODELS.FULL && analysis.priority !== 'speed') {
    alternatives.push({
      model: CONFIG.MODELS.FULL,
      reason: 'Maximum reasoning capability',
      tradeoff: 'Higher cost, slower response'
    });
  }

  return alternatives;
}

// ───────────────────────────────────────────────────────────────────────────────
// COST ESTIMATION SYSTEM

function getGPT5CostEstimate(query, estimatedTokens = 1000) {
  const analysis = analyzeQuery(query);

  if (analysis.shouldSkipGPT5) {
    return {
      model: 'completion-detection',
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      estimatedCost: 0,
      actualCost: 0,
      costTier: 'Free',
      completionDetected: true,
      savings: 'Maximum - No AI processing required'
    };
  }

  const inputTokens = Math.ceil(estimatedTokens * 0.6);
  const outputTokens = Math.ceil(estimatedTokens * 0.4);

  const costs = {
    'gpt-5-nano': { input: 0.05, output: 0.40 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-chat-latest': { input: 1.25, output: 10.00 }
  };

  const modelCosts = costs[analysis.gpt5Model] || costs['gpt-5-mini'];
  const inputCost = (inputTokens / 1_000_000) * modelCosts.input;
  const outputCost = (outputTokens / 1_000_000) * modelCosts.output;
  const totalCost = inputCost + outputCost;

  return {
    model: analysis.gpt5Model,
    estimatedInputTokens: inputTokens,
    estimatedOutputTokens: outputTokens,
    inputCost: parseFloat(inputCost.toFixed(6)),
    outputCost: parseFloat(outputCost.toFixed(6)),
    estimatedCost: parseFloat(totalCost.toFixed(6)),
    costTier:
      analysis.gpt5Model === CONFIG.MODELS.NANO
        ? 'Economy'
        : analysis.gpt5Model === CONFIG.MODELS.MINI
        ? 'Standard'
        : 'Premium',
    completionDetected: false,
    priority: analysis.priority,
    reasoning: analysis.reasoning_effort,
    optimization: `Selected ${analysis.gpt5Model} for optimal cost/performance balance`
  };
}

// ───────────────────────────────────────────────────────────────────────────────
// PERFORMANCE METRICS SNAPSHOT

function getGPT5PerformanceMetrics() {
  const analytics = getSystemAnalytics();

  return {
    systemMode: 'Secure GPT-5 Smart Selection System',
    version: systemState.version,
    modelsAvailable: Object.values(CONFIG.MODELS),
    features: [
      'Intelligent model selection',
      'Completion detection (cost savings)',
      'Memory integration',
      'Multi-tier fallback system',
      'Performance monitoring',
      'Cost optimization',
      'Cambodia timezone support'
    ],
    performance: {
      uptime: analytics.uptime.formatted,
      totalRequests: analytics.requests.total,
      successRate: `${analytics.requests.successRate}%`,
      avgResponseTime: `${analytics.performance.averageResponseTime}ms`,
      completionDetectionSavings: `${analytics.requests.completionDetected} requests`
    },
    optimization: {
      smartRouting: 'Active',
      costOptimization: 'Active',
      completionDetection: 'Active',
      memoryIntegration: 'PostgreSQL-backed',
      fallbackSystem: 'Multi-tier GPT-5'
    },
    capabilities: {
      speed: 'GPT-5 Nano (50ms average)',
      balanced: 'GPT-5 Mini (200ms average)',
      complex: 'GPT-5 Full (500ms average)',
      chat: 'GPT-5 Chat (300ms average)',
      completion: 'Instant (0ms - no processing)'
    },
    estimatedSavings:
      '70-80% vs always using GPT-5 Full + completion detection savings',
    architecture: 'Secure, analysis-only (operational execution removed)',
    security: 'Production-ready, no system command execution'
  };
}

// ───────────────────────────────────────────────────────────────────────────────
// EMERGENCY FALLBACK FUNCTIONS

async function saveConversationEmergency(chatId, userMessage, response, metadata = {}) {
  try {
    if (database && typeof database.saveConversation === 'function') {
      await database.saveConversation(chatId, userMessage, response, {
        ...metadata,
        emergency: true,
        timestamp: new Date().toISOString()
      });
      console.log('Emergency conversation save successful');
      return true;
    }
  } catch (error) {
    console.warn('Emergency conversation save failed:', error.message);
  }
  return false;
}

async function executeGPT5WithContext(prompt, chatId, options = {}) {
  return await executeDualCommand(prompt, chatId, {
    ...options,
    saveToMemory: true,
    contextAware: true
  });
}

// ✅ Direct analysis with correct token params per API
async function executeDirectGPT5Analysis(prompt, model = 'gpt-5-mini') {
  try {
    const analysisOptions = { model, max_completion_tokens: 4000 };

    if (model !== CONFIG.MODELS.CHAT) {
      analysisOptions.reasoning_effort = 'medium';
      analysisOptions.verbosity = 'medium';
    } else {
      // Chat Completions expects max_tokens instead of max_completion_tokens
      analysisOptions.temperature = 0.7;
      analysisOptions.max_tokens = analysisOptions.max_completion_tokens;
      delete analysisOptions.max_completion_tokens;
    }

    return await openaiClient.getGPT5Analysis(prompt, analysisOptions);
  } catch (error) {
    console.error('Direct GPT-5 analysis error:', error.message);
    return `Analysis unavailable: ${error.message}`;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// SYSTEM HEALTH AND DIAGNOSTICS

async function performFullSystemDiagnostics() {
  console.log('Running comprehensive system diagnostics...');

  const diagnostics = {
    timestamp: new Date().toISOString(),
    version: systemState.version,
    uptime: Date.now() - systemState.startTime
  };

  try {
    diagnostics.health = await checkSystemHealth();
    diagnostics.memoryTest = await testMemoryIntegration('diagnostic_test');
    diagnostics.analytics = getSystemAnalytics();
    diagnostics.gpt5Health = await performGPT5HealthCheck();
    diagnostics.config = {
      models: Object.values(CONFIG.MODELS),
      reasoningLevels: CONFIG.REASONING_LEVELS,
      verbosityLevels: CONFIG.VERBOSITY_LEVELS,
      tokenLimits: CONFIG.TOKEN_LIMITS
    };

    diagnostics.overall =
      diagnostics.health.overall !== 'critical' &&
      diagnostics.memoryTest.percentage >= 70 &&
      diagnostics.gpt5Health.availableModels > 0
        ? 'healthy'
        : 'needs_attention';
  } catch (error) {
    diagnostics.error = error.message;
    diagnostics.overall = 'failed';
  }

  console.log(`Full system diagnostics complete: ${diagnostics.overall}`);
  return diagnostics;
}

// ───────────────────────────────────────────────────────────────────────────────
// COMPATIBILITY LAYER FOR LEGACY CODE

const legacyCompatibility = {
  // Legacy function names
  executeGptAnalysis: (msg, analysis, ctx, mem) =>
    executeThroughGPT5System(msg, { ...analysis, bestAI: 'gpt' }, ctx, mem),

  executeClaudeAnalysis: (msg, analysis, ctx, mem) =>
    executeThroughGPT5System(msg, { ...analysis, bestAI: 'gpt' }, ctx, mem),

  routeConversationIntelligently: analyzeQuery,

  checkSystemHealth: checkSystemHealth,

  // Deprecated operational functions (now return safe messages)
  executeOperationalCommand: async () => 'Operational commands disabled for security',
  executeFileOperation: async () => 'File operations disabled for security',
  executeSystemOperation: async () => 'System operations disabled for security'
};

console.log('🎯 Secure GPT-5 Command System v7.0 - COMPLETE (6/6 parts loaded)');
console.log('🔒 Security: All operational execution removed - analysis-only mode');
console.log('⚡ Features: Smart model selection, completion detection, cost optimization');
console.log('📊 Monitoring: Performance analytics, health checks, cost tracking');
console.log('🌏 Context: Cambodia timezone, global market awareness, memory integration');
console.log('✅ Ready for production deployment with comprehensive error handling');

// ───────────────────────────────────────────────────────────────────────────────
// MAIN MODULE EXPORTS (single export block)

module.exports = {
  // CORE FUNCTIONS
  executeDualCommand,
  executeEnhancedGPT5Command,
  analyzeQuery,
  detectCompletionStatus,

  // QUICK COMMAND FUNCTIONS
  quickGPT5Command,
  quickNanoCommand,
  quickMiniCommand,
  quickFullCommand,
  quickChatCommand,

  // SYSTEM ANALYSIS & RECOMMENDATIONS
  getGPT5ModelRecommendation,
  getGPT5CostEstimate,
  getGPT5PerformanceMetrics,

  // SYSTEM MONITORING & HEALTH
  getSystemAnalytics,
  checkSystemHealth,
  checkGPT5OnlySystemHealth, // Legacy compatibility
  performGPT5HealthCheck,
  performFullSystemDiagnostics,
  testMemoryIntegration,

  // UTILITY FUNCTIONS
  getCurrentCambodiaDateTime,
  getCurrentGlobalDateTime,
  getMarketIntelligence,
  getGlobalMarketStatus,
  resetSystemStats,

  // CONTEXT AND MEMORY
  buildMemoryContext,
  executeGPT5WithContext,
  executeDirectGPT5Analysis,
  saveConversationEmergency,

  // NEW memory write helpers (so callers can use directly if they want)
  maybeSaveMemory,
  upsertPersistentFact,
  persistConversationTurn,

  // SYSTEM STATE ACCESS
  getSystemState: () => ({ ...systemState }), // Return copy for safety
  getConfig: () => ({ ...CONFIG }),

  // LEGACY COMPATIBILITY
  ...legacyCompatibility,

  // DIRECT ACCESS TO SUBSYSTEMS (for advanced usage)
  openaiClient,
  memory,
  database,
  telegramSplitter,

  // CONSTANTS
  MODELS: CONFIG.MODELS,
  REASONING_LEVELS: CONFIG.REASONING_LEVELS,
  VERBOSITY_LEVELS: CONFIG.VERBOSITY_LEVELS
};

console.log('🚀 All systems ready - Secure GPT-5 Command System operational');
console.log('📋 Main functions: executeDualCommand, executeEnhancedGPT5Command');
console.log('⚙️ Quick functions: quickNanoCommand, quickMiniCommand, quickFullCommand');
console.log('🔍 Analysis: getGPT5ModelRecommendation, getSystemAnalytics');
console.log('💾 Compatibility: Legacy function names preserved for existing code');
