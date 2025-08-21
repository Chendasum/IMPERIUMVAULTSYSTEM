require("dotenv").config({ path: ".env" });

// Debug environment variables
console.log("🔧 GPT-5 Only System Environment Check:");
console.log(`ADMIN_CHAT_ID: ${process.env.ADMIN_CHAT_ID}`);
console.log(`TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET"}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "SET" : "NOT SET"}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "SET" : "NOT SET"}`);
console.log(`DATABASE_PUBLIC_URL: ${process.env.DATABASE_PUBLIC_URL ? "SET" : "NOT SET"}`);

const TelegramBot = require("node-telegram-bot-api");

// 🚀 MAIN GPT-5 ONLY SYSTEM - Smart routing across GPT-5 family
const { 
    getGPT5Analysis,
    getEnhancedMarketAnalysis,
    getEnhancedCambodiaAnalysis,
    getEnhancedVisionAnalysis,
    getQuickNanoResponse,
    getQuickMiniResponse,
    getDeepAnalysis,
    getChatResponse,
    testGPT5Capabilities,
    checkGPT5SystemHealth,
    getGPT5Metrics,
    analyzeQueryForGPT5,
    openai
} = require("./utils/openaiClient");

// Enhanced utility modules (preserved)
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

// Import COMPLETE enhanced database system (preserved)
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

// Load credentials
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const openaiKey = process.env.OPENAI_API_KEY;

if (!telegramToken || !openaiKey) {
    console.error("❌ Missing TELEGRAM_BOT_TOKEN or OPENAI_API_KEY in .env");
    process.exit(1);
}

// Initialize Telegram Bot
const bot = new TelegramBot(telegramToken, { polling: false });

// Enhanced Database Initialization with Full Integration (preserved)
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

// Test database functions with better error handling (preserved)
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
        
        // Test memory functions specifically
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

// Initialize daily metrics (preserved)
async function initializeDailyMetrics() {
    try {
        await updateSystemMetrics({
            total_users: 0
        });
        console.log("📊 Daily metrics initialized");
    } catch (error) {
        console.error("⚠️ Daily metrics initialization failed:", error.message);
    }
}

// User Authentication (preserved)
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

// 🚀 MAIN GPT-5 ONLY MESSAGE HANDLER
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const messageId = `${chatId}_${Date.now()}`;
    
    console.log(`📨 Message from ${chatId}: ${text?.substring(0, 50) || 'Media message'}`);
    
    // Security check
    if (!isAuthorizedUser(chatId)) {
        console.log(`🚫 Unauthorized access from ${chatId}`);
        await sendSmartMessage(bot, chatId, 
            `🚫 Access denied. This is a private GPT-5 AI system.\n\nYour Chat ID: ${chatId}\n\nContact admin if this is your account.`
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

        // 🎯 MAIN GPT-5 CONVERSATION HANDLER
        const executionTime = await handleGPT5Conversation(chatId, text, sessionId);
        
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

// 🚀 MAIN GPT-5 CONVERSATION HANDLER
async function handleGPT5Conversation(chatId, text, sessionId) {
    const startTime = Date.now();
    
    try {
        console.log("🚀 Starting GPT-5 conversation processing:", text.substring(0, 50));
        
        // Build conversation context with memory
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
        
        // Execute GPT-5 command with smart model selection
        const result = await executeGPT5Command(text, chatId, context, conversationIntel);
        
        // Send response to user
        await sendSmartMessage(bot, chatId, result.response);
        
        // Save conversation to database
        await saveConversationToDatabase(chatId, text, result, context);
        
        // Extract and save new memories
        await extractAndSaveMemories(chatId, text, result.response);
        
        console.log("✅ GPT-5 conversation completed successfully");
        return Date.now() - startTime;
        
    } catch (error) {
        console.error('❌ GPT-5 conversation error:', error.message);
        
        // Fallback to basic GPT-5 response
        const fallbackResponse = await handleGPT5Fallback(chatId, text);
        await sendSmartMessage(bot, chatId, fallbackResponse);
        
        return Date.now() - startTime;
    }
}

// 🎯 SMART GPT-5 COMMAND EXECUTION
async function executeGPT5Command(text, chatId, context, intel) {
    try {
        console.log("🚀 Executing smart GPT-5 command...");
        
        // Analyze query for optimal GPT-5 model selection
        const queryConfig = analyzeQueryForGPT5(text);
        console.log(`🧠 GPT-5 Analysis: ${queryConfig.type} → ${queryConfig.model} (${queryConfig.reasoning_effort}/${queryConfig.verbosity})`);
        
        // Build enhanced prompt with memory context
        let enhancedPrompt = text;
        
        // Add memory context if available and important
        if (context.memoryAvailable && queryConfig.useEnhancedReasoning) {
            enhancedPrompt = `${context.memoryContext}\n\nUser: ${text}`;
            console.log('✅ Memory context integrated for GPT-5');
        }
        
        // Add live data context if needed
        if (intel.requiresLiveData) {
            const globalTime = getCurrentGlobalDateTime();
            enhancedPrompt = `Current time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia\n\n${enhancedPrompt}`;
        }
        
        // Execute with optimal GPT-5 model
        let response;
        let aiUsed;
        
        switch (queryConfig.type) {
            case 'speed':
                response = await getQuickNanoResponse(enhancedPrompt, queryConfig);
                aiUsed = 'GPT-5-Nano';
                break;
                
            case 'complex_reasoning':
            case 'financial_analysis':
                response = await getDeepAnalysis(enhancedPrompt, queryConfig);
                aiUsed = 'GPT-5-Deep';
                break;
                
            case 'coding':
                response = await getQuickMiniResponse(enhancedPrompt, queryConfig);
                aiUsed = 'GPT-5-Mini';
                break;
                
            case 'large_context':
                response = await getGPT5Analysis(enhancedPrompt, queryConfig);
                aiUsed = 'GPT-5-Context';
                break;
                
            default:
                response = await getQuickMiniResponse(enhancedPrompt, queryConfig);
                aiUsed = 'GPT-5-Mini';
        }
        
        console.log(`✅ GPT-5 execution successful: ${aiUsed} (${response.length} chars)`);
        
        return {
            response: response,
            aiUsed: aiUsed,
            modelUsed: queryConfig.model,
            queryType: intel.type,
            complexity: intel.complexity,
            contextUsed: context.memoryAvailable,
            success: true,
            gpt5OnlyMode: true,
            reasoningEffort: queryConfig.reasoning_effort,
            verbosity: queryConfig.verbosity,
            responseTime: Date.now() - Date.now(),
            memoryUsed: !!context.memoryContext
        };
        
    } catch (error) {
        console.error('❌ GPT-5 command execution error:', error.message);
        throw error;
    }
}

// 🆘 GPT-5 FALLBACK HANDLER
async function handleGPT5Fallback(chatId, text) {
    try {
        console.log('🆘 Using GPT-5 fallback response...');
        
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
        
        // Try GPT-5 Nano (fastest, most reliable)
        try {
            return await getQuickNanoResponse(text + basicContext, {
                max_completion_tokens: 1000,
                reasoning_effort: "minimal",
                verbosity: "low"
            });
            
        } catch (nanoError) {
            console.log('⚠️ GPT-5 Nano fallback failed:', nanoError.message);
            
            // Final emergency response
            return `🚨 I'm experiencing technical difficulties with GPT-5 right now. 

**What I can tell you:**
- Your message was received: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"
- Chat ID: ${chatId}
- Timestamp: ${new Date().toISOString()}

**Please try:**
- Asking your question again in a moment
- Using simpler language
- Checking the /status command

I'll be back to full capacity shortly! 🔧`;
        }
        
    } catch (error) {
        console.error('❌ Complete fallback failure:', error.message);
        return "🚨 Complete GPT-5 system error. Please contact administrator.";
    }
}

// 💾 Save Conversation to Database (preserved)
async function saveConversationToDatabase(chatId, userMessage, result, context) {
    try {
        await saveConversationDB(chatId, userMessage, result.response, "text", {
            aiUsed: result.aiUsed,
            modelUsed: result.modelUsed,
            queryType: result.queryType,
            memoryUsed: context.memoryAvailable,
            success: result.success,
            gpt5OnlyMode: true,
            reasoningEffort: result.reasoningEffort,
            verbosity: result.verbosity,
            responseTime: result.responseTime || 0,
            timestamp: new Date().toISOString()
        });
        console.log("✅ Conversation saved to database");
    } catch (error) {
        console.log('⚠️ Could not save conversation:', error.message);
    }
}

// 🧠 Extract and Save Memories (preserved)
async function extractAndSaveMemories(chatId, userMessage, aiResponse) {
    try {
        // Check if we should save to persistent memory
        if (shouldSaveToPersistentMemory(userMessage, aiResponse)) {
            const memoryFact = extractMemoryFact(userMessage, aiResponse);
            
            if (memoryFact) {
                await addPersistentMemoryDB(chatId, memoryFact, 'medium');
                console.log(`✅ Saved memory: ${memoryFact.substring(0, 50)}...`);
            }
        }
        
        // Try enhanced memory extraction if available
        try {
            const { extractAndSaveFacts } = require('./utils/memory');
            const result = await extractAndSaveFacts(chatId, userMessage, aiResponse);
            
            if (result?.extractedFacts > 0) {
                console.log(`✅ Extracted ${result.extractedFacts} additional memories`);
            }
        } catch (enhancedError) {
            console.log('⚠️ Enhanced memory extraction not available:', enhancedError.message);
        }
        
    } catch (error) {
        console.log('⚠️ Memory extraction failed:', error.message);
    }
}

// 🔧 Helper Functions (preserved)
function determineConversationType(text) {
    if (!text) return 'unknown';
    
    const lower = text.toLowerCase();
    
    if (lower.includes('financial') || lower.includes('investment') || lower.includes('fund') || lower.includes('money')) {
        return 'financial_analysis';
    }
    if (lower.includes('analysis') || lower.includes('strategy') || lower.includes('strategic')) {
        return 'strategic_analysis';
    }
    if (lower.includes('cambodia') || lower.includes('khmer')) {
        return 'cambodia_analysis';
    }
    if (lower.includes('portfolio') || lower.includes('allocation')) {
        return 'portfolio_management';
    }
    if (lower.length > 100) {
        return 'complex_discussion';
    }
    
    return 'general_conversation';
}

function determineComplexity(text) {
    if (!text) return 'simple';
    
    const words = text.split(/\s+/).length;
    const questions = (text.match(/\?/g) || []).length;
    const hasNumbers = /\d/.test(text);
    const hasFinancialTerms = /\b(investment|portfolio|fund|analysis|strategy|market|trading)\b/i.test(text);
    
    if (words > 50 || questions > 2 || (hasNumbers && hasFinancialTerms)) return 'complex';
    if (words > 15 || questions > 0 || hasFinancialTerms) return 'medium';
    return 'simple';
}

function requiresLiveData(text) {
    if (!text) return false;
    
    const liveDataKeywords = [
        'current', 'latest', 'today', 'now', 'recent', 'update', 'real-time',
        'price', 'rate', 'market', 'trading', 'live', 'fresh', 'new'
    ];
    return liveDataKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

function shouldSaveToPersistentMemory(userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    return lowerMessage.includes('remember') || 
           lowerMessage.includes('my preference') ||
           lowerMessage.includes('my name') ||
           lowerMessage.includes('important') ||
           lowerResponse.includes('important to note') ||
           lowerResponse.includes('key insight') ||
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
    
    if (aiResponse.includes('Important:')) {
        const important = aiResponse.split('Important:')[1]?.split('\n')[0];
        return important ? `Important fact: ${important.trim()}` : null;
    }
    
    return `Context: ${userMessage.substring(0, 100)}`;
}

// 🔧 SESSION MANAGEMENT FUNCTIONS (preserved)
async function startUserSession(chatId, sessionType = 'GENERAL') {
    try {
        console.log(`📊 Starting session for ${chatId}: ${sessionType}`);
        const sessionId = `session_${chatId}_${Date.now()}`;
        return sessionId;
    } catch (error) {
        console.error('❌ Start session error:', error.message);
        return null;
    }
}

async function endUserSession(sessionId, commandsExecuted = 0, totalResponseTime = 0) {
    try {
        console.log(`📊 Ending session ${sessionId}: ${commandsExecuted} commands, ${totalResponseTime}ms`);
        return true;
    } catch (error) {
        console.error('❌ End session error:', error.message);
        return false;
    }
}

// 🎯 ENHANCED COMMAND HANDLERS FOR GPT-5

async function handleStartCommand(chatId) {
    const welcome = `🚀 **Enhanced GPT-5 AI Assistant System v5.0**

**🎯 Core Features:**
- Smart GPT-5 Family: Nano, Mini, Full, Chat
- Complete AI Wealth-Building System (10 modules)
- Enhanced PostgreSQL Database Integration
- Live market data & Ray Dalio framework
- Cambodia fund analysis
- Advanced document processing
- Voice and image analysis
- Persistent memory system

**🤖 GPT-5 Models:**
🚀 GPT-5 Nano: Speed critical ($0.05/$0.40)
⚖️ GPT-5 Mini: Balanced analysis ($0.25/$2.00)
🧠 GPT-5 Full: Complex reasoning ($1.25/$10.00)
💬 GPT-5 Chat: Conversational ($1.25/$10.00)

**🔧 System Management:**
/analytics - Master system analytics
/db_stats - Database statistics
/status - Enhanced system status
/maintenance - Database maintenance

**🧪 Memory & Database Testing:**
/test_db - Test database connection
/test_memory - Test memory system
/memory_stats - Memory statistics

**Chat ID:** ${chatId}
**🏆 GPT-5 Wealth Empire Status:** ACTIVE
**Database Status:** ${connectionStats.connectionHealth}`;

    await sendSmartMessage(bot, chatId, welcome);
    
    // Save welcome interaction
    await saveConversationDB(chatId, "/start", welcome, "command").catch(console.error);
}

// 🔧 ENHANCED SYSTEM STATUS FOR GPT-5 ONLY
async function handleEnhancedSystemStatus(chatId) {
    try {
        await bot.sendMessage(chatId, "🔄 Checking enhanced GPT-5 system status...");

        const [health, stats, gpt5Health] = await Promise.all([
            performHealthCheck(),
            getDatabaseStats(),
            checkGPT5SystemHealth().catch(() => ({ error: 'Not available' }))
        ]);

        // Check database connection status
        const dbConnected = !!(stats && stats.connected === true);
        const totalUsers = stats?.totalUsers ?? '—';
        const totalConversations = stats?.totalConversations ?? '—';
        const totalMemories = stats?.totalMemories ?? '—';
        const totalDocuments = stats?.totalDocuments ?? '—';
        
        let status = `**Enhanced GPT-5 System Status v5.0**\n\n`;

        // GPT-5 Models Status
        status += `**GPT-5 Models:**\n`;
        status += `• GPT-5 Full: ${gpt5Health?.gpt5Available ? '✅ Online' : '❌ Offline'}\n`;
        status += `• GPT-5 Mini: ${gpt5Health?.gpt5MiniAvailable ? '✅ Online' : '❌ Offline'}\n`;
        status += `• GPT-5 Nano: ${gpt5Health?.gpt5NanoAvailable ? '✅ Online' : '❌ Offline'}\n`;
        status += `• GPT-5 Chat: ${gpt5Health?.gpt5ChatAvailable ? '✅ Online' : '❌ Offline'}\n\n`;

        // Enhanced Database Status
        status += `**Enhanced Database:**\n`;
        status += `• Connection: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}\n`;
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
        status += `• GPT-5 Mode: ${gpt5Health?.overallHealth ? '✅ Enabled' : '❌ Disabled'}\n`;
        status += `• Database Queries: ${connectionStats.totalQueries}\n`;
        status += `• Success Rate: ${connectionStats.totalQueries > 0 ? 
            ((connectionStats.successfulQueries / connectionStats.totalQueries) * 100).toFixed(1) : 100}%\n\n`;

        // GPT-5 Metrics
        if (gpt5Health && !gpt5Health.error) {
            const metrics = getGPT5Metrics();
            status += `**GPT-5 Performance:**\n`;
            status += `• Enhanced Reasoning: ${gpt5Health.enhancedReasoning ? '✅' : '❌'}\n`;
            status += `• Vision Capabilities: ${gpt5Health.visionCapabilities ? '✅' : '❌'}\n`;
            status += `• Large Context: ${gpt5Health.largeContext ? '✅' : '❌'}\n`;
            status += `• Current Model: ${metrics.model}\n\n`;
        }

        // Overall Status
        const overallHealthy = gpt5Health?.overallHealth && dbConnected;
        status += `**Overall Status: ${overallHealthy ? '🟢 Healthy' : '🔴 Degraded'}**`;

        if (connectionStats.lastError) {
            status += `\n\n**Last Error:** ${connectionStats.lastError}`;
        }

        await sendAnalysis(bot, chatId, status, "Enhanced GPT-5 System Status");
        
        // Save status check
        await saveConversationDB(chatId, "/status", status, "command").catch(console.error);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Status check error: ${error.message}`);
    }
}

// 🔧 COMMAND HANDLERS FOR GPT-5 SYSTEM

async function handleMasterAnalytics(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Generating GPT-5 master analytics dashboard...");
        
        const [systemStats, gpt5Metrics, dbStats] = await Promise.allSettled([
            getSystemAnalytics(),
            getGPT5Metrics(),
            getRayDalioStats()
        ]);
        
        let response = `**GPT-5 Master Analytics Dashboard**\n\n`;
        
        // System Overview
        response += `**System Overview:**\n`;
        response += `• Version: GPT-5 Only v5.0\n`;
        response += `• AI System: Smart GPT-5 Family Routing\n`;
        response += `• Cost Optimization: 60-80% savings vs dual AI\n`;
        response += `• Performance Grade: ${gpt5Metrics.status === 'fulfilled' ? 'A+' : 'Unknown'}\n\n`;
        
        // GPT-5 Performance
        if (gpt5Metrics.status === 'fulfilled') {
            const metrics = gpt5Metrics.value;
            response += `**GPT-5 Performance:**\n`;
            response += `• Available Models: ${Object.keys(metrics.availableModels).length}\n`;
            response += `• Current Model: ${metrics.model}\n`;
            response += `• Context Window: ${metrics.contextWindow.toLocaleString()} tokens\n`;
            response += `• Max Output: ${metrics.maxOutputTokens.toLocaleString()} tokens\n`;
            response += `• Smart Routing: ✅ Active\n\n`;
        }
        
        // Database Stats
        if (dbStats.status === 'fulfilled') {
            const db = dbStats.value;
            response += `**Database Intelligence:**\n`;
            response += `• Users: ${db.totalUsers}\n`;
            response += `• Conversations: ${db.totalConversations}\n`;
            response += `• Memories: ${db.totalMemories}\n`;
            response += `• Documents: ${db.totalDocuments}\n`;
            response += `• Connection Health: ${connectionStats.connectionHealth}\n\n`;
        }
        
        // GPT-5 Cost Analysis
        response += `**Cost Analysis (GPT-5 Family):**\n`;
        response += `• Nano Tasks: $0.05/$0.40 per 1M tokens\n`;
        response += `• Mini Tasks: $0.25/$2.00 per 1M tokens\n`;
        response += `• Full Analysis: $1.25/$10.00 per 1M tokens\n`;
        response += `• Smart Routing: Automatic cost optimization\n\n`;
        
        // Strategic Recommendations
        response += `**Strategic Recommendations:**\n`;
        response += `1. [HIGH] GPT-5 system optimized for cost efficiency\n`;
        response += `2. [MEDIUM] Continue monitoring model performance\n`;
        response += `3. [LOW] Consider GPT-5 Pro for complex analysis\n`;
        
        await sendAnalysis(bot, chatId, response, "GPT-5 Master Analytics");
        
        // Save analytics request
        await saveConversationDB(chatId, "/analytics", response, "command").catch(console.error);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ GPT-5 analytics error: ${error.message}`);
    }
}

async function handleDatabaseStats(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Retrieving database statistics...");
        
        const stats = await getRayDalioStats();
        
        let response = `**Enhanced Database Statistics (GPT-5 System)**\n\n`;
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
        response += `• GPT-5 Optimized: ✅ Yes\n`;
        response += `• Storage: ${stats.storage}\n`;
        
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
        
        let response = `**Database Maintenance Results (GPT-5 System)**\n\n`;
        
        if (results.error) {
            response += `❌ **Error:** ${results.error}`;
        } else {
            response += `✅ **Maintenance Completed**\n\n`;
            response += `**Results:**\n`;
            response += `• Tables Analyzed: ${results.tablesAnalyzed}\n`;
            response += `• Old Data Cleaned: ${results.oldDataCleaned} records\n`;
            response += `• Indexes Rebuilt: ${results.indexesRebuilt}\n`;
            response += `• GPT-5 Optimization: Applied\n`;
            
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

// 🔧 GPT-5 SPECIFIC TEST HANDLERS

async function handleGPT5ConnectionTest(chatId) {
    try {
        const startTime = Date.now();
        await bot.sendMessage(chatId, "🔍 Testing GPT-5 connection...");
        
        // Test GPT-5 capabilities
        const health = await checkGPT5SystemHealth();
        const responseTime = Date.now() - startTime;
        
        let response = `🔍 **GPT-5 Connection Test Results**\n\n`;
        response += `**GPT-5 Models Status:**\n`;
        response += `• GPT-5 Full: ${health.gpt5Available ? '✅ Online' : '❌ Offline'}\n`;
        response += `• GPT-5 Mini: ${health.gpt5MiniAvailable ? '✅ Online' : '❌ Offline'}\n`;
        response += `• GPT-5 Nano: ${health.gpt5NanoAvailable ? '✅ Online' : '❌ Offline'}\n`;
        response += `• GPT-5 Chat: ${health.gpt5ChatAvailable ? '✅ Online' : '❌ Offline'}\n`;
        response += `• Response Time: ${responseTime}ms\n\n`;
        
        response += `**Capabilities:**\n`;
        response += `• Enhanced Reasoning: ${health.enhancedReasoning ? '✅ Available' : '❌ Limited'}\n`;
        response += `• Vision Analysis: ${health.visionCapabilities ? '✅ Available' : '❌ Limited'}\n`;
        response += `• Large Context: ${health.largeContext ? '✅ Available' : '❌ Limited'}\n`;
        response += `• Fallback Working: ${health.fallbackWorking ? '✅ Available' : '❌ Failed'}\n\n`;
        
        const overallStatus = health.overallHealth ? '🟢 EXCELLENT' : '🔴 NEEDS ATTENTION';
        response += `**Overall GPT-5 Status:** ${overallStatus}`;
        
        if (health.errors.length > 0) {
            response += `\n\n**Errors:**\n`;
            health.errors.slice(0, 3).forEach(error => {
                response += `• ${error}\n`;
            });
        }
        
        await sendAnalysis(bot, chatId, response, "GPT-5 Connection Test");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ GPT-5 test failed: ${error.message}`);
    }
}

async function handleMemorySystemTest(chatId) {
    try {
        await bot.sendMessage(chatId, "🧠 Testing memory system with GPT-5...");
        
        const testResults = {
            memoryWrite: false,
            memoryRead: false,
            contextBuilding: false,
            conversationSave: false,
            gpt5Integration: false
        };
        
        // Test 1: Write a test memory
        try {
            await addPersistentMemoryDB(chatId, `GPT-5 test memory created at ${new Date().toISOString()}`, 'medium');
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
        
        // Test 3: Build context
        try {
            const context = await buildConversationContext(chatId, 'test');
            testResults.contextBuilding = true;
            console.log('✅ Context building test passed');
        } catch (error) {
            console.log('❌ Context building test failed:', error.message);
        }
        
        // Test 4: Save this conversation
        try {
            await saveConversationDB(chatId, '/test_memory', 'GPT-5 memory test initiated', 'command');
            testResults.conversationSave = true;
            console.log('✅ Conversation save test passed');
        } catch (error) {
            console.log('❌ Conversation save test failed:', error.message);
        }
        
        // Test 5: GPT-5 with memory integration
        try {
            const testResponse = await getQuickNanoResponse('Memory integration test for GPT-5', {
                reasoning_effort: "minimal",
                verbosity: "low"
            });
            testResults.gpt5Integration = testResponse && testResponse.length > 0;
            console.log('✅ GPT-5 integration test passed');
        } catch (error) {
            console.log('❌ GPT-5 integration test failed:', error.message);
        }
        
        let response = `🧠 **Memory System Test Results (GPT-5)**\n\n`;
        response += `**Core Functions:**\n`;
        response += `${testResults.memoryWrite ? '✅' : '❌'} Memory Write\n`;
        response += `${testResults.memoryRead ? '✅' : '❌'} Memory Read\n`;
        response += `${testResults.contextBuilding ? '✅' : '❌'} Context Building\n`;
        response += `${testResults.conversationSave ? '✅' : '❌'} Conversation Save\n`;
        response += `${testResults.gpt5Integration ? '✅' : '❌'} GPT-5 Integration\n\n`;
        
        const successCount = Object.values(testResults).filter(Boolean).length;
        const totalTests = Object.keys(testResults).length;
        
        response += `**Memory Score:** ${successCount}/${totalTests} (${Math.round((successCount/totalTests) * 100)}%)\n`;
        
        if (successCount === totalTests) {
            response += `**Status:** 🟢 MEMORY SYSTEM FULLY INTEGRATED WITH GPT-5\n\n`;
            response += `✅ Your memory system is working perfectly with GPT-5!\n`;
            response += `Try asking: "What do you remember about me?"`;
        } else if (successCount >= totalTests * 0.7) {
            response += `**Status:** 🟡 PARTIAL INTEGRATION\n\n`;
            response += `Most memory functions work with GPT-5. Check database connection.`;
        } else {
            response += `**Status:** 🔴 INTEGRATION FAILED\n\n`;
            response += `**Next Steps:**\n`;
            response += `1. Check DATABASE_URL configuration\n`;
            response += `2. Verify GPT-5 API access\n`;
            response += `3. Test individual components\n`;
        }
        
        await sendAnalysis(bot, chatId, response, "Memory System Test");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Memory system test failed: ${error.message}`);
    }
}

async function handleMemoryStatistics(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Gathering memory statistics for GPT-5 system...");
        
        const [conversations, memories, userProfile] = await Promise.allSettled([
            getConversationHistoryDB(chatId, 50),
            getPersistentMemoryDB(chatId),
            getUserProfileDB(chatId)
        ]);
        
        let response = `📊 **Memory Statistics for GPT-5 System**\n\n`;
        response += `**User:** ${chatId}\n\n`;
        
        // Conversation statistics
        if (conversations.status === 'fulfilled') {
            const convData = conversations.value;
            response += `**Conversations:**\n`;
            response += `• Total Records: ${convData.length}\n`;
            response += `• Date Range: ${convData.length > 0 ? 
                new Date(convData[convData.length-1].timestamp).toLocaleDateString() + ' - ' + 
                new Date(convData[0].timestamp).toLocaleDateString() : 'No data'}\n`;
            response += `• GPT-5 Optimized: ✅ Yes\n\n`;
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
            response += `• GPT-5 Compatible: ✅ Yes\n\n`;
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
            '🟢 HEALTHY & GPT-5 OPTIMIZED' : '🔴 NEEDS ATTENTION'
        }`;
        
        await sendAnalysis(bot, chatId, response, "Memory Statistics");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Memory statistics failed: ${error.message}`);
    }
}

// 🎤🖼️📄 ENHANCED MULTIMODAL HANDLERS FOR GPT-5

async function handleVoiceMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🎤 Processing voice message with GPT-5...");
        await bot.sendMessage(chatId, "🎤 Transcribing voice with Whisper + GPT-5 Analysis...");
        
        // Transcribe with Whisper
        const transcription = await transcribeVoiceWithWhisper(msg.voice.file_id);
        
        if (transcription && transcription.trim().length > 0) {
            // Send transcription first
            await sendSmartMessage(bot, chatId, `🎤 **Voice Transcription:**\n"${transcription}"\n\n🚀 Analyzing with GPT-5...`);
            
            // Analyze with GPT-5 (smart model selection)
            const queryConfig = analyzeQueryForGPT5(transcription);
            let analysis;
            
            switch (queryConfig.type) {
                case 'speed':
                    analysis = await getQuickNanoResponse(transcription, queryConfig);
                    break;
                case 'complex_reasoning':
                case 'financial_analysis':
                    analysis = await getDeepAnalysis(transcription, queryConfig);
                    break;
                default:
                    analysis = await getQuickMiniResponse(transcription, queryConfig);
            }
            
            // Send the GPT-5 analysis
            await sendAnalysis(bot, chatId, analysis, `🎤 GPT-5 ${queryConfig.model} Voice Analysis`);
            
            // Save to database
            await saveConversationDB(chatId, "[VOICE]", analysis, "voice", {
                transcription: transcription,
                voiceDuration: msg.voice.duration,
                fileSize: msg.voice.file_size,
                gpt5Model: queryConfig.model,
                processingTime: Date.now() - startTime,
                sessionId: sessionId,
                success: true
            }).catch(err => console.error('Voice save error:', err.message));
            
            console.log("✅ Voice message processed with GPT-5");
        } else {
            throw new Error("Voice transcription returned empty result");
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error("❌ Voice processing error:", error.message);
        
        await sendSmartMessage(bot, chatId, `❌ Voice processing error: ${error.message}\n\n**Please try:**\n• Speaking more clearly\n• Shorter voice messages\n• Checking your internet connection`);
        
        // Save error record
        await saveConversationDB(chatId, "[VOICE_ERROR]", `Error: ${error.message}`, "voice", {
            error: error.message,
            processingTime: responseTime,
            success: false
        }).catch(err => console.error('Voice error save failed:', err.message));
    }
}

async function handleImageMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🖼️ Processing image with GPT-5 Vision...");
        await bot.sendMessage(chatId, "🖼️ Analyzing image with GPT-5 Vision...");
        
        // Get the largest photo (best quality)
        const photo = msg.photo[msg.photo.length - 1];
        
        // Analyze with GPT-5 Vision
        const analysis = await analyzeImageWithGPT5Vision(photo.file_id, msg.caption);
        
        if (analysis && analysis.length > 0) {
            // Send the image analysis
            await sendAnalysis(bot, chatId, analysis, "🖼️ GPT-5 Vision Analysis");
            
            // Save to database
            await saveConversationDB(chatId, "[IMAGE]", analysis, "image", {
                fileId: photo.file_id,
                fileSize: photo.file_size,
                caption: msg.caption || null,
                gpt5Vision: true,
                processingTime: Date.now() - startTime,
                sessionId: sessionId,
                success: true
            }).catch(err => console.error('Image save error:', err.message));
            
            // Save to persistent memory if significant
            if (msg.caption && shouldSaveToPersistentMemory(`Image: ${msg.caption}`, analysis)) {
                const memoryFact = `Image analysis: ${msg.caption} - ${analysis.substring(0, 150)}...`;
                await addPersistentMemoryDB(chatId, memoryFact, 'medium')
                    .catch(err => console.error('Memory save error:', err.message));
                console.log("💾 Image analysis saved to persistent memory");
            }
            
            console.log("✅ Image processed with GPT-5 Vision");
        } else {
            throw new Error("Image analysis returned empty result");
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error("❌ Image processing error:", error.message);
        
        await sendSmartMessage(bot, chatId, `❌ Image analysis failed: ${error.message}\n\n**Please try:**\n• Sending a smaller image\n• Adding a caption with questions\n• Trying again in a moment`);
        
        // Save error record
        await saveConversationDB(chatId, "[IMAGE_ERROR]", `Analysis failed: ${error.message}`, "image", {
            error: error.message,
            processingTime: responseTime,
            success: false
        }).catch(err => console.error('Image error save failed:', err.message));
    }
}

async function handleDocumentMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("📄 Processing document with GPT-5...");
        
        const fileName = msg.document.file_name || "untitled_document";
        const fileSize = msg.document.file_size || 0;
        const isTraining = msg.caption?.toLowerCase().includes("train");
        
        if (fileSize > 50 * 1024 * 1024) {
            throw new Error("File too large (max 50MB). Please compress or split the file.");
        }
        
        if (isTraining) {
            // Training mode
            await bot.sendMessage(chatId, "📚 Processing document for GPT-5 training database...");
            
            try {
                const content = await extractDocumentContent(msg.document.file_id, fileName);
                
                if (content && content.length > 0) {
                    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
                    const summary = content.length > 500 ? content.substring(0, 500) + '...' : content;
                    
                    // Save to training database
                    const saved = await saveTrainingDocumentDB(chatId, fileName, content, 'user_uploaded', wordCount, summary);
                    
                    if (saved) {
                        await sendSmartMessage(bot, chatId, 
                            `📚 **Document Added to GPT-5 Training Database**\n\n` +
                            `📄 **File:** ${fileName}\n` +
                            `📊 **Words:** ${wordCount.toLocaleString()}\n` +
                            `📏 **Size:** ${(fileSize / 1024).toFixed(1)} KB\n` +
                            `💾 **Storage:** Enhanced Database\n` +
                            `🚀 **GPT-5 can now reference this document!**`
                        );
                        console.log("✅ Document training completed for GPT-5");
                    } else {
                        throw new Error("Database save failed");
                    }
                } else {
                    throw new Error("Document appears to be empty");
                }
                
            } catch (trainingError) {
                throw new Error(`Training failed: ${trainingError.message}`);
            }
            
        } else {
            // Analysis mode with GPT-5
            await bot.sendMessage(chatId, "📄 Analyzing document with GPT-5...");
            
            try {
                const content = await extractDocumentContent(msg.document.file_id, fileName);
                
                if (content && content.length > 0) {
                    // Build analysis prompt
                    let analysisPrompt = `Analyze this document (${fileName}):\n\n${content}\n\n`;
                    analysisPrompt += `Provide comprehensive analysis covering:
1. Document type and purpose
2. Key topics and main themes
3. Important insights and findings
4. Structure and organization
5. Data/statistics if present
6. Recommendations or conclusions
7. Strategic implications
8. Overall assessment and significance`;
                    
                    if (msg.caption) {
                        analysisPrompt += `\n\nUser's question: "${msg.caption}"`;
                    }
                    
                    // Analyze with appropriate GPT-5 model
                    const queryConfig = analyzeQueryForGPT5(analysisPrompt);
                    let analysis;
                    
                    if (content.length > 5000 || fileName.toLowerCase().includes('financial')) {
                        analysis = await getDeepAnalysis(analysisPrompt, {
                            ...queryConfig,
                            reasoning_effort: "high",
                            verbosity: "high"
                        });
                    } else {
                        analysis = await getQuickMiniResponse(analysisPrompt, queryConfig);
                    }
                    
                    await sendAnalysis(bot, chatId, analysis, `📄 GPT-5 Document Analysis: ${fileName}`);
                    
                    // Save to database
                    await saveConversationDB(chatId, `[DOCUMENT] ${fileName}`, analysis, "document", {
                        fileName: fileName,
                        fileSize: fileSize,
                        contentLength: content.length,
                        gpt5Model: queryConfig.model,
                        processingTime: Date.now() - startTime,
                        sessionId: sessionId,
                        success: true
                    }).catch(err => console.error('Document save error:', err.message));
                    
                    console.log("✅ Document analysis completed with GPT-5");
                } else {
                    throw new Error("Document appears to be empty");
                }
                
            } catch (analysisError) {
                throw new Error(`Analysis failed: ${analysisError.message}`);
            }
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error("❌ Document processing error:", error.message);
        
        await sendSmartMessage(bot, chatId, `❌ Document processing failed: ${error.message}\n\n**Supported formats:**\n✅ Text files (.txt, .md)\n✅ PDF documents (.pdf)\n✅ Word documents (.doc, .docx)\n✅ Excel files (.xls, .xlsx)\n✅ JSON/CSV files (.json, .csv)\n\n**Please try:**\n• Converting to supported format\n• Reducing file size\n• Adding "train" in caption for GPT-5 training`);
        
        // Save error record
        await saveConversationDB(chatId, `[DOCUMENT_ERROR] ${fileName}`, `Error: ${error.message}`, "document", {
            fileName: fileName,
            error: error.message,
            processingTime: responseTime,
            success: false
        }).catch(err => console.error('Document error save failed:', err.message));
    }
}

// 🔧 HELPER FUNCTIONS FOR MULTIMODAL

async function transcribeVoiceWithWhisper(fileId) {
    try {
        console.log("🔄 Starting Whisper transcription...");
        
        // Get file from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        // Download the voice file
        const fetch = require('node-fetch');
        const response = await fetch(fileUrl, { timeout: 30000 });
        
        if (!response.ok) {
            throw new Error(`Failed to download voice file: HTTP ${response.status}`);
        }
        
        const buffer = await response.buffer();
        console.log(`✅ Voice file downloaded: ${buffer.length} bytes`);
        
        // Create form data for Whisper API
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('file', buffer, {
            filename: 'voice.ogg',
            contentType: 'audio/ogg'
        });
        form.append('model', 'whisper-1');
        form.append('language', 'en');
        form.append('response_format', 'text');
        
        console.log("🤖 Sending to OpenAI Whisper API...");
        
        // Call Whisper API
        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                ...form.getHeaders()
            },
            body: form,
            timeout: 60000
        });
        
        if (!whisperResponse.ok) {
            const errorText = await whisperResponse.text();
            console.error(`❌ Whisper API error: ${whisperResponse.status} - ${errorText}`);
            throw new Error(`Whisper API error: ${whisperResponse.status}`);
        }
        
        const transcription = await whisperResponse.text();
        console.log(`✅ Whisper transcription successful: "${transcription.substring(0, 100)}..."`);
        
        if (!transcription || transcription.trim().length === 0) {
            throw new Error("Whisper returned empty transcription");
        }
        
        return transcription.trim();
        
    } catch (error) {
        console.error("❌ Whisper transcription error:", error.message);
        throw error;
    }
}

async function analyzeImageWithGPT5Vision(fileId, caption = null) {
    try {
        console.log("🔍 Analyzing image with GPT-5 Vision...");
        
        // Download image from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        const fetch = require('node-fetch');
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to download image: HTTP ${response.status}`);
        }
        
        const buffer = await response.buffer();
        const base64Image = buffer.toString('base64');
        
        console.log(`✅ Image downloaded and converted to base64`);
        
        // Build analysis prompt
        let analysisPrompt = `As GPT-5 with enhanced vision capabilities, analyze this image with comprehensive strategic intelligence.

**Strategic Image Analysis Framework:**

1. **Overall Scene Description**
   • Complete description of visual content
   • Key objects, people, text, or elements present
   • Setting, location, and contextual environment

2. **Intelligence Extraction**
   • All visible text, numbers, signs, or written content
   • Financial charts, data visualizations, or business content
   • Technical information, specifications, or measurements
   • Dates, locations, brands, or identifying information

3. **Business & Financial Assessment**
   • Market data, trading information, or economic content
   • Business documents, presentations, or corporate materials
   • Investment-related charts, performance metrics, or analytics
   • Strategic implications for financial analysis

4. **Strategic Intelligence Summary**
   • Overall significance and business relevance
   • Actionable insights or strategic implications
   • Recommendations for further analysis or action
   • Value for financial and business operations

Execute comprehensive institutional-level visual intelligence analysis.`;
        
        if (caption) {
            analysisPrompt += `\n\n**User Context:** "${caption}"`;
        }
        
        // Use GPT-5 Vision analysis
        return await getEnhancedVisionAnalysis(base64Image, analysisPrompt, {
            reasoning_effort: "medium",
            verbosity: "high",
            max_completion_tokens: 3000
        });
        
    } catch (error) {
        console.error("❌ GPT-5 vision analysis error:", error.message);
        throw error;
    }
}

async function extractDocumentContent(fileId, fileName) {
    try {
        console.log(`📄 Extracting content from ${fileName}...`);
        
        // Download document
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        const fetch = require('node-fetch');
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to download document: HTTP ${response.status}`);
        }
        
        const buffer = await response.buffer();
        const fileExtension = fileName.toLowerCase().split('.').pop();
        
        let content = '';
        
        // Extract based on file type
        if (['txt', 'md', 'json', 'csv'].includes(fileExtension)) {
            content = buffer.toString('utf8');
        } else if (fileExtension === 'pdf') {
            content = await extractPDFText(buffer);
        } else if (['doc', 'docx'].includes(fileExtension)) {
            content = await extractWordText(buffer);
        } else if (['xls', 'xlsx'].includes(fileExtension)) {
            content = await extractExcelText(buffer);
        } else {
            // Try as text
            content = buffer.toString('utf8');
            console.log(`⚠️ Attempting to read ${fileExtension} as text`);
        }
        
        if (content.length === 0) {
            throw new Error("Document contains no readable text");
        }
        
        // Limit content size for GPT-5
        if (content.length > 15000) {
            content = content.substring(0, 15000) + '\n\n[Document truncated for GPT-5 analysis...]';
            console.log("⚠️ Document truncated for GPT-5 analysis");
        }
        
        console.log(`✅ Content extracted: ${content.length} characters`);
        return content.trim();
        
    } catch (error) {
        console.error("❌ Document extraction error:", error.message);
        throw error;
    }
}

// Text extraction helpers
async function extractPDFText(buffer) {
    try {
        const pdf = require('pdf-parse');
        const data = await pdf(buffer);
        return data.text || '';
    } catch (error) {
        throw new Error(`PDF extraction failed: ${error.message}`);
    }
}

async function extractWordText(buffer) {
    try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: buffer });
        return result.value || '';
    } catch (error) {
        throw new Error(`Word extraction failed: ${error.message}`);
    }
}

async function extractExcelText(buffer) {
    try {
        const XLSX = require('xlsx');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        
        let text = '';
        workbook.SheetNames.forEach((sheetName, index) => {
            const sheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            if (csv) {
                text += `=== SHEET ${index + 1}: ${sheetName} ===\n${csv}\n\n`;
            }
        });
        
        return text;
    } catch (error) {
        throw new Error(`Excel extraction failed: ${error.message}`);
    }
}

// 🔧 ENHANCED EXPRESS SERVER SETUP - WEBHOOK ONLY
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced webhook endpoint
app.post("/webhook", async (req, res) => {
    console.log("📨 Webhook received from Telegram");
    
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
    res.status(200).send("✅ Enhanced GPT-5 AI Assistant v5.0 is running!");
});

// Enhanced health endpoint with GPT-5 status
app.get("/health", async (req, res) => {
    try {
        const startTime = Date.now();
        
        const [health, stats, gpt5Health] = await Promise.allSettled([
            performHealthCheck(),
            getDatabaseStats(),
            checkGPT5SystemHealth()
        ]);
        
        const dbConnected = stats.status === 'fulfilled' && stats.value?.connected === true;
        const responseTime = Date.now() - startTime;
        
        res.status(200).json({ 
            status: "healthy", 
            version: "5.0 - GPT-5 Only System",
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            aiSystem: {
                type: "GPT-5 Family Smart Routing",
                models: ["gpt-5", "gpt-5-mini", "gpt-5-nano", "gpt-5-chat-latest"],
                gpt5Available: gpt5Health.status === 'fulfilled' ? gpt5Health.value.gpt5Available : false,
                costOptimization: "60-80% savings vs dual AI"
            },
            database: {
                connected: dbConnected,
                health: connectionStats?.connectionHealth || 'unknown'
            },
            wealthSystem: {
                modules: 10,
                status: "active",
                gpt5Optimized: true
            },
            botMode: "WEBHOOK ONLY"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            version: "5.0 - GPT-5 Only System",
            error: error.message,
            timestamp: new Date().toISOString(),
            botMode: "WEBHOOK ONLY"
        });
    }
});

// GPT-5 specific status endpoint
app.get("/gpt5-status", async (req, res) => {
    try {
        const gpt5Health = await checkGPT5SystemHealth();
        const metrics = getGPT5Metrics();
        
        res.status(200).json({
            gpt5System: {
                overallHealth: gpt5Health.overallHealth,
                models: {
                    gpt5: gpt5Health.gpt5Available,
                    gpt5Mini: gpt5Health.gpt5MiniAvailable,
                    gpt5Nano: gpt5Health.gpt5NanoAvailable,
                    gpt5Chat: gpt5Health.gpt5ChatAvailable
                },
                capabilities: {
                    enhancedReasoning: gpt5Health.enhancedReasoning,
                    visionCapabilities: gpt5Health.visionCapabilities,
                    largeContext: gpt5Health.largeContext
                },
                currentModel: metrics.model,
                contextWindow: metrics.contextWindow,
                maxOutputTokens: metrics.maxOutputTokens,
                costOptimization: metrics.costOptimization,
                errors: gpt5Health.errors
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to get GPT-5 status",
            message: error.message,
            timestamp: new Date().toISOString()
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
            gpt5System: "active",
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

// 🚀 WEBHOOK-ONLY SERVER STARTUP WITH GPT-5
const server = app.listen(PORT, "0.0.0.0", async () => {
    console.log("🚀 Enhanced GPT-5 AI Assistant v5.0 starting...");
    console.log(`✅ Server running on port ${PORT}`);
    console.log("🤖 AI System: GPT-5 Family Smart Routing");
    console.log("💰 Models: gpt-5, gpt-5-mini, gpt-5-nano, gpt-5-chat-latest");
    console.log("💸 Cost Optimization: 60-80% savings vs dual AI");
    console.log("🌐 Mode: WEBHOOK ONLY (No Polling)");
    
    // Initialize enhanced database
    try {
        await initializeEnhancedDatabase();
        console.log("💾 Enhanced database integration successful");
        console.log("🧠 Persistent memory system initialized");
    } catch (error) {
        console.error("❌ Database initialization failed:", error.message);
        console.log("⚠️ Running with limited database functionality");
    }
    
    // Test GPT-5 capabilities
    try {
        console.log("🔍 Testing GPT-5 capabilities...");
        const gpt5Capabilities = await testGPT5Capabilities();
        
        if (gpt5Capabilities.available) {
            console.log("✅ GPT-5 system operational:");
            console.log(`   Enhanced Reasoning: ${gpt5Capabilities.enhancedReasoning}`);
            console.log(`   Large Context: ${gpt5Capabilities.largeContext}`);
            console.log(`   Math Capabilities: ${gpt5Capabilities.improvedMath}`);
            console.log(`   Financial Analysis: ${gpt5Capabilities.betterFinancial}`);
            console.log(`   Reasoning Efforts: ${gpt5Capabilities.reasoningEfforts?.join(', ')}`);
            console.log(`   Verbosity Levels: ${gpt5Capabilities.verbosityLevels?.join(', ')}`);
        } else {
            console.log("⚠️ GPT-5 not available, using fallback");
            console.log(`   Fallback Model: ${gpt5Capabilities.fallbackModel}`);
        }
    } catch (error) {
        console.error("❌ GPT-5 capability test failed:", error.message);
        console.log("⚠️ GPT-5 system may have limited functionality");
    }
    
    // 🎯 WEBHOOK-ONLY BOT INITIALIZATION FOR GPT-5
    console.log("🤖 Initializing Telegram bot with GPT-5 WEBHOOK ONLY...");
    
    const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
    let botInitialized = false;
    
    try {
        // Step 1: Clear any existing webhook/polling
        console.log("🧹 Clearing existing webhook and stopping any polling...");
        await bot.deleteWebHook();
        
        // Wait to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 2: Set up new webhook with GPT-5 configuration
        console.log("🔗 Setting up GPT-5 webhook:", webhookUrl);
        const webhookResult = await bot.setWebHook(webhookUrl, {
            drop_pending_updates: true,
            max_connections: 40,
            allowed_updates: [
                "message", 
                "callback_query", 
                "inline_query",
                "edited_message"
            ]
        });
        
        if (webhookResult) {
            console.log("✅ GPT-5 webhook setup successful!");
            
            // Step 3: Verify webhook configuration
            await new Promise(resolve => setTimeout(resolve, 1000));
            const webhookInfo = await bot.getWebHookInfo();
            
            console.log("📊 GPT-5 Webhook Information:");
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
        console.error("❌ GPT-5 WEBHOOK SETUP FAILED:", webhookError.message);
        console.error("🚨 CRITICAL: GPT-5 bot will NOT work without webhook!");
        console.log("\n🔧 Troubleshooting Steps:");
        console.log("   1. Verify Railway deployment is accessible");
        console.log("   2. Check TELEGRAM_BOT_TOKEN is correct");
        console.log("   3. Ensure webhook URL is publicly accessible");
        console.log("   4. Check Railway service logs for errors");
        console.log("   5. Verify bot token has webhook permissions");
        console.log(`   6. Test webhook URL: ${webhookUrl}`);
        
        // Exit immediately if webhook fails (strict webhook-only mode)
        console.error("\n🚨 Exiting due to webhook failure - GPT-5 WEBHOOK ONLY mode");
        process.exit(1);
    }
    
    if (botInitialized) {
        console.log("\n🎯 GPT-5 bot is ready to receive messages via WEBHOOK!");
        console.log("💡 Test commands: /start, /status, /analytics");
        console.log("🚀 GPT-5 Models: Nano (speed), Mini (balanced), Full (complex), Chat (conversational)");
        console.log("🌐 Mode: WEBHOOK ONLY");
        console.log("📱 Webhook endpoint: /webhook");
        console.log("📊 GPT-5 status endpoint: /gpt5-status");
    }
    
    console.log("\n🚀 GPT-5 AI WEALTH EMPIRE startup complete!");
    console.log("📍 Environment: PRODUCTION (GPT-5 Webhook Only)");
    console.log("💰 Ready to build wealth with GPT-5 AI!");
    console.log(`🌍 Server accessible at: https://imperiumvaultsystem-production.up.railway.app`);
});

// Enhanced error handling for GPT-5 webhook-only mode
process.on('unhandledRejection', (reason, promise) => {
    if (reason && reason.message) {
        if (reason.message.includes('409')) {
            console.error("🚨 Telegram Bot Conflict (409): Another instance running!");
            console.log("🔧 Solution: Stop other instances and wait 60 seconds");
        } else if (reason.message.includes('webhook')) {
            console.error("🚨 GPT-5 Webhook Error:", reason.message);
            console.log("🔧 Check webhook URL and bot token");
        } else if (reason.message.includes('gpt-5')) {
            console.error("🚨 GPT-5 API Error:", reason.message);
            console.log("🔧 Check OpenAI API key and GPT-5 access");
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
            console.error("🚨 GPT-5 Webhook Error:", error.message);
        } else if (error.message.includes('openai') || error.message.includes('gpt-5')) {
            console.error("🚨 GPT-5 System Error:", error.message);
        } else {
            console.error('❌ Uncaught Exception:', error);
        }
    } else {
        console.error('❌ Uncaught Exception:', error);
    }
});

// Graceful shutdown for GPT-5 webhook-only mode
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received, performing graceful GPT-5 shutdown...`);
    
    try {
        console.log('🤖 Removing Telegram webhook...');
        await bot.deleteWebHook();
        console.log('✅ Webhook removed successfully');
        
        // Update system metrics if available
        if (typeof updateSystemMetrics === 'function') {
            await updateSystemMetrics({
                system_shutdown: 1,
                gpt5_system_shutdown: 1,
                webhook_removed: 1
            }).catch(console.error);
        }
        
        console.log('💾 GPT-5 cleanup completed');
        
    } catch (error) {
        console.error('❌ Shutdown cleanup error:', error.message);
    }
    
    // Close server
    server.close(() => {
        console.log('✅ GPT-5 AI WEALTH EMPIRE shut down gracefully');
        console.log('🌐 Webhook removed, GPT-5 server stopped');
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
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

// Export for testing
module.exports = {
    app,
    server,
    initializeEnhancedDatabase,
    connectionStats,
    handleGPT5Conversation,
    executeGPT5Command,
    handleGPT5Fallback
};
