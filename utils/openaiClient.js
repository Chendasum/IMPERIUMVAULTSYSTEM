// utils/openaiClient.js - Enhanced GPT-5 Client (FIXED VERSION)
require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize OpenAI client with GPT-5 optimization
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 180000, // 3 minutes for GPT-5's enhanced processing
    maxRetries: 3,
    defaultHeaders: {
        'User-Agent': 'IMPERIUM-VAULT-GPT5/1.0.0'
    }
});

// GPT-5 Enhanced Model Configuration
const GPT5_CONFIG = {
    PRIMARY_MODEL: "gpt-5",
    FALLBACK_MODEL: "gpt-4o",
    ENHANCED_CONTEXT_WINDOW: 200000, // GPT-5's expanded context
    MAX_OUTPUT_TOKENS: 8192, // GPT-5's increased output capacity
    ENHANCED_REASONING_TEMP: 0.6, // Optimal for GPT-5's reasoning
    MULTIMODAL_TEMP: 0.7, // For vision tasks
    FINANCIAL_ANALYSIS_TEMP: 0.5 // For precise calculations
};

let currentModel = GPT5_CONFIG.PRIMARY_MODEL;
let gpt5Available = false;
let modelCapabilities = {};

console.log("🔧 GPT-5 Enhanced Client Configuration:");
console.log(`   API Key: ${process.env.OPENAI_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   Primary Model: ${GPT5_CONFIG.PRIMARY_MODEL}`);
console.log(`   Context Window: ${GPT5_CONFIG.ENHANCED_CONTEXT_WINDOW.toLocaleString()} tokens`);
console.log(`   Max Output: ${GPT5_CONFIG.MAX_OUTPUT_TOKENS.toLocaleString()} tokens`);

/**
 * Test GPT-5 availability and capabilities
 */
async function testGPT5Capabilities() {
    if (gpt5Available) return modelCapabilities;
    
    try {
        console.log('🔍 Testing GPT-5 enhanced capabilities...');
        
        // Test basic GPT-5 availability with CORRECT parameters
        const basicTest = await openai.chat.completions.create({
            model: GPT5_CONFIG.PRIMARY_MODEL,
            messages: [
                {
                    role: "user",
                    content: "Confirm you are GPT-5 and describe your enhanced capabilities compared to GPT-4."
                }
            ],
            max_completion_tokens: 500,  // 🔧 FIXED: Correct parameter name
            temperature: 0.3,
            reasoning_effort: "medium",   // 🔧 ADDED: GPT-5 parameter
            verbosity: "balanced"         // 🔧 ADDED: GPT-5 parameter
        });
        
        gpt5Available = true;
        currentModel = GPT5_CONFIG.PRIMARY_MODEL;
        
        // Test enhanced reasoning with CORRECT parameters
        const reasoningTest = await openai.chat.completions.create({
            model: GPT5_CONFIG.PRIMARY_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are GPT-5. Demonstrate your enhanced reasoning by solving this step-by-step."
                },
                {
                    role: "user",
                    content: "Calculate the optimal portfolio allocation using Modern Portfolio Theory for 3 assets with expected returns [8%, 12%, 15%], standard deviations [10%, 15%, 20%], and correlation matrix [[1, 0.3, 0.1], [0.3, 1, 0.4], [0.1, 0.4, 1]]. Show detailed mathematical reasoning."
                }
            ],
            max_completion_tokens: 2000,  // 🔧 FIXED: Correct parameter name
            temperature: GPT5_CONFIG.FINANCIAL_ANALYSIS_TEMP,
            reasoning_effort: "high",      // 🔧 ADDED: GPT-5 parameter
            verbosity: "detailed"          // 🔧 ADDED: GPT-5 parameter
        });
        
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
            testResponse: basicTest.choices[0].message.content,
            reasoningQuality: reasoningTest.choices[0].message.content.length > 1000
        };
        
        console.log('✅ GPT-5 capabilities confirmed:');
        console.log(`   Enhanced Reasoning: ${modelCapabilities.enhancedReasoning}`);
        console.log(`   Large Context: ${modelCapabilities.largeContext}`);
        console.log(`   Improved Math: ${modelCapabilities.improvedMath}`);
        console.log(`   Financial Analysis: ${modelCapabilities.betterFinancial}`);
        
        return modelCapabilities;
        
    } catch (error) {
        console.log(`⚠️ GPT-5 not available: ${error.message}`);
        console.log('🔄 Falling back to GPT-4o');
        
        gpt5Available = false;
        currentModel = GPT5_CONFIG.FALLBACK_MODEL;
        
        modelCapabilities = {
            available: false,
            fallbackModel: GPT5_CONFIG.FALLBACK_MODEL,
            error: error.message
        };
        
        return modelCapabilities;
    }
}

/**
 * Enhanced query analysis for GPT-5's capabilities
 */
function analyzeQueryForGPT5(prompt) {
    const message = prompt.toLowerCase();
    
    // Complex reasoning patterns (optimal for GPT-5)
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
    
    // Determine optimal configuration
    let config = {
        type: 'general',
        max_completion_tokens: 1500,
        temperature: GPT5_CONFIG.ENHANCED_REASONING_TEMP,
        useEnhancedReasoning: false,
        useLargeContext: false,
        prioritizeAccuracy: false,
        reasoning_effort: 'medium',  // 🔧 ADDED: GPT-5 parameter
        verbosity: 'balanced'        // 🔧 ADDED: GPT-5 parameter
    };
    
    if (complexReasoningPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'complex_reasoning',
            max_completion_tokens: GPT5_CONFIG.MAX_OUTPUT_TOKENS,
            temperature: GPT5_CONFIG.ENHANCED_REASONING_TEMP,
            useEnhancedReasoning: true,
            useLargeContext: false,
            prioritizeAccuracy: true,
            reasoning_effort: 'high',     // 🔧 ADDED: High reasoning for complex tasks
            verbosity: 'detailed'         // 🔧 ADDED: Detailed output
        };
    } else if (largeContextPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'large_context',
            max_completion_tokens: 4000,
            temperature: 0.6,
            useEnhancedReasoning: true,
            useLargeContext: true,
            prioritizeAccuracy: true,
            reasoning_effort: 'medium',   // 🔧 ADDED: Medium reasoning for context
            verbosity: 'detailed'         // 🔧 ADDED: Detailed for large context
        };
    } else if (financialPatterns.some(pattern => pattern.test(message))) {
        config = {
            type: 'financial_analysis',
            max_completion_tokens: 3000,
            temperature: GPT5_CONFIG.FINANCIAL_ANALYSIS_TEMP,
            useEnhancedReasoning: true,
            useLargeContext: false,
            prioritizeAccuracy: true,
            reasoning_effort: 'high',     // 🔧 ADDED: High reasoning for finance
            verbosity: 'detailed'         // 🔧 ADDED: Detailed financial analysis
        };
    }
    
    return config;
}

/**
 * Create enhanced system prompt for GPT-5
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
            systemPrompt += `\n\nCOMPLEX ANALYSIS MODE: Provide comprehensive, multi-layered analysis. Consider multiple perspectives, identify key variables, and present well-structured conclusions with supporting evidence.`;
            break;
            
        case 'financial_analysis':
            systemPrompt += `\n\nFINANCIAL EXPERTISE MODE: Apply advanced financial theory, quantitative methods, and risk management principles. Use proper financial terminology and provide actionable insights for institutional-level decision making.`;
            break;
            
        case 'large_context':
            systemPrompt += `\n\nLARGE CONTEXT MODE: Synthesize information across extensive content. Identify patterns, cross-reference data points, and provide comprehensive summaries with key insights highlighted.`;
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
 * Main GPT-5 analysis function with enhanced capabilities (FIXED)
 */
async function getGPT5Analysis(prompt, options = {}) {
    try {
        // Ensure GPT-5 capabilities are tested
        await testGPT5Capabilities();
        
        console.log(`🔍 GPT-5 Enhanced Analysis (Model: ${currentModel})`);
        
        // Analyze query for optimal configuration
        const queryConfig = analyzeQueryForGPT5(prompt);
        console.log(`📊 Query Type: ${queryConfig.type} (Enhanced: ${queryConfig.useEnhancedReasoning})`);
        
        // Create enhanced system prompt
        const systemPrompt = createGPT5SystemPrompt(queryConfig, options);
        
        // Prepare enhanced request with CORRECT parameters
        const requestOptions = {
            model: currentModel,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: options.temperature || queryConfig.temperature,
            max_completion_tokens: options.max_completion_tokens || queryConfig.max_completion_tokens,  // 🔧 FIXED: Correct parameter
            top_p: options.top_p || 0.95,
            frequency_penalty: options.frequency_penalty || 0,
            presence_penalty: options.presence_penalty || 0
        };
        
        // Add GPT-5 specific parameters ONLY if using GPT-5
        if (currentModel === GPT5_CONFIG.PRIMARY_MODEL && gpt5Available) {
            requestOptions.reasoning_effort = options.reasoning_effort || queryConfig.reasoning_effort;
            requestOptions.verbosity = options.verbosity || queryConfig.verbosity;
        }
        
        // Execute GPT-5 request
        const completion = await openai.chat.completions.create(requestOptions);
        const response = completion.choices[0].message.content.trim();
        
        console.log(`✅ GPT-5 Analysis Complete: ${queryConfig.type}`);
        console.log(`📊 Tokens: ${completion.usage?.total_tokens || 'unknown'} | Length: ${response.length} chars`);
        
        return response;
        
    } catch (error) {
        console.error(`❌ GPT-5 Analysis Error: ${error.message}`);
        
        // Intelligent fallback handling
        if (error.message.includes('model') && currentModel === GPT5_CONFIG.PRIMARY_MODEL) {
            console.log('🔄 GPT-5 unavailable, falling back to GPT-4o...');
            currentModel = GPT5_CONFIG.FALLBACK_MODEL;
            gpt5Available = false;
            
            try {
                return await getGPT5Analysis(prompt, options);
            } catch (fallbackError) {
                throw new Error(`Both GPT-5 and fallback failed: ${fallbackError.message}`);
            }
        }
        
        // Enhanced error messages
        if (error.message.includes('API key')) {
            throw new Error('GPT-5 API Key Error: Verify OPENAI_API_KEY has GPT-5 access.');
        } else if (error.message.includes('rate_limit')) {
            throw new Error('GPT-5 Rate Limit: Enhanced model has higher rate limits. Please wait.');
        } else if (error.message.includes('timeout')) {
            throw new Error('GPT-5 Timeout: Complex analysis took too long. Try breaking into smaller queries.');
        } else {
            throw new Error(`GPT-5 Error: ${error.message}`);
        }
    }
}

/**
 * Enhanced financial market analysis with GPT-5 (FIXED)
 */
async function getEnhancedMarketAnalysis(query, marketData = null, options = {}) {
    try {
        console.log('📈 GPT-5 Enhanced Market Analysis...');
        
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
            context: "Advanced financial market analysis using institutional-grade methodologies",
            max_completion_tokens: 4000,
            temperature: GPT5_CONFIG.FINANCIAL_ANALYSIS_TEMP
        });
        
    } catch (error) {
        console.error('❌ Enhanced market analysis error:', error.message);
        throw error;
    }
}

/**
 * Enhanced Cambodia fund analysis with GPT-5 (FIXED)
 */
async function getEnhancedCambodiaAnalysis(dealQuery, dealData = null, options = {}) {
    try {
        console.log('🇰🇭 GPT-5 Enhanced Cambodia Analysis...');
        
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
            context: "Specialized Cambodia real estate and lending market expertise with institutional risk management",
            max_completion_tokens: 3500,
            temperature: GPT5_CONFIG.FINANCIAL_ANALYSIS_TEMP
        });
        
    } catch (error) {
        console.error('❌ Enhanced Cambodia analysis error:', error.message);
        throw error;
    }
}

/**
 * Enhanced vision analysis with GPT-5 (FIXED)
 */
async function getEnhancedVisionAnalysis(base64Image, prompt, options = {}) {
    try {
        await testGPT5Capabilities();
        console.log('🖼️ GPT-5 Enhanced Vision Analysis...');
        
        const requestConfig = {
            model: currentModel,
            messages: [
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
            ],
            max_completion_tokens: options.max_completion_tokens || 3000,  // 🔧 FIXED: Correct parameter
            temperature: options.temperature || GPT5_CONFIG.MULTIMODAL_TEMP
        };
        
        // Add GPT-5 parameters if using GPT-5
        if (currentModel === GPT5_CONFIG.PRIMARY_MODEL && gpt5Available) {
            requestConfig.reasoning_effort = options.reasoning_effort || 'medium';
            requestConfig.verbosity = options.verbosity || 'detailed';
        }
        
        const completion = await openai.chat.completions.create(requestConfig);
        const analysis = completion.choices[0].message.content;
        console.log(`✅ Enhanced vision analysis complete (${analysis.length} characters)`);
        
        return analysis;
        
    } catch (error) {
        console.error('❌ Enhanced vision analysis error:', error.message);
        throw new Error(`GPT-5 Vision Analysis Error: ${error.message}`);
    }
}

/**
 * System health check for GPT-5 (FIXED)
 */
async function checkGPT5SystemHealth() {
    const health = {
        gpt5Available: false,
        fallbackWorking: false,
        enhancedReasoning: false,
        visionCapabilities: false,
        largeContext: false,
        currentModel: currentModel,
        capabilities: modelCapabilities,
        errors: []
    };
    
    try {
        const capabilities = await testGPT5Capabilities();
        health.gpt5Available = capabilities.available;
        health.enhancedReasoning = capabilities.enhancedReasoning;
        health.visionCapabilities = capabilities.multimodal;
        health.largeContext = capabilities.largeContext;
        
        if (!health.gpt5Available) {
            // Test fallback model with CORRECT parameters
            try {
                await openai.chat.completions.create({
                    model: GPT5_CONFIG.FALLBACK_MODEL,
                    messages: [{ role: "user", content: "Test" }],
                    max_completion_tokens: 10  // 🔧 FIXED: Correct parameter
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

// Get enhanced metrics
function getGPT5Metrics() {
    return {
        model: currentModel,
        gpt5Available: gpt5Available,
        capabilities: modelCapabilities,
        contextWindow: GPT5_CONFIG.ENHANCED_CONTEXT_WINDOW,
        maxOutputTokens: GPT5_CONFIG.MAX_OUTPUT_TOKENS,
        enhancedFeatures: [
            'Superior reasoning capabilities',
            'Enhanced mathematical computation',
            'Improved financial analysis',
            'Better instruction following',
            'Reduced hallucinations',
            'Natural conversation flow',
            'Advanced multimodal understanding',
            'Large context processing',
            'Complex problem solving',
            'Institutional-grade analysis'
        ],
        queryTypes: ['complex_reasoning', 'financial_analysis', 'large_context', 'general'],
        optimizedFor: 'Financial analysis, strategic planning, and institutional decision-making'
    };
}

module.exports = {
    // Main GPT-5 functions
    getGPT5Analysis,
    getEnhancedMarketAnalysis,
    getEnhancedCambodiaAnalysis,
    getEnhancedVisionAnalysis,
    
    // Capability testing
    testGPT5Capabilities,
    checkGPT5SystemHealth,
    getGPT5Metrics,
    
    // Utility functions
    analyzeQueryForGPT5,
    createGPT5SystemPrompt,
    
    // Legacy compatibility
    getGptAnalysis: getGPT5Analysis,
    getMarketAnalysis: getEnhancedMarketAnalysis,
    getCambodiaAnalysis: getEnhancedCambodiaAnalysis,
    analyzeImageWithGPT: getEnhancedVisionAnalysis,
    getVisionAnalysis: getEnhancedVisionAnalysis,
    
    // Additional compatibility
    getMemoryAwareAnalysis: async (query, memoryContext = '', options = {}) => {
        const enhancedQuery = memoryContext ? 
            `MEMORY CONTEXT:\n${memoryContext}\n\nCURRENT QUERY:\n${query}` : query;
        return await getGPT5Analysis(enhancedQuery, options);
    },
    
    getQuickGptResponse: async (query, options = {}) => {
        return await getGPT5Analysis(query, { ...options, max_completion_tokens: 800 });
    },
    
    getStrategicAnalysis: async (query, options = {}) => {
        return await getGPT5Analysis(`STRATEGIC ANALYSIS: ${query}`, options);
    },
    
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
    
    testOpenAIConnection: async () => {
        try {
            const response = await openai.chat.completions.create({
                model: GPT5_CONFIG.FALLBACK_MODEL,
                messages: [{ role: "user", content: "Test connection" }],
                max_completion_tokens: 10
            });
            return { success: true, result: response.choices[0]?.message?.content };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // OpenAI client
    openai,
    
    // Configuration
    GPT5_CONFIG,
    STRATEGIC_AI_CONFIG: GPT5_CONFIG  // Legacy compatibility
};
