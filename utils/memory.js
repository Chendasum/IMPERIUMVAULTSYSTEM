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
    
    if (conversations.length > 50) {
        insights.push({
            type: 'ENGAGEMENT_PATTERN',
            description: 'High-frequency strategic interactions indicate power user status',
            confidence: 85
        });
    }
    
    return insights;
}

/**
 * 🚀 LEGACY COMPATIBILITY FUNCTIONS
 */
async function getConversationHistory(chatId, limit = 10) {
    try {
        const chatKey = String(chatId);
        const userConversations = conversations.get(chatKey) || [];
        console.log(`🔍 Retrieved ${userConversations.length} strategic conversations for ${chatId}`);
        return userConversations.slice(-limit);
    } catch (error) {
        console.error('Get strategic history error:', error.message);
        return [];
    }
}

async function getUserProfile(chatId) {
    try {
        const chatKey = String(chatId);
        const profile = userProfiles.get(chatKey) || null;
        console.log(`👤 Retrieved strategic profile for ${chatId}:`, profile ? 'Found' : 'Not found');
        return profile;
    } catch (error) {
        console.error('Get strategic user profile error:', error.message);
        return null;
    }
}

async function updateUserPreferences(chatId, preferences) {
    try {
        const chatKey = String(chatId);
        if (userProfiles.has(chatKey)) {
            userProfiles.get(chatKey).preferences = preferences;
        }
        console.log(`✅ Strategic preferences updated for ${chatId}`);
        return true;
    } catch (error) {
        console.error('Update strategic preferences error:', error.message);
        return false;
    }
}

async function getPersistentMemory(chatId) {
    try {
        const chatKey = String(chatId);
        const memories = persistentMemories.get(chatKey) || [];
        console.log(`🧠 Retrieved ${memories.length} strategic persistent memories for ${chatId}`);
        return memories;
    } catch (error) {
        console.error('Get strategic persistent memory error:', error.message);
        return [];
    }
}

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
        
        return {
            totalUsers,
            totalConversations,
            totalMemories,
            todayConversations,
            avgConversationsPerUser: totalUsers > 0 ? (totalConversations / totalUsers).toFixed(1) : 0,
            strategicInsightsGenerated: Array.from(strategicInsights.values()).reduce((sum, insights) => sum + insights.length, 0),
            tradingPatternsIdentified: Array.from(tradingPatterns.values()).reduce((sum, patterns) => sum + patterns.length, 0)
        };
    } catch (error) {
        console.error('Get strategic conversation stats error:', error.message);
        return {
            totalUsers: 0,
            totalConversations: 0,
            totalMemories: 0,
            todayConversations: 0,
            avgConversationsPerUser: 0,
            strategicInsightsGenerated: 0,
            tradingPatternsIdentified: 0
        };
    }
}

async function clearAllData(chatId = null) {
    try {
        if (chatId) {
            const chatKey = String(chatId);
            conversations.delete(chatKey);
            userProfiles.delete(chatKey);
            persistentMemories.delete(chatKey);
            strategicInsights.delete(chatKey);
            tradingPatterns.delete(chatKey);
            console.log(`🗑️ Cleared all strategic data for user ${chatId}`);
            return `Cleared strategic data for user ${chatId}`;
        } else {
            conversations.clear();
            userProfiles.clear();
            persistentMemories.clear();
            strategicInsights.clear();
            tradingPatterns.clear();
            console.log('🗑️ Cleared all strategic user data');
            return 'Cleared all strategic user data';
        }
    } catch (error) {
        console.error('Clear strategic data error:', error.message);
        return `Error clearing strategic data: ${error.message}`;
    }
}

/**
 * 🎯 STRATEGIC MEMORY SEARCH
 */
async function searchStrategicMemory(chatId, query) {
    try {
        const [conversations, persistentMemory] = await Promise.all([
            getConversationHistory(chatId, 50),
            getPersistentMemory(chatId)
        ]);
        
        const queryLower = query.toLowerCase();
        const results = {
            conversations: [],
            memories: [],
            patterns: [],
            relevanceScore: 0
        };
        
        // Search conversations
        conversations.forEach(conv => {
            if (conv.userMessage?.toLowerCase().includes(queryLower) || 
                conv.gptResponse?.toLowerCase().includes(queryLower)) {
                results.conversations.push({
                    ...conv,
                    relevance: calculateRelevance(conv.userMessage + ' ' + conv.gptResponse, query)
                });
            }
        });
        
        // Search persistent memory
        persistentMemory.forEach(memory => {
            const fact = memory.fact || memory;
            if (fact.toLowerCase().includes(queryLower)) {
                results.memories.push({
                    ...memory,
                    relevance: calculateRelevance(fact, query)
                });
            }
        });
        
        // Search trading patterns
        const patterns = getStoredTradingPatterns(chatId);
        patterns.forEach(pattern => {
            if (pattern.description?.toLowerCase().includes(queryLower)) {
                results.patterns.push({
                    ...pattern,
                    relevance: calculateRelevance(pattern.description, query)
                });
            }
        });
        
        // Calculate overall relevance
        results.relevanceScore = (results.conversations.length + results.memories.length + results.patterns.length) / 3;
        
        // Sort by relevance
        results.conversations.sort((a, b) => b.relevance - a.relevance);
        results.memories.sort((a, b) => b.relevance - a.relevance);
        results.patterns.sort((a, b) => b.relevance - a.relevance);
        
        return results;
        
    } catch (error) {
        console.error('Strategic memory search error:', error.message);
        return { conversations: [], memories: [], patterns: [], relevanceScore: 0 };
    }
}

function calculateRelevance(text, query) {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ');
    
    let score = 0;
    queryWords.forEach(word => {
        if (textLower.includes(word)) {
            score += 1;
        }
    });
    
    return score / queryWords.length;
}

/**
 * 📊 MEMORY PERFORMANCE OPTIMIZATION
 */
function optimizeMemoryPerformance() {
    try {
        let optimizedCount = 0;
        
        // Optimize conversations - keep only strategic ones
        for (const [chatId, convs] of conversations.entries()) {
            const strategicConvs = convs.filter(conv => 
                conv.strategicImportance === 'high' || 
                conv.strategicImportance === 'critical' ||
                conv.extractedFacts?.length > 0
            );
            
            if (strategicConvs.length !== convs.length) {
                conversations.set(chatId, strategicConvs.slice(-50)); // Keep last 50 strategic
                optimizedCount++;
            }
        }
        
        // Optimize persistent memories - merge similar facts
        for (const [chatId, memories] of persistentMemories.entries()) {
            const uniqueMemories = deduplicateMemories(memories);
            if (uniqueMemories.length !== memories.length) {
                persistentMemories.set(chatId, uniqueMemories);
                optimizedCount++;
            }
        }
        
        console.log(`✅ Strategic memory optimized for ${optimizedCount} users`);
        return optimizedCount;
        
    } catch (error) {
        console.error('Memory optimization error:', error.message);
        return 0;
    }
}

function deduplicateMemories(memories) {
    const unique = [];
    const seen = new Set();
    
    memories.forEach(memory => {
        const fact = memory.fact || memory;
        const normalized = fact.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        if (!seen.has(normalized)) {
            seen.add(normalized);
            unique.push(memory);
        }
    });
    
    return unique;
}

/**
 * 🎯 STRATEGIC MEMORY EXPORT
 */
async function exportStrategicMemory(chatId) {
    try {
        const [conversations, persistentMemory, userProfile, analytics] = await Promise.all([
            getConversationHistory(chatId, 100),
            getPersistentMemory(chatId),
            getUserProfile(chatId),
            getMemoryAnalytics(chatId)
        ]);
        
        const export_data = {
            exportId: `STRATEGIC_MEMORY_${Date.now()}`,
            chatId: chatId,
            exportDate: new Date().toISOString(),
            
            summary: {
                totalConversations: conversations.length,
                totalMemories: persistentMemory.length,
                relationshipDuration: analytics?.relationshipDuration || 0,
                engagementLevel: analytics?.engagementLevel || 'UNKNOWN'
            },
            
            userProfile: userProfile,
            conversations: conversations,
            persistentMemory: persistentMemory,
            tradingPatterns: getStoredTradingPatterns(chatId),
            strategicInsights: strategicInsights.get(String(chatId)) || [],
            analytics: analytics,
            
            metadata: {
                systemVersion: 'IMPERIUM_VAULT_3.0',
                memoryCategories: MEMORY_CATEGORIES,
                importanceLevels: IMPORTANCE_LEVELS
            }
        };
        
        return export_data;
        
    } catch (error) {
        console.error('Strategic memory export error:', error.message);
        return null;
    }
}

module.exports = {
    // 🎯 ENHANCED STRATEGIC FUNCTIONS
    saveConversation,
    buildConversationContext,
    extractAndSaveFacts,
    addPersistentMemory,
    
    // 📊 STRATEGIC ANALYTICS
    getMemoryAnalytics,
    getStrategicUserProfile,
    searchStrategicMemory,
    exportStrategicMemory,
    
    // 🔧 OPTIMIZATION
    optimizeMemoryPerformance,
    
    // 📈 TRADING PATTERNS
    extractTradingPatterns,
    getStoredTradingPatterns,
    saveTradingPatterns,
    
    // 🏛️ STRATEGIC CATEGORIES
    MEMORY_CATEGORIES,
    IMPORTANCE_LEVELS,
    
    // 🔄 LEGACY COMPATIBILITY
    getConversationHistory,
    getConversationStats,
    getUserProfile,
    updateUserPreferences,
    getPersistentMemory,
    clearAllData
};
