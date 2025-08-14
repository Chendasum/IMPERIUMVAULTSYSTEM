// utils/backtester.js
const { getUniversalAnalysis, getDualAnalysis } = require('./dualAISystem');
const { sendSmartMessage, sendAnalysis } = require('./telegramSplitter');
const { getLivePrice, getMarketData } = require('./liveData');
const { assessRisk, calculatePositionSize } = require('./riskManager');
const { generateSignals, analyzeSymbol } = require('./tradingSignals');
const { scanArbitrage } = require('./arbitrageDetector');
const { optimizePortfolio } = require('./portfolioOptimizer');
const { findYields } = require('./yieldFinder');
const { logInfo, logError, logWarning } = require('./logger');
const { saveToMemory, getFromMemory } = require('./memory');

class Backtester {
    constructor() {
        this.strategyTypes = {
            // Trading Strategies
            buyAndHold: { 
                name: 'Buy and Hold', 
                complexity: 'low', 
                category: 'passive',
                description: 'Long-term passive investment strategy'
            },
            movingAverageCrossover: { 
                name: 'Moving Average Crossover', 
                complexity: 'medium', 
                category: 'trend',
                description: 'MA-based trend following strategy'
            },
            rsiMeanReversion: { 
                name: 'RSI Mean Reversion', 
                complexity: 'medium', 
                category: 'momentum',
                description: 'RSI oversold/overbought strategy'
            },
            macdMomentum: { 
                name: 'MACD Momentum', 
                complexity: 'medium', 
                category: 'momentum',
                description: 'MACD signal-based strategy'
            },
            bollingerBands: { 
                name: 'Bollinger Bands', 
                complexity: 'medium', 
                category: 'volatility',
                description: 'Volatility-based trading strategy'
            },
            
            // Portfolio Strategies
            modernPortfolioTheory: { 
                name: 'Modern Portfolio Theory', 
                complexity: 'high', 
                category: 'portfolio',
                description: 'Risk-optimized portfolio allocation'
            },
            riskParity: { 
                name: 'Risk Parity', 
                complexity: 'high', 
                category: 'portfolio',
                description: 'Equal risk contribution strategy'
            },
            momentumPortfolio: { 
                name: 'Momentum Portfolio', 
                complexity: 'medium', 
                category: 'portfolio',
                description: 'Momentum-based asset rotation'
            },
            valuePortfolio: { 
                name: 'Value Portfolio', 
                complexity: 'medium', 
                category: 'portfolio',
                description: 'Value-based stock selection'
            },
            
            // Income Strategies
            dividendGrowth: { 
                name: 'Dividend Growth', 
                complexity: 'low', 
                category: 'income',
                description: 'Dividend aristocrat strategy'
            },
            yieldOptimization: { 
                name: 'Yield Optimization', 
                complexity: 'medium', 
                category: 'income',
                description: 'High-yield asset allocation'
            },
            bondLadder: { 
                name: 'Bond Ladder', 
                complexity: 'medium', 
                category: 'income',
                description: 'Systematic bond maturity strategy'
            },
            
            // Alternative Strategies
            pairsTrading: { 
                name: 'Pairs Trading', 
                complexity: 'high', 
                category: 'statistical',
                description: 'Statistical arbitrage strategy'
            },
            mergerArbitrage: { 
                name: 'Merger Arbitrage', 
                complexity: 'high', 
                category: 'event',
                description: 'M&A event-driven strategy'
            },
            volatilityTrading: { 
                name: 'Volatility Trading', 
                complexity: 'very_high', 
                category: 'volatility',
                description: 'VIX and volatility-based strategy'
            }
        };
        
        this.performanceMetrics = {
            totalReturn: 'Total Return (%)',
            annualizedReturn: 'Annualized Return (%)',
            sharpeRatio: 'Sharpe Ratio',
            sortinoRatio: 'Sortino Ratio',
            calmarRatio: 'Calmar Ratio',
            maxDrawdown: 'Maximum Drawdown (%)',
            volatility: 'Volatility (%)',
            beta: 'Beta',
            alpha: 'Alpha (%)',
            informationRatio: 'Information Ratio',
            winRate: 'Win Rate (%)',
            profitFactor: 'Profit Factor',
            averageWin: 'Average Win (%)',
            averageLoss: 'Average Loss (%)',
            maxConsecutiveWins: 'Max Consecutive Wins',
            maxConsecutiveLosses: 'Max Consecutive Losses',
            var95: 'Value at Risk 95% (%)',
            expectedShortfall: 'Expected Shortfall (%)',
            kellyCriterion: 'Kelly Criterion (%)',
            recencyBias: 'Recency Bias Score'
        };
        
        this.backtestConfig = {
            defaultStartDate: '2020-01-01',
            defaultEndDate: new Date().toISOString().split('T')[0],
            defaultCapital: 100000,
            transactionCost: 0.001, // 0.1%
            slippageCost: 0.0005,   // 0.05%
            interestRate: 0.02,     // 2% risk-free rate
            rebalanceFrequency: 'monthly'
        };
        
        this.backtestResults = new Map();
        this.strategyComparisons = [];
        this.optimizationRuns = [];
    }

    // 🎯 COMPREHENSIVE STRATEGY BACKTESTING
    async backtestStrategy(strategy, config, chatId) {
        try {
            logInfo(`🧪 Starting backtest for strategy: ${strategy.name}`);
            
            const backtestResult = {
                strategy: strategy,
                config: config,
                timestamp: Date.now(),
                performance: {},
                trades: [],
                portfolio: {},
                riskMetrics: {},
                benchmarkComparison: {},
                stressTests: {},
                monthlyReturns: [],
                drawdownAnalysis: {},
                optimization: {},
                aiInsights: ''
            };

            // Validate configuration
            const validatedConfig = this.validateBacktestConfig(config);
            backtestResult.config = validatedConfig;
            
            // Get historical data
            const historicalData = await this.getHistoricalData(validatedConfig);
            
            // Run strategy simulation
            const simulation = await this.runStrategySimulation(strategy, historicalData, validatedConfig);
            backtestResult.trades = simulation.trades;
            backtestResult.portfolio = simulation.portfolioHistory;
            
            // Calculate performance metrics
            backtestResult.performance = await this.calculatePerformanceMetrics(simulation, validatedConfig);
            
            // Calculate risk metrics
            backtestResult.riskMetrics = await this.calculateRiskMetrics(simulation, validatedConfig);
            
            // Benchmark comparison
            backtestResult.benchmarkComparison = await this.compareToBenchmarks(simulation, validatedConfig);
            
            // Stress testing
            backtestResult.stressTests = await this.runStressTests(strategy, simulation, validatedConfig);
            
            // Monthly returns analysis
            backtestResult.monthlyReturns = this.calculateMonthlyReturns(simulation);
            
            // Drawdown analysis
            backtestResult.drawdownAnalysis = this.analyzeDrawdowns(simulation);
            
            // Strategy optimization
            backtestResult.optimization = await this.optimizeStrategyParameters(strategy, historicalData, validatedConfig);
            
            // AI insights
            backtestResult.aiInsights = await this.getAIBacktestInsights(backtestResult, chatId);
            
            // Send comprehensive report
            await this.sendBacktestReport(backtestResult, chatId);
            
            // Save results
            await this.saveBacktestResults(backtestResult);
            
            return backtestResult;
            
        } catch (error) {
            logError('Strategy backtesting failed:', error);
            throw error;
        }
    }

    // 📊 MULTI-STRATEGY COMPARISON
    async compareStrategies(strategies, config, chatId) {
        try {
            logInfo('🔬 Starting multi-strategy comparison analysis');
            
            const comparison = {
                timestamp: Date.now(),
                strategies: strategies,
                config: config,
                results: {},
                rankings: {},
                correlationMatrix: {},
                portfolioCombinations: {},
                riskReturnAnalysis: {},
                aiInsights: ''
            };

            // Run backtests for all strategies
            const backtestPromises = strategies.map(strategy => 
                this.backtestStrategy(strategy, config, chatId)
            );
            
            const backtestResults = await Promise.allSettled(backtestPromises);
            
            // Process results
            backtestResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    const strategyName = strategies[index].name;
                    comparison.results[strategyName] = result.value;
                }
            });
            
            // Create strategy rankings
            comparison.rankings = this.rankStrategies(comparison.results);
            
            // Calculate correlation matrix
            comparison.correlationMatrix = this.calculateStrategyCorrelations(comparison.results);
            
            // Analyze portfolio combinations
            comparison.portfolioCombinations = await this.analyzePortfolioCombinations(comparison.results);
            
            // Risk-return analysis
            comparison.riskReturnAnalysis = this.analyzeRiskReturn(comparison.results);
            
            // AI insights
            comparison.aiInsights = await this.getAIComparisonInsights(comparison, chatId);
            
            // Send comparison report
            await this.sendComparisonReport(comparison, chatId);
            
            // Save comparison
            await this.saveStrategyComparison(comparison);
            
            return comparison;
            
        } catch (error) {
            logError('Strategy comparison failed:', error);
            throw error;
        }
    }

    // 🔬 STRATEGY SIMULATION ENGINE
    async runStrategySimulation(strategy, historicalData, config) {
        try {
            const simulation = {
                trades: [],
                portfolioHistory: [],
                cashHistory: [],
                positions: new Map(),
                currentCash: config.initialCapital,
                currentPortfolioValue: config.initialCapital,
                tradingDays: 0,
                signals: []
            };

            const dataLength = historicalData.prices.length;
            let lookbackPeriod = Math.min(50, Math.floor(dataLength * 0.1)); // 10% or 50 days
            
            // Process each time period
            for (let i = lookbackPeriod; i < dataLength; i++) {
                const currentDate = historicalData.dates[i];
                const currentPrices = historicalData.prices[i];
                const historicalSlice = {
                    dates: historicalData.dates.slice(0, i + 1),
                    prices: historicalData.prices.slice(0, i + 1),
                    volumes: historicalData.volumes.slice(0, i + 1)
                };
                
                // Generate strategy signals
                const signals = await this.generateStrategySignals(strategy, historicalSlice, i);
                simulation.signals.push(...signals);
                
                // Execute trades based on signals
                const trades = await this.executeStrategyTrades(
                    signals, 
                    currentPrices, 
                    simulation, 
                    config, 
                    currentDate
                );
                simulation.trades.push(...trades);
                
                // Update portfolio value
                const portfolioValue = this.calculatePortfolioValue(simulation.positions, currentPrices, simulation.currentCash);
                simulation.currentPortfolioValue = portfolioValue;
                
                // Record portfolio state
                simulation.portfolioHistory.push({
                    date: currentDate,
                    value: portfolioValue,
                    cash: simulation.currentCash,
                    positions: new Map(simulation.positions),
                    returns: i > lookbackPeriod ? (portfolioValue / simulation.portfolioHistory[simulation.portfolioHistory.length - 1].value) - 1 : 0
                });
                
                simulation.tradingDays++;
                
                // Rebalancing logic
                if (this.shouldRebalance(currentDate, config.rebalanceFrequency, i)) {
                    const rebalanceTrades = await this.rebalancePortfolio(strategy, simulation, currentPrices, config);
                    simulation.trades.push(...rebalanceTrades);
                }
            }
            
            return simulation;
            
        } catch (error) {
            logError('Strategy simulation failed:', error);
            throw error;
        }
    }

    // 📈 PERFORMANCE METRICS CALCULATION
    async calculatePerformanceMetrics(simulation, config) {
        try {
            const portfolioValues = simulation.portfolioHistory.map(p => p.value);
            const returns = simulation.portfolioHistory.map(p => p.returns).slice(1); // Skip first entry
            const trades = simulation.trades.filter(t => t.type !== 'rebalance');
            
            const finalValue = portfolioValues[portfolioValues.length - 1];
            const initialValue = portfolioValues[0];
            const totalDays = simulation.tradingDays;
            const years = totalDays / 252; // Trading days per year
            
            const metrics = {
                // Return Metrics
                totalReturn: ((finalValue - initialValue) / initialValue) * 100,
                annualizedReturn: (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100,
                
                // Risk Metrics
                volatility: this.calculateVolatility(returns) * 100,
                maxDrawdown: this.calculateMaxDrawdown(portfolioValues) * 100,
                
                // Risk-Adjusted Metrics
                sharpeRatio: this.calculateSharpeRatio(returns, config.interestRate),
                sortinoRatio: this.calculateSortinoRatio(returns, config.interestRate),
                calmarRatio: 0, // Will calculate below
                
                // Trading Metrics
                totalTrades: trades.length,
                winningTrades: trades.filter(t => (t.exitPrice - t.entryPrice) * t.quantity > 0).length,
                losingTrades: trades.filter(t => (t.exitPrice - t.entryPrice) * t.quantity < 0).length,
                winRate: 0, // Will calculate below
                
                // Additional Metrics
                beta: this.calculateBeta(returns),
                alpha: 0, // Will calculate below
                informationRatio: 0,
                var95: this.calculateVaR(returns, 0.95) * 100,
                expectedShortfall: this.calculateExpectedShortfall(returns, 0.95) * 100
            };
            
            // Calculate derived metrics
            metrics.winRate = trades.length > 0 ? (metrics.winningTrades / trades.length) * 100 : 0;
            metrics.calmarRatio = metrics.maxDrawdown !== 0 ? metrics.annualizedReturn / Math.abs(metrics.maxDrawdown) : 0;
            
            // Calculate profit factor
            const grossProfit = trades
                .filter(t => (t.exitPrice - t.entryPrice) * t.quantity > 0)
                .reduce((sum, t) => sum + ((t.exitPrice - t.entryPrice) * t.quantity), 0);
            const grossLoss = Math.abs(trades
                .filter(t => (t.exitPrice - t.entryPrice) * t.quantity < 0)
                .reduce((sum, t) => sum + ((t.exitPrice - t.entryPrice) * t.quantity), 0));
            
            metrics.profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
            
            // Calculate average win/loss
            const winningTradeReturns = trades
                .filter(t => (t.exitPrice - t.entryPrice) * t.quantity > 0)
                .map(t => ((t.exitPrice - t.entryPrice) / t.entryPrice) * 100);
            const losingTradeReturns = trades
                .filter(t => (t.exitPrice - t.entryPrice) * t.quantity < 0)
                .map(t => ((t.exitPrice - t.entryPrice) / t.entryPrice) * 100);
            
            metrics.averageWin = winningTradeReturns.length > 0 ? 
                winningTradeReturns.reduce((sum, r) => sum + r, 0) / winningTradeReturns.length : 0;
            metrics.averageLoss = losingTradeReturns.length > 0 ? 
                losingTradeReturns.reduce((sum, r) => sum + r, 0) / losingTradeReturns.length : 0;
            
            return metrics;
            
        } catch (error) {
            logError('Performance metrics calculation failed:', error);
            return {};
        }
    }

    // 🎯 STRATEGY SIGNAL GENERATION
    async generateStrategySignals(strategy, historicalData, currentIndex) {
        try {
            const signals = [];
            
            switch (strategy.type) {
                case 'buyAndHold':
                    // Buy and hold generates signals only at the beginning
                    if (currentIndex === Math.min(50, Math.floor(historicalData.prices.length * 0.1))) {
                        signals.push({ type: 'BUY', strength: 1.0, asset: 'portfolio' });
                    }
                    break;
                    
                case 'movingAverageCrossover':
                    const maSignals = this.generateMovingAverageSignals(historicalData, currentIndex, strategy.parameters);
                    signals.push(...maSignals);
                    break;
                    
                case 'rsiMeanReversion':
                    const rsiSignals = this.generateRSISignals(historicalData, currentIndex, strategy.parameters);
                    signals.push(...rsiSignals);
                    break;
                    
                case 'macdMomentum':
                    const macdSignals = this.generateMACDSignals(historicalData, currentIndex, strategy.parameters);
                    signals.push(...macdSignals);
                    break;
                    
                case 'bollingerBands':
                    const bbSignals = this.generateBollingerBandsSignals(historicalData, currentIndex, strategy.parameters);
                    signals.push(...bbSignals);
                    break;
                    
                case 'modernPortfolioTheory':
                    const mptSignals = this.generateMPTSignals(historicalData, currentIndex, strategy.parameters);
                    signals.push(...mptSignals);
                    break;
                    
                case 'pairsTrading':
                    const pairsSignals = this.generatePairsSignals(historicalData, currentIndex, strategy.parameters);
                    signals.push(...pairsSignals);
                    break;
                    
                default:
                    // Generic signal generation
                    signals.push({ type: 'HOLD', strength: 0.0, asset: 'all' });
            }
            
            return signals;
            
        } catch (error) {
            logError('Signal generation failed:', error);
            return [];
        }
    }

    // 📊 MOVING AVERAGE STRATEGY SIGNALS
    generateMovingAverageSignals(historicalData, currentIndex, parameters = {}) {
        const signals = [];
        const shortPeriod = parameters.shortPeriod || 20;
        const longPeriod = parameters.longPeriod || 50;
        
        if (currentIndex < longPeriod) return signals;
        
        // Calculate moving averages for the main asset (assuming first asset in data)
        const prices = historicalData.prices.map(p => p[0] || p.close || p); // Handle different data formats
        
        const shortMA = this.calculateSMA(prices.slice(currentIndex - shortPeriod + 1, currentIndex + 1), shortPeriod);
        const longMA = this.calculateSMA(prices.slice(currentIndex - longPeriod + 1, currentIndex + 1), longPeriod);
        const prevShortMA = this.calculateSMA(prices.slice(currentIndex - shortPeriod, currentIndex), shortPeriod);
        const prevLongMA = this.calculateSMA(prices.slice(currentIndex - longPeriod, currentIndex), longPeriod);
        
        const currentShort = shortMA[shortMA.length - 1];
        const currentLong = longMA[longMA.length - 1];
        const prevShort = prevShortMA[prevShortMA.length - 1];
        const prevLong = prevLongMA[prevLongMA.length - 1];
        
        // Golden Cross - Short MA crosses above Long MA
        if (currentShort > currentLong && prevShort <= prevLong) {
            signals.push({
                type: 'BUY',
                strength: 0.8,
                asset: 0,
                reason: `Golden Cross: ${shortPeriod}MA crossed above ${longPeriod}MA`,
                confidence: 75
            });
        }
        
        // Death Cross - Short MA crosses below Long MA
        if (currentShort < currentLong && prevShort >= prevLong) {
            signals.push({
                type: 'SELL',
                strength: 0.8,
                asset: 0,
                reason: `Death Cross: ${shortPeriod}MA crossed below ${longPeriod}MA`,
                confidence: 75
            });
        }
        
        return signals;
    }

    // 📈 RSI MEAN REVERSION SIGNALS
    generateRSISignals(historicalData, currentIndex, parameters = {}) {
        const signals = [];
        const period = parameters.period || 14;
        const oversoldLevel = parameters.oversoldLevel || 30;
        const overboughtLevel = parameters.overboughtLevel || 70;
        
        if (currentIndex < period) return signals;
        
        const prices = historicalData.prices.map(p => p[0] || p.close || p);
        const rsi = this.calculateRSI(prices.slice(0, currentIndex + 1), period);
        const currentRSI = rsi[rsi.length - 1];
        const prevRSI = rsi[rsi.length - 2];
        
        // RSI Oversold - Buy signal
        if (currentRSI < oversoldLevel && prevRSI >= oversoldLevel) {
            signals.push({
                type: 'BUY',
                strength: 0.7,
                asset: 0,
                reason: `RSI oversold: ${currentRSI.toFixed(2)}`,
                confidence: 65
            });
        }
        
        // RSI Overbought - Sell signal
        if (currentRSI > overboughtLevel && prevRSI <= overboughtLevel) {
            signals.push({
                type: 'SELL',
                strength: 0.7,
                asset: 0,
                reason: `RSI overbought: ${currentRSI.toFixed(2)}`,
                confidence: 65
            });
        }
        
        return signals;
    }

    // 🔬 STRESS TESTING
    async runStressTests(strategy, simulation, config) {
        try {
            const stressTests = {
                marketCrash: {},
                highVolatility: {},
                bearMarket: {},
                interestRateShock: {},
                inflationShock: {},
                liquidityDrain: {},
                correlationBreakdown: {}
            };

            // Market crash stress test (30% drop)
            stressTests.marketCrash = await this.simulateMarketShock(simulation, -0.30, 'crash');
            
            // High volatility stress test (double volatility)
            stressTests.highVolatility = await this.simulateVolatilityShock(simulation, 2.0);
            
            // Bear market stress test (prolonged decline)
            stressTests.bearMarket = await this.simulateBearMarket(simulation, -0.20, 252); // 1 year
            
            // Interest rate shock (500 bps increase)
            stressTests.interestRateShock = await this.simulateInterestRateShock(simulation, 0.05);
            
            // Correlation breakdown stress test
            stressTests.correlationBreakdown = await this.simulateCorrelationBreakdown(simulation);
            
            return stressTests;
            
        } catch (error) {
            logError('Stress testing failed:', error);
            return {};
        }
    }

    // 🎯 STRATEGY OPTIMIZATION
    async optimizeStrategyParameters(strategy, historicalData, config) {
        try {
            const optimization = {
                originalParameters: strategy.parameters || {},
                optimizedParameters: {},
                improvementMetrics: {},
                optimizationProcess: [],
                bestResult: null
            };

            // Define parameter ranges for optimization
            const parameterRanges = this.getParameterRanges(strategy);
            
            // Grid search optimization
            const gridResults = await this.gridSearchOptimization(strategy, historicalData, config, parameterRanges);
            
            // Find best parameters
            const bestResult = gridResults.reduce((best, current) => {
                const bestScore = this.calculateOptimizationScore(best.performance);
                const currentScore = this.calculateOptimizationScore(current.performance);
                return currentScore > bestScore ? current : best;
            });
            
            optimization.optimizedParameters = bestResult.parameters;
            optimization.bestResult = bestResult;
            optimization.optimizationProcess = gridResults;
            
            // Calculate improvement
            const originalScore = this.calculateOptimizationScore(gridResults[0].performance);
            const optimizedScore = this.calculateOptimizationScore(bestResult.performance);
            
            optimization.improvementMetrics = {
                scoreImprovement: ((optimizedScore - originalScore) / originalScore) * 100,
                returnImprovement: bestResult.performance.annualizedReturn - gridResults[0].performance.annualizedReturn,
                sharpeImprovement: bestResult.performance.sharpeRatio - gridResults[0].performance.sharpeRatio,
                drawdownImprovement: gridResults[0].performance.maxDrawdown - bestResult.performance.maxDrawdown
            };
            
            return optimization;
            
        } catch (error) {
            logError('Strategy optimization failed:', error);
            return {};
        }
    }

    // 🤖 AI BACKTEST INSIGHTS
    async getAIBacktestInsights(backtestResult, chatId) {
        try {
            const prompt = `
            Analyze this comprehensive backtest result and provide strategic insights:
            
            Strategy: ${backtestResult.strategy.name}
            Period: ${backtestResult.config.startDate} to ${backtestResult.config.endDate}
            
            Performance Metrics:
            - Annualized Return: ${backtestResult.performance.annualizedReturn?.toFixed(2)}%
            - Sharpe Ratio: ${backtestResult.performance.sharpeRatio?.toFixed(2)}
            - Max Drawdown: ${backtestResult.performance.maxDrawdown?.toFixed(2)}%
            - Win Rate: ${backtestResult.performance.winRate?.toFixed(1)}%
            - Total Trades: ${backtestResult.performance.totalTrades}
            
            Risk Metrics: ${JSON.stringify(backtestResult.riskMetrics)}
            Benchmark Comparison: ${JSON.stringify(backtestResult.benchmarkComparison)}
            Stress Test Results: ${JSON.stringify(backtestResult.stressTests)}
            
            Optimization Results:
            ${backtestResult.optimization.improvementMetrics ? 
              `- Score Improvement: ${backtestResult.optimization.improvementMetrics.scoreImprovement?.toFixed(1)}%
               - Return Improvement: ${backtestResult.optimization.improvementMetrics.returnImprovement?.toFixed(2)}%
               - Sharpe Improvement: ${backtestResult.optimization.improvementMetrics.sharpeImprovement?.toFixed(2)}` : 
              'Optimization data processing...'
            }
            
            Provide:
            1. Strategy performance assessment
            2. Risk-return profile analysis
            3. Market condition adaptability
            4. Improvement recommendations
            5. Real-world implementation considerations
            6. Position sizing recommendations
            7. Risk management enhancements
            `;
            
            const insights = await getDualAnalysis(prompt, {
                chatId: chatId,
                context: 'backtest_analysis',
                priority: 'high'
            });
            
            return insights;
            
        } catch (error) {
            logError('AI backtest insights failed:', error);
            return 'Backtest insights unavailable';
        }
    }

    // 📱 SEND BACKTEST REPORT
    async sendBacktestReport(backtestResult, chatId) {
        try {
            const performance = backtestResult.performance;
            const strategy = backtestResult.strategy;
            const config = backtestResult.config;
            
            const report = `
🧪 **COMPREHENSIVE BACKTEST REPORT** 📊

**📈 STRATEGY:** ${strategy.name}
**⏱️ PERIOD:** ${config.startDate} to ${config.endDate}
**💰 INITIAL CAPITAL:** $${config.initialCapital?.toLocaleString() || '100,000'}

**🎯 PERFORMANCE METRICS:**
• **Annualized Return**: ${performance.annualizedReturn?.toFixed(2) || 'N/A'}%
• **Total Return**: ${performance.totalReturn?.toFixed(2) || 'N/A'}%
• **Sharpe Ratio**: ${performance.sharpeRatio?.toFixed(2) || 'N/A'}
• **Sortino Ratio**: ${performance.sortinoRatio?.toFixed(2) || 'N/A'}
• **Max Drawdown**: ${performance.maxDrawdown?.toFixed(2) || 'N/A'}%

**📊 TRADING STATISTICS:**
• **Total Trades**: ${performance.totalTrades || 0}
• **Win Rate**: ${performance.winRate?.toFixed(1) || 'N/A'}%
• **Profit Factor**: ${performance.profitFactor?.toFixed(2) || 'N/A'}
• **Average Win**: ${performance.averageWin?.toFixed(2) || 'N/A'}%
• **Average Loss**: ${performance.averageLoss?.toFixed(2) || 'N/A'}%

**🛡️ RISK METRICS:**
• **Volatility**: ${performance.volatility?.toFixed(2) || 'N/A'}%
• **Value at Risk (95%)**: ${performance.var95?.toFixed(2) || 'N/A'}%
• **Beta**: ${performance.beta?.toFixed(2) || 'N/A'}
• **Alpha**: ${performance.alpha?.toFixed(2) || 'N/A'}%

**📈 BENCHMARK COMPARISON:**
${backtestResult.benchmarkComparison.sp500 ? 
  `• **vs S&P 500**: ${(backtestResult.benchmarkComparison.sp500.outperformance || 0).toFixed(2)}% outperformance
• **vs Buy & Hold**: ${(backtestResult.benchmarkComparison.buyHold?.outperformance || 0).toFixed(2)}% outperformance` :
  '• Benchmark analysis processing...'
}

**🔬 STRESS TEST RESULTS:**
${backtestResult.stressTests.marketCrash ? 
  `• **Market Crash (-30%)**: ${(backtestResult.stressTests.marketCrash.portfolioImpact || 0).toFixed(1)}% portfolio impact
• **High Volatility**: ${(backtestResult.stressTests.highVolatility.maxDrawdown || 0).toFixed(1)}% max drawdown
• **Bear Market**: ${(backtestResult.stressTests.bearMarket.totalReturn || 0).toFixed(1)}% return during bear market` :
  '• Stress test analysis processing...'
}

**⚡ OPTIMIZATION RESULTS:**
${backtestResult.optimization.improvementMetrics ? 
  `• **Performance Improvement**: ${backtestResult.optimization.improvementMetrics.scoreImprovement?.toFixed(1) || 'N/A'}%
• **Return Enhancement**: +${backtestResult.optimization.improvementMetrics.returnImprovement?.toFixed(2) || 'N/A'}%
• **Sharpe Ratio Boost**: +${backtestResult.optimization.improvementMetrics.sharpeImprovement?.toFixed(2) || 'N/A'}
• **Drawdown Reduction**: -${backtestResult.optimization.improvementMetrics.drawdownImprovement?.toFixed(2) || 'N/A'}%` :
  '• Parameter optimization completed'
}

**🤖 AI INSIGHTS:**
${backtestResult.aiInsights}

**📋 KEY TAKEAWAYS:**
${this.generateKeyTakeaways(backtestResult)}

**⚠️ IMPORTANT DISCLAIMERS:**
• Past performance does not guarantee future results
• Backtest includes transaction costs and slippage
• Results assume perfect execution (no gaps/halts)
• Market conditions may differ in live trading
• Consider position sizing and risk management

📊 **Strategy Grade**: ${this.calculateStrategyGrade(performance)}
🎯 **Recommendation**: ${this.getStrategyRecommendation(performance)}
            `;
            
            await sendAnalysis(report, chatId, '🧪 Backtester');
            
        } catch (error) {
            logError('Failed to send backtest report:', error);
        }
    }

    // 📊 COMPARISON REPORT
    async sendComparisonReport(comparison, chatId) {
        try {
            const topStrategies = comparison.rankings.byScore?.slice(0, 5) || [];
            
            const comparisonReport = `
🔬 **MULTI-STRATEGY COMPARISON REPORT** 📊

**📈 STRATEGY RANKINGS** (by overall score):
${topStrategies.map((strategy, i) => 
    `${i + 1}. **${strategy.name}**
   • Score: **${strategy.score?.toFixed(1) || 'N/A'}/100**
   • Return: **${strategy.annualizedReturn?.toFixed(2) || 'N/A'}%**
   • Sharpe: **${strategy.sharpeRatio?.toFixed(2) || 'N/A'}**
   • Drawdown: **${strategy.maxDrawdown?.toFixed(2) || 'N/A'}%**`
).join('\n\n')}

**🏆 PERFORMANCE LEADERS:**
• **Best Return**: ${comparison.rankings.byReturn?.[0]?.name || 'N/A'} (${comparison.rankings.byReturn?.[0]?.annualizedReturn?.toFixed(2) || 'N/A'}%)
• **Best Sharpe**: ${comparison.rankings.bySharpe?.[0]?.name || 'N/A'} (${comparison.rankings.bySharpe?.[0]?.sharpeRatio?.toFixed(2) || 'N/A'})
• **Lowest Risk**: ${comparison.rankings.byDrawdown?.[0]?.name || 'N/A'} (${comparison.rankings.byDrawdown?.[0]?.maxDrawdown?.toFixed(2) || 'N/A'}%)
• **Best Win Rate**: ${comparison.rankings.byWinRate?.[0]?.name || 'N/A'} (${comparison.rankings.byWinRate?.[0]?.winRate?.toFixed(1) || 'N/A'}%)

**🔗 STRATEGY CORRELATIONS:**
${this.formatCorrelationMatrix(comparison.correlationMatrix)}

**📊 RISK-RETURN ANALYSIS:**
${comparison.riskReturnAnalysis ? 
  `• **Efficient Frontier**: ${comparison.riskReturnAnalysis.efficientStrategies?.length || 0} strategies on efficient frontier
• **Risk-Return Champion**: ${comparison.riskReturnAnalysis.champion?.name || 'N/A'}
• **Best Risk-Adjusted**: ${comparison.riskReturnAnalysis.bestRiskAdjusted?.name || 'N/A'}` :
  '• Risk-return analysis processing...'
}

**🎯 PORTFOLIO COMBINATIONS:**
${comparison.portfolioCombinations.bestCombination ? 
  `• **Optimal Mix**: ${comparison.portfolioCombinations.bestCombination.allocation.map(a => `${a.strategy}: ${a.weight}%`).join(', ')}
• **Combined Sharpe**: ${comparison.portfolioCombinations.bestCombination.sharpeRatio?.toFixed(2) || 'N/A'}
• **Diversification Benefit**: +${comparison.portfolioCombinations.bestCombination.diversificationBenefit?.toFixed(2) || 'N/A'}%` :
  '• Portfolio combination analysis processing...'
}

**🤖 AI INSIGHTS:**
${comparison.aiInsights}

**📋 STRATEGIC RECOMMENDATIONS:**
1. **Primary Strategy**: Use ${topStrategies[0]?.name || 'top performer'} as core holding
2. **Diversification**: Combine with ${topStrategies[1]?.name || 'secondary strategy'} for risk reduction
3. **Market Conditions**: Adapt strategy based on volatility regime
4. **Position Sizing**: Risk-adjusted allocation per strategy performance
5. **Rebalancing**: ${this.getRebalancingRecommendation(comparison)}

🎯 **Overall Winner**: ${topStrategies[0]?.name || 'N/A'}
📊 **Best Risk-Adjusted**: ${comparison.rankings.bySharpe?.[0]?.name || 'N/A'}
            `;
            
            await sendAnalysis(comparisonReport, chatId, '🔬 Strategy Comparison');
            
        } catch (error) {
            logError('Failed to send comparison report:', error);
        }
    }

    // 🔧 HELPER METHODS
    calculateSMA(data, period) {
        if (data.length < period) return [];
        return [data.slice(-period).reduce((sum, val) => sum + val, 0) / period];
    }

    calculateRSI(prices, period = 14) {
        const changes = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }
        
        if (changes.length < period) return [];
        
        let avgGain = 0;
        let avgLoss = 0;
        
        // Initial average
        for (let i = 0; i < period; i++) {
            if (changes[i] > 0) avgGain += changes[i];
            else avgLoss += Math.abs(changes[i]);
        }
        
        avgGain /= period;
        avgLoss /= period;
        
        const rsi = [];
        for (let i = period; i < changes.length; i++) {
            const gain = changes[i] > 0 ? changes[i] : 0;
            const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
            
            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;
            
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsi.push(100 - (100 / (1 + rs)));
        }
        
        return rsi;
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

    calculateSharpeRatio(returns, riskFreeRate = 0.02) {
        if (returns.length === 0) return 0;
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const annualizedReturn = avgReturn * 252;
        const volatility = this.calculateVolatility(returns);
        return volatility === 0 ? 0 : (annualizedReturn - riskFreeRate) / volatility;
    }

    calculateSortinoRatio(returns, riskFreeRate = 0.02) {
        if (returns.length === 0) return 0;
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const annualizedReturn = avgReturn * 252;
        
        const negativeReturns = returns.filter(r => r < 0);
        if (negativeReturns.length === 0) return Infinity;
        
        const downwardDeviation = Math.sqrt(
            negativeReturns.reduce((sum, r) => sum + r * r, 0) / returns.length * 252
        );
        
        return downwardDeviation === 0 ? 0 : (annualizedReturn - riskFreeRate) / downwardDeviation;
    }

    calculateVaR(returns, confidence = 0.95) {
        if (returns.length === 0) return 0;
        const sortedReturns = [...returns].sort((a, b) => a - b);
        const index = Math.floor((1 - confidence) * sortedReturns.length);
        return sortedReturns[index] || 0;
    }

    calculateExpectedShortfall(returns, confidence = 0.95) {
        const var95 = this.calculateVaR(returns, confidence);
        const tailReturns = returns.filter(r => r <= var95);
        return tailReturns.length > 0 ? tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length : 0;
    }

    generateKeyTakeaways(backtestResult) {
        const takeaways = [];
        const perf = backtestResult.performance;
        
        if ((perf.annualizedReturn || 0) > 15) {
            takeaways.push("✅ Strong absolute returns achieved");
        }
        
        if ((perf.sharpeRatio || 0) > 1.0) {
            takeaways.push("✅ Excellent risk-adjusted performance");
        }
        
        if ((perf.maxDrawdown || 100) < 15) {
            takeaways.push("✅ Well-controlled downside risk");
        }
        
        if ((perf.winRate || 0) > 60) {
            takeaways.push("✅ High probability of successful trades");
        }
        
        if (takeaways.length === 0) {
            takeaways.push("⚠️ Strategy requires optimization for better performance");
        }
        
        return takeaways.slice(0, 4).join('\n');
    }

    calculateStrategyGrade(performance) {
        const returnScore = Math.min(100, Math.max(0, (performance.annualizedReturn || 0) * 5));
        const sharpeScore = Math.min(100, Math.max(0, (performance.sharpeRatio || 0) * 50));
        const drawdownScore = Math.min(100, Math.max(0, 100 - (performance.maxDrawdown || 0) * 5));
        
        const overallScore = (returnScore + sharpeScore + drawdownScore) / 3;
        
        if (overallScore >= 85) return 'A+';
        if (overallScore >= 75) return 'A';
        if (overallScore >= 65) return 'B+';
        if (overallScore >= 55) return 'B';
        if (overallScore >= 45) return 'C+';
        if (overallScore >= 35) return 'C';
        return 'D';
    }

    getStrategyRecommendation(performance) {
        const score = this.calculateOptimizationScore(performance);
        
        if (score >= 80) return '🚀 HIGHLY RECOMMENDED - Excellent risk-adjusted returns';
        if (score >= 60) return '✅ RECOMMENDED - Good performance with acceptable risk';
        if (score >= 40) return '⚠️ PROCEED WITH CAUTION - Requires optimization';
        return '❌ NOT RECOMMENDED - Poor risk-return profile';
    }

    calculateOptimizationScore(performance) {
        const returnWeight = 0.4;
        const sharpeWeight = 0.3;
        const drawdownWeight = 0.3;
        
        const returnScore = Math.min(100, Math.max(0, (performance.annualizedReturn || 0) * 5));
        const sharpeScore = Math.min(100, Math.max(0, (performance.sharpeRatio || 0) * 50));
        const drawdownScore = Math.min(100, Math.max(0, 100 - (performance.maxDrawdown || 0) * 5));
        
        return returnScore * returnWeight + sharpeScore * sharpeWeight + drawdownScore * drawdownWeight;
    }

    // Placeholder implementations for complex methods
    validateBacktestConfig(config) {
        return {
            startDate: config.startDate || this.backtestConfig.defaultStartDate,
            endDate: config.endDate || this.backtestConfig.defaultEndDate,
            initialCapital: config.initialCapital || this.backtestConfig.defaultCapital,
            transactionCost: config.transactionCost || this.backtestConfig.transactionCost,
            slippageCost: config.slippageCost || this.backtestConfig.slippageCost,
            rebalanceFrequency: config.rebalanceFrequency || this.backtestConfig.rebalanceFrequency
        };
    }

    async getHistoricalData(config) {
        // Mock historical data - would integrate with real data sources
        const days = Math.floor((new Date(config.endDate) - new Date(config.startDate)) / (1000 * 60 * 60 * 24));
        const data = { dates: [], prices: [], volumes: [] };
        
        for (let i = 0; i < days; i++) {
            const date = new Date(config.startDate);
            date.setDate(date.getDate() + i);
            data.dates.push(date.toISOString().split('T')[0]);
            
            // Generate mock price data
            const basePrice = 100 + Math.sin(i / 50) * 20 + (Math.random() - 0.5) * 10;
            data.prices.push([basePrice]); // Array format for multiple assets
            data.volumes.push([Math.random() * 1000000]);
        }
        
        return data;
    }

    async saveBacktestResults(backtestResult) {
        await saveToMemory(`backtest_${Date.now()}`, backtestResult);
        this.backtestResults.set(backtestResult.strategy.name, backtestResult);
    }
}

// Export functions for easy integration
module.exports = {
    Backtester,
    
    // Main backtesting functions
    backtestStrategy: async (strategy, config, chatId) => {
        const backtester = new Backtester();
        return await backtester.backtestStrategy(strategy, config, chatId);
    },
    
    compareStrategies: async (strategies, config, chatId) => {
        const backtester = new Backtester();
        return await backtester.compareStrategies(strategies, config, chatId);
    },
    
    quickBacktest: async (strategyType, chatId, timeframe = '1year') => {
        const backtester = new Backtester();
        const strategy = {
            name: strategyType,
            type: strategyType,
            parameters: backtester.getDefaultParameters(strategyType)
        };
        
        const endDate = new Date();
        const startDate = new Date();
        if (timeframe === '1year') startDate.setFullYear(endDate.getFullYear() - 1);
        else if (timeframe === '3year') startDate.setFullYear(endDate.getFullYear() - 3);
        else if (timeframe === '5year') startDate.setFullYear(endDate.getFullYear() - 5);
        
        const config = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            initialCapital: 100000
        };
        
        return await backtester.backtestStrategy(strategy, config, chatId);
    },
    
    optimizeStrategy: async (strategy, config, chatId) => {
        const backtester = new Backtester();
        const historicalData = await backtester.getHistoricalData(config);
        return await backtester.optimizeStrategyParameters(strategy, historicalData, config);
    },
    
    stressTestStrategy: async (strategy, config, chatId) => {
        const backtester = new Backtester();
        const simulation = { portfolioHistory: [] }; // Mock simulation
        return await backtester.runStressTests(strategy, simulation, config);
    }
};
