// utils/arbitrageDetector.js
const { getUniversalAnalysis, getDualAnalysis } = require('./dualAISystem');
const { sendSmartMessage, sendAnalysis } = require('./telegramSplitter');
const { getLivePrice, getMarketData } = require('./liveData');
const { assessRisk, calculatePositionSize } = require('./riskManager');
const { scanMarkets } = require('./marketScanner');
const { sendCustomAlert } = require('./alertSystem');
const { logInfo, logError, logWarning } = require('./logger');
const { saveToMemory, getFromMemory } = require('./memory');

class ArbitrageDetector {
    constructor() {
        this.arbitrageTypes = {
            // Price Arbitrage
            priceArbitrage: { 
                name: 'Price Arbitrage', 
                riskLevel: 1, 
                executionTime: 'seconds', 
                category: 'price',
                description: 'Same asset, different prices across exchanges'
            },
            spatialArbitrage: { 
                name: 'Spatial Arbitrage', 
                riskLevel: 2, 
                executionTime: 'minutes', 
                category: 'geographic',
                description: 'Geographic price differences'
            },
            temporalArbitrage: { 
                name: 'Temporal Arbitrage', 
                riskLevel: 3, 
                executionTime: 'hours', 
                category: 'time',
                description: 'Time-based price inefficiencies'
            },
            
            // Statistical Arbitrage
            pairsTrading: { 
                name: 'Pairs Trading', 
                riskLevel: 4, 
                executionTime: 'days', 
                category: 'statistical',
                description: 'Relative value between correlated assets'
            },
            meanReversion: { 
                name: 'Mean Reversion', 
                riskLevel: 5, 
                executionTime: 'days', 
                category: 'statistical',
                description: 'Price deviation from historical mean'
            },
            statisticalSpread: { 
                name: 'Statistical Spread', 
                riskLevel: 4, 
                executionTime: 'hours', 
                category: 'statistical',
                description: 'Statistical relationship exploitation'
            },
            
            // Cross-Market Arbitrage
            triangularArbitrage: { 
                name: 'Triangular Arbitrage', 
                riskLevel: 2, 
                executionTime: 'seconds', 
                category: 'currency',
                description: 'Currency cross-rate inefficiencies'
            },
            crossExchange: { 
                name: 'Cross-Exchange', 
                riskLevel: 3, 
                executionTime: 'minutes', 
                category: 'exchange',
                description: 'Price differences between exchanges'
            },
            crossAsset: { 
                name: 'Cross-Asset', 
                riskLevel: 6, 
                executionTime: 'hours', 
                category: 'asset',
                description: 'Related asset price discrepancies'
            },
            
            // Derivative Arbitrage
            convertibleBond: { 
                name: 'Convertible Bond', 
                riskLevel: 5, 
                executionTime: 'days', 
                category: 'derivative',
                description: 'Bond vs underlying stock mispricing'
            },
            optionParity: { 
                name: 'Put-Call Parity', 
                riskLevel: 4, 
                executionTime: 'minutes', 
                category: 'derivative',
                description: 'Options pricing model violations'
            },
            futuresSpot: { 
                name: 'Futures-Spot', 
                riskLevel: 3, 
                executionTime: 'hours', 
                category: 'derivative',
                description: 'Futures vs spot price differences'
            },
            
            // Market Structure Arbitrage
            mergerArbitrage: { 
                name: 'Merger Arbitrage', 
                riskLevel: 7, 
                executionTime: 'months', 
                category: 'event',
                description: 'M&A announcement price gaps'
            },
            dividendCapture: { 
                name: 'Dividend Capture', 
                riskLevel: 3, 
                executionTime: 'days', 
                category: 'event',
                description: 'Dividend payment arbitrage'
            },
            calendarSpread: { 
                name: 'Calendar Spread', 
                riskLevel: 4, 
                executionTime: 'weeks', 
                category: 'time',
                description: 'Time decay arbitrage'
            }
        };
        
        this.exchanges = {
            crypto: ['Binance', 'Coinbase', 'Kraken', 'Bitfinex', 'KuCoin', 'Huobi', 'FTX'],
            stocks: ['NYSE', 'NASDAQ', 'LSE', 'TSE', 'HKEX', 'ASX'],
            forex: ['Interactive Brokers', 'FXCM', 'Oanda', 'XM', 'IG'],
            commodities: ['CME', 'LME', 'ICE', 'COMEX'],
            bonds: ['Bloomberg', 'Tradeweb', 'MarketAxess']
        };
        
        this.thresholds = {
            minProfitBps: 10,        // 10 basis points minimum profit
            maxExecutionTime: 300,    // 5 minutes max execution time
            minLiquidity: 10000,      // $10k minimum liquidity
            maxSlippage: 0.001,       // 0.1% max slippage
            minConfidence: 70,        // 70% minimum confidence
            maxRiskLevel: 6           // Maximum risk level 6/10
        };
        
        this.opportunities = new Map();
        this.executionHistory = [];
        this.profitTracking = [];
        this.activeMonitoring = new Set();
    }

    // 🎯 COMPREHENSIVE ARBITRAGE SCANNING
    async scanAllArbitrageOpportunities(preferences, chatId) {
        try {
            logInfo('🔄 Starting comprehensive arbitrage opportunity scan');
            
            const arbitrageScan = {
                timestamp: Date.now(),
                totalOpportunities: 0,
                categories: {},
                highProbability: [],
                immediateExecution: [],
                riskAssessment: {},
                profitProjections: {},
                executionPlan: {},
                aiInsights: ''
            };

            // Parallel scanning of all arbitrage types
            const scanPromises = [
                this.scanPriceArbitrage(preferences),
                this.scanSpatialArbitrage(preferences),
                this.scanTriangularArbitrage(preferences),
                this.scanPairsTrading(preferences),
                this.scanMeanReversionArbitrage(preferences),
                this.scanCrossExchangeArbitrage(preferences),
                this.scanDerivativeArbitrage(preferences),
                this.scanMergerArbitrage(preferences),
                this.scanDividendCapture(preferences),
                this.scanCalendarSpreads(preferences),
                this.scanStatisticalArbitrage(preferences)
            ];

            const results = await Promise.allSettled(scanPromises);
            
            // Consolidate results
            const categoryNames = Object.keys(this.arbitrageTypes).slice(0, 11);
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    const categoryKey = categoryNames[index] || `category_${index}`;
                    arbitrageScan.categories[categoryKey] = result.value;
                    arbitrageScan.totalOpportunities += result.value.opportunities?.length || 0;
                }
            });

            // Filter high probability opportunities
            arbitrageScan.highProbability = await this.filterHighProbabilityOpportunities(arbitrageScan.categories);
            
            // Identify immediate execution opportunities
            arbitrageScan.immediateExecution = await this.identifyImmediateOpportunities(arbitrageScan.highProbability);
            
            // Assess overall risk
            arbitrageScan.riskAssessment = await this.assessArbitrageRisk(arbitrageScan.categories);
            
            // Project profit potential
            arbitrageScan.profitProjections = await this.projectArbitrageProfits(arbitrageScan.highProbability);
            
            // Create execution plan
            arbitrageScan.executionPlan = await this.createExecutionPlan(arbitrageScan.immediateExecution);
            
            // Get AI insights
            arbitrageScan.aiInsights = await this.getAIArbitrageInsights(arbitrageScan, chatId);
            
            // Send comprehensive report
            await this.sendArbitrageReport(arbitrageScan, chatId);
            
            // Send immediate alerts for high-value opportunities
            await this.sendImmediateArbitrageAlerts(arbitrageScan.immediateExecution, chatId);
            
            // Save scan results
            await this.saveArbitrageScan(arbitrageScan);
            
            return arbitrageScan;
            
        } catch (error) {
            logError('Arbitrage scan failed:', error);
            throw error;
        }
    }

    // 💰 PRICE ARBITRAGE DETECTION
    async scanPriceArbitrage(preferences = {}) {
        try {
            const opportunities = [];
            const assets = preferences.assets || ['BTC', 'ETH', 'AAPL', 'TSLA', 'GOLD'];
            
            for (const asset of assets) {
                const exchangePrices = await this.getExchangePrices(asset);
                const arbitrageOpps = this.detectPriceDiscrepancies(asset, exchangePrices);
                opportunities.push(...arbitrageOpps);
            }
            
            return {
                category: 'priceArbitrage',
                opportunities: opportunities,
                averageSpread: this.calculateAverageSpread(opportunities),
                executionComplexity: 'Low',
                timeToExecution: 'Immediate',
                riskLevel: 1
            };
            
        } catch (error) {
            logError('Price arbitrage scan failed:', error);
            return { category: 'priceArbitrage', opportunities: [], error: error.message };
        }
    }

    // 🌍 SPATIAL ARBITRAGE DETECTION
    async scanSpatialArbitrage(preferences = {}) {
        try {
            const opportunities = [];
            const regions = ['US', 'EU', 'ASIA', 'UK'];
            const assets = preferences.assets || ['GOLD', 'OIL', 'BTC', 'MAJOR_STOCKS'];
            
            for (const asset of assets) {
                for (let i = 0; i < regions.length; i++) {
                    for (let j = i + 1; j < regions.length; j++) {
                        const opportunity = await this.detectSpatialOpportunity(asset, regions[i], regions[j]);
                        if (opportunity.profitable) {
                            opportunities.push(opportunity);
                        }
                    }
                }
            }
            
            return {
                category: 'spatialArbitrage',
                opportunities: opportunities,
                averageSpread: this.calculateAverageSpread(opportunities),
                executionComplexity: 'Medium',
                timeToExecution: '5-30 minutes',
                riskLevel: 2
            };
            
        } catch (error) {
            logError('Spatial arbitrage scan failed:', error);
            return { category: 'spatialArbitrage', opportunities: [], error: error.message };
        }
    }

    // 🔺 TRIANGULAR ARBITRAGE DETECTION
    async scanTriangularArbitrage(preferences = {}) {
        try {
            const opportunities = [];
            const currencyPairs = [
                ['USD', 'EUR', 'GBP'],
                ['USD', 'JPY', 'EUR'],
                ['BTC', 'ETH', 'USDT'],
                ['USD', 'CHF', 'EUR'],
                ['GBP', 'JPY', 'USD']
            ];
            
            for (const triangle of currencyPairs) {
                const opportunity = await this.detectTriangularOpportunity(triangle);
                if (opportunity.profitable) {
                    opportunities.push(opportunity);
                }
            }
            
            return {
                category: 'triangularArbitrage',
                opportunities: opportunities,
                averageSpread: this.calculateAverageSpread(opportunities),
                executionComplexity: 'Medium',
                timeToExecution: 'Seconds',
                riskLevel: 2
            };
            
        } catch (error) {
            logError('Triangular arbitrage scan failed:', error);
            return { category: 'triangularArbitrage', opportunities: [], error: error.message };
        }
    }

    // 👥 PAIRS TRADING ARBITRAGE
    async scanPairsTrading(preferences = {}) {
        try {
            const opportunities = [];
            const pairs = [
                ['AAPL', 'MSFT'],
                ['KO', 'PEP'],
                ['JPM', 'BAC'],
                ['XOM', 'CVX'],
                ['BTC', 'ETH'],
                ['GOLD', 'SILVER']
            ];
            
            for (const [asset1, asset2] of pairs) {
                const opportunity = await this.detectPairsOpportunity(asset1, asset2);
                if (opportunity.profitable) {
                    opportunities.push(opportunity);
                }
            }
            
            return {
                category: 'pairsTrading',
                opportunities: opportunities,
                averageSpread: this.calculateAverageSpread(opportunities),
                executionComplexity: 'High',
                timeToExecution: 'Hours to Days',
                riskLevel: 4
            };
            
        } catch (error) {
            logError('Pairs trading scan failed:', error);
            return { category: 'pairsTrading', opportunities: [], error: error.message };
        }
    }

    // 📊 STATISTICAL ARBITRAGE
    async scanStatisticalArbitrage(preferences = {}) {
        try {
            const opportunities = [];
            
            // Mean reversion opportunities
            const meanReversionOpps = await this.detectMeanReversionOpportunities();
            opportunities.push(...meanReversionOpps);
            
            // Cointegration opportunities
            const cointegrationOpps = await this.detectCointegrationOpportunities();
            opportunities.push(...cointegrationOpps);
            
            // Momentum arbitrage
            const momentumOpps = await this.detectMomentumArbitrageOpportunities();
            opportunities.push(...momentumOpps);
            
            return {
                category: 'statisticalArbitrage',
                opportunities: opportunities,
                averageSpread: this.calculateAverageSpread(opportunities),
                executionComplexity: 'Very High',
                timeToExecution: 'Days to Weeks',
                riskLevel: 5
            };
            
        } catch (error) {
            logError('Statistical arbitrage scan failed:', error);
            return { category: 'statisticalArbitrage', opportunities: [], error: error.message };
        }
    }

    // 🔄 CROSS-EXCHANGE ARBITRAGE
    async scanCrossExchangeArbitrage(preferences = {}) {
        try {
            const opportunities = [];
            const assets = ['BTC', 'ETH', 'ADA', 'DOT', 'MATIC'];
            const exchanges = this.exchanges.crypto;
            
            for (const asset of assets) {
                for (let i = 0; i < exchanges.length; i++) {
                    for (let j = i + 1; j < exchanges.length; j++) {
                        const opportunity = await this.detectCrossExchangeOpportunity(
                            asset, 
                            exchanges[i], 
                            exchanges[j]
                        );
                        if (opportunity.profitable) {
                            opportunities.push(opportunity);
                        }
                    }
                }
            }
            
            return {
                category: 'crossExchange',
                opportunities: opportunities,
                averageSpread: this.calculateAverageSpread(opportunities),
                executionComplexity: 'Medium',
                timeToExecution: '1-10 minutes',
                riskLevel: 3
            };
            
        } catch (error) {
            logError('Cross-exchange arbitrage scan failed:', error);
            return { category: 'crossExchange', opportunities: [], error: error.message };
        }
    }

    // 📈 DERIVATIVE ARBITRAGE
    async scanDerivativeArbitrage(preferences = {}) {
        try {
            const opportunities = [];
            
            // Put-call parity violations
            const putCallOpps = await this.detectPutCallParityViolations();
            opportunities.push(...putCallOpps);
            
            // Futures-spot arbitrage
            const futuresSpotOpps = await this.detectFuturesSpotArbitrage();
            opportunities.push(...futuresSpotOpps);
            
            // Convertible bond arbitrage
            const convertibleOpps = await this.detectConvertibleBondArbitrage();
            opportunities.push(...convertibleOpps);
            
            return {
                category: 'derivativeArbitrage',
                opportunities: opportunities,
                averageSpread: this.calculateAverageSpread(opportunities),
                executionComplexity: 'Very High',
                timeToExecution: 'Minutes to Hours',
                riskLevel: 5
            };
            
        } catch (error) {
            logError('Derivative arbitrage scan failed:', error);
            return { category: 'derivativeArbitrage', opportunities: [], error: error.message };
        }
    }

    // 🏢 MERGER ARBITRAGE
    async scanMergerArbitrage(preferences = {}) {
        try {
            const opportunities = [];
            const activeMergers = await this.getActiveMergerAnnouncements();
            
            for (const merger of activeMergers) {
                const opportunity = await this.analyzeMergerArbitrageOpportunity(merger);
                if (opportunity.profitable) {
                    opportunities.push(opportunity);
                }
            }
            
            return {
                category: 'mergerArbitrage',
                opportunities: opportunities,
                averageSpread: this.calculateAverageSpread(opportunities),
                executionComplexity: 'High',
                timeToExecution: 'Weeks to Months',
                riskLevel: 7
            };
            
        } catch (error) {
            logError('Merger arbitrage scan failed:', error);
            return { category: 'mergerArbitrage', opportunities: [], error: error.message };
        }
    }

    // 💵 DIVIDEND CAPTURE ARBITRAGE
    async scanDividendCapture(preferences = {}) {
        try {
            const opportunities = [];
            const dividendStocks = await this.getUpcomingDividendStocks();
            
            for (const stock of dividendStocks) {
                const opportunity = await this.analyzeDividendCaptureOpportunity(stock);
                if (opportunity.profitable) {
                    opportunities.push(opportunity);
                }
            }
            
            return {
                category: 'dividendCapture',
                opportunities: opportunities,
                averageSpread: this.calculateAverageSpread(opportunities),
                executionComplexity: 'Medium',
                timeToExecution: '1-5 days',
                riskLevel: 3
            };
            
        } catch (error) {
            logError('Dividend capture scan failed:', error);
            return { category: 'dividendCapture', opportunities: [], error: error.message };
        }
    }

    // 🎯 HIGH PROBABILITY OPPORTUNITY FILTERING
    async filterHighProbabilityOpportunities(categories) {
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
            
            // Filter and score opportunities
            const filteredOpportunities = allOpportunities
                .filter(opp => {
                    return (
                        (opp.profitBps || 0) >= this.thresholds.minProfitBps &&
                        (opp.confidence || 0) >= this.thresholds.minConfidence &&
                        (opp.riskLevel || 10) <= this.thresholds.maxRiskLevel &&
                        (opp.liquidity || 0) >= this.thresholds.minLiquidity
                    );
                })
                .map(opp => {
                    // Calculate opportunity score
                    const profitScore = Math.min(100, (opp.profitBps || 0) * 2);
                    const riskScore = Math.max(0, 100 - (opp.riskLevel || 5) * 10);
                    const liquidityScore = Math.min(100, (opp.liquidity || 0) / 1000);
                    const timeScore = this.calculateTimeScore(opp.executionTime);
                    
                    opp.opportunityScore = (
                        profitScore * 0.4 +
                        riskScore * 0.3 +
                        liquidityScore * 0.2 +
                        timeScore * 0.1
                    );
                    
                    return opp;
                })
                .sort((a, b) => b.opportunityScore - a.opportunityScore);
            
            return filteredOpportunities.slice(0, 20); // Top 20 opportunities
            
        } catch (error) {
            logError('High probability filtering failed:', error);
            return [];
        }
    }

    // ⚡ IMMEDIATE EXECUTION OPPORTUNITIES
    async identifyImmediateOpportunities(opportunities) {
        try {
            return opportunities.filter(opp => {
                const executionTypes = ['seconds', 'immediate', '1-5 minutes'];
                const timeMatch = executionTypes.some(type => 
                    (opp.executionTime || '').toLowerCase().includes(type)
                );
                
                return (
                    timeMatch &&
                    (opp.profitBps || 0) >= 25 && // 25 bps minimum for immediate execution
                    (opp.confidence || 0) >= 80 && // 80% confidence minimum
                    (opp.riskLevel || 10) <= 3 // Low risk only
                );
            });
            
        } catch (error) {
            logError('Immediate opportunity identification failed:', error);
            return [];
        }
    }

    // 📊 PROFIT PROJECTIONS
    async projectArbitrageProfits(opportunities) {
        try {
            const projections = {
                immediate: { count: 0, totalProfit: 0, avgProfitBps: 0 },
                shortTerm: { count: 0, totalProfit: 0, avgProfitBps: 0 },
                mediumTerm: { count: 0, totalProfit: 0, avgProfitBps: 0 },
                longTerm: { count: 0, totalProfit: 0, avgProfitBps: 0 },
                total: { count: 0, totalProfit: 0, avgProfitBps: 0 }
            };
            
            const investmentAmount = 100000; // $100k reference amount
            
            opportunities.forEach(opp => {
                const profitDollars = (opp.profitBps / 10000) * investmentAmount;
                const timeCategory = this.categorizeExecutionTime(opp.executionTime);
                
                projections[timeCategory].count++;
                projections[timeCategory].totalProfit += profitDollars;
                projections[timeCategory].avgProfitBps += opp.profitBps || 0;
                
                projections.total.count++;
                projections.total.totalProfit += profitDollars;
                projections.total.avgProfitBps += opp.profitBps || 0;
            });
            
            // Calculate averages
            Object.keys(projections).forEach(category => {
                const proj = projections[category];
                if (proj.count > 0) {
                    proj.avgProfitBps = proj.avgProfitBps / proj.count;
                    proj.avgProfitDollars = proj.totalProfit / proj.count;
                    proj.annualizedReturn = this.calculateAnnualizedReturn(proj.avgProfitBps, category);
                }
            });
            
            return projections;
            
        } catch (error) {
            logError('Profit projection failed:', error);
            return {};
        }
    }

    // 🎯 EXECUTION PLAN CREATION
    async createExecutionPlan(immediateOpportunities) {
        try {
            const plan = {
                totalOpportunities: immediateOpportunities.length,
                prioritizedList: [],
                executionSteps: [],
                riskManagement: {},
                capitalAllocation: {},
                expectedResults: {}
            };
            
            // Prioritize opportunities
            plan.prioritizedList = immediateOpportunities
                .sort((a, b) => {
                    const scoreA = (a.profitBps || 0) * (a.confidence || 0) / (a.riskLevel || 1);
                    const scoreB = (b.profitBps || 0) * (b.confidence || 0) / (b.riskLevel || 1);
                    return scoreB - scoreA;
                })
                .slice(0, 5); // Top 5 for execution
            
            // Create execution steps
            plan.executionSteps = plan.prioritizedList.map((opp, index) => ({
                step: index + 1,
                opportunity: opp,
                action: this.generateExecutionAction(opp),
                timing: this.calculateOptimalTiming(opp),
                capitalRequired: this.calculateCapitalRequirement(opp),
                expectedProfit: this.calculateExpectedProfit(opp),
                riskMitigation: this.generateRiskMitigation(opp)
            }));
            
            // Risk management
            plan.riskManagement = {
                maxPositionSize: 0.05, // 5% max per opportunity
                stopLossLevels: plan.prioritizedList.map(opp => this.calculateStopLoss(opp)),
                hedgingStrategies: this.generateHedgingStrategies(plan.prioritizedList),
                monitoring: 'Real-time execution monitoring required'
            };
            
            // Capital allocation
            const totalCapital = 500000; // $500k reference
            plan.capitalAllocation = this.allocateCapital(plan.prioritizedList, totalCapital);
            
            return plan;
            
        } catch (error) {
            logError('Execution plan creation failed:', error);
            return {};
        }
    }

    // 🤖 AI ARBITRAGE INSIGHTS
    async getAIArbitrageInsights(arbitrageScan, chatId) {
        try {
            const prompt = `
            Analyze these comprehensive arbitrage opportunities and provide strategic insights:
            
            Arbitrage Scan Summary:
            - Total Opportunities: ${arbitrageScan.totalOpportunities}
            - High Probability Opportunities: ${arbitrageScan.highProbability.length}
            - Immediate Execution Opportunities: ${arbitrageScan.immediateExecution.length}
            
            Top Opportunities:
            ${arbitrageScan.highProbability.slice(0, 5).map(opp => 
                `- ${opp.type}: ${opp.profitBps}bps profit, ${opp.confidence}% confidence, Risk ${opp.riskLevel}/10`
            ).join('\n')}
            
            Profit Projections: ${JSON.stringify(arbitrageScan.profitProjections)}
            Risk Assessment: ${JSON.stringify(arbitrageScan.riskAssessment)}
            
            Provide:
            1. Market inefficiency analysis
            2. Best arbitrage strategies for current conditions
            3. Risk assessment and mitigation
            4. Execution timing recommendations
            5. Capital allocation strategy
            6. Technology and infrastructure needs
            7. Regulatory considerations
            `;
            
            const insights = await getDualAnalysis(prompt, {
                chatId: chatId,
                context: 'arbitrage_analysis',
                priority: 'high'
            });
            
            return insights;
            
        } catch (error) {
            logError('AI arbitrage insights failed:', error);
            return 'Arbitrage insights unavailable';
        }
    }

    // 📱 SEND ARBITRAGE REPORT
    async sendArbitrageReport(arbitrageScan, chatId) {
        try {
            const topOpportunities = arbitrageScan.highProbability.slice(0, 6);
            const immediateOpps = arbitrageScan.immediateExecution;
            const projections = arbitrageScan.profitProjections;
            
            const report = `
🔄 **COMPREHENSIVE ARBITRAGE DETECTOR REPORT** 💰

**📊 SCAN SUMMARY:**
• Total Opportunities: **${arbitrageScan.totalOpportunities}**
• High Probability: **${arbitrageScan.highProbability.length}**
• Immediate Execution: **${immediateOpps.length}** ⚡
• Categories Scanned: **${Object.keys(arbitrageScan.categories).length}**

**⚡ IMMEDIATE OPPORTUNITIES:**
${immediateOpps.slice(0, 3).map((opp, i) => 
    `${i + 1}. **${opp.type || 'Arbitrage'}** (${opp.categoryName})
   • Profit: **${(opp.profitBps || 0).toFixed(1)} basis points**
   • Confidence: **${opp.confidence || 0}%**
   • Risk Level: **${opp.riskLevel || 'N/A'}/10**
   • Execution: **${opp.executionTime || 'Immediate'}**`
).join('\n\n')}

**🎯 TOP ARBITRAGE OPPORTUNITIES:**
${topOpportunities.map((opp, i) => 
    `${i + 1}. **${opp.asset || opp.pair || opp.type}** - ${opp.categoryName}
   • Profit: **${(opp.profitBps || 0).toFixed(1)}bps**
   • Score: **${(opp.opportunityScore || 0).toFixed(1)}/100**
   • Risk: **${opp.riskLevel}/10** | Confidence: **${opp.confidence}%**`
).join('\n')}

**💰 PROFIT PROJECTIONS** (on $100K):
${projections.immediate ? 
  `• **Immediate**: ${projections.immediate.totalProfit?.toFixed(0) || '0'} (${projections.immediate.count} opportunities)
• **Short-term**: ${projections.shortTerm?.totalProfit?.toFixed(0) || '0'} (${projections.shortTerm?.count || 0} opportunities)
• **Medium-term**: ${projections.mediumTerm?.totalProfit?.toFixed(0) || '0'} (${projections.mediumTerm?.count || 0} opportunities)
• **Total Potential**: ${projections.total?.totalProfit?.toFixed(0) || '0'}` :
  '• Calculating profit projections...'
}

**📊 CATEGORY BREAKDOWN:**
${Object.entries(arbitrageScan.categories).slice(0, 5).map(([cat, data]) => 
    `• **${cat.replace(/([A-Z])/g, ' $1').trim()}**: ${data.opportunities?.length || 0} opportunities`
).join('\n')}

**🛡️ RISK ASSESSMENT:**
• Overall Risk Level: **${arbitrageScan.riskAssessment.overallRisk || 'Medium'}**
• Execution Success Rate: **${arbitrageScan.riskAssessment.successRate || 85}%**
• Capital Efficiency: **${arbitrageScan.riskAssessment.capitalEfficiency || 'High'}**

**🚀 EXECUTION PLAN:**
${arbitrageScan.executionPlan.prioritizedList ? 
  `• **Ready for Execution**: ${arbitrageScan.executionPlan.totalOpportunities} opportunities
• **Capital Required**: ${arbitrageScan.executionPlan.capitalAllocation?.total?.toFixed(0) || 'TBD'}
• **Expected ROI**: ${arbitrageScan.executionPlan.expectedResults?.roi?.toFixed(2) || 'N/A'}%` :
  '• Generating execution strategies...'
}

**🤖 AI INSIGHTS:**
${arbitrageScan.aiInsights}

**⚠️ IMPORTANT NOTES:**
1. Arbitrage opportunities are time-sensitive
2. Execute immediately for maximum profit
3. Monitor liquidity and slippage carefully
4. Consider transaction costs in calculations
5. Risk management is essential

🔄 Next arbitrage scan: **Every 30 seconds**
⚡ Real-time alerts: **ACTIVE**
            `;
            
            await sendAnalysis(report, chatId, '🔄 Arbitrage Detector');
            
        } catch (error) {
            logError('Failed to send arbitrage report:', error);
        }
    }

    // 🚨 IMMEDIATE ARBITRAGE ALERTS
    async sendImmediateArbitrageAlerts(immediateOpportunities, chatId) {
        try {
            for (const opp of immediateOpportunities.slice(0, 3)) {
                if ((opp.profitBps || 0) >= 50) { // 50+ basis points
                    const alertMessage = `🔄 **URGENT ARBITRAGE OPPORTUNITY!**
                    
**${opp.type || 'Arbitrage'}** - ${opp.categoryName}
💰 **Profit**: ${(opp.profitBps || 0).toFixed(1)} basis points
⚡ **Execution**: ${opp.executionTime || 'Immediate'}
🎯 **Confidence**: ${opp.confidence || 0}%
🛡️ **Risk**: ${opp.riskLevel}/10

**Asset**: ${opp.asset || opp.pair || 'Multiple'}
**Strategy**: ${opp.strategy || 'Price discrepancy'}

⏰ **TIME SENSITIVE** - Execute within ${opp.timeWindow || '5 minutes'}!`;
                    
                    await sendCustomAlert('arbitrage', chatId, alertMessage, 'arbitrageOpportunity');
                }
            }
            
        } catch (error) {
            logError('Failed to send immediate arbitrage alerts:', error);
        }
    }

    // 🔍 HELPER METHODS FOR OPPORTUNITY DETECTION
    async getExchangePrices(asset) {
        // Mock implementation - would fetch real prices from multiple exchanges
        const exchanges = this.exchanges.crypto;
        const basePrice = 50000 + Math.random() * 10000; // Mock BTC price
        
        const prices = {};
        exchanges.forEach(exchange => {
            const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
            prices[exchange] = basePrice * (1 + variation);
        });
        
        return prices;
    }

    detectPriceDiscrepancies(asset, exchangePrices) {
        const opportunities = [];
        const exchanges = Object.keys(exchangePrices);
        
        for (let i = 0; i < exchanges.length; i++) {
            for (let j = i + 1; j < exchanges.length; j++) {
                const exchange1 = exchanges[i];
                const exchange2 = exchanges[j];
                const price1 = exchangePrices[exchange1];
                const price2 = exchangePrices[exchange2];
                
                const priceDiff = Math.abs(price1 - price2);
                const avgPrice = (price1 + price2) / 2;
                const spreadBps = (priceDiff / avgPrice) * 10000;
                
                if (spreadBps >= this.thresholds.minProfitBps) {
                    opportunities.push({
                        type: 'priceArbitrage',
                        asset: asset,
                        buyExchange: price1 < price2 ? exchange1 : exchange2,
                        sellExchange: price1 < price2 ? exchange2 : exchange1,
                        buyPrice: Math.min(price1, price2),
                        sellPrice: Math.max(price1, price2),
                        profitBps: spreadBps,
                        confidence: 95,
                        riskLevel: 1,
                        executionTime: 'seconds',
                        liquidity: 50000,
                        strategy: `Buy ${asset} on ${price1 < price2 ? exchange1 : exchange2}, sell on ${price1 < price2 ? exchange2 : exchange1}`
                    });
                }
            }
        }
        
        return opportunities;
    }

    async detectTriangularOpportunity(triangle) {
        // Mock triangular arbitrage detection
        const [curr1, curr2, curr3] = triangle;
        
        // Simulate exchange rates with small inefficiencies
        const rate12 = 1.0 + (Math.random() - 0.5) * 0.001;
        const rate23 = 1.0 + (Math.random() - 0.5) * 0.001;
        const rate31 = 1.0 + (Math.random() - 0.5) * 0.001;
        
        // Calculate triangular rate
        const triangularRate = rate12 * rate23 * rate31;
        const profitBps = Math.abs(triangularRate - 1.0) * 10000;
        
        const profitable = profitBps >= this.thresholds.minProfitBps;
        
        return {
            profitable: profitable,
            type: 'triangularArbitrage',
            triangle: triangle,
            profitBps: profitBps,
            confidence: profitable ? 90 : 0,
            riskLevel: 2,
            executionTime: 'seconds',
            liquidity: 100000,
            strategy: `${curr1} → ${curr2} → ${curr3} → ${curr1}`
        };
    }

    async detectPairsOpportunity(asset1, asset2) {
        // Mock pairs trading opportunity detection
        const correlation = 0.85 + Math.random() * 0.1; // High correlation
        const spreadDeviation = Math.random() * 3; // Standard deviations from mean
        
        const profitable = spreadDeviation >= 2.0; // 2+ standard deviations
        
        return {
            profitable: profitable,
            type: 'pairsTrading',
            pair: `${asset1}/${asset2}`,
            asset1: asset1,
            asset2: asset2,
            correlation: correlation,
            spreadDeviation: spreadDeviation,
            profitBps: profitable ? spreadDeviation * 25 : 0,
            confidence: profitable ? 75 : 0,
            riskLevel: 4,
            executionTime: 'days',
            liquidity: 75000,
            strategy: spreadDeviation > 0 ? `Long ${asset1}, Short ${asset2}` : `Short ${asset1}, Long ${asset2}`
        };
    }

    calculateAverageSpread(opportunities) {
        if (opportunities.length === 0) return 0;
        const totalSpread = opportunities.reduce((sum, opp) => sum + (opp.profitBps || 0), 0);
        return totalSpread / opportunities.length;
    }

    calculateTimeScore(executionTime) {
        const timeScores = {
            'seconds': 100,
            'immediate': 100,
            'minutes': 80,
            'hours': 60,
            'days': 40,
            'weeks': 20,
            'months': 10
        };
        
        const timeStr = (executionTime || '').toLowerCase();
        for (const [key, score] of Object.entries(timeScores)) {
            if (timeStr.includes(key)) {
                return score;
            }
        }
        return 50; // Default score
    }

    categorizeExecutionTime(executionTime) {
        const timeStr = (executionTime || '').toLowerCase();
        if (timeStr.includes('second') || timeStr.includes('immediate')) return 'immediate';
        if (timeStr.includes('minute') || timeStr.includes('hour')) return 'shortTerm';
        if (timeStr.includes('day') || timeStr.includes('week')) return 'mediumTerm';
        return 'longTerm';
    }

    generateExecutionAction(opportunity) {
        return {
            action: 'EXECUTE_ARBITRAGE',
            priority: 'HIGH',
            steps: [
                `Monitor ${opportunity.asset || opportunity.pair} prices`,
                `Prepare capital allocation`,
                `Execute simultaneous trades`,
                `Monitor position until completion`
            ],
            automation: 'Recommended for high-frequency opportunities'
        };
    }

    async saveArbitrageScan(arbitrageScan) {
        await saveToMemory(`arbitrage_scan_${Date.now()}`, arbitrageScan);
        
        // Update opportunity tracking
        arbitrageScan.highProbability.forEach(opp => {
            this.opportunities.set(`${opp.type}_${Date.now()}`, opp);
        });
        
        // Keep only recent opportunities
        const cutoff = Date.now() - 3600000; // 1 hour
        for (const [key, opp] of this.opportunities.entries()) {
            if (opp.timestamp < cutoff) {
                this.opportunities.delete(key);
            }
        }
    }

    // Placeholder methods for complex detections
    async detectSpatialOpportunity(asset, region1, region2) {
        return { profitable: Math.random() > 0.8, profitBps: Math.random() * 50 };
    }

    async detectMeanReversionOpportunities() { return []; }
    async detectCointegrationOpportunities() { return []; }
    async detectMomentumArbitrageOpportunities() { return []; }
    async detectCrossExchangeOpportunity(asset, exchange1, exchange2) { return { profitable: false }; }
    async detectPutCallParityViolations() { return []; }
    async detectFuturesSpotArbitrage() { return []; }
    async detectConvertibleBondArbitrage() { return []; }
    async getActiveMergerAnnouncements() { return []; }
    async analyzeMergerArbitrageOpportunity(merger) { return { profitable: false }; }
    async getUpcomingDividendStocks() { return []; }
    async analyzeDividendCaptureOpportunity(stock) { return { profitable: false }; }
    async scanMeanReversionArbitrage() { return { category: 'meanReversion', opportunities: [] }; }
    async scanCalendarSpreads() { return { category: 'calendarSpread', opportunities: [] }; }
}

// Export functions for easy integration
module.exports = {
    ArbitrageDetector,
    
    // Main arbitrage functions
    scanArbitrage: async (preferences, chatId) => {
        const detector = new ArbitrageDetector();
        return await detector.scanAllArbitrageOpportunities(preferences, chatId);
    },
    
    findPriceArbitrage: async (assets, chatId) => {
        const detector = new ArbitrageDetector();
        return await detector.scanPriceArbitrage({ assets });
    },
    
    findTriangularArbitrage: async (chatId) => {
        const detector = new ArbitrageDetector();
        return await detector.scanTriangularArbitrage();
    },
    
    scanImmediateOpportunities: async (chatId) => {
        const detector = new ArbitrageDetector();
        const scan = await detector.scanAllArbitrageOpportunities({}, chatId);
        return scan.immediateExecution;
    },
    
    monitorArbitrage: async (chatId, interval = 30000) => {
        const detector = new ArbitrageDetector();
        
        const monitor = async () => {
            try {
                const opportunities = await detector.scanImmediateOpportunities(chatId);
                if (opportunities.length > 0) {
                    await detector.sendImmediateArbitrageAlerts(opportunities, chatId);
                }
            } catch (error) {
                logError('Arbitrage monitoring failed:', error);
            }
        };
        
        // Start monitoring
        setInterval(monitor, interval);
        monitor(); // Run immediately
        
        return 'Arbitrage monitoring started';
    }
};
