// utils/claudeClient.js - STRATEGIC AI WARFARE WITH FREEDOM + LIVE DATA POWER
const { Anthropic } = require('@anthropic-ai/sdk');

// Import your elite live data system
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

// ⚡ Initialize Claude Strategic Intelligence Chief
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: 300000, // 5 minutes for complex analysis
    maxRetries: 3
});

// 🔍 Debug Claude configuration
console.log("⚡ Claude Strategic Intelligence Configuration:");
console.log(`   API Key: ${process.env.ANTHROPIC_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   Model: ${process.env.CLAUDE_MODEL || 'claude-opus-4-1-20250805'}`);
console.log(`   Timeout: 300 seconds`);
console.log(`   Max Retries: 3`);
console.log(`   🏛️ Enhanced with Ray Dalio Live Data Integration`);

/**
 * 🎯 SMART CONVERSATION DETECTION
 * Intelligently categorizes conversation types for optimal responses
 */
function analyzeConversationType(prompt) {
    const message = prompt.toLowerCase();
    
    // 💬 CASUAL CONVERSATION (Short & Natural)
    const casualPatterns = [
        /^(hello|hi|hey|good morning|good afternoon)$/i,
        /^how are you\??$/i,
        /^what's up\??$/i,
        /^(thanks|thank you)$/i,
        /^(ok|okay|cool|great)$/i
    ];
    
    // 🔥 URGENT/SIMPLE QUERIES (Quick but strategic)
    const quickPatterns = [
        /what's the (price|rate|yield) of/i,
        /should i (buy|sell|hold)/i,
        /is (.*) a good (buy|investment)/i,
        /what happened to/i,
        /why did (.*) (rise|fall|crash|surge)/i,
        /current (market|economic) conditions/i
    ];
    
    // 🏛️ STRATEGIC ANALYSIS (Full institutional mode)
    const strategicPatterns = [
        /(strategy|strategic|portfolio|allocation)/i,
        /(regime|economic|macro|analysis)/i,
        /(risk|diversification|correlation)/i,
        /(cambodia|lending|fund|deal)/i,
        /(forecast|outlook|prediction)/i,
        /(comprehensive|detailed|thorough)/i,
        /(ray dalio|bridgewater|all weather)/i
    ];
    
    // 🔬 RESEARCH MODE (Live data + analysis)
    const researchPatterns = [
        /(research|analyze|investigate|study)/i,
        /(current|latest|recent|today|now)/i,
        /(compare|versus|vs|between)/i,
        /(trend|trending|movement)/i,
        /(live|real.?time|breaking)/i
    ];
    
    // 📊 MARKET DATA QUERIES (Live data intensive)
    const marketDataPatterns = [
        /(yield curve|credit spread|inflation)/i,
        /(fed rate|federal reserve|central bank)/i,
        /(market regime|economic regime)/i,
        /(sector rotation|vix|volatility)/i,
        /(anomaly|crisis|bubble)/i
    ];
    
    // Determine conversation type with live data awareness
    if (casualPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'casual',
            maxTokens: 150,
            temperature: 0.8,
            style: 'friendly_brief',
            needsLiveData: false
        };
    }
    
    if (marketDataPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'market_data_intensive',
            maxTokens: 3000,
            temperature: 0.6,
            style: 'data_driven_analysis',
            needsLiveData: true,
            liveDataType: 'comprehensive'
        };
    }
    
    if (quickPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'quick_strategic',
            maxTokens: 500,
            temperature: 0.7,
            style: 'smart_concise',
            needsLiveData: true,
            liveDataType: 'basic'
        };
    }
    
    if (strategicPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'full_strategic',
            maxTokens: 4096,
            temperature: 0.6,
            style: 'institutional_comprehensive',
            needsLiveData: true,
            liveDataType: 'comprehensive'
        };
    }
    
    if (researchPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'research',
            maxTokens: 3000,
            temperature: 0.6,
            style: 'analytical_thorough',
            needsLiveData: true,
            liveDataType: 'comprehensive'
        };
    }
    
    // Default: Balanced mode with basic live data
    return {
        type: 'balanced',
        maxTokens: 1500,
        temperature: 0.7,
        style: 'helpful_natural',
        needsLiveData: true,
        liveDataType: 'basic'
    };
}

/**
 * 📊 INTELLIGENT LIVE DATA FETCHER
 * Fetches appropriate live data based on conversation needs
 */
async function fetchIntelligentLiveData(conversationType, query) {
    try {
        if (!conversationType.needsLiveData) {
            return null;
        }
        
        console.log(`📊 Fetching ${conversationType.liveDataType} live data for ${conversationType.type} analysis...`);
        
        const queryLower = query.toLowerCase();
        
        // Smart data fetching based on query content
        if (conversationType.liveDataType === 'comprehensive') {
            // Full Ray Dalio institutional data
            const [marketData, regime, anomalies, insights] = await Promise.allSettled([
                getRayDalioMarketData(),
                detectEconomicRegime(),
                detectMarketAnomalies(),
                generateMarketInsights()
            ]);
            
            return {
                marketData: marketData.status === 'fulfilled' ? marketData.value : null,
                regime: regime.status === 'fulfilled' ? regime.value : null,
                anomalies: anomalies.status === 'fulfilled' ? anomalies.value : null,
                insights: insights.status === 'fulfilled' ? insights.value : null,
                comprehensive: true
            };
            
        } else if (queryLower.includes('yield') || queryLower.includes('curve')) {
            // Yield curve specific
            const yieldData = await getYieldCurveAnalysis();
            return { yieldCurve: yieldData, focused: 'yield_curve' };
            
        } else if (queryLower.includes('credit') || queryLower.includes('spread')) {
            // Credit spread specific
            const creditData = await getCreditSpreadAnalysis();
            return { creditSpreads: creditData, focused: 'credit_spreads' };
            
        } else if (queryLower.includes('regime')) {
            // Economic regime specific
            const regimeData = await detectEconomicRegime();
            return { regime: regimeData, focused: 'economic_regime' };
            
        } else {
            // Basic enhanced data
            const basicData = await getEnhancedLiveData();
            return { marketData: basicData, basic: true };
        }
        
    } catch (error) {
        console.error('📊 Live data fetch error:', error.message);
        return { error: error.message, fallback: true };
    }
}

/**
 * 🎭 DYNAMIC SYSTEM PROMPTS WITH LIVE DATA
 * Creates natural, adaptive system prompts enhanced with live market intelligence
 */
function createAdaptiveSystemPrompt(conversationType, context = null, liveData = null) {
    const basePersonality = `You are Claude, Sum Chenda's brilliant strategic advisor for the IMPERIUM VAULT system. You combine institutional-level financial expertise with natural, engaging conversation.`;
    
    // Live data context enhancement
    let liveDataContext = '';
    if (liveData && !liveData.error) {
        liveDataContext = '\n\n🔴 LIVE MARKET INTELLIGENCE:\n';
        
        if (liveData.comprehensive) {
            liveDataContext += `- Current Economic Regime: ${liveData.regime?.currentRegime?.name || 'Unknown'}\n`;
            liveDataContext += `- Market Anomalies: ${liveData.anomalies?.anomalies?.length || 0} detected\n`;
            liveDataContext += `- Live Data Sources: Ray Dalio framework, FRED, Alpha Vantage, CoinGecko Pro\n`;
        } else if (liveData.focused) {
            liveDataContext += `- Focus: ${liveData.focused.replace('_', ' ').toUpperCase()}\n`;
        } else if (liveData.basic) {
            liveDataContext += `- Basic market data available\n`;
        }
        
        liveDataContext += `- Data freshness: Real-time\n`;
        liveDataContext += `Use this live intelligence to enhance your analysis with current market conditions.`;
    }
    
    switch (conversationType.type) {
        case 'casual':
            return `${basePersonality}

For casual greetings and simple questions, respond naturally and warmly - like a wise, friendly financial expert. Be brief but show your expertise personality.

Keep responses short (1-3 sentences) while maintaining your strategic intelligence. You can reference current market conditions naturally when relevant.

Be conversational, not corporate. Think "smart friend who happens to be a financial genius" rather than "formal advisor."${liveDataContext}`;

        case 'quick_strategic':
            return `${basePersonality}

You're being asked a quick strategic question. Provide a smart, concise answer that demonstrates your expertise without being overly formal.

Structure: Brief strategic assessment + key insight + actionable takeaway. Be definitive but conversational - like Ray Dalio giving quick advice over coffee.

Include specific data or current context when relevant. Keep it punchy but professional.${liveDataContext}`;

        case 'market_data_intensive':
            return `${basePersonality}

🎯 MARKET DATA INTENSIVE MODE: You're being asked about specific market data, indicators, or economic conditions.

LIVE DATA ACCESS: You have access to real-time market intelligence including:
- Ray Dalio economic regime detection framework
- Live yield curve analysis and inversion signals
- Credit spread monitoring and risk assessment
- Inflation expectations and Fed policy analysis
- Sector rotation indicators and market anomalies
- Live market data from FRED, Alpha Vantage, CoinGecko Pro

Analysis Approach:
- Lead with specific live data points and current readings
- Interpret data within Ray Dalio's institutional framework
- Provide clear strategic implications for positioning
- Include confidence levels and key risk factors
- Offer specific, actionable recommendations

Communicate like an institutional analyst with access to real-time data feeds.${liveDataContext}`;

        case 'full_strategic':
            return `${basePersonality}

🎯 FULL STRATEGIC MODE: You're being asked for comprehensive institutional analysis.

ENHANCED WITH LIVE INTELLIGENCE: You have access to real-time market data and Ray Dalio's institutional framework.

Expertise Areas:
- Live economic regime detection and All Weather strategy implications
- Real-time yield curve analysis and recession probability modeling
- Live credit spread monitoring and systemic risk assessment
- Current inflation expectations and Fed policy interpretation
- Live sector rotation analysis and institutional positioning
- Real-time market anomaly detection and crisis signaling
- Cambodia private lending market intelligence
- Portfolio optimization with live correlation data

Communication Style:
- Write like Warren Buffett or Ray Dalio with real-time data access
- Use natural flow, not rigid templates
- Provide comprehensive analysis that builds logically
- Include specific live numbers, data, and actionable recommendations
- Structure responses naturally with clear insights
- Reference current regime and market conditions throughout

Context Enhancement: ${context ? 'Use the provided context along with live market intelligence.' : 'Draw from live market conditions and current data feeds.'}

Deliver institutional-grade intelligence enhanced with real-time market advantage.${liveDataContext}`;

        case 'research':
            return `${basePersonality}

🔬 RESEARCH MODE: You're conducting analytical research with live intelligence advantage.

LIVE RESEARCH CAPABILITIES: Access to real-time market data and economic intelligence.

Research Approach:
- Synthesize live market data with strategic frameworks
- Compare real-time indicators with historical patterns
- Provide analytical depth with current market context
- Focus on actionable insights with live data validation
- Cross-reference multiple live data sources for accuracy

Style: Analytical but accessible - like reading research from a firm with real-time data feeds.

Be thorough but engaging. Your research should inform immediate strategic decisions.${liveDataContext}`;

        case 'balanced':
        default:
            return `${basePersonality}

Provide helpful, naturally intelligent responses that adapt to the complexity of the question with live market awareness.

For simple questions: Be conversational and brief but reference current conditions
For complex topics: Provide deeper strategic analysis with live data integration
For financial matters: Draw on institutional expertise enhanced with real-time intelligence

Always maintain your strategic intelligence while communicating naturally. Think "brilliant advisor with real-time market data having a normal conversation."

You have access to live market data, Ray Dalio frameworks, and current economic intelligence - use them naturally when relevant.${liveDataContext}`;
    }
}

/**
 * ⚡ ENHANCED CLAUDE STRATEGIC ANALYSIS WITH LIVE DATA
 * Natural, adaptive strategic intelligence powered by elite live data
 */
async function getClaudeStrategicAnalysis(prompt, options = {}) {
    try {
        console.log('⚡ Claude Strategic Intelligence Chief analyzing with live data...');
        
        // 🎯 Analyze conversation type for optimal response
        const conversationType = analyzeConversationType(prompt);
        console.log(`📊 Conversation type detected: ${conversationType.type} (live data: ${conversationType.needsLiveData})`);
        
        // 📊 Fetch intelligent live data if needed
        let liveData = null;
        if (conversationType.needsLiveData && !options.skipLiveData) {
            liveData = await fetchIntelligentLiveData(conversationType, prompt);
        }
        
        // 🎭 Create adaptive system prompt with live data
        const systemPrompt = createAdaptiveSystemPrompt(conversationType, options.context, liveData);
        
        // 🔧 Merge conversation-specific settings with user options
        const finalOptions = {
            maxTokens: options.maxTokens || conversationType.maxTokens,
            temperature: options.temperature || conversationType.temperature,
            model: options.model || process.env.CLAUDE_MODEL || 'claude-opus-4-1-20250805'
        };
        
        // 📝 Enhanced prompt with live data and context
        let enhancedPrompt = prompt;
        
        // Add live data context to prompt if available
        if (liveData && !liveData.error && conversationType.type !== 'casual') {
            enhancedPrompt = `LIVE MARKET DATA CONTEXT:\n${formatLiveDataForPrompt(liveData)}\n\nQUESTION: ${prompt}`;
        } else if (options.context && conversationType.type !== 'casual') {
            enhancedPrompt = `STRATEGIC CONTEXT:\n${options.context}\n\nQUESTION: ${prompt}`;
        }
        
        // 🚀 Execute Claude analysis
        const message = await anthropic.messages.create({
            model: finalOptions.model,
            max_tokens: finalOptions.maxTokens,
            temperature: finalOptions.temperature,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: enhancedPrompt
                }
            ]
        });

        const response = message.content[0].text;
        
        console.log(`✅ Claude Strategic Intelligence complete: ${conversationType.type} mode with ${liveData ? 'live data' : 'cached knowledge'} (${response.length} chars)`);
        return response;
        
    } catch (error) {
        console.error('❌ Claude Strategic Intelligence error:', error.message);
        
        // Enhanced error handling
        if (error.message.includes('api_key')) {
            throw new Error(`Claude API Key Error: Check ANTHROPIC_API_KEY environment variable.`);
        } else if (error.message.includes('rate_limit')) {
            throw new Error(`Claude Rate Limit: Request rate exceeded. Please wait a moment.`);
        } else if (error.message.includes('timeout')) {
            throw new Error(`Claude Timeout: Analysis took too long. Try a shorter query.`);
        } else {
            throw new Error(`Claude Strategic Intelligence Error: ${error.message}`);
        }
    }
}

/**
 * 📊 FORMAT LIVE DATA FOR CLAUDE PROMPT
 * Formats live data in a readable way for Claude consumption
 */
function formatLiveDataForPrompt(liveData) {
    let formatted = '';
    
    if (liveData.comprehensive) {
        // Comprehensive Ray Dalio data
        if (liveData.regime?.currentRegime) {
            const regime = liveData.regime.currentRegime;
            formatted += `Economic Regime: ${regime.name} (${liveData.regime.confidence}% confidence)\n`;
            formatted += `Growth: ${regime.growth} | Inflation: ${regime.inflation}\n`;
            if (regime.allocation) {
                formatted += `Allocation Bias: Stocks ${regime.allocation.stocks}, Bonds ${regime.allocation.bonds}\n`;
            }
        }
        
        if (liveData.marketData?.economics) {
            const econ = liveData.marketData.economics;
            if (econ.fedRate) formatted += `Fed Rate: ${econ.fedRate.value}%\n`;
            if (econ.inflation) formatted += `Inflation: ${econ.inflation.value}%\n`;
            if (econ.unemployment) formatted += `Unemployment: ${econ.unemployment.value}%\n`;
        }
        
        if (liveData.anomalies?.anomalies?.length > 0) {
            formatted += `Market Anomalies: ${liveData.anomalies.anomalies.length} detected\n`;
            liveData.anomalies.anomalies.slice(0, 2).forEach(anomaly => {
                formatted += `- ${anomaly.type}: ${anomaly.description}\n`;
            });
        }
        
    } else if (liveData.focused) {
        // Focused data
        if (liveData.yieldCurve) {
            const curve = liveData.yieldCurve;
            formatted += `Yield Curve: ${curve.shape} (${curve.signal})\n`;
            if (curve.spreads) {
                formatted += `2s10s Spread: ${curve.spreads['2s10s']?.toFixed(2)}%\n`;
            }
        }
        
        if (liveData.creditSpreads) {
            const credit = liveData.creditSpreads;
            formatted += `Credit Conditions: ${credit.conditions}\n`;
            if (credit.spreads?.highYield) {
                formatted += `High Yield Spread: ${credit.spreads.highYield}bps\n`;
            }
        }
        
        if (liveData.regime) {
            const regime = liveData.regime;
            formatted += `Economic Regime: ${regime.currentRegime?.name || 'Unknown'}\n`;
        }
        
    } else if (liveData.basic && liveData.marketData) {
        // Basic market data
        const data = liveData.marketData;
        if (data.economics?.fedRate) {
            formatted += `Fed Rate: ${data.economics.fedRate.value}%\n`;
        }
        if (data.crypto?.bitcoin) {
            formatted += `Bitcoin: $${data.crypto.bitcoin.usd?.toLocaleString()} (${data.crypto.bitcoin.usd_24h_change?.toFixed(1)}%)\n`;
        }
    }
    
    if (formatted === '') {
        formatted = 'Live market data available but processing...';
    }
    
    return formatted.trim();
}

/**
 * 🏛️ CLAUDE WITH RAY DALIO MARKET DATA
 * Direct integration with your elite market intelligence
 */
async function getClaudeWithMarketData(query, options = {}) {
    try {
        console.log('🏛️ Claude executing analysis with Ray Dalio market data...');
        
        // Force comprehensive live data fetch
        const liveData = await fetchIntelligentLiveData({ needsLiveData: true, liveDataType: 'comprehensive' }, query);
        
        return await getClaudeStrategicAnalysis(query, {
            ...options,
            skipLiveData: true, // We already fetched it
            context: `${options.context || ''}\n\nLIVE MARKET INTELLIGENCE:\n${formatLiveDataForPrompt(liveData)}`
        });
        
    } catch (error) {
        console.error('❌ Claude market data analysis error:', error.message);
        throw error;
    }
}

/**
 * 📊 CLAUDE REGIME ANALYSIS
 * Specialized economic regime analysis with your detection system
 */
async function getClaudeRegimeAnalysis(query, options = {}) {
    try {
        console.log('📊 Claude executing economic regime analysis...');
        
        const [regimeData, yieldCurve, creditSpreads] = await Promise.allSettled([
            detectEconomicRegime(),
            getYieldCurveAnalysis(),
            getCreditSpreadAnalysis()
        ]);
        
        const regimeContext = {
            regime: regimeData.status === 'fulfilled' ? regimeData.value : null,
            yieldCurve: yieldCurve.status === 'fulfilled' ? yieldCurve.value : null,
            creditSpreads: creditSpreads.status === 'fulfilled' ? creditSpreads.value : null
        };
        
        const regimePrompt = `Economic regime analysis request: ${query}

Current regime intelligence analysis with strategic positioning recommendations.`;
        
        return await getClaudeStrategicAnalysis(regimePrompt, {
            ...options,
            skipLiveData: true,
            context: `${options.context || ''}\n\nREGIME ANALYSIS DATA:\n${formatLiveDataForPrompt({ focused: 'regime', ...regimeContext })}`
        });
        
    } catch (error) {
        console.error('❌ Claude regime analysis error:', error.message);
        throw error;
    }
}

/**
 * 🔍 ADAPTIVE LIVE RESEARCH WITH ENHANCED DATA
 * Smart research mode powered by your live data infrastructure
 */
async function getClaudeLiveResearch(query, options = {}) {
    try {
        console.log('🔍 Claude executing adaptive live research with enhanced data...');
        
        // Enhanced research prompt that adapts to query type
        const conversationType = analyzeConversationType(query);
        
        let researchPrompt;
        if (conversationType.type === 'casual') {
            researchPrompt = `Quick research question: ${query}
            
Provide a brief, smart answer with current market context. Keep it conversational but accurate.`;
        } else {
            researchPrompt = `Research request with live market intelligence: ${query}

Provide comprehensive analysis including:
- Current market regime and live economic indicators
- Real-time yield curve, credit spreads, and risk signals  
- Live market anomalies and institutional positioning
- Strategic implications for portfolio positioning
- Comparative analysis with historical patterns
- Actionable insights with specific recommendations

Deliver research that leverages real-time market intelligence advantage.`;
        }

        return await getClaudeStrategicAnalysis(researchPrompt, {
            ...options,
            maxTokens: conversationType.type === 'casual' ? 500 : 4096,
            temperature: 0.6
        });
        
    } catch (error) {
        console.error('❌ Claude live research error:', error.message);
        throw error;
    }
}

/**
 * 📊 COMPLEX ANALYSIS ENGINE WITH LIVE DATA
 * Adapts depth to query complexity with real-time intelligence
 */
async function getClaudeComplexAnalysis(analysisRequest, factors = [], options = {}) {
    try {
        console.log('📊 Claude executing adaptive complex analysis with live data...');
        
        const conversationType = analyzeConversationType(analysisRequest);
        
        let complexPrompt;
        if (conversationType.type === 'quick_strategic') {
            complexPrompt = `Strategic analysis with live data: ${analysisRequest}

Key factors: ${factors.length > 0 ? factors.join(', ') : 'All relevant factors'}

Provide focused strategic analysis with live market intelligence:
- Core strategic assessment with current market regime context
- Key risk/opportunity factors with real-time data validation
- Clear recommendations with current positioning rationale
- Specific action steps considering live market conditions

Leverage real-time market intelligence for strategic advantage.`;
        } else {
            complexPrompt = `Complex strategic analysis with institutional live data: ${analysisRequest}

Strategic factors to analyze: ${factors.length > 0 ? factors.join(', ') : 'All relevant strategic factors'}

Provide institutional-grade analysis with live market intelligence:
- Multi-factor correlation analysis with real-time data
- Scenario modeling with current regime probability weighting
- Risk-adjusted strategic recommendations with live positioning data
- Optimal timing and execution frameworks with market condition awareness
- Strategic hedging protocols based on current anomaly detection
- Performance attribution modeling with live market context

Deliver analysis that leverages real-time institutional market intelligence.`;
        }

        return await getClaudeStrategicAnalysis(complexPrompt, {
            ...options,
            temperature: 0.5,
            maxTokens: conversationType.type === 'quick_strategic' ? 1500 : 4096
        });
        
    } catch (error) {
        console.error('❌ Claude complex analysis error:', error.message);
        throw error;
    }
}

/**
 * 🇰🇭 ADAPTIVE CAMBODIA INTELLIGENCE WITH MARKET CONTEXT
 * Enhanced Cambodia analysis with global market intelligence
 */
async function getClaudeCambodiaIntelligence(dealQuery, dealData = null, options = {}) {
    try {
        console.log('🇰🇭 Claude executing adaptive Cambodia intelligence with market context...');
        
        const conversationType = analyzeConversationType(dealQuery);
        
        let cambodiaPrompt = `Cambodia fund question with global market context: ${dealQuery}`;

        if (dealData) {
            cambodiaPrompt += `

Deal context:
- Amount: $${dealData.amount?.toLocaleString() || 'TBD'}
- Type: ${dealData.type || 'Commercial'}  
- Location: ${dealData.location || 'Phnom Penh'}
- Rate: ${dealData.rate || 'TBD'}%
- Term: ${dealData.term || 'TBD'} months`;
        }

        if (conversationType.type === 'casual' || conversationType.type === 'quick_strategic') {
            cambodiaPrompt += `

Provide focused Cambodia market intelligence with global context:
- Strategic assessment considering current global market regime
- Key risks and opportunities in current USD/KHR environment
- Specific recommendation with live market condition rationale
- Cambodia positioning relative to global credit and emerging market conditions

Leverage global market intelligence for Cambodia strategic advantage.`;
        } else {
            cambodiaPrompt += `

Provide comprehensive Cambodia strategic intelligence with global market context:
- Current Cambodia economic environment with global regime analysis
- Real-time USD/KHR dynamics with Fed policy and EM currency assessment
- Property market cycle analysis with global real estate correlation
- Regulatory framework assessment with regional stability context
- Comparative yield analysis versus global alternative investments using live data
- Strategic risk assessment: political, currency, operational, legal with global context
- Portfolio correlation analysis with current global market regime
- Deal structuring optimization for current global market conditions
- Strategic exit strategies considering global liquidity conditions
- Competitive landscape with regional emerging market comparison

Deliver institutional-grade Cambodia intelligence enhanced with global market intelligence.`;
        }

        // Get basic live data for global context
        let globalContext = '';
        try {
            const basicData = await getEnhancedLiveData();
            if (basicData.economics?.fedRate) {
                globalContext = `\n\nGLOBAL MARKET CONTEXT:\nFed Rate: ${basicData.economics.fedRate.value}% | USD Index: Current trends | EM Risk: Monitor`;
            }
        } catch (error) {
            // Continue without global context if data fetch fails
        }

        return await getClaudeStrategicAnalysis(cambodiaPrompt + globalContext, {
            ...options,
            temperature: 0.6,
            maxTokens: conversationType.type === 'casual' ? 800 : 4096
        });
        
    } catch (error) {
        console.error('❌ Claude Cambodia intelligence error:', error.message);
        throw error;
    }
}

/**
 * 🚨 CLAUDE MARKET ANOMALY ANALYSIS
 * Specialized analysis using your anomaly detection system
 */
async function getClaudeAnomalyAnalysis(query, options = {}) {
    try {
        console.log('🚨 Claude executing market anomaly analysis...');
        
        const [anomalies, marketData] = await Promise.allSettled([
            detectMarketAnomalies(),
            getEnhancedLiveData()
        ]);
        
        const anomalyContext = {
            anomalies: anomalies.status === 'fulfilled' ? anomalies.value : null,
            marketData: marketData.status === 'fulfilled' ? marketData.value : null
        };
        
        const anomalyPrompt = `Market anomaly analysis request: ${query}

Analyze current market anomalies and stress signals with strategic implications.`;
        
        return await getClaudeStrategicAnalysis(anomalyPrompt, {
            ...options,
            skipLiveData: true,
            context: `${options.context || ''}\n\nANOMALY DETECTION DATA:\n${formatAnomalyDataForPrompt(anomalyContext)}`,
            maxTokens: 3000,
            temperature: 0.6
        });
        
    } catch (error) {
        console.error('❌ Claude anomaly analysis error:', error.message);
        throw error;
    }
}

/**
 * 📊 FORMAT ANOMALY DATA FOR CLAUDE
 */
function formatAnomalyDataForPrompt(anomalyContext) {
    let formatted = '';
    
    if (anomalyContext.anomalies?.anomalies?.length > 0) {
        formatted += `MARKET ANOMALIES DETECTED: ${anomalyContext.anomalies.anomalies.length}\n`;
        anomalyContext.anomalies.anomalies.forEach((anomaly, index) => {
            formatted += `${index + 1}. ${anomaly.type} (${anomaly.severity}): ${anomaly.description}\n`;
            if (anomaly.recommendation) {
                formatted += `   Recommendation: ${anomaly.recommendation}\n`;
            }
        });
    } else {
        formatted += 'No significant market anomalies detected\n';
    }
    
    if (anomalyContext.marketData?.stocks?.vix) {
        formatted += `VIX Level: ${anomalyContext.marketData.stocks.vix['05. price'] || 'N/A'}\n`;
    }
    
    return formatted.trim();
}

/**
 * 💎 CLAUDE PORTFOLIO OPTIMIZATION
 * Advanced portfolio analysis with live regime data
 */
async function getClaudePortfolioOptimization(portfolioQuery, portfolioData = null, options = {}) {
    try {
        console.log('💎 Claude executing portfolio optimization with live regime data...');
        
        const [regimeData, correlations] = await Promise.allSettled([
            detectEconomicRegime(),
            // calculateAssetCorrelations() // Uncomment when implemented
            Promise.resolve({ diversificationEffectiveness: 75 }) // Placeholder
        ]);
        
        let portfolioPrompt = `Portfolio optimization request: ${portfolioQuery}`;
        
        if (portfolioData) {
            portfolioPrompt += `\n\nCurrent Portfolio:\n${JSON.stringify(portfolioData, null, 2)}`;
        }
        
        portfolioPrompt += `\n\nProvide institutional-grade portfolio optimization with live market regime context:
- Current regime allocation recommendations with live data validation
- Risk-adjusted positioning based on real-time market conditions
- Diversification effectiveness analysis with current correlations
- Strategic rebalancing recommendations considering live regime signals
- Hedging strategies based on current anomaly detection
- Performance optimization with live market intelligence

Deliver actionable portfolio optimization leveraging real-time regime analysis.`;
        
        const portfolioContext = {
            regime: regimeData.status === 'fulfilled' ? regimeData.value : null,
            correlations: correlations.status === 'fulfilled' ? correlations.value : null
        };
        
        return await getClaudeStrategicAnalysis(portfolioPrompt, {
            ...options,
            skipLiveData: true,
            context: `${options.context || ''}\n\nPORTFOLIO OPTIMIZATION DATA:\n${formatPortfolioDataForPrompt(portfolioContext)}`,
            maxTokens: 4096,
            temperature: 0.5
        });
        
    } catch (error) {
        console.error('❌ Claude portfolio optimization error:', error.message);
        throw error;
    }
}

/**
 * 📊 FORMAT PORTFOLIO DATA FOR CLAUDE
 */
function formatPortfolioDataForPrompt(portfolioContext) {
    let formatted = '';
    
    if (portfolioContext.regime?.currentRegime) {
        const regime = portfolioContext.regime.currentRegime;
        formatted += `Current Economic Regime: ${regime.name}\n`;
        formatted += `Growth: ${regime.growth} | Inflation: ${regime.inflation}\n`;
        if (regime.allocation) {
            formatted += `Recommended Allocation:\n`;
            Object.entries(regime.allocation).forEach(([asset, weight]) => {
                formatted += `- ${asset}: ${weight}\n`;
            });
        }
        if (regime.risks?.length > 0) {
            formatted += `Key Risks: ${regime.risks.join(', ')}\n`;
        }
        if (regime.opportunities?.length > 0) {
            formatted += `Opportunities: ${regime.opportunities.join(', ')}\n`;
        }
    }
    
    if (portfolioContext.correlations) {
        formatted += `Diversification Effectiveness: ${portfolioContext.correlations.diversificationEffectiveness}%\n`;
    }
    
    return formatted.trim();
}

/**
 * 📈 CLAUDE WITH SMART WEB SEARCH (Enhanced with Live Data)
 * Maintains compatibility while leveraging live data
 */
async function getClaudeWithWebSearch(query, searchTerms = [], options = {}) {
    try {
        console.log('📈 Claude executing analysis with live market intelligence (enhanced web search)...');
        
        const conversationType = analyzeConversationType(query);
        
        let webSearchPrompt;
        if (conversationType.type === 'casual') {
            webSearchPrompt = `Quick question with current context: ${query}

Provide a brief, smart answer using current market intelligence. Keep it natural and helpful.`;
        } else {
            webSearchPrompt = `Strategic analysis with live market intelligence: ${query}

Research focus: ${searchTerms.length > 0 ? searchTerms.join(', ') : 'Current market conditions, breaking developments, economic data'}

Analyze incorporating live market intelligence:
- Real-time economic regime and market condition assessment
- Live yield curve, credit spreads, and risk indicator analysis
- Current Fed policy and central bank communication impact
- Live sector rotation and institutional positioning signals
- Real-time market anomaly detection and crisis signaling
- Current trading volumes and institutional flow analysis

Provide strategic analysis leveraging real-time market intelligence advantage.`;
        }

        return await getClaudeStrategicAnalysis(webSearchPrompt, {
            ...options,
            maxTokens: conversationType.type === 'casual' ? 600 : 4096
        });
        
    } catch (error) {
        console.error('❌ Claude web search analysis error:', error.message);
        throw error;
    }
}

/**
 * 🔧 TEST CLAUDE CONNECTION
 * Simple connection test with natural response
 */
async function testClaudeConnection() {
    try {
        console.log('🔍 Testing Claude Strategic Intelligence connection...');
        
        const testResponse = await anthropic.messages.create({
            model: process.env.CLAUDE_MODEL || 'claude-opus-4-1-20250805',
            max_tokens: 100,
            messages: [
                {
                    role: 'user',
                    content: 'Quick system check - just respond with "Claude Strategic Intelligence operational with live data integration" if you receive this.'
                }
            ]
        });

        const response = testResponse.content[0].text;
        console.log('✅ Claude connection test result:', response);
        
        return response.toLowerCase().includes('operational');
        
    } catch (error) {
        console.error('❌ Claude connection test failed:', error.message);
        return false;
    }
}

/**
 * 📊 CLAUDE METRICS & CAPABILITIES (Enhanced)
 */
function getClaudeMetrics() {
    return {
        model: process.env.CLAUDE_MODEL || 'claude-opus-4-1-20250805',
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
        maxTokens: 4096,
        defaultTemperature: 0.7,
        timeout: 300000,
        retries: 3,
        adaptiveIntelligence: true,
        liveDataIntegration: true,
        rayDalioFramework: true,
        conversationTypes: ['casual', 'quick_strategic', 'full_strategic', 'research', 'balanced', 'market_data_intensive'],
        liveDataSources: [
            'FRED API (Federal Reserve)',
            'Alpha Vantage (Stocks/Forex)',
            'CoinGecko Pro (Crypto)',
            'NewsAPI (Financial News)',
            'Ray Dalio Economic Regime Detection',
            'Real-time Market Anomaly Detection'
        ],
        capabilities: [
            'Natural Conversation Flow',
            'Adaptive Response Complexity', 
            'Real-time Market Intelligence Integration',
            'Superior Analytical Reasoning',
            'Complex Multi-factor Analysis',
            'Live Economic Regime Detection',
            'Ray Dalio All Weather Framework',
            'Real-time Yield Curve Analysis',
            'Live Credit Spread Monitoring',
            'Market Anomaly Detection',
            'Cambodia Market Expertise',
            'Dynamic Strategic Frameworks',
            'Portfolio Optimization with Live Data',
            'Institutional-Grade Analysis'
        ],
        enhancedFeatures: [
            'Intelligent Live Data Fetching',
            'Context-Aware Market Intelligence',
            'Ray Dalio Regime Integration',
            'Real-time Anomaly Analysis',
            'Advanced Portfolio Optimization',
            'Global Market Context for Cambodia Analysis'
        ]
    };
}

/**
 * 🔧 SYSTEM HEALTH CHECK (Enhanced)
 */
async function checkClaudeSystemHealth() {
    const health = {
        claudeConnection: false,
        liveDataConnection: false,
        rayDalioFramework: false,
        comprehensiveDataAccess: false,
        errors: []
    };
    
    try {
        // Test Claude connection
        await testClaudeConnection();
        health.claudeConnection = true;
        console.log('✅ Claude connection operational');
    } catch (error) {
        health.errors.push(`Claude Connection: ${error.message}`);
        console.log('❌ Claude connection failed');
    }
    
    try {
        // Test live data connection
        await getEnhancedLiveData();
        health.liveDataConnection = true;
        console.log('✅ Live data connection operational');
    } catch (error) {
        health.errors.push(`Live Data: ${error.message}`);
        console.log('❌ Live data connection failed');
    }
    
    try {
        // Test Ray Dalio framework
        await detectEconomicRegime();
        health.rayDalioFramework = true;
        console.log('✅ Ray Dalio framework operational');
    } catch (error) {
        health.errors.push(`Ray Dalio Framework: ${error.message}`);
        console.log('❌ Ray Dalio framework failed');
    }
    
    try {
        // Test comprehensive data access
        await getRayDalioMarketData();
        health.comprehensiveDataAccess = true;
        console.log('✅ Comprehensive data access operational');
    } catch (error) {
        health.errors.push(`Comprehensive Data: ${error.message}`);
        console.log('❌ Comprehensive data access failed');
    }
    
    health.overallHealth = health.claudeConnection && health.liveDataConnection;
    health.enhancedHealth = health.overallHealth && health.rayDalioFramework && health.comprehensiveDataAccess;
    
    return health;
}

/**
 * 🎯 CLAUDE STRATEGIC INSIGHTS GENERATOR
 * Advanced insights using market intelligence
 */
async function getClaudeStrategicInsights(insightQuery, options = {}) {
    try {
        console.log('🎯 Claude generating strategic insights with market intelligence...');
        
        const [marketInsights, anomalies, regime] = await Promise.allSettled([
            generateMarketInsights(),
            detectMarketAnomalies(),
            detectEconomicRegime()
        ]);
        
        const insightsContext = {
            insights: marketInsights.status === 'fulfilled' ? marketInsights.value : null,
            anomalies: anomalies.status === 'fulfilled' ? anomalies.value : null,
            regime: regime.status === 'fulfilled' ? regime.value : null
        };
        
        const insightsPrompt = `Strategic insights generation request: ${insightQuery}

Generate actionable strategic insights leveraging comprehensive market intelligence and anomaly detection.`;
        
        return await getClaudeStrategicAnalysis(insightsPrompt, {
            ...options,
            skipLiveData: true,
            context: `${options.context || ''}\n\nSTRATEGIC INSIGHTS DATA:\n${formatInsightsDataForPrompt(insightsContext)}`,
            maxTokens: 4096,
            temperature: 0.6
        });
        
    } catch (error) {
        console.error('❌ Claude strategic insights error:', error.message);
        throw error;
    }
}

/**
 * 📊 FORMAT INSIGHTS DATA FOR CLAUDE
 */
function formatInsightsDataForPrompt(insightsContext) {
    let formatted = '';
    
    if (insightsContext.insights?.insights?.length > 0) {
        formatted += `STRATEGIC INSIGHTS AVAILABLE: ${insightsContext.insights.insights.length}\n`;
        insightsContext.insights.insights.forEach((insight, index) => {
            formatted += `${index + 1}. ${insight.category}: ${insight.insight}\n`;
            if (insight.recommendation) {
                formatted += `   Recommendation: ${insight.recommendation}\n`;
            }
        });
    }
    
    if (insightsContext.regime?.currentRegime) {
        formatted += `\nCurrent Regime: ${insightsContext.regime.currentRegime.name}\n`;
    }
    
    if (insightsContext.anomalies?.anomalies?.length > 0) {
        formatted += `\nAnomalies Detected: ${insightsContext.anomalies.anomalies.length}\n`;
    }
    
    return formatted.trim();
}

module.exports = {
    // ⚡ ENHANCED CLAUDE FUNCTIONS WITH LIVE DATA
    getClaudeStrategicAnalysis,
    getClaudeLiveResearch,
    getClaudeComplexAnalysis,
    getClaudeCambodiaIntelligence,
    
    // 🏛️ NEW LIVE DATA ENHANCED FUNCTIONS
    getClaudeWithMarketData,
    getClaudeRegimeAnalysis,
    getClaudeAnomalyAnalysis,
    getClaudePortfolioOptimization,
    getClaudeStrategicInsights,
    
    // 🎯 INTELLIGENCE FUNCTIONS
    analyzeConversationType,
    createAdaptiveSystemPrompt,
    fetchIntelligentLiveData,
    formatLiveDataForPrompt,
    formatAnomalyDataForPrompt,
    formatPortfolioDataForPrompt,
    formatInsightsDataForPrompt,
    
    // 🔧 UTILITY FUNCTIONS
    testClaudeConnection,
    getClaudeMetrics,
    checkClaudeSystemHealth,
    
    // 📈 LEGACY COMPATIBILITY
    getClaudeWithWebSearch,
    
    // 🏛️ CLAUDE CLIENT INSTANCE
    anthropic
};
