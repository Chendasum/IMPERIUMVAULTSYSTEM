// utils/logger.js - GPT-5 Aware Logger (Responses API + Chat Completions)
// -----------------------------------------------------------------------------
// - Robust extractGPTContent for Responses API (output_text, output[].content[].text)
// - Supports Chat Completions (choices[0].message.content)
// - Compact one-line console summary (toggle verbose with LOGGER_VERBOSE=1)
// - Safe truncation & JSONL persistence without dumping entire raw responses
// -----------------------------------------------------------------------------

'use strict';

const fs = require('fs').promises;
const path = require('path');

class Logger {
  constructor(opts = {}) {
    this.logDir = path.join(process.cwd(), 'logs');
    this.verbose = opts.verbose ?? (process.env.LOGGER_VERBOSE === '1');
    // Fire-and-forget; safe if the dir already exists
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  // --- Core extractor: normalize any OpenAI response into human-readable text ---
  extractGPTContent(gptResponse) {
    if (!gptResponse) return '[No response]';

    // 0) Already a string (most callers should pass strings)
    if (typeof gptResponse === 'string') return gptResponse;

    // 1) Responses API (primary)
    // 1a) Single consolidated field
    if (typeof gptResponse === 'object' && typeof gptResponse.output_text === 'string') {
      return gptResponse.output_text;
    }

    // 1b) Fragmented content: output[].content[].text
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

    // 2) Chat Completions
    const chatMsg = gptResponse?.choices?.[0]?.message?.content;
    if (typeof chatMsg === 'string') return chatMsg;

    // 3) Common wrapper fields used by some integrators
    if (typeof gptResponse.content === 'string') return gptResponse.content;
    if (typeof gptResponse.response === 'string') return gptResponse.response;
    if (typeof gptResponse.message === 'string') return gptResponse.message;
    if (typeof gptResponse.text === 'string') return gptResponse.text;

    // 4) As a last resort, return a compact preview instead of full dump
    try {
      const minimal = {
        model: gptResponse.model,
        usage: gptResponse.usage,
        finish_reason: gptResponse.finish_reason || gptResponse.finishReason,
        note: 'Unrecognized response shape; full dump suppressed'
      };
      return JSON.stringify(minimal, null, 2);
    } catch {
      return '[Invalid response object]';
    }
  }

  // Safe truncation for any input (string or object)
  safeTruncate(value, maxLength = 1000) {
    const content = this.extractGPTContent(value);
    if (!content) return '[Empty]';
    return content.length <= maxLength ? content : content.substring(0, maxLength) + '... (truncated)';
  }

  // --- High-level logging helpers ------------------------------------------------

  logGPTResponse(data) {
    try {
      const timestamp = new Date().toISOString();
      const userId = data.userId || 'unknown';
      const username = data.username || 'unknown';

      // Normalize prompt & response
      const promptRaw = typeof data.prompt === 'string' ? data.prompt : '';
      const promptPreview = this.safeTruncate(promptRaw, 500);
      const gptContent = this.extractGPTContent(data.gptResponse);
      const truncatedResponse = this.safeTruncate(gptContent, 1000);

      // Safe metadata (don’t assume object shape)
      const isObj = typeof data.gptResponse === 'object' && data.gptResponse !== null;
      const tokenUsage = isObj ? (data.gptResponse.usage || null) : null;
      const finishReason = isObj ? (data.gptResponse.finish_reason || data.gptResponse.finishReason || null) : null;
      const model = isObj ? (data.gptResponse.model || 'unknown') : 'string_response';

      const logEntry = {
        timestamp,
        userId,
        username,
        prompt: promptPreview,
        response: truncatedResponse,
        metadata: {
          model,
          tokenUsage,
          finishReason,
          fallback: !!(isObj && data.gptResponse.fallback),
          error: !!(isObj && data.gptResponse.error)
        },
        responseLength: gptContent.length,
        truncated: gptContent.length > 1000
      };

      // Console summary (one-liner by default; object view if verbose)
      const tokenTotal =
        tokenUsage?.total_tokens ??
        tokenUsage?.total ??
        (typeof tokenUsage?.input_tokens === 'number' || typeof tokenUsage?.output_tokens === 'number'
          ? (tokenUsage.input_tokens || 0) + (tokenUsage.output_tokens || 0)
          : 'unknown');

      if (this.verbose) {
        console.log('[Logger] GPT Response:', {
          user: `${username} (${userId})`,
          model,
          promptLen: promptRaw.length,
          responseLen: gptContent.length,
          tokens: tokenTotal,
          finishReason,
          fallback: logEntry.metadata.fallback
        });
      } else {
        console.log(
          `[Logger] ${model} | prompt=${promptRaw.length} chars | response=${gptContent.length} chars | tokens=${tokenTotal}` +
          (finishReason ? ` | finish=${finishReason}` : '')
        );
      }

      // Persist asynchronously
      this.writeLogEntry('gpt_responses', logEntry).catch(err => {
        console.error('Failed to write GPT response log:', err);
      });

    } catch (error) {
      console.error('❌ Failed to log GPT response:', error);
      console.error('Data received (shape):', {
        isObject: typeof data?.gptResponse === 'object',
        isArray: Array.isArray(data?.gptResponse),
        keys: data?.gptResponse && typeof data.gptResponse === 'object'
          ? Object.keys(data.gptResponse)
          : 'N/A'
      });
    }
  }

  logConversation(data) {
    try {
      const timestamp = new Date().toISOString();
      const model =
        (typeof data.gptResponse === 'object' && data.gptResponse?.model) ||
        'string_response';

      const logEntry = {
        timestamp,
        userId: data.userId || 'unknown',
        username: data.username || 'unknown',
        messageType: data.messageType || 'text',
        prompt: this.safeTruncate(data.prompt, 1000),
        response: this.safeTruncate(data.gptResponse, 2000),
        metadata: {
          chatId: data.chatId,
          messageId: data.messageId,
          model,
          processingTime: data.processingTime || null
        }
      };

      this.writeLogEntry('conversations', logEntry).catch(err => {
        console.error('Failed to write conversation log:', err);
      });
    } catch (error) {
      console.error('❌ Failed to log conversation:', error);
    }
  }

  logError(error, context = {}) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        error: {
          message: error?.message || String(error),
          stack: error?.stack || null,
          name: error?.name || 'Error'
        },
        context,
        type: 'error'
      };

      if (this.verbose) {
        console.error('[Logger] Error logged:', logEntry.error.message, context);
      } else {
        console.error(`[Logger] Error: ${logEntry.error.message}`);
      }

      this.writeLogEntry('errors', logEntry).catch(err => {
        console.error('Failed to write error log:', err);
      });
    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }
  }

  logSystemHealth(healthData) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        type: 'system_health',
        health: healthData,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      };

      this.writeLogEntry('system', logEntry).catch(err => {
        console.error('Failed to write system health log:', err);
      });
    } catch (error) {
      console.error('❌ Failed to log system health:', error);
    }
  }

  // --- Low-level file writer -----------------------------------------------------
  async writeLogEntry(logType, entry) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `${logType}_${date}.jsonl`;
      const filepath = path.join(this.logDir, filename);
      await fs.appendFile(filepath, JSON.stringify(entry) + '\n', 'utf8');
    } catch (error) {
      console.error(`Failed to write ${logType} log:`, error);
    }
  }

  // --- Utility stringify with safety caps ---------------------------------------
  safeStringify(obj, maxLength = 500) {
    try {
      if (typeof obj === 'string') {
        return obj.length > maxLength ? obj.substring(0, maxLength) + '...' : obj;
      }
      if (obj === null || obj === undefined) return String(obj);

      const str = JSON.stringify(
        obj,
        (key, value) => {
          if (typeof value === 'string' && value.length > 100) {
            return value.substring(0, 100) + '...';
          }
          return value;
        },
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

  // Convenience wrappers
  logGPTResponse: (data) => logger.logGPTResponse(data),
  logConversation: (data) => logger.logConversation(data),
  logError: (error, context) => logger.logError(error, context),
  logSystemHealth: (healthData) => logger.logSystemHealth(healthData),

  // Utilities
  extractGPTContent: (response) => logger.extractGPTContent(response),
  safeTruncate: (text, maxLength) => logger.safeTruncate(text, maxLength),
  safeStringify: (obj, maxLength) => logger.safeStringify(obj, maxLength)
};
