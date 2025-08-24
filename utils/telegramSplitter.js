// utils/telegramSplitter.js - REWRITTEN: GPT-5 Optimized Professional Message Handler
// Enterprise-grade Telegram message handling with GPT-5 intelligence and memory integration

const TELEGRAM_CONFIG = {
    // Message limits
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_MESSAGE_LENGTH: 4000,
    OPTIMAL_CHUNK_SIZE: 3800,
    MAX_CAPTION_LENGTH: 1024,
    MAX_CHUNKS_LIMIT: 10,
    
    // Performance optimized delays
    ULTRA_FAST_DELAY: 150,     // GPT-5 Nano responses
    FAST_DELAY: 300,           // GPT-5 Mini responses  
    STANDARD_DELAY: 600,       // GPT-5 Full responses
    ERROR_DELAY: 100           // Error messages
};

// 🚀 GPT-5 MESSAGE TYPES with Smart Routing
const GPT5_MESSAGE_TYPES = {
    'nano': { 
        emoji: '⚡', 
        delay: TELEGRAM_CONFIG.ULTRA_FAST_DELAY,
        priority: 'ultra_fast',
        description: 'Speed Critical'
    },
    'mini': { 
        emoji: '🔥', 
        delay: TELEGRAM_CONFIG.FAST_DELAY,
        priority: 'fast',
        description: 'Balanced Performance'
    },
    'full': { 
        emoji: '🧠', 
        delay: TELEGRAM_CONFIG.STANDARD_DELAY,
        priority: 'intelligent',
        description: 'Maximum Intelligence'
    },
    'chat': { 
        emoji: '💬', 
        delay: TELEGRAM_CONFIG.FAST_DELAY,
        priority: 'conversational',
        description: 'Natural Chat'
    },
    'analysis': { 
        emoji: '📊', 
        delay: TELEGRAM_CONFIG.STANDARD_DELAY,
        priority: 'analytical',
        description: 'Deep Analysis'
    },
    'memory': { 
        emoji: '🧠', 
        delay: TELEGRAM_CONFIG.STANDARD_DELAY,
        priority: 'contextual',
        description: 'Memory Enhanced'
    },
    'multimodal': { 
        emoji: '🎨', 
        delay: TELEGRAM_CONFIG.STANDARD_DELAY,
        priority: 'creative',
        description: 'Vision & Audio'
    },
    'error': { 
        emoji: '❌', 
        delay: TELEGRAM_CONFIG.ERROR_DELAY,
        priority: 'urgent',
        description: 'System Error'
    }
};

/**
 * 🎯 Smart GPT-5 Model Detection
 */
function detectGPT5Model(aiUsed, modelUsed) {
    if (!aiUsed && !modelUsed) return 'general';
    
    const model = (modelUsed || aiUsed || '').toLowerCase();
    
    if (model.includes('nano')) return 'nano';
    if (model.includes('mini')) return 'mini'; 
    if (model.includes('chat')) return 'chat';
    if (model.includes('gpt-5') || model.includes('gpt5')) return 'full';
    if (model.includes('multimodal') || model.includes('vision')) return 'multimodal';
    if (model.includes('error') || model.includes('fallback')) return 'error';
    
    return 'analysis';
}

/**
 * 🧹 Enhanced Message Cleaning with GPT-5 Optimization
 */
function cleanGPT5Response(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
        // Clean GPT-5 system artifacts
        .replace(/\[reasoning_effort:\s*\w+\]/gi, '')
        .replace(/\[verbosity:\s*\w+\]/gi, '')
        .replace(/\[model:\s*gpt-5[^\]]*\]/gi, '')
        .replace(/\(confidence:\s*\d+%\)/gi, '')
        .replace(/\(GPT-5[^)]*processing[^)]*\)/gi, '')
        
        // Optimize markdown for Telegram
        .replace(/\*\*(.*?)\*\*/g, '*$1*')
        .replace(/^#{1,6}\s+(.*)$/gm, '*$1*')
        .replace(/```[\w]*\n?([\s\S]*?)\n?```/g, '`$1`')
        
        // Format memory context markers
        .replace(/\[MEMORY CONTEXT\]/gi, '🧠 *Memory Context*')
        .replace(/\[USER PROFILE\]/gi, '👤 *User Profile*')
        .replace(/\[PERSISTENT FACTS\]/gi, '💭 *Key Facts*')
        
        // Clean excessive spacing
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        .trim();
}

/**
 * 💎 Premium Metadata Builder for GPT-5 Responses
 */
function buildGPT5Metadata(options = {}) {
    const metadata = [];
    
    // AI Model Information
    if (options.aiUsed || options.modelUsed) {
        let modelDisplay = options.modelUsed || options.aiUsed;
        
        // Beautify model names
        if (modelDisplay.includes('gpt-5-nano')) modelDisplay = 'GPT-5 Nano';
        else if (modelDisplay.includes('gpt-5-mini')) modelDisplay = 'GPT-5 Mini';
        else if (modelDisplay.includes('gpt-5-chat')) modelDisplay = 'GPT-5 Chat';
        else if (modelDisplay.includes('gpt-5')) modelDisplay = 'GPT-5';
        else if (modelDisplay.includes('claude')) modelDisplay = 'Claude';
        
        metadata.push(`AI: *${modelDisplay}*`);
    }
    
    // Response Time with Smart Icons
    if (options.responseTime && options.responseTime > 1000) {
        const seconds = Math.round(options.responseTime / 1000);
        let timeIcon = '⏱️';
        
        if (seconds <= 3) timeIcon = '⚡';
        else if (seconds <= 10) timeIcon = '🚀';
        else if (seconds <= 30) timeIcon = '⏳';
        else timeIcon = '🐢';
        
        metadata.push(`Time: *${timeIcon} ${seconds}s*`);
    }
    
    // Memory Context Status
    if (options.contextUsed || options.memoryUsed) {
        metadata.push(`Context: *🧠 Enhanced*`);
    }
    
    // Cost Tier with Premium Styling
    if (options.costTier || options.cost_tier) {
        const tier = options.costTier || options.cost_tier;
        
        if (tier === 'economy') metadata.push(`Cost: *💚 Economy*`);
        else if (tier === 'standard') metadata.push(`Cost: *💙 Standard*`);
        else if (tier === 'premium') metadata.push(`Cost: *💎 Premium*`);
    }
    
    // Power Mode Information
    if (options.powerMode) {
        const mode = options.powerMode.replace('GPT5_', '').toLowerCase();
        const modeEmojis = {
            'speed': '⚡',
            'complex': '🧠',
            'multimodal': '🎨',
            'mathematical': '🔢',
            'chat': '💬'
        };
        
        const emoji = modeEmojis[mode] || '🎯';
        metadata.push(`Mode: *${emoji} ${mode.charAt(0).toUpperCase() + mode.slice(1)}*`);
    }
    
    return metadata.length > 0 ? metadata.join(' • ') : null;
}

/**
 * 🎨 Smart Header Generator
 */
function generateGPT5Header(title, messageType, options = {}) {
    if (!title) return null;
    
    const typeConfig = GPT5_MESSAGE_TYPES[messageType] || GPT5_MESSAGE_TYPES['analysis'];
    let headerEmoji = typeConfig.emoji;
    
    // Override emoji based on content
    if (title.includes('Ultra-Fast') || title.includes('Nano')) headerEmoji = '⚡';
    else if (title.includes('Fast') || title.includes('Mini')) headerEmoji = '🔥';
    else if (title.includes('Ultimate') || title.includes('Full')) headerEmoji = '🧠';
    else if (title.includes('Memory') || title.includes('Context')) headerEmoji = '🧠';
    else if (title.includes('Vision') || title.includes('Image')) headerEmoji = '🎨';
    else if (title.includes('Error') || title.includes('Failed')) headerEmoji = '❌';
    
    // Add GPT-5 indicator if not already present
    let enhancedTitle = title;
    if (options.gpt5OnlyMode && !title.includes('GPT-5')) {
        enhancedTitle += ' (🚀 GPT-5 Optimized)';
    }
    
    return `${headerEmoji} *${enhancedTitle}*`;
}

/**
 * 📏 Smart Message Splitter with GPT-5 Content Awareness
 */
function splitGPT5Message(message, options = {}) {
    if (message.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
        return [message];
    }
    
    const chunks = [];
    let remaining = message;
    let partNumber = 1;
    
    while (remaining.length > TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE && partNumber <= TELEGRAM_CONFIG.MAX_CHUNKS_LIMIT) {
        let splitPoint = findOptimalSplitPoint(remaining);
        
        if (splitPoint === -1) {
            splitPoint = TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE - 100;
        }
        
        let chunk = remaining.substring(0, splitPoint).trim();
        
        // Add part indicator for multi-part messages
        if (partNumber > 1 || remaining.length - splitPoint > TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE) {
            const partEmoji = GPT5_MESSAGE_TYPES[options.messageType]?.emoji || '📄';
            chunk = `${partEmoji} *Part ${partNumber}*\n\n${chunk}`;
        }
        
        chunks.push(chunk);
        remaining = remaining.substring(splitPoint).trim();
        partNumber++;
    }
    
    // Add final chunk
    if (remaining.length > 0) {
        if (partNumber > 1) {
            const finalEmoji = GPT5_MESSAGE_TYPES[options.messageType]?.emoji || '📄';
            remaining = `${finalEmoji} *Part ${partNumber} - Final*\n\n${remaining}`;
        }
        chunks.push(remaining);
    }
    
    return chunks;
}

/**
 * 🔍 Find Optimal Split Points for GPT-5 Content
 */
function findOptimalSplitPoint(text) {
    const maxLength = TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE;
    const minSplitPoint = maxLength * 0.7;
    
    // Split patterns optimized for GPT-5 content
    const splitPatterns = [
        /\n\n\*\*[^*]+\*\*:/g,           // Section headers
        /\n\n🧠\s+\*[^*]+\*:/g,          // Memory sections  
        /\n\n⚡\s+\*[^*]+\*:/g,           // Speed sections
        /\n\n📊\s+\*[^*]+\*:/g,          // Analysis sections
        /\n\n\d+\.\s+/g,                 // Numbered lists
        /\n\n•\s+/g,                     // Bullet points
        /\n\n/g,                         // Paragraph breaks
        /\.\s*\n/g,                      // Sentence endings
        /\.\s+/g,                        // Sentence endings with space
        /;\s+/g,                         // Semicolons
        /,\s+/g                          // Commas (last resort)
    ];
    
    for (const pattern of splitPatterns) {
        const matches = [...text.matchAll(pattern)];
        
        for (let i = matches.length - 1; i >= 0; i--) {
            const matchEnd = matches[i].index + matches[i][0].length;
            
            if (matchEnd >= minSplitPoint && matchEnd <= maxLength) {
                return matchEnd;
            }
        }
    }
    
    return -1;
}

/**
 * 🚀 Main GPT-5 Message Sender
 */
async function sendGPT5Message(bot, chatId, message, title = null, metadata = {}) {
    try {
        if (!message || message.trim().length === 0) {
            console.warn('⚠️ Empty message - skipping send');
            return false;
        }
        
        // Detect GPT-5 model and message type
        const messageType = detectGPT5Model(metadata.aiUsed, metadata.modelUsed);
        const typeConfig = GPT5_MESSAGE_TYPES[messageType];
        
        console.log(`📱 Sending GPT-5 ${typeConfig.description} message (${message.length} chars)`);
        
        // Clean the message
        let cleanMessage = cleanGPT5Response(message);
        
        // Add header if title provided
        if (title) {
            const header = generateGPT5Header(title, messageType, metadata);
            if (header) {
                cleanMessage = `${header}\n\n${cleanMessage}`;
            }
        }
        
        // Add metadata footer
        const metadataFooter = buildGPT5Metadata(metadata);
        if (metadataFooter) {
            cleanMessage += `\n\n${metadataFooter}`;
        }
        
        // Send message (single or chunked)
        if (cleanMessage.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
            return await sendSingleMessage(bot, chatId, cleanMessage, typeConfig);
        } else {
            return await sendChunkedMessage(bot, chatId, cleanMessage, typeConfig, messageType);
        }
        
    } catch (error) {
        console.error('❌ GPT-5 message sending error:', error.message);
        return await sendEmergencyFallback(bot, chatId, error.message);
    }
}

/**
 * 📤 Send Single Message with Error Handling
 */
async function sendSingleMessage(bot, chatId, message, typeConfig) {
    try {
        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        
        console.log(`✅ GPT-5 ${typeConfig.description} message sent (${message.length} chars)`);
        return true;
        
    } catch (markdownError) {
        console.warn('⚠️ Markdown failed, trying plain text');
        
        try {
            const plainMessage = message.replace(/[*_`~\[\]]/g, '');
            await bot.sendMessage(chatId, plainMessage, {
                disable_web_page_preview: true
            });
            
            console.log(`✅ GPT-5 message sent as plain text (${plainMessage.length} chars)`);
            return true;
            
        } catch (plainError) {
            console.error('❌ Both markdown and plain text failed:', plainError.message);
            return false;
        }
    }
}

/**
 * 📦 Send Chunked Message with Optimized Delays
 */
async function sendChunkedMessage(bot, chatId, message, typeConfig, messageType) {
    const chunks = splitGPT5Message(message, { messageType });
    
    console.log(`📦 Sending ${chunks.length} chunks with ${typeConfig.description} priority`);
    
    let successCount = 0;
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isLast = i === chunks.length - 1;
        
        try {
            await bot.sendMessage(chatId, chunk, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
            
            successCount++;
            console.log(`✅ Chunk ${i + 1}/${chunks.length} sent (${chunk.length} chars)`);
            
            // Add optimized delay between chunks
            if (!isLast) {
                await new Promise(resolve => setTimeout(resolve, typeConfig.delay));
            }
            
        } catch (chunkError) {
            console.error(`❌ Chunk ${i + 1} failed:`, chunkError.message);
            
            // Try plain text fallback for failed chunk
            try {
                const plainChunk = chunk.replace(/[*_`~\[\]]/g, '');
                await bot.sendMessage(chatId, plainChunk, {
                    disable_web_page_preview: true
                });
                
                successCount++;
                console.log(`✅ Chunk ${i + 1} sent as plain text`);
                
            } catch (fallbackError) {
                console.error(`❌ Chunk ${i + 1} completely failed`);
            }
        }
    }
    
    const success = successCount > 0;
    console.log(`${success ? '✅' : '❌'} GPT-5 chunked message: ${successCount}/${chunks.length} chunks sent`);
    
    return success;
}

/**
 * 🆘 Emergency Fallback Message Sender
 */
async function sendEmergencyFallback(bot, chatId, errorMessage) {
    try {
        const fallbackMessage = `🚨 *System Error*\n\nMessage delivery failed: ${errorMessage.substring(0, 100)}...\n\n🔧 Please try again or contact support.`;
        
        await bot.sendMessage(chatId, fallbackMessage, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        
        console.log('🆘 Emergency fallback message sent');
        return true;
        
    } catch (emergencyError) {
        console.error('❌ Emergency fallback also failed:', emergencyError.message);
        return false;
    }
}

/**
 * 📊 Get Message Statistics
 */
function getGPT5MessageStats(message, metadata = {}) {
    if (!message || typeof message !== 'string') {
        return {
            length: 0,
            chunks: 0,
            estimatedSendTime: 0,
            messageType: 'invalid'
        };
    }
    
    const length = message.length;
    const messageType = detectGPT5Model(metadata.aiUsed, metadata.modelUsed);
    const typeConfig = GPT5_MESSAGE_TYPES[messageType];
    const chunks = Math.ceil(length / TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE);
    
    const estimatedSendTime = chunks > 1 ? 
        (chunks - 1) * typeConfig.delay + 1000 : 1000;
    
    return {
        length,
        chunks,
        messageType,
        description: typeConfig.description,
        estimatedSendTime,
        priority: typeConfig.priority,
        emoji: typeConfig.emoji,
        withinLimits: length <= TELEGRAM_CONFIG.MAX_MESSAGE_LENGTH,
        
        // Performance metrics
        delay: typeConfig.delay,
        tokensEstimate: Math.ceil(length / 4),
        complexity: length > 2000 ? 'high' : length > 800 ? 'medium' : 'low'
    };
}

// 🎯 SPECIALIZED GPT-5 SENDERS

/**
 * ⚡ GPT-5 Nano Response Sender
 */
async function sendNanoResponse(bot, chatId, response, title = 'Ultra-Fast Response', metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        aiUsed: 'GPT-5-nano',
        modelUsed: 'gpt-5-nano',
        costTier: 'economy'
    });
}

/**
 * 🔥 GPT-5 Mini Response Sender
 */
async function sendMiniResponse(bot, chatId, response, title = 'Balanced Response', metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        aiUsed: 'GPT-5-mini',
        modelUsed: 'gpt-5-mini',
        costTier: 'standard'
    });
}

/**
 * 🧠 GPT-5 Full Response Sender  
 */
async function sendFullResponse(bot, chatId, response, title = 'Ultimate Analysis', metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        aiUsed: 'GPT-5-full',
        modelUsed: 'gpt-5',
        costTier: 'premium'
    });
}

/**
 * 💬 GPT-5 Chat Response Sender
 */
async function sendChatResponse(bot, chatId, response, title = 'Natural Chat', metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        aiUsed: 'GPT-5-chat',
        modelUsed: 'gpt-5-chat-latest',
        costTier: 'premium'
    });
}

/**
 * 🎨 Multimodal Response Sender
 */
async function sendMultimodalResponse(bot, chatId, response, title = 'Vision Analysis', metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        aiUsed: 'GPT-5-multimodal',
        modelUsed: 'gpt-5',
        costTier: 'premium',
        powerMode: 'GPT5_MULTIMODAL'
    });
}

// 🔄 LEGACY COMPATIBILITY FUNCTIONS

/**
 * Legacy GPT Response Sender (redirects to GPT-5)
 */
async function sendGPTResponse(bot, chatId, response, title = 'GPT-5 Analysis', metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        gpt5OnlyMode: true
    });
}

/**
 * Legacy Claude Response Sender (redirects to GPT-5 Fast)
 */
async function sendClaudeResponse(bot, chatId, response, title = 'AI Response', metadata = {}) {
    return await sendMiniResponse(bot, chatId, response, title, metadata);
}

/**
 * Legacy Dual AI Response Sender (redirects to GPT-5)
 */
async function sendDualAIResponse(bot, chatId, response, title = 'AI Analysis', metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        aiUsed: 'GPT-5-unified',
        gpt5OnlyMode: true
    });
}

/**
 * Legacy Analysis Sender
 */
async function sendAnalysis(bot, chatId, analysis, title = 'Analysis', metadata = {}) {
    return await sendGPT5Message(bot, chatId, analysis, title, metadata);
}

/**
 * Legacy Alert Sender
 */
async function sendAlert(bot, chatId, alertMessage, title = 'Alert', metadata = {}) {
    const alertContent = `🚨 *${title}*\n\n${alertMessage}\n\n⏰ *Time:* ${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Phnom_Penh' })} Cambodia`;
    
    return await sendGPT5Message(bot, chatId, alertContent, null, {
        ...metadata,
        urgentMessage: true
    });
}

// 🔧 UTILITY FUNCTIONS

/**
 * Clean response text (legacy compatibility)
 */
function cleanResponse(text) {
    return cleanGPT5Response(text);
}

/**
 * Split message (legacy compatibility)
 */
function splitMessage(message, options = {}) {
    return splitGPT5Message(message, options);
}

/**
 * Get message stats (legacy compatibility)
 */
function getMessageStats(message, aiModel, options = {}) {
    return getGPT5MessageStats(message, { 
        aiUsed: aiModel, 
        ...options 
    });
}

// 📤 EXPORTS
module.exports = {
    // 🚀 Main GPT-5 Functions
    sendGPT5Message,
    sendNanoResponse,
    sendMiniResponse,
    sendFullResponse,
    sendChatResponse,
    sendMultimodalResponse,
    
    // 🔄 Legacy Compatibility (Redirected to GPT-5)
    sendGPTResponse,
    sendClaudeResponse,
    sendDualAIResponse,
    sendAnalysis,
    sendAlert,
    
    // 🔧 Utility Functions
    cleanResponse,
    cleanGPT5Response,
    splitMessage,
    splitGPT5Message,
    getMessageStats,
    getGPT5MessageStats,
    detectGPT5Model,
    buildGPT5Metadata,
    generateGPT5Header,
    
    // 📊 Constants
    TELEGRAM_CONFIG,
    GPT5_MESSAGE_TYPES
};

console.log('🚀 GPT-5 Optimized Telegram Splitter Loaded');
console.log('⚡ Ultra-fast message delivery for GPT-5 Nano');
console.log('🔥 Balanced performance for GPT-5 Mini');
console.log('🧠 Premium experience for GPT-5 Full');
console.log('🎨 Multimodal support for vision & audio');
console.log('📊 Smart metadata and performance tracking');
console.log('🔄 Full backward compatibility maintained');
