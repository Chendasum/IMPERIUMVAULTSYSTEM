// utils/telegramSplitter.js - FIXED VERSION TO PREVENT INFINITE LOOPS
// Critical fixes to stop excessive API usage and credit drain

const crypto = require('crypto');

// 🛑 STRICT TELEGRAM CONFIGURATION TO PREVENT LOOPS
const TELEGRAM_CONFIG = {
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_MESSAGE_LENGTH: 4000,
    OPTIMAL_CHUNK_SIZE: 3800,
    FAST_DELAY: 250,
    STANDARD_DELAY: 450,
    
    // CRITICAL: Much longer duplicate prevention
    DUPLICATE_WINDOW: 30000,        // 30 seconds for exact duplicates
    MULTI_MODEL_WINDOW: 60000,      // 1 minute for multi-model responses
    MAX_RESPONSES_PER_QUERY: 1,     // FIXED: Only 1 response per query (was 5)
    MAX_RETRIES: 1,                 // FIXED: Max 1 retry (was 2)
    
    // NEW: Global rate limiting
    GLOBAL_COOLDOWN: 5000,          // 5 seconds between any messages
    MAX_MESSAGES_PER_MINUTE: 10     // Max 10 messages per minute per chat
};

// Rate limiting tracking
const globalLastMessage = { timestamp: 0 };
const chatMessageCount = new Map(); // Track messages per chat per minute

// 🚀 MESSAGE TYPES - REDUCED PRIORITIES
const MESSAGE_TYPES = {
    'nano': { emoji: '⚡', delay: 300, description: 'GPT-5 Nano', priority: 1 },
    'mini': { emoji: '🔥', delay: 500, description: 'GPT-5 Mini', priority: 2 },
    'full': { emoji: '🧠', delay: 750, description: 'GPT-5 Full', priority: 3 },
    'gpt-5': { emoji: '🤖', delay: 750, description: 'GPT-5', priority: 3 },
    'chat': { emoji: '💬', delay: 300, description: 'Chat', priority: 1 },
    'analysis': { emoji: '📊', delay: 500, description: 'Analysis', priority: 3 },
    'error': { emoji: '❌', delay: 200, description: 'Error', priority: 0 }
};

// 🛡️ ENHANCED DUPLICATE PREVENTION
const activeRequests = new Map();
const requestHistory = new Map();
const responseCounter = new Map();

// NEW: Global request tracking to prevent any loops
const globalRequestTracker = new Map();

function generateRequestId(chatId, message, title, modelType) {
    // Use longer message sample for better uniqueness
    const baseContent = `${chatId}_${message.substring(0, 300)}`;
    const baseId = crypto.createHash('sha256').update(baseContent).digest('hex').substring(0, 12);
    const modelSuffix = modelType ? `_${modelType}` : '';
    return `${baseId}${modelSuffix}`;
}

function generateQueryId(chatId, message) {
    const queryContent = `${chatId}_${message.substring(0, 300)}`;
    return crypto.createHash('sha256').update(queryContent).digest('hex').substring(0, 12);
}

// NEW: Enhanced rate limiting
function checkRateLimit(chatId) {
    const now = Date.now();
    
    // Global cooldown check
    if (now - globalLastMessage.timestamp < TELEGRAM_CONFIG.GLOBAL_COOLDOWN) {
        console.log(`🛑 GLOBAL COOLDOWN: ${TELEGRAM_CONFIG.GLOBAL_COOLDOWN - (now - globalLastMessage.timestamp)}ms remaining`);
        return false;
    }
    
    // Per-chat rate limiting
    const chatKey = `chat_${chatId}`;
    const chatData = chatMessageCount.get(chatKey) || { count: 0, resetTime: now + 60000 };
    
    if (now > chatData.resetTime) {
        // Reset counter every minute
        chatData.count = 0;
        chatData.resetTime = now + 60000;
    }
    
    if (chatData.count >= TELEGRAM_CONFIG.MAX_MESSAGES_PER_MINUTE) {
        console.log(`🛑 CHAT RATE LIMIT: ${chatId} has sent ${chatData.count} messages this minute`);
        return false;
    }
    
    // Update counters
    chatData.count++;
    chatMessageCount.set(chatKey, chatData);
    globalLastMessage.timestamp = now;
    
    return true;
}

function isActualDuplicate(requestId, queryId, modelType, message) {
    const now = Date.now();
    
    // CRITICAL: Check global request tracker first
    const globalKey = `${queryId}_${modelType}`;
    if (globalRequestTracker.has(globalKey)) {
        console.log(`🚫 GLOBAL DUPLICATE BLOCKED: ${globalKey}`);
        return true;
    }
    
    // Check for exact duplicate with longer window
    const lastRequest = requestHistory.get(requestId);
    if (lastRequest && (now - lastRequest.timestamp) < TELEGRAM_CONFIG.DUPLICATE_WINDOW) {
        console.log(`🚫 Recent duplicate blocked: ${requestId}`);
        return true;
    }
    
    // FIXED: Strict response limit per query
    const responseCount = responseCounter.get(queryId) || 0;
    if (responseCount >= TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY) {
        console.log(`🛑 Max responses reached for query: ${queryId} (${responseCount}/${TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY})`);
        return true;
    }
    
    return false;
}

function recordRequest(requestId, queryId, modelType) {
    const now = Date.now();
    
    // Record in all tracking systems
    requestHistory.set(requestId, {
        timestamp: now,
        modelType: modelType,
        queryId: queryId
    });
    
    const currentCount = responseCounter.get(queryId) || 0;
    responseCounter.set(queryId, currentCount + 1);
    
    // CRITICAL: Record in global tracker to prevent loops
    const globalKey = `${queryId}_${modelType}`;
    globalRequestTracker.set(globalKey, now);
    
    console.log(`📝 Request recorded: ${requestId} (Count: ${currentCount + 1}/${TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY})`);
}

// 🧹 SIMPLIFIED MESSAGE CLEANING
function cleanMessage(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .replace(/\[reasoning_effort:\s*\w+\]/gi, '')
        .replace(/\[verbosity:\s*\w+\]/gi, '')
        .replace(/\[model:\s*gpt-5[^\]]*\]/gi, '')
        .replace(/\*\*(.*?)\*\*/g, '*$1*')
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/^\n+|\n+$/g, '')
        .trim();
}

// 📦 SIMPLIFIED MESSAGE SPLITTING
function splitMessage(message, modelType = 'analysis') {
    if (!message || message.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
        return [message];
    }
    
    const chunks = [];
    let remaining = message;
    let partNumber = 1;
    
    while (remaining.length > TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE) {
        let splitPoint = TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE - 100;
        
        // Simple split on paragraph breaks
        const paragraphMatch = remaining.lastIndexOf('\n\n', splitPoint);
        if (paragraphMatch > splitPoint * 0.5) {
            splitPoint = paragraphMatch + 2;
        }
        
        let chunk = remaining.substring(0, splitPoint).trim();
        chunk = `📄 Part ${partNumber}\n\n${chunk}`;
        
        chunks.push(chunk);
        remaining = remaining.substring(splitPoint).trim();
        partNumber++;
    }
    
    if (remaining.length > 0) {
        if (partNumber > 1) {
            remaining = `📄 Part ${partNumber} - Final\n\n${remaining}`;
        }
        chunks.push(remaining);
    }
    
    return chunks;
}

// 📤 FIXED SEND SINGLE MESSAGE - NO INFINITE RETRIES
async function sendSingleMessage(bot, chatId, message, retryCount = 0) {
    try {
        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        return true;
    } catch (markdownError) {
        console.log(`⚠️ Markdown failed, trying plain text: ${markdownError.message}`);
        
        try {
            const plainMessage = message
                .replace(/\*([^*]+)\*/g, '$1')
                .replace(/`([^`]+)`/g, '$1')
                .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
                .replace(/[*_`~\[\]]/g, '');
                
            await bot.sendMessage(chatId, plainMessage, {
                disable_web_page_preview: true
            });
            return true;
        } catch (plainError) {
            console.error(`❌ Send failed (attempt ${retryCount + 1}):`, plainError.message);
            
            // CRITICAL FIX: Strict retry limit
            if (retryCount < TELEGRAM_CONFIG.MAX_RETRIES && 
                (plainError.message.includes('network') || plainError.message.includes('timeout'))) {
                console.log(`🔄 Final retry in 2000ms...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return sendSingleMessage(bot, chatId, message, retryCount + 1);
            }
            
            return false;
        }
    }
}

// 📦 SAFE CHUNKED MESSAGE SENDING
async function sendChunkedMessage(bot, chatId, message, delay = 500, modelType = 'analysis') {
    const chunks = splitMessage(message, modelType);
    let successCount = 0;
    
    console.log(`📦 Sending ${chunks.length} chunks for ${modelType} model`);
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        console.log(`📤 Sending chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
        
        const sent = await sendSingleMessage(bot, chatId, chunk, 0);
        if (sent) {
            successCount++;
            console.log(`✅ Chunk ${i + 1}/${chunks.length} delivered`);
        } else {
            console.log(`❌ Chunk ${i + 1}/${chunks.length} failed - STOPPING`);
            break; // CRITICAL: Stop on first failure to prevent loops
        }
        
        // CRITICAL: Always delay between chunks
        if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.max(delay, 500)));
        }
    }
    
    console.log(`📊 Delivery summary: ${successCount}/${chunks.length} chunks sent`);
    return successCount > 0;
}

// 🚀 MAIN FIXED SEND FUNCTION
async function sendGPT5Message(bot, chatId, message, title = null, metadata = {}) {
    try {
        const modelType = metadata.modelUsed || metadata.aiUsed || 'analysis';
        const queryId = generateQueryId(chatId, message);
        const requestId = generateRequestId(chatId, message, title, modelType);
        
        console.log(`📱 Processing message for ${chatId} (Model: ${modelType})`);
        console.log(`🔍 Query ID: ${queryId}, Request ID: ${requestId}`);
        
        // CRITICAL: Rate limiting check first
        if (!checkRateLimit(chatId)) {
            console.log(`🛑 RATE LIMITED: Dropping message for ${chatId}`);
            return false;
        }
        
        // CRITICAL: Enhanced duplicate check
        if (isActualDuplicate(requestId, queryId, modelType, message)) {
            console.log(`🚫 DUPLICATE DETECTED: Dropping message ${requestId}`);
            return false;
        }
        
        // CRITICAL: Check if already processing
        if (activeRequests.has(requestId)) {
            console.log(`⏳ ALREADY PROCESSING: ${requestId}`);
            return false;
        }
        
        // Mark as active with timeout
        activeRequests.set(requestId, Date.now());
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            activeRequests.delete(requestId);
        }, 30000);
        
        // Clean and validate message
        let cleanedMessage = cleanMessage(message);
        
        if (!cleanedMessage || cleanedMessage.length < 5) {
            console.log(`⚠️ Message too short after cleaning`);
            activeRequests.delete(requestId);
            return false;
        }
        
        // Add title if provided
        if (title) {
            const typeConfig = MESSAGE_TYPES[modelType] || MESSAGE_TYPES.analysis;
            cleanedMessage = `${typeConfig.emoji} *${title}*\n\n${cleanedMessage}`;
        }
        
        // Send message
        let result = false;
        if (cleanedMessage.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
            result = await sendSingleMessage(bot, chatId, cleanedMessage);
        } else {
            const delay = MESSAGE_TYPES[modelType]?.delay || TELEGRAM_CONFIG.STANDARD_DELAY;
            result = await sendChunkedMessage(bot, chatId, cleanedMessage, delay, modelType);
        }
        
        // Record successful request
        if (result) {
            recordRequest(requestId, queryId, modelType);
        }
        
        // Clean up
        activeRequests.delete(requestId);
        
        console.log(`${result ? '✅ SUCCESS' : '❌ FAILED'} Message delivery: ${requestId}`);
        return result;
        
    } catch (error) {
        console.error('❌ Critical error in sendGPT5Message:', error.message);
        
        // Clean up on error
        const requestId = generateRequestId(chatId, message, title, metadata.modelUsed);
        activeRequests.delete(requestId);
        
        return false; // CRITICAL: Never try fallback messages that could loop
    }
}

// 🔄 LEGACY COMPATIBILITY FUNCTIONS
async function sendGPTResponse(bot, chatId, response, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        modelUsed: 'gpt-5'
    });
}

async function sendClaudeResponse(bot, chatId, response, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        modelUsed: 'analysis'
    });
}

async function sendDualAIResponse(bot, chatId, response, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        modelUsed: 'full'
    });
}

async function sendAnalysis(bot, chatId, analysis, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, analysis, title, {
        ...metadata,
        modelUsed: 'analysis'
    });
}

// FIXED: Simple alert function without loops
async function sendAlert(bot, chatId, alertMessage, title = 'Alert', metadata = {}) {
    const cambodiaTime = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Phnom_Penh',
        hour12: false 
    });
    
    const alertContent = `🚨 *${title}*\n\n${alertMessage}\n\n⏰ ${cambodiaTime} Cambodia`;
    
    return await sendGPT5Message(bot, chatId, alertContent, null, {
        ...metadata,
        modelUsed: 'error'
    });
}

// 📊 STATS AND MONITORING
function getStats() {
    const now = Date.now();
    let activeCount = activeRequests.size;
    let historyCount = requestHistory.size;
    let globalTrackerCount = globalRequestTracker.size;
    let queryCount = responseCounter.size;
    
    return {
        activeRequests: activeCount,
        requestHistory: historyCount,
        globalTracker: globalTrackerCount,
        uniqueQueries: queryCount,
        status: 'LOOP PREVENTION MODE',
        maxResponsesPerQuery: TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY,
        globalCooldown: TELEGRAM_CONFIG.GLOBAL_COOLDOWN,
        maxMessagesPerMinute: TELEGRAM_CONFIG.MAX_MESSAGES_PER_MINUTE
    };
}

// 🧹 AGGRESSIVE CLEANUP TO PREVENT MEMORY LEAKS
function aggressiveCleanup() {
    const now = Date.now();
    let cleaned = {
        active: 0,
        history: 0,
        global: 0,
        queries: 0,
        chatLimits: 0
    };
    
    // Clean old active requests (over 1 minute)
    for (const [requestId, timestamp] of activeRequests.entries()) {
        if (now - timestamp > 60000) {
            activeRequests.delete(requestId);
            cleaned.active++;
        }
    }
    
    // Clean old request history (over 10 minutes)
    for (const [requestId, data] of requestHistory.entries()) {
        if (now - data.timestamp > 600000) {
            requestHistory.delete(requestId);
            cleaned.history++;
        }
    }
    
    // Clean global tracker (over 5 minutes)
    for (const [globalKey, timestamp] of globalRequestTracker.entries()) {
        if (now - timestamp > 300000) {
            globalRequestTracker.delete(globalKey);
            cleaned.global++;
        }
    }
    
    // Clean query counters (over 5 minutes)
    for (const [queryId] of responseCounter.entries()) {
        const hasRecentRequests = Array.from(requestHistory.entries())
            .some(([requestId, data]) => 
                requestId.startsWith(queryId) && 
                now - data.timestamp < 300000
            );
        
        if (!hasRecentRequests) {
            responseCounter.delete(queryId);
            cleaned.queries++;
        }
    }
    
    // Clean chat message counts (reset old entries)
    for (const [chatKey, chatData] of chatMessageCount.entries()) {
        if (now > chatData.resetTime + 300000) { // 5 minutes past reset
            chatMessageCount.delete(chatKey);
            cleaned.chatLimits++;
        }
    }
    
    if (Object.values(cleaned).some(count => count > 0)) {
        console.log(`🧹 Aggressive cleanup:`, cleaned);
    }
}

// CRITICAL: More frequent cleanup to prevent loops
setInterval(aggressiveCleanup, 60000); // Every 1 minute instead of 10

function manualCleanup() {
    console.log('🧹 Manual cleanup starting...');
    aggressiveCleanup();
    console.log('📊 Stats after cleanup:', getStats());
}

// CRITICAL: Emergency reset function
function emergencyReset() {
    console.log('🚨 EMERGENCY RESET: Clearing all tracking data');
    activeRequests.clear();
    requestHistory.clear();
    responseCounter.clear();
    globalRequestTracker.clear();
    chatMessageCount.clear();
    globalLastMessage.timestamp = 0;
    console.log('✅ All tracking data cleared');
}

// 📤 EXPORTS
module.exports = {
    // Main functions
    sendGPT5Message,
    sendGPTResponse,
    sendClaudeResponse, 
    sendDualAIResponse,
    sendAnalysis,
    sendAlert,
    
    // Utility functions
    cleanMessage,
    splitMessage,
    getStats,
    manualCleanup,
    aggressiveCleanup,
    emergencyReset, // NEW: Emergency function
    
    // Debugging functions
    generateRequestId,
    generateQueryId,
    isActualDuplicate,
    checkRateLimit,
    
    // Config
    TELEGRAM_CONFIG,
    MESSAGE_TYPES
};

console.log('🛡️ LOOP PREVENTION MODE: Telegram splitter loaded with strict controls');
console.log('⚙️ Settings: 1 response per query, 5s global cooldown, 10 msgs/min per chat');
console.log('🧹 Aggressive cleanup every 60 seconds');
console.log('🚨 Use emergencyReset() if loops persist');
