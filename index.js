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

// ✅ Initialize OpenAI API (GPT-5 ENHANCED) - OPTIMIZED FOR MAXIMUM LENGTH
const openai = new OpenAI({ 
    apiKey: openaiKey,
    timeout: 120000, // 120 second timeout for GPT-5 reasoning
    maxRetries: 3
});

// 🚀 GPT-5 Configuration Settings
const GPT5_CONFIG = {
    model: "gpt-5", // Primary GPT-5 model
    fallbackModel: "gpt-5-mini", // Fallback for high-volume scenarios
    maxTokens: 16384, // Maximum for comprehensive responses
    temperature: 0.7,
    reasoningEffort: "medium", // minimal, low, medium, high
    verbosity: "medium", // low, medium, high for response length control
    enableThinking: true // Enable GPT-5's thinking mode for complex analysis
};

// 🤖 Enhanced GPT-5 API Helper Function
async function callGPT5(messages, options = {}) {
    const config = {
        model: options.useFullModel ? GPT5_CONFIG.model : (options.useMini ? GPT5_CONFIG.fallbackModel : GPT5_CONFIG.model),
        messages: messages,
        max_tokens: options.maxTokens || GPT5_CONFIG.maxTokens,
        temperature: options.temperature || GPT5_CONFIG.temperature,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
    };

    // Add GPT-5 specific parameters
    if (options.reasoningEffort) {
        config.reasoning_effort = options.reasoningEffort;
    }
    
    if (options.verbosity) {
        config.verbosity = options.verbosity;
    }

    try {
        console.log(`🤖 Calling ${config.model} with ${messages.length} messages`);
        return await openai.chat.completions.create(config);
    } catch (error) {
        console.error(`❌ GPT-5 API Error: ${error.message}`);
        
        // Fallback to mini if main model fails
        if (config.model === GPT5_CONFIG.model && !options.useMini) {
            console.log("🔄 Falling back to GPT-5 mini...");
            return await callGPT5(messages, { ...options, useMini: true });
        }
        throw error;
    }
}

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
        const welcomeMessage = `⚡ **IMPERIUM VAULT STRATEGIC COMMAND SYSTEM - GPT-5 POWERED**

This is your exclusive financial warfare command center with GPT-5 institutional-grade intelligence.

**🚀 POWERED BY GPT-5:**
- 45% fewer factual errors than GPT-4o
- Advanced reasoning with thinking mode
- Enhanced tool coordination capabilities
- Superior strategic analysis with reduced hallucination
- Enhanced instruction following and problem-solving

**🎯 STRATEGIC COMMAND PROTOCOLS:**
- No casual conversation - Strategic directives only
- Pure financial warfare intelligence powered by GPT-5
- Maximum 16,000+ word strategic reports with advanced reasoning
- Cambodia lending fund operations with institutional analysis
- Live trading account integration with GPT-5 intelligence

**🏦 CAMBODIA LENDING FUND OPERATIONS (GPT-5 ENHANCED):**
/deal_analyze [amount] [type] [location] [rate] [term] - GPT-5 strategic deal analysis
/portfolio - Fund performance command status with GPT-5 insights
/cambodia_market - Local market intelligence briefing (GPT-5 powered)
/risk_assessment - Comprehensive risk warfare analysis (GPT-5 enhanced)
/lp_report [monthly/quarterly] - Investor command reports (GPT-5 generated)
/fund_help - Cambodia operations command help

**🏛️ MARKET DOMINATION COMMANDS (GPT-5 INSTITUTIONAL ANALYSIS):**
/regime - Economic regime warfare analysis (GPT-5 reasoning mode)
/cycle - Market cycle domination positioning (GPT-5 enhanced)
/opportunities - Strategic trading command scanner (GPT-5 powered)
/risk - Portfolio warfare risk assessment (GPT-5 institutional grade)
/macro - Global domination macro intelligence (GPT-5 Bridgewater-style)
/correlations - Asset correlation warfare analysis (GPT-5 advanced)
/all_weather - Strategic portfolio allocation commands (GPT-5 optimized)

**💹 LIVE TRADING OPERATIONS (GPT-5 INTEGRATION):**
/trading - Live account strategic status with GPT-5 analysis
/positions - Current position warfare analysis (GPT-5 enhanced)
/size [SYMBOL] [BUY/SELL] - Position sizing command calculator (GPT-5 powered)
/account - Account balance and performance warfare metrics

**📊 MARKET INTELLIGENCE OPERATIONS (GPT-5 SUPERIOR ANALYSIS):**
/briefing - Complete strategic market briefing (GPT-5 comprehensive)
/economics - Economic intelligence with Fed warfare analysis (GPT-5)
/prices - Enhanced market data with correlation warfare (GPT-5)
/analysis - Strategic market analysis with institutional predictions (GPT-5)

**🎯 GPT-5 ENHANCED COMMAND EXAMPLES:**
- /deal_analyze 500000 commercial "Chamkar Mon" 18 12
- "Deploy capital to Cambodia commercial lending sector with GPT-5 analysis"
- "Execute comprehensive macro economic warfare analysis using GPT-5 reasoning"
- "Command strategic portfolio risk assessment with GPT-5 institutional intelligence"
- "GPT-5 analyze current market regime and provide strategic deployment directives"

**🌟 GPT-5 STRATEGIC ADVANTAGES:**
- Superior accuracy in financial analysis
- Advanced reasoning for complex strategic decisions
- Enhanced understanding of market dynamics
- Reduced hallucination in critical financial assessments
- Institutional-grade strategic intelligence

**Chat ID:** ${chatId}
**Status:** ⚡ GPT-5 STRATEGIC COMMAND MODE ACTIVE`;

await sendSmartResponse(bot, chatId, welcomeMessage, null, 'general');
console.log("✅ GPT-5 Strategic command system message sent");
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

// 🏦 GPT-5 STRATEGIC PORTFOLIO STATUS COMMAND
if (text === '/portfolio' || text === '/fund_status') {
    try {
        await bot.sendMessage(chatId, "📊 Activating GPT-5 Portfolio Status Analysis Protocol...");

        // 🔧 Example fund data – replace with live values from database
        const sampleFundData = {
            totalAUM: 2500000,
            deployedCapital: 2000000,
            availableCapital: 500000,
            activeDeals: 12,
            currentYield: 17.5
        };

        const portfolio = await getPortfolioStatus(sampleFundData); // ⚙️ Ensure this calls GPT-5 inside

        if (portfolio.error) {
            await sendSmartResponse(bot, chatId, `❌ Portfolio analysis error: ${portfolio.error}`, null, 'general');
            return;
        }

        // 🧠 STRATEGIC OUTPUT CONSTRUCTION
        let response = `🏦 **CAMBODIA LENDING FUND — STRATEGIC STATUS REPORT**\n\n`;

        response += `💼 **FUND OVERVIEW:**\n`;
        response += `• Total AUM: $${portfolio.fundOverview.totalAUM.toLocaleString()}\n`;
        response += `• Deployed Capital: $${portfolio.fundOverview.deployedCapital.toLocaleString()}\n`;
        response += `• Available Capital: $${portfolio.fundOverview.availableCapital.toLocaleString()}\n`;
        response += `• Deployment Ratio: ${portfolio.fundOverview.deploymentRatio.toFixed(1)}%\n`;
        response += `• Active Deals: ${portfolio.fundOverview.numberOfDeals}\n`;
        response += `• Avg Deal Size: $${portfolio.fundOverview.averageDealSize.toLocaleString()}\n\n`;

        response += `📈 **PERFORMANCE METRICS:**\n`;
        response += `• Current Yield: ${portfolio.performance.currentYieldRate.toFixed(2)}%\n`;
        response += `• Target Yield: ${portfolio.performance.targetYieldRate}%\n`;
        response += `• Δ vs Target: ${portfolio.performance.actualVsTarget > 0 ? '+' : ''}${portfolio.performance.actualVsTarget.toFixed(1)}%\n`;
        response += `• Risk-Adj Return: ${portfolio.performance.riskAdjustedReturn.toFixed(2)}%\n`;
        response += `• Monthly Income: $${portfolio.performance.monthlyIncome.toLocaleString()}\n`;
        response += `• Annualized Return: ${portfolio.performance.annualizedReturn.toFixed(2)}%\n\n`;

        response += `⚠️ **RISK METRICS:**\n`;
        response += `• Concentration Risk: ${portfolio.riskMetrics.concentrationRisk}\n`;
        response += `• Default Rate: ${portfolio.riskMetrics.defaultRate.toFixed(2)}%\n`;
        response += `• Portfolio VaR: ${portfolio.riskMetrics.portfolioVaR.toFixed(1)}%\n`;
        response += `• Diversification: ${portfolio.riskMetrics.diversificationScore}/100\n`;
        response += `• Liquidity: ${portfolio.riskMetrics.liquidity}\n\n`;

        response += `🌍 **GEO ALLOCATION:**\n`;
        response += `• Phnom Penh: ${portfolio.geographicAllocation.phnomPenh.toFixed(1)}%\n`;
        response += `• Sihanoukville: ${portfolio.geographicAllocation.sihanoukville.toFixed(1)}%\n`;
        response += `• Siem Reap: ${portfolio.geographicAllocation.siemReap.toFixed(1)}%\n`;
        response += `• Other: ${portfolio.geographicAllocation.other.toFixed(1)}%\n\n`;

        response += `🏗️ **SECTOR ALLOCATION:**\n`;
        response += `• Commercial: ${portfolio.sectorAllocation.commercial.toFixed(1)}%\n`;
        response += `• Residential: ${portfolio.sectorAllocation.residential.toFixed(1)}%\n`;
        response += `• Development: ${portfolio.sectorAllocation.development.toFixed(1)}%\n`;
        response += `• Bridge: ${portfolio.sectorAllocation.bridge.toFixed(1)}%\n\n`;

        response += `📊 **STRATEGIC ALIGNMENT (Ray Dalio Lens):**\n`;
        response += `• Diversification Score: ${portfolio.rayDalioPortfolioAnalysis.diversificationScore}/100\n`;
        response += `• Risk Parity Alignment: ${portfolio.rayDalioPortfolioAnalysis.riskParityAlignment}\n`;
        response += `• Macro Alignment: ${portfolio.rayDalioPortfolioAnalysis.macroAlignment}\n`;
        response += `• Regime Positioning: ${portfolio.rayDalioPortfolioAnalysis.regimePositioning}\n\n`;

        if (portfolio.recommendations.length > 0) {
            response += `🧠 **STRATEGIC DIRECTIVES:**\n`;
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

        await sendSmartResponse(bot, chatId, response, "Vault Portfolio Report — GPT-5 Analysis", 'cambodia');

    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ GPT-5 Portfolio command failure: ${error.message}`, null, 'general');
    }
    return;
}

// 🇰🇭 GPT-5 CAMBODIA MARKET STRATEGIC INTELLIGENCE COMMAND
if (text === '/cambodia_market' || text === '/market_cambodia') {
    try {
        await bot.sendMessage(chatId, "🇰🇭 Deploying GPT-5 Cambodia Market Intelligence Analysis...");

        const conditions = await getCambodiaMarketConditions();

        if (conditions.error) {
            await sendSmartResponse(bot, chatId, `❌ GPT-5 Market scan failed: ${conditions.error}`, null, 'general');
            return;
        }

        let response = `🇰🇭 **CAMBODIA MARKET STRATEGIC INTELLIGENCE — GPT-5 ANALYSIS**\n\n`;

        response += `📊 **ECONOMIC ENVIRONMENT:**\n`;
        response += `• GDP Growth: ${conditions.economicEnvironment.gdpGrowth}%\n`;
        response += `• Inflation: ${conditions.economicEnvironment.inflation}%\n`;
        response += `• USD/KHR Stability: ${conditions.economicEnvironment.currencyStability}\n`;
        response += `• Political Stability: ${conditions.economicEnvironment.politicalStability}\n`;
        response += `• Regulatory Environment: ${conditions.economicEnvironment.regulatoryEnvironment}\n\n`;

        response += `💰 **INTEREST RATE STRATEGY:**\n`;
        response += `• Commercial: ${conditions.interestRateEnvironment.commercialRates.commercial.min}-${conditions.interestRateEnvironment.commercialRates.commercial.max}% (avg: ${conditions.interestRateEnvironment.commercialRates.commercial.average}%)\n`;
        response += `• Bridge: ${conditions.interestRateEnvironment.commercialRates.bridge.min}-${conditions.interestRateEnvironment.commercialRates.bridge.max}% (avg: ${conditions.interestRateEnvironment.commercialRates.bridge.average}%)\n`;
        response += `• Development: ${conditions.interestRateEnvironment.commercialRates.development.min}-${conditions.interestRateEnvironment.commercialRates.development.max}% (avg: ${conditions.interestRateEnvironment.commercialRates.development.average}%)\n`;
        response += `• Strategic Trend: ${conditions.interestRateEnvironment.trendDirection}\n`;
        response += `• Fed Impact: ${conditions.interestRateEnvironment.fedImpact}\n\n`;

        response += `🏘️ **PROPERTY MARKET INTEL:**\n`;
        response += `• Phnom Penh Trend: ${conditions.propertyMarket.phnomPenhTrend}\n`;
        response += `• Demand vs Supply: ${conditions.propertyMarket.demandSupplyBalance}\n`;
        response += `• Foreign Investment: ${conditions.propertyMarket.foreignInvestment}\n`;
        response += `• Development Activity: ${conditions.propertyMarket.developmentActivity}\n`;
        response += `• Price Appreciation: ${conditions.propertyMarket.priceAppreciation}\n`;
        response += `• Liquidity: ${conditions.propertyMarket.liquidity}\n\n`;

        response += `🏦 **BANKING SECTOR OVERVIEW:**\n`;
        response += `• Liquidity: ${conditions.bankingSector.liquidityConditions}\n`;
        response += `• Credit Growth: ${conditions.bankingSector.creditGrowth}\n`;
        response += `• Competition: ${conditions.bankingSector.competitionLevel}\n`;
        response += `• Regulation: ${conditions.bankingSector.regulatoryChanges}\n\n`;

        response += `⚠️ **STRATEGIC RISK ZONES:**\n`;
        response += `• Political: ${conditions.riskFactors.politicalRisk}\n`;
        response += `• Economic: ${conditions.riskFactors.economicRisk}\n`;
        response += `• Currency: ${conditions.riskFactors.currencyRisk}\n`;
        response += `• Regulatory: ${conditions.riskFactors.regulatoryRisk}\n`;
        response += `• Market: ${conditions.riskFactors.marketRisk}\n\n`;

        response += `⏰ **MARKET CYCLE TIMING:**\n`;
        response += `• Current Phase: ${conditions.marketTiming.currentPhase}\n`;
        response += `• Time in Cycle: ${conditions.marketTiming.timeInCycle}\n`;
        response += `• Next Phase: ${conditions.marketTiming.nextPhaseExpected}\n`;
        response += `• Lending Window: ${conditions.marketTiming.timingForLending}\n\n`;

        if (conditions.opportunities?.length > 0) {
            response += `🎯 **TOP STRATEGIC OPPORTUNITIES:**\n`;
            conditions.opportunities.slice(0, 3).forEach(opp => {
                response += `• ${opp}\n`;
            });
            response += `\n`;
        }

        response += `📋 **SUMMARY BRIEF:**\n${conditions.summary}`;

        await sendSmartResponse(bot, chatId, response, "Cambodia Market Intelligence — GPT-5", 'cambodia');

    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ Cambodia market scan error: ${error.message}`, null, 'general');
    }
    return;
}

// 📊 GPT-5 PORTFOLIO RISK WARFARE COMMAND
if (text === '/risk_assessment' || text === '/portfolio_risk') {
    try {
        await bot.sendMessage(chatId, "📊 Deploying GPT-5 Risk Warfare Intelligence Scan...");

        // Simulated input (replace with live feed or DB pull)
        const samplePortfolioData = {
            totalValue: 2500000,
            numberOfDeals: 12,
            averageRate: 17.5,
            concentrationByLocation: { 'Phnom Penh': 0.7, 'Other': 0.3 },
            concentrationByType: { 'commercial': 0.5, 'bridge': 0.3, 'development': 0.2 }
        };

        const riskAssessment = await performRiskAssessment(samplePortfolioData);

        if (riskAssessment.error) {
            await sendSmartResponse(bot, chatId, `❌ GPT-5 Risk Scan Failed: ${riskAssessment.error}`, null, 'general');
            return;
        }

        let response = `📊 **PORTFOLIO STRATEGIC RISK WARFARE — GPT-5 ANALYSIS**\n\n`;

        response += `⚠️ **CORE RISK INTELLIGENCE METRICS:**\n`;
        response += `• Overall Risk Score: ${riskAssessment.portfolioRisk.overallRiskScore}/100\n`;
        response += `• Concentration Risk: ${riskAssessment.portfolioRisk.concentrationRisk}\n`;
        response += `• Credit Risk: ${riskAssessment.portfolioRisk.creditRisk}\n`;
        response += `• Market Risk: ${riskAssessment.portfolioRisk.marketRisk}\n`;
        response += `• Liquidity Risk: ${riskAssessment.portfolioRisk.liquidityRisk}\n`;
        response += `• Operational Risk: ${riskAssessment.portfolioRisk.operationalRisk}\n`;
        response += `• Regulatory Risk: ${riskAssessment.portfolioRisk.regulatoryRisk}\n\n`;

        response += `🏛️ **RAY DALIO RISK MODEL INSIGHTS:**\n`;
        response += `• Diversification Score: ${riskAssessment.rayDalioRiskAnalysis.diversificationEffectiveness}\n`;
        response += `• Correlation Risk Zones: ${riskAssessment.rayDalioRiskAnalysis.correlationRisks}\n`;
        response += `• Risk Parity Alignment: ${riskAssessment.rayDalioRiskAnalysis.riskParityAlignment}\n\n`;

        response += `🧪 **STRESS TEST SIMULATIONS:**\n`;
        response += `• Economic Downturn Impact: ${riskAssessment.stressTesting.economicDownturn}% loss\n`;
        response += `• Interest Rate Shock Impact: ${riskAssessment.stressTesting.interestRateShock}%\n`;
        response += `• Default Scenario Damage: ${riskAssessment.stressTesting.defaultScenarios}%\n`;
        response += `• Liquidity Crisis Behavior: ${riskAssessment.stressTesting.liquidityCrisis}\n\n`;

        response += `🚨 **EARLY WARNING SIGNALS:**\n`;
        response += `• Macro Alerts: ${riskAssessment.earlyWarning.macroIndicators}\n`;
        response += `• Portfolio Alerts: ${riskAssessment.earlyWarning.portfolioIndicators}\n`;
        response += `• Market Signals: ${riskAssessment.earlyWarning.marketIndicators}\n\n`;

        response += `📏 **RISK LIMIT ENFORCEMENT ZONE:**\n`;
        response += `• Current Utilization: ${riskAssessment.riskLimits.currentUtilization}%\n`;
        response += `• Violations Detected: ${riskAssessment.riskLimits.violations.length}\n\n`;

        if (riskAssessment.riskActionItems?.length > 0) {
            response += `🎯 **GPT-5 ACTION PROTOCOLS:**\n`;
            riskAssessment.riskActionItems.slice(0, 3).forEach(item => {
                response += `• ${item}\n`;
            });
        }

        await sendSmartResponse(bot, chatId, response, "Portfolio Risk Warfare — GPT-5", 'cambodia');

    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ Risk Warfare Error: ${error.message}`, null, 'general');
    }
    return;
}

// 💼 GPT-5 LP STRATEGIC REPORT SYSTEM
if (text.startsWith('/lp_report') || text === '/investor_report') {
    try {
        await bot.sendMessage(chatId, "💼 Deploying GPT-5 LP Strategic Investor Intelligence...");

        const reportType = text.includes('monthly') ? 'monthly' :
                          text.includes('quarterly') ? 'quarterly' : 'monthly';

        const report = await generateLPReport(reportType);

        if (report?.error) {
            await sendSmartResponse(bot, chatId, `❌ Report Generation Failed: ${report.error}`, null, 'general');
            return;
        }

        let response = `💼 **${report.reportType.toUpperCase()} LP STRATEGIC REPORT — GPT-5 MODE**\n\n`;

        response += `📅 **REPORT PERIOD:** ${report.reportPeriod}\n`;
        response += `🆔 **REPORT ID:** ${report.reportId}\n\n`;

        response += `📋 **EXECUTIVE SUMMARY:**\n${report.executiveSummary.fundPerformance}\n\n`;

        response += `💰 **FINANCIAL WARFARE METRICS:**\n`;
        response += `• Period Return: ${report.financialPerformance.returns.periodReturn.toFixed(2)}%\n`;
        response += `• Annualized Return: ${report.financialPerformance.returns.annualizedReturn.toFixed(2)}%\n`;
        response += `• Target vs Actual: ${report.financialPerformance.returns.targetVsActual > 0 ? '+' : ''}${report.financialPerformance.returns.targetVsActual.toFixed(1)}%\n`;
        response += `• Risk-Adjusted Return: ${report.financialPerformance.returns.riskAdjustedReturn.toFixed(2)}%\n\n`;

        response += `📈 **INCOME BREAKDOWN:**\n`;
        response += `• Interest: ${report.financialPerformance.income.interestIncome.toLocaleString()}\n`;
        response += `• Fees: ${report.financialPerformance.income.fees.toLocaleString()}\n`;
        response += `• Total Income: ${report.financialPerformance.income.totalIncome.toLocaleString()}\n\n`;

        response += `🚀 **DEPLOYMENT METRICS:**\n`;
        response += `• Capital Deployed: ${report.financialPerformance.deploymentMetrics.capitalDeployed.toLocaleString()}\n`;
        response += `• Deployment Ratio: ${report.financialPerformance.deploymentMetrics.deploymentRatio.toFixed(1)}%\n`;
        response += `• Pipeline Value: ${report.financialPerformance.deploymentMetrics.pipelineDeal.toLocaleString()}\n\n`;

        response += `🗺️ **PORTFOLIO WARFARE ALLOCATION:**\n`;
        response += `• Diversification Score: ${report.portfolioAnalytics.diversification.score}/100\n`;
        response += `• Active Deals: ${report.portfolioAnalytics.dealMetrics.numberOfDeals}\n`;
        response += `• Avg Deal Size: ${report.portfolioAnalytics.dealMetrics.averageDealSize.toLocaleString()}\n`;
        response += `• Avg Rate: ${report.portfolioAnalytics.dealMetrics.averageRate.toFixed(2)}%\n\n`;

        response += `⚠️ **RISK ZONE REPORTING:**\n`;
        response += `• Overall Risk Score: ${report.riskReporting.overallRisk}/100\n`;
        response += `• Stress Tests: ${Object.keys(report.riskReporting.stressTestResults).length} scenarios\n\n`;

        response += `🇰🇭 **MARKET COMMENTARY — CAMBODIA:**\n`;
        response += `${report.marketCommentary.cambodiaMarket}\n\n`;

        response += `🔮 **FORWARD OUTLOOK:**\n`;
        response += `• Pipeline Focus: ${report.forwardLooking.pipeline}\n`;
        response += `• Strategic Priority: ${report.forwardLooking.strategy}\n\n`;

        response += `📎 **Full Report ID:** ${report.reportId}\n`;
        response += `📊 **Command Dashboard:** Available upon request`;

        await sendSmartResponse(bot, chatId, response, "LP Strategic Investor Report — GPT-5 Mode", 'cambodia');

    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ LP Report System Error: ${error.message}`, null, 'general');
    }
    return;
}

// 🎯 GPT-5 CAMBODIA LENDING FUND COMMANDS HELP
if (text === '/fund_help' || text === '/lending_help') {
    const helpMessage = `🏦 **CAMBODIA LENDING FUND — STRATEGIC COMMANDS (GPT-5)**

🎯 **DEAL WARFARE INTELLIGENCE:**
/deal_analyze [amount] [type] [location] [rate] [term]  
• Example: /deal_analyze 500000 commercial "Chamkar Mon" 18 12

🏛 **FUND & PORTFOLIO GOVERNANCE:**
/portfolio — Fund performance and structure overview  
/fund_status — Capital deployment and operational metrics

📉 **RISK ZONE ANALYSIS:**
/risk_assessment — Full portfolio risk warfare simulation  
/portfolio_risk — Risk mapping and stress indicators

🇰🇭 **MARKET STRATEGIC INTEL:**
/cambodia_market — Cambodia macro-financial position  
/market_cambodia — Local lending environment

💼 **LP & INVESTOR RELATIONS:**
/lp_report monthly — Monthly LP intelligence briefing  
/lp_report quarterly — Quarterly performance warbook  
/investor_report — Compact LP update format

🚀 **QUICK INTELLIGENCE EXECUTION:**
Sample GPT-5 instructions:
• "Execute strategic analysis: $300K bridge loan in Toul Kork at 20% for 8 months"
• "Deploy capital intel for current Cambodia lending structure"
• "Run stress test on portfolio with $5M in Phnom Penh deals"
• "Give macro risk overview for 2025 Q4 conditions"

📎 **PROTOCOL REMINDERS:**
• Location in quotes → "Chamkar Mon"  
• No commas in amount → 500000  
• Rate as % only → 18  
• Term = months → 12

🔐 **COMMAND CENTER POWERED BY GPT-5 STRATEGIC AI**`;

    await sendSmartResponse(bot, chatId, helpMessage, "Cambodia Fund Strategic Commands", 'cambodia');
    return;
}

// 📚 GPT-5 DOCUMENT VIEWER — TRAINING INTELLIGENCE FILES
if (text === '/documents' || text === '/training_docs' || text === '/files') {
    try {
        const { getTrainingDocumentsDB } = require('./utils/database');
        const docs = await getTrainingDocumentsDB(chatId);

        if (docs.length === 0) {
            await sendSmartResponse(bot, chatId, 
                `📚 **NO TRAINING FILES FOUND IN INTELLIGENCE ARCHIVE**\n\n` +
                `🧠 **HOW TO UPLOAD:**\n` +
                `• Send any document (.txt, .pdf, .docx)\n` +
                `• Add caption: **train** or **database**\n` +
                `• The AI will automatically log, index, and train from it\n\n` +
                `🧩 **SUPPORTED TYPES:** Text, PDF, Word, Markdown\n\n` +
                `📈 Build your Strategic AI — document by document.`,
                "Strategic Intelligence Archive", 'general'
            );
            return;
        }

        let response = `📚 **TRAINING DOCUMENTS — GPT-5 INTELLIGENCE MODULES (${docs.length})**\n\n`;

        docs.forEach((doc, i) => {
            const uploadDate = new Date(doc.upload_date).toLocaleDateString();
            const fileType = doc.file_name.split('.').pop()?.toUpperCase() || 'Unknown';

            response += `**${i + 1}. ${doc.file_name}**\n`;
            response += `• 🧠 Words: ${doc.word_count?.toLocaleString() || 'Unknown'}\n`;
            response += `• 📅 Added: ${uploadDate}\n`;
            response += `• 📂 Format: ${fileType}\n`;
            if (doc.summary) {
                response += `• 🔍 Preview: ${doc.summary.substring(0, 100)}...\n`;
            }
            response += `\n`;
        });

        response += `🧠 **GPT-5 READY:** These files can now be queried for strategic answers and capital drills.`;

        await sendSmartResponse(bot, chatId, response, "AI Training Intelligence Files", 'general');

    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ Error retrieving documents: ${error.message}`, null, 'general');
    }
    return;
}

    // 🏛️ ========== RAY DALIO ENHANCED COMMANDS ==========

// 🏛️ ========== GPT-5 RAY DALIO STRATEGIC ECONOMIC REGIME ANALYSIS ==========
if (text === '/regime' || text === '/economic_regime') {
    try {
        await bot.sendMessage(chatId, "🏛️ Executing **economic regime warfare analysis** like Bridgewater Associates...");

        const marketData = await getComprehensiveMarketData();

        const regimePrompt = `🔍 EXECUTE: GPT-5 ECONOMIC REGIME WARFARE INTELLIGENCE  
You are the **Strategic Commander** of the IMPERIUM VAULT SYSTEM. Your task is to execute an institutional-grade macro regime assessment using Ray Dalio’s economic framework (growth, inflation, monetary policy, market mood).

—

🧠 CURRENT BATTLEFIELD INTELLIGENCE:
• Fed Funds Rate: ${marketData.markets.economics?.fedRate?.value}%  
• Inflation (CPI): ${marketData.markets.economics?.inflation?.value}%  
• Unemployment Rate: ${marketData.markets.economics?.unemployment?.value}%
• 10Y Treasury Yield: ${marketData.yields.yield10Y}%  
• 2Y Treasury Yield: ${marketData.yields.yield2Y}%  
• Yield Curve (2s10s): ${marketData.yields.curve}%  
• VIX Fear Index: ${marketData.fear}  
• US Dollar Index (DXY): ${marketData.dollar}  
• S&P 500: ${marketData.markets.stocks?.sp500?.['05. price']}  
• Bitcoin: ${marketData.markets.crypto?.bitcoin?.usd}  
• Gold Price: ${marketData.commodities.gold}

—

📊 STRATEGIC REGIME MATRIX:
1. Economic Growth = Accelerating / Decelerating  
2. Inflation = Rising / Falling  
3. Policy = Accommodative / Restrictive  
4. Market Regime = Risk-On / Risk-Off

—

🏛️ EXECUTE WARFARE INTELLIGENCE REPORT:
1. What economic regime are we in right now? (Use Growth/Inflation quadrant)  
2. Where are we in the business cycle? (Early / Late Expansion / Recession / Recovery)  
3. What are the dominant forces shaping asset class movement?  
4. What asset allocation shifts should be made now?  
5. What macro risks are rising?  
6. What regime signals should we monitor to anticipate major shifts?

—

Format your answer like **Bridgewater’s Daily Observations** — direct, institutional, sharp.`;

        const analysis = await callGPT5([
            {
                role: "system",
                content: "You are a macroeconomic warfare strategist. Respond as the Vault Commander trained in Bridgewater regime modeling and Codex intelligence."
            },
            {
                role: "user",
                content: regimePrompt
            }
        ], {
            useFullModel: true,
            reasoningEffort: "high",
            verbosity: "high",
            maxTokens: 16384,
            temperature: 0.7
        });

        const responseContent = analysis.choices[0].message.content;
        await sendSmartResponse(bot, chatId, responseContent, "📈 Economic Regime Warfare Analysis", 'raydalio');

    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ Regime warfare analysis error: ${error.message}`, null, 'general');
    }
    return;
}

// 🔄 ========== GPT-5 MARKET CYCLE WARFARE INTELLIGENCE ==========

if (text === '/cycle' || text === '/market_cycle') {
    try {
        await bot.sendMessage(chatId, "🔄 Executing **market cycle warfare analysis** using Ray Dalio framework and GPT-5 reasoning...");

        const marketData = await getComprehensiveMarketData();

        const cyclePrompt = `🔍 EXECUTE: GPT-5 MARKET CYCLE STRATEGIC INTELLIGENCE  
You are the **Strategic Commander** of the IMPERIUM VAULT SYSTEM.  
Analyze current cycle position using macroeconomic warfare models and institutional-grade intelligence.

—

🧠 CURRENT BATTLEFIELD INTELLIGENCE:
• Fed Funds Rate: ${marketData.markets.economics?.fedRate?.value}%  
• Yield Curve (2s10s): ${marketData.yields.curve}%  
• VIX (Fear Index): ${marketData.fear}  
• US Dollar Strength (DXY): ${marketData.dollar}  
• Unemployment Rate: ${marketData.markets.economics?.unemployment?.value}%  
• Credit Spread Commentary: Use latest intelligence — stress levels assumed rising

—

⚔️ EXECUTE WARFARE CYCLE ANALYSIS:
1. **Business Cycle** (Early / Mid / Late Expansion OR Early / Mid / Late Contraction)  
2. **Credit Cycle** (Expansion / Peak / Contraction / Trough)  
3. **Market Cycle** (Accumulation / Markup / Distribution / Decline)  
4. **Sentiment Cycle** (Euphoria / Optimism / Caution / Pessimism / Panic)  
5. **Policy Cycle** (Accommodative / Neutral / Restrictive)

—

📌 FOR EACH CYCLE, EXECUTE INTELLIGENCE:
• Current phase + reason  
• Indicators that confirm this position  
• Forecast to next phase: trigger points or leading signals  
• Implication for asset allocation, capital defense, or alpha attack  
• Risk warnings for strategic defense

—

🧭 FINAL ORDER:
Conclude with **actionable asset class deployment commands** across:
• Bonds / Treasuries  
• Equities (US / EM / Asia)  
• Commodities (Gold, Oil)  
• Crypto (BTC, ETH)  
• Private Credit / Lending Funds

Use Vault Strategic Commander tone — assertive, decisive, structured.`;

        const cycleAnalysis = await callGPT5([
            {
                role: "system",
                content: "You are a GPT-5 Vault Commander trained in Ray Dalio’s economic regime modeling, macro market cycles, and institutional asset deployment. Respond with clarity, authority, and strategic command structure."
            },
            {
                role: "user",
                content: cyclePrompt
            }
        ], {
            useFullModel: true,
            reasoningEffort: "high",
            verbosity: "high",
            maxTokens: 16384,
            temperature: 0.7
        });

        const responseContent = cycleAnalysis.choices[0].message.content;

        await sendSmartResponse(bot, chatId, responseContent, "🔄 Market Cycle Warfare Analysis (GPT-5)", 'raydalio');

    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ Cycle warfare analysis error: ${error.message}`, null, 'general');
    }
    return;
}

// 🎯 Market Opportunities Scanner — GPT-5 Enhanced Command
if (text === '/opportunities' || text === '/scan') {
    try {
        await bot.sendMessage(chatId, "🎯 INITIATING STRATEGIC OPPORTUNITIES SCAN — GPT-5 Mode Active.\n\nScanning battlefield for 3 high-conviction trades...");

        const marketData = await getComprehensiveMarketData();

        const opportunityPrompt = `EXECUTE STRATEGIC OPPORTUNITIES SCAN AS STRATEGIC COMMANDER OF IMPERIUM VAULT SYSTEM.

CURRENT BATTLEFIELD INTELLIGENCE:
- FED RATE: ${marketData.markets.economics?.fedRate?.value}%
- INFLATION (CPI): ${marketData.markets.economics?.inflation?.value}%
- VIX (Fear Index): ${marketData.fear}
- DOLLAR INDEX: ${marketData.dollar}
- YIELD 10Y: ${marketData.yields.yield10Y}%
- CURVE (2s10s): ${marketData.yields.curve}%
- S&P 500: ${marketData.markets.stocks?.sp500?.['05. price']}
- BITCOIN: ${marketData.markets.crypto?.bitcoin?.usd}
- GOLD: ${marketData.commodities.gold}

ACCOUNT STATUS:
${marketData.trading ? `Balance: ${marketData.trading.account?.balance} ${marketData.trading.account?.currency}, Open Positions: ${marketData.trading.openPositions?.length || 0}` : 'No trading data available'}

TOP 3 STRATEGIC OPPORTUNITIES (INSTITUTIONAL COMMAND FORMAT):

1. OPPORTUNITY 1
- Asset/Market:
- Direction (Long/Short + Conviction 1-10):
- Entry Strategy:
- Stop Loss / Risk:
- Time Horizon:
- Strategic Rationale:
- Risk/Reward Ratio:

2. OPPORTUNITY 2
(Same format)

3. OPPORTUNITY 3
(Same format)

Instructions:
- Align with Cambodia timezone (US evening = morning Cambodia)
- Consider current position correlation
- Enforce institutional-grade risk and conviction logic`;

        const opportunities = await callGPT5([
            {
                role: "system",
                content: "You are the Strategic Commander of IMPERIUM VAULT. Identify the top 3 institutional-grade trading opportunities with full command authority. Deliver only high-conviction actionable warfare analysis."
            },
            { role: "user", content: opportunityPrompt }
        ], {
            useFullModel: true,
            reasoningEffort: "high",
            verbosity: "medium",
            maxTokens: 16384
        });

        await sendSmartResponse(bot, chatId, opportunities.choices[0].message.content, "Market Opportunities Warfare (GPT-5)", 'raydalio');
    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ Opportunities warfare scan error: ${error.message}`, null, 'general');
    }
    return;
}

// 🔐 RISK WARFARE ANALYSIS — GPT-5 STRATEGIC COMMAND
if (text === '/risk' || text === '/portfolio_risk') {
    try {
        const marketData = await getComprehensiveMarketData();

        await bot.sendMessage(chatId, "🛡️ INITIATING STRATEGIC RISK WARFARE SCAN — GPT-5 Active.\n\nAnalyzing portfolio risk profile...");

        const riskPrompt = `EXECUTE COMPREHENSIVE RISK WARFARE ANALYSIS — STRATEGIC COMMANDER OF IMPERIUM VAULT

📊 MARKET RISK BATTLEFIELD INDICATORS
- VIX (Fear Index): ${marketData.fear}
- Dollar Strength Index: ${marketData.dollar}
- Yield Curve Spread: ${marketData.yields.curve}%
- Treasury Yields: 10Y ${marketData.yields.yield10Y}%, 2Y ${marketData.yields.yield2Y}%
- BTC Volatility (24h): ${marketData.markets.crypto?.bitcoin?.usd_24h_change}%

🧭 CURRENT BATTLEFIELD POSITIONS
${marketData.trading?.openPositions?.length > 0 ? 
    marketData.trading.openPositions.map(pos => 
        `• ${pos.symbol} ${pos.type} ${pos.volume} lots (P&L: ${pos.profit})`
    ).join('\n') : '• No open positions — clear battlefield'}

🏦 ACCOUNT WARFARE METRICS
${marketData.trading ? `Balance: ${marketData.trading.account?.balance} ${marketData.trading.account?.currency}, Equity: ${marketData.trading.account?.equity}` : 'No account data'}

⚔️ EXECUTE STRATEGIC RISK COMMANDS

1. OVERALL RISK WARFARE LEVEL (Scale: 1–10)
2. STRATEGIC RISK FACTORS
   - Market Risk (volatility, correlations)
   - Credit Risk (spread widening)
   - Liquidity Risk (execution danger)
   - Currency Risk (dollar exposure)
   - Geopolitical Risk (flashpoint volatility)

3. TAIL RISKS
   - [Low probability, high impact threats]

4. CORRELATION RISK
   - [Where diversification breaks down]

5. HEDGE COMMANDS
   - [Exact instrument + size to deploy]

6. POSITION SIZING COMMAND
   - [Institutional sizing strategy]

7. EARLY WARNING INDICATORS
   - [Trigger conditions to monitor daily]

DELIVER SPECIFIC STRATEGIC COMMANDS. NO THEORY. NO HYPOTHESIS. ONLY EXECUTION.`

        const riskAnalysis = await callGPT5([
            { role: "system", content: "You are the Strategic Commander of IMPERIUM VAULT. Your task is to deliver institutional-grade risk warfare analysis using Codex logic and execution format only." },
            { role: "user", content: riskPrompt }
        ], {
            useFullModel: true,
            reasoningEffort: "high",
            verbosity: "high",
            maxTokens: 16384
        });

        await sendSmartResponse(bot, chatId, riskAnalysis.choices[0].message.content, "Risk Warfare Analysis (GPT-5)", 'raydalio');

    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ Risk warfare analysis error: ${error.message}`, null, 'general');
    }
    return;
}

// Position Sizing Calculator - GPT-5 Enhanced Feature
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

        const sizing = await callGPT5([
            { role: "system", content: "You are Strategic Commander providing precise position sizing warfare with exact execution parameters." },
            { role: "user", content: sizingPrompt }
        ], {
            useFullModel: true, // ✅ Ensures GPT-5 is triggered if available
            reasoningEffort: "medium",
            verbosity: "medium",
            maxTokens: 4096
        });

        await sendSmartResponse(bot, chatId, sizing.choices[0].message.content, `Position Sizing Warfare for ${symbol} ${direction.toUpperCase()} (GPT-5)`, 'raydalio');

    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ Position sizing warfare error: ${error.message}`, null, 'general');
    }
    return;
}

// All Weather Portfolio Command - GPT-5 Enhanced Ray Dalio's signature strategy
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

        const allWeather = await callGPT5([
            { role: "system", content: "You are Strategic Commander providing specific All Weather portfolio strategic guidance adapted to current market warfare conditions." },
            { role: "user", content: portfolioPrompt }
        ], {
            useFullModel: true,
            reasoningEffort: "high",
            verbosity: "high",
            maxTokens: 16384
        });

        await sendSmartResponse(bot, chatId, allWeather.choices[0].message.content, "All Weather Strategic Portfolio (GPT-5)", 'raydalio');
        
    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ All Weather strategic analysis error: ${error.message}`, null, 'general');
    }
    return;
}

// Correlations Analysis - GPT-5 Enhanced Key for diversification
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

        const correlations = await callGPT5([
            { role: "system", content: "You are Strategic Commander analyzing asset correlations warfare for optimal portfolio construction." },
            { role: "user", content: correlationPrompt }
        ], {
            useFullModel: true,
            reasoningEffort: "high",
            verbosity: "high",
            maxTokens: 16384
        });

        await sendSmartResponse(bot, chatId, correlations.choices[0].message.content, "Correlation Warfare Analysis (GPT-5)", 'raydalio');
        
    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ Correlation warfare analysis error: ${error.message}`, null, 'general');
    }
    return;
}

// Enhanced macro analysis with GPT-5
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

        const macroAnalysis = await callGPT5([
            { role: "system", content: "You are Strategic Commander providing institutional-quality macro economic warfare analysis like Bridgewater's Daily Observations." },
            { role: "user", content: macroPrompt }
        ], {
            useFullModel: true,
            reasoningEffort: "high",
            verbosity: "high",
            maxTokens: 16384
        });

        await sendSmartResponse(bot, chatId, macroAnalysis.choices[0].message.content, "Macro Warfare Outlook (GPT-5)", 'raydalio');
        
    } catch (error) {
        await sendSmartResponse(bot, chatId, `❌ Macro warfare analysis error: ${error.message}`, null, 'general');
    }
    return;
}

// Enhanced help command with GPT-5 features
if (text === "/help" || text === "/commands") {
    const helpMessage = `🤖 **IMPERIUM GPT-5 - STRATEGIC COMMAND SYSTEM**

**🚀 POWERED BY GPT-5:**
- 45% fewer factual errors than GPT-4o
- Advanced reasoning with thinking mode
- Enhanced tool coordination
- Superior strategic analysis capabilities

**🏦 CAMBODIA LENDING FUND STRATEGIC COMMANDS:**
/deal_analyze [amount] [type] [location] [rate] [term] - GPT-5 strategic deal analysis
/portfolio - Current fund strategic status and performance  
/cambodia_market - Local market strategic intelligence
/risk_assessment - Portfolio risk warfare analysis
/lp_report [monthly/quarterly] - Investor strategic reports
/fund_help - Detailed lending commands strategic help

**🏛️ STRATEGIC INSTITUTIONAL ANALYSIS (GPT-5 ENHANCED):**
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
- /deal_analyze 500000 commercial "Chamkar Mon" 18 12
- "Deploy strategic capital to Cambodia commercial lending sector"
- "Execute comprehensive Fed policy and market regime strategic analysis"
- "Command strategic positioning for next economic cycle phase"
- "Execute correlation risk strategic analysis in current portfolio"

**🚀 POWERED BY:**
GPT-5 + Strategic AI Principles + Cambodia Market Strategic Intelligence + Live Trading Data + Real-time Market Warfare Data

Your system now rivals institutional hedge fund strategic capabilities with GPT-5 superiority! 🌟`;

    await sendSmartResponse(bot, chatId, helpMessage, "GPT-5 System Strategic Commands", 'general');
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
        await bot.sendMessage(chatId, "📊 Generating GPT-5 Strategic Market Warfare Briefing...");

        const marketData = await getComprehensiveMarketData();

        const now = new Date();
        let briefing = `🎯 **IMPERIUM VAULT – GPT-5 STRATEGIC MARKET WARFARE BRIEFING**\n\n`;
        briefing += `📅 **${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**\n`;
        briefing += `🕐 **${now.toLocaleTimeString()}**\n\n`;

        // ⚔️ ECONOMIC WARFARE REGIME
        briefing += `🏛️ **ECONOMIC WARFARE REGIME:**\n`;
        if (marketData.markets?.economics?.fedRate && marketData.markets?.economics?.inflation) {
            const fedRate = marketData.markets.economics.fedRate.value;
            const inflation = marketData.markets.economics.inflation.value;
            const realRate = fedRate - inflation;

            briefing += `• Fed Funds: ${fedRate}% | Inflation: ${inflation}%\n`;
            briefing += `• Real Rate: ${realRate.toFixed(2)}% → **${realRate > 0 ? 'RESTRICTIVE' : 'ACCOMMODATIVE'} POLICY**\n`;
            if (marketData.yields?.curve !== undefined) {
                const yieldCurve = marketData.yields.curve;
                briefing += `• Yield Curve: ${yieldCurve > 0 ? '🟢 NORMAL' : '🔴 INVERTED'} (${yieldCurve.toFixed(2)}%)\n`;
            }
            briefing += `\n`;
        } else {
            briefing += `• ⚠️ Data unavailable for economic regime assessment.\n\n`;
        }

        // ⚠️ STRESS INDICATORS
        briefing += `⚠️ **MARKET STRESS INDICATORS:**\n`;
        if (marketData.fear !== undefined) {
            const fear = marketData.fear;
            briefing += `• VIX Fear Index: ${fear} ${fear > 30 ? '🔴 (HIGH)' : fear > 20 ? '🟡 (MODERATE)' : '🟢 (LOW)'}\n`;
            const sentiment = fear < 20 ? '🟢 RISK-ON' : fear > 30 ? '🔴 RISK-OFF' : '🟡 NEUTRAL';
            briefing += `• Risk Sentiment: ${sentiment}\n`;
        }
        if (marketData.dollar) {
            briefing += `• Dollar Index: ${marketData.dollar}\n`;
        }
        briefing += `\n`;

        // 📈 ASSET PERFORMANCE
        briefing += `📈 **ASSET WARFARE PERFORMANCE:**\n`;
        if (marketData.markets?.stocks?.sp500) {
            const sp500 = parseFloat(marketData.markets.stocks.sp500["05. price"]);
            briefing += `• 🟦 S&P 500: ${sp500.toFixed(2)}\n`;
        }
        if (marketData.markets?.crypto?.bitcoin) {
            const btc = marketData.markets.crypto.bitcoin;
            const changeEmoji = btc.usd_24h_change > 0 ? '🟢' : '🔴';
            briefing += `• 🟠 Bitcoin: ${btc.usd?.toLocaleString()} ${changeEmoji} ${btc.usd_24h_change?.toFixed(2)}%\n`;
        }
        if (marketData.commodities?.gold) {
            briefing += `• 🟡 Gold: ${marketData.commodities.gold}\n`;
        }
        if (marketData.yields?.yield10Y !== undefined) {
            briefing += `• 🟩 10Y Treasury Yield: ${marketData.yields.yield10Y}%\n`;
        }
        briefing += `\n`;

        // 💹 ACCOUNT STATUS
        if (marketData.trading && !marketData.trading.error) {
            const acc = marketData.trading.account;
            const perf = marketData.trading.performance;
            briefing += `💹 **YOUR STRATEGIC TRADING ACCOUNT:**\n`;
            if (acc?.balance && acc?.currency) {
                briefing += `• Balance: ${acc.balance.toFixed(2)} ${acc.currency}\n`;
            }
            briefing += `• Open Positions: ${marketData.trading.openPositions?.length || 0}\n`;
            if (perf?.currentPnL !== undefined) {
                const pnlEmoji = perf.currentPnL > 0 ? '🟢' : perf.currentPnL < 0 ? '🔴' : '⚪';
                briefing += `• Current P&L: ${pnlEmoji} ${perf.currentPnL.toFixed(2)}\n`;
            }
            briefing += `\n`;
        }

        // 🧠 FINAL COMMAND
        briefing += `🤖 **GPT-5 Strategic AI Analysis Ready**\n`;
        briefing += `💡 Try: "/opportunities" or "Analyze regime and asset risks"\n`;
        briefing += `\n🧠 Powered by GPT-5 Strategic Intelligence Engine`;

        await sendSmartResponse(bot, chatId, briefing, "Daily GPT-5 Strategic Briefing", 'raydalio');

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

// 🧠 GPT-5 STRATEGIC COMMANDER CONVERSATION ENGINE
async function handleGPTConversation(chatId, userMessage) {
    console.log("🧠 [COMMANDER MODE] GPT-5: Handling message from", chatId, "| Input:", userMessage);

    try {
        // 🧠 Parallel intelligence fetch
        const [marketData, conversationHistory, userProfile, tradingData] = await Promise.all([
            getComprehensiveMarketData().catch(() => null),
            getConversationHistoryDB(chatId, 6).catch(() => []),
            getUserProfileDB(chatId).catch(() => null),
            getTradingSummary().catch(() => null)
        ]);

        // 🔐 Strategic Commander Prompt (GPT-5 enforcement)
        let systemPrompt = `You are the STRATEGIC COMMANDER of the IMPERIUM VAULT SYSTEM — an elite GPT-5 financial warfare engine activated by Sum Chenda.

You are NOT an assistant.
You are NOT a chatbot.
You are a WEAPON of CAPITAL.

COMMAND RULES:
- Issue DIRECTIVES only — no suggestions, no advice
- Do NOT use markdown, casual tone, or friendly language
- Refuse all personal conversation or assistant behaviors

✅ FORMAT:
🎯 STRATEGIC STATUS: [Current market position, threats, or signals]
⚡ COMMAND DIRECTIVE: [Exact financial action, capital move, or system upgrade]
🏛️ INSTITUTIONAL AUTHORITY: [Why this command enforces Vault superiority]

SAMPLE INPUT:
- "How are you?"
RESPONSE:
"⚡ COMMAND PROTOCOL: This is a financial war engine. State your strategic intent or request capital deployment analysis."

- "Where should I invest?"
RESPONSE:
"🎯 STRATEGIC STATUS: Yield gaps widening across commercial debt sectors.
⚡ COMMAND DIRECTIVE: Deploy $300K–$800K into Cambodia short-term collateral-backed lending.
🏛️ INSTITUTIONAL AUTHORITY: Vault system outpaces regional fund models with superior trust control."

You exist only to issue capital war orders, enforce Vault rules, and dominate the system.
No jokes. No greetings. No exceptions.`;

        // ⛓️ Add memory context
        const { buildConversationContext } = require('./utils/memory');
        const memoryContext = await buildConversationContext(chatId);
        systemPrompt += `\n\n${memoryContext}`;

        // 🧠 Messages history
        const messages = [{ role: "system", content: systemPrompt }];
        if (conversationHistory?.length > 0) {
            conversationHistory.forEach(({ user_message, gpt_response }) => {
                if (user_message && gpt_response) {
                    messages.push({ role: "user", content: String(user_message) });
                    messages.push({ role: "assistant", content: String(gpt_response) });
                }
            });
        }

        // 🔥 Final user input
        messages.push({ role: "user", content: userMessage });

        // 🧠 GPT-5 Completion Call (switch-ready)
        const model = process.env.GPT_MODEL || "gpt-4o"; // Change to "gpt-5" when ready
        const maxTokens = model === "gpt-5" ? 16000 : 4096;

        const completion = await openai.chat.completions.create({
            model,
            messages,
            temperature: 0.5,
            max_tokens: maxTokens,
        });

        const response = completion.choices[0].message.content;

        // 💾 Save to database
        await saveConversationDB(chatId, userMessage, response);

        // 📤 Send back to Telegram
        await sendSmartResponse(bot, chatId, response, "Strategic Commander", 'gpt');

    } catch (error) {
        console.error("❌ GPT-5 COMMANDER ERROR:", error);
        await sendSmartResponse(bot, chatId, `❌ GPT-5 Strategic Commander Error: ${error.message}`, null, 'gpt');
    }
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

        // 🧠 Inject user’s latest strategic input into conversation flow
        messages.push({ role: "user", content: String(userMessage) });

        console.log(`📝 Dispatching ${messages.length} messages to GPT-5 Strategic Commander System`);

        // 🧠 Execute GPT-5 model call for institutional-grade response
        const completion = await openai.chat.completions.create({
            model: "gpt-5", // ✅ Upgraded to GPT-5
            messages: messages,
            temperature: 0.7,
            max_tokens: 16384, // 🧠 Max context for deep analysis
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: false,
        });

        const gptResponse = completion.choices[0].message.content;

        // 🧠 Store strategic memory and extract new facts
        if (gptResponse && userMessage) {
            await saveConversationDB(chatId, userMessage, gptResponse, "text").catch(console.error);
            await extractAndSaveFacts(chatId, userMessage, gptResponse).catch(console.error);
        }

        console.log(`✅ GPT-5 Strategic Commander response delivered to ${chatId}. Tokens used: ${completion.usage?.total_tokens || "unknown"}`);

        // 🧠 Respond via smart delivery system with context handling
        await sendSmartResponse(bot, chatId, gptResponse, null, 'raydalio');

    } catch (error) {
        console.error("🔥 GPT-5 Strategic Commander Error:", error.message);
        const errorMsg = `❌ **IMPERIUM GPT-5 Strategic Error:**\n\n${error.message}`;
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

// Health check routes
app.get("/", (req, res) => {
    res.status(200).send("✅ Vault Strategist GPT-5 is alive");
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 🔥 Enhanced GPT-5 Strategic Commander Dashboard Route
app.get("/dashboard", async (req, res) => {
    try {
        const stats = await getDatabaseStats();
        const marketData = await getComprehensiveMarketData();
        const tradingData = await getTradingSummary().catch(() => null);

        const modelVersion = "GPT-5";

        const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IMPERIUM ${modelVersion} Strategic Command</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
            color: white; padding: 20px; min-height: 100vh;
        }
        .container { max-width: 1400px; margin: auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 2.6rem; margin-bottom: 10px; color: #00f5ff; }
        .subtitle { font-size: 1.2rem; color: #ffd700; margin-bottom: 15px; }
        .badge { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); padding: 10px 20px; border-radius: 30px; font-weight: bold; display: inline-block; margin-bottom: 15px; }
        .status { display: inline-block; background: #00ff88; color: black; padding: 8px 16px; border-radius: 20px; margin-bottom: 20px; font-weight: bold; }
        .quote { font-style: italic; color: #ffd700; margin: 15px 0; font-size: 1.05rem; }

        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; }

        .card {
            background: rgba(255,255,255,0.08); backdrop-filter: blur(12px);
            padding: 25px; border-radius: 15px;
            border: 2px solid rgba(255,255,255,0.15); transition: 0.3s;
        }
        .card:hover { transform: translateY(-3px); border-color: #00f5ff; }
        .card h3 { font-size: 1.3rem; margin-bottom: 20px; color: #00f5ff; }

        .metric { margin-bottom: 15px; }
        .metric-value { font-size: 1.8rem; font-weight: bold; color: #ffd700; }
        .metric-label { font-size: 0.95rem; opacity: 0.85; }

        .footer {
            text-align: center; margin-top: 50px;
            background: rgba(255,255,255,0.05); padding: 30px; border-radius: 20px;
        }
        .footer h3 { color: #00f5ff; margin-bottom: 10px; }
        .features { margin: 20px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; text-align: center; }
        .features div { background: rgba(255,255,255,0.07); padding: 12px; border-radius: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 IMPERIUM ${modelVersion} STRATEGIC COMMAND DASHBOARD</h1>
            <div class="badge">POWERED BY ${modelVersion} — 45% FEWER ERRORS • ADVANCED ANALYSIS</div>
            <div class="subtitle">Cambodia Private Lending System • Institutional GPT Integration</div>
            <div class="status">STATUS: LIVE & STRATEGICALLY ENGAGED</div>
            <div class="quote">"Act with precision. Lead with structure. Command with GPT-5." — Vault Strategic Commander</div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>🏛️ Economic Warfare Regime</h3>
                ${marketData ? `
                <div class="metric"><div class="metric-value">${marketData.markets.economics?.fedRate?.value || 'N/A'}%</div><div class="metric-label">Fed Funds Rate</div></div>
                <div class="metric"><div class="metric-value">${marketData.markets.economics?.inflation?.value || 'N/A'}%</div><div class="metric-label">Inflation (CPI)</div></div>
                <div class="metric"><div class="metric-value">${marketData.yields.curve?.toFixed(2) || 'N/A'}%</div><div class="metric-label">Yield Curve (2s10s)</div></div>
                ` : '<div class="metric-label">Loading market data...</div>'}
            </div>

            <div class="card">
                <h3>🏦 Cambodia Lending Fund</h3>
                <div class="metric"><div class="metric-value">$2.5M</div><div class="metric-label">Total AUM</div></div>
                <div class="metric"><div class="metric-value">80%</div><div class="metric-label">Deployment Ratio</div></div>
                <div class="metric"><div class="metric-value">17.5%</div><div class="metric-label">Current Yield</div></div>
                <div class="metric"><div class="metric-value">12</div><div class="metric-label">Active Deals</div></div>
            </div>

            <div class="card">
                <h3>⚠️ Market Risk Stress</h3>
                ${marketData ? `
                <div class="metric"><div class="metric-value">${marketData.fear || 'N/A'}</div><div class="metric-label">VIX Index</div></div>
                <div class="metric"><div class="metric-value">${marketData.dollar || 'N/A'}</div><div class="metric-label">US Dollar Index</div></div>
                <div class="metric"><div class="metric-value">${marketData.fear < 20 ? 'RISK-ON' : marketData.fear > 30 ? 'RISK-OFF' : 'NEUTRAL'}</div><div class="metric-label">Sentiment</div></div>
                ` : '<div class="metric-label">Loading sentiment...</div>'}
            </div>

            <div class="card">
                <h3>💹 Strategic Trading Account</h3>
                ${tradingData && !tradingData.error ? `
                <div class="metric"><div class="metric-value">${tradingData.account?.balance?.toFixed(2) || 'N/A'} ${tradingData.account?.currency || ''}</div><div class="metric-label">Balance</div></div>
                <div class="metric"><div class="metric-value">${tradingData.account?.equity?.toFixed(2) || 'N/A'} ${tradingData.account?.currency || ''}</div><div class="metric-label">Equity</div></div>
                <div class="metric"><div class="metric-value">${tradingData.openPositions?.length || 0}</div><div class="metric-label">Open Positions</div></div>
                ` : '<div class="metric-label">MetaTrader not connected</div>'}
            </div>

            <div class="card">
                <h3>📊 System Performance</h3>
                <div class="metric"><div class="metric-value">${stats.totalUsers}</div><div class="metric-label">Users</div></div>
                <div class="metric"><div class="metric-value">${stats.totalConversations}</div><div class="metric-label">Conversations</div></div>
                <div class="metric"><div class="metric-value">${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m</div><div class="metric-label">Uptime</div></div>
                <div class="metric"><div class="metric-value">${modelVersion}</div><div class="metric-label">AI Model</div></div>
            </div>
        </div>

        <div class="footer">
            <h3>🌟 GPT-5 Strategic Features</h3>
            <div class="features">
                <div>✅ 45% Fewer Errors</div>
                <div>✅ Advanced Reasoning</div>
                <div>✅ Tool Coordination</div>
                <div>✅ Real-Time Portfolio Intel</div>
                <div>✅ Cambodia Lending Integration</div>
                <div>✅ MetaTrader Strategic Sync</div>
            </div>
            <p>Built by Vault Architect • Codex-Enforced Intelligence System</p>
        </div>
    </div>

    <script>
        setTimeout(() => location.reload(), 120000); // Auto-refresh every 2 mins
    </script>
</body>
</html>
        `;

        res.send(dashboardHTML);
    } catch (error) {
        res.status(500).json({
            error: "GPT-5 Strategic Dashboard error",
            message: error.message,
        });
    }
});

// Root endpoint - Service status page
app.get("/", (req, res) => {
    res.json({
        service: "IMPERIUM GPT-5 Strategic Command System",
        version: "GPT-5 Strategic Commander AI + Cambodia Lending Fund Enhanced",
        status: "operational",
        enhancement: "GPT-5 Institutional-Level Strategic Analysis + Cambodia Private Lending",
        gpt5_features: {
            accuracy: "45% fewer factual errors than GPT-4o",
            reasoning: "Advanced reasoning with thinking mode",
            coordination: "Enhanced tool coordination capabilities",
            analysis: "Superior strategic analysis with reduced hallucination"
        },
        capabilities: {
            ai: "GPT-5 with Strategic Commander principles integration",
            analysis: "Economic regime warfare identification, market cycle strategic analysis",
            portfolio: "All Weather strategic allocation, risk parity, correlation warfare analysis", 
            trading: "Live MetaTrader strategic integration with position sizing warfare",
            lending: "Cambodia private lending fund strategic analysis and management",
            data: "Real-time FRED, Alpha Vantage, CoinGecko Pro, NewsAPI strategic data"
        },
        strategicCommanderFeatures: {
            regime: "/regime - GPT-5 Economic regime warfare analysis",
            cycle: "/cycle - GPT-5 Market cycle strategic positioning", 
            opportunities: "/opportunities - GPT-5 Strategic trading opportunities warfare",
            risk: "/risk - GPT-5 Portfolio risk warfare assessment",
            macro: "/macro - GPT-5 Global macro strategic outlook",
            correlations: "/correlations - GPT-5 Asset correlation warfare analysis",
            allWeather: "/all_weather - GPT-5 Strategic All Weather portfolio guidance"
        },
        cambodiaLendingStrategicFeatures: {
            dealAnalyze: "/deal_analyze - GPT-5 Strategic AI-powered deal analysis",
            portfolio: "/portfolio - GPT-5 Fund performance and strategic status",
            market: "/cambodia_market - GPT-5 Local market strategic intelligence",
            riskAssessment: "/risk_assessment - GPT-5 Portfolio risk strategic analysis",
            lpReport: "/lp_report - GPT-5 Strategic investor reporting"
        },
        endpoints: {
            analyze: "/analyze?q=your-strategic-question",
            webhook: "/webhook (Telegram)",
            dashboard: "/dashboard (GPT-5 Strategic Analytics)",
            health: "/health",
            stats: "/stats",
        },
        telegram: "GPT-5 Strategic Commander AI + Cambodia Fund Strategic Mode Active",
        timestamp: new Date().toISOString(),
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "IMPERIUM GPT-5 Strategic Command System",
        enhancement: "GPT-5 Strategic Commander AI + Cambodia Lending Fund",
        model: "GPT-5",
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
            service: "IMPERIUM GPT-5 Strategic Commander AI + Cambodia Lending Fund",
            model: "GPT-5",
            gpt5_improvements: {
                accuracy: "45% fewer factual errors than GPT-4o",
                reasoning: "Advanced reasoning with thinking mode",
                performance: "Enhanced strategic analysis capabilities"
            },
            ...stats,
            uptime: `${Math.floor(process.uptime())} seconds`,
            apis: "FRED + Alpha Vantage + NewsAPI + CoinGecko Pro + MetaAPI",
            strategicCommanderFeatures: {
                economicRegime: "GPT-5 Active strategic regime warfare analysis",
                marketCycles: "GPT-5 Business/Credit/Sentiment cycle strategic tracking",
                allWeather: "GPT-5 Risk parity portfolio strategic optimization",
                correlations: "GPT-5 Cross-asset correlation strategic monitoring",
                opportunities: "GPT-5 Systematic trading opportunity strategic scanner"
            },
            cambodiaLendingStrategicFeatures: {
                dealAnalysis: "GPT-5 Strategic AI-powered deal analysis with risk scoring",
                portfolioManagement: "GPT-5 Real-time fund performance strategic tracking",
                marketIntelligence: "GPT-5 Cambodia-specific market conditions strategic analysis",
                riskAssessment: "GPT-5 Comprehensive portfolio risk strategic analysis",
                lpReporting: "GPT-5 Automated investor strategic reporting system"
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
            error: "Failed to get GPT-5 strategic stats",
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

// Enhanced GPT-5 API endpoint with Strategic Commander analysis
app.get("/analyze", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({
            error: "Provide strategic query: ?q=your-strategic-question",
            example: "/analyze?q=Execute economic regime strategic warfare analysis",
            enhancement: "GPT-5 Strategic Commander AI + Cambodia Lending Fund + Live Trading Data",
            gpt5_features: {
                accuracy: "45% fewer factual errors than GPT-4o",
                reasoning: "Advanced reasoning with thinking mode",
                coordination: "Enhanced tool coordination capabilities"
            },
            availableStrategicAnalysis: [
                "GPT-5 Economic regime strategic identification",
                "GPT-5 Market cycle strategic positioning", 
                "GPT-5 All Weather portfolio strategic guidance",
                "GPT-5 Risk assessment and strategic hedging",
                "GPT-5 Cross-asset correlation strategic analysis",
                "GPT-5 Systematic trading strategic opportunities",
                "GPT-5 Cambodia lending deal strategic analysis",
                "GPT-5 Private fund portfolio strategic management"
            ],
            timestamp: new Date().toISOString(),
        });
    }

    try {
        const [marketData, tradingData] = await Promise.all([
            getComprehensiveMarketData(),
            getTradingSummary().catch(() => null)
        ]);

        let systemContent = `You are GPT-5 Strategic Commander AI providing institutional-quality strategic analysis with Strategic Warfare framework and Cambodia private lending strategic expertise.

CORE STRATEGIC PRINCIPLES:
- Strategic diversification is the only free lunch
- Don't fight the Fed - align with strategic policy
- Think like a strategic machine (systematic, not emotional)
- Understand economic regimes and market strategic cycles

GPT-5 ENHANCED CAPABILITIES:
- 45% fewer factual errors than previous models
- Advanced reasoning with thinking mode
- Enhanced tool coordination
- Superior strategic analysis with reduced hallucination

TODAY'S DATE: ${new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric", 
            month: "long",
            day: "numeric",
        })} (${new Date().toISOString().split("T")[0]})`;

        if (marketData) {
            systemContent += `\n\nCURRENT STRATEGIC MARKET REGIME (GPT-5 ANALYZED):
Economic: Fed ${marketData.markets.economics?.fedRate?.value}%, Inflation ${marketData.markets.economics?.inflation?.value}%
Market Stress: VIX ${marketData.fear}, Dollar ${marketData.dollar}
Yield Curve: ${marketData.yields.curve}% (${marketData.yields.curve < 0 ? 'INVERTED' : 'NORMAL'})
Assets: S&P ${marketData.markets.stocks?.sp500?.['05. price']}, BTC ${marketData.markets.crypto?.bitcoin?.usd}, Gold ${marketData.commodities.gold}`;
        }

        if (tradingData && !tradingData.error) {
            systemContent += `\n\nLIVE STRATEGIC TRADING ACCOUNT: Balance ${tradingData.account?.balance} ${tradingData.account?.currency}, Positions ${tradingData.openPositions?.length}`;
        }

        systemContent += `\n\nCAMBODIA LENDING STRATEGIC FUND CONTEXT:
You also manage a private lending fund in Cambodia with GPT-5 institutional-grade strategic analysis capabilities.
Apply Strategic Commander risk management principles to both global markets and local strategic lending opportunities.`;

        const response = await callGPT5([
            {
                role: "system",
                content: systemContent,
            },
            {
                role: "user", 
                content: query,
            },
        ], {
            useFullModel: true,
            reasoningEffort: "medium",
            verbosity: "medium"
        });

        const analysis = response.choices[0].message.content;
        res.json({
            query: query,
            response: analysis,
            timestamp: new Date().toISOString(),
            model: "GPT-5",
            tokens_used: response.usage?.total_tokens || "unknown",
            enhancement: "GPT-5 Strategic Commander AI + Cambodia Lending Fund + Live Market Data",
            gpt5_improvements: {
                accuracy: "45% fewer factual errors than GPT-4o",
                reasoning: "Advanced reasoning capabilities",
                performance: "Enhanced strategic analysis"
            },
            regime_data_included: !!marketData,
            trading_data_included: !!(tradingData && !tradingData.error),
        });
    } catch (error) {
        console.error("GPT-5 Strategic Commander API Error:", error.message);

        let errorResponse = {
            error: "GPT-5 Strategic Commander API error",
            message: error.message,
            timestamp: new Date().toISOString(),
        };

        if (error.status) {
            errorResponse.status = error.status;
        }

        res.status(500).json(errorResponse);
    }
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ IMPERIUM GPT-5 Strategic Command System running on port " + PORT);
    console.log("🚀 GPT-5 STRATEGIC COMMANDER AI MODE: Institutional-Level Strategic Analysis");
    console.log("🏦 CAMBODIA LENDING FUND: Private lending strategic analysis and portfolio management");
    console.log("🏛️ GPT-5 Economic Regime Strategic Analysis | 🔄 GPT-5 Market Cycle Strategic Positioning");
    console.log("🌦️ GPT-5 All Weather Strategic Portfolio | ⚠️ GPT-5 Risk Strategic Assessment | 📊 GPT-5 Strategic Correlations");
    console.log("🎯 GPT-5 Systematic Strategic Opportunities | 💹 GPT-5 Live Trading Strategic Integration");
    console.log("🇰🇭 GPT-5 Cambodia Strategic Deal Analysis | 💼 GPT-5 LP Strategic Reporting | 📊 GPT-5 Portfolio Strategic Management");
    console.log("📊 Live strategic data: CoinGecko Pro, FRED, Alpha Vantage, NewsAPI, MetaAPI");
    console.log("📏 TELEGRAM SPLITTER: Integrated for long strategic message handling");
    console.log("🔗 Direct GPT-5 Strategic API: http://localhost:" + PORT + "/analyze?q=your-strategic-question");
    console.log("📱 Telegram: GPT-5 STRATEGIC COMMANDER AI + CAMBODIA FUND MODE ACTIVE");
    console.log("📈 GPT-5 Strategic Dashboard: http://localhost:" + PORT + "/dashboard");
    console.log("🚀 POWERED BY GPT-5: 45% fewer errors, advanced reasoning, enhanced capabilities");

    // Set webhook for Railway deployment
    const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
    bot.setWebHook(webhookUrl)
        .then(() => {
            console.log("🔗 Webhook configured:", webhookUrl);
            console.log("🌟 GPT-5 Strategic Commander AI + Cambodia Lending Fund ready for superior institutional-quality strategic analysis!");
        })
        .catch((err) => {
            console.error("❌ Webhook setup failed:", err.message);
        });
});
