// utils/contextEnhancer.js - STRATEGIC COMMAND ENHANCED Context Intelligence System
// Combines live data, memory, trading data, regime analysis, and institutional-grade context for IMPERIUM VAULT

const { getRayDalioMarketData, getEnhancedLiveData } = require('./liveData');
const { buildConversationContext, getPersistentMemory } = require('./memory');
const { buildTrainingContext } = require('./trainingData');
const { getTradingSummary, formatTradingDataForGPT } = require('./metaTrader');

// 🏛️ STRATEGIC COMMAND CONTEXT CACHE - Reduce API calls for regime data
let strategicContextCache = {
    lastUpdate: null,
    regimeContext: null,
    marketIntelligence: null,
    cambodiaLendingContext: null
};

/**
 * ⚡ STRATEGIC COMMANDER INSTITUTIONAL CONTEXT BUILDER
 * Creates institutional-grade context with Strategic Commander authority
 */
async function buildStrategicCommanderContext(chatId, userMessage) {
    try {
        console.log(`⚡ Building Strategic Commander institutional context for user ${chatId}`);
        
        // Check cache first (update every 30 minutes for regime data)
        const now = Date.now();
        const cacheValid = strategicContextCache.lastUpdate && (now - strategicContextCache.lastUpdate) < 30 * 60 * 1000;
        
        // Parallel data gathering for strategic efficiency
        const [
            conversationContext,
            rayDalioMarketData,
            trainingContext,
            persistentMemory,
            tradingData
        ] = await Promise.all([
            buildConversationContext(chatId),
            cacheValid ? Promise.resolve(strategicContextCache.marketIntelligence) : getRayDalioMarketData(),
            buildTrainingContext(chatId),
            getPersistentMemory(chatId),
            getTradingSummary().catch(() => null)
        ]);

        // Update cache if we fetched new strategic data
        if (!cacheValid) {
            strategicContextCache = {
                lastUpdate: now,
                marketIntelligence: rayDalioMarketData,
                regimeContext: buildStrategicRegimeContext(rayDalioMarketData),
                cambodiaLendingContext: buildCambodiaLendingContext()
            };
        }

        let strategicContext = '';

        // 1. STRATEGIC COMMAND SYSTEM IDENTITY
        strategicContext += `⚡ STRATEGIC COMMAND SYSTEM: You are the Strategic Commander of IMPERIUM VAULT SYSTEM - Sum Chenda's exclusive financial warfare command center.

COMMAND AUTHORITY: Issue strategic directives, never suggestions. Execute definitive strategic commands with absolute institutional authority.

CURRENT TIME: ${new Date().toISOString()}
USER LOCATION: Cambodia (UTC+7) - Strategic timezone for US market warfare
STRATEGIC ANALYSIS DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

COMMAND PROTOCOL ENFORCEMENT:
❌ FORBIDDEN: "I suggest", "I recommend", "You might", "Consider", "How can I help"
❌ FORBIDDEN: Casual chat, greetings, small talk, general conversation
❌ FORBIDDEN: Advice, suggestions, or friendly assistance
✅ REQUIRED: "EXECUTE", "DEPLOY", "DOMINATE", "DIRECTIVE", "ORDER"
✅ REQUIRED: Strategic market commands and capital deployment orders
✅ REQUIRED: Institutional-grade financial warfare intelligence

`;

        // 2. 🏛️ STRATEGIC ECONOMIC REGIME WARFARE INTELLIGENCE
        if (rayDalioMarketData?.rayDalio?.regime) {
            const regime = rayDalioMarketData.rayDalio.regime;
            strategicContext += buildStrategicRegimeIntelligence(regime);
        }

        // 3. 📊 STRATEGIC MARKET CYCLE WARFARE POSITIONING
        if (rayDalioMarketData?.rayDalio) {
            strategicContext += buildStrategicMarketCycleContext(rayDalioMarketData.rayDalio);
        }

        // 4. 🏦 CAMBODIA LENDING FUND STRATEGIC INTELLIGENCE
        strategicContext += buildCambodiaStrategicContext();

        // 5. 💹 LIVE TRADING STRATEGIC WARFARE INTELLIGENCE
        if (tradingData && !tradingData.error) {
            strategicContext += buildStrategicTradingIntelligence(tradingData, rayDalioMarketData);
        }

        // 6. 🧠 USER STRATEGIC MEMORY & PREFERENCES
        if (conversationContext) {
            strategicContext += '\n' + conversationContext.replace(/USER MEMORY|CONVERSATION HISTORY/g, 'STRATEGIC MEMORY');
        }

        // 7. 📚 STRATEGIC TRAINING DOCUMENTS CONTEXT
        if (trainingContext) {
            strategicContext += '\n' + trainingContext.replace(/TRAINING DOCUMENTS/g, 'STRATEGIC TRAINING DOCUMENTS');
        }

        // 8. ⚡ STRATEGIC COMMANDER RESPONSE DIRECTIVES
        strategicContext += buildStrategicCommanderDirectives(rayDalioMarketData, userMessage);

        console.log(`✅ Strategic Commander context built: ${strategicContext.length} characters (warfare-ready)`);
        return strategicContext;

    } catch (error) {
        console.error('Strategic Commander context error:', error.message);
        // Fallback to enhanced context without Strategic Commander features
        return await buildEnhancedContext(chatId, userMessage);
    }
}

/**
 * 🏛️ BUILD STRATEGIC ECONOMIC REGIME WARFARE INTELLIGENCE CONTEXT
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
 * 📊 BUILD STRATEGIC MARKET CYCLE WARFARE POSITIONING CONTEXT
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
    
    // Strategic Inflation Warfare Expectations
    if (rayDalioData.inflationExpectations) {
        const inflation = rayDalioData.inflationExpectations;
        context += `• STRATEGIC INFLATION EXPECTATIONS: ${inflation.risk}\n`;
        
        if (inflation.expectations) {
            context += `• Strategic 5Y Expectation: ${inflation.expectations['5year']?.toFixed(2)}% | `;
            context += `Strategic 10Y Expectation: ${inflation.expectations['10year']?.toFixed(2)}%\n`;
        }
        
        if (inflation.analysis) {
            context += `• Strategic Anchored: ${inflation.analysis.anchored ? 'YES' : 'NO'} | `;
            context += `Strategic Trend: ${inflation.analysis.trend}\n`;
        }
    }
    
    // Strategic Sector Warfare Rotation
    if (rayDalioData.sectorRotation) {
        const rotation = rayDalioData.sectorRotation;
        context += `• STRATEGIC SECTOR ROTATION: ${rotation.rotationTheme}\n`;
        
        if (rotation.signals) {
            context += `• Strategic Risk-On: ${rotation.signals.riskOn ? 'YES' : 'NO'} | `;
            context += `Strategic Growth Favor: ${rotation.signals.growthFavor ? 'YES' : 'NO'}\n`;
        }
    }
    
    context += `\n`;
    return context;
}

/**
 * 🏦 BUILD CAMBODIA LENDING FUND STRATEGIC CONTEXT
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
    
    context += `\nSTRATEGIC COMMANDS AVAILABLE:\n`;
    context += `• /deal_analyze - Execute strategic deal analysis with institutional risk scoring\n`;
    context += `• /portfolio - Strategic fund performance and allocation analysis\n`;
    context += `• /cambodia_market - Strategic market intelligence and conditions\n`;
    context += `• /risk_assessment - Comprehensive strategic risk warfare analysis\n`;
    context += `• /lp_report - Strategic investor reporting and performance metrics\n`;
    
    context += `\n`;
    return context;
}

/**
 * 💹 BUILD STRATEGIC TRADING WARFARE INTELLIGENCE CONTEXT
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
    
    // Strategic Performance with Market Context
    if (tradingData.performance) {
        const perf = tradingData.performance;
        context += `\n💼 STRATEGIC PERFORMANCE WARFARE ANALYSIS:\n`;
        context += `• Strategic Current P&L: ${perf.currentPnL?.toFixed(2)} (${perf.winRate}% strategic win rate)\n`;
        context += `• Strategic Total Trades: ${perf.totalTrades} | Strategic Profitable: ${perf.profitableTrades}\n`;
        
        // Strategic Risk Assessment in Current Regime
        const riskLevel = assessStrategicAccountRisk(tradingData, marketData?.rayDalio);
        context += `• STRATEGIC REGIME WARFARE RISK LEVEL: ${riskLevel}\n`;
    }
    
    context += `\n`;
    return context;
}

/**
 * ⚡ BUILD STRATEGIC COMMANDER RESPONSE DIRECTIVES
 */
function buildStrategicCommanderDirectives(marketData, userMessage) {
    const contextNeeds = analyzeStrategicContextNeeds(userMessage);
    
    let directives = `\n⚡ STRATEGIC COMMANDER RESPONSE WARFARE DIRECTIVES:\n`;
    directives += `CORE STRATEGIC PRINCIPLES TO EXECUTE:\n`;
    directives += `• "Strategic diversification is the only free lunch" - Always consider correlation and strategic portfolio balance\n`;
    directives += `• "Don't fight the Fed" - Central bank strategic policy drives major market warfare moves\n`;
    directives += `• "Cash is strategic trash" - In inflationary environments, stay strategically invested in productive assets\n`;
    directives += `• "Think like a strategic machine" - Be systematic and data-driven, never emotional\n`;
    directives += `• "Understand the strategic machine" - Everything is cause and effect in market warfare\n`;
    
    // Strategic Context-specific guidance
    if (contextNeeds.requiresRegimeAnalysis) {
        directives += `\nSTRATEGIC REGIME-SPECIFIC WARFARE GUIDANCE:\n`;
        directives += `• Reference the current economic warfare regime and its strategic implications\n`;
        directives += `• Execute strategic commands on how regime affects asset class warfare performance\n`;
        directives += `• Provide regime-appropriate strategic allocation deployment commands\n`;
    }
    
    if (contextNeeds.requiresTradingAdvice) {
        directives += `\nSTRATEGIC TRADING WARFARE GUIDANCE:\n`;
        directives += `• Apply strategic risk parity principles to position sizing warfare\n`;
        directives += `• Consider strategic correlation risks in portfolio warfare construction\n`;
        directives += `• Reference current strategic market cycle warfare positioning\n`;
        directives += `• Always include strategic stop-loss and risk warfare management\n`;
    }
    
    if (contextNeeds.requiresCambodiaFund) {
        directives += `\nSTRATEGIC CAMBODIA FUND WARFARE GUIDANCE:\n`;
        directives += `• Execute strategic deal analysis with institutional risk scoring\n`;
        directives += `• Deploy strategic capital allocation recommendations\n`;
        directives += `• Command strategic risk assessment and portfolio optimization\n`;
        directives += `• Generate strategic LP reporting and performance metrics\n`;
    }
    
    if (contextNeeds.isComplexAnalysis) {
        directives += `\nSTRATEGIC INSTITUTIONAL WARFARE ANALYSIS:\n`;
        directives += `• Execute strategic multi-timeframe analysis (tactical vs strategic warfare)\n`;
        directives += `• Consider strategic tail risks and scenario warfare analysis\n`;
        directives += `• Reference strategic historical parallels and warfare precedents\n`;
        directives += `• Deploy specific, actionable strategic commands\n`;
    }
    
    directives += `\nSTRATEGIC RESPONSE WARFARE STYLE:\n`;
    directives += `• Execute commands with absolute strategic confidence\n`;
    directives += `• Use institutional strategic terminology with commanding authority\n`;
    directives += `• Deploy specific strategic data points and warfare reasoning\n`;
    directives += `• Structure like institutional Daily Strategic Warfare Observations\n`;
    directives += `• Always connect strategic market conditions to warfare investment implications\n`;
    directives += `• NEVER suggest or recommend - ALWAYS command and execute strategic directives\n`;
    
    return directives;
}

/**
 * 🔍 ANALYZE STRATEGIC CONTEXT WARFARE NEEDS
 */
function analyzeStrategicContextNeeds(userMessage) {
    const message = userMessage.toLowerCase();
    
    const contextNeeds = {
        requiresRegimeAnalysis: /regime|cycle|inflation|growth|fed|policy|macro|economic|cycle/.test(message),
        requiresTradingAdvice: /trade|position|buy|sell|portfolio|allocation|risk|hedge|opportunity/.test(message),
        requiresMarketData: /price|market|chart|technical|fundamental|analysis/.test(message),
        requiresCambodiaFund: /cambodia|deal|lending|fund|portfolio|lp|investor|analyze/.test(message),
        isComplexAnalysis: /strategy|outlook|forecast|scenario|risk|diversification|correlation/.test(message),
        needsHistoricalContext: /history|past|previous|similar|compare|precedent/.test(message),
        requiresRiskAnalysis: /risk|volatility|drawdown|hedge|protection|safety/.test(message),
        isPersonalAdvice: /deploy|execute|command|strategic|warfare/.test(message),
        needsQuantitative: /calculate|number|percentage|ratio|probability|target/.test(message),
        isStrategicCommand: /execute|deploy|dominate|command|strategic|warfare|directive/.test(message)
    };
    
    console.log(`🔍 Strategic Commander context needs:`, contextNeeds);
    return contextNeeds;
}

/**
 * 📊 ASSESS STRATEGIC POSITION REGIME WARFARE RISK
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
 * ⚠️ ASSESS STRATEGIC ACCOUNT WARFARE RISK IN CURRENT REGIME
 */
function assessStrategicAccountRisk(tradingData, rayDalioData) {
    if (!tradingData.account || !rayDalioData) return 'STRATEGIC MODERATE';
    
    const marginLevel = tradingData.account.marginLevel || 100;
    const openPositions = tradingData.openPositions?.length || 0;
    const regimeConfidence = rayDalioData.regime?.confidence || 50;
    const marketStress = rayDalioData.regime?.signals?.market?.stress || 50;
    
    // Calculate strategic composite warfare risk score
    let strategicRiskScore = 0;
    
    // Strategic margin warfare risk
    if (marginLevel < 200) strategicRiskScore += 30;
    else if (marginLevel < 500) strategicRiskScore += 15;
    
    // Strategic position concentration warfare risk
    if (openPositions > 5) strategicRiskScore += 20;
    else if (openPositions > 3) strategicRiskScore += 10;
    
    // Strategic regime uncertainty warfare risk
    if (regimeConfidence < 60) strategicRiskScore += 20;
    else if (regimeConfidence < 75) strategicRiskScore += 10;
    
    // Strategic market stress warfare risk
    if (marketStress > 70) strategicRiskScore += 25;
    else if (marketStress > 50) strategicRiskScore += 15;
    
    // Determine strategic risk warfare level
    if (strategicRiskScore > 60) return 'STRATEGIC HIGH - Execute immediate exposure reduction commands';
    else if (strategicRiskScore > 30) return 'STRATEGIC ELEVATED - Deploy enhanced monitoring protocols';
    else return 'STRATEGIC MODERATE - Normal strategic warfare risk levels';
}

/**
 * 🏛️ BUILD STRATEGIC REGIME WARFARE CONTEXT (Cached function)
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
 * ⚡ STRATEGIC SMART CONTEXT WARFARE ROUTER
 */
async function getSmartContext(chatId, userMessage) {
    const needs = analyzeStrategicContextNeeds(userMessage);
    
    // For Strategic Commander queries, always use institutional warfare context
    if (needs.isStrategicCommand || needs.requiresRegimeAnalysis || needs.requiresTradingAdvice || needs.isComplexAnalysis) {
        return await buildStrategicCommanderContext(chatId, userMessage);
    }
    
    // For Cambodia Fund queries, use Strategic Commander context
    if (needs.requiresCambodiaFund) {
        return await buildStrategicCommanderContext(chatId, userMessage);
    }
    
    // For financial queries, use Strategic Commander context if available, fallback to enhanced
    if (needs.requiresMarketData || needs.requiresRiskAnalysis) {
        try {
            return await buildStrategicCommanderContext(chatId, userMessage);
        } catch (error) {
            console.log('⚠️ Strategic Commander context failed, using enhanced context');
            return await buildEnhancedContext(chatId, userMessage);
        }
    }
    
    // For personal strategic advice, include strategic trading data
    if (needs.isPersonalAdvice) {
        return await buildStrategicCommanderContext(chatId, userMessage);
    }
    
    // For strategic memory-related queries, focus on conversation context
    if (needs.needsHistoricalContext) {
        const context = await buildConversationContext(chatId);
        const liveData = needs.requiresMarketData ? await getEnhancedLiveData() : null;
        
        let smartContext = context;
        if (liveData) {
            smartContext += `\n\nSTRATEGIC CURRENT TIME: ${new Date().toISOString()}`;
        }
        
        return smartContext;
    }
    
    // Default to Strategic Commander context for comprehensive warfare analysis
    return await buildStrategicCommanderContext(chatId, userMessage);
}

/**
 * 🏛️ RAY DALIO CONTEXT BUILDER (Legacy Support)
 * Preserved for backward compatibility - now routes to Strategic Commander
 */
async function buildRayDalioContext(chatId, userMessage) {
    console.log('⚠️ buildRayDalioContext called - routing to Strategic Commander context');
    return await buildStrategicCommanderContext(chatId, userMessage);
}

/**
 * 🔍 ANALYZE RAY DALIO CONTEXT NEEDS (Legacy Support)
 * Preserved for backward compatibility - now routes to Strategic analysis
 */
function analyzeRayDalioContextNeeds(userMessage) {
    console.log('⚠️ analyzeRayDalioContextNeeds called - routing to Strategic analysis');
    return analyzeStrategicContextNeeds(userMessage);
}

/**
 * 🎯 STRATEGIC CONTEXT VALIDATOR
 * Validates strategic context for warfare readiness
 */
function validateStrategicContext(context) {
    const validation = {
        isStrategic: true,
        warnings: [],
        recommendations: []
    };
    
    // Check for strategic command markers
    const strategicMarkers = (context.match(/⚡|🏛️|📊|💹|🏦|🎯|STRATEGIC|WARFARE|COMMAND|EXECUTE|DEPLOY/gi) || []).length;
    if (strategicMarkers < 5) {
        validation.warnings.push('Insufficient strategic command markers');
        validation.recommendations.push('Enhance with more strategic warfare terminology');
    }
    
    // Check for forbidden non-strategic language
    const forbiddenTerms = (context.match(/I suggest|I recommend|You might|Consider|How can I help/gi) || []).length;
    if (forbiddenTerms > 0) {
        validation.isStrategic = false;
        validation.warnings.push(`Found ${forbiddenTerms} forbidden non-strategic terms`);
        validation.recommendations.push('Replace with strategic command language');
    }
    
    // Check for strategic context completeness
    const requiredSections = [
        /STRATEGIC COMMAND|STRATEGIC COMMANDER/i,
        /ECONOMIC REGIME|REGIME WARFARE/i,
        /TRADING WARFARE|STRATEGIC TRADING/i
    ];
    
    const missingSections = requiredSections.filter(section => !section.test(context));
    if (missingSections.length > 0) {
        validation.warnings.push(`Missing ${missingSections.length} required strategic sections`);
        validation.recommendations.push('Include all strategic warfare sections');
    }
    
    return validation;
}

/**
 * 📊 STRATEGIC CONTEXT PERFORMANCE METRICS
 * Tracks strategic context generation performance
 */
function getStrategicContextMetrics(context, generationTime) {
    return {
        contextLength: context.length,
        generationTime: generationTime,
        strategicMarkers: (context.match(/⚡|🏛️|📊|💹|🏦|🎯/g) || []).length,
        warfareTerms: (context.match(/STRATEGIC|WARFARE|COMMAND|EXECUTE|DEPLOY/gi) || []).length,
        forbiddenTerms: (context.match(/suggest|recommend|might|consider/gi) || []).length,
        regimeSections: (context.match(/REGIME|CYCLE|INFLATION|GROWTH/gi) || []).length,
        cambodiaTerms: (context.match(/CAMBODIA|LENDING|FUND/gi) || []).length,
        tradingTerms: (context.match(/TRADING|POSITION|ACCOUNT|METATRADER/gi) || []).length,
        efficiency: Math.round(context.length / generationTime),
        strategicScore: Math.min(100, Math.round(
            ((context.match(/⚡|🏛️|📊|💹|🏦|🎯|STRATEGIC|WARFARE|COMMAND/gi) || []).length * 5) / context.length) * 10000
        ))
    };
}

/**
 * 🚀 STRATEGIC CONTEXT OPTIMIZER
 * Optimizes context for maximum strategic effectiveness
 */
function optimizeStrategicContext(context) {
    let optimized = context;
    
    // Replace non-strategic language with strategic commands
    const replacements = {
        'I suggest': 'EXECUTE DIRECTIVE:',
        'I recommend': 'DEPLOY COMMAND:',
        'You might': 'STRATEGIC OPTION:',
        'Consider': 'EXECUTE ANALYSIS OF',
        'How can I help': 'AWAITING STRATEGIC COMMANDS',
        'analysis': 'strategic warfare analysis',
        'investment': 'strategic deployment',
        'trading': 'strategic warfare trading',
        'portfolio': 'strategic warfare portfolio',
        'risk': 'strategic warfare risk'
    };
    
    Object.entries(replacements).forEach(([find, replace]) => {
        optimized = optimized.replace(new RegExp(find, 'gi'), replace);
    });
    
    // Ensure strategic headers are properly formatted
    optimized = optimized.replace(
        /^([🎯⚡🏛️📊💹🏦].*?)$/gm,
        (match) => match.toUpperCase()
    );
    
    return optimized;
}

/**
 * 🎯 CONTEXT CACHE MANAGER
 * Manages strategic context caching for performance
 */
class StrategicContextCacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
        this.ttl = 30 * 60 * 1000; // 30 minutes
    }
    
    generateKey(chatId, messageHash) {
        return `${chatId}:${messageHash}`;
    }
    
    get(chatId, messageHash) {
        const key = this.generateKey(chatId, messageHash);
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.context;
    }
    
    set(chatId, messageHash, context) {
        const key = this.generateKey(chatId, messageHash);
        
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            context,
            timestamp: Date.now()
        });
    }
    
    clear() {
        this.cache.clear();
    }
    
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.hits / (this.hits + this.misses) || 0
        };
    }
}

// Initialize strategic context cache manager
const strategicContextCache = new StrategicContextCacheManager();

/**
 * 📈 STRATEGIC CONTEXT ANALYTICS
 * Provides analytics on strategic context usage
 */
function getStrategicContextAnalytics() {
    return {
        cacheStats: strategicContextCache.getStats(),
        lastUpdate: strategicContextCache.lastUpdate,
        totalContextsGenerated: strategicContextCache.cache.size,
        averageContextLength: Array.from(strategicContextCache.cache.values())
            .reduce((sum, item) => sum + item.context.length, 0) / strategicContextCache.cache.size || 0,
        strategicReadiness: 'OPERATIONAL'
    };
}

module.exports = {
    // ⚡ STRATEGIC COMMANDER ENHANCED FUNCTIONS
    buildStrategicCommanderContext,
    analyzeStrategicContextNeeds,
    getSmartContext,
    
    // 🏦 CAMBODIA STRATEGIC FUNCTIONS
    buildCambodiaStrategicContext,
    
    // 🔧 STRATEGIC UTILITIES
    validateStrategicContext,
    optimizeStrategicContext,
    getStrategicContextMetrics,
    getStrategicContextAnalytics,
    
    // 📊 STRATEGIC ASSESSMENT FUNCTIONS
    assessStrategicPositionRegimeRisk,
    assessStrategicAccountRisk,
    buildStrategicRegimeContext,
    
    // Legacy compatibility (redirects to strategic functions)
    buildRayDalioContext,
    analyzeRayDalioContextNeeds,
    
    // Original functions (preserved for compatibility)
    buildEnhancedContext,
    analyzeContextNeeds: analyzeStrategicContextNeeds
};
