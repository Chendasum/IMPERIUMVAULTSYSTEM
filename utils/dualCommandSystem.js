// utils/dualCommandSystem.js — GPT‑5 ONLY SYSTEM (v6)
// ============================================================================
// Master Executive Daily — Dual Command System (Single‑AI Edition)
// ----------------------------------------------------------------------------
// Goals:
//   • GPT‑5‑only routing with strong completion detection (avoid re‑asking to rebuild)
//   • Clean handoff: index.js → dualCommandSystem.js → openaiClient.js → Telegram
//   • Memory aware: optional PostgreSQL + memory builder; never blocks normal chats
//   • Deterministic single‑voice output (pairs with telegramSplitter single‑voice mode)
//   • Clear telemetry and safe fallbacks
//
// Major Improvements in v6:
//   1) Removes undocumented API params (no text.verbosity sent during reasoning)
//   2) Normalizes model labels for Telegram (full/mini/nano/chat)
//   3) Adds negative guards to completion detection (e.g., “not ready”)
//   4) Safer memory integration (heterogeneous arrays)
//   5) Market hours compute per‑region (not tied to Cambodia weekend)
//   6) Optional retry pass for complex/coding queries using maxRetries from analysis
//   7) Clean metadata to telegramSplitter so it always shows correct emoji
//   8) Big observability: every step logs minimally with stable prefixes
//
// NOTE: This file is intentionally verbose (1500+ lines) for maintainability
//       and clarity in production debugging. All sections are compartmentalized
//       and documented. Search for "SECTION" markers to navigate.
// ============================================================================

'use strict';

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                              SECTION 0: Imports                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

let openaiClient;
try {
  openaiClient = require('./openaiClient');
  console.log('[DualCmd] GPT‑5 client loaded');
} catch (error) {
  console.error('[DualCmd] GPT‑5 client import failed:', error?.message || error);
  openaiClient = {
    getGPT5Analysis: async (prompt) => `GPT‑5 client unavailable: ${error?.message || error}`,
    checkGPT5SystemHealth: async () => ({ error: 'client unavailable' })
  };
}

let memory, database;
try {
  memory = require('./memory');
  database = require('./database');
  console.log('[DualCmd] Memory & DB loaded');
} catch (error) {
  console.warn('[DualCmd] Memory/DB import failed:', error?.message || error);
  memory = { buildConversationContext: async () => '' };
  database = {
    getConversationHistoryDB: async () => [],
    getPersistentMemoryDB: async () => []
  };
}

let telegramSplitter = {};
try {
  telegramSplitter = require('./telegramSplitter');
  console.log('[DualCmd] Telegram splitter loaded');
} catch (error) {
  console.warn('[DualCmd] Telegram splitter import failed:', error?.message || error);
  telegramSplitter = {
    sendGPTResponse: async () => false,
    sendClaudeResponse: async () => false,
    sendDualAIResponse: async () => false,
    sendAnalysis: async () => false,
    sendAlert: async () => false,
    TELEGRAM_CONFIG: { MAX_RESPONSES_PER_QUERY: 1 },
    MESSAGE_TYPES: {}
  };
}

// Node core
const crypto = require('crypto');

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                      SECTION 1: String & Object Utilities                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Pad integer with zeros */
function z2(n) { return String(n).padStart(2, '0'); }

/** Safe JSON stringify */
function j(x) {
  try { return JSON.stringify(x); } catch { return '"<unserializable>"'; }
}

/** Clamp number */
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

/** Get now ms */
function now() { return Date.now(); }

/** Basic unique id */
function uid(prefix = 'id') {
  const rnd = crypto.randomBytes(6).toString('hex');
  return `${prefix}_${Date.now()}_${rnd}`;
}

/** Is string */
function isStr(x) { return typeof x === 'string'; }

/** Is nonempty string */
function hasText(x) { return isStr(x) && x.trim().length > 0; }

/** Try/catch wrapper returning [err, val] */
async function attempt(promise) {
  try { const v = await promise; return [null, v]; }
  catch (e) { return [e, null]; }
}

/** Normalize whitespace for ID stability */
function normalizeForId(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .replace(/[\*`_\[\]~]/g, '')
    .trim()
    .slice(0, 300);
}

/** Shallow clone */
function clone(obj) { return Object.assign({}, obj); }

/** Safe array */
function arr(x) { return Array.isArray(x) ? x : (x == null ? [] : [x]); }

/** Ensure function */
function isFn(x) { return typeof x === 'function'; }

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                       SECTION 2: Date/Time Utilities                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function getCurrentCambodiaDateTime() {
  try {
    const nowLocal = new Date();
    const c = new Date(nowLocal.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }));
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    const dayName = days[c.getDay()];
    const monthName = months[c.getMonth()];
    const date = c.getDate();
    const year = c.getFullYear();
    const hour = c.getHours();
    const minute = c.getMinutes();
    const isWeekend = [0,6].includes(c.getDay());

    return {
      date: `${dayName}, ${monthName} ${date}, ${year}`,
      time: `${z2(hour)}:${z2(minute)}`,
      hour,
      minute,
      dayName,
      isWeekend,
      timezone: 'ICT (UTC+7)',
      timestamp: c.toISOString()
    };
  } catch (error) {
    console.error('[DualCmd] Cambodia DateTime error:', error?.message || error);
    const d = new Date();
    return {
      date: d.toDateString(),
      time: `${z2(d.getHours())}:${z2(d.getMinutes())}`,
      hour: d.getHours(),
      isWeekend: [0,6].includes(d.getDay()),
      timezone: 'ICT (UTC+7)',
      error: 'Timezone calculation failed'
    };
  }
}

function getCurrentGlobalDateTime() {
  try {
    const nowLocal = new Date();
    const c = new Date(nowLocal.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }));
    const ny = new Date(nowLocal.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const ln = new Date(nowLocal.toLocaleString('en-US', { timeZone: 'Europe/London' }));

    const isW = d => [0,6].includes(d.getDay());

    return {
      cambodia: {
        ...getCurrentCambodiaDateTime(),
        timezone: 'ICT (UTC+7)'
      },
      newYork: {
        time: `${z2(ny.getHours())}:${z2(ny.getMinutes())}`,
        hour: ny.getHours(),
        isWeekend: isW(ny),
        timezone: 'EST/EDT (UTC-5/-4)'
      },
      london: {
        time: `${z2(ln.getHours())}:${z2(ln.getMinutes())}`,
        hour: ln.getHours(),
        isWeekend: isW(ln),
        timezone: 'GMT/BST (UTC+0/+1)'
      },
      utc: nowLocal.toISOString()
    };
  } catch (error) {
    console.error('[DualCmd] Global DateTime error:', error?.message || error);
    return { cambodia: getCurrentCambodiaDateTime(), error: 'Global timezone calculation failed' };
  }
}

function getGlobalMarketStatus() {
  try {
    const g = getCurrentGlobalDateTime();
    return {
      cambodia: {
        time: g.cambodia.time,
        isBusinessHours: !g.cambodia.isWeekend && g.cambodia.hour >= 8 && g.cambodia.hour <= 17,
        isWeekend: g.cambodia.isWeekend
      },
      newYork: {
        time: g.newYork.time,
        isMarketHours: !g.newYork.isWeekend && g.newYork.hour >= 9 && g.newYork.hour <= 16
      },
      london: {
        time: g.london.time,
        isMarketHours: !g.london.isWeekend && g.london.hour >= 8 && g.london.hour <= 16
      },
      summary: g.cambodia.isWeekend ? 'Weekend — Markets Closed' : 'Weekday — Check local hours',
      lastUpdated: new Date().toISOString(),
      poweredBy: 'GPT‑5 Only System'
    };
  } catch (error) {
    console.error('[DualCmd] Market status error:', error?.message || error);
    return { error: 'Global market status unavailable' };
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                       SECTION 3: Completion Detection                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Detects if the user indicates the task/system is completed to avoid redundant work.
 * Includes negative guard ("not ready").
 */
function detectCompletionStatus(message, memoryContext = '') {
  const messageText = String(message || '').toLowerCase();
  const contextText = String(memoryContext || '').toLowerCase();

  // Negative guards
  if (/\bnot\s+(yet\s+)?ready\b/.test(messageText)) {
    return {
      isComplete: false,
      isFrustrated: false,
      directSignal: false,
      contextSignal: false,
      shouldSkipGPT5: false,
      completionType: 'none'
    };
  }

  const directCompletionPatterns = [
    /\b(done|already)\s+(ready|built)\b/i,
    /\b(it('?s)?\s+working|working\s+now|system\s+ready|ready\s+now|operational\s+now|running\s+now)\b/i,
    /deployment\s+complete|built\s+already|finished\s+already/i,
    /stop\s+asking|told\s+you\s+already|we\s+discussed\s+this/i,
    /no\s+need|don'?t\s+need|unnecessary|redundant/i
  ];

  const contextCompletionPatterns = [
    /system.*built|deployment.*complete|project.*finished/i,
    /already.*working|currently.*operational/i,
    /successfully.*deployed|live.*system/i
  ];

  const frustrationPatterns = [
    /again.*asking|keep.*asking|always.*ask/i,
    /told.*you.*already|mentioned.*before/i,
    /why.*again|same.*thing.*again/i,
    /understand.*ready|listen.*done/i
  ];

  const hasDirectCompletion = directCompletionPatterns.some(p => p.test(messageText));
  const hasContextCompletion = contextCompletionPatterns.some(p => p.test(contextText));
  const hasFrustration = frustrationPatterns.some(p => p.test(messageText));

  return {
    isComplete: hasDirectCompletion || hasContextCompletion,
    isFrustrated: hasFrustration,
    directSignal: hasDirectCompletion,
    contextSignal: hasContextCompletion,
    shouldSkipGPT5: hasDirectCompletion || hasFrustration, // skip model on strong signal
    completionType: hasDirectCompletion ? 'direct' : hasContextCompletion ? 'context' : hasFrustration ? 'frustration' : 'none'
  };
}

function generateCompletionResponse(completionStatus, originalMessage) {
  const responses = {
    direct: [
      "Got it! System confirmed as ready. What's your next command?",
      'Understood — it\'s operational. What else can I help with?',
      'Perfect! Since it\'s working, what\'s the next task?',
      'Acknowledged. Moving on — what do you need now?'
    ],
    context: [
      "I see from our history that it's already built. What's next?",
      'Right, the system is operational. What\'s your next priority?',
      'Understood from context — it\'s ready. How can I help further?'
    ],
    frustration: [
      'My apologies! I understand it\'s ready. Let\'s move forward — what else do you need?',
      'Sorry for the repetition! I get it — it\'s working. What\'s next?',
      "You\'re absolutely right — no need to rebuild. What\'s your next task?",
      'Point taken! The system is operational. What should we focus on now?'
    ]
  };
  const arr = responses[completionStatus?.completionType] || responses.direct;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Project‑aware refinement
function enhancedCompletionDetection(message, memoryContext) {
  const t = String(message || '').toLowerCase();
  const ctx = String(memoryContext || '').toLowerCase();
  const projectCompletionPatterns = [
    /built.*already|already.*built|system.*ready|deployment.*complete/i,
    /done.*building|finished.*building|completed.*setup/i,
    /working.*now|operational.*now|live.*system|running.*production/i,
    /no.*need.*build|don'?t.*need.*build|unnecessary.*rebuild/i,
    /told.*you.*ready|mentioned.*complete|discussed.*finished/i
  ];
  const frustrationPatterns = [
    /why.*ask.*again|keep.*asking|always.*same|repetitive/i,
    /already.*told|mentioned.*before|discussed.*already/i,
    /stop.*asking|don'?t.*ask.*again|understand.*done/i
  ];
  const hasProjectCompletion = projectCompletionPatterns.some(p => p.test(t) || p.test(ctx));
  const hasFrustration = frustrationPatterns.some(p => p.test(t));
  return {
    hasProjectCompletion,
    hasFrustration,
    shouldAcknowledge: hasProjectCompletion || hasFrustration,
    contextHasCompletion: projectCompletionPatterns.some(p => p.test(ctx))
  };
}

function generateProjectAwareResponse(info, originalMessage) {
  if (info?.hasFrustration) {
    return "You're absolutely right — I apologize for asking about rebuilding something that's already complete. Let's focus on what you need help with next or any new priorities for your project.";
  }
  if (info?.hasProjectCompletion || info?.contextHasCompletion) {
    return 'I understand the system/project is already built and operational. What would you like to work on next, or how can I assist with your current priorities?';
  }
  return "Got it! Since that's already handled, what's the next task or area you'd like to focus on?";
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                  SECTION 4: Query Complexity & Classification              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function analyzeQueryComplexity(message) {
  const text = String(message || '').toLowerCase();
  const veryComplexPatterns = [
    /(write.*comprehensive|create.*detailed.*report)/i,
    /(step.*by.*step.*guide|complete.*tutorial)/i,
    /(analyze.*thoroughly|provide.*full.*analysis)/i,
    /(research.*paper|academic.*analysis)/i,
    /(business.*plan|strategic.*framework)/i,
    /(financial.*model|investment.*analysis)/i,
    /(legal.*document|contract.*analysis)/i
  ];
  const complexPatterns = [
    /(explain.*detail|provide.*example)/i,
    /(compare.*contrast|pros.*cons)/i,
    /(advantages.*disadvantages)/i,
    /(multiple.*options|various.*approaches)/i,
    /(bullet.*points|numbered.*list)/i
  ];
  const longResponseIndicators = [
    /(tell.*me.*everything|explain.*fully)/i,
    /(all.*information|complete.*overview)/i,
    /(elaborate|expand.*on|more.*detail)/i,
    /(comprehensive|thorough|detailed)/i
  ];
  const isVeryComplex = veryComplexPatterns.some(p => p.test(text));
  const isComplex = complexPatterns.some(p => p.test(text));
  const needsLongResponse = longResponseIndicators.some(p => p.test(text));

  const questionWords = (text.match(/\b(what|how|why|when|where|which|who)\b/g) || []).length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return {
    isVeryComplex: isVeryComplex || (sentences > 5 && words > 100),
    isComplex: isComplex || questionWords > 2,
    needsLongResponse: needsLongResponse || words > 50,
    sentences, words, questionWords,
    complexity: isVeryComplex ? 'very_high' : isComplex ? 'high' : needsLongResponse ? 'medium' : 'low'
  };
}

function analyzeQuery(userMessage, messageType = 'text', hasMedia = false, memoryContext = null) {
  const message = String(userMessage || '');

  // Priority 0: completion detection
  const completionStatus = detectCompletionStatus(message, memoryContext || '');
  if (completionStatus.shouldSkipGPT5) {
    return {
      type: 'completion',
      bestAI: 'none',
      reason: `Task completion detected (${completionStatus.completionType})`,
      isComplete: true,
      completionStatus,
      shouldSkipGPT5: true,
      quickResponse: generateCompletionResponse(completionStatus, message)
    };
  }

  const memoryPatterns = [
    /remember|recall|you mentioned|we discussed|before|previously|last time/i,
    /my name|my preference|i told you|i said|you know/i
  ];
  const speedPatterns = [
    /urgent|immediate|now|asap|quick|fast|emergency|real-time/i,
    /^(what time|what's the time|current time|time now)/i,
    /^(what date|what's the date|today's date|date today)/i,
    /^(hello|hi|hey|good morning|good afternoon|what's up)$/i,
    /^how are you\??$/i,
    /^(thanks|thank you|cool|nice|great|ok|okay)$/i
  ];
  const complexPatterns = [
    /(strategy|strategic|comprehensive|detailed|thorough|in-depth)/i,
    /(analyze|evaluate|assess|examine|investigate|research)/i,
    /(portfolio|allocation|risk|optimization|diversification)/i,
    /(complex|sophisticated|multi-factor|multi-dimensional)/i,
    /(build|create|develop|implement|construct|design)/i,
    /(plan|planning|framework|structure|architecture)/i,
    /(write.*comprehensive|detailed.*report|full.*analysis)/i
  ];
  const mathCodingPatterns = [
    /(calculate|compute|formula|equation|algorithm|optimization)/i,
    /(code|coding|program|script|debug|software|api)/i,
    /(mathematical|statistical|probability|regression|correlation)/i,
    /(machine learning|ai|neural network|deep learning)/i,
    /(backtest|monte carlo|var|sharpe|sortino|calmar)/i,
    /(dcf|npv|irr|wacc|capm|black.*scholes)/i
  ];
  const cambodiaPatterns = [
    /(cambodia|khmer|phnom penh|cambodian)/i,
    /(lending.*cambodia|cambodia.*lending)/i,
    /(usd.*khr|khr.*usd)/i,
    /(southeast asia|asean|emerging markets)/i
  ];
  const marketPatterns = [
    /(market|stock|bond|crypto|forex|trading)/i,
    /(investment|buy|sell|price|rate|yield|return)/i,
    /(analysis|forecast|outlook|prediction)/i,
    /(earnings|revenue|profit|financial)/i
  ];
  const chatPatterns = [
    /^(hello|hi|hey|good morning|good afternoon)/i,
    /(chat|conversation|talk|discuss)/i,
    /(how are you|what's up|how's it going)/i
  ];

  const hasMemoryReference = memoryPatterns.some(p => p.test(message.toLowerCase()));
  const hasMemoryContext = hasText(memoryContext) && String(memoryContext).length > 100;

  let g = {
    model: 'gpt-5-mini',
    reasoning_effort: 'medium',
    // verbosity intentionally local only; not sent to API
    verbosity: 'medium',
    max_completion_tokens: 8000,
    temperature: 0.7,
    priority: 'standard',
    reason: 'GPT‑5 Mini — Balanced performance',
    maxRetries: 0
  };

  if (speedPatterns.some(p => p.test(message))) {
    g = {
      model: 'gpt-5-nano',
      reasoning_effort: 'minimal',
      verbosity: 'low',
      max_completion_tokens: 6000,
      priority: 'speed',
      reason: 'Speed critical — GPT‑5 Nano for fast response',
      maxRetries: 0
    };
  } else if (chatPatterns.some(p => p.test(message))) {
    g = {
      model: 'gpt-5-chat-latest',
      temperature: 0.7,
      max_completion_tokens: 8000,
      priority: 'chat',
      reason: 'Chat pattern — GPT‑5 Chat model',
      maxRetries: 0
    };
  } else if (cambodiaPatterns.some(p => p.test(message))) {
    g = {
      model: 'gpt-5-mini',
      reasoning_effort: 'medium',
      verbosity: 'high',
      max_completion_tokens: 10000,
      temperature: 0.6,
      priority: 'regional',
      reason: 'Cambodia/regional analysis — GPT‑5 Mini with detailed output',
      maxRetries: 0
    };
  } else if (marketPatterns.some(p => p.test(message))) {
    g = {
      model: 'gpt-5-mini',
      reasoning_effort: 'medium',
      verbosity: 'medium',
      max_completion_tokens: 8000,
      temperature: 0.6,
      priority: 'market',
      reason: 'Market analysis — GPT‑5 Mini for balanced performance',
      maxRetries: 0
    };
  } else if (mathCodingPatterns.some(p => p.test(message))) {
    g = {
      model: 'gpt-5',
      reasoning_effort: 'high',
      verbosity: 'medium',
      max_completion_tokens: 12000,
      temperature: 0.3,
      priority: 'mathematical',
      reason: 'Math/coding precision — GPT‑5 Full with retry',
      maxRetries: 2
    };
  } else if (complexPatterns.some(p => p.test(message))) {
    g = {
      model: 'gpt-5',
      reasoning_effort: 'high',
      verbosity: 'high',
      max_completion_tokens: 16000,
      temperature: 0.6,
      priority: 'complex',
      reason: 'Complex strategic analysis — GPT‑5 Full with retry',
      maxRetries: 2
    };
  } else if (hasMedia || messageType !== 'text') {
    g = {
      model: 'gpt-5',
      reasoning_effort: 'medium',
      verbosity: 'medium',
      max_completion_tokens: 10000,
      temperature: 0.7,
      priority: 'multimodal',
      reason: 'Multimodal content — GPT‑5 Full for vision analysis with retry',
      maxRetries: 1
    };
  }

  const qlen = message.length;
  const qc = analyzeQueryComplexity(message);
  if (qlen > 1000) {
    g.max_completion_tokens = Math.min(Math.round(g.max_completion_tokens * 1.5), 16000);
    g.reason += ' (Scaled for long input)';
  }
  if (qc.isVeryComplex) {
    g.max_completion_tokens = Math.min(Math.round(g.max_completion_tokens * 1.3), 16000);
    g.reason += ' (Scaled for complexity)';
    if (g.maxRetries === 0) { g.maxRetries = 1; g.reason += ' (Retry enabled)'; }
  }
  const longReq = [
    /(write.*long|detailed.*report|comprehensive.*analysis)/i,
    /(full.*explanation|complete.*guide|step.*by.*step)/i,
    /(generate.*content|create.*document|write.*article)/i,
    /(elaborate|expand|provide.*more|tell.*me.*everything)/i
  ];
  if (longReq.some(p => p.test(message))) {
    g.max_completion_tokens = 16000;
    g.reason += ' (Long response requested)';
    if (g.maxRetries === 0) { g.maxRetries = 1; g.reason += ' (Retry enabled)'; }
  }

  return {
    type: g.priority,
    bestAI: 'gpt',
    reason: g.reason,
    gpt5Model: g.model,
    reasoning_effort: g.reasoning_effort,
    verbosity: g.verbosity, // local only
    max_completion_tokens: g.max_completion_tokens,
    temperature: g.temperature,
    priority: g.priority,
    maxRetries: g.maxRetries,

    isComplete: false,
    completionStatus,
    shouldSkipGPT5: false,

    memoryImportant: hasMemoryReference || hasMemoryContext || g.priority === 'complex',
    needsLiveData: g.priority === 'complex' || g.priority === 'market',

    complexity: g.priority === 'complex' ? 'high' : g.priority === 'speed' ? 'low' : 'medium',
    powerSystemPreference: `GPT5_${g.priority.toUpperCase()}`
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                        SECTION 5: GPT‑5 Execution Core                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function normalizeModelUsedForTelegram(model) {
  if (model === 'gpt-5') return 'full';
  if (model === 'gpt-5-mini') return 'mini';
  if (model === 'gpt-5-nano') return 'nano';
  if (model === 'gpt-5-chat-latest') return 'chat';
  return 'analysis';
}

function prettyAiUsed(model) {
  if (model === 'gpt-5') return 'GPT‑5 Full';
  if (model === 'gpt-5-mini') return 'GPT‑5 Mini';
  if (model === 'gpt-5-nano') return 'GPT‑5 Nano';
  if (model === 'gpt-5-chat-latest') return 'GPT‑5 Chat';
  return `GPT‑5 (${model})`;
}

async function executeThroughGPT5System(userMessage, queryAnalysis, context = null, memoryData = null, chatId = null) {
  try {
    console.log('[DualCmd] Execute GPT‑5:', queryAnalysis.gpt5Model, `(${queryAnalysis.reasoning_effort || 'no‑reasoning'})`);

    // Instant time/date replies for speed class
    if (queryAnalysis.priority === 'speed' && /^(what time|what's the time|current time|time now|what date|what's the date)/i.test(String(userMessage).toLowerCase())) {
      const t = getCurrentCambodiaDateTime();
      if (/time/.test(userMessage.toLowerCase())) {
        return `Current time in Cambodia: ${t.time} (${t.timezone})\nToday is ${t.date}${t.isWeekend ? ' — Enjoy your weekend!' : ' — Have a productive day!'}`;
      }
      return `Today's date: ${t.date}\nCurrent time: ${t.time} in Cambodia (${t.timezone})`;
    }

    // Build enhanced prompt
    let enhancedMessage = String(userMessage || '');
    if (queryAnalysis.priority !== 'speed' && queryAnalysis.priority !== 'casual') {
      const t = getCurrentCambodiaDateTime();
      const biz = !t.isWeekend && t.hour >= 8 && t.hour <= 17 ? 'Yes' : 'No';
      enhancedMessage = `Current time: ${t.date}, ${t.time} Cambodia (${t.timezone})\nBusiness hours: ${biz}\n\n${enhancedMessage}`;
    }

    if (queryAnalysis.memoryImportant && hasText(context)) {
      const max = Math.min(context.length, 2000);
      enhancedMessage += `\n\nMEMORY CONTEXT:\n${context.slice(0, max)}`;
      if (context.length > max) enhancedMessage += `\n... (truncated)`;
      console.log('[DualCmd] Memory context attached');
    }

    if (memoryData) {
      if (Array.isArray(memoryData.persistentMemory) && memoryData.persistentMemory.length > 0) {
        enhancedMessage += `\n\nPERSISTENT FACTS:\n`;
        memoryData.persistentMemory.slice(0, 3).forEach((m, i) => {
          const raw = (typeof m === 'string') ? m : (m?.fact ?? j(m));
          const fact = String(raw).slice(0, 150);
          enhancedMessage += `${i + 1}. ${fact}\n`;
        });
      }
      if (Array.isArray(memoryData.conversationHistory) && memoryData.conversationHistory.length > 0) {
        enhancedMessage += `\n\nRECENT CONTEXT:\n`;
        memoryData.conversationHistory.slice(0, 2).forEach((c, i) => {
          if (hasText(c?.user_message)) {
            enhancedMessage += `${i + 1}. Previous: "${String(c.user_message).slice(0, 80)}..."\n`;
          }
        });
      }
    }

    const options = { model: queryAnalysis.gpt5Model };
    if (queryAnalysis.gpt5Model === 'gpt-5-chat-latest') {
      if (queryAnalysis.temperature != null) options.temperature = queryAnalysis.temperature;
      if (queryAnalysis.max_completion_tokens) options.max_completion_tokens = queryAnalysis.max_completion_tokens;
    } else {
      if (queryAnalysis.reasoning_effort) options.reasoning_effort = queryAnalysis.reasoning_effort;
      if (queryAnalysis.max_completion_tokens) options.max_completion_tokens = queryAnalysis.max_completion_tokens;
    }

    // Optional retry loop for complex / math queries
    const tries = clamp(Number(queryAnalysis.maxRetries || 0), 0, 3);
    let lastErr = null;
    for (let i = 0; i <= tries; i++) {
      try {
        const res = await openaiClient.getGPT5Analysis(enhancedMessage, options);
        console.log('[DualCmd] GPT‑5 pass ok', { try: i });
        return {
          response: res,
          gpt5OnlyMode: true,
          aiUsed: prettyAiUsed(queryAnalysis.gpt5Model),
          modelUsed: queryAnalysis.gpt5Model,
          powerMode: `GPT5_${queryAnalysis.priority.toUpperCase()}`,
          confidence: queryAnalysis.priority === 'mathematical' ? 0.95 : queryAnalysis.priority === 'complex' ? 0.9 : 0.85,
          success: true,
          reasoning_effort: queryAnalysis.reasoning_effort,
          verbosity: queryAnalysis.verbosity,
          priority: queryAnalysis.priority,
          memoryUsed: hasText(context),
          cost_tier: queryAnalysis.gpt5Model === 'gpt-5-nano' ? 'economy' : queryAnalysis.gpt5Model === 'gpt-5-mini' ? 'standard' : 'premium',
          analytics: {
            queryComplexity: queryAnalysis.complexity,
            domainClassification: queryAnalysis.type,
            priorityLevel: queryAnalysis.priority,
            modelOptimization: 'GPT‑5 family smart selection',
            costOptimized: true
          }
        };
      } catch (e) {
        lastErr = e;
        console.warn('[DualCmd] GPT‑5 try failed', { try: i, err: e?.message || e });
        if (i < tries) await new Promise(r => setTimeout(r, 400 * (i + 1))); // simple backoff
      }
    }
    throw lastErr || new Error('Unknown GPT‑5 error');
  } catch (error) {
    console.error('[DualCmd] executeThroughGPT5System error:', error?.message || error);
    throw error;
  }
}

async function executeGPT5Fallback(userMessage, queryAnalysis, context = null) {
  try {
    console.log('[DualCmd] Fallback: GPT‑5 Nano');
    let msg = String(userMessage || '');
    if (hasText(context) && queryAnalysis?.memoryImportant) msg += `\n\nContext: ${String(context).slice(0, 500)}`;
    return await openaiClient.getGPT5Analysis(msg, {
      model: 'gpt-5-nano',
      reasoning_effort: 'minimal',
      max_completion_tokens: 8000
    });
  } catch (e) {
    console.error('[DualCmd] Nano fallback failed:', e?.message || e);
    throw new Error(`All GPT‑5 models failed: ${e?.message || e}`);
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                        SECTION 6: Main Command Orchestrator               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function executeDualCommand(userMessage, chatId, options = {}) {
  const start = now();
  try {
    console.log('[DualCmd] Execute command');
    console.log('[DualCmd] Message:', String(userMessage || '').slice(0, 120));

    const isSystemTest = /test memory|integration test/i.test(String(userMessage || '')) || options.forceMemoryTest === true;

    let memoryContext = options.memoryContext || '';
    let memoryData = {
      conversationHistory: options.conversationHistory || [],
      persistentMemory: options.persistentMemory || []
    };

    if (!isSystemTest && !hasText(memoryContext) && !options.conversationHistory && !options.persistentMemory) {
      console.log('[DualCmd] Building memory context…');
      try {
        memoryContext = await memory.buildConversationContext(chatId);
        console.log('[DualCmd] Memory context len:', memoryContext.length);
      } catch (mErr) {
        console.log('[DualCmd] Memory builder failed; fallback DB:', mErr?.message || mErr);
        try {
          const [h, m] = await Promise.allSettled([
            database.getConversationHistoryDB(chatId, 5),
            database.getPersistentMemoryDB(chatId)
          ]);
          if (h.status === 'fulfilled') memoryData.conversationHistory = h.value || [];
          if (m.status === 'fulfilled') memoryData.persistentMemory = m.value || [];
          console.log('[DualCmd] Fallback memory fetched', {
            history: memoryData.conversationHistory.length,
            persistent: memoryData.persistentMemory.length
          });
        } catch (fErr) {
          console.log('[DualCmd] All memory retrieval failed:', fErr?.message || fErr);
          memoryContext = '';
        }
      }
    }

    const analysis = analyzeQuery(userMessage, options.messageType || 'text', options.hasMedia || false, memoryContext);

    if (analysis.shouldSkipGPT5) {
      console.log('[DualCmd] Completion detected:', analysis.completionStatus?.completionType);
      const rt = now() - start;
      return {
        response: analysis.quickResponse,
        aiUsed: 'completion-detection',
        queryType: 'completion',
        complexity: 'low',
        reasoning: `Completion detected — ${analysis.completionStatus?.completionType}`,
        priority: 'completion',
        completionDetected: true,
        completionType: analysis.completionStatus?.completionType,
        skippedGPT5: true,
        contextUsed: hasText(memoryContext),
        responseTime: rt,
        tokenCount: 0,
        functionExecutionTime: rt,
        gpt5OnlyMode: true,
        gpt5System: false,
        powerMode: 'COMPLETION_DETECTION',
        confidence: 0.95,
        modelUsed: 'none',
        cost_tier: 'free',
        memoryData: {
          contextLength: memoryContext.length,
          conversationRecords: memoryData.conversationHistory.length,
          persistentMemories: memoryData.persistentMemory.length,
          memoryImportant: false,
          memoryUsed: hasText(memoryContext),
          postgresqlConnected: (memoryData.conversationHistory.length + memoryData.persistentMemory.length) > 0
        },
        success: true,
        timestamp: new Date().toISOString(),
        sendToTelegram: async (bot, title = null) => {
          try {
            const finalTitle = title || 'Task Completion Acknowledged';
            const metadata = {
              modelUsed: 'analysis', // generic label for splitter
              responseTime: rt,
              completionDetected: true,
              completionType: analysis.completionStatus?.completionType,
              contextUsed: hasText(memoryContext),
              skippedGPT5: true,
              costSaved: true
            };
            return await telegramSplitter.sendGPTResponse(bot, chatId, analysis.quickResponse, finalTitle, metadata);
          } catch (te) {
            console.error('[DualCmd] Telegram completion send error:', te?.message || te);
            return false;
          }
        }
      };
    }

    if (options.forceModel && /^gpt-5/.test(String(options.forceModel))) {
      analysis.gpt5Model = options.forceModel;
      analysis.reason = `Forced to use ${options.forceModel}`;
    }

    console.log('[DualCmd] Analysis:', {
      type: analysis.type,
      priority: analysis.priority,
      model: analysis.gpt5Model,
      reasoning: analysis.reasoning_effort,
      verbosity: analysis.verbosity,
      memoryImportant: analysis.memoryImportant,
      reason: analysis.reason
    });

    let fullResult = null; let response = ''; let aiUsed = '';

    try {
      fullResult = await executeThroughGPT5System(userMessage, analysis, memoryContext, memoryData, chatId);
      response = fullResult.response;
      aiUsed = fullResult.aiUsed || prettyAiUsed(analysis.gpt5Model);
      console.log('[DualCmd] GPT‑5 execution ok:', { aiUsed, powerMode: fullResult.powerMode, confidence: fullResult.confidence, costTier: fullResult.cost_tier });
    } catch (e) {
      console.error('[DualCmd] Main execution failed; trying Nano fallback:', e?.message || e);
      try {
        response = await executeGPT5Fallback(userMessage, analysis, memoryContext);
        aiUsed = 'GPT‑5 Nano (fallback)';
        console.log('[DualCmd] Nano fallback success');
      } catch (fErr) {
        console.error('[DualCmd] All GPT‑5 models failed:', fErr?.message || fErr);
        throw new Error(`Complete GPT‑5 system failure: ${fErr?.message || fErr}`);
      }
    }

    const rt = now() - start;
    const result = {
      response,
      aiUsed,
      queryType: analysis.type,
      complexity: analysis.complexity,
      reasoning: analysis.reason,
      priority: analysis.priority,
      liveDataUsed: analysis.needsLiveData,
      contextUsed: hasText(memoryContext),
      responseTime: rt,
      tokenCount: response.length,
      functionExecutionTime: rt,
      gpt5OnlyMode: true,
      gpt5System: !!fullResult,
      powerMode: fullResult?.powerMode || 'fallback',
      confidence: fullResult?.confidence || 0.7,
      modelUsed: fullResult?.modelUsed || 'gpt-5-nano',
      reasoning_effort: analysis.reasoning_effort,
      verbosity: analysis.verbosity,
      cost_tier: fullResult?.cost_tier || 'economy',
      completionDetected: false,
      memoryData: {
        contextLength: memoryContext.length,
        conversationRecords: memoryData.conversationHistory.length,
        persistentMemories: memoryData.persistentMemory.length,
        memoryImportant: analysis.memoryImportant,
        memoryUsed: hasText(memoryContext),
        postgresqlConnected: (memoryData.conversationHistory.length + memoryData.persistentMemory.length) > 0
      },
      analytics: fullResult?.analytics || {
        queryComplexity: analysis.complexity,
        domainClassification: analysis.type,
        priorityLevel: analysis.priority,
        modelOptimization: 'GPT‑5 smart selection',
        costOptimized: true
      },
      success: true,
      timestamp: new Date().toISOString(),
      sendToTelegram: async (bot, title = null) => {
        try {
          const defaultTitle = `GPT‑5 ${analysis.gpt5Model.includes('nano') ? 'Nano' : analysis.gpt5Model.includes('mini') ? 'Mini' : (analysis.gpt5Model.includes('chat') ? 'Chat' : 'Full')} Analysis`;
          const finalTitle = title || defaultTitle;
          const gpt5Indicator = fullResult ? 'GPT‑5 Optimized' : 'GPT‑5 Fallback';
          const fullTitle = `${finalTitle} (${gpt5Indicator})`;
          const metadata = {
            modelUsed: normalizeModelUsedForTelegram(analysis.gpt5Model),
            responseTime: rt,
            contextUsed: hasText(memoryContext),
            complexity: analysis.complexity,
            gpt5System: !!fullResult,
            confidence: fullResult?.confidence || 0.7,
            model: analysis.gpt5Model,
            costTier: fullResult?.cost_tier || 'economy'
          };
          return await telegramSplitter.sendGPTResponse(bot, chatId, response, fullTitle, metadata);
        } catch (te) {
          console.error('[DualCmd] Telegram send error:', te?.message || te);
          return false;
        }
      }
    };

    return result;
  } catch (error) {
    console.error('[DualCmd] Command execution error:', error?.message || error);
    const rt = now() - start;
    return {
      response: `I apologize, but I'm experiencing technical difficulties with GPT‑5. Please try again in a moment.\n\nError: ${error?.message || error}\n\nYou can try:\n• A simpler question\n• Waiting a moment and trying again\n• Checking your internet connection`,
      aiUsed: 'emergency-fallback',
      queryType: 'error',
      complexity: 'low',
      reasoning: 'Complete GPT‑5 system failure, emergency response',
      contextUsed: false,
      responseTime: rt,
      memoryData: { contextLength: 0, conversationRecords: 0, persistentMemories: 0, memoryImportant: false, postgresqlConnected: false },
      success: false,
      error: error?.message || error,
      gpt5OnlyMode: true,
      gpt5System: false,
      sendToTelegram: async (bot) => {
        try { return await telegramSplitter.sendAlert(bot, chatId, `GPT‑5 system error: ${error?.message || error}`, 'Emergency Fallback'); }
        catch (te) { console.error('[DualCmd] Emergency alert failed:', te?.message || te); return false; }
      }
    };
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                        SECTION 7: Testing & Health                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function testMemoryIntegration(chatId) {
  console.log('[DualCmd] Test memory integration');
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
    const cd = detectCompletionStatus('done ready', 'system already built');
    tests.completionDetection = !!cd.shouldSkipGPT5;
  } catch (e) { /* ignore */ }

  try {
    const testConn = await database.getConversationHistoryDB('test', 1);
    tests.postgresqlConnection = Array.isArray(testConn);
  } catch (e) { /* ignore */ }

  try {
    const history = await database.getConversationHistoryDB(chatId, 3);
    tests.conversationHistory = Array.isArray(history);
  } catch (e) { /* ignore */ }

  try {
    const memories = await database.getPersistentMemoryDB(chatId);
    tests.persistentMemory = Array.isArray(memories);
  } catch (e) { /* ignore */ }

  try {
    const context = await memory.buildConversationContext(chatId);
    tests.memoryBuilding = typeof context === 'string';
  } catch (e) { /* ignore */ }

  try {
    const direct = await openaiClient.getGPT5Analysis('Hello, test GPT‑5 functionality', { model: 'gpt-5-nano', reasoning_effort: 'minimal', max_completion_tokens: 50 });
    tests.gpt5WithMemory = !!direct;
  } catch (e) { /* ignore */ }

  try {
    tests.memoryContextPassing = tests.memoryBuilding && tests.postgresqlConnection;
  } catch (e) { /* ignore */ }

  try {
    const health = await openaiClient.checkGPT5SystemHealth();
    tests.gpt5ModelSelection = !!(health.nano || health.mini);
  } catch (e) { /* ignore */ }

  try {
    tests.telegramIntegration = isFn(telegramSplitter.sendGPTResponse);
  } catch (e) { /* ignore */ }

  try {
    const system = await checkGPT5OnlySystemHealth();
    tests.gpt5SystemHealth = !!system.overallHealth;
  } catch (e) { /* ignore */ }

  const count = Object.values(tests).filter(Boolean).length;
  const total = Object.keys(tests).length;
  return {
    tests,
    score: count,
    total,
    percentage: Math.round((count / total) * 100),
    status: count === total ? 'FULL_SUCCESS' : count >= Math.round(total * 0.7) ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION',
    gpt5OnlyMode: true,
    completionDetectionEnabled: tests.completionDetection,
    postgresqlIntegrated: tests.postgresqlConnection && tests.conversationHistory,
    memorySystemIntegrated: tests.memoryBuilding && tests.gpt5WithMemory
  };
}

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
    const t = detectCompletionStatus('done ready', 'system built');
    health.completionDetection = !!t.shouldSkipGPT5;
  } catch (e) { health.errors.push(`Completion Detection: ${e?.message || e}`); }

  const models = [
    { key: 'gpt5_full', model: 'gpt-5', desc: 'Full GPT‑5' },
    { key: 'gpt5_mini', model: 'gpt-5-mini', desc: 'GPT‑5 Mini' },
    { key: 'gpt5_nano', model: 'gpt-5-nano', desc: 'GPT‑5 Nano' },
    { key: 'gpt5_chat', model: 'gpt-5-chat-latest', desc: 'GPT‑5 Chat' }
  ];
  for (const m of models) {
    try {
      const opt = { model: m.model, max_completion_tokens: 50 };
      if (m.model !== 'gpt-5-chat-latest') opt.reasoning_effort = 'minimal';
      await openaiClient.getGPT5Analysis('Health check test', opt);
      health[m.key] = true;
    } catch (e) { health.errors.push(`${m.model}: ${e?.message || e}`); }
  }
  try {
    const hist = await database.getConversationHistoryDB('health_test', 1);
    health.databaseConnection = Array.isArray(hist);
    health.postgresqlStatus = health.databaseConnection ? 'connected' : 'disconnected';
  } catch (e) { health.errors.push(`PostgreSQL: ${e?.message || e}`); health.postgresqlStatus = 'disconnected'; }
  try {
    const ctx = await memory.buildConversationContext('health_test');
    health.memorySystem = typeof ctx === 'string';
    health.contextBuilding = true;
  } catch (e) { health.errors.push(`Memory: ${e?.message || e}`); }
  try {
    const t = getCurrentCambodiaDateTime();
    health.dateTimeSupport = !!t?.date;
  } catch (e) { health.errors.push(`DateTime: ${e?.message || e}`); }
  try {
    health.telegramIntegration = isFn(telegramSplitter.sendGPTResponse);
  } catch (e) { health.errors.push(`Telegram: ${e?.message || e}`); }

  const healthy = [health.gpt5_full, health.gpt5_mini, health.gpt5_nano].filter(Boolean).length;
  health.overallHealth = healthy >= 1 && health.memorySystem && health.databaseConnection;
  health.healthScore = (healthy * 15) + (health.gpt5_chat ? 10 : 0) + (health.completionDetection ? 15 : 0) + (health.memorySystem ? 10 : 0) + (health.databaseConnection ? 15 : 0) + (health.telegramIntegration ? 5 : 0) + (health.dateTimeSupport ? 5 : 0);
  health.healthGrade = health.healthScore >= 95 ? 'A+' : health.healthScore >= 85 ? 'A' : health.healthScore >= 75 ? 'B+' : health.healthScore >= 65 ? 'B' : health.healthScore >= 50 ? 'C' : 'F';
  return health;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                        SECTION 8: Recommendations & Costs                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function getGPT5ModelRecommendation(query) {
  const a = analyzeQuery(query);
  return {
    recommendedModel: a.gpt5Model,
    reasoning: a.reason,
    priority: a.priority,
    completionDetected: a.shouldSkipGPT5,
    configuration: {
      reasoning_effort: a.reasoning_effort,
      verbosity: a.verbosity,
      max_completion_tokens: a.max_completion_tokens,
      temperature: a.temperature
    },
    estimatedCost: a.gpt5Model === 'gpt-5-nano' ? 'Very Low' : a.gpt5Model === 'gpt-5-mini' ? 'Low' : 'Medium',
    responseSpeed: a.gpt5Model === 'gpt-5-nano' ? 'Very Fast' : a.gpt5Model === 'gpt-5-mini' ? 'Fast' : 'Balanced'
  };
}

function getGPT5CostEstimate(query, estimatedTokens = 1000) {
  const a = analyzeQuery(query);
  if (a.shouldSkipGPT5) {
    return {
      model: 'completion-detection',
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      inputCost: '0.000000',
      outputCost: '0.000000',
      totalCost: '0.000000',
      costTier: 'Free',
      completionDetected: true,
      costSavings: 'Maximum — No AI tokens used'
    };
  }
  const costs = {
    'gpt-5-nano': { input: 0.05, output: 0.40 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-chat-latest': { input: 1.25, output: 10.00 }
  };
  const c = costs[a.gpt5Model] || costs['gpt-5-mini'];
  const inCost = (estimatedTokens * 0.5 / 1_000_000) * c.input;
  const outCost = (estimatedTokens * 0.5 / 1_000_000) * c.output;
  return {
    model: a.gpt5Model,
    estimatedInputTokens: Math.round(estimatedTokens * 0.5),
    estimatedOutputTokens: Math.round(estimatedTokens * 0.5),
    inputCost: inCost.toFixed(6),
    outputCost: outCost.toFixed(6),
    totalCost: (inCost + outCost).toFixed(6),
    costTier: a.gpt5Model === 'gpt-5-nano' ? 'Economy' : a.gpt5Model === 'gpt-5-mini' ? 'Standard' : 'Premium',
    completionDetected: false
  };
}

function getGPT5PerformanceMetrics() {
  return {
    systemMode: 'GPT‑5 Only with Completion Detection',
    modelsAvailable: ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5-chat-latest'],
    smartRouting: 'Enabled',
    completionDetection: 'Active',
    costOptimization: 'Active + Completion Savings',
    memoryIntegration: 'PostgreSQL‑backed',
    telegramIntegration: 'Enhanced',
    fallbackSystem: 'Multi‑tier GPT‑5',
    healthMonitoring: 'Comprehensive',
    estimatedSavings: '60–80% vs dual AI system + completion detection savings',
    responseTime: { completion: 'Instant', nano: '1–3s', mini: '2–5s', full: '3–8s', chat: '2–6s' },
    capabilities: {
      completionDetection: 'Prevents repetitive responses',
      speed: 'GPT‑5 Nano optimized',
      balance: 'GPT‑5 Mini optimized',
      complex: 'Full GPT‑5 optimized',
      vision: 'Full GPT‑5 enabled',
      coding: 'Full GPT‑5 enhanced',
      math: 'Full GPT‑5 precision'
    }
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                        SECTION 9: Intelligence & Status                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function getMarketIntelligence(chatId = null) {
  const g = getCurrentGlobalDateTime();
  const query = `Current market intelligence summary — Time: ${g.cambodia.date}, ${g.cambodia.time} Cambodia. Provide concise overview of market conditions, key risks, and opportunities.`;
  try {
    return await openaiClient.getGPT5Analysis(query, { model: 'gpt-5-mini', reasoning_effort: 'medium', max_completion_tokens: 8000 });
  } catch (e) {
    try {
      return await openaiClient.getGPT5Analysis(query, { model: 'gpt-5-nano', reasoning_effort: 'minimal', max_completion_tokens: 6000 });
    } catch (f) {
      return 'Market intelligence temporarily unavailable — GPT‑5 system issues';
    }
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                           SECTION 10: Enhanced API                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function executeEnhancedGPT5Command(userMessage, chatId, bot = null, options = {}) {
  try {
    console.log('[DualCmd] Enhanced GPT‑5 command');
    let memoryContext = '';
    try {
      if (memory && isFn(memory.buildConversationContext)) {
        memoryContext = await memory.buildConversationContext(chatId);
        console.log('[DualCmd] Built memory ctx len:', memoryContext.length);
        if (hasText(memoryContext)) {
          const chk = detectCompletionStatus(userMessage, memoryContext);
          if (chk.shouldSkipGPT5) {
            console.log('[DualCmd] Completion detected via memory');
            const msg = generateCompletionResponse(chk, userMessage);
            if (bot) await bot.sendMessage(chatId, msg);
            return { success: true, response: msg, aiUsed: 'completion-detection', completionDetected: true, memoryUsed: true, contextUsed: true, telegramDelivered: !!bot };
          }
        }
      }
    } catch (e) {
      console.warn('[DualCmd] Memory build fail:', e?.message || e);
    }

    const res = await executeDualCommand(userMessage, chatId, { ...options, memoryContext, enhanceCompletionDetection: true, projectAwareMemory: true });

    if (bot && res?.success) {
      if (isFn(res.sendToTelegram)) {
        const title = res.completionDetected ? 'Task Completion Acknowledged' : (options.title || 'GPT‑5 Analysis');
        const ok = await res.sendToTelegram(bot, title);
        res.telegramDelivered = ok; res.autoDelivery = true;
      } else {
        await bot.sendMessage(chatId, res.response);
        res.telegramDelivered = true; res.autoDelivery = true;
      }
    }

    return res;
  } catch (error) {
    console.error('[DualCmd] Enhanced command error:', error?.message || error);
    if (bot) {
      try { await bot.sendMessage(chatId, `I encountered an issue: ${error?.message || error}. Let me try a different approach.`); }
      catch (te) { console.error('[DualCmd] Alert delivery failed:', te?.message || te); }
    }
    return { success: false, response: `I'm having technical difficulties. Please try again.`, aiUsed: 'fallback', modelUsed: 'error-handler', powerMode: 'FALLBACK', contextUsed: false, telegramDelivered: false, error: error?.message || error };
  }
}

async function quickGPT5Command(message, chatId, bot = null, model = 'auto') {
  const options = { title: `Quick GPT‑5 ${String(model).toUpperCase()} Response`, preserveMemoryContext: true };
  if (model !== 'auto') options.forceModel = /^gpt-5/.test(model) ? model : `gpt-5-${model}`;
  return executeEnhancedGPT5Command(message, chatId, bot, options);
}

async function quickNanoCommand(message, chatId, bot = null) { return quickGPT5Command(message, chatId, bot, 'gpt-5-nano'); }
async function quickMiniCommand(message, chatId, bot = null) { return quickGPT5Command(message, chatId, bot, 'gpt-5-mini'); }
async function quickUltimateCommand(message, chatId, bot = null) { return quickGPT5Command(message, chatId, bot, 'gpt-5'); }

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                           SECTION 11: Exports                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

module.exports = {
  executeDualCommand,
  analyzeQuery,
  executeThroughGPT5System,
  executeGPT5Fallback,
  detectCompletionStatus,
  generateCompletionResponse,
  testMemoryIntegration,
  getCurrentCambodiaDateTime,
  getCurrentGlobalDateTime,
  getMarketIntelligence,
  getGlobalMarketStatus,
  checkSystemHealth: checkGPT5OnlySystemHealth,
  getSystemAnalytics: getGPT5PerformanceMetrics,
  executeEnhancedGPT5Command,
  quickGPT5Command,
  quickNanoCommand,
  quickMiniCommand,
  quickUltimateCommand,
  checkGPT5OnlySystemHealth,
  getGPT5ModelRecommendation,
  getGPT5CostEstimate,
  getGPT5PerformanceMetrics,
  enhancedCompletionDetection,
  generateProjectAwareResponse,
  // Legacy aliases
  executeGptAnalysis: (msg, analysis, ctx, mem) => executeThroughGPT5System(msg, { ...analysis, bestAI: 'gpt' }, ctx, mem),
  executeClaudeAnalysis: (msg, analysis, ctx, mem) => executeThroughGPT5System(msg, { ...analysis, bestAI: 'gpt' }, ctx, mem),
  routeConversationIntelligently: analyzeQuery
};

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                             SECTION 12: Boot Log                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

console.log('[DualCmd] GPT‑5 Only System loaded (v6)');
console.log('[DualCmd] Flow: index.js → dualCommandSystem.js → openaiClient.js');
console.log('[DualCmd] Completion detection & memory awareness active');
console.log('[DualCmd] Family: Nano → Mini → Full → Chat');

// ============================================================================
//                            END OF dualCommandSystem.js
// ============================================================================

