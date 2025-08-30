// utils/openaiClient.js
// -----------------------------------------------------------------------------
// GPT-5 Client (Responses API + Chat Completions) with:
// - Auto route by model (Responses for gpt-5/gpt-5-mini/gpt-5-nano, Chat for gpt-5-chat-*)
// - Correct param mapping (verbosity -> text.verbosity; reasoning -> {effort})
// - max_output_tokens vs max_tokens handled properly
// - Robust normalization to plain string
// - Retry + simple circuit breaker
// - Compact cost/usage logging (compatible with your logger.js)
// -----------------------------------------------------------------------------

'use strict';

const PKG_NAME = 'openaiClient';
const DEFAULT_TIMEOUT_MS = 30_000;

// Prefer global fetch (Node 18+), fallback to node-fetch if needed
let fetchFn = globalThis.fetch;
if (!fetchFn) {
  fetchFn = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
}

const API_BASE = 'https://api.openai.com/v1';
const RESPONSES_URL = `${API_BASE}/responses`;
const CHAT_URL = `${API_BASE}/chat/completions`;

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error(`[${PKG_NAME}] ⚠️ Missing OPENAI_API_KEY env var`);
}

let logger;
try {
  logger = require('./logger');
} catch {
  logger = null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const CHAT_REGEX = /gpt-.*chat/i;

function isChatModel(model = '') {
  return CHAT_REGEX.test(model);
}

// Map verbosity to Responses API shape
// Accept legacy { verbosity: 'low|medium|high' } and place under body.text.verbosity
function mapVerbosity(body, options = {}) {
  if (options.verbosity) {
    body.text = { ...(body.text || {}), verbosity: options.verbosity };
  }
}

// Map reasoning to Responses API shape
// Accept { reasoning_effort: 'low|medium|high' } or { reasoning: { effort } }
function mapReasoning(body, options = {}) {
  if (options.reasoning && typeof options.reasoning === 'object' && options.reasoning.effort) {
    body.reasoning = { effort: options.reasoning.effort };
  } else if (options.reasoning_effort) {
    body.reasoning = { effort: options.reasoning_effort };
  }
}

// Cost estimator (per million tokens)
function calculateCostEstimate(model, inputTokens = 0, outputTokens = 0) {
  const costs = {
    'gpt-5-nano': { input: 0.05, output: 0.40 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-chat-latest': { input: 1.25, output: 10.00 }
  };
  const m = costs[model] || costs['gpt-5-mini'];
  const inputCost = (inputTokens / 1_000_000) * m.input;
  const outputCost = (outputTokens / 1_000_000) * m.output;
  return {
    model,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    inputCost: +inputCost.toFixed(6),
    outputCost: +outputCost.toFixed(6),
    totalCost: +(inputCost + outputCost).toFixed(6)
  };
}

// Normalize Responses API JSON → string
function normalizeResponsesOutput(json) {
  if (!json) return '';
  if (typeof json.output_text === 'string' && json.output_text.trim()) {
    return json.output_text;
  }
  if (Array.isArray(json.output)) {
    const parts = [];
    for (const item of json.output) {
      if (Array.isArray(item?.content)) {
        for (const c of item.content) {
          if (typeof c?.text === 'string') parts.push(c.text);
        }
      }
    }
    if (parts.length) return parts.join('');
  }
  // Nothing recognized
  return '';
}

// Normalize Chat Completions JSON → string
function normalizeChatOutput(json) {
  return json?.choices?.[0]?.message?.content ?? '';
}

// Trim common artifacts
function postprocessText(text, addAttribution = false, model = '', reasoningEffort = null) {
  if (!text) return '';
  let t = String(text)
    .replace(/^(Assistant:|AI:|GPT-?5?:)\s*/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (addAttribution && t.length > 200 && !/gpt/i.test(t)) {
    const modelName = /nano/i.test(model) ? 'GPT-5 Nano'
      : /mini/i.test(model) ? 'GPT-5 Mini'
      : /chat/i.test(model) ? 'GPT-5 Chat'
      : 'GPT-5';
    t += `\n\n*Powered by ${modelName}${reasoningEffort ? ` (${reasoningEffort} reasoning)` : ''}*`;
  }
  return t;
}

// Timeout wrapper
function withTimeout(promise, ms, onTimeoutMsg = 'Request timed out') {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(onTimeoutMsg)), ms);
    promise.then(
      (res) => { clearTimeout(id); resolve(res); },
      (err) => { clearTimeout(id); reject(err); }
    );
  });
}

// ──────────────────────────────────────────────────────────────────────────────
/** Circuit breaker (simple) */
// ──────────────────────────────────────────────────────────────────────────────
const breaker = {
  state: 'CLOSED',
  failures: 0,
  openedAt: 0,
  openAfter: 3,           // failures to open
  resetAfterMs: 20_000,   // cool down period
};

function breakerCanProceed() {
  if (breaker.state === 'OPEN') {
    const elapsed = Date.now() - breaker.openedAt;
    if (elapsed >= breaker.resetAfterMs) {
      breaker.state = 'HALF_OPEN';
      return true;
    }
    return false;
  }
  return true;
}

function breakerRecordSuccess() {
  breaker.state = 'CLOSED';
  breaker.failures = 0;
}

function breakerRecordFailure() {
  breaker.failures += 1;
  if (breaker.failures >= breaker.openAfter) {
    breaker.state = 'OPEN';
    breaker.openedAt = Date.now();
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Request builders
// ──────────────────────────────────────────────────────────────────────────────

function buildResponsesBody(prompt, options = {}) {
  const body = {
    model: options.model,
    input: [
      {
        role: 'user',
        content: [{ type: 'text', text: String(prompt ?? '') }]
      }
    ]
  };
  if (Number.isFinite(options.max_output_tokens)) body.max_output_tokens = options.max_output_tokens;
  if (Number.isFinite(options.temperature)) body.temperature = options.temperature;
  if (Number.isFinite(options.top_p)) body.top_p = options.top_p;

  mapReasoning(body, options);
  mapVerbosity(body, options);

  // Clean null/undefined
  for (const k of Object.keys(body)) {
    if (body[k] == null) delete body[k];
  }
  return body;
}

function buildChatBody(prompt, options = {}) {
  const body = {
    model: options.model,
    messages: [{ role: 'user', content: String(prompt ?? '') }]
  };
  // Chat API uses max_tokens (not max_output_tokens)
  if (Number.isFinite(options.max_tokens)) body.max_tokens = options.max_tokens;
  else if (Number.isFinite(options.max_output_tokens)) body.max_tokens = options.max_output_tokens;

  if (Number.isFinite(options.temperature)) body.temperature = options.temperature;
  if (Number.isFinite(options.top_p)) body.top_p = options.top_p;

  // NOTE: Chat API does not support text.verbosity; ignore options.verbosity here.
  // NOTE: Chat API does not accept reasoning object in the same way; we keep it simple.

  for (const k of Object.keys(body)) {
    if (body[k] == null) delete body[k];
  }
  return body;
}

// ──────────────────────────────────────────────────────────────────────────────
// Core caller with retry & telemetry
// ──────────────────────────────────────────────────────────────────────────────

async function doFetchJson(url, body, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const res = await withTimeout(
    fetchFn(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }),
    timeoutMs,
    'OpenAI request timed out'
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI ${url.includes('/responses') ? 'Responses' : 'Chat'} API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function callWithRetry(kind, url, body, { model, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const t0 = Date.now();
  if (!breakerCanProceed()) {
    throw new Error('Circuit breaker OPEN (cooling down after repeated failures)');
  }

  let attempt = 0;
  const maxAttempts = 3;
  let lastErr;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const json = await doFetchJson(url, body, timeoutMs);
      breakerRecordSuccess();

      // Minimal usage fields for logs if present
      const usage = json?.usage || {};
      const inputTokens = usage.input_tokens ?? usage.prompt_tokens ?? 0;
      const outputTokens = usage.output_tokens ?? usage.completion_tokens ?? 0;

      if (logger && logger.logGPTResponse) {
        try {
          const meta = calculateCostEstimate(model, inputTokens, outputTokens);
          const entry = {
            timestamp: new Date().toISOString(),
            model,
            apiType: url.includes('/responses') ? 'responses' : 'chat',
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
            cost: meta.totalCost.toFixed(6),
            executionTime: Date.now() - t0,
            success: true,
            error: null,
            circuitBreakerState: breaker.state
          };
          console.log(`[GPT5-API] ${JSON.stringify(entry)}`);
        } catch { /* no-op */ }
      }

      return json;
    } catch (err) {
      lastErr = err;
      if (attempt >= maxAttempts) {
        breakerRecordFailure();

        if (logger && logger.logGPTResponse) {
          try {
            const entry = {
              timestamp: new Date().toISOString(),
              model,
              apiType: url.includes('/responses') ? 'responses' : 'chat',
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0,
              cost: null,
              executionTime: Date.now() - t0,
              success: false,
              error: err.message,
              circuitBreakerState: breaker.state
            };
            console.error(`[GPT5-API-ERROR] ${JSON.stringify(entry)}`);
          } catch { /* no-op */ }
        }
        throw err;
      }

      // backoff
      const delay = 300 * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────-

async function callResponses(prompt, options = {}) {
  const body = buildResponsesBody(prompt, options);
  const json = await callWithRetry('responses', RESPONSES_URL, body, { model: options.model, timeoutMs: options.timeoutMs });
  return json;
}

async function callChat(prompt, options = {}) {
  const body = buildChatBody(prompt, options);
  const json = await callWithRetry('chat', CHAT_URL, body, { model: options.model, timeoutMs: options.timeoutMs });
  return json;
}

/**
 * Main entry used by dualCommandSystem:
 * - Decides endpoint by model
 * - Returns a plain string (normalized + lightly postprocessed)
 */
async function getGPT5Analysis(prompt, options = {}) {
  const model = options.model || 'gpt-5-mini';
  const start = Date.now();

  if (!API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  // Route to proper API
  let json;
  if (isChatModel(model)) {
    // Ensure Chat uses max_tokens
    const chatOpts = { ...options };
    if (Number.isFinite(chatOpts.max_output_tokens) && !Number.isFinite(chatOpts.max_tokens)) {
      chatOpts.max_tokens = chatOpts.max_output_tokens;
      delete chatOpts.max_output_tokens;
    }
    json = await callChat(prompt, chatOpts);
  } else {
    // Responses API
    json = await callResponses(prompt, options);
  }

  // Normalize to text
  const text = isChatModel(model) ? normalizeChatOutput(json) : normalizeResponsesOutput(json);

  // If the service returned nothing, provide a safe empty marker (so callers don't crash on .length)
  const safe = text && text.trim() ? text : '[Empty response from GPT-5 API]';

  // Optional post-processing (adds attribution only for non-chat when long)
  const processed = postprocessText(
    safe,
    /* addAttribution */ !isChatModel(model),
    model,
    options.reasoning_effort || options?.reasoning?.effort || null
  );

  // Optional debug console (kept compact)
  console.log(`Using ${isChatModel(model) ? 'Chat' : 'Responses'} API with ${model}...`);
  if (!text || !text.trim()) {
    console.log('GPT-5 returned 0 output tokens. Response:', processed);
  }

  return processed;
}

// ──────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────-

module.exports = {
  // High-level used by your system
  getGPT5Analysis,

  // Lower-level (optional) if you need them
  callResponses,
  callChat,

  // Utilities
  calculateCostEstimate,
  normalizeResponsesOutput,
  normalizeChatOutput,
  isChatModel
};
