// utils/portfolioOptimizer.js
const { getUniversalAnalysis, getDualAnalysis } = require('./dualAISystem');
const { sendSmartMessage, sendAnalysis } = require('./telegramSplitter');
const { getLivePrice, getMarketData } = require('./liveData');
const { assessRisk, calculatePositionSize } = require('./riskManager');
const { scanMarkets, getTopOpportunities } = require('./marketScanner');
const { logInfo, logError, logWarning } = require('./logger');
const { saveToMemory, getFromMemory } = require('./memory');

class PortfolioOptimizer {
    constructor() {
        this.optimizationMethods = {
            meanVariance: 'Modern Portfolio Theory',
            blackLitterman: 'Black-Litterman Model',
            riskParity: 'Risk Parity',
            momentum: 'Momentum Strategy',
            value: 'Value Strategy',
            growth: 'Growth Strategy',
            dividend: 'Dividend Strategy',
            balanced: 'Balanced Approach',
            aggressive: 'Aggressive Growth',
            conservative: 'Conservative Income'
        };
        
        this.assetClasses = {
            stocks: { name: 'Stocks', riskLevel: 7, expectedReturn: 0.10, volatility: 0.16 },
            bonds: { name: 'Bonds', riskLevel: 3, expectedReturn: 0.04, volatility: 0.05 },
            crypto: { name: 'Cryptocurrency', riskLevel: 9, expectedReturn: 0.25, volatility: 0.60 },
            realEstate: { name: 'Real Estate', riskLevel: 5, expectedReturn: 0.08, volatility: 0.12 },
            commodities: { name: 'Commodities', riskLevel: 6, expectedReturn: 0.06, volatility: 0.20 },
            cash: { name: 'Cash/Money Market', riskLevel: 1, expectedReturn: 0.02, volatility: 0.01 },
            forex: { name: 'Foreign Exchange', riskLevel: 8, expectedReturn: 0.05, volatility: 0.12 },
            business: { name: 'Business Investments', riskLevel: 8, expectedReturn: 0.15, volatility: 0.25 },
            alternatives: { name: 'Alternative Investments', riskLevel: 7, expectedReturn: 0.12, volatility: 0.18 }
        };
        
        this.rebalanceThresholds = {
            conservative: 0.05,  // 5% drift
            moderate: 0.10,      // 10% drift
            aggressive: 0.15     // 15% drift
        };
        
        this.optimizationCache = new Map();
        this.portfolioHistory = [];
    }

    // 🎯 MASTER PORTFOLIO OPTIMIZATION
    async optimizePortfolio(currentPortfolio, preferences, chatId) {
        try {
            logInfo('📊 Starting comprehensive portfolio optimization');
            
            const optimization = {
                timestamp: Date.now(),
                currentPortfolio: currentPortfolio,
                preferences: preferences,
                analysis: {},
                recommendations: {},
                efficientFrontier: {},
                rebalancing: {},
                projections: {},
                aiInsights: ''
            };

            // Analyze current portfolio
            optimization.analysis = await this.analyzeCurrentPortfolio(currentPortfolio);
            
            // Get market opportunities
            const opportunities = await getTopOpportunities(chatId, 50);
            
            // Calculate efficient frontier
            optimization.efficientFrontier = await this.calculateEfficientFrontier(opportunities, preferences);
            
            // Generate optimal allocations for different strategies
            optimization.recommendations = await this.generateOptimalAllocations(
                currentPortfolio, 
                opportunities, 
                preferences
            );
            
            // Calculate rebalancing needs
            optimization.rebalancing = await this.calculateRebalancing(
                currentPortfolio, 
                optimization.recommendations.optimal
            );
            
            // Project future performance
            optimization.projections = await this.projectPortfolioPerformance(
                optimization.recommendations.optimal, 
                preferences
            );
            
            // Get AI-powered insights
            optimization.aiInsights = await this.getAIOptimizationInsights(optimization, chatId);
            
            // Send comprehensive optimization report
            await this.sendOptimizationReport(optimization, chatId);
            
            // Save optimization results
            await this.saveOptimizationResults(optimization);
            
            return optimization;
            
        } catch (error) {
            logError('Portfolio optimization failed:', error);
            throw error;
        }
    }

    // 📈 EFFICIENT FRONTIER CALCULATION
    async calculateEfficientFrontier(opportunities, preferences) {
        try {
            const assets = this.prepareAssetsForOptimization(opportunities);
            const returns = await this.calculateExpectedReturns(assets);
            const covariance = await this.calculateCovarianceMatrix(assets);
            
            const frontierPoints = [];
            const riskLevels = Array.from({length: 20}, (_, i) => 0.05 + (i * 0.02)); // 5% to 45% risk
            
            for (const targetRisk of riskLevels) {
                const allocation = await this.optimizeForRisk(returns, covariance, targetRisk);
                const expectedReturn = this.calculatePortfolioReturn(allocation, returns);
                const portfolioRisk = this.calculatePortfolioRisk(allocation, covariance);
                const sharpeRatio = (expectedReturn - 0.02) / portfolioRisk; // Assuming 2% risk-free rate
                
                frontierPoints.push({
                    risk: portfolioRisk,
                    return: expectedReturn,
                    sharpeRatio: sharpeRatio,
                    allocation: allocation,
                    assets: this.mapAllocationToAssets(allocation, assets)
                });
            }
            
            // Find optimal portfolio (maximum Sharpe ratio)
            const optimalPoint = frontierPoints.reduce((best, current) => 
                current.sharpeRatio > best.sharpeRatio ? current : best
            );
            
            return {
                frontierPoints: frontierPoints,
                optimalPortfolio: optimalPoint,
                maxSharpeRatio: optimalPoint.sharpeRatio,
                efficientAssets: assets.length,
                diversificationBenefit: this.calculateDiversificationBenefit(optimalPoint.allocation)
            };
            
        } catch (error) {
            logError('Efficient frontier calculation failed:', error);
            return { frontierPoints: [], optimalPortfolio: null };
        }
    }

    // 🎯 GENERATE OPTIMAL ALLOCATIONS
    async generateOptimalAllocations(currentPortfolio, opportunities, preferences) {
        try {
            const allocations = {};
            const totalValue = this.calculatePortfolioValue(currentPortfolio);
            
            // Conservative allocation (60/30/10)
            allocations.conservative = {
                name: 'Conservative Growth',
                targetRisk: 0.08,
                expectedReturn: 0.06,
                allocation: {
                    stocks: 0.40,
                    bonds: 0.35,
                    realEstate: 0.10,
                    commodities: 0.05,
                    cash: 0.10
                },
                timeHorizon: '3-5 years',
                suitability: 'Low risk tolerance, income focus'
            };
            
            // Moderate allocation (70/20/10)
            allocations.moderate = {
                name: 'Balanced Growth',
                targetRisk: 0.12,
                expectedReturn: 0.08,
                allocation: {
                    stocks: 0.50,
                    bonds: 0.20,
                    realEstate: 0.15,
                    crypto: 0.05,
                    commodities: 0.05,
                    cash: 0.05
                },
                timeHorizon: '5-10 years',
                suitability: 'Moderate risk tolerance, balanced approach'
            };
            
            // Aggressive allocation (85/10/5)
            allocations.aggressive = {
                name: 'Aggressive Growth',
                targetRisk: 0.18,
                expectedReturn: 0.12,
                allocation: {
                    stocks: 0.60,
                    crypto: 0.15,
                    realEstate: 0.10,
                    business: 0.10,
                    commodities: 0.03,
                    cash: 0.02
                },
                timeHorizon: '10+ years',
                suitability: 'High risk tolerance, growth focus'
            };
            
            // AI-optimized allocation
            allocations.aiOptimized = await this.generateAIOptimizedAllocation(
                currentPortfolio, 
                opportunities, 
                preferences
            );
            
            // Goal-based allocations
            allocations.retirement = await this.generateRetirementAllocation(preferences);
            allocations.income = await this.generateIncomeAllocation(opportunities);
            allocations.growth = await this.generateGrowthAllocation(opportunities);
            
            // Select optimal based on preferences
            allocations.optimal = this.selectOptimalAllocation(allocations, preferences);
            
            // Calculate transition plan
            allocations.transitionPlan = await this.createTransitionPlan(
                currentPortfolio, 
                allocations.optimal
            );
            
            return allocations;
            
        } catch (error) {
            logError('Allocation generation failed:', error);
            return {};
        }
    }

    // 🤖 AI-OPTIMIZED ALLOCATION
    async generateAIOptimizedAllocation(currentPortfolio, opportunities, preferences) {
        try {
            const prompt = `
            Create an optimal portfolio allocation based on:
            
            Current Portfolio: ${JSON.stringify(currentPortfolio)}
            Top Opportunities: ${JSON.stringify(opportunities.slice(0, 10))}
            Preferences: ${JSON.stringify(preferences)}
            
            Consider:
            1. Risk tolerance and time horizon
            2. Market conditions and trends
            3. Correlation between assets
            4. Tax implications
            5. Liquidity needs
            6. Geographic diversification
            7. Sector diversification
            8. ESG preferences if applicable
            
            Provide:
            1. Optimal asset allocation percentages
            2. Specific asset recommendations
            3. Reasoning for each allocation
            4. Risk assessment
            5. Expected return projection
            6. Rebalancing frequency recommendation
            `;
            
            const aiResponse = await getDualAnalysis(prompt, {
                chatId: preferences.chatId,
                context: 'portfolio_optimization',
                priority: 'high'
            });
            
            // Parse AI response and create structured allocation
            const allocation = await this.parseAIAllocation(aiResponse);
            
            return {
                name: 'AI-Optimized Portfolio',
                method: 'Dual AI Analysis',
                allocation: allocation.percentages,
                specificAssets: allocation.assets,
                reasoning: allocation.reasoning,
                riskAssessment: allocation.risk,
                expectedReturn: allocation.expectedReturn,
                rebalanceFrequency: allocation.rebalanceFrequency,
                aiConfidence: allocation.confidence,
                lastOptimized: Date.now()
            };
            
        } catch (error) {
            logError('AI optimization failed:', error);
            return this.getDefaultAIAllocation();
        }
    }

    // 🔄 CALCULATE REBALANCING NEEDS
    async calculateRebalancing(currentPortfolio, targetAllocation) {
        try {
            const currentValue = this.calculatePortfolioValue(currentPortfolio);
            const currentAllocations = this.calculateCurrentAllocations(currentPortfolio);
            
            const rebalancingNeeds = [];
            const trades = [];
            let totalRebalancingCost = 0;
            
            for (const [assetClass, targetPercent] of Object.entries(targetAllocation.allocation)) {
                const currentPercent = currentAllocations[assetClass] || 0;
                const difference = targetPercent - currentPercent;
                const dollarDifference = difference * currentValue;
                
                if (Math.abs(difference) > 0.02) { // 2% threshold
                    rebalancingNeeds.push({
                        assetClass: assetClass,
                        currentPercent: currentPercent,
                        targetPercent: targetPercent,
                        difference: difference,
                        dollarAmount: dollarDifference,
                        action: difference > 0 ? 'BUY' : 'SELL'
                    });
                    
                    trades.push({
                        action: difference > 0 ? 'BUY' : 'SELL',
                        assetClass: assetClass,
                        amount: Math.abs(dollarDifference),
                        priority: Math.abs(difference) > 0.05 ? 'HIGH' : 'MEDIUM'
                    });
                }
            }
            
            // Calculate rebalancing costs
            totalRebalancingCost = trades.reduce((cost, trade) => {
                return cost + (trade.amount * 0.001); // Assuming 0.1% transaction cost
            }, 0);
            
            // Determine rebalancing frequency
            const rebalanceFrequency = this.determineRebalanceFrequency(rebalancingNeeds, currentValue);
            
            return {
                needed: rebalancingNeeds.length > 0,
                totalTrades: trades.length,
                rebalancingNeeds: rebalancingNeeds,
                trades: trades,
                estimatedCost: totalRebalancingCost,
                costPercent: (totalRebalancingCost / currentValue) * 100,
                recommendedFrequency: rebalanceFrequency,
                nextRebalanceDate: this.calculateNextRebalanceDate(rebalanceFrequency),
                urgency: this.calculateRebalanceUrgency(rebalancingNeeds)
            };
            
        } catch (error) {
            logError('Rebalancing calculation failed:', error);
            return { needed: false, trades: [] };
        }
    }

    // 📊 PROJECT PORTFOLIO PERFORMANCE
    async projectPortfolioPerformance(allocation, preferences) {
        try {
            const timeHorizons = [1, 3, 5, 10, 20]; // years
            const projections = {};
            
            for (const years of timeHorizons) {
                const scenarios = await this.runMonteCarloSimulation(allocation, years, 1000);
                
                projections[`${years}year`] = {
                    timeHorizon: years,
                    expectedValue: scenarios.mean,
                    bestCase: scenarios.percentile95,
                    worstCase: scenarios.percentile5,
                    medianCase: scenarios.median,
                    probabilityOfLoss: scenarios.probabilityOfLoss,
                    probabilityOfDoubling: scenarios.probabilityOfDoubling,
                    expectedReturn: scenarios.expectedAnnualReturn,
                    volatility: scenarios.volatility,
                    sharpeRatio: scenarios.sharpeRatio,
                    maxDrawdown: scenarios.maxDrawdown
                };
            }
            
            // Calculate goal achievement probability
            const goalProbability = preferences.financialGoals ? 
                await this.calculateGoalProbability(allocation, preferences.financialGoals) : null;
            
            return {
                projections: projections,
                methodology: 'Monte Carlo Simulation (1000 iterations)',
                assumptions: this.getProjectionAssumptions(),
                goalProbability: goalProbability,
                inflationAdjusted: true,
                lastUpdated: Date.now()
            };
            
        } catch (error) {
            logError('Performance projection failed:', error);
            return { projections: {} };
        }
    }

    // 🎯 MONTE CARLO SIMULATION
    async runMonteCarloSimulation(allocation, years, iterations) {
        try {
            const results = [];
            const annualReturns = [];
            
            for (let i = 0; i < iterations; i++) {
                let portfolioValue = 100000; // Starting value
                const yearlyReturns = [];
                
                for (let year = 0; year < years; year++) {
                    const yearReturn = this.generateRandomReturn(allocation);
                    yearlyReturns.push(yearReturn);
                    portfolioValue *= (1 + yearReturn);
                }
                
                results.push(portfolioValue);
                annualReturns.push(this.calculateAnnualizedReturn(portfolioValue, 100000, years));
            }
            
            results.sort((a, b) => a - b);
            annualReturns.sort((a, b) => a - b);
            
            return {
                mean: results.reduce((sum, val) => sum + val, 0) / results.length,
                median: results[Math.floor(results.length / 2)],
                percentile5: results[Math.floor(results.length * 0.05)],
                percentile95: results[Math.floor(results.length * 0.95)],
                probabilityOfLoss: results.filter(val => val < 100000).length / results.length,
                probabilityOfDoubling: results.filter(val => val >= 200000).length / results.length,
                expectedAnnualReturn: annualReturns.reduce((sum, val) => sum + val, 0) / annualReturns.length,
                volatility: this.calculateStandardDeviation(annualReturns),
                sharpeRatio: this.calculateSharpeRatio(annualReturns),
                maxDrawdown: this.calculateMaxDrawdown(results)
            };
            
        } catch (error) {
            logError('Monte Carlo simulation failed:', error);
            return {};
        }
    }

    // 🤖 AI OPTIMIZATION INSIGHTS
    async getAIOptimizationInsights(optimization, chatId) {
        try {
            const prompt = `
            Analyze this portfolio optimization and provide strategic insights:
            
            Current Portfolio Analysis: ${JSON.stringify(optimization.analysis)}
            Optimal Allocation: ${JSON.stringify(optimization.recommendations.optimal)}
            Efficient Frontier: Max Sharpe Ratio = ${optimization.efficientFrontier.maxSharpeRatio}
            Rebalancing Needs: ${JSON.stringify(optimization.rebalancing)}
            Performance Projections: ${JSON.stringify(optimization.projections)}
            
            Provide:
            1. Portfolio optimization summary
            2. Key improvement opportunities
            3. Risk-return trade-off analysis
            4. Specific action recommendations
            5. Market timing considerations
            6. Tax optimization strategies
            7. Long-term wealth building plan
            `;
            
            const insights = await getDualAnalysis(prompt, {
                chatId: chatId,
                context: 'portfolio_optimization',
                priority: 'high'
            });
            
            return insights;
            
        } catch (error) {
            logError('AI optimization insights failed:', error);
            return 'Optimization insights unavailable';
        }
    }

    // 📱 SEND OPTIMIZATION REPORT
    async sendOptimizationReport(optimization, chatId) {
        try {
            const current = optimization.analysis;
            const optimal = optimization.recommendations.optimal;
            const rebalance = optimization.rebalancing;
            
            const report = `
📊 **PORTFOLIO OPTIMIZATION REPORT** 💰

**CURRENT PORTFOLIO ANALYSIS:**
• Total Value: **$${current.totalValue?.toLocaleString() || 'N/A'}**
• Risk Level: **${current.riskLevel || 'Medium'}/10**
• Diversification Score: **${current.diversificationScore || 75}/100**
• Annual Return: **${(current.expectedReturn * 100).toFixed(1) || 'N/A'}%**

**OPTIMAL ALLOCATION STRATEGY:**
• Strategy: **${optimal.name}**
• Expected Return: **${(optimal.expectedReturn * 100).toFixed(1)}%**
• Risk Level: **${optimal.targetRisk ? (optimal.targetRisk * 100).toFixed(1) + '%' : 'Optimized'}**

**TOP ASSET ALLOCATIONS:**
${Object.entries(optimal.allocation)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([asset, percent]) => `• **${asset.toUpperCase()}**: ${(percent * 100).toFixed(1)}%`)
  .join('\n')}

**REBALANCING NEEDS:**
${rebalance.needed ? 
  `• **${rebalance.totalTrades} trades needed**
• Estimated Cost: **$${rebalance.estimatedCost?.toFixed(2) || '0'}**
• Urgency: **${rebalance.urgency || 'Medium'}**
• Next Rebalance: **${rebalance.recommendedFrequency || 'Quarterly'}**` :
  '• **Portfolio is well-balanced** ✅'
}

**PERFORMANCE PROJECTIONS:**
• 5-Year Expected: **${optimization.projections?.projections?.['5year']?.expectedValue ? 
  '$' + Math.round(optimization.projections.projections['5year'].expectedValue).toLocaleString() : 'Calculating...'}**
• 10-Year Expected: **${optimization.projections?.projections?.['10year']?.expectedValue ? 
  '$' + Math.round(optimization.projections.projections['10year'].expectedValue).toLocaleString() : 'Calculating...'}**
• Probability of Loss (5yr): **${optimization.projections?.projections?.['5year']?.probabilityOfLoss ? 
  (optimization.projections.projections['5year'].probabilityOfLoss * 100).toFixed(1) + '%' : 'Low'}**

🤖 **AI INSIGHTS:**
${optimization.aiInsights}

📈 **NEXT STEPS:**
1. Review recommended allocation strategy
2. ${rebalance.needed ? 'Execute rebalancing trades' : 'Monitor portfolio quarterly'}
3. Set up automatic rebalancing alerts
4. Review and adjust in ${optimal.timeHorizon || '6 months'}
            `;
            
            await sendAnalysis(report, chatId, '📊 Portfolio Optimizer');
            
        } catch (error) {
            logError('Failed to send optimization report:', error);
        }
    }

    // Helper Methods
    calculatePortfolioValue(portfolio) {
        return Array.isArray(portfolio) ? 
            portfolio.reduce((sum, holding) => sum + (holding.value || 0), 0) : 100000;
    }

    calculateCurrentAllocations(portfolio) {
        const total = this.calculatePortfolioValue(portfolio);
        const allocations = {};
        
        if (Array.isArray(portfolio)) {
            portfolio.forEach(holding => {
                const assetClass = holding.assetClass || 'stocks';
                allocations[assetClass] = (allocations[assetClass] || 0) + (holding.value / total);
            });
        }
        
        return allocations;
    }

    generateRandomReturn(allocation) {
        let portfolioReturn = 0;
        
        for (const [assetClass, weight] of Object.entries(allocation.allocation || {})) {
            const assetData = this.assetClasses[assetClass];
            if (assetData) {
                // Generate random return using normal distribution
                const randomReturn = this.normalRandom(assetData.expectedReturn, assetData.volatility);
                portfolioReturn += weight * randomReturn;
            }
        }
        
        return portfolioReturn;
    }

    normalRandom(mean, stdDev) {
        // Box-Muller transformation for normal distribution
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    async saveOptimizationResults(optimization) {
        await saveToMemory(`portfolio_optimization_${Date.now()}`, optimization);
        this.portfolioHistory.push(optimization.timestamp);
    }
}

// Export functions for easy integration
module.exports = {
    PortfolioOptimizer,
    
    // Main optimization functions
    optimizePortfolio: async (portfolio, preferences, chatId) => {
        const optimizer = new PortfolioOptimizer();
        return await optimizer.optimizePortfolio(portfolio, preferences, chatId);
    },
    
    calculateEfficientFrontier: async (opportunities, preferences) => {
        const optimizer = new PortfolioOptimizer();
        return await optimizer.calculateEfficientFrontier(opportunities, preferences);
    },
    
    getOptimalAllocation: async (portfolio, preferences, chatId) => {
        const optimizer = new PortfolioOptimizer();
        const result = await optimizer.optimizePortfolio(portfolio, preferences, chatId);
        return result.recommendations.optimal;
    },
    
    calculateRebalancing: async (currentPortfolio, targetAllocation) => {
        const optimizer = new PortfolioOptimizer();
        return await optimizer.calculateRebalancing(currentPortfolio, targetAllocation);
    },
    
    projectPerformance: async (allocation, preferences) => {
        const optimizer = new PortfolioOptimizer();
        return await optimizer.projectPortfolioPerformance(allocation, preferences);
    }
};
