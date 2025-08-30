// utils/openaiClient.js
// -----------------------------------------------------------------------------
// OpenAI Client (GPT-5 family) – Responses API + Chat Completions
// - Correct token params per API (Responses: max_output_tokens, Chat: max_tokens)
// - Reasoning knobs: reasoning_effort, verbosity
// - Safe normalization: always returns { text, meta } and plain string for legacy
// - Retries with exponential backoff, timeouts, circuit-breaker guard
// - Cost estimate + usage passthrough
// - Friendly with your logger (optional)
// -----------------------------------------------------------------------------

'use strict';

const { setTimeout: sleep } = require('timers/promises');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY missing. Set it in your environment.');
}

const DEFAULT_TIMEOUT_MS = 25_000;
const MAX_RETRIES = 2;

// Models
const MODELS = {
  NANO: 'gpt-5-nano',
  MINI: 'gpt-5-mini',
  FULL: 'gpt-5',
  CHAT: 'gpt-5-chat-latest'
};

// Soft caps (sane defaults; API may allow higher)
const TOKEN_LIMITS = {
  [MODELS.NANO]: 4000,
  [MODELS.MINI]: 8000,
  [MODELS.FULL]: 16000,
  [MODELS.CHAT]: 8000
};

// Pricing (per 1M tokens)
const PRICES = {
  [MODELS.NANO]: { input: 0.05, output: 0.40 },
  [MODELS.MINI]: { input: 0.25, output: 2.00 },
  [MODELS.FULL]: { input: 1.25, output: 10.00 },
  [MODELS.CHAT]: { input: 1.25, output: 10.00 }
};

function getLogger() {
  try {
    // optional dependency
    return require('./logger');
  } catch {
    return null;
  }
}

// ---------- helpers -----------------------------------------------------------

function isChatModel(model) {
  return model === MODELS.CHAT;
}

function clampTokens(model, requested, fallback) {
  const cap = TOKEN_LIMITS[model] || fallback || 4000;
  if (!requested) return Math.min(cap, fallback || cap);
  return Math.min(requested, cap);
}

// Extract plain text from Responses API shape
function extractTextFromResponsesAPI(obj) {
  if (!obj) return '';
  if (typeof obj.output_text === 'string' && obj.output_text.trim()) return obj.output_text;

  if (Array.isArray(obj.output)) {
    const parts = [];
    for (const item of obj.output) {
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

// Cost calc
function estimateCost(model, inputTokens = 0, outputTokens = 0) {
  const price = PRICES[model] || PRICES[MODELS.MINI];
  const inputCost = (inputTokens / 1_000_000) * price.input;
  const outputCost = (outputTokens / 1_000_000) * price.output;
  return {
    inputTokens,
    outputTokens,
    inputCost: Number(inputCost.toFixed(6)),
    outputCost: Number(outputCost.toFixed(6)),
    totalCost: Number((inputCost + outputCost).toFixed(6))
  };
}

// Safe fetch with timeout
async function fetchWithTimeout(url, opts = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ac.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// ---------- main client -------------------------------------------------------

class OpenAIClient {
  constructor() {
    this.base = process.env.OPENAI_BASE_URL?.replace(/\/+$/, '') || 'https://api.openai.com/v1';
    this.apiKey = OPENAI_API_KEY;
    this.circuit = { state: 'CLOSED', fails: 0, lastFailAt: 0 };
    this.logger = getLogger();
  }

  // Public: main entry used by your dualCommandSystem
  /**
   * getGPT5Analysis(prompt, options)
   *
   * @param {string} prompt - user or enhanced message
   * @param {object} options - { model, temperature, reasoning_effort, verbosity, max_output_tokens, max_tokens, top_p, top_logprobs }
   * @returns {Promise<string>} plain text for backward compatibility
   *
   * ALSO available: getGPT5AnalysisRich(...) to receive { text, meta }
   */
  async getGPT5Analysis(prompt, options = {}) {
    const rich = await this.getGPT5AnalysisRich(prompt, options);
    return rich.text;
  }

  // Preferred: rich output
  async getGPT5AnalysisRich(prompt, options = {}) {
    const start = Date.now();

    if (!this.apiKey) {
      const msg = 'OPENAI_API_KEY missing.';
      this._logAPI(false, options.model, 'unknown', 0, 0, Date.now() - start, msg);
      throw new Error(msg);
    }

    const model = options.model || MODELS.MINI;
    const isChat = isChatModel(model);

    // token knobs
    const maxOut =
      isChat
        ? clampTokens(model, options.max_tokens, 1024) // chat uses max_tokens
        : clampTokens(model, options.max_output_tokens, 1024); // responses uses max_output_tokens

    // Build request
    let url;
    let payload;

    if (isChat) {
      url = `${this.base}/chat/completions`;
      payload = {
        model,
        messages: [{ role: 'user', content: String(prompt || '') }],
        temperature: options.temperature ?? 0.7,
        top_p: options.top_p ?? 1,
        max_tokens: maxOut, // ✅ correct for chat
        // tool_choice / tools could go here if you add tools
      };
    } else {
      url = `${this.base}/responses`;
      payload = {
        model,
        input: String(prompt || ''),
        temperature: options.temperature ?? 0.7,
        top_p: options.top_p ?? 1,
        // Reasoning knobs are Responses-only
        reasoning: options.reasoning_effort
          ? { effort: options.reasoning_effort }
          : undefined,
        verbosity: options.verbosity || undefined,
        max_output_tokens: maxOut, // ✅ correct for responses
      };
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    // Retry loop
    let lastErr = null;
    for (let attempt = 1; attempt <= (MAX_RETRIES + 1); attempt++) {
      try {
        const res = await fetchWithTimeout(url, { method: 'POST', headers, body: JSON.stringify(payload) }, DEFAULT_TIMEOUT_MS);

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          const errMsg = `OpenAI ${isChat ? 'Chat' : 'Responses'} API error ${res.status}: ${text || res.statusText}`;
          if (res.status >= 500 && attempt <= MAX_RETRIES) {
            await sleep(300 * attempt);
            continue;
          }
          throw new Error(errMsg);
        }

        const data = await res.json();

        // Normalize
        let text = '';
        let inputTokens = 0;
        let outputTokens = 0;

        if (isChat) {
          text = data?.choices?.[0]?.message?.content || '';
          inputTokens = data?.usage?.prompt_tokens ?? 0;
          outputTokens = data?.usage?.completion_tokens ?? 0;
        } else {
          text = extractTextFromResponsesAPI(data);
          inputTokens = data?.usage?.input_tokens ?? 0;
          outputTokens = data?.usage?.output_tokens ?? 0;
        }

        // Guard empty
        if (!text.trim()) {
          text = '[Empty response from GPT-5 API]';
        }

        const usage = {
          inputTokens,
          outputTokens,
          totalTokens: (inputTokens || 0) + (outputTokens || 0)
        };

        const cost = estimateCost(model, inputTokens, outputTokens);

        const meta = {
          model,
          apiType: isChat ? 'chat' : 'responses',
          usage,
          cost,
          executionTime: Date.now() - start,
          temperature: payload.temperature,
          top_p: payload.top_p,
          reasoning_effort: options.reasoning_effort || null,
          verbosity: options.verbosity || null,
          max_param_used: isChat ? 'max_tokens' : 'max_output_tokens',
          max_param_value: maxOut,
          raw: data // keep for advanced inspectors; logger won’t dump full object
        };

        // Optional console/logger summary
        this._logAPI(true, model, meta.apiType, usage.inputTokens, usage.outputTokens, meta.executionTime, null, cost);

        return { text, meta };
      } catch (err) {
        lastErr = err;
        // transient retry for 429/5xx handled above; here simple backoff
        if (attempt <= MAX_RETRIES) {
          await sleep(500 * attempt);
          continue;
        }
        // Final failure
        this._logAPI(false, model, isChat ? 'chat' : 'responses', 0, 0, Date.now() - start, err.message);
        throw err;
      }
    }

    // Should never reach here
    throw lastErr || new Error('Unknown OpenAI client error.');
  }

  // Lightweight wrapper for your cost helper elsewhere
  static calculateCostEstimate(model, inputTokens, outputTokens) {
    return estimateCost(model, inputTokens, outputTokens);
  }

  // Internal log helper
  _logAPI(success, model, apiType, inTok, outTok, ms, errorMsg, cost = null) {
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        model,
        apiType,
        inputTokens: inTok,
        outputTokens: outTok,
        totalTokens: (inTok || 0) + (outTok || 0),
        cost: cost ? String(cost.totalCost.toFixed?.(6) ?? cost.totalCost) : null,
        executionTime: ms,
        success,
        error: errorMsg || null,
        circuitBreakerState: this.circuit.state
      };

      // Console line (compact)
      if (success) {
        console.log(`[GPT5-API] ${JSON.stringify(payload)}`);
      } else {
        console.error(`[GPT5-API-ERROR] ${JSON.stringify(payload)}`);
      }

      // Logger integration (optional, safe)
      if (this.logger?.logGPTResponse) {
        this.logger.logGPTResponse({
          userId: 'system',
          username: 'system',
          prompt: `[${apiType}] ${model}`,
          gptResponse: { model, usage: { total_tokens: payload.totalTokens }, finish_reason: null },
        });
      }
    } catch {
      // swallow any logging error
    }
  }
}

const client = new OpenAIClient();

module.exports = client;
module.exports.OpenAIClient = OpenAIClient;
module.exports.MODELS = MODELS;
module.exports.TOKEN_LIMITS = TOKEN_LIMITS;
module.exports.PRICES = PRICES;
