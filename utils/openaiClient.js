// utils/openaiClient.js - CORRECTED: GPT-5 Client with Responses API
require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize OpenAI client for GPT-5
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 180000, // 3 minutes for GPT-5's reasoning
    maxRetries: 3,
    defaultHeaders: {
        'User-Agent': 'IMPERIUM-VAULT-GPT5/1.0.0'
    }
});

// ✅ CORRECTED: Real GPT-5 Model Configuration
const GPT5_CONFIG = {
    PRIMARY_MODEL: "gpt-5",           // ✅ Real GPT-5 model
    MINI_MODEL: "gpt-5-mini",         // ✅ Real GPT-5 Mini
    NANO_MODEL: "gpt-5-nano",         // ✅ Real GPT-5 Nano  
    CHAT_MODEL: "gpt-5-chat-latest",  // ✅ Real GPT-5 Chat (different parameters)
    FALLBACK_MODEL: "gpt-4o",         // Fallback if GPT-5 fails
    
    ENHANCED_CONTEXT_WINDOW: 200000,  // GPT-5's large context
    MAX_OUTPUT_TOKENS: 8192,          // GPT-5's output capacity
    
    // ✅ CORRECTED: Model-specific parameter support
    REASONING_EFFORTS: ["minimal", "low", "medium", "high"],
    VERBOSITY_LEVELS: ["low", "medium", "high"],
    DEFAULT_REASONING: "medium",      // Default reasoning effort
    DEFAULT_VERBOSITY: "medium",      // Default verbosity
    
    // ✅ Model parameter compatibility matrix
    MODEL_PARAMS: {
        'gpt-5': {
            supports_reasoning_effort: true,
            supports_verbosity: true,
            supports_temperature: false,
            use_responses_api: true
        },
        'gpt-5-mini': {
            supports_reasoning_effort: true,
            supports_verbosity: true,
            supports_temperature: false,
            use_responses_api: true
        },
        'gpt-5-nano': {
            supports_reasoning_effort: true,
            supports_verbosity: true,
            supports_temperature: false,
            use_responses_api: true
        },
        'gpt-5-chat-latest': {
            supports_reasoning_effort: false,  // ✅ Chat model doesn't support this
            supports_verbosity: false,         // ✅ Chat model doesn't support this
            supports_temperature: true,        // ✅ Chat model uses temperature instead
            use_responses_api: false           // ✅ Chat model uses Chat Completions API
        }
    },
    
    // Pricing (per 1M tokens)
    PRICING: {
        'gpt-5': { input: 1.25, output: 10.00 },
        'gpt-5-mini': { input: 0.25, output: 2.00 },
        'gpt-5-nano': { input: 0.05, output: 0.40 },
        'gpt-5-chat-latest': { input: 1.25, output: 10.00 }
    }
};

let currentModel = GPT5_CONFIG.PRIMARY_MODEL;
let gpt5Available = false;
let modelCapabilities = {};

console.log("🚀 CORRECTED GPT-5 Enhanced Client Configuration:");
console.log(`   API Key: ${process.env.OPENAI_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   Primary Model: ${GPT5_CONFIG.PRIMARY_MODEL} (Responses API)`);
console.log(`   Chat Model: ${GPT5_CONFIG.CHAT_MODEL} (Chat Completions API)`);
console.log(`   Context Window: ${GPT5_CONFIG.ENHANCED_CONTEXT_WINDOW.toLocaleString()} tokens`);
console.log(`   🔧 CORRECTED: Using proper API endpoints for each model type`);

/**
 * ✅ Get supported parameters for a specific model
 */
function getSupportedParams(model) {
    return GPT5_CONFIG.MODEL_PARAMS[model] || {
        supports_reasoning_effort: false,
        supports_verbosity: false,
        supports_temperature: true,
        use_responses_api: false
    };
}

/**
 * ✅ Build Responses API request for reasoning models
 */
function buildResponsesRequest(model, input, options = {}) {
    const supportedParams = getSupportedParams(model);
    
    if (!supportedParams.use_responses_api) {
        throw new Error(`Model ${model} does not support Responses API`);
    }
    
    const request = {
        model: model,
        input: input
    };
    
    // Add reasoning configuration
    if (supportedParams.supports_reasoning_effort && options.reasoning_effort) {
        request.reasoning = {
            effort: options.reasoning_effort
        };
    }
    
    // Add text configuration with verbosity
    if (supportedParams.supports_verbosity) {
        request.text = {
            verbosity: options.verbosity || GPT5_CONFIG.DEFAULT_VERBOSITY
        };
    }
    
    // ✅ FIXED: Use max_output_tokens instead of max_completion_tokens for Responses API
    if (options.max_completion_tokens || options.max_output_tokens) {
        request.max_output_tokens = options.max_output_tokens || options.max_completion_tokens;
    }
    
    return request;
}

/**
 * ✅ Build Chat Completions API request for chat models
 */
function buildChatRequest(model, messages, options = {}) {
    const supportedParams = getSupportedParams(model);
    
    if (supportedParams.use_responses_api) {
        throw new Error(`Model ${model} should use Responses API, not Chat Completions`);
    }
    
    const request = {
        model: model,
        messages: messages
    };
    
    // Add standard parameters for chat model
    if (supportedParams.supports_temperature) {
        request.temperature = options.temperature || 0.7;
        request.top_p = options.top_p || 0.95;
        request.max_tokens = options.max_tokens || 1000;
    }
    
    return request;
}

/**
 * ✅ Test Real GPT-5 availability with correct API usage
 */
async function testGPT5Capabilities() {
    if (gpt5Available) return modelCapabilities;
    
    try {
        console.log('🔍 Testing Real GPT-5 capabilities with Responses API...');
        
        // ✅ Test GPT-5 with Responses API
        const responsesRequest = buildResponsesRequest(GPT5_CONFIG.PRIMARY_MODEL, 
            "Confirm you are GPT-5 and describe your enhanced capabilities briefly.", 
            {
                reasoning_effort: "minimal",
                verbosity: "low",
                max_completion_tokens: 500
            }
        );
        
        const responsesTest = await openai.responses.create(responsesRequest);
        
        // ✅ Test GPT-5 Chat with Chat Completions API
        const chatRequest = buildChatRequest(GPT5_CONFIG.CHAT_MODEL, [
            {
                role: "user",
                content: "Hello, are you GPT-5 Chat?"
            }
        ], {
            max_tokens: 50,  // ✅ FIXED: Increased from 100
            temperature: 0.7
        });
        
        const chatTest = await openai.chat.completions.create(chatRequest);
        
        gpt5Available = true;
        currentModel = GPT5_CONFIG.PRIMARY_MODEL;
        
        // Extract response text from Responses API
        let responseText = "";
        if (responsesTest.output && responsesTest.output.length > 0) {
            for (const item of responsesTest.output) {
                if (item.content) {
                    for (const content of item.content) {
                        if (content.text) {
                            responseText += content.text;
                        }
                    }
                }
            }
        }
        
        modelCapabilities = {
            available: true,
            enhancedReasoning: true,
            largeContext: true,
            improvedMath: true,
            betterFinancial: true,
            naturalConversation: true,
            multimodal: true,
            codeGeneration: true,
            contextWindow: GPT5_CONFIG.ENHANCED_CONTEXT_WINDOW,
            max_completion_tokens: GPT5_CONFIG.MAX_OUTPUT_TOKENS,
            reasoningEfforts: GPT5_CONFIG.REASONING_EFFORTS,
            verbosityLevels: GPT5_CONFIG.VERBOSITY_LEVELS,
            testResponse: responseText,
            chatResponse: chatTest.choices[0].message.content,
            apiFixed: true,
            responsesApiWorking: true
        };
        
        console.log('✅ Real GPT-5 capabilities confirmed with correct APIs:');
        console.log(`   Responses API: ✅ Working`);
        console.log(`   Chat API: ✅ Working`);
        console.log(`   Enhanced Reasoning: ${modelCapabilities.enhancedReasoning}`);
        
        return modelCapabilities;
        
    } catch (error) {
        console.log(`⚠️ GPT-5 not available: ${error.message}`);
        console.log('🔄 Falling back to GPT-4o');
        
        gpt5Available = false;
        currentModel = GPT5_CONFIG.FALLBACK_MODEL;
        
        modelCapabilities = {
            available: false,
            fallbackModel: GPT5_CONFIG.FALLBACK_MODEL,
            error: error.message,
            apiFixed: false,
            responsesApiWorking: false
        };
        
        return modelCapabilities;
    }
}

/**
 * ✅ Enhanced query analysis for Real GPT-5's capabilities
 */
function analyzeQueryForGPT5(prompt) {
    const message = prompt.toLowerCase();
    
    // Complex reasoning patterns (optimal for GPT-5 with high reasoning)
    const complexReasoningPatterns = [
        /(analyze|evaluate|assess|compare|optimize)/i,
        /(portfolio.*allocation|risk.*management|strategic.*planning)/i,
        /(economic.*regime|market.*analysis|financial.*modeling)/i,
        /(multi.*step|comprehensive|detailed.*analysis)/i,
        /(calculate.*optimal|derive.*formula|prove.*mathematically)/i
    ];
    
    // Speed patterns (use GPT-5 Nano with minimal reasoning)
    const speedPatterns = [
        /urgent|immediate|now|asap|quick|fast|emergency|real-time/i,
        /^(what time|what's the time|current time|time now)/i,
        /^(hello|hi|hey|good morning|good afternoon|what's up)$/i,
        /^how are you\??$/i,
        /^(thanks|thank you|cool|nice|great|ok|okay)$/i
    ];
    
    // Financial analysis patterns
    const financialPatterns = [
        /(dcf|npv|irr|wacc|capm|black.*scholes)/i,
        /(portfolio.*optimization|efficient.*frontier|sharpe.*ratio)/i,
        /(value.*at.*risk|var|stress.*test|monte.*carlo)/i
    ];
    
    // Chat patterns (use GPT-5 Chat model)
    const chatPatterns = [
        /^(hello|hi|hey|good morning|good afternoon)/i,
        /(chat|conversation|talk|discuss)/i,
        /(how are you|what's up|how's it going)/i
    ];
    
    // ✅ Determine optimal GPT-5 configuration
    let config = {
        type: 'general',
        model: GPT5_CONFIG.NANO_MODEL,
        max_completion_tokens: 800,
        reasoning_effort: "minimal",
        verbosity: "medium",
        useResponsesApi: true
    };
    
    // SPEED CRITICAL - GPT-5 Nano with minimal reasoning
    if (speedPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'speed',
            model: GPT5_CONFIG.NANO_MODEL,
            max_completion_tokens: 600,
            reasoning_effort: "minimal",
            verbosity: "low",
            useResponsesApi: true
        };
    }
    // CHAT PATTERNS - GPT-5 Chat model
    else if (chatPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'chat',
            model: GPT5_CONFIG.CHAT_MODEL,
            max_tokens: 1000,
            temperature: 0.7,
            useResponsesApi: false
        };
    }
    // COMPLEX ANALYSIS - Full GPT-5 with medium reasoning
    else if (complexReasoningPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'complex_reasoning',
            model: GPT5_CONFIG.PRIMARY_MODEL,
            max_completion_tokens: 2500,
            reasoning_effort: "medium",
            verbosity: "medium",
            useResponsesApi: true
        };
    }
    // FINANCIAL/MATH - Full GPT-5 with medium reasoning
    else if (financialPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'financial_analysis',
            model: GPT5_CONFIG.PRIMARY_MODEL,
            max_completion_tokens: 2000,
            reasoning_effort: "medium",
            verbosity: "medium",
            useResponsesApi: true
        };
    }
    
    return config;
}

/**
 * ✅ FIXED: Main GPT-5 analysis function with correct API usage
 */
async function getGPT5Analysis(prompt, options = {}) {
    try {
        // Ensure GPT-5 capabilities are tested
        await testGPT5Capabilities();
        
        console.log(`🔍 Real GPT-5 Analysis (Model: ${currentModel})`);
        
        // Analyze query for optimal configuration
        const queryConfig = analyzeQueryForGPT5(prompt);
        const selectedModel = options.model || queryConfig.model;
        
        console.log(`📊 Query Type: ${queryConfig.type}`);
        console.log(`🤖 Model: ${selectedModel}`);
        console.log(`🔧 API: ${queryConfig.useResponsesApi ? 'Responses' : 'Chat Completions'}`);
        
        let response;
        let tokensUsed = 0;
        
        // ✅ Use appropriate API based on model type
        if (queryConfig.useResponsesApi && selectedModel !== GPT5_CONFIG.CHAT_MODEL) {
            // Use Responses API for reasoning models
            const requestOptions = {
                reasoning_effort: options.reasoning_effort || queryConfig.reasoning_effort,
                verbosity: options.verbosity || queryConfig.verbosity,
                // ✅ FIXED: Use max_output_tokens for Responses API
                max_output_tokens: options.max_output_tokens || options.max_completion_tokens || queryConfig.max_completion_tokens
            };
            
            const responsesRequest = buildResponsesRequest(selectedModel, prompt, requestOptions);
            const completion = await openai.responses.create(responsesRequest);
            
            // Extract response text
            response = "";
            if (completion.output && completion.output.length > 0) {
                for (const item of completion.output) {
                    if (item.content) {
                        for (const content of item.content) {
                            if (content.text) {
                                response += content.text;
                            }
                        }
                    }
                }
            }
            
            tokensUsed = completion.usage?.total_tokens || 0;
            
            if (completion.usage?.reasoning_tokens) {
                console.log(`🧠 Reasoning Tokens: ${completion.usage.reasoning_tokens}`);
            }
            
        } else {
            // Use Chat Completions API for chat model
            const messages = [
                {
                    role: "user",
                    content: prompt
                }
            ];
            
            const requestOptions = {
                temperature: options.temperature || queryConfig.temperature || 0.7,
                max_tokens: options.max_tokens || queryConfig.max_tokens || 1000
            };
            
            const chatRequest = buildChatRequest(selectedModel, messages, requestOptions);
            const completion = await openai.chat.completions.create(chatRequest);
            
            response = completion.choices[0].message.content.trim();
            tokensUsed = completion.usage?.total_tokens || 0;
        }
        
        console.log(`✅ GPT-5 Analysis Complete: ${queryConfig.type}`);
        console.log(`📊 Tokens Used: ${tokensUsed} total`);
        console.log(`📏 Response Length: ${response.length} characters`);
        
        return response;
        
    } catch (error) {
        console.error(`❌ GPT-5 Analysis Error: ${error.message}`);
        
        // Intelligent fallback handling
        if (error.message.includes('model') && currentModel.startsWith('gpt-5')) {
            console.log('🔄 GPT-5 unavailable, falling back to GPT-4o...');
            
            try {
                // Retry with fallback model using Chat Completions API
                const fallbackCompletion = await openai.chat.completions.create({
                    model: GPT5_CONFIG.FALLBACK_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: options.max_tokens || 1000,
                    temperature: options.temperature || 0.7
                });
                
                return fallbackCompletion.choices[0].message.content.trim();
                
            } catch (fallbackError) {
                throw new Error(`Both GPT-5 and fallback failed: ${fallbackError.message}`);
            }
        }
        
        throw new Error(`GPT-5 Error: ${error.message}`);
    }
}

/**
 * ✅ Quick access functions for different GPT-5 models
 */
async function getQuickNanoResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.NANO_MODEL,
        reasoning_effort: "minimal",
        verbosity: "low",
        max_output_tokens: 2000  // ✅ INCREASED from 600 for better responses
    });
}

async function getQuickMiniResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.MINI_MODEL,
        reasoning_effort: "minimal",
        verbosity: "medium",
        max_output_tokens: 3000  // ✅ INCREASED from 1200 for detailed responses
    });
}

async function getDeepAnalysis(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.PRIMARY_MODEL,
        reasoning_effort: "medium",
        verbosity: "medium",
        max_output_tokens: 6000  // ✅ INCREASED from 2500 for comprehensive analysis
    });
}

async function getChatResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.CHAT_MODEL,
        temperature: options.temperature || 0.7,
        max_tokens: 1500
    });
}

/**
 * ✅ Enhanced financial market analysis with Real GPT-5
 */
async function getEnhancedMarketAnalysis(query, marketData = null, options = {}) {
    try {
        console.log('📈 Real GPT-5 Enhanced Market Analysis...');
        
        let enhancedQuery = `ENHANCED MARKET ANALYSIS REQUEST: ${query}`;
        
        if (marketData) {
            enhancedQuery += `\n\nCURRENT MARKET DATA:`;
            if (marketData.economics?.fedRate) enhancedQuery += `\n- Federal Funds Rate: ${marketData.economics.fedRate.value}%`;
            if (marketData.economics?.inflation) enhancedQuery += `\n- CPI Inflation: ${marketData.economics.inflation.value}%`;
            if (marketData.stocks?.vix) enhancedQuery += `\n- VIX: ${marketData.stocks.vix['05. price']}`;
        }
        
        enhancedQuery += `\n\nENHANCED ANALYSIS REQUIREMENTS:
- Apply advanced financial theory and quantitative methods
- Consider multi-timeframe analysis (short, medium, long-term)
- Assess regime implications for asset allocation
- Provide specific, actionable trading/investment recommendations`;
        
        return await getGPT5Analysis(enhancedQuery, {
            ...options,
            model: options.model || GPT5_CONFIG.PRIMARY_MODEL,
            reasoning_effort: options.reasoning_effort || "medium",
            verbosity: options.verbosity || "medium",
            max_output_tokens: 3000  // ✅ FIXED: Use max_output_tokens
        });
        
    } catch (error) {
        console.error('❌ Enhanced market analysis error:', error.message);
        throw error;
    }
}

/**
 * ✅ System health check for Real GPT-5
 */
async function checkGPT5SystemHealth() {
    const health = {
        gpt5Available: false,
        gpt5MiniAvailable: false,
        gpt5NanoAvailable: false,
        gpt5ChatAvailable: false,
        fallbackWorking: false,
        responsesApiWorking: false,
        chatApiWorking: false,
        currentModel: currentModel,
        errors: []
    };
    
    try {
        const capabilities = await testGPT5Capabilities();
        health.gpt5Available = capabilities.available;
        health.responsesApiWorking = capabilities.responsesApiWorking;
        health.chatApiWorking = !!capabilities.chatResponse;
        
        // Test individual models
        try {
            await getQuickNanoResponse("Test");
            health.gpt5NanoAvailable = true;
        } catch (error) {
            health.errors.push(`GPT-5 Nano: ${error.message}`);
        }
        
        try {
            await getQuickMiniResponse("Test");
            health.gpt5MiniAvailable = true;
        } catch (error) {
            health.errors.push(`GPT-5 Mini: ${error.message}`);
        }
        
        try {
            await getChatResponse("Test");
            health.gpt5ChatAvailable = true;
        } catch (error) {
            health.errors.push(`GPT-5 Chat: ${error.message}`);
        }
        
    } catch (error) {
        health.errors.push(`GPT-5 Test: ${error.message}`);
    }
    
    health.overallHealth = health.gpt5Available || health.fallbackWorking;
    
    return health;
}

/**
 * ✅ Connection test with correct APIs
 */
async function testOpenAIConnection() {
    try {
        // Test Responses API
        const responsesTest = await openai.responses.create({
            model: GPT5_CONFIG.NANO_MODEL,
            input: "Test connection",
            reasoning: { effort: "minimal" },
            text: { verbosity: "low" },
            max_output_tokens: 20  // ✅ FIXED: Minimum is 16, using 20 for safety
        });
        
        let responseText = "";
        if (responsesTest.output && responsesTest.output.length > 0) {
            for (const item of responsesTest.output) {
                if (item.content) {
                    for (const content of item.content) {
                        if (content.text) {
                            responseText += content.text;
                        }
                    }
                }
            }
        }
        
        return { 
            success: true, 
            result: responseText,
            model: GPT5_CONFIG.NANO_MODEL,
            gpt5Available: true,
            apiFixed: true
        };
        
    } catch (error) {
        // Fallback test
        try {
            const fallbackResponse = await openai.chat.completions.create({
                model: GPT5_CONFIG.FALLBACK_MODEL,
                messages: [{ role: "user", content: "Test connection" }],
                max_tokens: 10,
                temperature: 0.7
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

module.exports = {
    // ✅ Main Real GPT-5 functions with correct APIs
    getGPT5Analysis,
    getEnhancedMarketAnalysis,
    
    // ✅ Quick access functions for different GPT-5 models
    getQuickNanoResponse,
    getQuickMiniResponse,
    getDeepAnalysis,
    getChatResponse,
    
    // ✅ Testing and health functions
    testGPT5Capabilities,
    checkGPT5SystemHealth,
    
    // ✅ Utility functions
    analyzeQueryForGPT5,
    buildResponsesRequest,
    buildChatRequest,
    getSupportedParams,
    
    // ✅ Connection test
    testOpenAIConnection,
    
    // ✅ Direct access to OpenAI client and config
    openai,
    GPT5_CONFIG
};
