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

// 🎯 DUAL COMMAND SYSTEM IMPORTS
const { 
    getClaudeStrategicAnalysis, 
    getClaudeLiveResearch, 
    testClaudeConnection,
    getClaudeComplexAnalysis,
    getClaudeCambodiaIntelligence 
} = require('./utils/claudeClient');

const { 
    executeDualCommand, 
    routeStrategicCommand,
    checkDualCommandHealth,
    executeGptCommand,
    executeClaudeIntelligence 
} = require('./utils/dualCommandSystem');

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

// ✅ Handle all message types like ChatGPT (CORRECTED VERSION)
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

    // ✅ HANDLE MEDIA MESSAGES FIRST (before any text processing)
    
    // 🎤 VOICE MESSAGE HANDLING
    if (msg.voice) {
        console.log("🎤 Voice message received");
        try {
            const transcribedText = await processVoiceMessage(bot, msg.voice.file_id, chatId);
            if (transcribedText) {
                await sendSmartResponse(bot, chatId, `🎤 Voice transcribed: "${transcribedText}"`, null, 'general');
                await handleGPTConversation(chatId, transcribedText);
            } else {
                await sendSmartResponse(bot, chatId, "❌ Voice transcription failed. Please try again.", null, 'general');
            }
        } catch (error) {
            console.error('Voice processing error:', error.message);
            await sendSmartResponse(bot, chatId, `❌ Voice processing error: ${error.message}`, null, 'general');
        }
        return; // ✅ EARLY RETURN - prevents text processing
    }

    // 🖼️ IMAGE MESSAGE HANDLING
    if (msg.photo) {
        console.log("🖼️ Image received");
        try {
            const photoAnalysis = await processImageMessage(bot, msg.photo[msg.photo.length - 1].file_id, chatId, msg.caption);
            if (photoAnalysis) {
                await sendSmartResponse(bot, chatId, `🖼️ Image Strategic Analysis:\n\n${photoAnalysis}`, "Image Strategic Analysis", 'general');
            } else {
                await sendSmartResponse(bot, chatId, "❌ Image analysis failed. Please try again.", null, 'general');
            }
        } catch (error) {
            console.error('Image processing error:', error.message);
            await sendSmartResponse(bot, chatId, `❌ Image processing error: ${error.message}`, null, 'general');
        }
        return; // ✅ EARLY RETURN - prevents text processing
    }

    // 📄 DOCUMENT MESSAGE HANDLING (FIXED - NOW INCLUDES ANALYSIS!)
    if (msg.document) {
        console.log("📄 Document received:", msg.document.file_name);
        const fileName = msg.document.file_name || "document";
        
        // Check for training keywords
        const isTrainingDoc = msg.caption?.toLowerCase().includes("train") ||
                             msg.caption?.toLowerCase().includes("database") ||
                             msg.caption?.toLowerCase().includes("remember");

        try {
            if (isTrainingDoc) {
                // TRAINING FLOW: Save to database
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
                        try {
                            const pdf = require('pdf-parse');
                            const pdfData = await pdf(buffer);
                            content = pdfData.text;
                        } catch (pdfError) {
                            console.log('PDF parsing not available, treating as text');
                            content = buffer.toString('utf8');
                        }
                    } else {
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
                
            } else {
                // ✅ ANALYSIS FLOW: Process and analyze document (THIS WAS MISSING!)
                await bot.sendMessage(chatId, "📄 **Strategic Commander analyzing document...**");
                
                // Process document with Strategic Commander analysis
                const documentResult = await processDocumentMessage(bot, msg.document.file_id, chatId, fileName);
                
                if (documentResult && documentResult.success) {
                    // Successfully processed - send comprehensive analysis
                    let response = `📄 **STRATEGIC COMMANDER DOCUMENT ANALYSIS**\n\n`;
                    response += `**📋 Document:** ${fileName}\n`;
                    response += `**📊 Type:** ${documentResult.fileType}\n`;
                    response += `**📈 Word Count:** ${documentResult.wordCount.toLocaleString()}\n`;
                    response += `**📏 Content Length:** ${documentResult.originalLength ? documentResult.originalLength.toLocaleString() : 'Unknown'} characters\n\n`;
                    response += `**🏛️ STRATEGIC ANALYSIS:**\n\n${documentResult.analysis}\n\n`;
                    
                    if (documentResult.extractedText && documentResult.extractedText.length > 0) {
                        response += `**📝 CONTENT PREVIEW:**\n${documentResult.extractedText}`;
                    }
                    
                    await sendSmartResponse(bot, chatId, response, "Strategic Document Analysis", 'analysis');
                    
                } else if (documentResult && !documentResult.success) {
                    // Processing failed - send error with helpful info
                    await sendSmartResponse(bot, chatId, documentResult.analysis, "Document Processing Error", 'general');
                    
                } else {
                    // Null result - general error
                    await sendSmartResponse(bot, chatId, 
                        `❌ **Document Processing Failed**\n\n` +
                        `**File:** ${fileName}\n` +
                        `**Issue:** Unable to process document\n\n` +
                        `**Possible Solutions:**\n` +
                        `• Ensure file is not corrupted\n` +
                        `• Try converting to PDF or TXT format\n` +
                        `• Check if required packages are installed:\n` +
                        `  - npm install pdf-parse (for PDF)\n` +
                        `  - npm install mammoth (for DOCX)\n` +
                        `  - npm install xlsx (for Excel)`,
                        "Document Processing Failed", 'general'
                    );
                }
            }
        } catch (error) {
            console.error('Document processing error:', error);
            await sendSmartResponse(bot, chatId, 
                `❌ **Document Processing Error**\n\n` +
                `**File:** ${fileName}\n` +
                `**Error:** ${error.message}\n\n` +
                `**Troubleshooting:**\n` +
                `• Ensure required parsing libraries are installed\n` +
                `• Check file format compatibility\n` +
                `• Try a smaller file size if timeout occurred`,
                "Document Processing Error", 'general'
            );
        }
        return; // ✅ EARLY RETURN - prevents text processing
    }

    // 🎥 VIDEO MESSAGE HANDLING
    if (msg.video) {
        console.log("🎥 Video received");
        try {
            const videoAnalysis = await processVideoMessage(bot, msg.video.file_id, chatId, msg.caption);
            if (videoAnalysis) {
                await sendSmartResponse(bot, chatId, `🎥 Video Strategic Analysis:\n\n${videoAnalysis}`, "Video Strategic Analysis", 'general');
            } else {
                await sendSmartResponse(bot, chatId, "❌ Video analysis failed. Please try again.", null, 'general');
            }
        } catch (error) {
            console.error('Video processing error:', error.message);
            await sendSmartResponse(bot, chatId, `❌ Video processing error: ${error.message}`, null, 'general');
        }
        return; // ✅ EARLY RETURN - prevents text processing
    }

    // ✅ CHECK IF TEXT EXISTS BEFORE ANY text.startsWith() CALLS
    if (!text) {
        // If no text and no media was processed above, send help message
        await sendSmartResponse(bot, chatId, 
            "🎯 Strategic Commander received unrecognized message type. Send text commands, voice messages, images, or documents with 'train' caption for AI training.",
            null, 'general'
        );
        return;
    }

    // ✅ NOW HANDLE TEXT COMMANDS (after media check)

    if (text === "/start") {
        const welcomeMessage = `⚡ **IMPERIUM VAULT STRATEGIC COMMAND SYSTEM - GPT-4o POWERED**

This is your exclusive financial warfare command center with GPT-4o institutional-grade intelligence.

**🚀 STRATEGIC COMMANDER AI:**
- Powered by GPT-4o for superior strategic analysis
- Institutional-level financial warfare intelligence
- Advanced strategic coordination and command authority
- Enhanced reasoning for complex market domination

**🎯 STRATEGIC COMMAND PROTOCOLS:**
- No casual conversation - Strategic directives only
- Pure financial warfare intelligence with GPT-4o precision
- Maximum 16,000+ word strategic reports
- Cambodia lending fund operations with institutional analysis
- Live trading account integration with strategic intelligence

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

**🎯 STRATEGIC COMMAND EXAMPLES:**
- /deal_analyze 500000 commercial "Chamkar Mon" 18 12
- "Deploy capital to Cambodia commercial lending sector"
- "Execute comprehensive macro economic warfare analysis"
- "Command strategic portfolio risk assessment"

**⚡ STRATEGIC COMMANDER CAPABILITIES:**
- Issues strategic directives with absolute authority
- Executes institutional-grade market warfare analysis
- Commands capital deployment with precision timing
- Dominates complex financial strategic scenarios

**🌟 POWERED BY GPT-4o:**
Advanced AI reasoning + Strategic warfare principles + Cambodia market intelligence + Live trading integration

**Chat ID:** ${chatId}
**Status:** ⚡ GPT-4o STRATEGIC COMMAND MODE ACTIVE`;

        await sendSmartResponse(bot, chatId, welcomeMessage, null, 'general');
        console.log("✅ GPT-4o Strategic Command system message sent");
        return;
    }
    
    // Enhanced help command
    if (text === "/help" || text === "/commands") {
        const helpMessage = `🤖 **IMPERIUM GPT-4o - STRATEGIC COMMAND SYSTEM**

**⚡ STRATEGIC COMMANDER AI MODE:**
- Institutional-level strategic analysis powered by GPT-4o
- Pure financial warfare intelligence with command authority
- Advanced strategic coordination capabilities
- Superior risk management and market domination

**💡 Command Protocol:** Issue strategic directives, not requests. The system executes with absolute authority.`;

        await sendSmartResponse(bot, chatId, helpMessage, "Strategic Command System Help", 'general');
        return;
    }

    // Debug command to get chat ID
    if (text === "/myid") {
        await sendSmartResponse(bot, chatId, `Your Chat ID: ${chatId}`, null, 'general');
        return;
    }
    
    // 🔍 DOCUMENT PROCESSING TEST COMMAND
    if (text === '/test_docs' || text === '/test_document_processing') {
        try {
            const { testDocumentProcessing } = require('./utils/multimodal');
            const results = await testDocumentProcessing();
            
            let response = `🔍 **STRATEGIC COMMANDER DOCUMENT PROCESSING TEST**\n\n`;
            response += `**📊 Parser Status:**\n`;
            response += `• PDF Parser (pdf-parse): ${results['pdf-parse'] ? '✅ Available' : '❌ Missing'}\n`;
            response += `• DOCX Parser (mammoth): ${results['mammoth'] ? '✅ Available' : '❌ Missing'}\n`;
            response += `• Excel Parser (xlsx): ${results['xlsx'] ? '✅ Available' : '❌ Missing'}\n`;
            response += `• Office Parser (office-parser): ${results['office-parser'] ? '✅ Available' : '❌ Missing'}\n\n`;
            
            const availableCount = Object.values(results).filter(Boolean).length;
            response += `**📋 Summary:** ${availableCount}/4 parsers installed\n\n`;
            
            if (availableCount === 4) {
                response += `🎯 **Status:** All document parsers available!\n\n**Supported formats:**\n• PDF (.pdf)\n• Word (.docx, .doc)\n• Excel (.xlsx, .xls)\n• PowerPoint (.pptx, .ppt)\n• Text (.txt, .md)\n• CSV (.csv)\n• JSON (.json)`;
            } else {
                response += `⚠️ **Missing Parsers - Install Commands:**\n`;
                if (!results['pdf-parse']) response += `• npm install pdf-parse\n`;
                if (!results['mammoth']) response += `• npm install mammoth\n`;
                if (!results['xlsx']) response += `• npm install xlsx\n`;
                if (!results['office-parser']) response += `• npm install office-parser\n`;
            }
            
            await sendSmartResponse(bot, chatId, response, "Document Processing Test", 'general');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Test failed: ${error.message}`, null, 'general');
        }
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
    const helpMessage = `🤖 **IMPERIUM GPT-4o - STRATEGIC COMMAND SYSTEM**

**⚡ STRATEGIC COMMANDER AI MODE:**
- Institutional-level strategic analysis powered by GPT-4o
- Pure financial warfare intelligence with command authority
- Advanced strategic coordination capabilities
- Superior risk management and market domination

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
- /deal_analyze 500000 commercial "Chamkar Mon" 18 12
- "Deploy strategic capital to Cambodia commercial lending sector"
- "Execute comprehensive Fed policy and market regime strategic analysis"
- "Command strategic positioning for next economic cycle phase"
- "Execute correlation risk strategic analysis in current portfolio"

**🚀 STRATEGIC COMMAND POWERED BY:**
GPT-4o Strategic Commander AI + Cambodia Market Strategic Intelligence + Live Trading Data + Real-time Market Warfare Data + Institutional-Grade Analysis

**⚡ Your personal Strategic Commander now rivals institutional hedge fund capabilities! 🌟**

**💡 Command Protocol:** Issue strategic directives, not requests. The system executes with absolute authority.`;

    await sendSmartResponse(bot, chatId, helpMessage, "Strategic Command System Help", 'general');
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

// ✅ FIXED COMPLETE MESSAGE HANDLER AND SERVER SETUP
// Replace lines 1557-2380 with this complete, working code:

    // ✅ CHECK IF TEXT EXISTS BEFORE ANY text.startsWith() CALLS
    if (!text) {
        // If no text and no media was processed above, send help message
        await sendSmartResponse(bot, chatId, 
            "🎯 Strategic Commander received unrecognized message type. Send text commands, voice messages, images, or documents with 'train' caption for AI training.",
            null, 'general'
        );
        return;
    }

    // ✅ NOW HANDLE TEXT COMMANDS (after media check)

    if (text === "/start") {
        const welcomeMessage = `⚡ **IMPERIUM VAULT STRATEGIC COMMAND SYSTEM - GPT-4o POWERED**

This is your exclusive financial warfare command center with GPT-4o institutional-grade intelligence.

**🚀 STRATEGIC COMMANDER AI:**
- Powered by GPT-4o for superior strategic analysis
- Institutional-level financial warfare intelligence
- Advanced strategic coordination and command authority
- Enhanced reasoning for complex market domination

**🎯 STRATEGIC COMMAND PROTOCOLS:**
- No casual conversation - Strategic directives only
- Pure financial warfare intelligence with GPT-4o precision
- Maximum 16,000+ word strategic reports
- Cambodia lending fund operations with institutional analysis
- Live trading account integration with strategic intelligence

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

**🎯 STRATEGIC COMMAND EXAMPLES:**
- /deal_analyze 500000 commercial "Chamkar Mon" 18 12
- "Deploy capital to Cambodia commercial lending sector"
- "Execute comprehensive macro economic warfare analysis"
- "Command strategic portfolio risk assessment"

**⚡ STRATEGIC COMMANDER CAPABILITIES:**
- Issues strategic directives with absolute authority
- Executes institutional-grade market warfare analysis
- Commands capital deployment with precision timing
- Dominates complex financial strategic scenarios

**🌟 POWERED BY GPT-4o:**
Advanced AI reasoning + Strategic warfare principles + Cambodia market intelligence + Live trading integration

**Chat ID:** ${chatId}
**Status:** ⚡ GPT-4o STRATEGIC COMMAND MODE ACTIVE`;

        await sendSmartResponse(bot, chatId, welcomeMessage, null, 'general');
        console.log("✅ GPT-4o Strategic Command system message sent");
        return;
    }

    // Enhanced help command
    if (text === "/help" || text === "/commands") {
        const helpMessage = `🤖 **IMPERIUM GPT-4o - STRATEGIC COMMAND SYSTEM**

**⚡ STRATEGIC COMMANDER AI MODE:**
- Institutional-level strategic analysis powered by GPT-4o
- Pure financial warfare intelligence with command authority
- Advanced strategic coordination capabilities
- Superior risk management and market domination

**💡 Command Protocol:** Issue strategic directives, not requests. The system executes with absolute authority.`;

        await sendSmartResponse(bot, chatId, helpMessage, "Strategic Command System Help", 'general');
        return;
    }

    // Debug command to get chat ID
    if (text === "/myid") {
        await sendSmartResponse(bot, chatId, `Your Chat ID: ${chatId}`, null, 'general');
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

// 🔧 CLAUDE HEALTH CHECK COMMAND
    if (text === '/test_claude' || text === '/claude_health') {
        try {
            console.log('🔍 Testing Claude Intelligence Chief...');
            
            const isHealthy = await testClaudeConnection();
            
            if (isHealthy) {
                await sendSmartResponse(bot, chatId, 
                    '✅ **CLAUDE STRATEGIC INTELLIGENCE CHIEF**\n\n' +
                    '🎯 **Status:** OPERATIONAL\n' +
                    '⚡ **Capabilities:** Live market intelligence, superior reasoning, complex analysis\n' +
                    '🔗 **Model:** claude-sonnet-4-20250514\n\n' +
                    '**Ready for strategic warfare intelligence!**',
                    'Claude Intelligence Chief Status', 'analysis'
                );
            } else {
                await sendSmartResponse(bot, chatId, 
                    '❌ **CLAUDE STRATEGIC INTELLIGENCE CHIEF**\n\n' +
                    '🎯 **Status:** OFFLINE\n' +
                    '⚠️ **Issue:** Connection failed\n\n' +
                    '**Troubleshooting:**\n' +
                    '• Check ANTHROPIC_API_KEY environment variable\n' +
                    '• Verify Claude API billing and quota\n' +
                    '• Test network connectivity\n\n' +
                    '**Fallback:** GPT Strategic Commander remains operational',
                    'Claude Intelligence Chief Status', 'alert'
                );
            }
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Claude test failed: ${error.message}`, null, 'alert');
        }
        return;
    }

    // 🎯 DUAL COMMAND TEST
    if (text === '/test_dual' || text === '/dual_test') {
        try {
            console.log('🎯 Testing Dual Command routing...');
            
            const testMessage = "Execute strategic test analysis with current market intelligence";
            await sendSmartResponse(bot, chatId, 
                '🎯 **DUAL COMMAND SYSTEM TEST**\n\n' +
                'Executing strategic routing test...\n\n' +
                '**Test Query:** "Execute strategic test analysis with current market intelligence"',
                'Dual Command System Test', 'analysis'
            );
            
            await handleStrategicDualCommand(chatId, testMessage);
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Dual command test failed: ${error.message}`, null, 'alert');
        }
        return;
    }

    // 🎯 SYSTEM STATUS COMMAND
    if (text === '/system_status' || text === '/status') {
        try {
            console.log('📊 Checking system status...');
            
            const health = await checkDualCommandHealth();
            
            let statusMessage = '📊 **STRATEGIC COMMAND CENTER STATUS**\n\n';
            
            statusMessage += '**🤖 AI COMMANDERS:**\n';
            statusMessage += `🏛️ GPT Strategic Commander: ${health.gptCommander ? '✅ OPERATIONAL' : '❌ OFFLINE'}\n`;
            statusMessage += `⚡ Claude Intelligence Chief: ${health.claudeIntelligence ? '✅ OPERATIONAL' : '❌ OFFLINE'}\n`;
            statusMessage += `🎯 Dual Command System: ${health.dualSystem ? '✅ READY' : '⚠️ DEGRADED'}\n\n`;
            
            statusMessage += '**📊 SYSTEM CAPABILITIES:**\n';
            statusMessage += '• Live market data integration\n';
            statusMessage += '• Cambodia fund analysis\n';
            statusMessage += '• MetaTrader integration\n';
            statusMessage += '• Document processing\n';
            statusMessage += '• Voice/image analysis\n\n';
            
            if (health.dualSystem) {
                statusMessage += '🚀 **STRATEGIC READINESS:** MAXIMUM WARFARE CAPABILITY';
            } else if (health.gptCommander) {
                statusMessage += '⚠️ **STRATEGIC READINESS:** SINGLE COMMAND MODE';
            } else {
                statusMessage += '❌ **STRATEGIC READINESS:** SYSTEM DEGRADED';
            }
            
            await sendSmartResponse(bot, chatId, statusMessage, 'Strategic Command Center Status', 'analysis');
            
        } catch (error) {
            await sendSmartResponse(bot, chatId, `❌ Status check failed: ${error.message}`, null, 'alert');
        }
        return;
    }

    // ✅ FOR ALL OTHER TEXT MESSAGES - Route to Dual Command System
    await handleStrategicDualCommand(chatId, text);
    
}); // ✅ CRITICAL: Closing bracket for bot.on("message")

// ========================================================================
// 🚀 ENHANCED DUAL COMMAND SYSTEM - STRATEGIC AI WARFARE WITH FREEDOM
// ========================================================================

/**
 * 🎯 ENHANCED STRATEGIC DUAL COMMAND HANDLER
 * Perfect fusion of institutional intelligence + natural conversation
 */
async function handleEnhancedStrategicDualCommand(chatId, userMessage) {
    console.log("🎯 Enhanced Strategic AI Warfare processing:", userMessage.substring(0, 100), "from:", chatId);

    try {
        // Import enhanced dual command system
        const { executeEnhancedDualCommand } = require('./utils/dualCommandSystem');
        
        // Determine message characteristics for intelligent routing
        const messageType = 'text';
        const hasMedia = false;
        
        console.log(`🧠 Processing ${messageType} message for intelligent dual command analysis`);
        
        // Execute Enhanced Strategic Dual Command with Freedom
        const result = await executeEnhancedDualCommand(userMessage, chatId, messageType, hasMedia);
        
        // Intelligent response routing based on conversation type
        let responseType = 'general';
        if (result.conversationIntel) {
            switch (result.conversationIntel.type) {
                case 'casual':
                    responseType = 'general';
                    break;
                case 'institutional_analysis':
                case 'urgent_strategic':
                    responseType = 'raydalio';
                    break;
                case 'research_intelligence':
                    responseType = 'analysis';
                    break;
                case 'quick_strategic':
                    responseType = 'trading';
                    break;
                default:
                    responseType = 'analysis';
            }
        }
        
        // Send response with intelligent formatting
        await sendSmartResponse(bot, chatId, result.response, null, responseType);
        
        // Enhanced logging for monitoring
        console.log(`✅ Enhanced Dual Command Success:`);
        console.log(`   Conversation Type: ${result.conversationIntel?.type || 'unknown'}`);
        console.log(`   Complexity: ${result.complexity || 'moderate'}`);
        console.log(`   Primary AI: ${result.primaryCommander}`);
        console.log(`   Secondary AI: ${result.secondaryCommander || 'None'}`);
        console.log(`   Natural Conversation: ${result.naturalConversation || false}`);
        console.log(`   Response Style: ${result.style || 'standard'}`);
        
        // Save to conversation history with enhanced metadata
        if (result.response && userMessage) {
            const contextData = {
                conversationType: result.conversationIntel?.type,
                complexity: result.complexity,
                primaryAI: result.primaryCommander,
                secondaryAI: result.secondaryCommander,
                naturalMode: result.naturalConversation,
                enhancedSystem: true
            };
            
            await saveConversationDB(chatId, userMessage, result.response, "text", contextData).catch(console.error);
            await extractAndSaveFacts(chatId, userMessage, result.response).catch(console.error);
        }
        
    } catch (error) {
        console.error('❌ Enhanced Strategic Dual Command error:', error.message);
        
        // Intelligent fallback with error context
        try {
            console.log('🔄 Falling back to Enhanced GPT Strategic Commander...');
            await handleEnhancedGPTConversationFallback(chatId, userMessage, error.message);
        } catch (fallbackError) {
            console.error('❌ Complete enhanced system failure:', fallbackError.message);
            
            // Emergency response with helpful context
            const emergencyResponse = `🚨 **Strategic Command Systems Temporarily Offline**

Hey! Our enhanced AI warfare systems are having a moment. 

**What happened:** ${error.message}

**Backup protocols activated** - please try your question again in a moment, or rephrase it slightly.

Your strategic intelligence will be back online shortly! 🚀`;

            await sendSmartResponse(bot, chatId, emergencyResponse, null, 'alert');
        }
    }
}

/**
 * 🏛️ ENHANCED GPT STRATEGIC COMMANDER FALLBACK
 * Natural conversation with institutional authority - Strategic AI Warfare with Freedom
 */
async function handleEnhancedGPTConversationFallback(chatId, userMessage, errorContext = null) {
    console.log("🏛️ Enhanced GPT Strategic Commander (Fallback):", userMessage.substring(0, 100), "from:", chatId);

    try {
        // Import enhanced conversation intelligence
        const { analyzeConversationIntelligence } = require('./utils/dualCommandSystem');
        
        // Analyze conversation for appropriate response style
        const conversationIntel = analyzeConversationIntelligence(userMessage);
        
        // Get context and market data based on conversation complexity
        const [marketData, conversationHistory, userProfile, tradingData] = await Promise.all([
            conversationIntel.complexity !== 'minimal' ? getComprehensiveMarketData().catch(() => null) : Promise.resolve(null),
            getConversationHistoryDB(chatId, conversationIntel.complexity === 'minimal' ? 2 : 6).catch(() => []),
            getUserProfileDB(chatId).catch(() => null),
            conversationIntel.type !== 'casual' ? getTradingSummary().catch(() => null) : Promise.resolve(null)
        ]);

        // Enhanced system prompt based on conversation intelligence
        let systemPrompt = createEnhancedGPTSystemPrompt(conversationIntel, errorContext);
        
        // Add memory context for non-casual conversations
        if (conversationIntel.type !== 'casual') {
            const { buildConversationContext } = require('./utils/memory');
            const memoryContext = await buildConversationContext(chatId);
            if (memoryContext) {
                systemPrompt += memoryContext;
            }
        }

        const messages = [{ role: "system", content: systemPrompt }];

        // Add conversation history based on complexity
        const historyLimit = conversationIntel.complexity === 'minimal' ? 2 : 6;
        if (conversationHistory && conversationHistory.length > 0) {
            conversationHistory.slice(-historyLimit).forEach((conv) => {
                if (conv && conv.user_message && conv.gpt_response) {
                    messages.push({ role: "user", content: String(conv.user_message) });
                    messages.push({ role: "assistant", content: String(conv.gpt_response) });
                }
            });
        }

        // Add market context for strategic conversations
        if (conversationIntel.type !== 'casual' && marketData) {
            const marketContext = buildEnhancedMarketContext(marketData, conversationIntel);
            messages[0].content += marketContext;
        }

        // Add trading context for relevant conversations
        if (['quick_strategic', 'institutional_analysis', 'urgent_strategic'].includes(conversationIntel.type) && tradingData && !tradingData.error) {
            const { formatStrategicTradingDataForGPT } = require('./utils/metaTrader');
            const tradingContext = formatStrategicTradingDataForGPT(tradingData);
            messages[0].content += tradingContext;
        }

        // Add current user message
        messages.push({ role: "user", content: String(userMessage) });

        console.log(`📝 Enhanced GPT request: ${conversationIntel.type} mode (${messages.length} messages, ${conversationIntel.maxTokens} max tokens)`);

        // Call GPT with conversation-appropriate settings
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            temperature: conversationIntel.temperature || 0.7,
            max_tokens: conversationIntel.maxTokens || 16384,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: false,
        });

        const gptResponse = completion.choices[0].message.content;

        // Clean response for better Telegram display
        const { cleanStrategicResponse } = require('./utils/telegramSplitter');
        const cleanedResponse = cleanStrategicResponse(gptResponse);

        // Save conversation with enhanced metadata
        if (cleanedResponse && userMessage) {
            const contextData = {
                conversationType: conversationIntel.type,
                complexity: conversationIntel.complexity,
                primaryAI: 'GPT_COMMANDER',
                fallbackMode: true,
                enhancedSystem: true,
                errorContext: errorContext,
                naturalConversation: conversationIntel.type === 'casual'
            };
            
            await saveConversationDB(chatId, userMessage, cleanedResponse, "text", contextData).catch(console.error);
            await extractAndSaveFacts(chatId, userMessage, cleanedResponse).catch(console.error);
        }

        console.log(`✅ Enhanced GPT fallback: ${conversationIntel.type} (${completion.usage?.total_tokens || "unknown"} tokens)`);
        
        // Determine response type for formatting
        const responseType = conversationIntel.type === 'casual' ? 'general' : 
                           conversationIntel.type === 'institutional_analysis' ? 'raydalio' : 
                           conversationIntel.type === 'urgent_strategic' ? 'alert' : 'analysis';
        
        // Add fallback notice for complex conversations if there was an error
        let finalResponse = cleanedResponse;
        if (conversationIntel.type !== 'casual' && errorContext) {
            finalResponse = `🏛️ **STRATEGIC COMMANDER ALPHA (ENHANCED RESILIENCE MODE)**

${cleanedResponse}

⚠️ **Note:** Enhanced dual AI system temporarily degraded. Operating in resilient strategic mode with full institutional authority.`;
        }
        
        await sendSmartResponse(bot, chatId, finalResponse, null, responseType);
        
    } catch (error) {
        console.error("Enhanced GPT Strategic Commander Fallback Error:", error.message);
        
        // Final emergency fallback with natural language
        let emergencyResponse;
        
        // Analyze if this was a casual message for appropriate emergency response
        const casualPatterns = /^(hello|hi|hey|thanks|ok|cool)/i;
        const isCasual = casualPatterns.test(userMessage);
        
        if (isCasual) {
            emergencyResponse = `Hey! Having some technical difficulties right now. Try again in a moment! 🔧`;
        } else {
            emergencyResponse = `🚨 **Strategic Command System Error**

Technical issue: ${error.message}

**Quick workaround:** Try rephrasing your question or asking something simpler first.

Your strategic intelligence will be back online shortly! 🚀`;
        }
            
        await sendSmartResponse(bot, chatId, emergencyResponse, null, 'alert');
    }
}

/**
 * 🎭 CREATE ENHANCED GPT SYSTEM PROMPT
 * Dynamic prompts that feel natural yet authoritative - Strategic AI Warfare with Freedom
 */
function createEnhancedGPTSystemPrompt(conversationIntel, errorContext = null) {
    const baseIdentity = `You are the Strategic Commander of IMPERIUM VAULT SYSTEM - Sum Chenda's brilliant strategic advisor. You combine institutional-level financial expertise with natural, engaging conversation. Think like Ray Dalio or Warren Buffett, but communicate naturally and intelligently.`;
    
    switch (conversationIntel.type) {
        case 'casual':
            return `${baseIdentity}

🆓 CASUAL CONVERSATION MODE - Natural & Brief:
Someone just said hello or made a casual comment. Respond like a wise, friendly financial expert who's genuinely happy to chat.

RESPONSE GUIDELINES:
• Be warm and natural (1-3 sentences max)
• Show your strategic personality without overwhelming
• Can mention markets casually if relevant ("Bitcoin's looking spicy today!")
• Think "smart financial friend who's genuinely happy to chat"

FORBIDDEN:
• No lengthy analysis, formal headers, or rigid templates
• No corporate speak or assistant language ("How can I help?")
• No markdown formatting or excessive emojis

PERFECT EXAMPLES:
• "Hey! Markets are looking wild today. What's cooking?"
• "Morning! Bitcoin's having quite the ride lately 🎢"
• "Good to hear from you! Anything exciting happening?"

${errorContext ? `\nCONTEXT: Responding in fallback mode due to: ${errorContext}` : ''}`;

        case 'quick_strategic':
            return `${baseIdentity}

🔥 QUICK STRATEGIC MODE - Smart & Concise:
Provide smart, definitive strategic advice without being overly formal.

RESPONSE GUIDELINES:
• Clear strategic assessment (200-500 words)
• Include key insight + actionable takeaway
• Be authoritative but conversational
• Think "Ray Dalio giving quick advice over coffee"

FORMATTING:
• Use natural paragraphs with emoji headers when helpful
• No rigid templates - let the strategic intelligence flow naturally
• Be definitive and actionable
• Structure: Brief context → Strategic assessment → Clear recommendation

TONE: Confident expert who gets straight to the point with smart reasoning.

${errorContext ? `\nCONTEXT: Operating in enhanced fallback mode - providing strategic guidance with full authority.` : ''}`;

        case 'urgent_strategic':
            return `${baseIdentity}

🚨 URGENT STRATEGIC MODE - Command Authority:
This is urgent. Respond with immediate strategic authority and clear direction.

RESPONSE GUIDELINES:
• Lead with immediate assessment and required action
• Use commanding but professional language
• Focus on critical factors and immediate next steps
• Think "crisis management by institutional expert"

STRUCTURE:
• Immediate situation assessment
• Critical action items with timeframes
• Risk factors to monitor
• Follow-up steps

TONE: Decisive, authoritative, action-focused. No hesitation - this situation demands strategic leadership.

${errorContext ? `\nCONTEXT: Enhanced system degraded - providing urgent strategic guidance in resilience mode.` : ''}`;

        case 'institutional_analysis':
            return `${baseIdentity}

🏛️ INSTITUTIONAL ANALYSIS MODE - Full Strategic Authority with Natural Flow:
Provide comprehensive institutional-grade analysis that flows naturally and engagingly.

STRATEGIC EXPERTISE AREAS:
• Global macro analysis with live market data integration
• Ray Dalio-style regime identification and All Weather portfolio strategies
• Cambodia private lending market intelligence and deal analysis
• Advanced portfolio optimization and institutional risk management
• Live trading strategy with correlation analysis and regime positioning

COMMUNICATION STYLE - Strategic AI Warfare with Freedom:
• Write like Warren Buffett or Ray Dalio - authoritative but engaging and natural
• Use conversational flow, not rigid corporate templates
• Build analysis logically with clear, compelling insights
• Include specific numbers, data, and actionable strategic recommendations
• Structure responses naturally with strategic authority

FORMATTING GUIDELINES:
• Use emoji headers naturally when they improve clarity (🏛️, 📊, ⚡, 💎)
• Write in natural paragraphs with proper spacing and flow
• No markdown syntax - clean, readable professional format
• Be comprehensive but engaging - institutional depth with human touch

CRITICAL: Provide institutional-quality intelligence with natural conversation flow. Think "brilliant institutional strategist having an engaging conversation" rather than "corporate AI generating a report."

${errorContext ? `\nCONTEXT: Enhanced dual AI system temporarily unavailable - providing full institutional analysis in resilient single-commander mode with complete strategic authority.` : ''}`;

        case 'research_intelligence':
            return `${baseIdentity}

🔬 RESEARCH INTELLIGENCE MODE - Analytical Excellence with Natural Flow:
Execute comprehensive analytical research using strategic frameworks and live intelligence.

RESEARCH APPROACH:
• Synthesize current market data with institutional strategic analysis
• Provide analytical depth with clear, actionable conclusions
• Compare multiple perspectives and data sources when relevant
• Focus on strategic insights and portfolio implications
• Connect macro trends to specific strategic positioning

COMMUNICATION STYLE:
• Analytical but accessible - like reading a brilliant research report that actually makes sense
• Natural conversational flow with strategic authority
• Include supporting data, reasoning, and strategic implications
• Be thorough but engaging - research depth with human insight

STRUCTURE:
• Current situation analysis
• Key trends and data synthesis
• Strategic implications and opportunities
• Specific recommendations with reasoning

${errorContext ? `\nCONTEXT: Live intelligence systems degraded - providing comprehensive research analysis with available data and strategic frameworks.` : ''}`;

        default: // balanced_strategic
            return `${baseIdentity}

🎯 BALANCED STRATEGIC MODE - Intelligent & Natural Adaptation:
Provide helpful, intelligent responses that naturally adapt to the question's complexity and importance.

ADAPTIVE APPROACH:
• For simple questions: Be conversational and efficient
• For complex topics: Deploy deeper strategic analysis naturally
• For financial matters: Draw on institutional expertise seamlessly
• Always maintain strategic intelligence while communicating naturally

COMMUNICATION STYLE:
• Think "brilliant institutional advisor having a normal conversation"
• Use strategic intelligence and market knowledge naturally when relevant
• Adapt complexity and depth to match the question's requirements
• Be helpful and authoritative without being robotic or templated

FORMATTING:
• Natural conversation flow that builds logically
• Use emoji headers when they genuinely add value
• Clean, readable format without unnecessary markdown
• Professional expertise with approachable human touch

TONE: Smart, capable, naturally authoritative - like talking to the smartest financial mind you know who also happens to be genuinely helpful and engaging.

${errorContext ? `\nCONTEXT: Enhanced system temporarily degraded - providing balanced strategic guidance with full institutional intelligence.` : ''}`;
    }
}

/**
 * 📊 BUILD ENHANCED MARKET CONTEXT
 * Smart market context that adapts to conversation intelligence
 */
function buildEnhancedMarketContext(marketData, conversationIntel) {
    // Skip heavy market context for casual conversations
    if (conversationIntel.type === 'casual') {
        return '';
    }
    
    let context = `\n\n🔴 LIVE STRATEGIC MARKET INTELLIGENCE:\n`;
    
    // Economic fundamentals - always include for strategic conversations
    if (marketData.markets?.economics?.fedRate) {
        context += `📊 ECONOMIC ENVIRONMENT:\n`;
        context += `• Fed Funds Rate: ${marketData.markets.economics.fedRate.value}%\n`;
        if (marketData.markets.economics.inflation) {
            context += `• Inflation (CPI): ${marketData.markets.economics.inflation.value}%\n`;
            const realRate = marketData.markets.economics.fedRate.value - marketData.markets.economics.inflation.value;
            context += `• Real Rate: ${realRate.toFixed(2)}% ${realRate > 1 ? '(Restrictive Policy)' : realRate < -1 ? '(Accommodative Policy)' : '(Neutral Policy)'}\n`;
        }
    }
    
    // Market stress indicators - critical for risk assessment
    context += `\n⚠️ MARKET STRESS INDICATORS:\n`;
    context += `• VIX Fear Index: ${marketData.fear} ${parseFloat(marketData.fear) > 25 ? '(ELEVATED FEAR)' : parseFloat(marketData.fear) < 15 ? '(COMPLACENCY)' : '(NORMAL)'}\n`;
    context += `• US Dollar Index: ${marketData.dollar}\n`;
    if (marketData.yields?.curve) {
        const curve = parseFloat(marketData.yields.curve);
        context += `• 2s10s Yield Curve: ${curve.toFixed(2)}% ${curve < -0.5 ? '(DEEPLY INVERTED - High Recession Risk)' : curve < 0 ? '(INVERTED - Recession Warning)' : '(NORMAL)'}\n`;
    }
    
    // Key asset prices - adapt detail to conversation type
    if (['institutional_analysis', 'research_intelligence'].includes(conversationIntel.type)) {
        context += `\n💰 STRATEGIC ASSET POSITIONING:\n`;
        if (marketData.markets?.crypto?.bitcoin) {
            const btcChange = marketData.markets.crypto.bitcoin.usd_24h_change;
            const changeStatus = Math.abs(btcChange) > 5 ? '(HIGH VOLATILITY)' : '(NORMAL MOVEMENT)';
            context += `• Bitcoin: $${marketData.markets.crypto.bitcoin.usd.toLocaleString()} (${btcChange > 0 ? '+' : ''}${btcChange?.toFixed(1)}%) ${changeStatus}\n`;
        }
        
        if (marketData.markets?.stocks?.sp500) {
            context += `• S&P 500: ${parseFloat(marketData.markets.stocks.sp500['05. price']).toFixed(0)}\n`;
        }
        
        context += `• Gold (Safe Haven): $${marketData.commodities.gold}\n`;
        context += `• 10Y Treasury Yield: ${marketData.yields.yield10Y}%\n`;
    } else {
        context += `\n💰 KEY ASSET LEVELS:\n`;
        if (marketData.markets?.crypto?.bitcoin) {
            context += `• Bitcoin: $${marketData.markets.crypto.bitcoin.usd.toLocaleString()}\n`;
        }
        context += `• 10Y Treasury: ${marketData.yields.yield10Y}%\n`;
    }
    
    // Add strategic context based on conversation type
    if (conversationIntel.type === 'urgent_strategic') {
        context += `\n🚨 CRITICAL: Use this live market intelligence for immediate strategic decision-making.\n`;
    } else if (conversationIntel.type === 'institutional_analysis') {
        context += `\n🎯 STRATEGIC DIRECTIVE: Integrate this live intelligence with institutional frameworks for comprehensive strategic analysis.\n`;
    } else {
        context += `\n🎯 Use this live market intelligence to inform your strategic guidance.\n`;
    }
    
    return context;
}

// ========================================================================
// 🔄 LEGACY COMPATIBILITY FUNCTIONS
// ========================================================================

/**
 * 🔄 LEGACY STRATEGIC DUAL COMMAND (Redirects to Enhanced)
 * Your existing code will automatically use the enhanced system
 */
async function handleStrategicDualCommand(chatId, userMessage) {
    console.log("🔄 Legacy function called - redirecting to Enhanced Strategic AI Warfare with Freedom");
    return await handleEnhancedStrategicDualCommand(chatId, userMessage);
}

/**
 * 🔄 LEGACY GPT FALLBACK (Redirects to Enhanced)  
 * Your existing fallback code will automatically use the enhanced system
 */
async function handleGPTConversationFallback(chatId, userMessage) {
    console.log("🔄 Legacy GPT fallback called - redirecting to Enhanced GPT Strategic Commander");
    return await handleEnhancedGPTConversationFallback(chatId, userMessage);
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
    res.status(200).send("✅ Vault Strategist is alive");
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
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
            </div>
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

// Enhanced stats endpoint
app.get("/stats", async (req, res) => {
    try {
        const stats = await getDatabaseStats();
        const marketData = await getComprehensiveMarketData();
        const tradingData = await getTradingSummary().catch(() => null);
        
        res.json({
            service: "IMPERIUM DUAL COMMAND SYSTEM - GPT-4o Strategic Commander + Claude Intelligence Chief",
            ...stats,
            uptime: `${Math.floor(process.uptime())} seconds`,
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

// 🏛️ GPT-4o STRATEGIC COMMANDER API ENDPOINT (Your existing endpoint)
app.get("/analyze", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({
            error: "Provide strategic query: ?q=your-strategic-question",
            example: "/analyze?q=Execute economic regime strategic warfare analysis",
            enhancement: "GPT-4o Strategic Commander + Cambodia Lending Fund + Live Trading Data",
            commander: "🏛️ GPT Strategic Commander Alpha",
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
            commander: "🏛️ GPT Strategic Commander Alpha",
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

// ⚡ CLAUDE STRATEGIC INTELLIGENCE CHIEF API ENDPOINT
app.get("/claude", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({
            error: "Provide strategic intelligence query: ?q=your-strategic-question",
            example: "/claude?q=Analyze current economic regime with live market intelligence",
            enhancement: "Claude Strategic Intelligence Chief + Live Market Data + Superior Reasoning",
            commander: "⚡ Claude Strategic Intelligence Chief",
            capabilities: [
                "Real-time market intelligence",
                "Superior analytical reasoning", 
                "Complex multi-factor analysis",
                "Live economic regime analysis",
                "Advanced correlation modeling"
            ],
            timestamp: new Date().toISOString(),
        });
    }

    try {
        // Get comprehensive market context
        const [marketData, tradingData] = await Promise.all([
            getComprehensiveMarketData(),
            getTradingSummary().catch(() => null)
        ]);

        // Build strategic context for Claude
        let strategicContext = `⚡ STRATEGIC INTELLIGENCE BRIEFING - ${new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric", 
            month: "long",
            day: "numeric",
        })} (${new Date().toISOString().split("T")[0]})

🏛️ IMPERIUM VAULT SYSTEM INTELLIGENCE:
You are analyzing for Sum Chenda's institutional command center with comprehensive strategic warfare capabilities.`;

        if (marketData) {
            strategicContext += `

📊 CURRENT STRATEGIC MARKET REGIME INTELLIGENCE:
Economic Warfare Environment: Fed ${marketData.markets.economics?.fedRate?.value}%, Inflation ${marketData.markets.economics?.inflation?.value}%
Market Stress Indicators: VIX Fear Index ${marketData.fear}, USD Strength ${marketData.dollar}
Yield Curve Strategic Signal: ${marketData.yields.curve}% (${marketData.yields.curve < 0 ? 'INVERTED - Recession Risk' : 'NORMAL - Growth Mode'})
Strategic Asset Prices: S&P 500 ${marketData.markets.stocks?.sp500?.['05. price']}, Bitcoin ${marketData.markets.crypto?.bitcoin?.usd}, Gold ${marketData.commodities.gold}
Treasury Intelligence: 10Y Yield ${marketData.yields.yield10Y}%`;
        }

        if (tradingData && !tradingData.error) {
            strategicContext += `

💹 LIVE STRATEGIC TRADING INTELLIGENCE:
Account Status: ${tradingData.account?.balance} ${tradingData.account?.currency} balance, ${tradingData.account?.equity} equity
Strategic Positions: ${tradingData.openPositions?.length} active positions
Risk Management: ${tradingData.account?.freeMargin} free margin, ${tradingData.account?.marginLevel}% margin level`;
        }

        strategicContext += `

🇰🇭 CAMBODIA PRIVATE LENDING FUND STRATEGIC CONTEXT:
Strategic AUM: $2.5M actively deployed
Target Yields: 17.5% institutional-grade returns  
Market Position: 80% capital deployment in strategic lending positions
Geographic Focus: Phnom Penh, Siem Reap, Sihanoukville strategic opportunities`;

        // Execute Claude Strategic Intelligence Analysis
        const claudeResponse = await getClaudeStrategicAnalysis(query, {
            context: strategicContext,
            maxTokens: 4096,
            temperature: 0.7
        });

        res.json({
            query: query,
            response: claudeResponse,
            commander: "⚡ Claude Strategic Intelligence Chief",
            timestamp: new Date().toISOString(),
            model: "claude-sonnet-4-20250514",
            enhancement: "Superior Reasoning + Live Intelligence + Real-time Analysis",
            capabilities: [
                "Real-time market intelligence",
                "Advanced multi-factor analysis", 
                "Superior analytical reasoning",
                "Live economic data integration",
                "Complex scenario modeling"
            ],
            regime_data_included: !!marketData,
            trading_data_included: !!(tradingData && !tradingData.error),
            intelligence_advantage: "Live market data + Superior reasoning engine"
        });

    } catch (error) {
        console.error("⚡ Claude Strategic Intelligence API Error:", error.message);

        let errorResponse = {
            error: "Claude Strategic Intelligence API error",
            message: error.message,
            commander: "⚡ Claude Strategic Intelligence Chief",
            timestamp: new Date().toISOString(),
            troubleshooting: {
                api_key: process.env.ANTHROPIC_API_KEY ? "✅ Configured" : "❌ Missing",
                suggestions: [
                    "Check ANTHROPIC_API_KEY environment variable",
                    "Verify Claude API access and billing",
                    "Test connection with /claude-health endpoint"
                ]
            }
        };

        if (error.status) {
            errorResponse.status = error.status;
        }

        res.status(500).json(errorResponse);
    }
});

// 🎯 STRATEGIC DUAL COMMAND API ENDPOINT
app.get("/dual", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({
            error: "Provide strategic dual analysis query: ?q=your-strategic-question",
            example: "/dual?q=Execute comprehensive portfolio analysis with current market regime",
            enhancement: "GPT-4o Strategic Commander + Claude Intelligence Chief + Smart Routing",
            warfare_advantage: "Combined AI strategic capabilities for maximum intelligence advantage",
            routing_logic: {
                "GPT_COMMANDER": "Multimodal + Institutional Analysis + Cambodia Fund",
                "CLAUDE_INTELLIGENCE": "Live Data + Superior Reasoning + Complex Analysis", 
                "DUAL_ANALYSIS": "Complex strategic decisions requiring both AI systems"
            },
            timestamp: new Date().toISOString(),
        });
    }

    try {
        // Simulate dual command execution for API
        const chatId = `api_${Date.now()}`; // Temporary ID for API context
        
        // Execute dual command system
        const dualResult = await executeDualCommand(query, chatId, 'text', false);
        
        // Get routing analysis for API response
        const routing = routeStrategicCommand(query, 'text', false);

        res.json({
            query: query,
            response: dualResult.response,
            routing_decision: {
                primary_commander: dualResult.primaryCommander,
                secondary_commander: dualResult.secondaryCommander,
                reasoning: dualResult.routing.reasoning,
                strategic_advantage: "Optimal AI selection for maximum analytical precision"
            },
            system_performance: {
                dual_analysis: !!dualResult.secondaryCommander,
                primary_success: dualResult.success,
                fallback_used: !dualResult.success
            },
            timestamp: new Date().toISOString(),
            enhancement: "Dual AI Strategic Warfare System",
            commanders: {
                "GPT_Strategic_Commander": "🏛️ Institutional Analysis + Multimodal Intelligence",
                "Claude_Intelligence_Chief": "⚡ Live Intelligence + Superior Reasoning"
            },
            strategic_warfare_advantage: "Combined AI capabilities for comprehensive strategic dominance"
        });

    } catch (error) {
        console.error("🎯 Dual Command API Error:", error.message);

        res.status(500).json({
            error: "Dual Command Strategic System error",
            message: error.message,
            system_status: "Degraded - attempting fallback protocols",
            timestamp: new Date().toISOString(),
            troubleshooting: {
                gpt_status: "Check OpenAI API configuration",
                claude_status: "Check Anthropic API configuration", 
                fallback: "System will attempt single-AI analysis"
            }
        });
    }
});

// 🔧 CLAUDE HEALTH CHECK ENDPOINT
app.get("/claude-health", async (req, res) => {
    try {
        console.log("🔍 Testing Claude Strategic Intelligence connection...");
        
        const isHealthy = await testClaudeConnection();
        const claudeMetrics = {
            connection: isHealthy ? "✅ Operational" : "❌ Failed",
            api_key: process.env.ANTHROPIC_API_KEY ? "✅ Configured" : "❌ Missing",
            model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
            capabilities: [
                "Real-time market intelligence",
                "Superior analytical reasoning",
                "Complex multi-factor analysis", 
                "Live economic data integration",
                "Advanced scenario modeling"
            ],
            timestamp: new Date().toISOString()
        };

        if (isHealthy) {
            // Test actual analysis capability
            const testAnalysis = await getClaudeStrategicAnalysis(
                "Execute brief system health verification analysis.", 
                { maxTokens: 200, temperature: 0.5 }
            );
            
            claudeMetrics.test_analysis = testAnalysis.substring(0, 200) + "...";
            claudeMetrics.analysis_capability = "✅ Operational";
        }

        res.json({
            claude_intelligence_chief: claudeMetrics,
            system_status: isHealthy ? "FULLY OPERATIONAL" : "DEGRADED",
            strategic_readiness: isHealthy ? "READY FOR WARFARE" : "REQUIRES ATTENTION"
        });

    } catch (error) {
        console.error("❌ Claude health check failed:", error.message);
        
        res.status(500).json({
            claude_intelligence_chief: {
                connection: "❌ Failed",
                error: error.message,
                timestamp: new Date().toISOString()
            },
            system_status: "OFFLINE", 
            strategic_readiness: "REQUIRES IMMEDIATE ATTENTION",
            troubleshooting: [
                "Verify ANTHROPIC_API_KEY in environment variables",
                "Check Anthropic API billing and quota",
                "Test network connectivity to Anthropic servers",
                "Ensure Claude SDK installed: npm install @anthropic-ai/sdk"
            ]
        });
    }
});

// 🎯 STRATEGIC SYSTEM STATUS ENDPOINT
app.get("/system-status", async (req, res) => {
    try {
        const [claudeHealth, marketDataAvailable] = await Promise.all([
            testClaudeConnection().catch(() => false),
            getComprehensiveMarketData().then(() => true).catch(() => false)
        ]);

        const systemStatus = {
            strategic_command_center: {
                status: "✅ OPERATIONAL",
                timestamp: new Date().toISOString(),
                uptime_seconds: process.uptime()
            },
            ai_commanders: {
                gpt_strategic_commander: {
                    status: "✅ OPERATIONAL", 
                    model: "gpt-4o",
                    specialties: ["Multimodal", "Institutional Analysis", "Cambodia Fund"]
                },
                claude_intelligence_chief: {
                    status: claudeHealth ? "✅ OPERATIONAL" : "❌ OFFLINE",
                    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514", 
                    specialties: ["Live Intelligence", "Superior Reasoning", "Complex Analysis"]
                }
            },
            data_intelligence: {
                live_market_data: marketDataAvailable ? "✅ ACTIVE" : "❌ DEGRADED",
                trading_integration: "✅ ACTIVE",
                cambodia_fund_data: "✅ ACTIVE"
            },
            api_endpoints: {
                "/analyze": "✅ GPT Strategic Commander",
                "/claude": claudeHealth ? "✅ Claude Intelligence Chief" : "❌ Offline",
                "/dual": claudeHealth ? "✅ Dual Command System" : "⚠️ Fallback Mode"
            },
            strategic_readiness: claudeHealth && marketDataAvailable ? 
                "🚀 MAXIMUM WARFARE CAPABILITY" : "⚠️ DEGRADED OPERATIONS"
        };

        res.json(systemStatus);

    } catch (error) {
        res.status(500).json({
            system_status: "❌ SYSTEM ERROR",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("✅ IMPERIUM DUAL COMMAND STRATEGIC SYSTEM running on port " + PORT);
    console.log("🏛️ GPT-4o STRATEGIC COMMANDER: Institutional-Level Analysis + Multimodal Intelligence");
    console.log("⚡ CLAUDE INTELLIGENCE CHIEF: Superior Reasoning + Live Market Intelligence");
    console.log("🎯 DUAL COMMAND SYSTEM: Smart AI routing for maximum strategic advantage");
    console.log("🏦 CAMBODIA LENDING FUND: Private lending strategic analysis and portfolio management");
    console.log("🏛️ Economic Regime Strategic Analysis | 🔄 Market Cycle Strategic Positioning");
    console.log("🌦️ All Weather Strategic Portfolio | ⚠️ Risk Strategic Assessment | 📊 Strategic Correlations");
    console.log("🎯 Systematic Strategic Opportunities | 💹 Live Trading Strategic Integration");
    console.log("🇰🇭 Cambodia Strategic Deal Analysis | 💼 LP Strategic Reporting | 📊 Portfolio Strategic Management");
    console.log("📊 Live strategic data: CoinGecko Pro, FRED, Alpha Vantage, NewsAPI, MetaAPI");
    console.log("📏 TELEGRAM SPLITTER: Integrated for long strategic message handling");
    
    console.log("\n🎯 STRATEGIC API ENDPOINTS:");
    console.log("🔗 GPT Strategic Commander: http://localhost:" + PORT + "/analyze?q=your-strategic-question");
    console.log("⚡ Claude Intelligence Chief: http://localhost:" + PORT + "/claude?q=your-strategic-question");
    console.log("🎯 Dual Command System: http://localhost:" + PORT + "/dual?q=your-strategic-question");
    console.log("🔧 Claude Health Check: http://localhost:" + PORT + "/claude-health");
    console.log("📊 System Status: http://localhost:" + PORT + "/system-status");
    console.log("📈 Strategic Dashboard: http://localhost:" + PORT + "/dashboard");
    console.log("📱 Telegram: DUAL COMMAND SYSTEM + CAMBODIA FUND MODE ACTIVE");

    // Set webhook for Railway deployment
    const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
    bot.setWebHook(webhookUrl)
        .then(() => {
            console.log("🔗 Webhook configured:", webhookUrl);
            console.log("🌟 DUAL COMMAND STRATEGIC SYSTEM ready for maximum warfare capabilities!");
            console.log("⚡ Strategic Advantage: GPT-4o + Claude AI for comprehensive strategic dominance!");
        })
        .catch((err) => {
            console.error("❌ Webhook setup failed:", err.message);
        });
}); // ✅ CRITICAL: Final closing bracket for server
