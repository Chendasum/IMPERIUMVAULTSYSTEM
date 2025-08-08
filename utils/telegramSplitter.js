// utils/telegramSplitter.js - STRATEGIC COMMANDER MESSAGE OPTIMIZATION
const crypto = require('crypto');

// 📏 TELEGRAM LIMITS - Strategic Command Optimized
const TELEGRAM_LIMITS = {
    MAX_MESSAGE_LENGTH: 4096,          // Telegram's hard limit
    SAFE_MESSAGE_LENGTH: 4000,         // Safe limit with buffer
    MAX_CAPTION_LENGTH: 1024,          // For media captions
    STRATEGIC_CHUNK_SIZE: 3800,        // Optimal for Strategic Commander reports
    MAX_CHUNKS_PER_MESSAGE: 20,        // Prevent spam
    STRATEGIC_DELAY_MS: 1500,          // Delay between strategic message chunks
    PRIORITY_DELAY_MS: 500             // Faster for urgent strategic alerts
};

// 🎯 STRATEGIC MESSAGE TYPES
const STRATEGIC_MESSAGE_TYPES = {
    'general': {
        emoji: '💬',
        priority: 'normal',
        formatting: 'standard'
    },
    'raydalio': {
        emoji: '🏛️',
        priority: 'high',
        formatting: 'institutional'
    },
    'cambodia': {
        emoji: '🇰🇭',
        priority: 'high', 
        formatting: 'institutional'
    },
    'trading': {
        emoji: '💹',
        priority: 'urgent',
        formatting: 'financial'
    },
    'alert': {
        emoji: '🚨',
        priority: 'urgent',
        formatting: 'alert'
    },
    'analysis': {
        emoji: '📊',
        priority: 'high',
        formatting: 'analytical'
    }
};

/**
 * 🎯 STRATEGIC SMART RESPONSE HANDLER
 * Intelligently splits and sends Strategic Commander messages
 */
async function sendSmartResponse(bot, chatId, message, title = null, messageType = 'general', options = {}) {
    try {
        console.log(`🎯 Strategic Commander sending ${messageType} message to ${chatId}`);
        
        if (!message || message.trim().length === 0) {
            console.log('⚠️ Empty message - skipping send');
            return false;
        }
        
        // Get strategic message configuration
        const strategicConfig = STRATEGIC_MESSAGE_TYPES[messageType] || STRATEGIC_MESSAGE_TYPES.general;
        const messageDelay = strategicConfig.priority === 'urgent' ? TELEGRAM_LIMITS.PRIORITY_DELAY_MS : TELEGRAM_LIMITS.STRATEGIC_DELAY_MS;
        
        // Format message with Strategic Commander enhancements
        let formattedMessage = formatStrategicMessage(message, title, messageType, strategicConfig);
        
        // Check if message needs splitting
        if (formattedMessage.length <= TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
            // Single message - send directly
            await bot.sendMessage(chatId, formattedMessage, {
                parse_mode: 'Markdown',
                disable_web_page_preview: options.disablePreview !== false
            });
            
            console.log(`✅ Strategic Commander single message sent (${formattedMessage.length} chars)`);
            return true;
        }
        
        // Message needs strategic splitting
        const chunks = splitStrategicMessage(formattedMessage, title, messageType);
        
        if (chunks.length > TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE) {
            console.log(`⚠️ Strategic message too long (${chunks.length} chunks), truncating to ${TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE}`);
            chunks.splice(TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE);
        }
        
        // Send strategic chunks with appropriate delays
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const isLast = i === chunks.length - 1;
            
            try {
                await bot.sendMessage(chatId, chunk, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: options.disablePreview !== false
                });
                
                console.log(`✅ Strategic chunk ${i + 1}/${chunks.length} sent (${chunk.length} chars)`);
                
                // Strategic delay between chunks (except for last chunk)
                if (!isLast) {
                    await new Promise(resolve => setTimeout(resolve, messageDelay));
                }
                
            } catch (chunkError) {
                console.error(`❌ Strategic chunk ${i + 1} failed:`, chunkError.message);
                
                // Try sending without markdown formatting as fallback
                try {
                    const plainChunk = chunk.replace(/[*_`~]/g, '');
                    await bot.sendMessage(chatId, plainChunk);
                    console.log(`✅ Strategic chunk ${i + 1} sent as plain text`);
                } catch (fallbackError) {
                    console.error(`❌ Strategic chunk ${i + 1} completely failed:`, fallbackError.message);
                }
            }
        }
        
        console.log(`✅ Strategic Commander message complete: ${chunks.length} chunks sent`);
        return true;
        
    } catch (error) {
        console.error('❌ Strategic Smart Response error:', error.message);
        
        // Emergency fallback - send basic message
        try {
            const emergencyMessage = `🚨 **STRATEGIC COMMANDER ERROR**\n\nMessage delivery failed. Error: ${error.message}\n\nOriginal message length: ${message?.length || 0} characters`;
            await bot.sendMessage(chatId, emergencyMessage.substring(0, TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH));
        } catch (emergencyError) {
            console.error('❌ Emergency fallback also failed:', emergencyError.message);
        }
        
        return false;
    }
}

/**
 * 🏛️ FORMAT STRATEGIC MESSAGE
 * Enhances messages with Strategic Commander branding and formatting
 */
function formatStrategicMessage(message, title, messageType, config) {
    let formatted = '';
    
    // Add strategic header if title provided
    if (title) {
        const titleEmoji = config.emoji;
        formatted += `${titleEmoji} **${title.toUpperCase()}**\n\n`;
    }
    
    // Add strategic timestamp for certain message types
    if (config.priority === 'urgent' || messageType === 'trading') {
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            timeZone: 'Asia/Phnom_Penh',
            hour12: false 
        });
        formatted += `🕐 **Strategic Time:** ${timestamp} Cambodia\n\n`;
    }
    
    // Add main message content
    formatted += message;
    
    // Add strategic footer based on message type
    const footer = getStrategicFooter(messageType, config);
    if (footer) {
        formatted += `\n\n${footer}`;
    }
    
    return formatted;
}

/**
 * 📊 GET STRATEGIC FOOTER
 */
function getStrategicFooter(messageType, config) {
    switch (messageType) {
        case 'raydalio':
            return '🏛️ *Strategic Commander • Institutional-Grade Analysis*';
        case 'cambodia':
            return '🇰🇭 *Strategic Commander • Cambodia Fund Intelligence*';
        case 'trading':
            return '💹 *Strategic Commander • Live Trading Intelligence*';
        case 'analysis':
            return '📊 *Strategic Commander • Market Warfare Analysis*';
        case 'alert':
            return '🚨 *Strategic Commander • Urgent Alert*';
        default:
            return null;
    }
}

/**
 * ✂️ SPLIT STRATEGIC MESSAGE
 * Intelligently splits long Strategic Commander messages
 */
function splitStrategicMessage(message, title, messageType) {
    const chunks = [];
    let remainingMessage = message;
    let partNumber = 1;
    
    // Strategic message configuration
    const config = STRATEGIC_MESSAGE_TYPES[messageType] || STRATEGIC_MESSAGE_TYPES.general;
    const maxChunkSize = TELEGRAM_LIMITS.STRATEGIC_CHUNK_SIZE;
    
    while (remainingMessage.length > maxChunkSize) {
        // Find optimal split point
        let splitPoint = findStrategicSplitPoint(remainingMessage, maxChunkSize);
        
        if (splitPoint === -1) {
            // Force split if no good point found
            splitPoint = maxChunkSize - 100; // Leave room for headers
        }
        
        // Extract chunk
        let chunk = remainingMessage.substring(0, splitPoint).trim();
        
        // Add strategic chunk header
        const chunkHeader = `${config.emoji} **STRATEGIC COMMANDER** (Part ${partNumber})\n\n`;
        
        // Check if chunk with header fits
        if (chunk.length + chunkHeader.length > maxChunkSize) {
            // Reduce chunk size to accommodate header
            const availableSpace = maxChunkSize - chunkHeader.length - 50; // Buffer
            chunk = chunk.substring(0, availableSpace).trim();
            
            // Find last complete sentence or line
            const lastSentence = chunk.lastIndexOf('.');
            const lastLine = chunk.lastIndexOf('\n');
            const cutPoint = Math.max(lastSentence, lastLine);
            
            if (cutPoint > availableSpace * 0.7) { // Only if cut point is reasonable
                chunk = chunk.substring(0, cutPoint + 1).trim();
            }
        }
        
        // Add header and push chunk
        const finalChunk = chunkHeader + chunk;
        chunks.push(finalChunk);
        
        // Remove processed content
        remainingMessage = remainingMessage.substring(chunk.length).trim();
        partNumber++;
        
        // Safety check
        if (partNumber > TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE) {
            console.log('⚠️ Strategic message splitting reached maximum chunks limit');
            break;
        }
    }
    
    // Add remaining content as final chunk
    if (remainingMessage.length > 0) {
        const finalHeader = partNumber > 1 ? 
            `${config.emoji} **STRATEGIC COMMANDER** (Part ${partNumber} - Final)\n\n` : '';
        
        chunks.push(finalHeader + remainingMessage);
    }
    
    return chunks;
}

/**
 * 🔍 FIND STRATEGIC SPLIT POINT
 * Finds optimal points to split Strategic Commander messages
 */
function findStrategicSplitPoint(text, maxLength) {
    // Strategic splitting priorities (in order of preference)
    const splitPatterns = [
        /\n\n🎯/g,           // Strategic section headers
        /\n\n🏛️/g,          // Strategic analysis sections
        /\n\n📊/g,           // Strategic data sections
        /\n\n💰/g,           // Strategic financial sections
        /\n\n⚠️/g,           // Strategic warning sections
        /\n\n\*\*[A-Z]/g,    // Bold headers
        /\n\n/g,             // Double line breaks
        /\.\s+/g,            // End of sentences
        /\n/g,               // Single line breaks
        /;\s+/g,             // Semicolons
        /,\s+/g              // Commas (last resort)
    ];
    
    // Search for best split point within acceptable range
    const minSplitPoint = maxLength * 0.7; // Don't split too early
    
    for (const pattern of splitPatterns) {
        const matches = [...text.matchAll(pattern)];
        
        // Find last match within acceptable range
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
 * 📝 SPLIT LONG MESSAGE (Legacy function for compatibility)
 */
function splitLongMessage(message, maxLength = TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
    if (message.length <= maxLength) {
        return [message];
    }
    
    const chunks = [];
    let remaining = message;
    
    while (remaining.length > maxLength) {
        let splitPoint = findStrategicSplitPoint(remaining, maxLength);
        
        if (splitPoint === -1) {
            splitPoint = maxLength;
        }
        
        chunks.push(remaining.substring(0, splitPoint).trim());
        remaining = remaining.substring(splitPoint).trim();
    }
    
    if (remaining.length > 0) {
        chunks.push(remaining);
    }
    
    return chunks;
}

/**
 * 📊 SEND LONG MESSAGE (Legacy function for compatibility)
 */
async function sendLongMessage(bot, chatId, message, delay = TELEGRAM_LIMITS.STRATEGIC_DELAY_MS) {
    const chunks = splitLongMessage(message);
    
    for (let i = 0; i < chunks.length; i++) {
        try {
            await bot.sendMessage(chatId, chunks[i], { parse_mode: 'Markdown' });
            
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        } catch (error) {
            console.error(`❌ Chunk ${i + 1} failed:`, error.message);
        }
    }
}

/**
 * 🏛️ FORMAT RAY DALIO RESPONSE (Enhanced for Strategic Commander)
 */
function formatRayDalioResponse(analysis, title = "Strategic Analysis") {
    let formatted = `🏛️ **${title.toUpperCase()}**\n\n`;
    
    // Add strategic timestamp
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Phnom_Penh',
        hour12: false 
    });
    formatted += `🕐 **Strategic Time:** ${timestamp} Cambodia\n\n`;
    
    // Add main analysis
    formatted += analysis;
    
    // Add strategic footer
    formatted += '\n\n🏛️ *Strategic Commander • Institutional-Grade Market Intelligence*';
    
    return formatted;
}

/**
 * 🇰🇭 FORMAT CAMBODIA FUND RESPONSE
 */
function formatCambodiaFundResponse(analysis, title = "Cambodia Fund Analysis") {
    let formatted = `🇰🇭 **${title.toUpperCase()}**\n\n`;
    
    // Add strategic timestamp
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Phnom_Penh',
        hour12: false 
    });
    formatted += `🕐 **Strategic Time:** ${timestamp} Cambodia\n\n`;
    
    // Add main analysis
    formatted += analysis;
    
    // Add strategic footer
    formatted += '\n\n🇰🇭 *Strategic Commander • Cambodia Private Lending Intelligence*';
    
    return formatted;
}

/**
 * 📈 GET MESSAGE STATS
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
    const chunks = Math.ceil(length / TELEGRAM_LIMITS.STRATEGIC_CHUNK_SIZE);
    const estimatedSendTime = chunks > 1 ? 
        (chunks - 1) * TELEGRAM_LIMITS.STRATEGIC_DELAY_MS + 1000 : 1000;
    
    let type = 'short';
    if (length > TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
        type = chunks <= 5 ? 'medium' : 'long';
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
 * 🚨 SEND STRATEGIC ALERT
 * For urgent Strategic Commander alerts
 */
async function sendStrategicAlert(bot, chatId, alertMessage, alertType = 'general') {
    const alertHeader = '🚨 **STRATEGIC COMMANDER ALERT**\n\n';
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Phnom_Penh',
        hour12: false 
    });
    const timeHeader = `🕐 **Alert Time:** ${timestamp} Cambodia\n\n`;
    
    const fullAlert = alertHeader + timeHeader + alertMessage + '\n\n🚨 *Strategic Commander • Urgent Alert System*';
    
    return await sendSmartResponse(bot, chatId, fullAlert, null, 'alert', { 
        disablePreview: true,
        priority: 'urgent'
    });
}

/**
 * 📊 SEND STRATEGIC REPORT
 * For comprehensive Strategic Commander reports
 */
async function sendStrategicReport(bot, chatId, reportContent, reportTitle, reportType = 'analysis') {
    return await sendSmartResponse(bot, chatId, reportContent, reportTitle, reportType, {
        disablePreview: true,
        priority: 'high'
    });
}

module.exports = {
    // 🎯 STRATEGIC COMMANDER FUNCTIONS
    sendSmartResponse,
    sendStrategicAlert,
    sendStrategicReport,
    
    // 🏛️ FORMATTING FUNCTIONS
    formatStrategicMessage,
    formatRayDalioResponse,
    formatCambodiaFundResponse,
    
    // ✂️ SPLITTING FUNCTIONS
    splitStrategicMessage,
    splitLongMessage,
    findStrategicSplitPoint,
    
    // 📊 UTILITY FUNCTIONS
    getMessageStats,
    
    // 📝 LEGACY COMPATIBILITY
    sendLongMessage,
    
    // 📏 CONSTANTS
    TELEGRAM_LIMITS,
    STRATEGIC_MESSAGE_TYPES
};
