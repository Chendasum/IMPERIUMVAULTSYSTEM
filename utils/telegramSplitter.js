// utils/telegramSplitter.js - Smart Formatting + Safe Delivery
'use strict';
const crypto = require('crypto');

// Enhanced configuration with smart formatting
const CONFIG = {
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_LENGTH: 3900,
    CHUNK_TARGET: 3500,
    
    // Advanced delivery settings
    DELAY_MS: 200,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    ADAPTIVE_RETRY: true,
    
    // Smart formatting preferences
    SMART_FORMATTING: true,
    UNICODE_STYLING: true,
    ENHANCED_SPACING: true,
    VISUAL_SEPARATORS: true,
    INTELLIGENT_LISTS: true,
    MAX_LINE_LENGTH: 80
};

// Smart Unicode Formatting Class
class SmartFormatter {
    constructor() {
        // Unicode styling elements
        this.styles = {
            bold: {
                start: '𝗕',  // Bold indicator without markdown
                chars: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'
            },
            separators: {
                thin: '─',
                thick: '━',
                double: '═',
                dotted: '┈',
                wave: '〜'
            },
            bullets: {
                primary: '▸',
                secondary: '•',
                tertiary: '◦',
                arrow: '→',
                check: '✓',
                star: '★'
            },
            boxes: {
                light: '┌─┐││└─┘',
                heavy: '┏━┓┃┃┗━┛',
                rounded: '╭─╮││╰─╯'
            }
        };
        
        // Smart patterns for text enhancement
        this.patterns = {
            headers: /^(#{1,6})\s*(.+)$/gm,
            strongEmphasis: /\*\*(.*?)\*\*/g,
            emphasis: /\*(.*?)\*/g,
            underline: /_(.*?)_/g,
            code: /`([^`]+)`/g,
            codeBlocks: /```([\s\S]*?)```/g,
            lists: /^[\s]*[-*+]\s+(.+)$/gm,
            numberedLists: /^[\s]*(\d+)[\.\)]\s+(.+)$/gm,
            quotes: /^>\s*(.+)$/gm
        };
    }
    
    // Convert text to smart Unicode formatting
    applySmartFormatting(text) {
        let formatted = text;
        
        // 1. Handle headers with smart styling
        formatted = formatted.replace(this.patterns.headers, (match, hashes, content) => {
            const level = hashes.length;
            const separators = this.styles.separators;
            
            switch(level) {
                case 1: // Main title
                    return `\n${separators.double.repeat(Math.min(content.length + 4, 30))}\n  ${content.toUpperCase()}  \n${separators.double.repeat(Math.min(content.length + 4, 30))}\n`;
                case 2: // Section
                    return `\n${separators.thick.repeat(Math.min(content.length + 2, 25))}\n ${content} \n${separators.thick.repeat(Math.min(content.length + 2, 25))}\n`;
                case 3: // Subsection
                    return `\n${separators.thin.repeat(Math.min(content.length, 20))}\n${content}\n${separators.thin.repeat(Math.min(content.length, 20))}\n`;
                default: // Smaller headers
                    return `\n▸ ${content}\n${separators.dotted.repeat(Math.min(content.length, 15))}\n`;
            }
        });
        
        // 2. Handle emphasis with Unicode alternatives
        formatted = formatted.replace(this.patterns.strongEmphasis, (match, content) => {
            return `𝗕 ${content}`;  // Bold indicator
        });
        
        formatted = formatted.replace(this.patterns.emphasis, (match, content) => {
            return `𝘐 ${content}`;  // Italic indicator  
        });
        
        formatted = formatted.replace(this.patterns.underline, (match, content) => {
            return `𝙐 ${content}`;  // Underline indicator
        });
        
        // 3. Handle code with smart boxes
        formatted = formatted.replace(this.patterns.code, (match, content) => {
            return `⟨${content}⟩`;  // Inline code styling
        });
        
        formatted = formatted.replace(this.patterns.codeBlocks, (match, content) => {
            const lines = content.trim().split('\n');
            const maxLen = Math.max(...lines.map(l => l.length), 10);
            const topBorder = '┌' + '─'.repeat(Math.min(maxLen + 2, 40)) + '┐';
            const bottomBorder = '└' + '─'.repeat(Math.min(maxLen + 2, 40)) + '┘';
            
            const formattedLines = lines.map(line => `│ ${line.padEnd(Math.min(maxLen, 38))} │`);
            
            return `\n${topBorder}\n${formattedLines.join('\n')}\n${bottomBorder}\n`;
        });
        
        // 4. Smart list formatting
        formatted = formatted.replace(this.patterns.lists, (match, content) => {
            return `${this.styles.bullets.primary} ${content}`;
        });
        
        formatted = formatted.replace(this.patterns.numberedLists, (match, num, content) => {
            return `${num}${this.styles.bullets.arrow} ${content}`;
        });
        
        // 5. Quote styling
        formatted = formatted.replace(this.patterns.quotes, (match, content) => {
            return `┃ ${content}`;
        });
        
        return formatted;
    }
    
    // Smart spacing improvements
    enhanceSpacing(text) {
        let enhanced = text;
        
        // Fix sentence spacing
        enhanced = enhanced
            .replace(/\.([A-Z])/g, '. $1')
            .replace(/\!([A-Z])/g, '! $1')  
            .replace(/\?([A-Z])/g, '? $1');
        
        // Improve list spacing
        enhanced = enhanced
            .replace(/^(▸|•|→|\d+→)/gm, '\n$1')  // Add space before lists
            .replace(/\n\n(▸|•|→|\d+→)/gm, '\n$1'); // But not double space
        
        // Smart paragraph spacing
        enhanced = enhanced
            .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2')  // Double space after sentences starting new paragraphs
            .replace(/\n{3,}/g, '\n\n');  // Max 2 line breaks
        
        // Section spacing
        enhanced = enhanced
            .replace(/(─{3,}|━{3,}|═{3,})\n([^\n])/g, '$1\n\n$2')  // Space after separators
            .replace(/([^\n])\n(─{3,}|━{3,}|═{3,})/g, '$1\n\n$2'); // Space before separators
        
        return enhanced;
    }
    
    // Smart line length optimization
    optimizeLineLength(text, maxLength = 80) {
        const lines = text.split('\n');
        const optimized = [];
        
        for (let line of lines) {
            // Skip separator lines and formatted elements
            if (/^[─━═┈〜▸•◦→✓★┌┐│└┘┏┓┃┗┛╭╮╰╯┃]+$/.test(line.trim())) {
                optimized.push(line);
                continue;
            }
            
            if (line.length <= maxLength) {
                optimized.push(line);
                continue;
            }
            
            // Smart word wrapping
            const words = line.split(' ');
            let currentLine = '';
            
            for (let word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                
                if (testLine.length <= maxLength) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        optimized.push(currentLine);
                        currentLine = word;
                    } else {
                        // Word is longer than max length
                        optimized.push(word);
                    }
                }
            }
            
            if (currentLine) {
                optimized.push(currentLine);
            }
        }
        
        return optimized.join('\n');
    }
}

// Enhanced Telegram Message Formatter with Smart Styling
class TelegramFormatter {
    constructor(customConfig = {}) {
        this.config = { ...CONFIG, ...customConfig };
        this.MAX_MESSAGE_LENGTH = this.config.MAX_MESSAGE_LENGTH;
        this.PREFERRED_CHUNK_SIZE = this.config.CHUNK_TARGET;
        this.smartFormatter = new SmartFormatter();
        
        // Circuit breaker for delivery failures
        this.circuitBreaker = {
            failures: 0,
            isOpen: false,
            lastFailure: null,
            resetTime: 60000
        };
        
        // Delivery metrics
        this.metrics = {
            totalSent: 0,
            totalFailed: 0,
            averageDelay: this.config.DELAY_MS,
            lastSuccessTime: Date.now()
        };
    }
    
    // Detect model from response or metadata
    detectModel(response, metadata = {}) {
        if (metadata.model) {
            return {
                model: metadata.model,
                source: 'metadata',
                confidence: 'high'
            };
        }
        
        const modelPatterns = [
            { pattern: /\[GPT-5\]/i, model: 'gpt-5', confidence: 'high' },
            { pattern: /\[gpt-5-mini\]/i, model: 'gpt-5-mini', confidence: 'high' },
            { pattern: /\[gpt-5-nano\]/i, model: 'gpt-5-nano', confidence: 'high' },
            { pattern: /\[GPT-4o\]/i, model: 'gpt-4o', confidence: 'high' }
        ];
        
        for (const { pattern, model, confidence } of modelPatterns) {
            if (pattern.test(response)) {
                return { model, source: 'response_text', confidence };
            }
        }
        
        // Inference based on response characteristics
        if (response.length > 8000) {
            return { model: 'gpt-5', source: 'inference', confidence: 'low' };
        } else if (response.includes('reasoning') || response.includes('analysis')) {
            return { model: 'gpt-5', source: 'inference', confidence: 'medium' };
        }
        
        return { model: 'gpt-5-mini', source: 'default', confidence: 'medium' };
    }
    
    // Smart message formatting with beautiful headers
    formatMessageWithModel(response, metadata = {}) {
        const modelInfo = this.detectModel(response, metadata);
        
        // Beautiful model headers with Unicode styling
        const modelDisplay = {
            'gpt-5': {
                icon: '🚀',
                name: 'GPT-5',
                subtitle: 'Advanced Reasoning Model'
            },
            'gpt-5-mini': {
                icon: '⚡',
                name: 'GPT-5 Mini',
                subtitle: 'Balanced Performance'
            },
            'gpt-5-nano': {
                icon: '💨',
                name: 'GPT-5 Nano', 
                subtitle: 'Ultra-Fast Response'
            },
            'gpt-4o': {
                icon: '🔥',
                name: 'GPT-4o',
                subtitle: 'Multimodal Intelligence'
            }
        };
        
        const modelConfig = modelDisplay[modelInfo.model] || {
            icon: '🤖',
            name: 'AI Assistant',
            subtitle: 'Intelligent Response'
        };
        
        // Create beautiful header
        const headerWidth = Math.min(modelConfig.name.length + modelConfig.subtitle.length + 10, 35);
        const topBorder = '╭' + '─'.repeat(headerWidth) + '╮';
        const bottomBorder = '╰' + '─'.repeat(headerWidth) + '╯';
        
        const header = [
            topBorder,
            `│ ${modelConfig.icon} ${modelConfig.name.padEnd(headerWidth - 6)} │`,
            `│ ${modelConfig.subtitle.padEnd(headerWidth - 4)} │`,
            bottomBorder,
            ''
        ].join('\n');
        
        // Clean response text
        let cleanResponse = response
            .replace(/^\[.*?\]\s*/gm, '')
            .replace(/^GPT-\d+.*?:\s*/gm, '')
            .trim();
        
        // Apply smart formatting
        const formatted = this.formatMessageSmart(`${header}${cleanResponse}`);
        
        return {
            formatted,
            modelInfo,
            metadata
        };
    }
    
    // Main smart formatting function
    formatMessageSmart(text, options = {}) {
        if (!text || typeof text !== 'string') return '';
        
        const config = {
            smartFormatting: this.config.SMART_FORMATTING,
            enhanceSpacing: this.config.ENHANCED_SPACING,
            intelligentLists: this.config.INTELLIGENT_LISTS,
            visualSeparators: this.config.VISUAL_SEPARATORS,
            optimizeLength: true,
            ...options
        };
        
        let formatted = text;
        
        // Step 1: Apply smart Unicode formatting
        if (config.smartFormatting) {
            formatted = this.smartFormatter.applySmartFormatting(formatted);
        }
        
        // Step 2: Enhance spacing
        if (config.enhanceSpacing) {
            formatted = this.smartFormatter.enhanceSpacing(formatted);
        }
        
        // Step 3: Optimize line length
        if (config.optimizeLength) {
            formatted = this.smartFormatter.optimizeLineLength(formatted, this.config.MAX_LINE_LENGTH);
        }
        
        // Step 4: Final cleanup
        formatted = this.finalCleanup(formatted);
        
        return formatted.trim();
    }
    
    // Enhanced message splitting and delivery
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
            
            // Format message with smart formatting
            const result = this.formatMessageWithModel(text, options.metadata || {});
            const chunks = this.splitMessage(result.formatted);
            
            console.log(`📤 Sending ${chunks.length} beautifully formatted message(s) to chat ${chatId}`);
            console.log(`🎯 Detected model: ${result.modelInfo.model} (${result.modelInfo.confidence} confidence)`);
            
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
                            console.log(`🔄 Retry attempt ${attempts}/${this.config.MAX_RETRIES} for chunk ${i + 1}`);
                        }
                        
                        // Send message with NO markdown parsing (safe mode)
                        const messageResult = await this.sendMessageWithRetry(bot, chatId, chunk, {
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
                        
                        console.log(`✨ Chunk ${i + 1}/${chunks.length} delivered beautifully (${chunk.length} chars)`);
                        
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
            
            console.log(`📊 Smart delivery complete: ${successCount}/${chunks.length} sent, ${failureCount} failed, ${executionTime}ms`);
            
            // Update metrics
            this.metrics.averageDelay = (this.metrics.averageDelay + currentDelay) / 2;
            this.metrics.lastSuccessTime = successCount > 0 ? Date.now() : this.metrics.lastSuccessTime;
            
            return {
                success: failureCount === 0,
                enhanced: true,
                smartFormatted: true,
                totalChunks: chunks.length,
                sentChunks: successCount,
                failedChunks: failureCount,
                executionTime,
                modelInfo: result.modelInfo,
                results
            };
            
        } catch (error) {
            console.error('💥 Critical error in smart message delivery:', error);
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
            if (error.code === 429) {
                const retryAfter = error.parameters?.retry_after || 1;
                throw new Error(`Rate limited. Retry after ${retryAfter}s`);
            } else if (error.code === 400 && error.description?.includes("can't parse entities")) {
                throw new Error(`Formatting error: ${error.description}`);
            } else if (error.code === 400) {
                throw new Error(`Bad request: ${error.description || 'Invalid message format'}`);
            } else if (error.code === 403) {
                throw new Error(`Forbidden: ${error.description || 'Bot blocked by user'}`);
            } else {
                throw error;
            }
        }
    }
    
    // Smart message splitting
    splitMessage(text) {
        if (text.length <= this.MAX_MESSAGE_LENGTH) {
            return [text];
        }
        
        const chunks = [];
        const sections = text.split(/\n(?=╭|┌|═{3,}|━{3,}|─{3,})/); // Split on major visual separators
        let currentChunk = '';
        
        for (const section of sections) {
            if (section.length > this.PREFERRED_CHUNK_SIZE) {
                if (currentChunk.trim()) {
                    chunks.push(this.finalizeChunk(currentChunk.trim()));
                    currentChunk = '';
                }
                
                const subChunks = this.splitLongSection(section);
                chunks.push(...subChunks);
            } else {
                const testChunk = currentChunk + (currentChunk ? '\n' : '') + section;
                
                if (testChunk.length > this.PREFERRED_CHUNK_SIZE) {
                    if (currentChunk.trim()) {
                        chunks.push(this.finalizeChunk(currentChunk.trim()));
                    }
                    currentChunk = section;
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
                const partInfo = `\n\n${'─'.repeat(15)}\n📄 Part ${index + 1} of ${array.length}\n${'─'.repeat(15)}`;
                return chunk + partInfo;
            }
            return chunk;
        });
    }
    
    // Utility functions
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
    
    // Final cleanup
    finalCleanup(text) {
        return text
            .replace(/\n{4,}/g, '\n\n\n')  // Max 3 line breaks
            .replace(/^\s+|\s+$/g, '')     // Trim
            .replace(/[ \t]+$/gm, '')      // Remove trailing spaces
            .replace(/^[ \t]+/gm, '');     // Remove leading tabs/spaces from lines
    }
    
    splitLongSection(section) {
        const paragraphs = section.split('\n\n');
        const chunks = [];
        let currentChunk = '';
        
        for (const paragraph of paragraphs) {
            const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
            
            if (testChunk.length > this.PREFERRED_CHUNK_SIZE) {
                if (currentChunk) {
                    chunks.push(this.finalizeChunk(currentChunk));
                    currentChunk = paragraph;
                } else {
                    // Paragraph itself is too long
                    const sentences = paragraph.split(/(?<=[.!?])\s+/);
                    let sentenceChunk = '';
                    
                    for (const sentence of sentences) {
                        const testSentence = sentenceChunk + (sentenceChunk ? ' ' : '') + sentence;
                        if (testSentence.length > this.PREFERRED_CHUNK_SIZE) {
                            if (sentenceChunk) {
                                chunks.push(this.finalizeChunk(sentenceChunk));
                                sentenceChunk = sentence;
                            } else {
                                chunks.push(this.finalizeChunk(sentence));
                            }
                        } else {
                            sentenceChunk = testSentence;
                        }
                    }
                    
                    if (sentenceChunk) {
                        currentChunk = sentenceChunk;
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

// Production-grade message handler with Smart Formatting
class TelegramMessageHandler {
    constructor(bot, defaultOptions = {}) {
        this.bot = bot;
        this.formatter = new TelegramFormatter(defaultOptions.config);
        this.defaultOptions = defaultOptions;
        
        console.log('✨ Smart Telegram Message Handler initialized - Beautiful formatting enabled!');
    }
    
    // Main send function with smart formatting
    async sendFormattedMessage(text, chatId, options = {}) {
        const messageOptions = { ...this.defaultOptions, ...options };
        
        try {
            const result = await this.formatter.splitAndSendMessage(text, this.bot, chatId, messageOptions);
            
            if (result.success) {
                console.log(`✨ Smart delivery successful: ${result.sentChunks}/${result.totalChunks} beautifully formatted chunks sent`);
                return result;
            } else {
                console.log(`⚠️  Smart delivery failed, attempting basic fallback...`);
                return await this.basicFallback(text, chatId, options);
            }
            
        } catch (error) {
            console.error('❌ Smart delivery failed:', error.message);
            console.log('🔄 Attempting basic fallback...');
            return await this.basicFallback(text, chatId, options);
        }
    }
    
    // Basic fallback with minimal formatting
    async basicFallback(text, chatId, options = {}) {
        try {
            // Apply minimal smart formatting for fallback
            const cleanText = this.formatter.finalCleanup(text);
            await this.bot.sendMessage(chatId, cleanText);
            console.log('✅ Basic fallback with clean formatting: Success');
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
    
    // Smart formatting functions
    formatGPTResponse(response, metadata = {}) {
        return this.formatter.formatMessageSmart(response);
    }
    
    formatSystemStatus(status) {
        const title = 'System Status Report';
        const timestamp = new Date().toLocaleString();
        
        let statusText = [
            '╭─────────────────────────────────╮',
            '│  🔧 System Status Report        │',
            '│  ⏰ ' + timestamp.padEnd(25) + ' │',
            '╰─────────────────────────────────╯',
            '',
            '🤖 AI Models Status:',
            '▸ GPT-5: ' + (status.gpt5Available ? '🟢 Online' : '🔴 Offline'),
            '▸ GPT-5 Mini: ' + (status.gpt5MiniAvailable ? '🟢 Online' : '🔴 Offline'),
            '▸ GPT-5 Nano: ' + (status.gpt5NanoAvailable ? '🟢 Online' : '🔴 Offline'),
            '▸ Fallback: ' + (status.fallbackWorking ? '🟡 Ready' : '🔴 Unavailable'),
            ''
        ];
        
        // Performance Metrics
        if (status.metrics) {
            statusText.push(
                '📊 Performance Metrics:',
                `▸ Success Rate: ${status.metrics.successRate}%`,
                `▸ Messages Sent: ${status.metrics.totalSent}`,
                `▸ Failed Messages: ${status.metrics.totalFailed}`,
                ''
            );
        }
        
        // Circuit Breaker Status
        const cbState = status.circuitBreakerState || 'CLOSED';
        const cbEmoji = cbState === 'OPEN' ? '🔴' : '🟢';
        statusText.push(`🛡️  Circuit Breaker: ${cbEmoji} ${cbState}`);
        
        // Current Model
        if (status.currentModel) {
            statusText.push(`🎯 Active Model: ${status.currentModel}`);
        }
        
        return this.formatter.formatMessageSmart(statusText.join('\n'));
    }
    
    formatError(error, context = '') {
        const timestamp = new Date().toLocaleString();
        
        let errorText = [
            '╭─────────────────────────────────╮',
            '│  🚨 Error Report                │',
            '│  ⏰ ' + timestamp.padEnd(25) + ' │',
            '╰─────────────────────────────────╯',
            ''
        ];
        
        if (context) {
            errorText.push(`📍 Context: ${context}`, '');
        }
        
        errorText.push(
            `❌ Error: ${error.message || error}`,
            '',
            '─'.repeat(30)
        );
        
        return this.formatter.formatMessageSmart(errorText.join('\n'));
    }
    
    formatSuccess(message, details = {}) {
        const timestamp = new Date().toLocaleString();
        
        let successText = [
            '╭─────────────────────────────────╮',
            '│  ✅ Success Report              │',
            '│  ⏰ ' + timestamp.padEnd(25) + ' │',
            '╰─────────────────────────────────╯',
            '',
            `🎉 ${message}`,
            ''
        ];
        
        if (Object.keys(details).length > 0) {
            successText.push('📋 Details:');
            Object.entries(details).forEach(([key, value]) => {
                successText.push(`▸ ${key}: ${value}`);
            });
            successText.push('');
        }
        
        successText.push('─'.repeat(30));
        
        return this.formatter.formatMessageSmart(successText.join('\n'));
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

// Smart helper functions for easy integration
async function sendTelegramMessage(bot, chatId, gptResponse, metadata = {}) {
    try {
        const handler = new TelegramMessageHandler(bot);
        const result = await handler.sendFormattedMessage(gptResponse, chatId, { metadata });
        
        if (result.success && result.smartFormatted) {
            console.log(`✨ Smart Telegram delivery: ${result.totalChunks} beautifully formatted chunks, model: ${result.modelInfo?.model || 'detected'}`);
            return { 
                success: true, 
                enhanced: true, 
                smartFormatted: true,
                chunks: result.totalChunks, 
                model: result.modelInfo?.model 
            };
        } else if (result.success && result.fallback) {
            console.log('⚠️  Smart formatting not available, used clean basic send');
            return { success: true, enhanced: false, fallback: true };
        } else {
            throw new Error(result.error || 'Unknown delivery error');
        }
    } catch (error) {
        console.error('❌ Smart Telegram delivery failed:', error.message);
        
        // Final fallback attempt with basic formatting
        try {
            const formatter = new TelegramFormatter();
            const cleanText = formatter.finalCleanup(gptResponse);
            await bot.sendMessage(chatId, cleanText);
            console.log('✅ Final clean fallback: Success');
            return { success: true, enhanced: false, fallback: true };
        } catch (finalError) {
            console.error('💥 All delivery methods failed:', finalError.message);
            return { success: false, error: finalError.message };
        }
    }
}

// Smart setup function for easy bot integration
function setupTelegramHandler(bot, config = {}) {
    const handler = new TelegramMessageHandler(bot, config);
    
    return {
        // Main send function
        send: (text, chatId, options = {}) => handler.sendFormattedMessage(text, chatId, options),
        
        // Specialized smart formatters
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
    SmartFormatter,
    
    // Helper functions
    sendTelegramMessage,
    setupTelegramHandler,
    
    // Configuration
    CONFIG
};

console.log('✨ Smart Telegram Splitter v4.0 - Beautiful Unicode formatting, safe delivery, zero parsing errors!');
