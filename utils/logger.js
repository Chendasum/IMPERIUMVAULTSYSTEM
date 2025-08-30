// utils/logger.js - GPT-5 Aware Logger (Responses API + Chat Completions) with RAW toggle
// -----------------------------------------------------------------------------
// - Clean text extraction (Responses API: output_text / output[].content[].text)
// - Chat Completions: choices[0].message.content
// - RAW mode via env: LOGGER_RAW=1 (and pretty via LOGGER_PRETTY=1)
// - Safe truncation + compact metadata; no accidental mega-dumps
// -----------------------------------------------------------------------------

'use strict';

const fs = require('fs').promises;
const path = require('path');

const RAW_MODE = process.env.LOGGER_RAW === '1';
const RAW_PRETTY = process.env.LOGGER_PRETTY === '1';
const MAX_FILE_LINE = 1000;     // max chars per JSONL line segment (for text fields)
const MAX_CONSOLE_TEXT = 1000;  // cap console response preview

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  // ------------------- Extraction -------------------

  extractGPTContent(gptResponse) {
    if (!gptResponse) return '[No response]';
    if (typeof gptResponse === 'string') return gptResponse;

    // Responses API: direct consolidated field
    if (typeof gptResponse === 'object' && typeof gptResponse.output_text === 'string') {
      return gptResponse.output_text;
    }

    // Responses API: fragmented output[].content[].text
    if (gptResponse && Array.isArray(gptResponse.output)) {
      const parts = [];
      for (const item of gptResponse.output) {
        if (Array.isArray(item?.content)) {
          for (const c of item.content) {
            if (typeof c?.text === 'string') parts.push(c.text);
          }
        }
      }
      if (parts.length) return parts.join('');
    }

    // Chat Completions
    const chatMsg = gptResponse?.choices?.[0]?.message?.content;
    if (typeof chatMsg === 'string') return chatMsg;

    // Common wrappers
    if (typeof gptResponse.content === 'string') return gptResponse.content;
    if (typeof gptResponse.response === 'string') return gptResponse.response;
    if (typeof gptResponse.message === 'string') return gptResponse.message;
    if (typeof gptResponse.text === 'string') return gptResponse.text;

    // Minimal fallback
    try {
      const minimal = {
        model: gptResponse.model,
        usage: gptResponse.usage,
        finish_reason: gptResponse.finish_reason || gptResponse.finishReason,
        note: 'Unrecognized response shape; full dump suppressed (enable LOGGER_RAW=1 to include)',
      };
      return JSON.stringify(minimal, null, 2);
    } catch {
      return '[Invalid response object]';
    }
  }

  // ------------------- Truncation helpers -------------------

  safeTruncate(value, maxLength = 1000) {
    const content = this.extractGPTContent(value);
    if (!content) return '[Empty]';
    return content.length <= maxLength ? content : content.substring(0, maxLength) + '... (truncated)';
  }

  // Redact big string fields inside arbitrary objects for RAW logs
  redactLargeStrings(obj, limit = MAX_FILE_LINE) {
    const seen = new WeakSet();
    const walk = (v) => {
      if (v && typeof v === 'object') {
        if (seen.has(v)) return '[Circular]';
        seen.add(v);

        if (Array.isArray(v)) return v.map(walk);

        const out = {};
        for (const [k, val] of Object.entries(v)) {
          if (typeof val === 'string' && val.length > limit) {
            out[k] = val.slice(0, limit) + `... [${val.length - limit} more chars]`;
          } else {
            out[k] = walk(val);
          }
        }
        return out;
      }
      return v;
    };
    return walk(obj);
  }

  // ------------------- High-level logging -------------------

  logGPTResponse(data) {
    try {
      const timestamp = new Date().toISOString();
      const userId = data.userId || 'unknown';
      const username = data.username || 'unknown';

      const promptPreview = this.safeTruncate(data.prompt, 500);
      const gptContent = this.extractGPTContent(data.gptResponse);
      const truncatedResponse = this.safeTruncate(gptContent, MAX_FILE_LINE);

      const isObj = typeof data.gptResponse === 'object' && data.gptResponse !== null;
      const metadata = isObj
        ? {
            model: data.gptResponse.model || 'unknown',
            tokenUsage: data.gptResponse.usage || null,
            finishReason: data.gptResponse.finish_reason || data.gptResponse.finishReason || null,
            fallback: !!data.gptResponse.fallback,
            error: !!data.gptResponse.error,
          }
        : { model: 'string_response' };

      const logEntry = {
        timestamp,
        userId,
        username,
        prompt: promptPreview,
        response: truncatedResponse,
        metadata,
        responseLength: gptContent.length,
        truncated: gptContent.length > MAX_FILE_LINE,
      };

      // RAW attachment (optional)
      if (RAW_MODE) {
        const redacted = isObj ? this.redactLargeStrings(data.gptResponse) : data.gptResponse;
        logEntry.raw = RAW_PRETTY ? redacted : redacted; // pretty is applied at write step
      }

      // Console summary
      console.log('[Logger] GPT Response:', {
        user: `${username} (${userId})`,
        model: metadata.model,
        promptLen: (typeof data.prompt === 'string' ? data.prompt.length : 0),
        responseLen: gptContent.length,
        tokens: metadata.tokenUsage?.total_tokens ?? metadata.tokenUsage?.total ?? 'unknown',
        fallback: metadata.fallback,
        raw: RAW_MODE ? 'on' : 'off',
      });

      this.writeLogEntry('gpt_responses', logEntry, { prettyRaw: RAW_PRETTY }).catch(err => {
        console.error('Failed to write GPT response log:', err);
      });

    } catch (error) {
      console.error('❌ Failed to log GPT response:', error);
      console.error('Data received (shape):', {
        isObject: typeof data?.gptResponse === 'object',
        isArray: Array.isArray(data?.gptResponse),
        keys: data?.gptResponse && typeof data.gptResponse === 'object'
          ? Object.keys(data.gptResponse)
          : 'N/A',
      });
    }
  }

  logConversation(data) {
    try {
      const timestamp = new Date().toISOString();
      const entry = {
        timestamp,
        userId: data.userId || 'unknown',
        username: data.username || 'unknown',
        messageType: data.messageType || 'text',
        prompt: this.safeTruncate(data.prompt, 1000),
        response: this.safeTruncate(data.gptResponse, 2000),
        metadata: {
          chatId: data.chatId,
          messageId: data.messageId,
          model:
            (typeof data.gptResponse === 'object' && data.gptResponse?.model) ||
            'string_response',
          processingTime: data.processingTime || null,
        },
      };

      if (RAW_MODE && data.gptResponse && typeof data.gptResponse === 'object') {
        entry.raw = this.redactLargeStrings(data.gptResponse);
      }

      this.writeLogEntry('conversations', entry, { prettyRaw: RAW_PRETTY }).catch(err => {
        console.error('Failed to write conversation log:', err);
      });
    } catch (error) {
      console.error('❌ Failed to log conversation:', error);
    }
  }

  logError(error, context = {}) {
    try {
      const timestamp = new Date().toISOString();
      const entry = {
        timestamp,
        type: 'error',
        error: {
          message: error?.message || String(error),
          stack: error?.stack || null,
          name: error?.name || 'Error',
        },
        context,
      };

      console.error('[Logger] Error logged:', entry.error.message, context);

      this.writeLogEntry('errors', entry).catch(err => {
        console.error('Failed to write error log:', err);
      });
    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }
  }

  logSystemHealth(healthData) {
    try {
      const timestamp = new Date().toISOString();
      const entry = {
        timestamp,
        type: 'system_health',
        health: healthData,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };

      this.writeLogEntry('system', entry).catch(err => {
        console.error('Failed to write system health log:', err);
      });
    } catch (error) {
      console.error('❌ Failed to log system health:', error);
    }
  }

  // ------------------- File writer -------------------

  async writeLogEntry(logType, entry, { prettyRaw = false } = {}) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `${logType}_${date}.jsonl`;
      const filepath = path.join(this.logDir, filename);

      // For JSONL, keep one JSON object per line; if RAW present and pretty requested,
      // only pretty-print the RAW, not the whole line.
      let out = entry;
      if (prettyRaw && entry.raw && typeof entry.raw === 'object') {
        out = { ...entry, raw: JSON.parse(JSON.stringify(entry.raw, null, 2)) };
      }

      await fs.appendFile(filepath, JSON.stringify(out) + '\n', 'utf8');
    } catch (error) {
      console.error(`Failed to write ${logType} log:`, error);
    }
  }

  // ------------------- Utilities -------------------

  safeStringify(obj, maxLength = 500) {
    try {
      if (typeof obj === 'string') {
        return obj.length > maxLength ? obj.substring(0, maxLength) + '...' : obj;
      }
      if (obj === null || obj === undefined) return String(obj);

      const str = JSON.stringify(
        obj,
        (key, value) => (typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value),
        2
      );
      return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    } catch (error) {
      return `[Stringify Error: ${error.message}]`;
    }
  }
}

// Singleton
const logger = new Logger();

module.exports = {
  Logger,
  // Wrappers
  logGPTResponse: (data) => logger.logGPTResponse(data),
  logConversation: (data) => logger.logConversation(data),
  logError: (error, context) => logger.logError(error, context),
  logSystemHealth: (healthData) => logger.logSystemHealth(healthData),
  // Utils
  extractGPTContent: (response) => logger.extractGPTContent(response),
  safeTruncate: (text, maxLength) => logger.safeTruncate(text, maxLength),
  safeStringify: (obj, maxLength) => logger.safeStringify(obj, maxLength),
};
