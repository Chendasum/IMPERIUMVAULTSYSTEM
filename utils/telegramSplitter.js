'use strict';

// utils/telegramSplitter.js - Enhanced GPT-5 Telegram Message Handler v3.0
// Advanced message delivery system optimized for GPT-5 models and modern Telegram API
// Features: Smart chunking, adaptive delivery, comprehensive error handling, performance optimization

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

// Enhanced configuration with GPT-5 optimizations
const CONFIG = {
    // Telegram limits
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_MESSAGE_LENGTH: 4000,
    OPTIMAL_CHUNK_SIZE: 3600,
    
    // Delivery timing (optimized for GPT-5 response patterns)
    DELAYS: {
        INSTANT: 50,
        FAST: 150,
        STANDARD: 300,
        CAREFUL: 500,
        CAUTIOUS: 750
    },
    
    // Advanced duplicate prevention
    DUPLICATE_DETECTION: {
        EXACT_WINDOW_MS: 5000,
        SEMANTIC_WINDOW_MS: 30000,
        MAX_RESPONSES_PER_QUERY: 1,
        CONTEXT_SIMILARITY_THRESHOLD: 0.85
    },
    
    // Error handling and retries
    RETRY: {
        MAX_ATTEMPTS: 4,
        BASE_DELAY_MS: 800,
        MAX_DELAY_MS: 10000,
        BACKOFF_FACTOR: 1.8
    },
    
    // Performance and monitoring
    PERFORMANCE: {
        METRICS_ENABLED: true,
        CLEANUP_INTERVAL_MS: 300000, // 5 minutes
        LOG_RETENTION_HOURS: 48,
        PERFORMANCE_BUFFER_SIZE: 1000,
        ERROR_BUFFER_SIZE: 500
    },
    
    // Message processing
    PROCESSING: {
        SMART_CHUNKING: true,
        PRESERVE_FORMATTING: true,
        AUTO_MARKDOWN_FALLBACK: true,
        CONTENT_ANALYSIS: true,
        EMOJI_OPTIMIZATION: true
    },
    
    // Business context
    BUSINESS: {
        TIMEZONE: 'Asia/Phnom_Penh',
        BUSINESS_HOURS: { start: 8, end: 18 },
        WORKING_DAYS: [1, 2, 3, 4, 5, 6], // Mon-Sat
        CURRENCY_FORMAT: 'USD',
        ADD_TIMESTAMPS: true
    }
};

// Enhanced GPT-5 model configurations
const GPT5_MODEL_CONFIGS = {
    'gpt-5': {
        emoji: '🧠',
        name: 'GPT-5',
        delay: CONFIG.DELAYS.STANDARD,
        priority: 5,
        color: '#4A90E2',
        category: 'reasoning',
        features: ['reasoning', 'verbosity', 'tools']
    },
    'gpt-5-mini': {
        emoji: '⚡',
        name: 'GPT-5 Mini',
        delay: CONFIG.DELAYS.FAST,
        priority: 3,
        color: '#F5A623',
        category: 'balanced',
        features: ['reasoning', 'speed']
    },
    'gpt-5-nano': {
        emoji: '🚀',
        name: 'GPT-5 Nano',
        delay: CONFIG.DELAYS.INSTANT,
        priority: 1,
        color: '#7ED321',
        category: 'speed',
        features: ['minimal_reasoning', 'ultra_fast']
    },
    'gpt-5-chat-latest': {
        emoji: '💬',
        name: 'GPT-5 Chat',
        delay: CONFIG.DELAYS.FAST,
        priority: 2,
        color: '#50E3C2',
        category: 'conversational',
        features: ['chat_optimized']
    },
    // Legacy support
    'analysis': {
        emoji: '📊',
        name: 'Analysis',
        delay: CONFIG.DELAYS.STANDARD,
        priority: 3,
        color: '#B83DBA',
        category: 'analytical',
        features: ['analysis']
    },
    'error': {
        emoji: '⚠️',
        name: 'System',
        delay: CONFIG.DELAYS.INSTANT,
        priority: 0,
        color: '#D0021B',
        category: 'system',
        features: ['error_handling']
    }
};

// Advanced state management with event emitters
class StateManager extends EventEmitter {
    constructor() {
        super();
        this.requests = new Map();
        this.queries = new Map();
        this.responses = new Map();
        this.performance = new Map();
        this.errors = new Map();
        this.activeDeliveries = new Set();
    }
    
    recordRequest(requestId, data) {
        this.requests.set(requestId, {
            ...data,
            timestamp: Date.now()
        });
        this.emit('request_recorded', { requestId, data });
    }
    
    getRequest(requestId) {
        return this.requests.get(requestId);
    }
    
    isRequestActive(requestId) {
        return this.activeDeliveries.has(requestId);
    }
    
    markActive(requestId) {
        this.activeDeliveries.add(requestId);
        this.emit('request_activated', requestId);
    }
    
    markComplete(requestId) {
        this.activeDeliveries.delete(requestId);
        this.emit('request_completed', requestId);
    }
    
    recordPerformance(metric, value) {
        const existing = this.performance.get(metric) || [];
        existing.push({ value, timestamp: Date.now() });
        
        if (existing.length > CONFIG.PERFORMANCE.PERFORMANCE_BUFFER_SIZE) {
            existing.shift();
        }
        
        this.performance.set(metric, existing);
        this.emit('performance_recorded', { metric, value });
    }
    
    cleanup() {
        const now = Date.now();
        const maxAge = CONFIG.PERFORMANCE.LOG_RETENTION_HOURS * 60 * 60 * 1000;
        
        let cleaned = { requests: 0, queries: 0, performance: 0, errors: 0 };
        
        // Clean old requests
        for (const [id, data] of this.requests.entries()) {
            if (now - data.timestamp > maxAge) {
                this.requests.delete(id);
                cleaned.requests++;
            }
        }
        
        // Clean old queries
        for (const [id, data] of this.queries.entries()) {
            if (now - data.timestamp > maxAge) {
                this.queries.delete(id);
                cleaned.queries++;
            }
        }
        
        // Clean old performance data
        for (const [metric, values] of this.performance.entries()) {
            const filtered = values.filter(v => now - v.timestamp <= maxAge);
            if (filtered.length !== values.length) {
                this.performance.set(metric, filtered);
                cleaned.performance += values.length - filtered.length;
            }
        }
        
        // Clean old errors
        for (const [id, data] of this.errors.entries()) {
            if (now - data.timestamp > maxAge) {
                this.errors.delete(id);
                cleaned.errors++;
            }
        }
        
        if (Object.values(cleaned).some(v => v > 0)) {
            this.emit('cleanup_completed', cleaned);
            console.log(`🧹 StateManager cleanup: ${JSON.stringify(cleaned)}`);
        }
    }
}

const stateManager = new StateManager();

// Enhanced ID generation with collision prevention
class IDGenerator {
    static generateRequestId(chatId, content, model, timestamp = Date.now()) {
        const normalized = this.normalizeContent(content);
        const modelKey = this.normalizeModel(model);
        const base = `${chatId}_${normalized}_${modelKey}_${timestamp}`;
        const hash = crypto.createHash('sha256').update(base).digest('hex');
        return `req_${hash.substring(0, 20)}`;
    }
    
    static generateQueryId(chatId, content) {
        const normalized = this.normalizeContent(content);
        const base = `${chatId}_${normalized}`;
        const hash = crypto.createHash('md5').update(base).digest('hex');
        return `qry_${hash.substring(0, 16)}`;
    }
    
    static generateMessageId(content, chunkIndex = 0) {
        const hash = crypto.createHash('md5').update(`${content}_${chunkIndex}`).digest('hex');
        return `msg_${hash.substring(0, 12)}`;
    }
    
    static normalizeContent(content) {
        return String(content)
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 500);
    }
    
    static normalizeModel(model) {
        return String(model).toLowerCase().replace(/[^a-z0-9-]/g, '');
    }
}

// Advanced message processor with GPT-5 optimizations
class MessageProcessor {
    static process(content, options = {}) {
        if (!content || typeof content !== 'string') {
            throw new Error('Invalid message content');
        }
        
        let processed = content;
        
        // Remove GPT-5 metadata
        if (options.removeMetadata !== false) {
            processed = this.removeGPTMetadata(processed);
        }
        
        // Clean formatting
        if (options.cleanFormatting !== false) {
            processed = this.cleanTelegramFormatting(processed);
        }
        
        // Optimize for model type
        if (options.model) {
            processed = this.optimizeForModel(processed, options.model);
        }
        
        return processed.trim();
    }
    
    static removeGPTMetadata(text) {
        return text
            // GPT-5 specific metadata
            .replace(/\[(?:reasoning_effort|verbosity|model):\s*[^\]]+\]/gi, '')
            .replace(/\[gpt-5[^\]]*\]/gi, '')
            .replace(/\((?:confidence|model|reasoning):\s*[^)]+\)/gi, '')
            .replace(/^reasoning:|^verbosity:|^model:/gmi, '')
            // Token usage info
            .replace(/\btokens?[\s:]?\d+/gi, '')
            .replace(/\d+\s*(?:input|output|total)\s*tokens?/gi, '')
            // Timestamps and IDs
            .replace(/\[timestamp:\s*[^\]]+\]/gi, '')
            .replace(/\[id:\s*[^\]]+\]/gi, '');
    }
    
    static cleanTelegramFormatting(text) {
        return text
            // Preserve financial formatting temporarily
            .replace(/\$([0-9,]+(?:\.[0-9]{2})?)/g, '💵$1')
            .replace(/([0-9]+(?:\.[0-9]{1,2})?)%/g, '📊$1%')
            
            // Clean markdown safely
            .replace(/\*\*\*(.+?)\*\*\*/g, '*$1*')  // Bold+italic to italic
            .replace(/\*\*(.+?)\*\*/g, '*$1*')      // Bold to italic
            .replace(/```[\w]*\n?([\s\S]*?)\n?```/g, '`$1`')  // Code blocks to inline
            .replace(/#{1,6}\s*(.*?)$/gm, '*$1*')   // Headers to italic
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            
            // Restore financial formatting
            .replace(/💵/g, '$')
            .replace(/📊/g, '')
            
            // Clean excessive whitespace
            .replace(/\n{4,}/g, '\n\n\n')
            .replace(/^\n+|\n+$/g, '')
            .replace(/\s{3,}/g, '  ');
    }
    
    static optimizeForModel(text, model) {
        const config = GPT5_MODEL_CONFIGS[model] || GPT5_MODEL_CONFIGS['analysis'];
        
        // Model-specific optimizations
        if (config.category === 'speed') {
            // For fast models, prefer concise formatting
            return text.replace(/\n\n+/g, '\n').replace(/\s{2,}/g, ' ');
        }
        
        if (config.category === 'reasoning') {
            // For reasoning models, preserve detailed structure
            return text; // Keep original formatting
        }
        
        return text;
    }
    
    static estimateComplexity(text) {
        const factors = {
            length: Math.min(text.length / 1000, 5),
            sentences: Math.min((text.match(/[.!?]+/g) || []).length / 10, 3),
            lists: Math.min((text.match(/^\s*[-*•]\s/gm) || []).length / 5, 2),
            code: (text.match(/`[^`]+`/g) || []).length > 0 ? 2 : 0,
            formatting: Math.min((text.match(/[*_`]/g) || []).length / 20, 2)
        };
        
        const complexity = Object.values(factors).reduce((sum, val) => sum + val, 0);
        return Math.min(Math.max(complexity, 1), 10); // Scale 1-10
    }
}

// Intelligent chunking system
class SmartChunker {
    static chunk(text, model = 'analysis', options = {}) {
        if (text.length <= CONFIG.SAFE_MESSAGE_LENGTH) {
            return [text];
        }
        
        const config = GPT5_MODEL_CONFIGS[model] || GPT5_MODEL_CONFIGS['analysis'];
        const complexity = MessageProcessor.estimateComplexity(text);
        
        // Adjust chunk size based on complexity and model
        let targetSize = CONFIG.OPTIMAL_CHUNK_SIZE;
        if (config.category === 'speed') targetSize += 200;
        if (complexity > 7) targetSize -= 300;
        
        return this.intelligentSplit(text, targetSize, config);
    }
    
    static intelligentSplit(text, targetSize, modelConfig) {
        const chunks = [];
        let remaining = text;
        let chunkNumber = 1;
        
        while (remaining.length > targetSize) {
            const splitPoint = this.findOptimalSplitPoint(remaining, targetSize);
            let chunk = remaining.substring(0, splitPoint).trim();
            
            // Add chunk header
            const header = this.generateChunkHeader(chunkNumber, modelConfig);
            chunk = `${header}\n\n${chunk}`;
            
            // Add continuation indicator
            if (remaining.length - splitPoint > 100) {
                chunk += '\n\n*[Continued...]*';
            }
            
            chunks.push(chunk);
            remaining = remaining.substring(splitPoint).trim();
            chunkNumber++;
        }
        
        // Final chunk
        if (remaining.length > 0) {
            const header = chunkNumber > 1 ? 
                this.generateChunkHeader(chunkNumber, modelConfig, true) : '';
            const finalChunk = header ? `${header}\n\n${remaining}` : remaining;
            chunks.push(finalChunk);
        }
        
        return chunks;
    }
    
    static findOptimalSplitPoint(text, targetSize) {
        const searchStart = Math.max(targetSize * 0.6, targetSize - 500);
        const searchEnd = Math.min(targetSize, text.length);
        
        // Split patterns in order of preference
        const patterns = [
            { regex: /\n\n#{1,6}\s/g, score: 10, name: 'headers' },
            { regex: /\n\n\d+\.\s/g, score: 9, name: 'numbered_lists' },
            { regex: /\n\n[•·▪▫-]\s/g, score: 8, name: 'bullet_points' },
            { regex: /\n\n(?=\w)/g, score: 7, name: 'paragraphs' },
            { regex: /\.\s+(?=[A-Z])/g, score: 6, name: 'sentences' },
            { regex: /;\s+/g, score: 5, name: 'semicolons' },
            { regex: /,\s+(?=\w+\s+[A-Z])/g, score: 4, name: 'clauses' },
            { regex: /\s+(?=\d+\.)/g, score: 3, name: 'list_items' },
            { regex: /\s+/g, score: 1, name: 'spaces' }
        ];
        
        let bestSplit = { point: targetSize, score: 0 };
        
        for (const pattern of patterns) {
            const matches = [...text.substring(0, searchEnd).matchAll(pattern.regex)];
            
            for (let i = matches.length - 1; i >= 0; i--) {
                const matchEnd = matches[i].index + matches[i][0].length;
                
                if (matchEnd >= searchStart && matchEnd <= searchEnd) {
                    const distanceScore = 1 - Math.abs(matchEnd - targetSize) / targetSize;
                    const finalScore = pattern.score * distanceScore;
                    
                    if (finalScore > bestSplit.score) {
                        bestSplit = { point: matchEnd, score: finalScore, pattern: pattern.name };
                        break;
                    }
                }
            }
            
            if (bestSplit.score > 7) break; // Good enough split found
        }
        
        return bestSplit.point;
    }
    
    static generateChunkHeader(chunkNumber, modelConfig, isFinal = false) {
        const emoji = modelConfig.emoji || '📄';
        const label = isFinal ? `Part ${chunkNumber} - Final` : `Part ${chunkNumber}`;
        const timestamp = CONFIG.BUSINESS.ADD_TIMESTAMPS ? 
            ` • ${this.getCambodiaTime()}` : '';
        
        return `${emoji} *${label}*${timestamp}`;
    }
    
    static getCambodiaTime() {
        return new Date().toLocaleString('en-US', {
            timeZone: CONFIG.BUSINESS.TIMEZONE,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Enhanced duplicate detection
class DuplicateDetector {
    static isDuplicate(requestId, queryId, content, model) {
        return this.isExactDuplicate(requestId) || 
               this.isSemanticDuplicate(queryId, content, model);
    }
    
    static isExactDuplicate(requestId) {
        const request = stateManager.getRequest(requestId);
        if (!request) return false;
        
        const age = Date.now() - request.timestamp;
        return age < CONFIG.DUPLICATE_DETECTION.EXACT_WINDOW_MS;
    }
    
    static isSemanticDuplicate(queryId, content, model) {
        const responses = stateManager.responses.get(queryId) || [];
        const recentResponses = responses.filter(r => 
            Date.now() - r.timestamp < CONFIG.DUPLICATE_DETECTION.SEMANTIC_WINDOW_MS
        );
        
        if (recentResponses.length >= CONFIG.DUPLICATE_DETECTION.MAX_RESPONSES_PER_QUERY) {
            return true;
        }
        
        // Check semantic similarity for same model
        return recentResponses.some(r => 
            r.model === model && 
            this.calculateSimilarity(content, r.content) > CONFIG.DUPLICATE_DETECTION.CONTEXT_SIMILARITY_THRESHOLD
        );
    }
    
    static calculateSimilarity(text1, text2) {
        // Simple similarity based on normalized content
        const norm1 = IDGenerator.normalizeContent(text1);
        const norm2 = IDGenerator.normalizeContent(text2);
        
        if (norm1 === norm2) return 1.0;
        if (!norm1 || !norm2) return 0.0;
        
        const words1 = new Set(norm1.split(' '));
        const words2 = new Set(norm2.split(' '));
        const intersection = new Set([...words1].filter(w => words2.has(w)));
        const union = new Set([...words1, ...words2]);
        
        return union.size > 0 ? intersection.size / union.size : 0.0;
    }
    
    static recordResponse(queryId, content, model) {
        const responses = stateManager.responses.get(queryId) || [];
        responses.push({
            content: IDGenerator.normalizeContent(content),
            model,
            timestamp: Date.now()
        });
        stateManager.responses.set(queryId, responses);
    }
}

// Advanced delivery engine
class DeliveryEngine {
    static async deliverMessage(bot, chatId, content, options = {}) {
        const startTime = Date.now();
        const model = options.model || 'analysis';
        const modelConfig = GPT5_MODEL_CONFIGS[model] || GPT5_MODEL_CONFIGS['analysis'];
        
        // Process content
        const processed = MessageProcessor.process(content, { model, ...options });
        if (!processed || processed.length < 5) {
            throw new Error('Message content too short after processing');
        }
        
        // Generate IDs
        const requestId = IDGenerator.generateRequestId(chatId, processed, model);
        const queryId = IDGenerator.generateQueryId(chatId, processed);
        
        // Check duplicates
        if (!options.forceSend && DuplicateDetector.isDuplicate(requestId, queryId, processed, model)) {
            console.log(`Duplicate blocked: ${requestId}`);
            return { success: false, reason: 'duplicate', requestId };
        }
        
        // Record request
        stateManager.recordRequest(requestId, {
            chatId,
            queryId,
            model,
            contentLength: processed.length,
            options
        });
        
        stateManager.markActive(requestId);
        
        try {
            // Add title if provided
            let finalContent = processed;
            if (options.title) {
                const titleHeader = `${modelConfig.emoji} *${options.title}*`;
                finalContent = `${titleHeader}\n\n${processed}`;
            }
            
            // Deliver message(s)
            let result;
            if (finalContent.length <= CONFIG.SAFE_MESSAGE_LENGTH) {
                result = await this.deliverSingle(bot, chatId, finalContent, modelConfig, options);
            } else {
                result = await this.deliverChunked(bot, chatId, finalContent, modelConfig, options);
            }
            
            // Record success
            const processingTime = Date.now() - startTime;
            stateManager.recordPerformance('delivery_time', processingTime);
            stateManager.recordPerformance('message_size', finalContent.length);
            
            DuplicateDetector.recordResponse(queryId, processed, model);
            
            console.log(`✅ Message delivered: ${requestId} (${processingTime}ms)`);
            
            return {
                success: true,
                requestId,
                queryId,
                processingTime,
                chunks: result.chunks || 1,
                method: result.method
            };
            
        } catch (error) {
            console.error(`❌ Delivery failed: ${requestId} - ${error.message}`);
            stateManager.errors.set(requestId, {
                error: error.message,
                timestamp: Date.now(),
                chatId,
                model
            });
            
            // Try fallback delivery
            try {
                await this.deliverFallback(bot, chatId, error, modelConfig);
                return { success: true, requestId, fallback: true };
            } catch (fallbackError) {
                return { success: false, requestId, error: error.message };
            }
            
        } finally {
            stateManager.markComplete(requestId);
        }
    }
    
    static async deliverSingle(bot, chatId, content, modelConfig, options = {}) {
        const methods = ['markdown', 'html', 'plain'];
        
        for (const method of methods) {
            try {
                const formatted = this.formatForMethod(content, method);
                const sendOptions = {
                    disable_web_page_preview: true,
                    disable_notification: options.silent || false
                };
                
                if (method !== 'plain') {
                    sendOptions.parse_mode = method === 'markdown' ? 'Markdown' : 'HTML';
                }
                
                await bot.sendMessage(chatId, formatted, sendOptions);
                stateManager.recordPerformance(`delivery_method_${method}`, 1);
                return { method, chunks: 1 };
                
            } catch (error) {
                console.log(`⚠️ ${method} delivery failed: ${error.message}`);
                continue;
            }
        }
        
        throw new Error('All delivery methods failed');
    }
    
    static async deliverChunked(bot, chatId, content, modelConfig, options = {}) {
        const chunks = SmartChunker.chunk(content, options.model || 'analysis');
        let successCount = 0;
        
        console.log(`📦 Delivering ${chunks.length} chunks`);
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const isLast = i === chunks.length - 1;
            
            try {
                await this.deliverSingle(bot, chatId, chunk, modelConfig, {
                    ...options,
                    silent: i > 0 // Only first chunk makes sound
                });
                successCount++;
                
                // Adaptive delay
                if (!isLast) {
                    const delay = this.calculateDelay(modelConfig, chunk.length, i, successCount);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
            } catch (error) {
                console.error(`❌ Chunk ${i + 1} failed: ${error.message}`);
            }
        }
        
        stateManager.recordPerformance('chunked_delivery', chunks.length);
        stateManager.recordPerformance('chunk_success_rate', successCount / chunks.length);
        
        if (successCount === 0) {
            throw new Error('All chunks failed to deliver');
        }
        
        return { method: 'chunked', chunks: chunks.length, successful: successCount };
    }
    
    static calculateDelay(modelConfig, chunkSize, chunkIndex, successCount) {
        const baseDelay = modelConfig.delay || CONFIG.DELAYS.STANDARD;
        const sizeMultiplier = Math.min(1.5, chunkSize / 2000);
        const successMultiplier = successCount / (chunkIndex + 1) < 0.8 ? 1.5 : 1.0;
        const progressMultiplier = 1 + (chunkIndex * 0.1); // Slight increase over time
        
        return Math.round(baseDelay * sizeMultiplier * successMultiplier * progressMultiplier);
    }
    
    static formatForMethod(content, method) {
        switch (method) {
            case 'html':
                return this.convertToHTML(content);
            case 'plain':
                return this.stripFormatting(content);
            case 'markdown':
            default:
                return content;
        }
    }
    
    static convertToHTML(content) {
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
            .replace(/\*([^*]+)\*/g, '<i>$1</i>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    }
    
    static stripFormatting(content) {
        return content
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/#{1,6}\s*/g, '')
            .replace(/[*_`~]/g, '');
    }
    
    static async deliverFallback(bot, chatId, originalError, modelConfig) {
        const fallbackContent = this.generateFallbackMessage(originalError, modelConfig);
        await bot.sendMessage(chatId, fallbackContent, {
            disable_web_page_preview: true
        });
    }
    
    static generateFallbackMessage(error, modelConfig) {
        const emoji = modelConfig.emoji || '⚠️';
        const time = SmartChunker.getCambodiaTime();
        
        let message = `${emoji} *Delivery Issue*\n\n`;
        
        if (error.message.includes('network') || error.message.includes('timeout')) {
            message += 'Network connectivity issue. Please try again.';
        } else if (error.message.includes('rate limit')) {
            message += 'System temporarily busy. Processing...';
        } else if (error.message.includes('too long')) {
            message += 'Response too large. Breaking into smaller parts...';
        } else {
            message += `Technical issue: ${error.message.substring(0, 100)}`;
        }
        
        message += `\n\nTime: ${time}`;
        return message;
    }
}

// Performance monitor
class PerformanceMonitor {
    static getStats() {
        const stats = {
            timestamp: Date.now(),
            cambodiaTime: SmartChunker.getCambodiaTime(),
            activeRequests: stateManager.activeDeliveries.size,
            totalRequests: stateManager.requests.size,
            totalQueries: stateManager.queries.size,
            errors: stateManager.errors.size
        };
        
        // Calculate performance metrics
        const deliveryTimes = stateManager.performance.get('delivery_time') || [];
        if (deliveryTimes.length > 0) {
            const times = deliveryTimes.map(d => d.value);
            stats.avgDeliveryTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
            stats.minDeliveryTime = Math.min(...times);
            stats.maxDeliveryTime = Math.max(...times);
        }
        
        const messageSizes = stateManager.performance.get('message_size') || [];
        if (messageSizes.length > 0) {
            const sizes = messageSizes.map(d => d.value);
            stats.avgMessageSize = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
            stats.maxMessageSize = Math.max(...sizes);
        }
        
        // Method usage statistics
        const methods = ['markdown', 'html', 'plain'];
        stats.deliveryMethods = {};
        methods.forEach(method => {
            const data = stateManager.performance.get(`delivery_method_${method}`) || [];
            stats.deliveryMethods[method] = data.length;
        });
        
        return stats;
    }
    
    static getDetailedMetrics() {
        const metrics = {};
        
        // Process all performance data
        for (const [metric, values] of stateManager.performance.entries()) {
            if (values.length > 0) {
                const nums = values.map(v => v.value);
                metrics[metric] = {
                    count: values.length,
                    avg: Math.round(nums.reduce((a, b) => a + b, 0) / nums.length),
                    min: Math.min(...nums),
                    max: Math.max(...nums),
                    recent: values.slice(-10).map(v => v.value)
                };
            }
        }
        
        return {
            timestamp: Date.now(),
            metrics,
            errors: this.getErrorSummary(),
            config: {
                maxMessageLength: CONFIG.MAX_MESSAGE_LENGTH,
                optimalChunkSize: CONFIG.OPTIMAL_CHUNK_SIZE,
                duplicateWindow: CONFIG.DUPLICATE_DETECTION.EXACT_WINDOW_MS,
                retryAttempts: CONFIG.RETRY.MAX_ATTEMPTS
            }
        };
    }
    
    static getErrorSummary() {
        const errors = {};
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        for (const [id, errorData] of stateManager.errors.entries()) {
            if (now - errorData.timestamp <= oneHour) {
                const type = this.classifyError(errorData.error);
                errors[type] = (errors[type] || 0) + 1;
            }
        }
        
        return errors;
    }
    
    static classifyError(errorMessage) {
        const msg = errorMessage.toLowerCase();
        if (msg.includes('network') || msg.includes('timeout')) return 'network';
        if (msg.includes('rate limit')) return 'rate_limit';
        if (msg.includes('parse') || msg.includes('format')) return 'formatting';
        if (msg.includes('too long') || msg.includes('length')) return 'size';
        return 'other';
    }
}

// Business context helpers
class BusinessContext {
    static getCambodiaTime(includeDate = false) {
        const now = new Date();
        const options = {
            timeZone: CONFIG.BUSINESS.TIMEZONE,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (includeDate) {
            options.year = 'numeric';
            options.month = '2-digit';
            options.day = '2-digit';
        }
        
        return now.toLocaleString('en-US', options);
    }
    
    static isBusinessHours() {
        const now = new Date();
        const cambodiaTime = new Date(now.toLocaleString('en-US', { 
            timeZone: CONFIG.BUSINESS.TIMEZONE 
        }));
        
        const hour = cambodiaTime.getHours();
        const day = cambodiaTime.getDay();
        
        return CONFIG.BUSINESS.WORKING_DAYS.includes(day) && 
               hour >= CONFIG.BUSINESS.BUSINESS_HOURS.start && 
               hour < CONFIG.BUSINESS.BUSINESS_HOURS.end;
    }
    
    static formatCurrency(amount, currency = 'USD') {
        if (currency === 'USD') {
            return `${amount.toLocaleString()} USD`;
        }
        return `${amount.toLocaleString()} ${currency}`;
    }
    
    static addBusinessContext(content, options = {}) {
        if (!options.addBusinessContext) return content;
        
        const time = this.getCambodiaTime(true);
        const isOpen = this.isBusinessHours();
        
        let context = `\n\n*Analysis Time: ${time}*`;
        if (!isOpen) {
            context += '\n*Note: Outside business hours*';
        }
        
        return content + context;
    }
}

// Main API class
class TelegramSplitter {
    constructor(options = {}) {
        this.config = { ...CONFIG, ...options };
        this.stateManager = stateManager;
        this.setupEventHandlers();
        this.startCleanupTimer();
    }
    
    setupEventHandlers() {
        this.stateManager.on('request_completed', (requestId) => {
            console.log(`Request completed: ${requestId}`);
        });
        
        this.stateManager.on('cleanup_completed', (stats) => {
            console.log(`Cleanup completed: ${JSON.stringify(stats)}`);
        });
        
        this.stateManager.on('performance_recorded', ({ metric, value }) => {
            if (metric === 'delivery_time' && value > 5000) {
                console.log(`Slow delivery detected: ${value}ms`);
            }
        });
    }
    
    startCleanupTimer() {
        setInterval(() => {
            this.stateManager.cleanup();
        }, CONFIG.PERFORMANCE.CLEANUP_INTERVAL_MS);
    }
    
    // Main delivery method
    async send(bot, chatId, content, options = {}) {
        return await DeliveryEngine.deliverMessage(bot, chatId, content, options);
    }
    
    // Convenience methods for different GPT-5 models
    async sendGPT5(bot, chatId, content, options = {}) {
        return await this.send(bot, chatId, content, { ...options, model: 'gpt-5' });
    }
    
    async sendGPT5Mini(bot, chatId, content, options = {}) {
        return await this.send(bot, chatId, content, { ...options, model: 'gpt-5-mini' });
    }
    
    async sendGPT5Nano(bot, chatId, content, options = {}) {
        return await this.send(bot, chatId, content, { ...options, model: 'gpt-5-nano' });
    }
    
    async sendGPT5Chat(bot, chatId, content, options = {}) {
        return await this.send(bot, chatId, content, { ...options, model: 'gpt-5-chat-latest' });
    }
    
    // Legacy compatibility methods
    async sendGPTResponse(bot, chatId, response, title = null, metadata = {}) {
        return await this.send(bot, chatId, response, { 
            title, 
            model: 'gpt-5', 
            addBusinessContext: true,
            ...metadata 
        });
    }
    
    async sendAnalysis(bot, chatId, analysis, title = null, metadata = {}) {
        return await this.send(bot, chatId, analysis, { 
            title, 
            model: 'analysis', 
            addBusinessContext: true,
            ...metadata 
        });
    }
    
    async sendAlert(bot, chatId, message, title = 'System Alert', metadata = {}) {
        const alertContent = `System Alert: ${message}`;
        return await this.send(bot, chatId, alertContent, { 
            title, 
            model: 'error',
            priority: 'high',
            ...metadata 
        });
    }
    
    // Utility methods
    getStats() {
        return PerformanceMonitor.getStats();
    }
    
    getDetailedMetrics() {
        return PerformanceMonitor.getDetailedMetrics();
    }
    
    debug(chatId, content, model = 'analysis') {
        const requestId = IDGenerator.generateRequestId(chatId, content, model);
        const queryId = IDGenerator.generateQueryId(chatId, content);
        const processed = MessageProcessor.process(content, { model });
        const chunks = SmartChunker.chunk(processed, model);
        
        return {
            requestId,
            queryId,
            originalLength: content.length,
            processedLength: processed.length,
            chunkCount: chunks.length,
            estimatedDelay: GPT5_MODEL_CONFIGS[model]?.delay || CONFIG.DELAYS.STANDARD,
            wouldBeDuplicate: DuplicateDetector.isDuplicate(requestId, queryId, processed, model),
            complexity: MessageProcessor.estimateComplexity(processed)
        };
    }
    
    cleanup() {
        this.stateManager.cleanup();
    }
    
    resetStats() {
        this.stateManager.requests.clear();
        this.stateManager.queries.clear();
        this.stateManager.responses.clear();
        this.stateManager.performance.clear();
        this.stateManager.errors.clear();
        console.log('Statistics reset completed');
    }
}

// Create default instance
const defaultSplitter = new TelegramSplitter();

// Export both class and default instance methods for backward compatibility
module.exports = {
    // Default instance methods (backward compatibility)
    sendGPT5Message: (bot, chatId, content, title, metadata) => 
        defaultSplitter.send(bot, chatId, content, { title, ...metadata }),
    
    sendGPTResponse: (bot, chatId, response, title, metadata) => 
        defaultSplitter.sendGPTResponse(bot, chatId, response, title, metadata),
    
    sendAnalysis: (bot, chatId, analysis, title, metadata) => 
        defaultSplitter.sendAnalysis(bot, chatId, analysis, title, metadata),
    
    sendAlert: (bot, chatId, message, title, metadata) => 
        defaultSplitter.sendAlert(bot, chatId, message, title, metadata),
    
    // GPT-5 specific methods
    sendGPT5: (bot, chatId, content, options) => 
        defaultSplitter.sendGPT5(bot, chatId, content, options),
    
    sendGPT5Mini: (bot, chatId, content, options) => 
        defaultSplitter.sendGPT5Mini(bot, chatId, content, options),
    
    sendGPT5Nano: (bot, chatId, content, options) => 
        defaultSplitter.sendGPT5Nano(bot, chatId, content, options),
    
    sendGPT5Chat: (bot, chatId, content, options) => 
        defaultSplitter.sendGPT5Chat(bot, chatId, content, options),
    
    // Utility functions
    getStats: () => defaultSplitter.getStats(),
    getDetailedMetrics: () => defaultSplitter.getDetailedMetrics(),
    debug: (chatId, content, model) => defaultSplitter.debug(chatId, content, model),
    cleanup: () => defaultSplitter.cleanup(),
    resetStats: () => defaultSplitter.resetStats(),
    
    // Utility classes for advanced usage
    TelegramSplitter,
    MessageProcessor,
    SmartChunker,
    DuplicateDetector,
    DeliveryEngine,
    PerformanceMonitor,
    BusinessContext,
    IDGenerator,
    
    // Configuration
    CONFIG,
    GPT5_MODEL_CONFIGS,
    
    // Legacy aliases
    sendClaudeResponse: (bot, chatId, response, title, metadata) => 
        defaultSplitter.send(bot, chatId, response, { title, model: 'analysis', ...metadata }),
    
    sendDualAIResponse: (bot, chatId, response, title, metadata) => 
        defaultSplitter.send(bot, chatId, response, { title, model: 'gpt-5', ...metadata }),
    
    // Message processing utilities
    cleanMessage: (text) => MessageProcessor.process(text),
    splitMessage: (text, model) => SmartChunker.chunk(text, model),
    getCambodiaTime: (includeDate) => BusinessContext.getCambodiaTime(includeDate),
    isBusinessHours: () => BusinessContext.isBusinessHours()
};

console.log('Enhanced Telegram Splitter v3.0 loaded');
console.log(`GPT-5 Models: ${Object.keys(GPT5_MODEL_CONFIGS).length} configurations`);
console.log(`Performance Monitoring: ${CONFIG.PERFORMANCE.METRICS_ENABLED ? 'ENABLED' : 'DISABLED'}`);
console.log(`Smart Chunking: ${CONFIG.PROCESSING.SMART_CHUNKING ? 'ENABLED' : 'DISABLED'}`);
console.log(`Cambodia Time: ${BusinessContext.getCambodiaTime(true)}`);
console.log(`Business Hours: ${BusinessContext.isBusinessHours() ? 'ACTIVE' : 'CLOSED'}`);
console.log('Advanced duplicate detection and state management ready');
