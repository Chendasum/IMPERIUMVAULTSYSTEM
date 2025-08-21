// utils/telegramSplitter.js - UPDATED for GPT-5 + Speed + Memory System
// Professional message handling with GPT-5 optimization and memory integration

const TELEGRAM_LIMITS = {
    MAX_MESSAGE_LENGTH: 4096,          // Telegram's hard limit
    SAFE_MESSAGE_LENGTH: 4000,         // Safe limit with buffer
    MAX_CAPTION_LENGTH: 1024,          // For media captions
    OPTIMAL_CHUNK_SIZE: 3800,          // Optimal chunk size
    MAX_CHUNKS_PER_MESSAGE: 15,        // Prevent spam
    MESSAGE_DELAY_MS: 800,             // Reduced for speed (was 1000)
    PRIORITY_DELAY_MS: 400,            // Faster for urgent messages (was 500)
    SPEED_DELAY_MS: 200                // NEW: Ultra-fast for speed responses
};

// 🚀 ENHANCED MESSAGE TYPES with GPT-5 + Speed + Memory Support
const MESSAGE_TYPES = {
    // Original types
    'general': { emoji: '💬', priority: 'normal', delay: 'normal' },
    'analysis': { emoji: '📊', priority: 'high', delay: 'normal' },
    'cambodia': { emoji: '🇰🇭', priority: 'high', delay: 'normal' },
    'market': { emoji: '📈', priority: 'high', delay: 'normal' },
    'portfolio': { emoji: '💼', priority: 'high', delay: 'normal' },
    'alert': { emoji: '🚨', priority: 'urgent', delay: 'priority' },
    'regime': { emoji: '🏛️', priority: 'high', delay: 'normal' },
    'anomaly': { emoji: '⚠️', priority: 'urgent', delay: 'priority' },
    
    // 🚀 GPT-5 SPECIFIC TYPES
    'gpt5_response': { emoji: '🚀', priority: 'high', delay: 'normal' },
    'gpt5_nano': { emoji: '⚡', priority: 'urgent', delay: 'speed' },
    'gpt5_mini': { emoji: '🔥', priority: 'high', delay: 'priority' },
    'gpt5_full': { emoji: '🧠', priority: 'high', delay: 'normal' },
    'gpt5_chat': { emoji: '💬', priority: 'high', delay: 'normal' },
    
    // ⚡ SPEED OPTIMIZATION TYPES
    'speed_ultra': { emoji: '⚡', priority: 'urgent', delay: 'speed' },
    'speed_fast': { emoji: '🚀', priority: 'urgent', delay: 'speed' },
    'speed_balanced': { emoji: '⚖️', priority: 'high', delay: 'priority' },
    
    // 🧠 MEMORY INTEGRATION TYPES
    'memory_response': { emoji: '🧠', priority: 'high', delay: 'normal' },
    'memory_recall': { emoji: '💭', priority: 'high', delay: 'priority' },
    'memory_analysis': { emoji: '🔍', priority: 'high', delay: 'normal' },
    
    // 🎯 STRATEGIC TYPES
    'strategic': { emoji: '🎯', priority: 'high', delay: 'normal' },
    'dual_ai': { emoji: '🔄', priority: 'urgent', delay: 'priority' },
    'fallback': { emoji: '🔄', priority: 'normal', delay: 'normal' },
    'error': { emoji: '❌', priority: 'urgent', delay: 'speed' }
};

/**
 * 🎯 Enhanced smart emoji selection with GPT-5 awareness
 */
function getSmartEmoji(message, aiModel = null, options = {}) {
    const text = message.toLowerCase();
    
    // GPT-5 Model-specific emojis
    if (aiModel) {
        if (aiModel.includes('gpt-5-nano') || options.speedOptimized) return '⚡';
        if (aiModel.includes('gpt-5-mini')) return '🔥';
        if (aiModel.includes('gpt-5') && !aiModel.includes('mini')) return '🧠';
        if (aiModel.includes('gpt-5-chat')) return '💬';
        if (aiModel.includes('claude')) return '⚡';
        if (aiModel.includes('dual')) return '🔄';
    }
    
    // Speed indicators
    if (text.includes('ultra-fast') || text.includes('speed') || options.isUltraFast) return '⚡';
    if (text.includes('quick') || text.includes('fast') || options.isFast) return '🚀';
    if (text.includes('balanced') || options.isBalanced) return '⚖️';
    
    // Memory indicators
    if (text.includes('remember') || text.includes('memory') || text.includes('recall')) return '🧠';
    if (text.includes('my name') || text.includes('what is my')) return '💭';
    if (text.includes('context') || text.includes('conversation history')) return '🔍';
    
    // Content-based emoji selection (existing logic)
    if (text.includes('cambodia') || text.includes('phnom penh')) return '🇰🇭';
    if (text.includes('market') || text.includes('trading') || text.includes('stocks')) return '📈';
    if (text.includes('portfolio') || text.includes('fund') || text.includes('investment')) return '💼';
    if (text.includes('risk') || text.includes('alert') || text.includes('warning')) return '🚨';
    if (text.includes('analysis') || text.includes('strategic') || text.includes('framework')) return '📊';
    if (text.includes('regime') || text.includes('economic') || text.includes('monetary')) return '🏛️';
    if (text.includes('anomaly') || text.includes('unusual') || text.includes('detected')) return '⚠️';
    if (text.includes('error') || text.includes('failed') || text.includes('problem')) return '❌';
    
    return '💬'; // Default
}

/**
 * 🧹 Enhanced response cleaning with GPT-5 optimization
 */
function cleanResponse(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    return text
        // Clean up markdown formatting for Telegram
        .replace(/\*\*(.*?)\*\*/g, '*$1*')      // Convert **bold** to *bold* for Telegram
        .replace(/^\s*[-*+]\s+/gm, '• ')        // Clean bullet points
        .replace(/^#{1,6}\s+(.*)$/gm, '*$1*')   // Convert headers to bold
        
        // GPT-5 specific optimizations
        .replace(/```(\w+)?\n([\s\S]*?)\n```/g, '`$2`')  // Simplify code blocks
        .replace(/\[reasoning\]|\[analysis\]|\[context\]/gi, '') // Remove GPT-5 markers
        .replace(/\(confidence:\s*\d+%\)/gi, '') // Remove confidence indicators
        .replace(/\(GPT-5[^)]*\)/gi, '')        // Remove GPT-5 system messages
        .replace(/\(reasoning_effort[^)]*\)/gi, '') // Remove reasoning effort indicators
        .replace(/\(verbosity[^)]*\)/gi, '')    // Remove verbosity indicators
        
        // Memory system optimizations
        .replace(/\[MEMORY CONTEXT:\]/gi, '🧠 *Memory Context:*') // Format memory headers
        .replace(/\[USER PROFILE:\]/gi, '👤 *User Profile:*')     // Format profile headers
        .replace(/\[PERSISTENT MEMORIES:\]/gi, '💭 *Remembered:*') // Format memory sections
        
        // Speed optimization indicators
        .replace(/\(Ultra-Fast GPT-5[^)]*\)/gi, '⚡') // Convert speed indicators to emojis
        .replace(/\(Fast GPT-5[^)]*\)/gi, '🚀')      // Convert speed indicators to emojis
        .replace(/\(Balanced GPT-5[^)]*\)/gi, '⚖️')   // Convert speed indicators to emojis
        
        // Clean up excessive spacing
        .replace(/\n{3,}/g, '\n\n')             // Max 2 line breaks
        .replace(/^\s+|\s+$/g, '')              // Trim whitespace
        .trim();
}

/**
 * 🏷️ Enhanced metadata builder with GPT-5 + Speed + Memory support
 */
function buildMessageMetadata(options) {
    const metadata = [];
    
    // GPT-5 Model information
    if (options.aiModel) {
        let aiName = options.aiModel;
        
        // Standardize GPT-5 model names
        if (aiName.includes('gpt-5-nano')) aiName = 'GPT-5 Nano';
        else if (aiName.includes('gpt-5-mini')) aiName = 'GPT-5 Mini';
        else if (aiName.includes('gpt-5-chat')) aiName = 'GPT-5 Chat';
        else if (aiName.includes('gpt-5')) aiName = 'GPT-5';
        else if (aiName.includes('claude')) aiName = 'Claude';
        else if (aiName.includes('dual')) aiName = 'Dual AI';
        
        metadata.push(`*AI:* ${aiName}`);
    }
    
    // Speed optimization information
    if (options.speedOptimized) {
        if (options.isUltraFast) metadata.push(`*Mode:* ⚡ Ultra-Fast`);
        else if (options.isFast) metadata.push(`*Mode:* 🚀 Fast`);
        else if (options.isBalanced) metadata.push(`*Mode:* ⚖️ Balanced`);
        else metadata.push(`*Mode:* 🚀 Optimized`);
    }
    
    // Memory information
    if (options.memoryUsed) {
        metadata.push(`*Memory:* 🧠 Active`);
    }
    
    // Response time (only show if significant)
    if (options.responseTime && options.responseTime > 1000) {
        const seconds = Math.round(options.responseTime / 1000);
        if (seconds <= 3) {
            metadata.push(`*Time:* ⚡ ${seconds}s`);
        } else if (seconds <= 10) {
            metadata.push(`*Time:* 🚀 ${seconds}s`);
        } else {
            metadata.push(`*Time:* ${seconds}s`);
        }
    }
    
    // Context information
    if (options.contextUsed) {
        metadata.push(`*Context:* ✅ Enhanced`);
    }
    
    // Reasoning effort (GPT-5 specific)
    if (options.reasoning_effort) {
        const effort = options.reasoning_effort;
        if (effort === 'minimal') metadata.push(`*Reasoning:* ⚡ Minimal`);
        else if (effort === 'low') metadata.push(`*Reasoning:* 🚀 Low`);
        else if (effort === 'medium') metadata.push(`*Reasoning:* ⚖️ Medium`);
        else if (effort === 'high') metadata.push(`*Reasoning:* 🧠 High`);
    }
    
    // Complexity score (Speed system specific)
    if (options.complexityScore !== undefined) {
        if (options.complexityScore === 0) metadata.push(`*Complexity:* ⚡ Simple`);
        else if (options.complexityScore <= 2) metadata.push(`*Complexity:* 🚀 Medium`);
        else metadata.push(`*Complexity:* 🧠 Complex`);
    }
    
    // Cost tier information
    if (options.costTier) {
        if (options.costTier === 'economy') metadata.push(`*Cost:* 💰 Economy`);
        else if (options.costTier === 'standard') metadata.push(`*Cost:* 💰💰 Standard`);
        else if (options.costTier === 'premium') metadata.push(`*Cost:* 💰💰💰 Premium`);
    }
    
    // Token count (only show if significant)
    if (options.tokens && options.tokens > 1000) {
        metadata.push(`*Tokens:* ${Math.round(options.tokens / 1000)}k`);
    }
    
    return metadata.length > 0 ? metadata.join(' • ') : null;
}

/**
 * 📱 MAIN Enhanced smart message sender with GPT-5 + Speed + Memory optimization
 */
async function sendSmartMessage(bot, chatId, message, options = {}) {
    try {
        console.log(`📱 Sending GPT-5 message to ${chatId} (${message?.length || 0} chars)`);
        
        if (!message || message.trim().length === 0) {
            console.log('⚠️ Empty message - skipping send');
            return false;
        }
        
        // Clean the message with GPT-5 optimization
        let cleanedMessage = cleanResponse(message);
        
        // Determine message type with enhanced GPT-5 awareness
        const messageType = MESSAGE_TYPES[options.type] || { 
            emoji: getSmartEmoji(cleanedMessage, options.aiModel, options), 
            priority: 'normal',
            delay: 'normal'
        };
        
        // Add optional title with GPT-5 formatting
        if (options.title) {
            let titleEmoji = messageType.emoji;
            
            // Override emoji for specific GPT-5 titles
            if (options.title.includes('Ultra-Fast')) titleEmoji = '⚡';
            else if (options.title.includes('Fast')) titleEmoji = '🚀';
            else if (options.title.includes('Balanced')) titleEmoji = '⚖️';
            else if (options.title.includes('Memory')) titleEmoji = '🧠';
            else if (options.title.includes('GPT-5 Nano')) titleEmoji = '⚡';
            else if (options.title.includes('GPT-5 Mini')) titleEmoji = '🔥';
            else if (options.title.includes('GPT-5')) titleEmoji = '🧠';
            
            cleanedMessage = `${titleEmoji} *${options.title}*\n\n${cleanedMessage}`;
        }
        
        // Add enhanced metadata footer for GPT-5 responses
        if (options.includeMetadata || options.aiModel || options.speedOptimized) {
            const metadata = buildMessageMetadata(options);
            if (metadata) {
                cleanedMessage += `\n\n${metadata}`;
            }
        }
        
        // Check if message needs splitting
        if (cleanedMessage.length <= TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
            // Single message - send directly with GPT-5 optimization
            try {
                await bot.sendMessage(chatId, cleanedMessage, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: options.disablePreview !== false
                });
                
                console.log(`✅ GPT-5 message sent (${cleanedMessage.length} chars)`);
                return true;
                
            } catch (sendError) {
                console.log('⚠️ Markdown failed, trying plain text');
                
                // Fallback to plain text with emoji preservation
                const plainMessage = cleanedMessage.replace(/[*_`~]/g, '');
                await bot.sendMessage(chatId, plainMessage, {
                    disable_web_page_preview: options.disablePreview !== false
                });
                
                console.log(`✅ GPT-5 message sent as plain text (${plainMessage.length} chars)`);
                return true;
            }
        }
        
        // Message needs splitting with GPT-5 optimization
        const chunks = splitMessage(cleanedMessage, { ...options, messageType });
        
        if (chunks.length > TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE) {
            console.log(`⚠️ GPT-5 message too long (${chunks.length} chunks), truncating`);
            chunks.splice(TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE);
            chunks[chunks.length - 1] += '\n\n*⚡ (Message truncated for speed)*';
        }
        
        // Send chunks with GPT-5 optimized delays
        let delay = TELEGRAM_LIMITS.MESSAGE_DELAY_MS;
        
        switch (messageType.delay) {
            case 'speed':
                delay = TELEGRAM_LIMITS.SPEED_DELAY_MS;
                break;
            case 'priority':
                delay = TELEGRAM_LIMITS.PRIORITY_DELAY_MS;
                break;
            default:
                delay = TELEGRAM_LIMITS.MESSAGE_DELAY_MS;
        }
        
        // Override delay for speed-optimized responses
        if (options.speedOptimized || options.isUltraFast) {
            delay = TELEGRAM_LIMITS.SPEED_DELAY_MS;
        }
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const isLast = i === chunks.length - 1;
            
            try {
                await bot.sendMessage(chatId, chunk, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: options.disablePreview !== false
                });
                
                console.log(`✅ GPT-5 chunk ${i + 1}/${chunks.length} sent (${chunk.length} chars)`);
                
                // Add optimized delay between chunks (except last)
                if (!isLast) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
            } catch (chunkError) {
                console.error(`❌ GPT-5 chunk ${i + 1} failed:`, chunkError.message);
                
                // Try plain text fallback
                try {
                    const plainChunk = chunk.replace(/[*_`~]/g, '');
                    await bot.sendMessage(chatId, plainChunk);
                    console.log(`✅ GPT-5 chunk ${i + 1} sent as plain text`);
                } catch (fallbackError) {
                    console.error(`❌ GPT-5 chunk ${i + 1} completely failed`);
                }
            }
        }
        
        console.log(`✅ GPT-5 message complete: ${chunks.length} chunks sent`);
        return true;
        
    } catch (error) {
        console.error('❌ GPT-5 smart message error:', error.message);
        
        // Emergency fallback
        try {
            const emergency = `⚠️ GPT-5 message delivery error: ${error.message}`;
            await bot.sendMessage(chatId, emergency.substring(0, TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH));
        } catch (emergencyError) {
            console.error('❌ Emergency fallback failed:', emergencyError.message);
        }
        
        return false;
    }
}

/**
 * ✂️ Enhanced message splitting with GPT-5 content awareness
 */
function splitMessage(message, options = {}) {
    const chunks = [];
    let remaining = message;
    let partNumber = 1;
    
    const maxChunkSize = TELEGRAM_LIMITS.OPTIMAL_CHUNK_SIZE;
    const messageType = options.messageType || MESSAGE_TYPES.general;
    
    while (remaining.length > maxChunkSize) {
        // Find good split point with GPT-5 awareness
        let splitPoint = findBestSplitPoint(remaining, maxChunkSize);
        
        if (splitPoint === -1) {
            // Force split if no good point found
            splitPoint = maxChunkSize - 100;
        }
        
        // Extract chunk
        let chunk = remaining.substring(0, splitPoint).trim();
        
        // Add part header for multi-part messages with GPT-5 styling
        if (options.title || chunks.length > 0) {
            const partEmoji = options.speedOptimized ? '⚡' : messageType.emoji;
            const partHeader = `${partEmoji} *(Part ${partNumber})*\n\n`;
            
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
        remaining = remaining.substring(splitPoint).trim();
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
            const finalEmoji = options.speedOptimized ? '⚡' : messageType.emoji;
            const finalHeader = `${finalEmoji} *(Part ${partNumber} - Final)*\n\n`;
            finalChunk = finalHeader + remaining;
        }
        
        chunks.push(finalChunk);
    }
    
    return chunks;
}

/**
 * 🔍 Enhanced split point detection with GPT-5 content awareness
 */
function findBestSplitPoint(text, maxLength) {
    // Enhanced split patterns for GPT-5 content (in order of preference)
    const splitPatterns = [
        /\n\n\*\*.*?\*\*:/g,          // AI section headers
        /\n\n🧠\s+\*.*?\*:/g,         // Memory section headers
        /\n\n⚡\s+\*.*?\*:/g,          // Speed section headers
        /\n\n📊\s+\*.*?\*:/g,         // Analysis section headers
        /\n\n#{1,3}\s+/g,             // Markdown headers
        /\n\n\d+\.\s+/g,              // Numbered lists
        /\n\n•\s+/g,                  // Bullet points
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

// 🚀 GPT-5 SPECIFIC SENDER FUNCTIONS

/**
 * ⚡ Ultra-fast GPT-5 response sender
 */
async function sendUltraFastResponse(bot, chatId, response, title = null, options = {}) {
    return await sendSmartMessage(bot, chatId, response, {
        title: title || '⚡ Ultra-Fast GPT-5 Response',
        type: 'speed_ultra',
        aiModel: 'gpt-5-nano',
        speedOptimized: true,
        isUltraFast: true,
        includeMetadata: true,
/**
 * 🚨 Enhanced alert sender
 */
async function sendAlert(bot, chatId, alertMessage, title = 'Alert', options = {}) {
    const alertContent = formatWithTimestamp(alertMessage, true, options.responseTime);
    
    return await sendSmartMessage(bot, chatId, alertContent, {
        title: title,
        type: 'alert',
        disablePreview: true,
        includeMetadata: true,
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
        includeMetadata: true,
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
        includeMetadata: true,
        ...options
    });
}

/**
 * 🎯 Enhanced strategic analysis sender
 */
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
 * 📊 Enhanced message statistics with GPT-5 + Speed + Memory metrics
 */
function getMessageStats(message, aiModel = null, options = {}) {
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
    
    // Calculate send time based on speed optimization
    let baseDelay = TELEGRAM_LIMITS.MESSAGE_DELAY_MS;
    if (options.speedOptimized || options.isUltraFast) {
        baseDelay = TELEGRAM_LIMITS.SPEED_DELAY_MS;
    } else if (options.isFast || options.isBalanced) {
        baseDelay = TELEGRAM_LIMITS.PRIORITY_DELAY_MS;
    }
    
    const estimatedSendTime = chunks > 1 ? 
        (chunks - 1) * baseDelay + 1000 : 1000;
    
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
        
        // GPT-5 specific metrics
        aiModel: aiModel,
        estimatedTokens: aiModel ? Math.ceil(length / 4) : null,
        complexity: length > 2000 ? 'high' : length > 800 ? 'medium' : 'low',
        
        // Speed optimization metrics
        speedOptimized: options.speedOptimized || false,
        memoryUsed: options.memoryUsed || false,
        reasoningEffort: options.reasoning_effort || 'unknown',
        
        // Performance metrics
        expectedDelay: baseDelay,
        gpt5Optimized: aiModel && aiModel.includes('gpt'),
        costTier: options.costTier || 'unknown'
    };
}

/**
 * 🔧 Enhanced timestamp formatting with GPT-5 response time
 */
function formatWithTimestamp(message, includeTimestamp = false, responseTime = null, options = {}) {
    if (!includeTimestamp) {
        return message;
    }
    
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Phnom_Penh',
        hour12: false 
    });
    
    let timeInfo = `*⏰ Time:* ${timestamp} Cambodia`;
    
    // Enhanced response time formatting
    if (responseTime && responseTime > 1000) {
        const seconds = Math.round(responseTime / 1000);
        let responseIcon = '⏱️';
        
        if (seconds <= 3) responseIcon = '⚡';
        else if (seconds <= 10) responseIcon = '🚀';
        else if (seconds <= 30) responseIcon = '⏳';
        
        timeInfo += ` | *${responseIcon} Response:* ${seconds}s`;
    }
    
    // Add GPT-5 model information if available
    if (options.aiModel) {
        let modelIcon = '🤖';
        if (options.aiModel.includes('gpt-5-nano')) modelIcon = '⚡';
        else if (options.aiModel.includes('gpt-5-mini')) modelIcon = '🔥';
        else if (options.aiModel.includes('gpt-5')) modelIcon = '🧠';
        
        timeInfo += ` | *${modelIcon} Model:* ${options.aiModel}`;
    }
    
    return `${timeInfo}\n\n${message}`;
}

// 📝 ENHANCED LEGACY COMPATIBILITY FUNCTIONS

/**
 * Legacy function for backward compatibility
 */
async function sendSmartResponse(bot, chatId, message, title = null, messageType = 'general', options = {}) {
    return await sendSmartMessage(bot, chatId, message, {
        title: title,
        type: messageType,
        ...options
    });
}

/**
 * Legacy response cleaner (enhanced)
 */
function cleanStrategicResponse(text) {
    return cleanResponse(text);
}

/**
 * Legacy long message sender (enhanced)
 */
async function sendLongMessage(bot, chatId, message, delay = TELEGRAM_LIMITS.MESSAGE_DELAY_MS) {
    return await sendSmartMessage(bot, chatId, message, {
        type: 'general'
    });
}

/**
 * Legacy message splitter (enhanced)
 */
function splitLongMessage(message, maxLength = TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
    if (message.length <= maxLength) {
        return [message];
    }
    
    return splitMessage(message, { type: 'general' });
}

/**
 * Legacy Ray Dalio formatter (enhanced)
 */
function formatRayDalioResponse(analysis, title = "Ray Dalio Analysis") {
    return formatWithTimestamp(analysis, true);
}

/**
 * Legacy Cambodia fund formatter (enhanced)
 */
function formatCambodiaFundResponse(analysis, title = "Cambodia Fund Analysis") {
    return formatWithTimestamp(analysis, true);
}

// 🔧 UTILITY FUNCTIONS

/**
 * Get optimal delay based on message type and options
 */
function getOptimalDelay(messageType, options = {}) {
    if (options.speedOptimized || options.isUltraFast) {
        return TELEGRAM_LIMITS.SPEED_DELAY_MS;
    }
    
    if (options.isFast || messageType.delay === 'priority') {
        return TELEGRAM_LIMITS.PRIORITY_DELAY_MS;
    }
    
    if (messageType.delay === 'speed') {
        return TELEGRAM_LIMITS.SPEED_DELAY_MS;
    }
    
    return TELEGRAM_LIMITS.MESSAGE_DELAY_MS;
}

/**
 * Check if message content indicates GPT-5 usage
 */
function detectGPT5Content(message) {
    const gpt5Indicators = [
        'gpt-5', 'gpt5', 'reasoning_effort', 'verbosity',
        'enhanced reasoning', 'improved math', 'financial analysis',
        'speed optimization', 'memory integration'
    ];
    
    const lowerMessage = message.toLowerCase();
    return gpt5Indicators.some(indicator => lowerMessage.includes(indicator));
}

/**
 * Format message for different GPT-5 models
 */
function formatForGPT5Model(message, modelType) {
    switch (modelType) {
        case 'nano':
            return `⚡ *GPT-5 Nano*\n\n${message}`;
        case 'mini':
            return `🔥 *GPT-5 Mini*\n\n${message}`;
        case 'full':
            return `🧠 *GPT-5*\n\n${message}`;
        case 'chat':
            return `💬 *GPT-5 Chat*\n\n${message}`;
        default:
            return message;
    }
}

// 📤 MAIN EXPORT MODULE
module.exports = {
    // 🚀 Main enhanced functions
    sendSmartMessage,
    sendAnalysis,
    sendCambodiaAnalysis,
    sendMarketAnalysis,
    sendPortfolioAnalysis,
    sendAlert,
    sendRegimeAnalysis,
    sendAnomalyAlert,
    sendStrategicAnalysis,
    
    // 🚀 GPT-5 SPECIFIC FUNCTIONS (NEW)
    sendGPTResponse,
    sendClaudeResponse,
    sendDualAIResponse,
    sendUltraFastResponse,
    sendFastResponse,
    sendBalancedResponse,
    sendMemoryResponse,
    
    // 🔧 Enhanced utility functions
    cleanResponse,
    splitMessage,
    findBestSplitPoint,
    getMessageStats,
    formatWithTimestamp,
    getSmartEmoji,
    buildMessageMetadata,
    
    // 🔧 NEW utility functions
    getOptimalDelay,
    detectGPT5Content,
    formatForGPT5Model,
    
    // 📝 Legacy compatibility (enhanced)
    sendSmartResponse,
    cleanStrategicResponse,
    sendLongMessage,
    splitLongMessage,
    formatRayDalioResponse,
    formatCambodiaFundResponse,
    
    // 📊 Constants
    TELEGRAM_LIMITS,
    MESSAGE_TYPES
};

console.log('✅ Enhanced Telegram Splitter loaded with GPT-5 + Speed + Memory support');
console.log('🚀 GPT-5 optimized message handling active');
console.log('⚡ Speed optimization support enabled');
console.log('🧠 Memory integration support enabled');
console.log('🎯 Smart emoji and metadata generation active');
console.log('📊 Enhanced analytics and performance tracking enabled');
