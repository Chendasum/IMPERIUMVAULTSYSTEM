// utils/marketScanner.js
const { getUniversalAnalysis, getDualAnalysis } = require('./dualAISystem');
const { sendSmartMessage, sendAnalysis } = require('./telegramSplitter');
const { getLivePrice, getMarketData } = require('./liveData');
const { assessRisk, calculatePositionSize } = require('./riskManager');
const { logInfo, logError, logWarning } = require('./logger');
const { saveToMemory, getFromMemory } = require('./memory');

class MarketScanner {
    constructor() {
        this.scanIntervals = {
            stocks: 300000,      // 5 minutes
            crypto: 60000,       // 1 minute  
            forex: 180000,       // 3 minutes
            commodities: 600000, // 10 minutes
            bonds: 1800000,      // 30 minutes
            realEstate: 3600000, // 1 hour
            business: 7200000    // 2 hours
        };
        
        this.opportunityThresholds = {
            momentum: 0.05,      // 5% momentum threshold
            volatility: 0.02,    // 2% volatility threshold
            volume: 1.5,         // 1.5x average volume
            rsi: { oversold: 30, overbought: 70 },
            correlation: 0.8,    // 80% correlation threshold
            yield: 0.03,         // 3% minimum yield
            growth: 0.15,        // 15% growth rate
            value: 0.2           // 20% undervaluation
        };
        
        this.marketCache = new Map();
        this.scanHistory = [];
        this.activeScans = new Set();
    }

    // 🎯 MASTER OPPORTUNITY SCANNER
    async scanAllMarkets(chatId, preferences = {}) {
        try {
            logInfo('🔍 Starting comprehensive market scan');
            
            const scanResults = {
                timestamp: Date.now(),
                totalOpportunities: 0,
                categories: {},
                riskAdjusted: [],
                aiInsights: '',
                actionable: []
            };

            // Parallel scanning of all markets
            const scanPromises = [
                this.scanStockMarkets(preferences),
                this.scanCryptoMarkets(preferences),
                this.scanForexMarkets(preferences),
                this.scanCommodityMarkets(preferences),
                this.scanBondMarkets(preferences),
                this.scanRealEstateMarkets(preferences),
                this.scanBusinessOpportunities(preferences),
                this.scanArbitrageOpportunities(preferences),
                this.scanYieldOpportunities(preferences),
                this.scanMacroTrends(preferences)
            ];

            const results = await Promise.allSettled(scanPromises);
            
            // Consolidate results
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    const categoryNames = ['stocks', 'crypto', 'forex', 'commodities', 'bonds', 'realEstate', 'business', 'arbitrage', 'yield', 'macro'];
                    scanResults.categories[categoryNames[index]] = result.value;
                    scanResults.totalOpportunities += result.value.opportunities?.length || 0;
                }
            });

            // Risk-adjusted ranking
            scanResults.riskAdjusted = await this.rankOpportunitiesByRisk(scanResults, chatId);
            
            // Get AI insights
            scanResults.aiInsights = await this.getAIMarketInsights(scanResults, chatId);
            
            // Generate actionable recommendations
            scanResults.actionable = await this.generateActionableRecommendations(scanResults.riskAdjusted);
            
            // Send comprehensive report
            await this.sendMarketScanReport(scanResults, chatId);
            
            // Save scan results
            await this.saveScanResults(scanResults);
            
            return scanResults;
            
        } catch (error) {
            logError('Market scan failed:', error);
            throw error;
        }
    }

    // 📈 STOCK MARKET SCANNER
    async scanStockMarkets(preferences = {}) {
        try {
            const opportunities = [];
            
            // Growth stocks scanner
            const growthStocks = await this.scanGrowthStocks();
            opportunities.push(...growthStocks);
            
            // Value stocks scanner
            const valueStocks = await this.scanValueStocks();
            opportunities.push(...valueStocks);
            
            // Dividend stocks scanner
            const dividendStocks = await this.scanDividendStocks();
            opportunities.push(...dividendStocks);
            
            // Momentum stocks scanner
            const momentumStocks = await this.scanMomentumStocks();
            opportunities.push(...momentumStocks);
            
            // Sector rotation opportunities
            const sectorRotation = await this.scanSectorRotation();
            opportunities.push(...sectorRotation);
            
            return {
                category: 'stocks',
                opportunities: opportunities,
                marketCondition: await this.getMarketCondition('stocks'),
                totalScanned: opportunities.length,
                timeframe: 'Daily',
                confidence: this.calculateConfidenceScore(opportunities)
            };
            
        } catch (error) {
            logError('Stock market scan failed:', error);
            return { category: 'stocks', opportunities: [], error: error.message };
        }
    }

    // 🚀 CRYPTO MARKET SCANNER
    async scanCryptoMarkets(preferences = {}) {
        try {
            const opportunities = [];
            
            // DeFi opportunities
            const defiOpps = await this.scanDeFiOpportunities();
            opportunities.push(...defiOpps);
            
            // Altcoin momentum
            const altcoins = await this.scanAltcoinMomentum();
            opportunities.push(...altcoins);
            
            // Staking opportunities
            const staking = await this.scanStakingOpportunities();
            opportunities.push(...staking);
            
            // NFT market trends
            const nftTrends = await this.scanNFTMarket();
            opportunities.push(...nftTrends);
            
            // Cross-chain arbitrage
            const arbitrage = await this.scanCryptoArbitrage();
            opportunities.push(...arbitrage);
            
            return {
                category: 'crypto',
                opportunities: opportunities,
                marketCondition: await this.getMarketCondition('crypto'),
                dominance: await this.getBitcoinDominance(),
                fearGreedIndex: await this.getFearGreedIndex(),
                confidence: this.calculateConfidenceScore(opportunities)
            };
            
        } catch (error) {
            logError('Crypto market scan failed:', error);
            return { category: 'crypto', opportunities: [], error: error.message };
        }
    }

    // 💱 FOREX MARKET SCANNER
    async scanForexMarkets(preferences = {}) {
        try {
            const opportunities = [];
            
            // Currency strength analysis
            const currencyStrength = await this.scanCurrencyStrength();
            opportunities.push(...currencyStrength);
            
            // Carry trade opportunities
            const carryTrades = await this.scanCarryTrades();
            opportunities.push(...carryTrades);
            
            // Economic calendar events
            const newsEvents = await this.scanForexNews();
            opportunities.push(...newsEvents);
            
            // Technical breakouts
            const breakouts = await this.scanForexBreakouts();
            opportunities.push(...breakouts);
            
            return {
                category: 'forex',
                opportunities: opportunities,
                marketCondition: await this.getMarketCondition('forex'),
                volatility: await this.getForexVolatility(),
                confidence: this.calculateConfidenceScore(opportunities)
            };
            
        } catch (error) {
            logError('Forex market scan failed:', error);
            return { category: 'forex', opportunities: [], error: error.message };
        }
    }

    // 🏠 REAL ESTATE SCANNER
    async scanRealEstateMarkets(preferences = {}) {
        try {
            const opportunities = [];
            
            // REIT opportunities
            const reits = await this.scanREITOpportunities();
            opportunities.push(...reits);
            
            // Real estate crowdfunding
            const crowdfunding = await this.scanRealEstateCrowdfunding();
            opportunities.push(...crowdfunding);
            
            // Market trends by region
            const regionalTrends = await this.scanRegionalRealEstate();
            opportunities.push(...regionalTrends);
            
            // Commercial real estate
            const commercial = await this.scanCommercialRealEstate();
            opportunities.push(...commercial);
            
            return {
                category: 'realEstate',
                opportunities: opportunities,
                marketCondition: await this.getMarketCondition('realEstate'),
                interestRates: await this.getInterestRates(),
                confidence: this.calculateConfidenceScore(opportunities)
            };
            
        } catch (error) {
            logError('Real estate scan failed:', error);
            return { category: 'realEstate', opportunities: [], error: error.message };
        }
    }

    // 💼 BUSINESS OPPORTUNITIES SCANNER
    async scanBusinessOpportunities(preferences = {}) {
        try {
            const opportunities = [];
            
            // IPO pipeline
            const ipos = await this.scanIPOPipeline();
            opportunities.push(...ipos);
            
            // M&A opportunities
            const mergers = await this.scanMergerOpportunities();
            opportunities.push(...mergers);
            
            // Startup investment rounds
            const startups = await this.scanStartupRounds();
            opportunities.push(...startups);
            
            // Business for sale platforms
            const businessSales = await this.scanBusinessForSale();
            opportunities.push(...businessSales);
            
            // Franchise opportunities
            const franchises = await this.scanFranchiseOpportunities();
            opportunities.push(...franchises);
            
            return {
                category: 'business',
                opportunities: opportunities,
                marketCondition: await this.getMarketCondition('business'),
                economicIndicators: await this.getEconomicIndicators(),
                confidence: this.calculateConfidenceScore(opportunities)
            };
            
        } catch (error) {
            logError('Business opportunities scan failed:', error);
            return { category: 'business', opportunities: [], error: error.message };
        }
    }

    // 🔄 ARBITRAGE OPPORTUNITIES
    async scanArbitrageOpportunities(preferences = {}) {
        try {
            const opportunities = [];
            
            // Price arbitrage across exchanges
            const priceArb = await this.scanPriceArbitrage();
            opportunities.push(...priceArb);
            
            // Statistical arbitrage
            const statArb = await this.scanStatisticalArbitrage();
            opportunities.push(...statArb);
            
            // Geographic arbitrage
            const geoArb = await this.scanGeographicArbitrage();
            opportunities.push(...geoArb);
            
            // Time arbitrage
            const timeArb = await this.scanTimeArbitrage();
            opportunities.push(...timeArb);
            
            return {
                category: 'arbitrage',
                opportunities: opportunities,
                totalSpread: this.calculateTotalSpread(opportunities),
                executionTime: this.calculateExecutionTime(opportunities),
                confidence: this.calculateConfidenceScore(opportunities)
            };
            
        } catch (error) {
            logError('Arbitrage scan failed:', error);
            return { category: 'arbitrage', opportunities: [], error: error.message };
        }
    }

    // 💰 YIELD OPPORTUNITIES SCANNER
    async scanYieldOpportunities(preferences = {}) {
        try {
            const opportunities = [];
            
            // High-yield savings accounts
            const savings = await this.scanHighYieldSavings();
            opportunities.push(...savings);
            
            // Corporate bonds
            const corporateBonds = await this.scanCorporateBonds();
            opportunities.push(...corporateBonds);
            
            // Municipal bonds
            const muniBonds = await this.scanMunicipalBonds();
            opportunities.push(...muniBonds);
            
            // Dividend aristocrats
            const dividends = await this.scanDividendAristocrats();
            opportunities.push(...dividends);
            
            // P2P lending
            const p2p = await this.scanP2PLending();
            opportunities.push(...p2p);
            
            return {
                category: 'yield',
                opportunities: opportunities,
                averageYield: this.calculateAverageYield(opportunities),
                riskAdjustedYield: this.calculateRiskAdjustedYield(opportunities),
                confidence: this.calculateConfidenceScore(opportunities)
            };
            
        } catch (error) {
            logError('Yield opportunities scan failed:', error);
            return { category: 'yield', opportunities: [], error: error.message };
        }
    }

    // 🌍 MACRO TRENDS SCANNER
    async scanMacroTrends(preferences = {}) {
        try {
            const trends = [];
            
            // Economic indicators
            const economicTrends = await this.scanEconomicTrends();
            trends.push(...economicTrends);
            
            // Geopolitical events
            const geopolitical = await this.scanGeopoliticalTrends();
            trends.push(...geopolitical);
            
            // Technology disruption
            const techTrends = await this.scanTechnologyTrends();
            trends.push(...techTrends);
            
            // Demographic shifts
            const demographic = await this.scanDemographicTrends();
            trends.push(...demographic);
            
            // Climate and ESG trends
            const esgTrends = await this.scanESGTrends();
            trends.push(...esgTrends);
            
            return {
                category: 'macro',
                opportunities: trends,
                timeHorizon: 'Long-term',
                impactScore: this.calculateImpactScore(trends),
                confidence: this.calculateConfidenceScore(trends)
            };
            
        } catch (error) {
            logError('Macro trends scan failed:', error);
            return { category: 'macro', opportunities: [], error: error.message };
        }
    }

    // 🎯 SMART OPPORTUNITY RANKING
    async rankOpportunitiesByRisk(scanResults, chatId) {
        try {
            const allOpportunities = [];
            
            // Collect all opportunities
            Object.values(scanResults.categories).forEach(category => {
                if (category.opportunities) {
                    category.opportunities.forEach(opp => {
                        opp.category = category.category;
                        allOpportunities.push(opp);
                    });
                }
            });
            
            // Calculate risk-adjusted scores
            const scoredOpportunities = await Promise.all(
                allOpportunities.map(async (opp) => {
                    const riskScore = await this.calculateOpportunityRisk(opp);
                    const rewardScore = this.calculateRewardPotential(opp);
                    const liquidityScore = this.calculateLiquidityScore(opp);
                    const timingScore = this.calculateTimingScore(opp);
                    
                    const overallScore = (
                        rewardScore * 0.4 +
                        (100 - riskScore) * 0.3 +
                        liquidityScore * 0.2 +
                        timingScore * 0.1
                    );
                    
                    return {
                        ...opp,
                        riskScore,
                        rewardScore,
                        liquidityScore,
                        timingScore,
                        overallScore,
                        riskRewardRatio: rewardScore / Math.max(riskScore, 1)
                    };
                })
            );
            
            // Sort by overall score
            return scoredOpportunities
                .sort((a, b) => b.overallScore - a.overallScore)
                .slice(0, 20); // Top 20 opportunities
                
        } catch (error) {
            logError('Opportunity ranking failed:', error);
            return [];
        }
    }

    // 🤖 AI MARKET INSIGHTS
    async getAIMarketInsights(scanResults, chatId) {
        try {
            const prompt = `
            Analyze these comprehensive market scan results and provide strategic insights:
            
            Scan Summary:
            - Total Opportunities Found: ${scanResults.totalOpportunities}
            - Categories Scanned: ${Object.keys(scanResults.categories).join(', ')}
            - Top Opportunities: ${JSON.stringify(scanResults.riskAdjusted.slice(0, 5))}
            
            Market Conditions:
            ${Object.entries(scanResults.categories).map(([cat, data]) => 
                `- ${cat}: ${data.marketCondition || 'Unknown'} (${data.opportunities?.length || 0} opportunities)`
            ).join('\n')}
            
            Provide:
            1. Market outlook summary
            2. Top 3 wealth-building themes
            3. Risk assessment across markets
            4. Optimal allocation strategy
            5. Timing recommendations
            6. Hidden opportunities analysis
            `;
            
            const insights = await getDualAnalysis(prompt, {
                chatId: chatId,
                context: 'market_analysis',
                priority: 'high'
            });
            
            return insights;
            
        } catch (error) {
            logError('AI market insights failed:', error);
            return 'Market insights unavailable';
        }
    }

    // 📱 SEND COMPREHENSIVE MARKET REPORT
    async sendMarketScanReport(scanResults, chatId) {
        try {
            const report = `
🔍 **COMPREHENSIVE MARKET SCAN** 🌍

📊 **Scan Summary:**
• Total Opportunities: **${scanResults.totalOpportunities}**
• Categories Scanned: **${Object.keys(scanResults.categories).length}**
• Risk-Adjusted Ranking: **${scanResults.riskAdjusted.length} qualified**

🎯 **TOP OPPORTUNITIES:**
${scanResults.riskAdjusted.slice(0, 5).map((opp, i) => 
    `${i + 1}. **${opp.symbol || opp.name}** (${opp.category.toUpperCase()})
   • Score: ${opp.overallScore.toFixed(1)}/100
   • Risk/Reward: ${opp.riskRewardRatio.toFixed(2)}:1
   • Potential: ${opp.potentialReturn ? (opp.potentialReturn * 100).toFixed(1) + '%' : 'TBD'}`
).join('\n\n')}

📈 **MARKET CONDITIONS:**
${Object.entries(scanResults.categories).map(([cat, data]) => 
    `• **${cat.toUpperCase()}**: ${data.marketCondition || 'Analyzing'} (${data.opportunities?.length || 0} opps)`
).join('\n')}

🤖 **AI INSIGHTS:**
${scanResults.aiInsights}

📋 **ACTIONABLE RECOMMENDATIONS:**
${scanResults.actionable.map((action, i) => `${i + 1}. ${action}`).join('\n')}

🔄 Next scan in: **${this.getNextScanTime()} minutes**
            `;
            
            await sendAnalysis(report, chatId, '🔍 Market Scanner');
            
        } catch (error) {
            logError('Failed to send market scan report:', error);
        }
    }

    // 💡 GENERATE ACTIONABLE RECOMMENDATIONS
    async generateActionableRecommendations(topOpportunities) {
        try {
            const recommendations = [];
            
            if (topOpportunities.length === 0) {
                return ['No high-quality opportunities found in current market conditions'];
            }
            
            // Immediate actions
            const immediate = topOpportunities.filter(opp => opp.timingScore > 80);
            if (immediate.length > 0) {
                recommendations.push(`🚀 IMMEDIATE: Consider ${immediate[0].symbol || immediate[0].name} (${immediate[0].category}) - High timing score`);
            }
            
            // Diversification recommendations
            const categories = [...new Set(topOpportunities.map(opp => opp.category))];
            if (categories.length > 1) {
                recommendations.push(`🎯 DIVERSIFY: Spread across ${categories.length} categories: ${categories.join(', ')}`);
            }
            
            // Risk management
            const highRisk = topOpportunities.filter(opp => opp.riskScore > 70);
            if (highRisk.length > 0) {
                recommendations.push(`⚠️ CAUTION: ${highRisk.length} high-risk opportunities require careful position sizing`);
            }
            
            // Long-term positioning
            const longTerm = topOpportunities.filter(opp => opp.timeHorizon === 'Long-term');
            if (longTerm.length > 0) {
                recommendations.push(`📈 LONG-TERM: ${longTerm.length} opportunities for wealth building over 1+ years`);
            }
            
            return recommendations;
            
        } catch (error) {
            logError('Failed to generate recommendations:', error);
            return ['Recommendations unavailable'];
        }
    }

    // Helper Methods (Placeholder implementations)
    async scanGrowthStocks() {
        // Implementation would scan for high-growth stocks
        return [
            { symbol: 'NVDA', name: 'NVIDIA Corp', potentialReturn: 0.25, riskLevel: 'Medium', timeHorizon: 'Medium-term' },
            { symbol: 'TSLA', name: 'Tesla Inc', potentialReturn: 0.30, riskLevel: 'High', timeHorizon: 'Long-term' }
        ];
    }

    async scanDeFiOpportunities() {
        // Implementation would scan DeFi protocols
        return [
            { symbol: 'AAVE', name: 'Aave Protocol', yieldAPY: 0.08, riskLevel: 'Medium', platform: 'Ethereum' },
            { symbol: 'UNI', name: 'Uniswap', potentialReturn: 0.15, riskLevel: 'High', category: 'DEX' }
        ];
    }

    async getMarketCondition(market) {
        // Implementation would analyze current market conditions
        const conditions = ['Bullish', 'Bearish', 'Sideways', 'Volatile', 'Stable'];
        return conditions[Math.floor(Math.random() * conditions.length)];
    }

    calculateConfidenceScore(opportunities) {
        return opportunities.length > 0 ? Math.min(100, opportunities.length * 10) : 0;
    }

    async calculateOpportunityRisk(opportunity) {
        // Risk calculation based on volatility, liquidity, market conditions
        return Math.random() * 100; // Placeholder
    }

    calculateRewardPotential(opportunity) {
        return (opportunity.potentialReturn || 0.1) * 100;
    }

    calculateLiquidityScore(opportunity) {
        // Based on trading volume, market cap, etc.
        return Math.random() * 100; // Placeholder
    }

    calculateTimingScore(opportunity) {
        // Based on technical indicators, market cycles, etc.
        return Math.random() * 100; // Placeholder
    }

    getNextScanTime() {
        return Math.min(...Object.values(this.scanIntervals)) / 60000; // Convert to minutes
    }

    async saveScanResults(results) {
        await saveToMemory(`market_scan_${Date.now()}`, results);
        this.scanHistory.push(results.timestamp);
        
        // Keep only last 50 scans
        if (this.scanHistory.length > 50) {
            this.scanHistory.shift();
        }
    }
}

// Export functions for easy integration
module.exports = {
    MarketScanner,
    
    // Main scanning functions
    scanMarkets: async (chatId, preferences) => {
        const scanner = new MarketScanner();
        return await scanner.scanAllMarkets(chatId, preferences);
    },
    
    scanStocks: async (preferences) => {
        const scanner = new MarketScanner();
        return await scanner.scanStockMarkets(preferences);
    },
    
    scanCrypto: async (preferences) => {
        const scanner = new MarketScanner();
        return await scanner.scanCryptoMarkets(preferences);
    },
    
    scanOpportunities: async (category, chatId) => {
        const scanner = new MarketScanner();
        const method = `scan${category.charAt(0).toUpperCase() + category.slice(1)}Markets`;
        if (typeof scanner[method] === 'function') {
            return await scanner[method]();
        }
        throw new Error(`Unknown category: ${category}`);
    },
    
    getTopOpportunities: async (chatId, limit = 10) => {
        const scanner = new MarketScanner();
        const results = await scanner.scanAllMarkets(chatId);
        return results.riskAdjusted.slice(0, limit);
    }
};
