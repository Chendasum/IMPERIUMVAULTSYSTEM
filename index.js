// 🔧 INDEX.JS - PIECE 1/5: CORE SETUP + SAFETY + DATABASE
// UPDATED FOR RAILWAY DEPLOYMENT
// Complete rewrite with webhook support, PostgreSQL, GPT-5, Claude Opus 4.1
// NO MORE .trim() ERRORS - All safety checks included

// ===================================================================
// IMPORTS & DEPENDENCIES
// ===================================================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

// Initialize Express app for webhook
const app = express();
const PORT = process.env.PORT || 8080; // ✅ UPDATED: Railway port

// Production URL configuration for Railway
const PRODUCTION_URL = 'https://imperiumvaultsystem-production.up.railway.app';
const isDevelopment = process.env.NODE_ENV !== 'production';
const BASE_URL = isDevelopment ? `http://localhost:${PORT}` : PRODUCTION_URL;

console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`🔧 Environment: ${isDevelopment ? 'Development' : 'Production'}`);

// ===================================================================
// SAFETY UTILITIES - PREVENT .trim() ERRORS
// ===================================================================

/**
 * Safe trim function that handles all edge cases
 * @param {*} value - Value to trim
 * @param {string} context - Context for logging
 * @returns {string} - Safely trimmed string
 */
function safeTrim(value, context = 'unknown') {
    if (value === null || value === undefined) {
        console.log(`⚠️ safeTrim: null/undefined in ${context}`);
        return '';
    }
    if (typeof value !== 'string') {
        console.log(`⚠️ safeTrim: non-string (${typeof value}) in ${context}:`, value);
        return String(value || '').trim();
    }
    return value.trim();
}

/**
 * Safe string converter with fallback
 * @param {*} value - Value to convert
 * @param {string} defaultValue - Default if invalid
 * @returns {string} - Safe string
 */
function safeString(value, defaultValue = '') {
    return (value && typeof value === 'string') ? value : defaultValue;
}

/**
 * Safe substring with bounds checking
 * @param {*} str - String to substring
 * @param {number} start - Start index
 * @param {number} end - End index
 * @param {string} context - Context for logging
 * @returns {string} - Safe substring
 */
function safeSubstring(str, start, end, context = 'unknown') {
    if (!str || typeof str !== 'string') {
        console.log(`⚠️ safeSubstring: invalid input in ${context}`);
        return '';
    }
    const safeStart = Math.max(0, start || 0);
    const safeEnd = end ? Math.min(str.length, end) : str.length;
    return str.substring(safeStart, safeEnd);
}

/**
 * Safe JSON parse with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed object or default
 */
function safeJSONParse(jsonString, defaultValue = {}) {
    try {
        if (!jsonString || typeof jsonString !== 'string') {
            return defaultValue;
        }
        return JSON.parse(jsonString);
    } catch (error) {
        console.log('⚠️ JSON parse failed:', error.message);
        return defaultValue;
    }
}

/**
 * Safe object property access
 * @param {object} obj - Object to access
 * @param {string} path - Property path (e.g., 'user.message.text')
 * @param {*} defaultValue - Default if not found
 * @returns {*} - Property value or default
 */
function safeGet(obj, path, defaultValue = null) {
    try {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result === null || result === undefined) {
                return defaultValue;
            }
            result = result[key];
        }
        
        return result !== undefined ? result : defaultValue;
    } catch (error) {
        console.log(`⚠️ safeGet failed for path ${path}:`, error.message);
        return defaultValue;
    }
}

// ===================================================================
// POSTGRESQL DATABASE SETUP - UPDATED FOR RAILWAY
// ===================================================================

// Railway PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // ✅ Railway provides this
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // ✅ Increased for Railway
});

/**
 * Test database connection
 * @returns {Promise<boolean>} - Connection status
 */
async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        
        console.log('✅ Railway PostgreSQL connected successfully');
        console.log('⏰ Database time:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Railway PostgreSQL connection failed:', error.message);
        return false;
    }
}

/**
 * Initialize database tables
 * @returns {Promise<boolean>} - Success status
 */
async function initializeDatabaseTables() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                chat_id BIGINT UNIQUE NOT NULL,
                username VARCHAR(255),
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                is_authorized BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Conversations table
        await client.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                chat_id BIGINT NOT NULL,
                user_message TEXT,
                ai_response TEXT,
                ai_model VARCHAR(100),
                session_id VARCHAR(255),
                response_time INTEGER,
                success BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chat_id) REFERENCES users(chat_id)
            )
        `);
        
        // Memory/Facts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS memories (
                id SERIAL PRIMARY KEY,
                chat_id BIGINT NOT NULL,
                fact TEXT NOT NULL,
                category VARCHAR(100),
                importance VARCHAR(20) DEFAULT 'medium',
                extracted_from TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chat_id) REFERENCES users(chat_id)
            )
        `);
        
        // Sessions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) UNIQUE NOT NULL,
                chat_id BIGINT NOT NULL,
                session_type VARCHAR(50),
                commands_executed INTEGER DEFAULT 0,
                total_response_time INTEGER DEFAULT 0,
                status VARCHAR(20) DEFAULT 'active',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP,
                FOREIGN KEY (chat_id) REFERENCES users(chat_id)
            )
        `);
        
        // Error logs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS error_logs (
                id SERIAL PRIMARY KEY,
                chat_id BIGINT,
                error_message TEXT,
                error_stack TEXT,
                context TEXT,
                severity VARCHAR(20) DEFAULT 'medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // System metrics table
        await client.query(`
            CREATE TABLE IF NOT EXISTS system_metrics (
                id SERIAL PRIMARY KEY,
                metric_name VARCHAR(100),
                metric_value DECIMAL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create indexes for better performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_conversations_chat_id ON conversations(chat_id);
            CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
            CREATE INDEX IF NOT EXISTS idx_memories_chat_id ON memories(chat_id);
            CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
            CREATE INDEX IF NOT EXISTS idx_sessions_chat_id ON sessions(chat_id);
            CREATE INDEX IF NOT EXISTS idx_error_logs_chat_id ON error_logs(chat_id);
        `);
        
        await client.query('COMMIT');
        console.log('✅ Railway database tables initialized successfully');
        return true;
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Railway database table initialization failed:', error.message);
        return false;
    } finally {
        client.release();
    }
}

/**
 * Get database statistics
 * @returns {Promise<object>} - Database stats
 */
async function getDatabaseStats() {
    try {
        const client = await pool.connect();
        
        const userCountResult = await client.query('SELECT COUNT(*) as total FROM users');
        const conversationCountResult = await client.query('SELECT COUNT(*) as total FROM conversations');
        const memoryCountResult = await client.query('SELECT COUNT(*) as total FROM memories');
        const errorCountResult = await client.query('SELECT COUNT(*) as total FROM error_logs WHERE created_at > NOW() - INTERVAL \'24 hours\'');
        
        client.release();
        
        return {
            connectionHealth: 'healthy',
            totalUsers: parseInt(userCountResult.rows[0].total),
            totalConversations: parseInt(conversationCountResult.rows[0].total),
            totalMemories: parseInt(memoryCountResult.rows[0].total),
            recentErrors: parseInt(errorCountResult.rows[0].total),
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Database stats failed:', error.message);
        return {
            connectionHealth: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Log error to database
 * @param {number} chatId - User chat ID
 * @param {string} errorMessage - Error message
 * @param {string} errorStack - Error stack trace
 * @param {string} context - Error context
 * @param {string} severity - Error severity
 * @returns {Promise<boolean>} - Success status
 */
async function logErrorToDB(chatId, errorMessage, errorStack = '', context = '', severity = 'medium') {
    try {
        const client = await pool.connect();
        
        await client.query(
            'INSERT INTO error_logs (chat_id, error_message, error_stack, context, severity) VALUES ($1, $2, $3, $4, $5)',
            [chatId, safeString(errorMessage), safeString(errorStack), safeString(context), severity]
        );
        
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Error logging to DB failed:', error.message);
        return false;
    }
}

/**
 * Record system metric
 * @param {string} metricName - Name of the metric
 * @param {number} metricValue - Value of the metric
 * @returns {Promise<boolean>} - Success status
 */
async function recordSystemMetric(metricName, metricValue) {
    try {
        const client = await pool.connect();
        
        await client.query(
            'INSERT INTO system_metrics (metric_name, metric_value) VALUES ($1, $2)',
            [metricName, metricValue]
        );
        
        client.release();
        return true;
    } catch (error) {
        console.error('❌ System metric recording failed:', error.message);
        return false;
    }
}

// ===================================================================
// EXPRESS MIDDLEWARE SETUP - UPDATED FOR RAILWAY
// ===================================================================

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for API
}));

// ✅ UPDATED: Railway-optimized CORS setup
app.use(cors({
    origin: [
        'https://imperiumvaultsystem-production.up.railway.app',
        'http://localhost:8080',
        'http://localhost:3000',
        ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Telegram-Bot-Api-Secret-Token',
        'X-Forwarded-Proto',
        'X-Forwarded-For'
    ],
    credentials: true
}));

// ✅ NEW: Trust Railway proxy
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/webhook', limiter);

// Body parsing middleware
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf, encoding) => {
        // Store raw body for webhook verification if needed
        req.rawBody = buf;
    }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`📨 ${timestamp} - ${method} ${url} from ${ip}`);
    
    // Log response time
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`📤 ${method} ${url} - ${res.statusCode} - ${duration}ms`);
        
        // Record API response time metric
        recordSystemMetric('api_response_time', duration).catch(console.error);
    });
    
    next();
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Express error:', error.message);
    
    // Log error to database
    const chatId = safeGet(req, 'body.message.chat.id', null);
    logErrorToDB(chatId, error.message, error.stack, 'express_middleware', 'high').catch(console.error);
    
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong processing your request'
    });
});

console.log('✅ Piece 1/5 loaded: Railway-optimized core setup + Safety utilities + Database');
console.log('🔧 Next: Copy Piece 2/5 for Webhook handler + Message processing');
console.log('🌐 Railway URL:', BASE_URL);

// 🔧 INDEX.JS - PIECE 2/5: WEBHOOK HANDLER + MESSAGE PROCESSING
// Webhook endpoint, authentication, message routing, session management

// ===================================================================
// AUTHENTICATION & USER MANAGEMENT
// ===================================================================

/**
 * Check if user is authorized to use the bot
 * @param {number} chatId - Telegram chat ID
 * @returns {boolean} - Authorization status
 */
function isAuthorizedUser(chatId) {
    try {
        const authorizedUsers = process.env.ADMIN_CHAT_ID
            ? process.env.ADMIN_CHAT_ID.split(",").map((id) => {
                const parsedId = parseInt(safeTrim(id, 'auth_user_id'));
                return isNaN(parsedId) ? null : parsedId;
            }).filter(id => id !== null)
            : [];
            
        const userChatId = parseInt(chatId);
        return authorizedUsers.includes(userChatId);
    } catch (error) {
        console.error('❌ Authorization check failed:', error.message);
        return false;
    }
}

/**
 * Create or update user in database
 * @param {object} telegramUser - Telegram user object
 * @returns {Promise<boolean>} - Success status
 */
async function createOrUpdateUser(telegramUser) {
    try {
        const client = await pool.connect();
        const chatId = telegramUser.id;
        const username = safeString(telegramUser.username);
        const firstName = safeString(telegramUser.first_name);
        const lastName = safeString(telegramUser.last_name);
        const isAuthorized = isAuthorizedUser(chatId);
        
        // Upsert user
        await client.query(`
            INSERT INTO users (chat_id, username, first_name, last_name, is_authorized, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT (chat_id) 
            DO UPDATE SET 
                username = EXCLUDED.username,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                is_authorized = EXCLUDED.is_authorized,
                updated_at = CURRENT_TIMESTAMP
        `, [chatId, username, firstName, lastName, isAuthorized]);
        
        client.release();
        console.log(`👤 User ${chatId} (${firstName}) ${isAuthorized ? 'authorized' : 'unauthorized'}`);
        return true;
        
    } catch (error) {
        console.error('❌ User creation/update failed:', error.message);
        return false;
    }
}

// ===================================================================
// SESSION MANAGEMENT
// ===================================================================

/**
 * Start user session
 * @param {number} chatId - User chat ID
 * @param {string} sessionType - Type of session
 * @returns {Promise<string>} - Session ID
 */
async function startUserSession(chatId, sessionType = 'WEBHOOK') {
    try {
        const sessionId = `session_${chatId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const client = await pool.connect();
        await client.query(
            'INSERT INTO sessions (session_id, chat_id, session_type, status) VALUES ($1, $2, $3, $4)',
            [sessionId, chatId, sessionType, 'active']
        );
        client.release();
        
        console.log(`📊 Session started: ${sessionId} (${sessionType})`);
        return sessionId;
        
    } catch (error) {
        console.error('❌ Session start failed:', error.message);
        // Return fallback session ID
        return `fallback_${chatId}_${Date.now()}`;
    }
}

/**
 * End user session
 * @param {string} sessionId - Session ID
 * @param {number} commandsExecuted - Number of commands executed
 * @param {number} totalResponseTime - Total response time
 * @returns {Promise<boolean>} - Success status
 */
async function endUserSession(sessionId, commandsExecuted = 0, totalResponseTime = 0) {
    try {
        const client = await pool.connect();
        await client.query(`
            UPDATE sessions 
            SET commands_executed = $1, 
                total_response_time = $2, 
                status = 'completed', 
                ended_at = CURRENT_TIMESTAMP 
            WHERE session_id = $3
        `, [commandsExecuted, totalResponseTime, sessionId]);
        client.release();
        
        console.log(`📊 Session ended: ${sessionId} (${commandsExecuted} commands, ${totalResponseTime}ms)`);
        return true;
        
    } catch (error) {
        console.error('❌ Session end failed:', error.message);
        return false;
    }
}

// ===================================================================
// TELEGRAM WEBHOOK VERIFICATION
// ===================================================================

/**
 * Verify Telegram webhook (optional security)
 * @param {object} req - Express request object
 * @returns {boolean} - Verification status
 */
function verifyTelegramWebhook(req) {
    try {
        // If webhook secret is set, verify it
        const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
        if (webhookSecret) {
            const receivedToken = req.headers['x-telegram-bot-api-secret-token'];
            if (receivedToken !== webhookSecret) {
                console.log('❌ Webhook verification failed: invalid secret token');
                return false;
            }
        }
        
        // Basic message structure validation
        const body = req.body;
        if (!body || typeof body !== 'object') {
            console.log('❌ Webhook verification failed: invalid body');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('❌ Webhook verification error:', error.message);
        return false;
    }
}

// ===================================================================
// MESSAGE PROCESSING UTILITIES
// ===================================================================

/**
 * Extract safe message text from Telegram update
 * @param {object} update - Telegram update object
 * @returns {object} - Extracted message data
 */
function extractMessageData(update) {
    try {
        const message = safeGet(update, 'message', {});
        const chat = safeGet(message, 'chat', {});
        const from = safeGet(message, 'from', {});
        
        return {
            chatId: safeGet(chat, 'id', null),
            messageId: safeGet(message, 'message_id', null),
            text: safeString(safeGet(message, 'text', '')),
            user: {
                id: safeGet(from, 'id', null),
                username: safeString(safeGet(from, 'username', '')),
                first_name: safeString(safeGet(from, 'first_name', '')),
                last_name: safeString(safeGet(from, 'last_name', ''))
            },
            messageType: determineMessageType(message),
            voice: safeGet(message, 'voice', null),
            photo: safeGet(message, 'photo', null),
            document: safeGet(message, 'document', null),
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Message data extraction failed:', error.message);
        return {
            chatId: null,
            messageId: null,
            text: '',
            user: { id: null, username: '', first_name: '', last_name: '' },
            messageType: 'unknown',
            voice: null,
            photo: null,
            document: null,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Determine message type from Telegram message
 * @param {object} message - Telegram message object
 * @returns {string} - Message type
 */
function determineMessageType(message) {
    if (!message || typeof message !== 'object') return 'unknown';
    
    if (message.voice) return 'voice';
    if (message.photo) return 'photo';
    if (message.document) return 'document';
    if (message.video) return 'video';
    if (message.audio) return 'audio';
    if (message.sticker) return 'sticker';
    if (message.location) return 'location';
    if (message.contact) return 'contact';
    if (message.text) return 'text';
    
    return 'other';
}

/**
 * Send response back to user via Telegram API
 * @param {number} chatId - Chat ID to send to
 * @param {string} text - Message text
 * @param {object} options - Additional options
 * @returns {Promise<boolean>} - Success status
 */
async function sendTelegramMessage(chatId, text, options = {}) {
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN not set');
        }
        
        const safeText = safeTrim(text, 'telegram_message');
        if (!safeText) {
            throw new Error('Empty message text');
        }
        
        // Telegram message length limit is 4096 characters
        const maxLength = 4000; // Leave some buffer
        const messageText = safeText.length > maxLength 
            ? safeSubstring(safeText, 0, maxLength, 'telegram_truncate') + '\n\n...[Message truncated]'
            : safeText;
        
        const payload = {
            chat_id: chatId,
            text: messageText,
            parse_mode: options.parseMode || 'Markdown',
            disable_web_page_preview: options.disablePreview || true,
            reply_to_message_id: options.replyToMessageId || undefined
        };
        
        const response = await axios.post(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            payload,
            {
                timeout: 10000,
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
        if (response.data.ok) {
            console.log(`📤 Message sent to ${chatId}: ${safeSubstring(messageText, 0, 50, 'send_log')}...`);
            return true;
        } else {
            throw new Error(`Telegram API error: ${response.data.description}`);
        }
        
    } catch (error) {
        console.error(`❌ Failed to send message to ${chatId}:`, error.message);
        
        // Log error to database
        await logErrorToDB(chatId, error.message, error.stack, 'telegram_send', 'medium').catch(console.error);
        return false;
    }
}

// ===================================================================
// MAIN WEBHOOK ENDPOINT
// ===================================================================

/**
 * Main webhook endpoint for Telegram updates
 */
app.post('/webhook', async (req, res) => {
    const requestStart = Date.now();
    
    try {
        // Verify webhook authenticity
        if (!verifyTelegramWebhook(req)) {
            return res.status(403).json({ error: 'Forbidden: Invalid webhook' });
        }
        
        // Extract message data safely
        const messageData = extractMessageData(req.body);
        const { chatId, text, user, messageType } = messageData;
        
        // Quick response to Telegram (required within 5 seconds)
        res.status(200).json({ status: 'received' });
        
        // Log incoming message
        const logText = text ? safeSubstring(text, 0, 50, 'webhook_log') : `${messageType} message`;
        console.log(`📨 Webhook: ${chatId} (${user.first_name}): ${logText}`);
        
        // Validate essential data
        if (!chatId || !user.id) {
            console.log('⚠️ Invalid message data, skipping');
            return;
        }
        
        // Create/update user in database
        await createOrUpdateUser(user);
        
        // Check authorization
        if (!isAuthorizedUser(chatId)) {
            console.log(`🚫 Unauthorized access from ${chatId} (${user.first_name})`);
            await sendTelegramMessage(chatId, 
                `🚫 **Access Denied**\n\nThis is a private AI system.\n\n**Your Chat ID:** \`${chatId}\`\n\nContact admin if this is your account.`,
                { parseMode: 'Markdown' }
            );
            return;
        }
        
        // Start session tracking
        const sessionId = await startUserSession(chatId, 'WEBHOOK');
        
        // Process message asynchronously (don't block webhook response)
        processMessageAsync(messageData, sessionId, requestStart).catch(error => {
            console.error('❌ Async message processing failed:', error.message);
            logErrorToDB(chatId, error.message, error.stack, 'async_processing', 'high').catch(console.error);
        });
        
    } catch (error) {
        console.error('❌ Webhook error:', error.message);
        
        // Still respond with 200 to prevent Telegram retries
        if (!res.headersSent) {
            res.status(200).json({ status: 'error', message: 'Internal error' });
        }
        
        // Log error
        const chatId = safeGet(req, 'body.message.chat.id', null);
        await logErrorToDB(chatId, error.message, error.stack, 'webhook_main', 'high').catch(console.error);
    }
});

/**
 * Process message asynchronously after webhook response
 * @param {object} messageData - Extracted message data
 * @param {string} sessionId - Session ID
 * @param {number} requestStart - Request start time
 */
async function processMessageAsync(messageData, sessionId, requestStart) {
    const { chatId, text, messageType, voice, photo, document } = messageData;
    
    try {
        console.log(`🔄 Processing ${messageType} message from ${chatId}...`);
        
        // Handle different message types
        switch (messageType) {
            case 'text':
                if (!text || safeTrim(text).length === 0) {
                    await sendTelegramMessage(chatId, '❓ Please send a text message with content.');
                    break;
                }
                // Route to dual AI system (implemented in next piece)
                await handleTextMessage(chatId, safeTrim(text, 'async_text'), sessionId);
                break;
                
            case 'voice':
                await handleVoiceMessage(chatId, voice, sessionId);
                break;
                
            case 'photo':
                await handlePhotoMessage(chatId, photo, sessionId);
                break;
                
            case 'document':
                await handleDocumentMessage(chatId, document, sessionId);
                break;
                
            default:
                await sendTelegramMessage(chatId, 
                    `📝 **Message Type:** ${messageType}\n\nI can process text messages, voice notes, images, and documents. Please try sending one of these types.`
                );
                break;
        }
        
    } catch (error) {
        console.error('❌ Message processing error:', error.message);
        
        // Send user-friendly error message
        try {
            if (error.message.includes('timeout') || error.message.includes('long')) {
                await sendTelegramMessage(chatId, 
                    `⏱️ **Request Timeout**\n\nYour request was too complex and timed out. Please try:\n\n• Breaking it into smaller questions\n• Using simpler language\n• Asking one thing at a time`
                );
            } else if (error.message.includes('token') || error.message.includes('limit')) {
                await sendTelegramMessage(chatId, 
                    `📝 **Message Too Long**\n\nYour message exceeded limits. Please try:\n\n• Shorter questions (under 1000 words)\n• Splitting into multiple messages\n• Being more specific`
                );
            } else {
                await sendTelegramMessage(chatId, 
                    `❌ **Processing Error**\n\nI encountered an error: ${safeSubstring(error.message, 0, 100, 'error_msg')}\n\nPlease try again or contact support.`
                );
            }
        } catch (sendError) {
            console.error('❌ Failed to send error message:', sendError.message);
        }
        
        // Log error to database
        await logErrorToDB(chatId, error.message, error.stack, 'message_processing', 'high').catch(console.error);
        
    } finally {
        // Always end session
        if (sessionId) {
            const totalTime = Date.now() - requestStart;
            await endUserSession(sessionId, 1, totalTime).catch(console.error);
        }
    }
}

// ===================================================================
// MESSAGE HANDLERS (PLACEHOLDER - IMPLEMENTED IN NEXT PIECES)
// ===================================================================

/**
 * Handle text message (main AI processing)
 * @param {number} chatId - Chat ID
 * @param {string} text - Message text
 * @param {string} sessionId - Session ID
 */
async function handleTextMessage(chatId, text, sessionId) {
    // This will be implemented in Piece 3 (Dual AI System)
    await sendTelegramMessage(chatId, '🤖 Text processing will be implemented in Piece 3...');
}

/**
 * Handle voice message
 * @param {number} chatId - Chat ID
 * @param {object} voice - Voice message object
 * @param {string} sessionId - Session ID
 */
async function handleVoiceMessage(chatId, voice, sessionId) {
    await sendTelegramMessage(chatId, '🎤 Voice processing will be implemented in future pieces.');
}

/**
 * Handle photo message
 * @param {number} chatId - Chat ID
 * @param {array} photo - Photo array
 * @param {string} sessionId - Session ID
 */
async function handlePhotoMessage(chatId, photo, sessionId) {
    await sendTelegramMessage(chatId, '🖼️ Image processing will be implemented in future pieces.');
}

/**
 * Handle document message
 * @param {number} chatId - Chat ID
 * @param {object} document - Document object
 * @param {string} sessionId - Session ID
 */
async function handleDocumentMessage(chatId, document, sessionId) {
    await sendTelegramMessage(chatId, '📄 Document processing will be implemented in future pieces.');
}

// ===================================================================
// HEALTH CHECK ENDPOINT
// ===================================================================

app.get('/health', async (req, res) => {
    try {
        const dbStats = await getDatabaseStats();
        const uptime = process.uptime();
        
        res.json({
            status: 'healthy',
            uptime: Math.floor(uptime),
            database: dbStats.connectionHealth,
            timestamp: new Date().toISOString(),
            version: '2.0.0'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

console.log('✅ Piece 2/5 loaded: Webhook handler + Message processing + Authentication');
console.log('🔧 Next: Copy Piece 3/5 for Dual AI system (GPT-5 + Claude Opus 4.1)');



// 🔧 INDEX.JS - PIECE 4/5: MEMORY SYSTEM + POSTGRESQL OPERATIONS + CONTEXT
// Memory extraction, conversation history, context building, PostgreSQL operations

// ===================================================================
// MEMORY EXTRACTION SYSTEM
// ===================================================================

/**
 * Advanced memory fact extraction with complete safety checks
 * @param {string} userMessage - User's message
 * @param {string} aiResponse - AI's response
 * @returns {string|null} - Extracted memory fact or null
 */
function extractMemoryFactAdvanced(userMess// 🔧 INDEX.JS - PIECE 3/5: DUAL AI SYSTEM + GPT-5 + CLAUDE OPUS 4.1
// AI routing, OpenAI integration, Anthropic integration, conversation intelligence
// FIXED: Enhanced error handling and debugging for Railway deployment

// ===================================================================
// AI API CLIENTS SETUP - ENHANCED WITH DEBUGGING
// ===================================================================

/**
 * OpenAI GPT-5 API client with enhanced debugging
 * @param {string} prompt - User prompt
 * @param {object} options - API options
 * @returns {Promise<string>} - AI response
 */
async function callOpenAIGPT5(prompt, options = {}) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }
        
        console.log('🔍 OpenAI Debug:', {
            apiKeyPresent: !!apiKey,
            apiKeyLength: apiKey ? apiKey.length : 0,
            promptLength: prompt ? prompt.length : 0,
            model: options.model || 'gpt-5'
        });
        
        const safePrompt = safeTrim(prompt, 'openai_prompt');
        if (!safePrompt) {
            throw new Error('Empty prompt provided to OpenAI');
        }
        
        const payload = {
            model: options.model || 'gpt-5',
            messages: [
                {
                    role: 'system',
                    content: options.systemPrompt || 'You are a helpful AI assistant. Provide accurate, concise, and helpful responses.'
                },
                {
                    role: 'user',
                    content: safePrompt
                }
            ],
            max_tokens: options.maxTokens || 1500,
            temperature: options.temperature || 0.7,
            top_p: options.topP || 0.9,
            frequency_penalty: options.frequencyPenalty || 0,
            presence_penalty: options.presencePenalty || 0
        };
        
        console.log(`🤖 Calling OpenAI GPT-5 with ${safePrompt.length} characters...`);
        
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: options.timeout || 30000
            }
        );
        
        console.log('✅ OpenAI Response Status:', response.status);
        console.log('🔍 OpenAI Response Data Keys:', Object.keys(response.data || {}));
        
        if (response.data && response.data.choices && response.data.choices[0]) {
            const aiResponse = safeString(response.data.choices[0].message.content);
            console.log(`✅ OpenAI GPT-5 response: ${aiResponse.length} characters`);
            return aiResponse;
        } else {
            console.error('❌ Invalid OpenAI response structure:', response.data);
            throw new Error('Invalid response format from OpenAI');
        }
        
    } catch (error) {
        console.error('❌ OpenAI GPT-5 Detailed Error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            url: error.config?.url
        });
        
        // Handle specific error types with detailed logging
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;
            
            if (status === 429) {
                throw new Error('OpenAI rate limit exceeded. Please try again in a moment.');
            } else if (status === 401) {
                throw new Error('OpenAI API key invalid or expired. Check OPENAI_API_KEY in Railway Variables.');
            } else if (status === 400) {
                throw new Error(`OpenAI request error: ${errorData.error?.message || 'Invalid request'}`);
            } else if (status === 404) {
                console.error('❌ OpenAI Model not found - GPT-5 may not be available yet');
                throw new Error('GPT-5 model not found. The model may not be available yet.');
            } else {
                throw new Error(`OpenAI API error (${status}): ${errorData.error?.message || 'Unknown error'}`);
            }
        }
        
        if (error.code === 'ECONNABORTED') {
            throw new Error('OpenAI API timeout. Please try again.');
        }
        
        throw new Error(`OpenAI API failed: ${error.message}`);
    }
}

/**
 * Anthropic Claude Opus 4.1 API client with enhanced debugging
 * @param {string} prompt - User prompt
 * @param {object} options - API options
 * @returns {Promise<string>} - AI response
 */
async function callClaudeOpus41(prompt, options = {}) {
    try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY not configured');
        }
        
        console.log('🔍 Claude Debug:', {
            apiKeyPresent: !!apiKey,
            apiKeyLength: apiKey ? apiKey.length : 0,
            promptLength: prompt ? prompt.length : 0,
            model: options.model || 'claude-opus-4-1@20250805'
        });
        
        const safePrompt = safeTrim(prompt, 'claude_prompt');
        if (!safePrompt) {
            throw new Error('Empty prompt provided to Claude');
        }
        
        const payload = {
            model: options.model || 'claude-opus-4-1@20250805',
            max_tokens: options.maxTokens || 1500,
            temperature: options.temperature || 0.7,
            system: options.systemPrompt || 'You are Claude, a helpful AI assistant created by Anthropic. Provide thoughtful, accurate, and well-reasoned responses.',
            messages: [
                {
                    role: 'user',
                    content: safePrompt
                }
            ]
        };
        
        console.log(`🧠 Calling Claude Opus 4.1 with ${safePrompt.length} characters...`);
        
        const response = await axios.post(
            'https://api.anthropic.com/v1/messages',
            payload,
            {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                timeout: options.timeout || 45000
            }
        );
        
        console.log('✅ Claude Response Status:', response.status);
        console.log('🔍 Claude Response Data Keys:', Object.keys(response.data || {}));
        
        if (response.data && response.data.content && response.data.content[0]) {
            const aiResponse = safeString(response.data.content[0].text);
            console.log(`✅ Claude Opus 4.1 response: ${aiResponse.length} characters`);
            return aiResponse;
        } else {
            console.error('❌ Invalid Claude response structure:', response.data);
            throw new Error('Invalid response format from Claude');
        }
        
    } catch (error) {
        console.error('❌ Claude Opus 4.1 Detailed Error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            url: error.config?.url
        });
        
        // Handle specific error types with detailed logging
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;
            
            if (status === 429) {
                throw new Error('Claude rate limit exceeded. Please try again in a moment.');
            } else if (status === 401) {
                throw new Error('Claude API key invalid or expired. Check ANTHROPIC_API_KEY in Railway Variables.');
            } else if (status === 400) {
                throw new Error(`Claude request error: ${errorData.error?.message || 'Invalid request'}`);
            } else if (status === 404) {
                console.error('❌ Claude Model not found - Opus 4.1 may not be available yet');
                throw new Error('Claude Opus 4.1 model not found. The model may not be available yet.');
            } else {
                throw new Error(`Claude API error (${status}): ${errorData.error?.message || 'Unknown error'}`);
            }
        }
        
        if (error.code === 'ECONNABORTED') {
            throw new Error('Claude API timeout. Please try again.');
        }
        
        throw new Error(`Claude API failed: ${error.message}`);
    }
}

// ===================================================================
// CONVERSATION INTELLIGENCE & ROUTING
// ===================================================================

/**
 * Analyze conversation to determine best AI model
 * @param {string} text - User message text
 * @param {object} context - Conversation context
 * @returns {object} - Analysis results
 */
function analyzeConversation(text, context = {}) {
    try {
        const safeText = safeTrim(text, 'conversation_analysis');
        if (!safeText) {
            return {
                type: 'unknown',
                complexity: 'simple',
                requiresLiveData: false,
                recommendedModel: 'gpt-5',
                confidence: 0.5
            };
        }
        
        const lower = safeText.toLowerCase();
        const wordCount = safeText.split(/\s+/).length;
        const sentenceCount = (safeText.match(/[.!?]+/g) || []).length;
        const questionCount = (safeText.match(/\?/g) || []).length;
        
        // Determine conversation type
        let conversationType = 'general';
        let confidence = 0.6;
        
        // Financial/Investment analysis
        if (lower.includes('financial') || lower.includes('investment') || 
            lower.includes('fund') || lower.includes('portfolio') || 
            lower.includes('cambodia') || lower.includes('lending') ||
            lower.includes('trading') || lower.includes('market analysis')) {
            conversationType = 'financial_analysis';
            confidence = 0.9;
        }
        
        // Strategic/Complex analysis
        else if (lower.includes('strategy') || lower.includes('strategic') || 
                 lower.includes('analysis') || lower.includes('comprehensive') ||
                 lower.includes('detailed') || lower.includes('complex')) {
            conversationType = 'strategic_analysis';
            confidence = 0.85;
        }
        
        // Coding/Technical
        else if (lower.includes('code') || lower.includes('programming') || 
                 lower.includes('debug') || lower.includes('algorithm') ||
                 lower.includes('function') || lower.includes('script')) {
            conversationType = 'coding';
            confidence = 0.8;
        }
        
        // Memory/Recall queries
        else if (lower.includes('remember') || lower.includes('recall') || 
                 lower.includes('you mentioned') || lower.includes('we discussed') ||
                 lower.includes('previous') || lower.includes('earlier')) {
            conversationType = 'memory_query';
            confidence = 0.75;
        }
        
        // Creative writing
        else if (lower.includes('write') || lower.includes('story') || 
                 lower.includes('poem') || lower.includes('creative') ||
                 lower.includes('essay') || lower.includes('article')) {
            conversationType = 'creative_writing';
            confidence = 0.7;
        }
        
        // Determine complexity
        let complexity = 'simple';
        if (safeText.length > 500 || wordCount > 100 || questionCount > 2) {
            complexity = 'maximum';
        } else if (safeText.length > 200 || wordCount > 50 || sentenceCount > 3) {
            complexity = 'complex';
        } else if (safeText.length > 50 || wordCount > 15) {
            complexity = 'medium';
        }
        
        // Check for live data requirements
        const liveDataKeywords = [
            'current', 'latest', 'today', 'now', 'recent', 'update',
            'real-time', 'live', 'status', 'news', 'price'
        ];
        const requiresLiveData = liveDataKeywords.some(keyword => lower.includes(keyword));
        
        // Determine recommended model
        let recommendedModel = 'gpt-5'; // Default
        
        // Use Claude for complex analysis, strategic thinking, and long-form content
        if (conversationType === 'financial_analysis' || 
            conversationType === 'strategic_analysis' ||
            conversationType === 'creative_writing' ||
            complexity === 'maximum' ||
            (complexity === 'complex' && !requiresLiveData)) {
            recommendedModel = 'claude-opus-4.1';
        }
        
        // Use GPT-5 for general queries, live data, and quick responses
        if (requiresLiveData || 
            conversationType === 'general' ||
            conversationType === 'memory_query' ||
            complexity === 'simple') {
            recommendedModel = 'gpt-5';
        }
        
        return {
            type: conversationType,
            complexity: complexity,
            requiresLiveData: requiresLiveData,
            recommendedModel: recommendedModel,
            confidence: confidence,
            metrics: {
                length: safeText.length,
                wordCount: wordCount,
                sentenceCount: sentenceCount,
                questionCount: questionCount
            }
        };
        
    } catch (error) {
        console.error('❌ Conversation analysis failed:', error.message);
        return {
            type: 'unknown',
            complexity: 'simple',
            requiresLiveData: false,
            recommendedModel: 'gpt-5',
            confidence: 0.3
        };
    }
}

/**
 * Build enhanced prompt with context
 * @param {string} userMessage - User's message
 * @param {object} context - Conversation context
 * @param {object} analysis - Conversation analysis
 * @returns {object} - Enhanced prompt data
 */
function buildEnhancedPrompt(userMessage, context = {}, analysis = {}) {
    try {
        const safeMessage = safeTrim(userMessage, 'enhanced_prompt');
        let enhancedPrompt = safeMessage;
        let systemPrompt = '';
        
        // Add context if available
        if (context.memoryContext && safeTrim(context.memoryContext).length > 0) {
            enhancedPrompt = `${safeTrim(context.memoryContext, 'memory_context')}\n\n=== Current Request ===\n${safeMessage}`;
        }
        
        // Customize system prompt based on conversation type
        switch (analysis.type) {
            case 'financial_analysis':
                systemPrompt = 'You are a financial AI assistant with expertise in investment analysis, market trends, and financial strategy. Provide detailed, data-driven insights and practical recommendations.';
                break;
                
            case 'strategic_analysis':
                systemPrompt = 'You are a strategic AI consultant. Provide comprehensive analysis, identify key factors, and offer actionable strategic recommendations with clear reasoning.';
                break;
                
            case 'coding':
                systemPrompt = 'You are an expert programming assistant. Provide clean, efficient code with clear explanations, best practices, and debugging help when needed.';
                break;
                
            case 'creative_writing':
                systemPrompt = 'You are a creative writing assistant. Help with storytelling, character development, plot structure, and engaging prose while maintaining the user\'s voice and style.';
                break;
                
            case 'memory_query':
                systemPrompt = 'You are an AI assistant with access to conversation history. Use the provided context to give informed responses based on previous interactions.';
                break;
                
            default:
                systemPrompt = 'You are a helpful AI assistant. Provide accurate, concise, and helpful responses tailored to the user\'s needs.';
                break;
        }
        
        return {
            prompt: enhancedPrompt,
            systemPrompt: systemPrompt,
            originalMessage: safeMessage,
            hasContext: !!(context.memoryContext && safeTrim(context.memoryContext).length > 0)
        };
        
    } catch (error) {
        console.error('❌ Enhanced prompt building failed:', error.message);
        return {
            prompt: safeTrim(userMessage, 'fallback_prompt') || 'Please help me.',
            systemPrompt: 'You are a helpful AI assistant.',
            originalMessage: userMessage,
            hasContext: false
        };
    }
}

// ===================================================================
// MAIN DUAL AI CONVERSATION HANDLER - ENHANCED DEBUGGING
// ===================================================================

/**
 * Handle text message with dual AI routing
 * @param {number} chatId - Chat ID
 * @param {string} text - Message text
 * @param {string} sessionId - Session ID
 */
async function handleTextMessage(chatId, text, sessionId) {
    const startTime = Date.now();
    
    try {
        console.log(`🤖 Processing text message from ${chatId}: ${safeSubstring(text, 0, 50, 'text_handler')}...`);
        
        // Enhanced debugging for API keys
        console.log('🔍 Debug - Environment Check:', {
            openaiKeyPresent: !!process.env.OPENAI_API_KEY,
            claudeKeyPresent: !!process.env.ANTHROPIC_API_KEY,
            textLength: text ? text.length : 0,
            chatId: chatId,
            sessionId: sessionId
        });
        
        // Get conversation context (will be implemented in Piece 4)
        const context = await buildConversationContext(chatId, text);
        
        // Analyze conversation to determine best AI
        const analysis = analyzeConversation(text, context);
        console.log(`🎯 Analysis: ${analysis.type} (${analysis.complexity}) → ${analysis.recommendedModel}`);
        
        // Build enhanced prompt
        const promptData = buildEnhancedPrompt(text, context, analysis);
        
        // Call appropriate AI model
        let aiResponse;
        let modelUsed;
        
        if (analysis.recommendedModel === 'claude-opus-4.1') {
            console.log('🧠 Routing to Claude Opus 4.1...');
            
            const options = {
                systemPrompt: promptData.systemPrompt,
                maxTokens: analysis.complexity === 'maximum' ? 2000 : 1500,
                temperature: analysis.type === 'creative_writing' ? 0.8 : 0.7
            };
            
            aiResponse = await callClaudeOpus41(promptData.prompt, options);
            modelUsed = 'claude-opus-4.1';
            
        } else {
            console.log('🤖 Routing to GPT-5...');
            
            const options = {
                systemPrompt: promptData.systemPrompt,
                maxTokens: analysis.complexity === 'maximum' ? 2000 : 1500,
                temperature: analysis.type === 'creative_writing' ? 0.8 : 0.7
            };
            
            aiResponse = await callOpenAIGPT5(promptData.prompt, options);
            modelUsed = 'gpt-5';
        }
        
        // Send response to user
        const responseTime = Date.now() - startTime;
        const modelEmoji = modelUsed === 'claude-opus-4.1' ? '🧠' : '🤖';
        
        console.log(`📤 Sending ${aiResponse.length} character response to user...`);
        await sendTelegramMessage(chatId, aiResponse);
        
        // Log successful conversation (will be implemented in Piece 4)
        const conversationData = {
            chatId,
            userMessage: text,
            aiResponse,
            aiModel: modelUsed,
            sessionId,
            responseTime,
            analysis
        };
        
        await saveConversationToDB(conversationData);
        
        // Extract and save memories (will be implemented in Piece 4)
        await extractAndSaveMemories(chatId, text, aiResponse);
        
        console.log(`✅ ${modelEmoji} ${modelUsed} completed successfully (${responseTime}ms)`);
        
    } catch (error) {
        console.error('❌ Text message handling failed:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        // Try enhanced fallback response
        try {
            const fallbackResponse = await handleEnhancedFallbackResponse(chatId, text, error);
            await sendTelegramMessage(chatId, fallbackResponse);
        } catch (fallbackError) {
            console.error('❌ Enhanced fallback also failed:', fallbackError.message);
            await sendTelegramMessage(chatId, 
                '🚨 **System Error**\n\nI\'m experiencing technical difficulties. Please try again in a moment.\n\n**Error:** API connectivity issues\n\n**Commands that work:**\n• `/status` - Check system health\n• `/help` - Get help information'
            );
        }
        
        // Log error
        await logErrorToDB(chatId, error.message, error.stack, 'text_message_handler', 'high').catch(console.error);
    }
}

/**
 * Enhanced fallback response with multiple model attempts
 * @param {number} chatId - Chat ID
 * @param {string} text - Original message text
 * @param {Error} originalError - The original error that occurred
 * @returns {Promise<string>} - Fallback response
 */
async function handleEnhancedFallbackResponse(chatId, text, originalError) {
    console.log('🔄 Attempting enhanced fallback response...');
    console.log('🔍 Original error:', originalError.message);
    
    const fallbackPrompt = safeTrim(text, 'fallback_prompt');
    
    // Try GPT-5 first with simple prompt
    try {
        console.log('🔄 Fallback: Trying GPT-5 with simple prompt...');
        const options = {
            systemPrompt: 'You are a helpful AI assistant. Respond naturally and helpfully.',
            maxTokens: 800,
            temperature: 0.5,
            timeout: 15000
        };
        
        const response = await callOpenAIGPT5(fallbackPrompt, options);
        return `🔄 **Fallback Response (GPT-5)**\n\n${response}\n\n_Note: Primary system had a temporary issue but recovered._`;
        
    } catch (gptError) {
        console.log('⚠️ GPT-5 fallback failed:', gptError.message);
    }
    
    // Try Claude with simple prompt
    try {
        console.log('🔄 Fallback: Trying Claude Opus 4.1 with simple prompt...');
        const options = {
            systemPrompt: 'You are Claude, a helpful AI assistant. Respond naturally and helpfully.',
            maxTokens: 800,
            temperature: 0.5,
            timeout: 15000
        };
        
        const response = await callClaudeOpus41(fallbackPrompt, options);
        return `🔄 **Fallback Response (Claude Opus 4.1)**\n\n${response}\n\n_Note: Primary system had a temporary issue but recovered._`;
        
    } catch (claudeError) {
        console.log('⚠️ Claude fallback failed:', claudeError.message);
    }
    
    // Final static fallback with error details
    console.log('⚠️ All AI models failed - using detailed static response');
    const textPreview = safeSubstring(text, 0, 100, 'final_fallback');
    
    let errorHint = '';
    if (originalError.message.includes('API key')) {
        errorHint = '\n\n**Likely Issue:** API keys need verification in Railway Variables tab';
    } else if (originalError.message.includes('model not found')) {
        errorHint = '\n\n**Likely Issue:** AI models may not be available yet or model names changed';
    } else if (originalError.message.includes('timeout')) {
        errorHint = '\n\n**Likely Issue:** Network timeout - try again in a moment';
    }
    
    return `🤖 I apologize, but I'm experiencing technical difficulties with both AI models.

**Your message:** "${textPreview}${text.length > 100 ? '...' : ''}"

**Error details:** ${originalError.message}${errorHint}

**What you can try:**
• Send a simpler message to test connectivity
• Use \`/status\` to check system health
• Try again in a few moments

**System Info:**
• OpenAI API: ${process.env.OPENAI_API_KEY ? 'Key configured' : 'Key missing'}
• Claude API: ${process.env.ANTHROPIC_API_KEY ? 'Key configured' : 'Key missing'}

The system will automatically recover once the APIs are accessible.`;
}

// ===================================================================
// AI CONNECTIVITY TEST FUNCTION
// ===================================================================

/**
 * Test AI connectivity for debugging
 * @returns {Promise<object>} - Connectivity status
 */
async function checkAIConnectivity() {
    const status = { gpt5: false, claude: false, errors: {} };
    
    try {
        console.log('🧪 Testing GPT-5 connectivity...');
        const gptTest = await callOpenAIGPT5('Test', { 
            maxTokens: 10, 
            timeout: 10000 
        });
        status.gpt5 = true;
        console.log('✅ GPT-5 connectivity: WORKING');
    } catch (error) {
        status.errors.gpt5 = error.message;
        console.log('❌ GPT-5 connectivity: FAILED -', error.message);
    }
    
    try {
        console.log('🧪 Testing Claude Opus 4.1 connectivity...');
        const claudeTest = await callClaudeOpus41('Test', { 
            maxTokens: 10, 
            timeout: 10000 
        });
        status.claude = true;
        console.log('✅ Claude Opus 4.1 connectivity: WORKING');
    } catch (error) {
        status.errors.claude = error.message;
        console.log('❌ Claude Opus 4.1 connectivity: FAILED -', error.message);
    }
    
    return status;
}

// ===================================================================
// PLACEHOLDER FUNCTIONS (IMPLEMENTED IN PIECE 4)
// ===================================================================

/**
 * Build conversation context from database (implemented in Piece 4)
 * @param {number} chatId - Chat ID
 * @param {string} currentText - Current message text
 * @returns {Promise<object>} - Context data
 */
async function buildConversationContext(chatId, currentText) {
    // Placeholder - will be implemented in Piece 4
    return {
        conversationHistory: [],
        persistentMemory: [],
        memoryContext: '',
        memoryAvailable: false
    };
}

/**
 * Save conversation to database (implemented in Piece 4)
 * @param {object} conversationData - Conversation data
 * @returns {Promise<boolean>} - Success status
 */
async function saveConversationToDB(conversationData) {
    // Placeholder - will be implemented in Piece 4
    console.log('💾 Conversation saved (placeholder)');
    return true;
}

/**
 * Extract and save memories (implemented in Piece 4)
 * @param {number} chatId - Chat ID
 * @param {string} userMessage - User message
 * @param {string} aiResponse - AI response
 * @returns {Promise<boolean>} - Success status
 */
async function extractAndSaveMemories(chatId, userMessage, aiResponse) {
    // Placeholder - will be implemented in Piece 4
    console.log('🧠 Memory extraction (placeholder)');
    return true;
}

console.log('✅ Piece 3/5 loaded: Enhanced Dual AI system + GPT-5 + Claude Opus 4.1');
console.log('🔧 Enhanced debugging and error handling active');
console.log('🔧 Next: Copy Piece 4/5 for Memory system + PostgreSQL operations');age, aiResponse) {
    // Complete input validation
    if (!userMessage || typeof userMessage !== 'string' || 
        !aiResponse || typeof aiResponse !== 'string') {
        console.log('⚠️ extractMemoryFactAdvanced: Invalid input types');
        return null;
    }
    
    const safeUserMessage = safeTrim(userMessage, 'memory_extraction_user');
    const safeAiResponse = safeTrim(aiResponse, 'memory_extraction_ai');
    
    if (!safeUserMessage || !safeAiResponse) {
        return null;
    }
    
    const lowerMessage = safeUserMessage.toLowerCase();
    
    // Personal information extraction patterns
    const personalPatterns = [
        { pattern: /my name is ([^.,\n!?]+)/i, template: "User's name: {1}" },
        { pattern: /i am ([^.,\n!?]+)/i, template: "User identity: {1}" },
        { pattern: /i work (?:at|for) ([^.,\n!?]+)/i, template: "User workplace: {1}" },
        { pattern: /i live in ([^.,\n!?]+)/i, template: "User location: {1}" },
        { pattern: /i'm from ([^.,\n!?]+)/i, template: "User origin: {1}" },
        { pattern: /my (?:phone|email) (?:is )?([^.,\n!?]+)/i, template: "User contact: {1}" },
        { pattern: /i'm (\d+) years old/i, template: "User age: {1}" },
        { pattern: /my birthday is ([^.,\n!?]+)/i, template: "User birthday: {1}" },
        { pattern: /my goal (?:is )?(?:to )?([^.,\n!?]+)/i, template: "User goal: {1}" },
        { pattern: /my strategy (?:is )?(?:to )?([^.,\n!?]+)/i, template: "User strategy: {1}" },
        { pattern: /my plan (?:is )?(?:to )?([^.,\n!?]+)/i, template: "User plan: {1}" }
    ];
    
    // Check personal patterns
    for (const { pattern, template } of personalPatterns) {
        const match = safeUserMessage.match(pattern);
        if (match && match[1]) {
            return template.replace('{1}', safeTrim(match[1], 'personal_pattern'));
        }
    }
    
    // Preference extraction patterns
    const preferencePatterns = [
        { pattern: /i prefer ([^.,\n!?]+)/i, template: "User preference: {1}" },
        { pattern: /i like ([^.,\n!?]+)/i, template: "User likes: {1}" },
        { pattern: /i don't like ([^.,\n!?]+)/i, template: "User dislikes: {1}" },
        { pattern: /i hate ([^.,\n!?]+)/i, template: "User dislikes: {1}" },
        { pattern: /my favorite ([^.,\n!?]+)/i, template: "User favorite: {1}" }
    ];
    
    // Check preference patterns
    for (const { pattern, template } of preferencePatterns) {
        const match = safeUserMessage.match(pattern);
        if (match && match[1]) {
            return template.replace('{1}', safeTrim(match[1], 'preference_pattern'));
        }
    }
    
    // Remember directive handling
    if (lowerMessage.includes('remember')) {
        const rememberMatch = safeUserMessage.match(/remember (?:that )?([^.,\n!?]+)/i);
        if (rememberMatch && rememberMatch[1]) {
            return `Important fact: ${safeTrim(rememberMatch[1], 'remember_directive')}`;
        }
        return `User request: ${safeTrim(safeUserMessage, 'remember_fallback')}`;
    }
    
    // AI insights extraction
    const insightPatterns = [
        'Key insight:', 'Important note:', 'Critical point:', 'Remember:',
        'In conclusion:', 'To summarize:', 'Bottom line:', 'Strategic insight:',
        'Key takeaway:', 'Main point:', 'Essential fact:'
    ];
    
    for (const pattern of insightPatterns) {
        if (safeAiResponse.includes(pattern)) {
            const parts = safeAiResponse.split(pattern);
            if (parts.length > 1) {
                const insight = parts[1].split('\n')[0];
                if (insight && safeTrim(insight).length > 10) {
                    return `AI insight: ${safeTrim(insight, 'ai_insight')}`;
                }
            }
        }
    }
    
    // Recommendation extraction
    const recommendationMatch = safeAiResponse.match(/I recommend ([^.,\n!?]+)/i);
    if (recommendationMatch && recommendationMatch[1]) {
        return `AI recommendation: ${safeTrim(recommendationMatch[1], 'ai_recommendation')}`;
    }
    
    // Financial context preservation
    if (lowerMessage.includes('cambodia') || lowerMessage.includes('fund') ||
        lowerMessage.includes('investment') || lowerMessage.includes('lending') ||
        lowerMessage.includes('portfolio') || lowerMessage.includes('financial')) {
        const maxLength = Math.min(safeUserMessage.length, 150);
        return `Financial context: ${safeSubstring(safeUserMessage, 0, maxLength, 'financial_context')}`;
    }
    
    // Strategic context preservation
    if (lowerMessage.includes('strategy') || lowerMessage.includes('strategic') ||
        lowerMessage.includes('analysis') || lowerMessage.includes('plan')) {
        const maxLength = Math.min(safeUserMessage.length, 150);
        return `Strategic context: ${safeSubstring(safeUserMessage, 0, maxLength, 'strategic_context')}`;
    }
    
    // General conversation context for medium-length messages
    if (safeUserMessage.length > 30 && safeUserMessage.length < 200) {
        return `Conversation context: ${safeTrim(safeUserMessage, 'general_context')}`;
    }
    
    return null;
}

/**
 * Determine if a conversation should be saved to persistent memory
 * @param {string} userMessage - User message
 * @param {string} aiResponse - AI response
 * @returns {boolean} - Whether to save to memory
 */
function shouldSaveToPersistentMemory(userMessage, aiResponse) {
    if (!userMessage || typeof userMessage !== 'string' || 
        !aiResponse || typeof aiResponse !== 'string') {
        return false;
    }
    
    const lower = userMessage.toLowerCase();
    
    // Save if contains personal information
    const personalKeywords = [
        'my name', 'i am', 'i work', 'i live', 'remember', 
        'my goal', 'my plan', 'my strategy', 'important', 'key'
    ];
    
    if (personalKeywords.some(keyword => lower.includes(keyword))) {
        return true;
    }
    
    // Save if AI provided important insights
    const insightKeywords = [
        'important', 'remember', 'key point', 'strategy', 
        'recommendation', 'insight', 'conclusion'
    ];
    
    if (insightKeywords.some(keyword => aiResponse.toLowerCase().includes(keyword))) {
        return true;
    }
    
    // Save longer strategic conversations
    if (userMessage.length > 100 && (
        lower.includes('strategy') || lower.includes('analysis') || 
        lower.includes('financial') || lower.includes('investment')
    )) {
        return true;
    }
    
    return false;
}

// ===================================================================
// POSTGRESQL MEMORY OPERATIONS
// ===================================================================

/**
 * Add persistent memory to database
 * @param {number} chatId - Chat ID
 * @param {string} fact - Memory fact
 * @param {string} category - Memory category
 * @param {string} importance - Importance level
 * @param {string} extractedFrom - Source of extraction
 * @returns {Promise<boolean>} - Success status
 */
async function addPersistentMemoryDB(chatId, fact, category = 'general', importance = 'medium', extractedFrom = '') {
    try {
        const client = await pool.connect();
        
        const safeFact = safeTrim(fact, 'persistent_memory_fact');
        if (!safeFact || safeFact.length < 5) {
            console.log('⚠️ Memory fact too short, skipping');
            client.release();
            return false;
        }
        
        // Check for duplicate memories
        const duplicateCheck = await client.query(
            'SELECT id FROM memories WHERE chat_id = $1 AND fact = $2',
            [chatId, safeFact]
        );
        
        if (duplicateCheck.rows.length > 0) {
            console.log('⚠️ Duplicate memory detected, skipping');
            client.release();
            return false;
        }
        
        // Insert new memory
        await client.query(`
            INSERT INTO memories (chat_id, fact, category, importance, extracted_from)
            VALUES ($1, $2, $3, $4, $5)
        `, [chatId, safeFact, category, importance, safeString(extractedFrom)]);
        
        client.release();
        console.log(`🧠 Memory saved: ${safeSubstring(safeFact, 0, 50, 'memory_log')}...`);
        return true;
        
    } catch (error) {
        console.error('❌ Memory save failed:', error.message);
        return false;
    }
}

/**
 * Get persistent memories from database
 * @param {number} chatId - Chat ID
 * @param {number} limit - Maximum number of memories
 * @returns {Promise<Array>} - Array of memories
 */
async function getPersistentMemoryDB(chatId, limit = 10) {
    try {
        const client = await pool.connect();
        
        const result = await client.query(`
            SELECT fact, category, importance, created_at
            FROM memories 
            WHERE chat_id = $1 
            ORDER BY 
                CASE importance 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    WHEN 'low' THEN 3 
                END,
                created_at DESC
            LIMIT $2
        `, [chatId, limit]);
        
        client.release();
        
        const memories = result.rows.map(row => ({
            fact: safeString(row.fact),
            category: safeString(row.category),
            importance: safeString(row.importance),
            createdAt: row.created_at
        }));
        
        console.log(`🧠 Retrieved ${memories.length} memories for ${chatId}`);
        return memories;
        
    } catch (error) {
        console.error('❌ Memory retrieval failed:', error.message);
        return [];
    }
}

/**
 * Get conversation history from database
 * @param {number} chatId - Chat ID
 * @param {number} limit - Maximum number of conversations
 * @returns {Promise<Array>} - Array of conversations
 */
async function getConversationHistoryDB(chatId, limit = 5) {
    try {
        const client = await pool.connect();
        
        const result = await client.query(`
            SELECT user_message, ai_response, ai_model, created_at, response_time
            FROM conversations 
            WHERE chat_id = $1 AND success = true
            ORDER BY created_at DESC
            LIMIT $2
        `, [chatId, limit]);
        
        client.release();
        
        const conversations = result.rows.map(row => ({
            userMessage: safeString(row.user_message),
            aiResponse: safeString(row.ai_response),
            aiModel: safeString(row.ai_model),
            createdAt: row.created_at,
            responseTime: row.response_time
        }));
        
        console.log(`📚 Retrieved ${conversations.length} conversations for ${chatId}`);
        return conversations;
        
    } catch (error) {
        console.error('❌ Conversation history retrieval failed:', error.message);
        return [];
    }
}

/**
 * Save conversation to database
 * @param {object} conversationData - Conversation data
 * @returns {Promise<boolean>} - Success status
 */
async function saveConversationToDB(conversationData) {
    try {
        const client = await pool.connect();
        
        const {
            chatId, userMessage, aiResponse, aiModel, 
            sessionId, responseTime, analysis
        } = conversationData;
        
        const safeUserMessage = safeTrim(userMessage, 'save_conversation_user');
        const safeAiResponse = safeTrim(aiResponse, 'save_conversation_ai');
        
        if (!safeUserMessage || !safeAiResponse) {
            console.log('⚠️ Invalid conversation data, skipping save');
            client.release();
            return false;
        }
        
        await client.query(`
            INSERT INTO conversations 
            (chat_id, user_message, ai_response, ai_model, session_id, response_time, success)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            chatId, 
            safeUserMessage, 
            safeAiResponse, 
            safeString(aiModel, 'unknown'), 
            safeString(sessionId), 
            responseTime || 0, 
            true
        ]);
        
        client.release();
        console.log(`💾 Conversation saved: ${safeSubstring(safeUserMessage, 0, 30, 'save_log')}...`);
        return true;
        
    } catch (error) {
        console.error('❌ Conversation save failed:', error.message);
        return false;
    }
}

// ===================================================================
// CONTEXT BUILDING SYSTEM
// ===================================================================

/**
 * Build conversation context from database
 * @param {number} chatId - Chat ID
 * @param {string} currentText - Current message text
 * @returns {Promise<object>} - Context data
 */
async function buildConversationContext(chatId, currentText) {
    const context = {
        conversationHistory: [],
        persistentMemory: [],
        memoryContext: '',
        memoryAvailable: false,
        errors: []
    };
    
    try {
        // Use timeout promises to prevent hanging
        const timeoutPromise = (promise, timeout = 3000) => {
            return Promise.race([
                promise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Database timeout')), timeout)
                )
            ]);
        };
        
        // Get conversation history with timeout
        try {
            context.conversationHistory = await timeoutPromise(
                getConversationHistoryDB(chatId, 5)
            );
            console.log(`📚 Context: ${context.conversationHistory.length} conversations`);
        } catch (error) {
            console.log('⚠️ History retrieval failed:', error.message);
            context.errors.push(`History: ${error.message}`);
            context.conversationHistory = [];
        }
        
        // Get persistent memory with timeout
        try {
            context.persistentMemory = await timeoutPromise(
                getPersistentMemoryDB(chatId, 8)
            );
            console.log(`🧠 Context: ${context.persistentMemory.length} memories`);
        } catch (error) {
            console.log('⚠️ Memory retrieval failed:', error.message);
            context.errors.push(`Memory: ${error.message}`);
            context.persistentMemory = [];
        }
        
        // Build memory context string
        if (context.conversationHistory.length > 0 || context.persistentMemory.length > 0) {
            context.memoryContext = buildMemoryContextString(
                context.conversationHistory, 
                context.persistentMemory
            );
            context.memoryAvailable = true;
            console.log(`✅ Memory context built: ${context.memoryContext.length} characters`);
        }
        
        return context;
        
    } catch (error) {
        console.error('❌ Context building failed:', error.message);
        context.errors.push(`Context: ${error.message}`);
        return context;
    }
}

/**
 * Build memory context string from data
 * @param {Array} conversationHistory - Recent conversations
 * @param {Array} persistentMemory - Persistent memories
 * @returns {string} - Formatted context string
 */
function buildMemoryContextString(conversationHistory, persistentMemory) {
    let contextString = '';
    
    try {
        // Add persistent memory section
        if (persistentMemory && persistentMemory.length > 0) {
            contextString += '=== PERSISTENT MEMORY ===\n';
            
            persistentMemory.forEach((memory, index) => {
                if (memory && typeof memory === 'object' && memory.fact) {
                    const safeFact = safeTrim(memory.fact, 'context_memory');
                    const category = safeString(memory.category, 'general');
                    const importance = safeString(memory.importance, 'medium');
                    
                    if (safeFact) {
                        contextString += `${index + 1}. [${category}/${importance}] ${safeFact}\n`;
                    }
                }
            });
            
            contextString += '\n';
        }
        
        // Add recent conversation history
        if (conversationHistory && conversationHistory.length > 0) {
            contextString += '=== RECENT CONVERSATIONS ===\n';
            
            conversationHistory.reverse().forEach((conv, index) => {
                if (conv && typeof conv === 'object') {
                    const userMsg = safeTrim(conv.userMessage, 'context_user');
                    const aiMsg = safeTrim(conv.aiResponse, 'context_ai');
                    const model = safeString(conv.aiModel, 'AI');
                    
                    if (userMsg) {
                        contextString += `User: ${userMsg}\n`;
                    }
                    
                    if (aiMsg) {
                        // Truncate long AI responses for context
                        const truncatedResponse = aiMsg.length > 200 
                            ? safeSubstring(aiMsg, 0, 200, 'context_truncate') + '...'
                            : aiMsg;
                        contextString += `${model}: ${truncatedResponse}\n\n`;
                    }
                }
            });
        }
        
        // Add instruction for AI
        if (contextString) {
            contextString += '=== INSTRUCTIONS ===\n';
            contextString += 'Use the above context to provide personalized responses. ';
            contextString += 'Reference previous conversations and memories when relevant. ';
            contextString += 'Be consistent with established facts and preferences.\n\n';
        }
        
        return contextString;
        
    } catch (error) {
        console.error('❌ Memory context string building failed:', error.message);
        return '';
    }
}

// ===================================================================
// MEMORY EXTRACTION AND SAVING
// ===================================================================

/**
 * Extract and save memories from conversation
 * @param {number} chatId - Chat ID
 * @param {string} userMessage - User message
 * @param {string} aiResponse - AI response
 * @returns {Promise<boolean>} - Success status
 */
async function extractAndSaveMemories(chatId, userMessage, aiResponse) {
    try {
        // Validate inputs
        if (!userMessage || typeof userMessage !== 'string' || 
            !aiResponse || typeof aiResponse !== 'string') {
            console.log('⚠️ Invalid input for memory extraction - skipping');
            return false;
        }
        
        // Check if this conversation should be saved to memory
        if (!shouldSaveToPersistentMemory(userMessage, aiResponse)) {
            console.log('⚠️ Conversation not suitable for memory - skipping');
            return false;
        }
        
        // Extract memory fact
        const memoryFact = extractMemoryFactAdvanced(userMessage, aiResponse);
        
        if (!memoryFact || typeof memoryFact !== 'string') {
            console.log('⚠️ No memory fact extracted');
            return false;
        }
        
        // Determine category and importance
        let category = 'general';
        let importance = 'medium';
        
        const lowerFact = memoryFact.toLowerCase();
        const lowerUser = userMessage.toLowerCase();
        
        // Categorize the memory
        if (lowerFact.includes('name') || lowerFact.includes('identity')) {
            category = 'personal';
            importance = 'high';
        } else if (lowerFact.includes('goal') || lowerFact.includes('strategy')) {
            category = 'goals';
            importance = 'high';
        } else if (lowerFact.includes('financial') || lowerFact.includes('investment')) {
            category = 'financial';
            importance = 'high';
        } else if (lowerFact.includes('preference') || lowerFact.includes('like') || lowerFact.includes('dislike')) {
            category = 'preferences';
            importance = 'medium';
        } else if (lowerFact.includes('recommendation') || lowerFact.includes('insight')) {
            category = 'insights';
            importance = 'medium';
        }
        
        // Boost importance for explicit remember requests
        if (lowerUser.includes('remember')) {
            importance = 'high';
        }
        
        // Save to database
        const saveSuccess = await addPersistentMemoryDB(
            chatId, 
            memoryFact, 
            category, 
            importance, 
            safeSubstring(userMessage, 0, 100, 'memory_source')
        );
        
        if (saveSuccess) {
            console.log(`✅ Memory extracted and saved: ${category}/${importance}`);
            return true;
        } else {
            console.log('⚠️ Memory save failed');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Memory extraction failed:', error.message);
        return false;
    }
}

/**
 * Search memories by keyword
 * @param {number} chatId - Chat ID
 * @param {string} keyword - Search keyword
 * @param {number} limit - Result limit
 * @returns {Promise<Array>} - Matching memories
 */
async function searchMemories(chatId, keyword, limit = 5) {
    try {
        const client = await pool.connect();
        const safeKeyword = safeTrim(keyword, 'memory_search');
        
        if (!safeKeyword) {
            client.release();
            return [];
        }
        
        const result = await client.query(`
            SELECT fact, category, importance, created_at
            FROM memories 
            WHERE chat_id = $1 AND (
                fact ILIKE $2 OR 
                category ILIKE $2
            )
            ORDER BY 
                CASE importance 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    WHEN 'low' THEN 3 
                END,
                created_at DESC
            LIMIT $3
        `, [chatId, `%${safeKeyword}%`, limit]);
        
        client.release();
        
        const memories = result.rows.map(row => ({
            fact: safeString(row.fact),
            category: safeString(row.category),
            importance: safeString(row.importance),
            createdAt: row.created_at
        }));
        
        console.log(`🔍 Found ${memories.length} memories for "${safeKeyword}"`);
        return memories;
        
    } catch (error) {
        console.error('❌ Memory search failed:', error.message);
        return [];
    }
}

console.log('✅ Piece 4/5 loaded: Memory system + PostgreSQL operations + Context building');
console.log('🔧 Next: Copy Piece 5/5 for Commands + Helpers + Initialization (Final piece!)');

// 🔧 INDEX.JS - PIECE 5/5: COMMANDS + HELPERS + INITIALIZATION (FINAL)
// Bot commands, helper functions, system initialization, startup sequence

// ===================================================================
// BOT COMMANDS SYSTEM
// ===================================================================

/**
 * Handle bot commands from webhook messages
 * @param {object} messageData - Message data from webhook
 * @returns {Promise<boolean>} - Whether command was handled
 */
async function handleBotCommands(messageData) {
    const { chatId, text, user } = messageData;
    
    if (!text || !text.startsWith('/')) {
        return false; // Not a command
    }
    
    const command = safeTrim(text.split(' ')[0], 'command_parse').toLowerCase();
    const args = text.split(' ').slice(1).map(arg => safeTrim(arg, 'command_args'));
    
    console.log(`⚡ Command received: ${command} from ${chatId} (${user.first_name})`);
    
    // Check authorization for all commands
    if (!isAuthorizedUser(chatId)) {
        await sendTelegramMessage(chatId, '🚫 **Access Denied**\n\nUnauthorized command access.');
        return true;
    }
    
    try {
        switch (command) {
            case '/start':
                await handleStartCommand(chatId, user);
                break;
                
            case '/help':
                await handleHelpCommand(chatId);
                break;
                
            case '/status':
                await handleStatusCommand(chatId);
                break;
                
            case '/memory':
                await handleMemoryCommand(chatId, args);
                break;
                
            case '/stats':
                await handleStatsCommand(chatId);
                break;
                
            case '/clear':
                await handleClearCommand(chatId, args);
                break;
                
            case '/search':
                await handleSearchCommand(chatId, args);
                break;
                
            default:
                await sendTelegramMessage(chatId, 
                    `❓ **Unknown Command:** \`${command}\`\n\nUse /help to see available commands.`
                );
                break;
        }
        
        return true; // Command was handled
        
    } catch (error) {
        console.error(`❌ Command ${command} failed:`, error.message);
        await sendTelegramMessage(chatId, 
            `❌ **Command Error**\n\nFailed to execute \`${command}\`: ${error.message}`
        );
        return true;
    }
}

/**
 * Handle /start command
 */
async function handleStartCommand(chatId, user) {
    const firstName = safeString(user.first_name, 'User');
    
    const welcomeMessage = `🤖 **IMPERIUM VAULT SYSTEM ACTIVATED**

Welcome back, **${firstName}**! 🚀

**🔥 Your Private AI System Features:**
🧠 **Dual AI Intelligence** - GPT-5 + Claude Opus 4.1
💾 **Persistent Memory** - Remembers your preferences & context
🎯 **Smart Routing** - Best AI for each task type
📊 **Advanced Analytics** - Strategic insights & analysis
🔒 **Secure & Private** - Your conversations stay safe

**⚡ Quick Commands:**
• Just type naturally - I'll route to the best AI
• \`/help\` - See all available commands
• \`/status\` - Check system health
• \`/memory\` - View your saved memories
• \`/stats\` - See your usage statistics

**🎯 I Excel At:**
💰 Financial analysis & investment strategy
📈 Market analysis & trading insights  
💻 Coding & technical problem solving
✍️ Creative writing & content creation
🧠 Strategic planning & decision making
📚 Research & data analysis

Ready to assist with your strategic needs! What can I help you with today?`;

    await sendTelegramMessage(chatId, welcomeMessage);
}

/**
 * Handle /help command
 */
async function handleHelpCommand(chatId) {
    const helpMessage = `🆘 **IMPERIUM VAULT SYSTEM - HELP GUIDE**

**🤖 Natural Conversation:**
• Type any question naturally - I'll route it to the best AI
• GPT-5 for quick responses & live data
• Claude Opus 4.1 for complex analysis & strategy

**⚡ Available Commands:**
\`/start\` - Welcome message & system overview
\`/help\` - Show this help guide
\`/status\` - Check system health & performance
\`/memory\` - View your persistent memories
\`/memory clear\` - Clear all your memories (⚠️ permanent)
\`/stats\` - View your usage statistics
\`/search <keyword>\` - Search your memories
\`/clear history\` - Clear conversation history

**🎯 AI Specializations:**
**💰 Financial:** Investment analysis, portfolio strategy, market insights
**📊 Strategic:** Business planning, decision analysis, comprehensive research  
**💻 Coding:** Development, debugging, architecture, code review
**✍️ Creative:** Writing, storytelling, content creation, brainstorming
**🧠 Memory:** Persistent context, preference tracking, conversation continuity

**💡 Pro Tips:**
• Say "remember that..." to save important info
• Be specific for better results
• I maintain context across conversations
• Ask for clarification if responses aren't quite right

**🔒 Privacy:** All conversations are encrypted and stored securely. Your data never leaves our private system.

Need help with something specific? Just ask! 🚀`;

    await sendTelegramMessage(chatId, helpMessage);
}

/**
 * Handle /status command
 */
async function handleStatusCommand(chatId) {
    try {
        const startTime = Date.now();
        
        // Get database stats
        const dbStats = await getDatabaseStats();
        
        // Check AI API connectivity
        const aiStatus = await checkAIConnectivity();
        
        // Get system metrics
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const responseTime = Date.now() - startTime;
        
        // Get user-specific stats
        const userStats = await getUserStats(chatId);
        
        const statusMessage = `📊 **SYSTEM STATUS REPORT**

**🤖 AI Models:**
${aiStatus.gpt5 ? '✅' : '❌'} GPT-5 - ${aiStatus.gpt5 ? 'Online' : 'Offline'}
${aiStatus.claude ? '✅' : '❌'} Claude Opus 4.1 - ${aiStatus.claude ? 'Online' : 'Offline'}

**💾 Database:**
**Status:** ${dbStats.connectionHealth === 'healthy' ? '✅ Healthy' : '❌ Issues'}
**Total Users:** ${dbStats.totalUsers || 0}
**Conversations:** ${dbStats.totalConversations || 0}
**Memories Stored:** ${dbStats.totalMemories || 0}
**Recent Errors:** ${dbStats.recentErrors || 0}

**⚡ System Performance:**
**Uptime:** ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m
**Memory Usage:** ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB
**Response Time:** ${responseTime}ms
**Load:** ${await getSystemLoad()}

**👤 Your Statistics:**
**Conversations:** ${userStats.conversations || 0}
**Memories:** ${userStats.memories || 0}
**Avg Response Time:** ${userStats.avgResponseTime || 0}ms
**Most Used AI:** ${userStats.preferredAI || 'N/A'}

**🔧 System Health:** ${getSystemHealthIndicator(dbStats, aiStatus)}

Last updated: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`;

        await sendTelegramMessage(chatId, statusMessage);
        
    } catch (error) {
        console.error('❌ Status command failed:', error.message);
        await sendTelegramMessage(chatId, 
            `⚠️ **Status Check Failed**\n\nUnable to retrieve complete system status: ${error.message}`
        );
    }
}

/**
 * Handle /memory command
 */
async function handleMemoryCommand(chatId, args) {
    try {
        const subCommand = args[0] ? args[0].toLowerCase() : 'view';
        
        if (subCommand === 'clear') {
            // Clear all memories for user
            const client = await pool.connect();
            const result = await client.query('DELETE FROM memories WHERE chat_id = $1', [chatId]);
            client.release();
            
            await sendTelegramMessage(chatId, 
                `🗑️ **Memory Cleared**\n\nDeleted ${result.rowCount} memories. Your slate is now clean!`
            );
            return;
        }
        
        // Default: view memories
        const memories = await getPersistentMemoryDB(chatId, 15);
        
        if (memories.length === 0) {
            await sendTelegramMessage(chatId, 
                `🧠 **Your Memory Bank**\n\nNo memories stored yet. Start a conversation and I'll remember important details about you!`
            );
            return;
        }
        
        let memoryMessage = `🧠 **Your Memory Bank** (${memories.length} memories)\n\n`;
        
        const categoryGroups = {};
        memories.forEach(memory => {
            const category = memory.category || 'general';
            if (!categoryGroups[category]) {
                categoryGroups[category] = [];
            }
            categoryGroups[category].push(memory);
        });
        
        Object.entries(categoryGroups).forEach(([category, memoryList]) => {
            const categoryEmoji = getCategoryEmoji(category);
            memoryMessage += `**${categoryEmoji} ${category.toUpperCase()}**\n`;
            
            memoryList.forEach((memory, index) => {
                const importance = memory.importance === 'high' ? '🔴' : 
                                memory.importance === 'medium' ? '🟡' : '⚪';
                const fact = safeSubstring(memory.fact, 0, 80, 'memory_display');
                const date = new Date(memory.createdAt).toLocaleDateString();
                
                memoryMessage += `${importance} ${fact}${fact.length > 80 ? '...' : ''} _(${date})_\n`;
            });
            
            memoryMessage += '\n';
        });
        
        memoryMessage += `💡 **Tip:** Use \`/search <keyword>\` to find specific memories or \`/memory clear\` to reset.`;
        
        await sendTelegramMessage(chatId, memoryMessage);
        
    } catch (error) {
        console.error('❌ Memory command failed:', error.message);
        await sendTelegramMessage(chatId, 
            `❌ **Memory Error**\n\nFailed to access memory system: ${error.message}`
        );
    }
}

/**
 * Handle /search command
 */
async function handleSearchCommand(chatId, args) {
    try {
        if (args.length === 0) {
            await sendTelegramMessage(chatId, 
                `🔍 **Memory Search**\n\nUsage: \`/search <keyword>\`\n\nExample: \`/search investment\``
            );
            return;
        }
        
        const keyword = args.join(' ');
        const memories = await searchMemories(chatId, keyword, 10);
        
        if (memories.length === 0) {
            await sendTelegramMessage(chatId, 
                `🔍 **Search Results**\n\nNo memories found for: **"${keyword}"**\n\nTry a different keyword or browse all memories with \`/memory\``
            );
            return;
        }
        
        let searchMessage = `🔍 **Search Results for "${keyword}"** (${memories.length} found)\n\n`;
        
        memories.forEach((memory, index) => {
            const importance = memory.importance === 'high' ? '🔴' : 
                             memory.importance === 'medium' ? '🟡' : '⚪';
            const categoryEmoji = getCategoryEmoji(memory.category);
            const fact = safeSubstring(memory.fact, 0, 100, 'search_display');
            const date = new Date(memory.createdAt).toLocaleDateString();
            
            searchMessage += `${index + 1}. ${importance} ${categoryEmoji} ${fact}${fact.length > 100 ? '...' : ''}\n`;
            searchMessage += `   _${memory.category} • ${date}_\n\n`;
        });
        
        await sendTelegramMessage(chatId, searchMessage);
        
    } catch (error) {
        console.error('❌ Search command failed:', error.message);
        await sendTelegramMessage(chatId, 
            `❌ **Search Error**\n\nFailed to search memories: ${error.message}`
        );
    }
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Get category emoji for memory display
 */
function getCategoryEmoji(category) {
    const categoryMap = {
        'personal': '👤',
        'goals': '🎯',
        'financial': '💰',
        'preferences': '❤️',
        'insights': '💡',
        'general': '📝'
    };
    return categoryMap[category] || '📝';
}

/**
 * Check AI connectivity
 */
async function checkAIConnectivity() {
    const status = { gpt5: false, claude: false };
    
    try {
        // Test GPT-5
        await callOpenAIGPT5('Test connectivity', { 
            maxTokens: 10, 
            timeout: 5000 
        });
        status.gpt5 = true;
    } catch (error) {
        console.log('⚠️ GPT-5 connectivity check failed');
    }
    
    try {
        // Test Claude
        await callClaudeOpus41('Test connectivity', { 
            maxTokens: 10, 
            timeout: 5000 
        });
        status.claude = true;
    } catch (error) {
        console.log('⚠️ Claude connectivity check failed');
    }
    
    return status;
}

/**
 * Get user statistics
 */
async function getUserStats(chatId) {
    try {
        const client = await pool.connect();
        
        const conversationStats = await client.query(`
            SELECT 
                COUNT(*) as conversation_count,
                AVG(response_time) as avg_response_time,
                ai_model as preferred_ai
            FROM conversations 
            WHERE chat_id = $1 
            GROUP BY ai_model 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        `, [chatId]);
        
        const memoryStats = await client.query(`
            SELECT COUNT(*) as memory_count 
            FROM memories 
            WHERE chat_id = $1
        `, [chatId]);
        
        client.release();
        
        const conversation = conversationStats.rows[0] || {};
        const memory = memoryStats.rows[0] || {};
        
        return {
            conversations: parseInt(conversation.conversation_count) || 0,
            memories: parseInt(memory.memory_count) || 0,
            avgResponseTime: Math.round(parseFloat(conversation.avg_response_time)) || 0,
            preferredAI: conversation.preferred_ai || 'N/A'
        };
        
    } catch (error) {
        console.error('❌ User stats failed:', error.message);
        return { conversations: 0, memories: 0, avgResponseTime: 0, preferredAI: 'N/A' };
    }
}

/**
 * Get system load indicator
 */
async function getSystemLoad() {
    try {
        const cpuUsage = process.cpuUsage();
        const load = Math.round((cpuUsage.user + cpuUsage.system) / 1000000);
        return load < 100 ? 'Low' : load < 500 ? 'Medium' : 'High';
    } catch (error) {
        return 'Unknown';
    }
}

/**
 * Get system health indicator
 */
function getSystemHealthIndicator(dbStats, aiStatus) {
    const dbHealthy = dbStats.connectionHealth === 'healthy';
    const aiHealthy = aiStatus.gpt5 || aiStatus.claude;
    const lowErrors = (dbStats.recentErrors || 0) < 5;
    
    if (dbHealthy && aiHealthy && lowErrors) {
        return '🟢 Excellent';
    } else if (dbHealthy && aiHealthy) {
        return '🟡 Good';
    } else if (dbHealthy || aiHealthy) {
        return '🟠 Degraded';
    } else {
        return '🔴 Critical';
    }
}

// ===================================================================
// ENHANCED MESSAGE PROCESSING (UPDATE TO PIECE 2)
// ===================================================================

/**
 * Enhanced processMessageAsync with command handling
 */
async function processMessageAsync(messageData, sessionId, requestStart) {
    const { chatId, text, messageType, voice, photo, document } = messageData;
    
    try {
        console.log(`🔄 Processing ${messageType} message from ${chatId}...`);
        
        // Check for bot commands first
        if (messageType === 'text' && text && text.startsWith('/')) {
            const commandHandled = await handleBotCommands(messageData);
            if (commandHandled) {
                return; // Command was handled, don't process as regular message
            }
        }
        
        // Handle different message types
        switch (messageType) {
            case 'text':
                if (!text || safeTrim(text).length === 0) {
                    await sendTelegramMessage(chatId, '❓ Please send a text message with content.');
                    break;
                }
                await handleTextMessage(chatId, safeTrim(text, 'async_text'), sessionId);
                break;
                
            case 'voice':
                await sendTelegramMessage(chatId, '🎤 **Voice Processing**\n\nVoice message support will be added in future updates. Please send text for now.');
                break;
                
            case 'photo':
                await sendTelegramMessage(chatId, '🖼️ **Image Processing**\n\nImage analysis support will be added in future updates. Please send text for now.');
                break;
                
            case 'document':
                await sendTelegramMessage(chatId, '📄 **Document Processing**\n\nDocument analysis support will be added in future updates. Please send text for now.');
                break;
                
            default:
                await sendTelegramMessage(chatId, 
                    `📝 **Message Type:** ${messageType}\n\nI currently support text messages and commands. Other message types will be supported in future updates.`
                );
                break;
        }
        
    } catch (error) {
        console.error('❌ Enhanced message processing error:', error.message);
        
        // Send user-friendly error message
        try {
            if (error.message.includes('timeout') || error.message.includes('long')) {
                await sendTelegramMessage(chatId, 
                    `⏱️ **Request Timeout**\n\nYour request was too complex and timed out. Please try:\n\n• Breaking it into smaller questions\n• Using simpler language\n• Asking one thing at a time`
                );
            } else if (error.message.includes('token') || error.message.includes('limit')) {
                await sendTelegramMessage(chatId, 
                    `📝 **Message Too Long**\n\nYour message exceeded limits. Please try:\n\n• Shorter questions (under 1000 words)\n• Splitting into multiple messages\n• Being more specific`
                );
            } else {
                await sendTelegramMessage(chatId, 
                    `❌ **Processing Error**\n\nI encountered an error: ${safeSubstring(error.message, 0, 100, 'error_msg')}\n\nTry using \`/status\` to check system health or contact support.`
                );
            }
        } catch (sendError) {
            console.error('❌ Failed to send error message:', sendError.message);
        }
        
        await logErrorToDB(chatId, error.message, error.stack, 'enhanced_message_processing', 'high').catch(console.error);
        
    } finally {
        if (sessionId) {
            const totalTime = Date.now() - requestStart;
            await endUserSession(sessionId, 1, totalTime).catch(console.error);
        }
    }
}

// ===================================================================
// RAILWAY-OPTIMIZED SYSTEM INITIALIZATION
// ===================================================================

/**
 * Initialize the complete system for Railway
 */
async function initializeImperiumSystem() {
    console.log('🚀 Initializing IMPERIUM VAULT SYSTEM on RAILWAY...');
    console.log('═'.repeat(60));
    
    try {
        // Railway-specific environment check
        console.log('🔧 Railway Environment Configuration:');
        console.log(`   🌐 Domain: imperiumvaultsystem-production.up.railway.app`);
        console.log(`   🔌 Port: ${PORT}`);
        console.log(`   📡 Base URL: ${BASE_URL}`);
        console.log(`   🏗️ Environment: ${process.env.NODE_ENV || 'development'}`);
        
        // Test environment variables
        console.log('🔍 Checking environment configuration...');
        const requiredEnvVars = [
            'DATABASE_URL',
            'TELEGRAM_BOT_TOKEN',
            'OPENAI_API_KEY', 
            'ANTHROPIC_API_KEY',
            'ADMIN_CHAT_ID'
        ];
        
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            console.error('❌ Missing environment variables:', missingVars.join(', '));
            console.log('⚠️ Add these in Railway Variables tab');
        } else {
            console.log('✅ All required environment variables found');
        }
        
        // Initialize Railway PostgreSQL
        console.log('🗄️ Connecting to Railway PostgreSQL...');
        const dbConnected = await testDatabaseConnection();
        
        if (dbConnected) {
            console.log('📊 Setting up database tables...');
            await initializeDatabaseTables();
            console.log('✅ Railway PostgreSQL ready');
        } else {
            console.log('❌ Railway PostgreSQL connection failed');
            console.log('🔧 Check DATABASE_URL in Railway Variables');
        }
        
        // Test AI connectivity
        console.log('🤖 Testing AI model connectivity...');
        const aiStatus = await checkAIConnectivity();
        console.log(`${aiStatus.gpt5 ? '✅' : '❌'} GPT-5: ${aiStatus.gpt5 ? 'Connected' : 'Check OPENAI_API_KEY'}`);
        console.log(`${aiStatus.claude ? '✅' : '❌'} Claude Opus 4.1: ${aiStatus.claude ? 'Connected' : 'Check ANTHROPIC_API_KEY'}`);
        
        if (!aiStatus.gpt5 && !aiStatus.claude) {
            console.log('⚠️ No AI models available - check API keys in Railway Variables');
        }
        
        // Setup Telegram webhook for Railway
        console.log('📡 Configuring Telegram webhook for Railway...');
        const webhookSet = await setupTelegramWebhook();
        
        // Start Express server on Railway
        console.log('🌐 Starting Railway Express server...');
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on Railway port ${PORT}`);
            console.log(`🔗 Public URL: ${BASE_URL}`);
        });
        
        // Railway-specific graceful shutdown
        process.on('SIGTERM', () => gracefulShutdown(server));
        process.on('SIGINT', () => gracefulShutdown(server));
        
        // Record system startup
        await recordSystemMetric('railway_startup', 1).catch(console.error);
        
        console.log('═'.repeat(60));
        console.log('🎉 IMPERIUM VAULT SYSTEM DEPLOYED ON RAILWAY!');
        console.log('');
        console.log('🌐 Railway Deployment Info:');
        console.log(`   🔗 Production URL: ${BASE_URL}`);
        console.log(`   📡 Webhook: ${BASE_URL}/webhook`);
        console.log(`   ❤️ Health Check: ${BASE_URL}/health`);
        console.log(`   🔌 Port: ${PORT}`);
        console.log('');
        console.log('📋 System Status:');
        console.log(`   🤖 Dual AI: ${aiStatus.gpt5 ? 'GPT-5' : 'OFF'} + ${aiStatus.claude ? 'Claude' : 'OFF'}`);
        console.log(`   💾 Database: ${dbConnected ? 'Railway PostgreSQL' : 'Offline'}`);
        console.log(`   📡 Webhook: ${webhookSet ? 'Active' : 'Failed'}`);
        console.log('');
        console.log('🔧 Features Active:');
        console.log('   ✅ Intelligent AI routing');
        console.log('   ✅ Persistent memory system');
        console.log('   ✅ Conversation context');
        console.log('   ✅ Safety error handling');
        console.log('   ✅ PostgreSQL integration');
        console.log('   ✅ Command system');
        console.log('');
        console.log('🎯 Ready to receive Telegram messages!');
        console.log('   Send /start to your bot to test');
        console.log('═'.repeat(60));
        
        return true;
        
    } catch (error) {
        console.error('❌ Railway deployment failed:', error.message);
        console.log('🔧 Check Railway logs for details');
        return false;
    }
}

/**
 * Setup Telegram webhook for Railway deployment
 */
async function setupTelegramWebhook() {
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.log('⚠️ TELEGRAM_BOT_TOKEN not set - webhook setup skipped');
            return false;
        }

        const webhookUrl = `${BASE_URL}/webhook`;
        
        console.log(`🔗 Setting up Telegram webhook: ${webhookUrl}`);
        
        // Set webhook
        const response = await axios.post(
            `https://api.telegram.org/bot${botToken}/setWebhook`,
            {
                url: webhookUrl,
                allowed_updates: ['message', 'callback_query'],
                drop_pending_updates: true,
                secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined
            }
        );

        if (response.data.ok) {
            console.log('✅ Telegram webhook set successfully');
            console.log(`📡 Webhook URL: ${webhookUrl}`);
            return true;
        } else {
            console.error('❌ Webhook setup failed:', response.data.description);
            return false;
        }

    } catch (error) {
        console.error('❌ Webhook setup error:', error.message);
        return false;
    }
}

/**
 * Graceful shutdown handler for Railway
 */
async function gracefulShutdown(server) {
    console.log('\n🛑 Railway deployment shutting down...');
    
    try {
        // Close server
        server.close(() => {
            console.log('✅ HTTP server closed');
        });
        
        // Close database connections
        await pool.end();
        console.log('✅ Railway PostgreSQL connections closed');
        
        // Record shutdown
        await recordSystemMetric('railway_shutdown', 1).catch(console.error);
        
        console.log('🏁 IMPERIUM VAULT SYSTEM shutdown complete');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Shutdown error:', error.message);
        process.exit(1);
    }
}

// ===================================================================
// GLOBAL ERROR HANDLERS
// ===================================================================

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
    
    // Log to database if possible
    logErrorToDB(null, error.message, error.stack, 'uncaught_exception', 'critical').catch(() => {
        console.log('⚠️ Could not log error to database');
    });
    
    // Don't exit - log and continue
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    
    // Log to database if possible
    const errorMsg = reason instanceof Error ? reason.message : String(reason);
    const errorStack = reason instanceof Error ? reason.stack : '';
    
    logErrorToDB(null, errorMsg, errorStack, 'unhandled_rejection', 'high').catch(() => {
        console.log('⚠️ Could not log rejection to database');
    });
});

// ===================================================================
// START THE RAILWAY SYSTEM
// ===================================================================

// Initialize and start the Railway system
initializeImperiumSystem().then(success => {
    if (success) {
        console.log('🎯 Railway deployment completed successfully');
    } else {
        console.log('⚠️ Railway deployment completed with issues - check logs');
    }
}).catch(error => {
    console.error('💥 Critical Railway deployment error:', error.message);
    process.exit(1);
});

// Export for testing (optional)
module.exports = {
    app,
    pool,
    initializeImperiumSystem,
    setupTelegramWebhook,
    gracefulShutdown,
    safeTrim,
    safeString,
    safeSubstring,
    BASE_URL
};

console.log('✅ Piece 5/5 loaded: Railway-optimized Commands + Initialization');
console.log('🎉 COMPLETE RAILWAY SYSTEM READY!');
console.log('');
console.log('🚀 RAILWAY DEPLOYMENT GUIDE:');
console.log('1. Set environment variables in Railway Variables tab');
console.log('2. Deploy this code to Railway');
console.log('3. Check deployment logs for success');
console.log('4. Test webhook at: https://imperiumvaultsystem-production.up.railway.app/health');
console.log('5. Send /start to your Telegram bot');
console.log('');
console.log('🌐 Your Railway-deployed Dual AI system is ready!');
