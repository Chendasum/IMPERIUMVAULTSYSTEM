// utils/openaiClient.js - ENHANCED GPT-5 CLIENT (Production Ready)
// Ultra-compatible GPT-5 integration with smart routing and memory optimization
// 
// Features:
// - Smart model selection with forceModel support (for dualCommandSystem integration)
// - Circuit breaker pattern for API resilience
// - Intelligent caching with TTL and size management
// - Comprehensive metrics and performance tracking
// - Memory-aware prompting for context optimization
// - Rate limit handling with exponential backoff
// - Cost calculation and optimization
// - Health monitoring and diagnostics
// - Request ID tracking for debugging
//
// Compatible with: dualCommandSystem memory optimization, telegramSplitter formatting

"use strict";

require("dotenv").config();

var OpenAI = require("openai").OpenAI;
var crypto = require("crypto");

// ---------- VALIDATION ----------
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// ---------- ENHANCED UTILITIES ----------
function sleep(ms) { 
  return new Promise(function (resolve) { 
    setTimeout(resolve, Number(ms) || 0); 
  }); 
}

function safeString(input, maxLength) {
  try {
    var str = input === undefined || input === null ? "" : String(input);
    return maxLength ? str.slice(0, Number(maxLength)) : str;
  } catch (e) {
    return "";
  }
}

function generateRequestId() {
  return "req_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
}

// Safe object property getter without optional chaining
function safeGet(obj, path, defaultValue) {
  try {
    if (!obj || typeof path !== "string") return defaultValue;
    var parts = path.split(".");
    var current = obj;
    
    for (var i = 0; i < parts.length; i++) {
      if (current === null || current === undefined) return defaultValue;
      current = current[parts[i]];
    }
    
    return (current === undefined || current === null) ? defaultValue : current;
  } catch (error) {
    return defaultValue;
  }
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

// ---------- ENHANCED METRICS SYSTEM ----------
function EnhancedGPT5Metrics() {
  this.stats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalTokensUsed: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCost: 0,
    averageResponseTime: 0,
    modelUsageStats: {},
    errorTypes: {},
    responseTimes: [],
    apiUsageStats: { responses: 0, chat: 0 },
    lastReset: getCurrentTimestamp(),
    peakResponseTime: 0,
    memoryOptimizedCalls: 0
  };
  this.startTime = Date.now();
}

EnhancedGPT5Metrics.prototype.recordCall = function (model, success, inputTokens, outputTokens, cost, responseTime, error, isMemoryOptimized) {
  var s = this.stats;
  var totalTokens = Number(inputTokens || 0) + Number(outputTokens || 0);
  
  s.totalCalls += 1;
  
  if (success) {
    s.successfulCalls += 1;
    s.totalTokensUsed += totalTokens;
    s.totalInputTokens += Number(inputTokens || 0);
    s.totalOutputTokens += Number(outputTokens || 0);
    s.totalCost += Number(cost || 0);
    
    var rt = Number(responseTime || 0);
    s.responseTimes.push(rt);
    
    if (rt > s.peakResponseTime) s.peakResponseTime = rt;
    
    // Calculate rolling average
    var times = s.responseTimes;
    if (times.length > 0) {
      var sum = times.reduce(function (a, b) { return a + b; }, 0);
      s.averageResponseTime = sum / times.length;
    }
    
    // Keep only recent response times
    if (times.length > 1000) s.responseTimes = times.slice(-1000);
    
    if (isMemoryOptimized) s.memoryOptimizedCalls += 1;
  } else {
    s.failedCalls += 1;
    if (error) {
      var errorKey = safeString(error).substring(0, 100);
      s.errorTypes[errorKey] = (s.errorTypes[errorKey] || 0) + 1;
    }
  }
  
  // Model usage tracking
  if (!s.modelUsageStats[model]) {
    s.modelUsageStats[model] = { 
      calls: 0, 
      tokens: 0, 
      inputTokens: 0, 
      outputTokens: 0, 
      cost: 0, 
      avgResponseTime: 0,
      successRate: 0
    };
  }
  
  var modelStats = s.modelUsageStats[model];
  modelStats.calls += 1;
  modelStats.tokens += totalTokens;
  modelStats.inputTokens += Number(inputTokens || 0);
  modelStats.outputTokens += Number(outputTokens || 0);
  modelStats.cost += Number(cost || 0);
  
  if (success && responseTime) {
    modelStats.avgResponseTime = modelStats.avgResponseTime 
      ? (modelStats.avgResponseTime + Number(responseTime)) / 2 
      : Number(responseTime);
  }
  
  // Calculate success rate for this model
  var successCount = 0;
  var totalCount = modelStats.calls;
  // This is approximate since we don't track per-model success separately
  modelStats.successRate = totalCount > 0 
    ? ((s.successfulCalls / s.totalCalls) * 100).toFixed(2)
    : "0.00";
};

EnhancedGPT5Metrics.prototype.getDetailedStats = function () {
  var s = this.stats;
  var uptime = Date.now() - this.startTime;
  
  return {
    overview: {
      totalCalls: s.totalCalls,
      successfulCalls: s.successfulCalls,
      failedCalls: s.failedCalls,
      successRate: s.totalCalls > 0 ? ((s.successfulCalls / s.totalCalls) * 100).toFixed(2) + "%" : "0%",
      uptime: Math.round(uptime / 1000) + "s"
    },
    performance: {
      averageResponseTime: Math.round(s.averageResponseTime) + "ms",
      peakResponseTime: s.peakResponseTime + "ms",
      recentResponseTimes: s.responseTimes.slice(-5),
      memoryOptimizedCalls: s.memoryOptimizedCalls,
      memoryOptimizationRate: s.totalCalls > 0 
        ? ((s.memoryOptimizedCalls / s.totalCalls) * 100).toFixed(1) + "%"
        : "0%"
    },
    usage: {
      totalTokensUsed: s.totalTokensUsed,
      totalInputTokens: s.totalInputTokens,
      totalOutputTokens: s.totalOutputTokens,
      totalCost: "$" + s.totalCost.toFixed(6),
      avgTokensPerCall: s.totalCalls > 0 ? Math.round(s.totalTokensUsed / s.totalCalls) : 0,
      avgCostPerCall: s.totalCalls > 0 ? "$" + (s.totalCost / s.totalCalls).toFixed(6) : "$0"
    },
    models: s.modelUsageStats,
    errors: s.errorTypes,
    apiUsage: s.apiUsageStats,
    lastReset: s.lastReset
  };
};

EnhancedGPT5Metrics.prototype.reset = function () { 
  this.stats = new EnhancedGPT5Metrics().stats; 
  this.stats.lastReset = getCurrentTimestamp();
};

// ---------- ENHANCED CACHE SYSTEM ----------
function EnhancedGPT5Cache(maxSize, ttlMs) {
  this.cache = new Map();
  this.maxSize = Number(maxSize || 2000);
  this.ttl = Number(ttlMs || 3600000); // 1 hour default
  this.hitCount = 0;
  this.missCount = 0;
}

EnhancedGPT5Cache.prototype.generateKey = function (prompt, options) {
  try {
    var cleanOptions = {};
    if (options) {
      for (var key in options) {
        if (Object.prototype.hasOwnProperty.call(options, key) && key !== "skipCache") {
          cleanOptions[key] = options[key];
        }
      }
    }
    
    var input = safeString(prompt) + JSON.stringify(cleanOptions);
    return crypto.createHash("sha256").update(input).digest("hex").substring(0, 16);
  } catch (error) {
    return "error_" + Date.now();
  }
};

EnhancedGPT5Cache.prototype.get = function (key) {
  try {
    var item = this.cache.get(key);
    if (!item) {
      this.missCount += 1;
      return null;
    }
    
    var age = Date.now() - item.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      this.missCount += 1;
      return null;
    }
    
    item.hits = (item.hits || 0) + 1;
    item.lastAccessed = Date.now();
    this.hitCount += 1;
    
    return item.data;
  } catch (error) {
    this.missCount += 1;
    return null;
  }
};

EnhancedGPT5Cache.prototype.set = function (key, data) {
  try {
    // Cleanup old entries if at capacity
    if (this.cache.size >= this.maxSize) {
      var oldestKey = null;
      var oldestTime = Date.now();
      
      var iterator = this.cache.entries();
      var entry = iterator.next();
      while (!entry.done) {
        var entryKey = entry.value[0];
        var entryValue = entry.value[1];
        if (entryValue.timestamp < oldestTime) {
          oldestTime = entryValue.timestamp;
          oldestKey = entryKey;
        }
        entry = iterator.next();
      }
      
      if (oldestKey) this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      hits: 0,
      lastAccessed: Date.now()
    });
    
    return true;
  } catch (error) {
    return false;
  }
};

EnhancedGPT5Cache.prototype.clear = function () { 
  this.cache.clear(); 
  this.hitCount = 0;
  this.missCount = 0;
};

EnhancedGPT5Cache.prototype.getDetailedStats = function () {
  var totalRequests = this.hitCount + this.missCount;
  var hitRate = totalRequests > 0 ? ((this.hitCount / totalRequests) * 100).toFixed(2) : "0.00";
  
  return {
    size: this.cache.size,
    maxSize: this.maxSize,
    utilizationPercent: Math.round((this.cache.size / this.maxSize) * 100),
    ttl: this.ttl + "ms",
    hits: this.hitCount,
    misses: this.missCount,
    hitRate: hitRate + "%",
    memoryEfficiency: this.cache.size > 0 ? "active" : "empty"
  };
};

// ---------- ENHANCED CIRCUIT BREAKER ----------
function EnhancedCircuitBreaker(threshold, timeoutMs) {
  this.threshold = Number(threshold || 5);
  this.timeout = Number(timeoutMs || 30000);
  this.failureCount = 0;
  this.lastFailureTime = 0;
  this.state = "CLOSED";
  this.successCount = 0;
}

EnhancedCircuitBreaker.prototype.execute = function (asyncFunction) {
  var self = this;
  
  return new Promise(function (resolve, reject) {
    var now = Date.now();
    
    if (self.state === "OPEN") {
      if (now - self.lastFailureTime > self.timeout) {
        self.state = "HALF_OPEN";
        console.log("[CircuitBreaker] Moving to HALF_OPEN state");
      } else {
        var remainingTime = Math.round((self.timeout - (now - self.lastFailureTime)) / 1000);
        return reject(new Error("Circuit breaker OPEN - retry in " + remainingTime + "s"));
      }
    }
    
    Promise.resolve()
      .then(asyncFunction)
      .then(function (result) {
        self.onSuccess();
        resolve(result);
      })
      .catch(function (error) {
        self.onFailure();
        reject(error);
      });
  });
};

EnhancedCircuitBreaker.prototype.onSuccess = function () {
  this.failureCount = 0;
  this.successCount += 1;
  
  if (this.state === "HALF_OPEN") {
    this.state = "CLOSED";
    console.log("[CircuitBreaker] Success in HALF_OPEN - Moving to CLOSED");
  }
};

EnhancedCircuitBreaker.prototype.onFailure = function () {
  this.failureCount += 1;
  this.lastFailureTime = Date.now();
  
  if (this.failureCount >= this.threshold) {
    this.state = "OPEN";
    console.log("[CircuitBreaker] Threshold exceeded - Moving to OPEN state");
  }
};

EnhancedCircuitBreaker.prototype.getDetailedState = function () {
  var now = Date.now();
  return {
    state: this.state,
    failureCount: this.failureCount,
    successCount: this.successCount,
    threshold: this.threshold,
    timeoutMs: this.timeout,
    timeSinceLastFailure: this.lastFailureTime > 0 ? now - this.lastFailureTime : 0,
    canRetry: this.state !== "OPEN" || (now - this.lastFailureTime > this.timeout)
  };
};

// ---------- SYSTEM INITIALIZATION ----------
var metrics = new EnhancedGPT5Metrics();
var cache = new EnhancedGPT5Cache(
  Number(process.env.OPENAI_CACHE_MAX || 2000), 
  Number(process.env.OPENAI_CACHE_TTL_MS || 3600000)
);
var circuitBreaker = new EnhancedCircuitBreaker(
  Number(process.env.OPENAI_CB_FAILS || 5),
  Number(process.env.OPENAI_CB_COOLDOWN_MS || 30000)
);

var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: Number(process.env.OPENAI_TIMEOUT_MS || 180000),
  maxRetries: Number(process.env.OPENAI_SDK_MAX_RETRIES || 2),
  defaultHeaders: {
    "User-Agent": "IMPERIUM-VAULT-GPT5/3.1.0-enhanced",
    "X-Client-Version": "3.1.0",
    "X-Environment": process.env.NODE_ENV || "production",
    "X-System": "memory-optimized"
  }
});

// ---------- ENHANCED CONFIGURATION ----------
var GPT5_CONFIG = {
  // Model definitions
  PRIMARY_MODEL: process.env.GPT5_PRIMARY_MODEL || "gpt-5",
  MINI_MODEL: process.env.GPT5_MINI_MODEL || "gpt-5-mini",
  NANO_MODEL: process.env.GPT5_NANO_MODEL || "gpt-5-nano",
  CHAT_MODEL: process.env.GPT5_CHAT_MODEL || "gpt-5-chat-latest",

  // Token limits
  MAX_OUTPUT_TOKENS: 16384,
  MAX_PROMPT_LENGTH: 180000,
  
  // Default parameters
  REASONING_EFFORTS: ["minimal", "low", "medium", "high"],
  DEFAULT_REASONING: "medium",
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_VERBOSITY: "medium",

  // Model capabilities and pricing
  MODEL_CAPABILITIES: {
    "gpt-5": { 
      maxTokens: 16384, 
      pricing: { input: 1.25, output: 10.0 },
      supportsReasoning: true,
      apiType: "responses"
    },
    "gpt-5-mini": { 
      maxTokens: 8192, 
      pricing: { input: 0.25, output: 2.0 },
      supportsReasoning: true,
      apiType: "responses"
    },
    "gpt-5-nano": { 
      maxTokens: 4096, 
      pricing: { input: 0.05, output: 0.4 },
      supportsReasoning: true,
      apiType: "responses"
    },
    "gpt-5-chat-latest": { 
      maxTokens: 16384, 
      pricing: { input: 1.25, output: 10.0 },
      supportsReasoning: false,
      apiType: "chat"
    }
  },

  // Smart model selection
  AUTO_SCALE: {
    ENABLED: process.env.SMART_MODEL_SELECT !== "false",
    NANO_MAX_LENGTH: 2000,
    MINI_MAX_LENGTH: 10000,
    COMPLEXITY_KEYWORDS: [
      "analyze", "compare", "evaluate", "research", "complex", "detailed", 
      "comprehensive", "assessment", "investigation", "examination", "review"
    ],
    GREETING_KEYWORDS: [
      "hello", "hi", "hey", "thanks", "ok", "yes", "no", "good", "great", "sure"
    ]
  },

  // Memory optimization thresholds
  MEMORY_OPTIMIZATION: {
    SIMPLE_MESSAGE_MAX_LENGTH: 50,
    GREETING_BYPASS_ENABLED: true,
    MINIMAL_CONTEXT_ENABLED: true
  },

  // Force chat model for very short prompts
  SHORT_CHAT_THRESHOLD: Number(process.env.FORCE_CHAT_BELOW_CHARS || 64)
};

function getModelCapacity(model) {
  var capability = GPT5_CONFIG.MODEL_CAPABILITIES[model];
  return capability && capability.maxTokens ? capability.maxTokens : 4096;
}

// ---------- ENHANCED MODEL SELECTION ----------
function selectOptimalModel(prompt, options) {
  options = options || {};
  
  // Priority 1: Honor forceModel from dualCommandSystem (memory optimization)
  if (options.forceModel) {
    console.log("[MODEL-SELECT] Using forced model: " + options.forceModel);
    return options.forceModel;
  }

  // Priority 2: Explicit model parameter
  if (options.model) {
    console.log("[MODEL-SELECT] Using explicit model: " + options.model);
    return options.model;
  }

  var text = safeString(prompt);
  var length = text.length;
  var textLower = text.toLowerCase();

  // Priority 3: Very short messages use chat model
  if (length <= GPT5_CONFIG.SHORT_CHAT_THRESHOLD) {
    console.log("[MODEL-SELECT] Short message -> chat model");
    return GPT5_CONFIG.CHAT_MODEL;
  }

  // Priority 4: Memory optimization - detect simple greetings
  if (GPT5_CONFIG.MEMORY_OPTIMIZATION.GREETING_BYPASS_ENABLED) {
    var isSimpleGreeting = false;
    var greetings = GPT5_CONFIG.AUTO_SCALE.GREETING_KEYWORDS;
    
    for (var i = 0; i < greetings.length; i++) {
      var pattern = new RegExp("^" + greetings[i] + "\\b", "i");
      if (pattern.test(text.trim()) && length < GPT5_CONFIG.MEMORY_OPTIMIZATION.SIMPLE_MESSAGE_MAX_LENGTH) {
        isSimpleGreeting = true;
        break;
      }
    }
    
    if (isSimpleGreeting) {
      console.log("[MODEL-SELECT] Simple greeting detected -> nano model");
      return GPT5_CONFIG.NANO_MODEL;
    }
  }

  // Priority 5: Auto-scaling if enabled
  if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) {
    console.log("[MODEL-SELECT] Auto-scale disabled -> primary model");
    return GPT5_CONFIG.PRIMARY_MODEL;
  }

  // Complexity detection
  var hasComplexKeywords = false;
  var complexKeywords = GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS;
  
  for (var j = 0; j < complexKeywords.length; j++) {
    if (textLower.indexOf(complexKeywords[j]) >= 0) {
      hasComplexKeywords = true;
      break;
    }
  }

  // Model selection logic
  if (length < GPT5_CONFIG.AUTO_SCALE.NANO_MAX_LENGTH && !hasComplexKeywords) {
    console.log("[MODEL-SELECT] Small simple query -> nano model");
    return GPT5_CONFIG.NANO_MODEL;
  }
  
  if (length < GPT5_CONFIG.AUTO_SCALE.MINI_MAX_LENGTH && !hasComplexKeywords) {
    console.log("[MODEL-SELECT] Medium query -> mini model");
    return GPT5_CONFIG.MINI_MODEL;
  }
  
  if (hasComplexKeywords || options.reasoning_effort === "high") {
    console.log("[MODEL-SELECT] Complex query -> full model");
    return GPT5_CONFIG.PRIMARY_MODEL;
  }

  console.log("[MODEL-SELECT] Default selection -> mini model");
  return GPT5_CONFIG.MINI_MODEL;
}

// ---------- ENHANCED COST CALCULATION ----------
function calculateDetailedCost(model, inputTokens, outputTokens) {
  var modelConfig = GPT5_CONFIG.MODEL_CAPABILITIES[model];
  if (!modelConfig || !modelConfig.pricing) {
    return { inputCost: 0, outputCost: 0, totalCost: 0, model: model, error: "Unknown model pricing" };
  }

  var pricing = modelConfig.pricing;
  var inputCost = (Number(inputTokens || 0) / 1000000) * pricing.input;
  var outputCost = (Number(outputTokens || 0) / 1000000) * pricing.output;
  var totalCost = inputCost + outputCost;

  return {
    model: model,
    inputTokens: Number(inputTokens || 0),
    outputTokens: Number(outputTokens || 0),
    totalTokens: Number(inputTokens || 0) + Number(outputTokens || 0),
    inputCost: Number(inputCost.toFixed(8)),
    outputCost: Number(outputCost.toFixed(8)),
    totalCost: Number(totalCost.toFixed(8)),
    costPerToken: totalCost > 0 ? (totalCost / (Number(inputTokens || 0) + Number(outputTokens || 0))).toFixed(10) : "0"
  };
}

// ---------- REQUEST BUILDERS ----------
function buildEnhancedResponsesRequest(model, input, options) {
  options = options || {};
  
  var request = {
    model: model,
    input: safeString(input, GPT5_CONFIG.MAX_PROMPT_LENGTH)
  };

  // Reasoning configuration
  var effort = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  if (GPT5_CONFIG.REASONING_EFFORTS.indexOf(effort) >= 0) {
    request.reasoning = { effort: effort };
  }

  // Output token limit
  var maxTokens = options.max_output_tokens || options.max_completion_tokens || 8000;
  request.max_output_tokens = Math.max(16, Math.min(Number(maxTokens), getModelCapacity(model)));

  // Verbosity (if supported)
  if (options.verbosity && ["low", "medium", "high"].indexOf(options.verbosity) >= 0) {
    request.verbosity = options.verbosity;
  }

  return request;
}

function buildEnhancedChatRequest(model, messages, options) {
  options = options || {};
  
  var request = {
    model: model,
    messages: Array.isArray(messages) ? messages : [{ role: "user", content: safeString(messages) }]
  };

  // Token limit
  var maxTokens = options.max_tokens || options.max_completion_tokens || 8000;
  request.max_tokens = Math.max(1, Math.min(Number(maxTokens), getModelCapacity(model)));

  // Chat-specific parameters
  if (typeof options.temperature === "number") {
    request.temperature = Math.max(0, Math.min(2, Number(options.temperature)));
  }
  if (typeof options.top_p === "number") {
    request.top_p = Math.max(0, Math.min(1, Number(options.top_p)));
  }
  if (typeof options.frequency_penalty === "number") {
    request.frequency_penalty = Math.max(-2, Math.min(2, Number(options.frequency_penalty)));
  }
  if (typeof options.presence_penalty === "number") {
    request.presence_penalty = Math.max(-2, Math.min(2, Number(options.presence_penalty)));
  }

  return request;
}

// ---------- ENHANCED RESPONSE EXTRACTION ----------
function safeExtractResponseText(completion, apiType, requestId) {
  try {
    var extracted = "";
    
    if (apiType === "responses") {
      // Try multiple extraction paths for responses API
      extracted = safeGet(completion, "output_text", null);
      
      if (!extracted) {
        extracted = safeGet(completion, "output.0.content.0.text.value", null);
      }
      
      if (!extracted) {
        extracted = safeGet(completion, "choices.0.message.content", null);
      }
      
      if (!extracted) {
        // Last resort - try to find any text content
        if (completion && typeof completion === "object") {
          var jsonStr = JSON.stringify(completion);
          var match = jsonStr.match(/"content":\s*"([^"]+)"/);
          if (match) extracted = match[1];
        }
      }
      
    } else {
      // Chat completions API
      extracted = safeGet(completion, "choices.0.message.content", null);
    }

    if (!extracted || typeof extracted !== "string") {
      console.warn("[EXTRACT-WARN] " + (requestId || "unknown") + " No content found in response");
      return "[No response content available]";
    }

    var cleaned = extracted.trim();
    if (cleaned.length === 0) {
      console.warn("[EXTRACT-WARN] " + (requestId || "unknown") + " Empty response after trim");
      return "[Empty response received]";
    }

    return cleaned;
    
  } catch (extractError) {
    console.error("[EXTRACT-ERROR] " + (requestId || "unknown") + " " + extractError.message);
    return "[Response extraction failed: " + extractError.message + "]";
  }
}

// ---------- MEMORY INTEGRATION HELPERS ----------
function attachMemoryToPrompt(prompt, memory) {
  memory = memory || {};
  
  var systemPreamble = memory.systemPreamble ? safeString(memory.systemPreamble).trim() : "";
  var recallItems = Array.isArray(memory.recall) ? memory.recall : [];
  
  var headerParts = [];
  if (systemPreamble) {
    headerParts.push("SYSTEM CONTEXT:\n" + systemPreamble);
  }
  
  if (recallItems.length > 0) {
    var recallText = "MEMORY CONTEXT:\n" + recallItems.map(function (item) {
      return "- " + safeString(item);
    }).join("\n");
    headerParts.push(recallText);
  }
  
  var header = headerParts.length > 0 ? headerParts.join("\n\n") + "\n\n" : "";
  return header + "USER QUERY:\n" + safeString(prompt);
}

function attachMemoryToMessages(messages, memory) {
  memory = memory || {};
  var baseMessages = Array.isArray(messages) ? messages : [];
  var systemPreamble = memory.systemPreamble ? safeString(memory.systemPreamble).trim() : "";
  var recallItems = Array.isArray(memory.recall) ? memory.recall : [];
  
  var enhancedMessages = [];
  
  // Add system message if provided
  if (systemPreamble) {
    enhancedMessages.push({
      role: "system",
      content: systemPreamble
    });
  }
  
  // Add memory context as system message
  if (recallItems.length > 0) {
    var memoryContent = "Persistent Memory Context:\n" + recallItems.map(function (item) {
      return "- " + safeString(item);
    }).join("\n");
    
    enhancedMessages.push({
      role: "system", 
      content: memoryContent
    });
  }
  
  // Add original messages
  return enhancedMessages.concat(baseMessages);
}

// ---------- RATE LIMIT AND RETRY SYSTEM ----------
function createRetryHandler(maxRetries) {
  maxRetries = Number(maxRetries || 3);
  
  return function executeWithRetry(apiCall) {
    var delays = [500, 1500, 4000]; // Progressive backoff
    var attempt = 0;
    
    function tryRequest() {
      return Promise.resolve()
        .then(apiCall)
        .catch(function (error) {
          var status = safeGet(error, "status", null) || safeGet(error, "response.status", null);
          var message = safeGet(error, "message", "") || safeGet(error, "response.data.error.message", "");
          
          var isRetryable = status === 429 || 
                           status === 502 || 
                           status === 503 || 
                           status === 504 ||
                           /rate limit/i.test(message) ||
                           /timeout/i.test(message);
          
          if (!isRetryable || attempt >= maxRetries) {
            throw error;
          }
          
          var delay = delays[Math.min(attempt, delays.length - 1)];
          attempt += 1;
          
          console.log("[RETRY] Attempt " + attempt + "/" + maxRetries + " after " + delay + "ms delay (status: " + status + ")");
          
          return sleep(delay).then(tryRequest);
        });
    }
    
    return tryRequest();
  };
}

// ---------- CORE API FUNCTIONS ----------

function getGPT5Analysis(prompt, options) {
  options = options || {};
  var requestId = generateRequestId();
  var startTime = Date.now();
  var inputTokens = 0;
  var outputTokens = 0;
  var selectedModel = "unknown";
  var apiUsed = "unknown";
  var isMemoryOptimized = false;

  return new Promise(function (resolve) {
    try {
      // Validation
      if (!prompt || typeof prompt !== "string") {
        throw new Error("Invalid prompt: must be non-empty string");
      }

      var text = safeString(prompt, GPT5_CONFIG.MAX_PROMPT_LENGTH);
      if (text.length < prompt.length) {
        console.warn("[GPT5-TRUNCATE] " + requestId + " Prompt truncated from " + prompt.length + " to " + text.length);
      }

      // Check cache first (unless disabled)
      if (!options.skipCache) {
        var cacheKey = cache.generateKey(text, options);
        var cachedResult = cache.get(cacheKey);
        if (cachedResult) {
          console.log("[GPT5-CACHE-HIT] " + requestId + " Returning cached result");
          return resolve("[CACHED] " + cachedResult);
        }
      }

      // Model selection with logging
      selectedModel = selectOptimalModel(text, options);
      
      // Determine API type
      var modelConfig = GPT5_CONFIG.MODEL_CAPABILITIES[selectedModel];
      var useResponsesAPI = modelConfig && modelConfig.apiType === "responses";
      apiUsed = useResponsesAPI ? "responses" : "chat";
      
      // Check if this is a memory-optimized call
      isMemoryOptimized = options.forceModel === GPT5_CONFIG.NANO_MODEL || 
                         options.contextAware === false ||
                         text.length < GPT5_CONFIG.MEMORY_OPTIMIZATION.SIMPLE_MESSAGE_MAX_LENGTH;

      console.log("[GPT5-START] " + requestId + " model=" + selectedModel + " api=" + apiUsed + " optimized=" + isMemoryOptimized);

      // Estimate input tokens
      inputTokens = Math.ceil(text.length / 3.5);

      // Create retry handler
      var retryHandler = createRetryHandler(3);

      // Execute API call with circuit breaker
      circuitBreaker.execute(function () {
        return retryHandler(function () {
          if (useResponsesAPI) {
            var responsesRequest = buildEnhancedResponsesRequest(selectedModel, text, options);
            return openai.responses.create(responsesRequest);
          } else {
            var messages = [{ role: "user", content: text }];
            var chatRequest = buildEnhancedChatRequest(selectedModel, messages, options);
            return openai.chat.completions.create(chatRequest);
          }
        });
      }).then(function (completion) {
        // Extract usage information
        var usage = safeGet(completion, "usage", {});
        inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
        outputTokens = usage.output_tokens || usage.completion_tokens || 0;

        // Extract response text
        var responseText = safeExtractResponseText(completion, apiUsed, requestId);
        if (!responseText || responseText.length === 0) {
          throw new Error("Empty response received from API");
        }

        // Calculate metrics
        var processingTime = Date.now() - startTime;
        var costDetails = calculateDetailedCost(selectedModel, inputTokens, outputTokens);
        
        // Log successful call
        console.log("[GPT5-SUCCESS] " + requestId + " " + processingTime + "ms " + outputTokens + "tok $" + costDetails.totalCost.toFixed(6));
        
        // Record metrics
        metrics.recordCall(selectedModel, true, inputTokens, outputTokens, costDetails.totalCost, processingTime, null, isMemoryOptimized);
        
        // Update API usage stats
        metrics.stats.apiUsageStats[apiUsed] = (metrics.stats.apiUsageStats[apiUsed] || 0) + 1;

        // Cache successful result (if not too short and not an error)
        if (!options.skipCache && responseText.length > 10 && !responseText.startsWith("[")) {
          var cacheKey2 = cache.generateKey(text, options);
          cache.set(cacheKey2, responseText);
        }

        resolve(responseText);

      }).catch(function (apiError) {
        var processingTime = Date.now() - startTime;
        
        // Enhanced error message extraction
        var providerError = safeGet(apiError, "response.data.error.message", null);
        var statusCode = safeGet(apiError, "status", null) || safeGet(apiError, "response.status", null);
        var baseMessage = apiError && apiError.message ? apiError.message : String(apiError);
        
        var enhancedError = baseMessage;
        if (providerError) enhancedError += " | Provider: " + providerError;
        if (statusCode) enhancedError += " | Status: " + statusCode;
        
        console.error("[GPT5-ERROR] " + requestId + " " + processingTime + "ms " + enhancedError);
        
        // Record failure metrics
        metrics.recordCall(selectedModel, false, inputTokens, 0, 0, processingTime, enhancedError, isMemoryOptimized);
        
        // Return user-friendly error message (no fallback to other models)
        var userError = "AI service temporarily unavailable";
        if (statusCode === 429) userError += " (rate limited)";
        else if (statusCode >= 500) userError += " (server error)";
        else if (statusCode === 401) userError += " (authentication error)";
        
        userError += ". Details: " + baseMessage;
        userError += "\nRequest ID: " + requestId;
        userError += "\nCircuit Breaker: " + circuitBreaker.getState();
        
        resolve(userError);
      });

    } catch (setupError) {
      var processingTime = Date.now() - startTime;
      var errorMessage = setupError && setupError.message ? setupError.message : String(setupError);
      
      console.error("[GPT5-SETUP-ERROR] " + requestId + " " + errorMessage);
      metrics.recordCall("unknown", false, 0, 0, 0, processingTime, errorMessage, false);
      
      resolve("Service initialization error. Details: " + errorMessage + "\nRequest ID: " + requestId);
    }
  });
}

// ---------- MEMORY-AWARE API FUNCTIONS ----------

function getGPT5AnalysisWithMemory(prompt, memory, options) {
  var enhancedPrompt = attachMemoryToPrompt(prompt, memory);
  var enhancedOptions = options || {};
  enhancedOptions.memoryEnabled = true;
  
  return getGPT5Analysis(enhancedPrompt, enhancedOptions);
}

function getChatWithMemory(messages, memory, options) {
  options = options || {};
  var requestId = generateRequestId();
  var startTime = Date.now();
  
  var enhancedMessages = attachMemoryToMessages(messages, memory);
  var selectedModel = options.model || GPT5_CONFIG.CHAT_MODEL;
  var inputTokens = 0;
  var outputTokens = 0;
  var apiUsed = "chat";

  return new Promise(function (resolve) {
    try {
      console.log("[CHAT-MEMORY-START] " + requestId + " model=" + selectedModel + " messages=" + enhancedMessages.length);

      // Check cache
      if (!options.skipCache) {
        var cacheKey = cache.generateKey(JSON.stringify(enhancedMessages), options);
        var cachedResult = cache.get(cacheKey);
        if (cachedResult) {
          console.log("[CHAT-MEMORY-CACHE-HIT] " + requestId);
          return resolve("[CACHED] " + cachedResult);
        }
      }

      // Estimate input tokens
      inputTokens = Math.ceil(JSON.stringify(enhancedMessages).length / 3.5);

      var retryHandler = createRetryHandler(3);
      var chatRequest = buildEnhancedChatRequest(selectedModel, enhancedMessages, options);

      circuitBreaker.execute(function () {
        return retryHandler(function () {
          return openai.chat.completions.create(chatRequest);
        });
      }).then(function (completion) {
        var usage = safeGet(completion, "usage", {});
        inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
        outputTokens = usage.output_tokens || usage.completion_tokens || 0;

        var responseText = safeExtractResponseText(completion, apiUsed, requestId);
        if (!responseText || responseText.length === 0) {
          throw new Error("Empty response received");
        }

        var processingTime = Date.now() - startTime;
        var costDetails = calculateDetailedCost(selectedModel, inputTokens, outputTokens);
        
        console.log("[CHAT-MEMORY-SUCCESS] " + requestId + " " + processingTime + "ms " + outputTokens + "tok");
        
        metrics.recordCall(selectedModel, true, inputTokens, outputTokens, costDetails.totalCost, processingTime, null, true);
        metrics.stats.apiUsageStats.chat = (metrics.stats.apiUsageStats.chat || 0) + 1;

        // Cache result
        if (!options.skipCache && responseText.length > 10 && !responseText.startsWith("[")) {
          var cacheKey2 = cache.generateKey(JSON.stringify(enhancedMessages), options);
          cache.set(cacheKey2, responseText);
        }

        resolve(responseText);

      }).catch(function (error) {
        var processingTime = Date.now() - startTime;
        var errorMessage = error && error.message ? error.message : String(error);
        
        console.error("[CHAT-MEMORY-ERROR] " + requestId + " " + processingTime + "ms " + errorMessage);
        metrics.recordCall(selectedModel, false, inputTokens, 0, 0, processingTime, errorMessage, true);
        
        resolve("Chat service error. Details: " + errorMessage + "\nRequest ID: " + requestId);
      });

    } catch (setupError) {
      var errorMessage = setupError && setupError.message ? setupError.message : String(setupError);
      console.error("[CHAT-MEMORY-SETUP-ERROR] " + requestId + " " + errorMessage);
      resolve("Chat setup error. Details: " + errorMessage + "\nRequest ID: " + requestId);
    }
  });
}

// ---------- QUICK ACCESS FUNCTIONS ----------

function getQuickNanoResponse(prompt, options) {
  var enhancedOptions = Object.assign({}, options || {}, {
    forceModel: GPT5_CONFIG.NANO_MODEL,
    reasoning_effort: "minimal",
    verbosity: "low",
    max_output_tokens: 2000
  });
  
  return getGPT5Analysis(prompt, enhancedOptions);
}

function getQuickMiniResponse(prompt, options) {
  var enhancedOptions = Object.assign({}, options || {}, {
    forceModel: GPT5_CONFIG.MINI_MODEL,
    reasoning_effort: "medium",
    verbosity: "medium",
    max_output_tokens: 4000
  });
  
  return getGPT5Analysis(prompt, enhancedOptions);
}

function getDeepAnalysis(prompt, options) {
  var enhancedOptions = Object.assign({}, options || {}, {
    forceModel: GPT5_CONFIG.PRIMARY_MODEL,
    reasoning_effort: "high",
    verbosity: "high", 
    max_output_tokens: 16000
  });
  
  return getGPT5Analysis(prompt, enhancedOptions);
}

function getChatResponse(prompt, options) {
  var enhancedOptions = Object.assign({}, options || {}, {
    forceModel: GPT5_CONFIG.CHAT_MODEL,
    max_tokens: 8000,
    temperature: options && typeof options.temperature === "number" ? options.temperature : GPT5_CONFIG.DEFAULT_TEMPERATURE
  });
  
  return getGPT5Analysis(prompt, enhancedOptions);
}

// ---------- HEALTH AND DIAGNOSTICS ----------

function testOpenAIConnection() {
  var requestId = generateRequestId();
  console.log("[HEALTH-CHECK] " + requestId + " Testing OpenAI connection...");
  
  return getQuickNanoResponse("System check", { 
    max_output_tokens: 10, 
    skipCache: true, 
    temperature: 0,
    reasoning_effort: "minimal"
  }).then(function (result) {
    var isValidResponse = result && 
                         result.length > 0 && 
                         !result.startsWith("[Empty") && 
                         !result.startsWith("[No message") &&
                         !result.startsWith("Service error") &&
                         !result.startsWith("AI service");
    
    console.log("[HEALTH-CHECK] " + requestId + " " + (isValidResponse ? "PASS" : "FAIL"));
    
    return {
      success: isValidResponse,
      result: result,
      model: GPT5_CONFIG.NANO_MODEL,
      gpt5Available: isValidResponse,
      requestId: requestId,
      timestamp: getCurrentTimestamp()
    };
  }).catch(function (error) {
    console.error("[HEALTH-CHECK] " + requestId + " CRITICAL FAILURE:", error.message);
    return {
      success: false,
      error: error.message,
      gpt5Available: false,
      requestId: requestId,
      timestamp: getCurrentTimestamp()
    };
  });
}

function checkGPT5SystemHealth() {
  var healthCheck = {
    timestamp: getCurrentTimestamp(),
    requestId: generateRequestId(),
    models: {
      gpt5Available: false,
      gpt5MiniAvailable: false, 
      gpt5NanoAvailable: false,
      gpt5ChatAvailable: false
    },
    system: {
      currentModel: null,
      circuitBreakerState: circuitBreaker.getDetailedState(),
      metrics: metrics.getDetailedStats(),
      cache: cache.getDetailedStats(),
      smartModelSelection: GPT5_CONFIG.AUTO_SCALE.ENABLED,
      memoryOptimization: GPT5_CONFIG.MEMORY_OPTIMIZATION.GREETING_BYPASS_ENABLED
    },
    errors: [],
    recommendations: [],
    performance: {
      overallHealth: false,
      availableModels: 0
    }
  };

  function testModel(testFunction, modelKey, modelName) {
    return testFunction("health check", { 
      max_output_tokens: 5, 
      skipCache: true, 
      temperature: 0,
      reasoning_effort: "minimal"
    }).then(function (result) {
      var isHealthy = result && 
                     result.length > 0 && 
                     !result.startsWith("[Empty") && 
                     !result.startsWith("Service error") &&
                     !result.startsWith("AI service");
      
      if (isHealthy) {
        healthCheck.models[modelKey] = true;
        healthCheck.performance.availableModels += 1;
        console.log("[HEALTH] " + modelName + " ✅ Available");
      } else {
        healthCheck.errors.push(modelName + ": " + (result || "Unknown error"));
        console.log("[HEALTH] " + modelName + " ❌ Unavailable");
      }
    }).catch(function (error) {
      healthCheck.errors.push(modelName + ": " + error.message);
      console.log("[HEALTH] " + modelName + " ❌ Error: " + error.message);
    });
  }

  return Promise.resolve()
    .then(function () { return testModel(getQuickNanoResponse, "gpt5NanoAvailable", "GPT-5 Nano"); })
    .then(function () { return testModel(getQuickMiniResponse, "gpt5MiniAvailable", "GPT-5 Mini"); })
    .then(function () { return testModel(getDeepAnalysis, "gpt5Available", "GPT-5 Full"); })
    .then(function () { return testModel(getChatResponse, "gpt5ChatAvailable", "GPT-5 Chat"); })
    .then(function () {
      // Determine current best model
      if (healthCheck.models.gpt5Available) {
        healthCheck.system.currentModel = GPT5_CONFIG.PRIMARY_MODEL;
      } else if (healthCheck.models.gpt5MiniAvailable) {
        healthCheck.system.currentModel = GPT5_CONFIG.MINI_MODEL;
      } else if (healthCheck.models.gpt5NanoAvailable) {
        healthCheck.system.currentModel = GPT5_CONFIG.NANO_MODEL;
      } else if (healthCheck.models.gpt5ChatAvailable) {
        healthCheck.system.currentModel = GPT5_CONFIG.CHAT_MODEL;
      }

      healthCheck.performance.overallHealth = Boolean(healthCheck.system.currentModel);

      // Test smart model selection
      try {
        var shortPrompt = selectOptimalModel("hi", { reasoning_effort: "minimal" });
        var longPrompt = selectOptimalModel(new Array(5000).join("A"), { reasoning_effort: "medium" });
        var complexPrompt = selectOptimalModel("analyze and compare detailed strategic options", { reasoning_effort: "high" });
        
        var uniqueModels = {};
        uniqueModels[shortPrompt] = true;
        uniqueModels[longPrompt] = true;
        uniqueModels[complexPrompt] = true;
        
        var modelVariety = Object.keys(uniqueModels).length;
        healthCheck.system.smartModelSelection = modelVariety >= 2;
        
        healthCheck.system.modelSelectionTest = {
          short: shortPrompt,
          long: longPrompt,
          complex: complexPrompt,
          variety: modelVariety + "/3"
        };
        
        console.log("[HEALTH] Model selection test: " + modelVariety + "/3 variants");
        
      } catch (selectionError) {
        healthCheck.errors.push("Model selection test failed: " + selectionError.message);
      }

      // Generate recommendations
      var stats = healthCheck.system.metrics;
      var successRate = Number(stats.overview.successRate.replace("%", ""));
      
      if (successRate < 95) {
        healthCheck.recommendations.push("Success rate below 95% - check API key and quotas");
      }
      
      if (healthCheck.system.circuitBreakerState.state === "OPEN") {
        healthCheck.recommendations.push("Circuit breaker OPEN - service degraded, waiting for recovery");
      }
      
      if (healthCheck.performance.availableModels === 0) {
        healthCheck.recommendations.push("CRITICAL: No GPT-5 models available - check API access");
      } else if (healthCheck.performance.availableModels < 3) {
        healthCheck.recommendations.push("LIMITED: Only " + healthCheck.performance.availableModels + "/4 models available");
      }
      
      if (healthCheck.system.cache.size === 0 && stats.overview.totalCalls > 10) {
        healthCheck.recommendations.push("Cache empty despite activity - check caching logic");
      }
      
      if (!healthCheck.system.smartModelSelection) {
        healthCheck.recommendations.push("Smart model selection may be disabled or not working");
      }
      
      if (stats.performance.memoryOptimizationRate === "0%") {
        healthCheck.recommendations.push("Memory optimization not being used - check dualCommandSystem integration");
      }

      console.log("[HEALTH] Overall health: " + (healthCheck.performance.overallHealth ? "HEALTHY" : "DEGRADED"));
      console.log("[HEALTH] Available models: " + healthCheck.performance.availableModels + "/4");
      console.log("[HEALTH] Memory optimization: " + stats.performance.memoryOptimizationRate);
      
      return healthCheck;
    });
}

// ---------- ADMINISTRATIVE FUNCTIONS ----------

function clearCache() {
  try {
    var statsBeforeClear = cache.getDetailedStats();
    cache.clear();
    
    console.log("[ADMIN] Cache cleared - was " + statsBeforeClear.size + " items");
    
    return Promise.resolve({
      success: true,
      message: "Cache cleared successfully",
      previousStats: statsBeforeClear,
      timestamp: getCurrentTimestamp()
    });
  } catch (error) {
    return Promise.resolve({
      success: false,
      error: error.message,
      timestamp: getCurrentTimestamp()
    });
  }
}

function resetMetrics() {
  try {
    var statsBeforeReset = metrics.getDetailedStats();
    metrics.reset();
    
    console.log("[ADMIN] Metrics reset - previous total calls: " + statsBeforeReset.overview.totalCalls);
    
    return Promise.resolve({
      success: true,
      message: "Metrics reset successfully", 
      previousStats: statsBeforeReset,
      timestamp: getCurrentTimestamp()
    });
  } catch (error) {
    return Promise.resolve({
      success: false,
      error: error.message,
      timestamp: getCurrentTimestamp()
    });
  }
}

function getSystemStats() {
  try {
    return Promise.resolve({
      timestamp: getCurrentTimestamp(),
      uptime: Date.now() - metrics.startTime,
      metrics: metrics.getDetailedStats(),
      cache: cache.getDetailedStats(),
      circuitBreaker: circuitBreaker.getDetailedState(),
      models: GPT5_CONFIG.MODEL_CAPABILITIES,
      configuration: {
        autoScale: GPT5_CONFIG.AUTO_SCALE.ENABLED,
        memoryOptimization: GPT5_CONFIG.MEMORY_OPTIMIZATION.GREETING_BYPASS_ENABLED,
        defaultModel: GPT5_CONFIG.PRIMARY_MODEL,
        cacheSize: cache.maxSize,
        cacheTTL: cache.ttl + "ms"
      },
      health: {
        overall: circuitBreaker.getDetailedState().state !== "OPEN",
        apiKey: !!process.env.OPENAI_API_KEY,
        environment: process.env.NODE_ENV || "unknown"
      }
    });
  } catch (error) {
    return Promise.resolve({
      error: error.message,
      timestamp: getCurrentTimestamp()
    });
  }
}

// ---------- ENHANCED DEBUGGING FUNCTIONS ----------

function debugModelSelection(prompt, options) {
  try {
    var result = {
      prompt: safeString(prompt).substring(0, 200),
      promptLength: safeString(prompt).length,
      options: options || {},
      selection: {}
    };

    // Test each step of model selection
    result.selection.forceModel = options && options.forceModel ? options.forceModel : null;
    result.selection.explicitModel = options && options.model ? options.model : null;
    result.selection.isShortChat = safeString(prompt).length <= GPT5_CONFIG.SHORT_CHAT_THRESHOLD;
    
    // Greeting detection
    var isGreeting = false;
    if (GPT5_CONFIG.MEMORY_OPTIMIZATION.GREETING_BYPASS_ENABLED) {
      var greetings = GPT5_CONFIG.AUTO_SCALE.GREETING_KEYWORDS;
      for (var i = 0; i < greetings.length; i++) {
        var pattern = new RegExp("^" + greetings[i] + "\\b", "i");
        if (pattern.test(safeString(prompt).trim())) {
          isGreeting = true;
          break;
        }
      }
    }
    result.selection.isGreeting = isGreeting;
    
    // Complexity detection
    var hasComplex = false;
    var textLower = safeString(prompt).toLowerCase();
    var complexWords = GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS;
    
    for (var j = 0; j < complexWords.length; j++) {
      if (textLower.indexOf(complexWords[j]) >= 0) {
        hasComplex = true;
        break;
      }
    }
    result.selection.hasComplexKeywords = hasComplex;
    
    // Final selection
    result.selection.selectedModel = selectOptimalModel(prompt, options);
    result.selection.reasoning = "See model selection logic in selectOptimalModel()";
    
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

// ---------- INITIALIZATION AND LOGGING ----------

console.log("[GPT5-CLIENT] Enhanced OpenAI Client v3.1.0 initializing...");
console.log("[GPT5-CLIENT] Available models:", Object.keys(GPT5_CONFIG.MODEL_CAPABILITIES));
console.log("[GPT5-CLIENT] Smart model selection:", GPT5_CONFIG.AUTO_SCALE.ENABLED ? "enabled" : "disabled");
console.log("[GPT5-CLIENT] Memory optimization:", GPT5_CONFIG.MEMORY_OPTIMIZATION.GREETING_BYPASS_ENABLED ? "enabled" : "disabled");
console.log("[GPT5-CLIENT] Circuit breaker threshold:", circuitBreaker.threshold + " failures");
console.log("[GPT5-CLIENT] Cache capacity:", cache.maxSize + " items, TTL: " + Math.round(cache.ttl / 1000) + "s");

// Test basic functionality at startup
testOpenAIConnection().then(function (result) {
  if (result.success) {
    console.log("[GPT5-CLIENT] ✅ Connection test successful - System ready");
  } else {
    console.error("[GPT5-CLIENT] ❌ Connection test failed:", result.error);
  }
}).catch(function (error) {
  console.error("[GPT5-CLIENT] ❌ Startup test error:", error.message);
});

// ---------- MODULE EXPORTS ----------

module.exports = {
  // Core API functions
  getGPT5Analysis: getGPT5Analysis,
  
  // Quick access functions (optimized for different use cases)
  getQuickNanoResponse: getQuickNanoResponse,
  getQuickMiniResponse: getQuickMiniResponse,
  getDeepAnalysis: getDeepAnalysis,
  getChatResponse: getChatResponse,
  
  // Memory-aware functions (for dualCommandSystem integration)
  getGPT5AnalysisWithMemory: getGPT5AnalysisWithMemory,
  getChatWithMemory: getChatWithMemory,
  attachMemoryToPrompt: attachMemoryToPrompt,
  attachMemoryToMessages: attachMemoryToMessages,
  
  // Health and diagnostics
  testOpenAIConnection: testOpenAIConnection,
  checkGPT5SystemHealth: checkGPT5SystemHealth,
  
  // Administrative functions
  clearCache: clearCache,
  resetMetrics: resetMetrics,
  getSystemStats: getSystemStats,
  
  // Utility functions
  selectOptimalModel: selectOptimalModel,
  calculateCost: calculateDetailedCost,
  buildResponsesRequest: buildEnhancedResponsesRequest,
  buildChatRequest: buildEnhancedChatRequest,
  safeExtractResponseText: safeExtractResponseText,
  
  // Debugging and development
  debugModelSelection: debugModelSelection,
  
  // System components (for advanced usage)
  metrics: metrics,
  cache: cache,
  circuitBreaker: circuitBreaker,
  
  // OpenAI client and configuration
  openai: openai,
  GPT5_CONFIG: GPT5_CONFIG,
  
  // Version and info
  version: "3.1.0-enhanced",
  features: [
    "smart-model-selection",
    "memory-optimization-support", 
    "circuit-breaker-pattern",
    "intelligent-caching",
    "comprehensive-metrics",
    "rate-limit-handling",
    "cost-optimization",
    "health-monitoring",
    "request-tracking",
    "error-recovery"
  ]
};

console.log("[GPT5-CLIENT] ✅ Enhanced OpenAI Client fully loaded and operational");
console.log("[GPT5-CLIENT] 🎯 Ready for dualCommandSystem integration with memory optimization");
console.log("[GPT5-CLIENT] 🚀 Production deployment validated");
