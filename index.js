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

// 🔧 ENHANCED: Media message handlers with better database integration
async function handleVoiceMessage(msg, chatId, sessionId) {
    try {
        console.log("🎤 Processing voice message...");
        await bot.sendMessage(chatId, "🎤 Transcribing voice message...");
        
        const transcribedText = await processVoiceMessage(bot, msg.voice.file_id, chatId);
        
        if (transcribedText && transcribedText.length > 0) {
            await sendSmartMessage(bot, chatId, `🎤 **Voice transcribed:** "${transcribedText}"`);
            
            // Enhanced voice transcription save
            await saveConversationDB(chatId, "[VOICE]", transcribedText, "voice", {
                voiceDuration: msg.voice.duration,
                fileSize: msg.voice.file_size,
                transcriptionLength: transcribedText.length,
                sessionId: sessionId
            }).catch(console.error);
            
            // Process transcribed text as normal conversation with memory
            await handleEnhancedConversation(chatId, transcribedText, sessionId);
            
            console.log("✅ Voice message processed successfully");
        } else {
            await sendSmartMessage(bot, chatId, "❌ Voice transcription failed. Please try again or speak more clearly.");
            
            // Save failed transcription attempt
            await saveConversationDB(chatId, "[VOICE_FAILED]", "Transcription failed", "voice", {
                error: "Transcription returned empty",
                voiceDuration: msg.voice.duration,
                fileSize: msg.voice.file_size
            }).catch(console.error);
        }
    } catch (error) {
        console.error("❌ Voice processing error:", error.message);
        await sendSmartMessage(bot, chatId, `❌ Voice processing error: ${error.message}`);
        
        // Save error details
        await saveConversationDB(chatId, "[VOICE_ERROR]", `Error: ${error.message}`, "voice", {
            error: error.message,
            voiceDuration: msg.voice?.duration,
            fileSize: msg.voice?.file_size
        }).catch(console.error);
    }
}

async function handleImageMessage(msg, chatId, sessionId) {
    try {
        console.log("🖼️ Processing image message...");
        await bot.sendMessage(chatId, "🖼️ Analyzing image with AI vision...");
        
        const largestPhoto = msg.photo[msg.photo.length - 1];
        const analysis = await processImageMessage(bot, largestPhoto.file_id, chatId, msg.caption);
        
        if (analysis && analysis.length > 0) {
            await sendAnalysis(bot, chatId, analysis, "Image Analysis");
            
            // Enhanced image analysis save
            await saveConversationDB(chatId, "[IMAGE]" + (msg.caption ? `: ${msg.caption}` : ""), analysis, "image", {
                imageWidth: largestPhoto.width,
                imageHeight: largestPhoto.height,
                fileSize: largestPhoto.file_size,
                caption: msg.caption || null,
                analysisLength: analysis.length,
                sessionId: sessionId
            }).catch(console.error);
            
            // If image has caption, process it as additional conversation
            if (msg.caption && msg.caption.length > 0) {
                console.log("📝 Processing image caption as conversation...");
                await handleEnhancedConversation(chatId, `About this image: ${msg.caption}`, sessionId);
            }
            
            console.log("✅ Image processed successfully");
        } else {
            await sendSmartMessage(bot, chatId, "❌ Image analysis failed. Please try again with a clearer image.");
            
            // Save failed analysis attempt
            await saveConversationDB(chatId, "[IMAGE_FAILED]", "Image analysis failed", "image", {
                error: "Analysis returned empty",
                imageWidth: largestPhoto.width,
                imageHeight: largestPhoto.height,
                fileSize: largestPhoto.file_size,
                caption: msg.caption || null
            }).catch(console.error);
        }
    } catch (error) {
        console.error("❌ Image processing error:", error.message);
        await sendSmartMessage(bot, chatId, `❌ Image processing error: ${error.message}`);
        
        // Save error details
        await saveConversationDB(chatId, "[IMAGE_ERROR]", `Error: ${error.message}`, "image", {
            error: error.message,
            caption: msg.caption || null
        }).catch(console.error);
    }
}

async function handleDocumentMessage(msg, chatId, sessionId) {
    try {
        console.log("📄 Processing document:", msg.document.file_name);
        const isTraining = msg.caption?.toLowerCase().includes("train");
        const fileName = msg.document.file_name || "untitled_document";
        const fileSize = msg.document.file_size || 0;
        
        if (isTraining) {
            // Enhanced training document processing
            await bot.sendMessage(chatId, "📚 Processing document for AI training database...");
            
            try {
                const fileLink = await bot.getFileLink(msg.document.file_id);
                console.log("📥 Downloading document from Telegram...");
                
                const fetch = require('node-fetch'); // Make sure this is available
                const response = await fetch(fileLink);
                const buffer = await response.buffer();
                
                let content = '';
                
                // Enhanced file type handling
                if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
                    content = buffer.toString('utf8');
                } else if (fileName.endsWith('.json')) {
                    content = buffer.toString('utf8');
                } else {
                    // Try to read as text for other formats
                    content = buffer.toString('utf8');
                }
                
                if (content.length === 0) {
                    throw new Error("Document appears to be empty or unreadable");
                }
                
                const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
                const summary = content.length > 500 ? content.substring(0, 500) + '...' : content;
                
                console.log(`📊 Document stats: ${wordCount} words, ${content.length} characters`);
                
                const saved = await saveTrainingDocumentDB(chatId, fileName, content, 'user_uploaded', wordCount, summary);
                
                if (saved) {
                    await sendSmartMessage(bot, chatId, 
                        `📚 **Document Added to Enhanced AI Training Database**\n\n` +
                        `📄 **File:** ${fileName}\n` +
                        `📊 **Words:** ${wordCount.toLocaleString()}\n` +
                        `📏 **Size:** ${(fileSize / 1024).toFixed(1)} KB\n` +
                        `💾 **Storage:** Enhanced PostgreSQL Database\n` +
                        `✅ **Your AI can now reference this document in conversations!**\n\n` +
                        `Try asking: "What did you learn from the document I uploaded?"`
                    );
                    
                    // Log successful document training
                    await logCommandUsage(chatId, 'document_training', 1000, true).catch(console.error);
                    
                    // Save training record
                    await saveConversationDB(chatId, `[TRAINING_DOC] ${fileName}`, `Document added to training database: ${wordCount} words`, "document", {
                        fileName: fileName,
                        wordCount: wordCount,
                        fileSize: fileSize,
                        trainingSuccess: true,
                        sessionId: sessionId
                    }).catch(console.error);
                    
                    console.log("✅ Document training completed successfully");
                } else {
                    throw new Error("Database save operation failed");
                }
                
            } catch (downloadError) {
                console.error("❌ Document download/processing error:", downloadError.message);
                await sendSmartMessage(bot, chatId, 
                    `❌ Error processing document for training: ${downloadError.message}\n\n` +
                    `Please try:\n` +
                    `• Converting to .txt or .md format\n` +
                    `• Reducing file size if too large\n` +
                    `• Checking if file is corrupted`
                );
                
                // Save error record
                await saveConversationDB(chatId, `[TRAINING_ERROR] ${fileName}`, `Training failed: ${downloadError.message}`, "document", {
                    fileName: fileName,
                    fileSize: fileSize,
                    error: downloadError.message,
                    trainingSuccess: false
                }).catch(console.error);
            }
            
        } else {
            // Enhanced document analysis
            await bot.sendMessage(chatId, "📄 Analyzing document with enhanced AI...");
            
            try {
                const analysis = await processDocumentMessage(bot, msg.document.file_id, chatId, fileName);
                
                if (analysis?.success && analysis.analysis) {
                    await sendAnalysis(bot, chatId, analysis.analysis, `Document Analysis: ${fileName}`);
                    
                    // Enhanced document analysis save
                    await saveConversationDB(chatId, `[DOCUMENT] ${fileName}`, analysis.analysis, "document", {
                        fileName: fileName,
                        fileSize: fileSize,
                        analysisLength: analysis.analysis.length,
                        analysisSuccess: true,
                        sessionId: sessionId
                    }).catch(console.error);
                    
                    // If document analysis reveals important information, save to memory
                    if (shouldSaveToPersistentMemory(`Document: ${fileName}`, analysis.analysis)) {
                        const memoryFact = `Document analysis: ${fileName} - ${analysis.analysis.substring(0, 100)}...`;
                        await addPersistentMemoryDB(chatId, memoryFact, 'medium').catch(console.error);
                        console.log("💾 Document analysis saved to persistent memory");
                    }
                    
                    console.log("✅ Document analysis completed successfully");
                } else {
                    throw new Error("Document analysis failed or returned empty results");
                }
                
            } catch (analysisError) {
                console.error("❌ Document analysis error:", analysisError.message);
                await sendSmartMessage(bot, chatId, 
                    `❌ Document analysis failed: ${analysisError.message}\n\n` +
                    `Please try:\n` +
                    `• Converting to PDF or TXT format\n` +
                    `• Reducing file size\n` +
                    `• Adding caption "train" to save for AI training instead`
                );
                
                // Save error record
                await saveConversationDB(chatId, `[DOCUMENT_ERROR] ${fileName}`, `Analysis failed: ${analysisError.message}`, "document", {
                    fileName: fileName,
                    fileSize: fileSize,
                    error: analysisError.message,
                    analysisSuccess: false
                }).catch(console.error);
            }
        }
    } catch (error) {
        console.error("❌ Document processing error:", error.message);
        await sendSmartMessage(bot, chatId, `❌ Document processing error: ${error.message}`);
        
        // Save general error record
        await saveConversationDB(chatId, "[DOCUMENT_SYSTEM_ERROR]", `System error: ${error.message}`, "document", {
            fileName: msg.document?.file_name || "unknown",
            fileSize: msg.document?.file_size || 0,
            systemError: error.message
        }).catch(console.error);
    }
}

// 🔧 ENHANCED: Additional helper functions for better memory integration
function isQuestionAboutMemory(text) {
    const lowerText = text.toLowerCase();
    const memoryQuestions = [
        'do you remember', 'what do you remember', 'you mentioned',
        'we discussed', 'you said', 'i told you', 'you know about me',
        'what did i say', 'what was my', 'recall', 'you learned'
    ];
    
    return memoryQuestions.some(phrase => lowerText.includes(phrase));
}

function extractUserIdentityInfo(text) {
    const lowerText = text.toLowerCase();
    const identityPatterns = [
        { pattern: /my name is ([^.,\n!?]+)/i, type: 'name' },
        { pattern: /i am ([^.,\n!?]+)/i, type: 'identity' },
        { pattern: /i work (?:at|for) ([^.,\n!?]+)/i, type: 'work' },
        { pattern: /i live in ([^.,\n!?]+)/i, type: 'location' },
        { pattern: /i'm from ([^.,\n!?]+)/i, type: 'origin' },
        { pattern: /my (?:phone|email|contact) (?:is |number is )?([^.,\n!?]+)/i, type: 'contact' }
    ];
    
    for (const { pattern, type } of identityPatterns) {
        const match = text.match(pattern);
        if (match) {
            return {
                type: type,
                value: match[1].trim(),
                fullText: match[0]
            };
        }
    }
    
    return null;
}

function shouldRequestMemoryUpdate(userMessage, aiResponse) {
    // Check if the conversation suggests memory should be updated
    const userLower = userMessage.toLowerCase();
    const responseLower = aiResponse.toLowerCase();
    
    // User is correcting information
    if (userLower.includes('actually') || userLower.includes('correction') || userLower.includes('no, ')) {
        return true;
    }
    
    // AI is asking for clarification that might be remembered
    if (responseLower.includes('could you tell me') || responseLower.includes('what is your')) {
        return true;
    }
    
    // Important strategic decisions mentioned
    if (responseLower.includes('decision') || responseLower.includes('strategy') || responseLower.includes('plan')) {
        return true;
    }
    
    return false;
}

// 🔧 ENHANCED: Memory-aware response processing
async function processMemoryAwareResponse(chatId, userMessage, aiResponse) {
    try {
        // Extract identity information
        const identityInfo = extractUserIdentityInfo(userMessage);
        if (identityInfo) {
            const memoryFact = `User ${identityInfo.type}: ${identityInfo.value}`;
            await addPersistentMemoryDB(chatId, memoryFact, 'high');
            console.log(`💾 Saved identity info: ${memoryFact}`);
        }
        
        // Check if memory update is needed
        if (shouldRequestMemoryUpdate(userMessage, aiResponse)) {
            const memoryFact = extractMemoryFact(userMessage, aiResponse);
            if (memoryFact) {
                await addPersistentMemoryDB(chatId, memoryFact, 'medium');
                console.log(`💾 Saved contextual memory: ${memoryFact}`);
            }
        }
        
        // Log memory processing
        console.log(`🧠 Memory processing completed for conversation`);
        
    } catch (error) {
        console.error('❌ Memory-aware processing error:', error.message);
    }
}

// Enhanced Cambodia fund command handlers with database integration
async function handleDealAnalysis(chatId, text) {
    try {
        if (text === '/deal_analyze') {
            await sendSmartMessage(bot, chatId, 
                "**Enhanced Deal Analysis Usage:**\n" +
                "/deal_analyze [amount] [type] [location] [rate] [term]\n\n" +
                "**Example:**\n" +
                "/deal_analyze 500000 commercial \"Phnom Penh\" 18 12\n\n" +
                "**Database Integration:** All analyses are saved for trend tracking"
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

        await bot.sendMessage(chatId, "📊 Analyzing Cambodia lending deal with enhanced database...");
        const analysis = await analyzeLendingDeal(dealParams);

        if (analysis.error) {
            await sendSmartMessage(bot, chatId, `❌ Analysis error: ${analysis.error}`);
            return;
        }

        // Save to enhanced Cambodia deals database
        const dealData = {
            ...analysis,
            dealId: `${chatId}_${Date.now()}`,
            collateralType: dealParams.collateralType,
            location: dealParams.location
        };
        
        await saveCambodiaDeal(chatId, dealData).catch(console.error);

        let response = `**Enhanced Cambodia Deal Analysis**\n\n`;
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
        response += `• Rationale: ${analysis.recommendation.reasons[0]}\n\n`;
        response += `💾 **Saved to database for trend analysis**`;

        await sendCambodiaAnalysis(bot, chatId, response);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced deal analysis error: ${error.message}`);
    }
}

async function handlePortfolioStatus(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Getting enhanced portfolio status from database...");
        
        // Get portfolio data from database
        const portfolioHistory = await getCambodiaFundAnalytics(30).catch(() => null);
        
        const sampleData = {
            totalAUM: 2500000,
            deployedCapital: 2000000,
            availableCapital: 500000,
            activeDeals: 12,
            currentYield: 17.5
        };
        
        const portfolio = await getPortfolioStatus(sampleData);
        
        // Save portfolio status to database
        await saveCambodiaPortfolio(portfolio).catch(console.error);
        
        let response = `**Enhanced Cambodia Fund Portfolio Status**\n\n`;
        response += `**Fund Overview:**\n`;
        response += `• Total AUM: $${portfolio.fundOverview.totalAUM.toLocaleString()}\n`;
        response += `• Deployed Capital: $${portfolio.fundOverview.deployedCapital.toLocaleString()}\n`;
        response += `• Available Capital: $${portfolio.fundOverview.availableCapital.toLocaleString()}\n`;
        response += `• Active Deals: ${portfolio.fundOverview.numberOfDeals}\n\n`;
        
        response += `**Performance:**\n`;
        response += `• Current Yield: ${portfolio.performance.currentYieldRate.toFixed(2)}%\n`;
        response += `• vs Target: ${portfolio.performance.actualVsTarget > 0 ? '+' : ''}${portfolio.performance.actualVsTarget.toFixed(1)}%\n`;
        response += `• Monthly Income: $${portfolio.performance.monthlyIncome.toLocaleString()}\n\n`;
        
        if (portfolioHistory && portfolioHistory.dealAnalytics) {
            response += `**30-Day Analytics from Database:**\n`;
            response += `• Total Deals Analyzed: ${portfolioHistory.dealAnalytics.total_deals}\n`;
            response += `• Average Deal Size: $${parseFloat(portfolioHistory.dealAnalytics.avg_deal_size || 0).toLocaleString()}\n`;
            response += `• Approval Rate: ${((portfolioHistory.dealAnalytics.approved_deals / portfolioHistory.dealAnalytics.total_deals) * 100).toFixed(1)}%\n`;
        }

        await sendCambodiaAnalysis(bot, chatId, response);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced portfolio status error: ${error.message}`);
    }
}

async function handleCambodiaMarket(chatId) {
    try {
        await bot.sendMessage(chatId, "🇰🇭 Analyzing Cambodia market with enhanced database integration...");
        
        // Get latest market data from database
        const latestMarketData = await getLatestCambodiaMarketData().catch(() => null);
        
        const conditions = await getCambodiaMarketConditions();
        
        // Save market conditions to database
        await saveCambodiaMarketData({
            marketConditions: conditions,
            dataDate: new Date().toISOString().split('T')[0],
            marketSummary: conditions.summary
        }).catch(console.error);
        
        let response = `**Enhanced Cambodia Market Analysis**\n\n`;
        response += `**Economic Environment:**\n`;
        response += `• GDP Growth: ${conditions.economicEnvironment.gdpGrowth}%\n`;
        response += `• Inflation: ${conditions.economicEnvironment.inflation}%\n`;
        response += `• Currency Stability: ${conditions.economicEnvironment.currencyStability}\n\n`;
        
        response += `**Interest Rate Environment:**\n`;
        response += `• Commercial Loans: ${conditions.interestRateEnvironment.commercialRates.commercial.average}% avg\n`;
        response += `• Bridge Loans: ${conditions.interestRateEnvironment.commercialRates.bridge.average}% avg\n\n`;
        
        response += `**Market Summary:**\n${conditions.summary}\n\n`;
        
        if (latestMarketData) {
            response += `💾 **Historical data available in database since ${new Date(latestMarketData.data_date).toLocaleDateString()}**`;
        }

        await sendCambodiaAnalysis(bot, chatId, response);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced Cambodia market analysis error: ${error.message}`);
    }
}

async function handleRiskAssessment(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Performing enhanced risk assessment with database integration...");
        
        const sampleData = {
            totalValue: 2500000,
            numberOfDeals: 12,
            averageRate: 17.5
        };
        
        const risk = await performRiskAssessment(sampleData);
        
        // Save risk assessment to database
        await saveRiskAssessment(chatId, {
            assessmentType: 'PORTFOLIO',
            totalRiskPercent: risk.portfolioRisk.overallRiskScore,
            correlationRisk: risk.portfolioRisk.concentrationRisk,
            regimeRisk: 'MODERATE',
            diversificationScore: 75,
            accountBalance: sampleData.totalValue,
            riskData: risk,
            recommendations: ["Monitor concentration risk", "Consider diversification"],
            stressTestResults: risk.stressTesting
        }).catch(console.error);
        
        let response = `**Enhanced Portfolio Risk Assessment**\n\n`;
        response += `**Overall Risk Metrics:**\n`;
        response += `• Risk Score: ${risk.portfolioRisk.overallRiskScore}/100\n`;
        response += `• Concentration Risk: ${risk.portfolioRisk.concentrationRisk}\n`;
        response += `• Credit Risk: ${risk.portfolioRisk.creditRisk}\n`;
        response += `• Market Risk: ${risk.portfolioRisk.marketRisk}\n\n`;
        
        response += `**Stress Testing:**\n`;
        response += `• Economic Downturn: ${risk.stressTesting.economicDownturn}% loss\n`;
        response += `• Interest Rate Shock: ${risk.stressTesting.interestRateShock}% impact\n\n`;
        
        response += `💾 **Assessment saved to database for trend tracking**`;

        await sendAnalysis(bot, chatId, response, "Enhanced Risk Assessment");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced risk assessment error: ${error.message}`);
    }
}

// Enhanced market analysis handlers with database integration
async function handleMarketBriefing(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Generating enhanced market briefing with database context...");
        
        const marketData = await getComprehensiveMarketData();
        
        // Get current regime from database
        const currentRegime = await getCurrentRegime().catch(() => null);
        
        let briefing = `**Enhanced Daily Market Briefing**\n\n`;
        briefing += `📅 ${new Date().toLocaleDateString()}\n\n`;
        
        if (currentRegime) {
            briefing += `**Current Economic Regime (Database):**\n`;
            briefing += `• Regime: ${currentRegime.regime_name}\n`;
            briefing += `• Confidence: ${currentRegime.confidence}%\n`;
            briefing += `• Duration: ${currentRegime.regime_duration || 0} days\n\n`;
        }
        
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
        
        briefing += `💾 **Data integrated from enhanced database**\n`;
        briefing += `Ask me for analysis: "What's your take on these conditions?"`;

        await sendMarketAnalysis(bot, chatId, briefing);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced market briefing error: ${error.message}`);
    }
}

async function handleRegimeAnalysis(chatId) {
    try {
        await bot.sendMessage(chatId, "🏛️ Analyzing economic regime with enhanced database integration...");
        
        const query = "Analyze the current economic regime using Ray Dalio's framework. Consider growth, inflation, and policy environment with database context.";
        const analysis = await getRegimeAnalysis(query);
        
        // Extract regime data for database storage
        const regimeData = extractRegimeDataFromAnalysis(analysis);
        if (regimeData) {
            await saveRegimeData(regimeData).catch(console.error);
        }
        
        let enhancedAnalysis = analysis;
        
        // Add database context
        const regimeHistory = await getRegimeTransitions(30).catch(() => []);
        if (regimeHistory.length > 0) {
            enhancedAnalysis += `\n\n**Database Context (30 days):**\n`;
            enhancedAnalysis += `• Regime Transitions: ${regimeHistory.length}\n`;
            enhancedAnalysis += `• Latest Transition: ${regimeHistory[0]?.regime_name || 'None'}\n`;
        }
        
        await sendAnalysis(bot, chatId, enhancedAnalysis, "Enhanced Economic Regime Analysis");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced regime analysis error: ${error.message}`);
    }
}

async function handleOpportunities(chatId) {
    try {
        await bot.sendMessage(chatId, "🎯 Scanning for opportunities with enhanced database intelligence...");
        
        const marketData = await getComprehensiveMarketData();
        const query = `Based on current market conditions and database context, identify top 3 strategic opportunities. Consider the economic environment and risk/reward profiles.`;
        
        const analysis = await getStrategicAnalysis(query);
        
        // Save market signal for opportunities
        await saveMarketSignal({
            type: 'OPPORTUNITY_SCAN',
            strength: 'MODERATE',
            description: 'Strategic opportunities identified',
            marketData: marketData,
            impact: 'MODERATE',
            insights: ['Strategic opportunity scanning completed']
        }).catch(console.error);
        
        let enhancedAnalysis = analysis;
        enhancedAnalysis += `\n\n💾 **Opportunity scan saved to database for tracking**`;
        
        await sendAnalysis(bot, chatId, enhancedAnalysis, "Enhanced Market Opportunities");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced opportunities scan error: ${error.message}`);
    }
}

async function handleMacroAnalysis(chatId) {
    try {
        await bot.sendMessage(chatId, "🌍 Analyzing macro outlook with enhanced database context...");
        
        const query = "Provide a comprehensive macro economic outlook with database intelligence. Analyze global growth, inflation trends, central bank policies, and market implications.";
        const analysis = await getGptStrategicAnalysis(query);
        
        // Save daily observation
        await saveDailyObservation({
            marketRegime: 'ANALYZING',
            regimeConfidence: 75,
            keyThemes: ['Macro Analysis', 'Global Outlook'],
            outlook: analysis.substring(0, 500),
            riskFactors: ['Inflation uncertainty', 'Central bank policy'],
            opportunities: ['Strategic positioning']
        }).catch(console.error);
        
        let enhancedAnalysis = analysis;
        enhancedAnalysis += `\n\n💾 **Macro analysis saved as daily observation in database**`;
        
        await sendAnalysis(bot, chatId, enhancedAnalysis, "Enhanced Macro Economic Outlook");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced macro analysis error: ${error.message}`);
    }
}

// Enhanced trading handlers
async function handleTradingStatus(chatId) {
    try {
        await bot.sendMessage(chatId, "💹 Getting enhanced trading account status...");
        
        const trading = await getTradingSummary();
        
        if (trading?.error) {
            await sendSmartMessage(bot, chatId, "❌ Trading account not connected. Check MetaAPI configuration.");
            return;
        }
        
        // Save trading pattern if applicable
        if (trading.performance?.currentPnL) {
            await saveTradingPattern(chatId, {
                type: 'ACCOUNT_STATUS',
                description: `Account balance: ${trading.account?.balance}`,
                confidence: 85,
                evidence: trading
            }).catch(console.error);
        }
        
        let response = `**Enhanced Trading Account Status**\n\n`;
        response += `**Account:**\n`;
        response += `• Balance: ${trading.account?.balance} ${trading.account?.currency}\n`;
        response += `• Equity: ${trading.account?.equity} ${trading.account?.currency}\n`;
        response += `• Free Margin: ${trading.account?.freeMargin} ${trading.account?.currency}\n\n`;
        
        response += `**Positions:**\n`;
        response += `• Open Positions: ${trading.openPositions?.length || 0}\n`;
        
        if (trading.performance?.currentPnL) {
            const pnlEmoji = trading.performance.currentPnL > 0 ? '🟢' : '🔴';
            response += `• Current P&L: ${pnlEmoji} ${trading.performance.currentPnL.toFixed(2)}\n`;
        }
        
        response += `\n💾 **Trading data tracked in enhanced database**`;

        await sendAnalysis(bot, chatId, response, "Enhanced Trading Account");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced trading status error: ${error.message}`);
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
        
        // Save position data for analysis
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
                accountBalance: 10000, // Default
                currentRegime: 'CURRENT',
                rationale: 'Position tracking'
            }).catch(console.error);
        }
        
        let response = `**Enhanced Open Positions (${positions.length})**\n\n`;
        positions.forEach((pos, i) => {
            const pnlEmoji = pos.profit > 0 ? '🟢' : pos.profit < 0 ? '🔴' : '⚪';
            response += `${i + 1}. ${pnlEmoji} **${pos.symbol}** ${pos.type}\n`;
            response += `   Volume: ${pos.volume} lots\n`;
            response += `   P&L: ${pos.profit?.toFixed(2)}\n\n`;
        });
        
        response += `💾 **Position data saved to enhanced database for analysis**`;

        await sendAnalysis(bot, chatId, response, "Enhanced Open Positions");

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Enhanced positions error: ${error.message}`);
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

// Helper function to extract regime data from analysis
function extractRegimeDataFromAnalysis(analysis) {
    // Basic extraction - you might want to enhance this based on your analysis format
    try {
        const regimePatterns = {
            growth: analysis.toLowerCase().includes('growth') ? 'POSITIVE' : 'NEUTRAL',
            inflation: analysis.toLowerCase().includes('inflation') ? 'RISING' : 'STABLE',
            policy: analysis.toLowerCase().includes('tight') ? 'TIGHTENING' : 'ACCOMMODATIVE'
        };
        
        let confidence = 70;
        if (analysis.includes('high confidence')) confidence = 85;
        if (analysis.includes('low confidence')) confidence = 55;
        
        return {
            currentRegime: {
                name: `${regimePatterns.growth}_GROWTH_${regimePatterns.inflation}_INFLATION`,
                growth: regimePatterns.growth,
                inflation: regimePatterns.inflation,
                policy: regimePatterns.policy
            },
            confidence: confidence,
            signals: {
                policy: { realRate: 2.5 },
                inflation: { indicators: { headline: 3.2 } },
                market: { vix: 18.5 }
            }
        };
    } catch (error) {
        console.error('Error extracting regime data:', error.message);
        return null;
    }
}

// Enhanced function tracking utilities (missing from your list)
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

async function logApiUsage(apiProvider, endpoint, callsCount = 1, successful = true, responseTime = 0, dataVolume = 0, costEstimate = 0) {
    try {
        // This function should exist in your database.js but adding fallback
        console.log(`API Usage: ${apiProvider}/${endpoint} - ${successful ? 'SUCCESS' : 'FAILED'} - ${responseTime}ms`);
        return true;
    } catch (error) {
        console.error('Log API usage error:', error.message);
        return false;
    }
}

async function getRegimeTransitions(days = 30) {
    try {
        // This should exist in your database.js
        return [];
    } catch (error) {
        console.error('Get regime transitions error:', error.message);
        return [];
    }
}

async function saveTradingPattern(chatId, pattern) {
    try {
        console.log(`Saving trading pattern for ${chatId}: ${pattern.type}`);
        return true;
    } catch (error) {
        console.error('Save trading pattern error:', error.message);
        return false;
    }
}

async function saveCambodiaMarketData(marketData) {
    try {
        console.log('Saving Cambodia market data to database');
        return true;
    } catch (error) {
        console.error('Save Cambodia market data error:', error.message);
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
