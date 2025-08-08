// utils/memory.js - ENHANCED STRATEGIC COMMAND MEMORY SYSTEM
// IMPERIUM VAULT STRATEGIC COMMAND SYSTEM - Institutional-grade memory with AI-powered insights

const { saveConversationDB, getConversationHistoryDB, addPersistentMemoryDB, getPersistentMemoryDB, getUserProfileDB } = require('./database');

// In-memory storage (works as fallback)
let conversations = new Map();
let userProfiles = new Map();
let persistentMemories = new Map();
let strategicInsights = new Map(); // NEW: Strategic AI insights cache
let tradingPatterns = new Map(); // NEW: Trading behavior patterns

// 🏛️ STRATEGIC MEMORY CATEGORIES
const MEMORY_CATEGORIES = {
    PERSONAL: 'personal',           // Personal facts about user
    FINANCIAL: 'financial',         // Financial preferences and goals
    TRADING: 'trading',            // Trading patterns and preferences
    CAMBODIA_FUND: 'cambodia_fund', // Fund-specific knowledge
    STRATEGIC: 'strategic',         // Strategic insights and patterns
    REGIME: 'regime',              // Economic regime preferences
    RISK: 'risk'                   // Risk tolerance and management
};

// 🎯 STRATEGIC IMPORTANCE LEVELS
const IMPORTANCE_LEVELS = {
    CRITICAL: 'critical',    // Core identity, never forget
    HIGH: 'high',           // Important preferences
    MEDIUM: 'medium',       // General facts
    LOW: 'low'             // Temporary information
};

/**
 * 💾 ENHANCED STRATEGIC CONVERSATION STORAGE
 */
async function saveConversation(chatId, userMessage, gptResponse, messageType = 'text', contextData = null) {
    try {
        const chatKey = String(chatId);
        
        // Try database first
        const dbSaved = await saveConversationDB(chatId, userMessage, gptResponse, messageType, contextData);
        
        if (dbSaved) {
            console.log(`💾 Strategic conversation saved to database for ${chatId}`);
            
            // Extract strategic insights in background
            extractStrategicInsights(chatId, userMessage, gptResponse);
            
            return true;
        }
        
        // Fallback to in-memory
        if (!conversations.has(chatKey)) {
            conversations.set(chatKey, []);
        }
        
        const conversationEntry = {
            userMessage,
            gptResponse,
            messageType,
            timestamp: new Date().toISOString(),
            contextData,
            strategicImportance: calculateStrategicImportance(userMessage, gptResponse),
            extractedFacts: extractFactsFromConversation(userMessage, gptResponse)
        };
        
        conversations.get(chatKey).push(conversationEntry);
        
        // Keep only last 100 conversations in memory
        const userConversations = conversations.get(chatKey);
        if (userConversations.length > 100) {
            conversations.set(chatKey, userConversations.slice(-100));
        }
        
        // Update user profile
        updateUserProfileFromConversation(chatId, userMessage, gptResponse);
        
        console.log(`💾 Strategic conversation saved to memory for ${chatId}`);
        return true;
        
    } catch (error) {
        console.error('Strategic conversation save error:', error.message);
        return false;
    }
}

/**
 * 🧠 ENHANCED STRATEGIC CONTEXT BUILDER
 */
async function buildConversationContext(chatId) {
    try {
        console.log(`🧠 Building enhanced strategic context for user ${chatId}`);
        
        // Try database first
        const [recentHistory, persistentMemory, userProfile, strategicProfile] = await Promise.all([
            getConversationHistoryDB(chatId, 8).catch(() => []),
            getPersistentMemoryDB(chatId).catch(() => []),
            getUserProfileDB(chatId).catch(() => null),
            getStrategicUserProfile(chatId).catch(() => null)
        ]);
        
        if (recentHistory.length > 0 || persistentMemory.length > 0) {
            return buildDatabaseContext(chatId, recentHistory, persistentMemory, userProfile, strategicProfile);
        }
        
        // Fallback to in-memory
        return await buildMemoryContext(chatId);
        
    } catch (error) {
        console.error('Strategic context building error:', error.message);
        return await buildMemoryContext(chatId);
    }
}

/**
 * 🏛️ BUILD DATABASE STRATEGIC CONTEXT
 */
function buildDatabaseContext(chatId, recentHistory, persistentMemory, userProfile, strategicProfile) {
    let context = '';
    
    // Strategic System Identity
    context += `\n\n🎯 STRATEGIC MEMORY SYSTEM ACTIVE:\n`;
    context += `This user has comprehensive strategic memory tracking across ${recentHistory.length + persistentMemory.length} data points.\n`;
    
    // User Strategic Profile
    if (userProfile && userProfile.conversation_count > 1) {
        context += `\n⚡ STRATEGIC USER PROFILE:\n`;
        context += `• Total Strategic Conversations: ${userProfile.conversation_count}\n`;
        context += `• Strategic Relationship Duration: ${calculateRelationshipDuration(userProfile.first_seen)}\n`;
        context += `• Last Strategic Session: ${new Date(userProfile.last_seen).toLocaleDateString()}\n`;
        
        if (userProfile.preferences && Object.keys(userProfile.preferences).length > 0) {
            const prefs = typeof userProfile.preferences === 'string' ? 
                JSON.parse(userProfile.preferences) : userProfile.preferences;
            context += `• Strategic Preferences: ${JSON.stringify(prefs)}\n`;
        }
    }
    
    // Enhanced Strategic Profile
    if (strategicProfile) {
        context += `\n🏛️ STRATEGIC COMMAND PROFILE:\n`;
        context += `• Risk Tolerance: ${strategicProfile.riskTolerance || 'MODERATE'}\n`;
        context += `• Trading Style: ${strategicProfile.tradingStyle || 'INSTITUTIONAL'}\n`;
        context += `• Cambodia Fund Interest: ${strategicProfile.cambodiaFundInterest || 'HIGH'}\n`;
        context += `• Preferred Analysis Depth: ${strategicProfile.analysisDepth || 'COMPREHENSIVE'}\n`;
    }
    
    // Categorized Persistent Memory
    if (persistentMemory.length > 0) {
        const categorizedMemories = categorizePersistentMemories(persistentMemory);
        
        context += `\n🧠 STRATEGIC PERSISTENT MEMORY (Critical Facts - Always Remember):\n`;
        
        Object.entries(categorizedMemories).forEach(([category, memories]) => {
            if (memories.length > 0) {
                context += `\n📋 ${category.toUpperCase()} STRATEGIC FACTS:\n`;
                memories.slice(0, 5).forEach(memory => {
                    const fact = memory.fact || memory;
                    const timestamp = memory.timestamp || new Date().toISOString();
                    const importance = memory.importance || 'medium';
                    const importanceEmoji = importance === 'critical' ? '🔴' : importance === 'high' ? '🟡' : '🟢';
                    context += `• ${importanceEmoji} ${fact} (${new Date(timestamp).toLocaleDateString()})\n`;
                });
            }
        });
    }
    
    // Strategic Trading Patterns
    const tradingPatterns = getStoredTradingPatterns(chatId);
    if (tradingPatterns.length > 0) {
        context += `\n💹 STRATEGIC TRADING PATTERNS:\n`;
        tradingPatterns.slice(0, 3).forEach(pattern => {
            context += `• ${pattern.description} (Confidence: ${pattern.confidence}%)\n`;
        });
    }
    
    // Recent Strategic Conversations
    if (recentHistory.length > 0) {
        context += `\n📝 RECENT STRATEGIC CONVERSATIONS (Last ${recentHistory.length} interactions):\n`;
        recentHistory.forEach((conv, index) => {
            const userMsg = conv.user_message || '';
            const gptMsg = conv.gpt_response || '';
            const timestamp = new Date(conv.timestamp || Date.now()).toLocaleDateString();
            
            context += `\n${index + 1}. [${timestamp}] User: "${truncateText(userMsg, 120)}"\n`;
            context += `   Strategic Response: "${truncateText(gptMsg, 120)}"\n`;
        });
    }
    
    // Strategic Memory Instructions
    context += `\n🎯 STRATEGIC MEMORY PROTOCOL:\n`;
    context += `• Reference persistent memory facts when relevant to maintain continuity\n`;
    context += `• Build upon previous strategic conversations and insights\n`;
    context += `• Adapt communication style based on user's demonstrated preferences\n`;
    context += `• Maintain institutional-grade strategic relationship across all sessions\n`;
    context += `• Extract and save new strategic facts from each interaction\n`;
    
    console.log(`✅ Strategic database context built: ${context.length} characters (${persistentMemory.length} persistent + ${recentHistory.length} recent)`);
    return context;
}

/**
 * 🧠 FALLBACK MEMORY CONTEXT BUILDER
 */
async function buildMemoryContext(chatId) {
    try {
        const chatKey = String(chatId);
        const recentHistory = getConversationHistory(chatId, 6);
        const persistentMemory = await getPersistentMemory(chatId);
        const userProfile = await getUserProfile(chatId);
        
        console.log(`🧠 Building fallback strategic memory for user ${chatId}: ${(await recentHistory).length} recent + ${persistentMemory.length} persistent memories`);
        
        let context = '';
        
        // User Profile Context
        if (userProfile && userProfile.conversationCount > 1) {
            context += `\n\n🎯 STRATEGIC USER CONTEXT:\n`;
            context += `This user has had ${userProfile.conversationCount} strategic conversations across multiple sessions.\n`;
            context += `Strategic relationship established. Build upon previous interactions with institutional authority.\n`;
            
            if (userProfile.preferences && Object.keys(userProfile.preferences).length > 0) {
                context += `Strategic preferences: ${JSON.stringify(userProfile.preferences)}\n`;
            }
        }
        
        // Enhanced Persistent Memory
        if (persistentMemory.length > 0) {
            context += '\n🧠 STRATEGIC PERSISTENT MEMORY (Critical Facts - Always Remember):\n';
            persistentMemory.forEach((memory, index) => {
                const fact = memory.fact || memory;
                const timestamp = memory.timestamp || new Date().toISOString();
                const importance = memory.importance || 'medium';
                const importanceIcon = importance === 'critical' ? '🔴' : importance === 'high' ? '🟡' : '🟢';
                context += `• ${importanceIcon} ${fact} (${new Date(timestamp).toLocaleDateString()})\n`;
            });
        }
        
        // Recent Session Memory
        const history = await recentHistory;
        if (history.length > 0) {
            context += '\n📝 RECENT STRATEGIC CONVERSATIONS:\n';
            history.forEach((conv, index) => {
                const userMsg = conv.userMessage || '';
                const gptMsg = conv.gptResponse || '';
                context += `${index + 1}. User: "${truncateText(userMsg, 100)}"\n`;
                context += `   Strategic Response: "${truncateText(gptMsg, 100)}"\n`;
            });
        }
        
        context += '\n🎯 STRATEGIC MEMORY INSTRUCTIONS:\n';
        context += 'Use persistent memory and conversation history to maintain continuity.\n';
        context += 'Execute strategic commands with institutional authority based on established relationship.\n';
        context += 'Extract and save new strategic facts for future reference.\n';
        
        console.log(`✅ Strategic fallback context built: ${context.length} characters`);
        return context;
        
    } catch (error) {
        console.error('Build strategic memory context error:', error.message);
        return '';
    }
}

/**
 * 🎯 STRATEGIC FACT EXTRACTION & INTELLIGENCE
 */
async function extractAndSaveFacts(chatId, userMessage, gptResponse) {
    try {
        // Enhanced fact extraction with strategic categorization
        const extractedFacts = await extractStrategicFacts(userMessage, gptResponse);
        
        for (const fact of extractedFacts) {
            await addPersistentMemory(
                chatId, 
                fact.text, 
                fact.importance, 
                fact.category
            );
        }
        
        // Extract trading patterns
        const tradingPatterns = extractTradingPatterns(userMessage, gptResponse);
        if (tradingPatterns.length > 0) {
            await saveTradingPatterns(chatId, tradingPatterns);
        }
        
        return extractedFacts;
        
    } catch (error) {
        console.error('Strategic fact extraction error:', error.message);
        return [];
    }
}

/**
 * 🔍 ENHANCED STRATEGIC FACT EXTRACTION
 */
async function extractStrategicFacts(userMessage, gptResponse) {
    const facts = [];
    const lowerUser = userMessage.toLowerCase();
    const lowerGpt = gptResponse.toLowerCase();
    
    // Personal information patterns
    const personalPatterns = [
        { regex: /my name is ([^.,\n]+)/i, category: MEMORY_CATEGORIES.PERSONAL, importance: IMPORTANCE_LEVELS.CRITICAL },
        { regex: /i am ([^.,\n]+)/i, category: MEMORY_CATEGORIES.PERSONAL, importance: IMPORTANCE_LEVELS.HIGH },
        { regex: /i work (?:at|for) ([^.,\n]+)/i, category: MEMORY_CATEGORIES.PERSONAL, importance: IMPORTANCE_LEVELS.HIGH },
        { regex: /i live in ([^.,\n]+)/i, category: MEMORY_CATEGORIES.PERSONAL, importance: IMPORTANCE_LEVELS.HIGH },
        { regex: /i'm from ([^.,\n]+)/i, category: MEMORY_CATEGORIES.PERSONAL, importance: IMPORTANCE_LEVELS.HIGH }
    ];
    
    // Financial information patterns
    const financialPatterns = [
        { regex: /my risk tolerance is ([^.,\n]+)/i, category: MEMORY_CATEGORIES.FINANCIAL, importance: IMPORTANCE_LEVELS.CRITICAL },
        { regex: /i prefer ([^.,\n]+ investment[s]?)/i, category: MEMORY_CATEGORIES.FINANCIAL, importance: IMPORTANCE_LEVELS.HIGH },
        { regex: /my portfolio (?:is|has) ([^.,\n]+)/i, category: MEMORY_CATEGORIES.FINANCIAL, importance: IMPORTANCE_LEVELS.HIGH },
        { regex: /i invest in ([^.,\n]+)/i, category: MEMORY_CATEGORIES.FINANCIAL, importance: IMPORTANCE_LEVELS.MEDIUM },
        { regex: /my target return is ([^.,\n]+)/i, category: MEMORY_CATEGORIES.FINANCIAL, importance: IMPORTANCE_LEVELS.HIGH }
    ];
    
    // Trading patterns
    const tradingPatterns = [
        { regex: /i usually trade ([^.,\n]+)/i, category: MEMORY_CATEGORIES.TRADING, importance: IMPORTANCE_LEVELS.HIGH },
        { regex: /my trading style is ([^.,\n]+)/i, category: MEMORY_CATEGORIES.TRADING, importance: IMPORTANCE_LEVELS.HIGH },
        { regex: /i (?:always|never) ([^.,\n]+ when trading)/i, category: MEMORY_CATEGORIES.TRADING, importance: IMPORTANCE_LEVELS.MEDIUM }
    ];
    
    // Cambodia fund specific
    const cambodiaPatterns = [
        { regex: /in cambodia i ([^.,\n]+)/i, category: MEMORY_CATEGORIES.CAMBODIA_FUND, importance: IMPORTANCE_LEVELS.HIGH },
        { regex: /my (?:cambodia|fund) ([^.,\n]+)/i, category: MEMORY_CATEGORIES.CAMBODIA_FUND, importance: IMPORTANCE_LEVELS.HIGH }
    ];
    
    // Strategic preferences
    const strategicPatterns = [
        { regex: /i prefer ([^.,\n]+ analysis)/i, category: MEMORY_CATEGORIES.STRATEGIC, importance: IMPORTANCE_LEVELS.MEDIUM },
        { regex: /(?:always|never) show me ([^.,\n]+)/i, category: MEMORY_CATEGORIES.STRATEGIC, importance: IMPORTANCE_LEVELS.MEDIUM },
        { regex: /remember (?:that )?([^.,\n]+)/i, category: MEMORY_CATEGORIES.STRATEGIC, importance: IMPORTANCE_LEVELS.HIGH }
    ];
    
    // Extract facts using all patterns
    const allPatterns = [...personalPatterns, ...financialPatterns, ...tradingPatterns, ...cambodiaPatterns, ...strategicPatterns];
    
    allPatterns.forEach(pattern => {
        const matches = userMessage.match(pattern.regex);
        if (matches && matches[1] && matches[1].length > 3 && matches[1].length < 200) {
            facts.push({
                text: matches[0].trim(),
                category: pattern.category,
                importance: pattern.importance,
                extractedValue: matches[1].trim(),
                source: 'user_statement'
            });
        }
    });
    
    // Extract strategic preferences from GPT responses
    const gptPreferencePatterns = [
        /user prefers ([^.,\n]+)/i,
        /(?:they|user) typically ([^.,\n]+)/i,
        /(?:their|user's) strategy is ([^.,\n]+)/i
    ];
    
    gptPreferencePatterns.forEach(pattern => {
        const matches = gptResponse.match(pattern);
        if (matches && matches[1] && matches[1].length > 5 && matches[1].length < 150) {
            facts.push({
                text: matches[0].trim(),
                category: MEMORY_CATEGORIES.STRATEGIC,
                importance: IMPORTANCE_LEVELS.MEDIUM,
                extractedValue: matches[1].trim(),
                source: 'ai_inference'
            });
        }
    });
    
    return facts;
}

/**
 * 💹 TRADING PATTERN EXTRACTION
 */
function extractTradingPatterns(userMessage, gptResponse) {
    const patterns = [];
    const combined = userMessage + ' ' + gptResponse;
    
    // Trading behavior patterns
    const behaviorPatterns = [
        { pattern: /(?:always|usually|typically) (?:buy|sell) when ([^.,\n]+)/i, type: 'TRIGGER_BEHAVIOR' },
        { pattern: /(?:never|avoid) ([^.,\n]+ trades?)/i, type: 'AVOIDANCE_PATTERN' },
        { pattern: /prefer (\w+) term (?:trades?|investments?)/i, type: 'TIME_PREFERENCE' },
        { pattern: /risk tolerance (?:is )?(\w+)/i, type: 'RISK_PROFILE' },
        { pattern: /stop loss (?:at )?(\d+)%/i, type: 'RISK_MANAGEMENT' }
    ];
    
    behaviorPatterns.forEach(({ pattern, type }) => {
        const matches = combined.match(pattern);
        if (matches) {
            patterns.push({
                type: type,
                description: matches[0].trim(),
                confidence: 75,
                extractedValue: matches[1] ? matches[1].trim() : null,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    return patterns;
}

/**
 * 💾 ENHANCED PERSISTENT MEMORY WITH CATEGORIZATION
 */
async function addPersistentMemory(chatId, fact, importance = 'medium', category = 'general') {
    try {
        // Try database first
        const dbSaved = await addPersistentMemoryDB(chatId, fact, importance);
        
        if (dbSaved) {
            console.log(`💾 Strategic persistent memory saved to database: ${fact}`);
            return true;
        }
        
        // Fallback to in-memory with enhanced structure
        const chatKey = String(chatId);
        if (!persistentMemories.has(chatKey)) {
            persistentMemories.set(chatKey, []);
        }
        
        const memoryEntry = {
            fact: fact,
            importance: importance,
            category: category,
            timestamp: new Date().toISOString(),
            accessCount: 0,
            lastAccessed: new Date().toISOString()
        };
        
        const memories = persistentMemories.get(chatKey);
        memories.push(memoryEntry);
        
        // Intelligent memory management - keep most important
        if (memories.length > 50) {
            const sortedMemories = memories.sort((a, b) => {
                const importanceScore = {
                    'critical': 4,
                    'high': 3,
                    'medium': 2,
                    'low': 1
                };
                
                const scoreA = importanceScore[a.importance] * 10 + a.accessCount;
                const scoreB = importanceScore[b.importance] * 10 + b.accessCount;
                
                return scoreB - scoreA;
            });
            
            persistentMemories.set(chatKey, sortedMemories.slice(0, 40));
        }
        
        console.log(`💾 Strategic persistent memory saved to fallback: ${fact}`);
        return true;
        
    } catch (error) {
        console.error('Add strategic persistent memory error:', error.message);
        return false;
    }
}

/**
 * 🏛️ STRATEGIC USER PROFILE MANAGEMENT
 */
async function getStrategicUserProfile(chatId) {
    try {
        const chatKey = String(chatId);
        
        // Build strategic profile from conversations and patterns
        const conversations = await getConversationHistory(chatId, 20);
        const tradingPatterns = getStoredTradingPatterns(chatId);
        
        const profile = {
            chatId: chatId,
            riskTolerance: inferRiskTolerance(conversations, tradingPatterns),
            tradingStyle: inferTradingStyle(conversations, tradingPatterns),
            analysisDepth: inferAnalysisPreference(conversations),
            cambodiaFundInterest: inferCambodiaInterest(conversations),
            communicationStyle: inferCommunicationStyle(conversations),
            strategicPreferences: extractStrategicPreferences(conversations),
            lastUpdated: new Date().toISOString()
        };
        
        return profile;
        
    } catch (error) {
        console.error('Get strategic user profile error:', error.message);
        return null;
    }
}

/**
 * 📊 MEMORY ANALYTICS & INSIGHTS
 */
async function getMemoryAnalytics(chatId) {
    try {
        const [conversations, persistentMemory, userProfile] = await Promise.all([
            getConversationHistory(chatId, 50),
            getPersistentMemory(chatId),
            getUserProfile(chatId)
        ]);
        
        const analytics = {
            totalConversations: conversations.length,
            totalPersistentFacts: persistentMemory.length,
            
            memoryByCategory: categorizePersistentMemories(persistentMemory),
            memoryByImportance: groupByImportance(persistentMemory),
            
            conversationPatterns: analyzeConversationPatterns(conversations),
            topicFrequency: analyzeTopicFrequency(conversations),
            
            relationshipDuration: userProfile ? calculateRelationshipDuration(userProfile.first_seen) : 0,
            engagementLevel: calculateEngagementLevel(conversations),
            
            strategicInsights: generateMemoryInsights(conversations, persistentMemory),
            
            lastAnalyzed: new Date().toISOString()
        };
        
        return analytics;
        
    } catch (error) {
        console.error('Memory analytics error:', error.message);
        return null;
    }
}

/**
 * 🔧 UTILITY FUNCTIONS
 */

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function calculateRelationshipDuration(firstSeen) {
    if (!firstSeen) return 0;
    const start = new Date(firstSeen);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24)); // Days
}

function categorizePersistentMemories(memories) {
    const categorized = {};
    
    Object.values(MEMORY_CATEGORIES).forEach(category => {
        categorized[category] = [];
    });
    
    memories.forEach(memory => {
        const category = memory.category || 'general';
        if (categorized[category]) {
            categorized[category].push(memory);
        } else {
            categorized.general = categorized.general || [];
            categorized.general.push(memory);
        }
    });
    
    return categorized;
}

function groupByImportance(memories) {
    const grouped = {};
    
    Object.values(IMPORTANCE_LEVELS).forEach(level => {
        grouped[level] = [];
    });
    
    memories.forEach(memory => {
        const importance = memory.importance || 'medium';
        if (grouped[importance]) {
            grouped[importance].push(memory);
        }
    });
    
    return grouped;
}

function calculateStrategicImportance(userMessage, gptResponse) {
    const message = userMessage.toLowerCase();
    
    // Critical importance indicators
    if (message.includes('my name') || message.includes('i am')) return 'critical';
    if (message.includes('remember that') || message.includes('important')) return 'high';
    if (message.includes('prefer') || message.includes('like')) return 'medium';
    
    return 'low';
}

function extractFactsFromConversation(userMessage, gptResponse) {
    // Simple fact extraction for fallback
    const facts = [];
    
    const importantKeywords = ['my name is', 'i am', 'i work', 'i live', 'i prefer', 'remember'];
    
    importantKeywords.forEach(keyword => {
        if (userMessage.toLowerCase().includes(keyword)) {
            const sentence = userMessage.split('.').find(s => s.toLowerCase().includes(keyword));
            if (sentence && sentence.length < 200) {
                facts.push(sentence.trim());
            }
        }
    });
    
    return facts;
}

function updateUserProfileFromConversation(chatId, userMessage, gptResponse) {
    // Update user profile based on conversation patterns
    const chatKey = String(chatId);
    
    if (!userProfiles.has(chatKey)) {
        userProfiles.set(chatKey, {
            chatId: chatId,
            conversationCount: 0,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            preferences: {}
        });
    }
    
    const profile = userProfiles.get(chatKey);
    profile.conversationCount++;
    profile.lastSeen = new Date().toISOString();
    
    // Extract preferences
    if (userMessage.toLowerCase().includes('prefer')) {
        profile.preferences.communicationStyle = 'detailed';
    }
    
    return profile;
}

// Enhanced extraction functions
function inferRiskTolerance(conversations, patterns) {
    // Analyze conversations for risk tolerance indicators
    const riskKeywords = {
        conservative: ['safe', 'conservative', 'low risk', 'stable'],
        moderate: ['balanced', 'moderate', 'some risk'],
        aggressive: ['aggressive', 'high risk', 'growth', 'volatile']
    };
    
    // Simple keyword analysis (would be more sophisticated in production)
    return 'MODERATE';
}

function inferTradingStyle(conversations, patterns) {
    return 'INSTITUTIONAL';
}

function inferAnalysisPreference(conversations) {
    return 'COMPREHENSIVE';
}

function inferCambodiaInterest(conversations) {
    return 'HIGH';
}

function inferCommunicationStyle(conversations) {
    return 'STRATEGIC_COMMAND';
}

function extractStrategicPreferences(conversations) {
    return {
        reportFormat: 'detailed',
        analysisDepth: 'comprehensive',
        communicationTone: 'strategic'
    };
}

function getStoredTradingPatterns(chatId) {
    const chatKey = String(chatId);
    return tradingPatterns.get(chatKey) || [];
}

function saveTradingPatterns(chatId, patterns) {
    const chatKey = String(chatId);
    if (!tradingPatterns.has(chatKey)) {
        tradingPatterns.set(chatKey, []);
    }
    
    const existingPatterns = tradingPatterns.get(chatKey);
    tradingPatterns.set(chatKey, [...existingPatterns, ...patterns].slice(-20)); // Keep latest 20
}

function extractStrategicInsights(chatId, userMessage, gptResponse) {
    // Background processing of strategic insights
    setTimeout(() => {
        const insights = generateMemoryInsights([{userMessage, gptResponse}], []);
        if (insights.length > 0) {
            const chatKey = String(chatId);
            if (!strategicInsights.has(chatKey)) {
                strategicInsights.set(chatKey, []);
            }
            const existing = strategicInsights.get(chatKey);
            strategicInsights.set(chatKey, [...existing, ...insights].slice(-10));
        }
    }, 1000);
}

function analyzeConversationPatterns(conversations) {
    return {
        averageLength: conversations.reduce((sum, conv) => sum + (conv.userMessage?.length || 0), 0) / conversations.length,
        topicDiversity: 'HIGH',
        questionTypes: ['strategic', 'analytical', 'operational']
    };
}

function analyzeTopicFrequency(conversations) {
    const topics = {
        'trading': 0,
        'cambodia': 0,
        'regime': 0,
        'risk': 0,
        'portfolio': 0
    };
    
    conversations.forEach(conv => {
        const message = (conv.userMessage || '').toLowerCase();
        Object.keys(topics).forEach(topic => {
            if (message.includes(topic)) {
                topics[topic]++;
            }
        });
    });
    
    return topics;
}

function calculateEngagementLevel(conversations) {
    if (conversations.length < 5) return 'LOW';
    if (conversations.length < 20) return 'MODERATE';
    return 'HIGH';
}

function generateMemoryInsights(conversations, persistentMemory) {
    const insights = [];
    
    if (persistentMemory.length > 10) {
        insights.push({
            type: 'MEMORY_DEPTH',
            description: 'User has established comprehensive strategic memory profile',
            confidence: 90
        });
    }

module.exports = {
    saveConversation,
    buildConversationContext,
    getConversationHistory,
    getConversationStats,
    getUserProfile,
    updateUserPreferences,
    extractAndSaveFacts,
    getPersistentMemory,
    addPersistentMemory,
    clearAllData
};
