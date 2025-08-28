// utils/logger.js - Fixed for GPT-5 Client Response Format
// ----------------------------------------------------------------------------
// Fix for TypeError: message.substring is not a function
// The new GPT-5 client returns objects, not strings
// ----------------------------------------------------------------------------

'use strict';

const fs = require('fs').promises;
const path = require('path');

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

  // Helper function to safely extract string content from GPT response
  extractGPTContent(gptResponse) {
    if (!gptResponse) {
      return '[No response]';
    }

    // Handle string responses (legacy format)
    if (typeof gptResponse === 'string') {
      return gptResponse;
    }

    // Handle object responses (new GPT-5 client format)
    if (typeof gptResponse === 'object') {
      // New format: { content: "...", model: "...", usage: {...} }
      if (gptResponse.content && typeof gptResponse.content === 'string') {
        return gptResponse.content;
      }

      // Handle nested response formats
      if (gptResponse.response && typeof gptResponse.response === 'string') {
        return gptResponse.response;
      }

      // Handle message format
      if (gptResponse.message && typeof gptResponse.message === 'string') {
        return gptResponse.message;
      }

      // Handle text field
      if (gptResponse.text && typeof gptResponse.text === 'string') {
        return gptResponse.text;
      }

      // If it's an object but no recognizable content field, stringify it
      try {
        return JSON.stringify(gptResponse, null, 2);
      } catch (err) {
        return '[Invalid response object]';
      }
    }

    // Handle other types
    return String(gptResponse);
  }

  // Helper function to safely truncate strings
  safeTruncate(text, maxLength = 1000) {
    if (!text) return '[Empty]';
    
    const content = this.extractGPTContent(text);
    
    if (content.length <= maxLength) {
      return content;
    }
    
    return content.substring(0, maxLength) + '... (truncated)';
  }

  // Fixed logGPTResponse method
  logGPTResponse(data) {
    try {
      const timestamp = new Date().toISOString();
      const userId = data.userId || 'unknown';
      const username = data.username || 'unknown';
      
      // Safely extract GPT response content
      const gptContent = this.extractGPTContent(data.gptResponse);
      const truncatedResponse = this.safeTruncate(gptContent, 1000);
      
      // Extract additional metadata if available
      let metadata = {};
      if (typeof data.gptResponse === 'object' && data.gptResponse !== null) {
        metadata = {
          model: data.gptResponse.model || 'unknown',
          tokenUsage: data.gptResponse.usage || null,
          finishReason: data.gptResponse.finishReason || null,
          fallback: data.gptResponse.fallback || false,
          error: data.gptResponse.error || false
        };
      }

      const logEntry = {
        timestamp,
        userId,
        username,
        prompt: this.safeTruncate(data.prompt, 500),
        response: truncatedResponse,
        metadata,
        responseLength: gptContent.length,
        truncated: gptContent.length > 1000
      };

      console.log('[Logger] GPT Response:', {
        user: `${username} (${userId})`,
        model: metadata.model,
        promptLen: data.prompt?.length || 0,
        responseLen: gptContent.length,
        tokens: metadata.tokenUsage?.total_tokens || 'unknown',
        fallback: metadata.fallback
      });

      // Write to file asynchronously
      this.writeLogEntry('gpt_responses', logEntry).catch(err => {
        console.error('Failed to write GPT response log:', err);
      });

    } catch (error) {
      console.error('❌ Failed to log GPT response:', error);
      console.error('Data received:', {
        type: typeof data.gptResponse,
        isArray: Array.isArray(data.gptResponse),
        keys: data.gptResponse && typeof data.gptResponse === 'object' ? Object.keys(data.gptResponse) : 'N/A'
      });
    }
  }

  // Enhanced conversation logging
  logConversation(data) {
    try {
      const timestamp = new Date().toISOString();
      
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
          model: typeof data.gptResponse === 'object' ? data.gptResponse?.model : 'string_response',
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

  // Generic error logging
  logError(error, context = {}) {
    try {
      const timestamp = new Date().toISOString();
      
      const logEntry = {
        timestamp,
        error: {
          message: error.message || String(error),
          stack: error.stack || null,
          name: error.name || 'Error'
        },
        context,
        type: 'error'
      };

      console.error('[Logger] Error logged:', error.message, context);
      
      this.writeLogEntry('errors', logEntry).catch(err => {
        console.error('Failed to write error log:', err);
      });

    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }
  }

  // Write log entry to file
  async writeLogEntry(logType, entry) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `${logType}_${date}.jsonl`;
      const filepath = path.join(this.logDir, filename);
      
      const logLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(filepath, logLine, 'utf8');
      
    } catch (error) {
      console.error(`Failed to write ${logType} log:`, error);
    }
  }

  // System health logging
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

  // Safe string extraction for any logging context
  safeStringify(obj, maxLength = 500) {
    try {
      if (typeof obj === 'string') {
        return obj.length > maxLength ? obj.substring(0, maxLength) + '...' : obj;
      }
      
      if (obj === null || obj === undefined) {
        return String(obj);
      }
      
      const str = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'string' && value.length > 100) {
          return value.substring(0, 100) + '...';
        }
        return value;
      }, 2);
      
      return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
      
    } catch (error) {
      return `[Stringify Error: ${error.message}]`;
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Export both class and convenience functions
module.exports = {
  Logger,
  
  // Convenience functions that handle both old and new response formats
  logGPTResponse: (data) => logger.logGPTResponse(data),
  logConversation: (data) => logger.logConversation(data), 
  logError: (error, context) => logger.logError(error, context),
  logSystemHealth: (healthData) => logger.logSystemHealth(healthData),
  
  // Utility functions
  extractGPTContent: (response) => logger.extractGPTContent(response),
  safeTruncate: (text, maxLength) => logger.safeTruncate(text, maxLength),
  safeStringify: (obj, maxLength) => logger.safeStringify(obj, maxLength)
};
