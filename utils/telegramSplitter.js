// utils/telegramSplitter.js - Robust GPT-5 Telegram Message Formatter
// ═══════════════════════════════════════════════════════════════════════════
// Production-ready implementation with fail-safe mechanisms
// Built for OpenAI GPT-5 (Released August 7, 2025)
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    TELEGRAM_MAX_LENGTH: 4096,
    DEFAULT_CHUNK_SIZE: 3800, // Leave room for headers
    HEADER_SIZE: 250,
    MIN_CHUNK_SIZE: 100,
    DELAY_BETWEEN_MESSAGES: 1000,
    DEBUG_MODE: process.env.NODE_ENV === 'development'
};

// Official GPT-5 Model Variants (Based on OpenAI API)
const GPT5_MODELS = {
    'gpt-5': {
        name: 'GPT-5',
        icon: '🧠',
        description: 'Advanced reasoning model',
        color: '#10B981'
    },
    'gpt-5-mini': {
        name: 'GPT-5 Mini',
        icon: '⚡',
        description: 'Fast and efficient',
        color: '#3B82F6'
    },
    'gpt-5-nano': {
        name: 'GPT-5 Nano',
        icon: '🔹',
        description: 'Ultra-lightweight',
        color: '#8B5CF6'
    }
};

// Context-based emoji sets
const EMOJI_SETS = {
    business: ['💼', '📊', '💰', '📈', '🎯', '🚀', '💎', '🏆'],
    technical: ['💻', '⚙️', '🔧', '🛠️', '📡', '🔌', '⚡', '🖥️'],
    academic: ['📚', '🎓', '📝', '🔬', '🧮', '📐', '🔍', '💡'],
    health: ['🏥', '💊', '🩺', '❤️', '🧬', '⚕️', '🔬', '📋'],
    general: ['🔹', '🔸', '◦', '▫️', '•', '⁃', '▸', '▷']
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING UTILITY
// ═══════════════════════════════════════════════════════════════════════════

class Logger {
    static log(level, message, data = null) {
        if (!CONFIG.DEBUG_MODE && level === 'debug') return;
        
        const timestamp = new Date().toISOString();
        const prefix = {
            error: '❌',
            warn: '⚠️',
            info: 'ℹ️',
            debug: '🔍',
            success: '✅'
        }[level] || 'ℹ️';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
        if (data && CONFIG.DEBUG_MODE) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
    
    static error(message, error = null) {
        this.log('error', message, error);
    }
    
    static warn(message, data = null) {
        this.log('warn', message, data);
    }
    
    static info(message, data = null) {
        this.log('info', message, data);
    }
    
    static debug(message, data = null) {
        this.log('debug', message, data);
    }
    
    static success(message, data = null) {
        this.log('success', message, data);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT ANALYZER
// ═══════════════════════════════════════════════════════════════════════════

class ContextAnalyzer {
    static patterns = {
        business: /(?:business|strategy|profit|revenue|investment|market|sales|roi|growth|client|customer|financial|wealth)/i,
        technical: /(?:code|programming|software|database|api|system|tech|development|debug|algorithm|function|class|method)/i,
        academic: /(?:research|study|analysis|academic|university|paper|thesis|theory|hypothesis|experiment|data|statistics)/i,
        health: /(?:health|medical|symptom|treatment|diagnosis|medicine|doctor|patient|therapy|clinical|hospital)/i,
        mathematical: /(?:math|calculation|formula|equation|solve|compute|calculate|number|statistics|probability)/i
    };
    
    static detectContext(text) {
        if (!text || typeof text !== 'string') {
            return 'general';
        }
        
        const textLower = text.toLowerCase();
        
        // Check each pattern
        for (const [context, pattern] of Object.entries(this.patterns)) {
            if (pattern.test(textLower)) {
                Logger.debug(`Context detected: ${context}`);
                return context;
            }
        }
        
        Logger.debug('Context detected: general (default)');
        return 'general';
    }
    
    static getModelForContext(context) {
        const modelMap = {
            business: 'gpt-5',
            technical: 'gpt-5',
            academic: 'gpt-5',
            health: 'gpt-5',
            mathematical: 'gpt-5',
            general: 'gpt-5-mini'
        };
        
        return modelMap[context] || 'gpt-5-mini';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE ENHANCER
// ═══════════════════════════════════════════════════════════════════════════

class MessageEnhancer {
    static emojiIndex = 0;
    
    static getNextEmoji(context = 'general') {
        const emojiSet = EMOJI_SETS[context] || EMOJI_SETS.general;
        const emoji = emojiSet[this.emojiIndex % emojiSet.length];
        this.emojiIndex++;
        return emoji;
    }
    
    static enhanceMessage(text, context) {
        if (!text || typeof text !== 'string') {
            return text;
        }
        
        let enhanced = text;
        
        try {
            // Replace bullet points with context-appropriate emojis
            enhanced = enhanced.replace(/^(\s*)[•▪▫◦-]\s*/gm, (match, indent) => {
                return `${indent}${this.getNextEmoji(context)} `;
            });
            
            // Enhance numbered lists
            enhanced = enhanced.replace(/^(\s*)(\d+)[\.\)]\s*/gm, (match, indent, number) => {
                const num = parseInt(number);
                if (num <= 10) {
                    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                    return `${indent}${numberEmojis[num - 1]} `;
                }
                return match;
            });
            
            // Add context-specific enhancements
            enhanced = this.addContextSpecificFormatting(enhanced, context);
            
            Logger.debug('Message enhanced successfully', { 
                originalLength: text.length, 
                enhancedLength: enhanced.length,
                context 
            });
            
        } catch (error) {
            Logger.error('Failed to enhance message, using original', error);
            return text;
        }
        
        return enhanced;
    }
    
    static addContextSpecificFormatting(text, context) {
        switch (context) {
            case 'business':
                text = text.replace(/^(Strategy|Revenue|Growth|Analysis)(\s*:|\s+)/gmi, '🎯 $1$2');
                break;
            case 'technical':
                text = text.replace(/^(Code|Function|Algorithm|Debug)(\s*:|\s+)/gmi, '💻 $1$2');
                break;
            case 'academic':
                text = text.replace(/^(Research|Study|Analysis|Conclusion)(\s*:|\s+)/gmi, '📚 $1$2');
                break;
            case 'health':
                text = text.replace(/^(Symptoms|Treatment|Diagnosis|Recommendation)(\s*:|\s+)/gmi, '🏥 $1$2');
                break;
        }
        return text;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADER GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

class HeaderGenerator {
    static createHeader(context, model, partNumber = 1, totalParts = 1, messageLength = 0) {
        try {
            const timestamp = new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const modelInfo = GPT5_MODELS[model] || GPT5_MODELS['gpt-5-mini'];
            const partInfo = totalParts > 1 ? ` (${partNumber}/${totalParts})` : '';
            
            // Performance indicator based on message complexity
            let performanceIcon = '📊';
            if (messageLength > 2000) performanceIcon = '🧮';
            if (messageLength > 4000) performanceIcon = '📋';
            
            const header = `${modelInfo.icon} ${modelInfo.name.toUpperCase()}${partInfo}
📅 ${timestamp} • ${performanceIcon} ${context} • ⚡ Ready

`;
            
            Logger.debug('Header created successfully', { 
                model, 
                context, 
                partNumber, 
                totalParts 
            });
            
            return header;
            
        } catch (error) {
            Logger.error('Failed to create header, using fallback', error);
            return `🤖 GPT-5 Response ${partNumber}/${totalParts}\n\n`;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE SPLITTER CORE
// ═══════════════════════════════════════════════════════════════════════════

class MessageSplitter {
    static splitIntoChunks(text, maxSize, preserveFormatting = true) {
        if (!text || text.length <= maxSize) {
            return [text || ''];
        }
        
        const chunks = [];
        
        if (preserveFormatting) {
            // Split by paragraphs first
            const paragraphs = text.split('\n\n');
            let currentChunk = '';
            
            for (const paragraph of paragraphs) {
                const potentialLength = currentChunk.length + (currentChunk ? 2 : 0) + paragraph.length;
                
                if (potentialLength <= maxSize) {
                    currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
                } else {
                    // Save current chunk if it has content
                    if (currentChunk.trim()) {
                        chunks.push(currentChunk.trim());
                    }
                    
                    // Handle oversized paragraphs
                    if (paragraph.length > maxSize) {
                        const subChunks = this.splitLargeParagraph(paragraph, maxSize);
                        chunks.push(...subChunks.slice(0, -1));
                        currentChunk = subChunks[subChunks.length - 1] || '';
                    } else {
                        currentChunk = paragraph;
                    }
                }
            }
            
            // Add final chunk
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
            }
        } else {
            // Simple character-based splitting
            for (let i = 0; i < text.length; i += maxSize) {
                chunks.push(text.slice(i, i + maxSize));
            }
        }
        
        return chunks.length > 0 ? chunks : [text];
    }
    
    static splitLargeParagraph(paragraph, maxSize) {
        const chunks = [];
        const lines = paragraph.split('\n');
        let currentChunk = '';
        
        for (const line of lines) {
            const potentialLength = currentChunk.length + (currentChunk ? 1 : 0) + line.length;
            
            if (potentialLength <= maxSize) {
                currentChunk = currentChunk ? `${currentChunk}\n${line}` : line;
            } else {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                
                // Handle extremely long lines
                if (line.length > maxSize) {
                    const lineChunks = this.splitLongLine(line, maxSize);
                    chunks.push(...lineChunks.slice(0, -1));
                    currentChunk = lineChunks[lineChunks.length - 1] || '';
                } else {
                    currentChunk = line;
                }
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks.length > 0 ? chunks : [paragraph];
    }
    
    static splitLongLine(line, maxSize) {
        const chunks = [];
        const words = line.split(' ');
        let currentChunk = '';
        
        for (const word of words) {
            const potentialLength = currentChunk.length + (currentChunk ? 1 : 0) + word.length;
            
            if (potentialLength <= maxSize) {
                currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
            } else {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                
                // Handle extremely long words
                if (word.length > maxSize) {
                    for (let i = 0; i < word.length; i += maxSize) {
                        chunks.push(word.substring(i, i + maxSize));
                    }
                    currentChunk = '';
                } else {
                    currentChunk = word;
                }
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks.length > 0 ? chunks : [line];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TELEGRAM FORMATTER
// ═══════════════════════════════════════════════════════════════════════════

class TelegramFormatter {
    static formatMessage(text, options = {}) {
        const settings = {
            maxLength: CONFIG.DEFAULT_CHUNK_SIZE,
            includeHeaders: true,
            preserveFormatting: true,
            enhanceMessage: true,
            ...options
        };
        
        Logger.info('Starting message formatting', { 
            textLength: text?.length || 0,
            settings 
        });
        
        try {
            // Input validation
            if (!text || typeof text !== 'string') {
                Logger.warn('Invalid input provided to formatter');
                return ['⚠️ No response received from GPT-5'];
            }
            
            if (text.trim().length === 0) {
                Logger.warn('Empty text provided to formatter');
                return ['📭 Empty response from GPT-5'];
            }
            
            // Analyze context
            const context = ContextAnalyzer.detectContext(text);
            const model = ContextAnalyzer.getModelForContext(context);
            
            // Enhance message if requested
            let processedText = text;
            if (settings.enhanceMessage) {
                processedText = MessageEnhancer.enhanceMessage(text, context);
            }
            
            // Calculate available space for content
            const headerSpace = settings.includeHeaders ? CONFIG.HEADER_SIZE : 0;
            const availableSpace = Math.max(
                settings.maxLength - headerSpace,
                CONFIG.MIN_CHUNK_SIZE
            );
            
            // Split message into chunks
            const chunks = MessageSplitter.splitIntoChunks(
                processedText, 
                availableSpace, 
                settings.preserveFormatting
            );
            
            Logger.success('Message split into chunks', { 
                chunkCount: chunks.length,
                context,
                model 
            });
            
            // Add headers if requested
            if (settings.includeHeaders) {
                return chunks.map((chunk, index) => {
                    const header = HeaderGenerator.createHeader(
                        context,
                        model,
                        index + 1,
                        chunks.length,
                        chunk.length
                    );
                    return header + chunk;
                });
            }
            
            return chunks;
            
        } catch (error) {
            Logger.error('Formatting failed, using fallback', error);
            
            // Fallback: Simple splitting without formatting
            const fallbackChunks = MessageSplitter.splitIntoChunks(
                text, 
                CONFIG.DEFAULT_CHUNK_SIZE, 
                false
            );
            
            return fallbackChunks.map((chunk, index) => {
                return `🤖 GPT-5 (${index + 1}/${fallbackChunks.length})\n\n${chunk}`;
            });
        }
    }
    
    static quickFormat(text) {
        return this.formatMessage(text, {
            includeHeaders: false,
            enhanceMessage: false
        });
    }
    
    static businessFormat(text) {
        return this.formatMessage(text, {
            enhanceMessage: true,
            context: 'business'
        });
    }
    
    static technicalFormat(text) {
        return this.formatMessage(text, {
            enhanceMessage: true,
            context: 'technical'
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TELEGRAM BOT INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

class TelegramBotHelper {
    static async sendFormattedMessage(bot, chatId, text, options = {}) {
        const settings = {
            delay: CONFIG.DELAY_BETWEEN_MESSAGES,
            parseMode: 'HTML',
            ...options
        };
        
        try {
            const formattedParts = TelegramFormatter.formatMessage(text, settings);
            
            Logger.info(`Sending ${formattedParts.length} message parts to chat ${chatId}`);
            
            const results = [];
            
            for (let i = 0; i < formattedParts.length; i++) {
                try {
                    const result = await bot.sendMessage(chatId, formattedParts[i], {
                        parse_mode: settings.parseMode
                    });
                    
                    results.push(result);
                    
                    // Add delay between messages if multiple parts
                    if (i < formattedParts.length - 1 && settings.delay > 0) {
                        await new Promise(resolve => setTimeout(resolve, settings.delay));
                    }
                    
                } catch (sendError) {
                    Logger.error(`Failed to send message part ${i + 1}`, sendError);
                    
                    // Retry without formatting as fallback
                    try {
                        const result = await bot.sendMessage(chatId, formattedParts[i]);
                        results.push(result);
                    } catch (retryError) {
                        Logger.error(`Failed to send message part ${i + 1} even without formatting`, retryError);
                    }
                }
            }
            
            Logger.success(`Successfully sent ${results.length}/${formattedParts.length} message parts`);
            return results;
            
        } catch (error) {
            Logger.error('Failed to send formatted message', error);
            
            // Ultimate fallback
            try {
                const result = await bot.sendMessage(chatId, text || '❌ Error processing response');
                return [result];
            } catch (fallbackError) {
                Logger.error('Even fallback message failed', fallbackError);
                throw fallbackError;
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

class SystemUtils {
    static getSystemStats() {
        return {
            version: '2.0.0',
            release: 'GPT-5 Official (Aug 7, 2025)',
            availableModels: Object.keys(GPT5_MODELS),
            supportedContexts: Object.keys(EMOJI_SETS),
            config: CONFIG,
            performance: {
                'SWE-bench Verified': '74.9%',
                'AIME 2025': '94.6%',
                'Hallucination Reduction': '45% vs GPT-4o'
            }
        };
    }
    
    static reset() {
        MessageEnhancer.emojiIndex = 0;
        Logger.info('System reset complete');
    }
    
    static test() {
        const testText = `GPT-5 Test Response

Business Strategy:
• Revenue optimization 
• Market expansion
• Client acquisition

Technical Implementation:
1. Database optimization
2. API development  
3. System integration

This demonstrates GPT-5's advanced reasoning capabilities with 94.6% AIME performance.`;

        Logger.info('Running system test...');
        const result = TelegramFormatter.formatMessage(testText);
        
        console.log('\n=== TEST RESULTS ===');
        result.forEach((part, index) => {
            console.log(`\n--- Part ${index + 1} ---`);
            console.log(part);
        });
        console.log('\n=== END TEST ===\n');
        
        return result;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
    // Main API
    formatMessage: TelegramFormatter.formatMessage.bind(TelegramFormatter),
    sendFormattedMessage: TelegramBotHelper.sendFormattedMessage.bind(TelegramBotHelper),
    
    // Convenience methods
    quickFormat: TelegramFormatter.quickFormat.bind(TelegramFormatter),
    businessFormat: TelegramFormatter.businessFormat.bind(TelegramFormatter),
    technicalFormat: TelegramFormatter.technicalFormat.bind(TelegramFormatter),
    
    // Legacy compatibility
    splitTelegramMessage: TelegramFormatter.formatMessage.bind(TelegramFormatter),
    
    // System utilities
    getSystemStats: SystemUtils.getSystemStats.bind(SystemUtils),
    reset: SystemUtils.reset.bind(SystemUtils),
    test: SystemUtils.test.bind(SystemUtils),
    
    // Advanced access
    TelegramFormatter,
    TelegramBotHelper,
    ContextAnalyzer,
    MessageEnhancer,
    CONFIG,
    GPT5_MODELS
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

Logger.success('GPT-5 Telegram Formatter v2.0 Loaded');
Logger.info('Ready for production with fail-safe mechanisms');

// Auto-test in development mode
if (CONFIG.DEBUG_MODE) {
    setTimeout(() => {
        Logger.info('Running auto-test in debug mode...');
        SystemUtils.test();
    }, 1000);
}
