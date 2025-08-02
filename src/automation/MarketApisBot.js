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
        metals: 'https://api.metals.live/v1/spot',
        metalsBackup: 'https://metals.live',
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
      console.log('📊 Initializing Market Intelligence...');
      
      // Initialize market data cache
      this.marketData.clear();
      
      console.log('✅ Market Intelligence initialized');
      return { success: true, message: 'Market Intelligence system ready' };
      
    } catch (error) {
      console.error('❌ Market Intelligence initialization error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async startMarketAnalysis() {
    try {
      if (this.isRunning) {
        console.log('📊 Market analysis already running');
        return;
      }

      this.isRunning = true;
      console.log('🚀 Starting comprehensive market analysis...');

      // Initial scan
      await this.performMarketScan();

      // Schedule regular scans every 5 minutes
      this.analysisInterval = setInterval(async () => {
        await this.performMarketScan();
      }, 5 * 60 * 1000);

      // Start 24/7 crypto monitoring
      this.cryptoInterval = setInterval(async () => {
        await this.performCrypto24x7Scan();
      }, 2 * 60 * 1000);

      console.log('✅ Market analysis started - including 24/7 crypto monitoring');
      
    } catch (error) {
      console.error('❌ Market analysis startup error:', error.message);
      this.isRunning = false;
    }
  }

  async performCrypto24x7Scan() {
    try {
      console.log('🚀 Performing 24/7 crypto & currency scan...');
      
      const crypto24x7Results = {
        timestamp: new Date(),
        crypto: await this.scanCrypto(),
        currencies: await this.scanForex()
      };

      // Store results
      this.marketData.set('crypto_24x7', crypto24x7Results);

      // Quick opportunity check for crypto
      const cryptoOpportunities = crypto24x7Results.crypto.filter(coin => 
        Math.abs(parseFloat(coin.changePercent)) > 5 // 5% or more change
      );

      console.log(`✅ 24/7 Crypto scan complete - ${cryptoOpportunities.length} opportunities found`);
      
    } catch (error) {
      console.log('❌ 24/7 Crypto scan error:', error.message);
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
      
      // Use Metals API for real gold/silver data if available
      if (process.env.METALS_API_KEY) {
        let metalsApiSuccess = false;
        const endpoints = [
          {
            url: `https://api.metals.live/v1/spot?api_key=${process.env.METALS_API_KEY}`,
            name: 'Metals.live API v1 (with key)'
          },
          {
            url: 'https://api.metals.live/v1/spot',
            name: 'Metals.live API v1 (free tier)',
            headers: { 'x-access-token': process.env.METALS_API_KEY }
          },
          {
            url: 'https://metals.live',
            name: 'Metals.live simple endpoint'
          },
          {
            url: 'https://api.metalpriceapi.com/v1/latest?api_key=demo&base=USD&currencies=XAU,XAG',
            name: 'MetalPriceAPI backup (free demo)'
          }
        ];

        for (let attempt = 1; attempt <= endpoints.length && !metalsApiSuccess; attempt++) {
          try {
            const endpoint = endpoints[attempt - 1];
            console.log(`📊 Metals API attempt ${attempt}/${endpoints.length} - ${endpoint.name}`);
            
            const config = {
              timeout: 15000
            };
            
            if (endpoint.headers) {
              config.headers = endpoint.headers;
            }
            
            const response = await axios.get(endpoint.url, config);

            if (response.data) {
              console.log(`✅ ${endpoint.name} connection successful - Using live precious metals data`);
              const metals = response.data;
              metalsApiSuccess = true;
            
              // Add gold data
              if (metals.gold) {
                commodityData.push({
                  symbol: 'XAU/USD',
                  name: 'Gold (Live)',
                  price: metals.gold,
                  change: 0, // Metals API doesn't provide change data
                  changePercent: '0.00',
                  trend: 'neutral',
                  source: 'Metals API'
                });
              }
              
              // Add silver data
              if (metals.silver) {
                commodityData.push({
                  symbol: 'XAG/USD',
                  name: 'Silver (Live)',
                  price: metals.silver,
                  change: 0,
                  changePercent: '0.00',
                  trend: 'neutral',
                  source: 'Metals API'
                });
              }
              
              // Add other metals if available
              if (metals.platinum) {
                commodityData.push({
                  symbol: 'XPT/USD',
                  name: 'Platinum (Live)',
                  price: metals.platinum,
                  change: 0,
                  changePercent: '0.00',
                  trend: 'neutral',
                  source: 'Metals API'
                });
              }
            }
          } catch (metalsError) {
            console.log(`⚠️ Metals API attempt ${attempt} failed: ${metalsError.message}`);
            if (attempt < 3) {
              console.log(`🔄 Retrying in 2 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              console.log('❌ All Metals API attempts failed - falling back to demo data');
            }
          }
        }
      }
      
      // Add demo oil data (since Metals API is primarily for precious metals)
      const oilData = [
        { symbol: 'WTI', name: 'Crude Oil WTI', price: 78.45, change: 1.20, changePercent: 1.55 },
        { symbol: 'BRENT', name: 'Brent Crude', price: 82.10, change: 0.85, changePercent: 1.05 }
      ];
      
      oilData.forEach(oil => {
        commodityData.push({
          symbol: oil.symbol,
          name: oil.name,
          price: oil.price,
          change: oil.change,
          changePercent: oil.changePercent.toFixed(2),
          trend: oil.change > 0 ? 'bullish' : 'bearish',
          source: 'Demo Data'
        });
      });

      // If no real data available, use demo precious metals data
      if (commodityData.length === 2) { // Only oil data
        const demoMetals = [
          { symbol: 'XAU/USD', name: 'Gold (Demo)', price: 2045.50, change: 12.30, changePercent: 0.60 },
          { symbol: 'XAG/USD', name: 'Silver (Demo)', price: 24.85, change: -0.15, changePercent: -0.60 }
        ];
        
        demoMetals.forEach(metal => {
          commodityData.push({
            symbol: metal.symbol,
            name: metal.name,
            price: metal.price,
            change: metal.change,
            changePercent: metal.changePercent.toFixed(2),
            trend: metal.change > 0 ? 'bullish' : 'bearish',
            source: 'Demo Data'
          });
        });
      }

      return commodityData;
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
    const opportunities = {
      high_confidence: [],
      medium_confidence: [],
      low_confidence: [],
      total: 0
    };

    try {
      // Stock opportunities (3%+ movement)
      scanResults.stocks.forEach(stock => {
        const changePercent = Math.abs(parseFloat(stock.changePercent));
        if (changePercent >= 3) {
          opportunities.high_confidence.push({
            type: 'stock',
            symbol: stock.symbol,
            action: parseFloat(stock.changePercent) > 0 ? 'watch_breakout' : 'watch_reversal',
            confidence: changePercent >= 5 ? 'high' : 'medium',
            data: stock
          });
        }
      });

      // Crypto opportunities (5%+ movement)
      scanResults.crypto.forEach(crypto => {
        const changePercent = Math.abs(parseFloat(crypto.changePercent));
        if (changePercent >= 5) {
          opportunities.high_confidence.push({
            type: 'crypto',
            symbol: crypto.symbol,
            action: parseFloat(crypto.changePercent) > 0 ? 'momentum_buy' : 'reversal_watch',
            confidence: changePercent >= 10 ? 'high' : 'medium',
            data: crypto
          });
        }
      });

      // Forex opportunities (1%+ movement) 
      scanResults.forex.forEach(forex => {
        const changePercent = Math.abs(parseFloat(forex.changePercent));
        if (changePercent >= 1) {
          opportunities.medium_confidence.push({
            type: 'forex',
            symbol: forex.pair,
            action: parseFloat(forex.changePercent) > 0 ? 'trend_follow' : 'counter_trend',
            confidence: 'medium',
            data: forex
          });
        }
      });

      opportunities.total = opportunities.high_confidence.length + 
                           opportunities.medium_confidence.length + 
                           opportunities.low_confidence.length;

      return opportunities;

    } catch (error) {
      console.error('Opportunity identification error:', error.message);
      return opportunities;
    }
  }

  async sendTradingAlerts(opportunities) {
    try {
      if (opportunities.high_confidence.length > 0) {
        console.log(`🚨 ${opportunities.high_confidence.length} high-confidence trading opportunities detected`);
        
        // Here you could send alerts to specific channels or users
        // For now, just log the opportunities
        opportunities.high_confidence.forEach(opp => {
          console.log(`📈 ${opp.type.toUpperCase()}: ${opp.symbol} - ${opp.action} (${opp.confidence} confidence)`);
        });
      }
    } catch (error) {
      console.error('Alert sending error:', error.message);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastScan: this.marketData.get('latest_scan')?.timestamp,
      totalOpportunities: this.marketData.get('opportunities')?.total || 0,
      alerts: this.alerts.length
    };
  }

  stopAnalysis() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    if (this.cryptoInterval) {
      clearInterval(this.cryptoInterval);
      this.cryptoInterval = null;
    }
    this.isRunning = false;
    console.log('📊 Market analysis stopped');
  }
}

module.exports = MarketApisBot;
