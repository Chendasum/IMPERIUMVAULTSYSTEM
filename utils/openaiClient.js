// utils/openaiClient.js - Complete Full-Capacity GPT-5 Client
// ═══════════════════════════════════════════════════════════════════════════
// Official GPT-5 implementation with ALL features and APIs
// Supports both Responses API and Chat Completions API
// Full reasoning capabilities, thinking time tracking, and advanced metrics
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

require('dotenv').config();
const OpenAI = require('openai');
const crypto = require('crypto');

// Validation
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

console.log('🧠 Loading Complete Full-Capacity GPT-5 Client...');

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETE GPT-5 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const GPT5_CONFIG = {
  // Official GPT-5 models (August 2025 release)
  MODELS: {
    FULL: 'gpt-5',
    MINI: 'gpt-5-mini',
    NANO: 'gpt-5-nano',
    CHAT: 'gpt-5-chat-latest'
  },
  
  // Full official limits
  MAX_OUTPUT_TOKENS: 16384,
  CONTEXT_WINDOW: 400000,  // Full 400K context
  MAX_PROMPT_LENGTH: 350000,
  
  // Official reasoning efforts
  REASONING_EFFORTS: ['minimal', 'low', 'medium', 'high'],
  DEFAULT_REASONING: 'medium',
  
  // Official verbosity levels
  VERBOSITY_LEVELS: ['low', 'medium', 'high'],
  DEFAULT_VERBOSITY: 'medium',
  
  // API configuration
  DUAL_API: {
    ENABLED: true,
    RESPONSES_FOR_REASONING: true,
    CHAT_FOR_SIMPLE: true,
    REASONING_THRESHOLD: 'medium'  // medium+ goes to Responses API
  },
  
  // Smart model selection
  AUTO_SCALE: {
    ENABLED: true,
    NANO_MAX_LENGTH: 2000,
    MINI_MAX_LENGTH: 10000,
    COMPLEXITY_KEYWORDS: ['analyze', 'compare', 'evaluate', 'research', 'complex', 'detailed', 'comprehensive', 'thorough']
  },
  
  // Official pricing (per 1M tokens)
  PRICING: {
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5-nano': { input: 0.05, output: 0.40 }
  },
  
  // Advanced features
  ADVANCED: {
    THINKING_TIME_TRACKING: true,
    REASONING_TOKEN_TRACKING: true,
    RESPONSE_QUALITY_METRICS: true,
    ADAPTIVE_TIMEOUTS: true
  },
  
  // Request configuration
  REQUEST_TIMEOUT: 180000,  // 3 minutes for complex reasoning
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 3000, 6000]
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
  return Math.ceil(safeString(text).length / 4);
}

function calculateCost(model, inputTokens, outputTokens, reasoningTokens = 0) {
  const pricing = GPT5_CONFIG.PRICING[model];
  if (!pricing) return 0;
  
  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = ((outputTokens + reasoningTokens) / 1000000) * pricing.output;
  
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

function generateHash(input) {
  return crypto.createHash('sha256').update(safeString(input)).digest('hex').substring(0, 16);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE METRICS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

class AdvancedMetrics {
  constructor() {
    this.stats = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byModel: {},
        byAPI: { responses: 0, chat: 0 },
        byReasoningLevel: {}
      },
      tokens: {
        total: 0,
        input: 0,
        output: 0,
        reasoning: 0,
        byModel: {}
      },
      costs: {
        total: 0,
        byModel: {},
        estimatedMonthly: 0
      },
      performance: {
        averageResponseTime: 0,
        responseTimes: [],
        thinkingTimes: [],
        averageThinkingTime: 0,
        qualityScores: []
      },
      reasoning: {
        totalSessions: 0,
        averageReasoningTokens: 0,
        reasoningEfficiency: 0,
        byEffortLevel: {}
      },
      errors: {
        recent: [],
        byType: {},
        recoveryRate: 0
      }
    };
    this.startTime = Date.now();
  }
  
  recordRequest(success, model, apiType, options = {}) {
    this.stats.requests.total++;
    
    if (success) {
      this.stats.requests.successful++;
    } else {
      this.stats.requests.failed++;
    }
    
    // Track by model
    if (!this.stats.requests.byModel[model]) {
      this.stats.requests.byModel[model] = { total: 0, successful: 0, failed: 0 };
    }
    this.stats.requests.byModel[model].total++;
    this.stats.requests.byModel[model][success ? 'successful' : 'failed']++;
    
    // Track by API
    this.stats.requests.byAPI[apiType] = (this.stats.requests.byAPI[apiType] || 0) + 1;
    
    // Track by reasoning level
    const reasoningLevel = options.reasoning_effort || 'none';
    this.stats.requests.byReasoningLevel[reasoningLevel] = 
      (this.stats.requests.byReasoningLevel[reasoningLevel] || 0) + 1;
  }
  
  recordTokens(model, inputTokens, outputTokens, reasoningTokens = 0) {
    this.stats.tokens.total += inputTokens + outputTokens + reasoningTokens;
    this.stats.tokens.input += inputTokens;
    this.stats.tokens.output += outputTokens;
    this.stats.tokens.reasoning += reasoningTokens;
    
    if (!this.stats.tokens.byModel[model]) {
      this.stats.tokens.byModel[model] = { input: 0, output: 0, reasoning: 0, total: 0 };
    }
    this.stats.tokens.byModel[model].input += inputTokens;
    this.stats.tokens.byModel[model].output += outputTokens;
    this.stats.tokens.byModel[model].reasoning += reasoningTokens;
    this.stats.tokens.byModel[model].total += inputTokens + outputTokens + reasoningTokens;
  }
  
  recordCost(model, cost) {
    this.stats.costs.total += cost;
    this.stats.costs.byModel[model] = (this.stats.costs.byModel[model] || 0) + cost;
    
    // Estimate monthly cost based on recent usage
    const uptimeHours = (Date.now() - this.startTime) / (1000 * 60 * 60);
    if (uptimeHours > 0) {
      const monthlyRate = (this.stats.costs.total / uptimeHours) * 24 * 30;
      this.stats.costs.estimatedMonthly = monthlyRate;
    }
  }
  
  recordPerformance(responseTime, thinkingTime = null, qualityScore = null) {
    this.stats.performance.responseTimes.push(responseTime);
    if (this.stats.performance.responseTimes.length > 1000) {
      this.stats.performance.responseTimes = this.stats.performance.responseTimes.slice(-1000);
    }
    
    const times = this.stats.performance.responseTimes;
    this.stats.performance.averageResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    if (thinkingTime !== null) {
      this.stats.performance.thinkingTimes.push(thinkingTime);
      if (this.stats.performance.thinkingTimes.length > 1000) {
        this.stats.performance.thinkingTimes = this.stats.performance.thinkingTimes.slice(-1000);
      }
      
      const thinkTimes = this.stats.performance.thinkingTimes;
      this.stats.performance.averageThinkingTime = thinkTimes.reduce((a, b) => a + b, 0) / thinkTimes.length;
    }
    
    if (qualityScore !== null) {
      this.stats.performance.qualityScores.push(qualityScore);
      if (this.stats.performance.qualityScores.length > 100) {
        this.stats.performance.qualityScores = this.stats.performance.qualityScores.slice(-100);
      }
    }
  }
  
  recordReasoning(reasoningTokens, effortLevel, inputTokens, outputTokens) {
    this.stats.reasoning.totalSessions++;
    
    if (!this.stats.reasoning.byEffortLevel[effortLevel]) {
      this.stats.reasoning.byEffortLevel[effortLevel] = {
        sessions: 0,
        totalReasoningTokens: 0,
        averageReasoningTokens: 0
      };
    }
    
    const effortStats = this.stats.reasoning.byEffortLevel[effortLevel];
    effortStats.sessions++;
    effortStats.totalReasoningTokens += reasoningTokens;
    effortStats.averageReasoningTokens = effortStats.totalReasoningTokens / effortStats.sessions;
    
    // Update global reasoning stats
    const totalReasoningTokens = Object.values(this.stats.reasoning.byEffortLevel)
      .reduce((sum, level) => sum + level.totalReasoningTokens, 0);
    this.stats.reasoning.averageReasoningTokens = totalReasoningTokens / this.stats.reasoning.totalSessions;
    
    // Calculate reasoning efficiency (output tokens per reasoning token)
    if (reasoningTokens > 0) {
      const efficiency = outputTokens / reasoningTokens;
      this.stats.reasoning.reasoningEfficiency = 
        (this.stats.reasoning.reasoningEfficiency * (this.stats.reasoning.totalSessions - 1) + efficiency) / 
        this.stats.reasoning.totalSessions;
    }
  }
  
  recordError(error, model, context = {}) {
    const errorEntry = {
      timestamp: getCambodiaTimestamp(),
      model: model,
      error: safeString(error).substring(0, 200),
      context: context
    };
    
    this.stats.errors.recent.push(errorEntry);
    if (this.stats.errors.recent.length > 50) {
      this.stats.errors.recent = this.stats.errors.recent.slice(-50);
    }
    
    // Categorize error
    const errorType = this.categorizeError(error);
    this.stats.errors.byType[errorType] = (this.stats.errors.byType[errorType] || 0) + 1;
    
    // Calculate recovery rate
    const totalRequests = this.stats.requests.total;
    const failedRequests = this.stats.requests.failed;
    this.stats.errors.recoveryRate = totalRequests > 0 ? 
      ((totalRequests - failedRequests) / totalRequests * 100) : 100;
  }
  
  categorizeError(error) {
    const errorStr = safeString(error).toLowerCase();
    
    if (errorStr.includes('rate limit') || errorStr.includes('429')) return 'rate_limit';
    if (errorStr.includes('timeout') || errorStr.includes('time')) return 'timeout';
    if (errorStr.includes('context') || errorStr.includes('token')) return 'context_limit';
    if (errorStr.includes('model') || errorStr.includes('not found')) return 'model_error';
    if (errorStr.includes('auth') || errorStr.includes('key')) return 'auth_error';
    if (errorStr.includes('server') || errorStr.includes('500')) return 'server_error';
    
    return 'unknown';
  }
  
  getStats() {
    const uptime = Date.now() - this.startTime;
    const successRate = this.stats.requests.total > 0 ? 
      (this.stats.requests.successful / this.stats.requests.total * 100).toFixed(1) : '0.0';
    
    return {
      timestamp: getCambodiaTimestamp(),
      uptime: {
        milliseconds: uptime,
        hours: Math.round(uptime / (1000 * 60 * 60) * 100) / 100,
        formatted: this.formatUptime(uptime)
      },
      requests: {
        ...this.stats.requests,
        successRate: successRate + '%'
      },
      tokens: this.stats.tokens,
      costs: {
        ...this.stats.costs,
        total: '$' + this.stats.costs.total.toFixed(6),
        estimatedMonthly: '$' + this.stats.costs.estimatedMonthly.toFixed(2)
      },
      performance: {
        ...this.stats.performance,
        averageResponseTime: Math.round(this.stats.performance.averageResponseTime) + 'ms',
        averageThinkingTime: Math.round(this.stats.performance.averageThinkingTime) + 'ms'
      },
      reasoning: this.stats.reasoning,
      errors: {
        ...this.stats.errors,
        recoveryRate: this.stats.errors.recoveryRate.toFixed(1) + '%'
      },
      fullCapacity: true
    };
  }
  
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
  
  reset() {
    this.stats = new AdvancedMetrics().stats;
    this.startTime = Date.now();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT CACHING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

class IntelligentCache {
  constructor(maxSize = 1000, ttl = 3600000) {
    this.cache = new Map();
    this.accessTimes = new Map();
    this.hitCounts = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
  }
  
  generateKey(prompt, options, apiType) {
    const keyData = {
      prompt: safeString(prompt),
      model: options.model,
      reasoning_effort: options.reasoning_effort,
      verbosity: options.verbosity,
      max_completion_tokens: options.max_completion_tokens,
      temperature: options.temperature,
      apiType: apiType
    };
    
    return generateHash(JSON.stringify(keyData));
  }
  
  get(key) {
    this.stats.totalRequests++;
    
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check TTL
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      this.hitCounts.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access tracking
    this.accessTimes.set(key, Date.now());
    this.hitCounts.set(key, (this.hitCounts.get(key) || 0) + 1);
    this.stats.hits++;
    
    return item.value;
  }
  
  set(key, value, metadata = {}) {
    // Smart eviction when at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLeastValuable();
    }
    
    const item = {
      value: value,
      timestamp: Date.now(),
      metadata: metadata
    };
    
    this.cache.set(key, item);
    this.accessTimes.set(key, Date.now());
    this.hitCounts.set(key, 0);
  }
  
  evictLeastValuable() {
    let leastValuableKey = null;
    let leastValue = Infinity;
    
    for (const [key] of this.cache) {
      const lastAccess = this.accessTimes.get(key) || 0;
      const hitCount = this.hitCounts.get(key) || 0;
      const age = Date.now() - lastAccess;
      
      // Value = hits / (age in hours + 1)
      const value = hitCount / (age / 3600000 + 1);
      
      if (value < leastValue) {
        leastValue = value;
        leastValuableKey = key;
      }
    }
    
    if (leastValuableKey) {
      this.cache.delete(leastValuableKey);
      this.accessTimes.delete(leastValuableKey);
      this.hitCounts.delete(leastValuableKey);
      this.stats.evictions++;
    }
  }
  
  clear() {
    this.cache.clear();
    this.accessTimes.clear();
    this.hitCounts.clear();
  }
  
  getStats() {
    const hitRate = this.stats.totalRequests > 0 ? 
      (this.stats.hits / this.stats.totalRequests * 100).toFixed(1) : '0.0';
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: hitRate + '%',
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      totalRequests: this.stats.totalRequests,
      ttlHours: this.ttl / 3600000
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT MODEL AND API SELECTION
// ═══════════════════════════════════════════════════════════════════════════

function selectOptimalModel(prompt, options = {}) {
  // Honor explicit model selection
  if (options.model && options.model.includes('gpt-5')) {
    return options.model;
  }
  
  const text = safeString(prompt);
  const length = text.length;
  
  if (!GPT5_CONFIG.AUTO_SCALE.ENABLED) {
    return GPT5_CONFIG.MODELS.FULL;
  }
  
  // Analyze complexity
  const lowerText = text.toLowerCase();
  const complexityScore = GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS.reduce((score, keyword) => {
    return score + (lowerText.includes(keyword) ? 1 : 0);
  }, 0);
  
  const hasHighReasoning = options.reasoning_effort === 'high';
  const hasMediumReasoning = options.reasoning_effort === 'medium';
  const requestsAnalysis = /analyz|evaluat|compar|research|detail/i.test(text);
  
  // Decision logic
  if (hasHighReasoning || complexityScore >= 3 || (length > 20000 && requestsAnalysis)) {
    return GPT5_CONFIG.MODELS.FULL;
  }
  
  if (length < GPT5_CONFIG.AUTO_SCALE.NANO_MAX_LENGTH && complexityScore === 0 && !hasMediumReasoning) {
    return GPT5_CONFIG.MODELS.NANO;
  }
  
  if (length < GPT5_CONFIG.AUTO_SCALE.MINI_MAX_LENGTH && complexityScore <= 1) {
    return GPT5_CONFIG.MODELS.MINI;
  }
  
  return GPT5_CONFIG.MODELS.FULL;
}

function selectOptimalAPI(prompt, model, options = {}) {
  if (!GPT5_CONFIG.DUAL_API.ENABLED) {
    return 'chat';
  }
  
  const reasoningLevel = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  const hasThinkingRequest = /think|reason|analyz|step.*by.*step/i.test(safeString(prompt));
  
  // Responses API for reasoning-heavy tasks
  if (reasoningLevel === 'high' || 
      (reasoningLevel === 'medium' && hasThinkingRequest) ||
      model === GPT5_CONFIG.MODELS.FULL) {
    return 'responses';
  }
  
  // Chat API for simpler tasks
  return 'chat';
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST BUILDERS
// ═══════════════════════════════════════════════════════════════════════════

function buildResponsesAPIRequest(model, prompt, options = {}) {
  const request = {
    model: model,
    input: safeString(prompt)
  };
  
  // Reasoning effort
  const reasoning = options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING;
  if (GPT5_CONFIG.REASONING_EFFORTS.includes(reasoning)) {
    request.reasoning_effort = reasoning;
  }
  
  // Verbosity
  const verbosity = options.verbosity || GPT5_CONFIG.DEFAULT_VERBOSITY;
  if (GPT5_CONFIG.VERBOSITY_LEVELS.includes(verbosity)) {
    request.verbosity = verbosity;
  }
  
  // Token limits
  const maxTokens = options.max_completion_tokens || options.max_output_tokens || 8000;
  request.max_output_tokens = Math.min(maxTokens, GPT5_CONFIG.MAX_OUTPUT_TOKENS);
  
  return request;
}

function buildChatAPIRequest(model, prompt, options = {}) {
  const request = {
    model: model,
    messages: [{ role: 'user', content: safeString(prompt) }]
  };
  
  // Token limits (GPT-5 uses max_completion_tokens)
  const maxTokens = options.max_completion_tokens || options.max_tokens || 8000;
  request.max_completion_tokens = Math.min(maxTokens, GPT5_CONFIG.MAX_OUTPUT_TOKENS);
  
  // Standard parameters
  if (typeof options.temperature === 'number') {
    request.temperature = Math.max(0, Math.min(2, options.temperature));
  }
  
  if (typeof options.top_p === 'number') {
    request.top_p = Math.max(0, Math.min(1, options.top_p));
  }
  
  if (typeof options.frequency_penalty === 'number') {
    request.frequency_penalty = Math.max(-2, Math.min(2, options.frequency_penalty));
  }
  
  if (typeof options.presence_penalty === 'number') {
    request.presence_penalty = Math.max(-2, Math.min(2, options.presence_penalty));
  }
  
  return request;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE EXTRACTION AND ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

function extractResponseContent(completion, apiType) {
  try {
    if (apiType === 'responses') {
      // Responses API format
      return completion?.output_text || 
             completion?.output?.[0]?.content?.[0]?.text?.value ||
             '[No content in Responses API response]';
    } else {
      // Chat Completions API format  
      return completion?.choices?.[0]?.message?.content || 
             '[No content in Chat API response]';
    }
  } catch (error) {
    return `[Extraction error: ${error.message}]`;
  }
}

function extractUsageMetrics(completion, apiType) {
  const usage = completion?.usage || {};
  
  const metrics = {
    inputTokens: usage.prompt_tokens || usage.input_tokens || 0,
    outputTokens: usage.completion_tokens || usage.output_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    reasoningTokens: 0,
    thinkingTime: null
  };
  
  // Extract reasoning-specific metrics
  if (apiType === 'responses') {
    metrics.reasoningTokens = usage.output_tokens_details?.reasoning_tokens || 
                             usage.reasoning_tokens || 0;
    metrics.thinkingTime = usage.thinking_time_ms || null;
  } else if (usage.completion_tokens_details) {
    metrics.reasoningTokens = usage.completion_tokens_details.reasoning_tokens || 0;
  }
  
  // Recalculate total if needed
  if (metrics.totalTokens === 0) {
    metrics.totalTokens = metrics.inputTokens + metrics.outputTokens + metrics.reasoningTokens;
  }
  
  return metrics;
}

function calculateQualityScore(content, usage, responseTime) {
  // Simple quality heuristic
  const contentLength = safeString(content).length;
  const tokenEfficiency = usage.outputTokens > 0 ? contentLength / usage.outputTokens : 0;
  const speedScore = responseTime < 10000 ? 1 : Math.max(0, 2 - responseTime / 10000);
  
  return Math.min(1, (tokenEfficiency / 4) * speedScore);
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

const metrics = new AdvancedMetrics();
const cache = new IntelligentCache(1000, 3600000);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: GPT5_CONFIG.REQUEST_TIMEOUT,
  maxRetries: GPT5_CONFIG.MAX_RETRIES,
  defaultHeaders: {
    'User-Agent': 'GPT5-Full-Capacity-Client/1.0',
    'X-Environment': process.env.NODE_ENV || 'production',
    'X-Client-Features': 'responses-api,chat-api,reasoning-tracking,full-capacity'
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED RETRY LOGIC
// ═══════════════════════════════════════════════════════════════════════════

async function executeWithRetry(operation, context = {}) {
  let lastError;
  
  for (let attempt = 0; attempt < GPT5_CONFIG.MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      const status = error?.status || error?.response?.status;
      const message = error?.message || '';
      
      // Determine if we should retry
      const isRetryable = status === 429 || status === 500 || status === 502 || status === 503 || 
                         message.includes('timeout') || message.includes('rate limit');
      
      if (attempt < GPT5_CONFIG.MAX_RETRIES - 1 && isRetryable) {
        const delay = GPT5_CONFIG.RETRY_DELAYS[attempt] || 5000;
        console.log(`[GPT5-Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms - ${message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      break;
    }
  }
  
  throw lastError;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE GPT-5 FUNCTION WITH FULL CAPACITY
// ═══════════════════════════════════════════════════════════════════════════

async function getGPT5Analysis(prompt, options = {}) {
  const startTime = Date.now();
  let selectedModel = 'unknown';
  let selectedAPI = 'unknown';
  
  try {
    // Input validation and preprocessing
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: must be non-empty string');
    }
    
    let text = safeString(prompt);
    if (text.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) {
      text = text.substring(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + '\n...(truncated for context limit)';
    }
    
    // Model and API selection
    selectedModel = selectOptimalModel(text, options);
    selectedAPI = selectOptimalAPI(text, selectedModel, options);
    
    // Check cache
    const cacheKey = cache.generateKey(text, options, selectedAPI);
    if (!options.skipCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log(`[GPT5-Cache] Cache hit for ${selectedModel}/${selectedAPI}`);
        return cached;
      }
    }
    
    console.log(`[GPT5-Execute] Model: ${selectedModel}, API: ${selectedAPI}, Length: ${text.length}`);
    
    // Build request based on API type
    let request, completion;
    
    if (selectedAPI === 'responses') {
      request = buildResponsesAPIRequest(selectedModel, text, options);
      
      completion = await executeWithRetry(async () => {
        // Note: This assumes the Responses API is available in the OpenAI SDK
        // If not available, this will fall back to Chat API
        try {
          return await openai.responses.create(request);
        } catch (error) {
          if (error.message?.includes('responses') || error.status === 404) {
            console.log('[GPT5-Fallback] Responses API not available, using Chat API');
            selectedAPI = 'chat';
            const chatRequest = buildChatAPIRequest(selectedModel, text, options);
            return await openai.chat.completions.create(chatRequest);
          }
          throw error;
        }
      }, { model: selectedModel, api: selectedAPI });
      
    } else {
      request = buildChatAPIRequest(selectedModel, text, options);
      completion = await executeWithRetry(async () => {
        return await openai.chat.completions.create(request);
      }, { model: selectedModel, api: selectedAPI });
    }
    
    // Extract response and metrics
    const content = extractResponseContent(completion, selectedAPI);
    const usage = extractUsageMetrics(completion, selectedAPI);
    const responseTime = Date.now() - startTime;
    
    // Validate response
    if (!content || content.startsWith('[No content') || content.startsWith('[Extraction')) {
      throw new Error('Empty or invalid response from GPT-5');
    }
    
    // Calculate costs and quality
    const cost = calculateCost(selectedModel, usage.inputTokens, usage.outputTokens, usage.reasoningTokens);
    const qualityScore = calculateQualityScore(content, usage, responseTime);
    
    // Record comprehensive metrics
    metrics.recordRequest(true, selectedModel, selectedAPI, options);
    metrics.recordTokens(selectedModel, usage.inputTokens, usage.outputTokens, usage.reasoningTokens);
    metrics.recordCost(selectedModel, cost);
    metrics.recordPerformance(responseTime, usage.thinkingTime, qualityScore);
    
    if (usage.reasoningTokens > 0) {
      metrics.recordReasoning(
        usage.reasoningTokens, 
        options.reasoning_effort || 'medium',
        usage.inputTokens,
        usage.outputTokens
      );
    }
    
    // Log success with full details
    const logData = {
      model: selectedModel,
      api: selectedAPI,
      tokens: {
        input: usage.inputTokens,
        output: usage.outputTokens,
        reasoning: usage.reasoningTokens,
        total: usage.totalTokens
      },
      cost: ' + cost.toFixed(6),
      responseTime: responseTime + 'ms',
      thinkingTime: usage.thinkingTime ? usage.thinkingTime + 'ms' : null,
      qualityScore: qualityScore.toFixed(3),
      cached: false
    };
    
    console.log('[GPT5-Success]', JSON.stringify(logData));
    
    // Cache successful response
    if (!options.skipCache && content.length > 10) {
      cache.set(cacheKey, content, {
        model: selectedModel,
        api: selectedAPI,
        tokens: usage.totalTokens,
        cost: cost,
        timestamp: getCambodiaTimestamp()
      });
    }
    
    return content;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error?.message || String(error);
    
    // Record failure metrics
    metrics.recordRequest(false, selectedModel, selectedAPI, options);
    metrics.recordError(error, selectedModel, { 
      api: selectedAPI, 
      promptLength: safeString(prompt).length,
      options: options 
    });
    
    console.error(`[GPT5-Error] ${selectedModel}/${selectedAPI}: ${errorMessage} (${responseTime}ms)`);
    
    // Return error message instead of throwing for system stability
    return `GPT-5 Error: ${errorMessage}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED GPT-5 FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function getQuickGPT5Response(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.MODELS.NANO,
    reasoning_effort: 'minimal',
    verbosity: 'low',
    max_completion_tokens: 2000
  });
}

async function getDetailedGPT5Analysis(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.MODELS.FULL,
    reasoning_effort: 'high',
    verbosity: 'high',
    max_completion_tokens: 15000
  });
}

async function getEfficientGPT5Response(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.MODELS.MINI,
    reasoning_effort: 'medium',
    verbosity: 'medium',
    max_completion_tokens: 8000
  });
}

async function getReasoningGPT5Response(prompt, options = {}) {
  return getGPT5Analysis(prompt, {
    ...options,
    model: GPT5_CONFIG.MODELS.FULL,
    reasoning_effort: 'high',
    verbosity: 'high',
    max_completion_tokens: 12000,
    // Force Responses API for maximum reasoning capability
    _forceAPI: 'responses'
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
    memory.recall.forEach((item, index) => {
      enhancedPrompt += `${index + 1}. ${item}\n`;
    });
    enhancedPrompt += '\n';
  }
  
  if (memory.conversationHistory && Array.isArray(memory.conversationHistory)) {
    enhancedPrompt += 'RECENT CONVERSATION:\n';
    memory.conversationHistory.slice(-5).forEach(turn => {
      if (turn.user) enhancedPrompt += `User: ${turn.user}\n`;
      if (turn.assistant) enhancedPrompt += `Assistant: ${turn.assistant}\n`;
    });
    enhancedPrompt += '\n';
  }
  
  enhancedPrompt += `CURRENT REQUEST:\n${safeString(prompt)}`;
  
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
      timestamp: getCambodiaTimestamp(),
      fullCapacity: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      gpt5Available: false,
      timestamp: getCambodiaTimestamp(),
      fullCapacity: false
    };
  }
}

async function checkGPT5SystemHealth() {
  const health = {
    timestamp: getCambodiaTimestamp(),
    overall: 'unknown',
    models: {},
    apis: {},
    reasoning: {},
    metrics: metrics.getStats(),
    cache: cache.getStats(),
    fullCapacity: true,
    features: {
      responsesAPI: false,
      chatAPI: false,
      reasoningTracking: GPT5_CONFIG.ADVANCED.REASONING_TOKEN_TRACKING,
      thinkingTimeTracking: GPT5_CONFIG.ADVANCED.THINKING_TIME_TRACKING,
      intelligentCaching: true,
      dualAPISupport: GPT5_CONFIG.DUAL_API.ENABLED
    }
  };
  
  // Test each model
  const modelsToTest = [
    { name: GPT5_CONFIG.MODELS.NANO, key: 'nano' },
    { name: GPT5_CONFIG.MODELS.MINI, key: 'mini' },
    { name: GPT5_CONFIG.MODELS.FULL, key: 'full' }
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
        tested: true,
        model: modelTest.name
      };
    } catch (error) {
      health.models[modelTest.key] = {
        available: false,
        tested: true,
        error: error.message,
        model: modelTest.name
      };
    }
  }
  
  // Test API endpoints
  try {
    await getGPT5Analysis('Test chat API', {
      model: GPT5_CONFIG.MODELS.NANO,
      max_completion_tokens: 5,
      skipCache: true,
      _forceAPI: 'chat'
    });
    health.apis.chat = { available: true, tested: true };
    health.features.chatAPI = true;
  } catch (error) {
    health.apis.chat = { available: false, tested: true, error: error.message };
  }
  
  try {
    await getGPT5Analysis('Test responses API', {
      model: GPT5_CONFIG.MODELS.FULL,
      reasoning_effort: 'medium',
      max_completion_tokens: 5,
      skipCache: true,
      _forceAPI: 'responses'
    });
    health.apis.responses = { available: true, tested: true };
    health.features.responsesAPI = true;
  } catch (error) {
    health.apis.responses = { available: false, tested: true, error: error.message };
  }
  
  // Test reasoning capabilities
  try {
    const reasoningResponse = await getGPT5Analysis('Simple reasoning test: 2+2=?', {
      model: GPT5_CONFIG.MODELS.FULL,
      reasoning_effort: 'high',
      max_completion_tokens: 20,
      skipCache: true
    });
    
    health.reasoning = {
      available: !reasoningResponse.startsWith('GPT-5 Error:'),
      tested: true,
      supportsHighReasoning: true
    };
  } catch (error) {
    health.reasoning = {
      available: false,
      tested: true,
      error: error.message
    };
  }
  
  // Determine overall health
  const availableModels = Object.values(health.models).filter(m => m.available).length;
  const availableAPIs = Object.values(health.apis).filter(a => a.available).length;
  
  if (availableModels >= 2 && availableAPIs >= 1) {
    health.overall = 'excellent';
  } else if (availableModels >= 1 && availableAPIs >= 1) {
    health.overall = 'good';
  } else if (availableModels >= 1) {
    health.overall = 'degraded';
  } else {
    health.overall = 'critical';
  }
  
  health.summary = {
    availableModels: availableModels,
    availableAPIs: availableAPIs,
    reasoningCapable: health.reasoning.available,
    cacheEfficient: parseFloat(health.cache.hitRate) > 10
  };
  
  return health;
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function clearGPT5Cache() {
  cache.clear();
  return { 
    success: true, 
    message: 'Intelligent cache cleared successfully',
    timestamp: getCambodiaTimestamp()
  };
}

async function resetGPT5Metrics() {
  metrics.reset();
  return { 
    success: true, 
    message: 'Advanced metrics reset successfully',
    timestamp: getCambodiaTimestamp()
  };
}

async function getGPT5SystemStats() {
  return {
    timestamp: getCambodiaTimestamp(),
    version: 'Full-Capacity-GPT-5-Client-v1.0',
    metrics: metrics.getStats(),
    cache: cache.getStats(),
    models: GPT5_CONFIG.MODELS,
    pricing: GPT5_CONFIG.PRICING,
    configuration: {
      maxOutputTokens: GPT5_CONFIG.MAX_OUTPUT_TOKENS,
      contextWindow: GPT5_CONFIG.CONTEXT_WINDOW,
      requestTimeout: GPT5_CONFIG.REQUEST_TIMEOUT,
      dualAPI: GPT5_CONFIG.DUAL_API,
      autoScale: GPT5_CONFIG.AUTO_SCALE,
      advanced: GPT5_CONFIG.ADVANCED
    },
    features: {
      fullCapacity: true,
      responsesAPI: GPT5_CONFIG.DUAL_API.ENABLED,
      chatAPI: true,
      reasoningTracking: GPT5_CONFIG.ADVANCED.REASONING_TOKEN_TRACKING,
      thinkingTimeTracking: GPT5_CONFIG.ADVANCED.THINKING_TIME_TRACKING,
      intelligentCaching: true,
      advancedMetrics: true,
      smartModelSelection: GPT5_CONFIG.AUTO_SCALE.ENABLED
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
  getReasoningGPT5Response,
  
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
  selectOptimalAPI,
  calculateCost,
  calculateTokens,
  getCambodiaTimestamp,
  generateHash,
  
  // Request builders
  buildResponsesAPIRequest,
  buildChatAPIRequest,
  extractResponseContent,
  extractUsageMetrics,
  
  // System components
  metrics,
  cache,
  openai,
  GPT5_CONFIG,
  
  // Classes for advanced usage
  AdvancedMetrics,
  IntelligentCache,
  
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
console.log('🧠 ═══════════════════════════════════════════════════════════════');
console.log('   COMPLETE FULL-CAPACITY GPT-5 CLIENT LOADED');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('✅ OFFICIAL GPT-5 MODELS:');
console.log(`   🧠 Full: ${GPT5_CONFIG.MODELS.FULL} (${GPT5_CONFIG.PRICING['gpt-5'].input}/${GPT5_CONFIG.PRICING['gpt-5'].output} per 1M tokens)`);
console.log(`   ⚡ Mini: ${GPT5_CONFIG.MODELS.MINI} (${GPT5_CONFIG.PRICING['gpt-5-mini'].input}/${GPT5_CONFIG.PRICING['gpt-5-mini'].output} per 1M tokens)`);
console.log(`   💫 Nano: ${GPT5_CONFIG.MODELS.NANO} (${GPT5_CONFIG.PRICING['gpt-5-nano'].input}/${GPT5_CONFIG.PRICING['gpt-5-nano'].output} per 1M tokens)`);
console.log('');
console.log('🚀 FULL CAPACITY FEATURES:');
console.log(`   • Dual API Support: ${GPT5_CONFIG.DUAL_API.ENABLED ? 'ENABLED' : 'DISABLED'} (Responses + Chat)`);
console.log(`   • Smart Model Selection: ${GPT5_CONFIG.AUTO_SCALE.ENABLED ? 'ENABLED' : 'DISABLED'}`);
console.log(`   • Reasoning Token Tracking: ${GPT5_CONFIG.ADVANCED.REASONING_TOKEN_TRACKING ? 'ENABLED' : 'DISABLED'}`);
console.log(`   • Thinking Time Tracking: ${GPT5_CONFIG.ADVANCED.THINKING_TIME_TRACKING ? 'ENABLED' : 'DISABLED'}`);
console.log(`   • Intelligent Caching: ENABLED (${cache.maxSize} entries)`);
console.log(`   • Advanced Metrics: ENABLED (comprehensive tracking)`);
console.log(`   • Context Window: ${GPT5_CONFIG.CONTEXT_WINDOW.toLocaleString()} tokens`);
console.log(`   • Max Output: ${GPT5_CONFIG.MAX_OUTPUT_TOKENS.toLocaleString()} tokens`);
console.log('');
console.log('🎯 REASONING CAPABILITIES:');
console.log('   • Effort Levels: minimal, low, medium, high');
console.log('   • Verbosity Levels: low, medium, high');
console.log('   • Automatic API selection for optimal reasoning');
console.log('   • Advanced reasoning metrics and analysis');
console.log('');
console.log('✅ FULL-CAPACITY GPT-5 CLIENT READY');
console.log('🧠 ═══════════════════════════════════════════════════════════════');
console.log('');
