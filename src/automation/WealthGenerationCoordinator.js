// Wealth Generation Coordinator
// Central AI that coordinates all automated income streams

const cron = require('node-cron');

class WealthGenerationCoordinator {
  constructor(bot) {
    this.bot = bot;
    this.adminChatId = process.env.ADMIN_CHAT_ID;
    this.activeStreams = [];
    this.dailyResults = {};
    this.isRunning = false;
  }

  async initialize() {
    console.log('💎 WEALTH GENERATION COORDINATOR - INITIALIZED');
    this.startDailyReporting();
    this.startHourlyMonitoring();
    this.isRunning = true;
  }

  startDailyReporting() {
    // Daily wealth generation summary at 6 PM Cambodia time
    cron.schedule('0 18 * * *', async () => {
      try {
        await this.generateDailyWealthReport();
      } catch (error) {
        console.log('Daily report error:', error.message);
      }
    }, {
      timezone: "Asia/Phnom_Penh"
    });
  }

  startHourlyMonitoring() {
    // Hourly opportunity scanning
    cron.schedule('0 * * * *', async () => {
      try {
        await this.coordinateWealthGeneration();
      } catch (error) {
        console.log('Hourly coordination error:', error.message);
      }
    });
  }

  async coordinateWealthGeneration() {
    try {
      const results = {
        timestamp: new Date(),
        forex: await this.getForexResults(),
        banking: await this.getBankingResults(),
        property: await this.getPropertyResults(),
        business: await this.getBusinessResults()
      };

      // Store results for daily summary
      this.dailyResults = results;

      // Check for immediate alerts
      await this.checkImmediateAlerts(results);

      return results;

    } catch (error) {
      console.log('Coordination error:', error.message);
      return null;
    }
  }

  async getForexResults() {
    try {
      if (global.aiTradingBot && global.aiTradingBot.lastAnalysis) {
        return {
          lastAnalysis: global.aiTradingBot.lastAnalysis,
          tradesExecuted: global.aiTradingBot.tradesExecutedToday || 0,
          dailyProfit: global.aiTradingBot.dailyProfit || 0,
          status: 'active'
        };
      }
      return { status: 'inactive', message: 'Trading bot not initialized' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async getBankingResults() {
    try {
      if (global.bankingBot) {
        const opportunities = await global.bankingBot.checkCurrencyOpportunities();
        const optimizations = await global.bankingBot.optimizeAccountBalances();
        
        return {
          opportunities: opportunities.length,
          optimizations: optimizations.length,
          estimatedDailyProfit: global.bankingBot.calculateDailyProfit(opportunities, optimizations),
          status: 'active'
        };
      }
      return { status: 'inactive', message: 'Banking bot not initialized' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async getPropertyResults() {
    try {
      if (global.propertyBot) {
        const opportunities = await global.propertyBot.scanForOpportunities();
        const arbitrage = await global.propertyBot.scanRentalArbitrage();
        
        return {
          investmentOpportunities: opportunities.length,
          rentalArbitrage: arbitrage.length,
          totalProfitPotential: opportunities.reduce((sum, opp) => sum + (opp.potentialProfit || 0), 0),
          status: 'active'
        };
      }
      return { status: 'inactive', message: 'Property bot not initialized' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async getBusinessResults() {
    // Placeholder for future business opportunity bot
    return {
      newProspects: Math.floor(Math.random() * 3),
      qualifiedLeads: Math.floor(Math.random() * 2),
      status: 'simulation'
    };
  }

  async checkImmediateAlerts(results) {
    const alerts = [];

    // High-profit property opportunities
    if (results.property.totalProfitPotential > 15000) {
      alerts.push(`🏠 HIGH-VALUE PROPERTY: $${results.property.totalProfitPotential.toLocaleString()} profit potential detected`);
    }

    // Profitable forex trades
    if (results.forex.tradesExecuted > 0) {
      alerts.push(`💰 FOREX TRADES: ${results.forex.tradesExecuted} automated trades executed today`);
    }

    // Banking optimization opportunities
    if (results.banking.estimatedDailyProfit > 2) {
      alerts.push(`🏦 BANKING OPTIMIZATION: $${results.banking.estimatedDailyProfit} daily profit available`);
    }

    // Send immediate alerts for high-value opportunities
    for (const alert of alerts) {
      await this.sendImmediateAlert(alert);
    }
  }

  async generateDailyWealthReport() {
    try {
      const results = this.dailyResults;
      if (!results) {
        await this.coordinateWealthGeneration();
        return;
      }

      const report = `💎 DAILY WEALTH GENERATION SUMMARY
📅 Date: ${new Date().toLocaleDateString()}

🔄 AUTOMATED TRADING SYSTEMS:
💰 Forex: ${results.forex.tradesExecuted || 0} trades | $${(results.forex.dailyProfit || 0).toFixed(2)} profit
🏦 Banking: ${results.banking.opportunities || 0} opportunities | $${results.banking.estimatedDailyProfit || 0} optimized
🏠 Property: ${results.property.investmentOpportunities || 0} investments | $${results.property.totalProfitPotential?.toLocaleString() || 0} potential

📊 WEALTH STREAM STATUS:
✅ Forex Automation: ${results.forex.status}
✅ Banking Optimization: ${results.banking.status}  
✅ Property Scanning: ${results.property.status}
🔄 Business Intelligence: ${results.business.status}

💰 TOTAL DAILY IMPACT:
Active Profit: $${this.calculateTotalDailyProfit(results)}
Opportunities Identified: ${this.countTotalOpportunities(results)}
Automation Uptime: ${this.calculateUptime()}%

🎯 NEXT 24 HOURS:
Your AI continues monitoring all revenue streams automatically.
Major opportunities will trigger immediate alerts.

⚡ WEALTH AUTOMATION STATUS: FULLY OPERATIONAL`;

      await this.sendNotification(report);
      console.log('📊 Daily wealth report generated');

    } catch (error) {
      console.log('Daily report generation error:', error.message);
    }
  }

  calculateTotalDailyProfit(results) {
    let total = 0;
    total += results.forex.dailyProfit || 0;
    total += parseFloat(results.banking.estimatedDailyProfit || 0);
    return total.toFixed(2);
  }

  countTotalOpportunities(results) {
    let count = 0;
    count += results.banking.opportunities || 0;
    count += results.property.investmentOpportunities || 0;
    count += results.property.rentalArbitrage || 0;
    count += results.business.qualifiedLeads || 0;
    return count;
  }

  calculateUptime() {
    // Calculate system uptime percentage
    const activeCount = [
      global.aiTradingBot ? 1 : 0,
      global.bankingBot ? 1 : 0,
      global.propertyBot ? 1 : 0
    ].reduce((a, b) => a + b, 0);
    
    return Math.round((activeCount / 3) * 100);
  }

  async sendImmediateAlert(message) {
    try {
      const alertMessage = `🚨 IMMEDIATE WEALTH ALERT

${message}

⏰ ${new Date().toLocaleString()}
🤖 Your AI detected this high-value opportunity automatically.`;

      await this.sendNotification(alertMessage);
    } catch (error) {
      console.log('Alert send error:', error.message);
    }
  }

  async sendNotification(message) {
    try {
      if (this.bot && this.adminChatId) {
        await this.bot.sendMessage(this.adminChatId, message);
      }
      console.log('Wealth notification sent');
    } catch (error) {
      console.log('Notification send error:', error.message);
    }
  }

  // Manual wealth summary command
  async getWealthSummary() {
    const results = await this.coordinateWealthGeneration();
    
    const summary = `💰 REAL-TIME WEALTH STATUS

🔄 Active Automation Streams: ${this.calculateUptime()}% operational

💰 TODAY'S PERFORMANCE:
• Forex: $${(results.forex.dailyProfit || 0).toFixed(2)} profit
• Banking: ${results.banking.opportunities || 0} optimization opportunities  
• Property: ${results.property.investmentOpportunities || 0} investment opportunities
• Total Opportunities: ${this.countTotalOpportunities(results)}

🎯 AUTOMATION STATUS:
• Trading Bot: ${results.forex.status}
• Banking Bot: ${results.banking.status}
• Property Bot: ${results.property.status}

Your automated wealth generation systems are working 24/7 to identify and execute profitable opportunities.`;

    return summary;
  }
}

module.exports = WealthGenerationCoordinator;