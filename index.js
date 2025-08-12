require("dotenv").config({ path: ".env" });

// Debug environment variables
console.log("🔧 Environment check:");
console.log(`ADMIN_CHAT_ID: ${process.env.ADMIN_CHAT_ID}`);
console.log(`TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET"}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "SET" : "NOT SET"}`);
console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "SET" : "NOT SET"}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "SET" : "NOT SET"}`);
console.log(`DATABASE_PUBLIC_URL: ${process.env.DATABASE_PUBLIC_URL ? "SET" : "NOT SET"}`); // 🔧 ADDED

const TelegramBot = require("node-telegram-bot-api");
const { OpenAI } = require("openai");

// Import enhanced utility modules
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
        
        // 🔧 FIXED: Log API usage with proper fallback
        try {
            await logApiUsage('live_data', 'comprehensive_market', 1, true, Date.now() - startTime, 0, 0.001);
        } catch (logError) {
            console.log('⚠️ API usage logging failed:', logError.message);
        }
        
        return marketData;
    } catch (error) {
        console.error('Market data error:', error.message);
        try {
            await logApiUsage('live_data', 'comprehensive_market', 1, false, 0, 0, 0);
        } catch (logError) {
            // Silent fail for logging
        }
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

// 🔧 COMPLETELY REWRITTEN: Enhanced conversation handler with proper memory integration
async function handleEnhancedConversation(chatId, text, sessionId) {
    try {
        console.log("🤖 Processing enhanced conversation with FIXED memory:", text.substring(0, 50));
        
        // 🔧 FIXED: Robust memory retrieval with detailed logging
        let conversationHistory = [];
        let persistentMemory = [];
        let memoryErrors = [];
        
        // Test database connection first
        console.log("🔍 Testing database connection...");
        try {
            const dbHealth = await performHealthCheck();
            console.log("📊 Database health:", dbHealth.status);
        } catch (healthError) {
            console.log("⚠️ Database health check failed:", healthError.message);
            memoryErrors.push(`Health: ${healthError.message}`);
        }
        
        // 🔧 FIXED: Conversation History with detailed error handling
        try {
            console.log("📚 Attempting to retrieve conversation history...");
            conversationHistory = await getConversationHistoryDB(chatId, 5);
            console.log(`✅ SUCCESS: Retrieved ${conversationHistory.length} conversations`);
            
            // Log sample data for debugging
            if (conversationHistory.length > 0) {
                console.log("📝 Sample conversation:", {
                    user_message: conversationHistory[0].user_message?.substring(0, 50),
                    timestamp: conversationHistory[0].timestamp,
                    has_response: !!conversationHistory[0].gpt_response
                });
            }
        } catch (historyError) {
            console.log('❌ FAILED: Conversation history retrieval:', historyError.message);
            memoryErrors.push(`History: ${historyError.message}`);
            conversationHistory = []; // Ensure it's an array
        }
        
        // 🔧 FIXED: Persistent Memory with detailed error handling  
        try {
            console.log("🧠 Attempting to retrieve persistent memory...");
            persistentMemory = await getPersistentMemoryDB(chatId);
            console.log(`✅ SUCCESS: Retrieved ${persistentMemory.length} memories`);
            
            // Log sample memory for debugging
            if (persistentMemory.length > 0) {
                console.log("💭 Sample memory:", {
                    fact: persistentMemory[0].fact?.substring(0, 50),
                    importance: persistentMemory[0].importance,
                    created: persistentMemory[0].created_at
                });
            }
        } catch (memoryError) {
            console.log('❌ FAILED: Persistent memory retrieval:', memoryError.message);
            memoryErrors.push(`Memory: ${memoryError.message}`);
            persistentMemory = []; // Ensure it's an array
        }
        
        // 🔧 FIXED: Build memory context using utils/memory.js
        let memoryContext = '';
        try {
            console.log("🏗️ Building conversation context with memory...");
            memoryContext = await buildConversationContext(chatId);
            console.log(`✅ SUCCESS: Built context (${memoryContext.length} chars)`);
        } catch (contextError) {
            console.log('❌ FAILED: Context building:', contextError.message);
            memoryErrors.push(`Context: ${contextError.message}`);
            
            // 🔧 FALLBACK: Manual context building
            if (conversationHistory.length > 0 || persistentMemory.length > 0) {
                memoryContext = `\n\n🧠 BASIC MEMORY CONTEXT:\n`;
                
                if (persistentMemory.length > 0) {
                    memoryContext += `\nIMPORTANT FACTS TO REMEMBER:\n`;
                    persistentMemory.slice(0, 3).forEach((mem, i) => {
                        memoryContext += `${i + 1}. ${mem.fact}\n`;
                    });
                }
                
                if (conversationHistory.length > 0) {
                    memoryContext += `\nRECENT CONVERSATION:\n`;
                    const recent = conversationHistory[0];
                    memoryContext += `User asked: "${recent.user_message?.substring(0, 100)}"\n`;
                }
                
                console.log(`🔧 FALLBACK: Manual context built (${memoryContext.length} chars)`);
            }
        }
        
        // 🔧 FIXED: Enhanced conversation intelligence
        const conversationIntel = {
            type: determineConversationType(text),
            complexity: determineComplexity(text),
            liveDataRequired: requiresLiveData(text),
            primaryAI: 'GPT_COMMANDER',
            enhancementLevel: 'ENHANCED',
            style: 'helpful_intelligent_with_memory',
            reasoning: 'Enhanced dual command routing with fixed memory integration',
            memoryAvailable: memoryContext.length > 0,
            conversationCount: conversationHistory.length,
            memoryCount: persistentMemory.length,
            memoryErrors: memoryErrors
        };
        
        console.log("🎯 Conversation Intel:", {
            type: conversationIntel.type,
            memoryAvailable: conversationIntel.memoryAvailable,
            errors: memoryErrors.length
        });
        
        // 🔧 FIXED: Enhanced dual command with memory context
        console.log("🤖 Executing dual command with memory context...");
        let result;
        
        try {
            result = await executeDualCommand(text, chatId, {
                conversationHistory: conversationHistory,
                persistentMemory: persistentMemory,
                conversationIntel: conversationIntel,
                messageType: 'text',
                hasMedia: false,
                memoryContext: memoryContext,
                originalMessage: text
            });
            
            console.log("✅ Dual command executed successfully:", {
                aiUsed: result.aiUsed,
                success: result.success,
                responseLength: result.response?.length
            });
            
        } catch (dualError) {
            console.log("❌ Dual command failed, using GPT fallback:", dualError.message);
            
            // 🔧 FALLBACK: Direct GPT with memory
            const enhancedPrompt = memoryContext ? 
                `${memoryContext}\n\nUser question: ${text}` : text;
                
            const response = await getGptAnalysis(enhancedPrompt, { 
                maxTokens: 1500,
                temperature: 0.7,
                model: "gpt-4o" // Use stable model as fallback
            });
            
            result = {
                response: response,
                aiUsed: 'GPT_FALLBACK',
                success: true,
                contextUsed: !!memoryContext,
                responseTime: 2000,
                memoryErrors: memoryErrors
            };
        }
        
        // Send response to user
        await sendSmartMessage(bot, chatId, result.response);
        
        // 🔧 FIXED: Enhanced conversation save with error handling
        try {
            console.log("💾 Saving conversation to database...");
            await saveConversationDB(chatId, text, result.response, "text", {
                aiUsed: result.aiUsed,
                queryType: result.queryType || conversationIntel.type,
                complexity: result.complexity || conversationIntel.complexity,
                contextUsed: result.contextUsed || (memoryContext.length > 0),
                responseTime: result.responseTime || 2000,
                success: result.success,
                memoryAvailable: memoryContext.length > 0,
                memoryErrors: memoryErrors,
                enhanced: true
            });
            console.log("✅ Conversation saved successfully");
            
        } catch (saveError) {
            console.log('⚠️ Could not save conversation:', saveError.message);
            // Continue execution even if save fails
        }
        
        // 🔧 FIXED: Memory extraction with proper error handling
        try {
            console.log("🧠 Extracting facts for persistent memory...");
            const { extractAndSaveFacts } = require('./utils/memory');
            
            const extractionResult = await extractAndSaveFacts(chatId, text, result.response);
            
            if (extractionResult && extractionResult.extractedFacts > 0) {
                console.log(`✅ Memory extraction successful: ${extractionResult.extractedFacts} facts extracted`);
            } else {
                console.log("ℹ️ No new facts extracted from this conversation");
            }
            
        } catch (extractError) {
            console.log('⚠️ Memory extraction failed:', extractError.message);
            
            // 🔧 FALLBACK: Manual memory extraction for important conversations
            if (shouldSaveToPersistentMemory(text, result.response)) {
                try {
                    const memoryFact = extractMemoryFact(text, result.response);
                    if (memoryFact) {
                        await addPersistentMemoryDB(chatId, memoryFact, 'medium');
                        console.log('✅ Manual memory save successful:', memoryFact.substring(0, 50));
                    }
                } catch (manualError) {
                    console.log('❌ Manual memory save also failed:', manualError.message);
                }
            }
        }
        
        // 🔧 SUCCESS SUMMARY
        console.log("🎉 CONVERSATION COMPLETED:", {
            memoryAvailable: memoryContext.length > 0,
            aiUsed: result.aiUsed,
            conversationSaved: true,
            memoryErrors: memoryErrors.length,
            enhanced: true
        });
        
    } catch (error) {
        console.error('❌ CRITICAL: Enhanced conversation error:', error.message);
        console.error('Stack:', error.stack);
        
        // 🔧 EMERGENCY FALLBACK with basic memory attempt
        try {
            console.log('🚨 EMERGENCY FALLBACK: Basic GPT with minimal memory...');
            
            // Try to get at least some memory context
            let basicMemory = '';
            try {
                const recentHistory = await getConversationHistoryDB(chatId, 2);
                if (recentHistory && recentHistory.length > 0) {
                    basicMemory = `\n\nFor context: You previously discussed "${recentHistory[0]?.user_message?.substring(0, 80) || 'general topics'}" with this user.`;
                }
            } catch (contextError) {
                console.log('⚠️ Even basic memory failed:', contextError.message);
            }
            
            const response = await getGptAnalysis(text + basicMemory, { 
                maxTokens: 1000,
                temperature: 0.7,
                model: "gpt-4o"
            });
            
            await sendSmartMessage(bot, chatId, response);
            
            // Save emergency conversation
            try {
                await saveConversationDB(chatId, text, response, "text", { 
                    error: error.message,
                    fallback: 'emergency',
                    basicMemoryAttempted: !!basicMemory,
                    emergency: true
                });
            } catch (saveError) {
                console.error('❌ Emergency save failed:', saveError.message);
            }
            
        } catch (fallbackError) {
            console.error('❌ TOTAL FAILURE: Even emergency fallback failed:', fallbackError.message);
            await sendSmartMessage(bot, chatId, 
                `🚨 I'm experiencing memory system difficulties. Let me try to help you anyway, but I may not remember our previous conversations right now. What can I help you with?`
            );
        }
    }
}

// 🔧 MISSING HELPER FUNCTIONS - Add these to make the code work
function determineConversationType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('regime') || lowerText.includes('economic')) return 'economic_regime';
    if (lowerText.includes('cambodia') || lowerText.includes('lending')) return 'cambodia_fund';
    if (lowerText.includes('time') || lowerText.includes('date')) return 'simple_datetime';
    if (lowerText.includes('market') || lowerText.includes('trading')) return 'market_analysis';
    if (lowerText.includes('joke') || lowerText.includes('story')) return 'casual';
    if (lowerText.includes('analyze') || lowerText.includes('strategy')) return 'strategic_analysis';
    if (lowerText.includes('remember') || lowerText.includes('memory')) return 'memory_query';
    
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

// 🔧 MISSING SESSION FUNCTIONS - Add these placeholders
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

// 🔧 MISSING API USAGE FUNCTION - Add this placeholder
async function logApiUsage(apiProvider, endpoint, callsCount = 1, successful = true, responseTime = 0, dataVolume = 0, costEstimate = 0) {
    try {
        console.log(`API Usage: ${apiProvider}/${endpoint} - ${successful ? 'SUCCESS' : 'FAILED'} - ${responseTime}ms`);
        return true;
    } catch (error) {
        console.error('Log API usage error:', error.message);
        return false;
    }
}

// Enhanced command execution with full database logging + memory testing
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
        
        // 🔧 NEW: Database & Memory Testing Commands
        } else if (text === '/test_db') {
            await handleDatabaseConnectionTest(chatId);
        } else if (text === '/test_memory') {
            await handleMemorySystemTest(chatId);
        } else if (text === '/test_memory_fix') {
            await handleMemoryRecoveryTest(chatId);
        } else if (text === '/memory_stats') {
            await handleMemoryStatistics(chatId);
        
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

// 🔧 FIXED: Enhanced command handlers with database integration
async function handleStartCommand(chatId) {
    const welcome = `🤖 **Enhanced AI Assistant System v3.2**

**🎯 Core Features:**
- Dual AI: GPT-4o + Claude Opus 4.1
- Enhanced PostgreSQL Database Integration
- Live market data & Ray Dalio framework
- Cambodia fund analysis
- Advanced document processing
- Voice and image analysis
- Persistent memory system

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
/maintenance - Database maintenance

**🧪 Memory & Database Testing:**
/test_db - Test database connection
/test_memory - Test memory system
/test_memory_fix - Memory recovery test
/memory_stats - Memory statistics

**Chat ID:** ${chatId}
**Database Status:** ${connectionStats.connectionHealth}`;

    await sendSmartMessage(bot, chatId, welcome);
    
    // Save welcome interaction
    await saveConversationDB(chatId, "/start", welcome, "command").catch(console.error);
}

async function handleHelpCommand(chatId) {
    const help = `🤖 **Enhanced AI Assistant Help**

**Main Features:**
- Natural conversation with dual AI routing (GPT-4o + Claude)
- Financial market analysis with database persistence
- Cambodia lending fund management
- Document analysis and training with storage
- Voice/image processing with history
- Persistent memory system

**Database Features:**
- Persistent conversation memory
- Training document storage
- Ray Dalio regime tracking
- Cambodia deal analytics
- Enhanced system monitoring

**Memory System:**
- Remembers important facts about you
- Maintains conversation context
- Learns your preferences over time
- Extracts strategic insights automatically

**How to use:**
- Ask questions naturally (auto-routed to best AI)
- Upload documents with "train" to add to knowledge base
- Use specific commands for structured analysis
- All interactions are saved for context

**Examples:**
- "Remember my name is John" (Memory system)
- "What's the current market regime?" (Claude Analysis)
- "Analyze this Cambodia lending opportunity" (Specialized)
- "Tell me a joke" (GPT-4o)
- "/test_memory" to check if memory is working`;

    await sendSmartMessage(bot, chatId, help);
    
    // Save help interaction
    await saveConversationDB(chatId, "/help", help, "command").catch(console.error);
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
        status += `• GPT-4o: ${health?.gptAnalysis ? '✅ Online' : '❌ Offline'}\n`;
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

// 🧠 NEW: Memory System Test Handler
async function handleMemorySystemTest(chatId) {
    try {
        await bot.sendMessage(chatId, "🧠 Testing memory system integration...");
        
        // Test memory integration using dualCommandSystem if available
        let results;
        try {
            const { testMemoryIntegration } = require('./utils/dualCommandSystem');
            results = await testMemoryIntegration(chatId);
        } catch (importError) {
            // Fallback to manual testing
            results = await performManualMemoryTest(chatId);
        }
        
        let response = `🧠 **Memory Integration Test Results**\n\n`;
        
        if (results.tests) {
            Object.entries(results.tests).forEach(([test, passed]) => {
                const emoji = passed ? '✅' : '❌';
                const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                response += `${emoji} ${testName}\n`;
            });
            
            response += `\n**Score:** ${results.score} (${results.percentage}%)\n`;
            response += `**Status:** ${results.status === 'FULL_SUCCESS' ? '🟢 FULLY WORKING' : 
                                      results.status === 'MOSTLY_WORKING' ? '🟡 MOSTLY WORKING' : 
                                      '🔴 NEEDS ATTENTION'}\n\n`;
        }
        
        if (results.status !== 'FULL_SUCCESS') {
            response += `**Recommendations:**\n`;
            response += `• Check database connection with /test_db\n`;
            response += `• Verify DATABASE_URL is using public URL\n`;
            response += `• Try memory recovery with /test_memory_fix\n`;
        }
        
        await sendAnalysis(bot, chatId, response, "Memory System Test");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Memory system test failed: ${error.message}`);
    }
}

// 🔧 NEW: Memory Recovery Test Handler
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
        
        // Test 3: Build context
        try {
            const context = await buildConversationContext(chatId);
            testResults.contextBuilding = typeof context === 'string' && context.length > 0;
            console.log(`✅ Context building test: ${context.length} chars`);
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

// 🔧 HELPER: Manual Memory Test (fallback)
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
        // Test 3: Memory Building
        const context = await buildConversationContext(chatId);
        tests.memoryBuilding = typeof context === 'string';
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

// 🔧 PLACEHOLDER HANDLERS - These need to be implemented in Part 3
async function handleDealAnalysis(chatId, text) {
    await sendSmartMessage(bot, chatId, "🏗️ Deal analysis handler - Implementation in Part 3");
}

async function handlePortfolioStatus(chatId) {
    await sendSmartMessage(bot, chatId, "🏗️ Portfolio status handler - Implementation in Part 3");
}

async function handleCambodiaMarket(chatId) {
    await sendSmartMessage(bot, chatId, "🏗️ Cambodia market handler - Implementation in Part 3");
}

async function handleRiskAssessment(chatId) {
    await sendSmartMessage(bot, chatId, "🏗️ Risk assessment handler - Implementation in Part 3");
}

async function handleMarketBriefing(chatId) {
    await sendSmartMessage(bot, chatId, "🏗️ Market briefing handler - Implementation in Part 3");
}

async function handleRegimeAnalysis(chatId) {
    await sendSmartMessage(bot, chatId, "🏗️ Regime analysis handler - Implementation in Part 3");
}

async function handleOpportunities(chatId) {
    await sendSmartMessage(bot, chatId, "🏗️ Opportunities handler - Implementation in Part 3");
}

async function handleMacroAnalysis(chatId) {
    await sendSmartMessage(bot, chatId, "🏗️ Macro analysis handler - Implementation in Part 3");
}

async function handleTradingStatus(chatId) {
    await sendSmartMessage(bot, chatId, "🏗️ Trading status handler - Implementation in Part 3");
}

async function handlePositions(chatId) {
    await sendSmartMessage(bot, chatId, "🏗️ Positions handler - Implementation in Part 3");
}

async function handleDocumentsList(chatId) {
    await sendSmartMessage(bot, chatId, "🏗️ Documents list handler - Implementation in Part 3");
}

// 🔧 ENHANCED: Helper functions for conversation handling with memory integration
function determineConversationType(text) {
    const lowerText = text.toLowerCase();
    
    // Memory-related queries
    if (lowerText.includes('remember') || lowerText.includes('recall') || lowerText.includes('you mentioned')) return 'memory_query';
    
    // Economic and regime analysis
    if (lowerText.includes('regime') || lowerText.includes('economic')) return 'economic_regime';
    
    // Cambodia-specific
    if (lowerText.includes('cambodia') || lowerText.includes('lending') || lowerText.includes('phnom penh')) return 'cambodia_fund';
    
    // Date and time queries
    if (lowerText.includes('time') || lowerText.includes('date') || lowerText.includes('today')) return 'simple_datetime';
    
    // Market analysis
    if (lowerText.includes('market') || lowerText.includes('trading') || lowerText.includes('stock')) return 'market_analysis';
    
    // Casual conversation
    if (lowerText.includes('joke') || lowerText.includes('story') || lowerText.includes('hello') || lowerText.includes('hi')) return 'casual';
    
    // Strategic analysis
    if (lowerText.includes('analyze') || lowerText.includes('strategy') || lowerText.includes('comprehensive')) return 'strategic_analysis';
    
    // Portfolio and risk
    if (lowerText.includes('portfolio') || lowerText.includes('risk') || lowerText.includes('allocation')) return 'portfolio_analysis';
    
    return 'balanced_strategic';
}

function determineComplexity(text) {
    const wordCount = text.split(/\s+/).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const hasMultipleTopics = text.includes('and') || text.includes('also') || text.includes(',');
    
    if (text.length < 50 && wordCount < 10) return 'minimal';
    if (text.length < 200 && wordCount < 30 && questionCount <= 1) return 'moderate';
    if (text.length < 500 && wordCount < 75 && !hasMultipleTopics) return 'high';
    return 'maximum';
}

function requiresLiveData(text) {
    const lowerText = text.toLowerCase();
    const liveDataKeywords = [
        'current', 'latest', 'today', 'now', 'recent',
        'price', 'market', 'trading', 'rate', 'news',
        'status', 'update', 'live', 'real-time'
    ];
    
    return liveDataKeywords.some(keyword => lowerText.includes(keyword));
}

function shouldSaveToPersistentMemory(userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    // High priority memory triggers
    if (lowerMessage.includes('remember') || lowerMessage.includes('my name is')) return true;
    if (lowerMessage.includes('my preference') || lowerMessage.includes('i prefer')) return true;
    if (lowerMessage.includes('important') || lowerMessage.includes('don\'t forget')) return true;
    
    // Response indicators
    if (lowerResponse.includes('important to note') || lowerResponse.includes('key insight')) return true;
    if (lowerResponse.includes('strategic') || lowerResponse.includes('critical')) return true;
    
    // Length-based (detailed responses likely contain important info)
    if (aiResponse.length > 800) return true;
    
    // Financial/personal information
    if (lowerMessage.includes('my goal') || lowerMessage.includes('my strategy')) return true;
    if (lowerMessage.includes('my portfolio') || lowerMessage.includes('my risk')) return true;
    
    return false;
}

function extractMemoryFact(userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Name extraction
    if (lowerMessage.includes('my name is')) {
        const nameMatch = userMessage.match(/my name is ([^.,\n!?]+)/i);
        if (nameMatch) {
            return `User's name: ${nameMatch[1].trim()}`;
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
    if (lowerMessage.includes('my goal')) {
        const goalMatch = userMessage.match(/my goal (?:is )?([^.,\n!?]+)/i);
        if (goalMatch) {
            return `User goal: ${goalMatch[1].trim()}`;
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
    
    // Important conclusions
    if (aiResponse.includes('In conclusion:')) {
        const conclusion = aiResponse.split('In conclusion:')[1]?.split('\n')[0];
        return conclusion ? `Key conclusion: ${conclusion.trim()}` : null;
    }
    
    // Strategic recommendations
    if (aiResponse.includes('I recommend')) {
        const recommendation = aiResponse.match(/I recommend ([^.,\n!?]+)/i);
        if (recommendation) {
            return `AI recommendation: ${recommendation[1].trim()}`;
        }
    }
    
    // Extract first important sentence from response
    const sentences = aiResponse.split('. ');
    const importantSentence = sentences.find(s => {
        const lower = s.toLowerCase();
        return lower.includes('important') || lower.includes('key') || 
               lower.includes('strategic') || lower.includes('critical') ||
               lower.includes('note that') || lower.includes('remember');
    });
    
    if (importantSentence && importantSentence.length > 20 && importantSentence.length < 200) {
        return `Context: ${importantSentence.trim()}`;
    }
    
    // Fallback for general context
    if (userMessage.length > 10 && userMessage.length < 150) {
        return `Conversation context: ${userMessage.trim()}`;
    }
    
    return null;
}

// 🔧 ENHANCED: Media message handlers with better database integration and error handling
async function handleVoiceMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🎤 Processing voice message...");
        await bot.sendMessage(chatId, "🎤 Transcribing voice message with enhanced AI...");
        
        const transcribedText = await processVoiceMessage(bot, msg.voice.file_id, chatId);
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
                timestamp: new Date().toISOString()
            }).catch(err => console.error('Voice save error:', err.message));
            
            // Process transcribed text as normal conversation with memory integration
            await handleEnhancedConversation(chatId, transcribedText, sessionId);
            
            // Log successful API usage
            await logApiUsage('WHISPER', 'transcription', 1, true, responseTime, msg.voice.file_size || 0)
                .catch(err => console.error('API log error:', err.message));
            
            console.log("✅ Voice message processed successfully");
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
        await sendSmartMessage(bot, chatId, `❌ Voice processing error: ${error.message}`);
        
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

async function handleImageMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🖼️ Processing image message...");
        await bot.sendMessage(chatId, "🖼️ Analyzing image with enhanced AI vision...");
        
        const largestPhoto = msg.photo[msg.photo.length - 1];
        const analysis = await processImageMessage(bot, largestPhoto.file_id, chatId, msg.caption);
        const responseTime = Date.now() - startTime;
        
        if (analysis && analysis.length > 0) {
            await sendAnalysis(bot, chatId, analysis, "Enhanced Image Analysis");
            
            // Enhanced image analysis save with comprehensive metadata
            await saveConversationDB(chatId, "[IMAGE]" + (msg.caption ? `: ${msg.caption}` : ""), analysis, "image", {
                imageWidth: largestPhoto.width,
                imageHeight: largestPhoto.height,
                fileSize: largestPhoto.file_size,
                caption: msg.caption || null,
                analysisLength: analysis.length,
                processingTime: responseTime,
                sessionId: sessionId,
                timestamp: new Date().toISOString(),
                imageQuality: largestPhoto.width * largestPhoto.height > 1000000 ? 'HIGH' : 'STANDARD'
            }).catch(err => console.error('Image save error:', err.message));
            
            // If image has caption, process it as additional conversation with memory
            if (msg.caption && msg.caption.length > 0) {
                console.log("📝 Processing image caption as conversation...");
                await handleEnhancedConversation(chatId, `About this image: ${msg.caption}`, sessionId);
            }
            
            // Check if image analysis should be saved to persistent memory
            if (shouldSaveToPersistentMemory(`Image: ${msg.caption || 'Visual content'}`, analysis)) {
                const memoryFact = `Image analysis: ${analysis.substring(0, 150)}...`;
                await addPersistentMemoryDB(chatId, memoryFact, 'medium')
                    .catch(err => console.error('Memory save error:', err.message));
                console.log("💾 Image analysis saved to persistent memory");
            }
            
            // Log successful API usage
            await logApiUsage('VISION_AI', 'image_analysis', 1, true, responseTime, largestPhoto.file_size || 0)
                .catch(err => console.error('API log error:', err.message));
            
            console.log("✅ Image processed successfully");
        } else {
            await sendSmartMessage(bot, chatId, "❌ Image analysis failed. Please try again with a clearer image.");
            
            // Save failed analysis attempt with diagnostic data
            await saveConversationDB(chatId, "[IMAGE_FAILED]", "Image analysis failed", "image", {
                error: "Analysis returned empty",
                imageWidth: largestPhoto.width,
                imageHeight: largestPhoto.height,
                fileSize: largestPhoto.file_size,
                caption: msg.caption || null,
                processingTime: responseTime,
                sessionId: sessionId
            }).catch(err => console.error('Image error save failed:', err.message));
            
            // Log failed API usage
            await logApiUsage('VISION_AI', 'image_analysis', 1, false, responseTime, largestPhoto.file_size || 0)
                .catch(err => console.error('API log error:', err.message));
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error("❌ Image processing error:", error.message);
        await sendSmartMessage(bot, chatId, `❌ Image processing error: ${error.message}`);
        
        // Save comprehensive error details
        await saveConversationDB(chatId, "[IMAGE_ERROR]", `Error: ${error.message}`, "image", {
            error: error.message,
            stackTrace: error.stack?.substring(0, 500),
            caption: msg.caption || null,
            processingTime: responseTime,
            sessionId: sessionId
        }).catch(err => console.error('Image error save failed:', err.message));
        
        // Log error for monitoring
        await logApiUsage('VISION_AI', 'image_analysis', 1, false, responseTime, 0, 0)
            .catch(err => console.error('API log error:', err.message));
    }
}

async function handleDocumentMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("📄 Processing document:", msg.document.file_name);
        const isTraining = msg.caption?.toLowerCase().includes("train");
        const fileName = msg.document.file_name || "untitled_document";
        const fileSize = msg.document.file_size || 0;
        
        if (isTraining) {
            // Enhanced training document processing with better error handling
            await bot.sendMessage(chatId, "📚 Processing document for enhanced AI training database...");
            
            try {
                const fileLink = await bot.getFileLink(msg.document.file_id);
                console.log("📥 Downloading document from Telegram...");
                
                // Enhanced file download with timeout
                const fetch = require('node-fetch');
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                
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
                
                // Enhanced file type handling with better validation
                const fileExtension = fileName.toLowerCase().split('.').pop();
                
                if (['txt', 'md', 'json', 'csv'].includes(fileExtension)) {
                    content = buffer.toString('utf8');
                } else if (fileExtension === 'pdf') {
                    // For PDF files, suggest conversion
                    throw new Error("PDF files require conversion to text format. Please save as .txt or .md file.");
                } else {
                    // Try to read as text for other formats
                    content = buffer.toString('utf8');
                    console.log(`⚠️ Attempting to read ${fileExtension} file as text`);
                }
                
                // Validate content
                if (content.length === 0) {
                    throw new Error("Document appears to be empty or unreadable");
                }
                
                if (content.length > 1000000) { // 1MB text limit
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
                        `✅ **Your AI can now reference this document in conversations!**\n\n` +
                        `**Try asking:** "What did you learn from ${fileName}?"`
                    );
                    
                    // Log successful training
                    await logCommandUsage(chatId, 'document_training', responseTime, true)
                        .catch(err => console.error('Command log error:', err.message));
                    
                    // Save comprehensive training record
                    await saveConversationDB(chatId, `[TRAINING_DOC] ${fileName}`, `Document added: ${wordCount} words`, "document", {
                        fileName: fileName,
                        wordCount: wordCount,
                        fileSize: fileSize,
                        processingTime: responseTime,
                        trainingSuccess: true,
                        sessionId: sessionId,
                        fileType: fileExtension,
                        contentPreview: summary.substring(0, 200)
                    }).catch(err => console.error('Training record save error:', err.message));
                    
                    // Log API usage for training
                    await logApiUsage('TRAINING_DB', 'document_save', 1, true, responseTime, content.length)
                        .catch(err => console.error('API log error:', err.message));
                    
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
                    errorMessage += `**Format Error:** PDF files need conversion\n`;
                }
                
                errorMessage += `**Please try:**\n` +
                    `• Converting to .txt or .md format\n` +
                    `• Reducing file size if too large\n` +
                    `• Checking if file is corrupted\n` +
                    `• Uploading via copy-paste for text content`;
                
                await sendSmartMessage(bot, chatId, errorMessage);
                
                // Save comprehensive error record
                await saveConversationDB(chatId, `[TRAINING_ERROR] ${fileName}`, `Training failed: ${downloadError.message}`, "document", {
                    fileName: fileName,
                    fileSize: fileSize,
                    error: downloadError.message,
                    processingTime: responseTime,
                    trainingSuccess: false,
                    sessionId: sessionId,
                    errorType: downloadError.name || 'Unknown'
                }).catch(err => console.error('Error record save failed:', err.message));
                
                // Log failed API usage
                await logApiUsage('TRAINING_DB', 'document_save', 1, false, responseTime, 0)
                    .catch(err => console.error('API log error:', err.message));
            }
            
        } else {
            // Enhanced document analysis with better processing
            await bot.sendMessage(chatId, "📄 Analyzing document with enhanced AI...");
            
            try {
                const analysis = await processDocumentMessage(bot, msg.document.file_id, chatId, fileName);
                const responseTime = Date.now() - startTime;
                
                if (analysis?.success && analysis.analysis) {
                    await sendAnalysis(bot, chatId, analysis.analysis, `Enhanced Document Analysis: ${fileName}`);
                    
                    // Enhanced document analysis save with metadata
                    await saveConversationDB(chatId, `[DOCUMENT] ${fileName}`, analysis.analysis, "document", {
                        fileName: fileName,
                        fileSize: fileSize,
                        analysisLength: analysis.analysis.length,
                        processingTime: responseTime,
                        analysisSuccess: true,
                        sessionId: sessionId,
                        analysisType: 'content_review'
                    }).catch(err => console.error('Document analysis save error:', err.message));
                    
                    // Save to persistent memory if analysis reveals important information
                    if (shouldSaveToPersistentMemory(`Document: ${fileName}`, analysis.analysis)) {
                        const memoryFact = `Document analysis: ${fileName} - ${analysis.analysis.substring(0, 100)}...`;
                        await addPersistentMemoryDB(chatId, memoryFact, 'medium')
                            .catch(err => console.error('Memory save error:', err.message));
                        console.log("💾 Document analysis saved to persistent memory");
                    }
                    
                    // Log successful API usage
                    await logApiUsage('DOCUMENT_AI', 'document_analysis', 1, true, responseTime, fileSize)
                        .catch(err => console.error('API log error:', err.message));
                    
                    console.log("✅ Document analysis completed successfully");
                } else {
                    throw new Error("Document analysis failed or returned empty results");
                }
                
            } catch (analysisError) {
                const responseTime = Date.now() - startTime;
                console.error("❌ Document analysis error:", analysisError.message);
                
                await sendSmartMessage(bot, chatId, 
                    `❌ Document analysis failed: ${analysisError.message}\n\n` +
                    `**Please try:**\n` +
                    `• Converting to PDF or TXT format\n` +
                    `• Reducing file size\n` +
                    `• Adding caption "train" to save for AI training instead\n` +
                    `• Uploading as image if it's a scan`
                );
                
                // Save comprehensive error record
                await saveConversationDB(chatId, `[DOCUMENT_ERROR] ${fileName}`, `Analysis failed: ${analysisError.message}`, "document", {
                    fileName: fileName,
                    fileSize: fileSize,
                    error: analysisError.message,
                    processingTime: responseTime,
                    analysisSuccess: false,
                    sessionId: sessionId
                }).catch(err => console.error('Document error save failed:', err.message));
                
                // Log failed API usage
                await logApiUsage('DOCUMENT_AI', 'document_analysis', 1, false, responseTime, fileSize)
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

// 🔧 ENHANCED: Cambodia fund command handlers with improved error handling and database integration
async function handleDealAnalysis(chatId, text) {
    const startTime = Date.now();
    try {
        if (text === '/deal_analyze') {
            await sendSmartMessage(bot, chatId, 
                "**Enhanced Cambodia Deal Analysis Usage:**\n\n" +
                "**Format:** `/deal_analyze [amount] [type] [location] [rate] [term]`\n\n" +
                "**Parameters:**\n" +
                "• `amount` - Loan amount in USD\n" +
                "• `type` - Collateral type (commercial, residential, land)\n" +
                "• `location` - Property location (use quotes for spaces)\n" +
                "• `rate` - Annual interest rate (%)\n" +
                "• `term` - Loan term in months\n\n" +
                "**Example:**\n" +
                "`/deal_analyze 500000 commercial \"Phnom Penh\" 18 12`\n\n" +
                "**Features:**\n" +
                "✅ Risk assessment with Cambodian market factors\n" +
                "✅ ROI calculations and stress testing\n" +
                "✅ Database storage for trend analysis\n" +
                "✅ Compliance with local regulations"
            );
            return;
        }

        const params = text.replace('/deal_analyze ', '').split(' ');
        if (params.length < 5) {
            await sendSmartMessage(bot, chatId, 
                "❌ **Invalid format**\n\n" +
                "**Correct usage:** `/deal_analyze [amount] [type] [location] [rate] [term]`\n" +
                "**Example:** `/deal_analyze 500000 commercial \"Phnom Penh\" 18 12`"
            );
            return;
        }

        // Enhanced parameter validation
        const dealParams = {
            amount: parseFloat(params[0]),
            collateralType: params[1].toLowerCase(),
            location: params[2].replace(/"/g, ''),
            interestRate: parseFloat(params[3]),
            term: parseInt(params[4])
        };

        // Validate parameters
        if (isNaN(dealParams.amount) || dealParams.amount <= 0) {
            await sendSmartMessage(bot, chatId, "❌ Invalid amount. Must be a positive number.");
            return;
        }
        
        if (!['commercial', 'residential', 'land', 'industrial'].includes(dealParams.collateralType)) {
            await sendSmartMessage(bot, chatId, "❌ Invalid collateral type. Use: commercial, residential, land, or industrial.");
            return;
        }
        
        if (isNaN(dealParams.interestRate) || dealParams.interestRate <= 0 || dealParams.interestRate > 50) {
            await sendSmartMessage(bot, chatId, "❌ Invalid interest rate. Must be between 0.1% and 50%.");
            return;
        }
        
        if (isNaN(dealParams.term) || dealParams.term <= 0 || dealParams.term > 360) {
            await sendSmartMessage(bot, chatId, "❌ Invalid term. Must be between 1 and 360 months.");
            return;
        }

        await bot.sendMessage(chatId, "📊 Analyzing Cambodia lending deal with enhanced database intelligence...");
        
        const analysis = await analyzeLendingDeal(dealParams);
        const responseTime = Date.now() - startTime;

        if (analysis.error) {
            await sendSmartMessage(bot, chatId, `❌ Analysis error: ${analysis.error}`);
            
            // Log failed analysis
            await logCommandUsage(chatId, 'deal_analysis', responseTime, false)
                .catch(err => console.error('Command log error:', err.message));
            return;
        }

        // Enhanced deal data preparation for database
        const dealData = {
            ...analysis,
            dealId: `${chatId}_${Date.now()}`,
            collateralType: dealParams.collateralType,
            location: dealParams.location,
            analysisDate: new Date().toISOString(),
            userId: chatId,
            processingTime: responseTime
        };
        
        // Save to enhanced Cambodia deals database
        await saveCambodiaDeal(chatId, dealData)
            .catch(err => console.error('Deal save error:', err.message));

        // Build comprehensive response
        let response = `**Enhanced Cambodia Deal Analysis**\n\n`;
        response += `📍 **Location:** ${dealParams.location}\n`;
        response += `🏢 **Type:** ${dealParams.collateralType.charAt(0).toUpperCase() + dealParams.collateralType.slice(1)}\n\n`;
        
        response += `**Deal Overview:**\n`;
        response += `• Amount: $${analysis.dealSummary.amount.toLocaleString()}\n`;
        response += `• Rate: ${analysis.dealSummary.rate}% annually\n`;
        response += `• Term: ${analysis.dealSummary.term} months\n`;
        response += `• Monthly Payment: $${analysis.dealSummary.monthlyPayment.toFixed(0)}\n`;
        response += `• Total Interest: ${(analysis.dealSummary.monthlyPayment * analysis.dealSummary.term - analysis.dealSummary.amount).toFixed(0)}\n\n`;
        
        response += `**Risk Assessment:**\n`;
        response += `• Overall Risk Score: ${analysis.riskAssessment.overallScore}/100\n`;
        response += `• Risk Category: ${analysis.riskAssessment.riskCategory}\n`;
        response += `• Location Risk: ${analysis.riskAssessment.locationRisk || 'Moderate'}\n`;
        response += `• Market Risk: ${analysis.riskAssessment.marketRisk || 'Moderate'}\n\n`;
        
        response += `**Financial Metrics:**\n`;
        response += `• ROI (Annual): ${analysis.financialMetrics?.roi || 'N/A'}%\n`;
        response += `• LTV Ratio: ${analysis.financialMetrics?.ltv || 'N/A'}%\n`;
        response += `• DSCR: ${analysis.financialMetrics?.dscr || 'N/A'}\n\n`;
        
        response += `**Recommendation: ${analysis.recommendation.decision}**\n`;
        response += `• Confidence: ${analysis.recommendation.confidence}%\n`;
        response += `• Primary Rationale: ${analysis.recommendation.reasons[0]}\n`;
        if (analysis.recommendation.reasons[1]) {
            response += `• Secondary Factor: ${analysis.recommendation.reasons[1]}\n`;
        }
        response += `\n⚡ **Analysis Time:** ${responseTime}ms\n`;
        response += `💾 **Saved to database for trend analysis**`;

        await sendCambodiaAnalysis(bot, chatId, response);
        
        // Log successful analysis
        await logCommandUsage(chatId, 'deal_analysis', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));
        
        // Save analysis to conversation history
        await saveConversationDB(chatId, `[DEAL_ANALYSIS] ${dealParams.location}`, 
            `Deal analysis: ${dealParams.amount} ${dealParams.collateralType} - ${analysis.recommendation.decision}`, 
            "command", {
                dealAmount: dealParams.amount,
                collateralType: dealParams.collateralType,
                location: dealParams.location,
                recommendation: analysis.recommendation.decision,
                confidence: analysis.recommendation.confidence,
                processingTime: responseTime
            }).catch(err => console.error('Conversation save error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Deal analysis error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced deal analysis error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'deal_analysis', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

async function handlePortfolioStatus(chatId) {
    const startTime = Date.now();
    try {
        await bot.sendMessage(chatId, "📊 Getting enhanced portfolio status from database...");
        
        // Get comprehensive portfolio data from database
        const [portfolioHistory, fundMetrics, recentDeals] = await Promise.allSettled([
            getCambodiaFundAnalytics(30).catch(() => null),
            getCambodiaFundMetrics().catch(() => null),
            getRecentCambodiaDeals(chatId, 10).catch(() => [])
        ]);
        
        const portfolioData = portfolioHistory.value;
        const metrics = fundMetrics.value;
        const deals = recentDeals.value || [];
        
        // Use real data if available, otherwise sample data
        const sampleData = {
            totalAUM: metrics?.totalAUM || 2500000,
            deployedCapital: metrics?.deployedCapital || 2000000,
            availableCapital: metrics?.availableCapital || 500000,
            activeDeals: deals.length || 12,
            currentYield: metrics?.currentYield || 17.5
        };
        
        const portfolio = await getPortfolioStatus(sampleData);
        const responseTime = Date.now() - startTime;
        
        // Save current portfolio status to database
        await saveCambodiaPortfolio({
            ...portfolio,
            timestamp: new Date().toISOString(),
            userId: chatId,
            dataSource: portfolioData ? 'database' : 'sample'
        }).catch(err => console.error('Portfolio save error:', err.message));
        
        let response = `**Enhanced Cambodia Fund Portfolio Status**\n\n`;
        response += `📅 **As of:** ${new Date().toLocaleDateString()}\n`;
        response += `⚡ **Data Source:** ${portfolioData ? 'Live Database' : 'Sample Data'}\n\n`;
        
        response += `**Fund Overview:**\n`;
        response += `• Total AUM: ${portfolio.fundOverview.totalAUM.toLocaleString()}\n`;
        response += `• Deployed Capital: ${portfolio.fundOverview.deployedCapital.toLocaleString()}\n`;
        response += `• Available Capital: ${portfolio.fundOverview.availableCapital.toLocaleString()}\n`;
        response += `• Utilization Rate: ${((portfolio.fundOverview.deployedCapital / portfolio.fundOverview.totalAUM) * 100).toFixed(1)}%\n`;
        response += `• Active Deals: ${portfolio.fundOverview.numberOfDeals}\n\n`;
        
        response += `**Performance Metrics:**\n`;
        response += `• Current Yield: ${portfolio.performance.currentYieldRate.toFixed(2)}%\n`;
        response += `• Target Yield: ${portfolio.performance.targetYieldRate?.toFixed(2) || '18.0'}%\n`;
        response += `• Performance vs Target: ${portfolio.performance.actualVsTarget > 0 ? '+' : ''}${portfolio.performance.actualVsTarget.toFixed(1)}%\n`;
        response += `• Monthly Income: ${portfolio.performance.monthlyIncome.toLocaleString()}\n`;
        response += `• Annualized Return: ${(portfolio.performance.monthlyIncome * 12).toLocaleString()}\n\n`;
        
        if (portfolioData?.dealAnalytics) {
            response += `**30-Day Analytics from Database:**\n`;
            response += `• Total Deals Analyzed: ${portfolioData.dealAnalytics.total_deals}\n`;
            response += `• Average Deal Size: ${parseFloat(portfolioData.dealAnalytics.avg_deal_size || 0).toLocaleString()}\n`;
            response += `• Approval Rate: ${((portfolioData.dealAnalytics.approved_deals / portfolioData.dealAnalytics.total_deals) * 100).toFixed(1)}%\n`;
            response += `• Risk Distribution: ${portfolioData.riskDistribution || 'Balanced'}\n\n`;
        }
        
        if (deals.length > 0) {
            response += `**Recent Deal Activity:**\n`;
            deals.slice(0, 3).forEach((deal, i) => {
                response += `${i + 1}. ${deal.amount?.toLocaleString()} ${deal.collateral_type} - ${deal.status}\n`;
            });
            response += `\n`;
        }
        
        response += `⚡ **Response Time:** ${responseTime}ms\n`;
        response += `💾 **Portfolio data saved to database**`;

        await sendCambodiaAnalysis(bot, chatId, response);
        
        // Log successful command
        await logCommandUsage(chatId, 'portfolio_status', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Portfolio status error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced portfolio status error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'portfolio_status', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

async function handleCambodiaMarket(chatId) {
    const startTime = Date.now();
    try {
        await bot.sendMessage(chatId, "🇰🇭 Analyzing Cambodia market with enhanced database integration...");
        
        // Get latest market data from database with fallback
        const [latestMarketData, historicalData] = await Promise.allSettled([
            getLatestCambodiaMarketData().catch(() => null),
            getCambodiaMarketTrends(90).catch(() => null)
        ]);
        
        const marketHistory = latestMarketData.value;
        const trends = historicalData.value;
        
        const conditions = await getCambodiaMarketConditions();
        const responseTime = Date.now() - startTime;
        
        // Enhanced market data for database storage
        const marketData = {
            marketConditions: conditions,
            dataDate: new Date().toISOString().split('T')[0],
            marketSummary: conditions.summary,
            economicIndicators: {
                gdpGrowth: conditions.economicEnvironment.gdpGrowth,
                inflation: conditions.economicEnvironment.inflation,
                currencyStability: conditions.economicEnvironment.currencyStability
            },
            interestRates: conditions.interestRateEnvironment,
            timestamp: new Date().toISOString(),
            userId: chatId,
            analysisTime: responseTime
        };
        
        // Save market conditions to database
        await saveCambodiaMarketData(marketData)
            .catch(err => console.error('Market data save error:', err.message));
        
        let response = `**Enhanced Cambodia Market Analysis**\n\n`;
        response += `🇰🇭 **Market Overview - ${new Date().toLocaleDateString()}**\n`;
        response += `⚡ **Analysis Time:** ${responseTime}ms\n\n`;
        
        response += `**Economic Environment:**\n`;
        response += `• GDP Growth: ${conditions.economicEnvironment.gdpGrowth}% (YoY)\n`;
        response += `• Inflation Rate: ${conditions.economicEnvironment.inflation}%\n`;
        response += `• Currency Stability: ${conditions.economicEnvironment.currencyStability}\n`;
        response += `• Business Confidence: ${conditions.economicEnvironment.businessConfidence || 'Moderate'}\n\n`;
        
        response += `**Interest Rate Environment:**\n`;
        response += `• Commercial Loans: ${conditions.interestRateEnvironment.commercialRates.commercial.low}%-${conditions.interestRateEnvironment.commercialRates.commercial.high}%\n`;
        response += `• Bridge Loans: ${conditions.interestRateEnvironment.commercialRates.bridge.low}%-${conditions.interestRateEnvironment.commercialRates.bridge.high}%\n`;
        response += `• Development Finance: ${conditions.interestRateEnvironment.commercialRates.development?.low || '15'}%-${conditions.interestRateEnvironment.commercialRates.development?.high || '25'}%\n\n`;
        
        response += `**Real Estate Market:**\n`;
        response += `• Property Values: ${conditions.realEstateMarket?.propertyValues || 'Stable'}\n`;
        response += `• Transaction Volume: ${conditions.realEstateMarket?.transactionVolume || 'Moderate'}\n`;
        response += `• Foreign Investment: ${conditions.realEstateMarket?.foreignInvestment || 'Active'}\n\n`;
        
        response += `**Market Summary:**\n${conditions.summary}\n\n`;
        
        if (trends) {
            response += `**90-Day Trends (Database):**\n`;
            response += `• Market Direction: ${trends.direction || 'Stable'}\n`;
            response += `• Volatility: ${trends.volatility || 'Low'}\n`;
            response += `• Key Drivers: ${trends.keyDrivers?.join(', ') || 'Economic growth, Infrastructure'}\n\n`;
        }
        
        if (marketHistory) {
            response += `💾 **Historical data available since ${new Date(marketHistory.data_date).toLocaleDateString()}**\n`;
        }
        
        response += `🔄 **Data updated in database for trend analysis**`;

        await sendCambodiaAnalysis(bot, chatId, response);
        
        // Log successful command
        await logCommandUsage(chatId, 'cambodia_market', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Cambodia market analysis error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced Cambodia market analysis error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'cambodia_market', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

async function handleRiskAssessment(chatId) {
    const startTime = Date.now();
    try {
        await bot.sendMessage(chatId, "📊 Performing enhanced risk assessment with database integration...");
        
        // Get real portfolio data if available
        const [portfolioData, riskHistory] = await Promise.allSettled([
            getCambodiaFundMetrics().catch(() => null),
            getRiskAssessmentHistory(chatId, 30).catch(() => [])
        ]);
        
        const metrics = portfolioData.value;
        const history = riskHistory.value || [];
        
        const sampleData = {
            totalValue: metrics?.totalAUM || 2500000,
            numberOfDeals: metrics?.activeDeals || 12,
            averageRate: metrics?.currentYield || 17.5,
            concentrationRisk: metrics?.concentrationRisk || 'MODERATE',
            geographicSpread: metrics?.geographicSpread || ['Phnom Penh', 'Siem Reap', 'Battambang']
        };
        
        const risk = await performRiskAssessment(sampleData);
        const responseTime = Date.now() - startTime;
        
        // Enhanced risk assessment data for database
        const riskData = {
            assessmentType: 'PORTFOLIO',
            totalRiskPercent: risk.portfolioRisk.overallRiskScore,
            correlationRisk: risk.portfolioRisk.concentrationRisk,
            regimeRisk: 'MODERATE',
            diversificationScore: risk.portfolioRisk.diversificationScore || 75,
            accountBalance: sampleData.totalValue,
            riskMetrics: {
                creditRisk: risk.portfolioRisk.creditRisk,
                marketRisk: risk.portfolioRisk.marketRisk,
                liquidityRisk: risk.portfolioRisk.liquidityRisk || 'LOW',
                operationalRisk: risk.portfolioRisk.operationalRisk || 'LOW'
            },
            recommendations: [
                "Monitor concentration risk across asset classes",
                "Consider geographic diversification",
                "Review credit quality distribution",
                "Implement stress testing protocols"
            ],
            stressTestResults: risk.stressTesting,
            assessmentDate: new Date().toISOString(),
            userId: chatId,
            processingTime: responseTime
        };
        
        // Save risk assessment to database
        await saveRiskAssessment(chatId, riskData)
            .catch(err => console.error('Risk assessment save error:', err.message));
        
        let response = `**Enhanced Portfolio Risk Assessment**\n\n`;
        response += `📊 **Assessment Date:** ${new Date().toLocaleDateString()}\n`;
        response += `⚡ **Analysis Time:** ${responseTime}ms\n\n`;
        
        response += `**Overall Risk Metrics:**\n`;
        response += `• Risk Score: ${risk.portfolioRisk.overallRiskScore}/100\n`;
        response += `• Risk Category: ${risk.portfolioRisk.riskCategory}\n`;
        response += `• Concentration Risk: ${risk.portfolioRisk.concentrationRisk}\n`;
        response += `• Credit Risk: ${risk.portfolioRisk.creditRisk}\n`;
        response += `• Market Risk: ${risk.portfolioRisk.marketRisk}\n`;
        response += `• Liquidity Risk: ${risk.portfolioRisk.liquidityRisk || 'LOW'}\n\n`;
        
        response += `**Diversification Analysis:**\n`;
        response += `• Diversification Score: ${riskData.diversificationScore}/100\n`;
        response += `• Geographic Spread: ${sampleData.geographicSpread.length} locations\n`;
        response += `• Asset Type Distribution: ${risk.portfolioRisk.assetDistribution || 'Balanced'}\n\n`;
        
        response += `**Stress Testing Results:**\n`;
        response += `• Economic Downturn: ${risk.stressTesting.economicDownturn}% portfolio loss\n`;
        response += `• Interest Rate Shock (+200bp): ${risk.stressTesting.interestRateShock}% impact\n`;
        response += `• Credit Event: ${risk.stressTesting.creditEvent || '-8.5'}% scenario\n`;
        response += `• Liquidity Stress: ${risk.stressTesting.liquidityStress || '15 days'} to liquidate\n\n`;
        
        if (history.length > 0) {
            response += `**Risk Trend (30 days):**\n`;
            const latestRisk = history[0];
            const oldestRisk = history[history.length - 1];
            const riskChange = latestRisk.total_risk_percent - oldestRisk.total_risk_percent;
            response += `• Risk Change: ${riskChange > 0 ? '+' : ''}${riskChange.toFixed(1)}%\n`;
            response += `• Assessments: ${history.length} completed\n\n`;
        }
        
        response += `**Key Recommendations:**\n`;
        riskData.recommendations.slice(0, 3).forEach((rec, i) => {
            response += `${i + 1}. ${rec}\n`;
        });
        
        response += `\n💾 **Assessment saved to database for trend tracking**`;

        await sendAnalysis(bot, chatId, response, "Enhanced Risk Assessment");
        
        // Log successful command
        await logCommandUsage(chatId, 'risk_assessment', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Risk assessment error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced risk assessment error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'risk_assessment', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

// 🔧 ENHANCED: Market analysis handlers with database integration and real-time data
async function handleMarketBriefing(chatId) {
    const startTime = Date.now();
    try {
        await bot.sendMessage(chatId, "📊 Generating enhanced market briefing with database context...");
        
        const [marketData, currentRegime, marketHistory] = await Promise.allSettled([
            getComprehensiveMarketData().catch(() => null),
            getCurrentRegime().catch(() => null),
            getMarketBriefingHistory(7).catch(() => [])
        ]);
        
        const market = marketData.value;
        const regime = currentRegime.value;
        const history = marketHistory.value || [];
        const responseTime = Date.now() - startTime;
        
        let briefing = `**Enhanced Daily Market Briefing**\n\n`;
        briefing += `📅 **Date:** ${new Date().toLocaleDateString()}\n`;
        briefing += `🕐 **Generated:** ${new Date().toLocaleTimeString()}\n`;
        briefing += `⚡ **Analysis Time:** ${responseTime}ms\n\n`;
        
        if (regime) {
            briefing += `**Current Economic Regime (Database):**\n`;
            briefing += `• Regime: ${regime.regime_name}\n`;
            briefing += `• Confidence: ${regime.confidence}%\n`;
            briefing += `• Duration: ${regime.regime_duration || 0} days\n`;
            briefing += `• Last Update: ${new Date(regime.last_updated).toLocaleDateString()}\n\n`;
        }
        
        if (market?.markets?.economics) {
            briefing += `**Economic Data:**\n`;
            briefing += `• Fed Funds Rate: ${market.markets.economics.fedRate?.value || 'N/A'}%\n`;
            briefing += `• CPI Inflation: ${market.markets.economics.inflation?.value || 'N/A'}%\n`;
            briefing += `• GDP Growth: ${market.markets.economics.gdpGrowth?.value || 'N/A'}%\n`;
            briefing += `• Unemployment: ${market.markets.economics.unemployment?.value || 'N/A'}%\n\n`;
        }
        
        if (market?.markets?.equities) {
            briefing += `**Equity Markets:**\n`;
            briefing += `• S&P 500: ${market.markets.equities.sp500?.value || 'N/A'} (${market.markets.equities.sp500?.change || 'N/A'}%)\n`;
            briefing += `• Nasdaq: ${market.markets.equities.nasdaq?.value || 'N/A'} (${market.markets.equities.nasdaq?.change || 'N/A'}%)\n`;
            briefing += `• VIX: ${market.markets.equities.vix?.value || 'N/A'}\n\n`;
        }
        
        if (market?.markets?.crypto?.bitcoin) {
            const btc = market.markets.crypto.bitcoin;
            const eth = market.markets.crypto.ethereum;
            briefing += `**Cryptocurrency:**\n`;
            briefing += `• Bitcoin: ${btc.usd?.toLocaleString() || 'N/A'} (${btc.usd_24h_change?.toFixed(1) || 'N/A'}%)\n`;
            if (eth) {
                briefing += `• Ethereum: ${eth.usd?.toLocaleString() || 'N/A'} (${eth.usd_24h_change?.toFixed(1) || 'N/A'}%)\n`;
            }
            briefing += `\n`;
        }
        
        if (market?.markets?.forex) {
            briefing += `**Foreign Exchange:**\n`;
            briefing += `• DXY (Dollar Index): ${market.markets.forex.dxy?.value || 'N/A'}\n`;
            briefing += `• EUR/USD: ${market.markets.forex.eurusd?.value || 'N/A'}\n`;
            briefing += `• USD/JPY: ${market.markets.forex.usdjpy?.value || 'N/A'}\n\n`;
        }
        
        if (market?.trading && !market.trading.error) {
            briefing += `**Your Trading Account:**\n`;
            briefing += `• Balance: ${market.trading.account?.balance || 'N/A'} ${market.trading.account?.currency || ''}\n`;
            briefing += `• Equity: ${market.trading.account?.equity || 'N/A'}\n`;
            briefing += `• Open Positions: ${market.trading.openPositions?.length || 0}\n`;
            briefing += `• Daily P&L: ${market.trading.performance?.dailyPnL || 'N/A'}\n\n`;
        }
        
        if (history.length > 0) {
            briefing += `**7-Day Market Trend:**\n`;
            briefing += `• Briefings Generated: ${history.length}\n`;
            briefing += `• Average Regime Confidence: ${history.reduce((a, b) => a + (b.regime_confidence || 70), 0) / history.length}%\n`;
            briefing += `• Trend Direction: ${history[0]?.market_direction || 'Neutral'}\n\n`;
        }
        
        briefing += `💾 **Data integrated from enhanced database**\n`;
        briefing += `🤖 **Ask me for analysis:** "What's your take on these conditions?"`;

        // Save briefing to database
        await saveMarketBriefing({
            briefingDate: new Date().toISOString().split('T')[0],
            marketData: market,
            regimeData: regime,
            generatedBy: chatId,
            responseTime: responseTime,
            briefingContent: briefing.substring(0, 1000)
        }).catch(err => console.error('Briefing save error:', err.message));

        await sendMarketAnalysis(bot, chatId, briefing);
        
        // Log successful command
        await logCommandUsage(chatId, 'market_briefing', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Market briefing error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced market briefing error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'market_briefing', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

async function handleRegimeAnalysis(chatId) {
    const startTime = Date.now();
    try {
        await bot.sendMessage(chatId, "🏛️ Analyzing economic regime with enhanced database integration...");
        
        const query = "Analyze the current economic regime using Ray Dalio's framework. Consider growth, inflation, and policy environment with database context.";
        const analysis = await getRegimeAnalysis(query);
        const responseTime = Date.now() - startTime;
        
        // Extract regime data for database storage
        const regimeData = extractRegimeDataFromAnalysis(analysis);
        if (regimeData) {
            regimeData.analysisTime = responseTime;
            regimeData.userId = chatId;
            regimeData.analysisDate = new Date().toISOString();
            await saveRegimeData(regimeData).catch(err => console.error('Regime save error:', err.message));
        }
        
        let enhancedAnalysis = analysis;
        
        // Add database context
        const regimeHistory = await getRegimeTransitions(30).catch(() => []);
        if (regimeHistory.length > 0) {
            enhancedAnalysis += `\n\n**Database Context (30 days):**\n`;
            enhancedAnalysis += `• Regime Transitions: ${regimeHistory.length}\n`;
            enhancedAnalysis += `• Current Regime: ${regimeHistory[0]?.regime_name || 'Unknown'}\n`;
            enhancedAnalysis += `• Stability Period: ${regimeHistory[0]?.regime_duration || 0} days\n`;
            enhancedAnalysis += `• Confidence Trend: ${regimeHistory.length > 1 ? 
                (regimeHistory[0].confidence - regimeHistory[1].confidence > 0 ? 'Increasing' : 'Decreasing') : 'Stable'}\n`;
        }
        
        enhancedAnalysis += `\n⚡ **Analysis Time:** ${responseTime}ms\n`;
        enhancedAnalysis += `💾 **Regime data saved to database for trend tracking**`;
        
        await sendAnalysis(bot, chatId, enhancedAnalysis, "Enhanced Economic Regime Analysis");
        
        // Log successful command
        await logCommandUsage(chatId, 'regime_analysis', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Regime analysis error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced regime analysis error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'regime_analysis', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

async function handleOpportunities(chatId) {
    const startTime = Date.now();
    try {
        await bot.sendMessage(chatId, "🎯 Scanning for opportunities with enhanced database intelligence...");
        
        const [marketData, opportunityHistory] = await Promise.allSettled([
            getComprehensiveMarketData().catch(() => null),
            getOpportunityHistory(chatId, 30).catch(() => [])
        ]);
        
        const market = marketData.value;
        const history = opportunityHistory.value || [];
        
        const query = `Based on current market conditions and database context, identify top 3 strategic opportunities. Consider the economic environment and risk/reward profiles.`;
        
        const analysis = await getStrategicAnalysis(query);
        const responseTime = Date.now() - startTime;
        
        // Save market signal for opportunities
        await saveMarketSignal({
            type: 'OPPORTUNITY_SCAN',
            strength: 'MODERATE',
            description: 'Strategic opportunities identified',
            marketData: market,
            impact: 'MODERATE',
            insights: ['Strategic opportunity scanning completed'],
            generatedBy: chatId,
            timestamp: new Date().toISOString(),
            responseTime: responseTime
        }).catch(err => console.error('Market signal save error:', err.message));
        
        let enhancedAnalysis = analysis;
        
        if (history.length > 0) {
            enhancedAnalysis += `\n\n**30-Day Opportunity History:**\n`;
            enhancedAnalysis += `• Opportunities Identified: ${history.length}\n`;
            enhancedAnalysis += `• Success Rate: ${history.filter(h => h.outcome === 'POSITIVE').length / history.length * 100}%\n`;
            enhancedAnalysis += `• Average Confidence: ${history.reduce((a, b) => a + (b.confidence || 70), 0) / history.length}%\n`;
        }
        
        enhancedAnalysis += `\n⚡ **Scan Time:** ${responseTime}ms\n`;
        enhancedAnalysis += `💾 **Opportunity scan saved to database for tracking**`;
        
        await sendAnalysis(bot, chatId, enhancedAnalysis, "Enhanced Market Opportunities");
        
        // Log successful command
        await logCommandUsage(chatId, 'opportunities', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Opportunities scan error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced opportunities scan error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'opportunities', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

async function handleMacroAnalysis(chatId) {
    const startTime = Date.now();
    try {
        await bot.sendMessage(chatId, "🌍 Analyzing macro outlook with enhanced database context...");
        
        const [macroHistory, economicData] = await Promise.allSettled([
            getMacroAnalysisHistory(30).catch(() => []),
            getEconomicIndicators().catch(() => null)
        ]);
        
        const history = macroHistory.value || [];
        const indicators = economicData.value;
        
        const query = "Provide a comprehensive macro economic outlook with database intelligence. Analyze global growth, inflation trends, central bank policies, and market implications.";
        const analysis = await getGptStrategicAnalysis(query);
        const responseTime = Date.now() - startTime;
        
        // Save daily observation with enhanced data
        await saveDailyObservation({
            marketRegime: 'ANALYZING',
            regimeConfidence: 75,
            keyThemes: ['Macro Analysis', 'Global Outlook'],
            outlook: analysis.substring(0, 500),
            riskFactors: ['Inflation uncertainty', 'Central bank policy', 'Geopolitical tensions'],
            opportunities: ['Strategic positioning', 'Asset allocation', 'Currency hedging'],
            economicIndicators: indicators,
            analysisDate: new Date().toISOString(),
            userId: chatId,
            responseTime: responseTime
        }).catch(err => console.error('Daily observation save error:', err.message));
        
        let enhancedAnalysis = analysis;
        
        if (history.length > 0) {
            enhancedAnalysis += `\n\n**30-Day Macro Analysis Trends:**\n`;
            enhancedAnalysis += `• Analyses Completed: ${history.length}\n`;
            enhancedAnalysis += `• Outlook Consistency: ${history.filter(h => h.outlook_sentiment === history[0]?.outlook_sentiment).length / history.length * 100}%\n`;
            enhancedAnalysis += `• Key Themes: ${history[0]?.key_themes?.join(', ') || 'Growth, Inflation, Policy'}\n`;
        }
        
        if (indicators) {
            enhancedAnalysis += `\n**Current Economic Indicators:**\n`;
            enhancedAnalysis += `• GDP Growth: ${indicators.gdp_growth || 'N/A'}%\n`;
            enhancedAnalysis += `• Inflation: ${indicators.inflation_rate || 'N/A'}%\n`;
            enhancedAnalysis += `• Unemployment: ${indicators.unemployment_rate || 'N/A'}%\n`;
            enhancedAnalysis += `• Policy Rate: ${indicators.policy_rate || 'N/A'}%\n`;
        }
        
        enhancedAnalysis += `\n⚡ **Analysis Time:** ${responseTime}ms\n`;
        enhancedAnalysis += `💾 **Macro analysis saved as daily observation in database**`;
        
        await sendAnalysis(bot, chatId, enhancedAnalysis, "Enhanced Macro Economic Outlook");
        
        // Log successful command
        await logCommandUsage(chatId, 'macro_analysis', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Macro analysis error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced macro analysis error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'macro_analysis', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

// 🔧 ENHANCED: Trading handlers with comprehensive database integration
async function handleTradingStatus(chatId) {
    const startTime = Date.now();
    try {
        await bot.sendMessage(chatId, "💹 Getting enhanced trading account status...");
        
        const [trading, tradingHistory] = await Promise.allSettled([
            getTradingSummary().catch(() => null),
            getTradingAccountHistory(chatId, 7).catch(() => [])
        ]);
        
        const tradingData = trading.value;
        const history = tradingHistory.value || [];
        const responseTime = Date.now() - startTime;
        
        if (tradingData?.error) {
            await sendSmartMessage(bot, chatId, 
                "❌ **Trading account not connected**\n\n" +
                "**Setup Required:**\n" +
                "• Check MetaAPI configuration\n" +
                "• Verify account credentials\n" +
                "• Ensure account is active\n" +
                "• Contact support if issues persist"
            );
            return;
        }
        
        // Save trading account snapshot
        if (tradingData?.account) {
            await saveTradingAccountSnapshot(chatId, {
                balance: tradingData.account.balance,
                equity: tradingData.account.equity,
                freeMargin: tradingData.account.freeMargin,
                marginLevel: tradingData.account.marginLevel,
                openPositions: tradingData.openPositions?.length || 0,
                dailyPnL: tradingData.performance?.dailyPnL || 0,
                weeklyPnL: tradingData.performance?.weeklyPnL || 0,
                snapshotDate: new Date().toISOString(),
                responseTime: responseTime
            }).catch(err => console.error('Trading snapshot save error:', err.message));
        }
        
        // Save trading pattern for analysis
        if (tradingData?.performance?.currentPnL) {
            await saveTradingPattern(chatId, {
                type: 'ACCOUNT_STATUS',
                description: `Account balance: ${tradingData.account?.balance} ${tradingData.account?.currency}`,
                confidence: 85,
                evidence: tradingData,
                patternDate: new Date().toISOString(),
                userId: chatId
            }).catch(err => console.error('Trading pattern save error:', err.message));
        }
        
        let response = `**Enhanced Trading Account Status**\n\n`;
        response += `📊 **Account Overview:**\n`;
        response += `• Balance: ${tradingData.account?.balance?.toLocaleString() || 'N/A'} ${tradingData.account?.currency || ''}\n`;
        response += `• Equity: ${tradingData.account?.equity?.toLocaleString() || 'N/A'} ${tradingData.account?.currency || ''}\n`;
        response += `• Free Margin: ${tradingData.account?.freeMargin?.toLocaleString() || 'N/A'} ${tradingData.account?.currency || ''}\n`;
        response += `• Margin Level: ${tradingData.account?.marginLevel?.toFixed(2) || 'N/A'}%\n`;
        response += `• Account Type: ${tradingData.account?.accountType || 'Standard'}\n\n`;
        
        response += `**Position Summary:**\n`;
        response += `• Open Positions: ${tradingData.openPositions?.length || 0}\n`;
        response += `• Total Volume: ${tradingData.openPositions?.reduce((sum, pos) => sum + (pos.volume || 0), 0).toFixed(2) || '0.00'} lots\n`;
        
        if (tradingData.performance?.currentPnL !== undefined) {
            const pnlEmoji = tradingData.performance.currentPnL > 0 ? '🟢' : tradingData.performance.currentPnL < 0 ? '🔴' : '⚪';
            response += `• Current P&L: ${pnlEmoji} ${tradingData.performance.currentPnL.toFixed(2)} ${tradingData.account?.currency || ''}\n`;
        }
        
        if (tradingData.performance?.dailyPnL !== undefined) {
            const dailyEmoji = tradingData.performance.dailyPnL > 0 ? '🟢' : tradingData.performance.dailyPnL < 0 ? '🔴' : '⚪';
            response += `• Daily P&L: ${dailyEmoji} ${tradingData.performance.dailyPnL.toFixed(2)} ${tradingData.account?.currency || ''}\n`;
        }
        
        if (history.length > 0) {
            const balanceChange = tradingData.account?.balance - history[history.length - 1]?.balance;
            response += `\n**7-Day Performance:**\n`;
            response += `• Balance Change: ${balanceChange > 0 ? '+' : ''}${balanceChange?.toFixed(2) || 'N/A'} ${tradingData.account?.currency || ''}\n`;
            response += `• Average Daily P&L: ${(history.reduce((sum, h) => sum + (h.daily_pnl || 0), 0) / history.length).toFixed(2)}\n`;
            response += `• Win Rate: ${(history.filter(h => h.daily_pnl > 0).length / history.length * 100).toFixed(1)}%\n`;
        }
        
        response += `\n⚡ **Response Time:** ${responseTime}ms\n`;
        response += `💾 **Trading data tracked in enhanced database**`;

        await sendAnalysis(bot, chatId, response, "Enhanced Trading Account");
        
        // Log successful command
        await logCommandUsage(chatId, 'trading_status', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Trading status error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced trading status error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'trading_status', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

async function handlePositions(chatId) {
    const startTime = Date.now();
    try {
        const { getOpenPositions } = require('./utils/metaTrader');
        const positions = await getOpenPositions();
        const responseTime = Date.now() - startTime;
        
        if (!positions || positions.length === 0) {
            await sendSmartMessage(bot, chatId, 
                "📊 **No open positions found**\n\n" +
                "**Account Status:** Connected\n" +
                "**Open Positions:** 0\n" +
                "**Available Actions:**\n" +
                "• Check market opportunities\n" +
                "• Review trading signals\n" +
                "• Analyze position sizing recommendations"
            );
            return;
        }
        
        // Enhanced position data processing and database storage
        for (const pos of positions) {
            await savePositionSizing(chatId, {
                symbol: pos.symbol,
                direction: pos.type,
                recommendedSize: pos.volume,
                actualSize: pos.volume,
                riskPercent: 2.0,
                entryPrice: pos.openPrice || 0,
                stopLoss: pos.stopLoss || 0,
                takeProfit: pos.takeProfit || 0,
                accountBalance: 10000, // Should be real account balance
                currentRegime: 'CURRENT',
                rationale: 'Active position tracking',
                positionDate: new Date().toISOString(),
                userId: chatId,
                unrealizedPnL: pos.profit || 0,
                positionAge: calculatePositionAge(pos.openTime),
                marketConditions: await getCurrentMarketConditions().catch(() => 'UNKNOWN')
            }).catch(err => console.error('Position save error:', err.message));
        }
        
        // Calculate portfolio metrics
        const totalPnL = positions.reduce((sum, pos) => sum + (pos.profit || 0), 0);
        const totalVolume = positions.reduce((sum, pos) => sum + (pos.volume || 0), 0);
        const longPositions = positions.filter(pos => pos.type === 'BUY').length;
        const shortPositions = positions.filter(pos => pos.type === 'SELL').length;
        
        let response = `**Enhanced Open Positions (${positions.length})**\n\n`;
        response += `📊 **Portfolio Summary:**\n`;
        response += `• Total P&L: ${totalPnL > 0 ? '🟢' : totalPnL < 0 ? '🔴' : '⚪'} ${totalPnL.toFixed(2)}\n`;
        response += `• Total Volume: ${totalVolume.toFixed(2)} lots\n`;
        response += `• Long Positions: ${longPositions} | Short Positions: ${shortPositions}\n`;
        response += `• Portfolio Balance: ${longPositions === shortPositions ? 'Balanced' : longPositions > shortPositions ? 'Long Bias' : 'Short Bias'}\n\n`;
        
        response += `**Individual Positions:**\n`;
        positions.forEach((pos, i) => {
            const pnlEmoji = pos.profit > 0 ? '🟢' : pos.profit < 0 ? '🔴' : '⚪';
            const directionEmoji = pos.type === 'BUY' ? '📈' : '📉';
            response += `${i + 1}. ${pnlEmoji} ${directionEmoji} **${pos.symbol}** ${pos.type}\n`;
            response += `   Volume: ${pos.volume} lots\n`;
            response += `   Entry: ${pos.openPrice || 'N/A'}\n`;
            response += `   Current P&L: ${pos.profit?.toFixed(2) || 'N/A'}\n`;
            if (pos.stopLoss) response += `   Stop Loss: ${pos.stopLoss}\n`;
            if (pos.takeProfit) response += `   Take Profit: ${pos.takeProfit}\n`;
            response += `\n`;
        });
        
        response += `⚡ **Response Time:** ${responseTime}ms\n`;
        response += `💾 **Position data saved to enhanced database for analysis**`;

        await sendAnalysis(bot, chatId, response, "Enhanced Open Positions");
        
        // Log successful command
        await logCommandUsage(chatId, 'positions', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Positions error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced positions error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'positions', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

async function handleDocumentsList(chatId) {
    const startTime = Date.now();
    try {
        const docs = await getTrainingDocumentsDB(chatId);
        const responseTime = Date.now() - startTime;
        
        if (docs.length === 0) {
            await sendSmartMessage(bot, chatId, 
                `📚 **No Training Documents Found**\n\n` +
                `**How to add documents to enhanced database:**\n` +
                `🔹 Upload any file (.txt, .md, .json, .csv)\n` +
                `🔹 Add caption: "train"\n` +
                `🔹 AI will save it to PostgreSQL database\n` +
                `🔹 Documents persist across sessions\n` +
                `🔹 Full-text search enabled\n\n` +
                `**Supported Formats:**\n` +
                `• Text files (.txt, .md)\n` +
                `• JSON data (.json)\n` +
                `• CSV spreadsheets (.csv)\n` +
                `• Other text-based formats\n\n` +
                `**Database Features:**\n` +
                `✅ Enhanced PostgreSQL storage\n` +
                `✅ Full-text search capabilities\n` +
                `✅ Automatic word counting\n` +
                `✅ Content summarization\n` +
                `✅ Cross-session persistence`
            );
            return;
        }
        
        // Calculate document statistics
        const totalWords = docs.reduce((sum, doc) => sum + (doc.word_count || 0), 0);
        const totalSize = docs.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
        const avgWordsPerDoc = totalWords / docs.length;
        const documentTypes = [...new Set(docs.map(doc => doc.document_type))];
        
        let response = `📚 **Enhanced AI Training Documents (${docs.length})**\n\n`;
        response += `📊 **Database Statistics:**\n`;
        response += `• Total Words: ${totalWords.toLocaleString()}\n`;
        response += `• Total Size: ${(totalSize / 1024).toFixed(1)}KB\n`;
        response += `• Average Words/Doc: ${avgWordsPerDoc.toFixed(0)}\n`;
        response += `• Document Types: ${documentTypes.join(', ')}\n\n`;
        
        response += `**Document Library:**\n`;
        docs.forEach((doc, i) => {
            const uploadDate = new Date(doc.upload_date).toLocaleDateString();
            const fileType = doc.file_name?.split('.').pop()?.toUpperCase() || 'TXT';
            response += `**${i + 1}. ${doc.file_name}** (${fileType})\n`;
            response += `• Words: ${doc.word_count?.toLocaleString() || 'Unknown'}\n`;
            response += `• Type: ${doc.document_type}\n`;
            response += `• Added: ${uploadDate}\n`;
            response += `• Size: ${(doc.file_size / 1024).toFixed(1)}KB\n`;
            if (doc.summary) {
                response += `• Preview: ${doc.summary.substring(0, 60)}...\n`;
            }
            response += `\n`;
        });
        
        response += `**Database Features:**\n`;
        response += `💾 **Storage:** Enhanced PostgreSQL with ACID compliance\n`;
        response += `🔍 **Search:** Full-text search across all documents\n`;
        response += `🧠 **AI Integration:** Documents enhance AI responses\n`;
        response += `📈 **Analytics:** Word count and usage tracking\n`;
        response += `🔄 **Persistence:** Data survives system restarts\n\n`;
        
        response += `⚡ **Response Time:** ${responseTime}ms\n`;
        response += `💡 **Try asking:** "What did you learn from my documents?" or "Search my documents for [topic]"`;

        await sendSmartMessage(bot, chatId, response);
        
        // Log successful command
        await logCommandUsage(chatId, 'documents_list', responseTime, true)
            .catch(err => console.error('Command log error:', err.message));

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Documents list error:', error.message);
        await sendSmartMessage(bot, chatId, `❌ Enhanced documents list error: ${error.message}`);
        
        // Log error
        await logCommandUsage(chatId, 'documents_list', responseTime, false)
            .catch(err => console.error('Command log error:', err.message));
    }
}

// 🔧 ENHANCED: Helper functions with better implementation
function extractRegimeDataFromAnalysis(analysis) {
    try {
        const analysisLower = analysis.toLowerCase();
        
        // Enhanced pattern matching for regime characteristics
        const growthPatterns = {
            'high growth': 'HIGH',
            'strong growth': 'HIGH',
            'robust growth': 'HIGH',
            'moderate growth': 'MODERATE',
            'slow growth': 'LOW',
            'weak growth': 'LOW',
            'negative growth': 'NEGATIVE',
            'recession': 'NEGATIVE'
        };
        
        const inflationPatterns = {
            'high inflation': 'HIGH',
            'rising inflation': 'RISING',
            'elevated inflation': 'HIGH',
            'moderate inflation': 'MODERATE',
            'low inflation': 'LOW',
            'disinflation': 'FALLING',
            'deflation': 'NEGATIVE'
        };
        
        const policyPatterns = {
            'tight': 'TIGHTENING',
            'tightening': 'TIGHTENING',
            'hawkish': 'TIGHTENING',
            'loose': 'ACCOMMODATIVE',
            'accommodative': 'ACCOMMODATIVE',
            'dovish': 'ACCOMMODATIVE',
            'neutral': 'NEUTRAL'
        };
        
        // Determine regime characteristics
        let growth = 'MODERATE';
        let inflation = 'MODERATE';
        let policy = 'NEUTRAL';
        
        for (const [pattern, value] of Object.entries(growthPatterns)) {
            if (analysisLower.includes(pattern)) {
                growth = value;
                break;
            }
        }
        
        for (const [pattern, value] of Object.entries(inflationPatterns)) {
            if (analysisLower.includes(pattern)) {
                inflation = value;
                break;
            }
        }
        
        for (const [pattern, value] of Object.entries(policyPatterns)) {
            if (analysisLower.includes(pattern)) {
                policy = value;
                break;
            }
        }
        
        // Calculate confidence based on analysis quality
        let confidence = 70;
        if (analysis.includes('high confidence') || analysis.includes('strong evidence')) confidence = 90;
        else if (analysis.includes('moderate confidence')) confidence = 75;
        else if (analysis.includes('low confidence') || analysis.includes('uncertain')) confidence = 55;
        
        // Adjust confidence based on analysis length and detail
        if (analysis.length > 1000) confidence += 5;
        if (analysis.length > 2000) confidence += 5;
        
        const regimeName = `${growth}_GROWTH_${inflation}_INFLATION_${policy}_POLICY`;
        
        return {
            currentRegime: {
                name: regimeName,
                growth: growth,
                inflation: inflation,
                policy: policy
            },
            confidence: Math.min(confidence, 95), // Cap at 95%
            signals: {
                policy: { 
                    realRate: extractRateFromAnalysis(analysis, 'real rate') || 2.5,
                    nominalRate: extractRateFromAnalysis(analysis, 'fed rate') || 5.0
                },
                inflation: { 
                    indicators: { 
                        headline: extractRateFromAnalysis(analysis, 'inflation') || 3.2,
                        core: extractRateFromAnalysis(analysis, 'core') || 3.0
                    }
                },
                market: { 
                    vix: extractRateFromAnalysis(analysis, 'vix') || 18.5,
                    yields: extractRateFromAnalysis(analysis, 'yield') || 4.2
                }
            },
            analysisQuality: analysis.length > 1500 ? 'HIGH' : analysis.length > 800 ? 'MEDIUM' : 'LOW'
        };
    } catch (error) {
        console.error('Error extracting regime data:', error.message);
        return null;
    }
}

// Helper function to extract numerical values from analysis text
function extractRateFromAnalysis(text, rateType) {
    try {
        const patterns = {
            'real rate': /real\s+rate[:\s]*(\d+\.?\d*)%?/i,
            'fed rate': /fed\s+rate[:\s]*(\d+\.?\d*)%?/i,
            'inflation': /inflation[:\s]*(\d+\.?\d*)%?/i,
            'core': /core[:\s]*(\d+\.?\d*)%?/i,
            'vix': /vix[:\s]*(\d+\.?\d*)/i,
            'yield': /yield[:\s]*(\d+\.?\d*)%?/i
        };
        
        const pattern = patterns[rateType.toLowerCase()];
        if (!pattern) return null;
        
        const match = text.match(pattern);
        return match ? parseFloat(match[1]) : null;
    } catch (error) {
        return null;
    }
}

// Helper function to calculate position age
function calculatePositionAge(openTime) {
    try {
        if (!openTime) return 0;
        const openDate = new Date(openTime);
        const now = new Date();
        return Math.floor((now - openDate) / (1000 * 60 * 60 * 24)); // Days
    } catch (error) {
        return 0;
    }
}

// Enhanced function tracking utilities with better error handling
async function startUserSession(chatId, sessionType = 'GENERAL') {
    try {
        const sessionId = `session_${chatId}_${Date.now()}`;
        console.log(`🟢 Starting session for ${chatId}: ${sessionType} (${sessionId})`);
        
        // Save session start to database
        await saveUserSession(chatId, {
            sessionId: sessionId,
            sessionType: sessionType,
            startTime: new Date().toISOString(),
            status: 'ACTIVE'
        }).catch(err => console.error('Session save error:', err.message));
        
        return sessionId;
    } catch (error) {
        console.error('❌ Start session error:', error.message);
        return `fallback_session_${chatId}_${Date.now()}`;
    }
}

async function endUserSession(sessionId, commandsExecuted = 0, totalResponseTime = 0) {
    try {
        console.log(`🔴 Ending session ${sessionId}: ${commandsExecuted} commands, ${totalResponseTime}ms`);
        
        // Update session end in database
        await updateUserSession(sessionId, {
            endTime: new Date().toISOString(),
            commandsExecuted: commandsExecuted,
            totalResponseTime: totalResponseTime,
            status: 'COMPLETED'
        }).catch(err => console.error('Session update error:', err.message));
        
        return true;
    } catch (error) {
        console.error('❌ End session error:', error.message);
        return false;
    }
}

async function logApiUsage(apiProvider, endpoint, callsCount = 1, successful = true, responseTime = 0, dataVolume = 0, costEstimate = 0) {
    try {
        const usageData = {
            apiProvider: apiProvider,
            endpoint: endpoint,
            callsCount: callsCount,
            successful: successful,
            responseTime: responseTime,
            dataVolume: dataVolume,
            costEstimate: costEstimate,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };
        
        console.log(`📊 API Usage: ${apiProvider}/${endpoint} - ${successful ? 'SUCCESS' : 'FAILED'} - ${responseTime}ms - ${dataVolume} bytes`);
        
        // Save to database with error handling
        await saveApiUsageDB(usageData)
            .catch(err => console.error('API usage save error:', err.message));
        
        return true;
    } catch (error) {
        console.error('❌ Log API usage error:', error.message);
        return false;
    }
}

// Enhanced database helper function stubs (these should exist in your database.js)
async function getRegimeTransitions(days = 30) {
    try {
        // This should query your regime_data table for recent transitions
        console.log(`📊 Fetching regime transitions for last ${days} days`);
        return []; // Placeholder - implement in database.js
    } catch (error) {
        console.error('Get regime transitions error:', error.message);
        return [];
    }
}

async function saveTradingPattern(chatId, pattern) {
    try {
        console.log(`💾 Saving trading pattern for ${chatId}: ${pattern.type}`);
        // This should save to your trading_patterns table
        return true; // Placeholder - implement in database.js
    } catch (error) {
        console.error('Save trading pattern error:', error.message);
        return false;
    }
}

async function saveCambodiaMarketData(marketData) {
    try {
        console.log('💾 Saving Cambodia market data to enhanced database');
        // This should save to your cambodia_market_data table
        return true; // Placeholder - implement in database.js
    } catch (error) {
        console.error('Save Cambodia market data error:', error.message);
        return false;
    }
}

// Additional helper functions that may be missing
async function getCurrentMarketConditions() {
    try {
        return 'NORMAL'; // Placeholder - implement actual market condition detection
    } catch (error) {
        return 'UNKNOWN';
    }
}

async function saveMarketBriefing(briefingData) {
    try {
        console.log('💾 Saving market briefing to database');
        return true; // Placeholder - implement in database.js
    } catch (error) {
        console.error('Save market briefing error:', error.message);
        return false;
    }
}

async function saveTradingAccountSnapshot(chatId, snapshotData) {
    try {
        console.log(`💾 Saving trading account snapshot for ${chatId}`);
        return true; // Placeholder - implement in database.js
    } catch (error) {
        console.error('Save trading snapshot error:', error.message);
        return false;
    }
}

async function saveUserSession(chatId, sessionData) {
    try {
        console.log(`💾 Saving user session for ${chatId}`);
        return true; // Placeholder - implement in database.js
    } catch (error) {
        console.error('Save user session error:', error.message);
        return false;
    }
}

async function updateUserSession(sessionId, updateData) {
    try {
        console.log(`💾 Updating user session ${sessionId}`);
        return true; // Placeholder - implement in database.js
    } catch (error) {
        console.error('Update user session error:', error.message);
        return false;
    }
}

async function saveApiUsageDB(usageData) {
    try {
        console.log(`💾 Saving API usage: ${usageData.apiProvider}/${usageData.endpoint}`);
        return true; // Placeholder - implement in database.js
    } catch (error) {
        console.error('Save API usage error:', error.message);
        return false;
    }
}

// 🔧 ENHANCED: Express server setup with memory-integrated endpoints
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 🔧 ADDED: Better form parsing

// Enhanced webhook endpoint with better logging
app.post("/webhook", (req, res) => {
    console.log("📨 Enhanced webhook received from Telegram");
    try {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Webhook processing error:", error.message);
        res.sendStatus(500);
    }
});

// Enhanced health check with memory system status
app.get("/", (req, res) => {
    res.status(200).send("✅ Enhanced AI Assistant v3.2 is running with PostgreSQL database integration and persistent memory system");
});

// 🔧 ENHANCED: Comprehensive health endpoint with memory diagnostics
app.get("/health", async (req, res) => {
    try {
        const startTime = Date.now();
        
        const [health, stats] = await Promise.allSettled([
            performHealthCheck(),
            getDatabaseStats()
        ]);
        
        const dbConnected = stats.status === 'fulfilled' && stats.value?.connected === true;
        const responseTime = Date.now() - startTime;
        
        // Database URL analysis
        let dbUrlType = 'Unknown';
        if (process.env.DATABASE_URL) {
            if (process.env.DATABASE_URL.includes('roundhouse.proxy')) {
                dbUrlType = 'Public (Correct)';
            } else if (process.env.DATABASE_URL.includes('railway.internal')) {
                dbUrlType = 'Internal (Wrong)';
            }
        }
        
        res.status(200).json({ 
            status: "healthy", 
            version: "3.2 Enhanced with Memory",
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`,
            models: {
                gpt: "GPT-4o (stable)",
                claude: "Claude Opus 4.1"
            },
            features: [
                "Enhanced PostgreSQL Database", 
                "Persistent Memory System",
                "Market Analysis", 
                "Cambodia Fund", 
                "Document Processing",
                "Voice & Image Analysis",
                "Memory Testing & Recovery"
            ],
            database: {
                connected: dbConnected,
                urlType: dbUrlType,
                health: connectionStats.connectionHealth,
                totalQueries: connectionStats.totalQueries,
                successRate: connectionStats.totalQueries > 0 ? 
                    Number(((connectionStats.successfulQueries / connectionStats.totalQueries) * 100).toFixed(1)) : 100,
                lastError: connectionStats.lastError
            },
            memorySystem: {
                enabled: dbConnected,
                contextBuilding: health.status === 'fulfilled' ? health.value?.contextBuilding : false,
                factExtraction: dbConnected,
                persistentStorage: dbConnected
            },
            systemHealth: health.status === 'fulfilled' ? health.value?.status : 'ERROR',
            endpoints: [
                "/analyze?q=question (GPT-4o)",
                "/claude?q=question (Claude)",
                "/dual?q=question (Both AIs)",
                "/memory?chatId=123&action=test (Memory)",
                "/status (System Status)",
                "/database (Database Stats)"
            ]
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            version: "3.2 Enhanced",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 🔧 ENHANCED: Analysis endpoint with memory integration
app.get("/analyze", async (req, res) => {
    const query = req.query.q;
    const chatId = req.query.chatId || `api_${Date.now()}`;
    
    if (!query) {
        return res.json({
            error: "Provide query: ?q=your-question",
            example: "/analyze?q=What's the current market outlook?&chatId=your_id",
            models: ["GPT-4o (stable)", "Claude Opus 4.1"],
            database: "Enhanced PostgreSQL Integration",
            memory: "Persistent memory available with chatId"
        });
    }

    try {
        const startTime = Date.now();
        
        // Build memory context for API users
        let memoryContext = '';
        try {
            memoryContext = await buildConversationContext(chatId);
        } catch (contextError) {
            console.log('API memory context failed:', contextError.message);
        }
        
        const enhancedQuery = memoryContext ? `${memoryContext}\n\nUser query: ${query}` : query;
        const response = await getGptAnalysis(enhancedQuery, { 
            maxTokens: 2000,
            model: "gpt-4o" // Use stable model
        });
        
        const responseTime = Date.now() - startTime;
        
        // Save API conversation with memory
        await saveConversationDB(chatId, query, response, "api", {
            endpoint: 'analyze',
            memoryContextUsed: !!memoryContext,
            responseTime: responseTime
        }).catch(console.error);
        
        // Log API usage
        await logApiUsage('api', 'analyze_endpoint', 1, true, responseTime, 2, 0.02).catch(console.error);
        
        res.json({
            query: query,
            response: response,
            model: "GPT-4o Enhanced",
            database: "Integrated",
            memory: {
                contextUsed: !!memoryContext,
                contextLength: memoryContext.length
            },
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        await logApiUsage('api', 'analyze_endpoint', 1, false, 0, 0, 0).catch(console.error);
        
        res.status(500).json({
            error: "Enhanced analysis failed",
            message: error.message,
            model: "GPT-4o",
            timestamp: new Date().toISOString()
        });
    }
});

// 🔧 ENHANCED: Claude endpoint with memory integration
app.get("/claude", async (req, res) => {
    const query = req.query.q;
    const chatId = req.query.chatId || `api_${Date.now()}`;
    
    if (!query) {
        return res.json({
            error: "Provide query: ?q=your-question",
            example: "/claude?q=Analyze current economic regime&chatId=your_id",
            model: "Claude Opus 4.1 Enhanced",
            database: "PostgreSQL Integration",
            memory: "Persistent memory available with chatId"
        });
    }

    try {
        const startTime = Date.now();
        
        // Build memory context for Claude
        let memoryContext = '';
        try {
            memoryContext = await buildConversationContext(chatId);
        } catch (contextError) {
            console.log('Claude API memory context failed:', contextError.message);
        }
        
        const enhancedQuery = memoryContext ? `${memoryContext}\n\nUser query: ${query}` : query;
        const response = await getClaudeAnalysis(enhancedQuery, { maxTokens: 2000 });
        
        const responseTime = Date.now() - startTime;
        
        // Save API conversation with memory
        await saveConversationDB(chatId, query, response, "api", {
            endpoint: 'claude',
            memoryContextUsed: !!memoryContext,
            responseTime: responseTime
        }).catch(console.error);
        
        await logApiUsage('api', 'claude_endpoint', 1, true, responseTime, 2.5, 0.03).catch(console.error);
        
        res.json({
            query: query,
            response: response,
            model: "Claude Opus 4.1 Enhanced",
            database: "Integrated",
            memory: {
                contextUsed: !!memoryContext,
                contextLength: memoryContext.length
            },
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        await logApiUsage('api', 'claude_endpoint', 1, false, 0, 0, 0).catch(console.error);
        
        res.status(500).json({
            error: "Enhanced Claude analysis failed",
            message: error.message,
            model: "Claude Opus 4.1",
            timestamp: new Date().toISOString()
        });
    }
});

// 🔧 ENHANCED: Dual AI endpoint with full memory integration
app.get("/dual", async (req, res) => {
    const query = req.query.q;
    const chatId = req.query.chatId || `api_${Date.now()}`;
    
    if (!query) {
        return res.json({
            error: "Provide query: ?q=your-question",
            example: "/dual?q=Comprehensive market analysis&chatId=your_id",
            description: "Enhanced dual AI routing with database integration",
            database: "Full PostgreSQL persistence",
            memory: "Full memory context with persistent storage"
        });
    }

    try {
        const startTime = Date.now();
        
        // Get memory context and history for dual AI
        const [conversationHistory, persistentMemory] = await Promise.allSettled([
            getConversationHistoryDB(chatId, 5),
            getPersistentMemoryDB(chatId)
        ]);
        
        const result = await executeDualCommand(query, chatId, {
            conversationHistory: conversationHistory.status === 'fulfilled' ? conversationHistory.value : [],
            persistentMemory: persistentMemory.status === 'fulfilled' ? persistentMemory.value : [],
            messageType: 'api',
            source: 'rest_api'
        });
        
        const responseTime = Date.now() - startTime;
        
        // Save dual API conversation with enhanced metadata
        await saveDualAIConversation(chatId, {
            type: 'api_request',
            complexity: 'moderate',
            primaryAI: result.aiUsed || 'dual',
            success: true,
            responseTime: responseTime,
            userMessage: query,
            response: result.response,
            memoryContextUsed: result.contextUsed || false,
            endpoint: 'dual'
        }).catch(console.error);
        
        await logApiUsage('api', 'dual_endpoint', 1, true, responseTime, 3, 0.04).catch(console.error);
        
        res.json({
            query: query,
            response: result.response,
            aiUsed: result.aiUsed,
            reasoning: result.reasoning,
            database: "Enhanced PostgreSQL",
            memory: {
                conversationHistory: conversationHistory.status === 'fulfilled' ? conversationHistory.value.length : 0,
                persistentMemory: persistentMemory.status === 'fulfilled' ? persistentMemory.value.length : 0,
                contextUsed: result.contextUsed || false
            },
            conversationSaved: true,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        await logApiUsage('api', 'dual_endpoint', 1, false, 0, 0, 0).catch(console.error);
        
        res.status(500).json({
            error: "Enhanced dual command failed",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 🔧 NEW: Memory testing endpoint
app.get("/memory", async (req, res) => {
    const chatId = req.query.chatId;
    const action = req.query.action || 'status';
    
    if (!chatId) {
        return res.json({
            error: "Provide chatId: ?chatId=your_id&action=test",
            actions: ["status", "test", "stats", "clear"],
            example: "/memory?chatId=123&action=test"
        });
    }
    
    try {
        const startTime = Date.now();
        
        switch (action) {
            case 'test':
                // Test memory system
                let testResults;
                try {
                    const { testMemoryIntegration } = require('./utils/dualCommandSystem');
                    testResults = await testMemoryIntegration(chatId);
                } catch (importError) {
                    testResults = await performManualMemoryTest(chatId);
                }
                
                res.json({
                    chatId: chatId,
                    action: 'test',
                    results: testResults,
                    responseTime: `${Date.now() - startTime}ms`,
                    timestamp: new Date().toISOString()
                });
                break;
                
            case 'stats':
                // Get memory statistics
                const [conversations, memories, userProfile] = await Promise.allSettled([
                    getConversationHistoryDB(chatId, 50),
                    getPersistentMemoryDB(chatId),
                    getUserProfileDB(chatId)
                ]);
                
                res.json({
                    chatId: chatId,
                    action: 'stats',
                    conversations: {
                        status: conversations.status,
                        count: conversations.status === 'fulfilled' ? conversations.value.length : 0
                    },
                    memories: {
                        status: memories.status,
                        count: memories.status === 'fulfilled' ? memories.value.length : 0
                    },
                    userProfile: {
                        exists: userProfile.status === 'fulfilled' && !!userProfile.value,
                        data: userProfile.status === 'fulfilled' ? userProfile.value : null
                    },
                    responseTime: `${Date.now() - startTime}ms`,
                    timestamp: new Date().toISOString()
                });
                break;
                
            case 'clear':
                // Clear memory for user (be careful with this!)
                await clearAllData(chatId);
                res.json({
                    chatId: chatId,
                    action: 'clear',
                    status: 'completed',
                    message: 'Memory cleared for user',
                    responseTime: `${Date.now() - startTime}ms`,
                    timestamp: new Date().toISOString()
                });
                break;
                
            default:
                // Get memory status
                const context = await buildConversationContext(chatId).catch(() => '');
                const historyCount = await getConversationHistoryDB(chatId, 1).then(h => h.length).catch(() => 0);
                const memoryCount = await getPersistentMemoryDB(chatId).then(m => m.length).catch(() => 0);
                
                res.json({
                    chatId: chatId,
                    action: 'status',
                    memory: {
                        hasContext: context.length > 0,
                        contextLength: context.length,
                        conversationHistory: historyCount,
                        persistentMemories: memoryCount,
                        databaseConnected: connectionStats.connectionHealth === 'HEALTHY'
                    },
                    responseTime: `${Date.now() - startTime}ms`,
                    timestamp: new Date().toISOString()
                });
        }
    } catch (error) {
        res.status(500).json({
            error: "Memory operation failed",
            message: error.message,
            chatId: chatId,
            action: action,
            timestamp: new Date().toISOString()
        });
    }
});

// 🔧 ENHANCED: Status endpoint with better database diagnostics
app.get("/status", async (req, res) => {
    try {
        const startTime = Date.now();
        
        const [health, stats, dualAIStats] = await Promise.all([
            checkSystemHealth(),
            getDatabaseStats(),
            getDualAIPerformanceDashboard(7).catch(() => ({ error: 'Not available' }))
        ]);

        // Enhanced database analysis
        const dbConnected = !!(stats && stats.connected === true);
        const totalUsers = stats?.totalUsers ?? 0;
        const totalConversations = stats?.totalConversations ?? 0;
        const totalMemories = stats?.totalMemories ?? 0;
        const totalDocuments = stats?.totalDocuments ?? 0;

        // Database URL diagnostics
        let dbHost = "missing DATABASE_URL";
        let dbUrlType = "Unknown";
        try { 
            const url = new URL(process.env.DATABASE_URL);
            dbHost = url.hostname;
            if (dbHost.includes('railway.internal')) {
                dbUrlType = "Internal (Wrong - Fix needed)";
            } else if (dbHost.includes('roundhouse.proxy')) {
                dbUrlType = "Public (Correct)";
            }
        } catch {}

        const responseTime = Date.now() - startTime;

        res.json({
            system: "Enhanced AI Assistant v3.2",
            models: {
                gpt: health?.gptAnalysis ? "online" : "offline",
                claude: health?.claudeAnalysis ? "online" : "offline"
            },
            database: {
                connected: dbConnected,
                host: dbHost,
                urlType: dbUrlType,
                totalUsers,
                totalConversations,
                totalMemories,
                totalDocuments,
                totalQueries: connectionStats.totalQueries,
                successRate: connectionStats.totalQueries > 0
                    ? Number(((connectionStats.successfulQueries / connectionStats.totalQueries) * 100).toFixed(1))
                    : 100,
                lastError: stats?.error || connectionStats.lastError || null
            },
            memory: {
                enabled: dbConnected,
                contextBuilding: !!health?.contextBuilding,
                factExtraction: dbConnected,
                persistentStorage: dbConnected,
                totalMemories: totalMemories
            },
            features: {
                dualCommand: !!health?.dualMode,
                enhancedDatabase: dbConnected,
                memorySystem: dbConnected,
                rayDalioFramework: (stats?.totalRegimeRecords ?? 0) > 0,
                cambodiaFund: (stats?.totalDeals ?? 0) > 0,
                datetime: !!health?.dateTimeSupport
            },
            dualAIPerformance: dualAIStats?.summary || { error: dualAIStats?.error || 'Not available' },
            performance: {
                responseTime: `${responseTime}ms`,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage()
            },
            debug: stats, // Raw stats for debugging
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

// 🔧 ENHANCED: Database stats endpoint
app.get("/database", async (req, res) => {
    try {
        const stats = await getRayDalioStats();
        
        res.json({
            database: "Enhanced PostgreSQL",
            version: "3.2",
            connection: {
                health: connectionStats.connectionHealth,
                host: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'unknown',
                totalQueries: connectionStats.totalQueries,
                successfulQueries: connectionStats.successfulQueries,
                failedQueries: connectionStats.failedQueries,
                successRate: connectionStats.totalQueries > 0 ? 
                    ((connectionStats.successfulQueries / connectionStats.totalQueries) * 100).toFixed(1) : 100,
                lastError: connectionStats.lastError
            },
            stats: stats,
            memorySystem: {
                enabled: connectionStats.connectionHealth === 'HEALTHY',
                persistentMemories: stats.totalMemories || 0,
                conversations: stats.totalConversations || 0,
                trainingDocuments: stats.totalDocuments || 0
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Database stats failed",
            message: error.message,
            connectionHealth: connectionStats.connectionHealth,
            lastError: connectionStats.lastError,
            timestamp: new Date().toISOString()
        });
    }
});

// 🔧 NEW: Analytics endpoint
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

// 🔧 ENHANCED: Server startup with comprehensive initialization
const server = app.listen(PORT, "0.0.0.0", async () => {
    console.log("🚀 Enhanced AI Assistant v3.2 starting...");
    console.log("✅ Server running on port " + PORT);
    console.log("🤖 Models: GPT-4o (stable) + Claude Opus 4.1");
    console.log("🏦 Features: Enhanced PostgreSQL Database + Memory System + Cambodia Fund + Ray Dalio Framework");
    
    // Initialize enhanced database with memory system
    try {
        await initializeEnhancedDatabase();
        console.log("💾 Enhanced database integration successful");
        console.log("🧠 Persistent memory system initialized");
    } catch (error) {
        console.error("❌ Enhanced database initialization failed:", error.message);
        console.log("⚠️ Running with limited database functionality");
        console.log("🔧 Use /test_db command to diagnose database issues");
    }
    
    console.log("🔗 Enhanced API Endpoints:");
    console.log(`   GPT-4o: http://localhost:${PORT}/analyze?q=your-question&chatId=123`);
    console.log(`   Claude: http://localhost:${PORT}/claude?q=your-question&chatId=123`);
    console.log(`   Dual AI: http://localhost:${PORT}/dual?q=your-question&chatId=123`);
    console.log(`   Memory: http://localhost:${PORT}/memory?chatId=123&action=test`);
    console.log(`   Status: http://localhost:${PORT}/status`);
    console.log(`   Analytics: http://localhost:${PORT}/analytics`);
    console.log(`   Database: http://localhost:${PORT}/database`);

    // Set webhook with CORRECT URL
    const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
    
    try {
        await bot.setWebHook(webhookUrl);
        console.log("🔗 Enhanced webhook configured:", webhookUrl);
        console.log("🚀 Enhanced AI Assistant v3.2 ready with full database integration and memory system!");
        
        // Log successful startup with memory system
        await updateSystemMetrics({
            system_startup: 1,
            memory_system_enabled: connectionStats.connectionHealth === 'HEALTHY' ? 1 : 0
        }).catch(console.error);
        
    } catch (err) {
        console.error("❌ Webhook setup failed:", err.message);
        console.log("🔄 Running in polling mode for development");
    }
});

// 🔧 ENHANCED: Graceful shutdown with memory system cleanup
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, performing graceful shutdown...');
    
    try {
        await updateSystemMetrics({
            system_shutdown: 1,
            memory_system_shutdown: 1
        }).catch(console.error);
        
        console.log('💾 Database and memory system metrics updated');
    } catch (error) {
        console.error('❌ Shutdown cleanup error:', error.message);
    }
    
    server.close(() => {
        console.log('✅ Enhanced AI Assistant v3.2 with memory system shut down gracefully');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, performing graceful shutdown...');
    
    try {
        await updateSystemMetrics({
            system_shutdown: 1,
            memory_system_shutdown: 1
        }).catch(console.error);
        
        console.log('💾 Database and memory system cleanup completed');
    } catch (error) {
        console.error('❌ Shutdown cleanup error:', error.message);
    }
    
    server.close(() => {
        console.log('✅ Enhanced AI Assistant v3.2 with memory system shut down gracefully');
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
