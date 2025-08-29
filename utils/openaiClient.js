'use strict';

// utils/openaiClient.js - Official GPT-5 Client v5.0 (Aug 2025)
// ----------------------------------------------------------------------------
// Purpose: Complete GPT-5 implementation with official API support
// Models: gpt-5, gpt-5-mini, gpt-5-nano, gpt-5-chat-latest
// Features: reasoning_effort, verbosity, custom tools, 400K context
// ----------------------------------------------------------------------------

require('dotenv').config();
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: Number(process.env.OPENAI_TIMEOUT_MS || 180000),
  maxRetries: Number(process.env.OPENAI_SDK_MAX_RETRIES || 2),
});

console.log('GPT-5 OpenAI Client initialized');
console.log(`API Key: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);

// Official GPT-5 Model Configuration
const GPT5_CONFIG = {
  // Official GPT-5 model names from OpenAI API
  PRIMARY_MODEL: process.env.GPT5_PRIMARY_MODEL || 'gpt-5',
  MINI_MODEL: process.env.GPT5_MINI_MODEL || 'gpt-5-mini', 
  NANO_MODEL: process.env.GPT5_NANO_MODEL || 'gpt-5-nano',
  CHAT_MODEL: process.env.GPT5_CHAT_MODEL || 'gpt-5-chat-latest',

  // GPT-5 Reasoning Configuration
  DEFAULT_REASONING: process.env.GPT5_DEFAULT_REASONING || 'medium',
  DEFAULT_VERBOSITY: process.env.GPT5_DEFAULT_VERBOSITY || 'medium',
  
  // Context and Token Configuration (Official GPT-5 limits)
  MAX_INPUT_TOKENS: 272000,  // 272K input tokens
  MAX_OUTPUT_TOKENS: 128000, // 128K output tokens (includes reasoning)
  TOTAL_CONTEXT: 400000,     // 400K total context window
  
  // Default settings
  MAX_COMPLETION_TOKENS: Number(process.env.GPT5_MAX_COMPLETION_TOKENS || 8000),
  MIN_OUTPUT_TOKENS: Number(process.env.GPT5_MIN_OUTPUT_TOKENS || 10),
  MAX_PROMPT_LENGTH: Number(process.env.GPT5_MAX_PROMPT_LENGTH || 200000),
  
  // Features
  ENABLE_CACHING: process.env.GPT5_ENABLE_CACHING !== '0',
  CACHE_TTL_MS: Number(process.env.GPT5_CACHE_TTL_MS || 300000),
  ENABLE_METRICS: process.env.GPT5_ENABLE_METRICS !== '0',
  LOG_REQUESTS: process.env.GPT5_LOG_REQUESTS === '1',
  LOG_RESPONSES: process.env.GPT5_LOG_RESPONSES === '1'
};

// Official GPT-5 Reasoning and Verbosity Levels
const REASONING_EFFORTS = ['minimal', 'low', 'medium', 'high'];
const VERBOSITY_LEVELS = ['low', 'medium', 'high'];

// Official GPT-5 Pricing (per 1M tokens)
const GPT5_PRICING = {
  'gpt-5': { input: 1.25, output: 10.00 },
  'gpt-5-mini': { input: 0.25, output: 2.00 },
  'gpt-5-nano': { input: 0.05, output: 0.40 },
  'gpt-5-chat-latest': { input: 1.25, output: 10.00 }
};

console.log(`GPT-5 Models configured:`);
console.log(`- Primary: ${GPT5_CONFIG.PRIMARY_MODEL} ($${GPT5_PRICING['gpt-5'].input}/$${GPT5_PRICING['gpt-5'].output})`);
console.log(`- Mini: ${GPT5_CONFIG.MINI_MODEL} ($${GPT5_PRICING['gpt-5-mini'].input}/$${GPT5_PRICING['gpt-5-mini'].output})`);
console.log(`- Nano: ${GPT5_CONFIG.NANO_MODEL} ($${GPT5_PRICING['gpt-5-nano'].input}/$${GPT5_PRICING['gpt-5-nano'].output})`);
console.log(`- Context: ${GPT5_CONFIG.MAX_INPUT_TOKENS / 1000}K input, ${GPT5_CONFIG.MAX_OUTPUT_TOKENS / 1000}K output`);

// Metrics tracking
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTokensUsed: 0,
  totalLatencyMs: 0,
  totalCost: 0,
  modelUsage: {},
  reasoningUsage: {},
  verbosityUsage: {},
  errorsByType: {},
  cacheHits: 0,
  cacheMisses: 0,
  lastReset: Date.now()
};

function updateMetrics(model, success, usage = {}, latencyMs = 0, errorType = null, reasoning = null, verbosity = null, cacheHit = false) {
  if (!GPT5_CONFIG.ENABLE_METRICS) return;
  
  metrics.totalRequests++;
  const tokens = usage.total_tokens || 0;
  
  if (success) {
    metrics.successfulRequests++;
    metrics.totalTokensUsed += tokens;
    metrics.totalLatencyMs += latencyMs;
    
    // Calculate cost
    const pricing = GPT5_PRICING[model];
    if (pricing && usage) {
      const inputCost = (usage.prompt_tokens || 0) * pricing.input / 1000000;
      const outputCost = (usage.completion_tokens || 0) * pricing.output / 1000000;
      metrics.totalCost += inputCost + outputCost;
    }
  } else {
    metrics.failedRequests++;
    if (errorType) {
      metrics.errorsByType[errorType] = (metrics.errorsByType[errorType] || 0) + 1;
    }
  }
  
  metrics.modelUsage[model] = (metrics.modelUsage[model] || 0) + 1;
  
  if (reasoning) {
    metrics.reasoningUsage[reasoning] = (metrics.reasoningUsage[reasoning] || 0) + 1;
  }
  
  if (verbosity) {
    metrics.verbosityUsage[verbosity] = (metrics.verbosityUsage[verbosity] || 0) + 1;
  }
  
  if (cacheHit) {
    metrics.cacheHits++;
  } else {
    metrics.cacheMisses++;
  }
}

// Simple cache
class GPT5Cache {
  constructor(maxSize = 100, ttlMs = GPT5_CONFIG.CACHE_TTL_MS) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }
  
  get(key) {
    if (!GPT5_CONFIG.ENABLE_CACHING) return null;
    
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  set(key, value) {
    if (!GPT5_CONFIG.ENABLE_CACHING) return;
    
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
  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlMs: this.ttlMs
    };
  }
}

const responseCache = new GPT5Cache();

// Utilities
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(String(text).length / 4);
}

function generateCacheKey(model, prompt, options = {}) {
  const keyData = {
    model,
    prompt: prompt.slice(0, 1000),
    reasoning: options.reasoning_effort,
    verbosity: options.verbosity,
    temperature: options.temperature
  };
  return Buffer.from(JSON.stringify(keyData)).toString('base64').slice(0, 48);
}

function classifyError(error) {
  const message = String(error?.message || error || '');
  
  if (/rate.?limit|429/i.test(message)) return 'rate_limit';
  if (/timeout|ETIMEDOUT/i.test(message)) return 'timeout';
  if (/unauthorized|invalid.?api.?key|401|403/i.test(message)) return 'auth';
  if (/quota|billing|insufficient/i.test(message)) return 'quota';
  if (/organization.*verify|verification/i.test(message)) return 'verification';
  if (/model.*not.*found|unsupported.*model/i.test(message)) return 'model';
  if (/5\d\d|server.?error/i.test(message)) return 'server';
  if (/network|ENOTFOUND/i.test(message)) return 'network';
  
  return 'unknown';
}

// GPT-5 Request Builder with Official Parameters
function buildGPT5Request(model, prompt, options = {}) {
  // Handle different input formats
  let messages;
  if (typeof prompt === 'string') {
    messages = [{ role: 'user', content: prompt }];
  } else if (Array.isArray(prompt)) {
    messages = prompt;
  } else {
    throw new Error('Prompt must be a string or array of messages');
  }
  
  // Truncate if too long
  const totalText = messages.map(m => m.content || '').join('\n');
  if (totalText.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) {
    console.warn('Prompt truncated due to length');
    if (messages.length === 1) {
      messages[0].content = messages[0].content.slice(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + '\n... (truncated)';
    }
  }
  
  // Build the request
  const request = {
    model: model,
    messages: messages,
    max_completion_tokens: Math.min(
      options.max_completion_tokens || GPT5_CONFIG.MAX_COMPLETION_TOKENS,
      GPT5_CONFIG.MAX_OUTPUT_TOKENS
    )
  };
  
  // Add GPT-5 specific parameters
  if (options.reasoning_effort && REASONING_EFFORTS.includes(options.reasoning_effort)) {
    request.reasoning_effort = options.reasoning_effort;
  }
  
  if (options.verbosity && VERBOSITY_LEVELS.includes(options.verbosity)) {
    request.verbosity = options.verbosity;
  }
  
  // Standard parameters
  if (typeof options.temperature === 'number' && options.temperature >= 0 && options.temperature <= 2) {
    request.temperature = options.temperature;
  }
  
  if (typeof options.top_p === 'number' && options.top_p > 0 && options.top_p <= 1) {
    request.top_p = options.top_p;
  }
  
  // Tools support
  if (options.tools && Array.isArray(options.tools)) {
    request.tools = options.tools;
    if (options.tool_choice) {
      request.tool_choice = options.tool_choice;
    }
  }
  
  // Stream support (but check for verification issues)
  if (options.stream === true) {
    request.stream = true;
  }
  
  return request;
}

function extractResponse(completion) {
  if (!completion || !completion.choices || completion.choices.length === 0) {
    return 'No response generated';
  }
  
  const choice = completion.choices[0];
  
  // Handle tool calls
  if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
    return {
      content: choice.message.content || '',
      tool_calls: choice.message.tool_calls,
      finish_reason: choice.finish_reason
    };
  }
  
  // Regular response
  const content = choice.message?.content;
  return content && String(content).trim() || 'Empty response received';
}

// Retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorType = classifyError(error);
      
      // Don't retry auth/quota/verification errors
      if (['auth', 'quota', 'verification', 'model'].includes(errorType)) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        const delay = Math.min(2000 * Math.pow(2, i), 30000);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Main GPT-5 Analysis Function
async function getGPT5Analysis(prompt, options = {}) {
  const startTime = Date.now();
  
  if (!prompt || (typeof prompt !== 'string' && !Array.isArray(prompt))) {
    throw new Error('Prompt must be a non-empty string or message array');
  }
  
  const model = options.model || GPT5_CONFIG.MINI_MODEL;
  const reasoningEffort = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  const verbosity = options.verbosity || GPT5_CONFIG.DEFAULT_VERBOSITY;
  
  // Validate GPT-5 parameters
  if (reasoningEffort && !REASONING_EFFORTS.includes(reasoningEffort)) {
    throw new Error(`Invalid reasoning_effort: ${reasoningEffort}. Valid: ${REASONING_EFFORTS.join(', ')}`);
  }
  
  if (verbosity && !VERBOSITY_LEVELS.includes(verbosity)) {
    throw new Error(`Invalid verbosity: ${verbosity}. Valid: ${VERBOSITY_LEVELS.join(', ')}`);
  }
  
  // Check cache
  const cacheKey = generateCacheKey(model, typeof prompt === 'string' ? prompt : JSON.stringify(prompt), {
    ...options,
    reasoning_effort: reasoningEffort,
    verbosity: verbosity
  });
  
  const cached = responseCache.get(cacheKey);
  if (cached) {
    console.log('GPT-5 Cache hit');
    updateMetrics(model, true, {}, Date.now() - startTime, null, reasoningEffort, verbosity, true);
    return cached;
  }
  
  try {
    if (GPT5_CONFIG.LOG_REQUESTS) {
      console.log('GPT-5 Request:', {
        model,
        reasoning: reasoningEffort,
        verbosity: verbosity,
        length: typeof prompt === 'string' ? prompt.length : prompt.length
      });
    }
    
    const request = buildGPT5Request(model, prompt, {
      ...options,
      reasoning_effort: reasoningEffort,
      verbosity: verbosity
    });
    
    const completion = await retryWithBackoff(async () => {
      return await openai.chat.completions.create(request);
    });
    
    const response = extractResponse(completion);
    const usage = completion.usage || {};
    const elapsed = Date.now() - startTime;
    
    // Cache successful response
    if (typeof response === 'string') {
      responseCache.set(cacheKey, response);
    }
    
    updateMetrics(model, true, usage, elapsed, null, reasoningEffort, verbosity, false);
    
    if (GPT5_CONFIG.LOG_RESPONSES) {
      console.log('GPT-5 Response:', {
        model,
        reasoning: reasoningEffort,
        verbosity: verbosity,
        tokens: usage.total_tokens || 0,
        reasoning_tokens: usage.reasoning_tokens || 0,
        time: elapsed,
        length: typeof response === 'string' ? response.length : 'N/A'
      });
    }
    
    return response;
    
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const errorType = classifyError(error);
    
    updateMetrics(model, false, {}, elapsed, errorType, reasoningEffort, verbosity, false);
    
    console.error('GPT-5 Analysis error:', error.message);
    
    // Provide helpful error messages
    if (errorType === 'verification') {
      throw new Error('Organization verification required. Visit: https://platform.openai.com/settings/organization/general');
    }
    
    if (errorType === 'quota') {
      throw new Error('API quota exceeded. Check your OpenAI billing.');
    }
    
    if (errorType === 'auth') {
      throw new Error('Invalid API key. Check your OPENAI_API_KEY.');
    }
    
    if (errorType === 'model') {
      // Try fallback to nano model
      if (model !== GPT5_CONFIG.NANO_MODEL) {
        console.log('Trying GPT-5 nano fallback...');
        return await getGPT5Analysis(prompt, { 
          ...options, 
          model: GPT5_CONFIG.NANO_MODEL,
          reasoning_effort: 'minimal' // Use minimal reasoning for fallback
        });
      }
    }
    
    throw error;
  }
}

// Convenience Functions for Different GPT-5 Models
async function getGPT5Response(prompt, options = {}) {
  return await getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.PRIMARY_MODEL,
    reasoning_effort: 'medium',
    verbosity: 'medium'
  });
}

async function getGPT5MiniResponse(prompt, options = {}) {
  return await getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.MINI_MODEL,
    reasoning_effort: 'low',
    verbosity: 'medium'
  });
}

async function getGPT5NanoResponse(prompt, options = {}) {
  return await getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.NANO_MODEL,
    reasoning_effort: 'minimal',
    verbosity: 'low',
    max_completion_tokens: Math.min(options.max_completion_tokens || 2000, 4000)
  });
}

async function getGPT5ChatResponse(prompt, options = {}) {
  return await getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.CHAT_MODEL // Non-reasoning chat model
  });
}

// Deep reasoning for complex tasks
async function getGPT5DeepAnalysis(prompt, options = {}) {
  return await getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.PRIMARY_MODEL,
    reasoning_effort: 'high',
    verbosity: 'high',
    max_completion_tokens: Math.min(options.max_completion_tokens || 12000, GPT5_CONFIG.MAX_OUTPUT_TOKENS)
  });
}

// Tool usage with GPT-5
async function getGPT5WithTools(prompt, tools = [], options = {}) {
  return await getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.PRIMARY_MODEL,
    reasoning_effort: 'medium',
    verbosity: 'medium',
    tools,
    tool_choice: options.tool_choice || 'auto'
  });
}

// Health check
async function testGPT5Connection() {
  try {
    const response = await getGPT5NanoResponse('Hello', { max_completion_tokens: 20 });
    return {
      success: true,
      response,
      model: GPT5_CONFIG.NANO_MODEL
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      errorType: classifyError(error)
    };
  }
}

// Comprehensive health check
async function checkGPT5Health() {
  const health = {
    timestamp: new Date().toISOString(),
    models: {},
    errors: [],
    config: {
      primaryModel: GPT5_CONFIG.PRIMARY_MODEL,
      miniModel: GPT5_CONFIG.MINI_MODEL,
      nanoModel: GPT5_CONFIG.NANO_MODEL,
      chatModel: GPT5_CONFIG.CHAT_MODEL,
      contextWindow: `${GPT5_CONFIG.MAX_INPUT_TOKENS / 1000}K input, ${GPT5_CONFIG.MAX_OUTPUT_TOKENS / 1000}K output`
    },
    metrics: getMetrics(),
    cache: responseCache.getStats()
  };
  
  // Test each GPT-5 model
  const testModels = [
    { name: GPT5_CONFIG.NANO_MODEL, fn: getGPT5NanoResponse },
    { name: GPT5_CONFIG.MINI_MODEL, fn: getGPT5MiniResponse },
    { name: GPT5_CONFIG.PRIMARY_MODEL, fn: getGPT5Response }
  ];
  
  for (const testModel of testModels) {
    try {
      await testModel.fn('Test', { max_completion_tokens: 10 });
      health.models[testModel.name] = 'available';
      console.log(`${testModel.name}: OK`);
    } catch (error) {
      const errorType = classifyError(error);
      health.models[testModel.name] = errorType;
      health.errors.push(`${testModel.name}: ${error.message}`);
      console.log(`${testModel.name}: ${errorType}`);
    }
  }
  
  health.overall = Object.values(health.models).some(status => status === 'available');
  
  return health;
}

function getMetrics() {
  const uptime = Date.now() - metrics.lastReset;
  return {
    ...metrics,
    uptimeMs: uptime,
    avgLatencyMs: metrics.successfulRequests > 0 ? metrics.totalLatencyMs / metrics.successfulRequests : 0,
    successRate: metrics.totalRequests > 0 ? metrics.successfulRequests / metrics.totalRequests : 0,
    estimatedCostUSD: Math.round(metrics.totalCost * 100) / 100,
    cacheHitRate: (metrics.cacheHits + metrics.cacheMisses) > 0 ? metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) : 0
  };
}

// Startup messages
console.log('GPT-5 Client Ready - Official Release (August 7, 2025)');
console.log(`Reasoning efforts: ${REASONING_EFFORTS.join(', ')}`);
console.log(`Verbosity levels: ${VERBOSITY_LEVELS.join(', ')}`);
console.log(`Features: ${GPT5_CONFIG.ENABLE_CACHING ? '✓' : '✗'} Cache, ${GPT5_CONFIG.ENABLE_METRICS ? '✓' : '✗'} Metrics`);

// Export all functions
module.exports = {
  // Main analysis function
  getGPT5Analysis,
  
  // Convenience functions for different models
  getGPT5Response,        // Full GPT-5 with medium reasoning
  getGPT5MiniResponse,    // GPT-5 Mini - cost effective
  getGPT5NanoResponse,    // GPT-5 Nano - fastest and cheapest
  getGPT5ChatResponse,    // GPT-5 Chat - non-reasoning model
  getGPT5DeepAnalysis,    // High reasoning for complex tasks
  getGPT5WithTools,       // GPT-5 with tool usage
  
  // Health and testing
  testGPT5Connection,
  checkGPT5Health,
  
  // Utilities
  getMetrics,
  clearCache: () => responseCache.clear(),
  
  // Configuration and constants
  GPT5_CONFIG,
  REASONING_EFFORTS,
  VERBOSITY_LEVELS,
  GPT5_PRICING,
  
  // Low-level access
  openai,
  buildGPT5Request,
  extractResponse,
  estimateTokens,
  classifyError,
  
  // Backwards compatibility aliases
  getAnalysis: getGPT5Analysis,
  getQuickResponse: getGPT5NanoResponse,
  getDetailedResponse: getGPT5DeepAnalysis,
  getChatResponse: getGPT5ChatResponse,
  getResponseWithTools: getGPT5WithTools,
  testConnection: testGPT5Connection,
  checkHealth: checkGPT5Health
};
