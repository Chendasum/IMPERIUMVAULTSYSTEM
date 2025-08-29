'use strict';

// utils/openaiClient.js — GPT‑5 Client v3.1 (Aug 2025) - COMPLETE VERSION
// ----------------------------------------------------------------------------
// Purpose
//   • Unified client for GPT‑5 family (Full/Mini/Nano) via Responses API +
//     safe Chat Completions fallback (gpt‑4o).
//   • Consistent parameter handling, circuit breaker, retry/backoff, telemetry.
//   • Safe response extraction (handles output_text + output array) and token
//     budgeting with light estimation + per‑model context limits.
//   • Convenience wrappers: quick nano/mini, deep analysis, health checks.
//   • Full streaming support, batch operations, and advanced features.
//
// Design Notes
//   • GPT‑5 models are routed through Responses API only.
//   • Chat Completions is used only for fallback (gpt‑4o by default).
//   • We only send documented fields to each API.
//   • Highly commented for clarity; production‑ready defaults.
// ----------------------------------------------------------------------------

require('dotenv').config();
const { OpenAI } = require('openai');
const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                              Client Bootstrap                              ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: Number(process.env.OPENAI_TIMEOUT_MS || 180000), // 3 min
  maxRetries: Number(process.env.OPENAI_SDK_MAX_RETRIES || 1),
  defaultHeaders: {
    'User-Agent': 'IMPERIUM-VAULT-GPT5/3.1.0'
  }
});

console.log('🚀 [GPT5Client] Booting v3.1…');
console.log(`🔑 [GPT5Client] API Key: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                             Model Catalog                                  ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

const GPT5_CONFIG = {
  PRIMARY_MODEL: process.env.GPT5_PRIMARY_MODEL || 'gpt-5',
  MINI_MODEL: process.env.GPT5_MINI_MODEL || 'gpt-5-mini',
  NANO_MODEL: process.env.GPT5_NANO_MODEL || 'gpt-5-nano',

  // Chat is used only as a non-reasoning fallback
  CHAT_FALLBACK_MODEL: process.env.CHAT_FALLBACK_MODEL || 'gpt-4o',

  // Completion / output caps (Responses uses max_output_tokens; Chat uses max_tokens)
  MAX_COMPLETION_TOKENS: Number(process.env.GPT5_MAX_COMPLETION_TOKENS || 16384),

  // Reasoning efforts officially supported: low | medium | high
  DEFAULT_REASONING: process.env.GPT5_DEFAULT_REASONING || 'medium',

  // Logging toggles
  LOG_REQUEST_SUMMARY: process.env.GPT5_LOG_REQUESTS !== '0',
  LOG_RESPONSE_SUMMARY: process.env.GPT5_LOG_RESPONSES !== '0',
  LOG_ERRORS: process.env.GPT5_LOG_ERRORS !== '0',
  
  // Advanced features
  ENABLE_CACHING: process.env.GPT5_ENABLE_CACHING === '1',
  CACHE_TTL_MS: Number(process.env.GPT5_CACHE_TTL_MS || 300000), // 5 min
  ENABLE_METRICS: process.env.GPT5_ENABLE_METRICS !== '0',
  
  // Safety limits
  MAX_PROMPT_LENGTH: Number(process.env.GPT5_MAX_PROMPT_LENGTH || 180000),
  MIN_OUTPUT_TOKENS: Number(process.env.GPT5_MIN_OUTPUT_TOKENS || 16),
  
  // Batch processing
  MAX_BATCH_SIZE: Number(process.env.GPT5_MAX_BATCH_SIZE || 10),
  BATCH_TIMEOUT_MS: Number(process.env.GPT5_BATCH_TIMEOUT_MS || 300000) // 5 min
};

// Per-model context window limits (tokens). Use env overrides if needed.
const CONTEXT_LIMITS = {
  'gpt-5': Number(process.env.GPT5_CTX_FULL || 200000),
  'gpt-5-mini': Number(process.env.GPT5_CTX_MINI || 100000),
  'gpt-5-nano': Number(process.env.GPT5_CTX_NANO || 32000),
  'gpt-4o': Number(process.env.GPT4O_CTX || 128000)
};

// Allowed reasoning efforts (with optional minimal via env flag)
const BASE_EFFORTS = ['low', 'medium', 'high'];
const ALLOW_MINIMAL = process.env.GPT5_ALLOW_MINIMAL === '1';
const REASONING_EFFORTS = ALLOW_MINIMAL ? ['minimal', ...BASE_EFFORTS] : BASE_EFFORTS;

// Models that must use Responses API (reasoning)
const REASONING_MODELS = new Set(['gpt-5', 'gpt-5-mini', 'gpt-5-nano']);

console.log(`📋 [GPT5Client] Models: full=${GPT5_CONFIG.PRIMARY_MODEL} mini=${GPT5_CONFIG.MINI_MODEL} nano=${GPT5_CONFIG.NANO_MODEL} chatFallback=${GPT5_CONFIG.CHAT_FALLBACK_MODEL}`);

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                             Metrics & Telemetry                            ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTokensUsed: 0,
  totalLatencyMs: 0,
  modelUsage: {},
  errorsByType: {},
  lastReset: Date.now()
};

function updateMetrics(model, success, tokens = 0, latencyMs = 0, errorType = null) {
  if (!GPT5_CONFIG.ENABLE_METRICS) return;
  
  metrics.totalRequests++;
  if (success) {
    metrics.successfulRequests++;
    metrics.totalTokensUsed += tokens;
    metrics.totalLatencyMs += latencyMs;
  } else {
    metrics.failedRequests++;
    if (errorType) {
      metrics.errorsByType[errorType] = (metrics.errorsByType[errorType] || 0) + 1;
    }
  }
  
  metrics.modelUsage[model] = (metrics.modelUsage[model] || 0) + 1;
}

function getMetrics() {
  const uptime = Date.now() - metrics.lastReset;
  return {
    ...metrics,
    uptimeMs: uptime,
    avgLatencyMs: metrics.successfulRequests > 0 ? metrics.totalLatencyMs / metrics.successfulRequests : 0,
    successRate: metrics.totalRequests > 0 ? metrics.successfulRequests / metrics.totalRequests : 0,
    tokensPerMinute: uptime > 0 ? (metrics.totalTokensUsed / uptime) * 60000 : 0
  };
}

function resetMetrics() {
  Object.keys(metrics).forEach(key => {
    if (typeof metrics[key] === 'number') metrics[key] = 0;
    else if (typeof metrics[key] === 'object') metrics[key] = {};
  });
  metrics.lastReset = Date.now();
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                              Simple LRU Cache                              ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

class SimpleCache {
  constructor(maxSize = 100, ttlMs = GPT5_CONFIG.CACHE_TTL_MS) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }
  
  _isExpired(entry) {
    return Date.now() - entry.timestamp > this.ttlMs;
  }
  
  get(key) {
    if (!GPT5_CONFIG.ENABLE_CACHING) return null;
    
    const entry = this.cache.get(key);
    if (!entry || this._isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }
  
  set(key, value) {
    if (!GPT5_CONFIG.ENABLE_CACHING) return;
    
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
}

const responseCache = new SimpleCache();

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                             Utility: Token Math                            ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

/**
 * Light token estimate (heuristic) for safety budgeting.
 * ~4 chars/token for English-ish text.
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(String(text).length / 4));
}

/**
 * Cap max tokens so that prompt + completion fit in the model's context.
 */
function clampMaxTokens(promptTokens, requestedMax, ctxCap) {
  const req = Math.max(
    GPT5_CONFIG.MIN_OUTPUT_TOKENS, 
    Math.min(requestedMax || 8000, GPT5_CONFIG.MAX_COMPLETION_TOKENS)
  );
  const safetyHeadroom = 1024; // reserve for system/tooling/overheads
  const room = Math.max(GPT5_CONFIG.MIN_OUTPUT_TOKENS, ctxCap - promptTokens - safetyHeadroom);
  return Math.max(GPT5_CONFIG.MIN_OUTPUT_TOKENS, Math.min(req, room));
}

/**
 * Generate cache key for request
 */
function generateCacheKey(model, input, options = {}) {
  const key = JSON.stringify({
    model,
    input: typeof input === 'string' ? input.slice(0, 1000) : input,
    reasoning_effort: options.reasoning_effort,
    temperature: options.temperature,
    max_tokens: options.max_completion_tokens || options.max_tokens
  });
  return Buffer.from(key).toString('base64').slice(0, 64);
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                       Utility: Time + Error Typing                           ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

const ts = () => new Date().toISOString();

function classifyError(err) {
  const msg = String(err?.message || err || '');
  const classification = {
    isRate: /rate[_\s-]?limit|quota|429/i.test(msg),
    isTimeout: /timeout|ETIMEDOUT|ECONNRESET/i.test(msg),
    isAuth: /unauthorized|invalid api key|401|403/i.test(msg),
    isServer: /5\d\d|server error|bad gateway|502|503|504/i.test(msg),
    isNetwork: /ENOTFOUND|EAI_AGAIN|network|ECONNREFUSED/i.test(msg),
    isQuota: /quota|billing|insufficient_quota/i.test(msg),
    isModel: /model|unsupported|not found/i.test(msg)
  };
  
  // Determine primary error type
  if (classification.isAuth || classification.isQuota) classification.type = 'auth';
  else if (classification.isRate) classification.type = 'rate';
  else if (classification.isTimeout) classification.type = 'timeout';
  else if (classification.isNetwork) classification.type = 'network';
  else if (classification.isServer) classification.type = 'server';
  else if (classification.isModel) classification.type = 'model';
  else classification.type = 'unknown';
  
  return classification;
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                        Circuit Breaker + Backoff                             ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

const breaker = {
  failures: 0,
  openedAt: 0,
  state: 'CLOSED', // CLOSED → OPEN → HALF_OPEN
  openAfter: Number(process.env.GPT5_BREAKER_OPEN_AFTER || 3),
  cooldownMs: Number(process.env.GPT5_BREAKER_COOLDOWN_MS || 30000),
  halfOpenMaxAttempts: Number(process.env.GPT5_BREAKER_HALF_OPEN_MAX || 1),
  halfOpenAttempts: 0
};

function breakerAllow() {
  if (breaker.state === 'OPEN') {
    const since = Date.now() - breaker.openedAt;
    if (since > breaker.cooldownMs) {
      breaker.state = 'HALF_OPEN';
      breaker.halfOpenAttempts = 0;
      return true;
    }
    return false;
  }
  
  if (breaker.state === 'HALF_OPEN') {
    return breaker.halfOpenAttempts < breaker.halfOpenMaxAttempts;
  }
  
  return true;
}

function breakerRecordSuccess() {
  breaker.failures = 0;
  breaker.state = 'CLOSED';
  breaker.halfOpenAttempts = 0;
}

function breakerRecordFailure() {
  if (breaker.state === 'HALF_OPEN') {
    breaker.state = 'OPEN';
    breaker.openedAt = Date.now();
    breaker.halfOpenAttempts = 0;
    return;
  }
  
  breaker.failures += 1;
  if (breaker.failures >= breaker.openAfter) {
    breaker.state = 'OPEN';
    breaker.openedAt = Date.now();
  }
}

function getBreakerStatus() {
  return {
    state: breaker.state,
    failures: breaker.failures,
    openedAt: breaker.openedAt,
    cooldownRemaining: breaker.state === 'OPEN' ? 
      Math.max(0, breaker.cooldownMs - (Date.now() - breaker.openedAt)) : 0
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function backoffRetry(fn, { tries = 2, baseMs = 600, maxMs = 5000, factor = 1.5 } = {}) {
  let lastError;
  for (let i = 0; i < tries; i++) {
    try {
      if (breaker.state === 'HALF_OPEN') {
        breaker.halfOpenAttempts++;
      }
      return await fn();
    } catch (err) {
      lastError = err;
      const errorClass = classifyError(err);
      
      // Don't retry certain error types
      if (errorClass.isAuth || errorClass.isQuota || errorClass.isModel) {
        break;
      }
      
      if (i < tries - 1) {
        const wait = Math.min(maxMs, baseMs * Math.pow(factor, i));
        console.log(`⏳ [GPT5Client] Backoff retry in ${wait}ms… (attempt ${i + 1}/${tries})`);
        await sleep(wait);
      }
    }
  }
  throw lastError;
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                           Request Builders (API)                           ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

function ctxCapFor(model) {
  return CONTEXT_LIMITS[model] || CONTEXT_LIMITS['gpt-5'];
}

/**
 * Build request for Responses API (reasoning models: gpt‑5 / mini / nano).
 * Sends only documented fields: reasoning.effort, max_output_tokens.
 */
function buildResponsesRequest(model, input, options = {}) {
  const req = { model, input };

  // Reasoning effort
  const effort = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  if (REASONING_EFFORTS.includes(effort)) {
    req.reasoning = { effort };
  }

  // Token budgeting
  let maxTokens = null;
  if (options.max_completion_tokens != null) maxTokens = options.max_completion_tokens;
  if (options.max_output_tokens != null) maxTokens = options.max_output_tokens; // compat

  const promptTokens = typeof input === 'string' ? estimateTokens(input) : 512; // conservative
  const capped = clampMaxTokens(promptTokens, maxTokens ?? 8000, ctxCapFor(model));
  req.max_output_tokens = capped;

  // Add streaming if requested
  if (options.stream) {
    req.stream = true;
  }

  if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
    console.log('📤 [GPT5Client] ResponsesRequest', {
      model: req.model,
      reasoning: req.reasoning?.effort,
      max_output_tokens: req.max_output_tokens,
      prompt_tokens_est: promptTokens,
      stream: req.stream || false
    });
  }
  return req;
}

/**
 * Build request for Chat Completions (fallback only — gpt‑4o default).
 */
function buildChatRequest(model, messages, options = {}) {
  const req = { model, messages };
  
  if (options.temperature !== undefined) {
    req.temperature = Math.max(0, Math.min(2, options.temperature));
  }

  let maxTokens = null;
  if (options.max_completion_tokens != null) maxTokens = options.max_completion_tokens;
  if (options.max_tokens != null) maxTokens = options.max_tokens;

  const totalPrompt = messages.map(m => m?.content || '').join('\n');
  const promptTokens = estimateTokens(totalPrompt);
  const capped = clampMaxTokens(promptTokens, maxTokens ?? 8000, ctxCapFor(model));
  req.max_tokens = capped;

  if (options.top_p !== undefined) {
    req.top_p = Math.max(0, Math.min(1, options.top_p));
  }

  if (options.stream) {
    req.stream = true;
  }

  // Add tools if provided
  if (options.tools && Array.isArray(options.tools)) {
    req.tools = options.tools;
  }

  if (options.tool_choice) {
    req.tool_choice = options.tool_choice;
  }

  if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
    console.log('📤 [GPT5Client] ChatRequest', {
      model: req.model,
      temperature: req.temperature,
      max_tokens: req.max_tokens,
      prompt_tokens_est: promptTokens,
      stream: req.stream || false,
      tools: req.tools ? req.tools.length : 0
    });
  }
  return req;
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                       Safe Response Extraction                             ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

function extractFromResponses(completion) {
  // Prefer convenience field if present
  if (typeof completion?.output_text === 'string' && completion.output_text.length) {
    return completion.output_text;
  }
  
  // Fallback to iterating the output array
  if (!completion || !Array.isArray(completion.output)) {
    console.warn('⚠️ [GPT5Client] Invalid Responses payload (no output/output_text)');
    return 'Response structure invalid - no output found';
  }
  
  let txt = '';
  for (const item of completion.output) {
    if (item && Array.isArray(item.content)) {
      for (const c of item.content) {
        if (typeof c.text === 'string') txt += c.text;
      }
    }
  }
  return txt || 'No text content found in response';
}

function extractFromChat(completion) {
  if (!completion || !Array.isArray(completion.choices)) {
    console.warn('⚠️ [GPT5Client] Invalid Chat payload (no choices array)');
    return 'Response structure invalid - no choices found';
  }
  
  const choice = completion.choices?.[0];
  if (!choice) {
    return 'No choices found in response';
  }
  
  // Handle tool calls
  if (choice.message?.tool_calls?.length > 0) {
    return {
      content: choice.message.content || '',
      tool_calls: choice.message.tool_calls,
      finish_reason: choice.finish_reason
    };
  }
  
  const content = choice.message?.content;
  return (content && String(content).trim()) || 'No message content found in response';
}

function safeExtractResponseText(completion, apiType = 'responses') {
  try {
    return apiType === 'responses' ? extractFromResponses(completion) : extractFromChat(completion);
  } catch (err) {
    console.error('❌ [GPT5Client] Extract error:', err.message);
    return `Error extracting response: ${err.message}`;
  }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         Core Call Orchestrator                             ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

async function guardedCall(fn, model = 'unknown') {
  if (!breakerAllow()) {
    const status = getBreakerStatus();
    const wait = Math.max(0, status.cooldownRemaining);
    throw new Error(`Circuit breaker OPEN, retry after ${Math.ceil(wait / 1000)}s`);
  }
  
  try {
    const result = await backoffRetry(fn, { tries: 2, baseMs: 700 });
    breakerRecordSuccess();
    return result;
  } catch (err) {
    const errorClass = classifyError(err);
    updateMetrics(model, false, 0, 0, errorClass.type);
    breakerRecordFailure();
    throw err;
  }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                          Primary Public Function                           ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

/**
 * Main GPT‑5 function with routing (Responses) and fallback (Chat).
 * @param {string} prompt
 * @param {object} options
 * model?: 'gpt-5'|'gpt-5-mini'|'gpt-5-nano'
 * reasoning_effort?: 'low'|'medium'|'high'|'minimal*'
 * temperature?: number (fallback only)
 * max_completion_tokens?: number
 * use_cache?: boolean
 * tools?: array (chat only)
 * tool_choice?: string (chat only)
 */
async function getGPT5Analysis(prompt, options = {}) {
  const start = Date.now();

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt: must be a non-empty string');
  }

  const selectedModel = options.model || GPT5_CONFIG.MINI_MODEL;
  const useResponsesApi = REASONING_MODELS.has(selectedModel);

  // Check cache first
  const cacheKey = options.use_cache !== false ? generateCacheKey(selectedModel, prompt, options) : null;
  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached) {
      console.log('💾 [GPT5Client] Cache hit');
      return cached;
    }
  }

  if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
    console.log('▶️ [GPT5Client] getGPT5Analysis', { 
      model: selectedModel, 
      len: prompt.length,
      api: useResponsesApi ? 'responses' : 'chat',
      cached: !!cacheKey
    });
  }

  // Character guardrails before token budgeting
  if (prompt.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) {
    console.warn('⚠️ [GPT5Client] Prompt too long, truncating by chars…');
    prompt = prompt.slice(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + '\n… (truncated)';
  }

  try {
    let responseText = '';
    let tokensUsed = 0;
    let apiUsed = 'unknown';
    let rawCompletion = null;

    if (useResponsesApi) {
      apiUsed = 'responses';
      const req = buildResponsesRequest(selectedModel, prompt, {
        reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
        max_completion_tokens: options.max_completion_tokens || 8000
      });

      rawCompletion = await guardedCall(() => openai.responses.create(req), selectedModel);
      responseText = safeExtractResponseText(rawCompletion, 'responses');

      const u = rawCompletion.usage || {};
      tokensUsed = u.total_tokens ?? ((u.input_tokens || 0) + (u.output_tokens || 0));
      if (u.reasoning_tokens != null) {
        console.log('🧠 [GPT5Client] Reasoning tokens:', u.reasoning_tokens);
      }
    } else {
      // Fallback path — only gpt-4o (or configured) should land here
      apiUsed = 'chat';
      const messages = [{ role: 'user', content: prompt }];
      const req = buildChatRequest(GPT5_CONFIG.CHAT_FALLBACK_MODEL, messages, {
        temperature: options.temperature ?? 0.7,
        max_completion_tokens: options.max_completion_tokens || 8000,
        tools: options.tools,
        tool_choice: options.tool_choice
      });

      rawCompletion = await guardedCall(() => openai.chat.completions.create(req), GPT5_CONFIG.CHAT_FALLBACK_MODEL);
      responseText = safeExtractResponseText(rawCompletion, 'chat');
      const u = rawCompletion.usage || {};
      tokensUsed = u.total_tokens || ((u.prompt_tokens || 0) + (u.completion_tokens || 0));
    }

    if (!responseText) throw new Error('Empty response received from model');

    // Cache the result
    if (cacheKey && typeof responseText === 'string') {
      responseCache.set(cacheKey, responseText);
    }

    const elapsed = Date.now() - start;
    updateMetrics(selectedModel, true, tokensUsed, elapsed);

    if (GPT5_CONFIG.LOG_RESPONSE_SUMMARY) {
      console.log('◀️ [GPT5Client] getGPT5Analysis done', { 
        model: selectedModel, 
        api: apiUsed, 
        tokensUsed, 
        ms: elapsed, 
        outLen: typeof responseText === 'string' ? responseText.length : JSON.stringify(responseText).length 
      });
    }

    return responseText;
  } catch (err) {
    const elapsed = Date.now() - start;
    if (GPT5_CONFIG.LOG_ERRORS) {
      console.error('❌ [GPT5Client] getGPT5Analysis error:', err.message || err);
    }

    const kind = classifyError(err);
    updateMetrics(selectedModel, false, 0, elapsed, kind.type);
    
    if (kind.isRate || kind.isAuth || kind.isQuota) {
      // Propagate so upstream can throttle or repair credentials
      throw err;
    }

    // Final fallback — Chat Completions (gpt‑4o)
    if (useResponsesApi) { // Only fallback if we were using Responses API
      console.log('🔄 [GPT5Client] Attempting fallback →', GPT5_CONFIG.CHAT_FALLBACK_MODEL);
      try {
        const completion = await openai.chat.completions.create({
          model: GPT5_CONFIG.CHAT_FALLBACK_MODEL,
          messages: [{ role: 'user', content: String(prompt) }],
          max_tokens: Math.min(options.max_completion_tokens || 8000, GPT5_CONFIG.MAX_COMPLETION_TOKENS),
          temperature: options.temperature ?? 0.7
        });
        const txt = safeExtractResponseText(completion, 'chat');
        return `[${GPT5_CONFIG.CHAT_FALLBACK_MODEL} Fallback] ${txt}`;
      } catch (fbErr) {
        console.error('❌ [GPT5Client] Fallback failed:', fbErr?.message || fbErr);
        return (
          'I apologize, but I\'m experiencing technical difficulties.\n\n' +
          `Error details: ${err?.message || err}` + '\n\n' +
          'Please try a shorter message or retry in a moment.'
        );
      }
    }

    // If we were already using fallback, return error message
    return (
      'I apologize, but I\'m experiencing technical difficulties.\n\n' +
      `Error details: ${err?.message || err}` + '\n\n' +
      'Please try a shorter message or retry in a moment.'
    );
  }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                       Convenience / Quick Wrappers                         ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

async function getQuickNanoResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.NANO_MODEL,
    reasoning_effort: 'low',
    max_completion_tokens: Math.min(6000, GPT5_CONFIG.MAX_COMPLETION_TOKENS)
  });
}

async function getQuickMiniResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.MINI_MODEL,
    reasoning_effort: 'medium',
    max_completion_tokens: Math.min(10000, GPT5_CONFIG.MAX_COMPLETION_TOKENS)
  });
}

async function getDeepAnalysis(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.PRIMARY_MODEL,
    reasoning_effort: 'high',
    max_completion_tokens: Math.min(16000, GPT5_CONFIG.MAX_COMPLETION_TOKENS)
  });
}

// Chat-style wrapper through fallback only — provided for parity
async function getChatResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: 'chat-fallback' // forces fallback path
  });
}

// Enhanced wrapper with tool support
async function getChatResponseWithTools(prompt, tools = [], options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: 'chat-fallback',
    tools,
    tool_choice: options.tool_choice || 'auto'
  });
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         Streaming Support                                  ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

async function streamGPT5(prompt, options = {}) {
  const emitter = new EventEmitter();
  const selectedModel = options.model || GPT5_CONFIG.MINI_MODEL;
  const useResponsesApi = REASONING_MODELS.has(selectedModel);

  // Emit metadata first
  emitter.emit('start', { model: selectedModel, api: useResponsesApi ? 'responses' : 'chat' });

  queueMicrotask(async () => {
    try {
      if (!breakerAllow()) {
        const status = getBreakerStatus();
        emitter.emit('error', new Error(`Circuit breaker OPEN, retry after ${Math.ceil(status.cooldownRemaining / 1000)}s`));
        return;
      }

      let totalTokens = 0;
      let responseText = '';
      const start = Date.now();

      if (useResponsesApi) {
        const req = buildResponsesRequest(selectedModel, prompt, {
          reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
          max_completion_tokens: options.max_completion_tokens || 8000,
          stream: true
        });

        const stream = await openai.responses.stream(req);
        
        stream.on('content.delta', (delta) => {
          const text = delta?.delta || '';
          responseText += text;
          emitter.emit('data', text);
        });

        stream.on('usage', (usage) => {
          totalTokens = usage.total_tokens || 0;
          emitter.emit('usage', usage);
        });

        stream.on('message.completed', (completion) => {
          const elapsed = Date.now() - start;
          updateMetrics(selectedModel, true, totalTokens, elapsed);
          breakerRecordSuccess();
          emitter.emit('end', { 
            totalTokens, 
            elapsed, 
            responseLength: responseText.length,
            completion 
          });
        });

        stream.on('error', (error) => {
          const elapsed = Date.now() - start;
          const errorClass = classifyError(error);
          updateMetrics(selectedModel, false, 0, elapsed, errorClass.type);
          breakerRecordFailure();
          emitter.emit('error', error);
        });

      } else {
        const messages = [{ role: 'user', content: prompt }];
        const req = buildChatRequest(GPT5_CONFIG.CHAT_FALLBACK_MODEL, messages, {
          temperature: options.temperature ?? 0.7,
          max_completion_tokens: options.max_completion_tokens || 8000,
          stream: true,
          tools: options.tools,
          tool_choice: options.tool_choice
        });

        const stream = await openai.chat.completions.stream(req);

        stream.on('content', (delta, snapshot) => {
          const text = delta || '';
          responseText += text;
          emitter.emit('data', text);
        });

        stream.on('usage', (usage) => {
          totalTokens = usage.total_tokens || 0;
          emitter.emit('usage', usage);
        });

        stream.on('finalChatCompletion', (completion) => {
          const elapsed = Date.now() - start;
          updateMetrics(GPT5_CONFIG.CHAT_FALLBACK_MODEL, true, totalTokens, elapsed);
          breakerRecordSuccess();
          emitter.emit('end', { 
            totalTokens, 
            elapsed, 
            responseLength: responseText.length,
            completion 
          });
        });

        stream.on('error', (error) => {
          const elapsed = Date.now() - start;
          const errorClass = classifyError(error);
          updateMetrics(GPT5_CONFIG.CHAT_FALLBACK_MODEL, false, 0, elapsed, errorClass.type);
          breakerRecordFailure();
          emitter.emit('error', error);
        });
      }

    } catch (error) {
      emitter.emit('error', error);
    }
  });

  return emitter;
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         Batch Processing                                   ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

async function processBatchRequests(requests, options = {}) {
  const batchSize = Math.min(options.batchSize || GPT5_CONFIG.MAX_BATCH_SIZE, GPT5_CONFIG.MAX_BATCH_SIZE);
  const concurrency = Math.min(options.concurrency || 3, 5);
  const results = [];
  
  console.log(`🔄 [GPT5Client] Processing ${requests.length} requests in batches of ${batchSize}`);
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchPromises = batch.map(async (request, index) => {
      const actualIndex = i + index;
      try {
        const result = await getGPT5Analysis(request.prompt, {
          ...request.options,
          use_cache: request.options?.use_cache !== false
        });
        return { index: actualIndex, success: true, result, request };
      } catch (error) {
        return { index: actualIndex, success: false, error: error.message, request };
      }
    });
    
    // Process batch with concurrency limit
    const batchResults = [];
    for (let j = 0; j < batchPromises.length; j += concurrency) {
      const chunk = batchPromises.slice(j, j + concurrency);
      const chunkResults = await Promise.all(chunk);
      batchResults.push(...chunkResults);
    }
    
    results.push(...batchResults);
    
    // Brief pause between batches to be respectful
    if (i + batchSize < requests.length) {
      await sleep(500);
    }
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`✅ [GPT5Client] Batch complete: ${successful} successful, ${failed} failed`);
  
  return {
    results: results.sort((a, b) => a.index - b.index),
    summary: {
      total: results.length,
      successful,
      failed,
      successRate: successful / results.length
    }
  };
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                             Health Checks                                  ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

async function testOpenAIConnection() {
  console.log('🩺 [GPT5Client] Running connection test...');
  try {
    const res = await openai.models.list();
    const modelCount = res.data.length;
    console.log(`✅ [GPT5Client] Connection successful! Found ${modelCount} models.`);
    return { success: true, message: `Found ${modelCount} models.` };
  } catch (error) {
    console.error('❌ [GPT5Client] Connection test failed:', error.message);
    const classification = classifyError(error);
    const message = `Connection failed. Error: ${error.message}. Type: ${classification.type}.`;
    return { success: false, message };
  }
}

async function checkGPT5SystemHealth() {
  console.log('🩺 [GPT5Client] Checking GPT-5 system health...');
  const tests = [
    {
      model: GPT5_CONFIG.MINI_MODEL,
      prompt: 'Check your reasoning. Respond with a single word "ok" if you are healthy.',
      type: 'Responses API'
    },
    {
      model: GPT5_CONFIG.CHAT_FALLBACK_MODEL,
      prompt: 'Is this a simple health check? Respond with a single word "yes".',
      type: 'Chat Completions Fallback'
    }
  ];
  
  const results = await Promise.all(tests.map(async (test) => {
    const start = Date.now();
    try {
      const response = await getGPT5Analysis(test.prompt, { model: test.model, use_cache: false });
      const elapsed = Date.now() - start;
      const pass = response.toLowerCase().includes('ok') || response.toLowerCase().includes('yes');
      return { ...test, success: pass, elapsed, response };
    } catch (error) {
      const elapsed = Date.now() - start;
      return { ...test, success: false, elapsed, error: error.message };
    }
  }));
  
  console.log('--- Health Check Summary ---');
  results.forEach(res => {
    console.log(`[${res.type}] Model: ${res.model} | Status: ${res.success ? '✅ OK' : '❌ FAILED'} | Time: ${res.elapsed}ms`);
    if (!res.success) {
      console.error(`- Details: ${res.error || `Invalid response: ${res.response}`}`);
    }
  });
  console.log('----------------------------');
  
  return results;
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                          File and IO Operations                            ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

/**
 * Reads a file and processes its content with a GPT‑5 model.
 * @param {string} filePath 
 * @param {object} options
 * @returns {Promise<string>}
 */
async function processFile(filePath, options = {}) {
  if (!fs) {
    throw new Error('File system operations are not supported in this environment.');
  }
  const fullPath = path.resolve(filePath);
  console.log(`📖 [GPT5Client] Reading file: ${fullPath}`);
  
  try {
    const content = await fs.readFile(fullPath, 'utf8');
    console.log(`✅ [GPT5Client] File read. Size: ${content.length} chars.`);
    return getGPT5Analysis(content, options);
  } catch (error) {
    console.error('❌ [GPT5Client] Error processing file:', error.message);
    throw new Error(`Failed to process file at ${filePath}: ${error.message}`);
  }
}

/**
 * Saves a given response to a file.
 * @param {string} filePath 
 * @param {string} content 
 */
async function saveResponse(filePath, content) {
  if (!fs) {
    throw new Error('File system operations are not supported in this environment.');
  }
  const fullPath = path.resolve(filePath);
  try {
    await fs.writeFile(fullPath, content, 'utf8');
    console.log(`💾 [GPT5Client] Response saved to: ${fullPath}`);
  } catch (error) {
    console.error('❌ [GPT5Client] Error saving file:', error.message);
    throw new Error(`Failed to save response to ${filePath}: ${error.message}`);
  }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                             Exports                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

module.exports = {
  // Main functions
  getGPT5Analysis,
  
  // Convenience wrappers
  getQuickNanoResponse,
  getQuickMiniResponse,
  getDeepAnalysis,
  getChatResponse,
  getChatResponseWithTools,
  
  // Streaming
  streamGPT5,
  
  // Batch processing
  processBatchRequests,
  
  // Health / testing
  testOpenAIConnection,
  checkGPT5SystemHealth,
  
  // Utilities
  // These are intentionally not exported for external use.
  // The client is designed to be a black box for stability.
  
  // Cache management
  clearCache: () => responseCache.clear(),
  getCacheStats: () => ({
    size: responseCache.size(),
    maxSize: responseCache.maxSize,
    ttl: responseCache.ttlMs,
    enabled: GPT5_CONFIG.ENABLE_CACHING
  }),
  
  // Metrics
  getMetrics,
  resetMetrics,
  
  // Circuit breaker
  getBreakerStatus,
  resetBreaker: () => {
    breaker.failures = 0;
    breaker.state = 'CLOSED';
    breaker.openedAt = 0;
    breaker.halfOpenAttempts = 0;
  }
};
