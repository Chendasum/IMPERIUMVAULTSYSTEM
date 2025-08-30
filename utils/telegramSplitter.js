// utils/telegramSplitter.js - Production-Ready Telegram Message Handler
'use strict';

const crypto = require('crypto');

// Configuration
const CONFIG = {
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_LENGTH: 3900,
    CHUNK_TARGET: 3500,
    DELAY_MS: 200,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    DUPLICATE_WINDOW_MS: 5000,
    
    MODELS: {
        'gpt-5': { delay: 400, emoji: '🧠', name: 'GPT-5', style: 'professional' },
        'gpt-5-mini': { delay: 250, emoji: '⚡', name: 'GPT-5 Mini', style: 'balanced' },
        'gpt-5-nano': { delay: 150, emoji: '🚀', name: 'GPT-5 Nano', style: 'concise' },
        'gpt-5-chat-latest': { delay: 200, emoji: '💬', name: 'GPT-5 Chat', style: 'conversational' },
        'gpt-4o': { delay: 300, emoji: '🔄', name: 'GPT-4o', style: 'reliable' },
        'default': { delay: 300, emoji: '🤖', name: 'AI Assistant', style: 'neutral' }
    },
    
    AUTO_EMOJIS: {
        'profit': '💰', 'loss': '📉', 'revenue': '💵', 'investment': '📈',
        'portfolio': '💼', 'analysis': '📊', 'report': '📄', 'strategy': '🎯',
        'growth': '📈', 'risk': '⚠️', 'success': '✅', 'error': '❌'
    }
};

// Simple cache implementation
class SimpleCache {
    constructor(maxSize = 100, ttlMs = 300000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
    }
    
    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, { value, timestamp: Date.now() });
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

const messageCache = new SimpleCache();
const errorCache = new SimpleCache(50, 60000);

// Detect GPT model from content
function detectModel(content, options = {}) {
    if (options.model && CONFIG.MODELS[options.model]) {
        return options.model;
    }
    
    const text = content.toLowerCase();
    if (text.includes('gpt-5-nano')) return 'gpt-5-nano';
    if (text.includes('gpt-5-mini')) return 'gpt-5-mini';
    if (text.includes('gpt-5-chat')) return 'gpt-5-chat-latest';
    if (text.includes('gpt-5') || text.includes('reasoning_effort')) return 'gpt-5';
    if (text.includes('gpt-4o')) return 'gpt-4o';
    
    return 'gpt-5-mini';
}

// Add contextual emojis
function addAutoEmojis(text, options = {}) {
    if (options.noEmojis) return text;
    
    let enhanced = text;
    for (const [term, emoji] of Object.entries(CONFIG.AUTO_EMOJIS)) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        enhanced = enhanced.replace(regex, `${emoji} ${term}`);
    }
    
    return enhanced.replace(/(\p{Emoji})\s*\1/gu, '$1');
}

// Apply model-specific styling
function applyTextStyling(text, model, options = {}) {
    if (options.noStyling) return text;
    
    const modelConfig = CONFIG.MODELS[model] || CONFIG.MODELS.default;
    let styled = text;
    
    switch (modelConfig.style) {
        case 'professional':
            styled = styled.replace(/^([A-Z][^.!?]*[.!?])$/gm, '**$1**');
            break;
        case 'concise':
            styled = styled
                .replace(/\n\n+/g, '\n')
                .replace(/\b(very|quite|really|extremely)\s+/gi, '');
            break;
        case 'conversational':
            // Keep natural for conversational style
            break;
    }
    
    return styled;
}

// Process message with all enhancements
function processMessage(text, options = {}) {
    if (!text || typeof text !== 'string') {
        return { text: '', model: 'default', modelConfig: CONFIG.MODELS.default };
    }
    
    // Clean message
    let processed = text
        .replace(/\[(?:GPT-\d+|reasoning_effort|verbosity|model):[^\]]*\]/gi, '')
        .replace(/\((?:confidence|tokens?):[^)]*\)/gi, '')
        .replace(/\*{3,}/g, '**')
        .replace(/_{3,}/g, '__')
        .replace(/`{4,}/g, '```')
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/[ \t]{3,}/g, '  ')
        .trim();
    
    // Detect model
    const detectedModel = detectModel(processed, options);
    
    // Apply enhancements
    if (!options.noEmojis) {
        processed = addAutoEmojis(processed, options);
    }
    
    if (!options.noStyling) {
        processed = applyTextStyling(processed, detectedModel, options);
    }
    
    return {
        text: processed,
        model: detectedModel,
        modelConfig: CONFIG.MODELS[detectedModel] || CONFIG.MODELS.default
    };
}

// Find optimal split point
function findBestSplit(text, maxLength) {
    const searchStart = Math.max(maxLength * 0.7, maxLength - 400);
    const patterns = [/\n\n/g, /\n/g, /\. /g, /; /g, /, /g, / /g];
    
    for (const pattern of patterns) {
        const matches = [...text.matchAll(pattern)];
        for (let i = matches.length - 1; i >= 0; i--) {
            const pos = matches[i].index + matches[i][0].length;
            if (pos >= searchStart && pos <= maxLength) {
                return pos;
            }
        }
    }
    
    return maxLength;
}

// Smart message chunking
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
        
        const emoji = modelConfig.emoji || '📄';
        const modelName = modelConfig.name || 'AI Assistant';
        
        if (chunkNum === 1) {
            chunk = `${emoji} *${modelName} - Part ${chunkNum}*\n\n${chunk}`;
        } else {
            chunk = `${emoji} *Part ${chunkNum}*\n\n${chunk}`;
        }
        
        if (remaining.length - splitPoint > 100) {
            chunk += '\n\n*[Continued...]*';
        }
        
        chunks.push({ text: chunk, model, modelConfig });
        remaining = remaining.substring(splitPoint).trim();
        chunkNum++;
    }
    
    if (remaining.length > 0) {
        const emoji = modelConfig.emoji || '📄';
        const finalChunk = chunkNum > 1 ? 
            `${emoji} *Part ${chunkNum} - Final*\n\n${remaining}` : 
            remaining;
        chunks.push({ text: finalChunk, model, modelConfig });
    }
    
    return chunks;
}

// Generate message hash for duplicate detection
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

// Duplicate detection functions
function isDuplicate(chatId, text, model) {
    const hash = generateMessageHash(chatId, text, model);
    return messageCache.has(hash);
}

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
            if (attempt === maxAttempts) throw error;
            
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
        default:
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

// Main delivery function
async function deliverMessage(bot, chatId, content, options = {}) {
    const startTime = Date.now();
    
    try {
        if (!bot || !chatId || !content) {
            throw new Error('Missing required parameters');
        }
        
        const processed = processMessage(content, options);
        if (!processed.text || processed.text.length < 3) {
            throw new Error('Content too short after processing');
        }
        
        const { text, model, modelConfig } = processed;
        
        // Check for duplicates
        if (!options.force && isDuplicate(chatId, text, model)) {
            console.log(`Duplicate message blocked for chat ${chatId} (model: ${model})`);
            return { 
                success: false, 
                reason: 'duplicate',
                model,
                processing_time: Date.now() - startTime 
            };
        }
        
        // Add title with model branding
        const finalContent = options.title ? 
            `${modelConfig.emoji} *${options.title}*\n\n${text}` : 
            text;
        
        let result;
        
        if (finalContent.length <= CONFIG.SAFE_LENGTH) {
            await retry(() => sendSingleMessage(bot, chatId, finalContent, options));
            result = { chunks: 1, method: 'single' };
        } else {
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
                        silent: i > 0
                    }));
                    
                    delivered++;
                    
                    if (!isLast) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                } catch (error) {
                    console.error(`Chunk ${i + 1}/${chunks.length} failed:`, error.message);
                }
            }
            
            if (delivered === 0) {
                throw new Error('All chunks failed to deliver');
            }
            
            result = { chunks: chunks.length, delivered, method: 'chunked' };
        }
        
        recordMessage(chatId, text, model);
        
        const processingTime = Date.now() - startTime;
        console.log(`Message delivered to ${chatId}: ${result.chunks} chunks, ${processingTime}ms (${modelConfig.name})`);
        
        return {
            success: true,
            processing_time: processingTime,
            model,
            model_config: modelConfig,
            ...result
        };
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`Delivery failed for chat ${chatId}: ${error.message}`);
        
        const errorKey = `error_${chatId}_${Date.now()}`;
        errorCache.set(errorKey, error.message);
        
        return {
            success: false,
            error: error.message,
            processing_time: processingTime
        };
    }
}

// GPT-5 specific methods
async function sendGPT5Message(bot, chatId, content, options = {}) {
    return await deliverMessage(bot, chatId, content, { ...options, model: 'gpt-5' });
}

async function sendGPT5Mini(bot, chatId, content, options = {}) {
    return await deliverMessage(bot, chatId, content, { ...options, model: 'gpt-5-mini' });
}

async function sendGPT5Nano(bot, chatId, content, options = {}) {
    return await deliverMessage(bot, chatId, content, { ...options, model: 'gpt-5-nano' });
}

async function sendGPT5Chat(bot, chatId, content, options = {}) {
    return await deliverMessage(bot, chatId, content, { ...options, model: 'gpt-5-chat-latest' });
}

// Legacy compatibility methods
async function sendGPTResponse(bot, chatId, response, title = null, metadata = {}) {
    return await deliverMessage(bot, chatId, response, { title, model: 'gpt-5', ...metadata });
}

async function sendAnalysis(bot, chatId, analysis, title = null, metadata = {}) {
    return await deliverMessage(bot, chatId, analysis, { title, model: 'gpt-5-mini', ...metadata });
}

async function sendAlert(bot, chatId, message, title = 'System Alert', metadata = {}) {
    const alertContent = `⚠️ ${message}`;
    return await deliverMessage(bot, chatId, alertContent, { title, model: 'default', force: true, ...metadata });
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
    console.log('Message and error caches cleared');
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
    
    // Helper functions
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
