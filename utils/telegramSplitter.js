// utils/telegramSplitter.js - Enhanced Cambodia Financial System Message Handler
// Advanced message delivery system with professional formatting and robust error handling
// Designed for Cambodia private lending fund operations with GPT-5 integration

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Core configuration for Telegram message handling
const TELEGRAM_CONFIG = {
    MAX_MESSAGE_LENGTH: 4096,
    SAFE_MESSAGE_LENGTH: 4000,
    OPTIMAL_CHUNK_SIZE: 3800,
    FAST_DELAY: 250,
    STANDARD_DELAY: 450,
    SLOW_DELAY: 650,
    DUPLICATE_WINDOW: 3000,
    MULTI_MODEL_WINDOW: 30000,
    CLEANUP_INTERVAL: 300000,
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    MAX_RESPONSES_PER_QUERY: 1,
    CONTEXT_WINDOW: 1800000, // 30 minutes
    LOG_RETENTION_HOURS: 24,
    PERFORMANCE_MONITORING: true,
    AUTO_FALLBACK_MODE: true,
    ENHANCED_ERROR_REPORTING: true
};

// Message types with comprehensive formatting options
const MESSAGE_TYPES = {
    'nano': { 
        emoji: '⚡', 
        delay: 150, 
        description: 'GPT-5 Nano', 
        priority: 2,
        color: '#FFD700',
        category: 'speed'
    },
    'mini': { 
        emoji: '🔥', 
        delay: 250, 
        description: 'GPT-5 Mini', 
        priority: 2,
        color: '#FF6B35',
        category: 'balanced'
    },
    'full': { 
        emoji: '🧠', 
        delay: 450, 
        description: 'GPT-5 Full', 
        priority: 1,
        color: '#4ECDC4',
        category: 'comprehensive'
    },
    'gpt-5': { 
        emoji: '🤖', 
        delay: 450, 
        description: 'GPT-5', 
        priority: 3,
        color: '#45B7D1',
        category: 'ai'
    },
    'chat': { 
        emoji: '💬', 
        delay: 250, 
        description: 'Chat', 
        priority: 1,
        color: '#98D8C8',
        category: 'conversational'
    },
    'analysis': { 
        emoji: '📊', 
        delay: 450, 
        description: 'Analysis', 
        priority: 3,
        color: '#F06292',
        category: 'analytical'
    },
    'error': { 
        emoji: '❌', 
        delay: 100, 
        description: 'Error', 
        priority: 0,
        color: '#F44336',
        category: 'system'
    },
    'credit': { 
        emoji: '🏦', 
        delay: 350, 
        description: 'Credit Analysis', 
        priority: 2,
        color: '#2196F3',
        category: 'financial'
    },
    'risk': { 
        emoji: '⚠️', 
        delay: 350, 
        description: 'Risk Assessment', 
        priority: 2,
        color: '#FF9800',
        category: 'financial'
    },
    'recovery': { 
        emoji: '💰', 
        delay: 350, 
        description: 'Loan Recovery', 
        priority: 2,
        color: '#4CAF50',
        category: 'financial'
    },
    'compliance': { 
        emoji: '🔍', 
        delay: 350, 
        description: 'Due Diligence', 
        priority: 2,
        color: '#9C27B0',
        category: 'legal'
    },
    'portfolio': { 
        emoji: '📈', 
        delay: 400, 
        description: 'Portfolio Management', 
        priority: 2,
        color: '#00BCD4',
        category: 'investment'
    },
    'market': { 
        emoji: '🌐', 
        delay: 400, 
        description: 'Market Analysis', 
        priority: 2,
        color: '#607D8B',
        category: 'research'
    },
    'legal': { 
        emoji: '⚖️', 
        delay: 400, 
        description: 'Legal Analysis', 
        priority: 2,
        color: '#795548',
        category: 'legal'
    }
};

// Advanced state management
const requestHistory = new Map();
const activeRequests = new Map();
const responseCounter = new Map();
const performanceMetrics = new Map();
const errorLog = new Map();
const deliveryStats = {
    totalMessages: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    chunkedMessages: 0,
    averageProcessingTime: 0,
    lastResetTime: Date.now()
};

// Cambodia specific formatting helpers
const CAMBODIA_FORMATTING = {
    currency: {
        usd: (amount) => `$${amount.toLocaleString()} USD`,
        khr: (amount) => `${amount.toLocaleString()} KHR`,
        format: (amount, currency = 'USD') => currency === 'USD' ? 
            CAMBODIA_FORMATTING.currency.usd(amount) : 
            CAMBODIA_FORMATTING.currency.khr(amount)
    },
    timeZone: 'Asia/Phnom_Penh',
    businessHours: { start: 8, end: 17 },
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    holidays: ['2025-01-01', '2025-04-13', '2025-04-14', '2025-04-15'] // Sample holidays
};

// Advanced ID generation with collision prevention
function generateAdvancedRequestId(chatId, message, modelType, timestamp = Date.now()) {
    const baseContent = `${chatId}_${message.substring(0, 200).replace(/\s+/g, ' ').trim()}`;
    const modelNormalized = normalizeModelType(modelType);
    const hash = crypto.createHash('sha256').update(`${baseContent}_${modelNormalized}_${timestamp}`).digest('hex');
    return `${hash.substring(0, 16)}_${modelNormalized}`;
}

function generateQueryId(chatId, cleanedMessage) {
    const queryContent = `${chatId}_${cleanedMessage.substring(0, 300).replace(/\s+/g, ' ').trim()}`;
    return crypto.createHash('md5').update(queryContent).digest('hex').substring(0, 14);
}

function normalizeModelType(modelType) {
    if (!modelType) return 'analysis';
    const normalized = modelType.toLowerCase().replace(/[^a-z0-9]/g, '');
    return MESSAGE_TYPES[normalized] ? normalized : 'analysis';
}

// Enhanced message cleaning with financial context preservation
function cleanMessage(text) {
    if (!text || typeof text !== 'string') return '';
    
    let cleanedText = text
        // Remove GPT-5 specific metadata
        .replace(/\[reasoning_effort:\s*\w+\]/gi, '')
        .replace(/\[verbosity:\s*\w+\]/gi, '')
        .replace(/\[model:\s*gpt-5[^\]]*\]/gi, '')
        .replace(/\[gpt-5[^\]]*\]/gi, '')
        .replace(/\(confidence:\s*\d+%\)/gi, '')
        .replace(/\(model:\s*gpt-5[^\)]*\)/gi, '')
        
        // Preserve financial formatting
        .replace(/\$([0-9,]+(?:\.[0-9]{2})?)/g, '💵$1')
        .replace(/([0-9]+(?:\.[0-9]{1,2})?)%/g, '📊$1%')
        
        // Clean markdown safely for Telegram
        .replace(/\*\*(.*?)\*\*/g, '*$1*')
        .replace(/```[\w]*\n?([\s\S]*?)\n?```/g, '`$1`')
        .replace(/#{1,6}\s*(.*?)$/gm, '*$1*')
        
        // Restore financial symbols
        .replace(/💵/g, '$')
        .replace(/📊/g, '')
        
        // Clean excessive whitespace
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/^\n+|\n+$/g, '')
        .replace(/\s{3,}/g, '  ')
        .trim();
    
    // Ensure minimum viable content
    if (cleanedText.length < 5) {
        return text.trim();
    }
    
    return cleanedText;
}

// Advanced message splitting with context awareness
function splitMessage(message, modelType = 'analysis', preserveContext = true) {
    if (!message || message.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
        return [message];
    }
    
    const chunks = [];
    let remaining = message;
    let partNumber = 1;
    const typeConfig = MESSAGE_TYPES[normalizeModelType(modelType)] || MESSAGE_TYPES.analysis;
    
    // Context preservation headers
    const contextHeaders = preserveContext ? extractContextHeaders(message) : null;
    
    while (remaining.length > TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE) {
        let splitPoint = TELEGRAM_CONFIG.OPTIMAL_CHUNK_SIZE - 150; // More headroom for headers
        
        // Sophisticated split point detection
        const splitPatterns = [
            { pattern: /\n\n#{1,6}\s/g, priority: 1, description: 'headers' },
            { pattern: /\n\n\d+\.\s/g, priority: 2, description: 'numbered lists' },
            { pattern: /\n\n[•·▪▫]\s/g, priority: 3, description: 'bullet points' },
            { pattern: /\n\n(?=\w)/g, priority: 4, description: 'paragraphs' },
            { pattern: /\.\s+(?=[A-Z])/g, priority: 5, description: 'sentences' },
            { pattern: /;\s+/g, priority: 6, description: 'semicolons' },
            { pattern: /,\s+(?=\w+\s+[A-Z])/g, priority: 7, description: 'major commas' },
            { pattern: /\s+(?=\d+\.)/g, priority: 8, description: 'list items' }
        ];
        
        let bestSplitPoint = null;
        let bestPriority = 999;
        
        for (const { pattern, priority } of splitPatterns) {
            const matches = [...remaining.matchAll(pattern)];
            for (let i = matches.length - 1; i >= 0; i--) {
                const matchEnd = matches[i].index + matches[i][0].length;
                if (matchEnd >= splitPoint * 0.6 && matchEnd <= splitPoint && priority < bestPriority) {
                    bestSplitPoint = matchEnd;
                    bestPriority = priority;
                    break;
                }
            }
            if (bestSplitPoint) break;
        }
        
        splitPoint = bestSplitPoint || splitPoint;
        let chunk = remaining.substring(0, splitPoint).trim();
        
        // Add enhanced part header with context
        const partHeader = generatePartHeader(partNumber, typeConfig, contextHeaders);
        chunk = `${partHeader}\n\n${chunk}`;
        
        // Add continuation indicator if needed
        if (remaining.length > splitPoint + 100) {
            chunk += '\n\n*[Continued...]*';
        }
        
        chunks.push(chunk);
        remaining = remaining.substring(splitPoint).trim();
        partNumber++;
    }
    
    // Handle final chunk
    if (remaining.length > 0) {
        let finalChunk = remaining;
        
        if (partNumber > 1) {
            const finalHeader = generatePartHeader(partNumber, typeConfig, contextHeaders, true);
            finalChunk = `${finalHeader}\n\n${remaining}`;
        }
        
        chunks.push(finalChunk);
    }
    
    return chunks;
}

// Generate sophisticated part headers
function generatePartHeader(partNumber, typeConfig, contextHeaders, isFinal = false) {
    const partLabel = isFinal ? `Part ${partNumber} - Final` : `Part ${partNumber}`;
    const emoji = typeConfig.emoji || '📄';
    const timestamp = getCambodiaTime(true);
    
    let header = `${emoji} *${partLabel}*`;
    
    if (contextHeaders && contextHeaders.title) {
        header += ` | ${contextHeaders.title}`;
    }
    
    if (TELEGRAM_CONFIG.PERFORMANCE_MONITORING && partNumber === 1) {
        header += `\n⏱️ ${timestamp}`;
    }
    
    return header;
}

// Extract context from message for header generation
function extractContextHeaders(message) {
    const titleMatch = message.match(/^\*\*([^*]+)\*\*/) || message.match(/^#\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1] : null;
    
    return title ? { title: title.substring(0, 50) } : null;
}

// Enhanced single message sending with robust error handling
async function sendSingleMessage(bot, chatId, message, retryCount = 0, metadata = {}) {
    const startTime = Date.now();
    
    try {
        // Pre-flight validation
        if (!message || message.trim().length === 0) {
            throw new Error('Empty message content');
        }
        
        if (message.length > TELEGRAM_CONFIG.MAX_MESSAGE_LENGTH) {
            throw new Error(`Message too long: ${message.length} chars`);
        }
        
        // Primary delivery attempt with Markdown
        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            disable_notification: metadata.silent || false
        });
        
        // Record successful delivery
        recordDeliveryMetrics(startTime, true, message.length, 'markdown');
        return true;
        
    } catch (markdownError) {
        console.log(`⚠️ Markdown parsing failed: ${markdownError.message}`);
        
        try {
            // Fallback to HTML parsing
            const htmlMessage = convertToHTML(message);
            await bot.sendMessage(chatId, htmlMessage, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                disable_notification: metadata.silent || false
            });
            
            recordDeliveryMetrics(startTime, true, message.length, 'html');
            return true;
            
        } catch (htmlError) {
            console.log(`⚠️ HTML parsing failed: ${htmlError.message}`);
            
            try {
                // Final fallback to plain text
                const plainMessage = stripAllFormatting(message);
                await bot.sendMessage(chatId, plainMessage, {
                    disable_web_page_preview: true,
                    disable_notification: metadata.silent || false
                });
                
                recordDeliveryMetrics(startTime, true, message.length, 'plain');
                return true;
                
            } catch (plainError) {
                console.error(`❌ All delivery methods failed (attempt ${retryCount + 1}):`, plainError.message);
                
                // Retry logic for network issues
                if (retryCount < TELEGRAM_CONFIG.MAX_RETRY_ATTEMPTS && isRetryableError(plainError)) {
                    const delayMs = TELEGRAM_CONFIG.RETRY_DELAY_MS * (retryCount + 1);
                    console.log(`🔄 Retrying in ${delayMs}ms...`);
                    
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    return sendSingleMessage(bot, chatId, message, retryCount + 1, metadata);
                }
                
                // Record failed delivery
                recordDeliveryMetrics(startTime, false, message.length, 'failed');
                recordError(chatId, plainError.message, 'delivery_failure');
                return false;
            }
        }
    }
}

// Convert Markdown to HTML
function convertToHTML(message) {
    return message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
        .replace(/\*([^*]+)\*/g, '<i>$1</i>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/^#{1,6}\s*(.*)$/gm, '<b>$1</b>')
        .replace(/\n/g, '\n');
}

// Strip all formatting for plain text fallback
function stripAllFormatting(message) {
    return message
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/#{1,6}\s*/g, '')
        .replace(/[*_`~\[\]]/g, '');
}

// Check if error is retryable
function isRetryableError(error) {
    const retryableMessages = [
        'network',
        'timeout',
        'connection',
        'rate limit',
        'too many requests',
        'server error',
        'internal error'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return retryableMessages.some(msg => errorMessage.includes(msg));
}

// Enhanced chunked message sending
async function sendChunkedMessage(bot, chatId, message, delay = 250, modelType = 'analysis', metadata = {}) {
    const startTime = Date.now();
    const chunks = splitMessage(message, modelType, true);
    let successCount = 0;
    let totalChars = 0;
    
    console.log(`📦 Sending ${chunks.length} chunks for ${modelType} model`);
    deliveryStats.chunkedMessages++;
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isLast = i === chunks.length - 1;
        totalChars += chunk.length;
        
        console.log(`📤 Chunk ${i + 1}/${chunks.length}: ${chunk.length} chars`);
        
        // Add progressive delay for better UX
        const chunkMetadata = {
            ...metadata,
            chunkIndex: i,
            totalChunks: chunks.length,
            silent: i > 0 // Don't notify for subsequent chunks
        };
        
        const sent = await sendSingleMessage(bot, chatId, chunk, 0, chunkMetadata);
        
        if (sent) {
            successCount++;
            console.log(`✅ Chunk ${i + 1}/${chunks.length} delivered`);
        } else {
            console.log(`❌ Chunk ${i + 1}/${chunks.length} failed`);
        }
        
        // Adaptive delay based on success rate and chunk size
        if (!isLast && sent) {
            const adaptiveDelay = calculateAdaptiveDelay(delay, successCount, i + 1, chunk.length);
            await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
        }
    }
    
    const processingTime = Date.now() - startTime;
    const successRate = (successCount / chunks.length) * 100;
    
    console.log(`📊 Chunked delivery complete: ${successCount}/${chunks.length} (${successRate.toFixed(1)}%) in ${processingTime}ms`);
    
    // Record chunked delivery metrics
    recordChunkedDeliveryMetrics(processingTime, successCount, chunks.length, totalChars, modelType);
    
    return successCount > 0;
}

// Calculate adaptive delay for chunked messages
function calculateAdaptiveDelay(baseDelay, successCount, attemptCount, chunkSize) {
    const successRate = successCount / attemptCount;
    const sizeMultiplier = Math.min(1.5, chunkSize / 2000);
    const successMultiplier = successRate < 0.8 ? 1.5 : 1.0;
    
    return Math.round(baseDelay * sizeMultiplier * successMultiplier);
}

// Enhanced duplicate detection
function isActualDuplicate(requestId, queryId, modelType, message) {
    const now = Date.now();
    
    // Check exact request duplicate
    const lastRequest = requestHistory.get(requestId);
    if (lastRequest && (now - lastRequest.timestamp) < TELEGRAM_CONFIG.DUPLICATE_WINDOW) {
        console.log(`🚫 Exact duplicate blocked: ${requestId}`);
        return true;
    }
    
    // Check query-level duplicates
    const currentCount = responseCounter.get(queryId) || 0;
    if (currentCount >= TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY) {
        console.log(`🛑 Query limit reached: ${queryId} (${currentCount}/${TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY})`);
        return true;
    }
    
    // Check for same model within window
    const sameModelRecent = Array.from(requestHistory.values()).some(data =>
        data.queryId === queryId &&
        data.modelType === normalizeModelType(modelType) &&
        (now - data.timestamp) < TELEGRAM_CONFIG.MULTI_MODEL_WINDOW
    );
    
    if (sameModelRecent) {
        console.log(`🔄 Same model recently sent for query ${queryId}: ${modelType}`);
        return true;
    }
    
    return false;
}

// Record request with enhanced metadata
function recordRequest(requestId, queryId, modelType, messageLength, processingTime) {
    const now = Date.now();
    
    requestHistory.set(requestId, {
        timestamp: now,
        queryId: queryId,
        modelType: normalizeModelType(modelType),
        messageLength: messageLength,
        processingTime: processingTime
    });
    
    const current = responseCounter.get(queryId) || 0;
    responseCounter.set(queryId, current + 1);
    
    console.log(`📝 Request recorded: ${requestId} (Query: ${queryId}, Model: ${modelType}, Length: ${messageLength}, Time: ${processingTime}ms)`);
}

// Cambodia time helpers
function getCambodiaTime(includeDate = false) {
    try {
        const now = new Date();
        const options = {
            timeZone: CAMBODIA_FORMATTING.timeZone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (includeDate) {
            options.year = 'numeric';
            options.month = '2-digit';
            options.day = '2-digit';
        }
        
        const timeString = now.toLocaleString('en-US', options);
        return includeDate ? `${timeString} Cambodia` : `${timeString} Cambodia`;
    } catch (error) {
        return new Date().toISOString();
    }
}

function isBusinessHours() {
    const now = new Date();
    const cambodiaTime = new Date(now.toLocaleString('en-US', { timeZone: CAMBODIA_FORMATTING.timeZone }));
    const hour = cambodiaTime.getHours();
    const day = cambodiaTime.getDay();
    
    return CAMBODIA_FORMATTING.workingDays.includes(day) && 
           hour >= CAMBODIA_FORMATTING.businessHours.start && 
           hour < CAMBODIA_FORMATTING.businessHours.end;
}

// Performance and error tracking
function recordDeliveryMetrics(startTime, success, messageLength, method) {
    const processingTime = Date.now() - startTime;
    
    deliveryStats.totalMessages++;
    if (success) {
        deliveryStats.successfulDeliveries++;
    } else {
        deliveryStats.failedDeliveries++;
    }
    
    // Update average processing time
    const totalTime = (deliveryStats.averageProcessingTime * (deliveryStats.totalMessages - 1)) + processingTime;
    deliveryStats.averageProcessingTime = totalTime / deliveryStats.totalMessages;
    
    // Record method-specific metrics
    const methodKey = `${method}_deliveries`;
    if (!performanceMetrics.has(methodKey)) {
        performanceMetrics.set(methodKey, 0);
    }
    performanceMetrics.set(methodKey, performanceMetrics.get(methodKey) + 1);
}

function recordChunkedDeliveryMetrics(processingTime, successCount, totalChunks, totalChars, modelType) {
    const metricsKey = `chunked_${modelType}`;
    const existingMetrics = performanceMetrics.get(metricsKey) || {
        count: 0,
        totalTime: 0,
        totalChunks: 0,
        totalChars: 0,
        successfulChunks: 0
    };
    
    existingMetrics.count++;
    existingMetrics.totalTime += processingTime;
    existingMetrics.totalChunks += totalChunks;
    existingMetrics.totalChars += totalChars;
    existingMetrics.successfulChunks += successCount;
    
    performanceMetrics.set(metricsKey, existingMetrics);
}

function recordError(chatId, errorMessage, errorType) {
    const errorKey = `${chatId}_${errorType}_${Date.now()}`;
    errorLog.set(errorKey, {
        chatId: chatId,
        message: errorMessage,
        type: errorType,
        timestamp: Date.now(),
        cambodiaTime: getCambodiaTime(true)
    });
}

// Main delivery function with comprehensive features
async function sendGPT5Message(bot, chatId, message, title = null, metadata = {}) {
    const startTime = Date.now();
    const modelType = normalizeModelType(metadata.modelUsed || metadata.aiUsed || 'analysis');
    
    try {
        console.log(`📱 Processing message for chat ${chatId}, Model: ${modelType}`);
        
        // Enhanced message validation
        if (!message || typeof message !== 'string') {
            throw new Error('Invalid message content');
        }
        
        // Clean and validate message
        let cleanedMessage = cleanMessage(message);
        
        if (!cleanedMessage || cleanedMessage.length < 5) {
            console.log('⚠️ Message too short or empty after cleaning');
            return false;
        }
        
        // Generate IDs for tracking
        const requestId = generateAdvancedRequestId(chatId, cleanedMessage, modelType, startTime);
        const queryId = generateQueryId(chatId, cleanedMessage);
        
        console.log(`🔍 Query ID: ${queryId}, Request ID: ${requestId}`);
        
        // Enhanced duplicate detection
        if (isActualDuplicate(requestId, queryId, modelType, cleanedMessage)) {
            return false;
        }
        
        // Mark request as active
        activeRequests.set(requestId, startTime);
        
        // Prepare message with title and formatting
        const typeConfig = MESSAGE_TYPES[modelType] || MESSAGE_TYPES.analysis;
        let finalMessage = cleanedMessage;
        
        if (title) {
            const responseCount = responseCounter.get(queryId) || 0;
            const titleEmoji = typeConfig.emoji || '📊';
            const enhancedTitle = `${titleEmoji} *${title}*`;
            
            // Add model info for subsequent responses
            if (responseCount > 0 && TELEGRAM_CONFIG.ENHANCED_ERROR_REPORTING) {
                finalMessage = `${enhancedTitle} (${typeConfig.description})\n\n${cleanedMessage}`;
            } else {
                finalMessage = `${enhancedTitle}\n\n${cleanedMessage}`;
            }
        }
        
        // Add business context if relevant
        if (metadata.addBusinessContext && modelType in ['credit', 'risk', 'compliance', 'portfolio']) {
            finalMessage += `\n\n*Analysis Time: ${getCambodiaTime(true)}*`;
            if (!isBusinessHours()) {
                finalMessage += '\n*Note: Outside business hours - responses may be delayed*';
            }
        }
        
        // Choose delivery method
        const delay = typeConfig.delay || TELEGRAM_CONFIG.STANDARD_DELAY;
        let deliverySuccess = false;
        
        if (finalMessage.length <= TELEGRAM_CONFIG.SAFE_MESSAGE_LENGTH) {
            deliverySuccess = await sendSingleMessage(bot, chatId, finalMessage, 0, metadata);
        } else {
            deliverySuccess = await sendChunkedMessage(bot, chatId, finalMessage, delay, modelType, metadata);
        }
        
        // Record request if successful
        if (deliverySuccess) {
            const processingTime = Date.now() - startTime;
            recordRequest(requestId, queryId, modelType, finalMessage.length, processingTime);
        }
        
        // Cleanup active request
        activeRequests.delete(requestId);
        
        const status = deliverySuccess ? '✅ SUCCESS' : '❌ FAILED';
        const processingTime = Date.now() - startTime;
        console.log(`${status} Message delivery for ${modelType}: ${requestId} (${processingTime}ms)`);
        
        return deliverySuccess;
        
    } catch (error) {
        console.error('❌ Send error:', error.message);
        activeRequests.delete(generateAdvancedRequestId(chatId, message, modelType, startTime));
        recordError(chatId, error.message, 'send_message_error');
        
        // Enhanced fallback with error context
        try {
            const fallbackMsg = generateErrorFallback(error, modelType, metadata);
            await bot.sendMessage(chatId, fallbackMsg);
            return true;
        } catch (fallbackError) {
            console.error('❌ Fallback delivery failed:', fallbackError.message);
            recordError(chatId, fallbackError.message, 'fallback_failure');
            return false;
        }
    }
}

// Generate contextual error fallback messages
function generateErrorFallback(error, modelType, metadata) {
    const typeConfig = MESSAGE_TYPES[modelType] || MESSAGE_TYPES.error;
    const cambodiaTime = getCambodiaTime(true);
    
    let fallbackMessage = `${typeConfig.emoji} *Delivery Issue*\n\n`;
    
    if (error.message.includes('network') || error.message.includes('timeout')) {
        fallbackMessage += 'Network connectivity issue. Please try again in a moment.';
    } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        fallbackMessage += 'System temporarily busy. Your request will be processed shortly.';
    } else if (error.message.includes('message too long')) {
        fallbackMessage += 'Response was too large for delivery. Processing in smaller segments...';
    } else {
        fallbackMessage += `Technical issue occurred: ${error.message.substring(0, 100)}`;
    }
    
    fallbackMessage += `\n\nModel: ${typeConfig.description}`;
    fallbackMessage += `\nTime: ${cambodiaTime}`;
    
    if (metadata.requestId) {
        fallbackMessage += `\nRef: ${metadata.requestId.substring(0, 8)}`;
    }
    
    return fallbackMessage;
}

// Legacy compatibility functions with enhanced features
async function sendGPTResponse(bot, chatId, response, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        modelUsed: 'gpt-5',
        addBusinessContext: true
    });
}

async function sendClaudeResponse(bot, chatId, response, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        modelUsed: 'analysis',
        addBusinessContext: false
    });
}

async function sendDualAIResponse(bot, chatId, response, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, response, title, {
        ...metadata,
        modelUsed: 'full',
        addBusinessContext: true
    });
}

async function sendAnalysis(bot, chatId, analysis, title, metadata = {}) {
    return await sendGPT5Message(bot, chatId, analysis, title, {
        ...metadata,
        modelUsed: 'analysis',
        addBusinessContext: true
    });
}

async function sendAlert(bot, chatId, alertMessage, title = 'System Alert', metadata = {}) {
    const cambodiaTime = getCambodiaTime(true);
    const alertContent = `🚨 *${title}*\n\n${alertMessage}\n\n⏰ ${cambodiaTime}`;
    
    return await sendGPT5Message(bot, chatId, alertContent, null, {
        ...metadata,
        modelUsed: 'error',
        addBusinessContext: false,
        priority: 'high'
    });
}

// Enhanced statistics and monitoring
function getStats() {
    const now = Date.now();
    let activeRequestsCount = 0;
    let recentRequestsCount = 0;
    let recentErrorsCount = 0;
    
    // Count active requests
    for (const [requestId, timestamp] of activeRequests.entries()) {
        if (now - timestamp < 300000) { // 5 minutes
            activeRequestsCount++;
        }
    }
    
    // Count recent requests and errors
    for (const [requestId, data] of requestHistory.entries()) {
        if (now - data.timestamp < 300000) { // 5 minutes
            recentRequestsCount++;
        }
    }
    
    for (const [errorKey, data] of errorLog.entries()) {
        if (now - data.timestamp < 300000) { // 5 minutes
            recentErrorsCount++;
        }
    }
    
    const successRate = deliveryStats.totalMessages > 0 ? 
        (deliveryStats.successfulDeliveries / deliveryStats.totalMessages * 100).toFixed(1) : 0;
    
    const uptimeHours = ((now - deliveryStats.lastResetTime) / (1000 * 60 * 60)).toFixed(1);
    
    return {
        status: 'ENHANCED CAMBODIA FINANCIAL SYSTEM',
        version: '2.0.1',
        uptime: `${uptimeHours} hours`,
        activeRequests: activeRequestsCount,
        recentRequests: recentRequestsCount,
        recentErrors: recentErrorsCount,
        totalMessages: deliveryStats.totalMessages,
        successfulDeliveries: deliveryStats.successfulDeliveries,
        failedDeliveries: deliveryStats.failedDeliveries,
        successRate: `${successRate}%`,
        chunkedMessages: deliveryStats.chunkedMessages,
        averageProcessingTime: `${Math.round(deliveryStats.averageProcessingTime)}ms`,
        cambodiaTime: getCambodiaTime(true),
        businessHours: isBusinessHours(),
        duplicateWindow: TELEGRAM_CONFIG.DUPLICATE_WINDOW,
        multiModelWindow: TELEGRAM_CONFIG.MULTI_MODEL_WINDOW,
        maxResponsesPerQuery: TELEGRAM_CONFIG.MAX_RESPONSES_PER_QUERY,
        supportedModelTypes: Object.keys(MESSAGE_TYPES).length
    };
}

function getPerformanceMetrics() {
    const metrics = {};
    
    for (const [key, value] of performanceMetrics.entries()) {
        if (typeof value === 'object') {
            metrics[key] = {
                ...value,
                avgProcessingTime: value.count > 0 ? Math.round(value.totalTime / value.count) : 0,
                avgChunkSize: value.totalChunks > 0 ? Math.round(value.totalChars / value.totalChunks) : 0,
                chunkSuccessRate: value.totalChunks > 0 ? 
                    ((value.successfulChunks / value.totalChunks) * 100).toFixed(1) : 0
            };
        } else {
            metrics[key] = value;
        }
    }
    
    return metrics;
}

function getErrorAnalytics() {
    const now = Date.now();
    const recentErrors = [];
    const errorTypes = {};
    
    for (const [errorKey, errorData] of errorLog.entries()) {
        if (now - errorData.timestamp < 3600000) { // Last hour
            recentErrors.push({
                type: errorData.type,
                message: errorData.message.substring(0, 100),
                time: errorData.cambodiaTime,
                chatId: errorData.chatId
            });
            
            errorTypes[errorData.type] = (errorTypes[errorData.type] || 0) + 1;
        }
    }
    
    return {
        recentErrors: recentErrors.slice(-10), // Last 10 errors
        errorTypes: errorTypes,
        totalRecentErrors: recentErrors.length
    };
}

// Comprehensive cleanup with detailed logging
function autoCleanup() {
    const now = Date.now();
    let cleaned = {
        requests: 0,
        history: 0,
        queries: 0,
        errors: 0,
        performance: 0
    };
    
    // Clean old active requests (shouldn't be active for > 10 minutes)
    for (const [requestId, timestamp] of activeRequests.entries()) {
        if (now - timestamp > 600000) { // 10 minutes
            activeRequests.delete(requestId);
            cleaned.requests++;
        }
    }
    
    // Clean old request history (keep 2 hours)
    for (const [requestId, data] of requestHistory.entries()) {
        if (now - data.timestamp > 7200000) { // 2 hours
            requestHistory.delete(requestId);
            cleaned.history++;
        }
    }
    
    // Clean old query counters (keep 1 hour)
    const queriesForRemoval = [];
    for (const [queryId] of responseCounter.entries()) {
        const hasRecentHistory = Array.from(requestHistory.values()).some(data =>
            data.queryId === queryId && (now - data.timestamp) < 3600000 // 1 hour
        );
        
        if (!hasRecentHistory) {
            queriesForRemoval.push(queryId);
        }
    }
    
    queriesForRemoval.forEach(queryId => {
        responseCounter.delete(queryId);
        cleaned.queries++;
    });
    
    // Clean old errors (keep 4 hours)
    for (const [errorKey, errorData] of errorLog.entries()) {
        if (now - errorData.timestamp > 14400000) { // 4 hours
            errorLog.delete(errorKey);
            cleaned.errors++;
        }
    }
    
    // Clean old performance metrics (keep essential data)
    for (const [key, value] of performanceMetrics.entries()) {
        if (typeof value === 'object' && value.count > 1000) {
            // Compress old performance data
            performanceMetrics.set(key, {
                count: Math.floor(value.count / 2),
                totalTime: Math.floor(value.totalTime / 2),
                totalChunks: Math.floor(value.totalChunks / 2),
                totalChars: Math.floor(value.totalChars / 2),
                successfulChunks: Math.floor(value.successfulChunks / 2)
            });
            cleaned.performance++;
        }
    }
    
    if (Object.values(cleaned).some(count => count > 0)) {
        console.log(`🧹 Auto cleanup completed:`, cleaned);
    }
}

function manualCleanup() {
    console.log('🧹 Starting comprehensive manual cleanup...');
    const beforeStats = getStats();
    autoCleanup();
    const afterStats = getStats();
    
    console.log('📊 Cleanup Results:');
    console.log(`  Active Requests: ${beforeStats.activeRequests} → ${afterStats.activeRequests}`);
    console.log(`  Recent Requests: ${beforeStats.recentRequests} → ${afterStats.recentRequests}`);
    console.log(`  Recent Errors: ${beforeStats.recentErrors} → ${afterStats.recentErrors}`);
    console.log(`  Memory Usage: Optimized`);
}

function resetStats() {
    console.log('🔄 Resetting delivery statistics...');
    deliveryStats.totalMessages = 0;
    deliveryStats.successfulDeliveries = 0;
    deliveryStats.failedDeliveries = 0;
    deliveryStats.chunkedMessages = 0;
    deliveryStats.averageProcessingTime = 0;
    deliveryStats.lastResetTime = Date.now();
    
    performanceMetrics.clear();
    errorLog.clear();
    
    console.log('✅ Statistics reset completed');
}

// Debug and troubleshooting utilities
function debugMessage(chatId, message, modelType = 'analysis') {
    const cleanedMessage = cleanMessage(message);
    const requestId = generateAdvancedRequestId(chatId, cleanedMessage, modelType);
    const queryId = generateQueryId(chatId, cleanedMessage);
    
    return {
        originalLength: message.length,
        cleanedLength: cleanedMessage.length,
        requestId: requestId,
        queryId: queryId,
        modelType: normalizeModelType(modelType),
        wouldBeDuplicate: isActualDuplicate(requestId, queryId, modelType, cleanedMessage),
        chunkCount: splitMessage(cleanedMessage, modelType).length,
        estimatedDelay: MESSAGE_TYPES[normalizeModelType(modelType)]?.delay || TELEGRAM_CONFIG.STANDARD_DELAY
    };
}

// Schedule automatic cleanup every 5 minutes
setInterval(autoCleanup, TELEGRAM_CONFIG.CLEANUP_INTERVAL);

// Export comprehensive API
module.exports = {
    // Core delivery functions
    sendGPT5Message,
    sendGPTResponse,
    sendClaudeResponse,
    sendDualAIResponse,
    sendAnalysis,
    sendAlert,
    
    // Message processing utilities
    cleanMessage,
    splitMessage,
    stripAllFormatting,
    convertToHTML,
    
    // Statistics and monitoring
    getStats,
    getPerformanceMetrics,
    getErrorAnalytics,
    
    // Maintenance functions
    manualCleanup,
    autoCleanup,
    resetStats,
    
    // Debug utilities
    debugMessage,
    generateAdvancedRequestId,
    generateQueryId,
    
    // Cambodia-specific helpers
    getCambodiaTime,
    isBusinessHours,
    CAMBODIA_FORMATTING,
    
    // Configuration
    TELEGRAM_CONFIG,
    MESSAGE_TYPES
};

console.log('🚀 Enhanced Telegram Splitter v2.0.1 loaded');
console.log('🏦 Cambodia Financial System Integration: ACTIVE');
console.log(`📊 ${Object.keys(MESSAGE_TYPES).length} message types supported`);
console.log(`⚡ Performance monitoring: ${TELEGRAM_CONFIG.PERFORMANCE_MONITORING ? 'ENABLED' : 'DISABLED'}`);
console.log(`🕐 Cambodia time: ${getCambodiaTime(true)}`);
console.log(`💼 Business hours: ${isBusinessHours() ? 'ACTIVE' : 'CLOSED'}`);
console.log('✅ Enhanced error handling and recovery systems ready');
console.log('🛡️ Advanced duplicate prevention and request tracking active');
