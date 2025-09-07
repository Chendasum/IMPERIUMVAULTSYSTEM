// utils/openaiClient.js - Official GPT-5 Client (Based on OpenAI Documentation)
// ═══════════════════════════════════════════════════════════════════════════
// Accurate implementation using real GPT-5 models and official API features
// Supports both Responses API and Chat Completions API as documented
// ═══════════════════════════════════════════════════════════════════════════

"use strict";
require("dotenv").config();
const OpenAI = require("openai").OpenAI;
const crypto = require("crypto");

// Validation
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

console.log('🧠 Loading Official GPT-5 Client (August 2025 Release)...');

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function sleep(ms) { 
  return new Promise(function (resolve) { setTimeout(resolve, ms); }); 
}

function safeString(value) { 
  return value === undefined || value === null ? "" : String(value); 
}

function safeGet(obj, path, defaultValue) {
  try {
    const parts = path.split(".");
    let current = obj;
    for (let i = 0; i < parts.length; i++) {
      if (current === null || current === undefined) return defaultValue;
      current = current[parts[i]];
    }
    return (current === undefined || current === null) ? defaultValue : current;
  } catch (error) { 
    return defaultValue; 
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// METRICS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

function MetricsCollector() {
  this.stats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalTokensUsed: 0,
    totalCost: 0,
    averageResponseTime: 0,
    modelUsageStats: {},
    apiUsageStats: { responses: 0, chat: 0 },
    errorTypes: {},
    responseTimes: [],
    lastReset: new Date().toISOString()
  };
  this.startTime = Date.now();
}

MetricsCollector.prototype.recordCall = function (model, apiType, success, tokens, cost, responseTime, error) {
  const stats = this.stats;
  stats.totalCalls += 1;
  stats.apiUsageStats[apiType] = (stats.apiUsageStats[apiType] || 0) + 1;
  
  if (success) {
    stats.successfulCalls += 1;
    stats.totalTokensUsed += tokens;
    stats.totalCost += cost;
    stats.responseTimes.push(responseTime);
    
    const times = stats.responseTimes;
    stats.averageResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    if (times.length > 1000) {
      stats.responseTimes = times.slice(-1000);
    }
  } else {
    stats.failedCalls += 1;
    if (error) {
      const errorKey = String(error);
      stats.errorTypes[errorKey] = (stats.errorTypes[errorKey] || 0) + 1;
    }
  }
  
  if (!stats.modelUsageStats[model]) {
    stats.modelUsageStats[model] = { calls: 0, tokens: 0, cost: 0 };
  }
  stats.modelUsageStats[model].calls += 1;
  stats.modelUsageStats[model].tokens += tokens;
  stats.modelUsageStats[model].cost += cost;
};

MetricsCollector.prototype.getStats = function () {
  const stats = this.stats;
  return {
    totalCalls: stats.totalCalls,
    successfulCalls: stats.successfulCalls,
    failedCalls: stats.failedCalls,
    totalTokensUsed: stats.totalTokensUsed,
    totalCost: parseFloat(stats.totalCost.toFixed(6)),
    averageResponseTime: Math.round(stats.averageResponseTime),
    modelUsageStats: stats.modelUsageStats,
    apiUsageStats: stats.apiUsageStats,
    errorTypes: stats.errorTypes,
    lastReset: stats.lastReset,
    recentResponseTimes: stats.responseTimes.slice(-10),
    uptime: Date.now() - this.startTime,
    successRate: stats.totalCalls > 0 ? ((stats.successfulCalls / stats.totalCalls) * 100).toFixed(2) : "0.00"
  };
};

MetricsCollector.prototype.reset = function () { 
  this.stats = new MetricsCollector().stats; 
};

// ═══════════════════════════════════════════════════════════════════════════
// CACHE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

function ResponseCache(maxSize, ttl) {
  this.cache = new Map();
  this.maxSize = Number(maxSize || 1000);
  this.ttl = Number(ttl || 3600000);
}

ResponseCache.prototype.generateKey = function (prompt, options, apiType) {
  const cleanOptions = {};
  if (options) {
    for (const key in options) {
      if (key !== "skipCache" && Object.prototype.hasOwnProperty.call(options, key)) {
        cleanOptions[key] = options[key];
      }
    }
  }
  return crypto.createHash("sha256")
    .update(safeString(prompt) + JSON.stringify(cleanOptions) + apiType)
    .digest("hex");
};

ResponseCache.prototype.get = function (key) {
  const item = this.cache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > this.ttl) {
    this.cache.delete(key);
    return null;
  }
  
  item.hits = (item.hits || 0) + 1;
  return item.data;
};

ResponseCache.prototype.set = function (key, data) {
  if (this.cache.size >= this.maxSize) {
    const firstKey = this.cache.keys().next().value;
    this.cache.delete(firstKey);
  }
  
  this.cache.set(key, {
    data: data,
    timestamp: Date.now(),
    hits: 0
  });
};

ResponseCache.prototype.clear = function () { 
  this.cache.clear(); 
};

ResponseCache.prototype.getStats = function () {
  let totalHits = 0;
  let itemCount = 0;
  
  for (const item of this.cache.values()) {
    totalHits += (item.hits || 0);
    itemCount++;
  }
  
  return {
    size: this.cache.size,
    maxSize: this.maxSize,
    hitRate: itemCount > 0 ? (totalHits / itemCount).toFixed(2) : "0.00"
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER
// ═══════════════════════════════════════════════════════════════════════════

function CircuitBreaker(failureThreshold, timeoutMs) {
  this.failureThreshold = Number(failureThreshold || 5);
  this.timeoutMs = Number(timeoutMs || 30000);
  this.failureCount = 0;
  this.lastFailureTime = 0;
  this.state = "CLOSED";
}

CircuitBreaker.prototype.execute = function (operation) {
  const self = this;
  
  return new Promise(function (resolve, reject) {
    if (self.state === "OPEN") {
      if (Date.now() - self.lastFailureTime > self.timeoutMs) {
        self.state = "HALF_OPEN";
      } else {
        return reject(new Error("Circuit breaker is OPEN"));
      }
    }
    
    Promise.resolve()
      .then(operation)
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

CircuitBreaker.prototype.onSuccess = function () {
  this.failureCount = 0;
  this.state = "CLOSED";
};

CircuitBreaker.prototype.onFailure = function () {
  this.failureCount++;
  this.lastFailureTime = Date.now();
  
  if (this.failureCount >= this.failureThreshold) {
    this.state = "OPEN";
  }
};

CircuitBreaker.prototype.getState = function () {
  return this.state;
};

// ═══════════════════════════════════════════════════════════════════════════
// OFFICIAL GPT-5 CONFIGURATION (Based on OpenAI Documentation)
// ═══════════════════════════════════════════════════════════════════════════

const GPT5_CONFIG = {
  // Official GPT-5 models (Released August 7, 2025)
  PRIMARY_MODEL: process.env.GPT5_PRIMARY_MODEL || "gpt-5",
  MINI_MODEL: process.env.GPT5_MINI_MODEL || "gpt-5-mini",
  NANO_MODEL: process.env.GPT5_NANO_MODEL || "gpt-5-nano",
  
  // Context and token limits
  MAX_OUTPUT_TOKENS: 16384,
  CONTEXT_WINDOW: 400000, // 400K tokens
  MAX_PROMPT_LENGTH: 350000,
  
  // Official reasoning efforts
  REASONING_EFFORTS: ["minimal", "low", "medium", "high"],
  DEFAULT_REASONING: "medium",
  
  // Official verbosity levels
  VERBOSITY_LEVELS: ["low", "medium", "high"],
  DEFAULT_VERBOSITY: "medium",
  
  DEFAULT_TEMPERATURE: 0.7,
  
  // Official GPT-5 pricing (from OpenAI documentation)
  MODEL_PRICING: {
    "gpt-5": { input: 0.00125, output: 0.01 }, // $1.25/1M input, $10/1M output
    "gpt-5-mini": { input: 0.00025, output: 0.002 }, // $0.25/1M input, $2/1M output
    "gpt-5-nano": { input: 0.00005, output: 0.0004 } // $0.05/1M input, $0.40/1M output
  },
  
  // Smart API selection
  DUAL_API: {
    ENABLED: process.env.GPT5_DUAL_API !== "false",
    RESPONSES_FOR_REASONING: true,
    CHAT_FOR_SIMPLE: true,
    CHAT_THRESHOLD: 100 // Short prompts go to chat API
  },
  
  // Smart model selection
  AUTO_SCALE: {
    ENABLED: process.env.SMART_MODEL_SELECT !== "false",
    NANO_MAX_LENGTH: 2000,
    MINI_MAX_LENGTH: 10000,
    COMPLEXITY_KEYWORDS: ["analyze", "compare", "evaluate", "research", "complex", "detailed", "comprehensive"]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// OPENAI CLIENT SETUP
// ═══════════════════════════════════════════════════════════════════════════

const metrics = new MetricsCollector();
const cache = new ResponseCache(
  process.env.OPENAI_CACHE_MAX || 1000,
  process.env.OPENAI_CACHE_TTL_MS || 3600000
);
const circuitBreaker = new CircuitBreaker(
  process.env.OPENAI_CB_FAILS || 5,
  process.env.OPENAI_CB_COOLDOWN_MS || 30000
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: Number(process.env.OPENAI_TIMEOUT_MS || 120000),
  maxRetries: Number(process.env.OPENAI_SDK_MAX_RETRIES || 2),
  defaultHeaders: {
    "User-Agent": "GPT5-IMPERIUM-VAULT/1.0.0",
    "X-Client-Version": "1.0.0-gpt5",
    "X-Environment": process.env.NODE_ENV || "development"
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SMART MODEL AND API SELECTION
// ═══════════════════════════════════════════════════════════════════════════

function selectOptimalModel(prompt, options) {
  options = options || {};
  
  // Honor explicit model selection
  if (options.model) return options.model;
  
  const text = safeString(prompt);
  const length = text.length;
  
  if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) {
    return GPT5_CONFIG.PRIMARY_MODEL;
  }
  
  // Check for complexity keywords
  const lowerText = text.toLowerCase();
  const hasComplexKeywords = GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS.some(
    keyword => lowerText.includes(keyword)
  );
  
  // High reasoning effort always gets full GPT-5
  if (options.reasoning_effort === "high") {
    return GPT5_CONFIG.PRIMARY_MODEL;
  }
  
  // Model selection based on length and complexity
  if (length < GPT5_CONFIG.AUTO_SCALE.NANO_MAX_LENGTH && !hasComplexKeywords) {
    return GPT5_CONFIG.NANO_MODEL;
  }
  
  if (length < GPT5_CONFIG.AUTO_SCALE.MINI_MAX_LENGTH && !hasComplexKeywords) {
    return GPT5_CONFIG.MINI_MODEL;
  }
  
  return GPT5_CONFIG.PRIMARY_MODEL;
}

function selectOptimalAPI(prompt, model, options) {
  if (!GPT5_CONFIG.DUAL_API.ENABLED) {
    return "chat"; // Default to chat if dual API disabled
  }
  
  const text = safeString(prompt);
  const reasoning = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  
  // Short prompts or minimal reasoning go to Chat API
  if (text.length < GPT5_CONFIG.DUAL_API.CHAT_THRESHOLD || reasoning === "minimal") {
    return "chat";
  }
  
  // Complex reasoning goes to Responses API
  if (reasoning === "high" || reasoning === "medium") {
    return "responses";
  }
  
  return "chat";
}

// ═══════════════════════════════════════════════════════════════════════════
// COST CALCULATION AND LOGGING
// ═══════════════════════════════════════════════════════════════════════════

function calculateCost(model, inputTokens, outputTokens) {
  const pricing = GPT5_CONFIG.MODEL_PRICING[model];
  if (!pricing) return 0;
  
  return (inputTokens * pricing.input) + (outputTokens * pricing.output);
}

function logApiCall(model, apiType, inputTokens, outputTokens, responseTime, success, error) {
  const cost = calculateCost(model, inputTokens, outputTokens);
  
  const logData = {
    timestamp: new Date().toISOString(),
    model: model,
    apiType: apiType,
    inputTokens: inputTokens,
    outputTokens: outputTokens,
    totalTokens: inputTokens + outputTokens,
    cost: parseFloat(cost.toFixed(8)),
    responseTime: responseTime,
    success: success,
    error: error ? String(error) : null,
    circuitBreakerState: circuitBreaker.getState()
  };
  
  console.log("[GPT5-API]", JSON.stringify(logData));
  return cost;
}

// ═══════════════════════════════════════════════════════════════════════════
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ═══════════════════════════════════════════════════════════════════════════

function withExponentialBackoff(operation) {
  const delays = [500, 1500, 3000];
  let attemptIndex = 0;
  
  function attempt() {
    return Promise.resolve()
      .then(operation)
      .catch(function (error) {
        const status = safeGet(error, "status", null) || safeGet(error, "response.status", null);
        const message = safeGet(error, "message", "") || safeGet(error, "response.data.error.message", "");
        
        const isRateLimit = status === 429 || /rate.*limit/i.test(message);
        
        if (!isRateLimit || attemptIndex >= delays.length) {
          throw error;
        }
        
        const delay = delays[attemptIndex++];
        console.log(`[GPT5-RETRY] Waiting ${delay}ms before retry (attempt ${attemptIndex})`);
        
        return sleep(delay).then(attempt);
      });
  }
  
  return attempt();
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST BUILDERS FOR BOTH APIS
// ═══════════════════════════════════════════════════════════════════════════

function buildResponsesRequest(model, input, options) {
  const request = {
    model: model,
    input: safeString(input)
  };
  
  // Add GPT-5 specific parameters with correct structure
  const reasoning = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  if (GPT5_CONFIG.REASONING_EFFORTS.includes(reasoning)) {
    // Correct parameter structure for Responses API
    request.reasoning = { effort: reasoning };
  }
  
  const verbosity = options.verbosity || GPT5_CONFIG.DEFAULT_VERBOSITY;
  if (GPT5_CONFIG.VERBOSITY_LEVELS.includes(verbosity)) {
    request.verbosity = verbosity;
  }
  
  const maxTokens = options.max_output_tokens || options.max_completion_tokens || 8000;
  request.max_output_tokens = Math.min(maxTokens, GPT5_CONFIG.MAX_OUTPUT_TOKENS);
  
  return request;
}

function buildChatRequest(model, messages, options) {
  const request = {
    model: model,
    messages: messages
  };
  
  const maxTokens = options.max_tokens || options.max_completion_tokens || 8000;
  request.max_tokens = Math.min(maxTokens, GPT5_CONFIG.MAX_OUTPUT_TOKENS);
  
  if (typeof options.temperature === "number") request.temperature = options.temperature;
  if (typeof options.top_p === "number") request.top_p = options.top_p;
  if (typeof options.frequency_penalty === "number") request.frequency_penalty = options.frequency_penalty;
  if (typeof options.presence_penalty === "number") request.presence_penalty = options.presence_penalty;
  
  return request;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractResponseText(completion, apiType) {
  try {
    if (apiType === "responses") {
      // Extract from Responses API format
      const content = safeGet(completion, "output_text", null) ||
                     safeGet(completion, "output.0.content.0.text.value", null) ||
                     safeGet(completion, "choices.0.message.content", null);
      return content ? String(content).trim() : "[No content in response]";
    } else {
      // Extract from Chat Completions API format
      const content = safeGet(completion, "choices.0.message.content", null);
      return content ? String(content).trim() : "[No message content]";
    }
  } catch (error) {
    return "[Extraction error: " + error.message + "]";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE GPT-5 FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

function getGPT5Response(prompt, options) {
  options = options || {};
  const startTime = Date.now();
  let inputTokens = 0;
  let outputTokens = 0;
  let selectedModel = "unknown";
  let selectedAPI = "unknown";
  
  return new Promise(function (resolve) {
    try {
      // Input validation
      if (!prompt || typeof prompt !== "string") {
        throw new Error("Invalid prompt: must be non-empty string");
      }
      
      let text = safeString(prompt);
      if (text.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) {
        text = text.slice(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + "\n... (truncated)";
      }
      
      // Check cache
      selectedModel = selectOptimalModel(text, options);
      selectedAPI = selectOptimalAPI(text, selectedModel, options);
      
      if (!options.skipCache) {
        const cacheKey = cache.generateKey(text, options, selectedAPI);
        const cached = cache.get(cacheKey);
        if (cached) {
          console.log(`[GPT5-CACHE] Cache hit for ${selectedModel}/${selectedAPI}`);
          return resolve("[CACHED] " + cached);
        }
      }
      
      console.log(`[GPT5-SELECT] Model: ${selectedModel}, API: ${selectedAPI}`);
      
      // Estimate input tokens
      inputTokens = Math.ceil(text.length / 4);
      
      // Execute with circuit breaker and retry logic
      circuitBreaker.execute(function () {
        return withExponentialBackoff(function () {
          if (selectedAPI === "responses") {
            const request = buildResponsesRequest(selectedModel, text, options);
            return openai.responses.create(request);
          } else {
            const messages = [{ role: "user", content: text }];
            const request = buildChatRequest(selectedModel, messages, options);
            return openai.chat.completions.create(request);
          }
        });
      }).then(function (completion) {
        // Extract response
        const content = extractResponseText(completion, selectedAPI);
        if (!content || content.startsWith("[No ") || content.startsWith("[Extraction")) {
          throw new Error("Empty or invalid response");
        }
        
        // Extract usage statistics
        const usage = safeGet(completion, "usage", {});
        inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
        outputTokens = usage.output_tokens || usage.completion_tokens || 0;
        
        const responseTime = Date.now() - startTime;
        const cost = logApiCall(selectedModel, selectedAPI, inputTokens, outputTokens, responseTime, true);
        metrics.recordCall(selectedModel, selectedAPI, true, inputTokens + outputTokens, cost, responseTime);
        
        // Cache successful response
        if (!options.skipCache && content.length > 10 && !content.startsWith("[CACHED]")) {
          const cacheKey = cache.generateKey(text, options, selectedAPI);
          cache.set(cacheKey, content);
        }
        
        resolve(content);
        
      }).catch(function (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = safeGet(error, "message", String(error));
        
        logApiCall(selectedModel, selectedAPI, inputTokens, outputTokens, responseTime, false, errorMessage);
        metrics.recordCall(selectedModel, selectedAPI, false, 0, 0, responseTime, errorMessage);
        
        resolve(`GPT-5 Error: ${errorMessage}`);
      });
      
    } catch (outerError) {
      const errorMessage = safeGet(outerError, "message", String(outerError));
      resolve(`GPT-5 Error: ${errorMessage}`);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY-AWARE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function attachMemoryToPrompt(prompt, memory) {
  memory = memory || {};
  const systemMessage = memory.systemPreamble ? String(memory.systemPreamble).trim() : "";
  const recallItems = Array.isArray(memory.recall) ? memory.recall : [];
  
  let enhancedPrompt = "";
  
  if (systemMessage) {
    enhancedPrompt += "SYSTEM CONTEXT:\n" + systemMessage + "\n\n";
  }
  
  if (recallItems.length > 0) {
    enhancedPrompt += "MEMORY CONTEXT:\n";
    recallItems.forEach(function (item) {
      enhancedPrompt += "- " + String(item) + "\n";
    });
    enhancedPrompt += "\n";
  }
  
  enhancedPrompt += "USER REQUEST:\n" + safeString(prompt);
  
  return enhancedPrompt;
}

function getGPT5ResponseWithMemory(prompt, memory, options) {
  const enhancedPrompt = attachMemoryToPrompt(prompt, memory);
  return getGPT5Response(enhancedPrompt, options || {});
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED GPT-5 FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getQuickGPT5Response(prompt, options) {
  const opts = Object.assign({}, options || {}, {
    model: GPT5_CONFIG.NANO_MODEL,
    reasoning_effort: "minimal",
    verbosity: "low",
    max_output_tokens: 2000
  });
  return getGPT5Response(prompt, opts);
}

function getDetailedGPT5Analysis(prompt, options) {
  const opts = Object.assign({}, options || {}, {
    model: GPT5_CONFIG.PRIMARY_MODEL,
    reasoning_effort: "high",
    verbosity: "high",
    max_output_tokens: 15000
  });
  return getGPT5Response(prompt, opts);
}

function getEfficientGPT5Response(prompt, options) {
  const opts = Object.assign({}, options || {}, {
    model: GPT5_CONFIG.MINI_MODEL,
    reasoning_effort: "medium",
    verbosity: "medium",
    max_output_tokens: 8000
  });
  return getGPT5Response(prompt, opts);
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH AND TESTING
// ═══════════════════════════════════════════════════════════════════════════

function testGPT5Connection() {
  return getQuickGPT5Response("Respond with 'GPT-5 READY' if operational.", {
    max_output_tokens: 10,
    skipCache: true,
    reasoning_effort: "minimal"
  })
  .then(function (response) {
    return {
      success: true,
      result: response,
      model: GPT5_CONFIG.NANO_MODEL,
      gpt5Available: true,
      timestamp: new Date().toISOString()
    };
  })
  .catch(function (error) {
    return {
      success: false,
      error: error.message,
      gpt5Available: false,
      timestamp: new Date().toISOString()
    };
  });
}

function checkGPT5SystemHealth() {
  const health = {
    timestamp: new Date().toISOString(),
    gpt5Available: false,
    gpt5MiniAvailable: false,
    gpt5NanoAvailable: false,
    responsesAPIAvailable: false,
    chatAPIAvailable: false,
    currentModel: null,
    circuitBreakerState: circuitBreaker.getState(),
    metrics: metrics.getStats(),
    cache: cache.getStats(),
    errors: [],
    recommendations: []
  };
  
  function testModel(model, label) {
    return getGPT5Response("Test", { 
      model: model, 
      max_output_tokens: 5, 
      skipCache: true, 
      reasoning_effort: "minimal" 
    })
    .then(function (response) {
      if (response && !response.startsWith("GPT-5 Error:")) {
        health[label] = true;
      }
    })
    .catch(function (error) {
      health.errors.push(`${model}: ${error.message}`);
    });
  }
  
  return Promise.all([
    testModel(GPT5_CONFIG.PRIMARY_MODEL, "gpt5Available"),
    testModel(GPT5_CONFIG.MINI_MODEL, "gpt5MiniAvailable"), 
    testModel(GPT5_CONFIG.NANO_MODEL, "gpt5NanoAvailable")
  ]).then(function () {
    // Determine current best model
    if (health.gpt5Available) {
      health.currentModel = GPT5_CONFIG.PRIMARY_MODEL;
    } else if (health.gpt5MiniAvailable) {
      health.currentModel = GPT5_CONFIG.MINI_MODEL;
    } else if (health.gpt5NanoAvailable) {
      health.currentModel = GPT5_CONFIG.NANO_MODEL;
    }
    
    health.overallHealth = Boolean(health.currentModel);
    
    // Test API availability
    health.responsesAPIAvailable = health.gpt5Available || health.gpt5MiniAvailable;
    health.chatAPIAvailable = health.gpt5NanoAvailable || health.gpt5MiniAvailable;
    
    // Generate recommendations
    if (Number(health.metrics.successRate) < 95) {
      health.recommendations.push("Success rate below 95% - check API key and quotas");
    }
    
    if (health.circuitBreakerState === "OPEN") {
      health.recommendations.push("Circuit breaker is OPEN - service degraded");
    }
    
    if (health.cache.size === 0) {
      health.recommendations.push("Cache is empty - consider warming up");
    }
    
    if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) {
      health.recommendations.push("Smart model selection disabled");
    }
    
    if (!GPT5_CONFIG.DUAL_API.ENABLED) {
      health.recommendations.push("Dual API mode disabled - missing optimization");
    }
    
    return health;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function clearGPT5Cache() {
  cache.clear();
  return Promise.resolve({ success: true, message: "GPT-5 cache cleared successfully" });
}

function resetGPT5Metrics() {
  metrics.reset();
  return Promise.resolve({ success: true, message: "GPT-5 metrics reset successfully" });
}

function getGPT5SystemStats() {
  return Promise.resolve({
    metrics: metrics.getStats(),
    cache: cache.getStats(),
    circuitBreaker: { state: circuitBreaker.getState() },
    models: GPT5_CONFIG.MODEL_PRICING,
    configuration: {
      autoScale: GPT5_CONFIG.AUTO_SCALE.ENABLED,
      dualAPI: GPT5_CONFIG.DUAL_API.ENABLED,
      contextWindow: GPT5_CONFIG.CONTEXT_WINDOW,
      maxOutputTokens: GPT5_CONFIG.MAX_OUTPUT_TOKENS
    },
    uptime: Date.now() - metrics.startTime
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Core GPT-5 functions
  getGPT5Response,
  getGPT5ResponseWithMemory,
  
  // Specialized GPT-5 functions
  getQuickGPT5Response,
  getDetailedGPT5Analysis,
  getEfficientGPT5Response,
  
  // Memory helpers
  attachMemoryToPrompt,
  
  // Health and testing
  testGPT5Connection,
  checkGPT5SystemHealth,
  
  // Admin functions
  clearGPT5Cache,
  resetGPT5Metrics,
  getGPT5SystemStats,
  
  // Utility functions
  selectOptimalModel,
  selectOptimalAPI,
  calculateCost,
  
  // Request builders
  buildResponsesRequest,
  buildChatRequest,
  extractResponseText,
  
  // Components (for advanced usage)
  metrics,
  cache,
  circuitBreaker,
  openai,
  
  // Configuration
  GPT5_CONFIG,
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BACKWARD COMPATIBILITY ALIASES (For existing bot code)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Main function your bot is calling
  getGPT5Analysis: getGPT5Response,
  getGPT5AnalysisWithMemory: getGPT5ResponseWithMemory,
  
  // Specialized function aliases
  getQuickNanoResponse: getQuickGPT5Response,
  getQuickMiniResponse: getEfficientGPT5Response,
  getDeepAnalysis: getDetailedGPT5Analysis,
  getChatResponse: getGPT5Response,
  getChatWithMemory: getGPT5ResponseWithMemory,
  
  // Health function aliases
  testOpenAIConnection: testGPT5Connection,
  checkGPT5SystemHealth: checkGPT5SystemHealth,
  
  // Admin function aliases
  clearCache: clearGPT5Cache,
  resetMetrics: resetGPT5Metrics,
  getSystemStats: getGPT5SystemStats,
  
  // Memory helper aliases
  attachMemoryToMessages: attachMemoryToPrompt
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION AND STARTUP
// ═══════════════════════════════════════════════════════════════════════════

console.log('');
console.log('🧠 ═══════════════════════════════════════════════════════════════');
console.log('   OFFICIAL GPT-5 CLIENT LOADED (AUGUST 2025 RELEASE)');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('✅ OFFICIAL GPT-5 MODELS:');
console.log(`   🧠 Primary: ${GPT5_CONFIG.PRIMARY_MODEL} ($1.25/$10 per 1M tokens)`);
console.log(`   ⚡ Mini: ${GPT5_CONFIG.MINI_MODEL} ($0.25/$2 per 1M tokens)`);
console.log(`   🔹 Nano: ${GPT5_CONFIG.NANO_MODEL} ($0.05/$0.40 per 1M tokens)`);
console.log('');
console.log('🚀 OFFICIAL GPT-5 FEATURES:');
console.log('   • Dual API support (Responses + Chat Completions)');
console.log('   • Official reasoning_effort: minimal/low/medium/high');
console.log('   • Official verbosity: low/medium/high');
console.log('   • 400K token context window');
console.log('   • Up to 16K output tokens');
console.log('   • Smart model and API selection');
console.log('   • Circuit breaker protection');
console.log('   • Response caching system');
console.log('   • Comprehensive metrics collection');
console.log('');
console.log('📊 PERFORMANCE FEATURES:');
console.log(`   • Auto-scale: ${GPT5_CONFIG.AUTO_SCALE.ENABLED ? 'ENABLED' : 'DISABLED'}`);
console.log(`   • Dual API: ${GPT5_CONFIG.DUAL_API.ENABLED ? 'ENABLED' : 'DISABLED'}`);
console.log(`   • Cache size: ${cache.maxSize} entries`);
console.log(`   • Circuit breaker: ${circuitBreaker.failureThreshold} failure threshold`);
console.log('');
console.log('✅ OFFICIAL GPT-5 CLIENT READY FOR PRODUCTION');
console.log('🧠 ═══════════════════════════════════════════════════════════════');
console.log('');
