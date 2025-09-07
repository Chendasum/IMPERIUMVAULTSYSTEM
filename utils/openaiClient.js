// utils/openaiClient.js - Official GPT-5 Client (Production, MAX-Stream Edition)
// ═══════════════════════════════════════════════════════════════════════════
// Features:
// • Dual API (Responses + Chat), official GPT-5 params (reasoning, verbosity)
// • MAX stream + auto-continuations (no trim, no repeats)
// • Accurate cost calculation ($ per 1M tokens → per token)
// • Circuit breaker, cache, metrics, keep-alive HTTP agent
// • Backward-compatible exports for your existing bot
// ═══════════════════════════════════════════════════════════════════════════

"use strict";
require("dotenv").config();

const https = require("https");
const OpenAI = require("openai").OpenAI;
const crypto = require("crypto");

// ───────────────────────────────────────────────────────────────────────────
// Validation
// ───────────────────────────────────────────────────────────────────────────
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

console.log("🧠 Loading Official GPT-5 Client (MAX-Stream Edition)…");

// ───────────────────────────────────────────────────────────────────────────
// Utilities
// ───────────────────────────────────────────────────────────────────────────
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
  } catch (_) {
    return defaultValue;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Metrics
// ───────────────────────────────────────────────────────────────────────────
function MetricsCollector() {
  this.stats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    totalTokensUsed: 0,
    totalCost: 0,
    averageResponseTime: 0,
    apiUsageStats: { responses: 0, chat: 0, stream_ttft: 0 },
    modelUsageStats: {},
    errorTypes: {},
    responseTimes: [],
    lastReset: new Date().toISOString()
  };
  this.startTime = Date.now();
}

MetricsCollector.prototype._avg = function () {
  const times = this.stats.responseTimes;
  if (!times.length) return 0;
  return times.reduce(function (a, b) { return a + b; }, 0) / times.length;
};

MetricsCollector.prototype.recordCall = function (model, apiType, success, tokens, cost, responseTime, error) {
  const stats = this.stats;
  stats.totalCalls += 1;
  if (apiType) stats.apiUsageStats[apiType] = (stats.apiUsageStats[apiType] || 0) + 1;

  if (success) {
    stats.successfulCalls += 1;
    stats.totalTokensUsed += (tokens || 0);
    stats.totalCost += (cost || 0);
    if (typeof responseTime === "number") {
      stats.responseTimes.push(responseTime);
      if (stats.responseTimes.length > 1000) {
        stats.responseTimes = stats.responseTimes.slice(-1000);
      }
      stats.averageResponseTime = Math.round(this._avg());
    }
  } else {
    stats.failedCalls += 1;
    if (error) {
      const key = String(error);
      stats.errorTypes[key] = (stats.errorTypes[key] || 0) + 1;
    }
  }

  if (!stats.modelUsageStats[model]) {
    stats.modelUsageStats[model] = { calls: 0, tokens: 0, cost: 0 };
  }
  stats.modelUsageStats[model].calls += 1;
  stats.modelUsageStats[model].tokens += (tokens || 0);
  stats.modelUsageStats[model].cost += (cost || 0);
};

MetricsCollector.prototype.recordTTFT = function (ms) {
  // Use apiType "stream_ttft" bucket
  this.stats.apiUsageStats.stream_ttft += 1;
  // You can also push to responseTimesTTFT array if desired
};

MetricsCollector.prototype.getStats = function () {
  const s = this.stats;
  return {
    totalCalls: s.totalCalls,
    successfulCalls: s.successfulCalls,
    failedCalls: s.failedCalls,
    totalTokensUsed: s.totalTokensUsed,
    totalCost: parseFloat(s.totalCost.toFixed(6)),
    averageResponseTime: s.averageResponseTime,
    modelUsageStats: s.modelUsageStats,
    apiUsageStats: s.apiUsageStats,
    errorTypes: s.errorTypes,
    lastReset: s.lastReset,
    recentResponseTimes: s.responseTimes.slice(-10),
    uptime: Date.now() - this.startTime,
    successRate: s.totalCalls > 0 ? ((s.successfulCalls / s.totalCalls) * 100).toFixed(2) : "0.00"
  };
};

MetricsCollector.prototype.reset = function () {
  this.stats = new MetricsCollector().stats;
};

// ───────────────────────────────────────────────────────────────────────────
// Cache (LRU-ish FIFO)
// ───────────────────────────────────────────────────────────────────────────
function ResponseCache(maxSize, ttl) {
  this.cache = new Map();
  this.maxSize = Number(maxSize || 1000);
  this.ttl = Number(ttl || 3600000);
}

ResponseCache.prototype.generateKey = function (prompt, options, apiType) {
  const clean = {};
  if (options) {
    for (const k in options) {
      if (Object.prototype.hasOwnProperty.call(options, k) && k !== "skipCache" && k !== "onDelta") {
        clean[k] = options[k];
      }
    }
  }
  return crypto.createHash("sha256")
    .update(safeString(prompt) + JSON.stringify(clean) + safeString(apiType))
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
  this.cache.set(key, { data: data, timestamp: Date.now(), hits: 0 });
};

ResponseCache.prototype.clear = function () { this.cache.clear(); };

ResponseCache.prototype.getStats = function () {
  let totalHits = 0, count = 0;
  for (const item of this.cache.values()) {
    totalHits += (item.hits || 0);
    count++;
  }
  return {
    size: this.cache.size,
    maxSize: this.maxSize,
    hitRate: count > 0 ? (totalHits / count).toFixed(2) : "0.00"
  };
};

// ───────────────────────────────────────────────────────────────────────────
// Circuit Breaker
// ───────────────────────────────────────────────────────────────────────────
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
      .then(function (r) { self.onSuccess(); resolve(r); })
      .catch(function (e) { self.onFailure(); reject(e); });
  });
};

CircuitBreaker.prototype.onSuccess = function () {
  this.failureCount = 0;
  this.state = "CLOSED";
};

CircuitBreaker.prototype.onFailure = function () {
  this.failureCount++;
  this.lastFailureTime = Date.now();
  if (this.failureCount >= this.failureThreshold) this.state = "OPEN";
};

CircuitBreaker.prototype.getState = function () { return this.state; };

// ───────────────────────────────────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────────────────────────────────
const GPT5_CONFIG = {
  PRIMARY_MODEL: process.env.GPT5_PRIMARY_MODEL || "gpt-5",
  MINI_MODEL: process.env.GPT5_MINI_MODEL || "gpt-5-mini",
  NANO_MODEL: process.env.GPT5_NANO_MODEL || "gpt-5-nano",

  MAX_OUTPUT_TOKENS: 16384,
  CONTEXT_WINDOW: 400000,
  MAX_PROMPT_LENGTH: 350000,

  REASONING_EFFORTS: ["minimal", "low", "medium", "high"],
  DEFAULT_REASONING: "medium",

  VERBOSITY_LEVELS: ["low", "medium", "high"],
  DEFAULT_VERBOSITY: "medium",

  DEFAULT_TEMPERATURE: 0.7,

  MODEL_PRICING: {
    // $ per 1,000,000 tokens
    "gpt-5":      { input: 1.25,  output: 10.0 },
    "gpt-5-mini": { input: 0.25,  output: 2.0  },
    "gpt-5-nano": { input: 0.05,  output: 0.40 }
  },

  DUAL_API: {
    ENABLED: process.env.GPT5_DUAL_API !== "false",
    RESPONSES_FOR_REASONING: true,
    CHAT_FOR_SIMPLE: true,
    CHAT_THRESHOLD: 100
  },

  AUTO_SCALE: {
    ENABLED: process.env.SMART_MODEL_SELECT !== "false",
    NANO_MAX_LENGTH: 2000,
    MINI_MAX_LENGTH: 10000,
    COMPLEXITY_KEYWORDS: ["analyze", "compare", "evaluate", "research", "complex", "detailed", "comprehensive", "reason", "step-by-step"]
  }
};

// ───────────────────────────────────────────────────────────────────────────
// OpenAI client (with keep-alive agent)
// ───────────────────────────────────────────────────────────────────────────
const keepAliveAgent = new https.Agent({ keepAlive: true, maxSockets: 64 });

const metrics = new MetricsCollector();
const cache = new ResponseCache(process.env.OPENAI_CACHE_MAX || 1000, process.env.OPENAI_CACHE_TTL_MS || 3600000);
const circuitBreaker = new CircuitBreaker(process.env.OPENAI_CB_FAILS || 5, process.env.OPENAI_CB_COOLDOWN_MS || 30000);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: Number(process.env.OPENAI_TIMEOUT_MS || 120000),
  maxRetries: Number(process.env.OPENAI_SDK_MAX_RETRIES || 2),
  httpAgent: keepAliveAgent,
  defaultHeaders: {
    "User-Agent": "GPT5-IMPERIUM-VAULT/1.0.0",
    "X-Client-Version": "1.0.0-gpt5",
    "X-Environment": process.env.NODE_ENV || "development"
  }
});

// ───────────────────────────────────────────────────────────────────────────
// Smart selection
// ───────────────────────────────────────────────────────────────────────────
function selectOptimalModel(prompt, options) {
  options = options || {};
  if (options.model) return options.model;

  const text = safeString(prompt);
  const len = text.length;

  if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) return GPT5_CONFIG.PRIMARY_MODEL;

  const lower = text.toLowerCase();
  const complex = GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS.some(function (k) { return lower.indexOf(k) !== -1; });

  if (options.reasoning_effort === "high") return GPT5_CONFIG.PRIMARY_MODEL;

  if (len < GPT5_CONFIG.AUTO_SCALE.NANO_MAX_LENGTH && !complex) return GPT5_CONFIG.NANO_MODEL;
  if (len < GPT5_CONFIG.AUTO_SCALE.MINI_MAX_LENGTH && !complex) return GPT5_CONFIG.MINI_MODEL;
  return GPT5_CONFIG.PRIMARY_MODEL;
}

function selectOptimalAPI(prompt, model, options) {
  if (!GPT5_CONFIG.DUAL_API.ENABLED) return "chat";
  const text = safeString(prompt);
  const reasoning = options && options.reasoning_effort ? options.reasoning_effort : GPT5_CONFIG.DEFAULT_REASONING;

  if (text.length < GPT5_CONFIG.DUAL_API.CHAT_THRESHOLD || reasoning === "minimal") return "chat";
  if (reasoning === "medium" || reasoning === "high") return "responses";
  return "chat";
}

// ───────────────────────────────────────────────────────────────────────────
// Cost math (FIXED: prices are per 1M tokens)
// ───────────────────────────────────────────────────────────────────────────
function calculateCost(model, inputTokens, outputTokens) {
  const p = GPT5_CONFIG.MODEL_PRICING[model];
  if (!p) return 0;
  const inCost = (inputTokens * p.input) / 1e6;
  const outCost = (outputTokens * p.output) / 1e6;
  return inCost + outCost;
}

function logApiCall(model, apiType, inputTokens, outputTokens, responseTime, success, error) {
  const cost = calculateCost(model, inputTokens || 0, outputTokens || 0);
  const payload = {
    timestamp: new Date().toISOString(),
    model: model,
    apiType: apiType,
    inputTokens: inputTokens || 0,
    outputTokens: outputTokens || 0,
    totalTokens: (inputTokens || 0) + (outputTokens || 0),
    cost: Number(cost.toFixed(8)),
    responseTime: responseTime,
    success: !!success,
    error: error ? String(error) : null,
    circuitBreakerState: circuitBreaker.getState()
  };
  console.log("[GPT5-API]", JSON.stringify(payload));
  return cost;
}

// ───────────────────────────────────────────────────────────────────────────
// Retry with backoff (rate limits)
// ───────────────────────────────────────────────────────────────────────────
function withExponentialBackoff(operation) {
  const delays = [500, 1500, 3000];
  let i = 0;

  function attempt() {
    return Promise.resolve().then(operation).catch(function (error) {
      const status = safeGet(error, "status", null) || safeGet(error, "response.status", null);
      const message = safeGet(error, "message", "") || safeGet(error, "response.data.error.message", "");
      const isRate = status === 429 || /rate.*limit/i.test(message);
      if (!isRate || i >= delays.length) throw error;
      const d = delays[i++];
      console.log("[GPT5-RETRY] Waiting " + d + "ms before retry (attempt " + i + ")");
      return sleep(d).then(attempt);
    });
  }

  return attempt();
}

// ───────────────────────────────────────────────────────────────────────────
// Request builders
// ───────────────────────────────────────────────────────────────────────────
function buildResponsesRequest(model, input, options) {
  const req = { model: model, input: safeString(input) };
  const reasoning = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  if (GPT5_CONFIG.REASONING_EFFORTS.indexOf(reasoning) !== -1) req.reasoning = { effort: reasoning };
  const verbosity = options.verbosity || GPT5_CONFIG.DEFAULT_VERBOSITY;
  if (GPT5_CONFIG.VERBOSITY_LEVELS.indexOf(verbosity) !== -1) req.text = { verbosity: verbosity };
  const maxTokens = options.max_output_tokens || options.max_completion_tokens || 8000;
  req.max_output_tokens = Math.min(maxTokens, GPT5_CONFIG.MAX_OUTPUT_TOKENS);
  if (typeof options.temperature === "number") req.temperature = options.temperature;
  return req;
}

function buildChatRequest(model, messages, options) {
  const req = { model: model, messages: messages };
  const maxTokens = options.max_tokens || options.max_completion_tokens || 8000;
  req.max_completion_tokens = Math.min(maxTokens, GPT5_CONFIG.MAX_OUTPUT_TOKENS);
  if (options.reasoning_effort) req.reasoning = { effort: options.reasoning_effort };
  if (options.verbosity) req.text = { verbosity: options.verbosity };
  if (typeof options.temperature === "number") req.temperature = options.temperature;
  if (typeof options.top_p === "number") req.top_p = options.top_p;
  if (typeof options.frequency_penalty === "number") req.frequency_penalty = options.frequency_penalty;
  if (typeof options.presence_penalty === "number") req.presence_penalty = options.presence_penalty;
  return req;
}

// ───────────────────────────────────────────────────────────────────────────
// Response extraction
// ───────────────────────────────────────────────────────────────────────────
function extractResponseText(completion, apiType) {
  try {
    if (apiType === "responses") {
      const content =
        safeGet(completion, "output_text", null) ||
        safeGet(completion, "output.0.content.0.text.value", null) ||
        safeGet(completion, "choices.0.message.content", null);
      return content ? String(content).trim() : "[No content in response]";
    } else {
      const content = safeGet(completion, "choices.0.message.content", null);
      return content ? String(content).trim() : "[No message content]";
    }
  } catch (e) {
    return "[Extraction error: " + e.message + "]";
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Core non-stream call
// ───────────────────────────────────────────────────────────────────────────
function getGPT5Response(prompt, options) {
  options = options || {};
  const t0 = Date.now();
  let inputTokens = 0;
  let outputTokens = 0;
  let selectedModel = "unknown";
  let selectedAPI = "unknown";

  return new Promise(function (resolve) {
    try {
      if (!prompt || typeof prompt !== "string") throw new Error("Invalid prompt: must be non-empty string");

      let text = safeString(prompt);
      if (text.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) {
        text = text.slice(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + "\n... (truncated)";
      }

      selectedModel = selectOptimalModel(text, options);
      selectedAPI = selectOptimalAPI(text, selectedModel, options);

      if (!options.skipCache) {
        const key = cache.generateKey(text, options, selectedAPI);
        const hit = cache.get(key);
        if (hit) {
          console.log("[GPT5-CACHE] Cache hit for " + selectedModel + "/" + selectedAPI);
          return resolve("[CACHED] " + hit);
        }
      }

      console.log("[GPT5-SELECT] Model: " + selectedModel + ", API: " + selectedAPI);

      inputTokens = Math.ceil(text.length / 4);

      circuitBreaker.execute(function () {
        return withExponentialBackoff(function () {
          if (selectedAPI === "responses") {
            const req = buildResponsesRequest(selectedModel, text, options);
            return openai.responses.create(req);
          } else {
            const msgs = [{ role: "user", content: text }];
            const req = buildChatRequest(selectedModel, msgs, options);
            return openai.chat.completions.create(req);
          }
        });
      }).then(function (completion) {
        const content = extractResponseText(completion, selectedAPI);
        if (!content || content.indexOf("[No ") === 0 || content.indexOf("[Extraction") === 0) {
          throw new Error("Empty or invalid response");
        }

        const usage = safeGet(completion, "usage", {});
        inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
        outputTokens = usage.output_tokens || usage.completion_tokens || 0;

        const dt = Date.now() - t0;
        const cost = logApiCall(selectedModel, selectedAPI, inputTokens, outputTokens, dt, true);
        metrics.recordCall(selectedModel, selectedAPI, true, inputTokens + outputTokens, cost, dt);

        if (!options.skipCache && content.length > 10 && content.indexOf("[CACHED]") !== 0) {
          const key = cache.generateKey(text, options, selectedAPI);
          cache.set(key, content);
        }

        resolve(content);
      }).catch(function (error) {
        const dt = Date.now() - t0;
        const msg = safeGet(error, "message", String(error));
        logApiCall(selectedModel, selectedAPI, inputTokens, outputTokens, dt, false, msg);
        metrics.recordCall(selectedModel, selectedAPI, false, 0, 0, dt, msg);
        resolve("GPT-5 Error: " + msg);
      });

    } catch (outer) {
      const msg = safeGet(outer, "message", String(outer));
      resolve("GPT-5 Error: " + msg);
    }
  });
}

// ───────────────────────────────────────────────────────────────────────────
// Memory helpers
// ───────────────────────────────────────────────────────────────────────────
function attachMemoryToPrompt(prompt, memory) {
  memory = memory || {};
  const pre = memory.systemPreamble ? String(memory.systemPreamble).trim() : "";
  const recalls = Array.isArray(memory.recall) ? memory.recall : [];
  let enhanced = "";

  if (pre) enhanced += "SYSTEM CONTEXT:\n" + pre + "\n\n";
  if (recalls.length > 0) {
    enhanced += "MEMORY CONTEXT:\n";
    for (let i = 0; i < recalls.length; i++) {
      enhanced += "- " + String(recalls[i]) + "\n";
    }
    enhanced += "\n";
  }
  enhanced += "USER REQUEST:\n" + safeString(prompt);
  return enhanced;
}

function getGPT5ResponseWithMemory(prompt, memory, options) {
  return getGPT5Response(attachMemoryToPrompt(prompt, memory), options || {});
}

// ───────────────────────────────────────────────────────────────────────────
// Specialized quick/detailed helpers
// ───────────────────────────────────────────────────────────────────────────
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

// ───────────────────────────────────────────────────────────────────────────
// MAX STREAMERS (no-cut + auto-continuations)
// ───────────────────────────────────────────────────────────────────────────

// Responses API streamer (preferred for reasoning)
async function getGPT5MaxStream(prompt, options, onDelta) {
  options = options || {};
  const model = options.model || GPT5_CONFIG.MINI_MODEL;
  const maxOut = options.max_output_tokens || 8192;
  const chains = Number(options.max_chains || 8);
  const delayBetween = Number(options.delay_between_chains_ms || 250);
  const reasoning = options.reasoning_effort || "high";
  const verbosity = options.verbosity || "high";
  const t0 = Date.now();

  let allText = "";
  let input = safeString(prompt);
  let turn = 0;
  let sentFirst = false;

  while (turn < chains) {
    const stream = await openai.responses.stream({
      model: model,
      input: input,
      reasoning: { effort: reasoning },
      text: { verbosity: verbosity },
      max_output_tokens: Math.min(maxOut, GPT5_CONFIG.MAX_OUTPUT_TOKENS)
    });

    let partial = "";

    for await (const ev of stream) {
      if (ev.type === "response.output_text.delta") {
        const chunk = safeString(ev.delta);
        partial += chunk;
        allText += chunk;
        if (!sentFirst) {
          metrics.recordTTFT(Date.now() - t0);
          sentFirst = true;
        }
        if (onDelta) {
          try { await onDelta(chunk); } catch (_) {}
        }
      }
    }

    const finalResp = await stream.finalResponse();
    // Try to capture usage for cost
    const usage = safeGet(finalResp, "usage", {});
    const inTok = usage.input_tokens || 0;
    const outTok = usage.output_tokens || 0;
    const dt = Date.now() - t0;
    const cost = logApiCall(model, "responses", inTok, outTok, dt, true);
    metrics.recordCall(model, "responses", true, inTok + outTok, cost, dt);

    const stopReason =
      safeGet(finalResp, "stop_reason", null) ||
      safeGet(finalResp, "output[0].stop_reason", null) ||
      safeGet(finalResp, "choices.0.finish_reason", null) || null;

    const status = safeGet(finalResp, "status", "");
    const hitLimit = (stopReason === "max_output_tokens" || stopReason === "length");
    const incomplete = status === "incomplete";

    if (hitLimit || incomplete) {
      input = safeString(prompt)
        + "\n\nASSISTANT (PARTIAL):\n" + partial
        + "\n\nUSER:\nContinue exactly from where you stopped. Do not repeat. Keep the same format and numbering.";
      turn += 1;
      if (delayBetween) await sleep(delayBetween);
      continue;
    }

    break; // finished naturally
  }

  return allText;
}

// Chat API streamer (used when router selects chat)
async function getGPT5MaxChatStream(messages, options, onDelta) {
  options = options || {};
  const model = options.model || GPT5_CONFIG.MINI_MODEL;
  const maxOut = options.max_completion_tokens || 8192;
  const reasoning = options.reasoning_effort || "high";
  const verbosity = options.verbosity || "high";
  const chains = Number(options.max_chains || 8);
  const delayBetween = Number(options.delay_between_chains_ms || 250);
  const t0 = Date.now();

  let allText = "";
  let turn = 0;
  let sentFirst = false;
  let thread = Array.isArray(messages) ? messages.slice() : [{ role: "user", content: safeString(messages) }];

  while (turn < chains) {
    const stream = await openai.chat.completions.create({
      model: model,
      messages: thread,
      reasoning: { effort: reasoning },
      text: { verbosity: verbosity },
      max_completion_tokens: Math.min(maxOut, GPT5_CONFIG.MAX_OUTPUT_TOKENS),
      stream: true
    });

    let partial = "";

    for await (const chunk of stream) {
      const delta = safeGet(chunk, "choices.0.delta.content", "");
      if (delta) {
        partial += delta;
        allText += delta;
        if (!sentFirst) {
          metrics.recordTTFT(Date.now() - t0);
          sentFirst = true;
        }
        if (onDelta) {
          try { await onDelta(delta); } catch (_) {}
        }
      }
    }

    // Heuristic continuation: if we produced a large chunk, chain once more unless user turned chains off
    const shouldChain = partial && partial.length > (maxOut * 3); // rough guard for long outputs
    if (shouldChain && turn < chains - 1) {
      thread.push({ role: "assistant", content: partial });
      thread.push({ role: "user", content: "Continue exactly from where you stopped. Do not repeat." });
      turn += 1;
      if (delayBetween) await sleep(delayBetween);
      continue;
    }

    break;
  }

  // We do not have explicit usage from streamed Chat in this loop—log minimal
  const dt = Date.now() - t0;
  logApiCall(model, "chat", 0, 0, dt, true);
  metrics.recordCall(model, "chat", true, 0, 0, dt);

  return allText;
}

// Router for MAX mode (keeps your auto-select logic)
async function getGPT5MaxUncut(input, options, onDelta) {
  options = options || {};
  const model = selectOptimalModel(input, options);
  const api = selectOptimalAPI(input, model, options);

  if (!options.reasoning_effort) options.reasoning_effort = "high";
  if (!options.verbosity) options.verbosity = "high";

  if (api === "responses") {
    return getGPT5MaxStream(input, Object.assign({}, options, { model: model }), onDelta);
  } else {
    const messages = Array.isArray(input) ? input : [{ role: "user", content: safeString(input) }];
    return getGPT5MaxChatStream(messages, Object.assign({}, options, { model: model }), onDelta);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Health & testing
// ───────────────────────────────────────────────────────────────────────────
function testGPT5Connection() {
  return getQuickGPT5Response("Respond with 'GPT-5 READY' if operational.", {
    max_output_tokens: 10,
    skipCache: true,
    reasoning_effort: "minimal"
  }).then(function (res) {
    return { success: true, result: res, model: GPT5_CONFIG.NANO_MODEL, gpt5Available: true, timestamp: new Date().toISOString() };
  }).catch(function (err) {
    return { success: false, error: err.message, gpt5Available: false, timestamp: new Date().toISOString() };
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
    return getGPT5Response("Test", { model: model, max_output_tokens: 5, skipCache: true, reasoning_effort: "minimal" })
      .then(function (r) { if (r && r.indexOf("GPT-5 Error:") !== 0) health[label] = true; })
      .catch(function (e) { health.errors.push(model + ": " + e.message); });
  }

  return Promise.all([
    testModel(GPT5_CONFIG.PRIMARY_MODEL, "gpt5Available"),
    testModel(GPT5_CONFIG.MINI_MODEL, "gpt5MiniAvailable"),
    testModel(GPT5_CONFIG.NANO_MODEL, "gpt5NanoAvailable")
  ]).then(function () {
    if (health.gpt5Available) health.currentModel = GPT5_CONFIG.PRIMARY_MODEL;
    else if (health.gpt5MiniAvailable) health.currentModel = GPT5_CONFIG.MINI_MODEL;
    else if (health.gpt5NanoAvailable) health.currentModel = GPT5_CONFIG.NANO_MODEL;

    health.overallHealth = Boolean(health.currentModel);
    health.responsesAPIAvailable = health.gpt5Available || health.gpt5MiniAvailable;
    health.chatAPIAvailable = health.gpt5NanoAvailable || health.gpt5MiniAvailable;

    if (Number(health.metrics.successRate) < 95) health.recommendations.push("Success rate below 95% - check API key and quotas");
    if (health.circuitBreakerState === "OPEN") health.recommendations.push("Circuit breaker is OPEN - service degraded");
    if (health.cache.size === 0) health.recommendations.push("Cache is empty - consider warming up");
    if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) health.recommendations.push("Smart model selection disabled");
    if (!GPT5_CONFIG.DUAL_API.ENABLED) health.recommendations.push("Dual API mode disabled - missing optimization");

    return health;
  });
}

// ───────────────────────────────────────────────────────────────────────────
// Admin / stats
// ───────────────────────────────────────────────────────────────────────────
function clearGPT5Cache() { cache.clear(); return Promise.resolve({ success: true, message: "GPT-5 cache cleared successfully" }); }
function resetGPT5Metrics() { metrics.reset(); return Promise.resolve({ success: true, message: "GPT-5 metrics reset successfully" }); }
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

// ───────────────────────────────────────────────────────────────────────────
// Exports
// ───────────────────────────────────────────────────────────────────────────
module.exports = {
  // Core non-stream
  getGPT5Response,
  getGPT5ResponseWithMemory,

  // Specialized helpers
  getQuickGPT5Response,
  getDetailedGPT5Analysis,
  getEfficientGPT5Response,

  // Memory helpers
  attachMemoryToPrompt,

  // MAX streamers
  getGPT5MaxUncut,
  getGPT5MaxStream,
  getGPT5MaxChatStream,

  // Health & admin
  testGPT5Connection,
  checkGPT5SystemHealth,
  clearGPT5Cache,
  resetGPT5Metrics,
  getGPT5SystemStats,

  // Utils / builders
  selectOptimalModel,
  selectOptimalAPI,
  calculateCost,
  buildResponsesRequest,
  buildChatRequest,
  extractResponseText,

  // Components
  metrics,
  cache,
  circuitBreaker,
  openai,

  // Backward-compat aliases
  getGPT5Analysis: getGPT5Response,
  getGPT5AnalysisWithMemory: getGPT5ResponseWithMemory,
  getQuickNanoResponse: getQuickGPT5Response,
  getQuickMiniResponse: getEfficientGPT5Response,
  getDeepAnalysis: getDetailedGPT5Analysis,
  getChatResponse: getGPT5Response,
  getChatWithMemory: getGPT5ResponseWithMemory,
  testOpenAIConnection: testGPT5Connection,
  checkGPT5SystemHealth: checkGPT5SystemHealth,
  clearCache: clearGPT5Cache,
  resetMetrics: resetGPT5Metrics,
  getSystemStats: getGPT5SystemStats,
  attachMemoryToMessages: attachMemoryToPrompt,

  // Config
  GPT5_CONFIG
};

// ───────────────────────────────────────────────────────────────────────────
// Startup banner
// ───────────────────────────────────────────────────────────────────────────
console.log("");
console.log("🧠 ═══════════════════════════════════════════════════════════════");
console.log("   OFFICIAL GPT-5 CLIENT LOADED (MAX-STREAM EDITION)");
console.log("   ═══════════════════════════════════════════════════════════════");
console.log("");
console.log("✅ OFFICIAL GPT-5 MODELS:");
console.log("   🧠 Primary: " + GPT5_CONFIG.PRIMARY_MODEL + " ($" + GPT5_CONFIG.MODEL_PRICING["gpt-5"].input + "/$" + GPT5_CONFIG.MODEL_PRICING["gpt-5"].output + " per 1M tokens)");
console.log("   ⚡ Mini:    " + GPT5_CONFIG.MINI_MODEL + " ($" + GPT5_CONFIG.MODEL_PRICING["gpt-5-mini"].input + "/$" + GPT5_CONFIG.MODEL_PRICING["gpt-5-mini"].output + " per 1M tokens)");
console.log("   🔹 Nano:    " + GPT5_CONFIG.NANO_MODEL + " ($" + GPT5_CONFIG.MODEL_PRICING["gpt-5-nano"].input + "/$" + GPT5_CONFIG.MODEL_PRICING["gpt-5-nano"].output + " per 1M tokens)");
console.log("");
console.log("🚀 FEATURES:");
console.log("   • Dual API (Responses + Chat)");
console.log("   • MAX streaming + auto-continuations (no cuts)");
console.log("   • Reasoning effort & verbosity");
console.log("   • 400K context, 16K output");
console.log("   • Circuit breaker, cache, metrics");
console.log("   • Keep-alive HTTP agent");
console.log("");
console.log("✅ GPT-5 CLIENT READY FOR PRODUCTION");
console.log("🧠 ═══════════════════════════════════════════════════════════════");
console.log("");
