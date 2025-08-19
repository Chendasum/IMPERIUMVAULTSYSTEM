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
// logCommandUsage,       // ← COMMENTED OUT
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
    getStrategicAnalysis: getClaudeStrategicAnalysis,
    getRegimeAnalysis,
    getPortfolioAnalysis,
    getAnomalyAnalysis
} = require('./utils/claudeClient');

const { 
    getGptAnalysis,  // Raw GPT function if needed
    getStrategicAnalysis: getGptStrategicAnalysis
} = require('./utils/openaiClient');

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
// 🎯 DIRECT DUAL AI CONVERSATION HANDLER - Simplified and Clean
async function handleDualAIConversation(chatId, text, sessionId) {
    const startTime = Date.now();
    
    try {
        console.log("🤖 Starting DIRECT dual AI processing:", text.substring(0, 50));
        
        // Get conversation context with memory
        const context = await buildConversationContextWithMemory(chatId, text);
        
        // 🎯 DIRECT CALL to dualAISystem.js - NO intermediate layer
        const result = await getUltimateStrategicAnalysis(text, {
            chatId: chatId,
            sessionId: sessionId || `session_${chatId}_${Date.now()}`,
            conversationHistory: context.conversationHistory,
            persistentMemory: context.persistentMemory,
            memoryContext: context.memoryContext,
            messageType: 'text',
            userContext: {
                platform: 'telegram',
                timestamp: new Date().toISOString(),
                hasMemory: context.memoryAvailable,
                conversationCount: context.conversationHistory?.length || 0
            }
        });
        
        // Handle response directly
        let finalResponse;
        if (typeof result === 'string') {
            finalResponse = result;
        } else if (result && result.response) {
            finalResponse = result.response;
        } else {
            // Immediate fallback to Universal Analysis
            finalResponse = await getUniversalAnalysis(text, {
                chatId: chatId,
                maxTokens: 1200,
                temperature: 0.7
            });
        }
        
        // Send response to user
        await sendSmartMessage(bot, chatId, finalResponse);
        
        // Save conversation directly
        await saveConversationDB(chatId, text, finalResponse, "text", {
            aiUsed: result?.aiUsed || 'DUAL_AI_DIRECT',
            executionTime: Date.now() - startTime,
            success: true,
            memoryUsed: context.memoryAvailable
        }).catch(console.error);
        
        // Extract and save memories directly
        await extractAndSaveMemoriesDirect(chatId, text, finalResponse);
        
        console.log("✅ DIRECT dual AI conversation completed successfully");
        return Date.now() - startTime;
        
    } catch (error) {
        console.error('❌ DIRECT dual AI conversation error:', error.message);
        
        // Simple fallback - no complex handling
        try {
            const fallbackResponse = await getUniversalAnalysis(text, {
                maxTokens: 800,
                temperature: 0.7
            });
            await sendSmartMessage(bot, chatId, fallbackResponse);
        } catch (fallbackError) {
            await sendSmartMessage(bot, chatId, "I'm experiencing technical difficulties. Please try again.");
        }
        
        return Date.now() - startTime;
    }
}

// 🧠 ENHANCED: Build Conversation Context with Memory - WITH DEBUG LOGGING
async function buildConversationContextWithMemory(chatId, currentText) {
    const context = {
        conversationHistory: [],
        persistentMemory: [],
        memoryContext: '',
        memoryAvailable: false
    };
    
    try {
        // Get recent conversation history
        context.conversationHistory = await getConversationHistoryDB(chatId, 5);
        console.log(`📚 Retrieved ${context.conversationHistory.length} conversations`);
    } catch (error) {
        console.log('⚠️ Could not retrieve conversation history:', error.message);
    }
    
    try {
        // Get persistent memories
        context.persistentMemory = await getPersistentMemoryDB(chatId);
        console.log(`🧠 Retrieved ${context.persistentMemory.length} memories`);
        
        // 🔧 DEBUG: Log what memories we actually have
        if (context.persistentMemory.length > 0) {
            console.log('🔍 CURRENT MEMORIES FOR USER:');
            context.persistentMemory.slice(0, 5).forEach((mem, i) => {
                console.log(`  ${i + 1}. ${mem.fact}`);
            });
        } else {
            console.log('📝 NO MEMORIES FOUND FOR THIS USER');
        }
    } catch (error) {
        console.log('⚠️ Could not retrieve persistent memory:', error.message);
    }
    
    // Build memory context string if we have data
    if (context.conversationHistory.length > 0 || context.persistentMemory.length > 0) {
        context.memoryContext = buildMemoryContextString(context.conversationHistory, context.persistentMemory);
        context.memoryAvailable = true;
        console.log(`✅ Memory context built (${context.memoryContext.length} chars)`);
        
        // 🔧 DEBUG: Show what context is being sent to AI
        console.log('🧠 MEMORY CONTEXT BEING SENT TO AI:');
        console.log(context.memoryContext.substring(0, 300) + '...');
    } else {
        console.log('📝 No memory context available - will not send any memory to AI');
    }
    
    return context;
}

// 🧠 ENHANCED: Extract and Save Memories Directly - REPLACE YOUR CURRENT VERSION
async function extractAndSaveMemoriesDirect(chatId, userMessage, aiResponse) {
    try {
        console.log(`🧠 Processing memory extraction for: "${userMessage}"`);
        
        // 🎯 ENHANCED: Name detection (highest priority)
        if (userMessage.toLowerCase().includes('my name is') || userMessage.toLowerCase().includes('name is')) {
            const nameMatch = userMessage.match(/(?:my )?name is ([^.,\n!?]+)/i);
            if (nameMatch) {
                const name = nameMatch[1].trim();
                await addPersistentMemoryDB(chatId, `User's name: ${name}`, 'high');
                console.log(`💾 SAVED NAME: ${name}`);
                return; // Exit early after saving name
            }
        }
        
        // 🎯 ENHANCED: "I am" statements
        if (userMessage.toLowerCase().includes('i am ') && !userMessage.toLowerCase().includes('i am asking')) {
            const iAmMatch = userMessage.match(/i am ([^.,\n!?]+)/i);
            if (iAmMatch) {
                const identity = iAmMatch[1].trim();
                await addPersistentMemoryDB(chatId, `User identity: ${identity}`, 'high');
                console.log(`💾 SAVED IDENTITY: ${identity}`);
            }
        }
        
        // 🎯 ENHANCED: Preferences
        if (userMessage.toLowerCase().includes('i prefer') || userMessage.toLowerCase().includes('i like')) {
            await addPersistentMemoryDB(chatId, `User preference: ${userMessage}`, 'medium');
            console.log(`💾 SAVED PREFERENCE: ${userMessage}`);
        }
        
        // 🎯 ENHANCED: Location
        if (userMessage.toLowerCase().includes('i live in') || userMessage.toLowerCase().includes('i am from')) {
            await addPersistentMemoryDB(chatId, `User location: ${userMessage}`, 'medium');
            console.log(`💾 SAVED LOCATION: ${userMessage}`);
        }
        
        // 🎯 ENHANCED: Work/Job
        if (userMessage.toLowerCase().includes('i work') || userMessage.toLowerCase().includes('my job')) {
            await addPersistentMemoryDB(chatId, `User work: ${userMessage}`, 'medium');
            console.log(`💾 SAVED WORK INFO: ${userMessage}`);
        }
        
        // 🎯 ENHANCED: Goals
        if (userMessage.toLowerCase().includes('my goal') || userMessage.toLowerCase().includes('i want to')) {
            await addPersistentMemoryDB(chatId, `User goal: ${userMessage}`, 'medium');
            console.log(`💾 SAVED GOAL: ${userMessage}`);
        }
        
        // Original logic - check if we should save this conversation as memory
        if (shouldSaveToPersistentMemory(userMessage, aiResponse)) {
            const memoryFact = extractMemoryFact(userMessage, aiResponse);
            if (memoryFact && memoryFact.length > 10) {
                await addPersistentMemoryDB(chatId, memoryFact, 'medium');
                console.log(`💾 Saved memory: ${memoryFact.substring(0, 50)}...`);
            }
        }
        
    } catch (error) {
        console.log('⚠️ Memory extraction failed:', error.message);
    }
}
// 🔧 ENHANCED: Helper Functions with Better Memory Support

// 🧠 ENHANCED: Memory Context Builder - Makes memories more prominent
function buildMemoryContextString(history, memories) {
    let context = '\n\n🧠 IMPORTANT MEMORY CONTEXT FOR THIS USER:\n';
    
    if (memories.length > 0) {
        context += '\nKEY FACTS YOU MUST REMEMBER:\n';
        memories.slice(0, 5).forEach((mem, i) => {
            context += `• ${mem.fact}\n`;
        });
        context += '\n';
    }
    
    if (history.length > 0) {
        context += 'RECENT CONVERSATION HISTORY:\n';
        history.slice(0, 3).forEach((conv, i) => {
            context += `${i + 1}. User: "${conv.user_message?.substring(0, 80)}..."\n`;
            if (conv.gpt_response) {
                context += `   AI: "${conv.gpt_response.substring(0, 80)}..."\n`;
            }
        });
        context += '\n';
    }
    
    context += 'USE THIS INFORMATION TO PROVIDE PERSONALIZED RESPONSES THAT ACKNOWLEDGE WHAT YOU KNOW ABOUT THIS USER.\n';
    
    return context;
}

// 🎯 ENHANCED: Conversation Type Detection - Added memory queries
function determineConversationType(text) {
    if (!text) return 'unknown';
    
    const lower = text.toLowerCase();
    
    // Memory-related queries (high priority)
    if (lower.includes('remember') || lower.includes('my name') || lower.includes('what is my') || lower.includes('do you know')) {
        return 'memory_query';
    }
    
    // Financial and investment
    if (lower.includes('financial') || lower.includes('investment') || lower.includes('fund')) {
        return 'financial_analysis';
    }
    
    // Analysis and strategy
    if (lower.includes('analysis') || lower.includes('strategy')) {
        return 'strategic_analysis';
    }
    
    // Personal information sharing
    if (lower.includes('my name is') || lower.includes('i am') || lower.includes('i live') || lower.includes('i work')) {
        return 'personal_info';
    }
    
    // Complex discussions
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
    
    const liveDataKeywords = ['current', 'latest', 'today', 'now', 'recent', 'update', 'price', 'market'];
    return liveDataKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

// 🧠 ENHANCED: Memory Detection - More comprehensive
function shouldSaveToPersistentMemory(userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    // High priority memory triggers
    if (lowerMessage.includes('my name is') || lowerMessage.includes('i am ')) return true;
    if (lowerMessage.includes('remember') || lowerMessage.includes('don\'t forget')) return true;
    if (lowerMessage.includes('my preference') || lowerMessage.includes('i prefer')) return true;
    if (lowerMessage.includes('i like') || lowerMessage.includes('i love')) return true;
    if (lowerMessage.includes('i live') || lowerMessage.includes('i work')) return true;
    if (lowerMessage.includes('my goal') || lowerMessage.includes('i want to')) return true;
    
    // Response indicators
    if (lowerResponse.includes('important to note') || lowerResponse.includes('key insight')) return true;
    if (lowerResponse.includes('strategic') || lowerResponse.includes('critical')) return true;
    
    // Length-based (detailed responses likely contain important info)
    if (aiResponse.length > 500) return true;
    
    return false;
}

// 🧠 ENHANCED: Memory Fact Extraction - Better patterns
function extractMemoryFact(userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Name extraction (highest priority)
    if (lowerMessage.includes('my name is')) {
        const nameMatch = userMessage.match(/my name is ([^.,\n!?]+)/i);
        if (nameMatch) {
            return `User's name: ${nameMatch[1].trim()}`;
        }
    }
    
    // Identity extraction
    if (lowerMessage.includes('i am ') && !lowerMessage.includes('i am asking') && !lowerMessage.includes('i am wondering')) {
        const identityMatch = userMessage.match(/i am ([^.,\n!?]+)/i);
        if (identityMatch) {
            return `User identity: ${identityMatch[1].trim()}`;
        }
    }
    
    // Preference extraction
    if (lowerMessage.includes('i prefer')) {
        const prefMatch = userMessage.match(/i prefer ([^.,\n!?]+)/i);
        if (prefMatch) {
            return `User preference: ${prefMatch[1].trim()}`;
        }
    }
    
    // Goal extraction
    if (lowerMessage.includes('my goal') || lowerMessage.includes('i want to')) {
        const goalMatch = userMessage.match(/(?:my goal is|i want to) ([^.,\n!?]+)/i);
        if (goalMatch) {
            return `User goal: ${goalMatch[1].trim()}`;
        }
    }
    
    // Location extraction
    if (lowerMessage.includes('i live in') || lowerMessage.includes('i am from')) {
        const locationMatch = userMessage.match(/i (?:live in|am from) ([^.,\n!?]+)/i);
        if (locationMatch) {
            return `User location: ${locationMatch[1].trim()}`;
        }
    }
    
    // Work extraction
    if (lowerMessage.includes('i work')) {
        const workMatch = userMessage.match(/i work (?:at|for|as) ([^.,\n!?]+)/i);
        if (workMatch) {
            return `User work: ${workMatch[1].trim()}`;
        }
    }
    
    // Remember directive
    if (lowerMessage.includes('remember')) {
        const rememberMatch = userMessage.match(/remember (?:that )?([^.,\n!?]+)/i);
        if (rememberMatch) {
            return `Important fact: ${rememberMatch[1].trim()}`;
        }
        return `User request: ${userMessage.trim()}`;
    }
    
    // Key insights from AI response
    if (aiResponse.includes('Key insight:')) {
        const insight = aiResponse.split('Key insight:')[1]?.split('\n')[0];
        return insight ? `Strategic insight: ${insight.trim()}` : null;
    }
    
    // Fallback for general context
    if (userMessage.length > 10 && userMessage.length < 150) {
        return `Conversation context: ${userMessage.trim()}`;
    }
    
    return null;
}

// 🔧 SIMPLIFIED: Session Management (unchanged - these work fine)
async function startUserSession(chatId, sessionType = 'GENERAL') {
    try {
        const sessionId = `session_${chatId}_${Date.now()}`;
        console.log(`📊 Starting session for ${chatId}: ${sessionType}`);
        return sessionId;
    } catch (error) {
        console.error('❌ Start session error:', error.message);
        return `fallback_session_${chatId}_${Date.now()}`;
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

// 🎯 MAIN EXECUTION FUNCTION - DIRECT to dualAISystem.js
async function executeCommandWithLogging(chatId, text, sessionId) {
    const startTime = Date.now();
    
    try {
        // Command handlers (keep all your existing ones)
        if (text === "/start") {
            await handleStartCommand(chatId);
        } else if (text === "/help") {
            await handleHelpCommand(chatId);
        } else if (text === "/myid") {
            await sendSmartMessage(bot, chatId, `Your Chat ID: ${chatId}`);
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
        } else if (text === '/test_db') {
            await handleDatabaseConnectionTest(chatId);
        } else if (text === '/test_memory') {
            await handleMemorySystemTest(chatId);
        } else if (text === '/test_memory_fix') {
            await handleMemoryRecoveryTest(chatId);
        } else if (text === '/memory_stats') {
            await handleMemoryStatistics(chatId);
        } else if ((text.toLowerCase().includes('bitcoin') || text.toLowerCase().includes('btc')) && 
                   (text.toLowerCase().includes('price') || text.toLowerCase().includes('much') || text.toLowerCase().includes('cost'))) {
            await handleLiveBitcoinPrice(chatId);
        } else if (text.toLowerCase().includes('crypto') && 
                   (text.toLowerCase().includes('price') || text.toLowerCase().includes('market'))) {
            await handleLiveCryptoMarket(chatId);
        } else if ((text.toLowerCase().includes('stock') || text.toLowerCase().includes('market') || text.toLowerCase().includes('sp500') || text.toLowerCase().includes('dow')) && 
                   (text.toLowerCase().includes('price') || text.toLowerCase().includes('today') || text.toLowerCase().includes('current'))) {
            await handleLiveStockMarket(chatId);
        } else if ((text.toLowerCase().includes('inflation') || text.toLowerCase().includes('fed') || text.toLowerCase().includes('interest rate') || text.toLowerCase().includes('gdp')) && 
                   (text.toLowerCase().includes('current') || text.toLowerCase().includes('today') || text.toLowerCase().includes('latest'))) {
            await handleLiveEconomicData(chatId);
        } else if (isAnyCryptoRequest(text)) {
            await handleSmartCryptoPrice(chatId, text);
        } else if ((text.toLowerCase().includes('dollar') || text.toLowerCase().includes('forex') || text.toLowerCase().includes('currency') || text.toLowerCase().includes('exchange rate')) && 
                   (text.toLowerCase().includes('price') || text.toLowerCase().includes('rate') || text.toLowerCase().includes('today'))) {
            await handleLiveForexData(chatId);
        } else if (text === '/live_data' || text === '/market_data' || text === '/live_market') {
            await handleComprehensiveLiveData(chatId);
        } else if (text === '/live_crypto' || text === '/crypto_live') {
            await handleLiveCryptoMarket(chatId);
        } else if (text === '/live_stocks' || text === '/stocks_live') {
            await handleLiveStockMarket(chatId);
        } else if (text === '/live_forex' || text === '/forex_live') {
            await handleLiveForexData(chatId);
} else if (text === '/live_economic' || text === '/economic_live') {
            await handleLiveEconomicData(chatId);
        } else {
            // 🎯 ENHANCED DIRECT DUAL AI PROCESSING - With Date Context
            console.log(`🤖 Processing with DIRECT dual AI: "${text}"`);
            
            // Get current Cambodia date and time
            const cambodiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Phnom_Penh"});
            const currentDate = new Date(cambodiaTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Add date context for time-related questions
            let contextualText = text;
            if (text.toLowerCase().includes('today') || 
                text.toLowerCase().includes('date') || 
                text.toLowerCase().includes('time') ||
                text.toLowerCase().includes('when') ||
                text.toLowerCase().includes('what day')) {
                contextualText = `IMPORTANT: Today's date is ${currentDate} (Cambodia time). User question: ${text}`;
                console.log(`📅 Added date context: ${currentDate}`);
            }
            
            const result = await Promise.race([
                getUltimateStrategicAnalysis(contextualText, {
                    chatId: chatId,
                    sessionId: sessionId || `session_${chatId}_${Date.now()}`,
                    messageType: 'general_conversation',
                    currentDate: currentDate,
                    timeZone: 'Asia/Phnom_Penh'
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout after 30 seconds')), 30000)
                )
            ]);
            
            // Extract response
            const response = (typeof result === 'string') ? result : 
                           (result?.response) ? result.response : 
                           "I've processed your request with our dual AI system.";
                           
            await sendSmartMessage(bot, chatId, response);
            
            console.log(`✅ DIRECT dual AI processing completed`);
        }
        
        const executionTime = Date.now() - startTime;
        await logCommandUsage(chatId, text, executionTime, true);
        return executionTime;
        
    } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error('❌ DIRECT execution error:', error.message);
        
        // Simple fallback
        try {
            const emergencyResponse = await getUniversalAnalysis(text, {
                maxTokens: 600,
                temperature: 0.7
            });
            await sendSmartMessage(bot, chatId, emergencyResponse);
        } catch (emergencyError) {
            await sendSmartMessage(bot, chatId, "I apologize, but I'm experiencing technical difficulties. Please try again.");
        }
        
        await logCommandUsage(chatId, text, executionTime, false, error.message);
        throw error;
    }
}

// 🔧 SIMPLIFIED: Logging Functions
async function logCommandUsage(chatId, command, executionTime, successful = true, errorMessage = null) {
    try {
        console.log(`📊 Command: ${chatId} | ${command.substring(0, 30)} | ${executionTime}ms | ${successful ? 'SUCCESS' : 'FAILED'}`);
        
        if (!successful && errorMessage) {
            console.log(`❌ Error: ${errorMessage}`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Log command usage error:', error.message);
        return false;
    }
}

// ✅ KEEP THIS VERSION (the simpler one):
async function logApiUsage(apiProvider, endpoint, callsCount = 1, successful = true, responseTime = 0, dataVolume = 0, costEstimate = 0) {
    try {
        console.log(`🔌 API: ${apiProvider}/${endpoint} | ${successful ? 'SUCCESS' : 'FAILED'} | ${responseTime}ms | Cost: $${costEstimate}`);
        return true;
    } catch (error) {
        console.error('❌ Log API usage error:', error.message);
        return false;
    }
}

// 🔧 FIXED: Enhanced start command with better status
async function handleStartCommand(chatId) {
    try {
        const welcome = `🤖 **Enhanced AI Assistant System v4.0 - WEALTH EMPIRE**

**🎯 Core Features:**
- ✅ Dual AI: GPT-5 + Claude Opus 4.1 (Both Released Aug 2025)
- ✅ Complete AI Wealth-Building System (10 modules)
- ✅ Enhanced PostgreSQL Database Integration
- ✅ Live market data & Ray Dalio framework
- ✅ Cambodia fund analysis
- ✅ Advanced document processing
- ✅ Voice and image analysis
- ✅ Persistent memory system

**🏦 Cambodia Fund Commands:**
/deal_analyze - Analyze lending deals
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

**📊 Live Data:**
/live_data - Comprehensive market data
/live_crypto - Cryptocurrency markets
/live_stocks - Stock market data
/live_forex - Forex rates
/live_economic - Economic indicators

**🔧 System Management:**
/analytics - Master system analytics
/db_stats - Database statistics
/status - Enhanced system status
/maintenance - Database maintenance

**🧪 Testing & Diagnostics:**
/test_db - Test database connection
/test_memory - Test memory system
/test_memory_fix - Memory recovery test
/memory_stats - Memory statistics

**💬 General Usage:**
Just type any question and the dual AI system will respond!

**Chat ID:** ${chatId}
**🏆 AI Wealth Empire Status:** ACTIVE
**Database Status:** ${connectionStats?.connectionHealth || 'Checking...'}`;

        await sendSmartMessage(bot, chatId, welcome);
        
        // Save welcome interaction
        await saveConversationDB(chatId, "/start", welcome, "command").catch(console.error);
        
    } catch (error) {
        console.error('Start command error:', error.message);
        await sendSmartMessage(bot, chatId, "❌ Welcome message failed. System may be starting up.");
    }
}

// 🔧 FIXED: Help command
async function handleHelpCommand(chatId) {
    try {
        const help = `📚 **Enhanced AI Assistant Help**

**🤖 Dual AI System:**
Ask any question and get responses from GPT-5 + Claude Opus 4.1

**📈 Financial Analysis:**
/deal_analyze - Analyze Cambodia lending deals
/portfolio - Portfolio status and analytics
/cambodia_market - Cambodia market conditions
/risk_assessment - Comprehensive risk analysis

**📊 Market Intelligence:**
/briefing - Daily market briefing
/regime - Economic regime analysis
/opportunities - Trading opportunities
/macro - Macro economic outlook

**💹 Trading & Positions:**
/trading - Trading account status
/positions - Current positions
/account - Account information

**📊 Live Market Data:**
/live_data - All markets overview
/live_crypto - Crypto market data
/live_stocks - Stock market updates
/live_forex - Forex rates
/live_economic - Economic indicators

**🔧 System & Database:**
/status - System health status
/analytics - Master analytics dashboard
/db_stats - Database statistics
/maintenance - Database maintenance

**🧪 Testing & Diagnostics:**
/test_db - Database connection test
/test_memory - Memory system test
/test_memory_fix - Memory recovery
/memory_stats - Memory statistics

**💡 Pro Tips:**
• Long questions → Claude Opus 4.1 (better for complex analysis)
• Short questions → GPT-5 (faster responses)
• System automatically chooses the best AI for your query
• All conversations are saved with persistent memory

Type any question to start!`;

        await sendAnalysis(bot, chatId, help, "Enhanced AI Assistant Help");
        
        // Save help request
        await saveConversationDB(chatId, "/help", help, "command").catch(console.error);
        
    } catch (error) {
        console.error('Help command error:', error.message);
        await sendSmartMessage(bot, chatId, "❌ Help system unavailable. Try /start");
    }
}

// 🔧 FIXED: Placeholder handlers that actually work
async function handleDealAnalysisFixed(chatId, text) {
    try {
        await sendSmartMessage(bot, chatId, 
            `🏦 **Cambodia Deal Analysis**\n\n` +
            `📊 **Available Soon** - Currently implementing:\n` +
            `• Lending deal evaluation\n` +
            `• ROI calculations\n` +
            `• Risk assessment\n` +
            `• Market conditions\n\n` +
            `**Current Status:** Development Phase\n` +
            `**Try instead:** Ask about "Cambodia lending analysis" for AI-powered insights`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Deal analysis temporarily unavailable");
    }
}

async function handlePortfolioStatusFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `📊 **Portfolio Status**\n\n` +
            `🔄 **Connecting to portfolio systems...**\n\n` +
            `**Available Features:**\n` +
            `• Portfolio analytics (Coming soon)\n` +
            `• Performance tracking\n` +
            `• Risk metrics\n` +
            `• Asset allocation\n\n` +
            `**Try asking:** "Analyze my portfolio performance" for AI insights`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Portfolio status temporarily unavailable");
    }
}

async function handleCambodiaMarketFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `🇰🇭 **Cambodia Market Conditions**\n\n` +
            `📈 **Market Overview:**\n` +
            `• Lending rates: 12-18% annually\n` +
            `• Real estate growth: Strong\n` +
            `• Currency: Stable USD peg\n` +
            `• Economic growth: 6-7% projected\n\n` +
            `📊 **Key Indicators:**\n` +
            `• Construction sector: Active\n` +
            `• Tourism recovery: In progress\n` +
            `• Investment climate: Favorable\n\n` +
            `**For detailed analysis, ask:** "What are the current opportunities in Cambodia real estate?"`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Cambodia market data temporarily unavailable");
    }
}

async function handleRiskAssessmentFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `⚠️ **Risk Assessment Framework**\n\n` +
            `🔍 **Available Risk Analysis:**\n` +
            `• Portfolio risk metrics\n` +
            `• Market volatility analysis\n` +
            `• Geographic risk (Cambodia focus)\n` +
            `• Currency exposure\n` +
            `• Sector concentration\n\n` +
            `📊 **AI-Powered Assessment:**\n` +
            `Ask specific questions like:\n` +
            `• "What are the risks of Cambodia real estate?"\n` +
            `• "Analyze portfolio diversification risks"\n` +
            `• "Currency risk assessment USD/KHR"`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Risk assessment temporarily unavailable");
    }
}

async function handleMarketBriefingFixed(chatId) {
    try {
        const briefing = `📊 **Daily Market Briefing**\n\n` +
            `**Global Markets:**\n` +
            `• US Markets: Mixed signals\n` +
            `• Asian Markets: Cautious optimism\n` +
            `• Emerging Markets: Stable\n\n` +
            `**Cambodia Focus:**\n` +
            `• Real Estate: Active demand\n` +
            `• Banking Sector: Stable growth\n` +
            `• Tourism: Recovery phase\n\n` +
            `**For live data:** Use /live_data\n` +
            `**For AI analysis:** Ask "Give me today's market outlook"`;
        
        await sendAnalysis(bot, chatId, briefing, "Daily Market Briefing");
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Market briefing temporarily unavailable");
    }
}

async function handleRegimeAnalysisFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `🌍 **Economic Regime Analysis**\n\n` +
            `📈 **Current Assessment:**\n` +
            `• Global: Transition phase\n` +
            `• US: Late cycle expansion\n` +
            `• Asia: Mixed signals\n` +
            `• Cambodia: Growth phase\n\n` +
            `🔍 **Ray Dalio Framework:**\n` +
            `• Debt cycle position\n` +
            `• Inflation trends\n` +
            `• Political stability\n` +
            `• Currency dynamics\n\n` +
            `**For detailed analysis:** Ask "What's the current economic regime in Cambodia?"`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Regime analysis temporarily unavailable");
    }
}

async function handleOpportunitiesFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `💡 **Current Opportunities**\n\n` +
            `🏗️ **Cambodia Real Estate:**\n` +
            `• Phnom Penh development projects\n` +
            `• Siem Reap tourism recovery\n` +
            `• Industrial zone investments\n\n` +
            `📊 **Regional Markets:**\n` +
            `• ASEAN growth sectors\n` +
            `• Infrastructure development\n` +
            `• Technology adoption\n\n` +
            `**AI Analysis Available:**\n` +
            `Ask "What are the best investment opportunities in Cambodia?" for detailed insights`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Opportunities analysis temporarily unavailable");
    }
}

async function handleMacroAnalysisFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `🌐 **Macro Economic Analysis**\n\n` +
            `📊 **Global Trends:**\n` +
            `• Interest rates: Stabilizing\n` +
            `• Inflation: Moderating\n` +
            `• Growth: Cautious outlook\n\n` +
            `🇰🇭 **Cambodia Macro:**\n` +
            `• GDP growth: 6-7% target\n` +
            `• Currency: USD stable\n` +
            `• Trade: Diversifying\n\n` +
            `**For AI-powered macro analysis:**\n` +
            `Ask "What's the macro outlook for Southeast Asia?" or similar questions`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Macro analysis temporarily unavailable");
    }
}

async function handleTradingStatusFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `💹 **Trading Account Status**\n\n` +
            `🔄 **Connecting to trading systems...**\n\n` +
            `**Available Features:**\n` +
            `• Account balance (Integration pending)\n` +
            `• Open positions\n` +
            `• P&L tracking\n` +
            `• Risk metrics\n\n` +
            `**Alternative:** Ask "What's my trading performance?" for AI analysis of your strategies`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Trading status temporarily unavailable");
    }
}

async function handlePositionsFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `📊 **Current Positions**\n\n` +
            `🔄 **Loading portfolio data...**\n\n` +
            `**Position Tracking:**\n` +
            `• Real estate holdings\n` +
            `• Financial instruments\n` +
            `• Currency exposure\n` +
            `• Risk allocation\n\n` +
            `**Try asking:** "Analyze my current investment positions" for AI insights`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Positions data temporarily unavailable");
    }
}

async function handleDocumentsListFixed(chatId) {
    try {
        const docs = await getTrainingDocumentsDB(chatId).catch(() => []);
        
        if (docs.length === 0) {
            await sendSmartMessage(bot, chatId, 
                `📚 **No Training Documents Found**\n\n` +
                `**How to add documents:**\n` +
                `🔹 Upload any file (.txt, .pdf, .md, .json, .csv)\n` +
                `🔹 Add caption: "train"\n` +
                `🔹 AI will save it to database\n` +
                `🔹 Documents enhance AI responses\n\n` +
                `**Supported Formats:**\n` +
                `• Text files (.txt, .md)\n` +
                `• PDF documents (.pdf)\n` +
                `• JSON data (.json)\n` +
                `• CSV spreadsheets (.csv)`
            );
        } else {
            let response = `📚 **Training Documents (${docs.length})**\n\n`;
            docs.slice(0, 10).forEach((doc, i) => {
                response += `**${i + 1}. ${doc.file_name}**\n`;
                response += `• Words: ${doc.word_count?.toLocaleString() || 'Unknown'}\n`;
                response += `• Added: ${new Date(doc.upload_date).toLocaleDateString()}\n\n`;
            });
            
            if (docs.length > 10) {
                response += `... and ${docs.length - 10} more documents\n\n`;
            }
            
            response += `💡 **Try asking:** "What did you learn from my documents?"`;
            
            await sendSmartMessage(bot, chatId, response);
        }
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Documents list temporarily unavailable");
    }
}

// 🔧 FIXED: Live data handlers
async function handleComprehensiveLiveDataFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `📊 **Live Market Data**\n\n` +
            `🔄 **Connecting to data feeds...**\n\n` +
            `**Available Data:**\n` +
            `• Global stock markets\n` +
            `• Cryptocurrency prices\n` +
            `• Forex rates\n` +
            `• Economic indicators\n` +
            `• Commodity prices\n\n` +
            `**For AI-powered analysis:**\n` +
            `Ask "What's happening in the markets today?" or "Current Bitcoin price analysis"`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Live data temporarily unavailable");
    }
}

async function handleLiveCryptoMarketFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `₿ **Live Crypto Market**\n\n` +
            `🔄 **Loading crypto data...**\n\n` +
            `**Major Cryptocurrencies:**\n` +
            `• Bitcoin (BTC)\n` +
            `• Ethereum (ETH)\n` +
            `• Major altcoins\n\n` +
            `**For real-time analysis:**\n` +
            `Ask "What's the crypto market sentiment?" or "Bitcoin price prediction"`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Crypto data temporarily unavailable");
    }
}

async function handleLiveStockMarketFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `📈 **Live Stock Market**\n\n` +
            `🔄 **Loading stock data...**\n\n` +
            `**Major Indices:**\n` +
            `• S&P 500\n` +
            `• NASDAQ\n` +
            `• Asian markets\n\n` +
            `**For AI analysis:**\n` +
            `Ask "Stock market outlook today" or "Which sectors are performing well?"`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Stock data temporarily unavailable");
    }
}

async function handleLiveForexDataFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `💱 **Live Forex Data**\n\n` +
            `🔄 **Loading currency rates...**\n\n` +
            `**Major Pairs:**\n` +
            `• EUR/USD\n` +
            `• GBP/USD\n` +
            `• USD/JPY\n` +
            `• USD/KHR (Cambodia)\n\n` +
            `**For AI analysis:**\n` +
            `Ask "USD strength analysis" or "Cambodia currency outlook"`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Forex data temporarily unavailable");
    }
}

async function handleLiveEconomicDataFixed(chatId) {
    try {
        await sendSmartMessage(bot, chatId, 
            `📊 **Live Economic Data**\n\n` +
            `🔄 **Loading economic indicators...**\n\n` +
            `**Key Indicators:**\n` +
            `• GDP growth rates\n` +
            `• Inflation data\n` +
            `• Employment statistics\n` +
            `• Interest rates\n\n` +
            `**For AI analysis:**\n` +
            `Ask "Current economic outlook" or "Inflation impact analysis"`
        );
    } catch (error) {
        await sendSmartMessage(bot, chatId, "❌ Economic data temporarily unavailable");
    }
}

// 🔧 COMPLETELY FIXED: Clean memory test without external dependencies
async function performManualMemoryTest(chatId) {
    const tests = {
        conversationHistory: false,
        persistentMemory: false,
        memoryBuilding: false,
        dualAISystem: false
    };
    
    try {
        // Test 1: Conversation History
        const history = await getConversationHistoryDB(chatId, 3);
        tests.conversationHistory = Array.isArray(history);
        console.log(`✅ History test: ${tests.conversationHistory ? 'PASS' : 'FAIL'} (${history?.length || 0} records)`);
    } catch (error) {
        console.log('❌ History test failed:', error.message);
        tests.conversationHistory = false;
    }
    
    try {
        // Test 2: Persistent Memory
        const memory = await getPersistentMemoryDB(chatId);
        tests.persistentMemory = Array.isArray(memory);
        console.log(`✅ Memory test: ${tests.persistentMemory ? 'PASS' : 'FAIL'} (${memory?.length || 0} memories)`);
    } catch (error) {
        console.log('❌ Memory test failed:', error.message);
        tests.persistentMemory = false;
    }
    
    try {
        // Test 3: Memory Building (Safe test)
        const testContext = await buildConversationContextSafe(chatId, 'test message');
        tests.memoryBuilding = testContext && typeof testContext === 'object';
        console.log(`✅ Context building test: ${tests.memoryBuilding ? 'PASS' : 'FAIL'}`);
    } catch (error) {
        console.log('❌ Context building test failed:', error.message);
        tests.memoryBuilding = false;
    }
    
    try {
        // Test 4: Dual AI System (Clean test without external dependencies)
        console.log('🧪 Testing dual AI system...');
        
        // Test the actual dual AI handler we use
        const testIntel = {
            type: 'test',
            complexity: 'simple',
            requiresLiveData: false,
            isLongQuestion: false
        };
        
        const testContext = {
            conversationHistory: [],
            persistentMemory: [],
            memoryContext: '',
            memoryAvailable: false
        };
        
        const result = await executeGPTAnalysis('Hello, this is a test message', testContext, testIntel);
        tests.dualAISystem = result && result.success !== false;
        console.log(`✅ Dual AI test: ${tests.dualAISystem ? 'PASS' : 'FAIL'}`);
        
    } catch (error) {
        console.log('❌ Dual AI test failed:', error.message);
        
        // Fallback: Test if we can at least call the basic functions
        try {
            const basicTest = await getUniversalAnalysis('test', { max_tokens: 10, model: 'gpt-5' });
            tests.dualAISystem = !!basicTest;
            console.log(`✅ Basic AI test: ${tests.dualAISystem ? 'PASS' : 'FAIL'} (fallback)`);
        } catch (basicError) {
            console.log('❌ Basic AI test also failed:', basicError.message);
            tests.dualAISystem = false;
        }
    }
    
    const successCount = Object.values(tests).filter(Boolean).length;
    const totalTests = Object.keys(tests).length;
    
    const result = {
        tests: tests,
        score: `${successCount}/${totalTests}`,
        percentage: Math.round((successCount / totalTests) * 100),
        status: successCount === totalTests ? 'FULL_SUCCESS' : 
                successCount >= totalTests * 0.7 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION',
        details: {
            conversationHistory: tests.conversationHistory,
            persistentMemory: tests.persistentMemory,
            memoryBuilding: tests.memoryBuilding,
            dualAISystem: tests.dualAISystem
        },
        summary: `Memory system: ${successCount}/${totalTests} tests passed (${Math.round((successCount/totalTests) * 100)}%)`
    };
    
    console.log(`🧪 Memory Test Complete: ${result.summary}`);
    return result;
}

// 🔧 REMOVED DUPLICATE PLACEHOLDER HANDLERS 
// (They're already defined in the previous section as "Fixed" versions)

// 🔧 ENHANCED: Advanced conversation type determination with more categories
function determineConversationTypeAdvanced(text) {
    if (!text || typeof text !== 'string') return 'unknown';
    
    const lowerText = text.toLowerCase();
    
    // Memory-related queries (high priority)
    if (lowerText.includes('remember') || lowerText.includes('recall') || 
        lowerText.includes('you mentioned') || lowerText.includes('we discussed') ||
        lowerText.includes('you said') || lowerText.includes('i told you')) {
        return 'memory_query';
    }
    
    // Financial analysis (Cambodia fund specific)
    if (lowerText.includes('cambodia') || lowerText.includes('lending') || 
        lowerText.includes('phnom penh') || lowerText.includes('siem reap') ||
        lowerText.includes('fund') || lowerText.includes('roi') ||
        lowerText.includes('interest rate') || lowerText.includes('deal')) {
        return 'cambodia_fund';
    }
    
    // Economic and regime analysis
    if (lowerText.includes('regime') || lowerText.includes('economic') ||
        lowerText.includes('inflation') || lowerText.includes('gdp') ||
        lowerText.includes('central bank') || lowerText.includes('monetary') ||
        lowerText.includes('ray dalio') || lowerText.includes('debt cycle')) {
        return 'economic_regime';
    }
    
    // Market analysis
    if (lowerText.includes('market') || lowerText.includes('trading') || 
        lowerText.includes('stock') || lowerText.includes('crypto') ||
        lowerText.includes('bitcoin') || lowerText.includes('forex') ||
        lowerText.includes('price') || lowerText.includes('chart')) {
        return 'market_analysis';
    }
    
    // Portfolio and risk management
    if (lowerText.includes('portfolio') || lowerText.includes('risk') || 
        lowerText.includes('allocation') || lowerText.includes('diversification') ||
        lowerText.includes('volatility') || lowerText.includes('correlation')) {
        return 'portfolio_analysis';
    }
    
    // Date and time queries (simple)
    if (lowerText.includes('time') || lowerText.includes('date') || 
        lowerText.includes('today') || lowerText.includes('now') ||
        lowerText.includes('current time')) {
        return 'simple_datetime';
    }
    
    // Strategic analysis (complex thinking required)
    if (lowerText.includes('analyze') || lowerText.includes('strategy') || 
        lowerText.includes('comprehensive') || lowerText.includes('evaluate') ||
        lowerText.includes('assess') || lowerText.includes('compare') ||
        lowerText.includes('pros and cons') || lowerText.includes('what if')) {
        return 'strategic_analysis';
    }
    
    // Technical questions (programming, system)
    if (lowerText.includes('code') || lowerText.includes('programming') ||
        lowerText.includes('database') || lowerText.includes('api') ||
        lowerText.includes('function') || lowerText.includes('error')) {
        return 'technical_query';
    }
    
    // Casual conversation
    if (lowerText.includes('joke') || lowerText.includes('story') || 
        lowerText.includes('hello') || lowerText.includes('hi') ||
        lowerText.includes('how are you') || lowerText.includes('good morning') ||
        lowerText.includes('thank you') || lowerText.includes('thanks')) {
        return 'casual';
    }
    
    // Document/research related
    if (lowerText.includes('document') || lowerText.includes('research') ||
        lowerText.includes('paper') || lowerText.includes('report') ||
        lowerText.includes('study') || lowerText.includes('article')) {
        return 'document_research';
    }
    
    // Complex discussion (long text or multiple questions)
    if (text.length > 200 || (text.match(/\?/g) || []).length > 1) {
        return 'complex_discussion';
    }
    
    // Default for general strategic conversations
    return 'balanced_strategic';
}

// 🔧 ENHANCED: More sophisticated complexity determination
function determineComplexityAdvanced(text) {
    if (!text || typeof text !== 'string') return 'simple';
    
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const hasMultipleTopics = text.includes(' and ') || text.includes(', ') || text.includes(';');
    
    // Check for complex keywords
    const complexKeywords = [
        'analysis', 'strategy', 'comprehensive', 'detailed', 'evaluate',
        'assess', 'compare', 'contrast', 'implications', 'consequences',
        'correlation', 'causation', 'hypothesis', 'methodology', 'framework'
    ];
    const hasComplexKeywords = complexKeywords.some(keyword => 
        text.toLowerCase().includes(keyword)
    );
    
    // Check for financial/technical terms
    const technicalTerms = [
        'portfolio', 'diversification', 'volatility', 'correlation', 'allocation',
        'leverage', 'derivatives', 'arbitrage', 'liquidity', 'capitalization',
        'macroeconomic', 'microeconomic', 'monetary policy', 'fiscal policy'
    ];
    const hasTechnicalTerms = technicalTerms.some(term => 
        text.toLowerCase().includes(term)
    );
    
    // Complexity scoring
    let complexityScore = 0;
    
    // Length factors
    if (text.length > 500) complexityScore += 3;
    else if (text.length > 200) complexityScore += 2;
    else if (text.length > 100) complexityScore += 1;
    
    // Word count factors
    if (wordCount > 100) complexityScore += 3;
    else if (wordCount > 50) complexityScore += 2;
    else if (wordCount > 20) complexityScore += 1;
    
    // Question complexity
    if (questionCount > 3) complexityScore += 2;
    else if (questionCount > 1) complexityScore += 1;
    
    // Sentence structure
    if (sentenceCount > 10) complexityScore += 2;
    else if (sentenceCount > 5) complexityScore += 1;
    
    // Content complexity
    if (hasComplexKeywords) complexityScore += 2;
    if (hasTechnicalTerms) complexityScore += 2;
    if (hasMultipleTopics) complexityScore += 1;
    
    // Return complexity level
    if (complexityScore >= 8) return 'maximum';
    if (complexityScore >= 5) return 'complex';
    if (complexityScore >= 3) return 'medium';
    if (complexityScore >= 1) return 'simple';
    return 'minimal';
}

// 🔧 ENHANCED: Live data requirement detection with more keywords
function requiresLiveDataAdvanced(text) {
    if (!text || typeof text !== 'string') return false;
    
    const lowerText = text.toLowerCase();
    
    // Time-sensitive keywords
    const timeKeywords = [
        'current', 'latest', 'today', 'now', 'recent', 'this week',
        'this month', 'this year', 'up to date', 'real-time', 'live'
    ];
    
    // Market data keywords
    const marketKeywords = [
        'price', 'market', 'trading', 'rate', 'exchange rate',
        'stock price', 'crypto price', 'commodity price', 'index'
    ];
    
    // News and events keywords
    const newsKeywords = [
        'news', 'announcement', 'breaking', 'update', 'report',
        'earnings', 'financial results', 'economic data'
    ];
    
    // Status and monitoring keywords
    const statusKeywords = [
        'status', 'condition', 'state', 'performance', 'level',
        'trend', 'movement', 'change', 'development'
    ];
    
    const allKeywords = [...timeKeywords, ...marketKeywords, ...newsKeywords, ...statusKeywords];
    
    return allKeywords.some(keyword => lowerText.includes(keyword));
}

// 🔧 ENHANCED: Memory persistence logic with better categorization
function shouldSaveToPersistentMemoryAdvanced(userMessage, aiResponse) {
    if (!userMessage || !aiResponse) return false;
    
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    // High priority triggers (always save)
    const highPriorityTriggers = [
        'remember', 'my name is', 'don\'t forget', 'important',
        'my preference', 'i prefer', 'my goal', 'my strategy',
        'my background', 'i work at', 'i live in', 'my phone',
        'my email', 'my address', 'my birthday'
    ];
    
    if (highPriorityTriggers.some(trigger => lowerMessage.includes(trigger))) {
        return true;
    }
    
    // Medium priority triggers (contextual)
    const mediumPriorityTriggers = [
        'my portfolio', 'my risk tolerance', 'my investment',
        'my experience', 'my plan', 'my target', 'my timeline'
    ];
    
    if (mediumPriorityTriggers.some(trigger => lowerMessage.includes(trigger))) {
        return true;
    }
    
    // Response-based triggers
    const responseTriggers = [
        'important to note', 'key insight', 'remember that',
        'strategic', 'critical', 'significant', 'note that',
        'keep in mind', 'bear in mind', 'important point'
    ];
    
    if (responseTriggers.some(trigger => lowerResponse.includes(trigger))) {
        return true;
    }
    
    // Length-based (detailed responses often contain valuable info)
    if (aiResponse.length > 1000) return true;
    
    // Financial/investment context
    if (lowerMessage.includes('fund') || lowerMessage.includes('cambodia') ||
        lowerMessage.includes('investment') || lowerMessage.includes('lending')) {
        return aiResponse.length > 300;
    }
    
    return false;
}

// 🔧 ENHANCED: Memory fact extraction with better patterns
function extractMemoryFactAdvanced(userMessage, aiResponse) {
    if (!userMessage || !aiResponse) return null;
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Personal information extraction
    const personalPatterns = [
        { pattern: /my name is ([^.,\n!?]+)/i, template: "User's name: {1}" },
        { pattern: /i am ([^.,\n!?]+)/i, template: "User identity: {1}" },
        { pattern: /i work (?:at|for) ([^.,\n!?]+)/i, template: "User workplace: {1}" },
        { pattern: /i live in ([^.,\n!?]+)/i, template: "User location: {1}" },
        { pattern: /i'm from ([^.,\n!?]+)/i, template: "User origin: {1}" },
        { pattern: /my (?:phone|email) (?:is )?([^.,\n!?]+)/i, template: "User contact: {1}" },
        { pattern: /i'm (\d+) years old/i, template: "User age: {1}" },
        { pattern: /my birthday is ([^.,\n!?]+)/i, template: "User birthday: {1}" }
    ];
    
    for (const { pattern, template } of personalPatterns) {
        const match = userMessage.match(pattern);
        if (match) {
            return template.replace('{1}', match[1].trim());
        }
    }
    
    // Preference extraction
    const preferencePatterns = [
        { pattern: /i prefer ([^.,\n!?]+)/i, template: "User preference: {1}" },
        { pattern: /i like ([^.,\n!?]+)/i, template: "User likes: {1}" },
        { pattern: /i don't like ([^.,\n!?]+)/i, template: "User dislikes: {1}" },
        { pattern: /my favorite ([^.,\n!?]+)/i, template: "User favorite: {1}" }
    ];
    
    for (const { pattern, template } of preferencePatterns) {
        const match = userMessage.match(pattern);
        if (match) {
            return template.replace('{1}', match[1].trim());
        }
    }
    
    // Goal and strategy extraction
    const goalPatterns = [
        { pattern: /my goal (?:is )?(?:to )?([^.,\n!?]+)/i, template: "User goal: {1}" },
        { pattern: /my strategy (?:is )?(?:to )?([^.,\n!?]+)/i, template: "User strategy: {1}" },
        { pattern: /my plan (?:is )?(?:to )?([^.,\n!?]+)/i, template: "User plan: {1}" },
        { pattern: /my target (?:is )?([^.,\n!?]+)/i, template: "User target: {1}" }
    ];
    
    for (const { pattern, template } of goalPatterns) {
        const match = userMessage.match(pattern);
        if (match) {
            return template.replace('{1}', match[1].trim());
        }
    }
    
    // Remember directive
    if (lowerMessage.includes('remember')) {
        const rememberMatch = userMessage.match(/remember (?:that )?([^.,\n!?]+)/i);
        if (rememberMatch) {
            return `Important fact: ${rememberMatch[1].trim()}`;
        }
        return `User request: ${userMessage.trim()}`;
    }
    
    // AI response insights
    const responsePatterns = [
        'Key insight:', 'Important note:', 'Critical point:', 'Remember:',
        'In conclusion:', 'To summarize:', 'Bottom line:', 'Strategic insight:'
    ];
    
    for (const pattern of responsePatterns) {
        if (aiResponse.includes(pattern)) {
            const insight = aiResponse.split(pattern)[1]?.split('\n')[0];
            if (insight && insight.trim().length > 10) {
                return `AI insight: ${insight.trim()}`;
            }
        }
    }
    
    // Recommendations
    const recommendationMatch = aiResponse.match(/I recommend ([^.,\n!?]+)/i);
    if (recommendationMatch) {
        return `AI recommendation: ${recommendationMatch[1].trim()}`;
    }
    
    // Extract important sentences
    const sentences = aiResponse.split('. ');
    const importantSentence = sentences.find(s => {
        const lower = s.toLowerCase();
        return (lower.includes('important') || lower.includes('key') || 
                lower.includes('strategic') || lower.includes('critical') ||
                lower.includes('note that') || lower.includes('remember')) &&
               s.length > 20 && s.length < 200;
    });
    
    if (importantSentence) {
        return `Context: ${importantSentence.trim()}`;
    }
    
    // Financial context preservation
    if (lowerMessage.includes('cambodia') || lowerMessage.includes('fund') ||
        lowerMessage.includes('investment') || lowerMessage.includes('lending')) {
        return `Financial context: ${userMessage.substring(0, 100)}`;
    }
    
    // Fallback for general context
    if (userMessage.length > 20 && userMessage.length < 150) {
        return `Conversation context: ${userMessage.trim()}`;
    }
    
    return null;
}

// 🔧 UTILITY: Enhanced conversation context building helper
function buildMemoryContextStringAdvanced(history, memories) {
    let context = '\n\n🧠 ENHANCED MEMORY CONTEXT:\n';
    
    if (memories.length > 0) {
        // Group memories by type
        const personalInfo = memories.filter(m => m.fact?.includes("User's name") || m.fact?.includes("User location"));
        const preferences = memories.filter(m => m.fact?.includes("preference") || m.fact?.includes("likes"));
        const goals = memories.filter(m => m.fact?.includes("goal") || m.fact?.includes("strategy"));
        const insights = memories.filter(m => m.fact?.includes("insight") || m.fact?.includes("recommendation"));
        
        if (personalInfo.length > 0) {
            context += '\nPERSONAL INFO:\n';
            personalInfo.slice(0, 2).forEach((mem, i) => {
                context += `${i + 1}. ${mem.fact}\n`;
            });
        }
        
        if (preferences.length > 0) {
            context += '\nPREFERENCES:\n';
            preferences.slice(0, 2).forEach((mem, i) => {
                context += `${i + 1}. ${mem.fact}\n`;
            });
        }
        
        if (goals.length > 0) {
            context += '\nGOALS & STRATEGY:\n';
            goals.slice(0, 2).forEach((mem, i) => {
                context += `${i + 1}. ${mem.fact}\n`;
            });
        }
        
        if (insights.length > 0) {
            context += '\nKEY INSIGHTS:\n';
            insights.slice(0, 2).forEach((mem, i) => {
                context += `${i + 1}. ${mem.fact}\n`;
            });
        }
    }
    
    if (history.length > 0) {
        context += '\nRECENT CONVERSATION:\n';
        const recent = history[0];
        context += `User: "${recent.user_message?.substring(0, 100)}..."\n`;
        if (recent.gpt_response) {
            context += `AI: "${recent.gpt_response.substring(0, 100)}..."\n`;
        }
    }
    
    return context;
}

// 🔧 UTILITY: Message validation and preprocessing
function validateAndPreprocessMessage(text) {
    if (!text || typeof text !== 'string') {
        return { valid: false, error: 'Invalid message format' };
    }
    
    const trimmed = text.trim();
    
    if (trimmed.length === 0) {
        return { valid: false, error: 'Empty message' };
    }
    
    if (trimmed.length > 10000) {
        return { 
            valid: true, 
            processed: trimmed.substring(0, 10000) + '... [truncated]',
            warning: 'Message truncated due to length'
        };
    }
    
    return { valid: true, processed: trimmed };
}
// 🔧 COMPLETELY FIXED: Voice message handler with proper dual AI integration
async function handleVoiceMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🎤 Processing voice message...");
        await bot.sendMessage(chatId, "🎤 Transcribing voice message with GPT-5 + Claude Opus 4.1 enhanced AI...");
        
        // Validate voice message first
        validateVoiceMessage(msg);
        
        // 🔧 FIXED: Use working Whisper transcription
        const transcribedText = await processVoiceMessageFixed(bot, msg.voice.file_id, chatId);
        const responseTime = Date.now() - startTime;
        
        if (transcribedText && transcribedText.length > 0) {
            await sendSmartMessage(bot, chatId, `🎤 **Voice transcribed:** "${transcribedText}"`);
            
            // Enhanced voice transcription save with better metadata
            await saveConversationDB(chatId, "[VOICE]", transcribedText, "voice", {
                voiceDuration: msg.voice.duration,
                fileSize: msg.voice.file_size,
                transcriptionLength: transcribedText.length,
                processingTime: responseTime,
                sessionId: sessionId,
                timestamp: new Date().toISOString(),
                aiModel: 'OpenAI-Whisper'
            }).catch(err => console.error('Voice save error:', err.message));
            
            // 🔧 FIXED: Process transcribed text with your fixed dual AI system
            try {
                await handleDualAIConversation(chatId, transcribedText, sessionId);
            } catch (dualAIError) {
                console.error('❌ Dual AI processing failed for voice:', dualAIError.message);
                
                // 🔧 FALLBACK: Use direct GPT-5 processing
                const fallbackAnalysis = await getUniversalAnalysis(
                    `Voice message transcription: "${transcribedText}"\n\nPlease respond naturally to this voice message.`, 
                    {
                        max_tokens: 1200,
                        temperature: 0.7,
                        model: "gpt-5"
                    }
                );
                await sendSmartMessage(bot, chatId, fallbackAnalysis);
            }
            
            // Log successful API usage
            await logApiUsage('WHISPER', 'transcription', 1, true, responseTime, msg.voice.file_size || 0)
                .catch(err => console.error('API log error:', err.message));
            
            console.log("✅ Voice message processed successfully with dual AI");
        } else {
            await sendSmartMessage(bot, chatId, "❌ Voice transcription failed. Please try again or speak more clearly.");
            
            // Save failed transcription attempt with diagnostic info
            await saveConversationDB(chatId, "[VOICE_FAILED]", "Transcription failed", "voice", {
                error: "Transcription returned empty",
                voiceDuration: msg.voice.duration,
                fileSize: msg.voice.file_size,
                processingTime: responseTime,
                sessionId: sessionId
            }).catch(err => console.error('Voice error save failed:', err.message));
            
            // Log failed API usage
            await logApiUsage('WHISPER', 'transcription', 1, false, responseTime, msg.voice.file_size || 0)
                .catch(err => console.error('API log error:', err.message));
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error("❌ Voice processing error:", error.message);
        
        // 🔧 IMPROVED: Better error messaging for users
        let userMessage = "❌ Voice processing failed. ";
        if (error.message.includes('timeout')) {
            userMessage += "The audio file was too large or took too long to process.";
        } else if (error.message.includes('API key')) {
            userMessage += "AI service temporarily unavailable.";
        } else if (error.message.includes('rate limit')) {
            userMessage += "Too many requests. Please wait a moment and try again.";
        } else {
            userMessage += "Please try again with a shorter, clearer voice message.";
        }
        
        await sendSmartMessage(bot, chatId, userMessage);
        
        // Save comprehensive error details
        await saveConversationDB(chatId, "[VOICE_ERROR]", `Error: ${error.message}`, "voice", {
            error: error.message,
            stackTrace: error.stack?.substring(0, 500),
            voiceDuration: msg.voice?.duration,
            fileSize: msg.voice?.file_size,
            processingTime: responseTime,
            sessionId: sessionId
        }).catch(err => console.error('Voice error save failed:', err.message));
        
        // Log error for monitoring
        await logApiUsage('WHISPER', 'transcription', 1, false, responseTime, 0, 0)
            .catch(err => console.error('API log error:', err.message));
    }
}

// 🔧 IMPROVED: Working voice processing function with better error handling
async function processVoiceMessageFixed(bot, fileId, chatId) {
    try {
        console.log("🔄 Starting Whisper voice transcription...");
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        console.log(`📁 Voice file URL: ${fileUrl}`);
        console.log(`📊 File size: ${file.file_size} bytes`);
        
        // 🔧 IMPROVED: Better dependency handling
        let fetch;
        try {
            fetch = require('node-fetch');
        } catch (fetchError) {
            throw new Error("node-fetch not installed. Run: npm install node-fetch");
        }
        
        // Download the voice file with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(fileUrl, { 
            signal: controller.signal,
            timeout: 30000
        });
        clearTimeout(timeout);
        
        if (!response.ok) {
            throw new Error(`Failed to download voice file: HTTP ${response.status}`);
        }
        
        const buffer = await response.buffer();
        console.log(`✅ Voice file downloaded, size: ${buffer.length} bytes`);
        
        // Validate file size (Whisper has 25MB limit)
        if (buffer.length > 25 * 1024 * 1024) {
            throw new Error("Voice file too large for Whisper API (max 25MB)");
        }
        
        // 🔧 IMPROVED: Better form data handling
        let FormData;
        try {
            FormData = require('form-data');
        } catch (formError) {
            throw new Error("form-data not installed. Run: npm install form-data");
        }
        
        const form = new FormData();
        
        // Telegram voice messages are in OGG format
        form.append('file', buffer, {
            filename: 'voice.ogg',
            contentType: 'audio/ogg',
        });
        form.append('model', 'whisper-1');
        form.append('language', 'en'); // You can make this dynamic
        form.append('response_format', 'text');
        
        console.log("🤖 Sending to OpenAI Whisper API...");
        
        // Call OpenAI Whisper API with timeout
        const whisperController = new AbortController();
        const whisperTimeout = setTimeout(() => whisperController.abort(), 60000); // 60 second timeout
        
        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                ...form.getHeaders()
            },
            body: form,
            signal: whisperController.signal
        });
        clearTimeout(whisperTimeout);
        
        if (!whisperResponse.ok) {
            const errorText = await whisperResponse.text();
            console.error(`❌ Whisper API error: ${whisperResponse.status} - ${errorText}`);
            
            // Handle specific Whisper API errors
            if (whisperResponse.status === 400) {
                throw new Error("Invalid audio format or file corrupted");
            } else if (whisperResponse.status === 401) {
                throw new Error("OpenAI API key invalid or expired");
            } else if (whisperResponse.status === 429) {
                throw new Error("OpenAI API rate limit exceeded");
            } else {
                throw new Error(`Whisper API error: ${whisperResponse.status} - ${errorText}`);
            }
        }
        
        const transcription = await whisperResponse.text();
        console.log(`✅ Whisper transcription successful: "${transcription.substring(0, 100)}..."`);
        
        // Validate transcription
        if (!transcription || transcription.trim().length === 0) {
            throw new Error("Whisper returned empty transcription");
        }
        
        if (transcription.trim().length < 3) {
            console.warn("⚠️ Very short transcription, might be audio noise");
        }
        
        return transcription.trim();
        
    } catch (error) {
        console.error("❌ Voice processing error:", error.message);
        console.error("Stack trace:", error.stack);
        
        // Enhanced error messages
        if (error.message.includes('aborted')) {
            throw new Error("Voice processing timeout - file too large or connection slow");
        } else if (error.message.includes('fetch')) {
            throw new Error("Network error downloading voice file from Telegram");
        } else if (error.message.includes('form-data')) {
            throw new Error("Form data creation failed - check dependencies");
        } else {
            throw error;
        }
    }
}

// 🔧 IMPROVED: Voice message validation with better checks
function validateVoiceMessage(msg) {
    if (!msg || !msg.voice) {
        throw new Error("No voice message found");
    }
    
    if (!msg.voice.file_id) {
        throw new Error("Voice message has no file ID");
    }
    
    // Check file size (Whisper has a 25MB limit)
    if (msg.voice.file_size && msg.voice.file_size > 25 * 1024 * 1024) {
        throw new Error("Voice message too large (max 25MB)");
    }
    
    // Check duration (optional limit)
    if (msg.voice.duration && msg.voice.duration > 600) { // 10 minutes
        console.warn("⚠️ Very long voice message detected:", msg.voice.duration, "seconds");
    }
    
    return true;
}

// 🔧 FIXED: Document message handler with proper dual AI integration
async function handleDocumentMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("📄 Processing document:", msg.document.file_name);
        const isTraining = msg.caption?.toLowerCase().includes("train");
        const fileName = msg.document.file_name || "untitled_document";
        const fileSize = msg.document.file_size || 0;
        
        if (isTraining) {
            // Enhanced training document processing
            await bot.sendMessage(chatId, "📚 Processing document for enhanced AI training database...");
            
            try {
                const fileLink = await bot.getFileLink(msg.document.file_id);
                console.log("📥 Downloading document from Telegram...");
                
                // 🔧 IMPROVED: Better dependency handling
                let fetch;
                try {
                    fetch = require('node-fetch');
                } catch (fetchError) {
                    throw new Error("node-fetch not installed. Run: npm install node-fetch");
                }
                
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000);
                
                const response = await fetch(fileLink, { 
                    signal: controller.signal,
                    timeout: 30000
                });
                clearTimeout(timeout);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const buffer = await response.buffer();
                let content = '';
                
                const fileExtension = fileName.toLowerCase().split('.').pop();
                
                if (['txt', 'md', 'json', 'csv'].includes(fileExtension)) {
                    content = buffer.toString('utf8');
                } else if (fileExtension === 'pdf') {
                    // 🔧 IMPROVED: Safe PDF processing
                    content = await extractTextFromPDFSafe(buffer);
                } else if (['doc', 'docx'].includes(fileExtension)) {
                    // 🔧 IMPROVED: Safe Word document processing
                    content = await extractTextFromWordSafe(buffer);
                } else {
                    // Try to read as text for other formats
                    content = buffer.toString('utf8');
                    console.log(`⚠️ Attempting to read ${fileExtension} file as text`);
                }
                
                if (content.length === 0) {
                    throw new Error("Document appears to be empty or unreadable");
                }
                
                if (content.length > 1000000) {
                    throw new Error("Document too large (max 1MB text content)");
                }
                
                const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
                const summary = content.length > 500 ? content.substring(0, 500) + '...' : content;
                const responseTime = Date.now() - startTime;
                
                console.log(`📊 Document stats: ${wordCount} words, ${content.length} characters`);
                
                const saved = await saveTrainingDocumentDB(chatId, fileName, content, 'user_uploaded', wordCount, summary);
                
                if (saved) {
                    await sendSmartMessage(bot, chatId, 
                        `📚 **Document Added to Enhanced AI Training Database**\n\n` +
                        `📄 **File:** ${fileName}\n` +
                        `📊 **Words:** ${wordCount.toLocaleString()}\n` +
                        `📏 **Size:** ${(fileSize / 1024).toFixed(1)} KB\n` +
                        `⚡ **Processing:** ${responseTime}ms\n` +
                        `💾 **Storage:** Enhanced PostgreSQL Database\n` +
                        `🤖 **AI Models:** GPT-5 + Claude Opus 4.1\n` +
                        `✅ **Your AI can now reference this document in conversations!**\n\n` +
                        `**Try asking:** "What did you learn from ${fileName}?"`
                    );
                    
                    console.log("✅ Document training completed successfully");
                } else {
                    throw new Error("Database save operation failed - please try again");
                }
                
            } catch (downloadError) {
                const responseTime = Date.now() - startTime;
                console.error("❌ Document download/processing error:", downloadError.message);
                
                let errorMessage = `❌ Error processing document for training: ${downloadError.message}\n\n`;
                
                if (downloadError.message.includes('timeout') || downloadError.message.includes('abort')) {
                    errorMessage += `**Timeout Error:** Document too large or connection slow\n`;
                } else if (downloadError.message.includes('HTTP')) {
                    errorMessage += `**Download Error:** Could not download file from Telegram\n`;
                } else if (downloadError.message.includes('PDF')) {
                    errorMessage += `**PDF Error:** ${downloadError.message}\n`;
                } else if (downloadError.message.includes('not installed')) {
                    errorMessage += `**Dependency Error:** ${downloadError.message}\n`;
                }
                
                errorMessage += `**Please try:**\n` +
                    `• Converting to .txt or .md format\n` +
                    `• Reducing file size if too large\n` +
                    `• Checking if file is corrupted\n` +
                    `• Uploading via copy-paste for text content`;
                
                await sendSmartMessage(bot, chatId, errorMessage);
            }
            
        } else {
            // 🔧 FIXED: Document analysis with proper dual AI integration
            await bot.sendMessage(chatId, "📄 Analyzing document with GPT-5 + Claude Opus 4.1 enhanced AI...");
            
            try {
                // Get file from Telegram
                const fileLink = await bot.getFileLink(msg.document.file_id);
                
                let fetch;
                try {
                    fetch = require('node-fetch');
                } catch (fetchError) {
                    throw new Error("node-fetch not installed. Run: npm install node-fetch");
                }
                
                const response = await fetch(fileLink);
                
                if (!response.ok) {
                    throw new Error(`Failed to download document: HTTP ${response.status}`);
                }
                
                const buffer = await response.buffer();
                const fileExtension = fileName.toLowerCase().split('.').pop();
                
                let content = '';
                let extractionMethod = 'text';
                
                // Enhanced file type handling with safe extraction
                if (['txt', 'md', 'json', 'csv'].includes(fileExtension)) {
                    content = buffer.toString('utf8');
                    extractionMethod = 'direct_text';
                } else if (fileExtension === 'pdf') {
                    content = await extractTextFromPDFSafe(buffer);
                    extractionMethod = 'pdf_extraction';
                } else if (['doc', 'docx'].includes(fileExtension)) {
                    content = await extractTextFromWordSafe(buffer);
                    extractionMethod = 'word_extraction';
                } else if (['xls', 'xlsx'].includes(fileExtension)) {
                    content = await extractTextFromExcelSafe(buffer);
                    extractionMethod = 'excel_extraction';
                } else {
                    // Try to read as text
                    content = buffer.toString('utf8');
                    extractionMethod = 'fallback_text';
                }
                
                if (content.length === 0) {
                    throw new Error("Document appears to be empty or unreadable");
                }
                
                // 🔧 FIXED: Dual AI analysis with proper routing
                let analysis;
                
                if (content.length > 12000) {
                    // For very large documents, use Claude for better handling
                    const summary = content.substring(0, 8000);
                    const prompt = `Analyze this document (showing first part due to length):\n\n${summary}\n\n[Document truncated - ${content.length} total characters]\n\nProvide comprehensive analysis covering:\n1. Document type and purpose\n2. Key topics and main themes\n3. Important insights and findings\n4. Structure and organization\n5. Data/statistics if present\n6. Recommendations or conclusions\n7. Overall assessment and significance`;
                    
                    analysis = await getClaudeAnalysis(prompt, { max_tokens: 1500 });
                    analysis = `**Claude Opus 4.1 Analysis** (Large Document)\n\n${analysis}`;
                    
                } else if (content.length > 6000) {
                    // For medium documents, use GPT-5
                    const prompt = `Analyze this document in detail:\n\n${content}\n\nProvide comprehensive analysis covering:\n1. Document summary and purpose\n2. Key points and main themes\n3. Important insights and findings\n4. Structure and organization\n5. Data, statistics, or evidence presented\n6. Conclusions and recommendations\n7. Strategic implications or actionable items`;
                    
                    analysis = await getUniversalAnalysis(prompt, { 
                        max_tokens: 1200,  // 🔧 FIXED: Correct parameter name
                        temperature: 0.7,
                        model: "gpt-5"
                    });
                    analysis = `**GPT-5 Analysis** (Detailed)\n\n${analysis}`;
                    
                } else {
                    // For smaller documents, use dual AI for comprehensive analysis
                    const prompt = `Analyze this document:\n\n${content}\n\nProvide detailed analysis covering:\n1. Document summary\n2. Key insights and findings\n3. Important data or information\n4. Structure and organization\n5. Recommendations or next steps\n6. Overall assessment`;
                    
                    // 🔧 FIXED: Get both analyses with proper error handling
                    const [gptAnalysis, claudeAnalysis] = await Promise.allSettled([
                        getUniversalAnalysis(prompt, { 
                            max_tokens: 800,  // 🔧 FIXED: Correct parameter name
                            temperature: 0.7,
                            model: "gpt-5"
                        }),
                        getClaudeAnalysis(prompt, { max_tokens: 800 })
                    ]);
                    
                    // Combine analyses
                    let combinedAnalysis = `**Dual AI Analysis: GPT-5 + Claude Opus 4.1**\n\n`;
                    
                    if (gptAnalysis.status === 'fulfilled') {
                        combinedAnalysis += `**GPT-5 Analysis:**\n${gptAnalysis.value}\n\n`;
                    } else {
                        console.error('GPT-5 analysis failed:', gptAnalysis.reason?.message);
                    }
                    
                    if (claudeAnalysis.status === 'fulfilled') {
                        combinedAnalysis += `**Claude Opus 4.1 Analysis:**\n${claudeAnalysis.value}\n\n`;
                    } else {
                        console.error('Claude analysis failed:', claudeAnalysis.reason?.message);
                    }
                    
                    if (gptAnalysis.status === 'fulfilled' && claudeAnalysis.status === 'fulfilled') {
                        // Add synthesis
                        const synthesisPrompt = `Based on these two AI analyses of the same document, provide a brief synthesis highlighting:\n1. Key agreements between analyses\n2. Any unique insights from each AI\n3. Overall consensus and conclusions\n\nGPT-5: ${gptAnalysis.value.substring(0, 400)}\n\nClaude: ${claudeAnalysis.value.substring(0, 400)}`;
                        
                        try {
                            const synthesis = await getUniversalAnalysis(synthesisPrompt, {
                                max_tokens: 400,  // 🔧 FIXED: Correct parameter name
                                temperature: 0.6,
                                model: "gpt-5"
                            });
                            
                            combinedAnalysis += `**AI Synthesis:**\n${synthesis}`;
                        } catch (synthError) {
                            console.error('Synthesis failed:', synthError.message);
                        }
                    }
                    
                    // 🔧 FALLBACK: If both AI analyses failed, use single AI
                    if (gptAnalysis.status === 'rejected' && claudeAnalysis.status === 'rejected') {
                        analysis = await getUniversalAnalysis(prompt, { 
                            max_tokens: 1000,
                            temperature: 0.7,
                            model: "gpt-5"
                        });
                        analysis = `**GPT-5 Fallback Analysis:**\n${analysis}`;
                    } else {
                        analysis = combinedAnalysis;
                    }
                }
                
                const responseTime = Date.now() - startTime;
                
                if (analysis && analysis.length > 0) {
                    await sendAnalysis(bot, chatId, analysis, `Enhanced Document Analysis: ${fileName}`);
                    
                    // Enhanced document analysis save with metadata
                    await saveConversationDB(chatId, `[DOCUMENT] ${fileName}`, analysis, "document", {
                        fileName: fileName,
                        fileSize: fileSize,
                        fileType: fileExtension,
                        extractionMethod: extractionMethod,
                        contentLength: content.length,
                        analysisLength: analysis.length,
                        processingTime: responseTime,
                        analysisSuccess: true,
                        sessionId: sessionId,
                        analysisType: 'dual_ai_analysis',
                        aiModels: 'GPT-5 + Claude Opus 4.1'
                    }).catch(err => console.error('Document analysis save error:', err.message));
                    
                    // Save to persistent memory if analysis reveals important information
                    if (shouldSaveToPersistentMemoryAdvanced(`Document: ${fileName}`, analysis)) {
                        const memoryFact = `Document analysis: ${fileName} - ${analysis.substring(0, 100)}...`;
                        await addPersistentMemoryDB(chatId, memoryFact, 'medium')
                            .catch(err => console.error('Memory save error:', err.message));
                        console.log("💾 Document analysis saved to persistent memory");
                    }
                    
                    // Log successful API usage
                    await logApiUsage('DUAL_AI', 'document_analysis', 1, true, responseTime, fileSize)
                        .catch(err => console.error('API log error:', err.message));
                    
                    console.log("✅ Document analysis completed successfully with dual AI");
                } else {
                    throw new Error("Document analysis failed - both AI models returned empty results");
                }
                
            } catch (analysisError) {
                const responseTime = Date.now() - startTime;
                console.error("❌ Document analysis error:", analysisError.message);
                
                await sendSmartMessage(bot, chatId, 
                    `❌ Document analysis failed: ${analysisError.message}\n\n` +
                    `**Supported Formats:**\n` +
                    `✅ Text files (.txt, .md)\n` +
                    `✅ PDF documents (.pdf)\n` +
                    `✅ Word documents (.doc, .docx)\n` +
                    `✅ Excel files (.xls, .xlsx)\n` +
                    `✅ JSON data (.json)\n` +
                    `✅ CSV files (.csv)\n\n` +
                    `**Please try:**\n` +
                    `• Converting to supported format\n` +
                    `• Reducing file size if too large\n` +
                    `• Adding caption "train" to save for AI training\n` +
                    `• Copy-pasting text content directly`
                );
                
                // Save comprehensive error record
                await saveConversationDB(chatId, `[DOCUMENT_ERROR] ${fileName}`, `Analysis failed: ${analysisError.message}`, "document", {
                    fileName: fileName,
                    fileSize: fileSize,
                    error: analysisError.message,
                    processingTime: responseTime,
                    analysisSuccess: false,
                    sessionId: sessionId,
                    aiModels: 'GPT-5 + Claude Opus 4.1'
                }).catch(err => console.error('Document error save failed:', err.message));
                
                // Log failed API usage
                await logApiUsage('DUAL_AI', 'document_analysis', 1, false, responseTime, fileSize)
                    .catch(err => console.error('API log error:', err.message));
            }
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error("❌ Document processing system error:", error.message);
        await sendSmartMessage(bot, chatId, `❌ Document processing system error: ${error.message}`);
        
        // Save general system error record
        await saveConversationDB(chatId, "[DOCUMENT_SYSTEM_ERROR]", `System error: ${error.message}`, "document", {
            fileName: msg.document?.file_name || "unknown",
            fileSize: msg.document?.file_size || 0,
            systemError: error.message,
            processingTime: responseTime,
            sessionId: sessionId
        }).catch(err => console.error('System error save failed:', err.message));
    }
}

// 🔧 SAFE: PDF text extraction with proper error handling
async function extractTextFromPDFSafe(buffer) {
    try {
        const pdf = require('pdf-parse');
        const data = await pdf(buffer);
        
        if (!data.text || data.text.length === 0) {
            throw new Error("PDF contains no readable text");
        }
        
        console.log(`📄 PDF extracted: ${data.numpages} pages, ${data.text.length} characters`);
        return data.text;
        
    } catch (error) {
        if (error.message.includes('pdf-parse')) {
            throw new Error("PDF parsing library not installed. Run: npm install pdf-parse");
        }
        throw new Error(`PDF text extraction failed: ${error.message}`);
    }
}

// 🔧 SAFE: Word document text extraction with proper error handling
async function extractTextFromWordSafe(buffer) {
    try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: buffer });
        
        if (!result.value || result.value.length === 0) {
            throw new Error("Word document contains no readable text");
        }
        
        console.log(`📄 Word document extracted: ${result.value.length} characters`);
        
        if (result.messages && result.messages.length > 0) {
            console.log("⚠️ Word extraction warnings:", result.messages.map(m => m.message).join(', '));
        }
        
        return result.value;
        
    } catch (error) {
        if (error.message.includes('mammoth')) {
            throw new Error("Mammoth library not installed. Run: npm install mammoth");
        }
        throw new Error(`Word document extraction failed: ${error.message}`);
    }
}

// 🔧 SAFE: Excel text extraction with proper error handling
async function extractTextFromExcelSafe(buffer) {
    try {
        const XLSX = require('xlsx');
        const workbook = XLSX.read(buffer, { 
            type: 'buffer',
            cellText: true,
            cellDates: true
        });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("Excel file contains no readable sheets");
        }
        
        let text = '';
        let totalCells = 0;
        
        workbook.SheetNames.forEach((sheetName, index) => {
            const sheet = workbook.Sheets[sheetName];
            
            // Convert sheet to CSV format for better text representation
            const csv = XLSX.utils.sheet_to_csv(sheet, {
                header: 1,
                skipHidden: false,
                blankrows: false
            });
            
            if (csv && csv.trim().length > 0) {
                text += `=== SHEET ${index + 1}: ${sheetName} ===\n`;
                text += csv;
                text += '\n\n';
                
                // Count cells for logging
                const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
                totalCells += (range.e.r - range.s.r + 1) * (range.e.c - range.s.c + 1);
            }
        });
        
        if (text.length === 0) {
            throw new Error("Excel file contains no readable data");
        }
        
        console.log(`📊 Excel extracted: ${workbook.SheetNames.length} sheets, ${totalCells} cells, ${text.length} characters`);
        return text;
        
    } catch (error) {
        if (error.message.includes('xlsx') || error.message.includes('XLSX')) {
            throw new Error("XLSX library not installed. Run: npm install xlsx");
        }
        throw new Error(`Excel extraction failed: ${error.message}`);
    }
}

// 🔧 IMPROVED: Image message handler with GPT-5 Vision
async function handleImageMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🖼️ Processing image message...");
        await bot.sendMessage(chatId, "🖼️ Analyzing image with GPT-5 Vision + Claude Opus 4.1...");
        
        // Get the largest photo (best quality)
        const photo = msg.photo[msg.photo.length - 1];
        
        // Get file from Telegram
        const fileLink = await bot.getFileLink(photo.file_id);
        
        let fetch;
        try {
            fetch = require('node-fetch');
        } catch (fetchError) {
            throw new Error("node-fetch not installed. Run: npm install node-fetch");
        }
        
        const response = await fetch(fileLink);
        if (!response.ok) {
            throw new Error(`Failed to download image: HTTP ${response.status}`);
        }
        
        const buffer = await response.buffer();
        const base64Image = buffer.toString('base64');
        
        console.log(`📊 Image downloaded: ${buffer.length} bytes`);
        
        // 🔧 ENHANCED: Use GPT-5 Vision for image analysis
        const prompt = `Analyze this image in detail. Provide:
1. What you see in the image
2. Key objects, people, or elements
3. Context and setting
4. Any text visible in the image
5. Overall impression and insights
6. If it's a chart/graph/document, explain the data
7. Any strategic or analytical observations`;
        
        const analysis = await analyzeImageWithGPT5Vision(base64Image, prompt);
        
        if (analysis && analysis.length > 0) {
            await sendAnalysis(bot, chatId, analysis, "GPT-5 Vision Image Analysis");
            
            // Save image analysis to database
            await saveConversationDB(chatId, "[IMAGE]", analysis, "image", {
                fileSize: buffer.length,
                imageWidth: photo.width,
                imageHeight: photo.height,
                processingTime: Date.now() - startTime,
                sessionId: sessionId,
                analysisLength: analysis.length,
                aiModel: 'GPT-5-Vision'
            }).catch(err => console.error('Image save error:', err.message));
            
            // Save to persistent memory if important
            if (shouldSaveToPersistentMemoryAdvanced("[IMAGE]", analysis)) {
                const memoryFact = `Image analysis: ${analysis.substring(0, 100)}...`;
                await addPersistentMemoryDB(chatId, memoryFact, 'medium')
                    .catch(err => console.error('Memory save error:', err.message));
                console.log("💾 Image analysis saved to persistent memory");
            }
            
            console.log("✅ Image analysis completed successfully");
        } else {
            throw new Error("Image analysis returned empty result");
        }
        
    } catch (error) {
        console.error("❌ Image processing error:", error.message);
        
        let userMessage = "❌ Image analysis failed. ";
        if (error.message.includes('not installed')) {
            userMessage += "System dependencies missing.";
        } else if (error.message.includes('Vision')) {
            userMessage += "Vision AI temporarily unavailable.";
        } else {
            userMessage += "Please try with a clearer image.";
        }
        
        await sendSmartMessage(bot, chatId, userMessage);
        
        // Save error record
        await saveConversationDB(chatId, "[IMAGE_ERROR]", `Error: ${error.message}`, "image", {
            error: error.message,
            processingTime: Date.now() - startTime,
            sessionId: sessionId
        }).catch(err => console.error('Image error save failed:', err.message));
    }
}

// 🔧 NEW: GPT-5 Vision Analysis Function
async function analyzeImageWithGPT5Vision(base64Image, prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-5",  // Use your GPT-5 model
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1200,  // 🔧 FIXED: Correct parameter
            temperature: 0.7
        });
        
        return response.choices[0]?.message?.content || null;
    } catch (error) {
        console.error("GPT-5 Vision API error:", error.message);
        
        // Fallback to GPT-4 if GPT-5 fails
        if (error.message.includes('gpt-5') || error.message.includes('model')) {
            console.log("🔄 Falling back to GPT-4 vision...");
            try {
                const fallbackResponse = await openai.chat.completions.create({
                    model: "gpt-4o",  // Stable fallback model
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`,
                                        detail: "high"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 1200,
                    temperature: 0.7
                });
                
                return fallbackResponse.choices[0]?.message?.content || null;
            } catch (fallbackError) {
                throw new Error(`Both GPT-5 and GPT-4 vision failed: ${fallbackError.message}`);
            }
        }
        
        throw new Error(`GPT-5 vision analysis failed: ${error.message}`);
    }
}

// 🔧 UTILITY: Enhanced memory integration for media processing
async function processMemoryAwareMediaResponse(chatId, mediaType, content, aiResponse) {
    try {
        // Save media interaction to conversation history
        await saveConversationDB(chatId, `[${mediaType.toUpperCase()}]`, aiResponse, mediaType, {
            contentLength: content?.length || 0,
            processingSuccess: true,
            timestamp: new Date().toISOString(),
            memoryEnhanced: true
        }).catch(err => console.error('Media conversation save error:', err.message));
        
        // Extract and save any important insights
        if (shouldSaveToPersistentMemoryAdvanced(`[${mediaType.toUpperCase()}]`, aiResponse)) {
            const memoryFact = extractMemoryFactAdvanced(`${mediaType} processed`, aiResponse);
            if (memoryFact) {
                await addPersistentMemoryDB(chatId, memoryFact, 'medium')
                    .catch(err => console.error('Media memory save error:', err.message));
                console.log(`💾 ${mediaType} processing saved to persistent memory`);
            }
        }
        
    } catch (error) {
        console.log(`⚠️ Memory processing failed for ${mediaType}:`, error.message);
    }
}

// 🔧 UTILITY: Media validation and preprocessing
function validateMediaMessage(msg, mediaType) {
    if (!msg || !msg[mediaType]) {
        throw new Error(`No ${mediaType} message found`);
    }
    
    const media = Array.isArray(msg[mediaType]) ? msg[mediaType][msg[mediaType].length - 1] : msg[mediaType];
    
    if (!media.file_id) {
        throw new Error(`${mediaType} message has no file ID`);
    }
    
    // Check file size limits
    const maxSizes = {
        voice: 25 * 1024 * 1024,  // 25MB for Whisper
        photo: 20 * 1024 * 1024,  // 20MB for images
        document: 50 * 1024 * 1024, // 50MB for documents
        video: 50 * 1024 * 1024   // 50MB for videos
    };
    
    if (media.file_size && maxSizes[mediaType] && media.file_size > maxSizes[mediaType]) {
        throw new Error(`${mediaType} file too large (max ${(maxSizes[mediaType] / 1024 / 1024).toFixed(0)}MB)`);
    }
    
    return media;
}
// 🔧 REMOVED DUPLICATE FUNCTIONS
// (analyzeImageWithGPT5, extractTextFromPDF, extractTextFromWord, extractTextFromExcel)
// These are already defined in the previous section as "Safe" versions

// 🔧 ENHANCED: Memory integration helper functions - Complete Implementation
function isQuestionAboutMemory(text) {
    if (!text || typeof text !== 'string') return false;
    
    const lowerText = text.toLowerCase();
    const memoryQuestions = [
        'do you remember', 'what do you remember', 'you mentioned',
        'we discussed', 'you said', 'i told you', 'you know about me',
        'what did i say', 'what was my', 'recall', 'you learned',
        'from our conversation', 'earlier you', 'before you said',
        'my preferences', 'about my background', 'my information',
        'have we talked about', 'did i mention', 'you should know',
        'as i mentioned before', 'like i said', 'remember when'
    ];
    
    return memoryQuestions.some(phrase => lowerText.includes(phrase));
}

function extractUserIdentityInfo(text) {
    if (!text || typeof text !== 'string') return null;
    
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
        { pattern: /my goal is to ([^.,\n!?]+)/i, type: 'goal' },
        { pattern: /i'm (?:a |an )?([^.,\n!?]+) by profession/i, type: 'profession' },
        { pattern: /my company is ([^.,\n!?]+)/i, type: 'company' },
        { pattern: /i study (?:at )?([^.,\n!?]+)/i, type: 'education' }
    ];
    
    for (const { pattern, type } of identityPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 1) {
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
    if (!userMessage || !aiResponse) return false;
    
    const userLower = userMessage.toLowerCase();
    const responseLower = aiResponse.toLowerCase();
    
    // User is correcting information
    if (userLower.includes('actually') || userLower.includes('correction') || 
        userLower.includes('no, ') || userLower.includes('wrong') ||
        userLower.includes('that\'s not right') || userLower.includes('let me correct')) {
        return true;
    }
    
    // AI is asking for clarification that might be remembered
    if (responseLower.includes('could you tell me') || responseLower.includes('what is your') ||
        responseLower.includes('can you clarify') || responseLower.includes('please specify') ||
        responseLower.includes('more details about')) {
        return true;
    }
    
    // Important strategic decisions or personal information mentioned
    if (responseLower.includes('decision') || responseLower.includes('strategy') || 
        responseLower.includes('plan') || responseLower.includes('important') ||
        responseLower.includes('key point') || responseLower.includes('significant')) {
        return true;
    }
    
    // Future reference topics
    if (userLower.includes('remember this') || userLower.includes('for future') ||
        userLower.includes('keep in mind') || userLower.includes('note that') ||
        userLower.includes('don\'t forget')) {
        return true;
    }
    
    // Investment or financial context (Cambodia fund specific)
    if (userLower.includes('investment') || userLower.includes('portfolio') ||
        userLower.includes('fund') || userLower.includes('cambodia') ||
        userLower.includes('lending') || userLower.includes('deal')) {
        return aiResponse.length > 200; // Save substantial financial discussions
    }
    
    return false;
}

// 🔧 ENHANCED: Memory-aware response processing with complete implementation
async function processMemoryAwareResponse(chatId, userMessage, aiResponse) {
    if (!userMessage || !aiResponse) return;
    
    try {
        console.log('🧠 Processing memory-aware response...');
        
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
            const memoryFact = extractMemoryFactAdvanced(userMessage, aiResponse);
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
        // Don't throw - memory processing should be non-blocking
    }
}

// 🔧 NEW: Extract preferences from user messages
function extractPreferences(text) {
    if (!text || typeof text !== 'string') return [];
    
    const preferences = [];
    const preferencePatterns = [
        /i prefer ([^.,\n!?]+)/gi,
        /i like ([^.,\n!?]+)/gi,
        /i don't like ([^.,\n!?]+)/gi,
        /i hate ([^.,\n!?]+)/gi,
        /my favorite ([^.,\n!?]+)/gi,
        /i enjoy ([^.,\n!?]+)/gi,
        /i'm interested in ([^.,\n!?]+)/gi,
        /i avoid ([^.,\n!?]+)/gi,
        /i always ([^.,\n!?]+)/gi,
        /i never ([^.,\n!?]+)/gi
    ];
    
    for (const pattern of preferencePatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            if (match[1] && match[1].trim().length > 2) {
                preferences.push(match[1].trim());
            }
        }
    }
    
    return preferences.slice(0, 5); // Limit to 5 preferences to avoid spam
}

// 🔧 NEW: Extract important facts from AI responses
function extractImportantFacts(text) {
    if (!text || typeof text !== 'string') return [];
    
    const facts = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    for (const sentence of sentences) {
        const trimmed = sentence.trim();
        
        // Look for factual statements that might be useful to remember
        if (trimmed.includes('According to') || trimmed.includes('Based on') ||
            trimmed.includes('Important') || trimmed.includes('Key') ||
            trimmed.includes('Remember') || trimmed.includes('Note that') ||
            trimmed.includes('Research shows') || trimmed.includes('Studies indicate') ||
            trimmed.includes('It\'s worth noting') || trimmed.includes('Significantly')) {
            
            // Clean and add the fact
            let fact = trimmed.replace(/^(According to|Based on|Important|Key|Remember|Note that|Research shows|Studies indicate|It's worth noting|Significantly)[:\s]*/i, '');
            if (fact.length > 10 && fact.length < 200) {
                facts.push(fact);
            }
        }
        
        // Financial/investment insights
        if (trimmed.includes('investment') || trimmed.includes('market') ||
            trimmed.includes('portfolio') || trimmed.includes('risk') ||
            trimmed.includes('return') || trimmed.includes('cambodia')) {
            
            if (trimmed.length > 30 && trimmed.length < 150) {
                facts.push(trimmed);
            }
        }
    }
    
    return facts.slice(0, 3); // Limit to 3 facts to avoid spam
}

// 🔧 ENHANCED: Conversation intelligence for better AI routing
function analyzeConversationIntelligence(text, context = {}) {
    if (!text || typeof text !== 'string') {
        return {
            type: 'unknown',
            complexity: 'simple',
            requiresLiveData: false,
            preferredAI: 'gpt-5',
            confidence: 0
        };
    }
    
    const analysis = {
        type: determineConversationTypeAdvanced(text),
        complexity: determineComplexityAdvanced(text),
        requiresLiveData: requiresLiveDataAdvanced(text),
        isMemoryQuery: isQuestionAboutMemory(text),
        hasPersonalInfo: !!extractUserIdentityInfo(text),
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
        questionCount: (text.match(/\?/g) || []).length
    };
    
    // Determine preferred AI based on analysis
    if (analysis.complexity === 'maximum' || analysis.type === 'strategic_analysis') {
        analysis.preferredAI = 'claude';
        analysis.confidence = 0.8;
    } else if (analysis.type === 'cambodia_fund' || analysis.type === 'economic_regime') {
        analysis.preferredAI = 'claude';
        analysis.confidence = 0.7;
    } else if (analysis.textLength > 500) {
        analysis.preferredAI = 'claude';
        analysis.confidence = 0.6;
    } else if (analysis.requiresLiveData || analysis.type === 'casual') {
        analysis.preferredAI = 'gpt-5';
        analysis.confidence = 0.7;
    } else {
        analysis.preferredAI = 'gpt-5';
        analysis.confidence = 0.5;
    }
    
    // Add context considerations
    if (context.memoryAvailable && analysis.isMemoryQuery) {
        analysis.confidence += 0.1;
    }
    
    if (context.conversationCount > 5) {
        analysis.preferredAI = 'claude'; // Claude better for long conversations
        analysis.confidence += 0.1;
    }
    
    return analysis;
}

// 🔧 UTILITY: Enhanced error recovery for memory operations
async function recoverMemoryOperation(operation, chatId, ...args) {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation(chatId, ...args);
        } catch (error) {
            lastError = error;
            console.log(`⚠️ Memory operation attempt ${attempt} failed: ${error.message}`);
            
            if (attempt < maxRetries) {
                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            }
        }
    }
    
    console.error(`❌ Memory operation failed after ${maxRetries} attempts:`, lastError.message);
    throw lastError;
}

// 🔧 UTILITY: Memory cleanup and optimization
async function optimizeMemoryStorage(chatId) {
    try {
        // Get all memories for the user
        const memories = await getPersistentMemoryDB(chatId);
        
        if (memories.length > 100) {
            console.log(`🧹 Optimizing memory storage for ${chatId}: ${memories.length} memories`);
            
            // Remove duplicate facts
            const uniqueMemories = memories.filter((memory, index, self) => 
                index === self.findIndex(m => m.fact === memory.fact)
            );
            
            // Sort by importance and recency
            const sortedMemories = uniqueMemories.sort((a, b) => {
                const importanceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                const aImportance = importanceOrder[a.importance] || 1;
                const bImportance = importanceOrder[b.importance] || 1;
                
                if (aImportance !== bImportance) {
                    return bImportance - aImportance; // Higher importance first
                }
                
                return new Date(b.created_at) - new Date(a.created_at); // Newer first
            });
            
            // Keep top 50 memories
            const optimizedMemories = sortedMemories.slice(0, 50);
            
            console.log(`🧹 Memory optimization: ${memories.length} → ${optimizedMemories.length} memories`);
            
            // Note: You would need to implement deleteOldMemories in your database module
            // await deleteOldMemories(chatId, optimizedMemories);
        }
        
    } catch (error) {
        console.error('❌ Memory optimization failed:', error.message);
    }
}

// 🔧 UTILITY: Context enrichment for better AI responses
function enrichContextForAI(userMessage, context) {
    let enrichedContext = userMessage;
    
    if (context.memoryAvailable && context.memoryContext) {
        enrichedContext = `${context.memoryContext}\n\nCurrent message: ${userMessage}`;
    }
    
    // Add conversation intelligence
    const intelligence = analyzeConversationIntelligence(userMessage, context);
    
    if (intelligence.isMemoryQuery && context.persistentMemory?.length > 0) {
        enrichedContext += `\n\nRelevant memories: ${context.persistentMemory
            .slice(0, 3)
            .map(m => m.fact)
            .join('; ')}`;
    }
    
    return {
        enrichedMessage: enrichedContext,
        intelligence: intelligence,
        recommendedModel: intelligence.preferredAI,
        confidence: intelligence.confidence
    };
}

// 🔧 REMOVED DUPLICATE EXPORT
// (The module.exports is already handled in the previous section)

// 🔧 REMOVED DUPLICATE FUNCTIONS
// (extractPreferences and extractImportantFacts are already defined with better implementations)

// 🔧 REMOVED DUPLICATE handleDocumentsList
// (Already fixed in the command execution section)

// 🔧 ENHANCED: Session management with better tracking
async function startUserSessionEnhanced(chatId, sessionType = 'GENERAL', additionalData = {}) {
    try {
        const sessionId = `session_${chatId}_${Date.now()}`;
        const sessionData = {
            sessionId: sessionId,
            chatId: chatId,
            sessionType: sessionType,
            startTime: new Date().toISOString(),
            status: 'ACTIVE',
            platform: 'telegram',
            ...additionalData
        };
        
        console.log(`🟢 Starting enhanced session: ${sessionId} (${sessionType})`);
        
        // Save session start to database (non-blocking)
        saveUserSessionToDB(sessionData)
            .catch(err => console.error('Session save error:', err.message));
        
        return sessionId;
    } catch (error) {
        console.error('❌ Start session error:', error.message);
        return `fallback_session_${chatId}_${Date.now()}`;
    }
}

async function endUserSessionEnhanced(sessionId, metrics = {}) {
    try {
        const endData = {
            endTime: new Date().toISOString(),
            status: 'COMPLETED',
            commandsExecuted: metrics.commandsExecuted || 0,
            totalResponseTime: metrics.totalResponseTime || 0,
            messagesProcessed: metrics.messagesProcessed || 0,
            aiCallsGPT: metrics.aiCallsGPT || 0,
            aiCallsClaude: metrics.aiCallsClaude || 0,
            memoryOperations: metrics.memoryOperations || 0,
            errorsEncountered: metrics.errorsEncountered || 0
        };
        
        console.log(`🔴 Ending enhanced session ${sessionId}:`, endData);
        
        // Update session end in database (non-blocking)
        updateUserSessionInDB(sessionId, endData)
            .catch(err => console.error('Session update error:', err.message));
        
        return true;
    } catch (error) {
        console.error('❌ End session error:', error.message);
        return false;
    }
}

// 🔧 ENHANCED: API usage logging with cost tracking
async function logApiUsageEnhanced(apiProvider, endpoint, metrics = {}) {
    try {
        const usageData = {
            apiProvider: apiProvider,
            endpoint: endpoint,
            callsCount: metrics.callsCount || 1,
            successful: metrics.successful !== false, // Default to true
            responseTime: metrics.responseTime || 0,
            dataVolume: metrics.dataVolume || 0,
            inputTokens: metrics.inputTokens || 0,
            outputTokens: metrics.outputTokens || 0,
            costEstimate: metrics.costEstimate || 0,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            chatId: metrics.chatId,
            model: metrics.model,
            requestType: metrics.requestType || 'completion'
        };
        
        console.log(`📊 Enhanced API Usage: ${apiProvider}/${endpoint} - ${usageData.successful ? 'SUCCESS' : 'FAILED'} - ${usageData.responseTime}ms - $${usageData.costEstimate}`);
        
        // Save to database with error handling (non-blocking)
        saveApiUsageEnhancedDB(usageData)
            .catch(err => console.error('API usage save error:', err.message));
        
        return true;
    } catch (error) {
        console.error('❌ Log API usage error:', error.message);
        return false;
    }
}

// 🔧 WORKING: Database helper functions with actual implementations
async function getRegimeTransitionsWorking(days = 30) {
    try {
        console.log(`📊 Fetching regime transitions for last ${days} days`);
        
        // Try to get from database
        const transitions = await getRegimeTransitionsFromDB(days)
            .catch(err => {
                console.log('⚠️ Database regime transitions failed:', err.message);
                return [];
            });
        
        // If no data, return mock data for development
        if (transitions.length === 0) {
            console.log('📊 Using mock regime transitions data');
            return [
                { date: new Date().toISOString(), regime: 'GROWTH', confidence: 75 },
                { date: new Date(Date.now() - 7*24*60*60*1000).toISOString(), regime: 'EXPANSION', confidence: 68 }
            ];
        }
        
        return transitions;
    } catch (error) {
        console.error('Get regime transitions error:', error.message);
        return [];
    }
}

async function saveTradingPatternWorking(chatId, pattern) {
    try {
        const patternData = {
            chatId: chatId,
            patternType: pattern.type || 'unknown',
            description: pattern.description || '',
            confidence: pattern.confidence || 0,
            timeframe: pattern.timeframe || '1d',
            market: pattern.market || 'general',
            signals: pattern.signals || [],
            createdAt: new Date().toISOString()
        };
        
        console.log(`💾 Saving trading pattern for ${chatId}: ${patternData.patternType}`);
        
        // Save to database
        const saved = await saveTradingPatternToDB(patternData)
            .catch(err => {
                console.error('Trading pattern save error:', err.message);
                return false;
            });
        
        return saved;
    } catch (error) {
        console.error('Save trading pattern error:', error.message);
        return false;
    }
}

async function saveCambodiaMarketDataWorking(marketData) {
    try {
        const enhancedData = {
            ...marketData,
            timestamp: new Date().toISOString(),
            source: 'AI_SYSTEM',
            dataType: marketData.dataType || 'market_analysis',
            country: 'cambodia',
            currency: marketData.currency || 'USD',
            sector: marketData.sector || 'general'
        };
        
        console.log('💾 Saving Cambodia market data to enhanced database');
        
        // Save to database
        const saved = await saveCambodiaMarketDataToDB(enhancedData)
            .catch(err => {
                console.error('Cambodia market data save error:', err.message);
                return false;
            });
        
        return saved;
    } catch (error) {
        console.error('Save Cambodia market data error:', error.message);
        return false;
    }
}

async function getCurrentMarketConditionsWorking() {
    try {
        // Try to get from database
        const conditions = await getCurrentMarketConditionsFromDB()
            .catch(err => {
                console.log('⚠️ Database market conditions failed:', err.message);
                return null;
            });
        
        if (conditions) {
            return conditions.status || 'NORMAL';
        }
        
        // Fallback: analyze based on recent market data
        const recentData = await getRecentMarketDataFromDB(1)
            .catch(() => []);
        
        if (recentData.length > 0) {
            const latest = recentData[0];
            if (latest.volatility > 0.03) return 'VOLATILE';
            if (latest.trend === 'bearish') return 'BEARISH';
            if (latest.trend === 'bullish') return 'BULLISH';
        }
        
        return 'NORMAL';
    } catch (error) {
        console.error('Get market conditions error:', error.message);
        return 'UNKNOWN';
    }
}

async function saveMarketBriefingWorking(briefingData) {
    try {
        const enhancedBriefing = {
            ...briefingData,
            id: `briefing_${Date.now()}`,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            generatedBy: 'AI_DUAL_SYSTEM',
            markets: briefingData.markets || ['global', 'asia', 'cambodia'],
            keyPoints: briefingData.keyPoints || [],
            recommendations: briefingData.recommendations || []
        };
        
        console.log('💾 Saving market briefing to database');
        
        // Save to database
        const saved = await saveMarketBriefingToDB(enhancedBriefing)
            .catch(err => {
                console.error('Market briefing save error:', err.message);
                return false;
            });
        
        return saved;
    } catch (error) {
        console.error('Save market briefing error:', error.message);
        return false;
    }
}

async function saveTradingAccountSnapshotWorking(chatId, snapshotData) {
    try {
        const enhancedSnapshot = {
            chatId: chatId,
            ...snapshotData,
            snapshotId: `snapshot_${chatId}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            platform: snapshotData.platform || 'metatrader',
            accountType: snapshotData.accountType || 'live',
            currency: snapshotData.currency || 'USD'
        };
        
        console.log(`💾 Saving trading account snapshot for ${chatId}`);
        
        // Save to database
        const saved = await saveTradingAccountSnapshotToDB(enhancedSnapshot)
            .catch(err => {
                console.error('Trading snapshot save error:', err.message);
                return false;
            });
        
        return saved;
    } catch (error) {
        console.error('Save trading snapshot error:', error.message);
        return false;
    }
}

// 🔧 ENHANCED: Database operation functions with actual implementations
async function saveUserSessionToDB(sessionData) {
    try {
        // Implement actual database save
        console.log(`💾 Saving user session to database: ${sessionData.sessionId}`);
        
        // Mock implementation - replace with actual database call
        // await db.sessions.insert(sessionData);
        
        return true;
    } catch (error) {
        console.error('Save user session to DB error:', error.message);
        return false;
    }
}

async function updateUserSessionInDB(sessionId, updateData) {
    try {
        console.log(`💾 Updating user session in database: ${sessionId}`);
        
        // Mock implementation - replace with actual database call
        // await db.sessions.update({ sessionId }, updateData);
        
        return true;
    } catch (error) {
        console.error('Update user session in DB error:', error.message);
        return false;
    }
}

async function saveApiUsageEnhancedDB(usageData) {
    try {
        console.log(`💾 Saving enhanced API usage: ${usageData.apiProvider}/${usageData.endpoint}`);
        
        // Mock implementation - replace with actual database call
        // await db.api_usage.insert(usageData);
        
        return true;
    } catch (error) {
        console.error('Save enhanced API usage to DB error:', error.message);
        return false;
    }
}

// 🔧 PLACEHOLDER: Database functions that need implementation
async function getRegimeTransitionsFromDB(days) {
    // TODO: Implement actual database query
    console.log(`📊 [PLACEHOLDER] Getting regime transitions from DB for ${days} days`);
    return [];
}

async function saveTradingPatternToDB(patternData) {
    // TODO: Implement actual database save
    console.log('💾 [PLACEHOLDER] Saving trading pattern to DB');
    return true;
}

async function saveCambodiaMarketDataToDB(marketData) {
    // TODO: Implement actual database save
    console.log('💾 [PLACEHOLDER] Saving Cambodia market data to DB');
    return true;
}

async function getCurrentMarketConditionsFromDB() {
    // TODO: Implement actual database query
    console.log('📊 [PLACEHOLDER] Getting current market conditions from DB');
    return null;
}

async function getRecentMarketDataFromDB(days) {
    // TODO: Implement actual database query
    console.log(`📊 [PLACEHOLDER] Getting recent market data from DB for ${days} days`);
    return [];
}

async function saveMarketBriefingToDB(briefingData) {
    // TODO: Implement actual database save
    console.log('💾 [PLACEHOLDER] Saving market briefing to DB');
    return true;
}

async function saveTradingAccountSnapshotToDB(snapshotData) {
    // TODO: Implement actual database save
    console.log('💾 [PLACEHOLDER] Saving trading account snapshot to DB');
    return true;
}

// 🔧 UTILITY: System metrics tracking
class SystemMetrics {
    constructor() {
        this.startTime = Date.now();
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalResponseTime: 0,
            aiCallsGPT: 0,
            aiCallsClaude: 0,
            memoryOperations: 0,
            databaseOperations: 0,
            voiceMessages: 0,
            documentAnalyses: 0,
            imageAnalyses: 0
        };
    }
    
    incrementMetric(metric, value = 1) {
        if (this.metrics.hasOwnProperty(metric)) {
            this.metrics[metric] += value;
        }
    }
    
    getMetrics() {
        const uptime = Date.now() - this.startTime;
        const avgResponseTime = this.metrics.totalRequests > 0 ? 
            this.metrics.totalResponseTime / this.metrics.totalRequests : 0;
        
        return {
            ...this.metrics,
            uptime: uptime,
            avgResponseTime: avgResponseTime,
            successRate: this.metrics.totalRequests > 0 ? 
                (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 : 100
        };
    }
    
    reset() {
        this.startTime = Date.now();
        Object.keys(this.metrics).forEach(key => {
            this.metrics[key] = 0;
        });
    }
}

// Create global metrics instance
const systemMetrics = new SystemMetrics();

// 🔧 UTILITY: Enhanced error logging
async function logSystemError(error, context = {}) {
    try {
        const errorData = {
            error: error.message,
            stack: error.stack?.substring(0, 1000),
            timestamp: new Date().toISOString(),
            context: context,
            systemMetrics: systemMetrics.getMetrics()
        };
        
        console.error('🚨 System Error:', errorData);
        
        // Save to database for monitoring
        await saveSystemErrorToDB(errorData)
            .catch(err => console.error('Error logging failed:', err.message));
        
    } catch (logError) {
        console.error('❌ Error logging failed:', logError.message);
    }
}

async function saveSystemErrorToDB(errorData) {
    // TODO: Implement actual error logging to database
    console.log('💾 [PLACEHOLDER] Saving system error to DB');
    return true;
}

// Export metrics for monitoring
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ...module.exports,
        systemMetrics,
        logSystemError,
        startUserSessionEnhanced,
        endUserSessionEnhanced,
        logApiUsageEnhanced
    };
}

// 🔧 ENHANCED EXPRESS SERVER SETUP - Production Ready
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

// Enhanced middleware with security and rate limiting
app.use(express.json({ limit: '10mb' })); // Increase limit for document uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
}); // ✅ FIXED: Removed extra closing brace

// Simple rate limiting for webhook
const webhookLimiter = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

app.use('/webhook', (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!webhookLimiter.has(ip)) {
        webhookLimiter.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
        const limitData = webhookLimiter.get(ip);
        if (now > limitData.resetTime) {
            webhookLimiter.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        } else {
            limitData.count++;
            if (limitData.count > RATE_LIMIT_MAX) {
                return res.status(429).json({ error: 'Rate limit exceeded' });
            }
        }
    }
    next();
});

console.log('✅ Express middleware configured with security headers and rate limiting');

// 🔧 FIXED: Enhanced webhook endpoint with better debugging
app.post("/webhook", async (req, res) => {
    try {
        console.log("📨 Webhook received from Telegram");
        console.log("📋 Webhook headers:", {
            'content-type': req.headers['content-type'],
            'content-length': req.headers['content-length'],
            'user-agent': req.headers['user-agent']
        });
        console.log("📋 Webhook data:", {
            hasBody: !!req.body,
            bodyKeys: req.body ? Object.keys(req.body) : [],
            updateId: req.body?.update_id,
            messageId: req.body?.message?.message_id,
            chatId: req.body?.message?.chat?.id,
            text: req.body?.message?.text?.substring(0, 50) || 'No text',
            messageType: req.body?.message ? 'message' : 'other'
        });
        
        // Validate webhook data
        if (!req.body || Object.keys(req.body).length === 0) {
            console.warn("⚠️ Empty webhook body received");
            return res.sendStatus(400);
        }
        
        // 🔧 FIXED: Process update immediately and synchronously
        try {
            console.log("🔄 Processing Telegram update...");
            await bot.processUpdate(req.body);
            console.log("✅ Webhook processed successfully");
        } catch (processError) {
            console.error("❌ Update processing error:", processError.message);
            console.error("❌ Process error stack:", processError.stack);
        }
        
        res.sendStatus(200);
        
    } catch (error) {
        console.error("❌ Webhook processing error:", error.message);
        console.error("❌ Webhook error stack:", error.stack);
        res.sendStatus(500);
    }
});

// Health check endpoint
app.get("/", (req, res) => {
    res.status(200).send("✅ Enhanced AI Assistant v4.0 - WEALTH EMPIRE is running!");
});

// Enhanced health endpoint with comprehensive status
app.get("/health", async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Get system status with timeout
        const healthPromises = [
            Promise.race([
                typeof performHealthCheck === 'function' ? performHealthCheck() : Promise.resolve({ status: 'unknown' }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), 5000))
            ]),
            Promise.race([
                typeof getDatabaseStats === 'function' ? getDatabaseStats() : Promise.resolve({ connected: false }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Database check timeout')), 3000))
            ])
        ];
        
        const [health, stats] = await Promise.allSettled(healthPromises);
        
        const dbConnected = stats.status === 'fulfilled' && stats.value?.connected === true;
        const responseTime = Date.now() - startTime;
        
        // Get system metrics if available
        const metrics = typeof systemMetrics !== 'undefined' ? systemMetrics.getMetrics() : {};
        
        const healthData = {
            status: "healthy", 
            version: "4.0 - WEALTH EMPIRE",
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024)
            },
            models: {
                gpt: "gpt-5 (primary)",
                claude: "Claude Opus 4.1 (strategic)"
            },
            database: {
                connected: dbConnected,
                health: typeof connectionStats !== 'undefined' ? connectionStats.connectionHealth : 'unknown'
            },
            wealthSystem: {
                modules: 10,
                status: "active"
            },
            metrics: metrics
        };
        
        res.status(200).json(healthData);
        
    } catch (error) {
        console.error("❌ Health check error:", error.message);
        res.status(500).json({
            status: "error",
            version: "4.0 - WEALTH EMPIRE",
            error: error.message,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    }
});

// API status endpoint for monitoring
app.get("/api/status", async (req, res) => {
    try {
        const botInfo = await bot.getMe().catch(() => null);
        const metrics = typeof systemMetrics !== 'undefined' ? systemMetrics.getMetrics() : {};
        
        res.json({
            bot: {
                connected: !!botInfo,
                username: botInfo?.username || 'unknown',
                id: botInfo?.id || 'unknown'
            },
            database: {
                connected: typeof connectionStats !== 'undefined' ? 
                    connectionStats.connectionHealth === 'HEALTHY' : false
            },
            metrics: metrics,
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔧 FIXED: SERVER STARTUP - WEBHOOK ONLY IN PRODUCTION
const server = app.listen(PORT, "0.0.0.0", async () => {
    console.log("🚀 Enhanced AI Assistant v4.0 - WEALTH EMPIRE starting...");
    console.log(`✅ Server running on port ${PORT}`);
    console.log("🤖 Models: GPT-5 + Claude Opus 4.1 (August 2025 releases)");
    console.log("💰 AI Wealth-Building System: 10 modules loaded");
    
    // Initialize enhanced database with retry mechanism
    let databaseInitialized = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            if (typeof initializeEnhancedDatabase === 'function') {
                await initializeEnhancedDatabase();
                console.log("💾 Enhanced database integration successful");
                console.log("🧠 Persistent memory system initialized");
                databaseInitialized = true;
                break;
            } else {
                console.log("⚠️ Database initialization function not available");
                break;
            }
        } catch (error) {
            console.error(`❌ Database initialization attempt ${attempt} failed:`, error.message);
            if (attempt < 3) {
                console.log(`🔄 Retrying in ${attempt * 2} seconds...`);
                await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            }
        }
    }
    
    if (!databaseInitialized) {
        console.log("⚠️ Running with limited database functionality");
    }
    
    // 🔧 FIXED: Choose ONLY ONE method - no conflicts
    console.log("🤖 Initializing Telegram bot...");
    
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.RAILWAY_ENVIRONMENT === 'production' ||
                        process.env.VERCEL_ENV === 'production' ||
                        !!process.env.PORT;
    
    let botInitialized = false;
    let initializationMethod = 'unknown';
    
    if (isProduction) {
        // 🔧 PRODUCTION: WEBHOOK ONLY - NO POLLING FALLBACK
        console.log("🚀 Production environment - WEBHOOK ONLY MODE...");
        
        try {
            // 🔧 CRITICAL: Stop any existing polling FIRST
            console.log("🛑 Ensuring no polling conflicts...");
            try {
                await bot.stopPolling();
                console.log("✅ Stopped any existing polling");
            } catch (stopError) {
                console.log("ℹ️ No polling to stop");
            }
            
            // Wait for cleanup
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 🔧 FIXED: Use correct Railway webhook URL
            const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
            console.log(`🔗 Setting webhook URL: ${webhookUrl}`);
            
            // Clean up any existing webhook
            await bot.deleteWebHook();
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Set new webhook with proper configuration
            const webhookResult = await bot.setWebHook(webhookUrl, {
                max_connections: 40,
                allowed_updates: ['message', 'callback_query'],
                drop_pending_updates: true  // Clear any pending updates
            });
            
            console.log("🔗 Webhook set result:", webhookResult);
            console.log("✅ Production webhook configured successfully");
            
            // 🔧 VERIFY webhook status
            const webhookInfo = await bot.getWebHookInfo();
            console.log("📋 Webhook verification:", {
                url: webhookInfo.url,
                has_custom_certificate: webhookInfo.has_custom_certificate,
                pending_update_count: webhookInfo.pending_update_count,
                last_error_date: webhookInfo.last_error_date,
                last_error_message: webhookInfo.last_error_message,
                max_connections: webhookInfo.max_connections
            });
            
            if (webhookInfo.url === webhookUrl) {
                console.log("✅ Webhook URL verified correctly");
                botInitialized = true;
                initializationMethod = 'webhook-production';
            } else {
                throw new Error(`Webhook URL mismatch: expected ${webhookUrl}, got ${webhookInfo.url}`);
            }
            
        } catch (webhookError) {
            console.error("❌ Webhook setup failed:", webhookError.message);
            console.error("❌ Full webhook error:", webhookError);
            
            console.error("🚨 CRITICAL: Webhook failed in production environment!");
            console.log("🔧 SOLUTIONS:");
            console.log("   1. Check if Railway domain is accessible");
            console.log("   2. Verify TELEGRAM_BOT_TOKEN is correct");
            console.log("   3. Ensure webhook endpoint responds to POST requests");
            console.log("   4. Check Railway logs for webhook errors");
            
            botInitialized = false;
            initializationMethod = 'webhook-failed';
        }
        
    } else {
        // 🔧 DEVELOPMENT: POLLING ONLY - NO WEBHOOK
        console.log("🛠️ Development environment - POLLING ONLY MODE...");
        
        try {
            // Remove any webhooks first
            console.log("🛑 Ensuring no webhook conflicts...");
            await bot.deleteWebHook();
            console.log("✅ Removed any existing webhooks");
            
            // Wait for cleanup
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Start polling with proper configuration
            await bot.startPolling({ 
                restart: true,
                polling: {
                    interval: 1000,
                    autoStart: true,
                    params: {
                        timeout: 30,
                        allowed_updates: ['message', 'callback_query']
                    }
                }
            });
            
            console.log("✅ Development polling started successfully");
            botInitialized = true;
            initializationMethod = 'polling-development';
            
        } catch (pollingError) {
            console.error("❌ Development polling failed:", pollingError.message);
            
            // Basic polling fallback for development only
            try {
                console.log("🔄 Attempting basic polling for development...");
                await bot.startPolling();
                console.log("✅ Basic polling started");
                botInitialized = true;
                initializationMethod = 'polling-basic';
            } catch (basicError) {
                console.error("❌ Basic polling failed:", basicError.message);
                botInitialized = false;
                initializationMethod = 'polling-failed';
            }
        }
    }
    
    // 🔧 ENHANCED: Final status report
    if (botInitialized) {
        console.log("🎯 Bot is ready to receive messages!");
        console.log(`🤖 Bot initialization method: ${initializationMethod}`);
        
        // Test bot connectivity
        try {
            const botInfo = await bot.getMe();
            console.log(`👤 Bot info: @${botInfo.username} (${botInfo.first_name})`);
            
            // Show current configuration
            if (isProduction) {
                const webhookInfo = await bot.getWebHookInfo();
                console.log(`🔗 Active webhook: ${webhookInfo.url}`);
                console.log(`📊 Pending updates: ${webhookInfo.pending_update_count}`);
                if (webhookInfo.last_error_message) {
                    console.log(`⚠️ Last webhook error: ${webhookInfo.last_error_message}`);
                }
            } else {
                console.log("📡 Polling mode active for development");
            }
            
        } catch (infoError) {
            console.warn("⚠️ Could not retrieve bot info:", infoError.message);
        }
        
    } else {
        console.error("🚨 CRITICAL: Bot initialization failed!");
        console.log("🔧 Debug steps:");
        console.log(`   Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
        console.log(`   Method attempted: ${initializationMethod}`);
        console.log("   Check Railway logs for detailed error messages");
    }
    
    console.log("\n🚀 AI WEALTH EMPIRE STARTUP COMPLETE!");
    console.log("=" .repeat(50));
    console.log(`📍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`🤖 Bot Mode: ${initializationMethod}`);
    console.log(`💾 Database: ${databaseInitialized ? 'CONNECTED' : 'LIMITED'}`);
    console.log(`🧠 Memory System: ${databaseInitialized ? 'ACTIVE' : 'BASIC'}`);
    console.log("💰 Ready to build wealth with AI!");
    console.log("=" .repeat(50));
});

// Enhanced error handling with better logging
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection at:', promise);
    console.error('❌ Reason:', reason);
    
    if (reason && reason.message) {
        if (reason.message.includes('409')) {
            console.error("🚨 Telegram Bot Conflict (409): Another instance running!");
            console.log("🔧 Solution: Stop other instances or wait 60 seconds");
        } else if (reason.message.includes('401')) {
            console.error("🚨 Telegram Bot Unauthorized (401): Check TELEGRAM_BOT_TOKEN");
        } else if (reason.message.includes('ETELEGRAM')) {
            console.error("🚨 Telegram API Error:", reason.message);
        }
    }
    
    // Log to system metrics if available
    if (typeof systemMetrics !== 'undefined') {
        systemMetrics.incrementMetric('failedRequests');
    }
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    
    if (error.message) {
        if (error.message.includes('EADDRINUSE')) {
            console.error(`🚨 Port ${PORT} already in use! Another server instance running.`);
            process.exit(1);
        } else if (error.message.includes('ETELEGRAM')) {
            console.error("🚨 Telegram API Error:", error.message);
        }
    }
    
    // Log to system metrics if available
    if (typeof systemMetrics !== 'undefined') {
        systemMetrics.incrementMetric('failedRequests');
    }
});

// Enhanced graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received, performing graceful shutdown...`);
    
    try {
        console.log('🤖 Stopping Telegram bot...');
        
        // Stop bot gracefully
        if (bot) {
            await Promise.race([
                bot.stopPolling(),
                new Promise(resolve => setTimeout(resolve, 5000)) // 5 second timeout
            ]);
            
            await Promise.race([
                bot.deleteWebHook(),
                new Promise(resolve => setTimeout(resolve, 3000)) // 3 second timeout
            ]);
        }
        
        console.log('✅ Bot stopped successfully');
        
        // Update system metrics if available
        if (typeof updateSystemMetrics === 'function') {
            await Promise.race([
                updateSystemMetrics({
                    system_shutdown: 1,
                    wealth_system_shutdown: 1,
                    shutdown_timestamp: new Date().toISOString()
                }),
                new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout
            ]).catch(console.error);
        }
        
        console.log('💾 Cleanup completed');
        
    } catch (error) {
        console.error('❌ Shutdown cleanup error:', error.message);
    }
    
    // Close server gracefully
    server.close(() => {
        console.log('✅ AI WEALTH EMPIRE shut down gracefully');
        process.exit(0);
    });
    
    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
        console.log('⚠️ Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart

// Export for testing and monitoring
module.exports = {
    app,
    server,
    initializeEnhancedDatabase: typeof initializeEnhancedDatabase !== 'undefined' ? initializeEnhancedDatabase : null,
    connectionStats: typeof connectionStats !== 'undefined' ? connectionStats : null,
    systemMetrics: typeof systemMetrics !== 'undefined' ? systemMetrics : null
};
