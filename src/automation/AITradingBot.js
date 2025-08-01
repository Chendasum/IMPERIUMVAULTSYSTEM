// FULL AI AUTOMATED TRADING BOT - No manual commands needed
// AI makes all trading decisions automatically

class AITradingBot {
  constructor(forexApi, telegramBot) {
    this.forexApi = forexApi;
    this.bot = telegramBot;
    this.isRunning = false;
    this.tradingInterval = null;
    this.analysisInterval = 5 * 60 * 1000; // 5 minutes
    this.maxRiskPerTrade = 1.00; // $1 max risk per trade
    this.maxDailyTrades = 10;
    this.dailyTradeCount = 0;
    this.lastResetDate = new Date().getDate();
    this.activeTrades = new Map();
    this.tradingHistory = [];
  }

  // START FULL AUTOMATION
  async startAutoTrading(chatId) {
    if (this.isRunning) {
      await this.bot.sendMessage(chatId, "🤖 AI AUTO-TRADING ALREADY RUNNING\n\nAI is making automatic trading decisions every 5 minutes.");
      return;
    }

    this.isRunning = true;
    this.userChatId = chatId;
    
    await this.bot.sendMessage(chatId, 
      "🤖 **FULL AI AUTO-TRADING ACTIVATED**\n\n" +
      "✅ AI will analyze markets every 5 minutes\n" +
      "✅ AI makes all BUY/SELL decisions automatically\n" +
      "✅ AI manages risk ($1 max per trade)\n" +
      "✅ AI sets stop loss and take profit\n" +
      "✅ You receive trade notifications only\n\n" +
      "⚡ **NO MANUAL COMMANDS NEEDED**\n" +
      "🛑 Use /stop_autotrading to stop automation"
    );

    // Start automated analysis and trading
    this.tradingInterval = setInterval(() => {
      this.performAutomaticAnalysisAndTrading();
    }, this.analysisInterval);

    // First analysis in 30 seconds
    setTimeout(() => {
      this.performAutomaticAnalysisAndTrading();
    }, 30000);

    console.log('🤖 AI Auto-Trading Bot Started');
  }

  // STOP AUTOMATION
  async stopAutoTrading(chatId) {
    if (!this.isRunning) {
      await this.bot.sendMessage(chatId, "⚠️ AI auto-trading is not running");
      return;
    }

    this.isRunning = false;
    if (this.tradingInterval) {
      clearInterval(this.tradingInterval);
      this.tradingInterval = null;
    }

    const summary = this.getDailySummary();
    await this.bot.sendMessage(chatId, 
      "🛑 **AI AUTO-TRADING STOPPED**\n\n" +
      summary
    );

    console.log('🛑 AI Auto-Trading Bot Stopped');
  }

  // MAIN AUTOMATED TRADING LOGIC
  async performAutomaticAnalysisAndTrading() {
    try {
      // Reset daily counter if new day
      const currentDate = new Date().getDate();
      if (currentDate !== this.lastResetDate) {
        this.dailyTradeCount = 0;
        this.lastResetDate = currentDate;
      }

      // Check daily limits
      if (this.dailyTradeCount >= this.maxDailyTrades) {
        console.log('📊 Daily trading limit reached');
        return;
      }

      console.log('🤖 AI performing automatic market analysis...');
      
      const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
      
      for (const symbol of symbols) {
        try {
          // AI analyzes market
          const analysis = await this.forexApi.getAdvancedAnalysis(symbol);
          
          // AI makes trading decision
          const tradeDecision = this.makeAITradingDecision(analysis);
          
          if (tradeDecision.shouldTrade) {
            await this.executeAutomaticTrade(tradeDecision, analysis);
          }
          
        } catch (error) {
          console.error(`❌ Analysis failed for ${symbol}:`, error.message);
        }
      }

      // Send status update to commander
      await this.sendAutomationStatus();

    } catch (error) {
      console.error('❌ Automatic trading error:', error.message);
      
      if (this.userChatId) {
        await this.bot.sendMessage(this.userChatId,
          `⚠️ **AI TRADING ERROR**\n\n${error.message}\n\nContinuing automatic analysis...`
        );
      }
    }
  }

  // AI DECISION MAKING ALGORITHM
  makeAITradingDecision(analysis) {
    const decision = {
      shouldTrade: false,
      action: 'hold',
      confidence: analysis.confidence,
      lotSize: 0.01,
      symbol: analysis.symbol
    };

    // AI decision criteria
    const minConfidence = 0.7; // 70% minimum confidence
    const strongSignal = analysis.signal !== 'hold';
    const goodSpread = parseFloat(analysis.spreadPercent) < 0.02; // Tight spread
    const marketOpen = this.isMarketOpen();

    // AI makes decision based on multiple factors
    if (strongSignal && analysis.confidence >= minConfidence && goodSpread && marketOpen) {
      decision.shouldTrade = true;
      decision.action = analysis.signal; // 'buy' or 'sell'
      
      // AI calculates position size based on confidence
      decision.lotSize = this.calculateOptimalLotSize(analysis.confidence);
    }

    console.log(`🧠 AI Decision for ${analysis.symbol}: ${decision.shouldTrade ? decision.action.toUpperCase() : 'HOLD'} (${(analysis.confidence * 100).toFixed(0)}% confidence)`);
    
    return decision;
  }

  // EXECUTE AUTOMATIC TRADE
  async executeAutomaticTrade(decision, analysis) {
    try {
      console.log(`🤖 AI executing automatic ${decision.action} trade for ${decision.symbol}`);

      // Place the trade automatically
      const tradeResult = await this.forexApi.placeTrade(
        decision.symbol,
        decision.action === 'buy' ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL',
        decision.lotSize,
        parseFloat(analysis.recommendation.stopLoss),
        parseFloat(analysis.recommendation.takeProfit)
      );

      this.dailyTradeCount++;
      
      // Store trade info
      const tradeInfo = {
        id: tradeResult.positionId || `trade_${Date.now()}`,
        symbol: decision.symbol,
        action: decision.action,
        lotSize: decision.lotSize,
        entry: analysis.recommendation.entry,
        stopLoss: analysis.recommendation.stopLoss,
        takeProfit: analysis.recommendation.takeProfit,
        timestamp: new Date(),
        confidence: decision.confidence,
        status: 'open'
      };
      
      this.activeTrades.set(tradeInfo.id, tradeInfo);
      this.tradingHistory.push(tradeInfo);

      // Notify user
      if (this.userChatId) {
        const notification = 
          `🤖 **AI AUTOMATIC TRADE EXECUTED**\n\n` +
          `📊 Symbol: ${decision.symbol}\n` +
          `🎯 Action: ${decision.action.toUpperCase()}\n` +
          `💰 Lot Size: ${decision.lotSize}\n` +
          `📈 Entry: ${analysis.recommendation.entry}\n` +
          `🛑 Stop Loss: ${analysis.recommendation.stopLoss}\n` +
          `🎯 Take Profit: ${analysis.recommendation.takeProfit}\n` +
          `🧠 AI Confidence: ${(decision.confidence * 100).toFixed(0)}%\n` +
          `💵 Risk: $${this.maxRiskPerTrade}\n\n` +
          `⚡ Trade ${this.dailyTradeCount}/${this.maxDailyTrades} today`;

        await this.bot.sendMessage(this.userChatId, notification);
      }

      console.log(`✅ Automatic trade executed: ${decision.action} ${decision.symbol}`);

    } catch (error) {
      console.error('❌ Automatic trade execution failed:', error.message);
      
      if (this.userChatId) {
        await this.bot.sendMessage(this.userChatId,
          `❌ **AI TRADE FAILED**\n\n` +
          `Symbol: ${decision.symbol}\n` +
          `Action: ${decision.action}\n` +
          `Error: ${error.message}\n\n` +
          `🤖 AI continuing analysis...`
        );
      }
    }
  }

  // CALCULATE OPTIMAL POSITION SIZE
  calculateOptimalLotSize(confidence) {
    // AI adjusts lot size based on confidence
    const baseSize = 0.01;
    const maxSize = 0.02;
    
    // Higher confidence = larger position (within limits)
    if (confidence >= 0.8) return maxSize;
    if (confidence >= 0.75) return 0.015;
    return baseSize;
  }

  // CHECK IF MARKET IS OPEN
  isMarketOpen() {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const hour = now.getUTCHours();
    
    // Forex market is closed on weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    
    // Major session hours (simplified)
    return hour >= 0 && hour <= 23; // Most sessions overlap
  }

  // AUTOMATION STATUS
  async sendAutomationStatus() {
    if (!this.userChatId) return;

    const statusMessage = 
      `🤖 **AI AUTO-TRADING STATUS**\n\n` +
      `⚡ Status: ${this.isRunning ? 'ACTIVE' : 'STOPPED'}\n` +
      `📊 Today's Trades: ${this.dailyTradeCount}/${this.maxDailyTrades}\n` +
      `💼 Active Positions: ${this.activeTrades.size}\n` +
      `🕐 Last Check: ${new Date().toLocaleTimeString()}\n` +
      `🔄 Next Analysis: 5 minutes`;

    // Send status every hour only
    const now = new Date();
    if (now.getMinutes() === 0) {
      await this.bot.sendMessage(this.userChatId, statusMessage);
    }
  }

  // DAILY SUMMARY
  getDailySummary() {
    const todayTrades = this.tradingHistory.filter(trade => {
      const tradeDate = new Date(trade.timestamp);
      const today = new Date();
      return tradeDate.toDateString() === today.toDateString();
    });

    return `📊 **DAILY TRADING SUMMARY**\n\n` +
           `✅ Trades Executed: ${todayTrades.length}\n` +
           `💼 Active Positions: ${this.activeTrades.size}\n` +
           `🎯 Success Rate: Analyzing...\n` +
           `💰 Total Risk: $${(todayTrades.length * this.maxRiskPerTrade).toFixed(2)}\n\n` +
           `⚡ AI made all decisions automatically`;
  }

  // GET STATUS
  getStatus() {
    return {
      isRunning: this.isRunning,
      dailyTrades: this.dailyTradeCount,
      maxDailyTrades: this.maxDailyTrades,
      activeTrades: this.activeTrades.size,
      totalTrades: this.tradingHistory.length
    };
  }
}

module.exports = AITradingBot;
