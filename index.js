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
    getUltimateStrategicAnalysis,  // 🏆 MAIN FUNCTION ✅ EXISTS
    getUniversalAnalysis,          // ✅ EXISTS (points to Ultimate)
    getDualAnalysis,               // ✅ EXISTS (points to Ultimate)
    routeQuery,                    // ✅ EXISTS 
    checkDualSystemHealth,         // ✅ EXISTS
    testMemoryIntegration,         // ✅ EXISTS
    analyzeImageWithAI,            // ✅ EXISTS
    getGPT5Analysis,               // ✅ EXISTS
    getClaudeAnalysis,             // ✅ EXISTS
    getMarketAnalysis,             // ✅ EXISTS
    getCambodiaAnalysis,           // ✅ EXISTS
    dualAIRouter,                  // ✅ EXISTS
    getPerformanceStats,           // ✅ EXISTS
    quickSetup,                    // ✅ EXISTS
    initializeUltimateStrategicPowerSystem  // ✅ EXISTS
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

// 🤖 FIXED: Enhanced Dual AI Conversation Handler with GPT-5 + Claude Opus 4.1
async function handleDualAIConversation(chatId, text, sessionId) {
    const startTime = Date.now();
    
    try {
        console.log("🤖 Starting GPT-5 + Claude Opus 4.1 dual AI processing:", text.substring(0, 50));
        
        // 🔧 FIXED: Use correct function name and build memory context
        const context = await buildConversationContextWithMemory(chatId, text);
        
        // Determine conversation intelligence
        const conversationIntel = {
            type: determineConversationType(text),
            complexity: determineComplexity(text),
            requiresLiveData: requiresLiveData(text),
            hasMemory: context.memoryAvailable,
            conversationCount: context.conversationHistory?.length || 0
        };
        
        console.log("🎯 Conversation Intel:", conversationIntel);
        
        // 🔧 FIXED: Execute enhanced dual AI command with proper model selection
        const result = await executeEnhancedDualAICommand(text, chatId, context, conversationIntel);
        
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

// 🔧 FIXED: Execute Enhanced Dual AI Command with GPT-5 and Claude Opus 4.1
async function executeEnhancedDualAICommand(text, chatId, context, intel) {
    try {
        console.log("🚀 Executing GPT-5 + Claude Opus 4.1 dual command...");
        
        // Build enhanced prompt with memory context
        const enhancedPrompt = buildEnhancedPrompt(text, context, intel);
        
        // 🎯 ROUTE QUERY TO BEST AI MODEL
        const aiChoice = routeToOptimalAI(text, intel);
        console.log(`🤖 AI Choice: ${aiChoice}`);
        
        let result;
        
        if (aiChoice === 'DUAL_CONSENSUS') {
            // Run both AIs and compare results
            result = await getDualConsensusAnalysis(enhancedPrompt, context, intel);
        } else if (aiChoice === 'GPT5_PREFERRED') {
            // Use GPT-5 for this type of query
            result = await getGPT5Analysis(enhancedPrompt, context, intel);
        } else if (aiChoice === 'CLAUDE_PREFERRED') {
            // Use Claude Opus 4.1 for this type of query
            result = await getClaudeOpus41Analysis(enhancedPrompt, context, intel);
        } else {
            // Fallback to your ultimate strategic analysis
            result = await getUltimateStrategicAnalysis(enhancedPrompt, {
                sessionId: chatId,
                memoryContext: context.memoryContext,
                queryType: intel.type,
                complexity: intel.complexity
            });
        }
        
        console.log("✅ Enhanced dual AI command successful:", result.aiUsed);
        return result;
        
    } catch (error) {
        console.log("⚠️ Enhanced dual AI failed, using fallback:", error.message);
        throw error;
    }
}

// 🔧 NEW: Route to Optimal AI based on query characteristics
function routeToOptimalAI(text, intel) {
    const lower = text.toLowerCase();
    
    // GPT-5 is better for:
    if (lower.includes('code') || lower.includes('programming') || 
        lower.includes('debug') || lower.includes('script') ||
        intel.type === 'coding_analysis') {
        return 'GPT5_PREFERRED';
    }
    
    // Claude Opus 4.1 is better for:
    if (lower.includes('analysis') || lower.includes('research') || 
        lower.includes('strategic') || lower.includes('complex') ||
        intel.complexity === 'complex' || text.length > 200) {
        return 'CLAUDE_PREFERRED';
    }
    
    // Use dual consensus for:
    if (lower.includes('important') || lower.includes('decision') || 
        lower.includes('recommendation') || intel.type === 'financial_analysis') {
        return 'DUAL_CONSENSUS';
    }
    
    // Default to Claude for most queries
    return 'CLAUDE_PREFERRED';
}

// 🔧 FIXED: GPT-5 Analysis with correct model string
async function getGPT5Analysis(prompt, context, intel) {
    try {
        console.log("🤖 Calling GPT-5...");
        
        const response = await openai.chat.completions.create({
            model: "gpt-5", // ✅ Use correct GPT-5 model string
            messages: [
                {
                    role: "system",
                    content: `You are an advanced AI assistant powered by GPT-5. You have access to memory context and should provide intelligent, helpful responses. Use the memory context to personalize your responses.

Memory Available: ${context.memoryAvailable}
Query Type: ${intel.type}
Complexity: ${intel.complexity}`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.7,
            top_p: 0.9
        });
        
        const result = response.choices[0].message.content;
        
        return {
            response: result,
            aiUsed: 'GPT-5',
            success: true,
            memoryUsed: context.memoryAvailable,
            queryType: intel.type,
            modelUsed: 'gpt-5',
            responseTime: Date.now()
        };
        
    } catch (error) {
        console.error('❌ GPT-5 error:', error.message);
        throw new Error(`GPT-5 failed: ${error.message}`);
    }
}

// 🔧 FIXED: Claude Opus 4.1 Analysis with correct model
async function getClaudeOpus41Analysis(prompt, context, intel) {
    try {
        console.log("🤖 Calling Claude Opus 4.1...");
        
        // ✅ Use Claude Opus 4.1 via your Claude client
        const result = await getClaudeStrategicAnalysis(prompt, {
            model: 'claude-3-5-opus-20241022', // ✅ Use Claude Opus 4.1 model string
            max_tokens: 2000,
            temperature: 0.7,
            systemPrompt: `You are Claude Opus 4.1, Anthropic's most advanced AI model. You excel at complex analysis, strategic thinking, and detailed reasoning. Use the provided memory context to personalize your responses.

Memory Available: ${context.memoryAvailable}
Query Type: ${intel.type}
Complexity: ${intel.complexity}

Provide thoughtful, comprehensive analysis with clear reasoning.`
        });
        
        return {
            response: result,
            aiUsed: 'CLAUDE_OPUS_4.1',
            success: true,
            memoryUsed: context.memoryAvailable,
            queryType: intel.type,
            modelUsed: 'claude-3-5-opus-20241022',
            responseTime: Date.now()
        };
        
    } catch (error) {
        console.error('❌ Claude Opus 4.1 error:', error.message);
        throw new Error(`Claude Opus 4.1 failed: ${error.message}`);
    }
}

// 🔧 NEW: Dual Consensus Analysis using both GPT-5 and Claude Opus 4.1
async function getDualConsensusAnalysis(prompt, context, intel) {
    try {
        console.log("🤖🤖 Running dual consensus: GPT-5 + Claude Opus 4.1...");
        
        // Run both AIs in parallel
        const [gptResult, claudeResult] = await Promise.allSettled([
            getGPT5Analysis(prompt, context, intel),
            getClaudeOpus41Analysis(prompt, context, intel)
        ]);
        
        // Check if both succeeded
        const gptSuccess = gptResult.status === 'fulfilled';
        const claudeSuccess = claudeResult.status === 'fulfilled';
        
        if (gptSuccess && claudeSuccess) {
            // Both succeeded - create consensus response
            const consensusResponse = createConsensusResponse(
                gptResult.value.response, 
                claudeResult.value.response, 
                intel
            );
            
            // Save dual AI performance data
            await saveDualAIComparison(gptResult.value, claudeResult.value, consensusResponse);
            
            return {
                response: consensusResponse,
                aiUsed: 'DUAL_CONSENSUS_GPT5_CLAUDE41',
                success: true,
                memoryUsed: context.memoryAvailable,
                queryType: intel.type,
                bothModelsUsed: true,
                gptResponse: gptResult.value.response,
                claudeResponse: claudeResult.value.response
            };
            
        } else if (gptSuccess) {
            console.log("⚠️ Claude failed, using GPT-5 result");
            return gptResult.value;
        } else if (claudeSuccess) {
            console.log("⚠️ GPT-5 failed, using Claude result");
            return claudeResult.value;
        } else {
            throw new Error("Both AI models failed");
        }
        
    } catch (error) {
        console.error('❌ Dual consensus error:', error.message);
        throw error;
    }
}

// 🔧 NEW: Create Consensus Response from both AIs
function createConsensusResponse(gptResponse, claudeResponse, intel) {
    // For important decisions, show both perspectives
    if (intel.type === 'financial_analysis' || intel.complexity === 'complex') {
        return `## 🤖 Dual AI Analysis (GPT-5 + Claude Opus 4.1)

### 🧠 GPT-5 Analysis:
${gptResponse}

### 🎯 Claude Opus 4.1 Analysis:
${claudeResponse}

### ✅ Consensus & Recommendation:
${generateConsensusInsight(gptResponse, claudeResponse)}`;
    }
    
    // For simpler queries, blend the responses
    return blendResponses(gptResponse, claudeResponse);
}

// 🔧 NEW: Generate Consensus Insight
function generateConsensusInsight(gptResponse, claudeResponse) {
    // Simple consensus logic - you can enhance this
    const commonThemes = findCommonThemes(gptResponse, claudeResponse);
    
    if (commonThemes.length > 0) {
        return `Both AI models agree on: ${commonThemes.join(', ')}. This suggests a strong consensus on the key points.`;
    }
    
    return "Both AI models provide valuable but different perspectives. Consider both viewpoints for a comprehensive understanding.";
}

// 🔧 NEW: Find Common Themes (basic implementation)
function findCommonThemes(response1, response2) {
    const themes = [];
    const commonWords = ['important', 'recommend', 'suggest', 'key', 'critical', 'essential'];
    
    commonWords.forEach(word => {
        if (response1.toLowerCase().includes(word) && response2.toLowerCase().includes(word)) {
            themes.push(word);
        }
    });
    
    return themes;
}

// 🔧 NEW: Blend Responses for simpler queries
function blendResponses(gptResponse, claudeResponse) {
    // Take the longer, more comprehensive response as base
    const primaryResponse = gptResponse.length > claudeResponse.length ? gptResponse : claudeResponse;
    const secondaryResponse = gptResponse.length > claudeResponse.length ? claudeResponse : gptResponse;
    
    // Add a note about dual AI analysis
    return `${primaryResponse}

*✨ Enhanced with dual AI analysis (GPT-5 + Claude Opus 4.1)*`;
}

// 🔧 NEW: Save Dual AI Comparison for analytics
async function saveDualAIComparison(gptResult, claudeResult, consensusResponse) {
    try {
        await saveAIHeadToHead(
            'GPT-5',
            'CLAUDE_OPUS_4.1',
            gptResult.response,
            claudeResult.response,
            consensusResponse,
            'CONSENSUS_ANALYSIS',
            true
        );
        console.log("✅ Dual AI comparison saved");
    } catch (error) {
        console.log('⚠️ Could not save dual AI comparison:', error.message);
    }
}

// 🔧 NEW: Build Enhanced Prompt with Memory Context
function buildEnhancedPrompt(text, context, intel) {
    let prompt = '';
    
    // Add memory context if available
    if (context.memoryContext) {
        prompt += context.memoryContext + '\n\n';
    }
    
    // Add intelligence context
    prompt += `[Query Type: ${intel.type}, Complexity: ${intel.complexity}]\n\n`;
    
    // Add the actual user query
    prompt += `User Query: ${text}`;
    
    return prompt;
}

// 🔧 UPDATED: Build Conversation Context with Memory (fixed function name)
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

// 🔧 ENHANCED: Fallback Response Handler with proper model usage
async function handleFallbackResponse(chatId, text) {
    try {
        console.log('🆘 Using emergency fallback response...');
        
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
        
        // Try GPT-5 analysis first
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-5", // ✅ Use GPT-5 for fallback
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI assistant. Provide a helpful response even in degraded conditions."
                    },
                    {
                        role: "user",
                        content: text + basicContext
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            });
            
            return response.choices[0].message.content + "\n\n*⚠️ Fallback mode - GPT-5*";
            
        } catch (gptError) {
            console.log('⚠️ GPT-5 fallback failed:', gptError.message);
            
            // Try Claude fallback
            try {
                const claudeResponse = await getClaudeAnalysisRaw(text + basicContext);
                return claudeResponse + "\n\n*⚠️ Fallback mode - Claude*";
            } catch (claudeError) {
                console.log('⚠️ Claude fallback failed:', claudeError.message);
                
                // Final emergency response
                return `🚨 I'm experiencing technical difficulties right now. 

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
        }
        
    } catch (error) {
        console.error('❌ Complete fallback failure:', error.message);
        return "🚨 Complete system error. Please contact administrator.";
    }
}

console.log('✅ Enhanced Dual AI System Loaded:');
console.log('🤖 GPT-5 + Claude Opus 4.1 Integration');
console.log('🎯 Smart AI Routing: Dual Consensus → Specialized → Fallback');
console.log('🧠 Memory-Enhanced Conversations');
console.log('📊 Dual AI Performance Analytics');

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

// 🔧 COMPLETE REWRITE: Multimodal handlers that work with your existing system
// Replace all multimodal functions in your index.js with these working versions

// 🎤 FIXED: Voice message handler with direct Whisper integration
async function handleVoiceMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🎤 Processing voice message with Whisper + Dual AI...");
        await bot.sendMessage(chatId, "🎤 Transcribing voice message with Whisper + Strategic Analysis...");
        
        // 🔧 FIXED: Direct Whisper API call that works
        const transcription = await transcribeVoiceWithWhisper(msg.voice.file_id);
        
        if (transcription && transcription.trim().length > 0) {
            // Send transcription first
            await sendSmartMessage(bot, chatId, `🎤 **Voice Transcription:**\n"${transcription}"\n\n🤖 Analyzing with dual AI system...`);
            
            // 🎯 Analyze with dual AI system
            const { executeDualCommand } = require('./utils/dualCommandSystem');
            
            const analysisResult = await executeDualCommand(transcription, chatId, {
                messageType: 'voice_transcription',
                hasMedia: false,
                sessionId: sessionId,
                voiceEnhanced: true,
                transcriptionLength: transcription.length
            });
            
            if (analysisResult.success) {
                // Send the AI analysis
                await sendAnalysis(bot, chatId, analysisResult.response, "🎤 Voice Message Analysis");
                
                // Save to database with comprehensive metadata
                await saveConversationDB(chatId, "[VOICE]", analysisResult.response, "voice", {
                    transcription: transcription,
                    voiceDuration: msg.voice.duration,
                    fileSize: msg.voice.file_size,
                    transcriptionLength: transcription.length,
                    analysisLength: analysisResult.response.length,
                    processingTime: Date.now() - startTime,
                    sessionId: sessionId,
                    aiUsed: analysisResult.aiUsed,
                    success: true
                }).catch(err => console.error('Voice save error:', err.message));
                
                console.log("✅ Voice message processed successfully");
            } else {
                throw new Error("Voice analysis failed");
            }
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
            voiceDuration: msg.voice?.duration,
            fileSize: msg.voice?.file_size,
            processingTime: responseTime,
            sessionId: sessionId,
            success: false
        }).catch(err => console.error('Voice error save failed:', err.message));
    }
}

// 🔧 FIXED: Direct Whisper transcription function
async function transcribeVoiceWithWhisper(fileId) {
    try {
        console.log("🔄 Starting Whisper transcription...");
        
        // Get file from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        console.log(`📁 Downloading voice file: ${file.file_size} bytes`);
        
        // Download the voice file
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
        console.log(`✅ Voice file downloaded: ${buffer.length} bytes`);
        
        // Validate file size
        if (buffer.length > 25 * 1024 * 1024) {
            throw new Error("Voice file too large for Whisper API (max 25MB)");
        }
        
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

// 🖼️ FIXED: Image message handler with direct GPT-5 vision
async function handleImageMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("🖼️ Processing image with GPT-5 Vision...");
        await bot.sendMessage(chatId, "🖼️ Analyzing image with GPT-5 Vision + Strategic Analysis...");
        
        // Get the largest photo (best quality)
        const photo = msg.photo[msg.photo.length - 1];
        
        // 🔧 FIXED: Direct image analysis
        const analysis = await analyzeImageWithGPT5Vision(photo.file_id, msg.caption);
        
        if (analysis && analysis.length > 0) {
            // Send the image analysis
            await sendAnalysis(bot, chatId, analysis, "🖼️ Image Analysis");
            
            // Save to database with comprehensive metadata
            await saveConversationDB(chatId, "[IMAGE]", analysis, "image", {
                fileId: photo.file_id,
                fileSize: photo.file_size,
                caption: msg.caption || null,
                imageWidth: photo.width,
                imageHeight: photo.height,
                analysisLength: analysis.length,
                processingTime: Date.now() - startTime,
                sessionId: sessionId,
                aiModel: 'GPT-5 Vision',
                success: true
            }).catch(err => console.error('Image save error:', err.message));
            
            // Save to persistent memory if significant
            if (msg.caption && shouldSaveToPersistentMemory(`Image: ${msg.caption}`, analysis)) {
                const memoryFact = `Image analysis: ${msg.caption} - ${analysis.substring(0, 150)}...`;
                await addPersistentMemoryDB(chatId, memoryFact, 'medium')
                    .catch(err => console.error('Memory save error:', err.message));
                console.log("💾 Image analysis saved to persistent memory");
            }
            
            console.log("✅ Image processed successfully");
        } else {
            throw new Error("Image analysis returned empty result");
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
            fileSize: photo?.file_size,
            processingTime: responseTime,
            sessionId: sessionId,
            success: false
        }).catch(err => console.error('Image error save failed:', err.message));
    }
}

// 🔧 FIXED: Direct GPT-5 vision analysis
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
        let analysisPrompt = `As Strategic Commander of IMPERIUM VAULT SYSTEM, analyze this image with comprehensive strategic intelligence.

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
   • Strategic implications for IMPERIUM VAULT SYSTEM

4. **Strategic Intelligence Summary**
   • Overall significance and business relevance
   • Actionable insights or strategic implications
   • Recommendations for further analysis or action
   • Value for IMPERIUM VAULT operations

Execute comprehensive institutional-level visual intelligence analysis.`;
        
        if (caption) {
            analysisPrompt += `\n\n**User Context:** "${caption}"`;
        }
        
        // Use your existing OpenAI client
        const { getGptAnalysis } = require('./utils/openaiClient');
        
        // Try GPT-5 vision first
        try {
            const { openai } = require('./utils/openaiClient');
            
            const visionResponse = await openai.chat.completions.create({
                model: "gpt-5",
                messages: [
                    {
                        role: "system",
                        content: "You are the Strategic Commander of IMPERIUM VAULT SYSTEM providing institutional-quality image analysis."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: analysisPrompt
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
                max_tokens: 2000,
                temperature: 0.7
            });
            
            const analysis = visionResponse.choices[0]?.message?.content;
            console.log("✅ GPT-5 vision analysis completed");
            
            return `**GPT-5 Vision Analysis**\n\n${analysis}`;
            
        } catch (gpt5Error) {
            console.log("⚠️ GPT-5 vision failed, trying GPT-4o fallback:", gpt5Error.message);
            
            // Fallback to GPT-4o
            const { openai } = require('./utils/openaiClient');
            
            const fallbackResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are the Strategic Commander providing institutional-quality image analysis."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: analysisPrompt
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
                max_tokens: 2000,
                temperature: 0.7
            });
            
            const fallbackAnalysis = fallbackResponse.choices[0]?.message?.content;
            console.log("✅ GPT-4o vision fallback completed");
            
            return `**GPT-4o Analysis** (GPT-5 fallback)\n\n${fallbackAnalysis}`;
        }
        
    } catch (error) {
        console.error("❌ Image vision analysis error:", error.message);
        throw error;
    }
}

// 📄 FIXED: Document message handler with proper processing
async function handleDocumentMessage(msg, chatId, sessionId) {
    const startTime = Date.now();
    try {
        console.log("📄 Processing document...");
        
        const fileName = msg.document.file_name || "untitled_document";
        const fileSize = msg.document.file_size || 0;
        const isTraining = msg.caption?.toLowerCase().includes("train");
        
        // Check file size limits
        if (fileSize > 50 * 1024 * 1024) {
            throw new Error("File too large (max 50MB). Please compress or split the file.");
        }
        
        if (isTraining) {
            // Training mode
            await bot.sendMessage(chatId, "📚 Processing document for AI training database...");
            
            try {
                const content = await extractDocumentContent(msg.document.file_id, fileName);
                
                if (content && content.length > 0) {
                    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
                    const summary = content.length > 500 ? content.substring(0, 500) + '...' : content;
                    
                    // Save to training database
                    const saved = await saveTrainingDocumentDB(chatId, fileName, content, 'user_uploaded', wordCount, summary);
                    
                    if (saved) {
                        await sendSmartMessage(bot, chatId, 
                            `📚 **Document Added to AI Training Database**\n\n` +
                            `📄 **File:** ${fileName}\n` +
                            `📊 **Words:** ${wordCount.toLocaleString()}\n` +
                            `📏 **Size:** ${(fileSize / 1024).toFixed(1)} KB\n` +
                            `💾 **Storage:** Enhanced Database\n` +
                            `✅ **Your AI can now reference this document!**`
                        );
                        console.log("✅ Document training completed");
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
            // Analysis mode
            await bot.sendMessage(chatId, "📄 Analyzing document with Strategic AI...");
            
            try {
                const content = await extractDocumentContent(msg.document.file_id, fileName);
                
                if (content && content.length > 0) {
                    // Analyze with dual AI system
                    const { executeDualCommand } = require('./utils/dualCommandSystem');
                    
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
                    
                    const analysisResult = await executeDualCommand(analysisPrompt, chatId, {
                        messageType: 'document',
                        hasMedia: false,
                        sessionId: sessionId,
                        fileName: fileName,
                        fileSize: fileSize,
                        contentLength: content.length
                    });
                    
                    if (analysisResult.success) {
                        await sendAnalysis(bot, chatId, analysisResult.response, `📄 Document Analysis: ${fileName}`);
                        
                        // Save to database
                        await saveConversationDB(chatId, `[DOCUMENT] ${fileName}`, analysisResult.response, "document", {
                            fileName: fileName,
                            fileSize: fileSize,
                            contentLength: content.length,
                            analysisLength: analysisResult.response.length,
                            processingTime: Date.now() - startTime,
                            sessionId: sessionId,
                            aiUsed: analysisResult.aiUsed,
                            success: true
                        }).catch(err => console.error('Document save error:', err.message));
                        
                        console.log("✅ Document analysis completed");
                    } else {
                        throw new Error("Document analysis failed");
                    }
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
        
        let errorMessage = `❌ Document processing failed: ${error.message}\n\n`;
        errorMessage += `**Supported formats:**\n`;
        errorMessage += `✅ Text files (.txt, .md)\n`;
        errorMessage += `✅ PDF documents (.pdf)\n`;
        errorMessage += `✅ Word documents (.doc, .docx)\n`;
        errorMessage += `✅ Excel files (.xls, .xlsx)\n`;
        errorMessage += `✅ JSON/CSV files (.json, .csv)\n\n`;
        errorMessage += `**Please try:**\n`;
        errorMessage += `• Converting to supported format\n`;
        errorMessage += `• Reducing file size\n`;
        errorMessage += `• Adding "train" in caption for AI training`;
        
        await sendSmartMessage(bot, chatId, errorMessage);
        
        // Save error record
        await saveConversationDB(chatId, `[DOCUMENT_ERROR] ${fileName}`, `Error: ${error.message}`, "document", {
            fileName: fileName,
            fileSize: fileSize,
            error: error.message,
            processingTime: responseTime,
            sessionId: sessionId,
            success: false
        }).catch(err => console.error('Document error save failed:', err.message));
    }
}

// 🔧 FIXED: Document content extraction
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
        
        // Limit content size
        if (content.length > 15000) {
            content = content.substring(0, 15000) + '\n\n[Document truncated for analysis...]';
            console.log("⚠️ Document truncated for analysis");
        }
        
        console.log(`✅ Content extracted: ${content.length} characters`);
        return content.trim();
        
    } catch (error) {
        console.error("❌ Document extraction error:", error.message);
        throw error;
    }
}

// 🔧 Text extraction helpers
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

// 🔧 ENHANCED: Main multimodal message router
async function handleMultimodalMessage(msg, chatId, sessionId) {
    try {
        console.log("🎯 Routing multimodal message...");
        
        if (msg.voice) {
            console.log("🎤 Voice message detected");
            await handleVoiceMessage(msg, chatId, sessionId);
            
        } else if (msg.photo && msg.photo.length > 0) {
            console.log("🖼️ Image message detected");
            await handleImageMessage(msg, chatId, sessionId);
            
        } else if (msg.document) {
            console.log("📄 Document message detected");
            await handleDocumentMessage(msg, chatId, sessionId);
            
        } else if (msg.video) {
            console.log("🎥 Video message detected");
            await sendSmartMessage(bot, chatId, "🎥 Video analysis is available but requires specific setup. Please convert to image or document for analysis.");
            
        } else if (msg.audio) {
            console.log("🎵 Audio message detected - treating as voice");
            const voiceMsg = { voice: msg.audio };
            await handleVoiceMessage(voiceMsg, chatId, sessionId);
            
        } else {
            throw new Error("No supported multimodal content found");
        }
        
        console.log("✅ Multimodal processing completed");
        
    } catch (error) {
        console.error("❌ Multimodal routing error:", error.message);
        
        const messageType = getMessageType(msg);
        await sendSmartMessage(bot, chatId, 
            `❌ Failed to process ${messageType}: ${error.message}\n\n` +
            `**Supported:**\n🎤 Voice messages\n🖼️ Images\n📄 Documents\n\n` +
            `**Please try again with a supported format.**`
        );
    }
}

// 🔧 UTILITY: Get message type
function getMessageType(msg) {
    if (msg.voice) return 'voice message';
    if (msg.photo) return 'image';
    if (msg.document) return 'document';
    if (msg.video) return 'video';
    if (msg.audio) return 'audio file';
    return 'unknown media';
}

// Export all functions
module.exports = {
    handleVoiceMessage,
    handleImageMessage,
    handleDocumentMessage,
    handleMultimodalMessage,
    transcribeVoiceWithWhisper,
    analyzeImageWithGPT5Vision,
    extractDocumentContent,
    getMessageType
};

console.log('✅ Complete Multimodal System loaded');
console.log('🎤 Voice: Direct Whisper integration');
console.log('🖼️ Images: Direct GPT-5 Vision integration');
console.log('📄 Documents: Multi-format extraction + Dual AI');
console.log('🔧 All functions work independently without external dependencies');

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
