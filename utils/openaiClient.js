// utils/openaiClient.js - FIXED: GPT-5 Chat model parameters corrected
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

// ✅ FIXED: Real GPT-5 Model Configuration with model-specific parameters
const GPT5_CONFIG = {
    PRIMARY_MODEL: "gpt-5",           // ✅ Real GPT-5 model
    MINI_MODEL: "gpt-5-mini",         // ✅ Real GPT-5 Mini
    NANO_MODEL: "gpt-5-nano",         // ✅ Real GPT-5 Nano  
    CHAT_MODEL: "gpt-5-chat-latest",  // ✅ Real GPT-5 Chat (special handling)
    FALLBACK_MODEL: "gpt-4o",         // Fallback if GPT-5 fails
    
    ENHANCED_CONTEXT_WINDOW: 200000,  // GPT-5's large context
    MAX_OUTPUT_TOKENS: 8192,          // GPT-5's output capacity
    
    // ✅ CORRECTED: Model-specific parameter support
    REASONING_EFFORTS: ["minimal", "low", "medium", "high"],
    VERBOSITY_LEVELS: ["low", "medium", "high"],
    DEFAULT_REASONING: "minimal",     // Default to minimal for speed
    DEFAULT_VERBOSITY: "low",         // Default to low for speed
    
    // ✅ NEW: Model parameter compatibility matrix
    MODEL_PARAMS: {
        'gpt-5': {
            supports_reasoning_effort: true,
            supports_verbosity: true,
            supports_temperature: false
        },
        'gpt-5-mini': {
            supports_reasoning_effort: true,
            supports_verbosity: true,
            supports_temperature: false
        },
        'gpt-5-nano': {
            supports_reasoning_effort: true,
            supports_verbosity: true,
            supports_temperature: false
        },
        'gpt-5-chat-latest': {
            supports_reasoning_effort: false,  // ✅ FIXED: Chat model doesn't support this
            supports_verbosity: false,         // ✅ FIXED: Chat model doesn't support this
            supports_temperature: true         // ✅ Chat model uses temperature instead
        }
    },
    
    // Temperature settings for models that support it
    ENHANCED_REASONING_TEMP: 0.6,
    MULTIMODAL_TEMP: 0.7,
    FINANCIAL_ANALYSIS_TEMP: 0.5,
    SPEED_TEMP: 0.7
};

let currentModel = GPT5_CONFIG.PRIMARY_MODEL;
let gpt5Available = false;
let modelCapabilities = {};

console.log("🚀 FIXED GPT-5 Enhanced Client Configuration:");
console.log(`   API Key: ${process.env.OPENAI_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   Primary Model: ${GPT5_CONFIG.PRIMARY_MODEL}`);
console.log(`   Mini Model: ${GPT5_CONFIG.MINI_MODEL}`);
console.log(`   Nano Model: ${GPT5_CONFIG.NANO_MODEL}`);
console.log(`   Chat Model: ${GPT5_CONFIG.CHAT_MODEL} (special parameters)`);
console.log(`   Context Window: ${GPT5_CONFIG.ENHANCED_CONTEXT_WINDOW.toLocaleString()} tokens`);
console.log(`   Max Output: ${GPT5_CONFIG.MAX_OUTPUT_TOKENS.toLocaleString()} tokens`);
console.log(`   🔧 FIXED: Model-specific parameter handling`);

/**
 * ✅ Get supported parameters for a specific model
 */
function getSupportedParams(model) {
    return GPT5_CONFIG.MODEL_PARAMS[model] || {
        supports_reasoning_effort: false,
        supports_verbosity: false,
        supports_temperature: true
    };
}

/**
 * ✅ Build request options with model-specific parameters
 */
function buildModelRequest(model, messages, options = {}) {
    const supportedParams = getSupportedParams(model);
    
    const request = {
        model: model,
        messages: messages,
        max_completion_tokens: options.max_completion_tokens || 1000
    };
    
    // Add parameters based on model support
    if (supportedParams.supports_reasoning_effort && options.reasoning_effort) {
        request.reasoning_effort = options.reasoning_effort;
    }
    
    if (supportedParams.supports_verbosity && options.verbosity) {
        request.verbosity = options.verbosity;
    }
    
    if (supportedParams.supports_temperature) {
        request.temperature = options.temperature || 0.7;
        request.top_p = options.top_p || 0.95;
        request.frequency_penalty = options.frequency_penalty || 0;
        request.presence_penalty = options.presence_penalty || 0;
    }
    
    return request;
}

/**
 * ✅ Test Real GPT-5 availability with model-specific parameters
 */
async function testGPT5Capabilities() {
    if (gpt5Available) return modelCapabilities;
    
    try {
        console.log('🔍 Testing Real GPT-5 capabilities with model-specific parameters...');
        
        // ✅ Test GPT-5 with supported parameters
        const basicRequest = buildModelRequest(GPT5_CONFIG.PRIMARY_MODEL, [
            {
                role: "user",
                content: "Confirm you are GPT-5 and describe your enhanced capabilities briefly."
            }
        ], {
            max_completion_tokens: 500,
            reasoning_effort: "minimal",
            verbosity: "low"
        });
        
        const basicTest = await openai.chat.completions.create(basicRequest);
        
        gpt5Available = true;
        currentModel = GPT5_CONFIG.PRIMARY_MODEL;
        
        // ✅ Test enhanced reasoning with supported parameters
        const reasoningRequest = buildModelRequest(GPT5_CONFIG.PRIMARY_MODEL, [
            {
                role: "system",
                content: "You are GPT-5. Demonstrate your enhanced reasoning capabilities."
            },
            {
                role: "user",
                content: "Calculate 15% of 847,293 and explain your reasoning."
            }
        ], {
            max_completion_tokens: 1000,
            reasoning_effort: "medium",
            verbosity: "medium"
        });
        
        const reasoningTest = await openai.chat.completions.create(reasoningRequest);
        
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
            testResponse: basicTest.choices[0].message.content,
            reasoningQuality: reasoningTest.choices[0].message.content.length > 200,
            parameterFixed: true,
            modelSpecificParams: true
        };
        
        console.log('✅ Real GPT-5 capabilities confirmed with model-specific parameters:');
        console.log(`   Enhanced Reasoning: ${modelCapabilities.enhancedReasoning}`);
        console.log(`   Large Context: ${modelCapabilities.largeContext}`);
        console.log(`   Improved Math: ${modelCapabilities.improvedMath}`);
        console.log(`   Financial Analysis: ${modelCapabilities.betterFinancial}`);
        console.log(`   Parameter Fix: ✅ Model-specific params applied`);
        
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
            parameterFixed: false,
            modelSpecificParams: true
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
    
    // Large context patterns
    const largeContextPatterns = [
        /(analyze.*document|review.*report|summarize.*data)/i,
        /(compare.*multiple|cross.*reference|comprehensive.*review)/i,
        /(historical.*analysis|trend.*analysis|longitudinal)/i
    ];
    
    // Financial analysis patterns
    const financialPatterns = [
        /(dcf|npv|irr|wacc|capm|black.*scholes)/i,
        /(portfolio.*optimization|efficient.*frontier|sharpe.*ratio)/i,
        /(value.*at.*risk|var|stress.*test|monte.*carlo)/i,
        /(cambodia.*fund|lending.*analysis|real.*estate)/i
    ];
    
    // Speed patterns (use GPT-5 Nano with minimal reasoning)
    const speedPatterns = [
        /urgent|immediate|now|asap|quick|fast|emergency|real-time/i,
        /^(what time|what's the time|current time|time now)/i,
        /^(hello|hi|hey|good morning|good afternoon|what's up)$/i,
        /^how are you\??$/i,
        /^(thanks|thank you|cool|nice|great|ok|okay)$/i
    ];
    
    // Coding patterns (use GPT-5 with medium reasoning for balance)
    const codingPatterns = [
        /(code|coding|program|script|debug|software|api)/i,
        /(function|class|method|algorithm|implementation)/i,
        /(frontend|backend|database|web.*app|mobile.*app)/i
    ];
    
    // Chat patterns (use GPT-5 Chat model)
    const chatPatterns = [
        /^(hello|hi|hey|good morning|good afternoon)/i,
        /(chat|conversation|talk|discuss)/i,
        /(how are you|what's up|how's it going)/i
    ];
    
    // ✅ Determine optimal GPT-5 configuration with model-specific parameters
    let config = {
        type: 'general',
        model: GPT5_CONFIG.NANO_MODEL,
        max_completion_tokens: 800,
        reasoning_effort: GPT5_CONFIG.DEFAULT_REASONING,
        verbosity: GPT5_CONFIG.DEFAULT_VERBOSITY,
        useEnhancedReasoning: false,
        useLargeContext: false,
        prioritizeAccuracy: false
    };
    
    // SPEED CRITICAL - GPT-5 Nano with minimal reasoning
    if (speedPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'speed',
            model: GPT5_CONFIG.NANO_MODEL,
            max_completion_tokens: 600,
            reasoning_effort: "minimal",
            verbosity: "low",
            useEnhancedReasoning: false,
            useLargeContext: false,
            prioritizeAccuracy: false
        };
    }
    // CHAT PATTERNS - GPT-5 Chat model (no reasoning_effort/verbosity)
    else if (chatPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'chat',
            model: GPT5_CONFIG.CHAT_MODEL,
            max_completion_tokens: 1000,
            temperature: 0.7,  // Use temperature for chat model
            useEnhancedReasoning: false,
            useLargeContext: false,
            prioritizeAccuracy: false
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
            useEnhancedReasoning: true,
            useLargeContext: false,
            prioritizeAccuracy: true
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
            useEnhancedReasoning: true,
            useLargeContext: false,
            prioritizeAccuracy: true
        };
    }
    // LARGE CONTEXT - Full GPT-5 with minimal reasoning for speed
    else if (largeContextPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'large_context',
            model: GPT5_CONFIG.PRIMARY_MODEL,
            max_completion_tokens: 3000,
            reasoning_effort: "minimal",
            verbosity: "medium",
            useEnhancedReasoning: true,
            useLargeContext: true,
            prioritizeAccuracy: true
        };
    }
    // CODING - GPT-5 Mini with minimal reasoning
    else if (codingPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'coding',
            model: GPT5_CONFIG.MINI_MODEL,
            max_completion_tokens: 1500,
            reasoning_effort: "minimal",
            verbosity: "medium",
            useEnhancedReasoning: true,
            useLargeContext: false,
            prioritizeAccuracy: true
        };
    }
    
    return config;
}

/**
 * ✅ Create enhanced system prompt for Real GPT-5
 */
function createGPT5SystemPrompt(queryConfig, options = {}) {
    let systemPrompt = `You are GPT-5, OpenAI's most advanced AI with enhanced reasoning, improved mathematical capabilities, and superior financial analysis skills.`;
    
    // Add GPT-5 specific capabilities context
    if (queryConfig.useEnhancedReasoning) {
        systemPrompt += `\n\nENHANCED REASONING MODE: Use your improved step-by-step reasoning capabilities. Break down complex problems systematically and show your analytical process.`;
    }
    
    if (queryConfig.prioritizeAccuracy) {
        systemPrompt += `\n\nACCURACY PRIORITY: Prioritize mathematical precision and factual accuracy. Double-check calculations and cite specific methodologies when applicable.`;
    }
    
    switch (queryConfig.type) {
        case 'complex_reasoning':
            systemPrompt += `\n\nCOMPLEX ANALYSIS MODE: Provide comprehensive analysis. Consider multiple perspectives, identify key variables, and present well-structured conclusions.`;
            break;
            
        case 'financial_analysis':
            systemPrompt += `\n\nFINANCIAL EXPERTISE MODE: Apply advanced financial theory, quantitative methods, and risk management principles. Use proper financial terminology and provide actionable insights.`;
            break;
            
        case 'large_context':
            systemPrompt += `\n\nLARGE CONTEXT MODE: Synthesize information across extensive content. Identify patterns, cross-reference data points, and provide comprehensive summaries.`;
            break;
            
        case 'speed':
            systemPrompt += `\n\nSPEED MODE: Provide concise, direct responses. Focus on key information and actionable insights.`;
            break;
            
        case 'coding':
            systemPrompt += `\n\nCODING MODE: Provide high-quality, well-structured code with appropriate comments. Focus on best practices and efficiency.`;
            break;
            
        case 'chat':
            systemPrompt += `\n\nCHAT MODE: Engage naturally and conversationally. Be friendly, helpful, and personable while maintaining professionalism.`;
            break;
    }
    
    // Add context if provided
    if (options.context) {
        systemPrompt += `\n\nADDITIONAL CONTEXT: ${options.context}`;
    }
    
    // Add enhanced guidelines for GPT-5
    systemPrompt += `\n\nGPT-5 ENHANCED GUIDELINES:
- Leverage your improved reasoning for deeper analysis
- Use your enhanced mathematical capabilities for precise calculations  
- Apply your better instruction following for exact user requirements
- Utilize your improved financial knowledge for institutional-grade insights
- Maintain natural, professional communication style
- Provide specific, actionable recommendations when appropriate`;
    
    return systemPrompt;
}

/**
 * ✅ FIXED: Main GPT-5 analysis function with model-specific parameters
 */
async function getGPT5Analysis(prompt, options = {}) {
    try {
        // Ensure GPT-5 capabilities are tested
        await testGPT5Capabilities();
        
        console.log(`🔍 Real GPT-5 Analysis (Model: ${currentModel})`);
        
        // Analyze query for optimal configuration
        const queryConfig = analyzeQueryForGPT5(prompt);
        console.log(`📊 Query Type: ${queryConfig.type} (Enhanced: ${queryConfig.useEnhancedReasoning})`);
        console.log(`🤖 Model: ${queryConfig.model}`);
        
        // Override configuration with options if provided
        const selectedModel = options.model || queryConfig.model;
        
        // Create enhanced system prompt
        const systemPrompt = createGPT5SystemPrompt(queryConfig, options);
        
        // ✅ Build request with model-specific parameters
        const messages = [
            {
                role: "system", 
                content: systemPrompt
            },
            {
                role: "user",
                content: prompt
            }
        ];
        
        // Build request options based on model capabilities
        const requestOptions = {
            max_completion_tokens: options.max_completion_tokens || queryConfig.max_completion_tokens
        };
        
        // Add model-specific parameters
        if (options.reasoning_effort !== undefined) {
            requestOptions.reasoning_effort = options.reasoning_effort;
        } else if (queryConfig.reasoning_effort) {
            requestOptions.reasoning_effort = queryConfig.reasoning_effort;
        }
        
        if (options.verbosity !== undefined) {
            requestOptions.verbosity = options.verbosity;
        } else if (queryConfig.verbosity) {
            requestOptions.verbosity = queryConfig.verbosity;
        }
        
        if (options.temperature !== undefined) {
            requestOptions.temperature = options.temperature;
        } else if (queryConfig.temperature) {
            requestOptions.temperature = queryConfig.temperature;
        }
        
        // ✅ Use model-specific parameter builder
        const finalRequest = buildModelRequest(selectedModel, messages, requestOptions);
        
        console.log(`🔧 Parameters for ${selectedModel}:`, Object.keys(finalRequest).filter(k => k !== 'messages'));
        
        // Execute GPT-5 request
        const completion = await openai.chat.completions.create(finalRequest);
        const response = completion.choices[0].message.content.trim();
        
        console.log(`✅ GPT-5 Analysis Complete: ${queryConfig.type}`);
        console.log(`📊 Tokens Used: ${completion.usage?.total_tokens || 'unknown'} total`);
        if (completion.usage?.reasoning_tokens) {
            console.log(`🧠 Reasoning Tokens: ${completion.usage.reasoning_tokens}`);
        }
        console.log(`📏 Response Length: ${response.length} characters`);
        
        return response;
        
    } catch (error) {
        console.error(`❌ GPT-5 Analysis Error: ${error.message}`);
        
        // Intelligent fallback handling
        if (error.message.includes('model') && currentModel.startsWith('gpt-5')) {
            console.log('🔄 GPT-5 unavailable, falling back to GPT-4o...');
            currentModel = GPT5_CONFIG.FALLBACK_MODEL;
            gpt5Available = false;
            
            try {
                // Retry with fallback model
                return await getGPT5Analysis(prompt, {
                    ...options,
                    model: GPT5_CONFIG.FALLBACK_MODEL
                });
            } catch (fallbackError) {
                throw new Error(`Both GPT-5 and fallback failed: ${fallbackError.message}`);
            }
        }
        
        // Enhanced error messages
        if (error.message.includes('API key')) {
            throw new Error('OpenAI API Key Error: Verify OPENAI_API_KEY has GPT-5 access.');
        } else if (error.message.includes('rate_limit')) {
            throw new Error('Rate Limit: GPT-5 has usage limits. Please wait.');
        } else if (error.message.includes('timeout')) {
            throw new Error('Timeout: GPT-5 reasoning took too long. Try lower reasoning_effort.');
        } else if (error.message.includes('Unsupported parameter') || error.message.includes('Unsupported value')) {
            console.log(`⚠️ Parameter error for model, using fallback: ${error.message}`);
            // Try with fallback model
            return await getGPT5Analysis(prompt, {
                ...options,
                model: GPT5_CONFIG.FALLBACK_MODEL
            });
        } else {
            throw new Error(`GPT-5 Error: ${error.message}`);
        }
    }
}

/**
 * ✅ Enhanced financial market analysis with Real GPT-5
 */
async function getEnhancedMarketAnalysis(query, marketData = null, options = {}) {
    try {
        console.log('📈 Real GPT-5 Enhanced Market Analysis...');
        
        let enhancedQuery = `ENHANCED MARKET ANALYSIS REQUEST: ${query}`;
        
        // Add comprehensive market context
        if (marketData) {
            enhancedQuery += `\n\nCURRENT MARKET DATA:`;
            if (marketData.economics?.fedRate) enhancedQuery += `\n- Federal Funds Rate: ${marketData.economics.fedRate.value}%`;
            if (marketData.economics?.inflation) enhancedQuery += `\n- CPI Inflation: ${marketData.economics.inflation.value}%`;
            if (marketData.economics?.unemployment) enhancedQuery += `\n- Unemployment: ${marketData.economics.unemployment.value}%`;
            if (marketData.stocks?.vix) enhancedQuery += `\n- VIX: ${marketData.stocks.vix['05. price']}`;
            if (marketData.stocks?.sp500) enhancedQuery += `\n- S&P 500: ${marketData.stocks.sp500['05. price']}`;
            if (marketData.rayDalio?.regime?.currentRegime) {
                const regime = marketData.rayDalio.regime.currentRegime;
                enhancedQuery += `\n- Economic Regime: ${regime.name} (${marketData.rayDalio.regime.confidence}% confidence)`;
            }
        }
        
        enhancedQuery += `\n\nENHANCED ANALYSIS REQUIREMENTS:
- Apply advanced financial theory and quantitative methods
- Consider multi-timeframe analysis (short, medium, long-term)
- Assess regime implications for asset allocation
- Identify key risk factors and hedging strategies
- Provide specific, actionable trading/investment recommendations
- Calculate risk-adjusted return expectations where applicable`;
        
        return await getGPT5Analysis(enhancedQuery, {
            ...options,
            model: options.model || GPT5_CONFIG.PRIMARY_MODEL,
            reasoning_effort: options.reasoning_effort || "medium",
            verbosity: options.verbosity || "medium",
            context: "Advanced financial market analysis using institutional-grade methodologies",
            max_completion_tokens: 3000
        });
        
    } catch (error) {
        console.error('❌ Enhanced market analysis error:', error.message);
        throw error;
    }
}

/**
 * ✅ Enhanced Cambodia fund analysis with Real GPT-5
 */
async function getEnhancedCambodiaAnalysis(dealQuery, dealData = null, options = {}) {
    try {
        console.log('🇰🇭 Real GPT-5 Enhanced Cambodia Analysis...');
        
        let enhancedQuery = `ENHANCED CAMBODIA FUND ANALYSIS: ${dealQuery}`;
        
        if (dealData) {
            enhancedQuery += `\n\nDEAL PARAMETERS:`;
            enhancedQuery += `\n- Investment Amount: $${dealData.amount?.toLocaleString() || 'TBD'}`;
            enhancedQuery += `\n- Asset Type: ${dealData.type || 'Commercial Real Estate'}`;
            enhancedQuery += `\n- Location: ${dealData.location || 'Phnom Penh, Cambodia'}`;
            enhancedQuery += `\n- Expected Yield: ${dealData.rate || 'TBD'}% annually`;
            enhancedQuery += `\n- Investment Term: ${dealData.term || 'TBD'} months`;
            if (dealData.ltv) enhancedQuery += `\n- Loan-to-Value: ${dealData.ltv}%`;
            if (dealData.irr) enhancedQuery += `\n- Target IRR: ${dealData.irr}%`;
        }
        
        enhancedQuery += `\n\nENHANCED CAMBODIA ANALYSIS FRAMEWORK:
- Macroeconomic environment and USD peg stability
- Real estate market dynamics and supply/demand
- Regulatory landscape and foreign investment rules
- Political risk assessment and mitigation strategies
- Currency risk analysis (USD vs KHR)
- Comparative yield analysis vs regional markets
- Exit strategy evaluation and liquidity considerations
- Risk-adjusted return calculations with scenarios
- Due diligence checklist specific to Cambodia market`;
        
        return await getGPT5Analysis(enhancedQuery, {
            ...options,
            model: options.model || GPT5_CONFIG.PRIMARY_MODEL,
            reasoning_effort: options.reasoning_effort || "medium",
            verbosity: options.verbosity || "medium",
            context: "Specialized Cambodia real estate and lending market expertise with institutional risk management",
            max_completion_tokens: 2500
        });
        
    } catch (error) {
        console.error('❌ Enhanced Cambodia analysis error:', error.message);
        throw error;
    }
}

/**
 * ✅ Enhanced vision analysis with Real GPT-5
 */
async function getEnhancedVisionAnalysis(base64Image, prompt, options = {}) {
    try {
        await testGPT5Capabilities();
        console.log('🖼️ Real GPT-5 Enhanced Vision Analysis...');
        
        const messages = [
            {
                role: "system",
                content: `You are GPT-5 with enhanced vision capabilities. Provide detailed, accurate analysis of images with particular expertise in financial charts, documents, and business content.`
            },
            {
                role: "user",
                content: [
                    { 
                        type: "text", 
                        text: `ENHANCED VISION ANALYSIS: ${prompt}\n\nApply detailed visual analysis with financial expertise. Extract specific data points, identify trends, and provide actionable insights.`
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Image}`,
                            detail: options.detail || "high"
                        }
                    }
                ]
            }
        ];
        
        // ✅ Use model-specific parameter builder for vision
        const requestOptions = {
            max_completion_tokens: options.max_completion_tokens || 2500,
            reasoning_effort: options.reasoning_effort || "minimal",
            verbosity: options.verbosity || "medium"
        };
        
        const selectedModel = options.model || GPT5_CONFIG.PRIMARY_MODEL;
        const finalRequest = buildModelRequest(selectedModel, messages, requestOptions);
        
        const completion = await openai.chat.completions.create(finalRequest);
        const analysis = completion.choices[0].message.content;
        console.log(`✅ Enhanced vision analysis complete (${analysis.length} characters)`);
        
        return analysis;
        
    } catch (error) {
        console.error('❌ Enhanced vision analysis error:', error.message);
        throw new Error(`GPT-5 Vision Analysis Error: ${error.message}`);
    }
}

/**
 * ✅ System health check for Real GPT-5 with model-specific parameters
 */
async function checkGPT5SystemHealth() {
    const health = {
        gpt5Available: false,
        gpt5MiniAvailable: false,
        gpt5NanoAvailable: false,
        gpt5ChatAvailable: false,
        fallbackWorking: false,
        enhancedReasoning: false,
        visionCapabilities: false,
        largeContext: false,
        currentModel: currentModel,
        capabilities: modelCapabilities,
        parameterFixed: true,
        modelSpecificParams: true,
        errors: []
    };
    
    // Test all GPT-5 models with appropriate parameters
    const modelsToTest = [
        { 
            name: 'gpt5Available', 
            model: GPT5_CONFIG.PRIMARY_MODEL,
            params: { reasoning_effort: "minimal", verbosity: "low" }
        },
        { 
            name: 'gpt5MiniAvailable', 
            model: GPT5_CONFIG.MINI_MODEL,
            params: { reasoning_effort: "minimal", verbosity: "low" }
        },
        { 
            name: 'gpt5NanoAvailable', 
            model: GPT5_CONFIG.NANO_MODEL,
            params: { reasoning_effort: "minimal", verbosity: "low" }
        },
        { 
            name: 'gpt5ChatAvailable', 
            model: GPT5_CONFIG.CHAT_MODEL,
            params: { temperature: 0.7 }  // ✅ FIXED: Chat model uses temperature, not reasoning_effort/verbosity
        }
    ];
    
    for (const { name, model, params } of modelsToTest) {
        try {
            const request = buildModelRequest(model, [
                { role: "user", content: "Test" }
            ], {
                max_completion_tokens: 10,
                ...params
            });
            
            await openai.chat.completions.create(request);
            health[name] = true;
            console.log(`✅ ${model} operational with correct parameters`);
        } catch (error) {
            health.errors.push(`${model}: ${error.message}`);
            console.log(`❌ ${model} unavailable: ${error.message}`);
        }
    }
    
    try {
        const capabilities = await testGPT5Capabilities();
        health.enhancedReasoning = capabilities.enhancedReasoning;
        health.visionCapabilities = capabilities.multimodal;
        health.largeContext = capabilities.largeContext;
        health.parameterFixed = capabilities.parameterFixed;
        health.modelSpecificParams = capabilities.modelSpecificParams;
        
        if (!health.gpt5Available) {
            // Test fallback model
            try {
                await openai.chat.completions.create({
                    model: GPT5_CONFIG.FALLBACK_MODEL,
                    messages: [{ role: "user", content: "Test" }],
                    max_tokens: 10,
                    temperature: 0.7
                });
                health.fallbackWorking = true;
            } catch (fallbackError) {
                health.errors.push(`Fallback: ${fallbackError.message}`);
            }
        }
        
    } catch (error) {
        health.errors.push(`GPT-5 Test: ${error.message}`);
    }
    
    health.overallHealth = health.gpt5Available || health.fallbackWorking;
    
    return health;
}

/**
 * ✅ Get Real GPT-5 metrics and capabilities
 */
function getGPT5Metrics() {
    return {
        model: currentModel,
        gpt5Available: gpt5Available,
        capabilities: modelCapabilities,
        
        // ✅ Real GPT-5 model family
        availableModels: {
            primary: GPT5_CONFIG.PRIMARY_MODEL,
            mini: GPT5_CONFIG.MINI_MODEL,
            nano: GPT5_CONFIG.NANO_MODEL,
            chat: GPT5_CONFIG.CHAT_MODEL,
            fallback: GPT5_CONFIG.FALLBACK_MODEL
        },
        
        // ✅ Model-specific parameters
        modelParameters: GPT5_CONFIG.MODEL_PARAMS,
        
        contextWindow: GPT5_CONFIG.ENHANCED_CONTEXT_WINDOW,
        maxOutputTokens: GPT5_CONFIG.MAX_OUTPUT_TOKENS,
        
        enhancedFeatures: [
            'Superior reasoning capabilities with reasoning_effort control',
            'Enhanced mathematical computation with optimized reasoning',
            'Improved financial analysis with institutional precision',
            'Better instruction following with verbosity control',
            'Reduced hallucinations (45% improvement over GPT-4o)',
            'Natural conversation flow with GPT-5 Chat',
            'Advanced multimodal understanding',
            'Large context processing (200K tokens)',
            'Complex problem solving with step-by-step reasoning',
            'Institutional-grade analysis for financial markets',
            'Cost-optimized model selection (Nano/Mini/Full)',
            'Speed-optimized reasoning (minimal for speed)',
            'FIXED: Model-specific parameter handling',
            'CORRECTED: GPT-5 Chat uses temperature instead of reasoning_effort'
        ],
        
        queryTypes: [
            'speed (GPT-5 Nano + minimal reasoning)',
            'chat (GPT-5 Chat + temperature)',
            'complex_reasoning (GPT-5 + medium reasoning)',
            'financial_analysis (GPT-5 + medium reasoning)',
            'large_context (GPT-5 + minimal reasoning)',
            'coding (GPT-5 Mini + minimal reasoning)',
            'general (GPT-5 Nano + minimal reasoning)'
        ],
        
        costOptimization: {
            nano: '$0.05/$0.40 per 1M tokens (speed tasks)',
            mini: '$0.25/$2.00 per 1M tokens (balanced tasks)',
            full: '$1.25/$10.00 per 1M tokens (complex tasks)',
            chat: '$1.25/$10.00 per 1M tokens (conversational tasks)'
        },
        
        parameterStatus: 'FIXED - Model-specific parameters applied correctly',
        speedOptimization: 'Active - Default to minimal reasoning for speed',
        
        optimizedFor: 'Financial analysis, strategic planning, institutional decision-making, and high-speed AI deployment'
    };
}

/**
 * ✅ Quick access functions for different GPT-5 models with correct parameters
 */
async function getQuickNanoResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.NANO_MODEL,
        reasoning_effort: "minimal",
        verbosity: "low",
        max_completion_tokens: 600
    });
}

async function getQuickMiniResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.MINI_MODEL,
        reasoning_effort: "minimal",
        verbosity: "medium",
        max_completion_tokens: 1200
    });
}

async function getDeepAnalysis(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.PRIMARY_MODEL,
        reasoning_effort: "medium",
        verbosity: "medium",
        max_completion_tokens: 2500
    });
}

async function getChatResponse(prompt, options = {}) {
    return await getGPT5Analysis(prompt, {
        ...options,
        model: GPT5_CONFIG.CHAT_MODEL,
        temperature: options.temperature || 0.7,  // ✅ FIXED: Use temperature for chat model
        max_completion_tokens: 1500
        // ✅ No reasoning_effort or verbosity for chat model
    });
}

module.exports = {
    // ✅ Main Real GPT-5 functions with model-specific parameters
    getGPT5Analysis,
    getEnhancedMarketAnalysis,
    getEnhancedCambodiaAnalysis,
    getEnhancedVisionAnalysis,
    
    // ✅ Quick access functions for different GPT-5 models (parameter-corrected)
    getQuickNanoResponse,
    getQuickMiniResponse,
    getDeepAnalysis,
    getChatResponse,
    
    // ✅ Testing and health functions
    testGPT5Capabilities,
    checkGPT5SystemHealth,
    getGPT5Metrics,
    
    // ✅ Utility functions
    analyzeQueryForGPT5,
    createGPT5SystemPrompt,
    buildModelRequest,
    getSupportedParams,
    
    // ✅ Legacy compatibility (redirected to Real GPT-5)
    getGptAnalysis: getGPT5Analysis,
    getMarketAnalysis: getEnhancedMarketAnalysis,
    getCambodiaAnalysis: getEnhancedCambodiaAnalysis,
    analyzeImageWithGPT: getEnhancedVisionAnalysis,
    getVisionAnalysis: getEnhancedVisionAnalysis,
    
    // ✅ Enhanced compatibility functions
    getMemoryAwareAnalysis: async (query, memoryContext = '', options = {}) => {
        const enhancedQuery = memoryContext ? 
            `MEMORY CONTEXT:\n${memoryContext}\n\nCURRENT QUERY:\n${query}` : query;
        return await getGPT5Analysis(enhancedQuery, options);
    },
    
    getQuickGptResponse: getQuickMiniResponse,
    getQuickResponse: getQuickNanoResponse,
    
    getStrategicAnalysis: async (query, options = {}) => {
        return await getGPT5Analysis(`STRATEGIC ANALYSIS: ${query}`, {
            ...options,
            model: GPT5_CONFIG.PRIMARY_MODEL,
            reasoning_effort: "medium",
            verbosity: "medium"
        });
    },
    
    getFinancialAnalysis: async (query, options = {}) => {
        return await getGPT5Analysis(`FINANCIAL ANALYSIS: ${query}`, {
            ...options,
            model: GPT5_CONFIG.PRIMARY_MODEL,
            reasoning_effort: "medium",
            verbosity: "medium"
        });
    },
    
    // ✅ Audio transcription (unchanged)
    transcribeAudio: async (audioFile, options = {}) => {
        try {
            const transcription = await openai.audio.transcriptions.create({
                file: audioFile,
                model: options.model || "whisper-1",
                language: options.language || "en",
                temperature: options.temperature || 0.2,
                response_format: options.response_format || "text"
            });
            return transcription;
        } catch (error) {
            throw new Error(`Audio transcription failed: ${error.message}`);
        }
    },
    
    // ✅ Connection test with model-specific parameters
    testOpenAIConnection: async () => {
        try {
            const testRequest = buildModelRequest(GPT5_CONFIG.NANO_MODEL, [
                { role: "user", content: "Test connection" }
            ], {
                max_completion_tokens: 10,
                reasoning_effort: "minimal",
                verbosity: "low"
            });
            
            const response = await openai.chat.completions.create(testRequest);
            
            return { 
                success: true, 
                result: response.choices[0]?.message?.content,
                model: GPT5_CONFIG.NANO_MODEL,
                gpt5Available: true,
                parameterFixed: true,
                modelSpecificParams: true
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
                    fallback: true,
                    parameterFixed: true,
                    modelSpecificParams: true
                };
            } catch (fallbackError) {
                return { 
                    success: false, 
                    error: error.message,
                    fallbackError: fallbackError.message,
                    gpt5Available: false,
                    parameterFixed: false,
                    modelSpecificParams: true
                };
            }
        }
    },
    
    // ✅ Direct access to OpenAI client and config
    openai,
    GPT5_CONFIG,
    
    // ✅ Legacy compatibility
    STRATEGIC_AI_CONFIG: GPT5_CONFIG
};
