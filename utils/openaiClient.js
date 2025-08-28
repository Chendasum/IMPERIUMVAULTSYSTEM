// utils/openaiClient.js — GPT‑5 Client (Corrected v3, August 2025)
// ----------------------------------------------------------------------------
// Purpose
//   • Unified client for GPT‑5 family (Full/Mini/Nano) with correct API parameters
//   • Proper handling of Chat Completions API (GPT-5 uses this, not Responses API)
//   • Strong error handling, circuit breaker, retry/backoff, and telemetry
//   • Correct parameter usage: verbosity, reasoning_effort, custom tools
//   • Convenience wrappers with proper model routing and token management
//
// Key Corrections
//   • GPT-5 models use Chat Completions API, NOT Responses API
//   • Correct verbosity parameter: "low", "medium", "high"
//   • Correct reasoning_effort parameter: "minimal", "low", "medium", "high"
//   • Proper token limits and pricing awareness
//   • Fixed model routing and parameter handling
// ----------------------------------------------------------------------------

'use strict';

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                  Imports                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

require('dotenv').config();
const { OpenAI } = require('openai');

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                              Client Bootstrap                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 180000, // 3 minutes for GPT‑5 reasoning
  maxRetries: 1,
  defaultHeaders: {
    'User-Agent': 'IMPERIUM-VAULT-GPT5/3.0.0'
  }
});

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                               Model Catalog                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const GPT5_CONFIG = {
  // Correct GPT-5 model names
  PRIMARY_MODEL: 'gpt-5',
  MINI_MODEL: 'gpt-5-mini', 
  NANO_MODEL: 'gpt-5-nano',
  CHAT_MODEL: 'gpt-5-chat-latest',
  FALLBACK_MODEL: 'gpt-4o',

  // Actual context windows and limits
  CONTEXT_WINDOW: 200000, // 200k tokens
  MAX_OUTPUT_TOKENS: 16384, // 16k max output

  // Correct parameter values
  VERBOSITY_LEVELS: ['low', 'medium', 'high'],
  REASONING_EFFORTS: ['minimal', 'low', 'medium', 'high'],
  DEFAULT_VERBOSITY: 'medium',
  DEFAULT_REASONING: 'medium',

  // Pricing (per 1M tokens)
  PRICING: {
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5-nano': { input: 0.05, output: 0.40 }
  },

  // Logging
  LOG_REQUEST_SUMMARY: true,
  LOG_RESPONSE_SUMMARY: true,
  LOG_ERRORS: true,
  LOG_TOKEN_USAGE: true
};

// All GPT-5 models use Chat Completions API
const GPT5_MODELS = new Set([
  'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5-chat-latest'
]);

let currentModel = GPT5_CONFIG.MINI_MODEL;
let gpt5Available = true;

// Startup banner
console.log('[GPT5Client] Booting GPT-5 Client v3.0...');
console.log(`[GPT5Client] API Key: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`[GPT5Client] Models: ${GPT5_CONFIG.PRIMARY_MODEL}, ${GPT5_CONFIG.MINI_MODEL}, ${GPT5_CONFIG.NANO_MODEL}`);

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                             Utility: Token Math                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function estimateTokens(text) {
  if (!text) return 0;
  // More accurate estimation: ~3.5 chars per token for English
  return Math.max(1, Math.ceil(text.length / 3.5));
}

function calculateCost(model, inputTokens, outputTokens) {
  const pricing = GPT5_CONFIG.PRICING[model];
  if (!pricing) return 0;
  
  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;
  return inputCost + outputCost;
}

function validateTokenLimits(promptTokens, maxTokens) {
  const safeMax = Math.min(maxTokens || 8000, GPT5_CONFIG.MAX_OUTPUT_TOKENS);
  const available = GPT5_CONFIG.CONTEXT_WINDOW - promptTokens;
  return Math.max(256, Math.min(safeMax, available));
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                        Utility: Time + Error Handling                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function timestamp() { 
  return new Date().toISOString(); 
}

function classifyError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  
  return {
    isRateLimit: /rate.?limit|quota|too many requests/i.test(message),
    isTimeout: /timeout|etimedout|econnreset/i.test(message),
    isAuth: /unauthorized|invalid.?api.?key|401/i.test(message),
    isServer: /5\d\d|server error|bad gateway|502|503/i.test(message),
    isNetwork: /enotfound|eai_again|network/i.test(message),
    isModel: /model|unsupported|not found/i.test(message),
    isContext: /context|token.?limit|too long/i.test(message)
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                         Circuit Breaker + Retry Logic                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const circuitBreaker = {
  failures: 0,
  openedAt: 0,
  state: 'CLOSED', // CLOSED → OPEN → HALF_OPEN
  failureThreshold: 3,
  recoveryTimeMs: 30000 // 30 seconds
};

function isCircuitOpen() {
  if (circuitBreaker.state === 'OPEN') {
    const timeSinceOpen = Date.now() - circuitBreaker.openedAt;
    if (timeSinceOpen > circuitBreaker.recoveryTimeMs) {
      circuitBreaker.state = 'HALF_OPEN';
      return false;
    }
    return true;
  }
  return false;
}

function recordSuccess() {
  circuitBreaker.failures = 0;
  circuitBreaker.state = 'CLOSED';
}

function recordFailure() {
  circuitBreaker.failures++;
  if (circuitBreaker.failures >= circuitBreaker.failureThreshold) {
    circuitBreaker.state = 'OPEN';
    circuitBreaker.openedAt = Date.now();
    console.log('[GPT5Client] Circuit breaker opened due to repeated failures');
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, maxRetries = 2) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      const errorType = classifyError(error);
      
      // Don't retry on auth errors or model errors
      if (errorType.isAuth || errorType.isModel) {
        throw error;
      }
      
      if (attempt < maxRetries - 1) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`[GPT5Client] Retry attempt ${attempt + 1} after ${backoffMs}ms`);
        await delay(backoffMs);
      }
    }
  }
  
  throw lastError;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                           Request Builder (Corrected)                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function buildChatRequest(model, messages, options = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages must be a non-empty array');
  }

  const request = {
    model,
    messages
  };

  // Basic parameters
  if (options.temperature !== undefined) {
    request.temperature = Math.max(0, Math.min(2, options.temperature));
  }

  if (options.top_p !== undefined) {
    request.top_p = Math.max(0, Math.min(1, options.top_p));
  }

  // Token management
  const totalPromptTokens = messages
    .map(m => estimateTokens(m.content || ''))
    .reduce((sum, tokens) => sum + tokens, 0);
  
  const maxTokens = validateTokenLimits(
    totalPromptTokens, 
    options.max_tokens || options.max_completion_tokens
  );
  request.max_tokens = maxTokens;

  // GPT-5 specific parameters (only for GPT-5 models)
  if (GPT5_MODELS.has(model)) {
    // Verbosity parameter
    if (options.verbosity && GPT5_CONFIG.VERBOSITY_LEVELS.includes(options.verbosity)) {
      request.verbosity = options.verbosity;
    }

    // Reasoning effort parameter  
    if (options.reasoning_effort && GPT5_CONFIG.REASONING_EFFORTS.includes(options.reasoning_effort)) {
      request.reasoning_effort = options.reasoning_effort;
    }

    // Custom tools support
    if (options.tools && Array.isArray(options.tools)) {
      request.tools = options.tools;
    }

    if (options.tool_choice) {
      request.tool_choice = options.tool_choice;
    }
  }

  // Streaming
  if (options.stream) {
    request.stream = true;
  }

  if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
    console.log('[GPT5Client] Request built:', {
      model,
      messageCount: messages.length,
      estimatedPromptTokens: totalPromptTokens,
      maxTokens,
      verbosity: request.verbosity,
      reasoning_effort: request.reasoning_effort,
      temperature: request.temperature
    });
  }

  return request;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                          Response Processing                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

function extractResponseContent(completion) {
  try {
    if (!completion?.choices?.[0]?.message?.content) {
      console.warn('[GPT5Client] No content in response');
      return 'No content received in response';
    }
    
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('[GPT5Client] Error extracting response:', error);
    return `Error extracting response: ${error.message}`;
  }
}

function logTokenUsage(completion, model) {
  if (GPT5_CONFIG.LOG_TOKEN_USAGE && completion.usage) {
    const usage = completion.usage;
    const cost = calculateCost(model, usage.prompt_tokens || 0, usage.completion_tokens || 0);
    
    console.log('[GPT5Client] Token Usage:', {
      model,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      reasoning_tokens: usage.reasoning_tokens,
      estimated_cost_usd: cost.toFixed(6)
    });
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                            Core API Functions                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function makeAPICall(requestFn) {
  if (isCircuitOpen()) {
    throw new Error('Service temporarily unavailable (circuit breaker open)');
  }

  try {
    const result = await retryWithBackoff(requestFn);
    recordSuccess();
    return result;
  } catch (error) {
    recordFailure();
    throw error;
  }
}

/**
 * Main GPT-5 completion function
 * @param {string|Array} input - Prompt string or messages array
 * @param {object} options - Configuration options
 */
async function getGPT5Completion(input, options = {}) {
  const startTime = Date.now();

  try {
    // Input validation and normalization
    let messages;
    if (typeof input === 'string') {
      if (!input.trim()) {
        throw new Error('Input cannot be empty');
      }
      messages = [{ role: 'user', content: input.trim() }];
    } else if (Array.isArray(input)) {
      messages = input;
    } else {
      throw new Error('Input must be a string or messages array');
    }

    // Model selection
    const model = options.model || GPT5_CONFIG.MINI_MODEL;
    
    if (GPT5_CONFIG.LOG_REQUEST_SUMMARY) {
      console.log(`[GPT5Client] Starting completion with ${model}`);
    }

    // Build and execute request
    const request = buildChatRequest(model, messages, {
      verbosity: options.verbosity || GPT5_CONFIG.DEFAULT_VERBOSITY,
      reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
      temperature: options.temperature,
      top_p: options.top_p,
      max_tokens: options.max_tokens || options.max_completion_tokens,
      tools: options.tools,
      tool_choice: options.tool_choice,
      stream: options.stream
    });

    const completion = await makeAPICall(() => 
      openai.chat.completions.create(request)
    );

    // Process response
    const responseText = extractResponseContent(completion);
    logTokenUsage(completion, model);

    if (GPT5_CONFIG.LOG_RESPONSE_SUMMARY) {
      const elapsed = Date.now() - startTime;
      console.log('[GPT5Client] Completion successful:', {
        model,
        responseLength: responseText.length,
        elapsedMs: elapsed,
        totalTokens: completion.usage?.total_tokens
      });
    }

    return {
      content: responseText,
      model,
      usage: completion.usage,
      finishReason: completion.choices[0]?.finish_reason
    };

  } catch (error) {
    if (GPT5_CONFIG.LOG_ERRORS) {
      console.error('[GPT5Client] Completion failed:', error.message);
    }

    const errorType = classifyError(error);
    
    // Handle rate limits gracefully
    if (errorType.isRateLimit) {
      throw new Error('Rate limit exceeded. Please wait and try again.');
    }

    // Try fallback for non-auth errors
    if (!errorType.isAuth && options.allowFallback !== false) {
      console.log('[GPT5Client] Attempting fallback to GPT-4o...');
      
      try {
        const fallbackMessages = typeof input === 'string' 
          ? [{ role: 'user', content: input }] 
          : input;

        const fallbackRequest = {
          model: GPT5_CONFIG.FALLBACK_MODEL,
          messages: fallbackMessages,
          max_tokens: Math.min(options.max_tokens || 8000, 4000),
          temperature: options.temperature || 0.7
        };

        const fallbackCompletion = await openai.chat.completions.create(fallbackRequest);
        const fallbackContent = extractResponseContent(fallbackCompletion);

        return {
          content: `[GPT-4o Fallback] ${fallbackContent}`,
          model: GPT5_CONFIG.FALLBACK_MODEL,
          usage: fallbackCompletion.usage,
          finishReason: fallbackCompletion.choices[0]?.finish_reason,
          fallback: true
        };

      } catch (fallbackError) {
        console.error('[GPT5Client] Fallback also failed:', fallbackError.message);
      }
    }

    // Return user-friendly error
    return {
      content: `I apologize, but I'm experiencing technical difficulties.\n\nError: ${error.message}\n\nPlease try again in a moment.`,
      model: 'error',
      error: true
    };
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                         Convenience Functions                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Quick response with GPT-5 Nano (fastest, cheapest)
 */
async function getQuickResponse(prompt, options = {}) {
  return getGPT5Completion(prompt, {
    ...options,
    model: GPT5_CONFIG.NANO_MODEL,
    reasoning_effort: 'minimal',
    verbosity: 'low',
    max_tokens: Math.min(options.max_tokens || 4000, 6000)
  });
}

/**
 * Balanced response with GPT-5 Mini 
 */
async function getStandardResponse(prompt, options = {}) {
  return getGPT5Completion(prompt, {
    ...options,
    model: GPT5_CONFIG.MINI_MODEL,
    reasoning_effort: 'medium',
    verbosity: 'medium',
    max_tokens: options.max_tokens || 8000
  });
}

/**
 * Deep analysis with full GPT-5
 */
async function getDetailedResponse(prompt, options = {}) {
  return getGPT5Completion(prompt, {
    ...options,
    model: GPT5_CONFIG.PRIMARY_MODEL,
    reasoning_effort: 'high',
    verbosity: 'high',
    max_tokens: options.max_tokens || 12000
  });
}

/**
 * Chat-optimized response
 */
async function getChatResponse(prompt, options = {}) {
  return getGPT5Completion(prompt, {
    ...options,
    model: GPT5_CONFIG.CHAT_MODEL,
    temperature: options.temperature || 0.7,
    verbosity: 'medium',
    max_tokens: options.max_tokens || 8000
  });
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                           Health & Diagnostics                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

async function testConnection() {
  try {
    console.log('[GPT5Client] Testing connection...');
    
    const result = await getQuickResponse('Hello! Please confirm you are GPT-5 and working correctly.', {
      max_tokens: 100,
      allowFallback: false
    });
    
    return {
      success: !result.error,
      model: result.model,
      response: result.content,
      usage: result.usage,
      timestamp: timestamp()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: timestamp()
    };
  }
}

async function getSystemHealth() {
  const health = {
    timestamp: timestamp(),
    gpt5Models: {
      nano: false,
      mini: false,
      full: false,
      chat: false
    },
    fallback: false,
    circuitBreaker: {
      state: circuitBreaker.state,
      failures: circuitBreaker.failures
    },
    errors: []
  };

  // Test each model variant
  const testPrompt = 'Test';
  const testOptions = { max_tokens: 10, allowFallback: false };

  const modelTests = [
    { key: 'nano', fn: () => getQuickResponse(testPrompt, testOptions) },
    { key: 'mini', fn: () => getStandardResponse(testPrompt, testOptions) },
    { key: 'full', fn: () => getDetailedResponse(testPrompt, testOptions) },
    { key: 'chat', fn: () => getChatResponse(testPrompt, testOptions) }
  ];

  for (const test of modelTests) {
    try {
      const result = await test.fn();
      health.gpt5Models[test.key] = !result.error;
    } catch (error) {
      health.errors.push(`${test.key}: ${error.message}`);
    }
  }

  // Test fallback
  try {
    await openai.chat.completions.create({
      model: GPT5_CONFIG.FALLBACK_MODEL,
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 10
    });
    health.fallback = true;
  } catch (error) {
    health.errors.push(`fallback: ${error.message}`);
  }

  health.overallHealth = Object.values(health.gpt5Models).some(Boolean) || health.fallback;
  
  return health;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                Startup                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

console.log('[GPT5Client] ✅ Initialized with correct GPT-5 parameters');
console.log('[GPT5Client] 🔄 Circuit breaker and retry logic active');
console.log('[GPT5Client] 🚀 Ready for GPT-5 completions');

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                                Exports                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

module.exports = {
  // Main function
  getGPT5Completion,

  // Convenience functions
  getQuickResponse,       // GPT-5 Nano
  getStandardResponse,    // GPT-5 Mini  
  getDetailedResponse,    // GPT-5 Full
  getChatResponse,        // GPT-5 Chat

  // Health & diagnostics
  testConnection,
  getSystemHealth,

  // Utilities
  buildChatRequest,
  extractResponseContent,
  calculateCost,
  estimateTokens,

  // Config & client
  GPT5_CONFIG,
  openai,

  // Legacy compatibility (map to new functions)
  getGPT5Analysis: getStandardResponse,
  getQuickNanoResponse: getQuickResponse,
  getQuickMiniResponse: getStandardResponse,
  getDeepAnalysis: getDetailedResponse,
  testOpenAIConnection: testConnection,
  checkGPT5SystemHealth: getSystemHealth
};
