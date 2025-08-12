// utils/memory.js - ENHANCED STRATEGIC COMMAND MEMORY SYSTEM - PART 1
// IMPERIUM VAULT STRATEGIC COMMAND SYSTEM - Institutional-grade memory with AI-powered insights

const { 
    saveConversationDB, 
    getConversationHistoryDB, 
    addPersistentMemoryDB, 
    getPersistentMemoryDB, 
    getUserProfileDB,
    saveDualAIConversation,
    saveEnhancedDualConversation,
    logCommandUsage,
    saveEnhancedFunctionPerformance,
    getDualAIPerformanceDashboard,
    getConversationIntelligenceAnalytics,
    getMasterEnhancedDualSystemAnalytics,
    saveRegimeData,
    savePortfolioAllocation,
    saveRiskAssessment,
    saveDailyObservation,
    saveMarketSignal,
    savePositionSizing,
    saveTradingPattern,
    connectionStats
} = require('./database');

// Enhanced in-memory storage with strategic categorization
let conversations = new Map(); // chatId -> array of conversations
let userProfiles = new Map(); // chatId -> user profile data
let persistentMemories = new Map(); // chatId -> persistent memory facts
let strategicInsights = new Map(); // chatId -> strategic AI insights cache
let tradingPatterns = new Map(); // chatId -> trading behavior patterns
let conversationIntelligence = new Map(); // chatId -> conversation analytics
let enhancedMemoryCache = new Map(); // chatId -> enhanced memory cache
let memoryPerformanceMetrics = new Map(); // chatId -> performance data

// 🏛️ STRATEGIC MEMORY CATEGORIES WITH ENHANCED CLASSIFICATION
const MEMORY_CATEGORIES = {
    PERSONAL: 'personal',                    // Personal facts about user
    FINANCIAL: 'financial',                  // Financial preferences and goals
    TRADING: 'trading',                     // Trading patterns and preferences
    CAMBODIA_FUND: 'cambodia_fund',         // Fund-specific knowledge
    STRATEGIC: 'strategic',                 // Strategic insights and patterns
    REGIME: 'regime',                       // Economic regime preferences
    RISK: 'risk',                          // Risk tolerance and management
    PORTFOLIO: 'portfolio',                 // Portfolio management insights
    MARKET_INTELLIGENCE: 'market_intel',    // Market data and analysis
    BEHAVIORAL: 'behavioral',               // User behavior patterns
    INSTITUTIONAL: 'institutional',         // Institutional-level insights
    COMPLIANCE: 'compliance',               // Compliance and regulatory notes
    RELATIONSHIPS: 'relationships',         // Business relationships
    PERFORMANCE: 'performance',             // Performance tracking
    GOALS: 'goals'                          // Strategic goals and objectives
};

// 🎯 ENHANCED STRATEGIC IMPORTANCE LEVELS
const IMPORTANCE_LEVELS = {
    CRITICAL: 'critical',        // Core identity, never forget - top priority
    STRATEGIC: 'strategic',      // Strategic decisions and major insights
    HIGH: 'high',               // Important preferences and patterns
    MEDIUM: 'medium',           // General facts and useful information
    LOW: 'low',                 // Temporary information and casual mentions
    CONTEXTUAL: 'contextual'    // Context-dependent information
};

// 🧠 ENHANCED MEMORY INTELLIGENCE PATTERNS
const MEMORY_INTELLIGENCE_PATTERNS = {
    financial_decision: {
        keywords: ['invest', 'portfolio', 'allocation', 'risk', 'return', 'diversification'],
        importance: IMPORTANCE_LEVELS.STRATEGIC,
        category: MEMORY_CATEGORIES.FINANCIAL,
        retention_days: 365,
        strategic_weight: 0.9
    },
    trading_behavior: {
        keywords: ['trade', 'position', 'stop loss', 'take profit', 'entry', 'exit'],
        importance: IMPORTANCE_LEVELS.HIGH,
        category: MEMORY_CATEGORIES.TRADING,
        retention_days: 180,
        strategic_weight: 0.8
    },
    cambodia_intelligence: {
        keywords: ['cambodia', 'phnom penh', 'lending', 'real estate', 'development'],
        importance: IMPORTANCE_LEVELS.CRITICAL,
        category: MEMORY_CATEGORIES.CAMBODIA_FUND,
        retention_days: 730,
        strategic_weight: 1.0
    },
    risk_management: {
        keywords: ['risk', 'hedge', 'correlation', 'volatility', 'var', 'stress test'],
        importance: IMPORTANCE_LEVELS.CRITICAL,
        category: MEMORY_CATEGORIES.RISK,
        retention_days: 365,
        strategic_weight: 0.95
    },
    regime_analysis: {
        keywords: ['regime', 'economic', 'growth', 'inflation', 'policy', 'cycle'],
        importance: IMPORTANCE_LEVELS.STRATEGIC,
        category: MEMORY_CATEGORIES.REGIME,
        retention_days: 180,
        strategic_weight: 0.85
    },
    personal_identity: {
        keywords: ['my name', 'i am', 'i work', 'i live', 'i prefer'],
        importance: IMPORTANCE_LEVELS.CRITICAL,
        category: MEMORY_CATEGORIES.PERSONAL,
        retention_days: 9999,
        strategic_weight: 1.0
    },
    behavioral_pattern: {
        keywords: ['always', 'never', 'usually', 'typically', 'prefer', 'avoid'],
        importance: IMPORTANCE_LEVELS.HIGH,
        category: MEMORY_CATEGORIES.BEHAVIORAL,
        retention_days: 270,
        strategic_weight: 0.7
    },
    strategic_goal: {
        keywords: ['goal', 'target', 'objective', 'plan', 'strategy', 'vision'],
        importance: IMPORTANCE_LEVELS.STRATEGIC,
        category: MEMORY_CATEGORIES.GOALS,
        retention_days: 365,
        strategic_weight: 0.9
    }
};

// 🎯 ENHANCED CONVERSATION INTELLIGENCE TYPES
const CONVERSATION_INTELLIGENCE_TYPES = {
    STRATEGIC_ANALYSIS: 'strategic_analysis',
    MARKET_INTELLIGENCE: 'market_intelligence',
    PORTFOLIO_DISCUSSION: 'portfolio_discussion',
    RISK_ASSESSMENT: 'risk_assessment',
    CAMBODIA_FUND_ANALYSIS: 'cambodia_fund_analysis',
    TRADING_STRATEGY: 'trading_strategy',
    REGIME_ANALYSIS: 'regime_analysis',
    PERSONAL_CONSULTATION: 'personal_consultation',
    COMPLIANCE_REVIEW: 'compliance_review',
    PERFORMANCE_REVIEW: 'performance_review',
    GOAL_SETTING: 'goal_setting',
    BEHAVIORAL_COACHING: 'behavioral_coaching',
    GENERAL_INQUIRY: 'general_inquiry'
};

// 🔧 ENHANCED MEMORY CONFIGURATION
const ENHANCED_MEMORY_CONFIG = {
    MAX_CONVERSATIONS_PER_USER: 1000,
    MAX_PERSISTENT_MEMORIES_PER_USER: 200,
    MAX_STRATEGIC_INSIGHTS_PER_USER: 50,
    MAX_TRADING_PATTERNS_PER_USER: 30,
    MEMORY_OPTIMIZATION_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    CONVERSATION_INTELLIGENCE_WINDOW: 30, // days
    STRATEGIC_MEMORY_RETENTION_DAYS: 365,
    PERFORMANCE_TRACKING_WINDOW: 90, // days
    MEMORY_HEALTH_CHECK_INTERVAL: 60 * 60 * 1000, // 1 hour
    ENHANCED_CONTEXT_TOKEN_LIMIT: 8000,
    STRATEGIC_MEMORY_PRIORITY_THRESHOLD: 0.7,
    MEMORY_CONSOLIDATION_THRESHOLD: 0.8
};

// ENHANCED MEMORY.JS - PART 2: CORE MEMORY FUNCTIONS

/**
 * 💾 ENHANCED STRATEGIC CONVERSATION STORAGE WITH INTELLIGENCE
 */
async function saveConversation(chatId, userMessage, gptResponse, messageType = 'text', contextData = null) {
    try {
        const chatKey = String(chatId);
        const startTime = Date.now();
        
        console.log(`💾 Enhanced conversation save for ${chatId} (${messageType})`);
        
        // Enhanced conversation intelligence analysis
        const conversationIntel = analyzeConversationIntelligence(userMessage, gptResponse, messageType);
        
        // Try database first with enhanced metadata
        const enhancedMetadata = {
            ...contextData,
            conversationIntel: conversationIntel,
            messageType: messageType,
            timestamp: new Date().toISOString(),
            strategicImportance: conversationIntel.strategicImportance,
            memoryExtractionStatus: 'pending',
            aiResponseQuality: assessResponseQuality(gptResponse),
            conversationFlow: analyzeConversationFlow(userMessage, gptResponse),
            processingTime: 0
        };
        
        const dbSaved = await saveConversationDB(chatId, userMessage, gptResponse, messageType, enhancedMetadata);
        
        if (dbSaved) {
            console.log(`✅ Enhanced conversation saved to database for ${chatId}`);
            
            // Enhanced dual AI conversation tracking
            await saveEnhancedDualConversation(chatId, userMessage, gptResponse, conversationIntel, enhancedMetadata).catch(console.error);
            
            // Extract strategic insights in background
            setImmediate(() => {
                extractStrategicInsights(chatId, userMessage, gptResponse, conversationIntel);
            });
            
            // Update conversation intelligence cache
            updateConversationIntelligenceCache(chatId, conversationIntel);
            
            // Track performance metrics
            const processingTime = Date.now() - startTime;
            updateMemoryPerformanceMetrics(chatId, 'conversation_save', processingTime, true);
            
            return true;
        }
        
        // Enhanced fallback to in-memory with strategic analysis
        const conversationEntry = {
            userMessage,
            gptResponse,
            messageType,
            timestamp: new Date().toISOString(),
            contextData: enhancedMetadata,
            conversationIntel: conversationIntel,
            strategicImportance: conversationIntel.strategicImportance,
            extractedFacts: extractFactsFromConversation(userMessage, gptResponse),
            memoryId: generateMemoryId(chatId, userMessage),
            strategicWeight: calculateStrategicWeight(conversationIntel),
            processingTime: Date.now() - startTime
        };
        
        // Store in enhanced in-memory system
        if (!conversations.has(chatKey)) {
            conversations.set(chatKey, []);
        }
        
        const userConversations = conversations.get(chatKey);
        userConversations.push(conversationEntry);
        
        // Enhanced memory management with strategic prioritization
        if (userConversations.length > ENHANCED_MEMORY_CONFIG.MAX_CONVERSATIONS_PER_USER) {
            const optimizedConversations = optimizeConversationMemory(userConversations);
            conversations.set(chatKey, optimizedConversations);
        }
        
        // Update enhanced user profile
        await updateEnhancedUserProfile(chatId, userMessage, gptResponse, conversationIntel);
        
        // Track performance
        const processingTime = Date.now() - startTime;
        updateMemoryPerformanceMetrics(chatId, 'conversation_save_fallback', processingTime, true);
        
        console.log(`💾 Enhanced conversation saved to memory for ${chatId} (${processingTime}ms)`);
        return true;
        
    } catch (error) {
        console.error('Enhanced conversation save error:', error.message);
        updateMemoryPerformanceMetrics(chatId, 'conversation_save', Date.now() - (Date.now() - 1000), false, error.message);
        return false;
    }
}

/**
 * 🧠 ENHANCED STRATEGIC CONTEXT BUILDER WITH INTELLIGENCE
 */
async function buildConversationContext(chatId) {
    try {
        const startTime = Date.now();
        console.log(`🧠 Building enhanced strategic context for user ${chatId}`);
        
        // Enhanced parallel data retrieval
        const [
            recentHistory, 
            persistentMemory, 
            userProfile, 
            strategicProfile,
            conversationIntel,
            tradingPatterns,
            marketIntelligence
        ] = await Promise.allSettled([
            getConversationHistoryDB(chatId, 10).catch(() => []),
            getPersistentMemoryDB(chatId).catch(() => []),
            getUserProfileDB(chatId).catch(() => null),
            getEnhancedStrategicUserProfile(chatId).catch(() => null),
            getConversationIntelligenceAnalytics(chatId, 7).catch(() => null),
            getStoredTradingPatterns(chatId),
            getStoredMarketIntelligence(chatId)
        ]);
        
        // Check if database connection successful
        const hasDbData = recentHistory.status === 'fulfilled' && recentHistory.value.length > 0;
        
        if (hasDbData) {
            const context = buildEnhancedDatabaseContext(
                chatId, 
                recentHistory.value, 
                persistentMemory.status === 'fulfilled' ? persistentMemory.value : [],
                userProfile.status === 'fulfilled' ? userProfile.value : null,
                strategicProfile.status === 'fulfilled' ? strategicProfile.value : null,
                conversationIntel.status === 'fulfilled' ? conversationIntel.value : null,
                tradingPatterns.status === 'fulfilled' ? tradingPatterns.value : [],
                marketIntelligence.status === 'fulfilled' ? marketIntelligence.value : []
            );
            
            const processingTime = Date.now() - startTime;
            updateMemoryPerformanceMetrics(chatId, 'context_build_db', processingTime, true);
            
            return context;
        }
        
        // Enhanced fallback to in-memory with strategic intelligence
        const fallbackContext = await buildEnhancedMemoryContext(chatId);
        
        const processingTime = Date.now() - startTime;
        updateMemoryPerformanceMetrics(chatId, 'context_build_memory', processingTime, true);
        
        return fallbackContext;
        
    } catch (error) {
        console.error('Enhanced context building error:', error.message);
        const processingTime = Date.now() - (Date.now() - 1000);
        updateMemoryPerformanceMetrics(chatId, 'context_build', processingTime, false, error.message);
        
        // Emergency fallback context
        return await buildEmergencyFallbackContext(chatId);
    }
}

/**
 * 🏛️ BUILD ENHANCED DATABASE STRATEGIC CONTEXT
 */
function buildEnhancedDatabaseContext(chatId, recentHistory, persistentMemory, userProfile, strategicProfile, conversationIntel, tradingPatterns, marketIntelligence) {
    let context = '';
    
    // Enhanced Strategic System Identity with Intelligence
    context += `\n\n🎯 ENHANCED STRATEGIC MEMORY SYSTEM ACTIVE:\n`;
    context += `This user has comprehensive strategic memory tracking across ${recentHistory.length + persistentMemory.length} data points.\n`;
    context += `Enhanced intelligence: ${conversationIntel ? 'ACTIVE' : 'INITIALIZING'}\n`;
    
    // Enhanced User Strategic Profile with Intelligence Analytics
    if (userProfile && userProfile.conversation_count > 1) {
        context += `\n⚡ ENHANCED STRATEGIC USER PROFILE:\n`;
        context += `• Total Strategic Conversations: ${userProfile.conversation_count}\n`;
        context += `• Strategic Relationship Duration: ${calculateRelationshipDuration(userProfile.first_seen)}\n`;
        context += `• Last Strategic Session: ${new Date(userProfile.last_seen).toLocaleDateString()}\n`;
        context += `• Memory Intelligence Level: ${assessMemoryIntelligenceLevel(persistentMemory.length, userProfile.conversation_count)}\n`;
        
        if (userProfile.preferences && Object.keys(userProfile.preferences).length > 0) {
            const prefs = typeof userProfile.preferences === 'string' ? 
                JSON.parse(userProfile.preferences) : userProfile.preferences;
            context += `• Strategic Preferences: ${JSON.stringify(prefs)}\n`;
        }
    }
    
    // Enhanced Strategic Intelligence Profile
    if (strategicProfile) {
        context += `\n🏛️ ENHANCED STRATEGIC COMMAND PROFILE:\n`;
        context += `• Risk Tolerance: ${strategicProfile.riskTolerance || 'MODERATE'}\n`;
        context += `• Trading Style: ${strategicProfile.tradingStyle || 'INSTITUTIONAL'}\n`;
        context += `• Cambodia Fund Interest: ${strategicProfile.cambodiaFundInterest || 'HIGH'}\n`;
        context += `• Preferred Analysis Depth: ${strategicProfile.analysisDepth || 'COMPREHENSIVE'}\n`;
        context += `• Decision Making Style: ${strategicProfile.decisionStyle || 'DATA_DRIVEN'}\n`;
        context += `• Communication Preference: ${strategicProfile.communicationStyle || 'STRATEGIC_COMMAND'}\n`;
    }
    
    // Enhanced Conversation Intelligence Analytics
    if (conversationIntel && conversationIntel.summary) {
        context += `\n🧠 CONVERSATION INTELLIGENCE (7 days):\n`;
        context += `• Total Conversations: ${conversationIntel.summary.totalConversations}\n`;
        context += `• Average Strategic Complexity: ${conversationIntel.summary.avgComplexity || 'MODERATE'}\n`;
        context += `• Dominant Topics: ${conversationIntel.summary.dominantTopics?.join(', ') || 'General Strategy'}\n`;
        context += `• Preferred Response Style: ${conversationIntel.summary.preferredResponseStyle || 'COMPREHENSIVE'}\n`;
        context += `• Strategic Engagement Level: ${conversationIntel.summary.engagementLevel || 'HIGH'}\n`;
    }
    
    // Enhanced Categorized Persistent Memory with Intelligence
    if (persistentMemory.length > 0) {
        const categorizedMemories = categorizePersistentMemories(persistentMemory);
        
        context += `\n🧠 ENHANCED STRATEGIC PERSISTENT MEMORY (${persistentMemory.length} Critical Facts):\n`;
        
        Object.entries(categorizedMemories).forEach(([category, memories]) => {
            if (memories.length > 0) {
                context += `\n📋 ${category.toUpperCase()} STRATEGIC INTELLIGENCE:\n`;
                memories.slice(0, 5).forEach(memory => {
                    const fact = memory.fact || memory;
                    const timestamp = memory.timestamp || new Date().toISOString();
                    const importance = memory.importance || 'medium';
                    const strategicWeight = memory.strategicWeight || 0.5;
                    
                    const importanceEmoji = getImportanceEmoji(importance);
                    const weightIndicator = strategicWeight > 0.8 ? '🔥' : strategicWeight > 0.6 ? '⭐' : '💡';
                    
                    context += `• ${importanceEmoji}${weightIndicator} ${fact} (${new Date(timestamp).toLocaleDateString()})\n`;
                });
            }
        });
    }
    
    // Enhanced Strategic Trading Patterns with Intelligence
    if (tradingPatterns.length > 0) {
        context += `\n💹 ENHANCED STRATEGIC TRADING PATTERNS:\n`;
        tradingPatterns.slice(0, 4).forEach(pattern => {
            const confidenceLevel = pattern.confidence > 80 ? 'HIGH' : pattern.confidence > 60 ? 'MEDIUM' : 'LOW';
            context += `• ${pattern.description} (Confidence: ${pattern.confidence}% - ${confidenceLevel})\n`;
        });
    }
    
    // Enhanced Market Intelligence Cache
    if (marketIntelligence.length > 0) {
        context += `\n📈 STRATEGIC MARKET INTELLIGENCE CACHE:\n`;
        marketIntelligence.slice(0, 3).forEach(intel => {
            context += `• ${intel.insight} (${intel.source || 'Analysis'} - ${intel.relevance || 'HIGH'})\n`;
        });
    }
    
    // Enhanced Recent Strategic Conversations with Intelligence Analysis
    if (recentHistory.length > 0) {
        context += `\n📝 RECENT STRATEGIC CONVERSATIONS (Last ${recentHistory.length} interactions):\n`;
        recentHistory.forEach((conv, index) => {
            const userMsg = conv.user_message || '';
            const gptMsg = conv.gpt_response || '';
            const timestamp = new Date(conv.timestamp || Date.now()).toLocaleDateString();
            const messageType = conv.message_type || 'text';
            const strategicImportance = conv.metadata?.strategicImportance || 'medium';
            
            const typeEmoji = getMessageTypeEmoji(messageType);
            const importanceEmoji = getImportanceEmoji(strategicImportance);
            
            context += `\n${index + 1}. ${typeEmoji}${importanceEmoji} [${timestamp}] User: "${truncateText(userMsg, 120)}"\n`;
            context += `   Strategic Response: "${truncateText(gptMsg, 120)}"\n`;
        });
    }
    
    // Enhanced Strategic Memory Instructions with Intelligence Protocol
    context += `\n🎯 ENHANCED STRATEGIC MEMORY PROTOCOL:\n`;
    context += `• Reference persistent memory facts when relevant to maintain strategic continuity\n`;
    context += `• Build upon previous strategic conversations and extracted intelligence\n`;
    context += `• Adapt communication style based on demonstrated user preferences and patterns\n`;
    context += `• Maintain institutional-grade strategic relationship across all sessions\n`;
    context += `• Extract and save new strategic facts from each interaction automatically\n`;
    context += `• Apply conversation intelligence to optimize response quality and relevance\n`;
    context += `• Use trading patterns and market intelligence to enhance financial analysis\n`;
    context += `• Execute strategic memory consolidation for improved long-term retention\n`;
    
    const contextLength = context.length;
    console.log(`✅ Enhanced strategic database context built: ${contextLength} characters`);
    console.log(`📊 Memory components: ${persistentMemory.length} persistent + ${recentHistory.length} recent + ${tradingPatterns.length} patterns`);
    
    return context;
}

// ENHANCED MEMORY.JS - PART 3: STRATEGIC INTELLIGENCE FUNCTIONS

/**
 * 🧠 ENHANCED FALLBACK MEMORY CONTEXT WITH INTELLIGENCE
 */
async function buildEnhancedMemoryContext(chatId) {
    try {
        const chatKey = String(chatId);
        const recentHistory = await getConversationHistory(chatId, 8);
        const persistentMemory = await getPersistentMemory(chatId);
        const userProfile = await getEnhancedUserProfile(chatId);
        const conversationIntel = getConversationIntelligenceCache(chatId);
        const tradingPatterns = getStoredTradingPatterns(chatId);
        
        console.log(`🧠 Building enhanced fallback memory for user ${chatId}`);
        console.log(`📊 Components: ${recentHistory.length} recent + ${persistentMemory.length} persistent + ${tradingPatterns.length} patterns`);
        
        let context = '';
        
        // Enhanced Strategic System Status
        context += `\n\n🎯 ENHANCED STRATEGIC USER CONTEXT:\n`;
        
        // Enhanced User Profile Context with Intelligence
        if (userProfile && userProfile.conversationCount > 1) {
            context += `Strategic relationship established with ${userProfile.conversationCount} conversations across multiple sessions.\n`;
            context += `Enhanced strategic memory active. Build upon previous interactions with institutional authority.\n`;
            context += `Memory intelligence level: ${assessMemoryIntelligenceLevel(persistentMemory.length, userProfile.conversationCount)}\n`;
            
            if (userProfile.preferences && Object.keys(userProfile.preferences).length > 0) {
                context += `Strategic preferences: ${JSON.stringify(userProfile.preferences)}\n`;
            }
            
            if (userProfile.strategicProfile) {
                context += `Strategic profile: ${JSON.stringify(userProfile.strategicProfile)}\n`;
            }
        }
        
        // Enhanced Conversation Intelligence Context
        if (conversationIntel) {
            context += `\n🧠 CONVERSATION INTELLIGENCE ACTIVE:\n`;
            context += `Recent conversation patterns: ${conversationIntel.dominantTypes?.join(', ') || 'Strategic Analysis'}\n`;
            context += `Preferred complexity level: ${conversationIntel.preferredComplexity || 'COMPREHENSIVE'}\n`;
            context += `Strategic engagement style: ${conversationIntel.engagementStyle || 'ANALYTICAL'}\n`;
        }
        
        // Enhanced Persistent Memory with Strategic Categorization
        if (persistentMemory.length > 0) {
            const categorizedMemories = categorizePersistentMemories(persistentMemory);
            
            context += '\n🧠 ENHANCED STRATEGIC PERSISTENT MEMORY (Critical Facts - Always Remember):\n';
            
            Object.entries(categorizedMemories).forEach(([category, memories]) => {
                if (memories.length > 0) {
                    context += `\n📋 ${category.toUpperCase()} STRATEGIC INTELLIGENCE:\n`;
                    memories.slice(0, 4).forEach((memory, index) => {
                        const fact = memory.fact || memory;
                        const timestamp = memory.timestamp || new Date().toISOString();
                        const importance = memory.importance || 'medium';
                        const strategicWeight = memory.strategicWeight || 0.5;
                        
                        const importanceEmoji = getImportanceEmoji(importance);
                        const weightIndicator = strategicWeight > 0.8 ? '🔥' : strategicWeight > 0.6 ? '⭐' : '💡';
                        
                        context += `• ${importanceEmoji}${weightIndicator} ${fact} (${new Date(timestamp).toLocaleDateString()})\n`;
                    });
                }
            });
        }
        
        // Enhanced Strategic Trading Patterns
        if (tradingPatterns.length > 0) {
            context += '\n💹 ENHANCED STRATEGIC TRADING PATTERNS:\n';
            tradingPatterns.slice(0, 3).forEach(pattern => {
                const confidenceLevel = pattern.confidence > 80 ? 'HIGH' : pattern.confidence > 60 ? 'MEDIUM' : 'LOW';
                context += `• ${pattern.description} (Confidence: ${pattern.confidence}% - ${confidenceLevel})\n`;
                if (pattern.triggers) {
                    context += `  Triggers: ${pattern.triggers.join(', ')}\n`;
                }
            });
        }
        
        // Enhanced Recent Session Memory with Intelligence
        if (recentHistory.length > 0) {
            context += '\n📝 RECENT STRATEGIC CONVERSATIONS:\n';
            recentHistory.forEach((conv, index) => {
                const userMsg = conv.userMessage || '';
                const gptMsg = conv.gptResponse || '';
                const timestamp = conv.timestamp || new Date().toISOString();
                const strategicImportance = conv.strategicImportance || 'medium';
                const conversationType = conv.conversationIntel?.type || 'general';
                
                const importanceEmoji = getImportanceEmoji(strategicImportance);
                const typeEmoji = getConversationTypeEmoji(conversationType);
                
                context += `${index + 1}. ${typeEmoji}${importanceEmoji} User: "${truncateText(userMsg, 100)}"\n`;
                context += `   Strategic Response: "${truncateText(gptMsg, 100)}"\n`;
                context += `   Type: ${conversationType} | Time: ${new Date(timestamp).toLocaleDateString()}\n`;
            });
        }
        
        // Enhanced Strategic Memory Instructions with Intelligence Protocol
        context += '\n🎯 ENHANCED STRATEGIC MEMORY INSTRUCTIONS:\n';
        context += 'Use persistent memory and conversation history to maintain strategic continuity.\n';
        context += 'Execute strategic commands with institutional authority based on established relationship.\n';
        context += 'Extract and save new strategic facts for future reference automatically.\n';
        context += 'Apply conversation intelligence to optimize response quality and relevance.\n';
        context += 'Use trading patterns to enhance financial and investment analysis.\n';
        context += 'Maintain strategic memory consolidation for improved long-term learning.\n';
        
        const contextLength = context.length;
        console.log(`✅ Enhanced fallback context built: ${contextLength} characters`);
        
        return context;
        
    } catch (error) {
        console.error('Build enhanced memory context error:', error.message);
        return await buildEmergencyFallbackContext(chatId);
    }
}

/**
 * 🚨 EMERGENCY FALLBACK CONTEXT BUILDER
 */
async function buildEmergencyFallbackContext(chatId) {
    try {
        console.log(`🚨 Building emergency fallback context for ${chatId}`);
        
        let context = `\n\n⚠️ EMERGENCY STRATEGIC MEMORY MODE:\n`;
        context += `Enhanced memory system temporarily limited. Basic strategic context active.\n`;
        context += `User ID: ${chatId} | Session: ${new Date().toISOString()}\n`;
        context += `Strategic Authority: MAINTAINED | Memory Recovery: IN PROGRESS\n\n`;
        context += `🎯 EMERGENCY STRATEGIC PROTOCOL:\n`;
        context += `• Maintain institutional-grade strategic analysis\n`;
        context += `• Build new strategic memory foundation from this interaction\n`;
        context += `• Extract and save critical strategic facts automatically\n`;
        context += `• Prepare for full strategic memory restoration\n`;
        
        return context;
    } catch (error) {
        console.error('Emergency fallback context error:', error.message);
        return `\n\n🚨 MINIMAL STRATEGIC MODE ACTIVE for user ${chatId}\n`;
    }
}

// ENHANCED MEMORY.JS - PART 4: ADVANCED INTELLIGENCE ANALYSIS

/**
 * 🔍 ENHANCED STRATEGIC FACT EXTRACTION & INTELLIGENCE
 */
async function extractAndSaveFacts(chatId, userMessage, gptResponse) {
    try {
        const startTime = Date.now();
        console.log(`🔍 Enhanced fact extraction for ${chatId}`);
        
        // Enhanced fact extraction with strategic categorization
        const extractedFacts = await extractEnhancedStrategicFacts(userMessage, gptResponse);
        
        // Enhanced trading patterns extraction
        const tradingPatterns = extractEnhancedTradingPatterns(userMessage, gptResponse);
        
        // Enhanced strategic insights extraction
        const strategicInsights = extractStrategicInsights(userMessage, gptResponse);
        
        // Enhanced behavioral patterns extraction
        const behavioralPatterns = extractBehavioralPatterns(userMessage, gptResponse);
        
        // Save all extracted intelligence
        const savePromises = [];
        
        // Save enhanced facts with strategic intelligence
        for (const fact of extractedFacts) {
            savePromises.push(
                addPersistentMemory(
                    chatId, 
                    fact.text, 
                    fact.importance, 
                    fact.category,
                    fact.strategicWeight,
                    fact.metadata
                )
            );
        }
        
        // Save enhanced trading patterns
        if (tradingPatterns.length > 0) {
            savePromises.push(saveEnhancedTradingPatterns(chatId, tradingPatterns));
        }
        
        // Save strategic insights
        if (strategicInsights.length > 0) {
            savePromises.push(saveStrategicInsights(chatId, strategicInsights));
        }
        
        // Save behavioral patterns
        if (behavioralPatterns.length > 0) {
            savePromises.push(saveBehavioralPatterns(chatId, behavioralPatterns));
        }
        
        // Execute all saves in parallel
        const results = await Promise.allSettled(savePromises);
        const successfulSaves = results.filter(r => r.status === 'fulfilled').length;
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ Enhanced fact extraction complete: ${successfulSaves}/${results.length} saves successful (${processingTime}ms)`);
        
        // Update performance metrics
        updateMemoryPerformanceMetrics(chatId, 'fact_extraction', processingTime, successfulSaves > 0);
        
        return {
            extractedFacts: extractedFacts.length,
            tradingPatterns: tradingPatterns.length,
            strategicInsights: strategicInsights.length,
            behavioralPatterns: behavioralPatterns.length,
            successfulSaves,
            processingTime
        };
        
    } catch (error) {
        console.error('Enhanced fact extraction error:', error.message);
        updateMemoryPerformanceMetrics(chatId, 'fact_extraction', 1000, false, error.message);
        return {
            extractedFacts: 0,
            tradingPatterns: 0,
            strategicInsights: 0,
            behavioralPatterns: 0,
            successfulSaves: 0,
            error: error.message
        };
    }
}

/**
 * 🧠 ENHANCED STRATEGIC FACT EXTRACTION WITH ADVANCED INTELLIGENCE
 */
async function extractEnhancedStrategicFacts(userMessage, gptResponse) {
    const facts = [];
    const lowerUser = userMessage.toLowerCase();
    const lowerGpt = gptResponse.toLowerCase();
    const combinedContent = userMessage + ' ' + gptResponse;
    
    // Enhanced personal information patterns with context intelligence
    const enhancedPersonalPatterns = [
        { 
            regex: /my name is ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.PERSONAL, 
            importance: IMPORTANCE_LEVELS.CRITICAL,
            strategicWeight: 1.0,
            contextKeywords: ['name', 'identity', 'called']
        },
        { 
            regex: /i am (?:a |an )?([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.PERSONAL, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.9,
            contextKeywords: ['profession', 'role', 'identity']
        },
        { 
            regex: /i work (?:at|for) ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.PERSONAL, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.8,
            contextKeywords: ['employment', 'company', 'job']
        },
        { 
            regex: /i live in ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.PERSONAL, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.7,
            contextKeywords: ['location', 'residence', 'geography']
        },
        { 
            regex: /i'm from ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.PERSONAL, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.7,
            contextKeywords: ['origin', 'background', 'nationality']
        }
    ];
    
    // Enhanced financial information patterns with strategic intelligence
    const enhancedFinancialPatterns = [
        { 
            regex: /my risk tolerance is ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.FINANCIAL, 
            importance: IMPORTANCE_LEVELS.CRITICAL,
            strategicWeight: 1.0,
            contextKeywords: ['risk', 'tolerance', 'appetite']
        },
        { 
            regex: /i prefer ([^.,\n]+ investment[s]?)/i, 
            category: MEMORY_CATEGORIES.FINANCIAL, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.9,
            contextKeywords: ['investment', 'preference', 'strategy']
        },
        { 
            regex: /my portfolio (?:is|has|contains) ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.PORTFOLIO, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.9,
            contextKeywords: ['portfolio', 'holdings', 'allocation']
        },
        { 
            regex: /i invest in ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.FINANCIAL, 
            importance: IMPORTANCE_LEVELS.MEDIUM,
            strategicWeight: 0.7,
            contextKeywords: ['investment', 'assets', 'allocation']
        },
        { 
            regex: /my target return is ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.GOALS, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.8,
            contextKeywords: ['target', 'return', 'goal']
        },
        { 
            regex: /my investment horizon is ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.FINANCIAL, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.8,
            contextKeywords: ['horizon', 'timeframe', 'duration']
        }
    ];
    
    // Enhanced trading patterns with behavioral intelligence
    const enhancedTradingPatterns = [
        { 
            regex: /i usually trade ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.TRADING, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.8,
            contextKeywords: ['trading', 'style', 'behavior']
        },
        { 
            regex: /my trading style is ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.TRADING, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.8,
            contextKeywords: ['style', 'approach', 'methodology']
        },
        { 
            regex: /i (?:always|never) ([^.,\n]+ when trading)/i, 
            category: MEMORY_CATEGORIES.BEHAVIORAL, 
            importance: IMPORTANCE_LEVELS.MEDIUM,
            strategicWeight: 0.7,
            contextKeywords: ['behavior', 'pattern', 'rule']
        },
        { 
            regex: /my stop loss is (?:usually |typically )?([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.RISK, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.8,
            contextKeywords: ['stop', 'loss', 'risk', 'management']
        }
    ];
    
    // Enhanced Cambodia fund specific patterns
    const enhancedCambodiaPatterns = [
        { 
            regex: /in cambodia i ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.CAMBODIA_FUND, 
            importance: IMPORTANCE_LEVELS.CRITICAL,
            strategicWeight: 1.0,
            contextKeywords: ['cambodia', 'operations', 'business']
        },
        { 
            regex: /my (?:cambodia|fund) ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.CAMBODIA_FUND, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.9,
            contextKeywords: ['fund', 'investment', 'strategy']
        },
        { 
            regex: /cambodian (?:market|real estate|lending) ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.CAMBODIA_FUND, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.8,
            contextKeywords: ['market', 'real estate', 'lending']
        }
    ];
    
    // Enhanced strategic preferences with intelligence
    const enhancedStrategicPatterns = [
        { 
            regex: /i prefer ([^.,\n]+ analysis)/i, 
            category: MEMORY_CATEGORIES.STRATEGIC, 
            importance: IMPORTANCE_LEVELS.MEDIUM,
            strategicWeight: 0.6,
            contextKeywords: ['analysis', 'preference', 'style']
        },
        { 
            regex: /(?:always|never) show me ([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.BEHAVIORAL, 
            importance: IMPORTANCE_LEVELS.MEDIUM,
            strategicWeight: 0.6,
            contextKeywords: ['display', 'preference', 'interface']
        },
        { 
            regex: /remember (?:that )?([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.STRATEGIC, 
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.8,
            contextKeywords: ['remember', 'important', 'note']
        },
        { 
            regex: /my goal is (?:to )?([^.,\n]+)/i, 
            category: MEMORY_CATEGORIES.GOALS, 
            importance: IMPORTANCE_LEVELS.STRATEGIC,
            strategicWeight: 0.9,
            contextKeywords: ['goal', 'objective', 'target']
        }
    ];
    
    // Process all enhanced patterns
    const allEnhancedPatterns = [
        ...enhancedPersonalPatterns,
        ...enhancedFinancialPatterns,
        ...enhancedTradingPatterns,
        ...enhancedCambodiaPatterns,
        ...enhancedStrategicPatterns
    ];
    
    allEnhancedPatterns.forEach(pattern => {
        const matches = userMessage.match(pattern.regex);
        if (matches && matches[1] && matches[1].length > 3 && matches[1].length < 300) {
            // Enhanced context analysis
            const contextScore = calculateContextScore(combinedContent, pattern.contextKeywords);
            const adjustedStrategicWeight = pattern.strategicWeight * (1 + contextScore * 0.2);
            
            facts.push({
                text: matches[0].trim(),
                category: pattern.category,
                importance: pattern.importance,
                strategicWeight: Math.min(1.0, adjustedStrategicWeight),
                extractedValue: matches[1].trim(),
                source: 'user_statement',
                contextScore: contextScore,
                contextKeywords: pattern.contextKeywords,
                metadata: {
                    extractionMethod: 'regex_enhanced',
                    confidence: calculateExtractionConfidence(matches[0], pattern),
                    timestamp: new Date().toISOString(),
                    messageLength: userMessage.length,
                    responseLength: gptResponse.length
                }
            });
        }
    });
    
    // Enhanced GPT response analysis for strategic preferences
    const gptEnhancedPatterns = [
        { 
            regex: /user prefers ([^.,\n]+)/i,
            category: MEMORY_CATEGORIES.BEHAVIORAL,
            importance: IMPORTANCE_LEVELS.MEDIUM,
            strategicWeight: 0.6,
            source: 'ai_inference'
        },
        { 
            regex: /(?:they|user) typically ([^.,\n]+)/i,
            category: MEMORY_CATEGORIES.BEHAVIORAL,
            importance: IMPORTANCE_LEVELS.MEDIUM,
            strategicWeight: 0.6,
            source: 'ai_inference'
        },
        { 
            regex: /(?:their|user's) strategy is ([^.,\n]+)/i,
            category: MEMORY_CATEGORIES.STRATEGIC,
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.7,
            source: 'ai_inference'
        },
        { 
            regex: /key insight:? ([^.,\n]+)/i,
            category: MEMORY_CATEGORIES.STRATEGIC,
            importance: IMPORTANCE_LEVELS.HIGH,
            strategicWeight: 0.8,
            source: 'ai_insight'
        }
    ];
    
    gptEnhancedPatterns.forEach(pattern => {
        const matches = gptResponse.match(pattern.regex);
        if (matches && matches[1] && matches[1].length > 5 && matches[1].length < 200) {
            facts.push({
                text: matches[0].trim(),
                category: pattern.category,
                importance: pattern.importance,
                strategicWeight: pattern.strategicWeight,
                extractedValue: matches[1].trim(),
                source: pattern.source,
                contextScore: 0.5, // Default for AI-extracted facts
                metadata: {
                    extractionMethod: 'ai_response_analysis',
                    confidence: 0.7,
                    timestamp: new Date().toISOString(),
                    sourceMessage: 'gpt_response'
                }
            });
        }
    });
    
    console.log(`🔍 Enhanced fact extraction: ${facts.length} facts identified`);
    return facts;
}

/**
 * 💹 ENHANCED TRADING PATTERN EXTRACTION WITH BEHAVIORAL INTELLIGENCE
 */
function extractEnhancedTradingPatterns(userMessage, gptResponse) {
    const patterns = [];
    const combined = userMessage + ' ' + gptResponse;
    const lowerCombined = combined.toLowerCase();
    
    // Enhanced trading behavior patterns with context intelligence
    const enhancedBehaviorPatterns = [
        { 
            pattern: /(?:always|usually|typically) (?:buy|sell) when ([^.,\n]+)/i, 
            type: 'TRIGGER_BEHAVIOR',
            confidence: 0.8,
            contextKeywords: ['buy', 'sell', 'trigger', 'condition']
        },
        { 
            pattern: /(?:never|avoid) ([^.,\n]+ trades?)/i, 
            type: 'AVOIDANCE_PATTERN',
            confidence: 0.8,
            contextKeywords: ['avoid', 'never', 'restriction']
        },
        { 
            pattern: /prefer (\w+) term (?:trades?|investments?)/i, 
            type: 'TIME_PREFERENCE',
            confidence: 0.7,
            contextKeywords: ['term', 'duration', 'timeframe']
        },
        { 
            pattern: /risk tolerance (?:is )?(\w+)/i, 
            type: 'RISK_PROFILE',
            confidence: 0.9,
            contextKeywords: ['risk', 'tolerance', 'appetite']
        },
        { 
            pattern: /stop loss (?:at )?(\d+)%/i, 
            type: 'RISK_MANAGEMENT',
            confidence: 0.9,
            contextKeywords: ['stop', 'loss', 'percentage']
        },
        { 
            pattern: /take profit (?:at )?(\d+)%/i, 
            type: 'PROFIT_TAKING',
            confidence: 0.9,
            contextKeywords: ['take', 'profit', 'target']
        },
        { 
            pattern: /position size (?:is )?([^.,\n]+)/i, 
            type: 'POSITION_SIZING',
            confidence: 0.8,
            contextKeywords: ['position', 'size', 'allocation']
        },
        { 
            pattern: /(?:entry|exit) strategy (?:is )?([^.,\n]+)/i, 
            type: 'STRATEGY_PATTERN',
            confidence: 0.8,
            contextKeywords: ['entry', 'exit', 'strategy']
        }
    ];
    
    enhancedBehaviorPatterns.forEach(({ pattern, type, confidence, contextKeywords }) => {
        const matches = combined.match(pattern);
        if (matches) {
            const contextScore = calculateContextScore(combined, contextKeywords);
            const adjustedConfidence = Math.min(95, confidence * 100 * (1 + contextScore * 0.2));
            
            patterns.push({
                type: type,
                description: matches[0].trim(),
                confidence: Math.round(adjustedConfidence),
                extractedValue: matches[1] ? matches[1].trim() : null,
                timestamp: new Date().toISOString(),
                contextScore: contextScore,
                contextKeywords: contextKeywords,
                triggers: extractTriggers(matches[0]),
                metadata: {
                    extractionMethod: 'enhanced_pattern_matching',
                    source: 'conversation_analysis',
                    validationScore: calculateValidationScore(matches[0], type)
                }
            });
        }
    });
    
    // Enhanced market condition patterns
    const marketConditionPatterns = [
        { 
            pattern: /(?:bull|bullish) market ([^.,\n]+)/i, 
            type: 'MARKET_CONDITION_BULL',
            confidence: 0.7
        },
        { 
            pattern: /(?:bear|bearish) market ([^.,\n]+)/i, 
            type: 'MARKET_CONDITION_BEAR',
            confidence: 0.7
        },
        { 
            pattern: /volatile market ([^.,\n]+)/i, 
            type: 'MARKET_CONDITION_VOLATILE',
            confidence: 0.7
        }
    ];
    
    marketConditionPatterns.forEach(({ pattern, type, confidence }) => {
        const matches = combined.match(pattern);
        if (matches) {
            patterns.push({
                type: type,
                description: matches[0].trim(),
                confidence: Math.round(confidence * 100),
                extractedValue: matches[1] ? matches[1].trim() : null,
                timestamp: new Date().toISOString(),
                marketCondition: type.split('_')[2].toLowerCase(),
                metadata: {
                    extractionMethod: 'market_condition_analysis',
                    source: 'conversation_analysis'
                }
            });
        }
    });
    
    console.log(`💹 Enhanced trading patterns extracted: ${patterns.length} patterns`);
    return patterns;
}

// ENHANCED MEMORY.JS - PART 5: ADVANCED MEMORY MANAGEMENT

/**
 * 💾 ENHANCED PERSISTENT MEMORY WITH STRATEGIC INTELLIGENCE
 */
async function addPersistentMemory(chatId, fact, importance = 'medium', category = 'general', strategicWeight = 0.5, metadata = {}) {
    try {
        const startTime = Date.now();
        
        // Enhanced fact validation and processing
        const enhancedFact = processEnhancedFact(fact, importance, category, strategicWeight, metadata);
        
        // Try database first with enhanced structure
        const dbSaved = await addPersistentMemoryDB(chatId, enhancedFact.text, enhancedFact.importance);
        
        if (dbSaved) {
            console.log(`💾 Enhanced persistent memory saved to database: ${enhancedFact.text.substring(0, 50)}...`);
            
            // Log strategic memory performance
            const processingTime = Date.now() - startTime;
            await saveEnhancedFunctionPerformance(
                chatId,
                'persistent_memory_save',
                processingTime,
                true,
                enhancedFact.strategicWeight,
                enhancedFact.importance
            ).catch(console.error);
            
            return true;
        }
        
        // Enhanced fallback to in-memory with strategic intelligence
        const chatKey = String(chatId);
        if (!persistentMemories.has(chatKey)) {
            persistentMemories.set(chatKey, []);
        }
        
        const memoryEntry = {
            ...enhancedFact,
            memoryId: generateMemoryId(chatId, fact),
            accessCount: 0,
            lastAccessed: new Date().toISOString(),
            memoryScore: calculateMemoryScore(enhancedFact),
            consolidationStatus: 'active',
            relatedMemories: [],
            contextTags: extractContextTags(fact),
            validationScore: calculateValidationScore(fact, category)
        };
        
        const memories = persistentMemories.get(chatKey);
        memories.push(memoryEntry);
        
        // Enhanced intelligent memory management with strategic prioritization
        if (memories.length > ENHANCED_MEMORY_CONFIG.MAX_PERSISTENT_MEMORIES_PER_USER) {
            const optimizedMemories = optimizeEnhancedMemoryStorage(memories);
            persistentMemories.set(chatKey, optimizedMemories);
        }
        
        // Update memory performance metrics
        const processingTime = Date.now() - startTime;
        updateMemoryPerformanceMetrics(chatId, 'persistent_memory_fallback', processingTime, true);
        
        console.log(`💾 Enhanced persistent memory saved to cache: ${enhancedFact.text.substring(0, 50)}...`);
        return true;
        
    } catch (error) {
        console.error('Enhanced persistent memory error:', error.message);
        updateMemoryPerformanceMetrics(chatId, 'persistent_memory', 1000, false, error.message);
        return false;
    }
}

/**
 * 🔄 ENHANCED FACT PROCESSING WITH INTELLIGENCE
 */
function processEnhancedFact(fact, importance, category, strategicWeight, metadata) {
    return {
        text: fact.trim(),
        importance: importance,
        category: category,
        strategicWeight: Math.min(1.0, Math.max(0.0, strategicWeight)),
        timestamp: new Date().toISOString(),
        metadata: {
            ...metadata,
            processingMethod: 'enhanced_strategic',
            qualityScore: calculateFactQuality(fact),
            relevanceScore: calculateRelevanceScore(fact, category),
            uniquenessScore: calculateUniquenessScore(fact),
            strategicValue: assessStrategicValue(fact, importance, category)
        }
    };
}

/**
 * 🧠 ENHANCED MEMORY OPTIMIZATION WITH STRATEGIC INTELLIGENCE
 */
function optimizeEnhancedMemoryStorage(memories) {
    // Enhanced sorting algorithm with multiple strategic factors
    const scoredMemories = memories.map(memory => ({
        ...memory,
        optimizationScore: calculateOptimizationScore(memory)
    }));
    
    // Sort by optimization score (higher is better)
    scoredMemories.sort((a, b) => b.optimizationScore - a.optimizationScore);
    
    // Keep top strategic memories based on enhanced criteria
    const keepCount = Math.floor(ENHANCED_MEMORY_CONFIG.MAX_PERSISTENT_MEMORIES_PER_USER * 0.8);
    const optimizedMemories = scoredMemories.slice(0, keepCount);
    
    // Update consolidation status for kept memories
    optimizedMemories.forEach(memory => {
        memory.consolidationStatus = memory.optimizationScore > 0.8 ? 'consolidated' : 'active';
        memory.lastOptimization = new Date().toISOString();
    });
    
    console.log(`🧠 Memory optimization: Kept ${optimizedMemories.length} of ${memories.length} memories`);
    return optimizedMemories;
}

/**
 * 📊 CALCULATE ENHANCED OPTIMIZATION SCORE
 */
function calculateOptimizationScore(memory) {
    let score = 0;
    
    // Strategic importance weight (40%)
    const importanceWeights = {
        'critical': 1.0,
        'strategic': 0.9,
        'high': 0.7,
        'medium': 0.5,
        'low': 0.3,
        'contextual': 0.4
    };
    score += (importanceWeights[memory.importance] || 0.5) * 0.4;
    
    // Strategic weight (25%)
    score += memory.strategicWeight * 0.25;
    
    // Access pattern weight (15%)
    const daysSinceCreation = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    const accessFrequency = memory.accessCount / Math.max(1, daysSinceCreation);
    score += Math.min(1.0, accessFrequency * 10) * 0.15;
    
    // Recency weight (10%)
    const daysSinceAccess = (Date.now() - new Date(memory.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - (daysSinceAccess / 90)); // 90-day decay
    score += recencyScore * 0.1;
    
    // Quality and validation weight (10%)
    const qualityScore = memory.metadata?.qualityScore || 0.5;
    const validationScore = memory.validationScore || 0.5;
    score += ((qualityScore + validationScore) / 2) * 0.1;
    
    return Math.min(1.0, score);
}

/**
 * 🎯 ENHANCED STRATEGIC USER PROFILE MANAGEMENT
 */
async function getEnhancedStrategicUserProfile(chatId) {
    try {
        const chatKey = String(chatId);
        
        // Gather comprehensive user data
        const [conversations, patterns, memories] = await Promise.all([
            getConversationHistory(chatId, 50),
            getStoredTradingPatterns(chatId),
            getPersistentMemory(chatId)
        ]);
        
        // Enhanced strategic profile with intelligence analytics
        const profile = {
            chatId: chatId,
            timestamp: new Date().toISOString(),
            
            // Core strategic attributes
            riskTolerance: inferEnhancedRiskTolerance(conversations, patterns, memories),
            tradingStyle: inferEnhancedTradingStyle(conversations, patterns),
            analysisDepth: inferEnhancedAnalysisPreference(conversations),
            cambodiaFundInterest: inferEnhancedCambodiaInterest(conversations, memories),
            communicationStyle: inferEnhancedCommunicationStyle(conversations),
            decisionMakingStyle: inferDecisionMakingStyle(conversations, patterns),
            
            // Enhanced behavioral intelligence
            behavioralPatterns: {
                conversationFrequency: calculateConversationFrequency(conversations),
                topicPreferences: analyzeTopicPreferences(conversations),
                complexityPreference: analyzeComplexityPreference(conversations),
                responseTimePreference: analyzeResponseTimePreference(conversations),
                questioningStyle: analyzeQuestioningStyle(conversations)
            },
            
            // Strategic preferences with intelligence
            strategicPreferences: {
                ...extractEnhancedStrategicPreferences(conversations, memories),
                memoryUtilization: assessMemoryUtilization(memories),
                informationProcessingStyle: assessInformationProcessingStyle(conversations),
                strategicThinkingLevel: assessStrategicThinkingLevel(conversations, memories)
            },
            
            // Performance and engagement metrics
            engagementMetrics: {
                totalInteractions: conversations.length,
                averageSessionLength: calculateAverageSessionLength(conversations),
                topicDiversity: calculateTopicDiversity(conversations),
                strategicDepth: calculateStrategicDepth(conversations, memories),
                learningCurve: assessLearningCurve(conversations),
                expertiseLevel: assessExpertiseLevel(conversations, patterns, memories)
            },
            
            // Intelligence and learning indicators
            intelligenceIndicators: {
                memoryRetention: assessMemoryRetention(memories),
                patternRecognition: assessPatternRecognition(patterns),
                strategicConsistency: assessStrategicConsistency(conversations, memories),
                adaptabilityScore: assessAdaptability(conversations),
                innovationIndex: assessInnovationIndex(conversations)
            },
            
            lastUpdated: new Date().toISOString()
        };
        
        console.log(`🎯 Enhanced strategic profile generated for ${chatId}`);
        return profile;
        
    } catch (error) {
        console.error('Enhanced strategic profile error:', error.message);
        return null;
    }
}

/**
 * 📊 ENHANCED MEMORY ANALYTICS WITH STRATEGIC INTELLIGENCE
 */
async function getEnhancedMemoryAnalytics(chatId) {
    try {
        const [conversations, persistentMemory, userProfile, patterns, intelligence] = await Promise.all([
            getConversationHistory(chatId, 100),
            getPersistentMemory(chatId),
            getEnhancedUserProfile(chatId),
            getStoredTradingPatterns(chatId),
            getConversationIntelligenceCache(chatId)
        ]);
        
        const analytics = {
            timestamp: new Date().toISOString(),
            
            // Core memory statistics
            coreStats: {
                totalConversations: conversations.length,
                                totalPersistentFacts: persistentMemory.length,
                totalTradingPatterns: patterns.length,
                memoryDensity: persistentMemory.length / Math.max(1, conversations.length),
                strategicMemoryRatio: calculateStrategicMemoryRatio(persistentMemory),
                memoryQualityScore: calculateMemoryQualityScore(persistentMemory)
            },
            
            // Enhanced memory categorization with intelligence
            memoryByCategory: categorizePersistentMemories(persistentMemory),
            memoryByImportance: groupByImportance(persistentMemory),
            memoryByStrategicWeight: groupByStrategicWeight(persistentMemory),
            
            // Advanced conversation analytics
            conversationIntelligence: {
                patterns: analyzeConversationPatterns(conversations),
                topicFrequency: analyzeTopicFrequency(conversations),
                complexityEvolution: analyzeComplexityEvolution(conversations),
                strategicProgression: analyzeStrategicProgression(conversations, persistentMemory),
                learningVelocity: calculateLearningVelocity(conversations, persistentMemory)
            },
            
            // Strategic relationship metrics
            relationshipMetrics: {
                duration: userProfile ? calculateRelationshipDuration(userProfile.first_seen) : 0,
                depth: calculateRelationshipDepth(conversations, persistentMemory),
                trust: calculateTrustLevel(conversations, persistentMemory),
                expertise: calculateExpertiseRecognition(conversations),
                strategicAlignment: calculateStrategicAlignment(conversations, persistentMemory)
            },
            
            // Memory performance and efficiency
            performanceMetrics: {
                memoryUtilization: assessMemoryUtilization(persistentMemory),
                retrievalEfficiency: calculateRetrievalEfficiency(conversations, persistentMemory),
                contextRelevance: calculateContextRelevance(conversations, persistentMemory),
                memoryConsolidation: assessMemoryConsolidation(persistentMemory),
                strategicValue: calculateStrategicValue(persistentMemory)
            },
            
            // Enhanced behavioral insights
            behavioralInsights: {
                communicationPatterns: analyzeCommunicationPatterns(conversations),
                decisionMakingStyle: analyzeDecisionMakingStyle(conversations, patterns),
                riskProfile: analyzeRiskProfile(conversations, patterns, persistentMemory),
                learningStyle: analyzeLearningStyle(conversations, persistentMemory),
                adaptabilityIndex: calculateAdaptabilityIndex(conversations)
            },
            
            // Strategic intelligence indicators
            strategicIntelligence: {
                insightGeneration: assessInsightGeneration(conversations, persistentMemory),
                patternRecognition: assessPatternRecognition(patterns),
                strategicThinking: assessStrategicThinking(conversations, persistentMemory),
                marketIntelligence: assessMarketIntelligence(conversations, persistentMemory),
                innovationCapacity: assessInnovationCapacity(conversations)
            },
            
            // Memory health and optimization recommendations
            memoryHealth: {
                overallHealth: calculateMemoryHealth(persistentMemory, conversations),
                optimizationOpportunities: identifyOptimizationOpportunities(persistentMemory, conversations),
                redundancyLevel: calculateRedundancyLevel(persistentMemory),
                gapAnalysis: performGapAnalysis(persistentMemory, conversations),
                recommendedActions: generateMemoryRecommendations(persistentMemory, conversations, patterns)
            },
            
            // Enhanced insights and predictions
            predictiveInsights: {
                futureTopics: predictFutureTopics(conversations),
                learningTrajectory: predictLearningTrajectory(conversations, persistentMemory),
                strategicEvolution: predictStrategicEvolution(conversations, persistentMemory, patterns),
                memoryGrowthProjection: projectMemoryGrowth(persistentMemory, conversations),
                engagementForecast: forecastEngagement(conversations)
            },
            
            lastAnalyzed: new Date().toISOString()
        };
        
        console.log(`📊 Enhanced memory analytics generated for ${chatId}`);
        return analytics;
        
    } catch (error) {
        console.error('Enhanced memory analytics error:', error.message);
        return null;
    }
}

/**
 * 🔍 ENHANCED STRATEGIC MEMORY SEARCH WITH INTELLIGENCE
 */
async function searchEnhancedStrategicMemory(chatId, query, options = {}) {
    try {
        const startTime = Date.now();
        console.log(`🔍 Enhanced strategic memory search for "${query}"`);
        
        const [conversations, persistentMemory, patterns, intelligence] = await Promise.all([
            getConversationHistory(chatId, 100),
            getPersistentMemory(chatId),
            getStoredTradingPatterns(chatId),
            getConversationIntelligenceCache(chatId)
        ]);
        
        const queryLower = query.toLowerCase();
        const searchResults = {
            query: query,
            timestamp: new Date().toISOString(),
            conversations: [],
            memories: [],
            patterns: [],
            intelligence: [],
            relatedConcepts: [],
            strategicInsights: [],
            relevanceScore: 0,
            processingTime: 0
        };
        
        // Enhanced conversation search with semantic analysis
        conversations.forEach(conv => {
            const relevanceScore = calculateEnhancedRelevance(conv, query, queryLower);
            if (relevanceScore > 0.3) {
                searchResults.conversations.push({
                    ...conv,
                    relevanceScore,
                    matchedContent: extractMatchedContent(conv, queryLower),
                    strategicContext: extractStrategicContext(conv),
                    semanticSimilarity: calculateSemanticSimilarity(conv, query)
                });
            }
        });
        
        // Enhanced persistent memory search with strategic weighting
        persistentMemory.forEach(memory => {
            const relevanceScore = calculateMemoryRelevance(memory, query, queryLower);
            if (relevanceScore > 0.2) {
                searchResults.memories.push({
                    ...memory,
                    relevanceScore,
                    strategicAlignment: calculateStrategicAlignment([memory], query),
                    contextualRelevance: calculateContextualRelevance(memory, query)
                });
            }
        });
        
        // Enhanced trading patterns search
        patterns.forEach(pattern => {
            const relevanceScore = calculatePatternRelevance(pattern, query, queryLower);
            if (relevanceScore > 0.3) {
                searchResults.patterns.push({
                    ...pattern,
                    relevanceScore,
                    strategicImplication: analyzeStrategicImplication(pattern, query)
                });
            }
        });
        
        // Generate related concepts and strategic insights
        searchResults.relatedConcepts = generateRelatedConcepts(query, searchResults);
        searchResults.strategicInsights = generateStrategicInsights(query, searchResults);
        
        // Calculate overall relevance and sort results
        searchResults.relevanceScore = calculateOverallRelevance(searchResults);
        
        // Sort results by relevance within each category
        searchResults.conversations.sort((a, b) => b.relevanceScore - a.relevanceScore);
        searchResults.memories.sort((a, b) => b.relevanceScore - a.relevanceScore);
        searchResults.patterns.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        // Limit results to most relevant
        const maxResults = options.maxResults || 10;
        searchResults.conversations = searchResults.conversations.slice(0, maxResults);
        searchResults.memories = searchResults.memories.slice(0, maxResults);
        searchResults.patterns = searchResults.patterns.slice(0, Math.min(5, maxResults));
        
        const processingTime = Date.now() - startTime;
        searchResults.processingTime = processingTime;
        
        // Update performance metrics
        updateMemoryPerformanceMetrics(chatId, 'enhanced_search', processingTime, searchResults.relevanceScore > 0.5);
        
        console.log(`✅ Enhanced search complete: ${searchResults.conversations.length + searchResults.memories.length + searchResults.patterns.length} results (${processingTime}ms)`);
        
        return searchResults;
        
    } catch (error) {
        console.error('Enhanced strategic memory search error:', error.message);
        return {
            query: query,
            error: error.message,
            conversations: [],
            memories: [],
            patterns: [],
            relevanceScore: 0,
            processingTime: 0
        };
    }
}

/**
 * 📈 ENHANCED CONVERSATION INTELLIGENCE ANALYSIS
 */
function analyzeConversationIntelligence(userMessage, gptResponse, messageType) {
    const analysis = {
        timestamp: new Date().toISOString(),
        messageType: messageType,
        
        // Content analysis
        contentAnalysis: {
            userMessageLength: userMessage.length,
            gptResponseLength: gptResponse.length,
            complexityLevel: assessComplexityLevel(userMessage, gptResponse),
            topicCategories: identifyTopicCategories(userMessage, gptResponse),
            strategicRelevance: assessStrategicRelevance(userMessage, gptResponse)
        },
        
        // Strategic importance assessment
        strategicImportance: calculateStrategicImportance(userMessage, gptResponse),
        
        // Conversation type classification
        conversationType: classifyConversationType(userMessage, gptResponse),
        
        // Intelligence extraction
        extractedIntelligence: {
            keyTopics: extractKeyTopics(userMessage, gptResponse),
            strategicInsights: extractConversationInsights(userMessage, gptResponse),
            actionItems: extractActionItems(userMessage, gptResponse),
            decisions: extractDecisions(userMessage, gptResponse),
            preferences: extractPreferences(userMessage, gptResponse)
        },
        
        // Behavioral indicators
        behavioralIndicators: {
            questioningStyle: analyzeQuestioningStyle([{userMessage, gptResponse}]),
            decisionMakingPattern: analyzeDecisionPattern(userMessage, gptResponse),
            informationSeekingBehavior: analyzeInformationSeeking(userMessage),
            engagementLevel: assessEngagementLevel(userMessage, gptResponse),
            expertiseLevel: assessConversationExpertise(userMessage, gptResponse)
        },
        
        // Context and flow analysis
        contextAnalysis: {
            conversationFlow: analyzeConversationFlow(userMessage, gptResponse),
            contextContinuity: assessContextContinuity(userMessage, gptResponse),
            topicTransition: analyzeTopicTransition(userMessage, gptResponse),
            coherenceLevel: assessCoherenceLevel(userMessage, gptResponse)
        },
        
        // Quality and effectiveness metrics
        qualityMetrics: {
            responseQuality: assessResponseQuality(gptResponse),
            userSatisfactionIndicators: assessSatisfactionIndicators(userMessage, gptResponse),
            informationDensity: calculateInformationDensity(gptResponse),
            strategicValue: assessConversationStrategicValue(userMessage, gptResponse)
        }
    };
    
    return analysis;
}

/**
 * 🎯 STRATEGIC INSIGHTS EXTRACTION WITH INTELLIGENCE
 */
function extractStrategicInsights(userMessage, gptResponse, conversationIntel = null) {
    const insights = [];
    const combined = userMessage + ' ' + gptResponse;
    const lowerCombined = combined.toLowerCase();
    
    // Enhanced strategic insight patterns
    const strategicPatterns = [
        {
            pattern: /(?:key insight|important finding|strategic conclusion)[:\s]*([^.!?\n]+)/gi,
            type: 'STRATEGIC_CONCLUSION',
            importance: IMPORTANCE_LEVELS.STRATEGIC,
            confidence: 0.9
        },
        {
            pattern: /(?:market opportunity|investment opportunity|strategic opportunity)[:\s]*([^.!?\n]+)/gi,
            type: 'OPPORTUNITY_IDENTIFICATION',
            importance: IMPORTANCE_LEVELS.HIGH,
            confidence: 0.8
        },
        {
            pattern: /(?:risk factor|potential risk|concern)[:\s]*([^.!?\n]+)/gi,
            type: 'RISK_IDENTIFICATION',
            importance: IMPORTANCE_LEVELS.HIGH,
            confidence: 0.8
        },
        {
            pattern: /(?:recommendation|suggest|advise)[:\s]*([^.!?\n]+)/gi,
            type: 'STRATEGIC_RECOMMENDATION',
            importance: IMPORTANCE_LEVELS.HIGH,
            confidence: 0.7
        },
        {
            pattern: /(?:trend|pattern|correlation)[:\s]*([^.!?\n]+)/gi,
            type: 'PATTERN_RECOGNITION',
            importance: IMPORTANCE_LEVELS.MEDIUM,
            confidence: 0.6
        }
    ];
    
    strategicPatterns.forEach(patternObj => {
        const matches = [...combined.matchAll(patternObj.pattern)];
        matches.forEach(match => {
            if (match[1] && match[1].trim().length > 15) {
                insights.push({
                    type: patternObj.type,
                    insight: match[1].trim(),
                    confidence: patternObj.confidence,
                    importance: patternObj.importance,
                    timestamp: new Date().toISOString(),
                    source: 'conversation_analysis',
                    context: extractSurroundingContext(combined, match.index),
                    strategicWeight: calculateInsightStrategicWeight(match[1], patternObj.type),
                    metadata: {
                        extractionMethod: 'pattern_matching',
                        conversationLength: combined.length,
                        patternType: patternObj.type
                    }
                });
            }
        });
    });
    
    // Extract insights from conversation intelligence if available
    if (conversationIntel && conversationIntel.extractedIntelligence) {
        const intel = conversationIntel.extractedIntelligence;
        
        // Add strategic insights from intelligence analysis
        if (intel.strategicInsights && intel.strategicInsights.length > 0) {
            intel.strategicInsights.forEach(insight => {
                insights.push({
                    type: 'INTELLIGENCE_DERIVED',
                    insight: insight,
                    confidence: 0.7,
                    importance: IMPORTANCE_LEVELS.MEDIUM,
                    timestamp: new Date().toISOString(),
                    source: 'conversation_intelligence',
                    strategicWeight: 0.6,
                    metadata: {
                        extractionMethod: 'intelligence_analysis',
                        conversationType: conversationIntel.conversationType
                    }
                });
            });
        }
    }
    
    console.log(`🎯 Strategic insights extracted: ${insights.length} insights`);
    return insights;
}

/**
 * 🧠 BEHAVIORAL PATTERN EXTRACTION WITH INTELLIGENCE
 */
function extractBehavioralPatterns(userMessage, gptResponse) {
    const patterns = [];
    const combined = userMessage + ' ' + gptResponse;
    
    // Enhanced behavioral pattern recognition
    const behavioralPatterns = [
        {
            pattern: /i (?:always|usually|typically|often) ([^.!?\n]+)/gi,
            type: 'CONSISTENT_BEHAVIOR',
            frequency: 'HIGH',
            confidence: 0.8
        },
        {
            pattern: /i (?:never|rarely|seldom) ([^.!?\n]+)/gi,
            type: 'AVOIDANCE_BEHAVIOR',
            frequency: 'LOW',
            confidence: 0.8
        },
        {
            pattern: /i (?:prefer|like|enjoy) ([^.!?\n]+)/gi,
            type: 'PREFERENCE_PATTERN',
            frequency: 'MEDIUM',
            confidence: 0.7
        },
        {
            pattern: /when ([^,]+), i (?:usually|typically|always) ([^.!?\n]+)/gi,
            type: 'CONDITIONAL_BEHAVIOR',
            frequency: 'CONTEXTUAL',
            confidence: 0.8
        },
        {
            pattern: /my (?:approach|method|strategy) (?:is|involves) ([^.!?\n]+)/gi,
            type: 'STRATEGIC_APPROACH',
            frequency: 'CONSISTENT',
            confidence: 0.9
        }
    ];
    
    behavioralPatterns.forEach(patternObj => {
        const matches = [...userMessage.matchAll(patternObj.pattern)];
        matches.forEach(match => {
            if (match[1] && match[1].trim().length > 10) {
                patterns.push({
                    type: patternObj.type,
                    behavior: match[1].trim(),
                    frequency: patternObj.frequency,
                    confidence: patternObj.confidence,
                    context: match[2] ? match[2].trim() : null,
                    timestamp: new Date().toISOString(),
                    source: 'user_statement',
                    strategicRelevance: assessBehaviorStrategicRelevance(match[1]),
                    metadata: {
                        extractionMethod: 'behavioral_pattern_recognition',
                        messageLength: userMessage.length,
                        patternCategory: patternObj.type
                    }
                });
            }
        });
    });
    
    console.log(`🧠 Behavioral patterns extracted: ${patterns.length} patterns`);
    return patterns;
}

// ENHANCED MEMORY.JS - PART 7: UTILITY FUNCTIONS & INTELLIGENCE

/**
 * 🔧 ENHANCED UTILITY FUNCTIONS WITH STRATEGIC INTELLIGENCE
 */

// Memory ID generation with enhanced uniqueness
function generateMemoryId(chatId, content) {
    const timestamp = Date.now();
    const contentHash = require('crypto')
        .createHash('md5')
        .update(content.substring(0, 100))
        .digest('hex')
        .substring(0, 8);
    return `${chatId}_${timestamp}_${contentHash}`;
}

// Enhanced text truncation with intelligent breaking
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    
    // Try to break at sentence boundaries
    const truncated = text.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSentence > maxLength * 0.7) {
        return truncated.substring(0, lastSentence + 1);
    } else if (lastSpace > maxLength * 0.8) {
        return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
}

// Enhanced relationship duration calculation
function calculateRelationshipDuration(firstSeen) {
    if (!firstSeen) return 0;
    const start = new Date(firstSeen);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

// Enhanced memory intelligence level assessment
function assessMemoryIntelligenceLevel(memoryCount, conversationCount) {
    const ratio = memoryCount / Math.max(1, conversationCount);
    const totalScore = memoryCount * 0.6 + ratio * 0.4;
    
    if (totalScore > 50) return 'EXPERT';
    if (totalScore > 20) return 'ADVANCED';
    if (totalScore > 10) return 'INTERMEDIATE';
    if (totalScore > 5) return 'DEVELOPING';
    return 'BASIC';
}

// Enhanced importance emoji mapping
function getImportanceEmoji(importance) {
    const emojiMap = {
        'critical': '🔴',
        'strategic': '🟠', 
        'high': '🟡',
        'medium': '🟢',
        'low': '⚪',
        'contextual': '🔵'
    };
    return emojiMap[importance] || '⚪';
}

// Enhanced message type emoji mapping
function getMessageTypeEmoji(messageType) {
    const emojiMap = {
        'text': '💬',
        'voice': '🎤',
        'image': '🖼️',
        'document': '📄',
        'video': '🎥'
    };
    return emojiMap[messageType] || '💬';
}

// Enhanced conversation type emoji mapping
function getConversationTypeEmoji(conversationType) {
    const emojiMap = {
        'strategic_analysis': '🎯',
        'market_intelligence': '📈',
        'portfolio_discussion': '💼',
        'risk_assessment': '⚠️',
        'cambodia_fund_analysis': '🇰🇭',
        'trading_strategy': '💹',
        'regime_analysis': '🏛️',
        'personal_consultation': '👤',
        'general': '💬'
    };
    return emojiMap[conversationType] || '💬';
}

/**
 * 📊 ENHANCED STRATEGIC INTELLIGENCE FUNCTIONS
 */

// Enhanced strategic memory ratio calculation
function calculateStrategicMemoryRatio(memories) {
    if (!memories || memories.length === 0) return 0;
    
    const strategicMemories = memories.filter(m => 
        m.importance === 'critical' || 
        m.importance === 'strategic' || 
        m.strategicWeight > 0.7
    );
    
    return strategicMemories.length / memories.length;
}

// Enhanced memory quality score calculation
function calculateMemoryQualityScore(memories) {
    if (!memories || memories.length === 0) return 0;
    
    const qualityScores = memories.map(m => {
        let score = 0;
        
        // Importance weight
        const importanceWeights = {
            'critical': 1.0, 'strategic': 0.9, 'high': 0.7, 
            'medium': 0.5, 'low': 0.3, 'contextual': 0.4
        };
        score += (importanceWeights[m.importance] || 0.5) * 0.4;
        
        // Strategic weight
        score += (m.strategicWeight || 0.5) * 0.3;
        
        // Content quality
        const contentLength = (m.fact || m.text || '').length;
        const lengthScore = Math.min(1, contentLength / 100);
        score += lengthScore * 0.2;
        
        // Validation score
        score += (m.validationScore || 0.5) * 0.1;
        
        return Math.min(1, score);
    });
    
    return qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
}

// Enhanced categorization of persistent memories
function categorizePersistentMemories(memories) {
    const categorized = {};
    
    // Initialize all categories
    Object.values(MEMORY_CATEGORIES).forEach(category => {
        categorized[category] = [];
    });
    
    memories.forEach(memory => {
        const category = memory.category || 'general';
        if (categorized[category]) {
            categorized[category].push(memory);
        } else {
            if (!categorized.general) categorized.general = [];
            categorized.general.push(memory);
        }
    });
    
    return categorized;
}

// Enhanced grouping by importance
function groupByImportance(memories) {
    const grouped = {};
    
    Object.values(IMPORTANCE_LEVELS).forEach(level => {
        grouped[level] = [];
    });
    
    memories.forEach(memory => {
        const importance = memory.importance || 'medium';
        if (grouped[importance]) {
            grouped[importance].push(memory);
        } else {
            if (!grouped.medium) grouped.medium = [];
            grouped.medium.push(memory);
        }
    });
    
    return grouped;
}

// Enhanced grouping by strategic weight
function groupByStrategicWeight(memories) {
    const grouped = {
        'high': [], // 0.8-1.0
        'medium': [], // 0.5-0.79
        'low': [] // 0.0-0.49
    };
    
    memories.forEach(memory => {
        const weight = memory.strategicWeight || 0.5;
        if (weight >= 0.8) {
            grouped.high.push(memory);
        } else if (weight >= 0.5) {
            grouped.medium.push(memory);
        } else {
            grouped.low.push(memory);
        }
    });
    
    return grouped;
}

/**
 * 🧮 ENHANCED CALCULATION FUNCTIONS
 */

// Enhanced strategic importance calculation
function calculateStrategicImportance(userMessage, gptResponse) {
    const message = userMessage.toLowerCase();
    const response = gptResponse.toLowerCase();
    const combined = message + ' ' + response;
    
    let score = 0;
    
    // Critical indicators
    const criticalKeywords = [
        'my name', 'i am', 'my goal', 'my strategy', 'my portfolio',
        'risk tolerance', 'investment horizon', 'cambodia', 'fund'
    ];
    
    criticalKeywords.forEach(keyword => {
        if (message.includes(keyword)) score += 30;
    });
    
    // Strategic indicators
    const strategicKeywords = [
        'strategy', 'analysis', 'opportunity', 'risk', 'allocation',
        'regime', 'market', 'trading', 'investment'
    ];
    
    strategicKeywords.forEach(keyword => {
        if (combined.includes(keyword)) score += 10;
    });
    
    // Behavioral indicators
    if (message.includes('prefer') || message.includes('like')) score += 15;
    if (message.includes('always') || message.includes('never')) score += 20;
    if (message.includes('remember')) score += 25;
    
    // Response quality indicators
    if (response.length > 500) score += 10;
    if (response.includes('strategic') || response.includes('analysis')) score += 5;
    
    // Convert to importance level
    if (score >= 70) return IMPORTANCE_LEVELS.CRITICAL;
    if (score >= 50) return IMPORTANCE_LEVELS.STRATEGIC;
    if (score >= 30) return IMPORTANCE_LEVELS.HIGH;
    if (score >= 15) return IMPORTANCE_LEVELS.MEDIUM;
    return IMPORTANCE_LEVELS.LOW;
}

// Enhanced strategic weight calculation
function calculateStrategicWeight(conversationIntel) {
    let weight = 0.5; // Base weight
    
    if (conversationIntel) {
        // Add weight based on conversation type
        const typeWeights = {
            'strategic_analysis': 0.9,
            'market_intelligence': 0.8,
            'portfolio_discussion': 0.8,
            'risk_assessment': 0.9,
            'cambodia_fund_analysis': 1.0,
            'trading_strategy': 0.7,
            'regime_analysis': 0.8,
            'personal_consultation': 0.6,
            'general': 0.4
        };
        
        weight = typeWeights[conversationIntel.conversationType] || 0.5;
        
        // Adjust based on complexity
        if (conversationIntel.contentAnalysis?.complexityLevel === 'high') {
            weight += 0.1;
        }
        
        // Adjust based on strategic relevance
        if (conversationIntel.contentAnalysis?.strategicRelevance > 0.7) {
            weight += 0.1;
        }
    }
    
    return Math.min(1.0, Math.max(0.0, weight));
}

// Enhanced memory score calculation
function calculateMemoryScore(memory) {
    let score = 0;
    
    // Importance score (40%)
    const importanceScores = {
        'critical': 1.0, 'strategic': 0.9, 'high': 0.7,
        'medium': 0.5, 'low': 0.3, 'contextual': 0.4
    };
    score += (importanceScores[memory.importance] || 0.5) * 0.4;
    
    // Strategic weight (30%)
    score += memory.strategicWeight * 0.3;
    
    // Quality factors (30%)
    const qualityScore = memory.metadata?.qualityScore || 0.5;
    const relevanceScore = memory.metadata?.relevanceScore || 0.5;
    const uniquenessScore = memory.metadata?.uniquenessScore || 0.5;
    
    score += ((qualityScore + relevanceScore + uniquenessScore) / 3) * 0.3;
    
    return Math.min(1.0, score);
}

// Enhanced fact quality calculation
function calculateFactQuality(fact) {
    let quality = 0.5;
    
    // Length factor
    const length = fact.length;
    if (length > 20 && length < 200) quality += 0.2;
    if (length > 200) quality -= 0.1;
    
    // Specificity factor
    if (/\d+/.test(fact)) quality += 0.1; // Contains numbers
    if (/[A-Z][a-z]+/.test(fact)) quality += 0.1; // Contains proper nouns
    
    // Completeness factor
    if (fact.includes('because') || fact.includes('due to')) quality += 0.1;
    if (fact.endsWith('.') || fact.endsWith('!')) quality += 0.05;
    
    return Math.min(1.0, quality);
}

// Enhanced relevance score calculation
function calculateRelevanceScore(fact, category) {
    const factLower = fact.toLowerCase();
    let relevance = 0.5;
    
    // Category-specific keywords
    const categoryKeywords = {
        'financial': ['money', 'investment', 'portfolio', 'return', 'risk'],
        'trading': ['trade', 'position', 'market', 'buy', 'sell'],
        'cambodia_fund': ['cambodia', 'fund', 'lending', 'real estate'],
        'personal': ['name', 'work', 'live', 'from', 'age'],
        'risk': ['risk', 'loss', 'volatility', 'hedge', 'exposure'],
        'strategic': ['strategy', 'plan', 'goal', 'objective', 'approach']
    };
    
    const keywords = categoryKeywords[category] || [];
    const matchCount = keywords.filter(keyword => factLower.includes(keyword)).length;
    
    relevance += (match

// ENHANCED MEMORY.JS - PART 8: PERFORMANCE & LEGACY FUNCTIONS

Count / keywords.length) * 0.3;
    
    return Math.min(1.0, relevance);
}

// Enhanced uniqueness score calculation
function calculateUniquenessScore(fact) {
    // This would ideally compare against existing facts
    // For now, use content-based heuristics
    let uniqueness = 0.7; // Base assumption
    
    // Common phrases reduce uniqueness
    const commonPhrases = ['i like', 'i prefer', 'i think', 'i believe'];
    if (commonPhrases.some(phrase => fact.toLowerCase().includes(phrase))) {
        uniqueness -= 0.2;
    }
    
    // Specific details increase uniqueness
    if (/\d+%/.test(fact)) uniqueness += 0.1; // Percentages
    if (/\$[\d,]+/.test(fact)) uniqueness += 0.1; // Money amounts
    if (/[A-Z][a-z]+ [A-Z][a-z]+/.test(fact)) uniqueness += 0.1; // Proper names
    
    return Math.min(1.0, uniqueness);
}

// Enhanced strategic value assessment
function assessStrategicValue(fact, importance, category) {
    let value = 0;
    
    // Base value from importance
    const importanceValues = {
        'critical': 1.0, 'strategic': 0.9, 'high': 0.7,
        'medium': 0.5, 'low': 0.3, 'contextual': 0.4
    };
    value += importanceValues[importance] || 0.5;
    
    // Category-specific strategic value
    const categoryValues = {
        'cambodia_fund': 1.0,
        'financial': 0.8,
        'risk': 0.9,
        'strategic': 0.8,
        'trading': 0.7,
        'portfolio': 0.8,
        'personal': 0.6,
        'behavioral': 0.6
    };
    value *= categoryValues[category] || 0.5;
    
    return Math.min(1.0, value);
}

/**
 * 📊 ENHANCED PERFORMANCE TRACKING FUNCTIONS
 */

// Update memory performance metrics
function updateMemoryPerformanceMetrics(chatId, operation, processingTime, success, errorMessage = null) {
    try {
        const chatKey = String(chatId);
        
        if (!memoryPerformanceMetrics.has(chatKey)) {
            memoryPerformanceMetrics.set(chatKey, {
                operations: [],
                totalOperations: 0,
                successfulOperations: 0,
                averageProcessingTime: 0,
                lastUpdated: new Date().toISOString()
            });
        }
        
        const metrics = memoryPerformanceMetrics.get(chatKey);
        
        // Add operation record
        const operationRecord = {
            operation: operation,
            processingTime: processingTime,
            success: success,
            timestamp: new Date().toISOString(),
            errorMessage: errorMessage
        };
        
        metrics.operations.push(operationRecord);
        metrics.totalOperations++;
        
        if (success) {
            metrics.successfulOperations++;
        }
        
        // Keep only last 100 operations
        if (metrics.operations.length > 100) {
            metrics.operations = metrics.operations.slice(-100);
        }
        
        // Update average processing time
        const recentOperations = metrics.operations.slice(-20); // Last 20 operations
        metrics.averageProcessingTime = recentOperations.reduce((sum, op) => sum + op.processingTime, 0) / recentOperations.length;
        
        metrics.lastUpdated = new Date().toISOString();
        
    } catch (error) {
        console.error('Performance metrics update error:', error.message);
    }
}

// Get conversation intelligence cache
function getConversationIntelligenceCache(chatId) {
    const chatKey = String(chatId);
    return conversationIntelligence.get(chatKey) || null;
}

// Update conversation intelligence cache
function updateConversationIntelligenceCache(chatId, conversationIntel) {
    try {
        const chatKey = String(chatId);
        
        if (!conversationIntelligence.has(chatKey)) {
            conversationIntelligence.set(chatKey, {
                recentAnalysis: [],
                dominantTypes: [],
                preferredComplexity: 'medium',
                engagementStyle: 'analytical',
                lastUpdated: new Date().toISOString()
            });
        }
        
        const cache = conversationIntelligence.get(chatKey);
        
        // Add recent analysis
        cache.recentAnalysis.push({
            ...conversationIntel,
            cacheTimestamp: new Date().toISOString()
        });
        
        // Keep only last 50 analyses
        if (cache.recentAnalysis.length > 50) {
            cache.recentAnalysis = cache.recentAnalysis.slice(-50);
        }
        
        // Update dominant types
        const typeFrequency = {};
        cache.recentAnalysis.forEach(analysis => {
            const type = analysis.conversationType || 'general';
            typeFrequency[type] = (typeFrequency[type] || 0) + 1;
        });
        
        cache.dominantTypes = Object.entries(typeFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([type]) => type);
        
        // Update preferred complexity
        const complexities = cache.recentAnalysis
            .map(a => a.contentAnalysis?.complexityLevel)
            .filter(Boolean);
        
        if (complexities.length > 0) {
            const complexityFreq = {};
            complexities.forEach(c => complexityFreq[c] = (complexityFreq[c] || 0) + 1);
            cache.preferredComplexity = Object.entries(complexityFreq)
                .sort(([,a], [,b]) => b - a)[0][0];
        }
        
        cache.lastUpdated = new Date().toISOString();
        
    } catch (error) {
        console.error('Conversation intelligence cache update error:', error.message);
    }
}

/**
 * 🏪 ENHANCED STORAGE MANAGEMENT FUNCTIONS
 */

// Get stored trading patterns
function getStoredTradingPatterns(chatId) {
    const chatKey = String(chatId);
    return tradingPatterns.get(chatKey) || [];
}

// Save enhanced trading patterns
async function saveEnhancedTradingPatterns(chatId, patterns) {
    try {
        const chatKey = String(chatId);
        
        if (!tradingPatterns.has(chatKey)) {
            tradingPatterns.set(chatKey, []);
        }
        
        const existingPatterns = tradingPatterns.get(chatKey);
        
        // Add new patterns with enhanced metadata
        const enhancedPatterns = patterns.map(pattern => ({
            ...pattern,
            storageTimestamp: new Date().toISOString(),
            patternId: generateMemoryId(chatId, pattern.description),
            validationScore: calculatePatternValidationScore(pattern),
            strategicRelevance: assessPatternStrategicRelevance(pattern)
        }));
        
        // Merge and deduplicate
        const allPatterns = [...existingPatterns, ...enhancedPatterns];
        const uniquePatterns = deduplicatePatterns(allPatterns);
        
        // Keep only the most relevant patterns
        const sortedPatterns = uniquePatterns
            .sort((a, b) => (b.confidence * b.strategicRelevance) - (a.confidence * a.strategicRelevance))
            .slice(0, ENHANCED_MEMORY_CONFIG.MAX_TRADING_PATTERNS_PER_USER);
        
        tradingPatterns.set(chatKey, sortedPatterns);
        
        // Try to save to database as well
        try {
            for (const pattern of enhancedPatterns) {
                await saveTradingPattern(chatId, pattern).catch(console.error);
            }
        } catch (dbError) {
            console.log('Trading patterns database save failed, using memory storage');
        }
        
        console.log(`💹 Enhanced trading patterns saved: ${enhancedPatterns.length} new patterns`);
        return true;
        
    } catch (error) {
        console.error('Save enhanced trading patterns error:', error.message);
        return false;
    }
}

// Save strategic insights
async function saveStrategicInsights(chatId, insights) {
    try {
        const chatKey = String(chatId);
        
        if (!strategicInsights.has(chatKey)) {
            strategicInsights.set(chatKey, []);
        }
        
        const existingInsights = strategicInsights.get(chatKey);
        
        // Add new insights with enhanced metadata
        const enhancedInsights = insights.map(insight => ({
            ...insight,
            storageTimestamp: new Date().toISOString(),
            insightId: generateMemoryId(chatId, insight.insight),
            validationScore: calculateInsightValidationScore(insight),
            applicabilityScore: assessInsightApplicability(insight)
        }));
        
        const allInsights = [...existingInsights, ...enhancedInsights];
        
        // Sort by strategic value and keep top insights
        const sortedInsights = allInsights
            .sort((a, b) => (b.strategicWeight * b.confidence) - (a.strategicWeight * a.confidence))
            .slice(0, ENHANCED_MEMORY_CONFIG.MAX_STRATEGIC_INSIGHTS_PER_USER);
        
        strategicInsights.set(chatKey, sortedInsights);
        
        console.log(`🎯 Strategic insights saved: ${enhancedInsights.length} new insights`);
        return true;
        
    } catch (error) {
        console.error('Save strategic insights error:', error.message);
        return false;
    }
}

// Save behavioral patterns
async function saveBehavioralPatterns(chatId, patterns) {
    try {
        // For now, integrate with trading patterns storage
        // In future, could have separate behavioral pattern storage
        return await saveEnhancedTradingPatterns(chatId, patterns.map(p => ({
            ...p,
            type: `BEHAVIORAL_${p.type}`,
            category: 'behavioral'
        })));
        
    } catch (error) {
        console.error('Save behavioral patterns error:', error.message);
        return false;
    }
}

// Get stored market intelligence
function getStoredMarketIntelligence(chatId) {
    const chatKey = String(chatId);
    return enhancedMemoryCache.get(chatKey)?.marketIntelligence || [];
}

/**
 * 🔄 LEGACY COMPATIBILITY FUNCTIONS
 */

// Legacy conversation history function
async function getConversationHistory(chatId, limit = 10) {
    try {
        const chatKey = String(chatId);
        const userConversations = conversations.get(chatKey) || [];
        console.log(`🔍 Retrieved ${userConversations.length} conversations for ${chatId}`);
        return userConversations.slice(-limit);
    } catch (error) {
        console.error('Get conversation history error:', error.message);
        return [];
    }
}

// Legacy persistent memory function
async function getPersistentMemory(chatId) {
    try {
        const chatKey = String(chatId);
        const memories = persistentMemories.get(chatKey) || [];
        console.log(`🧠 Retrieved ${memories.length} persistent memories for ${chatId}`);
        return memories;
    } catch (error) {
        console.error('Get persistent memory error:', error.message);
        return [];
    }
}

// Legacy user profile function
async function getEnhancedUserProfile(chatId) {
    try {
        const chatKey = String(chatId);
        const profile = userProfiles.get(chatKey) || null;
        console.log(`👤 Retrieved profile for ${chatId}:`, profile ? 'Found' : 'Not found');
        return profile;
    } catch (error) {
        console.error('Get enhanced user profile error:', error.message);
        return null;
    }
}

// Legacy user profile update
async function updateEnhancedUserProfile(chatId, userMessage, gptResponse, conversationIntel) {
    try {
        const chatKey = String(chatId);
        
        if (!userProfiles.has(chatKey)) {
            userProfiles.set(chatKey, {
                chatId: chatId,
                conversationCount: 0,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                preferences: {},
                strategicProfile: {}
            });
        }
        
        const profile = userProfiles.get(chatKey);
        profile.conversationCount++;
        profile.lastSeen = new Date().toISOString();
        
        // Extract and update preferences
        if (userMessage.toLowerCase().includes('prefer')) {
            profile.preferences.communicationStyle = 'detailed';
        }
        
        // Update strategic profile based on conversation intelligence
        if (conversationIntel) {
            if (conversationIntel.conversationType) {
                profile.strategicProfile.preferredAnalysisType = conversationIntel.conversationType;
            }
            if (conversationIntel.contentAnalysis?.complexityLevel) {
                profile.strategicProfile.preferredComplexity = conversationIntel.contentAnalysis.complexityLevel;
            }
        }
        
        return profile;
        
    } catch (error) {
        console.error('Update enhanced user profile error:', error.message);
        return null;
    }
}

// Legacy conversation stats function
async function getConversationStats() {
    try {
        const totalUsers = userProfiles.size;
        let totalConversations = 0;
        let totalMemories = 0;
        let todayConversations = 0;
        
        const today = new Date().toDateString();
        
        for (const userConvs of conversations.values()) {
            totalConversations += userConvs.length;
            todayConversations += userConvs.filter(conv => 
                new Date(conv.timestamp).toDateString() === today
            ).length;
        }
        
        for (const memories of persistentMemories.values()) {
            totalMemories += memories.length;
        }
        
        const totalPatterns = Array.from(tradingPatterns.values()).reduce((sum, patterns) => sum + patterns.length, 0);
        const totalInsights = Array.from(strategicInsights.values()).reduce((sum, insights) => sum + insights.length, 0);
        
        return {
            totalUsers,
            totalConversations,
            totalMemories,
            todayConversations,
            avgConversationsPerUser: totalUsers > 0 ? (totalConversations / totalUsers).toFixed(1) : 0,
            strategicInsightsGenerated: totalInsights,
            tradingPatternsIdentified: totalPatterns,
            memoryIntelligenceLevel: assessSystemMemoryIntelligence(),
            enhancedFeaturesActive: true
        };
    } catch (error) {
        console.error('Get conversation stats error:', error.message);
        return {
            totalUsers: 0,
            totalConversations: 0,
            totalMemories: 0,
            todayConversations: 0,
            avgConversationsPerUser: 0,
            strategicInsightsGenerated: 0,
            tradingPatternsIdentified: 0,
            error: error.message
        };
    }
}

// System memory intelligence assessment
function assessSystemMemoryIntelligence() {
    const totalUsers = conversations.size;
    const totalMemories = Array.from(persistentMemories.values()).reduce((sum, mem) => sum + mem.length, 0);
    const totalInsights = Array.from(strategicInsights.values()).reduce((sum, ins) => sum + ins.length, 0);
    
    const intelligenceScore = (totalMemories * 0.5) + (totalInsights * 1.0) + (totalUsers * 0.3);
    
    if (intelligenceScore > 500) return 'EXPERT';
    if (intelligenceScore > 200) return 'ADVANCED';
    if (intelligenceScore > 50) return 'INTERMEDIATE';
    if (intelligenceScore > 10) return 'DEVELOPING';
    return 'BASIC';
}

// Legacy clear data function
async function clearAllData(chatId = null) {
    try {
        if (chatId) {
            const chatKey = String(chatId);
            conversations.delete(chatKey);
            userProfiles.delete(chatKey);
            persistentMemories.delete(chatKey);
            strategicInsights.delete(chatKey);
            tradingPatterns.delete(chatKey);
            conversationIntelligence.delete(chatKey);
            enhancedMemoryCache.delete(chatKey);
            memoryPerformanceMetrics.delete(chatKey);
            
            console.log(`🗑️ Cleared all enhanced data for user ${chatId}`);
            return `Cleared enhanced strategic data for user ${chatId}`;
        } else {
            conversations.clear();
            userProfiles.clear();
            persistentMemories.clear();
            strategicInsights.clear();
            tradingPatterns.clear();
            conversationIntelligence.clear();
            enhancedMemoryCache.clear();
            memoryPerformanceMetrics.clear();
            
            console.log('🗑️ Cleared all enhanced strategic user data');
            return 'Cleared all enhanced strategic user data';
        }
    } catch (error) {
        console.error('Clear enhanced data error:', error.message);
        return `Error clearing enhanced data: ${error.message}`;
    }
}

// Main module exports
module.exports = {
    // 🎯 ENHANCED STRATEGIC FUNCTIONS
    saveConversation,
    buildConversationContext,
    extractAndSaveFacts,
    addPersistentMemory,
    
    // 📊 ENHANCED ANALYTICS & INTELLIGENCE
    getEnhancedMemoryAnalytics,
    searchEnhancedStrategicMemory,
    getEnhancedStrategicUserProfile,
    analyzeConversationIntelligence,
    
    // 🧠 ENHANCED EXTRACTION & PROCESSING
    extractEnhancedStrategicFacts,
    extractEnhancedTradingPatterns,
    extractStrategicInsights,
    extractBehavioralPatterns,
    
    // 🔧 ENHANCED UTILITIES
    optimizeEnhancedMemoryStorage,
    updateMemoryPerformanceMetrics,
    getConversationIntelligenceCache,
    updateConversationIntelligenceCache,
    
    // 💾 ENHANCED STORAGE
    saveEnhancedTradingPatterns,
    saveStrategicInsights,
    saveBehavioralPatterns,
    getStoredTradingPatterns,
    getStoredMarketIntelligence,
    
    // 🏛️ ENHANCED CATEGORIES & LEVELS
    MEMORY_CATEGORIES,
    IMPORTANCE_LEVELS,
    CONVERSATION_INTELLIGENCE_TYPES,
    ENHANCED_MEMORY_CONFIG,
    
    // 🔄 LEGACY COMPATIBILITY
    getConversationHistory,
    getConversationStats,
    getEnhancedUserProfile,
    updateEnhancedUserProfile,
    getPersistentMemory,
    clearAllData,
    
    // Legacy aliases
    getUserProfile: getEnhancedUserProfile,
    updateUserPreferences: updateEnhancedUserProfile
};
