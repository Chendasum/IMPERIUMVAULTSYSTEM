require("dotenv").config({ path: ".env" });

// Debug environment variables
console.log("🔧 Environment check:");
console.log(`ADMIN_CHAT_ID: ${process.env.ADMIN_CHAT_ID}`);
console.log(`TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET"}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "SET" : "NOT SET"}`);
console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "SET" : "NOT SET"}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "SET" : "NOT SET"}`);

const TelegramBot = require("node-telegram-bot-api");
const { OpenAI } = require("openai");

// Import enhanced utility modules
const { 
    getRealLiveData, 
    getEnhancedLiveData, 
    getEconomicIndicators,
    getStockMarketData,
    getRayDalioMarketData,
    getCurrentCambodiaDateTime,
    getCurrentGlobalDateTime
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

// Import COMPLETE enhanced database system
const {
    initializeDatabase,
    saveConversationDB,
    getConversationHistoryDB,
    getUserProfileDB,
    getDatabaseStats,
    addPersistentMemoryDB,
    getPersistentMemoryDB,
    saveTrainingDocumentDB,
    getTrainingDocumentsDB,
    saveRegimeData,
    savePortfolioAllocation,
    saveRiskAssessment,
    saveRegimePerformance,
    savePositionSizing,
    saveMarketSignal,
    saveDailyObservation,
    logCommandUsage,
    getCurrentRegime,
    getLatestRiskAssessment,
    saveCambodiaDeal,
    saveCambodiaPortfolio,
    getCambodiaFundAnalytics,
    getLatestCambodiaMarketData,
    getCambodiaDealsBy,
    saveDualAIConversation,
    saveAIHeadToHead,
    saveEnhancedFunctionPerformance,
    getDualAIPerformanceDashboard,
    getConversationIntelligenceAnalytics,
    getMasterEnhancedDualSystemAnalytics,
    saveEnhancedDualConversation,
    getSystemAnalytics,
    getRayDalioStats,
    performHealthCheck,
    updateSystemMetrics,
    performDatabaseMaintenance,
    connectionStats
} = require("./utils/database");

const { buildConversationContext } = require("./utils/memory");
const { getTradingSummary, getAccountInfo } = require("./utils/metaTrader");

// Import enhanced AI clients
const { 
    getClaudeAnalysis,
    getStrategicAnalysis,
    getRegimeAnalysis,
    getCambodiaAnalysis: getClaudeCambodiaAnalysis,
    getPortfolioAnalysis,
    getAnomalyAnalysis
} = require('./utils/claudeClient');

const { 
    getGPT5Analysis,
    getEnhancedMarketAnalysis,
    getEnhancedCambodiaAnalysis,
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

// Enhanced Database Initialization with Full Integration
async function initializeEnhancedDatabase() {
    try {
        console.log("🚀 Initializing Enhanced Strategic Database...");
        
        const initialized = await initializeDatabase();
        
        if (initialized) {
            console.log("✅ Enhanced Strategic Database initialized successfully");
            
            // Test database functions
            await testDatabaseFunctions();
            
            // Initialize daily metrics if needed
            await initializeDailyMetrics();
            
            return true;
        } else {
            throw new Error("Database initialization failed");
        }
    } catch (error) {
        console.error("❌ Enhanced database initialization failed:", error.message);
        console.error("Connection stats:", connectionStats);
        throw error;
    }
}

// Test database functions
async function testDatabaseFunctions() {
    try {
        // Test basic stats
        const stats = await getDatabaseStats();
        console.log("📊 Database stats test:", {
            connectionHealth: connectionStats.connectionHealth,
            totalUsers: stats.totalUsers,
            totalConversations: stats.totalConversations
        });
        
        // Test health check
        const health = await performHealthCheck();
        console.log("🏥 Database health test:", health.status);
        
        return true;
    } catch (error) {
        console.error("⚠️ Database function test failed:", error.message);
        return false;
    }
}

// Initialize daily metrics
async function initializeDailyMetrics() {
    try {
        await updateSystemMetrics({
            system_startup: 1
        });
        console.log("📊 Daily metrics initialized");
    } catch (error) {
        console.error("⚠️ Daily metrics initialization failed:", error.message);
    }
}

// User Authentication
function isAuthorizedUser(chatId) {
    const authorizedUsers = process.env.ADMIN_CHAT_ID
        ? process.env.ADMIN_CHAT_ID.split(",").map((id) => parseInt(id.trim()))
        : [];
    return authorizedUsers.includes(parseInt(chatId));
}

// Enhanced comprehensive market data with database integration
async function getComprehensiveMarketData() {
    try {
        const startTime = Date.now();
        
        const enhancedData = await getEnhancedLiveData();
        const tradingData = await getTradingSummary().catch(() => null);
        
        const marketData = {
            markets: enhancedData,
            trading: tradingData,
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime
        };
        
        return marketData;
    } catch (error) {
        console.error('Market data error:', error.message);
        return null;
    }
}

// Enhanced main message handler with full database integration
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const messageId = `${chatId}_${Date.now()}`;
    
    console.log(`📨 Message from ${chatId}: ${text?.substring(0, 50) || 'Media message'}`);
    
    // Security check
    if (!isAuthorizedUser(chatId)) {
        console.log(`🚫 Unauthorized access from ${chatId}`);
        await sendSmartMessage(bot, chatId, 
            `🚫 Access denied. This is a private AI system.\n\nYour Chat ID: ${chatId}\n\nContact admin if this is your account.`
        );
        return;
    }

    // Start session tracking
    const sessionId = await startUserSession(chatId, 'TELEGRAM_BOT').catch(() => null);
    const startTime = Date.now();

    try {
        // Handle media messages with enhanced tracking
        if (msg.voice) {
            console.log("🎤 Voice message received");
            await handleVoiceMessage(msg, chatId, sessionId);
            return;
        }

        if (msg.photo) {
            console.log("🖼️ Image received");
            await handleImageMessage(msg, chatId, sessionId);
            return;
        }

        if (msg.document) {
            console.log("📄 Document received:", msg.document.file_name);
            await handleDocumentMessage(msg, chatId, sessionId);
            return;
        }

        // Handle text commands with enhanced database integration
        if (!text) {
            await sendSmartMessage(bot, chatId, "Please send text, voice messages, images, or documents.");
            return;
        }

        // Enhanced command routing with database logging
        const executionTime = await executeCommandWithLogging(chatId, text, sessionId);
        
        // End session tracking
        if (sessionId) {
            await endUserSession(sessionId, 1, executionTime).catch(console.error);
        }

    } catch (error) {
        console.error('❌ Message handling error:', error.message);
        
        // Log error
        await logCommandUsage(chatId, text || 'MEDIA', Date.now() - startTime, false, error.message).catch(console.error);
        
        // End session with error
        if (sessionId) {
            await endUserSession(sessionId, 0, Date.now() - startTime).catch(console.error);
        }
        
        await sendSmartMessage(bot, chatId, 
            `Sorry, I encountered an error processing your request. Please try again. 🔧`
        );
    }
});

// Enhanced command execution with full database logging
async function executeCommandWithLogging(chatId, text, sessionId) {
    const startTime = Date.now();
    
    try {
        // Command handlers with database integration
        if (text === "/start") {
            await handleStartCommand(chatId);
        } else if (text === "/help") {
            await handleHelpCommand(chatId);
        } else if (text === "/myid") {
            await sendSmartMessage(bot, chatId, `Your Chat ID: ${chatId}`);
        } else if (text === "/time" || text === "/datetime") {
            await handleDateTime(chatId);
        } else if (text.startsWith('/deal_analyze')) {
            await handleDealAnalysis(chatId, text);
        } else if (text === '/portfolio') {
            await handlePortfolioStatus(chatId);
        } else if (text === '/cambodia_market') {
            await handleCambodiaMarket(chatId);
        } else if (text === '/risk_assessment') {
            await handleRiskAssessment(chatId);
        } else if (text === '/briefing') {
            await handleMarketBriefing(chatId);
        } else if (text === '/regime') {
            await handleRegimeAnalysis(chatId);
        } else if (text === '/opportunities') {
            await handleOpportunities(chatId);
        } else if (text === '/macro') {
            await handleMacroAnalysis(chatId);
        } else if (text === '/trading' || text === '/account') {
            await handleTradingStatus(chatId);
        } else if (text === '/positions') {
            await handlePositions(chatId);
        } else if (text === '/status') {
            await handleEnhancedSystemStatus(chatId);
        } else if (text === '/documents') {
            await handleDocumentsList(chatId);
        } else if (text === '/analytics') {
            await handleMasterAnalytics(chatId);
        } else if (text === '/db_stats') {
            await handleDatabaseStats(chatId);
        } else if (text === '/maintenance') {
            await handleDatabaseMaintenance(chatId);
        } else {
            // Handle general conversation with enhanced dual AI system
            await handleEnhancedConversation(chatId, text, sessionId);
        }
        
        const executionTime = Date.now() - startTime;
        
        // Log successful command execution
        await logCommandUsage(chatId, text, executionTime, true).catch(console.error);
        
        return executionTime;
        
    } catch (error) {
        const executionTime = Date.now() - startTime;
        
        // Log failed command execution
        await logCommandUsage(chatId, text, executionTime, false, error.message).catch(console.error);
        
        throw error;
    }
}

// Enhanced command handlers with database integration
async function handleStartCommand(chatId) {
    const welcome = `🤖 **Enhanced AI Assistant System v3.2**

**🎯 Core Features:**
- Dual AI: GPT-5 + Claude Opus 4.1
- Enhanced Database Integration
- Live market data & Ray Dalio framework
- Cambodia fund analysis
- Advanced document processing
- Voice and image analysis

**🏦 Cambodia Fund Commands:**
/deal_analyze [amount] [type] [location] [rate] [term]
/portfolio - Fund status & analytics
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

**🔧 System Management:**
/analytics - Master system analytics
/db_stats - Database statistics
/status - Enhanced system status
/time - Current date/time
/maintenance - Database maintenance

**Chat ID:** ${chatId}
**Database Status:** ${connectionStats.connectionHealth}`;

    await sendSmartMessage(bot, chatId, welcome);
    
    // Save welcome interaction
    await saveConversationDB(chatId, "/start", welcome, "command").catch(console.error);
}

async function handleHelpCommand(chatId) {
    const help = `🤖 **Enhanced AI Assistant Help**

**Main Features:**
- Natural conversation with dual AI routing
- Financial market analysis with database persistence
- Cambodia lending fund management
- Document analysis and training with storage
- Voice/image processing with history

**Database Features:**
- Persistent conversation memory
- Training document storage
- Ray Dalio regime tracking
- Cambodia deal analytics
- Enhanced system monitoring

**How to use:**
- Ask questions naturally (auto-routed to best AI)
- Upload documents with "train" to add to knowledge base
- Use specific commands for structured analysis
- All interactions are saved for context

**Examples:**
- "What's the current market regime?" (Claude Analysis)
- "Analyze this Cambodia lending opportunity" (Specialized)
- "Tell me a joke" (GPT-5)
- "/analytics" for comprehensive system analytics`;

    await sendSmartMessage(bot, chatId, help);
    
    // Save help interaction
    await saveConversationDB(chatId, "/help", help, "command").catch(console.error);
}

// FIXED DateTime Handler
async function handleDateTime(chatId) {
    try {
        const cambodiaTime = getCurrentCambodiaDateTime();
        const globalTime = getCurrentGlobalDateTime();
        
        let response = `🕐 **Current Date & Time**\n\n`;
        
        // Cambodia time (primary)
        response += `🇰🇭 **Cambodia (ICT):**\n`;
        response += `• Date: ${cambodiaTime.date}\n`;
        response += `• Time: ${cambodiaTime.time}\n`;
        response += `• Day: ${cambodiaTime.dayName}\n`;
        response += `• Weekend: ${cambodiaTime.isWeekend ? 'Yes' : 'No'}\n\n`;
        
        // Global times
        response += `🌍 **Global Times:**\n`;
        response += `• New York: ${globalTime.newYork.time} (${globalTime.newYork.timezone})\n`;
        response += `• London: ${globalTime.london.time} (${globalTime.london.timezone})\n`;
        response += `• Tokyo: ${globalTime.tokyo.time} (${globalTime.tokyo.timezone})\n`;
        response += `• Singapore: ${globalTime.singapore.time} (${globalTime.singapore.timezone})\n\n`;
        
        response += `📊 **Market Status:**\n`;
        response += `• ${cambodiaTime.isWeekend ? '🔴 Weekend - Markets Closed' : '🟢 Weekday - Markets Active'}\n`;
        response += `• Best trading hours: Asia (now), EU (afternoon), US (evening)`;
        
        await sendSmartMessage(bot, chatId, response);
        
        // Save datetime interaction
        await saveConversationDB(chatId, "/time", response, "command").catch(console.error);
        
    } catch (error) {
        console.error('DateTime handler error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ DateTime error: ${error.message}`);
    }
}

async function handleEnhancedSystemStatus(chatId) {
    try {
        await bot.sendMessage(chatId, "🔄 Checking enhanced system status...");
        
        const [health, stats, dualAIStats] = await Promise.all([
            checkSystemHealth(),
            getDatabaseStats(),
            getDualAIPerformanceDashboard(7).catch(() => ({ error: 'Not available' }))
        ]);
        
        let status = `**Enhanced System Status v3.2**\n\n`;
        
        // AI Models Status
        status += `**AI Models:**\n`;
        status += `• GPT-5: ${health.gpt5Available ? '✅ Online' : '❌ Offline'}\n`;
        status += `• Claude Opus 4.1: ${health.claudeAvailable ? '✅ Online' : '❌ Offline'}\n\n`;
        
        // Enhanced Database Status
        status += `**Enhanced Database:**\n`;
        status += `• Connection: ${connectionStats.connectionHealth === 'HEALTHY' ? '✅ Connected' : '❌ Disconnected'}\n`;
        status += `• Total Users: ${stats.totalUsers}\n`;
        status += `• Total Conversations: ${stats.totalConversations}\n`;
        status += `• Regime Records: ${stats.totalRegimeRecords || 0}\n`;
        status += `• Cambodia Deals: ${stats.totalDeals || 0}\n\n`;
        
        // System Health
        status += `**System Health:**\n`;
        status += `• Database Queries: ${connectionStats.totalQueries}\n`;
        status += `• Success Rate: ${connectionStats.totalQueries > 0 ? 
            ((connectionStats.successfulQueries / connectionStats.totalQueries) * 100).toFixed(1) : 100}%\n`;
        status += `• DateTime Support: ${health.dateTimeSupport ? '✅ Working' : '❌ Error'}\n\n`;
        
        // Dual AI Performance (if available)
        if (dualAIStats.summary && !dualAIStats.error) {
            status += `**Dual AI Performance (7 days):**\n`;
            status += `• Total Conversations: ${dualAIStats.summary.totalConversations}\n`;
            status += `• Avg Response Time: ${dualAIStats.summary.avgResponseTime?.toFixed(0)}ms\n`;
            status += `• Success Rate: ${dualAIStats.summary.overallSuccessRate?.toFixed(1)}%\n`;
            status += `• Preferred AI: ${dualAIStats.summary.preferredAI}\n\n`;
        }
        
        // Overall Status
        const overallHealthy = health.overallHealth && connectionStats.connectionHealth === 'HEALTHY';
        status += `**Overall Status: ${overallHealthy ? '🟢 Healthy' : '🔴 Degraded'}**`;
        
        if (connectionStats.lastError) {
            status += `\n\n**Last Error:** ${connectionStats.lastError}`;
        }

        await sendAnalysis(bot, chatId, status, "Enhanced System Status");
        
        // Save status check
        await saveConversationDB(chatId, "/status", status, "command").catch(console.error);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Status check error: ${error.message}`);
    }
}

async function handleMasterAnalytics(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Generating master analytics dashboard...");
        
        const analytics = await getMasterEnhancedDualSystemAnalytics(chatId, 30);
        
        if (analytics.error) {
            await sendSmartMessage(bot, chatId, `❌ Analytics error: ${analytics.error}`);
            return;
        }
        
        let response = `**Master Enhanced Analytics Dashboard**\n\n`;
        
        // System Overview
        response += `**System Overview:**\n`;
        response += `• Version: ${analytics.enhancedSystemOverview?.systemVersion || 'Unknown'}\n`;
        response += `• Status: ${analytics.enhancedSystemOverview?.enhancementStatus || 'Unknown'}\n`;
        response += `• Health Score: ${analytics.systemStatus?.overallHealth || 'Unknown'}\n`;
        response += `• Performance Grade: ${analytics.systemStatus?.performanceGrade || 'Unknown'}\n\n`;
        
        // Dual AI Performance
        if (analytics.enhancedAnalytics?.dualAIPerformance?.summary) {
            const dual = analytics.enhancedAnalytics.dualAIPerformance.summary;
            response += `**Dual AI Performance (30 days):**\n`;
            response += `• Total Conversations: ${dual.totalConversations}\n`;
            response += `• Avg Response Time: ${dual.avgResponseTime?.toFixed(0)}ms\n`;
            response += `• Success Rate: ${dual.overallSuccessRate?.toFixed(1)}%\n`;
            response += `• Dual AI Usage: ${dual.dualAIUsage}\n\n`;
        }
        
        // Database Stats
        const dbStats = analytics.originalSystemStats?.rayDalioFramework;
        if (dbStats) {
            response += `**Database Intelligence:**\n`;
            response += `• Users: ${dbStats.totalUsers}\n`;
            response += `• Conversations: ${dbStats.totalConversations}\n`;
            response += `• Memories: ${dbStats.totalMemories}\n`;
            response += `• Documents: ${dbStats.totalDocuments}\n`;
            response += `• Regime Records: ${dbStats.totalRegimeRecords}\n\n`;
        }
        
        // Strategic Recommendations
        if (analytics.strategicRecommendations && analytics.strategicRecommendations.length > 0) {
            response += `**Strategic Recommendations:**\n`;
            analytics.strategicRecommendations.slice(0, 3).forEach((rec, i) => {
                response += `${i + 1}. [${rec.priority}] ${rec.recommendation}\n`;
            });
        }
        
        await sendAnalysis(bot, chatId, response, "Master Analytics Dashboard");
        
        // Save analytics request
        await saveConversationDB(chatId, "/analytics", response, "command").catch(console.error);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Master analytics error: ${error.message}`);
    }
}

async function handleDatabaseStats(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Retrieving database statistics...");
        
        const stats = await getRayDalioStats();
        
        let response = `**Enhanced Database Statistics**\n\n`;
        response += `**Core Data:**\n`;
        response += `• Total Users: ${stats.totalUsers}\n`;
        response += `• Conversations: ${stats.totalConversations}\n`;
        response += `• Persistent Memories: ${stats.totalMemories}\n`;
        response += `• Training Documents: ${stats.totalDocuments}\n\n`;
        
        response += `**Ray Dalio Framework:**\n`;
        response += `• Regime Records: ${stats.totalRegimeRecords}\n`;
        response += `• Portfolio Allocations: ${stats.totalAllocations}\n`;
        response += `• Risk Assessments: ${stats.totalRiskAssessments}\n`;
        response += `• Market Signals: ${stats.totalMarketSignals}\n\n`;
        
        response += `**Current Status:**\n`;
        response += `• Connection Health: ${connectionStats.connectionHealth}\n`;
        response += `• Total Queries: ${connectionStats.totalQueries}\n`;
        response += `• Success Rate: ${connectionStats.totalQueries > 0 ? 
            ((connectionStats.successfulQueries / connectionStats.totalQueries) * 100).toFixed(1) : 100}%\n`;
        response += `• Storage: ${stats.storage}\n`;
        response += `• Institutional Grade: ${stats.institutionalGrade ? 'Yes' : 'No'}\n`;
        
        if (stats.currentRegime) {
            response += `\n**Current Market Regime:**\n`;
            response += `• Regime: ${stats.currentRegime.regime_name}\n`;
            response += `• Confidence: ${stats.currentRegime.confidence}%\n`;
        }

        await sendAnalysis(bot, chatId, response, "Database Statistics");
        
        // Save database stats request
        await saveConversationDB(chatId, "/db_stats", response, "command").catch(console.error);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Database stats error: ${error.message}`);
    }
}

async function handleDatabaseMaintenance(chatId) {
    try {
        await bot.sendMessage(chatId, "🔧 Starting database maintenance...");
        
        const results = await performDatabaseMaintenance();
        
        let response = `**Database Maintenance Results**\n\n`;
        
        if (results.error) {
            response += `❌ **Error:** ${results.error}`;
        } else {
            response += `✅ **Maintenance Completed**\n\n`;
            response += `**Results:**\n`;
            response += `• Tables Analyzed: ${results.tablesAnalyzed}\n`;
            response += `• Old Data Cleaned: ${results.oldDataCleaned} records\n`;
            response += `• Indexes Rebuilt: ${results.indexesRebuilt}\n`;
            
            if (results.errors && results.errors.length > 0) {
                response += `\n**Warnings:**\n`;
                results.errors.slice(0, 3).forEach(error => {
                    response += `• ${error}\n`;
                });
            }
        }

        await sendAnalysis(bot, chatId, response, "Database Maintenance");
        
        // Save maintenance request
        await saveConversationDB(chatId, "/maintenance", response, "command").catch(console.error);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Database maintenance error: ${error.message}`);
    }
}

// Enhanced conversation handler with dual AI and database integration
async function handleEnhancedConversation(chatId, text, sessionId) {
    try {
        console.log("🤖 Processing enhanced conversation:", text.substring(0, 50));
        
        // Build conversation context from database
        const conversationHistory = await getConversationHistoryDB(chatId, 5).catch(() => []);
        const persistentMemory = await getPersistentMemoryDB(chatId).catch(() => []);
        
        // Prepare conversation intelligence
        const conversationIntel = {
            type: determineConversationType(text),
            complexity: determineComplexity(text),
            liveDataRequired: requiresLiveData(text),
            primaryAI: 'GPT_COMMANDER', // Default routing
            enhancementLevel: 'ENHANCED',
            style: 'helpful_intelligent',
            reasoning: 'Enhanced dual command routing with database context'
        };
        
        // Use enhanced dual command system
        const result = await executeDualCommand(text, chatId, {
            conversationHistory: conversationHistory,
            persistentMemory: persistentMemory,
            conversationIntel: conversationIntel
        });
        
        // Send response
        await sendSmartMessage(bot, chatId, result.response);
        
        // Enhanced conversation save with full metadata
        await saveEnhancedDualConversation(chatId, text, result.response, conversationIntel, {
            responseTime: result.responseTime,
            aiUsed: result.aiUsed,
            success: true,
            tokenCount: result.tokenCount,
            functionExecutionTime: result.functionExecutionTime
        });
        
        // Add important facts to persistent memory
        if (shouldSaveToPersistentMemory(text, result.response)) {
            const memoryFact = extractMemoryFact(text, result.response);
            if (memoryFact) {
                await addPersistentMemoryDB(chatId, memoryFact, 'medium').catch(console.error);
            }
        }
        
    } catch (error) {
        console.error('❌ Enhanced conversation error:', error.message);
        
        // Fallback to simple GPT response with error logging
        try {
            const response = await getGPT5Analysis(text, { maxTokens: 1000 });
            await sendSmartMessage(bot, chatId, response);
            
            // Save fallback conversation
            await saveConversationDB(chatId, text, response, "text", { error: error.message }).catch(console.error);
        } catch (fallbackError) {
            await sendSmartMessage(bot, chatId, 
                `Sorry, I'm having technical difficulties. Please try again in a moment. 🔧`
            );
        }
    }
}

// Helper functions for enhanced conversation handling
function determineConversationType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('regime') || lowerText.includes('economic')) return 'economic_regime';
    if (lowerText.includes('cambodia') || lowerText.includes('lending')) return 'cambodia_fund';
    if (lowerText.includes('time') || lowerText.includes('date')) return 'simple_datetime';
    if (lowerText.includes('market') || lowerText.includes('trading')) return 'market_analysis';
    if (lowerText.includes('joke') || lowerText.includes('story')) return 'casual';
    if (lowerText.includes('analyze') || lowerText.includes('strategy')) return 'strategic_analysis';
    
    return 'balanced_strategic';
}

function determineComplexity(text) {
    if (text.length < 50) return 'minimal';
    if (text.length < 200) return 'moderate';
    if (text.length < 500) return 'high';
    return 'maximum';
}

function requiresLiveData(text) {
    const lowerText = text.toLowerCase();
    return lowerText.includes('current') || lowerText.includes('latest') || 
           lowerText.includes('today') || lowerText.includes('now') ||
           lowerText.includes('price') || lowerText.includes('market');
}

function shouldSaveToPersistentMemory(userMessage, aiResponse) {
    // Save important facts, preferences, or strategic insights
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    return lowerMessage.includes('remember') || 
           lowerMessage.includes('my preference') ||
           lowerResponse.includes('important to note') ||
           aiResponse.length > 500; // Long detailed responses
}

function extractMemoryFact(userMessage, aiResponse) {
    // Extract key facts for persistent memory
    if (userMessage.toLowerCase().includes('remember')) {
        return `User preference: ${userMessage}`;
    }
    
    if (aiResponse.includes('Key insight:')) {
        const insight = aiResponse.split('Key insight:')[1]?.split('\n')[0];
        return insight ? `Strategic insight: ${insight.trim()}` : null;
    }
    
    // Extract first important sentence from response
    const sentences = aiResponse.split('. ');
    const importantSentence = sentences.find(s => 
        s.includes('important') || s.includes('key') || s.includes('strategic')
    );
    
    return importantSentence ? `Context: ${importantSentence.trim()}` : null;
}

// Media message handlers with enhanced database integration
async function handleVoiceMessage(msg, chatId, sessionId) {
    try {
        const transcribedText = await processVoiceMessage(bot, msg.voice.file_id, chatId);
        if (transcribedText) {
            await sendSmartMessage(bot, chatId, `🎤 **Voice transcribed:** "${transcribedText}"`);
            
            // Save voice transcription
            await saveConversationDB(chatId, "[VOICE]", transcribedText, "voice").catch(console.error);
            
            // Process as normal conversation
            await handleEnhancedConversation(chatId, transcribedText, sessionId);
        } else {
            await sendSmartMessage(bot, chatId, "❌ Voice transcription failed. Please try again.");
        }
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Voice processing error: ${error.message}`);
    }
}

async function handleImageMessage(msg, chatId, sessionId) {
    try {
        const analysis = await processImageMessage(bot, msg.photo[msg.photo.length - 1].file_id, chatId, msg.caption);
        if (analysis) {
            await sendAnalysis(bot, chatId, analysis, "Image Analysis");
            
            // Save image analysis
            await saveConversationDB(chatId, "[IMAGE]" + (msg.caption || ""), analysis, "image").catch(console.error);
        } else {
            await sendSmartMessage(bot, chatId, "❌ Image analysis failed. Please try again.");
        }
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Image processing error: ${error.message}`);
    }
}

async function handleDocumentMessage(msg, chatId, sessionId) {
    try {
        const isTraining = msg.caption?.toLowerCase().includes("train");
        
        if (isTraining) {
            // Save to enhanced training database
            await bot.sendMessage(chatId, "📚 Processing document for AI training database...");
            
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
            
            const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
            const summary = content.length > 500 ? content.substring(0, 500) + '...' : content;
            
            const saved = await saveTrainingDocumentDB(chatId, fileName, content, 'user_uploaded', wordCount, summary);
            
            if (saved) {
                await sendSmartMessage(bot, chatId, 
                    `📚 **Document Added to Enhanced AI Training Database**\n\n` +
                    `📄 **File:** ${fileName}\n` +
                    `📊 **Words:** ${wordCount.toLocaleString()}\n` +
                    `💾 **Storage:** Enhanced PostgreSQL Database\n` +
                    `✅ **Your AI can now reference this document in conversations!**`
                );
                
                // Log document training
                await logCommandUsage(chatId, 'document_training', 1000, true).catch(console.error);
            } else {
                await sendSmartMessage(bot, chatId, "❌ Error saving document to database. Please try again.");
            }
        } else {
            // Analyze document with enhanced tracking
            await bot.sendMessage(chatId, "📄 Analyzing document with enhanced AI...");
            const analysis = await processDocumentMessage(bot, msg.document.file_id, chatId, msg.document.file_name);
            
            if (analysis?.success) {
                await sendAnalysis(bot, chatId, analysis.analysis, `Document Analysis: ${msg.document.file_name}`);
                
                // Save document analysis
                await saveConversationDB(chatId, `[DOCUMENT] ${msg.document.file_name}`, analysis.analysis, "document").catch(console.error);
            } else {
                await sendSmartMessage(bot, chatId, "❌ Document processing failed. Try converting to PDF or TXT format.");
            }
        }
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Document processing error: ${error.message}`);
    }
}

async function handleDocumentsList(chatId) {
    try {
        const docs = await getTrainingDocumentsDB(chatId);
        
        if (docs.length === 0) {
            await sendSmartMessage(bot, chatId, 
                `📚 **No Training Documents Found**\n\n` +
                `**How to add documents to enhanced database:**\n` +
                `• Upload any file (.txt, .pdf, .docx)\n` +
                `• Add caption: "train"\n` +
                `• AI will save it to PostgreSQL database\n` +
                `• Documents persist across sessions\n\n` +
                `**Supported:** Text, PDF, Word, Markdown\n` +
                `**Database:** Enhanced PostgreSQL with full-text search`
            );
            return;
        }
        
        let response = `📚 **Enhanced AI Training Documents (${docs.length})**\n\n`;
        docs.forEach((doc, i) => {
            const uploadDate = new Date(doc.upload_date).toLocaleDateString();
            response += `**${i + 1}. ${doc.file_name}**\n`;
            response += `• Words: ${doc.word_count?.toLocaleString() || 'Unknown'}\n`;
            response += `• Type: ${doc.document_type}\n`;
            response += `• Added: ${uploadDate}\n`;
            response += `• Size: ${(doc.file_size / 1024).toFixed(1)}KB\n\n`;
        });
        
        response += `💾 **Stored in enhanced PostgreSQL database**\n`;
        response += `🔍 **Full-text search enabled**\n`;
        response += `💡 **Your AI can now answer questions about these documents!**`;

        await sendSmartMessage(bot, chatId, response);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced documents list error: ${error.message}`);
    }
}

// Express server setup with enhanced endpoints
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Enhanced webhook endpoint
app.post("/webhook", (req, res) => {
    console.log("📨 Enhanced webhook received");
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Enhanced health check
app.get("/", (req, res) => {
    res.status(200).send("✅ Enhanced AI Assistant v3.2 is running with database integration");
});

app.get("/health", async (req, res) => {
    const health = await performHealthCheck().catch(() => ({ status: 'ERROR' }));
    
    res.status(200).json({ 
        status: "healthy", 
        version: "3.2 Enhanced",
        timestamp: new Date().toISOString(),
        models: ["GPT-5", "Claude Opus 4.1"],
        features: ["Enhanced Database", "Market Analysis", "Cambodia Fund", "Document Processing"],
        database: {
            status: connectionStats.connectionHealth,
            totalQueries: connectionStats.totalQueries,
            successRate: connectionStats.totalQueries > 0 ? 
                ((connectionStats.successfulQueries / connectionStats.totalQueries) * 100).toFixed(1) : 100
        },
        systemHealth: health.status
    });
});

// Enhanced API endpoints with database integration
app.get("/analyze", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({
            error: "Provide query: ?q=your-question",
            example: "/analyze?q=What's the current market outlook?",
            models: ["GPT-5", "Claude Opus 4.1"],
            database: "Enhanced PostgreSQL Integration"
        });
    }

    try {
        const response = await getGPT5Analysis(query, { maxTokens: 2000 });
        
        res.json({
            query: query,
            response: response,
            model: "GPT-5 Enhanced",
            database: "Integrated",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Enhanced analysis failed",
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
            model: "Claude Opus 4.1 Enhanced",
            database: "PostgreSQL Integration"
        });
    }

    try {
        const response = await getClaudeAnalysis(query, { maxTokens: 2000 });
        
        res.json({
            query: query,
            response: response,
            model: "Claude Opus 4.1 Enhanced",
            database: "Integrated",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Enhanced Claude analysis failed",
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
            description: "Enhanced dual AI routing with database integration",
            database: "Full PostgreSQL persistence"
        });
    }

    try {
        const chatId = `api_${Date.now()}`;
        const result = await executeDualCommand(query, chatId);
        
        // Save dual API conversation
        await saveDualAIConversation(chatId, {
            type: 'api_request',
            complexity: 'moderate',
            primaryAI: result.aiUsed || 'GPT_COMMANDER',
            success: true,
            responseTime: result.responseTime,
            userMessage: query,
            response: result.response
        }).catch(console.error);
        
        res.json({
            query: query,
            response: result.response,
            aiUsed: result.aiUsed,
            reasoning: result.reasoning,
            database: "Enhanced PostgreSQL",
            conversationSaved: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Enhanced dual command failed",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get("/status", async (req, res) => {
    try {
        const [health, stats, dualAIStats] = await Promise.all([
            checkSystemHealth(),
            getDatabaseStats(),
            getDualAIPerformanceDashboard(7).catch(() => ({ error: 'Not available' }))
        ]);
        
        res.json({
            system: "Enhanced AI Assistant v3.2",
            models: {
                gpt5: health.gpt5Available ? "online" : "offline",
                claude: health.claudeAvailable ? "online" : "offline"
            },
            database: {
                status: connectionStats.connectionHealth,
                totalUsers: stats.totalUsers,
                totalConversations: stats.totalConversations,
                totalQueries: connectionStats.totalQueries,
                successRate: connectionStats.totalQueries > 0 ? 
                    ((connectionStats.successfulQueries / connectionStats.totalQueries) * 100).toFixed(1) : 100,
                regimeRecords: stats.totalRegimeRecords,
                cambodiaDeals: stats.totalDeals
            },
            features: {
                dualCommand: health.dualMode,
                enhancedDatabase: connectionStats.connectionHealth === 'HEALTHY',
                rayDalioFramework: stats.totalRegimeRecords > 0,
                cambodiaFund: stats.totalDeals > 0,
                datetime: health.dateTimeSupport
            },
            dualAIPerformance: dualAIStats.summary || { error: dualAIStats.error },
            stats: stats,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Enhanced status check failed",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Additional API endpoints
app.get("/analytics", async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const analytics = await getMasterEnhancedDualSystemAnalytics(null, days);
        
        res.json({
            analytics: analytics,
            period: `${days} days`,
            generated: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Enhanced analytics failed",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get("/database", async (req, res) => {
    try {
        const stats = await getRayDalioStats();
        
        res.json({
            database: "Enhanced PostgreSQL",
            version: "3.2",
            stats: stats,
            connectionHealth: connectionStats.connectionHealth,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Database stats failed",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Utility functions for session tracking
async function startUserSession(chatId, sessionType = 'GENERAL') {
    try {
        console.log(`Starting session for ${chatId}: ${sessionType}`);
        return `session_${chatId}_${Date.now()}`;
    } catch (error) {
        console.error('Start session error:', error.message);
        return null;
    }
}

async function endUserSession(sessionId, commandsExecuted = 0, totalResponseTime = 0) {
    try {
        console.log(`Ending session ${sessionId}: ${commandsExecuted} commands, ${totalResponseTime}ms`);
        return true;
    } catch (error) {
        console.error('End session error:', error.message);
        return false;
    }
}

// Start enhanced server with comprehensive initialization
const server = app.listen(PORT, "0.0.0.0", async () => {
    console.log("🚀 Enhanced AI Assistant v3.2 starting...");
    console.log("✅ Server running on port " + PORT);
    console.log("🤖 Models: GPT-5 + Claude Opus 4.1");
    console.log("🏦 Features: Enhanced Database + Cambodia Fund + Ray Dalio Framework");
    
    // Initialize enhanced database
    try {
        await initializeEnhancedDatabase();
        console.log("💾 Enhanced database integration successful");
    } catch (error) {
        console.error("❌ Enhanced database initialization failed:", error.message);
        console.log("⚠️ Running with limited database functionality");
    }
    
    console.log("🔗 Enhanced API Endpoints:");
    console.log(`   GPT-5: http://localhost:${PORT}/analyze?q=your-question`);
    console.log(`   Claude: http://localhost:${PORT}/claude?q=your-question`);
    console.log(`   Dual AI: http://localhost:${PORT}/dual?q=your-question`);
    console.log(`   Status: http://localhost:${PORT}/status`);
    console.log(`   Analytics: http://localhost:${PORT}/analytics`);
    console.log(`   Database: http://localhost:${PORT}/database`);

    // Set webhook with CORRECT URL
    const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
    
    try {
        await bot.setWebHook(webhookUrl);
        console.log("🔗 Enhanced webhook configured:", webhookUrl);
        console.log("🚀 Enhanced AI Assistant v3.2 ready with full database integration!");
        
        // Log successful startup
        await updateSystemMetrics({
            system_startup: 1
        }).catch(console.error);
        
    } catch (err) {
        console.error("❌ Webhook setup failed:", err.message);
        console.log("🔄 Running in polling mode for development");
    }
});

// Graceful shutdown with database cleanup
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, performing graceful shutdown...');
    
    try {
        await updateSystemMetrics({
            system_shutdown: 1
        }).catch(console.error);
        
        console.log('💾 Database metrics updated');
    } catch (error) {
        console.error('❌ Shutdown cleanup error:', error.message);
    }
    
    server.close(() => {
        console.log('✅ Enhanced AI Assistant v3.2 shut down gracefully');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, performing graceful shutdown...');
    
    try {
        await updateSystemMetrics({
            system_shutdown: 1
        }).catch(console.error);
        
        console.log('💾 Database cleanup completed');
    } catch (error) {
        console.error('❌ Shutdown cleanup error:', error.message);
    }
    
    server.close(() => {
        console.log('✅ Enhanced AI Assistant v3.2 shut down gracefully');
        process.exit(0);
    });
});

// Export for testing
module.exports = {
    app,
    server,
    initializeEnhancedDatabase,
    connectionStats
};
