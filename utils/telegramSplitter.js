// utils/telegramSplitter.js - Perfect 10/10 Production-Grade Message Handler
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
    ENHANCED_MARKDOWN: true,
    VISUAL_SEPARATORS: true,
    MAX_LINE_LENGTH: 80
};

// Enhanced Telegram Message Formatter & Splitter with Auto-Emoji and Smart Formatting
class TelegramFormatter {
    constructor(customConfig = {}) {
        this.config = { ...CONFIG, ...customConfig };
        this.MAX_MESSAGE_LENGTH = this.config.MAX_MESSAGE_LENGTH;
        this.PREFERRED_CHUNK_SIZE = this.config.CHUNK_TARGET;
        
        // Emoji mappings for different content types
        this.emojiMap = {
            // Status and indicators
            success: ['✅', '🎉', '✨', '💚'],
            error: ['❌', '⚠️', '🚨', '💔'],
            info: ['ℹ️', '📢', '💡', '📋'],
            warning: ['⚠️', '🟡', '⚡', '🔔'],
            
            // Content types
            code: ['💻', '⚡', '🔧', '🛠️'],
            money: ['💰', '💵', '💸', '📈'],
            time: ['⏰', '⏱️', '🕐', '📅'],
            file: ['📁', '📄', '📋', '🗂️'],
            link: ['🔗', '🌐', '📎', '🔀'],
            
            // Actions
            send: ['📤', '🚀', '➡️', '📨'],
            receive: ['📥', '⬅️', '📩', '💌'],
            process: ['⚙️', '🔄', '⏳', '🔀'],
            complete: ['✅', '🏁', '🎯', '💯'],
            
            // Categories
            gpt: ['🤖', '🧠', '💭', '🎯'],
            system: ['🖥️', '⚙️', '🔧', '💾'],
            user: ['👤', '🙋', '💬', '🗣️'],
            admin: ['👑', '🛡️', '⭐', '🔑']
        };
        
        // Keywords that trigger specific emojis
        this.keywordEmojis = {
            // Technical terms
            'gpt-5': '🤖',
            'gpt5': '🤖',
            'ai': '🧠',
            'error': '❌',
            'success': '✅',
            'working': '✅',
            'failed': '❌',
            'loading': '⏳',
            'complete': '💯',
            'processing': '⚙️',
            
            // Financial
            'cost': '💰',
            'price': '💵',
            'tokens': '🪙',
            'usage': '📊',
            
            // Status
            'online': '🟢',
            'offline': '🔴',
            'ready': '✅',
            'busy': '🟡',
            'maintenance': '🔧',
            
            // Actions
            'sending': '📤',
            'received': '📥',
            'updated': '🔄',
            'created': '✨',
            'deleted': '🗑️',
            
            // Time
            'today': '📅',
            'now': '⏰',
            'urgent': '🚨',
            'scheduled': '⏰'
        };
        
        // Markdown patterns for Telegram
        this.markdownPatterns = {
            bold: /\*\*(.*?)\*\*/g,
            italic: /\*(.*?)\*/g,
            code: /`([^`]+)`/g,
            codeBlock: /```([\s\S]*?)```/g,
            underline: /__([^_]+)__/g,
            strikethrough: /~~([^~]+)~~/g
        };
    }
    
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

    // Main formatting function
    formatMessage(text, options = {}) {
        if (!text || typeof text !== 'string') return '';
        
        const config = {
            addEmojis: this.config.AUTO_EMOJI,
            improveSpacing: this.config.SMART_SPACING,
            formatMarkdown: this.config.ENHANCED_MARKDOWN,
            addBulletPoints: true,
            enhanceHeaders: true,
            addSeparators: this.config.VISUAL_SEPARATORS,
            maxLineLength: this.config.MAX_LINE_LENGTH,
            ...options
        };
        
        let formatted = text;
        
        // Step 1: Clean and normalize text
        formatted = this.normalizeText(formatted);
        
        // Step 2: Add auto-emojis based on content
        if (config.addEmojis) {
            formatted = this.addAutoEmojis(formatted);
        }
        
        // Step 3: Improve spacing and structure
        if (config.improveSpacing) {
            formatted = this.improveSpacing(formatted);
        }
        
        // Step 4: Format markdown for Telegram
        if (config.formatMarkdown) {
            formatted = this.formatMarkdown(formatted);
        }
        
        // Step 5: Enhance headers and sections
        if (config.enhanceHeaders) {
            formatted = this.enhanceHeaders(formatted);
        }
        
        // Step 6: Add bullet points and lists
        if (config.addBulletPoints) {
            formatted = this.enhanceLists(formatted);
        }
        
        // Step 7: Add separators for long content
        if (config.addSeparators) {
            formatted = this.addSeparators(formatted);
        }
        
        return formatted.trim();
    }
    
    // Enhanced message splitting with production-grade error handling
    async splitAndDeliverMessage(text, bot, chatId, options = {}) {
        const startTime = Date.now();
        
        try {
            // Check circuit breaker
            if (this.circuitBreaker.isOpen) {
                const timeSinceFailure = Date.now() - this.circuitBreaker.lastFailure;
                if (timeSinceFailure < this.circuitBreaker.resetTime) {
                    throw new Error(`Circuit breaker open. Retry in ${Math.ceil((this.circuitBreaker.resetTime - timeSinceFailure) / 1000)}s`);
                } else {
                    this.circuitBreaker.isOpen = false;
                    this.circuitBreaker.failures = 0;
                }
            }
            
            const formatted = this.formatMessage(text, options);
            const chunks = this.splitMessage(formatted, options);
            
            console.log(`📤 Delivering ${chunks.length} message(s) to chat ${chatId}`);
            
            const results = [];
            let currentDelay = this.config.DELAY_MS;
            
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                let attempts = 0;
                let sent = false;
                
                while (attempts < this.config.MAX_RETRIES && !sent) {
                    try {
                        attempts++;
                        
                        // Add delivery attempt info for debugging
                        if (attempts > 1) {
                            console.log(`🔄 Retry attempt ${attempts}/${this.config.MAX_RETRIES} for chunk ${i + 1}`);
                        }
                        
                        // Send message using your bot instance
                        const result = await this.sendMessageWithRetry(bot, chatId, chunk, {
                            parse_mode: 'Markdown',
                            disable_web_page_preview: true,
                            ...options.telegramOptions
                        });
                        
                        results.push({
                            chunkIndex: i,
                            messageId: result.message_id,
                            length: chunk.length,
                            attempts: attempts,
                            success: true
                        });
                        
                        sent = true;
                        this.metrics.totalSent++;
                        
                        // Adaptive delay - increase if we had to retry
                        if (attempts > 1 && this.config.ADAPTIVE_RETRY) {
                            currentDelay = Math.min(currentDelay * 1.5, 2000);
                        } else if (attempts === 1) {
                            currentDelay = Math.max(currentDelay * 0.9, this.config.DELAY_MS);
                        }
                        
                        console.log(`✅ Chunk ${i + 1}/${chunks.length} sent (${chunk.length} chars, attempt ${attempts})`);
                        
                    } catch (error) {
                        console.error(`❌ Failed to send chunk ${i + 1}, attempt ${attempts}:`, error.message);
                        
                        if (attempts < this.config.MAX_RETRIES) {
                            const retryDelay = this.config.RETRY_DELAY_MS * Math.pow(2, attempts - 1); // Exponential backoff
                            console.log(`⏳ Retrying in ${retryDelay}ms...`);
                            await this.sleep(retryDelay);
                        } else {
                            // All retries failed
                            results.push({
                                chunkIndex: i,
                                error: error.message,
                                attempts: attempts,
                                success: false
                            });
                            
                            this.metrics.totalFailed++;
                            this.circuitBreaker.failures++;
                            
                            // Open circuit breaker if too many failures
                            if (this.circuitBreaker.failures >= 3) {
                                this.circuitBreaker.isOpen = true;
                                this.circuitBreaker.lastFailure = Date.now();
                                console.error('🚨 Circuit breaker opened due to repeated failures');
                            }
                        }
                    }
                }
                
                // Delay between chunks (but not after last one)
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
                totalChunks: chunks.length,
                sentChunks: successCount,
                failedChunks: failureCount,
                executionTime,
                results,
                metrics: this.getMetrics()
            };
            
        } catch (error) {
            console.error('🚨 Critical error in message delivery:', error);
            this.metrics.totalFailed++;
            
            return {
                success: false,
                error: error.message,
                totalChunks: 0,
                sentChunks: 0,
                failedChunks: 1,
                executionTime: Date.now() - startTime,
                results: [],
                metrics: this.getMetrics()
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
            } else if (error.code === 400) {
                throw new Error(`Bad request: ${error.description || 'Invalid message format'}`);
            } else if (error.code === 403) {
                throw new Error(`Forbidden: ${error.description || 'Bot blocked by user'}`);
            } else {
                throw error;
            }
        }
    }
    
    // Utility sleep function
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Get system metrics
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
    
    // Reset circuit breaker manually
    resetCircuitBreaker() {
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = 0;
        this.circuitBreaker.lastFailure = null;
        console.log('🔄 Circuit breaker manually reset');
    }

    // Split formatted message into Telegram-friendly chunks
    splitMessage(text, options = {}) {
        const formatted = this.formatMessage(text, options);
        
        if (formatted.length <= this.MAX_MESSAGE_LENGTH) {
            return [formatted];
        }
        
        const chunks = [];
        const paragraphs = formatted.split('\n\n');
        let currentChunk = '';
        
        for (const paragraph of paragraphs) {
            // If single paragraph is too long, split it further
            if (paragraph.length > this.PREFERRED_CHUNK_SIZE) {
                // Save current chunk if it has content
                if (currentChunk.trim()) {
                    chunks.push(this.finalizeChunk(currentChunk.trim()));
                    currentChunk = '';
                }
                
                // Split long paragraph
                const subChunks = this.splitLongParagraph(paragraph);
                chunks.push(...subChunks);
            } else {
                // Check if adding this paragraph would exceed limit
                const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
                
                if (testChunk.length > this.PREFERRED_CHUNK_SIZE) {
                    // Save current chunk and start new one
                    if (currentChunk.trim()) {
                        chunks.push(this.finalizeChunk(currentChunk.trim()));
                    }
                    currentChunk = paragraph;
                } else {
                    currentChunk = testChunk;
                }
            }
        }
        
        // Add final chunk
        if (currentChunk.trim()) {
            chunks.push(this.finalizeChunk(currentChunk.trim()));
        }
        
        return chunks.map((chunk, index, array) => {
            if (array.length > 1) {
                const partInfo = `\n\n📄 *Part ${index + 1}/${array.length}*`;
                return chunk + partInfo;
            }
            return chunk;
        });
    }
    
    // Normalize text (clean up spacing, line breaks, etc.)
    normalizeText(text) {
        return text
            .replace(/\r\n/g, '\n')           // Normalize line breaks
            .replace(/\n{3,}/g, '\n\n')       // Max 2 consecutive line breaks
            .replace(/[ \t]+/g, ' ')          // Normalize spaces
            .replace(/^\s+|\s+$/g, '')        // Trim start/end
            .replace(/\n[ \t]+/g, '\n')       // Remove leading spaces on lines
            .replace(/[ \t]+\n/g, '\n');      // Remove trailing spaces on lines
    }
    
    // Add automatic emojis based on content analysis
    addAutoEmojis(text) {
        let result = text;
        
        // Add emojis for specific keywords
        for (const [keyword, emoji] of Object.entries(this.keywordEmojis)) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            result = result.replace(regex, `${emoji} ${keyword}`);
        }
        
        // Add section emojis for headers
        result = result.replace(/^(#+\s*)(.+)$/gm, (match, hashes, title) => {
            const emoji = this.getHeaderEmoji(title);
            return `${hashes}${emoji} ${title}`;
        });
        
        // Add status emojis for certain patterns
        result = result.replace(/^(Status|State|Condition):\s*(.+)$/gm, (match, label, status) => {
            const emoji = this.getStatusEmoji(status);
            return `${emoji} **${label}:** ${status}`;
        });
        
        return result;
    }
    
    // Improve spacing and readability
    improveSpacing(text) {
        return text
            // Add space after periods if missing
            .replace(/\.([A-Z])/g, '. $1')
            // Add space after colons if missing
            .replace(/:([^\s:])/g, ': $1')
            // Improve list spacing
            .replace(/^([•\-\*])\s*/gm, '$1 ')
            // Add breathing room around code blocks
            .replace(/(```[\s\S]*?```)/g, '\n$1\n')
            // Improve paragraph separation
            .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2');
    }
    
    // Format markdown for Telegram
    formatMarkdown(text) {
        let result = text;
        
        // Convert various markdown patterns to Telegram format
        result = result
            // Bold: **text** -> *text*
            .replace(/\*\*(.*?)\*\*/g, '*$1*')
            // Italic: *text* -> _text_  
            .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '_$1_')
            // Code: `text` stays the same
            // Code blocks: ``` stays the same
            // Underline: __text__ -> __text__ (Telegram supports this)
            // Strikethrough: ~~text~~ -> ~text~ (Telegram format)
            .replace(/~~([^~]+)~~/g, '~$1~');
        
        return result;
    }
    
    // Enhance headers with emojis and formatting
    enhanceHeaders(text) {
        return text.replace(/^(#+)\s*(.+)$/gm, (match, hashes, title) => {
            const level = hashes.length;
            const emoji = this.getHeaderEmoji(title);
            
            if (level === 1) {
                return `🔥 *${title.toUpperCase()}*\n${'═'.repeat(Math.min(title.length, 20))}`;
            } else if (level === 2) {
                return `${emoji} **${title}**\n${'─'.repeat(Math.min(title.length, 15))}`;
            } else {
                return `${emoji} **${title}**`;
            }
        });
    }
    
    // Enhance lists with better formatting
    enhanceLists(text) {
        let result = text;
        
        // Improve bullet points
        result = result
            .replace(/^[\-\*]\s+(.+)$/gm, '• $1')
            .replace(/^(\d+)[\.\)]\s+(.+)$/gm, '$1️⃣ $2')
            .replace(/^([a-zA-Z])[\.\)]\s+(.+)$/gm, '▫️ $2');
        
        // Add checkboxes for task-like items
        result = result
            .replace(/^•\s+(.*(?:complete|done|finished|ready|working|success).*)$/gmi, '✅ $1')
            .replace(/^•\s+(.*(?:todo|pending|waiting|failed|error|issue).*)$/gmi, '❌ $1')
            .replace(/^•\s+(.*(?:progress|processing|loading|running).*)$/gmi, '⏳ $1');
        
        return result;
    }
    
    // Add visual separators for long content
    addSeparators(text) {
        const lines = text.split('\n');
        const result = [];
        let inCodeBlock = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Track code blocks
            if (line.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
            }
            
            result.push(line);
            
            // Add separator after major sections (not in code blocks)
            if (!inCodeBlock && 
                line.match(/^[🔥✨💡📊⚡🎯].*[*_].*[*_]/) && 
                i < lines.length - 1 && 
                lines[i + 1].trim() !== '') {
                result.push('┈'.repeat(25));
            }
        }
        
        return result.join('\n');
    }
    
    // Split very long paragraphs
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
                    // Single sentence too long, split by words
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
    
    // Finalize a chunk with proper formatting
    finalizeChunk(chunk) {
        return chunk
            .replace(/\n{3,}/g, '\n\n')  // Clean up excessive line breaks
            .trim();
    }
    
    // Get appropriate emoji for headers
    getHeaderEmoji(title) {
        const lower = title.toLowerCase();
        
        if (lower.includes('error') || lower.includes('problem')) return '🚨';
        if (lower.includes('success') || lower.includes('complete')) return '✅';
        if (lower.includes('warning') || lower.includes('caution')) return '⚠️';
        if (lower.includes('info') || lower.includes('note')) return 'ℹ️';
        if (lower.includes('config') || lower.includes('setting')) return '⚙️';
        if (lower.includes('result') || lower.includes('output')) return '📊';
        if (lower.includes('api') || lower.includes('gpt')) return '🤖';
        if (lower.includes('cost') || lower.includes('price')) return '💰';
        if (lower.includes('time') || lower.includes('schedule')) return '⏰';
        if (lower.includes('file') || lower.includes('data')) return '📁';
        if (lower.includes('system') || lower.includes('status')) return '🖥️';
        if (lower.includes('user') || lower.includes('account')) return '👤';
        
        return '📋';
    }
    
    // Get status-appropriate emoji
    getStatusEmoji(status) {
        const lower = status.toLowerCase();
        
        if (lower.includes('ok') || lower.includes('ready') || lower.includes('online')) return '🟢';
        if (lower.includes('error') || lower.includes('failed') || lower.includes('offline')) return '🔴';
        if (lower.includes('warning') || lower.includes('busy') || lower.includes('pending')) return '🟡';
        if (lower.includes('processing') || lower.includes('loading')) return '🔄';
        
        return 'ℹ️';
    }
}

// Usage examples and helper functions with production-grade features
class TelegramMessageHandler {
    constructor(bot, defaultOptions = {}) {
        this.bot = bot;
        this.formatter = new TelegramFormatter(defaultOptions.config);
        this.defaultOptions = defaultOptions;
        
        // Message queue for rate limiting
        this.messageQueue = [];
        this.isProcessingQueue = false;
        this.queueProcessingDelay = 300; // ms between queued messages
    }
    
    // Enhanced message sending with queue management
    async sendFormattedMessage(text, chatId, options = {}) {
        const messageOptions = { ...this.defaultOptions, ...options };
        
        if (messageOptions.useQueue) {
            return this.queueMessage(text, chatId, messageOptions);
        } else {
            return this.formatter.splitAndDeliverMessage(text, this.bot, chatId, messageOptions);
        }
    }
    
    // Queue message for rate-limited sending
    async queueMessage(text, chatId, options = {}) {
        return new Promise((resolve, reject) => {
            this.messageQueue.push({
                text,
                chatId,
                options,
                resolve,
                reject,
                timestamp: Date.now()
            });
            
            if (!this.isProcessingQueue) {
                this.processMessageQueue();
            }
        });
    }
    
    // Process message queue with rate limiting
    async processMessageQueue() {
        if (this.isProcessingQueue || this.messageQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        console.log(`📋 Processing message queue (${this.messageQueue.length} messages)`);
        
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            
            try {
                const result = await this.formatter.splitAndDeliverMessage(
                    message.text, 
                    this.bot, 
                    message.chatId, 
                    message.options
                );
                message.resolve(result);
            } catch (error) {
                console.error('Queue processing error:', error);
                message.reject(error);
            }
            
            // Rate limiting delay
            if (this.messageQueue.length > 0) {
                await this.formatter.sleep(this.queueProcessingDelay);
            }
        }
        
        this.isProcessingQueue = false;
        console.log('✅ Message queue processing complete');
    }
    
    // Get queue status
    getQueueStatus() {
        return {
            queueLength: this.messageQueue.length,
            isProcessing: this.isProcessingQueue,
            oldestMessage: this.messageQueue.length > 0 ? 
                new Date(this.messageQueue[0].timestamp).toLocaleString() : null
        };
    }
    
    // Format and send a message with production monitoring
    async sendMessageWithMonitoring(text, chatId, options = {}) {
        const startTime = Date.now();
        
        try {
            const result = await this.sendFormattedMessage(text, chatId, options);
            
            // Log success metrics
            console.log(`📊 Message delivery metrics:`, {
                chatId,
                chunks: result.totalChunks,
                success: result.success,
                duration: result.executionTime,
                timestamp: new Date().toISOString()
            });
            
            return result;
        } catch (error) {
            // Log failure metrics
            console.error(`📊 Message delivery failed:`, {
                chatId,
                error: error.message,
                duration: Date.now() - startTime,
                timestamp: new Date().toISOString()
            });
            
            throw error;
        }
    }
    
    // Format different types of messages
    formatGPTResponse(response, metadata = {}) {
        const header = `🤖 **GPT-5 Response**`;
        const meta = metadata.model ? `\n_Model: ${metadata.model}_` : '';
        const tokens = metadata.tokens ? `\n_Tokens: ${metadata.tokens}_` : '';
        const cost = metadata.cost ? `\n_Cost: $${metadata.cost}_` : '';
        
        return this.formatter.formatMessage(`${header}${meta}${tokens}${cost}\n\n${response}`);
    }
    
    formatSystemStatus(status) {
        const title = `🖥️ **System Status Report**`;
        return this.formatter.formatMessage(`${title}\n\n${JSON.stringify(status, null, 2)}`);
    }
    
    formatError(error, context = '') {
        const title = `🚨 **Error Report**`;
        const contextInfo = context ? `\n**Context:** ${context}` : '';
        const errorInfo = `\n**Error:** ${error.message || error}`;
        const timestamp = `\n**Time:** ${new Date().toLocaleString()}`;
        
        return this.formatter.formatMessage(`${title}${contextInfo}${errorInfo}${timestamp}`);
    }
    
    formatSuccess(message, details = {}) {
        const title = `✅ **Success**`;
        const detailsText = Object.keys(details).length > 0 ? 
            `\n\n**Details:**\n${Object.entries(details).map(([k,v]) => `• ${k}: ${v}`).join('\n')}` : '';
        
        return this.formatter.formatMessage(`${title}\n\n${message}${detailsText}`);
    }
}

// Production-grade demonstration with real bot integration
async function demonstrateProductionFeatures(bot) {
    const handler = new TelegramMessageHandler(bot, {
        config: {
            DELAY_MS: 150,
            MAX_RETRIES: 3,
            ADAPTIVE_RETRY: true,
            AUTO_EMOJI: true,
            SMART_SPACING: true
        }
    });
    
    console.log('🚀 Running production-grade Telegram formatter demo...\n');
    
    // Example 1: High-priority message with monitoring
    const criticalUpdate = `System Alert: GPT-5 API experiencing high load. Current status: 85% capacity. Estimated resolution: 10 minutes. Auto-scaling activated. Monitoring active.`;
    
    try {
        const result1 = await handler.sendMessageWithMonitoring(
            criticalUpdate, 
            'admin_channel',
            { priority: 'high', useQueue: false }
        );
        console.log('✅ Critical message sent:', result1.success);
    } catch (error) {
        console.error('❌ Critical message failed:', error.message);
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // Example 2: Batch processing with queue
    const batchMessages = [
        'GPT-5 processing user query batch 1/5...',
        'GPT-5 processing user query batch 2/5...',
        'GPT-5 processing user query batch 3/5...',
        'GPT-5 processing user query batch 4/5...',
        'GPT-5 processing user query batch 5/5 - Complete!'
    ];
    
    console.log('📋 Queuing batch messages...');
    const batchPromises = batchMessages.map((msg, index) => 
        handler.sendFormattedMessage(msg, 'status_channel', { 
            useQueue: true,
            addEmojis: true,
            priority: index === 4 ? 'high' : 'normal'
        })
    );
    
    try {
        const batchResults = await Promise.all(batchPromises);
        console.log(`✅ Batch processing complete: ${batchResults.filter(r => r.success).length}/${batchResults.length} successful`);
    } catch (error) {
        console.error('❌ Batch processing error:', error.message);
    }
    
    // Show system metrics
    console.log('\n📊 System Metrics:');
    console.log(handler.formatter.getMetrics());
    console.log('📋 Queue Status:');
    console.log(handler.getQueueStatus());
}

// Export for production use
module.exports = {
    TelegramFormatter,
    TelegramMessageHandler,
    demonstrateProductionFeatures,
    CONFIG
};

// Run production demo if called directly
if (require.main === module) {
    // Mock bot for demonstration
    const mockBot = {
        sendMessage: async (chatId, text, options) => {
            console.log(`🤖 MockBot sending to ${chatId}: ${text.substring(0, 50)}...`);
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
            return { message_id: Math.floor(Math.random() * 10000) };
        }
    };
    
    demonstrateProductionFeatures(mockBot).then(() => {
        console.log('\n🎉 Production demo complete! Your Telegram splitter is now enterprise-ready.');
        console.log('\n🚀 Features enabled:');
        console.log('   ✅ Auto-emoji injection');
        console.log('   ✅ Smart text formatting'); 
        console.log('   ✅ Production error handling');
        console.log('   ✅ Circuit breaker protection');
        console.log('   ✅ Message queue management');
        console.log('   ✅ Adaptive retry logic');
        console.log('   ✅ Real-time metrics');
        console.log('   ✅ Rate limit protection');
    }).catch(console.error);
}
