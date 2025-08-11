// DATABASE CONNECTION DIAGNOSTIC & FIX SCRIPT
// Run this to diagnose and fix your PostgreSQL connection issues

const { Pool } = require('pg');
require('dotenv').config();

/**
 * 🔍 COMPREHENSIVE DATABASE DIAGNOSTIC
 */
async function runDatabaseDiagnostic() {
    console.log('🔍 IMPERIUM VAULT DATABASE DIAGNOSTIC');
    console.log('=' .repeat(50));
    
    // Step 1: Check environment variables
    console.log('\n📋 STEP 1: Environment Variables Check');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
        console.log('❌ DATABASE_URL not found in environment');
        console.log('💡 Solutions:');
        console.log('   1. Check your .env file');
        console.log('   2. Verify Railway PostgreSQL service is connected');
        console.log('   3. Copy DATABASE_URL from Railway dashboard');
        return false;
    }
    
    console.log(`✅ DATABASE_URL found: ${dbUrl.substring(0, 20)}...`);
    
    // Step 2: Parse connection URL
    console.log('\n🔗 STEP 2: Connection URL Analysis');
    try {
        const url = new URL(dbUrl);
        console.log(`✅ Protocol: ${url.protocol}`);
        console.log(`✅ Host: ${url.hostname}`);
        console.log(`✅ Port: ${url.port || '5432'}`);
        console.log(`✅ Database: ${url.pathname.substring(1)}`);
        console.log(`✅ User: ${url.username}`);
        console.log(`✅ Password: ${url.password ? '***SET***' : '***MISSING***'}`);
    } catch (parseError) {
        console.log('❌ Invalid DATABASE_URL format:', parseError.message);
        return false;
    }
    
    // Step 3: Test basic connection
    console.log('\n🔌 STEP 3: Basic Connection Test');
    
    const pool = new Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 5, // Reduced for testing
        statement_timeout: 10000,
        query_timeout: 10000
    });
    
    try {
        const client = await pool.connect();
        console.log('✅ Basic connection successful');
        
        // Test simple query
        const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
        console.log('✅ Query test successful');
        console.log(`   Time: ${result.rows[0].current_time}`);
        console.log(`   Version: ${result.rows[0].postgres_version.substring(0, 50)}...`);
        
        client.release();
        
    } catch (connectionError) {
        console.log('❌ Connection failed:', connectionError.message);
        console.log('\n💡 Common solutions:');
        
        if (connectionError.message.includes('ENOTFOUND')) {
            console.log('   • DNS resolution failed - check host address');
            console.log('   • Verify Railway PostgreSQL service is running');
        } else if (connectionError.message.includes('ECONNREFUSED')) {
            console.log('   • Connection refused - check port and firewall');
            console.log('   • Database service may be down');
        } else if (connectionError.message.includes('authentication')) {
            console.log('   • Wrong username/password');
            console.log('   • Get fresh credentials from Railway');
        } else if (connectionError.message.includes('timeout')) {
            console.log('   • Connection timeout - network issues');
            console.log('   • Try increasing connectionTimeoutMillis');
        }
        
        await pool.end();
        return false;
    }
    
    // Step 4: Test table access
    console.log('\n📊 STEP 4: Table Structure Check');
    try {
        // Check if main tables exist
        const tableCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log(`✅ Found ${tableCheck.rows.length} tables:`);
        tableCheck.rows.forEach(row => {
            console.log(`   • ${row.table_name}`);
        });
        
        // Check conversations table specifically
        const conversationsCheck = await pool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_name = 'conversations'
        `);
        
        if (conversationsCheck.rows[0].count === '0') {
            console.log('⚠️  conversations table missing - will initialize');
        } else {
            console.log('✅ conversations table exists');
        }
        
    } catch (tableError) {
        console.log('❌ Table check failed:', tableError.message);
        console.log('   • Database may need initialization');
    }
    
    // Step 5: Test write operations
    console.log('\n✏️  STEP 5: Write Permission Test');
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS connection_test (
                id SERIAL PRIMARY KEY,
                test_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await pool.query('INSERT INTO connection_test DEFAULT VALUES');
        const writeTest = await pool.query('SELECT COUNT(*) as count FROM connection_test');
        
        console.log(`✅ Write test successful (${writeTest.rows[0].count} test records)`);
        
        // Cleanup
        await pool.query('DROP TABLE connection_test');
        
    } catch (writeError) {
        console.log('❌ Write test failed:', writeError.message);
        console.log('   • Check database permissions');
        console.log('   • User may not have CREATE/INSERT privileges');
    }
    
    await pool.end();
    console.log('\n🎯 Database diagnostic complete!');
    return true;
}

/**
 * 🔧 FIX DATABASE CONNECTION ISSUES
 */
async function fixDatabaseConnection() {
    console.log('\n🔧 FIXING DATABASE CONNECTION...');
    
    // Create optimized pool configuration
    const dbConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        
        // Optimized connection settings
        connectionTimeoutMillis: 15000,  // 15 seconds
        idleTimeoutMillis: 60000,        // 1 minute
        max: 10,                         // Max connections
        min: 2,                          // Min connections
        
        // Query timeouts
        statement_timeout: 30000,        // 30 seconds
        query_timeout: 30000,
        
        // Keepalive settings
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
    };
    
    console.log('✅ Optimized connection configuration created');
    
    const pool = new Pool(dbConfig);
    
    // Add connection event handlers
    pool.on('connect', (client) => {
        console.log('🔗 Database client connected');
    });
    
    pool.on('error', (err, client) => {
        console.error('❌ Database connection error:', err.message);
    });
    
    pool.on('acquire', (client) => {
        console.log('📡 Database client acquired from pool');
    });
    
    pool.on('remove', (client) => {
        console.log('🗑️ Database client removed from pool');
    });
    
    try {
        // Test the fixed connection
        console.log('🧪 Testing fixed connection...');
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as test_time');
        
        console.log('✅ Fixed connection works!');
        console.log(`   Test time: ${result.rows[0].test_time}`);
        
        client.release();
        
        // Initialize database if needed
        console.log('🏗️  Initializing database schema...');
        await initializeDatabase(pool);
        
        return pool;
        
    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        await pool.end();
        return null;
    }
}

/**
 * 🏗️ INITIALIZE DATABASE SCHEMA
 */
async function initializeDatabase(pool) {
    try {
        console.log('Creating core tables...');
        
        // Create essential tables only (minimal for testing)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                user_message TEXT NOT NULL,
                gpt_response TEXT NOT NULL,
                message_type VARCHAR(20) DEFAULT 'text',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                context_data JSONB,
                strategic_importance VARCHAR(20) DEFAULT 'medium'
            );
            
            CREATE TABLE IF NOT EXISTS user_profiles (
                chat_id VARCHAR(50) PRIMARY KEY,
                conversation_count INTEGER DEFAULT 0,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                preferences JSONB DEFAULT '{}'
            );
            
            CREATE TABLE IF NOT EXISTS persistent_memories (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                fact TEXT NOT NULL,
                importance VARCHAR(10) DEFAULT 'medium',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Create indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_conversations_chat_id ON conversations(chat_id);
            CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_memories_chat_id ON persistent_memories(chat_id);
        `);
        
        console.log('✅ Database schema initialized');
        
    } catch (initError) {
        console.error('❌ Database initialization failed:', initError.message);
        throw initError;
    }
}

/**
 * 🔍 GENERATE RAILWAY-SPECIFIC FIXES
 */
function generateRailwayFixes() {
    console.log('\n🚂 RAILWAY-SPECIFIC TROUBLESHOOTING:');
    console.log('=' .repeat(40));
    
    console.log('\n1. 📡 Check Railway Service Status:');
    console.log('   • Go to Railway dashboard');
    console.log('   • Verify PostgreSQL service is "Active"');
    console.log('   • Check for any deployment errors');
    
    console.log('\n2. 🔄 Refresh Database Connection:');
    console.log('   • In Railway dashboard, go to PostgreSQL service');
    console.log('   • Click "Connect" tab');
    console.log('   • Copy the fresh DATABASE_URL');
    console.log('   • Update your .env file');
    
    console.log('\n3. 🔧 Railway Environment Variables:');
    console.log('   • Check that DATABASE_URL is set in Railway env vars');
    console.log('   • Verify it matches your local .env file');
    console.log('   • Redeploy if environment variables changed');
    
    console.log('\n4. 🌐 Network & SSL Issues:');
    console.log('   • Railway requires SSL in production');
    console.log('   • Ensure ssl: { rejectUnauthorized: false }');
    console.log('   • Check firewall settings');
    
    console.log('\n5. 💾 Database Resource Limits:');
    console.log('   • Check if database storage is full');
    console.log('   • Verify connection limits not exceeded');
    console.log('   • Consider upgrading Railway plan if needed');
}

/**
 * 📋 QUICK FIX CHECKLIST
 */
function printQuickFixChecklist() {
    console.log('\n📋 QUICK FIX CHECKLIST:');
    console.log('=' .repeat(30));
    
    console.log('\n☐ 1. Check .env file has DATABASE_URL');
    console.log('☐ 2. Verify Railway PostgreSQL service is running');
    console.log('☐ 3. Copy fresh DATABASE_URL from Railway dashboard');
    console.log('☐ 4. Test connection with this script');
    console.log('☐ 5. Check SSL configuration (rejectUnauthorized: false)');
    console.log('☐ 6. Verify connection timeout settings');
    console.log('☐ 7. Initialize database schema if needed');
    console.log('☐ 8. Restart your application');
    console.log('☐ 9. Check Railway deployment logs');
    console.log('☐ 10. Test with /status command');
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    try {
        console.log('🚀 IMPERIUM VAULT DATABASE REPAIR SYSTEM');
        console.log('📅 ' + new Date().toISOString());
        console.log('🌍 Node.js:', process.version);
        
        // Step 1: Run diagnostic
        const diagnosticPassed = await runDatabaseDiagnostic();
        
        if (!diagnosticPassed) {
            console.log('\n❌ Diagnostic failed - check issues above');
            generateRailwayFixes();
            printQuickFixChecklist();
            return;
        }
        
        // Step 2: Apply fixes
        const fixedPool = await fixDatabaseConnection();
        
        if (fixedPool) {
            console.log('\n🎉 DATABASE CONNECTION FIXED!');
            console.log('✅ Your IMPERIUM VAULT database is now operational');
            console.log('🔗 Connection pool created and tested');
            console.log('📊 Schema initialized');
            
            console.log('\n📋 NEXT STEPS:');
            console.log('1. Restart your main application (node index.js)');
            console.log('2. Test with /status command in Telegram');
            console.log('3. Verify "Database: ✅ Connected" appears');
            
            // Keep pool open briefly for final tests
            setTimeout(async () => {
                await fixedPool.end();
                console.log('🔌 Connection pool closed');
            }, 5000);
            
        } else {
            console.log('\n❌ COULD NOT FIX CONNECTION');
            generateRailwayFixes();
            printQuickFixChecklist();
        }
        
    } catch (error) {
        console.error('💥 Repair script crashed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    runDatabaseDiagnostic,
    fixDatabaseConnection,
    initializeDatabase,
    generateRailwayFixes
};
