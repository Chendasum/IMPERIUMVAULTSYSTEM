// FOREX API INTEGRATION SERVICE - METAAPI CONNECTION
// Ultimate Vault Claude MetaApi Integration for XM Account 68920491

const axios = require('axios');
const https = require('https');

// Configure axios for MetaApi with proper SSL handling
const axiosConfig = {
  timeout: 30000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true
  })
};

// Create axios instance for MetaApi
const metaApiAxios = axios.create(axiosConfig);

class ForexApiIntegration {
  constructor() {
    // MetaApi configuration for XM account
    this.metaApiToken = process.env.METAAPI_TOKEN || null;
    this.accountId = process.env.METAAPI_ACCOUNT_ID || '4047c1bf-841e-4e9f-8513-bee33cee41f6'; // Your XM account ID
    this.provisioningUrl = 'https://mt-provisioning-api-v1.london.agiliumtrade.ai';
    this.clientUrl = 'https://mt-client-api-v1.london.agiliumtrade.ai';
    
    // Trading parameters
    this.maxRiskPerTrade = 0.02; // 2% max risk per trade
    this.maxDailyTrades = 5;
    this.defaultLotSize = 0.01;
  }

  // Initialize API connection
  async initialize() {
    if (!this.metaApiToken) {
      console.log('⚠️ MetaApi token not configured. Add METAAPI_TOKEN to environment variables.');
      return false;
    }

    try {
      const accountInfo = await this.getAccountInformation();
      console.log('✅ MetaApi connection established');
      console.log(`💰 Account Balance: $${accountInfo.balance}`);
      console.log(`📊 Account Equity: $${accountInfo.equity}`);
      return true;
    } catch (error) {
      console.error('❌ MetaApi connection failed:', error.message);
      return false;
    }
  }

  // Get account information
  async getAccountInformation() {
    try {
      // Get account information directly from client API (simplified approach)
      const response = await metaApiAxios.get(
        `${this.clientUrl}/users/current/accounts/${this.accountId}/account-information`,
        {
          headers: {
            'auth-token': this.metaApiToken,
            'Accept': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  // Get current positions
  async getCurrentPositions() {
    try {
      const response = await metaApiAxios.get(
        `${this.clientUrl}/users/current/accounts/${this.accountId}/positions`,
        {
          headers: {
            'auth-token': this.metaApiToken,
            'Accept': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get positions: ${error.message}`);
    }
  }

  // Get market prices
  async getMarketPrices(symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD']) {
    try {
      const prices = {};
      for (const symbol of symbols) {
        const response = await metaApiAxios.get(
          `${this.clientUrl}/users/current/accounts/${this.accountId}/symbols/${symbol}/current-price`,
          {
            headers: {
              'auth-token': this.metaApiToken,
              'Accept': 'application/json'
            }
          }
        );
        prices[symbol] = response.data;
      }
      return prices;
    } catch (error) {
      throw new Error(`Failed to get market prices: ${error.message}`);
    }
  }

  // Place trade order
  async placeTrade(symbol, type, volume, stopLoss = null, takeProfit = null) {
    try {
      const orderData = {
        symbol: symbol,
        type: type, // 'ORDER_TYPE_BUY' or 'ORDER_TYPE_SELL'
        volume: volume,
        comment: 'Ultimate Vault Claude Auto Trade'
      };

      if (stopLoss) orderData.stopLoss = stopLoss;
      if (takeProfit) orderData.takeProfit = takeProfit;

      const response = await metaApiAxios.post(
        `${this.clientUrl}/users/current/accounts/${this.accountId}/trade`,
        orderData,
        {
          headers: {
            'auth-token': this.metaApiToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Trade placed: ${symbol} ${type} ${volume} lots`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to place trade: ${error.message}`);
    }
  }

  // Calculate position size based on risk management
  calculatePositionSize(accountBalance, riskAmount, stopLossDistance) {
    const riskPercentage = riskAmount / accountBalance;
    if (riskPercentage > this.maxRiskPerTrade) {
      console.log(`⚠️ Risk too high. Reducing to ${this.maxRiskPerTrade * 100}%`);
      riskAmount = accountBalance * this.maxRiskPerTrade;
    }

    // Calculate lot size based on stop loss distance
    const lotSize = riskAmount / stopLossDistance / 10; // Simplified calculation
    return Math.max(0.01, Math.min(1.0, Math.round(lotSize * 100) / 100));
  }

  // AI-powered market analysis (placeholder for AI integration)
  async analyzeMarket(symbol) {
    try {
      const price = await this.getMarketPrices([symbol]);
      const currentPrice = price[symbol];
      
      // Simple technical analysis (can be enhanced with AI)
      const analysis = {
        symbol: symbol,
        currentPrice: currentPrice.bid,
        trend: 'neutral', // Can be enhanced with AI analysis
        signal: 'hold', // 'buy', 'sell', or 'hold'
        confidence: 0.5, // 0-1 confidence level
        recommendation: {
          action: 'hold',
          entry: currentPrice.bid,
          stopLoss: currentPrice.bid * 0.99, // 1% stop loss
          takeProfit: currentPrice.bid * 1.02, // 2% take profit
          lotSize: this.defaultLotSize
        }
      };

      return analysis;
    } catch (error) {
      throw new Error(`Market analysis failed: ${error.message}`);
    }
  }

  // Get trading status summary
  async getTradingStatus() {
    try {
      const [accountInfo, positions, prices] = await Promise.all([
        this.getAccountInformation(),
        this.getCurrentPositions(),
        this.getMarketPrices()
      ]);

      return {
        account: {
          balance: accountInfo.balance,
          equity: accountInfo.equity,
          margin: accountInfo.margin,
          freeMargin: accountInfo.freeMargin
        },
        positions: positions.length,
        openTrades: positions.filter(p => p.type === 'POSITION_TYPE_BUY' || p.type === 'POSITION_TYPE_SELL'),
        marketPrices: prices,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get trading status: ${error.message}`);
    }
  }

  // Close position
  async closePosition(positionId) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/current/accounts/${this.accountId}/positions/${positionId}/close`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.metaApiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Position closed: ${positionId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to close position: ${error.message}`);
    }
  }
}

module.exports = ForexApiIntegration;
