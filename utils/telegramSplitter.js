// utils/telegramSplitter.js - IMPROVED VERSION WITH SMART DUPLICATE PREVENTION
// Handles multiple AI model responses while preventing actual duplicates

const crypto = require('crypto');

// 🎯 TELEGRAM CONFIGURATION  
const TELEGRAM_CONFIG = {
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_MESSAGE_LENGTH: 4000,
    OPTIMAL_CHUNK_SIZE: 3800,
    FAST_DELAY: 250,
    STANDARD_DELAY: 450,
    // Different timeouts for different scenarios
    DUPLICATE_WINDOW: 3000,        // 3 seconds for exact duplicates
    MULTI_MODEL_WINDOW: 30000,     // 30 seconds for multi-model responses
    MAX_RESPONSES_PER_QUERY: 1     // Allow up to 5 model responses per query
};

// 🚀 MESSAGE TYPES WITH BETTER IDENTIFICATION
const MESSAGE_TYPES = {
    'nano': { emoji: '⚡', delay: 150, description: 'GPT-5 Nano', priority: 1 },
    'mini': { emoji: '🔥', delay: 250, description: 'GPT-5 Mini', priority: 2 },
    'full': { emoji: '🧠', delay: 450, description: 'GPT-5 Full', priority: 3 },
    'gpt-5': { emoji: '🤖', delay: 450, description: 'GPT-5', priority: 3 },
    'chat': { emoji: '💬', delay: 250, description: 'Chat', priority: 1 },
    'analysis': { emoji: '📊', delay: 450, description: 'Analysis', priority: 3 },
    'error': { emoji: '❌', delay: 100, description: 'Error', priority: 0 },
    'credit': { emoji: '🏦', delay: 350, description: 'Credit Analysis', priority: 2 },
    'risk': { emoji: '⚠️', delay: 350, description: 'Risk Assessment', priority: 2 },
    'recovery': { emoji: '💰', delay: 350, description: 'Loan Recovery', priority: 2 },
    'compliance': { emoji: '🔍', delay: 350, description: 'Due Diligence', priority: 2 }
};

// 🛡️ SMART DUPLICATE PREVENTION
const activeRequests = new Map();
const requestHistory = new Map();
const responseCounter = new Map(); // Track multiple responses per query

function generateRequestId(chatId, message, title, modelType) {
    // Create base ID from user query (first 150 chars to capture intent)
    const baseContent = `${chatId}_${message.substring(0, 150)}`;
    const baseId = crypto.createHash('md5').update(baseContent).digest('hex').substring(0, 8);
    
    // Add model-specific suffix for multi-model scenarios
    const modelSuffix = modelType ? `_${modelType}` : '';
    return `${baseId}${modelSuffix}`;
}

function generateQueryId(chatId, message) {
    // Generate ID for the original user query (ignores model type)
    const queryContent = `${chatId}_${message.substring(0, 150)}`;
    return crypto.createHash('md5').update(queryContent).digest('hex').substring(0, 8);
}

function isActualDuplicate(requestId, queryId, modelType, message) {
    const now = Date.now();
    
    // Check for exact duplicate (same model, same message)
    const lastRequest = requestHistory.get(requestId);
    if (lastRequest && (now - lastRequest.timestamp) < TELEGRAM_CONFIG.DUPLICATE_WINDOW) {
        console.log(`🚫 Exact duplicate blocked: ${requestId}`);
        return true;
    }
    
    // Check response counter for this query
    const responseCount = responseCounter.get(queryId) || 0;
    
    // Allow multiple different model responses for same query
    if (responseCount < TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY) {
        // Check if we already have this specific model response
        const existingResponses = Array.from(requestHistory.entries())
            .filter(([id, data]) => id.startsWith(queryId) && (now - data.timestamp) < TELEGRAM_CONFIG.MULTI_MODEL_WINDOW)
            .map(([id]) => id);
        
        if (existingResponses.includes(requestId)) {
            console.log(`🔄 Same model response already sent: ${requestId}`);
            return true;
        }
        
        // This is a different model response for the same query - allow it
        console.log(`✅ Multi-model response allowed: ${modelType} for query ${queryId} (${responseCount + 1}/${TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY})`);
        return false;
    }
    
    // Too many responses for this query
    console.log(`🛑 Max responses reached for query: ${queryId}`);
    return true;
}

function recordRequest(requestId, queryId, modelType) {
    const now = Date.now();
    
    // Record this specific request
    requestHistory.set(requestId, {
        timestamp: now,
        modelType: modelType,
        queryId: queryId
    });
    
    // Update response counter
    const currentCount = responseCounter.get(queryId) || 0;
    responseCounter.set(queryId, currentCount + 1);
    
    console.log(`📝 Request recorded: ${requestId} (Query: ${queryId}, Model: ${modelType}, Count: ${currentCount + 1})`);
}

// 🧹 ENHANCED MESSAGE CLEANING
function cleanMessage(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
        // Remove GPT-5 specific tags
        .replace(/\[reasoning_effort:\s*\w+\]/gi, '')
        .replace(/\[verbosity:\s*\w+\]/gi, '')
        .replace(/\[model:\s*gpt-5[^\]]*\]/gi, '')
        .replace(/\[gpt-5[^\]]*\]/gi, '')
        .replace(/\(confidence:\s*\d+%\)/gi, '')
        .replace(/\(model:\s*gpt-5[^\)]*\)/gi, '')
        
        // Clean markdown formatting for Telegram
        .replace(/\*\*(.*?)\*\*/g, '*$1*')
        .replace(/```[\w]*\n?([\s\S]*?)\n?```/g, '`$1`')
        .replace(/#{1,6}\s*(.*)/g, '*$1*')
        
        // Remove excessive newlines
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/^\n+|\n+$/g, '')
        .trim();
}

// 📦 SMART MESSAGE SPLITTING
function splitMessage(message, modelType = 'analysis') {
    if (!message || message.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
        return [message];
    }
    
    const chunks = [];
    let remaining = message;
    let partNumber = 1;
    
    while (remaining.length > TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE) {
        let splitPoint = TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE - 100;
        
        // Try to find good split points (prioritize by importance)
        const splitPatterns = [
            { pattern: /\n\n#{1,6}\s/g, priority: 1 },  // Headers
            { pattern: /\n\n\d+\.\s/g, priority: 2 },   // Numbered lists  
            { pattern: /\n\n•\s/g, priority: 3 },       // Bullet points
            { pattern: /\n\n/g, priority: 4 },          // Paragraphs
            { pattern: /\.\s+/g, priority: 5 },         // Sentences
            { pattern: /;\s+/g, priority: 6 },          // Semicolons
            { pattern: /,\s+/g, priority: 7 }           // Commas
        ];
        
        let bestSplitPoint = null;
        let bestPriority = 999;
        
        for (const { pattern, priority } of splitPatterns) {
            const matches = [...remaining.matchAll(pattern)];
            for (let i = matches.length - 1; i >= 0; i--) {
                const matchEnd = matches[i].index + matches[i][0].length;
                if (matchEnd >= splitPoint * 0.6 && matchEnd <= splitPoint && priority < bestPriority) {
                    bestSplitPoint = matchEnd;
                    bestPriority = priority;
                    break;
                }
            }
        }
        
        splitPoint = bestSplitPoint || splitPoint;
        
        let chunk = remaining.substring(0, splitPoint).trim();
        
        // Add part header with model type context
        const typeConfig = MESSAGE_TYPES[modelType] || MESSAGE_TYPES.analysis;
        chunk = `📄 *Part ${partNumber}* ${typeConfig.emoji}\n\n${chunk}`;
        
        chunks.push(chunk);
        remaining = remaining.substring(splitPoint).trim();
        partNumber++;
    }
    
    if (remaining.length > 0) {
        if (partNumber > 1) {
            const typeConfig = MESSAGE_TYPES[modelType] || MESSAGE_TYPES.analysis;
            remaining = `📄 *Part ${partNumber} - Final* ${typeConfig.emoji}\n\n${remaining}`;
        }
        chunks.push(remaining);
    }
    
    return chunks;
}

// 📤 ENHANCED SEND SINGLE MESSAGE
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
            // More aggressive plain text conversion
            const plainMessage = message
                .replace(/\*([^*]+)\*/g, '$1')
                .replace(/`([^`]+)`/g, '$1')
                .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/[*_`~\[\]]/g, '');
                
            await bot.sendMessage(chatId, plainMessage, {
                disable_web_page_preview: true
            });
            return true;
        } catch (plainError) {
            console.error(`❌ Send failed (attempt ${retryCount + 1}):`, plainError.message);
            
            // Retry logic for network issues
            if (retryCount < 2 && (plainError.message.includes('network') || plainError.message.includes('timeout'))) {
                console.log(`🔄 Retrying in ${(retryCount + 1) * 1000}ms...`);
                await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
                return sendSingleMessage(bot, chatId, message, retryCount + 1);
            }
            
            return false;
        }
    }
}

// 📦 ENHANCED CHUNKED MESSAGE SENDING
async function sendChunkedMessage(bot, chatId, message, delay = 250, modelType = 'analysis') {
    const chunks = splitMessage(message, modelType);
    let successCount = 0;
    
    console.log(`📦 Sending ${chunks.length} chunks for ${modelType} model`);
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isLast = i === chunks.length - 1;
        
        console.log(`📤 Sending chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
        
        const sent = await sendSingleMessage(bot, chatId, chunk);
        if (sent) {
            successCount++;
            console.log(`✅ Chunk ${i + 1}/${chunks.length} delivered`);
        } else {
            console.log(`❌ Chunk ${i + 1}/${chunks.length} failed`);
        }
        
        // Adaptive delay based on success rate
        if (!isLast && sent) {
            const adaptiveDelay = successCount === i + 1 ? delay : delay * 1.5;
            await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
        }
    }
    
    console.log(`📊 Delivery summary: ${successCount}/${chunks.length} chunks sent (${((successCount/chunks.length)*100).toFixed(1)}%)`);
    return successCount > 0;
}

// 🚀 MAIN ENHANCED SEND FUNCTION
async function sendGPT5Message(bot, chatId, message, title = null, metadata = {}) {
    const modelType = metadata.modelUsed || metadata.aiUsed || 'analysis';
    const queryId = generateQueryId(chatId, message);
    const requestId = generateRequestId(chatId, message, title, modelType);
    
    try {
        console.log(`📱 Processing message for ${chatId}`);
        console.log(`🔍 Query ID: ${queryId}, Request ID: ${requestId}, Model: ${modelType}`);
        
        // Smart duplicate check
        if (isActualDuplicate(requestId, queryId, modelType, message)) {
            return false;
        }
        
        // Check if already processing this exact request
        if (activeRequests.has(requestId)) {
            console.log(`⏳ Already processing request: ${requestId}`);
            return false;
        }
        
        // Mark as active
        activeRequests.set(requestId, Date.now());
        
        // Clean message
        let cleanedMessage = cleanMessage(message);
        
        if (!cleanedMessage || cleanedMessage.length < 10) {
            console.log(`⚠️ Message too short or empty after cleaning`);
            activeRequests.delete(requestId);
            return false;
        }
        
        // Add enhanced title with model info
        if (title) {
            const typeConfig = MESSAGE_TYPES[modelType] || MESSAGE_TYPES.analysis;
            const enhancedTitle = `${typeConfig.emoji} *${title}*`;
            
            // Add model indicator for multi-model responses
            const responseCount = responseCounter.get(queryId) || 0;
            if (responseCount > 0) {
                const modelIndicator = ` (${typeConfig.description})`;
                cleanedMessage = `${enhancedTitle}${modelIndicator}\n\n${cleanedMessage}`;
            } else {
                cleanedMessage = `${enhancedTitle}\n\n${cleanedMessage}`;
            }
        }
        
        // Send message with appropriate method
        let result;
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
        
        const status = result ? '✅ SUCCESS' : '❌ FAILED';
        console.log(`${status} Message delivery for ${modelType}: ${requestId}`);
        
        return result;
        
    } catch (error) {
        console.error('❌ Send error:', error.message);
        activeRequests.delete(requestId);
        
        // Emergency fallback
        try {
            const fallbackMsg = `🚨 *Delivery Error*\n\nModel: ${modelType}\nError: ${error.message.substring(0, 100)}...\n\n⏰ ${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Phnom_Penh', hour12: false })} Cambodia`;
            await bot.sendMessage(chatId, fallbackMsg);
            return true;
        } catch (fallbackError) {
            console.error('❌ Fallback failed:', fallbackError.message);
            return false;
        }
    }
}

// 🔄 ENHANCED LEGACY COMPATIBILITY FUNCTIONS
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

// 📊 ENHANCED STATS AND MONITORING
function getStats() {
    const now = Date.now();
    let activeCount = 0;
    let historyCount = 0;
    let queryCount = 0;
    
    // Count active requests
    for (const [requestId, timestamp] of activeRequests.entries()) {
        if (now - timestamp < 300000) { // 5 minutes
            activeCount++;
        }
    }
    
    // Count recent history
    for (const [requestId, data] of requestHistory.entries()) {
        if (now - data.timestamp < 300000) { // 5 minutes
            historyCount++;
        }
    }
    
    // Count unique queries
    for (const [queryId, count] of responseCounter.entries()) {
        queryCount++;
    }
    
    return {
        activeRequests: activeCount,
        requestHistory: historyCount,
        uniqueQueries: queryCount,
        status: 'SMART MULTI-MODEL MODE',
        duplicateWindow: TELEGRAM_CONFIG.DUPLICATE_WINDOW,
        multiModelWindow: TELEGRAM_CONFIG.MULTI_MODEL_WINDOW,
        maxResponsesPerQuery: TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY
    };
}

// 🧹 AUTOMATIC CLEANUP WITH BETTER LOGIC
function autoCleanup() {
    const now = Date.now();
    let cleaned = {
        requests: 0,
        history: 0,
        queries: 0
    };
    
    // Clean old active requests (shouldn't be active for > 5 minutes)
    for (const [requestId, timestamp] of activeRequests.entries()) {
        if (now - timestamp > 300000) { // 5 minutes
            activeRequests.delete(requestId);
            cleaned.requests++;
        }
    }
    
    // Clean old request history (keep 1 hour)
    for (const [requestId, data] of requestHistory.entries()) {
        if (now - data.timestamp > 3600000) { // 1 hour
            requestHistory.delete(requestId);
            cleaned.history++;
        }
    }
    
    // Clean old query counters (keep 30 minutes for multi-model responses)
    const queriesForRemoval = [];
    for (const [queryId] of responseCounter.entries()) {
        const hasRecentRequests = Array.from(requestHistory.entries())
            .some(([requestId, data]) => 
                requestId.startsWith(queryId) && 
                now - data.timestamp < 1800000 // 30 minutes
            );
        
        if (!hasRecentRequests) {
            queriesForRemoval.push(queryId);
        }
    }
    
    queriesForRemoval.forEach(queryId => {
        responseCounter.delete(queryId);
        cleaned.queries++;
    });
    
    if (cleaned.requests > 0 || cleaned.history > 0 || cleaned.queries > 0) {
        console.log(`🧹 Auto cleanup: ${cleaned.requests} active, ${cleaned.history} history, ${cleaned.queries} queries`);
    }
}

// Auto cleanup every 10 minutes
setInterval(autoCleanup, 600000);

// 🧹 MANUAL CLEANUP FUNCTION
function manualCleanup() {
    console.log('🧹 Starting manual cleanup...');
    autoCleanup();
    
    const stats = getStats();
    console.log('📊 Post-cleanup stats:', stats);
}

// 📤 EXPORTS - ENHANCED MULTI-MODEL VERSION
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
    autoCleanup,
    
    // New functions for debugging
    generateRequestId,
    generateQueryId,
    isActualDuplicate,
    
    // Config
    TELEGRAM_CONFIG,
    MESSAGE_TYPES
};

console.log('🚀 SMART MULTI-MODEL MODE: Telegram splitter loaded');
console.log('✅ Multi-model responses enabled with smart duplicate prevention');
console.log('🛡️ Auto-cleanup active every 10 minutes');
console.log(`📊 Max ${TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY} responses per query within ${TELEGRAM_CONFIG.MULTI_MODEL_WINDOW/1000}s window`);
