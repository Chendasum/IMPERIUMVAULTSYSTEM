// ===== REAL-TIME MARKET INTELLIGENCE AUTOMATION =====
// Advanced market monitoring and analysis system for Cambodia

const axios = require('axios');
const cheerio = require('cheerio');

class MarketIntelligenceEngine {
  constructor() {
    this.cambodiaEconomicAPIs = {
      worldBank: 'https://api.worldbank.org/v2/country/KH/indicator/',
      aseanTrade: 'https://data.aseanstats.org/api/',
      forexRates: 'https://api.exchangerate-api.com/v4/latest/USD',
      cryptoPrices: 'https://api.coingecko.com/api/v3/simple/price',
      newsFeeds: [
        'https://www.khmertimeskh.com/feed/',
        'https://english.cambodiadaily.com/feed/',
        'https://phnompenhpost.com/feed'
      ]
    };
    
    this.competitorWatchList = [
      'https://example-competitor1.com',
      'https://example-competitor2.com'
    ];
    
    this.alertThresholds = {
      gdpGrowthChange: 0.5, // Alert if GDP growth changes by 0.5%
      inflationChange: 1.0, // Alert if inflation changes by 1%
      usdKhrChange: 50, // Alert if USD/KHR changes by 50 riels
      cryptoChange: 5.0 // Alert if major crypto changes by 5%
    };
  }

  // ===== CAMBODIA ECONOMIC MONITORING =====
  async getCambodiaEconomicIndicators() {
    try {
      const indicators = {
        gdp: await this.getWorldBankData('NY.GDP.MKTP.KD.ZG'), // GDP growth
        inflation: await this.getWorldBankData('FP.CPI.TOTL.ZG'), // Inflation
        unemployment: await this.getWorldBankData('SL.UEM.TOTL.ZS'), // Unemployment
        exports: await this.getWorldBankData('NE.EXP.GNFS.KD.ZG'), // Export growth
        imports: await this.getWorldBankData('NE.IMP.GNFS.KD.ZG'), // Import growth
        fdi: await this.getWorldBankData('BX.KLT.DINV.WD.GD.ZS') // FDI as % of GDP
      };

      return {
        success: true,
        data: indicators,
        timestamp: new Date().toISOString(),
        analysis: this.analyzeEconomicTrends(indicators)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getWorldBankData(indicator) {
    const response = await axios.get(
      `${this.cambodiaEconomicAPIs.worldBank}${indicator}?format=json&date=2020:2024&per_page=5`
    );
    return response.data[1] || [];
  }

  analyzeEconomicTrends(indicators) {
    const analysis = {
      marketConditions: 'stable',
      opportunities: [],
      risks: [],
      businessImpact: 'neutral'
    };

    // GDP Analysis
    if (indicators.gdp && indicators.gdp.length > 0) {
      const latestGDP = indicators.gdp[0].value;
      if (latestGDP > 6) {
        analysis.opportunities.push('High GDP growth creates wealth expansion opportunities');
        analysis.businessImpact = 'positive';
      }
    }

    // Inflation Analysis
    if (indicators.inflation && indicators.inflation.length > 0) {
      const latestInflation = indicators.inflation[0].value;
      if (latestInflation > 5) {
        analysis.risks.push('High inflation may reduce disposable income for services');
      }
    }

    return analysis;
  }

  // ===== FOREX & CRYPTO MONITORING =====
  async getForexRates() {
    try {
      const response = await axios.get(this.cambodiaEconomicAPIs.forexRates);
      return {
        success: true,
        rates: response.data.rates,
        usdKhr: response.data.rates.KHR || 4100, // Default if not available
        timestamp: response.data.date
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCryptoPrices() {
    try {
      const response = await axios.get(
        `${this.cambodiaEconomicAPIs.cryptoPrices}?ids=bitcoin,ethereum,binancecoin&vs_currencies=usd`
      );
      return {
        success: true,
        prices: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== NEWS SENTIMENT ANALYSIS =====
  async getCambodiaNewsAnalysis() {
    try {
      const newsAnalysis = [];
      
      for (const feedUrl of this.cambodiaEconomicAPIs.newsFeeds) {
        try {
          const articles = await this.parseRSSFeed(feedUrl);
          const sentiment = this.analyzeNewsSentiment(articles);
          newsAnalysis.push({
            source: feedUrl,
            sentiment,
            keyTopics: this.extractKeyTopics(articles),
            businessRelevance: this.assessBusinessRelevance(articles)
          });
        } catch (feedError) {
          console.log(`Feed ${feedUrl} unavailable: ${feedError.message}`);
        }
      }

      return {
        success: true,
        analysis: newsAnalysis,
        overallSentiment: this.calculateOverallSentiment(newsAnalysis),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async parseRSSFeed(feedUrl) {
    const response = await axios.get(feedUrl);
    const $ = cheerio.load(response.data, { xmlMode: true });
    
    const articles = [];
    $('item').each((i, elem) => {
      if (i < 10) { // Limit to recent 10 articles
        articles.push({
          title: $(elem).find('title').text(),
          description: $(elem).find('description').text(),
          pubDate: $(elem).find('pubDate').text(),
          link: $(elem).find('link').text()
        });
      }
    });
    
    return articles;
  }

  analyzeNewsSentiment(articles) {
    const positiveKeywords = ['growth', 'investment', 'development', 'success', 'opportunity', 'expansion'];
    const negativeKeywords = ['crisis', 'decline', 'problem', 'corruption', 'conflict', 'recession'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    articles.forEach(article => {
      const text = (article.title + ' ' + article.description).toLowerCase();
      positiveKeywords.forEach(keyword => {
        if (text.includes(keyword)) positiveScore++;
      });
      negativeKeywords.forEach(keyword => {
        if (text.includes(keyword)) negativeScore++;
      });
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  extractKeyTopics(articles) {
    const topicKeywords = {
      economy: ['economy', 'economic', 'gdp', 'inflation', 'trade'],
      finance: ['bank', 'financial', 'investment', 'money', 'currency'],
      business: ['business', 'company', 'enterprise', 'startup', 'market'],
      politics: ['government', 'policy', 'political', 'minister', 'law']
    };
    
    const topicScores = {};
    Object.keys(topicKeywords).forEach(topic => {
      topicScores[topic] = 0;
      articles.forEach(article => {
        const text = (article.title + ' ' + article.description).toLowerCase();
        topicKeywords[topic].forEach(keyword => {
          if (text.includes(keyword)) topicScores[topic]++;
        });
      });
    });
    
    return Object.entries(topicScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic, score]) => ({ topic, relevance: score }));
  }

  assessBusinessRelevance(articles) {
    const businessKeywords = ['financial services', 'consulting', 'wealth management', 'investment advisory'];
    let relevanceScore = 0;
    
    articles.forEach(article => {
      const text = (article.title + ' ' + article.description).toLowerCase();
      businessKeywords.forEach(keyword => {
        if (text.includes(keyword)) relevanceScore += 2;
      });
    });
    
    if (relevanceScore >= 4) return 'high';
    if (relevanceScore >= 2) return 'medium';
    return 'low';
  }

  calculateOverallSentiment(newsAnalysis) {
    const sentiments = newsAnalysis.map(analysis => analysis.sentiment);
    const positive = sentiments.filter(s => s === 'positive').length;
    const negative = sentiments.filter(s => s === 'negative').length;
    
    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';
    return 'neutral';
  }

  // ===== COMPREHENSIVE MARKET INTELLIGENCE REPORT =====
  async generateMarketIntelligenceReport() {
    try {
      const [economic, forex, crypto, news] = await Promise.all([
        this.getCambodiaEconomicIndicators(),
        this.getForexRates(),
        this.getCryptoPrices(),
        this.getCambodiaNewsAnalysis()
      ]);

      const report = {
        timestamp: new Date().toISOString(),
        economic: economic.success ? economic : { error: 'Economic data unavailable' },
        forex: forex.success ? forex : { error: 'Forex data unavailable' },
        crypto: crypto.success ? crypto : { error: 'Crypto data unavailable' },
        news: news.success ? news : { error: 'News analysis unavailable' },
        strategicRecommendations: this.generateStrategicRecommendations(economic, forex, crypto, news),
        marketOpportunities: this.identifyMarketOpportunities(economic, news),
        riskAssessment: this.assessMarketRisks(economic, news),
        actionItems: this.generateActionItems(economic, forex, crypto, news)
      };

      return report;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  generateStrategicRecommendations(economic, forex, crypto, news) {
    const recommendations = [];
    
    // Economic-based recommendations
    if (economic.success && economic.data.gdp && economic.data.gdp.length > 0) {
      const gdpGrowth = economic.data.gdp[0].value;
      if (gdpGrowth > 6) {
        recommendations.push({
          type: 'expansion',
          priority: 'high',
          action: 'Scale premium services targeting new wealth creation',
          rationale: `GDP growth of ${gdpGrowth}% indicates strong wealth expansion`
        });
      }
    }
    
    // News sentiment recommendations
    if (news.success) {
      if (news.overallSentiment === 'positive') {
        recommendations.push({
          type: 'marketing',
          priority: 'medium',
          action: 'Increase marketing spend and client acquisition efforts',
          rationale: 'Positive market sentiment creates favorable conditions for business growth'
        });
      }
    }
    
    return recommendations;
  }

  identifyMarketOpportunities(economic, news) {
    const opportunities = [];
    
    // Economic opportunities
    if (economic.success && economic.analysis) {
      opportunities.push(...economic.analysis.opportunities.map(opp => ({
        type: 'economic',
        description: opp,
        confidence: 'medium'
      })));
    }
    
    // News-based opportunities
    if (news.success) {
      news.analysis.forEach(source => {
        if (source.businessRelevance === 'high') {
          opportunities.push({
            type: 'market_trend',
            description: `High business relevance detected in ${source.source}`,
            confidence: 'high'
          });
        }
      });
    }
    
    return opportunities;
  }

  assessMarketRisks(economic, news) {
    const risks = [];
    
    // Economic risks
    if (economic.success && economic.analysis) {
      risks.push(...economic.analysis.risks.map(risk => ({
        type: 'economic',
        description: risk,
        severity: 'medium'
      })));
    }
    
    // News-based risks
    if (news.success && news.overallSentiment === 'negative') {
      risks.push({
        type: 'sentiment',
        description: 'Negative market sentiment may impact client confidence',
        severity: 'low'
      });
    }
    
    return risks;
  }

  generateActionItems(economic, forex, crypto, news) {
    const actions = [];
    
    // Always include monitoring actions
    actions.push({
      priority: 'high',
      timeframe: 'daily',
      action: 'Monitor Cambodia economic indicators for significant changes',
      responsible: 'Strategic Intelligence System'
    });
    
    actions.push({
      priority: 'medium',
      timeframe: 'weekly',
      action: 'Analyze news sentiment trends for business impact assessment',
      responsible: 'Strategic Intelligence System'
    });
    
    // Dynamic actions based on data
    if (forex.success && forex.rates.KHR) {
      actions.push({
        priority: 'medium',
        timeframe: 'daily',
        action: `Monitor USD/KHR rate (current: ${forex.rates.KHR}) for pricing adjustments`,
        responsible: 'Revenue Optimization System'
      });
    }
    
    return actions;
  }
}

module.exports = MarketIntelligenceEngine;