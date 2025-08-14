// utils/logger.js - FIXED VERSION
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
            const logTypes = ['info', 'success', 'warn', 'error', 'debug'];
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
}

// Create singleton instance
const logger = new Logger();

// Export both the logger instance and individual methods
module.exports = {
    // Individual methods for easy use
    logInfo: (message, data) => logger.info(message, data),
    logSuccess: (message, data) => logger.success(message, data),
    logWarning: (message, data) => logger.warn(message, data),
    logError: (message, error) => logger.error(message, error),
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
    
    // Export logger instance for advanced use
    logger
};
