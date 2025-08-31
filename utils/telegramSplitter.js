// utils/telegramSplitter.js - FIXED VERSION - Markdown Safe
'use strict';
const crypto = require('crypto');

// Enhanced configuration with advanced features
const CONFIG = {
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_LENGTH: 3900,
    CHUNK_TARGET: 3500,
    
    // Advanced delivery settings
    DELAY_MS: 200,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    ADAPTIVE_RETRY: true,
    
    // Formatting preferences
    AUTO_EMOJI: true,
    SMART_SPACING: true,
    ENHANCED_MARKDOWN: false, // DISABLED to prevent parsing errors
    VISUAL_SEPARATORS: true,
    MAX_LINE_LENGTH: 80
};

// Enhanced Telegram Message Formatter & Splitter with SAFE Markdown
class TelegramFormatter {
    constructor(customConfig = {}) {
        this.config = { ...CONFIG, ...customConfig };
        this.MAX_MESSAGE_LENGTH = this.config.MAX_MESSAGE_LENGTH;
        this.PREFERRED_CHUNK_SIZE = this.config.CHUNK_TARGET;
        
        // Circuit breaker for delivery failures
        this.circuitBreaker = {
            failures: 0,
            isOpen: false,
            lastFailure: null,
            resetTime: 60000 // Reset after 1 minute
        };
        
        // Delivery metrics
        this.metrics = {
            totalSent: 0,
            totalFailed: 0,
            averageDelay: this.config.DELAY_MS,
            lastSuccessTime: Date.now()
        };
    }
    
    // SAFE Markdown escaping function
    escapeMarkdown(text) {
        if (typeof text !== 'string') return '';
        
        // Escape all Telegram markdown special characters
        return text
            .replace(/\\/g, '\\\\')
            .replace(/\*/g, '\\*')
            .replace(/_/g, '\\_')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/~/g, '\\~')
            .replace(/`/g, '\\`')
            .replace(/>/g, '\\>')
            .replace(/#/g, '\\#')
            .replace(/\+/g, '\\+')
            .replace(/-/g, '\\-')
            .replace(/=/g, '\\=')
            .replace(/\|/g, '\\|')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\./g, '\\.')
            .replace(/!/g, '\\!');
    }
    
    // SAFE text cleaning - removes markdown instead of converting
    cleanMarkdown(text) {
        return text
            // Remove all markdown formatting safely
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
            .replace(/\*(.*?)\*/g, '$1')      // Remove italic
            .replace(/_(.*?)_/g, '$1')        // Remove underline
            .replace(/~~(.*?)~~/g, '$1')      // Remove strikethrough
            .replace(/`(.*?)`/g, '$1')        // Remove inline code
            .replace(/```[\s\S]*?```/g, (match) => {
                // Keep code blocks but remove markdown
                return match.replace(/```/g, '');
            })
            // Clean up any remaining markdown artifacts
            .replace(/^\s*#+\s*/gm, '')       // Remove headers
            .replace(/^\s*>\s*/gm, '')        // Remove blockquotes
            .replace(/^\s*[-*+]\s*/gm, '• ')  // Convert lists to bullets
            .replace(/^\s*\d+\.\s*/gm, (match) => {
                // Keep numbered lists
                return match.replace(/^\s*(\d+)\.\s*/, '$1. ');
            });
    }
    
    // Detect model from response or metadata
    detectModel(response, metadata = {}) {
        // Check metadata first
        if (metadata.model) {
            return {
                model: metadata.model,
                source: 'metadata',
                confidence: 'high'
            };
        }
        
        // Check for model indicators in response text
        const modelPatterns = [
            { pattern: /\[GPT-5\]/i, model: 'gpt-5', confidence: 'high' },
            { pattern: /\[gpt-5-mini\]/i, model: 'gpt-5-mini', confidence: 'high' },
            { pattern: /\[gpt-5-nano\]/i, model: 'gpt-5-nano', confidence: 'high' },
            { pattern: /\[GPT-4o\]/i, model: 'gpt-4o', confidence: 'high' },
            { pattern: /\[.*Fallback.*\]/i, model: 'gpt-4o-fallback', confidence: 'medium' },
            { pattern: /\[CACHED\]/i, model: 'cached-response', confidence: 'low' }
        ];
        
        for (const { pattern, model, confidence } of modelPatterns) {
            if (pattern.test(response)) {
                return { model, source: 'response_text', confidence };
            }
        }
        
        // Infer from response characteristics
        if (response.length > 8000) {
            return { model: 'gpt-5', source: 'inference', confidence: 'low' };
        } else if (response.length < 1000 && (response.includes('brief') || response.includes('quick'))) {
            return { model: 'gpt-5-nano', source: 'inference', confidence: 'low' };
        } else if (response.includes('reasoning') || response.includes('analysis')) {
            return { model: 'gpt-5', source: 'inference', confidence: 'medium' };
        }
        
        // Default
        return { model: 'gpt-5-mini', source: 'default', confidence: 'medium' };
    }
    
    // SAFE Enhanced message formatting - NO MARKDOWN MODE
    formatMessageWithModel(response, metadata = {}) {
        const modelInfo = this.detectModel(response, metadata);
        
        // Simple model names with emojis (NO MARKDOWN)
        const modelDisplay = {
            'gpt-5': '🚀 GPT-5',
            'gpt-5-mini': '⚡ GPT-5 Mini',
            'gpt-5-nano': '💨 GPT-5 Nano',
            'gpt-5-chat-latest': '💬 GPT-5 Chat',
            'gpt-4o': '🔥 GPT-4o',
            'gpt-4o-fallback': '🔥 GPT-4o Fallback',
            'cached-response': '💾 Cached Response'
        };
        
        const cleanModelName = modelDisplay[modelInfo.model] || '🤖 AI Assistant';
        
        // SAFE header - NO MARKDOWN, just plain text with emojis
        let header = `${cleanModelName}\n${'─'.repeat(20)}\n\n`;
        
        // Clean response text (remove existing model tags and markdown)
        let cleanResponse = response
            .replace(/^\[.*?\]\s*/gm, '')
            .replace(/^GPT-\d+.*?:\s*/gm, '')
            .trim();
        
        // Apply SAFE formatting (no markdown)
        const formatted = this.formatMessageSafe(`${header}${cleanResponse}`);
        
        return {
            formatted,
            modelInfo,
            metadata
        };
    }
    
    // SAFE formatting function - NO MARKDOWN PARSING
    formatMessageSafe(text, options = {}) {
        if (!text || typeof text !== 'string') return '';
        
        const config = {
            addEmojis: false,
            improveSpacing: this.config.SMART_SPACING,
            formatMarkdown: false, // ALWAYS FALSE FOR SAFETY
            addBulletPoints: true,
            enhanceHeaders: false,
            addSeparators: false,
            maxLineLength: this.config.MAX_LINE_LENGTH,
            ...options
        };
        
        let formatted = text;
        
        // Step 1: Clean markdown safely
        formatted = this.cleanMarkdown(formatted);
        
        // Step 2: Normalize text safely
        formatted = this.normalizeText(formatted);
        
        // Step 3: Improve spacing safely
        if (config.improveSpacing) {
            formatted = this.improveSpacingSafe(formatted);
        }
        
        // Step 4: Add bullet points safely
        if (config.addBulletPoints) {
            formatted = this.enhanceListsSafe(formatted);
        }
        
        return formatted.trim();
    }
    
    // Enhanced message splitting and delivery with SAFE MODE
    async splitAndSendMessage(text, bot, chatId, options = {}) {
        const startTime = Date.now();
        
        try {
            // Check circuit breaker
            if (this.circuitBreaker.isOpen) {
                const timeSinceFailure = Date.now() - this.circuitBreaker.lastFailure;
                if (timeSinceFailure < this.circuitBreaker.resetTime) {
                    throw new Error(`Circuit breaker open. Retry in ${Math.ceil((this.circuitBreaker.resetTime - timeSinceFailure) / 1000)}s`);
                } else {
                    this.resetCircuitBreaker();
                }
            }
            
            // Format message with model detection - SAFE MODE
            const result = this.formatMessageWithModel(text, options.metadata || {});
            const chunks = this.splitMessage(result.formatted);
            
            console.log(`Sending ${chunks.length} message(s) to chat ${chatId}`);
            console.log(`Detected model: ${result.modelInfo.model} (${result.modelInfo.confidence} confidence)`);
            
            const results = [];
            let currentDelay = this.config.DELAY_MS;
            
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                let attempts = 0;
                let sent = false;
                
                while (attempts < this.config.MAX_RETRIES && !sent) {
                    try {
                        attempts++;
                        
                        if (attempts > 1) {
                            console.log(`Retry attempt ${attempts}/${this.config.MAX_RETRIES} for chunk ${i + 1}`);
                        }
                        
                        // Send message with NO MARKDOWN PARSING
                        const messageResult = await this.sendMessageWithRetry(bot, chatId, chunk, {
                            // NO parse_mode to avoid markdown parsing errors
                            disable_web_page_preview: true,
                            ...options.telegramOptions
                        });
                        
                        results.push({
                            chunkIndex: i,
                            messageId: messageResult.message_id,
                            length: chunk.length,
                            attempts: attempts,
                            success: true
                        });
                        
                        sent = true;
                        this.metrics.totalSent++;
                        
                        // Adaptive delay
                        if (attempts > 1 && this.config.ADAPTIVE_RETRY) {
                            currentDelay = Math.min(currentDelay * 1.5, 2000);
                        } else if (attempts === 1) {
                            currentDelay = Math.max(currentDelay * 0.9, this.config.DELAY_MS);
                        }
                        
                        console.log(`✅ Chunk ${i + 1}/${chunks.length} sent successfully (${chunk.length} chars)`);
                        
                    } catch (error) {
                        console.error(`❌ Failed to send chunk ${i + 1}, attempt ${attempts}:`, error.message);
                        
                        if (attempts < this.config.MAX_RETRIES) {
                            const retryDelay = this.config.RETRY_DELAY_MS * Math.pow(2, attempts - 1);
                            console.log(`⏳ Retrying in ${retryDelay}ms...`);
                            await this.sleep(retryDelay);
                        } else {
                            results.push({
                                chunkIndex: i,
                                error: error.message,
                                attempts: attempts,
                                success: false
                            });
                            
                            this.metrics.totalFailed++;
                            this.circuitBreaker.failures++;
                            
                            if (this.circuitBreaker.failures >= 3) {
                                this.circuitBreaker.isOpen = true;
                                this.circuitBreaker.lastFailure = Date.now();
                                console.error('🔴 Circuit breaker opened due to repeated failures');
                            }
                        }
                    }
                }
                
                // Delay between chunks
                if (sent && i < chunks.length - 1) {
                    await this.sleep(currentDelay);
                }
            }
            
            const executionTime = Date.now() - startTime;
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;
            
            console.log(`📊 Delivery complete: ${successCount}/${chunks.length} sent, ${failureCount} failed, ${executionTime}ms`);
            
            // Update metrics
            this.metrics.averageDelay = (this.metrics.averageDelay + currentDelay) / 2;
            this.metrics.lastSuccessTime = successCount > 0 ? Date.now() : this.metrics.lastSuccessTime;
            
            return {
                success: failureCount === 0,
                enhanced: true,
                totalChunks: chunks.length,
                sentChunks: successCount,
                failedChunks: failureCount,
                executionTime,
                modelInfo: result.modelInfo,
                results
            };
            
        } catch (error) {
            console.error('💥 Critical error in message delivery:', error);
            this.metrics.totalFailed++;
            
            return {
                success: false,
                enhanced: false,
                error: error.message,
                totalChunks: 0,
                sentChunks: 0,
                failedChunks: 1,
                executionTime: Date.now() - startTime
            };
        }
    }
    
    // Robust message sending with error handling
    async sendMessageWithRetry(bot, chatId, text, options = {}) {
        try {
            // Handle different bot implementations
            if (bot.sendMessage) {
                return await bot.sendMessage(chatId, text, options);
            } else if (bot.telegram && bot.telegram.sendMessage) {
                return await bot.telegram.sendMessage(chatId, text, options);
            } else if (typeof bot === 'function') {
                return await bot(chatId, text, options);
            } else {
                throw new Error('Invalid bot instance - no sendMessage method found');
            }
        } catch (error) {
            // Enhanced error classification
            if (error.code === 429) {
                const retryAfter = error.parameters?.retry_after || 1;
                throw new Error(`Rate limited. Retry after ${retryAfter}s`);
            } else if (error.code === 400 && error.description?.includes("can't parse entities")) {
                throw new Error(`Markdown parsing error: ${error.description}`);
            } else if (error.code === 400) {
                throw new Error(`Bad request: ${error.description || 'Invalid message format'}`);
            } else if (error.code === 403) {
                throw new Error(`Forbidden: ${error.description || 'Bot blocked by user'}`);
            } else {
                throw error;
            }
        }
    }
    
    // Split formatted message into Telegram-friendly chunks
    splitMessage(text) {
        if (text.length <= this.MAX_MESSAGE_LENGTH) {
            return [text];
        }
        
        const chunks = [];
        const paragraphs = text.split('\n\n');
        let currentChunk = '';
        
        for (const paragraph of paragraphs) {
            if (paragraph.length > this.PREFERRED_CHUNK_SIZE) {
                if (currentChunk.trim()) {
                    chunks.push(this.finalizeChunk(currentChunk.trim()));
                    currentChunk = '';
                }
                
                const subChunks = this.splitLongParagraph(paragraph);
                chunks.push(...subChunks);
            } else {
                const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
                
                if (testChunk.length > this.PREFERRED_CHUNK_SIZE) {
                    if (currentChunk.trim()) {
                        chunks.push(this.finalizeChunk(currentChunk.trim()));
                    }
                    currentChunk = paragraph;
                } else {
                    currentChunk = testChunk;
                }
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(this.finalizeChunk(currentChunk.trim()));
        }
        
        return chunks.map((chunk, index, array) => {
            if (array.length > 1) {
                const partInfo = `\n\n📄 Part ${index + 1}/${array.length}`;
                return chunk + partInfo;
            }
            return chunk;
        });
    }
    
    // SAFE utility functions
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    resetCircuitBreaker() {
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = 0;
        this.circuitBreaker.lastFailure = null;
        console.log('🔄 Circuit breaker manually reset');
    }
    
    getMetrics() {
        const now = Date.now();
        const uptime = now - this.metrics.lastSuccessTime;
        
        return {
            totalSent: this.metrics.totalSent,
            totalFailed: this.metrics.totalFailed,
            successRate: this.metrics.totalSent + this.metrics.totalFailed > 0 ? 
                ((this.metrics.totalSent / (this.metrics.totalSent + this.metrics.totalFailed)) * 100).toFixed(2) : 100,
            averageDelay: Math.round(this.metrics.averageDelay),
            circuitBreakerOpen: this.circuitBreaker.isOpen,
            lastSuccessTime: new Date(this.metrics.lastSuccessTime).toLocaleString(),
            uptimeSinceLastSuccess: Math.round(uptime / 1000) + 's'
        };
    }
    
    // SAFE text processing methods
    normalizeText(text) {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/^\s+|\s+$/g, '')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/[ \t]+\n/g, '\n');
    }
    
    improveSpacingSafe(text) {
        return text
            .replace(/\.([A-Z])/g, '. $1')
            .replace(/:([^\s:])/g, ': $1')
            .replace(/^([•\-\*])\s*/gm, '$1 ')
            .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2');
    }
    
    enhanceListsSafe(text) {
        let result = text;
        
        result = result
            .replace(/^[\-\*]\s+(.+)$/gm, '• $1')
            .replace(/^(\d+)[\.\)]\s+(.+)$/gm, '$1. $2');
        
        return result;
    }
    
    splitLongParagraph(paragraph) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        const chunks = [];
        let currentChunk = '';
        
        for (const sentence of sentences) {
            const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
            
            if (testChunk.length > this.PREFERRED_CHUNK_SIZE) {
                if (currentChunk) {
                    chunks.push(this.finalizeChunk(currentChunk));
                    currentChunk = sentence;
                } else {
                    const words = sentence.split(' ');
                    let wordChunk = '';
                    
                    for (const word of words) {
                        const testWord = wordChunk + (wordChunk ? ' ' : '') + word;
                        if (testWord.length > this.PREFERRED_CHUNK_SIZE) {
                            if (wordChunk) {
                                chunks.push(this.finalizeChunk(wordChunk));
                                wordChunk = word;
                            } else {
                                chunks.push(this.finalizeChunk(word));
                            }
                        } else {
                            wordChunk = testWord;
                        }
                    }
                    
                    if (wordChunk) {
                        currentChunk = wordChunk;
                    }
                }
            } else {
                currentChunk = testChunk;
            }
        }
        
        if (currentChunk) {
            chunks.push(this.finalizeChunk(currentChunk));
        }
        
        return chunks;
    }
    
    finalizeChunk(chunk) {
        return chunk.replace(/\n{3,}/g, '\n\n').trim();
    }
}

// Production-grade message handler with SAFE MODE
class TelegramMessageHandler {
    constructor(bot, defaultOptions = {}) {
        this.bot = bot;
        this.formatter = new TelegramFormatter(defaultOptions.config);
        this.defaultOptions = defaultOptions;
        
        console.log('🛡️  Enhanced Telegram message handler initialized (SAFE MODE)');
    }
    
    // Main send function with SAFE formatting
    async sendFormattedMessage(text, chatId, options = {}) {
        const messageOptions = { ...this.defaultOptions, ...options };
        
        try {
            const result = await this.formatter.splitAndSendMessage(text, this.bot, chatId, messageOptions);
            
            if (result.success) {
                console.log(`✅ Enhanced delivery successful: ${result.sentChunks}/${result.totalChunks} chunks sent`);
                return result;
            } else {
                console.log(`⚠️  Enhanced delivery failed, attempting basic fallback...`);
                return await this.basicFallback(text, chatId, options);
            }
            
        } catch (error) {
            console.error('❌ Enhanced delivery failed:', error.message);
            console.log('🔄 Attempting basic fallback...');
            return await this.basicFallback(text, chatId, options);
        }
    }
    
    // Basic fallback for when enhanced delivery fails
    async basicFallback(text, chatId, options = {}) {
        try {
            // Clean text of any markdown before basic send
            const cleanText = this.formatter.cleanMarkdown(text);
            await this.bot.sendMessage(chatId, cleanText);
            console.log('✅ Basic fallback: Success');
            return {
                success: true,
                enhanced: false,
                fallback: true,
                totalChunks: 1,
                sentChunks: 1,
                failedChunks: 0
            };
        } catch (fallbackError) {
            console.error('❌ Basic fallback also failed:', fallbackError.message);
            return {
                success: false,
                enhanced: false,
                fallback: true,
                error: fallbackError.message,
                totalChunks: 1,
                sentChunks: 0,
                failedChunks: 1
            };
        }
    }
    
    // SAFE formatting functions
    formatGPTResponse(response, metadata = {}) {
        return this.formatter.formatMessageSafe(response);
    }
    
    formatSystemStatus(status) {
        const title = `System Status Report`;
        let statusText = `${title}\n${'═'.repeat(30)}\n${new Date().toLocaleString()}\n\n`;
        
        // GPT Models Status
        statusText += `AI Models:\n`;
        statusText += `• GPT-5: ${status.gpt5Available ? '🟢 Online' : '🔴 Offline'}\n`;
        statusText += `• GPT-5 Mini: ${status.gpt5MiniAvailable ? '🟢 Online' : '🔴 Offline'}\n`;
        statusText += `• GPT-5 Nano: ${status.gpt5NanoAvailable ? '🟢 Online' : '🔴 Offline'}\n`;
        statusText += `• Fallback: ${status.fallbackWorking ? '🟡 Ready' : '🔴 Unavailable'}\n\n`;
        
        // Performance Metrics
        if (status.metrics) {
            statusText += `Performance:\n`;
            statusText += `• Success Rate: ${status.metrics.successRate}%\n`;
            statusText += `• Total Sent: ${status.metrics.totalSent}\n`;
            statusText += `• Total Failed: ${status.metrics.totalFailed}\n\n`;
        }
        
        // Circuit Breaker
        const cbState = status.circuitBreakerState || 'CLOSED';
        const cbEmoji = cbState === 'OPEN' ? '🔴' : '🟢';
        statusText += `Circuit Breaker: ${cbEmoji} ${cbState}\n`;
        
        // Current Model
        if (status.currentModel) {
            statusText += `Active Model: ${status.currentModel}`;
        }
        
        return this.formatter.formatMessageSafe(statusText);
    }
    
    formatError(error, context = '') {
        const title = `Error Report`;
        const contextInfo = context ? `\nContext: ${context}` : '';
        const errorInfo = `\nError: ${error.message || error}`;
        const timestamp = `\nTime: ${new Date().toLocaleString()}`;
        
        return this.formatter.formatMessageSafe(`🚨 ${title}${contextInfo}${errorInfo}${timestamp}`);
    }
    
    formatSuccess(message, details = {}) {
        const title = `Success`;
        const detailsText = Object.keys(details).length > 0 ? 
            `\n\nDetails:\n${Object.entries(details).map(([k,v]) => `• ${k}: ${v}`).join('\n')}` : '';
        
        return this.formatter.formatMessageSafe(`✅ ${title}\n\n${message}${detailsText}`);
    }
    
    // Get system metrics
    getMetrics() {
        return this.formatter.getMetrics();
    }
    
    // Reset circuit breaker
    resetCircuitBreaker() {
        this.formatter.resetCircuitBreaker();
    }
}

// SAFE helper functions for easy integration
async function sendTelegramMessage(bot, chatId, gptResponse, metadata = {}) {
    try {
        const handler = new TelegramMessageHandler(bot);
        const result = await handler.sendFormattedMessage(gptResponse, chatId, { metadata });
        
        if (result.success && result.enhanced) {
            console.log(`✅ Enhanced Telegram delivery: ${result.totalChunks} chunks, model: ${result.modelInfo?.model || 'detected'}`);
            return { success: true, enhanced: true, chunks: result.totalChunks, model: result.modelInfo?.model };
        } else if (result.success && result.fallback) {
            console.log('⚠️  Telegram splitter not available, used basic send');
            return { success: true, enhanced: false, fallback: true };
        } else {
            throw new Error(result.error || 'Unknown delivery error');
        }
    } catch (error) {
        console.error('❌ Telegram delivery failed:', error.message);
        
        // Final fallback attempt with cleaned text
        try {
            const formatter = new TelegramFormatter();
            const cleanText = formatter.cleanMarkdown(gptResponse);
            await bot.sendMessage(chatId, cleanText);
            console.log('✅ Final fallback: Success');
            return { success: true, enhanced: false, fallback: true };
        } catch (finalError) {
            console.error('💥 All delivery methods failed:', finalError.message);
            return { success: false, error: finalError.message };
        }
    }
}

// Setup function for easy bot integration
function setupTelegramHandler(bot, config = {}) {
    const handler = new TelegramMessageHandler(bot, config);
    
    return {
        // Main send function
        send: (text, chatId, options = {}) => handler.sendFormattedMessage(text, chatId, options),
        
        // Specialized formatters
        sendGPTResponse: (response, metadata, chatId) => {
            const formatted = handler.formatGPTResponse(response, metadata);
            return handler.sendFormattedMessage(formatted, chatId, { metadata });
        },
        
        sendSystemStatus: (status, chatId) => {
            const formatted = handler.formatSystemStatus(status);
            return handler.sendFormattedMessage(formatted, chatId);
        },
        
        sendError: (error, context, chatId) => {
            const formatted = handler.formatError(error, context);
            return handler.sendFormattedMessage(formatted, chatId);
        },
        
        sendSuccess: (message, details, chatId) => {
            const formatted = handler.formatSuccess(message, details);
            return handler.sendFormattedMessage(formatted, chatId);
        },
        
        // System info
        getMetrics: () => handler.getMetrics(),
        resetCircuitBreaker: () => handler.resetCircuitBreaker(),
        
        // Direct access to handler
        handler: handler
    };
}

// Export everything for production use
module.exports = {
    // Main classes
    TelegramFormatter,
    TelegramMessageHandler,
    
    // Helper functions
    sendTelegramMessage,
    setupTelegramHandler,
    
    // Configuration
    CONFIG
};

console.log('🛡️  SAFE Telegram Splitter v3.0 - Markdown-safe, production-ready, zero parsing errors');
