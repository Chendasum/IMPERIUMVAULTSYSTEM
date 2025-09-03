// utils/telegramSplitter.js - CLEAN & RELIABLE VERSION
// ════════════════════════════════════════════════════════════════════════════
// 🔧 SIMPLIFIED: Removed complex formatting, focused on reliability
// 🔧 FIXED: Memory integration compatible, no more crashes
// 🔧 CLEAN: Simple message splitting with beautiful headers
// ════════════════════════════════════════════════════════════════════════════

'use strict';

console.log('📱 Loading CLEAN Telegram Splitter...');

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const TELEGRAM_LIMIT = 4096;           // Telegram's hard message limit
const SAFE_CHUNK_SIZE = 3800;          // Leave room for headers/formatting
const MAX_CHUNKS = 10;                 // Prevent spam (max 10 messages per response)

// Simple, clean header styles
const HEADERS = {
  gpt5: {
    top: '╭──────────────────────────────────────────╮',
    title: '│             🚀 GPT-5 Response             │',
    model: '│                 🤖 {MODEL}                 │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  completion: {
    top: '╭──────────────────────────────────────────╮',
    title: '│              Task Completion               │',
    model: '│                  🤖 {MODEL}                  │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  error: {
    top: '╭──────────────────────────────────────────╮',
    title: '│              ⚠️ System Error               │',
    model: '│                 🤖 {MODEL}                 │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  simple: {
    top: '╭──────────────────────────────────────────╮',
    title: '│                Response                    │',
    model: '│                 🤖 {MODEL}                 │',
    bottom: '╰──────────────────────────────────────────╯'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function safeString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return String(value);
}

function getModelName(metadata) {
  const model = safeString(metadata.model || metadata.modelUsed || metadata.aiUsed || 'gpt-5');
  
  // Clean up model names for display
  if (model.includes('gpt-5-nano')) return 'gpt-5-nano';
  if (model.includes('gpt-5-mini')) return 'gpt-5-mini';
  if (model.includes('gpt-5') || model.includes('GPT-5')) return 'gpt-5';
  if (model.includes('completion')) return 'completion';
  if (model.includes('error')) return 'system';
  if (model.includes('professional')) return 'gpt-5';
  return model.toLowerCase();
}

function getHeaderType(metadata) {
  if (metadata.completionDetected || metadata.aiUsed === 'completion-detection') {
    return 'completion';
  }
  if (metadata.error || metadata.aiUsed === 'error-fallback') {
    return 'error';
  }
  if (metadata.model || metadata.modelUsed || metadata.aiUsed) {
    return 'gpt5';
  }
  return 'simple';
}

function buildHeader(metadata) {
  const headerType = getHeaderType(metadata);
  const modelName = getModelName(metadata);
  const template = HEADERS[headerType];
  
  if (!template) return HEADERS.simple;
  
  return {
    top: template.top,
    title: template.title,
    model: template.model.replace('{MODEL}', modelName),
    bottom: template.bottom
  };
}

function cleanText(text) {
  const cleaned = safeString(text)
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\r/g, '\n')             // Handle old Mac line endings
    .replace(/\n{3,}/g, '\n\n')       // Collapse excessive newlines
    .replace(/[ \t]+$/gm, '')         // Remove trailing whitespace
    .trim();
  
  return cleaned;
}

// ═══════════════════════════════════════════════════════════════════════════
// SMART TEXT SPLITTING (PRESERVES CODE BLOCKS)
// ═══════════════════════════════════════════════════════════════════════════

function findSafeBreakpoint(text, maxLength) {
  if (text.length <= maxLength) return text.length;
  
  // Look for good breaking points near the limit with better logic
  const searchStart = Math.max(0, maxLength - 300); // Larger search area
  const searchText = text.substring(searchStart, maxLength);
  
  // Priority 1: Break at section boundaries (double newlines)
  const sectionBreak = searchText.lastIndexOf('\n\n');
  if (sectionBreak !== -1) {
    return searchStart + sectionBreak + 2;
  }
  
  // Priority 2: Break at paragraph or list end
  const listEnd = searchText.lastIndexOf('\n• ');
  if (listEnd !== -1) {
    const nextNewline = text.indexOf('\n', searchStart + listEnd + 1);
    if (nextNewline !== -1 && nextNewline < maxLength) {
      return nextNewline + 1;
    }
  }
  
  // Priority 3: Break at sentence boundaries
  const sentenceBreak = searchText.lastIndexOf('. ');
  if (sentenceBreak !== -1) {
    return searchStart + sentenceBreak + 2;
  }
  
  // Priority 4: Break at any newline
  const lineBreak = searchText.lastIndexOf('\n');
  if (lineBreak !== -1) {
    return searchStart + lineBreak + 1;
  }
  
  // Priority 5: Word boundary
  const wordBreak = searchText.lastIndexOf(' ');
  if (wordBreak !== -1) {
    return searchStart + wordBreak + 1;
  }
  
  // Last resort: hard break
  return maxLength;
}

function isInsideCodeBlock(text, position) {
  // Check if position is inside a ``` code block
  const beforePosition = text.substring(0, position);
  const codeBlockMatches = beforePosition.match(/```/g);
  
  // If odd number of ```, we're inside a code block
  return codeBlockMatches && codeBlockMatches.length % 2 === 1;
}

function splitTextSafely(text, maxChunkSize) {
  const cleanedText = cleanText(text);
  
  if (cleanedText.length <= maxChunkSize) {
    return [cleanedText];
  }
  
  const chunks = [];
  let remaining = cleanedText;
  let chunkCount = 0;
  
  while (remaining.length > 0 && chunkCount < MAX_CHUNKS) {
    let breakpoint;
    
    if (remaining.length <= maxChunkSize) {
      // Last chunk
      chunks.push(remaining);
      break;
    }
    
    // Find safe breakpoint, avoiding code blocks
    breakpoint = findSafeBreakpoint(remaining, maxChunkSize);
    
    // Double-check we're not breaking inside code block
    if (isInsideCodeBlock(remaining, breakpoint)) {
      // Find the end of the current code block
      const codeBlockEnd = remaining.indexOf('```', breakpoint);
      if (codeBlockEnd !== -1 && codeBlockEnd < maxChunkSize * 1.5) {
        breakpoint = codeBlockEnd + 3;
      } else {
        // Code block is too long, break at safe word boundary
        const wordBoundary = remaining.lastIndexOf(' ', maxChunkSize - 100);
        breakpoint = wordBoundary > 0 ? wordBoundary : maxChunkSize - 100;
      }
    }
    
    const chunk = remaining.substring(0, breakpoint).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    remaining = remaining.substring(breakpoint).trim();
    chunkCount++;
  }
  
  // Handle remaining text if we hit max chunks
  if (remaining.length > 0 && chunkCount >= MAX_CHUNKS) {
    const lastChunk = chunks[chunks.length - 1] || '';
    if (lastChunk.length + remaining.length <= TELEGRAM_LIMIT) {
      chunks[chunks.length - 1] = lastChunk + '\n\n' + remaining;
    } else {
      chunks.push('...[Response truncated due to length]');
    }
  }
  
  return chunks.filter(chunk => chunk.length > 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SENDING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function sendSingleMessage(bot, chatId, text, parseMode = 'Markdown') {
  try {
    const result = await bot.sendMessage(chatId, text, { 
      parse_mode: parseMode,
      disable_web_page_preview: true
    });
    return { success: true, result };
  } catch (error) {
    // Try again without Markdown if it failed
    if (parseMode === 'Markdown') {
      try {
        const result = await bot.sendMessage(chatId, text, {
          disable_web_page_preview: true
        });
        return { success: true, result, fallback: true };
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message };
      }
    }
    return { success: false, error: error.message };
  }
}

async function sendTelegramMessage(bot, chatId, text, metadata = {}) {
  const startTime = Date.now();
  
  try {
    console.log(`[TelegramSplitter] 📱 Sending message to ${chatId}...`);
    
    // Validate inputs
    if (!bot || typeof bot.sendMessage !== 'function') {
      throw new Error('Valid Telegram bot instance required');
    }
    
    if (!chatId) {
      throw new Error('ChatId is required');
    }
    
    const cleanedText = cleanText(text);
    if (!cleanedText) {
      throw new Error('Message text is empty');
    }
    
    // Build header
    const header = buildHeader(metadata);
    const headerText = [
      header.top,
      header.title,
      header.model,
      header.bottom
    ].join('\n');
    
    // Calculate available space for content
    const availableSpace = SAFE_CHUNK_SIZE - headerText.length - 50; // Extra safety margin
    
    // Split text into manageable chunks
    const textChunks = splitTextSafely(cleanedText, availableSpace);
    
    console.log(`[TelegramSplitter] Split into ${textChunks.length} chunks`);
    
    // Send messages
    const results = [];
    let successCount = 0;
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const isFirstChunk = i === 0;
      const isLastChunk = i === textChunks.length - 1;
      
      // Add header only to first chunk
      const messageText = isFirstChunk 
        ? `${headerText}\n${chunk}`
        : chunk;
      
      // Add chunk indicator for multiple chunks
      const finalText = textChunks.length > 1 && !isFirstChunk
        ? `📄 Part ${i + 1}/${textChunks.length}\n\n${messageText}`
        : messageText;
      
      const result = await sendSingleMessage(bot, chatId, finalText);
      results.push(result);
      
      if (result.success) {
        successCount++;
        console.log(`[TelegramSplitter] ✅ Sent chunk ${i + 1}/${textChunks.length}`);
      } else {
        console.error(`[TelegramSplitter] ❌ Failed to send chunk ${i + 1}: ${result.error}`);
      }
      
      // Small delay between messages to avoid rate limiting
      if (!isLastChunk) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const processingTime = Date.now() - startTime;
    const allSuccessful = successCount === textChunks.length;
    
    console.log(`[TelegramSplitter] ${allSuccessful ? '✅' : '⚠️'} Complete: ${successCount}/${textChunks.length} chunks sent (${processingTime}ms)`);
    
    return {
      success: allSuccessful,
      enhanced: true,
      chunks: textChunks.length,
      sent: successCount,
      failed: textChunks.length - successCount,
      processingTime,
      model: getModelName(metadata),
      headerType: getHeaderType(metadata),
      results,
      fallback: results.some(r => r.fallback)
    };
    
  } catch (error) {
    console.error('[TelegramSplitter] ❌ Critical error:', error.message);
    
    // Emergency fallback - try to send basic message
    try {
      await bot.sendMessage(chatId, `⚠️ System Error\n\n${safeString(text).substring(0, 1000)}...`);
      return {
        success: true,
        enhanced: false,
        emergency: true,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    } catch (emergencyError) {
      return {
        success: false,
        error: error.message,
        emergencyError: emergencyError.message,
        processingTime: Date.now() - startTime
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS & ALIASES
// ═══════════════════════════════════════════════════════════════════════════

// Setup function for your dualCommandSystem integration
function setupTelegramHandler(bot) {
  return {
    send: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
    sendMessage: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
    sendGPTResponse: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
    sendError: async (chatId, errorText, title = 'System Error') => {
      return sendTelegramMessage(bot, chatId, errorText, {
        model: 'error-handler',
        aiUsed: 'error-fallback',
        title,
        error: true
      });
    }
  };
}

// Alert function for system notifications
async function sendAlert(bot, chatId, message, title = 'System Alert') {
  return sendTelegramMessage(bot, chatId, message, {
    model: 'alert-system',
    title,
    error: true,
    aiUsed: 'system-alert'
  });
}

// Test function to verify Telegram bot connectivity
async function testTelegramConnection(bot, chatId) {
  try {
    const testMessage = 'System connectivity test successful! ✅';
    const result = await sendTelegramMessage(bot, chatId, testMessage, {
      model: 'test-system',
      aiUsed: 'connection-test'
    });
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Main function (matches your dualCommandSystem expectations)
  sendTelegramMessage,
  
  // Helper functions
  setupTelegramHandler,
  sendAlert,
  testTelegramConnection,
  
  // Aliases for compatibility with existing code
  sendMessage: sendTelegramMessage,
  sendGPTResponse: sendTelegramMessage,
  send: sendTelegramMessage,
  
  // Utility functions
  cleanText,
  splitTextSafely,
  safeString,
  
  // Constants
  TELEGRAM_LIMIT,
  SAFE_CHUNK_SIZE,
  MAX_CHUNKS,
  HEADERS
};

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP & INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

console.log('✅ CLEAN Telegram Splitter loaded successfully');
console.log('📱 Features:');
console.log('   • Smart text splitting (preserves code blocks)');
console.log('   • Beautiful headers for different response types');  
console.log('   • Automatic Markdown fallback');
console.log('   • Memory integration compatible');
console.log('   • Rate limiting protection');
console.log('   • Emergency fallback system');
console.log('   • Maximum 10 chunks per response (prevents spam)');
console.log('   • Compatible with dualCommandSystem.js');
console.log('');
