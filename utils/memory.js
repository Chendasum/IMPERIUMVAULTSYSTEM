// utils/memory.js - Enhanced memory system with database integration

// In-memory storage (works as fallback)
let conversations = new Map();
let userProfiles = new Map();
let persistentMemories = new Map();

/**
 * Save conversation to memory (fallback function)
 */
async function saveConversation(chatId, userMessage, gptResponse, messageType = 'text', contextData = null) {
    try {
        const chatKey = String(chatId);
        
        if (!conversations.has(chatKey)) {
            conversations.set(chatKey, []);
        }
        
        conversations.get(chatKey).push({
            userMessage,
            gptResponse,
            messageType,
            timestamp: new Date().toISOString(),
            contextData
        });
        
        // Keep only last 50 conversations
        const userConversations = conversations.get(chatKey);
        if (userConversations.length > 50) {
            conversations.set(chatKey, userConversations.slice(-50));
        }
        
        // Update user profile
        if (!userProfiles.has(chatKey)) {
            userProfiles.set(chatKey, {
                chatId,
                conversationCount: 0,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                preferences: {}
            });
        }
        
        const profile = userProfiles.get(chatKey);
        profile.conversationCount++;
        profile.lastSeen = new Date().toISOString();
        
        console.log(`💾 Conversation saved for ${chatId}`);
        return true;
    } catch (error) {
        console.error('Save conversation error:', error.message);
        return false;
    }
}

/**
 * Get recent conversation history (fallback function)
 */
async function getConversationHistory(chatId, limit = 10) {
    try {
        const chatKey = String(chatId);
        const userConversations = conversations.get(chatKey) || [];
        console.log(`🔍 Retrieved ${userConversations.length} conversations for ${chatId}`);
        return userConversations.slice(-limit);
    } catch (error) {
        console.error('Get history error:', error.message);
        return [];
    }
}

/**
 * Get user profile (fallback function)
 */
async function getUserProfile(chatId) {
    try {
        const chatKey = String(chatId);
        const profile = userProfiles.get(chatKey) || null;
        console.log(`👤 Retrieved profile for ${chatId}:`, profile ? 'Found' : 'Not found');
        return profile;
    } catch (error) {
        console.error('Get user profile error:', error.message);
        return null;
    }
}

/**
 * Update user preferences (fallback function)
 */
async function updateUserPreferences(chatId, preferences) {
    try {
        const chatKey = String(chatId);
        if (userProfiles.has(chatKey)) {
            userProfiles.get(chatKey).preferences = preferences;
        }
        console.log(`✅ Preferences updated for ${chatId}`);
        return true;
    } catch (error) {
        console.error('Update preferences error:', error.message);
        return false;
    }
}

/**
 * Add persistent memory (fallback function)
 */
async function addPersistentMemory(chatId, fact, importance = 'medium') {
    try {
        const chatKey = String(chatId);
        if (!persistentMemories.has(chatKey)) {
            persistentMemories.set(chatKey, []);
        }
        
        const memories = persistentMemories.get(chatKey);
        memories.push({
            fact: fact,
            timestamp: new Date().toISOString(),
            importance: importance
        });
        
        // Keep only most important 20 memories
        if (memories.length > 20) {
            memories.sort((a, b) => {
                const importanceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return importanceOrder[b.importance] - importanceOrder[a.importance];
            });
            persistentMemories.set(chatKey, memories.slice(0, 20));
        }
        
        console.log(`💾 Persistent memory added for ${chatId}: ${fact}`);
        return true;
    } catch (error) {
        console.error('Add persistent memory error:', error.message);
        return false;
    }
}

/**
 * Get persistent memories (fallback function)
 */
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

/**
 * Build conversation context for GPT - DATABASE FIRST, FALLBACK TO MEMORY
 */
async function buildConversationContext(chatId) {
    try {
        // Try database first
        const { getConversationHistoryDB, getPersistentMemoryDB, getUserProfileDB } = require('./database');
        
        const recentHistory = await getConversationHistoryDB(chatId, 5);
        const persistentMemory = await getPersistentMemoryDB(chatId);
        const userProfile = await getUserProfileDB(chatId);
        
        console.log(`🧠 Building database memory for user ${chatId}: ${recentHistory.length} recent + ${persistentMemory.length} persistent memories`);
        
        let context = '';
        
        // User Profile Context
        if (userProfile && userProfile.conversation_count > 1) {
            context += `\n\nIMPORTANT - User Context: This user has had ${userProfile.conversation_count} total conversations with you across multiple sessions. Remember previous interactions and build on them continuously.`;
            
            if (userProfile.preferences && Object.keys(userProfile.preferences).length > 0) {
                const prefs = typeof userProfile.preferences === 'string' ? 
                    JSON.parse(userProfile.preferences) : userProfile.preferences;
                context += ` User preferences: ${JSON.stringify(prefs)}.`;
            }
        }
        
        // Persistent Memory (Long-term facts about user)
        if (persistentMemory.length > 0) {
            context += '\n\nPERSISTENT MEMORY (Important facts about this user - remember these always):';
            persistentMemory.forEach((memory, index) => {
                const fact = memory.fact || memory;
                const timestamp = memory.timestamp || new Date().toISOString();
                context += `\n• ${fact} (saved ${new Date(timestamp).toLocaleDateString()})`;
            });
        }
        
        // Recent Session Memory
        if (recentHistory.length > 0) {
            context += '\n\nRECENT CONVERSATION HISTORY (Last few interactions):';
            recentHistory.forEach((conv, index) => {
                const userMsg = conv.user_message || '';
                const gptMsg = conv.gpt_response || '';
                context += `\n${index + 1}. User said: "${userMsg.substring(0, 150)}${userMsg.length > 150 ? '...' : ''}"`;
                context += `\n   You replied: "${gptMsg.substring(0, 150)}${gptMsg.length > 150 ? '...' : ''}"`;
            });
        }
        
        context += '\n\nMEMORY INSTRUCTIONS: Use both persistent memory and recent history. When the user asks about information they previously told you, reference the persistent memory facts above. Act like you have known this user across all previous interactions.';
        
        console.log(`📝 Database memory context built: ${context.length} characters`);
        return context;
        
    } catch (error) {
        console.error('Database memory error, falling back to in-memory:', error.message);
        // Fallback to in-memory storage
        return await buildConversationContextMemory(chatId);
    }
}

/**
 * Fallback memory context builder (in-memory)
 */
async function buildConversationContextMemory(chatId) {
    try {
        const recentHistory = await getConversationHistory(chatId, 5);
        const persistentMemory = await getPersistentMemory(chatId);
        const userProfile = await getUserProfile(chatId);
        
        console.log(`🧠 Building fallback memory for user ${chatId}: ${recentHistory.length} recent + ${persistentMemory.length} persistent memories`);
        
        let context = '';
        
        // User Profile Context
        if (userProfile && userProfile.conversationCount > 1) {
            context += `\n\nIMPORTANT - User Context: This user has had ${userProfile.conversationCount} total conversations with you across multiple sessions. Remember previous interactions and build on them continuously.`;
            
            if (userProfile.preferences && Object.keys(userProfile.preferences).length > 0) {
                context += ` User preferences: ${JSON.stringify(userProfile.preferences)}.`;
            }
        }
        
        // Persistent Memory (Long-term facts about user) - THIS IS THE KEY PART
        if (persistentMemory.length > 0) {
            context += '\n\nPERSISTENT MEMORY (Important facts about this user - remember these always):';
            persistentMemory.forEach((memory, index) => {
                const fact = memory.fact || memory;
                const timestamp = memory.timestamp || new Date().toISOString();
                context += `\n• ${fact} (saved ${new Date(timestamp).toLocaleDateString()})`;
            });
        }
        
        // Recent Session Memory
        if (recentHistory.length > 0) {
            context += '\n\nRECENT CONVERSATION HISTORY (Last few interactions):';
            recentHistory.forEach((conv, index) => {
                const userMsg = conv.userMessage || '';
                const gptMsg = conv.gptResponse || '';
                context += `\n${index + 1}. User said: "${userMsg.substring(0, 150)}${userMsg.length > 150 ? '...' : ''}"`;
                context += `\n   You replied: "${gptMsg.substring(0, 150)}${gptMsg.length > 150 ? '...' : ''}"`;
            });
        }
        
        context += '\n\nMEMORY INSTRUCTIONS: Use both persistent memory and recent history. When the user asks about information they previously told you, reference the persistent memory facts above. Act like you have known this user across all previous interactions.';
        
        console.log(`📝 Fallback memory context built: ${context.length} characters`);
        return context;
    } catch (error) {
        console.error('Build fallback context error:', error.message);
        return '';
    }
}

/**
 * Get conversation statistics (fallback function)
 */
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
        
        for (const memories of persistentMemory.values()) {
            totalMemories += memories.length;
        }
        
        return {
            totalUsers,
            totalConversations,
            totalMemories,
            todayConversations,
            avgConversationsPerUser: totalUsers > 0 ? (totalConversations / totalUsers).toFixed(1) : 0
        };
    } catch (error) {
        console.error('Get conversation stats error:', error.message);
        return {
            totalUsers: 0,
            totalConversations: 0,
            totalMemories: 0,
            todayConversations: 0,
            avgConversationsPerUser: 0
        };
    }
}

// Simple fact extraction function (placeholder)
async function extractAndSaveFacts(chatId, userMessage, gptResponse) {
    try {
        // Extract important facts from conversation
        const importantKeywords = ['my name is', 'i am', 'i work', 'i live', 'i like', 'i prefer', 'remember that'];
        const facts = [];
        
        const lowerUser = userMessage.toLowerCase();
        const lowerGpt = gptResponse.toLowerCase();
        
        // Simple fact extraction based on keywords
        importantKeywords.forEach(keyword => {
            if (lowerUser.includes(keyword)) {
                const sentence = userMessage.split('.').find(s => s.toLowerCase().includes(keyword));
                if (sentence && sentence.length < 200) {
                    facts.push(sentence.trim());
                }
            }
        });
        
        // Save facts as persistent memory
        for (const fact of facts) {
            await addPersistentMemory(chatId, fact, 'medium');
        }
        
        return facts;
    } catch (error) {
        console.error('Extract facts error:', error.message);
        return [];
    }
}

// Clear all data function
async function clearAllData(chatId = null) {
    try {
        if (chatId) {
            const chatKey = String(chatId);
            conversations.delete(chatKey);
            userProfiles.delete(chatKey);
            persistentMemory.delete(chatKey);
            return `Cleared data for user ${chatId}`;
        } else {
            conversations.clear();
            userProfiles.clear();
            persistentMemory.clear();
            return 'Cleared all user data';
        }
    } catch (error) {
        console.error('Clear data error:', error.message);
        return `Error clearing data: ${error.message}`;
    }
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
