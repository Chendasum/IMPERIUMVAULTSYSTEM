// 🔧 FIXED: utils/openaiClient.js - GPT-5 Compatible with Working Parameters
// Enhanced Strategic Commander OpenAI Client for IMPERIUM VAULT SYSTEM

require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize OpenAI client with enhanced configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 180000, // 3 minutes for complex analysis
    maxRetries: 3,
    defaultHeaders: {
        'User-Agent': 'IMPERIUM-VAULT-STRATEGIC-AI/3.4.0'
    }
});

// 🚀 FIXED: Strategic AI Configuration - GPT-5 Ready
const STRATEGIC_AI_CONFIG = {
    // Model Configuration
    PRIMARY_MODEL: "gpt-5",                    // 🚀 GPT-5 when available
    FALLBACK_MODEL: "gpt-4o",                  // Reliable fallback
    VISION_MODEL: "gpt-5",                     // Vision with GPT-5
    MINI_MODEL: "gpt-5-mini",                  // Cost-effective
    
    // Enhanced Capabilities
    ENHANCED_CONTEXT_WINDOW: 200000,          // GPT-5 context
    MAX_OUTPUT_TOKENS: 8192,                  // GPT-5 output
    
    // Temperature Settings
    STRATEGIC_ANALYSIS_TEMP: 0.6,
    FINANCIAL_ANALYSIS_TEMP: 0.5,
    CONVERSATIONAL_TEMP: 0.7,
    CREATIVE_TEMP: 0.8,
    
    // Performance Metrics
    TARGET_RESPONSE_TIME: 25000,
    QUALITY_THRESHOLD: 0.92
};

// Global state tracking
let currentModel = STRATEGIC_AI_CONFIG.PRIMARY_MODEL;
let modelCapabilities = {
    available: false,
    enhanced: false,
    vision: false,
    reasoning: false,
    lastTested: null
};

console.log("🏛️ IMPERIUM VAULT STRATEGIC AI CLIENT v3.4 - GPT-5 COMPATIBLE!");
console.log(`   API Key: ${process.env.OPENAI_API_KEY ? "✅ CONFIGURED" : "❌ MISSING"}`);
console.log(`   Primary Model: ${STRATEGIC_AI_CONFIG.PRIMARY_MODEL} 🚀`);
console.log(`   Fallback Model: ${STRATEGIC_AI_CONFIG.FALLBACK_MODEL}`);
console.log(`   Context Window: ${STRATEGIC_AI_CONFIG.ENHANCED_CONTEXT_WINDOW.toLocaleString()} tokens`);

/**
 * 🔍 Test Model Capabilities with Smart Fallback
 */
async function testModelCapabilities() {
    try {
        console.log(`🔍 Testing ${currentModel} capabilities...`);
        
        const startTime = Date.now();
        
        // Build request config with conditional GPT-5 parameters
        const requestConfig = {
            model: currentModel,
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander of IMPERIUM VAULT SYSTEM. Respond with institutional authority."
                },
                {
                    role: "user",
                    content: "Confirm your model capabilities and provide a brief strategic assessment framework."
                }
            ],
            max_completion_tokens: 800,
            temperature: STRATEGIC_AI_CONFIG.STRATEGIC_ANALYSIS_TEMP
        };
        
        // Add GPT-5 parameters only if using GPT-5
        if (currentModel.includes('gpt-5')) {
            requestConfig.reasoning_effort = "medium";
            requestConfig.verbosity = "balanced";
        }
        
        const basicTest = await openai.chat.completions.create(requestConfig);
        const responseTime = Date.now() - startTime;
        const response = basicTest.choices[0].message.content;
        
        modelCapabilities = {
            available: true,
            enhanced: true,
            vision: currentModel.includes('gpt-5') || currentModel.includes('4o'),
            reasoning: currentModel.includes('gpt-5'),
            gpt5Features: currentModel.includes('gpt-5'),
            responseTime: responseTime,
            model: currentModel,
            lastTested: new Date().toISOString(),
            contextWindow: STRATEGIC_AI_CONFIG.ENHANCED_CONTEXT_WINDOW,
            maxTokens: STRATEGIC_AI_CONFIG.MAX_OUTPUT_TOKENS
        };
        
        console.log(`✅ Model capabilities confirmed:`);
        console.log(`   Model: ${currentModel} ${currentModel.includes('gpt-5') ? '🚀' : ''}`);
        console.log(`   Enhanced Features: ${modelCapabilities.gpt5Features}`);
        console.log(`   Vision Support: ${modelCapabilities.vision}`);
        console.log(`   Response Time: ${responseTime}ms`);
        
        return modelCapabilities;
        
    } catch (error) {
        console.error(`❌ Model test failed: ${error.message}`);
        
        // Try fallback model if primary fails
        if (currentModel !== STRATEGIC_AI_CONFIG.FALLBACK_MODEL) {
            console.log(`🔄 Trying fallback model: ${STRATEGIC_AI_CONFIG.FALLBACK_MODEL}`);
            currentModel = STRATEGIC_AI_CONFIG.FALLBACK_MODEL;
            return await testModelCapabilities();
        }
        
        throw new Error(`All models failed: ${error.message}`);
    }
}

/**
 * 🎯 Analyze Query for Optimal Configuration
 */
function analyzeQueryForOptimalResponse(query) {
    const lowerQuery = query.toLowerCase();
    
    // Strategic analysis patterns
    const strategicPatterns = [
        /(analyze|evaluate|assess|compare|optimize|strategy)/i,
        /(portfolio|investment|allocation|risk|return)/i,
        /(market|economic|financial|regime|conditions)/i,
        /(cambodia|fund|lending|real estate|due diligence)/i
    ];
    
    // Complex reasoning patterns
    const complexPatterns = [
        /(calculate|compute|derive|prove|model)/i,
        /(step.*by.*step|systematic|comprehensive|detailed)/i,
        /(multi.*factor|cross.*reference|correlation)/i,
        /(reasoning|logic|chain.*thought)/i
    ];
    
    // Conversational patterns
    const conversationalPatterns = [
        /(hello|hi|thanks|help|explain|tell me)/i,
        /(story|example|analogy|simple|easy)/i,
        /(chat|talk|discuss|conversation)/i
    ];
    
    // Determine optimal configuration
    let config = {
        type: 'general',
        maxTokens: 1500,
        temperature: STRATEGIC_AI_CONFIG.CONVERSATIONAL_TEMP,
        systemPrompt: "You are the Strategic Commander of IMPERIUM VAULT SYSTEM providing helpful, authoritative responses.",
        priority: 'balanced'
    };
    
    // Add GPT-5 specific settings if available
    if (currentModel.includes('gpt-5')) {
        config.reasoning_effort = 'medium';
        config.verbosity = 'balanced';
    }
    
    if (strategicPatterns.some(pattern => pattern.test(lowerQuery))) {
        config = {
            type: 'strategic_analysis',
            maxTokens: STRATEGIC_AI_CONFIG.MAX_OUTPUT_TOKENS,
            temperature: STRATEGIC_AI_CONFIG.STRATEGIC_ANALYSIS_TEMP,
            systemPrompt: "You are the Strategic Commander providing institutional-quality strategic analysis. Use advanced reasoning to provide actionable insights and strategic recommendations with commanding authority.",
            priority: 'accuracy'
        };
        
        if (currentModel.includes('gpt-5')) {
            config.reasoning_effort = 'high';
            config.verbosity = 'detailed';
        }
        
    } else if (complexPatterns.some(pattern => pattern.test(lowerQuery))) {
        config = {
            type: 'complex_reasoning',
            maxTokens: 4000,
            temperature: STRATEGIC_AI_CONFIG.FINANCIAL_ANALYSIS_TEMP,
            systemPrompt: "You are the Strategic Commander with advanced analytical capabilities. Provide step-by-step analysis, detailed calculations, and comprehensive solutions with institutional precision.",
            priority: 'accuracy'
        };
        
        if (currentModel.includes('gpt-5')) {
            config.reasoning_effort = 'high';
            config.verbosity = 'detailed';
        }
        
    } else if (conversationalPatterns.some(pattern => pattern.test(lowerQuery))) {
        config = {
            type: 'conversational',
            maxTokens: 1800,
            temperature: STRATEGIC_AI_CONFIG.CONVERSATIONAL_TEMP,
            systemPrompt: "You are the Strategic Commander providing helpful, intelligent responses with institutional expertise. Be conversational yet authoritative.",
            priority: 'engagement'
        };
        
        if (currentModel.includes('gpt-5')) {
            config.reasoning_effort = 'medium';
            config.verbosity = 'balanced';
        }
    }
    
    return config;
}

/**
 * 🤖 MAIN: Enhanced Analysis Function with Smart Parameter Handling
 */
async function getGptAnalysis(query, options = {}) {
    try {
        // Ensure model capabilities are tested
        if (!modelCapabilities.available || !modelCapabilities.lastTested) {
            await testModelCapabilities();
        }
        
        console.log(`🤖 Strategic AI Analysis (${currentModel})`);
        
        // Analyze query for optimal configuration
        const queryConfig = analyzeQueryForOptimalResponse(query);
        console.log(`🎯 Analysis Type: ${queryConfig.type}`);
        
        // Build request config with proper parameter handling
        const requestConfig = {
            model: options.model || currentModel,
            messages: [
                {
                    role: "system",
                    content: options.systemPrompt || queryConfig.systemPrompt
                },
                {
                    role: "user",
                    content: query
                }
            ],
            max_completion_tokens: options.max_completion_tokens || options.maxTokens || queryConfig.maxTokens,
            temperature: options.temperature || queryConfig.temperature,
            top_p: options.top_p || 0.95,
            frequency_penalty: options.frequency_penalty || 0,
            presence_penalty: options.presence_penalty || 0,
            stream: false
        };
        
        // Add GPT-5 specific parameters only if using GPT-5
        if (requestConfig.model.includes('gpt-5')) {
            requestConfig.reasoning_effort = options.reasoning_effort || queryConfig.reasoning_effort || 'medium';
            requestConfig.verbosity = options.verbosity || queryConfig.verbosity || 'balanced';
        }
        
        // Execute analysis
        const startTime = Date.now();
        const completion = await openai.chat.completions.create(requestConfig);
        const responseTime = Date.now() - startTime;
        
        const response = completion.choices[0].message.content.trim();
        
        console.log(`✅ Strategic Analysis Complete:`);
        console.log(`   Type: ${queryConfig.type}`);
        console.log(`   Model: ${requestConfig.model} ${requestConfig.model.includes('gpt-5') ? '🚀' : ''}`);
        console.log(`   Tokens: ${completion.usage?.total_tokens || 'unknown'}`);
        console.log(`   Response Time: ${responseTime}ms`);
        console.log(`   Length: ${response.length} characters`);
        
        return response;
        
    } catch (error) {
        console.error(`❌ Strategic Analysis Error: ${error.message}`);
        
        // Intelligent fallback handling
        if (error.message.includes('model') || error.message.includes('gpt-5')) {
            if (currentModel !== STRATEGIC_AI_CONFIG.FALLBACK_MODEL) {
                console.log(`🔄 Falling back to: ${STRATEGIC_AI_CONFIG.FALLBACK_MODEL}`);
                return await getGptAnalysisWithFallback(query, options);
            }
        }
        
        // Enhanced error messages
        if (error.message.includes('API key')) {
            throw new Error('OpenAI API Key Error: Verify OPENAI_API_KEY is set correctly.');
        } else if (error.message.includes('rate_limit')) {
            throw new Error('Rate Limit Exceeded: Please wait a moment and try again.');
        } else if (error.message.includes('timeout')) {
            throw new Error('Request Timeout: Query was too complex. Try breaking into smaller parts.');
        } else {
            throw new Error(`AI Analysis Failed: ${error.message}`);
        }
    }
}

/**
 * 🔄 Fallback Analysis Function
 */
async function getGptAnalysisWithFallback(query, options = {}) {
    try {
        console.log(`🔄 Using fallback model: ${STRATEGIC_AI_CONFIG.FALLBACK_MODEL}`);
        
        const queryConfig = analyzeQueryForOptimalResponse(query);
        
        const requestConfig = {
            model: STRATEGIC_AI_CONFIG.FALLBACK_MODEL,
            messages: [
                {
                    role: "system",
                    content: options.systemPrompt || queryConfig.systemPrompt
                },
                {
                    role: "user",
                    content: query
                }
            ],
            max_completion_tokens: options.max_completion_tokens || options.maxTokens || queryConfig.maxTokens,
            temperature: options.temperature || queryConfig.temperature,
            stream: false
        };
        
        const completion = await openai.chat.completions.create(requestConfig);
        const response = completion.choices[0].message.content.trim();
        
        console.log(`✅ Fallback Analysis Complete (${STRATEGIC_AI_CONFIG.FALLBACK_MODEL})`);
        
        // Add fallback notice only if it was an automatic fallback
        if (!options.skipFallbackNotice) {
            return `**Analysis via ${STRATEGIC_AI_CONFIG.FALLBACK_MODEL}**\n\n${response}`;
        }
        
        return response;
        
    } catch (fallbackError) {
        console.error(`❌ Fallback analysis also failed: ${fallbackError.message}`);
        throw new Error(`Both primary and fallback models failed: ${fallbackError.message}`);
    }
}

/**
 * 📊 ENHANCED: Market Analysis Function
 */
async function getMarketAnalysis(query, marketData = null, options = {}) {
    try {
        console.log('📊 Strategic Market Analysis...');
        
        let enhancedQuery = `STRATEGIC MARKET ANALYSIS REQUEST:\n${query}`;
        
        // Add market context if provided
        if (marketData) {
            enhancedQuery += `\n\nCURRENT MARKET CONTEXT:`;
            if (marketData.economics?.fedRate) enhancedQuery += `\n• Fed Funds Rate: ${marketData.economics.fedRate.value}%`;
            if (marketData.economics?.inflation) enhancedQuery += `\n• CPI Inflation: ${marketData.economics.inflation.value}%`;
            if (marketData.economics?.unemployment) enhancedQuery += `\n• Unemployment: ${marketData.economics.unemployment.value}%`;
            if (marketData.stocks?.vix) enhancedQuery += `\n• VIX: ${marketData.stocks.vix}`;
            if (marketData.regime) enhancedQuery += `\n• Economic Regime: ${marketData.regime}`;
        }
        
        enhancedQuery += `\n\nSTRATEGIC ANALYSIS REQUIREMENTS:
• Apply institutional-grade financial theory and quantitative methods
• Consider multiple timeframe analysis (tactical, strategic, secular)
• Assess current regime implications for asset allocation
• Identify key risk factors and hedging strategies
• Provide specific, actionable investment recommendations
• Calculate risk-adjusted return expectations with detailed methodology
• Consider IMPERIUM VAULT SYSTEM strategic positioning`;
        
        return await getGptAnalysis(enhancedQuery, {
            ...options,
            systemPrompt: "You are the Strategic Commander with institutional-grade market analysis expertise. Provide comprehensive market intelligence with commanding authority and actionable insights.",
            maxTokens: 5000,
            temperature: STRATEGIC_AI_CONFIG.FINANCIAL_ANALYSIS_TEMP
        });
        
    } catch (error) {
        console.error('❌ Market analysis error:', error.message);
        throw error;
    }
}

/**
 * 🇰🇭 ENHANCED: Cambodia Fund Analysis Function
 */
async function getCambodiaAnalysis(dealQuery, dealData = null, options = {}) {
    try {
        console.log('🇰🇭 Strategic Cambodia Fund Analysis...');
        
        let enhancedQuery = `STRATEGIC CAMBODIA FUND ANALYSIS:\n${dealQuery}`;
        
        if (dealData) {
            enhancedQuery += `\n\nDEAL PARAMETERS:`;
            enhancedQuery += `\n• Investment Amount: $${dealData.amount?.toLocaleString() || 'TBD'}`;
            enhancedQuery += `\n• Asset Type: ${dealData.type || 'Commercial Real Estate'}`;
            enhancedQuery += `\n• Location: ${dealData.location || 'Phnom Penh, Cambodia'}`;
            enhancedQuery += `\n• Target Yield: ${dealData.rate || 'TBD'}% annually`;
            enhancedQuery += `\n• Investment Term: ${dealData.term || 'TBD'} months`;
            if (dealData.ltv) enhancedQuery += `\n• Loan-to-Value: ${dealData.ltv}%`;
            if (dealData.irr) enhancedQuery += `\n• Target IRR: ${dealData.irr}%`;
        }
        
        enhancedQuery += `\n\nCOMPREHENSIVE CAMBODIA ANALYSIS FRAMEWORK:
• Macroeconomic environment and USD peg stability analysis
• Real estate market dynamics, supply/demand fundamentals
• Regulatory landscape and foreign investment compliance
• Political risk assessment and mitigation strategies
• Currency risk analysis (USD vs KHR considerations)
• Comparative yield analysis versus regional markets
• Exit strategy evaluation and liquidity considerations
• Risk-adjusted return calculations with scenario analysis
• Due diligence checklist specific to Cambodia market
• IMPERIUM VAULT SYSTEM strategic positioning`;
        
        return await getGptAnalysis(enhancedQuery, {
            ...options,
            systemPrompt: "You are the Strategic Commander with specialized expertise in Cambodia real estate and lending markets. Provide institutional-quality analysis with deep market knowledge and strategic insights.",
            maxTokens: 4500,
            temperature: STRATEGIC_AI_CONFIG.FINANCIAL_ANALYSIS_TEMP
        });
        
    } catch (error) {
        console.error('❌ Cambodia analysis error:', error.message);
        throw error;
    }
}

/**
 * 📈 ENHANCED: Strategic Analysis Function
 */
async function getStrategicAnalysis(query, options = {}) {
    try {
        console.log('📈 Strategic Intelligence Analysis...');
        
        const strategicQuery = `STRATEGIC INTELLIGENCE REQUEST:\n${query}

EXECUTIVE ANALYSIS FRAMEWORK:
• Strategic opportunities and competitive advantages
• Risk assessment and mitigation strategies  
• Market positioning and competitive intelligence
• Resource allocation and portfolio optimization
• Scenario planning and strategic recommendations
• Implementation roadmap and success metrics
• ROI projections and performance indicators
• IMPERIUM VAULT SYSTEM strategic integration

Execute institutional-grade strategic intelligence with commanding authority.`;

        return await getGptAnalysis(strategicQuery, {
            ...options,
            systemPrompt: "You are the Strategic Commander providing institutional-quality strategic analysis. Focus on strategic opportunities, competitive intelligence, and actionable recommendations with commanding authority.",
            maxTokens: STRATEGIC_AI_CONFIG.MAX_OUTPUT_TOKENS,
            temperature: STRATEGIC_AI_CONFIG.STRATEGIC_ANALYSIS_TEMP
        });
        
    } catch (error) {
        console.error('❌ Strategic analysis error:', error.message);
        throw error;
    }
}

/**
 * 🖼️ ENHANCED: Vision Analysis Function
 */
async function analyzeImageWithGPT(base64Image, prompt, options = {}) {
    try {
        console.log('🖼️ Strategic Vision Analysis...');
        
        // Ensure vision capabilities
        if (!modelCapabilities.vision) {
            throw new Error('Vision analysis not supported by current model');
        }
        
        const requestConfig = {
            model: options.model || STRATEGIC_AI_CONFIG.VISION_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander with enhanced vision capabilities. Provide detailed, accurate analysis of images with particular expertise in financial charts, documents, business content, and strategic intelligence extraction."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `STRATEGIC VISION ANALYSIS:\n${prompt}\n\nProvide comprehensive visual analysis with strategic insights. Extract specific data points, identify trends, patterns, and provide actionable intelligence.`
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
            max_completion_tokens: options.maxTokens || 4000,
            temperature: options.temperature || STRATEGIC_AI_CONFIG.CONVERSATIONAL_TEMP
        };
        
        // Add GPT-5 parameters if using GPT-5
        if (requestConfig.model.includes('gpt-5')) {
            requestConfig.reasoning_effort = options.reasoning_effort || 'medium';
            requestConfig.verbosity = options.verbosity || 'detailed';
        }
        
        const completion = await openai.chat.completions.create(requestConfig);
        const analysis = completion.choices[0].message.content;
        
        console.log(`✅ Strategic vision analysis complete (${analysis.length} characters)`);
        return analysis;
        
    } catch (error) {
        console.error('❌ Vision analysis error:', error.message);
        
        // Try fallback for vision analysis
        if (error.message.includes('gpt-5') && !options.model) {
            console.log('🔄 Trying vision analysis with GPT-4o...');
            return await analyzeImageWithGPT(base64Image, prompt, { ...options, model: 'gpt-4o' });
        }
        
        throw new Error(`Strategic Vision Analysis Error: ${error.message}`);
    }
}

/**
 * 🎤 Audio Transcription Function
 */
async function transcribeAudio(audioFile, options = {}) {
    try {
        console.log('🎤 Strategic Audio Transcription...');
        
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: options.model || "whisper-1",
            language: options.language || "en",
            temperature: options.temperature || 0.2,
            response_format: options.response_format || "text"
        });
        
        console.log(`✅ Audio transcription complete: ${transcription.length || 0} characters`);
        return transcription;
        
    } catch (error) {
        console.error('❌ Audio transcription error:', error.message);
        throw new Error(`Audio transcription failed: ${error.message}`);
    }
}

/**
 * 🧠 Memory-Aware Analysis Function
 */
async function getMemoryAwareAnalysis(query, memoryContext = '', options = {}) {
    try {
        console.log('🧠 Memory-Enhanced Strategic Analysis...');
        
        const enhancedQuery = memoryContext ? 
            `MEMORY CONTEXT:\n${memoryContext}\n\nCURRENT QUERY:\n${query}` : query;
        
        return await getGptAnalysis(enhancedQuery, {
            ...options,
            systemPrompt: "You are the Strategic Commander with access to persistent memory about this user. Use the provided context to give personalized, intelligent responses that reference previous conversations and learned facts.",
            maxTokens: options.maxTokens || 3000,
            temperature: options.temperature || STRATEGIC_AI_CONFIG.CONVERSATIONAL_TEMP
        });
        
    } catch (error) {
        console.error('❌ Memory-aware analysis error:', error.message);
        throw error;
    }
}

/**
 * 🎯 Quick Response Function
 */
async function getQuickGptResponse(query, options = {}) {
    try {
        console.log('🎯 Quick Strategic Response...');
        
        return await getGptAnalysis(query, {
            ...options,
            maxTokens: options.maxTokens || 1200,
            temperature: options.temperature || STRATEGIC_AI_CONFIG.CONVERSATIONAL_TEMP,
            systemPrompt: "You are the Strategic Commander providing concise, authoritative responses. Be direct and helpful while maintaining institutional expertise."
        });
        
    } catch (error) {
        console.error('❌ Quick response error:', error.message);
        throw error;
    }
}

/**
 * 🔍 Test OpenAI Connection
 */
async function testOpenAIConnection() {
    try {
        console.log('🔍 Testing OpenAI connection...');
        
        const requestConfig = {
            model: STRATEGIC_AI_CONFIG.FALLBACK_MODEL, // Use reliable model for testing
            messages: [
                {
                    role: "user",
                    content: "Test connection. Respond with: Strategic Commander Online."
                }
            ],
            max_completion_tokens: 50,
            temperature: 0
        };
        
        const response = await openai.chat.completions.create(requestConfig);
        const result = response.choices[0]?.message?.content;
        
        console.log('✅ OpenAI Connection Test Result:', result);
        
        return {
            success: true,
            result: result,
            model: STRATEGIC_AI_CONFIG.FALLBACK_MODEL,
            usage: response.usage
        };
        
    } catch (error) {
        console.error('❌ OpenAI Connection Test Failed:', error.message);
        
        return {
            success: false,
            error: error.message,
            model: STRATEGIC_AI_CONFIG.FALLBACK_MODEL
        };
    }
}

/**
 * 🏥 System Health Check
 */
async function checkSystemHealth() {
    const health = {
        primaryModelWorking: false,
        fallbackModelWorking: false,
        visionCapabilities: false,
        audioCapabilities: false,
        gpt5Available: false,
        currentModel: currentModel,
        capabilities: modelCapabilities,
        errors: []
    };
    
    try {
        // Test primary model
        await testModelCapabilities();
        health.primaryModelWorking = modelCapabilities.available;
        health.visionCapabilities = modelCapabilities.vision;
        health.audioCapabilities = true;
        health.gpt5Available = modelCapabilities.gpt5Features;
        
        if (!health.primaryModelWorking && currentModel !== STRATEGIC_AI_CONFIG.FALLBACK_MODEL) {
            // Test fallback
            const originalModel = currentModel;
            currentModel = STRATEGIC_AI_CONFIG.FALLBACK_MODEL;
            await testModelCapabilities();
            health.fallbackModelWorking = modelCapabilities.available;
            currentModel = originalModel;
        }
        
    } catch (error) {
        health.errors.push(`System Test: ${error.message}`);
    }
    
    health.overallHealth = health.primaryModelWorking || health.fallbackModelWorking;
    health.status = health.overallHealth ? 'HEALTHY' : 'DEGRADED';
    health.gpt5Status = health.gpt5Available ? 'ACTIVE' : 'FALLBACK';
    
    return health;
}

/**
 * 📊 Get Performance Metrics
 */
function getPerformanceMetrics() {
    return {
        system: "IMPERIUM VAULT STRATEGIC AI CLIENT v3.4 - GPT-5 COMPATIBLE",
        currentModel: currentModel,
        gpt5Ready: currentModel.includes('gpt-5'),
        capabilities: modelCapabilities,
        configuration: STRATEGIC_AI_CONFIG,
        features: [
            'Smart GPT-5 Parameter Handling',
            'Automatic Fallback System', 
            'Strategic Market Analysis',
            'Cambodia Fund Intelligence', 
            'Enhanced Vision Analysis',
            'Memory-Aware Responses',
            'Audio Transcription',
            'Multi-Modal Intelligence',
            'Institutional-Grade Analysis',
            'Risk-Adjusted Recommendations',
            'Real-Time Model Switching',
            'Advanced Error Recovery'
        ],
        queryTypes: ['strategic_analysis', 'complex_reasoning', 'conversational', 'general'],
        optimizedFor: 'Financial analysis, strategic planning, and institutional decision-making',
        compatibility: 'GPT-5 ready with GPT-4o fallback'
    };
}

// Export all functions
module.exports = {
    // Main Analysis Functions
    getGptAnalysis,
    getMarketAnalysis,
    getCambodiaAnalysis,
    getStrategicAnalysis,
    getMemoryAwareAnalysis,
    getQuickGptResponse,
    
    // Multi-Modal Functions
    analyzeImageWithGPT,
    transcribeAudio,
    
    // System Functions
    testModelCapabilities,
    testOpenAIConnection,
    checkSystemHealth,
    getPerformanceMetrics,
    
    // Utility Functions
    analyzeQueryForOptimalResponse,
    getGptAnalysisWithFallback,
    
    // Legacy Compatibility
    getGPT5Analysis: getGptAnalysis,
    getEnhancedMarketAnalysis: getMarketAnalysis,
    getEnhancedCambodiaAnalysis: getCambodiaAnalysis,
    getEnhancedVisionAnalysis: analyzeImageWithGPT,
    getConversationalAnalysis: getQuickGptResponse,
    
    // Direct Access
    openai,
    STRATEGIC_AI_CONFIG,
    currentModel: () => currentModel,
    modelCapabilities: () => modelCapabilities
};
