// utils/telegramSplitter.js - Handle Long Messages from OpenAI GPT-4o
// Telegram has a 4096 character limit per message, but we need to send detailed Ray Dalio analysis

/**
 * 📏 TELEGRAM MESSAGE LIMITS
 */
const TELEGRAM_LIMITS = {
    MAX_MESSAGE_LENGTH: 4096,           // Telegram's hard limit
    SAFE_MESSAGE_LENGTH: 4000,          // Safe limit with buffer
    MAX_CAPTION_LENGTH: 1024,           // For media with captions
    CHUNK_OVERLAP: 50,                  // Characters to overlap between chunks
    MAX_CHUNKS_PER_BATCH: 10           // Max messages to send in quick succession
};

/**
 * 🔧 SMART MESSAGE SPLITTER
 * Intelligently splits long messages while preserving formatting and context
 */
function splitLongMessage(text, maxLength = TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
    if (!text || text.length <= maxLength) {
        return [text];
    }

    const chunks = [];
    let currentChunk = '';
    
    // Split by paragraphs first (double newlines)
    const paragraphs = text.split(/\n\n+/);
    
    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i].trim();
        
        // If single paragraph is too long, split it further
        if (paragraph.length > maxLength) {
            // If we have a current chunk, save it first
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            
            // Split the long paragraph
            const subChunks = splitLongParagraph(paragraph, maxLength);
            chunks.push(...subChunks);
        } else {
            // Check if adding this paragraph would exceed limit
            const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
            
            if (potentialChunk.length <= maxLength) {
                currentChunk = potentialChunk;
            } else {
                // Save current chunk and start new one
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = paragraph;
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
 * 📄 SPLIT LONG PARAGRAPH
 * Handles paragraphs that are too long by splitting on sentences or words
 */
function splitLongParagraph(paragraph, maxLength) {
    const chunks = [];
    
    // Try splitting by sentences first
    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
        if (sentence.length > maxLength) {
            // Single sentence is too long, split by words
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            
            const words = sentence.split(' ');
            let wordChunk = '';
            
            for (const word of words) {
                const potentialChunk = wordChunk + (wordChunk ? ' ' : '') + word;
                
                if (potentialChunk.length <= maxLength) {
                    wordChunk = potentialChunk;
                } else {
                    if (wordChunk.trim()) {
                        chunks.push(wordChunk.trim());
                    }
                    wordChunk = word;
                }
            }
            
            if (wordChunk.trim()) {
                currentChunk = wordChunk.trim();
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
 * 📨 SEND CHUNKED MESSAGES TO TELEGRAM
 * Sends multiple messages with proper delays and numbering
 */
async function sendLongMessage(bot, chatId, text, options = {}) {
    try {
        const chunks = splitLongMessage(text);
        
        console.log(`📨 Sending ${chunks.length} message chunks to ${chatId}`);
        
        if (chunks.length === 1) {
            // Single message, send normally
            return await bot.sendMessage(chatId, chunks[0], options);
        }
        
        // Multiple messages - send with numbering and delays
        const results = [];
        const totalChunks = chunks.length;
        
        for (let i = 0; i < chunks.length; i++) {
            const chunkNumber = i + 1;
            const isFirst = i === 0;
            const isLast = i === chunks.length - 1;
            
            // Add chunk numbering for multi-part messages
            let messageText = chunks[i];
            
            if (totalChunks > 1) {
                if (isFirst) {
                    messageText = `📄 **Part ${chunkNumber}/${totalChunks}:**\n\n${messageText}`;
                } else if (isLast) {
                    messageText = `📄 **Part ${chunkNumber}/${totalChunks} (Final):**\n\n${messageText}`;
                } else {
                    messageText = `📄 **Part ${chunkNumber}/${totalChunks}:**\n\n${messageText}`;
                }
            }
            
            try {
                const result = await bot.sendMessage(chatId, messageText, {
                    ...options,
                    parse_mode: 'Markdown' // Enable markdown formatting
                });
                results.push(result);
                
                // Add delay between messages to avoid rate limiting
                if (!isLast && chunks.length > 2) {
                    await sleep(1000); // 1 second delay between chunks
                }
                
            } catch (chunkError) {
                console.error(`❌ Error sending chunk ${chunkNumber}:`, chunkError.message);
                
                // If markdown fails, try without formatting
                try {
                    const fallbackResult = await bot.sendMessage(chatId, messageText, {
                        ...options,
                        parse_mode: undefined
                    });
                    results.push(fallbackResult);
                } catch (fallbackError) {
                    console.error(`❌ Fallback also failed for chunk ${chunkNumber}:`, fallbackError.message);
                    // Continue with next chunk
                }
            }
        }
        
        console.log(`✅ Successfully sent ${results.length}/${totalChunks} message chunks`);
        return results;
        
    } catch (error) {
        console.error('❌ Error in sendLongMessage:', error.message);
        
        // Emergency fallback - try to send truncated message
        try {
            const truncatedText = text.substring(0, TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH - 100) + 
                                 '\n\n... (Message truncated due to length)';
            return await bot.sendMessage(chatId, truncatedText, options);
        } catch (fallbackError) {
            console.error('❌ Emergency fallback also failed:', fallbackError.message);
            throw error;
        }
    }
}

/**
 * 🏛️ ENHANCED RAY DALIO MESSAGE FORMATTER
 * Formats Ray Dalio responses with proper structure for splitting
 */
function formatRayDalioResponse(response, title = null) {
    let formatted = '';
    
    if (title) {
        formatted += `🏛️ **${title}**\n\n`;
    }
    
    // Add timestamp
    formatted += `📅 **Analysis Date:** ${new Date().toLocaleDateString()}\n`;
    formatted += `🕐 **Market Time:** ${new Date().toLocaleTimeString()}\n\n`;
    
    // Add the main response
    formatted += response;
    
    // Add footer
    formatted += `\n\n📊 **Powered by:** Ray Dalio's Principles + GPT-4o\n`;
    formatted += `🏛️ **Institutional-Grade Analysis** | Cambodia Fund Ready`;
    
    return formatted;
}

/**
 * 🇰🇭 CAMBODIA FUND MESSAGE FORMATTER
 * Formats Cambodia lending fund responses with proper sections
 */
function formatCambodiaFundResponse(response, analysisType = 'Fund Analysis') {
    let formatted = '';
    
    formatted += `🏦 **${analysisType}**\n\n`;
    formatted += `📅 **Report Date:** ${new Date().toLocaleDateString()}\n`;
    formatted += `🇰🇭 **Market:** Cambodia Private Lending\n\n`;
    
    formatted += response;
    
    formatted += `\n\n💼 **Fund Management System:** Active\n`;
    formatted += `🏛️ **Enhanced by Ray Dalio Risk Principles**`;
    
    return formatted;
}

/**
 * ⏰ SLEEP UTILITY
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 📊 MESSAGE STATISTICS
 * Provides stats about message splitting
 */
function getMessageStats(originalText, chunks) {
    return {
        originalLength: originalText.length,
        chunksCreated: chunks.length,
        averageChunkLength: Math.round(chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length),
        maxChunkLength: Math.max(...chunks.map(chunk => chunk.length)),
        minChunkLength: Math.min(...chunks.map(chunk => chunk.length)),
        compressionRatio: (originalText.length / chunks.join('').length * 100).toFixed(1)
    };
}

/**
 * 🎯 SMART RESPONSE SENDER
 * Main function that handles any long response intelligently
 */
async function sendSmartResponse(bot, chatId, response, title = null, type = 'general') {
    try {
        let formattedResponse;
        
        switch (type) {
            case 'raydalio':
                formattedResponse = formatRayDalioResponse(response, title);
                break;
            case 'cambodia':
                formattedResponse = formatCambodiaFundResponse(response, title);
                break;
            default:
                formattedResponse = title ? `**${title}**\n\n${response}` : response;
        }
        
        // Check if splitting is needed
        if (formattedResponse.length <= TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
            return await bot.sendMessage(chatId, formattedResponse, { 
                parse_mode: 'Markdown',
                disable_web_page_preview: true 
            });
        }
        
        // Send as chunked messages
        return await sendLongMessage(bot, chatId, formattedResponse, {
            disable_web_page_preview: true
        });
        
    } catch (error) {
        console.error('❌ Error in sendSmartResponse:', error.message);
        
        // Ultimate fallback
        try {
            await bot.sendMessage(chatId, `❌ **Response Error**\n\nThe analysis was too detailed for a single message. Please try a more specific question or use the web dashboard for full results.\n\n🌐 Dashboard: https://imperiumvaultsystem-production.up.railway.app/dashboard`);
        } catch (fallbackError) {
            console.error('❌ Ultimate fallback failed:', fallbackError.message);
        }
        
        throw error;
    }
}

module.exports = {
    // Main functions
    sendLongMessage,
    sendSmartResponse,
    splitLongMessage,
    
    // Formatters
    formatRayDalioResponse,
    formatCambodiaFundResponse,
    
    // Utilities
    getMessageStats,
    TELEGRAM_LIMITS,
    
    // Legacy support
    splitAndSendMessage: sendLongMessage
};
