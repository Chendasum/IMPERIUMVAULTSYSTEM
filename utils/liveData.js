// 🏆 WEALTH MODULE 1: RISK MANAGEMENT & PORTFOLIO OPTIMIZATION
// Integrates with your Perfect 10/10 DualAISystem + LiveData
const { getUniversalAnalysis, getDualAnalysis } = require('../utils/dualAISystem');
const { getRayDalioMarketData, detectEconomicRegime, getYieldCurveAnalysis } = require('../utils/liveData');

// 🎯 ADVANCED RISK METRICS CALCULATOR
class AdvancedRiskCalculator {
    constructor() {
        this.riskModels = {
            VAR: 'Value at Risk',
            CVAR: 'Conditional Value at Risk', 
            SHARPE: 'Sharpe Ratio',
            SORTINO: 'Sortino Ratio',
            MAX_DRAWDOWN: 'Maximum Drawdown',
            BETA: 'Market Beta',
            CORRELATION: 'Asset Correlation',
            VOLATILITY: 'Annualized Volatility'
        };
        
        this.portfolioTypes = {
            CONSERVATIVE: { maxRisk: 0.05, targetReturn: 0.06 },
            MODERATE: { maxRisk: 0.10, targetReturn: 0.08 },
            AGGRESSIVE: { maxRisk: 0.20, targetReturn: 0.12 },
            INSTITUTIONAL: { maxRisk: 0.15, targetReturn: 0.10 }
        };
    }
    
    // 📊 CALCULATE VALUE AT RISK (95% confidence)
    calculateVaR(returns, confidenceLevel = 0.95) {
        try {
            if (!Array.isArray(returns) || returns.length === 0) {
                throw new Error('Invalid returns data');
            }
            
            const sortedReturns = returns.slice().sort((a, b) => a - b);
            const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
            const var95 = -sortedReturns[index];
            
            return {
                var95: var95,
                confidence: confidenceLevel,
                interpretation: var95 > 0.05 ? 'HIGH_RISK' : var95 > 0.02 ? 'MODERATE_RISK' : 'LOW_RISK',
                dailyVaR: var95,
                monthlyVaR: var95 * Math.sqrt(30),
                annualVaR: var95 * Math.sqrt(252)
            };
        } catch (error) {
            console.error('VaR calculation error:', error.message);
            return { error: error.message };
        }
    }
    
    // 📈 CALCULATE SHARPE RATIO
    calculateSharpeRatio(portfolioReturns, riskFreeRate = 0.02) {
        try {
            const avgReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
            const variance = portfolioReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / portfolioReturns.length;
            const volatility = Math.sqrt(variance * 252); // Annualized
            const excessReturn = (avgReturn * 252) - riskFreeRate; // Annualized
            
            const sharpeRatio = excessReturn / volatility;
            
            return {
                sharpeRatio: sharpeRatio,
                annualizedReturn: avgReturn * 252,
                annualizedVolatility: volatility,
                riskFreeRate: riskFreeRate,
                interpretation: sharpeRatio > 1.5 ? 'EXCELLENT' : sharpeRatio > 1.0 ? 'GOOD' : sharpeRatio > 0.5 ? 'FAIR' : 'POOR'
            };
        } catch (error) {
            console.error('Sharpe ratio calculation error:', error.message);
            return { error: error.message };
        }
    }
    
    // 📉 CALCULATE MAXIMUM DRAWDOWN
    calculateMaxDrawdown(prices) {
        try {
            let maxDrawdown = 0;
            let peak = prices[0];
            let peakIndex = 0;
            let troughIndex = 0;
            
            for (let i = 1; i < prices.length; i++) {
                if (prices[i] > peak) {
                    peak = prices[i];
                    peakIndex = i;
                }
                
                const drawdown = (peak - prices[i]) / peak;
                if (drawdown > maxDrawdown) {
                    maxDrawdown = drawdown;
                    troughIndex = i;
                }
            }
            
            return {
                maxDrawdown: maxDrawdown,
                maxDrawdownPercent: maxDrawdown * 100,
                peakIndex: peakIndex,
                troughIndex: troughIndex,
                recoveryTime: prices.length - troughIndex,
                interpretation: maxDrawdown > 0.3 ? 'HIGH_VOLATILITY' : maxDrawdown > 0.15 ? 'MODERATE_VOLATILITY' : 'LOW_VOLATILITY'
            };
        } catch (error) {
            console.error('Max drawdown calculation error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🔗 CALCULATE CORRELATION MATRIX
    calculateCorrelationMatrix(assetReturns) {
        try {
            const assets = Object.keys(assetReturns);
            const correlationMatrix = {};
            
            for (let i = 0; i < assets.length; i++) {
                correlationMatrix[assets[i]] = {};
                for (let j = 0; j < assets.length; j++) {
                    if (i === j) {
                        correlationMatrix[assets[i]][assets[j]] = 1.0;
                    } else {
                        const corr = this.calculateCorrelation(assetReturns[assets[i]], assetReturns[assets[j]]);
                        correlationMatrix[assets[i]][assets[j]] = corr;
                    }
                }
            }
            
            // Calculate diversification score
            let totalCorrelation = 0;
            let pairCount = 0;
            
            for (let i = 0; i < assets.length; i++) {
                for (let j = i + 1; j < assets.length; j++) {
                    totalCorrelation += Math.abs(correlationMatrix[assets[i]][assets[j]]);
                    pairCount++;
                }
            }
            
            const avgCorrelation = totalCorrelation / pairCount;
            const diversificationScore = Math.max(0, 100 - (avgCorrelation * 100));
            
            return {
                correlationMatrix,
                averageCorrelation: avgCorrelation,
                diversificationScore,
                diversificationLevel: diversificationScore > 80 ? 'EXCELLENT' : diversificationScore > 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
            };
        } catch (error) {
            console.error('Correlation matrix calculation error:', error.message);
            return { error: error.message };
        }
    }
    
    // 📊 HELPER: Calculate correlation between two assets
    calculateCorrelation(returns1, returns2) {
        const n = Math.min(returns1.length, returns2.length);
        
        const mean1 = returns1.slice(0, n).reduce((sum, r) => sum + r, 0) / n;
        const mean2 = returns2.slice(0, n).reduce((sum, r) => sum + r, 0) / n;
        
        let numerator = 0;
        let sum1Sq = 0;
        let sum2Sq = 0;
        
        for (let i = 0; i < n; i++) {
            const diff1 = returns1[i] - mean1;
            const diff2 = returns2[i] - mean2;
            
            numerator += diff1 * diff2;
            sum1Sq += diff1 * diff1;
            sum2Sq += diff2 * diff2;
        }
        
        const denominator = Math.sqrt(sum1Sq * sum2Sq);
        return denominator === 0 ? 0 : numerator / denominator;
    }
}

// 🎯 PORTFOLIO OPTIMIZATION ENGINE
class PortfolioOptimizer {
    constructor() {
        this.optimizationMethods = {
            MEAN_VARIANCE: 'Modern Portfolio Theory',
            BLACK_LITTERMAN: 'Black-Litterman Model',
            RISK_PARITY: 'Risk Parity Allocation',
            MINIMUM_VARIANCE: 'Minimum Variance Portfolio',
            MAXIMUM_SHARPE: 'Maximum Sharpe Ratio'
        };
        
        this.constraints = {
            maxAssetWeight: 0.4,
            minAssetWeight: 0.02,
            maxSectorWeight: 0.3,
            cashMinimum: 0.05
        };
    }
    
    // 🎯 MEAN VARIANCE OPTIMIZATION
    optimizeMeanVariance(expectedReturns, covarianceMatrix, targetReturn = null, riskFreeRate = 0.02) {
        try {
            const assets = Object.keys(expectedReturns);
            const n = assets.length;
            
            // Simple equal-weight baseline
            let weights = {};
            assets.forEach(asset => {
                weights[asset] = 1 / n;
            });
            
            // Calculate portfolio metrics
            const portfolioReturn = this.calculatePortfolioReturn(weights, expectedReturns);
            const portfolioVolatility = this.calculatePortfolioVolatility(weights, covarianceMatrix);
            const sharpeRatio = (portfolioReturn - riskFreeRate) / portfolioVolatility;
            
            // Optimize using simplified approach (in production, use quadratic programming)
            const optimizedWeights = this.simpleOptimization(expectedReturns, covarianceMatrix, targetReturn);
            
            return {
                weights: optimizedWeights,
                expectedReturn: this.calculatePortfolioReturn(optimizedWeights, expectedReturns),
                expectedVolatility: this.calculatePortfolioVolatility(optimizedWeights, covarianceMatrix),
                sharpeRatio: sharpeRatio,
                method: 'MEAN_VARIANCE',
                constraints: this.constraints,
                optimizationDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Mean variance optimization error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🎯 RISK PARITY OPTIMIZATION
    optimizeRiskParity(covarianceMatrix) {
        try {
            const assets = Object.keys(covarianceMatrix);
            const n = assets.length;
            
            // Calculate asset volatilities
            const volatilities = {};
            assets.forEach(asset => {
                volatilities[asset] = Math.sqrt(covarianceMatrix[asset][asset]);
            });
            
            // Risk parity: inverse volatility weighting
            const invVolSum = Object.values(volatilities).reduce((sum, vol) => sum + (1 / vol), 0);
            
            const weights = {};
            assets.forEach(asset => {
                weights[asset] = (1 / volatilities[asset]) / invVolSum;
            });
            
            return {
                weights,
                method: 'RISK_PARITY',
                volatilities,
                portfolioVolatility: this.calculatePortfolioVolatility(weights, covarianceMatrix),
                balanceScore: this.calculateRiskBalance(weights, covarianceMatrix),
                optimizationDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Risk parity optimization error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🎯 MINIMUM VARIANCE OPTIMIZATION
    optimizeMinimumVariance(covarianceMatrix) {
        try {
            const assets = Object.keys(covarianceMatrix);
            
            // Simplified minimum variance: equal weight adjusted by inverse variance
            const variances = {};
            assets.forEach(asset => {
                variances[asset] = covarianceMatrix[asset][asset];
            });
            
            const invVarSum = Object.values(variances).reduce((sum, var_) => sum + (1 / var_), 0);
            
            const weights = {};
            assets.forEach(asset => {
                weights[asset] = (1 / variances[asset]) / invVarSum;
            });
            
            return {
                weights,
                method: 'MINIMUM_VARIANCE',
                portfolioVariance: this.calculatePortfolioVariance(weights, covarianceMatrix),
                portfolioVolatility: this.calculatePortfolioVolatility(weights, covarianceMatrix),
                diversificationRatio: this.calculateDiversificationRatio(weights, covarianceMatrix),
                optimizationDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Minimum variance optimization error:', error.message);
            return { error: error.message };
        }
    }
    
    // 📊 HELPER: Calculate portfolio return
    calculatePortfolioReturn(weights, expectedReturns) {
        return Object.keys(weights).reduce((sum, asset) => {
            return sum + (weights[asset] * expectedReturns[asset]);
        }, 0);
    }
    
    // 📊 HELPER: Calculate portfolio volatility
    calculatePortfolioVolatility(weights, covarianceMatrix) {
        return Math.sqrt(this.calculatePortfolioVariance(weights, covarianceMatrix));
    }
    
    // 📊 HELPER: Calculate portfolio variance
    calculatePortfolioVariance(weights, covarianceMatrix) {
        const assets = Object.keys(weights);
        let variance = 0;
        
        for (let i = 0; i < assets.length; i++) {
            for (let j = 0; j < assets.length; j++) {
                const weight_i = weights[assets[i]];
                const weight_j = weights[assets[j]];
                const covariance = covarianceMatrix[assets[i]][assets[j]];
                variance += weight_i * weight_j * covariance;
            }
        }
        
        return variance;
    }
    
    // 🎯 SIMPLE OPTIMIZATION (placeholder for advanced methods)
    simpleOptimization(expectedReturns, covarianceMatrix, targetReturn = null) {
        const assets = Object.keys(expectedReturns);
        
        // Start with equal weights
        const weights = {};
        const baseWeight = 1 / assets.length;
        
        assets.forEach(asset => {
            weights[asset] = baseWeight;
        });
        
        // Simple adjustment based on Sharpe ratio
        const adjustedWeights = {};
        let totalAdjustment = 0;
        
        assets.forEach(asset => {
            const variance = covarianceMatrix[asset][asset];
            const sharpe = expectedReturns[asset] / Math.sqrt(variance);
            const adjustment = Math.max(0.02, Math.min(0.4, baseWeight * (1 + sharpe)));
            adjustedWeights[asset] = adjustment;
            totalAdjustment += adjustment;
        });
        
        // Normalize to sum to 1
        assets.forEach(asset => {
            adjustedWeights[asset] = adjustedWeights[asset] / totalAdjustment;
        });
        
        return adjustedWeights;
    }
    
    // 📊 HELPER: Calculate risk balance score
    calculateRiskBalance(weights, covarianceMatrix) {
        const assets = Object.keys(weights);
        const riskContributions = {};
        
        let totalRisk = 0;
        assets.forEach(asset => {
            const marginalRisk = this.calculateMarginalRisk(asset, weights, covarianceMatrix);
            riskContributions[asset] = weights[asset] * marginalRisk;
            totalRisk += riskContributions[asset];
        });
        
        // Calculate balance score (higher = more balanced)
        const targetContribution = 1 / assets.length;
        let deviationSum = 0;
        
        assets.forEach(asset => {
            const actualContribution = riskContributions[asset] / totalRisk;
            deviationSum += Math.abs(actualContribution - targetContribution);
        });
        
        return Math.max(0, 100 - (deviationSum * 100));
    }
    
    // 📊 HELPER: Calculate marginal risk
    calculateMarginalRisk(asset, weights, covarianceMatrix) {
        const assets = Object.keys(weights);
        let marginalRisk = 0;
        
        assets.forEach(otherAsset => {
            marginalRisk += weights[otherAsset] * covarianceMatrix[asset][otherAsset];
        });
        
        return marginalRisk;
    }
    
    // 📊 HELPER: Calculate diversification ratio
    calculateDiversificationRatio(weights, covarianceMatrix) {
        const assets = Object.keys(weights);
        
        // Weighted average volatility
        let weightedAvgVol = 0;
        assets.forEach(asset => {
            weightedAvgVol += weights[asset] * Math.sqrt(covarianceMatrix[asset][asset]);
        });
        
        // Portfolio volatility
        const portfolioVol = this.calculatePortfolioVolatility(weights, covarianceMatrix);
        
        return weightedAvgVol / portfolioVol;
    }
}

// 🎯 REGIME-AWARE RISK MANAGER
class RegimeAwareRiskManager {
    constructor() {
        this.regimeRiskProfiles = {
            'GROWTH_INFLATION_RISING': {
                riskMultiplier: 1.2,
                maxVolatility: 0.18,
                recommendedAllocation: {
                    stocks: 0.45,
                    bonds: 0.15,
                    commodities: 0.25,
                    cash: 0.15
                }
            },
            'GROWTH_RISING_INFLATION_FALLING': {
                riskMultiplier: 0.8,
                maxVolatility: 0.12,
                recommendedAllocation: {
                    stocks: 0.70,
                    bonds: 0.20,
                    commodities: 0.05,
                    cash: 0.05
                }
            },
            'GROWTH_FALLING_INFLATION_RISING': {
                riskMultiplier: 1.5,
                maxVolatility: 0.25,
                recommendedAllocation: {
                    stocks: 0.25,
                    bonds: 0.15,
                    commodities: 0.35,
                    cash: 0.25
                }
            },
            'GROWTH_FALLING_INFLATION_FALLING': {
                riskMultiplier: 1.0,
                maxVolatility: 0.15,
                recommendedAllocation: {
                    stocks: 0.40,
                    bonds: 0.50,
                    commodities: 0.05,
                    cash: 0.05
                }
            }
        };
    }
    
    // 🎯 ADJUST RISK FOR CURRENT REGIME
    async adjustRiskForRegime(basePortfolio, userRiskTolerance = 'MODERATE') {
        try {
            // Get current economic regime
            const regimeData = await detectEconomicRegime();
            const currentRegime = regimeData?.currentRegime?.name || 'GROWTH_RISING_INFLATION_FALLING';
            
            const regimeProfile = this.regimeRiskProfiles[currentRegime];
            const adjustmentFactor = regimeProfile.riskMultiplier;
            
            // Adjust portfolio weights based on regime
            const adjustedPortfolio = {};
            let totalWeight = 0;
            
            Object.keys(basePortfolio.weights).forEach(asset => {
                const baseWeight = basePortfolio.weights[asset];
                const regimeAdjustment = this.getAssetRegimeAdjustment(asset, currentRegime);
                adjustedPortfolio[asset] = baseWeight * regimeAdjustment;
                totalWeight += adjustedPortfolio[asset];
            });
            
            // Normalize weights
            Object.keys(adjustedPortfolio).forEach(asset => {
                adjustedPortfolio[asset] = adjustedPortfolio[asset] / totalWeight;
            });
            
            return {
                adjustedWeights: adjustedPortfolio,
                currentRegime: currentRegime,
                regimeConfidence: regimeData?.confidence || 70,
                riskMultiplier: adjustmentFactor,
                maxVolatility: regimeProfile.maxVolatility,
                recommendedAllocation: regimeProfile.recommendedAllocation,
                adjustmentReasoning: this.getRegimeReasoning(currentRegime),
                lastUpdate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Regime risk adjustment error:', error.message);
            return {
                error: error.message,
                fallbackRegime: 'GROWTH_RISING_INFLATION_FALLING',
                adjustedWeights: basePortfolio.weights
            };
        }
    }
    
    // 🎯 GET ASSET REGIME ADJUSTMENT
    getAssetRegimeAdjustment(asset, regime) {
        const adjustments = {
            'GROWTH_INFLATION_RISING': {
                'stocks': 0.9,
                'bonds': 0.6,
                'commodities': 1.4,
                'cash': 1.2,
                'tips': 1.3,
                'reits': 1.1
            },
            'GROWTH_RISING_INFLATION_FALLING': {
                'stocks': 1.3,
                'bonds': 1.0,
                'commodities': 0.7,
                'cash': 0.8,
                'tips': 0.8,
                'reits': 1.1
            },
            'GROWTH_FALLING_INFLATION_RISING': {
                'stocks': 0.6,
                'bonds': 0.7,
                'commodities': 1.5,
                'cash': 1.4,
                'tips': 1.4,
                'reits': 0.8
            },
            'GROWTH_FALLING_INFLATION_FALLING': {
                'stocks': 0.8,
                'bonds': 1.4,
                'commodities': 0.6,
                'cash': 1.0,
                'tips': 0.7,
                'reits': 0.9
            }
        };
        
        const assetType = this.classifyAsset(asset);
        return adjustments[regime]?.[assetType] || 1.0;
    }
    
    // 📊 CLASSIFY ASSET TYPE
    classifyAsset(asset) {
        const assetMappings = {
            'SPY': 'stocks', 'QQQ': 'stocks', 'DIA': 'stocks', 'VTI': 'stocks',
            'TLT': 'bonds', 'IEF': 'bonds', 'SHY': 'bonds', 'AGG': 'bonds',
            'GLD': 'commodities', 'SLV': 'commodities', 'USO': 'commodities',
            'SHV': 'cash', 'BIL': 'cash',
            'TIPS': 'tips', 'SCHP': 'tips',
            'VNQ': 'reits', 'REIT': 'reits'
        };
        
        return assetMappings[asset.toUpperCase()] || 'stocks';
    }
    
    // 💡 GET REGIME REASONING
    getRegimeReasoning(regime) {
        const reasoning = {
            'GROWTH_INFLATION_RISING': 'Economic acceleration with inflation pressures favors commodities and inflation-protected assets',
            'GROWTH_RISING_INFLATION_FALLING': 'Goldilocks scenario supports growth assets and risk-taking',
            'GROWTH_FALLING_INFLATION_RISING': 'Stagflation environment requires defensive positioning with commodity exposure',
            'GROWTH_FALLING_INFLATION_FALLING': 'Deflationary scenario favors high-quality bonds and defensive assets'
        };
        
        return reasoning[regime] || 'Balanced allocation appropriate for uncertain regime';
    }
}

// 🎯 MASTER RISK MANAGEMENT FUNCTION
async function analyzePortfolioRisk(portfolio, options = {}) {
    try {
        console.log('🎯 Starting comprehensive risk analysis...');
        
        const riskCalc = new AdvancedRiskCalculator();
        const optimizer = new PortfolioOptimizer();
        const regimeManager = new RegimeAwareRiskManager();
        
        // Get market data for context
        const [marketData, regimeData, yieldCurve] = await Promise.all([
            getRayDalioMarketData().catch(err => ({ error: err.message })),
            detectEconomicRegime().catch(err => ({ error: err.message })),
            getYieldCurveAnalysis().catch(err => ({ error: err.message }))
        ]);
        
        // Generate sample returns for demonstration (in production, use historical data)
        const sampleReturns = generateSampleReturns(portfolio.assets);
        
        // Calculate risk metrics
        const riskMetrics = {};
        
        Object.keys(portfolio.assets).forEach(asset => {
            if (sampleReturns[asset]) {
                riskMetrics[asset] = {
                    var: riskCalc.calculateVaR(sampleReturns[asset]),
                    sharpe: riskCalc.calculateSharpeRatio(sampleReturns[asset]),
                    maxDrawdown: riskCalc.calculateMaxDrawdown(generateSamplePrices(sampleReturns[asset]))
                };
            }
        });
        
        // Calculate correlation matrix
        const correlationAnalysis = riskCalc.calculateCorrelationMatrix(sampleReturns);
        
        // Portfolio optimization
        const expectedReturns = {};
        const covarianceMatrix = {};
        
        Object.keys(portfolio.assets).forEach(asset => {
            expectedReturns[asset] = 0.08 + (Math.random() - 0.5) * 0.06; // Sample expected returns
        });
        
        // Generate sample covariance matrix
        Object.keys(portfolio.assets).forEach(asset1 => {
            covarianceMatrix[asset1] = {};
            Object.keys(portfolio.assets).forEach(asset2 => {
                if (asset1 === asset2) {
                    covarianceMatrix[asset1][asset2] = Math.pow(0.15 + Math.random() * 0.1, 2);
                } else {
                    const correlation = 0.3 + (Math.random() - 0.5) * 0.4;
                    const vol1 = Math.sqrt(covarianceMatrix[asset1][asset1] || 0.0225);
                    const vol2 = Math.sqrt(covarianceMatrix[asset2]?.[asset2] || 0.0225);
                    covarianceMatrix[asset1][asset2] = correlation * vol1 * vol2;
                }
            });
        });
        
        // Run optimizations
        const optimizations = {
            meanVariance: optimizer.optimizeMeanVariance(expectedReturns, covarianceMatrix),
            riskParity: optimizer.optimizeRiskParity(covarianceMatrix),
            minimumVariance: optimizer.optimizeMinimumVariance(covarianceMatrix)
        };
        
        // Regime-aware adjustment
        const regimeAdjustment = await regimeManager.adjustRiskForRegime(
            { weights: portfolio.weights || optimizations.meanVariance.weights },
            options.riskTolerance || 'MODERATE'
        );
        
        // Generate AI analysis
        const aiAnalysisPrompt = `Analyze this portfolio risk assessment:
        
Current Economic Regime: ${regimeData?.currentRegime?.name || 'Unknown'}
Portfolio Assets: ${Object.keys(portfolio.assets).join(', ')}
Average Correlation: ${correlationAnalysis.averageCorrelation?.toFixed(3) || 'N/A'}
Diversification Score: ${correlationAnalysis.diversificationScore?.toFixed(1) || 'N/A'}
Regime Confidence: ${regimeData?.confidence || 'N/A'}%

Market Context:
- VIX Level: ${marketData?.rayDalio?.regime?.signals?.market?.vix || 'N/A'}
- Yield Curve: ${yieldCurve?.shape || 'N/A'}
- Credit Conditions: ${marketData?.rayDalio?.creditSpreads?.conditions || 'N/A'}

Provide professional risk assessment with specific recommendations for optimization.`;
        
        const aiAnalysis = await getUniversalAnalysis(aiAnalysisPrompt, {
            isWealthCommand: true,
            maxTokens: 1500
        });
        
        return {
            portfolio: portfolio,
            riskMetrics: riskMetrics,
            correlationAnalysis: correlationAnalysis,
            optimizations: optimizations,
            regimeAdjustment: regimeAdjustment,
            marketContext: {
                regime: regimeData?.currentRegime?.name || 'Unknown',
                regimeConfidence: regimeData?.confidence || 0,
                yieldCurve: yieldCurve?.shape || 'Normal',
                vix: marketData?.rayDalio?.regime?.signals?.market?.vix || 18
            },
            aiAnalysis: aiAnalysis.response,
            recommendations: generateRiskRecommendations(optimizations, regimeAdjustment, correlationAnalysis),
            analysisDate: new Date().toISOString(),
            dataQuality: {
                marketData: !marketData.error,
                regimeData: !regimeData.error,
                aiAnalysis: aiAnalysis.success
            }
        };
        
    } catch (error) {
        console.error('Portfolio risk analysis error:', error.message);
        return {
            error: error.message,
            portfolio: portfolio,
            analysisDate: new Date().toISOString(),
            fallbackRecommendations: [
                'Unable to complete full risk analysis',
                'Consider diversifying across asset classes',
                'Monitor portfolio correlation regularly',
                'Adjust risk based on market regime changes'
            ]
        };
    }
}

// 🎯 HELPER: Generate sample returns (replace with real data)
function generateSampleReturns(assets, periods = 252) {
    const returns = {};
    
    Object.keys(assets).forEach(asset => {
        returns[asset] = [];
        for (let i = 0; i < periods; i++) {
            // Generate realistic return distribution
            const volatility = 0.15 + Math.random() * 0.1;
            const drift = 0.08 / 252;
            returns[asset].push(drift + volatility * (Math.random() - 0.5) / Math.sqrt(252));
        }
    });
    
    return returns;
}

// 🎯 HELPER: Generate sample prices from returns
function generateSamplePrices(returns, startPrice = 100) {
    const prices = [startPrice];
    
    for (let i = 0; i < returns.length; i++) {
        prices.push(prices[prices.length - 1] * (1 + returns[i]));
    }
    
    return prices;
}

// 💡 GENERATE RISK RECOMMENDATIONS
function generateRiskRecommendations(optimizations, regimeAdjustment, correlationAnalysis) {
    const recommendations = [];
    
    // Diversification recommendations
    if (correlationAnalysis.diversificationScore < 60) {
        recommendations.push({
            type: 'DIVERSIFICATION',
            priority: 'HIGH',
            message: 'Portfolio correlation is elevated. Consider adding alternative assets or different geographic exposure.',
            action: 'REBALANCE'
        });
    }
    
    // Regime-based recommendations
    if (regimeAdjustment.currentRegime === 'GROWTH_FALLING_INFLATION_RISING') {
        recommendations.push({
            type: 'REGIME_WARNING',
            priority: 'CRITICAL',
            message: 'Stagflation regime detected. Increase commodity allocation and reduce equity exposure.',
            action: 'DEFENSIVE_POSITIONING'
        });
    }
    
    // Optimization recommendations
    if (optimizations.riskParity.balanceScore < 70) {
        recommendations.push({
            type: 'RISK_BALANCE',
            priority: 'MODERATE',
            message: 'Risk is concentrated in few assets. Consider risk parity approach for better balance.',
            action: 'REWEIGHT_PORTFOLIO'
        });
    }
    
    // Volatility recommendations
    if (optimizations.minimumVariance.portfolioVolatility > 0.20) {
        recommendations.push({
            type: 'VOLATILITY_WARNING',
            priority: 'HIGH',
            message: 'Portfolio volatility is elevated. Consider minimum variance optimization.',
            action: 'REDUCE_RISK'
        });
    }
    
    return recommendations;
}

// 🎯 POSITION SIZING CALCULATOR
class PositionSizingCalculator {
    constructor() {
        this.methods = {
            FIXED_FRACTIONAL: 'Fixed Fractional Position Sizing',
            KELLY_CRITERION: 'Kelly Criterion Optimal Sizing',
            VOLATILITY_ADJUSTED: 'Volatility Adjusted Sizing',
            VAR_BASED: 'Value at Risk Based Sizing'
        };
    }
    
    // 🎯 KELLY CRITERION POSITION SIZING
    calculateKellyPosition(winRate, avgWin, avgLoss, portfolioValue, maxPosition = 0.25) {
        try {
            const winProbability = winRate;
            const lossProbability = 1 - winRate;
            const winLossRatio = avgWin / Math.abs(avgLoss);
            
            // Kelly Formula: f = (bp - q) / b
            // where b = odds (win/loss ratio), p = win probability, q = loss probability
            const kellyFraction = (winProbability * winLossRatio - lossProbability) / winLossRatio;
            
            // Apply safety factor and max position constraint
            const safetyFactor = 0.5; // Conservative Kelly
            const optimalFraction = Math.min(maxPosition, Math.max(0, kellyFraction * safetyFactor));
            
            return {
                kellyFraction: kellyFraction,
                optimalFraction: optimalFraction,
                positionSize: portfolioValue * optimalFraction,
                recommendation: kellyFraction > maxPosition ? 'REDUCE_SIZE' : 
                              kellyFraction < 0 ? 'AVOID_TRADE' : 'OPTIMAL_SIZE',
                riskLevel: optimalFraction > 0.15 ? 'HIGH' : optimalFraction > 0.08 ? 'MODERATE' : 'LOW'
            };
        } catch (error) {
            console.error('Kelly position calculation error:', error.message);
            return { error: error.message };
        }
    }
    
    // 📊 VOLATILITY ADJUSTED POSITION SIZING
    calculateVolatilityAdjustedPosition(targetVolatility, assetVolatility, portfolioValue, maxPosition = 0.3) {
        try {
            const volatilityScalar = targetVolatility / assetVolatility;
            const position = Math.min(maxPosition, volatilityScalar);
            
            return {
                targetVolatility: targetVolatility,
                assetVolatility: assetVolatility,
                volatilityScalar: volatilityScalar,
                positionFraction: position,
                positionSize: portfolioValue * position,
                leverageRequired: volatilityScalar > 1 ? volatilityScalar : 1,
                riskAdjustment: assetVolatility > targetVolatility ? 'REDUCE_SIZE' : 'NORMAL_SIZE'
            };
        } catch (error) {
            console.error('Volatility adjusted position calculation error:', error.message);
            return { error: error.message };
        }
    }
    
    // 📉 VAR-BASED POSITION SIZING
    calculateVaRBasedPosition(portfolioVaR, assetVaR, portfolioValue, riskBudget = 0.02) {
        try {
            const marginalVaRContribution = assetVaR - portfolioVaR;
            const maxPositionByVaR = riskBudget / marginalVaRContribution;
            const position = Math.min(0.25, Math.max(0, maxPositionByVaR));
            
            return {
                portfolioVaR: portfolioVaR,
                assetVaR: assetVaR,
                marginalVaR: marginalVaRContribution,
                riskBudget: riskBudget,
                positionFraction: position,
                positionSize: portfolioValue * position,
                riskUtilization: (position * marginalVaRContribution) / riskBudget,
                warning: position === 0 ? 'ASSET_TOO_RISKY' : position === 0.25 ? 'MAX_POSITION' : null
            };
        } catch (error) {
            console.error('VaR-based position calculation error:', error.message);
            return { error: error.message };
        }
    }
}

// 🚨 DYNAMIC STOP LOSS CALCULATOR
class DynamicStopLossCalculator {
    constructor() {
        this.stopTypes = {
            FIXED_PERCENTAGE: 'Fixed Percentage Stop',
            ATR_BASED: 'Average True Range Stop',
            VOLATILITY_BASED: 'Volatility Adjusted Stop',
            CHANDELIER_EXIT: 'Chandelier Exit Stop'
        };
    }
    
    // 📊 CALCULATE ATR-BASED STOP LOSS
    calculateATRStop(prices, atrPeriod = 14, atrMultiplier = 2.0) {
        try {
            if (prices.length < atrPeriod + 1) {
                throw new Error('Insufficient price data for ATR calculation');
            }
            
            // Calculate True Range for each period
            const trueRanges = [];
            for (let i = 1; i < prices.length; i++) {
                const high = Math.max(prices[i], prices[i-1]);
                const low = Math.min(prices[i], prices[i-1]);
                const prevClose = prices[i-1];
                
                const tr = Math.max(
                    high - low,
                    Math.abs(high - prevClose),
                    Math.abs(low - prevClose)
                );
                trueRanges.push(tr);
            }
            
            // Calculate ATR (Average True Range)
            const recentTR = trueRanges.slice(-atrPeriod);
            const atr = recentTR.reduce((sum, tr) => sum + tr, 0) / atrPeriod;
            
            const currentPrice = prices[prices.length - 1];
            const stopDistance = atr * atrMultiplier;
            
            return {
                currentPrice: currentPrice,
                atr: atr,
                atrMultiplier: atrMultiplier,
                stopDistance: stopDistance,
                longStopLoss: currentPrice - stopDistance,
                shortStopLoss: currentPrice + stopDistance,
                stopPercentage: (stopDistance / currentPrice) * 100,
                volatilityLevel: atr / currentPrice > 0.03 ? 'HIGH' : atr / currentPrice > 0.015 ? 'MODERATE' : 'LOW'
            };
        } catch (error) {
            console.error('ATR stop calculation error:', error.message);
            return { error: error.message };
        }
    }
    
    // 📈 CALCULATE VOLATILITY-BASED STOP
    calculateVolatilityStop(returns, confidenceLevel = 0.95, lookbackPeriod = 30) {
        try {
            const recentReturns = returns.slice(-lookbackPeriod);
            const volatility = Math.sqrt(
                recentReturns.reduce((sum, r) => sum + r * r, 0) / recentReturns.length
            );
            
            const zScore = confidenceLevel === 0.95 ? 1.645 : confidenceLevel === 0.99 ? 2.326 : 1.96;
            const stopDistance = volatility * zScore;
            
            return {
                volatility: volatility,
                confidenceLevel: confidenceLevel,
                stopDistance: stopDistance,
                stopPercentage: stopDistance * 100,
                riskLevel: stopDistance > 0.05 ? 'HIGH' : stopDistance > 0.025 ? 'MODERATE' : 'LOW',
                recommendation: stopDistance > 0.1 ? 'CONSIDER_SMALLER_POSITION' : 'NORMAL_POSITION'
            };
        } catch (error) {
            console.error('Volatility stop calculation error:', error.message);
            return { error: error.message };
        }
    }
}

// 🎯 RISK MONITORING SYSTEM
class RiskMonitoringSystem {
    constructor() {
        this.alertThresholds = {
            portfolioVaR: 0.05,
            correlationIncrease: 0.2,
            volatilitySpike: 0.3,
            drawdownLimit: 0.15,
            concentrationRisk: 0.4
        };
        
        this.monitoringFrequency = {
            realTime: ['VaR', 'drawdown'],
            daily: ['correlation', 'volatility'],
            weekly: ['concentration', 'regime']
        };
    }
    
    // 🚨 GENERATE RISK ALERTS
    generateRiskAlerts(portfolioMetrics, marketData) {
        const alerts = [];
        
        try {
            // VaR Alert
            if (portfolioMetrics.var95 > this.alertThresholds.portfolioVaR) {
                alerts.push({
                    type: 'VAR_BREACH',
                    severity: 'HIGH',
                    message: `Portfolio VaR (${(portfolioMetrics.var95 * 100).toFixed(2)}%) exceeds threshold`,
                    action: 'REDUCE_RISK',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Correlation Alert
            if (portfolioMetrics.averageCorrelation > 0.7) {
                alerts.push({
                    type: 'HIGH_CORRELATION',
                    severity: 'MODERATE',
                    message: `Asset correlations elevated (${(portfolioMetrics.averageCorrelation * 100).toFixed(1)}%)`,
                    action: 'DIVERSIFY',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Market Stress Alert
            if (marketData?.vix > 35) {
                alerts.push({
                    type: 'MARKET_STRESS',
                    severity: 'CRITICAL',
                    message: `Market stress indicator elevated (VIX: ${marketData.vix})`,
                    action: 'DEFENSIVE_POSITIONING',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Regime Change Alert
            if (marketData?.regimeConfidence < 60) {
                alerts.push({
                    type: 'REGIME_UNCERTAINTY',
                    severity: 'MODERATE',
                    message: `Economic regime uncertainty detected (${marketData.regimeConfidence}% confidence)`,
                    action: 'MONITOR_CLOSELY',
                    timestamp: new Date().toISOString()
                });
            }
            
            return {
                alerts: alerts,
                alertCount: alerts.length,
                highSeverityCount: alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL').length,
                recommendations: this.generateAlertRecommendations(alerts),
                nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            
        } catch (error) {
            console.error('Risk alert generation error:', error.message);
            return {
                alerts: [],
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    // 💡 GENERATE ALERT RECOMMENDATIONS
    generateAlertRecommendations(alerts) {
        const recommendations = [];
        
        const hasHighRisk = alerts.some(a => a.severity === 'HIGH' || a.severity === 'CRITICAL');
        const hasCorrelationRisk = alerts.some(a => a.type === 'HIGH_CORRELATION');
        const hasMarketStress = alerts.some(a => a.type === 'MARKET_STRESS');
        
        if (hasHighRisk) {
            recommendations.push('Consider immediate risk reduction measures');
        }
        
        if (hasCorrelationRisk) {
            recommendations.push('Diversify into uncorrelated assets or alternative investments');
        }
        
        if (hasMarketStress) {
            recommendations.push('Implement defensive positioning and hedge strategies');
        }
        
        if (alerts.length === 0) {
            recommendations.push('Risk levels are within acceptable ranges - maintain current allocation');
        }
        
        return recommendations;
    }
}

// 🎯 MAIN RISK MANAGEMENT INTERFACE
async function getRiskManagementDashboard(portfolioData, options = {}) {
    try {
        console.log('🏆 Generating comprehensive risk management dashboard...');
        
        // Initialize components
        const positionSizer = new PositionSizingCalculator();
        const stopCalculator = new DynamicStopLossCalculator();
        const riskMonitor = new RiskMonitoringSystem();
        
        // Run comprehensive risk analysis
        const riskAnalysis = await analyzePortfolioRisk(portfolioData, options);
        
        // Calculate position sizing for new positions
        const samplePositionSizing = positionSizer.calculateKellyPosition(
            0.55, // 55% win rate
            0.08, // 8% average win
            -0.04, // 4% average loss
            portfolioData.totalValue || 1000000
        );
        
        // Calculate dynamic stops for sample position
        const samplePrices = Array.from({length: 50}, (_, i) => 100 + Math.random() * 20 - 10);
        const stopLossAnalysis = stopCalculator.calculateATRStop(samplePrices);
        
        // Generate risk alerts
        const riskAlerts = riskMonitor.generateRiskAlerts(
            riskAnalysis.correlationAnalysis || {},
            riskAnalysis.marketContext || {}
        );
        
        // Get AI-powered risk insights
        const aiRiskPrompt = `Provide executive risk management summary based on:
        
Portfolio Status:
- Economic Regime: ${riskAnalysis.marketContext?.regime || 'Unknown'}
- Regime Confidence: ${riskAnalysis.marketContext?.regimeConfidence || 0}%
- Diversification Score: ${riskAnalysis.correlationAnalysis?.diversificationScore || 'N/A'}
- Risk Alerts: ${riskAlerts.alertCount} active
- VIX Level: ${riskAnalysis.marketContext?.vix || 'N/A'}

Key Risk Metrics:
- Average Correlation: ${riskAnalysis.correlationAnalysis?.averageCorrelation?.toFixed(3) || 'N/A'}
- Yield Curve: ${riskAnalysis.marketContext?.yieldCurve || 'N/A'}

Provide concise executive summary with top 3 risk priorities and specific actions.`;
        
        const aiRiskInsights = await getUniversalAnalysis(aiRiskPrompt, {
            isWealthCommand: true,
            maxTokens: 1200
        });
        
        return {
            overview: {
                portfolioValue: portfolioData.totalValue || 0,
                riskLevel: riskAlerts.highSeverityCount > 0 ? 'HIGH' : riskAlerts.alertCount > 0 ? 'MODERATE' : 'LOW',
                diversificationScore: riskAnalysis.correlationAnalysis?.diversificationScore || 0,
                currentRegime: riskAnalysis.marketContext?.regime || 'Unknown',
                regimeConfidence: riskAnalysis.marketContext?.regimeConfidence || 0
            },
            riskAnalysis: riskAnalysis,
            positionSizing: {
                kelly: samplePositionSizing,
                recommendations: [
                    'Use Kelly Criterion for optimal position sizing',
                    'Apply 50% safety factor to Kelly recommendations',
                    'Maximum single position: 25% of portfolio'
                ]
            },
            stopLossManagement: {
                atrStop: stopLossAnalysis,
                recommendations: [
                    'Use ATR-based stops for volatility adjustment',
                    'Review stops daily during high volatility periods',
                    'Consider trailing stops in trending markets'
                ]
            },
            riskAlerts: riskAlerts,
            aiInsights: aiRiskInsights.response,
            dashboardActions: [
                'Monitor regime changes for allocation adjustments',
                'Review correlation matrix weekly',
                'Update stop losses based on volatility changes',
                'Rebalance if any position exceeds 30% allocation'
            ],
            lastUpdate: new Date().toISOString(),
            nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
    } catch (error) {
        console.error('Risk management dashboard error:', error.message);
        return {
            error: error.message,
            overview: {
                riskLevel: 'UNKNOWN',
                portfolioValue: portfolioData.totalValue || 0
            },
            recommendations: [
                'Unable to complete risk analysis',
                'Manually review portfolio allocations',
                'Monitor market conditions closely'
            ],
            lastUpdate: new Date().toISOString()
        };
    }
}

// 🎯 EXPORT ALL RISK MANAGEMENT FUNCTIONS
module.exports = {
    // Main Functions
    analyzePortfolioRisk,
    getRiskManagementDashboard,
    
    // Classes
    AdvancedRiskCalculator,
    PortfolioOptimizer,
    RegimeAwareRiskManager,
    PositionSizingCalculator,
    DynamicStopLossCalculator,
    RiskMonitoringSystem,
    
    // Utility Functions
    generateSampleReturns,
    generateSamplePrices,
    generateRiskRecommendations
};

// 🏆 WEALTH MODULE 2: MARKET OPPORTUNITY SCANNER & SIGNAL DETECTION
// Advanced technical analysis and market scanning system

// 🎯 TECHNICAL INDICATOR CALCULATOR
class TechnicalIndicatorCalculator {
    constructor() {
        this.indicators = {
            SMA: 'Simple Moving Average',
            EMA: 'Exponential Moving Average',
            RSI: 'Relative Strength Index',
            MACD: 'Moving Average Convergence Divergence',
            BOLLINGER: 'Bollinger Bands',
            STOCHASTIC: 'Stochastic Oscillator',
            WILLIAMS_R: 'Williams %R',
            CCI: 'Commodity Channel Index',
            ADX: 'Average Directional Index'
        };
    }
    
    // 📈 SIMPLE MOVING AVERAGE
    calculateSMA(prices, period) {
        try {
            if (prices.length < period) {
                throw new Error(`Insufficient data points. Need ${period}, got ${prices.length}`);
            }
            
            const smaValues = [];
            for (let i = period - 1; i < prices.length; i++) {
                const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                smaValues.push(sum / period);
            }
            
            const currentSMA = smaValues[smaValues.length - 1];
            const currentPrice = prices[prices.length - 1];
            const trend = currentPrice > currentSMA ? 'BULLISH' : 'BEARISH';
            const strength = Math.abs(currentPrice - currentSMA) / currentSMA;
            
            return {
                values: smaValues,
                current: currentSMA,
                currentPrice: currentPrice,
                trend: trend,
                strength: strength,
                signal: strength > 0.05 ? (trend === 'BULLISH' ? 'STRONG_BUY' : 'STRONG_SELL') : 'NEUTRAL',
                period: period
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    // 📊 EXPONENTIAL MOVING AVERAGE
    calculateEMA(prices, period, smoothing = 2) {
        try {
            if (prices.length < period) {
                throw new Error(`Insufficient data points. Need ${period}, got ${prices.length}`);
            }
            
            const multiplier = smoothing / (period + 1);
            const emaValues = [];
            
            // Start with SMA for first value
            const initialSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
            emaValues.push(initialSMA);
            
            // Calculate EMA for remaining values
            for (let i = period; i < prices.length; i++) {
                const ema = (prices[i] * multiplier) + (emaValues[emaValues.length - 1] * (1 - multiplier));
                emaValues.push(ema);
            }
            
            const currentEMA = emaValues[emaValues.length - 1];
            const currentPrice = prices[prices.length - 1];
            const trend = currentPrice > currentEMA ? 'BULLISH' : 'BEARISH';
            
            return {
                values: emaValues,
                current: currentEMA,
                currentPrice: currentPrice,
                trend: trend,
                divergence: (currentPrice - currentEMA) / currentEMA,
                signal: this.getEMASignal(currentPrice, currentEMA),
                period: period
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    // 🔥 RELATIVE STRENGTH INDEX
    calculateRSI(prices, period = 14) {
        try {
            if (prices.length < period + 1) {
                throw new Error(`Insufficient data points for RSI. Need ${period + 1}, got ${prices.length}`);
            }
            
            const changes = [];
            for (let i = 1; i < prices.length; i++) {
                changes.push(prices[i] - prices[i - 1]);
            }
            
            const gains = changes.map(change => change > 0 ? change : 0);
            const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
            
            // Calculate initial average gain and loss
            let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
            let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
            
            const rsiValues = [];
            
            // Calculate RSI for each subsequent period
            for (let i = period; i < changes.length; i++) {
                avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
                avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
                
                const rs = avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                rsiValues.push(rsi);
            }
            
            const currentRSI = rsiValues[rsiValues.length - 1];
            
            return {
                values: rsiValues,
                current: currentRSI,
                signal: this.getRSISignal(currentRSI),
                overbought: currentRSI > 70,
                oversold: currentRSI < 30,
                period: period
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    // ⚡ MACD
    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        try {
            const fastEMA = this.calculateEMA(prices, fastPeriod);
            const slowEMA = this.calculateEMA(prices, slowPeriod);
            
            if (fastEMA.error || slowEMA.error) {
                throw new Error('Error calculating EMAs for MACD');
            }
            
            // Calculate MACD line
            const macdLine = [];
            const minLength = Math.min(fastEMA.values.length, slowEMA.values.length);
            
            for (let i = 0; i < minLength; i++) {
                macdLine.push(fastEMA.values[i] - slowEMA.values[slowEMA.values.length - minLength + i]);
            }
            
            // Calculate signal line (EMA of MACD)
            const signalLine = this.calculateEMA(macdLine, signalPeriod);
            
            // Calculate histogram
            const histogram = [];
            for (let i = 0; i < signalLine.values.length; i++) {
                histogram.push(macdLine[macdLine.length - signalLine.values.length + i] - signalLine.values[i]);
            }
            
            const currentMACD = macdLine[macdLine.length - 1];
            const currentSignal = signalLine.current;
            const currentHistogram = histogram[histogram.length - 1];
            
            return {
                macdLine: macdLine,
                signalLine: signalLine.values,
                histogram: histogram,
                current: {
                    macd: currentMACD,
                    signal: currentSignal,
                    histogram: currentHistogram
                },
                signal: this.getMACDSignal(currentMACD, currentSignal, currentHistogram),
                periods: { fast: fastPeriod, slow: slowPeriod, signal: signalPeriod }
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    // 📏 BOLLINGER BANDS
    calculateBollingerBands(prices, period = 20, standardDeviations = 2) {
        try {
            const sma = this.calculateSMA(prices, period);
            if (sma.error) {
                throw new Error('Error calculating SMA for Bollinger Bands');
            }
            
            const upperBand = [];
            const lowerBand = [];
            
            for (let i = period - 1; i < prices.length; i++) {
                const priceWindow = prices.slice(i - period + 1, i + 1);
                const mean = priceWindow.reduce((a, b) => a + b, 0) / period;
                const variance = priceWindow.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
                const stdDev = Math.sqrt(variance);
                
                upperBand.push(mean + (standardDeviations * stdDev));
                lowerBand.push(mean - (standardDeviations * stdDev));
            }
            
            const currentPrice = prices[prices.length - 1];
            const currentUpper = upperBand[upperBand.length - 1];
            const currentLower = lowerBand[lowerBand.length - 1];
            const currentMiddle = sma.current;
            
            // Calculate Bollinger Band Width and %B
            const bandWidth = (currentUpper - currentLower) / currentMiddle;
            const percentB = (currentPrice - currentLower) / (currentUpper - currentLower);
            
            return {
                upperBand: upperBand,
                middleBand: sma.values,
                lowerBand: lowerBand,
                current: {
                    upper: currentUpper,
                    middle: currentMiddle,
                    lower: currentLower,
                    price: currentPrice
                },
                bandWidth: bandWidth,
                percentB: percentB,
                squeeze: bandWidth < 0.1,
                signal: this.getBollingerSignal(percentB, bandWidth),
                position: percentB > 0.8 ? 'OVERBOUGHT' : percentB < 0.2 ? 'OVERSOLD' : 'NEUTRAL',
                period: period
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    // 🎯 SIGNAL HELPER FUNCTIONS
    getEMASignal(price, ema) {
        const deviation = (price - ema) / ema;
        if (deviation > 0.05) return 'STRONG_BUY';
        if (deviation > 0.02) return 'BUY';
        if (deviation < -0.05) return 'STRONG_SELL';
        if (deviation < -0.02) return 'SELL';
        return 'NEUTRAL';
    }
    
    getRSISignal(rsi) {
        if (rsi > 80) return 'STRONG_SELL';
        if (rsi > 70) return 'SELL';
        if (rsi < 20) return 'STRONG_BUY';
        if (rsi < 30) return 'BUY';
        return 'NEUTRAL';
    }
    
    getMACDSignal(macd, signal, histogram) {
        if (macd > signal && histogram > 0) return 'STRONG_BUY';
        if (macd > signal && histogram <= 0) return 'BUY';
        if (macd < signal && histogram < 0) return 'STRONG_SELL';
        if (macd < signal && histogram >= 0) return 'SELL';
        return 'NEUTRAL';
    }
    
    getBollingerSignal(percentB, bandWidth) {
        if (percentB > 1) return 'STRONG_SELL';
        if (percentB > 0.8) return 'SELL';
        if (percentB < 0) return 'STRONG_BUY';
        if (percentB < 0.2) return 'BUY';
        return 'NEUTRAL';
    }
}

// 🎯 MARKET SCANNER ENGINE
class MarketScannerEngine {
    constructor() {
        this.scanTypes = {
            BREAKOUT: 'Breakout Scanner',
            MOMENTUM: 'Momentum Scanner',
            REVERSAL: 'Reversal Scanner',
            VOLUME_SURGE: 'Volume Surge Scanner'
        };
    }
    
    // 🔥 MOMENTUM SCANNER
    async scanMomentumOpportunities(assetData, options = {}) {
        try {
            const calculator = new TechnicalIndicatorCalculator();
            const opportunities = [];
            const minRSI = options.minRSI || 60;
            const minVolume = options.minVolume || 1.5;
            
            for (const [asset, data] of Object.entries(assetData)) {
                if (!data.prices || data.prices.length < 50) continue;
                
                // Calculate momentum indicators
                const rsi = calculator.calculateRSI(data.prices);
                const macd = calculator.calculateMACD(data.prices);
                const ema20 = calculator.calculateEMA(data.prices, 20);
                const ema50 = calculator.calculateEMA(data.prices, 50);
                
                if (rsi.error || macd.error || ema20.error || ema50.error) continue;
                
                // Check momentum criteria
                const rsiMomentum = rsi.current > minRSI && rsi.current < 80;
                const macdBullish = macd.current.macd > macd.current.signal;
                const emaTrend = ema20.current > ema50.current;
                const volumeSpike = data.volume > (data.avgVolume * minVolume);
                
                const score = [rsiMomentum, macdBullish, emaTrend, volumeSpike]
                    .reduce((sum, condition) => sum + (condition ? 25 : 0), 0);
                
                if (score >= 75) {
                    opportunities.push({
                        asset: asset,
                        type: 'MOMENTUM',
                        score: score,
                        signals: {
                            rsi: rsi.current.toFixed(2),
                            macdSignal: macd.signal,
                            emaTrend: emaTrend ? 'BULLISH' : 'BEARISH',
                            volumeRatio: (data.volume / data.avgVolume).toFixed(2)
                        },
                        price: data.prices[data.prices.length - 1],
                        recommendation: score >= 90 ? 'STRONG_BUY' : 'BUY',
                        confidence: score
                    });
                }
            }
            
            return {
                opportunities: opportunities.sort((a, b) => b.score - a.score),
                scanType: 'MOMENTUM',
                totalScanned: Object.keys(assetData).length,
                foundOpportunities: opportunities.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { error: error.message, opportunities: [] };
        }
    }
    
    // 📈 BREAKOUT SCANNER
    async scanBreakoutOpportunities(assetData, options = {}) {
        try {
            const calculator = new TechnicalIndicatorCalculator();
            const opportunities = [];
            const lookbackPeriod = options.lookbackPeriod || 20;
            const minVolume = options.minVolume || 2.0;
            
            for (const [asset, data] of Object.entries(assetData)) {
                if (!data.prices || data.prices.length < lookbackPeriod + 10) continue;
                
                const currentPrice = data.prices[data.prices.length - 1];
                const lookbackPrices = data.prices.slice(-lookbackPeriod - 1, -1);
                const resistance = Math.max(...lookbackPrices);
                const support = Math.min(...lookbackPrices);
                
                const bollinger = calculator.calculateBollingerBands(data.prices);
                if (bollinger.error) continue;
                
                // Breakout conditions
                const resistanceBreakout = currentPrice > resistance * 1.02;
                const supportBreakdown = currentPrice < support * 0.98;
                const volumeConfirmation = data.volume > (data.avgVolume * minVolume);
                const volatilityExpansion = bollinger.bandWidth > 0.15;
                
                let breakoutType = null;
                let score = 0;
                
                if (resistanceBreakout) {
                    breakoutType = 'BULLISH_BREAKOUT';
                    score = 50 + (volumeConfirmation ? 30 : 0) + (volatilityExpansion ? 20 : 0);
                } else if (supportBreakdown) {
                    breakoutType = 'BEARISH_BREAKDOWN';
                    score = 50 + (volumeConfirmation ? 30 : 0) + (volatilityExpansion ? 20 : 0);
                }
                
                if (breakoutType && score >= 70) {
                    opportunities.push({
                        asset: asset,
                        type: 'BREAKOUT',
                        breakoutType: breakoutType,
                        score: score,
                        levels: {
                            current: currentPrice,
                            resistance: resistance,
                            support: support,
                            breakoutLevel: breakoutType === 'BULLISH_BREAKOUT' ? resistance : support
                        },
                        volumeRatio: (data.volume / data.avgVolume).toFixed(2),
                        recommendation: breakoutType === 'BULLISH_BREAKOUT' ? 'BUY' : 'SELL',
                        confidence: score
                    });
                }
            }
            
            return {
                opportunities: opportunities.sort((a, b) => b.score - a.score),
                scanType: 'BREAKOUT',
                totalScanned: Object.keys(assetData).length,
                foundOpportunities: opportunities.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { error: error.message, opportunities: [] };
        }
    }
    
    // 🔄 REVERSAL SCANNER
    async scanReversalOpportunities(assetData) {
        try {
            const calculator = new TechnicalIndicatorCalculator();
            const opportunities = [];
            
            for (const [asset, data] of Object.entries(assetData)) {
                if (!data.prices || data.prices.length < 50) continue;
                
                const rsi = calculator.calculateRSI(data.prices);
                const bollinger = calculator.calculateBollingerBands(data.prices);
                
                if (rsi.error || bollinger.error) continue;
                
                // Reversal conditions
                const oversoldRSI = rsi.current < 30;
                const bollingerOversold = bollinger.percentB < 0.1;
                const overboughtRSI = rsi.current > 70;
                const bollingerOverbought = bollinger.percentB > 0.9;
                
                let reversalType = null;
                let score = 0;
                
                if (oversoldRSI || bollingerOversold) {
                    reversalType = 'BULLISH_REVERSAL';
                    score = (oversoldRSI ? 50 : 0) + (bollingerOversold ? 40 : 0);
                }
                
                if (overboughtRSI || bollingerOverbought) {
                    reversalType = 'BEARISH_REVERSAL';
                    score = (overboughtRSI ? 50 : 0) + (bollingerOverbought ? 40 : 0);
                }
                
                if (reversalType && score >= 50) {
                    opportunities.push({
                        asset: asset,
                        type: 'REVERSAL',
                        reversalType: reversalType,
                        score: score,
                        indicators: {
                            rsi: rsi.current.toFixed(2),
                            percentB: bollinger.percentB.toFixed(3)
                        },
                        price: data.prices[data.prices.length - 1],
                        recommendation: reversalType === 'BULLISH_REVERSAL' ? 'BUY' : 'SELL',
                        confidence: score
                    });
                }
            }
            
            return {
                opportunities: opportunities.sort((a, b) => b.score - a.score),
                scanType: 'REVERSAL',
                totalScanned: Object.keys(assetData).length,
                foundOpportunities: opportunities.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { error: error.message, opportunities: [] };
        }
    }
}

// 🎯 SIGNAL AGGREGATOR
class SignalAggregator {
    constructor() {
        this.signalWeights = {
            RSI: 0.20,
            MACD: 0.25,
            BOLLINGER: 0.20,
            VOLUME: 0.15,
            TREND: 0.20
        };
        
        this.signalStrengths = {
            'STRONG_BUY': 1.0,
            'BUY': 0.6,
            'NEUTRAL': 0.0,
            'SELL': -0.6,
            'STRONG_SELL': -1.0
        };
    }
    
    // 🎯 AGGREGATE MULTIPLE SIGNALS
    aggregateSignals(indicators) {
        try {
            let weightedSum = 0;
            let totalWeight = 0;
            const signalBreakdown = {};
            
            Object.entries(indicators).forEach(([indicator, data]) => {
                if (this.signalWeights[indicator.toUpperCase()]) {
                    const weight = this.signalWeights[indicator.toUpperCase()];
                    const strength = this.signalStrengths[data.signal] || 0;
                    
                    weightedSum += strength * weight;
                    totalWeight += weight;
                    
                    signalBreakdown[indicator] = {
                        signal: data.signal,
                        strength: strength,
                        weight: weight,
                        contribution: strength * weight
                    };
                }
            });
            
            const aggregateScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
            
            let overallSignal = 'NEUTRAL';
            if (aggregateScore > 0.6) overallSignal = 'STRONG_BUY';
            else if (aggregateScore > 0.3) overallSignal = 'BUY';
            else if (aggregateScore < -0.6) overallSignal = 'STRONG_SELL';
            else if (aggregateScore < -0.3) overallSignal = 'SELL';
            
            const signals = Object.values(signalBreakdown).map(s => s.strength);
            const avgSignal = signals.reduce((a, b) => a + b, 0) / signals.length;
            const variance = signals.reduce((sum, signal) => sum + Math.pow(signal - avgSignal, 2), 0) / signals.length;
            const confidence = Math.max(50, 100 - (variance * 100));
            
            return {
                overallSignal: overallSignal,
                aggregateScore: aggregateScore,
                confidence: Math.round(confidence),
                signalBreakdown: signalBreakdown,
                signalCount: Object.keys(signalBreakdown).length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { 
                error: error.message,
                overallSignal: 'NEUTRAL',
                confidence: 0
            };
        }
    }
    
    // 📊 SECTOR ROTATION SIGNALS
    async analyzeSectorRotation() {
        try {
            const sectorRotation = await getSectorRotationSignals();
            
            if (sectorRotation.error) {
                return { error: sectorRotation.error };
            }
            
            const rotationSignals = [];
            
            Object.entries(sectorRotation.sectorPerformance || {}).forEach(([sector, performance]) => {
                const signal = performance.changePercent > 2 ? 'STRONG_BUY' :
                              performance.changePercent > 0.5 ? 'BUY' :
                              performance.changePercent < -2 ? 'STRONG_SELL' :
                              performance.changePercent < -0.5 ? 'SELL' : 'NEUTRAL';
                
                rotationSignals.push({
                    sector: sector,
                    performance: performance.changePercent,
                    signal: signal,
                    price: performance.price
                });
            });
            
            return {
                rotationTheme: sectorRotation.rotationTheme,
                signals: rotationSignals.sort((a, b) => b.performance - a.performance),
                marketRisk: sectorRotation.signals?.riskOn ? 'RISK_ON' : 'RISK_OFF',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// 🎯 GENERATE SAMPLE MARKET DATA
function generateSampleMarketData() {
    const assets = ['SPY', 'QQQ', 'IWM', 'GLD', 'TLT', 'BTC', 'ETH'];
    const sampleData = {};
    
    assets.forEach(asset => {
        const prices = [];
        let basePrice = 100 + Math.random() * 200;
        
        for (let i = 0; i < 100; i++) {
            const volatility = 0.02 + Math.random() * 0.02;
            const trend = (Math.random() - 0.5) * 0.01;
            const change = (Math.random() - 0.5) * volatility + trend;
            basePrice = Math.max(1, basePrice * (1 + change));
            prices.push(basePrice);
        }
        
        sampleData[asset] = {
            prices: prices,
            volume: 1000000 + Math.random() * 5000000,
            avgVolume: 1500000,
            sector: getSectorForAsset(asset)
        };
    });
    
    return sampleData;
}

function getSectorForAsset(asset) {
    const sectorMap = {
        'SPY': 'Broad Market',
        'QQQ': 'Technology',
        'IWM': 'Small Cap',
        'GLD': 'Commodities',
        'TLT': 'Bonds',
        'BTC': 'Cryptocurrency',
        'ETH': 'Cryptocurrency'
    };
    return sectorMap[asset] || 'Unknown';
}

// 🎯 MASTER SCANNER FUNCTION
async function runComprehensiveMarketScan(options = {}) {
    try {
        console.log('🔍 Running comprehensive market opportunity scan...');
        
        const scanner = new MarketScannerEngine();
        const aggregator = new SignalAggregator();
        
        const sampleAssetData = generateSampleMarketData();
        
        const [
            momentumScan,
            breakoutScan,
            reversalScan,
            sectorAnalysis,
            marketData,
            anomalies
        ] = await Promise.allSettled([
            scanner.scanMomentumOpportunities(sampleAssetData, options),
            scanner.scanBreakoutOpportunities(sampleAssetData, options),
            scanner.scanReversalOpportunities(sampleAssetData),
            aggregator.analyzeSectorRotation(),
            getRayDalioMarketData(),
            detectMarketAnomalies()
        ]);
        
        const allOpportunities = [];
        
        if (momentumScan.status === 'fulfilled') {
            allOpportunities.push(...momentumScan.value.opportunities);
        }
        if (breakoutScan.status === 'fulfilled') {
            allOpportunities.push(...breakoutScan.value.opportunities);
        }
        if (reversalScan.status === 'fulfilled') {
            allOpportunities.push(...reversalScan.value.opportunities);
        }
        
        allOpportunities.sort((a, b) => b.confidence - a.confidence);
        const topOpportunities = allOpportunities.slice(0, 5);
        
        const aiAnalysisPrompt = `Analyze these market opportunities:

Top Opportunities:
${topOpportunities.map(opp => 
    `${opp.asset}: ${opp.type} (${opp.confidence}% confidence) - ${opp.recommendation}`
).join('\n')}

Market Context:
- Economic Regime: ${marketData.value?.rayDalio?.regime?.currentRegime?.name || 'Unknown'}
- Sector Rotation: ${sectorAnalysis.value?.rotationTheme || 'Balanced'}
- Anomalies: ${anomalies.value?.anomalies?.length || 0}

Provide top 3 actionable trading recommendations.`;
        
        const aiInsights = await getUniversalAnalysis(aiAnalysisPrompt, {
            isWealthCommand: true,
            maxTokens: 1200
        });
        
        return {
            summary: {
                totalOpportunities: allOpportunities.length,
                highConfidence: allOpportunities.filter(o => o.confidence >= 80).length,
                momentumPlays: allOpportunities.filter(o => o.type === 'MOMENTUM').length,
                breakoutPlays: allOpportunities.filter(o => o.type === 'BREAKOUT').length,
                reversalPlays: allOpportunities.filter(o => o.type === 'REVERSAL').length
            },
            topOpportunities: topOpportunities,
            scanResults: {
                momentum: momentumScan.status === 'fulfilled' ? momentumScan.value : { error: 'Failed' },
                breakout: breakoutScan.status === 'fulfilled' ? breakoutScan.value : { error: 'Failed' },
                reversal: reversalScan.status === 'fulfilled' ? reversalScan.value : { error: 'Failed' }
            },
            sectorAnalysis: sectorAnalysis.status === 'fulfilled' ? sectorAnalysis.value : { error: 'Failed' },
            marketContext: {
                regime: marketData.value?.rayDalio?.regime?.currentRegime?.name || 'Unknown',
                regimeConfidence: marketData.value?.rayDalio?.regime?.confidence || 0,
                anomalies: anomalies.value?.anomalies || []
            },
            aiInsights: aiInsights.response,
            recommendations: generateScannerRecommendations(allOpportunities, sectorAnalysis.value),
            scanDate: new Date().toISOString(),
            dataQuality: {
                momentum: momentumScan.status === 'fulfilled',
                breakout: breakoutScan.status === 'fulfilled',
                reversal: reversalScan.status === 'fulfilled',
                sector: sectorAnalysis.status === 'fulfilled',
                market: marketData.status === 'fulfilled'
            }
        };
        
    } catch (error) {
        console.error('Comprehensive market scan error:', error.message);
        return {
            error: error.message,
            summary: {
                totalOpportunities: 0,
                highConfidence: 0,
                momentumPlays: 0,
                breakoutPlays: 0,
                reversalPlays: 0
            },
            topOpportunities: [],
            recommendations: [
                'Market scan failed - check data connections',
                'Manually review key market indicators',
                'Monitor for system recovery'
            ],
            scanDate: new Date().toISOString()
        };
    }
}

// 💡 GENERATE SCANNER RECOMMENDATIONS
function generateScannerRecommendations(opportunities, sectorAnalysis) {
    const recommendations = [];
    
    const highConfOps = opportunities.filter(o => o.confidence >= 80);
    if (highConfOps.length > 0) {
        recommendations.push({
            type: 'HIGH_CONFIDENCE_PLAYS',
            priority: 'HIGH',
            message: `${highConfOps.length} high-confidence opportunities identified`,
            assets: highConfOps.slice(0, 3).map(o => `${o.asset} (${o.type})`),
            action: 'CONSIDER_POSITION'
        });
    }
    
    const momentumOps = opportunities.filter(o => o.type === 'MOMENTUM');
    if (momentumOps.length > 3) {
        recommendations.push({
            type: 'MOMENTUM_CONCENTRATION',
            priority: 'MODERATE',
            message: 'Multiple momentum opportunities suggest strong directional move',
            action: 'TREND_FOLLOWING_STRATEGY'
        });
    }
    
    const reversalOps = opportunities.filter(o => o.type === 'REVERSAL');
    if (reversalOps.length > 2) {
        recommendations.push({
            type: 'REVERSAL_CLUSTERING',
            priority: 'MODERATE',
            message: 'Multiple reversal signals may indicate market turning point',
            action: 'CONTRARIAN_POSITIONING'
        });
    }
    
    if (sectorAnalysis?.rotationTheme) {
        recommendations.push({
            type: 'SECTOR_ROTATION',
            priority: 'MODERATE',
            message: `${sectorAnalysis.rotationTheme} theme detected`,
            action: 'SECTOR_ALLOCATION_ADJUSTMENT'
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'NORMAL_CONDITIONS',
            priority: 'LOW',
            message: 'Market conditions appear normal with limited clear opportunities',
            action: 'MAINTAIN_CURRENT_ALLOCATION'
        });
    }
    
    return recommendations;
}

// 🎯 REAL-TIME SIGNAL MONITOR
class RealTimeSignalMonitor {
    constructor() {
        this.activeSignals = new Map();
        this.alertThresholds = {
            confidenceThreshold: 75,
            volumeMultiple: 2.0,
            priceChangeThreshold: 0.03
        };
        this.monitoringInterval = null;
    }
    
    // 🚨 START REAL-TIME MONITORING
    startMonitoring(assets, intervalMs = 60000) {
        try {
            console.log('🔄 Starting real-time signal monitoring...');
            
            this.monitoringInterval = setInterval(async () => {
                await this.checkSignalUpdates(assets);
            }, intervalMs);
            
            return {
                status: 'MONITORING_STARTED',
                assets: assets,
                interval: intervalMs,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Signal monitoring start error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🔍 CHECK SIGNAL UPDATES
    async checkSignalUpdates(assets) {
        try {
            const calculator = new TechnicalIndicatorCalculator();
            const newSignals = [];
            const currentData = generateSampleMarketData();
            
            for (const asset of assets) {
                if (!currentData[asset]) continue;
                
                const data = currentData[asset];
                const rsi = calculator.calculateRSI(data.prices);
                const macd = calculator.calculateMACD(data.prices);
                
                if (rsi.error || macd.error) continue;
                
                const currentSignal = {
                    asset: asset,
                    rsi: rsi.current,
                    rsiSignal: rsi.signal,
                    macdSignal: macd.signal,
                    price: data.prices[data.prices.length - 1],
                    timestamp: new Date().toISOString()
                };
                
                const previousSignal = this.activeSignals.get(asset);
                if (this.hasSignalChanged(currentSignal, previousSignal)) {
                    newSignals.push(currentSignal);
                }
                
                this.activeSignals.set(asset, currentSignal);
            }
            
            if (newSignals.length > 0) {
                await this.processNewSignals(newSignals);
            }
            
            return {
                newSignals: newSignals.length,
                totalTracked: this.activeSignals.size,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Signal update check error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🔄 CHECK IF SIGNAL CHANGED
    hasSignalChanged(current, previous) {
        if (!previous) return true;
        
        return (
            current.rsiSignal !== previous.rsiSignal ||
            current.macdSignal !== previous.macdSignal ||
            Math.abs(current.price - previous.price) / previous.price > this.alertThresholds.priceChangeThreshold
        );
    }
    
    // 📢 PROCESS NEW SIGNALS
    async processNewSignals(newSignals) {
        try {
            for (const signal of newSignals) {
                console.log(`🔔 New signal for ${signal.asset}: RSI=${signal.rsiSignal}, MACD=${signal.macdSignal}`);
            }
        } catch (error) {
            console.error('New signal processing error:', error.message);
        }
    }
    
    // ⏹️ STOP MONITORING
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            
            return {
                status: 'MONITORING_STOPPED',
                finalSignalCount: this.activeSignals.size,
                timestamp: new Date().toISOString()
            };
        }
        
        return {
            status: 'NOT_MONITORING',
            timestamp: new Date().toISOString()
        };
    }
    
    // 📊 GET CURRENT SIGNALS
    getCurrentSignals() {
        return {
            signals: Array.from(this.activeSignals.values()),
            count: this.activeSignals.size,
            lastUpdate: new Date().toISOString()
        };
    }
}

// 🎯 ADVANCED PATTERN RECOGNITION
class PatternRecognitionEngine {
    constructor() {
        this.patterns = {
            DOJI: 'Doji Reversal Pattern',
            HAMMER: 'Hammer Reversal',
            SHOOTING_STAR: 'Shooting Star',
            ENGULFING: 'Engulfing Pattern',
            TRIANGLE: 'Triangle Consolidation',
            DOUBLE_TOP: 'Double Top',
            DOUBLE_BOTTOM: 'Double Bottom',
            HEAD_SHOULDERS: 'Head and Shoulders'
        };
    }
    
    // 🕯️ DETECT CANDLESTICK PATTERNS
    detectCandlestickPatterns(ohlcData) {
        try {
            const patterns = [];
            
            if (ohlcData.length < 3) {
                return { patterns: [], error: 'Insufficient data for pattern detection' };
            }
            
            const latest = ohlcData[ohlcData.length - 1];
            const previous = ohlcData[ohlcData.length - 2];
            
            // Doji Pattern
            if (this.isDoji(latest)) {
                patterns.push({
                    pattern: 'DOJI',
                    type: 'REVERSAL',
                    reliability: 70,
                    signal: 'INDECISION',
                    description: 'Market indecision - potential reversal ahead'
                });
            }
            
            // Hammer Pattern
            if (this.isHammer(latest)) {
                patterns.push({
                    pattern: 'HAMMER',
                    type: 'BULLISH_REVERSAL',
                    reliability: 75,
                    signal: 'BUY',
                    description: 'Bullish reversal pattern at support level'
                });
            }
            
            // Shooting Star
            if (this.isShootingStar(latest)) {
                patterns.push({
                    pattern: 'SHOOTING_STAR',
                    type: 'BEARISH_REVERSAL',
                    reliability: 75,
                    signal: 'SELL',
                    description: 'Bearish reversal pattern at resistance level'
                });
            }
            
            // Engulfing Pattern
            const engulfing = this.detectEngulfingPattern(previous, latest);
            if (engulfing) {
                patterns.push(engulfing);
            }
            
            return {
                patterns: patterns,
                patternCount: patterns.length,
                highReliability: patterns.filter(p => p.reliability >= 80).length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Candlestick pattern detection error:', error.message);
            return { error: error.message, patterns: [] };
        }
    }
    
    // 📊 PATTERN HELPER METHODS
    isDoji(candle) {
        const bodySize = Math.abs(candle.close - candle.open);
        const totalRange = candle.high - candle.low;
        return totalRange > 0 && bodySize / totalRange < 0.1;
    }
    
    isHammer(candle) {
        const bodySize = Math.abs(candle.close - candle.open);
        const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
        const upperShadow = candle.high - Math.max(candle.open, candle.close);
        
        return bodySize > 0 && lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5;
    }
    
    isShootingStar(candle) {
        const bodySize = Math.abs(candle.close - candle.open);
        const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
        const upperShadow = candle.high - Math.max(candle.open, candle.close);
        
        return bodySize > 0 && upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5;
    }
    
    detectEngulfingPattern(previous, current) {
        const prevBullish = previous.close > previous.open;
        const currBullish = current.close > current.open;
        
        // Bullish Engulfing
        if (!prevBullish && currBullish && 
            current.close > previous.open && 
            current.open < previous.close) {
            return {
                pattern: 'BULLISH_ENGULFING',
                type: 'BULLISH_REVERSAL',
                reliability: 85,
                signal: 'BUY',
                description: 'Bullish engulfing pattern - strong reversal signal'
            };
        }
        
        // Bearish Engulfing
        if (prevBullish && !currBullish && 
            current.close < previous.open && 
            current.open > previous.close) {
            return {
                pattern: 'BEARISH_ENGULFING',
                type: 'BEARISH_REVERSAL',
                reliability: 85,
                signal: 'SELL',
                description: 'Bearish engulfing pattern - strong reversal signal'
            };
        }
        
        return null;
    }
}

// 🎯 COMPREHENSIVE TECHNICAL ANALYSIS
async function getComprehensiveTechnicalAnalysis(symbol, priceData) {
    try {
        console.log(`🔍 Running comprehensive technical analysis for ${symbol}...`);
        
        const calculator = new TechnicalIndicatorCalculator();
        const patternEngine = new PatternRecognitionEngine();
        const aggregator = new SignalAggregator();
        
        if (!priceData || !priceData.prices || priceData.prices.length < 50) {
            return {
                error: 'Insufficient price data for comprehensive analysis',
                symbol: symbol
            };
        }
        
        // Calculate all technical indicators
        const [sma20, sma50, ema20, ema50, rsi, macd, bollinger] = await Promise.all([
            calculator.calculateSMA(priceData.prices, 20),
            calculator.calculateSMA(priceData.prices, 50),
            calculator.calculateEMA(priceData.prices, 20),
            calculator.calculateEMA(priceData.prices, 50),
            calculator.calculateRSI(priceData.prices),
            calculator.calculateMACD(priceData.prices),
            calculator.calculateBollingerBands(priceData.prices)
        ]);
        
        // Generate OHLC data for pattern recognition
        const ohlcData = priceData.prices.slice(-20).map((price, i) => ({
            open: price * (0.98 + Math.random() * 0.04),
            high: price * (1.005 + Math.random() * 0.015),
            low: price * (0.985 - Math.random() * 0.015),
            close: price
        }));
        
        const patterns = patternEngine.detectCandlestickPatterns(ohlcData);
        
        // Aggregate all signals
        const indicators = {
            rsi: rsi.error ? { signal: 'NEUTRAL' } : rsi,
            macd: macd.error ? { signal: 'NEUTRAL' } : macd,
            bollinger: bollinger.error ? { signal: 'NEUTRAL' } : bollinger,
            trend: {
                signal: !ema20.error && !ema50.error && ema20.current > ema50.current ? 'BUY' : 'SELL'
            }
        };
        
        const aggregatedSignals = aggregator.aggregateSignals(indicators);
        
        // Generate AI analysis
        const aiAnalysisPrompt = `Provide technical analysis summary for ${symbol}:

Current Price: ${priceData.prices[priceData.prices.length - 1].toFixed(2)}
RSI: ${rsi.error ? 'N/A' : rsi.current.toFixed(2)} (${rsi.error ? 'N/A' : rsi.signal})
MACD: ${macd.error ? 'N/A' : macd.signal}
Bollinger Position: ${bollinger.error ? 'N/A' : bollinger.position}
Trend: ${!ema20.error && !ema50.error ? (ema20.current > ema50.current ? 'BULLISH' : 'BEARISH') : 'UNCLEAR'}
Overall Signal: ${aggregatedSignals.overallSignal}
Confidence: ${aggregatedSignals.confidence}%
Patterns Detected: ${patterns.patternCount}

Provide concise analysis with key support/resistance levels and trading recommendation.`;
        
        const aiAnalysis = await getUniversalAnalysis(aiAnalysisPrompt, {
            isWealthCommand: true,
            maxTokens: 1000
        });
        
        return {
            symbol: symbol,
            currentPrice: priceData.prices[priceData.prices.length - 1],
            technicalIndicators: {
                sma20: sma20.error ? null : sma20,
                sma50: sma50.error ? null : sma50,
                ema20: ema20.error ? null : ema20,
                ema50: ema50.error ? null : ema50,
                rsi: rsi.error ? null : rsi,
                macd: macd.error ? null : macd,
                bollinger: bollinger.error ? null : bollinger
            },
            patterns: patterns,
            aggregatedSignals: aggregatedSignals,
            keyLevels: {
                support: Math.min(...priceData.prices.slice(-20)) * 0.98,
                resistance: Math.max(...priceData.prices.slice(-20)) * 1.02,
                sma20Level: sma20.error ? null : sma20.current,
                sma50Level: sma50.error ? null : sma50.current
            },
            aiAnalysis: aiAnalysis.response,
            recommendation: {
                action: aggregatedSignals.overallSignal,
                confidence: aggregatedSignals.confidence,
                reasoning: aggregatedSignals.signalCount > 2 ? 'Multiple indicator agreement' : 'Limited indicator data'
            },
            analysisDate: new Date().toISOString(),
            dataQuality: {
                indicators: Object.values(indicators).filter(i => !i.error).length,
                patterns: patterns.patternCount,
                overall: 'GOOD'
            }
        };
        
    } catch (error) {
        console.error(`Comprehensive technical analysis error for ${symbol}:`, error.message);
        return {
            error: error.message,
            symbol: symbol,
            analysisDate: new Date().toISOString()
        };
    }
}

// 🎯 EXPORT ALL SCANNER FUNCTIONS
module.exports = {
    // Main Functions
    runComprehensiveMarketScan,
    getComprehensiveTechnicalAnalysis,
    
    // Classes
    TechnicalIndicatorCalculator,
    MarketScannerEngine,
    SignalAggregator,
    RealTimeSignalMonitor,
    PatternRecognitionEngine,
    
    // Utility Functions
    generateSampleMarketData,
    getSectorForAsset,
    generateScannerRecommendations
};

// 🏆 WEALTH MODULE 3: YIELD GENERATION & INCOME OPTIMIZATION
// Advanced yield farming, dividend optimization, and income strategies

// 💰 YIELD STRATEGY ANALYZER
class YieldStrategyAnalyzer {
    constructor() {
        this.yieldCategories = {
            DIVIDEND_STOCKS: 'Dividend Growth Stocks',
            DIVIDEND_ETFS: 'Dividend-Focused ETFs',
            REITS: 'Real Estate Investment Trusts',
            BONDS: 'Fixed Income Securities',
            TREASURY_SECURITIES: 'Treasury Bills & Notes',
            CORPORATE_BONDS: 'Corporate Bonds',
            HIGH_YIELD_BONDS: 'High Yield Bonds',
            PREFERRED_STOCKS: 'Preferred Shares',
            UTILITIES: 'Utility Stocks',
            COVERED_CALLS: 'Covered Call Strategies',
            CASH_EQUIVALENTS: 'Money Market & CDs'
        };
        
        this.riskLevels = {
            CONSERVATIVE: { maxRisk: 0.05, targetYield: 0.04, maxConcentration: 0.15 },
            MODERATE: { maxRisk: 0.10, targetYield: 0.06, maxConcentration: 0.20 },
            AGGRESSIVE: { maxRisk: 0.20, targetYield: 0.10, maxConcentration: 0.30 },
            SPECULATION: { maxRisk: 0.35, targetYield: 0.15, maxConcentration: 0.40 }
        };
        
        this.incomeFrequencies = {
            MONTHLY: { frequency: 12, description: 'Monthly Income Distribution' },
            QUARTERLY: { frequency: 4, description: 'Quarterly Income Distribution' },
            SEMI_ANNUAL: { frequency: 2, description: 'Semi-Annual Income Distribution' },
            ANNUAL: { frequency: 1, description: 'Annual Income Distribution' }
        };
    }
    
    // 📈 ANALYZE DIVIDEND STOCKS
    async analyzeDividendOpportunities(stocks, options = {}) {
        try {
            const dividendAnalysis = [];
            
            for (const stock of stocks) {
                const analysis = await this.analyzeSingleDividendStock(stock);
                if (analysis && !analysis.error) {
                    dividendAnalysis.push(analysis);
                }
            }
            
            dividendAnalysis.sort((a, b) => b.dividendScore - a.dividendScore);
            
            const portfolioOptimization = this.optimizeDividendPortfolio(dividendAnalysis, options);
            
            return {
                individualAnalysis: dividendAnalysis,
                portfolioOptimization: portfolioOptimization,
                topPicks: dividendAnalysis.slice(0, 5),
                averageYield: this.calculateAverageYield(dividendAnalysis),
                riskAssessment: this.assessDividendRisk(dividendAnalysis),
                sectorDiversification: this.analyzeSectorDiversification(dividendAnalysis),
                incomeProjection: this.projectPortfolioIncome(dividendAnalysis, options.portfolioValue || 1000000),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Dividend analysis error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🏢 ANALYZE SINGLE DIVIDEND STOCK
    async analyzeSingleDividendStock(stockData) {
        try {
            const {
                symbol,
                currentPrice = 100,
                annualDividend = 3,
                dividendGrowthRate = 0.05,
                payoutRatio = 0.6,
                earnings = 5,
                debt = 50,
                marketCap = 10000,
                sector = 'Unknown',
                yearsOfGrowth = 5
            } = stockData;
            
            // Calculate key dividend metrics
            const currentYield = annualDividend / currentPrice;
            const dividendYield = currentYield * 100;
            
            // Dividend sustainability score
            const sustainabilityScore = this.calculateDividendSustainability({
                payoutRatio,
                dividendGrowthRate,
                earnings,
                debt,
                marketCap
            });
            
            // Quality score
            const qualityScore = this.calculateDividendQuality({
                dividendGrowthRate,
                payoutRatio,
                earnings,
                sector,
                yearsOfGrowth
            });
            
            // Overall dividend score (0-100)
            const dividendScore = Math.min(100, (sustainabilityScore * 0.4) + (qualityScore * 0.3) + (Math.min(dividendYield, 15) * 2 * 0.3));
            
            // Future dividend projection
            const projectedDividends = this.projectFutureDividends(annualDividend, dividendGrowthRate, 5);
            
            // Yield on cost analysis
            const yieldOnCost = this.calculateYieldOnCost(currentPrice, annualDividend, dividendGrowthRate, 10);
            
            return {
                symbol: symbol,
                currentPrice: currentPrice,
                currentYield: currentYield,
                dividendYield: dividendYield,
                annualDividend: annualDividend,
                dividendGrowthRate: dividendGrowthRate,
                payoutRatio: payoutRatio,
                sustainabilityScore: sustainabilityScore,
                qualityScore: qualityScore,
                dividendScore: dividendScore,
                projectedDividends: projectedDividends,
                yieldOnCost: yieldOnCost,
                sector: sector,
                riskLevel: this.assessStockRiskLevel(sustainabilityScore, qualityScore),
                recommendation: this.getDividendRecommendation(dividendScore, currentYield),
                strengthAnalysis: this.analyzeDividendStrengths(stockData),
                weaknessAnalysis: this.analyzeDividendWeaknesses(stockData)
            };
        } catch (error) {
            console.error(`Single dividend stock analysis error (${stockData.symbol}):`, error.message);
            return { error: error.message, symbol: stockData.symbol };
        }
    }
    
    // 🏛️ REIT ANALYSIS ENGINE
    async analyzeREITOpportunities(reits, marketData) {
        try {
            const reitAnalysis = [];
            
            for (const reit of reits) {
                const analysis = await this.analyzeSingleREIT(reit, marketData);
                if (analysis && !analysis.error) {
                    reitAnalysis.push(analysis);
                }
            }
            
            reitAnalysis.sort((a, b) => b.reitScore - a.reitScore);
            
            return {
                reitAnalysis: reitAnalysis,
                topREITs: reitAnalysis.slice(0, 5),
                sectorBreakdown: this.analyzeREITSectors(reitAnalysis),
                portfolioMetrics: this.calculateREITPortfolioMetrics(reitAnalysis),
                interestRateImpact: this.assessInterestRateImpact(reitAnalysis, marketData),
                incomeStability: this.assessREITIncomeStability(reitAnalysis),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('REIT analysis error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🏢 ANALYZE SINGLE REIT
    async analyzeSingleREIT(reitData, marketData) {
        try {
            const {
                symbol,
                currentPrice = 50,
                annualDividend = 2.5,
                ffo = 3.0, // Funds From Operations
                navPerShare = 55,
                occupancyRate = 0.92,
                debtToEquity = 0.6,
                sector = 'Diversified',
                geographicFocus = 'US'
            } = reitData;
            
            const currentYield = annualDividend / currentPrice;
            const ffoYield = ffo / currentPrice;
            const priceToNAV = currentPrice / navPerShare;
            
            // REIT-specific metrics
            const ffoPayoutRatio = annualDividend / ffo;
            const occupancyScore = occupancyRate * 100;
            const leverageRisk = this.assessREITLeverage(debtToEquity);
            
            // Interest rate sensitivity
            const interestRateSensitivity = this.calculateInterestRateSensitivity(
                currentYield, 
                marketData?.yieldCurve?.current?.['10Y'] || 4.5
            );
            
            // Overall REIT score
            const reitScore = this.calculateREITScore({
                currentYield,
                ffoYield,
                priceToNAV,
                occupancyRate,
                leverageRisk,
                sector
            });
            
            return {
                symbol: symbol,
                currentPrice: currentPrice,
                currentYield: currentYield,
                dividendYield: currentYield * 100,
                ffoYield: ffoYield,
                ffoPayoutRatio: ffoPayoutRatio,
                priceToNAV: priceToNAV,
                occupancyRate: occupancyRate,
                occupancyScore: occupancyScore,
                debtToEquity: debtToEquity,
                leverageRisk: leverageRisk,
                interestRateSensitivity: interestRateSensitivity,
                reitScore: reitScore,
                sector: sector,
                geographicFocus: geographicFocus,
                recommendation: this.getREITRecommendation(reitScore, currentYield, priceToNAV),
                riskFactors: this.identifyREITRisks(reitData, marketData)
            };
        } catch (error) {
            console.error(`Single REIT analysis error (${reitData.symbol}):`, error.message);
            return { error: error.message, symbol: reitData.symbol };
        }
    }
    
    // 💎 BOND ANALYSIS ENGINE
    async analyzeBondOpportunities(bonds, marketData) {
        try {
            const bondAnalysis = [];
            
            for (const bond of bonds) {
                const analysis = await this.analyzeSingleBond(bond, marketData);
                if (analysis && !analysis.error) {
                    bondAnalysis.push(analysis);
                }
            }
            
            bondAnalysis.sort((a, b) => b.bondScore - a.bondScore);
            
            return {
                bondAnalysis: bondAnalysis,
                topBonds: bondAnalysis.slice(0, 5),
                durationAnalysis: this.analyzeBondDuration(bondAnalysis),
                creditQualityBreakdown: this.analyzeCreditQuality(bondAnalysis),
                yieldCurvePosition: this.analyzeBondYieldCurvePosition(bondAnalysis, marketData),
                interestRateRisk: this.assessBondInterestRateRisk(bondAnalysis, marketData),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Bond analysis error:', error.message);
            return { error: error.message };
        }
    }
    
    // 💰 ANALYZE SINGLE BOND
    async analyzeSingleBond(bondData, marketData) {
        try {
            const {
                symbol,
                currentPrice = 100,
                couponRate = 0.04,
                maturityYears = 10,
                creditRating = 'A',
                duration = 8.5,
                issuer = 'Corporate',
                faceValue = 1000
            } = bondData;
            
            const currentYield = (couponRate * faceValue) / currentPrice;
            const yieldToMaturity = this.calculateYTM(currentPrice, couponRate, maturityYears, faceValue);
            
            // Credit risk assessment
            const creditRisk = this.assessCreditRisk(creditRating);
            const creditSpread = this.calculateCreditSpread(currentYield, marketData?.yieldCurve?.current?.['10Y'] || 4.5);
            
            // Interest rate risk
            const interestRateRisk = this.assessBondInterestRateRisk(duration, maturityYears);
            
            // Overall bond score
            const bondScore = this.calculateBondScore({
                currentYield,
                yieldToMaturity,
                creditRisk,
                interestRateRisk,
                duration,
                maturityYears
            });
            
            return {
                symbol: symbol,
                currentPrice: currentPrice,
                currentYield: currentYield,
                yieldToMaturity: yieldToMaturity,
                couponRate: couponRate,
                maturityYears: maturityYears,
                duration: duration,
                creditRating: creditRating,
                creditRisk: creditRisk,
                creditSpread: creditSpread,
                interestRateRisk: interestRateRisk,
                bondScore: bondScore,
                issuer: issuer,
                recommendation: this.getBondRecommendation(bondScore, currentYield, interestRateRisk),
                priceVolatility: this.estimateBondVolatility(duration, creditRisk)
            };
        } catch (error) {
            console.error(`Single bond analysis error (${bondData.symbol}):`, error.message);
            return { error: error.message, symbol: bondData.symbol };
        }
    }
    
    // 🎯 COVERED CALL STRATEGY ANALYZER
    async analyzeCoveredCallStrategies(stocks, options = {}) {
        try {
            const strategies = [];
            
            for (const stock of stocks) {
                const strategy = await this.analyzeCoveredCallForStock(stock, options);
                if (strategy && !strategy.error) {
                    strategies.push(strategy);
                }
            }
            
            strategies.sort((a, b) => b.enhancedYield - a.enhancedYield);
            
            return {
                strategies: strategies,
                topStrategies: strategies.slice(0, 5),
                averageEnhancement: this.calculateAverageYieldEnhancement(strategies),
                riskAnalysis: this.assessCoveredCallRisks(strategies),
                marketConditionSuitability: this.assessMarketSuitability(strategies, options.marketOutlook),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Covered call analysis error:', error.message);
            return { error: error.message };
        }
    }
    
    // 📞 ANALYZE COVERED CALL FOR SINGLE STOCK
    async analyzeCoveredCallForStock(stockData, options = {}) {
        try {
            const {
                symbol,
                currentPrice = 100,
                annualDividend = 2,
                volatility = 0.25,
                beta = 1.0
            } = stockData;
            
            const dividendYield = annualDividend / currentPrice;
            
            // Calculate optimal strike prices (5%, 10%, 15% OTM)
            const strikeOptions = [1.05, 1.10, 1.15].map(multiplier => ({
                strike: currentPrice * multiplier,
                otmPercent: (multiplier - 1) * 100
            }));
            
            const callAnalysis = [];
            
            for (const strikeOption of strikeOptions) {
                // Estimate option premium (simplified Black-Scholes approximation)
                const premium = this.estimateCallPremium(
                    currentPrice, 
                    strikeOption.strike, 
                    0.30, // 30 days to expiration
                    volatility,
                    0.05 // risk-free rate
                );
                
                const annualizedPremium = premium * 12; // Monthly strategy
                const enhancedYield = (dividendYield + (annualizedPremium / currentPrice)) * 100;
                
                // Calculate upside potential if called away
                const upsidePotential = ((strikeOption.strike - currentPrice) / currentPrice) * 100;
                
                callAnalysis.push({
                    strike: strikeOption.strike,
                    otmPercent: strikeOption.otmPercent,
                    premium: premium,
                    annualizedPremium: annualizedPremium,
                    enhancedYield: enhancedYield,
                    upsidePotential: upsidePotential,
                    totalReturn: enhancedYield + upsidePotential,
                    assignmentRisk: this.calculateAssignmentRisk(currentPrice, strikeOption.strike, volatility)
                });
            }
            
            // Find optimal strategy
            const optimalStrategy = callAnalysis.reduce((best, current) => 
                current.totalReturn > best.totalReturn ? current : best
            );
            
            return {
                symbol: symbol,
                currentPrice: currentPrice,
                baseYield: dividendYield * 100,
                enhancedYield: optimalStrategy.enhancedYield,
                yieldEnhancement: optimalStrategy.enhancedYield - (dividendYield * 100),
                optimalStrategy: optimalStrategy,
                allStrategies: callAnalysis,
                riskLevel: this.assessCoveredCallRisk(volatility, beta),
                marketSuitability: this.getMarketSuitability(volatility, options.marketOutlook),
                recommendation: this.getCoveredCallRecommendation(optimalStrategy, volatility)
            };
        } catch (error) {
            console.error(`Covered call analysis error (${stockData.symbol}):`, error.message);
            return { error: error.message, symbol: stockData.symbol };
        }
    }
    
    // 🔧 HELPER CALCULATION METHODS
    
    calculateDividendSustainability(data) {
        let score = 50; // Base score
        
        // Payout ratio assessment
        if (data.payoutRatio < 0.4) score += 20;
        else if (data.payoutRatio < 0.6) score += 10;
        else if (data.payoutRatio > 0.8) score -= 20;
        
        // Growth rate sustainability
        if (data.dividendGrowthRate > 0.15) score -= 15; // Too aggressive
        else if (data.dividendGrowthRate > 0.08) score += 15;
        else if (data.dividendGrowthRate > 0.03) score += 10;
        
        // Financial health
        const debtRatio = data.debt / data.marketCap;
        if (debtRatio < 0.3) score += 10;
        else if (debtRatio > 0.7) score -= 15;
        
        return Math.max(0, Math.min(100, score));
    }
    
    calculateDividendQuality(data) {
        let score = 50;
        
        // Consistent growth
        if (data.dividendGrowthRate > 0.05 && data.dividendGrowthRate < 0.12) score += 20;
        
        // Reasonable payout ratio
        if (data.payoutRatio >= 0.4 && data.payoutRatio <= 0.7) score += 15;
        
        // Sector stability bonus
        const stableSectors = ['Utilities', 'Consumer Staples', 'Healthcare'];
        if (stableSectors.includes(data.sector)) score += 10;
        
        // Years of growth bonus
        if (data.yearsOfGrowth >= 10) score += 15;
        else if (data.yearsOfGrowth >= 5) score += 10;
        
        return Math.max(0, Math.min(100, score));
    }
    
    projectFutureDividends(currentDividend, growthRate, years) {
        const projections = [];
        let dividend = currentDividend;
        
        for (let year = 1; year <= years; year++) {
            dividend = dividend * (1 + growthRate);
            projections.push({
                year: year,
                dividend: dividend,
                cumulativeDividends: projections.reduce((sum, p) => sum + p.dividend, 0) + dividend
            });
        }
        
        return projections;
    }
    
    calculateYieldOnCost(purchasePrice, currentDividend, growthRate, years) {
        const projections = [];
        let dividend = currentDividend;
        
        for (let year = 1; year <= years; year++) {
            dividend = dividend * (1 + growthRate);
            const yieldOnCost = (dividend / purchasePrice) * 100;
            projections.push({
                year: year,
                dividend: dividend,
                yieldOnCost: yieldOnCost
            });
        }
        
        return projections;
    }
    
    calculateYTM(price, couponRate, years, faceValue) {
        // Simplified YTM calculation (approximation)
        const annualCoupon = couponRate * faceValue;
        const ytm = (annualCoupon + (faceValue - price) / years) / ((faceValue + price) / 2);
        return ytm;
    }
    
    estimateCallPremium(stockPrice, strike, timeToExpiry, volatility, riskFreeRate) {
        // Simplified Black-Scholes approximation for call premium
        const intrinsicValue = Math.max(0, stockPrice - strike);
        const timeValue = stockPrice * volatility * Math.sqrt(timeToExpiry) * 0.4;
        return intrinsicValue + timeValue;
    }
    
    // 🎯 ASSESSMENT METHODS
    
    assessStockRiskLevel(sustainabilityScore, qualityScore) {
        const avgScore = (sustainabilityScore + qualityScore) / 2;
        if (avgScore >= 80) return 'LOW';
        if (avgScore >= 60) return 'MODERATE';
        if (avgScore >= 40) return 'HIGH';
        return 'VERY_HIGH';
    }
    
    getDividendRecommendation(dividendScore, currentYield) {
        if (dividendScore >= 80 && currentYield >= 0.03) return 'STRONG_BUY';
        if (dividendScore >= 70 && currentYield >= 0.025) return 'BUY';
        if (dividendScore >= 50) return 'HOLD';
        if (dividendScore >= 30) return 'WEAK_HOLD';
        return 'AVOID';
    }
    
    analyzeDividendStrengths(stockData) {
        const strengths = [];
        
        if (stockData.dividendGrowthRate > 0.08) {
            strengths.push('Strong dividend growth rate');
        }
        if (stockData.payoutRatio < 0.6) {
            strengths.push('Conservative payout ratio');
        }
        if (stockData.yearsOfGrowth >= 10) {
            strengths.push('Long track record of dividend growth');
        }
        if (stockData.currentPrice / stockData.earnings < 20) {
            strengths.push('Reasonable valuation');
        }
        
        return strengths.length > 0 ? strengths : ['No significant strengths identified'];
    }
    
    analyzeDividendWeaknesses(stockData) {
        const weaknesses = [];
        
        if (stockData.payoutRatio > 0.8) {
            weaknesses.push('High payout ratio - sustainability risk');
        }
        if (stockData.dividendGrowthRate < 0.02) {
            weaknesses.push('Low dividend growth rate');
        }
        if (stockData.debt / stockData.marketCap > 0.6) {
            weaknesses.push('High debt levels');
        }
        if (stockData.currentPrice / stockData.earnings > 30) {
            weaknesses.push('High valuation multiples');
        }
        
        return weaknesses.length > 0 ? weaknesses : ['No significant weaknesses identified'];
    }
    
    // 🏛️ REIT-SPECIFIC METHODS
    
    calculateREITScore(data) {
        let score = 50;
        
        // Yield attractiveness
        if (data.currentYield > 0.06) score += 15;
        else if (data.currentYield > 0.04) score += 10;
        
        // FFO yield
        if (data.ffoYield > 0.08) score += 10;
        
        // Price to NAV
        if (data.priceToNAV < 0.9) score += 15; // Trading at discount
        else if (data.priceToNAV > 1.2) score -= 10; // Trading at premium
        
        // Occupancy rate
        if (data.occupancyRate > 0.95) score += 15;
        else if (data.occupancyRate > 0.90) score += 10;
        else if (data.occupancyRate < 0.85) score -= 15;
        
        // Leverage assessment
        if (data.leverageRisk === 'LOW') score += 10;
        else if (data.leverageRisk === 'HIGH') score -= 15;
        
        return Math.max(0, Math.min(100, score));
    }
    
    assessREITLeverage(debtToEquity) {
        if (debtToEquity < 0.4) return 'LOW';
        if (debtToEquity < 0.7) return 'MODERATE';
        return 'HIGH';
    }
    
    calculateInterestRateSensitivity(reitYield, treasuryYield) {
        const yieldSpread = reitYield - treasuryYield;
        
        if (yieldSpread > 0.04) return 'LOW'; // High spread = less sensitive
        if (yieldSpread > 0.02) return 'MODERATE';
        return 'HIGH';
    }
    
    getREITRecommendation(reitScore, currentYield, priceToNAV) {
        if (reitScore >= 80 && currentYield >= 0.05) return 'STRONG_BUY';
        if (reitScore >= 70 && priceToNAV < 1.0) return 'BUY';
        if (reitScore >= 50) return 'HOLD';
        return 'AVOID';
    }
    
    identifyREITRisks(reitData, marketData) {
        const risks = [];
        
        if (reitData.debtToEquity > 0.7) {
            risks.push('High leverage risk');
        }
        if (reitData.occupancyRate < 0.90) {
            risks.push('Below-average occupancy rate');
        }
        if (marketData?.yieldCurve?.shape === 'INVERTED') {
            risks.push('Interest rate environment risk');
        }
        
        return risks.length > 0 ? risks : ['Standard REIT risks apply'];
    }
    
    // 💎 BOND-SPECIFIC METHODS
    
    assessCreditRisk(rating) {
        const ratingMap = {
            'AAA': 'MINIMAL', 'AA+': 'MINIMAL', 'AA': 'MINIMAL', 'AA-': 'LOW',
            'A+': 'LOW', 'A': 'LOW', 'A-': 'MODERATE',
            'BBB+': 'MODERATE', 'BBB': 'MODERATE', 'BBB-': 'MODERATE',
            'BB+': 'HIGH', 'BB': 'HIGH', 'BB-': 'HIGH',
            'B+': 'VERY_HIGH', 'B': 'VERY_HIGH', 'B-': 'VERY_HIGH'
        };
        
        return ratingMap[rating] || 'UNKNOWN';
    }
    
    calculateCreditSpread(bondYield, treasuryYield) {
        return bondYield - treasuryYield;
    }
    
    assessBondInterestRateRisk(duration, maturity) {
        if (duration > 10 || maturity > 15) return 'HIGH';
        if (duration > 5 || maturity > 7) return 'MODERATE';
        return 'LOW';
    }
    
    calculateBondScore(data) {
        let score = 50;
        
        // Yield attractiveness
        if (data.currentYield > 0.06) score += 15;
        else if (data.currentYield > 0.04) score += 10;
        
        // Credit quality
        if (data.creditRisk === 'MINIMAL' || data.creditRisk === 'LOW') score += 15;
        else if (data.creditRisk === 'HIGH' || data.creditRisk === 'VERY_HIGH') score -= 20;
        
        // Interest rate risk
        if (data.interestRateRisk === 'LOW') score += 10;
        else if (data.interestRateRisk === 'HIGH') score -= 15;
        
        // Maturity considerations
        if (data.maturityYears >= 3 && data.maturityYears <= 10) score += 5;
        
        return Math.max(0, Math.min(100, score));
    }
    
    getBondRecommendation(bondScore, currentYield, interestRateRisk) {
        if (bondScore >= 80 && currentYield >= 0.04) return 'STRONG_BUY';
        if (bondScore >= 70) return 'BUY';
        if (bondScore >= 50 && interestRateRisk !== 'HIGH') return 'HOLD';
        return 'AVOID';
    }
    
    estimateBondVolatility(duration, creditRisk) {
        let baseVolatility = duration * 0.01; // 1% per year of duration
        
        const riskMultiplier = {
            'MINIMAL': 1.0,
            'LOW': 1.2,
            'MODERATE': 1.5,
            'HIGH': 2.0,
            'VERY_HIGH': 3.0
        };
        
        return baseVolatility * (riskMultiplier[creditRisk] || 1.5);
    }
    
    // 📞 COVERED CALL METHODS
    
    calculateAssignmentRisk(currentPrice, strikePrice, volatility) {
        const priceRatio = currentPrice / strikePrice;
        
        if (priceRatio > 0.95) return 'HIGH';
        if (priceRatio > 0.90) return 'MODERATE';
        return 'LOW';
    }
    
    assessCoveredCallRisk(volatility, beta) {
        if (volatility > 0.4 || beta > 1.5) return 'HIGH';
        if (volatility > 0.25 || beta > 1.2) return 'MODERATE';
        return 'LOW';
    }
    
    getMarketSuitability(volatility, marketOutlook) {
        if (marketOutlook === 'BEARISH' && volatility > 0.3) return 'EXCELLENT';
        if (marketOutlook === 'NEUTRAL' && volatility > 0.2) return 'GOOD';
        if (marketOutlook === 'BULLISH') return 'POOR';
        return 'FAIR';
    }
    
    getCoveredCallRecommendation(strategy, volatility) {
        if (strategy.enhancedYield > 10 && volatility > 0.25) return 'STRONG_BUY';
        if (strategy.enhancedYield > 7) return 'BUY';
        if (strategy.enhancedYield > 4) return 'CONSIDER';
        return 'AVOID';
    }
    
    // 📊 PORTFOLIO-LEVEL METHODS
    
    calculateAverageYield(analysis) {
        if (!analysis || analysis.length === 0) return 0;
        
        const totalYield = analysis.reduce((sum, item) => sum + (item.currentYield || item.dividendYield / 100 || 0), 0);
        return (totalYield / analysis.length) * 100;
    }
    
    assessDividendRisk(analysis) {
        if (!analysis || analysis.length === 0) return 'UNKNOWN';
        
        const riskCounts = { LOW: 0, MODERATE: 0, HIGH: 0, VERY_HIGH: 0 };
        analysis.forEach(item => {
            if (item.riskLevel) riskCounts[item.riskLevel]++;
        });
        
        const total = analysis.length;
        if (riskCounts.HIGH + riskCounts.VERY_HIGH > total * 0.4) return 'HIGH';
        if (riskCounts.LOW > total * 0.6) return 'LOW';
        return 'MODERATE';
    }
    
    analyzeSectorDiversification(analysis) {
        const sectorCounts = {};
        analysis.forEach(item => {
            if (item.sector) {
                sectorCounts[item.sector] = (sectorCounts[item.sector] || 0) + 1;
            }
        });
        
        const sectors = Object.keys(sectorCounts);
        const maxConcentration = Math.max(...Object.values(sectorCounts)) / analysis.length;
        
        return {
            sectors: sectors,
            sectorCount: sectors.length,
            maxConcentration: maxConcentration,
            diversificationScore: Math.min(100, sectors.length * 20 - maxConcentration * 100),
            recommendation: maxConcentration > 0.4 ? 'INCREASE_DIVERSIFICATION' : 'WELL_DIVERSIFIED'
        };
    }
    
    projectPortfolioIncome(analysis, portfolioValue) {
        const avgYield = this.calculateAverageYield(analysis) / 100;
        const monthlyIncome = (portfolioValue * avgYield) / 12;
        const quarterlyIncome = (portfolioValue * avgYield) / 4;
        const annualIncome = portfolioValue * avgYield;
        
        return {
            monthly: monthlyIncome,
            quarterly: quarterlyIncome,
            annual: annualIncome,
            yieldRate: avgYield * 100,
            totalPositions: analysis.length
        };
    }
    
    optimizeDividendPortfolio(analysis, options = {}) {
        const riskLevel = options.riskLevel || 'MODERATE';
        const targetYield = this.riskLevels[riskLevel].targetYield;
        const maxConcentration = this.riskLevels[riskLevel].maxConcentration;
        
        // Filter stocks that meet criteria
        const suitableStocks = analysis.filter(stock => {
            const meetsYield = stock.currentYield >= targetYield * 0.8;
            const meetsRisk = this.isRiskAppropriate(stock.riskLevel, riskLevel);
            const meetsScore = stock.dividendScore >= 60;
            
            return meetsYield && meetsRisk && meetsScore;
        });
        
        // Sector diversification
        const sectorWeights = this.calculateOptimalSectorWeights(suitableStocks, maxConcentration);
        
        // Calculate optimal weights
        const optimalWeights = this.calculateOptimalWeights(suitableStocks, sectorWeights, options);
        
        return {
            suitableStocks: suitableStocks,
            optimalWeights: optimalWeights,
            expectedYield: this.calculatePortfolioYield(optimalWeights),
            riskLevel: riskLevel,
            diversificationScore: this.calculateDiversificationScore(optimalWeights),
            recommendation: this.getPortfolioRecommendation(optimalWeights, targetYield)
        };
    }
    
    isRiskAppropriate(stockRisk, portfolioRisk) {
        const riskHierarchy = { LOW: 0, MODERATE: 1, HIGH: 2, VERY_HIGH: 3 };
        const portfolioLevel = { CONSERVATIVE: 0, MODERATE: 1, AGGRESSIVE: 2, SPECULATION: 3 };
        
        return riskHierarchy[stockRisk] <= portfolioLevel[portfolioRisk] + 1;
    }
    
    calculateOptimalSectorWeights(stocks, maxConcentration) {
        const sectors = [...new Set(stocks.map(s => s.sector))];
        const targetWeight = Math.min(maxConcentration, 1 / sectors.length);
        
        const weights = {};
        sectors.forEach(sector => {
            weights[sector] = targetWeight;
        });
        
        return weights;
    }
    
    calculateOptimalWeights(stocks, sectorWeights, options) {
        const weights = {};
        const sectorStocks = {};
        
        // Group stocks by sector
        stocks.forEach(stock => {
            if (!sectorStocks[stock.sector]) {
                sectorStocks[stock.sector] = [];
            }
            sectorStocks[stock.sector].push(stock);
        });
        
        // Allocate within sectors based on dividend score
        Object.keys(sectorStocks).forEach(sector => {
            const sectorWeight = sectorWeights[sector] || 0;
            const stocks = sectorStocks[sector];
            const totalScore = stocks.reduce((sum, s) => sum + s.dividendScore, 0);
            
            stocks.forEach(stock => {
                const stockWeight = sectorWeight * (stock.dividendScore / totalScore);
                weights[stock.symbol] = Math.max(0.01, Math.min(0.1, stockWeight)); // Min 1%, Max 10%
            });
        });
        
        // Normalize weights to sum to 1
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
        Object.keys(weights).forEach(symbol => {
            weights[symbol] = weights[symbol] / totalWeight;
        });
        
        return weights;
    }
    
    calculatePortfolioYield(weights) {
        // This would use actual stock data in production
        return Object.values(weights).reduce((sum, weight) => sum + weight, 0) * 0.05; // 5% average
    }
    
    calculateDiversificationScore(weights) {
        const stockCount = Object.keys(weights).length;
        const maxWeight = Math.max(...Object.values(weights));
        
        return Math.min(100, stockCount * 10 - maxWeight * 200);
    }
    
    getPortfolioRecommendation(weights, targetYield) {
        const stockCount = Object.keys(weights).length;
        
        if (stockCount >= 20 && this.calculatePortfolioYield(weights) >= targetYield) {
            return 'WELL_OPTIMIZED';
        }
        if (stockCount >= 10) {
            return 'ADEQUATELY_DIVERSIFIED';
        }
        return 'NEEDS_MORE_DIVERSIFICATION';
    }
}

// 🎯 MASTER YIELD ANALYSIS FUNCTION
async function getComprehensiveYieldAnalysis(portfolioData, options = {}) {
    try {
        console.log('💰 Running comprehensive yield analysis...');
        
        const analyzer = new YieldStrategyAnalyzer();
        
        // Generate sample data for demonstration
        const sampleDividendStocks = generateSampleDividendStocks();
        const sampleREITs = generateSampleREITs();
        const sampleBonds = generateSampleBonds();
        
        // Get market data for context
        const [marketData, regimeData, yieldCurve, inflationData] = await Promise.allSettled([
            getRayDalioMarketData(),
            detectEconomicRegime(),
            getYieldCurveAnalysis(),
            getInflationExpectations()
        ]);
        
        // Run parallel analysis
        const [
            dividendAnalysis,
            reitAnalysis,
            bondAnalysis,
            coveredCallAnalysis
        ] = await Promise.allSettled([
            analyzer.analyzeDividendOpportunities(sampleDividendStocks, options),
            analyzer.analyzeREITOpportunities(sampleREITs, marketData.value),
            analyzer.analyzeBondOpportunities(sampleBonds, marketData.value),
            analyzer.analyzeCoveredCallStrategies(sampleDividendStocks.slice(0, 5), options)
        ]);
        
        // Compile results
        const yieldOpportunities = [];
        
        if (dividendAnalysis.status === 'fulfilled') {
            dividendAnalysis.value.topPicks?.forEach(stock => {
                yieldOpportunities.push({
                    symbol: stock.symbol,
                    type: 'DIVIDEND_STOCK',
                    yield: stock.dividendYield,
                    score: stock.dividendScore,
                    risk: stock.riskLevel,
                    recommendation: stock.recommendation
                });
            });
        }
        
        if (reitAnalysis.status === 'fulfilled') {
            reitAnalysis.value.topREITs?.forEach(reit => {
                yieldOpportunities.push({
                    symbol: reit.symbol,
                    type: 'REIT',
                    yield: reit.dividendYield,
                    score: reit.reitScore,
                    risk: reit.leverageRisk,
                    recommendation: reit.recommendation
                });
            });
        }
        
        if (bondAnalysis.status === 'fulfilled') {
            bondAnalysis.value.topBonds?.forEach(bond => {
                yieldOpportunities.push({
                    symbol: bond.symbol,
                    type: 'BOND',
                    yield: bond.currentYield * 100,
                    score: bond.bondScore,
                    risk: bond.interestRateRisk,
                    recommendation: bond.recommendation
                });
            });
        }
        
        // Sort by yield and score
        yieldOpportunities.sort((a, b) => (b.score * b.yield) - (a.score * a.yield));
        
        // Generate AI insights
        const aiAnalysisPrompt = `Analyze this yield generation strategy:

Market Environment:
- Economic Regime: ${regimeData.value?.currentRegime?.name || 'Unknown'}
- Yield Curve: ${yieldCurve.value?.shape || 'Normal'}
- Inflation Expectations: ${inflationData.value?.risk || 'Moderate'}

Top Yield Opportunities:
${yieldOpportunities.slice(0, 5).map(opp => 
    `${opp.symbol}: ${opp.type} - ${opp.yield.toFixed(2)}% yield (${opp.recommendation})`
).join('\n')}

Portfolio Context:
- Risk Level: ${options.riskLevel || 'MODERATE'}
- Target Yield: ${options.targetYield || 6}%
- Portfolio Value: ${options.portfolioValue || 1000000}

Provide strategic income optimization recommendations with top 3 actionable strategies.`;
        
        const aiInsights = await getUniversalAnalysis(aiAnalysisPrompt, {
            isWealthCommand: true,
            maxTokens: 1500
        });
        
        return {
            summary: {
                totalOpportunities: yieldOpportunities.length,
                averageYield: yieldOpportunities.reduce((sum, opp) => sum + opp.yield, 0) / yieldOpportunities.length,
                highYieldCount: yieldOpportunities.filter(opp => opp.yield >= 6).length,
                topCategories: {
                    dividendStocks: yieldOpportunities.filter(opp => opp.type === 'DIVIDEND_STOCK').length,
                    reits: yieldOpportunities.filter(opp => opp.type === 'REIT').length,
                    bonds: yieldOpportunities.filter(opp => opp.type === 'BOND').length
                }
            },
            topOpportunities: yieldOpportunities.slice(0, 10),
            analysisResults: {
                dividends: dividendAnalysis.status === 'fulfilled' ? dividendAnalysis.value : { error: 'Failed' },
                reits: reitAnalysis.status === 'fulfilled' ? reitAnalysis.value : { error: 'Failed' },
                bonds: bondAnalysis.status === 'fulfilled' ? bondAnalysis.value : { error: 'Failed' },
                coveredCalls: coveredCallAnalysis.status === 'fulfilled' ? coveredCallAnalysis.value : { error: 'Failed' }
            },
            marketContext: {
                regime: regimeData.value?.currentRegime?.name || 'Unknown',
                yieldCurveShape: yieldCurve.value?.shape || 'Normal',
                inflationRisk: inflationData.value?.risk || 'Moderate',
                interestRateEnvironment: yieldCurve.value?.signal || 'Neutral'
            },
            portfolioRecommendations: generateYieldPortfolioRecommendations(yieldOpportunities, options),
            aiInsights: aiInsights.response,
            incomeProjections: calculateIncomeProjections(yieldOpportunities.slice(0, 10), options.portfolioValue || 1000000),
            riskAnalysis: analyzeYieldPortfolioRisk(yieldOpportunities, marketData.value),
            analysisDate: new Date().toISOString(),
            dataQuality: {
                dividends: dividendAnalysis.status === 'fulfilled',
                reits: reitAnalysis.status === 'fulfilled',
                bonds: bondAnalysis.status === 'fulfilled',
                market: marketData.status === 'fulfilled'
            }
        };
        
    } catch (error) {
        console.error('Comprehensive yield analysis error:', error.message);
        return {
            error: error.message,
            summary: {
                totalOpportunities: 0,
                averageYield: 0,
                highYieldCount: 0
            },
            recommendations: [
                'Yield analysis failed - check data connections',
                'Consider basic dividend ETFs as fallback',
                'Monitor interest rate environment'
            ],
            analysisDate: new Date().toISOString()
        };
    }
}

// 🎯 GENERATE SAMPLE DATA FUNCTIONS

function generateSampleDividendStocks() {
    const stocks = [
        { symbol: 'JNJ', currentPrice: 165, annualDividend: 4.04, dividendGrowthRate: 0.058, payoutRatio: 0.52, earnings: 7.78, debt: 45000, marketCap: 435000, sector: 'Healthcare', yearsOfGrowth: 15 },
        { symbol: 'KO', currentPrice: 58, annualDividend: 1.84, dividendGrowthRate: 0.035, payoutRatio: 0.71, earnings: 2.59, debt: 40000, marketCap: 250000, sector: 'Consumer Staples', yearsOfGrowth: 25 },
        { symbol: 'PG', currentPrice: 145, annualDividend: 3.65, dividendGrowthRate: 0.047, payoutRatio: 0.64, earnings: 5.70, debt: 35000, marketCap: 345000, sector: 'Consumer Staples', yearsOfGrowth: 20 },
        { symbol: 'MSFT', currentPrice: 420, annualDividend: 3.00, dividendGrowthRate: 0.095, payoutRatio: 0.28, earnings: 10.75, debt: 60000, marketCap: 3100000, sector: 'Technology', yearsOfGrowth: 8 },
        { symbol: 'T', currentPrice: 18, annualDividend: 1.11, dividendGrowthRate: 0.002, payoutRatio: 0.89, earnings: 1.25, debt: 170000, marketCap: 130000, sector: 'Telecommunications', yearsOfGrowth: 12 },
        { symbol: 'VZ', currentPrice: 40, annualDividend: 2.56, dividendGrowthRate: 0.025, payoutRatio: 0.68, earnings: 3.76, debt: 140000, marketCap: 168000, sector: 'Telecommunications', yearsOfGrowth: 18 },
        { symbol: 'XOM', currentPrice: 110, annualDividend: 3.64, dividendGrowthRate: 0.038, payoutRatio: 0.42, earnings: 8.65, debt: 45000, marketCap: 460000, sector: 'Energy', yearsOfGrowth: 6 },
        { symbol: 'WMT', currentPrice: 165, annualDividend: 2.24, dividendGrowthRate: 0.045, payoutRatio: 0.41, earnings: 5.47, debt: 55000, marketCap: 540000, sector: 'Consumer Staples', yearsOfGrowth: 22 }
    ];
    
    return stocks;
}

function generateSampleREITs() {
    const reits = [
        { symbol: 'O', currentPrice: 55, annualDividend: 2.97, ffo: 3.85, navPerShare: 58, occupancyRate: 0.98, debtToEquity: 0.45, sector: 'Retail', geographicFocus: 'US' },
        { symbol: 'PLD', currentPrice: 125, annualDividend: 2.64, ffo: 4.20, navPerShare: 130, occupancyRate: 0.97, debtToEquity: 0.35, sector: 'Industrial', geographicFocus: 'Global' },
        { symbol: 'EQIX', currentPrice: 785, annualDividend: 14.40, ffo: 32.50, navPerShare: 820, occupancyRate: 0.91, debtToEquity: 0.55, sector: 'Data Centers', geographicFocus: 'Global' },
        { symbol: 'VTR', currentPrice: 47, annualDividend: 1.80, ffo: 3.15, navPerShare: 52, occupancyRate: 0.89, debtToEquity: 0.62, sector: 'Healthcare', geographicFocus: 'US' },
        { symbol: 'SPG', currentPrice: 115, annualDividend: 4.96, ffo: 11.20, navPerShare: 125, occupancyRate: 0.93, debtToEquity: 0.58, sector: 'Retail Malls', geographicFocus: 'US' }
    ];
    
    return reits;
}

function generateSampleBonds() {
    const bonds = [
        { symbol: 'US10Y', currentPrice: 98.5, couponRate: 0.045, maturityYears: 10, creditRating: 'AAA', duration: 8.2, issuer: 'US Treasury', faceValue: 1000 },
        { symbol: 'AAPL_BOND', currentPrice: 102.3, couponRate: 0.035, maturityYears: 7, creditRating: 'AA+', duration: 6.1, issuer: 'Corporate', faceValue: 1000 },
        { symbol: 'JNJ_BOND', currentPrice: 99.8, couponRate: 0.038, maturityYears: 5, creditRating: 'AAA', duration: 4.6, issuer: 'Corporate', faceValue: 1000 },
        { symbol: 'HYG_BOND', currentPrice: 94.2, couponRate: 0.065, maturityYears: 6, creditRating: 'BB', duration: 4.2, issuer: 'High Yield', faceValue: 1000 },
        { symbol: 'TIPS_10Y', currentPrice: 101.2, couponRate: 0.025, maturityYears: 10, creditRating: 'AAA', duration: 7.8, issuer: 'TIPS', faceValue: 1000 }
    ];
    
    return bonds;
}

// 🎯 ANALYSIS HELPER FUNCTIONS

function generateYieldPortfolioRecommendations(opportunities, options) {
    const recommendations = [];
    const riskLevel = options.riskLevel || 'MODERATE';
    const targetYield = options.targetYield || 6;
    
    // High-yield opportunities
    const highYieldOpps = opportunities.filter(opp => opp.yield >= targetYield);
    if (highYieldOpps.length > 0) {
        recommendations.push({
            type: 'HIGH_YIELD_FOCUS',
            priority: 'HIGH',
            message: `${highYieldOpps.length} opportunities above ${targetYield}% yield target`,
            assets: highYieldOpps.slice(0, 3).map(opp => `${opp.symbol} (${opp.yield.toFixed(2)}%)`),
            action: 'PRIORITIZE_ALLOCATION'
        });
    }
    
    // Diversification by asset type
    const assetTypes = [...new Set(opportunities.map(opp => opp.type))];
    if (assetTypes.length >= 3) {
        recommendations.push({
            type: 'ASSET_DIVERSIFICATION',
            priority: 'MODERATE',
            message: `Good diversification across ${assetTypes.length} asset types`,
            action: 'MAINTAIN_BALANCE'
        });
    } else {
        recommendations.push({
            type: 'DIVERSIFICATION_NEEDED',
            priority: 'HIGH',
            message: 'Limited asset type diversification - consider expanding',
            action: 'ADD_ASSET_CLASSES'
        });
    }
    
    // Risk-adjusted recommendations
    const lowRiskOpps = opportunities.filter(opp => opp.risk === 'LOW' || opp.risk === 'MINIMAL');
    if (riskLevel === 'CONSERVATIVE' && lowRiskOpps.length < 5) {
        recommendations.push({
            type: 'RISK_ALIGNMENT',
            priority: 'HIGH',
            message: 'Need more low-risk opportunities for conservative profile',
            action: 'INCREASE_CONSERVATIVE_ALLOCATION'
        });
    }
    
    return recommendations;
}

function calculateIncomeProjections(opportunities, portfolioValue) {
    const avgYield = opportunities.reduce((sum, opp) => sum + opp.yield, 0) / opportunities.length / 100;
    
    const projections = [];
    for (let year = 1; year <= 5; year++) {
        const growthRate = 0.03; // 3% annual growth assumption
        const adjustedYield = avgYield * Math.pow(1 + growthRate, year - 1);
        const annualIncome = portfolioValue * adjustedYield;
        
        projections.push({
            year: year,
            annualIncome: annualIncome,
            monthlyIncome: annualIncome / 12,
            quarterlyIncome: annualIncome / 4,
            yieldRate: adjustedYield * 100
        });
    }
    
    return {
        projections: projections,
        currentYield: avgYield * 100,
        totalFiveYearIncome: projections.reduce((sum, p) => sum + p.annualIncome, 0),
        averageMonthlyIncome: projections.reduce((sum, p) => sum + p.monthlyIncome, 0) / 5
    };
}

function analyzeYieldPortfolioRisk(opportunities, marketData) {
    const riskLevels = opportunities.map(opp => opp.risk);
    const riskCounts = { LOW: 0, MODERATE: 0, HIGH: 0, MINIMAL: 0 };
    
    riskLevels.forEach(risk => {
        if (riskCounts.hasOwnProperty(risk)) {
            riskCounts[risk]++;
        }
    });
    
    const total = opportunities.length;
    const highRiskPercent = ((riskCounts.HIGH || 0) / total) * 100;
    const lowRiskPercent = ((riskCounts.LOW + riskCounts.MINIMAL || 0) / total) * 100;
    
    let overallRisk = 'MODERATE';
    if (highRiskPercent > 40) overallRisk = 'HIGH';
    else if (lowRiskPercent > 60) overallRisk = 'LOW';
    
    // Interest rate sensitivity
    const interestRateSensitivity = calculateInterestRateSensitivity(opportunities, marketData);
    
    return {
        overallRisk: overallRisk,
        riskDistribution: riskCounts,
        highRiskPercentage: highRiskPercent,
        lowRiskPercentage: lowRiskPercent,
        interestRateSensitivity: interestRateSensitivity,
        recommendations: generateRiskRecommendations(overallRisk, highRiskPercent, interestRateSensitivity)
    };
}

function calculateInterestRateSensitivity(opportunities, marketData) {
    const rateSensitiveTypes = ['BOND', 'REIT'];
    const sensitiveAssets = opportunities.filter(opp => rateSensitiveTypes.includes(opp.type));
    const sensitivityPercent = (sensitiveAssets.length / opportunities.length) * 100;
    
    if (sensitivityPercent > 60) return 'HIGH';
    if (sensitivityPercent > 30) return 'MODERATE';
    return 'LOW';
}

function generateRiskRecommendations(overallRisk, highRiskPercent, interestRateSensitivity) {
    const recommendations = [];
    
    if (overallRisk === 'HIGH') {
        recommendations.push('Consider reducing allocation to high-risk yield investments');
    }
    
    if (highRiskPercent > 30) {
        recommendations.push('Portfolio has significant concentration in high-risk assets');
    }
    
    if (interestRateSensitivity === 'HIGH') {
        recommendations.push('High interest rate sensitivity - monitor Fed policy closely');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Risk profile appears well-balanced for yield generation');
    }
    
    return recommendations;
}

// 🎯 INCOME LADDER BUILDER
class IncomeLadderBuilder {
    constructor() {
        this.ladderTypes = {
            BOND_LADDER: 'Bond Maturity Ladder',
            CD_LADDER: 'Certificate of Deposit Ladder',
            DIVIDEND_LADDER: 'Dividend Growth Ladder',
            MIXED_LADDER: 'Mixed Income Ladder'
        };
    }
    
    // 🪜 BUILD BOND LADDER
    buildBondLadder(initialInvestment, years, targetYield) {
        const ladder = [];
        const investmentPerYear = initialInvestment / years;
        
        for (let year = 1; year <= years; year++) {
            const maturityYield = targetYield + (year * 0.002); // Yield curve premium
            const annualIncome = investmentPerYear * maturityYield;
            
            ladder.push({
                year: year,
                investment: investmentPerYear,
                maturityYear: new Date().getFullYear() + year,
                estimatedYield: maturityYield * 100,
                annualIncome: annualIncome,
                principal: investmentPerYear,
                totalReturn: investmentPerYear + (annualIncome * year)
            });
        }
        
        return {
            ladder: ladder,
            totalInvestment: initialInvestment,
            averageYield: ladder.reduce((sum, rung) => sum + rung.estimatedYield, 0) / years,
            totalIncome: ladder.reduce((sum, rung) => sum + rung.annualIncome, 0),
            maturitySchedule: ladder.map(rung => ({
                year: rung.maturityYear,
                amount: rung.principal
            }))
        };
    }
    
    // 📈 BUILD DIVIDEND GROWTH LADDER
    buildDividendGrowthLadder(stocks, initialInvestment) {
        const ladder = [];
        const investmentPerStock = initialInvestment / stocks.length;
        
        stocks.forEach((stock, index) => {
            const shares = investmentPerStock / stock.currentPrice;
            const currentAnnualDividend = shares * stock.annualDividend;
            
            // Project dividend growth over 10 years
            const projectedDividends = [];
            let dividend = stock.annualDividend;
            
            for (let year = 1; year <= 10; year++) {
                dividend *= (1 + stock.dividendGrowthRate);
                projectedDividends.push({
                    year: year,
                    dividendPerShare: dividend,
                    totalDividends: shares * dividend,
                    yieldOnCost: (dividend / stock.currentPrice) * 100
                });
            }
            
            ladder.push({
                symbol: stock.symbol,
                investment: investmentPerStock,
                shares: shares,
                currentPrice: stock.currentPrice,
                currentYield: stock.annualDividend / stock.currentPrice,
                growthRate: stock.dividendGrowthRate,
                currentAnnualIncome: currentAnnualDividend,
                projectedDividends: projectedDividends,
                tenYearYieldOnCost: projectedDividends[9].yieldOnCost
            });
        });
        
        return {
            ladder: ladder,
            totalInvestment: initialInvestment,
            currentTotalIncome: ladder.reduce((sum, rung) => sum + rung.currentAnnualIncome, 0),
            projectedTenYearIncome: ladder.reduce((sum, rung) => 
                sum + rung.projectedDividends[9].totalDividends, 0),
            averageCurrentYield: ladder.reduce((sum, rung) => sum + rung.currentYield, 0) / ladder.length * 100,
            averageTenYearYieldOnCost: ladder.reduce((sum, rung) => sum + rung.tenYearYieldOnCost, 0) / ladder.length
        };
    }
}

// 🎯 EXPORT ALL YIELD FUNCTIONS
module.exports = {
    // Main Functions
    getComprehensiveYieldAnalysis,
    
    // Classes
    YieldStrategyAnalyzer,
    IncomeLadderBuilder,
    
    // Utility Functions
    generateSampleDividendStocks,
    generateSampleREITs,
    generateSampleBonds,
    generateYieldPortfolioRecommendations,
    calculateIncomeProjections,
    analyzeYieldPortfolioRisk
};// 🏆 WEALTH MODULE 3: YIELD GENERATION & INCOME OPTIMIZATION
// Advanced yield farming, dividend optimization, and income strategies

// 🏆 WEALTH MODULE 4: ARBITRAGE & MARKET INEFFICIENCY DETECTION
// Advanced arbitrage detection and statistical arbitrage strategies

// 🎯 ARBITRAGE OPPORTUNITY SCANNER
class ArbitrageOpportunityScanner {
    constructor() {
        this.arbitrageTypes = {
            PRICE_ARBITRAGE: 'Pure Price Arbitrage',
            STATISTICAL_ARBITRAGE: 'Statistical Arbitrage',
            MERGER_ARBITRAGE: 'Merger Arbitrage',
            CALENDAR_ARBITRAGE: 'Calendar Spread Arbitrage',
            VOLATILITY_ARBITRAGE: 'Volatility Arbitrage',
            CARRY_TRADE: 'Currency Carry Trade',
            ETF_ARBITRAGE: 'ETF Creation/Redemption',
            CONVERTIBLE_ARBITRAGE: 'Convertible Bond Arbitrage',
            FIXED_INCOME_ARBITRAGE: 'Fixed Income Arbitrage',
            CRYPTO_ARBITRAGE: 'Cryptocurrency Arbitrage'
        };
        
        this.riskProfiles = {
            LOW_RISK: { maxDrawdown: 0.02, minSharpe: 2.0, maxLeverage: 2 },
            MODERATE_RISK: { maxDrawdown: 0.05, minSharpe: 1.5, maxLeverage: 4 },
            HIGH_RISK: { maxDrawdown: 0.10, minSharpe: 1.0, maxLeverage: 8 }
        };
        
        this.minProfitThresholds = {
            INSTANT: 0.001, // 0.1% for instant arbitrage
            SHORT_TERM: 0.005, // 0.5% for short-term
            MEDIUM_TERM: 0.02, // 2% for medium-term
            LONG_TERM: 0.05 // 5% for long-term
        };
    }
    
    // 💰 PRICE ARBITRAGE SCANNER
    async scanPriceArbitrageOpportunities(assetPrices, exchanges = []) {
        try {
            const opportunities = [];
            
            // Cross-exchange arbitrage detection
            for (const [asset, priceData] of Object.entries(assetPrices)) {
                if (!priceData.exchanges || Object.keys(priceData.exchanges).length < 2) continue;
                
                const exchangePrices = Object.entries(priceData.exchanges);
                
                // Find highest and lowest prices
                const sortedPrices = exchangePrices.sort((a, b) => b[1].price - a[1].price);
                const highestPrice = sortedPrices[0];
                const lowestPrice = sortedPrices[sortedPrices.length - 1];
                
                const priceDifference = highestPrice[1].price - lowestPrice[1].price;
                const percentageDifference = priceDifference / lowestPrice[1].price;
                
                // Calculate potential profit after fees
                const tradingFees = this.calculateTradingFees(
                    lowestPrice[1].price, 
                    highestPrice[1].price, 
                    lowestPrice[0], 
                    highestPrice[0]
                );
                
                const netProfit = priceDifference - tradingFees.totalFees;
                const netProfitPercentage = netProfit / lowestPrice[1].price;
                
                if (netProfitPercentage >= this.minProfitThresholds.INSTANT) {
                    opportunities.push({
                        asset: asset,
                        type: 'PRICE_ARBITRAGE',
                        buyExchange: lowestPrice[0],
                        sellExchange: highestPrice[0],
                        buyPrice: lowestPrice[1].price,
                        sellPrice: highestPrice[1].price,
                        priceDifference: priceDifference,
                        percentageDifference: percentageDifference * 100,
                        tradingFees: tradingFees,
                        netProfit: netProfit,
                        netProfitPercentage: netProfitPercentage * 100,
                        volume: Math.min(lowestPrice[1].volume, highestPrice[1].volume),
                        timeWindow: 'INSTANT',
                        riskLevel: 'LOW',
                        confidence: this.calculateArbitrageConfidence(netProfitPercentage, 'PRICE'),
                        executionComplexity: 'SIMPLE'
                    });
                }
            }
            
            return {
                opportunities: opportunities.sort((a, b) => b.netProfitPercentage - a.netProfitPercentage),
                totalOpportunities: opportunities.length,
                averageProfit: opportunities.length > 0 ? 
                    opportunities.reduce((sum, opp) => sum + opp.netProfitPercentage, 0) / opportunities.length : 0,
                highProfitCount: opportunities.filter(opp => opp.netProfitPercentage >= 1).length,
                scanType: 'PRICE_ARBITRAGE',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Price arbitrage scan error:', error.message);
            return { error: error.message, opportunities: [] };
        }
    }
    
    // 📊 STATISTICAL ARBITRAGE SCANNER
    async scanStatisticalArbitrageOpportunities(assetPairs, historicalData) {
        try {
            const opportunities = [];
            
            for (const pair of assetPairs) {
                const analysis = await this.analyzeStatisticalArbitrage(pair, historicalData);
                if (analysis && !analysis.error && analysis.signal !== 'NEUTRAL') {
                    opportunities.push(analysis);
                }
            }
            
            return {
                opportunities: opportunities.sort((a, b) => b.zscore - a.zscore),
                totalOpportunities: opportunities.length,
                longOpportunities: opportunities.filter(opp => opp.signal === 'LONG').length,
                shortOpportunities: opportunities.filter(opp => opp.signal === 'SHORT').length,
                averageZScore: opportunities.length > 0 ? 
                    opportunities.reduce((sum, opp) => sum + Math.abs(opp.zscore), 0) / opportunities.length : 0,
                scanType: 'STATISTICAL_ARBITRAGE',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Statistical arbitrage scan error:', error.message);
            return { error: error.message, opportunities: [] };
        }
    }
    
    // 🔄 ANALYZE STATISTICAL ARBITRAGE PAIR
    async analyzeStatisticalArbitrage(pair, historicalData) {
        try {
            const { asset1, asset2 } = pair;
            
            if (!historicalData[asset1] || !historicalData[asset2]) {
                return { error: `Missing data for ${asset1} or ${asset2}` };
            }
            
            const prices1 = historicalData[asset1].prices;
            const prices2 = historicalData[asset2].prices;
            
            // Ensure equal length arrays
            const minLength = Math.min(prices1.length, prices2.length);
            const alignedPrices1 = prices1.slice(-minLength);
            const alignedPrices2 = prices2.slice(-minLength);
            
            // Calculate price ratio
            const priceRatios = alignedPrices1.map((price1, i) => price1 / alignedPrices2[i]);
            
            // Calculate statistics
            const meanRatio = priceRatios.reduce((sum, ratio) => sum + ratio, 0) / priceRatios.length;
            const variance = priceRatios.reduce((sum, ratio) => sum + Math.pow(ratio - meanRatio, 2), 0) / priceRatios.length;
            const standardDeviation = Math.sqrt(variance);
            
            const currentRatio = alignedPrices1[alignedPrices1.length - 1] / alignedPrices2[alignedPrices2.length - 1];
            const zscore = (currentRatio - meanRatio) / standardDeviation;
            
            // Calculate correlation
            const correlation = this.calculateCorrelation(alignedPrices1, alignedPrices2);
            
            // Calculate cointegration (simplified)
            const cointegrationScore = this.calculateCointegrationScore(alignedPrices1, alignedPrices2);
            
            // Generate trading signal
            let signal = 'NEUTRAL';
            let confidence = 0;
            
            if (Math.abs(zscore) >= 2 && correlation > 0.7 && cointegrationScore > 0.6) {
                signal = zscore > 0 ? 'SHORT' : 'LONG';
                confidence = Math.min(95, Math.abs(zscore) * 30);
            }
            
            // Calculate expected profit
            const expectedProfit = this.calculateExpectedProfitStatArb(zscore, standardDeviation, meanRatio);
            
            return {
                asset1: asset1,
                asset2: asset2,
                type: 'STATISTICAL_ARBITRAGE',
                currentRatio: currentRatio,
                meanRatio: meanRatio,
                standardDeviation: standardDeviation,
                zscore: zscore,
                correlation: correlation,
                cointegrationScore: cointegrationScore,
                signal: signal,
                confidence: confidence,
                expectedProfit: expectedProfit,
                riskLevel: Math.abs(zscore) > 3 ? 'HIGH' : Math.abs(zscore) > 2 ? 'MODERATE' : 'LOW',
                timeHorizon: this.estimateReversion Time(zscore),
                leverageRecommendation: this.calculateOptimalLeverage(zscore, correlation),
                stopLoss: this.calculateStatArbStopLoss(zscore, standardDeviation),
                targetProfit: this.calculateStatArbTarget(zscore, standardDeviation)
            };
        } catch (error) {
            console.error(`Statistical arbitrage analysis error for ${pair.asset1}-${pair.asset2}:`, error.message);
            return { error: error.message, asset1: pair.asset1, asset2: pair.asset2 };
        }
    }
    
    // 🤝 MERGER ARBITRAGE SCANNER
    async scanMergerArbitrageOpportunities(mergerDeals) {
        try {
            const opportunities = [];
            
            for (const deal of mergerDeals) {
                const analysis = await this.analyzeMergerArbitrage(deal);
                if (analysis && !analysis.error) {
                    opportunities.push(analysis);
                }
            }
            
            return {
                opportunities: opportunities.sort((a, b) => b.annualizedReturn - a.annualizedReturn),
                totalOpportunities: opportunities.length,
                cashDeals: opportunities.filter(opp => opp.dealType === 'CASH').length,
                stockDeals: opportunities.filter(opp => opp.dealType === 'STOCK').length,
                averageSpread: opportunities.length > 0 ? 
                    opportunities.reduce((sum, opp) => sum + opp.spread, 0) / opportunities.length : 0,
                averageAnnualizedReturn: opportunities.length > 0 ? 
                    opportunities.reduce((sum, opp) => sum + opp.annualizedReturn, 0) / opportunities.length : 0,
                scanType: 'MERGER_ARBITRAGE',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Merger arbitrage scan error:', error.message);
            return { error: error.message, opportunities: [] };
        }
    }
    
    // 🤝 ANALYZE MERGER ARBITRAGE DEAL
    async analyzeMergerArbitrage(deal) {
        try {
            const {
                targetSymbol,
                acquirerSymbol,
                targetPrice,
                acquirerPrice,
                offerPrice,
                offerType, // 'CASH', 'STOCK', 'MIXED'
                exchangeRatio,
                expectedCloseDate,
                dealProbability = 0.85,
                regulatoryRisk = 'MODERATE'
            } = deal;
            
            let impliedValue = 0;
            let dealType = offerType;
            
            // Calculate implied value based on deal structure
            if (offerType === 'CASH') {
                impliedValue = offerPrice;
            } else if (offerType === 'STOCK') {
                impliedValue = acquirerPrice * exchangeRatio;
            } else if (offerType === 'MIXED') {
                // Simplified mixed deal calculation
                impliedValue = (offerPrice * 0.5) + (acquirerPrice * exchangeRatio * 0.5);
            }
            
            const spread = ((impliedValue - targetPrice) / targetPrice) * 100;
            const daysToClose = Math.max(1, Math.ceil((new Date(expectedCloseDate) - new Date()) / (1000 * 60 * 60 * 24)));
            const annualizedReturn = (spread / daysToClose) * 365;
            
            // Risk assessment
            const riskScore = this.assessMergerRisk(regulatoryRisk, daysToClose, spread, dealProbability);
            const riskAdjustedReturn = annualizedReturn * dealProbability;
            
            // Downside risk calculation
            const downsideRisk = this.calculateMergerDownsideRisk(targetPrice, spread, dealProbability);
            
            return {
                targetSymbol: targetSymbol,
                acquirerSymbol: acquirerSymbol,
                type: 'MERGER_ARBITRAGE',
                dealType: dealType,
                targetPrice: targetPrice,
                impliedValue: impliedValue,
                spread: spread,
                annualizedReturn: annualizedReturn,
                riskAdjustedReturn: riskAdjustedReturn,
                daysToClose: daysToClose,
                dealProbability: dealProbability,
                regulatoryRisk: regulatoryRisk,
                riskScore: riskScore,
                downsideRisk: downsideRisk,
                upside: spread,
                downside: downsideRisk.maxLoss,
                riskRewardRatio: spread / Math.abs(downsideRisk.maxLoss),
                recommendation: this.getMergerArbitrageRecommendation(riskAdjustedReturn, riskScore, spread),
                confidence: dealProbability * 100
            };
        } catch (error) {
            console.error(`Merger arbitrage analysis error for ${deal.targetSymbol}:`, error.message);
            return { error: error.message, targetSymbol: deal.targetSymbol };
        }
    }
    
    // 💱 CURRENCY CARRY TRADE SCANNER
    async scanCarryTradeOpportunities(currencyPairs, interestRates) {
        try {
            const opportunities = [];
            
            for (const pair of currencyPairs) {
                const analysis = await this.analyzeCarryTrade(pair, interestRates);
                if (analysis && !analysis.error && analysis.carryYield > 0.02) {
                    opportunities.push(analysis);
                }
            }
            
            return {
                opportunities: opportunities.sort((a, b) => b.riskAdjustedCarry - a.riskAdjustedCarry),
                totalOpportunities: opportunities.length,
                averageCarryYield: opportunities.length > 0 ? 
                    opportunities.reduce((sum, opp) => sum + opp.carryYield, 0) / opportunities.length * 100 : 0,
                highYieldCount: opportunities.filter(opp => opp.carryYield > 0.05).length,
                scanType: 'CARRY_TRADE',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Carry trade scan error:', error.message);
            return { error: error.message, opportunities: [] };
        }
    }
    
    // 💱 ANALYZE CARRY TRADE
    async analyzeCarryTrade(pair, interestRates) {
        try {
            const { baseCurrency, quoteCurrency, currentRate, volatility } = pair;
            
            const baseRate = interestRates[baseCurrency] || 0;
            const quoteRate = interestRates[quoteCurrency] || 0;
            
            const carryYield = baseRate - quoteRate;
            const annualizedCarry = carryYield;
            
            // Risk assessment
            const riskScore = this.assessCarryTradeRisk(volatility, carryYield);
            const riskAdjustedCarry = carryYield / (volatility + 0.01); // Add small constant to avoid division by zero
            
            // Momentum factor
            const momentumScore = this.calculateCurrencyMomentum(pair);
            
            // Overall score
            const overallScore = (riskAdjustedCarry * 0.5) + (momentumScore * 0.3) + (carryYield * 0.2);
            
            return {
                baseCurrency: baseCurrency,
                quoteCurrency: quoteCurrency,
                type: 'CARRY_TRADE',
                currentRate: currentRate,
                baseInterestRate: baseRate * 100,
                quoteInterestRate: quoteRate * 100,
                carryYield: carryYield,
                annualizedCarry: annualizedCarry * 100,
                volatility: volatility * 100,
                riskScore: riskScore,
                riskAdjustedCarry: riskAdjustedCarry,
                momentumScore: momentumScore,
                overallScore: overallScore,
                recommendation: this.getCarryTradeRecommendation(carryYield, riskScore, momentumScore),
                expectedAnnualReturn: annualizedCarry * 100,
                maxDrawdownRisk: volatility * 2 * 100, // 2x volatility as max drawdown estimate
                optimalLeverage: this.calculateCarryTradeLeverage(carryYield, volatility)
            };
        } catch (error) {
            console.error(`Carry trade analysis error for ${pair.baseCurrency}/${pair.quoteCurrency}:`, error.message);
            return { error: error.message };
        }
    }
    
    // 📈 ETF ARBITRAGE SCANNER
    async scanETFArbitrageOpportunities(etfData) {
        try {
            const opportunities = [];
            
            for (const etf of etfData) {
                const analysis = await this.analyzeETFArbitrage(etf);
                if (analysis && !analysis.error && Math.abs(analysis.premiumDiscount) >= 0.5) {
                    opportunities.push(analysis);
                }
            }
            
            return {
                opportunities: opportunities.sort((a, b) => Math.abs(b.premiumDiscount) - Math.abs(a.premiumDiscount)),
                totalOpportunities: opportunities.length,
                premiumOpportunities: opportunities.filter(opp => opp.premiumDiscount > 0).length,
                discountOpportunities: opportunities.filter(opp => opp.premiumDiscount < 0).length,
                averagePremiumDiscount: opportunities.length > 0 ? 
                    opportunities.reduce((sum, opp) => sum + opp.premiumDiscount, 0) / opportunities.length : 0,
                scanType: 'ETF_ARBITRAGE',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('ETF arbitrage scan error:', error.message);
            return { error: error.message, opportunities: [] };
        }
    }
    
    // 📈 ANALYZE ETF ARBITRAGE
    async analyzeETFArbitrage(etf) {
        try {
            const {
                symbol,
                marketPrice,
                nav, // Net Asset Value
                volume,
                creationUnit,
                holdings
            } = etf;
            
            const premiumDiscount = ((marketPrice - nav) / nav) * 100;
            const liquidityScore = this.calculateETFLiquidity(volume, creationUnit);
            
            // Arbitrage feasibility
            const arbitrageFeasible = Math.abs(premiumDiscount) >= 0.5 && liquidityScore > 60;
            
            // Calculate potential profit
            const potentialProfit = Math.abs(premiumDiscount);
            const tradingCosts = this.calculateETFTradingCosts(marketPrice, volume);
            const netProfit = potentialProfit - tradingCosts;
            
            let strategy = 'NONE';
            if (premiumDiscount > 0.5) {
                strategy = 'SELL_ETF_BUY_BASKET'; // ETF trading at premium
            } else if (premiumDiscount < -0.5) {
                strategy = 'BUY_ETF_SELL_BASKET'; // ETF trading at discount
            }
            
            return {
                symbol: symbol,
                type: 'ETF_ARBITRAGE',
                marketPrice: marketPrice,
                nav: nav,
                premiumDiscount: premiumDiscount,
                liquidityScore: liquidityScore,
                arbitrageFeasible: arbitrageFeasible,
                potentialProfit: potentialProfit,
                tradingCosts: tradingCosts,
                netProfit: netProfit,
                strategy: strategy,
                riskLevel: liquidityScore > 80 ? 'LOW' : liquidityScore > 60 ? 'MODERATE' : 'HIGH',
                timeHorizon: 'INTRADAY',
                capitalRequirement: this.calculateETFCapitalRequirement(marketPrice, creationUnit),
                recommendation: netProfit > 0.2 ? 'EXECUTE' : netProfit > 0 ? 'CONSIDER' : 'AVOID'
            };
        } catch (error) {
            console.error(`ETF arbitrage analysis error for ${etf.symbol}:`, error.message);
            return { error: error.message, symbol: etf.symbol };
        }
    }
    
    // 🔧 HELPER CALCULATION METHODS
    
    calculateTradingFees(buyPrice, sellPrice, buyExchange, sellExchange) {
        const exchangeFees = {
            'BINANCE': 0.001,
            'COINBASE': 0.005,
            'KRAKEN': 0.0026,
            'NYSE': 0.0001,
            'NASDAQ': 0.0001
        };
        
        const buyFee = buyPrice * (exchangeFees[buyExchange] || 0.002);
        const sellFee = sellPrice * (exchangeFees[sellExchange] || 0.002);
        const networkFee = 0.01; // Simplified network/transfer fee
        
        return {
            buyFee: buyFee,
            sellFee: sellFee,
            networkFee: networkFee,
            totalFees: buyFee + sellFee + networkFee
        };
    }
    
    calculateArbitrageConfidence(profitPercentage, type) {
        let baseConfidence = 50;
        
        if (type === 'PRICE') {
            baseConfidence = Math.min(95, 50 + (profitPercentage * 1000));
        } else if (type === 'STATISTICAL') {
            baseConfidence = Math.min(90, 30 + (profitPercentage * 500));
        }
        
        return Math.max(10, baseConfidence);
    }
    
    calculateCorrelation(prices1, prices2) {
        const n = Math.min(prices1.length, prices2.length);
        
        const mean1 = prices1.slice(0, n).reduce((sum, p) => sum + p, 0) / n;
        const mean2 = prices2.slice(0, n).reduce((sum, p) => sum + p, 0) / n;
        
        let numerator = 0;
        let sum1Sq = 0;
        let sum2Sq = 0;
        
        for (let i = 0; i < n; i++) {
            const diff1 = prices1[i] - mean1;
            const diff2 = prices2[i] - mean2;
            
            numerator += diff1 * diff2;
            sum1Sq += diff1 * diff1;
            sum2Sq += diff2 * diff2;
        }
        
        const denominator = Math.sqrt(sum1Sq * sum2Sq);
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    calculateCointegrationScore(prices1, prices2) {
        // Simplified cointegration test (Engle-Granger approach)
        const ratios = prices1.map((p1, i) => p1 / prices2[i]);
        const meanRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
        
        // Calculate residuals from mean
        const residuals = ratios.map(r => r - meanRatio);
        
        // Test for stationarity (simplified)
        let stationarityScore = 0;
        for (let i = 1; i < residuals.length; i++) {
            if (Math.abs(residuals[i]) < Math.abs(residuals[i-1])) {
                stationarityScore++;
            }
        }
        
        return stationarityScore / (residuals.length - 1);
    }
    
    calculateExpectedProfitStatArb(zscore, standardDeviation, meanRatio) {
        // Expected profit assuming mean reversion
        const expectedReversion = Math.abs(zscore) * standardDeviation;
        const profitProbability = Math.min(0.9, Math.abs(zscore) / 3);
        
        return {
            expectedProfit: expectedReversion * profitProbability,
            profitProbability: profitProbability,
            expectedReturn: (expectedReversion / meanRatio) * profitProbability * 100
        };
    }
    
    estimateReversionTime(zscore) {
        // Estimate time for mean reversion based on z-score magnitude
        const baseTime = 5; // 5 days base
        const timeMultiplier = Math.max(0.5, 3 - Math.abs(zscore));
        
        return Math.round(baseTime * timeMultiplier);
    }
    
    calculateOptimalLeverage(zscore, correlation) {
        // Kelly Criterion inspired leverage calculation
        const maxLeverage = 5;
        const baseLeverage = Math.min(maxLeverage, Math.abs(zscore) * correlation);
        
        return Math.max(1, Math.round(baseLeverage * 10) / 10);
    }
    
    calculateStatArbStopLoss(zscore, standardDeviation) {
        // Stop loss at 1.5 standard deviations beyond current z-score
        const stopLossZScore = zscore + (zscore > 0 ? 1.5 : -1.5);
        return stopLossZScore * standardDeviation;
    }
    
    calculateStatArbTarget(zscore, standardDeviation) {
        // Target profit at mean reversion (z-score = 0)
        return Math.abs(zscore) * standardDeviation * 0.8; // 80% of full reversion
    }
    
    // 🤝 MERGER ARBITRAGE HELPERS
    
    assessMergerRisk(regulatoryRisk, daysToClose, spread, dealProbability) {
        let riskScore = 50; // Base risk score
        
        // Regulatory risk adjustment
        const regRiskMap = { 'LOW': -10, 'MODERATE': 0, 'HIGH': 15, 'VERY_HIGH': 25 };
        riskScore += regRiskMap[regulatoryRisk] || 0;
        
        // Time risk adjustment
        if (daysToClose > 365) riskScore += 15;
        else if (daysToClose > 180) riskScore += 10;
        else if (daysToClose < 30) riskScore += 5;
        
        // Spread risk adjustment
        if (spread < 2) riskScore += 10; // Low spread = higher risk
        if (spread > 20) riskScore += 15; // Very high spread = suspicious
        
        // Deal probability adjustment
        riskScore += (1 - dealProbability) * 50;
        
        return Math.max(0, Math.min(100, riskScore));
    }
    
    calculateMergerDownsideRisk(targetPrice, spread, dealProbability) {
        const dealFailureProbability = 1 - dealProbability;
        
        // Estimate stock price drop if deal fails (typically 10-30%)
        const estimatedDrop = 0.15 + (spread / 100 * 0.5); // Higher spread = higher drop risk
        const maxLoss = targetPrice * estimatedDrop * dealFailureProbability;
        
        return {
            maxLoss: maxLoss,
            maxLossPercentage: estimatedDrop * dealFailureProbability * 100,
            probability: dealFailureProbability
        };
    }
    
    getMergerArbitrageRecommendation(riskAdjustedReturn, riskScore, spread) {
        if (riskAdjustedReturn > 15 && riskScore < 60 && spread > 3) return 'STRONG_BUY';
        if (riskAdjustedReturn > 10 && riskScore < 70) return 'BUY';
        if (riskAdjustedReturn > 5 && riskScore < 80) return 'CONSIDER';
        return 'AVOID';
    }
    
    // 💱 CARRY TRADE HELPERS
    
    assessCarryTradeRisk(volatility, carryYield) {
        // Risk increases with volatility and decreases with carry yield
        const volatilityRisk = volatility * 100;
        const carryBenefit = Math.abs(carryYield) * 20;
        
        return Math.max(0, Math.min(100, volatilityRisk - carryBenefit + 30));
    }
    
    calculateCurrencyMomentum(pair) {
        // Simplified momentum calculation (would use actual price history)
        return Math.random() * 2 - 1; // Placeholder: -1 to 1
    }
    
    getCarryTradeRecommendation(carryYield, riskScore, momentumScore) {
        const overallScore = carryYield * 100 - riskScore + (momentumScore * 10);
        
        if (overallScore > 5 && carryYield > 0.03) return 'STRONG_BUY';
        if (overallScore > 2 && carryYield > 0.02) return 'BUY';
        if (overallScore > 0) return 'CONSIDER';
        return 'AVOID';
    }
    
    calculateCarryTradeLeverage(carryYield, volatility) {
        // Optimal leverage based on Kelly Criterion principles
        const maxLeverage = 10;
        const kellyLeverage = carryYield / (volatility * volatility);
        
        return Math.max(1, Math.min(maxLeverage, kellyLeverage * 0.5)); // Conservative Kelly
    }
    
    // 📈 ETF ARBITRAGE HELPERS
    
    calculateETFLiquidity(volume, creationUnit) {
        const volumeScore = Math.min(50, volume / 1000000 * 25); // Max 50 points for volume
        const creationScore = creationUnit < 100000 ? 30 : creationUnit < 500000 ? 20 : 10;
        
        return volumeScore + creationScore + 20; // Base score of 20
    }
    
    calculateETFTradingCosts(price, volume) {
        const bidAskSpread = price * 0.001; // 0.1% spread estimate
        const marketImpact = volume < 1000000 ? 0.002 : 0.001; // Market impact
        const commissions = 0.01; // Fixed commission
        
        return bidAskSpread + (price * marketImpact) + commissions;
    }
    
    calculateETFCapitalRequirement(price, creationUnit) {
        return price * creationUnit;
    }
}

// 🎯 MARKET INEFFICIENCY DETECTOR
class MarketInefficiencyDetector {
    constructor() {
        this.inefficiencyTypes = {
            MOMENTUM_ANOMALY: 'Price Momentum Anomaly',
            REVERSAL_ANOMALY: 'Mean Reversion Anomaly',
            SEASONAL_ANOMALY: 'Seasonal Pattern Anomaly',
            EVENT_ANOMALY: 'Event-Driven Anomaly',
            CORRELATION_BREAKDOWN: 'Correlation Breakdown',
            VOLATILITY_ANOMALY: 'Volatility Mispricing'
        };
        
        this.detectionThresholds = {
            MOMENTUM: { minPeriod: 5, minStrength: 0.02 },
            REVERSAL: { maxZScore: -2, minConfidence: 0.7 },
            SEASONAL: { minOccurrence: 3, minSignificance: 0.05 },
            VOLATILITY: { minDeviation: 2, lookbackPeriod: 30 }
        };
    }
    
    // 🔍 DETECT MOMENTUM ANOMALIES
    detectMomentumAnomalies(priceData, lookbackPeriod = 20) {
        try {
            const anomalies = [];
            
            for (const [symbol, data] of Object.entries(priceData)) {
                if (!data.prices || data.prices.length < lookbackPeriod + 10) continue;
                
                const prices = data.prices;
                const returns = this.calculateReturns(prices);
                
                // Calculate momentum indicators
                const momentum = this.calculateMomentum(prices, lookbackPeriod);
                const rsi = this.calculateRSI(prices);
                const bollingerPosition = this.calculateBollingerPosition(prices);
                
                // Detect momentum anomaly
                if (momentum.strength > this.detectionThresholds.MOMENTUM.minStrength &&
                    momentum.persistence > this.detectionThresholds.MOMENTUM.minPeriod) {
                    
                    anomalies.push({
                        symbol: symbol,
                        type: 'MOMENTUM_ANOMALY',
                        direction: momentum.direction,
                        strength: momentum.strength,
                        persistence: momentum.persistence,
                        currentPrice: prices[prices.length - 1],
                        rsi: rsi,
                        bollingerPosition: bollingerPosition,
                        confidence: this.calculateAnomalyConfidence(momentum, rsi, bollingerPosition),
                        expectedContinuation: this.estimateMomentumContinuation(momentum),
                        riskLevel: this.assessMomentumRisk(momentum, rsi),
                        recommendation: this.getMomentumRecommendation(momentum, rsi, bollingerPosition)
                    });
                }
            }
            
            return {
                anomalies: anomalies.sort((a, b) => b.confidence - a.confidence),
                totalAnomalies: anomalies.length,
                bullishAnomalies: anomalies.filter(a => a.direction === 'BULLISH').length,
                bearishAnomalies: anomalies.filter(a => a.direction === 'BEARISH').length,
                averageConfidence: anomalies.length > 0 ? 
                    anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length : 0,
                detectionType: 'MOMENTUM_ANOMALY',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Momentum anomaly detection error:', error.message);
            return { error: error.message, anomalies: [] };
        }
    }
    
    // 🔄 DETECT MEAN REVERSION ANOMALIES
    detectReversionAnomalies(priceData, lookbackPeriod = 50) {
        try {
            const anomalies = [];
            
            for (const [symbol, data] of Object.entries(priceData)) {
                if (!data.prices || data.prices.length < lookbackPeriod + 20) continue;
                
                const prices = data.prices;
                const currentPrice = prices[prices.length - 1];
                
                // Calculate mean reversion indicators
                const meanReversionScore = this.calculateMeanReversionScore(prices, lookbackPeriod);
                const zscore = this.calculateZScore(prices, lookbackPeriod);
                const volatility = this.calculateVolatility(prices, 20);
                
                // Detect reversion anomaly
                if (Math.abs(zscore) > Math.abs(this.detectionThresholds.REVERSAL.maxZScore) &&
                    meanReversionScore.confidence > this.detectionThresholds.REVERSAL.minConfidence) {
                    
                    anomalies.push({
                        symbol: symbol,
                        type: 'REVERSAL_ANOMALY',
                        currentPrice: currentPrice,
                        zscore: zscore,
                        meanReversionScore: meanReversionScore,
                        volatility: volatility,
                        direction: zscore > 0 ? 'REVERT_DOWN' : 'REVERT_UP',
                        confidence: meanReversionScore.confidence * 100,
                        expectedReversion: this.calculateExpectedReversion(zscore, meanReversionScore),
                        timeHorizon: this.estimateReversionTimeHorizon(zscore, volatility),
                        riskLevel: this.assessReversionRisk(zscore, volatility),
                        recommendation: this.getReversionRecommendation(zscore, meanReversionScore)
                    });
                }
            }
            
            return {
                anomalies: anomalies.sort((a, b) => Math.abs(b.zscore) - Math.abs(a.zscore)),
                totalAnomalies: anomalies.length,
                revertUpAnomalies: anomalies.filter(a => a.direction === 'REVERT_UP').length,
                revertDownAnomalies: anomalies.filter(a => a.direction === 'REVERT_DOWN').length,
                averageZScore: anomalies.length > 0 ? 
                    anomalies.reduce((sum, a) => sum + Math.abs(a.zscore), 0) / anomalies.length : 0,
                detectionType: 'REVERSAL_ANOMALY',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Reversion anomaly detection error:', error.message);
            return { error: error.message, anomalies: [] };
        }
    }
    
    // 📊 HELPER CALCULATION METHODS
    
    calculateReturns(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        return returns;
    }
    
    calculateMomentum(prices, period) {
        if (prices.length < period + 5) return { strength: 0, direction: 'NEUTRAL', persistence: 0 };
        
        const recent = prices.slice(-period);
        const older = prices.slice(-period*2, -period);
        
        const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length;
        const olderAvg = older.reduce((sum, p) => sum + p, 0) / older.length;
        
        const strength = Math.abs(recentAvg - olderAvg) / olderAvg;
        const direction = recentAvg > olderAvg ? 'BULLISH' : 'BEARISH';
        
        // Calculate persistence (consecutive moves in same direction)
        const returns = this.calculateReturns(recent);
        let persistence = 0;
        let currentStreak = 0;
        const expectedDirection = direction === 'BULLISH' ? 1 : -1;
        
        for (let i = returns.length - 1; i >= 0; i--) {
            if (Math.sign(returns[i]) === expectedDirection) {
                currentStreak++;
            } else {
                break;
            }
        }
        persistence = currentStreak;
        
        return { strength, direction, persistence };
    }
    
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;
        
        const changes = this.calculateReturns(prices);
        const gains = changes.map(change => change > 0 ? change : 0);
        const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
        
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
        
        for (let i = period; i < changes.length; i++) {
            avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
            avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
        }
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    calculateBollingerPosition(prices, period = 20) {
        if (prices.length < period) return 0.5;
        
        const recent = prices.slice(-period);
        const mean = recent.reduce((sum, p) => sum + p, 0) / period;
        const variance = recent.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        const currentPrice = prices[prices.length - 1];
        const upperBand = mean + (2 * stdDev);
        const lowerBand = mean - (2 * stdDev);
        
        return (currentPrice - lowerBand) / (upperBand - lowerBand);
    }
    
    calculateMeanReversionScore(prices, period) {
        const recent = prices.slice(-period);
        const mean = recent.reduce((sum, p) => sum + p, 0) / period;
        const variance = recent.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        const currentPrice = prices[prices.length - 1];
        const zscore = (currentPrice - mean) / stdDev;
        
        // Calculate historical mean reversion tendency
        let reversionCount = 0;
        const halfPeriod = Math.floor(period / 2);
        
        for (let i = halfPeriod; i < recent.length - halfPeriod; i++) {
            const pastMean = recent.slice(i - halfPeriod, i).reduce((sum, p) => sum + p, 0) / halfPeriod;
            const futureMean = recent.slice(i, i + halfPeriod).reduce((sum, p) => sum + p, 0) / halfPeriod;
            
            if ((recent[i] > pastMean && futureMean < recent[i]) || 
                (recent[i] < pastMean && futureMean > recent[i])) {
                reversionCount++;
            }
        }
        
        const confidence = reversionCount / (recent.length - period);
        
        return {
            score: Math.abs(zscore),
            confidence: confidence,
            historicalReversions: reversionCount
        };
    }
    
    calculateZScore(prices, period) {
        if (prices.length < period) return 0;
        
        const recent = prices.slice(-period);
        const mean = recent.reduce((sum, p) => sum + p, 0) / period;
        const variance = recent.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        const currentPrice = prices[prices.length - 1];
        return stdDev > 0 ? (currentPrice - mean) / stdDev : 0;
    }
    
    calculateVolatility(prices, period) {
        if (prices.length < period + 1) return 0;
        
        const returns = this.calculateReturns(prices.slice(-period - 1));
        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
        
        return Math.sqrt(variance * 252); // Annualized volatility
    }
    
    // 🎯 ANOMALY ASSESSMENT METHODS
    
    calculateAnomalyConfidence(momentum, rsi, bollingerPosition) {
        let confidence = 30; // Base confidence
        
        // Momentum strength contribution
        confidence += momentum.strength * 200;
        
        // Persistence contribution
        confidence += momentum.persistence * 5;
        
        // RSI confirmation
        if ((momentum.direction === 'BULLISH' && rsi > 60) || 
            (momentum.direction === 'BEARISH' && rsi < 40)) {
            confidence += 20;
        }
        
        // Bollinger position confirmation
        if ((momentum.direction === 'BULLISH' && bollingerPosition > 0.7) || 
            (momentum.direction === 'BEARISH' && bollingerPosition < 0.3)) {
            confidence += 15;
        }
        
        return Math.min(95, Math.max(10, confidence));
    }
    
    estimateMomentumContinuation(momentum) {
        const baseDays = 5;
        const strengthMultiplier = momentum.strength * 20;
        const persistenceMultiplier = momentum.persistence * 0.5;
        
        return Math.round(baseDays + strengthMultiplier + persistenceMultiplier);
    }
    
    assessMomentumRisk(momentum, rsi) {
        let riskScore = 30; // Base risk
        
        if (momentum.strength > 0.1) riskScore += 20; // High momentum = higher risk
        if (momentum.persistence > 10) riskScore += 15; // Long persistence = exhaustion risk
        if (rsi > 80 || rsi < 20) riskScore += 25; // Extreme RSI = reversal risk
        
        if (riskScore < 40) return 'LOW';
        if (riskScore < 70) return 'MODERATE';
        return 'HIGH';
    }
    
    getMomentumRecommendation(momentum, rsi, bollingerPosition) {
        const strength = momentum.strength;
        const direction = momentum.direction;
        
        if (strength > 0.05 && momentum.persistence > 3) {
            if ((direction === 'BULLISH' && rsi < 70 && bollingerPosition < 0.9) ||
                (direction === 'BEARISH' && rsi > 30 && bollingerPosition > 0.1)) {
                return 'STRONG_FOLLOW';
            }
            return 'FOLLOW';
        } else if (strength > 0.02) {
            return 'CONSIDER';
        }
        return 'AVOID';
    }
    
    calculateExpectedReversion(zscore, meanReversionScore) {
        const maxReversion = Math.abs(zscore) * meanReversionScore.confidence;
        const expectedMove = maxReversion * 0.7; // Conservative estimate
        
        return {
            maxReversion: maxReversion,
            expectedMove: expectedMove,
            probability: meanReversionScore.confidence
        };
    }
    
    estimateReversionTimeHorizon(zscore, volatility) {
        const baseTime = 10; // 10 days base
        const zscoreMultiplier = Math.abs(zscore) * 2;
        const volatilityMultiplier = volatility * 20;
        
        return Math.round(baseTime + zscoreMultiplier + volatilityMultiplier);
    }
    
    assessReversionRisk(zscore, volatility) {
        let riskScore = 20; // Base risk
        
        if (Math.abs(zscore) > 3) riskScore += 30; // Extreme moves = higher risk
        if (volatility > 0.4) riskScore += 25; // High volatility = higher risk
        if (Math.abs(zscore) < 1.5) riskScore += 20; // Weak signal = higher risk
        
        if (riskScore < 40) return 'LOW';
        if (riskScore < 70) return 'MODERATE';
        return 'HIGH';
    }
    
    getReversionRecommendation(zscore, meanReversionScore) {
        const signal = Math.abs(zscore);
        const confidence = meanReversionScore.confidence;
        
        if (signal > 2.5 && confidence > 0.8) return 'STRONG_REVERT';
        if (signal > 2 && confidence > 0.7) return 'REVERT';
        if (signal > 1.5 && confidence > 0.6) return 'CONSIDER';
        return 'AVOID';
    }
}

// 🎯 MASTER ARBITRAGE ANALYSIS FUNCTION
async function getComprehensiveArbitrageAnalysis(marketData, options = {}) {
    try {
        console.log('⚡ Running comprehensive arbitrage opportunity analysis...');
        
        const scanner = new ArbitrageOpportunityScanner();
        const inefficiencyDetector = new MarketInefficiencyDetector();
        
        // Generate sample data for demonstration
        const sampleData = generateSampleArbitrageData();
        
        // Get market context
        const [regimeData, yieldCurve, anomalies] = await Promise.allSettled([
            detectEconomicRegime(),
            getYieldCurveAnalysis(),
            detectMarketAnomalies()
        ]);
        
        // Run parallel arbitrage scans
        const [
            priceArbitrage,
            statisticalArbitrage,
            mergerArbitrage,
            carryTrade,
            etfArbitrage,
            momentumAnomalies,
            reversionAnomalies
        ] = await Promise.allSettled([
            scanner.scanPriceArbitrageOpportunities(sampleData.priceData),
            scanner.scanStatisticalArbitrageOpportunities(sampleData.assetPairs, sampleData.historicalData),
            scanner.scanMergerArbitrageOpportunities(sampleData.mergerDeals),
            scanner.scanCarryTradeOpportunities(sampleData.currencyPairs, sampleData.interestRates),
            scanner.scanETFArbitrageOpportunities(sampleData.etfData),
            inefficiencyDetector.detectMomentumAnomalies(sampleData.priceData),
            inefficiencyDetector.detectReversionAnomalies(sampleData.priceData)
        ]);
        
        // Compile all opportunities
        const allOpportunities = [];
        
        [priceArbitrage, statisticalArbitrage, mergerArbitrage, carryTrade, etfArbitrage].forEach(result => {
            if (result.status === 'fulfilled' && result.value.opportunities) {
                allOpportunities.push(...result.value.opportunities);
            }
        });
        
        [momentumAnomalies, reversionAnomalies].forEach(result => {
            if (result.status === 'fulfilled' && result.value.anomalies) {
                allOpportunities.push(...result.value.anomalies);
            }
        });
        
        // Sort by expected return/profit
        allOpportunities.sort((a, b) => {
            const aReturn = a.netProfitPercentage || a.expectedReturn || a.annualizedReturn || 0;
            const bReturn = b.netProfitPercentage || b.expectedReturn || b.annualizedReturn || 0;
            return bReturn - aReturn;
        });
        
        // Generate AI analysis
        const topOpportunities = allOpportunities.slice(0, 8);
        const aiAnalysisPrompt = `Analyze these arbitrage and market inefficiency opportunities:

Market Context:
- Economic Regime: ${regimeData.value?.currentRegime?.name || 'Unknown'}
- Yield Curve: ${yieldCurve.value?.shape || 'Normal'}
- Market Anomalies: ${anomalies.value?.anomalies?.length || 0} detected

Top Opportunities:
${topOpportunities.map(opp => {
    const profit = opp.netProfitPercentage || opp.expectedReturn || opp.annualizedReturn || 0;
    return `${opp.asset1 || opp.symbol || opp.targetSymbol || 'Unknown'}: ${opp.type} - ${profit.toFixed(2)}% expected return`;
}).join('\n')}

Risk Levels:
- Low Risk: ${allOpportunities.filter(o => o.riskLevel === 'LOW').length}
- Moderate Risk: ${allOpportunities.filter(o => o.riskLevel === 'MODERATE').length}
- High Risk: ${allOpportunities.filter(o => o.riskLevel === 'HIGH').length}

Provide strategic arbitrage recommendations with top 3 actionable strategies and risk management guidance.`;
        
        const aiInsights = await getUniversalAnalysis(aiAnalysisPrompt, {
            isWealthCommand: true,
            maxTokens: 1500
        });
        
        return {
            summary: {
                totalOpportunities: allOpportunities.length,
                averageExpectedReturn: calculateAverageReturn(allOpportunities),
                opportunityBreakdown: {
                    priceArbitrage: priceArbitrage.status === 'fulfilled' ? priceArbitrage.value.totalOpportunities : 0,
                    statisticalArbitrage: statisticalArbitrage.status === 'fulfilled' ? statisticalArbitrage.value.totalOpportunities : 0,
                    mergerArbitrage: mergerArbitrage.status === 'fulfilled' ? mergerArbitrage.value.totalOpportunities : 0,
                    carryTrade: carryTrade.status === 'fulfilled' ? carryTrade.value.totalOpportunities : 0,
                    etfArbitrage: etfArbitrage.status === 'fulfilled' ? etfArbitrage.value.totalOpportunities : 0,
                    momentumAnomalies: momentumAnomalies.status === 'fulfilled' ? momentumAnomalies.value.totalAnomalies : 0,
                    reversionAnomalies: reversionAnomalies.status === 'fulfilled' ? reversionAnomalies.value.totalAnomalies : 0
                },
                riskDistribution: {
                    low: allOpportunities.filter(o => o.riskLevel === 'LOW').length,
                    moderate: allOpportunities.filter(o => o.riskLevel === 'MODERATE').length,
                    high: allOpportunities.filter(o => o.riskLevel === 'HIGH').length
                }
            },
            topOpportunities: topOpportunities,
            scanResults: {
                priceArbitrage: priceArbitrage.status === 'fulfilled' ? priceArbitrage.value : { error: 'Failed' },
                statisticalArbitrage: statisticalArbitrage.status === 'fulfilled' ? statisticalArbitrage.value : { error: 'Failed' },
                mergerArbitrage: mergerArbitrage.status === 'fulfilled' ? mergerArbitrage.value : { error: 'Failed' },
                carryTrade: carryTrade.status === 'fulfilled' ? carryTrade.value : { error: 'Failed' },
                etfArbitrage: etfArbitrage.status === 'fulfilled' ? etfArbitrage.value : { error: 'Failed' }
            },
            anomalyResults: {
                momentum: momentumAnomalies.status === 'fulfilled' ? momentumAnomalies.value : { error: 'Failed' },
                reversion: reversionAnomalies.status === 'fulfilled' ? reversionAnomalies.value : { error: 'Failed' }
            },
            marketContext: {
                regime: regimeData.value?.currentRegime?.name || 'Unknown',
                regimeConfidence: regimeData.value?.confidence || 0,
                yieldCurveShape: yieldCurve.value?.shape || 'Normal',
                marketAnomalies: anomalies.value?.anomalies?.length || 0
            },
            riskManagement: generateArbitrageRiskGuidance(allOpportunities),
            executionPriority: prioritizeOpportunities(topOpportunities),
            aiInsights: aiInsights.response,
            recommendations: generateArbitrageRecommendations(allOpportunities),
            analysisDate: new Date().toISOString(),
            dataQuality: {
                priceArbitrage: priceArbitrage.status === 'fulfilled',
                statisticalArbitrage: statisticalArbitrage.status === 'fulfilled',
                mergerArbitrage: mergerArbitrage.status === 'fulfilled',
                marketData: regimeData.status === 'fulfilled'
            }
        };
        
    } catch (error) {
        console.error('Comprehensive arbitrage analysis error:', error.message);
        return {
            error: error.message,
            summary: {
                totalOpportunities: 0,
                averageExpectedReturn: 0
            },
            recommendations: [
                'Arbitrage analysis failed - check data connections',
                'Monitor market conditions for manual opportunities',
                'Review system configuration'
            ],
            analysisDate: new Date().toISOString()
        };
    }
}

// 🎯 HELPER FUNCTIONS

function generateSampleArbitrageData() {
    return {
        priceData: {
            'BTC': {
                exchanges: {
                    'BINANCE': { price: 43250, volume: 1500000 },
                    'COINBASE': { price: 43180, volume: 800000 },
                    'KRAKEN': { price: 43300, volume: 600000 }
                }
            },
            'ETH': {
                exchanges: {
                    'BINANCE': { price: 2650, volume: 2000000 },
                    'COINBASE': { price: 2635, volume: 1200000 }
                }
            }
        },
        assetPairs: [
            { asset1: 'SPY', asset2: 'VOO' },
            { asset1: 'GLD', asset2: 'IAU' },
            { asset1: 'QQQ', asset2: 'TQQQ' }
        ],
        historicalData: generateSampleHistoricalData(),
        mergerDeals: [
            {
                targetSymbol: 'TARGET1',
                acquirerSymbol: 'ACQUIRER1',
                targetPrice: 45.50,
                acquirerPrice: 120.00,
                offerPrice: 48.00,
                offerType: 'CASH',
                expectedCloseDate: '2024-06-15',
                dealProbability: 0.85,
                regulatoryRisk: 'MODERATE'
            }
        ],
        currencyPairs: [
            { baseCurrency: 'AUD', quoteCurrency: 'JPY', currentRate: 98.50, volatility: 0.12 },
            { baseCurrency: 'NZD', quoteCurrency: 'USD', currentRate: 0.62, volatility: 0.10 }
        ],
        interestRates: {
            'USD': 0.0525,
            'EUR': 0.04,
            'JPY': -0.001,
            'GBP': 0.0525,
            'AUD': 0.041,
            'NZD': 0.055
        },
        etfData: [
            {
                symbol: 'SPY',
                marketPrice: 485.50,
                nav: 485.20,
                volume: 45000000,
                creationUnit: 50000,
                holdings: ['AAPL', 'MSFT', 'AMZN']
            }
        ]
    };
}

function generateSampleHistoricalData() {
    const data = {};
    const symbols = ['SPY', 'VOO', 'GLD', 'IAU', 'QQQ', 'TQQQ'];
    
    symbols.forEach(symbol => {
        const prices = [];
        let basePrice = 100 + Math.random() * 300;
        
        for (let i = 0; i < 100; i++) {
            const change = (Math.random() - 0.5) * 0.04;
            basePrice *= (1 + change);
            prices.push(basePrice);
        }
        
        data[symbol] = { prices };
    });
    
    return data;
}

function calculateAverageReturn(opportunities) {
    if (opportunities.length === 0) return 0;
    
    const returns = opportunities.map(opp => 
        opp.netProfitPercentage || opp.expectedReturn || opp.annualizedReturn || 0
    );
    
    return returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
}

function generateArbitrageRiskGuidance(opportunities) {
    const guidance = [];
    
    const highRiskCount = opportunities.filter(o => o.riskLevel === 'HIGH').length;
    const totalCount = opportunities.length;
    
    if (highRiskCount / totalCount > 0.3) {
        guidance.push({
            type: 'HIGH_RISK_WARNING',
            priority: 'CRITICAL',
            message: 'High concentration of risky arbitrage opportunities',
            recommendation: 'Limit position sizes and use strict stop losses'
        });
    }
    
    const instantOpps = opportunities.filter(o => o.timeWindow === 'INSTANT' || o.timeHorizon === 'INTRADAY');
    if (instantOpps.length > 5) {
        guidance.push({
            type: 'EXECUTION_SPEED',
            priority: 'HIGH',
            message: 'Multiple time-sensitive opportunities detected',
            recommendation: 'Prioritize fastest execution systems and lowest latency'
        });
    }
    
    if (guidance.length === 0) {
        guidance.push({
            type: 'NORMAL_CONDITIONS',
            priority: 'LOW',
            message: 'Risk levels appear manageable',
            recommendation: 'Standard risk management protocols apply'
        });
    }
    
    return guidance;
}

function prioritizeOpportunities(opportunities) {
    return opportunities.map((opp, index) => ({
        rank: index + 1,
        opportunity: opp,
        priority: index < 3 ? 'HIGH' : index < 6 ? 'MEDIUM' : 'LOW',
        reasoning: index < 3 ? 'High expected return with manageable risk' : 
                  index < 6 ? 'Good return potential' : 'Lower priority opportunity'
    }));
}

function generateArbitrageRecommendations(opportunities) {
    const recommendations = [];
    
    const priceArbs = opportunities.filter(o => o.type === 'PRICE_ARBITRAGE');
    if (priceArbs.length > 0) {
        recommendations.push({
            type: 'PRICE_ARBITRAGE_FOCUS',
            priority: 'HIGH',
            message: `${priceArbs.length} price arbitrage opportunities available`,
            action: 'EXECUTE_IMMEDIATELY'
        });
    }
    
    const statArbs = opportunities.filter(o => o.type === 'STATISTICAL_ARBITRAGE');
    if (statArbs.length > 2) {
        recommendations.push({
            type: 'STATISTICAL_ARBITRAGE',
            priority: 'MODERATE',
            message: `${statArbs.length} statistical arbitrage pairs identified`,
            action: 'IMPLEMENT_SYSTEMATIC_STRATEGY'
        });
    }
    
    const lowRiskOpps = opportunities.filter(o => o.riskLevel === 'LOW');
    if (lowRiskOpps.length > 0) {
        recommendations.push({
            type: 'LOW_RISK_OPPORTUNITIES',
            priority: 'HIGH',
            message: `${lowRiskOpps.length} low-risk opportunities available`,
            action: 'PRIORITIZE_ALLOCATION'
        });
    }
    
    return recommendations;
}

// 🎯 EXPORT ALL ARBITRAGE FUNCTIONS
module.exports = {
    // Main Functions
    getComprehensiveArbitrageAnalysis,
    
    // Classes
    ArbitrageOpportunityScanner,
    MarketInefficiencyDetector,
    
    // Utility Functions
    generateSampleArbitrageData,
    generateSampleHistoricalData,
    calculateAverageReturn,
    generateArbitrageRiskGuidance,
    prioritizeOpportunities,
    generateArbitrageRecommendations
};// 🏆 WEALTH MODULE 4: ARBITRAGE & MARKET INEFFICIENCY DETECTION
// Advanced arbitrage detection and statistical arbitrage strategies

// 🏆 WEALTH MODULE 5: ADVANCED PORTFOLIO TRACKING & ANALYTICS
// Real-time portfolio monitoring, performance attribution, and advanced analytics

// 📊 PORTFOLIO PERFORMANCE TRACKER
class PortfolioPerformanceTracker {
    constructor() {
        this.performanceMetrics = {
            TOTAL_RETURN: 'Total Return',
            ANNUALIZED_RETURN: 'Annualized Return',
            VOLATILITY: 'Portfolio Volatility',
            SHARPE_RATIO: 'Sharpe Ratio',
            SORTINO_RATIO: 'Sortino Ratio',
            MAX_DRAWDOWN: 'Maximum Drawdown',
            CALMAR_RATIO: 'Calmar Ratio',
            BETA: 'Portfolio Beta',
            ALPHA: 'Portfolio Alpha',
            INFORMATION_RATIO: 'Information Ratio',
            TREYNOR_RATIO: 'Treynor Ratio'
        };
        
        this.timeframes = {
            '1D': { days: 1, label: 'Daily' },
            '1W': { days: 7, label: 'Weekly' },
            '1M': { days: 30, label: 'Monthly' },
            '3M': { days: 90, label: 'Quarterly' },
            '6M': { days: 180, label: 'Semi-Annual' },
            '1Y': { days: 365, label: 'Annual' },
            '3Y': { days: 1095, label: '3-Year' },
            '5Y': { days: 1825, label: '5-Year' },
            'ALL': { days: null, label: 'All Time' }
        };
        
        this.benchmarks = {
            'SPY': 'S&P 500',
            'QQQ': 'NASDAQ 100',
            'IWM': 'Russell 2000',
            'VTI': 'Total Stock Market',
            'VTIAX': 'Total International',
            'AGG': 'Total Bond Market',
            '60_40': '60/40 Portfolio'
        };
    }
    
    // 📈 CALCULATE COMPREHENSIVE PERFORMANCE METRICS
    async calculatePerformanceMetrics(portfolio, timeframe = '1Y') {
        try {
            const { positions, historicalValues, benchmarkData } = portfolio;
            
            if (!historicalValues || historicalValues.length < 2) {
                return { error: 'Insufficient historical data for performance calculation' };
            }
            
            // Calculate basic returns
            const returns = this.calculateReturns(historicalValues);
            const periodicReturns = this.getPeriodicReturns(returns, timeframe);
            
            // Core performance metrics
            const totalReturn = this.calculateTotalReturn(historicalValues);
            const annualizedReturn = this.calculateAnnualizedReturn(historicalValues);
            const volatility = this.calculateVolatility(periodicReturns);
            const maxDrawdown = this.calculateMaxDrawdown(historicalValues);
            
            // Risk-adjusted metrics
            const sharpeRatio = this.calculateSharpeRatio(periodicReturns, 0.02); // 2% risk-free rate
            const sortinoRatio = this.calculateSortinoRatio(periodicReturns, 0.02);
            const calmarRatio = this.calculateCalmarRatio(annualizedReturn, maxDrawdown);
            
            // Benchmark comparison
            let benchmarkMetrics = null;
            if (benchmarkData) {
                benchmarkMetrics = await this.calculateBenchmarkMetrics(
                    periodicReturns, 
                    benchmarkData, 
                    timeframe
                );
            }
            
            // Attribution analysis
            const attribution = await this.calculatePerformanceAttribution(positions, periodicReturns);
            
            return {
                timeframe: timeframe,
                totalReturn: totalReturn,
                annualizedReturn: annualizedReturn,
                volatility: volatility,
                maxDrawdown: maxDrawdown,
                sharpeRatio: sharpeRatio,
                sortinoRatio: sortinoRatio,
                calmarRatio: calmarRatio,
                benchmarkMetrics: benchmarkMetrics,
                attribution: attribution,
                winRate: this.calculateWinRate(periodicReturns),
                averageWin: this.calculateAverageWin(periodicReturns),
                averageLoss: this.calculateAverageLoss(periodicReturns),
                profitFactor: this.calculateProfitFactor(periodicReturns),
                valueAtRisk: this.calculateVaR(periodicReturns, 0.05),
                conditionalVaR: this.calculateCVaR(periodicReturns, 0.05),
                skewness: this.calculateSkewness(periodicReturns),
                kurtosis: this.calculateKurtosis(periodicReturns),
                calculationDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Performance metrics calculation error:', error.message);
            return { error: error.message };
        }
    }
    
    // 📊 PERFORMANCE ATTRIBUTION ANALYSIS
    async calculatePerformanceAttribution(positions, returns) {
        try {
            const attribution = {
                byAsset: {},
                bySector: {},
                byAssetClass: {},
                byGeography: {},
                totalAttribution: 0
            };
            
            let totalWeight = 0;
            
            // Calculate asset-level attribution
            for (const position of positions) {
                const weight = position.marketValue / position.portfolioValue;
                const assetReturn = position.periodReturn || 0;
                const contribution = weight * assetReturn;
                
                attribution.byAsset[position.symbol] = {
                    weight: weight * 100,
                    return: assetReturn * 100,
                    contribution: contribution * 100,
                    sector: position.sector || 'Unknown',
                    assetClass: position.assetClass || 'Equity',
                    geography: position.geography || 'US'
                };
                
                attribution.totalAttribution += contribution;
                totalWeight += weight;
            }
            
            // Aggregate by sector
            const sectors = {};
            const assetClasses = {};
            const geographies = {};
            
            Object.values(attribution.byAsset).forEach(asset => {
                // Sector attribution
                if (!sectors[asset.sector]) {
                    sectors[asset.sector] = { weight: 0, contribution: 0, return: 0, count: 0 };
                }
                sectors[asset.sector].weight += asset.weight;
                sectors[asset.sector].contribution += asset.contribution;
                sectors[asset.sector].return += asset.return;
                sectors[asset.sector].count++;
                
                // Asset class attribution
                if (!assetClasses[asset.assetClass]) {
                    assetClasses[asset.assetClass] = { weight: 0, contribution: 0, return: 0, count: 0 };
                }
                assetClasses[asset.assetClass].weight += asset.weight;
                assetClasses[asset.assetClass].contribution += asset.contribution;
                assetClasses[asset.assetClass].return += asset.return;
                assetClasses[asset.assetClass].count++;
                
                // Geography attribution
                if (!geographies[asset.geography]) {
                    geographies[asset.geography] = { weight: 0, contribution: 0, return: 0, count: 0 };
                }
                geographies[asset.geography].weight += asset.weight;
                geographies[asset.geography].contribution += asset.contribution;
                geographies[asset.geography].return += asset.return;
                geographies[asset.geography].count++;
            });
            
            // Calculate average returns for aggregations
            Object.keys(sectors).forEach(sector => {
                sectors[sector].averageReturn = sectors[sector].return / sectors[sector].count;
            });
            
            Object.keys(assetClasses).forEach(assetClass => {
                assetClasses[assetClass].averageReturn = assetClasses[assetClass].return / assetClasses[assetClass].count;
            });
            
            Object.keys(geographies).forEach(geography => {
                geographies[geography].averageReturn = geographies[geography].return / geographies[geography].count;
            });
            
            attribution.bySector = sectors;
            attribution.byAssetClass = assetClasses;
            attribution.byGeography = geographies;
            
            return attribution;
        } catch (error) {
            console.error('Performance attribution error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🎯 BENCHMARK COMPARISON ANALYSIS
    async calculateBenchmarkMetrics(portfolioReturns, benchmarkData, timeframe) {
        try {
            const benchmarkReturns = this.calculateReturns(benchmarkData.values);
            const alignedReturns = this.alignReturnSeries(portfolioReturns, benchmarkReturns);
            
            // Calculate beta
            const beta = this.calculateBeta(alignedReturns.portfolio, alignedReturns.benchmark);
            
            // Calculate alpha
            const portfolioAnnualized = this.annualizeReturn(alignedReturns.portfolio);
            const benchmarkAnnualized = this.annualizeReturn(alignedReturns.benchmark);
            const riskFreeRate = 0.02; // 2% risk-free rate
            
            const alpha = portfolioAnnualized - (riskFreeRate + beta * (benchmarkAnnualized - riskFreeRate));
            
            // Calculate tracking error
            const trackingError = this.calculateTrackingError(alignedReturns.portfolio, alignedReturns.benchmark);
            
            // Calculate information ratio
            const informationRatio = alpha / trackingError;
            
            // Calculate Treynor ratio
            const treynorRatio = (portfolioAnnualized - riskFreeRate) / beta;
            
            // Up/Down capture ratios
            const captureRatios = this.calculateCaptureRatios(alignedReturns.portfolio, alignedReturns.benchmark);
            
            return {
                benchmarkName: benchmarkData.name || 'Benchmark',
                beta: beta,
                alpha: alpha * 100, // Convert to percentage
                trackingError: trackingError * 100,
                informationRatio: informationRatio,
                treynorRatio: treynorRatio * 100,
                upCapture: captureRatios.upCapture * 100,
                downCapture: captureRatios.downCapture * 100,
                correlation: this.calculateCorrelation(alignedReturns.portfolio, alignedReturns.benchmark),
                rSquared: Math.pow(this.calculateCorrelation(alignedReturns.portfolio, alignedReturns.benchmark), 2),
                portfolioReturn: portfolioAnnualized * 100,
                benchmarkReturn: benchmarkAnnualized * 100,
                outperformance: (portfolioAnnualized - benchmarkAnnualized) * 100
            };
        } catch (error) {
            console.error('Benchmark metrics calculation error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🔧 CORE CALCULATION METHODS
    
    calculateReturns(values) {
        const returns = [];
        for (let i = 1; i < values.length; i++) {
            if (values[i-1] !== 0) {
                returns.push((values[i] - values[i-1]) / values[i-1]);
            }
        }
        return returns;
    }
    
    getPeriodicReturns(returns, timeframe) {
        const days = this.timeframes[timeframe]?.days;
        if (!days || days >= returns.length) return returns;
        return returns.slice(-days);
    }
    
    calculateTotalReturn(values) {
        if (values.length < 2) return 0;
        return (values[values.length - 1] - values[0]) / values[0];
    }
    
    calculateAnnualizedReturn(values) {
        if (values.length < 2) return 0;
        const totalReturn = this.calculateTotalReturn(values);
        const years = values.length / 252; // Assuming daily values
        return Math.pow(1 + totalReturn, 1 / years) - 1;
    }
    
    calculateVolatility(returns) {
        if (returns.length === 0) return 0;
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        return Math.sqrt(variance * 252); // Annualized
    }
    
    calculateMaxDrawdown(values) {
        let maxDrawdown = 0;
        let peak = values[0];
        
        for (let i = 1; i < values.length; i++) {
            if (values[i] > peak) {
                peak = values[i];
            } else {
                const drawdown = (peak - values[i]) / peak;
                maxDrawdown = Math.max(maxDrawdown, drawdown);
            }
        }
        
        return maxDrawdown;
    }
    
    calculateSharpeRatio(returns, riskFreeRate) {
        if (returns.length === 0) return 0;
        const annualizedRiskFreeRate = riskFreeRate / 252; // Daily risk-free rate
        const excessReturns = returns.map(r => r - annualizedRiskFreeRate);
        const avgExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
        const volatility = this.calculateVolatility(returns) / Math.sqrt(252); // Daily volatility
        
        return volatility !== 0 ? (avgExcessReturn * 252) / (volatility * Math.sqrt(252)) : 0;
    }
    
    calculateSortinoRatio(returns, targetReturn) {
        if (returns.length === 0) return 0;
        const annualizedTargetReturn = targetReturn / 252;
        const excessReturns = returns.map(r => r - annualizedTargetReturn);
        const avgExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
        
        // Calculate downside deviation
        const downsideReturns = excessReturns.filter(r => r < 0);
        if (downsideReturns.length === 0) return avgExcessReturn > 0 ? Infinity : 0;
        
        const downsideVariance = downsideReturns.reduce((sum, r) => sum + r * r, 0) / returns.length;
        const downsideDeviation = Math.sqrt(downsideVariance * 252);
        
        return downsideDeviation !== 0 ? (avgExcessReturn * 252) / downsideDeviation : 0;
    }
    
    calculateCalmarRatio(annualizedReturn, maxDrawdown) {
        return maxDrawdown !== 0 ? annualizedReturn / maxDrawdown : 0;
    }
    
    calculateBeta(portfolioReturns, benchmarkReturns) {
        if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length === 0) return 1;
        
        const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
        const benchmarkMean = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
        
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < portfolioReturns.length; i++) {
            const portfolioDiff = portfolioReturns[i] - portfolioMean;
            const benchmarkDiff = benchmarkReturns[i] - benchmarkMean;
            
            numerator += portfolioDiff * benchmarkDiff;
            denominator += benchmarkDiff * benchmarkDiff;
        }
        
        return denominator !== 0 ? numerator / denominator : 1;
    }
    
    calculateTrackingError(portfolioReturns, benchmarkReturns) {
        if (portfolioReturns.length !== benchmarkReturns.length) return 0;
        
        const trackingDifferences = portfolioReturns.map((pr, i) => pr - benchmarkReturns[i]);
        const mean = trackingDifferences.reduce((sum, diff) => sum + diff, 0) / trackingDifferences.length;
        const variance = trackingDifferences.reduce((sum, diff) => sum + Math.pow(diff - mean, 2), 0) / trackingDifferences.length;
        
        return Math.sqrt(variance * 252); // Annualized
    }
    
    calculateCaptureRatios(portfolioReturns, benchmarkReturns) {
        if (portfolioReturns.length !== benchmarkReturns.length) return { upCapture: 1, downCapture: 1 };
        
        const upPeriods = [];
        const downPeriods = [];
        
        for (let i = 0; i < benchmarkReturns.length; i++) {
            if (benchmarkReturns[i] > 0) {
                upPeriods.push({ portfolio: portfolioReturns[i], benchmark: benchmarkReturns[i] });
            } else if (benchmarkReturns[i] < 0) {
                downPeriods.push({ portfolio: portfolioReturns[i], benchmark: benchmarkReturns[i] });
            }
        }
        
        const upCapture = upPeriods.length > 0 ? 
            (upPeriods.reduce((sum, p) => sum + p.portfolio, 0) / upPeriods.length) /
            (upPeriods.reduce((sum, p) => sum + p.benchmark, 0) / upPeriods.length) : 1;
            
        const downCapture = downPeriods.length > 0 ? 
            (downPeriods.reduce((sum, p) => sum + p.portfolio, 0) / downPeriods.length) /
            (downPeriods.reduce((sum, p) => sum + p.benchmark, 0) / downPeriods.length) : 1;
        
        return { upCapture, downCapture };
    }
    
    calculateCorrelation(returns1, returns2) {
        if (returns1.length !== returns2.length || returns1.length === 0) return 0;
        
        const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
        const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;
        
        let numerator = 0;
        let sum1Sq = 0;
        let sum2Sq = 0;
        
        for (let i = 0; i < returns1.length; i++) {
            const diff1 = returns1[i] - mean1;
            const diff2 = returns2[i] - mean2;
            
            numerator += diff1 * diff2;
            sum1Sq += diff1 * diff1;
            sum2Sq += diff2 * diff2;
        }
        
        const denominator = Math.sqrt(sum1Sq * sum2Sq);
        return denominator !== 0 ? numerator / denominator : 0;
    }
    
    alignReturnSeries(returns1, returns2) {
        const minLength = Math.min(returns1.length, returns2.length);
        return {
            portfolio: returns1.slice(-minLength),
            benchmark: returns2.slice(-minLength)
        };
    }
    
    annualizeReturn(returns) {
        if (returns.length === 0) return 0;
        const totalReturn = returns.reduce((product, r) => product * (1 + r), 1) - 1;
        const years = returns.length / 252;
        return Math.pow(1 + totalReturn, 1 / years) - 1;
    }
    
    // 📊 ADDITIONAL RISK METRICS
    
    calculateWinRate(returns) {
        if (returns.length === 0) return 0;
        const wins = returns.filter(r => r > 0).length;
        return wins / returns.length;
    }
    
    calculateAverageWin(returns) {
        const wins = returns.filter(r => r > 0);
        return wins.length > 0 ? wins.reduce((sum, r) => sum + r, 0) / wins.length : 0;
    }
    
    calculateAverageLoss(returns) {
        const losses = returns.filter(r => r < 0);
        return losses.length > 0 ? losses.reduce((sum, r) => sum + r, 0) / losses.length : 0;
    }
    
    calculateProfitFactor(returns) {
        const totalWins = returns.filter(r => r > 0).reduce((sum, r) => sum + r, 0);
        const totalLosses = Math.abs(returns.filter(r => r < 0).reduce((sum, r) => sum + r, 0));
        return totalLosses !== 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
    }
    
    calculateVaR(returns, confidenceLevel) {
        if (returns.length === 0) return 0;
        const sortedReturns = returns.slice().sort((a, b) => a - b);
        const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
        return -sortedReturns[index] || 0;
    }
    
    calculateCVaR(returns, confidenceLevel) {
        if (returns.length === 0) return 0;
        const sortedReturns = returns.slice().sort((a, b) => a - b);
        const cutoffIndex = Math.floor((1 - confidenceLevel) * sortedReturns.length);
        const tailReturns = sortedReturns.slice(0, cutoffIndex);
        return tailReturns.length > 0 ? -tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length : 0;
    }
    
    calculateSkewness(returns) {
        if (returns.length === 0) return 0;
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev === 0) return 0;
        
        const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0) / returns.length;
        return skewness;
    }
    
    calculateKurtosis(returns) {
        if (returns.length === 0) return 0;
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev === 0) return 0;
        
        const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 4), 0) / returns.length;
        return kurtosis - 3; // Excess kurtosis
    }
}

// 🎯 REAL-TIME PORTFOLIO MONITOR
class RealTimePortfolioMonitor {
    constructor() {
        this.monitoringInterval = null;
        this.alertThresholds = {
            maxDrawdown: 0.05, // 5%
            dailyLoss: 0.03, // 3%
            positionConcentration: 0.25, // 25%
            sectorConcentration: 0.30, // 30%
            volatilitySpike: 2.0 // 2x normal volatility
        };
        
        this.alertHistory = [];
        this.lastPortfolioSnapshot = null;
    }
    
    // 🔄 START REAL-TIME MONITORING
    startMonitoring(portfolio, intervalMs = 60000) {
        try {
            console.log('📊 Starting real-time portfolio monitoring...');
            
            this.monitoringInterval = setInterval(async () => {
                await this.checkPortfolioHealth(portfolio);
            }, intervalMs);
            
            return {
                status: 'MONITORING_STARTED',
                intervalMs: intervalMs,
                alertThresholds: this.alertThresholds,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Portfolio monitoring start error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🔍 CHECK PORTFOLIO HEALTH
    async checkPortfolioHealth(portfolio) {
        try {
            const currentSnapshot = await this.takePortfolioSnapshot(portfolio);
            const alerts = [];
            
            // Drawdown alert
            if (currentSnapshot.currentDrawdown > this.alertThresholds.maxDrawdown) {
                alerts.push({
                    type: 'MAX_DRAWDOWN_EXCEEDED',
                    severity: 'HIGH',
                    message: `Portfolio drawdown (${(currentSnapshot.currentDrawdown * 100).toFixed(2)}%) exceeds threshold`,
                    value: currentSnapshot.currentDrawdown,
                    threshold: this.alertThresholds.maxDrawdown,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Daily loss alert
            if (currentSnapshot.dailyReturn < -this.alertThresholds.dailyLoss) {
                alerts.push({
                    type: 'DAILY_LOSS_ALERT',
                    severity: 'MODERATE',
                    message: `Daily loss (${(currentSnapshot.dailyReturn * 100).toFixed(2)}%) exceeds threshold`,
                    value: currentSnapshot.dailyReturn,
                    threshold: -this.alertThresholds.dailyLoss,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Position concentration alert
            const maxPositionWeight = Math.max(...Object.values(currentSnapshot.positionWeights));
            if (maxPositionWeight > this.alertThresholds.positionConcentration) {
                alerts.push({
                    type: 'POSITION_CONCENTRATION',
                    severity: 'MODERATE',
                    message: `Single position weight (${(maxPositionWeight * 100).toFixed(1)}%) exceeds threshold`,
                    value: maxPositionWeight,
                    threshold: this.alertThresholds.positionConcentration,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Volatility spike alert
            if (this.lastPortfolioSnapshot) {
                const volatilityRatio = currentSnapshot.volatility / this.lastPortfolioSnapshot.volatility;
                if (volatilityRatio > this.alertThresholds.volatilitySpike) {
                    alerts.push({
                        type: 'VOLATILITY_SPIKE',
                        severity: 'HIGH',
                        message: `Portfolio volatility spike detected (${volatilityRatio.toFixed(2)}x normal)`,
                        value: volatilityRatio,
                        threshold: this.alertThresholds.volatilitySpike,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            
            // Process alerts
            if (alerts.length > 0) {
                await this.processAlerts(alerts);
            }
            
            this.lastPortfolioSnapshot = currentSnapshot;
            
            return {
                snapshot: currentSnapshot,
                alerts: alerts,
                alertCount: alerts.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Portfolio health check error:', error.message);
            return { error: error.message };
        }
    }
    
    // 📸 TAKE PORTFOLIO SNAPSHOT
    async takePortfolioSnapshot(portfolio) {
        try {
            const { positions, currentValue, historicalValues } = portfolio;
            
            // Calculate current metrics
            const positionWeights = {};
            const sectorWeights = {};
            let totalValue = 0;
            
            positions.forEach(position => {
                totalValue += position.marketValue;
                positionWeights[position.symbol] = position.marketValue / currentValue;
                
                const sector = position.sector || 'Unknown';
                sectorWeights[sector] = (sectorWeights[sector] || 0) + (position.marketValue / currentValue);
            });
            
            // Calculate recent returns
            const recentValues = historicalValues.slice(-30); // Last 30 days
            const dailyReturn = recentValues.length >= 2 ? 
                (recentValues[recentValues.length - 1] - recentValues[recentValues.length - 2]) / recentValues[recentValues.length - 2] : 0;
            
            // Calculate current drawdown
            const peak = Math.max(...recentValues);
            const currentDrawdown = (peak - currentValue) / peak;
            
            // Calculate volatility
            const returns = [];
            for (let i = 1; i < recentValues.length; i++) {
                returns.push((recentValues[i] - recentValues[i-1]) / recentValues[i-1]);
            }
            const volatility = this.calculateVolatility(returns);
            
            return {
                timestamp: new Date().toISOString(),
                currentValue: currentValue,
                dailyReturn: dailyReturn,
                currentDrawdown: currentDrawdown,
                volatility: volatility,
                positionWeights: positionWeights,
                sectorWeights: sectorWeights,
                positionCount: positions.length,
                largestPosition: Math.max(...Object.values(positionWeights)),
                largestSector: Math.max(...Object.values(sectorWeights))
            };
        } catch (error) {
            console.error('Portfolio snapshot error:', error.message);
            return { error: error.message };
        }
    }
    
    // 🚨 PROCESS ALERTS
    async processAlerts(alerts) {
        try {
            for (const alert of alerts) {
                console.log(`🚨 Portfolio Alert: ${alert.type} - ${alert.message}`);
                
                // Add to alert history
                this.alertHistory.push(alert);
                
                // Keep only last 100 alerts
                if (this.alertHistory.length > 100) {
                    this.alertHistory = this.alertHistory.slice(-50);
                }
                
                // In production, this could trigger:
                // - Email notifications
                // - SMS alerts
                // - Dashboard notifications
                // - Automatic rebalancing triggers
            }
        } catch (error) {
            console.error('Alert processing error:', error.message);
        }
    }
    
    // ⏹️ STOP MONITORING
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            
            return {
                status: 'MONITORING_STOPPED',
                totalAlerts: this.alertHistory.length,
                timestamp: new Date().toISOString()
            };
        }
        
        return {
            status: 'NOT_MONITORING',
            timestamp: new Date().toISOString()
        };
    }
    
    // 📊 GET ALERT SUMMARY
    getAlertSummary(days = 7) {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const recentAlerts = this.alertHistory.filter(alert => 
            new Date(alert.timestamp) > cutoffDate
        );
        
        const alertCounts = {};
        const severityCounts = { HIGH: 0, MODERATE: 0, LOW: 0 };
        
        recentAlerts.forEach(alert => {
            alertCounts[alert.type] = (alertCounts[alert.type] || 0) + 1;
            severityCounts[alert.severity] = (severityCounts[alert.severity] || 0) + 1;
        });
        
        return {
            totalAlerts: recentAlerts.length,
            alertTypes: alertCounts,
            severityBreakdown: severityCounts,
            mostCommonAlert: Object.keys(alertCounts).reduce((a, b) => 
                alertCounts[a] > alertCounts[b] ? a : b, Object.keys(alertCounts)[0]
            ),
            timeframe: `${days} days`,
            timestamp: new Date().toISOString()
        };
    }
    
    // 🔧 HELPER METHODS
    calculateVolatility(returns) {
        if (returns.length === 0) return 0;
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        return Math.sqrt(variance * 252); // Annualized
    }
}

// 📈 PORTFOLIO ANALYTICS DASHBOARD
class PortfolioAnalyticsDashboard {
    constructor() {
        this.dashboardWidgets = {
            PERFORMANCE_SUMMARY: 'Performance Summary',
            ASSET_ALLOCATION: 'Asset Allocation',
            SECTOR_BREAKDOWN: 'Sector Breakdown',
            RISK_METRICS: 'Risk Metrics',
            ATTRIBUTION_ANALYSIS: 'Attribution Analysis',
            BENCHMARK_COMPARISON: 'Benchmark Comparison',
            HISTORICAL_CHART: 'Historical Performance Chart',
            ALERTS_SUMMARY: 'Alerts Summary'
        };
    }
    
    // 📊 GENERATE COMPREHENSIVE DASHBOARD
    async generateDashboard(portfolio, options = {}) {
        try {
            const tracker = new PortfolioPerformanceTracker();
            const monitor = new RealTimePortfolioMonitor();
            
            // Calculate performance metrics for multiple timeframes
            const timeframes = ['1M', '3M', '6M', '1Y'];
            const performanceData = {};
            
            for (const timeframe of timeframes) {
                performanceData[timeframe] = await tracker.calculatePerformanceMetrics(
                    portfolio, 
                    timeframe
                );
            }
            
            // Generate current portfolio snapshot
            const currentSnapshot = await monitor.takePortfolioSnapshot(portfolio);
            
            // Calculate allocation breakdowns
            const allocations = this.calculateAllocationBreakdowns(portfolio.positions);
            
            // Generate risk analysis
            const riskAnalysis = this.generateRiskAnalysis(performanceData, currentSnapshot);
            
            // Performance comparison
            const benchmarkComparison = this.generateBenchmarkComparison(performanceData);
            
            // Top contributors and detractors
            const topMovers = this.calculateTopMovers(portfolio.positions);
            
            return {
                overview: {
                    currentValue: portfolio.currentValue,
                    dayChange: currentSnapshot.dailyReturn * 100,
                    dayChangeValue: portfolio.currentValue * currentSnapshot.dailyReturn,
                    totalReturn: performanceData['1Y']?.totalReturn * 100 || 0,
                    totalReturnValue: portfolio.currentValue * (performanceData['1Y']?.totalReturn || 0),
                    positionCount: portfolio.positions.length,
                    lastUpdate: new Date().toISOString()
                },
                performance: {
                    timeframes: performanceData,
                    summary: {
                        bestTimeframe: this.findBestPerformingTimeframe(performanceData),
                        worstTimeframe: this.findWorstPerformingTimeframe(performanceData),
                        consistency: this.calculatePerformanceConsistency(performanceData)
                    }
                },
                allocations: allocations,
                riskAnalysis: riskAnalysis,
                benchmarkComparison: benchmarkComparison,
                topMovers: topMovers,
                currentSnapshot: currentSnapshot,
                recommendations: this.generateDashboardRecommendations(
                    performanceData, 
                    allocations, 
                    riskAnalysis
                ),
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Dashboard generation error:', error.message);
            return { 
                error: error.message,
                generatedAt: new Date().toISOString()
            };
        }
    }
    
    // 📊 CALCULATE ALLOCATION BREAKDOWNS
    calculateAllocationBreakdowns(positions) {
        const allocations = {
            byAsset: {},
            bySector: {},
            byAssetClass: {},
            byGeography: {},
            byMarketCap: {}
        };
        
        let totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
        
        positions.forEach(position => {
            const weight = position.marketValue / totalValue;
            
            // By asset
            allocations.byAsset[position.symbol] = {
                weight: weight * 100,
                value: position.marketValue,
                shares: position.shares,
                price: position.currentPrice,
                dayChange: position.dayChange || 0
            };
            
            // By sector
            const sector = position.sector || 'Unknown';
            if (!allocations.bySector[sector]) {
                allocations.bySector[sector] = { weight: 0, value: 0, count: 0 };
            }
            allocations.bySector[sector].weight += weight * 100;
            allocations.bySector[sector].value += position.marketValue;
            allocations.bySector[sector].count += 1;
            
            // By asset class
            const assetClass = position.assetClass || 'Equity';
            if (!allocations.byAssetClass[assetClass]) {
                allocations.byAssetClass[assetClass] = { weight: 0, value: 0, count: 0 };
            }
            allocations.byAssetClass[assetClass].weight += weight * 100;
            allocations.byAssetClass[assetClass].value += position.marketValue;
            allocations.byAssetClass[assetClass].count += 1;
            
            // By geography
            const geography = position.geography || 'US';
            if (!allocations.byGeography[geography]) {
                allocations.byGeography[geography] = { weight: 0, value: 0, count: 0 };
            }
            allocations.byGeography[geography].weight += weight * 100;
            allocations.byGeography[geography].value += position.marketValue;
            allocations.byGeography[geography].count += 1;
            
            // By market cap
            const marketCapCategory = this.categorizeMarketCap(position.marketCap);
            if (!allocations.byMarketCap[marketCapCategory]) {
                allocations.byMarketCap[marketCapCategory] = { weight: 0, value: 0, count: 0 };
            }
            allocations.byMarketCap[marketCapCategory].weight += weight * 100;
            allocations.byMarketCap[marketCapCategory].value += position.marketValue;
            allocations.byMarketCap[marketCapCategory].count += 1;
        });
        
        return allocations;
    }
    
    // 🎯 GENERATE RISK ANALYSIS
    generateRiskAnalysis(performanceData, currentSnapshot) {
        const riskMetrics = {
            overall: 'MODERATE',
            volatility: currentSnapshot.volatility,
            maxDrawdown: currentSnapshot.currentDrawdown,
            concentration: {
                position: currentSnapshot.largestPosition,
                sector: currentSnapshot.largestSector
            },
            riskScore: 0
        };
        
        // Calculate composite risk score
        let riskScore = 50; // Base score
        
        // Volatility adjustment
        if (currentSnapshot.volatility > 0.25) riskScore += 20;
        else if (currentSnapshot.volatility > 0.15) riskScore += 10;
        else if (currentSnapshot.volatility < 0.08) riskScore -= 10;
        
        // Drawdown adjustment
        if (currentSnapshot.currentDrawdown > 0.1) riskScore += 25;
        else if (currentSnapshot.currentDrawdown > 0.05) riskScore += 15;
        
        // Concentration adjustment
        if (currentSnapshot.largestPosition > 0.3) riskScore += 15;
        if (currentSnapshot.largestSector > 0.4) riskScore += 10;
        
        // Determine overall risk level
        if (riskScore >= 80) riskMetrics.overall = 'VERY_HIGH';
        else if (riskScore >= 65) riskMetrics.overall = 'HIGH';
        else if (riskScore >= 45) riskMetrics.overall = 'MODERATE';
        else if (riskScore >= 30) riskMetrics.overall = 'LOW';
        else riskMetrics.overall = 'VERY_LOW';
        
        riskMetrics.riskScore = riskScore;
        
        return riskMetrics;
    }
    
    // 📈 GENERATE BENCHMARK COMPARISON
    generateBenchmarkComparison(performanceData) {
        const comparison = {};
        
        Object.keys(performanceData).forEach(timeframe => {
            const data = performanceData[timeframe];
            if (data && data.benchmarkMetrics) {
                comparison[timeframe] = {
                    portfolioReturn: data.annualizedReturn * 100,
                    benchmarkReturn: data.benchmarkMetrics.benchmarkReturn,
                    outperformance: data.benchmarkMetrics.outperformance,
                    alpha: data.benchmarkMetrics.alpha,
                    beta: data.benchmarkMetrics.beta,
                    sharpeRatio: data.sharpeRatio
                };
            }
        });
        
        return comparison;
    }
    
    // 🔝 CALCULATE TOP MOVERS
    calculateTopMovers(positions) {
        const sortedByChange = positions
            .filter(pos => pos.dayChange !== undefined)
            .sort((a, b) => Math.abs(b.dayChange) - Math.abs(a.dayChange));
        
        return {
            topGainers: sortedByChange
                .filter(pos => pos.dayChange > 0)
                .slice(0, 5)
                .map(pos => ({
                    symbol: pos.symbol,
                    change: pos.dayChange,
                    value: pos.marketValue,
                    weight: pos.weight
                })),
            topLosers: sortedByChange
                .filter(pos => pos.dayChange < 0)
                .slice(0, 5)
                .map(pos => ({
                    symbol: pos.symbol,
                    change: pos.dayChange,
                    value: pos.marketValue,
                    weight: pos.weight
                }))
        };
    }
    
    // 🔧 HELPER METHODS
    
    categorizeMarketCap(marketCap) {
        if (!marketCap) return 'Unknown';
        
        if (marketCap >= 200000) return 'Large Cap';
        if (marketCap >= 10000) return 'Mid Cap';
        if (marketCap >= 2000) return 'Small Cap';
        return 'Micro Cap';
    }
    
    findBestPerformingTimeframe(performanceData) {
        let bestTimeframe = null;
        let bestReturn = -Infinity;
        
        Object.keys(performanceData).forEach(timeframe => {
            const data = performanceData[timeframe];
            if (data && data.annualizedReturn > bestReturn) {
                bestReturn = data.annualizedReturn;
                bestTimeframe = timeframe;
            }
        });
        
        return { timeframe: bestTimeframe, return: bestReturn * 100 };
    }
    
    findWorstPerformingTimeframe(performanceData) {
        let worstTimeframe = null;
        let worstReturn = Infinity;
        
        Object.keys(performanceData).forEach(timeframe => {
            const data = performanceData[timeframe];
            if (data && data.annualizedReturn < worstReturn) {
                worstReturn = data.annualizedReturn;
                worstTimeframe = timeframe;
            }
        });
        
        return { timeframe: worstTimeframe, return: worstReturn * 100 };
    }
    
    calculatePerformanceConsistency(performanceData) {
        const returns = Object.values(performanceData)
            .filter(data => data && data.annualizedReturn)
            .map(data => data.annualizedReturn);
        
        if (returns.length < 2) return 50;
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        // Lower standard deviation = higher consistency
        const consistencyScore = Math.max(0, 100 - (stdDev * 1000));
        return Math.round(consistencyScore);
    }
    
    generateDashboardRecommendations(performanceData, allocations, riskAnalysis) {
        const recommendations = [];
        
        // Risk-based recommendations
        if (riskAnalysis.overall === 'HIGH' || riskAnalysis.overall === 'VERY_HIGH') {
            recommendations.push({
                type: 'RISK_REDUCTION',
                priority: 'HIGH',
                message: 'Portfolio risk level is elevated - consider reducing exposure to volatile assets',
                action: 'REBALANCE_DEFENSIVE'
            });
        }
        
        // Concentration recommendations
        if (riskAnalysis.concentration.position > 0.25) {
            recommendations.push({
                type: 'POSITION_CONCENTRATION',
                priority: 'MODERATE',
                message: `Largest position represents ${(riskAnalysis.concentration.position * 100).toFixed(1)}% of portfolio`,
                action: 'DIVERSIFY_HOLDINGS'
            });
        }
        
        // Performance recommendations
        const yearlyPerformance = performanceData['1Y'];
        if (yearlyPerformance && yearlyPerformance.sharpeRatio < 1.0) {
            recommendations.push({
                type: 'PERFORMANCE_IMPROVEMENT',
                priority: 'MODERATE',
                message: 'Risk-adjusted returns could be improved',
                action: 'REVIEW_ASSET_SELECTION'
            });
        }
        
        // Benchmark recommendations
        if (yearlyPerformance && yearlyPerformance.benchmarkMetrics && 
            yearlyPerformance.benchmarkMetrics.outperformance < -2) {
            recommendations.push({
                type: 'UNDERPERFORMANCE',
                priority: 'HIGH',
                message: 'Portfolio is underperforming benchmark significantly',
                action: 'STRATEGIC_REVIEW'
            });
        }
        
        return recommendations;
    }
}

// 🎯 MASTER PORTFOLIO TRACKING FUNCTION
async function getComprehensivePortfolioAnalytics(portfolioData, options = {}) {
    try {
        console.log('📊 Running comprehensive portfolio analytics...');
        
        const tracker = new PortfolioPerformanceTracker();
        const monitor = new RealTimePortfolioMonitor();
        const dashboard = new PortfolioAnalyticsDashboard();
        
        // Generate sample portfolio data if not provided
        const portfolio = portfolioData || generateSamplePortfolioData();
        
        // Get market context
        const [regimeData, marketData] = await Promise.allSettled([
            detectEconomicRegime(),
            getRayDalioMarketData()
        ]);
        
        // Generate comprehensive dashboard
        const dashboardData = await dashboard.generateDashboard(portfolio, options);
        
        // Calculate detailed performance metrics
        const detailedMetrics = await tracker.calculatePerformanceMetrics(portfolio, '1Y');
        
        // Get current portfolio health check
        const healthCheck = await monitor.checkPortfolioHealth(portfolio);
        
        // Generate AI insights
        const aiAnalysisPrompt = `Analyze this portfolio performance and provide strategic insights:

Portfolio Overview:
- Current Value: ${portfolio.currentValue?.toLocaleString() || 'N/A'}
- Total Return (1Y): ${(detailedMetrics.totalReturn * 100 || 0).toFixed(2)}%
- Volatility: ${(detailedMetrics.volatility * 100 || 0).toFixed(2)}%
- Sharpe Ratio: ${detailedMetrics.sharpeRatio?.toFixed(2) || 'N/A'}
- Max Drawdown: ${(detailedMetrics.maxDrawdown * 100 || 0).toFixed(2)}%

Risk Analysis:
- Overall Risk Level: ${dashboardData.riskAnalysis?.overall || 'Unknown'}
- Largest Position: ${(dashboardData.currentSnapshot?.largestPosition * 100 || 0).toFixed(1)}%
- Position Count: ${portfolio.positions?.length || 0}

Market Context:
- Economic Regime: ${regimeData.value?.currentRegime?.name || 'Unknown'}
- Market Conditions: ${marketData.value?.rayDalio?.regime?.signals?.market?.risk || 'Neutral'}

Provide specific recommendations for portfolio optimization, risk management, and performance improvement.`;
        
        const aiInsights = await getUniversalAnalysis(aiAnalysisPrompt, {
            isWealthCommand: true,
            maxTokens: 1500
        });
        
        return {
            summary: {
                currentValue: portfolio.currentValue,
                totalReturn: detailedMetrics.totalReturn * 100 || 0,
                annualizedReturn: detailedMetrics.annualizedReturn * 100 || 0,
                volatility: detailedMetrics.volatility * 100 || 0,
                sharpeRatio: detailedMetrics.sharpeRatio || 0,
                maxDrawdown: detailedMetrics.maxDrawdown * 100 || 0,
                positionCount: portfolio.positions?.length || 0,
                riskLevel: dashboardData.riskAnalysis?.overall || 'MODERATE'
            },
            detailedMetrics: detailedMetrics,
            dashboard: dashboardData,
            healthCheck: healthCheck,
            marketContext: {
                regime: regimeData.value?.currentRegime?.name || 'Unknown',
                regimeConfidence: regimeData.value?.confidence || 0,
                marketRisk: marketData.value?.rayDalio?.regime?.signals?.market?.risk || 'Neutral'
            },
            performanceAttribution: detailedMetrics.attribution || {},
            benchmarkComparison: detailedMetrics.benchmarkMetrics || {},
            riskMetrics: {
                valueAtRisk: detailedMetrics.valueAtRisk * 100 || 0,
                conditionalVaR: detailedMetrics.conditionalVaR * 100 || 0,
                skewness: detailedMetrics.skewness || 0,
                kurtosis: detailedMetrics.kurtosis || 0
            },
            aiInsights: aiInsights.response,
            recommendations: generatePortfolioRecommendations(dashboardData, detailedMetrics),
            monitoring: {
                alertsActive: healthCheck.alertCount || 0,
                lastHealthCheck: healthCheck.timestamp,
                monitoringStatus: 'AVAILABLE'
            },
            analysisDate: new Date().toISOString(),
            dataQuality: {
                performanceMetrics: !detailedMetrics.error,
                dashboard: !dashboardData.error,
                healthCheck: !healthCheck.error,
                marketData: marketData.status === 'fulfilled'
            }
        };
        
    } catch (error) {
        console.error('Comprehensive portfolio analytics error:', error.message);
        return {
            error: error.message,
            summary: {
                currentValue: 0,
                totalReturn: 0,
                positionCount: 0,
                riskLevel: 'UNKNOWN'
            },
            recommendations: [
                'Portfolio analytics failed - check data connections',
                'Verify portfolio data format and completeness',
                'Review system configuration'
            ],
            analysisDate: new Date().toISOString()
        };
    }
}

// 🎯 HELPER FUNCTIONS

function generateSamplePortfolioData() {
    const positions = [
        {
            symbol: 'AAPL', shares: 100, currentPrice: 185.50, marketValue: 18550,
            sector: 'Technology', assetClass: 'Equity', geography: 'US',
            marketCap: 2900000, dayChange: 0.015, periodReturn: 0.12
        },
        {
            symbol: 'MSFT', shares: 50, currentPrice: 420.00, marketValue: 21000,
            sector: 'Technology', assetClass: 'Equity', geography: 'US',
            marketCap: 3100000, dayChange: 0.008, periodReturn: 0.18
        },
        {
            symbol: 'NVDA', shares: 25, currentPrice: 890.00, marketValue: 22250,
            sector: 'Technology', assetClass: 'Equity', geography: 'US',
            marketCap: 2200000, dayChange: 0.025, periodReturn: 0.85
        },
        {
            symbol: 'JPM', shares: 75, currentPrice: 168.00, marketValue: 12600,
            sector: 'Financial', assetClass: 'Equity', geography: 'US',
            marketCap: 485000, dayChange: -0.012, periodReturn: 0.22
        },
        {
            symbol: 'JNJ', shares: 60, currentPrice: 165.00, marketValue: 9900,
            sector: 'Healthcare', assetClass: 'Equity', geography: 'US',
            marketCap: 435000, dayChange: 0.003, periodReturn: 0.08
        }
    ];
    
    const currentValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    
    // Generate historical values (daily for 1 year)
    const historicalValues = [];
    let baseValue = currentValue * 0.85; // Started 15% lower
    
    for (let i = 0; i < 252; i++) {
        const dailyChange = (Math.random() - 0.5) * 0.04; // ±2% daily volatility
        baseValue *= (1 + dailyChange);
        historicalValues.push(baseValue);
    }
    
    // Ensure current value matches
    historicalValues[historicalValues.length - 1] = currentValue;
    
    return {
        positions: positions,
        currentValue: currentValue,
        historicalValues: historicalValues,
        benchmarkData: {
            name: 'S&P 500',
            values: generateBenchmarkData(historicalValues.length)
        }
    };
}

function generateBenchmarkData(length) {
    const benchmarkValues = [];
    let baseValue = 4200; // S&P 500 base value
    
    for (let i = 0; i < length; i++) {
        const dailyChange = (Math.random() - 0.5) * 0.025; // ±1.25% daily volatility
        baseValue *= (1 + dailyChange);
        benchmarkValues.push(baseValue);
    }
    
    return benchmarkValues;
}

function generatePortfolioRecommendations(dashboardData, detailedMetrics) {
    const recommendations = [];
    
    // Performance recommendations
    if (detailedMetrics.sharpeRatio < 1.0) {
        recommendations.push({
            type: 'PERFORMANCE_OPTIMIZATION',
            priority: 'HIGH',
            message: `Sharpe ratio (${detailedMetrics.sharpeRatio?.toFixed(2)}) indicates suboptimal risk-adjusted returns`,
            action: 'REVIEW_ASSET_ALLOCATION'
        });
    }
    
    // Risk recommendations
    if (dashboardData.riskAnalysis?.overall === 'HIGH') {
        recommendations.push({
            type: 'RISK_MANAGEMENT',
            priority: 'HIGH',
            message: 'Portfolio risk level is elevated above target parameters',
            action: 'IMPLEMENT_RISK_CONTROLS'
        });
    }
    
    // Diversification recommendations
    if (dashboardData.currentSnapshot?.largestPosition > 0.25) {
        recommendations.push({
            type: 'DIVERSIFICATION',
            priority: 'MODERATE',
            message: 'Position concentration exceeds recommended limits',
            action: 'REDUCE_CONCENTRATION'
        });
    }
    
    // Drawdown recommendations
    if (detailedMetrics.maxDrawdown > 0.15) {
        recommendations.push({
            type: 'DRAWDOWN_CONTROL',
            priority: 'HIGH',
            message: `Maximum drawdown (${(detailedMetrics.maxDrawdown * 100).toFixed(1)}%) exceeds acceptable limits`,
            action: 'IMPLEMENT_STOP_LOSSES'
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'PORTFOLIO_HEALTH',
            priority: 'LOW',
            message: 'Portfolio metrics are within acceptable ranges',
            action: 'CONTINUE_MONITORING'
        });
    }
    
    return recommendations;
}

// 🎯 EXPORT ALL TRACKING FUNCTIONS
module.exports = {
    // Main Functions
    getComprehensivePortfolioAnalytics,
    
    // Classes
    PortfolioPerformanceTracker,
    RealTimePortfolioMonitor,
    PortfolioAnalyticsDashboard,
    
    // Utility Functions
    generateSamplePortfolioData,
    generateBenchmarkData,
    generatePortfolioRecommendations
};


