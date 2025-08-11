// utils/telegramSplitter.js - Clean Message Handling for Telegram
// Professional message splitting and formatting without theatrical elements

const TELEGRAM_LIMITS = {
    MAX_MESSAGE_LENGTH: 4096,          // Telegram's hard limit
    SAFE_MESSAGE_LENGTH: 4000,         // Safe limit with buffer
    MAX_CAPTION_LENGTH: 1024,          // For media captions
    OPTIMAL_CHUNK_SIZE: 3800,          // Optimal chunk size
    MAX_CHUNKS_PER_MESSAGE: 15,        // Prevent spam
    MESSAGE_DELAY_MS: 1000,            // Delay between message chunks
    PRIORITY_DELAY_MS: 500             // Faster for urgent messages
};

// 📊 MESSAGE TYPES
const MESSAGE_TYPES = {
    'general': { emoji: '💬', priority: 'normal' },
    'analysis': { emoji: '📊', priority: 'high' },
    'cambodia': { emoji: '🇰🇭', priority: 'high' },
    'market': { emoji: '📈', priority: 'high' },
    'portfolio': { emoji: '💼', priority: 'high' },
    'alert': { emoji: '🚨', priority: 'urgent' },
    'regime': { emoji: '🏛️', priority: 'high' },
    'anomaly': { emoji: '⚠️', priority: 'urgent' }
};

/**
 * 🧹 Clean response text for better readability
 */
function cleanResponse(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    return text
        // Clean up markdown formatting
        .replace(/\*\*(.*?)\*\*/g, '$1')        // Remove **bold**
        .replace(/^\s*[-*+]\s+/gm, '• ')        // Clean bullet points
        .replace(/^#{1,6}\s+(.*)$/gm, '$1')     // Remove markdown headers
        
        // Clean up excessive spacing
        .replace(/\n{3,}/g, '\n\n')             // Max 2 line breaks
        .replace(/^\s+|\s+$/g, '')              // Trim whitespace
        .trim();
}

/**
 * 📱 Smart message sender with intelligent splitting
 */
async function sendSmartMessage(bot, chatId, message, options = {}) {
    try {
        console.log(`📱 Sending message to ${chatId} (${message?.length || 0} chars)`);
        
        if (!message || message.trim().length === 0) {
            console.log('⚠️ Empty message - skipping send');
            return false;
        }
        
        // Clean the message
        let cleanedMessage = cleanResponse(message);
        
        // Add optional title
        if (options.title) {
            const messageType = MESSAGE_TYPES[options.type] || MESSAGE_TYPES.general;
            cleanedMessage = `${messageType.emoji} **${options.title}**\n\n${cleanedMessage}`;
        }
        
        // Check if message needs splitting
        if (cleanedMessage.length <= TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
            // Single message - send directly
            try {
                await bot.sendMessage(chatId, cleanedMessage, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: options.disablePreview !== false
                });
                
                console.log(`✅ Message sent (${cleanedMessage.length} chars)`);
                return true;
                
            } catch (sendError) {
                console.log('⚠️ Markdown failed, trying plain text');
                
                // Fallback to plain text
                const plainMessage = cleanedMessage.replace(/[*_`~]/g, '');
                await bot.sendMessage(chatId, plainMessage, {
                    disable_web_page_preview: options.disablePreview !== false
                });
                
                console.log(`✅ Message sent as plain text (${plainMessage.length} chars)`);
                return true;
            }
        }
        
        // Message needs splitting
        const chunks = splitMessage(cleanedMessage, options);
        
        if (chunks.length > TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE) {
            console.log(`⚠️ Message too long (${chunks.length} chunks), truncating`);
            chunks.splice(TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE);
            chunks[chunks.length - 1] += '\n\n*(Message truncated due to length)*';
        }
        
        // Send chunks with appropriate delays
        const messageType = MESSAGE_TYPES[options.type] || MESSAGE_TYPES.general;
        const delay = messageType.priority === 'urgent' ? 
            TELEGRAM_LIMITS.PRIORITY_DELAY_MS : 
            TELEGRAM_LIMITS.MESSAGE_DELAY_MS;
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const isLast = i === chunks.length - 1;
            
            try {
                await bot.sendMessage(chatId, chunk, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: options.disablePreview !== false
                });
                
                console.log(`✅ Chunk ${i + 1}/${chunks.length} sent (${chunk.length} chars)`);
                
                // Add delay between chunks (except last)
                if (!isLast) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
            } catch (chunkError) {
                console.error(`❌ Chunk ${i + 1} failed:`, chunkError.message);
                
                // Try plain text fallback
                try {
                    const plainChunk = chunk.replace(/[*_`~]/g, '');
                    await bot.sendMessage(chatId, plainChunk);
                    console.log(`✅ Chunk ${i + 1} sent as plain text`);
                } catch (fallbackError) {
                    console.error(`❌ Chunk ${i + 1} completely failed`);
                }
            }
        }
        
        console.log(`✅ Message complete: ${chunks.length} chunks sent`);
        return true;
        
    } catch (error) {
        console.error('❌ Smart message error:', error.message);
        
        // Emergency fallback
        try {
            const emergency = `⚠️ Message delivery error: ${error.message}`;
            await bot.sendMessage(chatId, emergency.substring(0, TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH));
        } catch (emergencyError) {
            console.error('❌ Emergency fallback failed:', emergencyError.message);
        }
        
        return false;
    }
}

/**
 * ✂️ Split message intelligently
 */
function splitMessage(message, options = {}) {
    const chunks = [];
    let remaining = message;
    let partNumber = 1;
    
    const maxChunkSize = TELEGRAM_LIMITS.OPTIMAL_CHUNK_SIZE;
    const messageType = MESSAGE_TYPES[options.type] || MESSAGE_TYPES.general;
    
    while (remaining.length > maxChunkSize) {
        // Find good split point
        let splitPoint = findBestSplitPoint(remaining, maxChunkSize);
        
        if (splitPoint === -1) {
            // Force split if no good point found
            splitPoint = maxChunkSize - 100;
        }
        
        // Extract chunk
        let chunk = remaining.substring(0, splitPoint).trim();
        
        // Add part header for multi-part messages
        if (options.title || chunks.length > 0) {
            const partHeader = `${messageType.emoji} *(Part ${partNumber})*\n\n`;
            
            // Ensure chunk fits with header
            if (chunk.length + partHeader.length > maxChunkSize) {
                const availableSpace = maxChunkSize - partHeader.length - 50;
                chunk = chunk.substring(0, availableSpace).trim();
                
                // Try to end at sentence or line break
                const lastSentence = chunk.lastIndexOf('.');
                const lastLine = chunk.lastIndexOf('\n');
                const cutPoint = Math.max(lastSentence, lastLine);
                
                if (cutPoint > availableSpace * 0.7) {
                    chunk = chunk.substring(0, cutPoint + 1).trim();
                }
            }
            
            chunk = partHeader + chunk;
        }
        
        chunks.push(chunk);
        remaining = remaining.substring(chunk.length - (chunks.length > 1 ? partHeader.length : 0)).trim();
        partNumber++;
        
        // Safety check
        if (partNumber > TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE) {
            console.log('⚠️ Reached maximum chunks limit');
            break;
        }
    }
    
    // Add remaining content as final chunk
    if (remaining.length > 0) {
        let finalChunk = remaining;
        
        if (partNumber > 1) {
            const finalHeader = `${messageType.emoji} *(Part ${partNumber} - Final)*\n\n`;
            finalChunk = finalHeader + remaining;
        }
        
        chunks.push(finalChunk);
    }
    
    return chunks;
}

/**
 * 🔍 Find best point to split message
 */
function findBestSplitPoint(text, maxLength) {
    // Preferred split patterns (in order of preference)
    const splitPatterns = [
        /\n\n/g,               // Double line breaks (paragraphs)
        /\.\s+/g,              // End of sentences
        /\n/g,                 // Single line breaks
        /;\s+/g,               // Semicolons
        /,\s+/g                // Commas (last resort)
    ];
    
    const minSplitPoint = maxLength * 0.7; // Don't split too early
    
    for (const pattern of splitPatterns) {
        const matches = [...text.matchAll(pattern)];
        
        // Find last good match within range
        for (let i = matches.length - 1; i >= 0; i--) {
            const matchEnd = matches[i].index + matches[i][0].length;
            
            if (matchEnd >= minSplitPoint && matchEnd <= maxLength) {
                return matchEnd;
            }
        }
    }
    
    return -1; // No good split point found
}

/**
 * 📊 Send analysis response
 */
async function sendAnalysis(bot, chatId, analysis, title = null, analysisType = 'analysis') {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: analysisType,
        disablePreview: true
    });
}

/**
 * 🇰🇭 Send Cambodia analysis
 */
async function sendCambodiaAnalysis(bot, chatId, analysis, title = 'Cambodia Analysis') {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'cambodia',
        disablePreview: true
    });
}

/**
 * 📈 Send market analysis
 */
async function sendMarketAnalysis(bot, chatId, analysis, title = 'Market Analysis') {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'market',
        disablePreview: true
    });
}

/**
 * 💼 Send portfolio analysis
 */
async function sendPortfolioAnalysis(bot, chatId, analysis, title = 'Portfolio Analysis') {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'portfolio',
        disablePreview: true
    });
}

/**
 * 🚨 Send urgent alert
 */
async function sendAlert(bot, chatId, alertMessage, title = 'Alert') {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Phnom_Penh',
        hour12: false 
    });
    
    const alertContent = `*Time:* ${timestamp} Cambodia\n\n${alertMessage}`;
    
    return await sendSmartMessage(bot, chatId, alertContent, {
        title: title,
        type: 'alert',
        disablePreview: true
    });
}

/**
 * 🏛️ Send regime analysis
 */
async function sendRegimeAnalysis(bot, chatId, analysis, title = 'Economic Regime Analysis') {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'regime',
        disablePreview: true
    });
}

/**
 * ⚠️ Send anomaly detection
 */
async function sendAnomalyAlert(bot, chatId, analysis, title = 'Market Anomaly Detected') {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'anomaly',
        disablePreview: true
    });
}

/**
 * 📊 Get message statistics
 */
function getMessageStats(message) {
    if (!message || typeof message !== 'string') {
        return {
            length: 0,
            chunks: 0,
            estimatedSendTime: 0,
            type: 'invalid'
        };
    }
    
    const length = message.length;
    const chunks = Math.ceil(length / TELEGRAM_LIMITS.OPTIMAL_CHUNK_SIZE);
    const estimatedSendTime = chunks > 1 ? 
        (chunks - 1) * TELEGRAM_LIMITS.MESSAGE_DELAY_MS + 1000 : 1000;
    
    let type = 'short';
    if (length > TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
        type = chunks <= 3 ? 'medium' : 'long';
    }
    
    return {
        length,
        chunks,
        estimatedSendTime,
        type,
        withinLimits: length <= TELEGRAM_LIMITS.MAX_MESSAGE_LENGTH
    };
}

/**
 * 🔧 Format response with timestamp
 */
function formatWithTimestamp(message, includeTimestamp = false) {
    if (!includeTimestamp) {
        return message;
    }
    
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Phnom_Penh',
        hour12: false 
    });
    
    return `*Time:* ${timestamp} Cambodia\n\n${message}`;
}

/**
 * 📝 Legacy compatibility functions
 */

// Legacy function names for backward compatibility
async function sendSmartResponse(bot, chatId, message, title = null, messageType = 'general', options = {}) {
    return await sendSmartMessage(bot, chatId, message, {
        title: title,
        type: messageType,
        ...options
    });
}

function cleanStrategicResponse(text) {
    return cleanResponse(text);
}

async function sendLongMessage(bot, chatId, message, delay = TELEGRAM_LIMITS.MESSAGE_DELAY_MS) {
    return await sendSmartMessage(bot, chatId, message, {
        type: 'general'
    });
}

function splitLongMessage(message, maxLength = TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
    if (message.length <= maxLength) {
        return [message];
    }
    
    return splitMessage(message, { type: 'general' });
}

function formatRayDalioResponse(analysis, title = "Analysis") {
    return formatWithTimestamp(analysis, true);
}

function formatCambodiaFundResponse(analysis, title = "Cambodia Analysis") {
    return formatWithTimestamp(analysis, true);
}

module.exports = {
    // Main functions
    sendSmartMessage,
    sendAnalysis,
    sendCambodiaAnalysis,
    sendMarketAnalysis,
    sendPortfolioAnalysis,
    sendAlert,
    sendRegimeAnalysis,
    sendAnomalyAlert,
    
    // Utility functions
    cleanResponse,
    splitMessage,
    findBestSplitPoint,
    getMessageStats,
    formatWithTimestamp,
    
    // Legacy compatibility
    sendSmartResponse,
    cleanStrategicResponse,
    sendLongMessage,
    splitLongMessage,
    formatRayDalioResponse,
    formatCambodiaFundResponse,
    
    // Constants
    TELEGRAM_LIMITS,
    MESSAGE_TYPES
};
