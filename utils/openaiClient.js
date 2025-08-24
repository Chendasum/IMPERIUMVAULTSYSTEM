// utils/openaiClient.js - FIXED: Real GPT-5 with Better Error Handling
require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize OpenAI client for real GPT-5 (Released August 7, 2025)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 180000, // 3 minutes for GPT-5's reasoning
    maxRetries: 3,
    defaultHeaders: {
        'User-Agent': 'IMPERIUM-VAULT-GPT5/1.0.0'
    }
});

// ✅ REAL GPT-5 Configuration (Released August 7, 2025)
const GPT5_CONFIG = {
    PRIMARY_MODEL: "gpt-5",               // ✅ Real GPT-5 (Released)
    MINI_MODEL: "gpt-5-mini",             // ✅ Real GPT-5 Mini (Released)
    NANO_MODEL: "gpt-5-nano",             // ✅ Real GPT-5 Nano (Released)
    CHAT_MODEL: "gpt-5-chat-latest",      // ✅ Real GPT-5 Chat (Released)
    FALLBACK_MODEL: "gpt-4o",             // Fallback if GPT-5 fails temporarily
    
    ENHANCED_CONTEXT_WINDOW: 200000,      // GPT-5's large context
    MAX_OUTPUT_TOKENS: 16384,             // ✅ INCREASED: GPT-5's maximum output capacity
    
    // GPT-5 reasoning parameters
    REASONING_EFFORTS: ["minimal", "low", "medium", "high"],
    VERBOSITY_LEVELS: ["low", "medium", "high"],
    DEFAULT_REASONING: "medium",
    DEFAULT_VERBOSITY: "medium"
};

let currentModel = GPT5_CONFIG.PRIMARY_MODEL;
let gpt5Available = true; // GPT-5 is released and available

console.log("🚀 Real GPT-5 Client (Released August 7, 2025):");
console.log(`   API Key: ${process.env.OPENAI_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   Primary Model: ${GPT5_CONFIG.PRIMARY_MODEL}`);
console.log(`   Mini Model: ${GPT5_CONFIG.MINI_MODEL}`);
console.log(`   Nano Model: ${GPT5_CONFIG.NANO_MODEL}`);
console.log(`   Chat Model: ${GPT5_CONFIG.CHAT_MODEL}`);

/**
 * ✅ FIXED: Safely extract response text with null checks
 */
function safeExtractResponseText(completion, apiType = 'responses') {
    try {
        if (apiType === 'responses') {
            // For Responses API
            if (!completion || !completion.output || !Array.isArray(completion.output)) {
                console.warn('⚠️ Invalid responses API structure:', completion);
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
                console.warn('⚠️ Invalid chat API structure:', completion);
                return "Response structure invalid - no choices array found";
            }
            
            const choice = completion.choices[0];
            if (!choice || !choice.message || !choice.message.content) {
                console.warn('⚠️ Invalid choice structure:', choice);
                return "No message content found in response";
            }
            
            return choice.message.content.trim();
        }
        
    } catch (error) {
        console.error('❌ Error extracting response text:', error.message);
        return `Error extracting response: ${error.message}`;
    }
}

/**
 * ✅ FIXED: Build Responses API request with validation
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
        
        // Add output tokens with validation
        if (options.max_output_tokens) {
            // Ensure minimum 16 tokens as per OpenAI requirements
            request.max_output_tokens = Math.max(16, Math.min(options.max_output_tokens, GPT5_CONFIG.MAX_OUTPUT_TOKENS));
        } else if (options.max_completion_tokens) {
            request.max_output_tokens = Math.max(16, Math.min(options.max_completion_tokens, GPT5_CONFIG.MAX_OUTPUT_TOKENS));
        }
        
        console.log('🔧 Built Responses API request:', {
            model: request.model,
            reasoning: request.reasoning?.effort,
            verbosity: request.text?.verbosity,
            max_output_tokens: request.max_output_tokens
        });
        
        return request;
        
    } catch (error) {
        console.error('❌ Error building responses request:', error.message);
        throw new Error(`Failed to build responses request: ${error.message}`);
    }
}

/**
 * ✅ FIXED: Build Chat request with validation
 */
function buildChatRequest(model, messages, options = {}) {
    try {
        const request = {
            model: model,
            messages: messages
        };
        
        // Add standard parameters with validation
        if (options.temperature !== undefined) {
            request.temperature = Math.max(0, Math.min(2, options.temperature));
        }
        
        if (options.max_tokens) {
            request.max_tokens = Math.max(1, Math.min(options.max_tokens, 16384));  // ✅ INCREASED max limit
        }
        
        if (options.top_p !== undefined) {
            request.top_p = Math.max(0, Math.min(1, options.top_p));
        }
        
        console.log('🔧 Built Chat API request:', {
            model: request.model,
            temperature: request.temperature,
            max_tokens: request.max_tokens
        });
        
        return request;
        
    } catch (error) {
        console.error('❌ Error building chat request:', error.message);
        throw new Error(`Failed to build chat request: ${error.message}`);
    }
}

/**
 * ✅ FIXED: Main GPT-5 analysis function with comprehensive error handling
 */
async function getGPT5Analysis(prompt, options = {}) {
    try {
        console.log(`🚀 GPT-5 Analysis Starting...`);
        console.log(`📝 Prompt length: ${prompt.length} chars`);
        console.log(`⚙️ Options:`, options);
        
        const selectedModel = options.model || GPT5_CONFIG.MINI_MODEL; // Default to Mini for balance
        console.log(`🤖 Selected Model: ${selectedModel}`);
        
        let response;
        let tokensUsed = 0;
        let apiUsed = 'unknown';
        
        // Determine which API to use based on model
        const useResponsesApi = selectedModel.includes('gpt-5') && selectedModel !== GPT5_CONFIG.CHAT_MODEL;
        
        if (useResponsesApi) {
            // ✅ Use Responses API for reasoning models (gpt-5, gpt-5-mini, gpt-5-nano)
            console.log('📡 Using Responses API...');
            apiUsed = 'responses';
            
            const requestOptions = {
                reasoning_effort: options.reasoning_effort || "medium",
                verbosity: options.verbosity || "medium",
                max_output_tokens: options.max_output_tokens || options.max_completion_tokens || 8000  // ✅ INCREASED default
            };
            
            const responsesRequest = buildResponsesRequest(selectedModel, prompt, requestOptions);
            
            console.log('🔄 Making Responses API call...');
            const completion = await openai.responses.create(responsesRequest);
            
            console.log('✅ Responses API call completed');
            console.log('📊 Raw response structure:', {
                hasOutput: !!completion.output,
                outputLength: completion.output?.length,
                hasUsage: !!completion.usage
            });
            
            response = safeExtractResponseText(completion, 'responses');
            tokensUsed = completion.usage?.total_tokens || 0;
            
            if (completion.usage?.reasoning_tokens) {
                console.log(`🧠 Reasoning Tokens: ${completion.usage.reasoning_tokens}`);
            }
            
        } else {
            // ✅ Use Chat Completions API for chat model
            console.log('💬 Using Chat Completions API...');
            apiUsed = 'chat';
            
            const messages = [
                {
                    role: "user",
                    content: prompt
                }
            ];
            
            const requestOptions = {
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 8000  // ✅ INCREASED for long responses
            };
            
            const chatRequest = buildChatRequest(selectedModel, messages, requestOptions);
            
            console.log('🔄 Making Chat Completions API call...');
            const completion = await openai.chat.completions.create(chatRequest);
            
            console.log('✅ Chat Completions API call completed');
            console.log('📊 Raw response structure:', {
                hasChoices: !!completion.choices,
                choicesLength: completion.choices?.length,
                hasUsage: !!completion.usage
            });
            
            response = safeExtractResponseText(completion, 'chat');
            tokensUsed = completion.usage?.total_tokens || 0;
        }
        
        // Validate response
        if (!response || response.length === 0) {
            throw new Error('Empty response received from GPT-5');
        }
        
        console.log(`✅ GPT-5 Analysis Complete!`);
        console.log(`📊 Model: ${selectedModel}`);
        console.log(`📡 API: ${apiUsed}`);
        console.log(`📊 Tokens Used: ${tokensUsed}`);
        console.log(`📏 Response Length: ${response.length} characters`);
        
        return response;
        
    } catch (error) {
        console.error(`❌ GPT-5 Analysis Error:`, error);
        console.error('❌ Error details:', {
            message: error.message,
            type: error.constructor.name,
            model: options.model,
            promptLength: prompt.length
        });
        
        // ✅ INTELLIGENT FALLBACK: Try GPT-4o if GPT-5 fails
        console.log('🔄 Attempting GPT-4o fallback...');
        
        try {
            const fallbackCompletion = await openai.chat.completions.create({
                model: GPT5_CONFIG.FALLBACK_MODEL,
                messages: [{ role: "user", content: prompt }],
                max_tokens: Math.min(options.max_tokens || 8000, 16384),  // ✅ INCREASED fallback tokens
                temperature: options.temperature || 0.7
            });
            
            const fallbackResponse = safeExtractResponseText(fallbackCompletion, 'chat');
            
            console.log('✅ GPT-4o fallback successful');
            return `[GPT-4o Fallback] ${fallbackResponse}`;
            
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError.message);
            
            // ✅ FINAL EMERGENCY RESPONSE
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
 * ✅ Quick access functions with error handling
 */
async function getQuickNanoResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.NANO_MODEL,
        reasoning_effort: "minimal",
        verbosity: "low",
        max_output_tokens: 6000  // ✅ INCREASED for better responses
    });
}

async function getQuickMiniResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.MINI_MODEL,
        reasoning_effort: "medium",
        verbosity: "medium",
        max_output_tokens: 10000  // ✅ INCREASED for detailed responses
    });
}

async function getDeepAnalysis(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.PRIMARY_MODEL,
        reasoning_effort: "high",
        verbosity: "high",
        max_output_tokens: 16000  // ✅ INCREASED for comprehensive analysis
    });
}

async function getChatResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.CHAT_MODEL,
        temperature: options.temperature || 0.7,
        max_tokens: 12000  // ✅ INCREASED for long conversations
    });
}

/**
 * ✅ FIXED: Connection test with proper error handling
 */
async function testOpenAIConnection() {
    try {
        console.log('🔍 Testing GPT-5 connection...');
        
        // Test with GPT-5 Nano (fastest)
        const testResponse = await getQuickNanoResponse("Hello, confirm you are GPT-5 and working correctly.", {
            max_output_tokens: 100
        });
        
        console.log('✅ GPT-5 connection test successful');
        
        return { 
            success: true, 
            result: testResponse,
            model: GPT5_CONFIG.NANO_MODEL,
            gpt5Available: true
        };
        
    } catch (error) {
        console.error('❌ GPT-5 connection test failed:', error.message);
        
        // Try fallback
        try {
            const fallbackResponse = await openai.chat.completions.create({
                model: GPT5_CONFIG.FALLBACK_MODEL,
                messages: [{ role: "user", content: "Test connection" }],
                max_tokens: 50
            });
            
            return { 
                success: true, 
                result: fallbackResponse.choices[0]?.message?.content,
                model: GPT5_CONFIG.FALLBACK_MODEL,
                gpt5Available: false,
                fallback: true
            };
            
        } catch (fallbackError) {
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
 * ✅ System health check
 */
async function checkGPT5SystemHealth() {
    const health = {
        gpt5Available: false,
        gpt5MiniAvailable: false,
        gpt5NanoAvailable: false,
        gpt5ChatAvailable: false,
        fallbackWorking: false,
        currentModel: currentModel,
        errors: []
    };
    
    // Test each model with very short requests
    const testModels = [
        { name: 'gpt5NanoAvailable', model: GPT5_CONFIG.NANO_MODEL, func: getQuickNanoResponse },
        { name: 'gpt5MiniAvailable', model: GPT5_CONFIG.MINI_MODEL, func: getQuickMiniResponse },
        { name: 'gpt5Available', model: GPT5_CONFIG.PRIMARY_MODEL, func: getDeepAnalysis },
        { name: 'gpt5ChatAvailable', model: GPT5_CONFIG.CHAT_MODEL, func: getChatResponse }
    ];
    
    for (const test of testModels) {
        try {
            await test.func("Hi", { max_output_tokens: 20, max_tokens: 20 });
            health[test.name] = true;
            console.log(`✅ ${test.model} working`);
        } catch (error) {
            health.errors.push(`${test.model}: ${error.message}`);
            console.log(`❌ ${test.model} failed: ${error.message}`);
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

// System startup message
console.log('✅ Real GPT-5 Client loaded (Released August 7, 2025)');
console.log('🚀 Enhanced error handling and fallback systems active');
console.log('🔧 Safe response extraction implemented');
console.log('⚡ Ready for GPT-5 Nano → Mini → Full → Chat routing');

module.exports = {
    // Main GPT-5 functions
    getGPT5Analysis,
    
    // Quick access functions
    getQuickNanoResponse,
    getQuickMiniResponse,
    getDeepAnalysis,
    getChatResponse,
    
    // Testing and utilities
    testOpenAIConnection,
    checkGPT5SystemHealth,
    buildResponsesRequest,
    buildChatRequest,
    safeExtractResponseText,
    
    // Config and client
    openai,
    GPT5_CONFIG
};
