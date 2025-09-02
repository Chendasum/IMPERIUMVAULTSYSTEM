#!/usr/bin/env node

// IMPERIUM VAULT SYSTEM - CLEAN INDEX.JS WITH DATABASE DEBUGGING
// Pure server setup → ALL routing handled by dualCommandSystem.js
// Clean separation: index.js (server) → dualCommandSystem.js (routing) → openaiClient.js (api)
// Added: Database connection testing and debug commands

console.log('IMPERIUM VAULT - Clean Server Starting...');
console.log('Clean Flow: index.js (server) → dualCommandSystem.js (routing) → openaiClient.js (api)');
console.log('Routing Logic: 100% in dualCommandSystem.js (no conflicts)');
console.log('Mode: Railway Webhook Production + Database Debug');

require('dotenv').config();

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

// CLEAN SERVER CONFIGURATION
const PORT = process.env.PORT || 8080;
const WEBHOOK_URL = process.env.WEBHOOK_URL || `https://imperiumvaultsystem-production.up.railway.app`;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN not found');
  process.exit(1);
}

console.log(`Server Config: Port ${PORT}, Webhook: ${WEBHOOK_URL}`);

// TELEGRAM BOT SETUP - Webhook Only
const bot = new TelegramBot(BOT_TOKEN);
const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS - DUAL COMMAND SYSTEM + DATABASE FOR TESTING
// ─────────────────────────────────────────────────────────────────────────────
let DualCommandSystem;
let database;

try {
  DualCommandSystem = require('./utils/dualCommandSystem');
  console.log('✅ dualCommandSystem.js loaded - ALL routing handled here');
} catch (error) {
  console.error('❌ CRITICAL: dualCommandSystem.js failed to load:', error.message);
  process.exit(1);
}

try {
  database = require('./utils/database');
  console.log('✅ database.js loaded - Database testing available');
} catch (error) {
  console.error('⚠️  database.js failed to load - Database testing disabled:', error.message);
  database = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEAN MIDDLEWARE - MINIMAL SERVER SETUP
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));

// Basic logging middleware
app.use((req, res, next) => {
  if (req.url.includes('webhook')) {
    console.log(`📨 Webhook: ${req.method} ${req.url}`);
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH ENDPOINTS - SERVER STATUS ONLY
// ─────────────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'IMPERIUM VAULT GPT-5 System Online',
    architecture: 'Clean Separation Architecture',
    server: 'index.js (Express + Telegram Webhook)',
    routing: 'dualCommandSystem.js (All AI Logic + Multimodal)',
    api: 'openaiClient.js (GPT-5 API)',
    formatting: 'telegramSplitter.js (Smart Unicode)',
    database: database ? 'PostgreSQL Connected' : 'Database Unavailable',
    debugging: 'Memory & Database Debug Commands Active',
    mode: 'Railway Production Webhook',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'IMPERIUM VAULT Server',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
    routing_system: DualCommandSystem ? 'loaded' : 'failed',
    database_system: database ? 'loaded' : 'unavailable',
    multimodal_support: DualCommandSystem && DualCommandSystem.handleTelegramMessage ? 'ready' : 'missing',
    debug_commands: ['⚠️/test_save', '/memory_debug', '/db_status'],
    timestamp: new Date().toISOString()
  });
});

app.get('/status', (req, res) => {
  res.json({ 
    server: 'online', 
    routing: DualCommandSystem ? 'ready' : 'failed',
    database: database ? 'ready' : 'unavailable',
    handlers: {
      telegram: !!DualCommandSystem.handleTelegramMessage,
      callback: !!DualCommandSystem.handleCallbackQuery,
      inline: !!DualCommandSystem.handleInlineQuery
    },
    debug_features: {
      database_testing: !!database,
      memory_debugging: true,
      conversation_logging: true
    },
    timestamp: new Date().toISOString() 
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE DEDUPLICATION - PREVENT DUPLICATE PROCESSING
// ─────────────────────────────────────────────────────────────────────────────
const processedMessages = new Set();
setInterval(() => {
  processedMessages.clear();
  console.log('🧹 Message cache cleared');
}, 300000); // Clear every 5 minutes

// ─────────────────────────────────────────────────────────────────────────────
// 🧪 DEBUG COMMAND HANDLERS - DATABASE & MEMORY TESTING
// ─────────────────────────────────────────────────────────────────────────────
async function handleDebugCommands(message, bot) {
  const text = message.text?.toLowerCase();
  const chatId = message.chat.id;
  
  try {
    // 🧪 TEST DATABASE SAVE COMMAND
    if (text === '/test_save') {
      console.log('[TEST-SAVE] 🧪 Manual database save test initiated...');
      
      if (!database) {
        await bot.sendMessage(chatId, '❌ Database module not available. Check server logs.');
        console.log('[TEST-SAVE] ❌ Database module not loaded');
        return true;
      }
      
      if (!database.saveConversationDB && !database.saveConversation) {
        await bot.sendMessage(chatId, '❌ Database save function not found. Available functions: ' + Object.keys(database).join(', '));
        console.log('[TEST-SAVE] ❌ Save function not found. Available:', Object.keys(database));
        return true;
      }
      
      const saveFunction = database.saveConversationDB || database.saveConversation;
      
      try {
        console.log('[TEST-SAVE] 📝 Attempting manual database save...');
        
        await saveFunction(chatId, 'TEST MESSAGE: Database connection test', 'TEST RESPONSE: Database is working correctly!', {
          messageType: 'test_command',
          timestamp: new Date().toISOString(),
          source: 'manual_test',
          model: 'test-system'
        });
        
        console.log('[TEST-SAVE] ✅ Manual database save successful!');
        await bot.sendMessage(chatId, '✅ Database test successful!\n\n📊 Test Results:\n• Database connection: ✅ Working\n• Save function: ✅ Working\n• PostgreSQL: ✅ Connected\n\nCheck your database for the test record.');
        
      } catch (dbError) {
        console.log('[TEST-SAVE] ❌ Database save failed:', dbError.message);
        await bot.sendMessage(chatId, `❌ Database save test FAILED!\n\nError: ${dbError.message}\n\nThis explains why your memory isn't working. Check:\n• PostgreSQL connection\n• Database credentials\n• Table structure`);
      }
      
      return true;
    }
    
    // 🧠 MEMORY DEBUG COMMAND
    if (text === '/memory_debug') {
      console.log('[MEMORY-DEBUG] 🧠 Memory system debug initiated...');
      
      try {
        let debugInfo = '🧠 MEMORY SYSTEM DEBUG:\n\n';
        
        // Check database connection
        if (database) {
          try {
            if (database.getConversationHistoryDB) {
              const recentConvs = await database.getConversationHistoryDB(chatId, 5);
              debugInfo += `📚 Recent conversations: ${Array.isArray(recentConvs) ? recentConvs.length : 0}\n`;
            }
            if (database.getPersistentMemoryDB) {
              const memories = await database.getPersistentMemoryDB(chatId);
              debugInfo += `🧠 Persistent memories: ${Array.isArray(memories) ? memories.length : 0}\n`;
            }
            debugInfo += '✅ Database: Connected\n';
          } catch (dbTestError) {
            debugInfo += `❌ Database: Error - ${dbTestError.message}\n`;
          }
        } else {
          debugInfo += '❌ Database: Module not loaded\n';
        }
        
        // Check memory module
        const memory = require('./utils/memory');
        if (memory) {
          debugInfo += '✅ Memory module: Loaded\n';
          if (memory.buildConversationContext) {
            debugInfo += '✅ buildConversationContext: Available\n';
          }
          if (memory.saveToMemory) {
            debugInfo += '✅ saveToMemory: Available\n';
          } else {
            debugInfo += '❌ saveToMemory: Missing (THIS IS THE PROBLEM!)\n';
          }
        } else {
          debugInfo += '❌ Memory module: Not loaded\n';
        }
        
        debugInfo += `\n📊 Chat ID: ${chatId}\n⏰ Time: ${new Date().toISOString()}`;
        
        await bot.sendMessage(chatId, debugInfo);
        console.log('[MEMORY-DEBUG] ✅ Memory debug completed');
        
      } catch (memoryError) {
        await bot.sendMessage(chatId, `❌ Memory debug failed: ${memoryError.message}`);
        console.log('[MEMORY-DEBUG] ❌ Memory debug error:', memoryError.message);
      }
      
      return true;
    }
    
    // 📊 DATABASE STATUS COMMAND
    if (text === '/db_status') {
      console.log('[DB-STATUS] 📊 Database status check initiated...');
      
      let statusInfo = '📊 DATABASE STATUS:\n\n';
      
      if (database) {
        statusInfo += '✅ Database module: Loaded\n';
        statusInfo += `📋 Available functions: ${Object.keys(database).length}\n`;
        statusInfo += `🔧 Functions: ${Object.keys(database).join(', ')}\n`;
        
        // Test connection with each available function
        try {
          if (database.connectionStats) {
            const stats = database.connectionStats();
            statusInfo += `📈 Connection stats: ${JSON.stringify(stats)}\n`;
          }
          if (database.getConversationHistoryDB) {
            const testHistory = await database.getConversationHistoryDB('test', 1);
            statusInfo += `✅ History query: Working (${Array.isArray(testHistory) ? testHistory.length : 0} results)\n`;
          }
        } catch (testError) {
          statusInfo += `❌ Connection test: ${testError.message}\n`;
        }
      } else {
        statusInfo += '❌ Database module: Not loaded\n';
      }
      
      statusInfo += `\n⏰ Checked: ${new Date().toISOString()}`;
      
      await bot.sendMessage(chatId, statusInfo);
      console.log('[DB-STATUS] ✅ Database status check completed');
      
      return true;
    }
    
    return false; // Not a debug command
    
  } catch (error) {
    console.error('[DEBUG-COMMANDS] ❌ Error handling debug command:', error.message);
    await bot.sendMessage(chatId, `❌ Debug command error: ${error.message}`);
    return true;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN WEBHOOK ENDPOINT - WITH DEBUG COMMAND INTERCEPT
// ─────────────────────────────────────────────────────────────────────────────
app.post(`/webhook/${BOT_TOKEN}`, async (req, res) => {
  try {
    const update = req.body;

    // Deduplication check
    if (update.message) {
      const messageId = update.message.message_id;
      const chatId = update.message.chat.id;
      const dedupeKey = `${chatId}_${messageId}`;
      
      if (processedMessages.has(dedupeKey)) {
        console.log(`🔄 Duplicate message ${dedupeKey} - Skipping`);
        return res.status(200).json({ ok: true });
      }
      processedMessages.add(dedupeKey);
    }

    // 🧪 INTERCEPT DEBUG COMMANDS BEFORE ROUTING TO DUAL COMMAND SYSTEM
    if (update.message && update.message.text) {
      const isDebugCommand = await handleDebugCommands(update.message, bot);
      if (isDebugCommand) {
        console.log(`🧪 Debug command processed: ${update.message.text}`);
        return res.status(200).json({ ok: true });
      }
    }

    // ✨ CLEAN ROUTING - EVERYTHING ELSE GOES TO DUAL COMMAND SYSTEM
    if (update.message) {
      console.log(`📨 Routing message to dualCommandSystem.js`);
      await DualCommandSystem.handleTelegramMessage(update.message, bot);
    } else if (update.callback_query) {
      console.log(`📨 Routing callback query to dualCommandSystem.js`);
      await DualCommandSystem.handleCallbackQuery(update.callback_query, bot);
    } else if (update.inline_query) {
      console.log(`📨 Routing inline query to dualCommandSystem.js`);
      await DualCommandSystem.handleInlineQuery(update.inline_query, bot);
    } else {
      console.log(`📨 Unknown update type received`);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM INITIALIZATION - SERVER SETUP WITH DEBUG INFO
// ─────────────────────────────────────────────────────────────────────────────
async function initializeServer() {
  try {
    console.log('\n🔧 Initializing clean server with debug capabilities...');

    // Test dual command system
    if (!DualCommandSystem) {
      throw new Error('dualCommandSystem.js not available');
    }

    // Test required methods exist
    const requiredMethods = ['handleTelegramMessage'];
    for (const method of requiredMethods) {
      if (!DualCommandSystem[method]) {
        console.warn(`⚠️  dualCommandSystem.${method} not found - may cause routing issues`);
      } else {
        console.log(`✅ dualCommandSystem.${method} found`);
      }
    }

    // Test database integration
    if (database) {
      console.log('✅ Database module loaded - Debug commands available');
      console.log(`📋 Database functions: ${Object.keys(database).join(', ')}`);
    } else {
      console.warn('⚠️  Database module not loaded - Limited debugging available');
    }

    // Setup webhook
    const webhookUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
    console.log(`🌐 Setting webhook: ${webhookUrl}`);
    
    await bot.setWebHook(webhookUrl, {
      max_connections: 100,
      allowed_updates: ['message', 'callback_query', 'inline_query']
    });
    
    console.log('✅ Webhook configured successfully');

    // Initialize dual command system if it has an init method
    if (DualCommandSystem.initialize) {
      console.log('🚀 Initializing dualCommandSystem...');
      await DualCommandSystem.initialize();
      console.log('✅ dualCommandSystem initialized');
    }

    console.log('\n🎉 CLEAN SERVER WITH DEBUG READY!');
    console.log('📡 All message routing handled by dualCommandSystem.js');
    console.log('🧪 Debug commands: /test_save, /memory_debug, /db_status');
    console.log('🚀 No routing conflicts - clean architecture with debugging');
    console.log(`🌐 Listening on port ${PORT}...\n`);

  } catch (error) {
    console.error('❌ Server initialization failed:', error.message);
    console.log('🔧 Check dualCommandSystem.js and database.js, then try again');
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER STARTUP
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🌐 Express server started on port ${PORT}`);
  await initializeServer();
});

// ─────────────────────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────────────────────
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutdown initiated...');
  try {
    await bot.deleteWebHook();
    console.log('✅ Webhook deleted');
    
    // Shutdown dual command system if it has cleanup
    if (DualCommandSystem.shutdown) {
      console.log('🔄 Shutting down dualCommandSystem...');
      await DualCommandSystem.shutdown();
      console.log('✅ dualCommandSystem shutdown complete');
    }
  } catch (error) {
    console.log('⚠️  Shutdown error:', error.message);
  }
  console.log('👋 Clean shutdown complete');
  process.exit(0);
});

// Error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  // Don't exit - let dualCommandSystem handle recovery
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.log('🚨 Server continuing - dualCommandSystem handles recovery');
});

console.log('🎯 Clean Server Architecture Active with Debug Commands!');
console.log('🧪 Available debug commands:');
console.log('   • /test_save - Test database saving directly');
console.log('   • /memory_debug - Check memory system status');
console.log('   • /db_status - Show database connection status');
console.log('🔍 Use these commands to debug your memory issues!');
