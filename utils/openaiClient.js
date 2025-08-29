'use strict';

// utils/openaiClient.js — GPT‑5 Client v3 (Aug 2025)
// ----------------------------------------------------------------------------
// Purpose
//   • Unified client for GPT‑5 family (Full/Mini/Nano) via Responses API +
//     safe Chat Completions fallback (gpt‑4o).
//   • Consistent parameter handling, circuit breaker, retry/backoff, telemetry.
//   • Safe response extraction (handles output_text + output array) and token
//     budgeting with light estimation + per‑model context limits.
//   • Convenience wrappers: quick nano/mini, deep analysis, health checks.
//
// Design Notes
//   • GPT‑5 models are routed through Responses API only.
//   • Chat Completions is used only for fallback (gpt‑4o by default).
//   • We only send documented fields to each API.
//   • Highly commented for clarity; production‑ready defaults.
// ----------------------------------------------------------------------------

require('dotenv').config();
const { OpenAI } = require('openai');

// If you later enable streaming, you can wire an EventEmitter.
// const { EventEmitter } = require('events');

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                              Client Bootstrap                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: Number(process.env.OPENAI_TIMEOUT_MS || 180000), // 3 min
  maxRetries: Number(process.env.OPENAI_SDK_MAX_RETRIES || 1),
  defaultHeaders: {
    'User-Agent': 'IMPERIUM-VAULT-GPT5/3.0.0'
  }
});

console.log('[GPT5Client] Booting v3…');
console.log(`[GPT5Client] API Key: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                               Model Catalog                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const GPT5_CONFIG = {
  PRIMARY_MODEL: process.env.GPT5_PRIMARY_MODEL || 'gpt-5',
  MINI_MODEL: process.env.GPT5_MINI_MODEL || 'gpt-5-mini',
  NANO_MODEL: process.env.GPT5_NANO_MODEL || 'gpt-5-nano',

  // Chat is used only as a non‑reasoning fallback
  CHAT_FALLBACK_MODEL: process.env.CHAT_FALLBACK_MODEL || 'gpt-4o',

  // Completion / output caps (Responses uses max_output_tokens; Chat uses max_tokens)
  MAX_COMPLETION_TOKENS: Number(process.env.GPT5_MAX_COMPLETION_TOKENS || 16384),

  // Reasoning efforts officially supported: low | medium | high
  DEFAULT_REASONING: process.env.GPT5_DEFAULT_REASONING || 'medium',

  // Logging toggles
  LOG_REQUEST_SUMMARY: process.env.GPT5_LOG_REQUESTS !== '0',
  LOG_RESPONSE_SUMMARY: process.env.GPT5_LOG_RESPONSES !== '0',
  LOG_ERRORS: process.env.GPT5_LOG_ERRORS !== '0'
};

// Per‑model context window limits (tokens). Use env overrides if needed.
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

console.log(`[GPT5Client] Models: full=${GPT5_CONFIG.PRIMARY_MODEL} mini=${GPT5_CONFIG.MINI_MODEL} nano=${GPT5_CONFIG.NANO_MODEL} chatFallback=${GPT5_CONFIG.CHAT_FALLBACK_MODEL}`);

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                             Utility: Token Math                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

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
  const req = Math.max(16, Math.min(requestedMax || 8000, GPT5_CONFIG.MAX_COMPLETION_TOKENS));
  const safetyHeadroom = 1024; // reserve for system/tooling/overheads
  const room = Math.max(256, ctxCap - promptTokens - safetyHeadroom);
  return Math.max(16, Math.min(req, room));
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                        Utility: Time + Error Typing                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const ts = () => new Date().toISOString();

function classifyError(err) {
  const msg = String(err?.message || err || '');
  return {
    isRate: /rate[_\s-]?limit|quota/i.test(msg),
    isTimeout: /timeout|ETIMEDOUT|ECONNRESET/i.test(msg),
    isAuth: /unauthorized|invalid api key|401/i.test(msg),
    isServer: /5\d\d|server error|bad gateway/i.test(msg),
    isNetwork: /ENOTFOUND|EAI_AGAIN|network/i.test(msg)
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                         Circuit Breaker + Backoff                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const breaker = {
  failures: 0,
  openedAt: 0,
  state: 'CLOSED', // CLOSED → OPEN → HALF_OPEN
  openAfter: Number(process.env.GPT5_BREAKER_OPEN_AFTER || 3),
  cooldownMs: Number(process.env.GPT5_BREAKER_COOLDOWN_MS || 30000)
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

async function backoffRetry(fn, { tries = 2, baseMs = 600 } = {}) {
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

  if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
    console.log('[GPT5Client] ResponsesRequest', {
      model: req.model,
      reasoning: req.reasoning?.effort,
      max_output_tokens: req.max_output_tokens,
      prompt_tokens_est: promptTokens
    });
  }
  return req;
}

/**
 * Build request for Chat Completions (fallback only — gpt‑4o default).
 */
function buildChatRequest(model, messages, options = {}) {
  const req = { model, messages };
  if (options.temperature !== undefined) req.temperature = Math.max(0, Math.min(2, options.temperature));

  let maxTokens = null;
  if (options.max_completion_tokens != null) maxTokens = options.max_completion_tokens; // internal naming
  if (options.max_tokens != null) maxTokens = options.max_tokens; // compat

  const totalPrompt = messages.map(m => m?.content || '').join('\n');
  const promptTokens = estimateTokens(totalPrompt);
  const capped = clampMaxTokens(promptTokens, maxTokens ?? 8000, ctxCapFor(model));
  req.max_tokens = capped;

  if (options.top_p !== undefined) req.top_p = Math.max(0, Math.min(1, options.top_p));

  if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
    console.log('[GPT5Client] ChatRequest', {
      model: req.model,
      temperature: req.temperature,
      max_tokens: req.max_tokens,
      prompt_tokens_est: promptTokens
    });
  }
  return req;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                          Safe Response Extraction                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function extractFromResponses(completion) {
  // Prefer convenience field if present
  if (typeof completion?.output_text === 'string' && completion.output_text.length) {
    return completion.output_text;
  }
  // Fallback to iterating the output array
  if (!completion || !Array.isArray(completion.output)) {
    console.warn('[GPT5Client] Invalid Responses payload (no output/output_text)');
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
    console.warn('[GPT5Client] Invalid Chat payload (no choices array)');
    return 'Response structure invalid - no choices found';
  }
  const content = completion.choices?.[0]?.message?.content;
  return (content && String(content).trim()) || 'No message content found in response';
}

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

async function guardedCall(fn) {
  if (!breakerAllow()) {
    const wait = Math.max(0, breaker.cooldownMs - (Date.now() - breaker.openedAt));
    throw new Error(`Circuit open, retry after ${Math.ceil(wait / 1000)}s`);
  }
  try {
    const result = await backoffRetry(fn, { tries: 2, baseMs: 700 });
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
 * Main GPT‑5 function with routing (Responses) and fallback (Chat).
 * @param {string} prompt
 * @param {object} options
 *   model?: 'gpt-5'|'gpt-5-mini'|'gpt-5-nano'
 *   reasoning_effort?: 'low'|'medium'|'high'|'minimal*'
 *   temperature?: number (fallback only)
 *   max_completion_tokens?: number
 */
async function getGPT5Analysis(prompt, options = {}) {
  const start = Date.now();

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt: must be a non‑empty string');
  }

  const selectedModel = options.model || GPT5_CONFIG.MINI_MODEL;
  const useResponsesApi = REASONING_MODELS.has(selectedModel);

  if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
    console.log('[GPT5Client] ▶ getGPT5Analysis', { model: selectedModel, len: prompt.length });
  }

  // Character guardrails before token budgeting (rare but helpful)
  if (prompt.length > 180000) {
    console.warn('[GPT5Client] Prompt too long, truncating by chars…');
    prompt = prompt.slice(0, 180000) + '\n… (truncated)';
  }

  try {
    let responseText = '';
    let tokensUsed = 0;
    let apiUsed = 'unknown';

    if (useResponsesApi) {
      apiUsed = 'responses';
      const req = buildResponsesRequest(selectedModel, prompt, {
        reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
        max_completion_tokens: options.max_completion_tokens || 8000
      });

      const completion = await guardedCall(() => openai.responses.create(req));
      responseText = safeExtractResponseText(completion, 'responses');

      const u = completion.usage || {};
      tokensUsed = u.total_tokens ?? ((u.input_tokens || 0) + (u.output_tokens || 0));
      if (u.reasoning_tokens != null) {
        console.log('[GPT5Client] Reasoning tokens:', u.reasoning_tokens);
      }
    } else {
      // Fallback path — only gpt‑4o (or configured) should land here
      apiUsed = 'chat';
      const messages = [{ role: 'user', content: prompt }];
      const req = buildChatRequest(GPT5_CONFIG.CHAT_FALLBACK_MODEL, messages, {
        temperature: options.temperature ?? 0.7,
        max_completion_tokens: options.max_completion_tokens || 8000
      });

      const completion = await guardedCall(() => openai.chat.completions.create(req));
      responseText = safeExtractResponseText(completion, 'chat');
      const u = completion.usage || {};
      tokensUsed = u.total_tokens || ((u.prompt_tokens || 0) + (u.completion_tokens || 0));
    }

    if (!responseText) throw new Error('Empty response received from model');

    if (GPT5_CONFIG.LOG_RESPONSE_SUMMARY) {
      const elapsed = Date.now() - start;
      console.log('[GPT5Client] ◀ getGPT5Analysis done', { model: selectedModel, api: apiUsed, tokensUsed, ms: elapsed, outLen: responseText.length });
    }
    return responseText;
  } catch (err) {
    if (GPT5_CONFIG.LOG_ERRORS) console.error('[GPT5Client] getGPT5Analysis error:', err);

    const kind = classifyError(err);
    if (kind.isRate || kind.isAuth) {
      // Propagate so upstream can throttle or repair credentials
      throw err;
    }

    // Final fallback — Chat Completions (gpt‑4o)
    console.log('[GPT5Client] Attempting fallback →', GPT5_CONFIG.CHAT_FALLBACK_MODEL);
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
      console.error('[GPT5Client] Fallback failed:', fbErr?.message || fbErr);
      return (
        'I apologize, but I\'m experiencing technical difficulties.\n\n' +
        `Error details: ${err?.message || err}` + '\n\n' +
        'Please try a shorter message or retry in a moment.'
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

// (Optional) Chat‑style wrapper through fallback only — provided for parity
async function getChatResponse(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: 'chat-fallback' // forces fallback path
  });
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                           Health / Diagnostics                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function testOpenAIConnection() {
  try {
    console.log('[GPT5Client] Testing GPT‑5 Nano…');
    const test = await getQuickNanoResponse('Health check', { max_completion_tokens: 50 });
    return { success: true, result: test, model: GPT5_CONFIG.NANO_MODEL, gpt5Available: true };
  } catch (err) {
    console.error('[GPT5Client] Nano test failed:', err?.message || err);
    try {
      const fb = await openai.chat.completions.create({
        model: GPT5_CONFIG.CHAT_FALLBACK_MODEL,
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 30
      });
      const content = fb?.choices?.[0]?.message?.content || '(no content)';
      return { success: true, result: content, model: GPT5_CONFIG.CHAT_FALLBACK_MODEL, gpt5Available: false, fallback: true };
    } catch (fbErr) {
      return { success: false, error: err?.message || String(err), fallbackError: fbErr?.message || String(fbErr), gpt5Available: false };
    }
  }
}

async function checkGPT5SystemHealth() {
  const health = {
    gpt5Available: false,
    gpt5MiniAvailable: false,
    gpt5NanoAvailable: false,
    fallbackWorking: false,
    errors: [],
    parameterConsistency: 'ResponsesAPI.max_output_tokens standard; Chat.max_tokens for fallback'
  };

  const tests = [
    { key: 'gpt5NanoAvailable', model: GPT5_CONFIG.NANO_MODEL, fn: getQuickNanoResponse },
    { key: 'gpt5MiniAvailable', model: GPT5_CONFIG.MINI_MODEL, fn: getQuickMiniResponse },
    { key: 'gpt5Available', model: GPT5_CONFIG.PRIMARY_MODEL, fn: getDeepAnalysis }
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
      model: GPT5_CONFIG.CHAT_FALLBACK_MODEL,
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
// ║                       Optional: Streaming (scaffold only)                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// async function streamGPT5(prompt, options = {}) {
//   const emitter = new EventEmitter();
//   queueMicrotask(async () => {
//     try {
//       const selectedModel = options.model || GPT5_CONFIG.MINI_MODEL;
//       const useResponsesApi = REASONING_MODELS.has(selectedModel);
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
//         const req = buildChatRequest(GPT5_CONFIG.CHAT_FALLBACK_MODEL, [{ role: 'user', content: prompt }], {
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
  CONTEXT_LIMITS

  // Optional streaming export (commented above)
  // streamGPT5
};
