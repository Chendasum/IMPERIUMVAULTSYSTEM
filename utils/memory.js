// utils/memory.js - CORRECTED VERSION - SYNTAX ERRORS FIXED
// ════════════════════════════════════════════════════════════════════════════
// Fixed memory system with PostgreSQL integration
// All syntax errors resolved, proper function signatures
// ════════════════════════════════════════════════════════════════════════════

'use strict';

require("dotenv").config();

console.log('🧠 Loading Corrected Memory System...');

// Import database functions safely
let database;
try {
    database = require('./database');
    console.log('✅ Database module loaded for memory system');
} catch (error) {
    console.warn('⚠️ Database module not available:', error.message);
    database = {
        getConversationHistoryDB: async () => [],
        getPersistentMemoryDB: async () => [],
        saveConversationDB: async () => false,
        addPersistentMemoryDB: async () => false,
        getUserProfileDB: async () => null,
        connectionStats: { connectionHealth: 'unavailable' }
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const MEMORY_CONFIG = {
    MAX_CONTEXT_LENGTH: 4000,
    MAX_CONVERSATIONS: 10,
    MAX_MEMORIES: 15,
    MIN_IMPORTANCE_THRESHOLD: 0.3,
    CONTEXT_DECAY_DAYS: 30,
    MEMORY_WEIGHT_MULTIPLIER: 2.0,
    CONVERSATION_WEIGHT: 1.0,
    PATTERN_DETECTION_MIN: 3
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function safeString(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null, 2);
        } catch (e) {
            return String(value);
        }
    }
    return String(value);
}

function safeDivision(numerator, denominator, defaultValue = 0) {
    if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) {
        return defaultValue;
    }
    const result = numerator / denominator;
    return isNaN(result) || !isFinite(result) ? defaultValue : result;
}

function daysBetween(date1, date2) {
    try {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.abs((new Date(date1) - new Date(date2)) / oneDay);
    } catch (error) {
        return 0;
    }
}

function calculateRelevance(timestamp, importance = 'medium', currentMessage = '') {
    try {
        const daysOld = daysBetween(new Date(), new Date(timestamp));
        const decayFactor = Math.max(0.1, 1 - (daysOld / MEMORY_CONFIG.CONTEXT_DECAY_DAYS));
        
        const importanceScores = { high: 1.0, medium: 0.7, low: 0.4 };
        const importanceScore = importanceScores[importance] || 0.5;
        
        let contextBoost = 1.0;
        if (currentMessage) {
            const messageWords = currentMessage.toLowerCase().split(/\s+/);
            const commonWords = messageWords.filter(word => word.length > 3).slice(0, 10);
            contextBoost = 1.0 + (commonWords.length * 0.1);
        }
        
        return decayFactor * importanceScore * contextBoost;
    } catch (error) {
        return 0.5;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MEMORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build conversation context - handles multiple parameter signatures
 */
async function buildConversationContext(chatId, currentMessageOrOptions = '') {
    try {
        if (!chatId) {
            return '';
        }
        
        console.log(`🧠 Building context for ${chatId}`);
        
        // Handle flexible parameters
        let currentMessage = '';
        let options = {};
        
        if (typeof currentMessageOrOptions === 'string') {
            currentMessage = currentMessageOrOptions;
        } else if (typeof currentMessageOrOptions === 'object' && currentMessageOrOptions !== null) {
            options = currentMessageOrOptions;
            currentMessage = options.currentMessage || '';
        }
        
        // Determine limits
        const contextLimit = options.limit || MEMORY_CONFIG.MAX_CONTEXT_LENGTH;
        const maxMessages = options.maxMessages || MEMORY_CONFIG.MAX_CONVERSATIONS;
        
        // Fetch data from database
        let conversations = [];
        let memories = [];
        let userProfile = null;
        
        try {
            conversations = await database.getConversationHistoryDB(chatId, maxMessages);
            if (!Array.isArray(conversations)) conversations = [];
        } catch (error) {
            console.warn(`Failed to get conversations for ${chatId}:`, error.message);
        }
        
        try {
            memories = await database.getPersistentMemoryDB(chatId);
            if (!Array.isArray(memories)) memories = [];
        } catch (error) {
            console.warn(`Failed to get memories for ${chatId}:`, error.message);
        }
        
        try {
            userProfile = await database.getUserProfileDB(chatId);
        } catch (error) {
            console.warn(`Failed to get user profile for ${chatId}:`, error.message);
        }
        
        console.log(`Retrieved ${conversations.length} conversations, ${memories.length} memories`);
        
        // Build context parts
        const contextParts = [];
        
        // User profile
        if (userProfile) {
            const profileText = `USER PROFILE: Member since ${new Date(userProfile.first_seen || Date.now()).toLocaleDateString()}, ${conversations.length} conversations`;
            contextParts.push(profileText);
        }
        
        // Persistent memories (prioritized by importance)
        if (memories.length > 0) {
            const sortedMemories = memories
                .filter(memory => memory.fact && safeString(memory.fact).trim().length > 0)
                .map(memory => ({
                    ...memory,
                    relevance: calculateRelevance(memory.timestamp, memory.importance, currentMessage)
                }))
                .sort((a, b) => b.relevance - a.relevance)
                .slice(0, MEMORY_CONFIG.MAX_MEMORIES);
            
            if (sortedMemories.length > 0) {
                contextParts.push('IMPORTANT FACTS:');
                sortedMemories.forEach((memory, index) => {
                    const importance = memory.importance ? `[${memory.importance.toUpperCase()}] ` : '';
                    contextParts.push(`${index + 1}. ${importance}${memory.fact}`);
                });
            }
        }
        
        // Recent conversations
        if (conversations.length > 0) {
            contextParts.push('RECENT CONVERSATIONS:');
            const recentConversations = conversations.slice(0, Math.min(5, maxMessages));
            
            recentConversations.forEach((conv, index) => {
                const timeAgo = daysBetween(new Date(), new Date(conv.timestamp));
                const timeLabel = timeAgo === 0 ? 'Today' : 
                                timeAgo === 1 ? 'Yesterday' : 
                                `${Math.floor(timeAgo)} days ago`;
                
                if (conv.user_message || conv.userMessage) {
                    const userMsg = conv.user_message || conv.userMessage;
                    contextParts.push(`${index + 1}. User (${timeLabel}): "${safeString(userMsg).substring(0, 150)}${userMsg.length > 150 ? '...' : ''}"`);
                }
                
                if (index < 3 && (conv.gpt_response || conv.assistantResponse)) {
                    const aiResponse = conv.gpt_response || conv.assistantResponse;
                    contextParts.push(`   AI Response: "${safeString(aiResponse).substring(0, 100)}${aiResponse.length > 100 ? '...' : ''}"`);
                }
            });
        }
        
        // Join and limit context
        const fullContext = contextParts.join('\n\n');
        const finalContext = fullContext.length > contextLimit 
            ? fullContext.substring(0, contextLimit) + '\n\n[Context truncated for optimal processing]'
            : fullContext;
        
        console.log(`✅ Context built: ${finalContext.length} characters`);
        return finalContext;
        
    } catch (error) {
        console.error(`❌ buildConversationContext error for ${chatId}:`, error.message);
        return `BASIC CONTEXT: Error building context (${error.message}). Current message: "${safeString(currentMessageOrOptions).substring(0, 100)}"`;
    }
}

/**
 * Save memory function - handles conversation saving
 */
async function saveToMemory(chatId, conversationData) {
    try {
        if (!chatId || !conversationData) {
            return { saved: false, reason: 'missing_data' };
        }
        
        console.log(`💾 Saving conversation for ${chatId}`);
        
        // Extract data from conversation object
        const userMessage = safeString(conversationData.user || conversationData.userMessage || '');
        const assistantResponse = safeString(conversationData.assistant || conversationData.assistantResponse || '');
        
        // Don't save trivial interactions
        if (userMessage.length < 3 && assistantResponse.length < 50) {
            return { saved: false, reason: 'trivial' };
        }
        
        // Clean and prepare data
        const cleanUserMessage = userMessage.substring(0, 5000);
        const cleanAssistantResponse = assistantResponse
            .replace(/^(Assistant:|AI:|GPT-?5?:)\s*/i, '')
            .replace(/\s+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
            .substring(0, 8000);
        
        const metadata = {
            messageType: conversationData.messageType || 'conversation',
            timestamp: conversationData.timestamp || new Date().toISOString(),
            system_version: 'memory-corrected-v1.0'
        };
        
        // Try to save to database
        try {
            const result = await database.saveConversationDB(chatId, cleanUserMessage, cleanAssistantResponse, metadata);
            
            if (result !== false) {
                console.log(`✅ Conversation saved successfully for ${chatId}`);
                return { 
                    saved: true, 
                    method: 'database',
                    timestamp: metadata.timestamp
                };
            } else {
                console.warn(`⚠️ Failed to save conversation for ${chatId}`);
                return { saved: false, reason: 'database_failed' };
            }
        } catch (saveError) {
            console.error(`❌ Save error for ${chatId}:`, saveError.message);
            return { saved: false, reason: 'save_error', error: saveError.message };
        }
        
    } catch (error) {
        console.error(`❌ saveToMemory error for ${chatId}:`, error.message);
        return { saved: false, reason: 'general_error', error: error.message };
    }
}

/**
 * Extract facts from conversation text
 */
function extractFactsFromConversation(userMessage, aiResponse) {
    try {
        const facts = [];
        
        if (!userMessage && !aiResponse) {
            return facts;
        }
        
        const userText = safeString(userMessage);
        const aiText = safeString(aiResponse);
        
        // Extract from user message
        const userFacts = extractFactsFromText(userText, 'user');
        facts.push(...userFacts);
        
        // Extract from AI response
        const aiFacts = extractFactsFromText(aiText, 'ai');
        facts.push(...aiFacts);
        
        return facts;
        
    } catch (error) {
        console.error('extractFactsFromConversation error:', error.message);
        return [];
    }
}

/**
 * Extract facts from text using pattern matching
 */
function extractFactsFromText(text, source = 'unknown') {
    const facts = [];
    
    if (!text || typeof text !== 'string') {
        return facts;
    }
    
    const lowerText = text.toLowerCase();
    
    // Name extraction patterns
    const namePatterns = [
        /my name is ([^.,\n!?]{1,50})/i,
        /i'm ([^.,\n!?]{1,50})/i,
        /call me ([^.,\n!?]{1,50})/i
    ];
    
    namePatterns.forEach(pattern => {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 1) {
            facts.push({
                text: `User's name: ${match[1].trim()}`,
                importance: 'high',
                type: 'identity',
                source: source
            });
        }
    });
    
    // Preference extraction
    const preferencePatterns = [
        /i prefer ([^.,\n!?]{1,100})/i,
        /i like ([^.,\n!?]{1,100})/i,
        /my favorite ([^.,\n!?]{1,100})/i
    ];
    
    preferencePatterns.forEach(pattern => {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 3) {
            facts.push({
                text: `User preference: ${match[0]}`,
                importance: 'medium',
                type: 'preference',
                source: source
            });
        }
    });
    
    // Goal extraction
    const goalPatterns = [
        /my goal is ([^.,\n!?]{1,100})/i,
        /i want to ([^.,\n!?]{1,100})/i,
        /i'm trying to ([^.,\n!?]{1,100})/i
    ];
    
    goalPatterns.forEach(pattern => {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 3) {
            facts.push({
                text: `User goal: ${match[0]}`,
                importance: 'medium',
                type: 'goal',
                source: source
            });
        }
    });
    
    // Important statements
    if (lowerText.includes('important') || lowerText.includes('remember')) {
        facts.push({
            text: `Important statement: ${text.substring(0, 200)}`,
            importance: 'high',
            type: 'important',
            source: source
        });
    }
    
    return facts;
}

/**
 * Save extracted facts to persistent memory
 */
async function saveExtractedFacts(chatId, userMessage, aiResponse) {
    try {
        const facts = extractFactsFromConversation(userMessage, aiResponse);
        let savedCount = 0;
        
        for (const fact of facts) {
            try {
                if (database.addPersistentMemoryDB) {
                    await database.addPersistentMemoryDB(chatId, fact.text, fact.importance);
                    savedCount++;
                }
            } catch (factError) {
                console.warn(`Failed to save fact: ${factError.message}`);
            }
        }
        
        return {
            extractedFacts: savedCount,
            totalFacts: facts.length,
            success: savedCount > 0
        };
        
    } catch (error) {
        console.error('saveExtractedFacts error:', error.message);
        return { extractedFacts: 0, totalFacts: 0, success: false, error: error.message };
    }
}

/**
 * Get memory statistics
 */
async function getMemoryStats(chatId) {
    try {
        const conversations = await database.getConversationHistoryDB(chatId, 100);
        const memories = await database.getPersistentMemoryDB(chatId);
        
        const stats = {
            conversations: {
                total: Array.isArray(conversations) ? conversations.length : 0,
                avgLength: 0,
                totalWords: 0
            },
            memories: {
                total: Array.isArray(memories) ? memories.length : 0,
                byImportance: { high: 0, medium: 0, low: 0 }
            },
            databaseHealth: {
                connected: database?.connectionStats?.connectionHealth === 'connected',
                lastQuery: database?.connectionStats?.lastQuery || null
            }
        };
        
        // Calculate conversation statistics
        if (Array.isArray(conversations) && conversations.length > 0) {
            const totalLength = conversations.reduce((sum, conv) => {
                const userLen = safeString(conv.user_message || conv.userMessage || '').length;
                const aiLen = safeString(conv.gpt_response || conv.assistantResponse || '').length;
                return sum + userLen + aiLen;
            }, 0);
            
            stats.conversations.avgLength = safeDivision(totalLength, conversations.length);
            stats.conversations.totalWords = Math.round(totalLength / 5);
        }
        
        // Calculate memory statistics
        if (Array.isArray(memories) && memories.length > 0) {
            memories.forEach(memory => {
                const importance = memory.importance || 'medium';
                if (stats.memories.byImportance[importance] !== undefined) {
                    stats.memories.byImportance[importance]++;
                }
            });
        }
        
        return stats;
        
    } catch (error) {
        console.error('getMemoryStats error:', error.message);
        return {
            conversations: { total: 0, error: error.message },
            memories: { total: 0, error: error.message },
            databaseHealth: { connected: false, error: error.message }
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
    // Main memory functions
    buildConversationContext,
    saveToMemory,
    extractFactsFromConversation,
    
    // Utility functions
    extractFactsFromText,
    saveExtractedFacts,
    getMemoryStats,
    
    // Helper functions
    safeString,
    safeDivision,
    daysBetween,
    calculateRelevance,
    
    // Legacy compatibility
    buildMemoryContext: buildConversationContext,
    
    // Configuration
    MEMORY_CONFIG
};

console.log('✅ Corrected Memory System loaded successfully');
console.log(`   Max Context: ${MEMORY_CONFIG.MAX_CONTEXT_LENGTH} chars`);
console.log(`   Max Conversations: ${MEMORY_CONFIG.MAX_CONVERSATIONS}`);
console.log(`   Max Memories: ${MEMORY_CONFIG.MAX_MEMORIES}`);
console.log(`   Functions available: buildConversationContext, saveToMemory, extractFactsFromConversation`);
