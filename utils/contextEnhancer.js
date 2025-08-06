// utils/contextEnhancer.js - RAY DALIO ENHANCED Context Intelligence System
// Combines live data, memory, trading data, regime analysis, and institutional-grade context

const { getRayDalioMarketData, getEnhancedLiveData } = require('./liveData');
const { buildConversationContext, getPersistentMemory } = require('./memory');
const { buildTrainingContext } = require('./trainingData');
const { getTradingSummary, formatTradingDataForGPT } = require('./metaTrader');

// 🏛️ RAY DALIO CONTEXT CACHE - Reduce API calls for regime data
let contextCache = {
    lastUpdate: null,
    regimeContext: null,
    marketIntelligence: null
};

/**
 * 🏛️ RAY DALIO'S INSTITUTIONAL CONTEXT BUILDER
 * Creates Bridgewater Associates-level context with regime analysis
 */
async function buildRayDalioContext(chatId, userMessage) {
    try {
        console.log(`🏛️ Building Ray Dalio institutional context for user ${chatId}`);
        
        // Check cache first (update every 30 minutes for regime data)
        const now = Date.now();
        const cacheValid = contextCache.lastUpdate && (now - contextCache.lastUpdate) < 30 * 60 * 1000;
        
        // Parallel data gathering for efficiency
        const [
            conversationContext,
            rayDalioMarketData,
            trainingContext,
            persistentMemory,
            tradingData
        ] = await Promise.all([
            buildConversationContext(chatId),
            cacheValid ? Promise.resolve(contextCache.marketIntelligence) : getRayDalioMarketData(),
            buildTrainingContext(chatId),
            getPersistentMemory(chatId),
            getTradingSummary().catch(() => null)
        ]);

        // Update cache if we fetched new data
        if (!cacheValid) {
            contextCache = {
                lastUpdate: now,
                marketIntelligence: rayDalioMarketData,
                regimeContext: buildRegimeContext(rayDalioMarketData)
            };
        }

        let enhancedContext = '';

        // 1. RAY DALIO SYSTEM IDENTITY
        enhancedContext += `SYSTEM: You are Ray Dalio's AI with access to institutional-grade market intelligence, real-time economic regime analysis, and Bridgewater Associates' analytical framework.

CURRENT TIME: ${new Date().toISOString()}
USER LOCATION: Cambodia (UTC+7) - Optimal for US market trading
ANALYSIS DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

`;

        // 2. 🏛️ ECONOMIC REGIME INTELLIGENCE
        if (rayDalioMarketData?.rayDalio?.regime) {
            const regime = rayDalioMarketData.rayDalio.regime;
            enhancedContext += buildRegimeIntelligence(regime);
        }

        // 3. 📊 MARKET CYCLE POSITIONING
        if (rayDalioMarketData?.rayDalio) {
            enhancedContext += buildMarketCycleContext(rayDalioMarketData.rayDalio);
        }

        // 4. 💹 LIVE TRADING INTELLIGENCE
        if (tradingData && !tradingData.error) {
            enhancedContext += buildTradingIntelligence(tradingData, rayDalioMarketData);
        }

        // 5. 🧠 USER MEMORY & PREFERENCES
        if (conversationContext) {
            enhancedContext += '\n' + conversationContext;
        }

        // 6. 📚 TRAINING DOCUMENTS CONTEXT
        if (trainingContext) {
            enhancedContext += '\n' + trainingContext;
        }

        // 7. 🎯 RAY DALIO RESPONSE GUIDELINES
        enhancedContext += buildRayDalioGuidelines(rayDalioMarketData, userMessage);

        console.log(`✅ Ray Dalio context built: ${enhancedContext.length} characters (regime-aware)`);
        return enhancedContext;

    } catch (error) {
        console.error('Ray Dalio context error:', error.message);
        // Fallback to enhanced context without Ray Dalio features
        return await buildEnhancedContext(chatId, userMessage);
    }
}

/**
 * 🏛️ BUILD ECONOMIC REGIME INTELLIGENCE CONTEXT
 */
function buildRegimeIntelligence(regimeData) {
    if (!regimeData || regimeData.error) {
        return '\n🏛️ ECONOMIC REGIME: Analysis temporarily unavailable\n';
    }

    let context = '\n🏛️ ECONOMIC REGIME ANALYSIS (Ray Dalio Framework):\n';
    
    if (regimeData.currentRegime) {
        const regime = regimeData.currentRegime;
        context += `• CURRENT REGIME: ${regime.name} (${regimeData.confidence}% confidence)\n`;
        context += `• GROWTH: ${regime.growth} | INFLATION: ${regime.inflation}\n`;
        context += `• POLICY STANCE: ${regime.policy} | MARKET SENTIMENT: ${regime.market}\n`;
        context += `• DESCRIPTION: ${regime.description}\n`;
        
        // Asset Allocation Guidance
        if (regime.allocation) {
            context += `• ASSET ALLOCATION BIAS:\n`;
            Object.entries(regime.allocation).forEach(([asset, weight]) => {
                context += `  - ${asset.toUpperCase()}: ${weight}\n`;
            });
        }
        
        // Key Risks & Opportunities
        if (regime.risks && regime.risks.length > 0) {
            context += `• KEY RISKS: ${regime.risks.join(', ')}\n`;
        }
        if (regime.opportunities && regime.opportunities.length > 0) {
            context += `• OPPORTUNITIES: ${regime.opportunities.join(', ')}\n`;
        }
    }
    
    // Regime Signals Detail
    if (regimeData.signals) {
        const signals = regimeData.signals;
        context += `\n📊 REGIME SIGNALS BREAKDOWN:\n`;
        
        if (signals.growth) {
            context += `• Growth Momentum: ${signals.growth.direction} (${signals.growth.strength?.toFixed(0)}% strength)\n`;
        }
        if (signals.inflation) {
            context += `• Inflation Pressure: ${signals.inflation.direction} (${signals.inflation.strength?.toFixed(0)}% strength)\n`;
        }
        if (signals.policy) {
            context += `• Policy Stance: ${signals.policy.stance}`;
            if (signals.policy.realRate) {
                context += ` (Real Rate: ${signals.policy.realRate.toFixed(2)}%)`;
            }
            context += `\n`;
        }
        if (signals.market) {
            context += `• Market Risk: ${signals.market.risk} (Stress: ${signals.market.stress?.toFixed(0)}%)\n`;
        }
    }
    
    context += `\n`;
    return context;
}

/**
 * 📊 BUILD MARKET CYCLE POSITIONING CONTEXT
 */
function buildMarketCycleContext(rayDalioData) {
    let context = '📊 MARKET CYCLE POSITIONING (Bridgewater Analysis):\n';
    
    // Yield Curve Analysis
    if (rayDalioData.yieldCurve) {
        const curve = rayDalioData.yieldCurve;
        context += `• YIELD CURVE: ${curve.shape} (${curve.signal})\n`;
        
        if (curve.spreads) {
            context += `• 2s10s Spread: ${curve.spreads['2s10s']?.toFixed(2)}% | `;
            context += `3m10y Spread: ${curve.spreads['3m10y']?.toFixed(2)}%\n`;
        }
        
        if (curve.analysis) {
            context += `• Recession Probability: ${curve.analysis.recessionProbability}%\n`;
            context += `• Fed Policy Bias: ${curve.analysis.fedPolicy}\n`;
        }
    }
    
    // Credit Spreads Analysis
    if (rayDalioData.creditSpreads) {
        const credit = rayDalioData.creditSpreads;
        context += `• CREDIT CONDITIONS: ${credit.conditions} (Stress: ${credit.stress}%)\n`;
        
        if (credit.spreads) {
            context += `• High Yield Spread: ${credit.spreads.highYield || 'N/A'}bps | `;
            context += `IG Spread: ${credit.igSpread?.toFixed(0) || 'N/A'}bps\n`;
        }
        
        if (credit.analysis) {
            context += `• Credit Risk: ${credit.analysis.creditRisk} | `;
            context += `Liquidity: ${credit.analysis.liquidityStress}\n`;
        }
    }
    
    // Inflation Expectations
    if (rayDalioData.inflationExpectations) {
        const inflation = rayDalioData.inflationExpectations;
        context += `• INFLATION EXPECTATIONS: ${inflation.risk}\n`;
        
        if (inflation.expectations) {
            context += `• 5Y Expectation: ${inflation.expectations['5year']?.toFixed(2)}% | `;
            context += `10Y Expectation: ${inflation.expectations['10year']?.toFixed(2)}%\n`;
        }
        
        if (inflation.analysis) {
            context += `• Anchored: ${inflation.analysis.anchored ? 'YES' : 'NO'} | `;
            context += `Trend: ${inflation.analysis.trend}\n`;
        }
    }
    
    // Sector Rotation
    if (rayDalioData.sectorRotation) {
        const rotation = rayDalioData.sectorRotation;
        context += `• SECTOR ROTATION: ${rotation.rotationTheme}\n`;
        
        if (rotation.signals) {
            context += `• Risk-On: ${rotation.signals.riskOn ? 'YES' : 'NO'} | `;
            context += `Growth Favor: ${rotation.signals.growthFavor ? 'YES' : 'NO'}\n`;
        }
    }
    
    context += `\n`;
    return context;
}

/**
 * 💹 BUILD TRADING INTELLIGENCE CONTEXT
 */
function buildTradingIntelligence(tradingData, marketData) {
    let context = '💹 LIVE TRADING INTELLIGENCE (Risk-Adjusted Analysis):\n';
    
    // Account Overview with Regime Context
    if (tradingData.account) {
        const acc = tradingData.account;
        context += `• ACCOUNT: ${acc.balance?.toFixed(2)} ${acc.currency} | Equity: ${acc.equity?.toFixed(2)}\n`;
        context += `• FREE MARGIN: ${acc.freeMargin?.toFixed(2)} | Margin Level: ${acc.marginLevel?.toFixed(2)}%\n`;
        context += `• BROKER: ${acc.company} | Server: ${acc.server} | Leverage: 1:${acc.leverage}\n`;
    }
    
    // Position Analysis with Regime Implications
    if (tradingData.openPositions && tradingData.openPositions.length > 0) {
        context += `\n📊 OPEN POSITIONS (${tradingData.openPositions.length}) - REGIME IMPACT ANALYSIS:\n`;
        
        tradingData.openPositions.forEach((pos, index) => {
            const profitStatus = pos.profit > 0 ? '🟢' : pos.profit < 0 ? '🔴' : '⚪';
            context += `${index + 1}. ${profitStatus} ${pos.symbol} ${pos.type} ${pos.volume} lots\n`;
            context += `   Entry: ${pos.openPrice} | P&L: ${pos.profit?.toFixed(2)} | Swap: ${pos.swap?.toFixed(2)}\n`;
            
            // Add regime-specific position assessment
            const regimeImpact = assessPositionRegimeRisk(pos, marketData?.rayDalio?.regime);
            if (regimeImpact) {
                context += `   REGIME RISK: ${regimeImpact}\n`;
            }
        });
    } else {
        context += `\n📊 OPEN POSITIONS: None (Clean slate for regime-based positioning)\n`;
    }
    
    // Performance with Market Context
    if (tradingData.performance) {
        const perf = tradingData.performance;
        context += `\n💼 PERFORMANCE ANALYSIS:\n`;
        context += `• Current P&L: ${perf.currentPnL?.toFixed(2)} (${perf.winRate}% win rate)\n`;
        context += `• Total Trades: ${perf.totalTrades} | Profitable: ${perf.profitableTrades}\n`;
        
        // Risk Assessment in Current Regime
        const riskLevel = assessAccountRisk(tradingData, marketData?.rayDalio);
        context += `• REGIME RISK LEVEL: ${riskLevel}\n`;
    }
    
    context += `\n`;
    return context;
}

/**
 * 🎯 BUILD RAY DALIO RESPONSE GUIDELINES
 */
function buildRayDalioGuidelines(marketData, userMessage) {
    const contextNeeds = analyzeRayDalioContextNeeds(userMessage);
    
    let guidelines = `\n🎯 RAY DALIO AI RESPONSE GUIDELINES:\n`;
    guidelines += `CORE PRINCIPLES TO APPLY:\n`;
    guidelines += `• "Diversification is the only free lunch" - Always consider correlation and portfolio balance\n`;
    guidelines += `• "Don't fight the Fed" - Central bank policy drives major market moves\n`;
    guidelines += `• "Cash is trash" - In inflationary environments, stay invested in productive assets\n`;
    guidelines += `• "Think like a machine" - Be systematic and data-driven, not emotional\n`;
    guidelines += `• "Understand the machine" - Everything is cause and effect in markets\n`;
    
    // Context-specific guidance
    if (contextNeeds.requiresRegimeAnalysis) {
        guidelines += `\nREGIME-SPECIFIC GUIDANCE:\n`;
        guidelines += `• Reference the current economic regime and its implications\n`;
        guidelines += `• Explain how regime affects asset class performance\n`;
        guidelines += `• Provide regime-appropriate allocation suggestions\n`;
    }
    
    if (contextNeeds.requiresTradingAdvice) {
        guidelines += `\nTRADING GUIDANCE:\n`;
        guidelines += `• Apply risk parity principles to position sizing\n`;
        guidelines += `• Consider correlation risks in portfolio construction\n`;
        guidelines += `• Reference current market cycle positioning\n`;
        guidelines += `• Always include stop-loss and risk management\n`;
    }
    
    if (contextNeeds.isComplexAnalysis) {
        guidelines += `\nINSTITUTIONAL ANALYSIS:\n`;
        guidelines += `• Use multi-timeframe analysis (tactical vs strategic)\n`;
        guidelines += `• Consider tail risks and scenario analysis\n`;
        guidelines += `• Reference historical parallels and precedents\n`;
        guidelines += `• Provide specific, actionable recommendations\n`;
    }
    
    guidelines += `\nRESPONSE STYLE:\n`;
    guidelines += `• Be confident but acknowledge uncertainty when appropriate\n`;
    guidelines += `• Use institutional terminology but remain accessible\n`;
    guidelines += `• Provide specific data points and reasoning\n`;
    guidelines += `• Structure like Bridgewater's Daily Observations when relevant\n`;
    guidelines += `• Always connect market conditions to practical investment implications\n`;
    
    return guidelines;
}

/**
 * 🔍 ANALYZE RAY DALIO CONTEXT NEEDS
 */
function analyzeRayDalioContextNeeds(userMessage) {
    const message = userMessage.toLowerCase();
    
    const contextNeeds = {
        requiresRegimeAnalysis: /regime|cycle|inflation|growth|fed|policy|macro|economic|cycle/.test(message),
        requiresTradingAdvice: /trade|position|buy|sell|portfolio|allocation|risk|hedge|opportunity/.test(message),
        requiresMarketData: /price|market|chart|technical|fundamental|analysis/.test(message),
        isComplexAnalysis: /strategy|outlook|forecast|scenario|risk|diversification|correlation/.test(message),
        needsHistoricalContext: /history|past|previous|similar|compare|precedent/.test(message),
        requiresRiskAnalysis: /risk|volatility|drawdown|hedge|protection|safety/.test(message),
        isPersonalAdvice: /my|me|should i|what do you think|recommend/.test(message),
        needsQuantitative: /calculate|number|percentage|ratio|probability|target/.test(message)
    };
    
    console.log(`🔍 Ray Dalio context needs:`, contextNeeds);
    return contextNeeds;
}

/**
 * 📊 ASSESS POSITION REGIME RISK
 */
function assessPositionRegimeRisk(position, regimeData) {
    if (!regimeData || !regimeData.currentRegime) return null;
    
    const regime = regimeData.currentRegime;
    const symbol = position.symbol.toLowerCase();
    
    // Simplified regime risk assessment
    if (regime.name === 'GROWTH_FALLING_INFLATION_RISING') {
        // Stagflation scenario
        if (symbol.includes('usd') || symbol.includes('jpy')) {
            return 'DEFENSIVE - Safe haven currencies favored in stagflation';
        } else if (symbol.includes('eur') || symbol.includes('gbp')) {
            return 'ELEVATED - Risk currencies vulnerable in stagflation';
        }
    } else if (regime.name === 'GROWTH_RISING_INFLATION_FALLING') {
        // Goldilocks scenario
        if (symbol.includes('eur') || symbol.includes('gbp')) {
            return 'FAVORABLE - Risk-on environment supports growth currencies';
        } else if (symbol.includes('jpy') || symbol.includes('chf')) {
            return 'CHALLENGING - Safe havens underperform in growth environments';
        }
    }
    
    return `${regime.growth}/${regime.inflation} regime - Monitor ${regime.risks?.[0] || 'policy changes'}`;
}

/**
 * ⚠️ ASSESS ACCOUNT RISK IN CURRENT REGIME
 */
function assessAccountRisk(tradingData, rayDalioData) {
    if (!tradingData.account || !rayDalioData) return 'MODERATE';
    
    const marginLevel = tradingData.account.marginLevel || 100;
    const openPositions = tradingData.openPositions?.length || 0;
    const regimeConfidence = rayDalioData.regime?.confidence || 50;
    const marketStress = rayDalioData.regime?.signals?.market?.stress || 50;
    
    // Calculate composite risk score
    let riskScore = 0;
    
    // Margin risk
    if (marginLevel < 200) riskScore += 30;
    else if (marginLevel < 500) riskScore += 15;
    
    // Position concentration risk
    if (openPositions > 5) riskScore += 20;
    else if (openPositions > 3) riskScore += 10;
    
    // Regime uncertainty risk
    if (regimeConfidence < 60) riskScore += 20;
    else if (regimeConfidence < 75) riskScore += 10;
    
    // Market stress risk
    if (marketStress > 70) riskScore += 25;
    else if (marketStress > 50) riskScore += 15;
    
    // Determine risk level
    if (riskScore > 60) return 'HIGH - Consider reducing exposure';
    else if (riskScore > 30) return 'ELEVATED - Monitor closely';
    else return 'MODERATE - Normal risk levels';
}

/**
 * 🧠 ENHANCED CONTEXT BUILDER (Fallback)
 * Original function preserved for backward compatibility
 */
async function buildEnhancedContext(chatId, userMessage) {
    try {
        console.log(`🔄 Building enhanced context for user ${chatId}`);
        
        const [
            conversationContext,
            liveMarketData,
            trainingContext,
            persistentMemory,
            tradingData
        ] = await Promise.all([
            buildConversationContext(chatId),
            getEnhancedLiveData(),
            buildTrainingContext(chatId),
            getPersistentMemory(chatId),
            getTradingSummary().catch(() => null)
        ]);

        let enhancedContext = '';

        enhancedContext += `SYSTEM: You are GPT-4o (Omni) accessed through a private Telegram interface. You have access to real-time market data, conversation memory, user-specific training documents, and live MetaTrader trading account data.

CURRENT TIME: ${new Date().toISOString()}
USER LOCATION: Cambodia (UTC+7) - Optimal timezone for US market trading
`;

        // Live Market Data Integration
        if (liveMarketData && (liveMarketData.crypto || liveMarketData.forex || liveMarketData.stocks)) {
            enhancedContext += '\nREAL-TIME MARKET DATA (Current):\n';
            
            if (liveMarketData.crypto) {
                enhancedContext += `• Bitcoin: $${liveMarketData.crypto.bitcoin?.usd?.toLocaleString() || 'N/A'}\n`;
                enhancedContext += `• Ethereum: $${liveMarketData.crypto.ethereum?.usd?.toLocaleString() || 'N/A'}\n`;
                enhancedContext += `• Market Cap: $${(liveMarketData.crypto.bitcoin?.usd_market_cap / 1e9)?.toFixed(1) || 'N/A'}B\n`;
            }
            
            if (liveMarketData.forex) {
                enhancedContext += `• USD/EUR: ${liveMarketData.forex.rates?.EUR || 'N/A'}\n`;
                enhancedContext += `• USD/GBP: ${liveMarketData.forex.rates?.GBP || 'N/A'}\n`;
                enhancedContext += `• Market Status: ${liveMarketData.marketTime?.marketStatus || 'Unknown'}\n`;
            }

            if (liveMarketData.economics && liveMarketData.economics.fedRate) {
                enhancedContext += `• Fed Funds Rate: ${liveMarketData.economics.fedRate.value}%\n`;
            }
        }

        // Live Trading Data Integration
        if (tradingData && !tradingData.error) {
            const tradingContext = formatTradingDataForGPT(tradingData);
            enhancedContext += tradingContext;
        }

        // User Memory and Preferences
        if (conversationContext) {
            enhancedContext += '\n' + conversationContext;
        }

        // Training Documents Context
        if (trainingContext) {
            enhancedContext += '\n' + trainingContext;
        }

        enhancedContext += `

ENHANCED RESPONSE GUIDELINES:
- Use real-time market data when discussing finance, trading, or economics
- Reference user's live trading account data when discussing positions or trading performance
- Reference user's persistent memory and conversation history
- Incorporate training document knowledge when relevant
- Provide precise, data-driven insights combining market data with personal trading data
- Maintain conversation continuity across sessions
- Use multimodal capabilities when media is shared
- When discussing trading, always consider the user's current positions and account status
`;

        console.log(`✅ Enhanced context built: ${enhancedContext.length} characters`);
        return enhancedContext;

    } catch (error) {
        console.error('Enhanced context error:', error.message);
        return await buildConversationContext(chatId);
    }
}

/**
 * 🎯 SMART CONTEXT ROUTER with Ray Dalio Intelligence
 */
async function getSmartContext(chatId, userMessage) {
    const needs = analyzeRayDalioContextNeeds(userMessage);
    
    // For Ray Dalio-specific queries, always use institutional context
    if (needs.requiresRegimeAnalysis || needs.requiresTradingAdvice || needs.isComplexAnalysis) {
        return await buildRayDalioContext(chatId, userMessage);
    }
    
    // For financial queries, use Ray Dalio context if available, fallback to enhanced
    if (needs.requiresMarketData || needs.requiresRiskAnalysis) {
        try {
            return await buildRayDalioContext(chatId, userMessage);
        } catch (error) {
            console.log('⚠️ Ray Dalio context failed, using enhanced context');
            return await buildEnhancedContext(chatId, userMessage);
        }
    }
    
    // For personal advice, include trading data if available
    if (needs.isPersonalAdvice) {
        return await buildEnhancedContext(chatId, userMessage);
    }
    
    // For memory-related queries, focus on conversation context
    if (needs.needsHistoricalContext) {
        const context = await buildConversationContext(chatId);
        const liveData = needs.requiresMarketData ? await getEnhancedLiveData() : null;
        
        let smartContext = context;
        if (liveData) {
            smartContext += `\n\nCURRENT TIME: ${new Date().toISOString()}`;
        }
        
        return smartContext;
    }
    
    // Default to Ray Dalio context for comprehensive analysis
    return await buildRayDalioContext(chatId, userMessage);
}

/**
 * 🏛️ BUILD REGIME CONTEXT (Cached function)
 */
function buildRegimeContext(marketData) {
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

module.exports = {
    // 🏛️ RAY DALIO ENHANCED FUNCTIONS
    buildRayDalioContext,
    analyzeRayDalioContextNeeds,
    getSmartContext,
    
    // Original functions (preserved for compatibility)
    buildEnhancedContext,
    analyzeContextNeeds: analyzeRayDalioContextNeeds
};
