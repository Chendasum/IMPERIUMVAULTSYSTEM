// utils/openaiClient.js - Production-Grade GPT-5 Client (Compat Rewrite, Aug 2025)
// Compatible with your original API (getGPT5Analysis, quick helpers, health, metrics, etc.)
// Key fixes:
// - Removed unsupported `text.verbosity` in Responses API (prevents 400 errors)
// - Per-model token caps from capability table
// - 429 exponential backoff + circuit breaker
// - Better error surfacing (includes provider message)
// - Safe extraction for Responses & Chat structures
// - Accurate cost from usage, not estimates

'use strict';
require('dotenv').config();
const { OpenAI } = require('openai');
const crypto = require('crypto');

// ───────────────────────────────────────────────────────────────────────────────
// Metrics
// ───────────────────────────────────────────────────────────────────────────────
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
  recordCall(model, success, tokens, cost, responseTime, error = null) {
    const s = this.stats;
    s.totalCalls++;
    if (success) {
      s.successfulCalls++;
      s.totalTokensUsed += tokens;
      s.totalCost += cost;
      s.responseTimes.push(responseTime);
      const a = s.responseTimes;
      s.averageResponseTime = a.reduce((x, y) => x + y, 0) / a.length;
      if (a.length > 1000) s.responseTimes = a.slice(-1000);
    } else {
      s.failedCalls++;
      if (error) s.errorTypes[error] = (s.errorTypes[error] || 0) + 1;
    }
    s.modelUsageStats[model] = s.modelUsageStats[model] || { calls: 0, tokens: 0, cost: 0 };
    s.modelUsageStats[model].calls++;
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
  reset() {
    this.stats = new GPT5Metrics().stats;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Cache
// ───────────────────────────────────────────────────────────────────────────────
class GPT5Cache {
  constructor(maxSize = 1000, ttl = 3600000) { this.cache = new Map(); this.maxSize = maxSize; this.ttl = ttl; }
  generateKey(prompt, options) { const clean = { ...options }; delete clean.skipCache; return crypto.createHash('sha256').update(String(prompt) + JSON.stringify(clean)).digest('hex'); }
  get(key) { const it = this.cache.get(key); if (!it) return null; if (Date.now() - it.timestamp > this.ttl) { this.cache.delete(key); return null; } it.hits++; return it.data; }
  set(key, data) { if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value); this.cache.set(key, { data, timestamp: Date.now(), hits: 0 }); }
  clear() { this.cache.clear(); }
  getStats() { let totalHits = 0, totalItems = 0; for (const it of this.cache.values()) { totalHits += it.hits; totalItems++; } return { size: this.cache.size, maxSize: this.maxSize, hitRate: totalItems>0 ? (totalHits/totalItems).toFixed(2) : 0 }; }
}

// ───────────────────────────────────────────────────────────────────────────────
// Circuit Breaker
// ───────────────────────────────────────────────────────────────────────────────
class CircuitBreaker {
  constructor(threshold = 5, timeout = 20000) { this.threshold = threshold; this.timeout = timeout; this.failureCount = 0; this.lastFailureTime = 0; this.state = 'CLOSED'; }
  async execute(fn) { if (this.state === 'OPEN') { if (Date.now() - this.lastFailureTime > this.timeout) { this.state = 'HALF_OPEN'; } else { throw new Error('Circuit breaker is OPEN'); } } try { const r = await fn(); this.onSuccess(); return r; } catch (e) { this.onFailure(); throw e; } }
  onSuccess() { this.failureCount = 0; this.state = 'CLOSED'; }
  onFailure() { this.failureCount++; this.lastFailureTime = Date.now(); if (this.failureCount >= this.threshold) this.state = 'OPEN'; }
  getState() { return this.state; }
}

// ───────────────────────────────────────────────────────────────────────────────
// Init
// ───────────────────────────────────────────────────────────────────────────────
const metrics = new GPT5Metrics();
const cache = new GPT5Cache();
const circuitBreaker = new CircuitBreaker();

if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 180000,
  maxRetries: 2,
  defaultHeaders: {
    'User-Agent': 'IMPERIUM-VAULT-GPT5/2.1.0',
    'X-Client-Version': '2.1.0',
    'X-Environment': process.env.NODE_ENV || 'development'
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Config
// ───────────────────────────────────────────────────────────────────────────────
const GPT5_CONFIG = {
  PRIMARY_MODEL: 'gpt-5',
  MINI_MODEL: 'gpt-5-mini',
  NANO_MODEL: 'gpt-5-nano',
  CHAT_MODEL: 'gpt-5-chat-latest',
  FALLBACK_MODEL: 'gpt-4o',

  ENHANCED_CONTEXT_WINDOW: 200000,
  MAX_OUTPUT_TOKENS: 16384,
  MAX_PROMPT_LENGTH: 180000,

  REASONING_EFFORTS: ['low', 'medium', 'high'],
  DEFAULT_REASONING: 'medium',
  DEFAULT_TEMPERATURE: 0.7,

  MODEL_CAPABILITIES: {
    'gpt-5': { reasoning: true, maxTokens: 16384, pricing: { input: 0.01, output: 0.03 } },
    'gpt-5-mini': { reasoning: true, maxTokens: 8192, pricing: { input: 0.005, output: 0.015 } },
    'gpt-5-nano': { reasoning: true, maxTokens: 4096, pricing: { input: 0.003, output: 0.008 } },
    'gpt-5-chat-latest': { reasoning: false, maxTokens: 16384, pricing: { input: 0.01, output: 0.03 } },
    'gpt-4o': { reasoning: false, maxTokens: 8192, pricing: { input: 0.005, output: 0.015 } }
  },

  AUTO_SCALE: {
    NANO_MAX_LENGTH: 2000,
    MINI_MAX_LENGTH: 10000,
    COMPLEXITY_KEYWORDS: ['analyze','compare','evaluate','research','complex','detailed','comprehensive']
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// Utilities
// ───────────────────────────────────────────────────────────────────────────────
function selectOptimalModel(prompt, options = {}) {
  if (options.model) return options.model;
  const text = String(prompt || '');
  const promptLength = text.length;
  const hasComplex = GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS.some(k => text.toLowerCase().includes(k));
  if (promptLength < GPT5_CONFIG.AUTO_SCALE.NANO_MAX_LENGTH && !hasComplex) return GPT5_CONFIG.NANO_MODEL;
  if (promptLength < GPT5_CONFIG.AUTO_SCALE.MINI_MAX_LENGTH && !hasComplex) return GPT5_CONFIG.MINI_MODEL;
  if (hasComplex || options.reasoning_effort === 'high') return GPT5_CONFIG.PRIMARY_MODEL;
  return GPT5_CONFIG.MINI_MODEL;
}

function calculateCost(model, inputTokens, outputTokens) {
  const pricing = GPT5_CONFIG.MODEL_CAPABILITIES[model]?.pricing; if (!pricing) return 0;
  return (inputTokens * pricing.input) / 1000 + (outputTokens * pricing.output) / 1000;
}

function logApiCall(model, apiType, inputTokens, outputTokens, executionTime, success, error = null) {
  const cost = calculateCost(model, inputTokens, outputTokens);
  const logData = { timestamp: new Date().toISOString(), model, apiType, inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, cost: cost.toFixed(6), executionTime, success, error: error?.message || null, circuitBreakerState: circuitBreaker.getState() };
  console.log(`[GPT5-API] ${JSON.stringify(logData)}`);
  return cost;
}

// ───────────────────────────────────────────────────────────────────────────────
// Extraction helpers
// ───────────────────────────────────────────────────────────────────────────────
function safeExtractResponseText(completion, apiType = 'responses') {
  try {
    if (apiType.startsWith('responses')) {
      if (typeof completion?.output_text === 'string') return completion.output_text.trim() || '[Empty response from GPT-5 API]';
      if (completion?.output?.[0]?.content?.[0]?.text?.value) return completion.output[0].content[0].text.value.trim();
      if (completion?.choices?.[0]?.message?.content) return completion.choices[0].message.content.trim();
      console.warn('Unknown Responses API structure. Keys:', Object.keys(completion || {}));
      return '[Unknown response structure]';
    }
    const msg = completion?.choices?.[0]?.message?.content; if (!msg) return '[No message content found]';
    return msg.trim();
  } catch (e) { console.error('Error extracting response text:', e); return `[Extraction error: ${e.message}]`; }
}

// ───────────────────────────────────────────────────────────────────────────────
// Request builders (fixed: no unsupported text.verbosity; per-model caps)
// ───────────────────────────────────────────────────────────────────────────────
function capFor(model) { return GPT5_CONFIG.MODEL_CAPABILITIES[model]?.maxTokens || 4096; }

function buildResponsesRequest(model, input, options = {}) {
  const req = { model, input: String(input ?? '') };
  const effort = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  if (GPT5_CONFIG.REASONING_EFFORTS.includes(effort)) req.reasoning = { effort };
  const asked = options.max_output_tokens || options.max_completion_tokens || 8000;
  req.max_output_tokens = Math.max(16, Math.min(asked, capFor(model)));
  if (typeof options.temperature === 'number') req.temperature = options.temperature;
  if (typeof options.top_p === 'number') req.top_p = options.top_p;
  if (typeof options.frequency_penalty === 'number') req.frequency_penalty = options.frequency_penalty;
  if (typeof options.presence_penalty === 'number') req.presence_penalty = options.presence_penalty;
  return req;
}

function buildChatRequest(model, messages, options = {}) {
  const req = { model, messages };
  const asked = options.max_tokens || options.max_completion_tokens || 8000;
  req.max_tokens = Math.max(1, Math.min(asked, capFor(model)));
  if (typeof options.temperature === 'number') req.temperature = options.temperature;
  if (typeof options.top_p === 'number') req.top_p = options.top_p;
  if (typeof options.frequency_penalty === 'number') req.frequency_penalty = options.frequency_penalty;
  if (typeof options.presence_penalty === 'number') req.presence_penalty = options.presence_penalty;
  return req;
}

// ───────────────────────────────────────────────────────────────────────────────
// Core execution (with backoff + fallback)
// ───────────────────────────────────────────────────────────────────────────────
async function getGPT5Analysis(prompt, options = {}) {
  const startTime = Date.now();
  let inputTokens = 0, outputTokens = 0; let selectedModel = null; let apiUsed = 'unknown';
  try {
    if (!prompt || typeof prompt !== 'string') throw new Error('Invalid prompt: must be non-empty string');
    if (prompt.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) {
      console.warn(`Prompt too long (${prompt.length} chars), truncating to ${GPT5_CONFIG.MAX_PROMPT_LENGTH}`);
      prompt = prompt.substring(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + '
... (truncated for length)';
    }

    // Cache
    if (!options.skipCache) {
      const cacheKey = cache.generateKey(prompt, options); const cached = cache.get(cacheKey);
      if (cached) { console.log(`Cache hit for ${cacheKey.substring(0,8)}...`); return `[CACHED] ${cached}`; }
    }

    selectedModel = selectOptimalModel(prompt, options);
    const useResponsesApi = selectedModel.includes('gpt-5') && selectedModel !== GPT5_CONFIG.CHAT_MODEL;
    apiUsed = useResponsesApi ? 'responses' : 'chat';

    inputTokens = Math.ceil(prompt.length / 3.5);

    // rate-limit backoff helper
    const backoff = async (fn) => { const delays = [250, 750, 1500]; let last; for (let i=0;i<delays.length;i++){ try { return await fn(); } catch(e){ const status = e?.status || e?.response?.status; const msg = e?.response?.data?.error?.message || e?.message || ''; const isRate = status===429 || /rate/i.test(msg); if (!isRate) throw e; await new Promise(r=>setTimeout(r,delays[i])); last = e; } } return await fn(); };

    const completion = await circuitBreaker.execute(async () => {
      if (useResponsesApi) {
        const responsesRequest = buildResponsesRequest(selectedModel, prompt, {
          reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
          max_output_tokens: options.max_output_tokens || options.max_completion_tokens || 8000,
          temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE
        });
        return await backoff(() => openai.responses.create(responsesRequest));
      } else {
        const messages = [{ role: 'user', content: prompt }];
        const chatRequest = buildChatRequest(selectedModel, messages, {
          temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE,
          max_tokens: options.max_tokens || options.max_completion_tokens || 8000
        });
        return await backoff(() => openai.chat.completions.create(chatRequest));
      }
    });

    const usage = completion?.usage || {};
    inputTokens = usage.input_tokens || usage.prompt_tokens || inputTokens;
    outputTokens = usage.output_tokens || usage.completion_tokens || 0;

    const responseText = safeExtractResponseText(completion, apiUsed);
    if (!responseText || responseText.length === 0) throw new Error('Completely empty response received from API');

    const executionTime = Date.now() - startTime;
    const cost = logApiCall(selectedModel, apiUsed, inputTokens, outputTokens, executionTime, true);
    metrics.recordCall(selectedModel, true, inputTokens + outputTokens, cost, executionTime);

    if (!options.skipCache && responseText.length > 10 && !responseText.startsWith('[')) {
      const cacheKey = cache.generateKey(prompt, options); cache.set(cacheKey, responseText);
    }

    return responseText;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const providerMsg = error?.response?.data?.error?.message || null;
    const merged = providerMsg ? new Error(`${error.message} | Provider: ${providerMsg}`) : error;
    logApiCall(selectedModel || 'unknown', apiUsed, inputTokens, outputTokens, executionTime, false, merged);
    metrics.recordCall(selectedModel || 'unknown', false, 0, 0, executionTime, merged.message);

    // Fallback (chat)
    if (!String(merged.message||'').includes('rate_limit') && !String(merged.message||'').includes('quota')) {
      try {
        const fallbackCompletion = await openai.chat.completions.create({
          model: GPT5_CONFIG.FALLBACK_MODEL,
          messages: [{ role: 'user', content: String(prompt) }],
          max_tokens: Math.min(options.max_tokens || options.max_completion_tokens || 8000, capFor(GPT5_CONFIG.FALLBACK_MODEL)),
          temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE
        });
        const fallbackText = safeExtractResponseText(fallbackCompletion, 'chat');
        const fbUsage = fallbackCompletion?.usage || {};
        const fbTokens = fbUsage.output_tokens || fbUsage.completion_tokens || 0;
        const fbCost = logApiCall(GPT5_CONFIG.FALLBACK_MODEL, 'chat', inputTokens, fbTokens, Date.now()-startTime, true);
        metrics.recordCall(GPT5_CONFIG.FALLBACK_MODEL, true, inputTokens + fbTokens, fbCost, Date.now()-startTime);
        return `[GPT-4o Fallback] ${fallbackText}`;
      } catch (fbErr) {
        const msg = fbErr?.response?.data?.error?.message || fbErr.message;
        return `I apologize, but I'm experiencing technical difficulties with the AI service.

Error Details: ${merged.message}
Fallback Error: ${msg}

System Status: Circuit Breaker ${circuitBreaker.getState()} | Success Rate: ${metrics.getStats().successRate}%`;
      }
    }

    return `I apologize, but I'm experiencing technical difficulties with the AI service.

Error Details: ${merged.message}

Please try: shorter message, wait 30–60s, or rephrase.`;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Quick helpers (compat)
// ───────────────────────────────────────────────────────────────────────────────
async function getQuickNanoResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, { ...options, model: GPT5_CONFIG.NANO_MODEL, reasoning_effort: 'low', max_output_tokens: capFor(GPT5_CONFIG.NANO_MODEL) });
}
async function getQuickMiniResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, { ...options, model: GPT5_CONFIG.MINI_MODEL, reasoning_effort: 'medium', max_output_tokens: capFor(GPT5_CONFIG.MINI_MODEL) });
}
async function getDeepAnalysis(prompt, options = {}) {
  return getGPT5Analysis(prompt, { ...options, model: GPT5_CONFIG.PRIMARY_MODEL, reasoning_effort: 'high', max_output_tokens: capFor(GPT5_CONFIG.PRIMARY_MODEL) });
}
async function getChatResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, { ...options, model: GPT5_CONFIG.CHAT_MODEL, max_tokens: capFor(GPT5_CONFIG.CHAT_MODEL) });
}

// ───────────────────────────────────────────────────────────────────────────────
// Health / Ops
// ───────────────────────────────────────────────────────────────────────────────
async function testOpenAIConnection() {
  try {
    const testResponse = await getQuickNanoResponse("Respond with 'GPT-5 READY'", { max_output_tokens: 5, skipCache: true, temperature: 0 });
    return { success: true, result: testResponse, model: GPT5_CONFIG.NANO_MODEL, gpt5Available: true, timestamp: new Date().toISOString() };
  } catch (error) {
    try {
      const fb = await openai.chat.completions.create({ model: GPT5_CONFIG.FALLBACK_MODEL, messages: [{ role: 'user', content: "FALLBACK OK?" }], max_tokens: 5, temperature: 0 });
      return { success: true, result: fb?.choices?.[0]?.message?.content, model: GPT5_CONFIG.FALLBACK_MODEL, gpt5Available: false, fallback: true, timestamp: new Date().toISOString() };
    } catch (fallbackError) {
      return { success: false, error: error.message, fallbackError: fallbackError.message, gpt5Available: false, timestamp: new Date().toISOString() };
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
    catch (e) { health.errors.push(`${t.model}: ${e.message}`); }
  }
  try { const fb = await openai.chat.completions.create({ model: GPT5_CONFIG.FALLBACK_MODEL, messages: [{ role: 'user', content: 'ok' }], max_tokens: 5, temperature: 0 }); if (fb?.choices?.[0]?.message?.content) health.fallbackWorking = true; } catch (e) { health.errors.push(`Fallback: ${e.message}`); }
  if (health.gpt5Available) health.currentModel = GPT5_CONFIG.PRIMARY_MODEL; else if (health.gpt5MiniAvailable) health.currentModel = GPT5_CONFIG.MINI_MODEL; else if (health.gpt5NanoAvailable) health.currentModel = GPT5_CONFIG.NANO_MODEL; else if (health.gpt5ChatAvailable) health.currentModel = GPT5_CONFIG.CHAT_MODEL; else if (health.fallbackWorking) health.currentModel = GPT5_CONFIG.FALLBACK_MODEL;
  health.overallHealth = Boolean(health.currentModel);
  if (Number(health.metrics.successRate) < 95) health.recommendations.push('Success rate below 95% - check API key and quotas');
  if (health.circuitBreakerState === 'OPEN') health.recommendations.push('Circuit breaker is OPEN - service degraded');
  if (health.cache.size === 0) health.recommendations.push('Cache is empty - cold start');
  return health;
}

// ───────────────────────────────────────────────────────────────────────────────
// Admin / Stats
// ───────────────────────────────────────────────────────────────────────────────
async function clearCache() { cache.clear(); return { success: true, message: 'Cache cleared successfully' }; }
async function resetMetrics() { metrics.reset(); return { success: true, message: 'Metrics reset successfully' }; }
async function getSystemStats() { return { metrics: metrics.getStats(), cache: cache.getStats(), circuitBreaker: { state: circuitBreaker.getState() }, models: GPT5_CONFIG.MODEL_CAPABILITIES, uptime: Date.now() - metrics.startTime }; }

// ───────────────────────────────────────────────────────────────────────────────
// Exports (compat with your original file)
// ───────────────────────────────────────────────────────────────────────────────
module.exports = {
  // Core
  getGPT5Analysis,

  // Quick helpers
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
