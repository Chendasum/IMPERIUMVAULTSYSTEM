// utils/telegramSplitter.js - EMERGENCY SAFE VERSION
// Minimal duplicate-safe message delivery - NO AUTO FUNCTIONS

const crypto = require('crypto');

// 🎯 SIMPLE TELEGRAM CONFIGURATION  
const TELEGRAM_CONFIG = {
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_MESSAGE_LENGTH: 4000,
    OPTIMAL_CHUNK_SIZE: 3800,
    FAST_DELAY: 250,
    STANDARD_DELAY: 450,
    DUPLICATE_WINDOW: 5000
};

// 🚀 MESSAGE TYPES
const MESSAGE_TYPES = {
    'nano': { emoji: '⚡', delay: 150, description: 'Ultra Fast' },
    'mini': { emoji: '🔥', delay: 250, description: 'Fast' },
    'full': { emoji: '🧠', delay: 450, description: 'Smart' },
    'chat': { emoji: '💬', delay: 250, description: 'Chat' },
    'analysis': { emoji: '📊', delay: 450, description: 'Analysis' },
    'error': { emoji: '❌', delay: 100, description: 'Error' }
};

// 🛡️ SIMPLE DUPLICATE PREVENTION
const activeRequests = new Map();
const requestHistory = new Map();

function generateRequestId(chatId, message, title) {
    const content = `${chatId}_${message.substring(0, 100)}_${title || 'none'}`;
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 12);
}

function isDuplicate(requestId) {
    const now = Date.now();
    const lastRequest = requestHistory.get(requestId);
    
    if (lastRequest && (now - lastRequest) < TELEGRAM_CONFIG.DUPLICATE_WINDOW) {
        console.log(`🚫 Duplicate blocked: ${requestId}`);
        return true;
    }
    
    requestHistory.set(requestId, now);
    return false;
}

// 🧹 CLEAN MESSAGE TEXT
function cleanMessage(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .replace(/\[reasoning_effort:\s*\w+\]/gi, '')
        .replace(/\[verbosity:\s*\w+\]/gi, '')
        .replace(/\[model:\s*gpt-5[^\]]*\]/gi, '')
        .replace(/\(confidence:\s*\d+%\)/gi, '')
        .replace(/\*\*(.*?)\*\*/g, '*$1*')
        .replace(/```[\w]*\n?([\s\S]*?)\n?```/g, '`$1`')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// 📦 SPLIT LONG MESSAGES
function splitMessage(message) {
    if (!message || message.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
        return [message];
    }
    
    const chunks = [];
    let remaining = message;
    let partNumber = 1;
    
    while (remaining.length > TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE) {
        let splitPoint = TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE - 100;
        
        // Try to find good split points
        const splitPatterns = [/\n\n/g, /\.\s/g, /;\s/g, /,\s/g];
        
        for (const pattern of splitPatterns) {
            const matches = [...remaining.matchAll(pattern)];
            for (let i = matches.length - 1; i >= 0; i--) {
                const matchEnd = matches[i].index + matches[i][0].length;
                if (matchEnd >= splitPoint * 0.7 && matchEnd <= splitPoint) {
                    splitPoint = matchEnd;
                    break;
                }
            }
            if (splitPoint !== TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE - 100) break;
        }
        
        let chunk = remaining.substring(0, splitPoint).trim();
        chunk = `📄 *Part ${partNumber}*\n\n${chunk}`;
        
        chunks.push(chunk);
        remaining = remaining.substring(splitPoint).trim();
        partNumber++;
    }
    
    if (remaining.length > 0) {
        if (partNumber > 1) {
            remaining = `📄 *Part ${partNumber} - Final*\n\n${remaining}`;
        }
        chunks.push(remaining);
    }
    
    return chunks;
}

// 📤 SEND SINGLE MESSAGE
async function sendSingleMessage(bot, chatId, message) {
    try {
        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        return true;
    } catch (markdownError) {
        try {
            const plainMessage = message.replace(/[*_`~\[\]]/g, '');
            await bot.sendMessage(chatId, plainMessage, {
                disable_web_page_preview: true
            });
            return true;
        } catch (plainError) {
            console.error('❌ Send failed:', plainError.message);
            return false;
        }
    }
}

// 📦 SEND CHUNKED MESSAGE
async function sendChunkedMessage(bot, chatId, message, delay = 250) {
    const chunks = splitMessage(message);
    let successCount = 0;
    
    console.log(`📦 Sending ${chunks.length} chunks`);
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isLast = i === chunks.length - 1;
        
        const sent = await sendSingleMessage(bot, chatId, chunk);
        if (sent) {
            successCount++;
            console.log(`✅ Chunk ${i + 1}/${chunks.length} sent`);
        }
        
        if (!isLast && sent) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    console.log(`📊 Sent ${successCount}/${chunks.length} chunks`);
    return successCount > 0;
}

// 🚀 MAIN SEND FUNCTION
async function sendGPT5Message(bot, chatId, message, title = null, metadata = {}) {
    const requestId = generateRequestId(chatId, message, title);
    
    try {
        console.log(`📱 Sending message to ${chatId} (${requestId})`);
        
        // Check for duplicates
        if (isDuplicate(requestId)) {
            return false;
        }
        
        // Check if already processing
        if (activeRequests.has(requestId)) {
            console.log(`⏳ Already processing: ${requestId}`);
            return false;
        }
        
        // Mark as active
        activeRequests.set(requestId, Date.now());
        
        // Clean message
        let cleanedMessage = cleanMessage(message);
        
        // Add title if provided
        if (title) {
            const messageType = metadata.modelUsed || 'analysis';
            const typeConfig = MESSAGE_TYPES[messageType] || MESSAGE_TYPES.analysis;
            const header = `${typeConfig.emoji} *${title}*`;
            cleanedMessage = `${header}\n\n${cleanedMessage}`;
        }
        
        // Send message
        let result;
        if (cleanedMessage.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
            result = await sendSingleMessage(bot, chatId, cleanedMessage);
        } else {
            const delay = MESSAGE_TYPES[metadata.modelUsed]?.delay || TELEGRAM_CONFIG.STANDARD_DELAY;
            result = await sendChunkedMessage(bot, chatId, cleanedMessage, delay);
        }
        
        // Clean up
        activeRequests.delete(requestId);
        
        console.log(`${result ? '✅' : '❌'} Message delivery: ${result}`);
        return result;
        
    } catch (error) {
        console.error('❌ Send error:', error.message);
        activeRequests.delete(requestId);
        
        // Emergency fallback
        try {
            await bot.sendMessage(chatId, `🚨 Message delivery failed: ${error.message.substring(0, 100)}`);
            return true;
        } catch (fallbackError) {
            console.error('❌ Fallback failed:', fallbackError.message);
            return false;
        }
    }
}

// 🔄 LEGACY COMPATIBILITY FUNCTIONS
async function sendGPTResponse(bot, chatId, response, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        modelUsed: 'full'
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
    
    const alertContent = `🚨 *${title}*\n\n${alertMessage}\n\n⏰ Time: ${cambodiaTime} Cambodia`;
    
    return await sendGPT5Message(bot, chatId, alertContent, null, {
        ...metadata,
        modelUsed: 'error'
    });
}

// 📊 SIMPLE STATS
function getStats() {
    return {
        activeRequests: activeRequests.size,
        requestHistory: requestHistory.size,
        status: 'EMERGENCY SAFE MODE'
    };
}

// 🧹 MANUAL CLEANUP (call if needed)
function manualCleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [requestId, timestamp] of requestHistory.entries()) {
        if (now - timestamp > 60000) { // 1 minute old
            requestHistory.delete(requestId);
            cleaned++;
        }
    }
    
    console.log(`🧹 Manual cleanup: ${cleaned} old requests removed`);
}

// 📤 EXPORTS - EMERGENCY SAFE VERSION
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
    
    // Config
    TELEGRAM_CONFIG,
    MESSAGE_TYPES
};

console.log('🚨 EMERGENCY SAFE MODE: Telegram splitter loaded');
console.log('✅ Core functions available, NO auto-executing code');
console.log('🛡️ Duplicate prevention active, manual cleanup only');
