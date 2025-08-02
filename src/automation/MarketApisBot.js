const axios = require('axios');

class MarketApisBot {
  constructor(bot) {
    this.bot = bot;
    this.isRunning = false;
    this.marketData = new Map();
    this.alerts = [];
    this.analysisInterval = null;
    
    // API endpoints and configurations
    this.apis = {
      stocks: {
        alphavantage: 'https://www.alphavantage.co/query',
        finnhub: 'https://finnhub.io/api/v1',
        yahoo: 'https://query1.finance.yahoo.com/v8/finance/chart'
      },
      forex: {
        exchangerate: 'https://api.exchangerate-api.com/v4/latest',
        fxapi: 'https://fxapi.com/api',
        currencylayer: 'https://api.currencylayer.com/live'
      },
      commodities: {
        metals: 'https://api.metals-api.com/v1/latest',
        commodities: 'https://commodities-api.com/api/latest'
      },
      crypto: {
        coinapi: 'https://rest.coinapi.io/v1',
        coingecko: 'https://api.coingecko.com/api/v3',
        binance: 'https://api.binance.com/api/v3'
      }
    };
    
    this.watchlist = {
      stocks: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'META', 'AMZN'],
      forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD'],
      commodities: ['XAU/USD', 'XAG/USD', 'WTI', 'BRENT', 'NATURAL_GAS'],
      crypto: ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'MATIC']
    };
  }

  async initialize() {
    try {
      console.log('🌍 Initializing Market APIs Bot...');
      
      // Test API connections
      await this.testApiConnections();
      
      // Initialize market data cache
      this.marketData.clear();
      
      console.log('✅ Market APIs Bot initialized successfully');
      return { success: true, message: 'Market APIs system ready' };
      
    } catch (error) {
      console.error('❌ Market APIs initialization error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async testApiConnections() {
    const tests = [];
    
    // Test free APIs first
    tests.push(this.testCoinGecko());
    tests.push(this.testYahooFinance());
    tests.push(this.testExchangeRateApi());
    
    // Test premium APIs if keys are available
    if (process.env.ALPHA_VANTAGE_API_KEY) {
      tests.push(this.testAlphaVantage());
    }
    if (process.env.FINNHUB_API_KEY) {
      tests.push(this.testFinnhub());
    }
    if (process.env.CURRENCY_LAYER_API_KEY) {
      tests.push(this.testCurrencyLayer());
    }
    if (process.env.METALS_API_KEY) {
      tests.push(this.testMetalsApi());
    }
    
    const results = await Promise.allSettled(tests);
    
    let workingApis = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        workingApis++;
      }
    });
    
    console.log(`📊 Market APIs Status: ${workingApis}/${tests.length} working`);
    return workingApis > 0;
  }

  async testCoinGecko() {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/ping', {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.log('CoinGecko API test failed:', error.message);
      return false;
    }
  }

  async testYahooFinance() {
    try {
      const response = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/AAPL', {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.log('Yahoo Finance API test failed:', error.message);
      return false;
    }
  }

  async testExchangeRateApi() {
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.log('Exchange Rate API test failed:', error.message);
      return false;
    }
  }

  async testAlphaVantage() {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`, {
        timeout: 5000
      });
      console.log('✅ Alpha Vantage API - CONNECTED (Professional stock data)');
      return response.status === 200;
    } catch (error) {
      console.log('Alpha Vantage API test failed:', error.message);
      return false;
    }
  }

  async testFinnhub() {
    try {
      const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${process.env.FINNHUB_API_KEY}`, {
        timeout: 5000
      });
      console.log('✅ Finnhub API - CONNECTED (Real-time stock news)');
      return response.status === 200;
    } catch (error) {
      console.log('Finnhub API test failed:', error.message);
      return false;
    }
  }

  async testCurrencyLayer() {
    try {
      const response = await axios.get(`https://api.currencylayer.com/live?access_key=${process.env.CURRENCY_LAYER_API_KEY}&currencies=EUR,GBP,JPY`, {
        timeout: 5000
      });
      console.log('✅ CurrencyLayer API - CONNECTED (Professional forex data)');
      return response.status === 200;
    } catch (error) {
      console.log('CurrencyLayer API test failed:', error.message);
      return false;
    }
  }

  async testMetalsApi() {
    try {
      const response = await axios.get(`https://api.metals-api.com/v1/latest?access_key=${process.env.METALS_API_KEY}&base=USD&symbols=XAU,XAG`, {
        timeout: 5000
      });
      console.log('✅ Metals API - CONNECTED (Gold, Silver, Platinum prices)');
      return response.status === 200;
    } catch (error) {
      console.log('Metals API test failed:', error.message);
      return false;
    }
  }

  async startMarketAnalysis() {
    try {
      if (this.isRunning) {
        return { success: false, message: 'Market analysis already running' };
      }

      console.log('🚀 Starting comprehensive market analysis...');
      this.isRunning = true;

      // Initial market scan
      await this.performMarketScan();
      
      // Initial 24/7 crypto scan
      await this.performCrypto24x7Scan();

      // Set up continuous monitoring (every 5 minutes for stocks/forex)
      this.analysisInterval = setInterval(async () => {
        await this.performMarketScan();
      }, 5 * 60 * 1000);

      // Set up 24/7 crypto and currency monitoring (every 2 minutes)
      this.crypto24x7Interval = setInterval(async () => {
        await this.performCrypto24x7Scan();
      }, 2 * 60 * 1000);

      console.log('✅ Market analysis started - including 24/7 crypto monitoring');
      return { 
        success: true, 
        message: 'Market analysis active with 24/7 crypto and currency monitoring',
        interval: '5 min (stocks/forex), 2 min (crypto/currencies - 24/7)'
      };

    } catch (error) {
      console.error('❌ Market analysis start error:', error.message);
      this.isRunning = false;
      return { success: false, message: error.message };
    }
  }

  // NEW: 24/7 Crypto and Currency Monitoring
  async performCrypto24x7Scan() {
    try {
      console.log('🚀 Performing 24/7 crypto & currency scan...');
      
      const crypto24x7Results = {
        timestamp: new Date(),
        crypto: await this.scanCrypto(),
        currencies: await this.scanForexRates()
      };

      // Identify crypto opportunities (24/7 markets)
      const cryptoOpportunities = await this.identifyCrypto24x7Opportunities(crypto24x7Results);
      
      // Store results
      this.marketData.set('crypto_24x7_scan', crypto24x7Results);
      this.marketData.set('crypto_opportunities', cryptoOpportunities);
      
      // Send alerts for significant crypto moves
      if (cryptoOpportunities.high_confidence.length > 0 || cryptoOpportunities.medium_confidence.length > 0) {
        await this.sendCrypto24x7Alerts(cryptoOpportunities);
      }

      console.log(`✅ 24/7 Crypto scan complete - ${cryptoOpportunities.total} opportunities found`);
      return crypto24x7Results;

    } catch (error) {
      console.error('❌ 24/7 Crypto scan error:', error.message);
      return null;
    }
  }

  async performMarketScan() {
    try {
      console.log('📊 Performing comprehensive market scan...');
      
      const scanResults = {
        timestamp: new Date(),
        stocks: await this.scanStocks(),
        forex: await this.scanForex(),
        commodities: await this.scanCommodities(),
        crypto: await this.scanCrypto(),
        alerts: []
      };

      // Analyze for trading opportunities
      const opportunities = await this.identifyTradingOpportunities(scanResults);
      
      // Store results
      this.marketData.set('latest_scan', scanResults);
      this.marketData.set('opportunities', opportunities);

      // Generate alerts if significant opportunities found
      if (opportunities.high_confidence.length > 0) {
        await this.sendTradingAlerts(opportunities);
      }

      console.log(`📈 Market scan complete - ${opportunities.total} opportunities identified`);
      return scanResults;

    } catch (error) {
      console.error('❌ Market scan error:', error.message);
      return null;
    }
  }

  async scanStocks() {
    try {
      const stockData = [];
      
      // Use Yahoo Finance for free stock data
      for (const symbol of this.watchlist.stocks.slice(0, 3)) { // Limit to avoid rate limits
        try {
          const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
            { timeout: 10000 }
          );

          if (response.data?.chart?.result?.[0]) {
            const result = response.data.chart.result[0];
            const meta = result.meta;
            const quotes = result.indicators?.quote?.[0];

            if (quotes && quotes.close?.length > 0) {
              const currentPrice = quotes.close[quotes.close.length - 1];
              const previousPrice = quotes.close[quotes.close.length - 2] || currentPrice;
              const change = currentPrice - previousPrice;
              const changePercent = (change / previousPrice) * 100;

              stockData.push({
                symbol,
                price: currentPrice,
                change,
                changePercent: changePercent.toFixed(2),
                volume: quotes.volume?.[quotes.volume.length - 1] || 0,
                marketCap: meta.marketCap || 'N/A',
                exchange: meta.exchangeName || 'Unknown'
              });
            }
          }
        } catch (symbolError) {
          console.log(`Stock data error for ${symbol}:`, symbolError.message);
        }
      }

      return stockData;
    } catch (error) {
      console.error('Stock scan error:', error.message);
      return [];
    }
  }

  async scanForex() {
    try {
      const forexData = [];
      
      // Get USD rates first
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
        timeout: 10000
      });

      if (response.data?.rates) {
        const rates = response.data.rates;
        
        // Calculate major pairs
        const pairs = [
          { pair: 'EUR/USD', rate: 1 / rates.EUR, change: 0 },
          { pair: 'GBP/USD', rate: 1 / rates.GBP, change: 0 },
          { pair: 'USD/JPY', rate: rates.JPY, change: 0 },
          { pair: 'AUD/USD', rate: 1 / rates.AUD, change: 0 },
          { pair: 'USD/CAD', rate: rates.CAD, change: 0 }
        ];

        pairs.forEach(pair => {
          forexData.push({
            pair: pair.pair,
            rate: pair.rate.toFixed(4),
            change: pair.change,
            changePercent: '0.00',
            bid: (pair.rate * 0.9999).toFixed(4),
            ask: (pair.rate * 1.0001).toFixed(4)
          });
        });
      }

      return forexData;
    } catch (error) {
      console.error('Forex scan error:', error.message);
      return [];
    }
  }

  async scanCommodities() {
    try {
      const commodityData = [];
      
      // For demonstration, we'll use placeholder data
      // In production, you'd integrate with proper commodity APIs
      const commodities = [
        { symbol: 'XAU/USD', name: 'Gold', price: 2045.50, change: 12.30, changePercent: 0.60 },
        { symbol: 'XAG/USD', name: 'Silver', price: 24.85, change: -0.15, changePercent: -0.60 },
        { symbol: 'WTI', name: 'Crude Oil WTI', price: 78.45, change: 1.20, changePercent: 1.55 },
        { symbol: 'BRENT', name: 'Brent Crude', price: 82.10, change: 0.85, changePercent: 1.05 }
      ];

      return commodities.map(commodity => ({
        symbol: commodity.symbol,
        name: commodity.name,
        price: commodity.price,
        change: commodity.change,
        changePercent: commodity.changePercent.toFixed(2),
        trend: commodity.change > 0 ? 'bullish' : 'bearish'
      }));
    } catch (error) {
      console.error('Commodities scan error:', error.message);
      return [];
    }
  }

  async scanCrypto() {
    try {
      const cryptoData = [];
      
      // Use CoinGecko for free crypto data
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano,solana,polkadot,polygon&vs_currencies=usd&include_24hr_change=true',
        { timeout: 10000 }
      );

      if (response.data) {
        const cryptoMap = {
          bitcoin: 'BTC',
          ethereum: 'ETH',
          binancecoin: 'BNB',
          cardano: 'ADA',
          solana: 'SOL',
          polkadot: 'DOT',
          polygon: 'MATIC'
        };

        Object.entries(response.data).forEach(([id, data]) => {
          const symbol = cryptoMap[id];
          if (symbol && data.usd) {
            cryptoData.push({
              symbol,
              price: data.usd,
              change24h: data.usd_24h_change || 0,
              changePercent: (data.usd_24h_change || 0).toFixed(2),
              trend: (data.usd_24h_change || 0) > 0 ? 'bullish' : 'bearish'
            });
          }
        });
      }

      return cryptoData;
    } catch (error) {
      console.error('Crypto scan error:', error.message);
      return [];
    }
  }

  async identifyTradingOpportunities(scanResults) {
    try {
      const opportunities = {
        high_confidence: [],
        medium_confidence: [],
        low_confidence: [],
        total: 0
      };

      // Analyze stocks for opportunities
      scanResults.stocks.forEach(stock => {
        const changePercent = parseFloat(stock.changePercent);
        
        if (Math.abs(changePercent) > 3) {
          const confidence = Math.abs(changePercent) > 5 ? 'high' : 'medium';
          const opportunity = {
            asset: stock.symbol,
            type: 'stock',
            action: changePercent > 0 ? 'momentum_buy' : 'oversold_buy',
            confidence,
            change: changePercent,
            reason: `${Math.abs(changePercent)}% move indicates ${changePercent > 0 ? 'strong momentum' : 'potential oversold bounce'}`
          };
          
          opportunities[`${confidence}_confidence`].push(opportunity);
        }
      });

      // Analyze crypto for opportunities
      scanResults.crypto.forEach(crypto => {
        const changePercent = parseFloat(crypto.changePercent);
        
        if (Math.abs(changePercent) > 5) {
          const confidence = Math.abs(changePercent) > 10 ? 'high' : 'medium';
          const opportunity = {
            asset: crypto.symbol,
            type: 'crypto',
            action: changePercent > 0 ? 'momentum_buy' : 'dip_buy',
            confidence,
            change: changePercent,
            reason: `${Math.abs(changePercent)}% 24h move in volatile crypto market`
          };
          
          opportunities[`${confidence}_confidence`].push(opportunity);
        }
      });

      // Analyze forex for opportunities (looking for significant moves)
      scanResults.forex.forEach(forex => {
        const changePercent = parseFloat(forex.changePercent);
        
        if (Math.abs(changePercent) > 1) {
          const opportunity = {
            asset: forex.pair,
            type: 'forex',
            action: changePercent > 0 ? 'trend_follow' : 'reversal_play',
            confidence: 'medium',
            change: changePercent,
            reason: `${Math.abs(changePercent)}% move in major currency pair`
          };
          
          opportunities.medium_confidence.push(opportunity);
        }
      });

      opportunities.total = 
        opportunities.high_confidence.length + 
        opportunities.medium_confidence.length + 
        opportunities.low_confidence.length;

      return opportunities;
    } catch (error) {
      console.error('Opportunity analysis error:', error.message);
      return { high_confidence: [], medium_confidence: [], low_confidence: [], total: 0 };
    }
  }

  // NEW: Identify 24/7 crypto and currency opportunities
  async identifyCrypto24x7Opportunities(scanResults) {
    try {
      const opportunities = {
        high_confidence: [],
        medium_confidence: [],
        low_confidence: [],
        total: 0
      };

      // Analyze crypto (24/7 market - more sensitive to weekend moves)
      scanResults.crypto.forEach(crypto => {
        const changePercent = parseFloat(crypto.changePercent);
        
        // Weekend crypto moves can be more significant
        if (Math.abs(changePercent) > 8) {
          const confidence = Math.abs(changePercent) > 15 ? 'high' : 'medium';
          const opportunity = {
            asset: crypto.symbol,
            type: 'crypto_24x7',
            action: changePercent > 0 ? 'momentum_buy' : 'dip_buy',
            confidence,
            change: changePercent,
            reason: `${Math.abs(changePercent)}% move in 24/7 crypto market - weekend volatility`,
            market_status: '24/7 ACTIVE'
          };
          
          opportunities[`${confidence}_confidence`].push(opportunity);
        }
      });

      // Analyze currency rates (some pairs active 24/7)
      scanResults.currencies.forEach(currency => {
        const changePercent = parseFloat(currency.changePercent);
        
        if (Math.abs(changePercent) > 2) {
          const opportunity = {
            asset: currency.pair,
            type: 'currency_24x7',
            action: changePercent > 0 ? 'trend_follow' : 'reversal_play',
            confidence: 'medium',
            change: changePercent,
            reason: `${Math.abs(changePercent)}% move in currency markets`,
            market_status: 'WEEKEND ACTIVE'
          };
          
          opportunities.medium_confidence.push(opportunity);
        }
      });

      opportunities.total = 
        opportunities.high_confidence.length + 
        opportunities.medium_confidence.length + 
        opportunities.low_confidence.length;

      return opportunities;
    } catch (error) {
      console.error('24/7 Opportunity analysis error:', error.message);
      return { high_confidence: [], medium_confidence: [], low_confidence: [], total: 0 };
    }
  }

  // NEW: Send 24/7 crypto alerts
  async sendCrypto24x7Alerts(opportunities) {
    try {
      if (!this.bot || (opportunities.high_confidence.length === 0 && opportunities.medium_confidence.length === 0)) return;

      let alertMessage = `🌍 24/7 CRYPTO & CURRENCY ALERTS\n`;
      alertMessage += `⏰ ${new Date().toLocaleString()} (Weekend Trading Active)\n\n`;
      
      // High confidence opportunities
      if (opportunities.high_confidence.length > 0) {
        alertMessage += `🚨 HIGH CONFIDENCE (24/7 Markets):\n`;
        opportunities.high_confidence.forEach((opp, index) => {
          alertMessage += `${index + 1}. ${opp.asset} - ${opp.action.replace('_', ' ').toUpperCase()}\n`;
          alertMessage += `   Move: ${opp.change > 0 ? '+' : ''}${opp.change}%\n`;
          alertMessage += `   Status: ${opp.market_status}\n\n`;
        });
      }

      // Medium confidence opportunities
      if (opportunities.medium_confidence.length > 0) {
        alertMessage += `⚠️ MEDIUM CONFIDENCE (Weekend Active):\n`;
        opportunities.medium_confidence.slice(0, 3).forEach((opp, index) => {
          alertMessage += `${index + 1}. ${opp.asset} - ${opp.change > 0 ? '+' : ''}${opp.change}%\n`;
        });
        alertMessage += `\n`;
      }

      alertMessage += `📊 Total 24/7 Opportunities: ${opportunities.total}`;

      // Send to admin
      if (process.env.ADMIN_CHAT_ID) {
        await this.bot.sendMessage(process.env.ADMIN_CHAT_ID, alertMessage);
      }

      console.log('📢 24/7 Crypto alerts sent successfully');
    } catch (error) {
      console.error('24/7 Alert sending error:', error.message);
    }
  }

  async sendTradingAlerts(opportunities) {
    try {
      if (!this.bot || opportunities.high_confidence.length === 0) return;

      let alertMessage = `🚨 HIGH CONFIDENCE TRADING OPPORTUNITIES\n\n`;
      
      opportunities.high_confidence.forEach((opp, index) => {
        alertMessage += `${index + 1}. ${opp.asset} (${opp.type.toUpperCase()})\n`;
        alertMessage += `   Action: ${opp.action.replace('_', ' ').toUpperCase()}\n`;
        alertMessage += `   Move: ${opp.change > 0 ? '+' : ''}${opp.change}%\n`;
        alertMessage += `   Reason: ${opp.reason}\n\n`;
      });

      alertMessage += `⏰ Alert Time: ${new Date().toLocaleString()}\n`;
      alertMessage += `📊 Total Opportunities: ${opportunities.total}`;

      // Send to admin (you would set ADMIN_CHAT_ID)
      if (process.env.ADMIN_CHAT_ID) {
        await this.bot.sendMessage(process.env.ADMIN_CHAT_ID, alertMessage);
      }

      console.log('📢 Trading alerts sent successfully');
    } catch (error) {
      console.error('Alert sending error:', error.message);
    }
  }

  async getMarketStatus() {
    try {
      const latestScan = this.marketData.get('latest_scan');
      const opportunities = this.marketData.get('opportunities');

      if (!latestScan) {
        return {
          status: 'No recent scan data',
          message: 'Run /start_market_analysis to begin monitoring'
        };
      }

      const status = {
        lastScan: latestScan.timestamp,
        isRunning: this.isRunning,
        assets: {
          stocks: latestScan.stocks.length,
          forex: latestScan.forex.length,
          commodities: latestScan.commodities.length,
          crypto: latestScan.crypto.length
        },
        opportunities: {
          total: opportunities?.total || 0,
          high: opportunities?.high_confidence?.length || 0,
          medium: opportunities?.medium_confidence?.length || 0
        }
      };

      return status;
    } catch (error) {
      console.error('Market status error:', error.message);
      return { status: 'Error retrieving market status', error: error.message };
    }
  }

  async stopMarketAnalysis() {
    try {
      if (!this.isRunning) {
        return { success: false, message: 'Market analysis not running' };
      }

      if (this.analysisInterval) {
        clearInterval(this.analysisInterval);
        this.analysisInterval = null;
      }
      
      if (this.crypto24x7Interval) {
        clearInterval(this.crypto24x7Interval);
        this.crypto24x7Interval = null;
      }

      this.isRunning = false;
      console.log('⏹️ Market analysis stopped');
      
      return { success: true, message: 'Market analysis stopped successfully' };
    } catch (error) {
      console.error('Market analysis stop error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async getDetailedMarketReport() {
    try {
      const latestScan = this.marketData.get('latest_scan');
      const opportunities = this.marketData.get('opportunities');

      if (!latestScan) {
        return 'No market data available. Start market analysis first.';
      }

      let report = `📊 COMPREHENSIVE MARKET INTELLIGENCE REPORT\n`;
      report += `⏰ Last Updated: ${latestScan.timestamp.toLocaleString()}\n\n`;

      // Stocks section
      if (latestScan.stocks.length > 0) {
        report += `📈 STOCKS (${latestScan.stocks.length} monitored):\n`;
        latestScan.stocks.forEach(stock => {
          const arrow = parseFloat(stock.changePercent) > 0 ? '↗️' : '↘️';
          report += `${arrow} ${stock.symbol}: $${stock.price} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent}%)\n`;
        });
        report += `\n`;
      }

      // Forex section
      if (latestScan.forex.length > 0) {
        report += `💱 FOREX (${latestScan.forex.length} pairs):\n`;
        latestScan.forex.slice(0, 3).forEach(forex => {
          report += `📊 ${forex.pair}: ${forex.rate}\n`;
        });
        report += `\n`;
      }

      // Crypto section
      if (latestScan.crypto.length > 0) {
        report += `₿ CRYPTOCURRENCY (${latestScan.crypto.length} monitored):\n`;
        latestScan.crypto.slice(0, 4).forEach(crypto => {
          const arrow = parseFloat(crypto.changePercent) > 0 ? '🟢' : '🔴';
          report += `${arrow} ${crypto.symbol}: $${crypto.price} (${crypto.changePercent > 0 ? '+' : ''}${crypto.changePercent}%)\n`;
        });
        report += `\n`;
      }

      // Opportunities section
      if (opportunities && opportunities.total > 0) {
        report += `🎯 TRADING OPPORTUNITIES (${opportunities.total} total):\n`;
        
        if (opportunities.high_confidence.length > 0) {
          report += `🔥 HIGH CONFIDENCE (${opportunities.high_confidence.length}):\n`;
          opportunities.high_confidence.slice(0, 3).forEach((opp, index) => {
            report += `${index + 1}. ${opp.asset}: ${opp.action} (${opp.change > 0 ? '+' : ''}${opp.change}%)\n`;
          });
        }
        
        if (opportunities.medium_confidence.length > 0) {
          report += `⚡ MEDIUM CONFIDENCE: ${opportunities.medium_confidence.length} opportunities\n`;
        }
      }

      report += `\n🔄 Auto-refresh: Every 5 minutes\n`;
      report += `📱 Use /market_status for quick overview`;

      return report;
    } catch (error) {
      console.error('Market report error:', error.message);
      return 'Error generating market report. Please try again.';
    }
  }
}

module.exports = MarketApisBot;
