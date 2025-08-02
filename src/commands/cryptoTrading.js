// Crypto Trading Commands
const { isAuthorizedCommander } = require('../utils/security');

module.exports = {
  // Start crypto trading automation
  'start_crypto_trading': {
    description: '🔥 Start automated crypto trading (24/7)',
    handler: async (bot, msg) => {
      if (!isAuthorizedCommander(msg.from.id)) {
        return bot.sendMessage(msg.chat.id, '⛔ Access denied. Commander authorization required.');
      }

      try {
        if (!global.cryptoTradingBot) {
          // Try to create crypto bot if it doesn't exist
          try {
            const CryptoTradingBot = require('../automation/CryptoTradingBot');
            global.cryptoTradingBot = new CryptoTradingBot(bot);
            await global.cryptoTradingBot.initialize();
            console.log('✅ Crypto bot created on-demand');
          } catch (createError) {
            console.error('❌ Failed to create crypto bot:', createError.message);
            return bot.sendMessage(msg.chat.id, '❌ Crypto trading system unavailable. Please try again in a moment.');
          }
        }

        const result = await global.cryptoTradingBot.startTrading();
        
        if (result.success) {
          const message = `🔥 CRYPTO TRADING AUTOMATION STARTED

🤖 AI analyzes crypto markets every 2 minutes
📊 Monitoring: BTC, ETH, BNB, ADA, SOL, DOT, MATIC
⚡ 24/7 operation including weekends
🎯 High confidence threshold: 80%
🛡️ Risk management: 1-2% per trade
💎 Weekend volatility capture enabled

The system will automatically execute trades when high-confidence opportunities are detected.`;

          await bot.sendMessage(msg.chat.id, message);
        } else {
          await bot.sendMessage(msg.chat.id, `❌ Failed to start crypto trading: ${result.message}`);
        }
      } catch (error) {
        console.error('Error starting crypto trading:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error starting crypto trading automation');
      }
    }
  },

  // Stop crypto trading automation
  'stop_crypto_trading': {
    description: '⏹️ Stop automated crypto trading',
    handler: async (bot, msg) => {
      if (!isAuthorizedCommander(msg.from.id)) {
        return bot.sendMessage(msg.chat.id, '⛔ Access denied. Commander authorization required.');
      }

      try {
        if (!global.cryptoTradingBot) {
          return bot.sendMessage(msg.chat.id, '❌ Crypto trading bot not initialized');
        }

        const result = await global.cryptoTradingBot.stopTrading();
        
        if (result.success) {
          await bot.sendMessage(msg.chat.id, '⏹️ Crypto trading automation stopped');
        } else {
          await bot.sendMessage(msg.chat.id, `❌ Failed to stop crypto trading: ${result.message}`);
        }
      } catch (error) {
        console.error('Error stopping crypto trading:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error stopping crypto trading automation');
      }
    }
  },

  // Get crypto trading status
  'crypto_status': {
    description: '📊 Check crypto trading status and performance',
    handler: async (bot, msg) => {
      if (!isAuthorizedCommander(msg.from.id)) {
        return bot.sendMessage(msg.chat.id, '⛔ Access denied. Commander authorization required.');
      }

      try {
        if (!global.cryptoTradingBot) {
          // Try to create crypto bot if it doesn't exist
          try {
            const CryptoTradingBot = require('../automation/CryptoTradingBot');
            global.cryptoTradingBot = new CryptoTradingBot(bot);
            await global.cryptoTradingBot.initialize();
            console.log('✅ Crypto bot created on-demand for status');
          } catch (createError) {
            console.error('❌ Failed to create crypto bot for status:', createError.message);
            return bot.sendMessage(msg.chat.id, '❌ Crypto trading system unavailable. Please try again in a moment.');
          }
        }

        const status = global.cryptoTradingBot.getStatus();
        
        const exchangesList = status.exchanges
          .map(ex => `${ex.enabled ? '✅' : '❌'} ${ex.name}`)
          .join('\n');

        const message = `📊 CRYPTO TRADING STATUS

🤖 Trading Active: ${status.isRunning ? '✅ YES' : '❌ NO'}
📈 Active Positions: ${status.activePositions}
🎯 Total Trades: ${status.totalTrades}
📅 Today's Trades: ${status.todayTrades}

🏦 EXCHANGES:
${exchangesList}

💡 TIP: Use /start_crypto_trading to begin 24/7 automation
📊 Use /crypto_history for recent trading activity`;

        await bot.sendMessage(msg.chat.id, message);
      } catch (error) {
        console.error('Error getting crypto status:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error retrieving crypto trading status');
      }
    }
  },

  // Get crypto trading history
  'crypto_history': {
    description: '📈 View recent crypto trading history',
    handler: async (bot, msg) => {
      if (!isAuthorizedCommander(msg.from.id)) {
        return bot.sendMessage(msg.chat.id, '⛔ Access denied. Commander authorization required.');
      }

      try {
        if (!global.cryptoTradingBot) {
          return bot.sendMessage(msg.chat.id, '❌ Crypto trading bot not initialized');
        }

        const history = global.cryptoTradingBot.getTradingHistory(10);
        
        if (history.length === 0) {
          return bot.sendMessage(msg.chat.id, '📊 No crypto trades executed yet. Use /start_crypto_trading to begin automation.');
        }

        let message = '📈 RECENT CRYPTO TRADES\n\n';
        
        history.forEach((trade, index) => {
          const date = new Date(trade.timestamp).toLocaleDateString();
          message += `${index + 1}. ${trade.symbol} ${trade.direction}
💰 Position: $${trade.positionSize}
🎯 Confidence: ${trade.confidence}%
📅 Date: ${date}\n\n`;
        });

        await bot.sendMessage(msg.chat.id, message);
      } catch (error) {
        console.error('Error getting crypto history:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error retrieving crypto trading history');
      }
    }
  }
};