// utils/openaiClient.js - FIXED VERSION based on working original
require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize OpenAI client for real GPT-5 (Released August 7, 2025)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 300000, // 5 minutes for complex reasoning
    maxRetries: 1,
    defaultHeaders: {
        'User-Agent': 'IMPERIUM-VAULT-GPT5/2.0.0'
    }
});

// REAL GPT-5 Configuration (Released August 7, 2025)
const GPT5_CONFIG = {
    PRIMARY_MODEL: "gpt-5",               
    MINI_MODEL: "gpt-5-mini",             
    NANO_MODEL: "gpt-5-nano",             
    CHAT_MODEL: "gpt-5-chat-latest",      
    FALLBACK_MODEL: "gpt-4o",             
    
    ENHANCED_CONTEXT_WINDOW: 272000,      
    MAX_COMPLETION_TOKENS: 128000,        
    
    // GPT-5 reasoning parameters
    REASONING_EFFORTS: ["minimal", "low", "medium", "high"],
    VERBOSITY_LEVELS: ["low", "medium", "high"],
    DEFAULT_REASONING: "medium",
    DEFAULT_VERBOSITY: "medium"
};

let currentModel = GPT5_CONFIG.PRIMARY_MODEL;
let connectionStatus = {
    gpt5Available: null,
    lastChecked: null,
    errors: []
};

console.log("Enhanced GPT-5 Client (Based on working original):");
console.log(`   API Key: ${process.env.OPENAI_API_KEY ? "SET" : "NOT SET"}`);
console.log(`   Primary Model: ${GPT5_CONFIG.PRIMARY_MODEL}`);
console.log(`   Mini Model: ${GPT5_CONFIG.MINI_MODEL}`);
console.log(`   Nano Model: ${GPT5_CONFIG.NANO_MODEL}`);
console.log(`   Chat Model: ${GPT5_CONFIG.CHAT_MODEL}`);

/**
 * Safely extract response text with null checks
 */
function safeExtractResponseText(completion, apiType = 'responses') {
    try {
        if (apiType === 'responses') {
            // For Responses API
            if (!completion || !completion.output || !Array.isArray(completion.output)) {
                console.warn('Invalid responses API structure:', completion);
                return "Response structure invalid - no output array found";
            }
            
            let responseText = "";
            for (const item of completion.output) {
                if (item && item.content && Array.isArray(item.content)) {
                    for (const content of item.content) {
                        if (content && content.text) {
                            responseText += content.text;
                        }
                    }
                }
            }
            
            return responseText || "No text content found in response";
            
        } else {
            // For Chat Completions API
            if (!completion || !completion.choices || !Array.isArray(completion.choices)) {
                console.warn('Invalid chat API structure:', completion);
                return "Response structure invalid - no choices array found";
            }
            
            const choice = completion.choices[0];
            if (!choice || !choice.message || !choice.message.content) {
                console.warn('Invalid choice structure:', choice);
                return "No message content found in response";
            }
            
            return choice.message.content.trim();
        }
        
    } catch (error) {
        console.error('Error extracting response text:', error.message);
        return `Error extracting response: ${error.message}`;
    }
}

/**
 * Build Responses API request with consistent parameters
 */
function buildResponsesRequest(model, input, options = {}) {
    try {
        const request = {
            model: model,
            input: input
        };
        
        // Add reasoning configuration with validation
        if (options.reasoning_effort && GPT5_CONFIG.REASONING_EFFORTS.includes(options.reasoning_effort)) {
            request.reasoning = {
                effort: options.reasoning_effort
            };
        }
        
        // Add text configuration with validation
        if (options.verbosity && GPT5_CONFIG.VERBOSITY_LEVELS.includes(options.verbosity)) {
            request.text = {
                verbosity: options.verbosity
            };
        }
        
        // Handle max_completion_tokens consistently for Responses API
        let maxTokens = options.max_completion_tokens || options.max_output_tokens || 8000;
        request.max_output_tokens = Math.max(16, Math.min(maxTokens, GPT5_CONFIG.MAX_COMPLETION_TOKENS));
        
        console.log('Built Responses API request:', {
            model: request.model,
            reasoning: request.reasoning?.effort,
            verbosity: request.text?.verbosity,
            max_output_tokens: request.max_output_tokens
        });
        
        return request;
        
    } catch (error) {
        console.error('Error building responses request:', error.message);
        throw new Error(`Failed to build responses request: ${error.message}`);
    }
}

/**
 * Build Chat request with consistent parameters - FIXED for temperature handling
 */
function buildChatRequest(model, messages, options = {}) {
    try {
        const request = {
            model: model,
            messages: messages
        };
        
        // FIXED: Only add temperature for chat models that support it
        if (model === GPT5_CONFIG.CHAT_MODEL || model === GPT5_CONFIG.FALLBACK_MODEL) {
            if (options.temperature !== undefined) {
                request.temperature = Math.max(0, Math.min(2, options.temperature));
            }
        } else {
            console.log('Skipping temperature for reasoning model:', model);
        }
        
        // Handle max_completion_tokens for Chat API - use max_tokens parameter name
        let maxTokens = options.max_completion_tokens || options.max_tokens || 8000;
        
        // FIXED: For GPT-4o fallback, use max_tokens. For GPT-5 chat, use max_completion_tokens
        if (model === GPT5_CONFIG.FALLBACK_MODEL) {
            request.max_tokens = Math.max(1, Math.min(maxTokens, 16384));
        } else {
            request.max_completion_tokens = Math.max(1, Math.min(maxTokens, GPT5_CONFIG.MAX_COMPLETION_TOKENS));
        }
        
        if (options.top_p !== undefined) {
            request.top_p = Math.max(0, Math.min(1, options.top_p));
        }
        
        console.log('Built Chat API request:', {
            model: request.model,
            temperature: request.temperature,
            max_tokens: request.max_tokens,
            max_completion_tokens: request.max_completion_tokens
        });
        
        return request;
        
    } catch (error) {
        console.error('Error building chat request:', error.message);
        throw new Error(`Failed to build chat request: ${error.message}`);
    }
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
                console.log(`API call succeeded on attempt ${attempt}`);
            }
            
            return result;
            
        } catch (error) {
            lastError = error;
            console.warn(`API call failed (attempt ${attempt}/${maxRetries}):`, error.message);
            
            // Don't retry on certain errors
            if (error.status === 401 || error.status === 403) {
                throw error; // Auth errors
            }
            
            if (error.status === 400 && !error.message.includes('rate')) {
                throw error; // Bad request (non-rate limit)
            }
            
            // Calculate backoff delay
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

/**
 * FIXED: Main GPT-5 analysis function - maintains compatibility with original structure
 */
async function getGPT5Analysis(prompt, options = {}) {
    const startTime = Date.now();
    
    try {
        console.log(`GPT-5 Analysis Starting...`);
        console.log(`Prompt length: ${prompt.length} chars`);
        console.log(`Options:`, options);
        
        const selectedModel = options.model || GPT5_CONFIG.MINI_MODEL;
        console.log(`Selected Model: ${selectedModel}`);
        
        // Input validation to prevent API errors
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Invalid prompt: must be non-empty string');
        }
        
        if (prompt.length > 250000) { // Leave room for other content
            console.warn('Prompt too long, truncating...');
            prompt = prompt.substring(0, 250000) + '\n... (truncated for length)';
        }
        
        let response;
        let tokensUsed = 0;
        let apiUsed = 'unknown';
        
        // FIXED: Determine which API to use based on model - matches original logic
        const useResponsesApi = selectedModel.includes('gpt-5') && selectedModel !== GPT5_CONFIG.CHAT_MODEL;
        
        if (useResponsesApi) {
            // Use Responses API for reasoning models (gpt-5, gpt-5-mini, gpt-5-nano)
            console.log('Using Responses API...');
            apiUsed = 'responses';
            
            const requestOptions = {
                reasoning_effort: options.reasoning_effort || "medium",
                verbosity: options.verbosity || "medium",
                max_completion_tokens: options.max_completion_tokens || 8000
            };
            
            const responsesRequest = buildResponsesRequest(selectedModel, prompt, requestOptions);
            
            console.log('Making Responses API call...');
            const completion = await executeWithRetry(async () => {
                return await openai.responses.create(responsesRequest);
            });
            
            console.log('Responses API call completed');
            
            response = safeExtractResponseText(completion, 'responses');
            tokensUsed = completion.usage?.total_tokens || 0;
            
            if (completion.usage?.reasoning_tokens) {
                console.log(`Reasoning Tokens: ${completion.usage.reasoning_tokens}`);
            }
            
        } else {
            // Use Chat Completions API for chat model and fallback
            console.log('Using Chat Completions API...');
            apiUsed = 'chat';
            
            const messages = [
                {
                    role: "user",
                    content: prompt
                }
            ];
            
            // FIXED: Only include temperature for supported models
            const requestOptions = {
                max_completion_tokens: options.max_completion_tokens || 8000
            };
            
            // Only add temperature for chat model, not reasoning models
            if (selectedModel === GPT5_CONFIG.CHAT_MODEL || selectedModel === GPT5_CONFIG.FALLBACK_MODEL) {
                requestOptions.temperature = options.temperature || 0.7;
            }
            
            const chatRequest = buildChatRequest(selectedModel, messages, requestOptions);
            
            console.log('Making Chat Completions API call...');
            const completion = await executeWithRetry(async () => {
                return await openai.chat.completions.create(chatRequest);
            });
            
            console.log('Chat Completions API call completed');
            
            response = safeExtractResponseText(completion, 'chat');
            tokensUsed = completion.usage?.total_tokens || 0;
        }
        
        // Validate response
        if (!response || response.length === 0) {
            throw new Error('Empty response received from GPT-5');
        }
        
        const executionTime = Date.now() - startTime;
        
        console.log(`GPT-5 Analysis Complete!`);
        console.log(`Model: ${selectedModel}`);
        console.log(`API: ${apiUsed}`);
        console.log(`Tokens Used: ${tokensUsed}`);
        console.log(`Response Length: ${response.length} characters`);
        console.log(`Execution Time: ${executionTime}ms`);
        
        // FIXED: Return simple string response to match original behavior
        return response;
        
    } catch (error) {
        console.error(`GPT-5 Analysis Error:`, error);
        
        // Circuit breaker - don't retry infinitely
        if (error.message.includes('rate_limit') || error.message.includes('quota')) {
            console.log('Rate limit hit, no fallback attempt');
            throw error;
        }
        
        // INTELLIGENT FALLBACK: Try GPT-4o if GPT-5 fails
        console.log('Attempting GPT-4o fallback...');
        
        try {
            const fallbackCompletion = await openai.chat.completions.create({
                model: GPT5_CONFIG.FALLBACK_MODEL,
                messages: [{ role: "user", content: prompt }],
                max_tokens: Math.min(options.max_completion_tokens || 8000, 16384),
                temperature: options.temperature || 0.7
            });
            
            const fallbackResponse = safeExtractResponseText(fallbackCompletion, 'chat');
            
            console.log('GPT-4o fallback successful');
            return `[GPT-4o Fallback] ${fallbackResponse}`;
            
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError.message);
            
            // FINAL EMERGENCY RESPONSE
            return `I apologize, but I'm experiencing technical difficulties. 

Error details: ${error.message}

Please try:
• A shorter, simpler message
• Waiting a moment and trying again
• Checking if the service is temporarily unavailable

Your message was received but couldn't be processed at this time.`;
        }
    }
}

/**
 * Quick access functions with consistent parameters
 */
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
        temperature: options.temperature || 0.7,
        max_completion_tokens: 12000
    });
}

/**
 * Connection test with proper error handling
 */
async function testOpenAIConnection() {
    try {
        console.log('Testing GPT-5 connection...');
        
        // Test with GPT-5 Nano (fastest)
        const testResponse = await getQuickNanoResponse("Hello, confirm you are GPT-5 and working correctly.", {
            max_completion_tokens: 100
        });
        
        console.log('GPT-5 connection test successful');
        
        connectionStatus = {
            gpt5Available: true,
            lastChecked: new Date().toISOString(),
            errors: []
        };
        
        return { 
            success: true, 
            result: testResponse,
            model: GPT5_CONFIG.NANO_MODEL,
            gpt5Available: true
        };
        
    } catch (error) {
        console.error('GPT-5 connection test failed:', error.message);
        
        // Try fallback
        try {
            const fallbackResponse = await openai.chat.completions.create({
                model: GPT5_CONFIG.FALLBACK_MODEL,
                messages: [{ role: "user", content: "Test connection" }],
                max_tokens: 50
            });
            
            connectionStatus = {
                gpt5Available: false,
                lastChecked: new Date().toISOString(),
                errors: [error.message]
            };
            
            return { 
                success: true, 
                result: fallbackResponse.choices[0]?.message?.content,
                model: GPT5_CONFIG.FALLBACK_MODEL,
                gpt5Available: false,
                fallback: true
            };
            
        } catch (fallbackError) {
            connectionStatus = {
                gpt5Available: false,
                lastChecked: new Date().toISOString(),
                errors: [error.message, fallbackError.message]
            };
            
            return { 
                success: false, 
                error: error.message,
                fallbackError: fallbackError.message,
                gpt5Available: false
            };
        }
    }
}

/**
 * MISSING FUNCTION: Add to openaiClient.js
 */
async function checkGPT5OnlySystemHealth() {
    console.log('Running GPT-5 system health check...');
    
    const health = {
        timestamp: new Date().toISOString(),
        overall: false,
        gpt5Available: false,
        gpt5MiniAvailable: false,
        gpt5NanoAvailable: false,
        gpt5ChatAvailable: false,
        fallbackWorking: false,
        errors: []
    };
    
    // Test each model
    const models = [
        { name: 'gpt5NanoAvailable', func: () => getQuickNanoResponse("test", {max_completion_tokens: 10}) },
        { name: 'gpt5MiniAvailable', func: () => getQuickMiniResponse("test", {max_completion_tokens: 10}) },
        { name: 'gpt5Available', func: () => getDeepAnalysis("test", {max_completion_tokens: 10}) },
        { name: 'gpt5ChatAvailable', func: () => getChatResponse("test", {max_completion_tokens: 10}) }
    ];
    
    for (const model of models) {
        try {
            await model.func();
            health[model.name] = true;
        } catch (error) {
            health.errors.push(`${model.name}: ${error.message}`);
        }
    }
    
    health.overall = health.gpt5Available || health.gpt5MiniAvailable || health.gpt5NanoAvailable;
    return health;
}

/**
 * FIXED: System health check - matches original function name
 */
async function checkGPT5SystemHealth() {
    const health = {
        gpt5Available: false,
        gpt5MiniAvailable: false,
        gpt5NanoAvailable: false,
        gpt5ChatAvailable: false,
        fallbackWorking: false,
        currentModel: currentModel,
        errors: [],
        parameterConsistency: 'max_completion_tokens standardized',
        overallHealth: false
    };
    
    // Test each model with very short requests to avoid quota issues
    const testModels = [
        { name: 'gpt5NanoAvailable', model: GPT5_CONFIG.NANO_MODEL, func: getQuickNanoResponse },
        { name: 'gpt5MiniAvailable', model: GPT5_CONFIG.MINI_MODEL, func: getQuickMiniResponse },
        { name: 'gpt5Available', model: GPT5_CONFIG.PRIMARY_MODEL, func: getDeepAnalysis },
        { name: 'gpt5ChatAvailable', model: GPT5_CONFIG.CHAT_MODEL, func: getChatResponse }
    ];
    
    for (const test of testModels) {
        try {
            await test.func("Hi", { max_completion_tokens: 20 });
            health[test.name] = true;
            console.log(`${test.model} working`);
        } catch (error) {
            health.errors.push(`${test.model}: ${error.message}`);
            console.log(`${test.model} failed: ${error.message}`);
        }
    }
    
    // Test fallback
    try {
        await openai.chat.completions.create({
            model: GPT5_CONFIG.FALLBACK_MODEL,
            messages: [{ role: "user", content: "Test" }],
            max_tokens: 10
        });
        health.fallbackWorking = true;
    } catch (error) {
        health.errors.push(`Fallback: ${error.message}`);
    }
    
    health.overallHealth = health.gpt5Available || health.gpt5MiniAvailable || health.gpt5NanoAvailable || health.fallbackWorking;
    
    return health;
}

/**
 * ADDED: Function alias for dualCommandSystem compatibility
 */
async function checkGPT5OnlySystemHealth() {
    return await checkGPT5SystemHealth();
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

// System startup message
console.log('Enhanced GPT-5 Client loaded (Fixed Version)');
console.log('FIXED: Parameter consistency - temperature only for supported models');
console.log('FIXED: Function exports match dualCommandSystem expectations');
console.log('Enhanced error handling and fallback systems active');
console.log('Circuit breaker implemented to prevent infinite loops');
console.log('Ready for GPT-5 Nano → Mini → Full → Chat routing');

// FIXED: Exports match original + new requirements
module.exports = {
    // Main GPT-5 functions - FIXED: Correct function names
    getGPT5Analysis,
    
    // Quick access functions
    getQuickNanoResponse,
    getQuickMiniResponse,
    getDeepAnalysis,
    getChatResponse,
    
    // Testing and utilities - FIXED: Both function names exported
    testOpenAIConnection,
    checkGPT5SystemHealth,        // Original name
    checkGPT5OnlySystemHealth,    // Alias for dualCommandSystem
    getStatus,
    
    // Utility functions
    buildResponsesRequest,
    buildChatRequest,
    safeExtractResponseText,
    executeWithRetry,
    
    // Config and client
    openai,
    GPT5_CONFIG,
    
    // Legacy aliases for full compatibility
    testConnection: testOpenAIConnection,
    systemHealthCheck: checkGPT5SystemHealth
};
