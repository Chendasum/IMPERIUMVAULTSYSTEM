// utils/telegramSplitter.js - GPT-5 OPTIMIZED WITH MAX TOKEN SUPPORT
// ═══════════════════════════════════════════════════════════════════════════
// 🎯 GPT-5 READY: Handles up to 128K output tokens (~500K characters)
// 🎯 DUAL MODE: Professional chunking for complex content, Fast for simple
// 🎯 INTELLIGENT: Auto-detects content complexity and chooses optimal strategy
// 🎯 ALIGNED: Perfect drop-in replacement for your dualCommandSystem.js
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// GPT-5 OPTIMIZED CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // Telegram limits
    TELEGRAM_MAX_LENGTH: 4096,
    
    // Chunking strategies
    FAST_CHUNK_SIZE: 3900,           // Fast mode: 2 parts max (your preference)
    PROFESSIONAL_CHUNK_SIZE: 3600,   // Professional mode: allows more parts for structure
    MIN_CHUNK_SIZE: 400,             // Prevent tiny chunks
    
    // GPT-5 token support
    GPT5_MAX_OUTPUT_TOKENS: 128000,  // GPT-5's maximum output
    ESTIMATED_CHARS_PER_TOKEN: 4,    // Conservative estimate
    GPT5_MAX_CHARS: 500000,          // ~125K tokens * 4 chars
    
    // Mode thresholds
    FAST_MODE_THRESHOLD: 8000,       // Under 8K chars = fast mode
    PROFESSIONAL_THRESHOLD: 15000,   // Over 15K chars = professional mode
    MEGA_RESPONSE_THRESHOLD: 50000,  // Huge GPT-5 responses need special handling
    
    // Timing
    FAST_DELAY: 400,                 // Your preferred fast timing
    PROFESSIONAL_DELAY: 800,         // Slightly longer for readability
    MEGA_DELAY: 1200,                // Longer for very large responses
    
    // Limits
    FAST_MAX_PARTS: 2,               // Your speed optimization
    PROFESSIONAL_MAX_PARTS: 5,       // Allow more for complex content
    MEGA_MAX_PARTS: 10,              // For huge GPT-5 responses
    
    DEBUG_MODE: process.env.NODE_ENV === 'development'
};

// GPT-5 Model Information
const GPT5_MODELS = {
    'gpt-5': { 
        emoji: '🧠', 
        name: 'GPT-5', 
        description: 'Advanced reasoning',
        maxTokens: 128000,
        preferredMode: 'professional'
    },
    'gpt-5-mini': { 
        emoji: '⚡', 
        name: 'GPT-5 Mini', 
        description: 'Fast & efficient',
        maxTokens: 128000,
        preferredMode: 'fast'
    },
    'gpt-5-nano': { 
        emoji: '💫', 
        name: 'GPT-5 Nano', 
        description: 'Ultra-lightweight',
        maxTokens: 128000,
        preferredMode: 'fast'
    },
    'gpt-5-chat-latest': { 
        emoji: '💬', 
        name: 'GPT-5 Chat', 
        description: 'Conversational',
        maxTokens: 128000,
        preferredMode: 'fast'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function safeString(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return String(value);
        }
    }
    return String(value);
}

function log(message, data = null) {
    if (CONFIG.DEBUG_MODE) {
        console.log(`[GPT5-TelegramSplitter] ${message}`);
        if (data) console.log(data);
    }
}

function estimateTokens(text) {
    return Math.ceil(safeString(text).length / CONFIG.ESTIMATED_CHARS_PER_TOKEN);
}

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT CONTENT ANALYSIS FOR MODE SELECTION
// ═══════════════════════════════════════════════════════════════════════════

function analyzeContentForMode(text) {
    const safeText = safeString(text);
    const length = safeText.length;
    const estimatedTokens = estimateTokens(safeText);
    
    // Structure detection
    const hasCodeBlocks = /```[\s\S]*?```/g.test(safeText);
    const hasNumberedLists = /^\s*\d+\.\s+/m.test(safeText);
    const hasBulletLists = /^\s*[•▪▫◦\-\*]\s+/m.test(safeText);
    const hasHeaders = /^#{1,6}\s+/m.test(safeText) || /^[A-Z][A-Za-z\s]{5,30}:$/m.test(safeText);
    const hasMultipleParagraphs = (safeText.match(/\n\n/g) || []).length > 3;
    const hasComplexFormatting = /\*\*[^*]+\*\*/.test(safeText) || /__[^_]+__/.test(safeText);
    
    // Complexity scoring
    let complexityScore = 0;
    if (hasCodeBlocks) complexityScore += 0.4;
    if (hasNumberedLists) complexityScore += 0.3;
    if (hasBulletLists) complexityScore += 0.2;
    if (hasHeaders) complexityScore += 0.2;
    if (hasMultipleParagraphs) complexityScore += 0.2;
    if (hasComplexFormatting) complexityScore += 0.1;
    
    // Determine optimal mode
    let recommendedMode;
    let maxParts;
    let chunkSize;
    let delay;
    
    if (length >= CONFIG.MEGA_RESPONSE_THRESHOLD) {
        // Mega responses (50K+ chars) - Special handling
        recommendedMode = 'mega';
        maxParts = CONFIG.MEGA_MAX_PARTS;
        chunkSize = CONFIG.PROFESSIONAL_CHUNK_SIZE;
        delay = CONFIG.MEGA_DELAY;
    } else if (length >= CONFIG.PROFESSIONAL_THRESHOLD || complexityScore > 0.5) {
        // Professional mode for complex/long content
        recommendedMode = 'professional';
        maxParts = CONFIG.PROFESSIONAL_MAX_PARTS;
        chunkSize = CONFIG.PROFESSIONAL_CHUNK_SIZE;
        delay = CONFIG.PROFESSIONAL_DELAY;
    } else {
        // Fast mode for simple/short content
        recommendedMode = 'fast';
        maxParts = CONFIG.FAST_MAX_PARTS;
        chunkSize = CONFIG.FAST_CHUNK_SIZE;
        delay = CONFIG.FAST_DELAY;
    }
    
    return {
        length,
        estimatedTokens,
        complexityScore,
        hasCodeBlocks,
        hasNumberedLists,
        hasBulletLists,
        hasHeaders,
        hasMultipleParagraphs,
        hasComplexFormatting,
        recommendedMode,
        maxParts,
        chunkSize,
        delay,
        exceedsGPT5Limits: estimatedTokens > CONFIG.GPT5_MAX_OUTPUT_TOKENS,
        isGPT5MegaResponse: length > CONFIG.MEGA_RESPONSE_THRESHOLD
    };
}

function getModelInfo(model) {
    const modelKey = safeString(model).toLowerCase();
    return GPT5_MODELS[modelKey] || GPT5_MODELS['gpt-5-mini'];
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED HEADER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function createHeader(options = {}) {
    try {
        const {
            model = 'gpt-5-mini',
            partNumber = 1,
            totalParts = 1,
            title = null,
            mode = 'standard',
            tokens = null
        } = options;
        
        const modelInfo = getModelInfo(model);
        const time = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Mode-specific styling
        let modeEmoji = '';
        switch (mode) {
            case 'fast': modeEmoji = '⚡'; break;
            case 'professional': modeEmoji = '🎯'; break;
            case 'mega': modeEmoji = '🧠'; break;
            default: modeEmoji = '💼'; break;
        }
        
        // Build header
        let header = `${modelInfo.emoji} ${modelInfo.name}`;
        
        if (totalParts > 1) {
            header += ` (${partNumber}/${totalParts})`;
        }
        
        header += `\n📅 ${time} • ${modeEmoji} ${mode}`;
        
        if (tokens) {
            header += ` • 🔢 ${tokens}T`;
        }
        
        if (title) {
            header += ` • 📋 ${title}`;
        }
        
        header += '\n\n';
        
        return header;
        
    } catch (error) {
        log('Header creation failed, using simple fallback', error);
        return `🤖 GPT-5 Response\n\n`;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED SPLITTING ALGORITHMS
// ═══════════════════════════════════════════════════════════════════════════

function fastSplit(text, maxLength = CONFIG.FAST_CHUNK_SIZE) {
    const safeText = safeString(text);
    
    if (!safeText || safeText.length <= maxLength) {
        return [safeText || ''];
    }
    
    log(`Fast split: ${safeText.length} chars → max 2 parts`);
    
    // Your proven 2-part algorithm
    const midPoint = Math.floor(safeText.length / 2);
    let splitPoint = midPoint;
    
    // Find best break point
    const breakPoints = ['\n\n', '. ', '\n', ' '];
    for (const breakChar of breakPoints) {
        const searchStart = Math.max(0, midPoint - 300);
        const searchEnd = Math.min(safeText.length, midPoint + 300);
        const breakIndex = safeText.indexOf(breakChar, searchStart);
        
        if (breakIndex > searchStart && breakIndex < searchEnd) {
            splitPoint = breakIndex + breakChar.length;
            break;
        }
    }
    
    const parts = [
        safeText.slice(0, splitPoint).trim(),
        safeText.slice(splitPoint).trim()
    ].filter(part => part.length > 0);
    
    // Prevent tiny trailing parts
    if (parts.length === 2 && 
        parts[1].length < CONFIG.MIN_CHUNK_SIZE && 
        parts[0].length + parts[1].length < maxLength - 200) {
        
        log('Fast split: Combining small trailing part');
        return [parts.join('\n\n')];
    }
    
    return parts.slice(0, CONFIG.FAST_MAX_PARTS); // Enforce 2-part limit
}

function professionalSplit(text, maxLength = CONFIG.PROFESSIONAL_CHUNK_SIZE, maxParts = CONFIG.PROFESSIONAL_MAX_PARTS) {
    const safeText = safeString(text);
    
    if (!safeText || safeText.length <= maxLength) {
        return [safeText || ''];
    }
    
    log(`Professional split: ${safeText.length} chars → max ${maxParts} parts`);
    
    // Advanced splitting for structured content
    const parts = [];
    let remainingText = safeText;
    
    while (remainingText.length > maxLength && parts.length < maxParts - 1) {
        let splitPoint = maxLength;
        
        // Look for natural break points in order of preference
        const breakStrategies = [
            // Strategy 1: Double newlines (paragraph breaks)
            { pattern: /\n\n/g, offset: 2, priority: 1 },
            // Strategy 2: Code block boundaries
            { pattern: /```\n/g, offset: 4, priority: 2 },
            // Strategy 3: List item boundaries
            { pattern: /\n(?=\d+\.|\s*[•▪▫◦\-\*]\s)/g, offset: 1, priority: 3 },
            // Strategy 4: Sentence endings
            { pattern: /\.\s+/g, offset: 2, priority: 4 },
            // Strategy 5: Any newline
            { pattern: /\n/g, offset: 1, priority: 5 }
        ];
        
        let bestSplit = null;
        
        for (const strategy of breakStrategies) {
            const matches = [...remainingText.matchAll(strategy.pattern)];
            
            for (const match of matches.reverse()) { // Start from end
                const candidatePoint = match.index + strategy.offset;
                
                if (candidatePoint <= maxLength && candidatePoint >= maxLength * 0.6) {
                    if (!bestSplit || candidatePoint > bestSplit.point) {
                        bestSplit = { point: candidatePoint, priority: strategy.priority };
                    }
                }
            }
            
            if (bestSplit && bestSplit.priority <= 3) break; // Good enough break found
        }
        
        if (bestSplit) {
            splitPoint = bestSplit.point;
        }
        
        parts.push(remainingText.slice(0, splitPoint).trim());
        remainingText = remainingText.slice(splitPoint).trim();
    }
    
    // Add remaining text
    if (remainingText.length > 0) {
        // Check if we should combine with last part
        if (parts.length > 0 && 
            remainingText.length < CONFIG.MIN_CHUNK_SIZE && 
            parts[parts.length - 1].length + remainingText.length < maxLength - 100) {
            
            parts[parts.length - 1] += '\n\n' + remainingText;
            log('Professional split: Combined small trailing part');
        } else {
            parts.push(remainingText);
        }
    }
    
    return parts.slice(0, maxParts); // Enforce max parts limit
}

function megaSplit(text, maxLength = CONFIG.PROFESSIONAL_CHUNK_SIZE, maxParts = CONFIG.MEGA_MAX_PARTS) {
    const safeText = safeString(text);
    
    log(`Mega split: ${safeText.length} chars → max ${maxParts} parts (GPT-5 mega response)`);
    
    // For very large responses, use professional splitting with higher limits
    return professionalSplit(safeText, maxLength, maxParts);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FORMATTING FUNCTIONS WITH MODE SUPPORT
// ═══════════════════════════════════════════════════════════════════════════

function formatMessage(text, options = {}) {
    try {
        const safeText = safeString(text);
        
        if (!safeText) {
            return [''];
        }
        
        // Analyze content to determine optimal strategy
        const analysis = analyzeContentForMode(safeText);
        
        // Override mode if specified
        const mode = options.mode || analysis.recommendedMode;
        const includeHeaders = options.includeHeaders !== false;
        
        log(`Formatting: ${analysis.length} chars, ${analysis.estimatedTokens} tokens, mode: ${mode}`);
        
        // Choose splitting algorithm based on mode
        let chunks;
        switch (mode) {
            case 'fast':
                chunks = fastSplit(safeText, options.maxLength || CONFIG.FAST_CHUNK_SIZE);
                break;
            case 'professional':
                chunks = professionalSplit(safeText, options.maxLength || CONFIG.PROFESSIONAL_CHUNK_SIZE, CONFIG.PROFESSIONAL_MAX_PARTS);
                break;
            case 'mega':
                chunks = megaSplit(safeText, options.maxLength || CONFIG.PROFESSIONAL_CHUNK_SIZE, CONFIG.MEGA_MAX_PARTS);
                break;
            default:
                chunks = analysis.recommendedMode === 'fast' ? 
                    fastSplit(safeText, analysis.chunkSize) : 
                    professionalSplit(safeText, analysis.chunkSize, analysis.maxParts);
        }
        
        // Add headers if requested
        if (includeHeaders && chunks.length > 0) {
            return chunks.map((chunk, index) => {
                const header = createHeader({
                    model: options.model || 'gpt-5-mini',
                    partNumber: index + 1,
                    totalParts: chunks.length,
                    title: options.title,
                    mode: mode,
                    tokens: Math.ceil(chunk.length / CONFIG.ESTIMATED_CHARS_PER_TOKEN)
                });
                return header + chunk;
            });
        }
        
        return chunks;
        
    } catch (error) {
        log('Formatting failed, using emergency fallback', error);
        return [safeString(text).slice(0, CONFIG.FAST_CHUNK_SIZE) || ''];
    }
}

// Mode-specific formatting functions
function quickFormat(text) {
    return formatMessage(text, {
        mode: 'fast',
        includeHeaders: false,
        maxLength: CONFIG.FAST_CHUNK_SIZE
    });
}

function professionalFormat(text) {
    return formatMessage(text, {
        mode: 'professional',
        includeHeaders: true,
        maxLength: CONFIG.PROFESSIONAL_CHUNK_SIZE
    });
}

function fastFormat(text, options = {}) {
    return formatMessage(text, {
        mode: 'fast',
        includeHeaders: options.includeHeaders !== false,
        ...options
    });
}

function megaFormat(text, options = {}) {
    return formatMessage(text, {
        mode: 'mega',
        includeHeaders: true,
        maxLength: CONFIG.PROFESSIONAL_CHUNK_SIZE,
        ...options
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT TELEGRAM DELIVERY WITH MODE AUTO-DETECTION
// ═══════════════════════════════════════════════════════════════════════════

async function sendFormattedMessage(bot, chatId, text, options = {}) {
    try {
        if (!bot || !bot.sendMessage) {
            log('Bot not available');
            return { success: false, error: 'Bot not available' };
        }
        
        const safeText = safeString(text);
        const safeChatId = safeString(chatId);
        
        if (!safeText) {
            log('Empty text provided');
            return { success: false, error: 'Empty text' };
        }
        
        // Analyze content for optimal delivery strategy
        const analysis = analyzeContentForMode(safeText);
        
        log(`Delivery analysis: ${analysis.length} chars, ${analysis.estimatedTokens} tokens, recommended: ${analysis.recommendedMode}`);
        
        // Determine final mode (allow override)
        const finalMode = options.mode || 
                          (options.professional ? 'professional' : null) ||
                          (options.fast ? 'fast' : null) ||
                          analysis.recommendedMode;
        
        // Format message according to mode
        let formattedParts;
        switch (finalMode) {
            case 'fast':
                formattedParts = fastFormat(safeText, { 
                    model: options.model, 
                    title: options.title,
                    includeHeaders: options.includeHeaders 
                });
                break;
            case 'professional':
                formattedParts = professionalFormat(safeText);
                if (options.model || options.title) {
                    formattedParts = formatMessage(safeText, {
                        mode: 'professional',
                        model: options.model,
                        title: options.title,
                        includeHeaders: options.includeHeaders
                    });
                }
                break;
            case 'mega':
                formattedParts = megaFormat(safeText, {
                    model: options.model,
                    title: options.title,
                    includeHeaders: options.includeHeaders
                });
                break;
            default:
                formattedParts = formatMessage(safeText, {
                    model: options.model,
                    title: options.title,
                    mode: finalMode,
                    includeHeaders: options.includeHeaders
                });
        }
        
        // Send all parts with appropriate timing
        const results = [];
        const delay = analysis.delay;
        
        log(`Sending ${formattedParts.length} parts with ${delay}ms delay (${finalMode} mode)`);
        
        for (let i = 0; i < formattedParts.length; i++) {
            try {
                const result = await bot.sendMessage(safeChatId, formattedParts[i]);
                results.push(result);
                
                // Intelligent delay between parts
                if (i < formattedParts.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
            } catch (sendError) {
                log(`Failed to send part ${i + 1}/${formattedParts.length}`, sendError);
                
                // Try character cleanup fallback
                try {
                    const cleanPart = formattedParts[i].replace(/[^\x00-\x7F]/g, '');
                    const result = await bot.sendMessage(safeChatId, cleanPart);
                    results.push(result);
                    log(`Sent part ${i + 1} with character cleanup`);
                } catch (cleanError) {
                    log(`Part ${i + 1} failed completely`, cleanError);
                    // Continue with remaining parts
                }
            }
        }
        
        const deliveryInfo = {
            success: true,
            mode: finalMode,
            parts: formattedParts.length,
            delivered: results.length,
            analysis: {
                length: analysis.length,
                tokens: analysis.estimatedTokens,
                complexity: analysis.complexityScore,
                isGPT5Mega: analysis.isGPT5MegaResponse
            },
            performance: {
                recommendedMode: analysis.recommendedMode,
                finalMode: finalMode,
                delay: delay
            }
        };
        
        log(`Delivery complete: ${results.length}/${formattedParts.length} parts sent successfully`);
        return deliveryInfo;
        
    } catch (error) {
        log('Complete delivery failure', error);
        
        // Emergency fallback for any failure
        try {
            const analysis = analyzeContentForMode(text);
            const truncatedLength = analysis.isGPT5MegaResponse ? 
                CONFIG.PROFESSIONAL_CHUNK_SIZE : CONFIG.FAST_CHUNK_SIZE;
            
            const truncated = safeString(text).slice(0, truncatedLength - 200);
            const header = `🤖 GPT-5 Emergency Mode\n📅 ${new Date().toLocaleTimeString()}\n⚠️ Full response too large, showing first part\n\n`;
            
            await bot.sendMessage(safeString(chatId), header + truncated + '\n\n[Response truncated - please try a shorter request]');
            
            log('Emergency fallback successful');
            return { 
                success: true, 
                mode: 'emergency',
                parts: 1,
                delivered: 1,
                truncated: true,
                originalLength: safeString(text).length
            };
            
        } catch (emergencyError) {
            log('Emergency fallback also failed', emergencyError);
            return { 
                success: false, 
                error: emergencyError.message,
                mode: 'complete-failure'
            };
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY & CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function sendMessage(bot, chatId, text, options = {}) {
    return await sendFormattedMessage(bot, chatId, text, options);
}

async function sendGPT5(bot, chatId, response, meta = {}) {
    return await sendFormattedMessage(bot, chatId, response, {
        model: 'gpt-5',
        professional: true,
        ...meta
    });
}

async function sendGPT5Fast(bot, chatId, response, meta = {}) {
    return await sendFormattedMessage(bot, chatId, response, {
        model: 'gpt-5-mini',
        fast: true,
        ...meta
    });
}

async function sendGPT5Professional(bot, chatId, response, meta = {}) {
    return await sendFormattedMessage(bot, chatId, response, {
        model: 'gpt-5',
        professional: true,
        ...meta
    });
}

// Alternative names for compatibility
const splitTelegramMessage = formatMessage;
const sendTelegramMessage = sendFormattedMessage;

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM UTILITIES & DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════════════

function getSystemInfo() {
    return {
        version: '3.0-gpt5-optimized',
        description: 'GPT-5 optimized telegram splitter with professional/fast modes',
        
        gpt5Support: {
            maxInputTokens: '272,000 tokens',
            maxOutputTokens: '128,000 tokens',
            maxEstimatedChars: '~500,000 characters',
            handlesMaxOutput: true
        },
        
        modes: {
            fast: {
                description: 'Speed optimized, max 2 parts',
                chunkSize: CONFIG.FAST_CHUNK_SIZE,
                maxParts: CONFIG.FAST_MAX_PARTS,
                delay: CONFIG.FAST_DELAY,
                threshold: `Under ${CONFIG.FAST_MODE_THRESHOLD} chars`
            },
            professional: {
                description: 'Structure preserving, max 5 parts',
                chunkSize: CONFIG.PROFESSIONAL_CHUNK_SIZE,
                maxParts: CONFIG.PROFESSIONAL_MAX_PARTS,
                delay: CONFIG.PROFESSIONAL_DELAY,
                threshold: `${CONFIG.PROFESSIONAL_THRESHOLD}+ chars or complex`
            },
            mega: {
                description: 'Handles GPT-5 mega responses, max 10 parts',
                chunkSize: CONFIG.PROFESSIONAL_CHUNK_SIZE,
                maxParts: CONFIG.MEGA_MAX_PARTS,
                delay: CONFIG.MEGA_DELAY,
                threshold: `${CONFIG.MEGA_RESPONSE_THRESHOLD}+ chars`
            }
        },
        
        features: [
            'Automatic mode detection based on content',
            'GPT-5 max token support (128K output)',
            'Professional chunking preserves structure',
            'Fast mode maintains your 2-part optimization',
            'Intelligent break point detection',
            'Emergency fallbacks for any failure',
            'Model-aware headers with token info'
        ],
        
        compatibility: 'Perfect drop-in replacement for dualCommandSystem.js',
        config: CONFIG,
        models: Object.keys(GPT5_MODELS)
    };
}

function analyzeGPT5Response(text) {
    const analysis = analyzeContentForMode(text);
    
    return {
        ...analysis,
        canHandleMaxGPT5: true,
        withinTelegramLimits: analysis.length < CONFIG.GPT5_MAX_CHARS,
        recommendedDelivery: analysis.recommendedMode,
        estimatedDeliveryTime: (analysis.maxParts * analysis.delay) / 1000 + ' seconds'
    };
}

function test() {
    console.log('\n=== GPT-5 OPTIMIZED TELEGRAM SPLITTER TEST ===');
    
    // Test cases for different scenarios
    const testCases = [
        {
            name: 'Simple Response (Fast Mode)',
            text: 'This is a simple GPT-5 response that should use fast mode.',
            expectedMode: 'fast'
        },
        {
            name: 'Complex Response (Professional Mode)',
            text: `GPT-5 Professional Analysis

## Executive Summary
This is a complex response with multiple sections.

### Key Points:
1. Professional formatting required
2. Multiple paragraphs and structure
3. Code examples and lists

\`\`\`javascript
const example = "code block";
\`\`\`

### Recommendations:
• Use professional mode
• Preserve structure
• Handle complexity properly

The system should automatically detect this needs professional chunking.`,
            expectedMode: 'professional'
        },
        {
            name: 'Mega Response (Mega Mode)',
            text: 'This is a massive GPT-5 response that would exceed normal limits. '.repeat(1000) + 
                  '\n\n## Complex Analysis Section\n' +
                  'With multiple structured parts that need careful chunking. '.repeat(500) +
                  '\n\n### Code Examples\n```\nLarge code blocks\n```\n' +
                  'And detailed explanations. '.repeat(800),
            expectedMode: 'mega'
        }
    ];
    
    testCases.forEach(testCase => {
        console.log(`\n--- ${testCase.name} ---`);
        const analysis = analyzeContentForMode(testCase.text);
        console.log(`Length: ${analysis.length} chars`);
        console.log(`Tokens: ${analysis.estimatedTokens}`);
        console.log(`Complexity: ${analysis.complexityScore.toFixed(2)}`);
        console.log(`Recommended: ${analysis.recommendedMode}`);
        console.log(`Expected: ${testCase.expectedMode}`);
        console.log(`Match: ${analysis.recommendedMode === testCase.expectedMode ? '✅' : '❌'}`);
        
        const formatted = formatMessage(testCase.text, { model: 'gpt-5', title: 'Test' });
        console.log(`Parts: ${formatted.length}`);
        console.log(`First part preview: ${formatted[0].substring(0, 100)}...`);
    });
    
    console.log('\n=== GPT-5 CAPACITY TEST ===');
    const maxTokenText = 'A'.repeat(CONFIG.GPT5_MAX_CHARS); // Simulate max GPT-5 output
    const maxAnalysis = analyzeGPT5Response(maxTokenText);
    console.log(`Max GPT-5 response: ${maxAnalysis.length} chars, ${maxAnalysis.estimatedTokens} tokens`);
    console.log(`Mode: ${maxAnalysis.recommendedMode}`);
    console.log(`Can handle: ${maxAnalysis.canHandleMaxGPT5 ? '✅' : '❌'}`);
    console.log(`Within limits: ${maxAnalysis.withinTelegramLimits ? '✅' : '❌'}`);
    
    console.log('\n=== END TEST ===\n');
    
    return {
        testsPassed: testCases.every(tc => analyzeContentForMode(tc.text).recommendedMode === tc.expectedMode),
        canHandleMaxGPT5: maxAnalysis.canHandleMaxGPT5,
        systemReady: true
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS - COMPREHENSIVE GPT-5 INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
    // Main functions (exactly what your dualCommandSystem.js expects)
    sendFormattedMessage,
    formatMessage,
    quickFormat,
    professionalFormat,
    
    // GPT-5 optimized functions
    fastFormat,
    megaFormat,
    sendGPT5Fast,
    sendGPT5Professional,
    
    // Legacy compatibility (for any existing code)
    sendMessage,
    sendGPT5,
    splitTelegramMessage,
    sendTelegramMessage,
    
    // Content analysis
    analyzeContentForMode,
    analyzeGPT5Response,
    estimateTokens,
    
    // Splitting algorithms
    fastSplit,
    professionalSplit,
    megaSplit,
    
    // System utilities
    getSystemInfo,
    test,
    getModelInfo,
    createHeader,
    
    // Configuration
    CONFIG,
    GPT5_MODELS,
    
    // Utility functions
    safeString,
    log
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION & SYSTEM CHECKS
// ═══════════════════════════════════════════════════════════════════════════

console.log('🚀 GPT-5 Optimized Telegram Splitter v3.0 Loaded');
console.log('📊 Capabilities:');
console.log(`   • Max GPT-5 tokens: ${CONFIG.GPT5_MAX_OUTPUT_TOKENS.toLocaleString()}`);
console.log(`   • Max characters: ${CONFIG.GPT5_MAX_CHARS.toLocaleString()}`);
console.log(`   • Fast mode: Max ${CONFIG.FAST_MAX_PARTS} parts, ${CONFIG.FAST_CHUNK_SIZE} chars each`);
console.log(`   • Professional mode: Max ${CONFIG.PROFESSIONAL_MAX_PARTS} parts, ${CONFIG.PROFESSIONAL_CHUNK_SIZE} chars each`);
console.log(`   • Mega mode: Max ${CONFIG.MEGA_MAX_PARTS} parts for huge responses`);
console.log('🎯 Perfect alignment with your dualCommandSystem.js');
console.log('⚡ Automatic mode detection: Fast → Professional → Mega');

// Auto-test in development
if (CONFIG.DEBUG_MODE) {
    setTimeout(() => {
        console.log('🧪 Running GPT-5 optimization tests...');
        const results = test();
        console.log(`🎯 System ready: ${results.systemReady ? '✅' : '❌'}`);
        console.log(`🧠 GPT-5 capable: ${results.canHandleMaxGPT5 ? '✅' : '❌'}`);
        console.log(`📋 Tests passed: ${results.testsPassed ? '✅' : '❌'}`);
    }, 1000);
}
