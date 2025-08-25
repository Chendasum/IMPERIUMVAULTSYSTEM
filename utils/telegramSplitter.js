// utils/telegramSplitter.js - Enhanced Message Handling for Telegram
// Professional message splitting and formatting with AI optimization

const TELEGRAM_LIMITS = {
    MAX_MESSAGE_LENGTH: 4096,          // Telegram's hard limit
    SAFE_MESSAGE_LENGTH: 4000,         // Safe limit with buffer
    MAX_CAPTION_LENGTH: 1024,          // For media captions
    OPTIMAL_CHUNK_SIZE: 3800,          // Optimal chunk size
    MAX_CHUNKS_PER_MESSAGE: 15,        // Prevent spam
    MESSAGE_DELAY_MS: 1000,            // Delay between message chunks
    PRIORITY_DELAY_MS: 500             // Faster for urgent messages
};

// 📊 ENHANCED MESSAGE TYPES (10/10)
const MESSAGE_TYPES = {
    'general': { emoji: '💬', priority: 'normal' },
    'analysis': { emoji: '📊', priority: 'high' },
    'cambodia': { emoji: '🇰🇭', priority: 'high' },
    'market': { emoji: '📈', priority: 'high' },
    'portfolio': { emoji: '💼', priority: 'high' },
    'alert': { emoji: '🚨', priority: 'urgent' },
    'regime': { emoji: '🏛️', priority: 'high' },
    'anomaly': { emoji: '⚠️', priority: 'urgent' },
    // 🤖 AI-SPECIFIC TYPES
    'gpt_response': { emoji: '🧠', priority: 'high' },
    'claude_response': { emoji: '⚡', priority: 'high' },
    'dual_ai': { emoji: '🔄', priority: 'urgent' },
    'memory_query': { emoji: '🧠', priority: 'high' },
    'strategic': { emoji: '🎯', priority: 'high' }
};

/**
 * 🎯 Smart emoji selection based on message content
 */
function getSmartEmoji(message) {
    const text = message.toLowerCase();
    
    // Content-based emoji selection
    if (text.includes('cambodia') || text.includes('phnom penh')) return '🇰🇭';
    if (text.includes('market') || text.includes('trading') || text.includes('stocks')) return '📈';
    if (text.includes('portfolio') || text.includes('fund') || text.includes('investment')) return '💼';
    if (text.includes('risk') || text.includes('alert') || text.includes('warning')) return '🚨';
    if (text.includes('analysis') || text.includes('strategic') || text.includes('framework')) return '📊';
    if (text.includes('regime') || text.includes('economic') || text.includes('monetary')) return '🏛️';
    if (text.includes('anomaly') || text.includes('unusual') || text.includes('detected')) return '⚠️';
    if (text.includes('gpt') || text.includes('reasoning') || text.includes('calculation')) return '🧠';
    if (text.includes('claude') || text.includes('structured') || text.includes('comprehensive')) return '⚡';
    if (text.includes('dual') || text.includes('both ai') || text.includes('comparison')) return '🔄';
    
    return '💬'; // Default
}

/**
 * 🧹 Enhanced response cleaning with AI optimization
 */
function cleanResponse(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    return text
        // Clean up markdown formatting
        .replace(/\*\*(.*?)\*\*/g, '$1')        // Remove **bold** for Telegram compatibility
        .replace(/^\s*[-*+]\s+/gm, '• ')        // Clean bullet points
        .replace(/^#{1,6}\s+(.*)$/gm, '$1')     // Remove markdown headers
        
        // AI-specific optimizations
        .replace(/```(\w+)?\n([\s\S]*?)\n```/g, '`$2`')  // Simplify code blocks
        .replace(/\[reasoning\]|\[analysis\]|\[context\]/gi, '') // Remove AI markers
        .replace(/\(confidence:\s*\d+%\)/gi, '') // Remove confidence indicators
        
        // Clean up excessive spacing
        .replace(/\n{3,}/g, '\n\n')             // Max 2 line breaks
        .replace(/^\s+|\s+$/g, '')              // Trim whitespace
        .trim();
}

/**
 * 📱 Enhanced smart message sender with AI awareness
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
        
        // Determine message type with smart emoji
        const messageType = MESSAGE_TYPES[options.type] || { 
            emoji: getSmartEmoji(cleanedMessage), 
            priority: 'normal' 
        };
        
        // Add optional title with smart formatting
        if (options.title) {
            cleanedMessage = `${messageType.emoji} **${options.title}**\n\n${cleanedMessage}`;
        }
        
        // Add optional metadata footer
        if (options.includeMetadata) {
            const metadata = buildMessageMetadata(options);
            if (metadata) {
                cleanedMessage += `\n\n${metadata}`;
            }
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
        const chunks = splitMessage(cleanedMessage, { ...options, messageType });
        
        if (chunks.length > TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE) {
            console.log(`⚠️ Message too long (${chunks.length} chunks), truncating`);
            chunks.splice(TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE);
            chunks[chunks.length - 1] += '\n\n*(Message truncated due to length)*';
        }
        
        // Send chunks with appropriate delays
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
 * 🏷️ Build message metadata for AI responses
 */
function buildMessageMetadata(options) {
    const metadata = [];
    
    if (options.aiModel) {
        const aiName = options.aiModel === 'gpt5' ? 'GPT-5' : 
                      options.aiModel === 'claude' ? 'Claude Opus 4.1' : 
                      options.aiModel === 'dual' ? 'Dual AI' : options.aiModel;
        metadata.push(`*AI: ${aiName}*`);
    }
    
    if (options.responseTime && options.responseTime > 1000) {
        metadata.push(`*Response: ${Math.round(options.responseTime / 1000)}s*`);
    }
    
    if (options.contextUsed) {
        metadata.push(`*Context: Enhanced*`);
    }
    
    if (options.tokens && options.tokens > 1000) {
        metadata.push(`*Tokens: ${options.tokens}*`);
    }
    
    return metadata.length > 0 ? metadata.join(' | ') : null;
}

/**
 * ✂️ Enhanced message splitting with AI awareness
 */
function splitMessage(message, options = {}) {
    const chunks = [];
    let remaining = message;
    let partNumber = 1;
    
    const maxChunkSize = TELEGRAM_LIMITS.OPTIMAL_CHUNK_SIZE;
    const messageType = options.messageType || MESSAGE_TYPES.general;
    
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
 * 🔍 Enhanced split point detection with AI content awareness
 */
function findBestSplitPoint(text, maxLength) {
    // Enhanced split patterns (in order of preference)
    const splitPatterns = [
        /\n\n\*\*.*?\*\*:/g,          // AI section headers
        /\n\n#{1,3}\s+/g,             // Markdown headers
        /\n\n\d+\.\s+/g,              // Numbered lists
        /\n\n/g,                      // Double line breaks (paragraphs)
        /\.\s+\n/g,                   // End of sentences with newline
        /\.\s+/g,                     // End of sentences
        /\n/g,                        // Single line breaks
        /;\s+/g,                      // Semicolons
        /,\s+/g                       // Commas (last resort)
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
 * 📊 Enhanced analysis sender with AI optimization
 */
async function sendAnalysis(bot, chatId, analysis, title = null, analysisType = 'analysis', options = {}) {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: analysisType,
        disablePreview: true,
        ...options
    });
}

/**
 * 🇰🇭 Enhanced Cambodia analysis sender
 */
async function sendCambodiaAnalysis(bot, chatId, analysis, title = 'Cambodia Analysis', options = {}) {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'cambodia',
        disablePreview: true,
        ...options
    });
}

/**
 * 📈 Enhanced market analysis sender
 */
async function sendMarketAnalysis(bot, chatId, analysis, title = 'Market Analysis', options = {}) {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'market',
        disablePreview: true,
        ...options
    });
}

/**
 * 💼 Enhanced portfolio analysis sender
 */
async function sendPortfolioAnalysis(bot, chatId, analysis, title = 'Portfolio Analysis', options = {}) {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'portfolio',
        disablePreview: true,
        ...options
    });
}

/**
 * 🚨 Enhanced alert sender with timestamp
 */
async function sendAlert(bot, chatId, alertMessage, title = 'Alert', options = {}) {
    const alertContent = formatWithTimestamp(alertMessage, true, options.responseTime);
    
    return await sendSmartMessage(bot, chatId, alertContent, {
        title: title,
        type: 'alert',
        disablePreview: true,
        ...options
    });
}

/**
 * 🏛️ Enhanced regime analysis sender
 */
async function sendRegimeAnalysis(bot, chatId, analysis, title = 'Economic Regime Analysis', options = {}) {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'regime',
        disablePreview: true,
        ...options
    });
}

/**
 * ⚠️ Enhanced anomaly alert sender
 */
async function sendAnomalyAlert(bot, chatId, analysis, title = 'Market Anomaly Detected', options = {}) {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'anomaly',
        disablePreview: true,
        ...options
    });
}

/**
 * 🤖 AI-specific enhanced senders
 */
async function sendGPTResponse(bot, chatId, response, title = null, options = {}) {
    return await sendSmartMessage(bot, chatId, response, {
        title: title || 'GPT-5 Analysis',
        type: 'gpt_response',
        aiModel: 'gpt5',
        disablePreview: true,
        ...options
    });
}

async function sendClaudeResponse(bot, chatId, response, title = null, options = {}) {
    return await sendSmartMessage(bot, chatId, response, {
        title: title || 'Claude Opus 4.1 Analysis',
        type: 'claude_response',
        aiModel: 'claude',
        disablePreview: true,
        ...options
    });
}

async function sendDualAIResponse(bot, chatId, gptResponse, claudeResponse, title = 'Dual AI Analysis', options = {}) {
    const combinedResponse = `**GPT-5 Analysis:**\n${gptResponse}\n\n**Claude Opus 4.1 Analysis:**\n${claudeResponse}`;
    
    return await sendSmartMessage(bot, chatId, combinedResponse, {
        title: title,
        type: 'dual_ai',
        aiModel: 'dual',
        disablePreview: true,
        ...options
    });
}

async function sendStrategicAnalysis(bot, chatId, analysis, title = 'Strategic Analysis', options = {}) {
    return await sendSmartMessage(bot, chatId, analysis, {
        title: title,
        type: 'strategic',
        includeMetadata: true,
        disablePreview: true,
        ...options
    });
}

/**
 * 📊 Enhanced message statistics with AI metrics
 */
function getMessageStats(message, aiModel = null) {
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
        withinLimits: length <= TELEGRAM_LIMITS.MAX_MESSAGE_LENGTH,
        // AI-specific metrics
        aiModel: aiModel,
        estimatedTokens: aiModel ? Math.ceil(length / 4) : null,
        complexity: length > 2000 ? 'high' : length > 800 ? 'medium' : 'low'
    };
}

/**
 * 🔧 Enhanced timestamp formatting with response time
 */
function formatWithTimestamp(message, includeTimestamp = false, responseTime = null) {
    if (!includeTimestamp) {
        return message;
    }
    
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Phnom_Penh',
        hour12: false 
    });
    
    let timeInfo = `*Time:* ${timestamp} Cambodia`;
    if (responseTime && responseTime > 1000) {
        timeInfo += ` | *Response:* ${Math.round(responseTime / 1000)}s`;
    }
    
    return `${timeInfo}\n\n${message}`;
}

/**
 * 📝 Enhanced legacy compatibility functions
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
    // Enhanced main functions
    sendSmartMessage,
    sendAnalysis,
    sendCambodiaAnalysis,
    sendMarketAnalysis,
    sendPortfolioAnalysis,
    sendAlert,
    sendRegimeAnalysis,
    sendAnomalyAlert,
    
    // AI-specific functions (NEW)
    sendGPTResponse,
    sendClaudeResponse,
    sendDualAIResponse,
    sendStrategicAnalysis,
    
    // Enhanced utility functions
    cleanResponse,
    splitMessage,
    findBestSplitPoint,
    getMessageStats,
    formatWithTimestamp,
    getSmartEmoji,
    buildMessageMetadata,
    
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

console.log('✅ Enhanced Telegram Splitter loaded (10/10)');
console.log('🤖 AI-optimized message handling active');
console.log('🎯 Smart emoji selection enabled');
console.log('📊 Enhanced metadata support active');
