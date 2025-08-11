require("dotenv").config({ path: ".env" });
const { Pool } = require('pg');

// Debug environment variables
console.log("🔧 Environment check:");
console.log(`ADMIN_CHAT_ID: ${process.env.ADMIN_CHAT_ID}`);
console.log(`TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET"}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "SET" : "NOT SET"}`);
console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "SET" : "NOT SET"}`);

const TelegramBot = require("node-telegram-bot-api");
const { OpenAI } = require("openai");

// Import clean utility modules
const { 
    getRealLiveData, 
    getEnhancedLiveData, 
    getEconomicIndicators,
    getStockMarketData,
    getRayDalioMarketData
} = require("./utils/liveData");

const { 
    analyzeLendingDeal, 
    getPortfolioStatus, 
    getCambodiaMarketConditions, 
    performRiskAssessment, 
    generateLPReport 
} = require("./utils/cambodiaLending");

const {
    sendSmartMessage,
    sendAnalysis,
    sendCambodiaAnalysis,
    sendMarketAnalysis,
    sendAlert
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
    getUserProfileDB,
    getDatabaseStats,
    initializeDatabase,
} = require("./utils/database");

const { buildConversationContext } = require("./utils/memory");
const { getTradingSummary, getAccountInfo } = require("./utils/metaTrader");

// Import clean AI clients
const { 
    getClaudeAnalysis,
    getStrategicAnalysis,
    getRegimeAnalysis,
    getCambodiaAnalysis: getClaudeCambodiaAnalysis,
    getPortfolioAnalysis,
    getAnomalyAnalysis
} = require('./utils/claudeClient');

const { 
    getGptAnalysis,
    getMarketAnalysis,
    getCambodiaAnalysis,
    getStrategicAnalysis: getGptStrategicAnalysis
} = require('./utils/openaiClient');

const { 
    executeDualCommand,
    checkSystemHealth
} = require('./utils/dualCommandSystem');

// Load credentials
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const openaiKey = process.env.OPENAI_API_KEY;

if (!telegramToken || !openaiKey) {
    console.error("❌ Missing TELEGRAM_BOT_TOKEN or OPENAI_API_KEY in .env");
    process.exit(1);
}

// Initialize Telegram Bot
const bot = new TelegramBot(telegramToken, { polling: false });

// Initialize OpenAI
const openai = new OpenAI({ 
    apiKey: openaiKey,
    timeout: 60000,
    maxRetries: 3
});

// Initialize Database
initializeDatabase()
    .then(() => console.log("✅ Database connected"))
    .catch((err) => console.log("⚠️ Database connection failed:", err.message));

// User Authentication
function isAuthorizedUser(chatId) {
    const authorizedUsers = process.env.ADMIN_CHAT_ID
        ? process.env.ADMIN_CHAT_ID.split(",").map((id) => parseInt(id.trim()))
        : [];
    return authorizedUsers.includes(parseInt(chatId));
}

// Comprehensive market data
async function getComprehensiveMarketData() {
    try {
        const enhancedData = await getEnhancedLiveData();
        const tradingData = await getTradingSummary().catch(() => null);
        
        return {
            markets: enhancedData,
            trading: tradingData,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Market data error:', error.message);
        return null;
    }
}

// Main message handler
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    console.log(`📨 Message from ${chatId}: ${text?.substring(0, 50) || 'Media message'}`);
    
    // Security check
    if (!isAuthorizedUser(chatId)) {
        console.log(`🚫 Unauthorized access from ${chatId}`);
        await sendSmartMessage(bot, chatId, 
            `🚫 Access denied. This is a private AI system.\n\nYour Chat ID: ${chatId}\n\nContact admin if this is your account.`
        );
        return;
    }

    // Handle media messages
    if (msg.voice) {
        console.log("🎤 Voice message received");
        try {
            const transcribedText = await processVoiceMessage(bot, msg.voice.file_id, chatId);
            if (transcribedText) {
                await sendSmartMessage(bot, chatId, `🎤 **Voice transcribed:** "${transcribedText}"`);
                await handleConversation(chatId, transcribedText);
            } else {
                await sendSmartMessage(bot, chatId, "❌ Voice transcription failed. Please try again.");
            }
        } catch (error) {
            await sendSmartMessage(bot, chatId, `❌ Voice processing error: ${error.message}`);
        }
        return;
    }

    if (msg.photo) {
        console.log("🖼️ Image received");
        try {
            const analysis = await processImageMessage(bot, msg.photo[msg.photo.length - 1].file_id, chatId, msg.caption);
            if (analysis) {
                await sendAnalysis(bot, chatId, analysis, "Image Analysis");
            } else {
                await sendSmartMessage(bot, chatId, "❌ Image analysis failed. Please try again.");
            }
        } catch (error) {
            await sendSmartMessage(bot, chatId, `❌ Image processing error: ${error.message}`);
        }
        return;
    }

    if (msg.document) {
        console.log("📄 Document received:", msg.document.file_name);
        try {
            const isTraining = msg.caption?.toLowerCase().includes("train");
            
            if (isTraining) {
                // Save to training database
                await bot.sendMessage(chatId, "📚 Processing document for AI training...");
                
                const fileLink = await bot.getFileLink(msg.document.file_id);
                const response = await fetch(fileLink);
                const buffer = await response.buffer();
                
                let content = '';
                const fileName = msg.document.file_name || "document";
                
                if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
                    content = buffer.toString('utf8');
                } else {
                    content = buffer.toString('utf8');
                }
                
                const { saveTrainingDocumentDB } = require('./utils/database');
                const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
                const summary = content.length > 500 ? content.substring(0, 500) + '...' : content;
                
                const saved = await saveTrainingDocumentDB(chatId, fileName, content, 'user_uploaded', wordCount, summary);
                
                if (saved) {
                    await sendSmartMessage(bot, chatId, 
                        `📚 **Document Added to AI Training Database**\n\n` +
                        `📄 **File:** ${fileName}\n` +
                        `📊 **Words:** ${wordCount.toLocaleString()}\n` +
                        `✅ **Your AI can now reference this document in conversations!**`
                    );
                } else {
                    await sendSmartMessage(bot, chatId, "❌ Error saving document. Please try again.");
                }
            } else {
                // Analyze document
                await bot.sendMessage(chatId, "📄 Analyzing document...");
                const analysis = await processDocumentMessage(bot, msg.document.file_id, chatId, msg.document.file_name);
                
                if (analysis?.success) {
                    await sendAnalysis(bot, chatId, analysis.analysis, `Document Analysis: ${msg.document.file_name}`);
                } else {
                    await sendSmartMessage(bot, chatId, "❌ Document processing failed. Try converting to PDF or TXT format.");
                }
            }
        } catch (error) {
            await sendSmartMessage(bot, chatId, `❌ Document processing error: ${error.message}`);
        }
        return;
    }

    // Handle text commands
    if (!text) {
        await sendSmartMessage(bot, chatId, "Please send text, voice messages, images, or documents.");
        return;
    }

    // Command handlers
    if (text === "/start") {
        const welcome = `🤖 **AI Assistant System**

**🎯 Features:**
- GPT-4o and Claude Opus 4.1 analysis
- Live market data integration
- Cambodia fund analysis
- Document processing and training
- Voice and image analysis

**🏦 Cambodia Fund Commands:**
/deal_analyze [amount] [type] [location] [rate] [term]
/portfolio - Fund status
/cambodia_market - Market conditions
/risk_assessment - Risk analysis

**📊 Market Analysis:**
/briefing - Daily market briefing
/regime - Economic regime analysis
/opportunities - Trading opportunities
/macro - Macro outlook

**💹 Trading:**
/trading - Account status
/positions - Open positions

**Chat ID:** ${chatId}`;

        await sendSmartMessage(bot, chatId, welcome);
        return;
    }

    if (text === "/help") {
        const help = `🤖 **AI Assistant Help**

**Main Features:**
- Natural conversation with AI
- Financial market analysis
- Cambodia lending fund management
- Document analysis and training
- Voice/image processing

**How to use:**
- Ask questions naturally
- Upload documents with "train" to add to AI knowledge
- Use specific commands for structured analysis

**Examples:**
- "What's the current market situation?"
- "Analyze this Cambodia lending opportunity"
- "/briefing" for daily market summary`;

        await sendSmartMessage(bot, chatId, help);
        return;
    }

    if (text === "/myid") {
        await sendSmartMessage(bot, chatId, `Your Chat ID: ${chatId}`);
        return;
    }

    // Cambodia fund commands
    if (text.startsWith('/deal_analyze')) {
        await handleDealAnalysis(chatId, text);
        return;
    }

    if (text === '/portfolio') {
        await handlePortfolioStatus(chatId);
        return;
    }

    if (text === '/cambodia_market') {
        await handleCambodiaMarket(chatId);
        return;
    }

    if (text === '/risk_assessment') {
        await handleRiskAssessment(chatId);
        return;
    }

    // Market analysis commands
    if (text === '/briefing') {
        await handleMarketBriefing(chatId);
        return;
    }

    if (text === '/regime') {
        await handleRegimeAnalysis(chatId);
        return;
    }

    if (text === '/opportunities') {
        await handleOpportunities(chatId);
        return;
    }

    if (text === '/macro') {
        await handleMacroAnalysis(chatId);
        return;
    }

    // Trading commands
    if (text === '/trading' || text === '/account') {
        await handleTradingStatus(chatId);
        return;
    }

    if (text === '/positions') {
        await handlePositions(chatId);
        return;
    }

    // System status
    if (text === '/status') {
        await handleSystemStatus(chatId);
        return;
    }

    if (text === '/documents') {
        await handleDocumentsList(chatId);
        return;
    }

    // Handle general conversation
    await handleConversation(chatId, text);
});

// Command handlers
async function handleDealAnalysis(chatId, text) {
    try {
        if (text === '/deal_analyze') {
            await sendSmartMessage(bot, chatId, 
                "**Deal Analysis Usage:**\n" +
                "/deal_analyze [amount] [type] [location] [rate] [term]\n\n" +
                "**Example:**\n" +
                "/deal_analyze 500000 commercial \"Phnom Penh\" 18 12"
            );
            return;
        }

        const params = text.replace('/deal_analyze ', '').split(' ');
        if (params.length < 5) {
            await sendSmartMessage(bot, chatId, "❌ Invalid format. Use: /deal_analyze [amount] [type] [location] [rate] [term]");
            return;
        }

        const dealParams = {
            amount: parseFloat(params[0]),
            collateralType: params[1],
            location: params[2].replace(/"/g, ''),
            interestRate: parseFloat(params[3]),
            term: parseInt(params[4])
        };

        await bot.sendMessage(chatId, "📊 Analyzing Cambodia lending deal...");
        const analysis = await analyzeLendingDeal(dealParams);

        if (analysis.error) {
            await sendSmartMessage(bot, chatId, `❌ Analysis error: ${analysis.error}`);
            return;
        }

        let response = `**Cambodia Deal Analysis**\n\n`;
        response += `**Overview:**\n`;
        response += `• Amount: $${analysis.dealSummary.amount.toLocaleString()}\n`;
        response += `• Rate: ${analysis.dealSummary.rate}% annually\n`;
        response += `• Term: ${analysis.dealSummary.term} months\n`;
        response += `• Monthly Payment: $${analysis.dealSummary.monthlyPayment.toFixed(0)}\n\n`;
        
        response += `**Risk Assessment:**\n`;
        response += `• Overall Risk: ${analysis.riskAssessment.overallScore}/100\n`;
        response += `• Risk Category: ${analysis.riskAssessment.riskCategory}\n\n`;
        
        response += `**Recommendation: ${analysis.recommendation.decision}**\n`;
        response += `• Confidence: ${analysis.recommendation.confidence}%\n`;
        response += `• Rationale: ${analysis.recommendation.reasons[0]}`;

        await sendCambodiaAnalysis(bot, chatId, response);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Deal analysis error: ${error.message}`);
    }
}

async function handlePortfolioStatus(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Getting portfolio status...");
        
        const sampleData = {
            totalAUM: 2500000,
            deployedCapital: 2000000,
            availableCapital: 500000,
            activeDeals: 12,
            currentYield: 17.5
        };
        
        const portfolio = await getPortfolioStatus(sampleData);
        
        let response = `**Cambodia Fund Portfolio Status**\n\n`;
        response += `**Fund Overview:**\n`;
        response += `• Total AUM: $${portfolio.fundOverview.totalAUM.toLocaleString()}\n`;
        response += `• Deployed Capital: $${portfolio.fundOverview.deployedCapital.toLocaleString()}\n`;
        response += `• Available Capital: $${portfolio.fundOverview.availableCapital.toLocaleString()}\n`;
        response += `• Active Deals: ${portfolio.fundOverview.numberOfDeals}\n\n`;
        
        response += `**Performance:**\n`;
        response += `• Current Yield: ${portfolio.performance.currentYieldRate.toFixed(2)}%\n`;
        response += `• vs Target: ${portfolio.performance.actualVsTarget > 0 ? '+' : ''}${portfolio.performance.actualVsTarget.toFixed(1)}%\n`;
        response += `• Monthly Income: $${portfolio.performance.monthlyIncome.toLocaleString()}`;

        await sendCambodiaAnalysis(bot, chatId, response);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Portfolio status error: ${error.message}`);
    }
}

async function handleCambodiaMarket(chatId) {
    try {
        await bot.sendMessage(chatId, "🇰🇭 Analyzing Cambodia market conditions...");
        
        const conditions = await getCambodiaMarketConditions();
        
        let response = `**Cambodia Market Analysis**\n\n`;
        response += `**Economic Environment:**\n`;
        response += `• GDP Growth: ${conditions.economicEnvironment.gdpGrowth}%\n`;
        response += `• Inflation: ${conditions.economicEnvironment.inflation}%\n`;
        response += `• Currency Stability: ${conditions.economicEnvironment.currencyStability}\n\n`;
        
        response += `**Interest Rate Environment:**\n`;
        response += `• Commercial Loans: ${conditions.interestRateEnvironment.commercialRates.commercial.average}% avg\n`;
        response += `• Bridge Loans: ${conditions.interestRateEnvironment.commercialRates.bridge.average}% avg\n\n`;
        
        response += `**Market Summary:**\n${conditions.summary}`;

        await sendCambodiaAnalysis(bot, chatId, response);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Cambodia market analysis error: ${error.message}`);
    }
}

async function handleRiskAssessment(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Performing risk assessment...");
        
        const sampleData = {
            totalValue: 2500000,
            numberOfDeals: 12,
            averageRate: 17.5
        };
        
        const risk = await performRiskAssessment(sampleData);
        
        let response = `**Portfolio Risk Assessment**\n\n`;
        response += `**Overall Risk Metrics:**\n`;
        response += `• Risk Score: ${risk.portfolioRisk.overallRiskScore}/100\n`;
        response += `• Concentration Risk: ${risk.portfolioRisk.concentrationRisk}\n`;
        response += `• Credit Risk: ${risk.portfolioRisk.creditRisk}\n`;
        response += `• Market Risk: ${risk.portfolioRisk.marketRisk}\n\n`;
        
        response += `**Stress Testing:**\n`;
        response += `• Economic Downturn: ${risk.stressTesting.economicDownturn}% loss\n`;
        response += `• Interest Rate Shock: ${risk.stressTesting.interestRateShock}% impact`;

        await sendAnalysis(bot, chatId, response, "Risk Assessment");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Risk assessment error: ${error.message}`);
    }
}

async function handleMarketBriefing(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Generating market briefing...");
        
        const marketData = await getComprehensiveMarketData();
        
        let briefing = `**Daily Market Briefing**\n\n`;
        briefing += `📅 ${new Date().toLocaleDateString()}\n\n`;
        
        if (marketData?.markets?.economics) {
            briefing += `**Economic Data:**\n`;
            briefing += `• Fed Rate: ${marketData.markets.economics.fedRate?.value}%\n`;
            briefing += `• Inflation: ${marketData.markets.economics.inflation?.value}%\n\n`;
        }
        
        if (marketData?.markets?.crypto?.bitcoin) {
            const btc = marketData.markets.crypto.bitcoin;
            briefing += `**Crypto:**\n`;
            briefing += `• Bitcoin: $${btc.usd?.toLocaleString()} (${btc.usd_24h_change?.toFixed(1)}%)\n\n`;
        }
        
        if (marketData?.trading && !marketData.trading.error) {
            briefing += `**Your Trading Account:**\n`;
            briefing += `• Balance: ${marketData.trading.account?.balance} ${marketData.trading.account?.currency}\n`;
            briefing += `• Open Positions: ${marketData.trading.openPositions?.length || 0}\n\n`;
        }
        
        briefing += `Ask me for analysis: "What's your take on these conditions?"`;

        await sendMarketAnalysis(bot, chatId, briefing);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Market briefing error: ${error.message}`);
    }
}

async function handleRegimeAnalysis(chatId) {
    try {
        await bot.sendMessage(chatId, "🏛️ Analyzing economic regime...");
        
        const query = "Analyze the current economic regime using Ray Dalio's framework. Consider growth, inflation, and policy environment.";
        const analysis = await getRegimeAnalysis(query);
        
        await sendAnalysis(bot, chatId, analysis, "Economic Regime Analysis");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Regime analysis error: ${error.message}`);
    }
}

async function handleOpportunities(chatId) {
    try {
        await bot.sendMessage(chatId, "🎯 Scanning for opportunities...");
        
        const marketData = await getComprehensiveMarketData();
        const query = `Based on current market conditions, identify top 3 strategic opportunities. Consider the economic environment and risk/reward profiles.`;
        
        const analysis = await getStrategicAnalysis(query);
        await sendAnalysis(bot, chatId, analysis, "Market Opportunities");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Opportunities scan error: ${error.message}`);
    }
}

async function handleMacroAnalysis(chatId) {
    try {
        await bot.sendMessage(chatId, "🌍 Analyzing macro outlook...");
        
        const query = "Provide a comprehensive macro economic outlook. Analyze global growth, inflation trends, central bank policies, and market implications.";
        const analysis = await getGptStrategicAnalysis(query);
        
        await sendAnalysis(bot, chatId, analysis, "Macro Economic Outlook");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Macro analysis error: ${error.message}`);
    }
}

async function handleTradingStatus(chatId) {
    try {
        await bot.sendMessage(chatId, "💹 Getting trading account status...");
        
        const trading = await getTradingSummary();
        
        if (trading?.error) {
            await sendSmartMessage(bot, chatId, "❌ Trading account not connected. Check MetaAPI configuration.");
            return;
        }
        
        let response = `**Trading Account Status**\n\n`;
        response += `**Account:**\n`;
        response += `• Balance: ${trading.account?.balance} ${trading.account?.currency}\n`;
        response += `• Equity: ${trading.account?.equity} ${trading.account?.currency}\n`;
        response += `• Free Margin: ${trading.account?.freeMargin} ${trading.account?.currency}\n\n`;
        
        response += `**Positions:**\n`;
        response += `• Open Positions: ${trading.openPositions?.length || 0}\n`;
        
        if (trading.performance?.currentPnL) {
            const pnlEmoji = trading.performance.currentPnL > 0 ? '🟢' : '🔴';
            response += `• Current P&L: ${pnlEmoji} ${trading.performance.currentPnL.toFixed(2)}`;
        }

        await sendAnalysis(bot, chatId, response, "Trading Account");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Trading status error: ${error.message}`);
    }
}

async function handlePositions(chatId) {
    try {
        const { getOpenPositions } = require('./utils/metaTrader');
        const positions = await getOpenPositions();
        
        if (!positions || positions.length === 0) {
            await sendSmartMessage(bot, chatId, "📊 No open positions found.");
            return;
        }
        
        let response = `**Open Positions (${positions.length})**\n\n`;
        positions.forEach((pos, i) => {
            const pnlEmoji = pos.profit > 0 ? '🟢' : pos.profit < 0 ? '🔴' : '⚪';
            response += `${i + 1}. ${pnlEmoji} **${pos.symbol}** ${pos.type}\n`;
            response += `   Volume: ${pos.volume} lots\n`;
            response += `   P&L: ${pos.profit?.toFixed(2)}\n\n`;
        });

        await sendAnalysis(bot, chatId, response, "Open Positions");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Positions error: ${error.message}`);
    }
}

async function handleSystemStatus(chatId) {
    try {
        const health = await checkSystemHealth();
        
        let status = `**System Status**\n\n`;
        status += `**AI Models:**\n`;
        status += `• GPT-4o: ${health.gptAnalysis ? '✅ Online' : '❌ Offline'}\n`;
        status += `• Claude Opus 4.1: ${health.claudeAnalysis ? '✅ Online' : '❌ Offline'}\n\n`;
        
        status += `**Systems:**\n`;
        status += `• Database: ${health.contextBuilding ? '✅ Connected' : '❌ Disconnected'}\n`;
        status += `• DateTime: ${health.dateTimeSupport ? '✅ Working' : '❌ Error'}\n\n`;
        
        status += `**Overall Status: ${health.overallHealth ? '🟢 Healthy' : '🔴 Degraded'}**`;

        await sendAnalysis(bot, chatId, status, "System Status");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Status check error: ${error.message}`);
    }
}

async function handleDocumentsList(chatId) {
    try {
        const { getTrainingDocumentsDB } = require('./utils/database');
        const docs = await getTrainingDocumentsDB(chatId);
        
        if (docs.length === 0) {
            await sendSmartMessage(bot, chatId, 
                `📚 **No Training Documents Found**\n\n` +
                `**How to add documents:**\n` +
                `• Upload any file (.txt, .pdf, .docx)\n` +
                `• Add caption: "train"\n` +
                `• AI will save it for reference\n\n` +
                `**Supported:** Text, PDF, Word, Markdown`
            );
            return;
        }
        
        let response = `📚 **Your AI Training Documents (${docs.length})**\n\n`;
        docs.forEach((doc, i) => {
            const uploadDate = new Date(doc.upload_date).toLocaleDateString();
            response += `**${i + 1}. ${doc.file_name}**\n`;
            response += `• Words: ${doc.word_count?.toLocaleString() || 'Unknown'}\n`;
            response += `• Added: ${uploadDate}\n\n`;
        });
        
        response += `💡 Your AI can now answer questions about these documents!`;

        await sendSmartMessage(bot, chatId, response);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Documents list error: ${error.message}`);
    }
}

async function handleConversation(chatId, text) {
    try {
        console.log("🤖 Processing conversation:", text.substring(0, 50));
        
        // Use dual command system for intelligent routing
        const result = await executeDualCommand(text, chatId);
        
        // Send response
        await sendSmartMessage(bot, chatId, result.response);
        
        // Save conversation
        await saveConversationDB(chatId, text, result.response, "text").catch(console.error);
        
    } catch (error) {
        console.error('❌ Conversation error:', error.message);
        
        // Fallback to simple GPT response
        try {
            const response = await getGptAnalysis(text, { maxTokens: 1000 });
            await sendSmartMessage(bot, chatId, response);
        } catch (fallbackError) {
            await sendSmartMessage(bot, chatId, 
                `Sorry, I'm having technical difficulties. Please try again in a moment. 🔧`
            );
        }
    }
}

// Express server setup
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Webhook endpoint
app.post("/webhook", (req, res) => {
    console.log("📨 Webhook received");
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Health check
app.get("/", (req, res) => {
    res.status(200).send("✅ AI Assistant is running");
});

app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        models: ["GPT-4o", "Claude Opus 4.1"],
        features: ["Market Analysis", "Cambodia Fund", "Document Processing"]
    });
});

// API endpoints
app.get("/analyze", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({
            error: "Provide query: ?q=your-question",
            example: "/analyze?q=What's the current market outlook?",
            models: ["GPT-4o", "Claude Opus 4.1"]
        });
    }

    try {
        const response = await getGptAnalysis(query, { maxTokens: 2000 });
        res.json({
            query: query,
            response: response,
            model: "GPT-4o",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Analysis failed",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get("/claude", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({
            error: "Provide query: ?q=your-question",
            example: "/claude?q=Analyze current economic regime",
            model: "Claude Opus 4.1"
        });
    }

    try {
        const response = await getClaudeAnalysis(query, { maxTokens: 2000 });
        res.json({
            query: query,
            response: response,
            model: "Claude Opus 4.1",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Claude analysis failed",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get("/dual", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({
            error: "Provide query: ?q=your-question",
            example: "/dual?q=Comprehensive market analysis",
            description: "Smart routing between GPT-4o and Claude Opus 4.1"
        });
    }

    try {
        const chatId = `api_${Date.now()}`;
        const result = await executeDualCommand(query, chatId);
        
        res.json({
            query: query,
            response: result.response,
            aiUsed: result.aiUsed,
            reasoning: result.reasoning,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Dual command failed",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get("/status", async (req, res) => {
    try {
        const health = await checkSystemHealth();
        const stats = await getDatabaseStats().catch(() => ({}));
        
        res.json({
            system: "AI Assistant",
            models: {
                gpt4o: health.gptAnalysis ? "online" : "offline",
                claude: health.claudeAnalysis ? "online" : "offline"
            },
            features: {
                dualCommand: health.dualMode,
                database: health.contextBuilding,
                datetime: health.dateTimeSupport
            },
            stats: stats,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Status check failed",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ AI Assistant running on port " + PORT);
    console.log("🤖 Models: GPT-4o + Claude Opus 4.1");
    console.log("🏦 Features: Cambodia Fund + Market Analysis + Document Processing");
    console.log("🔗 API Endpoints:");
    console.log(`   GPT-4o: http://localhost:${PORT}/analyze?q=your-question`);
    console.log(`   Claude: http://localhost:${PORT}/claude?q=your-question`);
    console.log(`   Dual AI: http://localhost:${PORT}/dual?q=your-question`);
    console.log(`   Status: http://localhost:${PORT}/status`);

    // Set webhook with CORRECT URL
    const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
    bot.setWebHook(webhookUrl)
        .then(() => {
            console.log("🔗 Webhook configured:", webhookUrl);
            console.log("🚀 AI Assistant ready!");
        })
        .catch((err) => {
            console.error("❌ Webhook setup failed:", err.message);
            console.log("🔄 Running in polling mode for development");
        });
});
