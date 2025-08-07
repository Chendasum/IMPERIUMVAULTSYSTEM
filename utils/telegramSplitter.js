// utils/telegramSplitter.js - Handle Long Messages from OpenAI GPT-4o
// IMPERIUM VAULT STRATEGIC COMMAND SYSTEM - Enhanced for 16,384 token responses

/**
 * 📏 TELEGRAM MESSAGE LIMITS
 */
const TELEGRAM_LIMITS = {
    MAX_MESSAGE_LENGTH: 4096,           // Telegram's hard limit
    SAFE_MESSAGE_LENGTH: 4000,          // Safe limit with buffer
    MAX_CAPTION_LENGTH: 1024,           // For media with captions
    CHUNK_OVERLAP: 50,                  // Characters to overlap between chunks
    MAX_CHUNKS_PER_BATCH: 20,           // Increased for long strategic reports
    STRATEGIC_REPORT_MAX: 16384         // GPT-4o max tokens * ~4 chars per token
};

/**
 * 🔧 ENHANCED SMART MESSAGE SPLITTER
 * Intelligently splits long strategic messages while preserving formatting and context
 */
function splitLongMessage(text, maxLength = TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
    if (!text || text.length <= maxLength) {
        return [text];
    }

    const chunks = [];
    let currentChunk = '';
    
    // Enhanced splitting logic for strategic reports
    // Priority: 1) Strategic sections, 2) Paragraphs, 3) Sentences, 4) Words
    
    // First, try to split by strategic sections (marked with emojis + **TITLE**)
    const strategicSections = text.split(/(?=🎯|⚡|🏛️|📊|💰|🇰🇭|⚠️|🚨|💡|🔮|📋)/);
    
    for (let i = 0; i < strategicSections.length; i++) {
        const section = strategicSections[i].trim();
        
        if (!section) continue;
        
        // If section is too long, split it further
        if (section.length > maxLength) {
            // If we have a current chunk, save it first
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            
            // Split the long section by paragraphs
            const subChunks = splitLongSection(section, maxLength);
            chunks.push(...subChunks);
        } else {
            // Check if adding this section would exceed limit
            const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + section;
            
            if (potentialChunk.length <= maxLength) {
                currentChunk = potentialChunk;
            } else {
                // Save current chunk and start new one
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = section;
            }
        }
    }
    
    // Add the last chunk if it exists
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.trim().length > 0);
}

/**
 * 📄 SPLIT LONG STRATEGIC SECTION
 * Handles strategic sections that are too long by preserving structure
 */
function splitLongSection(section, maxLength) {
    const chunks = [];
    
    // Try splitting by paragraphs first (double newlines)
    const paragraphs = section.split(/\n\n+/);
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
        if (paragraph.length > maxLength) {
            // Single paragraph is too long, split by sentences
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            
            const subChunks = splitLongParagraph(paragraph, maxLength);
            chunks.push(...subChunks);
        } else {
            const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
            
            if (potentialChunk.length <= maxLength) {
                currentChunk = potentialChunk;
            } else {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = paragraph;
            }
        }
    }
    
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

/**
 * 📄 SPLIT LONG PARAGRAPH
 * Handles paragraphs that are too long by splitting on sentences or words
 */
function splitLongParagraph(paragraph, maxLength) {
    const chunks = [];
    
    // Try splitting by sentences first (enhanced pattern for strategic content)
    const sentences = paragraph.split(/(?<=[.!?:])\s+(?=[A-Z•])/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
        if (sentence.length > maxLength) {
            // Single sentence is too long, split by strategic bullet points or words
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            
            // Check if it's a bullet list that we can split
            if (sentence.includes('•')) {
                const bulletChunks = splitBulletList(sentence, maxLength);
                chunks.push(...bulletChunks);
            } else {
                // Split by words as last resort
                const wordChunks = splitByWords(sentence, maxLength);
                chunks.push(...wordChunks);
            }
        } else {
            const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
            
            if (potentialChunk.length <= maxLength) {
                currentChunk = potentialChunk;
            } else {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            }
        }
    }
    
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

/**
 * 🔸 SPLIT BULLET LISTS INTELLIGENTLY
 * Preserves bullet point structure in strategic reports
 */
function splitBulletList(text, maxLength) {
    const chunks = [];
    const bullets = text.split(/(?=•)/);
    let currentChunk = '';
    
    for (const bullet of bullets) {
        if (!bullet.trim()) continue;
        
        const potentialChunk = currentChunk + (currentChunk ? '\n' : '') + bullet;
        
        if (potentialChunk.length <= maxLength) {
            currentChunk = potentialChunk;
        } else {
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
            }
            
            // If single bullet is too long, split it by words
            if (bullet.length > maxLength) {
                const wordChunks = splitByWords(bullet, maxLength);
                chunks.push(...wordChunks);
                currentChunk = '';
            } else {
                currentChunk = bullet;
            }
        }
    }
    
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

/**
 * 🔤 SPLIT BY WORDS (LAST RESORT)
 * Final fallback for extremely long content
 */
function splitByWords(text, maxLength) {
    const chunks = [];
    const words = text.split(' ');
    let currentChunk = '';
    
    for (const word of words) {
        const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + word;
        
        if (potentialChunk.length <= maxLength) {
            currentChunk = potentialChunk;
        } else {
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = word;
        }
    }
    
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

/**
 * 📨 ENHANCED CHUNKED MESSAGES SENDER
 * Sends multiple messages with proper delays and strategic numbering
 */
async function sendLongMessage(bot, chatId, text, options = {}) {
    try {
        const chunks = splitLongMessage(text);
        
        console.log(`📨 Sending ${chunks.length} strategic message chunks to ${chatId}`);
        
        if (chunks.length === 1) {
            // Single message, send normally
            return await bot.sendMessage(chatId, chunks[0], {
                ...options,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        }
        
        // Multiple messages - send with strategic numbering and delays
        const results = [];
        const totalChunks = chunks.length;
        
        for (let i = 0; i < chunks.length; i++) {
            const chunkNumber = i + 1;
            const isFirst = i === 0;
            const isLast = i === chunks.length - 1;
            
            // Add strategic chunk numbering for multi-part messages
            let messageText = chunks[i];
            
            if (totalChunks > 1) {
                if (isFirst) {
                    messageText = `⚡ **STRATEGIC REPORT - Part ${chunkNumber}/${totalChunks}**\n\n${messageText}`;
                } else if (isLast) {
                    messageText = `⚡ **STRATEGIC REPORT - Part ${chunkNumber}/${totalChunks} (FINAL)**\n\n${messageText}`;
                } else {
                    messageText = `⚡ **STRATEGIC REPORT - Part ${chunkNumber}/${totalChunks}**\n\n${messageText}`;
                }
            }
            
            try {
                const result = await bot.sendMessage(chatId, messageText, {
                    ...options,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
                results.push(result);
                
                // Strategic delay between messages (faster for better user experience)
                if (!isLast && chunks.length > 2) {
                    await sleep(800); // Reduced to 0.8 seconds for faster delivery
                }
                
            } catch (chunkError) {
                console.error(`❌ Error sending strategic chunk ${chunkNumber}:`, chunkError.message);
                
                // If markdown fails, try without formatting
                try {
                    const fallbackResult = await bot.sendMessage(chatId, messageText, {
                        ...options,
                        parse_mode: undefined,
                        disable_web_page_preview: true
                    });
                    results.push(fallbackResult);
                } catch (fallbackError) {
                    console.error(`❌ Strategic fallback also failed for chunk ${chunkNumber}:`, fallbackError.message);
                    // Continue with next chunk
                }
            }
        }
        
        console.log(`✅ Successfully sent ${results.length}/${totalChunks} strategic message chunks`);
        return results;
        
    } catch (error) {
        console.error('❌ Error in sendLongMessage:', error.message);
        
        // Emergency strategic fallback - try to send truncated message
        try {
            const truncatedText = text.substring(0, TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH - 150) + 
                                 '\n\n⚡ **(Strategic report truncated - Use dashboard for full analysis)**';
            return await bot.sendMessage(chatId, truncatedText, {
                ...options,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (fallbackError) {
            console.error('❌ Emergency strategic fallback also failed:', fallbackError.message);
            throw error;
        }
    }
}

/**
 * 🏛️ STRATEGIC COMMANDER MESSAGE FORMATTER
 * Enhanced formatting for strategic command responses
 */
function formatRayDalioResponse(response, title = null) {
    let formatted = '';
    
    // Add strategic title if provided
    if (title) {
        formatted += `🎯 **${title.toUpperCase()}**\n\n`;
    }
    
    // Clean response without artificial footers
    formatted += response;
    
    return formatted;
}

/**
 * 🇰🇭 STRATEGIC CAMBODIA FUND MESSAGE FORMATTER
 * Enhanced formatting for Cambodia fund responses
 */
function formatCambodiaFundResponse(response, analysisType = null) {
    let formatted = '';
    
    // Add strategic analysis type if provided
    if (analysisType) {
        formatted += `🏦 **${analysisType.toUpperCase()}**\n\n`;
    }
    
    // Clean response
    formatted += response;
    
    return formatted;
}

/**
 * ⏰ SLEEP UTILITY
 * Optimized for strategic message delivery
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 📊 ENHANCED MESSAGE STATISTICS
 * Provides detailed stats about strategic message splitting
 */
function getMessageStats(originalText, chunks) {
    const stats = {
        originalLength: originalText.length,
        chunksCreated: chunks.length,
        averageChunkLength: Math.round(chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length),
        maxChunkLength: Math.max(...chunks.map(chunk => chunk.length)),
        minChunkLength: Math.min(...chunks.map(chunk => chunk.length)),
        compressionRatio: (originalText.length / chunks.join('').length * 100).toFixed(1),
        estimatedDeliveryTime: chunks.length > 1 ? `${(chunks.length - 1) * 0.8}s` : '0s',
        strategicSections: (originalText.match(/🎯|⚡|🏛️|📊|💰|🇰🇭|⚠️|🚨|💡|🔮|📋/g) || []).length
    };
    
    return stats;
}

/**
 * 🎯 ENHANCED SMART RESPONSE SENDER
 * Main function for strategic command system responses
 */
async function sendSmartResponse(bot, chatId, response, title = null, type = 'general') {
    try {
        let formattedResponse;
        
        switch (type) {
            case 'raydalio':
            case 'strategic':
                formattedResponse = formatRayDalioResponse(response, title);
                break;
            case 'cambodia':
            case 'fund':
                formattedResponse = formatCambodiaFundResponse(response, title);
                break;
            case 'general':
            default:
                formattedResponse = title ? `⚡ **${title}**\n\n${response}` : response;
        }
        
        // Check if splitting is needed
        if (formattedResponse.length <= TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
            return await bot.sendMessage(chatId, formattedResponse, { 
                parse_mode: 'Markdown',
                disable_web_page_preview: true 
            });
        }
        
        // Log strategic message stats
        const chunks = splitLongMessage(formattedResponse);
        const stats = getMessageStats(formattedResponse, chunks);
        console.log(`📊 Strategic Message Stats:`, stats);
        
        // Send as chunked strategic messages
        return await sendLongMessage(bot, chatId, formattedResponse, {
            disable_web_page_preview: true
        });
        
    } catch (error) {
        console.error('❌ Error in sendSmartResponse:', error.message);
        
        // Ultimate strategic fallback
        try {
            await bot.sendMessage(chatId, `❌ **STRATEGIC RESPONSE ERROR**\n\n⚡ The strategic analysis exceeded delivery limits. Please use specific commands or check the dashboard for full intelligence.\n\n🌐 **Dashboard:** https://imperiumvaultsystem-production.up.railway.app/dashboard\n\n💡 **Tip:** Try more focused strategic queries like "/regime" or "/opportunities"`, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (fallbackError) {
            console.error('❌ Ultimate strategic fallback failed:', fallbackError.message);
        }
        
        throw error;
    }
}

/**
 * 🚀 STRATEGIC MESSAGE VALIDATOR
 * Validates message content for strategic formatting
 */
function validateStrategicMessage(text) {
    const validation = {
        isValid: true,
        warnings: [],
        suggestions: []
    };
    
    // Check for strategic markers
    const strategicMarkers = (text.match(/🎯|⚡|🏛️|📊|💰|🇰🇭|⚠️|🚨|💡|🔮|📋/g) || []).length;
    if (strategicMarkers === 0) {
        validation.warnings.push('No strategic section markers found');
        validation.suggestions.push('Add strategic emojis (🎯⚡🏛️) to improve readability');
    }
    
    // Check message length efficiency
    if (text.length > TELEGRAM_LIMITS.STRATEGIC_REPORT_MAX) {
        validation.warnings.push('Message exceeds strategic report maximum');
        validation.suggestions.push('Consider breaking into multiple focused analyses');
    }
    
    return validation;
}

module.exports = {
    // Main strategic functions
    sendLongMessage,
    sendSmartResponse,
    splitLongMessage,
    
    // Enhanced formatters
    formatRayDalioResponse,
    formatCambodiaFundResponse,
    
    // Strategic utilities
    getMessageStats,
    validateStrategicMessage,
    TELEGRAM_LIMITS,
    
    // Enhanced splitting functions
    splitLongSection,
    splitLongParagraph,
    splitBulletList,
    splitByWords,
    
    // Legacy support
    splitAndSendMessage: sendLongMessage
};
