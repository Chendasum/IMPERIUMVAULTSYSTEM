// utils/yieldFinder.js
const { getUniversalAnalysis, getDualAnalysis } = require('./dualAISystem');
const { sendSmartMessage, sendAnalysis } = require('./telegramSplitter');
const { getLivePrice, getMarketData } = require('./liveData');
const { assessRisk, calculatePositionSize } = require('./riskManager');
const { scanMarkets } = require('./marketScanner');
const { optimizePortfolio } = require('./portfolioOptimizer');
const { logInfo, logError, logWarning } = require('./logger');
const { saveToMemory, getFromMemory } = require('./memory');

class YieldFinder {
    constructor() {
        this.yieldCategories = {
            dividends: { name: 'Dividend Stocks', minYield: 0.02, maxRisk: 6, liquidity: 'High' },
            bonds: { name: 'Bonds & Fixed Income', minYield: 0.015, maxRisk: 4, liquidity: 'Medium' },
            reits: { name: 'Real Estate Investment Trusts', minYield: 0.03, maxRisk: 7, liquidity: 'Medium' },
            crypto: { name: 'Crypto Staking/DeFi', minYield: 0.05, maxRisk: 9, liquidity: 'Variable' },
            savings: { name: 'High-Yield Savings', minYield: 0.01, maxRisk: 1, liquidity: 'High' },
            cds: { name: 'Certificates of Deposit', minYield: 0.015, maxRisk: 1, liquidity: 'Low' },
            p2p: { name: 'Peer-to-Peer Lending', minYield: 0.04, maxRisk: 8, liquidity: 'Low' },
            business: { name: 'Business Income Streams', minYield: 0.08, maxRisk: 8, liquidity: 'Variable' },
            commodities: { name: 'Commodity Income', minYield: 0.02, maxRisk: 6, liquidity: 'Medium' },
            forex: { name: 'Forex Carry Trades', minYield: 0.03, maxRisk: 7, liquidity: 'High' },
            alternatives: { name: 'Alternative Investments', minYield: 0.06, maxRisk: 8, liquidity: 'Low' }
        };
        
        this.riskAdjustmentFactors = {
            creditRisk: 0.8,      // Adjust for credit quality
            liquidityRisk: 0.9,   // Adjust for liquidity constraints
            interestRateRisk: 0.85, // Adjust for interest rate sensitivity
            inflationRisk: 0.9,   // Adjust for inflation protection
            currencyRisk: 0.85,   // Adjust for foreign exchange risk
            concentrationRisk: 0.8 // Adjust for concentration
        };
        
        this.yieldCache = new Map();
        this.scanHistory = [];
        this.watchlist = new Set();
    }

    // 🎯 MASTER YIELD OPPORTUNITY SCANNER
    async findBestYieldOpportunities(preferences, chatId) {
        try {
            logInfo('💰 Starting comprehensive yield opportunity scan');
            
            const yieldScan = {
                timestamp: Date.now(),
                totalOpportunities: 0,
                categories: {},
                topYields: [],
                riskAdjustedYields: [],
                incomeProjections: {},
                diversificationPlan: {},
                aiInsights: ''
            };

            // Parallel scanning of all yield categories
            const scanPromises = [
                this.scanDividendStocks(preferences),
                this.scanBondOpportunities(preferences),
                this.scanREITOpportunities(preferences),
                this.scanCryptoYields(preferences),
                this.scanSavingsAccounts(preferences),
                this.scanCertificatesOfDeposit(preferences),
                this.scanP2PLending(preferences),
                this.scanBusinessIncome(preferences),
                this.scanCommodityIncome(preferences),
                this.scanForexCarryTrades(preferences),
                this.scanAlternativeYields(preferences)
            ];

            const results = await Promise.allSettled(scanPromises);
            
            // Consolidate results
            const categoryNames = Object.keys(this.yieldCategories);
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    yieldScan.categories[categoryNames[index]] = result.value;
                    yieldScan.totalOpportunities += result.value.opportunities?.length || 0;
                }
            });

            // Rank opportunities by risk-adjusted yield
            yieldScan.riskAdjustedYields = await this.rankByRiskAdjustedYield(yieldScan.categories);
            
            // Get top absolute yields
            yieldScan.topYields = await this.getTopAbsoluteYields(yieldScan.categories);
            
            // Create income projections
            yieldScan.incomeProjections = await this.projectIncomeStreams(yieldScan.riskAdjustedYields, preferences);
            
            // Generate diversification plan
            yieldScan.diversificationPlan = await this.createIncomeDiversificationPlan(yieldScan.riskAdjustedYields);
            
            // Get AI insights
            yieldScan.aiInsights = await this.getAIYieldInsights(yieldScan, chatId);
            
            // Send comprehensive report
            await this.sendYieldFinderReport(yieldScan, chatId);
            
            // Save scan results
            await this.saveYieldScanResults(yieldScan);
            
            return yieldScan;
            
        } catch (error) {
            logError('Yield finder scan failed:', error);
            throw error;
        }
    }

    // 📈 DIVIDEND STOCKS SCANNER
    async scanDividendStocks(preferences = {}) {
        try {
            const opportunities = [];
            
            // Dividend aristocrats (25+ years of increases)
            const aristocrats = await this.scanDividendAristocrats();
            opportunities.push(...aristocrats);
            
            // High-yield dividend stocks
            const highYield = await this.scanHighYieldDividends();
            opportunities.push(...highYield);
            
            // Dividend growth stocks
            const growth = await this.scanDividendGrowthStocks();
            opportunities.push(...growth);
            
            // International dividend stocks
            const international = await this.scanInternationalDividends();
            opportunities.push(...international);
            
            // Utility stocks
            const utilities = await this.scanUtilityDividends();
            opportunities.push(...utilities);
            
            return {
                category: 'dividends',
                opportunities: opportunities,
                averageYield: this.calculateAverageYield(opportunities),
                growthRate: this.calculateDividendGrowthRate(opportunities),
                sustainability: this.assessDividendSustainability(opportunities),
                taxEfficiency: this.calculateTaxEfficiency(opportunities, 'dividends')
            };
            
        } catch (error) {
            logError('Dividend stocks scan failed:', error);
            return { category: 'dividends', opportunities: [], error: error.message };
        }
    }

    // 🏦 BOND OPPORTUNITIES SCANNER
    async scanBondOpportunities(preferences = {}) {
        try {
            const opportunities = [];
            
            // Corporate bonds
            const corporate = await this.scanCorporateBonds();
            opportunities.push(...corporate);
            
            // Municipal bonds
            const municipal = await this.scanMunicipalBonds();
            opportunities.push(...municipal);
            
            // Treasury bonds
            const treasury = await this.scanTreasuryBonds();
            opportunities.push(...treasury);
            
            // High-yield bonds
            const highYield = await this.scanHighYieldBonds();
            opportunities.push(...highYield);
            
            // International bonds
            const international = await this.scanInternationalBonds();
            opportunities.push(...international);
            
            // Inflation-protected bonds (TIPS)
            const tips = await this.scanInflationProtectedBonds();
            opportunities.push(...tips);
            
            return {
                category: 'bonds',
                opportunities: opportunities,
                averageYield: this.calculateAverageYield(opportunities),
                duration: this.calculateAverageDuration(opportunities),
                creditQuality: this.assessCreditQuality(opportunities),
                interestRateSensitivity: this.calculateInterestRateSensitivity(opportunities)
            };
            
        } catch (error) {
            logError('Bond opportunities scan failed:', error);
            return { category: 'bonds', opportunities: [], error: error.message };
        }
    }

    // 🏠 REIT OPPORTUNITIES SCANNER
    async scanREITOpportunities(preferences = {}) {
        try {
            const opportunities = [];
            
            // Equity REITs
            const equity = await this.scanEquityREITs();
            opportunities.push(...equity);
            
            // Mortgage REITs
            const mortgage = await this.scanMortgageREITs();
            opportunities.push(...mortgage);
            
            // International REITs
            const international = await this.scanInternationalREITs();
            opportunities.push(...international);
            
            // Sector-specific REITs
            const sectors = await this.scanSectorREITs();
            opportunities.push(...sectors);
            
            // REIT ETFs
            const etfs = await this.scanREITETFs();
            opportunities.push(...etfs);
            
            return {
                category: 'reits',
                opportunities: opportunities,
                averageYield: this.calculateAverageYield(opportunities),
                occupancyRates: this.calculateAverageOccupancy(opportunities),
                geographicDiversification: this.assessGeographicDiversification(opportunities),
                interestRateSensitivity: this.calculateREITInterestRateSensitivity(opportunities)
            };
            
        } catch (error) {
            logError('REIT opportunities scan failed:', error);
            return { category: 'reits', opportunities: [], error: error.message };
        }
    }

    // 🚀 CRYPTO YIELD SCANNER
    async scanCryptoYields(preferences = {}) {
        try {
            const opportunities = [];
            
            // Staking opportunities
            const staking = await this.scanCryptoStaking();
            opportunities.push(...staking);
            
            // DeFi liquidity mining
            const defi = await this.scanDeFiLiquidityMining();
            opportunities.push(...defi);
            
            // Lending protocols
            const lending = await this.scanCryptoLending();
            opportunities.push(...lending);
            
            // Yield farming
            const farming = await this.scanYieldFarming();
            opportunities.push(...farming);
            
            // Crypto savings accounts
            const savings = await this.scanCryptoSavings();
            opportunities.push(...savings);
            
            return {
                category: 'crypto',
                opportunities: opportunities,
                averageYield: this.calculateAverageYield(opportunities),
                impermanentLossRisk: this.calculateImpermanentLossRisk(opportunities),
                smartContractRisk: this.assessSmartContractRisk(opportunities),
                liquidityRisk: this.assessCryptoLiquidityRisk(opportunities)
            };
            
        } catch (error) {
            logError('Crypto yield scan failed:', error);
            return { category: 'crypto', opportunities: [], error: error.message };
        }
    }

    // 💼 BUSINESS INCOME SCANNER
    async scanBusinessIncome(preferences = {}) {
        try {
            const opportunities = [];
            
            // Franchise opportunities
            const franchises = await this.scanFranchiseIncome();
            opportunities.push(...franchises);
            
            // Rental property income
            const rental = await this.scanRentalPropertyIncome();
            opportunities.push(...rental);
            
            // Business partnerships
            const partnerships = await this.scanBusinessPartnerships();
            opportunities.push(...partnerships);
            
            // Royalty investments
            const royalties = await this.scanRoyaltyInvestments();
            opportunities.push(...royalties);
            
            // E-commerce businesses
            const ecommerce = await this.scanEcommerceBusinesses();
            opportunities.push(...ecommerce);
            
            return {
                category: 'business',
                opportunities: opportunities,
                averageYield: this.calculateAverageYield(opportunities),
                managementRequirement: this.assessManagementRequirement(opportunities),
                scalability: this.assessScalability(opportunities),
                marketRisk: this.assessBusinessMarketRisk(opportunities)
            };
            
        } catch (error) {
            logError('Business income scan failed:', error);
            return { category: 'business', opportunities: [], error: error.message };
        }
    }

    // 🎯 RISK-ADJUSTED YIELD RANKING
    async rankByRiskAdjustedYield(categories) {
        try {
            const allOpportunities = [];
            
            // Collect all opportunities
            Object.values(categories).forEach(category => {
                if (category.opportunities) {
                    category.opportunities.forEach(opp => {
                        opp.categoryName = category.category;
                        allOpportunities.push(opp);
                    });
                }
            });
            
            // Calculate risk-adjusted yields
            const rankedOpportunities = allOpportunities.map(opp => {
                const riskAdjustedYield = this.calculateRiskAdjustedYield(opp);
                const sharpeRatio = this.calculateYieldSharpeRatio(opp);
                const liquidityScore = this.calculateLiquidityScore(opp);
                const stabilityScore = this.calculateYieldStability(opp);
                
                const overallScore = (
                    riskAdjustedYield * 0.4 +
                    sharpeRatio * 0.3 +
                    liquidityScore * 0.2 +
                    stabilityScore * 0.1
                );
                
                return {
                    ...opp,
                    riskAdjustedYield,
                    sharpeRatio,
                    liquidityScore,
                    stabilityScore,
                    overallScore
                };
            });
            
            // Sort by overall score
            return rankedOpportunities
                .sort((a, b) => b.overallScore - a.overallScore)
                .slice(0, 30); // Top 30 opportunities
                
        } catch (error) {
            logError('Risk-adjusted yield ranking failed:', error);
            return [];
        }
    }

    // 📊 INCOME PROJECTIONS
    async projectIncomeStreams(opportunities, preferences) {
        try {
            const investmentAmount = preferences.investmentAmount || 100000;
            const timeHorizons = [1, 3, 5, 10]; // years
            
            const projections = {};
            
            for (const years of timeHorizons) {
                const yearlyProjections = opportunities.slice(0, 10).map(opp => {
                    const allocation = investmentAmount * (opp.allocationPercent || 0.1);
                    const annualIncome = allocation * (opp.yield || 0);
                    const totalIncome = annualIncome * years;
                    const compoundedValue = this.calculateCompoundedIncome(allocation, opp.yield, years);
                    
                    return {
                        opportunity: opp.symbol || opp.name,
                        category: opp.categoryName,
                        allocation: allocation,
                        annualIncome: annualIncome,
                        totalIncome: totalIncome,
                        compoundedValue: compoundedValue,
                        yieldOnOriginal: totalIncome / allocation
                    };
                });
                
                const totalAnnualIncome = yearlyProjections.reduce((sum, proj) => sum + proj.annualIncome, 0);
                const totalProjectedIncome = yearlyProjections.reduce((sum, proj) => sum + proj.totalIncome, 0);
                
                projections[`${years}year`] = {
                    timeHorizon: years,
                    projections: yearlyProjections,
                    totalAnnualIncome: totalAnnualIncome,
                    totalProjectedIncome: totalProjectedIncome,
                    monthlyIncome: totalAnnualIncome / 12,
                    yieldOnInvestment: totalAnnualIncome / investmentAmount,
                    inflationAdjusted: this.adjustForInflation(totalAnnualIncome, years)
                };
            }
            
            return {
                projections: projections,
                methodology: 'Compound Income Calculation',
                assumptions: {
                    investmentAmount: investmentAmount,
                    inflationRate: 0.025,
                    reinvestmentRate: 0.5,
                    taxRate: preferences.taxRate || 0.22
                }
            };
            
        } catch (error) {
            logError('Income projection failed:', error);
            return { projections: {} };
        }
    }

    // 🎯 INCOME DIVERSIFICATION PLAN
    async createIncomeDiversificationPlan(opportunities) {
        try {
            const plan = {
                conservative: { riskLevel: 'Low', targetYield: 0.04 },
                moderate: { riskLevel: 'Medium', targetYield: 0.06 },
                aggressive: { riskLevel: 'High', targetYield: 0.08 }
            };
            
            // Create allocations for each risk profile
            Object.keys(plan).forEach(profile => {
                const targetRisk = profile === 'conservative' ? 3 : profile === 'moderate' ? 6 : 9;
                const suitableOpportunities = opportunities.filter(opp => 
                    (opp.riskLevel || 5) <= targetRisk
                );
                
                // Diversify across categories
                const categories = [...new Set(suitableOpportunities.map(opp => opp.categoryName))];
                const allocation = {};
                
                categories.forEach((category, index) => {
                    const categoryOpps = suitableOpportunities.filter(opp => opp.categoryName === category);
                    const weight = 1 / categories.length;
                    
                    allocation[category] = {
                        weight: weight,
                        topOpportunities: categoryOpps.slice(0, 3),
                        expectedYield: this.calculateAverageYield(categoryOpps.slice(0, 3))
                    };
                });
                
                plan[profile].allocation = allocation;
                plan[profile].expectedYield = Object.values(allocation)
                    .reduce((sum, cat) => sum + (cat.weight * cat.expectedYield), 0);
                plan[profile].diversificationScore = categories.length * 10;
            });
            
            return plan;
            
        } catch (error) {
            logError('Diversification plan creation failed:', error);
            return {};
        }
    }

    // 🤖 AI YIELD INSIGHTS
    async getAIYieldInsights(yieldScan, chatId) {
        try {
            const prompt = `
            Analyze these comprehensive yield opportunities and provide strategic insights:
            
            Yield Scan Summary:
            - Total Opportunities: ${yieldScan.totalOpportunities}
            - Categories: ${Object.keys(yieldScan.categories).join(', ')}
            - Top Risk-Adjusted Yields: ${JSON.stringify(yieldScan.riskAdjustedYields.slice(0, 5))}
            - Income Projections: ${JSON.stringify(yieldScan.incomeProjections)}
            
            Market Conditions by Category:
            ${Object.entries(yieldScan.categories).map(([cat, data]) => 
                `- ${cat}: Average Yield ${((data.averageYield || 0) * 100).toFixed(2)}% (${data.opportunities?.length || 0} opportunities)`
            ).join('\n')}
            
            Provide:
            1. Income generation strategy summary
            2. Optimal yield vs risk balance
            3. Diversification recommendations
            4. Interest rate impact analysis
            5. Tax optimization strategies
            6. Long-term income sustainability
            7. Market timing considerations
            `;
            
            const insights = await getDualAnalysis(prompt, {
                chatId: chatId,
                context: 'yield_analysis',
                priority: 'high'
            });
            
            return insights;
            
        } catch (error) {
            logError('AI yield insights failed:', error);
            return 'Yield insights unavailable';
        }
    }

    // 📱 SEND YIELD FINDER REPORT
    async sendYieldFinderReport(yieldScan, chatId) {
        try {
            const topYields = yieldScan.riskAdjustedYields.slice(0, 8);
            const projections = yieldScan.incomeProjections.projections;
            
            const report = `
💰 **COMPREHENSIVE YIELD FINDER REPORT** 📊

**SCAN SUMMARY:**
• Total Opportunities: **${yieldScan.totalOpportunities}**
• Categories Scanned: **${Object.keys(yieldScan.categories).length}**
• Risk-Adjusted Ranking: **${yieldScan.riskAdjustedYields.length} qualified**

🎯 **TOP YIELD OPPORTUNITIES:**
${topYields.map((opp, i) => 
    `${i + 1}. **${opp.symbol || opp.name}** (${opp.categoryName?.toUpperCase()})
   • Yield: **${((opp.yield || 0) * 100).toFixed(2)}%**
   • Risk-Adjusted: **${((opp.riskAdjustedYield || 0) * 100).toFixed(2)}%**
   • Risk Level: **${opp.riskLevel || 'Medium'}/10**
   • Liquidity: **${opp.liquidity || 'Medium'}**`
).join('\n\n')}

📈 **INCOME PROJECTIONS** (on $100K):
${projections ? Object.entries(projections).map(([period, data]) => 
    `• **${period.toUpperCase()}**: $${data.monthlyIncome?.toFixed(0) || '0'}/month, $${data.totalAnnualIncome?.toFixed(0) || '0'}/year`
).join('\n') : '• Calculating projections...'}

📊 **CATEGORY BREAKDOWN:**
${Object.entries(yieldScan.categories).map(([cat, data]) => 
    `• **${cat.toUpperCase()}**: ${((data.averageYield || 0) * 100).toFixed(2)}% avg yield (${data.opportunities?.length || 0} opps)`
).join('\n')}

🎯 **DIVERSIFICATION PLAN:**
${yieldScan.diversificationPlan.moderate ? 
    `• **Moderate Strategy**: ${(yieldScan.diversificationPlan.moderate.expectedYield * 100).toFixed(1)}% expected yield
• **Diversification Score**: ${yieldScan.diversificationPlan.moderate.diversificationScore}/100
• **Risk Level**: ${yieldScan.diversificationPlan.moderate.riskLevel}` :
    '• Generating diversification recommendations...'
}

🤖 **AI INSIGHTS:**
${yieldScan.aiInsights}

📋 **ACTION ITEMS:**
1. Review top 3 risk-adjusted opportunities
2. Consider diversification across ${Object.keys(yieldScan.categories).length} income categories
3. Set up income tracking and monitoring
4. Plan for tax optimization on income streams
5. Rebalance income portfolio quarterly

🔄 Next yield scan in: **24 hours**
            `;
            
            await sendAnalysis(report, chatId, '💰 Yield Finder');
            
        } catch (error) {
            logError('Failed to send yield finder report:', error);
        }
    }

    // Helper Methods (Placeholder implementations)
    async scanDividendAristocrats() {
        return [
            { symbol: 'JNJ', name: 'Johnson & Johnson', yield: 0.026, riskLevel: 3, consecutiveYears: 59 },
            { symbol: 'KO', name: 'Coca-Cola', yield: 0.031, riskLevel: 4, consecutiveYears: 59 },
            { symbol: 'PG', name: 'Procter & Gamble', yield: 0.024, riskLevel: 3, consecutiveYears: 65 }
        ];
    }

    async scanCryptoStaking() {
        return [
            { symbol: 'ETH', name: 'Ethereum 2.0 Staking', yield: 0.045, riskLevel: 7, platform: 'Ethereum' },
            { symbol: 'ADA', name: 'Cardano Staking', yield: 0.052, riskLevel: 8, platform: 'Cardano' },
            { symbol: 'DOT', name: 'Polkadot Staking', yield: 0.112, riskLevel: 9, platform: 'Polkadot' }
        ];
    }

    calculateRiskAdjustedYield(opportunity) {
        const baseYield = opportunity.yield || 0;
        const riskLevel = opportunity.riskLevel || 5;
        const riskAdjustment = Math.max(0.1, 1 - (riskLevel * 0.1));
        return baseYield * riskAdjustment;
    }

    calculateYieldSharpeRatio(opportunity) {
        const yield = opportunity.yield || 0;
        const riskLevel = opportunity.riskLevel || 5;
        const volatility = riskLevel * 0.02; // Approximate volatility
        return (yield - 0.02) / Math.max(volatility, 0.01); // Assuming 2% risk-free rate
    }

    calculateAverageYield(opportunities) {
        if (!opportunities.length) return 0;
        return opportunities.reduce((sum, opp) => sum + (opp.yield || 0), 0) / opportunities.length;
    }

    calculateCompoundedIncome(principal, yield, years) {
        return principal * Math.pow(1 + yield, years);
    }

    adjustForInflation(amount, years, inflationRate = 0.025) {
        return amount / Math.pow(1 + inflationRate, years);
    }

    async saveYieldScanResults(yieldScan) {
        await saveToMemory(`yield_scan_${Date.now()}`, yieldScan);
        this.scanHistory.push(yieldScan.timestamp);
        
        // Keep only last 30 scans
        if (this.scanHistory.length > 30) {
            this.scanHistory.shift();
        }
    }
}

// Export functions for easy integration
module.exports = {
    YieldFinder,
    
    // Main yield finding functions
    findYields: async (preferences, chatId) => {
        const finder = new YieldFinder();
        return await finder.findBestYieldOpportunities(preferences, chatId);
    },
    
    scanDividends: async (preferences) => {
        const finder = new YieldFinder();
        return await finder.scanDividendStocks(preferences);
    },
    
    scanCryptoYields: async (preferences) => {
        const finder = new YieldFinder();
        return await finder.scanCryptoYields(preferences);
    },
    
    getTopYields: async (category, chatId, limit = 10) => {
        const finder = new YieldFinder();
        const results = await finder.findBestYieldOpportunities({ category }, chatId);
        return results.riskAdjustedYields.slice(0, limit);
    },
    
    projectIncome: async (opportunities, amount, years) => {
        const finder = new YieldFinder();
        return await finder.projectIncomeStreams(opportunities, { investmentAmount: amount });
    },
    
    createIncomePortfolio: async (riskLevel, chatId) => {
        const finder = new YieldFinder();
        const results = await finder.findBestYieldOpportunities({ riskLevel }, chatId);
        return results.diversificationPlan[riskLevel] || results.diversificationPlan.moderate;
    }
};
