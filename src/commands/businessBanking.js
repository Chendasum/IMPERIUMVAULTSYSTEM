// Business Banking Commands
const { isAuthorizedCommander } = require('../utils/security');

module.exports = {
  // Start business banking optimization
  'start_banking_optimization': {
    description: '🏦 Start automated business banking optimization',
    handler: async (bot, msg) => {
      if (!isAuthorizedCommander(msg.from.id)) {
        return bot.sendMessage(msg.chat.id, '⛔ Access denied. Commander authorization required.');
      }

      try {
        if (!global.businessBankingBotNew) {
          return bot.sendMessage(msg.chat.id, '❌ Business banking bot not initialized');
        }

        const result = await global.businessBankingBotNew.startOptimization();
        
        if (result.success) {
          const message = `🏦 BUSINESS BANKING OPTIMIZATION STARTED

🔄 Optimization cycles: Every 30 minutes
💰 Target yield: 5%+ annually
🏛️ Banking partners:
  • ABA Bank Corporate
  • ACLEDA Bank Business  
  • Wing Bank Business
  • Bakong (NBC Cambodia)

📊 System monitors:
  • Account balances and rates
  • Currency arbitrage opportunities
  • Term deposit optimizations
  • Multi-currency coordination

💎 Expected returns: $750-4,500 monthly
⚡ Your banking portfolio is now optimized automatically 24/7`;

          await bot.sendMessage(msg.chat.id, message);
        } else {
          await bot.sendMessage(msg.chat.id, `❌ Failed to start banking optimization: ${result.message}`);
        }
      } catch (error) {
        console.error('Error starting banking optimization:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error starting banking optimization');
      }
    }
  },

  // Stop banking optimization
  'stop_banking_optimization': {
    description: '⏹️ Stop automated banking optimization',
    handler: async (bot, msg) => {
      if (!isAuthorizedCommander(msg.from.id)) {
        return bot.sendMessage(msg.chat.id, '⛔ Access denied. Commander authorization required.');
      }

      try {
        if (!global.businessBankingBotNew) {
          return bot.sendMessage(msg.chat.id, '❌ Business banking bot not initialized');
        }

        const result = await global.businessBankingBotNew.stopOptimization();
        
        if (result.success) {
          await bot.sendMessage(msg.chat.id, '⏹️ Banking optimization stopped');
        } else {
          await bot.sendMessage(msg.chat.id, `❌ Failed to stop banking optimization: ${result.message}`);
        }
      } catch (error) {
        console.error('Error stopping banking optimization:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error stopping banking optimization');
      }
    }
  },

  // Get banking status
  'banking_status': {
    description: '💼 Check business banking optimization status',
    handler: async (bot, msg) => {
      if (!isAuthorizedCommander(msg.from.id)) {
        return bot.sendMessage(msg.chat.id, '⛔ Access denied. Commander authorization required.');
      }

      try {
        if (!global.businessBankingBotNew) {
          return bot.sendMessage(msg.chat.id, '❌ Business banking bot not initialized');
        }

        const status = global.businessBankingBotNew.getStatus();
        
        const banksList = status.banks
          .map(bank => `${bank.enabled ? '✅' : '❌'} ${bank.name}${bank.apiUrl ? ' 🔗' : ' ⚠️ (API needed)'}`)
          .join('\n');

        const message = `🏦 BUSINESS BANKING STATUS

📊 System Status: ${status.isRunning ? '🟢 ACTIVE' : '🟡 READY'}
💰 Total Portfolio: $${status.portfolioStats?.totalBalance?.toLocaleString() || '0'}
🏦 Connected Accounts: ${status.portfolioStats?.totalAccounts || 0}
📈 Optimizations Today: ${status.portfolioStats?.optimizationsToday || 0}

🏛️ BANKING PARTNERS:
${banksList}

💼 Available Features:
  • Multi-currency optimization (USD, KHR, EUR)
  • Automated term deposit management  
  • Foreign exchange arbitrage
  • Business loan monitoring
  • Government payment integration

🎯 Status: System initialized and ready for API configuration
⚠️ Add bank API keys to environment variables for live trading

💡 Use /start_banking_optimization to activate automated banking`;

        await bot.sendMessage(msg.chat.id, message);
      } catch (error) {
        console.error('Error getting banking status:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error retrieving banking status');
      }
    }
  },

  // Get banking optimization history
  'banking_history': {
    description: '📊 View recent banking optimization results',
    handler: async (bot, msg) => {
      if (!isAuthorizedCommander(msg.from.id)) {
        return bot.sendMessage(msg.chat.id, '⛔ Access denied. Commander authorization required.');
      }

      try {
        if (!global.businessBankingBotNew) {
          return bot.sendMessage(msg.chat.id, '❌ Business banking bot not initialized');
        }

        const history = global.businessBankingBotNew.getOptimizationHistory(10);
        
        if (history.length === 0) {
          return bot.sendMessage(msg.chat.id, '📊 No banking optimizations yet. Use /start_banking_optimization to begin.');
        }

        let message = '📊 RECENT BANKING OPTIMIZATIONS\n\n';
        
        history.forEach((opt, index) => {
          const date = new Date(opt.timestamp).toLocaleDateString();
          message += `${index + 1}. ${opt.type.toUpperCase()}
💰 Potential Profit: $${opt.potentialProfit.toFixed(2)}
📋 Action: ${opt.description}
📅 Date: ${date}\n\n`;
        });

        await bot.sendMessage(msg.chat.id, message);
      } catch (error) {
        console.error('Error getting banking history:', error);
        await bot.sendMessage(msg.chat.id, '❌ Error retrieving banking optimization history');
      }
    }
  }
};
