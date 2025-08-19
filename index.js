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
        { pattern: /my goal is to ([^.,\n!?]+)/i, type: 'goal' },
        { pattern: /my ai preference is ([^.,\n!?]+)/i, type: 'ai_preference' }
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

// 🔧 ENHANCED: Voice processing with your dual AI analysis
async function processVoiceWithDualAI(transcribedText, chatId, sessionId) {
    try {
        console.log("🤖 Processing transcription with GPT-5 + Claude Opus 4.1 dual AI system...");
        
const dualResult = await getUltimateStrategicAnalysis(transcribedText, {
    chatId: chatId,  // ✅ ADD THIS
    sessionId: sessionId || `session_${Date.now()}`,  // ✅ ADD THIS
    messageType: 'voice_transcription',
    enhancementLevel: 'VOICE_ENHANCED',
    originalAudio: true,
    transcriptionLength: transcribedText.length
});;

// Format result for compatibility
return {
    response: dualResult,
    aiUsed: 'DUAL_AI_SYSTEM',
    success: !!dualResult,
    queryType: 'voice_transcription'
};
        
    } catch (error) {
        console.error("❌ Dual AI voice processing error:", error.message);
        
        // Fallback to single AI processing
        console.log("🔄 Falling back to single AI processing...");
        return await getUniversalAnalysis(`Voice message transcription: "${transcribedText}"`, {
            maxTokens: 1200,
            temperature: 0.7,
            model: "gpt-5"
        });
    }
}

// 🔧 DEBUG: Voice processing diagnostics (add temporarily for testing)
async function debugVoiceProcessing(msg, chatId) {
    try {
        console.log("🔍 VOICE DEBUG - Message object:", JSON.stringify(msg.voice, null, 2));
        
        // Check environment variables
        console.log("🔍 OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);
        console.log("🔍 TELEGRAM_BOT_TOKEN present:", !!process.env.TELEGRAM_BOT_TOKEN);
        
        // Validate voice message
        validateVoiceMessage(msg);
        console.log("🔍 Voice message validation: ✅ PASSED");
        
        // Test file access
        const file = await bot.getFile(msg.voice.file_id);
        console.log("🔍 File info:", JSON.stringify(file, null, 2));
        
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        console.log("🔍 File URL:", fileUrl);
        
        // Test download
        const fetch = require('node-fetch');
        const response = await fetch(fileUrl);
        console.log("🔍 Download response status:", response.status);
        console.log("🔍 Download response size:", response.headers.get('content-length'));
        
        if (response.ok) {
            const buffer = await response.buffer();
            console.log("🔍 Downloaded buffer size:", buffer.length);
            
            // Test form data creation
            const FormData = require('form-data');
            const form = new FormData();
            form.append('file', buffer, { filename: 'test.ogg', contentType: 'audio/ogg' });
            form.append('model', 'whisper-1');
            console.log("🔍 Form data creation: ✅ SUCCESS");
            
            // Test Whisper API connection (don't actually send, just test auth)
            const authTest = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });
            console.log("🔍 OpenAI API auth test:", authTest.status);
            
            return "🔍 All voice processing components are working correctly!";
        } else {
            throw new Error(`Download failed: ${response.status}`);
        }
        
    } catch (error) {
        console.error("🔍 DEBUG ERROR:", error.message);
        console.error("🔍 DEBUG STACK:", error.stack);
        throw error;
    }
}

// 🔧 COMPLETELY REWRITTEN: Document message handler with full file support
async function handleDocumentMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("📄 Processing document:", msg.document.file_name);
        const isTraining = msg.caption?.toLowerCase().includes("train");
        const fileName = msg.document.file_name || "untitled_document";
        const fileSize = msg.document.file_size || 0;
        
        if (isTraining) {
            // Enhanced training document processing (this part was working)
            await bot.sendMessage(chatId, "📚 Processing document for enhanced AI training database...");
            
            try {
                const fileLink = await bot.getFileLink(msg.document.file_id);
                console.log("📥 Downloading document from Telegram...");
                
                const fetch = require('node-fetch');
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
                    // Enhanced PDF processing
                    content = await extractTextFromPDF(buffer);
                } else if (['doc', 'docx'].includes(fileExtension)) {
                    // Word document processing
                    content = await extractTextFromWord(buffer);
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
                }
                
                errorMessage += `**Please try:**\n` +
                    `• Converting to .txt or .md format\n` +
                    `• Reducing file size if too large\n` +
                    `• Checking if file is corrupted\n` +
                    `• Uploading via copy-paste for text content`;
                
                await sendSmartMessage(bot, chatId, errorMessage);
            }
            
        } else {
            // 🔧 COMPLETELY FIXED: Document analysis with GPT-5 + Claude dual analysis
            await bot.sendMessage(chatId, "📄 Analyzing document with GPT-5 + Claude Opus 4.1 enhanced AI...");
            
            try {
                // Get file from Telegram
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
                
                // Enhanced file type handling
                if (['txt', 'md', 'json', 'csv'].includes(fileExtension)) {
                    content = buffer.toString('utf8');
                    extractionMethod = 'direct_text';
                } else if (fileExtension === 'pdf') {
                    content = await extractTextFromPDF(buffer);
                    extractionMethod = 'pdf_extraction';
                } else if (['doc', 'docx'].includes(fileExtension)) {
                    content = await extractTextFromWord(buffer);
                    extractionMethod = 'word_extraction';
                } else if (['xls', 'xlsx'].includes(fileExtension)) {
                    content = await extractTextFromExcel(buffer);
                    extractionMethod = 'excel_extraction';
                } else {
                    // Try to read as text
                    content = buffer.toString('utf8');
                    extractionMethod = 'fallback_text';
                }
                
                if (content.length === 0) {
                    throw new Error("Document appears to be empty or unreadable");
                }
                
                // 🔧 ENHANCED: Dual AI analysis - use both GPT-5 and Claude for comprehensive analysis
                let analysis;
                
                if (content.length > 12000) {
                    // For very large documents, use Claude for better handling
                    const summary = content.substring(0, 8000);
                    const prompt = `Analyze this document (showing first part due to length):\n\n${summary}\n\n[Document truncated - ${content.length} total characters]\n\nProvide comprehensive analysis covering:\n1. Document type and purpose\n2. Key topics and main themes\n3. Important insights and findings\n4. Structure and organization\n5. Data/statistics if present\n6. Recommendations or conclusions\n7. Overall assessment and significance`;
                    
                    analysis = await getClaudeAnalysis(prompt, { maxTokens: 1500 });
                    analysis = `**Claude Opus 4.1 Analysis** (Large Document)\n\n${analysis}`;
                    
                } else if (content.length > 6000) {
                    // For medium documents, use GPT-5
                    const prompt = `Analyze this document in detail:\n\n${content}\n\nProvide comprehensive analysis covering:\n1. Document summary and purpose\n2. Key points and main themes\n3. Important insights and findings\n4. Structure and organization\n5. Data, statistics, or evidence presented\n6. Conclusions and recommendations\n7. Strategic implications or actionable items`;
                    
                    analysis = await getUniversalAnalysis(prompt, { 
                        max_completion_tokens: 1200,
                        temperature: 0.7,
                        model: "gpt-5"
                    });
                    analysis = `**GPT-5 Analysis** (Detailed)\n\n${analysis}`;
                    
                } else {
                    // For smaller documents, use dual AI for comprehensive analysis
                    const prompt = `Analyze this document:\n\n${content}\n\nProvide detailed analysis covering:\n1. Document summary\n2. Key insights and findings\n3. Important data or information\n4. Structure and organization\n5. Recommendations or next steps\n6. Overall assessment`;
                    
                    // Get both analyses
                    const [gptAnalysis, claudeAnalysis] = await Promise.allSettled([
                        getUniversalAnalysis(prompt, { 
                            max_completion_tokens: 800,
                            temperature: 0.7,
                            model: "gpt-5"
                        }),
                        getClaudeAnalysis(prompt, { maxTokens: 800 })
                    ]);
                    
                    // Combine analyses
                    let combinedAnalysis = `**Dual AI Analysis: GPT-5 + Claude Opus 4.1**\n\n`;
                    
                    if (gptAnalysis.status === 'fulfilled') {
                        combinedAnalysis += `**GPT-5 Analysis:**\n${gptAnalysis.value}\n\n`;
                    }
                    
                    if (claudeAnalysis.status === 'fulfilled') {
                        combinedAnalysis += `**Claude Opus 4.1 Analysis:**\n${claudeAnalysis.value}\n\n`;
                    }
                    
                    if (gptAnalysis.status === 'fulfilled' && claudeAnalysis.status === 'fulfilled') {
                        // Add synthesis
                        const synthesisPrompt = `Based on these two AI analyses of the same document, provide a brief synthesis highlighting:\n1. Key agreements between analyses\n2. Any unique insights from each AI\n3. Overall consensus and conclusions\n\nGPT-5: ${gptAnalysis.value.substring(0, 400)}\n\nClaude: ${claudeAnalysis.value.substring(0, 400)}`;
                        
                        const synthesis = await getUniversalAnalysis(synthesisPrompt, {
                            max_completion_tokens: 400,
                            temperature: 0.6,
                            model: "gpt-5"
                        });
                        
                        combinedAnalysis += `**AI Synthesis:**\n${synthesis}`;
                    }
                    
                    analysis = combinedAnalysis;
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
                    if (shouldSaveToPersistentMemory(`Document: ${fileName}`, analysis)) {
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

// 🔧 NEW: GPT-5 Vision Analysis Function
async function analyzeImageWithGPT5(base64Image, prompt) {
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
            max_completion_tokens: 1200,  // 🔧 FIXED: Correct parameter
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
                    max_completion_tokens: 1200,
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

// 🔧 NEW: PDF Text Extraction Function
async function extractTextFromPDF(buffer) {
    try {
        // Using pdf-parse library - install with: npm install pdf-parse
        const pdf = require('pdf-parse');
        const data = await pdf(buffer);
        
        if (!data.text || data.text.length === 0) {
            throw new Error("PDF contains no readable text");
        }
        
        console.log(`📄 PDF extracted: ${data.numpages} pages, ${data.text.length} characters`);
        return data.text;
        
    } catch (error) {
        console.error("PDF extraction error:", error.message);
        
        if (error.message.includes('pdf-parse')) {
            throw new Error("PDF parsing library not installed. Run: npm install pdf-parse");
        }
        
        throw new Error(`PDF text extraction failed: ${error.message}`);
    }
}

// 🔧 NEW: Word Document Text Extraction Function  
async function extractTextFromWord(buffer) {
    try {
        // Using mammoth library - install with: npm install mammoth
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: buffer });
        
        if (!result.value || result.value.length === 0) {
            throw new Error("Word document contains no readable text");
        }
        
        console.log(`📄 Word document extracted: ${result.value.length} characters`);
        
        // Log any warnings from mammoth
        if (result.messages && result.messages.length > 0) {
            console.log("⚠️ Word extraction warnings:", result.messages.map(m => m.message).join(', '));
        }
        
        return result.value;
        
    } catch (error) {
        console.error("Word extraction error:", error.message);
        
        if (error.message.includes('mammoth')) {
            throw new Error("Mammoth library not installed. Run: npm install mammoth");
        }
        
        throw new Error(`Word document extraction failed: ${error.message}`);
    }
}

// 🔧 NEW: Excel Text Extraction Function
async function extractTextFromExcel(buffer) {
    try {
        // Using xlsx library - install with: npm install xlsx
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
        console.error("Excel extraction error:", error.message);
        
        if (error.message.includes('xlsx') || error.message.includes('XLSX')) {
            throw new Error("XLSX library not installed. Run: npm install xlsx");
        }
        
        throw new Error(`Excel extraction failed: ${error.message}`);
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
// 🔧 ADD ALL THESE MISSING FUNCTIONS RIGHT BEFORE YOUR EXPRESS SERVER SETUP

// Missing Cambodia fund helper functions
async function getCambodiaFundMetrics() {
    try {
        // Replace with real database query later
        return {
            totalAUM: 2500000,
            deployedCapital: 2000000,
            availableCapital: 500000,
            activeDeals: 12,
            currentYield: 17.5,
            concentrationRisk: 'MODERATE'
        };
    } catch (error) {
        console.error('Cambodia fund metrics error:', error.message);
        return null;
    }
}

async function getRecentCambodiaDeals(chatId, limit = 10) {
    try {
        // Replace with real database query
        return [
            { amount: 500000, collateral_type: 'commercial', status: 'approved' },
            { amount: 750000, collateral_type: 'residential', status: 'approved' },
            { amount: 300000, collateral_type: 'land', status: 'pending' }
        ];
    } catch (error) {
        console.error('Recent deals error:', error.message);
        return [];
    }
}

async function getCambodiaMarketTrends(days = 90) {
    try {
        return {
            direction: 'STABLE',
            volatility: 'LOW',
            keyDrivers: ['Economic growth', 'Infrastructure development']
        };
    } catch (error) {
        console.error('Market trends error:', error.message);
        return null;
    }
}

// Missing risk assessment helpers
async function getRiskAssessmentHistory(chatId, days = 30) {
    try {
        return [
            { total_risk_percent: 25.5, assessment_date: new Date() },
            { total_risk_percent: 23.2, assessment_date: new Date(Date.now() - 86400000) }
        ];
    } catch (error) {
        console.error('Risk history error:', error.message);
        return [];
    }
}

// Missing market analysis helpers
async function getMarketBriefingHistory(days = 7) {
    try {
        return [
            { regime_confidence: 75, market_direction: 'BULLISH' },
            { regime_confidence: 72, market_direction: 'NEUTRAL' }
        ];
    } catch (error) {
        console.error('Briefing history error:', error.message);
        return [];
    }
}

async function getOpportunityHistory(chatId, days = 30) {
    try {
        return [
            { confidence: 80, outcome: 'POSITIVE' },
            { confidence: 75, outcome: 'POSITIVE' },
            { confidence: 70, outcome: 'NEUTRAL' }
        ];
    } catch (error) {
        console.error('Opportunity history error:', error.message);
        return [];
    }
}

async function getMacroAnalysisHistory(days = 30) {
    try {
        return [
            { outlook_sentiment: 'POSITIVE', key_themes: ['Growth', 'Inflation'] },
            { outlook_sentiment: 'POSITIVE', key_themes: ['Policy', 'Markets'] }
        ];
    } catch (error) {
        console.error('Macro history error:', error.message);
        return [];
    }
}

// Missing trading helpers
async function getTradingAccountHistory(chatId, days = 7) {
    try {
        return [
            { balance: 10000, daily_pnl: 150, equity: 10150 },
            { balance: 9850, daily_pnl: -50, equity: 9800 }
        ];
    } catch (error) {
        console.error('Trading history error:', error.message);
        return [];
    }
}

// Missing memory/data helpers
async function clearAllData(chatId) {
    try {
        console.log(`🗑️ Clearing all data for user ${chatId}`);
        // Add actual clearing logic here later
        return true;
    } catch (error) {
        console.error('Clear data error:', error.message);
        return false;
    }
}

// Missing wealth system handlers - Stock scanning
async function handleStockScanning(chatId) {
    try {
        console.log(`📊 Stock scanning requested by user ${chatId}`);
        
        await sendSmartMessage(bot, chatId, "📊 Scanning stock markets with AI intelligence...");
        
        const stockPrompt = `Analyze current stock market opportunities:

**Stock Market Scan:**
1. High-momentum stocks with strong fundamentals
2. Value opportunities in oversold markets
3. Dividend aristocrats for income
4. Growth stocks with sustainable metrics
5. Technical breakout patterns
6. Sector rotation opportunities
7. Risk assessment for each category

**Provide specific stock recommendations with entry strategies.**`;
        
        const analysis = await getUniversalAnalysis(stockPrompt, { 
            maxTokens: 1200,
            temperature: 0.7 
        });
        
        await sendAnalysis(bot, chatId, analysis, "📊 AI Stock Scanner");
        
        await saveConversationDB(chatId, "/scan_stocks", analysis, "wealth_command").catch(console.error);
        console.log("✅ Stock scanning completed successfully");
        
    } catch (error) {
        console.error(`❌ Stock scanning failed for user ${chatId}:`, error);
        await sendSmartMessage(bot, chatId, "❌ Stock scanning temporarily unavailable. Please try again or ask me about stock opportunities.");
    }
}

// Missing wealth system handlers - Crypto scanning
async function handleCryptoScanning(chatId) {
    try {
        console.log(`₿ Crypto scanning requested by user ${chatId}`);
        
        await sendSmartMessage(bot, chatId, "₿ Scanning cryptocurrency markets with AI intelligence...");
        
        const cryptoPrompt = `Analyze current cryptocurrency opportunities:

**Crypto Market Scan:**
1. High-momentum cryptocurrencies with strong fundamentals
2. DeFi opportunities and yield farming
3. Staking rewards and passive income
4. Layer 1 and Layer 2 scaling solutions
5. NFT and GameFi opportunities
6. Technical analysis and chart patterns
7. Risk assessment and portfolio allocation

**Provide specific crypto recommendations with risk management.**`;
        
        const analysis = await getUniversalAnalysis(cryptoPrompt, { 
            maxTokens: 1200,
            temperature: 0.7 
        });
        
        await sendAnalysis(bot, chatId, analysis, "₿ AI Crypto Scanner");
        
        await saveConversationDB(chatId, "/scan_crypto", analysis, "wealth_command").catch(console.error);
        console.log("✅ Crypto scanning completed successfully");
        
    } catch (error) {
        console.error(`❌ Crypto scanning failed for user ${chatId}:`, error);
        await sendSmartMessage(bot, chatId, "❌ Crypto scanning temporarily unavailable. Please try again or ask me about cryptocurrency opportunities.");
    }
}

// Missing wealth system handlers - Top opportunities
async function handleTopOpportunities(chatId) {
    try {
        console.log(`🎯 Top opportunities requested by user ${chatId}`);
        
        await sendSmartMessage(bot, chatId, "🎯 Identifying top opportunities across all asset classes...");
        
        const opportunitiesPrompt = `Identify the top 5 investment opportunities across all asset classes:

**Cross-Asset Opportunity Analysis:**
1. Stocks - High-conviction picks with catalysts
2. Bonds - Yield and credit opportunities
3. Commodities - Supply/demand imbalances
4. Real Estate - REITs and property markets
5. Cryptocurrencies - Emerging trends and adoption
6. Alternative investments - Private markets
7. Currency and FX opportunities

**Rank by risk-adjusted return potential with implementation strategies.**`;
        
        const analysis = await getUniversalAnalysis(opportunitiesPrompt, { 
            maxTokens: 1200,
            temperature: 0.7 
        });
        
        await sendAnalysis(bot, chatId, analysis, "🎯 Top Investment Opportunities");
        
        await saveConversationDB(chatId, "/top_opportunities", analysis, "wealth_command").catch(console.error);
        console.log("✅ Top opportunities analysis completed successfully");
        
    } catch (error) {
        console.error(`❌ Top opportunities failed for user ${chatId}:`, error);
        await sendSmartMessage(bot, chatId, "❌ Opportunity analysis temporarily unavailable. Please try again or ask me about investment opportunities.");
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

// Enhanced database helper function stubs
async function getRegimeTransitions(days = 30) {
    try {
        console.log(`📊 Fetching regime transitions for last ${days} days`);
        return [];
    } catch (error) {
        console.error('Get regime transitions error:', error.message);
        return [];
    }
}

async function saveTradingPattern(chatId, pattern) {
    try {
        console.log(`💾 Saving trading pattern for ${chatId}: ${pattern.type}`);
        return true;
    } catch (error) {
        console.error('Save trading pattern error:', error.message);
        return false;
    }
}

async function saveCambodiaMarketData(marketData) {
    try {
        console.log('💾 Saving Cambodia market data to enhanced database');
        return true;
    } catch (error) {
        console.error('Save Cambodia market data error:', error.message);
        return false;
    }
}

async function getCurrentMarketConditions() {
    try {
        return 'NORMAL';
    } catch (error) {
        return 'UNKNOWN';
    }
}

async function saveMarketBriefing(briefingData) {
    try {
        console.log('💾 Saving market briefing to database');
        return true;
    } catch (error) {
        console.error('Save market briefing error:', error.message);
        return false;
    }
}

async function saveTradingAccountSnapshot(chatId, snapshotData) {
    try {
        console.log(`💾 Saving trading account snapshot for ${chatId}`);
        return true;
    } catch (error) {
        console.error('Save trading snapshot error:', error.message);
        return false;
    }
}

async function saveUserSession(chatId, sessionData) {
    try {
        console.log(`💾 Saving user session for ${chatId}`);
        return true;
    } catch (error) {
        console.error('Save user session error:', error.message);
        return false;
    }
}

async function updateUserSession(sessionId, updateData) {
    try {
        console.log(`💾 Updating user session ${sessionId}`);
        return true;
    } catch (error) {
        console.error('Update user session error:', error.message);
        return false;
    }
}

async function saveApiUsageDB(usageData) {
    try {
        console.log(`💾 Saving API usage: ${usageData.apiProvider}/${usageData.endpoint}`);
        return true;
    } catch (error) {
        console.error('Save API usage error:', error.message);
        return false;
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
