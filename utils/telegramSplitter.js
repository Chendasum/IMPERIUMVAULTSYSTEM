// utils/telegramSplitter.js - CLEAN FORMATTED VERSION
// ════════════════════════════════════════════════════════════════════════════
// Production-ready Telegram message splitter with enhanced features
// Clean formatting, consistent spacing, proper alignment
// ════════════════════════════════════════════════════════════════════════════

'use strict';

console.log('📱 Loading Clean Telegram Splitter v2.0...');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    TELEGRAM_LIMIT: 4096,
    SAFE_CHUNK_SIZE: parseInt(process.env.TELEGRAM_CHUNK_SIZE) || 3800,
    MAX_CHUNKS: parseInt(process.env.MAX_TELEGRAM_CHUNKS) || 15,
    RATE_LIMIT_DELAY: parseInt(process.env.TELEGRAM_DELAY_MS) || 100,
    MAX_RETRIES: parseInt(process.env.TELEGRAM_MAX_RETRIES) || 3,
    RETRY_DELAY: parseInt(process.env.TELEGRAM_RETRY_DELAY) || 1000,
    ENABLE_COMPRESSION: process.env.TELEGRAM_COMPRESS === 'true',
    DEBUG_MODE: process.env.TELEGRAM_DEBUG === 'true'
};

// Header templates with perfect alignment
const HEADERS = {
    gpt5: {
        top:    '╭──────────────────────────────────────────╮',
        title:  '│             🚀 GPT-5 Response             │',
        model:  '│                🤖 {MODEL}                 │',
        meta:   '│          {TIMESTAMP} • {CHUNKS}ch         │',
        bottom: '╰──────────────────────────────────────────╯'
    },
    completion: {
        top:    '╭──────────────────────────────────────────╮',
        title:  '│              ✅ Task Complete              │',
        model:  '│                🤖 {MODEL}                 │',
        meta:   '│         {TIMESTAMP} • {TIME}ms          │',
        bottom: '╰──────────────────────────────────────────╯'
    },
    error: {
        top:    '╭──────────────────────────────────────────╮',
        title:  '│              ⚠️ System Alert               │',
        model:  '│                🔧 {MODEL}                 │',
        meta:   '│        {TIMESTAMP} • Error {CODE}        │',
        bottom: '╰──────────────────────────────────────────╯'
    },
    multimodal: {
        top:    '╭──────────────────────────────────────────╮',
        title:  '│             🎥 Multimodal AI              │',
        model:  '│              🔍 {MODEL} Vision             │',
        meta:   '│        {TIMESTAMP} • {TYPE} Analysis      │',
        bottom: '╰──────────────────────────────────────────╯'
    },
    simple: {
        top:    '╭──────────────────────────────────────────╮',
        title:  '│                💬 Response                 │',
        model:  '│                🤖 {MODEL}                 │',
        meta:   '│              {TIMESTAMP}              │',
        bottom: '╰──────────────────────────────────────────╯'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function safeString(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null, 2);
        } catch (e) {
            return String(value);
        }
    }
    return String(value);
}

function compressText(text) {
    if (!CONFIG.ENABLE_COMPRESSION) return text;
    
    return text
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/[ \t]{3,}/g, '  ')
        .replace(/([.!?])\s+/g, '$1 ')
        .replace(/\s*([,;:])\s*/g, '$1 ')
        .trim();
}

function detectCodeBlocks(text) {
    const blocks = [];
    let inTripleBlock = false;
    let inSingleBlock = false;
    let currentBlockStart = -1;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextTwoChars = text.substring(i, i + 3);
        
        if (nextTwoChars === '```' && (i === 0 || text[i - 1] !== '\\')) {
            if (inTripleBlock) {
                blocks.push({ start: currentBlockStart, end: i + 3, type: 'triple' });
                inTripleBlock = false;
            } else if (!inSingleBlock) {
                currentBlockStart = i;
                inTripleBlock = true;
            }
            i += 2;
            continue;
        }
        
        if (char === '`' && (i === 0 || text[i - 1] !== '\\') && !inTripleBlock) {
            if (inSingleBlock) {
                blocks.push({ start: currentBlockStart, end: i + 1, type: 'single' });
                inSingleBlock = false;
            } else {
                currentBlockStart = i;
                inSingleBlock = true;
            }
        }
    }
    
    if (inTripleBlock || inSingleBlock) {
        blocks.push({
            start: currentBlockStart,
            end: text.length,
            type: inTripleBlock ? 'triple' : 'single',
            unclosed: true
        });
    }
    
    return blocks;
}

function isInsideCodeBlock(text, position) {
    const codeBlocks = detectCodeBlocks(text);
    return codeBlocks.some(block => position >= block.start && position < block.end);
}

function findOptimalBreakpoint(text, maxLength) {
    if (text.length <= maxLength) return text.length;
    
    const searchStart = Math.max(0, maxLength - 400);
    const searchEnd = Math.min(text.length, maxLength);
    const searchText = text.substring(searchStart, searchEnd);
    
    // Priority 1: Section breaks
    const sectionBreak = searchText.lastIndexOf('\n\n');
    if (sectionBreak !== -1) {
        const position = searchStart + sectionBreak + 2;
        if (!isInsideCodeBlock(text, position)) {
            return position;
        }
    }
    
    // Priority 2: Code block boundaries
    const codeBlocks = detectCodeBlocks(text.substring(0, searchEnd));
    for (const block of codeBlocks.reverse()) {
        if (block.end <= searchEnd && block.end >= searchStart) {
            return block.end;
        }
    }
    
    // Priority 3: Sentence endings
    const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
    for (const ending of sentenceEndings) {
        const sentenceBreak = searchText.lastIndexOf(ending);
        if (sentenceBreak !== -1) {
            const position = searchStart + sentenceBreak + ending.length;
            if (!isInsideCodeBlock(text, position)) {
                return position;
            }
        }
    }
    
    // Priority 4: Line break
    const lineBreak = searchText.lastIndexOf('\n');
    if (lineBreak !== -1) {
        const position = searchStart + lineBreak + 1;
        if (!isInsideCodeBlock(text, position)) {
            return position;
        }
    }
    
    // Priority 5: Word boundary
    const wordBreak = searchText.lastIndexOf(' ');
    if (wordBreak !== -1) {
        return searchStart + wordBreak + 1;
    }
    
    // Last resort: hard break
    return maxLength - 10;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT SPLITTING
// ═══════════════════════════════════════════════════════════════════════════

class TextSplitter {
    constructor(options = {}) {
        this.options = {
            maxChunkSize: options.maxChunkSize || CONFIG.SAFE_CHUNK_SIZE,
            maxChunks: options.maxChunks || CONFIG.MAX_CHUNKS,
            enableCompression: options.enableCompression !== false
        };
    }
    
    async splitText(text, progressCallback) {
        let cleanedText = safeString(text).trim();
        
        if (this.options.enableCompression) {
            cleanedText = compressText(cleanedText);
        }
        
        if (cleanedText.length <= this.options.maxChunkSize) {
            return [cleanedText];
        }
        
        const chunks = [];
        let remaining = cleanedText;
        let chunkCount = 0;
        const estimatedTotal = Math.ceil(cleanedText.length / this.options.maxChunkSize);
        
        while (remaining.length > 0 && chunkCount < this.options.maxChunks) {
            if (progressCallback && chunkCount % 2 === 0) {
                progressCallback(chunkCount, estimatedTotal, chunks.length);
            }
            
            if (remaining.length <= this.options.maxChunkSize) {
                chunks.push(remaining.trim());
                break;
            }
            
            const breakpoint = findOptimalBreakpoint(remaining, this.options.maxChunkSize);
            const chunk = remaining.substring(0, breakpoint).trim();
            
            if (chunk.length > 0) {
                chunks.push(chunk);
            }
            
            remaining = remaining.substring(breakpoint).trim();
            chunkCount++;
            
            if (chunkCount % 5 === 0) {
                await new Promise(resolve => setImmediate(resolve));
            }
        }
        
        if (remaining.length > 0 && chunkCount >= this.options.maxChunks) {
            const lastChunk = chunks[chunks.length - 1] || '';
            const combinedLength = lastChunk.length + remaining.length;
            
            if (combinedLength <= CONFIG.TELEGRAM_LIMIT * 1.1) {
                chunks[chunks.length - 1] = lastChunk + '\n\n' + remaining;
            } else {
                chunks.push('\n\n...[Response truncated - content too long]');
            }
        }
        
        return chunks.filter(chunk => chunk.length > 0);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function getModelInfo(metadata) {
    const model = safeString(metadata.model || metadata.modelUsed || metadata.aiUsed || 'gpt-5');
    
    const modelMap = {
        'gpt-5-nano': { name: 'GPT-5 Nano', emoji: '⚡' },
        'gpt-5-mini': { name: 'GPT-5 Mini', emoji: '🔧' },
        'gpt-5': { name: 'GPT-5', emoji: '🚀' },
        'gpt-4o': { name: 'GPT-4o', emoji: '👁️' },
        'whisper': { name: 'Whisper', emoji: '🎵' },
        'vision': { name: 'Vision', emoji: '👀' },
        'multimodal': { name: 'Multimodal', emoji: '🎥' },
        'completion': { name: 'Auto-Complete', emoji: '✨' },
        'error': { name: 'Error Handler', emoji: '🔧' },
        'system': { name: 'System', emoji: '⚙️' }
    };
    
    const modelKey = Object.keys(modelMap).find(key =>
        model.toLowerCase().includes(key.toLowerCase())
    ) || 'gpt-5';
    
    return {
        name: modelMap[modelKey].name,
        emoji: modelMap[modelKey].emoji,
        fullName: modelMap[modelKey].name
    };
}

function getHeaderType(metadata) {
    if (metadata.multimodal || metadata.vision || metadata.image) return 'multimodal';
    if (metadata.completionDetected) return 'completion';
    if (metadata.error) return 'error';
    if (metadata.model || metadata.modelUsed || metadata.aiUsed) return 'gpt5';
    return 'simple';
}

function formatTimestamp() {
    return new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function centerText(text, width = 42) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    const leftPad = ' '.repeat(padding);
    const rightPad = ' '.repeat(width - text.length - padding);
    return leftPad + text + rightPad;
}

function buildDynamicHeader(metadata, chunkInfo = {}) {
    const headerType = getHeaderType(metadata);
    const modelInfo = getModelInfo(metadata);
    const template = HEADERS[headerType] || HEADERS.simple;
    
    const replacements = {
        MODEL: modelInfo.name,
        TIMESTAMP: formatTimestamp(),
        CHUNKS: chunkInfo.total || 1,
        TIME: metadata.processingTime || 'Fast',
        CODE: metadata.errorCode || '500',
        TYPE: metadata.analysisType || 'Content'
    };
    
    const processLine = (line) => {
        let processed = line;
        Object.entries(replacements).forEach(([key, value]) => {
            processed = processed.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        });
        
        if (processed.includes('│') && !processed.match(/^[│╭╰─]+$/)) {
            const content = processed.replace(/^│\s*/, '').replace(/\s*│$/, '');
            const centered = centerText(content);
            return `│${centered}│`;
        }
        
        return processed;
    };
    
    return {
        top: processLine(template.top),
        title: processLine(template.title),
        model: processLine(template.model),
        meta: template.meta ? processLine(template.meta) : null,
        bottom: processLine(template.bottom)
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE SENDING
// ═══════════════════════════════════════════════════════════════════════════

class MessageSender {
    constructor(bot) {
        this.bot = bot;
    }
    
    async sendWithRetry(chatId, text, options = {}, maxRetries = CONFIG.MAX_RETRIES) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.bot.sendMessage(chatId, text, {
                    parse_mode: options.parseMode || 'Markdown',
                    disable_web_page_preview: true,
                    ...options
                });
                
                return { success: true, result, attempts: attempt };
                
            } catch (error) {
                lastError = error;
                
                if (error.message.includes('parse') && options.parseMode === 'Markdown') {
                    try {
                        const result = await this.bot.sendMessage(chatId, text, {
                            disable_web_page_preview: true
                        });
                        return { success: true, result, fallback: true, attempts: attempt };
                    } catch (fallbackError) {
                        // Continue with retry logic
                    }
                }
                
                if (attempt < maxRetries) {
                    const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        return { success: false, error: lastError.message, attempts: maxRetries };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SENDING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function sendTelegramMessage(bot, chatId, text, metadata = {}) {
    const startTime = Date.now();
    
    try {
        if (!bot || typeof bot.sendMessage !== 'function') {
            throw new Error('Invalid Telegram bot instance');
        }
        
        if (!chatId) {
            throw new Error('Chat ID required');
        }
        
        const cleanedText = safeString(text).trim();
        if (!cleanedText) {
            throw new Error('Empty message content');
        }
        
        // Initialize text splitter
        const splitter = new TextSplitter({
            maxChunkSize: CONFIG.SAFE_CHUNK_SIZE - 200,
            maxChunks: CONFIG.MAX_CHUNKS,
            enableCompression: CONFIG.ENABLE_COMPRESSION
        });
        
        // Split text
        const textChunks = await splitter.splitText(cleanedText);
        
        // Build headers
        const chunkInfo = { total: textChunks.length };
        const headerData = buildDynamicHeader(metadata, chunkInfo);
        const headerText = Object.values(headerData).filter(Boolean).join('\n');
        
        // Initialize sender
        const sender = new MessageSender(bot);
        const results = [];
        let successCount = 0;
        
        // Send messages
        for (let i = 0; i < textChunks.length; i++) {
            const chunk = textChunks[i];
            const isFirstChunk = i === 0;
            const isLastChunk = i === textChunks.length - 1;
            
            let messageContent;
            
            if (isFirstChunk && textChunks.length === 1) {
                messageContent = `${headerText}\n\n${chunk}`;
            } else if (isFirstChunk) {
                messageContent = `${headerText}\n\n${chunk}`;
            } else {
                const partHeader = `📄 Part ${i + 1}/${textChunks.length}`;
                messageContent = `${partHeader}\n\n${chunk}`;
            }
            
            // Ensure within limits
            if (messageContent.length > CONFIG.TELEGRAM_LIMIT) {
                const availableSpace = CONFIG.TELEGRAM_LIMIT - 100;
                const truncationMsg = '\n\n...[Content truncated]';
                messageContent = messageContent.substring(0, availableSpace - truncationMsg.length) + truncationMsg;
            }
            
            const result = await sender.sendWithRetry(chatId, messageContent);
            results.push(result);
            
            if (result.success) {
                successCount++;
            }
            
            // Rate limiting
            if (!isLastChunk && CONFIG.RATE_LIMIT_DELAY > 0) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
            }
        }
        
        const processingTime = Date.now() - startTime;
        const allSuccessful = successCount === textChunks.length;
        const modelInfo = getModelInfo(metadata);
        
        return {
            success: allSuccessful,
            enhanced: true,
            version: '2.0.1',
            chunks: textChunks.length,
            sent: successCount,
            failed: textChunks.length - successCount,
            processingTime,
            model: modelInfo.name,
            headerType: getHeaderType(metadata),
            originalLength: text.length,
            processedLength: cleanedText.length,
            results,
            fallbackUsed: results.some(r => r.fallback),
            retryCount: results.reduce((sum, r) => sum + (r.attempts - 1), 0)
        };
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        
        // Emergency fallback
        try {
            const emergencyContent = `⚠️ System Recovery\n\n${safeString(text).substring(0, 1000)}...`;
            await bot.sendMessage(chatId, emergencyContent, { disable_web_page_preview: true });
            
            return {
                success: true,
                enhanced: false,
                emergency: true,
                error: error.message,
                processingTime
            };
        } catch (emergencyError) {
            return {
                success: false,
                enhanced: false,
                error: error.message,
                emergencyError: emergencyError.message,
                processingTime
            };
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function createTelegramHandler(bot, options = {}) {
    const config = { ...CONFIG, ...options };
    
    return {
        send: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
        sendMessage: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
        sendGPTResponse: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
        
        sendError: async (chatId, errorText, options = {}) => {
            return sendTelegramMessage(bot, chatId, errorText, {
                model: 'error-handler',
                error: true,
                title: options.title || 'System Error',
                errorCode: options.code || '500',
                ...options
            });
        },
        
        sendSuccess: async (chatId, successText, options = {}) => {
            return sendTelegramMessage(bot, chatId, successText, {
                model: 'completion-handler',
                completionDetected: true,
                title: options.title || 'Task Complete',
                ...options
            });
        },
        
        sendMultimodal: async (chatId, analysisText, options = {}) => {
            return sendTelegramMessage(bot, chatId, analysisText, {
                model: options.model || 'gpt-4o-vision',
                multimodal: true,
                analysisType: options.type || 'Analysis',
                title: options.title || 'Multimodal Analysis',
                ...options
            });
        },
        
        getConfig: () => ({ ...config }),
        updateConfig: (newConfig) => Object.assign(config, newConfig)
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
    // Main functions
    sendTelegramMessage,
    createTelegramHandler,
    
    // Legacy compatibility
    setupTelegramHandler: createTelegramHandler,
    sendMessage: sendTelegramMessage,
    sendGPTResponse: sendTelegramMessage,
    send: sendTelegramMessage,
    
    // Classes and utilities
    TextSplitter,
    MessageSender,
    
    // Utility functions
    safeString,
    compressText,
    detectCodeBlocks,
    cleanText: (text) => compressText(safeString(text)),
    
    // Constants
    CONFIG,
    HEADERS,
    VERSION: '2.0.1'
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

console.log('');
console.log('📱 ═══════════════════════════════════════════════════════════════');
console.log('   CLEAN TELEGRAM SPLITTER v2.0.1 - PRODUCTION READY');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('✅ FEATURES:');
console.log('   • Smart text splitting with code block preservation');
console.log('   • Beautiful headers with perfect alignment');
console.log('   • Automatic retry with exponential backoff');
console.log('   • Emergency fallback system');
console.log('   • Rate limiting protection');
console.log('   • Memory-optimized processing');
console.log('');
console.log('⚙️ CONFIGURATION:');
console.log(`   • Chunk Size: ${CONFIG.SAFE_CHUNK_SIZE} chars`);
console.log(`   • Max Chunks: ${CONFIG.MAX_CHUNKS}`);
console.log(`   • Rate Delay: ${CONFIG.RATE_LIMIT_DELAY}ms`);
console.log(`   • Max Retries: ${CONFIG.MAX_RETRIES}`);
console.log(`   • Compression: ${CONFIG.ENABLE_COMPRESSION ? 'Enabled' : 'Disabled'}`);
console.log('');
console.log('✅ Clean formatting and consistent spacing applied');
console.log('📱 Ready for production use with your GPT-5 system');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
