// utils/telegramSplitter.js - Professional GPT-5 Message Formatter
// ═══════════════════════════════════════════════════════════════════════════
// Clean, professional formatting inspired by Claude's communication style
// Minimal emoji usage, excellent readability, smart content enhancement
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    TELEGRAM_MAX_LENGTH: 4096,
    DEFAULT_CHUNK_SIZE: 3600, // Conservative limit for safety
    HEADER_SIZE: 200,
    MIN_CHUNK_SIZE: 100,
    DELAY_BETWEEN_MESSAGES: 1200,
    DEBUG_MODE: process.env.NODE_ENV === 'development'
};

// GPT-5 Model Configuration
const GPT5_MODELS = {
    'gpt-5': {
        name: 'GPT-5',
        icon: '🧠',
        description: 'Advanced reasoning',
        color: '#10B981'
    },
    'gpt-5-mini': {
        name: 'GPT-5 Mini',
        icon: '⚡',
        description: 'Fast & efficient',
        color: '#3B82F6'
    },
    'gpt-5-nano': {
        name: 'GPT-5 Nano',
        icon: '💫',
        description: 'Ultra-lightweight',
        color: '#8B5CF6'
    }
};

// Minimal, professional emoji sets
const PROFESSIONAL_ELEMENTS = {
    bullets: ['•', '▪', '▫', '◦'],
    numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
    sections: ['📋', '📊', '⚡', '🎯'],
    status: ['✅', '❌', '⚠️', 'ℹ️']
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
    
    static error = (message, error = null) => this.log('error', message, error);
    static warn = (message, data = null) => this.log('warn', message, data);
    static info = (message, data = null) => this.log('info', message, data);
    static debug = (message, data = null) => this.log('debug', message, data);
    static success = (message, data = null) => this.log('success', message, data);
}

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT CONTENT ANALYZER
// ═══════════════════════════════════════════════════════════════════════════

class ContentAnalyzer {
    static patterns = {
        business: /\b(business|strategy|financial|lending|investment|revenue|profit|market|analysis)\b/i,
        technical: /\b(code|programming|software|database|api|system|technical|development)\b/i,
        academic: /\b(research|study|analysis|academic|theory|methodology|conclusion)\b/i,
        conversational: /\b(hello|hi|thanks|please|help|question|wondering)\b/i
    };
    
    static analyzeContent(text) {
        if (!text || typeof text !== 'string') {
            return { type: 'general', confidence: 0 };
        }
        
        const textLower = text.toLowerCase();
        const length = text.length;
        
        // Analyze content patterns
        let bestMatch = { type: 'general', confidence: 0 };
        
        for (const [type, pattern] of Object.entries(this.patterns)) {
            const matches = (textLower.match(pattern) || []).length;
            const confidence = Math.min(matches * 0.3, 1.0);
            
            if (confidence > bestMatch.confidence) {
                bestMatch = { type, confidence };
            }
        }
        
        // Adjust for content length and structure
        const hasStructure = /\n\n/.test(text) || /^\d+\./.test(text) || /^[-•]/.test(text);
        const isComplex = length > 500 || hasStructure;
        
        return {
            type: bestMatch.type,
            confidence: bestMatch.confidence,
            isComplex,
            length,
            hasStructure
        };
    }
    
    static selectModel(analysis) {
        if (analysis.length < 100 && analysis.type === 'conversational') {
            return 'gpt-5-nano';
        }
        
        if (analysis.isComplex || analysis.confidence > 0.7) {
            return 'gpt-5';
        }
        
        return 'gpt-5-mini';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSIONAL MESSAGE ENHANCER
// ═══════════════════════════════════════════════════════════════════════════

class MessageEnhancer {
    static enhanceMessage(text, options = {}) {
        if (!text || typeof text !== 'string') {
            return text;
        }
        
        try {
            let enhanced = text;
            
            // Only enhance if explicitly requested
            if (options.enhanceFormatting !== false) {
                enhanced = this.enhanceStructure(enhanced);
                enhanced = this.enhanceListItems(enhanced);
                enhanced = this.cleanupSpacing(enhanced);
            }
            
            Logger.debug('Message enhanced', { 
                originalLength: text.length, 
                enhancedLength: enhanced.length 
            });
            
            return enhanced;
            
        } catch (error) {
            Logger.error('Enhancement failed, using original', error);
            return text;
        }
    }
    
    static enhanceStructure(text) {
        // Clean up excessive spacing
        text = text.replace(/\n{3,}/g, '\n\n');
        
        // Enhance section headers (only obvious ones)
        text = text.replace(/^([A-Z][A-Za-z\s]{5,30}):$/gm, '**$1**');
        
        return text;
    }
    
    static enhanceListItems(text) {
        // Convert numbered lists to emoji numbers (1-10 only)
        text = text.replace(/^(\s*)(\d+)[\.\)]\s+/gm, (match, indent, number) => {
            const num = parseInt(number);
            if (num >= 1 && num <= 10) {
                return `${indent}${PROFESSIONAL_ELEMENTS.numbers[num - 1]} `;
            }
            return match;
        });
        
        // Standardize bullet points (only obvious ones)
        text = text.replace(/^(\s*)[-•▪▫◦*]\s+/gm, '$1• ');
        
        return text;
    }
    
    static cleanupSpacing(text) {
        // Remove excessive whitespace
        text = text.replace(/[ \t]+/g, ' ');
        
        // Standardize line endings
        text = text.replace(/\r\n/g, '\n');
        
        // Clean up around enhanced elements
        text = text.replace(/\n\s*\n\s*•/g, '\n\n•');
        text = text.replace(/\n\s*\n\s*\d+️⃣/g, '\n\n1️⃣');
        
        return text.trim();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLEAN HEADER GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

class HeaderGenerator {
    static createHeader(options = {}) {
        try {
            const {
                model = 'gpt-5-mini',
                partNumber = 1,
                totalParts = 1,
                contentType = 'general',
                messageLength = 0
            } = options;
            
            const timestamp = new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const modelInfo = GPT5_MODELS[model] || GPT5_MODELS['gpt-5-mini'];
            const partInfo = totalParts > 1 ? ` (${partNumber}/${totalParts})` : '';
            
            // Simple, clean header
            const header = `${modelInfo.icon} ${modelInfo.name}${partInfo}
📅 ${timestamp} • ${this.getContentIcon(contentType)} ${contentType}

`;
            
            Logger.debug('Header created', { model, partNumber, totalParts });
            return header;
            
        } catch (error) {
            Logger.error('Header creation failed', error);
            return `🤖 GPT-5 Response\n\n`;
        }
    }
    
    static getContentIcon(contentType) {
        const icons = {
            business: '💼',
            technical: '⚙️',
            academic: '📚',
            conversational: '💬',
            general: '📋'
        };
        return icons[contentType] || '📋';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT MESSAGE SPLITTER
// ═══════════════════════════════════════════════════════════════════════════

class MessageSplitter {
    static splitIntelligently(text, maxSize, options = {}) {
        if (!text || text.length <= maxSize) {
            return [text || ''];
        }
        
        Logger.debug('Starting intelligent split', { 
            textLength: text.length, 
            maxSize, 
            options 
        });
        
        // Try different splitting strategies
        const strategies = [
            () => this.splitByParagraphs(text, maxSize),
            () => this.splitByStructure(text, maxSize),
            () => this.splitBySentences(text, maxSize),
            () => this.splitByLines(text, maxSize),
            () => this.splitByCharacters(text, maxSize)
        ];
        
        for (const strategy of strategies) {
            try {
                const result = strategy();
                if (result && Array.isArray(result) && result.length > 0) {
                    Logger.debug('Split successful', { 
                        strategy: strategy.name, 
                        parts: result.length 
                    });
                    return result;
                }
            } catch (error) {
                Logger.warn(`Split strategy failed: ${strategy.name}`, error);
                continue;
            }
        }
        
        // Emergency fallback
        return this.splitByCharacters(text, maxSize);
    }
    
    static splitByParagraphs(text, maxSize) {
        const paragraphs = text.split('\n\n');
        const chunks = [];
        let currentChunk = '';
        
        for (const paragraph of paragraphs) {
            const potentialLength = currentChunk.length + (currentChunk ? 2 : 0) + paragraph.length;
            
            if (potentialLength <= maxSize) {
                currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
            } else {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                
                if (paragraph.length > maxSize) {
                    const subChunks = this.splitByStructure(paragraph, maxSize);
                    chunks.push(...subChunks.slice(0, -1));
                    currentChunk = subChunks[subChunks.length - 1] || '';
                } else {
                    currentChunk = paragraph;
                }
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks.length > 0 ? chunks : [text];
    }
    
    static splitByStructure(text, maxSize) {
        // Look for natural break points: headers, lists, etc.
        const structureBreaks = text.split(/(?=\n(?:\d+\.|•|-|\*)\s)/);
        return this.combineToSize(structureBreaks, maxSize);
    }
    
    static splitBySentences(text, maxSize) {
        const sentences = text.split(/(?<=[.!?])\s+/);
        return this.combineToSize(sentences, maxSize);
    }
    
    static splitByLines(text, maxSize) {
        const lines = text.split('\n');
        return this.combineToSize(lines, maxSize, '\n');
    }
    
    static splitByCharacters(text, maxSize) {
        const chunks = [];
        for (let i = 0; i < text.length; i += maxSize) {
            chunks.push(text.slice(i, i + maxSize));
        }
        return chunks;
    }
    
    static combineToSize(items, maxSize, separator = '\n\n') {
        const chunks = [];
        let currentChunk = '';
        
        for (const item of items) {
            const potentialLength = currentChunk.length + 
                (currentChunk ? separator.length : 0) + item.length;
            
            if (potentialLength <= maxSize) {
                currentChunk = currentChunk ? 
                    `${currentChunk}${separator}${item}` : item;
            } else {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                
                if (item.length > maxSize) {
                    chunks.push(...this.splitByCharacters(item, maxSize));
                    currentChunk = '';
                } else {
                    currentChunk = item;
                }
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks.length > 0 ? chunks : items;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TELEGRAM FORMATTER CLASS
// ═══════════════════════════════════════════════════════════════════════════

class TelegramFormatter {
    static formatMessage(text, options = {}) {
        const settings = {
            maxLength: CONFIG.DEFAULT_CHUNK_SIZE,
            includeHeaders: true,
            enhanceFormatting: true,
            ...options
        };
        
        Logger.info('Formatting message', { 
            textLength: text?.length || 0,
            settings 
        });
        
        try {
            // Input validation
            if (!text || typeof text !== 'string') {
                Logger.warn('Invalid input provided');
                return ['⚠️ No response content available'];
            }
            
            if (text.trim().length === 0) {
                Logger.warn('Empty text provided');
                return ['📭 Empty response received'];
            }
            
            // Analyze content
            const analysis = ContentAnalyzer.analyzeContent(text);
            const selectedModel = ContentAnalyzer.selectModel(analysis);
            
            Logger.debug('Content analysis complete', { analysis, selectedModel });
            
            // Enhance message
            const enhanced = MessageEnhancer.enhanceMessage(text, settings);
            
            // Calculate available space
            const headerSpace = settings.includeHeaders ? CONFIG.HEADER_SIZE : 0;
            const availableSpace = Math.max(
                settings.maxLength - headerSpace,
                CONFIG.MIN_CHUNK_SIZE
            );
            
            // Split message intelligently
            const chunks = MessageSplitter.splitIntelligently(enhanced, availableSpace, settings);
            
            Logger.success('Message formatted successfully', { 
                chunks: chunks.length,
                model: selectedModel,
                contentType: analysis.type
            });
            
            // Add headers if requested
            if (settings.includeHeaders) {
                return chunks.map((chunk, index) => {
                    const header = HeaderGenerator.createHeader({
                        model: selectedModel,
                        partNumber: index + 1,
                        totalParts: chunks.length,
                        contentType: analysis.type,
                        messageLength: chunk.length
                    });
                    return header + chunk;
                });
            }
            
            return chunks;
            
        } catch (error) {
            Logger.error('Formatting failed completely', error);
            
            // Emergency fallback
            const fallbackChunks = MessageSplitter.splitByCharacters(
                text, 
                CONFIG.DEFAULT_CHUNK_SIZE
            );
            
            return fallbackChunks.map((chunk, index) => {
                const partInfo = fallbackChunks.length > 1 ? 
                    ` (${index + 1}/${fallbackChunks.length})` : '';
                return `🤖 GPT-5${partInfo}\n\n${chunk}`;
            });
        }
    }
    
    static quickFormat(text) {
        return this.formatMessage(text, {
            includeHeaders: false,
            enhanceFormatting: false
        });
    }
    
    static professionalFormat(text) {
        return this.formatMessage(text, {
            includeHeaders: true,
            enhanceFormatting: true,
            maxLength: 3800
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
            parseMode: null, // Let Telegram handle formatting naturally
            ...options
        };
        
        try {
            const formattedParts = TelegramFormatter.formatMessage(text, settings);
            
            Logger.info(`Sending ${formattedParts.length} message parts`, { chatId });
            
            const results = [];
            
            for (let i = 0; i < formattedParts.length; i++) {
                try {
                    const sendOptions = {};
                    if (settings.parseMode) {
                        sendOptions.parse_mode = settings.parseMode;
                    }
                    
                    const result = await bot.sendMessage(chatId, formattedParts[i], sendOptions);
                    results.push(result);
                    
                    // Delay between parts
                    if (i < formattedParts.length - 1 && settings.delay > 0) {
                        await new Promise(resolve => setTimeout(resolve, settings.delay));
                    }
                    
                } catch (sendError) {
                    Logger.error(`Failed to send part ${i + 1}`, sendError);
                    
                    // Retry without formatting
                    try {
                        const result = await bot.sendMessage(chatId, formattedParts[i]);
                        results.push(result);
                    } catch (retryError) {
                        Logger.error(`Retry also failed for part ${i + 1}`, retryError);
                        // Continue with remaining parts
                    }
                }
            }
            
            Logger.success(`Successfully sent ${results.length}/${formattedParts.length} parts`);
            return results;
            
        } catch (error) {
            Logger.error('Complete send failure', error);
            
            // Ultimate fallback
            try {
                const result = await bot.sendMessage(chatId, text || '❌ Message processing error');
                return [result];
            } catch (fallbackError) {
                Logger.error('Even fallback failed', fallbackError);
                throw fallbackError;
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

class SystemUtils {
    static getSystemInfo() {
        return {
            version: '3.0.0-professional',
            release: 'Clean Professional Format',
            style: 'Claude-inspired communication',
            features: [
                'Intelligent content analysis',
                'Context-aware model selection',
                'Professional message enhancement',
                'Smart structure preservation',
                'Minimal emoji usage',
                'Clean header generation',
                'Robust error handling'
            ],
            models: Object.keys(GPT5_MODELS),
            config: CONFIG
        };
    }
    
    static test() {
        const testText = `GPT-5 Professional Test Response

Key Features:
1. Intelligent content analysis
2. Clean message formatting
3. Professional presentation
4. Smart structure preservation

This demonstrates the new clean, professional formatting style inspired by Claude's communication approach.

Business Analysis:
• Clear, readable structure
• Minimal but effective emoji usage
• Professional headers
• Excellent readability

The system now provides clean, professional output that's easy to read and understand.`;

        Logger.info('Running system test...');
        const result = TelegramFormatter.formatMessage(testText);
        
        console.log('\n=== PROFESSIONAL FORMAT TEST ===');
        result.forEach((part, index) => {
            console.log(`\n--- Part ${index + 1} ---`);
            console.log(part);
        });
        console.log('\n=== END TEST ===\n');
        
        return result;
    }
    
    static reset() {
        Logger.info('System reset complete');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
    // Main API (matches your existing integration)
    formatMessage: TelegramFormatter.formatMessage.bind(TelegramFormatter),
    sendFormattedMessage: TelegramBotHelper.sendFormattedMessage.bind(TelegramBotHelper),
    
    // Convenience methods
    quickFormat: TelegramFormatter.quickFormat.bind(TelegramFormatter),
    professionalFormat: TelegramFormatter.professionalFormat.bind(TelegramFormatter),
    
    // Legacy compatibility (for existing code)
    splitTelegramMessage: TelegramFormatter.formatMessage.bind(TelegramFormatter),
    sendTelegramMessage: TelegramBotHelper.sendFormattedMessage.bind(TelegramBotHelper),
    
    // System utilities
    getSystemInfo: SystemUtils.getSystemInfo.bind(SystemUtils),
    test: SystemUtils.test.bind(SystemUtils),
    reset: SystemUtils.reset.bind(SystemUtils),
    
    // Advanced access
    TelegramFormatter,
    TelegramBotHelper,
    ContentAnalyzer,
    MessageEnhancer,
    HeaderGenerator,
    MessageSplitter,
    
    // Configuration
    CONFIG,
    GPT5_MODELS,
    PROFESSIONAL_ELEMENTS
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

Logger.success('Professional GPT-5 Telegram Formatter v3.0 Loaded');
Logger.info('Style: Clean, professional, Claude-inspired formatting');
Logger.info('Features: Smart analysis, minimal emojis, excellent readability');

// Auto-test in development
if (CONFIG.DEBUG_MODE) {
    setTimeout(() => {
        Logger.info('Running development auto-test...');
        SystemUtils.test();
    }, 1000);
}
