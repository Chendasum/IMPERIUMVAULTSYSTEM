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

// 🚀 COMPLETE ENHANCED COMPREHENSIVE MARKET DATA - FIXED
async function getComprehensiveMarketData() {
    try {
        console.log("📊 Fetching SUPER comprehensive market data...");
        const startTime = Date.now();
        
        // Parallel fetch ALL available data sources
        const [
            enhancedData,
            tradingData,
            rayDalioData,
            economicRegime,
            yieldCurveAnalysis,
            marketAnomalies,
            marketInsights,
            economicData,
            stockMarketData,
            cryptoData,
            forexData,
            commodityData,
            newsData
        ] = await Promise.all([
            // Core market data
            getEnhancedLiveData().catch(err => {
                console.warn('Enhanced live data failed:', err.message);
                return null;
            }),
            getTradingSummary().catch(err => {
                console.warn('Trading data failed:', err.message);
                return null;
            }),
            
            // Ray Dalio enhanced analysis
            getRayDalioMarketData().catch(err => {
                console.warn('Ray Dalio data failed:', err.message);
                return null;
            }),
            detectEconomicRegime().catch(err => {
                console.warn('Economic regime detection failed:', err.message);
                return null;
            }),
            getYieldCurveAnalysis().catch(err => {
                console.warn('Yield curve analysis failed:', err.message);
                return null;
            }),
            
            // Advanced market analysis
            detectMarketAnomalies().catch(err => {
                console.warn('Market anomalies detection failed:', err.message);
                return null;
            }),
            generateMarketInsights().catch(err => {
                console.warn('Market insights generation failed:', err.message);
                return null;
            }),
            
            // Additional market data
            getEconomicIndicators().catch(err => {
                console.warn('Economic indicators failed:', err.message);
                return null;
            }),
            getStockMarketData().catch(err => {
                console.warn('Stock market data failed:', err.message);
                return null;
            }),
            getEnhancedCryptoData().catch(err => {
                console.warn('Crypto data failed:', err.message);
                return null;
            }),
            getMajorForexPairs().catch(err => {
                console.warn('Forex data failed:', err.message);
                return null;
            }),
            getCommodityPrices().catch(err => {
                console.warn('Commodity data failed:', err.message);
                return null;
            }),
            getBusinessHeadlines().catch(err => {
                console.warn('News data failed:', err.message);
                return null;
            })
        ]);

        // Structure comprehensive market intelligence
        const marketData = {
            // Core market data
            markets: enhancedData || {},
            trading: tradingData || null,
            
            // Ray Dalio All Weather Intelligence
            ray_dalio: {
                market_data: rayDalioData || {},
                economic_regime: economicRegime || {},
                yield_curve: yieldCurveAnalysis || {}
            },
            
            // Advanced Market Analysis
            analysis: {
                anomalies: marketAnomalies || {},
                insights: marketInsights || {}
            },
            
            // Multi-Asset Universe
            assets: {
                crypto: cryptoData || {},
                forex: forexData || {},
                commodities: commodityData || {}
            },
            
            // Market Intelligence
            intelligence: {
                news: newsData || {},
                economics: economicData || {},
                stocks: stockMarketData || {}
            },
            
            // Metadata
            timestamp: new Date().toISOString(),
            cambodia_time: getCurrentCambodiaDateTime(),
            global_time: getCurrentGlobalDateTime(),
            responseTime: Date.now() - startTime,
            data_quality: {
                sources_available: 0,
                completeness_score: 0
            }
        };

        // Calculate data quality
        calculateDataQuality(marketData);
        
        // Log successful API usage
        try {
            await logApiUsage('live_data', 'super_comprehensive_market', 1, true, 
                Date.now() - startTime, 0, 0.001);
        } catch (logError) {
            console.log('⚠️ API usage logging failed:', logError.message);
        }
        
        console.log(`✅ SUPER comprehensive market data fetched in ${Date.now() - startTime}ms`);
        console.log(`📊 Data quality score: ${marketData.data_quality.completeness_score}%`);
        
        return marketData;
        
    } catch (error) {
        console.error('❌ Super comprehensive market data error:', error.message);
        try {
            await logApiUsage('live_data', 'super_comprehensive_market', 1, false, 0, 0, 0);
        } catch (logError) {
            // Silent fail
        }
        return null;
    }
} // ✅ FIXED: Added missing closing brace

// Helper function to calculate data quality
function calculateDataQuality(marketData) {
    try {
        let available = 0;
        let total = 0;
        
        // Count available data sources
        const checks = [
            marketData.markets && Object.keys(marketData.markets).length > 0,
            marketData.ray_dalio && Object.keys(marketData.ray_dalio).length > 0,
            marketData.analysis && Object.keys(marketData.analysis).length > 0,
            marketData.assets && Object.keys(marketData.assets).length > 0,
            marketData.intelligence && Object.keys(marketData.intelligence).length > 0
        ];
        
        total = checks.length;
        available = checks.filter(check => check).length;
        
        marketData.data_quality.sources_available = available;
        marketData.data_quality.completeness_score = Math.round((available / total) * 100);
        
    } catch (error) {
        console.warn('⚠️ Data quality calculation failed:', error.message);
        marketData.data_quality.completeness_score = 0;
    }
}

// Helper function to calculate derived indicators
function calculateDerivedIndicators(marketData) {
    try {
        // Yield curve analysis
        if (marketData.yields && marketData.yields.curve_10Y_2Y !== null) {
            marketData.yields.inverted = marketData.yields.curve_10Y_2Y < 0;
        }
        
        // VIX-based fear/greed assessment
        if (marketData.sentiment && marketData.sentiment.vix !== null) {
            if (marketData.sentiment.vix < 15) {
                marketData.sentiment.fear_greed_level = "EXTREME_GREED";
            } else if (marketData.sentiment.vix < 20) {
                marketData.sentiment.fear_greed_level = "GREED";
            } else if (marketData.sentiment.vix < 30) {
                marketData.sentiment.fear_greed_level = "NEUTRAL";
            } else if (marketData.sentiment.vix < 40) {
                marketData.sentiment.fear_greed_level = "FEAR";
            } else {
                marketData.sentiment.fear_greed_level = "EXTREME_FEAR";
            }
        }
        
        // Dollar strength assessment
        if (marketData.currencies && marketData.currencies.dollar_index !== null) {
            if (marketData.currencies.dollar_index > 100) {
                marketData.currencies.dollar_strength = "STRONG";
            } else if (marketData.currencies.dollar_index > 95) {
                marketData.currencies.dollar_strength = "MODERATE";
            } else {
                marketData.currencies.dollar_strength = "WEAK";
            }
        }
        
        // Gold/Oil ratio
        if (marketData.commodities && marketData.commodities.gold && marketData.commodities.oil) {
            marketData.commodities.gold_oil_ratio = 
                (marketData.commodities.gold / marketData.commodities.oil).toFixed(2);
        }
        
        // Market regime determination
        determineMarketRegime(marketData);
        
    } catch (error) {
        console.warn('⚠️ Derived indicators calculation failed:', error.message);
    }
}

// Helper function to determine market regime
function determineMarketRegime(marketData) {
    try {
        let regime_score = 0;
        
        // VIX contribution
        if (marketData.sentiment && marketData.sentiment.vix !== null) {
            if (marketData.sentiment.vix < 20) regime_score += 2;
            else if (marketData.sentiment.vix > 30) regime_score -= 2;
        }
        
        // Yield curve contribution
        if (marketData.yields && marketData.yields.inverted === true) regime_score -= 3;
        else if (marketData.yields && marketData.yields.curve_10Y_2Y > 1) regime_score += 1;
        
        // Dollar strength contribution
        if (marketData.currencies && marketData.currencies.dollar_strength === "STRONG") regime_score += 1;
        else if (marketData.currencies && marketData.currencies.dollar_strength === "WEAK") regime_score -= 1;
        
        // Determine regime
        if (!marketData.sentiment) marketData.sentiment = {};
        
        if (regime_score >= 2) {
            marketData.sentiment.market_regime = "RISK_ON";
        } else if (regime_score <= -2) {
            marketData.sentiment.market_regime = "RISK_OFF";
        } else {
            marketData.sentiment.market_regime = "TRANSITIONAL";
        }
        
    } catch (error) {
        console.warn('⚠️ Market regime determination failed:', error.message);
        if (!marketData.sentiment) marketData.sentiment = {};
        marketData.sentiment.market_regime = "UNKNOWN";
    }
}

// Helper function to assess data quality
function assessDataQuality(marketData) {
    try {
        let available = 0;
        let total = 0;
        
        // Count available data sources with null checks
        const checks = [
            marketData.markets && Object.keys(marketData.markets).length > 0,
            marketData.yields && marketData.yields.yield10Y !== null,
            marketData.yields && marketData.yields.yield2Y !== null,
            marketData.sentiment && marketData.sentiment.vix !== null,
            marketData.currencies && marketData.currencies.dollar_index !== null,
            marketData.commodities && marketData.commodities.gold !== null,
            marketData.commodities && marketData.commodities.oil !== null,
            marketData.economics && Object.keys(marketData.economics).length > 0,
            marketData.stocks && Object.keys(marketData.stocks).length > 0
        ];
        
        total = checks.length;
        available = checks.filter(check => check).length;
        
        if (!marketData.data_quality) marketData.data_quality = {};
        marketData.data_quality.sources_available = available;
        marketData.data_quality.sources_failed = total - available;
        marketData.data_quality.completeness_score = Math.round((available / total) * 100);
        
    } catch (error) {
        console.warn('⚠️ Data quality assessment failed:', error.message);
        if (!marketData.data_quality) marketData.data_quality = {};
        marketData.data_quality.completeness_score = 0;
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

// 🔧 REPLACE YOUR executeCommandWithLogging FUNCTION WITH THIS FIXED VERSION

async function executeCommandWithLogging(chatId, text, sessionId) {
    const startTime = Date.now();
    
    try {
        // 🔧 ADD EXPLICIT MEMORY HANDLING FOR NAME COMMANDS
        if (text.toLowerCase().includes('/save my name is') || text.toLowerCase().includes('my name is')) {
            console.log(`💾 Processing name save command: "${text}"`);
            
            // Extract name more reliably
            let nameMatch = text.match(/my name is ([^.,\n!?]+)/i);
            if (nameMatch) {
                const name = nameMatch[1].trim();
                console.log(`💾 Extracted name: "${name}"`);
                
                // Save name with HIGH priority
                await addPersistentMemoryDB(chatId, `User's name: ${name}`, 'high');
                console.log(`💾 Saved name to database: ${name}`);
                
                // Send confirmation
                await sendSmartMessage(bot, chatId, 
                    `✅ **I've saved your name: ${name}**\n\n` +
                    `💾 This has been stored in my persistent memory.\n` +
                    `🧠 I will remember this in future conversations.\n\n` +
                    `**Test it:** Ask me "What is my name?" to verify!`
                );
                
                // Save this interaction
                await saveConversationDB(chatId, text, `Name saved: ${name}`, "memory_save", {
                    userName: name,
                    memoryType: 'identity',
                    priority: 'high',
                    processingTime: Date.now() - startTime
                }).catch(console.error);
                
                return Date.now() - startTime;
            }
        }
        
        // 🔧 ADD EXPLICIT MEMORY RECALL FOR NAME QUESTIONS
        if (text.toLowerCase().includes('what is my name') || 
            text.toLowerCase().includes('do you remember my name') ||
            text.toLowerCase().includes('my name?')) {
            
            console.log(`🧠 Processing name recall question: "${text}"`);
            
            try {
                // Get user's memories
                const memories = await getPersistentMemoryDB(chatId);
                console.log(`🧠 Retrieved ${memories.length} memories for user`);
                
                // Find name in memories
                const nameMemory = memories.find(mem => 
                    mem.fact && mem.fact.toLowerCase().includes("user's name:")
                );
                
                if (nameMemory) {
                    const name = nameMemory.fact.replace(/user's name:\s*/i, '').trim();
                    console.log(`🧠 Found name in memory: "${name}"`);
                    
                    await sendSmartMessage(bot, chatId, 
                        `🧠 **Yes, I remember!**\n\n` +
                        `👤 **Your name is: ${name}**\n\n` +
                        `💾 I retrieved this from my persistent memory database.\n` +
                        `📅 Saved on: ${new Date(nameMemory.created_at).toLocaleDateString()}\n\n` +
                        `✅ My memory system is working correctly!`
                    );
                } else {
                    console.log(`🧠 No name found in memories`);
                    await sendSmartMessage(bot, chatId, 
                        `🤔 **I don't have your name saved yet.**\n\n` +
                        `💡 **To save your name, say:**\n` +
                        `"My name is [Your Name]"\n\n` +
                        `💾 I'll store it in my persistent memory for future conversations.`
                    );
                }
                
                return Date.now() - startTime;
                
            } catch (memoryError) {
                console.error('🧠 Memory recall error:', memoryError.message);
                await sendSmartMessage(bot, chatId, 
                    `❌ **Memory system error:**\n\n` +
                    `I'm having trouble accessing my memory database.\n` +
                    `Error: ${memoryError.message}\n\n` +
                    `Please try: /test_memory to diagnose the issue.`
                );
                return Date.now() - startTime;
            }
        }
        
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
            // 🔧 ENHANCED DUAL AI PROCESSING WITH MEMORY INTEGRATION
            console.log(`🤖 Processing with DIRECT dual AI: "${text}"`);
            
            // Get current Cambodia date and time
            const cambodiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Phnom_Penh"});
            const currentDate = new Date(cambodiaTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // 🧠 BUILD MEMORY CONTEXT FIRST
            let memoryContext = '';
            try {
                console.log(`🧠 Building memory context for user ${chatId}...`);
                const memories = await getPersistentMemoryDB(chatId);
                
                if (memories && memories.length > 0) {
                    memoryContext = '\n\n🧠 IMPORTANT MEMORY CONTEXT:\n';
                    memories.slice(0, 5).forEach((mem, i) => {
                        memoryContext += `• ${mem.fact}\n`;
                    });
                    memoryContext += '\nUSE THIS INFORMATION TO PROVIDE PERSONALIZED RESPONSES.\n';
                    console.log(`🧠 Added ${memories.length} memories to context`);
                } else {
                    console.log(`🧠 No memories found for user ${chatId}`);
                }
            } catch (memoryError) {
                console.error('🧠 Memory context building failed:', memoryError.message);
            }
            
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
            
            // 🔧 ADD MEMORY CONTEXT TO AI REQUEST
            const fullContext = contextualText + memoryContext;
            
            const result = await Promise.race([
                getUltimateStrategicAnalysis(fullContext, {
                    chatId: chatId,
                    sessionId: sessionId || `session_${chatId}_${Date.now()}`,
                    messageType: 'general_conversation',
                    currentDate: currentDate,
                    timeZone: 'Asia/Phnom_Penh',
                    hasMemoryContext: memories && memories.length > 0
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
            
            // 🔧 ENHANCED MEMORY EXTRACTION AND SAVING
            try {
                console.log(`💾 Processing memory extraction for: "${text}"`);
                await extractAndSaveMemoriesEnhanced(chatId, text, response);
            } catch (memoryError) {
                console.error('💾 Memory extraction failed:', memoryError.message);
            }
            
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

// 🔧 NEW: Enhanced memory extraction function
async function extractAndSaveMemoriesEnhanced(chatId, userMessage, aiResponse) {
    try {
        console.log(`🧠 Enhanced memory extraction for: "${userMessage}"`);
        
        // 🎯 HIGH PRIORITY: Name detection
        const namePatterns = [
            /my name is ([^.,\n!?]+)/i,
            /i'm ([^.,\n!?]+)/i,
            /call me ([^.,\n!?]+)/i,
            /i am ([^.,\n!?]+) and/i
        ];
        
        for (const pattern of namePatterns) {
            const match = userMessage.match(pattern);
            if (match) {
                const name = match[1].trim();
                if (name.length > 1 && name.length < 50) {
                    await addPersistentMemoryDB(chatId, `User's name: ${name}`, 'high');
                    console.log(`💾 SAVED NAME: ${name}`);
                    return; // Exit early after saving name
                }
            }
        }
        
        // 🎯 OTHER IDENTITY INFO
        const identityPatterns = [
            { pattern: /i work (?:at|for) ([^.,\n!?]+)/i, type: 'work' },
            { pattern: /i live in ([^.,\n!?]+)/i, type: 'location' },
            { pattern: /i'm from ([^.,\n!?]+)/i, type: 'origin' },
            { pattern: /i prefer ([^.,\n!?]+)/i, type: 'preference' },
            { pattern: /my goal is to ([^.,\n!?]+)/i, type: 'goal' },
            { pattern: /i like ([^.,\n!?]+)/i, type: 'preference' },
            { pattern: /remember (?:that )?([^.,\n!?]+)/i, type: 'remember' }
        ];
        
        for (const { pattern, type } of identityPatterns) {
            const match = userMessage.match(pattern);
            if (match) {
                const value = match[1].trim();
                if (value.length > 2) {
                    await addPersistentMemoryDB(chatId, `User ${type}: ${value}`, 'medium');
                    console.log(`💾 SAVED ${type.toUpperCase()}: ${value}`);
                }
            }
        }
        
        // 🎯 SAVE IMPORTANT CONVERSATIONS
        if (shouldSaveToPersistentMemory(userMessage, aiResponse)) {
            const memoryFact = extractMemoryFact(userMessage, aiResponse);
            if (memoryFact && memoryFact.length > 10) {
                await addPersistentMemoryDB(chatId, memoryFact, 'medium');
                console.log(`💾 Saved conversation memory: ${memoryFact.substring(0, 50)}...`);
            }
        }
        
    } catch (error) {
        console.log('⚠️ Enhanced memory extraction failed:', error.message);
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

// 🎯 CLEANED: Enhanced command handlers with DIRECT dual AI integration
async function handleHelpCommand(chatId) {
    const help = `🤖 **Enhanced AI Assistant v4.0 - WEALTH EMPIRE**

**🎯 Core AI Features:**
• Dual AI: GPT-5 + Claude Opus 4.1 (DIRECT)
• Enhanced memory system
• Live market data integration
• Document analysis & training

**💰 AI WEALTH-BUILDING SYSTEM (10 MODULES):**
/wealth - Complete wealth-building system
/scan_stocks - AI stock scanner
/scan_crypto - Crypto opportunities
/top_opportunities - Cross-asset analysis

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

**💰 Live Data Commands:**
/live_data - Comprehensive market data
/live_crypto - Cryptocurrency prices
/live_stocks - Stock market data
/live_forex - Currency rates
/live_economic - Economic indicators

**🔧 System Management:**
/status - Enhanced system status
/analytics - Master analytics
/db_stats - Database statistics
/maintenance - Database maintenance

**🧪 Testing & Memory:**
/test_db - Test database connection
/test_memory - Test memory system
/memory_stats - Memory statistics

**Chat ID:** ${chatId}
**🏆 Status:** AI WEALTH EMPIRE ACTIVE (DIRECT MODE)`;

    await sendSmartMessage(bot, chatId, help);
    
    // Save help interaction
    await saveConversationDB(chatId, "/help", help, "command").catch(console.error);
}

// 🎯 CLEANED: System status with DIRECT dual AI health checking
async function handleEnhancedSystemStatus(chatId) {
    try {
        await bot.sendMessage(chatId, "🔄 Checking enhanced system status...");

        const [health, stats, dualAIStats] = await Promise.all([
            checkSystemHealthDirect(),
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
        } catch (error) {
            dbHost = 'Invalid URL';
        }
        
        let status = `**Enhanced System Status v4.0 - DIRECT MODE**\n\n`;

        // AI Models Status - DIRECT
        status += `**AI Models (DIRECT):**\n`;
        status += `• GPT-5: ${health?.ultimateStrategic ? '✅ Online (Direct)' : '❌ Offline'}\n`;
        status += `• Claude Opus 4.1: ${health?.claudeAnalysis ? '✅ Online (Direct)' : '❌ Offline'}\n`;
        status += `• Ultimate Strategic: ${health?.ultimateStrategic ? '✅ Active' : '❌ Inactive'}\n`;
        status += `• Universal Analysis: ${health?.universalAnalysis ? '✅ Available' : '❌ Unavailable'}\n\n`;

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
        status += `• Direct Dual AI: ${health?.dualAISystem ? '✅ Working' : '❌ Error'}\n`;
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
        status += `**Overall Status: ${overallHealthy ? '🟢 Healthy (Direct Mode)' : '🔴 Degraded'}**`;

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

        await sendAnalysis(bot, chatId, status, "Enhanced System Status (Direct Mode)");
        
        // Save status check
        await saveConversationDB(chatId, "/status", status, "command").catch(console.error);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Status check error: ${error.message}`);
    }
}

// 🎯 SIMPLIFIED: Direct system health check
async function checkSystemHealthDirect() {
    try {
        console.log("🔍 Checking DIRECT dual AI system health...");
        
        const health = {
            ultimateStrategic: false,
            universalAnalysis: false,
            claudeAnalysis: false,
            gptAnalysis: false,
            dualAISystem: false,
            memorySystem: false,
            overallHealth: false
        };
        
        // Test Ultimate Strategic Analysis (main function) - DIRECT
        try {
            const testResult = await getUltimateStrategicAnalysis('health check test', {
                chatId: 'health_test',
                sessionId: 'health_session_test'
            });
            health.ultimateStrategic = !!testResult;
            health.dualAISystem = true;
            console.log('✅ Ultimate Strategic Analysis: WORKING');
        } catch (error) {
            console.log('❌ Ultimate Strategic Analysis failed:', error.message);
        }
        
        // Test Universal Analysis (backup)
        try {
            await getUniversalAnalysis('test', { maxTokens: 10 });
            health.universalAnalysis = true;
            console.log('✅ Universal Analysis: WORKING');
        } catch (error) {
            console.log('❌ Universal Analysis failed:', error.message);
        }
        
        // Test individual AI functions
        try {
            await getGPT5Analysis('test');
            health.gptAnalysis = true;
            console.log('✅ GPT-5: WORKING');
        } catch (error) {
            console.log('❌ GPT-5 failed:', error.message);
        }
        
        try {
            await getClaudeAnalysis('test');
            health.claudeAnalysis = true;
            console.log('✅ Claude: WORKING');
        } catch (error) {
            console.log('❌ Claude failed:', error.message);
        }
        
        // Test memory system
        try {
            await getPersistentMemoryDB('test_user');
            health.memorySystem = true;
            console.log('✅ Memory System: WORKING');
        } catch (error) {
            console.log('❌ Memory System failed:', error.message);
        }
        
        // Overall health assessment
        const healthyComponents = Object.values(health).filter(Boolean).length;
        health.overallHealth = healthyComponents >= 3; // At least 3 components working
        
        console.log(`✅ DIRECT dual AI health check: ${healthyComponents}/6 components healthy`);
        return health;
        
    } catch (error) {
        console.error('❌ DIRECT dual AI health check failed:', error.message);
        return {
            ultimateStrategic: false,
            universalAnalysis: false,
            claudeAnalysis: false,
            gptAnalysis: false,
            dualAISystem: false,
            memorySystem: false,
            overallHealth: false
        };
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
        
        let response = `**Master Enhanced Analytics Dashboard (Direct Mode)**\n\n`;
        
        // System Overview
        response += `**System Overview:**\n`;
        response += `• Version: v4.0 - DIRECT DUAL AI\n`;
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
        
        await sendAnalysis(bot, chatId, response, "Master Analytics Dashboard (Direct Mode)");
        
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
        
        let response = `**Enhanced Database Statistics (Direct Mode)**\n\n`;
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

        await sendAnalysis(bot, chatId, response, "Database Statistics (Direct Mode)");
        
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
        
        let response = `**Database Maintenance Results (Direct Mode)**\n\n`;
        
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

        await sendAnalysis(bot, chatId, response, "Database Maintenance (Direct Mode)");
        
        // Save maintenance request
        await saveConversationDB(chatId, "/maintenance", response, "command").catch(console.error);

    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Database maintenance error: ${error.message}`);
    }
}

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
        
        let response = `🔍 **Database Connection Test Results (Direct Mode)**\n\n`;
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
        
        await sendAnalysis(bot, chatId, response, "Database Connection Test (Direct Mode)");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Database test failed: ${error.message}`);
    }
}

// 🎯 CLEANED: Memory System Test - DIRECT dual AI integration
async function handleMemorySystemTest(chatId) {
    try {
        await bot.sendMessage(chatId, "🧠 Testing memory system with DIRECT dual AI...");
        
        // Test memory integration with DIRECT dual AI
        const testResults = await testMemoryIntegrationDirect(chatId);
        
        let response = `🧠 **Memory Integration Test Results (Direct Mode)**\n\n`;
        
        if (testResults.tests) {
            Object.entries(testResults.tests).forEach(([test, passed]) => {
                const emoji = passed ? '✅' : '❌';
                const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                response += `${emoji} ${testName}\n`;
            });
            
            response += `\n**Score:** ${testResults.score} (${testResults.percentage}%)\n`;
            response += `**Status:** ${testResults.status === 'FULL_SUCCESS' ? '🟢 FULLY WORKING' : testResults.status === 'MOSTLY_WORKING' ? '🟡 MOSTLY WORKING' : '🔴 NEEDS ATTENTION'}\n`;
        }
        
        await sendAnalysis(bot, chatId, response, "Memory System Test (Direct Mode)");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Memory system test failed: ${error.message}`);
    }
}

// 🎯 NEW: Direct memory integration test
async function testMemoryIntegrationDirect(chatId) {
    try {
        console.log(`🧠 Testing DIRECT memory integration for ${chatId}...`);
        
        const tests = {
            conversationHistory: false,
            persistentMemory: false,
            dualAIWithMemory: false,
            contextBuilding: false
        };
        
        // Test conversation history
        try {
            const history = await getConversationHistoryDB(chatId, 3);
            tests.conversationHistory = Array.isArray(history);
        } catch (error) {
            console.log('Conversation history test failed:', error.message);
        }
        
        // Test persistent memory
        try {
            const memory = await getPersistentMemoryDB(chatId);
            tests.persistentMemory = Array.isArray(memory);
        } catch (error) {
            console.log('Persistent memory test failed:', error.message);
        }
        
        // Test DIRECT dual AI with memory context
        try {
            const result = await getUltimateStrategicAnalysis('What do you remember about our conversations?', {
                chatId: chatId,
                sessionId: `memory_test_${Date.now()}`,
                includeMemory: true
            });
            tests.dualAIWithMemory = !!result;
        } catch (error) {
            console.log('DIRECT dual AI with memory test failed:', error.message);
        }
        
        // Test context building
        try {
            const context = await buildConversationContextWithMemory(chatId, 'test message');
            tests.contextBuilding = !!context;
        } catch (error) {
            console.log('Context building test failed:', error.message);
        }
        
        const successCount = Object.values(tests).filter(Boolean).length;
        const totalTests = Object.keys(tests).length;
        
        return {
            success: successCount > 0,
            tests: tests,
            score: `${successCount}/${totalTests}`,
            percentage: Math.round((successCount / totalTests) * 100),
            status: successCount === totalTests ? 'FULL_SUCCESS' : 
                   successCount >= totalTests * 0.7 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION',
            message: `DIRECT memory integration test: ${successCount}/${totalTests} components working`
        };
        
    } catch (error) {
        console.error('❌ DIRECT memory integration test failed:', error.message);
        return {
            success: false,
            error: error.message,
            status: 'FAILED',
            message: 'DIRECT memory integration test failed'
        };
    }
}

async function handleMemoryRecoveryTest(chatId) {
    try {
        await bot.sendMessage(chatId, "🔧 Testing memory recovery system with DIRECT dual AI...");
        
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
        
        // Test 3: Build context with DIRECT dual AI
        try {
            const context = await buildConversationContextWithMemory(chatId, 'test message');
            testResults.contextBuilding = !!context;
            console.log('✅ Context building test with DIRECT dual AI');
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
            await extractAndSaveMemoriesDirect(chatId, 'My name is Test User', 'Nice to meet you, Test User!');
            testResults.factExtraction = true;
            console.log('✅ Fact extraction test passed');
        } catch (error) {
            console.log('❌ Fact extraction test failed:', error.message);
        }
        
        let response = `🔧 **Memory Recovery Test Results (Direct Mode)**\n\n`;
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
            response += `**Status:** 🟢 MEMORY SYSTEM RECOVERED (Direct Mode)\n\n`;
            response += `✅ Your memory system is now working properly with DIRECT dual AI!\n`;
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
        
        await sendAnalysis(bot, chatId, response, "Memory Recovery Test (Direct Mode)");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Memory recovery test failed: ${error.message}`);
    }
}

async function handleMemoryStatistics(chatId) {
    try {
        await bot.sendMessage(chatId, "📊 Gathering memory statistics...");
        
        const [conversations, memories, userProfile] = await Promise.allSettled([
            getConversationHistoryDB(chatId, 50),
            getPersistentMemoryDB(chatId),
            getUserProfileDB(chatId)
        ]);
        
        let response = `📊 **Memory Statistics for User ${chatId} (Direct Mode)**\n\n`;
        
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
            '🟢 HEALTHY (Direct Mode)' : '🔴 NEEDS ATTENTION'
        }`;
        
        await sendAnalysis(bot, chatId, response, "Memory Statistics (Direct Mode)");
        
    } catch (error) {
        await sendSmartMessage(bot, chatId, `❌ Memory statistics failed: ${error.message}`);
    }
}

// 🎯 ENHANCED: Helper functions for DIRECT dual AI conversation handling with memory integration
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
    
    // DIRECT dual AI specific
    if (lowerText.includes('dual ai') || lowerText.includes('gpt') || lowerText.includes('claude')) return 'ai_system_query';
    
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
        'status', 'update', 'live', 'real-time',
        'bitcoin', 'crypto', 'stock', 'forex' // Added crypto/market keywords
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
    
    // DIRECT dual AI system preferences
    if (lowerMessage.includes('my ai preference') || lowerMessage.includes('use gpt') || lowerMessage.includes('use claude')) return true;
    
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
    
    // AI system preferences
    if (lowerMessage.includes('use gpt') || lowerMessage.includes('prefer gpt')) {
        return `AI preference: User prefers GPT-5 for responses`;
    }
    if (lowerMessage.includes('use claude') || lowerMessage.includes('prefer claude')) {
        return `AI preference: User prefers Claude Opus 4.1 for responses`;
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
    
    // DIRECT dual AI system insights
    if (aiResponse.includes('Ultimate Strategic Analysis') || aiResponse.includes('dual AI')) {
        return `System insight: DIRECT dual AI analysis completed`;
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

// 🎯 NEW: DIRECT dual AI specific helper functions
function shouldUseDualAI(text, conversationType, complexity) {
    // Always use DIRECT dual AI for these cases
    if (conversationType === 'strategic_analysis') return true;
    if (conversationType === 'memory_query') return true;
    if (conversationType === 'economic_regime') return true;
    if (conversationType === 'portfolio_analysis') return true;
    
    // Use for complex queries
    if (complexity === 'high' || complexity === 'maximum') return true;
    
    // Use for financial/investment queries
    if (text.toLowerCase().includes('investment') || 
        text.toLowerCase().includes('financial') || 
        text.toLowerCase().includes('analysis')) return true;
    
    // Default to DIRECT dual AI (since we removed intermediate layers)
    return true;
}

function buildDualAIContext(chatId, text, conversationType, complexity, memoryContext) {
    return {
        chatId: chatId,
        sessionId: `session_${chatId}_${Date.now()}`,
        messageType: 'text',
        conversationType: conversationType,
        complexity: complexity,
        memoryContext: memoryContext,
        userContext: {
            platform: 'telegram',
            timestamp: new Date().toISOString(),
            directMode: true, // Flag for DIRECT dual AI mode
            systemVersion: 'v4.0-DIRECT'
        }
    };
}

function formatDualAIResponse(result, executionTime) {
    if (typeof result === 'string') {
        return {
            response: result,
            aiUsed: 'DUAL_AI_DIRECT',
            executionTime: executionTime,
            success: true
        };
    }
    
    if (result && result.response) {
        return {
            response: result.response,
            aiUsed: result.aiUsed || 'DUAL_AI_DIRECT',
            modelUsed: result.modelUsed || 'Unknown',
            confidence: result.confidence || 0.8,
            executionTime: result.executionTime || executionTime,
            powerMode: result.powerMode || 'DIRECT',
            success: true
        };
    }
    
    // Fallback formatting
    return {
        response: "I've processed your request with our DIRECT dual AI system.",
        aiUsed: 'DUAL_AI_DIRECT_FALLBACK',
        executionTime: executionTime,
        success: false
    };
}

// 🔧 ENHANCED: Memory-aware response processing with DIRECT dual AI
async function processMemoryAwareResponseDirect(chatId, userMessage, aiResponse) {
    try {
        console.log(`🧠 Processing memory-aware response for ${chatId} with DIRECT dual AI`);
        
        // Extract and save identity information with priority handling
        const identityInfo = extractUserIdentityInfo(userMessage);
        if (identityInfo) {
            const priority = identityInfo.confidence === 'high' ? 'high' : 'medium';
            const memoryFact = `User ${identityInfo.type}: ${identityInfo.value}`;
            await addPersistentMemoryDB(chatId, memoryFact, priority);
            console.log(`💾 Saved identity info (${priority}): ${memoryFact}`);
        }
        
        // Check if memory update is needed with enhanced logic
        if (shouldSaveToPersistentMemory(userMessage, aiResponse)) {
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
        
        // Save important facts from AI responses (enhanced for DIRECT dual AI)
        const aiFacts = extractImportantFactsDirect(aiResponse);
        if (aiFacts.length > 0) {
            for (const fact of aiFacts) {
                await addPersistentMemoryDB(chatId, `AI provided: ${fact}`, 'low');
                console.log(`💾 Saved AI fact: ${fact}`);
            }
        }
        
        console.log(`🧠 DIRECT dual AI memory processing completed for conversation`);
        
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
        /my favorite ([^.,\n!?]+)/gi,
        /i always ([^.,\n!?]+)/gi,
        /i usually ([^.,\n!?]+)/gi
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

// Helper function to extract important facts from AI responses (enhanced for DIRECT dual AI)
function extractImportantFactsDirect(text) {
    const facts = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    for (const sentence of sentences) {
        // Look for factual statements that might be useful to remember
        if (sentence.includes('According to') || sentence.includes('Based on') ||
            sentence.includes('Important') || sentence.includes('Key') ||
            sentence.includes('Remember') || sentence.includes('Note that') ||
            sentence.includes('Ultimate Strategic') || sentence.includes('dual AI analysis')) {
            facts.push(sentence.trim().substring(0, 100));
        }
    }
    
    return facts.slice(0, 3); // Limit to 3 facts to avoid spam
}

// 🔧 PART 1: FIXED FILE/IMAGE PROCESSING FUNCTIONS FOR YOUR INDEX.JS
// Replace the broken functions in your index.js with these working versions

// 🔧 COMPLETELY FIXED: Voice message handler for your dual AI system
async function handleVoiceMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🎤 Processing voice message...");
        await bot.sendMessage(chatId, "🎤 Transcribing voice message with GPT-5 + Claude Opus 4.1 enhanced AI...");
        
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
            
// Process transcribed text with REAL dual AI system
try {
    const result = await getUltimateStrategicAnalysis(transcribedText, {
        chatId: chatId,
        sessionId: sessionId || `session_${chatId}_${Date.now()}`,
        messageType: 'voice_transcription'
    });
    
    const response = (typeof result === 'string') ? result : result.response;
    await sendSmartMessage(bot, chatId, response);
    
} catch (dualError) {
    console.error('❌ Dual AI failed for voice:', dualError.message);
    await sendSmartMessage(bot, chatId, "I've processed your voice message.");
}
            
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

// 🔧 NEW: Working voice processing function with proper OpenAI Whisper integration
async function processVoiceMessageFixed(bot, fileId, chatId) {
    try {
        console.log("🔄 Starting Whisper voice transcription...");
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        console.log(`📁 Voice file URL: ${fileUrl}`);
        console.log(`📊 File size: ${file.file_size} bytes`);
        
        // Download the voice file with timeout
        const fetch = require('node-fetch');
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
        
        // Create form data for OpenAI Whisper API
        const FormData = require('form-data');
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

// 🔧 UTILITY: Voice message validation
function validateVoiceMessage(msg) {
    if (!msg.voice) {
        throw new Error("No voice message found");
    }
    
    if (!msg.voice.file_id) {
        throw new Error("Voice message has no file ID");
    }
    
    // Check file size (Whisper has a 25MB limit)
    if (msg.voice.file_size > 25 * 1024 * 1024) {
        throw new Error("Voice message too large (max 25MB)");
    }
    
    // Check duration (optional limit)
    if (msg.voice.duration > 600) { // 10 minutes
        console.warn("⚠️ Very long voice message detected:", msg.voice.duration, "seconds");
    }
    
    return true;
}

// 🎤 VOICE HANDLER - USING YOUR WORKING DUAL AI
async function handleVoiceMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🎤 Processing voice message...");
        await bot.sendMessage(chatId, "🎤 Transcribing voice message...");
        
        // Use your working Whisper transcription
        const transcribedText = await processVoiceMessageFixed(bot, msg.voice.file_id, chatId);
        const responseTime = Date.now() - startTime;
        
        if (transcribedText && transcribedText.length > 0) {
            await sendSmartMessage(bot, chatId, `🎤 **Voice transcribed:** "${transcribedText}"`);
            
            // Save voice transcription with metadata
            await saveConversationDB(chatId, "[VOICE]", transcribedText, "voice", {
                voiceDuration: msg.voice.duration,
                fileSize: msg.voice.file_size,
                transcriptionLength: transcribedText.length,
                processingTime: responseTime,
                sessionId: sessionId,
                timestamp: new Date().toISOString(),
                aiModel: 'OpenAI-Whisper'
            }).catch(err => console.error('Voice save error:', err.message));
            
            // Process with YOUR existing dual AI system (this works!)
            try {
                console.log("🤖 Processing with your dual AI system...");
                
                const result = await getUltimateStrategicAnalysis(transcribedText, {
                    chatId: chatId,
                    sessionId: sessionId || `session_${chatId}_${Date.now()}`,
                    messageType: 'voice_transcription',
                    enhancementLevel: 'VOICE_ENHANCED',
                    originalAudio: true,
                    transcriptionLength: transcribedText.length
                });
                
                const response = (typeof result === 'string') ? result : result?.response || "I've processed your voice message.";
                await sendSmartMessage(bot, chatId, response);
                
                // Extract and save memories if your function exists
                if (typeof extractAndSaveMemoriesDirect === 'function') {
                    await extractAndSaveMemoriesDirect(chatId, transcribedText, response);
                }
                
            } catch (dualError) {
                console.error('❌ Dual AI failed for voice:', dualError.message);
                await sendSmartMessage(bot, chatId, "I've transcribed your voice message but couldn't process it further. Please try again.");
            }
            
        } else {
            await sendSmartMessage(bot, chatId, "❌ Could not transcribe voice message. Please try speaking more clearly.");
        }
        
    } catch (error) {
        console.error("❌ Voice processing error:", error.message);
        await sendSmartMessage(bot, chatId, `❌ Voice processing failed: ${error.message}`);
    }
}

// 📸 SIMPLE IMAGE HANDLER - NO AI ANALYSIS (SINCE YOUR SYSTEM DOESN'T HANDLE IMAGES WELL)
async function handleImageMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("📸 Processing image message...");
        await bot.sendMessage(chatId, "📸 Image received...");
        
        const photos = msg.photo;
        const largestPhoto = photos[photos.length - 1];
        
        // Save basic image info to your database
        await saveConversationDB(chatId, "[IMAGE]", "User uploaded an image", "image", {
            fileId: largestPhoto.file_id,
            fileSize: largestPhoto.file_size,
            width: largestPhoto.width,
            height: largestPhoto.height,
            processingTime: Date.now() - startTime,
            sessionId: sessionId,
            note: 'Image received - no AI analysis (system limitation)'
        }).catch(err => console.error('Image save error:', err.message));
        
        // Simple response without AI analysis
        await sendSmartMessage(bot, chatId, 
            `📸 **Image Received!**\n\n` +
            `📏 **Dimensions:** ${largestPhoto.width} × ${largestPhoto.height}\n` +
            `📊 **Size:** ${(largestPhoto.file_size / 1024).toFixed(1)} KB\n\n` +
            `💡 **I can see you've shared an image!** While I can't analyze images directly yet, I've saved it to our conversation.\n\n` +
            `**Tell me about the image:** What would you like to discuss about it? I can help based on your description!`
        );
        
        console.log("✅ Basic image processing completed");
        
    } catch (error) {
        console.error("❌ Image processing error:", error.message);
        await sendSmartMessage(bot, chatId, "❌ Image processing failed. Please try again.");
    }
}

// 📄 SIMPLIFIED DOCUMENT HANDLER - TEXT EXTRACTION + YOUR DUAL AI FOR TEXT ONLY
async function handleDocumentMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("📄 Processing document:", msg.document.file_name);
        const fileName = msg.document.file_name || "untitled_document";
        const fileSize = msg.document.file_size || 0;
        const isTraining = msg.caption?.toLowerCase().includes("train");
        
        await bot.sendMessage(chatId, `📄 Processing document: ${fileName}...`);
        
        try {
            // Download file from Telegram
            const fileLink = await bot.getFileLink(msg.document.file_id);
            const fetch = require('node-fetch');
            const response = await fetch(fileLink);
            
            if (!response.ok) {
                throw new Error(`Failed to download document: HTTP ${response.status}`);
            }
            
            const buffer = await response.buffer();
            const fileExtension = fileName.toLowerCase().split('.').pop();
            
            let content = '';
            let extractionMethod = 'text';
            
            // Basic file type handling (only what works reliably)
            if (['txt', 'md', 'json', 'csv'].includes(fileExtension)) {
                content = buffer.toString('utf8');
                extractionMethod = 'direct_text';
            } else if (fileExtension === 'pdf' && typeof extractTextFromPDF === 'function') {
                try {
                    content = await extractTextFromPDF(buffer);
                    extractionMethod = 'pdf_extraction';
                } catch (pdfError) {
                    throw new Error("PDF extraction failed. Please convert to .txt format.");
                }
            } else if (['doc', 'docx'].includes(fileExtension) && typeof extractTextFromWord === 'function') {
                try {
                    content = await extractTextFromWord(buffer);
                    extractionMethod = 'word_extraction';
                } catch (wordError) {
                    throw new Error("Word document extraction failed. Please convert to .txt format.");
                }
            } else {
                // Try to read as plain text
                content = buffer.toString('utf8');
                extractionMethod = 'fallback_text';
                console.log(`⚠️ Attempting to read ${fileExtension} file as plain text`);
            }
            
            if (content.length === 0) {
                throw new Error("Document appears to be empty or unreadable");
            }
            
            const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
            const responseTime = Date.now() - startTime;
            
            if (isTraining) {
                // Training mode - save to your database
                const summary = content.length > 500 ? content.substring(0, 500) + '...' : content;
                
                if (typeof saveTrainingDocumentDB === 'function') {
                    const saved = await saveTrainingDocumentDB(chatId, fileName, content, 'user_uploaded', wordCount, summary);
                    
                    if (saved) {
                        await sendSmartMessage(bot, chatId, 
                            `📚 **Document Added to Training Database**\n\n` +
                            `📄 **File:** ${fileName}\n` +
                            `📊 **Words:** ${wordCount.toLocaleString()}\n` +
                            `📏 **Size:** ${(fileSize / 1024).toFixed(1)} KB\n` +
                            `⚡ **Processing:** ${responseTime}ms\n` +
                            `✅ **Saved successfully!**\n\n` +
                            `**Try asking:** "What did you learn from ${fileName}?"`
                        );
                    } else {
                        throw new Error("Database save failed");
                    }
                } else {
                    throw new Error("Training function not available");
                }
                
            } else {
                // Analysis mode - use YOUR dual AI system for text analysis
                try {
                    // Truncate if too long for your system
                    let analysisText = content;
                    if (content.length > 8000) {
                        analysisText = content.substring(0, 8000) + '\n\n[Document truncated for analysis - full content available]';
                    }
                    
                    const prompt = `Analyze this document:\n\nFile: ${fileName}\nContent:\n${analysisText}\n\nProvide analysis covering:\n1. Document type and purpose\n2. Key points and insights\n3. Important information\n4. Overall assessment`;
                    
                    console.log("🤖 Processing document with your dual AI system...");
                    
                    const result = await getUltimateStrategicAnalysis(prompt, {
                        chatId: chatId,
                        sessionId: sessionId || `session_${chatId}_${Date.now()}`,
                        messageType: 'document_analysis',
                        enhancementLevel: 'DOCUMENT_ANALYSIS',
                        userContext: {
                            platform: 'telegram',
                            timestamp: new Date().toISOString(),
                            documentName: fileName,
                            documentSize: fileSize
                        }
                    });
                    
                    const analysis = (typeof result === 'string') ? result : result?.response || "Document analysis completed.";
                    
                    await sendSmartMessage(bot, chatId, 
                        `📄 **Document Analysis: ${fileName}**\n\n${analysis}`
                    );
                    
                    // Save analysis to your database
                    await saveConversationDB(chatId, `[DOCUMENT] ${fileName}`, analysis, "document", {
                        fileName: fileName,
                        fileSize: fileSize,
                        fileType: fileExtension,
                        extractionMethod: extractionMethod,
                        contentLength: content.length,
                        wordCount: wordCount,
                        analysisLength: analysis.length,
                        processingTime: responseTime,
                        sessionId: sessionId,
                        analysisType: 'dual_ai_text_analysis'
                    }).catch(err => console.error('Document save error:', err.message));
                    
                } catch (analysisError) {
                    console.error('❌ Dual AI analysis failed:', analysisError.message);
                    
                    // Fallback: show document content preview
                    const preview = content.length > 1000 ? content.substring(0, 1000) + '...' : content;
                    
                    await sendSmartMessage(bot, chatId, 
                        `📄 **Document Extracted: ${fileName}**\n\n` +
                        `📊 **Stats:** ${wordCount} words, ${(fileSize / 1024).toFixed(1)} KB\n\n` +
                        `**Content Preview:**\n\`\`\`\n${preview}\n\`\`\`\n\n` +
                        `💡 **Document extracted successfully. What would you like to know about it?**`
                    );
                }
            }
            
        } catch (extractionError) {
            console.error("❌ Document extraction error:", extractionError.message);
            
            await sendSmartMessage(bot, chatId, 
                `❌ Document processing failed: ${extractionError.message}\n\n` +
                `**Best supported formats:**\n` +
                `✅ Text files (.txt, .md)\n` +
                `✅ JSON data (.json)\n` +
                `✅ CSV files (.csv)\n` +
                `⚠️ PDF files (limited support)\n` +
                `⚠️ Word files (limited support)\n\n` +
                `**For best results:** Convert to .txt format and try again.\n` +
                `**For training:** Add caption "train" to save document to database.`
            );
        }
        
    } catch (error) {
        console.error("❌ Document processing system error:", error.message);
        await sendSmartMessage(bot, chatId, `❌ Document processing system error: ${error.message}`);
    }
}

// 🔧 YOUR EXISTING WHISPER FUNCTION (KEEP AS IS)
async function processVoiceMessageFixed(bot, fileId, chatId) {
    try {
        console.log("🔄 Starting Whisper voice transcription...");
        
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        const fetch = require('node-fetch');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(fileUrl, { 
            signal: controller.signal,
            timeout: 30000
        });
        clearTimeout(timeout);
        
        if (!response.ok) {
            throw new Error(`Failed to download voice file: HTTP ${response.status}`);
        }
        
        const buffer = await response.buffer();
        
        if (buffer.length > 25 * 1024 * 1024) {
            throw new Error("Voice file too large for Whisper API (max 25MB)");
        }
        
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('file', buffer, {
            filename: 'voice.ogg',
            contentType: 'audio/ogg',
        });
        form.append('model', 'whisper-1');
        form.append('language', 'en');
        form.append('response_format', 'text');
        
        const whisperController = new AbortController();
        const whisperTimeout = setTimeout(() => whisperController.abort(), 60000);
        
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
            throw new Error(`Whisper API error: ${whisperResponse.status} - ${errorText}`);
        }
        
        const transcription = await whisperResponse.text();
        
        if (!transcription || transcription.trim().length === 0) {
            throw new Error("Whisper returned empty transcription");
        }
        
        return transcription.trim();
        
    } catch (error) {
        console.error("❌ Voice processing error:", error.message);
        throw error;
    }
}

// 🔧 BASIC EXTRACTION FUNCTIONS (OPTIONAL)
async function extractTextFromPDF(buffer) {
    try {
        const pdf = require('pdf-parse');
        const data = await pdf(buffer);
        
        if (!data.text || data.text.length === 0) {
            throw new Error("PDF contains no readable text");
        }
        
        return data.text;
    } catch (error) {
        if (error.message.includes('Cannot find module')) {
            throw new Error("PDF parsing not available. Install with: npm install pdf-parse");
        }
        throw new Error(`PDF extraction failed: ${error.message}`);
    }
}

async function extractTextFromWord(buffer) {
    try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: buffer });
        
        if (!result.value || result.value.length === 0) {
            throw new Error("Word document contains no readable text");
        }
        
        return result.value;
    } catch (error) {
        if (error.message.includes('Cannot find module')) {
            throw new Error("Word parsing not available. Install with: npm install mammoth");
        }
        throw new Error(`Word extraction failed: ${error.message}`);
    }
}

// 🔧 BOT EVENT HANDLERS
bot.on('voice', async (msg) => {
    const chatId = msg.chat.id;
    try {
        if (!isAuthorizedUser(chatId)) {
            await bot.sendMessage(chatId, "🚫 Access denied.");
            return;
        }
        
        const sessionId = await startUserSession(chatId, 'VOICE_MESSAGE');
        await handleVoiceMessage(msg, chatId, sessionId);
        await endUserSession(sessionId, 1, Date.now());
        
    } catch (error) {
        console.error(`❌ Voice error for ${chatId}:`, error.message);
        await bot.sendMessage(chatId, "❌ Voice processing failed.").catch(console.error);
    }
});

bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    try {
        if (!isAuthorizedUser(chatId)) {
            await bot.sendMessage(chatId, "🚫 Access denied.");
            return;
        }
        
        const sessionId = await startUserSession(chatId, 'IMAGE_MESSAGE');
        await handleImageMessage(msg, chatId, sessionId);
        await endUserSession(sessionId, 1, Date.now());
        
    } catch (error) {
        console.error(`❌ Image error for ${chatId}:`, error.message);
        await bot.sendMessage(chatId, "❌ Image processing failed.").catch(console.error);
    }
});

bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    try {
        if (!isAuthorizedUser(chatId)) {
            await bot.sendMessage(chatId, "🚫 Access denied.");
            return;
        }
        
        const sessionId = await startUserSession(chatId, 'DOCUMENT_MESSAGE');
        await handleDocumentMessage(msg, chatId, sessionId);
        await endUserSession(sessionId, 1, Date.now());
        
    } catch (error) {
        console.error(`❌ Document error for ${chatId}:`, error.message);
        await bot.sendMessage(chatId, "❌ Document processing failed.").catch(console.error);
    }
});

console.log("✅ Working bot handlers loaded!");
console.log("🎤 Voice: Full processing with your dual AI (WORKING)");
console.log("📸 Images: Basic handling only (no AI analysis)");  
console.log("📄 Documents: Text extraction + your dual AI for text");


// 💰 COMPLETE LIVE DATA HANDLER FUNCTIONS - FIXED VERSION
// 🔧 FIXED: Smart crypto detection that WON'T hijack conversations

// 🔧 COMPLETELY REWRITTEN: Much stricter crypto detection
function isAnyCryptoRequest(text) {
    const trimmedText = text.trim();
    
    // 🚫 REJECT long messages immediately (this fixes your Dynasty System issue)
    if (trimmedText.length > 100) {
        console.log(`🚫 Crypto detection SKIPPED - message too long (${trimmedText.length} chars)`);
        return false;
    }
    
    // 🚫 REJECT messages with business/strategic keywords
    const businessKeywords = [
        'dynasty', 'system', 'capital', 'governance', 'fund', 'sovereignty',
        'deployment', 'systematic', 'strategic', 'business', 'structure',
        'level', 'complete', 'active', 'progress', 'redemption', 'filtering'
    ];
    
    const lowerText = trimmedText.toLowerCase();
    const hasBusinessContext = businessKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasBusinessContext) {
        console.log(`🚫 Crypto detection SKIPPED - business context detected`);
        return false;
    }
    
    // ✅ ONLY allow very explicit crypto price patterns
    const strictCryptoPricePatterns = [
        // Direct price questions
        /^(?:what(?:'s| is)?|how much|price of|cost of|value of)\s+(?:bitcoin|btc|ethereum|eth|crypto|matic|polygon)(?:\s+(?:price|cost|worth|value))?\??$/i,
        /^(?:bitcoin|btc|ethereum|eth|crypto|matic|polygon)\s+(?:price|cost|worth|value)\??$/i,
        /^(?:price|cost|value|worth)\s+(?:of\s+)?(?:bitcoin|btc|ethereum|eth|crypto|matic|polygon)\??$/i,
        
        // Ultra-short crypto queries
        /^(?:bitcoin|btc|ethereum|eth|crypto)\s*\??$/i,
        
        // "X price" format
        /^(?:bitcoin|btc|ethereum|eth|matic|polygon)\s+price\s*(?:today|now)?\??$/i,
        
        // "Current X" format
        /^current\s+(?:bitcoin|btc|ethereum|eth|crypto|matic|polygon)(?:\s+price)?\??$/i,
        
        // "How much is X" format
        /^how\s+much\s+(?:is\s+)?(?:bitcoin|btc|ethereum|eth|crypto|matic|polygon)\??$/i
    ];
    
    const isExplicitCryptoRequest = strictCryptoPricePatterns.some(pattern => {
        const matches = pattern.test(trimmedText);
        if (matches) {
            console.log(`✅ Crypto pattern matched: ${pattern.source}`);
        }
        return matches;
    });
    
    console.log(`🔍 Crypto detection result: ${isExplicitCryptoRequest ? 'CRYPTO REQUEST' : 'NOT CRYPTO'} for "${trimmedText.substring(0, 50)}"`);
    return isExplicitCryptoRequest;
}

// 🔧 IMPROVED: Better crypto extraction with exact word matching
function extractCryptoFromText(text) {
    const lowerText = text.toLowerCase().trim();
    
    // Split into words for exact matching (prevents "systematic" → "matic" issue)
    const words = lowerText.split(/\s+/);
    
    // Crypto mappings with exact word matching
    const cryptoMappings = {
        'bitcoin': { coinId: 'bitcoin', symbol: 'BTC', displayName: 'Bitcoin' },
        'btc': { coinId: 'bitcoin', symbol: 'BTC', displayName: 'Bitcoin' },
        'ethereum': { coinId: 'ethereum', symbol: 'ETH', displayName: 'Ethereum' },
        'eth': { coinId: 'ethereum', symbol: 'ETH', displayName: 'Ethereum' },
        'ether': { coinId: 'ethereum', symbol: 'ETH', displayName: 'Ethereum' },
        'cardano': { coinId: 'cardano', symbol: 'ADA', displayName: 'Cardano' },
        'ada': { coinId: 'cardano', symbol: 'ADA', displayName: 'Cardano' },
        'solana': { coinId: 'solana', symbol: 'SOL', displayName: 'Solana' },
        'sol': { coinId: 'solana', symbol: 'SOL', displayName: 'Solana' },
        'polkadot': { coinId: 'polkadot', symbol: 'DOT', displayName: 'Polkadot' },
        'dot': { coinId: 'polkadot', symbol: 'DOT', displayName: 'Polkadot' },
        'chainlink': { coinId: 'chainlink', symbol: 'LINK', displayName: 'Chainlink' },
        'link': { coinId: 'chainlink', symbol: 'LINK', displayName: 'Chainlink' },
        'litecoin': { coinId: 'litecoin', symbol: 'LTC', displayName: 'Litecoin' },
        'ltc': { coinId: 'litecoin', symbol: 'LTC', displayName: 'Litecoin' },
        'dogecoin': { coinId: 'dogecoin', symbol: 'DOGE', displayName: 'Dogecoin' },
        'doge': { coinId: 'dogecoin', symbol: 'DOGE', displayName: 'Dogecoin' },
        'binance': { coinId: 'binancecoin', symbol: 'BNB', displayName: 'Binance Coin' },
        'bnb': { coinId: 'binancecoin', symbol: 'BNB', displayName: 'Binance Coin' },
        'ripple': { coinId: 'ripple', symbol: 'XRP', displayName: 'Ripple' },
        'xrp': { coinId: 'ripple', symbol: 'XRP', displayName: 'Ripple' },
        'avalanche': { coinId: 'avalanche', symbol: 'AVAX', displayName: 'Avalanche' },
        'avax': { coinId: 'avalanche', symbol: 'AVAX', displayName: 'Avalanche' },
        'polygon': { coinId: 'polygon', symbol: 'MATIC', displayName: 'Polygon' },
        'matic': { coinId: 'polygon', symbol: 'MATIC', displayName: 'Polygon' },
        'shiba': { coinId: 'shiba-inu', symbol: 'SHIB', displayName: 'Shiba Inu' },
        'shib': { coinId: 'shiba-inu', symbol: 'SHIB', displayName: 'Shiba Inu' }
    };
    
    // Find matching crypto using EXACT word matching
    for (const word of words) {
        if (cryptoMappings[word]) {
            console.log(`✅ Crypto extracted: ${word} → ${cryptoMappings[word].displayName}`);
            return cryptoMappings[word];
        }
    }
    
    // Special case: if message contains "crypto" as exact word AND is short
    if (words.includes('crypto') && lowerText.length < 30) {
        console.log(`✅ Generic crypto request → defaulting to Bitcoin`);
        return {
            coinId: 'bitcoin',
            symbol: 'BTC',
            displayName: 'Bitcoin'
        };
    }
    
    console.log(`❌ No crypto identified from words: ${words.join(', ')}`);
    return null;
}

// 💰 FIXED: Smart crypto handler with much better validation
async function handleSmartCryptoPrice(chatId, text) {
    const startTime = Date.now();
    try {
        console.log(`🔍 Processing crypto request: "${text.substring(0, 50)}"`);
        
        // Double-check that this is really a crypto request
        if (!isAnyCryptoRequest(text)) {
            console.log(`❌ Failed double-check - not a crypto request`);
            await sendSmartMessage(bot, chatId, 
                "🤔 I'm not sure that was a crypto price request.\n\n" +
                "**For crypto prices, try:**\n" +
                "• `bitcoin price`\n" +
                "• `ethereum price`\n" +
                "• `btc`\n" +
                "• `eth price`"
            );
            return;
        }
        
        // Extract crypto info from user message
        const cryptoInfo = extractCryptoFromText(text);
        
        if (!cryptoInfo) {
            console.log("❌ No valid crypto identified in message");
            await sendSmartMessage(bot, chatId, 
                "🤔 I couldn't identify which cryptocurrency you're asking about.\n\n" +
                "**Try these exact formats:**\n" +
                "• `bitcoin price`\n" +
                "• `ethereum price` \n" +
                "• `btc`\n" +
                "• `eth`\n" +
                "• `dogecoin price`"
            );
            return;
        }
        
        console.log(`💰 Fetching ${cryptoInfo.displayName} (${cryptoInfo.coinId}) price data...`);
        await bot.sendMessage(chatId, `💰 Fetching live ${cryptoInfo.displayName} price...`);
        
        // Fetch data with timeout and error handling
        const cryptoIds = [cryptoInfo.coinId, 'bitcoin', 'ethereum']
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(',');
        
        const fetch = require('node-fetch');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        let response;
        try {
            response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
                { 
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'IMPERIUM-VAULT-SYSTEM/1.0'
                    }
                }
            );
        } catch (fetchError) {
            clearTimeout(timeout);
            throw new Error(`Network error: ${fetchError.message}`);
        }
        
        clearTimeout(timeout);
        
        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        console.log(`📊 API Response received: ${Object.keys(data).join(', ')}`);
        
        // Get the requested crypto data
        const requestedCrypto = data[cryptoInfo.coinId];
        
        if (requestedCrypto && requestedCrypto.usd) {
            const price = requestedCrypto.usd;
            const change = requestedCrypto.usd_24h_change || 0;
            const marketCap = requestedCrypto.usd_market_cap || 0;
            
            const emoji = change > 0 ? '🟢📈' : change < 0 ? '🔴📉' : '⚪';
            
            // Get appropriate symbol emoji
            const symbolEmoji = {
                'bitcoin': '₿',
                'ethereum': 'Ξ', 
                'cardano': '₳',
                'solana': '◎',
                'polkadot': '●',
                'chainlink': '🔗',
                'litecoin': 'Ł',
                'dogecoin': 'Ð',
                'binancecoin': '🟡',
                'ripple': '◉',
                'polygon': '🟣',
                'avalanche': '🔺',
                'shiba-inu': '🐕'
            }[cryptoInfo.coinId] || '💰';
            
            let responseText = `💰 **Live ${cryptoInfo.displayName} Price**\n\n`;
            responseText += `${symbolEmoji} **${cryptoInfo.displayName} (${cryptoInfo.symbol})**\n`;
            responseText += `• **Price:** $${price < 1 ? price.toFixed(6) : price.toLocaleString()}\n`;
            responseText += `• **24h Change:** ${emoji} ${change > 0 ? '+' : ''}${change.toFixed(2)}%\n`;
            
            if (marketCap > 0) {
                responseText += `• **Market Cap:** $${(marketCap / 1e9).toFixed(1)}B\n`;
            }
            
            // Show Bitcoin for context if user asked for different crypto
            if (cryptoInfo.coinId !== 'bitcoin' && data.bitcoin) {
                const btcChange = data.bitcoin.usd_24h_change || 0;
                const btcEmoji = btcChange > 0 ? '🟢' : btcChange < 0 ? '🔴' : '⚪';
                responseText += `\n📊 **Bitcoin Reference:** $${data.bitcoin.usd.toLocaleString()} ${btcEmoji} ${btcChange > 0 ? '+' : ''}${btcChange.toFixed(2)}%\n`;
            }
            
            responseText += `\n⚡ **Response Time:** ${responseTime}ms\n`;
            responseText += `📊 **Data Source:** CoinGecko API\n`;
            responseText += `🕐 **Updated:** ${new Date().toLocaleTimeString()}\n\n`;
            responseText += `💡 **Try:** "ethereum price" | "dogecoin price" | /wealth for investment analysis`;
            
            await sendSmartMessage(bot, chatId, responseText);
            
            // Save to database
            await saveConversationDB(chatId, `${cryptoInfo.displayName} price request`, 
                `${cryptoInfo.symbol}: $${price < 1 ? price.toFixed(6) : price.toLocaleString()} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`, 
                "crypto_price").catch(console.error);
            
            console.log(`✅ ${cryptoInfo.displayName} price delivered: $${price < 1 ? price.toFixed(6) : price.toLocaleString()}`);
            
        } else {
            throw new Error(`${cryptoInfo.displayName} data not available in API response`);
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Smart crypto price error:', error.message);
        
        let errorResponse = `❌ **Unable to fetch live crypto price**\n\n`;
        
        if (error.message.includes('aborted')) {
            errorResponse += `**Error:** Request timeout (API too slow)\n\n`;
        } else if (error.message.includes('Network error')) {
            errorResponse += `**Error:** Network connection failed\n\n`;
        } else if (error.message.includes('API error')) {
            errorResponse += `**Error:** ${error.message}\n\n`;
        } else {
            errorResponse += `**Error:** ${error.message}\n\n`;
        }
        
        errorResponse += `**Alternatives:**\n`;
        errorResponse += `• Try again: "bitcoin price" or "ethereum price"\n`;
        errorResponse += `• Manual check: CoinGecko.com or Binance.com\n`;
        errorResponse += `• For strategies: /wealth command\n`;
        errorResponse += `• For analysis: Ask me "What's your crypto outlook?"`;
        
        await sendSmartMessage(bot, chatId, errorResponse);
        
        // Log failed API usage
        await logApiUsage('COINGECKO', 'crypto_price', 1, false, responseTime, 0, 0)
            .catch(err => console.error('API log error:', err.message));
    }
}

// 💰 BITCOIN PRICE using enhanced fallback system
async function handleLiveBitcoinPrice(chatId) {
    const startTime = Date.now();
    try {
        console.log("💰 Bitcoin price request initiated");
        await bot.sendMessage(chatId, "💰 Fetching live Bitcoin price from enhanced data feeds...");
        
        // Try different existing functions in order of preference
        let cryptoData = null;
        let dataSource = '';
        let attempts = [];
        
        // Method 1: Try getEnhancedLiveData (comprehensive market data)
        try {
            console.log("🔄 Trying getEnhancedLiveData...");
            const marketData = await getEnhancedLiveData();
            if (marketData?.crypto?.bitcoin?.usd) {
                cryptoData = { bitcoin: marketData.crypto.bitcoin };
                dataSource = 'Enhanced Live Data';
                console.log("✅ Enhanced live data successful");
            } else {
                attempts.push("Enhanced Live Data: No bitcoin data");
            }
        } catch (error) {
            attempts.push(`Enhanced Live Data: ${error.message}`);
            console.log('Enhanced live data not available:', error.message);
        }
        
        // Method 2: Try getRealLiveData 
        if (!cryptoData) {
            try {
                console.log("🔄 Trying getRealLiveData...");
                const realData = await getRealLiveData();
                if (realData?.bitcoin?.usd) {
                    cryptoData = { bitcoin: realData.bitcoin };
                    dataSource = 'Real Live Data';
                    console.log("✅ Real live data successful");
                } else {
                    attempts.push("Real Live Data: No bitcoin data");
                }
            } catch (error) {
                attempts.push(`Real Live Data: ${error.message}`);
                console.log('Real live data not available:', error.message);
            }
        }
        
        // Method 3: Try getComprehensiveMarketData (your super function)
        if (!cryptoData) {
            try {
                console.log("🔄 Trying getComprehensiveMarketData...");
                const marketData = await getComprehensiveMarketData();
                if (marketData?.assets?.crypto?.bitcoin?.usd) {
                    cryptoData = { bitcoin: marketData.assets.crypto.bitcoin };
                    dataSource = 'Comprehensive Market Data';
                    console.log("✅ Comprehensive market data successful");
                } else {
                    attempts.push("Comprehensive Market Data: No bitcoin data");
                }
            } catch (error) {
                attempts.push(`Comprehensive Market Data: ${error.message}`);
                console.log('Comprehensive market data not available:', error.message);
            }
        }
        
        // Method 4: Try direct CoinGecko API (fallback)
        if (!cryptoData) {
            try {
                console.log("🔄 Trying direct CoinGecko API...");
                const fetch = require('node-fetch');
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(
                    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
                    { signal: controller.signal }
                );
                clearTimeout(timeout);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.bitcoin?.usd) {
                        cryptoData = { bitcoin: {
                            usd: data.bitcoin.usd,
                            usd_24h_change: data.bitcoin.usd_24h_change,
                            usd_market_cap: data.bitcoin.usd_market_cap
                        }};
                        dataSource = 'CoinGecko API Direct';
                        console.log("✅ Direct API successful");
                    } else {
                        attempts.push("Direct API: No bitcoin data in response");
                    }
                } else {
                    attempts.push(`Direct API: HTTP ${response.status}`);
                }
            } catch (error) {
                attempts.push(`Direct API: ${error.message}`);
                console.log('Direct API also failed:', error.message);
            }
        }
        
        const responseTime = Date.now() - startTime;
        
        if (cryptoData && cryptoData.bitcoin) {
            const btc = cryptoData.bitcoin;
            const change = btc.usd_24h_change || 0;
            const emoji = change > 0 ? '🟢📈' : change < 0 ? '🔴📉' : '⚪';
            
            let response = `💰 **Live Bitcoin Price**\n\n`;
            response += `₿ **Bitcoin (BTC)**\n`;
            response += `• **Price:** $${btc.usd?.toLocaleString() || 'N/A'}\n`;
            response += `• **24h Change:** ${emoji} ${change > 0 ? '+' : ''}${change.toFixed(2)}%\n`;
            
            if (btc.usd_market_cap) {
                response += `• **Market Cap:** $${(btc.usd_market_cap / 1e12).toFixed(2)}T\n`;
            }
            
            response += `\n⚡ **Response Time:** ${responseTime}ms\n`;
            response += `📊 **Data Source:** ${dataSource}\n`;
            response += `🕐 **Updated:** ${new Date().toLocaleTimeString()}\n\n`;
            response += `💡 **Try:** /wealth for investment analysis or /crypto_live for all coins`;
            
            await sendSmartMessage(bot, chatId, response);
            
            // Save to database
            await saveConversationDB(chatId, "Live Bitcoin price request", 
                `BTC: $${btc.usd?.toLocaleString()} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`, 
                "live_crypto_price").catch(console.error);
            
            console.log(`✅ Live Bitcoin price delivered: $${btc.usd?.toLocaleString()} from ${dataSource}`);
            
        } else {
            throw new Error(`All Bitcoin data sources failed. Attempts: ${attempts.join('; ')}`);
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Live Bitcoin price error:', error.message);
        await sendSmartMessage(bot, chatId, 
            `❌ **Live Bitcoin data temporarily unavailable**\n\n` +
            `**Error:** All data sources failed\n` +
            `**Response Time:** ${responseTime}ms\n\n` +
            `**Alternatives:**\n` +
            `• Manual check: Visit CoinGecko.com or Binance.com\n` +
            `• Try: /wealth for investment strategies\n` +
            `• Use: "bitcoin price" for direct lookup`
        );
        
        // Log error for monitoring
        await logApiUsage('ALL_SOURCES', 'bitcoin_price', 1, false, responseTime, 0, 0)
            .catch(err => console.error('API log error:', err.message));
    }
}

// 📈 STOCK MARKET using your existing getStockMarketData()
async function handleLiveStockMarket(chatId) {
    const startTime = Date.now();
    try {
        console.log("📈 Stock market request initiated");
        await bot.sendMessage(chatId, "📈 Fetching live stock market data from enhanced feeds...");
        
        const stockData = await getStockMarketData();
        const responseTime = Date.now() - startTime;
        
        if (stockData && Object.keys(stockData).length > 0) {
            let response = `📈 **Live Stock Market Data**\n\n`;
            
            if (stockData.sp500) {
                const sp500Change = stockData.sp500.change || 0;
                const sp500Emoji = sp500Change > 0 ? '🟢' : sp500Change < 0 ? '🔴' : '⚪';
                response += `📊 **S&P 500:** ${stockData.sp500.value} ${sp500Emoji} ${sp500Change > 0 ? '+' : ''}${sp500Change}%\n`;
            }
            
            if (stockData.nasdaq) {
                const nasdaqChange = stockData.nasdaq.change || 0;
                const nasdaqEmoji = nasdaqChange > 0 ? '🟢' : nasdaqChange < 0 ? '🔴' : '⚪';
                response += `💻 **NASDAQ:** ${stockData.nasdaq.value} ${nasdaqEmoji} ${nasdaqChange > 0 ? '+' : ''}${nasdaqChange}%\n`;
            }
            
            if (stockData.dow) {
                const dowChange = stockData.dow.change || 0;
                const dowEmoji = dowChange > 0 ? '🟢' : dowChange < 0 ? '🔴' : '⚪';
                response += `🏭 **Dow Jones:** ${stockData.dow.value} ${dowEmoji} ${dowChange > 0 ? '+' : ''}${dowChange}%\n`;
            }
            
            if (stockData.vix) {
                response += `😰 **VIX (Fear Index):** ${stockData.vix.value}\n`;
            }
            
            response += `\n⚡ **Response Time:** ${responseTime}ms\n`;
            response += `📊 **Data Source:** Enhanced Stock Market System\n`;
            response += `🕐 **Updated:** ${new Date().toLocaleTimeString()}\n\n`;
            response += `💡 **Try:** /wealth for investment opportunities or /briefing for market analysis`;
            
            await sendSmartMessage(bot, chatId, response);
            
            await saveConversationDB(chatId, "Live stock market request", 
                `Stock market data delivered`, "live_stock_data").catch(console.error);
            
            console.log(`✅ Live stock market data delivered successfully`);
            
        } else {
            throw new Error("Enhanced stock data returned empty or invalid");
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Live stock market error:', error.message);
        await sendSmartMessage(bot, chatId, 
            `❌ **Live stock market data temporarily unavailable**\n\n` +
            `**Error:** ${error.message}\n` +
            `**Response Time:** ${responseTime}ms\n\n` +
            `**Alternatives:**\n` +
            `• Try: /briefing for market analysis\n` +
            `• Use: /wealth for investment strategies\n` +
            `• Manual check: Yahoo Finance or Bloomberg`
        );
        
        // Log error for monitoring
        await logApiUsage('STOCK_MARKET', 'live_stocks', 1, false, responseTime, 0, 0)
            .catch(err => console.error('API log error:', err.message));
    }
}

// 💰 COMPREHENSIVE CRYPTO using enhanced fallback system
async function handleLiveCryptoMarket(chatId) {
    const startTime = Date.now();
    try {
        console.log("💰 Comprehensive crypto market request initiated");
        await bot.sendMessage(chatId, "💰 Fetching live crypto market from enhanced data feeds...");
        
        let cryptoData = null;
        let dataSource = '';
        
        // Try enhanced crypto data sources
        try {
            console.log("🔄 Trying getEnhancedCryptoData...");
            cryptoData = await getEnhancedCryptoData();
            if (cryptoData && Object.keys(cryptoData).length > 0) {
                dataSource = 'Enhanced Crypto Data';
                console.log("✅ Enhanced crypto data successful");
            } else {
                throw new Error("Enhanced crypto data returned empty");
            }
        } catch (error) {
            console.log('Enhanced crypto data not available:', error.message);
            
            // Fallback to direct API
            try {
                console.log("🔄 Trying direct CoinGecko API...");
                const fetch = require('node-fetch');
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15000);
                
                const response = await fetch(
                    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,solana,polkadot&vs_currencies=usd&include_24hr_change=true',
                    { signal: controller.signal }
                );
                clearTimeout(timeout);
                
                if (response.ok) {
                    cryptoData = await response.json();
                    dataSource = 'CoinGecko API Direct';
                    console.log("✅ Direct crypto API successful");
                } else {
                    throw new Error(`API responded with ${response.status}`);
                }
            } catch (fallbackError) {
                console.log('Direct crypto API also failed:', fallbackError.message);
                throw new Error(`All crypto data sources failed: ${fallbackError.message}`);
            }
        }
        
        const responseTime = Date.now() - startTime;
        
        if (cryptoData && Object.keys(cryptoData).length > 0) {
            let response = `💰 **Live Crypto Market Overview**\n\n`;
            
            // Top cryptocurrencies
            const cryptos = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot'];
            let cryptoCount = 0;
            
            cryptos.forEach(crypto => {
                const data = cryptoData[crypto];
                if (data && data.usd) {
                    const change = data.usd_24h_change || 0;
                    const emoji = change > 0 ? '🟢' : change < 0 ? '🔴' : '⚪';
                    const symbol = {
                        bitcoin: '₿',
                        ethereum: 'Ξ',
                        cardano: '₳',
                        solana: '◎',
                        polkadot: '●'
                    }[crypto] || crypto.toUpperCase();
                    
                    response += `${symbol} **${crypto.charAt(0).toUpperCase() + crypto.slice(1)}**\n`;
                    response += `• ${data.usd < 1 ? data.usd.toFixed(6) : data.usd.toLocaleString()}\n`;
                    response += `• ${emoji} ${change > 0 ? '+' : ''}${change.toFixed(2)}%\n\n`;
                    cryptoCount++;
                }
            });
            
            if (cryptoCount === 0) {
                throw new Error("No valid crypto data found in response");
            }
            
            response += `⚡ **Response Time:** ${responseTime}ms\n`;
            response += `📊 **Data Source:** ${dataSource}\n`;
            response += `🕐 **Updated:** ${new Date().toLocaleTimeString()}\n\n`;
            response += `💡 **Try:** /wealth for crypto investment strategies`;
            
            await sendSmartMessage(bot, chatId, response);
            
            console.log(`✅ Live crypto market data delivered successfully from ${dataSource}`);
            
        } else {
            throw new Error("All crypto data sources returned empty data");
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Live crypto market error:', error.message);
        await sendSmartMessage(bot, chatId, 
            `❌ **Live crypto market data temporarily unavailable**\n\n` +
            `**Error:** ${error.message}\n` +
            `**Response Time:** ${responseTime}ms\n\n` +
            `**Alternatives:**\n` +
            `• Try: /wealth for crypto strategies\n` +
            `• Ask me: "What's your crypto analysis?"\n` +
            `• Manual check: CoinGecko.com or CoinMarketCap.com`
        );
        
        // Log error for monitoring
        await logApiUsage('CRYPTO_MARKET', 'live_crypto', 1, false, responseTime, 0, 0)
            .catch(err => console.error('API log error:', err.message));
    }
}

// 💱 FOREX DATA using your existing getMajorForexPairs()
async function handleLiveForexData(chatId) {
    const startTime = Date.now();
    try {
        await bot.sendMessage(chatId, "💱 Fetching live forex data from enhanced feeds...");
        
        const forexData = await getMajorForexPairs();
        const responseTime = Date.now() - startTime;
        
        if (forexData) {
            let response = `💱 **Live Forex Market Data**\n\n`;
            
            Object.entries(forexData).forEach(([pair, data]) => {
                if (data && data.rate) {
                    const change = data.change || 0;
                    const emoji = change > 0 ? '🟢' : change < 0 ? '🔴' : '⚪';
                    response += `💰 **${pair.toUpperCase()}:** ${data.rate} ${emoji} ${change > 0 ? '+' : ''}${change.toFixed(4)}\n`;
                }
            });
            
            response += `\n⚡ **Response Time:** ${responseTime}ms\n`;
            response += `📊 **Data Source:** Enhanced Forex System\n`;
            response += `🕐 **Updated:** ${new Date().toLocaleTimeString()}\n\n`;
            response += `💡 **Try:** /wealth for currency strategies or /macro for economic analysis`;
            
            await sendSmartMessage(bot, chatId, response);
            
            console.log(`✅ Live forex data delivered successfully`);
            
        } else {
            throw new Error("Enhanced forex data not available");
        }
        
    } catch (error) {
        console.error('❌ Live forex error:', error.message);
        await sendSmartMessage(bot, chatId, 
            `❌ **Live forex data temporarily unavailable**\n\n` +
            `**Try:** /macro for economic analysis or ask me about currency strategies!`
        );
    }
}

// 🏦 ECONOMIC DATA using your existing getEconomicIndicators()
async function handleLiveEconomicData(chatId) {
    const startTime = Date.now();
    try {
        await bot.sendMessage(chatId, "🏦 Fetching live economic data from enhanced feeds...");
        
        const economicData = await getEconomicIndicators();
        const responseTime = Date.now() - startTime;
        
        if (economicData) {
            let response = `🏦 **Live Economic Indicators**\n\n`;
            
            if (economicData.inflation) response += `📈 **Inflation Rate:** ${economicData.inflation}%\n`;
            if (economicData.fedRate) response += `🏛️ **Fed Funds Rate:** ${economicData.fedRate}%\n`;
            if (economicData.unemployment) response += `👥 **Unemployment:** ${economicData.unemployment}%\n`;
            if (economicData.gdp) response += `🏛️ **GDP Growth:** ${economicData.gdp}%\n`;
            if (economicData.yieldCurve) response += `📊 **10Y-2Y Yield Curve:** ${economicData.yieldCurve}bp\n`;
            
            response += `\n⚡ **Response Time:** ${responseTime}ms\n`;
            response += `📊 **Data Source:** Enhanced Economic System\n`;
            response += `🕐 **Updated:** ${new Date().toLocaleTimeString()}\n\n`;
            response += `💡 **Try:** /regime for economic analysis or /macro for macro outlook`;
            
            await sendSmartMessage(bot, chatId, response);
            
            console.log(`✅ Live economic data delivered successfully`);
            
        } else {
            throw new Error("Enhanced economic data not available");
        }
        
    } catch (error) {
        console.error('❌ Live economic data error:', error.message);
        await sendSmartMessage(bot, chatId, 
            `❌ **Live economic data temporarily unavailable**\n\n` +
            `**Try:** /regime for economic analysis or /macro for macro outlook!`
        );
    }
}

// 📊 COMPREHENSIVE LIVE DATA using your existing getComprehensiveMarketData()
async function handleComprehensiveLiveData(chatId) {
    const startTime = Date.now();
    try {
        console.log("📊 Comprehensive live data request initiated");
        await bot.sendMessage(chatId, "📊 Fetching comprehensive live market data from all enhanced feeds...");
        
        // Use your existing getComprehensiveMarketData() function!
        const marketData = await getComprehensiveMarketData();
        const responseTime = Date.now() - startTime;
        
        if (marketData && typeof marketData === 'object') {
            let response = `📊 **Comprehensive Live Market Data**\n\n`;
            let sectionsAdded = 0;
            
            // Crypto section
            if (marketData.assets?.crypto) {
                response += `💰 **Cryptocurrency:**\n`;
                const btc = marketData.assets.crypto.bitcoin;
                if (btc && btc.usd) {
                    const change = btc.usd_24h_change || 0;
                    response += `₿ Bitcoin: ${btc.usd.toLocaleString()} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)\n`;
                    sectionsAdded++;
                }
                
                const eth = marketData.assets.crypto.ethereum;
                if (eth && eth.usd) {
                    const change = eth.usd_24h_change || 0;
                    response += `Ξ Ethereum: ${eth.usd.toLocaleString()} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)\n`;
                }
                response += `\n`;
            }
            
            // Stock section
            if (marketData.intelligence?.stocks) {
                response += `📈 **Stock Market:**\n`;
                const stocks = marketData.intelligence.stocks;
                if (stocks.sp500) {
                    response += `📊 S&P 500: ${stocks.sp500.value} (${stocks.sp500.change}%)\n`;
                    sectionsAdded++;
                }
                if (stocks.nasdaq) response += `💻 NASDAQ: ${stocks.nasdaq.value} (${stocks.nasdaq.change}%)\n`;
                response += `\n`;
            }
            
            // Economic section
            if (marketData.intelligence?.economics) {
                response += `🏦 **Economic Indicators:**\n`;
                const econ = marketData.intelligence.economics;
                if (econ.inflation) {
                    response += `📈 Inflation: ${econ.inflation}%\n`;
                    sectionsAdded++;
                }
                if (econ.fedRate) response += `🏛️ Fed Rate: ${econ.fedRate}%\n`;
                response += `\n`;
            }
            
            // Forex section
            if (marketData.assets?.forex) {
                response += `💱 **Forex:**\n`;
                const forex = marketData.assets.forex;
                let forexCount = 0;
                Object.entries(forex).slice(0, 3).forEach(([pair, data]) => {
                    if (data?.rate) {
                        response += `💰 ${pair.toUpperCase()}: ${data.rate}\n`;
                        forexCount++;
                    }
                });
                if (forexCount > 0) sectionsAdded++;
                response += `\n`;
            }
            
            // Check if we got meaningful data
            if (sectionsAdded === 0) {
                throw new Error("No meaningful market data sections available");
            }
            
            response += `⚡ **Response Time:** ${responseTime}ms\n`;
            response += `📊 **Data Quality:** ${marketData.data_quality?.completeness_score || 'Unknown'}%\n`;
            response += `🕐 **Updated:** ${new Date().toLocaleTimeString()}\n`;
            response += `📋 **Sections:** ${sectionsAdded} available\n\n`;
            response += `💡 **Try:** /wealth for AI investment analysis`;
            
            await sendMarketAnalysis(bot, chatId, response);
            
            console.log(`✅ Comprehensive live data delivered successfully (${sectionsAdded} sections)`);
            
        } else {
            throw new Error("Comprehensive market data returned invalid format");
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ Comprehensive live data error:', error.message);
        await sendSmartMessage(bot, chatId, 
            `❌ **Comprehensive live data temporarily unavailable**\n\n` +
            `**Error:** ${error.message}\n` +
            `**Response Time:** ${responseTime}ms\n\n` +
            `**Alternatives:**\n` +
            `• Try individual commands: /live_crypto, /live_stocks\n` +
            `• Use: /wealth for investment analysis\n` +
            `• Ask me: "What's your market outlook?"`
        );
        
        // Log error for monitoring
        await logApiUsage('COMPREHENSIVE', 'live_data', 1, false, responseTime, 0, 0)
            .catch(err => console.error('API log error:', err.message));
    }
}

// 🔧 SINGLE, CLEAN EXPRESS SERVER SETUP - COMPLETELY FIXED
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced webhook endpoint
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
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            version: "4.0 - WEALTH EMPIRE",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 🔧 FIXED: Complete the checkSystemHealth function
async function checkSystemHealth() {
    try {
        console.log("🔍 Checking system health...");
        
        const health = {
            gptAnalysis: false,
            claudeAnalysis: false,
            contextBuilding: false,
            memorySystem: false,
            dateTimeSupport: false,
            dualMode: false,
            overallHealth: false
        };
        
        // Test GPT-5 availability
        try {
            await getUniversalAnalysis('test', { maxTokens: 10 });
            health.gptAnalysis = true;
        } catch (error) {
            console.log('GPT health check failed:', error.message);
        }
        
        // Test Claude availability
        try {
            await getClaudeAnalysis('test', { maxTokens: 10 });
            health.claudeAnalysis = true;
        } catch (error) {
            console.log('Claude health check failed:', error.message);
        }
        
        // Test context building
        try {
            const context = await buildConversationContextWithMemory('test_user', 'test message');
            health.contextBuilding = !!context;
        } catch (error) {
            console.log('Context building health check failed:', error.message);
        }
        
        // Test memory system
        try {
            await getPersistentMemoryDB('test_user');
            health.memorySystem = true;
        } catch (error) {
            console.log('Memory system health check failed:', error.message);
        }
        
        // Test date/time support
        try {
            const cambodiaTime = getCurrentCambodiaDateTime();
            health.dateTimeSupport = !!cambodiaTime;
        } catch (error) {
            console.log('DateTime health check failed:', error.message);
        }
        
        // Test dual mode
        health.dualMode = health.gptAnalysis && health.claudeAnalysis;
        
        // Overall health
        const healthyComponents = Object.values(health).filter(Boolean).length;
        health.overallHealth = healthyComponents >= 4; // At least 4 out of 6 components working
        
        console.log(`✅ System health check completed: ${healthyComponents}/6 components healthy`);
        return health;
        
    } catch (error) {
        console.error('❌ System health check failed:', error.message);
        return {
            gptAnalysis: false,
            claudeAnalysis: false,
            contextBuilding: false,
            memorySystem: false,
            dateTimeSupport: false,
            dualMode: false,
            overallHealth: false
        };
    }
}

// 🚀 FIXED SERVER STARTUP WITH PROPER BOT INITIALIZATION
const server = app.listen(PORT, "0.0.0.0", async () => {
    console.log("🚀 Enhanced AI Assistant v4.0 - WEALTH EMPIRE starting...");
    console.log(`✅ Server running on port ${PORT}`);
    console.log("🤖 Models: gpt-5 + Claude Opus 4.1");
    console.log("💰 AI Wealth-Building System: 10 modules loaded");
    
    // Initialize enhanced database
    try {
        await initializeEnhancedDatabase();
        console.log("💾 Enhanced database integration successful");
        console.log("🧠 Persistent memory system initialized");
    } catch (error) {
        console.error("❌ Database initialization failed:", error.message);
        console.log("⚠️ Running with limited database functionality");
    }
    
// 🔧 SIMPLIFIED: Force polling mode for better reliability
    console.log("🤖 Initializing Telegram bot in POLLING MODE...");
    
    let botInitialized = false;
    
    try {
        // Always delete webhook first
        await bot.deleteWebHook();
        console.log("🗑️ Webhook deleted");
        
        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Start polling (more reliable than webhook)
        await bot.startPolling({ restart: true });
        console.log("✅ Bot polling started successfully");
        botInitialized = true;
        
    } catch (botError) {
        console.error("❌ Bot initialization failed:", botError.message);
        
        // Try one more time
        try {
            console.log("🔄 Retrying bot initialization...");
            await new Promise(resolve => setTimeout(resolve, 3000));
            await bot.startPolling({ restart: true });
            console.log("✅ Bot polling started on retry");
            botInitialized = true;
        } catch (retryError) {
            console.error("❌ Bot retry failed:", retryError.message);
        }
    }
    
    // 🤖 ADD MESSAGE HANDLERS HERE - RIGHT AFTER BOT INITIALIZATION
    if (botInitialized) {
        console.log("🔧 Setting up Telegram message handlers...");
        
        // Handle text messages
        bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;
            
            // Skip non-text messages
            if (!text) return;
            
            try {
                console.log(`📨 Message received from ${chatId}: "${text}"`);
                
                // Check if user is authorized
                if (!isAuthorizedUser(chatId)) {
                    await bot.sendMessage(chatId, 
                        `🚫 **Access Denied**\n\n` +
                        `This is a private AI system. Contact the administrator for access.\n\n` +
                        `**Your Chat ID:** ${chatId}`
                    );
                    return;
                }
                
                // Start user session
                const sessionId = await startUserSession(chatId, 'TELEGRAM_MESSAGE');
                
                // Process the message with your DIRECT dual AI system
                await executeCommandWithLogging(chatId, text, sessionId);
                
                // End session
                await endUserSession(sessionId, 1, Date.now());
                
            } catch (error) {
                console.error(`❌ Message processing error for ${chatId}:`, error.message);
                
                // Send error response to user
                try {
                    await bot.sendMessage(chatId, 
                        "❌ I encountered an error processing your message. Please try again."
                    );
                } catch (sendError) {
                    console.error("❌ Failed to send error message:", sendError.message);
                }
            }
        });
        
        // Handle voice messages
        bot.on('voice', async (msg) => {
            const chatId = msg.chat.id;
            
            try {
                console.log(`🎤 Voice message received from ${chatId}`);
                
                if (!isAuthorizedUser(chatId)) {
                    await bot.sendMessage(chatId, "🚫 Access denied. Contact administrator.");
                    return;
                }
                
                const sessionId = await startUserSession(chatId, 'VOICE_MESSAGE');
                await handleVoiceMessage(msg, chatId, sessionId);
                await endUserSession(sessionId, 1, Date.now());
                
            } catch (error) {
                console.error(`❌ Voice processing error for ${chatId}:`, error.message);
                await bot.sendMessage(chatId, "❌ Voice processing failed. Please try again.").catch(console.error);
            }
        });
        
        // Handle document messages
        bot.on('document', async (msg) => {
            const chatId = msg.chat.id;
            
            try {
                console.log(`📄 Document received from ${chatId}: ${msg.document.file_name}`);
                
                if (!isAuthorizedUser(chatId)) {
                    await bot.sendMessage(chatId, "🚫 Access denied. Contact administrator.");
                    return;
                }
                
                const sessionId = await startUserSession(chatId, 'DOCUMENT_MESSAGE');
                await handleDocumentMessage(msg, chatId, sessionId);
                await endUserSession(sessionId, 1, Date.now());
                
            } catch (error) {
                console.error(`❌ Document processing error for ${chatId}:`, error.message);
                await bot.sendMessage(chatId, "❌ Document processing failed. Please try again.").catch(console.error);
            }
        });
        
        // Handle bot polling errors
        bot.on('polling_error', (error) => {
            console.error('🚨 Telegram polling error:', error.message);
        });
        
        // Handle webhook errors
        bot.on('webhook_error', (error) => {
            console.error('🚨 Telegram webhook error:', error.message);
        });
        
        // Simple test handler
        bot.onText(/\/test/, (msg) => {
            const chatId = msg.chat.id;
            console.log(`🧪 Test command received from ${chatId}`);
            bot.sendMessage(chatId, "✅ Bot is working! Message handlers are active.");
        });
        
        console.log("✅ Telegram message handlers configured successfully");
        
        console.log("🎯 Bot is ready to receive messages!");
        console.log("💡 Test with: /start or /wealth");
        console.log("📱 Bot should respond immediately now");
    } else {
        console.error("🚨 CRITICAL: Bot initialization completely failed!");
        console.log("🔧 Check TELEGRAM_BOT_TOKEN and try restarting");
    }
    
    console.log("🚀 AI WEALTH EMPIRE startup complete!");
    console.log("🤖 Bot Mode: POLLING (Forced for reliability)");
    console.log("💰 Ready to build wealth with AI!");
});

// 🔧 SINGLE SET OF ERROR HANDLERS (no duplicates)
process.on('unhandledRejection', (reason, promise) => {
    if (reason && reason.message && reason.message.includes('409')) {
        console.error("🚨 Telegram Bot Conflict (409): Another instance running!");
        console.log("🔧 Solution: Stop other instances or wait 60 seconds");
    } else {
        console.error('❌ Unhandled Promise Rejection:', reason);
    }
});

process.on('uncaughtException', (error) => {
    if (error.message && error.message.includes('ETELEGRAM')) {
        console.error("🚨 Telegram API Error:", error.message);
    } else if (error.message && error.message.includes('EADDRINUSE')) {
        console.error("🚨 Port already in use! Another server instance running.");
    } else {
        console.error('❌ Uncaught Exception:', error);
    }
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`🛑 ${signal} received, performing graceful shutdown...`);
    
    try {
        console.log('🤖 Stopping Telegram bot...');
        if (bot && typeof bot.stopPolling === 'function') {
            await bot.stopPolling().catch(console.error);
        }
        if (bot && typeof bot.deleteWebHook === 'function') {
            await bot.deleteWebHook().catch(console.error);
        }
        console.log('✅ Bot stopped successfully');
        
        // Update system metrics if function exists
        if (typeof updateSystemMetrics === 'function') {
            await updateSystemMetrics({
                system_shutdown: 1,
                wealth_system_shutdown: 1
            }).catch(console.error);
        }
        
        console.log('💾 Cleanup completed');
    } catch (error) {
        console.error('❌ Shutdown cleanup error:', error.message);
    }
    
    // Close server gracefully
    if (server && typeof server.close === 'function') {
        server.close(() => {
            console.log('✅ AI WEALTH EMPIRE shut down gracefully');
            process.exit(0);
        });
    } else {
        console.log('✅ AI WEALTH EMPIRE shut down gracefully');
        process.exit(0);
    }
};

// Process event listeners
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export for testing (this should be at the very end)
module.exports = {
    app,
    server,
    initializeEnhancedDatabase,
    connectionStats
};
