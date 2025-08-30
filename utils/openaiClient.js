// utils/openaiClient.js — GPT-5 Client (Production, Ultra-Compat, NO FALLBACK)
// Compatibility: no optional chaining, no nullish coalescing, no arrow functions,
// no destructuring, no template literals, no spread syntax. ASCII-only.
// Public API:
//   getGPT5Analysis(prompt, opts)
//   getQuickNanoResponse(prompt, opts)
//   getQuickMiniResponse(prompt, opts)
//   getDeepAnalysis(prompt, opts)
//   getChatResponse(prompt, opts)
//   getGPT5AnalysisWithMemory(prompt, memory, opts)
//   getChatWithMemory(messages, memory, opts)
//   testOpenAIConnection()
//   checkGPT5SystemHealth()
//   clearCache(), resetMetrics(), getSystemStats()
//   selectOptimalModel(), calculateCost(), buildResponsesRequest(), buildChatRequest(), safeExtractResponseText()
// Exports: metrics, cache, circuitBreaker, openai, GPT5_CONFIG

"use strict";
require("dotenv").config();
var OpenAI = require("openai").OpenAI;
var crypto = require("crypto");

// ---------- Guards ----------
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

// ---------- Utils ----------
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function str(x) { return x === undefined || x === null ? "" : String(x); }
// Safe getter without optional chaining
function g(obj, path, d) {
  try {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur === null || cur === undefined) return d;
      cur = cur[parts[i]];
    }
    return (cur === undefined || cur === null) ? d : cur;
  } catch (e) { return d; }
}

// ---------- Metrics ----------
function GPT5Metrics() {
  this.stats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalTokensUsed: 0,
    totalCost: 0,
    averageResponseTime: 0,
    modelUsageStats: {},
    errorTypes: {},
    responseTimes: [],
    lastReset: new Date().toISOString()
  };
  this.startTime = Date.now();
}
GPT5Metrics.prototype.recordCall = function (model, success, tokens, cost, responseTime, error) {
  var s = this.stats;
  s.totalCalls += 1;
  if (success) {
    s.successfulCalls += 1;
    s.totalTokensUsed += tokens;
    s.totalCost += cost;
    s.responseTimes.push(responseTime);
    var arr = s.responseTimes;
    s.averageResponseTime = arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
    if (arr.length > 1000) s.responseTimes = arr.slice(-1000);
  } else {
    s.failedCalls += 1;
    if (error) s.errorTypes[String(error)] = (s.errorTypes[String(error)] || 0) + 1;
  }
  if (!s.modelUsageStats[model]) s.modelUsageStats[model] = { calls: 0, tokens: 0, cost: 0 };
  s.modelUsageStats[model].calls += 1;
  s.modelUsageStats[model].tokens += tokens;
  s.modelUsageStats[model].cost += cost;
};
GPT5Metrics.prototype.getStats = function () {
  var s = this.stats;
  return {
    totalCalls: s.totalCalls,
    successfulCalls: s.successfulCalls,
    failedCalls: s.failedCalls,
    totalTokensUsed: s.totalTokensUsed,
    totalCost: s.totalCost,
    averageResponseTime: s.averageResponseTime,
    modelUsageStats: s.modelUsageStats,
    errorTypes: s.errorTypes,
    lastReset: s.lastReset,
    responseTimes: s.responseTimes.slice(-10),
    uptime: Date.now() - this.startTime,
    successRate: s.totalCalls > 0 ? ((s.successfulCalls / s.totalCalls) * 100).toFixed(2) : "0.00"
  };
};
GPT5Metrics.prototype.reset = function () { this.stats = new GPT5Metrics().stats; };

// ---------- Cache ----------
function GPT5Cache(maxSize, ttl) {
  this.cache = new Map();
  this.maxSize = Number(maxSize || 1000);
  this.ttl = Number(ttl || 3600000);
}
GPT5Cache.prototype.generateKey = function (prompt, options) {
  var clean = {};
  if (options) { for (var k in options) if (k !== "skipCache" && Object.prototype.hasOwnProperty.call(options, k)) clean[k] = options[k]; }
  return crypto.createHash("sha256").update(str(prompt) + JSON.stringify(clean)).digest("hex");
};
GPT5Cache.prototype.get = function (key) {
  var it = this.cache.get(key);
  if (!it) return null;
  if (Date.now() - it.timestamp > this.ttl) { this.cache.delete(key); return null; }
  it.hits = (it.hits || 0) + 1; return it.data;
};
GPT5Cache.prototype.set = function (key, data) {
  if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value);
  this.cache.set(key, { data: data, timestamp: Date.now(), hits: 0 });
};
GPT5Cache.prototype.clear = function () { this.cache.clear(); };
GPT5Cache.prototype.getStats = function () {
  var totalHits = 0, n = 0; var iter = this.cache.values(); var step = iter.next();
  while (!step.done) { var item = step.value; totalHits += (item.hits || 0); n++; step = iter.next(); }
  return { size: this.cache.size, maxSize: this.maxSize, hitRate: n > 0 ? (totalHits / n).toFixed(2) : "0.00" };
};

// ---------- Circuit Breaker ----------
function CircuitBreaker(threshold, timeout) {
  this.threshold = Number(threshold || 5);
  this.timeout = Number(timeout || 20000);
  this.failureCount = 0;
  this.lastFailureTime = 0;
  this.state = "CLOSED";
}
CircuitBreaker.prototype.execute = function (fn) {
  var self = this;
  return new Promise(function (resolve, reject) {
    if (self.state === "OPEN") {
      if (Date.now() - self.lastFailureTime > self.timeout) {
        self.state = "HALF_OPEN";
      } else {
        return reject(new Error("Circuit breaker is OPEN"));
      }
    }
    Promise.resolve()
      .then(fn)
      .then(function (r) { self.onSuccess(); resolve(r); })
      .catch(function (e) { self.onFailure(); reject(e); });
  });
};
CircuitBreaker.prototype.onSuccess = function () { this.failureCount = 0; this.state = "CLOSED"; };
CircuitBreaker.prototype.onFailure = function () { this.failureCount++; this.lastFailureTime = Date.now(); if (this.failureCount >= this.threshold) this.state = "OPEN"; };
CircuitBreaker.prototype.getState = function () { return this.state; };

// ---------- Client ----------
var metrics = new GPT5Metrics();
var cache = new GPT5Cache(process.env.OPENAI_CACHE_MAX, process.env.OPENAI_CACHE_TTL_MS);
var circuitBreaker = new CircuitBreaker(process.env.OPENAI_CB_FAILS, process.env.OPENAI_CB_COOLDOWN_MS);

var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: Number(process.env.OPENAI_TIMEOUT_MS || 180000),
  maxRetries: Number(process.env.OPENAI_SDK_MAX_RETRIES || 2),
  defaultHeaders: {
    "User-Agent": "IMPERIUM-VAULT-GPT5/3.0.0",
    "X-Client-Version": "3.0.0",
    "X-Environment": process.env.NODE_ENV || "development"
  }
});

// ---------- Config ----------
var GPT5_CONFIG = {
  PRIMARY_MODEL: process.env.GPT5_PRIMARY_MODEL || "gpt-5",
  MINI_MODEL: process.env.GPT5_MINI_MODEL || "gpt-5-mini",
  NANO_MODEL: process.env.GPT5_NANO_MODEL || "gpt-5-nano",
  CHAT_MODEL: process.env.GPT5_CHAT_MODEL || "gpt-5-chat-latest",

  MAX_OUTPUT_TOKENS: 16384,
  MAX_PROMPT_LENGTH: 180000,

  REASONING_EFFORTS: ["low", "medium", "high"],
  DEFAULT_REASONING: "medium",
  DEFAULT_TEMPERATURE: 0.7,

  MODEL_CAPABILITIES: {
    "gpt-5": { maxTokens: 16384, pricing: { input: 0.01, output: 0.03 } },
    "gpt-5-mini": { maxTokens: 8192, pricing: { input: 0.005, output: 0.015 } },
    "gpt-5-nano": { maxTokens: 4096, pricing: { input: 0.003, output: 0.008 } },
    "gpt-5-chat-latest": { maxTokens: 16384, pricing: { input: 0.01, output: 0.03 } }
  },

  AUTO_SCALE: {
    ENABLED: process.env.SMART_MODEL_SELECT !== "false",
    NANO_MAX_LENGTH: 2000,
    MINI_MAX_LENGTH: 10000,
    COMPLEXITY_KEYWORDS: ["analyze", "compare", "evaluate", "research", "complex", "detailed", "comprehensive"]
  },

  // Short prompts go to chat model to avoid Responses availability hiccups
  SHORT_CHAT_THRESHOLD: Number(process.env.FORCE_CHAT_BELOW_CHARS || 64)
};
function capFor(model) {
  var caps = GPT5_CONFIG.MODEL_CAPABILITIES[model];
  return caps && caps.maxTokens ? caps.maxTokens : 4096;
}

// ---------- Model Selection ----------
function selectOptimalModel(prompt, options) {
  options = options || {};
  if (options.model) return options.model;

  var text = str(prompt);
  var len = text.length;

  if (len <= GPT5_CONFIG.SHORT_CHAT_THRESHOLD) return GPT5_CONFIG.CHAT_MODEL;
  if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) return GPT5_CONFIG.PRIMARY_MODEL;

  var lower = text.toLowerCase();
  var hasComplex = false;
  for (var i = 0; i < GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS.length; i++) {
    if (lower.indexOf(GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS[i]) >= 0) { hasComplex = true; break; }
  }
  if (len < GPT5_CONFIG.AUTO_SCALE.NANO_MAX_LENGTH && !hasComplex) return GPT5_CONFIG.NANO_MODEL;
  if (len < GPT5_CONFIG.AUTO_SCALE.MINI_MAX_LENGTH && !hasComplex) return GPT5_CONFIG.MINI_MODEL;
  if (hasComplex || options.reasoning_effort === "high") return GPT5_CONFIG.PRIMARY_MODEL;
  return GPT5_CONFIG.MINI_MODEL;
}

// ---------- Cost + Logs ----------
function calculateCost(model, inputTokens, outputTokens) {
  var p = GPT5_CONFIG.MODEL_CAPABILITIES[model];
  p = p && p.pricing ? p.pricing : null;
  if (!p) return 0;
  return (inputTokens * p.input) / 1000 + (outputTokens * p.output) / 1000;
}
function logApiCall(model, apiType, inputTokens, outputTokens, ms, success, error) {
  var cost = calculateCost(model, inputTokens, outputTokens);
  var logData = {
    timestamp: new Date().toISOString(),
    model: model,
    apiType: apiType,
    inputTokens: inputTokens,
    outputTokens: outputTokens,
    totalTokens: inputTokens + outputTokens,
    cost: cost.toFixed(6),
    executionTime: ms,
    success: success,
    error: error ? String(error) : null,
    circuitBreakerState: circuitBreaker.getState()
  };
  console.log("[GPT5-API] " + JSON.stringify(logData));
  return cost;
}

// ---------- Extraction ----------
function safeExtractResponseText(completion, apiType) {
  try {
    if (apiType === "responses") {
      var outputText = g(completion, "output_text", null);
      if (typeof outputText === "string") return outputText.trim() || "[Empty response]";
      var maybe = g(completion, "output.0.content.0.text.value", null);
      if (typeof maybe === "string") return maybe.trim();
      var chatLike = g(completion, "choices.0.message.content", null);
      if (chatLike) return String(chatLike).trim();
      return "[Unknown response structure]";
    } else {
      var msg = g(completion, "choices.0.message.content", null);
      return msg ? String(msg).trim() : "[No message content]";
    }
  } catch (e) { return "[Extraction error: " + e.message + "]"; }
}

// ---------- Builders ----------
function buildResponsesRequest(model, input, options) {
  options = options || {};
  var req = { model: model, input: str(input) };
  var effort = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  if (effort === "low" || effort === "medium" || effort === "high") req.reasoning = { effort: effort };
  var asked = options.max_output_tokens || options.max_completion_tokens || 8000;
  req.max_output_tokens = Math.max(16, Math.min(asked, capFor(model)));
  // NOTE: Sampling controls like temperature/top_p/penalties are NOT supported on GPT-5 Responses.
  // Do not set them here to avoid 400: Unsupported parameter errors.
  return req;
}
function buildChatRequest(model, messages, options) {
  options = options || {};
  var req = { model: model, messages: messages };
  var asked = options.max_tokens || options.max_completion_tokens || 8000;
  req.max_tokens = Math.max(1, Math.min(asked, capFor(model)));
  if (typeof options.temperature === "number") req.temperature = options.temperature;
  if (typeof options.top_p === "number") req.top_p = options.top_p;
  if (typeof options.frequency_penalty === "number") req.frequency_penalty = options.frequency_penalty;
  if (typeof options.presence_penalty === "number") req.presence_penalty = options.presence_penalty;
  return req;
}

// ---------- Memory Helpers ----------
function attachMemoryToPrompt(prompt, memory) {
  memory = memory || {};
  var sys = memory.systemPreamble ? String(memory.systemPreamble).trim() : "";
  var recall = Array.isArray(memory.recall) ? memory.recall : [];
  var header = sys ? "SYSTEM:\n" + sys + "\n\n" : "";
  var recallText = recall.length ? "MEMORY:\n" + recall.map(function (r) { return "- " + String(r); }).join("\n") + "\n\n" : "";
  return header + recallText + "USER:\n" + str(prompt);
}
function attachMemoryToMessages(messages, memory) {
  messages = Array.isArray(messages) ? messages : [];
  memory = memory || {};
  var sys = memory.systemPreamble ? String(memory.systemPreamble).trim() : "";
  var recall = Array.isArray(memory.recall) ? memory.recall : [];
  var blocks = [];
  if (sys) blocks.push({ role: "system", content: sys });
  if (recall.length) {
    blocks.push({ role: "system", content: "Persistent Memory Context (read-only)\n" + recall.map(function (r) { return "- " + String(r); }).join("\n") });
  }
  return blocks.concat(messages);
}

// ---------- Core ----------
function getGPT5Analysis(prompt, options) {
  options = options || {};
  var start = Date.now();
  var inputTokens = 0, outputTokens = 0; var selectedModel = "unknown"; var apiUsed = "unknown";

  function withBackoff(fn) {
    var delays = [250, 750, 1500];
    var i = 0;
    function attempt() {
      return Promise.resolve()
        .then(fn)
        .catch(function (e) {
          var status = e && (e.status || (e.response && e.response.status));
          var msg = (e && e.response && e.response.data && e.response.data.error && e.response.data.error.message) || (e && e.message) || "";
          var rate = status === 429 || /rate/i.test(String(msg));
          if (!rate || i >= delays.length) throw e;
          var wait = delays[i++]; return sleep(wait).then(attempt);
        });
    }
    return attempt();
  }

  return new Promise(function (resolve) {
    try {
      if (!prompt || typeof prompt !== "string") throw new Error("Invalid prompt: must be non-empty string");
      var text = str(prompt);
      if (text.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) text = text.slice(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + "\n... (truncated)";

      if (!options.skipCache) {
        var key = cache.generateKey(text, options); var cached = cache.get(key);
        if (cached) return resolve("[CACHED] " + cached);
      }

      selectedModel = selectOptimalModel(text, options);
      var useResponses = selectedModel.indexOf("gpt-5") >= 0 && selectedModel !== GPT5_CONFIG.CHAT_MODEL;
      apiUsed = useResponses ? "responses" : "chat";

      inputTokens = Math.ceil(text.length / 3.5);

      circuitBreaker.execute(function () {
        if (useResponses) {
          var req = buildResponsesRequest(selectedModel, text, {
          reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
          max_output_tokens: options.max_output_tokens || options.max_completion_tokens || 8000
        });
          return withBackoff(function () { return openai.responses.create(req); });
        } else {
          var messages = [{ role: "user", content: text }];
          var chatReq = buildChatRequest(selectedModel, messages, {
            max_tokens: options.max_tokens || options.max_completion_tokens || 8000,
            temperature: typeof options.temperature === "number" ? options.temperature : GPT5_CONFIG.DEFAULT_TEMPERATURE
          });
          return withBackoff(function () { return openai.chat.completions.create(chatReq); });
        }
      }).then(function (completion) {
        var usage = g(completion, "usage", {});
        inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
        outputTokens = usage.output_tokens || usage.completion_tokens || 0;

        var out = safeExtractResponseText(completion, apiUsed);
        if (!out || out.length === 0) throw new Error("Empty response");

        var ms = Date.now() - start; var cost = logApiCall(selectedModel, apiUsed, inputTokens, outputTokens, ms, true);
        metrics.recordCall(selectedModel, true, inputTokens + outputTokens, cost, ms);

        if (!options.skipCache && out.length > 10 && out[0] !== "[") {
          var k2 = cache.generateKey(text, options); cache.set(k2, out);
        }
        resolve(out);
      }).catch(function (err) {
        var ms2 = Date.now() - start;
        var provider = g(err, "response.data.error.message", null);
        var merged = provider ? (err.message + " | Provider: " + provider) : (err && err.message ? err.message : String(err));
        logApiCall(selectedModel, apiUsed, inputTokens, outputTokens, ms2, false, merged);
        metrics.recordCall(selectedModel, false, 0, 0, ms2, merged);
        // NO FALLBACK: return error to caller
        resolve("Service error. Details: " + merged + "\nBreaker: " + circuitBreaker.getState());
      });
    } catch (outer) {
      resolve("Service error. Details: " + (outer && outer.message ? outer.message : String(outer)));
    }
  });
}

// ---------- Memory-aware wrappers ----------
function getGPT5AnalysisWithMemory(prompt, memory, options) {
  var merged = attachMemoryToPrompt(prompt, memory);
  return getGPT5Analysis(merged, options || {});
}
function getChatWithMemory(messages, memory, options) {
  options = options || {};
  var msgs = attachMemoryToMessages(messages, memory);
  var model = options.model || GPT5_CONFIG.CHAT_MODEL;
  var start = Date.now();
  var inputTokens = 0, outputTokens = 0; var apiUsed = "chat";

  function withBackoff(fn) {
    var delays = [250, 750, 1500];
    var i = 0;
    function attempt() {
      return Promise.resolve()
        .then(fn)
        .catch(function (e) {
          var status = e && (e.status || (e.response && e.response.status));
          var msg = (e && e.response && e.response.data && e.response.data.error && e.response.data.error.message) || (e && e.message) || "";
          var rate = status === 429 || /rate/i.test(String(msg));
          if (!rate || i >= delays.length) throw e;
          var wait = delays[i++]; return sleep(wait).then(attempt);
        });
    }
    return attempt();
  }

  return new Promise(function (resolve) {
    try {
      if (!options.skipCache) {
        var key = cache.generateKey(JSON.stringify(msgs), options);
        var cached = cache.get(key);
        if (cached) return resolve("[CACHED] " + cached);
      }
      inputTokens = Math.ceil(JSON.stringify(msgs).length / 3.5);
      var chatReq = buildChatRequest(model, msgs, {
        max_tokens: options.max_tokens || options.max_completion_tokens || 800,
        temperature: typeof options.temperature === "number" ? options.temperature : GPT5_CONFIG.DEFAULT_TEMPERATURE,
        top_p: options.top_p,
        frequency_penalty: options.frequency_penalty,
        presence_penalty: options.presence_penalty
      });
      circuitBreaker.execute(function () {
        return withBackoff(function () { return openai.chat.completions.create(chatReq); });
      }).then(function (completion) {
        var usage = g(completion, "usage", {});
        inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
        outputTokens = usage.output_tokens || usage.completion_tokens || 0;

        var out = safeExtractResponseText(completion, apiUsed);
        if (!out || out.length === 0) throw new Error("Empty response");

        var ms = Date.now() - start; var cost = logApiCall(model, apiUsed, inputTokens, outputTokens, ms, true);
        metrics.recordCall(model, true, inputTokens + outputTokens, cost, ms);

        if (!options.skipCache && out.length > 10 && out[0] !== "[") {
          var key2 = cache.generateKey(JSON.stringify(msgs), options); cache.set(key2, out);
        }
        resolve(out);
      }).catch(function (err) {
        var ms2 = Date.now() - start;
        var emsg = err && err.message ? err.message : String(err);
        logApiCall(model, apiUsed, inputTokens, outputTokens, ms2, false, emsg);
        metrics.recordCall(model, false, 0, 0, ms2, emsg);
        resolve("Service error (chat-with-memory). Details: " + emsg);
      });
    } catch (outer) {
      resolve("Service error (chat-with-memory). Details: " + (outer && outer.message ? outer.message : String(outer)));
    }
  });
}

// ---------- Quick helpers ----------
function getQuickNanoResponse(prompt, options) {
  var opts = options ? options : {};
  opts = Object.assign({}, opts, { model: GPT5_CONFIG.NANO_MODEL, reasoning_effort: "low", max_output_tokens: 6000 });
  return getGPT5Analysis(prompt, opts);
}
function getQuickMiniResponse(prompt, options) {
  var opts = options ? options : {};
  opts = Object.assign({}, opts, { model: GPT5_CONFIG.MINI_MODEL, reasoning_effort: "medium", max_output_tokens: 10000 });
  return getGPT5Analysis(prompt, opts);
}
function getDeepAnalysis(prompt, options) {
  var opts = options ? options : {};
  opts = Object.assign({}, opts, { model: GPT5_CONFIG.PRIMARY_MODEL, reasoning_effort: "high", max_output_tokens: 16000 });
  return getGPT5Analysis(prompt, opts);
}
function getChatResponse(prompt, options) {
  var opts = options ? options : {};
  opts = Object.assign({}, opts, { model: GPT5_CONFIG.CHAT_MODEL, max_tokens: 12000 });
  return getGPT5Analysis(prompt, opts);
}

// ---------- Health / Ops ----------
function testOpenAIConnection() {
  return getQuickNanoResponse("GPT-5 READY?", { max_output_tokens: 5, skipCache: true, temperature: 0 })
    .then(function (ok) {
      return { success: true, result: ok, model: GPT5_CONFIG.NANO_MODEL, gpt5Available: true, timestamp: new Date().toISOString() };
    })
    .catch(function (e) {
      return { success: false, error: e.message, gpt5Available: false, timestamp: new Date().toISOString() };
    });
}
function checkGPT5SystemHealth() {
  var health = { timestamp: new Date().toISOString(), gpt5Available: false, gpt5MiniAvailable: false, gpt5NanoAvailable: false, gpt5ChatAvailable: false, currentModel: null, circuitBreakerState: circuitBreaker.getState(), metrics: metrics.getStats(), cache: cache.getStats(), errors: [], recommendations: [], smartModelSelection: false };

  function probe(fn, name, model) {
    return fn("ok", { max_output_tokens: 5, skipCache: true, temperature: 0 })
      .then(function (r) { if (r && r.indexOf("[Empty") !== 0 && r.indexOf("[No message") !== 0) health[name] = true; })
      .catch(function (e) { health.errors.push(model + ": " + e.message); });
  }

  return Promise.resolve()
    .then(function(){ return probe(getQuickNanoResponse, "gpt5NanoAvailable", GPT5_CONFIG.NANO_MODEL); })
    .then(function(){ return probe(getQuickMiniResponse, "gpt5MiniAvailable", GPT5_CONFIG.MINI_MODEL); })
    .then(function(){ return probe(getDeepAnalysis, "gpt5Available", GPT5_CONFIG.PRIMARY_MODEL); })
    .then(function(){ return probe(getChatResponse, "gpt5ChatAvailable", GPT5_CONFIG.CHAT_MODEL); })
    .then(function(){
      if (health.gpt5Available) health.currentModel = GPT5_CONFIG.PRIMARY_MODEL;
      else if (health.gpt5MiniAvailable) health.currentModel = GPT5_CONFIG.MINI_MODEL;
      else if (health.gpt5NanoAvailable) health.currentModel = GPT5_CONFIG.NANO_MODEL;
      else if (health.gpt5ChatAvailable) health.currentModel = GPT5_CONFIG.CHAT_MODEL;
      health.overallHealth = Boolean(health.currentModel);

      try {
        var m1 = selectOptimalModel("hi", { reasoning_effort: "low" });
        var m2 = selectOptimalModel(new Array(3000).join("A"), { reasoning_effort: "low" });
        var m3 = selectOptimalModel("analyze and compare strategic options with detailed evaluation", { reasoning_effort: "high" });
        var distinct = {}; distinct[m1] = 1; distinct[m2] = 1; distinct[m3] = 1; var keys = Object.keys(distinct);
        health.smartModelSelection = keys.length >= 2 && (process.env.SMART_MODEL_SELECT !== "false");
      } catch (e) { health.errors.push("SmartSelect: " + e.message); }

      if (Number(health.metrics.successRate) < 95) health.recommendations.push("Success rate below 95% - check API key and quotas");
      if (health.circuitBreakerState === "OPEN") health.recommendations.push("Circuit breaker is OPEN - service degraded");
      if (health.cache.size === 0) health.recommendations.push("Cache is empty - cold start");
      if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) health.recommendations.push("Smart Model Selection disabled (SMART_MODEL_SELECT=false)");
      return health;
    });
}

// ---------- Admin / Stats ----------
function clearCache() { cache.clear(); return Promise.resolve({ success: true, message: "Cache cleared successfully" }); }
function resetMetrics() { metrics.reset(); return Promise.resolve({ success: true, message: "Metrics reset successfully" }); }
function getSystemStats() { return Promise.resolve({ metrics: metrics.getStats(), cache: cache.getStats(), circuitBreaker: { state: circuitBreaker.getState() }, models: GPT5_CONFIG.MODEL_CAPABILITIES, uptime: Date.now() - metrics.startTime }); }

// ---------- Exports ----------
module.exports = {
  // Core
  getGPT5Analysis,
  // Quick
  getQuickNanoResponse,
  getQuickMiniResponse,
  getDeepAnalysis,
  getChatResponse,
  // Memory-aware
  getGPT5AnalysisWithMemory,
  getChatWithMemory,
  attachMemoryToPrompt,
  attachMemoryToMessages,
  // Health & Ops
  testOpenAIConnection,
  checkGPT5SystemHealth,
  // Admin
  clearCache,
  resetMetrics,
  getSystemStats,
  // Utils
  selectOptimalModel,
  calculateCost,
  buildResponsesRequest,
  buildChatRequest,
  safeExtractResponseText,
  // Components
  metrics,
  cache,
  circuitBreaker,
  // Client & Config
  openai,
  GPT5_CONFIG
};
