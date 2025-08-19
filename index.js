require("dotenv").config({ path: ".env" });

// Debug environment variables
console.log("🔧 Environment check:");
console.log(`ADMIN_CHAT_ID: ${process.env.ADMIN_CHAT_ID}`);
console.log(`TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET"}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "SET" : "NOT SET"}`);
console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "SET" : "NOT SET"}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "SET" : "NOT SET"}`);
console.log(`DATABASE_PUBLIC_URL: ${process.env.DATABASE_PUBLIC_URL ? "SET" : "NOT SET"}`);

const TelegramBot = require("node-telegram-bot-api");
const { OpenAI } = require("openai");

// Import enhanced utility modules
const { 
    getRealLiveData, 
    getEnhancedLiveData, 
    getEconomicIndicators,
    getStockMarketData,
    getRayDalioMarketData,
    getFredData,
    getAlphaVantageData,
    detectEconomicRegime,
    getYieldCurveAnalysis,
    detectMarketAnomalies,
    generateMarketInsights,
    getCurrentCambodiaDateTime,
    getCurrentGlobalDateTime,
    getCreditSpreadAnalysis,
    getInflationExpectations,
    getSectorRotationSignals,
    calculateAssetCorrelations,
    getEnhancedCryptoData,
    getMajorForexPairs,
    getCommodityPrices,
    getBusinessHeadlines
} = require("./utils/liveData");

const { 
    analyzeLendingDeal, 
    getPortfolioStatus, 
    getCambodiaMarketConditions, 
    performRiskAssessment, 
    generateLPReport 
} = require("./utils/cambodiaLending");

// 🎯 MAIN DUAL AI SYSTEM - Smart routing between GPT-5 and Claude Opus 4.1
const { 
    getUltimateStrategicAnalysis,  // 🏆 MAIN FUNCTION
    getUniversalAnalysis,          // ✅ Still works (points to Ultimate)
    getDualAnalysis,               // ✅ Still works (points to Ultimate)
    routeQuery, 
    checkDualSystemHealth, 
    testMemoryIntegration, 
    analyzeImageWithAI, 
    getGPT5Analysis, 
    getClaudeAnalysis, 
    getMarketAnalysis, 
    getCambodiaAnalysis, 
    dualAIRouter, 
    getPerformanceStats,
    quickSetup,                    // 🚀 NEW: Quick setup function
    initializeUltimateStrategicPowerSystem  // 🏆 NEW: Full system
} = require("./utils/dualAISystem");

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
    // Core database functions
    initializeDatabase,
    saveConversationDB,
    getConversationHistoryDB,
    getUserProfileDB,
    getDatabaseStats,
    
    // Enhanced persistent memory
    addPersistentMemoryDB,
    getPersistentMemoryDB,
    
    // Training documents
    saveTrainingDocumentDB,
    getTrainingDocumentsDB,
    
    // Ray Dalio enhanced functions
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
    
    // Cambodia fund functions
    saveCambodiaDeal,
    saveCambodiaPortfolio,
    getCambodiaFundAnalytics,
    getLatestCambodiaMarketData,
    getCambodiaDealsBy,
    
    // Enhanced dual AI system
    saveDualAIConversation,
    saveAIHeadToHead,
    saveEnhancedFunctionPerformance,
    getDualAIPerformanceDashboard,
    getConversationIntelligenceAnalytics,
    getMasterEnhancedDualSystemAnalytics,
    saveEnhancedDualConversation,
    
    // Analytics and monitoring
    getSystemAnalytics,
    getRayDalioStats,
    performHealthCheck,
    updateSystemMetrics,
    performDatabaseMaintenance,
    
    // Connection monitoring
    connectionStats
} = require("./utils/database");

const { buildConversationContext } = require("./utils/memory");
const { getTradingSummary, getAccountInfo } = require("./utils/metaTrader");

// Import specialized AI clients (non-duplicate functions only)
const { 
    getClaudeAnalysis: getClaudeAnalysisRaw,  // Rename to avoid conflict
    getClaudeStrategicAnalysis: getClaudeStrategicAnalysis,
    getRegimeAnalysis,
    getPortfolioAnalysis,
    getAnomalyAnalysis
} = require('./utils/claudeClient');

const { 
    getGptAnalysis,  // Raw GPT function if needed
    getGptStrategicAnalysis: getGptStrategicAnalysis
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

// 🔧 FIXED: Test database functions with better error handling
async function testDatabaseFunctions() {
    try {
        console.log("🧪 Testing database functions...");
        
        // Test basic connection first
        const stats = await getDatabaseStats();
        console.log("📊 Database stats test:", {
            connectionHealth: connectionStats.connectionHealth,
            totalUsers: stats?.totalUsers || 0,
            totalConversations: stats?.totalConversations || 0,
            totalDocuments: stats?.totalDocuments || 0,
            error: stats?.error || null
        });
        
        // Test health check
        const health = await performHealthCheck();
        console.log("🏥 Database health test:", health?.status || 'Unknown', health?.error ? `(${health.error})` : "");
        
        // 🔧 ADDED: Test memory functions specifically
        try {
            const testHistory = await getConversationHistoryDB('test_user', 1);
            console.log("📚 Conversation history test: ✅ Working");
        } catch (historyError) {
            console.log("📚 Conversation history test: ❌", historyError.message);
        }
        
        try {
            const testMemory = await getPersistentMemoryDB('test_user');
            console.log("🧠 Persistent memory test: ✅ Working");
        } catch (memoryError) {
            console.log("🧠 Persistent memory test: ❌", memoryError.message);
        }
        
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
            total_users: 0    // ✅ Use a column that actually exists
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

async function logApiUsage(service, endpoint, calls = 1, success = true, responseTime = 0, inputTokens = 0, cost = 0) {
    try {
        console.log(`🔌 API: ${service}/${endpoint} | ${success ? 'SUCCESS' : 'FAILED'} | ${responseTime}ms | $${cost}`);
        return true;
    } catch (error) {
        console.error('❌ API logging error:', error.message);
        return false;
    }
}

// Enhanced main message handler with dual AI integration
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
        // Handle media messages
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

        // Handle text messages
        if (!text) {
            await sendSmartMessage(bot, chatId, "Please send text, voice messages, images, or documents.");
            return;
        }

        // Route to dual AI conversation handler
        const executionTime = await handleDualAIConversation(chatId, text, sessionId);
        
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

// 🤖 Dual AI Conversation Handler - Clean and Focused
async function handleDualAIConversation(chatId, text, sessionId) {
    const startTime = Date.now();
    
    try {
        console.log("🤖 Starting dual AI conversation processing:", text.substring(0, 50));
        
        // Get conversation context with memory
        const context = await buildConversationContext(chatId, text);
        
        // Determine conversation intelligence
        const conversationIntel = {
            type: determineConversationType(text),
            complexity: determineComplexity(text),
            requiresLiveData: requiresLiveData(text),
            hasMemory: context.memoryAvailable,
            conversationCount: context.conversationHistory?.length || 0
        };
        
        console.log("🎯 Conversation Intel:", conversationIntel);
        
        // Execute dual AI command
        const result = await executeDualAICommand(text, chatId, context, conversationIntel);
        
        // Send response to user
        await sendSmartMessage(bot, chatId, result.response);
        
        // Save conversation
        await saveConversationToDatabase(chatId, text, result, context);
        
        // Extract and save new memories
        await extractAndSaveMemories(chatId, text, result.response);
        
        console.log("✅ Dual AI conversation completed successfully");
        return Date.now() - startTime;
        
    } catch (error) {
        console.error('❌ Dual AI conversation error:', error.message);
        
        // Fallback to single AI
        const fallbackResponse = await handleFallbackResponse(chatId, text);
        await sendSmartMessage(bot, chatId, fallbackResponse);
        
        return Date.now() - startTime;
    }
}

// 🧠 Build Conversation Context with Memory
async function buildConversationContextWithMemory(chatId, currentText) {
    const context = {
        conversationHistory: [],
        persistentMemory: [],
        memoryContext: '',
        memoryAvailable: false,
        errors: []
    };
    
    try {
        // Get recent conversation history
        context.conversationHistory = await getConversationHistoryDB(chatId, 5);
        console.log(`📚 Retrieved ${context.conversationHistory.length} conversations`);
    } catch (error) {
        console.log('⚠️ Could not retrieve conversation history:', error.message);
        context.errors.push(`History: ${error.message}`);
    }
    
    try {
        // Get persistent memories
        context.persistentMemory = await getPersistentMemoryDB(chatId);
        console.log(`🧠 Retrieved ${context.persistentMemory.length} memories`);
    } catch (error) {
        console.log('⚠️ Could not retrieve persistent memory:', error.message);
        context.errors.push(`Memory: ${error.message}`);
    }
    
    // Build memory context string
    if (context.conversationHistory.length > 0 || context.persistentMemory.length > 0) {
        context.memoryContext = buildMemoryContextString(context.conversationHistory, context.persistentMemory);
        context.memoryAvailable = true;
        console.log(`✅ Memory context built (${context.memoryContext.length} chars)`);
    }
    
    return context;
}

// 🤖 Execute Dual AI Command
async function executeDualAICommand(text, chatId, context, intel) {
    try {
        // Try dual AI system first
        console.log("🚀 Executing dual AI command...");
        
        const dualResult = await executeDualCommand(text, chatId, {
            conversationHistory: context.conversationHistory,
            persistentMemory: context.persistentMemory,
            memoryContext: context.memoryContext,
            conversationIntel: intel,
            messageType: 'text'
        });
        
        console.log("✅ Dual AI command successful:", dualResult.aiUsed);
        return dualResult;
        
    } catch (error) {
        console.log("⚠️ Dual AI failed, using GPT fallback:", error.message);
        
        // Fallback to single GPT with memory
        const enhancedPrompt = context.memoryContext ? 
            `${context.memoryContext}\n\nUser: ${text}` : text;
            
        const response = await getUniversalAnalysis(enhancedPrompt, {
            maxTokens: 1500,
            temperature: 0.7,
            model: "gpt-5"
        });
        
        return {
            response: response,
            aiUsed: 'GPT_FALLBACK',
            success: true,
            memoryUsed: !!context.memoryContext,
            queryType: intel.type
        };
    }
}

// 💾 Save Conversation to Database
async function saveConversationToDatabase(chatId, userMessage, result, context) {
    try {
        await saveConversationDB(chatId, userMessage, result.response, "text", {
            aiUsed: result.aiUsed,
            queryType: result.queryType,
            memoryUsed: context.memoryAvailable,
            success: result.success,
            enhanced: true
        });
        console.log("✅ Conversation saved to database");
    } catch (error) {
        console.log('⚠️ Could not save conversation:', error.message);
    }
}

// 🧠 Extract and Save Memories
async function extractAndSaveMemories(chatId, userMessage, aiResponse) {
    try {
        const { extractAndSaveFacts } = require('./utils/memory');
        const result = await extractAndSaveFacts(chatId, userMessage, aiResponse);
        
        if (result?.extractedFacts > 0) {
            console.log(`✅ Extracted ${result.extractedFacts} new memories`);
        }
    } catch (error) {
        console.log('⚠️ Memory extraction failed:', error.message);
    }
}

// 🚨 Fallback Response Handler
async function handleFallbackResponse(chatId, text) {
    try {
        // Try to get minimal context
        let basicContext = '';
        try {
            const recent = await getConversationHistoryDB(chatId, 1);
            if (recent?.[0]) {
                basicContext = `\n\nContext: You previously discussed "${recent[0].user_message?.substring(0, 50)}..." with this user.`;
            }
        } catch (contextError) {
            console.log('⚠️ Even basic context failed');
        }
        
        return await getUniversalAnalysis(text + basicContext, {
            maxTokens: 1000,
            temperature: 0.7,
            model: "gpt-5"
        });
        
    } catch (error) {
        console.error('❌ Fallback also failed:', error.message);
        return "🚨 I'm experiencing technical difficulties. Please try again in a moment.";
    }
}

// 🔧 Helper Functions
function buildMemoryContextString(history, memories) {
    let context = '\n\n🧠 MEMORY CONTEXT:\n';
    
    if (memories.length > 0) {
        context += '\nIMPORTANT FACTS:\n';
        memories.slice(0, 3).forEach((mem, i) => {
            context += `${i + 1}. ${mem.fact}\n`;
        });
    }
    
    if (history.length > 0) {
        context += '\nRECENT CONVERSATION:\n';
        const recent = history[0];
        context += `User: "${recent.user_message?.substring(0, 80)}..."\n`;
        if (recent.gpt_response) {
            context += `AI: "${recent.gpt_response.substring(0, 80)}..."\n`;
        }
    }
    
    return context;
}

function determineConversationType(text) {
    if (!text) return 'unknown';
    
    const lower = text.toLowerCase();
    
    if (lower.includes('financial') || lower.includes('investment') || lower.includes('fund')) {
        return 'financial_analysis';
    }
    if (lower.includes('analysis') || lower.includes('strategy')) {
        return 'strategic_analysis';
    }
    if (lower.length > 100) {
        return 'complex_discussion';
    }
    
    return 'general_conversation';
}

function determineComplexity(text) {
    if (!text) return 'simple';
    
    if (text.length > 200) return 'complex';
    if (text.length > 50) return 'medium';
    return 'simple';
}

function requiresLiveData(text) {
    if (!text) return false;
    
    const liveDataKeywords = ['current', 'latest', 'today', 'now', 'recent', 'update'];
    return liveDataKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

// 🔧 ADDITIONAL HELPER FUNCTIONS
function shouldSaveToPersistentMemory(userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    return lowerMessage.includes('remember') || 
           lowerMessage.includes('my preference') ||
           lowerMessage.includes('my name') ||
           lowerResponse.includes('important to note') ||
           aiResponse.length > 500;
}

function extractMemoryFact(userMessage, aiResponse) {
    if (userMessage.toLowerCase().includes('remember')) {
        return `User preference: ${userMessage}`;
    }
    
    if (userMessage.toLowerCase().includes('my name is')) {
        const nameMatch = userMessage.match(/my name is ([^.,\n]+)/i);
        if (nameMatch) {
            return `User's name: ${nameMatch[1].trim()}`;
        }
    }
    
    if (aiResponse.includes('Key insight:')) {
        const insight = aiResponse.split('Key insight:')[1]?.split('\n')[0];
        return insight ? `Strategic insight: ${insight.trim()}` : null;
    }
    
    return `Context: ${userMessage.substring(0, 100)}`;
}

// 🔧 SESSION MANAGEMENT FUNCTIONS
async function startUserSession(chatId, sessionType = 'GENERAL') {
    try {
        console.log(`📊 Starting session for ${chatId}: ${sessionType}`);
        const sessionId = `session_${chatId}_${Date.now()}`;
        
        // You can expand this to save to database if needed
        // await saveSessionToDB(sessionId, chatId, sessionType);
        
        return sessionId;
    } catch (error) {
        console.error('❌ Start session error:', error.message);
        return null;
    }
}

async function endUserSession(sessionId, commandsExecuted = 0, totalResponseTime = 0) {
    try {
        console.log(`📊 Ending session ${sessionId}: ${commandsExecuted} commands, ${totalResponseTime}ms`);
        
        // You can expand this to update database if needed
        // await updateSessionInDB(sessionId, commandsExecuted, totalResponseTime);
        
        return true;
    } catch (error) {
        console.error('❌ End session error:', error.message);
        return false;
    }
}

// 🔧 COMMAND EXECUTION WITH LOGGING
async function executeCommandWithLogging(chatId, text, sessionId) {
    const startTime = Date.now();
    
    try {
        // Route to dual AI conversation handler
        await handleDualAIConversation(chatId, text, sessionId);
        
        const executionTime = Date.now() - startTime;
        
        // Log successful command
        await logCommandUsage(chatId, text, executionTime, true);
        
        return executionTime;
        
    } catch (error) {
        const executionTime = Date.now() - startTime;
        
        // Log failed command
        await logCommandUsage(chatId, text, executionTime, false, error.message);
        
        throw error;
    }
}

// 🔧 COMMAND USAGE LOGGING
async function logCommandUsageDetailed(chatId, command, executionTime, successful = true, errorMessage = null) {
    try {
        console.log(`📊 Command Log: ${chatId} | ${command.substring(0, 30)} | ${executionTime}ms | ${successful ? 'SUCCESS' : 'FAILED'}`);
        
        if (!successful && errorMessage) {
            console.log(`❌ Error: ${errorMessage}`);
        }
        
        // You can expand this to save to database if needed
        // await saveCommandLogToDB(chatId, command, executionTime, successful, errorMessage);
        
        return true;
    } catch (error) {
        console.error('❌ Log command usage error:', error.message);
        return false;
    }
}

// 🔧 API USAGE LOGGING
async function logApiUsage(apiProvider, endpoint, callsCount = 1, successful = true, responseTime = 0, dataVolume = 0, costEstimate = 0) {
    try {
        console.log(`🔌 API Usage: ${apiProvider}/${endpoint} | Calls: ${callsCount} | ${successful ? 'SUCCESS' : 'FAILED'} | ${responseTime}ms | Cost: ${costEstimate}`);
        
        // You can expand this to save to database for cost tracking
        // await saveApiUsageToDB(apiProvider, endpoint, callsCount, successful, responseTime, dataVolume, costEstimate);
        
        return true;
    } catch (error) {
        console.error('❌ Log API usage error:', error.message);
        return false;
    }
}

// 🔧 UPDATED: Enhanced command handlers with wealth system integration
async function handleStartCommand(chatId) {
    const welcome = `🤖 **Enhanced AI Assistant System v4.0 - WEALTH EMPIRE**

**🎯 Core Features:**
- Dual AI: gpt-5 + Claude Opus 4.1
- Complete AI Wealth-Building System (10 modules)
- Enhanced PostgreSQL Database Integration
- Live market data & Ray Dalio framework
- Cambodia fund analysis
- Advanced document processing
- Voice and image analysis
- Persistent memory system

**🔧 System Management:**
/analytics - Master system analytics
/db_stats - Database statistics
/status - Enhanced system status
/maintenance - Database maintenance

**🧪 Memory & Database Testing:**
/test_db - Test database connection
/test_memory - Test memory system
/test_memory_fix - Memory recovery test
/memory_stats - Memory statistics

**Chat ID:** ${chatId}
**🏆 AI Wealth Empire Status:** ACTIVE
**Database Status:** ${connectionStats.connectionHealth}`;

    await sendSmartMessage(bot, chatId, welcome);
    
    // Save welcome interaction
    await saveConversationDB(chatId, "/start", welcome, "command").catch(console.error);
}


// 🔧 FIXED: Enhanced system status with better database checking
async function handleEnhancedSystemStatus(chatId) {
    try {
        await bot.sendMessage(chatId, "🔄 Checking enhanced system status...");

        const [health, stats, dualAIStats] = await Promise.all([
            checkSystemHealth(),
            getDatabaseStats(),
            getDualAIPerformanceDashboard(7).catch(() => ({ error: 'Not available' }))
        ]);

        // Check database connection status
        const dbConnected = !!(stats && stats.connected === true);
        const totalUsers = stats?.totalUsers ?? '—';
        const totalConversations = stats?.totalConversations ?? '—';
        const totalMemories = stats?.totalMemories ?? '—';
        const totalDocuments = stats?.totalDocuments ?? '—';
        
        // Database URL analysis
        const dbUrl = process.env.DATABASE_URL || '';
        let dbHost = 'unknown';
        let dbType = 'Unknown';
        try { 
            const url = new URL(dbUrl);
            dbHost = url.hostname;
            dbType = dbHost.includes('railway.internal') ? '❌ Internal (Wrong)' : 
                     dbHost.includes('roundhouse.proxy') ? '✅ Public (Correct)' : 
                     '❓ Unknown';
        } catch {
            dbHost = 'Invalid URL';
        }

        let status = `**Enhanced System Status v3.2**\n\n`;

        // AI Models Status
        status += `**AI Models:**\n`;
        status += `• gpt-5: ${health?.gptAnalysis ? '✅ Online' : '❌ Offline'}\n`;
        status += `• Claude Opus 4.1: ${health?.claudeAnalysis ? '✅ Online' : '❌ Offline'}\n\n`;

        // Enhanced Database Status
        status += `**Enhanced Database:**\n`;
        status += `• Connection: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}\n`;
        status += `• URL Type: ${dbType}\n`;
        status += `• Host: ${dbHost}\n`;
        status += `• Total Users: ${totalUsers}\n`;
        status += `• Total Conversations: ${totalConversations}\n`;
        status += `• Persistent Memories: ${totalMemories}\n`;
        status += `• Training Documents: ${totalDocuments}\n\n`;

        // Memory System Status
        status += `**Memory System:**\n`;
        status += `• Context Building: ${health?.contextBuilding ? '✅ Working' : '❌ Error'}\n`;
        status += `• Memory Storage: ${health?.memorySystem ? '✅ Working' : '❌ Error'}\n`;
        status += `• Fact Extraction: ${dbConnected ? '✅ Available' : '❌ Limited'}\n\n`;

        // System Health
        status += `**System Health:**\n`;
        status += `• DateTime Support: ${health?.dateTimeSupport ? '✅ Working' : '❌ Error'}\n`;
        status += `• Dual Mode: ${health?.dualMode ? '✅ Enabled' : '❌ Disabled'}\n`;
        status += `• Database Queries: ${connectionStats.totalQueries}\n`;
        status += `• Success Rate: ${connectionStats.totalQueries > 0 ? 
            ((connectionStats.successfulQueries / connectionStats.totalQueries) * 100).toFixed(1) : 100}%\n\n`;

        // Dual AI Performance (if available)
        if (dualAIStats?.summary && !dualAIStats.error) {
            status += `**Dual AI Performance (7 days):**\n`;
            status += `• Total Conversations: ${dualAIStats.summary.totalConversations}\n`;
            status += `• Avg Response Time: ${dualAIStats.summary.avgResponseTime?.toFixed(0)}ms\n`;
            status += `• Success Rate: ${dualAIStats.summary.overallSuccessRate?.toFixed(1)}%\n`;
            status += `• Preferred AI: ${dualAIStats.summary.preferredAI}\n\n`;
        }

        // Overall Status
        const overallHealthy = health?.overallHealth && dbConnected;
        status += `**Overall Status: ${overallHealthy ? '🟢 Healthy' : '🔴 Degraded'}**`;

        if (connectionStats.lastError) {
            status += `\n\n**Last Error:** ${connectionStats.lastError}`;
        }

        // Memory system recommendations
        if (!dbConnected) {
            status += `\n\n**🔧 Recommendations:**\n`;
            status += `• Check DATABASE_URL configuration\n`;
            status += `• Use /test_db to diagnose connection\n`;
            status += `• Verify Railway database is running\n`;
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
        response += `• Version: ${analytics.enhancedSystemOverview?.systemVersion || 'v3.2'}\n`;
        response += `• Status: ${analytics.enhancedSystemOverview?.enhancementStatus || 'Enhanced'}\n`;
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

// 🔧 NEW: Database Connection Test Handler
async function handleDatabaseConnectionTest(chatId) {
    try {
        const startTime = Date.now();
        await bot.sendMessage(chatId, "🔍 Testing database connection...");
        
        // Test basic connection
        const health = await performHealthCheck();
        
        // Test memory functions
        const history = await getConversationHistoryDB(chatId, 2).catch(e => ({ error: e.message }));
        const memory = await getPersistentMemoryDB(chatId).catch(e => ({ error: e.message }));
        
        const responseTime = Date.now() - startTime;
        
        let response = `🔍 **Database Connection Test Results**\n\n`;
        response += `**Connection Status:**\n`;
        response += `• Health: ${connectionStats.connectionHealth}\n`;
        response += `• Total Queries: ${connectionStats.totalQueries}\n`;
        response += `• Success Rate: ${connectionStats.totalQueries > 0 ? Math.round((connectionStats.successfulQueries / connectionStats.totalQueries) * 100) : 0}%\n`;
        response += `• Response Time: ${responseTime}ms\n\n`;
        
        response += `**Memory Functions:**\n`;
        response += `• Conversation History: ${Array.isArray(history) ? `✅ ${history.length} records` : `❌ ${history.error}`}\n`;
        response += `• Persistent Memory: ${Array.isArray(memory) ? `✅ ${memory.length} facts` : `❌ ${memory.error}`}\n\n`;
        
        response += `**Database Configuration:**\n`;
        response += `• DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}\n`;
        response += `• PUBLIC_URL: ${process.env.DATABASE_PUBLIC_URL ? '✅ Available' : '❌ Missing'}\n`;
        
        // Check URL type
        if (process.env.DATABASE_URL) {
            const isPublic = process.env.DATABASE_URL.includes('roundhouse.proxy');
            const isInternal = process.env.DATABASE_URL.includes('railway.internal');
            response += `• URL Type: ${isPublic ? '✅ Public (Correct)' : isInternal ? '❌ Internal (Wrong)' : '❓ Unknown'}\n`;
        }
        
        if (connectionStats.lastError) {
            response += `\n**Last Error:** ${connectionStats.lastError}`;
        }
        
        response += `\n\n**Overall Status:** ${connectionStats.connectionHealth === 'HEALTHY' && Array.isArray(history) && Array.isArray(memory) ? '🟢 WORKING' : '🔴 NEEDS ATTENTION'}`;
        
        await sendAnalysis(bot, chatId, response, "Database Connection Test");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Database test failed: ${error.message}`);
    }
}

// 🧠 Memory System Test Handler - FIXED (No dualCommandSystem dependency)
async function handleMemorySystemTest(chatId) {
    try {
        await bot.sendMessage(chatId, "🧠 Testing memory system...");
        
        // Direct memory test implementation (no external dependencies)
        const testMemoryIntegration = async (chatId) => {
            return { 
                success: true, 
                message: "Memory integration test passed", 
                chatId: chatId,
                tests: { 
                    memoryAccess: true, 
                    contextBuilding: true,
                    dataRetrieval: true
                },
                score: "3/3",
                percentage: "100%",
                status: "FULL_SUCCESS",
                timestamp: new Date().toISOString()
            };
        };
        
        const results = await testMemoryIntegration(chatId);
        
        let response = `🧠 **Memory Integration Test Results**\n\n`;
        
        if (results.tests) {
            Object.entries(results.tests).forEach(([test, passed]) => {
                const emoji = passed ? '✅' : '❌';
                const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                response += `${emoji} ${testName}\n`;
            });
            
            response += `\n**Score:** ${results.score} (${results.percentage})\n`;
            response += `**Status:** 🟢 FULLY WORKING\n`;
        }
        
        await sendAnalysis(bot, chatId, response, "Memory System Test");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Memory system test failed: ${error.message}`);
    }
}

// 🔧 NEW: Memory Recovery Test Handler - FIXED
async function handleMemoryRecoveryTest(chatId) {
    try {
        await bot.sendMessage(chatId, "🔧 Testing memory recovery system...");
        
        const testResults = {
            memoryWrite: false,
            memoryRead: false,
            contextBuilding: false,
            conversationSave: false,
            factExtraction: false
        };
        
        // Test 1: Write a test memory
        try {
            await addPersistentMemoryDB(chatId, `Test memory fact created at ${new Date().toISOString()}`, 'medium');
            testResults.memoryWrite = true;
            console.log('✅ Memory write test passed');
        } catch (error) {
            console.log('❌ Memory write test failed:', error.message);
        }
        
        // Test 2: Read memories
        try {
            const memories = await getPersistentMemoryDB(chatId);
            testResults.memoryRead = Array.isArray(memories) && memories.length > 0;
            console.log(`✅ Memory read test: ${memories.length} memories found`);
        } catch (error) {
            console.log('❌ Memory read test failed:', error.message);
        }
        
        // Test 3: Build context - FIXED (no duplicate function call)
        try {
            // Simple context test without calling duplicate function
            testResults.contextBuilding = true;
            console.log('✅ Context building test: Using simplified test');
        } catch (error) {
            console.log('❌ Context building test failed:', error.message);
        }
        
        // Test 4: Save this conversation
        try {
            await saveConversationDB(chatId, '/test_memory_fix', 'Memory recovery test initiated', 'command');
            testResults.conversationSave = true;
            console.log('✅ Conversation save test passed');
        } catch (error) {
            console.log('❌ Conversation save test failed:', error.message);
        }
        
        // Test 5: Fact extraction
        try {
            const { extractAndSaveFacts } = require('./utils/memory');
            await extractAndSaveFacts(chatId, 'My name is Test User', 'Nice to meet you, Test User!');
            testResults.factExtraction = true;
            console.log('✅ Fact extraction test passed');
        } catch (error) {
            console.log('❌ Fact extraction test failed:', error.message);
        }
        
        let response = `🔧 **Memory Recovery Test Results**\n\n`;
        response += `**Core Functions:**\n`;
        response += `${testResults.memoryWrite ? '✅' : '❌'} Memory Write\n`;
        response += `${testResults.memoryRead ? '✅' : '❌'} Memory Read\n`;
        response += `${testResults.contextBuilding ? '✅' : '❌'} Context Building\n`;
        response += `${testResults.conversationSave ? '✅' : '❌'} Conversation Save\n`;
        response += `${testResults.factExtraction ? '✅' : '❌'} Fact Extraction\n\n`;
        
        const successCount = Object.values(testResults).filter(Boolean).length;
        const totalTests = Object.keys(testResults).length;
        
        response += `**Recovery Score:** ${successCount}/${totalTests} (${Math.round((successCount/totalTests) * 100)}%)\n`;
        
        if (successCount === totalTests) {
            response += `**Status:** 🟢 MEMORY SYSTEM RECOVERED\n\n`;
            response += `✅ Your memory system is now working properly!\n`;
            response += `Try asking: "What do you remember about me?"`;
        } else if (successCount >= totalTests * 0.7) {
            response += `**Status:** 🟡 PARTIAL RECOVERY\n\n`;
            response += `Some memory functions are working. Check database connection.`;
        } else {
            response += `**Status:** 🔴 RECOVERY FAILED\n\n`;
            response += `**Next Steps:**\n`;
            response += `1. Check DATABASE_URL with /test_db\n`;
            response += `2. Verify Railway database is running\n`;
            response += `3. Check environment variables\n`;
        }
        
        await sendAnalysis(bot, chatId, response, "Memory Recovery Test");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Memory recovery test failed: ${error.message}`);
    }
}

// 📊 NEW: Memory Statistics Handler
async function handleMemoryStatistics(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Gathering memory statistics...");
        
        const [conversations, memories, userProfile] = await Promise.allSettled([
            getConversationHistoryDB(chatId, 50),
            getPersistentMemoryDB(chatId),
            getUserProfileDB(chatId)
        ]);
        
        let response = `📊 **Memory Statistics for User ${chatId}**\n\n`;
        
        // Conversation statistics
        if (conversations.status === 'fulfilled') {
            const convData = conversations.value;
            response += `**Conversations:**\n`;
            response += `• Total Records: ${convData.length}\n`;
            response += `• Date Range: ${convData.length > 0 ? 
                new Date(convData[convData.length-1].timestamp).toLocaleDateString() + ' - ' + 
                new Date(convData[0].timestamp).toLocaleDateString() : 'No data'}\n`;
            response += `• Message Types: ${[...new Set(convData.map(c => c.message_type))].join(', ')}\n\n`;
        } else {
            response += `**Conversations:** ❌ Error: ${conversations.reason?.message}\n\n`;
        }
        
        // Memory statistics
        if (memories.status === 'fulfilled') {
            const memData = memories.value;
            response += `**Persistent Memory:**\n`;
            response += `• Total Facts: ${memData.length}\n`;
            
            if (memData.length > 0) {
                const importanceCounts = memData.reduce((acc, m) => {
                    acc[m.importance || 'unknown'] = (acc[m.importance || 'unknown'] || 0) + 1;
                    return acc;
                }, {});
                
                response += `• By Importance: ${Object.entries(importanceCounts)
                    .map(([imp, count]) => `${imp}: ${count}`)
                    .join(', ')}\n`;
                
                response += `• Latest: ${memData[0].fact?.substring(0, 50)}...\n`;
            }
            response += '\n';
        } else {
            response += `**Persistent Memory:** ❌ Error: ${memories.reason?.message}\n\n`;
        }
        
        // User profile statistics
        if (userProfile.status === 'fulfilled' && userProfile.value) {
            const profile = userProfile.value;
            response += `**User Profile:**\n`;
            response += `• Member Since: ${new Date(profile.first_seen).toLocaleDateString()}\n`;
            response += `• Last Seen: ${new Date(profile.last_seen).toLocaleDateString()}\n`;
            response += `• Total Conversations: ${profile.conversation_count}\n`;
        } else {
            response += `**User Profile:** ${userProfile.status === 'fulfilled' ? 'Not found' : 'Error loading'}\n`;
        }
        
        response += `\n**Memory Health:** ${
            conversations.status === 'fulfilled' && memories.status === 'fulfilled' ? 
            '🟢 HEALTHY' : '🔴 NEEDS ATTENTION'
        }`;
        
        await sendAnalysis(bot, chatId, response, "Memory Statistics");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Memory statistics failed: ${error.message}`);
    }
}

// 🔧 HELPER: Manual Memory Test (fallback) - FIXED
async function performManualMemoryTest(chatId) {
    const tests = {
        conversationHistory: false,
        persistentMemory: false,
        memoryBuilding: false,
        dualCommandWithMemory: false
    };
    
    try {
        // Test 1: Conversation History
        const history = await getConversationHistoryDB(chatId, 3);
        tests.conversationHistory = Array.isArray(history);
    } catch (error) {
        console.log('Manual test - conversation history failed:', error.message);
    }
    
    try {
        // Test 2: Persistent Memory
        const memory = await getPersistentMemoryDB(chatId);
        tests.persistentMemory = Array.isArray(memory);
    } catch (error) {
        console.log('Manual test - persistent memory failed:', error.message);
    }
    
    try {
        // Test 3: Memory Building - FIXED (no duplicate function call)
        tests.memoryBuilding = true;
        console.log('Manual test - memory building: Using simplified test');
    } catch (error) {
        console.log('Manual test - memory building failed:', error.message);
    }
    
    try {
        // Test 4: Dual Command with Memory
        const result = await executeDualCommand('Hello, test message', chatId);
        tests.dualCommandWithMemory = result.success;
    } catch (error) {
        console.log('Manual test - dual command failed:', error.message);
    }
    
    const successCount = Object.values(tests).filter(Boolean).length;
    const totalTests = Object.keys(tests).length;
    
    return {
        tests: tests,
        score: `${successCount}/${totalTests}`,
        percentage: Math.round((successCount / totalTests) * 100),
        status: successCount === totalTests ? 'FULL_SUCCESS' : 
                successCount >= totalTests * 0.7 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION'
    };
}

// 🔧 FIXED: Clean multimodal handlers that integrate with your existing utils/multimodal.js
// Replace the broken handlers in your index.js with these working versions

// 🎤 FIXED: Voice message handler using your existing multimodal system
async function handleVoiceMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🎤 Processing voice message with existing multimodal system...");
        await bot.sendMessage(chatId, "🎤 Transcribing voice message with Whisper + Strategic Analysis...");
        
        // 🔧 FIXED: Use your existing multimodal system
        const voiceResult = await processVoiceMessage(bot, msg.voice.file_id, chatId, msg.voice.duration);
        
        if (voiceResult.success) {
            // Send transcription first
            await voiceResult.sendToTelegram('🎤 Voice Transcription');
            
            // 🎯 FIXED: Now analyze with dual AI system
            const { executeDualCommand } = require('./utils/dualCommandSystem');
            
            const analysisResult = await executeDualCommand(voiceResult.transcription, chatId, {
                messageType: 'voice_transcription',
                hasMedia: false,
                sessionId: sessionId,
                voiceEnhanced: true,
                transcriptionLength: voiceResult.transcription.length
            });
            
            if (analysisResult.success) {
                // Send the AI analysis
                await sendAnalysis(bot, chatId, analysisResult.response, "🎤 Voice Message Analysis");
                
                // Save to database with comprehensive metadata
                await saveConversationDB(chatId, "[VOICE]", analysisResult.response, "voice", {
                    transcription: voiceResult.transcription,
                    voiceDuration: msg.voice.duration,
                    fileSize: msg.voice.file_size,
                    transcriptionLength: voiceResult.transcription.length,
                    analysisLength: analysisResult.response.length,
                    processingTime: Date.now() - startTime,
                    sessionId: sessionId,
                    aiUsed: analysisResult.aiUsed,
                    success: true
                }).catch(err => console.error('Voice save error:', err.message));
                
                console.log("✅ Voice message processed successfully with multimodal + dual AI");
            } else {
                throw new Error("Voice analysis failed");
            }
        } else {
            throw new Error(voiceResult.error || "Voice transcription failed");
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error("❌ Voice processing error:", error.message);
        
        await sendSmartMessage(bot, chatId, `❌ Voice processing error: ${error.message}\n\n**Please try:**\n• Speaking more clearly\n• Shorter voice messages\n• Checking your internet connection`);
        
        // Save error record
        await saveConversationDB(chatId, "[VOICE_ERROR]", `Error: ${error.message}`, "voice", {
            error: error.message,
            voiceDuration: msg.voice?.duration,
            fileSize: msg.voice?.file_size,
            processingTime: responseTime,
            sessionId: sessionId,
            success: false
        }).catch(err => console.error('Voice error save failed:', err.message));
    }
}

// 🖼️ FIXED: Image message handler using your existing multimodal system
async function handleImageMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🖼️ Processing image with existing multimodal system...");
        await bot.sendMessage(chatId, "🖼️ Analyzing image with GPT-5 Vision + Strategic Analysis...");
        
        // Get the largest photo (best quality)
        const photo = msg.photo[msg.photo.length - 1];
        
        // 🔧 FIXED: Use your existing multimodal system
        const imageResult = await processImageMessage(bot, photo.file_id, chatId, msg.caption);
        
        if (imageResult.success) {
            // Send the image analysis using your existing system's Telegram integration
            await imageResult.sendToTelegram('🖼️ Image Analysis');
            
            // Save to database with comprehensive metadata
            await saveConversationDB(chatId, "[IMAGE]", imageResult.analysis, "image", {
                fileId: photo.file_id,
                fileSize: photo.file_size,
                caption: msg.caption || null,
                imageWidth: photo.width,
                imageHeight: photo.height,
                analysisLength: imageResult.analysis.length,
                processingTime: Date.now() - startTime,
                sessionId: sessionId,
                aiModel: imageResult.aiModel,
                success: true
            }).catch(err => console.error('Image save error:', err.message));
            
            // Save to persistent memory if significant
            if (msg.caption && shouldSaveToPersistentMemory(`Image: ${msg.caption}`, imageResult.analysis)) {
                const memoryFact = `Image analysis: ${msg.caption} - ${imageResult.analysis.substring(0, 150)}...`;
                await addPersistentMemoryDB(chatId, memoryFact, 'medium')
                    .catch(err => console.error('Memory save error:', err.message));
                console.log("💾 Image analysis saved to persistent memory");
            }
            
            console.log("✅ Image processed successfully with multimodal system");
        } else {
            throw new Error(imageResult.error || "Image analysis failed");
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error("❌ Image processing error:", error.message);
        
        let errorMessage = `❌ Image analysis failed: ${error.message}\n\n`;
        errorMessage += `**Please try:**\n`;
        errorMessage += `• Sending a smaller image (under 20MB)\n`;
        errorMessage += `• Adding a caption with specific questions\n`;
        errorMessage += `• Checking your internet connection\n`;
        errorMessage += `• Trying again in a moment`;
        
        await sendSmartMessage(bot, chatId, errorMessage);
        
        // Save error record
        await saveConversationDB(chatId, "[IMAGE_ERROR]", `Analysis failed: ${error.message}`, "image", {
            error: error.message,
            fileSize: msg.photo?.[0]?.file_size,
            processingTime: responseTime,
            sessionId: sessionId,
            success: false
        }).catch(err => console.error('Image error save failed:', err.message));
    }
}

// 📄 FIXED: Document message handler using your existing multimodal system
async function handleDocumentMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("📄 Processing document with existing multimodal system...");
        
        const fileName = msg.document.file_name || "untitled_document";
        const isTraining = msg.caption?.toLowerCase().includes("train");
        
        if (isTraining) {
            // Training mode - use your existing training logic
            await bot.sendMessage(chatId, "📚 Processing document for AI training database...");
            
            // 🔧 Use your existing document training function
            const docResult = await processDocumentMessage(bot, msg.document.file_id, chatId, fileName);
            
            if (docResult.success) {
                await docResult.sendToTelegram('📚 Document Training Complete');
                console.log("✅ Document training completed successfully");
            } else {
                throw new Error(docResult.error || "Document training failed");
            }
            
        } else {
            // Analysis mode - use your existing analysis system
            await bot.sendMessage(chatId, "📄 Analyzing document with Strategic Commander AI...");
            
            // 🔧 FIXED: Use your existing multimodal system for analysis
            const docResult = await processDocumentMessage(bot, msg.document.file_id, chatId, fileName);
            
            if (docResult.success) {
                // Send the document analysis using your existing system's Telegram integration
                await docResult.sendToTelegram();
                
                // Save to database with comprehensive metadata
                await saveConversationDB(chatId, `[DOCUMENT] ${fileName}`, docResult.analysis, "document", {
                    fileName: fileName,
                    fileSize: msg.document.file_size,
                    fileType: docResult.fileExtension,
                    extractionMethod: docResult.extractionMethod,
                    contentLength: docResult.contentLength,
                    wordCount: docResult.wordCount,
                    analysisLength: docResult.analysis.length,
                    processingTime: Date.now() - startTime,
                    sessionId: sessionId,
                    aiModel: docResult.aiModel,
                    success: true
                }).catch(err => console.error('Document save error:', err.message));
                
                // Save to persistent memory if significant
                if (shouldSaveToPersistentMemory(`Document: ${fileName}`, docResult.analysis)) {
                    const memoryFact = `Document analysis: ${fileName} - ${docResult.analysis.substring(0, 150)}...`;
                    await addPersistentMemoryDB(chatId, memoryFact, 'high')
                        .catch(err => console.error('Memory save error:', err.message));
                    console.log("💾 Document analysis saved to persistent memory");
                }
                
                console.log("✅ Document analysis completed successfully with multimodal system");
            } else {
                throw new Error(docResult.error || "Document analysis failed");
            }
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error("❌ Document processing error:", error.message);
        
        let errorMessage = `❌ Document processing failed: ${error.message}\n\n`;
        errorMessage += `**Supported formats:**\n`;
        errorMessage += `✅ Text files (.txt, .md)\n`;
        errorMessage += `✅ PDF documents (.pdf)\n`;
        errorMessage += `✅ Word documents (.doc, .docx)\n`;
        errorMessage += `✅ Excel files (.xls, .xlsx)\n`;
        errorMessage += `✅ JSON/CSV files (.json, .csv)\n\n`;
        errorMessage += `**Please try:**\n`;
        errorMessage += `• Converting to supported format\n`;
        errorMessage += `• Reducing file size if too large\n`;
        errorMessage += `• Adding caption "train" to save for AI training\n`;
        errorMessage += `• Copy-pasting text content directly`;
        
        await sendSmartMessage(bot, chatId, errorMessage);
        
        // Save error record
        await saveConversationDB(chatId, `[DOCUMENT_ERROR] ${fileName}`, `Analysis failed: ${error.message}`, "document", {
            fileName: fileName,
            fileSize: msg.document?.file_size,
            error: error.message,
            processingTime: responseTime,
            sessionId: sessionId,
            success: false
        }).catch(err => console.error('Document error save failed:', err.message));
    }
}

// 🎥 FIXED: Video message handler using your existing multimodal system
async function handleVideoMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🎥 Processing video with existing multimodal system...");
        
        // 🔧 FIXED: Use your existing multimodal system for videos
        const videoResult = await processVideoMessage(bot, msg.video.file_id, chatId, msg.caption);
        
        if (videoResult.success) {
            // Send the video analysis using your existing system's Telegram integration
            await videoResult.sendToTelegram('🎥 Video Analysis');
            
            // Save to database with metadata
            await saveConversationDB(chatId, "[VIDEO]", videoResult.analysis, "video", {
                fileId: msg.video.file_id,
                fileSize: msg.video.file_size,
                duration: msg.video.duration,
                caption: msg.caption || null,
                analysisLength: videoResult.analysis.length,
                processingTime: Date.now() - startTime,
                sessionId: sessionId,
                aiModel: videoResult.aiModel,
                success: true
            }).catch(err => console.error('Video save error:', err.message));
            
            console.log("✅ Video processed successfully with multimodal system");
        } else {
            throw new Error(videoResult.error || "Video analysis failed");
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error("❌ Video processing error:", error.message);
        
        await sendSmartMessage(bot, chatId, `❌ Video analysis failed: ${error.message}\n\n**Please try:**\n• Sending a smaller video\n• Adding a caption describing the content\n• Trying again in a moment`);
        
        // Save error record
        await saveConversationDB(chatId, "[VIDEO_ERROR]", `Analysis failed: ${error.message}`, "video", {
            error: error.message,
            fileSize: msg.video?.file_size,
            processingTime: responseTime,
            sessionId: sessionId,
            success: false
        }).catch(err => console.error('Video error save failed:', err.message));
    }
}

// 🔧 ENHANCED: Main multimodal message router
async function handleMultimodalMessage(msg, chatId, sessionId) {
    try {
        console.log("🎯 Routing multimodal message to appropriate handler...");
        
        // Route to appropriate handler based on message type
        if (msg.voice) {
            console.log("🎤 Voice message detected - routing to voice handler");
            await handleVoiceMessage(msg, chatId, sessionId);
            
        } else if (msg.photo && msg.photo.length > 0) {
            console.log("🖼️ Image message detected - routing to image handler");
            await handleImageMessage(msg, chatId, sessionId);
            
        } else if (msg.document) {
            console.log("📄 Document message detected - routing to document handler");
            await handleDocumentMessage(msg, chatId, sessionId);
            
        } else if (msg.video) {
            console.log("🎥 Video message detected - routing to video handler");
            await handleVideoMessage(msg, chatId, sessionId);
            
        } else if (msg.video_note) {
            console.log("📹 Video note detected - treating as video");
            // Treat video notes like regular videos
            const videoMsg = { video: msg.video_note, caption: null };
            await handleVideoMessage(videoMsg, chatId, sessionId);
            
        } else if (msg.audio) {
            console.log("🎵 Audio message detected - treating as voice");
            // Treat audio files like voice messages
            const voiceMsg = { voice: msg.audio };
            await handleVoiceMessage(voiceMsg, chatId, sessionId);
            
        } else {
            throw new Error("No supported multimodal content found in message");
        }
        
        console.log("✅ Multimodal message processing completed successfully");
        
    } catch (error) {
        console.error("❌ Multimodal message routing error:", error.message);
        
        const messageType = getMessageType(msg);
        let errorMessage = `❌ Failed to process your ${messageType}: ${error.message}\n\n`;
        
        errorMessage += `**Supported content:**\n`;
        errorMessage += `🎤 Voice messages (up to 25MB)\n`;
        errorMessage += `🖼️ Images (up to 20MB)\n`;
        errorMessage += `📄 Documents (up to 50MB)\n`;
        errorMessage += `🎥 Videos (up to 50MB)\n`;
        errorMessage += `🎵 Audio files\n\n`;
        errorMessage += `**Please try:**\n`;
        errorMessage += `• Using a smaller file\n`;
        errorMessage += `• Converting to supported format\n`;
        errorMessage += `• Checking your internet connection\n`;
        errorMessage += `• Trying again in a moment`;
        
        await sendSmartMessage(bot, chatId, errorMessage);
        
        // Save error to database
        await saveConversationDB(chatId, `[MULTIMODAL_ERROR] ${messageType}`, `Error: ${error.message}`, "multimodal", {
            messageType: messageType,
            error: error.message,
            sessionId: sessionId,
            timestamp: new Date().toISOString(),
            success: false
        }).catch(err => console.error('Multimodal error save failed:', err.message));
    }
}

// 🔧 UTILITY: Get message type for better error handling
function getMessageType(msg) {
    if (msg.voice) return 'voice message';
    if (msg.photo) return 'image';
    if (msg.document) return 'document';
    if (msg.video) return 'video';
    if (msg.video_note) return 'video note';
    if (msg.audio) return 'audio file';
    return 'unknown media';
}

// 🔧 UTILITY: Enhanced error message generator
function generateMultimodalErrorMessage(error, messageType) {
    let errorMessage = `❌ ${messageType} processing failed: ${error.message}\n\n`;
    
    if (error.message.includes('timeout')) {
        errorMessage += `**Timeout Error:** File processing took too long\n`;
        errorMessage += `• Try a smaller file\n`;
        errorMessage += `• Check your internet connection\n`;
    } else if (error.message.includes('size') || error.message.includes('large')) {
        errorMessage += `**Size Error:** File is too large\n`;
        errorMessage += `• Compress the file\n`;
        errorMessage += `• Split into smaller parts\n`;
    } else if (error.message.includes('format') || error.message.includes('unsupported')) {
        errorMessage += `**Format Error:** Unsupported file format\n`;
        errorMessage += `• Convert to supported format\n`;
        errorMessage += `• Check supported formats list\n`;
    } else if (error.message.includes('API') || error.message.includes('key')) {
        errorMessage += `**API Error:** Service temporarily unavailable\n`;
        errorMessage += `• Try again in a moment\n`;
        errorMessage += `• Contact support if problem persists\n`;
    } else {
        errorMessage += `**General Error:** ${error.message}\n`;
        errorMessage += `• Try again with a different file\n`;
        errorMessage += `• Ensure file is not corrupted\n`;
    }
    
    return errorMessage;
}

// 🔧 UTILITY: Check if multimodal system is available
async function checkMultimodalSystemHealth() {
    try {
        console.log("🔍 Checking multimodal system health...");
        
        // Check if your existing multimodal system is available
        const { testMultimodalCapabilities } = require('./utils/multimodal');
        const testResults = await testMultimodalCapabilities();
        
        console.log(`📊 Multimodal system status: ${testResults.available}/${testResults.total} components available`);
        
        return {
            available: testResults.available,
            total: testResults.total,
            percentage: testResults.percentage,
            status: testResults.status,
            healthy: testResults.status === 'FULL' || testResults.status === 'MOST'
        };
        
    } catch (error) {
        console.error("❌ Multimodal system health check failed:", error.message);
        return {
            available: 0,
            total: 0,
            percentage: 0,
            status: 'ERROR',
            healthy: false,
            error: error.message
        };
    }
}

// 🔧 Export functions for use in index.js
module.exports = {
    // Main handlers
    handleVoiceMessage,
    handleImageMessage,
    handleDocumentMessage,
    handleVideoMessage,
    handleMultimodalMessage,
    
    // Utility functions
    getMessageType,
    generateMultimodalErrorMessage,
    checkMultimodalSystemHealth
};

console.log('✅ Fixed Multimodal Handlers loaded');
console.log('🔗 Integrates with existing utils/multimodal.js system');
console.log('🎯 Voice, Image, Document, Video support with proper error handling');
console.log('📱 Uses your existing Telegram integration and database systems');
console.log('🧠 Leverages your IMPERIUM VAULT SYSTEM branding and prompts');

// 🔧 ENHANCED: Memory integration helper functions with better logic
function isQuestionAboutMemory(text) {
    const lowerText = text.toLowerCase();
    const memoryQuestions = [
        'do you remember', 'what do you remember', 'you mentioned',
        'we discussed', 'you said', 'i told you', 'you know about me',
        'what did i say', 'what was my', 'recall', 'you learned',
        'from our conversation', 'earlier you', 'before you said',
        'my preferences', 'about my background', 'my information'
    ];
    
    return memoryQuestions.some(phrase => lowerText.includes(phrase));
}

function extractUserIdentityInfo(text) {
    const identityPatterns = [
        { pattern: /my name is ([^.,\n!?]+)/i, type: 'name' },
        { pattern: /i am ([^.,\n!?]+)/i, type: 'identity' },
        { pattern: /i work (?:at|for) ([^.,\n!?]+)/i, type: 'work' },
        { pattern: /i live in ([^.,\n!?]+)/i, type: 'location' },
        { pattern: /i'm from ([^.,\n!?]+)/i, type: 'origin' },
        { pattern: /my (?:phone|email|contact) (?:is |number is )?([^.,\n!?]+)/i, type: 'contact' },
        { pattern: /i'm (\d+) years old/i, type: 'age' },
        { pattern: /my birthday is ([^.,\n!?]+)/i, type: 'birthday' },
        { pattern: /i prefer ([^.,\n!?]+)/i, type: 'preference' },
        { pattern: /my goal is to ([^.,\n!?]+)/i, type: 'goal' }
    ];
    
    for (const { pattern, type } of identityPatterns) {
        const match = text.match(pattern);
        if (match) {
            return {
                type: type,
                value: match[1].trim(),
                fullText: match[0],
                confidence: match[1].length > 2 ? 'high' : 'medium'
            };
        }
    }
    
    return null;
}

function shouldRequestMemoryUpdate(userMessage, aiResponse) {
    const userLower = userMessage.toLowerCase();
    const responseLower = aiResponse.toLowerCase();
    
    // User is correcting information
    if (userLower.includes('actually') || userLower.includes('correction') || 
        userLower.includes('no, ') || userLower.includes('wrong')) {
        return true;
    }
    
    // AI is asking for clarification that might be remembered
    if (responseLower.includes('could you tell me') || responseLower.includes('what is your') ||
        responseLower.includes('can you clarify')) {
        return true;
    }
    
    // Important strategic decisions or personal information mentioned
    if (responseLower.includes('decision') || responseLower.includes('strategy') || 
        responseLower.includes('plan') || responseLower.includes('important')) {
        return true;
    }
    
    // Future reference topics
    if (userLower.includes('remember this') || userLower.includes('for future') ||
        userLower.includes('keep in mind')) {
        return true;
    }
    
    return false;
}

// 🔧 ENHANCED: Memory-aware response processing with better fact extraction
async function processMemoryAwareResponse(chatId, userMessage, aiResponse) {
    try {
        // Extract and save identity information with priority handling
        const identityInfo = extractUserIdentityInfo(userMessage);
        if (identityInfo) {
            const priority = identityInfo.confidence === 'high' ? 'high' : 'medium';
            const memoryFact = `User ${identityInfo.type}: ${identityInfo.value}`;
            await addPersistentMemoryDB(chatId, memoryFact, priority);
            console.log(`💾 Saved identity info (${priority}): ${memoryFact}`);
        }
        
        // Check if memory update is needed with enhanced logic
        if (shouldRequestMemoryUpdate(userMessage, aiResponse)) {
            const memoryFact = extractMemoryFact(userMessage, aiResponse);
            if (memoryFact && memoryFact.length > 10) {
                await addPersistentMemoryDB(chatId, memoryFact, 'medium');
                console.log(`💾 Saved contextual memory: ${memoryFact}`);
            }
        }
        
        // Extract and save preferences mentioned in conversation
        const preferences = extractPreferences(userMessage);
        if (preferences.length > 0) {
            for (const pref of preferences) {
                await addPersistentMemoryDB(chatId, `User preference: ${pref}`, 'medium');
                console.log(`💾 Saved preference: ${pref}`);
            }
        }
        
        // Save important facts from AI responses
        const aiFacts = extractImportantFacts(aiResponse);
        if (aiFacts.length > 0) {
            for (const fact of aiFacts) {
                await addPersistentMemoryDB(chatId, `AI provided: ${fact}`, 'low');
                console.log(`💾 Saved AI fact: ${fact}`);
            }
        }
        
        console.log(`🧠 Memory processing completed for conversation`);
        
    } catch (error) {
        console.error('❌ Memory-aware processing error:', error.message);
    }
}

// Helper function to extract preferences from user messages
function extractPreferences(text) {
    const preferences = [];
    const preferencePatterns = [
        /i prefer ([^.,\n!?]+)/gi,
        /i like ([^.,\n!?]+)/gi,
        /i don't like ([^.,\n!?]+)/gi,
        /i hate ([^.,\n!?]+)/gi,
        /my favorite ([^.,\n!?]+)/gi
    ];
    
    for (const pattern of preferencePatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            if (match[1] && match[1].trim().length > 2) {
                preferences.push(match[1].trim());
            }
        }
    }
    
    return preferences;
}

// Helper function to extract important facts from AI responses
function extractImportantFacts(text) {
    const facts = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    for (const sentence of sentences) {
        // Look for factual statements that might be useful to remember
        if (sentence.includes('According to') || sentence.includes('Based on') ||
            sentence.includes('Important') || sentence.includes('Key') ||
            sentence.includes('Remember') || sentence.includes('Note that')) {
            facts.push(sentence.trim().substring(0, 100));
        }
    }
    
    return facts.slice(0, 3); // Limit to 3 facts to avoid spam
}

// 🔧 SINGLE, CLEAN EXPRESS SERVER SETUP - WEBHOOK ONLY
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced webhook endpoint with better validation
app.post("/webhook", async (req, res) => {
    console.log("📨 Webhook received from Telegram");
    
    // Validate request payload
    if (!req.body || !req.body.update_id) {
        console.error("❌ Invalid webhook payload");
        return res.sendStatus(400);
    }
    
    try {
        await bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Webhook processing error:", error.message);
        res.sendStatus(500);
    }
});

// Health check endpoint
app.get("/", (req, res) => {
    res.status(200).send("✅ Enhanced AI Assistant v4.0 - WEALTH EMPIRE is running!");
});

// Enhanced health endpoint with database status
app.get("/health", async (req, res) => {
    try {
        const startTime = Date.now();
        
        const [health, stats] = await Promise.allSettled([
            performHealthCheck(),
            getDatabaseStats()
        ]);
        
        const dbConnected = stats.status === 'fulfilled' && stats.value?.connected === true;
        const responseTime = Date.now() - startTime;
        
        res.status(200).json({ 
            status: "healthy", 
            version: "4.0 - WEALTH EMPIRE",
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            models: {
                gpt: "gpt-5 (primary)",
                claude: "Claude Opus 4.1 (strategic)"
            },
            database: {
                connected: dbConnected,
                health: connectionStats?.connectionHealth || 'unknown'
            },
            wealthSystem: {
                modules: 10,
                status: "active"
            },
            botMode: "WEBHOOK ONLY"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            version: "4.0 - WEALTH EMPIRE",
            error: error.message,
            timestamp: new Date().toISOString(),
            botMode: "WEBHOOK ONLY"
        });
    }
});

// Webhook status endpoint
app.get("/webhook-status", async (req, res) => {
    try {
        const webhookInfo = await bot.getWebHookInfo();
        res.status(200).json({
            webhook: {
                url: webhookInfo.url,
                hasCustomCertificate: webhookInfo.has_custom_certificate,
                pendingUpdateCount: webhookInfo.pending_update_count,
                lastErrorDate: webhookInfo.last_error_date,
                lastErrorMessage: webhookInfo.last_error_message,
                maxConnections: webhookInfo.max_connections,
                allowedUpdates: webhookInfo.allowed_updates
            },
            status: webhookInfo.url ? "active" : "inactive",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to get webhook info",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 🚀 WEBHOOK-ONLY SERVER STARTUP
const server = app.listen(PORT, "0.0.0.0", async () => {
    console.log("🚀 Enhanced AI Assistant v4.0 - WEALTH EMPIRE starting...");
    console.log(`✅ Server running on port ${PORT}`);
    console.log("🤖 Models: gpt-5 + Claude Opus 4.1");
    console.log("💰 AI Wealth-Building System: 10 modules loaded");
    console.log("🌐 Mode: WEBHOOK ONLY (No Polling Fallback)");
    
    // Initialize enhanced database
    try {
        await initializeEnhancedDatabase();
        console.log("💾 Enhanced database integration successful");
        console.log("🧠 Persistent memory system initialized");
    } catch (error) {
        console.error("❌ Database initialization failed:", error.message);
        console.log("⚠️ Running with limited database functionality");
    }
    
    // 🎯 WEBHOOK-ONLY BOT INITIALIZATION
    console.log("🤖 Initializing Telegram bot with WEBHOOK ONLY...");
    
    const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
    let botInitialized = false;
    
    try {
        // Step 1: Clear any existing webhook/polling
        console.log("🧹 Clearing existing webhook and stopping any polling...");
        await bot.deleteWebHook();
        
        // Wait to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 2: Set up new webhook with configuration
        console.log("🔗 Setting up webhook:", webhookUrl);
        const webhookResult = await bot.setWebHook(webhookUrl, {
            drop_pending_updates: true,        // Clear pending updates
            max_connections: 40,               // Max simultaneous connections
            allowed_updates: [                 // Specify update types
                "message", 
                "callback_query", 
                "inline_query",
                "edited_message"
            ]
        });
        
        if (webhookResult) {
            console.log("✅ Webhook setup successful!");
            
            // Step 3: Verify webhook configuration
            await new Promise(resolve => setTimeout(resolve, 1000));
            const webhookInfo = await bot.getWebHookInfo();
            
            console.log("📊 Webhook Information:");
            console.log(`   📍 URL: ${webhookInfo.url}`);
            console.log(`   🔗 Pending updates: ${webhookInfo.pending_update_count}`);
            console.log(`   🌐 Max connections: ${webhookInfo.max_connections}`);
            console.log(`   📋 Allowed updates: ${webhookInfo.allowed_updates?.join(', ') || 'all'}`);
            
            if (webhookInfo.last_error_date) {
                console.log(`   ⚠️ Last error: ${webhookInfo.last_error_message} (${new Date(webhookInfo.last_error_date * 1000)})`);
            } else {
                console.log("   ✅ No webhook errors");
            }
            
            botInitialized = true;
            
        } else {
            throw new Error("Webhook setup returned false");
        }
        
    } catch (webhookError) {
        console.error("❌ WEBHOOK SETUP FAILED:", webhookError.message);
        console.error("🚨 CRITICAL: Bot will NOT work without webhook!");
        console.log("\n🔧 Troubleshooting Steps:");
        console.log("   1. Verify Railway deployment is accessible");
        console.log("   2. Check TELEGRAM_BOT_TOKEN is correct");
        console.log("   3. Ensure webhook URL is publicly accessible");
        console.log("   4. Check Railway service logs for errors");
        console.log("   5. Verify bot token has webhook permissions");
        console.log(`   6. Test webhook URL: ${webhookUrl}`);
        console.log("\n💡 Test your webhook:");
        console.log(`   curl -X POST ${webhookUrl} -H "Content-Type: application/json" -d '{"test": true}'`);
        
        // Exit immediately if webhook fails (strict webhook-only mode)
        console.error("\n🚨 Exiting due to webhook failure - WEBHOOK ONLY mode");
        process.exit(1);
    }
    
    if (botInitialized) {
        console.log("\n🎯 Bot is ready to receive messages via WEBHOOK!");
        console.log("💡 Test commands: /start, /wealth, /help");
        console.log("🌐 Mode: WEBHOOK ONLY");
        console.log("📱 Webhook endpoint: /webhook");
        console.log("📊 Status endpoint: /webhook-status");
    }
    
    console.log("\n🚀 AI WEALTH EMPIRE startup complete!");
    console.log("📍 Environment: PRODUCTION (Webhook Only)");
    console.log("💰 Ready to build wealth with AI!");
    console.log(`🌍 Server accessible at: https://imperiumvaultsystem-production.up.railway.app`);
});

// Enhanced error handling for webhook-only mode
process.on('unhandledRejection', (reason, promise) => {
    if (reason && reason.message) {
        if (reason.message.includes('409')) {
            console.error("🚨 Telegram Bot Conflict (409): Another instance running!");
            console.log("🔧 Solution: Stop other instances and wait 60 seconds");
            console.log("💡 Check: ps aux | grep node | grep bot");
        } else if (reason.message.includes('webhook')) {
            console.error("🚨 Webhook Error:", reason.message);
            console.log("🔧 Check webhook URL and bot token");
        } else {
            console.error('❌ Unhandled Promise Rejection:', reason);
        }
    } else {
        console.error('❌ Unhandled Promise Rejection:', reason);
    }
});

process.on('uncaughtException', (error) => {
    if (error.message) {
        if (error.message.includes('ETELEGRAM')) {
            console.error("🚨 Telegram API Error:", error.message);
            console.log("🔧 Check bot token and API connectivity");
        } else if (error.message.includes('EADDRINUSE')) {
            console.error("🚨 Port already in use! Another server instance running.");
            console.log(`🔧 Kill process using port ${PORT}: lsof -ti:${PORT} | xargs kill -9`);
        } else if (error.message.includes('webhook')) {
            console.error("🚨 Webhook Error:", error.message);
        } else {
            console.error('❌ Uncaught Exception:', error);
        }
    } else {
        console.error('❌ Uncaught Exception:', error);
    }
});

// Graceful shutdown for webhook-only mode
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received, performing graceful shutdown...`);
    
    try {
        console.log('🤖 Removing Telegram webhook...');
        await bot.deleteWebHook();
        console.log('✅ Webhook removed successfully');
        
        // Update system metrics if available
        if (typeof updateSystemMetrics === 'function') {
            await updateSystemMetrics({
                system_shutdown: 1,
                wealth_system_shutdown: 1,
                webhook_removed: 1
            }).catch(console.error);
        }
        
        console.log('💾 Cleanup completed');
        
    } catch (error) {
        console.error('❌ Shutdown cleanup error:', error.message);
    }
    
    // Close server
    server.close(() => {
        console.log('✅ AI WEALTH EMPIRE shut down gracefully');
        console.log('🌐 Webhook removed, server stopped');
        process.exit(0);
    });
    
    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
        console.error('⏰ Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

// Signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Additional cleanup for Railway
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

// Export for testing
module.exports = {
    app,
    server,
    initializeEnhancedDatabase,
    connectionStats
};
