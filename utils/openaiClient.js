// utils/openaiClient.js - Fixed Complete GPT-5 Client
// ═══════════════════════════════════════════════════════════════════════════
// Railway-compatible GPT-5 client with full official capabilities
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

require('dotenv').config();
const OpenAI = require('openai');

// Validation
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

console.log('🧠 Loading Fixed Complete GPT-5 Client...');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  MODELS: {
    FULL: 'gpt-5',
    MINI: 'gpt-5-mini',
    NANO: 'gpt-5-nano',
    CHAT: 'gpt-5-chat-latest'
  },
  
  MAX_OUTPUT_TOKENS: 16384,
  CONTEXT_WINDOW: 200000,  // Conservative for Railway
  MAX_PROMPT_LENGTH: 150000,
  
  REASONING_EFFORTS: ['minimal', 'low', 'medium', 'high'],
  DEFAULT_REASONING: 'medium',
  
  VERBOSITY_LEVELS: ['low', 'medium', 'high'], 
  DEFAULT_VERBOSITY: 'medium',
  
  PRICING: {
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5-nano': { input: 0.05, output: 0.40 }
  },
  
  REQUEST_TIMEOUT: 120000,
  MAX_RETRIES: 2
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function safeString(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function calculateTokens(text) {
  return Math.ceil(safeString(text).length / 4);
}

function calculateCost(model, inputTokens, outputTokens) {
  const pricing = CONFIG.PRICING[model];
  if (!pricing) return 0;
  
  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;
  
  return inputCost + outputCost;
}

function getCambodiaTimestamp() {
  try {
    const now = new Date();
    const cambodiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }));
    return cambodiaTime.toISOString().replace('Z', '+07:00');
  } catch (error) {
    return new Date().toISOString();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE METRICS
// ═══════════════════════════════════════════════════════════════════════════

const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTokens: 0,
  totalCost: 0,
  modelUsage: {},
  errors: [],
  startTime: Date.now(),
  
  record(success, model, inputTokens, outputTokens, error = null) {
    this.totalRequests++;
    
    if (success) {
      this.successfulRequests++;
      this.totalTokens += inputTokens + outputTokens;
      this.totalCost += calculateCost(model, inputTokens, outputTokens);
      
      if (!this.modelUsage[model]) {
        this.modelUsage[model] = { requests: 0, tokens: 0, cost: 0 };
      }
      this.modelUsage[model].requests++;
      this.modelUsage[model].tokens += inputTokens + outputTokens;
      this.modelUsage[model].cost += calculateCost(model, inputTokens, outputTokens);
      
    } else {
      this.failedRequests++;
      if (error) {
        this.errors.push({
          timestamp: getCambodiaTimestamp(),
          model: model,
          error: safeString(error).substring(0, 200)
        });
        
        if (this.errors.length > 20) {
          this.errors = this.errors.slice(-20);
        }
      }
    }
  },
  
  getStats() {
    const uptime = Date.now() - this.startTime;
    const successRate = this.totalRequests > 0 ? 
      (this.successfulRequests / this.totalRequests * 100).toFixed(1) : '0.0';
    
    return {
      requests: {
        total: this.totalRequests,
        successful: this.successfulRequests,
        failed: this.failedRequests,
        successRate: successRate + '%'
      },
      usage: {
        totalTokens: this.totalTokens,
        totalCost: '$' + this.totalCost.toFixed(6),
        modelUsage: this.modelUsage
      },
      system: {
        uptime: Math.round(uptime / 1000) + 's',
        recentErrors: this.errors.length
      }
    };
  },
  
  reset() {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.totalTokens = 0;
    this.totalCost = 0;
    this.modelUsage = {};
    this.errors = [];
    this.startTime = Date.now();
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE CACHE
// ═══════════════════════════════════════════════════════════════════════════

const cache = {
  data: new Map(),
  maxSize: 500,
  ttl: 1800000, // 30 minutes
  
  generateKey(prompt, options) {
    const keyData = safeString(prompt) + JSON.stringify(options || {});
    let hash = 0;
    for (let i = 0; i < keyData.length; i++) {
      const char = keyData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  },
  
  get(key) {
    const item = this.data.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.data.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  set(key, value) {
    if (this.data.size >= this.maxSize) {
      const firstKey = this.data.keys().next().value;
      this.data.delete(firstKey);
    }
    
    this.data.set(key, {
      value: value,
      timestamp: Date.now()
    });
  },
  
  clear() {
    this.data.clear();
  },
  
  getStats() {
    return {
      size: this.data.size,
      maxSize: this.maxSize,
      ttlMinutes: this.ttl / 60000
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// OPENAI CLIENT
// ═══════════════════════════════════════════════════════════════════════════

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: CONFIG.REQUEST_TIMEOUT,
  maxRetries: CONFIG.MAX_RETRIES
});

// ═══════════════════════════════════════════════════════════════════════════
// MODEL SELECTION
// ═══════════════════════════════════════════════════════════════════════════

function selectOptimalModel(prompt, options = {}) {
  if (options.model && options.model.includes('gpt-5')) {
    return options.model;
  }
  
  const text = safeString(prompt);
  const length = text.length;
  
  const complexWords = ['analyze', 'compare', 'evaluate', 'research', 'comprehensive'];
  const hasComplexity = complexWords.some(word => text.toLowerCase().includes(word));
  
  if (options.reasoning_effort === 'high' || hasComplexity) {
    return CONFIG.MODELS.FULL;
  }
  
  if (length < 2000 && !hasComplexity) {
    return CONFIG.MODELS.NANO;
  }
  
  if (length < 8000) {
    return CONFIG.MODELS.MINI;
  }
  
  return CONFIG.MODELS.FULL;
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST BUILDER
// ═══════════════════════════════════════════════════════════════════════════

function buildRequest(prompt, options = {}) {
  const model = selectOptimalModel(prompt, options);
  
  const request = {
    model: model,
    messages: [{ role: 'user', content: safeString(prompt) }]
  };
  
  const maxTokens = options.max_tokens || options.max_completion_tokens || 8000;
  request.max_completion_tokens = Math.min(maxTokens, CONFIG.MAX_OUTPUT_TOKENS);
  
  if (options.reasoning_effort && CONFIG.REASONING_EFFORTS.includes(options.reasoning_effort)) {
    request.reasoning_effort = options.reasoning_effort;
  }
  
  if (options.verbosity && CONFIG.VERBOSITY_LEVELS.includes(options.verbosity)) {
    request.verbosity = options.verbosity;
  }
  
  if (typeof options.temperature === 'number') {
    request.temperature = Math.max(0, Math.min(2, options.temperature));
  }
  
  return request;
}

// ═══════════════════════════════════════════════════════════════════════════
// RETRY LOGIC
// ═══════════════════════════════════════════════════════════════════════════

async function withRetry(operation, maxRetries = 2) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      const status = error?.status || error?.response?.status;
      const isRetryable = status === 429 || status === 500 || status === 502 || status === 503;
      
      if (attempt < maxRetries && isRetryable) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`[GPT5-Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      break;
    }
  }
  
  throw lastError;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function getGPT5Analysis(prompt, options = {}) {
  const startTime = Date.now();
  let selectedModel = 'unknown';
  
  try {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: must be non-empty string');
    }
    
    let text = safeString(prompt);
    if (text.length > CONFIG.MAX_PROMPT_LENGTH) {
      text = text.substring(0, CONFIG.MAX_PROMPT_LENGTH) + '\n...(truncated)';
    }
    
    // Check cache
    const cacheKey = cache.generateKey(text, options);
    if (!options.skipCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('[GPT5-Cache] Cache hit');
        return cached;
      }
    }
    
    // Build and execute request
    const request = buildRequest(text, options);
    selectedModel = request.model;
    
    console.log(`[GPT5-Request] Model: ${selectedModel}, Tokens: ~${calculateTokens(text)}`);
    
    const completion = await withRetry(async () => {
      return await openai.chat.completions.create(request);
    });
    
    // Extract response
    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from GPT-5');
    }
    
    // Extract usage
    const usage = completion?.usage || {};
    const inputTokens = usage.prompt_tokens || usage.input_tokens || 0;
    const outputTokens = usage.completion_tokens || usage.output_tokens || 0;
    const responseTime = Date.now() - startTime;
    
    // Log success
    const cost = calculateCost(selectedModel, inputTokens, outputTokens);
    console.log(`[GPT5-Success] ${selectedModel}: ${outputTokens} tokens, $${cost.toFixed(6)}, ${responseTime}ms`);
    
    // Record metrics
    metrics.record(true, selectedModel, inputTokens, outputTokens);
    
    // Cache response
    if (!options.skipCache && content.length > 10) {
      cache.set(cacheKey, content);
    }
    
    return content;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error?.message || String(error);
    
    console.error(`[GPT5-Error] ${selectedModel}: ${errorMessage} (${responseTime}ms)`);
    
    // Record failure
    metrics.record(false, selectedModel, 0, 0, errorMessage);
    
    return `GPT-5 Error: ${errorMessage}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function getQuickGPT5Response(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: CONFIG.MODELS.NANO,
    reasoning_effort: 'minimal',
    verbosity: 'low',
    max_completion_tokens: 2000
  });
}

async function getDetailedGPT5Analysis(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: CONFIG.MODELS.FULL,
    reasoning_effort: 'high',
    verbosity: 'high',
    max_completion_tokens: 12000
  });
}

async function getEfficientGPT5Response(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: CONFIG.MODELS.MINI,
    reasoning_effort: 'medium',
    verbosity: 'medium',
    max_completion_tokens: 6000
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

function attachMemoryToPrompt(prompt, memory = {}) {
  let enhancedPrompt = '';
  
  if (memory.systemPreamble) {
    enhancedPrompt += `SYSTEM CONTEXT:\n${memory.systemPreamble}\n\n`;
  }
  
  if (memory.recall && Array.isArray(memory.recall) && memory.recall.length > 0) {
    enhancedPrompt += 'MEMORY CONTEXT:\n';
    memory.recall.forEach(item => {
      enhancedPrompt += `- ${item}\n`;
    });
    enhancedPrompt += '\n';
  }
  
  enhancedPrompt += `USER REQUEST:\n${safeString(prompt)}`;
  
  return enhancedPrompt;
}

async function getGPT5ResponseWithMemory(prompt, memory, options = {}) {
  const enhancedPrompt = attachMemoryToPrompt(prompt, memory);
  return getGPT5Analysis(enhancedPrompt, options);
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH AND TESTING
// ═══════════════════════════════════════════════════════════════════════════

async function testGPT5Connection() {
  try {
    const response = await getQuickGPT5Response('Respond with "GPT-5 READY" if operational.', {
      max_completion_tokens: 10,
      skipCache: true
    });
    
    return {
      success: true,
      result: response,
      gpt5Available: !response.startsWith('GPT-5 Error:'),
      timestamp: getCambodiaTimestamp()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      gpt5Available: false,
      timestamp: getCambodiaTimestamp()
    };
  }
}

async function checkGPT5SystemHealth() {
  const health = {
    timestamp: getCambodiaTimestamp(),
    overall: 'unknown',
    models: {},
    metrics: metrics.getStats(),
    cache: cache.getStats()
  };
  
  const modelsToTest = [
    { name: CONFIG.MODELS.NANO, key: 'nano' },
    { name: CONFIG.MODELS.MINI, key: 'mini' },
    { name: CONFIG.MODELS.FULL, key: 'full' }
  ];
  
  for (const modelTest of modelsToTest) {
    try {
      const response = await getGPT5Analysis('Test', {
        model: modelTest.name,
        max_completion_tokens: 5,
        skipCache: true,
        reasoning_effort: 'minimal'
      });
      
      health.models[modelTest.key] = {
        available: !response.startsWith('GPT-5 Error:'),
        tested: true
      };
    } catch (error) {
      health.models[modelTest.key] = {
        available: false,
        tested: true,
        error: error.message
      };
    }
  }
  
  const availableModels = Object.values(health.models).filter(m => m.available).length;
  health.overall = availableModels > 0 ? 'healthy' : 'degraded';
  health.availableModels = availableModels;
  
  return health;
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function clearGPT5Cache() {
  cache.clear();
  return { success: true, message: 'Cache cleared successfully' };
}

async function resetGPT5Metrics() {
  metrics.reset();
  return { success: true, message: 'Metrics reset successfully' };
}

async function getGPT5SystemStats() {
  return {
    timestamp: getCambodiaTimestamp(),
    metrics: metrics.getStats(),
    cache: cache.getStats(),
    models: CONFIG.MODELS,
    pricing: CONFIG.PRICING,
    configuration: {
      maxOutputTokens: CONFIG.MAX_OUTPUT_TOKENS,
      contextWindow: CONFIG.CONTEXT_WINDOW,
      requestTimeout: CONFIG.REQUEST_TIMEOUT
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Core functions
  getGPT5Analysis,
  getGPT5ResponseWithMemory,
  
  // Specialized functions
  getQuickGPT5Response,
  getDetailedGPT5Analysis,
  getEfficientGPT5Response,
  
  // Memory helpers
  attachMemoryToPrompt,
  
  // Health and testing
  testGPT5Connection,
  checkGPT5SystemHealth,
  
  // Admin functions
  clearGPT5Cache,
  resetGPT5Metrics,
  getGPT5SystemStats,
  
  // Utility functions
  selectOptimalModel,
  calculateCost,
  calculateTokens,
  getCambodiaTimestamp,
  
  // System components
  metrics,
  cache,
  openai,
  CONFIG,
  
  // Backward compatibility aliases
  getGPT5AnalysisWithMemory: getGPT5ResponseWithMemory,
  getQuickNanoResponse: getQuickGPT5Response,
  getQuickMiniResponse: getEfficientGPT5Response,
  getDeepAnalysis: getDetailedGPT5Analysis,
  getChatResponse: getGPT5Analysis,
  getChatWithMemory: getGPT5ResponseWithMemory,
  testOpenAIConnection: testGPT5Connection,
  clearCache: clearGPT5Cache,
  resetMetrics: resetGPT5Metrics,
  getSystemStats: getGPT5SystemStats,
  attachMemoryToMessages: attachMemoryToPrompt
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

console.log('');
console.log('🧠 Fixed Complete GPT-5 Client Loaded');
console.log('');
console.log('✅ Models:');
console.log(`   🧠 GPT-5: $${CONFIG.PRICING['gpt-5'].input}/$${CONFIG.PRICING['gpt-5'].output} per 1M tokens`);
console.log(`   ⚡ Mini: $${CONFIG.PRICING['gpt-5-mini'].input}/$${CONFIG.PRICING['gpt-5-mini'].output} per 1M tokens`);
console.log(`   💫 Nano: $${CONFIG.PRICING['gpt-5-nano'].input}/$${CONFIG.PRICING['gpt-5-nano'].output} per 1M tokens`);
console.log('');
console.log('🚀 Features:');
console.log('   • Smart model selection');
console.log('   • Reasoning effort levels');
console.log('   • Intelligent caching');
console.log('   • Performance metrics');
console.log('   • Cambodia timezone');
console.log('');
console.log('✅ GPT-5 Client Ready');
console.log('');
