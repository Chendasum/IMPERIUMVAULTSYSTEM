// utils/cashFlowOptimizer.js
const { getUniversalAnalysis, getDualAnalysis } = require('./dualAISystem');
const { sendSmartMessage, sendAnalysis } = require('./telegramSplitter');
const { getLivePrice, getMarketData } = require('./liveData');
const { assessRisk, calculatePositionSize } = require('./riskManager');
const { scanMarkets, getTopOpportunities } = require('./marketScanner');
const { optimizePortfolio, getOptimalAllocation } = require('./portfolioOptimizer');
const { findYields, getTopYields } = require('./yieldFinder');
const { trackWealth, getWealthSnapshot } = require('./wealthTracker');
const { sendCustomAlert } = require('./alertSystem');
const { logInfo, logError, logWarning } = require('./logger');
const { saveToMemory, getFromMemory } = require('./memory');

class CashFlowOptimizer {
    constructor() {
        this.cashFlowCategories = {
            // Income Streams
            salary: { 
                name: 'Salary/Wages', 
                type: 'income', 
                predictability: 'high', 
                taxation: 'ordinary',
                optimization: 'tax_efficiency'
            },
            business: { 
                name: 'Business Income', 
                type: 'income', 
                predictability: 'medium', 
                taxation: 'business',
                optimization: 'cash_flow_timing'
            },
            dividends: { 
                name: 'Dividend Income', 
                type: 'income', 
                predictability: 'medium', 
                taxation: 'qualified',
                optimization: 'dividend_timing'
            },
            interest: { 
                name: 'Interest Income', 
                type: 'income', 
                predictability: 'high', 
                taxation: 'ordinary',
                optimization: 'compound_timing'
            },
            capitalGains: { 
                name: 'Capital Gains', 
                type: 'income', 
                predictability: 'low', 
                taxation: 'capital',
                optimization: 'harvest_timing'
            },
            rental: { 
                name: 'Rental Income', 
                type: 'income', 
                predictability: 'medium', 
                taxation: 'rental',
                optimization: 'depreciation_timing'
            },
            royalties: { 
                name: 'Royalty Income', 
                type: 'income', 
                predictability: 'low', 
                taxation: 'ordinary',
                optimization: 'passive_optimization'
            },
            
            // Expense Categories
            housing: { 
                name: 'Housing Costs', 
                type: 'expense', 
                necessity: 'essential', 
                optimization: 'refinancing'
            },
            transportation: { 
                name: 'Transportation', 
                type: 'expense', 
                necessity: 'essential', 
                optimization: 'efficiency'
            },
            food: { 
                name: 'Food & Dining', 
                type: 'expense', 
                necessity: 'essential', 
                optimization: 'budgeting'
            },
            utilities: { 
                name: 'Utilities', 
                type: 'expense', 
                necessity: 'essential', 
                optimization: 'energy_efficiency'
            },
            insurance: { 
                name: 'Insurance', 
                type: 'expense', 
                necessity: 'essential', 
                optimization: 'coverage_optimization'
            },
            healthcare: { 
                name: 'Healthcare', 
                type: 'expense', 
                necessity: 'essential', 
                optimization: 'hsa_optimization'
            },
            education: { 
                name: 'Education', 
                type: 'expense', 
                necessity: 'important', 
                optimization: 'tax_benefits'
            },
            entertainment: { 
                name: 'Entertainment', 
                type: 'expense', 
                necessity: 'discretionary', 
                optimization: 'value_optimization'
            },
            debt: { 
                name: 'Debt Payments', 
                type: 'expense', 
                necessity: 'essential', 
                optimization: 'debt_avalanche'
            },
            taxes: { 
                name: 'Tax Payments', 
                type: 'expense', 
                necessity: 'essential', 
                optimization: 'tax_minimization'
            }
        };
        
        this.liquidityTiers = {
            immediate: { 
                name: 'Immediate Access', 
                timeframe: '0-1 days', 
                yield: 0.01,
                vehicles: ['checking_account', 'money_market', 'savings_account']
            },
            short: { 
                name: 'Short-term Access', 
                timeframe: '1-30 days', 
                yield: 0.025,
                vehicles: ['short_cds', 'treasury_bills', 'high_yield_savings']
            },
            medium: { 
                name: 'Medium-term Access', 
                timeframe: '1-12 months', 
                yield: 0.04,
                vehicles: ['medium_cds', 'short_bonds', 'bond_funds']
            },
            long: { 
                name: 'Long-term Access', 
                timeframe: '1+ years', 
                yield: 0.06,
                vehicles: ['long_bonds', 'dividend_stocks', 'bond_ladders']
            }
        };
        
        this.optimizationStrategies = {
            // Cash Flow Optimization
            cashFlowSmoothing: 'Smooth irregular income flows',
            emergencyOptimization: 'Optimize emergency fund allocation',
            liquidityLaddering: 'Create liquidity ladders for predictable access',
            yieldMaximization: 'Maximize yield on idle cash',
            
            // Tax Optimization
            taxLossHarvesting: 'Harvest losses to offset gains',
            assetLocationOptimization: 'Optimize asset placement across accounts',
            incomeTimingOptimization: 'Time income recognition for tax efficiency',
            deductionMaximization: 'Maximize available deductions',
            
            // Debt Optimization
            debtConsolidation: 'Consolidate high-interest debt',
            refinancingOptimization: 'Optimize refinancing timing',
            paymentOptimization: 'Optimize payment timing and amounts',
            leverageOptimization: 'Optimize use of leverage',
            
            // Investment Cash Flow
            dividendReinvestment: 'Optimize dividend reinvestment timing',
            rebalancingOptimization: 'Tax-efficient rebalancing',
            withdrawalOptimization: 'Optimize withdrawal strategies',
            contributionOptimization: 'Optimize contribution timing and amounts'
        };
        
        this.cashFlowModels = new Map();
        this.optimizationHistory = [];
        this.liquidityTargets = new Map();
        this.alertThresholds = new Map();
    }

    // 🎯 COMPREHENSIVE CASH FLOW OPTIMIZATION
    async optimizeCompleteCashFlow(userId, preferences, chatId) {
        try {
            logInfo('💵 Starting comprehensive cash flow optimization');
            
            const optimization = {
                timestamp: Date.now(),
                userId: userId,
                currentCashFlow: {},
                analysis: {},
                optimizations: {},
                liquidityPlan: {},
                emergencyFund: {},
                taxOptimization: {},
                debtOptimization: {},
                investmentCashFlow: {},
                projections: {},
                implementation: {},
                aiInsights: ''
            };

            // Analyze current cash flow
            optimization.currentCashFlow = await this.analyzeCashFlowStructure(userId);
            
            // Comprehensive cash flow analysis
            optimization.analysis = await this.analyzeCashFlowPatterns(optimization.currentCashFlow);
            
            // Generate optimization strategies
            optimization.optimizations = await this.generateOptimizationStrategies(optimization.currentCashFlow, optimization.analysis);
            
            // Create liquidity management plan
            optimization.liquidityPlan = await this.createLiquidityManagementPlan(optimization.currentCashFlow, preferences);
            
            // Optimize emergency fund
            optimization.emergencyFund = await this.optimizeEmergencyFund(optimization.currentCashFlow, optimization.analysis);
            
            // Tax optimization strategies
            optimization.taxOptimization = await this.optimizeTaxEfficiency(optimization.currentCashFlow, preferences);
            
            // Debt optimization
            optimization.debtOptimization = await this.optimizeDebtManagement(optimization.currentCashFlow);
            
            // Investment cash flow optimization
            optimization.investmentCashFlow = await this.optimizeInvestmentCashFlow(optimization.currentCashFlow, preferences);
            
            // Create future projections
            optimization.projections = await this.projectCashFlowScenarios(optimization.currentCashFlow, optimization.optimizations);
            
            // Implementation roadmap
            optimization.implementation = await this.createImplementationRoadmap(optimization.optimizations);
            
            // AI insights
            optimization.aiInsights = await this.getAICashFlowInsights(optimization, chatId);
            
            // Send comprehensive report
            await this.sendCashFlowOptimizationReport(optimization, chatId);
            
            // Set up monitoring
            await this.setupCashFlowMonitoring(userId, optimization, chatId);
            
            // Save optimization
            await this.saveCashFlowOptimization(optimization);
            
            return optimization;
            
        } catch (error) {
            logError('Cash flow optimization failed:', error);
            throw error;
        }
    }

    // 📊 CASH FLOW STRUCTURE ANALYSIS
    async analyzeCashFlowStructure(userId) {
        try {
            const cashFlow = {
                income: {},
                expenses: {},
                netCashFlow: 0,
                trends: {},
                seasonality: {},
                volatility: {},
                cashPosition: {},
                liquidityAnalysis: {}
            };

            // Get income streams
            cashFlow.income = await this.getIncomeStreams(userId);
            
            // Get expense categories
            cashFlow.expenses = await this.getExpenseCategories(userId);
            
            // Calculate net cash flow
            const totalIncome = Object.values(cashFlow.income).reduce((sum, income) => sum + (income.monthly || 0), 0);
            const totalExpenses = Object.values(cashFlow.expenses).reduce((sum, expense) => sum + (expense.monthly || 0), 0);
            cashFlow.netCashFlow = totalIncome - totalExpenses;
            
            // Analyze trends
            cashFlow.trends = await this.analyzeCashFlowTrends(userId);
            
            // Analyze seasonality
            cashFlow.seasonality = await this.analyzeSeasonality(userId);
            
            // Calculate volatility
            cashFlow.volatility = await this.calculateCashFlowVolatility(userId);
            
            // Current cash position
            cashFlow.cashPosition = await this.getCurrentCashPosition(userId);
            
            // Liquidity analysis
            cashFlow.liquidityAnalysis = await this.analyzeLiquidityPosition(userId);
            
            return cashFlow;
            
        } catch (error) {
            logError('Cash flow structure analysis failed:', error);
            return {};
        }
    }

    // 📈 CASH FLOW PATTERN ANALYSIS
    async analyzeCashFlowPatterns(cashFlow) {
        try {
            const analysis = {
                stability: {},
                efficiency: {},
                opportunities: {},
                risks: {},
                benchmarks: {},
                recommendations: []
            };

            // Stability analysis
            analysis.stability = {
                incomeStability: this.calculateIncomeStability(cashFlow.income),
                expenseStability: this.calculateExpenseStability(cashFlow.expenses),
                netCashFlowStability: this.calculateNetCashFlowStability(cashFlow),
                seasonalityImpact: this.assessSeasonalityImpact(cashFlow.seasonality)
            };
            
            // Efficiency analysis
            analysis.efficiency = {
                savingsRate: cashFlow.netCashFlow > 0 ? (cashFlow.netCashFlow / Object.values(cashFlow.income).reduce((sum, inc) => sum + (inc.monthly || 0), 0)) * 100 : 0,
                expenseRatio: this.calculateExpenseRatios(cashFlow.expenses),
                liquidityEfficiency: this.calculateLiquidityEfficiency(cashFlow.cashPosition, cashFlow.liquidityAnalysis),
                taxEfficiency: this.calculateTaxEfficiency(cashFlow.income)
            };
            
            // Opportunity identification
            analysis.opportunities = {
                incomeOptimization: this.identifyIncomeOptimizations(cashFlow.income),
                expenseReduction: this.identifyExpenseReductions(cashFlow.expenses),
                liquidityOptimization: this.identifyLiquidityOptimizations(cashFlow.liquidityAnalysis),
                taxOptimization: this.identifyTaxOptimizations(cashFlow.income, cashFlow.expenses)
            };
            
            // Risk assessment
            analysis.risks = {
                cashFlowRisk: this.assessCashFlowRisk(cashFlow),
                liquidityRisk: this.assessLiquidityRisk(cashFlow.liquidityAnalysis),
                concentrationRisk: this.assessIncomeConcentrationRisk(cashFlow.income),
                emergencyFundAdequacy: this.assessEmergencyFundAdequacy(cashFlow)
            };
            
            // Benchmark comparison
            analysis.benchmarks = await this.compareToBenchmarks(analysis.efficiency);
            
            return analysis;
            
        } catch (error) {
            logError('Cash flow pattern analysis failed:', error);
            return {};
        }
    }

    // 🎯 OPTIMIZATION STRATEGY GENERATION
    async generateOptimizationStrategies(cashFlow, analysis) {
        try {
            const strategies = {
                immediate: [],     // 0-30 days
                shortTerm: [],     // 1-6 months
                mediumTerm: [],    // 6-24 months
                longTerm: [],      // 2+ years
                priorityScore: {},
                implementationOrder: []
            };

            // Income optimization strategies
            const incomeStrategies = this.generateIncomeOptimizationStrategies(cashFlow.income, analysis);
            
            // Expense optimization strategies
            const expenseStrategies = this.generateExpenseOptimizationStrategies(cashFlow.expenses, analysis);
            
            // Liquidity optimization strategies
            const liquidityStrategies = this.generateLiquidityOptimizationStrategies(cashFlow.liquidityAnalysis, analysis);
            
            // Tax optimization strategies
            const taxStrategies = this.generateTaxOptimizationStrategies(cashFlow, analysis);
            
            // Categorize strategies by timeframe
            [...incomeStrategies, ...expenseStrategies, ...liquidityStrategies, ...taxStrategies].forEach(strategy => {
                if (strategy.timeframe === 'immediate') strategies.immediate.push(strategy);
                else if (strategy.timeframe === 'short') strategies.shortTerm.push(strategy);
                else if (strategy.timeframe === 'medium') strategies.mediumTerm.push(strategy);
                else strategies.longTerm.push(strategy);
                
                // Calculate priority score
                strategies.priorityScore[strategy.id] = this.calculateStrategyPriority(strategy, analysis);
            });
            
            // Create implementation order
            const allStrategies = [...strategies.immediate, ...strategies.shortTerm, ...strategies.mediumTerm, ...strategies.longTerm];
            strategies.implementationOrder = allStrategies
                .sort((a, b) => strategies.priorityScore[b.id] - strategies.priorityScore[a.id])
                .slice(0, 10); // Top 10 strategies
            
            return strategies;
            
        } catch (error) {
            logError('Optimization strategy generation failed:', error);
            return {};
        }
    }

    // 💧 LIQUIDITY MANAGEMENT PLAN
    async createLiquidityManagementPlan(cashFlow, preferences = {}) {
        try {
            const plan = {
                currentLiquidity: {},
                liquidityNeeds: {},
                liquidityLadder: {},
                emergencyReserves: {},
                opportunityFund: {},
                yieldOptimization: {},
                recommendations: []
            };

            // Assess current liquidity
            plan.currentLiquidity = this.assessCurrentLiquidity(cashFlow.cashPosition, cashFlow.liquidityAnalysis);
            
            // Calculate liquidity needs
            plan.liquidityNeeds = this.calculateLiquidityNeeds(cashFlow, preferences);
            
            // Create liquidity ladder
            plan.liquidityLadder = this.createLiquidityLadder(plan.liquidityNeeds, plan.currentLiquidity);
            
            // Optimize emergency reserves
            plan.emergencyReserves = this.optimizeEmergencyReserves(cashFlow, plan.liquidityNeeds);
            
            // Create opportunity fund
            plan.opportunityFund = this.createOpportunityFund(cashFlow, plan.liquidityNeeds);
            
            // Yield optimization for liquid assets
            plan.yieldOptimization = await this.optimizeLiquidAssetYields(plan.liquidityLadder);
            
            // Generate recommendations
            plan.recommendations = this.generateLiquidityRecommendations(plan);
            
            return plan;
            
        } catch (error) {
            logError('Liquidity management plan creation failed:', error);
            return {};
        }
    }

    // 🚨 EMERGENCY FUND OPTIMIZATION
    async optimizeEmergencyFund(cashFlow, analysis) {
        try {
            const emergencyFund = {
                currentSize: 0,
                recommendedSize: 0,
                adequacy: 'insufficient',
                allocation: {},
                yieldOptimization: {},
                accessStrategy: {},
                buildingPlan: {},
                monitoring: {}
            };

            // Calculate current emergency fund size
            emergencyFund.currentSize = this.calculateCurrentEmergencyFund(cashFlow.cashPosition);
            
            // Calculate recommended size
            const monthlyExpenses = Object.values(cashFlow.expenses).reduce((sum, exp) => sum + (exp.monthly || 0), 0);
            const incomeStability = analysis.stability.incomeStability;
            const multiplier = incomeStability > 0.8 ? 3 : incomeStability > 0.6 ? 6 : 9; // 3-9 months
            emergencyFund.recommendedSize = monthlyExpenses * multiplier;
            
            // Assess adequacy
            const adequacyRatio = emergencyFund.currentSize / emergencyFund.recommendedSize;
            if (adequacyRatio >= 1) emergencyFund.adequacy = 'adequate';
            else if (adequacyRatio >= 0.5) emergencyFund.adequacy = 'partial';
            else emergencyFund.adequacy = 'insufficient';
            
            // Optimize allocation across liquidity tiers
            emergencyFund.allocation = this.optimizeEmergencyFundAllocation(emergencyFund.recommendedSize);
            
            // Yield optimization
            emergencyFund.yieldOptimization = await this.optimizeEmergencyFundYield(emergencyFund.allocation);
            
            // Access strategy
            emergencyFund.accessStrategy = this.createEmergencyAccessStrategy(emergencyFund.allocation);
            
            // Building plan (if insufficient)
            if (emergencyFund.adequacy !== 'adequate') {
                emergencyFund.buildingPlan = this.createEmergencyFundBuildingPlan(
                    emergencyFund.currentSize,
                    emergencyFund.recommendedSize,
                    cashFlow.netCashFlow
                );
            }
            
            // Monitoring strategy
            emergencyFund.monitoring = this.createEmergencyFundMonitoring(emergencyFund);
            
            return emergencyFund;
            
        } catch (error) {
            logError('Emergency fund optimization failed:', error);
            return {};
        }
    }

    // 💼 TAX EFFICIENCY OPTIMIZATION
    async optimizeTaxEfficiency(cashFlow, preferences = {}) {
        try {
            const taxOptimization = {
                currentTaxSituation: {},
                optimizationOpportunities: {},
                assetLocationOptimization: {},
                incomeTimingStrategies: {},
                deductionMaximization: {},
                taxLossHarvesting: {},
                retirementContributions: {},
                projectedSavings: {}
            };

            // Analyze current tax situation
            taxOptimization.currentTaxSituation = this.analyzeTaxSituation(cashFlow.income, cashFlow.expenses, preferences);
            
            // Identify optimization opportunities
            taxOptimization.optimizationOpportunities = this.identifyTaxOptimizationOpportunities(taxOptimization.currentTaxSituation);
            
            // Asset location optimization
            taxOptimization.assetLocationOptimization = await this.optimizeAssetLocation(cashFlow, preferences);
            
            // Income timing strategies
            taxOptimization.incomeTimingStrategies = this.optimizeIncomeTimingStrategies(cashFlow.income, taxOptimization.currentTaxSituation);
            
            // Deduction maximization
            taxOptimization.deductionMaximization = this.maximizeDeductions(cashFlow.expenses, preferences);
            
            // Tax loss harvesting
            taxOptimization.taxLossHarvesting = await this.optimizeTaxLossHarvesting(preferences);
            
            // Retirement contribution optimization
            taxOptimization.retirementContributions = this.optimizeRetirementContributions(cashFlow, taxOptimization.currentTaxSituation);
            
            // Calculate projected tax savings
            taxOptimization.projectedSavings = this.calculateProjectedTaxSavings(taxOptimization);
            
            return taxOptimization;
            
        } catch (error) {
            logError('Tax efficiency optimization failed:', error);
            return {};
        }
    }

    // 📉 DEBT OPTIMIZATION
    async optimizeDebtManagement(cashFlow) {
        try {
            const debtOptimization = {
                currentDebt: {},
                payoffStrategies: {},
                refinancingOpportunities: {},
                consolidationOptions: {},
                leverageOptimization: {},
                paymentOptimization: {},
                projectedSavings: {}
            };

            // Analyze current debt situation
            debtOptimization.currentDebt = this.analyzeCurrentDebt(cashFlow.expenses);
            
            // Generate payoff strategies
            debtOptimization.payoffStrategies = this.generateDebtPayoffStrategies(debtOptimization.currentDebt, cashFlow.netCashFlow);
            
            // Identify refinancing opportunities
            debtOptimization.refinancingOpportunities = await this.identifyRefinancingOpportunities(debtOptimization.currentDebt);
            
            // Analyze consolidation options
            debtOptimization.consolidationOptions = this.analyzeDebtConsolidationOptions(debtOptimization.currentDebt);
            
            // Optimize leverage usage
            debtOptimization.leverageOptimization = this.optimizeLeverageUsage(debtOptimization.currentDebt, cashFlow);
            
            // Payment timing optimization
            debtOptimization.paymentOptimization = this.optimizePaymentTiming(debtOptimization.currentDebt, cashFlow);
            
            // Calculate projected savings
            debtOptimization.projectedSavings = this.calculateDebtSavings(debtOptimization);
            
            return debtOptimization;
            
        } catch (error) {
            logError('Debt optimization failed:', error);
            return {};
        }
    }

    // 📈 INVESTMENT CASH FLOW OPTIMIZATION
    async optimizeInvestmentCashFlow(cashFlow, preferences = {}) {
        try {
            const investmentOptimization = {
                currentInvestmentCashFlow: {},
                contributionOptimization: {},
                withdrawalStrategy: {},
                rebalancingCashFlow: {},
                dividendOptimization: {},
                taxEfficiency: {},
                liquidityManagement: {}
            };

            // Analyze current investment cash flows
            investmentOptimization.currentInvestmentCashFlow = this.analyzeInvestmentCashFlow(cashFlow.income);
            
            // Optimize contribution timing and amounts
            investmentOptimization.contributionOptimization = this.optimizeInvestmentContributions(cashFlow, preferences);
            
            // Create withdrawal strategy
            investmentOptimization.withdrawalStrategy = this.createWithdrawalStrategy(cashFlow, preferences);
            
            // Optimize rebalancing cash flows
            investmentOptimization.rebalancingCashFlow = await this.optimizeRebalancingCashFlow(preferences);
            
            // Dividend and distribution optimization
            investmentOptimization.dividendOptimization = this.optimizeDividendStrategy(investmentOptimization.currentInvestmentCashFlow);
            
            // Tax efficiency for investments
            investmentOptimization.taxEfficiency = this.optimizeInvestmentTaxEfficiency(investmentOptimization, preferences);
            
            // Investment liquidity management
            investmentOptimization.liquidityManagement = this.optimizeInvestmentLiquidity(cashFlow, preferences);
            
            return investmentOptimization;
            
        } catch (error) {
            logError('Investment cash flow optimization failed:', error);
            return {};
        }
    }

    // 🔮 CASH FLOW PROJECTIONS
    async projectCashFlowScenarios(cashFlow, optimizations) {
        try {
            const projections = {
                timeHorizons: [1, 3, 5, 10, 20], // years
                scenarios: {},
                optimizationImpact: {},
                sensitivity: {},
                milestones: {}
            };

            for (const years of projections.timeHorizons) {
                // Base case scenario
                const baseCase = this.projectBaseCaseScenario(cashFlow, years);
                
                // Optimized scenario
                const optimizedCase = this.projectOptimizedScenario(cashFlow, optimizations, years);
                
                // Conservative scenario
                const conservativeCase = this.projectConservativeScenario(cashFlow, years);
                
                // Aggressive scenario
                const aggressiveCase = this.projectAggressiveScenario(cashFlow, optimizations, years);
                
                projections.scenarios[`${years}year`] = {
                    timeHorizon: years,
                    baseCase: baseCase,
                    optimized: optimizedCase,
                    conservative: conservativeCase,
                    aggressive: aggressiveCase,
                    optimizationBenefit: optimizedCase.netWorth - baseCase.netWorth
                };
            }
            
            // Calculate optimization impact
            projections.optimizationImpact = this.calculateOptimizationImpact(projections.scenarios);
            
            // Sensitivity analysis
            projections.sensitivity = this.performSensitivityAnalysis(cashFlow, optimizations);
            
            // Milestone projections
            projections.milestones = this.projectWealthMilestones(projections.scenarios.optimized);
            
            return projections;
            
        } catch (error) {
            logError('Cash flow projection failed:', error);
            return {};
        }
    }

    // 🤖 AI CASH FLOW INSIGHTS
    async getAICashFlowInsights(optimization, chatId) {
        try {
            const prompt = `
            Analyze this comprehensive cash flow optimization and provide strategic insights:
            
            Current Cash Flow:
            - Net Monthly Cash Flow: $${optimization.currentCashFlow.netCashFlow?.toFixed(0) || '0'}
            - Savings Rate: ${optimization.analysis.efficiency?.savingsRate?.toFixed(1) || '0'}%
            - Income Stability: ${optimization.analysis.stability?.incomeStability?.toFixed(2) || 'N/A'}
            
            Optimization Opportunities:
            - Immediate Actions: ${optimization.optimizations.immediate?.length || 0}
            - Short-term Strategies: ${optimization.optimizations.shortTerm?.length || 0}
            - Priority Strategy: ${optimization.optimizations.implementationOrder?.[0]?.name || 'Analysis in progress'}
            
            Liquidity Plan:
            - Emergency Fund Adequacy: ${optimization.emergencyFund.adequacy || 'Assessing'}
            - Recommended Emergency Fund: $${optimization.emergencyFund.recommendedSize?.toFixed(0) || '0'}
            
            Tax Optimization:
            - Projected Annual Savings: $${optimization.taxOptimization.projectedSavings?.annual?.toFixed(0) || '0'}
            
            Debt Optimization:
            - Total Debt: $${optimization.debtOptimization.currentDebt?.totalDebt?.toFixed(0) || '0'}
            - Potential Interest Savings: $${optimization.debtOptimization.projectedSavings?.totalSavings?.toFixed(0) || '0'}
            
            Projections (10-year):
            ${optimization.projections?.scenarios?.['10year'] ? 
              `- Base Case Net Worth: $${optimization.projections.scenarios['10year'].baseCase.netWorth?.toFixed(0) || '0'}
               - Optimized Net Worth: $${optimization.projections.scenarios['10year'].optimized.netWorth?.toFixed(0) || '0'}
               - Optimization Benefit: $${optimization.projections.scenarios['10year'].optimizationBenefit?.toFixed(0) || '0'}` :
              '- Projections calculating...'
            }
            
            Provide:
            1. Cash flow health assessment
            2. Top 3 optimization priorities
            3. Risk management recommendations  
            4. Long-term wealth building strategy
            5. Implementation timeline
            6. Monitoring and adjustment plan
            7. Tax and liquidity optimization tactics
            `;
            
            const insights = await getDualAnalysis(prompt, {
                chatId: chatId,
                context: 'cash_flow_optimization',
                priority: 'high'
            });
            
            return insights;
            
        } catch (error) {
            logError('AI cash flow insights failed:', error);
            return 'Cash flow insights unavailable';
        }
    }

    // 📱 SEND CASH FLOW OPTIMIZATION REPORT
    async sendCashFlowOptimizationReport(optimization, chatId) {
        try {
            const currentCF = optimization.currentCashFlow;
            const analysis = optimization.analysis;
            const projections = optimization.projections;
            
            const report = `
💵 **COMPREHENSIVE CASH FLOW OPTIMIZATION REPORT** 📊

**💰 CURRENT CASH FLOW STATUS:**
• **Net Monthly Cash Flow**: ${currentCF.netCashFlow?.toFixed(0) || '0'}
• **Savings Rate**: ${analysis.efficiency?.savingsRate?.toFixed(1) || '0'}%
• **Income Stability**: ${(analysis.stability?.incomeStability * 100)?.toFixed(1) || 'N/A'}%
• **Expense Efficiency**: ${analysis.efficiency?.liquidityEfficiency?.toFixed(1) || 'N/A'}%

**🎯 TOP OPTIMIZATION OPPORTUNITIES:**
${optimization.optimizations.implementationOrder?.slice(0, 5).map((strategy, i) => 
    `${i + 1}. **${strategy.name}**
   • Impact: ${strategy.monthlyImpact?.toFixed(0) || '0'}/month
   • Timeline: ${strategy.timeframe}
   • Priority: ${strategy.priority || 'High'}`
).join('\n\n') || 'Optimization strategies generating...'}

**🚨 EMERGENCY FUND ANALYSIS:**
• **Current Size**: ${optimization.emergencyFund.currentSize?.toFixed(0) || '0'}
• **Recommended**: ${optimization.emergencyFund.recommendedSize?.toFixed(0) || '0'}
• **Status**: ${optimization.emergencyFund.adequacy?.toUpperCase() || 'ASSESSING'}
• **Gap**: ${Math.max(0, (optimization.emergencyFund.recommendedSize || 0) - (optimization.emergencyFund.currentSize || 0)).toFixed(0)}

**💧 LIQUIDITY OPTIMIZATION:**
${optimization.liquidityPlan.liquidityLadder ? 
  `• **Immediate Access**: ${optimization.liquidityPlan.liquidityLadder.immediate?.amount?.toFixed(0) || '0'}
• **Short-term Access**: ${optimization.liquidityPlan.liquidityLadder.short?.amount?.toFixed(0) || '0'}
• **Medium-term Access**: ${optimization.liquidityPlan.liquidityLadder.medium?.amount?.toFixed(0) || '0'}
• **Yield Optimization**: +${optimization.liquidityPlan.yieldOptimization?.additionalIncome?.toFixed(0) || '0'}/year` :
  '• Liquidity ladder analysis in progress...'
}

**💰 TAX OPTIMIZATION SAVINGS:**
${optimization.taxOptimization.projectedSavings ? 
  `• **Annual Tax Savings**: ${optimization.taxOptimization.projectedSavings.annual?.toFixed(0) || '0'}
• **Asset Location Benefit**: ${optimization.taxOptimization.assetLocationOptimization?.savings?.toFixed(0) || '0'}
• **Retirement Optimization**: ${optimization.taxOptimization.retirementContributions?.taxSavings?.toFixed(0) || '0'}
• **Total 10-Year Savings**: ${(optimization.taxOptimization.projectedSavings.annual * 10)?.toFixed(0) || '0'}` :
  '• Tax optimization calculations processing...'
}

**📉 DEBT OPTIMIZATION:**
${optimization.debtOptimization.currentDebt ? 
  `• **Total Debt**: ${optimization.debtOptimization.currentDebt.totalDebt?.toFixed(0) || '0'}
• **Average Interest Rate**: ${optimization.debtOptimization.currentDebt.weightedInterestRate?.toFixed(2) || 'N/A'}%
• **Monthly Payments**: ${optimization.debtOptimization.currentDebt.totalMonthlyPayment?.toFixed(0) || '0'}
• **Interest Savings Potential**: ${optimization.debtOptimization.projectedSavings?.totalSavings?.toFixed(0) || '0'}` :
  '• Debt analysis in progress...'
}

**🔮 WEALTH PROJECTIONS:**
${projections?.scenarios ? 
  Object.entries(projections.scenarios).slice(0, 4).map(([period, data]) => 
    `• **${period.toUpperCase()}**: ${Math.round(data.optimized?.netWorth || 0).toLocaleString()} (vs ${Math.round(data.baseCase?.netWorth || 0).toLocaleString()} base)`
  ).join('\n') :
  '• Projection models calculating...'
}

**📊 OPTIMIZATION IMPACT:**
${projections?.optimizationImpact ? 
  `• **5-Year Benefit**: ${projections.optimizationImpact.fiveYear?.toFixed(0) || '0'}
• **10-Year Benefit**: ${projections.optimizationImpact.tenYear?.toFixed(0) || '0'}
• **Wealth Acceleration**: ${projections.optimizationImpact.accelerationFactor?.toFixed(1) || 'N/A'}x faster` :
  '• Impact analysis processing...'
}

**🤖 AI INSIGHTS:**
${optimization.aiInsights}

**📋 IMPLEMENTATION ROADMAP:**
**IMMEDIATE (0-30 days):**
${optimization.optimizations.immediate?.slice(0, 3).map((action, i) => 
  `${i + 1}. ${action.name} - ${action.monthlyImpact?.toFixed(0) || '0'}/month impact`
).join('\n') || '• Immediate actions being prioritized...'}

**SHORT-TERM (1-6 months):**
${optimization.optimizations.shortTerm?.slice(0, 2).map((action, i) => 
  `${i + 1}. ${action.name} - ${action.description || 'Strategy details'}`
).join('\n') || '• Short-term strategies developing...'}

**📈 KEY PERFORMANCE INDICATORS:**
• **Target Savings Rate**: ${(analysis.efficiency?.savingsRate + 10)?.toFixed(1) || '25'}%
• **Emergency Fund Target**: ${optimization.emergencyFund.adequacy === 'adequate' ? '✅ Achieved' : '🎯 Building'}
• **Debt-to-Income Ratio**: ${optimization.debtOptimization.currentDebt?.debtToIncomeRatio?.toFixed(1) || 'N/A'}%
• **Liquidity Efficiency**: ${(analysis.efficiency?.liquidityEfficiency + 15)?.toFixed(1) || '85'}%

**⚠️ IMPORTANT REMINDERS:**
• Review and adjust monthly
• Monitor for life changes
• Rebalance quarterly
• Tax strategy annual review
• Emergency fund accessibility test

🎯 **Overall Grade**: ${this.calculateCashFlowGrade(analysis)}
💡 **Next Review**: 30 days
🔄 **Auto-monitoring**: ACTIVE
            `;
            
            await sendAnalysis(report, chatId, '💵 Cash Flow Optimizer');
            
        } catch (error) {
            logError('Failed to send cash flow optimization report:', error);
        }
    }

    // 📊 CASH FLOW MONITORING SETUP
    async setupCashFlowMonitoring(userId, optimization, chatId) {
        try {
            // Set up automated monitoring
            const monitoring = {
                userId: userId,
                chatId: chatId,
                alerts: {
                    lowCashFlow: optimization.currentCashFlow.netCashFlow * 0.5, // 50% below current
                    emergencyFundDrop: optimization.emergencyFund.currentSize * 0.9, // 10% drop
                    savingsRateDecline: optimization.analysis.efficiency.savingsRate * 0.8, // 20% drop
                    debtIncrease: optimization.debtOptimization.currentDebt.totalDebt * 1.1 // 10% increase
                },
                checkFrequency: 'weekly',
                reportFrequency: 'monthly',
                optimizationReview: 'quarterly'
            };
            
            // Save monitoring configuration
            await saveToMemory(`cash_flow_monitoring_${userId}`, monitoring);
            
            // Set up initial alerts
            this.alertThresholds.set(userId, monitoring.alerts);
            
            // Schedule monitoring
            setTimeout(() => this.performCashFlowCheck(userId, chatId), 7 * 24 * 60 * 60 * 1000); // Weekly
            
            logInfo(`💵 Cash flow monitoring activated for user ${userId}`);
            
        } catch (error) {
            logError('Cash flow monitoring setup failed:', error);
        }
    }

    // 🔍 PERIODIC CASH FLOW CHECK
    async performCashFlowCheck(userId, chatId) {
        try {
            const currentCashFlow = await this.analyzeCashFlowStructure(userId);
            const alerts = this.alertThresholds.get(userId) || {};
            const notifications = [];
            
            // Check for alert conditions
            if (currentCashFlow.netCashFlow < alerts.lowCashFlow) {
                notifications.push({
                    type: 'warning',
                    message: `💵 **CASH FLOW ALERT**\nNet cash flow dropped to ${currentCashFlow.netCashFlow.toFixed(0)}/month\nReview expenses and income optimization strategies.`
                });
            }
            
            if (currentCashFlow.cashPosition.emergency < alerts.emergencyFundDrop) {
                notifications.push({
                    type: 'critical',
                    message: `🚨 **EMERGENCY FUND ALERT**\nEmergency fund decreased to ${currentCashFlow.cashPosition.emergency.toFixed(0)}\nPrioritize rebuilding emergency reserves.`
                });
            }
            
            // Calculate current savings rate
            const totalIncome = Object.values(currentCashFlow.income).reduce((sum, inc) => sum + (inc.monthly || 0), 0);
            const currentSavingsRate = totalIncome > 0 ? (currentCashFlow.netCashFlow / totalIncome) * 100 : 0;
            
            if (currentSavingsRate < alerts.savingsRateDecline) {
                notifications.push({
                    type: 'warning',
                    message: `📉 **SAVINGS RATE ALERT**\nSavings rate dropped to ${currentSavingsRate.toFixed(1)}%\nReview budget and expense optimization opportunities.`
                });
            }
            
            // Send notifications
            for (const notification of notifications) {
                await sendCustomAlert(userId, chatId, notification.message, 'cashFlowAlert');
            }
            
            // Schedule next check
            setTimeout(() => this.performCashFlowCheck(userId, chatId), 7 * 24 * 60 * 60 * 1000);
            
        } catch (error) {
            logError('Cash flow check failed:', error);
        }
    }

    // 🔧 HELPER METHODS
    calculateCashFlowGrade(analysis) {
        const savingsRate = analysis.efficiency?.savingsRate || 0;
        const stability = (analysis.stability?.incomeStability || 0) * 100;
        const efficiency = analysis.efficiency?.liquidityEfficiency || 0;
        
        const score = (savingsRate + stability + efficiency) / 3;
        
        if (score >= 85) return 'A+';
        if (score >= 75) return 'A';
        if (score >= 65) return 'B+';
        if (score >= 55) return 'B';
        if (score >= 45) return 'C+';
        return 'C';
    }

    // Placeholder implementations for complex calculations
    async getIncomeStreams(userId) {
        return {
            salary: { monthly: 8000, stability: 0.95, growth: 0.03 },
            dividends: { monthly: 500, stability: 0.7, growth: 0.05 },
            business: { monthly: 2000, stability: 0.6, growth: 0.08 }
        };
    }

    async getExpenseCategories(userId) {
        return {
            housing: { monthly: 3000, necessity: 'essential', optimization: 10 },
            transportation: { monthly: 800, necessity: 'essential', optimization: 15 },
            food: { monthly: 600, necessity: 'essential', optimization: 20 },
            entertainment: { monthly: 400, necessity: 'discretionary', optimization: 50 }
        };
    }

    calculateIncomeStability(income) {
        const stabilities = Object.values(income).map(inc => inc.stability || 0.5);
        return stabilities.reduce((sum, stab) => sum + stab, 0) / stabilities.length;
    }

    generateIncomeOptimizationStrategies(income, analysis) {
        return [
            {
                id: 'salary_negotiation',
                name: 'Salary Negotiation',
                timeframe: 'medium',
                monthlyImpact: 800,
                priority: 'high',
                description: 'Negotiate salary increase based on market rates'
            },
            {
                id: 'dividend_optimization',
                name: 'Dividend Portfolio Optimization',
                timeframe: 'short',
                monthlyImpact: 100,
                priority: 'medium',
                description: 'Optimize dividend portfolio for higher yield'
            }
        ];
    }

    async saveCashFlowOptimization(optimization) {
        await saveToMemory(`cash_flow_optimization_${Date.now()}`, optimization);
        this.optimizationHistory.push(optimization.timestamp);
    }
}

// Export functions for easy integration
module.exports = {
    CashFlowOptimizer,
    
    // Main cash flow optimization functions
    optimizeCashFlow: async (userId, preferences, chatId) => {
        const optimizer = new CashFlowOptimizer();
        return await optimizer.optimizeCompleteCashFlow(userId, preferences, chatId);
    },
    
    analyzeCurrentCashFlow: async (userId) => {
        const optimizer = new CashFlowOptimizer();
        return await optimizer.analyzeCashFlowStructure(userId);
    },
    
    optimizeEmergencyFund: async (userId, chatId) => {
        const optimizer = new CashFlowOptimizer();
        const cashFlow = await optimizer.analyzeCashFlowStructure(userId);
        const analysis = await optimizer.analyzeCashFlowPatterns(cashFlow);
        return await optimizer.optimizeEmergencyFund(cashFlow, analysis);
    },
    
    optimizeLiquidity: async (userId, preferences, chatId) => {
        const optimizer = new CashFlowOptimizer();
        const cashFlow = await optimizer.analyzeCashFlowStructure(userId);
        return await optimizer.createLiquidityManagementPlan(cashFlow, preferences);
    },
    
    optimizeTaxes: async (userId, preferences, chatId) => {
        const optimizer = new CashFlowOptimizer();
        const cashFlow = await optimizer.analyzeCashFlowStructure(userId);
        return await optimizer.optimizeTaxEfficiency(cashFlow, preferences);
    },
    
    optimizeDebt: async (userId, chatId) => {
        const optimizer = new CashFlowOptimizer();
        const cashFlow = await optimizer.analyzeCashFlowStructure(userId);
        return await optimizer.optimizeDebtManagement(cashFlow);
    },
    
    projectCashFlow: async (userId, years = 10) => {
        const optimizer = new CashFlowOptimizer();
        const cashFlow = await optimizer.analyzeCashFlowStructure(userId);
        const analysis = await optimizer.analyzeCashFlowPatterns(cashFlow);
        const optimizations = await optimizer.generateOptimizationStrategies(cashFlow, analysis);
        return await optimizer.projectCashFlowScenarios(cashFlow, optimizations);
    },
    
    monitorCashFlow: async (userId, chatId) => {
        const optimizer = new CashFlowOptimizer();
        return await optimizer.performCashFlowCheck(userId, chatId);
    }
};
