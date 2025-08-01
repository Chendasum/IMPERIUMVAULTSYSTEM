const axios = require('axios');
const crypto = require('crypto');

class CryptoTradingBot {
  constructor(bot) {
    this.bot = bot;
    this.isRunning = false;
    this.tradingInterval = null;
    this.positions = new Map();
    this.tradingHistory = [];
    
    // Trading configuration
    this.config = {
      maxPositionSize: 0.02, // 2% of account per trade
      stopLossPercent: 0.05, // 5% stop loss
      takeProfitPercent: 0.10, // 10% take profit
      confidenceThreshold: 80, // 80% confidence to execute trade
      maxDailyTrades: 10,
      riskPerTrade: 0.01 // 1% account risk per trade
    };
    
    // Supported exchanges
    this.exchanges = {
      binance: {
        apiUrl: 'https://api.binance.com/api/v3',
        testnetUrl: 'https://testnet.binance.vision/api/v3',
        enabled: false
      },
      bybit: {
        apiUrl: 'https://api.bybit.com/v5',
        testnetUrl: 'https://api-testnet.bybit.com/v5',
        enabled: false
      }
    };
    
    // Trading pairs to monitor
    this.tradingPairs = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 
      'ADAUSDT', 'SOLUSDT', 'DOTUSDT', 'MATICUSDT'
    ];
  }

  async initialize() {
    try {
      console.log('🔥 Initializing Crypto Trading Bot...');
      
      // Check for API keys
      await this.checkApiKeys();
      
      // Test exchange connections
      await this.testExchangeConnections();
      
      // Initialize trading state
      this.positions.clear();
      this.tradingHistory = [];
      
      console.log('✅ Crypto Trading Bot initialized successfully');
      return { success: true, message: 'Crypto trading system ready' };
      
    } catch (error) {
      console.error('❌ Crypto Trading Bot initialization error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async checkApiKeys() {
    // Direct API key configuration for Binance
    const binanceApiKey = process.env.BINANCE_API_KEY || 'dSitRkHYTDSrw1TQycYIRkvLKpOVtg4uY0xtsuffu0I02WciEpvfJEJ4amdSxV9d';
    const binanceSecret = process.env.BINANCE_SECRET_KEY || 'e4uLgJ83JLyAEiVEWWWUEWwS0rcBg2hOnV3aigsbcsUXHwwk0h8XarvNqbayWYgJ';
    
    if (binanceApiKey && binanceSecret) {
      this.exchanges.binance.enabled = true;
      this.binanceApiKey = binanceApiKey;
      this.binanceSecret = binanceSecret;
      console.log('✅ BINANCE API keys configured - Live trading ready');
    } else {
      console.log('⚠️ Binance API keys not found');
    }
    
    // Check Bybit keys if available
    if (process.env.BYBIT_API_KEY && process.env.BYBIT_SECRET_KEY) {
      this.exchanges.bybit.enabled = true;
      console.log('✅ BYBIT API keys configured');
    }
    
    if (!this.exchanges.binance.enabled && !this.exchanges.bybit.enabled) {
      throw new Error('No crypto exchange API keys configured');
    }
  }

  async testExchangeConnections() {
    for (const [exchange, config] of Object.entries(this.exchanges)) {
      if (!config.enabled) continue;
      
      try {
        if (exchange === 'binance') {
          await this.testBinanceConnection();
        } else if (exchange === 'bybit') {
          await this.testBybitConnection();
        }
        console.log(`✅ ${exchange.toUpperCase()} connection successful`);
      } catch (error) {
        console.error(`❌ ${exchange.toUpperCase()} connection failed:`, error.message);
        config.enabled = false;
      }
    }
  }

  async testBinanceConnection() {
    const response = await axios.get(`${this.exchanges.binance.apiUrl}/ping`);
    if (response.status !== 200) {
      throw new Error('Binance API not responding');
    }
  }

  async testBybitConnection() {
    const response = await axios.get(`${this.exchanges.bybit.apiUrl}/market/time`);
    if (response.status !== 200) {
      throw new Error('Bybit API not responding');
    }
  }

  async startTrading() {
    if (this.isRunning) {
      return { success: false, message: 'Crypto trading already running' };
    }

    try {
      this.isRunning = true;
      
      // Start trading analysis every 2 minutes (for crypto 24/7)
      this.tradingInterval = setInterval(() => {
        this.analyzeCryptoMarkets();
      }, 2 * 60 * 1000);
      
      console.log('🚀 Crypto Trading Bot started - 24/7 analysis every 2 minutes');
      return { success: true, message: 'Crypto trading automation started' };
      
    } catch (error) {
      this.isRunning = false;
      console.error('❌ Error starting crypto trading:', error.message);
      return { success: false, message: error.message };
    }
  }

  async stopTrading() {
    if (!this.isRunning) {
      return { success: false, message: 'Crypto trading not running' };
    }

    this.isRunning = false;
    if (this.tradingInterval) {
      clearInterval(this.tradingInterval);
      this.tradingInterval = null;
    }
    
    console.log('⏹️ Crypto Trading Bot stopped');
    return { success: true, message: 'Crypto trading automation stopped' };
  }

  async analyzeCryptoMarkets() {
    if (!this.isRunning) return;
    
    try {
      console.log('📊 Analyzing crypto markets for trading opportunities...');
      
      for (const pair of this.tradingPairs) {
        await this.analyzeAndTrade(pair);
      }
      
    } catch (error) {
      console.error('❌ Error analyzing crypto markets:', error.message);
    }
  }

  async analyzeAndTrade(symbol) {
    try {
      // Get market data
      const marketData = await this.getMarketData(symbol);
      if (!marketData) return;
      
      // Calculate technical indicators
      const analysis = await this.performTechnicalAnalysis(marketData);
      
      // Check if we should execute a trade
      if (analysis.confidence >= this.config.confidenceThreshold) {
        await this.executeTrade(symbol, analysis);
      }
      
    } catch (error) {
      console.error(`❌ Error analyzing ${symbol}:`, error.message);
    }
  }

  async getMarketData(symbol) {
    // Try to get data from enabled exchanges
    if (this.exchanges.binance.enabled) {
      return await this.getBinanceMarketData(symbol);
    } else if (this.exchanges.bybit.enabled) {
      return await this.getBybitMarketData(symbol);
    }
    return null;
  }

  async getBinanceMarketData(symbol) {
    try {
      // Get 24hr ticker
      const tickerResponse = await axios.get(`${this.exchanges.binance.apiUrl}/ticker/24hr`, {
        params: { symbol }
      });
      
      // Get recent klines for analysis
      const klinesResponse = await axios.get(`${this.exchanges.binance.apiUrl}/klines`, {
        params: {
          symbol,
          interval: '5m',
          limit: 100
        }
      });
      
      return {
        symbol,
        price: parseFloat(tickerResponse.data.lastPrice),
        priceChange: parseFloat(tickerResponse.data.priceChange),
        priceChangePercent: parseFloat(tickerResponse.data.priceChangePercent),
        volume: parseFloat(tickerResponse.data.volume),
        klines: klinesResponse.data,
        exchange: 'binance'
      };
      
    } catch (error) {
      console.error(`❌ Error getting Binance data for ${symbol}:`, error.message);
      return null;
    }
  }

  async getBybitMarketData(symbol) {
    try {
      // Convert symbol format for Bybit
      const bybitSymbol = symbol.replace('USDT', 'USDT');
      
      const response = await axios.get(`${this.exchanges.bybit.apiUrl}/market/tickers`, {
        params: {
          category: 'spot',
          symbol: bybitSymbol
        }
      });
      
      if (response.data.result.list.length === 0) return null;
      
      const ticker = response.data.result.list[0];
      
      return {
        symbol: bybitSymbol,
        price: parseFloat(ticker.lastPrice),
        priceChange: parseFloat(ticker.price24hPcnt) * parseFloat(ticker.lastPrice),
        priceChangePercent: parseFloat(ticker.price24hPcnt) * 100,
        volume: parseFloat(ticker.volume24h),
        exchange: 'bybit'
      };
      
    } catch (error) {
      console.error(`❌ Error getting Bybit data for ${symbol}:`, error.message);
      return null;
    }
  }

  async performTechnicalAnalysis(marketData) {
    const { symbol, price, priceChangePercent, volume } = marketData;
    
    // Simple but effective analysis for crypto
    let signals = [];
    let confidence = 0;
    let direction = 'HOLD';
    
    // Price momentum analysis
    if (Math.abs(priceChangePercent) >= 15) {
      signals.push(`Strong ${priceChangePercent > 0 ? 'bullish' : 'bearish'} momentum: ${priceChangePercent.toFixed(2)}%`);
      confidence += 40;
      direction = priceChangePercent > 0 ? 'BUY' : 'SELL';
    } else if (Math.abs(priceChangePercent) >= 8) {
      signals.push(`Moderate ${priceChangePercent > 0 ? 'bullish' : 'bearish'} momentum: ${priceChangePercent.toFixed(2)}%`);
      confidence += 25;
      direction = priceChangePercent > 0 ? 'BUY' : 'SELL';
    }
    
    // Volume analysis
    if (volume > 1000000) { // High volume
      signals.push('High volume confirms price movement');
      confidence += 20;
    }
    
    // Weekend volatility bonus (crypto markets are 24/7)
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    if (isWeekend && Math.abs(priceChangePercent) >= 10) {
      signals.push('Weekend volatility opportunity');
      confidence += 15;
    }
    
    // Risk assessment
    const riskLevel = Math.abs(priceChangePercent) > 20 ? 'HIGH' : 
                     Math.abs(priceChangePercent) > 10 ? 'MEDIUM' : 'LOW';
    
    return {
      symbol,
      direction,
      confidence: Math.min(confidence, 95), // Cap at 95%
      signals,
      riskLevel,
      currentPrice: price,
      priceChange: priceChangePercent,
      recommendedAction: confidence >= this.config.confidenceThreshold ? direction : 'HOLD'
    };
  }

  async executeTrade(symbol, analysis) {
    try {
      // Check daily trade limit
      const today = new Date().toDateString();
      const todayTrades = this.tradingHistory.filter(trade => 
        new Date(trade.timestamp).toDateString() === today
      ).length;
      
      if (todayTrades >= this.config.maxDailyTrades) {
        console.log('⚠️ Daily trade limit reached');
        return;
      }
      
      // Check if we already have a position
      if (this.positions.has(symbol)) {
        console.log(`⚠️ Already have position in ${symbol}`);
        return;
      }
      
      // Calculate position size
      const positionSize = this.calculatePositionSize(analysis);
      
      console.log(`🎯 EXECUTING CRYPTO TRADE: ${analysis.direction} ${symbol} - Confidence: ${analysis.confidence}%`);
      console.log(`📊 Analysis: ${analysis.signals.join(', ')}`);
      console.log(`💰 Position Size: ${positionSize} USDT`);
      
      // Execute real trade if Binance is enabled
      let tradeResult = null;
      if (this.exchanges.binance.enabled) {
        tradeResult = await this.executeBinanceTrade(symbol, analysis.direction, positionSize);
      }
      
      const trade = {
        symbol,
        direction: analysis.direction,
        positionSize,
        entryPrice: analysis.currentPrice,
        confidence: analysis.confidence,
        timestamp: new Date().toISOString(),
        status: tradeResult ? 'EXECUTED' : 'SIMULATED',
        exchange: tradeResult ? 'binance' : 'simulation',
        orderId: tradeResult?.orderId || null,
        stopLoss: this.calculateStopLoss(analysis.currentPrice, analysis.direction),
        takeProfit: this.calculateTakeProfit(analysis.currentPrice, analysis.direction)
      };
      
      // Store position and trade
      this.positions.set(symbol, trade);
      this.tradingHistory.push(trade);
      
      // Send notification
      await this.sendTradingNotification(trade, analysis);
      
    } catch (error) {
      console.error(`❌ Error executing trade for ${symbol}:`, error.message);
    }
  }

  calculatePositionSize(analysis) {
    // Risk-based position sizing
    const baseSize = 100; // $100 base position
    const riskMultiplier = analysis.riskLevel === 'LOW' ? 1.5 : 
                          analysis.riskLevel === 'MEDIUM' ? 1.0 : 0.5;
    const confidenceMultiplier = analysis.confidence / 100;
    
    return baseSize * riskMultiplier * confidenceMultiplier;
  }

  calculateStopLoss(entryPrice, direction) {
    const stopPercent = this.config.stopLossPercent;
    return direction === 'BUY' ? 
      entryPrice * (1 - stopPercent) : 
      entryPrice * (1 + stopPercent);
  }

  calculateTakeProfit(entryPrice, direction) {
    const profitPercent = this.config.takeProfitPercent;
    return direction === 'BUY' ? 
      entryPrice * (1 + profitPercent) : 
      entryPrice * (1 - profitPercent);
  }

  async executeBinanceTrade(symbol, direction, positionSize) {
    try {
      const timestamp = Date.now();
      const side = direction === 'BUY' ? 'BUY' : 'SELL';
      
      // Get current price to calculate quantity
      const tickerResponse = await axios.get(`${this.exchanges.binance.apiUrl}/ticker/price`, {
        params: { symbol }
      });
      const currentPrice = parseFloat(tickerResponse.data.price);
      const quantity = (positionSize / currentPrice).toFixed(6);
      
      const params = {
        symbol,
        side,
        type: 'MARKET',
        quantity,
        timestamp,
        recvWindow: 60000
      };
      
      // Create signature
      const queryString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      const signature = crypto
        .createHmac('sha256', this.binanceSecret)
        .update(queryString)
        .digest('hex');
      
      // Execute order
      const response = await axios.post(`${this.exchanges.binance.apiUrl}/order`, null, {
        params: { ...params, signature },
        headers: {
          'X-MBX-APIKEY': this.binanceApiKey
        }
      });
      
      console.log('✅ Binance trade executed:', response.data);
      return {
        orderId: response.data.orderId,
        status: response.data.status,
        executedQty: response.data.executedQty,
        fills: response.data.fills
      };
      
    } catch (error) {
      console.error('❌ Binance trade error:', error.response?.data || error.message);
      return null;
    }
  }

  async sendTradingNotification(trade, analysis) {
    const message = `🚀 CRYPTO TRADE EXECUTED

💎 Pair: ${trade.symbol}
📈 Direction: ${trade.direction}
💰 Position: $${trade.positionSize}
🎯 Entry: $${trade.entryPrice}
📊 Confidence: ${trade.confidence}%
🛡️ Stop Loss: $${trade.stopLoss.toFixed(4)}
🎉 Take Profit: $${trade.takeProfit.toFixed(4)}
${trade.exchange === 'binance' ? '✅ REAL BINANCE TRADE' : '📊 SIMULATION MODE'}

📋 Analysis: ${analysis.signals.join(', ')}
⏰ Time: ${new Date().toLocaleString()}`;

    // Send to admin
    if (process.env.ADMIN_CHAT_ID) {
      try {
        await this.bot.sendMessage(process.env.ADMIN_CHAT_ID, message);
      } catch (error) {
        console.error('❌ Error sending trading notification:', error.message);
      }
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      exchanges: Object.entries(this.exchanges).map(([name, config]) => ({
        name,
        enabled: config.enabled
      })),
      activePositions: this.positions.size,
      totalTrades: this.tradingHistory.length,
      todayTrades: this.tradingHistory.filter(trade => 
        new Date(trade.timestamp).toDateString() === new Date().toDateString()
      ).length
    };
  }

  getTradingHistory(limit = 10) {
    return this.tradingHistory
      .slice(-limit)
      .reverse()
      .map(trade => ({
        symbol: trade.symbol,
        direction: trade.direction,
        confidence: trade.confidence,
        positionSize: trade.positionSize,
        timestamp: trade.timestamp
      }));
  }
}

module.exports = CryptoTradingBot;