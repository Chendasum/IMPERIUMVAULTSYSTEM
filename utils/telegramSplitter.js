// utils/telegramSplitter.js - COMPLETE FIXED VERSION
// Prevents infinite loops and handles deep queries properly

const crypto = require('crypto');

// STRICT CONFIGURATION TO PREVENT LOOPS
const TELEGRAM_CONFIG = {
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_MESSAGE_LENGTH: 4000,
    OPTIMAL_CHUNK_SIZE: 3800,
    
    // CRITICAL SETTINGS
    MAX_RESPONSES_PER_QUERY: 1,     // Only 1 response per query
    DUPLICATE_WINDOW: 30000,        // 30 seconds duplicate prevention
    GLOBAL_COOLDOWN: 3000,          // 3 seconds between messages
    MAX_MESSAGES_PER_MINUTE: 12,    // 12 messages per minute per chat
    MAX_RETRIES: 1,                 // Max 1 retry attempt
    
    // DELAYS
    FAST_DELAY: 300,
    STANDARD_DELAY: 500,
    SLOW_DELAY: 750
};

// MESSAGE TYPES
const MESSAGE_TYPES = {
    'nano': { emoji: '⚡', delay: 300, description: 'GPT-5 Nano' },
    'mini': { emoji: '🔥', delay: 400, description: 'GPT-5 Mini' },
    'full': { emoji: '🧠', delay: 600, description: 'GPT-5 Full' },
    'gpt-5': { emoji: '🤖', delay: 600, description: 'GPT-5' },
    'chat': { emoji: '💬', delay: 300, description: 'Chat' },
    'analysis': { emoji: '📊', delay: 500, description: 'Analysis' },
    'error': { emoji: '❌', delay: 200, description: 'Error' },
    'composite': { emoji: '🔄', delay: 800, description: 'Deep Analysis' }
};

// TRACKING MAPS
const activeRequests = new Map();
const requestHistory = new Map();
const responseCounter = new Map();
const globalRequestTracker = new Map();
const chatMessageCount = new Map();
const globalLastMessage = { timestamp: 0 };

// ID GENERATION
function generateRequestId(chatId, message, title, modelType) {
    const baseContent = `${chatId}_${message.substring(0, 200)}`;
    const baseId = crypto.createHash('sha256').update(baseContent).digest('hex').substring(0, 10);
    const modelSuffix = modelType ? `_${modelType}` : '';
    return `${baseId}${modelSuffix}`;
}

function generateQueryId(chatId, message) {
    const queryContent = `${chatId}_${message.substring(0, 200)}`;
    return crypto.createHash('sha256').update(queryContent).digest('hex').substring(0, 10);
}

// RATE LIMITING
function checkRateLimit(chatId) {
    const now = Date.now();
    
    // Global cooldown
    if (now - globalLastMessage.timestamp < TELEGRAM_CONFIG.GLOBAL_COOLDOWN) {
        const remaining = TELEGRAM_CONFIG.GLOBAL_COOLDOWN - (now - globalLastMessage.timestamp);
        console.log(`GLOBAL COOLDOWN: ${remaining}ms remaining`);
        return false;
    }
    
    // Per-chat rate limiting
    const chatKey = `chat_${chatId}`;
    const chatData = chatMessageCount.get(chatKey) || { count: 0, resetTime: now + 60000 };
    
    if (now > chatData.resetTime) {
        chatData.count = 0;
        chatData.resetTime = now + 60000;
    }
    
    if (chatData.count >= TELEGRAM_CONFIG.MAX_MESSAGES_PER_MINUTE) {
        console.log(`CHAT RATE LIMIT: ${chatId} exceeded ${TELEGRAM_CONFIG.MAX_MESSAGES_PER_MINUTE}/min`);
        return false;
    }
    
    // Update counters
    chatData.count++;
    chatMessageCount.set(chatKey, chatData);
    globalLastMessage.timestamp = now;
    
    return true;
}

// DUPLICATE DETECTION
function isActualDuplicate(requestId, queryId, modelType, message) {
    const now = Date.now();
    
    // Check global tracker
    const globalKey = `${queryId}_${modelType}`;
    if (globalRequestTracker.has(globalKey)) {
        const lastTime = globalRequestTracker.get(globalKey);
        if (now - lastTime < TELEGRAM_CONFIG.DUPLICATE_WINDOW) {
            console.log(`GLOBAL DUPLICATE: ${globalKey}`);
            return true;
        }
    }
    
    // Check request history
    const lastRequest = requestHistory.get(requestId);
    if (lastRequest && (now - lastRequest.timestamp) < TELEGRAM_CONFIG.DUPLICATE_WINDOW) {
        console.log(`RECENT DUPLICATE: ${requestId}`);
        return true;
    }
    
    // Check response count
    const responseCount = responseCounter.get(queryId) || 0;
    if (responseCount >= TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY) {
        console.log(`MAX RESPONSES REACHED: ${queryId} (${responseCount})`);
        return true;
    }
    
    return false;
}

// RECORD REQUEST
function recordRequest(requestId, queryId, modelType) {
    const now = Date.now();
    
    requestHistory.set(requestId, {
        timestamp: now,
        modelType: modelType,
        queryId: queryId
    });
    
    const currentCount = responseCounter.get(queryId) || 0;
    responseCounter.set(queryId, currentCount + 1);
    
    const globalKey = `${queryId}_${modelType}`;
    globalRequestTracker.set(globalKey, now);
    
    console.log(`REQUEST RECORDED: ${requestId} (${currentCount + 1}/${TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY})`);
}

// MESSAGE CLEANING
function cleanMessage(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .replace(/\[reasoning_effort:\s*\w+\]/gi, '')
        .replace(/\[verbosity:\s*\w+\]/gi, '')
        .replace(/\[model:\s*gpt-5[^\]]*\]/gi, '')
        .replace(/\*\*(.*?)\*\*/g, '*$1*')
        .replace(/```[\w]*\n?([\s\S]*?)\n?```/g, '`$1`')
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/^\n+|\n+$/g, '')
        .trim();
}

// MESSAGE SPLITTING
function splitMessage(message, modelType = 'analysis') {
    if (!message || message.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
        return [message];
    }
    
    const chunks = [];
    let remaining = message;
    let partNumber = 1;
    
    while (remaining.length > TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE) {
        let splitPoint = TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE - 100;
        
        // Find good split point
        const paragraphMatch = remaining.lastIndexOf('\n\n', splitPoint);
        if (paragraphMatch > splitPoint * 0.5) {
            splitPoint = paragraphMatch + 2;
        } else {
            const sentenceMatch = remaining.lastIndexOf('. ', splitPoint);
            if (sentenceMatch > splitPoint * 0.7) {
                splitPoint = sentenceMatch + 2;
            }
        }
        
        let chunk = remaining.substring(0, splitPoint).trim();
        chunk = `Part ${partNumber}\n\n${chunk}`;
        
        chunks.push(chunk);
        remaining = remaining.substring(splitPoint).trim();
        partNumber++;
    }
    
    if (remaining.length > 0) {
        if (partNumber > 1) {
            remaining = `Part ${partNumber} - Final\n\n${remaining}`;
        }
        chunks.push(remaining);
    }
    
    return chunks;
}

// SEND SINGLE MESSAGE
async function sendSingleMessage(bot, chatId, message, retryCount = 0) {
    try {
        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        return true;
    } catch (markdownError) {
        console.log(`Markdown failed, trying plain text: ${markdownError.message.substring(0, 100)}`);
        
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
            console.error(`Send failed (attempt ${retryCount + 1}): ${plainError.message.substring(0, 100)}`);
            
            if (retryCount < TELEGRAM_CONFIG.MAX_RETRIES && 
                (plainError.message.includes('network') || plainError.message.includes('timeout'))) {
                console.log(`Retrying in 2000ms...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return sendSingleMessage(bot, chatId, message, retryCount + 1);
            }
            
            return false;
        }
    }
}

// SEND CHUNKED MESSAGE
async function sendChunkedMessage(bot, chatId, message, delay = 500, modelType = 'analysis') {
    const chunks = splitMessage(message, modelType);
    let successCount = 0;
    
    console.log(`Sending ${chunks.length} chunks for ${modelType}`);
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        console.log(`Sending chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
        
        const sent = await sendSingleMessage(bot, chatId, chunk, 0);
        if (sent) {
            successCount++;
            console.log(`Chunk ${i + 1}/${chunks.length} delivered`);
        } else {
            console.log(`Chunk ${i + 1}/${chunks.length} failed - stopping`);
            break;
        }
        
        if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.max(delay, 400)));
        }
    }
    
    console.log(`Delivery: ${successCount}/${chunks.length} chunks sent`);
    return successCount > 0;
}

// MAIN SEND FUNCTION
async function sendGPT5Message(bot, chatId, message, title = null, metadata = {}) {
    const modelType = metadata.modelUsed || metadata.aiUsed || 'analysis';
    const queryId = generateQueryId(chatId, message);
    const requestId = generateRequestId(chatId, message, title, modelType);
    
    try {
        console.log(`Processing message for ${chatId} (Model: ${modelType})`);
        console.log(`Query ID: ${queryId}, Request ID: ${requestId}`);
        
        // Rate limiting check
        if (!checkRateLimit(chatId)) {
            console.log(`RATE LIMITED: Dropping message for ${chatId}`);
            return false;
        }
        
        // Duplicate check
        if (isActualDuplicate(requestId, queryId, modelType, message)) {
            console.log(`DUPLICATE: Dropping message ${requestId}`);
            return false;
        }
        
        // Active check
        if (activeRequests.has(requestId)) {
            console.log(`ALREADY PROCESSING: ${requestId}`);
            return false;
        }
        
        // Mark as active
        activeRequests.set(requestId, Date.now());
        setTimeout(() => activeRequests.delete(requestId), 30000);
        
        // Clean message
        let cleanedMessage = cleanMessage(message);
        
        if (!cleanedMessage || cleanedMessage.length < 5) {
            console.log(`Message too short after cleaning`);
            activeRequests.delete(requestId);
            return false;
        }
        
        // Add title
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
        
        // Record success
        if (result) {
            recordRequest(requestId, queryId, modelType);
        }
        
        // Cleanup
        activeRequests.delete(requestId);
        
        console.log(`${result ? 'SUCCESS' : 'FAILED'} Message delivery: ${requestId}`);
        return result;
        
    } catch (error) {
        console.error('Critical error in sendGPT5Message:', error.message);
        activeRequests.delete(requestId);
        return false;
    }
}

// LEGACY FUNCTIONS
async function sendGPTResponse(bot, chatId, response, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, { ...metadata, modelUsed: 'gpt-5' });
}

async function sendClaudeResponse(bot, chatId, response, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, { ...metadata, modelUsed: 'analysis' });
}

async function sendDualAIResponse(bot, chatId, response, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, { ...metadata, modelUsed: 'full' });
}

async function sendAnalysis(bot, chatId, analysis, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, analysis, title, { ...metadata, modelUsed: 'analysis' });
}

async function sendAlert(bot, chatId, alertMessage, title = 'Alert', metadata = {}) {
    const cambodiaTime = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Phnom_Penh',
        hour12: false 
    });
    
    const alertContent = `🚨 *${title}*\n\n${alertMessage}\n\n⏰ ${cambodiaTime} Cambodia`;
    
    return await sendGPT5Message(bot, chatId, alertContent, null, { ...metadata, modelUsed: 'error' });
}

// COMPOSITE WORKFLOW FUNCTION - NEW
async function sendCompositeResult(bot, chatId, workflowName, results, metadata = {}) {
    const combinedMessage = formatCompositeResults(workflowName, results);
    return await sendGPT5Message(bot, chatId, combinedMessage, workflowName, { 
        ...metadata, 
        modelUsed: 'composite' 
    });
}

// FORMAT COMPOSITE RESULTS
function formatCompositeResults(workflowName, results) {
    let formatted = `**${workflowName} - Complete Analysis**\n\n`;
    
    for (const [key, value] of Object.entries(results)) {
        formatted += `**${key.toUpperCase()}:**\n`;
        if (value.success) {
            formatted += `✅ ${JSON.stringify(value.results || value.data || 'Completed', null, 1)}\n\n`;
        } else {
            formatted += `❌ Error: ${value.error}\n\n`;
        }
    }
    
    formatted += `**Analysis Completed:** ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' })} Cambodia`;
    return formatted;
}

// STATS
function getStats() {
    return {
        activeRequests: activeRequests.size,
        requestHistory: requestHistory.size,
        globalTracker: globalRequestTracker.size,
        uniqueQueries: responseCounter.size,
        status: 'LOOP PREVENTION ACTIVE',
        maxResponsesPerQuery: TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY,
        globalCooldown: TELEGRAM_CONFIG.GLOBAL_COOLDOWN,
        maxMessagesPerMinute: TELEGRAM_CONFIG.MAX_MESSAGES_PER_MINUTE
    };
}

// CLEANUP
function aggressiveCleanup() {
    const now = Date.now();
    let cleaned = { active: 0, history: 0, global: 0, queries: 0, chatLimits: 0 };
    
    // Clean old active requests (1 minute)
    for (const [requestId, timestamp] of activeRequests.entries()) {
        if (now - timestamp > 60000) {
            activeRequests.delete(requestId);
            cleaned.active++;
        }
    }
    
    // Clean old history (10 minutes)
    for (const [requestId, data] of requestHistory.entries()) {
        if (now - data.timestamp > 600000) {
            requestHistory.delete(requestId);
            cleaned.history++;
        }
    }
    
    // Clean global tracker (5 minutes)
    for (const [globalKey, timestamp] of globalRequestTracker.entries()) {
        if (now - timestamp > 300000) {
            globalRequestTracker.delete(globalKey);
            cleaned.global++;
        }
    }
    
    // Clean query counters
    for (const [queryId] of responseCounter.entries()) {
        const hasRecentRequests = Array.from(requestHistory.entries())
            .some(([requestId, data]) => 
                requestId.startsWith(queryId) && now - data.timestamp < 300000
            );
        
        if (!hasRecentRequests) {
            responseCounter.delete(queryId);
            cleaned.queries++;
        }
    }
    
    // Clean chat limits
    for (const [chatKey, chatData] of chatMessageCount.entries()) {
        if (now > chatData.resetTime + 300000) {
            chatMessageCount.delete(chatKey);
            cleaned.chatLimits++;
        }
    }
    
    if (Object.values(cleaned).some(count => count > 0)) {
        console.log(`Cleanup completed:`, cleaned);
    }
}

// EMERGENCY RESET
function emergencyReset() {
    console.log('EMERGENCY RESET: Clearing all data');
    activeRequests.clear();
    requestHistory.clear();
    responseCounter.clear();
    globalRequestTracker.clear();
    chatMessageCount.clear();
    globalLastMessage.timestamp = 0;
    console.log('All tracking data cleared');
}

// Auto cleanup every minute
setInterval(aggressiveCleanup, 60000);

function manualCleanup() {
    console.log('Manual cleanup starting...');
    aggressiveCleanup();
    console.log('Stats after cleanup:', getStats());
}

// EXPORTS
module.exports = {
    // Main functions
    sendGPT5Message,
    sendGPTResponse,
    sendClaudeResponse, 
    sendDualAIResponse,
    sendAnalysis,
    sendAlert,
    sendCompositeResult, // NEW: For composite workflows
    
    // Utility functions
    cleanMessage,
    splitMessage,
    formatCompositeResults, // NEW: Format results
    getStats,
    manualCleanup,
    aggressiveCleanup,
    emergencyReset,
    
    // Debugging
    generateRequestId,
    generateQueryId,
    isActualDuplicate,
    checkRateLimit,
    
    // Config
    TELEGRAM_CONFIG,
    MESSAGE_TYPES
};

console.log('LOOP PREVENTION: Telegram splitter loaded with strict controls');
console.log('Settings: 1 response/query, 3s cooldown, 12 msgs/min per chat');
console.log('Cleanup every 60s, emergency reset available');
