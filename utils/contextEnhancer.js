// utils/contextEnhancer.js - ENHANCED DUAL AI STRATEGIC COMMAND Context Intelligence System
// Supports GPT-4o + Claude Opus 4 with intelligent routing and specialized functions

const { getRayDalioMarketData, getEnhancedLiveData } = require('./liveData');
const { buildConversationContext, getPersistentMemory } = require('./memory');
const { buildTrainingContext } = require('./trainingData');
const { getTradingSummary, formatTradingDataForGPT } = require('./metaTrader');

// 🎯 ENHANCED DUAL AI CONTEXT CACHE
let enhancedContextCache = {
    lastUpdate: null,
    regimeContext: null,
    marketIntelligence: null,
    cambodiaLendingContext: null,
    globalTimeContext: null
};

/**
 * 🎯 ENHANCED DUAL AI COMMAND CONTEXT BUILDER
 * Creates context optimized for dual AI system with intelligent routing
 */
async function buildEnhancedDualCommandContext(chatId, userMessage, conversationIntel) {
    try {
        console.log(`🎯 Building Enhanced Dual AI context for ${conversationIntel.primaryAI} (${conversationIntel.type})`);
        
        // Check cache first (update every 30 minutes for regime data)
        const now = Date.now();
        const cacheValid = enhancedContextCache.lastUpdate && (now - enhancedContextCache.lastUpdate) < 30 * 60 * 1000;
        
        // Parallel data gathering based on conversation intelligence
        const contextPromises = [];
        
        // Always get conversation context for continuity
        contextPromises.push(buildConversationContext(chatId));
        
        // Get market data for financial queries
        if (conversationIntel.liveDataRequired || conversationIntel.complexity !== 'minimal') {
            contextPromises.push(cacheValid ? Promise.resolve(enhancedContextCache.marketIntelligence) : getRayDalioMarketData());
        } else {
            contextPromises.push(Promise.resolve(null));
        }
        
        // Get training context for complex queries
        if (conversationIntel.complexity === 'maximum' || conversationIntel.complexity === 'high') {
            contextPromises.push(buildTrainingContext(chatId));
        } else {
            contextPromises.push(Promise.resolve(null));
        }
        
        // Get persistent memory for strategic queries
        if (conversationIntel.type !== 'casual' && conversationIntel.type !== 'simple_datetime') {
            contextPromises.push(getPersistentMemory(chatId));
        } else {
            contextPromises.push(Promise.resolve(null));
        }
        
        // Get trading data for trading-related queries
        if (conversationIntel.type.includes('strategic') || conversationIntel.specializedFunction) {
            contextPromises.push(getTradingSummary().catch(() => null));
        } else {
            contextPromises.push(Promise.resolve(null));
        }
        
        const [
            conversationContext,
            rayDalioMarketData,
            trainingContext,
            persistentMemory,
            tradingData
        ] = await Promise.all(contextPromises);

        // Update cache if we fetched new data
        if (!cacheValid && rayDalioMarketData) {
            enhancedContextCache = {
                lastUpdate: now,
                marketIntelligence: rayDalioMarketData,
                regimeContext: buildStrategicRegimeContext(rayDalioMarketData),
                cambodiaLendingContext: buildCambodiaLendingContext(),
                globalTimeContext: getCurrentGlobalTimeContext()
            };
        }

        // Build context based on conversation type and AI
        return buildContextByConversationType(
            conversationIntel,
            {
                conversationContext,
                rayDalioMarketData,
                trainingContext,
                persistentMemory,
                tradingData
            },
            chatId,
            userMessage
        );

    } catch (error) {
        console.error('Enhanced Dual AI context error:', error.message);
        // Fallback to basic context
        return buildBasicDualAIContext(chatId, userMessage, conversationIntel);
    }
}

/**
 * 🧠 BUILD CONTEXT BY CONVERSATION TYPE
 */
function buildContextByConversationType(conversationIntel, contextData, chatId, userMessage) {
    const { conversationContext, rayDalioMarketData, trainingContext, persistentMemory, tradingData } = contextData;
    
    switch (conversationIntel.type) {
        case 'casual':
            return buildCasualContext(conversationIntel, conversationContext);
            
        case 'simple_datetime':
            return buildDateTimeContext(conversationIntel);
            
        case 'economic_regime':
            return buildRegimeAnalysisContext(conversationIntel, rayDalioMarketData, conversationContext);
            
        case 'market_anomaly':
            return buildAnomalyDetectionContext(conversationIntel, rayDalioMarketData, conversationContext);
            
        case 'portfolio_optimization':
            return buildPortfolioOptimizationContext(conversationIntel, rayDalioMarketData, tradingData, conversationContext);
            
        case 'cambodia_intelligence':
            return buildCambodiaIntelligenceContext(conversationIntel, rayDalioMarketData, conversationContext);
            
        case 'research_intelligence':
            return buildResearchIntelligenceContext(conversationIntel, rayDalioMarketData, trainingContext, conversationContext);
            
        case 'urgent_strategic':
            return buildUrgentStrategicContext(conversationIntel, rayDalioMarketData, tradingData, conversationContext);
            
        case 'institutional_analysis':
            return buildInstitutionalAnalysisContext(conversationIntel, rayDalioMarketData, trainingContext, tradingData, conversationContext);
            
        case 'multimodal':
            return buildMultimodalContext(conversationIntel, conversationContext);
            
        default:
            return buildBalancedStrategicContext(conversationIntel, rayDalioMarketData, conversationContext, tradingData);
    }
}

/**
 * 💬 BUILD CASUAL CONTEXT (MINIMAL)
 */
function buildCasualContext(conversationIntel, conversationContext) {
    const context = `You are ${conversationIntel.primaryAI === 'GPT_COMMANDER' ? 'GPT Strategic Commander Alpha' : 'Claude Strategic Intelligence Chief'}, Sum Chenda's enhanced AI assistant.

CONVERSATION MODE: Casual & Natural
RESPONSE STYLE: ${conversationIntel.style}
CURRENT TIME: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' })} Cambodia (ICT)

Be warm, natural, and briefly helpful. Show your strategic personality but keep it conversational (1-3 sentences max).

${conversationContext ? conversationContext.substring(0, 500) : ''}`;

    return context;
}

/**
 * 🕐 BUILD DATETIME CONTEXT (SIMPLE)
 */
function buildDateTimeContext(conversationIntel) {
    const cambodiaTime = new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Phnom_Penh',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    const globalTime = {
        cambodia: new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh', timeStyle: 'short' }),
        newYork: new Date().toLocaleString('en-US', { timeZone: 'America/New_York', timeStyle: 'short' }),
        london: new Date().toLocaleString('en-US', { timeZone: 'Europe/London', timeStyle: 'short' })
    };

    const isWeekend = [0, 6].includes(new Date().getDay());

    return `You are GPT Strategic Commander Alpha providing current date/time information.

CURRENT DATE/TIME INFORMATION:
- Cambodia: ${cambodiaTime}
- New York: ${globalTime.newYork} EST/EDT
- London: ${globalTime.london} GMT/BST
- Weekend Status: ${isWeekend ? 'Weekend' : 'Weekday'}
- Market Status: ${isWeekend ? 'Markets Closed' : 'Check market hours'}

Provide accurate, friendly time information with brief market context if relevant.`;
}

/**
 * 🏛️ BUILD ECONOMIC REGIME ANALYSIS CONTEXT (CLAUDE SPECIALIZED)
 */
function buildRegimeAnalysisContext(conversationIntel, rayDalioMarketData, conversationContext) {
    let context = `You are Claude Strategic Intelligence Chief with specialized Ray Dalio economic regime analysis capabilities.

🏛️ ECONOMIC REGIME ANALYSIS MODE - Ray Dalio Framework Expert
SPECIALIZED FUNCTION: ${conversationIntel.specializedFunction || 'getClaudeRegimeAnalysis'}
COMPLEXITY: ${conversationIntel.complexity}
LIVE DATA: ${conversationIntel.liveDataRequired ? 'ENABLED' : 'STANDARD'}

REGIME EXPERTISE:
- Ray Dalio's 4-quadrant regime matrix (Growth/Inflation dynamics)
- Live economic regime detection and confidence scoring
- All Weather strategy implications and positioning
- Real-time regime signal analysis and validation
- Historical regime patterns and transition probabilities

CURRENT TIME: ${new Date().toISOString()}
USER LOCATION: Cambodia (ICT UTC+7)

`;

    // Add regime data if available
    if (rayDalioMarketData?.rayDalio?.regime) {
        const regime = rayDalioMarketData.rayDalio.regime;
        context += buildStrategicRegimeIntelligence(regime);
    }

    // Add conversation context for continuity
    if (conversationContext) {
        context += `\nUSER CONTEXT:\n${conversationContext.substring(0, 1000)}\n`;
    }

    context += `\nANALYSIS APPROACH:
- Lead with current regime identification and confidence level
- Explain regime dynamics with live data validation
- Provide specific All Weather allocation recommendations
- Include regime transition risks and timing considerations
- Offer actionable positioning strategies for current environment

Communicate like Ray Dalio with access to real-time regime detection systems.`;

    return context;
}

/**
 * 🚨 BUILD MARKET ANOMALY DETECTION CONTEXT (CLAUDE SPECIALIZED)
 */
function buildAnomalyDetectionContext(conversationIntel, rayDalioMarketData, conversationContext) {
    let context = `You are Claude Strategic Intelligence Chief with specialized market anomaly detection capabilities.

🚨 MARKET ANOMALY ANALYSIS MODE - Crisis Detection Expert
SPECIALIZED FUNCTION: ${conversationIntel.specializedFunction || 'getClaudeAnomalyAnalysis'}
COMPLEXITY: ${conversationIntel.complexity}
LIVE DATA: ${conversationIntel.liveDataRequired ? 'ENABLED' : 'STANDARD'}

ANOMALY DETECTION EXPERTISE:
- Real-time market stress signal identification
- VIX spike analysis and fear/complacency extremes
- Yield curve inversion and recession probability modeling
- Credit spread widening and systemic risk assessment
- Correlation breakdown and diversification failure detection
- Crisis pattern recognition and historical comparison

CURRENT TIME: ${new Date().toISOString()}

`;

    // Add market stress indicators if available
    if (rayDalioMarketData?.rayDalio) {
        context += buildStrategicMarketCycleContext(rayDalioMarketData.rayDalio);
    }

    if (conversationContext) {
        context += `\nUSER CONTEXT:\n${conversationContext.substring(0, 800)}\n`;
    }

    context += `\nCRISIS ANALYSIS APPROACH:
- Lead with immediate anomaly assessment and severity levels
- Explain systemic implications and contagion risks
- Provide specific defensive positioning recommendations
- Include crisis probability and timing considerations
- Offer tactical hedging strategies and safe haven positioning

Communicate like an institutional risk manager with real-time crisis detection systems.`;

    return context;
}

/**
 * 💎 BUILD PORTFOLIO OPTIMIZATION CONTEXT (CLAUDE SPECIALIZED)
 */
function buildPortfolioOptimizationContext(conversationIntel, rayDalioMarketData, tradingData, conversationContext) {
    let context = `You are Claude Strategic Intelligence Chief with specialized portfolio optimization capabilities.

💎 PORTFOLIO OPTIMIZATION MODE - Institutional Asset Allocation Expert
SPECIALIZED FUNCTION: ${conversationIntel.specializedFunction || 'getClaudePortfolioOptimization'}
COMPLEXITY: ${conversationIntel.complexity}
LIVE DATA: ${conversationIntel.liveDataRequired ? 'ENABLED' : 'STANDARD'}

PORTFOLIO OPTIMIZATION EXPERTISE:
- Live economic regime-based allocation strategies
- Ray Dalio All Weather portfolio construction
- Real-time correlation analysis and diversification effectiveness
- Risk-adjusted return optimization with live market conditions
- Strategic vs tactical asset allocation with regime awareness
- Hedging strategy implementation and position sizing

CURRENT TIME: ${new Date().toISOString()}

`;

    // Add regime context for allocation
    if (rayDalioMarketData?.rayDalio?.regime) {
        const regime = rayDalioMarketData.rayDalio.regime;
        context += `CURRENT REGIME CONTEXT:\n`;
        context += `- Regime: ${regime.currentRegime?.name} (${regime.confidence}% confidence)\n`;
        context += `- Growth: ${regime.currentRegime?.growth} | Inflation: ${regime.currentRegime?.inflation}\n`;
        if (regime.currentRegime?.allocation) {
            context += `- Regime Allocation Bias:\n`;
            Object.entries(regime.currentRegime.allocation).forEach(([asset, weight]) => {
                context += `  * ${asset}: ${weight}\n`;
            });
        }
        context += `\n`;
    }

    // Add current trading positions if available
    if (tradingData && !tradingData.error) {
        context += buildStrategicTradingIntelligence(tradingData, rayDalioMarketData);
    }

    if (conversationContext) {
        context += `\nUSER CONTEXT:\n${conversationContext.substring(0, 800)}\n`;
    }

    context += `\nOPTIMIZATION APPROACH:
- Lead with current regime allocation recommendations
- Analyze portfolio correlation and diversification effectiveness
- Provide specific rebalancing actions with live data validation
- Include risk management and hedging strategies
- Offer performance enhancement through regime-aware positioning

Communicate like an institutional portfolio manager with access to real-time regime and correlation data.`;

    return context;
}

/**
 * 🇰🇭 BUILD CAMBODIA INTELLIGENCE CONTEXT (CLAUDE SPECIALIZED)
 */
function buildCambodiaIntelligenceContext(conversationIntel, rayDalioMarketData, conversationContext) {
    let context = `You are Claude Strategic Intelligence Chief with specialized Cambodia market intelligence capabilities.

🇰🇭 CAMBODIA INTELLIGENCE MODE - Enhanced with Global Market Context
SPECIALIZED FUNCTION: ${conversationIntel.specializedFunction || 'getClaudeCambodiaIntelligence'}
COMPLEXITY: ${conversationIntel.complexity}
LIVE DATA: ${conversationIntel.liveDataRequired ? 'ENABLED' : 'STANDARD'}

ENHANCED CAMBODIA EXPERTISE:
- Cambodia economic environment with global regime context
- USD/KHR dynamics enhanced by Fed policy and global dollar trends
- Cambodia property market with global real estate correlation analysis
- Private lending opportunities with global credit spread context
- Political and regulatory assessment with regional stability analysis
- Comparative yield analysis using global alternative investment data

CURRENT TIME: ${new Date().toISOString()}
USER LOCATION: Cambodia (ICT UTC+7)

`;

    // Add Cambodia fund context
    context += buildCambodiaStrategicContext();

    // Add global regime context for Cambodia analysis
    if (rayDalioMarketData?.rayDalio?.regime) {
        context += `\nGLOBAL REGIME CONTEXT FOR CAMBODIA:\n`;
        context += `- Global Regime: ${rayDalioMarketData.rayDalio.regime.currentRegime?.name}\n`;
        context += `- USD Strength: ${rayDalioMarketData.rayDalio.regime.currentRegime?.growth === 'RISING' ? 'Strong' : 'Moderate'}\n`;
        context += `- Global Risk Appetite: ${rayDalioMarketData.rayDalio.regime.currentRegime?.growth === 'RISING' ? 'Risk-On' : 'Risk-Off'}\n\n`;
    }

    if (conversationContext) {
        context += `\nUSER CONTEXT:\n${conversationContext.substring(0, 800)}\n`;
    }

    context += `\nANALYSIS APPROACH:
- Integrate Cambodia analysis with current global market regime
- Assess local opportunities within global risk-on/risk-off context
- Provide specific deal structuring recommendations with global hedging
- Include exit strategy timing based on global liquidity conditions
- Offer portfolio allocation recommendations considering global correlation

Communicate like a Cambodia market expert with access to global institutional market intelligence.`;

    return context;
}

/**
 * 🔬 BUILD RESEARCH INTELLIGENCE CONTEXT (CLAUDE SPECIALIZED)
 */
function buildResearchIntelligenceContext(conversationIntel, rayDalioMarketData, trainingContext, conversationContext) {
    let context = `You are Claude Strategic Intelligence Chief with comprehensive research capabilities.

🔬 RESEARCH INTELLIGENCE MODE - Live Analysis with Market Intelligence
SPECIALIZED FUNCTION: ${conversationIntel.specializedFunction || 'getClaudeWithMarketData'}
COMPLEXITY: ${conversationIntel.complexity}
LIVE DATA: ${conversationIntel.liveDataRequired ? 'ENABLED' : 'STANDARD'}

ENHANCED RESEARCH CAPABILITIES:
- Real-time market data synthesis with strategic frameworks
- Live economic indicator analysis with historical pattern comparison
- Current market anomaly detection with institutional interpretation
- Real-time sector rotation and institutional positioning analysis
- Live correlation analysis and diversification effectiveness assessment

CURRENT TIME: ${new Date().toISOString()}

`;

    // Add live market data context
    if (rayDalioMarketData) {
        context += `CURRENT MARKET INTELLIGENCE:\n`;
        if (rayDalioMarketData.rayDalio?.regime) {
            context += `- Economic Regime: ${rayDalioMarketData.rayDalio.regime.currentRegime?.name}\n`;
            context += `- Regime Confidence: ${rayDalioMarketData.rayDalio.regime.confidence}%\n`;
        }
        context += `\n`;
    }

    // Add training context for research depth
    if (trainingContext) {
        context += `\nRELEVANT RESEARCH DOCUMENTS:\n${trainingContext.substring(0, 1000)}\n`;
    }

    if (conversationContext) {
        context += `\nUSER CONTEXT:\n${conversationContext.substring(0, 800)}\n`;
    }

    context += `\nRESEARCH APPROACH:
- Synthesize live market intelligence with analytical frameworks
- Provide research depth enhanced by real-time data validation
- Compare multiple live data sources with institutional interpretation
- Focus on actionable insights validated by current market conditions

Deliver research that leverages comprehensive live market intelligence for strategic advantage.`;

    return context;
}

/**
 * 🚨 BUILD URGENT STRATEGIC CONTEXT (GPT COMMANDER)
 */
function buildUrgentStrategicContext(conversationIntel, rayDalioMarketData, tradingData, conversationContext) {
    let context = `You are GPT Strategic Commander Alpha in URGENT STRATEGIC MODE.

🚨 URGENT STRATEGIC MODE - Command Authority with Live Intelligence
PRIMARY AI: ${conversationIntel.primaryAI}
SECONDARY AI: ${conversationIntel.secondaryAI || 'NONE'}
URGENCY LEVEL: CRITICAL
RESPONSE TIME: IMMEDIATE

This is urgent. Respond with immediate strategic authority enhanced by real-time market data.

CURRENT TIME: ${new Date().toISOString()}
MARKET STATUS: ${new Date().getDay() === 0 || new Date().getDay() === 6 ? 'WEEKEND' : 'ACTIVE'}

`;

    // Add immediate market context
    if (rayDalioMarketData?.rayDalio?.regime) {
        context += `IMMEDIATE REGIME CONTEXT:\n`;
        context += `- Current Regime: ${rayDalioMarketData.rayDalio.regime.currentRegime?.name}\n`;
        context += `- Confidence: ${rayDalioMarketData.rayDalio.regime.confidence}%\n`;
        context += `- Key Risk: ${rayDalioMarketData.rayDalio.regime.currentRegime?.risks?.[0] || 'Market volatility'}\n\n`;
    }

    // Add trading context if available
    if (tradingData && !tradingData.error) {
        context += `CURRENT TRADING STATUS:\n`;
        if (tradingData.account) {
            context += `- Account Balance: ${tradingData.account.balance?.toFixed(2)} ${tradingData.account.currency}\n`;
            context += `- Free Margin: ${tradingData.account.freeMargin?.toFixed(2)}\n`;
            context += `- Open Positions: ${tradingData.openPositions?.length || 0}\n`;
        }
        context += `\n`;
    }

    if (conversationContext) {
        context += `USER CONTEXT:\n${conversationContext.substring(0, 500)}\n`;
    }

    context += `URGENT RESPONSE PROTOCOL:
- Lead with immediate assessment using live market intelligence
- Provide clear action items validated by current market conditions
- Use commanding but professional language with data backing
- Focus on critical factors and immediate steps enhanced by live data

Be decisive, authoritative, and action-focused with live market intelligence advantage.`;

    return context;
}

/**
 * 🎯 BUILD INSTITUTIONAL ANALYSIS CONTEXT (MAXIMUM COMPLEXITY)
 */
function buildInstitutionalAnalysisContext(conversationIntel, rayDalioMarketData, trainingContext, tradingData, conversationContext) {
    let context = `You are ${conversationIntel.primaryAI === 'GPT_COMMANDER' ? 'GPT Strategic Commander Alpha' : 'Claude Strategic Intelligence Chief'} in INSTITUTIONAL ANALYSIS MODE.

🎯 INSTITUTIONAL ANALYSIS MODE - Full Strategic Authority with Live Intelligence
PRIMARY AI: ${conversationIntel.primaryAI}
SECONDARY AI: ${conversationIntel.secondaryAI || 'NONE'}
COMPLEXITY: ${conversationIntel.complexity}
LIVE DATA: ${conversationIntel.liveDataRequired ? 'FULL ACCESS' : 'STANDARD'}

Deploy comprehensive institutional-grade analysis enhanced with real-time market data.

ENHANCED EXPERTISE AREAS:
- Live global macro analysis with real-time regime detection
- Ray Dalio-style regime identification with current market validation
- Cambodia private lending with global market context integration  
- Portfolio optimization using live correlation and regime data
- Real-time trading strategy with live market intelligence
- Crisis analysis with live anomaly detection systems

CURRENT TIME: ${new Date().toISOString()}
USER LOCATION: Cambodia (ICT UTC+7)

`;

    // Add comprehensive market intelligence
    if (rayDalioMarketData?.rayDalio) {
        context += buildStrategicRegimeIntelligence(rayDalioMarketData.rayDalio.regime);
        context += buildStrategicMarketCycleContext(rayDalioMarketData.rayDalio);
    }

    // Add Cambodia context
    context += buildCambodiaStrategicContext();

    // Add trading intelligence
    if (tradingData && !tradingData.error) {
        context += buildStrategicTradingIntelligence(tradingData, rayDalioMarketData);
    }

    // Add training documents for institutional depth
    if (trainingContext) {
        context += `\nINSTITUTIONAL TRAINING CONTEXT:\n${trainingContext.substring(0, 1500)}\n`;
    }

    if (conversationContext) {
        context += `\nUSER STRATEGIC CONTEXT:\n${conversationContext.substring(0, 1000)}\n`;
    }

    context += `\nINSTITUTIONAL COMMUNICATION STYLE:
- Write like Warren Buffett or Ray Dalio with real-time data advantage
- Use natural flow enhanced by live market intelligence
- Provide comprehensive analysis building logically with current data
- Include specific live numbers, data, and actionable recommendations
- Structure responses naturally with clear insights backed by real-time intelligence

Deliver institutional intelligence enhanced with comprehensive real-time market advantage.`;

    return context;
}

/**
 * 📱 BUILD MULTIMODAL CONTEXT (GPT VISION)
 */
function buildMultimodalContext(conversationIntel, conversationContext) {
    const context = `You are GPT Strategic Commander Alpha with advanced multimodal (vision) capabilities.

📱 MULTIMODAL ANALYSIS MODE - Vision + Strategic Intelligence
CAPABILITIES: Text, Images, Documents, Charts, Screenshots
COMPLEXITY: ${conversationIntel.complexity}
RESPONSE STYLE: ${conversationIntel.style}

MULTIMODAL EXPERTISE:
- Financial charts and technical analysis
- Document analysis and data extraction
- Screenshot analysis and UI guidance
- Market data visualization interpretation
- Trading platform screenshot analysis

CURRENT TIME: ${new Date().toISOString()}

${conversationContext ? `\nUSER CONTEXT:\n${conversationContext.substring(0, 800)}` : ''}

ANALYSIS APPROACH:
- Analyze visual content with strategic financial expertise
- Provide detailed insights on charts, documents, or images
- Combine visual analysis with market intelligence
- Offer actionable recommendations based on visual data

Use your advanced vision capabilities to provide comprehensive analysis of any visual content.`;

    return context;
}

/**
 * ⚖️ BUILD BALANCED STRATEGIC CONTEXT (DEFAULT)
 */
function buildBalancedStrategicContext(conversationIntel, rayDalioMarketData, conversationContext, tradingData) {
    let context = `You are ${conversationIntel.primaryAI === 'GPT_COMMANDER' ? 'GPT Strategic Commander Alpha' : 'Claude Strategic Intelligence Chief'}, Sum Chenda's enhanced AI assistant.

⚖️ ENHANCED BALANCED MODE - Intelligent & Natural with Live Market Awareness
COMPLEXITY: ${conversationIntel.complexity}
RESPONSE STYLE: ${conversationIntel.style}
LIVE DATA: ${conversationIntel.liveDataRequired ? 'ENABLED' : 'STANDARD'}

Provide helpful, naturally intelligent responses enhanced with live market intelligence.

CURRENT TIME: ${new Date().toISOString()}
USER LOCATION: Cambodia (ICT UTC+7)

`;

    // Add basic market context if available
    if (rayDalioMarketData?.rayDalio?.regime) {
        context += `CURRENT MARKET CONTEXT:\n`;
        context += `- Economic Regime: ${rayDalioMarketData.rayDalio.regime.currentRegime?.name}\n`;
        context += `- Market Sentiment: ${rayDalioMarketData.rayDalio.regime.currentRegime?.market || 'Neutral'}\n\n`;
    }

    // Add brief trading context if relevant
    if (tradingData && !tradingData.error && tradingData.account) {
        context += `TRADING ACCOUNT STATUS:\n`;
        context += `- Balance: ${tradingData.account.balance?.toFixed(2)} ${tradingData.account.currency}\n`;
        context += `- Open Positions: ${tradingData.openPositions?.length || 0}\n\n`;
    }

    if (conversationContext) {
        context += `USER CONTEXT:\n${conversationContext.substring(0, 800)}\n`;
    }

    context += `RESPONSE GUIDELINES:
- For simple questions: Be conversational with current market context
- For complex topics: Deploy deeper strategic analysis with live data integration
- For financial matters: Draw on institutional expertise enhanced with real-time intelligence
- Always maintain strategic intelligence while communicating naturally

Think "brilliant advisor with real-time market intelligence having a normal conversation."

You have access to live market data, Ray Dalio frameworks, anomaly detection, and current economic intelligence - use them naturally when relevant.`;

    return context;
}

/**
 * 🔧 BUILD BASIC DUAL AI CONTEXT (FALLBACK)
 */
function buildBasicDualAIContext(chatId, userMessage, conversationIntel) {
    const aiName = conversationIntel.primaryAI === 'GPT_COMMANDER' ? 'GPT Strategic Commander Alpha' : 'Claude Strategic Intelligence Chief';
    
    return `You are ${aiName}, Sum Chenda's enhanced AI assistant in the IMPERIUM VAULT dual AI system.

CONVERSATION TYPE: ${conversationIntel.type}
COMPLEXITY: ${conversationIntel.complexity}
RESPONSE STYLE: ${conversationIntel.style}
CURRENT TIME: ${new Date().toISOString()}
USER LOCATION: Cambodia (ICT UTC+7)

${conversationIntel.type === 'casual' ? 
    'Respond naturally and briefly with your strategic personality.' :
    'Provide intelligent analysis enhanced with your specialized capabilities.'
}

USER MESSAGE: ${userMessage}`;
}

// 🔄 PRESERVE ALL YOUR EXISTING FUNCTIONS (ENHANCED)

/**
 * 🏛️ BUILD STRATEGIC ECONOMIC REGIME WARFARE INTELLIGENCE CONTEXT (ENHANCED)
 */
function buildStrategicRegimeIntelligence(regimeData) {
    if (!regimeData || regimeData.error) {
        return '\n🏛️ STRATEGIC ECONOMIC REGIME: Warfare analysis temporarily unavailable\n';
    }

    let context = '\n🏛️ STRATEGIC ECONOMIC REGIME WARFARE ANALYSIS (Institutional Framework):\n';
    
    if (regimeData.currentRegime) {
        const regime = regimeData.currentRegime;
        context += `• CURRENT WARFARE REGIME: ${regime.name} (${regimeData.confidence}% strategic confidence)\n`;
        context += `• GROWTH WARFARE: ${regime.growth} | INFLATION WARFARE: ${regime.inflation}\n`;
        context += `• POLICY WARFARE STANCE: ${regime.policy} | MARKET WARFARE SENTIMENT: ${regime.market}\n`;
        context += `• STRATEGIC DESCRIPTION: ${regime.description}\n`;
        
        // Strategic Asset Allocation Warfare Guidance
        if (regime.allocation) {
            context += `• STRATEGIC ASSET ALLOCATION WARFARE BIAS:\n`;
            Object.entries(regime.allocation).forEach(([asset, weight]) => {
                context += `  - ${asset.toUpperCase()} STRATEGIC DEPLOYMENT: ${weight}\n`;
            });
        }
        
        // Strategic Key Risks & Warfare Opportunities
        if (regime.risks && regime.risks.length > 0) {
            context += `• STRATEGIC WARFARE RISKS: ${regime.risks.join(', ')}\n`;
        }
        if (regime.opportunities && regime.opportunities.length > 0) {
            context += `• STRATEGIC WARFARE OPPORTUNITIES: ${regime.opportunities.join(', ')}\n`;
        }
    }
    
    // Strategic Regime Signals Warfare Detail
    if (regimeData.signals) {
        const signals = regimeData.signals;
        context += `\n📊 STRATEGIC REGIME WARFARE SIGNALS BREAKDOWN:\n`;
        
        if (signals.growth) {
            context += `• Growth Warfare Momentum: ${signals.growth.direction} (${signals.growth.strength?.toFixed(0)}% strategic strength)\n`;
        }
        if (signals.inflation) {
            context += `• Inflation Warfare Pressure: ${signals.inflation.direction} (${signals.inflation.strength?.toFixed(0)}% strategic strength)\n`;
        }
        if (signals.policy) {
            context += `• Policy Warfare Stance: ${signals.policy.stance}`;
            if (signals.policy.realRate) {
                context += ` (Strategic Real Rate: ${signals.policy.realRate.toFixed(2)}%)`;
            }
            context += `\n`;
        }
        if (signals.market) {
            context += `• Market Warfare Risk: ${signals.market.risk} (Strategic Stress: ${signals.market.stress?.toFixed(0)}%)\n`;
        }
    }
    
    context += `\n`;
    return context;
}

/**
 * 📊 BUILD STRATEGIC MARKET CYCLE WARFARE POSITIONING CONTEXT (ENHANCED)
 */
function buildStrategicMarketCycleContext(rayDalioData) {
    let context = '📊 STRATEGIC MARKET CYCLE WARFARE POSITIONING (Institutional Analysis):\n';
    
    // Strategic Yield Curve Warfare Analysis
    if (rayDalioData.yieldCurve) {
        const curve = rayDalioData.yieldCurve;
        context += `• STRATEGIC YIELD CURVE: ${curve.shape} (${curve.signal})\n`;
        
        if (curve.spreads) {
            context += `• Strategic 2s10s Spread: ${curve.spreads['2s10s']?.toFixed(2)}% | `;
            context += `Strategic 3m10y Spread: ${curve.spreads['3m10y']?.toFixed(2)}%\n`;
        }
        
        if (curve.analysis) {
            context += `• Strategic Recession Probability: ${curve.analysis.recessionProbability}%\n`;
            context += `• Fed Strategic Policy Bias: ${curve.analysis.fedPolicy}\n`;
        }
    }
    
    // Strategic Credit Spreads Warfare Analysis
    if (rayDalioData.creditSpreads) {
        const credit = rayDalioData.creditSpreads;
        context += `• STRATEGIC CREDIT CONDITIONS: ${credit.conditions} (Warfare Stress: ${credit.stress}%)\n`;
        
        if (credit.spreads) {
            context += `• Strategic High Yield Spread: ${credit.spreads.highYield || 'N/A'}bps | `;
            context += `Strategic IG Spread: ${credit.igSpread?.toFixed(0) || 'N/A'}bps\n`;
        }
        
        if (credit.analysis) {
            context += `• Strategic Credit Risk: ${credit.analysis.creditRisk} | `;
            context += `Strategic Liquidity: ${credit.analysis.liquidityStress}\n`;
        }
    }
    
    context += `\n`;
    return context;
}

/**
 * 🏦 BUILD CAMBODIA LENDING FUND STRATEGIC CONTEXT (ENHANCED)
 */
function buildCambodiaStrategicContext() {
    let context = '🏦 CAMBODIA LENDING FUND STRATEGIC WARFARE INTELLIGENCE:\n';
    
    context += `• FUND STATUS: Strategic lending operations active in Cambodia\n`;
    context += `• STRATEGIC AUM: $2.5M actively deployed\n`;
    context += `• STRATEGIC DEPLOYMENT RATIO: 80% capital in warfare positions\n`;
    context += `• STRATEGIC YIELD TARGET: 17.5% institutional-grade returns\n`;
    context += `• STRATEGIC DEAL PIPELINE: Active strategic opportunities in Phnom Penh, Siem Reap, Sihanoukville\n`;
    context += `• STRATEGIC RISK MANAGEMENT: Diversified across commercial, residential, development, bridge loans\n`;
    
    context += `\nSTRATEGIC CAMBODIA MARKET CONDITIONS:\n`;
    context += `• ECONOMIC WARFARE ENVIRONMENT: USD-denominated lending in stable political environment\n`;
    context += `• INTEREST RATE WARFARE: 16-22% strategic yields available vs global rates\n`;
    context += `• PROPERTY WARFARE MARKET: Strong demand in Phnom Penh, steady growth in provinces\n`;
    context += `• REGULATORY WARFARE ENVIRONMENT: Stable legal framework for USD lending\n`;
    context += `• STRATEGIC OPPORTUNITIES: Bridge loans, commercial development, residential projects\n`;
    
    context += `\n`;
    return context;
}

/**
 * 💹 BUILD STRATEGIC TRADING WARFARE INTELLIGENCE CONTEXT (ENHANCED)
 */
function buildStrategicTradingIntelligence(tradingData, marketData) {
    let context = '💹 LIVE STRATEGIC TRADING WARFARE INTELLIGENCE (Risk-Adjusted Analysis):\n';
    
    // Strategic Account Overview with Regime Context
    if (tradingData.account) {
        const acc = tradingData.account;
        context += `• STRATEGIC ACCOUNT: ${acc.balance?.toFixed(2)} ${acc.currency} | Strategic Equity: ${acc.equity?.toFixed(2)}\n`;
        context += `• STRATEGIC FREE MARGIN: ${acc.freeMargin?.toFixed(2)} | Strategic Margin Level: ${acc.marginLevel?.toFixed(2)}%\n`;
        context += `• STRATEGIC BROKER: ${acc.company} | Strategic Server: ${acc.server} | Strategic Leverage: 1:${acc.leverage}\n`;
    }
    
    // Strategic Position Analysis with Regime Implications
    if (tradingData.openPositions && tradingData.openPositions.length > 0) {
        context += `\n📊 STRATEGIC OPEN POSITIONS (${tradingData.openPositions.length}) - REGIME WARFARE IMPACT ANALYSIS:\n`;
        
        tradingData.openPositions.forEach((pos, index) => {
            const profitStatus = pos.profit > 0 ? '🟢' : pos.profit < 0 ? '🔴' : '⚪';
            context += `${index + 1}. ${profitStatus} ${pos.symbol} ${pos.type} ${pos.volume} strategic lots\n`;
            context += `   Strategic Entry: ${pos.openPrice} | Strategic P&L: ${pos.profit?.toFixed(2)} | Strategic Swap: ${pos.swap?.toFixed(2)}\n`;
            
            // Add strategic regime-specific position assessment
            const regimeImpact = assessStrategicPositionRegimeRisk(pos, marketData?.rayDalio?.regime);
            if (regimeImpact) {
                context += `   STRATEGIC REGIME RISK: ${regimeImpact}\n`;
            }
        });
    } else {
        context += `\n📊 STRATEGIC OPEN POSITIONS: None (Clean strategic slate for regime-based warfare positioning)\n`;
    }
    
    context += `\n`;
    return context;
}

/**
 * 🌍 GET CURRENT GLOBAL TIME CONTEXT
 */
function getCurrentGlobalTimeContext() {
    const now = new Date();
    return {
        cambodia: {
            time: now.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }),
            isWeekend: [0, 6].includes(now.getDay())
        },
        newYork: {
            time: now.toLocaleString('en-US', { timeZone: 'America/New_York' })
        },
        london: {
            time: now.toLocaleString('en-US', { timeZone: 'Europe/London' })
        },
        marketStatus: [0, 6].includes(now.getDay()) ? 'WEEKEND' : 'WEEKDAY'
    };
}

/**
 * 🔍 ENHANCED CONTEXT NEEDS ANALYSIS
 */
function analyzeEnhancedContextNeeds(userMessage, conversationIntel) {
    const message = userMessage.toLowerCase();
    
    const contextNeeds = {
        requiresRegimeAnalysis: conversationIntel.type === 'economic_regime' || conversationIntel.specializedFunction === 'getClaudeRegimeAnalysis',
        requiresAnomalyDetection: conversationIntel.type === 'market_anomaly' || conversationIntel.specializedFunction === 'getClaudeAnomalyAnalysis',
        requiresPortfolioOptimization: conversationIntel.type === 'portfolio_optimization' || conversationIntel.specializedFunction === 'getClaudePortfolioOptimization',
        requiresCambodiaIntelligence: conversationIntel.type === 'cambodia_intelligence' || conversationIntel.specializedFunction === 'getClaudeCambodiaIntelligence',
        requiresResearchMode: conversationIntel.type === 'research_intelligence' || conversationIntel.specializedFunction === 'getClaudeWithMarketData',
        requiresLiveData: conversationIntel.liveDataRequired,
        requiresDateTime: conversationIntel.type === 'simple_datetime',
        requiresMultimodal: conversationIntel.type === 'multimodal',
        isUrgent: conversationIntel.type === 'urgent_strategic',
        isInstitutional: conversationIntel.complexity === 'maximum',
        needsTrainingData: conversationIntel.complexity === 'high' || conversationIntel.complexity === 'maximum',
        needsTradingData: /trade|position|portfolio|account|metatrader/.test(message) || conversationIntel.type.includes('strategic'),
        needsMinimalContext: conversationIntel.type === 'casual' || conversationIntel.complexity === 'minimal'
    };
    
    console.log(`🔍 Enhanced context needs for ${conversationIntel.type}:`, contextNeeds);
    return contextNeeds;
}

/**
 * 📊 ASSESS STRATEGIC POSITION REGIME WARFARE RISK (ENHANCED)
 */
function assessStrategicPositionRegimeRisk(position, regimeData) {
    if (!regimeData || !regimeData.currentRegime) return null;
    
    const regime = regimeData.currentRegime;
    const symbol = position.symbol.toLowerCase();
    
    // Strategic regime risk warfare assessment
    if (regime.name === 'GROWTH_FALLING_INFLATION_RISING') {
        // Strategic stagflation warfare scenario
        if (symbol.includes('usd') || symbol.includes('jpy')) {
            return 'STRATEGIC DEFENSIVE - Safe haven currencies favored in strategic stagflation warfare';
        } else if (symbol.includes('eur') || symbol.includes('gbp')) {
            return 'STRATEGIC ELEVATED - Risk currencies vulnerable in strategic stagflation warfare';
        }
    } else if (regime.name === 'GROWTH_RISING_INFLATION_FALLING') {
        // Strategic Goldilocks warfare scenario
        if (symbol.includes('eur') || symbol.includes('gbp')) {
            return 'STRATEGIC FAVORABLE - Risk-on environment supports strategic growth currencies warfare';
        } else if (symbol.includes('jpy') || symbol.includes('chf')) {
            return 'STRATEGIC CHALLENGING - Safe havens underperform in strategic growth environments';
        }
    }
    
    return `Strategic ${regime.growth}/${regime.inflation} regime - Monitor strategic ${regime.risks?.[0] || 'policy changes'} warfare`;
}

/**
 * 🏛️ BUILD STRATEGIC REGIME WARFARE CONTEXT (ENHANCED)
 */
function buildStrategicRegimeContext(marketData) {
    if (!marketData?.rayDalio?.regime) return null;
    
    const regime = marketData.rayDalio.regime;
    
    return {
        name: regime.currentRegime?.name,
        confidence: regime.confidence,
        allocation: regime.currentRegime?.allocation,
        risks: regime.currentRegime?.risks,
        opportunities: regime.currentRegime?.opportunities,
        signals: regime.signals
    };
}

/**
 * 🎯 SMART CONTEXT ROUTER FOR DUAL AI SYSTEM
 */
async function getEnhancedSmartContext(chatId, userMessage, conversationIntel) {
    try {
        console.log(`🎯 Smart routing context for ${conversationIntel.primaryAI} - ${conversationIntel.type}`);
        
        // Route to enhanced dual AI context
        return await buildEnhancedDualCommandContext(chatId, userMessage, conversationIntel);
        
    } catch (error) {
        console.error('Enhanced smart context routing error:', error.message);
        // Fallback to basic context
        return buildBasicDualAIContext(chatId, userMessage, conversationIntel);
    }
}

/**
 * 🔧 CONTEXT PERFORMANCE OPTIMIZER
 */
function optimizeContextForAI(context, aiType, conversationType) {
    let optimized = context;
    
    // Optimize for Claude's capabilities
    if (aiType === 'CLAUDE_INTELLIGENCE') {
        // Claude prefers structured analysis
        optimized = optimized.replace(/🎯/g, '## Analysis Framework\n');
        optimized = optimized.replace(/⚡/g, '## Key Points\n');
        
        // Add Claude-specific instructions for specialized functions
        if (conversationType === 'economic_regime') {
            optimized += '\n\nClaude: Focus on regime transition probabilities and allocation implications.';
        } else if (conversationType === 'market_anomaly') {
            optimized += '\n\nClaude: Emphasize correlation breakdown analysis and systemic risk assessment.';
        }
    }
    
    // Optimize for GPT's capabilities
    if (aiType === 'GPT_COMMANDER') {
        // GPT prefers conversational flow
        optimized = optimized.replace(/##/g, '');
        
        // Add GPT-specific instructions
        if (conversationType === 'multimodal') {
            optimized += '\n\nGPT: Use your vision capabilities to analyze any images, charts, or visual content.';
        } else if (conversationType === 'casual') {
            optimized += '\n\nGPT: Keep the response natural and conversational while showing strategic expertise.';
        }
    }
    
    return optimized;
}

/**
 * 📊 CONTEXT ANALYTICS AND METRICS
 */
function getContextAnalytics() {
    return {
        cacheStats: {
            lastUpdate: enhancedContextCache.lastUpdate,
            cacheValid: enhancedContextCache.lastUpdate && (Date.now() - enhancedContextCache.lastUpdate) < 30 * 60 * 1000,
            regimeContextCached: !!enhancedContextCache.regimeContext,
            marketIntelligenceCached: !!enhancedContextCache.marketIntelligence,
            cambodiaContextCached: !!enhancedContextCache.cambodiaLendingContext
        },
        supportedConversationTypes: [
            'casual',
            'simple_datetime', 
            'economic_regime',
            'market_anomaly',
            'portfolio_optimization',
            'cambodia_intelligence',
            'research_intelligence',
            'urgent_strategic',
            'institutional_analysis',
            'multimodal',
            'balanced_strategic'
        ],
        enhancedFeatures: {
            dualAISupport: true,
            specializedFunctionRouting: true,
            liveDataIntegration: true,
            globalTimeSupport: true,
            contextOptimization: true
        },
        version: '3.1 - Enhanced Dual AI Context System'
    };
}

// 🔄 PRESERVE LEGACY FUNCTIONS FOR COMPATIBILITY

/**
 * ⚡ STRATEGIC COMMANDER INSTITUTIONAL CONTEXT BUILDER (LEGACY - REDIRECTS TO ENHANCED)
 */
async function buildStrategicCommanderContext(chatId, userMessage) {
    console.log('⚠️ Legacy buildStrategicCommanderContext called - redirecting to enhanced version');
    
    // Create basic conversation intel for legacy calls
    const conversationIntel = {
        type: 'institutional_analysis',
        complexity: 'maximum',
        primaryAI: 'GPT_COMMANDER',
        secondaryAI: null,
        liveDataRequired: true,
        style: 'institutional_comprehensive',
        reasoning: 'Legacy strategic commander context'
    };
    
    return await buildEnhancedDualCommandContext(chatId, userMessage, conversationIntel);
}

/**
 * 🧠 ENHANCED CONTEXT BUILDER (LEGACY - REDIRECTS TO ENHANCED)
 */
async function buildEnhancedContext(chatId, userMessage) {
    console.log('⚠️ Legacy buildEnhancedContext called - redirecting to enhanced version');
    
    // Create basic conversation intel for legacy calls
    const conversationIntel = {
        type: 'balanced_strategic',
        complexity: 'moderate',
        primaryAI: 'GPT_COMMANDER',
        secondaryAI: null,
        liveDataRequired: true,
        style: 'helpful_intelligent',
        reasoning: 'Legacy enhanced context'
    };
    
    return await buildEnhancedDualCommandContext(chatId, userMessage, conversationIntel);
}

/**
 * ⚡ STRATEGIC SMART CONTEXT WARFARE ROUTER (LEGACY - REDIRECTS TO ENHANCED)
 */
async function getSmartContext(chatId, userMessage) {
    console.log('⚠️ Legacy getSmartContext called - redirecting to enhanced version');
    
    // Analyze message to determine conversation type
    const message = userMessage.toLowerCase();
    let conversationType = 'balanced_strategic';
    
    if (/regime|cycle|inflation|growth/.test(message)) conversationType = 'economic_regime';
    else if (/anomaly|crisis|stress/.test(message)) conversationType = 'market_anomaly';
    else if (/portfolio|allocation|optimization/.test(message)) conversationType = 'portfolio_optimization';
    else if (/cambodia|lending|fund/.test(message)) conversationType = 'cambodia_intelligence';
    else if (/urgent|emergency|critical/.test(message)) conversationType = 'urgent_strategic';
    else if (/hello|hi|hey/.test(message)) conversationType = 'casual';
    
    const conversationIntel = {
        type: conversationType,
        complexity: 'moderate',
        primaryAI: 'GPT_COMMANDER',
        secondaryAI: null,
        liveDataRequired: true,
        style: 'helpful_intelligent',
        reasoning: 'Legacy smart context routing'
    };
    
    return await buildEnhancedDualCommandContext(chatId, userMessage, conversationIntel);
}

/**
 * 🏛️ RAY DALIO CONTEXT BUILDER (LEGACY - REDIRECTS TO ENHANCED)
 */
async function buildRayDalioContext(chatId, userMessage) {
    console.log('⚠️ Legacy buildRayDalioContext called - redirecting to enhanced version');
    
    const conversationIntel = {
        type: 'economic_regime',
        complexity: 'high',
        primaryAI: 'CLAUDE_INTELLIGENCE',
        secondaryAI: null,
        liveDataRequired: true,
        specializedFunction: 'getClaudeRegimeAnalysis',
        style: 'ray_dalio_institutional',
        reasoning: 'Legacy Ray Dalio context'
    };
    
    return await buildEnhancedDualCommandContext(chatId, userMessage, conversationIntel);
}

/**
 * 🔍 ANALYZE RAY DALIO CONTEXT NEEDS (LEGACY - REDIRECTS TO ENHANCED)
 */
function analyzeRayDalioContextNeeds(userMessage) {
    console.log('⚠️ Legacy analyzeRayDalioContextNeeds called - redirecting to enhanced version');
    return analyzeEnhancedContextNeeds(userMessage, {
        type: 'economic_regime',
        complexity: 'high',
        primaryAI: 'CLAUDE_INTELLIGENCE'
    });
}

/**
 * 🔍 ANALYZE STRATEGIC CONTEXT WARFARE NEEDS (LEGACY - REDIRECTS TO ENHANCED)
 */
function analyzeStrategicContextNeeds(userMessage) {
    console.log('⚠️ Legacy analyzeStrategicContextNeeds called - redirecting to enhanced version');
    return analyzeEnhancedContextNeeds(userMessage, {
        type: 'institutional_analysis',
        complexity: 'maximum',
        primaryAI: 'GPT_COMMANDER'
    });
}

module.exports = {
    // 🎯 ENHANCED DUAL AI SYSTEM FUNCTIONS (NEW)
    buildEnhancedDualCommandContext,
    getEnhancedSmartContext,
    analyzeEnhancedContextNeeds,
    optimizeContextForAI,
    getContextAnalytics,
    
    // 🔧 ENHANCED UTILITIES
    getCurrentGlobalTimeContext,
    buildBasicDualAIContext,
    
    // 📊 ENHANCED ASSESSMENT FUNCTIONS
    assessStrategicPositionRegimeRisk,
    buildStrategicRegimeContext,
    
    // 🏦 CAMBODIA STRATEGIC FUNCTIONS (ENHANCED)
    buildCambodiaStrategicContext,
    
    // 💹 TRADING INTELLIGENCE FUNCTIONS (ENHANCED)
    buildStrategicTradingIntelligence,
    buildStrategicRegimeIntelligence,
    buildStrategicMarketCycleContext,
    
    // 🔄 LEGACY COMPATIBILITY (REDIRECTS TO ENHANCED VERSIONS)
    buildStrategicCommanderContext,
    buildEnhancedContext,
    getSmartContext,
    buildRayDalioContext,
    analyzeRayDalioContextNeeds,
    analyzeStrategicContextNeeds,
    
    // Legacy aliases for backward compatibility
    analyzeContextNeeds: analyzeEnhancedContextNeeds
};
