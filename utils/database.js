// utils/database.js - CLEAN VERSION - Core PostgreSQL Functions Only
// Focus: Memory & Conversations (Remove complex trading systems)

const { Pool } = require('pg');

// Initialize PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20,
    statement_timeout: 30000,
    query_timeout: 30000
});

// 📊 CONNECTION MONITORING
let connectionStats = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    lastError: null,
    connectionHealth: 'UNKNOWN',
    lastQuery: null
};

// Monitor connection health
pool.on('error', (err) => {
    console.error('Database connection error:', err.message);
    connectionStats.lastError = err.message;
    connectionStats.connectionHealth = 'ERROR';
});

pool.on('connect', () => {
    connectionStats.connectionHealth = 'HEALTHY';
    console.log('🟢 Database connected successfully');
});

// 📊 DATABASE CONNECTION TEST FUNCTION
async function testDatabaseConnection() {
    try {
        console.log('[DB-TEST] Testing database connection...');
        const testResult = await pool.query('SELECT NOW() as current_time, COUNT(*) as test FROM information_schema.tables WHERE table_schema = \'public\'');
        console.log(`[DB-TEST] ✅ Database connected, ${testResult.rows[0].test} tables found`);
        connectionStats.connectionHealth = 'HEALTHY';
        connectionStats.lastQuery = new Date().toISOString();
        return true;
    } catch (error) {
        console.log(`[DB-TEST] ❌ Database connection failed: ${error.message}`);
        connectionStats.connectionHealth = 'ERROR';
        connectionStats.lastError = error.message;
        return false;
    }
}

// Test connection immediately
testDatabaseConnection();

/**
 * 🏛️ INITIALIZE CORE DATABASE SCHEMA (Essential Tables Only)
 */
async function initializeDatabase() {
    try {
        console.log('🚀 Initializing Core Database Schema...');
        
        await pool.query(`
            -- Core conversation storage
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                user_message TEXT NOT NULL,
                gpt_response TEXT NOT NULL,
                message_type VARCHAR(20) DEFAULT 'text',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                context_data JSONB,
                response_time_ms INTEGER
            );
            
            -- User profiles
            CREATE TABLE IF NOT EXISTS user_profiles (
                chat_id VARCHAR(50) PRIMARY KEY,
                conversation_count INTEGER DEFAULT 0,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                preferences JSONB DEFAULT '{}'
            );
            
            -- Persistent memories
            CREATE TABLE IF NOT EXISTS persistent_memories (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                fact TEXT NOT NULL,
                importance VARCHAR(10) DEFAULT 'medium',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 0,
                fact_hash VARCHAR(64)
            );
            
            -- Training documents
            CREATE TABLE IF NOT EXISTS training_documents (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                document_type VARCHAR(50) DEFAULT 'general',
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                word_count INTEGER,
                summary TEXT
            );
            
            -- System metrics
            CREATE TABLE IF NOT EXISTS system_metrics (
                id SERIAL PRIMARY KEY,
                metric_date DATE DEFAULT CURRENT_DATE,
                total_users INTEGER DEFAULT 0,
                active_users INTEGER DEFAULT 0,
                total_queries INTEGER DEFAULT 0,
                avg_response_time DECIMAL(8,2) DEFAULT 0,
                error_rate DECIMAL(5,4) DEFAULT 0,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Create indexes for performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_conversations_chat_id_time ON conversations(chat_id, timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_memories_chat_id ON persistent_memories(chat_id);
            CREATE INDEX IF NOT EXISTS idx_memories_hash ON persistent_memories(fact_hash);
            CREATE INDEX IF NOT EXISTS idx_training_chat_id ON training_documents(chat_id);
        `);
        
        console.log('✅ Core Database schema initialized successfully');
        
        // Initialize today's metrics
        await initializeSystemMetrics();
        
        return true;
        
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        connectionStats.lastError = error.message;
        connectionStats.connectionHealth = 'INIT_ERROR';
        return false;
    }
}

/**
 * 📊 INITIALIZE SYSTEM METRICS
 */
async function initializeSystemMetrics() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const existingMetrics = await pool.query(
            'SELECT id FROM system_metrics WHERE metric_date = $1',
            [today]
        );
        
        if (existingMetrics.rows.length === 0) {
            await pool.query(`
                INSERT INTO system_metrics (total_users, active_users, total_queries, avg_response_time, error_rate) 
                VALUES (0, 0, 0, 0, 0)
            `);
            console.log('📊 System metrics initialized for today');
        }
        
        return true;
    } catch (error) {
        console.error('System metrics initialization error:', error.message);
        return false;
    }
}

// ✅ Helper functions for safe data handling
function truncateForDatabase(value, maxLength = 255) {
    if (value === null || value === undefined) return null;
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return stringValue.length > maxLength ? stringValue.substring(0, maxLength - 3) + '...' : stringValue;
}

function processMetadata(contextData) {
    if (!contextData) return null;
    
    try {
        const metadata = typeof contextData === 'string' ? JSON.parse(contextData) : contextData;
        
        const safeMetadata = {
            aiUsed: truncateForDatabase(metadata.aiUsed || metadata.ai_used, 50),
            modelUsed: truncateForDatabase(metadata.modelUsed || metadata.model_used, 50),
            messageType: truncateForDatabase(metadata.messageType || metadata.message_type, 20),
            responseTime: metadata.responseTime || metadata.response_time || 0,
            processingTime: metadata.processingTime || metadata.processing_time || 0,
            memoryUsed: metadata.memoryUsed || false,
            timestamp: metadata.timestamp || new Date().toISOString()
        };
        
        return JSON.stringify(safeMetadata);
    } catch (error) {
        console.log('⚠️ Metadata processing error:', error.message);
        return JSON.stringify({
            error: 'Metadata processing failed',
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * 💾 SAVE CONVERSATION TO DATABASE
 */
async function saveConversationDB(chatId, userMessage, gptResponse, contextData = null) {
    try {
        const startTime = Date.now();
        
        // Process and truncate data safely
        const safeUserMessage = truncateForDatabase(userMessage, 10000);
        const safeGptResponse = truncateForDatabase(gptResponse, 50000);
        const safeContextData = processMetadata(contextData);
        const responseTime = Date.now() - startTime;
        
        console.log(`[DB-SAVE] Saving conversation for ${chatId}`);
        console.log(`[DB-SAVE] User message: ${safeUserMessage.substring(0, 50)}...`);
        console.log(`[DB-SAVE] Response length: ${safeGptResponse.length} chars`);
        
        await pool.query(
            `INSERT INTO conversations (chat_id, user_message, gpt_response, context_data, response_time_ms) 
             VALUES ($1, $2, $3, $4, $5)`,
            [chatId, safeUserMessage, safeGptResponse, safeContextData, responseTime]
        );
        
        // Update user profile
        await pool.query(`
            INSERT INTO user_profiles (chat_id, conversation_count, last_seen) 
            VALUES ($1, 1, CURRENT_TIMESTAMP)
            ON CONFLICT (chat_id) 
            DO UPDATE SET 
                conversation_count = user_profiles.conversation_count + 1,
                last_seen = CURRENT_TIMESTAMP
        `, [chatId]);
        
        // Cleanup old conversations (keep last 100 per user)
        await pool.query(`
            DELETE FROM conversations 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM conversations 
                WHERE chat_id = $1 
                ORDER BY timestamp DESC 
                LIMIT 100
            )
        `, [chatId]);
        
        connectionStats.successfulQueries++;
        console.log(`[DB-SAVE] ✅ Conversation saved successfully for ${chatId}`);
        return true;
        
    } catch (error) {
        console.error('[DB-SAVE] ❌ Save conversation error:', error.message);
        connectionStats.failedQueries++;
        connectionStats.lastError = error.message;
        return false;
    }
}

// ALIAS FUNCTION - This is what your dualCommandSystem is trying to call
async function saveConversation(chatId, userMessage, gptResponse, contextData = null) {
    return await saveConversationDB(chatId, userMessage, gptResponse, contextData);
}

/**
 * 📚 GET CONVERSATION HISTORY
 */
async function getConversationHistoryDB(chatId, limit = 10) {
    try {
        console.log(`[DB-GET] Getting conversation history for ${chatId}, limit: ${limit}`);
        
        const result = await pool.query(
            'SELECT user_message, gpt_response, message_type, context_data, timestamp FROM conversations WHERE chat_id = $1 ORDER BY timestamp DESC LIMIT $2',
            [chatId, limit]
        );
        
        console.log(`[DB-GET] Found ${result.rows.length} conversations for ${chatId}`);
        
        connectionStats.successfulQueries++;
        return result.rows.reverse(); // Return in chronological order
        
    } catch (error) {
        console.error('[DB-GET] Get history error:', error.message);
        connectionStats.failedQueries++;
        connectionStats.lastError = error.message;
        return [];
    }
}

/**
 * 🧠 ADD PERSISTENT MEMORY
 */
async function addPersistentMemoryDB(chatId, fact, importance = 'medium') {
    try {
        const safeFact = truncateForDatabase(fact, 2000);
        const safeImportance = truncateForDatabase(importance, 20);
        
        // Generate hash for deduplication
        const crypto = require('crypto');
        const factHash = crypto.createHash('sha256').update(safeFact.toLowerCase().trim()).digest('hex');
        
        // Check for duplicates
        const existing = await pool.query(
            'SELECT id FROM persistent_memories WHERE chat_id = $1 AND fact_hash = $2',
            [chatId, factHash]
        );
        
        if (existing.rows.length > 0) {
            // Update access count
            await pool.query(
                'UPDATE persistent_memories SET access_count = access_count + 1 WHERE id = $1',
                [existing.rows[0].id]
            );
            console.log(`[DB-MEMORY] Updated existing memory for ${chatId}`);
            return true;
        }
        
        await pool.query(
            'INSERT INTO persistent_memories (chat_id, fact, importance, fact_hash) VALUES ($1, $2, $3, $4)',
            [chatId, safeFact, safeImportance, factHash]
        );
        
        // Cleanup - keep only most important memories (limit 50 per user)
        await pool.query(`
            DELETE FROM persistent_memories 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM persistent_memories 
                WHERE chat_id = $1 
                ORDER BY 
                    CASE importance 
                        WHEN 'high' THEN 3 
                        WHEN 'medium' THEN 2 
                        WHEN 'low' THEN 1 
                    END DESC, 
                    access_count DESC,
                    timestamp DESC 
                LIMIT 50
            )
        `, [chatId]);
        
        console.log(`[DB-MEMORY] ✅ New memory saved for ${chatId}: ${safeFact.substring(0, 50)}...`);
        connectionStats.successfulQueries++;
        return true;
        
    } catch (error) {
        console.error('[DB-MEMORY] Add persistent memory error:', error.message);
        connectionStats.failedQueries++;
        connectionStats.lastError = error.message;
        return false;
    }
}

/**
 * 🧠 GET PERSISTENT MEMORIES
 */
async function getPersistentMemoryDB(chatId) {
    try {
        const result = await pool.query(
            'SELECT fact, importance, timestamp, access_count FROM persistent_memories WHERE chat_id = $1 ORDER BY importance DESC, access_count DESC, timestamp DESC',
            [chatId]
        );
        
        console.log(`[DB-MEMORY] Retrieved ${result.rows.length} memories for ${chatId}`);
        connectionStats.successfulQueries++;
        return result.rows;
        
    } catch (error) {
        console.error('[DB-MEMORY] Get persistent memory error:', error.message);
        connectionStats.failedQueries++;
        connectionStats.lastError = error.message;
        return [];
    }
}

/**
 * 👤 GET USER PROFILE
 */
async function getUserProfileDB(chatId) {
    try {
        const result = await pool.query(
            'SELECT * FROM user_profiles WHERE chat_id = $1',
            [chatId]
        );
        
        connectionStats.successfulQueries++;
        return result.rows[0] || null;
        
    } catch (error) {
        console.error('Get user profile error:', error.message);
        connectionStats.failedQueries++;
        return null;
    }
}

/**
 * 📄 SAVE TRAINING DOCUMENT
 */
async function saveTrainingDocumentDB(chatId, fileName, content, documentType = 'general', wordCount = 0, summary = '') {
    try {
        const safeFileName = truncateForDatabase(fileName, 255);
        const safeDocumentType = truncateForDatabase(documentType, 50);
        const safeSummary = truncateForDatabase(summary, 1000);
        const safeContent = content.substring(0, 50000); // Limit content to 50KB
        
        await pool.query(
            'INSERT INTO training_documents (chat_id, file_name, content, document_type, word_count, summary) VALUES ($1, $2, $3, $4, $5, $6)',
            [chatId, safeFileName, safeContent, safeDocumentType, wordCount, safeSummary]
        );
        
        // Cleanup - keep only last 20 documents per user
        await pool.query(`
            DELETE FROM training_documents 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM training_documents 
                WHERE chat_id = $1 
                ORDER BY upload_date DESC 
                LIMIT 20
            )
        `, [chatId]);
        
        connectionStats.successfulQueries++;
        console.log(`📄 Training document saved: ${safeFileName}`);
        return true;
        
    } catch (error) {
        console.error('Save training document error:', error.message);
        connectionStats.failedQueries++;
        return false;
    }
}

/**
 * 📄 GET TRAINING DOCUMENTS
 */
async function getTrainingDocumentsDB(chatId) {
    try {
        const result = await pool.query(
            'SELECT file_name, content, document_type, upload_date, word_count, summary FROM training_documents WHERE chat_id = $1 ORDER BY upload_date DESC',
            [chatId]
        );
        
        connectionStats.successfulQueries++;
        return result.rows;
        
    } catch (error) {
        console.error('Get training documents error:', error.message);
        connectionStats.failedQueries++;
        return [];
    }
}

/**
 * 🗑️ CLEAR USER DATA
 */
async function clearUserDataDB(chatId) {
    try {
        await Promise.all([
            pool.query('DELETE FROM conversations WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM persistent_memories WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM training_documents WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM user_profiles WHERE chat_id = $1', [chatId])
        ]);
        
        console.log(`🗑️ All data cleared for user ${chatId}`);
        connectionStats.successfulQueries++;
        return true;
        
    } catch (error) {
        console.error('Clear user data error:', error.message);
        connectionStats.failedQueries++;
        return false;
    }
}

/**
 * 📊 GET DATABASE STATISTICS
 */
async function getDatabaseStats() {
    try {
        const [users, conversations, memories, documents] = await Promise.all([
            pool.query('SELECT COUNT(DISTINCT chat_id) as count FROM user_profiles'),
            pool.query('SELECT COUNT(*) as count FROM conversations'),
            pool.query('SELECT COUNT(*) as count FROM persistent_memories'),
            pool.query('SELECT COUNT(*) as count FROM training_documents')
        ]);

        return {
            totalUsers: parseInt(users.rows[0].count),
            totalConversations: parseInt(conversations.rows[0].count),
            totalMemories: parseInt(memories.rows[0].count),
            totalDocuments: parseInt(documents.rows[0].count),
            connectionStats: connectionStats,
            storage: 'PostgreSQL Database (Core Functions)',
            connected: connectionStats.connectionHealth === 'HEALTHY',
            lastUpdated: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Get database stats error:', error.message);
        connectionStats.failedQueries++;
        return {
            totalUsers: 0,
            totalConversations: 0,
            totalMemories: 0,
            totalDocuments: 0,
            storage: 'Database Error',
            connected: false,
            error: error.message
        };
    }
}

/**
 * 📊 UPDATE SYSTEM METRICS
 */
async function updateSystemMetrics(metricUpdates) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const updateFields = Object.keys(metricUpdates)
            .map((key, index) => `${key} = ${key} + $${index + 2}`)
            .join(', ');
        
        const values = [today, ...Object.values(metricUpdates)];
        
        await pool.query(`
            UPDATE system_metrics 
            SET ${updateFields}, timestamp = CURRENT_TIMESTAMP
            WHERE metric_date = $1
        `, values);
        
        connectionStats.totalQueries++;
        return true;
        
    } catch (error) {
        console.error('Update system metrics error:', error.message);
        connectionStats.failedQueries++;
        return false;
    }
}

/**
 * 🔧 DATABASE CLEANUP
 */
async function cleanupOldData() {
    try {
        console.log('🧹 Starting database cleanup...');
        
        const cleanupResults = {
            conversationsDeleted: 0,
            memoriesDeleted: 0,
            documentsDeleted: 0
        };

        // Clean old conversations (keep last 3 months)
        const conversationsResult = await pool.query(`
            DELETE FROM conversations 
            WHERE timestamp < NOW() - INTERVAL '3 months'
        `);
        cleanupResults.conversationsDeleted = conversationsResult.rowCount;

        // Clean old low-importance memories (keep last 6 months for low importance)
        const memoriesResult = await pool.query(`
            DELETE FROM persistent_memories 
            WHERE timestamp < NOW() - INTERVAL '6 months' 
            AND importance = 'low'
        `);
        cleanupResults.memoriesDeleted = memoriesResult.rowCount;

        // Clean old documents (keep last 50 per user)
        const documentsResult = await pool.query(`
            DELETE FROM training_documents 
            WHERE upload_date < NOW() - INTERVAL '1 year'
        `);
        cleanupResults.documentsDeleted = documentsResult.rowCount;

        console.log('✅ Database cleanup completed:', cleanupResults);
        connectionStats.successfulQueries++;
        return cleanupResults;
        
    } catch (error) {
        console.error('Cleanup old data error:', error.message);
        connectionStats.failedQueries++;
        return { error: error.message };
    }
}

// Initialize database when module loads
initializeDatabase();

// Export all functions
module.exports = {
    // Core conversation functions
    saveConversationDB,
    saveConversation,  // ← ALIAS - This is what dualCommandSystem needs!
    getConversationHistoryDB,
    
    // Memory functions
    addPersistentMemoryDB,
    getPersistentMemoryDB,
    
    // User functions
    getUserProfileDB,
    
    // Document functions
    saveTrainingDocumentDB,
    getTrainingDocumentsDB,
    
    // Utility functions
    clearUserDataDB,
    getDatabaseStats,
    updateSystemMetrics,
    cleanupOldData,
    testDatabaseConnection,
    
    // Database utilities
    truncateForDatabase,
    processMetadata,
    
    // Connection monitoring
    connectionStats,
    pool
};

console.log('✅ Clean Database Module Loaded - Core Functions Only');
console.log('📊 Functions available:', Object.keys(module.exports).length);
console.log('🔗 Connection status:', connectionStats.connectionHealth);
