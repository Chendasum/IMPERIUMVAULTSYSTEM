// utils/openaiClient.js
// ----------------------------------------------------------------------------
// OpenAI GPT-5 Client (Responses API + Chat Completions)
// - Single entry: getGPT5Analysis(prompt, options)
// - Auto-selects API: Responses for gpt-5 / -mini / -nano; Chat for -chat-latest
// - Correct payloads: input_text + text.verbosity, reasoning.effort, tokens params
// - Robust logging, retries, timeout, cost estimate, circuit breaker (simple)
// ----------------------------------------------------------------------------

'use strict';

const os = require('os');

// Prefer Node 18+ global fetch; lazy-load node-fetch only if needed
async function httpPost(url, body, headers = {}, { timeoutMs = 20000 } = {}) {
  const payload = JSON.stringify(body);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (typeof fetch === 'function') {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: payload,
        signal: controller.signal
      });
      return res;
    }
    // Node < 18 fallback
    const { default: nodeFetch } = await import('node-fetch');
    const res = await nodeFetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: payload,
      signal: controller.signal
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// --- Small helpers -----------------------------------------------------------

function nowIso() {
  return new Date().toISOString();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function safeNumber(n, fallback) {
  return Number.isFinite(n) ? n : fallback;
}

function approxTokenCountFromText(text) {
  const s = String(text || '');
  // quick heuristic ~4 chars per token
  return Math.max(1, Math.ceil(s.length / 4));
}

function isChatModel(model = '') {
  return typeof model === 'string' && model.toLowerCase().includes('chat');
}

// Extract plain text from Responses API
function extractTextFromResponses(json) {
  if (!json) return '';
  if (typeof json.output_text === 'string') return json.output_text;
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
  return '';
}

// Extract plain text from Chat Completions
function extractTextFromChat(json) {
  return json?.choices?.[0]?.message?.content ?? '';
}

// Pricing (per 1M tokens). Adjust if your pricing changes.
const PRICES_PER_MTOK = {
  'gpt-5-nano': { input: 0.05, output: 0.40 },
  'gpt-5-mini': { input: 0.25, output: 2.00 },
  'gpt-5':      { input: 1.25, output: 10.00 },
  'gpt-5-chat-latest': { input: 1.25, output: 10.00 }
};

function calcCostUSD(model, inTok, outTok) {
  const rate = PRICES_PER_MTOK[model] || PRICES_PER_MTOK['gpt-5-mini'];
  const inputCost  = (inTok / 1_000_000) * rate.input;
  const outputCost = (outTok / 1_000_000) * rate.output;
  return {
    inputTokens: inTok,
    outputTokens: outTok,
    totalTokens: inTok + outTok,
    inputCost: +inputCost.toFixed(6),
    outputCost: +outputCost.toFixed(6),
    totalCost: +(inputCost + outputCost).toFixed(6)
  };
}

// --- Request builders --------------------------------------------------------

function mapReasoning(body, options = {}) {
  // Responses API: reasoning: { effort: 'low|medium|high|minimal' }
  const eff =
    options.reasoning?.effort ||
    options.reasoning_effort ||
    options.reasoningEffort ||
    null;

  if (eff) {
    body.reasoning = { effort: String(eff) };
  }
}

function mapVerbosity(body, options = {}) {
  // Responses API moved verbosity under text.verbosity
  if (options.verbosity) {
    body.text = { ...(body.text || {}), verbosity: String(options.verbosity) };
  }
}

function buildResponsesBody(prompt, options = {}) {
  const body = {
    model: options.model,
    input: [
      {
        role: 'user',
        // ✅ must be input_text
        content: [{ type: 'input_text', text: String(prompt ?? '') }]
      }
    ]
  };

  // token & sampling knobs (Responses API)
  const maxOut = safeNumber(options.max_output_tokens, undefined);
  if (Number.isFinite(maxOut)) body.max_output_tokens = maxOut;

  const temp = safeNumber(options.temperature, undefined);
  if (Number.isFinite(temp)) body.temperature = temp;

  const topP = safeNumber(options.top_p, undefined);
  if (Number.isFinite(topP)) body.top_p = topP;

  // Map verbosity and reasoning shapes
  mapVerbosity(body, options);
  mapReasoning(body, options);

  // Optional: truncation control, top_logprobs etc., if provided
  if (options.truncation) body.truncation = options.truncation; // e.g., 'disabled'
  if (Number.isFinite(options.top_logprobs)) body.top_logprobs = options.top_logprobs;

  // Clean undefined/null
  for (const k of Object.keys(body)) if (body[k] == null) delete body[k];
  return body;
}

function buildChatBody(prompt, options = {}) {
  const body = {
    model: options.model,
    messages: [{ role: 'user', content: String(prompt ?? '') }]
  };

  // token & sampling knobs (Chat API)
  const maxTok = safeNumber(options.max_tokens ?? options.max_output_tokens, undefined);
  if (Number.isFinite(maxTok)) body.max_tokens = maxTok;

  const temp = safeNumber(options.temperature, undefined);
  if (Number.isFinite(temp)) body.temperature = temp;

  const topP = safeNumber(options.top_p, undefined);
  if (Number.isFinite(topP)) body.top_p = topP;

  // Presence/frequency penalties passthrough if caller supplies
  ['presence_penalty', 'frequency_penalty'].forEach(k => {
    if (Number.isFinite(options[k])) body[k] = options[k];
  });

  // NOTE: Chat API doesn’t support text.verbosity / reasoning.effort like Responses
  return body;
}

// --- Client ------------------------------------------------------------------

class OpenAIClient {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
    if (!this.apiKey) {
      console.error('❌ OPENAI_API_KEY is missing.');
    }
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    // Simple circuit breaker
    this.cb = {
      state: 'CLOSED', // CLOSED | OPEN | HALF_OPEN
      failures: 0,
      openedAt: 0,
      openMs: 10_000
    };
  }

  // Main entry used by your system
  async getGPT5Analysis(prompt, options = {}) {
    const model = options.model || 'gpt-5-mini';
    const apiType = isChatModel(model) ? 'chat' : 'responses';

    if (this._circuitOpen()) {
      const msg = 'Circuit breaker is OPEN. Skipping API call.';
      this._logError(model, apiType, 0, 0, 0, null, msg);
      throw new Error(msg);
    }

    const start = Date.now();
    let textOut = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const resJson = await this._callOpenAI(prompt, { ...options, model }, apiType);
      if (apiType === 'responses') {
        textOut = extractTextFromResponses(resJson);
        // Usage may be present in modern Responses payloads
        inputTokens  = resJson?.usage?.input_tokens ?? approxTokenCountFromText(prompt);
        outputTokens = resJson?.usage?.output_tokens ?? approxTokenCountFromText(textOut);
      } else {
        textOut = extractTextFromChat(resJson);
        inputTokens  = resJson?.usage?.prompt_tokens ?? approxTokenCountFromText(prompt);
        outputTokens = resJson?.usage?.completion_tokens ?? approxTokenCountFromText(textOut);
      }

      const timeMs = Date.now() - start;
      const cost = calcCostUSD(model, inputTokens, outputTokens);

      this._logSuccess(model, apiType, inputTokens, outputTokens, timeMs, cost.totalCost);
      this._resetBreaker();
      return textOut || ''; // your callers expect a string

    } catch (err) {
      const timeMs = Date.now() - start;
      this._tripBreaker();
      this._logError(model, apiType, inputTokens, outputTokens, timeMs, null, err?.message || String(err));
      throw err;
    }
  }

  // Low-level unified call with retries
  async _callOpenAI(prompt, options, apiType) {
    const url =
      apiType === 'responses'
        ? `${this.baseUrl}/responses`
        : `${this.baseUrl}/chat/completions`;

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'gpt-5.1' // keep if you’re on a beta flag; otherwise remove
    };

    // Build correct body
    const body =
      apiType === 'responses'
        ? buildResponsesBody(prompt, options)
        : buildChatBody(prompt, options);

    // Simple retry (3 attempts, backoff)
    const maxAttempts = 3;
    let lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await httpPost(url, body, headers, { timeoutMs: options.timeoutMs || 20000 });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          const errMsg = `OpenAI ${apiType} API error ${res.status}: ${txt}`;
          // 400s are usually not retriable unless it’s a transient param mismatch you’re fixing
          if (res.status >= 500 && attempt < maxAttempts) {
            await sleep(attempt * 300);
            continue;
          }
          throw new Error(errMsg);
        }
        const json = await res.json();
        return json;
      } catch (e) {
        lastErr = e;
        if (attempt < maxAttempts) {
          await sleep(attempt * 300);
          continue;
        }
      }
    }
    throw lastErr;
  }

  // --- Circuit breaker helpers ----------------------------------------------
  _circuitOpen() {
    if (this.cb.state === 'OPEN') {
      const elapsed = Date.now() - this.cb.openedAt;
      if (elapsed > this.cb.openMs) {
        this.cb.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  _tripBreaker() {
    this.cb.failures += 1;
    if (this.cb.failures >= 3 && this.cb.state !== 'OPEN') {
      this.cb.state = 'OPEN';
      this.cb.openedAt = Date.now();
    }
  }

  _resetBreaker() {
    this.cb.failures = 0;
    if (this.cb.state !== 'CLOSED') this.cb.state = 'CLOSED';
  }

  // --- Logging ---------------------------------------------------------------
  _logSuccess(model, apiType, inTok, outTok, ms, cost) {
    const payload = {
      timestamp: nowIso(),
      model,
      apiType,
      inputTokens: inTok,
      outputTokens: outTok,
      totalTokens: inTok + outTok,
      cost: cost != null ? cost.toFixed(6) : null,
      executionTime: ms,
      success: true,
      error: null,
      circuitBreakerState: this.cb.state
    };
    console.log(`[GPT5-API] ${JSON.stringify(payload)}`);
  }

  _logError(model, apiType, inTok, outTok, ms, cost, errMsg) {
    const payload = {
      timestamp: nowIso(),
      model,
      apiType,
      inputTokens: inTok,
      outputTokens: outTok,
      totalTokens: inTok + outTok,
      cost: cost,
      executionTime: ms,
      success: false,
      error: errMsg,
      circuitBreakerState: this.cb.state
    };
    console.error(`[GPT5-API-ERROR] ${JSON.stringify(payload)}`);
  }
}

// Singleton instance
const openaiClient = new OpenAIClient();

module.exports = {
  OpenAIClient,
  openaiClient,
  // Primary function your code calls everywhere:
  getGPT5Analysis: (...args) => openaiClient.getGPT5Analysis(...args),
  // Useful exports
  PRICES_PER_MTOK,
  calcCostUSD
};
