async function getText(prompt, opts = {}) {
  const model = smartSelectModel(opts, roughTokenEstimate(prompt));
  const mergedOpts = { ...opts, model };
  return coreInvoke({ prompt, options: mergedOpts, preferModel: model || 'auto', useResponses: 'auto' });
}

async function getTextWithMemory(prompt, memory, opts = {}) {
  const promptWithMem = attachMemoryToPrompt(prompt, memory);
  return getText(promptWithMem, opts);
}// utils/openaiClient.js — Rebuilt (Aug 2025)
// Production‑grade OpenAI client for GPT‑5 family with:
// - Responses vs Chat auto‑selection + graceful fallback
// - Token cap per model (prevents 400s)
// - Exponential backoff on 429
// - Circuit breaker (fail‑fast during outages)
// - Tiny health check (ultra‑low cost)
// - In‑memory TTL cache
// - Clear metrics + cost estimation hooks
//
// Drop‑in replacement for previous versions.

'use strict';
require('dotenv').config();
const { OpenAI } = require('openai');
const crypto = require('crypto');

// ───────────────────────────────────────────────────────────────────────────────
// Guard: API key present
// ───────────────────────────────────────────────────────────────────────────────
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

// Instantiate client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: Number(process.env.OPENAI_TIMEOUT_MS || 180000),
  maxRetries: Number(process.env.OPENAI_SDK_MAX_RETRIES || 2)
});

// ───────────────────────────────────────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────────────────────────────────────
const GPT5_CONFIG = {
  PRIMARY_MODEL: process.env.GPT5_PRIMARY_MODEL || 'gpt-5',
  MINI_MODEL: process.env.GPT5_MINI_MODEL || 'gpt-5-mini',
  NANO_MODEL: process.env.GPT5_NANO_MODEL || 'gpt-5-nano',
  CHAT_MODEL: process.env.GPT5_CHAT_MODEL || 'gpt-5-chat-latest',
  FALLBACK_CHAT: process.env.FALLBACK_CHAT_MODEL || 'gpt-4o',

  DEFAULT_REASONING: 'medium', // 'low' | 'medium' | 'high'
  REASONING_EFFORTS: ['low', 'medium', 'high'],

  // Per‑model output caps (keeps us inside server limits -> avoids 400)
  MODEL_CAPABILITIES: {
    'gpt-5':        { maxTokens: 16384, contextWindow: 400000 },
    'gpt-5-mini':   { maxTokens: 8192,  contextWindow: 200000 },
    'gpt-5-nano':   { maxTokens: 4096,  contextWindow: 100000 },
    'gpt-5-chat-latest': { maxTokens: 16384, contextWindow: 400000 },
    'gpt-4o':       { maxTokens: 8192,  contextWindow: 128000 }
  },

  // Soft pricing (USD / 1K tokens). Update via env in prod if needed.
  PRICING_PER_1K: {
    'gpt-5':        { in: 0.01, out: 0.03 },
    'gpt-5-mini':   { in: 0.005, out: 0.015 },
    'gpt-5-nano':   { in: 0.003, out: 0.008 },
    'gpt-5-chat-latest': { in: 0.01, out: 0.03 },
    'gpt-4o':       { in: 0.005, out: 0.015 }
  },

  CACHE_TTL_MS: Number(process.env.OPENAI_CACHE_TTL_MS || 3 * 60 * 1000),
  CACHE_MAX: Number(process.env.OPENAI_CACHE_MAX || 500),

  CIRCUIT_FAILURE_THRESHOLD: Number(process.env.OPENAI_CB_FAILS || 5),
  CIRCUIT_COOLDOWN_MS: Number(process.env.OPENAI_CB_COOLDOWN_MS || 20_000)
};

// ───────────────────────────────────────────────────────────────────────────────
// Helpers: Hashing, sleep
// ───────────────────────────────────────────────────────────────────────────────
const sha1 = (str) => crypto.createHash('sha1').update(String(str)).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────────────────────────────────────────────────────────────
// Metrics
// ───────────────────────────────────────────────────────────────────────────────
class Metrics {
  constructor() {
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      averageResponseTime: 0,
      modelUsage: {}
    };
  }
  record({ model, ok, inputTokens = 0, outputTokens = 0, ms = 0, cost = 0 }) {
    const s = this.stats;
    s.totalCalls += 1;
    ok ? (s.successfulCalls += 1) : (s.failedCalls += 1);
    s.totalTokensUsed += (inputTokens || 0) + (outputTokens || 0);
    if (cost) s.totalCost += cost;
    // exp. moving average on response time
    s.averageResponseTime = s.averageResponseTime === 0 ? ms : Math.round(s.averageResponseTime * 0.8 + ms * 0.2);
    if (!s.modelUsage[model]) s.modelUsage[model] = { calls: 0, tokensIn: 0, tokensOut: 0, cost: 0 };
    s.modelUsage[model].calls += 1;
    s.modelUsage[model].tokensIn += inputTokens || 0;
    s.modelUsage[model].tokensOut += outputTokens || 0;
    s.modelUsage[model].cost += cost || 0;
  }
  getStats() { return JSON.parse(JSON.stringify(this.stats)); }
  reset() { this.stats = new Metrics().stats; }
}
const metrics = new Metrics();

// ───────────────────────────────────────────────────────────────────────────────
// Simple in‑memory TTL cache (LRU‑ish)
// ───────────────────────────────────────────────────────────────────────────────
class TTLCache {
  constructor(maxSize, ttl) {
    this.maxSize = maxSize; this.ttl = ttl;
    this.map = new Map();
  }
  keyFrom(prompt, options, model) {
    return sha1(JSON.stringify({ p: prompt, o: options || {}, m: model || '' }));
  }
  get(key) {
    const hit = this.map.get(key); if (!hit) return null;
    if (Date.now() - hit.t > this.ttl) { this.map.delete(key); return null; }
    hit.h += 1; // touch
    return hit.v;
  }
  set(key, value) {
    if (this.map.size >= this.maxSize) {
      // evict oldest
      const firstKey = this.map.keys().next().value; this.map.delete(firstKey);
    }
    this.map.set(key, { v: value, t: Date.now(), h: 0 });
  }
  clear() { this.map.clear(); }
  size() { return this.map.size; }
}
const cache = new TTLCache(GPT5_CONFIG.CACHE_MAX, GPT5_CONFIG.CACHE_TTL_MS);

// ───────────────────────────────────────────────────────────────────────────────
// Circuit Breaker
// ───────────────────────────────────────────────────────────────────────────────
class CircuitBreaker {
  constructor({ failureThreshold, cooldownMs }) {
    this.failureThreshold = failureThreshold; this.cooldownMs = cooldownMs;
    this.failures = 0; this.openedAt = 0;
  }
  get isOpen() {
    if (this.failures < this.failureThreshold) return false;
    return (Date.now() - this.openedAt) < this.cooldownMs;
  }
  async run(fn) {
    if (this.isOpen) throw new Error('OpenAI circuit is open; temporarily rejecting calls');
    try { const r = await fn(); this.failures = 0; return r; }
    catch (e) { this.failures += 1; if (this.failures >= this.failureThreshold) this.openedAt = Date.now(); throw e; }
  }
}
const circuitBreaker = new CircuitBreaker({
  failureThreshold: GPT5_CONFIG.CIRCUIT_FAILURE_THRESHOLD,
  cooldownMs: GPT5_CONFIG.CIRCUIT_COOLDOWN_MS
});

// ───────────────────────────────────────────────────────────────────────────────
// Model selection
// ───────────────────────────────────────────────────────────────────────────────
function pickModel(prefer = 'auto') {
  if (prefer && prefer !== 'auto') return prefer;
  return process.env.GPT5_TIER === 'nano' ? GPT5_CONFIG.NANO_MODEL
       : process.env.GPT5_TIER === 'mini' ? GPT5_CONFIG.MINI_MODEL
       : GPT5_CONFIG.PRIMARY_MODEL;
}

// ───────────────────────────────────────────────────────────────────────────────
// Smart token estimate + model selection + memory merge
// ───────────────────────────────────────────────────────────────────────────────
function roughTokenEstimate(input) {
  try {
    if (Array.isArray(input)) {
      return input.reduce((sum, m) => sum + roughTokenEstimate(m.content || ''), 0);
    }
    const s = String(input || '');
    // ~4 chars per token heuristic
    return Math.ceil(s.length / 4);
  } catch { return 0; }
}

function smartSelectModel(opts = {}, estimatedTokens = 0) {
  if (opts.model && opts.model !== 'auto') return opts.model;
  if (process.env.SMART_MODEL_SELECT === 'false') return pickModel('auto');
  const wantReasoning = (opts.reasoning_effort && opts.reasoning_effort !== 'low');
  const target = estimatedTokens + (opts.max_output_tokens || opts.max_tokens || 1500);
  // Simple thresholds; tune in env if you like
  if (target <= 3500 && !wantReasoning) return GPT5_CONFIG.NANO_MODEL;     // ultra fast
  if (target <= 9000) return GPT5_CONFIG.MINI_MODEL;                        // balanced
  return GPT5_CONFIG.PRIMARY_MODEL;                                         // full
}

function attachMemoryToMessages(messages = [], memory = {}) {
  const { systemPreamble, recall = [] } = memory || {};
  const blocks = [];
  if (systemPreamble && String(systemPreamble).trim()) {
    blocks.push({ role: 'system', content: String(systemPreamble).trim() });
  }
  if (Array.isArray(recall) && recall.length) {
    const recallText = recall.map((r, i) => `• ${r}`).join('
');
    blocks.push({ role: 'system', content: `Persistent Memory Context (read‑only)
${recallText}` });
  }
  return [...blocks, ...messages];
}

function attachMemoryToPrompt(prompt = '', memory = {}) {
  const { systemPreamble, recall = [] } = memory || {};
  const header = systemPreamble ? `SYSTEM:
${systemPreamble}

` : '';
  const recallText = (Array.isArray(recall) && recall.length) ? `MEMORY:
${recall.map(r => `• ${r}`).join('
')}

` : '';
  return `${header}${recallText}USER:
${String(prompt)}`;
}

// ───────────────────────────────────────────────────────────────────────────────
// Request builders (keep schema tight — avoid unsupported fields)
// ───────────────────────────────────────────────────────────────────────────────
function capFor(model) {
  return GPT5_CONFIG.MODEL_CAPABILITIES[model]?.maxTokens || 4096;
}

/**
 * Build a Responses API request
 */
function buildResponsesRequest(model, input, opts = {}) {
  const req = { model, input };
  // reasoning.effort (only if valid)
  const effort = opts.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  if (GPT5_CONFIG.REASONING_EFFORTS.includes(effort)) {
    req.reasoning = { effort };
  }
  // Temperature & sampling
  if (typeof opts.temperature === 'number') req.temperature = opts.temperature;
  if (typeof opts.top_p === 'number') req.top_p = opts.top_p;
  if (typeof opts.frequency_penalty === 'number') req.frequency_penalty = opts.frequency_penalty;
  if (typeof opts.presence_penalty === 'number') req.presence_penalty = opts.presence_penalty;
  // Output tokens (cap per model)
  const asked = opts.max_output_tokens || opts.max_completion_tokens || 8000;
  req.max_output_tokens = Math.max(16, Math.min(asked, capFor(model)));
  // IMPORTANT: no deprecated/unsupported blocks here (e.g., text.verbosity)
  return req;
}

/**
 * Build a Chat Completions API request
 */
function buildChatRequest(model, messages, opts = {}) {
  const req = { model, messages };
  if (typeof opts.temperature === 'number') req.temperature = opts.temperature;
  if (typeof opts.top_p === 'number') req.top_p = opts.top_p;
  if (typeof opts.frequency_penalty === 'number') req.frequency_penalty = opts.frequency_penalty;
  if (typeof opts.presence_penalty === 'number') req.presence_penalty = opts.presence_penalty;
  const asked = opts.max_tokens || opts.max_completion_tokens || 8000;
  req.max_tokens = Math.max(1, Math.min(asked, capFor(model)));
  return req;
}

// ───────────────────────────────────────────────────────────────────────────────
// Safe text extraction
// ───────────────────────────────────────────────────────────────────────────────
function safeExtractResponseText(result, api = 'responses') {
  try {
    if (api === 'responses') {
      // new Responses API often provides output_text
      if (typeof result?.output_text === 'string') return result.output_text || '';
      // or content array with text items
      const itemText = result?.output?.[0]?.content?.[0]?.text?.value;
      if (typeof itemText === 'string') return itemText;
      // final fallback: stringify
      return '';
    }
    // chat.completions
    const t = result?.choices?.[0]?.message?.content;
    return typeof t === 'string' ? t : '';
  } catch {
    return '';
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Cost estimation (best effort, updates when usage present)
// ───────────────────────────────────────────────────────────────────────────────
function estimateCost(model, inputTokens = 0, outputTokens = 0) {
  const p = GPT5_CONFIG.PRICING_PER_1K[model] || { in: 0, out: 0 };
  const cost = (inputTokens / 1000) * p.in + (outputTokens / 1000) * p.out;
  return Math.round(cost * 1e6) / 1e6; // 6‑dp
}

// ───────────────────────────────────────────────────────────────────────────────
// Core invocation with cache, backoff, fallback, circuit breaker
// ───────────────────────────────────────────────────────────────────────────────
async function coreInvoke({
  preferModel = 'auto',
  useResponses = 'auto', // 'auto' | true | false
  prompt = '',
  messages = null,
  options = {}
}) {
  const start = Date.now();
  const model = pickModel(preferModel);
  const apiChosen = useResponses === 'auto' ? (model.startsWith('gpt-5') && model !== GPT5_CONFIG.CHAT_MODEL) : !!useResponses;

  // cache: avoid caching small system/fallback messages
  const cacheKey = cache.keyFrom(messages || prompt, { ...options, apiChosen }, model);
  if (!options.skipCache) {
    const cached = cache.get(cacheKey);
    if (cached) return { ...cached, cached: true };
  }

  // helper: backoff wrapper for rate limits
  const withBackoff = async (fn) => {
    const delays = [250, 750, 1500];
    let lastErr;
    for (let i = 0; i < delays.length; i++) {
      try { return await fn(); }
      catch (e) {
        const status = e?.status || e?.response?.status;
        const msg = (e?.response?.data?.error?.message) || e?.message || '';
        const isRate = status === 429 || /rate/i.test(msg);
        if (!isRate) { lastErr = e; break; }
        await sleep(delays[i]);
        lastErr = e;
      }
    }
    // final try (will throw if fails)
    return await fn();
  };

  let inputTokens = 0, outputTokens = 0, result = null, apiUsed = apiChosen ? 'responses' : 'chat';
  try {
    result = await circuitBreaker.run(async () => {
      if (apiChosen) {
        // Responses API path
        const req = buildResponsesRequest(model, messages ? messages : prompt, {
          reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
          temperature: options.temperature,
          top_p: options.top_p,
          frequency_penalty: options.frequency_penalty,
          presence_penalty: options.presence_penalty,
          max_output_tokens: options.max_output_tokens || options.max_completion_tokens || 8000
        });
        return await withBackoff(() => openai.responses.create(req));
      } else {
        // Chat Completions API path
        const req = buildChatRequest(model, messages || [{ role: 'user', content: String(prompt) }], {
          temperature: options.temperature,
          top_p: options.top_p,
          frequency_penalty: options.frequency_penalty,
          presence_penalty: options.presence_penalty,
          max_tokens: options.max_tokens || options.max_completion_tokens || 8000
        });
        return await withBackoff(() => openai.chat.completions.create(req));
      }
    });
  } catch (e) {
    // Enhanced error surfacing
    const serverMsg = e?.response?.data?.error?.message || e?.message || 'Unknown error';
    const status = e?.status || e?.response?.status || 0;

    // Fallback ONLY when it makes sense (schema/route errors)
    const canFallback = !options.noFallback && (apiChosen === true) && (status === 400 || status === 404 || status === 422);
    if (canFallback) {
      try {
        const fbModel = GPT5_CONFIG.CHAT_MODEL || GPT5_CONFIG.FALLBACK_CHAT;
        apiUsed = 'chat-fallback';
        const req = buildChatRequest(fbModel, messages || [{ role: 'user', content: String(prompt) }], {
          temperature: options.temperature,
          top_p: options.top_p,
          frequency_penalty: options.frequency_penalty,
          presence_penalty: options.presence_penalty,
          max_tokens: options.max_tokens || options.max_completion_tokens || 8000
        });
        result = await withBackoff(() => openai.chat.completions.create(req));
      } catch (fbErr) {
        const merged = new Error(`${serverMsg} | Fallback failed: ${fbErr?.response?.data?.error?.message || fbErr.message}`);
        merged.status = status || fbErr?.status;
        throw merged;
      }
    } else {
      const merged = new Error(serverMsg);
      merged.status = status;
      throw merged;
    }
  }

  // Usage & text
  try {
    const usage = result?.usage || result?.response?.usage || {};
    inputTokens = usage?.input_tokens || usage?.prompt_tokens || 0;
    outputTokens = usage?.output_tokens || usage?.completion_tokens || 0;
  } catch {}

  const text = safeExtractResponseText(result, apiUsed.startsWith('chat') ? 'chat' : 'responses');

  const ms = Date.now() - start;
  const modelUsed = (result?.model) || (apiUsed.startsWith('chat') ? (GPT5_CONFIG.CHAT_MODEL || GPT5_CONFIG.FALLBACK_CHAT) : pickModel(preferModel));
  let cost = estimateCost(modelUsed, inputTokens, outputTokens);
  metrics.record({ model: modelUsed, ok: true, inputTokens, outputTokens, ms, cost });

  // Avoid caching empty/systemy strings and fallback banners
  const isCacheable = !options.skipCache && text && text.length > 10 && !text.startsWith('[') && !/^\[GPT\-.*Fallback\]/.test(text);
  const payload = { text, model: modelUsed, apiUsed, inputTokens, outputTokens, cost, ms };
  if (isCacheable) cache.set(cacheKey, payload);
  return payload;
}

// ───────────────────────────────────────────────────────────────────────────────
// Public API
// ───────────────────────────────────────────────────────────────────────────────
/**
 * Simple text call (single prompt). Uses Responses API for GPT‑5 models by default.
 */
async function getText(prompt, opts = {}) {
  return coreInvoke({ prompt, options: opts, preferModel: opts.model || 'auto', useResponses: 'auto' });
}

/**
 * Structured chat call. Provide messages = [{role, content}, ...].
 */
async function getChat(messages, opts = {}) {
  const prefer = opts.model || 'auto';
  const model = smartSelectModel(opts, roughTokenEstimate(messages));
  const forceChat = (opts.forceChat === true) || (!String(model).startsWith('gpt-5'));
  const useResponses = forceChat ? false : 'auto';
  return coreInvoke({ messages, options: { ...opts, model }, preferModel: model || prefer, useResponses });
}

async function getChatWithMemory(messages, memory, opts = {}) {
  const msgs = attachMemoryToMessages(messages, memory);
  return getChat(msgs, opts);
}

/**
 * Embeddings helper (text-embedding-3-large by default)
 */
async function getEmbedding(input, opts = {}) {
  const model = opts.model || process.env.EMBEDDING_MODEL || 'text-embedding-3-large';
  const res = await openai.embeddings.create({ model, input });
  const v = res?.data?.[0]?.embedding || [];
  return { vector: v, dims: v.length, model };
}

/**
 * Moderation helper (omni-moderation-latest by default)
 */
async function getModeration(input, opts = {}) {
  const model = opts.model || 'omni-moderation-latest';
  const res = await openai.moderations.create({ model, input });
  return res?.results?.[0] || res;
}

/**
 * Tiny health check — ultra short prompt to 2–3 models (very low cost)
 */
async function healthCheck() {
  const tests = [
    { name: 'primary', fn: () => getText('ok', { max_output_tokens: 5, temperature: 0, skipCache: true }) },
    { name: 'mini', fn: () => getText('ok', { model: GPT5_CONFIG.MINI_MODEL, max_output_tokens: 5, temperature: 0, skipCache: true }) },
    { name: 'chat', fn: () => getChat([{ role: 'user', content: 'ok' }], { model: GPT5_CONFIG.CHAT_MODEL, max_tokens: 5, temperature: 0, skipCache: true, forceChat: true }) }
  ];
  const results = [];
  for (const t of tests) {
    try { const r = await t.fn(); results.push({ name: t.name, ok: true, model: r.model, ms: r.ms }); }
    catch (e) { results.push({ name: t.name, ok: false, error: e?.message || String(e) }); }
  }
  return {
    ok: results.every(r => r.ok),
    results,
    cache: { size: cache.size(), ttlMs: GPT5_CONFIG.CACHE_TTL_MS },
    breaker: { failures: circuitBreaker.failures, open: circuitBreaker.isOpen },
    metrics: metrics.getStats()
  };
}

function clearCache() { cache.clear(); return { ok: true }; }
function getMetrics() { return metrics.getStats(); }

// ───────────────────────────────────────────────────────────────────────────────
// Backward‑compatibility shims (for older callers)
// ───────────────────────────────────────────────────────────────────────────────
async function getGPT5Analysis(prompt, opts = {}) {
  // legacy alias → single prompt text completion via Responses (or fallback)
  return getText(prompt, opts);
}
async function getGPT5Chat(messages, opts = {}) {
  // legacy alias → structured chat; forceChat respects opts.forceChat
  return getChat(messages, opts);
}

// ───────────────────────────────────────────────────────────────────────────────
// Exports
// ───────────────────────────────────────────────────────────────────────────────
module.exports = {
  // Client + config
  openai,
  GPT5_CONFIG,

  // High‑level calls
  getText,
  getChat,
  getEmbedding,
  getModeration,

  // Memory‑aware helpers
  getTextWithMemory,
  getChatWithMemory,

  // Legacy aliases (health checks and older modules expect these)
  getGPT5Analysis,
  getGPT5Chat,
  // Legacy convenience with memory
  getGPT5AnalysisWithMemory: getTextWithMemory,

  // Builders (useful for tests)
  buildResponsesRequest,
  buildChatRequest,
  safeExtractResponseText,

  // Ops
  healthCheck,
  clearCache,
  getMetrics,

  // Internals (if you need to wire custom flows)
  _coreInvoke: coreInvoke,
  _cache: cache,
  _circuit: circuitBreaker
};
