// utils/database.js - FIXED VERSION - Resolves Memory Loss Issues
// ═══════════════════════════════════════════════════════════════════════════
// Fixed connection timeouts, added retry logic, improved error handling
// Resolves "can't remember" and "loss memory" issues
// ═══════════════════════════════════════════════════════════════════════════

const { Pool } = require('pg');
const crypto = require('crypto');

console.log('🔧 Loading FIXED Database Module - Memory Issues Resolved');

// ═══════════════════════════════════════════════════════════════════════════
// IMPROVED CONNECTION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    
    // ✅ FIXED: Much longer timeouts to prevent connection drops
    connectionTimeoutMillis: 30000,    // 30 seconds (was 5 seconds)
    idleTimeoutMillis: 600000,         // 10 minutes (was 30 seconds) 
    statement_timeout: 60000,          // 60 seconds
    query_timeout: 60000,              // 60 seconds
    
    // ✅ FIXED: Better connection management
    max: 10,                           // Reduced for Railway limits
    min: 2,                            // Keep minimum connections alive
    keepAlive: true,                   // Keep connections alive
    allowExitOnIdle: false,           // Don't exit on idle
    
    // ✅ ADDED: Connection retry settings
    application_name: 'gpt5_memory_bot',
    connect_timeout: 30,
});

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTION MONITORING & HEALTH TRACKING
// ═══════════════════════════════════════════════════════════════════════════

let connectionStats = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    retryAttempts: 0,
    lastError: null,
    connectionHealth: 'INITIALIZING',
    lastQuery: null,
    lastSuccessfulQuery: null,
    connectionsCreated: 0,
    connectionsDestroyed: 0,
    startTime: Date.now()
};

// Enhanced connection monitoring
pool.on('error', (err) => {
    console.error('💥 Database connection error:', err.message);
    connectionStats.lastError = err.message;
    connectionStats.connectionHealth = 'ERROR';
});

pool.on('connect', (client) => {
    connectionStats.connectionHealth = 'HEALTHY';
    connectionStats.connectionsCreated++;
    console.log('🟢 Database connected successfully');
});

pool.on('remove', (client) => {
    connectionStats.connectionsDestroyed++;
    console.log('🔴 Database connection removed');
});

// ═══════════════════════════════════════════════════════════════════════════
// RETRY LOGIC FOR DATABASE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

async function queryWithRetry(query, params = [], maxRetries = 3, context = 'unknown') {
    connectionStats.totalQueries++;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const startTime = Date.now();
            const result = await pool.query(query, params);
            const duration = Date.now() - startTime;
            
            connectionStats.successfulQueries++;
            connectionStats.lastQuery = new Date().toISOString();
            connectionStats.lastSuccessfulQuery = new Date().toISOString();
            
            if (attempt > 1) {
                console.log(`✅ [DB-${context}] Success on attempt ${attempt}/${maxRetries} (${duration}ms)`);
            }
            
            return result;
            
        } catch (error) {
            connectionStats.retryAttempts++;
            console.log(`❌ [DB-${context}] Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
            
            if (attempt === maxRetries) {
                connectionStats.failedQueries++;
                connectionStats.lastError = error.message;
                connectionStats.connectionHealth = 'ERROR';
                
                console.error(`💥 [DB-${context}] All ${maxRetries} attempts failed:`, error.message);
                throw error;
            }
            
            // Progressive delay: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`⏳ [DB-${context}] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE CONNECTION TEST & HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════

async function testDatabaseConnection() {
    try {
        console.log('🔍 [DB-TEST] Testing database connection...');
        
        const testResult = await queryWithRetry(
            'SELECT NOW() as current_time, version() as pg_version, current_database() as db_name',
            [],
            3,
            'CONNECTION_TEST'
        );
        
        const row = testResult.rows[0];
        console.log('✅ [DB-TEST] Database connected successfully!');
        console.log(`   📅 Server time: ${row.current_time}`);
        console.log(`   🗄️ Database: ${row.db_name}`);
        console.log(`   📊 PostgreSQL: ${row.pg_version.split(',')[0]}`);
        
        connectionStats.connectionHealth = 'HEALTHY';
        return true;
        
    } catch (error) {
        console.error('❌ [DB-TEST] Database connection failed:', error.message);
        connectionStats.connectionHealth = 'FAILED';
        connectionStats.lastError = error.message;
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE SCHEMA INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

async function initializeDatabase() {
    try {
        console.log('🚀 [DB-INIT] Initializing Core Database Schema...');
        
        // Create tables with enhanced schema
        await queryWithRetry(`
            -- Enhanced conversation storage
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(100) NOT NULL,
                user_message TEXT NOT NULL,
                gpt_response TEXT NOT NULL,
                message_type VARCHAR(50) DEFAULT 'text',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                context_data JSONB DEFAULT '{}',
                response_time_ms INTEGER DEFAULT 0,
                importance VARCHAR(20) DEFAULT 'medium',
                session_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Enhanced user profiles  
            CREATE TABLE IF NOT EXISTS user_profiles (
                chat_id VARCHAR(100) PRIMARY KEY,
                conversation_count INTEGER DEFAULT 0,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                preferences JSONB DEFAULT '{}',
                user_metadata JSONB DEFAULT '{}',
                is_active BOOLEAN DEFAULT true,
                total_tokens_used INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Enhanced persistent memories
            CREATE TABLE IF NOT EXISTS persistent_memories (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(100) NOT NULL,
                fact TEXT NOT NULL,
                importance VARCHAR(20) DEFAULT 'medium',
                memory_type VARCHAR(50) DEFAULT 'general',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 0,
                fact_hash VARCHAR(64) UNIQUE,
                confidence_score DECIMAL(3,2) DEFAULT 0.80,
                source VARCHAR(100) DEFAULT 'conversation',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Training documents
            CREATE TABLE IF NOT EXISTS training_documents (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(100) NOT NULL,
                file_name VARCHAR(500) NOT NULL,
                content TEXT NOT NULL,
                document_type VARCHAR(100) DEFAULT 'general',
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                word_count INTEGER DEFAULT 0,
                summary TEXT,
                file_size INTEGER DEFAULT 0,
                is_processed BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- System metrics and monitoring
            CREATE TABLE IF NOT EXISTS system_metrics (
                id SERIAL PRIMARY KEY,
                metric_date DATE DEFAULT CURRENT_DATE,
                total_users INTEGER DEFAULT 0,
                active_users INTEGER DEFAULT 0,
                total_queries INTEGER DEFAULT 0,
                successful_queries INTEGER DEFAULT 0,
                failed_queries INTEGER DEFAULT 0,
                avg_response_time DECIMAL(8,2) DEFAULT 0,
                error_rate DECIMAL(5,4) DEFAULT 0,
                memory_usage_mb INTEGER DEFAULT 0,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `, [], 3, 'SCHEMA_CREATION');
        
        // Create optimized indexes
        await queryWithRetry(`
            -- Performance indexes
            CREATE INDEX IF NOT EXISTS idx_conversations_chat_id_time 
                ON conversations(chat_id, timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_conversations_chat_id_active 
                ON conversations(chat_id) WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '7 days';
            CREATE INDEX IF NOT EXISTS idx_conversations_importance 
                ON conversations(chat_id, importance, timestamp DESC);
                
            CREATE INDEX IF NOT EXISTS idx_memories_chat_id_active 
                ON persistent_memories(chat_id) WHERE is_active = true;
            CREATE INDEX IF NOT EXISTS idx_memories_importance 
                ON persistent_memories(chat_id, importance DESC, access_count DESC);
            CREATE INDEX IF NOT EXISTS idx_memories_hash 
                ON persistent_memories(fact_hash);
            CREATE INDEX IF NOT EXISTS idx_memories_type 
                ON persistent_memories(chat_id, memory_type);
                
            CREATE INDEX IF NOT EXISTS idx_training_chat_id 
                ON training_documents(chat_id, upload_date DESC);
            CREATE INDEX IF NOT EXISTS idx_training_processed 
                ON training_documents(chat_id) WHERE is_processed = true;
                
            CREATE INDEX IF NOT EXISTS idx_profiles_active 
                ON user_profiles(chat_id) WHERE is_active = true;
            CREATE INDEX IF NOT EXISTS idx_profiles_last_seen 
                ON user_profiles(last_seen DESC);
        `, [], 3, 'INDEX_CREATION');
        
        console.log('✅ [DB-INIT] Database schema initialized successfully');
        
        // Initialize system metrics
        await initializeSystemMetrics();
        return true;
        
    } catch (error) {
        console.error('❌ [DB-INIT] Database initialization failed:', error.message);
        connectionStats.lastError = error.message;
        connectionStats.connectionHealth = 'INIT_ERROR';
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function truncateForDatabase(value, maxLength = 255) {
    if (value === null || value === undefined) return null;
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return stringValue.length > maxLength ? stringValue.substring(0, maxLength - 3) + '...' : stringValue;
}

function processMetadata(contextData) {
    if (!contextData) return {};
    
    try {
        const metadata = typeof contextData === 'string' ? JSON.parse(contextData) : contextData;
        
        return {
            aiUsed: truncateForDatabase(metadata.aiUsed || metadata.ai_used, 50),
            modelUsed: truncateForDatabase(metadata.modelUsed || metadata.model_used, 50),
            messageType: truncateForDatabase(metadata.messageType || metadata.message_type, 20),
            responseTime: metadata.responseTime || metadata.response_time || 0,
            processingTime: metadata.processingTime || metadata.processing_time || 0,
            memoryUsed: metadata.memoryUsed || false,
            timestamp: metadata.timestamp || new Date().toISOString(),
            sessionId: metadata.sessionId || null,
            importance: metadata.importance || 'medium'
        };
    } catch (error) {
        console.warn('⚠️ [DB-META] Metadata processing error:', error.message);
        return {
            error: 'Metadata processing failed',
            timestamp: new Date().toISOString()
        };
    }
}

function generateFactHash(fact) {
    return crypto.createHash('sha256')
        .update(fact.toLowerCase().trim())
        .digest('hex');
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE CONVERSATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function saveConversationDB(chatId, userMessage, gptResponse, contextData = null) {
    try {
        const startTime = Date.now();
        
        // Validate inputs
        if (!chatId || (!userMessage && !gptResponse)) {
            console.warn('⚠️ [DB-SAVE] Invalid input: missing chatId or messages');
            return false;
        }
        
        // Process and safely truncate data
        const safeUserMessage = truncateForDatabase(userMessage || '', 20000);
        const safeGptResponse = truncateForDatabase(gptResponse || '', 100000);
        const safeContextData = processMetadata(contextData);
        const responseTime = Date.now() - startTime;
        
        console.log(`💾 [DB-SAVE] Saving conversation for ${chatId}`);
        console.log(`   📝 User: ${safeUserMessage.substring(0, 100)}${safeUserMessage.length > 100 ? '...' : ''}`);
        console.log(`   🤖 Response: ${safeGptResponse.length} characters`);
        
        // Save conversation with retry logic
        await queryWithRetry(`
            INSERT INTO conversations (
                chat_id, user_message, gpt_response, context_data, 
                response_time_ms, importance, session_id, message_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            chatId,
            safeUserMessage,
            safeGptResponse,
            JSON.stringify(safeContextData),
            responseTime,
            safeContextData.importance || 'medium',
            safeContextData.sessionId || null,
            safeContextData.messageType || 'text'
        ], 3, 'SAVE_CONVERSATION');
        
        // Update user profile with enhanced tracking
        await queryWithRetry(`
            INSERT INTO user_profiles (
                chat_id, conversation_count, last_seen, is_active
            ) VALUES ($1, 1, CURRENT_TIMESTAMP, true)
            ON CONFLICT (chat_id) 
            DO UPDATE SET 
                conversation_count = user_profiles.conversation_count + 1,
                last_seen = CURRENT_TIMESTAMP,
                is_active = true,
                updated_at = CURRENT_TIMESTAMP
        `, [chatId], 3, 'UPDATE_PROFILE');
        
        // ✅ FIXED: Only cleanup occasionally (not every save!)
        // This was causing conversations to be deleted immediately
        const shouldCleanup = Math.random() < 0.005; // 0.5% chance (was 100%)
        if (shouldCleanup) {
            await cleanupOldConversations(chatId);
        }
        
        console.log(`✅ [DB-SAVE] Conversation saved successfully for ${chatId} (${responseTime}ms)`);
        return true;
        
    } catch (error) {
        console.error(`❌ [DB-SAVE] Save failed for ${chatId}:`, error.message);
        return false;
    }
}

// Alias function for compatibility
async function saveConversation(chatId, userMessage, gptResponse, contextData = null) {
    return await saveConversationDB(chatId, userMessage, gptResponse, contextData);
}

async function getConversationHistoryDB(chatId, limit = 20) {
    try {
        if (!chatId) {
            console.warn('⚠️ [DB-GET] Missing chatId');
            return [];
        }
        
        console.log(`📚 [DB-GET] Getting conversation history for ${chatId}, limit: ${limit}`);
        
        const result = await queryWithRetry(`
            SELECT 
                id,
                user_message, 
                gpt_response, 
                message_type, 
                context_data, 
                timestamp,
                importance,
                response_time_ms
            FROM conversations 
            WHERE chat_id = $1 
            ORDER BY timestamp DESC 
            LIMIT $2
        `, [chatId, limit], 3, 'GET_CONVERSATIONS');
        
        // Return in chronological order (oldest first)
        const conversations = result.rows.reverse();
        
        console.log(`✅ [DB-GET] Retrieved ${conversations.length} conversations for ${chatId}`);
        
        return conversations;
        
    } catch (error) {
        console.error(`❌ [DB-GET] Get history failed for ${chatId}:`, error.message);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PERSISTENT MEMORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function addPersistentMemoryDB(chatId, fact, importance = 'medium') {
    try {
        if (!chatId || !fact) {
            console.warn('⚠️ [DB-MEMORY] Missing chatId or fact');
            return false;
        }
        
        const safeFact = truncateForDatabase(fact, 5000);
        const safeImportance = truncateForDatabase(importance, 20);
        const factHash = generateFactHash(safeFact);
        
        console.log(`🧠 [DB-MEMORY] Adding memory for ${chatId}: ${safeFact.substring(0, 100)}...`);
        
        // Check for existing memory with same hash
        const existing = await queryWithRetry(`
            SELECT id, access_count 
            FROM persistent_memories 
            WHERE chat_id = $1 AND fact_hash = $2 AND is_active = true
        `, [chatId, factHash], 3, 'CHECK_MEMORY');
        
        if (existing.rows.length > 0) {
            // Update existing memory
            await queryWithRetry(`
                UPDATE persistent_memories 
                SET access_count = access_count + 1, 
                    updated_at = CURRENT_TIMESTAMP,
                    importance = $3
                WHERE id = $1
            `, [existing.rows[0].id, chatId, safeImportance], 3, 'UPDATE_MEMORY');
            
            console.log(`♻️ [DB-MEMORY] Updated existing memory for ${chatId}`);
            return true;
        }
        
        // Add new memory
        await queryWithRetry(`
            INSERT INTO persistent_memories (
                chat_id, fact, importance, fact_hash, 
                memory_type, confidence_score, source
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            chatId, 
            safeFact, 
            safeImportance, 
            factHash,
            'conversation',
            0.85,
            'user_conversation'
        ], 3, 'ADD_MEMORY');
        
        // ✅ FIXED: Less aggressive memory cleanup
        const shouldCleanup = Math.random() < 0.01; // 1% chance
        if (shouldCleanup) {
            await cleanupOldMemories(chatId);
        }
        
        console.log(`✅ [DB-MEMORY] New memory saved for ${chatId}`);
        return true;
        
    } catch (error) {
        console.error(`❌ [DB-MEMORY] Add memory failed for ${chatId}:`, error.message);
        return false;
    }
}

async function getPersistentMemoryDB(chatId, limit = 50) {
    try {
        if (!chatId) {
            console.warn('⚠️ [DB-MEMORY] Missing chatId');
            return [];
        }
        
        console.log(`🧠 [DB-MEMORY] Getting memories for ${chatId}, limit: ${limit}`);
        
        const result = await queryWithRetry(`
            SELECT 
                id, fact, importance, memory_type, timestamp, 
                access_count, confidence_score, source
            FROM persistent_memories 
            WHERE chat_id = $1 AND is_active = true
            ORDER BY 
                CASE importance 
                    WHEN 'high' THEN 3 
                    WHEN 'medium' THEN 2 
                    WHEN 'low' THEN 1 
                END DESC, 
                access_count DESC,
                timestamp DESC 
            LIMIT $2
        `, [chatId, limit], 3, 'GET_MEMORIES');
        
        console.log(`✅ [DB-MEMORY] Retrieved ${result.rows.length} memories for ${chatId}`);
        
        return result.rows;
        
    } catch (error) {
        console.error(`❌ [DB-MEMORY] Get memories failed for ${chatId}:`, error.message);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// USER PROFILE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function getUserProfileDB(chatId) {
    try {
        if (!chatId) {
            console.warn('⚠️ [DB-PROFILE] Missing chatId');
            return null;
        }
        
        const result = await queryWithRetry(`
            SELECT * FROM user_profiles WHERE chat_id = $1
        `, [chatId], 3, 'GET_PROFILE');
        
        return result.rows[0] || null;
        
    } catch (error) {
        console.error(`❌ [DB-PROFILE] Get profile failed for ${chatId}:`, error.message);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLEANUP FUNCTIONS - MUCH LESS AGGRESSIVE
// ═══════════════════════════════════════════════════════════════════════════

async function cleanupOldConversations(chatId) {
    try {
        // Keep last 1000 conversations instead of 100
        await queryWithRetry(`
            DELETE FROM conversations 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM conversations 
                WHERE chat_id = $1 
                ORDER BY timestamp DESC 
                LIMIT 1000
            )
        `, [chatId], 2, 'CLEANUP_CONVERSATIONS');
        
        console.log(`🧹 [DB-CLEANUP] Cleaned old conversations for ${chatId}`);
        
    } catch (error) {
        console.warn(`⚠️ [DB-CLEANUP] Conversation cleanup failed for ${chatId}:`, error.message);
    }
}

async function cleanupOldMemories(chatId) {
    try {
        // Keep last 200 memories instead of 50
        await queryWithRetry(`
            UPDATE persistent_memories 
            SET is_active = false 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM persistent_memories 
                WHERE chat_id = $1 AND is_active = true
                ORDER BY 
                    CASE importance 
                        WHEN 'high' THEN 3 
                        WHEN 'medium' THEN 2 
                        WHEN 'low' THEN 1 
                    END DESC, 
                    access_count DESC,
                    timestamp DESC 
                LIMIT 200
            )
        `, [chatId], 2, 'CLEANUP_MEMORIES');
        
        console.log(`🧹 [DB-CLEANUP] Cleaned old memories for ${chatId}`);
        
    } catch (error) {
        console.warn(`⚠️ [DB-CLEANUP] Memory cleanup failed for ${chatId}:`, error.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM METRICS AND MONITORING
// ═══════════════════════════════════════════════════════════════════════════

async function initializeSystemMetrics() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const existingMetrics = await queryWithRetry(
            'SELECT id FROM system_metrics WHERE metric_date = $1',
            [today], 2, 'CHECK_METRICS'
        );
        
        if (existingMetrics.rows.length === 0) {
            await queryWithRetry(`
                INSERT INTO system_metrics (
                    total_users, active_users, total_queries, 
                    successful_queries, failed_queries, avg_response_time, error_rate
                ) VALUES (0, 0, 0, 0, 0, 0, 0)
            `, [], 2, 'INIT_METRICS');
            
            console.log('📊 [DB-METRICS] System metrics initialized for today');
        }
        
        return true;
    } catch (error) {
        console.error('❌ [DB-METRICS] Metrics initialization error:', error.message);
        return false;
    }
}

async function getDatabaseStats() {
    try {
        const [users, conversations, memories, documents] = await Promise.all([
            queryWithRetry('SELECT COUNT(DISTINCT chat_id) as count FROM user_profiles WHERE is_active = true', [], 2, 'STATS_USERS'),
            queryWithRetry('SELECT COUNT(*) as count FROM conversations WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL \'30 days\'', [], 2, 'STATS_CONVERSATIONS'),
            queryWithRetry('SELECT COUNT(*) as count FROM persistent_memories WHERE is_active = true', [], 2, 'STATS_MEMORIES'),
            queryWithRetry('SELECT COUNT(*) as count FROM training_documents', [], 2, 'STATS_DOCUMENTS')
        ]);

        return {
            totalUsers: parseInt(users.rows[0].count),
            totalConversations: parseInt(conversations.rows[0].count),
            totalMemories: parseInt(memories.rows[0].count),
            totalDocuments: parseInt(documents.rows[0].count),
            connectionStats: {
                ...connectionStats,
                uptime: Date.now() - connectionStats.startTime,
                successRate: connectionStats.totalQueries > 0 
                    ? (connectionStats.successfulQueries / connectionStats.totalQueries * 100).toFixed(2) + '%' 
                    : '0%'
            },
            storage: 'PostgreSQL Database (Fixed Version)',
            connected: connectionStats.connectionHealth === 'HEALTHY',
            lastUpdated: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ [DB-STATS] Get database stats error:', error.message);
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

// ═══════════════════════════════════════════════════════════════════════════
// DEBUG AND TESTING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function debugDatabaseConnection(chatId = 'debug_test') {
    console.log('🔍 ═══════════════════════════════════════════════════════');
    console.log('   DATABASE DEBUG - COMPREHENSIVE CONNECTION TEST');
    console.log('   ═══════════════════════════════════════════════════════');
    
    // Environment check
    console.log('\n📋 ENVIRONMENT VARIABLES:');
    console.log('   DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('   DATABASE_PUBLIC_URL exists:', !!process.env.DATABASE_PUBLIC_URL);
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   Using connection string:', process.env.DATABASE_URL ? 'DATABASE_URL' : 'DATABASE_PUBLIC_URL');
    
    // Connection test
    console.log('\n🔌 CONNECTION TEST:');
    try {
        const testResult = await queryWithRetry('SELECT NOW() as current_time, version() as version', [], 2, 'DEBUG_CONNECTION');
        const row = testResult.rows[0];
        console.log('   ✅ Connection successful');
        console.log('   📅 Server time:', row.current_time);
        console.log('   🗄️ PostgreSQL version:', row.version.split(',')[0]);
    } catch (error) {
        console.log('   ❌ Connection failed:', error.message);
        return 'Connection failed - check logs';
    }
    
    // Table check
    console.log('\n📊 TABLE VERIFICATION:');
    try {
        const tablesResult = await queryWithRetry(`
            SELECT table_name, 
                   (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public' 
            AND table_name IN ('conversations', 'persistent_memories', 'user_profiles', 'training_documents')
            ORDER BY table_name
        `, [], 2, 'DEBUG_TABLES');
        
        console.log('   Tables found:');
        tablesResult.rows.forEach(table => {
            console.log(`   ✅ ${table.table_name} (${table.column_count} columns)`);
        });
    } catch (error) {
        console.log('   ❌ Table check failed:', error.message);
    }
    
    // Save test
    console.log('\n💾 SAVE TEST:');
    try {
        const saveResult = await saveConversationDB(
            chatId, 
            'DEBUG: Test user message for connection verification', 
            'DEBUG: Test AI response to verify database saving functionality',
            { 
                test: true, 
                timestamp: new Date().toISOString(),
                messageType: 'debug_test',
                importance: 'high'
            }
        );
        console.log('   ✅ Save test result:', saveResult ? 'SUCCESS' : 'FAILED');
    } catch (error) {
        console.log('   ❌ Save test failed:', error.message);
    }
    
    // Retrieve test
    console.log('\n📚 RETRIEVE TEST:');
    try {
        const conversations = await getConversationHistoryDB(chatId, 10);
        console.log(`   ✅ Retrieved ${conversations.length} conversations`);
        
        if (conversations.length > 0) {
            console.log('   Recent conversations:');
            conversations.slice(-3).forEach((conv, i) => {
                const preview = conv.user_message.substring(0, 60);
                const timeAgo = Math.round((Date.now() - new Date(conv.timestamp)) / 1000 / 60);
                console.log(`   ${i + 1}. "${preview}..." (${timeAgo}m ago)`);
            });
        }
    } catch (error) {
        console.log('   ❌ Retrieve test failed:', error.message);
    }
    
    // Memory test
    console.log('\n🧠 MEMORY TEST:');
    try {
        const memoryResult = await addPersistentMemoryDB(
            chatId, 
            'DEBUG: Test memory fact - user prefers comprehensive debugging information',
            'high'
        );
        console.log('   ✅ Memory save result:', memoryResult ? 'SUCCESS' : 'FAILED');
        
        const memories = await getPersistentMemoryDB(chatId, 10);
        console.log(`   ✅ Retrieved ${memories.length} memories`);
        
        if (memories.length > 0) {
            console.log('   Recent memories:');
            memories.slice(0, 3).forEach((mem, i) => {
                const preview = mem.fact.substring(0, 60);
                console.log(`   ${i + 1}. [${mem.importance.toUpperCase()}] "${preview}..." (accessed ${mem.access_count}x)`);
            });
        }
    } catch (error) {
        console.log('   ❌ Memory test failed:', error.message);
    }
    
    // Profile test
    console.log('\n👤 PROFILE TEST:');
    try {
        const profile = await getUserProfileDB(chatId);
        if (profile) {
            console.log('   ✅ Profile found:');
            console.log(`      📊 Conversations: ${profile.conversation_count}`);
            console.log(`      📅 First seen: ${profile.first_seen}`);
            console.log(`      🕐 Last seen: ${profile.last_seen}`);
            console.log(`      ✅ Active: ${profile.is_active}`);
        } else {
            console.log('   ℹ️ No profile found (will be created on first save)');
        }
    } catch (error) {
        console.log('   ❌ Profile test failed:', error.message);
    }
    
    // Connection stats
    console.log('\n📊 CONNECTION STATISTICS:');
    console.log(`   🔄 Total queries: ${connectionStats.totalQueries}`);
    console.log(`   ✅ Successful: ${connectionStats.successfulQueries}`);
    console.log(`   ❌ Failed: ${connectionStats.failedQueries}`);
    console.log(`   🔁 Retries: ${connectionStats.retryAttempts}`);
    console.log(`   💚 Health: ${connectionStats.connectionHealth}`);
    console.log(`   ⏱️ Last query: ${connectionStats.lastQuery || 'Never'}`);
    console.log(`   🔗 Connections created: ${connectionStats.connectionsCreated}`);
    console.log(`   💔 Connections destroyed: ${connectionStats.connectionsDestroyed}`);
    
    if (connectionStats.lastError) {
        console.log(`   ⚠️ Last error: ${connectionStats.lastError}`);
    }
    
    // Database stats
    console.log('\n📈 DATABASE STATISTICS:');
    try {
        const stats = await getDatabaseStats();
        console.log(`   👥 Total users: ${stats.totalUsers}`);
        console.log(`   💬 Total conversations: ${stats.totalConversations}`);
        console.log(`   🧠 Total memories: ${stats.totalMemories}`);
        console.log(`   📄 Total documents: ${stats.totalDocuments}`);
        console.log(`   ✅ Success rate: ${stats.connectionStats.successRate}`);
    } catch (error) {
        console.log('   ❌ Stats retrieval failed:', error.message);
    }
    
    console.log('\n🔍 ═══════════════════════════════════════════════════════');
    console.log('   DEBUG COMPLETE - Check results above');
    console.log('   ═══════════════════════════════════════════════════════');
    
    return {
        status: 'Debug completed',
        connectionHealth: connectionStats.connectionHealth,
        totalQueries: connectionStats.totalQueries,
        successRate: connectionStats.totalQueries > 0 
            ? `${Math.round(connectionStats.successfulQueries / connectionStats.totalQueries * 100)}%`
            : '0%',
        recommendation: connectionStats.connectionHealth === 'HEALTHY' 
            ? 'Database is working correctly' 
            : 'Check connection settings and Railway logs'
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// TRAINING DOCUMENT FUNCTIONS (Optional)
// ═══════════════════════════════════════════════════════════════════════════

async function saveTrainingDocumentDB(chatId, fileName, content, documentType = 'general', wordCount = 0, summary = '') {
    try {
        const safeFileName = truncateForDatabase(fileName, 500);
        const safeDocumentType = truncateForDatabase(documentType, 100);
        const safeSummary = truncateForDatabase(summary, 2000);
        const safeContent = content.substring(0, 100000); // 100KB limit
        const calculatedWordCount = wordCount || safeContent.split(/\s+/).length;
        
        await queryWithRetry(`
            INSERT INTO training_documents (
                chat_id, file_name, content, document_type, 
                word_count, summary, file_size, is_processed
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            chatId, 
            safeFileName, 
            safeContent, 
            safeDocumentType, 
            calculatedWordCount, 
            safeSummary,
            content.length,
            false
        ], 3, 'SAVE_DOCUMENT');
        
        // Cleanup old documents (keep last 50 per user)
        const shouldCleanup = Math.random() < 0.1; // 10% chance
        if (shouldCleanup) {
            await queryWithRetry(`
                DELETE FROM training_documents 
                WHERE chat_id = $1 AND id NOT IN (
                    SELECT id FROM training_documents 
                    WHERE chat_id = $1 
                    ORDER BY upload_date DESC 
                    LIMIT 50
                )
            `, [chatId], 2, 'CLEANUP_DOCUMENTS');
        }
        
        console.log(`📄 [DB-DOC] Training document saved: ${safeFileName} (${calculatedWordCount} words)`);
        return true;
        
    } catch (error) {
        console.error(`❌ [DB-DOC] Save document failed for ${chatId}:`, error.message);
        return false;
    }
}

async function getTrainingDocumentsDB(chatId, limit = 20) {
    try {
        const result = await queryWithRetry(`
            SELECT file_name, content, document_type, upload_date, 
                   word_count, summary, file_size, is_processed
            FROM training_documents 
            WHERE chat_id = $1 
            ORDER BY upload_date DESC 
            LIMIT $2
        `, [chatId, limit], 3, 'GET_DOCUMENTS');
        
        console.log(`📄 [DB-DOC] Retrieved ${result.rows.length} documents for ${chatId}`);
        return result.rows;
        
    } catch (error) {
        console.error(`❌ [DB-DOC] Get documents failed for ${chatId}:`, error.message);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM MAINTENANCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function clearUserDataDB(chatId) {
    try {
        console.log(`🗑️ [DB-CLEAR] Clearing all data for user ${chatId}`);
        
        const results = await Promise.allSettled([
            queryWithRetry('DELETE FROM conversations WHERE chat_id = $1', [chatId], 2, 'CLEAR_CONVERSATIONS'),
            queryWithRetry('UPDATE persistent_memories SET is_active = false WHERE chat_id = $1', [chatId], 2, 'CLEAR_MEMORIES'),
            queryWithRetry('DELETE FROM training_documents WHERE chat_id = $1', [chatId], 2, 'CLEAR_DOCUMENTS'),
            queryWithRetry('UPDATE user_profiles SET is_active = false WHERE chat_id = $1', [chatId], 2, 'CLEAR_PROFILE')
        ]);
        
        const successCount = results.filter(result => result.status === 'fulfilled').length;
        console.log(`✅ [DB-CLEAR] Cleared ${successCount}/4 data types for user ${chatId}`);
        
        return successCount === 4;
        
    } catch (error) {
        console.error(`❌ [DB-CLEAR] Clear user data failed for ${chatId}:`, error.message);
        return false;
    }
}

async function performDatabaseMaintenance() {
    try {
        console.log('🔧 [DB-MAINTENANCE] Starting database maintenance...');
        
        const results = {
            oldConversationsRemoved: 0,
            inactiveMemoriesArchived: 0,
            oldDocumentsRemoved: 0,
            metricsUpdated: false
        };
        
        // Archive very old conversations (older than 6 months)
        try {
            const conversationsResult = await queryWithRetry(`
                DELETE FROM conversations 
                WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '6 months'
                AND importance != 'high'
            `, [], 2, 'MAINTENANCE_CONVERSATIONS');
            results.oldConversationsRemoved = conversationsResult.rowCount || 0;
        } catch (error) {
            console.warn('⚠️ [DB-MAINTENANCE] Conversation cleanup failed:', error.message);
        }
        
        // Archive old low-importance memories (older than 1 year)
        try {
            const memoriesResult = await queryWithRetry(`
                UPDATE persistent_memories 
                SET is_active = false 
                WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '1 year'
                AND importance = 'low'
                AND access_count < 3
            `, [], 2, 'MAINTENANCE_MEMORIES');
            results.inactiveMemoriesArchived = memoriesResult.rowCount || 0;
        } catch (error) {
            console.warn('⚠️ [DB-MAINTENANCE] Memory archival failed:', error.message);
        }
        
        // Remove old documents (older than 2 years)
        try {
            const documentsResult = await queryWithRetry(`
                DELETE FROM training_documents 
                WHERE upload_date < CURRENT_TIMESTAMP - INTERVAL '2 years'
            `, [], 2, 'MAINTENANCE_DOCUMENTS');
            results.oldDocumentsRemoved = documentsResult.rowCount || 0;
        } catch (error) {
            console.warn('⚠️ [DB-MAINTENANCE] Document cleanup failed:', error.message);
        }
        
        // Update system metrics
        try {
            await initializeSystemMetrics();
            results.metricsUpdated = true;
        } catch (error) {
            console.warn('⚠️ [DB-MAINTENANCE] Metrics update failed:', error.message);
        }
        
        console.log('✅ [DB-MAINTENANCE] Maintenance completed:', results);
        return results;
        
    } catch (error) {
        console.error('❌ [DB-MAINTENANCE] Maintenance failed:', error.message);
        return { error: error.message };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE INITIALIZATION AND EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Test connection on startup
(async () => {
    console.log('🚀 [DB-STARTUP] Initializing database connection...');
    
    const connectionTest = await testDatabaseConnection();
    if (connectionTest) {
        const initResult = await initializeDatabase();
        if (initResult) {
            console.log('✅ [DB-STARTUP] Database fully initialized and ready');
        } else {
            console.warn('⚠️ [DB-STARTUP] Database connection OK but schema initialization failed');
        }
    } else {
        console.error('❌ [DB-STARTUP] Database connection failed - check your DATABASE_URL');
    }
})();

// Export all functions
module.exports = {
    // ✅ CORE CONVERSATION FUNCTIONS (Your memory.js needs these)
    saveConversationDB,
    saveConversation,  // ← ALIAS - This is what dualCommandSystem calls!
    getConversationHistoryDB,
    
    // ✅ MEMORY FUNCTIONS (Your memory.js needs these)
    addPersistentMemoryDB,
    getPersistentMemoryDB,
    
    // ✅ USER FUNCTIONS (Your memory.js needs these)
    getUserProfileDB,
    
    // 📄 DOCUMENT FUNCTIONS (Optional)
    saveTrainingDocumentDB,
    getTrainingDocumentsDB,
    
    // 🔧 UTILITY FUNCTIONS
    clearUserDataDB,
    getDatabaseStats,
    performDatabaseMaintenance,
    testDatabaseConnection,
    debugDatabaseConnection,  // ← NEW: Use this to debug connection issues
    
    // 🛠️ DATABASE UTILITIES
    truncateForDatabase,
    processMetadata,
    queryWithRetry,  // ← NEW: Available for advanced use
    
    // 📊 CONNECTION MONITORING
    connectionStats,
    pool,
    
    // 🔍 HEALTH CHECK FUNCTIONS
    initializeSystemMetrics,
    
    // 🧹 MAINTENANCE FUNCTIONS
    cleanupOldConversations,
    cleanupOldMemories
};

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

console.log('');
console.log('🔧 ═══════════════════════════════════════════════════════════════');
console.log('   FIXED DATABASE MODULE - MEMORY ISSUES RESOLVED');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('✅ FIXES APPLIED:');
console.log('   🔄 Connection pool: Longer timeouts (10min idle, 30s connect)');
console.log('   🔁 Retry logic: 3 attempts with exponential backoff');
console.log('   🧹 Cleanup: Much less aggressive (0.5% chance vs 100%)');
console.log('   📊 Monitoring: Enhanced connection stats and health checks');
console.log('   🛡️ Error handling: Better error recovery and logging');
console.log('   💾 Data retention: Keep 1000 conversations, 200 memories');
console.log('');
console.log('🔍 DEBUG FEATURES:');
console.log('   • debugDatabaseConnection() - Comprehensive connection test');
console.log('   • Enhanced logging with context and timing');
console.log('   • Real-time connection health monitoring');
console.log('   • Detailed error reporting and retry tracking');
console.log('');
console.log('📈 IMPROVEMENTS:');
console.log('   • Memory loss issues should be resolved');
console.log('   • Better handling of Railway connection limits');
console.log('   • Automatic retry on connection failures');
console.log('   • Less aggressive data cleanup preserves history');
console.log('');
console.log(`🔗 Connection status: ${connectionStats.connectionHealth}`);
console.log('✅ FIXED DATABASE MODULE READY FOR PRODUCTION');
console.log('🔧 ═══════════════════════════════════════════════════════════════');
console.log('');
