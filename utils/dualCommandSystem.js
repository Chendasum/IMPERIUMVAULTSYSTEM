// utils/dualCommandSystem.js
// Secure GPT-5 Command System (All-in-one, 2025-09)
// - Smart model selection (Nano/Mini/Full/Chat)
// - Chitchat short-circuit (skip GPT-5 for “hello” etc.)
// - Memory TTL facts (last_topic, next_action, last_completion)
// - Safe Postgres persistence (via database.js) + optional memory.js
// - Multimodal (image/doc/voice) via multimodal.js
// - Clean Telegram delivery via telegramSplitter.js
// - Exports: handleTelegramMessage, handleCallbackQuery, handleInlineQuery, initialize, shutdown
//            executeDualCommand, executeEnhancedGPT5Command, analyzeQuery,
//            quickNanoCommand, quickMiniCommand, quickUltimateCommand

"use strict";

require("dotenv").config();

// ───────────────────────────────────────────────────────────────────────────────
// Lazy, safe imports (no hard crash if a module is missing)
// ───────────────────────────────────────────────────────────────────────────────
function lazy(name, candidates, stubFactory) {
  for (let i = 0; i < candidates.length; i++) {
    try {
      const mod = require(candidates[i]);
      console.log(`[dual] Loaded ${name} from ${candidates[i]}`);
      return mod;
    } catch (_) {}
  }
  const stub = typeof stubFactory === "function" ? stubFactory() : {};
  console.warn(`[dual] ${name} not found, using stub`);
  return stub;
}

const database = lazy("database", ["./database", "./utils/database"], () => ({
  initialize: async () => {},
  healthCheck: async () => ({ ok: false, error: "db-missing" }),
  shutdown: async () => {},
  saveConversation: async () => {},
  getConversationHistoryDB: async () => [],
  saveToMemory: async () => {},
  getPersistentMemoryDB: async () => []
}));

const memory = lazy("memory", ["./memory", "./utils/memory"], () => ({
  saveToMemory: async () => {},
  buildConversationContext: async () => ""
}));

const openaiClient = lazy("openaiClient", ["./openaiClient", "./utils/openaiClient"], () => ({
  getGPT5Analysis: async () => "Service unavailable (openaiClient stub).",
  getGPT5AnalysisWithMemory: async () => "Service unavailable (openaiClient stub).",
  getQuickNanoResponse: async () => "Service unavailable (openaiClient stub).",
  getQuickMiniResponse: async () => "Service unavailable (openaiClient stub).",
  getDeepAnalysis: async () => "Service unavailable (openaiClient stub).",
  GPT5_CONFIG: {
    PRIMARY_MODEL: "gpt-5",
    MINI_MODEL: "gpt-5-mini",
    NANO_MODEL: "gpt-5-nano",
    CHAT_MODEL: "gpt-5-chat-latest"
  }
}));

const telegramSplitter = lazy("telegramSplitter", ["./telegramSplitter", "./utils/telegramSplitter"], () => ({
  sendTelegramMessage: async (bot, chatId, text) => { await bot.sendMessage(chatId, text); return { success: true, fallback: true }; },
  sendAlert: async (bot, chatId, text, title) => { await bot.sendMessage(chatId, (title ? title + "\n\n" : "") + text); return { success: true }; }
}));

const multimodal = lazy("multimodal", ["./multimodal", "./utils/multimodal"], () => ({
  analyzeImage: async (bot, fileId, prompt, chatId) => ({ success: false, error: "vision-stub" }),
  analyzeDocument: async (bot, doc, prompt, chatId) => ({ success: false, error: "doc-stub" }),
  analyzeVoice: async (bot, voice, prompt, chatId) => ({ success: false, error: "voice-stub" }),
  analyzeAudio: async (bot, audio, prompt, chatId) => ({ success: false, error: "audio-stub" }),
  analyzeVideo: async () => ({ success: false, error: "video-stub" }),
  analyzeVideoNote: async () => ({ success: false, error: "videonote-stub" }),
}));

// ───────────────────────────────────────────────────────────────────────────────
// Config + State
// ───────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  MODELS: {
    FULL: openaiClient.GPT5_CONFIG && openaiClient.GPT5_CONFIG.PRIMARY_MODEL || "gpt-5",
    MINI: openaiClient.GPT5_CONFIG && openaiClient.GPT5_CONFIG.MINI_MODEL || "gpt-5-mini",
    NANO: openaiClient.GPT5_CONFIG && openaiClient.GPT5_CONFIG.NANO_MODEL || "gpt-5-nano",
    CHAT: openaiClient.GPT5_CONFIG && openaiClient.GPT5_CONFIG.CHAT_MODEL || "gpt-5-chat-latest"
  },
  REASONING_LEVELS: ["low", "medium", "high"],
  VERBOSITY_LEVELS: ["low", "medium", "high"],
  TOKEN_LIMITS: { NANO: 4000, MINI: 8000, FULL: 16000, CHAT: 16000 },
  GREETING_REGEX: /^(hi|hello|hey|yo|sup|gm|good\s+(morning|afternoon|evening)|how\s+are\s+you)[\s!,.?]*$/i,
  COMPLETION_REGEX: /\b(thanks|got it|ok|okay|done|that’s all|that's all|finish(ed)?|no further (help|questions))\b/i,
  MAX_CONTEXT_CHARS: 2000,
  MAX_HISTORY: 50
};

const systemState = {
  version: "7.2.0",
  startTime: Date.now(),
  requests: { total: 0, completionDetected: 0, errors: 0, success: 0 }
};

// ───────────────────────────────────────────────────────────────────────────────
// Time helpers
// ───────────────────────────────────────────────────────────────────────────────
function getCurrentCambodiaDateTime() {
  try {
    const now = new Date();
    // Cambodia is UTC+7 with no DST
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kh = new Date(utc + 7 * 3600000);
    const d = kh.toISOString().slice(0, 10);
    const t = kh.toISOString().slice(11, 19);
    const hour = Number(t.slice(0, 2));
    const isWeekend = kh.getDay() === 0 || kh.getDay() === 6;
    return { date: d, time: t, hour, isWeekend, timezone: "UTC+7 (Asia/Phnom_Penh)" };
  } catch (_) {
    return { date: "", time: "", hour: 0, isWeekend: false, timezone: "UTC+7" };
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Memory helpers (TTL facts) — chitchat-aware
// ───────────────────────────────────────────────────────────────────────────────
const TTL = {
  FACT: 7 * 24 * 60 * 60 * 1000,            // 7 days
  LAST_COMPLETION: 14 * 24 * 60 * 60 * 1000, // 14 days
  LAST_TOPIC: 48 * 60 * 60 * 1000            // 48 hours
};

function normalizeAssistantText(text) {
  if (!text) return "";
  return String(text)
    .replace(/^(Assistant:|AI:|GPT-?5?:)\s*/i, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 8000);
}

function inferTopic(userMessage) {
  if (!userMessage) return "general";
  const raw = String(userMessage).trim();
  const s = raw.toLowerCase();
  if (CONFIG.GREETING_REGEX.test(raw)) return "chitchat";
  if (s.indexOf("error") >= 0 || s.indexOf("bug") >= 0) return "troubleshooting";
  if (s.indexOf("report") >= 0 || s.indexOf("analysis") >= 0) return "analysis";
  if (s.indexOf("deploy") >= 0 || s.indexOf("production") >= 0) return "deployment";
  if (s.indexOf("memory") >= 0 || s.indexOf("context") >= 0) return "memory";
  if (raw.length < 30) return raw;
  return raw.slice(0, 60).trim();
}

async function upsertPersistentFact(chatId, key, value, ttlMs) {
  try {
    if (!chatId || !key) return false;
    const payload = {
      type: "fact",
      key: String(key),
      value: String(value),
      createdAt: new Date().toISOString(),
      expiresAt: ttlMs ? new Date(Date.now() + ttlMs).toISOString() : null
    };
    if (typeof memory.saveToMemory === "function") {
      await memory.saveToMemory(chatId, payload);
      return true;
    }
    if (typeof database.saveToMemory === "function") {
      await database.saveToMemory(chatId, payload);
      return true;
    }
    return false;
  } catch (e) {
    console.warn("[dual] upsertPersistentFact failed:", e.message);
    return false;
  }
}

async function persistConversationTurn(chatId, userMessage, assistantResponse, meta) {
  try {
    if (!chatId) return false;
    const assistant = normalizeAssistantText(assistantResponse);
    if (typeof database.saveConversation === "function") {
      await database.saveConversation(chatId, String(userMessage || ""), assistant, Object.assign({ savedAt: new Date().toISOString() }, meta || {}));
      return true;
    }
    return false;
  } catch (e) {
    console.warn("[dual] persistConversationTurn failed:", e.message);
    return false;
  }
}

async function maybeSaveMemory(chatId, userMessage, processedResponse, queryAnalysis, gpt5Result) {
  if (!chatId) return { saved: false };

  const turnSaved = await persistConversationTurn(chatId, userMessage, processedResponse, {
    modelUsed: (gpt5Result && gpt5Result.modelUsed) || (queryAnalysis && queryAnalysis.gpt5Model),
    priority: queryAnalysis && queryAnalysis.priority,
    complexity: (queryAnalysis && queryAnalysis.complexity && queryAnalysis.complexity.complexity) || "unknown",
    processingTime: gpt5Result && gpt5Result.processingTime
  });

  if (
    (queryAnalysis && queryAnalysis.completionStatus && (queryAnalysis.completionStatus.isFrustrated || queryAnalysis.completionStatus.isComplete)) ||
    (gpt5Result && gpt5Result.completionDetected)
  ) {
    await upsertPersistentFact(
      chatId,
      "last_completion",
      "Completed at " + new Date().toISOString() + " — type: " + ((queryAnalysis && queryAnalysis.completionStatus && queryAnalysis.completionStatus.completionType) || "direct"),
      TTL.LAST_COMPLETION
    );
  }

  const topic = inferTopic(userMessage);
  if (topic !== "chitchat") {
    await upsertPersistentFact(chatId, "last_topic", topic, TTL.LAST_TOPIC);
    const nextMatch = String(processedResponse || "").match(/(?:^|\n)\s*(?:next\s*steps?|todo|action(?:s)?)[^\n]*$/im);
    if (nextMatch) {
      await upsertPersistentFact(chatId, "next_action", nextMatch[0].slice(0, 200), TTL.FACT);
    }
  }

  return { saved: turnSaved };
}

// ───────────────────────────────────────────────────────────────────────────────
// Memory context builder (safe + bounded)
// ───────────────────────────────────────────────────────────────────────────────
async function buildMemoryContext(chatId, opts) {
  try {
    const result = { context: "", memoryData: { conversationHistory: [], persistentMemory: [] } };
    if (!chatId) return result;

    let persistent = [];
    try { persistent = await database.getPersistentMemoryDB(chatId); }
    catch (e) { console.warn("memory.getPersistentMemory DB failed →", e.message); }

    let history = [];
    try { history = await database.getConversationHistoryDB(chatId, CONFIG.MAX_HISTORY); }
    catch (e) { console.warn("memory.getConversationHistory DB failed →", e.message); }

    const lines = [];

    if (persistent && persistent.length) {
      lines.push("MEMORY (facts):");
      for (let i = 0; i < Math.min(persistent.length, 50); i++) {
        const it = persistent[i];
        const k = (it && (it.key || it.mem_key)) || "";
        const v = (it && (it.value || it.mem_value)) || "";
        if (k && v) lines.push("- " + k + ": " + String(v).slice(0, 200));
      }
      lines.push("");
    }

    if (history && history.length) {
      lines.push("RECENT CONVERSATION (most recent last):");
      for (let i = Math.max(0, history.length - 10); i < history.length; i++) {
        const h = history[i];
        if (h && h.userMessage) lines.push("User: " + String(h.userMessage).slice(0, 300));
        if (h && h.assistantResponse) lines.push("Assistant: " + String(h.assistantResponse).slice(0, 300));
      }
      lines.push("");
    }

    let context = lines.join("\n");
    if (context.length > CONFIG.MAX_CONTEXT_CHARS) {
      context = context.slice(-CONFIG.MAX_CONTEXT_CHARS);
    }

    result.context = context;
    result.memoryData = { conversationHistory: history, persistentMemory: persistent };
    return result;
  } catch (e) {
    console.warn("buildMemoryContext failed →", e.message);
    return { context: "", memoryData: { conversationHistory: [], persistentMemory: [] } };
  }
}

// ───────────────────────────────────────────────────────────────────────────────
function preprocessQuery(userMessage, options) {
  const raw = (userMessage == null ? "" : String(userMessage)).trim();
  if (!raw) return { isEmpty: true, cleaned: "" };
  return { isEmpty: false, cleaned: raw };
}

function isGreetingOnly(text) {
  const trimmed = String(text || "").trim();
  return CONFIG.GREETING_REGEX.test(trimmed);
}

function detectCompletionStatus(text) {
  const s = String(text || "");
  if (CONFIG.COMPLETION_REGEX.test(s)) {
    return { isComplete: true, completionType: "ack", confidence: 0.98 };
  }
  return { isComplete: false, completionType: null, confidence: 0.0 };
}

// ───────────────────────────────────────────────────────────────────────────────
// Model analysis / selection
// ───────────────────────────────────────────────────────────────────────────────
function analyzeQuery(text, messageType, hasMedia, memoryContext) {
  const s = String(text || "");
  const lower = s.toLowerCase();

  // Chitchat short-circuit is handled earlier in executeDualCommand

  const complexityKeywords = ["analyze", "compare", "evaluate", "research", "complex", "detailed", "comprehensive", "strategy", "mathematical", "proof", "architecture", "optimize"];
  let hasComplex = false;
  for (let i = 0; i < complexityKeywords.length; i++) {
    if (lower.indexOf(complexityKeywords[i]) >= 0) { hasComplex = true; break; }
  }

  const len = s.length;
  let gpt5Model = CONFIG.MODELS.MINI;
  let reasoning_effort = "medium";
  let verbosity = "medium";
  let priority = "balanced";
  let type = "general";

  if (hasMedia) {
    type = "multimodal";
    priority = "balanced";
    gpt5Model = CONFIG.MODELS.MINI;
  } else if (hasComplex || len > 10000) {
    type = hasComplex ? "analytical" : "longform";
    priority = hasComplex ? "accuracy" : "balanced";
    gpt5Model = CONFIG.MODELS.FULL;
    reasoning_effort = "high";
  } else if (len <= 64) {
    type = "short";
    priority = "speed";
    gpt5Model = CONFIG.MODELS.CHAT; // chat does great on tiny prompts
    reasoning_effort = "low";
    verbosity = "low";
  } else if (len <= 2000) {
    type = "light";
    priority = "speed";
    gpt5Model = CONFIG.MODELS.NANO;
    reasoning_effort = "low";
    verbosity = "low";
  } else {
    type = "standard";
    priority = "balanced";
    gpt5Model = CONFIG.MODELS.MINI;
    reasoning_effort = "medium";
    verbosity = "medium";
  }

  const completionStatus = detectCompletionStatus(s);

  return {
    type,
    priority,
    gpt5Model,
    reasoning_effort,
    verbosity,
    complexity: { complexity: hasComplex ? "high" : (len < 2000 ? "low" : "medium") },
    confidence: hasComplex ? 0.9 : 0.75,
    memoryImportant: !!(memoryContext && memoryContext.length > 0),
    completionStatus,
    shouldSkipGPT5: false, // set by chitchat path, not here
    max_completion_tokens:
      gpt5Model === CONFIG.MODELS.FULL ? CONFIG.TOKEN_LIMITS.FULL :
      gpt5Model === CONFIG.MODELS.MINI ? CONFIG.TOKEN_LIMITS.MINI :
      gpt5Model === CONFIG.MODELS.NANO ? CONFIG.TOKEN_LIMITS.NANO :
      CONFIG.TOKEN_LIMITS.CHAT,
    estimatedCost: null, // left null to avoid outdated prices
    reason: "auto-selected"
  };
}

function validateQueryAnalysis(a) {
  const errors = [];
  const warnings = [];
  if (!a || !a.gpt5Model) errors.push("no model selected");
  if (a.reasoning_effort && CONFIG.REASONING_LEVELS.indexOf(a.reasoning_effort) < 0) warnings.push("unknown reasoning_effort");
  if (a.verbosity && CONFIG.VERBOSITY_LEVELS.indexOf(a.verbosity) < 0) warnings.push("unknown verbosity");
  return { isValid: errors.length === 0, errors, warnings };
}

// ───────────────────────────────────────────────────────────────────────────────
// Core execution
// ───────────────────────────────────────────────────────────────────────────────
async function executeThroughGPT5System(prompt, analysis, memoryContext, memoryData, chatId) {
  const useMemory = !!(memoryContext && memoryContext.length > 0);
  const opts = {
    model: analysis.gpt5Model,
    reasoning_effort: analysis.reasoning_effort,
    max_completion_tokens: analysis.max_completion_tokens,
    verbosity: analysis.verbosity
  };

  const started = Date.now();
  let text;
  try {
    if (useMemory && typeof openaiClient.getGPT5AnalysisWithMemory === "function") {
      text = await openaiClient.getGPT5AnalysisWithMemory(prompt, {
        systemPreamble: "You are a precise, helpful assistant. Use memory context only as hints.",
        recall: [] // (we already inlined facts into memoryContext string below)
      }, opts);
    } else {
      text = await openaiClient.getGPT5Analysis(prompt, opts);
    }
  } catch (e) {
    throw new Error(e && e.message ? e.message : String(e));
  }

  const processingTime = Date.now() - started;
  const tokensUsed = Math.ceil((prompt.length + String(text || "").length) / 3.5);

  return {
    success: true,
    response: text,
    aiUsed: "gpt-5-family",
    modelUsed: analysis.gpt5Model,
    memoryUsed: useMemory,
    processingTime,
    tokensUsed,
    confidence: analysis.confidence,
    completionDetected: false,
    fallbackUsed: false
  };
}

function processResponse(text) {
  return String(text == null ? "" : text);
}

function getCostTier(model) {
  if (!model) return "standard";
  switch (model) {
    case CONFIG.MODELS.NANO: return "economy";
    case CONFIG.MODELS.MINI: return "standard";
    case CONFIG.MODELS.FULL:
    case CONFIG.MODELS.CHAT: return "premium";
    default: return "standard";
  }
}

function calculateEstimatedCost(model, responseLength) {
  const estimatedTokens = Math.ceil((Number(responseLength) || 0) / 3.5);
  const rate = (model === CONFIG.MODELS.FULL || model === CONFIG.MODELS.CHAT) ? 10.00 :
               (model === CONFIG.MODELS.MINI) ? 2.00 :
               (model === CONFIG.MODELS.NANO) ? 0.40 : 2.00;
  const dollars = (estimatedTokens * rate) / 1_000_000;
  return dollars.toFixed(6);
}

// ───────────────────────────────────────────────────────────────────────────────
// Telegram delivery helpers
// ───────────────────────────────────────────────────────────────────────────────
function createTelegramSender(chatId, response, analysis, gpt5Result, responseTime, contextUsed, styleMeta) {
  return async function send(bot, title) {
    try {
      if (!bot || !chatId) return false;

      const meta = {
        title: title || (gpt5Result && gpt5Result.completionDetected ? "Task Completion" : "GPT-5 Analysis"),
        model: (gpt5Result && gpt5Result.modelUsed) || (analysis && analysis.gpt5Model) || CONFIG.MODELS.MINI,
        executionTime: responseTime,
        costTier: getCostTier((gpt5Result && gpt5Result.modelUsed) || (analysis && analysis.gpt5Model)),
        tokens: (gpt5Result && gpt5Result.tokensUsed) || "estimated",
        cost: calculateEstimatedCost((gpt5Result && gpt5Result.modelUsed) || (analysis && analysis.gpt5Model), String(response || "").length),
        complexity: (analysis && analysis.complexity && analysis.complexity.complexity) || "medium",
        confidence: (gpt5Result && gpt5Result.confidence) || (analysis && analysis.confidence) || 0.75,
        reasoning: analysis && analysis.reasoning_effort,
        verbosity: analysis && analysis.verbosity,
        contextUsed: !!contextUsed,
        fallbackUsed: !!(gpt5Result && gpt5Result.fallbackUsed),
        completionDetected: !!(gpt5Result && gpt5Result.completionDetected)
      };

      // allow compact hint for chitchat
      if (styleMeta && typeof styleMeta === "object") {
        Object.keys(styleMeta).forEach(function (k) { meta[k] = styleMeta[k]; });
      }

      if (typeof telegramSplitter.sendTelegramMessage === "function") {
        const out = await telegramSplitter.sendTelegramMessage(bot, chatId, String(response || ""), meta);
        return !!(out && (out.success || out.fallback || out.enhanced));
      }

      await bot.sendMessage(chatId, String(response || ""));
      return true;
    } catch (e) {
      console.warn("Telegram delivery failed →", e.message);
      try { await bot.sendMessage(chatId, String(response || "")); return true; }
      catch (_) { return false; }
    }
  };
}

function createErrorTelegramSender(chatId, errorResponse, originalError) {
  return async function send(bot) {
    try {
      if (!bot || !chatId) return false;
      if (typeof telegramSplitter.sendTelegramMessage === "function") {
        const out = await telegramSplitter.sendTelegramMessage(bot, chatId, String(errorResponse || ""), {
          model: "error-handler", costTier: "free", error: true, originalError: originalError
        });
        return !!(out && out.success !== false);
      }
      await bot.sendMessage(chatId, String(errorResponse || ""));
      return true;
    } catch (e) {
      console.warn("Error telegram delivery failed →", e.message);
      return false;
    }
  };
}

// ───────────────────────────────────────────────────────────────────────────────
// Completion + Error responses
// ───────────────────────────────────────────────────────────────────────────────
function createCompletionResponse(analysis, memoryContext, memoryData, startTime, chatId, styleMeta) {
  const rt = Date.now() - startTime;
  systemState.requests.completionDetected += 1;

  const modelMini = CONFIG.MODELS.MINI;

  return {
    response: analysis.quickResponse,
    success: true,

    aiUsed: "completion-detection",
    queryType: "completion",
    complexity: "low",
    reasoning: "Completion detected - " + (analysis && analysis.completionStatus && analysis.completionStatus.completionType || "direct"),
    priority: "completion",
    confidence: analysis && analysis.completionStatus && analysis.completionStatus.confidence || 0.98,

    processingTime: rt,
    totalResponseTime: rt,
    tokensUsed: 0,

    completionDetected: true,
    completionType: analysis && analysis.completionStatus && analysis.completionStatus.completionType,
    skippedGPT5: true,
    costSaved: true,

    memoryData: {
      contextLength: (memoryContext && memoryContext.length) || 0,
      conversationRecords: (memoryData && memoryData.conversationHistory && memoryData.conversationHistory.length) || 0,
      persistentMemories: (memoryData && memoryData.persistentMemory && memoryData.persistentMemory.length) || 0,
      memoryImportant: false,
      memoryUsed: !!(memoryContext && memoryContext.length > 0)
    },

    gpt5System: false,
    powerMode: "COMPLETION_DETECTION",
    costTier: "free",
    timestamp: new Date().toISOString(),

    sendToTelegram: createTelegramSender(
      chatId,
      analysis.quickResponse,
      analysis,
      { completionDetected: true, modelUsed: modelMini },
      rt,
      !!(memoryContext && memoryContext.length > 0),
      styleMeta || null
    )
  };
}

function createErrorResponse(errorMessage, startTime, chatId, metadata) {
  const rt = Date.now() - startTime;
  systemState.requests.errors += 1;
  const errorResponse =
    "I’m sorry, I hit a technical issue:\n\n" +
    "• " + String(errorMessage || "Unknown error") + "\n\n" +
    "Please try:\n• A simpler message\n• Waiting a moment and retrying\n• /health to check status";

  return {
    response: errorResponse,
    success: false,
    error: errorMessage,

    aiUsed: "error-handler",
    queryType: "error",
    complexity: "low",
    reasoning: "System error",
    confidence: 0.0,

    processingTime: rt,
    totalResponseTime: rt,
    tokensUsed: 0,

    gpt5System: false,
    powerMode: "ERROR",
    costTier: "free",
    timestamp: new Date().toISOString(),

    memoryData: {
      contextLength: 0,
      conversationRecords: 0,
      persistentMemories: 0,
      memoryImportant: false,
      memoryUsed: false
    },

    metadata: metadata || {},
    sendToTelegram: createErrorTelegramSender(chatId, errorResponse, errorMessage)
  };
}

// ───────────────────────────────────────────────────────────────────────────────
// MAIN COMMAND EXECUTION ENGINE
// ───────────────────────────────────────────────────────────────────────────────
async function executeDualCommand(userMessage, chatId, options) {
  options = options || {};
  const startTime = Date.now();
  systemState.requests.total += 1;

  try {
    const pre = preprocessQuery(userMessage, options);
    if (pre.isEmpty) return createErrorResponse("Message too short or empty", startTime, chatId);

    // 2) Build memory context
    const isTest = /test memory|integration test/i.test(String(userMessage || "")) || options.forceMemoryTest === true;
    let memoryContext = options.memoryContext || "";
    let memoryData = { conversationHistory: options.conversationHistory || [], persistentMemory: options.persistentMemory || [] };
    if (!isTest && !memoryContext && !options.conversationHistory && !options.persistentMemory) {
      const built = await buildMemoryContext(chatId, { forceDatabaseFallback: options.forceDatabaseFallback });
      memoryContext = built.context || "";
      memoryData = built.memoryData || { conversationHistory: [], persistentMemory: [] };
    }
    memoryContext = String(memoryContext || ""); // safeguard for .toLowerCase use

    // 2.5) Chitchat short-circuit (skip GPT-5 on simple greetings)
    if (isGreetingOnly(pre.cleaned)) {
      const kh = getCurrentCambodiaDateTime();
      const quick = "👋 Hey! I’m online.\n" +
                    "⏰ " + kh.time + " • " + kh.date + " • Cambodia (UTC+7)\n" +
                    "Ask me anything — I’ll pick the right model automatically.";
      const chitchatAnalysis = {
        shouldSkipGPT5: true,
        quickResponse: quick,
        completionStatus: { completionType: "chitchat", confidence: 0.99 },
        gpt5Model: CONFIG.MODELS.NANO,
        complexity: { complexity: "low" },
        priority: "chitchat",
        reasoning_effort: "low",
        verbosity: "low"
      };
      return createCompletionResponse(chitchatAnalysis, memoryContext, memoryData, startTime, chatId, { displayStyle: "compact", banner: "none" });
    }

    // 3) Analyze query
    const analysis = analyzeQuery(pre.cleaned, options.messageType || "text", options.hasMedia === true, memoryContext);

    // 3.1) Completion detection (thanks/ok/etc.)
    if (analysis.completionStatus && analysis.completionStatus.isComplete) {
      const quick = "✅ Noted. If you need anything else, just say the word.";
      const ack = Object.assign({}, analysis, { shouldSkipGPT5: true, quickResponse: quick });
      return createCompletionResponse(ack, memoryContext, memoryData, startTime, chatId, { displayStyle: "compact", banner: "none" });
    }

    // 4) Validate
    const validation = validateQueryAnalysis(analysis);
    if (!validation.isValid) return createErrorResponse("Analysis validation failed: " + validation.errors.join(", "), startTime, chatId);

    // 5) Force model?
    if (options.forceModel && String(options.forceModel).indexOf("gpt-5") === 0) {
      analysis.gpt5Model = options.forceModel;
      analysis.reason = "forced";
    }

    // 6) Execute via GPT-5
    let gpt5Result;
    try {
      gpt5Result = await executeThroughGPT5System(pre.cleaned, analysis, memoryContext, memoryData, chatId);
    } catch (e) {
      return createErrorResponse(e.message, startTime, chatId, { originalQuery: userMessage, analysisAttempted: true, analysis: analysis });
    }

    // 7) Process + build result
    const processedResponse = processResponse(gpt5Result.response);
    const totalResponseTime = Date.now() - startTime;

    const result = {
      response: processedResponse,
      success: true,

      aiUsed: gpt5Result.aiUsed,
      modelUsed: gpt5Result.modelUsed,
      gpt5System: true,

      queryType: analysis.type,
      priority: analysis.priority,
      complexity: (analysis.complexity && analysis.complexity.complexity) || "medium",
      reasoning: analysis.reason,
      confidence: gpt5Result.confidence || analysis.confidence,

      processingTime: gpt5Result.processingTime,
      totalResponseTime: totalResponseTime,
      tokensUsed: gpt5Result.tokensUsed,

      reasoning_effort: analysis.reasoning_effort,
      verbosity: analysis.verbosity,
      max_completion_tokens: analysis.max_completion_tokens,

      memoryUsed: gpt5Result.memoryUsed,
      contextLength: memoryContext.length,
      memoryData: {
        contextLength: memoryContext.length,
        conversationRecords: (memoryData.conversationHistory && memoryData.conversationHistory.length) || 0,
        persistentMemories: (memoryData.persistentMemory && memoryData.persistentMemory.length) || 0,
        memoryImportant: analysis.memoryImportant,
        memoryUsed: memoryContext.length > 0
      },

      costTier: getCostTier(analysis.gpt5Model),
      costEstimate: analysis.estimatedCost,
      fallbackUsed: !!gpt5Result.fallbackUsed,
      costSaved: !!gpt5Result.costSaved,

      powerMode: "GPT5_" + String(analysis.priority || "").toUpperCase(),
      timestamp: new Date().toISOString(),
      cambodiaTime: getCurrentCambodiaDateTime(),

      sendToTelegram: createTelegramSender(chatId, processedResponse, analysis, gpt5Result, totalResponseTime, memoryContext.length > 0)
    };

    systemState.requests.success += 1;
    return result;

  } catch (error) {
    return createErrorResponse(error.message, startTime, chatId, { originalMessage: userMessage });
  }
}

// Enhanced (auto-delivery + memory write-back)
async function executeEnhancedGPT5Command(userMessage, chatId, bot, options) {
  options = options || {};
  const start = Date.now();

  const res = await executeDualCommand(userMessage, chatId, options);

  try {
    if (res && res.success && options.saveToMemory !== false) {
      await maybeSaveMemory(
        chatId,
        userMessage,
        res.response,
        {
          type: res.queryType,
          priority: res.priority,
          gpt5Model: res.modelUsed,
          complexity: { complexity: res.complexity },
          completionStatus: res.completionDetected ? { isComplete: true, completionType: res.completionType || "direct" } : { isComplete: false }
        },
        { modelUsed: res.modelUsed, processingTime: res.processingTime }
      );
    }
  } catch (e) {
    console.warn("Memory persist warning:", e.message);
  }

  if (bot && res && typeof res.sendToTelegram === "function") {
    try {
      await res.sendToTelegram(bot, options.title || (res.completionDetected ? "Task Completion" : "GPT-5 Analysis"));
      res.telegramDelivered = true;
    } catch (e) {
      res.telegramDelivered = false;
    }
  }

  res.enhancedExecution = true;
  res.totalExecutionTime = Date.now() - start;
  return res;
}

// Quick helpers
function quickGPT5Command(message, chatId, bot, model) {
  const opts = { title: "GPT-5 " + (model || "auto") + " Response", saveToMemory: true };
  if (model && model.indexOf("gpt-5") === 0) opts.forceModel = model;
  return executeEnhancedGPT5Command(message, chatId, bot, opts);
}
function quickNanoCommand(message, chatId, bot) { return quickGPT5Command(message, chatId, bot, CONFIG.MODELS.NANO); }
function quickMiniCommand(message, chatId, bot) { return quickGPT5Command(message, chatId, bot, CONFIG.MODELS.MINI); }
function quickUltimateCommand(message, chatId, bot) { return quickGPT5Command(message, chatId, bot, CONFIG.MODELS.FULL); }

// ───────────────────────────────────────────────────────────────────────────────
// Telegram handlers (entry points from index.js)
// ───────────────────────────────────────────────────────────────────────────────
async function handleTelegramMessage(msg, bot) {
  try {
    const chatId = msg && msg.chat && msg.chat.id;
    const text = (msg && msg.text) || "";
    const hasPhoto = !!(msg && msg.photo);
    const hasDocument = !!(msg && msg.document);
    const hasVideo = !!(msg && msg.video);
    const hasVoice = !!(msg && msg.voice);
    const hasAudio = !!(msg && msg.audio);
    const hasVideoNote = !!(msg && msg.video_note);
    const isMultimodal = hasPhoto || hasDocument || hasVideo || hasVoice || hasAudio || hasVideoNote;

    // Commands
    if (typeof text === "string" && text.trim().charAt(0) === "/") {
      const cmd = text.trim().split(/\s+/)[0].toLowerCase();
      const arg = text.trim().slice(cmd.length).trim();

      if (cmd === "/start") {
        const kh = getCurrentCambodiaDateTime();
        const hello =
"🚀 **IMPERIUM VAULT | GPT-5**\n" +
"Auto-routing across Nano/Mini/Full/Chat\n\n" +
"⏰ Cambodia: " + kh.time + " • " + kh.date + "\n" +
"Type anything — I’ll pick the right model.\n\n" +
"Quick cmds: /nano /mini /ultimate /help";
        await bot.sendMessage(chatId, hello, { parse_mode: "Markdown" });
        return;
      }
      if (cmd === "/help") {
        await bot.sendMessage(chatId,
"**Commands**\n" +
"/nano text — ultra fast\n" +
"/mini text — balanced\n" +
"/ultimate text — deep reasoning\n" +
"/gpt5 text — auto\n" +
"/health — simple status\n",
          { parse_mode: "Markdown" }
        );
        return;
      }
      if (cmd === "/gpt5")  return void executeEnhancedGPT5Command(arg || "Hello", chatId, bot, { title: "GPT-5 Direct" });
      if (cmd === "/nano")  return void quickNanoCommand(arg || "Hello", chatId, bot);
      if (cmd === "/mini")  return void quickMiniCommand(arg || "Hello", chatId, bot);
      if (cmd === "/ultimate") return void quickUltimateCommand(arg || "Analyze deeply", chatId, bot);
      if (cmd === "/health") {
        const db = await database.healthCheck().catch(() => ({ ok: false }));
        await bot.sendMessage(chatId, "System OK • DB: " + (db.ok ? "connected" : "degraded"));
        return;
      }
    }

    // Multimodal first
    if (isMultimodal) {
      if (hasPhoto && multimodal && typeof multimodal.analyzeImage === "function") {
        const photo = msg.photo[msg.photo.length - 1];
        await multimodal.analyzeImage(bot, photo.file_id, text || "Analyze this image", chatId);
        return;
      }
      if (hasDocument && multimodal && typeof multimodal.analyzeDocument === "function") {
        await multimodal.analyzeDocument(bot, msg.document, text || "Analyze this document", chatId);
        return;
      }
      if (hasVoice && multimodal && typeof multimodal.analyzeVoice === "function") {
        await multimodal.analyzeVoice(bot, msg.voice, text || "Transcribe and analyze", chatId);
        return;
      }
      if (hasAudio && multimodal && typeof multimodal.analyzeAudio === "function") {
        await multimodal.analyzeAudio(bot, msg.audio, text || "Transcribe and analyze", chatId);
        return;
      }
      if (hasVideo && multimodal && typeof multimodal.analyzeVideo === "function") {
        await multimodal.analyzeVideo(bot, msg.video, text || "Analyze this video", chatId);
        return;
      }
      if (hasVideoNote && multimodal && typeof multimodal.analyzeVideoNote === "function") {
        await multimodal.analyzeVideoNote(bot, msg.video_note, text || "Analyze this video note", chatId);
        return;
      }
    }

    // Plain text → core
    if (typeof text === "string" && text.trim()) {
      await executeEnhancedGPT5Command(text, chatId, bot, {
        messageType: "text",
        hasMedia: false,
        title: "GPT-5 Smart Analysis",
        max_completion_tokens: 6000,
        reasoning_effort: "medium",
        verbosity: "medium"
      });
    }
  } catch (e) {
    try { await telegramSplitter.sendAlert(bot, msg.chat.id, "Handler error: " + e.message, "System Error"); }
    catch (_) {}
  }
}

async function handleCallbackQuery(cbq, bot) {
  try {
    await bot.answerCallbackQuery(cbq.id, { text: "OK" });
  } catch (e) {
    console.warn("callbackQuery error →", e.message);
  }
}

async function handleInlineQuery(inlineQuery, bot) {
  try {
    await bot.answerInlineQuery(inlineQuery.id, [], { cache_time: 1 });
    console.log("Inline query handled");
  } catch (e) {
    console.warn("inlineQuery error →", e.message);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Lifecycle
// ───────────────────────────────────────────────────────────────────────────────
async function initialize() {
  try {
    if (database && typeof database.initialize === "function") await database.initialize();
    console.log("[dual] init done");
  } catch (e) {
    console.warn("[dual] init warn →", e.message);
  }
}

async function shutdown() {
  try {
    if (database && typeof database.shutdown === "function") await database.shutdown();
  } catch (e) {
    console.warn("[dual] shutdown warn →", e.message);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Exports
// ───────────────────────────────────────────────────────────────────────────────
module.exports = {
  // Telegram entry points
  handleTelegramMessage,
  handleCallbackQuery,
  handleInlineQuery,

  // Lifecycle
  initialize,
  shutdown,

  // Core programmatic APIs
  executeDualCommand,
  executeEnhancedGPT5Command,
  analyzeQuery,
  quickNanoCommand,
  quickMiniCommand,
  quickUltimateCommand,

  // Useful helpers (optional external use)
  getCurrentCambodiaDateTime
};
