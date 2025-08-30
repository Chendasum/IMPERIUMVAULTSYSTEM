// utils/openaiClient.js - GPT-5 Client (ASCII Safe, Node CJS)
// No Unicode emojis or smart quotes. Compatible with Node 16+ CommonJS.

'use strict';
require('dotenv').config();
const { OpenAI } = require('openai');
const crypto = require('crypto');

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
    const s = this.stats;
    s.totalCalls += 1;
    if (success) {
      s.successfulCalls += 1;
      s.totalTokensUsed += tokens;
      s.totalCost += cost;
      s.responseTimes.push(responseTime);
      const arr = s.responseTimes;
      s.averageResponseTime = arr.reduce((a, b) => a + b, 0) / arr.length;
      if (arr.length > 1000) s.responseTimes = arr.slice(-1000);
    } else {
      s.failedCalls += 1;
      if (error) s.errorTypes[error] = (s.errorTypes[error] || 0) + 1;
    }
    if (!s.modelUsageStats[model]) s.modelUsageStats[model] = { calls: 0, tokens: 0, cost: 0 };
    s.modelUsageStats[model].calls += 1;
    s.modelUsageStats[model].tokens += tokens;
    s.modelUsageStats[model].cost += cost;
  }
  getStats() {
    const s = this.stats;
    return {
      ...s,
      uptime: Date.now() - this.startTime,
      successRate: s.totalCalls > 0 ? ((s.successfulCalls / s.totalCalls) * 100).toFixed(2) : 0
    };
  }
  reset() { this.stats = new GPT5Metrics().stats; }
}

// --------------------------- Cache -------------------------------------------
class GPT5Cache {
  constructor(maxSize = 1000, ttl = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  generateKey(prompt, options) {
    const clean = { ...options };
    delete clean.skipCache;
    return crypto.createHash('sha256').update(String(prompt) + JSON.stringify(clean)).digest('hex');
  }
  get(key) {
    const it = this.cache.get(key);
    if (!it) return null;
    if (Date.now() - it.timestamp > this.ttl) { this.cache.delete(key); return null; }
    it.hits += 1; return it.data;
  }
  set(key, data) {
    if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, { data, timestamp: Date.now(), hits: 0 });
  }
  clear() { this.cache.clear(); }
  getStats() {
    let totalHits = 0, n = 0; for (const it of this.cache.values()) { totalHits += it.hits; n++; }
    return { size: this.cache.size, maxSize: this.maxSize, hitRate: n > 0 ? (totalHits / n).toFixed(2) : 0 };
  }
}

// ------------------------ Circuit Breaker ------------------------------------
class CircuitBreaker {
  constructor(threshold = 5, timeout = 20000) {
    this.threshold = threshold; this.timeout = timeout;
    this.failureCount = 0; this.lastFailureTime = 0; this.state = 'CLOSED';
  }
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) this.state = 'HALF_OPEN';
      else throw new Error('Circuit breaker is OPEN');
    }
    try { const r = await fn(); this.onSuccess(); return r; }
    catch (e) { this.onFailure(); throw e; }
  }
  onSuccess() { this.failureCount = 0; this.state = 'CLOSED'; }
  onFailure() { this.failureCount++; this.lastFailureTime = Date.now(); if (this.failureCount >= this.threshold) this.state = 'OPEN'; }
  getState() { return this.state; }
}

// ----------------------------- Init ------------------------------------------
const metrics = new GPT5Metrics();
const cache = new GPT5Cache();
const circuitBreaker = new CircuitBreaker();

if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 180000,
  maxRetries: 2,
  defaultHeaders: {
    'User-Agent': 'IMPERIUM-VAULT-GPT5/2.2.0',
    'X-Client-Version': '2.2.0',
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

// --------------------------- Utilities ---------------------------------------
function selectOptimalModel(prompt, options) {
  if (options && options.model) return options.model;
  if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) return GPT5_CONFIG.PRIMARY_MODEL;
  const text = String(prompt || '');
  const len = text.length;
  const hasComplex = GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS.some(k => text.toLowerCase().includes(k));
  if (len < GPT5_CONFIG.AUTO_SCALE.NANO_MAX_LENGTH && !hasComplex) return GPT5_CONFIG.NANO_MODEL;
  if (len < GPT5_CONFIG.AUTO_SCALE.MINI_MAX_LENGTH && !hasComplex) return GPT5_CONFIG.MINI_MODEL;
  if (hasComplex || (options && options.reasoning_effort === 'high')) return GPT5_CONFIG.PRIMARY_MODEL;
  return GPT5_CONFIG.MINI_MODEL;
}

function calculateCost(model, inputTokens, outputTokens) {
  const p = GPT5_CONFIG.MODEL_CAPABILITIES[model]?.pricing; if (!p) return 0;
  return (inputTokens * p.input) / 1000 + (outputTokens * p.output) / 1000;
}

function logApiCall(model, apiType, inputTokens, outputTokens, ms, success, error) {
  const cost = calculateCost(model, inputTokens, outputTokens);
  const logData = { timestamp: new Date().toISOString(), model, apiType, inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, cost: cost.toFixed(6), executionTime: ms, success, error: error ? String(error) : null, circuitBreakerState: circuitBreaker.getState() };
  console.log('[GPT5-API] ' + JSON.stringify(logData));
  return cost;
}

function safeExtractResponseText(completion, apiType) {
  try {
    if (apiType === 'responses') {
      if (typeof completion?.output_text === 'string') return completion.output_text.trim() || '[Empty response]';
      const maybe = completion?.output?.[0]?.content?.[0]?.text?.value;
      if (typeof maybe === 'string') return maybe.trim();
      const chatLike = completion?.choices?.[0]?.message?.content;
      if (chatLike) return String(chatLike).trim();
      return '[Unknown response structure]';
    }
    const msg = completion?.choices?.[0]?.message?.content;
    return msg ? String(msg).trim() : '[No message content]';
  } catch (e) { return '[Extraction error: ' + e.message + ']'; }
}

// --------------------------- Builders ----------------------------------------
function buildResponsesRequest(model, input, options) {
  const req = { model, input: String(input || '') };
  const effort = (options && options.reasoning_effort) || GPT5_CONFIG.DEFAULT_REASONING;
  if (GPT5_CONFIG.REASONING_EFFORTS.includes(effort)) req.reasoning = { effort };
  const asked = (options && (options.max_output_tokens || options.max_completion_tokens)) || 8000;
  req.max_output_tokens = Math.max(16, Math.min(asked, capFor(model)));
  if (options && typeof options.temperature === 'number') req.temperature = options.temperature;
  if (options && typeof options.top_p === 'number') req.top_p = options.top_p;
  if (options && typeof options.frequency_penalty === 'number') req.frequency_penalty = options.frequency_penalty;
  if (options && typeof options.presence_penalty === 'number') req.presence_penalty = options.presence_penalty;
  return req;
}

function buildChatRequest(model, messages, options) {
  const req = { model, messages };
  const asked = (options && (options.max_tokens || options.max_completion_tokens)) || 8000;
  req.max_tokens = Math.max(1, Math.min(asked, capFor(model)));
  if (options && typeof options.temperature === 'number') req.temperature = options.temperature;
  if (options && typeof options.top_p === 'number') req.top_p = options.top_p;
  if (options && typeof options.frequency_penalty === 'number') req.frequency_penalty = options.frequency_penalty;
  if (options && typeof options.presence_penalty === 'number') req.presence_penalty = options.presence_penalty;
  return req;
}

// --------------------------- Core --------------------------------------------
async function getGPT5Analysis(prompt, options = {}) {
  const start = Date.now();
  let inputTokens = 0, outputTokens = 0; let selectedModel = 'unknown'; let apiUsed = 'unknown';
  try {
    if (!prompt || typeof prompt !== 'string') throw new Error('Invalid prompt: must be non-empty string');
    let text = String(prompt);
    if (text.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) text = text.slice(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + '
... (truncated)';

    if (!options.skipCache) {
      const key = cache.generateKey(text, options); const cached = cache.get(key);
      if (cached) return '[CACHED] ' + cached;
    }

    selectedModel = selectOptimalModel(text, options);
    const useResponses = selectedModel.includes('gpt-5') && selectedModel !== GPT5_CONFIG.CHAT_MODEL;
    apiUsed = useResponses ? 'responses' : 'chat';

    inputTokens = Math.ceil(text.length / 3.5);

    const backoff = async (fn) => {
      const delays = [250, 750, 1500];
      for (let i = 0; i < delays.length; i++) {
        try { return await fn(); } catch (e) {
          const status = e && (e.status || (e.response && e.response.status));
          const msg = (e && e.response && e.response.data && e.response.data.error && e.response.data.error.message) || (e && e.message) || '';
          const rate = status === 429 || /rate/i.test(msg);
          if (!rate) throw e; await new Promise(r => setTimeout(r, delays[i]));
        }
      }
      return await fn();
    };

    const completion = await circuitBreaker.execute(async () => {
      if (useResponses) {
        const req = buildResponsesRequest(selectedModel, text, {
          reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
          max_output_tokens: options.max_output_tokens || options.max_completion_tokens || 8000,
          temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE
        });
        return backoff(() => openai.responses.create(req));
      } else {
        const req = buildChatRequest(selectedModel, [{ role: 'user', content: text }], {
          max_tokens: options.max_tokens || options.max_completion_tokens || 8000,
          temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE
        });
        return backoff(() => openai.chat.completions.create(req));
      }
    });

    const usage = completion && (completion.usage || {});
    inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
    outputTokens = usage.output_tokens || usage.completion_tokens || 0;

    const out = safeExtractResponseText(completion, apiUsed);
    if (!out || out.length === 0) throw new Error('Empty response');

    const ms = Date.now() - start; const cost = logApiCall(selectedModel, apiUsed, inputTokens, outputTokens, ms, true);
    metrics.recordCall(selectedModel, true, inputTokens + outputTokens, cost, ms);

    if (!options.skipCache && out.length > 10 && out[0] !== '[') {
      const key = cache.generateKey(text, options); cache.set(key, out);
    }

    return out;
  } catch (err) {
    const ms = Date.now() - start;
    const provider = (err && err.response && err.response.data && err.response.data.error && err.response.data.error.message) || null;
    const merged = provider ? (err.message + ' | Provider: ' + provider) : err.message;
    logApiCall(selectedModel, apiUsed, inputTokens, outputTokens, ms, false, merged);
    metrics.recordCall(selectedModel, false, 0, 0, ms, merged);

    // Fallback
    try {
      const fb = await openai.chat.completions.create({
        model: GPT5_CONFIG.FALLBACK_MODEL,
        messages: [{ role: 'user', content: String(prompt) }],
        max_tokens: Math.min(options.max_tokens || options.max_completion_tokens || 8000, capFor(GPT5_CONFIG.FALLBACK_MODEL)),
        temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE
      });
      const fbText = safeExtractResponseText(fb, 'chat');
      const u = fb.usage || {}; const fbOut = u.output_tokens || u.completion_tokens || 0;
      const cost = logApiCall(GPT5_CONFIG.FALLBACK_MODEL, 'chat', inputTokens, fbOut, Date.now() - start, true);
      metrics.recordCall(GPT5_CONFIG.FALLBACK_MODEL, true, inputTokens + fbOut, cost, Date.now() - start);
      return '[GPT-4o Fallback] ' + fbText;
    } catch (fbErr) {
      const fbMsg = (fbErr && fbErr.response && fbErr.response.data && fbErr.response.data.error && fbErr.response.data.error.message) || fbErr.message;
      return 'Service error. Details: ' + merged + '
Fallback Error: ' + fbMsg + '
Breaker: ' + circuitBreaker.getState();
    }
  }
}

// --------------------------- Helpers -----------------------------------------
async function getQuickNanoResponse(prompt, options) { return getGPT5Analysis(prompt, { ...(options||{}), model: GPT5_CONFIG.NANO_MODEL, reasoning_effort: 'low', max_output_tokens: capFor(GPT5_CONFIG.NANO_MODEL) }); }
async function getQuickMiniResponse(prompt, options) { return getGPT5Analysis(prompt, { ...(options||{}), model: GPT5_CONFIG.MINI_MODEL, reasoning_effort: 'medium', max_output_tokens: capFor(GPT5_CONFIG.MINI_MODEL) }); }
async function getDeepAnalysis(prompt, options) { return getGPT5Analysis(prompt, { ...(options||{}), model: GPT5_CONFIG.PRIMARY_MODEL, reasoning_effort: 'high', max_output_tokens: capFor(GPT5_CONFIG.PRIMARY_MODEL) }); }
async function getChatResponse(prompt, options) { return getGPT5Analysis(prompt, { ...(options||{}), model: GPT5_CONFIG.CHAT_MODEL, max_tokens: capFor(GPT5_CONFIG.CHAT_MODEL) }); }

// --------------------------- Health / Ops -------------------------------------
async function testOpenAIConnection() {
  try {
    const ok = await getQuickNanoResponse('GPT-5 READY?', { max_output_tokens: 5, skipCache: true, temperature: 0 });
    return { success: true, result: ok, model: GPT5_CONFIG.NANO_MODEL, gpt5Available: true, timestamp: new Date().toISOString() };
  } catch (e) {
    try {
      const fb = await openai.chat.completions.create({ model: GPT5_CONFIG.FALLBACK_MODEL, messages: [{ role: 'user', content: 'FALLBACK OK' }], max_tokens: 5, temperature: 0 });
      return { success: true, result: fb?.choices?.[0]?.message?.content, model: GPT5_CONFIG.FALLBACK_MODEL, gpt5Available: false, fallback: true, timestamp: new Date().toISOString() };
    } catch (fbErr) {
      return { success: false, error: e.message, fallbackError: fbErr.message, gpt5Available: false, timestamp: new Date().toISOString() };
    }
  }
}

async function checkGPT5SystemHealth() {
  const health = { timestamp: new Date().toISOString(), gpt5Available: false, gpt5MiniAvailable: false, gpt5NanoAvailable: false, gpt5ChatAvailable: false, fallbackWorking: false, currentModel: null, circuitBreakerState: circuitBreaker.getState(), metrics: metrics.getStats(), cache: cache.getStats(), errors: [], recommendations: [] };
  const tests = [
    { name: 'gpt5NanoAvailable', model: GPT5_CONFIG.NANO_MODEL, func: getQuickNanoResponse },
    { name: 'gpt5MiniAvailable', model: GPT5_CONFIG.MINI_MODEL, func: getQuickMiniResponse },
    { name: 'gpt5Available', model: GPT5_CONFIG.PRIMARY_MODEL, func: getDeepAnalysis },
    { name: 'gpt5ChatAvailable', model: GPT5_CONFIG.CHAT_MODEL, func: getChatResponse }
  ];
  for (const t of tests) {
    try { const r = await t.func('ok', { max_output_tokens: 5, skipCache: true, temperature: 0 }); if (r && !r.startsWith('[Empty') && !r.startsWith('[No message')) health[t.name] = true; }
    catch (e) { health.errors.push(t.model + ': ' + e.message); }
  }
  try { const fb = await openai.chat.completions.create({ model: GPT5_CONFIG.FALLBACK_MODEL, messages: [{ role: 'user', content: 'ok' }], max_tokens: 5, temperature: 0 }); if (fb && fb.choices && fb.choices[0] && fb.choices[0].message && fb.choices[0].message.content) health.fallbackWorking = true; } catch (e) { health.errors.push('Fallback: ' + e.message); }
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
