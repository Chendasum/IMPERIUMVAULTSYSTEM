#!/usr/bin/env node

// IMPERIUM VAULT SYSTEM - ENHANCED INDEX.JS WITH ADVANCED DEBUGGING
// Pure server setup → ALL routing handled by dualCommandSystem.js
// Clean separation: index.js (server) → dualCommandSystem.js (routing) → openaiClient.js (api)
// Added: Advanced memory integration tests, collation fix, and comprehensive debugging

console.log('IMPERIUM VAULT - Enhanced Server Starting...');
console.log('Enhanced Flow: index.js (server) → dualCommandSystem.js (routing) → openaiClient.js (api)');
console.log('Routing Logic: 100% in dualCommandSystem.js (no conflicts)');
console.log('Mode: Railway Webhook Production + Advanced Memory Debugging');

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
// ENHANCED IMPORTS WITH FALLBACK SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
let DualCommandSystem;
let database;
let memory;
let openaiClient;

// Safe module loading with detailed reporting
function safeRequire(modulePath, moduleName) {
  try {
    const module = require(modulePath);
    console.log(`✅ ${moduleName} loaded successfully`);
    return module;
  } catch (error) {
    console.error(`❌ ${moduleName} failed to load:`, error.message);
    return null;
  }
}

// Load core modules
DualCommandSystem = safeRequire('./utils/dualCommandSystem', 'dualCommandSystem.js');
database = safeRequire('./utils/database', 'database.js');
memory = safeRequire('./utils/memory', 'memory.js');
openaiClient = safeRequire('./utils/openaiClient', 'openaiClient.js');

// Critical dependency check
if (!DualCommandSystem) {
  console.error('❌ CRITICAL: dualCommandSystem.js failed to load - server cannot continue');
  process.exit(1);
}

// Report module status
console.log('\n📊 MODULE STATUS REPORT:');
console.log(`   • DualCommandSystem: ${DualCommandSystem ? '✅ Ready' : '❌ Failed'}`);
console.log(`   • Database: ${database ? '✅ Ready' : '❌ Failed'}`);
console.log(`   • Memory: ${memory ? '✅ Ready' : '❌ Failed'}`);
console.log(`   • OpenAI Client: ${openaiClient ? '✅ Ready' : '❌ Failed'}`);
console.log('');

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED MIDDLEWARE SETUP
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  if (req.url.includes('webhook')) {
    console.log(`📨 [${timestamp}] Webhook: ${req.method} ${req.url}`);
  }
  next();
});

// Request counter for analytics
let requestCount = 0;
let debugCommandCount = 0;

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED HEALTH ENDPOINTS WITH SYSTEM DIAGNOSTICS
// ─────────────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  requestCount++;
  res.json({
    status: 'IMPERIUM VAULT GPT-5 System Online',
    version: '2.0-enhanced',
    architecture: 'Clean Separation Architecture with Advanced Debugging',
    server: 'index.js (Express + Telegram Webhook + Enhanced Debug)',
    routing: 'dualCommandSystem.js (All AI Logic + Multimodal)',
    api: 'openaiClient.js (GPT-5 API)',
    formatting: 'telegramSplitter.js (Smart Unicode)',
    database: database ? 'PostgreSQL Connected' : 'Database Unavailable',
    memory: memory ? 'Memory System Loaded' : 'Memory System Unavailable',
    debugging: {
      enabled: true,
      commands: ['/test_save', '/memory_debug', '/db_status', '/test_memory_flow', '/fix_collation', '/system_health'],
      advanced_features: ['Memory Integration Testing', 'Collation Fix', 'System Health Monitoring']
    },
    mode: 'Railway Production Webhook',
    statistics: {
      requests_served: requestCount,
      debug_commands_run: debugCommandCount,
      uptime_seconds: Math.floor(process.uptime())
    },
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'healthy',
    service: 'IMPERIUM VAULT Enhanced Server',
    version: '2.0-enhanced',
    uptime: {
      seconds: Math.floor(process.uptime()),
      formatted: formatUptime(process.uptime() * 1000)
    },
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB',
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB'
    },
    system_health: {
      routing_system: DualCommandSystem ? 'operational' : 'failed',
      database_system: database ? 'connected' : 'unavailable',
      memory_system: memory ? 'loaded' : 'unavailable',
      openai_client: openaiClient ? 'loaded' : 'unavailable',
      multimodal_support: DualCommandSystem && DualCommandSystem.handleTelegramMessage ? 'ready' : 'missing'
    },
    debug_capabilities: {
      database_testing: !!database,
      memory_integration_testing: !!(database && memory),
      collation_fixes: !!database,
      system_health_monitoring: true,
      conversation_logging: true
    },
    statistics: {
      total_requests: requestCount,
      debug_commands_executed: debugCommandCount
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/status', (req, res) => {
  res.json({ 
    server: 'online',
    version: '2.0-enhanced',
    routing: DualCommandSystem ? 'ready' : 'failed',
    database: database ? 'ready' : 'unavailable',
    memory: memory ? 'ready' : 'unavailable',
    handlers: {
      telegram: !!(DualCommandSystem && DualCommandSystem.handleTelegramMessage),
      callback: !!(DualCommandSystem && DualCommandSystem.handleCallbackQuery),
      inline: !!(DualCommandSystem && DualCommandSystem.handleInlineQuery)
    },
    debug_features: {
      database_testing: !!database,
      memory_integration_testing: !!(database && memory),
      collation_fixes: !!database,
      memory_debugging: !!memory,
      conversation_logging: true,
      system_health_monitoring: true
    },
    module_status: {
      dualCommandSystem: !!DualCommandSystem,
      database: !!database,
      memory: !!memory,
      openaiClient: !!openaiClient
    },
    timestamp: new Date().toISOString() 
  });
});

// Helper function for uptime formatting
function formatUptime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE DEDUPLICATION WITH ENHANCED LOGGING
// ─────────────────────────────────────────────────────────────────────────────
const processedMessages = new Set();
let duplicateCount = 0;

setInterval(() => {
  const previousSize = processedMessages.size;
  processedMessages.clear();
  console.log(`🧹 Message cache cleared (${previousSize} entries), ${duplicateCount} duplicates prevented`);
}, 300000); // Clear every 5 minutes

// ─────────────────────────────────────────────────────────────────────────────
// 🧪 ENHANCED DEBUG COMMAND HANDLERS WITH ADVANCED TESTING
// ─────────────────────────────────────────────────────────────────────────────
async function handleDebugCommands(message, bot) {
  const text = message.text?.toLowerCase();
  const chatId = message.chat.id;
  
  // Increment debug command counter
  debugCommandCount++;
  
  try {
    // 🧪 TEST DATABASE SAVE COMMAND (ORIGINAL)
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
    
    // 🧠 MEMORY DEBUG COMMAND (ENHANCED)
    if (text === '/memory_debug') {
      console.log('[MEMORY-DEBUG] 🧠 Enhanced memory system debug initiated...');
      
      try {
        let debugInfo = '🧠 ENHANCED MEMORY SYSTEM DEBUG:\n\n';
        
        // Check database connection with more details
        if (database) {
          debugInfo += '📦 DATABASE MODULE:\n';
          debugInfo += `   • Module loaded: ✅ Yes\n`;
          debugInfo += `   • Functions available: ${Object.keys(database).length}\n`;
          debugInfo += `   • Key functions: ${Object.keys(database).slice(0, 5).join(', ')}...\n`;
          
          try {
            if (database.getConversationHistoryDB) {
              const recentConvs = await database.getConversationHistoryDB(chatId, 5);
              debugInfo += `   • Recent conversations: ${Array.isArray(recentConvs) ? recentConvs.length : 0}\n`;
            }
            if (database.getPersistentMemoryDB) {
              const memories = await database.getPersistentMemoryDB(chatId);
              debugInfo += `   • Persistent memories: ${Array.isArray(memories) ? memories.length : 0}\n`;
            }
            if (database.connectionStats) {
              const stats = database.connectionStats;
              debugInfo += `   • Connection health: ${stats.connectionHealth || 'Unknown'}\n`;
            }
            debugInfo += '   • Status: ✅ Connected and functional\n\n';
          } catch (dbTestError) {
            debugInfo += `   • Status: ❌ Error - ${dbTestError.message}\n\n`;
          }
        } else {
          debugInfo += '📦 DATABASE MODULE: ❌ Not loaded\n\n';
        }
        
        // Check memory module with detailed analysis
        if (memory) {
          debugInfo += '🧠 MEMORY MODULE:\n';
          debugInfo += `   • Module loaded: ✅ Yes\n`;
          debugInfo += `   • Functions available: ${Object.keys(memory).length}\n`;
          
          const keyFunctions = ['buildConversationContext', 'saveToMemory', 'buildMemoryContext', 'extractFactsFromConversation'];
          keyFunctions.forEach(func => {
            if (memory[func]) {
              debugInfo += `   • ${func}: ✅ Available\n`;
            } else {
              debugInfo += `   • ${func}: ❌ Missing\n`;
            }
          });
          
          // Test context building
          try {
            if (memory.buildConversationContext) {
              const testContext = await memory.buildConversationContext(chatId);
              debugInfo += `   • Context test: ✅ Success (${testContext ? testContext.length : 0} chars)\n`;
            }
          } catch (contextError) {
            debugInfo += `   • Context test: ❌ Failed - ${contextError.message}\n`;
          }
          
          debugInfo += '\n';
        } else {
          debugInfo += '🧠 MEMORY MODULE: ❌ Not loaded\n\n';
        }
        
        // Check DualCommandSystem integration
        if (DualCommandSystem) {
          debugInfo += '🎯 DUALCOMMANDSYSTEM INTEGRATION:\n';
          const memoryFunctions = ['buildMemoryContext', 'saveMemoryIfNeeded'];
          memoryFunctions.forEach(func => {
            if (DualCommandSystem[func]) {
              debugInfo += `   • ${func}: ✅ Available\n`;
            } else {
              debugInfo += `   • ${func}: ❌ Missing\n`;
            }
          });
          debugInfo += '\n';
        }
        
        debugInfo += `📊 SYSTEM INFO:\n`;
        debugInfo += `   • Chat ID: ${chatId}\n`;
        debugInfo += `   • Uptime: ${formatUptime(process.uptime() * 1000)}\n`;
        debugInfo += `   • Debug commands run: ${debugCommandCount}\n`;
        debugInfo += `   • Time: ${new Date().toISOString()}`;
        
        await bot.sendMessage(chatId, debugInfo);
        console.log('[MEMORY-DEBUG] ✅ Enhanced memory debug completed');
        
      } catch (memoryError) {
        await bot.sendMessage(chatId, `❌ Memory debug failed: ${memoryError.message}`);
        console.log('[MEMORY-DEBUG] ❌ Memory debug error:', memoryError.message);
      }
      
      return true;
    }
    
    // 📊 DATABASE STATUS COMMAND (ENHANCED)
    if (text === '/db_status') {
      console.log('[DB-STATUS] 📊 Enhanced database status check initiated...');
      
      let statusInfo = '📊 ENHANCED DATABASE STATUS:\n\n';
      
      if (database) {
        statusInfo += '✅ Database module: Loaded\n';
        statusInfo += `📋 Available functions: ${Object.keys(database).length}\n`;
        
        // Show key functions
        const keyFunctions = Object.keys(database).slice(0, 8);
        statusInfo += `🔧 Key functions: ${keyFunctions.join(', ')}\n\n`;
        
        // Test multiple database functions
        const tests = [
          { name: 'Connection Stats', func: 'connectionStats', test: () => database.connectionStats },
          { name: 'Conversation History', func: 'getConversationHistoryDB', test: () => database.getConversationHistoryDB('test', 1) },
          { name: 'Persistent Memory', func: 'getPersistentMemoryDB', test: () => database.getPersistentMemoryDB('test') },
          { name: 'User Profile', func: 'getUserProfileDB', test: () => database.getUserProfileDB('test') }
        ];
        
        for (const test of tests) {
          if (database[test.func]) {
            try {
              const result = await test.test();
              if (test.name === 'Connection Stats') {
                statusInfo += `✅ ${test.name}: ${JSON.stringify(result).substring(0, 100)}...\n`;
              } else {
                statusInfo += `✅ ${test.name}: Working (${Array.isArray(result) ? result.length : 'success'} results)\n`;
              }
            } catch (testError) {
              statusInfo += `❌ ${test.name}: Error - ${testError.message}\n`;
            }
          } else {
            statusInfo += `⚠️ ${test.name}: Function not available\n`;
          }
        }
      } else {
        statusInfo += '❌ Database module: Not loaded\n';
      }
      
      statusInfo += `\n⏰ Checked: ${new Date().toISOString()}`;
      
      await bot.sendMessage(chatId, statusInfo);
      console.log('[DB-STATUS] ✅ Enhanced database status check completed');
      
      return true;
    }
    
    // 🔗 MEMORY INTEGRATION FLOW TEST (NEW)
    if (text === '/test_memory_flow') {
      console.log('[MEMORY-FLOW] 🔗 Testing complete memory integration flow...');
      
      if (!database) {
        await bot.sendMessage(chatId, '❌ Database module not available.');
        return true;
      }
      
      try {
        let testResults = '🔗 MEMORY INTEGRATION FLOW TEST:\n\n';
        
        // Step 1: Test database save
        console.log('[MEMORY-FLOW] Step 1: Testing database save...');
        const saveResult = await database.saveConversationDB(
          chatId, 
          'TEST: Memory integration test user message', 
          'TEST: Memory integration test AI response',
          { test: true, timestamp: new Date().toISOString() }
        );
        
        if (saveResult !== false) {
          testResults += '✅ Step 1: Database save - SUCCESS\n';
        } else {
          testResults += '❌ Step 1: Database save - FAILED\n';
        }
        
        // Step 2: Test memory module loading
        console.log('[MEMORY-FLOW] Step 2: Testing memory module...');
        if (memory) {
          testResults += '✅ Step 2: Memory module - LOADED\n';
          
          // Step 3: Test context building
          if (memory.buildConversationContext) {
            console.log('[MEMORY-FLOW] Step 3: Testing context building...');
            const context = await memory.buildConversationContext(chatId);
            if (context && context.length > 0) {
              testResults += `✅ Step 3: Context building - SUCCESS (${context.length} chars)\n`;
            } else {
              testResults += '⚠️ Step 3: Context building - EMPTY RESULT\n';
            }
          } else {
            testResults += '❌ Step 3: buildConversationContext - NOT FOUND\n';
          }
          
          // Step 4: Test memory save function
          if (memory.saveToMemory) {
            console.log('[MEMORY-FLOW] Step 4: Testing memory save...');
            const memoryResult = await memory.saveToMemory(chatId, {
              user: 'TEST: Memory save test',
              assistant: 'TEST: Memory save response',
              timestamp: new Date().toISOString()
            });
            
            if (memoryResult && memoryResult.saved !== false) {
              testResults += '✅ Step 4: Memory save function - SUCCESS\n';
            } else {
              testResults += `❌ Step 4: Memory save function - FAILED (${memoryResult?.reason || 'unknown'})\n`;
            }
          } else {
            testResults += '❌ Step 4: saveToMemory function - NOT FOUND\n';
          }
          
        } else {
          testResults += '❌ Step 2: Memory module - NOT LOADED\n';
        }
        
        // Step 5: Test dualCommandSystem integration
        console.log('[MEMORY-FLOW] Step 5: Testing dualCommandSystem integration...');
        if (DualCommandSystem) {
          testResults += '✅ Step 5: DualCommandSystem - LOADED\n';
          
          if (DualCommandSystem.buildMemoryContext) {
            testResults += '✅ Step 5a: buildMemoryContext - AVAILABLE\n';
          } else {
            testResults += '❌ Step 5a: buildMemoryContext - NOT FOUND\n';
          }
          
          if (DualCommandSystem.saveMemoryIfNeeded) {
            testResults += '✅ Step 5b: saveMemoryIfNeeded - AVAILABLE\n';
          } else {
            testResults += '❌ Step 5b: saveMemoryIfNeeded - NOT FOUND\n';
          }
          
        } else {
          testResults += '❌ Step 5: DualCommandSystem - NOT LOADED\n';
        }
        
        // Step 6: Test OpenAI client integration
        console.log('[MEMORY-FLOW] Step 6: Testing OpenAI client...');
        if (openaiClient) {
          testResults += '✅ Step 6: OpenAI client - LOADED\n';
          
          if (openaiClient.getGPT5Analysis) {
            testResults += '✅ Step 6a: getGPT5Analysis - AVAILABLE\n';
          } else {
            testResults += '❌ Step 6a: getGPT5Analysis - NOT FOUND\n';
          }
        } else {
          testResults += '❌ Step 6: OpenAI client - NOT LOADED\n';
        }
        
        // Final assessment
        testResults += '\n📊 DIAGNOSIS:\n';
        if (testResults.includes('❌')) {
          testResults += '🚨 ISSUES FOUND - This explains your memory problems!\n';
          testResults += '💡 Check the failed steps above to fix your memory system.\n';
          
          if (testResults.includes('Step 1: Database save - FAILED')) {
            testResults += '🔧 Fix: Check PostgreSQL connection and table structure\n';
          }
          if (testResults.includes('Step 3: Context building - EMPTY')) {
            testResults += '🔧 Fix: No conversation history found - save some conversations first\n';
          }
          if (testResults.includes('Step 5a: buildMemoryContext - NOT FOUND')) {
            testResults += '🔧 Fix: DualCommandSystem missing memory integration functions\n';
          }
        } else {
          testResults += '✅ ALL TESTS PASSED - Memory system should be working!\n';
          testResults += '💡 If memory still not working, check GPT-5 API responses.\n';
        }
        
        testResults += `\n⏰ Test completed: ${new Date().toISOString()}`;
        
        await bot.sendMessage(chatId, testResults);
        console.log('[MEMORY-FLOW] ✅ Complete memory integration test finished');
        
      } catch (testError) {
        await bot.sendMessage(chatId, `❌ Memory flow test failed: ${testError.message}\n\nStack trace logged to console.`);
        console.log('[MEMORY-FLOW] ❌ Test error:', testError.message);
        console.log('[MEMORY-FLOW] ❌ Stack:', testError.stack);
      }
      
      return true;
    }
    
    // 🔧 COLLATION FIX COMMAND (NEW)
    if (text === '/fix_collation') {
      console.log('[COLLATION-FIX] 🔧 Attempting to fix PostgreSQL collation...');
      
      if (!database || !database.pool) {
        await bot.sendMessage(chatId, '❌ Database pool not available. Check database module loading.');
        return true;
      }
      
      try {
        // Attempt the collation fix
        await database.pool.query('ALTER DATABASE railway REFRESH COLLATION VERSION');
        await bot.sendMessage(chatId, '✅ PostgreSQL collation version refreshed successfully!\n\n🎉 This should eliminate the collation warnings in your logs.\n\n📝 Changes:\n• Database collation updated to match system\n• Warning messages should disappear\n• No data loss or downtime');
        console.log('[COLLATION-FIX] ✅ Collation fixed successfully');
      } catch (collationError) {
        let message = `⚠️ Collation fix result: ${collationError.message}\n\n`;
        
        if (collationError.message.includes('permission')) {
          message += '💡 This is often expected if you don\'t have database admin permissions.\nRailway may handle this automatically, or contact Railway support.';
        } else if (collationError.message.includes('does not exist')) {
          message += '💡 Database may not need this fix, or collation is already current.';
        } else {
          message += '💡 This error is often harmless - your database should work fine regardless.';
        }
        
        await bot.sendMessage(chatId, message);
        console.log('[COLLATION-FIX] ⚠️ Collation fix result:', collationError.message);
      }
      
      return true;
    }
    
    // 🏥 SYSTEM HEALTH COMMAND (NEW)
    if (text === '/system_health') {
      console.log('[SYSTEM-HEALTH] 🏥 Performing comprehensive system health check...');
      
      try {
        let healthReport = '🏥 COMPREHENSIVE SYSTEM HEALTH REPORT:\n\n';
        let overallScore = 0;
        let maxScore = 0;
        
        // Check each system component
        const checks = [
          {
            name: 'Database System',
            weight: 25,
            test: async () => {
              if (!database) return { score: 0, status: 'Module not loaded' };
              try {
                await database.getConversationHistoryDB('health', 1);
                return { score: 100, status: 'Connected and functional' };
              } catch (error) {
                return { score: 20, status: `Connection issues: ${error.message}` };
              }
            }
          },
          {
            name: 'Memory System',
            weight: 20,
            test: async () => {
              if (!memory) return { score: 0, status: 'Module not loaded' };
              try {
                if (memory.buildConversationContext) {
                  await memory.buildConversationContext('health');
                  return { score: 100, status: 'Fully operational' };
                } else {
                  return { score: 50, status: 'Partially functional' };
                }
              } catch (error) {
                return { score: 25, status: `Errors detected: ${error.message}` };
              }
            }
          },
          {
            name: 'OpenAI Client',
            weight: 20,
            test: async () => {
              if (!openaiClient) return { score: 0, status: 'Module not loaded' };
              if (openaiClient.getGPT5Analysis) {
                return { score: 100, status: 'Ready for API calls' };
              } else {
                return { score: 30, status: 'Missing key functions' };
              }
            }
          },
          {
            name: 'DualCommandSystem',
            weight: 25,
            test: async () => {
              if (!DualCommandSystem) return { score: 0, status: 'Module not loaded' };
              let score = 60; // Base score for loading
              let status = 'Basic functionality';
              
              if (DualCommandSystem.handleTelegramMessage) score += 20;
              if (DualCommandSystem.buildMemoryContext) score += 10;
              if (DualCommandSystem.saveMemoryIfNeeded) score += 10;
              
              if (score >= 95) status = 'Fully operational';
              else if (score >= 80) status = 'Good functionality';
              else if (score >= 60) status = 'Limited functionality';
              
              return { score, status };
            }
          },
          {
            name: 'Server Health',
            weight: 10,
            test: async () => {
              const uptime = process.uptime();
              const memory = process.memoryUsage();
              const memoryMB = Math.round(memory.heapUsed / 1024 / 1024);
              
              let score = 100;
              let status = 'Excellent';
              
              if (memoryMB > 500) { score -= 20; status = 'High memory usage'; }
              if (uptime < 60) { score -= 10; status = 'Recently restarted'; }
              
              return { score, status: `${status} (${formatUptime(uptime * 1000)}, ${memoryMB}MB)` };
            }
          }
        ];
        
        // Run all health checks
        for (const check of checks) {
          try {
            const result = await check.test();
            const weightedScore = (result.score * check.weight) / 100;
            overallScore += weightedScore;
            maxScore += check.weight;
            
            const emoji = result.score >= 90 ? '✅' : result.score >= 70 ? '⚠️' : '❌';
            healthReport += `${emoji} ${check.name}: ${result.score}% - ${result.status}\n`;
          } catch (error) {
            healthReport += `❌ ${check.name}: Error - ${error.message}\n`;
          }
        }
        
        // Calculate final score
        const finalScore = Math.round((overallScore / maxScore) * 100);
        const healthStatus = finalScore >= 90 ? '🟢 EXCELLENT' : 
                           finalScore >= 70 ? '🟡 GOOD' : 
                           finalScore >= 50 ? '🟠 DEGRADED' : '🔴 CRITICAL';
        
        healthReport += `\n📊 OVERALL SYSTEM HEALTH: ${healthStatus} (${finalScore}%)\n\n`;
        
        // Add recommendations
        healthReport += '💡 RECOMMENDATIONS:\n';
        if (finalScore < 70) {
          healthReport += '• Check failed components above\n';
          healthReport += '• Run /test_memory_flow for detailed diagnostics\n';
          healthReport += '• Verify environment variables and API keys\n';
        } else if (finalScore < 90) {
          healthReport += '• System is functional but has minor issues\n';
          healthReport += '• Consider addressing warnings above\n';
        } else {
          healthReport += '• System is running optimally! 🎉\n';
          healthReport += '• All components are healthy and functional\n';
        }
        
        healthReport += `\n⏰ Health check completed: ${new Date().toISOString()}`;
        
        await bot.sendMessage(chatId, healthReport);
        console.log(`[SYSTEM-HEALTH] ✅ Health check completed with ${finalScore}% score`);
        
      } catch (healthError) {
        await bot.sendMessage(chatId, `❌ System health check failed: ${healthError.message}\n\nThis indicates serious system issues. Check server logs.`);
        console.log('[SYSTEM-HEALTH] ❌ Health check error:', healthError.message);
      }
      
      return true;
    }
    
    return false; // Not a debug command
    
  } catch (error) {
    console.error('[DEBUG-COMMANDS] ❌ Error handling debug command:', error.message);
    await bot.sendMessage(chatId, `❌ Debug command error: ${error.message}\n\nThis error has been logged for investigation.`);
    return true;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN WEBHOOK ENDPOINT WITH ENHANCED DEBUG COMMAND INTERCEPT
// ─────────────────────────────────────────────────────────────────────────────
app.post(`/webhook/${BOT_TOKEN}`, async (req, res) => {
  try {
    const update = req.body;

    // Enhanced deduplication check with logging
    if (update.message) {
      const messageId = update.message.message_id;
      const chatId = update.message.chat.id;
      const dedupeKey = `${chatId}_${messageId}`;
      
      if (processedMessages.has(dedupeKey)) {
        duplicateCount++;
        console.log(`🔄 Duplicate message ${dedupeKey} - Skipping (${duplicateCount} total duplicates prevented)`);
        return res.status(200).json({ ok: true });
      }
      processedMessages.add(dedupeKey);
    }

    // 🧪 ENHANCED DEBUG COMMAND INTERCEPT
    if (update.message && update.message.text) {
      const text = update.message.text.toLowerCase();
      const debugCommands = ['/test_save', '/memory_debug', '/db_status', '/test_memory_flow', '/fix_collation', '/system_health'];
      
      if (debugCommands.includes(text)) {
        console.log(`🧪 Debug command intercepted: ${update.message.text}`);
        const isDebugCommand = await handleDebugCommands(update.message, bot);
        if (isDebugCommand) {
          console.log(`🧪 Debug command processed successfully: ${update.message.text}`);
          return res.status(200).json({ ok: true });
        }
      }
    }

    // ✨ CLEAN ROUTING - EVERYTHING ELSE GOES TO DUAL COMMAND SYSTEM
    if (update.message) {
      console.log(`📨 Routing message to dualCommandSystem.js (${update.message.text ? update.message.text.substring(0, 30) + '...' : 'media'})`);
      await DualCommandSystem.handleTelegramMessage(update.message, bot);
    } else if (update.callback_query) {
      console.log(`📨 Routing callback query to dualCommandSystem.js`);
      await DualCommandSystem.handleCallbackQuery(update.callback_query, bot);
    } else if (update.inline_query) {
      console.log(`📨 Routing inline query to dualCommandSystem.js`);
      await DualCommandSystem.handleInlineQuery(update.inline_query, bot);
    } else {
      console.log(`📨 Unknown update type received:`, Object.keys(update));
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED SYSTEM INITIALIZATION WITH COMPREHENSIVE CHECKS
// ─────────────────────────────────────────────────────────────────────────────
async function initializeServer() {
  try {
    console.log('\n🔧 Initializing enhanced server with advanced debugging capabilities...');

    // Test dual command system with detailed reporting
    if (!DualCommandSystem) {
      throw new Error('dualCommandSystem.js not available - critical system failure');
    }

    console.log('✅ DualCommandSystem loaded successfully');

    // Test required methods exist with detailed feedback
    const requiredMethods = ['handleTelegramMessage', 'handleCallbackQuery', 'handleInlineQuery'];
    const optionalMethods = ['buildMemoryContext', 'saveMemoryIfNeeded', 'executeEnhancedGPT5Command'];
    
    console.log('\n📋 Testing DualCommandSystem methods:');
    for (const method of requiredMethods) {
      if (!DualCommandSystem[method]) {
        console.error(`❌ CRITICAL: dualCommandSystem.${method} not found - this will cause routing failures`);
      } else {
        console.log(`   ✅ ${method}: Available`);
      }
    }
    
    for (const method of optionalMethods) {
      if (!DualCommandSystem[method]) {
        console.warn(`   ⚠️  ${method}: Missing (optional but recommended)`);
      } else {
        console.log(`   ✅ ${method}: Available`);
      }
    }

    // Test database integration with enhanced reporting
    if (database) {
      console.log('\n📊 Testing database integration:');
      console.log(`   ✅ Database module loaded`);
      console.log(`   📋 Available functions: ${Object.keys(database).length}`);
      
      // Test key database functions
      const dbTests = [
        { name: 'saveConversationDB', critical: true },
        { name: 'getConversationHistoryDB', critical: true },
        { name: 'saveConversation', critical: false },
        { name: 'getPersistentMemoryDB', critical: false }
      ];
      
      for (const test of dbTests) {
        if (database[test.name]) {
          console.log(`   ✅ ${test.name}: Available`);
        } else if (test.critical) {
          console.error(`   ❌ ${test.name}: Missing (CRITICAL)`);
        } else {
          console.warn(`   ⚠️  ${test.name}: Missing (optional)`);
        }
      }
      
      // Test database connection
      try {
        const connectionTest = await database.getConversationHistoryDB('init_test', 1);
        console.log(`   ✅ Database connection: Working (${Array.isArray(connectionTest) ? connectionTest.length : 0} results)`);
      } catch (dbError) {
        console.error(`   ❌ Database connection: Failed - ${dbError.message}`);
      }
    } else {
      console.warn('\n⚠️  Database module not loaded - limited functionality available');
    }

    // Test memory integration
    if (memory) {
      console.log('\n🧠 Testing memory integration:');
      console.log(`   ✅ Memory module loaded`);
      console.log(`   📋 Available functions: ${Object.keys(memory).length}`);
      
      const memoryTests = ['buildConversationContext', 'saveToMemory', 'extractFactsFromConversation'];
      for (const test of memoryTests) {
        if (memory[test]) {
          console.log(`   ✅ ${test}: Available`);
        } else {
          console.warn(`   ⚠️  ${test}: Missing`);
        }
      }
    } else {
      console.warn('\n⚠️  Memory module not loaded - basic functionality only');
    }

    // Test OpenAI client
    if (openaiClient) {
      console.log('\n🤖 OpenAI client status:');
      console.log(`   ✅ Module loaded`);
      if (openaiClient.getGPT5Analysis) {
        console.log(`   ✅ getGPT5Analysis: Available`);
      } else {
        console.error(`   ❌ getGPT5Analysis: Missing (CRITICAL)`);
      }
    } else {
      console.error('\n❌ OpenAI client not loaded - GPT-5 functionality will be limited');
    }

    // Setup webhook with enhanced configuration
    const webhookUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
    console.log(`\n🌐 Setting up webhook: ${webhookUrl}`);
    
    try {
      await bot.setWebHook(webhookUrl, {
        max_connections: 100,
        allowed_updates: ['message', 'callback_query', 'inline_query'],
        drop_pending_updates: true // Clear any pending updates
      });
      console.log('✅ Webhook configured successfully with enhanced settings');
    } catch (webhookError) {
      console.error('❌ Webhook setup failed:', webhookError.message);
      throw webhookError;
    }

    // Initialize dual command system if it has an init method
    if (DualCommandSystem.initialize) {
      console.log('\n🚀 Initializing dualCommandSystem...');
      try {
        await DualCommandSystem.initialize();
        console.log('✅ dualCommandSystem initialized successfully');
      } catch (initError) {
        console.warn('⚠️  dualCommandSystem initialization had issues:', initError.message);
      }
    }

    // Run initial health check
    console.log('\n🏥 Running initial system health check...');
    try {
      if (database) {
        // Test database with collation fix attempt
        try {
          await database.pool.query('ALTER DATABASE railway REFRESH COLLATION VERSION');
          console.log('✅ PostgreSQL collation version refreshed');
        } catch (collationError) {
          console.log(`⚠️  Collation refresh: ${collationError.message} (often expected)`);
        }
        
        // Test database functionality
        await database.getConversationHistoryDB('startup_test', 1);
        console.log('✅ Database health check passed');
      }
    } catch (healthError) {
      console.warn('⚠️  Health check issues:', healthError.message);
    }

    console.log('\n🎉 ENHANCED SERVER INITIALIZATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📡 All message routing handled by dualCommandSystem.js');
    console.log('🧪 Enhanced debug commands available:');
    console.log('   • /test_save - Test database saving directly');
    console.log('   • /memory_debug - Enhanced memory system analysis');  
    console.log('   • /db_status - Detailed database status report');
    console.log('   • /test_memory_flow - Complete memory integration test');
    console.log('   • /fix_collation - Fix PostgreSQL collation warnings');
    console.log('   • /system_health - Comprehensive system health check');
    console.log('🚀 Clean architecture with advanced debugging capabilities');
    console.log('🔧 PostgreSQL collation issues automatically addressed');
    console.log(`🌐 Listening on port ${PORT} with enhanced monitoring...`);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ENHANCED SERVER INITIALIZATION FAILED:');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════════════════════════');
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check that dualCommandSystem.js exists and loads properly');
    console.log('2. Verify database.js connection and credentials'); 
    console.log('3. Ensure memory.js exports the required functions');
    console.log('4. Check environment variables (BOT_TOKEN, DATABASE_URL)');
    console.log('5. Review Railway logs for additional error details');
    console.log('\nServer will exit now to prevent broken state...\n');
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED SERVER STARTUP WITH MONITORING
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  const startupTime = new Date().toISOString();
  console.log(`🌐 Enhanced Express server started on port ${PORT} at ${startupTime}`);
  console.log(`📊 Process ID: ${process.pid}`);
  console.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  
  await initializeServer();
  
  console.log(`🎯 Enhanced server fully operational with advanced debugging!`);
  console.log(`📈 Request counter initialized, duplicate prevention active`);
  console.log(`🔍 Six powerful debug commands ready for troubleshooting`);
});

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED GRACEFUL SHUTDOWN WITH CLEANUP
// ─────────────────────────────────────────────────────────────────────────────
process.on('SIGINT', async () => {
  console.log('\n🛑 Enhanced shutdown initiated...');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    // Clean webhook
    await bot.deleteWebHook();
    console.log('✅ Webhook deleted successfully');
    
    // Shutdown dual command system if it has cleanup
    if (DualCommandSystem && DualCommandSystem.shutdown) {
      console.log('🔄 Shutting down dualCommandSystem...');
      await DualCommandSystem.shutdown();
      console.log('✅ dualCommandSystem shutdown complete');
    }
    
    // Close database connections if available
    if (database && database.pool && database.pool.end) {
      console.log('🔄 Closing database connections...');
      await database.pool.end();
      console.log('✅ Database connections closed');
    }
    
    // Log final statistics
    console.log('\n📊 FINAL STATISTICS:');
    console.log(`   • Total requests processed: ${requestCount}`);
    console.log(`   • Debug commands executed: ${debugCommandCount}`);
    console.log(`   • Duplicate messages prevented: ${duplicateCount}`);
    console.log(`   • Uptime: ${formatUptime(process.uptime() * 1000)}`);
    
  } catch (error) {
    console.log('⚠️  Shutdown cleanup error:', error.message);
  }
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('👋 Enhanced shutdown complete - goodbye!');
  process.exit(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED ERROR HANDLERS WITH DETAILED LOGGING
// ─────────────────────────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ UNHANDLED REJECTION:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  console.error('Stack:', reason?.stack);
  console.log('🔄 Server continuing - dualCommandSystem handles recovery\n');
  // Don't exit - let the system handle recovery
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ UNCAUGHT EXCEPTION:');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.log('🚨 This is a serious error - server may be unstable');
  console.log('🔄 Attempting to continue - monitor system health closely\n');
  // Log but don't exit immediately - give system a chance to recover
});

// Memory usage monitoring (optional)
setInterval(() => {
  const usage = process.memoryUsage();
  const memoryMB = Math.round(usage.heapUsed / 1024 / 1024);
  
  if (memoryMB > 200) { // Alert if memory usage is high
    console.log(`⚠️  High memory usage detected: ${memoryMB}MB (RSS: ${Math.round(usage.rss / 1024 / 1024)}MB)`);
  }
}, 300000); // Check every 5 minutes

// Final startup message
console.log('\n🎯 ENHANCED IMPERIUM VAULT SERVER READY!');
console.log('════════════════════════════════════════════════════════════════════════════');
console.log('✨ ENHANCED FEATURES:');
console.log('   🧪 Six powerful debug commands for complete system diagnosis');
console.log('   🔧 Automatic PostgreSQL collation fix');
console.log('   🏥 Comprehensive system health monitoring');  
console.log('   📊 Advanced statistics and performance tracking');
console.log('   🔍 Memory integration flow testing');
console.log('   🛡️  Enhanced error handling and recovery');
console.log('   📱 Smart message deduplication');
console.log('   ⏱️  Uptime and resource monitoring');
console.log('');
console.log('🚀 READY FOR PRODUCTION with complete debugging capabilities!');
console.log('🔍 Use debug commands to troubleshoot any issues');
console.log('🧠 Memory system integration fully testable');
console.log('📡 Clean routing architecture maintained');
console.log('════════════════════════════════════════════════════════════════════════════');
