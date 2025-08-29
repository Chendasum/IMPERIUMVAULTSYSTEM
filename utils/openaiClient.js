// utils/openaiClient.js - Complete GPT-5 Client Rewrite
require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize OpenAI client with GPT-5 optimized settings
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 300000, // 5 minutes for complex reasoning tasks
    maxRetries: 2,
    defaultHeaders: {
        'User-Agent': 'GPT5-Client/2.0.0'
    }
});

// GPT-5 Configuration (Based on August 7, 2025 release)
const GPT5_CONFIG = {
    // Model variants
    MODELS: {
        FULL: "gpt-5",
        MINI: "gpt-5-mini", 
        NANO: "gpt-5-nano",
        CHAT: "gpt-5-chat-latest"
    },
    
    // Fallback model
    FALLBACK: "gpt-4o",
    
    // Token limits (based on official specs)
    LIMITS: {
        INPUT_TOKENS: 272000,
        OUTPUT_TOKENS: 128000,
        DEFAULT_OUTPUT: 8000,
        MIN_OUTPUT: 1,
        MAX_SAFE_INPUT: 250000 // Leave room for system messages
    },
    
    // GPT-5 specific parameters
    REASONING: {
        MINIMAL: "minimal",
        LOW: "low", 
        MEDIUM: "medium",
        HIGH: "high",
        DEFAULT: "medium"
    },
    
    VERBOSITY: {
        LOW: "low",
        MEDIUM: "medium", 
        HIGH: "high",
        DEFAULT: "medium"
    },
    
    // Temperature ranges
    TEMPERATURE: {
        MIN: 0,
        MAX: 2,
        DEFAULT: 0.7
    }
};

// Global state
let connectionStatus = {
    gpt5Available: null,
    lastChecked: null,
    errors: []
};

console.log("🚀 GPT-5 Client Initialized");
console.log(`📊 API Key: ${process.env.OPENAI_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`🎯 Models: ${Object.values(GPT5_CONFIG.MODELS).join(", ")}`);
console.log(`💾 Input Limit: ${GPT5_CONFIG.LIMITS.INPUT_TOKENS.toLocaleString()} tokens`);
console.log(`📤 Output Limit: ${GPT5_CONFIG.LIMITS.OUTPUT_TOKENS.toLocaleString()} tokens`);

/**
 * Validate and sanitize input parameters
 */
function validateParams(options = {}) {
    const validated = {};
    
    // Validate reasoning effort
    if (options.reasoning_effort) {
        const reasoning = options.reasoning_effort.toLowerCase();
        if (Object.values(GPT5_CONFIG.REASONING).includes(reasoning)) {
            validated.reasoning_effort = reasoning;
        } else {
            console.warn(`Invalid reasoning_effort: ${options.reasoning_effort}, using default`);
            validated.reasoning_effort = GPT5_CONFIG.REASONING.DEFAULT;
        }
    }
    
    // Validate verbosity
    if (options.verbosity) {
        const verbosity = options.verbosity.toLowerCase();
        if (Object.values(GPT5_CONFIG.VERBOSITY).includes(verbosity)) {
            validated.verbosity = verbosity;
        } else {
            console.warn(`Invalid verbosity: ${options.verbosity}, using default`);
            validated.verbosity = GPT5_CONFIG.VERBOSITY.DEFAULT;
        }
    }
    
    // Validate temperature
    if (options.temperature !== undefined) {
        const temp = parseFloat(options.temperature);
        if (!isNaN(temp)) {
            validated.temperature = Math.max(
                GPT5_CONFIG.TEMPERATURE.MIN,
                Math.min(GPT5_CONFIG.TEMPERATURE.MAX, temp)
            );
        }
    }
    
    // Validate max_completion_tokens
    if (options.max_completion_tokens) {
        const tokens = parseInt(options.max_completion_tokens);
        if (!isNaN(tokens) && tokens > 0) {
            validated.max_completion_tokens = Math.min(tokens, GPT5_CONFIG.LIMITS.OUTPUT_TOKENS);
        }
    }
    
    return validated;
}

/**
 * Sanitize and validate input prompt
 */
function sanitizePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
    }
    
    const trimmed = prompt.trim();
    if (trimmed.length === 0) {
        throw new Error('Prompt cannot be empty');
    }
    
    // Truncate if too long
    if (trimmed.length > GPT5_CONFIG.LIMITS.MAX_SAFE_INPUT) {
        console.warn(`Prompt truncated from ${trimmed.length} to ${GPT5_CONFIG.LIMITS.MAX_SAFE_INPUT} characters`);
        return trimmed.substring(0, GPT5_CONFIG.LIMITS.MAX_SAFE_INPUT) + "\n\n[... truncated for length ...]";
    }
    
    return trimmed;
}

/**
 * Extract response text safely from completion
 */
function extractResponse(completion) {
    try {
        // Standard chat completion response
        if (completion?.choices?.[0]?.message?.content) {
            return completion.choices[0].message.content.trim();
        }
        
        // Alternative response structures
        if (completion?.output?.[0]?.content?.[0]?.text) {
            return completion.output[0].content[0].text.trim();
        }
        
        // Fallback extraction attempts
        if (completion?.data?.choices?.[0]?.message?.content) {
            return completion.data.choices[0].message.content.trim();
        }
        
        console.warn('Unexpected response structure:', JSON.stringify(completion, null, 2));
        return "Response received but content structure unrecognized";
        
    } catch (error) {
        console.error('Error extracting response:', error.message);
        return `Error extracting response: ${error.message}`;
    }
}

/**
 * Build request for GPT-5 models with reasoning
 */
function buildGPT5Request(model, prompt, options = {}) {
    const validated = validateParams(options);
    
    const request = {
        model: model,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: validated.max_completion_tokens || GPT5_CONFIG.LIMITS.DEFAULT_OUTPUT,
        temperature: validated.temperature ?? GPT5_CONFIG.TEMPERATURE.DEFAULT
    };
    
    // Add GPT-5 specific parameters if model supports them
    if (model.startsWith('gpt-5') && model !== GPT5_CONFIG.MODELS.CHAT) {
        if (validated.reasoning_effort) {
            request.reasoning_effort = validated.reasoning_effort;
        }
        
        if (validated.verbosity) {
            request.verbosity = validated.verbosity;
        }
    }
    
    return request;
}

/**
 * Execute API call with retry logic and exponential backoff
 */
async function executeWithRetry(apiCall, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await apiCall();
            
            if (attempt > 1) {
                console.log(`✅ API call succeeded on attempt ${attempt}`);
            }
            
            return result;
            
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ API call failed (attempt ${attempt}/${maxRetries}):`, error.message);
            
            // Don't retry on certain errors
            if (error.status === 401 || error.status === 403) {
                throw error; // Auth errors
            }
            
            if (error.status === 400 && !error.message.includes('rate')) {
                throw error; // Bad request (non-rate limit)
            }
            
            // Calculate backoff delay
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30s
                console.log(`⏳ Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

/**
 * Main GPT-5 completion function
 */
async function getGPT5Completion(prompt, options = {}) {
    const startTime = Date.now();
    
    try {
        // Validate inputs
        const sanitizedPrompt = sanitizePrompt(prompt);
        const selectedModel = options.model || GPT5_CONFIG.MODELS.MINI;
        
        console.log(`🤖 Starting GPT-5 completion...`);
        console.log(`📝 Model: ${selectedModel}`);
        console.log(`📊 Prompt: ${sanitizedPrompt.length} chars`);
        console.log(`⚙️ Options:`, options);
        
        // Build request
        const request = buildGPT5Request(selectedModel, sanitizedPrompt, options);
        
        console.log(`🔧 Request built:`, {
            model: request.model,
            max_tokens: request.max_tokens,
            temperature: request.temperature,
            reasoning_effort: request.reasoning_effort,
            verbosity: request.verbosity
        });
        
        // Execute API call with retry
        const completion = await executeWithRetry(async () => {
            return await openai.chat.completions.create(request);
        });
        
        // Extract response
        const response = extractResponse(completion);
        
        if (!response || response.length === 0) {
            throw new Error('Empty response received from API');
        }
        
        // Log success metrics
        const executionTime = Date.now() - startTime;
        const tokensUsed = completion.usage?.total_tokens || 0;
        const reasoningTokens = completion.usage?.reasoning_tokens || 0;
        
        console.log(`✅ GPT-5 completion successful!`);
        console.log(`⏱️ Time: ${executionTime}ms`);
        console.log(`🎯 Tokens: ${tokensUsed} total ${reasoningTokens ? `(${reasoningTokens} reasoning)` : ''}`);
        console.log(`📄 Response: ${response.length} chars`);
        
        return {
            content: response,
            model: selectedModel,
            tokensUsed,
            reasoningTokens,
            executionTime,
            success: true
        };
        
    } catch (error) {
        const executionTime = Date.now() - startTime;
        
        console.error(`❌ GPT-5 completion failed:`, error.message);
        console.log(`⏱️ Failed after: ${executionTime}ms`);
        
        // Update connection status
        connectionStatus.errors.push({
            timestamp: new Date().toISOString(),
            error: error.message,
            model: options.model
        });
        
        throw error;
    }
}

/**
 * GPT-5 with fallback to GPT-4o
 */
async function getGPT5WithFallback(prompt, options = {}) {
    try {
        // Try GPT-5 first
        return await getGPT5Completion(prompt, options);
        
    } catch (error) {
        console.warn(`🔄 GPT-5 failed, attempting GPT-4o fallback...`);
        console.warn(`Original error: ${error.message}`);
        
        try {
            const fallbackOptions = {
                ...options,
                model: GPT5_CONFIG.FALLBACK,
                // Remove GPT-5 specific parameters
                reasoning_effort: undefined,
                verbosity: undefined
            };
            
            const result = await getGPT5Completion(prompt, fallbackOptions);
            
            return {
                ...result,
                content: `[GPT-4o Fallback] ${result.content}`,
                fallback: true,
                originalError: error.message
            };
            
        } catch (fallbackError) {
            console.error(`❌ Both GPT-5 and fallback failed`);
            
            throw new Error(`GPT-5 failed: ${error.message}. Fallback failed: ${fallbackError.message}`);
        }
    }
}

/**
 * Quick response functions for different use cases
 */

// Fast nano response for simple queries
async function quickResponse(prompt, options = {}) {
    return await getGPT5WithFallback(prompt, {
        model: GPT5_CONFIG.MODELS.NANO,
        reasoning_effort: GPT5_CONFIG.REASONING.MINIMAL,
        verbosity: GPT5_CONFIG.VERBOSITY.LOW,
        max_completion_tokens: 4000,
        temperature: 0.3,
        ...options
    });
}

// Balanced mini response for general use
async function standardResponse(prompt, options = {}) {
    return await getGPT5WithFallback(prompt, {
        model: GPT5_CONFIG.MODELS.MINI,
        reasoning_effort: GPT5_CONFIG.REASONING.MEDIUM,
        verbosity: GPT5_CONFIG.VERBOSITY.MEDIUM,
        max_completion_tokens: 8000,
        temperature: 0.7,
        ...options
    });
}

// Deep analysis with full GPT-5 model
async function deepAnalysis(prompt, options = {}) {
    return await getGPT5WithFallback(prompt, {
        model: GPT5_CONFIG.MODELS.FULL,
        reasoning_effort: GPT5_CONFIG.REASONING.HIGH,
        verbosity: GPT5_CONFIG.VERBOSITY.HIGH,
        max_completion_tokens: 16000,
        temperature: 0.8,
        ...options
    });
}

// Conversational chat response
async function chatResponse(prompt, options = {}) {
    return await getGPT5WithFallback(prompt, {
        model: GPT5_CONFIG.MODELS.CHAT,
        max_completion_tokens: 12000,
        temperature: 0.9,
        ...options
    });
}

/**
 * Test connection to GPT-5 API
 */
async function testConnection() {
    console.log(`🔍 Testing GPT-5 connection...`);
    
    try {
        const testPrompt = "Respond with exactly: 'GPT-5 connection test successful'";
        
        const result = await quickResponse(testPrompt, {
            max_completion_tokens: 50
        });
        
        const isGPT5Working = result.content.includes('GPT-5') && 
                             result.success && 
                             !result.fallback;
        
        connectionStatus = {
            gpt5Available: isGPT5Working,
            lastChecked: new Date().toISOString(),
            errors: [],
            model: result.model,
            tokensUsed: result.tokensUsed
        };
        
        console.log(`✅ Connection test completed`);
        console.log(`🎯 GPT-5 Available: ${isGPT5Working}`);
        console.log(`🤖 Model Used: ${result.model}`);
        
        return {
            success: true,
            gpt5Available: isGPT5Working,
            result: result.content,
            model: result.model,
            fallback: result.fallback || false
        };
        
    } catch (error) {
        console.error(`❌ Connection test failed:`, error.message);
        
        connectionStatus = {
            gpt5Available: false,
            lastChecked: new Date().toISOString(),
            errors: [error.message]
        };
        
        return {
            success: false,
            gpt5Available: false,
            error: error.message
        };
    }
}

/**
 * Comprehensive system health check
 */
async function systemHealthCheck() {
    console.log(`🏥 Running GPT-5 system health check...`);
    
    const health = {
        timestamp: new Date().toISOString(),
        overall: false,
        models: {},
        performance: {},
        errors: []
    };
    
    // Test each model variant
    const modelsToTest = [
        { name: 'nano', model: GPT5_CONFIG.MODELS.NANO, func: quickResponse },
        { name: 'mini', model: GPT5_CONFIG.MODELS.MINI, func: standardResponse },
        { name: 'full', model: GPT5_CONFIG.MODELS.FULL, func: deepAnalysis },
        { name: 'chat', model: GPT5_CONFIG.MODELS.CHAT, func: chatResponse }
    ];
    
    const testPrompt = "Test";
    const testOptions = { max_completion_tokens: 10 };
    
    let workingModels = 0;
    
    for (const test of modelsToTest) {
        const startTime = Date.now();
        
        try {
            const result = await test.func(testPrompt, testOptions);
            const responseTime = Date.now() - startTime;
            
            health.models[test.name] = {
                available: true,
                model: result.model,
                responseTime,
                tokensUsed: result.tokensUsed,
                fallback: result.fallback || false
            };
            
            workingModels++;
            console.log(`✅ ${test.name}: Working (${responseTime}ms)`);
            
        } catch (error) {
            health.models[test.name] = {
                available: false,
                error: error.message,
                responseTime: Date.now() - startTime
            };
            
            health.errors.push(`${test.name}: ${error.message}`);
            console.log(`❌ ${test.name}: Failed - ${error.message}`);
        }
    }
    
    // Test fallback
    try {
        const fallbackResult = await getGPT5Completion(testPrompt, {
            model: GPT5_CONFIG.FALLBACK,
            max_completion_tokens: 10
        });
        
        health.fallback = {
            available: true,
            model: fallbackResult.model,
            responseTime: fallbackResult.executionTime
        };
        
    } catch (error) {
        health.fallback = {
            available: false,
            error: error.message
        };
        
        health.errors.push(`Fallback: ${error.message}`);
    }
    
    // Calculate overall health
    health.overall = workingModels > 0 || health.fallback?.available;
    health.performance.modelsWorking = workingModels;
    health.performance.totalModels = modelsToTest.length;
    health.performance.successRate = (workingModels / modelsToTest.length) * 100;
    
    console.log(`🏥 Health check complete: ${health.overall ? '✅ HEALTHY' : '❌ DEGRADED'}`);
    console.log(`📊 Models working: ${workingModels}/${modelsToTest.length} (${health.performance.successRate.toFixed(1)}%)`);
    
    return health;
}

/**
 * Get current system status
 */
function getStatus() {
    return {
        config: GPT5_CONFIG,
        connection: connectionStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    };
}

// Initialize connection test on startup
(async () => {
    if (process.env.OPENAI_API_KEY) {
        console.log(`🚀 Running initial connection test...`);
        await testConnection();
    } else {
        console.warn(`⚠️ OpenAI API key not found - connection test skipped`);
    }
})();

console.log(`✨ GPT-5 Client Ready`);
console.log(`🎯 Available functions: quickResponse, standardResponse, deepAnalysis, chatResponse`);
console.log(`🔧 Utilities: testConnection, systemHealthCheck, getStatus`);

module.exports = {
    // Main completion functions
    getGPT5Completion,
    getGPT5WithFallback,
    
    // Quick access functions
    quickResponse,
    standardResponse, 
    deepAnalysis,
    chatResponse,
    
    // Testing and monitoring
    testConnection,
    systemHealthCheck,
    getStatus,
    
    // Utilities
    validateParams,
    sanitizePrompt,
    extractResponse,
    buildGPT5Request,
    
    // Configuration and client
    GPT5_CONFIG,
    openai
};
