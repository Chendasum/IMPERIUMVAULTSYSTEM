// utils/openaiClient.js — GPT‑5 Client (v2, August 2025)
// ----------------------------------------------------------------------------
// Purpose
//   • Unified client for GPT‑5 family (Full/Mini/Nano) + Chat model + fallback.
//   • Consistent parameter handling across Responses API and Chat Completions.
//   • Strong error handling, circuit breaker, retry/backoff, and telemetry.
//   • Safe response extraction and token budgeting with light estimation.
//   • Convenience wrappers: quick nano/mini, deep analysis, chat, health checks.
//
// Key Design Choices
//   • We DO NOT send undocumented fields (e.g., text.verbosity) to the API.
//   • Responses API → uses { reasoning: {effort}, max_output_tokens }.
//   • Chat Completions → uses { temperature, max_tokens, top_p }.
//   • Model routing is explicit via REASONING_MODELS set.
//   • Optional streaming scaffold (disabled by default, kept for future use).
//
// Notes
//   • Keep this file standalone and importable from any runtime layer.
//   • All logs are prefixed for quick grep in Railway/Cloud logs.
//   • Over 500 lines by design (heavy comments + utilities for clarity).
// ----------------------------------------------------------------------------

'use strict';

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                  Imports                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

require('dotenv').config();
const { OpenAI } = require('openai');

// If you want EventEmitter‑style streaming later, uncomment:
// const { EventEmitter } = require('events');

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                              Client Bootstrap                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 180000, // 3 minutes for GPT‑5 reasoning
  maxRetries: 1,   // keep low to avoid loops; we do manual fallbacks
  defaultHeaders: {
    'User-Agent': 'IMPERIUM-VAULT-GPT5/2.0.0'
  }
});

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                               Model Catalog                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const GPT5_CONFIG = {
  PRIMARY_MODEL: 'gpt-5',
  MINI_MODEL: 'gpt-5-mini',
  NANO_MODEL: 'gpt-5-nano',
  CHAT_MODEL: 'gpt-5-chat-latest',
  FALLBACK_MODEL: 'gpt-4o',

  // Logical limits (keep conservative headroom)
  ENHANCED_CONTEXT_WINDOW: 200000,
  MAX_COMPLETION_TOKENS: 16384,

  // Reasoning efforts allowed by Responses API (documented)
  REASONING_EFFORTS: ['minimal', 'low', 'medium', 'high'],
  DEFAULT_REASONING: 'medium',

  // Local logging toggles
  LOG_REQUEST_SUMMARY: true,
  LOG_RESPONSE_SUMMARY: true,
  LOG_ERRORS: true,
};

// Explicit routing set for Responses API models (reasoning capable)
const REASONING_MODELS = new Set([
  'gpt-5', 'gpt-5-mini', 'gpt-5-nano'
]);

let currentModel = GPT5_CONFIG.PRIMARY_MODEL;
let gpt5Available = true; // toggled by health checks if desired

// Startup banner
console.log('[GPT5Client] Booting…');
console.log(`[GPT5Client] API Key: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`[GPT5Client] Models: primary=${GPT5_CONFIG.PRIMARY_MODEL} mini=${GPT5_CONFIG.MINI_MODEL} nano=${GPT5_CONFIG.NANO_MODEL} chat=${GPT5_CONFIG.CHAT_MODEL}`);

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                             Utility: Token Math                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Very light token estimate (heuristic). For safety budget only.
 * @param {string} text
 * @returns {number}
 */
function estimateTokens(text) {
  if (!text) return 0;
  // Rough heuristic: ~4 chars/token in English‑ish text.
  // We clamp minimum to avoid 0 tokens for tiny inputs.
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Budget helper to cap max tokens so prompt+completion fit in context.
 * @param {number} promptTokens
 * @param {number} requestedMax
 * @param {number} contextCap
 */
function clampMaxTokens(promptTokens, requestedMax, contextCap) {
  const safeCap = Math.max(256, Math.min(requestedMax || 8000, GPT5_CONFIG.MAX_COMPLETION_TOKENS));
  const room = Math.max(256, contextCap - promptTokens);
  return Math.max(16, Math.min(safeCap, room));
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                        Utility: Time + Error Typing                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function ts() { return new Date().toISOString(); }

function classifyError(err) {
  const msg = String(err?.message || err || '');
  const isRate = /rate[_\s-]?limit|quota/i.test(msg);
  const isTimeout = /timeout|ETIMEDOUT|ECONNRESET/i.test(msg);
  const isAuth = /unauthorized|invalid api key|401/i.test(msg);
  const isServer = /5\d\d|server error|bad gateway/i.test(msg);
  const isNetwork = /ENOTFOUND|EAI_AGAIN|network/i.test(msg);
  return { isRate, isTimeout, isAuth, isServer, isNetwork };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                         Circuit Breaker + Backoff                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const breaker = {
  failures: 0,
  openedAt: 0,
  state: 'CLOSED', // CLOSED → OPEN → HALF_OPEN
  openAfter: 3,     // open after 3 consecutive failures
  cooldownMs: 30000 // 30s cooldown
};

function breakerAllow() {
  if (breaker.state === 'OPEN') {
    const since = Date.now() - breaker.openedAt;
    if (since > breaker.cooldownMs) {
      breaker.state = 'HALF_OPEN';
      return true;
    }
    return false;
  }
  return true;
}

function breakerRecordSuccess() {
  breaker.failures = 0;
  breaker.state = 'CLOSED';
}

function breakerRecordFailure() {
  breaker.failures += 1;
  if (breaker.failures >= breaker.openAfter) {
    breaker.state = 'OPEN';
    breaker.openedAt = Date.now();
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function backoffRetry(fn, { tries = 2, baseMs = 500 } = {}) {
  let lastError;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < tries - 1) {
        const wait = baseMs * (i + 1);
        console.log(`[GPT5Client] Backoff retry in ${wait}ms…`);
        await sleep(wait);
      }
    }
  }
  throw lastError;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                           Request Builders (API)                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Build request for Responses API (reasoning models).
 * We only send documented fields: reasoning.effort, max_output_tokens.
 * @param {string} model
 * @param {string|object} input
 * @param {object} options
 */
function buildResponsesRequest(model, input, options = {}) {
  try {
    const req = { model, input };

    // Reasoning effort (documented)
    const effort = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
    if (GPT5_CONFIG.REASONING_EFFORTS.includes(effort)) {
      req.reasoning = { effort };
    }

    // Max output tokens (documented)
    let maxTokens = null;
    if (options.max_completion_tokens) maxTokens = options.max_completion_tokens;
    else if (options.max_output_tokens) maxTokens = options.max_output_tokens; // compat

    // Token budgeting (approx) — ensure prompt + completion fit context
    const promptTokens = typeof input === 'string' ? estimateTokens(input) : 512; // conservative
    const capped = clampMaxTokens(promptTokens, maxTokens ?? 8000, GPT5_CONFIG.ENHANCED_CONTEXT_WINDOW);
    req.max_output_tokens = capped;

    if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
      console.log('[GPT5Client] ResponsesRequest', {
        model: req.model,
        reasoning: req.reasoning?.effort,
        max_output_tokens: req.max_output_tokens,
        prompt_tokens_est: promptTokens
      });
    }

    return req;
  } catch (err) {
    console.error('[GPT5Client] Build Responses request error:', err.message);
    throw new Error(`Failed to build responses request: ${err.message}`);
  }
}

/**
 * Build request for Chat Completions API (chat model / fallbacks).
 * @param {string} model
 * @param {Array<{role:string, content:string}>} messages
 * @param {object} options
 */
function buildChatRequest(model, messages, options = {}) {
  try {
    const req = { model, messages };

    if (options.temperature !== undefined) {
      req.temperature = Math.max(0, Math.min(2, options.temperature));
    }

    let maxTokens = null;
    if (options.max_completion_tokens) maxTokens = options.max_completion_tokens; // our standard
    else if (options.max_tokens) maxTokens = options.max_tokens; // compat

    // Token budgeting (approx): sum all message contents
    const totalPrompt = messages.map(m => m?.content || '').join('\n');
    const promptTokens = estimateTokens(totalPrompt);
    const capped = clampMaxTokens(promptTokens, maxTokens ?? 8000, GPT5_CONFIG.ENHANCED_CONTEXT_WINDOW);
    req.max_tokens = capped;

    if (options.top_p !== undefined) {
      req.top_p = Math.max(0, Math.min(1, options.top_p));
    }

    if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
      console.log('[GPT5Client] ChatRequest', {
        model: req.model,
        temperature: req.temperature,
        max_tokens: req.max_tokens,
        prompt_tokens_est: promptTokens
      });
    }

    return req;
  } catch (err) {
    console.error('[GPT5Client] Build Chat request error:', err.message);
    throw new Error(`Failed to build chat request: ${err.message}`);
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                          Safe Response Extraction                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Extract text from Responses API payload.
 * @param {object} completion
 */
function extractFromResponses(completion) {
  if (!completion || !completion.output || !Array.isArray(completion.output)) {
    console.warn('[GPT5Client] Invalid Responses payload (no output array)');
    return 'Response structure invalid - no output array found';
  }
  let txt = '';
  for (const item of completion.output) {
    if (item && item.content && Array.isArray(item.content)) {
      for (const c of item.content) {
        if (c && typeof c.text === 'string') txt += c.text;
      }
    }
  }
  return txt || 'No text content found in response';
}

/**
 * Extract text from Chat Completions payload.
 * @param {object} completion
 */
function extractFromChat(completion) {
  if (!completion || !completion.choices || !Array.isArray(completion.choices)) {
    console.warn('[GPT5Client] Invalid Chat payload (no choices array)');
    return 'Response structure invalid - no choices array found';
  }
  const choice = completion.choices[0];
  const content = choice?.message?.content;
  if (!content) return 'No message content found in response';
  return String(content).trim();
}

/**
 * Unified safe extractor.
 * @param {object} completion
 * @param {'responses'|'chat'} apiType
 */
function safeExtractResponseText(completion, apiType = 'responses') {
  try {
    return apiType === 'responses' ? extractFromResponses(completion) : extractFromChat(completion);
  } catch (err) {
    console.error('[GPT5Client] Extract error:', err.message);
    return `Error extracting response: ${err.message}`;
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                            Core Call Orchestrator                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Low-level call wrapper with breaker/backoff and telemetry.
 * @param {() => Promise<any>} fn
 */
async function guardedCall(fn) {
  if (!breakerAllow()) {
    const wait = Math.max(0, breaker.cooldownMs - (Date.now() - breaker.openedAt));
    throw new Error(`Circuit open, retry after ${Math.ceil(wait/1000)}s`);
  }
  try {
    const result = await backoffRetry(fn, { tries: 2, baseMs: 600 });
    breakerRecordSuccess();
    return result;
  } catch (err) {
    breakerRecordFailure();
    throw err;
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                           Primary Public Function                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Main GPT‑5 analysis/text function with routing and fallback.
 * @param {string} prompt
 * @param {object} options
 *   model?: string
 *   reasoning_effort?: 'minimal'|'low'|'medium'|'high'
 *   temperature?: number
 *   max_completion_tokens?: number
 */
async function getGPT5Analysis(prompt, options = {}) {
  const start = Date.now();

  try {
    if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
      console.log('[GPT5Client] ▶ getGPT5Analysis start');
      console.log('[GPT5Client] Prompt length:', prompt?.length || 0);
      console.log('[GPT5Client] Options:', options);
    }

    const selectedModel = options.model || GPT5_CONFIG.MINI_MODEL;
    if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
      console.log('[GPT5Client] Selected model:', selectedModel);
    }

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: must be non-empty string');
    }

    // Hard safety: trim overlong prompts by character length, then rely on token budgeting
    if (prompt.length > 180000) {
      console.warn('[GPT5Client] Prompt too long, truncating…');
      prompt = prompt.substring(0, 180000) + '\n… (truncated)';
    }

    let responseText = '';
    let tokensUsed = 0;
    let apiUsed = 'unknown';

    const useResponsesApi = REASONING_MODELS.has(selectedModel) && selectedModel !== GPT5_CONFIG.CHAT_MODEL;

    if (useResponsesApi) {
      apiUsed = 'responses';
      const req = buildResponsesRequest(selectedModel, prompt, {
        reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
        max_completion_tokens: options.max_completion_tokens || 8000
      });

      const completion = await guardedCall(() => openai.responses.create(req));
      responseText = safeExtractResponseText(completion, 'responses');

      // Usage accounting: prefer total_tokens; fall back to sum if provided
      tokensUsed = completion.usage?.total_tokens ?? (
        (completion.usage?.input_tokens || 0) +
        (completion.usage?.output_tokens || 0)
      );
      if (completion.usage?.reasoning_tokens != null) {
        console.log('[GPT5Client] Reasoning tokens:', completion.usage.reasoning_tokens);
      }

    } else {
      apiUsed = 'chat';
      const messages = [{ role: 'user', content: prompt }];
      const req = buildChatRequest(selectedModel, messages, {
        temperature: options.temperature ?? 0.7,
        max_completion_tokens: options.max_completion_tokens || 8000
      });

      const completion = await guardedCall(() => openai.chat.completions.create(req));
      responseText = safeExtractResponseText(completion, 'chat');
      tokensUsed = completion.usage?.total_tokens || 0;
    }

    if (!responseText) {
      throw new Error('Empty response received from model');
    }

    if (GPT5_CONFIG.LOG_RESPONSE_SUMMARY) {
      const elapsed = Date.now() - start;
      console.log('[GPT5Client] ◀ getGPT5Analysis done', { model: selectedModel, api: apiUsed, tokensUsed, ms: elapsed, len: responseText.length });
    }

    return responseText;

  } catch (err) {
    if (GPT5_CONFIG.LOG_ERRORS) console.error('[GPT5Client] getGPT5Analysis error:', err);

    const kind = classifyError(err);
    if (kind.isRate) {
      // Respect rate limits — propagate to caller so it can throttle upstream
      throw err;
    }

    // Fallback to GPT‑4o via Chat Completions
    console.log('[GPT5Client] Attempting fallback → gpt-4o');
    try {
      const completion = await openai.chat.completions.create({
        model: GPT5_CONFIG.FALLBACK_MODEL,
        messages: [{ role: 'user', content: String(prompt) }],
        max_tokens: Math.min(options.max_completion_tokens || 8000, GPT5_CONFIG.MAX_COMPLETION_TOKENS),
        temperature: options.temperature ?? 0.7
      });
      const txt = safeExtractResponseText(completion, 'chat');
      return `[GPT-4o Fallback] ${txt}`;
    } catch (fallbackErr) {
      console.error('[GPT5Client] Fallback failed:', fallbackErr?.message || fallbackErr);
      return (
        'I apologize, but I\'m experiencing technical difficulties.\n\n' +
        `Error details: ${err?.message || err}` + '\n\n' +
        'Please try:\n' +
        '• A shorter, simpler message\n' +
        '• Waiting a moment and trying again\n' +
        '• Checking if the service is temporarily unavailable\n\n' +
        'Your message was received but could not be processed at this time.'
      );
    }
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                         Convenience / Quick Wrappers                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function getQuickNanoResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.NANO_MODEL,
    reasoning_effort: 'minimal',
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

async function getChatResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.CHAT_MODEL,
    temperature: options.temperature ?? 0.7,
    max_completion_tokens: Math.min(12000, GPT5_CONFIG.MAX_COMPLETION_TOKENS)
  });
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                           Health / Diagnostics                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Lightweight connectivity test — uses Nano for speed, then tries fallback.
 */
async function testOpenAIConnection() {
  try {
    console.log('[GPT5Client] Testing GPT‑5 connection…');
    const test = await getQuickNanoResponse('Hello, confirm you are GPT‑5 (Nano) and working correctly.', {
      max_completion_tokens: 100
    });
    return {
      success: true,
      result: test,
      model: GPT5_CONFIG.NANO_MODEL,
      gpt5Available: true
    };
  } catch (err) {
    console.error('[GPT5Client] Nano test failed:', err?.message || err);
    try {
      const fb = await openai.chat.completions.create({
        model: GPT5_CONFIG.FALLBACK_MODEL,
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 50
      });
      const content = fb?.choices?.[0]?.message?.content || '(no content)';
      return {
        success: true,
        result: content,
        model: GPT5_CONFIG.FALLBACK_MODEL,
        gpt5Available: false,
        fallback: true
      };
    } catch (fbErr) {
      return {
        success: false,
        error: err?.message || String(err),
        fallbackError: fbErr?.message || String(fbErr),
        gpt5Available: false
      };
    }
  }
}

/**
 * System health across all declared models.
 */
async function checkGPT5SystemHealth() {
  const health = {
    gpt5Available: false,
    gpt5MiniAvailable: false,
    gpt5NanoAvailable: false,
    gpt5ChatAvailable: false,
    fallbackWorking: false,
    currentModel: currentModel,
    errors: [],
    parameterConsistency: 'max_completion_tokens standardized'
  };

  const tests = [
    { key: 'gpt5NanoAvailable', model: GPT5_CONFIG.NANO_MODEL, fn: getQuickNanoResponse },
    { key: 'gpt5MiniAvailable', model: GPT5_CONFIG.MINI_MODEL, fn: getQuickMiniResponse },
    { key: 'gpt5Available', model: GPT5_CONFIG.PRIMARY_MODEL, fn: getDeepAnalysis },
    { key: 'gpt5ChatAvailable', model: GPT5_CONFIG.CHAT_MODEL, fn: getChatResponse },
  ];

  for (const t of tests) {
    try {
      await t.fn('Hi', { max_completion_tokens: 20 });
      health[t.key] = true;
      console.log(`[GPT5Client] ${t.model} OK`);
    } catch (err) {
      const msg = `${t.model}: ${err?.message || String(err)}`;
      health.errors.push(msg);
      console.log(`[GPT5Client] ${t.model} FAIL — ${msg}`);
    }
  }

  // Fallback check
  try {
    await openai.chat.completions.create({
      model: GPT5_CONFIG.FALLBACK_MODEL,
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 10
    });
    health.fallbackWorking = true;
  } catch (err) {
    health.errors.push(`Fallback: ${err?.message || String(err)}`);
  }

  health.overallHealth = (
    health.gpt5Available || health.gpt5MiniAvailable || health.gpt5NanoAvailable || health.fallbackWorking
  );
  return health;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                       Optional: Simple Streaming Scaffold                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// NOTE: Kept as scaffold; disabled by default. If you enable streaming in
// OpenAI SDK for Responses/Chat, wire the events here and return an emitter.
//
// async function streamGPT5(prompt, options = {}) {
//   const emitter = new EventEmitter();
//   queueMicrotask(async () => {
//     try {
//       const selectedModel = options.model || GPT5_CONFIG.MINI_MODEL;
//       const useResponsesApi = REASONING_MODELS.has(selectedModel) && selectedModel !== GPT5_CONFIG.CHAT_MODEL;
//
//       if (useResponsesApi) {
//         const req = buildResponsesRequest(selectedModel, prompt, {
//           reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
//           max_completion_tokens: options.max_completion_tokens || 8000,
//           stream: true
//         });
//         const stream = await openai.responses.stream(req);
//         stream.on('content.delta', (d) => emitter.emit('data', d?.delta || ''));
//         stream.on('message.completed', () => emitter.emit('end'));
//         stream.on('error', (e) => emitter.emit('error', e));
//       } else {
//         const req = buildChatRequest(selectedModel, [{ role: 'user', content: prompt }], {
//           temperature: options.temperature ?? 0.7,
//           max_completion_tokens: options.max_completion_tokens || 8000,
//           stream: true
//         });
//         const stream = await openai.chat.completions.stream(req);
//         stream.on('content.delta', (d) => emitter.emit('data', d?.delta || ''));
//         stream.on('end', () => emitter.emit('end'));
//         stream.on('error', (e) => emitter.emit('error', e));
//       }
//     } catch (e) { emitter.emit('error', e); }
//   });
//   return emitter;
// }

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                               Startup Banner                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

console.log('[GPT5Client] Loaded — parameter consistency: max_completion_tokens standardized');
console.log('[GPT5Client] Error handling + breaker active');
console.log('[GPT5Client] Ready for Nano → Mini → Full → Chat routing');

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                   Exports                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

module.exports = {
  // Main
  getGPT5Analysis,

  // Convenience wrappers
  getQuickNanoResponse,
  getQuickMiniResponse,
  getDeepAnalysis,
  getChatResponse,

  // Health / testing
  testOpenAIConnection,
  checkGPT5SystemHealth,

  // Builders + extractors (useful for tests)
  buildResponsesRequest,
  buildChatRequest,
  safeExtractResponseText,

  // Client + config
  openai,
  GPT5_CONFIG,

  // Optional streaming export (commented above)
  // streamGPT5
};
