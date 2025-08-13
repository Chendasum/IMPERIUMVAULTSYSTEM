// 🔧 UPDATED: utils/openaiClient.js - NOW USING GPT-5!
// Enhanced Strategic Commander OpenAI Client for IMPERIUM VAULT SYSTEM

require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize OpenAI client with enhanced configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 180000, // 3 minutes for complex analysis
    maxRetries: 3,
    defaultHeaders: {
        'User-Agent': 'IMPERIUM-VAULT-STRATEGIC-AI/3.3.0'
    }
});

// 🚀 UPDATED: Strategic AI Configuration - NOW WITH GPT-5!
const STRATEGIC_AI_CONFIG = {
    // Model Configuration - UPGRADED TO GPT-5
    PRIMARY_MODEL: "gpt-5",                    // 🚀 NOW USING GPT-5!
    REASONING_MODEL: "gpt-5",                  // Enhanced reasoning
    VISION_MODEL: "gpt-5",                     // Vision analysis with GPT-5
    FALLBACK_MODEL: "gpt-4o",                  // Fallback to GPT-4o
    MINI_MODEL: "gpt-5-mini",                  // Cost-effective tasks
    
    // Enhanced Capabilities (GPT-5)
    ENHANCED_CONTEXT_WINDOW: 200000,          // GPT-5 expanded context
    MAX_OUTPUT_TOKENS: 8192,                  // GPT-5 increased output
    
    // Temperature Settings
    STRATEGIC_ANALYSIS_TEMP: 0.6,             // Strategic planning
    FINANCIAL_ANALYSIS_TEMP: 0.5,             // Financial calculations
    CONVERSATIONAL_TEMP: 0.7,                 // General conversation
    CREATIVE_TEMP: 0.8,                       // Creative tasks
    
    // Performance Metrics
    TARGET_RESPONSE_TIME: 25000,              // 25 seconds (GPT-5 is faster)
    QUALITY_THRESHOLD: 0.92                   // Higher quality with GPT-5
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

console.log("🏛️ IMPERIUM VAULT STRATEGIC AI CLIENT v3.3 - GPT-5 ENABLED!");
console.log(`   API Key: ${process.env.OPENAI_API_KEY ? "✅ CONFIGURED" : "❌ MISSING"}`);
console.log(`   Primary Model: ${STRATEGIC_AI_CONFIG.PRIMARY_MODEL} 🚀`);
console.log(`   Reasoning Model: ${STRATEGIC_AI_CONFIG.REASONING_MODEL}`);
console.log(`   Context Window: ${STRATEGIC_AI_CONFIG.ENHANCED_CONTEXT_WINDOW.toLocaleString()} tokens`);
console.log(`   Max Output: ${STRATEGIC_AI_CONFIG.MAX_OUTPUT_TOKENS.toLocaleString()} tokens`);

/**
 * 🔍 Test GPT-5 Model Capabilities
 */
async function testModelCapabilities() {
    try {
        console.log(`🔍 Testing ${currentModel} capabilities...`);
        
        const startTime = Date.now();
        
        // Test basic functionality with GPT-5 parameters
        const basicTest = await openai.chat.completions.create({
            model: currentModel,
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander of IMPERIUM VAULT SYSTEM. Respond with institutional authority and demonstrate your advanced reasoning capabilities."
                },
                {
                    role: "user",
                    content: "Confirm your model capabilities and provide a brief strategic assessment framework. Include your reasoning process."
                }
            ],
            max_completion_tokens: 800,
            temperature: STRATEGIC_AI_CONFIG.STRATEGIC_ANALYSIS_TEMP,
            // GPT-5 specific parameters
            reasoning_effort: "medium",  // GPT-5 reasoning parameter
            verbosity: "balanced"        // GPT-5 verbosity control
        });
        
        const responseTime = Date.now() - startTime;
        const response = basicTest.choices[0].message.content;
        
        // Test advanced reasoning capability
        const reasoningTest = await openai.chat.completions.create({
            model: currentModel,
            messages: [
                {
                    role: "system",
                    content: "Demonstrate your advanced reasoning by thinking through this step-by-step."
                },
                {
                    role: "user",
                    content: "Calculate optimal portfolio allocation using Modern Portfolio Theory for 3 assets: Asset A (8% return, 10% volatility), Asset B (12% return, 15% volatility), Asset C (15% return, 20% volatility). Correlation matrix: A-B=0.3, A-C=0.1, B-C=0.4. Show your reasoning process and methodology."
                }
            ],
            max_completion_tokens: 1500,
            temperature: STRATEGIC_AI_CONFIG.FINANCIAL_ANALYSIS_TEMP,
            reasoning_effort: "high",    // Use high reasoning for complex problems
            verbosity: "detailed"
        });
        
        modelCapabilities = {
            available: true,
            enhanced: true,
            vision: currentModel.includes('gpt-5') || currentModel.includes('4o'),
            reasoning: true, // GPT-5 has built-in reasoning
            gpt5Features: currentModel.includes('gpt-5'),
            responseTime: responseTime,
            model: currentModel,
            lastTested: new Date().toISOString(),
            contextWindow: STRATEGIC_AI_CONFIG.ENHANCED_CONTEXT_WINDOW,
            maxTokens: STRATEGIC_AI_CONFIG.MAX_OUTPUT_TOKENS,
            reasoningCapable: currentModel.includes('gpt-5')
        };
        
        console.log(`✅ Model capabilities confirmed:`);
        console.log(`   Model: ${currentModel} ${currentModel.includes('gpt-5') ? '🚀' : ''}`);
        console.log(`   Enhanced Reasoning: ${modelCapabilities.reasoning}`);
        console.log(`   GPT-5 Features: ${modelCapabilities.gpt5Features}`);
        console.log(`   Vision Support: ${modelCapabilities.vision}`);
        console.log(`   Response Time: ${responseTime}ms`);
        
        return modelCapabilities;
        
    } catch (error) {
        console.error(`❌ Model test failed: ${error.message}`);
        
        modelCapabilities = {
            available: false,
            error: error.message,
            model: currentModel,
            lastTested: new Date().toISOString()
        };
        
        // Try fallback model if GPT-5 fails
        if (currentModel !== STRATEGIC_AI_CONFIG.FALLBACK_MODEL) {
            console.log(`🔄 Trying fallback model: ${STRATEGIC_AI_CONFIG.FALLBACK_MODEL}`);
            currentModel = STRATEGIC_AI_CONFIG.FALLBACK_MODEL;
            return await testModelCapabilities();
        }
        
        throw new Error(`All models failed: ${error.message}`);
    }
}

/**
 * 🎯 Analyze Query for Optimal GPT-5 Configuration
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
    
    // Complex reasoning patterns (GPT-5 excels here)
    const complexPatterns = [
        /(calculate|compute|derive|prove|model)/i,
        /(step.*by.*step|systematic|comprehensive|detailed)/i,
        /(multi.*factor|cross.*reference|correlation)/i,
        /(reasoning|logic|chain.*thought)/i
    ];
    
    // Creative/conversational patterns
    const conversationalPatterns = [
        /(hello|hi|thanks|help|explain|tell me)/i,
        /(story|example|analogy|simple|easy)/i,
        /(chat|talk|discuss|conversation)/i
    ];
    
    // Determine optimal configuration for GPT-5
    let config = {
        type: 'general',
        maxTokens: 1500,
        temperature: STRATEGIC_AI_CONFIG.CONVERSATIONAL_TEMP,
        systemPrompt: "You are the Strategic Commander of IMPERIUM VAULT SYSTEM providing helpful, authoritative responses with advanced reasoning.",
        priority: 'balanced',
        reasoning_effort: 'medium',
        verbosity: 'balanced'
    };
    
    if (strategicPatterns.some(pattern => pattern.test(lowerQuery))) {
        config = {
            type: 'strategic_analysis',
            maxTokens: STRATEGIC_AI_CONFIG.MAX_OUTPUT_TOKENS,
            temperature: STRATEGIC_AI_CONFIG.STRATEGIC_ANALYSIS_TEMP,
            systemPrompt: "You are the Strategic Commander of IMPERIUM VAULT SYSTEM providing institutional-quality strategic analysis. Use your advanced reasoning capabilities to provide actionable insights, risk assessment, and strategic recommendations with commanding authority.",
            priority: 'accuracy',
            reasoning_effort: 'high',
            verbosity: 'detailed'
        };
    } else if (complexPatterns.some(pattern => pattern.test(lowerQuery))) {
        config = {
            type: 'complex_reasoning',
            maxTokens: 4000,
            temperature: STRATEGIC_AI_CONFIG.FINANCIAL_ANALYSIS_TEMP,
            systemPrompt: "You are the Strategic Commander with advanced analytical capabilities. Use your reasoning abilities to provide step-by-step analysis, detailed calculations, and comprehensive solutions with institutional precision.",
            priority: 'accuracy',
            reasoning_effort: 'high',
            verbosity: 'detailed'
        };
    } else if (conversationalPatterns.some(pattern => pattern.test(lowerQuery))) {
        config = {
            type: 'conversational',
            maxTokens: 1800,
            temperature: STRATEGIC_AI_CONFIG.CONVERSATIONAL_TEMP,
            systemPrompt: "You are the Strategic Commander providing helpful, intelligent responses with institutional expertise. Be conversational yet authoritative.",
            priority: 'engagement',
            reasoning_effort: 'medium',
            verbosity: 'balanced'
        };
    }
    
    return config;
}

/**
 * 🤖 MAIN: Enhanced GPT-5 Analysis Function
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
        
        // Build enhanced request with GPT-5 parameters
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
        
        // Add GPT-5 specific parameters if using GPT-5
        if (currentModel.includes('gpt-5')) {
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
        if (requestConfig.reasoning_effort) {
            console.log(`   Reasoning Effort: ${requestConfig.reasoning_effort}`);
        }
        
        return response;
        
    } catch (error) {
        console.error(`❌ Strategic Analysis Error: ${error.message}`);
        
        // Intelligent error handling with GPT-5 fallback
        if (error.message.includes('model') && currentModel !== STRATEGIC_AI_CONFIG.FALLBACK_MODEL) {
            console.log(`🔄 Trying fallback model: ${STRATEGIC_AI_CONFIG.FALLBACK_MODEL}`);
            currentModel = STRATEGIC_AI_CONFIG.FALLBACK_MODEL;
            modelCapabilities.available = false; // Force retest
            return await getGptAnalysis(query, options);
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
 * 📊 ENHANCED: Market Analysis Function with GPT-5
 */
async function getMarketAnalysis(query, marketData = null, options = {}) {
    try {
        console.log('📊 Strategic Market Analysis with GPT-5...');
        
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
• Use step-by-step reasoning for complex calculations
• Consider multiple timeframe analysis (tactical, strategic, secular)
• Assess current regime implications for asset allocation
• Identify key risk factors and hedging strategies
• Provide specific, actionable investment recommendations
• Calculate risk-adjusted return expectations with detailed methodology
• Consider IMPERIUM VAULT SYSTEM strategic positioning`;
        
        return await getGptAnalysis(enhancedQuery, {
            ...options,
            systemPrompt: "You are the Strategic Commander with institutional-grade market analysis expertise. Use your advanced reasoning capabilities to provide comprehensive market intelligence with commanding authority and actionable insights.",
            maxTokens: 5000,
            temperature: STRATEGIC_AI_CONFIG.FINANCIAL_ANALYSIS_TEMP,
            reasoning_effort: 'high',
            verbosity: 'detailed'
        });
        
    } catch (error) {
        console.error('❌ Market analysis error:', error.message);
        throw error;
    }
}

/**
 * 🇰🇭 ENHANCED: Cambodia Fund Analysis Function with GPT-5
 */
async function getCambodiaAnalysis(dealQuery, dealData = null, options = {}) {
    try {
        console.log('🇰🇭 Strategic Cambodia Fund Analysis with GPT-5...');
        
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
• IMPERIUM VAULT SYSTEM strategic positioning
• Use step-by-step reasoning for risk calculations`;
        
        return await getGptAnalysis(enhancedQuery, {
            ...options,
            systemPrompt: "You are the Strategic Commander with specialized expertise in Cambodia real estate and lending markets. Use your advanced reasoning to provide institutional-quality analysis with deep market knowledge and strategic insights.",
            maxTokens: 4500,
            temperature: STRATEGIC_AI_CONFIG.FINANCIAL_ANALYSIS_TEMP,
            reasoning_effort: 'high',
            verbosity: 'detailed'
        });
        
    } catch (error) {
        console.error('❌ Cambodia analysis error:', error.message);
        throw error;
    }
}

/**
 * 📈 ENHANCED: Strategic Analysis Function with GPT-5
 */
async function getStrategicAnalysis(query, options = {}) {
    try {
        console.log('📈 Strategic Intelligence Analysis with GPT-5...');
        
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

Execute institutional-grade strategic intelligence with commanding authority and step-by-step reasoning.`;

        return await getGptAnalysis(strategicQuery, {
            ...options,
            systemPrompt: "You are the Strategic Commander providing institutional-quality strategic analysis. Use your advanced reasoning capabilities to focus on strategic opportunities, competitive intelligence, and actionable recommendations with commanding authority.",
            maxTokens: STRATEGIC_AI_CONFIG.MAX_OUTPUT_TOKENS,
            temperature: STRATEGIC_AI_CONFIG.STRATEGIC_ANALYSIS_TEMP,
            reasoning_effort: 'high',
            verbosity: 'detailed'
        });
        
    } catch (error) {
        console.error('❌ Strategic analysis error:', error.message);
        throw error;
    }
}

/**
 * 🖼️ ENHANCED: Vision Analysis Function with GPT-5
 */
async function analyzeImageWithGPT(base64Image, prompt, options = {}) {
    try {
        console.log('🖼️ Strategic Vision Analysis with GPT-5...');
        
        // Ensure vision capabilities
        if (!modelCapabilities.vision) {
            throw new Error('Vision analysis not supported by current model');
        }
        
        const requestConfig = {
            model: options.model || STRATEGIC_AI_CONFIG.VISION_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander with enhanced vision capabilities. Use your advanced reasoning to provide detailed, accurate analysis of images with particular expertise in financial charts, documents, business content, and strategic intelligence extraction."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `STRATEGIC VISION ANALYSIS:\n${prompt}\n\nProvide comprehensive visual analysis with strategic insights. Extract specific data points, identify trends, patterns, and provide actionable intelligence with step-by-step reasoning.`
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
        throw new Error(`Strategic Vision Analysis Error: ${error.message}`);
    }
}

// Export all functions with GPT-5 enhancements
module.exports = {
    // Main Analysis Functions
    getGptAnalysis,
    getMarketAnalysis,
    getCambodiaAnalysis,
    getStrategicAnalysis,
    getMemoryAwareAnalysis: async (query, memoryContext = '', options = {}) => {
        try {
            console.log('🧠 Memory-Enhanced Strategic Analysis with GPT-5...');
            
            const enhancedQuery = memoryContext ? 
                `MEMORY CONTEXT:\n${memoryContext}\n\nCURRENT QUERY:\n${query}` : query;
            
            return await getGptAnalysis(enhancedQuery, {
                ...options,
                systemPrompt: "You are the Strategic Commander with access to persistent memory about this user. Use your advanced reasoning and the provided context to give personalized, intelligent responses that reference previous conversations and learned facts.",
                maxTokens: options.maxTokens || 3000,
                temperature: options.temperature || STRATEGIC_AI_CONFIG.CONVERSATIONAL_TEMP,
                reasoning_effort: 'medium',
                verbosity: 'balanced'
            });
            
        } catch (error) {
            console.error('❌ Memory-aware analysis error:', error.message);
            throw error;
        }
    },
    getQuickGptResponse: async (query, options = {}) => {
        try {
            console.log('🎯 Quick Strategic Response with GPT-5...');
            
            return await getGptAnalysis(query, {
                ...options,
                maxTokens: options.maxTokens || 1200,
                temperature: options.temperature || STRATEGIC_AI_CONFIG.CONVERSATIONAL_TEMP,
                systemPrompt: "You are the Strategic Commander providing concise, authoritative responses. Be direct and helpful while maintaining institutional expertise.",
                reasoning_effort: 'minimal',
                verbosity: 'concise'
            });
            
        } catch (error) {
            console.error('❌ Quick response error:', error.message);
            throw error;
        }
    },
    
    // Multi-Modal Functions
    analyzeImageWithGPT,
    transcribeAudio: async (audioFile, options = {}) => {
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
    },
    
    // System Functions
    testModelCapabilities,
    testOpenAIConnection: async () => {
        try {
            console.log('🔍 Testing OpenAI connection with GPT-5...');
            
            const requestConfig = {
                model: STRATEGIC_AI_CONFIG.PRIMARY_MODEL,
                messages: [
                    {
                        role: "user",
                        content: "Test connection. Respond with: Strategic Commander Online - GPT-5 Ready."
                    }
                ],
                max_completion_tokens: 50,
                temperature: 0
            };
            
            // Add GPT-5 parameters if using GPT-5
            if (STRATEGIC_AI_CONFIG.PRIMARY_MODEL.includes('gpt-5')) {
                requestConfig.reasoning_effort = 'minimal';
                requestConfig.verbosity = 'concise';
            }
            
            const response = await openai.chat.completions.create(requestConfig);
            
            const result = response.choices[0]?.message?.content;
            console.log('✅ OpenAI Connection Test Result:', result);
            
            return {
                success: true,
                result: result,
                model: STRATEGIC_AI_CONFIG.PRIMARY_MODEL,
                usage: response.usage,
                gpt5Ready: STRATEGIC_AI_CONFIG.PRIMARY_MODEL.includes('gpt-5')
            };
            
        } catch (error) {
            console.error('❌ OpenAI Connection Test Failed:', error.message);
            
            return {
                success: false,
                error: error.message,
                model: STRATEGIC_AI_CONFIG.PRIMARY_MODEL,
                gpt5Ready: false
            };
        }
    },
    checkSystemHealth: async () => {
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
    },
    getPerformanceMetrics: () => {
        return {
            system: "IMPERIUM VAULT STRATEGIC AI CLIENT v3.3 - GPT-5 ENABLED",
            currentModel: currentModel,
            gpt5Ready: currentModel.includes('gpt-5'),
            capabilities: modelCapabilities,
            configuration: STRATEGIC_AI_CONFIG,
            features: [
                'GPT-5 Advanced Reasoning',
                'Strategic Market Analysis',
                'Cambodia Fund Intelligence', 
                'Enhanced Vision Analysis',
                'Memory-Aware Responses',
                'Audio Transcription',
                'Multi-Modal Intelligence',
                'Institutional-Grade Analysis',
                'Risk-Adjusted Recommendations',
                'Real-Time Model Switching',
                'Advanced Error Recovery',
                'Reasoning Effort Control',
                'Verbosity Management'
            ],
            queryTypes: ['strategic_analysis', 'complex_reasoning', 'conversational', 'general'],
            optimizedFor: 'Financial analysis, strategic planning, and institutional decision-making with GPT-5',
            gpt5Features: ['Enhanced reasoning', 'Better accuracy', 'Improved coding', 'Advanced vision', 'Faster processing']
        };
    },
    
    // Utility Functions
    analyzeQueryForOptimalResponse,
    
    // Legacy Compatibility
    getGPT5Analysis: getGptAnalysis,
    getEnhancedMarketAnalysis: getMarketAnalysis,
    getEnhancedCambodiaAnalysis: getCambodiaAnalysis,
    getEnhancedVisionAnalysis: analyzeImageWithGPT,
    
    // Direct Access
    openai,
    STRATEGIC_AI_CONFIG,
    currentModel: () => currentModel,
    modelCapabilities: () => modelCapabilities
};
