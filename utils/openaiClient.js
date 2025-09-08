// utils/openaiClient.js - Railway-Optimized GPT-5 Client
// ═══════════════════════════════════════════════════════════════════════════
// Simplified, reliable GPT-5 client optimized for Railway deployment
// Uses correct OpenAI API parameters and Railway-appropriate resource management
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

require('dotenv').config();
const OpenAI = require('openai');

// Validation
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

console.log('🧠 Loading Railway-Optimized GPT-5 Client...');

// ═══════════════════════════════════════════════════════════════════════════
// RAILWAY-OPTIMIZED CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Official GPT-5 models (August 2025 release)
  MODELS: {
    FULL: 'gpt-5',
    MINI: 'gpt-5-mini', 
    NANO: 'gpt-5-nano',
    CHAT: 'gpt-5-chat-latest'
  },
  
  // Railway-optimized limits
  MAX_OUTPUT_TOKENS: 16384,
  CONTEXT_WINDOW: 128000,  // Conservative for Railway
  MAX_PROMPT_LENGTH: 100000,  // Railway memory limit
  
  // Official reasoning efforts
  REASONING_EFFORTS: ['minimal', 'low', 'medium', 'high'],
  DEFAULT_REASONING: 'medium',
  
  // Official verbosity levels  
  VERBOSITY_LEVELS: ['low', 'medium', 'high'],
  DEFAULT_VERBOSITY: 'medium',
  
  // Railway-safe timeouts
  REQUEST_TIMEOUT: 90000,  // 90 seconds
  MAX_RETRIES: 2,
  
  // Official pricing (per 1M tokens)
  PRICING: {
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5-nano': { input: 0.05, output: 0.40 }
  },
  
  // Railway deployment optimizations
  RAILWAY: {
    MEMORY_EFFICIENT: true,
    SIMPLE_CACHING: true,
    ERROR_TOLERANCE: true
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function safeString(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function safeNumber(value, defaultValue = 0) {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

function calculateTokens(text) {
  // Rough estimation: 1 token ≈ 4 characters
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
// RAILWAY-EFFICIENT METRICS
// ═══════════════════════════════════════════════════════════════════════════

const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTokens: 0,
  totalCost: 0,
  averageResponseTime: 0,
  modelUsage: {},
  errors: [],
  startTime: Date.now(),
  
  record(success, model, inputTokens, outputTokens, responseTime, error = null) {
    this.totalRequests++;
    
    if (success) {
      this.successfulRequests++;
      this.totalTokens += inputTokens + outputTokens;
      this.totalCost += calculateCost(model, inputTokens, outputTokens);
      
      // Update average response time
      const currentAvg = this.averageResponseTime;
      const count = this.successfulRequests;
      this.averageResponseTime = ((currentAvg * (count - 1)) + responseTime) / count;
      
      // Track model usage
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
        
        // Keep only last 10 errors for Railway memory efficiency
        if (this.errors.length > 10) {
          this.errors = this.errors.slice(-10);
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
        totalCost: '$' + this.totalCost.toFixed(4),
        averageResponseTime: Math.round(this.averageResponseTime) + 'ms'
      },
      models: this.modelUsage,
      system: {
        uptime: Math.round(uptime / 1000) + 's',
        recentErrors: this.errors.length,
        railwayOptimized: true
      }
    };
  },
  
  reset() {
    Object.assign(this, {
      totalRequests: 0,
      successfulRequests: 0, 
      failedRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageResponseTime: 0,
      modelUsage: {},
      errors: [],
      startTime: Date.now()
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE RAILWAY-EFFICIENT CACHE
// ═══════════════════════════════════════════════════════════════════════════

const cache = {
  data: new Map(),
  maxSize: 100,  // Railway memory limit
  ttl: 300000,   // 5 minutes
  
  generateKey(prompt, options) {
    const keyData = safeString(prompt) + JSON.stringify(options || {});
    // Simple hash for Railway efficiency
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
    // Railway memory management
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
// OPENAI CLIENT SETUP
// ═══════════════════════════════════════════════════════════════════════════

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: CONFIG.REQUEST_TIMEOUT,
  maxRetries: CONFIG.MAX_RETRIES,
  defaultHeaders: {
    'User-Agent': 'GPT5-Railway-Client/1.0',
    'X-Environment': process.env.NODE_ENV || 'production'
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SMART MODEL SELECTION
// ═══════════════════════════════════════════════════════════════════════════

function selectOptimalModel(prompt, options = {}) {
  // Honor explicit model selection
  if (options.model && options.model.includes('gpt-5')) {
    return options.model;
  }
  
  const text = safeString(prompt);
  const length = text.length;
  
  // Complexity indicators
  const complexWords = ['analyze', 'compare', 'evaluate', 'research', 'comprehensive', 'detailed'];
  const hasComplexity = complexWords.some(word => text.toLowerCase().includes(word));
  const hasHighReasoning = options.reasoning_effort === 'high';
  
  // Model selection logic
  if (length < 1000 && !hasComplexity && !hasHighReasoning) {
    return CONFIG.MODELS.NANO;
  }
  
  if (length < 5000 && !hasHighReasoning) {
    return CONFIG.MODELS.MINI;
  }
  
  return CONFIG.MODELS.FULL;
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST BUILDER
// ═══════════════════════════════════════════════════════════════════════════

function buildGPT5Request(prompt, options = {}) {
  const model = selectOptimalModel(prompt, options);
  
  const request = {
    model: model,
    messages: [
      { role: 'user', content: safeString(prompt) }
    ]
  };
  
  // Token limits
  const maxTokens = options.max_tokens || options.max_completion_tokens || 8000;
  request.max_completion_tokens = Math.min(maxTokens, CONFIG.MAX_OUTPUT_TOKENS);
  
  // GPT-5 specific parameters (CORRECTED)
  if (options.reasoning_effort && CONFIG.REASONING_EFFORTS.includes(options.reasoning_effort)) {
    request.reasoning_effort = options.reasoning_effort;
  }
  
  if (options.verbosity && CONFIG.VERBOSITY_LEVELS.includes(options.verbosity)) {
    request.verbosity = options.verbosity;
  }
  
  // Standard parameters
  if (typeof options.temperature === 'number') {
    request.temperature = Math.max(0, Math.min(2, options.temperature));
  }
  
  if (typeof options.top_p === 'number') {
    request.top_p = Math.max(0, Math.min(1, options.top_p));
  }
  
  return request;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractResponse(completion) {
  try {
    // GPT-5 Chat Completions API response
    const content = completion?.choices?.[0]?.message?.content;
    
    if (!content) {
      return '[No content in response]';
    }
    
    return String(content).trim();
    
  } catch (error) {
    return `[Extraction error: ${error.message}]`;
  }
}

function extractUsage(completion) {
  const usage = completion?.usage || {};
  
  return {
    inputTokens: usage.prompt_tokens || usage.input_tokens || 0,
    outputTokens: usage.completion_tokens || usage.output_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    reasoningTokens: usage.completion_tokens_details?.reasoning_tokens || 0
  };
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
      
      // Check if we should retry
      const status = error?.status || error?.response?.status;
      const isRetryable = status === 429 || status === 500 || status === 502 || status === 503;
      
      if (attempt < maxRetries && isRetryable) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Max 5 second delay
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
// CORE GPT-5 FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function getGPT5Analysis(prompt, options = {}) {
  const startTime = Date.now();
  let selectedModel = 'unknown';
  
  try {
    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: must be non-empty string');
    }
    
    let text = safeString(prompt);
    if (text.length > CONFIG.MAX_PROMPT_LENGTH) {
      text = text.substring(0, CONFIG.MAX_PROMPT_LENGTH) + '\n...(truncated for Railway)';
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
    
    // Build request
    const request = buildGPT5Request(text, options);
    selectedModel = request.model;
    
    console.log(`[GPT5-Request] Model: ${selectedModel}, Tokens: ~${calculateTokens(text)}`);
    
    // Execute with retry
    const completion = await withRetry(async () => {
      return await openai.chat.completions.create(request);
    });
    
    // Extract response and usage
    const content = extractResponse(completion);
    const usage = extractUsage(completion);
    const responseTime = Date.now() - startTime;
    
    // Validate response
    if (!content || content.startsWith('[No content') || content.startsWith('[Extraction')) {
      throw new Error('Empty or invalid response from GPT-5');
    }
    
    // Log success
    const cost = calculateCost(selectedModel, usage.inputTokens, usage.outputTokens);
    console.log(`[GPT5-Success] ${selectedModel}: ${usage.outputTokens} tokens, $${cost.toFixed(4)}, ${responseTime}ms`);
    
    // Record metrics
    metrics.record(true, selectedModel, usage.inputTokens, usage.outputTokens, responseTime);
    
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
    metrics.record(false, selectedModel, 0, 0, responseTime, errorMessage);
    
    // Return error message for Railway stability
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
    cache: cache.getStats(),
    railwayOptimized: true
  };
  
  // Test each model
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
  
  // Determine overall health
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
      requestTimeout: CONFIG.REQUEST_TIMEOUT,
      railwayOptimized: CONFIG.RAILWAY
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
console.log('🚅 Railway-Optimized GPT-5 Client Loaded');
console.log('');
console.log('✅ Models:');
console.log(`   🧠 GPT-5: $${CONFIG.PRICING['gpt-5'].input}/$${CONFIG.PRICING['gpt-5'].output} per 1M tokens`);
console.log(`   ⚡ Mini: $${CONFIG.PRICING['gpt-5-mini'].input}/$${CONFIG.PRICING['gpt-5-mini'].output} per 1M tokens`);
console.log(`   💫 Nano: $${CONFIG.PRICING['gpt-5-nano'].input}/$${CONFIG.PRICING['gpt-5-nano'].output} per 1M tokens`);
console.log('');
console.log('🚅 Railway Optimizations:');
console.log(`   • Memory efficient: ${CONFIG.RAILWAY.MEMORY_EFFICIENT}`);
console.log(`   • Simple caching: ${CONFIG.RAILWAY.SIMPLE_CACHING}`);  
console.log(`   • Error tolerance: ${CONFIG.RAILWAY.ERROR_TOLERANCE}`);
console.log(`   • Cache limit: ${cache.maxSize} entries`);
console.log(`   • Request timeout: ${CONFIG.REQUEST_TIMEOUT / 1000}s`);
console.log('');
console.log('✅ Railway-Optimized GPT-5 Client Ready');
console.log('');
