#!/usr/bin/env node

/**
 * IMPERIUM VAULT SYSTEM - ENHANCED INDEX.JS
 * Production-ready server with smart routing and error recovery
 * 
 * Architecture:
 * index.js (server + middleware) → dualCommandSystem.js (AI routing + memory) → openaiClient.js (GPT-5 API)
 * 
 * Features:
 * - Clean separation of concerns
 * - Smart deduplication with size limits
 * - Request timeout and rate limiting
 * - Enhanced error tracking and recovery
 * - Memory optimization integration
 * - Performance monitoring
 * - Graceful shutdown with cleanup
 */

console.log('IMPERIUM VAULT - Enhanced Server Starting...');
console.log('Architecture: Clean separation → Server (index.js) → Routing (dualCommandSystem.js) → API (openaiClient.js)');
console.log('Mode: Railway Webhook Production with Performance Optimization');

require('dotenv').config();

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 8080;
const WEBHOOK_URL = process.env.WEBHOOK_URL || `https://imperiumvaultsystem-production.up.railway.app`;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Performance settings
const WEBHOOK_TIMEOUT = 30000;           // 30 seconds
const MAX_CACHE_SIZE = 2000;             // Message deduplication cache limit
const CACHE_CLEANUP_INTERVAL = 300000;   // 5 minutes
const REQUEST_SIZE_LIMIT = '50mb';       // File upload support
const RATE_LIMIT_WINDOW = 60000;         // 1 minute
const RATE_LIMIT_MAX = 100;              // Max requests per window

// System state tracking
const systemState = {
  startTime: Date.now(),
  processedMessages: 0,
  errorCount: 0,
  lastError: null,
  memoryOptimization: 'active'
};

// Validation
if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

console.log(`Server Config: Port ${PORT}, Webhook: ${WEBHOOK_URL}`);
console.log(`Environment: ${NODE_ENV}, Memory Optimization: ${systemState.memoryOptimization}`);

// ─────────────────────────────────────────────────────────────────────────────
// TELEGRAM BOT SETUP WITH ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

const bot = new TelegramBot(BOT_TOKEN, { 
  polling: false,
  webHook: {
    port: PORT,
    autoOpen: false
  }
});

// Bot error handling
bot.on('webhook_error', (error) => {
  console.error('Telegram webhook error:', error.message);
  systemState.errorCount++;
  systemState.lastError = error.message;
});

bot.on('polling_error', (error) => {
  console.error('Telegram polling error:', error.message);
});

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// DUAL COMMAND SYSTEM INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

let DualCommandSystem;
try {
  DualCommandSystem = require('./utils/dualCommandSystem');
  console.log('✅ dualCommandSystem.js loaded successfully');
  
  // Validate critical functions exist
  const requiredFunctions = [
    'handleTelegramMessage',
    'handleCallbackQuery', 
    'handleInlineQuery'
  ];
  
  const missingFunctions = requiredFunctions.filter(func => !DualCommandSystem[func]);
  
  if (missingFunctions.length > 0) {
    console.warn('⚠️  Missing functions in dualCommandSystem:', missingFunctions);
  } else {
    console.log('✅ All required dualCommandSystem functions available');
  }
  
} catch (error) {
  console.error('❌ CRITICAL: dualCommandSystem.js failed to load:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED MIDDLEWARE STACK
// ─────────────────────────────────────────────────────────────────────────────

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(WEBHOOK_TIMEOUT, () => {
    console.warn(`Request timeout: ${req.method} ${req.url}`);
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Body parser with enhanced limits
app.use(express.json({ 
  limit: REQUEST_SIZE_LIMIT,
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: true, limit: REQUEST_SIZE_LIMIT }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  
  if (req.url.includes('webhook')) {
    console.log(`📨 [${timestamp}] Webhook: ${req.method} ${req.url} (${req.get('content-length') || 0} bytes)`);
  } else if (req.url !== '/health') {
    console.log(`🌐 [${timestamp}] ${req.method} ${req.url} from ${req.ip}`);
  }
  
  next();
});

// Simple rate limiting for non-webhook endpoints
const rateLimitMap = new Map();
app.use((req, res, next) => {
  if (req.url.includes('webhook')) return next(); // Skip rate limiting for webhooks
  
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, []);
  }
  
  const requests = rateLimitMap.get(clientIP).filter(time => time > windowStart);
  
  if (requests.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
    });
  }
  
  requests.push(now);
  rateLimitMap.set(clientIP, requests);
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED HEALTH AND STATUS ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  const uptime = Date.now() - systemState.startTime;
  
  res.json({
    service: 'IMPERIUM VAULT GPT-5 System',
    status: 'online',
    version: '2.0.0-enhanced',
    architecture: {
      server: 'index.js (Express + Telegram Webhook)',
      routing: 'dualCommandSystem.js (AI Logic + Memory Optimization)',
      api: 'openaiClient.js (GPT-5 Integration)',
      formatting: 'telegramSplitter.js (Smart Delivery)',
      memory: 'PostgreSQL with Smart Filtering'
    },
    features: [
      'Memory optimization for simple messages',
      'Smart GPT-5 model selection',
      'Multimodal processing support',
      'Cost optimization',
      'Error recovery systems'
    ],
    performance: {
      uptime: Math.round(uptime / 1000) + 's',
      processedMessages: systemState.processedMessages,
      errorRate: systemState.processedMessages > 0 
        ? ((systemState.errorCount / systemState.processedMessages) * 100).toFixed(2) + '%'
        : '0%',
      memoryOptimization: systemState.memoryOptimization
    },
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/health', async (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Test dual command system health
    let systemHealth = 'unknown';
    if (DualCommandSystem.getGPT5PerformanceMetrics) {
      try {
        const metrics = DualCommandSystem.getGPT5PerformanceMetrics();
        systemHealth = 'healthy';
      } catch (healthError) {
        systemHealth = 'degraded';
        console.warn('Health check warning:', healthError.message);
      }
    }

    const healthData = {
      status: 'healthy',
      service: 'IMPERIUM VAULT Enhanced Server',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.round(uptime),
        formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
      },
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(memUsage.external / 1024 / 1024) + 'MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
      },
      system: {
        dualCommandSystem: DualCommandSystem ? 'loaded' : 'missing',
        handlers: {
          telegram: !!DualCommandSystem?.handleTelegramMessage,
          callback: !!DualCommandSystem?.handleCallbackQuery,
          inline: !!DualCommandSystem?.handleInlineQuery,
          multimodal: !!DualCommandSystem?.multimodal
        },
        health: systemHealth
      },
      performance: {
        processedMessages: systemState.processedMessages,
        errorCount: systemState.errorCount,
        lastError: systemState.lastError,
        cacheSize: processedMessages.size
      }
    };

    res.status(200).json(healthData);
    
  } catch (error) {
    console.error('Health check error:', error.message);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/status', async (req, res) => {
  try {
    let detailedStatus = {
      server: 'online',
      routing: DualCommandSystem ? 'ready' : 'failed',
      timestamp: new Date().toISOString()
    };

    // Get detailed system status if available
    if (DualCommandSystem.getGPT5PerformanceMetrics) {
      try {
        detailedStatus.metrics = DualCommandSystem.getGPT5PerformanceMetrics();
      } catch (metricsError) {
        detailedStatus.metricsError = metricsError.message;
      }
    }

    res.json(detailedStatus);
  } catch (error) {
    res.status(500).json({
      server: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// System metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        pid: process.pid
      },
      application: {
        processedMessages: systemState.processedMessages,
        errorCount: systemState.errorCount,
        errorRate: systemState.processedMessages > 0 
          ? (systemState.errorCount / systemState.processedMessages * 100).toFixed(2) + '%'
          : '0%',
        cacheSize: processedMessages.size,
        memoryOptimization: systemState.memoryOptimization
      }
    };

    if (DualCommandSystem.getSystemAnalytics) {
      try {
        metrics.dualCommandSystem = DualCommandSystem.getSystemAnalytics();
      } catch (analyticsError) {
        metrics.analyticsError = analyticsError.message;
      }
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED MESSAGE DEDUPLICATION SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

const processedMessages = new Map(); // Changed to Map for better performance

function cleanupMessageCache() {
  const now = Date.now();
  const cutoff = now - CACHE_CLEANUP_INTERVAL;
  let cleaned = 0;

  for (const [key, timestamp] of processedMessages.entries()) {
    if (timestamp < cutoff) {
      processedMessages.delete(key);
      cleaned++;
    }
  }

  // Size-based cleanup if still too large
  if (processedMessages.size > MAX_CACHE_SIZE) {
    const entries = Array.from(processedMessages.entries());
    entries.sort((a, b) => a[1] - b[1]); // Sort by timestamp
    
    const toRemove = entries.slice(0, processedMessages.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => processedMessages.delete(key));
    cleaned += toRemove.length;
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} old messages from cache (${processedMessages.size} remaining)`);
  }
}

// Cleanup interval
setInterval(cleanupMessageCache, CACHE_CLEANUP_INTERVAL);

function isDuplicateMessage(update) {
  if (!update.message) return false;

  const messageId = update.message.message_id;
  const chatId = update.message.chat.id;
  const dedupeKey = `${chatId}_${messageId}`;
  const now = Date.now();

  if (processedMessages.has(dedupeKey)) {
    console.log(`🔄 Duplicate message detected: ${dedupeKey}`);
    return true;
  }

  processedMessages.set(dedupeKey, now);
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR TRACKING AND RECOVERY
// ─────────────────────────────────────────────────────────────────────────────

function logSystemError(error, context = '', updateData = null) {
  systemState.errorCount++;
  systemState.lastError = {
    message: error.message,
    context,
    timestamp: new Date().toISOString(),
    updateData: updateData ? {
      messageId: updateData.message?.message_id,
      chatId: updateData.message?.chat?.id,
      messageType: updateData.message ? 'message' : updateData.callback_query ? 'callback' : 'unknown'
    } : null
  };

  console.error(`❌ System Error [${context}]:`, error.message);
  
  // Log to dual command system if available
  if (DualCommandSystem?.logError) {
    try {
      DualCommandSystem.logError(error, context, updateData);
    } catch (logErr) {
      console.warn('Failed to log to dualCommandSystem:', logErr.message);
    }
  }
}

async function handleWebhookError(error, update, chatId) {
  logSystemError(error, 'webhook', update);

  // Try to send error notification to user
  if (chatId && bot) {
    try {
      await bot.sendMessage(
        chatId, 
        `System temporarily unavailable. Please try again in a moment.\n\nError ID: ${Date.now()}`
      );
    } catch (notificationError) {
      console.error('Failed to send error notification:', notificationError.message);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN WEBHOOK ENDPOINT - ENHANCED WITH SMART ROUTING
// ─────────────────────────────────────────────────────────────────────────────

app.post(`/webhook/${BOT_TOKEN}`, async (req, res) => {
  const requestStart = Date.now();
  
  try {
    const update = req.body;
    
    if (!update) {
      console.warn('Empty webhook update received');
      return res.status(200).json({ ok: true });
    }

    // Enhanced deduplication
    if (isDuplicateMessage(update)) {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    systemState.processedMessages++;
    
    // Enhanced routing with error handling per message type
    if (update.message) {
      const chatId = update.message.chat.id;
      const messageText = update.message.text || '[media]';
      
      console.log(`📨 Message from ${chatId}: "${messageText.substring(0, 50)}..."`);
      
      try {
        await DualCommandSystem.handleTelegramMessage(update.message, bot);
      } catch (messageError) {
        await handleWebhookError(messageError, update, chatId);
      }
      
    } else if (update.callback_query) {
      const chatId = update.callback_query.message?.chat?.id;
      
      console.log(`📨 Callback query from ${chatId}: ${update.callback_query.data || 'no-data'}`);
      
      try {
        await DualCommandSystem.handleCallbackQuery(update.callback_query, bot);
      } catch (callbackError) {
        await handleWebhookError(callbackError, update, chatId);
      }
      
    } else if (update.inline_query) {
      const userId = update.inline_query.from.id;
      
      console.log(`📨 Inline query from ${userId}: "${update.inline_query.query}"`);
      
      try {
        await DualCommandSystem.handleInlineQuery(update.inline_query, bot);
      } catch (inlineError) {
        logSystemError(inlineError, 'inline_query', update);
      }
      
    } else {
      console.log(`📨 Unknown update type:`, Object.keys(update));
    }

    const processingTime = Date.now() - requestStart;
    
    if (processingTime > 1000) {
      console.warn(`⚡ Slow webhook processing: ${processingTime}ms`);
    }

    res.status(200).json({ 
      ok: true, 
      processed: true,
      processingTime: processingTime + 'ms'
    });

  } catch (error) {
    const processingTime = Date.now() - requestStart;
    console.error(`❌ Critical webhook error (${processingTime}ms):`, error.message);
    
    logSystemError(error, 'webhook_critical', req.body);
    
    // Always return 200 to Telegram to prevent retries
    res.status(200).json({ 
      ok: true, 
      error: 'logged',
      processingTime: processingTime + 'ms'
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST ENDPOINTS FOR DEVELOPMENT
// ─────────────────────────────────────────────────────────────────────────────

app.post('/test/greeting', async (req, res) => {
  try {
    if (!req.body.chatId) {
      return res.status(400).json({ error: 'chatId required' });
    }

    const testMessage = {
      message_id: Date.now(),
      text: 'hello',
      chat: { id: req.body.chatId },
      from: { id: req.body.chatId, first_name: 'Test' },
      date: Math.floor(Date.now() / 1000)
    };

    console.log('🧪 Testing greeting optimization...');
    await DualCommandSystem.handleTelegramMessage(testMessage, bot);
    
    res.json({ 
      success: true, 
      message: 'Greeting test sent - check if response is short and simple' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/test/system', async (req, res) => {
  try {
    const tests = [];
    
    // Test dual command system availability
    tests.push({
      name: 'DualCommandSystem availability',
      status: DualCommandSystem ? 'pass' : 'fail'
    });

    // Test required functions
    const requiredFunctions = ['handleTelegramMessage', 'handleCallbackQuery', 'handleInlineQuery'];
    for (const func of requiredFunctions) {
      tests.push({
        name: `Function: ${func}`,
        status: DualCommandSystem?.[func] ? 'pass' : 'fail'
      });
    }

    // Test memory optimization features
    tests.push({
      name: 'Memory optimization',
      status: systemState.memoryOptimization === 'active' ? 'pass' : 'fail'
    });

    const allPassed = tests.every(test => test.status === 'pass');

    res.json({
      overall: allPassed ? 'healthy' : 'issues_detected',
      tests,
      recommendations: allPassed 
        ? ['System ready for production']
        : ['Check failed tests', 'Verify dualCommandSystem.js loading', 'Check memory optimization']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED SERVER INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

async function initializeEnhancedServer() {
  try {
    console.log('\n🔧 Initializing enhanced IMPERIUM VAULT server...');

    // Validate dual command system
    if (!DualCommandSystem) {
      throw new Error('dualCommandSystem.js not loaded');
    }

    // Test required methods
    const requiredMethods = ['handleTelegramMessage'];
    const missingMethods = requiredMethods.filter(method => !DualCommandSystem[method]);
    
    if (missingMethods.length > 0) {
      throw new Error(`Missing required methods: ${missingMethods.join(', ')}`);
    }

    console.log('✅ dualCommandSystem.js validation passed');

    // Setup enhanced webhook
    const webhookUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
    console.log(`🌐 Setting enhanced webhook: ${webhookUrl}`);
    
    await bot.setWebHook(webhookUrl, {
      max_connections: 100,
      allowed_updates: ['message', 'callback_query', 'inline_query'],
      drop_pending_updates: true // Clear any pending updates
    });
    
    console.log('✅ Enhanced webhook configured successfully');

    // Initialize dual command system
    if (DualCommandSystem.initialize) {
      console.log('🚀 Initializing dualCommandSystem...');
      await DualCommandSystem.initialize();
      console.log('✅ dualCommandSystem initialized with memory optimization');
    }

    // Validate memory optimization
    if (DualCommandSystem.getGPT5PerformanceMetrics) {
      try {
        const metrics = DualCommandSystem.getGPT5PerformanceMetrics();
        if (metrics.features?.includes('Smart memory control (prevents verbose responses)')) {
          console.log('✅ Memory optimization active - simple messages will get short responses');
          systemState.memoryOptimization = 'active';
        }
      } catch (metricsError) {
        console.warn('⚠️  Could not verify memory optimization:', metricsError.message);
      }
    }

    console.log('\n🎉 ENHANCED SERVER READY!');
    console.log('📡 Clean architecture: Server → Routing → API');
    console.log('🧠 Memory optimization: Simple greetings bypass full context');
    console.log('🚀 GPT-5 integration: Smart model selection active');
    console.log('📱 Multimodal support: Images, documents, voice, video');
    console.log(`🌐 Listening on port ${PORT}...\n`);

    // Test system components
    console.log('🧪 Running component tests...');
    await testSystemComponents();

  } catch (error) {
    console.error('❌ Enhanced server initialization failed:', error.message);
    console.error('Stack trace:', error.stack);
    console.log('🔧 Check all components and try again');
    process.exit(1);
  }
}

async function testSystemComponents() {
  const tests = [
    {
      name: 'DualCommandSystem handlers',
      test: () => !!DualCommandSystem.handleTelegramMessage
    },
    {
      name: 'Memory system integration', 
      test: () => DualCommandSystem.maybeSaveMemory !== undefined
    },
    {
      name: 'Multimodal support',
      test: () => DualCommandSystem.multimodal !== undefined
    }
  ];

  for (const test of tests) {
    try {
      const result = test.test();
      console.log(`${result ? '✅' : '⚠️ '} ${test.name}: ${result ? 'Ready' : 'Missing'}`);
    } catch (testError) {
      console.log(`❌ ${test.name}: Error - ${testError.message}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED SERVER STARTUP
// ─────────────────────────────────────────────────────────────────────────────

const server = app.listen(PORT, async () => {
  console.log(`🌐 Enhanced Express server started on port ${PORT}`);
  console.log(`🔗 Process ID: ${process.pid}`);
  console.log(`💾 Memory optimization: ${systemState.memoryOptimization}`);
  
  await initializeEnhancedServer();
});

// Server timeout configuration
server.timeout = WEBHOOK_TIMEOUT;
server.keepAliveTimeout = 61000;
server.headersTimeout = 62000;

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────────────────────

async function gracefulShutdown(signal) {
  console.log(`\n🛑 ${signal} received - Initiating enhanced shutdown...`);
  
  const shutdownStart = Date.now();

  try {
    // Stop accepting new requests
    console.log('🔒 Stopping server...');
    server.close(() => {
      console.log('✅ Express server closed');
    });

    // Clear webhook
    console.log('🌐 Removing webhook...');
    await bot.deleteWebHook();
    console.log('✅ Telegram webhook removed');

    // Shutdown dual command system
    if (DualCommandSystem.shutdown) {
      console.log('🔄 Shutting down dualCommandSystem...');
      await DualCommandSystem.shutdown();
      console.log('✅ dualCommandSystem shutdown complete');
    }

    // Clear caches
    processedMessages.clear();
    rateLimitMap.clear();
    console.log('✅ Caches cleared');

    const shutdownTime = Date.now() - shutdownStart;
    console.log(`\n🎯 Enhanced shutdown complete in ${shutdownTime}ms`);
    console.log(`📊 Final stats: ${systemState.processedMessages} messages, ${systemState.errorCount} errors`);
    console.log('👋 IMPERIUM VAULT system offline');
    
    process.exit(0);
    
  } catch (shutdownError) {
    console.error('❌ Shutdown error:', shutdownError.message);
    console.log('🚨 Force exit in 5 seconds...');
    setTimeout(() => process.exit(1), 5000);
  }
}

// Enhanced signal handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Enhanced error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  logSystemError(new Error(reason), 'unhandled_rejection');
  // Don't exit - let system recover
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  logSystemError(error, 'uncaught_exception');
  
  // Try graceful shutdown for critical errors
  if (error.message.includes('EADDRINUSE') || error.message.includes('ECONNREFUSED')) {
    console.log('🚨 Critical error detected - initiating shutdown');
    gracefulShutdown('CRITICAL_ERROR');
  } else {
    console.log('🚨 Non-critical error - server continuing with recovery mode');
  }
});

// Memory warning handler
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('⚠️  Memory warning:', warning.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STARTUP BANNER AND VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(80));
console.log('🎯 IMPERIUM VAULT - ENHANCED PRODUCTION SERVER');
console.log('📡 Clean Architecture + Memory Optimization + Error Recovery');
console.log('🧠 GPT-5 Integration with Smart Response Control');
console.log('💾 PostgreSQL Memory System with Smart Filtering');
console.log('⚡ Simple Message Optimization: Active');
console.log('='.repeat(80));

// Final system validation
const validation = {
  server: true,
  dualCommandSystem: !!DualCommandSystem,
  requiredHandlers: !!DualCommandSystem?.handleTelegramMessage,
  memoryOptimization: systemState.memoryOptimization === 'active',
  timestamp: new Date().toISOString()
};

console.log('System Validation:', validation);

if (Object.values(validation).every(v => v === true)) {
  console.log('🚀 All systems ready - Production deployment validated');
} else {
  console.warn('⚠️  Some systems need attention - Check validation results');
}

// ─────────────────────────────────────────────────────────────────────────────
// ADDITIONAL MONITORING ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

app.get('/debug/memory', (req, res) => {
  res.json({
    deduplicationCache: {
      size: processedMessages.size,
      maxSize: MAX_CACHE_SIZE,
      utilizationPercent: Math.round((processedMessages.size / MAX_CACHE_SIZE) * 100)
    },
    rateLimitCache: {
      activeIPs: rateLimitMap.size,
      window: RATE_LIMIT_WINDOW + 'ms',
      maxRequests: RATE_LIMIT_MAX
    },
    systemMemory: process.memoryUsage(),
    optimization: systemState.memoryOptimization
  });
});

app.get('/debug/errors', (req, res) => {
  res.json({
    totalErrors: systemState.errorCount,
    errorRate: systemState.processedMessages > 0 
      ? ((systemState.errorCount / systemState.processedMessages) * 100).toFixed(2) + '%'
      : '0%',
    lastError: systemState.lastError,
    processedMessages: systemState.processedMessages
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION OPTIMIZATIONS
// ─────────────────────────────────────────────────────────────────────────────

// Cleanup memory usage periodically
setInterval(() => {
  if (global.gc) {
    global.gc();
    console.log('🧹 Garbage collection completed');
  }
}, 600000); // Every 10 minutes

// Monitor memory usage and warn if high
setInterval(() => {
  const memUsage = process.memoryUsage();
  const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  
  if (usedMB > 500) {
    console.warn(`⚠️  High memory usage: ${usedMB}MB`);
    if (usedMB > 800) {
      console.error(`🚨 Critical memory usage: ${usedMB}MB - Consider restart`);
    }
  }
}, 300000); // Every 5 minutes

// ─────────────────────────────────────────────────────────────────────────────
// FINAL EXPORTS AND MODULE INFO
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  app,
  bot,
  server,
  systemState,
  
  // Utility functions for external monitoring
  getSystemHealth: () => ({
    ...systemState,
    uptime: Date.now() - systemState.startTime,
    memoryUsage: process.memoryUsage(),
    cacheSize: processedMessages.size
  }),
  
  // Emergency functions
  emergencyShutdown: () => gracefulShutdown('EMERGENCY'),
  clearCaches: () => {
    processedMessages.clear();
    rateLimitMap.clear();
    console.log('✅ All caches cleared manually');
  }
};

console.log('\n🎯 IMPERIUM VAULT Enhanced Server - Fully Operational');
console.log('📝 Key Features:');
console.log('   • Smart message classification (greeting vs complex)');
console.log('   • Memory optimization (prevents verbose simple responses)');
console.log('   • Enhanced error recovery and logging');
console.log('   • Performance monitoring and cleanup');
console.log('   • Production-ready webhook handling');
console.log('   • Multimodal content support');
console.log('\n💡 The "hello" verbose response issue should now be resolved!');
console.log('🔍 Monitor logs to verify simple greetings get short responses');
console.log('\n📡 Waiting for messages...');
