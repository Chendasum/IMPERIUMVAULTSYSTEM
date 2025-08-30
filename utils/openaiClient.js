// utils/openaiClient.js - Master Executive Daily 10/10 Edition (Aug 2025)
// Goal: rock-solid, production-ready OpenAI client for GPT-5 family.
// Design: CommonJS, ASCII-only, zero external assumptions, strict compatibility.
// Public API (compatible with your previous code):
//   getGPT5Analysis(prompt, opts)
//   getQuickNanoResponse(prompt, opts)
//   getQuickMiniResponse(prompt, opts)
//   getDeepAnalysis(prompt, opts)
//   getChatResponse(prompt, opts)
//   testOpenAIConnection()
//   checkGPT5SystemHealth()
//   clearCache(), resetMetrics(), getSystemStats()
//   selectOptimalModel(), calculateCost(), buildResponsesRequest(), buildChatRequest(), safeExtractResponseText()
//   exports: metrics, cache, circuitBreaker, openai, GPT5_CONFIG

'use strict';
require('dotenv').config();
const { OpenAI } = require('openai');
const crypto = require('crypto');

// --------------------------- Guards -------------------------------------------
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

// --------------------------- Utilities ----------------------------------------
function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

// --------------------------- Metrics -----------------------------------------
class GPT5Metrics {
  constructor() {
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
  recordCall(model, success, tokens, cost, responseTime, error) {
    var s = this.stats;
    s.totalCalls += 1;
    if (success) {
      s.successfulCalls += 1;
      s.totalTokensUsed += tokens;
      s.totalCost += cost;
      s.responseTimes.push(responseTime);
      var arr = s.responseTimes;
      s.averageResponseTime = arr.reduce(function(a,b){return a+b;},0) / arr.length;
      if (arr.length > 1000) s.responseTimes = arr.slice(-1000);
    } else {
      s.failedCalls += 1;
      if (error) s.errorTypes[String(error)] = (s.errorTypes[String(error)] || 0) + 1;
    }
    if (!s.modelUsageStats[model]) s.modelUsageStats[model] = { calls: 0, tokens: 0, cost: 0 };
    s.modelUsageStats[model].calls += 1;
    s.modelUsageStats[model].tokens += tokens;
    s.modelUsageStats[model].cost += cost;
  }
  getStats() {
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
      successRate: s.totalCalls > 0 ? ((s.successfulCalls / s.totalCalls) * 100).toFixed(2) : '0.00'
    };
  }
  reset() { this.stats = new GPT5Metrics().stats; }
}

// --------------------------- Cache -------------------------------------------
class GPT5Cache {
  constructor(maxSize, ttl) {
    this.cache = new Map();
    this.maxSize = Number(maxSize || 1000);
    this.ttl = Number(ttl || 3600000);
  }
  generateKey(prompt, options) {
    var clean = Object.assign({}, options || {});
    delete clean.skipCache;
    return crypto.createHash('sha256').update(String(prompt) + JSON.stringify(clean)).digest('hex');
  }
  get(key) {
    var it = this.cache.get(key);
    if (!it) return null;
    if (Date.now() - it.timestamp > this.ttl) { this.cache.delete(key); return null; }
    it.hits = (it.hits || 0) + 1; return it.data;
  }
  set(key, data) {
    if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, { data: data, timestamp: Date.now(), hits: 0 });
  }
  clear() { this.cache.clear(); }
  getStats() {
    var totalHits = 0, n = 0; for (var v of this.cache.values()) { totalHits += (v.hits||0); n++; }
    return { size: this.cache.size, maxSize: this.maxSize, hitRate: n>0 ? (totalHits/n).toFixed(2) : '0.00' };
  }
}

// ------------------------ Circuit Breaker ------------------------------------
class CircuitBreaker {
  constructor(threshold, timeout) {
    this.threshold = Number(threshold || 5);
    this.timeout = Number(timeout || 20000);
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    try { var r = await fn(); this.onSuccess(); return r; }
    catch (e) { this.onFailure(); throw e; }
  }
  onSuccess() { this.failureCount = 0; this.state = 'CLOSED'; }
  onFailure() { this.failureCount++; this.lastFailureTime = Date.now(); if (this.failureCount >= this.threshold) this.state = 'OPEN'; }
  getState() { return this.state; }
}

// ----------------------------- Client ----------------------------------------
const metrics = new GPT5Metrics();
const cache = new GPT5Cache(process.env.OPENAI_CACHE_MAX, process.env.OPENAI_CACHE_TTL_MS);
const circuitBreaker = new CircuitBreaker(process.env.OPENAI_CB_FAILS, process.env.OPENAI_CB_COOLDOWN_MS);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: Number(process.env.OPENAI_TIMEOUT_MS || 180000),
  maxRetries: Number(process.env.OPENAI_SDK_MAX_RETRIES || 2),
  defaultHeaders: {
    'User-Agent': 'IMPERIUM-VAULT-GPT5/2.3.0',
    'X-Client-Version': '2.3.0',
    'X-Environment': process.env.NODE_ENV || 'development'
  }
});

// ----------------------------- Config ----------------------------------------
const GPT5_CONFIG = {
  PRIMARY_MODEL: process.env.GPT5_PRIMARY_MODEL || 'gpt-5',
  MINI_MODEL: process.env.GPT5_MINI_MODEL || 'gpt-5-mini',
  NANO_MODEL: process.env.GPT5_NANO_MODEL || 'gpt-5-nano',
  CHAT_MODEL: process.env.GPT5_CHAT_MODEL || 'gpt-5-chat-latest',
  FALLBACK_MODEL: process.env.FALLBACK_CHAT_MODEL || 'gpt-4o',

  MAX_OUTPUT_TOKENS: 16384,
  MAX_PROMPT_LENGTH: 180000,

  REASONING_EFFORTS: ['low','medium','high'],
  DEFAULT_REASONING: 'medium',
  DEFAULT_TEMPERATURE: 0.7,

  MODEL_CAPABILITIES: {
    'gpt-5': { maxTokens: 16384, pricing: { input: 0.01, output: 0.03 } },
    'gpt-5-mini': { maxTokens: 8192, pricing: { input: 0.005, output: 0.015 } },
    'gpt-5-nano': { maxTokens: 4096, pricing: { input: 0.003, output: 0.008 } },
    'gpt-5-chat-latest': { maxTokens: 16384, pricing: { input: 0.01, output: 0.03 } },
    'gpt-4o': { maxTokens: 8192, pricing: { input: 0.005, output: 0.015 } }
  },

  AUTO_SCALE: {
    ENABLED: process.env.SMART_MODEL_SELECT !== 'false',
    NANO_MAX_LENGTH: 2000,
    MINI_MAX_LENGTH: 10000,
    COMPLEXITY_KEYWORDS: ['analyze','compare','evaluate','research','complex','detailed','comprehensive']
  }
};

function capFor(model) { return GPT5_CONFIG.MODEL_CAPABILITIES[model]?.maxTokens || 4096; }

// --------------------------- Model Select ------------------------------------
function selectOptimalModel(prompt, options) {
  if (options && options.model) return options.model;
  if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) return GPT5_CONFIG.PRIMARY_MODEL;
  var text = String(prompt || '');
  var len = text.length;
  var hasComplex = GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS.some(function(k){ return text.toLowerCase().includes(k); });
  if (len < GPT5_CONFIG.AUTO_SCALE.NANO_MAX_LENGTH && !hasComplex) return GPT5_CONFIG.NANO_MODEL;
  if (len < GPT5_CONFIG.AUTO_SCALE.MINI_MAX_LENGTH && !hasComplex) return GPT5_CONFIG.MINI_MODEL;
  if (hasComplex || (options && options.reasoning_effort === 'high')) return GPT5_CONFIG.PRIMARY_MODEL;
  return GPT5_CONFIG.MINI_MODEL;
}

// --------------------------- Cost + Logs --------------------------------------
function calculateCost(model, inputTokens, outputTokens) {
  var p = GPT5_CONFIG.MODEL_CAPABILITIES[model] && GPT5_CONFIG.MODEL_CAPABILITIES[model].pricing; if (!p) return 0;
  return (inputTokens * p.input) / 1000 + (outputTokens * p.output) / 1000;
}
function logApiCall(model, apiType, inputTokens, outputTokens, ms, success, error) {
  var cost = calculateCost(model, inputTokens, outputTokens);
  var logData = { timestamp: new Date().toISOString(), model: model, apiType: apiType, inputTokens: inputTokens, outputTokens: outputTokens, totalTokens: inputTokens + outputTokens, cost: cost.toFixed(6), executionTime: ms, success: success, error: error ? String(error) : null, circuitBreakerState: circuitBreaker.getState() };
  console.log('[GPT5-API] ' + JSON.stringify(logData));
  return cost;
}

// --------------------------- Extraction ---------------------------------------
function safeExtractResponseText(completion, apiType) {
  try {
    if (apiType === 'responses') {
      if (typeof completion?.output_text === 'string') return completion.output_text.trim() || '[Empty response]';
      var maybe = completion && completion.output && completion.output[0] && completion.output[0].content && completion.output[0].content[0] && completion.output[0].content[0].text && completion.output[0].content[0].text.value;
      if (typeof maybe === 'string') return maybe.trim();
      var chatLike = completion && completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content;
      if (chatLike) return String(chatLike).trim();
      return '[Unknown response structure]';
    }
    var msg = completion && completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content;
    return msg ? String(msg).trim() : '[No message content]';
  } catch (e) { return '[Extraction error: ' + e.message + ']'; }
}

// --------------------------- Builders -----------------------------------------
function buildResponsesRequest(model, input, options) {
  var req = { model: model, input: String(input || '') };
  var effort = (options && options.reasoning_effort) || GPT5_CONFIG.DEFAULT_REASONING;
  if (GPT5_CONFIG.REASONING_EFFORTS.indexOf(effort) >= 0) req.reasoning = { effort: effort };
  var asked = (options && (options.max_output_tokens || options.max_completion_tokens)) || 8000;
  req.max_output_tokens = Math.max(16, Math.min(asked, capFor(model)));
  if (options && typeof options.temperature === 'number') req.temperature = options.temperature;
  if (options && typeof options.top_p === 'number') req.top_p = options.top_p;
  if (options && typeof options.frequency_penalty === 'number') req.frequency_penalty = options.frequency_penalty;
  if (options && typeof options.presence_penalty === 'number') req.presence_penalty = options.presence_penalty;
  return req;
}

function buildChatRequest(model, messages, options) {
  var req = { model: model, messages: messages };
  var asked = (options && (options.max_tokens || options.max_completion_tokens)) || 8000;
  req.max_tokens = Math.max(1, Math.min(asked, capFor(model)));
  if (options && typeof options.temperature === 'number') req.temperature = options.temperature;
  if (options && typeof options.top_p === 'number') req.top_p = options.top_p;
  if (options && typeof options.frequency_penalty === 'number') req.frequency_penalty = options.frequency_penalty;
  if (options && typeof options.presence_penalty === 'number') req.presence_penalty = options.presence_penalty;
  return req;
}

// --------------------------- Core --------------------------------------------
async function getGPT5Analysis(prompt, options) {
  options = options || {};
  var start = Date.now();
  var inputTokens = 0, outputTokens = 0; var selectedModel = 'unknown'; var apiUsed = 'unknown';
  try {
    if (!prompt || typeof prompt !== 'string') throw new Error('Invalid prompt: must be non-empty string');
    var text = String(prompt);
    if (text.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) text = text.slice(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + '\n... (truncated)';

    if (!options.skipCache) {
      var key = cache.generateKey(text, options); var cached = cache.get(key);
      if (cached) return '[CACHED] ' + cached;
    }

    selectedModel = selectOptimalModel(text, options);
    var useResponses = selectedModel.indexOf('gpt-5') >= 0 && selectedModel !== GPT5_CONFIG.CHAT_MODEL;
    apiUsed = useResponses ? 'responses' : 'chat';

    inputTokens = Math.ceil(text.length / 3.5);

    async function withBackoff(fn) {
      var delays = [250, 750, 1500];
      for (var i=0; i<delays.length; i++) {
        try { return await fn(); }
        catch (e) {
          var status = e && (e.status || (e.response && e.response.status));
          var msg = (e && e.response && e.response.data && e.response.data.error && e.response.data.error.message) || (e && e.message) || '';
          var rate = status === 429 || /rate/i.test(String(msg));
          if (!rate) throw e; await sleep(delays[i]);
        }
      }
      return fn();
    }

    var completion = await circuitBreaker.execute(async function(){
      if (useResponses) {
        var req = buildResponsesRequest(selectedModel, text, {
          reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
          max_output_tokens: options.max_output_tokens || options.max_completion_tokens || 8000,
          temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE
        });
        return withBackoff(function(){ return openai.responses.create(req); });
      } else {
        var messages = [{ role: 'user', content: text }];
        var chatReq = buildChatRequest(selectedModel, messages, {
          max_tokens: options.max_tokens || options.max_completion_tokens || 8000,
          temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE
        });
        return withBackoff(function(){ return openai.chat.completions.create(chatReq); });
      }
    });

    var usage = completion && (completion.usage || {});
    inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
    outputTokens = usage.output_tokens || usage.completion_tokens || 0;

    var out = safeExtractResponseText(completion, apiUsed);
    if (!out || out.length === 0) throw new Error('Empty response');

    var ms = Date.now() - start; var cost = logApiCall(selectedModel, apiUsed, inputTokens, outputTokens, ms, true);
    metrics.recordCall(selectedModel, true, inputTokens + outputTokens, cost, ms);

    if (!options.skipCache && out.length > 10 && out[0] !== '[') {
      var k2 = cache.generateKey(text, options); cache.set(k2, out);
    }

    return out;
  } catch (err) {
    var ms2 = Date.now() - start;
    var provider = (err && err.response && err.response.data && err.response.data.error && err.response.data.error.message) || null;
    var merged = provider ? (err.message + ' | Provider: ' + provider) : err.message;
    logApiCall(selectedModel, apiUsed, inputTokens, outputTokens, ms2, false, merged);
    metrics.recordCall(selectedModel, false, 0, 0, ms2, merged);

    // Fallback to chat model
    try {
      var fb = await openai.chat.completions.create({
        model: GPT5_CONFIG.FALLBACK_MODEL,
        messages: [{ role: 'user', content: String(prompt) }],
        max_tokens: Math.min(options.max_tokens || options.max_completion_tokens || 8000, capFor(GPT5_CONFIG.FALLBACK_MODEL)),
        temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE
      });
      var fbText = safeExtractResponseText(fb, 'chat');
      var u = fb.usage || {}; var fbOut = u.output_tokens || u.completion_tokens || 0;
      var cost2 = logApiCall(GPT5_CONFIG.FALLBACK_MODEL, 'chat', inputTokens, fbOut, Date.now() - start, true);
      metrics.recordCall(GPT5_CONFIG.FALLBACK_MODEL, true, inputTokens + fbOut, cost2, Date.now() - start);
      return '[GPT-4o Fallback] ' + fbText;
    } catch (fbErr) {
      var fbMsg = (fbErr && fbErr.response && fbErr.response.data && fbErr.response.data.error && fbErr.response.data.error.message) || fbErr.message;
      return 'Service error. Details: ' + merged + '\nFallback Error: ' + fbMsg + '\nBreaker: ' + circuitBreaker.getState();
    }
  }
}

// --------------------------- Quick Helpers ------------------------------------
async function getQuickNanoResponse(prompt, options) { return getGPT5Analysis(prompt, Object.assign({}, options || {}, { model: GPT5_CONFIG.NANO_MODEL, reasoning_effort: 'low', max_output_tokens: capFor(GPT5_CONFIG.NANO_MODEL) })); }
async function getQuickMiniResponse(prompt, options) { return getGPT5Analysis(prompt, Object.assign({}, options || {}, { model: GPT5_CONFIG.MINI_MODEL, reasoning_effort: 'medium', max_output_tokens: capFor(GPT5_CONFIG.MINI_MODEL) })); }
async function getDeepAnalysis(prompt, options) { return getGPT5Analysis(prompt, Object.assign({}, options || {}, { model: GPT5_CONFIG.PRIMARY_MODEL, reasoning_effort: 'high', max_output_tokens: capFor(GPT5_CONFIG.PRIMARY_MODEL) })); }
async function getChatResponse(prompt, options) { return getGPT5Analysis(prompt, Object.assign({}, options || {}, { model: GPT5_CONFIG.CHAT_MODEL, max_tokens: capFor(GPT5_CONFIG.CHAT_MODEL) })); }

// --------------------------- Health / Ops -------------------------------------
async function testOpenAIConnection() {
  try {
    var ok = await getQuickNanoResponse('GPT-5 READY?', { max_output_tokens: 5, skipCache: true, temperature: 0 });
    return { success: true, result: ok, model: GPT5_CONFIG.NANO_MODEL, gpt5Available: true, timestamp: new Date().toISOString() };
  } catch (e) {
    try {
      var fb = await openai.chat.completions.create({ model: GPT5_CONFIG.FALLBACK_MODEL, messages: [{ role: 'user', content: 'FALLBACK OK' }], max_tokens: 5, temperature: 0 });
      return { success: true, result: fb && fb.choices && fb.choices[0] && fb.choices[0].message && fb.choices[0].message.content, model: GPT5_CONFIG.FALLBACK_MODEL, gpt5Available: false, fallback: true, timestamp: new Date().toISOString() };
    } catch (fbErr) {
      return { success: false, error: e.message, fallbackError: fbErr.message, gpt5Available: false, timestamp: new Date().toISOString() };
    }
  }
}

async function checkGPT5SystemHealth() {
  var health = { timestamp: new Date().toISOString(), gpt5Available: false, gpt5MiniAvailable: false, gpt5NanoAvailable: false, gpt5ChatAvailable: false, fallbackWorking: false, currentModel: null, circuitBreakerState: circuitBreaker.getState(), metrics: metrics.getStats(), cache: cache.getStats(), errors: [], recommendations: [] };
  var tests = [
    { name: 'gpt5NanoAvailable', model: GPT5_CONFIG.NANO_MODEL, func: getQuickNanoResponse },
    { name: 'gpt5MiniAvailable', model: GPT5_CONFIG.MINI_MODEL, func: getQuickMiniResponse },
    { name: 'gpt5Available', model: GPT5_CONFIG.PRIMARY_MODEL, func: getDeepAnalysis },
    { name: 'gpt5ChatAvailable', model: GPT5_CONFIG.CHAT_MODEL, func: getChatResponse }
  ];
  for (var i=0; i<tests.length; i++) {
    var t = tests[i];
    try { var r = await t.func('ok', { max_output_tokens: 5, skipCache: true, temperature: 0 }); if (r && r.indexOf('[Empty') !== 0 && r.indexOf('[No message') !== 0) health[t.name] = true; }
    catch (e) { health.errors.push(t.model + ': ' + e.message); }
  }
  try { var fb = await openai.chat.completions.create({ model: GPT5_CONFIG.FALLBACK_MODEL, messages: [{ role: 'user', content: 'ok' }], max_tokens: 5, temperature: 0 }); if (fb && fb.choices && fb.choices[0] && fb.choices[0].message && fb.choices[0].message.content) health.fallbackWorking = true; } catch (e) { health.errors.push('Fallback: ' + e.message); }
  if (health.gpt5Available) health.currentModel = GPT5_CONFIG.PRIMARY_MODEL; else if (health.gpt5MiniAvailable) health.currentModel = GPT5_CONFIG.MINI_MODEL; else if (health.gpt5NanoAvailable) health.currentModel = GPT5_CONFIG.NANO_MODEL; else if (health.gpt5ChatAvailable) health.currentModel = GPT5_CONFIG.CHAT_MODEL; else if (health.fallbackWorking) health.currentModel = GPT5_CONFIG.FALLBACK_MODEL;
  health.overallHealth = Boolean(health.currentModel);
  if (Number(health.metrics.successRate) < 95) health.recommendations.push('Success rate below 95% - check API key and quotas');
  if (health.circuitBreakerState === 'OPEN') health.recommendations.push('Circuit breaker is OPEN - service degraded');
  if (health.cache.size === 0) health.recommendations.push('Cache is empty - cold start');
  if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) health.recommendations.push('Smart Model Selection disabled (SMART_MODEL_SELECT=false)');
  return health;
}

// --------------------------- Admin / Stats ------------------------------------
async function clearCache() { cache.clear(); return { success: true, message: 'Cache cleared successfully' }; }
async function resetMetrics() { metrics.reset(); return { success: true, message: 'Metrics reset successfully' }; }
async function getSystemStats() { return { metrics: metrics.getStats(), cache: cache.getStats(), circuitBreaker: { state: circuitBreaker.getState() }, models: GPT5_CONFIG.MODEL_CAPABILITIES, uptime: Date.now() - metrics.startTime }; }

// --------------------------- Exports ------------------------------------------
module.exports = {
  // Core
  getGPT5Analysis,
  // Quick
  getQuickNanoResponse,
  getQuickMiniResponse,
  getDeepAnalysis,
  getChatResponse,
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
