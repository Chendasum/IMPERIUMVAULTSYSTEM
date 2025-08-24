// utils/logger.js - FIXED VERSION with User Interaction & GPT Response Logging
const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logsDir = path.join(__dirname, '..', 'logs');
        this.bot = null; // Will be set later to avoid circular dependency
        this.adminChatId = process.env.ADMIN_CHAT_ID;
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        try {
            if (!fs.existsSync(this.logsDir)) {
                fs.mkdirSync(this.logsDir, { recursive: true });
            }
        } catch (error) {
            console.error('Failed to create logs directory:', error);
        }
    }

    // Set bot instance after initialization (to avoid circular dependency)
    setBot(botInstance) {
        this.bot = botInstance;
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | Data: ${typeof data === 'object' ? JSON.stringify(data) : data}` : '';
        return `[${timestamp}] ${level}: ${message}${dataStr}`;
    }

    writeToFile(level, message, data = null) {
        try {
            const logEntry = this.formatMessage(level, message, data) + '\n';
            const today = new Date().toISOString().split('T')[0];
            const logFile = path.join(this.logsDir, `${level.toLowerCase()}-${today}.log`);
            
            fs.appendFileSync(logFile, logEntry);
            
            // Also write to general log
            const generalLogFile = path.join(this.logsDir, `system-${today}.log`);
            fs.appendFileSync(generalLogFile, logEntry);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    async sendToAdmin(message) {
        if (!this.bot || !this.adminChatId) {
            return; // Bot not available yet or no admin chat ID
        }

        try {
            await this.bot.sendMessage(this.adminChatId, message);
        } catch (error) {
            console.error('Failed to send admin notification:', error);
        }
    }

    info(message, data = null) {
        console.log(`ℹ️ ${message}`, data || '');
        this.writeToFile('INFO', message, data);
    }

    success(message, data = null) {
        console.log(`✅ ${message}`, data || '');
        this.writeToFile('SUCCESS', message, data);
    }

    warn(message, data = null) {
        console.warn(`⚠️ ${message}`, data || '');
        this.writeToFile('WARN', message, data);
    }

    error(message, error = null) {
        const errorDetails = error ? (error.stack || error.message || error) : '';
        console.error(`❌ ${message}`, errorDetails || '');
        this.writeToFile('ERROR', message, errorDetails);
        
        // Send critical errors to admin
        if (message.includes('CRITICAL') || message.includes('FATAL')) {
            this.sendToAdmin(`🚨 CRITICAL ERROR: ${message}`);
        }
    }

    debug(message, data = null) {
        console.log(`🐛 ${message}`, data || '');
        this.writeToFile('DEBUG', message, data);
    }

    // 📝 USER INTERACTION LOGGING (Missing function - ADDED)
    async logUserInteraction(data) {
        try {
            const logMessage = `User Interaction - Chat: ${data.chatId} | Message: "${data.userMessage?.substring(0, 100)}..." | Type: ${data.messageType} | Media: ${data.hasMedia || false}`;
            
            console.log(`👤 ${logMessage}`);
            this.writeToFile('USER_INTERACTION', logMessage, {
                chatId: data.chatId,
                messageId: data.messageId,
                messageType: data.messageType,
                hasMedia: data.hasMedia,
                mediaTypes: data.mediaTypes,
                timestamp: data.timestamp
            });

            // Write to specific user interactions log
            const today = new Date().toISOString().split('T')[0];
            const userLogFile = path.join(this.logsDir, `user-interactions-${today}.log`);
            const userLogEntry = `${data.timestamp} | ${data.chatId} | ${data.userMessage?.substring(0, 200) || 'No text'} | Media: ${JSON.stringify(data.mediaTypes || {})}\n`;
            fs.appendFileSync(userLogFile, userLogEntry);

        } catch (error) {
            console.error('❌ Failed to log user interaction:', error);
        }
    }

    // 🤖 GPT RESPONSE LOGGING (Missing function - ADDED)
    async logGPTResponse(data) {
        try {
            const logMessage = `GPT Response - Chat: ${data.chatId} | AI: ${data.aiUsed} | Model: ${data.modelUsed} | Time: ${data.responseTime}ms | Memory: ${data.memoryUsed}`;
            
            console.log(`🤖 ${logMessage}`);
            this.writeToFile('GPT_RESPONSE', logMessage, {
                chatId: data.chatId,
                aiUsed: data.aiUsed,
                modelUsed: data.modelUsed,
                responseTime: data.responseTime,
                memoryUsed: data.memoryUsed,
                powerMode: data.powerMode,
                telegramDelivered: data.telegramDelivered,
                gpt5OnlyMode: data.gpt5OnlyMode,
                webhookMode: data.webhookMode,
                multimodalType: data.multimodalType,
                hasTranscription: data.hasTranscription
            });

            // Write to specific GPT responses log
            const today = new Date().toISOString().split('T')[0];
            const gptLogFile = path.join(this.logsDir, `gpt-responses-${today}.log`);
            const gptLogEntry = `${new Date().toISOString()} | ${data.chatId} | ${data.aiUsed} | ${data.modelUsed} | ${data.responseTime}ms | ${data.gptResponse?.substring(0, 100)}...\n`;
            fs.appendFileSync(gptLogFile, gptLogEntry);

        } catch (error) {
            console.error('❌ Failed to log GPT response:', error);
        }
    }

    // 🚨 ERROR LOGGING (Enhanced)
    async logError(data) {
        try {
            const logMessage = `System Error - Chat: ${data.chatId} | Component: ${data.component} | Error: ${data.error}`;
            
            console.error(`🚨 ${logMessage}`);
            this.writeToFile('SYSTEM_ERROR', logMessage, {
                chatId: data.chatId,
                userMessage: data.userMessage,
                error: data.error,
                processingTime: data.processingTime,
                component: data.component,
                gpt5OnlyMode: data.gpt5OnlyMode,
                webhookMode: data.webhookMode,
                hasMedia: data.hasMedia
            });

            // Write to specific error log
            const today = new Date().toISOString().split('T')[0];
            const errorLogFile = path.join(this.logsDir, `system-errors-${today}.log`);
            const errorLogEntry = `${new Date().toISOString()} | ${data.chatId} | ${data.component} | ${data.error}\n`;
            fs.appendFileSync(errorLogFile, errorLogEntry);

            // Send critical errors to admin
            if (data.error.includes('CRITICAL') || data.error.includes('FATAL') || data.component === 'webhook_handler') {
                await this.sendToAdmin(`🚨 SYSTEM ERROR: ${data.error} (Component: ${data.component})`);
            }

        } catch (error) {
            console.error('❌ Failed to log system error:', error);
        }
    }

    // Get logs for API endpoint
    getLogs(type = 'info', date = null) {
        try {
            const targetDate = date || new Date().toISOString().split('T')[0];
            const logFile = path.join(this.logsDir, `${type.toLowerCase()}-${targetDate}.log`);
            
            if (fs.existsSync(logFile)) {
                const logs = fs.readFileSync(logFile, 'utf-8');
                return logs.split('\n').filter(line => line.trim()).slice(-50); // Last 50 lines
            }
            return [];
        } catch (error) {
            this.error('Failed to read log file', error);
            return [];
        }
    }

    // Get log summary
    getLogSummary(date = null) {
        try {
            const targetDate = date || new Date().toISOString().split('T')[0];
            const logTypes = ['info', 'success', 'warn', 'error', 'debug', 'user_interaction', 'gpt_response', 'system_error'];
            const summary = {};
            
            logTypes.forEach(type => {
                const logFile = path.join(this.logsDir, `${type}-${targetDate}.log`);
                if (fs.existsSync(logFile)) {
                    const content = fs.readFileSync(logFile, 'utf-8');
                    summary[type] = content.split('\n').filter(line => line.trim()).length;
                } else {
                    summary[type] = 0;
                }
            });
            
            return summary;
        } catch (error) {
            this.error('Failed to get log summary', error);
            return {};
        }
    }

    // 📊 Get conversation statistics
    getConversationStats(date = null) {
        try {
            const targetDate = date || new Date().toISOString().split('T')[0];
            const userLogFile = path.join(this.logsDir, `user-interactions-${targetDate}.log`);
            const gptLogFile = path.join(this.logsDir, `gpt-responses-${targetDate}.log`);
            
            let userInteractions = 0;
            let gptResponses = 0;
            let uniqueUsers = new Set();

            if (fs.existsSync(userLogFile)) {
                const userLogs = fs.readFileSync(userLogFile, 'utf-8');
                const userLines = userLogs.split('\n').filter(line => line.trim());
                userInteractions = userLines.length;
                
                // Count unique users
                userLines.forEach(line => {
                    const parts = line.split(' | ');
                    if (parts.length > 1) {
                        uniqueUsers.add(parts[1]); // chatId is second part
                    }
                });
            }

            if (fs.existsSync(gptLogFile)) {
                const gptLogs = fs.readFileSync(gptLogFile, 'utf-8');
                gptResponses = gptLogs.split('\n').filter(line => line.trim()).length;
            }

            return {
                date: targetDate,
                userInteractions,
                gptResponses,
                uniqueUsers: uniqueUsers.size,
                avgResponsesPerUser: uniqueUsers.size > 0 ? Math.round(gptResponses / uniqueUsers.size * 10) / 10 : 0
            };
            
        } catch (error) {
            this.error('Failed to get conversation stats', error);
            return {
                date: date || new Date().toISOString().split('T')[0],
                userInteractions: 0,
                gptResponses: 0,
                uniqueUsers: 0,
                avgResponsesPerUser: 0
            };
        }
    }
}

// Create singleton instance
const logger = new Logger();

// Export both the logger instance and individual methods
module.exports = {
    // 📝 MAIN LOGGING FUNCTIONS (Required by index.js)
    logUserInteraction: (data) => logger.logUserInteraction(data),
    logGPTResponse: (data) => logger.logGPTResponse(data),
    logError: (data) => logger.logError(data),
    
    // Individual methods for easy use
    logInfo: (message, data) => logger.info(message, data),
    logSuccess: (message, data) => logger.success(message, data),
    logWarning: (message, data) => logger.warn(message, data),
    logDebug: (message, data) => logger.debug(message, data),
    
    // Shorter aliases
    info: (message, data) => logger.info(message, data),
    success: (message, data) => logger.success(message, data),
    warn: (message, data) => logger.warn(message, data),
    error: (message, error) => logger.error(message, error),
    debug: (message, data) => logger.debug(message, data),
    
    // Utility methods
    setBot: (botInstance) => logger.setBot(botInstance),
    getLogs: (type, date) => logger.getLogs(type, date),
    getLogSummary: (date) => logger.getLogSummary(date),
    getConversationStats: (date) => logger.getConversationStats(date),
    
    // Export logger instance for advanced use
    logger
};
