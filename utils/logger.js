// utils/logger.js - Fixed GPT-5 Response Extraction
'use strict';

const fs = require('fs').promises;
const path = require('path');

const RAW_MODE = process.env.LOGGER_RAW === '1';
const RAW_PRETTY = process.env.LOGGER_PRETTY === '1';
const MAX_FILE_LINE = 1000;
const MAX_CONSOLE_TEXT = 1000;

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

  // FIXED: Better GPT-5 response extraction
  extractGPTContent(gptResponse) {
    if (!gptResponse) return '[No response]';
    if (typeof gptResponse === 'string') return gptResponse;

    // GPT-5 Responses API: Check output_text first
    if (typeof gptResponse === 'object' && typeof gptResponse.output_text === 'string') {
      if (gptResponse.output_text.trim() === '') {
        // Empty response - check if this is an error condition
        if (gptResponse.usage?.output_tokens === 0) {
          return '[Empty response - 0 tokens generated]';
        }
        return '[Empty output_text field]';
      }
      return gptResponse.output_text;
    }

    // GPT-5 Responses API: Fallback to fragmented output
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

    // Chat Completions API
    const chatMsg = gptResponse?.choices?.[0]?.message?.content;
    if (typeof chatMsg === 'string') return chatMsg;

    // Common wrappers
    if (typeof gptResponse.content === 'string') return gptResponse.content;
    if (typeof gptResponse.response === 'string') return gptResponse.response;
    if (typeof gptResponse.message === 'string') return gptResponse.message;
    if (typeof gptResponse.text === 'string') return gptResponse.text;

    // Check for error conditions
    if (gptResponse?.usage?.output_tokens === 0) {
      const reason = gptResponse.finish_reason || 'unknown';
      return `[No content generated - finish_reason: ${reason}]`;
    }

    // Enhanced fallback with more details
    try {
      const minimal = {
        model: gptResponse.model,
        usage: gptResponse.usage,
        finish_reason: gptResponse.finish_reason || gptResponse.finishReason,
        has_output_text: 'output_text' in gptResponse,
        output_text_empty: gptResponse.output_text === '',
        has_output_array: Array.isArray(gptResponse.output),
        note: 'Unrecognized response shape - enable LOGGER_RAW=1 for full details',
      };
      return `[Complex response structure]\n${JSON.stringify(minimal, null, 2)}`;
    } catch {
      return '[Invalid response object]';
    }
  }

  // Enhanced truncation with better handling
  safeTruncate(value, maxLength = 1000) {
    const content = this.extractGPTContent(value);
    if (!content || content === '[No response]') return '[Empty]';
    
    // Don't truncate diagnostic messages
    if (content.startsWith('[') && content.endsWith(']')) {
      return content;
    }
    
    return content.length <= maxLength ? content : content.substring(0, maxLength) + '... (truncated)';
  }

  // Redact large strings for RAW logs
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

  // Main GPT response logger with enhanced diagnostics
  logGPTResponse(data) {
    try {
      const timestamp = new Date().toISOString();
      const userId = data.userId || 'unknown';
      const username = data.username || 'unknown';

      const promptPreview = this.safeTruncate(data.prompt, 500);
      const gptContent = this.extractGPTContent(data.gptResponse);
      const truncatedResponse = this.safeTruncate(gptContent, MAX_FILE_LINE);

      const isObj = typeof data.gptResponse === 'object' && data.gptResponse !== null;
      
      // Enhanced metadata with GPT-5 specific info
      const metadata = isObj
        ? {
            model: data.gptResponse.model || 'unknown',
            tokenUsage: data.gptResponse.usage || null,
            finishReason: data.gptResponse.finish_reason || data.gptResponse.finishReason || null,
            fallback: !!data.gptResponse.fallback,
            error: !!data.gptResponse.error,
            // GPT-5 specific diagnostics
            hasOutputText: 'output_text' in data.gptResponse,
            outputTextEmpty: data.gptResponse.output_text === '',
            hasOutputArray: Array.isArray(data.gptResponse.output),
            outputTokens: data.gptResponse.usage?.output_tokens || 0,
            reasoningTokens: data.gptResponse.usage?.output_tokens_details?.reasoning_tokens || 0
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

      // RAW attachment for debugging
      if (RAW_MODE) {
        const redacted = isObj ? this.redactLargeStrings(data.gptResponse) : data.gptResponse;
        logEntry.raw = redacted;
      }

      // Enhanced console output with diagnostics
      const diagnostics = {
        user: `${username} (${userId})`,
        model: metadata.model,
        promptLen: (typeof data.prompt === 'string' ? data.prompt.length : 0),
        responseLen: gptContent.length,
        tokens: metadata.tokenUsage?.total_tokens ?? 'unknown',
        outputTokens: metadata.outputTokens,
        reasoningTokens: metadata.reasoningTokens,
        fallback: metadata.fallback,
        empty: metadata.outputTextEmpty,
        raw: RAW_MODE ? 'on' : 'off',
      };

      console.log('[Logger] GPT Response:', diagnostics);

      // Flag potential issues
      if (metadata.outputTextEmpty && metadata.outputTokens === 0) {
        console.warn('[Logger] ⚠️ Empty GPT-5 response detected - check API configuration');
      }

      this.writeLogEntry('gpt_responses', logEntry, { prettyRaw: RAW_PRETTY }).catch(err => {
        console.error('Failed to write GPT response log:', err);
      });

    } catch (error) {
      console.error('❌ Failed to log GPT response:', error);
      console.error('Data received (shape):', {
        isObject: typeof data?.gptResponse === 'object',
        isArray: Array.isArray(data?.gptResponse),
        hasOutputText: data?.gptResponse && 'output_text' in data.gptResponse,
        outputTextValue: data?.gptResponse?.output_text,
        keys: data?.gptResponse && typeof data.gptResponse === 'object'
          ? Object.keys(data.gptResponse).slice(0, 10) // Limit key output
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
          model: (typeof data.gptResponse === 'object' && data.gptResponse?.model) || 'string_response',
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

  // File writer with better error handling
  async writeLogEntry(logType, entry, { prettyRaw = false } = {}) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `${logType}_${date}.jsonl`;
      const filepath = path.join(this.logDir, filename);

      let out = entry;
      if (prettyRaw && entry.raw && typeof entry.raw === 'object') {
        out = { ...entry, raw: JSON.parse(JSON.stringify(entry.raw, null, 2)) };
      }

      await fs.appendFile(filepath, JSON.stringify(out) + '\n', 'utf8');
    } catch (error) {
      console.error(`Failed to write ${logType} log:`, error);
    }
  }

  // Utilities
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

// Singleton instance
const logger = new Logger();

console.log('Enhanced Logger loaded with GPT-5 diagnostics');
console.log(`RAW mode: ${RAW_MODE ? 'ENABLED' : 'DISABLED'}`);
console.log(`Pretty RAW: ${RAW_PRETTY ? 'ENABLED' : 'DISABLED'}`);

module.exports = {
  Logger,
  // Wrapper functions
  logGPTResponse: (data) => logger.logGPTResponse(data),
  logConversation: (data) => logger.logConversation(data),
  logError: (error, context) => logger.logError(error, context),
  logSystemHealth: (healthData) => logger.logSystemHealth(healthData),
  // Utility functions
  extractGPTContent: (response) => logger.extractGPTContent(response),
  safeTruncate: (text, maxLength) => logger.safeTruncate(text, maxLength),
  safeStringify: (obj, maxLength) => logger.safeStringify(obj, maxLength),
};
