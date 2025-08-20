// utils/claudeClient.js - Clean Claude Client with Live Data Integration
const { Anthropic } = require('@anthropic-ai/sdk');

// Import your live data system
const {
    getRayDalioMarketData,
    detectEconomicRegime,
    getYieldCurveAnalysis,
    getCreditSpreadAnalysis,
    getInflationExpectations,
    getSectorRotationSignals,
    getEnhancedLiveData,
    detectMarketAnomalies,
    generateMarketInsights
} = require('./liveData');

// Initialize Claude client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: 120000, // 2 minutes
    maxRetries: 3
});

// Debug configuration
console.log("🔧 Claude Client Configuration:");
console.log(`   API Key: ${process.env.ANTHROPIC_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   Model: ${process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'}`);

/**
 * Analyze conversation type for appropriate response complexity
 */
function analyzeConversationType(prompt) {
    const message = prompt.toLowerCase();
    
    // Simple/casual patterns
    const casualPatterns = [
        /^(hello|hi|hey|good morning|good afternoon)$/i,
        /^how are you\??$/i,
        /^what's up\??$/i,
        /^(thanks|thank you)$/i,
        /^(ok|okay|cool|great)$/i
    ];
    
    // Quick financial queries
    const quickPatterns = [
        /what's the (price|rate|yield) of/i,
        /should i (buy|sell|hold)/i,
        /is (.*) a good (buy|investment)/i,
        /what happened to/i,
        /why did (.*) (rise|fall|crash|surge)/i,
        /current (market|economic) conditions/i
    ];
    
    // Complex analysis patterns
    const complexPatterns = [
        /(strategy|strategic|portfolio|allocation)/i,
        /(regime|economic|macro|analysis)/i,
        /(risk|diversification|correlation)/i,
        /(cambodia|lending|fund|deal)/i,
        /(forecast|outlook|prediction)/i,
        /(comprehensive|detailed|thorough)/i,
        /(research|analyze|investigate)/i
    ];
    
    // Market data patterns
    const marketDataPatterns = [
        /(yield curve|credit spread|inflation)/i,
        /(fed rate|federal reserve|central bank)/i,
        /(market regime|economic regime)/i,
        /(sector rotation|vix|volatility)/i,
        /(anomaly|crisis|bubble)/i
    ];
    
    // Determine response type
    if (casualPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'casual',
            maxTokens: 200,
            temperature: 0.8,
            needsLiveData: false
        };
    }
    
    if (marketDataPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'market_data',
            maxTokens: 2000,
            temperature: 0.6,
            needsLiveData: true,
            dataType: 'comprehensive'
        };
    }
    
    if (quickPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'quick_analysis',
            maxTokens: 800,
            temperature: 0.7,
            needsLiveData: true,
            dataType: 'basic'
        };
    }
    
    if (complexPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'detailed_analysis',
            maxTokens: 3000,
            temperature: 0.6,
            needsLiveData: true,
            dataType: 'comprehensive'
        };
    }
    
    // Default
    return {
        type: 'balanced',
        maxTokens: 1200,
        temperature: 0.7,
        needsLiveData: true,
        dataType: 'basic'
    };
}

/**
 * Fetch appropriate live data based on query type
 */
async function fetchLiveData(conversationType, query) {
    try {
        if (!conversationType.needsLiveData) {
            return null;
        }
        
        console.log(`📊 Fetching ${conversationType.dataType} market data...`);
        
        const queryLower = query.toLowerCase();
        
        if (conversationType.dataType === 'comprehensive') {
            // Get comprehensive market data
            const [marketData, regime, anomalies] = await Promise.allSettled([
                getRayDalioMarketData(),
                detectEconomicRegime(),
                detectMarketAnomalies()
            ]);
            
            return {
                marketData: marketData.status === 'fulfilled' ? marketData.value : null,
                regime: regime.status === 'fulfilled' ? regime.value : null,
                anomalies: anomalies.status === 'fulfilled' ? anomalies.value : null,
                type: 'comprehensive'
            };
            
        } else if (queryLower.includes('yield') || queryLower.includes('curve')) {
            const yieldData = await getYieldCurveAnalysis();
            return { yieldCurve: yieldData, type: 'yield_curve' };
            
        } else if (queryLower.includes('credit') || queryLower.includes('spread')) {
            const creditData = await getCreditSpreadAnalysis();
            return { creditSpreads: creditData, type: 'credit_spreads' };
            
        } else if (queryLower.includes('regime')) {
            const regimeData = await detectEconomicRegime();
            return { regime: regimeData, type: 'regime' };
            
        } else {
            // Basic market data
            const basicData = await getEnhancedLiveData();
            return { marketData: basicData, type: 'basic' };
        }
        
    } catch (error) {
        console.error('📊 Live data fetch error:', error.message);
        return { error: error.message };
    }
}

/**
 * Create natural system prompt with live data context
 */
function createSystemPrompt(conversationType, liveData = null) {
    let systemPrompt = "You are Claude, an AI assistant created by Anthropic. You help with financial analysis and strategic thinking.";
    
    // Add appropriate expertise context based on conversation type
    switch (conversationType.type) {
        case 'casual':
            systemPrompt += " Respond naturally and briefly to casual questions.";
            break;
            
        case 'quick_analysis':
            systemPrompt += " Provide concise but insightful financial analysis. Be direct and actionable.";
            break;
            
        case 'market_data':
            systemPrompt += " You have access to real-time market data. Provide data-driven analysis with specific metrics and insights.";
            break;
            
        case 'detailed_analysis':
            systemPrompt += " Provide comprehensive strategic analysis. Use institutional-level thinking while remaining clear and actionable.";
            break;
            
        default:
            systemPrompt += " Provide helpful, informative responses adapted to the complexity of the question.";
    }
    
    // Add live data context if available
    if (liveData && !liveData.error) {
        systemPrompt += "\n\nCurrent market data available:\n" + formatLiveDataContext(liveData);
        systemPrompt += "\n\nUse this current data to inform your analysis when relevant.";
    }
    
    // Add general guidelines
    systemPrompt += "\n\nGuidelines:\n";
    systemPrompt += "- Be professional but conversational\n";
    systemPrompt += "- Provide specific, actionable insights when possible\n";
    systemPrompt += "- Acknowledge limitations and risks in financial analysis\n";
    systemPrompt += "- Use clear, jargon-free explanations\n";
    
    return systemPrompt;
}

/**
 * Format live data for system prompt context
 */
function formatLiveDataContext(liveData) {
    let context = "";
    
    if (liveData.type === 'comprehensive') {
        if (liveData.regime?.currentRegime) {
            const regime = liveData.regime.currentRegime;
            context += `Economic Regime: ${regime.name}\n`;
            context += `Growth: ${regime.growth}, Inflation: ${regime.inflation}\n`;
        }
        
        if (liveData.marketData?.economics) {
            const econ = liveData.marketData.economics;
            if (econ.fedRate) context += `Fed Rate: ${econ.fedRate.value}%\n`;
            if (econ.inflation) context += `Inflation: ${econ.inflation.value}%\n`;
            if (econ.unemployment) context += `Unemployment: ${econ.unemployment.value}%\n`;
        }
        
        if (liveData.anomalies?.anomalies?.length > 0) {
            context += `Market Anomalies: ${liveData.anomalies.anomalies.length} detected\n`;
        }
        
    } else if (liveData.yieldCurve) {
        context += `Yield Curve: ${liveData.yieldCurve.shape} (${liveData.yieldCurve.signal})\n`;
        
    } else if (liveData.creditSpreads) {
        context += `Credit Conditions: ${liveData.creditSpreads.conditions}\n`;
        
    } else if (liveData.regime) {
        context += `Economic Regime: ${liveData.regime.currentRegime?.name || 'Unknown'}\n`;
        
    } else if (liveData.marketData) {
        const data = liveData.marketData;
        if (data.economics?.fedRate) {
            context += `Fed Rate: ${data.economics.fedRate.value}%\n`;
        }
        if (data.crypto?.bitcoin) {
            context += `Bitcoin: $${data.crypto.bitcoin.usd?.toLocaleString()}\n`;
        }
    }
    
    return context.trim() || "Market data processing...";
}

/**
 * Main Claude analysis function
 */
async function getClaudeAnalysis(prompt, options = {}) {
    try {
        console.log('🔍 Claude analyzing query...');
        
        // Analyze conversation type
        const conversationType = analyzeConversationType(prompt);
        console.log(`📊 Conversation type: ${conversationType.type}`);
        
        // Fetch live data if needed
        let liveData = null;
        if (conversationType.needsLiveData && !options.skipLiveData) {
            liveData = await fetchLiveData(conversationType, prompt);
        }
        
        // Create system prompt
        const systemPrompt = createSystemPrompt(conversationType, liveData);
        
        // Prepare final options
        const finalOptions = {
            model: options.model || process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: options.maxTokens || conversationType.maxTokens,
            temperature: options.temperature || conversationType.temperature,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };
        
        // Execute Claude request
        const message = await anthropic.messages.create(finalOptions);
        const response = message.content[0].text;
        
        console.log(`✅ Claude analysis complete: ${conversationType.type} (${response.length} chars)`);
        return response;
        
    } catch (error) {
        console.error('❌ Claude analysis error:', error.message);
        
        if (error.message.includes('api_key')) {
            throw new Error('Claude API Key Error: Check ANTHROPIC_API_KEY environment variable.');
        } else if (error.message.includes('rate_limit')) {
            throw new Error('Claude Rate Limit: Request rate exceeded. Please wait.');
        } else if (error.message.includes('timeout')) {
            throw new Error('Claude Timeout: Request took too long. Try a shorter query.');
        } else {
            throw new Error(`Claude Error: ${error.message}`);
        }
    }
}

/**
 * Specialized functions for different analysis types
 */

// Quick market analysis with basic live data
async function getQuickMarketAnalysis(query, options = {}) {
    return await getClaudeAnalysis(query, {
        ...options,
        maxTokens: 800,
        temperature: 0.7
    });
}

// Comprehensive strategic analysis with full live data
async function getStrategicAnalysis(query, options = {}) {
    return await getClaudeAnalysis(query, {
        ...options,
        maxTokens: 3000,
        temperature: 0.6
    });
}

// Market regime analysis
async function getRegimeAnalysis(query, options = {}) {
    try {
        console.log('📊 Claude regime analysis...');
        
        const [regimeData, yieldCurve] = await Promise.allSettled([
            detectEconomicRegime(),
            getYieldCurveAnalysis()
        ]);
        
        let enhancedQuery = `Economic regime analysis: ${query}`;
        
        if (regimeData.status === 'fulfilled') {
            const regime = regimeData.value.currentRegime;
            enhancedQuery += `\n\nCurrent regime data: ${regime.name} - Growth: ${regime.growth}, Inflation: ${regime.inflation}`;
        }
        
        return await getClaudeAnalysis(enhancedQuery, {
            ...options,
            skipLiveData: true,
            maxTokens: 2000
        });
        
    } catch (error) {
        console.error('❌ Regime analysis error:', error.message);
        throw error;
    }
}

// Portfolio optimization
async function getPortfolioAnalysis(query, portfolioData = null, options = {}) {
    try {
        console.log('💎 Claude portfolio analysis...');
        
        let enhancedQuery = `Portfolio analysis: ${query}`;
        
        if (portfolioData) {
            enhancedQuery += `\n\nCurrent portfolio data:\n${JSON.stringify(portfolioData, null, 2)}`;
        }
        
        enhancedQuery += `\n\nProvide portfolio optimization recommendations considering current market conditions.`;
        
        return await getClaudeAnalysis(enhancedQuery, {
            ...options,
            maxTokens: 3000,
            temperature: 0.5
        });
        
    } catch (error) {
        console.error('❌ Portfolio analysis error:', error.message);
        throw error;
    }
}

// Cambodia market analysis
async function getCambodiaAnalysis(query, dealData = null, options = {}) {
    try {
        console.log('🇰🇭 Claude Cambodia analysis...');
        
        let enhancedQuery = `Cambodia market analysis: ${query}`;
        
        if (dealData) {
            enhancedQuery += `\n\nDeal details:\n`;
            enhancedQuery += `- Amount: $${dealData.amount?.toLocaleString() || 'TBD'}\n`;
            enhancedQuery += `- Type: ${dealData.type || 'Commercial'}\n`;
            enhancedQuery += `- Location: ${dealData.location || 'Phnom Penh'}\n`;
            enhancedQuery += `- Rate: ${dealData.rate || 'TBD'}%\n`;
            enhancedQuery += `- Term: ${dealData.term || 'TBD'} months`;
        }
        
        // Get basic global market context
        try {
            const basicData = await getEnhancedLiveData();
            if (basicData.economics?.fedRate) {
                enhancedQuery += `\n\nGlobal context: Fed Rate at ${basicData.economics.fedRate.value}%`;
            }
        } catch (error) {
            // Continue without global context
        }
        
        return await getClaudeAnalysis(enhancedQuery, {
            ...options,
            maxTokens: 2500
        });
        
    } catch (error) {
        console.error('❌ Cambodia analysis error:', error.message);
        throw error;
    }
}

// Anomaly detection analysis
async function getAnomalyAnalysis(query, options = {}) {
    try {
        console.log('🚨 Claude anomaly analysis...');
        
        const anomalies = await detectMarketAnomalies();
        
        let enhancedQuery = `Market anomaly analysis: ${query}`;
        
        if (anomalies.anomalies?.length > 0) {
            enhancedQuery += `\n\nCurrent anomalies detected: ${anomalies.anomalies.length}`;
            anomalies.anomalies.slice(0, 3).forEach((anomaly, index) => {
                enhancedQuery += `\n${index + 1}. ${anomaly.type}: ${anomaly.description}`;
            });
        } else {
            enhancedQuery += `\n\nNo significant market anomalies currently detected.`;
        }
        
        return await getClaudeAnalysis(enhancedQuery, {
            ...options,
            skipLiveData: true,
            maxTokens: 2000
        });
        
    } catch (error) {
        console.error('❌ Anomaly analysis error:', error.message);
        throw error;
    }
}

/**
 * Test functions
 */

// Test natural Claude response
async function testNaturalClaude() {
    try {
        console.log('🔍 Testing natural Claude response...');
        
        const message = await anthropic.messages.create({
            model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: 200,
            messages: [
                {
                    role: 'user',
                    content: 'What is your exact model name and who created you?'
                }
            ]
            // No system prompt - pure Claude
        });
        
        const response = message.content[0].text;
        console.log('✅ Natural Claude response:', response);
        return response;
        
    } catch (error) {
        console.error('❌ Natural Claude test failed:', error.message);
        return false;
    }
}

// Test connection
async function testConnection() {
    try {
        console.log('🔍 Testing Claude connection...');
        
        const response = await getClaudeAnalysis('Hello, can you confirm you are working?');
        console.log('✅ Connection test successful');
        return true;
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        return false;
    }
}

// System health check
async function checkSystemHealth() {
    const health = {
        claudeConnection: false,
        liveDataConnection: false,
        naturalResponses: false,
        errors: []
    };
    
    try {
        await testConnection();
        health.claudeConnection = true;
    } catch (error) {
        health.errors.push(`Claude: ${error.message}`);
    }
    
    try {
        await getEnhancedLiveData();
        health.liveDataConnection = true;
    } catch (error) {
        health.errors.push(`Live Data: ${error.message}`);
    }
    
    try {
        const response = await testNaturalClaude();
        health.naturalResponses = response.includes('Claude') && response.includes('Anthropic');
    } catch (error) {
        health.errors.push(`Natural Response: ${error.message}`);
    }
    
    health.overallHealth = health.claudeConnection && health.liveDataConnection && health.naturalResponses;
    
    return health;
}

// Get client metrics
function getMetrics() {
    return {
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
        maxTokens: 3000,
        timeout: 120000,
        retries: 3,
        conversationTypes: ['casual', 'quick_analysis', 'market_data', 'detailed_analysis', 'balanced'],
        liveDataIntegration: true,
        naturalResponses: true,
        capabilities: [
            'Natural conversation',
            'Financial analysis',
            'Live market data integration',
            'Economic regime detection',
            'Portfolio optimization',
            'Cambodia market expertise',
            'Anomaly detection',
            'Strategic planning'
        ]
    };
}

module.exports = {
    // Main analysis functions
    getClaudeAnalysis,
    getQuickMarketAnalysis,
    getStrategicAnalysis,
    getRegimeAnalysis,
    getPortfolioAnalysis,
    getCambodiaAnalysis,
    getAnomalyAnalysis,
    
    // Utility functions
    analyzeConversationType,
    fetchLiveData,
    createSystemPrompt,
    formatLiveDataContext,
    
    // Test functions
    testNaturalClaude,
    testConnection,
    checkSystemHealth,
    getMetrics,
    
    // Claude client instance
    anthropic
};
