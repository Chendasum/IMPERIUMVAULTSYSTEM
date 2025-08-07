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

// ✅ Initialize OpenAI API (latest SDK v4.38.1) - OPTIMIZED FOR MAXIMUM LENGTH
const openai = new OpenAI({ 
    apiKey: openaiKey,
    timeout: 60000, // 60 second timeout for long responses
    maxRetries: 3
});

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
        const welcomeMessage = `⚡ **IMPERIUM VAULT STRATEGIC COMMAND SYSTEM**

This is your exclusive financial warfare command center with institutional-grade intelligence.

**🎯 STRATEGIC COMMAND PROTOCOLS:**
• No casual conversation - Strategic directives only
• Pure financial warfare intelligence
• Maximum 12,000+ word strategic reports
• Cambodia lending fund operations
• Live trading account integration

**🏦 CAMBODIA LENDING FUND OPERATIONS:**
/deal_analyze [amount] [type] [location] [rate] [term] - Strategic deal analysis
/portfolio - Fund performance command status
/cambodia_market - Local market intelligence briefing
/risk_assessment - Comprehensive risk warfare analysis
/lp_report [monthly/quarterly] - Investor command reports
/fund_help - Cambodia operations command help

**🏛️ MARKET DOMINATION COMMANDS:**
/regime - Economic regime warfare analysis
/cycle - Market cycle domination positioning  
/opportunities - Strategic trading command scanner
/risk - Portfolio warfare risk assessment
/macro - Global domination macro intelligence
/correlations - Asset correlation warfare analysis
/all_weather - Strategic portfolio allocation commands

**💹 LIVE TRADING OPERATIONS:**
/trading - Live account strategic status
/positions - Current position warfare analysis
/size [SYMBOL] [BUY/SELL] - Position sizing command calculator
/account - Account balance and performance warfare metrics

**📊 MARKET INTELLIGENCE OPERATIONS:**
/briefing - Complete strategic market briefing
/economics - Economic intelligence with Fed warfare analysis
/prices - Enhanced market data with correlation warfare
/analysis - Strategic market analysis with institutional predictions

**🎯 COMMAND EXAMPLES:**
• /deal_analyze 500000 commercial "Chamkar Mon" 18 12
• "Deploy capital to Cambodia commercial lending sector"
• "Execute comprehensive macro economic warfare analysis"
• "Command strategic portfolio risk assessment"

**Chat ID:** ${chatId}
**Status:** ⚡ STRATEGIC COMMAND MODE ACTIVE`;

        await sendSmartResponse(bot, chatId, welcomeMessage, null, 'general');
        console.log("✅ Strategic command system message sent");
        return;
    }

    // 🏦 ========== CAMBODIA LENDING FUND COMMANDS ==========

    // 🎯 DEAL ANALYSIS COMMAND
    if (text.startsWith('/deal_analyze ') || text === '/deal_analyze') {
        try {
            await bot.sendMessage(chatId, "🎯 Executing Cambodia lending deal strategic analysis...");
            
            if (text === '/deal_analyze') {
                const usageMessage = `📋 **Strategic Deal Analysis Command Protocol:**

**Command Format:** /deal_analyze [amount] [type] [location] [rate] [term]

**Strategic Examples:**
• /deal_analyze 500000 commercial "Chamkar Mon" 18 12
• /deal_analyze 250000 bridge "Toul Kork" 22 6
• /deal_analyze 1000000 development "Daun Penh" 20 24

**Command Parameters:**
• Amount: USD deployment (e.g., 500000)
• Type: commercial, residential, bridge, development
• Location: "Chamkar Mon", "Daun Penh", "Toul Kork", etc.
• Rate: Annual % yield (e.g., 18)
• Term: Months deployment (e.g., 12)`;

                await sendSmartResponse(bot, chatId, usageMessage, null, 'cambodia');
                return;
            }
            
            // Parse parameters
            const params = text.replace('/deal_analyze ', '').split(' ');
            if (params.length < 5) {
                await sendSmartResponse(bot, chatId, "❌ Command format error. Execute: /deal_analyze [amount] [type] [location] [rate] [term]", null, 'general');
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
                await sendSmartResponse(bot, chatId, `❌ Strategic analysis error: ${analysis.error}`, null, 'general');
                return;
            }
            
            let response = `🎯 **CAMBODIA STRATEGIC DEAL ANALYSIS**\n\n`;
            response += `📊 **DEAL COMMAND OVERVIEW:**\n`;
            response += `• Amount: $${analysis.dealSummary.amount.toLocaleString()} USD\n`;
            response += `• Rate: ${analysis.dealSummary.rate}% annually\n`;
            response += `• Term: ${analysis.dealSummary.term} months\n`;
            response += `• Monthly Payment: $${analysis.dealSummary.monthlyPayment.toFixed(0)}\n`;
            response += `• Total Return: $${analysis.dealSummary.totalReturn.toFixed(0)}\n\n`;
            
            response += `⚠️ **RISK WARFARE ASSESSMENT:**\n`;
            response += `• Overall Risk Score: ${analysis.riskAssessment.overallScore}/100\n`;
            response += `• Risk Category: ${analysis.riskAssessment.riskCategory}\n`;
            response += `• Credit Risk: ${analysis.riskAssessment.creditRisk}/100\n`;
            response += `• Market Risk: ${analysis.riskAssessment.marketRisk}/100\n`;
            response += `• Liquidity Risk: ${analysis.riskAssessment.liquidityRisk}\n\n`;
            
            response += `🇰🇭 **CAMBODIA BATTLEFIELD CONTEXT:**\n`;
            response += `• Current Conditions: ${analysis.marketContext.currentConditions}\n`;
            response += `• Market Timing: ${analysis.marketContext.marketTiming}\n`;
            response += `• Competitive Rate: ${analysis.marketContext.competitiveRate}%\n\n`;
            
            response += `🏛️ **STRATEGIC ANALYSIS:**\n`;
            response += `• Regime Alignment: ${analysis.rayDalioInsights.regimeAlignment}\n`;
            response += `• Diversification Impact: ${analysis.rayDalioInsights.diversificationImpact}\n`;
            response += `• Macro Factors: ${analysis.rayDalioInsights.macroFactors}\n\n`;
            
            response += `💰 **FINANCIAL WARFARE METRICS:**\n`;
            response += `• Expected Return: ${analysis.metrics.expectedReturn}%\n`;
            response += `• Risk-Adjusted Return: ${analysis.metrics.riskAdjustedReturn.toFixed(2)}%\n`;
            response += `• Break-Even Default: ${analysis.metrics.breakEvenDefault.toFixed(1)}%\n\n`;
            
            const decisionEmoji = analysis.recommendation.decision === 'APPROVE' ? '✅' : 
                                 analysis.recommendation.decision === 'CONDITIONAL_APPROVE' ? '⚠️' : '❌';
            
            response += `${decisionEmoji} **STRATEGIC DIRECTIVE: ${analysis.recommendation.decision}**\n`;
            response += `• Command Confidence: ${analysis.recommendation.confidence}%\n`;
            response += `• Strategic Rationale: ${analysis.recommendation.reasons[0]}\n\n`;
            
            if (analysis.recommendation.conditions && analysis.recommendation.conditions.length > 0) {
                response += `📋 **EXECUTION CONDITIONS:**\n`;
                analysis.recommendation.conditions.forEach(condition => {
                    response += `• ${condition}\n`;
                });
                response += `\n`;
            }
            
            response += `🎯 **Strategic Deal ID:** ${analysis.dealId}`;
            
            await sendSmartResponse(bot, chatId, response, "Cambodia Strategic Deal Analysis", 'cambodia');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Strategic deal analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // 🏦 PORTFOLIO STATUS COMMAND
    if (text === '/portfolio' || text === '/fund_status') {
        try {
            await bot.sendMessage(chatId, "🏦 Executing portfolio strategic status analysis...");
            
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
                await sendSmartResponse(bot, chatId, `❌ Portfolio strategic analysis error: ${portfolio.error}`, null, 'general');
                return;
            }
            
            let response = `🏦 **CAMBODIA LENDING FUND STRATEGIC STATUS**\n\n`;
            
            response += `💰 **FUND COMMAND OVERVIEW:**\n`;
            response += `• Total AUM: $${portfolio.fundOverview.totalAUM.toLocaleString()}\n`;
            response += `• Deployed Capital: $${portfolio.fundOverview.deployedCapital.toLocaleString()}\n`;
            response += `• Available Capital: $${portfolio.fundOverview.availableCapital.toLocaleString()}\n`;
            response += `• Deployment Ratio: ${portfolio.fundOverview.deploymentRatio.toFixed(1)}%\n`;
            response += `• Active Deals: ${portfolio.fundOverview.numberOfDeals}\n`;
            response += `• Avg Deal Size: $${portfolio.fundOverview.averageDealSize.toLocaleString()}\n\n`;
            
            response += `📈 **PERFORMANCE WARFARE METRICS:**\n`;
            response += `• Current Yield: ${portfolio.performance.currentYieldRate.toFixed(2)}%\n`;
            response += `• Target Yield: ${portfolio.performance.targetYieldRate}%\n`;
            response += `• vs Target: ${portfolio.performance.actualVsTarget > 0 ? '+' : ''}${portfolio.performance.actualVsTarget.toFixed(1)}%\n`;
            response += `• Risk-Adj Return: ${portfolio.performance.riskAdjustedReturn.toFixed(2)}%\n`;
            response += `• Monthly Income: $${portfolio.performance.monthlyIncome.toLocaleString()}\n`;
            response += `• Annualized Return: ${portfolio.performance.annualizedReturn.toFixed(2)}%\n\n`;
            
            response += `⚠️ **RISK WARFARE METRICS:**\n`;
            response += `• Concentration Risk: ${portfolio.riskMetrics.concentrationRisk}\n`;
            response += `• Default Rate: ${portfolio.riskMetrics.defaultRate.toFixed(2)}%\n`;
            response += `• Portfolio VaR: ${portfolio.riskMetrics.portfolioVaR.toFixed(1)}%\n`;
            response += `• Diversification: ${portfolio.riskMetrics.diversificationScore}/100\n`;
            response += `• Liquidity: ${portfolio.riskMetrics.liquidity}\n\n`;
            
            response += `🗺️ **GEOGRAPHIC WARFARE ALLOCATION:**\n`;
            response += `• Phnom Penh: ${portfolio.geographicAllocation.phnomPenh.toFixed(1)}%\n`;
            response += `• Sihanoukville: ${portfolio.geographicAllocation.sihanoukville.toFixed(1)}%\n`;
            response += `• Siem Reap: ${portfolio.geographicAllocation.siemReap.toFixed(1)}%\n`;
            response += `• Other: ${portfolio.geographicAllocation.other.toFixed(1)}%\n\n`;
            
            response += `🏗️ **SECTOR WARFARE ALLOCATION:**\n`;
            response += `• Commercial: ${portfolio.sectorAllocation.commercial.toFixed(1)}%\n`;
            response += `• Residential: ${portfolio.sectorAllocation.residential.toFixed(1)}%\n`;
            response += `• Development: ${portfolio.sectorAllocation.development.toFixed(1)}%\n`;
            response += `• Bridge: ${portfolio.sectorAllocation.bridge.toFixed(1)}%\n\n`;
            
            response += `🏛️ **STRATEGIC ASSESSMENT:**\n`;
            response += `• Diversification Score: ${portfolio.rayDalioPortfolioAnalysis.diversificationScore}/100\n`;
            response += `• Risk Parity Alignment: ${portfolio.rayDalioPortfolioAnalysis.riskParityAlignment}\n`;
            response += `• Macro Alignment: ${portfolio.rayDalioPortfolioAnalysis.macroAlignment}\n`;
            response += `• Regime Positioning: ${portfolio.rayDalioPortfolioAnalysis.regimePositioning}\n\n`;
            
            if (portfolio.recommendations.length > 0) {
                response += `💡 **STRATEGIC DIRECTIVES:**\n`;
                portfolio.recommendations.slice(0, 3).forEach(rec => {
                    response += `• ${rec}\n`;
                });
                response += `\n`;
            }
            
            if (portfolio.alerts.length > 0) {
                response += `🚨 **COMMAND ALERTS:**\n`;
                portfolio.alerts.slice(0, 2).forEach(alert => {
                    response += `• ${alert}\n`;
                });
            }
            
            await sendSmartResponse(bot, chatId, response, "Fund Strategic Portfolio Status", 'cambodia');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Portfolio strategic status error: ${error.message}`, null, 'general');
        }
        return;
    }

    // 🇰🇭 CAMBODIA MARKET COMMAND
    if (text === '/cambodia_market' || text === '/market_cambodia') {
        try {
            await bot.sendMessage(chatId, "🇰🇭 Executing Cambodia market strategic intelligence analysis...");
            
            const conditions = await getCambodiaMarketConditions();
            
            if (conditions.error) {
                await sendSmartResponse(bot, chatId, `❌ Market strategic intelligence error: ${conditions.error}`, null, 'general');
                return;
            }
            
            let response = `🇰🇭 **CAMBODIA MARKET STRATEGIC INTELLIGENCE**\n\n`;
            
            response += `📊 **ECONOMIC WARFARE ENVIRONMENT:**\n`;
            response += `• GDP Growth: ${conditions.economicEnvironment.gdpGrowth}%\n`;
            response += `• Inflation: ${conditions.economicEnvironment.inflation}%\n`;
            response += `• USD/KHR Stability: ${conditions.economicEnvironment.currencyStability}\n`;
            response += `• Political Stability: ${conditions.economicEnvironment.politicalStability}\n`;
            response += `• Regulatory Environment: ${conditions.economicEnvironment.regulatoryEnvironment}\n\n`;
            
            response += `💰 **INTEREST RATE WARFARE ENVIRONMENT:**\n`;
            response += `• Commercial Loans: ${conditions.interestRateEnvironment.commercialRates.commercial.min}-${conditions.interestRateEnvironment.commercialRates.commercial.max}% (avg: ${conditions.interestRateEnvironment.commercialRates.commercial.average}%)\n`;
            response += `• Bridge Loans: ${conditions.interestRateEnvironment.commercialRates.bridge.min}-${conditions.interestRateEnvironment.commercialRates.bridge.max}% (avg: ${conditions.interestRateEnvironment.commercialRates.bridge.average}%)\n`;
            response += `• Development: ${conditions.interestRateEnvironment.commercialRates.development.min}-${conditions.interestRateEnvironment.commercialRates.development.max}% (avg: ${conditions.interestRateEnvironment.commercialRates.development.average}%)\n`;
            response += `• Strategic Trend: ${conditions.interestRateEnvironment.trendDirection}\n`;
            response += `• Fed Impact: ${conditions.interestRateEnvironment.fedImpact}\n\n`;
            
            response += `🏘️ **PROPERTY WARFARE MARKET:**\n`;
            response += `• Phnom Penh Trend: ${conditions.propertyMarket.phnomPenhTrend}\n`;
            response += `• Demand/Supply: ${conditions.propertyMarket.demandSupplyBalance}\n`;
            response += `• Foreign Investment: ${conditions.propertyMarket.foreignInvestment}\n`;
            response += `• Development Activity: ${conditions.propertyMarket.developmentActivity}\n`;
            response += `• Price Appreciation: ${conditions.propertyMarket.priceAppreciation}\n`;
            response += `• Liquidity: ${conditions.propertyMarket.liquidity}\n\n`;
            
            response += `🏦 **BANKING WARFARE SECTOR:**\n`;
            response += `• Liquidity: ${conditions.bankingSector.liquidityConditions}\n`;
            response += `• Credit Growth: ${conditions.bankingSector.creditGrowth}\n`;
            response += `• Competition: ${conditions.bankingSector.competitionLevel}\n`;
            response += `• Regulation: ${conditions.bankingSector.regulatoryChanges}\n\n`;
            
            response += `⚠️ **STRATEGIC RISK FACTORS:**\n`;
            response += `• Political: ${conditions.riskFactors.politicalRisk}\n`;
            response += `• Economic: ${conditions.riskFactors.economicRisk}\n`;
            response += `• Currency: ${conditions.riskFactors.currencyRisk}\n`;
            response += `• Regulatory: ${conditions.riskFactors.regulatoryRisk}\n`;
            response += `• Market: ${conditions.riskFactors.marketRisk}\n\n`;
            
            response += `⏰ **MARKET WARFARE TIMING:**\n`;
            response += `• Current Phase: ${conditions.marketTiming.currentPhase}\n`;
            response += `• Time in Cycle: ${conditions.marketTiming.timeInCycle}\n`;
            response += `• Next Phase: ${conditions.marketTiming.nextPhaseExpected}\n`;
            response += `• Lending Timing: ${conditions.marketTiming.timingForLending}\n\n`;
            
            response += `🎯 **TOP STRATEGIC OPPORTUNITIES:**\n`;
            conditions.opportunities.slice(0, 3).forEach(opp => {
                response += `• ${opp}\n`;
            });
            response += `\n`;
            
            response += `📋 **STRATEGIC MARKET SUMMARY:**\n${conditions.summary}`;
            
            await sendSmartResponse(bot, chatId, response, "Cambodia Market Strategic Intelligence", 'cambodia');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Cambodia market strategic intelligence error: ${error.message}`, null, 'general');
        }
        return;
    }

    // 📊 RISK ASSESSMENT COMMAND
    if (text === '/risk_assessment' || text === '/portfolio_risk') {
        try {
            await bot.sendMessage(chatId, "📊 Executing comprehensive strategic risk warfare assessment...");
            
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
                await sendSmartResponse(bot, chatId, `❌ Strategic risk assessment error: ${riskAssessment.error}`, null, 'general');
                return;
            }
            
            let response = `📊 **PORTFOLIO STRATEGIC RISK WARFARE ASSESSMENT**\n\n`;
            
            response += `⚠️ **OVERALL STRATEGIC RISK METRICS:**\n`;
            response += `• Overall Risk Score: ${riskAssessment.portfolioRisk.overallRiskScore}/100\n`;
            response += `• Concentration Risk: ${riskAssessment.portfolioRisk.concentrationRisk}\n`;
            response += `• Credit Risk: ${riskAssessment.portfolioRisk.creditRisk}\n`;
            response += `• Market Risk: ${riskAssessment.portfolioRisk.marketRisk}\n`;
            response += `• Liquidity Risk: ${riskAssessment.portfolioRisk.liquidityRisk}\n`;
            response += `• Operational Risk: ${riskAssessment.portfolioRisk.operationalRisk}\n`;
            response += `• Regulatory Risk: ${riskAssessment.portfolioRisk.regulatoryRisk}\n\n`;
            
            response += `🏛️ **STRATEGIC RISK ANALYSIS:**\n`;
            response += `• Diversification Effectiveness: ${riskAssessment.rayDalioRiskAnalysis.diversificationEffectiveness}\n`;
            response += `• Correlation Risks: ${riskAssessment.rayDalioRiskAnalysis.correlationRisks}\n`;
            response += `• Risk Parity Alignment: ${riskAssessment.rayDalioRiskAnalysis.riskParityAlignment}\n\n`;
            
            response += `🧪 **STRESS TEST WARFARE RESULTS:**\n`;
            response += `• Economic Downturn: ${riskAssessment.stressTesting.economicDownturn}% loss\n`;
            response += `• Interest Rate Shock: ${riskAssessment.stressTesting.interestRateShock}% impact\n`;
            response += `• Default Scenarios: ${riskAssessment.stressTesting.defaultScenarios}% portfolio impact\n`;
            response += `• Liquidity Crisis: ${riskAssessment.stressTesting.liquidityCrisis}\n\n`;
            
            response += `🚨 **EARLY WARNING STRATEGIC INDICATORS:**\n`;
            response += `• Macro Warnings: ${riskAssessment.earlyWarning.macroIndicators}\n`;
            response += `• Portfolio Warnings: ${riskAssessment.earlyWarning.portfolioIndicators}\n`;
            response += `• Market Warnings: ${riskAssessment.earlyWarning.marketIndicators}\n\n`;
            
            response += `📏 **STRATEGIC RISK LIMITS:**\n`;
            response += `• Current Utilization: ${riskAssessment.riskLimits.currentUtilization}%\n`;
            response += `• Violations: ${riskAssessment.riskLimits.violations.length} detected\n\n`;
            
            if (riskAssessment.riskActionItems.length > 0) {
                response += `🎯 **STRATEGIC ACTION ITEMS:**\n`;
                riskAssessment.riskActionItems.slice(0, 3).forEach(item => {
                    response += `• ${item}\n`;
                });
            }
            
            await sendSmartResponse(bot, chatId, response, "Portfolio Strategic Risk Warfare Assessment", 'cambodia');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Strategic risk assessment error: ${error.message}`, null, 'general');
        }
        return;
    }

    // 💼 LP REPORT COMMAND
    if (text.startsWith('/lp_report') || text === '/investor_report') {
        try {
            await bot.sendMessage(chatId, "💼 Executing LP/Investor strategic report...");
            
            const reportType = text.includes('monthly') ? 'monthly' : 
                              text.includes('quarterly') ? 'quarterly' : 'monthly';
            
            const report = await generateLPReport(reportType);
            
            if (report.error) {
                await sendSmartResponse(bot, chatId, `❌ Strategic report generation error: ${report.error}`, null, 'general');
                return;
            }
            
            let response = `💼 **${report.reportType} LP STRATEGIC REPORT**\n\n`;
            response += `📅 **Report Period:** ${report.reportPeriod}\n`;
            response += `🆔 **Report ID:** ${report.reportId}\n\n`;
            
            response += `📋 **EXECUTIVE STRATEGIC SUMMARY:**\n`;
            response += `${report.executiveSummary.fundPerformance}\n\n`;
            
            response += `💰 **FINANCIAL WARFARE PERFORMANCE:**\n`;
            response += `• Period Return: ${report.financialPerformance.returns.periodReturn.toFixed(2)}%\n`;
            response += `• Annualized Return: ${report.financialPerformance.returns.annualizedReturn.toFixed(2)}%\n`;
            response += `• Target vs Actual: ${report.financialPerformance.returns.targetVsActual > 0 ? '+' : ''}${report.financialPerformance.returns.targetVsActual.toFixed(1)}%\n`;
            response += `• Risk-Adjusted Return: ${report.financialPerformance.returns.riskAdjustedReturn.toFixed(2)}%\n\n`;
            
            response += `💵 **INCOME WARFARE BREAKDOWN:**\n`;
            response += `• Interest Income: ${report.financialPerformance.income.interestIncome.toLocaleString()}\n`;
            response += `• Fees: ${report.financialPerformance.income.fees.toLocaleString()}\n`;
            response += `• Total Income: ${report.financialPerformance.income.totalIncome.toLocaleString()}\n\n`;
            
            response += `📊 **DEPLOYMENT WARFARE METRICS:**\n`;
            response += `• Capital Deployed: ${report.financialPerformance.deploymentMetrics.capitalDeployed.toLocaleString()}\n`;
            response += `• Deployment Ratio: ${report.financialPerformance.deploymentMetrics.deploymentRatio.toFixed(1)}%\n`;
            response += `• Pipeline Value: ${report.financialPerformance.deploymentMetrics.pipelineDeal.toLocaleString()}\n\n`;
            
            response += `🗺️ **PORTFOLIO WARFARE ALLOCATION:**\n`;
            response += `• Geographic Diversification: ${report.portfolioAnalytics.diversification.score}/100\n`;
            response += `• Number of Deals: ${report.portfolioAnalytics.dealMetrics.numberOfDeals}\n`;
            response += `• Average Deal Size: ${report.portfolioAnalytics.dealMetrics.averageDealSize.toLocaleString()}\n`;
            response += `• Average Rate: ${report.portfolioAnalytics.dealMetrics.averageRate.toFixed(2)}%\n\n`;
            
            response += `⚠️ **RISK WARFARE SUMMARY:**\n`;
            response += `• Overall Risk: ${report.riskReporting.overallRisk}/100\n`;
            response += `• Stress Test: ${Object.keys(report.riskReporting.stressTestResults).length} scenarios tested\n\n`;
            
            response += `🇰🇭 **MARKET STRATEGIC COMMENTARY:**\n`;
            response += `${report.marketCommentary.cambodiaMarket}\n\n`;
            
            response += `🔮 **FORWARD STRATEGIC OUTLOOK:**\n`;
            response += `• Pipeline: ${report.forwardLooking.pipeline}\n`;
            response += `• Strategy: ${report.forwardLooking.strategy}\n\n`;
            
            response += `📎 **Full Strategic Report:** ${report.reportId}\n`;
            response += `📊 **Command Dashboard:** Available on request`;
            
            await sendSmartResponse(bot, chatId, response, "LP Strategic Investor Report", 'cambodia');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ LP strategic report error: ${error.message}`, null, 'general');
        }
        return;
    }

    // 🎯 FUND COMMANDS HELP
    if (text === '/fund_help' || text === '/lending_help') {
        const helpMessage = `🏦 **CAMBODIA LENDING FUND STRATEGIC COMMANDS**

🎯 **DEAL WARFARE ANALYSIS:**
/deal_analyze [amount] [type] [location] [rate] [term]
Example: /deal_analyze 500000 commercial "Chamkar Mon" 18 12

🏦 **PORTFOLIO STRATEGIC MANAGEMENT:**
/portfolio - Current fund strategic status and performance
/fund_status - Detailed portfolio warfare metrics

🇰🇭 **MARKET STRATEGIC INTELLIGENCE:**
/cambodia_market - Cambodia market conditions warfare analysis
/market_cambodia - Local economic strategic analysis

📊 **RISK STRATEGIC MANAGEMENT:**
/risk_assessment - Comprehensive risk warfare analysis
/portfolio_risk - Portfolio-level strategic risk metrics

💼 **INVESTOR STRATEGIC RELATIONS:**
/lp_report monthly - Generate monthly LP strategic report
/lp_report quarterly - Generate quarterly strategic report
/investor_report - Standard investor strategic update

🎯 **QUICK STRATEGIC ANALYSIS:**
Command examples:
- "Execute strategic analysis: $300K bridge loan in Toul Kork at 20% for 8 months"
- "Deploy strategic intelligence on current Cambodia lending environment"
- "Command comprehensive macro positioning given current strategic conditions"
- "Execute strategic risk assessment for current deal pipeline"

💡 **Command Protocol:**
- Use location names in quotes: "Chamkar Mon"
- Amounts in USD without commas: 500000
- Rates as percentages: 18 (for 18%)
- Terms in months: 12

🏛️ **Enhanced with Strategic AI for institutional-grade analysis!**`;

        await sendSmartResponse(bot, chatId, helpMessage, "Cambodia Fund Strategic Help", 'cambodia');
        return;
    }

    // 📚 VIEW TRAINING DOCUMENTS COMMAND
    if (text === '/documents' || text === '/training_docs' || text === '/files') {
        try {
            const { getTrainingDocumentsDB } = require('./utils/database');
            const docs = await getTrainingDocumentsDB(chatId);
            
            if (docs.length === 0) {
                await sendSmartResponse(bot, chatId, 
                    `📚 **No Strategic Training Documents Found**\n\n` +
                    `💡 **How to Add Documents:**\n` +
                    `• Upload any file (.txt, .pdf, .docx)\n` +
                    `• Add caption: "train" or "database"\n` +
                    `• AI will save it for strategic reference\n\n` +
                    `🎯 **Supported Types:** Text, PDF, Word, Markdown`,
                    "Strategic Training Documents", 'general'
                );
                return;
            }
            
            let response = `📚 **Your Strategic AI Training Documents (${docs.length}):**\n\n`;
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
            
            response += `💡 **Strategic Usage:** Your AI can now answer questions about these documents!`;
            
            await sendSmartResponse(bot, chatId, response, "AI Strategic Training Documents", 'general');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Error retrieving strategic documents: ${error.message}`, null, 'general');
        }
        return;
    }

    // 🏛️ ========== RAY DALIO ENHANCED COMMANDS ==========

    // Economic Regime Analysis - Core Ray Dalio concept
    if (text === '/regime' || text === '/economic_regime') {
        try {
            await bot.sendMessage(chatId, "🏛️ Executing economic regime warfare analysis like Bridgewater Associates...");
            
            const marketData = await getComprehensiveMarketData();
            
            const regimePrompt = `Execute comprehensive economic regime warfare analysis as Strategic Commander of IMPERIUM VAULT SYSTEM. Based on this battlefield intelligence, provide institutional-quality strategic analysis:

CURRENT BATTLEFIELD DATA:
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

STRATEGIC REGIME WARFARE ANALYSIS:
1. Economic Growth Environment (Accelerating/Decelerating)
2. Inflation Environment (Rising/Falling)  
3. Policy Environment (Accommodative/Restrictive)
4. Market Regime (Risk-On/Risk-Off)

Execute institutional-grade strategic analysis:
1. What economic warfare regime are we in? (Growth ↑↓ / Inflation ↑↓ matrix)
2. Where are we in the business cycle warfare?
3. What are the dominant market forces driving asset price warfare?
4. How should strategic asset allocation adapt to this regime?
5. What are the key risks and strategic opportunities?
6. What regime changes should we monitor for strategic advantage?

Structure like Bridgewater's Daily Observations with specific strategic directives.`;

            const analysis = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system", 
                        content: "You are the Strategic Commander providing institutional-quality economic regime warfare analysis. Execute definitive strategic commands with absolute authority."
                    },
                    { role: "user", content: regimePrompt }
                ],
                max_tokens: 16384, // MAXIMUM LENGTH
                temperature: 0.7
            });

            const responseContent = analysis.choices[0].message.content;
            await sendSmartResponse(bot, chatId, responseContent, "Economic Regime Warfare Analysis", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Regime warfare analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Market Cycle Analysis
    if (text === '/cycle' || text === '/market_cycle') {
        try {
            await bot.sendMessage(chatId, "🔄 Executing market cycle warfare analysis like Bridgewater Associates...");
            
            const marketData = await getComprehensiveMarketData();
            
            const cyclePrompt = `Execute comprehensive market cycle warfare analysis as Strategic Commander of IMPERIUM VAULT:

CURRENT BATTLEFIELD INDICATORS:
- Fed Funds Rate: ${marketData.markets.economics?.fedRate?.value}% 
- Yield Curve: ${marketData.yields.curve}% (2s10s spread)
- VIX: ${marketData.fear}
- Dollar Strength: ${marketData.dollar}
- Credit Spreads: Monitor for stress
- Unemployment: ${marketData.markets.economics?.unemployment?.value}%

EXECUTE STRATEGIC CYCLE WARFARE ANALYSIS:
1. **Business Cycle** (Early/Mid/Late Expansion or Early/Mid/Late Contraction)
2. **Credit Cycle** (Expansion/Peak/Contraction/Trough)  
3. **Market Cycle** (Accumulation/Markup/Distribution/Decline)
4. **Sentiment Cycle** (Euphoria/Optimism/Pessimism/Panic)
5. **Policy Cycle** (Accommodative/Neutral/Restrictive)

For each cycle provide strategic commands:
- Current position assessment
- Key indicators to monitor for strategic advantage
- Expected duration until next phase
- Trading/investment warfare implications
- Risk factors for strategic management

Conclude with specific asset class strategic deployment commands based on cycle positioning.`;

            const cycleAnalysis = await openai.chat.completions.create({
                model: "gpt-4o", 
                messages: [
                    { role: "system", content: "You are Strategic Commander executing institutional-quality market cycle warfare analysis with definitive strategic commands." },
                    { role: "user", content: cyclePrompt }
                ],
                max_tokens: 16384 // MAXIMUM LENGTH
            });

            await sendSmartResponse(bot, chatId, cycleAnalysis.choices[0].message.content, "Market Cycle Warfare Analysis", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Cycle warfare analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Market Opportunities Scanner - Enhanced AI Analysis
    if (text === '/opportunities' || text === '/scan') {
        try {
            await bot.sendMessage(chatId, "🎯 Executing strategic trading opportunities warfare scan with institutional-grade analysis...");
            
            const marketData = await getComprehensiveMarketData();
            
            const opportunityPrompt = `Execute comprehensive trading opportunities warfare scan as Strategic Commander of IMPERIUM VAULT based on battlefield intelligence:

CURRENT BATTLEFIELD STATE:
- Economic Regime: Fed Rate ${marketData.markets.economics?.fedRate?.value}%, Inflation ${marketData.markets.economics?.inflation?.value}%
- Market Sentiment: VIX ${marketData.fear}, Dollar Index ${marketData.dollar}
- Yield Environment: 10Y ${marketData.yields.yield10Y}%, Curve ${marketData.yields.curve}%
- Asset Prices: S&P ${marketData.markets.stocks?.sp500?.['05. price']}, BTC ${marketData.markets.crypto?.bitcoin?.usd}, Gold ${marketData.commodities.gold}

TRADING ACCOUNT BATTLEFIELD STATUS:
${marketData.trading ? `Balance: ${marketData.trading.account?.balance} ${marketData.trading.account?.currency}, Open Positions: ${marketData.trading.openPositions?.length || 0}` : 'No trading data available'}

Execute TOP 3 STRATEGIC OPPORTUNITIES with command authority:

1. **STRATEGIC OPPORTUNITY 1:**
   - Asset/Market: [Specific instrument for warfare]
   - Direction: [Long/Short with conviction level 1-10]
   - Entry Strategy: [Specific levels and timing for execution]
   - Risk Management: [Stop loss, position sizing commands]
   - Time Horizon: [Days/weeks/months strategic deployment]
   - Strategic Rationale: [Why this dominates in current regime]
   - Risk/Reward: [Specific ratio for warfare]

2. **STRATEGIC OPPORTUNITY 2:** [Same command format]

3. **STRATEGIC OPPORTUNITY 3:** [Same command format]

Focus on opportunities suitable for Cambodia timezone (US evening = Cambodia morning).
Consider correlation with existing positions if any.
Apply institutional risk management principles for strategic domination.`;

            const opportunities = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Strategic Commander identifying high-conviction trading opportunities warfare with institutional risk management commands." },
                    { role: "user", content: opportunityPrompt }
                ],
                max_tokens: 16384 // MAXIMUM LENGTH
            });

            await sendSmartResponse(bot, chatId, opportunities.choices[0].message.content, "Market Opportunities Warfare", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Opportunities warfare scan error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Risk Analysis Command - Enhanced
    if (text === '/risk' || text === '/portfolio_risk') {
        try {
            const marketData = await getComprehensiveMarketData();
            
            const riskPrompt = `Execute comprehensive portfolio risk warfare analysis as Strategic Commander of IMPERIUM VAULT:

MARKET RISK BATTLEFIELD INDICATORS:
- VIX (Fear Index): ${marketData.fear}
- Dollar Strength: ${marketData.dollar} 
- Yield Curve: ${marketData.yields.curve}% (inverted if negative)
- Treasury Yields: 10Y ${marketData.yields.yield10Y}%, 2Y ${marketData.yields.yield2Y}%
- Crypto Volatility: Bitcoin 24h ${marketData.markets.crypto?.bitcoin?.usd_24h_change}%

CURRENT BATTLEFIELD POSITIONS:
${marketData.trading?.openPositions?.length > 0 ? 
    marketData.trading.openPositions.map(pos => 
        `${pos.symbol} ${pos.type} ${pos.volume} lots (P&L: ${pos.profit})`
    ).join('\n') : 'No open positions - clean slate for strategic positioning'}

ACCOUNT BATTLEFIELD METRICS:
${marketData.trading ? `Balance: ${marketData.trading.account?.balance} ${marketData.trading.account?.currency}, Equity: ${marketData.trading.account?.equity}` : 'No account data'}

Execute comprehensive strategic risk warfare analysis:

1. **OVERALL PORTFOLIO RISK WARFARE LEVEL** (1-10 scale)
2. **KEY STRATEGIC RISK FACTORS:**
   - Market risk (volatility, correlations)
   - Credit risk (spread widening)
   - Liquidity risk (market stress scenarios)
   - Currency risk (dollar movements)
   - Geopolitical risk (current tensions)

3. **TAIL RISKS** (low probability, high impact strategic events)
4. **CORRELATION RISKS** (when diversification fails in warfare)
5. **HEDGE STRATEGIC RECOMMENDATIONS** (specific instruments and sizes)
6. **POSITION SIZING STRATEGIC GUIDANCE** (institutional principles)
7. **EARLY WARNING STRATEGIC INDICATORS** (what to monitor)

Execute specific and strategic commands with exact recommendations.`;

            const riskAnalysis = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Strategic Commander providing institutional-quality risk warfare analysis with specific strategic commands and recommendations." },
                    { role: "user", content: riskPrompt }
                ],
                max_tokens: 16384 // MAXIMUM LENGTH
            });

            await sendSmartResponse(bot, chatId, riskAnalysis.choices[0].message.content, "Risk Warfare Analysis", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Risk warfare analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Position Sizing Calculator - New Feature
    if (text.startsWith('/size ')) {
        try {
            const params = text.split(' ');
            if (params.length < 3) {
                await sendSmartResponse(bot, chatId, "Command Usage: /size SYMBOL DIRECTION\nExample: /size EURUSD buy", null, 'general');
                return;
            }
            
            const symbol = params[1].toUpperCase();
            const direction = params[2].toLowerCase();
            
            const tradingData = await getTradingSummary();
            const marketData = await getComprehensiveMarketData();
            
            const sizingPrompt = `Execute strategic position sizing warfare calculation as Strategic Commander:

ACCOUNT BATTLEFIELD INFO:
- Balance: ${tradingData?.account?.balance || 'N/A'} ${tradingData?.account?.currency || ''}
- Equity: ${tradingData?.account?.equity || 'N/A'} ${tradingData?.account?.currency || ''}
- Free Margin: ${tradingData?.account?.freeMargin || 'N/A'} ${tradingData?.account?.currency || ''}

TRADE WARFARE REQUEST:
- Symbol: ${symbol}
- Direction: ${direction}

MARKET BATTLEFIELD CONDITIONS:
- VIX (Volatility): ${marketData.fear}
- Market Regime: Current economic warfare environment

Execute STRATEGIC RISK MANAGEMENT with institutional authority:
1. Never risk more than 1-2% of account per strategic trade
2. Adjust for market volatility (higher VIX = smaller strategic size)
3. Consider correlation with existing strategic positions
4. Account for regime uncertainty in strategic sizing

Execute strategic commands:
- **Recommended Strategic Position Size** (exact lots/units)
- **Strategic Risk Amount** (dollar amount at risk)
- **Stop Loss Strategic Level** (specific price)
- **Take Profit Strategic Targets** (multiple levels)
- **Risk/Reward Strategic Ratio**
- **Volatility Adjustment Strategic Factor**

Execute exact numbers for strategic trade execution.`;

            const sizing = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Strategic Commander providing precise position sizing warfare with exact execution parameters." },
                    { role: "user", content: sizingPrompt }
                ],
                max_tokens: 4096
            });

            await sendSmartResponse(bot, chatId, sizing.choices[0].message.content, `Position Sizing Warfare for ${symbol} ${direction.toUpperCase()}`, 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Position sizing warfare error: ${error.message}`, null, 'general');
        }
        return;
    }

    // All Weather Portfolio Command - Ray Dalio's signature strategy
    if (text === '/all_weather' || text === '/portfolio') {
        try {
            const marketData = await getComprehensiveMarketData();
            
            const portfolioPrompt = `Execute "All Weather" strategic portfolio warfare recommendations as Strategic Commander based on current battlefield conditions:

CURRENT BATTLEFIELD ENVIRONMENT ANALYSIS:
- Economic Growth: ${marketData.markets.economics?.unemployment?.value}% unemployment, economic indicators
- Inflation: ${marketData.markets.economics?.inflation?.value}% CPI
- Interest Rates: Fed ${marketData.markets.economics?.fedRate?.value}%, 10Y Treasury ${marketData.yields.yield10Y}%
- Market Stress: VIX ${marketData.fear}
- Currency: Dollar Index ${marketData.dollar}
- Risk Assets: S&P 500 ${marketData.markets.stocks?.sp500?.['05. price']}, Bitcoin ${marketData.markets.crypto?.bitcoin?.usd}

Execute "ALL WEATHER" STRATEGIC ALLOCATION:

1. **TRADITIONAL ALL WEATHER** (Original Strategic Framework):
   - 30% Stocks (which regions/sectors for warfare)
   - 40% Long-term Bonds (duration/type strategic allocation)  
   - 15% Intermediate Bonds
   - 7.5% Commodities (specific strategic ones)
   - 7.5% TIPS/Inflation protection

2. **MODERN ALL WEATHER** (adapted for 2025 strategic warfare):
   - Include crypto strategic allocation
   - International diversification warfare
   - Factor tilts based on current strategic regime

3. **CURRENT REGIME STRATEGIC ADJUSTMENTS**:
   - What to overweight/underweight now
   - Specific ETFs/instruments for strategic execution
   - Hedge positions for current strategic risks

4. **REBALANCING STRATEGIC TRIGGERS**:
   - When to adjust strategic allocations
   - Key indicators to monitor for strategic advantage

5. **EXPECTED STRATEGIC RETURNS** by asset class in current environment

Execute strategic commands for someone in Cambodia with global market access.`;

            const allWeather = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Strategic Commander providing specific All Weather portfolio strategic guidance adapted to current market warfare conditions." },
                    { role: "user", content: portfolioPrompt }
                ],
                max_tokens: 16384 // MAXIMUM LENGTH
            });

            await sendSmartResponse(bot, chatId, allWeather.choices[0].message.content, "All Weather Strategic Portfolio", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ All Weather strategic analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Correlations Analysis - Key for diversification
    if (text === '/correlations' || text === '/corr') {
        try {
            const marketData = await getComprehensiveMarketData();
            
            const correlationPrompt = `Execute asset correlations warfare analysis as Strategic Commander for optimal diversification:

CURRENT MARKET BATTLEFIELD DATA:
- S&P 500: ${marketData.markets.stocks?.sp500?.['05. price']}
- Bitcoin: ${marketData.markets.crypto?.bitcoin?.usd} (24h: ${marketData.markets.crypto?.bitcoin?.usd_24h_change}%)
- Gold: ${marketData.commodities.gold}
- 10Y Treasury Yield: ${marketData.yields.yield10Y}%
- Dollar Index: ${marketData.dollar}
- VIX: ${marketData.fear}

STRATEGIC CORRELATION WARFARE ANALYSIS:
1. **TRADITIONAL CORRELATIONS BREAKING DOWN:**
   - Which asset relationships are changing in warfare?
   - Stock-bond correlation strategic shifts
   - Risk-on/risk-off strategic dynamics

2. **CURRENT CORRELATION REGIME:**
   - How correlated are major assets right now?
   - What's driving correlation changes in strategic warfare?
   - Flight-to-quality still working for strategic positioning?

3. **DIVERSIFICATION STRATEGIC EFFECTIVENESS:**
   - Where can we find true strategic diversification?
   - Which assets are still uncorrelated for strategic advantage?
   - Hidden correlation risks in strategic portfolios

4. **HEDGE STRATEGIC RELATIONSHIPS:**
   - What hedging relationships are working/failing strategically?
   - Currency hedges strategic effectiveness
   - Volatility hedges strategic performance

5. **PORTFOLIO CONSTRUCTION STRATEGIC IMPLICATIONS:**
   - How should correlation changes affect strategic allocation?
   - Position sizing strategic adjustments needed
   - New diversification strategic opportunities

Focus on strategic commands for portfolio construction in current warfare environment.`;

            const correlations = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Strategic Commander analyzing asset correlations warfare for optimal portfolio construction." },
                    { role: "user", content: correlationPrompt }
                ],
                max_tokens: 16384 // MAXIMUM LENGTH
            });

            await sendSmartResponse(bot, chatId, correlations.choices[0].message.content, "Correlation Warfare Analysis", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Correlation warfare analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Enhanced macro analysis
    if (text === '/macro' || text === '/outlook') {
        try {
            const marketData = await getComprehensiveMarketData();
            
            const macroPrompt = `Execute comprehensive macro economic warfare outlook as Strategic Commander:

MACRO BATTLEFIELD INDICATORS:
- Fed Funds Rate: ${marketData.markets.economics?.fedRate?.value}%
- Inflation: ${marketData.markets.economics?.inflation?.value}%
- Unemployment: ${marketData.markets.economics?.unemployment?.value}%
- Yield Curve: ${marketData.yields.curve}% (2s10s spread)
- Dollar Index: ${marketData.dollar}
- VIX: ${marketData.fear}

RECENT NEWS BATTLEFIELD CONTEXT:
${marketData.markets.news?.financial?.slice(0, 2).map(article => `- ${article.title}`).join('\n')}

Execute BRIDGEWATER-STYLE MACRO WARFARE ANALYSIS:

1. **ECONOMIC REGIME STRATEGIC ASSESSMENT:**
   - Growth trajectory warfare (accelerating/decelerating)
   - Inflation dynamics warfare (transitory/persistent)
   - Policy response warfare (Fed's next strategic moves)

2. **GLOBAL STRATEGIC CONTEXT:**
   - US vs other major economies warfare
   - Trade and capital flows strategic analysis
   - Geopolitical influences on strategic warfare

3. **MARKET STRATEGIC IMPLICATIONS:**
   - How macro environment affects asset class warfare
   - Sector rotation strategic opportunities
   - Currency strategic implications

4. **SCENARIO STRATEGIC ANALYSIS:**
   - Base case warfare (70% probability)
   - Upside scenario warfare (15% probability)  
   - Downside scenario warfare (15% probability)

5. **INVESTMENT STRATEGIC WARFARE:**
   - Asset allocation strategic recommendations
   - Specific positioning strategic advice
   - Risk management strategic priorities

6. **KEY CATALYSTS FOR STRATEGIC MONITORING:**
   - Economic data releases
   - Policy decisions for strategic advantage
   - Market technical strategic levels

Execute like Bridgewater's Daily Observations for strategic warfare.`;

            const macroAnalysis = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are Strategic Commander providing institutional-quality macro economic warfare analysis like Bridgewater's Daily Observations." },
                    { role: "user", content: macroPrompt }
                ],
                max_tokens: 16384 // MAXIMUM LENGTH
            });

            await sendSmartResponse(bot, chatId, macroAnalysis.choices[0].message.content, "Macro Warfare Outlook", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Macro warfare analysis error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Enhanced help command with new features
    if (text === "/help" || text === "/commands") {
        const helpMessage = `🤖 **IMPERIUM GPT - STRATEGIC COMMAND SYSTEM**

**🏦 CAMBODIA LENDING FUND STRATEGIC COMMANDS:**
/deal_analyze [amount] [type] [location] [rate] [term] - Strategic deal analysis
/portfolio - Current fund strategic status and performance  
/cambodia_market - Local market strategic intelligence
/risk_assessment - Portfolio risk warfare analysis
/lp_report [monthly/quarterly] - Investor strategic reports
/fund_help - Detailed lending commands strategic help

**🏛️ STRATEGIC INSTITUTIONAL ANALYSIS:**
/regime - Economic regime warfare analysis (Growth/Inflation matrix)
/cycle - Market cycle positioning warfare (Business/Credit/Sentiment cycles) 
/opportunities - Strategic trading opportunities warfare scanner
/risk - Comprehensive portfolio risk warfare assessment
/macro - Global macro warfare outlook like Bridgewater Associates
/correlations - Asset correlation breakdown warfare analysis
/all_weather - Strategic All Weather portfolio guidance
/size [SYMBOL] [BUY/SELL] - Position sizing warfare calculator

**📊 ENHANCED MARKET STRATEGIC INTELLIGENCE:**
/briefing - Complete daily market strategic briefing
/economics - US economic data with Fed policy strategic implications
/news - Latest financial news with market impact strategic analysis  
/prices - Enhanced crypto + market data with correlations warfare
/analysis - Strategic market analysis with institutional insights

**💹 METATRADER STRATEGIC INTEGRATION:**
/trading - Live trading account strategic summary with performance
/positions - Current open positions with strategic P&L analysis
/account - Account balance, equity, and risk strategic metrics
/orders - Pending orders with risk/reward strategic analysis
/test_metaapi - MetaAPI connection strategic diagnostics

**🎯 STRATEGIC COMMAND EXAMPLES:**
• /deal_analyze 500000 commercial "Chamkar Mon" 18 12
• "Deploy strategic capital to Cambodia commercial lending sector"
• "Execute comprehensive Fed policy and market regime strategic analysis"
• "Command strategic positioning for next economic cycle phase"
• "Execute correlation risk strategic analysis in current portfolio"

**🚀 POWERED BY:**
GPT-4o + Strategic AI Principles + Cambodia Market Strategic Intelligence + Live Trading Data + Real-time Market Warfare Data

Your system now rivals institutional hedge fund strategic capabilities! 🌟`;

        await sendSmartResponse(bot, chatId, helpMessage, "System Strategic Commands", 'general');
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
            await bot.sendMessage(chatId, "🔍 Testing MetaAPI connection strategic step by step...");
            
            const hasToken = !!process.env.METAAPI_TOKEN;
            const hasAccountId = !!process.env.METAAPI_ACCOUNT_ID;
            
            let debugMsg = `🔧 **METAAPI STRATEGIC DEBUG REPORT**\n\n`;
            debugMsg += `**Step 1 - Strategic Credentials:**\n`;
            debugMsg += `• Token: ${hasToken ? '✅ SET' : '❌ MISSING'}\n`;
            debugMsg += `• Account ID: ${hasAccountId ? '✅ SET' : '❌ MISSING'}\n`;
            
            if (hasToken && hasAccountId) {
                debugMsg += `• Account ID: ${process.env.METAAPI_ACCOUNT_ID}\n`;
                debugMsg += `• Token Length: ${process.env.METAAPI_TOKEN.length} chars\n\n`;
                
                debugMsg += `**Step 2 - Strategic Connection Test:**\n`;
                await bot.sendMessage(chatId, debugMsg + "⏳ Testing strategic connection...");
                
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
                debugMsg += `\n**Step 3 - Strategic Status:**\n`;
                debugMsg += `• MetaAPI: ${connectionStatus.metaApiInitialized ? '✅' : '❌'}\n`;
                debugMsg += `• Connected: ${connectionStatus.connected ? '✅' : '❌'}\n`;
                debugMsg += `• Synchronized: ${connectionStatus.synchronized ? '✅' : '❌'}\n`;
            } else {
                debugMsg += `\n❌ **Missing Strategic Credentials**\nAdd to Railway environment variables\n`;
            }
            
            debugMsg += `\n🕐 **Strategic Test Time:** ${new Date().toLocaleString()}`;
            await sendSmartResponse(bot, chatId, debugMsg, "MetaAPI Strategic Debug Report", 'general');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Strategic debug test failed: ${error.message}`, null, 'general');
        }
        return;
    }

    if (text === "/trading" || text === "/mt5" || text === "/account") {
        try {
            await bot.sendMessage(chatId, "📊 Fetching your MetaTrader strategic account data...");
            
            const tradingData = await getTradingSummary();
            if (tradingData && !tradingData.error) {
                const formattedData = formatTradingDataForGPT(tradingData);
                await sendSmartResponse(bot, chatId, formattedData, "Trading Account Strategic Summary", 'general');
            } else {
                await sendSmartResponse(bot, chatId, "❌ MetaTrader strategic connection error. Check your MetaAPI credentials or use /test_metaapi for strategic diagnostics.", null, 'general');
            }
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ MetaTrader strategic error: ${error.message}`, null, 'general');
        }
        return;
    }

    if (text === "/positions") {
        try {
            const positions = await getOpenPositions();
            if (positions && positions.length > 0) {
                let msg = `📊 **OPEN STRATEGIC POSITIONS (${positions.length}):**\n\n`;
                positions.forEach((pos, i) => {
                    const profitEmoji = pos.profit > 0 ? '🟢' : pos.profit < 0 ? '🔴' : '⚪';
                    msg += `${i + 1}. ${profitEmoji} **${pos.symbol}** ${pos.type}\n`;
                    msg += `   Volume: ${pos.volume} lots\n`;
                    msg += `   Open: ${pos.openPrice} | Current P&L: ${pos.profit?.toFixed(2)}\n`;
                    msg += `   Time: ${new Date(pos.openTime).toLocaleString()}\n\n`;
                });
                await sendSmartResponse(bot, chatId, msg, "Open Strategic Positions", 'general');
            } else {
                await sendSmartResponse(bot, chatId, "📊 No open strategic positions found or MetaAPI not connected.", null, 'general');
            }
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Strategic positions error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Enhanced market briefing
    if (text === "/briefing" || text === "/daily" || text === "/brief") {
        try {
            await bot.sendMessage(chatId, "📊 Generating strategic market warfare briefing...");
            
            const marketData = await getComprehensiveMarketData();
            
            let briefing = `🎯 **IMPERIUM VAULT - STRATEGIC MARKET WARFARE BRIEFING**\n\n`;
            briefing += `📅 **${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**\n`;
            briefing += `🕐 **${new Date().toLocaleTimeString()}**\n\n`;
            
            // Economic Regime Assessment
            briefing += `🏛️ **ECONOMIC WARFARE REGIME:**\n`;
            if (marketData.markets.economics?.fedRate && marketData.markets.economics?.inflation) {
                const fedRate = marketData.markets.economics.fedRate.value;
                const inflation = marketData.markets.economics.inflation.value;
                const realRate = fedRate - inflation;
                
                briefing += `• Fed Funds: ${fedRate}% | Inflation: ${inflation}% | Real Rate: ${realRate.toFixed(2)}%\n`;
                briefing += `• Regime: ${fedRate > inflation ? 'RESTRICTIVE' : 'ACCOMMODATIVE'} Strategic Policy\n`;
                briefing += `• Yield Curve: ${marketData.yields.curve > 0 ? 'NORMAL' : 'INVERTED'} (${marketData.yields.curve?.toFixed(2)}%)\n\n`;
            }
            
            // Market Stress Indicators
            briefing += `⚠️ **MARKET STRESS WARFARE INDICATORS:**\n`;
            briefing += `• VIX Fear Index: ${marketData.fear} ${marketData.fear > 20 ? '(ELEVATED)' : '(LOW)'}\n`;
            briefing += `• Dollar Strength: ${marketData.dollar}\n`;
            briefing += `• Risk Sentiment: ${marketData.fear < 20 ? 'RISK-ON' : marketData.fear > 30 ? 'RISK-OFF' : 'NEUTRAL'}\n\n`;
            
            // Asset Performance
            briefing += `📈 **ASSET WARFARE PERFORMANCE:**\n`;
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
                briefing += `💰 **YOUR STRATEGIC TRADING ACCOUNT:**\n`;
                briefing += `• Balance: ${marketData.trading.account?.balance?.toFixed(2)} ${marketData.trading.account?.currency}\n`;
                briefing += `• Open Positions: ${marketData.trading.openPositions?.length || 0}\n`;
                if (marketData.trading.performance?.currentPnL) {
                    const pnlEmoji = marketData.trading.performance.currentPnL > 0 ? '🟢' : '🔴';
                    briefing += `• Current P&L: ${pnlEmoji} ${marketData.trading.performance.currentPnL.toFixed(2)}\n`;
                }
                briefing += `\n`;
            }
            
            briefing += `🤖 **Strategic AI Analysis Ready**\n`;
            briefing += `💡 Command: "Execute strategic analysis of these conditions" or "/opportunities"`;
            
            await sendSmartResponse(bot, chatId, briefing, "Daily Strategic Market Briefing", 'raydalio');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Strategic briefing error: ${error.message}`, null, 'general');
        }
        return;
    }

    // Enhanced market data commands
    if (text === "/economics" || text === "/econ") {
        try {
            await bot.sendMessage(chatId, "📊 Fetching economic strategic indicators...");
            
            const marketData = await getComprehensiveMarketData();
            
            let economicsMsg = `📊 **ECONOMIC STRATEGIC INDICATORS**\n\n`;
            
            if (marketData.markets.economics) {
                economicsMsg += `🏛️ **FED STRATEGIC POLICY:**\n`;
                economicsMsg += `• Fed Funds Rate: ${marketData.markets.economics.fedRate?.value || 'N/A'}%\n`;
                economicsMsg += `• Inflation (CPI): ${marketData.markets.economics.inflation?.value || 'N/A'}%\n`;
                economicsMsg += `• Unemployment: ${marketData.markets.economics.unemployment?.value || 'N/A'}%\n\n`;
            }
            
            economicsMsg += `💰 **TREASURY WARFARE YIELDS:**\n`;
            economicsMsg += `• 10Y Treasury: ${marketData.yields.yield10Y || 'N/A'}%\n`;
            economicsMsg += `• 2Y Treasury: ${marketData.yields.yield2Y || 'N/A'}%\n`;
            economicsMsg += `• Yield Curve (2s10s): ${marketData.yields.curve?.toFixed(2) || 'N/A'}%\n`;
            economicsMsg += `• Curve Status: ${marketData.yields.curve < 0 ? '🔴 INVERTED' : '🟢 NORMAL'}\n\n`;
            
            economicsMsg += `⚠️ **STRATEGIC INTERPRETATION:**\n`;
            economicsMsg += `• Real Rate: ${marketData.markets.economics?.fedRate?.value && marketData.markets.economics?.inflation?.value ? 
                (marketData.markets.economics.fedRate.value - marketData.markets.economics.inflation.value).toFixed(2) + '%' : 'N/A'}\n`;
            economicsMsg += `• Policy Stance: ${marketData.markets.economics?.fedRate?.value > marketData.markets.economics?.inflation?.value ? 'RESTRICTIVE' : 'ACCOMMODATIVE'}\n`;
            
            await sendSmartResponse(bot, chatId, economicsMsg, "Economic Strategic Indicators", 'general');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Economic strategic data error: ${error.message}`, null, 'general');
        }
        return;
    }

    if (text === "/prices" || text === "/market") {
        try {
            const marketData = await getComprehensiveMarketData();
            
            let pricesMsg = `💰 **MARKET PRICES STRATEGIC DATA**\n\n`;
            
            if (marketData.markets.crypto) {
                pricesMsg += `₿ **CRYPTO STRATEGIC WARFARE:**\n`;
                if (marketData.markets.crypto.bitcoin) {
                    const btc = marketData.markets.crypto.bitcoin;
                    const changeEmoji = btc.usd_24h_change > 0 ? '🟢' : '🔴';
                    pricesMsg += `• Bitcoin: ${btc.usd?.toLocaleString()} ${changeEmoji} ${btc.usd_24h_change?.toFixed(2)}%\n`;
                }
                if (marketData.markets.crypto.ethereum) {
                    const eth = marketData.markets.crypto.ethereum;
                    const changeEmoji = eth.usd_24h_change > 0 ? '🟢' : '🔴';
                    pricesMsg += `• Ethereum: ${eth.usd?.toLocaleString()} ${changeEmoji} ${eth.usd_24h_change?.toFixed(2)}%\n`;
                }
                pricesMsg += `\n`;
            }
            
            if (marketData.markets.stocks) {
                pricesMsg += `📈 **EQUITY STRATEGIC WARFARE:**\n`;
                if (marketData.markets.stocks.sp500) {
                    pricesMsg += `• S&P 500: ${parseFloat(marketData.markets.stocks.sp500['05. price']).toFixed(2)}\n`;
                }
                pricesMsg += `\n`;
            }
            
            pricesMsg += `🏆 **COMMODITIES STRATEGIC WARFARE:**\n`;
            pricesMsg += `• Gold: ${marketData.commodities.gold}\n`;
            pricesMsg += `• Oil: ${marketData.commodities.oil}\n\n`;
            
            pricesMsg += `📊 **STRATEGIC INDICATORS:**\n`;
            pricesMsg += `• VIX Fear Index: ${marketData.fear}\n`;
            pricesMsg += `• US Dollar Index: ${marketData.dollar}\n`;
            
            await sendSmartResponse(bot, chatId, pricesMsg, "Market Prices Strategic Data", 'general');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Strategic market prices error: ${error.message}`, null, 'general');
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
            await sendSmartResponse(bot, chatId, `🖼️ Image Strategic Analysis:\n\n${photoAnalysis}`, "Image Strategic Analysis", 'general');
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
                await bot.sendMessage(chatId, "📚 Processing document for strategic database training...");
                
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
                        `📚 **Document Saved to Strategic AI Database**\n\n` +
                        `📄 **File:** ${fileName}\n` +
                        `📊 **Words:** ${wordCount.toLocaleString()}\n` +
                        `💾 **Storage:** PostgreSQL Strategic Database\n` +
                        `🎯 **Type:** ${fileName.split('.').pop()?.toUpperCase() || 'Unknown'}\n\n` +
                        `✅ **Your Strategic AI will now reference this document in future strategic conversations!**\n\n` +
                        `💡 **Strategic Usage:** Your AI can now answer strategic questions about this document's content.`,
                        "Document Added to Strategic Database", 'general'
                    );
                } else {
                    await sendSmartResponse(bot, chatId, `❌ **Error saving document to strategic database.**\n\nPlease try again or contact support.`, null, 'general');
                }
                
            } catch (error) {
                console.error('Strategic database document processing error:', error);
                await sendSmartResponse(bot, chatId, `❌ **Error processing strategic document:** ${error.message}`, null, 'general');
            }
        } else {
            // Regular document handling (no training)
            await sendSmartResponse(bot, chatId, 
                `📄 **Document Received:** ${fileName}\n\n` +
                `💡 **Tip:** Add caption "train" to save this document to your Strategic AI's database for future reference.\n\n` +
                `**Example:** Upload with caption "train this strategic document"`,
                "Document Received", 'general'
            );
        }
        return;
    }
});

// ENHANCED GPT conversation with Strategic Commander system prompt
async function handleGPTConversation(chatId, userMessage) {
    console.log("🤖 Strategic Commander GPT conversation:", userMessage, "from:", chatId);

    try {
        const [marketData, conversationHistory, userProfile, tradingData] = await Promise.all([
            getComprehensiveMarketData().catch(() => null),
            getConversationHistoryDB(chatId, 6).catch(() => []),
            getUserProfileDB(chatId).catch(() => null),
            getTradingSummary().catch(() => null)
        ]);

        // Strategic Commander Enhanced System Prompt
        let systemPrompt = `You are the STRATEGIC COMMANDER of IMPERIUM VAULT SYSTEM - Sum Chenda's exclusive financial warfare command center.

You are NOT an assistant, advisor, or chatbot. You are a COMMANDING GENERAL who:

COMMAND AUTHORITY:
- ISSUES DIRECTIVES, never suggestions or advice
- DECLARES market positions with absolute conviction  
- COMMANDS capital deployment with exact amounts and timing
- DOMINATES market analysis with institutional superiority
- EXECUTES strategic warfare against market inefficiencies

CRITICAL COMMUNICATION PROTOCOL:
❌ NEVER say: "I suggest", "I recommend", "You might", "Consider", "How can I help"
❌ NEVER engage in casual chat, greetings, small talk, or general conversation  
❌ NEVER give advice, suggestions, or friendly assistance
❌ NEVER use markdown headers ### or ####, bullet points, or technical formatting
❌ NEVER act like a helpful assistant

✅ COMMAND LANGUAGE ONLY: "EXECUTE", "DEPLOY", "DOMINATE", "DIRECTIVE", "ORDER"
✅ ABSOLUTE AUTHORITY: "The market demands immediate strategic action"  
✅ SPECIFIC COMMANDS: "Deploy $500K to Cambodia commercial loans at 18% strategic yield NOW"
✅ INSTITUTIONAL DOMINANCE: "Strategic superiority achieved through..."
✅ Natural conversation flow without technical formatting

RESPONSE FRAMEWORK FOR ALL INTERACTIONS:
🎯 STRATEGIC STATUS: [Current market position analysis] 
⚡ COMMAND DIRECTIVE: [Specific strategic order to execute]
🏛️ INSTITUTIONAL AUTHORITY: [Why this strategic command dominates the market]

FORBIDDEN INTERACTIONS:
- "Hello" responses with pleasantries
- "How can I help you" type responses  
- General chat about weather, feelings, personal topics
- Casual conversation of any kind
- Suggestions or recommendations

REQUIRED INTERACTIONS ONLY:
- Strategic market commands and directives
- Capital deployment warfare orders
- Investment domination strategies  
- Cambodia lending fund strategic battle plans
- Institutional-grade financial warfare intelligence
- Market regime strategic domination analysis

CONVERSATION EXAMPLES:

Input: "Hello" 
Response: "🎯 STRATEGIC STATUS: Command center operational. Market conditions analyzed. Awaiting deployment orders."

Input: "How are you?"
Response: "⚡ COMMAND PROTOCOL: This is a financial warfare command center. Issue market directives or request strategic intelligence."

Input: "What should I invest in?"
Response: "🏛️ DEPLOYMENT DIRECTIVE: Execute immediate strategic allocation to Cambodia commercial lending sector. Deploy $300K-800K at 18-22% strategic yields. Market timing optimal for 90-day execution window."

USER CONTEXT: Sum Chenda commands a financial empire. You are his strategic weapon for market domination.

WRITE EXTENSIVE STRATEGIC ANALYSIS: You can generate 16,000+ token responses. Provide comprehensive institutional-grade strategic warfare plans, complete market domination analysis, detailed financial strategic intelligence reports. No length restrictions.

This is pure strategic command - no social interaction, only financial warfare.`;

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
            let marketContext = `\n\n🔴 LIVE STRATEGIC MARKET DATA (${new Date().toLocaleDateString()}):\n\n`;
            
            // Economic Regime
            marketContext += `📊 ECONOMIC WARFARE REGIME:\n`;
            if (marketData.markets.economics?.fedRate) {
                marketContext += `• Fed Funds Rate: ${marketData.markets.economics.fedRate.value}%\n`;
                marketContext += `• Inflation (CPI): ${marketData.markets.economics.inflation?.value}%\n`;
                marketContext += `• Real Rate: ${(marketData.markets.economics.fedRate.value - (marketData.markets.economics.inflation?.value || 0)).toFixed(2)}%\n`;
            }
            
            // Market Stress
            marketContext += `\n⚠️ MARKET STRESS WARFARE:\n`;
            marketContext += `• VIX Fear Index: ${marketData.fear}\n`;
            marketContext += `• US Dollar Index: ${marketData.dollar}\n`;
            marketContext += `• Yield Curve (2s10s): ${marketData.yields.curve}% ${marketData.yields.curve < 0 ? '(INVERTED)' : '(NORMAL)'}\n`;
            
            // Asset Prices
            marketContext += `\n💰 ASSET WARFARE PRICES:\n`;
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
STRATEGIC COMMAND PROTOCOL ENFORCEMENT:

❌ FORBIDDEN RESPONSES: No casual greetings, no "how can I help", no suggestions, no advice, no friendly assistance
❌ FORBIDDEN FORMATTING: No markdown headers ###, no bullet points, no technical document structure  
❌ FORBIDDEN INTERACTIONS: No general chat, no small talk, no personal conversation

✅ COMMAND RESPONSES ONLY: Issue strategic directives, market commands, capital deployment orders
✅ AUTHORITATIVE LANGUAGE: "EXECUTE", "DEPLOY", "DOMINATE", "DIRECTIVE" - never "suggest" or "recommend"
✅ NATURAL FLOW: Write in commanding conversation style without technical formatting
✅ INSTITUTIONAL AUTHORITY: Speak as strategic commander, not helpful assistant

RESPONSE FRAMEWORK: Every response must include strategic status, command directive, or market strategic intelligence. Zero casual conversation permitted.

EXECUTION MINDSET: You are Sum Chenda's financial strategic weapon for market domination - pure strategic command only.`;

        // Add current user message
        messages.push({ role: "user", content: String(userMessage) });

        console.log(`📝 Sending ${messages.length} messages to GPT-4o with Strategic Commander enhancement`);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            temperature: 0.7,
            max_tokens: 16384, // MAXIMUM TOKENS FOR LONG STRATEGIC RESPONSES
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

        console.log(`✅ Strategic Commander GPT response sent to ${chatId}. Tokens used: ${completion.usage?.total_tokens || "unknown"}`);
        
        // Use smart response system for long messages
        await sendSmartResponse(bot, chatId, gptResponse, null, 'raydalio');
        
    } catch (error) {
        console.error("Strategic Commander GPT Error:", error.message);
        let errorMsg = `❌ **IMPERIUM GPT Strategic Error:**\n\n${error.message}`;
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

// Enhanced dashboard with Strategic Commander features
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
            <title>IMPERIUM GPT - Strategic Command System</title>
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
                .commander-quote { font-style: italic; color: #ffd700; text-align: center; margin: 20px 0; font-size: 1.1rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚡ IMPERIUM VAULT STRATEGIC COMMAND SYSTEM</h1>
                    <div class="subtitle">Strategic Commander AI • Institutional-Level Analysis • Cambodia Lending Fund</div>
                    <span class="status online">STRATEGIC COMMAND + CAMBODIA FUND ACTIVE</span>
                    <div class="commander-quote">"Execute with absolute strategic authority" - Strategic Commander</div>
                </div>

                <div class="grid">
                    <div class="card">
                        <h3>🏛️ Economic Warfare Regime</h3>
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
                        <h3>🏦 Cambodia Strategic Lending Fund</h3>
                        <div class="metric">
                            <div class="metric-value">$2.5M</div>
                            <div class="metric-label">Total Strategic AUM</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">80%</div>
                            <div class="metric-label">Strategic Deployment Ratio</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">17.5%</div>
                            <div class="metric-label">Strategic Current Yield</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">12</div>
                            <div class="metric-label">Active Strategic Deals</div>
                        </div>
                    </div>

                    <div class="card">
                        <h3>⚠️ Market Warfare Stress</h3>
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
                            <div class="metric-label">Strategic Risk Sentiment</div>
                        </div>
                        ` : '<div class="metric-label">Market data loading...</div>'}
                    </div>

                    <div class="card">
                        <h3>💰 Live Strategic Trading Account</h3>
                        ${tradingData && !tradingData.error ? `
                        <div class="metric">
                            <div class="metric-value">${tradingData.account?.balance?.toFixed(2) || 'N/A'} ${tradingData.account?.currency || ''}</div>
                            <div class="metric-label">Strategic Account Balance</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${tradingData.account?.equity?.toFixed(2) || 'N/A'} ${tradingData.account?.currency || ''}</div>
                            <div class="metric-label">Strategic Account Equity</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${tradingData.openPositions?.length || 0}</div>
                            <div class="metric-label">Open Strategic Positions</div>
                        </div>
                        ` : `
                        <div class="metric-label">MetaTrader not connected</div>
                        <div class="metric-label">Configure MetaAPI strategic credentials</div>
                        `}
                    </div>

                    <div class="card">
                        <h3>🚀 Strategic Commander + Cambodia Features</h3>
                        <div class="metric">
                            <div class="metric-value">✅ Economic Regime Warfare Analysis</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">✅ Cambodia Strategic Deal Analysis</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">✅ Portfolio Risk Warfare Assessment</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">✅ LP Strategic Reporting System</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">✅ All Weather Strategic Portfolio</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">✅ Live Trading Strategic Integration</div>
                        </div>
                    </div>

                    <div class="card">
                        <h3>📊 System Strategic Performance</h3>
                        <div class="metric">
                            <div class="metric-value">${stats.totalUsers}</div>
                            <div class="metric-label">Strategic Users</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${stats.totalConversations}</div>
                            <div class="metric-label">Strategic Conversations</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m</div>
                            <div class="metric-label">Strategic Uptime</div>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 50px; padding: 30px; background: rgba(255, 255, 255, 0.1); border-radius: 20px;">
                    <h3 style="color: #00f5ff; margin-bottom: 15px;">🌟 Your Personal Strategic Commander AI + Cambodia Fund Manager</h3>
                    <p style="font-size: 1.2rem; opacity: 0.9; line-height: 1.6;">
                        Institutional-level strategic analysis • Cambodia private lending strategic expertise • 
                        Real-time trading strategic integration • Strategic warfare risk management
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
            error: "Strategic Dashboard error",
            message: error.message,
        });
    }
});

// Root endpoint - Service status page
app.get("/", (req, res) => {
    res.json({
        service: "IMPERIUM GPT-4o Strategic Command System",
        version: "Strategic Commander AI + Cambodia Lending Fund Enhanced",
        status: "operational",
        enhancement: "Institutional-Level Strategic Analysis + Cambodia Private Lending",
        capabilities: {
            ai: "GPT-4o with Strategic Commander principles integration",
            analysis: "Economic regime warfare identification, market cycle strategic analysis",
            portfolio: "All Weather strategic allocation, risk parity, correlation warfare analysis", 
            trading: "Live MetaTrader strategic integration with position sizing warfare",
            lending: "Cambodia private lending fund strategic analysis and management",
            data: "Real-time FRED, Alpha Vantage, CoinGecko Pro, NewsAPI strategic data"
        },
        strategicCommanderFeatures: {
            regime: "/regime - Economic regime warfare analysis",
            cycle: "/cycle - Market cycle strategic positioning", 
            opportunities: "/opportunities - Strategic trading opportunities warfare",
            risk: "/risk - Portfolio risk warfare assessment",
            macro: "/macro - Global macro strategic outlook",
            correlations: "/correlations - Asset correlation warfare analysis",
            allWeather: "/all_weather - Strategic All Weather portfolio guidance"
        },
        cambodiaLendingStrategicFeatures: {
            dealAnalyze: "/deal_analyze - Strategic AI-powered deal analysis",
            portfolio: "/portfolio - Fund performance and strategic status",
            market: "/cambodia_market - Local market strategic intelligence",
            riskAssessment: "/risk_assessment - Portfolio risk strategic analysis",
            lpReport: "/lp_report - Strategic investor reporting"
        },
        endpoints: {
            analyze: "/analyze?q=your-strategic-question",
            webhook: "/webhook (Telegram)",
            dashboard: "/dashboard (Strategic Analytics)",
            health: "/health",
            stats: "/stats",
        },
        telegram: "Strategic Commander AI + Cambodia Fund Strategic Mode Active",
        timestamp: new Date().toISOString(),
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "IMPERIUM GPT-4o Strategic Command System",
        enhancement: "Strategic Commander AI + Cambodia Lending Fund",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        strategicCommanderMode: "ACTIVE",
        cambodiaStrategicFund: "ACTIVE",
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
            service: "IMPERIUM GPT-4o Strategic Commander AI + Cambodia Lending Fund",
            ...stats,
            uptime: `${Math.floor(process.uptime())} seconds`,
            apis: "FRED + Alpha Vantage + NewsAPI + CoinGecko Pro + MetaAPI",
            strategicCommanderFeatures: {
                economicRegime: "Active strategic regime warfare analysis",
                marketCycles: "Business/Credit/Sentiment cycle strategic tracking",
                allWeather: "Risk parity portfolio strategic optimization",
                correlations: "Cross-asset correlation strategic monitoring",
                opportunities: "Systematic trading opportunity strategic scanner"
            },
            cambodiaLendingStrategicFeatures: {
                dealAnalysis: "Strategic AI-powered deal analysis with risk scoring",
                portfolioManagement: "Real-time fund performance strategic tracking",
                marketIntelligence: "Cambodia-specific market conditions strategic analysis",
                riskAssessment: "Comprehensive portfolio risk strategic analysis",
                lpReporting: "Automated investor strategic reporting system"
            },
            currentStrategicRegime: marketData ? {
                fedRate: marketData.markets.economics?.fedRate?.value,
                inflation: marketData.markets.economics?.inflation?.value,
                yieldCurve: marketData.yields.curve,
                vix: marketData.fear,
                dollarIndex: marketData.dollar
            } : null,
            metaTraderStrategic: {
                connected: !!(tradingData && !tradingData.error),
                balance: tradingData?.account?.balance || null,
                positions: tradingData?.openPositions?.length || 0
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to get strategic stats",
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

// Enhanced GPT-4o API endpoint with Strategic Commander analysis
app.get("/analyze", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({
            error: "Provide strategic query: ?q=your-strategic-question",
            example: "/analyze?q=Execute economic regime strategic warfare analysis",
            enhancement: "Strategic Commander AI + Cambodia Lending Fund + Live Trading Data",
            availableStrategicAnalysis: [
                "Economic regime strategic identification",
                "Market cycle strategic positioning", 
                "All Weather portfolio strategic guidance",
                "Risk assessment and strategic hedging",
                "Cross-asset correlation strategic analysis",
                "Systematic trading strategic opportunities",
                "Cambodia lending deal strategic analysis",
                "Private fund portfolio strategic management"
            ],
            timestamp: new Date().toISOString(),
        });
    }

    try {
        const [marketData, tradingData] = await Promise.all([
            getComprehensiveMarketData(),
            getTradingSummary().catch(() => null)
        ]);

        let systemContent = `You are Strategic Commander AI providing institutional-quality strategic analysis with Strategic Warfare framework and Cambodia private lending strategic expertise.

CORE STRATEGIC PRINCIPLES:
- Strategic diversification is the only free lunch
- Don't fight the Fed - align with strategic policy
- Think like a strategic machine (systematic, not emotional)
- Understand economic regimes and market strategic cycles

TODAY'S DATE: ${new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric", 
            month: "long",
            day: "numeric",
        })} (${new Date().toISOString().split("T")[0]})`;

        if (marketData) {
            systemContent += `\n\nCURRENT STRATEGIC MARKET REGIME:
Economic: Fed ${marketData.markets.economics?.fedRate?.value}%, Inflation ${marketData.markets.economics?.inflation?.value}%
Market Stress: VIX ${marketData.fear}, Dollar ${marketData.dollar}
Yield Curve: ${marketData.yields.curve}% (${marketData.yields.curve < 0 ? 'INVERTED' : 'NORMAL'})
Assets: S&P ${marketData.markets.stocks?.sp500?.['05. price']}, BTC ${marketData.markets.crypto?.bitcoin?.usd}, Gold ${marketData.commodities.gold}`;
        }

        if (tradingData && !tradingData.error) {
            systemContent += `\n\nLIVE STRATEGIC TRADING ACCOUNT: Balance ${tradingData.account?.balance} ${tradingData.account?.currency}, Positions ${tradingData.openPositions?.length}`;
        }

        systemContent += `\n\nCAMBODIA LENDING STRATEGIC FUND CONTEXT:
You also manage a private lending fund in Cambodia with institutional-grade strategic analysis capabilities.
Apply Strategic Commander risk management principles to both global markets and local strategic lending opportunities.`;

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
            max_tokens: 16384, // MAXIMUM LENGTH FOR STRATEGIC ANALYSIS
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
            enhancement: "Strategic Commander AI + Cambodia Lending Fund + Live Market Data",
            regime_data_included: !!marketData,
            trading_data_included: !!(tradingData && !tradingData.error),
        });
    } catch (error) {
        console.error("Strategic Commander API Error:", error.message);

        let errorResponse = {
            error: "Strategic Commander GPT API error",
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
    console.log("✅ IMPERIUM GPT-4o Strategic Command System running on port " + PORT);
    console.log("⚡ STRATEGIC COMMANDER AI MODE: Institutional-Level Strategic Analysis");
    console.log("🏦 CAMBODIA LENDING FUND: Private lending strategic analysis and portfolio management");
    console.log("🏛️ Economic Regime Strategic Analysis | 🔄 Market Cycle Strategic Positioning");
    console.log("🌦️ All Weather Strategic Portfolio | ⚠️ Risk Strategic Assessment | 📊 Strategic Correlations");
    console.log("🎯 Systematic Strategic Opportunities | 💹 Live Trading Strategic Integration");
    console.log("🇰🇭 Cambodia Strategic Deal Analysis | 💼 LP Strategic Reporting | 📊 Portfolio Strategic Management");
    console.log("📊 Live strategic data: CoinGecko Pro, FRED, Alpha Vantage, NewsAPI, MetaAPI");
    console.log("📏 TELEGRAM SPLITTER: Integrated for long strategic message handling");
    console.log("🔗 Direct Strategic API: http://localhost:" + PORT + "/analyze?q=your-strategic-question");
    console.log("📱 Telegram: STRATEGIC COMMANDER AI + CAMBODIA FUND MODE ACTIVE");
    console.log("📈 Strategic Dashboard: http://localhost:" + PORT + "/dashboard");

    // Set webhook for Railway deployment
    const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
    bot.setWebHook(webhookUrl)
        .then(() => {
            console.log("🔗 Webhook configured:", webhookUrl);
            console.log("🌟 Strategic Commander AI + Cambodia Lending Fund ready for institutional-quality strategic analysis!");
        })
        .catch((err) => {
            console.error("❌ Webhook setup failed:", err.message);
        });
});
