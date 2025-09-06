// utils/telegramSplitter.js — PROFESSIONAL CLEAN FORMATTING v3.0.0
// ═══════════════════════════════════════════════════════════════════════════
// Features:
// • Professional typography with smart spacing and clean layouts
// • Auto-formatting: sections, lists, code blocks, quotes
// • Clean headers with modern design and proper hierarchy
// • Smart text enhancement: emphasis, highlights, structure
// • Professional bullet points and numbered lists
// • Code syntax highlighting and proper formatting
// • Clean paragraph spacing and readability optimization
// • Auto-detection of content types (analysis, code, lists, etc.)
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

console.log('✨ Loading Professional Telegram Splitter v3.0.0');

const CONFIG = {
  TELEGRAM_LIMIT: 4096,
  SAFE_CHUNK_SIZE: parseInt(process.env.TELEGRAM_CHUNK_SIZE) || 3800,
  MAX_CHUNKS: parseInt(process.env.MAX_TELEGRAM_CHUNKS) || 20,
  RATE_LIMIT_DELAY: parseInt(process.env.TELEGRAM_DELAY_MS) || 150,
  MAX_RETRIES: parseInt(process.env.TELEGRAM_MAX_RETRIES) || 3,
  RETRY_DELAY: parseInt(process.env.TELEGRAM_RETRY_DELAY) || 1000,
  
  // Professional formatting toggles
  ENABLE_SMART_FORMATTING: process.env.TELEGRAM_SMART_FORMAT !== 'false',
  ENABLE_CLEAN_SPACING: process.env.TELEGRAM_CLEAN_SPACE !== 'false',
  ENABLE_PROFESSIONAL_HEADERS: process.env.TELEGRAM_PRO_HEADERS !== 'false',
  ENABLE_AUTO_EMPHASIS: process.env.TELEGRAM_AUTO_EMPHASIS !== 'false',
  ENABLE_SMART_BULLETS: process.env.TELEGRAM_SMART_BULLETS !== 'false',
  
  DEBUG_MODE: process.env.TELEGRAM_DEBUG === 'true',
  PARSE_MODE: process.env.TELEGRAM_PARSE_MODE || 'MarkdownV2'
};

// Professional header designs
const PROFESSIONAL_HEADERS = {
  gpt5: {
    template: `
┌─────────────────────────────────────────┐
│  {ICON} {MODEL} Response                    │
│                                         │
│  📅 {TIME}     📊 {PARTS} part(s)         │
└─────────────────────────────────────────┘`,
    icon: '🚀'
  },
  
  analysis: {
    template: `
╔═══════════════════════════════════════════╗
║  📊 ANALYSIS REPORT                        ║
║                                           ║
║  🤖 {MODEL}  •  📅 {TIME}                  ║
║  📄 {PARTS} section(s)  •  ⚡ {SPEED}      ║
╚═══════════════════════════════════════════╝`,
    icon: '📊'
  },
  
  code: {
    template: `
╭─────────────────────────────────────────╮
│  💻 CODE & TECHNICAL SOLUTION            │
│                                         │
│  🔧 {MODEL}  •  📅 {TIME}                │
│  📋 {PARTS} block(s)                     │
╰─────────────────────────────────────────╯`,
    icon: '💻'
  },
  
  error: {
    template: `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚠️ SYSTEM ALERT                         ┃
┃                                         ┃
┃  🔧 Error Handler  •  📅 {TIME}          ┃
┃  🚨 Code: {ERROR_CODE}                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
    icon: '⚠️'
  },
  
  success: {
    template: `
╔═══════════════════════════════════════════╗
║  ✅ TASK COMPLETED SUCCESSFULLY           ║
║                                           ║
║  🎯 {MODEL}  •  📅 {TIME}                  ║
║  ⚡ Processed in {SPEED}                   ║
╚═══════════════════════════════════════════╝`,
    icon: '✅'
  },
  
  minimal: {
    template: `
• • • • • • • • • • • • • • • • • • • • • • •
  {ICON} {MODEL} Response
  📅 {TIME}  |  📄 {PARTS} part(s)
• • • • • • • • • • • • • • • • • • • • • • •`,
    icon: '💬'
  }
};

// Professional content type detection
const CONTENT_PATTERNS = {
  analysis: /(?:analyz|evaluat|assess|examin|review|insight|finding|conclusion)/i,
  code: /(?:```|function|class|import|export|console\.|\.js|\.py|\.html|code)/i,
  list: /(?:^\s*[-*•]\s|^\s*\d+\.\s)/m,
  steps: /(?:step\s+\d|phase\s+\d|stage\s+\d)/i,
  technical: /(?:API|HTTP|JSON|SQL|database|server|client|endpoint)/i,
  business: /(?:strategy|market|revenue|profit|business|financial|ROI)/i,
  error: /(?:error|fail|problem|issue|bug|exception)/i,
  success: /(?:success|complet|finish|done|achiev|accomplish)/i
};

// Smart emphasis patterns
const EMPHASIS_PATTERNS = [
  { pattern: /\b(IMPORTANT|CRITICAL|WARNING|NOTE|TIP|REMEMBER)\b/gi, format: '*{text}*' },
  { pattern: /\b(SUCCESS|COMPLETED|ACHIEVED|SOLVED)\b/gi, format: '✅ *{text}*' },
  { pattern: /\b(ERROR|FAILED|PROBLEM|ISSUE)\b/gi, format: '❌ *{text}*' },
  { pattern: /\b(TODO|FIXME|HACK|BUG)\b/gi, format: '🔧 *{text}*' },
  { pattern: /\b(PERFORMANCE|OPTIMIZATION|SPEED)\b/gi, format: '⚡ *{text}*' },
  { pattern: /\b(SECURITY|PRIVACY|CONFIDENTIAL)\b/gi, format: '🔒 *{text}*' }
];

// Professional bullet styles
const BULLET_STYLES = {
  primary: '▪️',
  secondary: '▫️', 
  highlight: '🔹',
  action: '👉',
  check: '✅',
  cross: '❌',
  arrow: '➤',
  star: '⭐',
  point: '•'
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function safeString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
}

function detectContentType(text) {
  const content = text.toLowerCase();
  
  for (const [type, pattern] of Object.entries(CONTENT_PATTERNS)) {
    if (pattern.test(content)) {
      return type;
    }
  }
  
  return 'general';
}

function getModelInfo(metadata = {}) {
  const model = String(metadata.model || metadata.modelUsed || metadata.aiUsed || 'gpt-5').toLowerCase();
  
  const modelMap = {
    'gpt-5': { name: 'GPT-5', emoji: '🚀', type: 'gpt5' },
    'gpt-5-nano': { name: 'GPT-5 Nano', emoji: '⚡', type: 'gpt5' },
    'gpt-5-mini': { name: 'GPT-5 Mini', emoji: '🔥', type: 'gpt5' },
    'gpt-4o': { name: 'GPT-4o', emoji: '👁️', type: 'gpt5' },
    'whisper': { name: 'Whisper AI', emoji: '🎵', type: 'code' },
    'vision': { name: 'Vision AI', emoji: '👀', type: 'analysis' }
  };
  
  for (const [key, info] of Object.entries(modelMap)) {
    if (model.includes(key)) {
      return info;
    }
  }
  
  return { name: 'AI Assistant', emoji: '🤖', type: 'general' };
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKDOWN V2 ESCAPING (SAFE & PRESERVES FORMATTING)
// ═══════════════════════════════════════════════════════════════════════════

function escapeMarkdownV2(text) {
  // Characters that need escaping in MarkdownV2
  const specialChars = /([_*\[\]()~`>#+\-=|{}.!\\])/g;
  
  // Split into code blocks and text sections
  const sections = text.split(/(```[\s\S]*?```|`[^`]*`)/);
  
  return sections.map((section, index) => {
    // Don't escape code blocks (odd indices)
    if (index % 2 === 1) {
      return section;
    }
    
    // Escape text sections but preserve our formatting
    return section
      .replace(/\*\*([^*]+)\*\*/g, '«BOLD»$1«/BOLD»')  // Protect bold
      .replace(/\*([^*]+)\*/g, '«ITALIC»$1«/ITALIC»')   // Protect italic
      .replace(/_([^_]+)_/g, '«UNDER»$1«/UNDER»')       // Protect underline
      .replace(specialChars, '\\$1')                     // Escape special chars
      .replace(/«BOLD»([^«]+)«\/BOLD»/g, '*$1*')        // Restore bold
      .replace(/«ITALIC»([^«]+)«\/ITALIC»/g, '_$1_')    // Restore italic
      .replace(/«UNDER»([^«]+)«\/UNDER»/g, '__$1__');   // Restore underline
  }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSIONAL TEXT FORMATTING
// ═══════════════════════════════════════════════════════════════════════════

function formatProfessionalText(text) {
  if (!CONFIG.ENABLE_SMART_FORMATTING) return text;
  
  let formatted = text;
  
  // 1. Clean up spacing and normalize
  formatted = formatted
    .replace(/\r\n/g, '\n')                    // Normalize line endings
    .replace(/[ \t]+$/gm, '')                  // Remove trailing spaces
    .replace(/\n{3,}/g, '\n\n')               // Max 2 consecutive newlines
    .replace(/[ \t]{2,}/g, ' ')               // Normalize multiple spaces
    .trim();
  
  // 2. Format headers and sections
  formatted = formatHeaders(formatted);
  
  // 3. Format lists and bullets
  formatted = formatLists(formatted);
  
  // 4. Add emphasis to important terms
  formatted = addSmartEmphasis(formatted);
  
  // 5. Format code blocks professionally
  formatted = formatCodeBlocks(formatted);
  
  // 6. Add proper spacing
  formatted = addProfessionalSpacing(formatted);
  
  return formatted;
}

function formatHeaders(text) {
  return text
    // Format main headers
    .replace(/^(#{1,3})\s*(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length;
      if (level === 1) return `\n*📋 ${title.toUpperCase()}*\n${'─'.repeat(30)}\n`;
      if (level === 2) return `\n*🔹 ${title}*\n`;
      return `\n*${title}*\n`;
    })
    // Format section dividers
    .replace(/^[-=]{3,}$/gm, '─'.repeat(35))
    // Format subsection headers
    .replace(/^([A-Z][A-Z\s]{5,}):?\s*$/gm, '*📌 $1*\n');
}

function formatLists(text) {
  if (!CONFIG.ENABLE_SMART_BULLETS) return text;
  
  return text
    // Format numbered lists
    .replace(/^\s*(\d+)[\.\)]\s+(.+)$/gm, (match, num, content) => {
      const emoji = num === '1' ? '🥇' : num === '2' ? '🥈' : num === '3' ? '🥉' : '📍';
      return `${emoji} *${num}.* ${content}`;
    })
    // Format bullet points with smart bullets
    .replace(/^\s*[-*•]\s+(.+)$/gm, (match, content) => {
      // Detect content type for appropriate bullet
      if (/^(step|phase|stage)/i.test(content)) return `👉 ${content}`;
      if (/^(result|outcome|conclusion)/i.test(content)) return `📊 ${content}`;
      if (/^(important|critical|key)/i.test(content)) return `⚡ ${content}`;
      if (/^(note|tip|remember)/i.test(content)) return `💡 ${content}`;
      if (/^(warning|caution|alert)/i.test(content)) return `⚠️ ${content}`;
      if (/^(success|completed|done)/i.test(content)) return `✅ ${content}`;
      if (/^(error|failed|problem)/i.test(content)) return `❌ ${content}`;
      return `▪️ ${content}`;
    })
    // Format sub-bullets
    .replace(/^\s{2,}[-*•]\s+(.+)$/gm, '   ▫️ $1');
}

function addSmartEmphasis(text) {
  if (!CONFIG.ENABLE_AUTO_EMPHASIS) return text;
  
  let emphasized = text;
  
  // Apply emphasis patterns
  EMPHASIS_PATTERNS.forEach(({ pattern, format }) => {
    emphasized = emphasized.replace(pattern, (match) => {
      return format.replace('{text}', match);
    });
  });
  
  // Emphasize technical terms
  emphasized = emphasized
    .replace(/\b([A-Z]{2,})\b/g, '*$1*')                    // Acronyms
    .replace(/\b(\d+(?:\.\d+)?%)\b/g, '*$1*')              // Percentages
    .replace(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '*$$1*')   // Money
    .replace(/\b(\d+(?:,\d{3})*)\b/g, (match) => {         // Large numbers
      const num = parseInt(match.replace(/,/g, ''));
      return num >= 1000 ? `*${match}*` : match;
    });
  
  return emphasized;
}

function formatCodeBlocks(text) {
  return text
    // Add language labels to code blocks
    .replace(/```(\w+)?\n/g, (match, lang) => {
      const language = lang || 'code';
      return `💻 *${language.toUpperCase()} CODE:*\n\`\`\`${lang || ''}\n`;
    })
    // Format inline code
    .replace(/`([^`]+)`/g, '`*$1*`')
    // Add spacing around code blocks
    .replace(/(^|\n)(```[\s\S]*?```)/g, '$1\n$2\n');
}

function addProfessionalSpacing(text) {
  if (!CONFIG.ENABLE_CLEAN_SPACING) return text;
  
  return text
    // Add spacing before headers
    .replace(/\n(\*📋[^*]+\*)/g, '\n\n$1')
    // Add spacing after sections
    .replace(/(\*📋[^*]+\*\n─+)/g, '$1\n')
    // Add spacing around lists
    .replace(/\n([▪️▫️👉📊⚡💡⚠️✅❌🥇🥈🥉📍])/g, '\n\n$1')
    // Add spacing around code blocks
    .replace(/\n(```)/g, '\n\n$1')
    .replace(/(```)\n/g, '$1\n\n')
    // Clean up excessive spacing
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSIONAL HEADER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function buildProfessionalHeader(metadata = {}, chunkInfo = {}) {
  if (!CONFIG.ENABLE_PROFESSIONAL_HEADERS) {
    return `🤖 *AI Response* • ${getCurrentTime()}`;
  }
  
  const modelInfo = getModelInfo(metadata);
  const contentType = detectContentType(metadata.originalText || '');
  
  // Determine header type
  let headerType = 'minimal';
  if (metadata.error) headerType = 'error';
  else if (metadata.success || metadata.completionDetected) headerType = 'success';
  else if (contentType === 'code') headerType = 'code';
  else if (contentType === 'analysis') headerType = 'analysis';
  else if (modelInfo.type === 'gpt5') headerType = 'gpt5';
  
  const template = PROFESSIONAL_HEADERS[headerType] || PROFESSIONAL_HEADERS.minimal;
  
  // Build replacement values
  const replacements = {
    ICON: template.icon,
    MODEL: modelInfo.name,
    TIME: getCurrentTime(),
    PARTS: chunkInfo.total || 1,
    SPEED: metadata.processingTime ? `${metadata.processingTime}ms` : 'fast',
    ERROR_CODE: metadata.errorCode || '500'
  };
  
  // Replace placeholders
  let header = template.template;
  Object.entries(replacements).forEach(([key, value]) => {
    header = header.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  
  return header.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT TEXT CHUNKING
// ═══════════════════════════════════════════════════════════════════════════

function findOptimalBreakpoint(text, maxSize) {
  if (text.length <= maxSize) return text.length;
  
  const searchStart = Math.max(0, maxSize - 500);
  const searchScope = text.slice(searchStart, maxSize);
  
  // Priority order for breakpoints
  const breakpoints = [
    { pattern: /\n\n(?=\*📋)/g, priority: 10 },      // Before headers
    { pattern: /\n\n(?=```)/g, priority: 9 },        // Before code blocks
    { pattern: /```\n\n/g, priority: 8 },            // After code blocks
    { pattern: /\n\n(?=[▪️▫️👉📊])/g, priority: 7 }, // Before lists
    { pattern: /\n\n/g, priority: 6 },               // Paragraph breaks
    { pattern: /\.\s+/g, priority: 5 },              // Sentence endings
    { pattern: /;\s+/g, priority: 4 },               // Semicolons
    { pattern: /,\s+/g, priority: 3 },               // Commas
    { pattern: /\n/g, priority: 2 },                 // Line breaks
    { pattern: /\s+/g, priority: 1 }                 // Any whitespace
  ];
  
  let bestBreakpoint = maxSize - 50; // Default fallback
  let bestPriority = 0;
  
  breakpoints.forEach(({ pattern, priority }) => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(searchScope)) !== null) {
      const position = searchStart + match.index + match[0].length;
      
      if (position <= maxSize && priority > bestPriority) {
        bestBreakpoint = position;
        bestPriority = priority;
      }
    }
  });
  
  return bestBreakpoint;
}

class ProfessionalTextSplitter {
  constructor(options = {}) {
    this.maxChunkSize = options.maxChunkSize || CONFIG.SAFE_CHUNK_SIZE;
    this.maxChunks = options.maxChunks || CONFIG.MAX_CHUNKS;
    this.preserveFormatting = options.preserveFormatting !== false;
  }
  
  async split(text, metadata = {}) {
    let processedText = safeString(text).trim();
    
    if (!processedText) return [];
    
    // Apply professional formatting
    if (this.preserveFormatting) {
      processedText = formatProfessionalText(processedText);
      metadata.originalText = text; // Store for content type detection
    }
    
    const chunks = [];
    let remaining = processedText;
    let chunkIndex = 0;
    
    while (remaining.length > 0 && chunkIndex < this.maxChunks) {
      if (remaining.length <= this.maxChunkSize) {
        chunks.push(remaining.trim());
        break;
      }
      
      const breakpoint = findOptimalBreakpoint(remaining, this.maxChunkSize);
      const chunk = remaining.slice(0, breakpoint).trim();
      
      if (chunk) {
        chunks.push(chunk);
      }
      
      remaining = remaining.slice(breakpoint).trim();
      chunkIndex++;
      
      // Prevent blocking the event loop
      if (chunkIndex % 3 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
    
    // Handle overflow
    if (remaining.length > 0 && chunkIndex >= this.maxChunks) {
      const lastChunk = chunks[chunks.length - 1] || '';
      if (lastChunk.length + remaining.length <= CONFIG.TELEGRAM_LIMIT) {
        chunks[chunks.length - 1] = lastChunk + '\n\n' + remaining;
      } else {
        chunks.push('\n\n*📋 CONTENT TRUNCATED*\n_Response too long - showing first ' + this.maxChunks + ' sections_');
      }
    }
    
    return chunks.filter(chunk => chunk.trim().length > 0);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSIONAL MESSAGE SENDER
// ═══════════════════════════════════════════════════════════════════════════

class ProfessionalMessageSender {
  constructor(bot) {
    this.bot = bot;
    this.retryCount = 0;
  }
  
  async sendWithRetry(chatId, text, options = {}) {
    const maxRetries = CONFIG.MAX_RETRIES;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Prepare send options
        const sendOptions = {
          parse_mode: CONFIG.PARSE_MODE,
          disable_web_page_preview: true,
          ...options
        };
        
        const result = await this.bot.sendMessage(chatId, text, sendOptions);
        
        return {
          success: true,
          result,
          attempts: attempt,
          fallbackUsed: false
        };
        
      } catch (error) {
        lastError = error;
        console.log(`⚠️ [TELEGRAM] Send attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        // Try fallback without markdown on first retry
        if (attempt === 1 && CONFIG.PARSE_MODE.includes('Markdown')) {
          try {
            const fallbackResult = await this.bot.sendMessage(chatId, text, {
              disable_web_page_preview: true
            });
            
            return {
              success: true,
              result: fallbackResult,
              attempts: attempt,
              fallbackUsed: true
            };
          } catch (fallbackError) {
            console.log(`⚠️ [TELEGRAM] Fallback also failed:`, fallbackError.message);
          }
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      attempts: maxRetries,
      fallbackUsed: false
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PROFESSIONAL SEND FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function sendProfessionalTelegramMessage(bot, chatId, text, metadata = {}) {
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!bot || typeof bot.sendMessage !== 'function') {
      throw new Error('Invalid Telegram bot instance');
    }
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    
    const rawText = safeString(text).trim();
    if (!rawText) {
      throw new Error('Message content is empty');
    }
    
    console.log(`📱 [TELEGRAM] Sending professional message to ${chatId}`);
    console.log(`📏 [TELEGRAM] Content length: ${rawText.length} characters`);
    
    // Initialize splitter and sender
    const splitter = new ProfessionalTextSplitter({
      maxChunkSize: CONFIG.SAFE_CHUNK_SIZE - 300, // Reserve space for headers
      maxChunks: CONFIG.MAX_CHUNKS,
      preserveFormatting: true
    });
    
    const sender = new ProfessionalMessageSender(bot);
    
    // Split text into professional chunks
    const chunks = await splitter.split(rawText, metadata);
    
    console.log(`📊 [TELEGRAM] Split into ${chunks.length} professional chunks`);
    
    // Prepare chunk info for header
    const chunkInfo = {
      total: chunks.length,
      current: 0
    };
    
    const results = [];
    let successCount = 0;
    let totalRetries = 0;
    
    // Send each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isFirst = i === 0;
      const isLast = i === chunks.length - 1;
      
      chunkInfo.current = i + 1;
      
      // Compose message
      let message;
      if (isFirst) {
        // First chunk gets the professional header
        const header = buildProfessionalHeader(metadata, chunkInfo);
        message = `${header}\n\n${chunk}`;
      } else {
        // Continuation chunks get clean part headers
        message = `📄 *Part ${i + 1} of ${chunks.length}*\n\n${chunk}`;
      }
      
      // Apply MarkdownV2 escaping
      const escapedMessage = escapeMarkdownV2(message);
      
      // Length safety check
      if (escapedMessage.length > CONFIG.TELEGRAM_LIMIT) {
        const truncated = escapedMessage.slice(0, CONFIG.TELEGRAM_LIMIT - 100) + 
                         '\n\n*📋 MESSAGE TRUNCATED*\n_Content too long for single message_';
        message = truncated;
      } else {
        message = escapedMessage;
      }
      
      // Send with retry logic
      const result = await sender.sendWithRetry(chatId, message);
      results.push(result);
      
      if (result.success) {
        successCount++;
      }
      
      totalRetries += (result.attempts - 1);
      
      // Rate limiting between messages
      if (!isLast && CONFIG.RATE_LIMIT_DELAY > 0) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
      }
    }
    
    const processingTime = Date.now() - startTime;
    const modelInfo = getModelInfo(metadata);
    
    console.log(`✅ [TELEGRAM] Professional send completed: ${successCount}/${chunks.length} chunks sent (${processingTime}ms)`);
    
    return {
      success: successCount === chunks.length,
      enhanced: true,
      professional: true,
      version: '3.0.0',
      
      // Statistics
      chunks: chunks.length,
      sent: successCount,
      failed: chunks.length - successCount,
      processingTime,
      
      // Details
      model: modelInfo.name,
      originalLength: rawText.length,
      totalRetries,
      fallbackUsed: results.some(r => r.fallbackUsed),
      
      // Results
      results,
      
      // Formatting info
      formattingApplied: CONFIG.ENABLE_SMART_FORMATTING,
      headerType: detectContentType(rawText),
      spacingOptimized: CONFIG.ENABLE_CLEAN_SPACING
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error(`❌ [TELEGRAM] Professional send failed:`, error.message);
    
    // Emergency fallback - send simple version
    try {
      const emergencyText = `⚠️ *System Recovery Mode*\n\n${safeString(text).slice(0, 3000)}\n\n_Original formatting failed - showing simplified version_`;
      const escapedEmergency = escapeMarkdownV2(emergencyText);
      
      await bot.sendMessage(chatId, escapedEmergency, {
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true
      });
      
      return {
        success: true,
        enhanced: false,
        professional: false,
        emergency: true,
        error: error.message,
        processingTime
      };
      
    } catch (emergencyError) {
      console.error(`❌ [TELEGRAM] Emergency fallback also failed:`, emergencyError.message);
      
      return {
        success: false,
        enhanced: false,
        professional: false,
        error: error.message,
        emergencyError: emergencyError.message,
        processingTime
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSIONAL HANDLER FACTORY
// ═══════════════════════════════════════════════════════════════════════════

function createProfessionalTelegramHandler(bot, options = {}) {
  const config = { ...CONFIG, ...options };
  
  console.log(`🏭 [TELEGRAM] Created professional handler with config:`, {
    smartFormatting: config.ENABLE_SMART_FORMATTING,
    cleanSpacing: config.ENABLE_CLEAN_SPACING,
    professionalHeaders: config.ENABLE_PROFESSIONAL_HEADERS,
    autoEmphasis: config.ENABLE_AUTO_EMPHASIS,
    smartBullets: config.ENABLE_SMART_BULLETS
  });
  
  return {
    // Main send functions
    send: (chatId, text, metadata = {}) => 
      sendProfessionalTelegramMessage(bot, chatId, text, metadata),
    
    sendMessage: (chatId, text, metadata = {}) => 
      sendProfessionalTelegramMessage(bot, chatId, text, metadata),
    
    sendGPTResponse: (chatId, text, metadata = {}) => 
      sendProfessionalTelegramMessage(bot, chatId, text, { 
        ...metadata, 
        model: metadata.model || 'gpt-5' 
      }),
    
    // Specialized send functions
    sendAnalysis: (chatId, analysisText, metadata = {}) => 
      sendProfessionalTelegramMessage(bot, chatId, analysisText, {
        ...metadata,
        contentType: 'analysis',
        model: metadata.model || 'gpt-5'
      }),
    
    sendCode: (chatId, codeText, metadata = {}) => 
      sendProfessionalTelegramMessage(bot, chatId, codeText, {
        ...metadata,
        contentType: 'code',
        model: metadata.model || 'gpt-5'
      }),
    
    sendError: (chatId, errorText, metadata = {}) => 
      sendProfessionalTelegramMessage(bot, chatId, errorText, {
        ...metadata,
        error: true,
        errorCode: metadata.errorCode || '500',
        model: 'Error Handler'
      }),
    
    sendSuccess: (chatId, successText, metadata = {}) => 
      sendProfessionalTelegramMessage(bot, chatId, successText, {
        ...metadata,
        success: true,
        completionDetected: true,
        model: metadata.model || 'Task Manager'
      }),
    
    sendList: (chatId, listText, metadata = {}) => 
      sendProfessionalTelegramMessage(bot, chatId, listText, {
        ...metadata,
        contentType: 'list',
        model: metadata.model || 'gpt-5'
      }),
    
    sendSteps: (chatId, stepsText, metadata = {}) => 
      sendProfessionalTelegramMessage(bot, chatId, stepsText, {
        ...metadata,
        contentType: 'steps',
        model: metadata.model || 'gpt-5'
      }),
    
    // Utility functions
    formatText: (text) => formatProfessionalText(text),
    
    getConfig: () => ({ ...config }),
    
    updateConfig: (newConfig) => {
      Object.assign(config, newConfig);
      console.log(`🔧 [TELEGRAM] Config updated:`, newConfig);
    },
    
    // Test functions
    testFormatting: (text) => {
      console.log('📝 [TELEGRAM] Testing formatting...');
      console.log('Original:', text);
      const formatted = formatProfessionalText(text);
      console.log('Formatted:', formatted);
      return formatted;
    },
    
    testSend: async (chatId) => {
      const testMessage = `
# Professional Formatting Test

This is a **comprehensive test** of the professional formatting system.

## Features Demonstrated:

• Smart bullet points with appropriate emojis
• **Bold text** and *italic text* formatting  
• Proper spacing and typography
• Code blocks with syntax highlighting:

\`\`\`javascript
function example() {
  console.log("Professional formatting!");
}
\`\`\`

### Important Information:
CRITICAL: This is an important notice
SUCCESS: Everything is working properly
ERROR: No errors detected

1. First numbered item
2. Second numbered item  
3. Third numbered item

Result: Professional formatting is working perfectly!
      `;
      
      return await sendProfessionalTelegramMessage(bot, chatId, testMessage, {
        model: 'Formatting Tester',
        test: true
      });
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPATIBILITY FUNCTIONS (For existing code)
// ═══════════════════════════════════════════════════════════════════════════

// Legacy function names for backward compatibility
async function sendTelegramMessage(bot, chatId, text, metadata = {}) {
  return await sendProfessionalTelegramMessage(bot, chatId, text, metadata);
}

function createTelegramHandler(bot, options = {}) {
  return createProfessionalTelegramHandler(bot, options);
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Main functions
  sendProfessionalTelegramMessage,
  sendTelegramMessage, // Legacy compatibility
  
  // Handler factories
  createProfessionalTelegramHandler,
  createTelegramHandler, // Legacy compatibility
  
  // Classes
  ProfessionalTextSplitter,
  ProfessionalMessageSender,
  
  // Formatting functions
  formatProfessionalText,
  formatHeaders,
  formatLists,
  formatCodeBlocks,
  addSmartEmphasis,
  addProfessionalSpacing,
  
  // Utility functions
  safeString,
  escapeMarkdownV2,
  detectContentType,
  getModelInfo,
  buildProfessionalHeader,
  findOptimalBreakpoint,
  
  // Constants
  CONFIG,
  PROFESSIONAL_HEADERS,
  CONTENT_PATTERNS,
  EMPHASIS_PATTERNS,
  BULLET_STYLES,
  
  // Version info
  VERSION: '3.0.0',
  FEATURES: [
    'Professional Typography',
    'Smart Spacing',
    'Auto Emphasis', 
    'Clean Headers',
    'Smart Bullets',
    'Code Formatting',
    'Content Detection',
    'Retry Logic'
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP AND CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

console.log('');
console.log('✨ ═══════════════════════════════════════════════════════════════');
console.log('   PROFESSIONAL TELEGRAM SPLITTER v3.0.0 LOADED');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('🎨 PROFESSIONAL FEATURES:');
console.log(`   📝 Smart Formatting: ${CONFIG.ENABLE_SMART_FORMATTING ? 'Enabled' : 'Disabled'}`);
console.log(`   📐 Clean Spacing: ${CONFIG.ENABLE_CLEAN_SPACING ? 'Enabled' : 'Disabled'}`);
console.log(`   🎯 Professional Headers: ${CONFIG.ENABLE_PROFESSIONAL_HEADERS ? 'Enabled' : 'Disabled'}`);
console.log(`   ⚡ Auto Emphasis: ${CONFIG.ENABLE_AUTO_EMPHASIS ? 'Enabled' : 'Disabled'}`);
console.log(`   🔸 Smart Bullets: ${CONFIG.ENABLE_SMART_BULLETS ? 'Enabled' : 'Disabled'}`);
console.log('');
console.log('📊 CONFIGURATION:');
console.log(`   📏 Max Chunk Size: ${CONFIG.SAFE_CHUNK_SIZE} chars`);
console.log(`   📄 Max Chunks: ${CONFIG.MAX_CHUNKS}`);
console.log(`   ⏱️ Rate Limit Delay: ${CONFIG.RATE_LIMIT_DELAY}ms`);
console.log(`   🔁 Max Retries: ${CONFIG.MAX_RETRIES}`);
console.log(`   📤 Parse Mode: ${CONFIG.PARSE_MODE}`);
console.log('');
console.log('🚀 IMPROVEMENTS:');
console.log('   • Professional typography with smart spacing');
console.log('   • Auto-detection of content types (code, analysis, lists)');
console.log('   • Smart emphasis for important terms and numbers');
console.log('   • Clean bullet points with contextual emojis');
console.log('   • Professional headers with modern design');
console.log('   • Enhanced code block formatting');
console.log('   • Intelligent text chunking at optimal breakpoints');
console.log('   • Comprehensive error handling and fallbacks');
console.log('');
console.log('✅ READY FOR PROFESSIONAL MESSAGE DELIVERY');
console.log('🎯 Your messages will now look clean, professional, and engaging!');
console.log('✨ ═══════════════════════════════════════════════════════════════');
console.log('');
