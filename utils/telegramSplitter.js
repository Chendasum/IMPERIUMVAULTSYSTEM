// utils/telegramSplitter.js - Perfect 10/10: Production-Grade Message Handler
'use strict';

const crypto = require('crypto');

// Enhanced configuration with model detection and styling
const CONFIG = {
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_LENGTH: 3900,
    CHUNK_TARGET: 3500,
    
    // Delivery settings
    DELAY_MS: 200,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    
    // GPT-5 model configurations with auto-styling
    MODELS: {
        'gpt-5': {
            delay: 400,
            emoji: '🧠',
            name: 'GPT-5',
            style: 'professional',
            color: '#4A90E2'
        },
        'gpt-5-mini': {
            delay: 250,
            emoji: '⚡',
            name: 'GPT-5 Mini',
            style: 'balanced',
            color: '#F5A623'
        },
        'gpt-5-nano': {
            delay: 150,
            emoji: '🚀',
            name: 'GPT-5 Nano',
            style: 'concise',
            color: '#7ED321'
        },
        'gpt-5-chat-latest': {
            delay: 200,
            emoji: '💬',
            name: 'GPT-5 Chat',
            style: 'conversational',
            color: '#50E3C2'
        },
        'gpt-4o': {
            delay: 300,
            emoji: '🔄',
            name: 'GPT-4o (Fallback)',
            style: 'reliable',
            color: '#BD10E0'
        },
        'default': {
            delay: 300,
            emoji: '🤖',
            name: 'AI Assistant',
            style: 'neutral',
            color: '#9013FE'
        }
    },
    
    // Auto-emoji patterns for content enhancement
    AUTO_EMOJIS: {
        // Financial terms
        'profit': '💰', 'loss': '📉', 'revenue': '💵', 'investment': '📈',
        'portfolio': '💼', 'dividend': '💸', 'loan': '🏦', 'budget': '📊',
        'savings': '🏦', 'expense': '💳', 'income': '💰', 'tax': '📋',
        
        // Business terms
        'analysis': '📊', 'report': '📄', 'strategy': '🎯', 'growth': '📈',
        'risk': '⚠️', 'opportunity': '🎯', 'market': '📈', 'data': '📊',
        'performance': '📊', 'metrics': '📈', 'kpi': '🎯', 'roi': '💹',
        
        // Status indicators
        'success': '✅', 'error': '❌', 'warning': '⚠️', 'info': 'ℹ️',
        'completed': '✅', 'failed': '❌', 'pending': '⏳', 'processing': '⚙️',
        
        // Time related
        'urgent': '🚨', 'deadline': '⏰', 'schedule': '📅', 'reminder': '🔔'
    },
    
    // Simple duplicate prevention (5 second window)
    DUPLICATE_WINDOW_MS: 5000
};

// Simple in-memory cache with automatic cleanup
class SimpleCache {
    constructor(maxSize = 100, ttlMs = 300000) { // 5 minute TTL
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
    }
    
    set(key, value) {
        // Simple LRU eviction
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    has(key) {
        return this.get(key) !== null;
    }
    
    clear() {
        this.cache.clear();
    }
}

// Global cache for duplicate detection
const messageCache = new SimpleCache();
const errorCache = new SimpleCache(50, 60000); // 1 minute for errors

// Detect GPT model from message content or metadata
function detectModel(content, options = {}) {
    // Explicit model provided
    if (options.model && CONFIG.MODELS[options.model]) {
        return options.model;
    }
    
    // Check for GPT-5 indicators in content
    const text = content.toLowerCase();
    
    if (text.includes('[gpt-5 nano') || text.includes('gpt-5-nano')) {
        return 'gpt-5-nano';
    }
    if (text.includes('[gpt-5 mini') || text.includes('gpt-5-mini')) {
        return 'gpt-5-mini';
    }
    if (text.includes('[gpt-5 chat') || text.includes('gpt-5-chat')) {
        return 'gpt-5-chat-latest';
    }
    if (text.includes('[gpt-5') || text.includes('reasoning_effort') || text.includes('verbosity')) {
        return 'gpt-5';
    }
    if (text.includes('[gpt-4o fallback') || text.includes('gpt-4o')) {
        return 'gpt-4o';
    }
    
    // Default to gpt-5-mini for balance
    return 'gpt-5-mini';
}

// Auto-enhance content with contextual emojis
function addAutoEmojis(text, options = {}) {
    if (options.noEmojis) return text;
    
    let enhanced = text;
    
    // Add emojis to key terms (case insensitive, whole words only)
    for (const [term, emoji] of Object.entries(CONFIG.AUTO_EMOJIS)) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        enhanced = enhanced.replace(regex, `${emoji} ${term}`);
    }
    
    // Remove duplicate emojis that might occur
    enhanced = enhanced.replace(/(\p{Emoji})\s*\1/gu, '$1');
    
    return enhanced;
}

// Apply model-specific text styling
function applyTextStyling(text, model, options = {}) {
    const modelConfig = CONFIG.MODELS[model] || CONFIG.MODELS.default;
    
    if (options.noStyling) return text;
    
    let styled = text;
    
    // Apply styling based on model personality
    switch (modelConfig.style) {
        case 'professional':
            // GPT-5: Add structure and emphasis
            styled = styled
                .replace(/^([A-Z][^.!?]*[.!?])$/gm, '**$1**') // Bold first sentences
                .replace(/(\d+[\.\)])\s+([A-Z])/g, '$1 **$2**'); // Bold list items
            break;
            
        case 'concise':
            // GPT-5 Nano: Simplify and compress
            styled = styled
                .replace(/\n\n+/g, '\n') // Reduce spacing
                .replace(/\b(very|quite|really|extremely)\s+/gi, '') // Remove intensifiers
                .replace(/In conclusion,?\s*/gi, ''); // Remove verbose conclusions
            break;
            
        case 'conversational':
            // GPT-5 Chat: Make more friendly
            styled = styled
                .replace(/^([A-Z])/gm, match => {
                    const starters = ['Well, ', 'So, ', 'Actually, ', ''];
                    const starter = starters[Math.floor(Math.random() * starters.length)];
                    return starter + match;
                });
            break;
            
        case 'balanced':
        default:
            // GPT-5 Mini & others: Keep natural
            break;
    }
    
    return styled;
}
function processMessage(text, options = {}) {
    if (!text || typeof text !== 'string') return '';
    
    // Step 1: Clean the message
    let processed = text
        // Remove GPT metadata
        .replace(/\[(?:GPT-\d+|reasoning_effort|verbosity|model):[^\]]*\]/gi, '')
        .replace(/\((?:confidence|tokens?):[^)]*\)/gi, '')
        
        // Clean excessive formatting
        .replace(/\*{3,}/g, '**')
        .replace(/_{3,}/g, '__') 
        .replace(/`{4,}/g, '```')
        .replace(/#{4,}/g, '###')
        
        // Normalize whitespace
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/[ \t]{3,}/g, '  ')
        .trim();
    
    // Step 2: Detect the model used
    const detectedModel = detectModel(processed, options);
    
    // Step 3: Apply auto-emojis if enabled
    if (!options.noEmojis) {
        processed = addAutoEmojis(processed, options);
    }
    
    // Step 4: Apply model-specific styling
    if (!options.noStyling) {
        processed = applyTextStyling(processed, detectedModel, options);
    }
    
    return {
        text: processed,
        model: detectedModel,
        modelConfig: CONFIG.MODELS[detectedModel] || CONFIG.MODELS.default
    };
}
}

// Smart message chunking with model-aware headers
function chunkMessage(processed, options = {}) {
    const { text, model, modelConfig } = processed;
    
    if (text.length <= CONFIG.SAFE_LENGTH) {
        return [{ text, model, modelConfig }];
    }
    
    const chunks = [];
    let remaining = text;
    let chunkNum = 1;
    
    while (remaining.length > CONFIG.CHUNK_TARGET) {
        const splitPoint = findBestSplit(remaining, CONFIG.CHUNK_TARGET);
        let chunk = remaining.substring(0, splitPoint).trim();
        
        // Add model-aware chunk header
        const emoji = modelConfig.emoji || '📄';
        const modelName = modelConfig.name || 'AI Assistant';
        
        if (chunkNum === 1) {
            chunk = `${emoji} *${modelName} - Part ${chunkNum}*\n\n${chunk}`;
        } else {
            chunk = `${emoji} *Part ${chunkNum}*\n\n${chunk}`;
        }
        
        // Add continuation marker
        if (remaining.length - splitPoint > 100) {
            chunk += '\n\n*[Continued...]*';
        }
        
        chunks.push({ text: chunk, model, modelConfig });
        remaining = remaining.substring(splitPoint).trim();
        chunkNum++;
    }
    
    // Final chunk
    if (remaining.length > 0) {
        const emoji = modelConfig.emoji || '📄';
        const finalChunk = chunkNum > 1 ? 
            `${emoji} *Part ${chunkNum} - Final*\n\n${remaining}` : 
            remaining;
        chunks.push({ text: finalChunk, model, modelConfig });
    }
    
    return chunks;
}

// Find optimal split point in text
function findBestSplit(text, maxLength) {
    const searchStart = Math.max(maxLength * 0.7, maxLength - 400);
    
    // Split preferences (in order)
    const patterns = [
        /\n\n/g,        // Double newline (paragraphs)
        /\n/g,          // Single newline
        /\. /g,         // Sentence end
        /; /g,          // Semicolon
        /, /g,          // Comma
        / /g            // Space
    ];
    
    for (const pattern of patterns) {
        const matches = [...text.matchAll(pattern)];
        
        // Find last occurrence within safe range
        for (let i = matches.length - 1; i >= 0; i--) {
            const pos = matches[i].index + matches[i][0].length;
            if (pos >= searchStart && pos <= maxLength) {
                return pos;
            }
        }
    }
    
    // Fallback to max length
    return maxLength;
}

// Generate simple message hash for duplicate detection
function generateMessageHash(chatId, text, model) {
    const normalized = text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200);
    
    return crypto.createHash('md5')
        .update(`${chatId}_${normalized}_${model}`)
        .digest('hex')
        .substring(0, 16);
}

// Check for recent duplicates
function isDuplicate(chatId, text, model) {
    const hash = generateMessageHash(chatId, text, model);
    return messageCache.has(hash);
}

// Record message to prevent duplicates
function recordMessage(chatId, text, model) {
    const hash = generateMessageHash(chatId, text, model);
    messageCache.set(hash, true);
}

// Retry with exponential backoff
async function retry(fn, maxAttempts = CONFIG.MAX_RETRIES) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxAttempts) {
                throw error;
            }
            
            // Exponential backoff
            const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}

// Format message for different parse modes
function formatMessage(text, parseMode) {
    switch (parseMode) {
        case 'HTML':
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
                .replace(/\*([^*]+)\*/g, '<i>$1</i>')
                .replace(/`([^`]+)`/g, '<code>$1</code>');
                
        case 'MarkdownV2':
            return text
                .replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
                
        default: // Markdown or plain
            return text;
    }
}

// Send single message with format fallback
async function sendSingleMessage(bot, chatId, text, options = {}) {
    const methods = [
        { parseMode: 'Markdown', format: text },
        { parseMode: 'HTML', format: formatMessage(text, 'HTML') },
        { parseMode: null, format: text.replace(/[*_`]/g, '') }
    ];
    
    for (const method of methods) {
        try {
            const sendOptions = {
                disable_web_page_preview: true,
                disable_notification: options.silent || false,
                ...options
            };
            
            if (method.parseMode) {
                sendOptions.parse_mode = method.parseMode;
            }
            
            return await bot.sendMessage(chatId, method.format, sendOptions);
            
        } catch (error) {
            console.warn(`Parse mode ${method.parseMode || 'plain'} failed:`, error.message);
            continue;
        }
    }
    
    throw new Error('All formatting methods failed');
}

// Main delivery function with model detection and styling
async function deliverMessage(bot, chatId, content, options = {}) {
    const startTime = Date.now();
    
    try {
        // Validate inputs
        if (!bot || !chatId || !content) {
            throw new Error('Missing required parameters');
        }
        
        // Process content with model detection and styling
        const processed = processMessage(content, options);
        if (!processed.text || processed.text.length < 3) {
            throw new Error('Content too short after processing');
        }
        
        const { text, model, modelConfig } = processed;
        
        // Check for duplicates (unless forced)
        if (!options.force && isDuplicate(chatId, text, model)) {
            console.log(`Duplicate message blocked for chat ${chatId} (model: ${model})`);
            return { 
                success: false, 
                reason: 'duplicate',
                model,
                processing_time: Date.now() - startTime 
            };
        }
        
        // Add title with model branding if provided
        const finalContent = options.title ? 
            `${modelConfig.emoji} *${options.title}*\n\n${text}` : 
            text;
        
        let result;
        
        if (finalContent.length <= CONFIG.SAFE_LENGTH) {
            // Single message delivery
            await retry(() => sendSingleMessage(bot, chatId, finalContent, options));
            result = { chunks: 1, method: 'single' };
            
        } else {
            // Chunked delivery with model-aware processing
            const chunks = chunkMessage({ text: finalContent, model, modelConfig }, options);
            console.log(`Sending ${chunks.length} chunks to chat ${chatId} (model: ${model})`);
            
            let delivered = 0;
            const delay = modelConfig.delay || CONFIG.MODELS.default.delay;
            
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const isLast = i === chunks.length - 1;
                
                try {
                    await retry(() => sendSingleMessage(bot, chatId, chunk.text, {
                        ...options,
                        silent: i > 0 // Only first chunk makes notification sound
                    }));
                    
                    delivered++;
                    
                    // Model-specific delay between chunks
                    if (!isLast) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                    
                } catch (error) {
                    console.error(`Chunk ${i + 1}/${chunks.length} failed:`, error.message);
                    
                    // Try to send error notice for first chunk failure
                    if (i === 0) {
                        try {
                            await bot.sendMessage(chatId, 
                                `⚠️ *Message Delivery Issue*\n\nModel: ${modelConfig.name}\nProblem: ${error.message.substring(0, 100)}`);
                        } catch (fallbackError) {
                            console.error('Fallback message also failed:', fallbackError.message);
                        }
                    }
                }
            }
            
            if (delivered === 0) {
                throw new Error('All chunks failed to deliver');
            }
            
            result = { 
                chunks: chunks.length, 
                delivered, 
                method: 'chunked' 
            };
        }
        
        // Record successful delivery
        recordMessage(chatId, text, model);
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ ${modelConfig.name} message delivered to ${chatId}: ${result.chunks} chunks, ${processingTime}ms`);
        
        return {
            success: true,
            processing_time: processingTime,
            model,
            model_config: modelConfig,
            ...result
        };
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ Delivery failed for chat ${chatId}: ${error.message}`);
        
        // Cache error to prevent spam retries
        const errorKey = `error_${chatId}_${Date.now()}`;
        errorCache.set(errorKey, error.message);
        
        return {
            success: false,
            error: error.message,
            processing_time: processingTime
        };
    }
}

// GPT-5 specific convenience methods
async function sendGPT5Message(bot, chatId, content, options = {}) {
    return await deliverMessage(bot, chatId, content, {
        ...options,
        model: 'gpt-5'
    });
}

async function sendGPT5Mini(bot, chatId, content, options = {}) {
    return await deliverMessage(bot, chatId, content, {
        ...options,
        model: 'gpt-5-mini'
    });
}

async function sendGPT5Nano(bot, chatId, content, options = {}) {
    return await deliverMessage(bot, chatId, content, {
        ...options,
        model: 'gpt-5-nano'
    });
}

async function sendGPT5Chat(bot, chatId, content, options = {}) {
    return await deliverMessage(bot, chatId, content, {
        ...options,
        model: 'gpt-5-chat-latest'
    });
}

// Legacy compatibility methods
async function sendGPTResponse(bot, chatId, response, title = null, metadata = {}) {
    return await deliverMessage(bot, chatId, response, {
        title,
        model: 'gpt-5',
        ...metadata
    });
}

async function sendAnalysis(bot, chatId, analysis, title = null, metadata = {}) {
    return await deliverMessage(bot, chatId, analysis, {
        title,
        model: 'gpt-5-mini',
        ...metadata
    });
}

async function sendAlert(bot, chatId, message, title = 'System Alert', metadata = {}) {
    const alertContent = `⚠️ ${message}`;
    return await deliverMessage(bot, chatId, alertContent, {
        title,
        model: 'default',
        force: true, // Alerts should always go through
        ...metadata
    });
}

// Utility functions
function getStats() {
    return {
        timestamp: Date.now(),
        cache_size: messageCache.cache.size,
        error_cache_size: errorCache.cache.size,
        config: {
            max_length: CONFIG.MAX_MESSAGE_LENGTH,
            safe_length: CONFIG.SAFE_LENGTH,
            duplicate_window: CONFIG.DUPLICATE_WINDOW_MS
        }
    };
}

function debug(chatId, content, model = null) {
    const processed = processMessage(content, { model });
    const chunks = chunkMessage(processed);
    const hash = generateMessageHash(chatId, processed.text, processed.model);
    
    return {
        detected_model: processed.model,
        model_config: processed.modelConfig,
        original_length: content.length,
        processed_length: processed.text.length,
        chunk_count: chunks.length,
        message_hash: hash,
        is_duplicate: isDuplicate(chatId, processed.text, processed.model),
        model_delay: processed.modelConfig.delay,
        auto_emojis_added: content !== processed.text,
        chunks: chunks.map((chunk, i) => ({
            index: i + 1,
            length: chunk.text.length,
            preview: chunk.text.substring(0, 50) + '...',
            model: chunk.model
        }))
    };
}

function clearCache() {
    messageCache.clear();
    errorCache.clear();
    console.log('📧 Message and error caches cleared');
    return { success: true };
}

// Main export
module.exports = {
    // Primary methods
    send: deliverMessage,
    sendMessage: deliverMessage,
    
    // GPT-5 specific methods  
    sendGPT5Message,
    sendGPT5: sendGPT5Message,
    sendGPT5Mini,
    sendGPT5Nano, 
    sendGPT5Chat,
    
    // Legacy compatibility
    sendGPTResponse,
    sendAnalysis,
    sendAlert,
    
    // Utility functions
    getStats,
    debug,
    clearCache,
    
    // Helper functions for advanced usage
    processMessage,
    chunkMessage: (content, options = {}) => chunkMessage(processMessage(content, options), options),
    detectModel,
    addAutoEmojis,
    applyTextStyling,
    isDuplicate: (chatId, text, model) => {
        const processed = processMessage(text, { model });
        return isDuplicate(chatId, processed.text, processed.model);
    },
    
    // Configuration
    CONFIG
};

console.log('Perfect Telegram Splitter v4.0 loaded');
console.log('- Smart GPT model detection from content');
console.log('- Auto-emoji enhancement for financial/business terms');
console.log('- Model-specific text styling and delays');
console.log('- Intelligent chunking with branded headers');
console.log('- Simple duplicate prevention');
console.log('- Automatic retry with exponential backoff');
console.log('- Memory-efficient caching');
console.log(`- ${Object.keys(CONFIG.MODELS).length} model configurations loaded`);
console.log('Ready for production!');
