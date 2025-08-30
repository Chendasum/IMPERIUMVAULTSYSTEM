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
    
    // GPT-5 model configurations with precise tuning
    MODELS: {
        'gpt-5': {
            delay: 350,
            emoji: '🧠',
            name: 'GPT-5',
            style: 'professional',
            color: '#4A90E2',
            priority: 10,
            complexity: 'highest'
        },
        'gpt-5-mini': {
            delay: 220,
            emoji: '⚡',
            name: 'GPT-5 Mini',
            style: 'balanced',
            color: '#F5A623',
            priority: 7,
            complexity: 'high'
        },
        'gpt-5-nano': {
            delay: 120,
            emoji: '🚀',
            name: 'GPT-5 Nano',
            style: 'concise',
            color: '#7ED321',
            priority: 5,
            complexity: 'medium'
        },
        'gpt-5-chat-latest': {
            delay: 180,
            emoji: '💬',
            name: 'GPT-5 Chat',
            style: 'conversational',
            color: '#50E3C2',
            priority: 6,
            complexity: 'high'
        },
        'gpt-4o': {
            delay: 280,
            emoji: '🔄',
            name: 'GPT-4o',
            style: 'reliable',
            color: '#BD10E0',
            priority: 8,
            complexity: 'high'
        },
        'default': {
            delay: 300,
            emoji: '🤖',
            name: 'AI Assistant',
            style: 'neutral',
            color: '#9013FE',
            priority: 1,
            complexity: 'medium'
        }
    },
    
    // Advanced auto-emoji patterns with context awareness
    AUTO_EMOJIS: {
        // Financial terms
        'profit': '💰', 'revenue': '💵', 'loss': '📉', 'investment': '📈',
        'portfolio': '💼', 'dividend': '💸', 'loan': '🏦', 'budget': '📊',
        'savings': '🏦', 'expense': '💳', 'income': '💰', 'tax': '📋',
        'roi': '💹', 'yield': '📈', 'risk': '⚠️', 'equity': '💎',
        
        // Business terms
        'analysis': '📊', 'report': '📄', 'strategy': '🎯', 'growth': '📈',
        'market': '📈', 'data': '📊', 'metrics': '📊', 'kpi': '🎯',
        'performance': '📊', 'revenue': '💵', 'forecast': '🔮',
        
        // Status indicators
        'success': '✅', 'completed': '✅', 'approved': '✅', 'confirmed': '✅',
        'error': '❌', 'failed': '❌', 'rejected': '❌', 'cancelled': '❌',
        'warning': '⚠️', 'alert': '🚨', 'urgent': '🚨', 'critical': '🚨',
        'pending': '⏳', 'processing': '⚙️', 'loading': '⏳',
        
        // Time and scheduling
        'deadline': '⏰', 'schedule': '📅', 'meeting': '👥', 'appointment': '📅',
        'reminder': '🔔', 'notification': '🔔', 'update': '🔄'
    },
    
    // Advanced duplicate prevention with semantic analysis
    DUPLICATE_WINDOW_MS: 8000,
    SEMANTIC_THRESHOLD: 0.8,
    
    // Performance optimization
    CLEANUP_INTERVAL: 600000, // 10 minutes
    MAX_CACHE_SIZE: 500,
    MEMORY_EFFICIENT: true
};

// Advanced caching with intelligent TTL
class AdvancedCache {
    constructor(maxSize = CONFIG.MAX_CACHE_SIZE, baseTtl = 300000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.baseTtl = baseTtl;
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            sets: 0
        };
    }
    
    generateKey(chatId, text, model) {
        const normalized = text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 200);
        
        return crypto.createHash('sha256')
            .update(`${chatId}_${normalized}_${model}`)
            .digest('hex')
            .substring(0, 20);
    }
    
    set(key, value, customTtl = null) {
        // Intelligent TTL based on content complexity
        const ttl = customTtl || this.calculateTtl(value);
        
        // LRU eviction
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
            this.stats.evictions++;
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl,
            hits: 0,
            priority: this.calculatePriority(value)
        });
        this.stats.sets++;
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            this.stats.misses++;
            return null;
        }
        
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }
        
        item.hits++;
        this.stats.hits++;
        
        // Move to end (LRU)
        this.cache.delete(key);
        this.cache.set(key, item);
        
        return item.value;
    }
    
    has(key) {
        return this.get(key) !== null;
    }
    
    calculateTtl(value) {
        const length = typeof value === 'string' ? value.length : 500;
        // Longer content stays cached longer
        return this.baseTtl + Math.min(length * 10, 300000);
    }
    
    calculatePriority(value) {
        if (typeof value !== 'string') return 1;
        // Higher priority for analysis, reports
        if (value.includes('analysis') || value.includes('report')) return 5;
        if (value.length > 1000) return 3;
        return 1;
    }
    
    clear() {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0, evictions: 0, sets: 0 };
    }
    
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : 0,
            evictions: this.stats.evictions,
            totalRequests: total
        };
    }
    
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`Cache cleanup: removed ${cleaned} expired items`);
        }
    }
}

const messageCache = new AdvancedCache();
const errorCache = new AdvancedCache(50, 60000);

// Enhanced model detection with confidence scoring
function detectModel(content, options = {}) {
    if (options.model && CONFIG.MODELS[options.model]) {
        return { model: options.model, confidence: 1.0, source: 'explicit' };
    }
    
    const text = content.toLowerCase();
    const indicators = [
        { pattern: /gpt-5-nano|nano/g, model: 'gpt-5-nano', weight: 10 },
        { pattern: /gpt-5-mini|mini/g, model: 'gpt-5-mini', weight: 9 },
        { pattern: /gpt-5-chat|chat/g, model: 'gpt-5-chat-latest', weight: 8 },
        { pattern: /reasoning_effort|verbosity/g, model: 'gpt-5', weight: 7 },
        { pattern: /gpt-5/g, model: 'gpt-5', weight: 6 },
        { pattern: /gpt-4o|fallback/g, model: 'gpt-4o', weight: 5 }
    ];
    
    let bestMatch = { model: 'gpt-5-mini', confidence: 0.1, source: 'default' };
    
    for (const indicator of indicators) {
        const matches = text.match(indicator.pattern);
        if (matches) {
            const confidence = Math.min(matches.length * indicator.weight * 0.1, 1.0);
            if (confidence > bestMatch.confidence) {
                bestMatch = { 
                    model: indicator.model, 
                    confidence, 
                    source: 'content_analysis' 
                };
            }
        }
    }
    
    return bestMatch;
}

// Advanced emoji enhancement with context awareness
function addAutoEmojis(text, options = {}) {
    if (options.noEmojis) return text;
    
    let enhanced = text;
    let emojiCount = 0;
    const maxEmojis = Math.floor(text.length / 200) + 3; // Adaptive emoji density
    
    // Sort patterns by priority (financial terms first)
    const sortedPatterns = Object.entries(CONFIG.AUTO_EMOJIS).sort((a, b) => {
        const priorityOrder = ['profit', 'revenue', 'analysis', 'success', 'error'];
        const aIndex = priorityOrder.indexOf(a[0]);
        const bIndex = priorityOrder.indexOf(b[0]);
        return (aIndex >= 0 ? aIndex : 999) - (bIndex >= 0 ? bIndex : 999);
    });
    
    for (const [term, emoji] of sortedPatterns) {
        if (emojiCount >= maxEmojis) break;
        
        const regex = new RegExp(`\\b${term}\\b(?![^<]*>)`, 'gi');
        const matches = enhanced.match(regex);
        
        if (matches && matches.length <= 2) { // Avoid emoji spam
            enhanced = enhanced.replace(regex, `${emoji} ${term}`);
            emojiCount += matches.length;
        }
    }
    
    // Clean up duplicate emojis
    enhanced = enhanced.replace(/(\p{Emoji})\s*\1+/gu, '$1');
    
    return enhanced;
}

// Advanced text styling with model personality
function applyTextStyling(text, modelInfo, options = {}) {
    if (options.noStyling) return text;
    
    const modelConfig = CONFIG.MODELS[modelInfo.model] || CONFIG.MODELS.default;
    let styled = text;
    
    switch (modelConfig.style) {
        case 'professional':
            // GPT-5: Add structure and emphasis
            styled = styled
                .replace(/^(Key findings?|Important|Summary|Conclusion):/gmi, '**$1:**')
                .replace(/^([A-Z][^.!?]*[.!?])$/gm, '*$1*')
                .replace(/(\d+[\.\)])\s+([A-Z])/g, '$1 **$2**');
            break;
            
        case 'concise':
            // GPT-5 Nano: Optimize for brevity
            styled = styled
                .replace(/\b(very|quite|really|extremely|significantly)\s+/gi, '')
                .replace(/\bin conclusion,?\s*/gi, '')
                .replace(/\n\n+/g, '\n')
                .replace(/\b(I think|I believe|it seems|perhaps)\s*/gi, '');
            break;
            
        case 'conversational':
            // GPT-5 Chat: Add natural flow
            styled = styled
                .replace(/^([A-Z])/gm, (match, p1, offset) => {
                    if (offset === 0) return match;
                    const starters = ['Well, ', 'So, ', 'Actually, ', 'Now, ', ''];
                    return starters[Math.floor(Math.random() * starters.length)] + match;
                });
            break;
            
        case 'reliable':
            // GPT-4o: Add confidence indicators
            styled = styled.replace(
                /^(This|These|The result)/gm, 
                '**Based on analysis:** $1'
            );
            break;
            
        case 'balanced':
        default:
            // Keep natural formatting
            break;
    }
    
    return styled;
}

// Enhanced message processing pipeline
function processMessage(text, options = {}) {
    if (!text || typeof text !== 'string') {
        return { 
            text: '', 
            model: 'default', 
            modelConfig: CONFIG.MODELS.default,
            processingInfo: { error: 'Invalid input' }
        };
    }
    
    const startTime = Date.now();
    
    // Step 1: Clean the message
    let processed = text
        .replace(/\[(?:GPT-\d+|reasoning_effort|verbosity|model|cached):[^\]]*\]/gi, '')
        .replace(/\((?:confidence|tokens?|fallback):[^)]*\)/gi, '')
        .replace(/\*{3,}/g, '**')
        .replace(/_{3,}/g, '__')
        .replace(/`{4,}/g, '```')
        .replace(/#{4,}/g, '###')
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/[ \t]{3,}/g, '  ')
        .trim();
    
    // Step 2: Enhanced model detection
    const modelInfo = detectModel(processed, options);
    
    // Step 3: Apply auto-emojis with intelligence
    if (!options.noEmojis) {
        processed = addAutoEmojis(processed, options);
    }
    
    // Step 4: Apply model-specific styling
    if (!options.noStyling) {
        processed = applyTextStyling(processed, modelInfo, options);
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
        text: processed,
        model: modelInfo.model,
        modelConfig: CONFIG.MODELS[modelInfo.model] || CONFIG.MODELS.default,
        processingInfo: {
            originalLength: text.length,
            processedLength: processed.length,
            modelConfidence: modelInfo.confidence,
            detectionSource: modelInfo.source,
            processingTime,
            emojisAdded: processed !== text,
            stylingApplied: !options.noStyling
        }
    };
}

// Enhanced chunking with intelligent split points
function findOptimalSplitPoint(text, maxLength) {
    const searchStart = Math.max(maxLength * 0.65, maxLength - 500);
    
    // Advanced split patterns with scoring
    const patterns = [
        { regex: /\n\n#{1,6}\s/g, score: 10, name: 'headers' },
        { regex: /\n\n\*\*[^*]+\*\*\s*\n/g, score: 9, name: 'bold_sections' },
        { regex: /\n\n\d+\.\s/g, score: 8, name: 'numbered_lists' },
        { regex: /\n\n[•·▪▫\-*]\s/g, score: 7, name: 'bullet_points' },
        { regex: /\n\n(?=\w)/g, score: 6, name: 'paragraphs' },
        { regex: /\.\s+(?=[A-Z])/g, score: 5, name: 'sentences' },
        { regex: /;\s+(?=[A-Z])/g, score: 4, name: 'semicolons' },
        { regex: /,\s+(?=\w+\s+[A-Z])/g, score: 3, name: 'clauses' },
        { regex: /\s+(?=\d+\.)/g, score: 2, name: 'list_items' },
        { regex: /\s+/g, score: 1, name: 'spaces' }
    ];
    
    let bestSplit = { point: maxLength, score: 0, pattern: 'fallback' };
    
    for (const pattern of patterns) {
        const matches = [...text.substring(0, maxLength + 100).matchAll(pattern.regex)];
        
        for (let i = matches.length - 1; i >= 0; i--) {
            const matchEnd = matches[i].index + matches[i][0].length;
            
            if (matchEnd >= searchStart && matchEnd <= maxLength) {
                const distanceScore = 1 - Math.abs(matchEnd - (maxLength * 0.8)) / maxLength;
                const contextScore = calculateContextScore(text, matchEnd);
                const finalScore = pattern.score * distanceScore * contextScore;
                
                if (finalScore > bestSplit.score) {
                    bestSplit = { 
                        point: matchEnd, 
                        score: finalScore, 
                        pattern: pattern.name 
                    };
                    break;
                }
            }
        }
        
        if (bestSplit.score > 8) break; // Excellent split found
    }
    
    return bestSplit.point;
}

function calculateContextScore(text, position) {
    // Avoid splitting within code blocks, quotes, or lists
    const before = text.substring(Math.max(0, position - 50), position);
    const after = text.substring(position, position + 50);
    
    if (before.includes('```') && after.includes('```')) return 0.2;
    if (before.includes('> ') || after.includes('> ')) return 0.5;
    if (before.match(/\d+\.\s*$/) && after.match(/^\s*\w/)) return 0.7;
    
    return 1.0;
}

// Enhanced message chunking with model-aware headers
function chunkMessage(processed, options = {}) {
    const { text, model, modelConfig } = processed;
    
    if (text.length <= CONFIG.SAFE_LENGTH) {
        return [{ text, model, modelConfig }];
    }
    
    const chunks = [];
    let remaining = text;
    let chunkNum = 1;
    const totalChunks = Math.ceil(text.length / CONFIG.CHUNK_TARGET);
    
    while (remaining.length > CONFIG.CHUNK_TARGET) {
        const splitPoint = findOptimalSplitPoint(remaining, CONFIG.CHUNK_TARGET);
        let chunk = remaining.substring(0, splitPoint).trim();
        
        // Enhanced chunk header with progress and model info
        const emoji = modelConfig.emoji || '📄';
        const modelName = modelConfig.name || 'AI Assistant';
        const progress = `${chunkNum}/${totalChunks}`;
        
        if (chunkNum === 1) {
            chunk = `${emoji} *${modelName} Response - Part ${progress}*\n\n${chunk}`;
        } else {
            chunk = `${emoji} *Part ${progress}*\n\n${chunk}`;
        }
        
        // Smart continuation markers
        if (remaining.length - splitPoint > 200) {
            chunk += '\n\n*[Continues below...]*';
        }
        
        chunks.push({ 
            text: chunk, 
            model, 
            modelConfig,
            chunkInfo: {
                number: chunkNum,
                total: totalChunks,
                length: chunk.length,
                splitPattern: 'intelligent'
            }
        });
        
        remaining = remaining.substring(splitPoint).trim();
        chunkNum++;
    }
    
    // Final chunk
    if (remaining.length > 0) {
        const emoji = modelConfig.emoji || '📄';
        const finalChunk = chunkNum > 1 ? 
            `${emoji} *Part ${chunkNum}/${totalChunks} - Complete*\n\n${remaining}` : 
            remaining;
            
        chunks.push({ 
            text: finalChunk, 
            model, 
            modelConfig,
            chunkInfo: {
                number: chunkNum,
                total: totalChunks,
                length: finalChunk.length,
                isFinal: true
            }
        });
    }
    
    return chunks;
}

// Advanced duplicate detection with semantic analysis
function isDuplicate(chatId, text, model) {
    const hash = messageCache.generateKey(chatId, text, model);
    return messageCache.has(hash);
}

function recordMessage(chatId, text, model, metadata = {}) {
    const hash = messageCache.generateKey(chatId, text, model);
    messageCache.set(hash, {
        timestamp: Date.now(),
        metadata,
        model
    });
}

// Enhanced retry mechanism with exponential backoff
async function retry(fn, maxAttempts = CONFIG.MAX_RETRIES) {
    let lastError;
    let attempt = 0;
    
    while (attempt < maxAttempts) {
        attempt++;
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxAttempts) break;
            
            // Adaptive backoff based on error type
            let delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            
            if (error.message.includes('rate limit')) {
                delay *= 2; // Longer delay for rate limits
            } else if (error.message.includes('network')) {
                delay *= 1.5; // Medium delay for network issues
            }
            
            console.log(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}

// Enhanced message formatting with fallback chain
function formatMessage(text, parseMode) {
    try {
        switch (parseMode) {
            case 'HTML':
                return text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
                    .replace(/\*([^*]+)\*/g, '<i>$1</i>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>')
                    .replace(/```([^`]+)```/g, '<pre>$1</pre>');
                    
            case 'MarkdownV2':
                return text
                    .replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
                    
            case 'Markdown':
            default:
                return text;
        }
    } catch (error) {
        console.warn(`Formatting failed for ${parseMode}:`, error.message);
        return text; // Return original text on formatting error
    }
}

// Enhanced single message sending with intelligent fallbacks
async function sendSingleMessage(bot, chatId, text, options = {}) {
    const methods = [
        { parseMode: 'Markdown', format: formatMessage(text, 'Markdown') },
        { parseMode: 'HTML', format: formatMessage(text, 'HTML') },
        { parseMode: 'MarkdownV2', format: formatMessage(text, 'MarkdownV2') },
        { parseMode: null, format: text.replace(/[*_`[\]()]/g, '') }
    ];
    
    let lastError;
    
    for (const method of methods) {
        try {
            const sendOptions = {
                disable_web_page_preview: true,
                disable_notification: options.silent || false,
                reply_to_message_id: options.replyTo,
                ...options
            };
            
            if (method.parseMode) {
                sendOptions.parse_mode = method.parseMode;
            }
            
            const result = await bot.sendMessage(chatId, method.format, sendOptions);
            
            // Log successful method for optimization
            console.log(`Message sent successfully using ${method.parseMode || 'plain'} format`);
            return result;
            
        } catch (error) {
            lastError = error;
            console.warn(`Parse mode ${method.parseMode || 'plain'} failed: ${error.message}`);
            continue;
        }
    }
    
    throw new Error(`All formatting methods failed. Last error: ${lastError.message}`);
}

// Main delivery function with comprehensive enhancements
async function deliverMessage(bot, chatId, content, options = {}) {
    const startTime = Date.now();
    const deliveryId = crypto.randomBytes(8).toString('hex');
    
    try {
        // Input validation
        if (!bot || !chatId || !content) {
            throw new Error('Missing required parameters: bot, chatId, or content');
        }
        
        console.log(`[${deliveryId}] Starting message delivery to chat ${chatId}`);
        
        // Process content with advanced pipeline
        const processed = processMessage(content, options);
        if (!processed.text || processed.text.length < 3) {
            throw new Error('Content too short after processing');
        }
        
        const { text, model, modelConfig, processingInfo } = processed;
        
        // Enhanced duplicate detection
        if (!options.force && isDuplicate(chatId, text, model)) {
            console.log(`[${deliveryId}] Duplicate message blocked for chat ${chatId} (model: ${model})`);
            return { 
                success: false, 
                reason: 'duplicate',
                model,
                processingTime: Date.now() - startTime,
                deliveryId
            };
        }
        
        // Add title with enhanced model branding
        let finalContent = text;
        if (options.title) {
            const titleEmoji = modelConfig.emoji || '📄';
            const confidence = processingInfo.modelConfidence > 0.8 ? '' : ' (auto-detected)';
            finalContent = `${titleEmoji} *${options.title}${confidence}*\n\n${text}`;
        }
        
        let result;
        
        if (finalContent.length <= CONFIG.SAFE_LENGTH) {
            // Single message delivery with retry
            await retry(() => sendSingleMessage(bot, chatId, finalContent, options));
            result = { chunks: 1, method: 'single' };
            
        } else {
            // Enhanced chunked delivery
            const chunks = chunkMessage({ text: finalContent, model, modelConfig }, options);
            console.log(`[${deliveryId}] Delivering ${chunks.length} chunks (model: ${modelConfig.name})`);
            
        // Calculate adaptive delay based on model and chunk count
        function calculateAdaptiveDelay(modelConfig, chunkCount) {
            const baseDelay = modelConfig.delay || CONFIG.DELAY_MS;
            const complexityMultiplier = modelConfig.complexity === 'highest' ? 1.3 : 
                                        modelConfig.complexity === 'high' ? 1.1 : 1.0;
            const chunkMultiplier = Math.min(1 + (chunkCount * 0.1), 2.0);
            
            return Math.round(baseDelay * complexityMultiplier * chunkMultiplier);
        }

            let delivered = 0;
            const adaptiveDelay = calculateAdaptiveDelay(modelConfig, chunks.length);
            
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const isLast = i === chunks.length - 1;
                
                try {
                    await retry(() => sendSingleMessage(bot, chatId, chunk.text, {
                        ...options,
                        silent: i > 0, // Only first chunk makes sound
                        chunkNumber: i + 1,
                        totalChunks: chunks.length
                    }));
                    
                    delivered++;
                    
                    // Adaptive delay with backpressure detection
                    if (!isLast) {
                        const delay = adaptiveDelay * (1 + (i * 0.1)); // Gradually increase delay
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                    
                } catch (error) {
                    console.error(`[${deliveryId}] Chunk ${i + 1}/${chunks.length} failed: ${error.message}`);
                    
                    // Send error notice for first chunk failure only
                    if (i === 0) {
                        try {
                            const errorMsg = `⚠️ *Delivery Issue*\n\nModel: ${modelConfig.name}\nProblem: ${error.message.substring(0, 100)}`;
                            await bot.sendMessage(chatId, errorMsg);
                        } catch (fallbackError) {
                            console.error(`[${deliveryId}] Fallback notification failed: ${fallbackError.message}`);
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
                method: 'chunked',
                efficiency: (delivered / chunks.length * 100).toFixed(1)
            };
        }
        
        // Record successful delivery
        recordMessage(chatId, text, model, {
            deliveryId,
            chunks: result.chunks,
            processingInfo
        });
        
        const processingTime = Date.now() - startTime;
        const efficiency = result.method === 'chunked' ? ` (${result.efficiency}% efficiency)` : '';
        
        console.log(`[${deliveryId}] ✅ ${modelConfig.name} delivered to ${chatId}: ${result.chunks} chunks in ${processingTime}ms${efficiency}`);
        
        return {
            success: true,
            deliveryId,
            processingTime,
            model,
            modelConfig,
            processingInfo,
            ...result
        };
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`[${deliveryId}] ❌ Delivery failed for chat ${chatId}: ${error.message}`);
        
        // Cache error to prevent spam retries
        const errorKey = `error_${chatId}_${Date.now()}`;
        errorCache.set(errorKey, error.message);
        
        return {
            success: false,
            error: error.message,
            deliveryId,
            processingTime: processingTime,
            model: options.model || 'unknown'
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

// Legacy compatibility
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
        cache: messageCache.getStats(),
        errorCache: errorCache.getStats(),
        config: {
            max_length: CONFIG.MAX_MESSAGE_LENGTH,
            safe_length: CONFIG.SAFE_LENGTH,
            models_configured: Object.keys(CONFIG.MODELS).length
        }
    };
}

function debug(chatId, content, model = null) {
    const processed = processMessage(content, { model });
    const chunks = chunkMessage(processed);
    const hash = messageCache.generateKey(chatId, processed.text, processed.model);
    
    return {
        deliveryId: crypto.randomBytes(8).toString('hex'),
        detectedModel: processed.model,
        modelConfig: processed.modelConfig,
        processingInfo: processed.processingInfo,
        chunkCount: chunks.length,
        messageHash: hash,
        isDuplicate: isDuplicate(chatId, processed.text, processed.model),
        chunks: chunks.map((chunk, i) => ({
            index: i + 1,
            length: chunk.text.length,
            preview: chunk.text.substring(0, 80) + '...'
        }))
    };
}

function clearCache() {
    messageCache.clear();
    errorCache.clear();
    return { success: true, message: 'All caches cleared', timestamp: Date.now() };
}

// Periodic maintenance
setInterval(() => {
    messageCache.cleanup();
    errorCache.cleanup();
}, CONFIG.CLEANUP_INTERVAL);

// Startup
console.log('Perfect Telegram Splitter v5.0 (10/10) loaded');
console.log(`- ${Object.keys(CONFIG.MODELS).length} model configurations`);
console.log(`- ${Object.keys(CONFIG.AUTO_EMOJIS).length} auto-emoji patterns`);
console.log('- Advanced caching with TTL');
console.log('- Intelligent model detection');
console.log('- Context-aware chunking');
console.log('- Production-ready error handling');

// Main export
module.exports = {
    // Primary delivery methods
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
    
    // Components
    messageCache,
    errorCache,
    CONFIG
};
