// src/bot.js - Main Vault Claude Bot
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const express = require('express');

// Import handlers
const { handleStart, handleHelp, handleCodex, handleCapital, handleLegacy, handleVault } = require('./handlers/commandHandlers');
const { handleCallback } = require('./handlers/callbackHandlers');
const { handleMessage } = require('./handlers/messageHandlers');

// Load environment variables
dotenv.config();

// Configuration
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

// Initialize bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { 
  polling: true,
  filepath: false
});

// Bot startup
console.log('🏛️ Vault Claude AI Bot initializing...');
console.log('⚡ Sovereign intelligence systems online');

// Command handlers
bot.onText(/\/start/, (msg) => handleStart(bot, msg));
bot.onText(/\/help/, (msg) => handleHelp(bot, msg));
bot.onText(/\/codex/, (msg) => handleCodex(bot, msg));
bot.onText(/\/capital/, (msg) => handleCapital(bot, msg));
bot.onText(/\/legacy/, (msg) => handleLegacy(bot, msg));
bot.onText(/\/vault/, (msg) => handleVault(bot, msg));

// Callback query handler
bot.on('callback_query', (query) => handleCallback(bot, query));

// Message handler (for AI responses)
bot.on('message', async (msg) => {
  // Skip if it's a command
  if (msg.text && msg.text.startsWith('/')) return;
  
  await handleMessage(bot, msg);
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('🚨 Polling error:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Vault Claude shutting down...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Vault Claude terminated');
  bot.stopPolling();
  process.exit(0);
});

// Health check server for Railway
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    bot: 'Vault Claude AI',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    services: {
      telegram: 'connected',
      openai: 'ready'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
});

console.log('🏛️ Vault Claude fully operational - Sovereign intelligence active');
console.log('⚡ Ready to architect empires and protect wealth');

module.exports = { bot };
