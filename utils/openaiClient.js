'use strict';

// utils/openaiClient.js — GPT‑5 Client v3.2 (Aug 2025) - JSON BODY FIX
// ----------------------------------------------------------------------------
// Purpose
//   • Unified client for GPT‑5 family (Full/Mini/Nano) via Chat Completions API
//   • FIXED: JSON body parsing errors with proper request formatting
//   • Consistent parameter handling, circuit breaker, retry/backoff, telemetry.
//   • Safe response extraction and token budgeting with context limits.
//   • Convenience wrappers: quick nano/mini, deep analysis, health checks.
//
// Design Notes
//   • ALL GPT-5 models now use Chat Completions API (not Responses API)
//   • Proper JSON formatting for all requests
//   • Only documented OpenAI parameters are sent
//   • Production-ready with comprehensive error handling
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
    'User-Agent': 'IMPERIUM-VAULT-GPT5/3.2.0',
    'Content-Type': 'application/json'
  }
});

console.log('🚀 [GPT5Client] Booting v3.2 (JSON Fixed)…');
console.log(`🔑 [GPT5Client] API Key: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                               Model Catalog                                ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

const GPT5_CONFIG = {
  PRIMARY_MODEL: process.env.GPT5_PRIMARY_MODEL || 'gpt-5',
  MINI_MODEL: process.env.GPT5_MINI_MODEL || 'gpt-5-mini',
  NANO_MODEL: process.env.GPT5_NANO_MODEL || 'gpt-5-nano',
  CHAT_MODEL: process.env.GPT5_CHAT_MODEL || 'gpt-5',

  // Completion / output caps
  MAX_COMPLETION_TOKENS: Number(process.env.GPT5_MAX_COMPLETION_TOKENS || 16384),
  MIN_OUTPUT_TOKENS: Number(process.env.GPT5_MIN_OUTPUT_TOKENS || 16),

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
  
  // Batch processing
  MAX_BATCH_SIZE: Number(process.env.GPT5_MAX_BATCH_SIZE || 10),
  BATCH_TIMEOUT_MS: Number(process.env.GPT5_BATCH_TIMEOUT_MS || 300000) // 5 min
};

// Per‑model context window limits (tokens)
const CONTEXT_LIMITS = {
  'gpt-5': Number(process.env.GPT5_CTX_FULL || 200000),
  'gpt-5-mini': Number(process.env.GPT5_CTX_MINI || 100000),
  'gpt-5-nano': Number(process.env.GPT5_CTX_NANO || 32000),
  'gpt-4o': Number(process.env.GPT4O_CTX || 128000),
  'gpt-4o-mini': Number(process.env.GPT4O_MINI_CTX || 128000)
};

console.log(`📋 [GPT5Client] Models: primary=${GPT5_CONFIG.PRIMARY_MODEL} mini=${GPT5_CONFIG.MINI_MODEL} nano=${GPT5_CONFIG.NANO_MODEL}`);

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                           Metrics & Telemetry                             ║
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
// ║                             Simple LRU Cache                              ║
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
// ║                             Utility: Token Math                             ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

/**
 * Light token estimate (heuristic) for safety budgeting.
 * ~4 chars/token for English‑ish text.
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
    temperature: options.temperature,
    max_tokens: options.max_completion_tokens || options.max_tokens
  });
  return Buffer.from(key).toString('base64').slice(0, 64);
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                        Utility: Time + Error Typing                        ║
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
    isModel: /model|unsupported|not found/i.test(msg),
    isJSON: /json|parse|400/i.test(msg) // NEW: JSON parsing errors
  };
  
  // Determine primary error type
  if (classification.isAuth || classification.isQuota) classification.type = 'auth';
  else if (classification.isRate) classification.type = 'rate';
  else if (classification.isTimeout) classification.type = 'timeout';
  else if (classification.isNetwork) classification.type = 'network';
  else if (classification.isServer) classification.type = 'server';
  else if (classification.isModel) classification.type = 'model';
  else if (classification.isJSON) classification.type = 'json'; // NEW
  else classification.type = 'unknown';
  
  return classification;
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         Circuit Breaker + Backoff                          ║
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
      if (errorClass.isAuth || errorClass.isQuota || errorClass.isModel || errorClass.isJSON) {
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
  return CONTEXT_LIMITS[model] || CONTEXT_LIMITS['gpt-4o'];
}

/**
 * Build request for Chat Completions API - FIXED JSON FORMATTING
 * All GPT-5 models now use this unified approach
 */
function buildChatRequest(model, messages, options = {}) {
  // Ensure we have proper message format
  if (typeof messages === 'string') {
    messages = [{ role: 'user', content: messages }];
  }
  
  // Build clean request object with only valid OpenAI parameters
  const req = {
    model: model,
    messages: messages
  };
  
  // Only add parameters that OpenAI actually accepts
  if (typeof options.temperature === 'number' && options.temperature >= 0 && options.temperature <= 2) {
    req.temperature = options.temperature;
  }
  
  if (typeof options.top_p === 'number' && options.top_p >= 0 && options.top_p <= 1) {
    req.top_p = options.top_p;
  }
  
  // Token budgeting - use max_tokens for Chat Completions
  let maxTokens = options.max_completion_tokens || options.max_tokens;
  if (maxTokens) {
    const totalPrompt = messages.map(m => m?.content || '').join('\n');
    const promptTokens = estimateTokens(totalPrompt);
    const capped = clampMaxTokens(promptTokens, maxTokens, ctxCapFor(model));
    req.max_tokens = capped;
  }
  
  // Add streaming if requested
  if (options.stream === true) {
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
      messages: req.messages.length,
      stream: req.stream || false,
      tools: req.tools ? req.tools.length : 0
    });
  }
  
  return req;
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                          Safe Response Extraction                          ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

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

function safeExtractResponseText(completion) {
  try {
    return extractFromChat(completion);
  } catch (err) {
    console.error('❌ [GPT5Client] Extract error:', err.message);
    return `Error extracting response: ${err.message}`;
  }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                            Core Call Orchestrator                          ║
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
// ║                           Primary Public Function                          ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

/**
 * Main GPT‑5 function - Using actual GPT-5 models
 * @param {string} prompt
 * @param {object} options
 *   model?: 'gpt-5'|'gpt-5-mini'|'gpt-5-nano'
 *   temperature?: number
 *   max_completion_tokens?: number
 *   use_cache?: boolean
 *   tools?: array
 *   tool_choice?: string
 */
async function getGPT5Analysis(prompt, options = {}) {
  const start = Date.now();

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt: must be a non‑empty string');
  }

  // Use actual GPT-5 models
  let selectedModel = options.model || GPT5_CONFIG.MINI_MODEL;
  
  // Keep original GPT-5 model names
  const validModels = ['gpt-5', 'gpt-5-mini', 'gpt-5-nano'];
  if (!validModels.includes(selectedModel)) {
    selectedModel = GPT5_CONFIG.MINI_MODEL;
  }

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
    let rawCompletion = null;

    // Use Chat Completions API for all models
    const messages = [{ role: 'user', content: prompt }];
    const req = buildChatRequest(selectedModel, messages, {
      temperature: options.temperature ?? 0.7,
      max_completion_tokens: options.max_completion_tokens || 8000,
      tools: options.tools,
      tool_choice: options.tool_choice
    });

    // FIXED: Ensure clean JSON request
    console.log('🔧 [GPT5Client] Sending request to model:', selectedModel);
    
    rawCompletion = await guardedCall(() => openai.chat.completions.create(req), selectedModel);
    responseText = safeExtractResponseText(rawCompletion);
    
    const u = rawCompletion.usage || {};
    tokensUsed = u.total_tokens || ((u.prompt_tokens || 0) + (u.completion_tokens || 0));

    if (!responseText || (typeof responseText === 'string' && responseText.trim().length === 0)) {
      throw new Error('Empty response received from model');
    }

    // Cache the result
    if (cacheKey && typeof responseText === 'string') {
      responseCache.set(cacheKey, responseText);
    }

    const elapsed = Date.now() - start;
    updateMetrics(selectedModel, true, tokensUsed, elapsed);

    if (GPT5_CONFIG.LOG_RESPONSE_SUMMARY) {
      console.log('◀️ [GPT5Client] getGPT5Analysis done', { 
        model: selectedModel, 
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
    
    // Handle JSON errors specifically
    if (kind.isJSON) {
      console.error('🚨 [GPT5Client] JSON parsing error - check request format');
      throw new Error(`Request formatting error: ${err.message}`);
    }
    
    if (kind.isRate || kind.isAuth || kind.isQuota) {
      // Propagate so upstream can throttle or repair credentials
      throw err;
    }

    // Return a more informative error message
    return (
      'I apologize, but I\'m experiencing technical difficulties.\n\n' +
      `Error details: ${err?.message || err}` + '\n\n' +
      'Please try a shorter message or retry in a moment.'
    );
  }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         Convenience / Quick Wrappers                       ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

async function getQuickNanoResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: 'gpt-5-nano',
    max_completion_tokens: Math.min(6000, GPT5_CONFIG.MAX_COMPLETION_TOKENS)
  });
}

async function getQuickMiniResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: 'gpt-5-mini',
    max_completion_tokens: Math.min(10000, GPT5_CONFIG.MAX_COMPLETION_TOKENS)
  });
}

async function getDeepAnalysis(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: 'gpt-5',
    max_completion_tokens: Math.min(16000, GPT5_CONFIG.MAX_COMPLETION_TOKENS)
  });
}

async function getChatResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: 'gpt-5-chat-latest'
  });
}

async function getChatResponseWithTools(prompt, tools = [], options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: 'gpt-5-chat-latest',
    tools,
    tool_choice: options.tool_choice || 'auto'
  });
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                           Health / Diagnostics                             ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

async function testOpenAIConnection() {
  try {
    console.log('🔍 [GPT5Client] Testing connection with GPT-4o-mini…');
    const test = await getGPT5Analysis('Health check', { 
      model: 'gpt-4o-mini',
      max_completion_tokens: 50 
    });
    return { 
      success: true, 
      result: test, 
      model: 'gpt-4o-mini', 
      gpt5Available: true,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('❌ [GPT5Client] Connection test failed:', err?.message || err);
    return { 
      success: false, 
      error: err?.message || String(err), 
      gpt5Available: false,
      timestamp: new Date().toISOString()
    };
  }
}

async function checkGPT5SystemHealth() {
  const health = {
    gpt5Available: false,
    gpt5MiniAvailable: false,
    gpt5NanoAvailable: false,
    gpt4oAvailable: false,
    gpt4oMiniAvailable: false,
    errors: [],
    warnings: [],
    timestamp: new Date().toISOString(),
    circuitBreaker: getBreakerStatus(),
    cache: {
      enabled: GPT5_CONFIG.ENABLE_CACHING,
      size: responseCache.size(),
      ttl: GPT5_CONFIG.CACHE_TTL_MS
    },
    metrics: getMetrics()
  };

  const tests = [
    { key: 'gpt4oMiniAvailable', model: 'gpt-4o-mini', fn: (prompt) => getGPT5Analysis(prompt, { model: 'gpt-4o-mini', max_completion_tokens: 20 }) },
    { key: 'gpt4oAvailable', model: 'gpt-4o', fn: (prompt) => getGPT5Analysis(prompt, { model: 'gpt-4o', max_completion_tokens: 20 }) },
    { key: 'gpt5NanoAvailable', model: 'gpt-5-nano', fn: getQuickNanoResponse },
    { key: 'gpt5MiniAvailable', model: 'gpt-5-mini', fn: getQuickMiniResponse },
    { key: 'gpt5Available', model: 'gpt-5', fn: getDeepAnalysis }
  ];

  // Test models in parallel for faster health check
  const testPromises = tests.map(async (t) => {
    try {
      await t.fn('Hi', { max_completion_tokens: 20 });
      health[t.key] = true;
      console.log(`✅ [GPT5Client] ${t.model} OK`);
      return { key: t.key, success: true };
    } catch (err) {
      const msg = `${t.model}: ${err?.message || String(err)}`;
      health.errors.push(msg);
      console.log(`❌ [GPT5Client] ${t.model} FAIL — ${msg}`);
      return { key: t.key, success: false, error: msg };
    }
  });

  await Promise.allSettled(testPromises);

  // Add warnings for configuration issues
  if (!process.env.OPENAI_API_KEY) {
    health.warnings.push('OPENAI_API_KEY not set');
  }
  
  if (health.circuitBreaker.state !== 'CLOSED') {
    health.warnings.push(`Circuit breaker is ${health.circuitBreaker.state}`);
  }

  health.overallHealth = (
    health.gpt4oAvailable || health.gpt4oMiniAvailable || 
    health.gpt5Available || health.gpt5MiniAvailable || health.gpt5NanoAvailable
  );

  return health;
}

// Advanced diagnostics
async function runDiagnostics() {
  console.log('🔬 [GPT5Client] Running comprehensive diagnostics...');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    version: '3.2.0-FIXED',
    config: GPT5_CONFIG,
    contextLimits: CONTEXT_LIMITS,
    health: await checkGPT5SystemHealth(),
    metrics: getMetrics(),
    circuitBreaker: getBreakerStatus(),
    cache: {
      enabled: GPT5_CONFIG.ENABLE_CACHING,
      size: responseCache.size(),
      maxSize: responseCache.maxSize,
      ttl: responseCache.ttlMs
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime()
    }
  };

  // Test token estimation accuracy
  const testPrompt = 'This is a test prompt for token estimation accuracy.';
  const estimatedTokens = estimateTokens(testPrompt);
  diagnostics.tokenEstimation = {
    testPrompt: testPrompt,
    estimated: estimatedTokens,
    charsPerToken: testPrompt.length / estimatedTokens
  };

  console.log('✅ [GPT5Client] Diagnostics complete');
  return diagnostics;
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                           Streaming Support                                ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

async function streamGPT5(prompt, options = {}) {
  const emitter = new EventEmitter();
  let selectedModel = options.model || GPT5_CONFIG.MINI_MODEL;

  // Emit metadata first
  emitter.emit('start', { model: selectedModel, api: 'chat' });

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

      const messages = [{ role: 'user', content: prompt }];
      const req = buildChatRequest(selectedModel, messages, {
        temperature: options.temperature ?? 0.7,
        max_completion_tokens: options.max_completion_tokens || 8000,
        stream: true,
        tools: options.tools,
        tool_choice: options.tool_choice
      });

      const stream = await openai.chat.completions.create(req);

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

    } catch (error) {
      emitter.emit('error', error);
    }
  });

  return emitter;
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                           Batch Processing                                 ║
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
// ║                           Utility Functions                                ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// Request builder for custom use cases
function buildRequest(model, input, options = {}) {
  const messages = Array.isArray(input) ? input : [{ role: 'user', content: input }];
  return buildChatRequest(model, messages, options);
}

// Response builder for custom formatting
function buildMessages(messages, systemMessage = null) {
  const formattedMessages = [];
  
  if (systemMessage) {
    formattedMessages.push({ role: 'system', content: systemMessage });
  }
  
  if (typeof messages === 'string') {
    formattedMessages.push({ role: 'user', content: messages });
  } else if (Array.isArray(messages)) {
    formattedMessages.push(...messages);
  }
  
  return formattedMessages;
}

// Safe JSON parsing for responses
function safeJSONParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn('⚠️ [GPT5Client] JSON parse failed:', err.message);
    return fallback;
  }
}

// Text processing utilities
function truncateText(text, maxLength = 1000, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

function cleanText(text) {
  if (!text) return '';
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                            File Operations                                 ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

async function processFile(filePath, options = {}) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileStats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    console.log(`📄 [GPT5Client] Processing file: ${filePath} (${fileStats.size} bytes)`);
    
    // Basic file type handling
    let processedContent = content;
    if (ext === '.json') {
      const parsed = safeJSONParse(content);
      if (parsed) {
        processedContent = JSON.stringify(parsed, null, 2);
      }
    }
    
    const prompt = options.prompt || `Please analyze this ${ext} file:\n\n${processedContent}`;
    
    return await getGPT5Analysis(prompt, {
      model: options.model || GPT5_CONFIG.MINI_MODEL,
      max_completion_tokens: options.max_completion_tokens || 12000
    });
    
  } catch (error) {
    console.error('❌ [GPT5Client] File processing error:', error.message);
    throw new Error(`Failed to process file ${filePath}: ${error.message}`);
  }
}

async function saveResponse(response, filename, options = {}) {
  try {
    const outputPath = options.outputDir ? path.join(options.outputDir, filename) : filename;
    const content = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
    
    await fs.writeFile(outputPath, content, 'utf-8');
    console.log(`💾 [GPT5Client] Saved response to: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('❌ [GPT5Client] Save error:', error.message);
    throw new Error(`Failed to save response: ${error.message}`);
  }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                              Startup Message                               ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// System startup message
console.log('🎯 [GPT5Client] JSON-Fixed GPT-5 Client loaded (v3.2.0)');
console.log('✨ FIXED: JSON body parsing errors resolved');
console.log('🔄 Using Chat Completions API for all models');
console.log('⚡ Ready for GPT-4o/GPT-4o-mini → GPT-5 routing when available');

if (GPT5_CONFIG.ENABLE_CACHING) {
  console.log('💾 Response caching enabled');
}

if (GPT5_CONFIG.ENABLE_METRICS) {
  console.log('📊 Metrics collection enabled');
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                                   Exports                                  ║
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
  runDiagnostics,
  
  // Utilities
  buildRequest,
  buildChatRequest,
  buildMessages,
  safeExtractResponseText,
  safeJSONParse,
  truncateText,
  cleanText,
  
  // File operations
  processFile,
  saveResponse,
  
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
  },
  
  // Configuration
  openai,
  GPT5_CONFIG,
  CONTEXT_LIMITS,
  
  // Token utilities
  estimateTokens,
  clampMaxTokens,
  
  // Error classification
  classifyError
};
