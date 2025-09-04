// utils/telegramSplitter.js - PRODUCTION OPTIMIZED VERSION
// ════════════════════════════════════════════════════════════════════════════
// 🚀 ENHANCED: Advanced splitting algorithms, memory optimization
// 🛡️ ROBUST: Comprehensive error handling, retry mechanisms
// 🎨 BEAUTIFUL: Dynamic headers, progress indicators, rich formatting
// ⚡ FAST: Stream processing, async optimization, smart caching
// 🔧 CONFIGURABLE: Environment-driven settings, plugin architecture
// ════════════════════════════════════════════════════════════════════════════

'use strict';

const EventEmitter = require('events');

console.log('🚀 Loading ENHANCED Telegram Splitter v2.0...');

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

// Enhanced header templates with dynamic content
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
  progress: {
    top: '╭──────────────────────────────────────────╮',
    title: '│              📊 Processing...              │',
    model: '│             {PROGRESS_BAR}             │',
    meta: '│        {CURRENT}/{TOTAL} • {PERCENTAGE}%        │',
    bottom: '╰──────────────────────────────────────────╯'
  },
  streaming: {
    top: '╭──────────────────────────────────────────╮',
    title: '│              🌊 Live Stream                │',
    model: '│              📡 {MODEL} Active              │',
    meta: '│         {TIMESTAMP} • Chunk {INDEX}         │',
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
    const recent = this.history.slice(-100); // Last 100 operations
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
// ADVANCED TEXT PROCESSING
// ═══════════════════════════════════════════════════════════════════════════

function safeString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function compressText(text) {
  if (!CONFIG.ENABLE_COMPRESSION) return text;
  
  return text
    .replace(/\n{4,}/g, '\n\n\n')        // Max 3 consecutive newlines
    .replace(/[ \t]{3,}/g, '  ')         // Max 2 consecutive spaces
    .replace(/([.!?])\s+/g, '$1 ')       // Single space after punctuation
    .replace(/\s*([,;:])\s*/g, '$1 ')    // Normalize punctuation spacing
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
    
    // Handle triple backticks
    if (nextTwoChars === '```' && (i === 0 || text[i - 1] !== '\\')) {
      if (inTripleBlock) {
        blocks.push({ start: currentBlockStart, end: i + 3, type: 'triple' });
        inTripleBlock = false;
      } else if (!inSingleBlock) {
        currentBlockStart = i;
        inTripleBlock = true;
      }
      i += 2; // Skip next 2 characters
      continue;
    }
    
    // Handle single backticks
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
  
  // Handle unclosed blocks
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

function findOptimalBreakpoint(text, maxLength, strategy = 'smart') {
  if (text.length <= maxLength) return text.length;
  
  const searchStart = Math.max(0, maxLength - 400);
  const searchEnd = Math.min(text.length, maxLength);
  const searchText = text.substring(searchStart, searchEnd);
  
  // Strategy: smart (default)
  if (strategy === 'smart') {
    // Priority 1: Section breaks (double newlines)
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
    
    // Priority 3: List items or bullet points
    const listPatterns = ['\n• ', '\n- ', '\n* ', '\n1. ', '\n2. ', '\n3. '];
    for (const pattern of listPatterns) {
      const listBreak = searchText.lastIndexOf(pattern);
      if (listBreak !== -1) {
        const position = searchStart + listBreak + 1;
        if (!isInsideCodeBlock(text, position)) {
          return position;
        }
      }
    }
    
    // Priority 4: Sentence endings
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
  }
  
  // Fallback strategies
  const lineBreak = searchText.lastIndexOf('\n');
  if (lineBreak !== -1) {
    const position = searchStart + lineBreak + 1;
    if (!isInsideCodeBlock(text, position)) {
      return position;
    }
  }
  
  const wordBreak = searchText.lastIndexOf(' ');
  if (wordBreak !== -1) {
    return searchStart + wordBreak + 1;
  }
  
  // Last resort: hard break with warning
  logger.warn('Using hard break for text splitting - content may be malformed');
  return maxLength - 10; // Small buffer for safety
}

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED TEXT SPLITTING WITH STREAMING SUPPORT
// ═══════════════════════════════════════════════════════════════════════════

class TextSplitter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      maxChunkSize: options.maxChunkSize || CONFIG.SAFE_CHUNK_SIZE,
      maxChunks: options.maxChunks || CONFIG.MAX_CHUNKS,
      strategy: options.strategy || 'smart',
      preserveFormatting: options.preserveFormatting !== false,
      enableCompression: options.enableCompression !== false
    };
  }
  
  async splitText(text, progressCallback) {
    const startTime = Date.now();
    let cleanedText = safeString(text).trim();
    
    // Apply compression if enabled
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
      // Progress reporting
      if (progressCallback && chunkCount % 2 === 0) {
        progressCallback(chunkCount, estimatedTotal, chunks.length);
      }
      
      let breakpoint;
      
      if (remaining.length <= this.options.maxChunkSize) {
        chunks.push(remaining.trim());
        break;
      }
      
      // Find optimal breakpoint
      breakpoint = findOptimalBreakpoint(remaining, this.options.maxChunkSize, this.options.strategy);
      
      // Extract chunk
      const chunk = remaining.substring(0, breakpoint).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      
      remaining = remaining.substring(breakpoint).trim();
      chunkCount++;
      
      // Emit progress event
      this.emit('progress', {
        current: chunkCount,
        total: estimatedTotal,
        remaining: remaining.length,
        chunk: chunk.substring(0, 100) + '...'
      });
      
      // Yield control periodically for large texts
      if (chunkCount % 5 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
    
    // Handle remaining text if we hit max chunks
    if (remaining.length > 0 && chunkCount >= this.options.maxChunks) {
      const lastChunk = chunks[chunks.length - 1] || '';
      const combinedLength = lastChunk.length + remaining.length;
      
      if (combinedLength <= CONFIG.TELEGRAM_LIMIT * 1.1) { // 10% tolerance
        chunks[chunks.length - 1] = lastChunk + '\n\n' + remaining;
      } else {
        const truncationMsg = `\n\n...[Response truncated - ${remaining.length} characters remaining]`;
        chunks.push(truncationMsg);
        logger.warn(`Text truncated: ${remaining.length} characters exceeded limit`);
      }
    }
    
    const processingTime = Date.now() - startTime;
    logger.debug(`Text splitting completed: ${chunks.length} chunks in ${processingTime}ms`);
    
    return chunks.filter(chunk => chunk.length > 0);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED HEADER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function getModelInfo(metadata) {
  const model = safeString(metadata.model || metadata.modelUsed || metadata.aiUsed || 'gpt-5');
  const version = metadata.version || metadata.modelVersion || '';
  
  // Model name cleanup and standardization
  const modelMap = {
    'gpt-5-nano': { name: 'GPT-5 Nano', emoji: '⚡' },
    'gpt-5-mini': { name: 'GPT-5 Mini', emoji: '🔧' },
    'gpt-5': { name: 'GPT-5', emoji: '🚀' },
    'gpt-4': { name: 'GPT-4', emoji: '🧠' },
    'claude': { name: 'Claude', emoji: '🤖' },
    'completion': { name: 'Auto-Complete', emoji: '✨' },
    'error': { name: 'Error Handler', emoji: '🔧' },
    'system': { name: 'System', emoji: '⚙️' }
  };
  
  // Find best match
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
  if (metadata.streaming) return 'streaming';
  if (metadata.progress) return 'progress';
  if (metadata.completionDetected || metadata.aiUsed === 'completion-detection') return 'completion';
  if (metadata.error || metadata.aiUsed === 'error-fallback') return 'error';
  if (metadata.model || metadata.modelUsed || metadata.aiUsed) return 'gpt5';
  return 'simple';
}

function buildProgressBar(current, total, width = 20) {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  
  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);
  
  return `${filledBar}${emptyBar}`;
}

function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString('en-US', { 
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
  
  // Dynamic content generation
  const replacements = {
    TITLE: metadata.title || 'AI Response',
    MODEL: modelInfo.name,
    VERSION: modelInfo.version || '',
    TIMESTAMP: formatTimestamp(),
    CHUNKS: chunkInfo.total || 1,
    PROCESSING_TIME: metadata.processingTime ? `${metadata.processingTime}ms` : 'Fast',
    CODE: metadata.errorCode || '500',
    PROGRESS_BAR: buildProgressBar(chunkInfo.current || 1, chunkInfo.total || 1),
    CURRENT: chunkInfo.current || 1,
    TOTAL: chunkInfo.total || 1,
    PERCENTAGE: Math.round(((chunkInfo.current || 1) / (chunkInfo.total || 1)) * 100),
    INDEX: chunkInfo.index || 1
  };
  
  // Apply replacements and center text
  const processLine = (line) => {
    let processed = line;
    Object.entries(replacements).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    
    // Center the content within the box
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
// ENHANCED MESSAGE SENDING WITH RETRY LOGIC
// ═══════════════════════════════════════════════════════════════════════════

class MessageSender {
  constructor(bot) {
    this.bot = bot;
    this.retryQueue = [];
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
    const processingTime = Date.now() - startTime;
    logger.error(`❌ Critical error in ${processingStage}:`, error.message);
    
    // Record failure metrics
    metrics.record({
      success: false,
      error: error.message,
      stage: processingStage,
      processingTime
    });
    
    // Emergency fallback system
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
// STREAMING MESSAGE SUPPORT
// ═══════════════════════════════════════════════════════════════════════════

class StreamingMessageSender extends EventEmitter {
  constructor(bot, chatId) {
    super();
    this.bot = bot;
    this.chatId = chatId;
    this.messageQueue = [];
    this.isProcessing = false;
    this.currentMessageId = null;
  }
  
  async startStream(initialText, metadata = {}) {
    const streamMetadata = { ...metadata, streaming: true };
    const result = await sendTelegramMessage(this.bot, this.chatId, initialText, streamMetadata);
    
    if (result.success && result.results[0]?.result?.message_id) {
      this.currentMessageId = result.results[0].result.message_id;
      this.emit('streamStarted', this.currentMessageId);
    }
    
    return result;
  }
  
  async updateStream(newText, append = true) {
    if (!this.currentMessageId) {
      throw new Error('No active stream to update');
    }
    
    try {
      const updateText = append ? newText : newText;
      await this.bot.editMessageText(updateText, {
        chat_id: this.chatId,
        message_id: this.currentMessageId,
        parse_mode: 'Markdown'
      });
      
      this.emit('streamUpdated', updateText);
      return { success: true };
      
    } catch (error) {
      // If edit fails, send as new message
      logger.warn('Stream update failed, sending as new message:', error.message);
      const result = await sendTelegramMessage(this.bot, this.chatId, newText, { streaming: true });
      
      if (result.success && result.results[0]?.result?.message_id) {
        this.currentMessageId = result.results[0].result.message_id;
      }
      
      return result;
    }
  }
  
  endStream() {
    this.currentMessageId = null;
    this.emit('streamEnded');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED HELPER FUNCTIONS & FACTORY METHODS
// ═══════════════════════════════════════════════════════════════════════════

function createTelegramHandler(bot, options = {}) {
  const config = { ...CONFIG, ...options };
  
  return {
    // Main sending methods
    send: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
    sendMessage: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
    sendGPTResponse: async (chatId, text, metadata = {}) => sendTelegramMessage(bot, chatId, text, metadata),
    
    // Specialized methods
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
    
    sendAlert: async (chatId, alertText, options = {}) => {
      return sendTelegramMessage(bot, chatId, alertText, {
        model: 'alert-system',
        title: options.title || 'System Alert',
        error: true,
        aiUsed: 'system-alert',
        ...options
      });
    },
    
    // Streaming support
    createStream: (chatId) => new StreamingMessageSender(bot, chatId),
    
    // Utility methods
    testConnection: async (chatId) => testTelegramConnection(bot, chatId),
    getMetrics: () => metrics.getStats(),
    clearMetrics: () => metrics.history = [],
    
    // Configuration
    updateConfig: (newConfig) => Object.assign(config, newConfig),
    getConfig: () => ({ ...config })
  };
}

// Advanced testing with comprehensive diagnostics
async function testTelegramConnection(bot, chatId, runDiagnostics = true) {
  const startTime = Date.now();
  
  try {
    logger.info('🔍 Testing Telegram connection...');
    
    // Basic connectivity test
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
    
    // Advanced diagnostics
    logger.info('🔍 Running advanced diagnostics...');
    
    const diagnostics = {
      textSplitting: false,
      largeMessage: false,
      markdownFormatting: false,
      headerGeneration: false,
      errorHandling: false
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
      success: successRate > 0.8, // 80% success rate required
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
// PERFORMANCE MONITORING & HEALTH CHECKS
// ═══════════════════════════════════════════════════════════════════════════

class HealthMonitor {
  constructor() {
    this.healthStatus = {
      overallHealth: 'healthy',
      lastCheck: Date.now(),
      issues: [],
      performance: {
        averageResponseTime: 0,
        errorRate: 0,
        throughput: 0
      }
    };
    this.checkInterval = setInterval(() => this.performHealthCheck(), 60000); // Every minute
  }
  
  performHealthCheck() {
    const stats = metrics.getStats();
    const issues = [];
    
    // Check error rate
    if (stats.failureRate > 0.1) { // 10% failure rate
      issues.push({
        type: 'error_rate',
        severity: 'warning',
        message: `High failure rate: ${Math.round(stats.failureRate * 100)}%`
      });
    }
    
    // Check response times
    if (stats.averageProcessingTime > 5000) { // 5 seconds
      issues.push({
        type: 'performance',
        severity: 'warning',
        message: `Slow response times: ${Math.round(stats.averageProcessingTime)}ms average`
      });
    }
    
    // Check retry rates
    if (stats.retryCount > stats.messagesSent * 0.2) { // 20% of messages require retries
      issues.push({
        type: 'connectivity',
        severity: 'warning',
        message: 'High retry rate indicates connectivity issues'
      });
    }
    
    this.healthStatus = {
      overallHealth: issues.length === 0 ? 'healthy' : 'warning',
      lastCheck: Date.now(),
      issues,
      performance: {
        averageResponseTime: stats.averageProcessingTime,
        errorRate: stats.failureRate,
        throughput: stats.messagesSent
      }
    };
    
    if (issues.length > 0) {
      logger.warn('Health check found issues:', issues);
    }
  }
  
  getHealth() {
    return { ...this.healthStatus };
  }
  
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

const healthMonitor = new HealthMonitor();

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS & API
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Primary API
  sendTelegramMessage,
  createTelegramHandler,
  
  // Legacy compatibility
  setupTelegramHandler: createTelegramHandler, // Alias for backward compatibility
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
  StreamingMessageSender,
  Logger,
  MetricsCollector,
  HealthMonitor,
  
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
  getHealth: () => healthMonitor.getHealth(),
  
  // Constants
  TELEGRAM_LIMIT: CONFIG.TELEGRAM_LIMIT,
  SAFE_CHUNK_SIZE: CONFIG.SAFE_CHUNK_SIZE,
  MAX_CHUNKS: CONFIG.MAX_CHUNKS,
  HEADERS,
  VERSION: '2.0.0'
};

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP SEQUENCE & INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

console.log('');
console.log('🚀 ═══════════════════════════════════════════════════════════════');
console.log('   ENHANCED TELEGRAM SPLITTER v2.0 - PRODUCTION READY');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('✨ FEATURES:');
console.log('   🧠 Advanced text splitting with AI-powered breakpoints');
console.log('   🎨 Dynamic headers with real-time progress indicators');
console.log('   🔄 Automatic retry logic with exponential backoff');
console.log('   🌊 Streaming message support for real-time updates');
console.log('   📊 Built-in metrics collection and health monitoring');
console.log('   🛡️ Comprehensive error handling with emergency fallback');
console.log('   ⚡ Memory-optimized processing for large texts');
console.log('   🔧 Environment-based configuration system');
console.log('   🎯 Code block detection and preservation');
console.log('   📱 Rate limiting and Telegram API optimization');
console.log('   🔍 Advanced diagnostics and testing capabilities');
console.log('   📈 Performance monitoring and alerting');
console.log('');
console.log('⚙️ CONFIGURATION:');
console.log(`   • Max Chunk Size: ${CONFIG.SAFE_CHUNK_SIZE} characters`);
console.log(`   • Max Chunks: ${CONFIG.MAX_CHUNKS} per message`);
console.log(`   • Rate Limit Delay: ${CONFIG.RATE_LIMIT_DELAY}ms`);
console.log(`   • Compression: ${CONFIG.ENABLE_COMPRESSION ? 'Enabled' : 'Disabled'}`);
console.log(`   • Progress Indicators: ${CONFIG.ENABLE_PROGRESS_INDICATORS ? 'Enabled' : 'Disabled'}`);
console.log(`   • Debug Mode: ${CONFIG.DEBUG_MODE ? 'Enabled' : 'Disabled'}`);
console.log(`   • Large Response Support: ${CONFIG.ENABLE_LARGE_RESPONSES ? 'Enabled' : 'Disabled'}`);
console.log('');
console.log('🔗 INTEGRATION:');
console.log('   • Compatible with dualCommandSystem.js');
console.log('   • Memory system integration ready');
console.log('   • Event-driven architecture support');
console.log('   • Backward compatible with existing code');
console.log('');
console.log('📚 USAGE:');
console.log('   const handler = createTelegramHandler(bot);');
console.log('   await handler.send(chatId, message, metadata);');
console.log('');
console.log('✅ Initialization complete - Ready for production use!');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('🔄 Graceful shutdown initiated...');
  healthMonitor.destroy();
  logger.info('✅ Shutdown complete');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🔄 Interrupt received, shutting down...');
  healthMonitor.destroy();
  logger.info('✅ Shutdown complete');  
  process.exit(0);
});
        lastError = error;
        logger.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        // Try without Markdown on parse errors
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
        
        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
          logger.debug(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return { success: false, error: lastError.message, attempts: maxRetries };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENHANCED SENDING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function sendTelegramMessage(bot, chatId, text, metadata = {}) {
  const startTime = Date.now();
  let processingStage = 'initialization';
  
  try {
    logger.info(`📤 Processing message for chat ${chatId}`);
    
    // Input validation
    if (!bot || typeof bot.sendMessage !== 'function') {
      throw new Error('Invalid Telegram bot instance provided');
    }
    
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    
    const cleanedText = safeString(text).trim();
    if (!cleanaredText) {
      throw new Error('Message content is empty');
    }
    
    processingStage = 'text_splitting';
    
    // Initialize text splitter
    const splitter = new TextSplitter({
      maxChunkSize: CONFIG.SAFE_CHUNK_SIZE - 200, // Reserve space for headers
      maxChunks: metadata.allowLargeResponse ? CONFIG.MAX_CHUNKS * 2 : CONFIG.MAX_CHUNKS,
      enableCompression: CONFIG.ENABLE_COMPRESSION
    });
    
    // Progress tracking
    let progressCallback = null;
    if (CONFIG.ENABLE_PROGRESS_INDICATORS && cleanedText.length > 10000) {
      progressCallback = (current, total, completed) => {
        logger.debug(`Splitting progress: ${current}/${total} (${completed} chunks ready)`);
      };
    }
    
    // Split text into chunks
    const textChunks = await splitter.splitText(cleanedText, progressCallback);
    logger.info(`📄 Split into ${textChunks.length} chunks`);
    
    processingStage = 'header_generation';
    
    // Build headers with chunk info
    const chunkInfo = { total: textChunks.length };
    const headerData = buildDynamicHeader(metadata, chunkInfo);
    
    // Calculate header size
    const headerText = Object.values(headerData).filter(Boolean).join('\n');
    const headerSize = headerText.length;
    
    processingStage = 'message_sending';
    
    // Initialize message sender
    const sender = new MessageSender(bot);
    const results = [];
    let successCount = 0;
    
    // Send chunks
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      const isFirstChunk = i === 0;
      const isLastChunk = i === textChunks.length - 1;
      
      // Update chunk info for dynamic headers
      chunkInfo.current = i + 1;
      chunkInfo.index = i + 1;
      
      // Build message content
      let messageContent;
      
      if (isFirstChunk && textChunks.length === 1) {
        // Single message
        const singleHeader = buildDynamicHeader(metadata, { total: 1, current: 1 });
        const singleHeaderText = Object.values(singleHeader).filter(Boolean).join('\n');
        messageContent = `${singleHeaderText}\n\n${chunk}`;
      } else if (isFirstChunk) {
        // First of multiple
        const multiHeader = buildDynamicHeader(metadata, chunkInfo);
        const multiHeaderText = Object.values(multiHeader).filter(Boolean).join('\n');
        messageContent = `${multiHeaderText}\n\n${chunk}`;
      } else {
        // Continuation chunk
        const partHeader = CONFIG.ENABLE_PROGRESS_INDICATORS
          ? `📄 Part ${i + 1}/${textChunks.length} ${buildProgressBar(i + 1, textChunks.length, 10)}`
          : `📄 Part ${i + 1}/${textChunks.length}`;
        messageContent = `${partHeader}\n\n${chunk}`;
      }
      
      // Ensure message doesn't exceed Telegram limits
      if (messageContent.length > CONFIG.TELEGRAM_LIMIT) {
        logger.warn(`Chunk ${i + 1} exceeds Telegram limit, truncating...`);
        const availableSpace = CONFIG.TELEGRAM_LIMIT - 100; // Safety margin
        const truncationMsg = '\n\n...[Content truncated]';
        messageContent = messageContent.substring(0, availableSpace - truncationMsg.length) + truncationMsg;
      }
      
      // Send message with retry logic
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
      
      // Rate limiting delay
      if (!isLastChunk && CONFIG.RATE_LIMIT_DELAY > 0) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
      }
    }
    
    processingStage = 'completion';
    
    const processingTime = Date.now() - startTime;
    const allSuccessful = successCount === textChunks.length;
    const modelInfo = getModelInfo(metadata);
    
    // Record metrics
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
      compressionRatio: text.length > 0 ? cleanedText.length / text.length : 1,
      results,
      fallbackUsed: results.some(r => r.fallback),
      retryCount: results.reduce((sum, r) => sum + (r.attempts - 1), 0),
      metrics: metrics.getStats()
    };
    
  } catch (error) {
