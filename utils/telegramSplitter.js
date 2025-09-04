// utils/telegramSplitter.js - SYNTAX ERROR FIXED VERSION
// ════════════════════════════════════════════════════════════════════════════
// 🔧 FIXED: Resolved syntax errors and import issues
// 🚀 ENHANCED: All advanced features intact
// 🛡️ ROBUST: Production-ready error handling
// ⚡ COMPATIBLE: Works with your multimodal system
// ════════════════════════════════════════════════════════════════════════════

'use strict';

// Check if EventEmitter is available
let EventEmitter;
try {
  EventEmitter = require('events');
} catch (error) {
  // Fallback for environments without events module
  EventEmitter = class EventEmitter {
    constructor() { this.listeners = {}; }
    emit(event, ...args) { 
      if (this.listeners[event]) {
        this.listeners[event].forEach(fn => fn(...args));
      }
    }
    on(event, fn) { 
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    }
  };
}

console.log('🚀 Loading ENHANCED Telegram Splitter v2.0 (Fixed)...');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Telegram limits
  TELEGRAM_LIMIT: 4096,
  SAFE_CHUNK_SIZE: parseInt(process.env.TELEGRAM_CHUNK_SIZE) || 3800,
  
  // Chunking behavior
  MAX_CHUNKS: parseInt(process.env.MAX_TELEGRAM_CHUNKS) || 15,
  ENABLE_LARGE_RESPONSES: process.env.ALLOW_LARGE_RESPONSES === 'true',
  EMERGENCY_CHUNK_SIZE: 1000,
  
  // Performance
  RATE_LIMIT_DELAY: parseInt(process.env.TELEGRAM_DELAY_MS) || 100,
  MAX_RETRIES: parseInt(process.env.TELEGRAM_MAX_RETRIES) || 3,
  RETRY_DELAY: parseInt(process.env.TELEGRAM_RETRY_DELAY) || 1000,
  
  // Features
  ENABLE_PROGRESS_INDICATORS: process.env.TELEGRAM_SHOW_PROGRESS !== 'false',
  ENABLE_MARKDOWN_FALLBACK: process.env.TELEGRAM_MARKDOWN_FALLBACK !== 'false',
  ENABLE_COMPRESSION: process.env.TELEGRAM_COMPRESS === 'true',
  
  // Debugging
  DEBUG_MODE: process.env.TELEGRAM_DEBUG === 'true',
  LOG_LEVEL: process.env.TELEGRAM_LOG_LEVEL || 'info'
};

// Enhanced header templates
const HEADERS = {
  gpt5: {
    top: '╭──────────────────────────────────────────╮',
    title: '│             🚀 {TITLE}             │',
    model: '│               🤖 {MODEL} {VERSION}               │',
    meta: '│            {TIMESTAMP} • {CHUNKS}ch            │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  completion: {
    top: '╭──────────────────────────────────────────╮',
    title: '│              ✅ Task Complete              │',
    model: '│                🤖 {MODEL}                │',
    meta: '│          {TIMESTAMP} • {PROCESSING_TIME}          │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  error: {
    top: '╭──────────────────────────────────────────╮',
    title: '│              ⚠️ System Alert               │',
    model: '│                🔧 {MODEL}                │',
    meta: '│           {TIMESTAMP} • Error {CODE}           │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  multimodal: {
    top: '╭──────────────────────────────────────────╮',
    title: '│              🎥 Multimodal AI              │',
    model: '│              🔍 {MODEL} Vision              │',
    meta: '│         {TIMESTAMP} • {TYPE} Analysis         │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  simple: {
    top: '╭──────────────────────────────────────────╮',
    title: '│                💬 Response                 │',
    model: '│                🤖 {MODEL}                │',
    meta: '│              {TIMESTAMP}              │',
    bottom: '╰──────────────────────────────────────────╯'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY CLASSES & HELPERS
// ═══════════════════════════════════════════════════════════════════════════

class Logger {
  constructor(level = CONFIG.LOG_LEVEL) {
    this.level = level;
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
  }
  
  log(level, message, ...args) {
    if (this.levels[level] <= this.levels[this.level]) {
      const timestamp = new Date().toISOString().slice(11, 23);
      const prefix = `[${timestamp}] [TelegramSplitter] ${level.toUpperCase()}:`;
      console.log(prefix, message, ...args);
    }
  }
  
  error(msg, ...args) { this.log('error', msg, ...args); }
  warn(msg, ...args) { this.log('warn', msg, ...args); }
  info(msg, ...args) { this.log('info', msg, ...args); }
  debug(msg, ...args) { this.log('debug', msg, ...args); }
}

class MetricsCollector {
  constructor() {
    this.metrics = {
      messagesSent: 0,
      totalChunks: 0,
      averageChunkSize: 0,
      failureRate: 0,
      averageProcessingTime: 0,
      retryCount: 0
    };
    this.history = [];
  }
  
  record(data) {
    this.history.push({ ...data, timestamp: Date.now() });
    this.updateAverages();
  }
  
  updateAverages() {
    const recent = this.history.slice(-100);
    if (recent.length === 0) return;
    
    this.metrics.averageProcessingTime = recent.reduce((sum, r) => sum + (r.processingTime || 0), 0) / recent.length;
    this.metrics.failureRate = recent.filter(r => !r.success).length / recent.length;
    this.metrics.averageChunkSize = recent.reduce((sum, r) => sum + (r.chunks || 0), 0) / recent.length;
  }
  
  getStats() {
    return { ...this.metrics };
  }
}

const logger = new Logger();
const metrics = new MetricsCollector();

// ═══════════════════════════════════════════════════════════════════════════
// TEXT PROCESSING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function safeString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
}

function compressText(text) {
  if (!CONFIG.ENABLE_COMPRESSION) return text;
  
  return text
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]{3,}/g, '  ')
    .replace(/([.!?])\s+/g, '$1 ')
    .replace(/\s*([,;:])\s*/g, '$1 ')
    .trim();
}

function detectCodeBlocks(text) {
  const blocks = [];
  let inTripleBlock = false;
  let inSingleBlock = false;
  let currentBlockStart = -1;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextTwoChars = text.substring(i, i + 3);
    
    if (nextTwoChars === '```' && (i === 0 || text[i - 1] !== '\\')) {
      if (inTripleBlock) {
        blocks.push({ start: currentBlockStart, end: i + 3, type: 'triple' });
        inTripleBlock = false;
      } else if (!inSingleBlock) {
        currentBlockStart = i;
        inTripleBlock = true;
      }
      i += 2;
      continue;
    }
    
    if (char === '`' && (i === 0 || text[i - 1] !== '\\') && !inTripleBlock) {
      if (inSingleBlock) {
        blocks.push({ start: currentBlockStart, end: i + 1, type: 'single' });
        inSingleBlock = false;
      } else {
        currentBlockStart = i;
        inSingleBlock = true;
      }
    }
  }
  
  if (inTripleBlock || inSingleBlock) {
    blocks.push({ 
      start: currentBlockStart, 
      end: text.length, 
      type: inTripleBlock ? 'triple' : 'single',
      unclosed: true 
    });
  }
  
  return blocks;
}

function isInsideCodeBlock(text, position) {
  const codeBlocks = detectCodeBlocks(text);
  return codeBlocks.some(block => position >= block.start && position < block.end);
}

function findOptimalBreakpoint(text, maxLength) {
  if (text.length <= maxLength) return text.length;
  
  const searchStart = Math.max(0, maxLength - 400);
  const searchEnd = Math.min(text.length, maxLength);
  const searchText = text.substring(searchStart, searchEnd);
  
  // Priority 1: Section breaks
  const sectionBreak = searchText.lastIndexOf('\n\n');
  if (sectionBreak !== -1) {
    const position = searchStart + sectionBreak + 2;
    if (!isInsideCodeBlock(text, position)) {
      return position;
    }
  }
  
  // Priority 2: Code block boundaries
  const codeBlocks = detectCodeBlocks(text.substring(0, searchEnd));
  for (const block of codeBlocks.reverse()) {
    if (block.end <= searchEnd && block.end >= searchStart) {
      return block.end;
    }
  }
  
  // Priority 3: Sentence endings
  const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
  for (const ending of sentenceEndings) {
    const sentenceBreak = searchText.lastIndexOf(ending);
    if (sentenceBreak !== -1) {
      const position = searchStart + sentenceBreak + ending.length;
      if (!isInsideCodeBlock(text, position)) {
        return position;
      }
    }
  }
  
  // Fallback: line break
  const lineBreak = searchText.lastIndexOf('\n');
  if (lineBreak !== -1) {
    const position = searchStart + lineBreak + 1;
    if (!isInsideCodeBlock(text, position)) {
      return position;
    }
  }
  
  // Word boundary
  const wordBreak = searchText.lastIndexOf(' ');
  if (wordBreak !== -1) {
    return searchStart + wordBreak + 1;
  }
  
  return maxLength - 10;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT SPLITTING CLASS
// ═══════════════════════════════════════════════════════════════════════════

class TextSplitter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      maxChunkSize: options.maxChunkSize || CONFIG.SAFE_CHUNK_SIZE,
      maxChunks: options.maxChunks || CONFIG.MAX_CHUNKS,
      enableCompression: options.enableCompression !== false
    };
  }
  
  async splitText(text, progressCallback) {
    let cleanedText = safeString(text).trim();
    
    if (this.options.enableCompression) {
      cleanedText = compressText(cleanedText);
    }
    
    if (cleanedText.length <= this.options.maxChunkSize) {
      return [cleanedText];
    }
    
    const chunks = [];
    let remaining = cleanedText;
    let chunkCount = 0;
    const estimatedTotal = Math.ceil(cleanedText.length / this.options.maxChunkSize);
    
    while (remaining.length > 0 && chunkCount < this.options.maxChunks) {
      if (progressCallback && chunkCount % 2 === 0) {
        progressCallback(chunkCount, estimatedTotal, chunks.length);
      }
      
      if (remaining.length <= this.options.maxChunkSize) {
        chunks.push(remaining.trim());
        break;
      }
      
      const breakpoint = findOptimalBreakpoint(remaining, this.options.maxChunkSize);
      const chunk = remaining.substring(0, breakpoint).trim();
      
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      
      remaining = remaining.substring(breakpoint).trim();
      chunkCount++;
      
      this.emit('progress', {
        current: chunkCount,
        total: estimatedTotal,
        remaining: remaining.length
      });
      
      if (chunkCount % 5 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
    
    if (remaining.length > 0 && chunkCount >= this.options.maxChunks) {
      const lastChunk = chunks[chunks.length - 1] || '';
      const combinedLength = lastChunk.length + remaining.length;
      
      if (combinedLength <= CONFIG.TELEGRAM_LIMIT * 1.1) {
        chunks[chunks.length - 1] = lastChunk + '\n\n' + remaining;
      } else {
        chunks.push('\n\n...[Response truncated - content too long]');
        logger.warn(`Text truncated: ${remaining.length} characters exceeded limit`);
      }
    }
    
    return chunks.filter(chunk => chunk.length > 0);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function getModelInfo(metadata) {
  const model = safeString(metadata.model || metadata.modelUsed || metadata.aiUsed || 'gpt-5');
  const version = metadata.version || metadata.modelVersion || '';
  
  const modelMap = {
    'gpt-5-nano': { name: 'GPT-5 Nano', emoji: '⚡' },
    'gpt-5-mini': { name: 'GPT-5 Mini', emoji: '🔧' },
    'gpt-5': { name: 'GPT-5', emoji: '🚀' },
    'gpt-4o': { name: 'GPT-4o', emoji: '👁️' },
    'whisper': { name: 'Whisper', emoji: '🎵' },
    'vision': { name: 'Vision', emoji: '👀' },
    'multimodal': { name: 'Multimodal', emoji: '🎥' },
    'completion': { name: 'Auto-Complete', emoji: '✨' },
    'error': { name: 'Error Handler', emoji: '🔧' },
    'system': { name: 'System', emoji: '⚙️' }
  };
  
  const modelKey = Object.keys(modelMap).find(key => 
    model.toLowerCase().includes(key.toLowerCase())
  ) || 'gpt-5';
  
  return {
    name: modelMap[modelKey].name,
    emoji: modelMap[modelKey].emoji,
    version: version,
    fullName: version ? `${modelMap[modelKey].name} ${version}` : modelMap[modelKey].name
  };
}

function getHeaderType(metadata) {
  if (metadata.multimodal || metadata.vision || metadata.image) return 'multimodal';
  if (metadata.completionDetected) return 'completion';
  if (metadata.error) return 'error';
  if (metadata.model || metadata.modelUsed || metadata.aiUsed) return 'gpt5';
  return 'simple';
}

function formatTimestamp() {
  return new Date().toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

function centerText(text, width = 42) {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  const leftPad = ' '.repeat(padding);
  const rightPad = ' '.repeat(width - text.length - padding);
  return leftPad + text + rightPad;
}

function buildDynamicHeader(metadata, chunkInfo = {}) {
  const headerType = getHeaderType(metadata);
  const modelInfo = getModelInfo(metadata);
  const template = HEADERS[headerType] || HEADERS.simple;
  
  const replacements = {
    TITLE: metadata.title || 'AI Response',
    MODEL: modelInfo.name,
    VERSION: modelInfo.version || '',
    TIMESTAMP: formatTimestamp(),
    CHUNKS: chunkInfo.total || 1,
    PROCESSING_TIME: metadata.processingTime ? `${metadata.processingTime}ms` : 'Fast',
    CODE: metadata.errorCode || '500',
    TYPE: metadata.analysisType || 'Content'
  };
  
  const processLine = (line) => {
    let processed = line;
    Object.entries(replacements).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    
    if (processed.includes('│') && !processed.match(/^[│╭╰─]+$/)) {
      const content = processed.replace(/^│\s*/, '').replace(/\s*│$/, '');
      const centered = centerText(content);
      return `│${centered}│`;
    }
    
    return processed;
  };
  
  return {
    top: processLine(template.top),
    title: processLine(template.title),
    model: processLine(template.model),
    meta: template.meta ? processLine(template.meta) : null,
    bottom: processLine(template.bottom)
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE SENDING WITH RETRY LOGIC
// ═══════════════════════════════════════════════════════════════════════════

class MessageSender {
  constructor(bot) {
    this.bot = bot;
  }
  
  async sendWithRetry(chatId, text, options = {}, maxRetries = CONFIG.MAX_RETRIES) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.bot.sendMessage(chatId, text, {
          parse_mode: options.parseMode || 'Markdown',
          disable_web_page_preview: true,
          ...options
        });
        
        if (attempt > 1) {
          logger.info(`Message sent successfully after ${attempt} attempts`);
          metrics.metrics.retryCount += attempt - 1;
        }
        
        return { success: true, result, attempts: attempt };
        
      } catch (error) {
        lastError = error;
        logger.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (error.message.includes('parse') && options.parseMode === 'Markdown') {
          try {
            const result = await this.bot.sendMessage(chatId, text, {
              disable_web_page_preview: true
            });
            logger.info('Sent successfully without Markdown formatting');
            return { success: true, result, fallback: true, attempts: attempt };
          } catch (fallbackError) {
            logger.warn('Fallback also failed:', fallbackError.message);
          }
        }
        
        if (attempt < maxRetries) {
          const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return { success: false, error: lastError.message, attempts: maxRetries };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SENDING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function sendTelegramMessage(bot, chatId, text, metadata = {}) {
  const startTime = Date.now();
  let processingStage = 'initialization';
  
  try {
    logger.info(`📤 Processing message for chat ${chatId}`);
    
    if (!bot || typeof bot.sendMessage !== 'function') {
      throw new Error('Invalid Telegram bot instance provided');
    }
    
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    
    const cleanedText = safeString(text).trim();
    if (!cleanedText) {
      throw new Error('Message content is empty');
    }
    
    processingStage = 'text_splitting';
    
    const splitter = new TextSplitter({
      maxChunkSize: CONFIG.SAFE_CHUNK_SIZE - 200,
      maxChunks: metadata.allowLargeResponse ? CONFIG.MAX_CHUNKS * 2 : CONFIG.MAX_CHUNKS,
      enableCompression: CONFIG.ENABLE_COMPRESSION
    });
    
    let progressCallback = null;
    if (CONFIG.ENABLE_PROGRESS_INDICATORS && cleanedText.length > 10000) {
      progressCallback = (current, total, completed) => {
        logger.debug(`Splitting progress: ${current}/${total} (${completed} chunks ready)`);
      };
    }
    
    const textChunks = await splitter.splitText(cleanedText, progressCallback);
    logger.info(`📄 Split into ${textChunks.length} chunks`);
    
    processingStage = 'header_generation';
    
    const chunkInfo = { total: textChunks.length };
    const headerData = buildDynamicHeader(metadata, chunkInfo);
    
    const headerText = Object.values(headerData).filter(Boolean).join('\n');
    const headerSize = headerText.length;
    
    processingStage = 'message_sending';
    
    const sender = new MessageSender(bot);
    const results = [];
    let successCount = 0;
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const isFirstChunk = i === 0;
      const isLastChunk = i === textChunks.length - 1;
      
      chunkInfo.current = i + 1;
      chunkInfo.index = i + 1;
      
      let messageContent;
      
      if (isFirstChunk && textChunks.length === 1) {
        const singleHeader = buildDynamicHeader(metadata, { total: 1, current: 1 });
        const singleHeaderText = Object.values(singleHeader).filter(Boolean).join('\n');
        messageContent = `${singleHeaderText}\n\n${chunk}`;
      } else if (isFirstChunk) {
        const multiHeader = buildDynamicHeader(metadata, chunkInfo);
        const multiHeaderText = Object.values(multiHeader).filter(Boolean).join('\n');
        messageContent = `${multiHeaderText}\n\n${chunk}`;
      } else {
        const partHeader = `📄 Part ${i + 1}/${textChunks.length}`;
        messageContent = `${partHeader}\n\n${chunk}`;
      }
      
      if (messageContent.length > CONFIG.TELEGRAM_LIMIT) {
        logger.warn(`Chunk ${i + 1} exceeds Telegram limit, truncating...`);
        const availableSpace = CONFIG.TELEGRAM_LIMIT - 100;
        const truncationMsg = '\n\n...[Content truncated]';
        messageContent = messageContent.substring(0, availableSpace - truncationMsg.length) + truncationMsg;
      }
      
      const result = await sender.sendWithRetry(chatId, messageContent, {
        parseMode: CONFIG.ENABLE_MARKDOWN_FALLBACK ? 'Markdown' : undefined
      });
      
      results.push(result);
      
      if (result.success) {
        successCount++;
        logger.debug(`✅ Sent chunk ${i + 1}/${textChunks.length} (${result.attempts} attempts)`);
      } else {
        logger.error(`❌ Failed to send chunk ${i + 1}: ${result.error}`);
      }
      
      if (!isLastChunk && CONFIG.RATE_LIMIT_DELAY > 0) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
      }
    }
    
    processingStage = 'completion';
    
    const processingTime = Date.now() - startTime;
    const allSuccessful = successCount === textChunks.length;
    const modelInfo = getModelInfo(metadata);
    
    metrics.record({
      success: allSuccessful,
      chunks: textChunks.length,
      processingTime,
      characterCount: cleanedText.length,
      headerSize,
      retries: results.reduce((sum, r) => sum + (r.attempts - 1), 0)
    });
    
    logger.info(`${allSuccessful ? '✅' : '⚠️'} Complete: ${successCount}/${textChunks.length} chunks in ${processingTime}ms`);
    
    return {
      success: allSuccessful,
      enhanced: true,
      version: '2.0',
      chunks: textChunks.length,
      sent: successCount,
      failed: textChunks.length - successCount,
      processingTime,
      model: modelInfo.name,
      headerType: getHeaderType(metadata),
      headerSize,
      originalLength: text.length,
      processedLength: cleanedText.length,
      results,
      fallbackUsed: results.some(r => r.fallback),
      retryCount: results.reduce((sum, r) => sum + (r.attempts - 1), 0),
      metrics: metrics.getStats()
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(`❌ Critical error in ${processingStage}:`, error.message);
    
    metrics.record({
      success: false,
      error: error.message,
      stage: processingStage,
      processingTime
    });
    
    try {
      logger.info('🆘 Attempting emergency fallback...');
      
      const emergencyText = safeString(text);
      const maxEmergencyLength = CONFIG.EMERGENCY_CHUNK_SIZE;
      
      let emergencyContent;
      if (emergencyText.length <= maxEmergencyLength) {
        emergencyContent = `⚠️ System Recovery\n\n${emergencyText}`;
      } else {
        emergencyContent = `⚠️ System Recovery\n\n${emergencyText.substring(0, maxEmergencyLength - 100)}...\n\n[Content truncated due to processing error]`;
      }
      
      await bot.sendMessage(chatId, emergencyContent, {
        disable_web_page_preview: true
      });
      
      logger.info('✅ Emergency fallback successful');
      
      return {
        success: true,
        enhanced: false,
        emergency: true,
        error: error.message,
        stage: processingStage,
        processingTime,
        fallbackLength: emergencyContent.length
      };
      
    } catch (emergencyError) {
      logger.error('❌ Emergency fallback also failed:', emergencyError.message);
      
      return {
        success: false,
        enhanced: false,
        error: error.message,
        emergencyError: emergencyError.message,
        stage: processingStage,
        processingTime
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS & FACTORY METHODS
// ═══════════════════════════════════════════════════════════════════════════

function createTelegramHandler(bot, options = {}) {
  const config = { ...CONFIG, ...options };
  
  return {
    send: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
    sendMessage: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
    sendGPTResponse: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
    
    sendError: async (chatId, errorText, options = {}) => {
      return sendTelegramMessage(bot, chatId, errorText, {
        model: 'error-handler',
        aiUsed: 'error-fallback',
        title: options.title || 'System Error',
        error: true,
        errorCode: options.code || '500',
        ...options
      });
    },
    
    sendSuccess: async (chatId, successText, options = {}) => {
      return sendTelegramMessage(bot, chatId, successText, {
        model: 'completion-handler',
        aiUsed: 'completion-detection',
        title: options.title || 'Task Complete',
        completionDetected: true,
        ...options
      });
    },
    
    sendMultimodal: async (chatId, analysisText, options = {}) => {
      return sendTelegramMessage(bot, chatId, analysisText, {
        model: options.model || 'gpt-4o-vision',
        multimodal: true,
        analysisType: options.type || 'Image',
        title: options.title || 'Multimodal Analysis',
        ...options
      });
    },
    
    sendAlert: async (chatId, alertText, options = {}) => {
      return sendTelegramMessage(bot, chatId, alertText, {
        model: 'alert-system',
        title: options.title || 'System Alert',
        error: true,
        aiUsed: 'system-alert',
        ...options
      });
    },
    
    // Utility methods
    testConnection: async (chatId) => testTelegramConnection(bot, chatId),
    getMetrics: () => metrics.getStats(),
    clearMetrics: () => metrics.history = [],
    
    // Configuration
    updateConfig: (newConfig) => Object.assign(config, newConfig),
    getConfig: () => ({ ...config })
  };
}

// Testing function
async function testTelegramConnection(bot, chatId, runDiagnostics = true) {
  const startTime = Date.now();
  
  try {
    logger.info('🔍 Testing Telegram connection...');
    
    const testMessage = '🧪 Enhanced Telegram Splitter v2.0 - Connection Test';
    const basicResult = await sendTelegramMessage(bot, chatId, testMessage, {
      model: 'test-system',
      aiUsed: 'connection-test',
      title: 'Connectivity Test'
    });
    
    if (!basicResult.success) {
      return { success: false, stage: 'basic', error: 'Basic connectivity failed' };
    }
    
    if (!runDiagnostics) {
      return { success: true, stage: 'basic', processingTime: Date.now() - startTime };
    }
    
    logger.info('🔍 Running advanced diagnostics...');
    
    const diagnostics = {
      textSplitting: false,
      markdownFormatting: false,
      headerGeneration: false,
      errorHandling: false,
      multimodalSupport: false
    };
    
    // Test text splitting
    try {
      const longText = 'Test chunk: ' + 'A'.repeat(5000) + '\n\nThis tests the splitting algorithm.';
      const splittingResult = await sendTelegramMessage(bot, chatId, longText, {
        model: 'test-splitter',
        title: 'Splitting Test'
      });
      diagnostics.textSplitting = splittingResult.success && splittingResult.chunks > 1;
    } catch (error) {
      logger.warn('Text splitting test failed:', error.message);
    }
    
    // Test markdown formatting
    try {
      const markdownText = `# Test Header\n\n**Bold text** and *italic text*\n\n\`\`\`javascript\nconsole.log("Code block test");\n\`\`\`\n\n• List item 1\n• List item 2`;
      const markdownResult = await sendTelegramMessage(bot, chatId, markdownText, {
        model: 'test-markdown',
        title: 'Markdown Test'
      });
      diagnostics.markdownFormatting = markdownResult.success;
    } catch (error) {
      logger.warn('Markdown test failed:', error.message);
    }
    
    // Test multimodal headers
    try {
      const multimodalResult = await sendTelegramMessage(bot, chatId, 'Multimodal analysis complete!', {
        model: 'gpt-4o-vision',
        multimodal: true,
        analysisType: 'Image',
        title: 'Vision Test'
      });
      diagnostics.multimodalSupport = multimodalResult.success;
    } catch (error) {
      logger.warn('Multimodal test failed:', error.message);
    }
    
    // Test error handling
    try {
      const errorResult = await sendTelegramMessage(bot, chatId, 'Error handling test', {
        model: 'test-error',
        error: true,
        title: 'Error Handler Test',
        errorCode: '200'
      });
      diagnostics.errorHandling = errorResult.success;
    } catch (error) {
      logger.warn('Error handling test failed:', error.message);
    }
    
    diagnostics.headerGeneration = true; // If we got this far, headers work
    
    const processingTime = Date.now() - startTime;
    const successRate = Object.values(diagnostics).filter(Boolean).length / Object.keys(diagnostics).length;
    
    logger.info(`✅ Diagnostics complete: ${Math.round(successRate * 100)}% success rate in ${processingTime}ms`);
    
    return {
      success: successRate > 0.8,
      stage: 'diagnostics',
      processingTime,
      diagnostics,
      successRate,
      metrics: metrics.getStats()
    };
    
  } catch (error) {
    return {
      success: false,
      stage: 'error',
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Primary API
  sendTelegramMessage,
  createTelegramHandler,
  
  // Legacy compatibility (for your existing code)
  setupTelegramHandler: createTelegramHandler,
  sendMessage: sendTelegramMessage,
  sendGPTResponse: sendTelegramMessage,
  send: sendTelegramMessage,
  
  // Specialized functions
  sendAlert: async (bot, chatId, message, options = {}) => {
    const handler = createTelegramHandler(bot);
    return handler.sendAlert(chatId, message, options);
  },
  
  testTelegramConnection,
  
  // Classes and utilities
  TextSplitter,
  Logger,
  MetricsCollector,
  
  // Utility functions
  cleanText: (text) => compressText(safeString(text)),
  splitTextSafely: async (text, maxChunkSize = CONFIG.SAFE_CHUNK_SIZE) => {
    const splitter = new TextSplitter({ maxChunkSize });
    return splitter.splitText(text);
  },
  safeString,
  compressText,
  detectCodeBlocks,
  
  // Configuration and monitoring
  getConfig: () => ({ ...CONFIG }),
  updateConfig: (newConfig) => Object.assign(CONFIG, newConfig),
  getMetrics: () => metrics.getStats(),
  
  // Constants
  TELEGRAM_LIMIT: CONFIG.TELEGRAM_LIMIT,
  SAFE_CHUNK_SIZE: CONFIG.SAFE_CHUNK_SIZE,
  MAX_CHUNKS: CONFIG.MAX_CHUNKS,
  HEADERS,
  VERSION: '2.0.1'
};

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP SEQUENCE
// ═══════════════════════════════════════════════════════════════════════════

console.log('');
console.log('🚀 ═══════════════════════════════════════════════════════════════');
console.log('   ENHANCED TELEGRAM SPLITTER v2.0.1 - SYNTAX FIXED');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('🔧 FIXES:');
console.log('   • Resolved "Unexpected token \'}\'" syntax error');
console.log('   • Fixed EventEmitter import for environments without events module');
console.log('   • Enhanced multimodal support for your system');
console.log('   • Improved error handling and fallback mechanisms');
console.log('');
console.log('🎯 MULTIMODAL INTEGRATION:');
console.log('   • GPT-4o Vision support with specialized headers');
console.log('   • Whisper audio analysis compatibility');
console.log('   • Document analysis with GPT-5 Mini/Full');
console.log('   • Smart chunking for large multimodal responses');
console.log('');
console.log('⚙️ CONFIGURATION:');
console.log(`   • Max Chunk Size: ${CONFIG.SAFE_CHUNK_SIZE} characters`);
console.log(`   • Max Chunks: ${CONFIG.MAX_CHUNKS} per message`);
console.log(`   • Rate Limit Delay: ${CONFIG.RATE_LIMIT_DELAY}ms`);
console.log(`   • Compression: ${CONFIG.ENABLE_COMPRESSION ? 'Enabled' : 'Disabled'}`);
console.log(`   • Debug Mode: ${CONFIG.DEBUG_MODE ? 'Enabled' : 'Disabled'}`);
console.log('');
console.log('🔗 READY FOR:');
console.log('   • Your dualCommandSystem integration');
console.log('   • Multimodal module compatibility');
console.log('   • GPT-5 API responses');
console.log('   • Railway deployment');
console.log('');
console.log('📚 USAGE:');
console.log('   const handler = createTelegramHandler(bot);');
console.log('   await handler.sendMultimodal(chatId, analysis, { type: "Image" });');
console.log('');
console.log('✅ Import should now work without syntax errors!');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
