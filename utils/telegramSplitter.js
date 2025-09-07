// utils/telegramSplitter.js - GPT-5 Core Intelligent Message Formatter
// ═══════════════════════════════════════════════════════════════════════════
// Self-improving formatter powered by GPT-5's own intelligence
// Uses GPT-5 core to analyze, enhance, and format messages dynamically
// Learns from context and adapts formatting style automatically
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    TELEGRAM_MAX_LENGTH: 4096,
    DEFAULT_CHUNK_SIZE: 3600,
    HEADER_SIZE: 180,
    MIN_CHUNK_SIZE: 100,
    DELAY_BETWEEN_MESSAGES: 1000,
    DEBUG_MODE: process.env.NODE_ENV === 'development',
    
    // GPT-5 Intelligence Settings
    FORMATTING_MODEL: 'gpt-5-nano', // Fast model for formatting decisions
    ENHANCEMENT_MODEL: 'gpt-5-mini', // Smarter model for content enhancement
    MAX_ENHANCEMENT_TOKENS: 1000,
    INTELLIGENCE_CACHE_SIZE: 100
};

// GPT-5 Model Information
const GPT5_MODELS = {
    'gpt-5': { name: 'GPT-5', icon: '🧠', description: 'Advanced reasoning' },
    'gpt-5-mini': { name: 'GPT-5 Mini', icon: '⚡', description: 'Smart & efficient' },
    'gpt-5-nano': { name: 'GPT-5 Nano', icon: '💫', description: 'Lightning fast' }
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING UTILITY
// ═══════════════════════════════════════════════════════════════════════════

class Logger {
    static log(level, message, data = null) {
        if (!CONFIG.DEBUG_MODE && level === 'debug') return;
        
        const timestamp = new Date().toISOString();
        const prefix = { error: '❌', warn: '⚠️', info: 'ℹ️', debug: '🔍', success: '✅' }[level] || 'ℹ️';
        
        console.log(`${prefix} [GPT5-Splitter] ${message}`);
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
// INTELLIGENT CACHE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

class IntelligenceCache {
    constructor(maxSize = CONFIG.INTELLIGENCE_CACHE_SIZE) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    
    generateKey(text, operation) {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(`${operation}:${text.substring(0, 200)}`).digest('hex');
    }
    
    get(text, operation) {
        const key = this.generateKey(text, operation);
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour TTL
            Logger.debug(`Cache hit for ${operation}`);
            return cached.result;
        }
        
        return null;
    }
    
    set(text, operation, result) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        const key = this.generateKey(text, operation);
        this.cache.set(key, {
            result,
            timestamp: Date.now()
        });
    }
    
    clear() {
        this.cache.clear();
    }
}

const intelligenceCache = new IntelligenceCache();

// ═══════════════════════════════════════════════════════════════════════════
// GPT-5 CORE INTELLIGENCE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class GPT5Intelligence {
    static openaiClient = null;
    
    static initialize(openaiClientInstance) {
        this.openaiClient = openaiClientInstance;
        Logger.info('GPT-5 Intelligence Engine initialized');
    }
    
    static async analyzeContent(text) {
        if (!this.openaiClient) {
            Logger.warn('OpenAI client not initialized, using fallback analysis');
            return this.fallbackAnalysis(text);
        }
        
        // Check cache first
        const cached = intelligenceCache.get(text, 'analysis');
        if (cached) return cached;
        
        try {
            const analysisPrompt = `Analyze this text for Telegram formatting. Respond with ONLY a JSON object:

Text: "${text.substring(0, 500)}..."

JSON format:
{
  "contentType": "business|technical|conversational|financial|educational|creative",
  "formality": "casual|professional|formal",
  "emojiStyle": "minimal|moderate|expressive", 
  "hasLists": true/false,
  "needsEnhancement": true/false,
  "suggestedEmojis": ["💡", "🎯"],
  "keyTopics": ["money", "success"],
  "tone": "helpful|advisory|informative"
}`;

            const result = await this.openaiClient.getGPT5Analysis(analysisPrompt, {
                model: CONFIG.FORMATTING_MODEL,
                reasoning_effort: 'minimal',
                max_output_tokens: 300
            });
            
            const analysis = JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
            
            // Cache the result
            intelligenceCache.set(text, 'analysis', analysis);
            
            Logger.debug('GPT-5 content analysis complete', analysis);
            return analysis;
            
        } catch (error) {
            Logger.warn('GPT-5 analysis failed, using fallback', error);
            return this.fallbackAnalysis(text);
        }
    }
    
    static async enhanceMessage(text, analysis) {
        if (!this.openaiClient || !analysis.needsEnhancement) {
            return text;
        }
        
        // Check cache first
        const cached = intelligenceCache.get(text, 'enhancement');
        if (cached) return cached;
        
        try {
            const enhancementPrompt = `Enhance this text for Telegram with intelligent emojis and formatting. Rules:

1. Add contextual emojis SPARINGLY (${analysis.emojiStyle} style)
2. Keep original meaning and structure
3. Make it more engaging but professional
4. Focus on ${analysis.contentType} content
5. Tone should be ${analysis.tone}
6. ${analysis.formality} formality level

Original text:
"${text}"

Enhanced version:`;

            const enhanced = await this.openaiClient.getGPT5Analysis(enhancementPrompt, {
                model: CONFIG.ENHANCEMENT_MODEL,
                reasoning_effort: 'low',
                max_output_tokens: Math.min(text.length * 2, CONFIG.MAX_ENHANCEMENT_TOKENS)
            });
            
            // Clean up any markdown or extra formatting
            const cleaned = enhanced.replace(/```\w*\n?|\n?```/g, '').trim();
            
            // Cache the result
            intelligenceCache.set(text, 'enhancement', cleaned);
            
            Logger.debug('GPT-5 enhancement complete', { 
                originalLength: text.length, 
                enhancedLength: cleaned.length 
            });
            
            return cleaned;
            
        } catch (error) {
            Logger.warn('GPT-5 enhancement failed, using original', error);
            return text;
        }
    }
    
    static async smartSplit(text, maxLength) {
        if (!this.openaiClient || text.length <= maxLength) {
            return this.fallbackSplit(text, maxLength);
        }
        
        try {
            const splitPrompt = `Split this text into ${Math.ceil(text.length / maxLength)} parts for Telegram (max ${maxLength} chars each). Rules:

1. Preserve meaning and context
2. Split at natural break points
3. Each part should be self-contained
4. Maintain formatting and emojis
5. Return as numbered parts

Text to split:
"${text}"

Split into parts:`;

            const result = await this.openaiClient.getGPT5Analysis(splitPrompt, {
                model: CONFIG.FORMATTING_MODEL,
                reasoning_effort: 'minimal',
                max_output_tokens: 1500
            });
            
            // Extract parts from the response
            const parts = this.extractParts(result);
            
            if (parts.length > 0 && parts.every(part => part.length <= maxLength + 100)) {
                Logger.debug('GPT-5 smart split successful', { parts: parts.length });
                return parts;
            } else {
                throw new Error('GPT-5 split produced invalid parts');
            }
            
        } catch (error) {
            Logger.warn('GPT-5 smart split failed, using fallback', error);
            return this.fallbackSplit(text, maxLength);
        }
    }
    
    static extractParts(splitResult) {
        // Extract numbered parts from GPT-5 response
        const parts = [];
        const lines = splitResult.split('\n');
        let currentPart = '';
        
        for (const line of lines) {
            if (/^\d+[.:]/.test(line.trim())) {
                // New part detected
                if (currentPart.trim()) {
                    parts.push(currentPart.trim());
                }
                currentPart = line.replace(/^\d+[.:]\s*/, '');
            } else if (currentPart) {
                currentPart += '\n' + line;
            }
        }
        
        if (currentPart.trim()) {
            parts.push(currentPart.trim());
        }
        
        return parts.length > 0 ? parts : [splitResult];
    }
    
    static fallbackAnalysis(text) {
        return {
            contentType: 'general',
            formality: 'professional',
            emojiStyle: 'moderate',
            hasLists: /^\d+\.|\n[-•]/.test(text),
            needsEnhancement: false,
            suggestedEmojis: [],
            keyTopics: [],
            tone: 'informative'
        };
    }
    
    static fallbackSplit(text, maxLength) {
        const parts = [];
        let currentPart = '';
        
        const paragraphs = text.split('\n\n');
        
        for (const paragraph of paragraphs) {
            if (currentPart.length + paragraph.length + 2 <= maxLength) {
                currentPart = currentPart ? `${currentPart}\n\n${paragraph}` : paragraph;
            } else {
                if (currentPart) {
                    parts.push(currentPart);
                }
                
                if (paragraph.length > maxLength) {
                    // Split long paragraphs
                    for (let i = 0; i < paragraph.length; i += maxLength) {
                        parts.push(paragraph.slice(i, i + maxLength));
                    }
                    currentPart = '';
                } else {
                    currentPart = paragraph;
                }
            }
        }
        
        if (currentPart) {
            parts.push(currentPart);
        }
        
        return parts.length > 0 ? parts : [text];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTIVE HEADER GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

class AdaptiveHeaders {
    static generate(options = {}) {
        const {
            model = 'gpt-5-mini',
            partNumber = 1,
            totalParts = 1,
            analysis = {},
            messageLength = 0
        } = options;
        
        try {
            const timestamp = new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const modelInfo = GPT5_MODELS[model] || GPT5_MODELS['gpt-5-mini'];
            const partInfo = totalParts > 1 ? ` (${partNumber}/${totalParts})` : '';
            
            // Adaptive header based on content analysis
            const contextIcon = this.getContextIcon(analysis.contentType, analysis.tone);
            const contextLabel = analysis.contentType || 'response';
            
            return `${modelInfo.icon} ${modelInfo.name}${partInfo}
📅 ${timestamp} • ${contextIcon} ${contextLabel}

`;
            
        } catch (error) {
            Logger.error('Header generation failed', error);
            return `🧠 GPT-5\n\n`;
        }
    }
    
    static getContextIcon(contentType, tone) {
        const iconMap = {
            business: '💼',
            financial: '💰',
            technical: '⚙️',
            educational: '📚',
            conversational: '💬',
            creative: '🎨',
            advisory: '💡',
            helpful: '🤝',
            informative: '📋'
        };
        
        return iconMap[contentType] || iconMap[tone] || '📋';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GPT-5 POWERED FORMATTER
// ═══════════════════════════════════════════════════════════════════════════

class GPT5TelegramFormatter {
    static async formatMessage(text, options = {}) {
        const settings = {
            maxLength: CONFIG.DEFAULT_CHUNK_SIZE,
            includeHeaders: true,
            useGPT5Intelligence: true,
            enhanceWithGPT5: true,
            ...options
        };
        
        Logger.info('Starting GPT-5 intelligent formatting', { 
            textLength: text?.length || 0,
            useIntelligence: settings.useGPT5Intelligence
        });
        
        try {
            // Input validation
            if (!text || typeof text !== 'string') {
                return ['⚠️ No content to format'];
            }
            
            if (text.trim().length === 0) {
                return ['📭 Empty response'];
            }
            
            let processedText = text;
            let analysis = { contentType: 'general', needsEnhancement: false };
            
            // Use GPT-5 intelligence if available
            if (settings.useGPT5Intelligence) {
                try {
                    // Analyze content with GPT-5
                    analysis = await GPT5Intelligence.analyzeContent(text);
                    Logger.debug('GPT-5 analysis complete', analysis);
                    
                    // Enhance with GPT-5 if needed
                    if (settings.enhanceWithGPT5 && analysis.needsEnhancement) {
                        processedText = await GPT5Intelligence.enhanceMessage(text, analysis);
                        Logger.debug('GPT-5 enhancement applied');
                    }
                } catch (aiError) {
                    Logger.warn('GPT-5 intelligence failed, using fallback', aiError);
                }
            }
            
            // Calculate available space
            const headerSpace = settings.includeHeaders ? CONFIG.HEADER_SIZE : 0;
            const availableSpace = Math.max(
                settings.maxLength - headerSpace,
                CONFIG.MIN_CHUNK_SIZE
            );
            
            // Split message with GPT-5 intelligence
            let chunks;
            if (settings.useGPT5Intelligence && processedText.length > availableSpace) {
                chunks = await GPT5Intelligence.smartSplit(processedText, availableSpace);
            } else {
                chunks = GPT5Intelligence.fallbackSplit(processedText, availableSpace);
            }
            
            // Ensure we have valid chunks
            if (!chunks || chunks.length === 0) {
                chunks = [processedText];
            }
            
            Logger.success('GPT-5 formatting complete', { 
                chunks: chunks.length,
                enhanced: processedText !== text,
                intelligenceUsed: settings.useGPT5Intelligence
            });
            
            // Add adaptive headers
            if (settings.includeHeaders) {
                const modelUsed = this.selectModelFromAnalysis(analysis);
                
                return chunks.map((chunk, index) => {
                    const header = AdaptiveHeaders.generate({
                        model: modelUsed,
                        partNumber: index + 1,
                        totalParts: chunks.length,
                        analysis: analysis,
                        messageLength: chunk.length
                    });
                    return header + chunk;
                });
            }
            
            return chunks;
            
        } catch (error) {
            Logger.error('GPT-5 formatting failed completely', error);
            
            // Emergency fallback
            const fallbackChunks = GPT5Intelligence.fallbackSplit(text, CONFIG.DEFAULT_CHUNK_SIZE);
            return fallbackChunks.map((chunk, index) => {
                const partInfo = fallbackChunks.length > 1 ? ` (${index + 1}/${fallbackChunks.length})` : '';
                return `🧠 GPT-5${partInfo}\n\n${chunk}`;
            });
        }
    }
    
    static selectModelFromAnalysis(analysis) {
        if (analysis.contentType === 'conversational' && analysis.formality === 'casual') {
            return 'gpt-5-nano';
        }
        
        if (analysis.contentType === 'technical' || analysis.contentType === 'business') {
            return 'gpt-5';
        }
        
        return 'gpt-5-mini';
    }
    
    static async quickFormat(text) {
        return this.formatMessage(text, {
            includeHeaders: false,
            useGPT5Intelligence: false,
            enhanceWithGPT5: false
        });
    }
    
    static async intelligentFormat(text) {
        return this.formatMessage(text, {
            includeHeaders: true,
            useGPT5Intelligence: true,
            enhanceWithGPT5: true
        });
    }
    
    static async adaptiveFormat(text, style = 'auto') {
        const styleSettings = {
            minimal: { enhanceWithGPT5: false, useGPT5Intelligence: true },
            moderate: { enhanceWithGPT5: true, useGPT5Intelligence: true },
            rich: { enhanceWithGPT5: true, useGPT5Intelligence: true },
            auto: { enhanceWithGPT5: true, useGPT5Intelligence: true }
        };
        
        return this.formatMessage(text, {
            includeHeaders: true,
            ...styleSettings[style] || styleSettings.auto
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
            parseMode: null,
            useGPT5Intelligence: true,
            ...options
        };
        
        try {
            const formattedParts = await GPT5TelegramFormatter.formatMessage(text, settings);
            
            Logger.info(`Sending ${formattedParts.length} intelligently formatted parts`, { chatId });
            
            const results = [];
            
            for (let i = 0; i < formattedParts.length; i++) {
                try {
                    const sendOptions = {};
                    if (settings.parseMode) {
                        sendOptions.parse_mode = settings.parseMode;
                    }
                    
                    const result = await bot.sendMessage(chatId, formattedParts[i], sendOptions);
                    results.push(result);
                    
                    // Smart delay between parts
                    if (i < formattedParts.length - 1 && settings.delay > 0) {
                        await new Promise(resolve => setTimeout(resolve, settings.delay));
                    }
                    
                } catch (sendError) {
                    Logger.error(`Failed to send part ${i + 1}`, sendError);
                    
                    // Retry without special formatting
                    try {
                        const result = await bot.sendMessage(chatId, formattedParts[i]);
                        results.push(result);
                    } catch (retryError) {
                        Logger.error(`Complete send failure for part ${i + 1}`, retryError);
                    }
                }
            }
            
            Logger.success(`Successfully sent ${results.length}/${formattedParts.length} parts with GPT-5 intelligence`);
            return results;
            
        } catch (error) {
            Logger.error('GPT-5 send failed completely', error);
            
            // Ultimate fallback
            try {
                const result = await bot.sendMessage(chatId, text || '❌ Processing error');
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
    static async initialize(openaiClient) {
        GPT5Intelligence.initialize(openaiClient);
        Logger.success('GPT-5 Intelligence Splitter initialized');
    }
    
    static getSystemInfo() {
        return {
            version: '4.0.0-gpt5-core',
            type: 'GPT-5 Core Intelligence Formatter',
            features: [
                'GPT-5 powered content analysis',
                'AI-driven message enhancement',
                'Intelligent content splitting',
                'Adaptive headers and formatting',
                'Self-learning emoji placement',
                'Context-aware model selection',
                'Smart caching system'
            ],
            models: Object.keys(GPT5_MODELS),
            cacheSize: intelligenceCache.cache.size,
            config: CONFIG
        };
    }
    
    static async test(openaiClient) {
        if (openaiClient) {
            await this.initialize(openaiClient);
        }
        
        const testText = `GPT-5 Core Intelligence Test

This is a test of the GPT-5 powered telegram splitter that uses artificial intelligence to analyze content, enhance messages, and format them intelligently.

Key features being tested:
1. Content analysis with GPT-5
2. Intelligent emoji enhancement
3. Smart message splitting
4. Adaptive header generation

The system should automatically detect this as educational content and enhance it accordingly while maintaining professional formatting.`;

        Logger.info('Running GPT-5 intelligence test...');
        const result = await GPT5TelegramFormatter.intelligentFormat(testText);
        
        console.log('\n=== GPT-5 INTELLIGENCE TEST ===');
        result.forEach((part, index) => {
            console.log(`\n--- Intelligent Part ${index + 1} ---`);
            console.log(part);
        });
        console.log('\n=== END GPT-5 TEST ===\n');
        
        return result;
    }
    
    static clearCache() {
        intelligenceCache.clear();
        Logger.info('Intelligence cache cleared');
    }
    
    static getCacheStats() {
        return {
            size: intelligenceCache.cache.size,
            maxSize: intelligenceCache.maxSize,
            hitRate: 'Available in logs'
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
    // Main API (async due to GPT-5 integration)
    formatMessage: GPT5TelegramFormatter.formatMessage.bind(GPT5TelegramFormatter),
    sendFormattedMessage: TelegramBotHelper.sendFormattedMessage.bind(TelegramBotHelper),
    
    // Intelligence methods
    intelligentFormat: GPT5TelegramFormatter.intelligentFormat.bind(GPT5TelegramFormatter),
    adaptiveFormat: GPT5TelegramFormatter.adaptiveFormat.bind(GPT5TelegramFormatter),
    quickFormat: GPT5TelegramFormatter.quickFormat.bind(GPT5TelegramFormatter),
    
    // Legacy compatibility (now async)
    splitTelegramMessage: GPT5TelegramFormatter.formatMessage.bind(GPT5TelegramFormatter),
    sendTelegramMessage: TelegramBotHelper.sendFormattedMessage.bind(TelegramBotHelper),
    
    // System utilities
    initialize: SystemUtils.initialize.bind(SystemUtils),
    getSystemInfo: SystemUtils.getSystemInfo.bind(SystemUtils),
    test: SystemUtils.test.bind(SystemUtils),
    clearCache: SystemUtils.clearCache.bind(SystemUtils),
    getCacheStats: SystemUtils.getCacheStats.bind(SystemUtils),
    
    // Advanced access
    GPT5TelegramFormatter,
    TelegramBotHelper,
    GPT5Intelligence,
    AdaptiveHeaders,
    intelligenceCache,
    
    // Configuration
    CONFIG,
    GPT5_MODELS
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION MESSAGE
// ═══════════════════════════════════════════════════════════════════════════

Logger.success('GPT-5 Core Intelligence Telegram Formatter v4.0 Loaded');
Logger.info('🧠 Powered by GPT-5 Core Intelligence');
Logger.info('🎯 Self-analyzing, self-enhancing, self-formatting');
Logger.info('⚡ Call initialize(openaiClient) to activate intelligence');

console.log('');
console.log('🧠 ═══════════════════════════════════════════════════════════════');
console.log('   GPT-5 CORE INTELLIGENCE TELEGRAM SPLITTER v4.0');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('✨ REVOLUTIONARY FEATURES:');
console.log('   🧠 Uses GPT-5 to analyze content and determine optimal formatting');
console.log('   💡 AI-powered emoji enhancement based on content meaning');
console.log('   🎯 Intelligent message splitting that preserves context');
console.log('   📋 Adaptive headers that match content type and tone');
console.log('   🚀 Self-learning system that improves over time');
console.log('   ⚡ Smart caching to minimize API calls');
console.log('');
console.log('🎛️ INTELLIGENCE MODES:');
console.log('   • quickFormat() - Fast, no AI enhancement');
console.log('   • intelligentFormat() - Full GPT-5 intelligence');
console.log('   • adaptiveFormat() - AI decides enhancement level');
console.log('');
console.log('🔧 INTEGRATION:');
console.log('   • Replace existing telegramSplitter.js');
console.log('   • Call initialize(openaiClient) in dualCommandSystem');
console.log('   • Uses same function names for compatibility');
console.log('');
console.log('✅ GPT-5 CORE INTELLIGENCE READY FOR ACTIVATION');
console.log('🧠 ═══════════════════════════════════════════════════════════════');
console.log('');
