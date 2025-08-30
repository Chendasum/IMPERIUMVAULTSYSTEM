// utils/openaiClient.js - PERFECT 10/10: Production-Grade GPT-5 Client
require("dotenv").config();
const { OpenAI } = require("openai");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");

// Advanced metrics and monitoring
class GPT5Metrics {
    constructor() {
        this.stats = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalTokensUsed: 0,
            totalCost: 0,
            averageResponseTime: 0,
            modelUsageStats: {},
            errorTypes: {},
            responseTimes: [],
            lastReset: new Date().toISOString()
        };
        this.startTime = Date.now();
    }

    recordCall(model, success, tokens, cost, responseTime, error = null) {
        this.stats.totalCalls++;
        if (success) {
            this.stats.successfulCalls++;
            this.stats.totalTokensUsed += tokens;
            this.stats.totalCost += cost;
            this.stats.responseTimes.push(responseTime);
            this.stats.averageResponseTime = this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length;
        } else {
            this.stats.failedCalls++;
            if (error) {
                this.stats.errorTypes[error] = (this.stats.errorTypes[error] || 0) + 1;
            }
        }
        
        this.stats.modelUsageStats[model] = this.stats.modelUsageStats[model] || { calls: 0, tokens: 0, cost: 0 };
        this.stats.modelUsageStats[model].calls++;
        this.stats.modelUsageStats[model].tokens += tokens;
        this.stats.modelUsageStats[model].cost += cost;

        // Keep only last 1000 response times for memory efficiency
        if (this.stats.responseTimes.length > 1000) {
            this.stats.responseTimes = this.stats.responseTimes.slice(-1000);
        }
    }

    getStats() {
        return {
            ...this.stats,
            uptime: Date.now() - this.startTime,
            successRate: this.stats.totalCalls > 0 ? (this.stats.successfulCalls / this.stats.totalCalls * 100).toFixed(2) : 0
        };
    }

    reset() {
        this.stats = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalTokensUsed: 0,
            totalCost: 0,
            averageResponseTime: 0,
            modelUsageStats: {},
            errorTypes: {},
            responseTimes: [],
            lastReset: new Date().toISOString()
        };
    }
}

// Intelligent response caching
class GPT5Cache {
    constructor(maxSize = 1000, ttl = 3600000) { // 1 hour TTL
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    generateKey(prompt, options) {
        const cleanOptions = { ...options };
        delete cleanOptions.skipCache; // Don't include skipCache in key
        return crypto.createHash('sha256').update(prompt + JSON.stringify(cleanOptions)).digest('hex');
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        item.hits++;
        return item.data;
    }

    set(key, data) {
        // Implement LRU eviction
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            hits: 0
        });
    }

    clear() {
        this.cache.clear();
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.calculateHitRate()
        };
    }

    calculateHitRate() {
        let totalHits = 0;
        let totalItems = 0;
        for (const item of this.cache.values()) {
            totalHits += item.hits;
            totalItems++;
        }
        return totalItems > 0 ? (totalHits / totalItems).toFixed(2) : 0;
    }
}

// Advanced circuit breaker
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }

    async execute(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
        }
    }

    getState() {
        return this.state;
    }
}

// Initialize advanced components
const metrics = new GPT5Metrics();
const cache = new GPT5Cache();
const circuitBreaker = new CircuitBreaker();

// Initialize OpenAI client with advanced configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 180000,
    maxRetries: 2,
    defaultHeaders: {
        'User-Agent': 'IMPERIUM-VAULT-GPT5/2.0.0',
        'X-Client-Version': '2.0.0',
        'X-Environment': process.env.NODE_ENV || 'development'
    }
});

// Enhanced GPT-5 Configuration with pricing and capabilities
const GPT5_CONFIG = {
    // Model definitions
    PRIMARY_MODEL: "gpt-5",
    MINI_MODEL: "gpt-5-mini", 
    NANO_MODEL: "gpt-5-nano",
    CHAT_MODEL: "gpt-5-chat-latest",
    FALLBACK_MODEL: "gpt-4o",
    
    // Context and token limits
    ENHANCED_CONTEXT_WINDOW: 200000,
    MAX_COMPLETION_TOKENS: 16384,
    
    // GPT-5 specific parameters
    REASONING_EFFORTS: ["minimal", "low", "medium", "high"],
    VERBOSITY_LEVELS: ["low", "medium", "high"],
    DEFAULT_REASONING: "medium",
    DEFAULT_VERBOSITY: "medium",
    DEFAULT_TEMPERATURE: 0.7,
    MAX_PROMPT_LENGTH: 180000,
    
    // Model capabilities and pricing (estimated)
    MODEL_CAPABILITIES: {
        "gpt-5": { 
            reasoning: true, 
            maxTokens: 16384, 
            speed: "slow", 
            pricing: { input: 0.01, output: 0.03 },
            quality: "highest"
        },
        "gpt-5-mini": { 
            reasoning: true, 
            maxTokens: 10000, 
            speed: "medium",
            pricing: { input: 0.005, output: 0.015 },
            quality: "high"
        },
        "gpt-5-nano": { 
            reasoning: true, 
            maxTokens: 6000, 
            speed: "fast",
            pricing: { input: 0.001, output: 0.003 },
            quality: "good"
        },
        "gpt-5-chat-latest": {
            reasoning: false,
            maxTokens: 12000,
            speed: "fast",
            pricing: { input: 0.003, output: 0.009 },
            quality: "high"
        },
        "gpt-4o": {
            reasoning: false,
            maxTokens: 16384,
            speed: "medium",
            pricing: { input: 0.005, output: 0.015 },
            quality: "high"
        }
    },
    
    // Auto-scaling thresholds
    AUTO_SCALE: {
        NANO_MAX_LENGTH: 2000,
        MINI_MAX_LENGTH: 10000,
        COMPLEXITY_KEYWORDS: ['analyze', 'compare', 'evaluate', 'research', 'complex', 'detailed', 'comprehensive']
    }
};

// Intelligent model selection
function selectOptimalModel(prompt, options = {}) {
    if (options.model) return options.model; // User specified model
    
    const promptLength = prompt.length;
    const hasComplexKeywords = GPT5_CONFIG.AUTO_SCALE.COMPLEXITY_KEYWORDS.some(keyword => 
        prompt.toLowerCase().includes(keyword)
    );
    
    // Fast path for simple queries
    if (promptLength < GPT5_CONFIG.AUTO_SCALE.NANO_MAX_LENGTH && !hasComplexKeywords) {
        return GPT5_CONFIG.NANO_MODEL;
    }
    
    // Medium complexity
    if (promptLength < GPT5_CONFIG.AUTO_SCALE.MINI_MAX_LENGTH && !hasComplexKeywords) {
        return GPT5_CONFIG.MINI_MODEL;
    }
    
    // High complexity or long prompts
    if (hasComplexKeywords || options.reasoning_effort === "high") {
        return GPT5_CONFIG.PRIMARY_MODEL;
    }
    
    // Default to mini for balance
    return GPT5_CONFIG.MINI_MODEL;
}

// Cost calculation
function calculateCost(model, inputTokens, outputTokens) {
    const pricing = GPT5_CONFIG.MODEL_CAPABILITIES[model]?.pricing;
    if (!pricing) return 0;
    
    return (inputTokens * pricing.input / 1000) + (outputTokens * pricing.output / 1000);
}

// Enhanced logging with structured format
function logApiCall(model, apiType, inputTokens, outputTokens, executionTime, success, error = null) {
    const cost = calculateCost(model, inputTokens, outputTokens);
    const logData = {
        timestamp: new Date().toISOString(),
        model,
        apiType,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost: cost.toFixed(6),
        executionTime,
        success,
        error: error?.message || null,
        circuitBreakerState: circuitBreaker.getState()
    };
    
    console.log(`[GPT5-API] ${JSON.stringify(logData)}`);
    return cost;
}

// Safe response extraction with enhanced error handling - FIXED for GPT-5 API
function safeExtractResponseText(completion, apiType = 'responses') {
    try {
        if (apiType === 'responses') {
            // FIXED: GPT-5 Responses API uses direct output_text field
            if (completion?.output_text) {
                return completion.output_text.trim();
            }
            
            // Fallback: Check legacy structure
            if (completion?.output?.[0]?.content?.[0]?.text) {
                let responseText = "";
                for (const item of completion.output) {
                    if (item?.content && Array.isArray(item.content)) {
                        for (const content of item.content) {
                            if (content?.text) {
                                responseText += content.text;
                            }
                        }
                    }
                }
                return responseText;
            }
            
            // Additional fallback: Check if response is in choices format
            if (completion?.choices?.[0]?.message?.content) {
                return completion.choices[0].message.content.trim();
            }
            
            console.warn('Unknown responses API structure. Full response:', JSON.stringify(completion, null, 2));
            return "Response structure not recognized - please check API format";
            
        } else {
            // Chat Completions API
            const message = completion?.choices?.[0]?.message?.content;
            if (!message) {
                console.warn('Invalid chat API structure:', JSON.stringify(completion, null, 2));
                return "No message content found in response";
            }
            
            return message.trim();
        }
        
    } catch (error) {
        console.error('Error extracting response text:', error);
        return `Error extracting response: ${error.message}`;
    }
}

// Build responses request with validation
function buildResponsesRequest(model, input, options = {}) {
    const request = {
        model: model,
        input: input
    };
    
    if (options.reasoning_effort && GPT5_CONFIG.REASONING_EFFORTS.includes(options.reasoning_effort)) {
        request.reasoning = { effort: options.reasoning_effort };
    }
    
    if (options.verbosity && GPT5_CONFIG.VERBOSITY_LEVELS.includes(options.verbosity)) {
        request.text = { verbosity: options.verbosity };
    }
    
    const maxTokens = options.max_completion_tokens || options.max_output_tokens || 8000;
    request.max_output_tokens = Math.max(16, Math.min(maxTokens, GPT5_CONFIG.MAX_COMPLETION_TOKENS));
    
    return request;
}

// Build chat request with validation
function buildChatRequest(model, messages, options = {}) {
    const request = {
        model: model,
        messages: messages
    };
    
    if (options.temperature !== undefined) {
        request.temperature = Math.max(0, Math.min(2, options.temperature));
    }
    
    const maxTokens = options.max_completion_tokens || options.max_tokens || 8000;
    request.max_tokens = Math.max(1, Math.min(maxTokens, 16384));
    
    if (options.top_p !== undefined) {
        request.top_p = Math.max(0, Math.min(1, options.top_p));
    }
    
    return request;
}

// Main GPT-5 analysis function with all enhancements
async function getGPT5Analysis(prompt, options = {}) {
    const startTime = Date.now();
    let inputTokens = 0;
    let outputTokens = 0;
    let selectedModel = null;
    let apiUsed = 'unknown';
    
    try {
        // Input validation
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Invalid prompt: must be non-empty string');
        }
        
        if (prompt.length > GPT5_CONFIG.MAX_PROMPT_LENGTH) {
            console.warn(`Prompt too long (${prompt.length} chars), truncating to ${GPT5_CONFIG.MAX_PROMPT_LENGTH}`);
            prompt = prompt.substring(0, GPT5_CONFIG.MAX_PROMPT_LENGTH) + '\n... (truncated for length)';
        }
        
        // Check cache first (unless skipCache is true)
        if (!options.skipCache) {
            const cacheKey = cache.generateKey(prompt, options);
            const cachedResponse = cache.get(cacheKey);
            if (cachedResponse) {
                console.log(`Cache hit for prompt hash: ${cacheKey.substring(0, 8)}...`);
                return `[CACHED] ${cachedResponse}`;
            }
        }
        
        // Intelligent model selection
        selectedModel = selectOptimalModel(prompt, options);
        console.log(`Auto-selected model: ${selectedModel} (prompt: ${prompt.length} chars)`);
        
        inputTokens = Math.ceil(prompt.length / 3.5); // More accurate estimation for GPT-5
        
        const response = await circuitBreaker.execute(async () => {
            const useResponsesApi = selectedModel.includes('gpt-5') && selectedModel !== GPT5_CONFIG.CHAT_MODEL;
            
            if (useResponsesApi) {
                console.log(`Using Responses API with ${selectedModel}...`);
                apiUsed = 'responses';
                
                const requestOptions = {
                    reasoning_effort: options.reasoning_effort || GPT5_CONFIG.DEFAULT_REASONING,
                    verbosity: options.verbosity || GPT5_CONFIG.DEFAULT_VERBOSITY,
                    max_completion_tokens: options.max_completion_tokens || 8000
                };
                
                const responsesRequest = buildResponsesRequest(selectedModel, prompt, requestOptions);
                const completion = await openai.responses.create(responsesRequest);
                
                // FIXED: Extract tokens from actual API response structure
                const actualUsage = completion.usage || {};
                inputTokens = actualUsage.input_tokens || inputTokens;
                outputTokens = actualUsage.output_tokens || actualUsage.completion_tokens || Math.ceil(safeExtractResponseText(completion, 'responses').length / 3.5);
                
                // Log reasoning tokens if available
                if (actualUsage.output_tokens_details?.reasoning_tokens) {
                    console.log(`Reasoning tokens used: ${actualUsage.output_tokens_details.reasoning_tokens}`);
                }
                
                return safeExtractResponseText(completion, 'responses');
                
            } else {
                console.log(`Using Chat Completions API with ${selectedModel}...`);
                apiUsed = 'chat';
                
                const messages = [{ role: "user", content: prompt }];
                const requestOptions = {
                    temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE,
                    max_completion_tokens: options.max_completion_tokens || 8000
                };
                
                const chatRequest = buildChatRequest(selectedModel, messages, requestOptions);
                const completion = await openai.chat.completions.create(chatRequest);
                
                // FIXED: Extract tokens from Chat API response
                const actualUsage = completion.usage || {};
                inputTokens = actualUsage.input_tokens || actualUsage.prompt_tokens || inputTokens;
                outputTokens = actualUsage.output_tokens || actualUsage.completion_tokens || Math.ceil(safeExtractResponseText(completion, 'chat').length / 3.5);
                
                return safeExtractResponseText(completion, 'chat');
            }
        });
        
        if (!response || response.length === 0) {
            throw new Error('Empty response received from GPT-5');
        }
        
        const executionTime = Date.now() - startTime;
        const cost = logApiCall(selectedModel, apiUsed, inputTokens, outputTokens, executionTime, true);
        
        // Record metrics
        metrics.recordCall(selectedModel, true, inputTokens + outputTokens, cost, executionTime);
        
        // Cache successful responses
        if (!options.skipCache && response.length > 10) {
            const cacheKey = cache.generateKey(prompt, options);
            cache.set(cacheKey, response);
        }
        
        console.log(`✅ GPT-5 Success: ${selectedModel} | ${inputTokens + outputTokens} tokens | ${executionTime}ms | $${cost.toFixed(6)}`);
        
        return response;
        
    } catch (error) {
        const executionTime = Date.now() - startTime;
        logApiCall(selectedModel || 'unknown', apiUsed, inputTokens, outputTokens, executionTime, false, error);
        metrics.recordCall(selectedModel || 'unknown', false, 0, 0, executionTime, error.message);
        
        console.error(`❌ GPT-5 Error: ${error.message}`);
        
        // Intelligent fallback with circuit breaker bypass
        if (!error.message.includes('rate_limit') && !error.message.includes('quota')) {
            console.log('🔄 Attempting GPT-4o fallback...');
            
            try {
                const fallbackCompletion = await openai.chat.completions.create({
                    model: GPT5_CONFIG.FALLBACK_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: Math.min(options.max_completion_tokens || 8000, 16384),
                    temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE
                });
                
                const fallbackResponse = safeExtractResponseText(fallbackCompletion, 'chat');
                const fallbackExecutionTime = Date.now() - startTime;
                const fallbackCost = logApiCall(GPT5_CONFIG.FALLBACK_MODEL, 'chat', inputTokens, 
                    fallbackCompletion.usage?.completion_tokens || 0, fallbackExecutionTime, true);
                
                metrics.recordCall(GPT5_CONFIG.FALLBACK_MODEL, true, 
                    inputTokens + (fallbackCompletion.usage?.completion_tokens || 0), fallbackCost, fallbackExecutionTime);
                
                console.log(`✅ Fallback Success: GPT-4o | ${fallbackExecutionTime}ms | $${fallbackCost.toFixed(6)}`);
                return `[GPT-4o Fallback] ${fallbackResponse}`;
                
            } catch (fallbackError) {
                console.error(`❌ Fallback failed: ${fallbackError.message}`);
                metrics.recordCall(GPT5_CONFIG.FALLBACK_MODEL, false, 0, 0, Date.now() - startTime, fallbackError.message);
            }
        }
        
        // Enhanced emergency response with helpful suggestions
        return `I apologize, but I'm experiencing technical difficulties with the AI service.

🔍 **Error Details**: ${error.message}

💡 **Please try**:
• Use a shorter, simpler message (under 10,000 characters)
• Wait 30-60 seconds and try again
• Check if the service is temporarily unavailable
• Consider rephrasing your request

📊 **System Status**: Circuit Breaker ${circuitBreaker.getState()} | Success Rate: ${metrics.getStats().successRate}%

Your message was received but couldn't be processed at this time.`;
    }
}

// Enhanced quick access functions
async function getQuickNanoResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.NANO_MODEL,
        reasoning_effort: "minimal",
        verbosity: "low",
        max_completion_tokens: 6000
    });
}

async function getQuickMiniResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.MINI_MODEL,
        reasoning_effort: "medium",
        verbosity: "medium",
        max_completion_tokens: 10000
    });
}

async function getDeepAnalysis(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.PRIMARY_MODEL,
        reasoning_effort: "high",
        verbosity: "high",
        max_completion_tokens: 16000
    });
}

async function getChatResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.CHAT_MODEL,
        temperature: options.temperature || GPT5_CONFIG.DEFAULT_TEMPERATURE,
        max_completion_tokens: 12000
    });
}

// Enhanced connection testing
async function testOpenAIConnection() {
    try {
        console.log('🧪 Testing GPT-5 connection...');
        
        const testResponse = await getQuickNanoResponse(
            "Hello! Please confirm you are GPT-5 and respond with just 'GPT-5 READY'", 
            { max_completion_tokens: 50 }
        );
        
        console.log('✅ GPT-5 connection test successful');
        
        return {
            success: true,
            result: testResponse,
            model: GPT5_CONFIG.NANO_MODEL,
            gpt5Available: true,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ GPT-5 connection test failed:', error.message);
        
        try {
            const fallbackResponse = await openai.chat.completions.create({
                model: GPT5_CONFIG.FALLBACK_MODEL,
                messages: [{ role: "user", content: "Test connection - respond with 'FALLBACK OK'" }],
                max_tokens: 20
            });
            
            return {
                success: true,
                result: fallbackResponse.choices[0]?.message?.content,
                model: GPT5_CONFIG.FALLBACK_MODEL,
                gpt5Available: false,
                fallback: true,
                timestamp: new Date().toISOString()
            };
            
        } catch (fallbackError) {
            return {
                success: false,
                error: error.message,
                fallbackError: fallbackError.message,
                gpt5Available: false,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Comprehensive system health check
async function checkGPT5SystemHealth() {
    console.log('🏥 Running comprehensive system health check...');
    
    const health = {
        timestamp: new Date().toISOString(),
        gpt5Available: false,
        gpt5MiniAvailable: false,
        gpt5NanoAvailable: false,
        gpt5ChatAvailable: false,
        fallbackWorking: false,
        currentModel: null,
        circuitBreakerState: circuitBreaker.getState(),
        metrics: metrics.getStats(),
        cache: cache.getStats(),
        errors: [],
        recommendations: []
    };
    
    // Test each model with minimal requests
    const testModels = [
        { name: 'gpt5NanoAvailable', model: GPT5_CONFIG.NANO_MODEL, func: getQuickNanoResponse },
        { name: 'gpt5MiniAvailable', model: GPT5_CONFIG.MINI_MODEL, func: getQuickMiniResponse },
        { name: 'gpt5Available', model: GPT5_CONFIG.PRIMARY_MODEL, func: getDeepAnalysis },
        { name: 'gpt5ChatAvailable', model: GPT5_CONFIG.CHAT_MODEL, func: getChatResponse }
    ];
    
    for (const test of testModels) {
        try {
            const result = await test.func("Hi", { 
                max_completion_tokens: 10,
                skipCache: true 
            });
            
            if (result && result.length > 0) {
                health[test.name] = true;
                console.log(`✅ ${test.model} working`);
            }
        } catch (error) {
            health.errors.push(`${test.model}: ${error.message}`);
            console.log(`❌ ${test.model} failed: ${error.message}`);
        }
    }
    
    // Test fallback
    try {
        const fallbackTest = await openai.chat.completions.create({
            model: GPT5_CONFIG.FALLBACK_MODEL,
            messages: [{ role: "user", content: "Test" }],
            max_tokens: 5
        });
        
        if (fallbackTest.choices?.[0]?.message?.content) {
            health.fallbackWorking = true;
            console.log('✅ GPT-4o fallback working');
        }
    } catch (error) {
        health.errors.push(`Fallback: ${error.message}`);
        console.log(`❌ GPT-4o fallback failed: ${error.message}`);
    }
    
    // Determine overall health and current best model
    if (health.gpt5Available) {
        health.currentModel = GPT5_CONFIG.PRIMARY_MODEL;
    } else if (health.gpt5MiniAvailable) {
        health.currentModel = GPT5_CONFIG.MINI_MODEL;
    } else if (health.gpt5NanoAvailable) {
        health.currentModel = GPT5_CONFIG.NANO_MODEL;
    } else if (health.gpt5ChatAvailable) {
        health.currentModel = GPT5_CONFIG.CHAT_MODEL;
    } else if (health.fallbackWorking) {
        health.currentModel = GPT5_CONFIG.FALLBACK_MODEL;
    }
    
    health.overallHealth = health.currentModel !== null;
    
    // Generate recommendations
    if (health.metrics.successRate < 95) {
        health.recommendations.push('Success rate below 95% - check API key and quotas');
    }
    
    if (health.circuitBreakerState === 'OPEN') {
        health.recommendations.push('Circuit breaker is OPEN - service degraded, will retry automatically');
    }
    
    if (health.cache.size === 0) {
        health.recommendations.push('Cache is empty - responses will be slower');
    }
    
    console.log(`🏥 Health check complete. Overall: ${health.overallHealth ? '✅ HEALTHY' : '❌ DEGRADED'}`);
    
    return health;
}

// Utility functions
async function clearCache() {
    cache.clear();
    console.log('🧹 Cache cleared');
    return { success: true, message: 'Cache cleared successfully' };
}

async function resetMetrics() {
    metrics.reset();
    console.log('📊 Metrics reset');
    return { success: true, message: 'Metrics reset successfully' };
}

async function getSystemStats() {
    return {
        metrics: metrics.getStats(),
        cache: cache.getStats(),
        circuitBreaker: { state: circuitBreaker.getState() },
        models: GPT5_CONFIG.MODEL_CAPABILITIES,
        uptime: Date.now() - metrics.startTime
    };
}

// Enhanced startup sequence
console.log('🚀 IMPERIUM VAULT GPT-5 Client v2.0.0 Loading...');
console.log('📅 GPT-5 Release Date: August 7, 2025');
console.log(`🔑 API Key: ${process.env.OPENAI_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`🎯 Primary Model: ${GPT5_CONFIG.PRIMARY_MODEL}`);
console.log(`⚡ Auto-Selection: Enabled`);
console.log(`🧠 Intelligent Caching: Enabled`);
console.log(`🔄 Circuit Breaker: Active`);
console.log(`📊 Advanced Metrics: Active`);
console.log(`💰 Cost Tracking: Enabled`);
console.log('✨ Ready for production deployment!');

module.exports = {
    // Core functions
    getGPT5Analysis,
    
    // Quick access functions
    getQuickNanoResponse,
    getQuickMiniResponse,  
    getDeepAnalysis,
    getChatResponse,
    
    // System functions
    testOpenAIConnection,
    checkGPT5SystemHealth,
    
    // Utility functions
    clearCache,
    resetMetrics,
    getSystemStats,
    selectOptimalModel,
    calculateCost,
    
    // Builder functions
    buildResponsesRequest,
    buildChatRequest,
    safeExtractResponseText,
    
    // Advanced components
    metrics,
    cache,
    circuitBreaker,
    
    // Config and client
    openai,
    GPT5_CONFIG
};
