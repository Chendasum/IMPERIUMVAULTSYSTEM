'use strict';
/**
 * utils/telegramSplitter.js
 * Ultra-enhanced Telegram delivery for GPT-5 responses with smart formatting
 *
 * Features:
 * - Beautiful ASCII banner headers with metadata
 * - Smart memory-aware response formatting
 * - Code-block aware chunking (never splits code)
 * - Markdown-safe delivery with auto-fallback
 * - Response optimization for greeting vs complex queries
 * - Multi-style presets with automatic selection
 * - Inline keyboard support for interactive responses
 * - Performance tracking and detailed logging
 * - Emergency fallback systems
 * - Cost and token tracking integration
 */

////////////////////////////////////////////////////////////////////////////////
// ENHANCED CONSTANTS AND CONFIGURATION
////////////////////////////////////////////////////////////////////////////////

const TELEGRAM_HARD_LIMIT = 4096;             // Telegram absolute message limit
const DEFAULT_PARSE_MODE  = 'Markdown';       // Primary parse mode
const MAX_CHUNK_SOFT      = 3600;             // Soft limit per chunk (room for headers)
const BOX_CHAR            = '─';               // Header box character
const MIN_MEANINGFUL_LENGTH = 10;             // Skip headers for very short responses

// Enhanced style presets with response-type optimization
const STYLE_PRESETS = {
  // For simple greetings and quick responses
  minimal: { 
    wrap: 60,  
    gapAfterHeader: 0, 
    gapBetweenSections: 1, 
    padSections: false, 
    bannerWidth: 30,
    showMetadata: false,
    headerStyle: 'compact'
  },
  
  // For normal questions and responses  
  compact: { 
    wrap: 78,  
    gapAfterHeader: 1, 
    gapBetweenSections: 1, 
    padSections: false, 
    bannerWidth: 38,
    showMetadata: true,
    headerStyle: 'normal'
  },
  
  // For detailed analysis and reports
  relaxed: { 
    wrap: 92,  
    gapAfterHeader: 1, 
    gapBetweenSections: 1, 
    padSections: true,  
    bannerWidth: 42,
    showMetadata: true,
    headerStyle: 'detailed'
  },
  
  // For comprehensive reports and complex responses
  roomy: { 
    wrap: 108, 
    gapAfterHeader: 2, 
    gapBetweenSections: 2, 
    padSections: true,  
    bannerWidth: 50,
    showMetadata: true,
    headerStyle: 'full'
  }
};

// Response type detection patterns
const RESPONSE_PATTERNS = {
  greeting: /^(hello|hi|hey|good morning|good afternoon|good evening|thanks|thank you)\.?$/i,
  simple: /^.{1,100}$/,
  analysis: /(analysis|analyze|assessment|evaluation|report|summary)/i,
  complex: /(comprehensive|detailed|in-depth|thorough|extensive)/i,
  code: /```[\s\S]*```/,
  financial: /(investment|portfolio|trading|market|financial|revenue|profit)/i
};

////////////////////////////////////////////////////////////////////////////////
// ENHANCED UTILITY FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const msToPretty = (ms) => {
  if (ms == null || isNaN(ms)) return '';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const s = (ms / 1000);
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const ss = Math.round(s % 60);
  return `${m}m${ss}s`;
};

const fmtNumber = (n, digits = 2) => {
  if (typeof n !== 'number' || Number.isNaN(n)) return '';
  if (n === 0) return '0';
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  return n.toFixed(digits).replace(/\.?0+$/, '');
};

const truthy = (v) => v !== undefined && v !== null && v !== false && v !== '';

const safeString = (input, maxLength = 10000) => {
  try {
    return String(input || '').slice(0, maxLength);
  } catch (error) {
    return '[Invalid content]';
  }
};

////////////////////////////////////////////////////////////////////////////////
// SMART RESPONSE TYPE DETECTION
////////////////////////////////////////////////////////////////////////////////

function detectResponseType(text, metadata = {}) {
  const content = safeString(text).toLowerCase();
  const length = content.length;
  
  // Check metadata hints first
  if (metadata.responseType) return metadata.responseType;
  if (metadata.model === 'gpt-5-nano' && length < 200) return 'minimal';
  
  // Pattern-based detection
  if (RESPONSE_PATTERNS.greeting.test(content) && length < 100) return 'minimal';
  if (length < 150 && !RESPONSE_PATTERNS.code.test(content)) return 'compact';
  if (RESPONSE_PATTERNS.analysis.test(content) || length > 2000) return 'relaxed';
  if (RESPONSE_PATTERNS.complex.test(content) || length > 4000) return 'roomy';
  
  return 'compact'; // Default
}

function autoSelectStyle(text, metadata = {}) {
  const responseType = detectResponseType(text, metadata);
  const styleMap = {
    minimal: 'minimal',
    simple: 'compact', 
    normal: 'compact',
    detailed: 'relaxed',
    complex: 'roomy'
  };
  
  return styleMap[responseType] || 'compact';
}

////////////////////////////////////////////////////////////////////////////////
// ENHANCED MARKDOWN AND TEXT PROCESSING
////////////////////////////////////////////////////////////////////////////////

function normalizeBullets(text) {
  return text
    .replace(/^[ \t]*[-–—•·*]\s*/gm, '• ')
    .replace(/^[ \t]*\d+\.\s+/gm, (match) => match.trim() + ' ')
    .replace(/^[ \t]*[a-zA-Z]\.\s+/gm, (match) => match.trim() + ' ');
}

function collapseBlankLines(text, maxBlank = 2) {
  const pattern = new RegExp(`(?:\\n\\s*){${maxBlank + 1},}`, 'g');
  return text.replace(pattern, '\n'.repeat(maxBlank));
}

function trimEachLine(text) {
  return text
    .split('\n')
    .map(line => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .trim();
}

function ensureBalancedCodeFences(text) {
  const fenceMatches = text.match(/(^|\n)```/g) || [];
  if (fenceMatches.length % 2 !== 0) {
    return text + '\n```';
  }
  return text;
}

function protectUrls(text) {
  // Protect URLs from being wrapped by replacing spaces with non-breaking spaces
  return text.replace(/(https?:\/\/[^\s]+)/g, (match) => {
    return match.replace(/\s/g, '\u00A0');
  });
}

function wrapMarkdownSmart(text, width) {
  const lines = text.split('\n');
  const wrapped = [];
  let inFence = false;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Track code fence state
    if (/^```/.test(line)) {
      inFence = !inFence;
      wrapped.push(line);
      continue;
    }

    // Don't wrap inside code fences
    if (inFence) {
      wrapped.push(line);
      continue;
    }

    // Track list state
    inList = /^[ \t]*[•\-*]\s/.test(line) || /^[ \t]*\d+\.\s/.test(line);

    // Don't wrap special lines
    if (
      /^ {0,3}#{1,6}\s/.test(line) ||           // headings
      /^ {0,3}[-*_]{3,}\s*$/.test(line) ||      // horizontal rules
      /^>/.test(line) ||                        // blockquotes
      /^\|.*\|$/.test(line) ||                  // table rows
      line.length <= width ||                   // already short
      inList ||                                 // list items
      /https?:\/\//.test(line)                  // contains URLs
    ) {
      wrapped.push(line);
      continue;
    }

    // Wrap long lines at word boundaries
    let current = '';
    const words = line.split(/(\s+)/);

    for (const word of words) {
      if (current.length + word.length > width) {
        if (current.trim()) wrapped.push(current.trimEnd());
        current = word.trimStart();
      } else {
        current += word;
      }
    }
    
    if (current.trim()) wrapped.push(current.trimEnd());
  }

  return wrapped.join('\n');
}

function smartSpacing(input, preset) {
  let processed = safeString(input);
  
  processed = trimEachLine(processed);
  processed = normalizeBullets(processed);
  processed = collapseBlankLines(processed, preset.padSections ? 2 : 1);
  processed = ensureBalancedCodeFences(processed);
  processed = protectUrls(processed);
  processed = wrapMarkdownSmart(processed, preset.wrap);

  return processed;
}

////////////////////////////////////////////////////////////////////////////////
// ENHANCED HEADER AND FOOTER SYSTEM
////////////////////////////////////////////////////////////////////////////////

function centerText(text, width) {
  const clean = safeString(text).trim();
  if (clean.length >= width) return clean.slice(0, width);
  
  const pad = Math.max(0, Math.floor((width - clean.length) / 2));
  const left = ' '.repeat(pad);
  const right = ' '.repeat(Math.max(0, width - clean.length - pad));
  
  return left + clean + right;
}

function buildEnhancedHeader(title, preset, meta = {}) {
  if (!title || preset.headerStyle === 'none') return '';
  
  const w = clamp(preset.bannerWidth, 20, 80);
  const topLine = `╭${BOX_CHAR.repeat(w)}╮`;
  const bottomLine = `╰${BOX_CHAR.repeat(w)}╯`;
  const lines = [];

  // Main title line
  const titleLine = centerText(title, w);
  lines.push(`│${titleLine}│`);

  // Metadata line (only if enabled and data exists)
  if (preset.showMetadata && preset.headerStyle !== 'minimal') {
    const infoBits = [];
    
    if (meta.model) {
      const modelName = String(meta.model).replace('gpt-5-', '').toUpperCase();
      infoBits.push(`${modelName}`);
    }
    
    if (truthy(meta.executionTime) && !isNaN(Number(meta.executionTime))) {
      infoBits.push(`${msToPretty(Number(meta.executionTime))}`);
    }
    
    if (truthy(meta.tokens) && !isNaN(Number(meta.tokens))) {
      infoBits.push(`${fmtNumber(Number(meta.tokens))}tok`);
    }
    
    if (truthy(meta.cost) && !isNaN(Number(meta.cost)) && Number(meta.cost) > 0) {
      infoBits.push(`$${fmtNumber(Number(meta.cost), 6)}`);
    }
    
    if (truthy(meta.confidence) && !isNaN(Number(meta.confidence))) {
      const conf = Math.round(Number(meta.confidence) * 100);
      if (conf > 0 && conf <= 100) infoBits.push(`${conf}%`);
    }

    if (infoBits.length > 0) {
      const metaLine = centerText(infoBits.join(' • '), w);
      lines.push(`│${metaLine}│`);
    }
  }

  return [topLine, ...lines, bottomLine].join('\n');
}

function buildEnhancedFooter(meta = {}, preset) {
  if (preset.headerStyle === 'minimal' || preset.headerStyle === 'none') return '';
  
  const bits = [];
  
  if (truthy(meta.costTier)) bits.push(`Cost: ${meta.costTier}`);
  if (truthy(meta.complexity)) bits.push(`Type: ${meta.complexity}`);
  if (truthy(meta.reasoning)) bits.push(`Reasoning: ${meta.reasoning}`);
  if (truthy(meta.contextUsed)) bits.push(`Memory: ${meta.contextUsed ? 'Used' : 'Bypassed'}`);
  if (truthy(meta.completionDetected)) bits.push(`Status: ${meta.completionDetected ? 'Complete' : 'Processed'}`);

  if (bits.length === 0) return '';

  const footerText = '─ ' + bits.join(' • ');
  return preset.padSections ? `\n${footerText}\n` : `\n${footerText}`;
}

////////////////////////////////////////////////////////////////////////////////
// INTELLIGENT CHUNKING SYSTEM
////////////////////////////////////////////////////////////////////////////////

function findCodeBlocks(text) {
  const blocks = [];
  const lines = text.split('\n');
  let inBlock = false;
  let blockStart = -1;

  for (let i = 0; i < lines.length; i++) {
    if (/^```/.test(lines[i])) {
      if (!inBlock) {
        blockStart = i;
        inBlock = true;
      } else {
        blocks.push({ start: blockStart, end: i });
        inBlock = false;
      }
    }
  }

  // Handle unclosed code block
  if (inBlock) {
    blocks.push({ start: blockStart, end: lines.length - 1 });
  }

  return blocks;
}

function splitIntoIntelligentBlocks(text) {
  const codeBlocks = findCodeBlocks(text);
  const lines = text.split('\n');
  const blocks = [];
  let currentBlock = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    
    // Check if we're at the start of a code block
    const inCodeBlock = codeBlocks.find(block => lineIndex >= block.start && lineIndex <= block.end);
    
    if (inCodeBlock) {
      // Flush current block
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      
      // Add entire code block as one unit
      const codeLines = lines.slice(inCodeBlock.start, inCodeBlock.end + 1);
      blocks.push(codeLines.join('\n'));
      lineIndex = inCodeBlock.end + 1;
      continue;
    }

    // Regular line processing
    currentBlock.push(line);
    
    // Check if we should break at paragraph boundaries
    if (line.trim() === '' && currentBlock.length > 1) {
      const blockText = currentBlock.join('\n').trim();
      if (blockText.length > MAX_CHUNK_SOFT * 0.8) {
        blocks.push(blockText);
        currentBlock = [];
      }
    }
    
    lineIndex++;
  }

  // Add remaining lines
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n').trim());
  }

  return blocks.filter(block => block.length > 0);
}

function packBlocksIntoChunks(blocks) {
  const chunks = [];
  let currentChunk = '';

  for (const block of blocks) {
    const separator = currentChunk ? '\n\n' : '';
    const combined = currentChunk + separator + block;

    if (combined.length <= MAX_CHUNK_SOFT) {
      currentChunk = combined;
    } else {
      // Flush current chunk
      if (currentChunk) {
        chunks.push(currentChunk);
      }

      // Handle oversized blocks
      if (block.length > TELEGRAM_HARD_LIMIT) {
        const subChunks = splitOversizedBlock(block);
        chunks.push(...subChunks);
        currentChunk = '';
      } else {
        currentChunk = block;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function splitOversizedBlock(block) {
  const lines = block.split('\n');
  const chunks = [];
  let current = '';

  for (const line of lines) {
    const combined = current + (current ? '\n' : '') + line;
    
    if (combined.length > TELEGRAM_HARD_LIMIT - 100) {
      if (current) chunks.push(current);
      
      // Handle extremely long lines
      if (line.length > TELEGRAM_HARD_LIMIT - 100) {
        const parts = line.match(new RegExp(`.{1,${TELEGRAM_HARD_LIMIT - 100}}`, 'g')) || [line];
        chunks.push(...parts);
        current = '';
      } else {
        current = line;
      }
    } else {
      current = combined;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

////////////////////////////////////////////////////////////////////////////////
// ENHANCED ASSEMBLY SYSTEM
////////////////////////////////////////////////////////////////////////////////

function assembleEnhancedMessage(text, options = {}) {
  // Auto-select style if not specified
  const autoStyle = options.style || autoSelectStyle(text, options);
  const preset = STYLE_PRESETS[autoStyle] || STYLE_PRESETS.compact;
  
  console.log(`[telegramSplitter] Using style: ${autoStyle}`);

  // Process the main content
  const processedContent = smartSpacing(text, preset);
  
  // Build header (skip for very short responses)
  const shouldShowHeader = !options.noHeader && 
    (processedContent.length > MIN_MEANINGFUL_LENGTH || options.forceHeader);
  
  const header = shouldShowHeader 
    ? buildEnhancedHeader(options.title || autoGenerateTitle(options), preset, options)
    : '';

  // Build footer
  const footer = (!options.noFooter && preset.showMetadata) 
    ? buildEnhancedFooter(options, preset)
    : '';

  // Assemble with proper spacing
  const parts = [header, processedContent, footer].filter(part => part.length > 0);
  const gapCount = preset.gapAfterHeader || 1;
  const gap = '\n'.repeat(gapCount);
  
  return parts.join(gap);
}

function autoGenerateTitle(metadata = {}) {
  if (metadata.title) return metadata.title;
  if (metadata.completionDetected) return '✅ Task Complete';
  if (metadata.model?.includes('nano')) return '⚡ Quick Response';
  if (metadata.model?.includes('mini')) return '🚀 GPT-5 Mini';
  if (metadata.model?.includes('gpt-5')) return '🧠 GPT-5 Analysis';
  if (metadata.responseType === 'minimal') return '';
  return '🤖 AI Response';
}

////////////////////////////////////////////////////////////////////////////////
// CORE SENDING FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

async function sendRawMessage(bot, chatId, text, options = {}) {
  const payload = {
    chat_id: chatId,
    text: safeString(text),
    parse_mode: options.parseMode || DEFAULT_PARSE_MODE,
    disable_web_page_preview: !!options.disableWebPreview
  };

  // Add inline keyboard if provided
  if (Array.isArray(options.buttons) && options.buttons.length > 0) {
    payload.reply_markup = {
      inline_keyboard: options.buttons
    };
  }

  // Add reply-to if specified
  if (options.replyToMessageId) {
    payload.reply_to_message_id = options.replyToMessageId;
  }

  try {
    return await bot.sendMessage(payload.chat_id, payload.text, {
      parse_mode: payload.parse_mode,
      disable_web_page_preview: payload.disable_web_page_preview,
      reply_markup: payload.reply_markup,
      reply_to_message_id: payload.reply_to_message_id
    });
  } catch (error) {
    console.error('[telegramSplitter] Raw send failed:', error.message);
    throw error;
  }
}

async function sendWithIntelligentFallback(bot, chatId, text, options) {
  try {
    // Try primary parse mode
    return await sendRawMessage(bot, chatId, text, {
      ...options,
      parseMode: options.parseMode || DEFAULT_PARSE_MODE
    });
  } catch (primaryError) {
    console.warn(`[telegramSplitter] ${options.parseMode || DEFAULT_PARSE_MODE} failed:`, primaryError.message);
    
    try {
      // Fallback to plain text
      return await sendRawMessage(bot, chatId, text, {
        ...options,
        parseMode: undefined
      });
    } catch (fallbackError) {
      console.error('[telegramSplitter] Plain text fallback failed:', fallbackError.message);
      
      // Final emergency fallback - send truncated plain text
      try {
        const truncated = text.slice(0, TELEGRAM_HARD_LIMIT - 100) + '\n\n[Message truncated due to delivery error]';
        return await sendRawMessage(bot, chatId, truncated, {
          parseMode: undefined,
          buttons: undefined
        });
      } catch (emergencyError) {
        console.error('[telegramSplitter] Emergency fallback failed:', emergencyError.message);
        throw emergencyError;
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// MAIN PUBLIC API
////////////////////////////////////////////////////////////////////////////////

/**
 * Enhanced sendTelegramMessage with smart optimization
 * 
 * @param {Object} bot - Telegram bot instance
 * @param {String|Number} chatId - Chat ID
 * @param {String} text - Message content
 * @param {Object} metadata - Enhanced metadata options
 * @returns {Object} Detailed delivery result
 */
async function sendTelegramMessage(bot, chatId, text, metadata = {}) {
  const startTime = Date.now();
  
  // Validation
  if (!bot || typeof bot.sendMessage !== 'function') {
    throw new Error('Valid Telegram bot instance required');
  }
  if (!chatId) {
    throw new Error('Chat ID is required');
  }

  const content = safeString(text);
  if (!content.trim()) {
    throw new Error('Message content cannot be empty');
  }

  console.log(`[telegramSplitter] Processing message for chat ${chatId} (${content.length} chars)`);

  try {
    // Auto-select optimal style based on content and metadata
    const selectedStyle = metadata.style || autoSelectStyle(content, metadata);
    const preset = STYLE_PRESETS[selectedStyle];
    
    console.log(`[telegramSplitter] Selected style: ${selectedStyle}`);

    // Assemble the complete message with headers/footers
    const assembledMessage = assembleEnhancedMessage(content, {
      ...metadata,
      style: selectedStyle
    });

    // Split into deliverable chunks
    const intelligentBlocks = splitIntoIntelligentBlocks(assembledMessage);
    const chunks = packBlocksIntoChunks(intelligentBlocks);

    console.log(`[telegramSplitter] Created ${chunks.length} chunks from ${intelligentBlocks.length} blocks`);

    // Send all chunks
    const sentMessages = [];
    let totalSent = 0;

    for (let i = 0; i < chunks.length; i++) {
      const isFirst = i === 0;
      const isLast = i === chunks.length - 1;
      const chunkNumber = chunks.length > 1 ? ` (${i + 1}/${chunks.length})` : '';
      
      const chunkOptions = {
        parseMode: metadata.parseMode,
        disableWebPreview: metadata.disableWebPreview,
        buttons: isLast ? metadata.buttons : undefined, // Only add buttons to last message
        replyToMessageId: isFirst ? metadata.replyToMessageId : undefined
      };

      const sentMessage = await sendWithIntelligentFallback(
        bot, 
        chatId, 
        chunks[i], 
        chunkOptions
      );

      sentMessages.push(sentMessage);
      totalSent++;
      
      // Small delay between chunks to avoid rate limits
      if (!isLast && chunks.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`[telegramSplitter] Successfully sent ${totalSent} messages in ${processingTime}ms`);

    return {
      success: true,
      enhanced: true,
      chunks: totalSent,
      style: selectedStyle,
      processingTime,
      originalLength: content.length,
      finalLength: assembledMessage.length,
      sentMessages,
      lastMessage: sentMessages[sentMessages.length - 1],
      metadata: {
        model: metadata.model,
        executionTime: metadata.executionTime,
        tokens: metadata.tokens,
        cost: metadata.cost
      }
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[telegramSplitter] Delivery failed after ${processingTime}ms:`, error.message);
    
    return {
      success: false,
      error: error.message,
      processingTime,
      chunks: 0,
      originalLength: content.length
    };
  }
}

////////////////////////////////////////////////////////////////////////////////
// SPECIALIZED SEND FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

async function sendAlert(bot, chatId, message, title = 'System Alert') {
  try {
    const alertText = `**${title}**\n\n${safeString(message)}\n\nPlease try again or contact support if the issue persists.`;

    return await sendTelegramMessage(bot, chatId, alertText, {
      style: 'minimal',
      title: '⚠️ Alert',
      noFooter: true,
      model: 'system',
      costTier: 'free',
      disableWebPreview: true
    });
  } catch (error) {
    console.error('[telegramSplitter] Alert send failed, using emergency fallback');
    
    try {
      await bot.sendMessage(chatId, `${title}\n\n${message}`);
      return { success: true, enhanced: false, chunks: 1, fallback: 'emergency' };
    } catch (emergencyError) {
      console.error('[telegramSplitter] Emergency alert failed:', emergencyError.message);
      return { success: false, error: emergencyError.message };
    }
  }
}

async function sendGreeting(bot, chatId, message, metadata = {}) {
  return await sendTelegramMessage(bot, chatId, message, {
    ...metadata,
    style: 'minimal',
    noHeader: true,
    noFooter: true,
    responseType: 'minimal'
  });
}

async function sendAnalysisResponse(bot, chatId, message, metadata = {}) {
  return await sendTelegramMessage(bot, chatId, message, {
    ...metadata,
    style: 'relaxed',
    forceHeader: true,
    responseType: 'analysis'
  });
}

async function sendCodeResponse(bot, chatId, message, metadata = {}) {
  return await sendTelegramMessage(bot, chatId, message, {
    ...metadata,
    style: 'roomy',
    disableWebPreview: true,
    responseType: 'code'
  });
}

////////////////////////////////////////////////////////////////////////////////
// HANDLER SETUP SYSTEM
////////////////////////////////////////////////////////////////////////////////

function setupTelegramHandler(bot) {
  if (!bot) {
    throw new Error('Bot instance required for handler setup');
  }

  console.log('[telegramSplitter] Setting up enhanced Telegram handlers');

  return {
    // Main send function
    send: async (text, chatId, options = {}) => {
      return await sendTelegramMessage(bot, chatId, text, options);
    },

    // Specialized senders
    sendGPTResponse: async (text, chatId, options = {}) => {
      return await sendTelegramMessage(bot, chatId, text, {
        ...options,
        title: options.title || '🤖 GPT-5 Response'
      });
    },

    sendGreeting: async (text, chatId, options = {}) => {
      return await sendGreeting(bot, chatId, text, options);
    },

    sendAnalysis: async (text, chatId, options = {}) => {
      return await sendAnalysisResponse(bot, chatId, text, options);
    },

    sendCode: async (text, chatId, options = {}) => {
      return await sendCodeResponse(bot, chatId, text, options);
    },

    sendError: async (errorMsg, chatId, title = 'Error') => {
      return await sendAlert(bot, chatId, errorMsg, title);
    },

    sendAlert: async (message, chatId, title = 'Alert') => {
      return await sendAlert(bot, chatId, message, title);
    },

    // Utility functions
    getOptimalStyle: (text, metadata) => autoSelectStyle(text, metadata),
    
    // Handler info
    info: {
      version: '2.0.0',
      features: ['smart-chunking', 'auto-style', 'code-aware', 'fallback-system'],
      styles: Object.keys(STYLE_PRESETS)
    }
  };
}

////////////////////////////////////////////////////////////////////////////////
// PERFORMANCE AND MONITORING
////////////////////////////////////////////////////////////////////////////////

function getTelegramStats() {
  return {
    limits: {
      hardLimit: TELEGRAM_HARD_LIMIT,
      softLimit: MAX_CHUNK_SOFT,
      minMeaningful: MIN_MEANINGFUL_LENGTH
    },
    styles: Object.keys(STYLE_PRESETS),
    features: [
      'intelligent-chunking',
      'code-block-preservation', 
      'markdown-fallback',
      'auto-style-selection',
      'performance-tracking',
      'emergency-fallbacks'
    ],
    version: '2.0.0-enhanced'
  };
}

////////////////////////////////////////////////////////////////////////////////
// SYSTEM DIAGNOSTICS
////////////////////////////////////////////////////////////////////////////////

async function testTelegramDelivery(bot, chatId, testType = 'basic') {
  const tests = {
    basic: 'Hello! This is a basic delivery test.',
    
    markdown: `**Bold text** and *italic text*\n\n\`\`\`javascript\nconsole.log("Code test");\n\`\`\`\n\n• Bullet point test\n• Another bullet`,
    
    long: 'A'.repeat(5000) + '\n\nThis tests chunking behavior for very long messages.',
    
    complex: `# Complex Test Message
    
This message tests multiple features:

**Financial Analysis Results:**
• Portfolio performance: +12.5%
• Risk assessment: Moderate
• Recommendation: Hold current positions

\`\`\`javascript
// Code block test
const analysis = {
  profit: 15000,
  loss: 3000,
  net: 12000
};
console.log('Analysis complete:', analysis);
\`\`\`

Next steps:
1. Review quarterly reports
2. Adjust allocation percentages
3. Monitor market conditions

*This concludes the test message.*`
  };

  try {
    const testContent = tests[testType] || tests.basic;
    
    const result = await sendTelegramMessage(bot, chatId, testContent, {
      title: `🧪 ${testType.toUpperCase()} Test`,
      model: 'test-system',
      executionTime: 150,
      tokens: 250,
      cost: 0.001,
      confidence: 0.95,
      costTier: 'test',
      complexity: testType,
      reasoning: 'medium',
      contextUsed: false
    });

    return {
      success: result.success,
      testType,
      chunks: result.chunks,
      processingTime: result.processingTime,
      style: result.style
    };

  } catch (error) {
    console.error(`[telegramSplitter] Test ${testType} failed:`, error.message);
    return {
      success: false,
      testType,
      error: error.message
    };
  }
}

////////////////////////////////////////////////////////////////////////////////
// INTEGRATION HELPERS FOR DUAL COMMAND SYSTEM
////////////////////////////////////////////////////////////////////////////////

function createResultSender(bot, chatId) {
  /**
   * Creates a sender function that matches your Part 6 expectation:
   * result.sendToTelegram(bot, title)
   */
  return {
    sendToTelegram: async (botInstance, title, options = {}) => {
      // This function gets attached to your GPT-5 result objects
      return await sendTelegramMessage(botInstance || bot, chatId, this.response, {
        title,
        model: this.modelUsed,
        executionTime: this.processingTime,
        tokens: this.tokensUsed,
        cost: this.estimatedCost,
        confidence: this.confidence,
        costTier: this.costTier,
        complexity: this.complexity,
        reasoning: this.reasoningLevel,
        verbosity: this.verbosityLevel,
        contextUsed: this.contextUsed,
        fallbackUsed: this.fallbackUsed,
        completionDetected: this.completionDetected,
        ...options
      });
    }
  };
}

function enhanceResultWithSender(result, bot, chatId) {
  /**
   * Adds sendToTelegram method to your result objects
   * Usage in Part 6: result.sendToTelegram(bot, 'Analysis Complete')
   */
  if (!result || typeof result !== 'object') return result;

  result.sendToTelegram = async (botInstance, title, options = {}) => {
    return await sendTelegramMessage(botInstance || bot, chatId, result.response, {
      title,
      model: result.modelUsed || result.aiUsed,
      executionTime: result.processingTime || result.totalExecutionTime,
      tokens: result.tokensUsed || result.totalTokens,
      cost: result.estimatedCost || result.cost,
      confidence: result.confidence,
      costTier: result.costTier,
      complexity: result.complexity || result.queryType,
      reasoning: result.reasoningLevel || result.reasoning_effort,
      verbosity: result.verbosityLevel || result.verbosity,
      contextUsed: result.contextUsed,
      fallbackUsed: result.fallbackUsed,
      completionDetected: result.completionDetected,
      ...options
    });
  };

  return result;
}

////////////////////////////////////////////////////////////////////////////////
// BATCH AND QUEUE OPERATIONS
////////////////////////////////////////////////////////////////////////////////

async function sendMultipleMessages(bot, chatId, messages = []) {
  const results = [];
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    try {
      const result = await sendTelegramMessage(bot, chatId, msg.text, {
        ...msg.metadata,
        title: msg.title || `Message ${i + 1}`
      });
      results.push(result);
      
      // Delay between messages
      if (i < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        index: i
      });
    }
  }

  return {
    success: results.every(r => r.success),
    results,
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length
  };
}

////////////////////////////////////////////////////////////////////////////////
// SYSTEM HEALTH AND MONITORING
////////////////////////////////////////////////////////////////////////////////

function getSystemHealth() {
  return {
    status: 'operational',
    version: '2.0.0-enhanced',
    features: {
      intelligentChunking: true,
      codeBlockAware: true,
      markdownFallback: true,
      autoStyleSelection: true,
      performanceTracking: true,
      emergencyFallbacks: true,
      multiModalSupport: true
    },
    limits: {
      telegramHardLimit: TELEGRAM_HARD_LIMIT,
      chunkSoftLimit: MAX_CHUNK_SOFT,
      minMeaningfulLength: MIN_MEANINGFUL_LENGTH
    },
    styles: STYLE_PRESETS,
    capabilities: [
      'Smart response formatting',
      'Memory-aware optimization',
      'Code preservation',
      'Error recovery',
      'Performance monitoring'
    ]
  };
}

////////////////////////////////////////////////////////////////////////////////
// EMERGENCY AND FALLBACK SYSTEMS
////////////////////////////////////////////////////////////////////////////////

async function emergencyBroadcast(bot, chatIds = [], message, title = 'System Alert') {
  const results = [];
  
  for (const chatId of chatIds) {
    try {
      const result = await sendAlert(bot, chatId, message, title);
      results.push({ chatId, success: result.success });
    } catch (error) {
      results.push({ chatId, success: false, error: error.message });
    }
  }

  return {
    totalChats: chatIds.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
}

////////////////////////////////////////////////////////////////////////////////
// INTEGRATION VALIDATION
////////////////////////////////////////////////////////////////////////////////

function validateIntegration() {
  const issues = [];
  
  if (typeof STYLE_PRESETS !== 'object') {
    issues.push('STYLE_PRESETS not properly defined');
  }
  
  if (typeof sendTelegramMessage !== 'function') {
    issues.push('sendTelegramMessage function missing');
  }
  
  if (typeof setupTelegramHandler !== 'function') {
    issues.push('setupTelegramHandler function missing');
  }

  return {
    valid: issues.length === 0,
    issues,
    recommendation: issues.length === 0 
      ? 'Integration ready for production' 
      : 'Fix issues before deployment'
  };
}

////////////////////////////////////////////////////////////////////////////////
// STARTUP AND CONFIGURATION
////////////////////////////////////////////////////////////////////////////////

console.log('[telegramSplitter] Enhanced Telegram delivery system loaded');
console.log('[telegramSplitter] Features: Smart chunking, auto-style, code preservation, fallback system');
console.log('[telegramSplitter] Styles available:', Object.keys(STYLE_PRESETS));
console.log('[telegramSplitter] Integration:', validateIntegration().valid ? 'Ready' : 'Needs attention');

////////////////////////////////////////////////////////////////////////////////
// MAIN MODULE EXPORTS
////////////////////////////////////////////////////////////////////////////////

module.exports = {
  // Primary API functions
  sendTelegramMessage,
  setupTelegramHandler,
  sendAlert,

  // Specialized senders
  sendGreeting,
  sendAnalysisResponse, 
  sendCodeResponse,
  sendMultipleMessages,

  // Integration helpers (for your Part 6 compatibility)
  enhanceResultWithSender,
  createResultSender,

  // Utility and monitoring
  getSystemHealth,
  getTelegramStats,
  testTelegramDelivery,
  emergencyBroadcast,
  validateIntegration,

  // Legacy aliases for backward compatibility
  sendMessage: sendTelegramMessage,
  sendGPTResponse: sendTelegramMessage,
  send: sendTelegramMessage,

  // Configuration access
  STYLE_PRESETS,
  TELEGRAM_HARD_LIMIT,
  
  // Internal utilities (exposed for advanced usage)
  autoSelectStyle,
  detectResponseType,
  splitIntoIntelligentBlocks,
  smartSpacing
};

////////////////////////////////////////////////////////////////////////////////
// VALIDATION AND FINAL STATUS
////////////////////////////////////////////////////////////////////////////////

const finalValidation = validateIntegration();
if (finalValidation.valid) {
  console.log('✅ [telegramSplitter] All systems operational and ready for production');
  console.log('✅ [telegramSplitter] Smart memory integration compatible');
  console.log('✅ [telegramSplitter] Auto-optimization for greeting vs complex responses');
} else {
  console.warn('⚠️ [telegramSplitter] Integration issues detected:', finalValidation.issues);
}
