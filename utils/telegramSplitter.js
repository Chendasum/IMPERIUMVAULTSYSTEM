// utils/telegramSplitter.js - GPT-5 Core Intelligent Message Formatter + Streamer
// ═══════════════════════════════════════════════════════════════════════════
// Features:
// • GPT-5-powered content analysis/enhancement (block mode)
// • Intelligent splitting + adaptive headers
// • Low-latency streaming dispatcher for MAX mode (no GPT enhancement mid-stream)
// • Strict Telegram limits handling (4096 hard cap)
// • Backwards compatible exports
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  TELEGRAM_MAX_LENGTH: 4096,
  DEFAULT_CHUNK_SIZE: 3600,           // for block sends (post-processed)
  HEADER_SIZE: 180,                   // reserved for adaptive header
  MIN_CHUNK_SIZE: 100,
  DELAY_BETWEEN_MESSAGES: 1000,
  DEBUG_MODE: process.env.NODE_ENV === 'development',

  // GPT-5 Intelligence Settings (for block mode only)
  FORMATTING_MODEL: 'gpt-5-nano',
  ENHANCEMENT_MODEL: 'gpt-5-mini',
  MAX_ENHANCEMENT_TOKENS: 1000,
  INTELLIGENCE_CACHE_SIZE: 100
};

// GPT-5 Model Information
const GPT5_MODELS = {
  'gpt-5':      { name: 'GPT-5',      icon: '🧠', description: 'Advanced reasoning' },
  'gpt-5-mini': { name: 'GPT-5 Mini', icon: '⚡', description: 'Smart & efficient' },
  'gpt-5-nano': { name: 'GPT-5 Nano', icon: '💫', description: 'Lightning fast' }
};

// ═══════════════════════════════════════════════════════════════════════════
/** LOGGING UTILITY **/
// ═══════════════════════════════════════════════════════════════════════════
class Logger {
  static log(level, message, data = null) {
    if (!CONFIG.DEBUG_MODE && level === 'debug') return;
    const prefix = { error: '❌', warn: '⚠️', info: 'ℹ️', debug: '🔍', success: '✅' }[level] || 'ℹ️';
    console.log(`${prefix} [GPT5-Splitter] ${message}`);
    if (data && CONFIG.DEBUG_MODE) console.log(JSON.stringify(data, null, 2));
  }
  static error = (m, e = null) => this.log('error', m, e);
  static warn  = (m, d = null) => this.log('warn', m, d);
  static info  = (m, d = null) => this.log('info', m, d);
  static debug = (m, d = null) => this.log('debug', m, d);
  static success = (m, d = null) => this.log('success', m, d);
}

// ═══════════════════════════════════════════════════════════════════════════
/** INTELLIGENT CACHE SYSTEM **/
// ═══════════════════════════════════════════════════════════════════════════
class IntelligenceCache {
  constructor(maxSize = CONFIG.INTELLIGENCE_CACHE_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  generateKey(text, operation) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(`${operation}:${text.substring(0, 200)}`).digest('hex');
  }
  get(text, operation) {
    const key = this.generateKey(text, operation);
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 3600000) {
      Logger.debug(`Cache hit for ${operation}`);
      return cached.result;
    }
    return null;
  }
  set(text, operation, result) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    const key = this.generateKey(text, operation);
    this.cache.set(key, { result, timestamp: Date.now() });
  }
  clear() { this.cache.clear(); }
}
const intelligenceCache = new IntelligenceCache();

// ═══════════════════════════════════════════════════════════════════════════
/** GPT-5 CORE INTELLIGENCE ENGINE (block mode) **/
// ═══════════════════════════════════════════════════════════════════════════
class GPT5Intelligence {
  static openaiClient = null;

  static initialize(openaiClientInstance) {
    this.openaiClient = openaiClientInstance;
    Logger.info('GPT-5 Intelligence Engine initialized');
  }

  static async analyzeContent(text) {
    if (!this.openaiClient) {
      Logger.warn('OpenAI client not initialized, using fallback analysis');
      return this.fallbackAnalysis(text);
    }
    const cached = intelligenceCache.get(text, 'analysis');
    if (cached) return cached;

    try {
      const analysisPrompt =
`Analyze this text for Telegram formatting. Respond with ONLY a JSON object:

Text: "${text.substring(0, 500)}..."

JSON format:
{
  "contentType": "business|technical|conversational|financial|educational|creative",
  "formality": "casual|professional|formal",
  "emojiStyle": "minimal|moderate|expressive",
  "hasLists": true/false,
  "needsEnhancement": true/false,
  "suggestedEmojis": ["💡","🎯"],
  "keyTopics": ["money","success"],
  "tone": "helpful|advisory|informative"
}`;

      const result = await this.openaiClient.getGPT5Analysis(analysisPrompt, {
        model: CONFIG.FORMATTING_MODEL,
        reasoning_effort: 'minimal',
        max_output_tokens: 300
      });

      const analysis = JSON.parse(String(result).replace(/```json\n?|\n?```/g, ''));
      intelligenceCache.set(text, 'analysis', analysis);
      Logger.debug('GPT-5 content analysis complete', analysis);
      return analysis;

    } catch (error) {
      Logger.warn('GPT-5 analysis failed, using fallback', error);
      return this.fallbackAnalysis(text);
    }
  }

  static async enhanceMessage(text, analysis) {
    if (!this.openaiClient || !analysis.needsEnhancement) return text;

    const cached = intelligenceCache.get(text, 'enhancement');
    if (cached) return cached;

    try {
      const enhancementPrompt =
`Enhance this text for Telegram with intelligent emojis and formatting. Rules:

1. Add contextual emojis SPARINGLY (${analysis.emojiStyle} style)
2. Keep original meaning and structure
3. Make it more engaging but professional
4. Focus on ${analysis.contentType} content
5. Tone should be ${analysis.tone}
6. ${analysis.formality} formality level

Original text:
"${text}"

Enhanced version:`;

      const enhanced = await this.openaiClient.getGPT5Analysis(enhancementPrompt, {
        model: CONFIG.ENHANCEMENT_MODEL,
        reasoning_effort: 'low',
        max_output_tokens: Math.min(text.length * 2, CONFIG.MAX_ENHANCEMENT_TOKENS)
      });

      const cleaned = String(enhanced).replace(/```\w*\n?|\n?```/g, '').trim();
      intelligenceCache.set(text, 'enhancement', cleaned);

      Logger.debug('GPT-5 enhancement complete', { originalLength: text.length, enhancedLength: cleaned.length });
      return cleaned;

    } catch (error) {
      Logger.warn('GPT-5 enhancement failed, using original', error);
      return text;
    }
  }

  static async smartSplit(text, maxLength) {
    if (!this.openaiClient || text.length <= maxLength) {
      return this.fallbackSplit(text, maxLength);
    }
    try {
      const partsNeeded = Math.ceil(text.length / maxLength);
      const splitPrompt =
`Split this text into ${partsNeeded} parts for Telegram (max ${maxLength} chars each). Rules:

1. Preserve meaning and context
2. Split at natural break points
3. Each part should be self-contained
4. Maintain formatting and emojis
5. Return as numbered parts

Text to split:
"${text}"

Split into parts:`;

      const result = await this.openaiClient.getGPT5Analysis(splitPrompt, {
        model: CONFIG.FORMATTING_MODEL,
        reasoning_effort: 'minimal',
        max_output_tokens: Math.min(partsNeeded * 400, 1500)
      });

      const parts = this.extractParts(String(result));
      if (parts.length > 0 && parts.every(p => p.length <= maxLength + 100)) {
        Logger.debug('GPT-5 smart split successful', { parts: parts.length });
        return parts;
      } else {
        throw new Error('GPT-5 split produced invalid parts');
      }

    } catch (error) {
      Logger.warn('GPT-5 smart split failed, using fallback', error);
      return this.fallbackSplit(text, maxLength);
    }
  }

  static extractParts(splitResult) {
    const parts = [];
    const lines = String(splitResult).split('\n');
    let current = '';

    for (const line of lines) {
      if (/^\d+[.:]/.test(line.trim())) {
        if (current.trim()) parts.push(current.trim());
        current = line.replace(/^\d+[.:]\s*/, '');
      } else if (current) {
        current += '\n' + line;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts.length ? parts : [String(splitResult)];
  }

  static fallbackAnalysis(text) {
    return {
      contentType: 'general',
      formality: 'professional',
      emojiStyle: 'moderate',
      hasLists: /^\d+\.|\n[-•]/.test(text),
      needsEnhancement: false,
      suggestedEmojis: [],
      keyTopics: [],
      tone: 'informative'
    };
  }

  static fallbackSplit(text, maxLength) {
    const parts = [];
    let current = '';
    const paragraphs = String(text).split('\n\n');

    for (const paragraph of paragraphs) {
      if (current.length + paragraph.length + 2 <= maxLength) {
        current = current ? `${current}\n\n${paragraph}` : paragraph;
      } else {
        if (current) parts.push(current);
        if (paragraph.length > maxLength) {
          for (let i = 0; i < paragraph.length; i += maxLength) {
            parts.push(paragraph.slice(i, i + maxLength));
          }
          current = '';
        } else {
          current = paragraph;
        }
      }
    }
    if (current) parts.push(current);
    return parts.length ? parts : [String(text)];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
/** ADAPTIVE HEADER GENERATOR **/
// ═══════════════════════════════════════════════════════════════════════════
class AdaptiveHeaders {
  static generate(options = {}) {
    const {
      model = 'gpt-5-mini',
      partNumber = 1,
      totalParts = 1,
      analysis = {},
      messageLength = 0
    } = options;

    try {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const modelInfo = GPT5_MODELS[model] || GPT5_MODELS['gpt-5-mini'];
      const partInfo = totalParts > 1 ? ` (${partNumber}/${totalParts})` : '';
      const contextIcon = this.getContextIcon(analysis.contentType, analysis.tone);
      const contextLabel = analysis.contentType || 'response';

      return `${modelInfo.icon} ${modelInfo.name}${partInfo}
📅 ${timestamp} • ${contextIcon} ${contextLabel}

`;

    } catch (error) {
      Logger.error('Header generation failed', error);
      return `🧠 GPT-5\n\n`;
    }
  }

  static getContextIcon(contentType, tone) {
    const iconMap = {
      business: '💼',
      financial: '💰',
      technical: '⚙️',
      educational: '📚',
      conversational: '💬',
      creative: '🎨',
      advisory: '💡',
      helpful: '🤝',
      informative: '📋'
    };
    return iconMap[contentType] || iconMap[tone] || '📋';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
/** MAIN GPT-5 POWERED FORMATTER (block mode) **/
// ═══════════════════════════════════════════════════════════════════════════
class GPT5TelegramFormatter {
  static async formatMessage(text, options = {}) {
    const settings = {
      maxLength: CONFIG.DEFAULT_CHUNK_SIZE,
      includeHeaders: true,
      useGPT5Intelligence: true,
      enhanceWithGPT5: true,
      ...options
    };

    Logger.info('Starting GPT-5 intelligent formatting', {
      textLength: text?.length || 0,
      useIntelligence: settings.useGPT5Intelligence
    });

    try {
      if (!text || typeof text !== 'string') return ['⚠️ No content to format'];
      if (text.trim().length === 0) return ['📭 Empty response'];

      let processedText = text;
      let analysis = { contentType: 'general', tone: 'informative', formality: 'professional', needsEnhancement: false };

      if (settings.useGPT5Intelligence) {
        try {
          analysis = await GPT5Intelligence.analyzeContent(text);
          Logger.debug('GPT-5 analysis complete', analysis);

          if (settings.enhanceWithGPT5 && analysis.needsEnhancement) {
            processedText = await GPT5Intelligence.enhanceMessage(text, analysis);
            Logger.debug('GPT-5 enhancement applied');
          }
        } catch (aiError) {
          Logger.warn('GPT-5 intelligence failed, using fallback', aiError);
        }
      }

      const headerSpace = settings.includeHeaders ? CONFIG.HEADER_SIZE : 0;
      const availableSpace = Math.max(settings.maxLength - headerSpace, CONFIG.MIN_CHUNK_SIZE);

      let chunks;
      if (settings.useGPT5Intelligence && processedText.length > availableSpace) {
        chunks = await GPT5Intelligence.smartSplit(processedText, availableSpace);
      } else {
        chunks = GPT5Intelligence.fallbackSplit(processedText, availableSpace);
      }
      if (!chunks || chunks.length === 0) chunks = [processedText];

      Logger.success('GPT-5 formatting complete', {
        chunks: chunks.length,
        enhanced: processedText !== text,
        intelligenceUsed: settings.useGPT5Intelligence
      });

      if (settings.includeHeaders) {
        const modelUsed = this.selectModelFromAnalysis(analysis);
        return chunks.map((chunk, index) => {
          const header = AdaptiveHeaders.generate({
            model: modelUsed,
            partNumber: index + 1,
            totalParts: chunks.length,
            analysis: analysis,
            messageLength: chunk.length
          });
          return header + chunk;
        });
      }
      return chunks;

    } catch (error) {
      Logger.error('GPT-5 formatting failed completely', error);
      const fallbackChunks = GPT5Intelligence.fallbackSplit(String(text), CONFIG.DEFAULT_CHUNK_SIZE);
      return fallbackChunks.map((chunk, index) => {
        const partInfo = fallbackChunks.length > 1 ? ` (${index + 1}/${fallbackChunks.length})` : '';
        return `🧠 GPT-5${partInfo}\n\n${chunk}`;
      });
    }
  }

  static selectModelFromAnalysis(analysis) {
    if (analysis.contentType === 'conversational' && analysis.formality === 'casual') return 'gpt-5-nano';
    if (analysis.contentType === 'technical' || analysis.contentType === 'business') return 'gpt-5';
    return 'gpt-5-mini';
  }

  static async quickFormat(text) {
    return this.formatMessage(text, {
      includeHeaders: false,
      useGPT5Intelligence: false,
      enhanceWithGPT5: false
    });
  }

  static async intelligentFormat(text) {
    return this.formatMessage(text, {
      includeHeaders: true,
      useGPT5Intelligence: true,
      enhanceWithGPT5: true
    });
  }

  static async adaptiveFormat(text, style = 'auto') {
    const styleSettings = {
      minimal:  { enhanceWithGPT5: false, useGPT5Intelligence: true },
      moderate: { enhanceWithGPT5: true,  useGPT5Intelligence: true },
      rich:     { enhanceWithGPT5: true,  useGPT5Intelligence: true },
      auto:     { enhanceWithGPT5: true,  useGPT5Intelligence: true }
    };
    return this.formatMessage(text, { includeHeaders: true, ...(styleSettings[style] || styleSettings.auto) });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
/** TELEGRAM BOT (block sender) **/
// ═══════════════════════════════════════════════════════════════════════════
class TelegramBotHelper {
  static async sendFormattedMessage(bot, chatId, text, options = {}) {
    const settings = {
      delay: CONFIG.DELAY_BETWEEN_MESSAGES,
      parseMode: null,
      useGPT5Intelligence: true,
      ...options
    };

    try {
      const formattedParts = await GPT5TelegramFormatter.formatMessage(text, settings);
      Logger.info(`Sending ${formattedParts.length} intelligently formatted parts`, { chatId });

      const results = [];
      for (let i = 0; i < formattedParts.length; i++) {
        try {
          const sendOptions = {};
          if (settings.parseMode) sendOptions.parse_mode = settings.parseMode;
          const result = await bot.sendMessage(chatId, formattedParts[i], sendOptions);
          results.push(result);

          if (i < formattedParts.length - 1 && settings.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, settings.delay));
          }
        } catch (sendError) {
          Logger.error(`Failed to send part ${i + 1}`, sendError);
          try {
            const result = await bot.sendMessage(chatId, formattedParts[i]);
            results.push(result);
          } catch (retryError) {
            Logger.error(`Complete send failure for part ${i + 1}`, retryError);
          }
        }
      }
      Logger.success(`Successfully sent ${results.length}/${formattedParts.length} parts with GPT-5 intelligence`);
      return results;

    } catch (error) {
      Logger.error('GPT-5 send failed completely', error);
      try {
        const result = await bot.sendMessage(chatId, text || '❌ Processing error');
        return [result];
      } catch (fallbackError) {
        Logger.error('Even fallback failed', fallbackError);
        throw fallbackError;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
/** LOW-LATENCY STREAM DISPATCHER (for MAX mode) **/
// ═══════════════════════════════════════════════════════════════════════════
class StreamDispatcher {
  constructor(bot, chatId, opts = {}) {
    this.bot = bot;
    this.chatId = chatId;
    this.buffer = "";
    this.sentParts = 0;
    this.closed = false;
    this.lastSendAt = 0;

    // Strict limits
    this.maxTelegram = CONFIG.TELEGRAM_MAX_LENGTH;
    this.softChunk = Math.min(CONFIG.DEFAULT_CHUNK_SIZE, this.maxTelegram - 16);

    // Streaming heuristics
    this.minFlush = 400;          // min chars before timed flush
    this.maxWaitMs = 1200;        // max delay between flushes
    this.headerOn = !!opts.includeHeaders;
    this.headerModel = opts.headerModel || "gpt-5-mini";
    this.analysis = opts.analysis || { contentType: "general", tone: "informative" };

    this.timer = null;
  }

  _header() {
    if (!this.headerOn) return "";
    const header = AdaptiveHeaders.generate({
      model: this.headerModel,
      partNumber: this.sentParts + 1,
      totalParts: 999, // unknown at stream time; cosmetic only
      analysis: this.analysis,
      messageLength: 0
    });
    return header;
  }

  async _send(text) {
    if (!text || !text.trim()) return;
    if (this.closed) return;

    // Ensure payload ≤ Telegram hard limit
    let idx = 0;
    while (idx < text.length) {
      const slice = text.slice(idx, idx + this.maxTelegram);
      try {
        await this.bot.sendMessage(this.chatId, slice);
        this.sentParts += 1;
        this.lastSendAt = Date.now();
      } catch (e) {
        Logger.error("Stream send failure", e);
        try { await this.bot.sendMessage(this.chatId, slice); }
        catch (e2) { Logger.error("Stream send hard failure", e2); }
      }
      idx += this.maxTelegram;
    }
  }

  _shouldFlush(now) {
    if (this.buffer.length >= this.softChunk) return true;
    if (this.buffer.length >= this.minFlush && (now - this.lastSendAt) >= this.maxWaitMs) return true;
    // sentence-aware UX: flush around ~800 chars when a sentence ends
    if (this.buffer.length >= 800 && /[.!?…]\s$/.test(this.buffer)) return true;
    return false;
  }

  async push(delta) {
    if (this.closed) return;
    if (!delta) return;

    this.buffer += delta;
    const now = Date.now();

    if (this._shouldFlush(now)) {
      const payload = this._header() + this.buffer;
      this.buffer = "";
      await this._send(payload);
    } else {
      // Safety timer so tails don’t hang
      if (!this.timer) {
        this.timer = setTimeout(async () => {
          this.timer = null;
          if (this.buffer.length) {
            const payload = this._header() + this.buffer;
            this.buffer = "";
            await this._send(payload);
          }
        }, this.maxWaitMs);
      }
    }
  }

  async finish(finalNote = "") {
    if (this.closed) return;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.closed = true;

    const tail = (this.buffer + (finalNote || "")).trim();
    this.buffer = "";
    if (tail) {
      const payload = (this.headerOn ? this._header() : "") + tail;
      await this._send(payload);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
/** STREAMING API (simple facade) **/
// ═══════════════════════════════════════════════════════════════════════════
class StreamingAPI {
  static sessions = new Map(); // key: chatId

  static start(bot, chatId, opts = {}) {
    const s = new StreamDispatcher(bot, chatId, opts);
    this.sessions.set(chatId, s);
    return s;
  }

  static get(chatId) { return this.sessions.get(chatId); }

  static async push(chatId, chunk) {
    const s = this.sessions.get(chatId);
    if (!s) return;
    await s.push(chunk);
  }

  static async finish(chatId, finalNote = "") {
    const s = this.sessions.get(chatId);
    if (!s) return;
    await s.finish(finalNote);
    this.sessions.delete(chatId);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
/** SYSTEM UTILITIES **/
// ═══════════════════════════════════════════════════════════════════════════
class SystemUtils {
  static async initialize(openaiClient) {
    GPT5Intelligence.initialize(openaiClient);
    Logger.success('GPT-5 Intelligence Splitter initialized');
  }

  static getSystemInfo() {
    return {
      version: '4.1.0-gpt5-core-stream',
      type: 'GPT-5 Core Intelligence Formatter + Streamer',
      features: [
        'GPT-5 powered content analysis (block mode)',
        'AI-driven message enhancement (block mode)',
        'Intelligent content splitting',
        'Adaptive headers and formatting',
        'Low-latency streaming for MAX mode',
        'Sentence-aware flushing',
        'Strict Telegram limits',
        'Smart caching system'
      ],
      models: Object.keys(GPT5_MODELS),
      cacheSize: intelligenceCache.cache.size,
      config: CONFIG
    };
  }

  static async test(openaiClient) {
    if (openaiClient) await this.initialize(openaiClient);

    const testText =
`GPT-5 Core Intelligence Test

This is a test of the GPT-5 powered telegram splitter that uses artificial intelligence to analyze content, enhance messages, and format them intelligently.

Key features being tested:
1. Content analysis with GPT-5
2. Intelligent emoji enhancement
3. Smart message splitting
4. Adaptive header generation

The system should automatically detect this as educational content and enhance it accordingly while maintaining professional formatting.`;

    Logger.info('Running GPT-5 intelligence test...');
    const result = await GPT5TelegramFormatter.intelligentFormat(testText);

    console.log('\n=== GPT-5 INTELLIGENCE TEST ===');
    result.forEach((part, idx) => {
      console.log(`\n--- Intelligent Part ${idx + 1} ---`);
      console.log(part);
    });
    console.log('\n=== END GPT-5 TEST ===\n');

    return result;
  }

  static clearCache() { intelligenceCache.clear(); Logger.info('Intelligence cache cleared'); }

  static getCacheStats() {
    return { size: intelligenceCache.cache.size, maxSize: intelligenceCache.maxSize, hitRate: 'Available in logs' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
/** MODULE EXPORTS **/
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
  // Main API (block mode)
  formatMessage: GPT5TelegramFormatter.formatMessage.bind(GPT5TelegramFormatter),
  sendFormattedMessage: TelegramBotHelper.sendFormattedMessage.bind(TelegramBotHelper),

  // Intelligence methods
  intelligentFormat: GPT5TelegramFormatter.intelligentFormat.bind(GPT5TelegramFormatter),
  adaptiveFormat: GPT5TelegramFormatter.adaptiveFormat.bind(GPT5TelegramFormatter),
  quickFormat: GPT5TelegramFormatter.quickFormat.bind(GPT5TelegramFormatter),

  // Legacy compatibility (now async)
  splitTelegramMessage: GPT5TelegramFormatter.formatMessage.bind(GPT5TelegramFormatter),
  sendTelegramMessage: TelegramBotHelper.sendFormattedMessage.bind(TelegramBotHelper),

  // Streaming helpers for MAX mode
  startStream: StreamingAPI.start.bind(StreamingAPI),
  pushStreamChunk: StreamingAPI.push.bind(StreamingAPI),
  finishStream: StreamingAPI.finish.bind(StreamingAPI),

  // Advanced classes (optional external use)
  GPT5TelegramFormatter,
  TelegramBotHelper,
  GPT5Intelligence,
  AdaptiveHeaders,
  StreamDispatcher,
  intelligenceCache,

  // Configuration
  CONFIG,
  GPT5_MODELS,

  // System utilities
  initialize: SystemUtils.initialize.bind(SystemUtils),
  getSystemInfo: SystemUtils.getSystemInfo.bind(SystemUtils),
  test: SystemUtils.test.bind(SystemUtils),
  clearCache: SystemUtils.clearCache.bind(SystemUtils),
  getCacheStats: SystemUtils.getCacheStats.bind(SystemUtils),
};

// ═══════════════════════════════════════════════════════════════════════════
/** INITIALIZATION MESSAGE **/
// ═══════════════════════════════════════════════════════════════════════════
Logger.success('GPT-5 Core Intelligence Telegram Formatter + Streamer v4.1 Loaded');
Logger.info('🧠 Powered by GPT-5 Core Intelligence');
Logger.info('🚀 Streaming dispatcher enabled for MAX mode');
Logger.info('⚡ Call initialize(openaiClient) to activate intelligence (block mode)');
console.log('');
console.log('🧠 ═══════════════════════════════════════════════════════════════');
console.log('   GPT-5 CORE INTELLIGENCE TELEGRAM SPLITTER v4.1 (with Stream)');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('✨ FEATURES:');
console.log('   🧠 AI analysis/enhancement for block messages');
console.log('   🎯 Intelligent splitting + adaptive headers');
console.log('   🚀 Low-latency streaming (no enhancement mid-stream)');
console.log('   📏 Strict Telegram 4096 limit, sentence-aware flush');
console.log('   ⚡ Smart caching, robust fallbacks');
console.log('');
console.log('🔧 INTEGRATION:');
console.log('   • Use sendFormattedMessage() for classic block sends');
console.log('   • Use startStream/pushStreamChunk/finishStream for MAX streaming');
console.log('');
console.log('✅ GPT-5 CORE INTELLIGENCE READY');
console.log('🧠 ═══════════════════════════════════════════════════════════════');
console.log('');
