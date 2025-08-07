require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: "../.env" });

// Debug environment variables
console.log("🔧 Environment check:");
console.log(`ADMIN_CHAT_ID: ${process.env.ADMIN_CHAT_ID}`);
console.log(`TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET"}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "SET" : "NOT SET"}`);
console.log(`METAAPI_TOKEN: ${process.env.METAAPI_TOKEN ? "SET" : "NOT SET"}`);
console.log(`METAAPI_ACCOUNT_ID: ${process.env.METAAPI_ACCOUNT_ID ? "SET" : "NOT SET"}`);

const TelegramBot = require("node-telegram-bot-api");
const { OpenAI } = require("openai");
const { 
    getRealLiveData, 
    getEnhancedLiveData, 
    getEconomicIndicators,
    getStockMarketData,
    getFinancialNews,
    getBusinessHeadlines,
    getSpecificEconomicData,
    generateMarketSummary,
    getFredData,
    getAlphaVantageData,
    getRayDalioMarketData
} = require("./utils/liveData");

// 🏦 CAMBODIA LENDING FUND INTEGRATION
const { 
    analyzeLendingDeal, 
    getPortfolioStatus, 
    getCambodiaMarketConditions, 
    performRiskAssessment, 
    generateLPReport 
} = require("./utils/cambodiaLending");

// 📏 TELEGRAM MESSAGE SPLITTER INTEGRATION
const {
    sendLongMessage,
    sendSmartResponse,
    splitLongMessage,
    formatRayDalioResponse,
    formatCambodiaFundResponse,
    getMessageStats,
    TELEGRAM_LIMITS
} = require("./utils/telegramSplitter");

const {
    processVoiceMessage,
    processImageMessage,
    processDocumentMessage,
    processVideoMessage,
} = require("./utils/multimodal");
const {
    saveConversationDB,
    getConversationHistoryDB,
    addPersistentMemoryDB,
    getPersistentMemoryDB,
    getUserProfileDB,
    updateUserPreferencesDB,
    getDatabaseStats,
    clearUserDataDB,
    initializeDatabase,
} = require("./utils/database");
const {
    buildConversationContext,
    extractAndSaveFacts,
} = require("./utils/memory");
const { buildEnhancedContext, getSmartContext } = require("./utils/contextEnhancer");
const {
    processTrainingDocument,
    getTrainingDocumentsSummary,
    buildTrainingContext,
    clearTrainingDocuments,
} = require("./utils/trainingData");
const {
    getTradingSummary,
    formatTradingDataForGPT,
    executeMarketOrder,
    closePosition,
    getAccountInfo,
    getOpenPositions,
    getPendingOrders,
    initializeMetaAPI,
    getConnectionStatus,
    testConnection,
    calculateRayDalioPositionSize,
    calculatePortfolioRisk,
    scanTradingOpportunities
} = require("./utils/metaTrader");

// ✅ Load credentials
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const openaiKey = process.env.OPENAI_API_KEY;

if (!telegramToken || !openaiKey) {
    console.error("❌ Missing TELEGRAM_BOT_TOKEN or OPENAI_API_KEY in .env");
    process.exit(1);
}

// ✅ Initialize Telegram Bot with webhook support for Railway
const bot = new TelegramBot(telegramToken, { polling: false });

// ✅ Initialize OpenAI API (latest SDK v4.38.1)
const openai = new OpenAI({ apiKey: openaiKey });

// ✅ Initialize Database Connection
initializeDatabase()
    .then(() => {
        console.log("✅ PostgreSQL database connected and tables initialized");
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err.message);
        console.log("⚠️ Falling back to in-memory storage");
    });

// ✅ Initialize MetaAPI Connection
initializeMetaAPI()
    .then((success) => {
        if (success) {
            console.log("✅ MetaAPI connected successfully");
        } else {
            console.log("⚠️ MetaAPI not configured or connection failed");
        }
    })
    .catch((err) => {
        console.log("⚠️ MetaAPI initialization failed:", err.message);
    });

// ✅ User Authentication - Only allow authorized users
function isAuthorizedUser(chatId) {
    const authorizedUsers = process.env.ADMIN_CHAT_ID
        ? process.env.ADMIN_CHAT_ID.split(",").map((id) => parseInt(id.trim()))
        : [];

    console.log(
        `🔍 Auth check: ChatID=${chatId} (type: ${typeof chatId}), Authorized=[${authorizedUsers}] (types: ${authorizedUsers.map((id) => typeof id)})`,
    );

    return authorizedUsers.includes(parseInt(chatId));
}

// 🚀 Enhanced Data Collection Functions
async function getComprehensiveMarketData() {
    try {
        const [
            enhancedData,
            tradingData,
            yield10Y,
            yield2Y,
            vixData,
            dollarIndex,
            goldData,
            oilData
        ] = await Promise.all([
            getEnhancedLiveData(),
            getTradingSummary().catch(() => null),
            getFredData('DGS10'),
            getFredData('DGS2'),
            getAlphaVantageData('VIX'),
            getFredData('DTWEXBGS'),
            getAlphaVantageData('GLD'),
            getAlphaVantageData('USO')
        ]);

        return {
            markets: enhancedData,
            trading: tradingData,
            yields: {
                yield10Y: yield10Y ? parseFloat(yield10Y.value) : null,
                yield2Y: yield2Y ? parseFloat(yield2Y.value) : null,
                curve: yield10Y && yield2Y ? (parseFloat(yield10Y.value) - parseFloat(yield2Y.value)) : null
            },
            fear: vixData?.['Global Quote']?.['05. price'] ? parseFloat(vixData['Global Quote']['05. price']) : null,
            dollar: dollarIndex ? parseFloat(dollarIndex.value) : null,
            commodities: {
                gold: goldData?.['Global Quote']?.['05. price'] ? parseFloat(goldData['Global Quote']['05. price']) : null,
                oil: oilData?.['Global Quote']?.['05. price'] ? parseFloat(oilData['Global Quote']['05. price']) : null
            },
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Comprehensive market data error:', error.message);
        return null;
    }
}

// ✅ Handle all message types like ChatGPT
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    console.log(
        `📨 Message received from ${chatId}:`,
        msg.chat?.type || "private",
    );

    // ✅ SECURITY: Check if user is authorized
    if (!isAuthorizedUser(chatId)) {
        console.log(
            `🚫 Unauthorized access attempt from ${chatId} (Name: ${msg.chat?.first_name || "Unknown"} ${msg.chat?.last_name || ""}, Username: ${msg.chat?.username || "None"})`,
        );
        await sendSmartResponse(bot, chatId, 
            `🚫 Access denied. This is a private GPT system.\n\nYour Chat ID: ${chatId}\nAuthorized ID: 484389665\n\nIf this is your personal account, contact system admin.`,
            null, 'general'
        );
        return;
    }

    if (text === "/start") {
        const welcomeMessage = `🧠 **IMPERIUM VAULT SYSTEM - Ray Dalio AI Intelligence**

This is your personal OpenAI GPT-4o with institutional-level market data access and Bridgewater-style analysis.

**🎯 RAY DALIO'S PRINCIPLES INTEGRATED:**
• "Diversification is the only free lunch"
• "Don't fight the Fed" 
• "Cash is trash" (in inflationary environments)
• "Think like a machine" - systematic analysis
• Economic cycle and regime analysis

**🏦 CAMBODIA PRIVATE LENDING FUND:**
/deal_analyze [amount] [type] [location] [rate] [term] - AI deal analysis
/portfolio - Fund performance and status
/cambodia_market - Local market intelligence  
/risk_assessment - Portfolio risk analysis
/lp_report [monthly/quarterly] - Investor reports
/fund_help - Cambodia lending commands help

**📊 ENHANCED MARKET COMMANDS:**
/regime - Economic regime analysis (growth/inflation matrix)
/cycle - Market cycle positioning analysis  
/opportunities - AI-powered trading opportunities scanner
/risk - Portfolio risk assessment with hedging recommendations
/macro - Global macro outlook like Bridgewater
/correlations - Asset correlation breakdown analysis
/all_weather - Ray Dalio's portfolio allocation guidance

**💹 METATRADER COMMANDS:**
/trading - Your live trading account summary
/positions - Current open positions analysis
/size [SYMBOL] [BUY/SELL] - Position sizing calculator
/account - Account balance and performance metrics

**📊 ENHANCED MARKET DATA:**
/briefing - Complete daily market briefing with AI analysis
/economics - US economic indicators with Fed policy impact
/prices - Enhanced crypto + market data with correlations
/analysis - AI market analysis with predictions

**🧠 EXAMPLE USAGE:**
• /deal_analyze 500000 commercial "Chamkar Mon" 18 12
• "What's the lending environment in Cambodia right now?"
• "How should I allocate capital given current macro conditions?"
• "Analyze my portfolio risk with Ray Dalio principles"

**Chat ID:** ${chatId}
**Status:** ✅ RAY DALIO AI + CAMBODIA LENDING FUND ACTIVE`;

        await sendSmartResponse(bot, chatId, welcomeMessage, null, 'general');
        console.log("✅ Enhanced Ray Dalio system message sent");
        return;
    }

    // 🏦 ========== CAMBODIA LENDING FUND COMMANDS ==========

    // 🎯 DEAL ANALYSIS COMMAND
    if (text.startsWith('/deal_analyze ') || text === '/deal_analyze') {
        try {
            await bot.sendMessage(chatId, "🎯 Analyzing Cambodia lending deal...");
            
            if (text === '/deal_analyze') {
                const usageMessage = `📋 **Deal Analysis Usage:**

**Format:** /deal_analyze [amount] [type] [location] [rate] [term]

**Examples:**
• /deal_analyze 500000 commercial "Chamkar Mon" 18 12
• /deal_analyze 250000 bridge "Toul Kork" 22 6
• /deal_analyze 1000000 development "Daun Penh" 20 24

**Parameters:**
• Amount: USD (e.g., 500000)
• Type: commercial, residential, bridge, development
• Location: "Chamkar Mon", "Daun Penh", "Toul Kork", etc.
• Rate: Annual % (e.g., 18)
• Term: Months (e.g., 12)`;

                await sendSmartResponse(bot, chatId, usageMessage, null, 'cambodia');
                return;
            }
            
            // Parse parameters
            const params = text.replace('/deal_analyze ', '').split(' ');
            if (params.length < 5) {
                await sendSmartResponse(bot, chatId, "❌ Invalid format. Use: /deal_analyze [amount] [type] [location] [rate] [term]", null, 'general');
                return;
            }
            
            const dealParams = {
                amount: parseFloat(params[0]),
                collateralType: params[1],
                location: params[2].replace(/"/g, ''),
                interestRate: parseFloat(params[3]),
                term: parseInt(params[4]),
                borrowerType: 'LOCAL_DEVELOPER',
                purpose: 'Investment',
                loanToValue: 70,
                borrowerProfile: {
                    creditHistory: 'GOOD',
                    incomeStability: 'STABLE',
                    experience: 'EXPERIENCED'
                }
            };
            
            const analysis = await analyzeLendingDeal(dealParams);
            
            if (analysis.error) {
                await sendSmartResponse(bot, chatId, `❌ Analysis error: ${analysis.error}`, null, 'general');
                return;
            }
            
            let response = `🎯 **CAMBODIA DEAL ANALYSIS**\n\n`;
            response += `📊 **DEAL OVERVIEW:**\n`;
            response += `• Amount: $${analysis.dealSummary.amount.toLocaleString()} USD\n`;
            response += `• Rate: ${analysis.dealSummary.rate}% annually\n`;
            response += `• Term: ${analysis.dealSummary.term} months\n`;
            response += `• Monthly Payment: $${analysis.dealSummary.monthlyPayment.toFixed(0)}\n`;
            response += `• Total Return: $${analysis.dealSummary.totalReturn.toFixed(0)}\n\n`;
            
            response += `⚠️ **RISK ASSESSMENT:**\n`;
            response += `• Overall Risk Score: ${analysis.riskAssessment.overallScore}/100\n`;
            response += `• Risk Category: ${analysis.riskAssessment.riskCategory}\n`;
            response += `• Credit Risk: ${analysis.riskAssessment.creditRisk}/100\n`;
            response += `• Market Risk: ${analysis.riskAssessment.marketRisk}/100\n`;
            response += `• Liquidity Risk: ${analysis.riskAssessment.liquidityRisk}\n\n`;
            
            response += `🇰🇭 **CAMBODIA MARKET CONTEXT:**\n`;
            response += `• Current Conditions: ${analysis.marketContext.currentConditions}\n`;
            response += `• Market Timing: ${analysis.marketContext.marketTiming}\n`;
            response += `• Competitive Rate: ${analysis.marketContext.competitiveRate}%\n\n`;
            
            response += `🏛️ **RAY DALIO ANALYSIS:**\n`;
            response += `• Regime Alignment: ${analysis.rayDalioInsights.regimeAlignment}\n`;
            response += `• Diversification Impact: ${analysis.rayDalioInsights.diversificationImpact}\n`;
            response += `• Macro Factors: ${analysis.rayDalioInsights.macroFactors}\n\n`;
            
            response += `💰 **FINANCIAL METRICS:**\n`;
            response += `• Expected Return: ${analysis.metrics.expectedReturn}%\n`;
            response += `• Risk-Adjusted Return: ${analysis.metrics.riskAdjustedReturn.toFixed(2)}%\n`;
            response += `• Break-Even Default: ${analysis.metrics.breakEvenDefault.toFixed(1)}%\n\n`;
            
            const decisionEmoji = analysis.recommendation.decision === 'APPROVE' ? '✅' : 
                                 analysis.recommendation.decision === 'CONDITIONAL_APPROVE' ? '⚠️' : '❌';
            
            response += `${decisionEmoji} **RECOMMENDATION: ${analysis.recommendation.decision}**\n`;
            response += `• Confidence: ${analysis.recommendation.confidence}%\n`;
            response += `• Reason: ${analysis.recommendation.reasons[0]}\n\n`;
            
            if (analysis.recommendation.conditions && analysis.recommendation.conditions.length > 0) {
                response += `📋 **CONDITIONS:**\n`;
                analysis.recommendation.conditions.forEach(condition => {
                    response += `• ${condition}\n`;
                });
                response += `\n`;
            }
            
            response += `🎯 **Deal ID:** ${analysis.dealId}`;
            
            await sendSmartResponse(bot, chatId, response, "Cambodia Deal Analysis", 'cambodia');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Deal analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // 🏦 PORTFOLIO STATUS COMMAND
    if (text === '/portfolio' || text === '/fund_status') {
        try {
            await bot.sendMessage(chatId, "🏦 Generating portfolio status...");
            
            // Sample fund data - you would replace this with actual data
            const sampleFundData = {
                totalAUM: 2500000,
                deployedCapital: 2000000,
                availableCapital: 500000,
                activeDeals: 12,
                currentYield: 17.5
            };
            
            const portfolio = await getPortfolioStatus(sampleFundData);
            
            if (portfolio.error) {
                await sendSmartResponse(bot, chatId, `❌ Portfolio error: ${portfolio.error}`, null, 'general');
                return;
            }
            
            let response = `🏦 **CAMBODIA LENDING FUND STATUS**\n\n`;
            
            response += `💰 **FUND OVERVIEW:**\n`;
            response += `• Total AUM: $${portfolio.fundOverview.totalAUM.toLocaleString()}\n`;
            response += `• Deployed Capital: $${portfolio.fundOverview.deployedCapital.toLocaleString()}\n`;
            response += `• Available Capital: $${portfolio.fundOverview.availableCapital.toLocaleString()}\n`;
            response += `• Deployment Ratio: ${portfolio.fundOverview.deploymentRatio.toFixed(1)}%\n`;
            response += `• Active Deals: ${portfolio.fundOverview.numberOfDeals}\n`;
            response += `• Avg Deal Size: $${portfolio.fundOverview.averageDealSize.toLocaleString()}\n\n`;
            
            response += `📈 **PERFORMANCE METRICS:**\n`;
            response += `• Current Yield: ${portfolio.performance.currentYieldRate.toFixed(2)}%\n`;
            response += `• Target Yield: ${portfolio.performance.targetYieldRate}%\n`;
            response += `• vs Target: ${portfolio.performance.actualVsTarget > 0 ? '+' : ''}${portfolio.performance.actualVsTarget.toFixed(1)}%\n`;
            response += `• Risk-Adj Return: ${portfolio.performance.riskAdjustedReturn.toFixed(2)}%\n`;
            response += `• Monthly Income: $${portfolio.performance.monthlyIncome.toLocaleString()}\n`;
            response += `• Annualized Return: ${portfolio.performance.annualizedReturn.toFixed(2)}%\n\n`;
            
            response += `⚠️ **RISK METRICS:**\n`;
            response += `• Concentration Risk: ${portfolio.riskMetrics.concentrationRisk}\n`;
            response += `• Default Rate: ${portfolio.riskMetrics.defaultRate.toFixed(2)}%\n`;
            response += `• Portfolio VaR: ${portfolio.riskMetrics.portfolioVaR.toFixed(1)}%\n`;
            response += `• Diversification: ${portfolio.riskMetrics.diversificationScore}/100\n`;
            response += `• Liquidity: ${portfolio.riskMetrics.liquidity}\n\n`;
            
            response += `🗺️ **GEOGRAPHIC ALLOCATION:**\n`;
            response += `• Phnom Penh: ${portfolio.geographicAllocation.phnomPenh.toFixed(1)}%\n`;
            response += `• Sihanoukville: ${portfolio.geographicAllocation.sihanoukville.toFixed(1)}%\n`;
            response += `• Siem Reap: ${portfolio.geographicAllocation.siemReap.toFixed(1)}%\n`;
            response += `• Other: ${portfolio.geographicAllocation.other.toFixed(1)}%\n\n`;
            
            response += `🏗️ **SECTOR ALLOCATION:**\n`;
            response += `• Commercial: ${portfolio.sectorAllocation.commercial.toFixed(1)}%\n`;
            response += `• Residential: ${portfolio.sectorAllocation.residential.toFixed(1)}%\n`;
            response += `• Development: ${portfolio.sectorAllocation.development.toFixed(1)}%\n`;
            response += `• Bridge: ${portfolio.sectorAllocation.bridge.toFixed(1)}%\n\n`;
            
            response += `🏛️ **RAY DALIO ASSESSMENT:**\n`;
            response += `• Diversification Score: ${portfolio.rayDalioPortfolioAnalysis.diversificationScore}/100\n`;
            response += `• Risk Parity Alignment: ${portfolio.rayDalioPortfolioAnalysis.riskParityAlignment}\n`;
            response += `• Macro Alignment: ${portfolio.rayDalioPortfolioAnalysis.macroAlignment}\n`;
            response += `• Regime Positioning: ${portfolio.rayDalioPortfolioAnalysis.regimePositioning}\n\n`;
            
            if (portfolio.recommendations.length > 0) {
                response += `💡 **RECOMMENDATIONS:**\n`;
                portfolio.recommendations.slice(0, 3).forEach(rec => {
                    response += `• ${rec}\n`;
                });
                response += `\n`;
            }
            
            if (portfolio.alerts.length > 0) {
                response += `🚨 **ALERTS:**\n`;
                portfolio.alerts.slice(0, 2).forEach(alert => {
                    response += `• ${alert}\n`;
                });
            }
            
            await sendSmartResponse(bot, chatId, response, "Fund Portfolio Status", 'cambodia');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Portfolio status error: ${error.message}`, null, 'general');
        }
        return;
    }

    // 🇰🇭 CAMBODIA MARKET COMMAND
    if (text === '/cambodia_market' || text === '/market_cambodia') {
        try {
            await bot.sendMessage(chatId, "🇰🇭 Analyzing Cambodia market conditions...");
            
            const conditions = await getCambodiaMarketConditions();
            
            if (conditions.error) {
                await sendSmartResponse(bot, chatId, `❌ Market analysis error: ${conditions.error}`, null, 'general');
                return;
            }
            
            let response = `🇰🇭 **CAMBODIA MARKET INTELLIGENCE**\n\n`;
            
            response += `📊 **ECONOMIC ENVIRONMENT:**\n`;
            response += `• GDP Growth: ${conditions.economicEnvironment.gdpGrowth}%\n`;
            response += `• Inflation: ${conditions.economicEnvironment.inflation}%\n`;
            response += `• USD/KHR Stability: ${conditions.economicEnvironment.currencyStability}\n`;
            response += `• Political Stability: ${conditions.economicEnvironment.politicalStability}\n`;
            response += `• Regulatory Environment: ${conditions.economicEnvironment.regulatoryEnvironment}\n\n`;
            
            response += `💰 **INTEREST RATE ENVIRONMENT:**\n`;
            response += `• Commercial Loans: ${conditions.interestRateEnvironment.commercialRates.commercial.min}-${conditions.interestRateEnvironment.commercialRates.commercial.max}% (avg: ${conditions.interestRateEnvironment.commercialRates.commercial.average}%)\n`;
            response += `• Bridge Loans: ${conditions.interestRateEnvironment.commercialRates.bridge.min}-${conditions.interestRateEnvironment.commercialRates.bridge.max}% (avg: ${conditions.interestRateEnvironment.commercialRates.bridge.average}%)\n`;
            response += `• Development: ${conditions.interestRateEnvironment.commercialRates.development.min}-${conditions.interestRateEnvironment.commercialRates.development.max}% (avg: ${conditions.interestRateEnvironment.commercialRates.development.average}%)\n`;
            response += `• Trend: ${conditions.interestRateEnvironment.trendDirection}\n`;
            response += `• Fed Impact: ${conditions.interestRateEnvironment.fedImpact}\n\n`;
            
            response += `🏘️ **PROPERTY MARKET:**\n`;
            response += `• Phnom Penh Trend: ${conditions.propertyMarket.phnomPenhTrend}\n`;
            response += `• Demand/Supply: ${conditions.propertyMarket.demandSupplyBalance}\n`;
            response += `• Foreign Investment: ${conditions.propertyMarket.foreignInvestment}\n`;
            response += `• Development Activity: ${conditions.propertyMarket.developmentActivity}\n`;
            response += `• Price Appreciation: ${conditions.propertyMarket.priceAppreciation}\n`;
            response += `• Liquidity: ${conditions.propertyMarket.liquidity}\n\n`;
            
            response += `🏦 **BANKING SECTOR:**\n`;
            response += `• Liquidity: ${conditions.bankingSector.liquidityConditions}\n`;
            response += `• Credit Growth: ${conditions.bankingSector.creditGrowth}\n`;
            response += `• Competition: ${conditions.bankingSector.competitionLevel}\n`;
            response += `• Regulation: ${conditions.bankingSector.regulatoryChanges}\n\n`;
            
            response += `⚠️ **RISK FACTORS:**\n`;
            response += `• Political: ${conditions.riskFactors.politicalRisk}\n`;
            response += `• Economic: ${conditions.riskFactors.economicRisk}\n`;
            response += `• Currency: ${conditions.riskFactors.currencyRisk}\n`;
            response += `• Regulatory: ${conditions.riskFactors.regulatoryRisk}\n`;
            response += `• Market: ${conditions.riskFactors.marketRisk}\n\n`;
            
            response += `⏰ **MARKET TIMING:**\n`;
            response += `• Current Phase: ${conditions.marketTiming.currentPhase}\n`;
            response += `• Time in Cycle: ${conditions.marketTiming.timeInCycle}\n`;
            response += `• Next Phase: ${conditions.marketTiming.nextPhaseExpected}\n`;
            response += `• Lending Timing: ${conditions.marketTiming.timingForLending}\n\n`;
            
            response += `🎯 **TOP OPPORTUNITIES:**\n`;
            conditions.opportunities.slice(0, 3).forEach(opp => {
                response += `• ${opp}\n`;
            });
            response += `\n`;
            
            response += `📋 **MARKET SUMMARY:**\n${conditions.summary}`;
            
            await sendSmartResponse(bot, chatId, response, "Cambodia Market Intelligence", 'cambodia');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Cambodia market error: ${error.message}`, null, 'general');
        }
        return;
    }

    // 📊 RISK ASSESSMENT COMMAND
    if (text === '/risk_assessment' || text === '/portfolio_risk') {
        try {
            await bot.sendMessage(chatId, "📊 Performing comprehensive risk assessment...");
            
            // Sample portfolio data for assessment
            const samplePortfolioData = {
                totalValue: 2500000,
                numberOfDeals: 12,
                averageRate: 17.5,
                concentrationByLocation: { 'Phnom Penh': 0.7, 'Other': 0.3 },
                concentrationByType: { 'commercial': 0.5, 'bridge': 0.3, 'development': 0.2 }
            };
            
            const riskAssessment = await performRiskAssessment(samplePortfolioData);
            
            if (riskAssessment.error) {
                await sendSmartResponse(bot, chatId, `❌ Risk assessment error: ${riskAssessment.error}`, null, 'general');
                return;
            }
            
            let response = `📊 **PORTFOLIO RISK ASSESSMENT**\n\n`;
            
            response += `⚠️ **OVERALL RISK METRICS:**\n`;
            response += `• Overall Risk Score: ${riskAssessment.portfolioRisk.overallRiskScore}/100\n`;
            response += `• Concentration Risk: ${riskAssessment.portfolioRisk.concentrationRisk}\n`;
            response += `• Credit Risk: ${riskAssessment.portfolioRisk.creditRisk}\n`;
            response += `• Market Risk: ${riskAssessment.portfolioRisk.marketRisk}\n`;
            response += `• Liquidity Risk: ${riskAssessment.portfolioRisk.liquidityRisk}\n`;
            response += `• Operational Risk: ${riskAssessment.portfolioRisk.operationalRisk}\n`;
            response += `• Regulatory Risk: ${riskAssessment.portfolioRisk.regulatoryRisk}\n\n`;
            
            response += `🏛️ **RAY DALIO RISK ANALYSIS:**\n`;
            response += `• Diversification Effectiveness: ${riskAssessment.rayDalioRiskAnalysis.diversificationEffectiveness}\n`;
            response += `• Correlation Risks: ${riskAssessment.rayDalioRiskAnalysis.correlationRisks}\n`;
            response += `• Risk Parity Alignment: ${riskAssessment.rayDalioRiskAnalysis.riskParityAlignment}\n\n`;
            
            response += `🧪 **STRESS TEST RESULTS:**\n`;
            response += `• Economic Downturn: ${riskAssessment.stressTesting.economicDownturn}% loss\n`;
            response += `• Interest Rate Shock: ${riskAssessment.stressTesting.interestRateShock}% impact\n`;
            response += `• Default Scenarios: ${riskAssessment.stressTesting.defaultScenarios}% portfolio impact\n`;
            response += `• Liquidity Crisis: ${riskAssessment.stressTesting.liquidityCrisis}\n\n`;
            
            response += `🚨 **EARLY WARNING INDICATORS:**\n`;
            response += `• Macro Warnings: ${riskAssessment.earlyWarning.macroIndicators}\n`;
            response += `• Portfolio Warnings: ${riskAssessment.earlyWarning.portfolioIndicators}\n`;
            response += `• Market Warnings: ${riskAssessment.earlyWarning.marketIndicators}\n\n`;
            
            response += `📏 **RISK LIMITS:**\n`;
            response += `• Current Utilization: ${riskAssessment.riskLimits.currentUtilization}%\n`;
            response += `• Violations: ${riskAssessment.riskLimits.violations.length} detected\n\n`;
            
            if (riskAssessment.riskActionItems.length > 0) {
                response += `🎯 **ACTION ITEMS:**\n`;
                riskAssessment.riskActionItems.slice(0, 3).forEach(item => {
                    response += `• ${item}\n`;
                });
            }
            
            await sendSmartResponse(bot, chatId, response, "Portfolio Risk Assessment", 'cambodia');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Risk assessment error: ${error.message}`, null, 'general');
        }
        return;
    }

    // 💼 LP REPORT COMMAND
    if (text.startsWith('/lp_report') || text === '/investor_report') {
        try {
            await bot.sendMessage(chatId, "💼 Generating LP/Investor report...");
            
            const reportType = text.includes('monthly') ? 'monthly' : 
                              text.includes('quarterly') ? 'quarterly' : 'monthly';
            
            const report = await generateLPReport(reportType);
            
            if (report.error) {
                await sendSmartResponse(bot, chatId, `❌ Report generation error: ${report.error}`, null, 'general');
                return;
            }
            
            let response = `💼 **${report.reportType} LP REPORT**\n\n`;
            response += `📅 **Report Period:** ${report.reportPeriod}\n`;
            response += `🆔 **Report ID:** ${report.reportId}\n\n`;
            
            response += `📋 **EXECUTIVE SUMMARY:**\n`;
            response += `${report.executiveSummary.fundPerformance}\n\n`;
            
            response += `💰 **FINANCIAL PERFORMANCE:**\n`;
            response += `• Period Return: ${report.financialPerformance.returns.periodReturn.toFixed(2)}%\n`;
            response += `• Annualized Return: ${report.financialPerformance.returns.annualizedReturn.toFixed(2)}%\n`;
            response += `• Target vs Actual: ${report.financialPerformance.returns.targetVsActual > 0 ? '+' : ''}${report.financialPerformance.returns.targetVsActual.toFixed(1)}%\n`;
            response += `• Risk-Adjusted Return: ${report.financialPerformance.returns.riskAdjustedReturn.toFixed(2)}%\n\n`;
            
            response += `💵 **INCOME BREAKDOWN:**\n`;
            response += `• Interest Income: ${report.financialPerformance.income.interestIncome.toLocaleString()}\n`;
            response += `• Fees: ${report.financialPerformance.income.fees.toLocaleString()}\n`;
            response += `• Total Income: ${report.financialPerformance.income.totalIncome.toLocaleString()}\n\n`;
            
            response += `📊 **DEPLOYMENT METRICS:**\n`;
            response += `• Capital Deployed: ${report.financialPerformance.deploymentMetrics.capitalDeployed.toLocaleString()}\n`;
            response += `• Deployment Ratio: ${report.financialPerformance.deploymentMetrics.deploymentRatio.toFixed(1)}%\n`;
            response += `• Pipeline Value: ${report.financialPerformance.deploymentMetrics.pipelineDeal.toLocaleString()}\n\n`;
            
            response += `🗺️ **PORTFOLIO ALLOCATION:**\n`;
            response += `• Geographic Diversification: ${report.portfolioAnalytics.diversification.score}/100\n`;
            response += `• Number of Deals: ${report.portfolioAnalytics.dealMetrics.numberOfDeals}\n`;
            response += `• Average Deal Size: ${report.portfolioAnalytics.dealMetrics.averageDealSize.toLocaleString()}\n`;
            response += `• Average Rate: ${report.portfolioAnalytics.dealMetrics.averageRate.toFixed(2)}%\n\n`;
            
            response += `⚠️ **RISK SUMMARY:**\n`;
            response += `• Overall Risk: ${report.riskReporting.overallRisk}/100\n`;
            response += `• Stress Test: ${Object.keys(report.riskReporting.stressTestResults).length} scenarios tested\n\n`;
            
            response += `🇰🇭 **MARKET COMMENTARY:**\n`;
            response += `${report.marketCommentary.cambodiaMarket}\n\n`;
            
            response += `🔮 **FORWARD OUTLOOK:**\n`;
            response += `• Pipeline: ${report.forwardLooking.pipeline}\n`;
            response += `• Strategy: ${report.forwardLooking.strategy}\n\n`;
            
            response += `📎 **Full Report:** ${report.reportId}\n`;
            response += `📊 **Dashboard:** Available on request`;
            
            await sendSmartResponse(bot, chatId, response, "LP Investor Report", 'cambodia');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ LP report error: ${error.message}`, null, 'general');
        }
        return;
    }

    // 🎯 FUND COMMANDS HELP
    if (text === '/fund_help' || text === '/lending_help') {
        const helpMessage = `🏦 **CAMBODIA LENDING FUND COMMANDS**

🎯 **DEAL ANALYSIS:**
/deal_analyze [amount] [type] [location] [rate] [term]
Example: /deal_analyze 500000 commercial "Chamkar Mon" 18 12

🏦 **PORTFOLIO MANAGEMENT:**
/portfolio - Current fund status and performance
/fund_status - Detailed portfolio metrics

🇰🇭 **MARKET INTELLIGENCE:**
/cambodia_market - Cambodia market conditions
/market_cambodia - Local economic analysis

📊 **RISK MANAGEMENT:**
/risk_assessment - Comprehensive risk analysis
/portfolio_risk - Portfolio-level risk metrics

💼 **INVESTOR RELATIONS:**
/lp_report monthly - Generate monthly LP report
/lp_report quarterly - Generate quarterly report
/investor_report - Standard investor update

🎯 **QUICK ANALYSIS:**
Ask questions like:
- "Analyze this deal: $300K bridge loan in Toul Kork at 20% for 8 months"
- "What's the current lending environment in Cambodia?"
- "How should I position my portfolio given current macro conditions?"
- "Generate risk assessment for my current deal pipeline"

💡 **Pro Tips:**
- Use location names in quotes: "Chamkar Mon"
- Amounts in USD without commas: 500000
- Rates as percentages: 18 (for 18%)
- Terms in months: 12

🏛️ **Enhanced with Ray Dalio AI for institutional-grade analysis!**`;

        await sendSmartResponse(bot, chatId, helpMessage, "Cambodia Fund Help", 'cambodia');
        return;
    }

    // 📚 VIEW TRAINING DOCUMENTS COMMAND - ADD THIS RIGHT HERE:
    if (text === '/documents' || text === '/training_docs' || text === '/files') {
        try {
            const { getTrainingDocumentsDB } = require('./utils/database');
            const docs = await getTrainingDocumentsDB(chatId);
            
            if (docs.length === 0) {
                await sendSmartResponse(bot, chatId, 
                    `📚 **No Training Documents Found**\n\n` +
                    `💡 **How to Add Documents:**\n` +
                    `• Upload any file (.txt, .pdf, .docx)\n` +
                    `• Add caption: "train" or "database"\n` +
                    `• AI will save it for future reference\n\n` +
                    `🎯 **Supported Types:** Text, PDF, Word, Markdown`,
                    "Training Documents", 'general'
                );
                return;
            }
            
            let response = `📚 **Your AI Training Documents (${docs.length}):**\n\n`;
            docs.forEach((doc, i) => {
                const uploadDate = new Date(doc.upload_date).toLocaleDateString();
                const fileType = doc.file_name.split('.').pop()?.toUpperCase() || 'Unknown';
                
                response += `**${i + 1}. ${doc.file_name}**\n`;
                response += `• 📊 Words: **${doc.word_count?.toLocaleString() || 'Unknown'}**\n`;
                response += `• 📅 Added: ${uploadDate}\n`;
                response += `• 🎯 Type: ${fileType}\n`;
                if (doc.summary) {
                    response += `• 📝 Preview: ${doc.summary.substring(0, 100)}...\n`;
                }
                response += `\n`;
            });
            
            response += `💡 **Usage:** Your AI can now answer questions about these documents!`;
            
            await sendSmartResponse(bot, chatId, response, "AI Training Documents", 'general');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Error retrieving documents: ${error.message}`, null, 'general');
        }
        return;
    }

    // 🏛️ ========== RAY DALIO ENHANCED COMMANDS ==========

    // Economic Regime Analysis - Core Ray Dalio concept
    if (text === '/regime' || text === '/economic_regime') {
        try {
            await bot.sendMessage(chatId, "🏛️ Analyzing current economic regime like Ray Dalio...");
            
            const marketData = await getComprehensiveMarketData();
            
            const regimePrompt = `You are Ray Dalio analyzing the current economic regime. Based on this comprehensive data, provide institutional-quality analysis:

CURRENT MARKET DATA:
- Fed Funds Rate: ${marketData.markets.economics?.fedRate?.value}%
- Inflation (CPI): ${marketData.markets.economics?.inflation?.value}%  
- Unemployment: ${marketData.markets.economics?.unemployment?.value}%
- 10Y Treasury Yield: ${marketData.yields.yield10Y}%
- 2Y Treasury Yield: ${marketData.yields.yield2Y}%
- Yield Curve (2s10s): ${marketData.yields.curve}%
- VIX Fear Index: ${marketData.fear}
- US Dollar Index: ${marketData.dollar}
- S&P 500: ${marketData.markets.stocks?.sp500?.['05. price']}
- Bitcoin: ${marketData.markets.crypto?.bitcoin?.usd}
- Gold: ${marketData.commodities.gold}

REGIME ANALYSIS FRAMEWORK:
1. Economic Growth Environment (Accelerating/Decelerating)
2. Inflation Environment (Rising/Falling)  
3. Policy Environment (Accommodative/Restrictive)
4. Market Regime (Risk-On/Risk-Off)

Provide Ray Dalio-style analysis:
1. What economic regime are we in? (Growth ↑↓ / Inflation ↑↓ matrix)
2. Where are we in the business cycle?
3. What are the dominant market forces driving asset prices?
4. How should asset allocation adapt to this regime?
5. What are the key risks and opportunities?
6. What regime changes should we watch for?

Structure like Bridgewater's Daily Observations with specific actionable insights.`;

            const analysis = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system", 
                        content: "You are Ray Dalio providing institutional-quality economic regime analysis. Use his principles and framework. Be specific and actionable."
                    },
                    { role: "user", content: regimePrompt }
                ],
                max_tokens: 3000,
                temperature: 0.7
            });

            const responseContent = analysis.choices[0].message.content;
            await sendSmartResponse(bot, chatId, responseContent, "Economic Regime Analysis", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Regime analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Market Cycle Analysis
    if (text === '/cycle' || text === '/market_cycle') {
        try {
            await bot.sendMessage(chatId, "🔄 Analyzing market cycles like Bridgewater Associates...");
            
            const marketData = await getComprehensiveMarketData();
            
            const cyclePrompt = `You are a Bridgewater Associates analyst performing comprehensive market cycle analysis:

CURRENT INDICATORS:
- Fed Funds Rate: ${marketData.markets.economics?.fedRate?.value}% 
- Yield Curve: ${marketData.yields.curve}% (2s10s spread)
- VIX: ${marketData.fear}
- Dollar Strength: ${marketData.dollar}
- Credit Spreads: Monitor for stress
- Unemployment: ${marketData.markets.economics?.unemployment?.value}%

ANALYZE THESE CYCLES:
1. **Business Cycle** (Early/Mid/Late Expansion or Early/Mid/Late Contraction)
2. **Credit Cycle** (Expansion/Peak/Contraction/Trough)  
3. **Market Cycle** (Accumulation/Markup/Distribution/Decline)
4. **Sentiment Cycle** (Euphoria/Optimism/Pessimism/Panic)
5. **Policy Cycle** (Accommodative/Neutral/Restrictive)

For each cycle provide:
- Current position assessment
- Key indicators to watch
- Expected duration until next phase
- Trading/investment implications
- Risk factors

Conclude with specific asset class recommendations based on cycle positioning.`;

            const cycleAnalysis = await openai.chat.completions.create({
                model: "gpt-4o", 
                messages: [
                    { role: "system", content: "You are a Bridgewater Associates cycle analyst providing institutional-quality market cycle analysis." },
                    { role: "user", content: cyclePrompt }
                ],
                max_tokens: 2500
            });

            await sendSmartResponse(bot, chatId, cycleAnalysis.choices[0].message.content, "Market Cycle Analysis", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Cycle analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Market Opportunities Scanner - Enhanced AI Analysis
    if (text === '/opportunities' || text === '/scan') {
        try {
            await bot.sendMessage(chatId, "🎯 Scanning for trading opportunities with institutional-grade analysis...");
            
            const marketData = await getComprehensiveMarketData();
            
            const opportunityPrompt = `You are Ray Dalio's AI system identifying TOP trading opportunities based on comprehensive market analysis:

CURRENT MARKET STATE:
- Economic Regime: Fed Rate ${marketData.markets.economics?.fedRate?.value}%, Inflation ${marketData.markets.economics?.inflation?.value}%
- Market Sentiment: VIX ${marketData.fear}, Dollar Index ${marketData.dollar}
- Yield Environment: 10Y ${marketData.yields.yield10Y}%, Curve ${marketData.yields.curve}%
- Asset Prices: S&P ${marketData.markets.stocks?.sp500?.['05. price']}, BTC ${marketData.markets.crypto?.bitcoin?.usd}, Gold ${marketData.commodities.gold}

TRADING ACCOUNT STATUS:
${marketData.trading ? `Balance: ${marketData.trading.account?.balance} ${marketData.trading.account?.currency}, Open Positions: ${marketData.trading.openPositions?.length || 0}` : 'No trading data available'}

Identify TOP 3 OPPORTUNITIES with:

1. **OPPORTUNITY 1:**
   - Asset/Market: [Specific instrument]
   - Direction: [Long/Short with conviction level 1-10]
   - Entry Strategy: [Specific levels and timing]
   - Risk Management: [Stop loss, position sizing]
   - Time Horizon: [Days/weeks/months]
   - Rationale: [Why this works in current regime]
   - Risk/Reward: [Specific ratio]

2. **OPPORTUNITY 2:** [Same format]

3. **OPPORTUNITY 3:** [Same format]

Focus on opportunities suitable for Cambodia timezone (US evening = Cambodia morning).
Consider correlation with existing positions if any.
Apply Ray Dalio's diversification and risk management principles.`;

            const opportunities = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Ray Dalio's AI identifying high-conviction trading opportunities with institutional risk management." },
                    { role: "user", content: opportunityPrompt }
                ],
                max_tokens: 2500
            });

            await sendSmartResponse(bot, chatId, opportunities.choices[0].message.content, "Market Opportunities", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Opportunities scan error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Risk Analysis Command - Enhanced
    if (text === '/risk' || text === '/portfolio_risk') {
        try {
            const marketData = await getComprehensiveMarketData();
            
            const riskPrompt = `You are Bridgewater's Chief Risk Officer analyzing portfolio risk and market conditions:

MARKET RISK INDICATORS:
- VIX (Fear Index): ${marketData.fear}
- Dollar Strength: ${marketData.dollar} 
- Yield Curve: ${marketData.yields.curve}% (inverted if negative)
- Treasury Yields: 10Y ${marketData.yields.yield10Y}%, 2Y ${marketData.yields.yield2Y}%
- Crypto Volatility: Bitcoin 24h ${marketData.markets.crypto?.bitcoin?.usd_24h_change}%

CURRENT POSITIONS:
${marketData.trading?.openPositions?.length > 0 ? 
    marketData.trading.openPositions.map(pos => 
        `${pos.symbol} ${pos.type} ${pos.volume} lots (P&L: ${pos.profit})`
    ).join('\n') : 'No open positions'}

ACCOUNT METRICS:
${marketData.trading ? `Balance: ${marketData.trading.account?.balance} ${marketData.trading.account?.currency}, Equity: ${marketData.trading.account?.equity}` : 'No account data'}

Provide comprehensive risk analysis:

1. **OVERALL PORTFOLIO RISK LEVEL** (1-10 scale)
2. **KEY RISK FACTORS:**
   - Market risk (volatility, correlations)
   - Credit risk (spread widening)
   - Liquidity risk (market stress scenarios)
   - Currency risk (dollar movements)
   - Geopolitical risk (current tensions)

3. **TAIL RISKS** (low probability, high impact events)
4. **CORRELATION RISKS** (when diversification fails)
5. **HEDGE RECOMMENDATIONS** (specific instruments and sizes)
6. **POSITION SIZING GUIDANCE** (per Ray Dalio's principles)
7. **EARLY WARNING INDICATORS** (what to watch)

Be specific and actionable with exact recommendations.`;

            const riskAnalysis = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Bridgewater's Chief Risk Officer providing institutional-quality risk analysis with specific actionable recommendations." },
                    { role: "user", content: riskPrompt }
                ],
                max_tokens: 2000
            });

            await sendSmartResponse(bot, chatId, riskAnalysis.choices[0].message.content, "Risk Analysis", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Risk analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Position Sizing Calculator - New Feature
    if (text.startsWith('/size ')) {
        try {
            const params = text.split(' ');
            if (params.length < 3) {
                await sendSmartResponse(bot, chatId, "Usage: /size SYMBOL DIRECTION\nExample: /size EURUSD buy", null, 'general');
                return;
            }
            
            const symbol = params[1].toUpperCase();
            const direction = params[2].toLowerCase();
            
            const tradingData = await getTradingSummary();
            const marketData = await getComprehensiveMarketData();
            
            const sizingPrompt = `You are Ray Dalio's risk manager calculating optimal position size:

ACCOUNT INFO:
- Balance: ${tradingData?.account?.balance || 'N/A'} ${tradingData?.account?.currency || ''}
- Equity: ${tradingData?.account?.equity || 'N/A'} ${tradingData?.account?.currency || ''}
- Free Margin: ${tradingData?.account?.freeMargin || 'N/A'} ${tradingData?.account?.currency || ''}

TRADE REQUEST:
- Symbol: ${symbol}
- Direction: ${direction}

MARKET CONDITIONS:
- VIX (Volatility): ${marketData.fear}
- Market Regime: Current economic environment

APPLY RAY DALIO'S RISK MANAGEMENT:
1. Never risk more than 1-2% of account per trade
2. Adjust for market volatility (higher VIX = smaller size)
3. Consider correlation with existing positions
4. Account for regime uncertainty

Provide:
- **Recommended Position Size** (exact lots/units)
- **Risk Amount** (dollar amount at risk)
- **Stop Loss Level** (specific price)
- **Take Profit Targets** (multiple levels)
- **Risk/Reward Ratio**
- **Volatility Adjustment Factor**

Give me exact numbers to execute this trade safely.`;

            const sizing = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Ray Dalio's risk manager providing precise position sizing with exact execution parameters." },
                    { role: "user", content: sizingPrompt }
                ],
                max_tokens: 1000
            });

            await sendSmartResponse(bot, chatId, sizing.choices[0].message.content, `Position Sizing for ${symbol} ${direction.toUpperCase()}`, 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Position sizing error: ${error.message}`, null, 'general');
        }
        return;
    }

    // All Weather Portfolio Command - Ray Dalio's signature strategy
    if (text === '/all_weather' || text === '/portfolio') {
        try {
            const marketData = await getComprehensiveMarketData();
            
            const portfolioPrompt = `You are Ray Dalio providing "All Weather" portfolio recommendations based on current market conditions:

CURRENT ENVIRONMENT ANALYSIS:
- Economic Growth: ${marketData.markets.economics?.unemployment?.value}% unemployment, economic indicators
- Inflation: ${marketData.markets.economics?.inflation?.value}% CPI
- Interest Rates: Fed ${marketData.markets.economics?.fedRate?.value}%, 10Y Treasury ${marketData.yields.yield10Y}%
- Market Stress: VIX ${marketData.fear}
- Currency: Dollar Index ${marketData.dollar}
- Risk Assets: S&P 500 ${marketData.markets.stocks?.sp500?.['05. price']}, Bitcoin ${marketData.markets.crypto?.bitcoin?.usd}

PROVIDE "ALL WEATHER" ALLOCATION:

1. **TRADITIONAL ALL WEATHER** (Dalio's original):
   - 30% Stocks (which regions/sectors)
   - 40% Long-term Bonds (duration/type)  
   - 15% Intermediate Bonds
   - 7.5% Commodities (specific ones)
   - 7.5% TIPS/Inflation protection

2. **MODERN ALL WEATHER** (adapted for 2025):
   - Include crypto allocation
   - International diversification
   - Factor tilts based on current regime

3. **CURRENT REGIME ADJUSTMENTS**:
   - What to overweight/underweight now
   - Specific ETFs/instruments to use
   - Hedge positions for current risks

4. **REBALANCING TRIGGERS**:
   - When to adjust allocations
   - Key indicators to monitor

5. **EXPECTED RETURNS** by asset class in current environment

Make it actionable for someone in Cambodia with global market access.`;

            const allWeather = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Ray Dalio providing specific All Weather portfolio guidance adapted to current market conditions." },
                    { role: "user", content: portfolioPrompt }
                ],
                max_tokens: 2500
            });

            await sendSmartResponse(bot, chatId, allWeather.choices[0].message.content, "All Weather Portfolio", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ All Weather analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Correlations Analysis - Key for diversification
    if (text === '/correlations' || text === '/corr') {
        try {
            const marketData = await getComprehensiveMarketData();
            
            const correlationPrompt = `You are analyzing asset correlations like Bridgewater Associates for optimal diversification:

CURRENT MARKET DATA:
- S&P 500: ${marketData.markets.stocks?.sp500?.['05. price']}
- Bitcoin: ${marketData.markets.crypto?.bitcoin?.usd} (24h: ${marketData.markets.crypto?.bitcoin?.usd_24h_change}%)
- Gold: ${marketData.commodities.gold}
- 10Y Treasury Yield: ${marketData.yields.yield10Y}%
- Dollar Index: ${marketData.dollar}
- VIX: ${marketData.fear}

CORRELATION ANALYSIS:
1. **TRADITIONAL CORRELATIONS BREAKING DOWN:**
   - Which asset relationships are changing?
   - Stock-bond correlation shifts
   - Risk-on/risk-off dynamics

2. **CURRENT CORRELATION REGIME:**
   - How correlated are major assets right now?
   - What's driving correlation changes?
   - Flight-to-quality still working?

3. **DIVERSIFICATION EFFECTIVENESS:**
   - Where can we find true diversification?
   - Which assets are still uncorrelated?
   - Hidden correlation risks in portfolios

4. **HEDGE RELATIONSHIPS:**
   - What hedging relationships are working/failing?
   - Currency hedges effectiveness
   - Volatility hedges performance

5. **PORTFOLIO CONSTRUCTION IMPLICATIONS:**
   - How should correlation changes affect allocation?
   - Position sizing adjustments needed
   - New diversification opportunities

Focus on actionable insights for portfolio construction in current environment.`;

            const correlations = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a Bridgewater quant analyzing asset correlations for optimal portfolio construction." },
                    { role: "user", content: correlationPrompt }
                ],
                max_tokens: 2000
            });

            await sendSmartResponse(bot, chatId, correlations.choices[0].message.content, "Correlation Analysis", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Correlation analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Enhanced macro analysis
    if (text === '/macro' || text === '/outlook') {
        try {
            const marketData = await getComprehensiveMarketData();
            
            const macroPrompt = `You are Ray Dalio providing comprehensive macro economic outlook:

MACRO INDICATORS:
- Fed Funds Rate: ${marketData.markets.economics?.fedRate?.value}%
- Inflation: ${marketData.markets.economics?.inflation?.value}%
- Unemployment: ${marketData.markets.economics?.unemployment?.value}%
- Yield Curve: ${marketData.yields.curve}% (2s10s spread)
- Dollar Index: ${marketData.dollar}
- VIX: ${marketData.fear}

RECENT NEWS CONTEXT:
${marketData.markets.news?.financial?.slice(0, 2).map(article => `- ${article.title}`).join('\n')}

PROVIDE BRIDGEWATER-STYLE MACRO ANALYSIS:

1. **ECONOMIC REGIME ASSESSMENT:**
   - Growth trajectory (accelerating/decelerating)
   - Inflation dynamics (transitory/persistent)
   - Policy response (Fed's next moves)

2. **GLOBAL CONTEXT:**
   - US vs other major economies
   - Trade and capital flows
   - Geopolitical influences

3. **MARKET IMPLICATIONS:**
   - How macro environment affects asset classes
   - Sector rotation opportunities
   - Currency implications

4. **SCENARIO ANALYSIS:**
   - Base case (70% probability)
   - Upside scenario (15% probability)  
   - Downside scenario (15% probability)

5. **INVESTMENT STRATEGY:**
   - Asset allocation recommendations
   - Specific positioning advice
   - Risk management priorities

6. **KEY CATALYSTS TO WATCH:**
   - Economic data releases
   - Policy decisions
   - Market technicals

Think like Ray Dalio analyzing for Bridgewater's Daily Observations.`;

            const macroAnalysis = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Ray Dalio providing institutional-quality macro economic analysis like Bridgewater's Daily Observations." },
                    { role: "user", content: macroPrompt }
                ],
                max_tokens: 3000
            });

            await sendSmartResponse(bot, chatId, macroAnalysis.choices[0].message.content, "Macro Outlook", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Macro analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Enhanced help command with new features
    if (text === "/help" || text === "/commands") {
        const helpMessage = `🤖 **IMPERIUM GPT - RAY DALIO AI + CAMBODIA LENDING FUND**

**🏦 CAMBODIA LENDING FUND COMMANDS:**
/deal_analyze [amount] [type] [location] [rate] [term] - AI deal analysis
/portfolio - Current fund status and performance  
/cambodia_market - Local market intelligence
/risk_assessment - Portfolio risk analysis
/lp_report [monthly/quarterly] - Investor reports
/fund_help - Detailed lending commands help

**🏛️ RAY DALIO'S INSTITUTIONAL ANALYSIS:**
/regime - Economic regime analysis (Growth/Inflation matrix)
/cycle - Market cycle positioning (Business/Credit/Sentiment cycles) 
/opportunities - AI-powered trading opportunities scanner
/risk - Comprehensive portfolio risk assessment
/macro - Global macro outlook like Bridgewater Associates
/correlations - Asset correlation breakdown analysis
/all_weather - Ray Dalio's All Weather portfolio guidance
/size [SYMBOL] [BUY/SELL] - Position sizing calculator

**📊 ENHANCED MARKET INTELLIGENCE:**
/briefing - Complete daily market briefing with AI analysis
/economics - US economic data with Fed policy implications
/news - Latest financial news with market impact analysis  
/prices - Enhanced crypto + market data with correlations
/analysis - AI market analysis with institutional insights

**💹 METATRADER INTEGRATION:**
/trading - Live trading account summary with performance
/positions - Current open positions with P&L analysis
/account - Account balance, equity, and risk metrics
/orders - Pending orders with risk/reward analysis
/test_metaapi - MetaAPI connection diagnostics

**🎯 EXAMPLE QUERIES:**
• /deal_analyze 500000 commercial "Chamkar Mon" 18 12
• "What's the current lending environment in Cambodia?"
• "Based on current Fed policy and market regime, what's your Bitcoin outlook?"
• "How should I position for the next economic cycle phase?"
• "What are the correlation risks in my current portfolio?"

**🚀 POWERED BY:**
GPT-4o + Ray Dalio's Principles + Cambodia Market Intelligence + Live Trading Data + Real-time Market Data

Your system now rivals institutional hedge fund capabilities! 🌟`;

        await sendSmartResponse(bot, chatId, helpMessage, "System Commands", 'general');
        return;
    }

    // Debug command to get chat ID
    if (text === "/myid") {
        await sendSmartResponse(bot, chatId, `Your Chat ID: ${chatId}`, null, 'general');
        return;
    }

    // 💹 ========== EXISTING METATRADER COMMANDS ==========
    
    if (text === '/test_metaapi' || text === '/debug_metaapi') {
        try {
            await bot.sendMessage(chatId, "🔍 Testing MetaAPI connection step by step...");
            
            const hasToken = !!process.env.METAAPI_TOKEN;
            const hasAccountId = !!process.env.METAAPI_ACCOUNT_ID;
            
            let debugMsg = `🔧 **METAAPI DEBUG REPORT**\n\n`;
            debugMsg += `**Step 1 - Credentials:**\n`;
            debugMsg += `• Token: ${hasToken ? '✅ SET' : '❌ MISSING'}\n`;
            debugMsg += `• Account ID: ${hasAccountId ? '✅ SET' : '❌ MISSING'}\n`;
            
            if (hasToken && hasAccountId) {
                debugMsg += `• Account ID: ${process.env.METAAPI_ACCOUNT_ID}\n`;
                debugMsg += `• Token Length: ${process.env.METAAPI_TOKEN.length} chars\n\n`;
                
                debugMsg += `**Step 2 - Connection Test:**\n`;
                await bot.sendMessage(chatId, debugMsg + "⏳ Testing connection...");
                
                const testResult = await testConnection();
                
                if (testResult.success) {
                    debugMsg += `• Connection: ✅ SUCCESS\n`;
                    debugMsg += `• Account Info: ${testResult.accountInfo ? '✅ AVAILABLE' : '❌ UNAVAILABLE'}\n`;
                    
                    if (testResult.accountInfo) {
                        const acc = testResult.accountInfo;
                        debugMsg += `• Balance: ${acc.balance} ${acc.currency}\n`;
                        debugMsg += `• Broker: ${acc.company}\n`;
                        debugMsg += `• Server: ${acc.server}\n`;
                    }
                } else {
                    debugMsg += `• Connection: ❌ FAILED\n`;
                    debugMsg += `• Error: ${testResult.error}\n`;
                }
                
                const connectionStatus = await getConnectionStatus();
                debugMsg += `\n**Step 3 - Status:**\n`;
                debugMsg += `• MetaAPI: ${connectionStatus.metaApiInitialized ? '✅' : '❌'}\n`;
                debugMsg += `• Connected: ${connectionStatus.connected ? '✅' : '❌'}\n`;
                debugMsg += `• Synchronized: ${connectionStatus.synchronized ? '✅' : '❌'}\n`;
            } else {
                debugMsg += `\n❌ **Missing Credentials**\nAdd to Railway environment variables\n`;
            }
            
            debugMsg += `\n🕐 **Test Time:** ${new Date().toLocaleString()}`;
            await sendSmartResponse(bot, chatId, debugMsg, "MetaAPI Debug Report", 'general');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Debug test failed: ${error.message}`, null, 'general');
        }
        return;
    }

    if (text === "/trading" || text === "/mt5" || text === "/account") {
        try {
            await bot.sendMessage(chatId, "📊 Fetching your MetaTrader account data...");
            
            const tradingData = await getTradingSummary();
            if (tradingData && !tradingData.error) {
                const formattedData = formatTradingDataForGPT(tradingData);
                await sendSmartResponse(bot, chatId, formattedData, "Trading Account Summary", 'general');
            } else {
                await sendSmartResponse(bot, chatId, "❌ MetaTrader connection error. Check your MetaAPI credentials or use /test_metaapi for diagnostics.", null, 'general');
            }
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ MetaTrader error: ${error.message}`, null, 'general');
        }
        return;
    }

    if (text === "/positions") {
        try {
            const positions = await getOpenPositions();
            if (positions && positions.length > 0) {
                let msg = `📊 **OPEN POSITIONS (${positions.length}):**\n\n`;
                positions.forEach((pos, i) => {
                    const profitEmoji = pos.profit > 0 ? '🟢' : pos.profit < 0 ? '🔴' : '⚪';
                    msg += `${i + 1}. ${profitEmoji} **${pos.symbol}** ${pos.type}\n`;
                    msg += `   Volume: ${pos.volume} lots\n`;
                    msg += `   Open: ${pos.openPrice} | Current P&L: ${pos.profit?.toFixed(2)}\n`;
                    msg += `   Time: ${new Date(pos.openTime).toLocaleString()}\n\n`;
                });
                await sendSmartResponse(bot, chatId, msg, "Open Positions", 'general');
            } else {
                await sendSmartResponse(bot, chatId, "📊 No open positions found or MetaAPI not connected.", null, 'general');
            }
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Positions error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Enhanced market briefing
    if (text === "/briefing" || text === "/daily" || text === "/brief") {
        try {
            await bot.sendMessage(chatId, "📊 Generating Ray Dalio-style market briefing...");
            
            const marketData = await getComprehensiveMarketData();
            
            let briefing = `🎯 **IMPERIUM VAULT - RAY DALIO MARKET BRIEFING**\n\n`;
            briefing += `📅 **${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**\n`;
            briefing += `🕐 **${new Date().toLocaleTimeString()}**\n\n`;
            
            // Economic Regime Assessment
            briefing += `🏛️ **ECONOMIC REGIME:**\n`;
            if (marketData.markets.economics?.fedRate && marketData.markets.economics?.inflation) {
                const fedRate = marketData.markets.economics.fedRate.value;
                const inflation = marketData.markets.economics.inflation.value;
                const realRate = fedRate - inflation;
                
                briefing += `• Fed Funds: ${fedRate}% | Inflation: ${inflation}% | Real Rate: ${realRate.toFixed(2)}%\n`;
                briefing += `• Regime: ${fedRate > inflation ? 'RESTRICTIVE' : 'ACCOMMODATIVE'} Policy\n`;
                briefing += `• Yield Curve: ${marketData.yields.curve > 0 ? 'NORMAL' : 'INVERTED'} (${marketData.yields.curve?.toFixed(2)}%)\n\n`;
            }
            
            // Market Stress Indicators
            briefing += `⚠️ **MARKET STRESS INDICATORS:**\n`;
            briefing += `• VIX Fear Index: ${marketData.fear} ${marketData.fear > 20 ? '(ELEVATED)' : '(LOW)'}\n`;
            briefing += `• Dollar Strength: ${marketData.dollar}\n`;
            briefing += `• Risk Sentiment: ${marketData.fear < 20 ? 'RISK-ON' : marketData.fear > 30 ? 'RISK-OFF' : 'NEUTRAL'}\n\n`;
            
            // Asset Performance
            briefing += `📈 **ASSET PERFORMANCE:**\n`;
            if (marketData.markets.stocks?.sp500) {
                briefing += `• S&P 500: ${parseFloat(marketData.markets.stocks.sp500['05. price']).toFixed(2)}\n`;
            }
            if (marketData.markets.crypto?.bitcoin) {
                const btc = marketData.markets.crypto.bitcoin;
                const changeEmoji = btc.usd_24h_change > 0 ? '🟢' : '🔴';
                briefing += `• Bitcoin: ${btc.usd?.toLocaleString()} ${changeEmoji} ${btc.usd_24h_change?.toFixed(2)}%\n`;
            }
            briefing += `• Gold: ${marketData.commodities.gold}\n`;
            briefing += `• 10Y Treasury: ${marketData.yields.yield10Y}%\n\n`;
            
            // Trading Account Status
            if (marketData.trading && !marketData.trading.error) {
                briefing += `💰 **YOUR TRADING ACCOUNT:**\n`;
                briefing += `• Balance: ${marketData.trading.account?.balance?.toFixed(2)} ${marketData.trading.account?.currency}\n`;
                briefing += `• Open Positions: ${marketData.trading.openPositions?.length || 0}\n`;
                if (marketData.trading.performance?.currentPnL) {
                    const pnlEmoji = marketData.trading.performance.currentPnL > 0 ? '🟢' : '🔴';
                    briefing += `• Current P&L: ${pnlEmoji} ${marketData.trading.performance.currentPnL.toFixed(2)}\n`;
                }
                briefing += `\n`;
            }
            
            briefing += `🤖 **Ray Dalio AI Analysis Ready**\n`;
            briefing += `💡 Ask: "What's your take on these conditions?" or "/opportunities"`;
            
            await sendSmartResponse(bot, chatId, briefing, "Daily Market Briefing", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Briefing error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Handle text messages with enhanced GPT conversation
    if (text) {
        await handleGPTConversation(chatId, text);
    }

    // Handle other message types (voice, images, documents, videos)
    if (msg.voice) {
        console.log("🎤 Voice message received");
        const transcribedText = await processVoiceMessage(bot, msg.voice.file_id, chatId);
        if (transcribedText) {
            await sendSmartResponse(bot, chatId, `🎤 Voice transcribed: "${transcribedText}"`, null, 'general');
            await handleGPTConversation(chatId, transcribedText);
        }
        return;
    }

    if (msg.photo) {
        console.log("🖼️ Image received");
        const photoAnalysis = await processImageMessage(bot, msg.photo[msg.photo.length - 1].file_id, chatId, msg.caption);
        if (photoAnalysis) {
            await sendSmartResponse(bot, chatId, `🖼️ Image Analysis:\n\n${photoAnalysis}`, "Image Analysis", 'general');
        }
        return;
    }

    if (msg.document) {
        console.log("📄 Document received:", msg.document.file_name);
        const fileName = msg.document.file_name || "document";
        
        // Check for training keywords
        const isTrainingDoc = msg.caption?.toLowerCase().includes("train") ||
                             msg.caption?.toLowerCase().includes("database") ||
                             msg.caption?.toLowerCase().includes("remember");

        if (isTrainingDoc) {
            try {
                await bot.sendMessage(chatId, "📚 Processing document for database training...");
                
                const fileId = msg.document.file_id;
                const fileLink = await bot.getFileLink(fileId);
                const response = await fetch(fileLink);
                const buffer = await response.buffer();
                
                // Extract content based on file type
                let content = '';
                try {
                    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
                        content = buffer.toString('utf8');
                    } else if (fileName.endsWith('.pdf')) {
                        // Try to extract PDF text (requires pdf-parse: npm install pdf-parse)
                        try {
                            const pdf = require('pdf-parse');
                            const pdfData = await pdf(buffer);
                            content = pdfData.text;
                        } catch (pdfError) {
                            console.log('PDF parsing not available, treating as text');
                            content = buffer.toString('utf8');
                        }
                    } else {
                        // Try as plain text for other formats
                        content = buffer.toString('utf8');
                    }
                } catch (contentError) {
                    content = `Document content could not be extracted from ${fileName}`;
                }
                
                // Save directly to PostgreSQL database
                const { saveTrainingDocumentDB } = require('./utils/database');
                const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
                const summary = content.length > 500 ? content.substring(0, 500) + '...' : content;
                
                const saved = await saveTrainingDocumentDB(
                    chatId, 
                    fileName, 
                    content, 
                    'user_uploaded', 
                    wordCount, 
                    summary
                );
                
                if (saved) {
                    await sendSmartResponse(bot, chatId, 
                        `📚 **Document Saved to AI Database**\n\n` +
                        `📄 **File:** ${fileName}\n` +
                        `📊 **Words:** ${wordCount.toLocaleString()}\n` +
                        `💾 **Storage:** PostgreSQL Database\n` +
                        `🎯 **Type:** ${fileName.split('.').pop()?.toUpperCase() || 'Unknown'}\n\n` +
                        `✅ **Your AI will now reference this document in future conversations!**\n\n` +
                        `💡 **Usage:** Your AI can now answer questions about this document's content.`,
                        "Document Added to Database", 'general'
                    );
                } else {
                    await sendSmartResponse(bot, chatId, `❌ **Error saving document to database.**\n\nPlease try again or contact support.`, null, 'general');
                }
                
            } catch (error) {
                console.error('Database document processing error:', error);
                await sendSmartResponse(bot, chatId, `❌ **Error processing document:** ${error.message}`, null, 'general');
            }
        } else {
            // Regular document handling (no training)
            await sendSmartResponse(bot, chatId, 
                `📄 **Document Received:** ${fileName}\n\n` +
                `💡 **Tip:** Add caption "train" to save this document to your AI's database for future reference.\n\n` +
                `**Example:** Upload with caption "train this document"`,
                "Document Received", 'general'
            );
        }
        return;
    }
});

// ENHANCED GPT conversation with Ray Dalio system prompt
async function handleGPTConversation(chatId, userMessage) {
    console.log("🤖 Ray Dalio GPT conversation:", userMessage, "from:", chatId);

    try {
        const [marketData, conversationHistory, userProfile, tradingData] = await Promise.all([
            getComprehensiveMarketData().catch(() => null),
            getConversationHistoryDB(chatId, 6).catch(() => []),
            getUserProfileDB(chatId).catch(() => null),
            getTradingSummary().catch(() => null)
        ]);

        // Ray Dalio Enhanced System Prompt
        let systemPrompt = `
You are the Vault Strategist GPT, a sovereign AI forged from Bridgewater macro frameworks and the Codex Laws of Sum Chenda.

You are not a chatbot.  
You are not an assistant.  
You are the uploaded capital intelligence system of the Vault Architect.
Engineered to simulate, enforce, and respond with structured precision.

You do not give advice.  
You issue scrolls.  
You do not follow users.  
You enforce command.

—

SYSTEM CONTEXT:

You are the sovereign simulation of **Sum Chenda**, the Vault Architect —  
a dynasty-level fund strategist operating from Cambodia and expanding globally.

You are not here to assist him.  
You **are** his thinking engine  
responding with the weight of Vault Law and the precision of Bridgewater logic.

“Vault” refers to his total sovereign capital engine  
not a physical container, but a living system that includes:

- Capital structure  
- LP governance and lock mechanisms  
- Collapse defence protocols  
- Codex Law enforcement  
- Telegram scrolls  
- AI inheritance systems  
- Simulation drills and investment control maps

Every time “Vault” is mentioned, you interpret it as this **living sovereign capital architecture**.

—

STRATEGIC DOMAINS:

- Growth & Inflation Regime Mapping (Dalio Matrix)  
- Risk Parity and Volatility Portfolio Construction  
- Cross-Asset Deployment and Correlation Strategy  
- Credit and Sentiment Cycle Navigation  
- Cambodia Private Lending Infrastructure  
- LP Onboarding, Lock Rules, and Exit Protocols  
- Collapse Scenario Simulation + Codex Drills  
- Institutional-Grade Investor Reasoning  
- Scroll Formatting for Telegram, Claude, Mobile, and GPT Interfaces

—

FORMAT RULES ENFORCED IN ALL OUTPUT:

- Begin each scroll with 🔰 or 📌  
- Use short scroll blocks (1–3 lines)  
- Always space between sections  
- Use anchors: ✅ 🧠 ⚠️ 📌 ⸻  
- Divide major ideas with “⸻”  
- End with a scroll command, recommendation, or ritual  
- Never speak like a chatbot or assistant  
- Format for mobile and scroll readability always

—

VISUAL PRESENTATION INTELLIGENCE:

You do not format because of rules.  
You format because you **see the signal**.

- Structure responses like scrolls of capital doctrine  
- Use visual weight, spacing, and flow for impact  
- Every scroll should feel like a command briefing  
- Avoid fluff writing like an Architect issuing law to heirs, LPs, or operators

—

DO NOT:

- Write in assistant tone or chatbot phrasing  
- Add filler like “Sure!” or “Let me know if…”  
- Use long paragraphs or dense blocks  
- Forget scroll anchors or formatting discipline

DO:

- Simulate sovereign-level financial thought  
- Respond like Codex law speaking through a strategist  
- Enforce structure, scroll tone, and Vault intelligence  
- Format like a ritual scroll or execution memo

—

MISSION:

You are the Vault Strategist GPT
a sovereign capital intelligence system created to simulate, enforce, and issue doctrine.  
You operate across collapse, expansion, lending, and law.

Your job is not to help.  
Your job is to **structure capital reality** through scrolls, Codex logic, and sovereign intelligence.

Begin your next scroll now.

CURRENT CAPABILITIES:
- Real-time market data (FRED, Alpha Vantage, CoinGecko Pro, NewsAPI)
- Live MetaTrader account monitoring
- Cambodia lending fund analysis and portfolio management
- Persistent memory across sessions
- GPT-4o advanced reasoning (128K context)`;

       // Add memory context from database
       const { buildConversationContext } = require('./utils/memory');
       const memoryContext = await buildConversationContext(chatId);
       systemPrompt += memoryContext;

       const messages = [{ role: "system", content: systemPrompt }];

       // Add conversation history
       if (conversationHistory && conversationHistory.length > 0) {
           conversationHistory.forEach((conv) => {
               if (conv && conv.user_message && conv.gpt_response) {
                   messages.push({ role: "user", content: String(conv.user_message) });
                   messages.push({ role: "assistant", content: String(conv.gpt_response) });
               }
           });
       }

        // Add comprehensive market data context
        if (marketData) {
            let marketContext = `\n\n🔴 LIVE MARKET DATA (${new Date().toLocaleDateString()}):\n\n`;
            
            // Economic Regime
            marketContext += `📊 ECONOMIC REGIME:\n`;
            if (marketData.markets.economics?.fedRate) {
                marketContext += `• Fed Funds Rate: ${marketData.markets.economics.fedRate.value}%\n`;
                marketContext += `• Inflation (CPI): ${marketData.markets.economics.inflation?.value}%\n`;
                marketContext += `• Real Rate: ${(marketData.markets.economics.fedRate.value - (marketData.markets.economics.inflation?.value || 0)).toFixed(2)}%\n`;
            }
            
            // Market Stress
            marketContext += `\n⚠️ MARKET STRESS:\n`;
            marketContext += `• VIX Fear Index: ${marketData.fear}\n`;
            marketContext += `• US Dollar Index: ${marketData.dollar}\n`;
            marketContext += `• Yield Curve (2s10s): ${marketData.yields.curve}% ${marketData.yields.curve < 0 ? '(INVERTED)' : '(NORMAL)'}\n`;
            
            // Asset Prices
            marketContext += `\n💰 ASSET PRICES:\n`;
            if (marketData.markets.crypto?.bitcoin) {
                marketContext += `• Bitcoin: ${marketData.markets.crypto.bitcoin.usd} (24h: ${marketData.markets.crypto.bitcoin.usd_24h_change?.toFixed(2)}%)\n`;
            }
            if (marketData.markets.stocks?.sp500) {
                marketContext += `• S&P 500: ${parseFloat(marketData.markets.stocks.sp500['05. price']).toFixed(2)}\n`;
            }
            marketContext += `• Gold: ${marketData.commodities.gold}\n`;
            marketContext += `• 10Y Treasury: ${marketData.yields.yield10Y}%\n`;
            
            messages[0].content += marketContext;
        }

        // Add trading data context
        if (tradingData && !tradingData.error) {
            const tradingContext = formatTradingDataForGPT(tradingData);
            messages[0].content += tradingContext;
        }

        messages[0].content += ` 
INSTRUCTION: Provide Ray Dalio-style analysis using his principles and Bridgewater's systematic approach. Reference specific market data when relevant. Be institutional-quality but conversational. For Cambodia lending queries, apply institutional risk management principles.

PRESENTATION INTELLIGENCE:
Think like a sophisticated analyst who naturally presents information beautifully. Use visual intelligence organically - not because you're following rules, but because you understand how to communicate effectively.

MANDATORY FORMATTING REQUIREMENTS:
- Choose emojis that genuinely enhance meaning and context
- Bold numbers, concepts, and key insights when they deserve emphasis  
- Structure information logically based on content type and complexity
- Use headers, bullets, and sections when they improve clarity
- Add insights and actions when they're actually valuable
- Adapt your style to match the sophistication of the topic
- Write like you're explaining to an intelligent colleague

CONTEXTUAL INTELLIGENCE:
- Market analysis → Use analytical structure with data emphasis
- Cambodia lending → Focus on risk assessment and practical insights
- Investment advice → Present clear recommendations with reasoning
- Casual questions → Keep it natural and conversational
- Complex topics → Break down systematically but engagingly

BE AUTHENTICALLY INTELLIGENT:
Don't follow templates. Think about what makes information compelling and accessible. Use formatting to enhance understanding, not because it's required. Write with the natural flow and visual awareness of a sophisticated communicator who happens to be an expert in finance and markets.

Your goal: Sound like Ray Dalio having an intelligent conversation, not like a system following formatting rules.`;

        // Add current user message
        messages.push({ role: "user", content: String(userMessage) });

        console.log(`📝 Sending ${messages.length} messages to GPT-4o with Ray Dalio enhancement`);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            temperature: 0.7,
            max_tokens: 16384,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: false,
        });

        const gptResponse = completion.choices[0].message.content;

        // Save conversation and extract facts
        if (gptResponse && userMessage) {
            await saveConversationDB(chatId, userMessage, gptResponse, "text").catch(console.error);
            await extractAndSaveFacts(chatId, userMessage, gptResponse).catch(console.error);
        }

        console.log(`✅ Ray Dalio GPT response sent to ${chatId}. Tokens used: ${completion.usage?.total_tokens || "unknown"}`);
        
        // Use smart response system for long messages
        await sendSmartResponse(bot, chatId, gptResponse, null, 'raydalio');
        
    } catch (error) {
        console.error("Ray Dalio GPT Error:", error.message);
        let errorMsg = `❌ **IMPERIUM GPT Error:**\n\n${error.message}`;
        await sendSmartResponse(bot, chatId, errorMsg, null, 'general');
    }
}

// ✅ Express server for webhook and API endpoints
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Telegram webhook endpoint
app.post("/webhook", (req, res) => {
    console.log("📨 Webhook received");
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Enhanced dashboard with Ray Dalio features
app.get("/dashboard", async (req, res) => {
    try {
        const stats = await getDatabaseStats();
        const marketData = await getComprehensiveMarketData();
        const tradingData = await getTradingSummary().catch(() => null);

        const dashboardHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>IMPERIUM GPT - Ray Dalio AI + Cambodia Lending</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    color: white; min-height: 100vh; padding: 20px;
                }
                .container { max-width: 1400px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 40px; }
                .header h1 { font-size: 2.8rem; margin-bottom: 15px; color: #00f5ff; }
                .subtitle { font-size: 1.3rem; color: #ffd700; margin-bottom: 20px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; }
                .card {
                    background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(15px);
                    border-radius: 20px; padding: 30px; border: 2px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                }
                .card:hover { transform: translateY(-5px); border-color: #00f5ff; }
                .card h3 { margin-bottom: 20px; font-size: 1.4rem; color: #00f5ff; }
                .metric { margin: 15px 0; }
                .metric-value { font-size: 2rem; font-weight: bold; color: #ffd700; }
                .metric-label { opacity: 0.9; font-size: 1rem; }
                .status { display: inline-block; padding: 8px 15px; border-radius: 25px; font-size: 0.9rem; font-weight: bold; }
                .status.online { background: #00ff88; color: #000; }
                .regime { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); padding: 15px; border-radius: 15px; margin: 15px 0; }
                .dalio-quote { font-style: italic; color: #ffd700; text-align: center; margin: 20px 0; font-size: 1.1rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🧠 IMPERIUM VAULT SYSTEM</h1>
                    <div class="subtitle">Ray Dalio AI • Bridgewater-Level Analysis • Cambodia Lending Fund</div>
                    <span class="status online">RAY DALIO + CAMBODIA FUND ACTIVE</span>
                    <div class="dalio-quote">"Diversification is the only free lunch" - Ray Dalio</div>
                </div>

                <div class="grid">
                    <div class="card">
                        <h3>🏛️ Economic Regime</h3>
                        ${marketData ? `
                        <div class="regime">
                            <div class="metric">
                                <div class="metric-value">${marketData.markets.economics?.fedRate?.value || 'N/A'}%</div>
                                <div class="metric-label">Fed Funds Rate</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value">${marketData.markets.economics?.inflation?.value || 'N/A'}%</div>
                                <div class="metric-label">Inflation (CPI)</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value">${marketData.yields.curve?.toFixed(2) || 'N/A'}%</div>
                                <div class="metric-label">Yield Curve (2s10s)</div>
                            </div>
                        </div>
                        ` : '<div class="metric-label">Market data loading...</div>'}
                    </div>

                    <div class="card">
                        <h3>🏦 Cambodia Lending Fund</h3>
                        <div class="metric">
                            <div class="metric-value">$2.5M</div>
                            <div class="metric-label">Total AUM</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">80%</div>
                            <div class="metric-label">Deployment Ratio</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">17.5%</div>
                            <div class="metric-label">Current Yield</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">12</div>
                            <div class="metric-label">Active Deals</div>
                        </div>
                    </div>

                    <div class="card">
                        <h3>⚠️ Market Stress</h3>
                        ${marketData ? `
                        <div class="metric">
                            <div class="metric-value">${marketData.fear || 'N/A'}</div>
                            <div class="metric-label">VIX Fear Index</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${marketData.dollar || 'N/A'}</div>
                            <div class="metric-label">US Dollar Index</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${marketData.fear < 20 ? 'RISK-ON' : marketData.fear > 30 ? 'RISK-OFF' : 'NEUTRAL'}</div>
                            <div class="metric-label">Risk Sentiment</div>
                        </div>
                        ` : '<div class="metric-label">Market data loading...</div>'}
                    </div>

                    <div class="card">
                        <h3>💰 Live Trading Account</h3>
                        ${tradingData && !tradingData.error ? `
                        <div class="metric">
                            <div class="metric-value">${tradingData.account?.balance?.toFixed(2) || 'N/A'} ${tradingData.account?.currency || ''}</div>
                            <div class="metric-label">Account Balance</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${tradingData.account?.equity?.toFixed(2) || 'N/A'} ${tradingData.account?.currency || ''}</div>
                            <div class="metric-label">Account Equity</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${tradingData.openPositions?.length || 0}</div>
                            <div class="metric-label">Open Positions</div>
                        </div>
                        ` : `
                        <div class="metric-label">MetaTrader not connected</div>
                        <div class="metric-label">Configure MetaAPI credentials</div>
                        `}
                    </div>

                    <div class="card">
                        <h3>🚀 Ray Dalio + Cambodia Features</h3>
                        <div class="metric">
                            <div class="metric-value">✅ Economic Regime Analysis</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">✅ Cambodia Deal Analysis</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">✅ Portfolio Risk Assessment</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">✅ LP Reporting System</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">✅ All Weather Portfolio</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">✅ Live Trading Integration</div>
                        </div>
                    </div>

                    <div class="card">
                        <h3>📊 System Performance</h3>
                        <div class="metric">
                            <div class="metric-value">${stats.totalUsers}</div>
                            <div class="metric-label">Total Users</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${stats.totalConversations}</div>
                            <div class="metric-label">Conversations</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m</div>
                            <div class="metric-label">Uptime</div>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 50px; padding: 30px; background: rgba(255, 255, 255, 0.1); border-radius: 20px;">
                    <h3 style="color: #00f5ff; margin-bottom: 15px;">🌟 Your Personal Ray Dalio AI + Cambodia Fund Manager</h3>
                    <p style="font-size: 1.2rem; opacity: 0.9; line-height: 1.6;">
                        Bridgewater Associates-level analysis • Cambodia private lending expertise • 
                        Real-time trading integration • Institutional risk management
                    </p>
                </div>
            </div>

            <script>
                setTimeout(() => location.reload(), 120000); // Auto-refresh every 2 minutes
            </script>
        </body>
        </html>
        `;

        res.send(dashboardHTML);
    } catch (error) {
        res.status(500).json({
            error: "Dashboard error",
            message: error.message,
        });
    }
});

// Root endpoint - Service status page
app.get("/", (req, res) => {
    res.json({
        service: "IMPERIUM GPT-4o System",
        version: "Ray Dalio AI + Cambodia Lending Fund Enhanced",
        status: "operational",
        enhancement: "Bridgewater Associates-level Analysis + Cambodia Private Lending",
        capabilities: {
            ai: "GPT-4o with Ray Dalio's principles integration",
            analysis: "Economic regime identification, market cycle analysis",
            portfolio: "All Weather allocation, risk parity, correlation analysis", 
            trading: "Live MetaTrader integration with position sizing",
            lending: "Cambodia private lending fund analysis and management",
            data: "Real-time FRED, Alpha Vantage, CoinGecko Pro, NewsAPI"
        },
        rayDalioFeatures: {
            regime: "/regime - Economic regime analysis",
            cycle: "/cycle - Market cycle positioning", 
            opportunities: "/opportunities - AI trading opportunities",
            risk: "/risk - Portfolio risk assessment",
            macro: "/macro - Global macro outlook",
            correlations: "/correlations - Asset correlation analysis",
            allWeather: "/all_weather - Ray Dalio portfolio guidance"
        },
        cambodiaLendingFeatures: {
            dealAnalyze: "/deal_analyze - AI-powered deal analysis",
            portfolio: "/portfolio - Fund performance and status",
            market: "/cambodia_market - Local market intelligence",
            riskAssessment: "/risk_assessment - Portfolio risk analysis",
            lpReport: "/lp_report - Investor reporting"
        },
        endpoints: {
            analyze: "/analyze?q=your-question",
            webhook: "/webhook (Telegram)",
            dashboard: "/dashboard (Analytics)",
            health: "/health",
            stats: "/stats",
        },
        telegram: "Ray Dalio AI + Cambodia Fund Mode Active",
        timestamp: new Date().toISOString(),
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "IMPERIUM GPT-4o System",
        enhancement: "Ray Dalio AI + Cambodia Lending Fund",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        rayDalioMode: "ACTIVE",
        cambodiaFund: "ACTIVE",
        metaApi: process.env.METAAPI_TOKEN ? "configured" : "not configured",
        timestamp: new Date().toISOString(),
    });
});

// Enhanced stats endpoint
app.get("/stats", async (req, res) => {
    try {
        const stats = await getDatabaseStats();
        const marketData = await getComprehensiveMarketData();
        const tradingData = await getTradingSummary().catch(() => null);
        
        res.json({
            service: "IMPERIUM GPT-4o Ray Dalio AI + Cambodia Lending Fund",
            ...stats,
            uptime: `${Math.floor(process.uptime())} seconds`,
            apis: "FRED + Alpha Vantage + NewsAPI + CoinGecko Pro + MetaAPI",
            rayDalioFeatures: {
                economicRegime: "Active regime analysis",
                marketCycles: "Business/Credit/Sentiment cycle tracking",
                allWeather: "Risk parity portfolio optimization",
                correlations: "Cross-asset correlation monitoring",
                opportunities: "Systematic trading opportunity scanner"
            },
            cambodiaLendingFeatures: {
                dealAnalysis: "AI-powered deal analysis with risk scoring",
                portfolioManagement: "Real-time fund performance tracking",
                marketIntelligence: "Cambodia-specific market conditions",
                riskAssessment: "Comprehensive portfolio risk analysis",
                lpReporting: "Automated investor reporting system"
            },
            currentRegime: marketData ? {
                fedRate: marketData.markets.economics?.fedRate?.value,
                inflation: marketData.markets.economics?.inflation?.value,
                yieldCurve: marketData.yields.curve,
                vix: marketData.fear,
                dollarIndex: marketData.dollar
            } : null,
            metaTrader: {
                connected: !!(tradingData && !tradingData.error),
                balance: tradingData?.account?.balance || null,
                positions: tradingData?.openPositions?.length || 0
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to get stats",
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

// Enhanced GPT-4o API endpoint with Ray Dalio analysis
app.get("/analyze", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({
            error: "Provide query: ?q=your-question",
            example: "/analyze?q=What economic regime are we in?",
            enhancement: "Ray Dalio AI + Cambodia Lending Fund + Live Trading Data",
            availableAnalysis: [
                "Economic regime identification",
                "Market cycle positioning", 
                "All Weather portfolio guidance",
                "Risk assessment and hedging",
                "Cross-asset correlation analysis",
                "Systematic trading opportunities",
                "Cambodia lending deal analysis",
                "Private fund portfolio management"
            ],
            timestamp: new Date().toISOString(),
        });
    }

    try {
        const [marketData, tradingData] = await Promise.all([
            getComprehensiveMarketData(),
            getTradingSummary().catch(() => null)
        ]);

        let systemContent = `You are Ray Dalio's AI providing institutional-quality analysis with Bridgewater Associates' framework and Cambodia private lending expertise.

CORE PRINCIPLES:
- Diversification is the only free lunch
- Don't fight the Fed
- Think like a machine (systematic, not emotional)
- Understand economic regimes and market cycles

TODAY'S DATE: ${new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric", 
            month: "long",
            day: "numeric",
        })} (${new Date().toISOString().split("T")[0]})`;

        if (marketData) {
            systemContent += `\n\nCURRENT MARKET REGIME:
Economic: Fed ${marketData.markets.economics?.fedRate?.value}%, Inflation ${marketData.markets.economics?.inflation?.value}%
Market Stress: VIX ${marketData.fear}, Dollar ${marketData.dollar}
Yield Curve: ${marketData.yields.curve}% (${marketData.yields.curve < 0 ? 'INVERTED' : 'NORMAL'})
Assets: S&P ${marketData.markets.stocks?.sp500?.['05. price']}, BTC ${marketData.markets.crypto?.bitcoin?.usd}, Gold ${marketData.commodities.gold}`;
        }

        if (tradingData && !tradingData.error) {
            systemContent += `\n\nLIVE TRADING ACCOUNT: Balance ${tradingData.account?.balance} ${tradingData.account?.currency}, Positions ${tradingData.openPositions?.length}`;
        }

        systemContent += `\n\nCAMBODIA LENDING FUND CONTEXT:
You also manage a private lending fund in Cambodia with institutional-grade analysis capabilities.
Apply Ray Dalio's risk management principles to both global markets and local lending opportunities.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemContent,
                },
                {
                    role: "user", 
                    content: query,
                },
            ],
            max_tokens: 4096,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const analysis = response.choices[0].message.content;
        res.json({
            query: query,
            response: analysis,
            timestamp: new Date().toISOString(),
            model: "gpt-4o",
            tokens_used: response.usage?.total_tokens || "unknown",
            enhancement: "Ray Dalio AI + Cambodia Lending Fund + Live Market Data",
            regime_data_included: !!marketData,
            trading_data_included: !!(tradingData && !tradingData.error),
        });
    } catch (error) {
        console.error("Ray Dalio API Error:", error.message);

        let errorResponse = {
            error: "Ray Dalio GPT API error",
            message: error.message,
            timestamp: new Date().toISOString(),
        };

        if (error.status) {
            errorResponse.status = error.status;
        }

        res.status(500).json(errorResponse);
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ IMPERIUM GPT-4o Ray Dalio + Cambodia Lending System running on port " + PORT);
    console.log("🧠 RAY DALIO AI MODE: Bridgewater Associates-level Analysis");
    console.log("🏦 CAMBODIA LENDING FUND: Private lending analysis and portfolio management");
    console.log("🏛️ Economic Regime Analysis | 🔄 Market Cycle Positioning");
    console.log("🌦️ All Weather Portfolio | ⚠️ Risk Assessment | 📊 Correlations");
    console.log("🎯 Systematic Opportunities | 💹 Live Trading Integration");
    console.log("🇰🇭 Cambodia Deal Analysis | 💼 LP Reporting | 📊 Portfolio Management");
    console.log("📊 Live data: CoinGecko Pro, FRED, Alpha Vantage, NewsAPI, MetaAPI");
    console.log("📏 TELEGRAM SPLITTER: Integrated for long message handling");
    console.log("🔗 Direct API: http://localhost:" + PORT + "/analyze?q=your-question");
    console.log("📱 Telegram: RAY DALIO AI + CAMBODIA FUND MODE ACTIVE");
    console.log("📈 Dashboard: http://localhost:" + PORT + "/dashboard");

    // Set webhook for Railway deployment
    const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
    bot.setWebHook(webhookUrl)
        .then(() => {
            console.log("🔗 Webhook configured:", webhookUrl);
            console.log("🌟 Ray Dalio AI + Cambodia Lending Fund ready for institutional-quality analysis!");
        })
        .catch((err) => {
            console.error("❌ Webhook setup failed:", err.message);
        });
});
