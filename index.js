 #!/usr/bin/env node

// IMPERIUM VAULT SYSTEM - CLEAN INDEX.JS
// Pure server setup → ALL routing handled by dualCommandSystem.js
// Clean separation: index.js (server) → dualCommandSystem.js (routing) → openaiClient.js (api)

console.log('IMPERIUM VAULT - Clean Server Starting...');
console.log('Clean Flow: index.js (server) → dualCommandSystem.js (routing) → openaiClient.js (api)');
console.log('Routing Logic: 100% in dualCommandSystem.js (no conflicts)');
console.log('Mode: Railway Webhook Production');

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
// SINGLE IMPORT - ALL ROUTING HANDLED BY DUAL COMMAND SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
let DualCommandSystem;
try {
  DualCommandSystem = require('./utils/dualCommandSystem');
  console.log('✅ dualCommandSystem.js loaded - ALL routing handled here');
} catch (error) {
  console.error('❌ CRITICAL: dualCommandSystem.js failed to load:', error.message);
  process.exit(1);
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
    multimodal_support: DualCommandSystem && DualCommandSystem.handleTelegramMessage ? 'ready' : 'missing',
    timestamp: new Date().toISOString()
  });
});

app.get('/status', (req, res) => {
  res.json({ 
    server: 'online', 
    routing: DualCommandSystem ? 'ready' : 'failed',
    handlers: {
      telegram: !!DualCommandSystem.handleTelegramMessage,
      callback: !!DualCommandSystem.handleCallbackQuery,
      inline: !!DualCommandSystem.handleInlineQuery
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
// MAIN WEBHOOK ENDPOINT - CLEAN ROUTING TO DUAL COMMAND SYSTEM
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

    // ✨ CLEAN ROUTING - EVERYTHING GOES TO DUAL COMMAND SYSTEM
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
// SYSTEM INITIALIZATION - SERVER SETUP ONLY
// ─────────────────────────────────────────────────────────────────────────────
async function initializeServer() {
  try {
    console.log('\n🔧 Initializing clean server...');

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

    console.log('\n🎉 CLEAN SERVER READY!');
    console.log('📡 All message routing handled by dualCommandSystem.js');
    console.log('🚀 No routing conflicts - clean architecture');
    console.log(`🌐 Listening on port ${PORT}...\n`);

  } catch (error) {
    console.error('❌ Server initialization failed:', error.message);
    console.log('🔧 Check dualCommandSystem.js and try again');
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

console.log('🎯 Clean Server Architecture Active - Zero Routing Conflicts!');
