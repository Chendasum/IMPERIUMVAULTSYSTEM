// cambodia/cashFlowManagement.js - COMPLETE: Cambodia Cash Flow & Liquidity Management System
// Enterprise-grade cash flow optimization with GPT-5 intelligence for private lending fund

const { executeEnhancedGPT5Command } = require('../utils/dualCommandSystem');

// 🔧 SPECIALIZED HANDLERS (Integration with existing systems)
const cambodiaHandler = require('../handlers/cambodiaDeals');
const lpManagement = require('./lpManagement');
const portfolioManager = require('./portfolioManager');
const loanServicing = require('./loanServicing');
const riskManagement = require('./riskManagement');
const loanRecovery = require('./loanRecovery');
const creditAssessment = require('./creditAssessment');
const loanOrigination = require('./loanOrigination');
const economicIntelligence = require('./economicIntelligence');
const legalRegulatory = require('./legalRegulatory');

// 💵 CAMBODIA CASH FLOW MANAGEMENT FRAMEWORK
const CASH_FLOW_FRAMEWORK = {
    // Cash flow categories and classifications
    cashFlowCategories: {
        operating_inflows: {
            name: "Operating Cash Inflows",
            description: "Regular cash receipts from lending operations",
            components: [
                "Principal repayments",
                "Interest payments", 
                "Late fees and penalties",
                "Prepayment fees",
                "Loan origination fees",
                "Servicing fee income"
            ],
            predictability: "high",
            seasonality: "moderate"
        },
        operating_outflows: {
            name: "Operating Cash Outflows", 
            description: "Regular operating expenses and disbursements",
            components: [
                "New loan disbursements",
                "Operating expenses",
                "Staff salaries and benefits",
                "Professional services fees",
                "Technology and infrastructure",
                "Marketing and business development"
            ],
            predictability: "high",
            seasonality: "low"
        },
        financing_inflows: {
            name: "Financing Cash Inflows",
            description: "Capital raising and funding activities",
            components: [
                "LP capital contributions",
                "Credit facility drawdowns",
                "Bond or note issuances",
                "Asset sales proceeds",
                "Recovery collections",
                "Investment income"
            ],
            predictability: "medium",
            seasonality: "high"
        },
        financing_outflows: {
            name: "Financing Cash Outflows",
            description: "Capital distributions and financing costs",
            components: [
                "LP distributions",
                "Interest on credit facilities",
                "Debt service payments",
                "Management fees",
                "Performance fees",
                "Capital expenditures"
            ],
            predictability: "medium",
            seasonality: "quarterly"
        },
        contingency_reserves: {
            name: "Contingency Reserves",
            description: "Emergency liquidity buffers and reserves",
            components: [
                "Loan loss provisions",
                "Operational contingencies",
                "Market volatility buffer",
                "Regulatory capital requirements",
                "Stress scenario reserves"
            ],
            predictability: "low",
            target_percentage: "15-25%"
        }
    },

    // Liquidity management policies
    liquidityPolicies: {
        minimum_cash_ratio: {
            target: 15.0, // 15% of AUM
            warning_threshold: 10.0, // 10% warning level
            critical_threshold: 5.0, // 5% critical level
            measurement: "percentage_of_assets"
        },
        maximum_loan_commitment: {
            target: 85.0, // Max 85% of available capital
            warning_threshold: 90.0, // 90% warning level
            critical_threshold: 95.0, // 95% critical level
            measurement: "percentage_of_capital"
        },
        liquidity_coverage_ratio: {
            target: 1.5, // 150% coverage of 30-day outflows
            minimum: 1.2, // 120% minimum coverage
            stress_test: 1.0, // 100% stress scenario
            measurement: "ratio"
        },
        funding_diversification: {
            max_single_source: 25.0, // Max 25% from single LP
            min_committed_facilities: 20.0, // Min 20% committed credit
            target_sources: 5, // Target 5+ funding sources
            measurement: "diversification_metrics"
        }
    },

    // Cash flow forecasting methodologies
    forecastingMethods: {
        loan_repayments: {
            method: "amortization_schedule_based",
            adjustments: ["prepayment_rates", "default_rates", "seasonal_factors"],
            confidence_level: "high",
            forecast_horizon: "24_months"
        },
        new_originations: {
            method: "pipeline_and_commitment_based", 
            adjustments: ["market_conditions", "credit_standards", "competitive_factors"],
            confidence_level: "medium",
            forecast_horizon: "12_months"
        },
        lp_contributions: {
            method: "commitment_schedule_based",
            adjustments: ["market_conditions", "fund_performance", "lp_capacity"],
            confidence_level: "high",
            forecast_horizon: "36_months"
        },
        operating_expenses: {
            method: "budget_and_trend_based",
            adjustments: ["inflation", "scale_effects", "strategic_investments"],
            confidence_level: "high",
            forecast_horizon: "12_months"
        }
    },

    // Stress testing scenarios
    stressScenarios: {
        economic_downturn: {
            name: "Economic Downturn",
            assumptions: {
                default_rate_increase: "2x",
                prepayment_rate_decrease: "-50%",
                new_origination_decrease: "-30%",
                lp_commitment_delay: "+3_months"
            },
            probability: "10-15%",
            duration: "12-18_months"
        },
        liquidity_crisis: {
            name: "Liquidity Crisis",
            assumptions: {
                credit_facility_unavailable: "100%",
                lp_funding_delay: "+6_months",
                recovery_timeline_extension: "+50%",
                operating_cost_increase: "+20%"
            },
            probability: "5-10%",
            duration: "6-12_months"
        },
        market_disruption: {
            name: "Market Disruption",
            assumptions: {
                collateral_value_decline: "-30%",
                recovery_rate_decrease: "-25%",
                refinancing_unavailable: "6_months",
                new_business_halt: "3_months"
            },
            probability: "15-20%",
            duration: "9-15_months"
        }
    },

    // Cash optimization strategies
    optimizationStrategies: {
        excess_liquidity: [
            "Short-term money market investments",
            "Treasury securities portfolio",
            "High-grade corporate bonds",
            "Bank certificates of deposit",
            "Accelerated loan origination",
            "Special dividend to LPs"
        ],
        liquidity_shortage: [
            "Draw on committed credit facilities",
            "Accelerate loan collections",
            "Delay non-essential expenditures", 
            "Request LP capital calls",
            "Asset sales or loan participations",
            "Working capital optimization"
        ],
        seasonal_management: [
            "Build cash reserves before peak seasons",
            "Time LP distributions appropriately",
            "Coordinate marketing and origination cycles",
            "Plan maintenance and system upgrades",
            "Optimize staffing and resource allocation"
        ]
    }
};

// 💰 CASH FLOW MANAGEMENT FUNCTIONS

/**
 * 📊 Comprehensive Cash Flow Forecast Analysis
 */
async function forecastCashFlow(forecastData, periodMonths = 12, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - COMPREHENSIVE CASH FLOW FORECAST ANALYSIS

FUND OVERVIEW:
• Fund Size: $${forecastData.fundSize ? forecastData.fundSize.toLocaleString() : 'Not specified'} USD
• Current Cash Balance: $${forecastData.currentCash ? forecastData.currentCash.toLocaleString() : 'Not provided'} USD
• Outstanding Loan Portfolio: $${forecastData.loanPortfolio ? forecastData.loanPortfolio.toLocaleString() : 'Not provided'} USD
• Available Credit Lines: $${forecastData.availableCredit ? forecastData.availableCredit.toLocaleString() : 'Not provided'} USD
• Forecast Period: ${periodMonths} months

CURRENT LIQUIDITY POSITION:
• Cash Ratio: ${forecastData.cashRatio || 'Not calculated'}%
• Liquidity Coverage Ratio: ${forecastData.liquidityCoverage || 'Not calculated'}x
• Committed Capital Available: $${forecastData.committedCapital ? forecastData.committedCapital.toLocaleString() : 'Not provided'} USD
• Monthly Operating Expenses: $${forecastData.monthlyOpex ? forecastData.monthlyOpex.toLocaleString() : 'Not provided'} USD

EXPECTED CASH INFLOWS:
• Principal Repayments: $${forecastData.expectedPrincipalRepayments ? forecastData.expectedPrincipalRepayments.toLocaleString() : 'Not forecasted'} USD
• Interest Collections: $${forecastData.expectedInterestCollections ? forecastData.expectedInterestCollections.toLocaleString() : 'Not forecasted'} USD
• LP Capital Contributions: $${forecastData.expectedLPContributions ? forecastData.expectedLPContributions.toLocaleString() : 'Not scheduled'} USD
• Recovery Collections: $${forecastData.expectedRecoveries ? forecastData.expectedRecoveries.toLocaleString() : 'Not forecasted'} USD

EXPECTED CASH OUTFLOWS:
• New Loan Originations: $${forecastData.plannedOriginations ? forecastData.plannedOriginations.toLocaleString() : 'Not planned'} USD
• Operating Expenses: $${forecastData.forecastedOpex ? forecastData.forecastedOpex.toLocaleString() : 'Not budgeted'} USD
• LP Distributions: $${forecastData.plannedDistributions ? forecastData.plannedDistributions.toLocaleString() : 'Not scheduled'} USD
• Debt Service: $${forecastData.debtServicePayments ? forecastData.debtServicePayments.toLocaleString() : 'Not applicable'} USD

MARKET CONDITIONS:
• Cambodia Economic Growth: ${forecastData.economicGrowth || 'Not specified'}%
• Interest Rate Environment: ${forecastData.interestRateEnvironment || 'Not specified'}
• Credit Market Conditions: ${forecastData.creditMarketConditions || 'Not assessed'}
• FX Rate Stability: ${forecastData.fxStability || 'Not evaluated'}

COMPREHENSIVE CASH FLOW FORECAST ANALYSIS:

1. **OPERATING CASH FLOW PROJECTIONS**
   - Monthly loan payment collections and seasonality patterns
   - Interest income forecasting with rate and volume scenarios
   - Fee income projections from origination and servicing
   - Operating expense trending and inflation adjustments

2. **FINANCING CASH FLOW PLANNING**
   - LP capital call scheduling and availability assessment
   - Credit facility utilization and capacity planning
   - Debt service obligations and refinancing requirements
   - Distribution policy and payout projections

3. **LIQUIDITY POSITION ANALYSIS**
   - Monthly ending cash balance projections
   - Liquidity ratio maintenance and compliance monitoring
   - Cash surplus/deficit identification and timing
   - Contingency reserve adequacy assessment

4. **SCENARIO AND SENSITIVITY ANALYSIS**
   - Base case, optimistic, and conservative scenarios
   - Interest rate sensitivity and economic cycle impact
   - Default rate stress testing and cash flow implications
   - Market disruption and liquidity crisis preparedness

5. **CASH OPTIMIZATION OPPORTUNITIES**
   - Excess liquidity investment and yield enhancement
   - Working capital efficiency and cash conversion optimization
   - Funding cost minimization and source diversification
   - Seasonal cash management and timing optimization

6. **RISK FACTORS AND MITIGATION STRATEGIES**
   - Cash flow volatility sources and management techniques
   - Funding concentration risks and diversification strategies
   - Operational cash flow dependencies and contingencies
   - Market timing risks and hedging considerations

CAMBODIA-SPECIFIC CASH FLOW FACTORS:
• USD dollarization impact on cash management
• Local banking relationships and cash handling
• Regulatory capital requirements and restrictions
• Holiday and seasonal business cycles
• Cross-border fund flow considerations
• Economic policy impact on lending markets

FORECAST RECOMMENDATIONS:
• Liquidity management strategy and policy adjustments
• Funding optimization and diversification priorities
• Cash deployment and investment opportunities
• Risk mitigation and contingency planning

Provide comprehensive cash flow forecast with monthly projections and strategic recommendations.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📊 Cash Flow Forecast Analysis",
            forceModel: "gpt-5" // Full model for comprehensive forecasting
        });

        // Generate detailed cash flow projections
        const monthlyProjections = generateMonthlyProjections(forecastData, periodMonths);
        const scenarioAnalysis = performScenarioAnalysis(forecastData, periodMonths);
        const liquidityAnalysis = analyzeLiquidityPosition(forecastData, monthlyProjections);
        const recommendations = generateCashFlowRecommendations(liquidityAnalysis, scenarioAnalysis);

        return {
            analysis: result.response,
            forecastSummary: {
                periodMonths: periodMonths,
                currentCash: forecastData.currentCash,
                projectedEndingCash: monthlyProjections[monthlyProjections.length - 1]?.endingCash,
                avgMonthlyCashFlow: calculateAverageCashFlow(monthlyProjections),
                liquidityRating: assessLiquidityRating(liquidityAnalysis)
            },
            monthlyProjections: monthlyProjections,
            scenarioAnalysis: scenarioAnalysis,
            liquidityAnalysis: liquidityAnalysis,
            recommendations: recommendations,
            riskFactors: identifyCashFlowRisks(forecastData, liquidityAnalysis),
            forecastDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Cash flow forecast error:', error.message);
        return {
            analysis: `Cash flow forecast unavailable: ${error.message}`,
            forecastSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📈 Generate Monthly Cash Flow Projections
 */
function generateMonthlyProjections(forecastData, periodMonths) {
    const projections = [];
    let runningCashBalance = parseFloat(forecastData.currentCash || 0);
    
    // Base monthly amounts
    const monthlyPrincipalRepayments = (parseFloat(forecastData.expectedPrincipalRepayments || 0) / periodMonths);
    const monthlyInterestCollections = (parseFloat(forecastData.expectedInterestCollections || 0) / periodMonths);
    const monthlyOperatingExpenses = parseFloat(forecastData.monthlyOpex || 0);
    const monthlyOriginations = (parseFloat(forecastData.plannedOriginations || 0) / periodMonths);
    
    for (let month = 1; month <= periodMonths; month++) {
        // Apply seasonality factors
        const seasonalityFactor = getSeasonalityFactor(month);
        
        // Calculate inflows
        const principalInflow = monthlyPrincipalRepayments * seasonalityFactor.collections;
        const interestInflow = monthlyInterestCollections * seasonalityFactor.collections;
        const lpContributions = calculateLPContributions(month, forecastData);
        const totalInflows = principalInflow + interestInflow + lpContributions;
        
        // Calculate outflows
        const originations = monthlyOriginations * seasonalityFactor.originations;
        const operatingExpenses = monthlyOperatingExpenses * seasonalityFactor.expenses;
        const distributions = calculateDistributions(month, forecastData);
        const totalOutflows = originations + operatingExpenses + distributions;
        
        // Net cash flow
        const netCashFlow = totalInflows - totalOutflows;
        runningCashBalance += netCashFlow;
        
        // Monthly projection
        projections.push({
            month: month,
            startingCash: runningCashBalance - netCashFlow,
            inflows: {
                principalRepayments: Math.round(principalInflow),
                interestCollections: Math.round(interestInflow),
                lpContributions: Math.round(lpContributions),
                totalInflows: Math.round(totalInflows)
            },
            outflows: {
                newOriginations: Math.round(originations),
                operatingExpenses: Math.round(operatingExpenses), 
                distributions: Math.round(distributions),
                totalOutflows: Math.round(totalOutflows)
            },
            netCashFlow: Math.round(netCashFlow),
            endingCash: Math.round(runningCashBalance),
            cashRatio: ((runningCashBalance / (forecastData.fundSize || 1)) * 100).toFixed(1),
            liquidityDays: Math.round(runningCashBalance / (monthlyOperatingExpenses || 1) * 30)
        });
    }
    
    return projections;
}

/**
 * 🎯 Perform Multi-Scenario Analysis
 */
function performScenarioAnalysis(forecastData, periodMonths) {
    const baseProjections = generateMonthlyProjections(forecastData, periodMonths);
    
    // Optimistic Scenario (+20% inflows, -10% outflows)
    const optimisticData = { ...forecastData };
    optimisticData.expectedPrincipalRepayments = (parseFloat(forecastData.expectedPrincipalRepayments || 0) * 1.2);
    optimisticData.expectedInterestCollections = (parseFloat(forecastData.expectedInterestCollections || 0) * 1.2);
    optimisticData.monthlyOpex = (parseFloat(forecastData.monthlyOpex || 0) * 0.9);
    const optimisticProjections = generateMonthlyProjections(optimisticData, periodMonths);
    
    // Conservative Scenario (-15% inflows, +10% outflows)
    const conservativeData = { ...forecastData };
    conservativeData.expectedPrincipalRepayments = (parseFloat(forecastData.expectedPrincipalRepayments || 0) * 0.85);
    conservativeData.expectedInterestCollections = (parseFloat(forecastData.expectedInterestCollections || 0) * 0.85);
    conservativeData.monthlyOpex = (parseFloat(forecastData.monthlyOpex || 0) * 1.1);
    const conservativeProjections = generateMonthlyProjections(conservativeData, periodMonths);
    
    // Stress Scenario (-30% inflows, +20% outflows, 2x defaults)
    const stressData = { ...forecastData };
    stressData.expectedPrincipalRepayments = (parseFloat(forecastData.expectedPrincipalRepayments || 0) * 0.7);
    stressData.expectedInterestCollections = (parseFloat(forecastData.expectedInterestCollections || 0) * 0.7);
    stressData.monthlyOpex = (parseFloat(forecastData.monthlyOpex || 0) * 1.2);
    const stressProjections = generateMonthlyProjections(stressData, periodMonths);
    
    return {
        base: {
            name: "Base Case",
            probability: "50%",
            finalCash: baseProjections[baseProjections.length - 1].endingCash,
            minCash: Math.min(...baseProjections.map(p => p.endingCash)),
            projections: baseProjections
        },
        optimistic: {
            name: "Optimistic", 
            probability: "25%",
            finalCash: optimisticProjections[optimisticProjections.length - 1].endingCash,
            minCash: Math.min(...optimisticProjections.map(p => p.endingCash)),
            projections: optimisticProjections
        },
        conservative: {
            name: "Conservative",
            probability: "20%",
            finalCash: conservativeProjections[conservativeProjections.length - 1].endingCash,
            minCash: Math.min(...conservativeProjections.map(p => p.endingCash)),
            projections: conservativeProjections
        },
        stress: {
            name: "Stress Test",
            probability: "5%", 
            finalCash: stressProjections[stressProjections.length - 1].endingCash,
            minCash: Math.min(...stressProjections.map(p => p.endingCash)),
            projections: stressProjections
        }
    };
}

/**
 * 🌊 Analyze Liquidity Position
 */
function analyzeLiquidityPosition(forecastData, monthlyProjections) {
    const currentCash = parseFloat(forecastData.currentCash || 0);
    const fundSize = parseFloat(forecastData.fundSize || 1);
    const monthlyOpex = parseFloat(forecastData.monthlyOpex || 0);
    
    // Calculate key liquidity metrics
    const analysis = {
        currentPosition: {
            cashBalance: currentCash,
            cashRatio: ((currentCash / fundSize) * 100).toFixed(1) + "%",
            operatingDaysCovered: Math.round(currentCash / (monthlyOpex / 30)),
            liquidityRating: assessCurrentLiquidity(currentCash, fundSize, monthlyOpex)
        },
        projectedPosition: {
            maxCashBalance: Math.max(...monthlyProjections.map(p => p.endingCash)),
            minCashBalance: Math.min(...monthlyProjections.map(p => p.endingCash)),
            avgCashBalance: Math.round(monthlyProjections.reduce((sum, p) => sum + p.endingCash, 0) / monthlyProjections.length),
            monthsBelow10Percent: monthlyProjections.filter(p => parseFloat(p.cashRatio) < 10).length
        },
        riskIndicators: {
            liquidityShortfall: monthlyProjections.filter(p => p.endingCash < 0).length > 0,
            belowMinimumThreshold: monthlyProjections.filter(p => parseFloat(p.cashRatio) < 5).length,
            volatilityScore: calculateCashVolatility(monthlyProjections),
            fundingGaps: identifyFundingGaps(monthlyProjections)
        }
    };
    
    return analysis;
}

/**
 * 💡 Generate Cash Flow Recommendations
 */
function generateCashFlowRecommendations(liquidityAnalysis, scenarioAnalysis) {
    const recommendations = [];
    
    // Current liquidity assessment
    const currentRating = liquidityAnalysis.currentPosition.liquidityRating;
    if (currentRating === "Critical" || currentRating === "Low") {
        recommendations.push({
            category: "Immediate Action",
            recommendation: "Address liquidity shortage immediately",
            priority: "Urgent",
            actions: [
                "Draw on available credit facilities",
                "Accelerate loan collections",
                "Defer non-essential expenditures",
                "Consider emergency LP capital call"
            ],
            timeline: "Immediate"
        });
    }
    
    // Projected liquidity issues
    if (liquidityAnalysis.riskIndicators.liquidityShortfall) {
        recommendations.push({
            category: "Liquidity Planning",
            recommendation: "Address projected cash flow shortfalls",
            priority: "High",
            actions: [
                "Establish additional credit facilities",
                "Renegotiate LP commitment schedules",
                "Implement cash flow forecasting system",
                "Create liquidity contingency plan"
            ],
            timeline: "30-60 days"
        });
    }
    
    // Stress test results
    if (scenarioAnalysis.stress.minCash < 0) {
        recommendations.push({
            category: "Stress Preparedness", 
            recommendation: "Strengthen stress scenario resilience",
            priority: "Medium",
            actions: [
                "Increase minimum cash reserves to 20%",
                "Diversify funding sources",
                "Implement dynamic hedging strategies",
                "Develop crisis communication plan"
            ],
            timeline: "90-120 days"
        });
    }
    
    // Cash optimization opportunities
    const avgCash = liquidityAnalysis.projectedPosition.avgCashBalance;
    const fundSize = parseFloat(liquidityAnalysis.currentPosition.cashBalance) / (parseFloat(liquidityAnalysis.currentPosition.cashRatio) / 100);
    
    if (avgCash > fundSize * 0.25) {
        recommendations.push({
            category: "Cash Optimization",
            recommendation: "Optimize excess liquidity deployment",
            priority: "Medium",
            actions: [
                "Invest excess cash in short-term securities",
                "Accelerate loan origination pipeline",
                "Consider special dividend to LPs",
                "Evaluate higher-yield cash management"
            ],
            timeline: "60-90 days"
        });
    }
    
    return recommendations;
}

/**
 * ⚠️ Identify Cash Flow Risk Factors
 */
function identifyCashFlowRisks(forecastData, liquidityAnalysis) {
    const risks = [];
    
    // Concentration risks
    const lpContributions = parseFloat(forecastData.expectedLPContributions || 0);
    const totalInflows = lpContributions + parseFloat(forecastData.expectedPrincipalRepayments || 0);
    
    if (lpContributions / totalInflows > 0.5) {
        risks.push({
            category: "Funding Concentration",
            risk: "High dependence on LP capital contributions",
            impact: "High",
            probability: "Medium",
            mitigation: "Diversify funding sources and increase operating cash generation"
        });
    }
    
    // Market timing risks
    risks.push({
        category: "Market Risk",
        risk: "Economic downturn could impact cash flows",
        impact: "High", 
        probability: "Low-Medium",
        mitigation: "Maintain higher cash reserves and stress test regularly"
    });
    
    // Operational risks
    if (liquidityAnalysis.riskIndicators.volatilityScore > 0.3) {
        risks.push({
            category: "Volatility Risk",
            risk: "High cash flow volatility reduces predictability",
            impact: "Medium",
            probability: "Medium",
            mitigation: "Improve forecasting accuracy and diversify revenue streams"
        });
    }
    
    // Liquidity risks
    if (liquidityAnalysis.currentPosition.operatingDaysCovered < 90) {
        risks.push({
            category: "Liquidity Risk",
            risk: "Limited operating cash runway",
            impact: "High",
            probability: "High", 
            mitigation: "Increase cash reserves and establish credit facilities"
        });
    }
    
    return risks;
}

/**
 * 🏦 Manage Liquidity Operations
 */
async function manageLiquidityOperations(liquidityData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - LIQUIDITY OPERATIONS MANAGEMENT

CURRENT LIQUIDITY POSITION:
• Available Cash: $${liquidityData.availableCash ? liquidityData.availableCash.toLocaleString() : 'Not provided'} USD
• Money Market Investments: $${liquidityData.moneyMarketInvestments ? liquidityData.moneyMarketInvestments.toLocaleString() : 'Not provided'} USD
• Uncommitted Credit Lines: $${liquidityData.uncommittedCredit ? liquidityData.uncommittedCredit.toLocaleString() : 'Not provided'} USD
• Total Liquid Assets: $${liquidityData.totalLiquidAssets ? liquidityData.totalLiquidAssets.toLocaleString() : 'Not calculated'} USD

FUNDING CAPACITY:
• Committed LP Capital: $${liquidityData.committedLPCapital ? liquidityData.committedLPCapital.toLocaleString() : 'Not provided'} USD
• Drawn Capital: $${liquidityData.drawnCapital ? liquidityData.drawnCapital.toLocaleString() : 'Not provided'} USD
• Available for Draw: $${liquidityData.availableForDraw ? liquidityData.availableForDraw.toLocaleString() : 'Not calculated'} USD
• Credit Facility Capacity: $${liquidityData.creditFacilityCapacity ? liquidityData.creditFacilityCapacity.toLocaleString() : 'Not provided'} USD

NEAR-TERM OBLIGATIONS:
• Pending Loan Disbursements: $${liquidityData.pendingDisbursements ? liquidityData.pendingDisbursements.toLocaleString() : 'Not provided'} USD
• Scheduled Distributions: $${liquidityData.scheduledDistributions ? liquidityData.scheduledDistributions.toLocaleString() : 'Not provided'} USD
• Operating Expense Runway: ${liquidityData.operatingRunwayDays || 'Not calculated'} days
• Debt Service Due: $${liquidityData.debtServiceDue ? liquidityData.debtServiceDue.toLocaleString() : 'Not applicable'} USD

MARKET CONDITIONS:
• Short-term Interest Rates: ${liquidityData.shortTermRates || 'Not specified'}%
• Credit Market Access: ${liquidityData.creditMarketAccess || 'Not assessed'}
• LP Funding Environment: ${liquidityData.lpFundingEnvironment || 'Not evaluated'}
• Cambodia Banking Conditions: ${liquidityData.bankingConditions || 'Not reported'}

LIQUIDITY OPERATIONS ANALYSIS:

1. **IMMEDIATE LIQUIDITY ASSESSMENT**
   - Available cash sufficiency for near-term obligations
   - Funding gap identification and timing analysis
   - Credit facility capacity and utilization optimization
   - Emergency liquidity scenarios and contingency planning

2. **CASH DEPLOYMENT OPTIMIZATION**
   - Excess liquidity investment opportunities and yield enhancement
   - Short-term investment portfolio management and safety
   - Optimal cash balance targeting and efficiency ratios
   - Sweep account and cash concentration strategies

3. **FUNDING SOURCE MANAGEMENT**
   - LP capital call timing and amount optimization
   - Credit facility negotiation and covenant management
   - Alternative funding source evaluation and diversification
   - Cost of funds minimization and term matching

4. **LIQUIDITY RISK MONITORING**
   - Real-time liquidity position tracking and alerts
   - Stress testing and scenario planning execution
   - Covenant compliance monitoring and reporting
   - Market condition impact assessment and adaptation

5. **OPERATIONAL EFFICIENCY ENHANCEMENT**
   - Cash conversion cycle optimization and acceleration
   - Payment system efficiency and automation opportunities
   - Banking relationship management and service optimization
   - Foreign exchange management and hedging strategies

6. **REGULATORY AND COMPLIANCE MANAGEMENT**
   - Cambodia central bank liquidity requirements compliance
   - Financial reporting and disclosure obligations
   - Anti-money laundering cash transaction monitoring
   - Cross-border fund flow documentation and approval

CAMBODIA LIQUIDITY CONSIDERATIONS:
• USD cash management in dollarized economy
• Local banking relationships and cash handling capabilities
• Regulatory restrictions on foreign fund movements
• Holiday and weekend cash access limitations
• Emergency liquidity sources and central bank facilities

LIQUIDITY OPTIMIZATION RECOMMENDATIONS:
• Immediate liquidity actions and cash positioning
• Medium-term funding strategy and capacity building
• Risk mitigation and contingency planning priorities
• Operational efficiency improvements and automation

Provide comprehensive liquidity operations management plan with specific action items.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🏦 Liquidity Operations Management",
            forceModel: "gpt-5" // Full model for comprehensive liquidity analysis
        });

        // Analyze liquidity operations
        const liquidityPosition = assessLiquidityPosition(liquidityData);
        const optimizationOpportunities = identifyOptimizationOpportunities(liquidityData);
        const operationalPlan = developOperationalPlan(liquidityPosition, optimizationOpportunities);
        const riskAssessment = assessLiquidityRisks(liquidityData);

        return {
            analysis: result.response,
            liquiditySummary: {
                totalLiquidAssets: liquidityData.totalLiquidAssets,
                availableCapacity: liquidityData.availableForDraw,
                liquidityRatio: calculateLiquidityRatio(liquidityData),
                riskLevel: riskAssessment.overallRiskLevel
            },
            liquidityPosition: liquidityPosition,
            optimizationOpportunities: optimizationOpportunities,
            operationalPlan: operationalPlan,
            riskAssessment: riskAssessment,
            monitoringMetrics: generateMonitoringMetrics(liquidityData),
            managementDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Liquidity operations management error:', error.message);
        return {
            analysis: `Liquidity operations management unavailable: ${error.message}`,
            liquiditySummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Optimize Cash Investment Strategy
 */
async function optimizeCashInvestment(investmentData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING FUND - CASH INVESTMENT OPTIMIZATION

AVAILABLE CASH FOR INVESTMENT:
• Excess Cash Balance: ${investmentData.excessCash ? investmentData.excessCash.toLocaleString() : 'Not provided'} USD
• Investment Horizon: ${investmentData.investmentHorizon || 'Not specified'}
• Risk Tolerance: ${investmentData.riskTolerance || 'Not specified'}
• Liquidity Requirements: ${investmentData.liquidityRequirements || 'Not defined'}

INVESTMENT CONSTRAINTS:
• Minimum Cash Reserve: ${investmentData.minimumCashReserve ? investmentData.minimumCashReserve.toLocaleString() : 'Not set'} USD
• Maximum Investment Term: ${investmentData.maxInvestmentTerm || 'Not specified'}
• Credit Rating Requirements: ${investmentData.creditRatingRequirements || 'Not specified'}
• Currency Preferences: ${investmentData.currencyPreferences || 'USD preferred'}

MARKET CONDITIONS:
• Short-term Treasury Rates: ${investmentData.treasuryRates || 'Not provided'}%
• Money Market Rates: ${investmentData.moneyMarketRates || 'Not provided'}%
• Corporate Bond Yields: ${investmentData.corporateBondYields || 'Not provided'}%
• Cambodia Government Bond Rates: ${investmentData.cambodiaGovBondRates || 'Not provided'}%

CURRENT PORTFOLIO:
• Money Market Funds: ${investmentData.currentMoneyMarket ? investmentData.currentMoneyMarket.toLocaleString() : 'Not provided'} USD
• Treasury Securities: ${investmentData.currentTreasuries ? investmentData.currentTreasuries.toLocaleString() : 'Not provided'} USD
• Corporate Bonds: ${investmentData.currentCorporateBonds ? investmentData.currentCorporateBonds.toLocaleString() : 'Not provided'} USD
• Bank Deposits: ${investmentData.currentBankDeposits ? investmentData.currentBankDeposits.toLocaleString() : 'Not provided'} USD

CASH INVESTMENT OPTIMIZATION ANALYSIS:

1. **INVESTMENT OPPORTUNITY ASSESSMENT**
   - Available investment vehicles and yield comparison
   - Risk-return profile evaluation for each option
   - Liquidity characteristics and access timing
   - Credit quality assessment and safety analysis

2. **PORTFOLIO OPTIMIZATION STRATEGY**
   - Optimal allocation across investment categories
   - Duration and maturity ladder construction
   - Diversification benefits and concentration limits
   - Yield enhancement while preserving capital safety

3. **LIQUIDITY PRESERVATION PLANNING**
   - Staggered maturity scheduling and rollover strategy
   - Emergency liquidity access and early redemption options
   - Market volatility impact and value-at-risk assessment
   - Stress scenario liquidity availability testing

4. **RISK MANAGEMENT FRAMEWORK**
   - Interest rate risk management and duration matching
   - Credit risk assessment and rating requirements
   - Concentration limits and issuer diversification
   - Market risk monitoring and position sizing

5. **OPERATIONAL IMPLEMENTATION**
   - Investment execution and settlement procedures
   - Custodial arrangements and safekeeping protocols
   - Performance monitoring and reporting systems
   - Rebalancing triggers and portfolio maintenance

6. **REGULATORY AND COMPLIANCE CONSIDERATIONS**
   - Investment policy compliance and board approval
   - Fiduciary duty fulfillment and prudent investor standards
   - Disclosure requirements and investor reporting
   - Tax efficiency and withholding optimization

CAMBODIA INVESTMENT ENVIRONMENT:
• Local currency investment options and regulations
• Cross-border investment restrictions and approvals
• Banking system stability and deposit insurance
• Foreign exchange considerations and hedging needs

INVESTMENT RECOMMENDATIONS:
• Optimal portfolio allocation and specific securities
• Implementation timeline and execution strategy
• Performance benchmarks and success metrics
• Risk monitoring and adjustment protocols

Provide comprehensive cash investment optimization strategy with specific recommendations.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📊 Cash Investment Optimization",
            forceModel: "gpt-5-mini" // Balanced model for investment analysis
        });

        // Develop investment strategy
        const investmentOptions = evaluateInvestmentOptions(investmentData);
        const optimalAllocation = calculateOptimalAllocation(investmentData, investmentOptions);
        const implementationPlan = createImplementationPlan(optimalAllocation);
        const performanceTargets = setPerformanceTargets(investmentData, optimalAllocation);

        return {
            analysis: result.response,
            investmentSummary: {
                excessCash: investmentData.excessCash,
                investmentHorizon: investmentData.investmentHorizon,
                targetYield: optimalAllocation.expectedYield,
                riskLevel: optimalAllocation.riskLevel
            },
            investmentOptions: investmentOptions,
            optimalAllocation: optimalAllocation,
            implementationPlan: implementationPlan,
            performanceTargets: performanceTargets,
            riskParameters: defineRiskParameters(investmentData),
            optimizationDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Cash investment optimization error:', error.message);
        return {
            analysis: `Cash investment optimization unavailable: ${error.message}`,
            investmentSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 🚨 Monitor Liquidity Alerts and Triggers
 */
async function monitorLiquidityAlerts(monitoringData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING FUND - LIQUIDITY MONITORING & ALERT SYSTEM

CURRENT MONITORING METRICS:
• Real-time Cash Balance: ${monitoringData.currentCashBalance ? monitoringData.currentCashBalance.toLocaleString() : 'Not provided'} USD
• Cash Ratio: ${monitoringData.cashRatio || 'Not calculated'}%
• Liquidity Coverage Ratio: ${monitoringData.liquidityCoverageRatio || 'Not calculated'}x
• Days Cash on Hand: ${monitoringData.daysCashOnHand || 'Not calculated'} days

ALERT THRESHOLDS:
• Minimum Cash Ratio: ${monitoringData.minCashRatio || '10'}%
• Critical Cash Ratio: ${monitoringData.criticalCashRatio || '5'}%
• Minimum Days Coverage: ${monitoringData.minDaysCoverage || '30'} days
• Maximum Concentration: ${monitoringData.maxConcentration || '25'}%

RECENT ALERT TRIGGERS:
• Threshold Breaches: ${monitoringData.recentBreaches || 'None reported'}
• Warning Levels Reached: ${monitoringData.warningLevels || 'None reported'}
• Trend Deterioration: ${monitoringData.trendDeterioration || 'Not detected'}
• Covenant Violations: ${monitoringData.covenantViolations || 'None reported'}

FORWARD-LOOKING INDICATORS:
• 7-Day Cash Flow Projection: ${monitoringData.sevenDayProjection ? monitoringData.sevenDayProjection.toLocaleString() : 'Not forecasted'} USD
• 30-Day Cash Flow Projection: ${monitoringData.thirtyDayProjection ? monitoringData.thirtyDayProjection.toLocaleString() : 'Not forecasted'} USD
• Upcoming Large Outflows: ${monitoringData.upcomingOutflows ? monitoringData.upcomingOutflows.toLocaleString() : 'Not identified'} USD
• Expected Inflow Timing: ${monitoringData.expectedInflowTiming || 'Not specified'}

LIQUIDITY MONITORING ANALYSIS:

1. **REAL-TIME POSITION ASSESSMENT**
   - Current liquidity adequacy and sufficiency evaluation
   - Threshold breach identification and severity assessment
   - Trend analysis and deterioration pattern recognition
   - Immediate action requirement determination

2. **FORWARD-LOOKING RISK IDENTIFICATION**
   - Projected liquidity shortfall timing and magnitude
   - Early warning signal detection and escalation
   - Scenario-based stress testing and trigger activation
   - Contingency plan activation criteria assessment

3. **ALERT PRIORITIZATION AND ESCALATION**
   - Critical vs warning level alert classification
   - Stakeholder notification and communication protocols
   - Management escalation and decision-making triggers
   - Regulatory reporting and compliance obligations

4. **CORRECTIVE ACTION PLANNING**
   - Immediate liquidity enhancement options
   - Medium-term funding source activation
   - Operational adjustment and expense management
   - Strategic pivot and portfolio rebalancing

5. **MONITORING SYSTEM OPTIMIZATION**
   - Alert threshold calibration and sensitivity analysis
   - False positive reduction and accuracy improvement
   - Automated response system enhancement
   - Reporting dashboard and visualization updates

CAMBODIA-SPECIFIC MONITORING CONSIDERATIONS:
• Holiday and weekend liquidity access limitations
• Banking system operational hours and constraints
• Regulatory reporting deadlines and requirements
• Cross-border fund transfer timing and restrictions

ALERT RESPONSE RECOMMENDATIONS:
• Immediate actions for current alert conditions
• Preventive measures for potential future triggers
• System improvements and threshold adjustments
• Stakeholder communication and reporting updates

Provide comprehensive liquidity monitoring analysis with specific alert responses and system improvements.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🚨 Liquidity Alert Monitoring",
            forceModel: "gpt-5-mini" // Balanced model for monitoring analysis
        });

        // Analyze current alerts and trends
        const alertStatus = assessCurrentAlerts(monitoringData);
        const trendAnalysis = analyzeLiquidityTrends(monitoringData);
        const actionPlan = generateAlertActionPlan(alertStatus, trendAnalysis);
        const systemOptimization = recommendSystemOptimization(monitoringData);

        return {
            analysis: result.response,
            alertSummary: {
                currentAlertLevel: alertStatus.alertLevel,
                activeAlerts: alertStatus.activeAlerts.length,
                trendDirection: trendAnalysis.overallTrend,
                actionRequired: actionPlan.immediateActions.length > 0
            },
            alertStatus: alertStatus,
            trendAnalysis: trendAnalysis,
            actionPlan: actionPlan,
            systemOptimization: systemOptimization,
            monitoringMetrics: generateDetailedMonitoringMetrics(monitoringData),
            alertDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Liquidity alert monitoring error:', error.message);
        return {
            analysis: `Liquidity alert monitoring unavailable: ${error.message}`,
            alertSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

// 🧮 CASH FLOW HELPER FUNCTIONS

/**
 * 📅 Get Seasonality Factors
 */
function getSeasonalityFactor(month) {
    // Cambodia business seasonality patterns
    const seasonality = {
        collections: 1.0, // Base factor
        originations: 1.0,
        expenses: 1.0
    };
    
    // Adjust for Cambodian holidays and business cycles
    if (month === 4) { // Khmer New Year impact
        seasonality.collections = 0.8;
        seasonality.originations = 0.7;
        seasonality.expenses = 1.1;
    } else if (month === 12 || month === 1) { // Year-end/New Year
        seasonality.collections = 1.2;
        seasonality.originations = 0.9;
        seasonality.expenses = 1.2;
    } else if (month >= 6 && month <= 9) { // Rainy season
        seasonality.collections = 0.95;
        seasonality.originations = 1.1;
        seasonality.expenses = 1.05;
    }
    
    return seasonality;
}

/**
 * 💰 Calculate LP Contributions
 */
function calculateLPContributions(month, forecastData) {
    const totalExpected = parseFloat(forecastData.expectedLPContributions || 0);
    const periodMonths = 12; // Assuming 12-month forecast
    
    // Front-load contributions in early months
    if (month <= 3) {
        return (totalExpected * 0.4) / 3; // 40% in first 3 months
    } else if (month <= 6) {
        return (totalExpected * 0.3) / 3; // 30% in months 4-6
    } else {
        return (totalExpected * 0.3) / 6; // 30% in remaining months
    }
}

/**
 * 📊 Calculate Distributions
 */
function calculateDistributions(month, forecastData) {
    const totalPlanned = parseFloat(forecastData.plannedDistributions || 0);
    
    // Quarterly distributions (months 3, 6, 9, 12)
    if (month % 3 === 0) {
        return totalPlanned / 4; // Quarterly distribution
    }
    return 0;
}

/**
 * 📈 Calculate Average Cash Flow
 */
function calculateAverageCashFlow(monthlyProjections) {
    if (!monthlyProjections || monthlyProjections.length === 0) return 0;
    
    const totalCashFlow = monthlyProjections.reduce((sum, projection) => 
        sum + projection.netCashFlow, 0);
    
    return Math.round(totalCashFlow / monthlyProjections.length);
}

/**
 * ⭐ Assess Liquidity Rating
 */
function assessLiquidityRating(liquidityAnalysis) {
    const currentRating = liquidityAnalysis.currentPosition.liquidityRating;
    const minCash = liquidityAnalysis.projectedPosition.minCashBalance;
    const riskFactors = liquidityAnalysis.riskIndicators;
    
    // Start with current rating
    let rating = currentRating;
    
    // Adjust for projected issues
    if (minCash < 0) rating = "Critical";
    else if (riskFactors.belowMinimumThreshold > 3) rating = "Low";
    else if (riskFactors.belowMinimumThreshold > 0) rating = "Medium";
    
    return rating;
}

/**
 * 🌊 Assess Current Liquidity
 */
function assessCurrentLiquidity(currentCash, fundSize, monthlyOpex) {
    const cashRatio = (currentCash / fundSize) * 100;
    const operatingMonths = currentCash / monthlyOpex;
    
    if (cashRatio < 5 || operatingMonths < 2) return "Critical";
    if (cashRatio < 10 || operatingMonths < 3) return "Low";
    if (cashRatio < 15 || operatingMonths < 6) return "Medium";
    if (cashRatio < 25 || operatingMonths < 12) return "Good";
    return "Excellent";
}

/**
 * 📊 Calculate Cash Volatility
 */
function calculateCashVolatility(monthlyProjections) {
    if (!monthlyProjections || monthlyProjections.length < 2) return 0;
    
    const cashFlows = monthlyProjections.map(p => p.netCashFlow);
    const avgCashFlow = cashFlows.reduce((sum, cf) => sum + cf, 0) / cashFlows.length;
    
    const variance = cashFlows.reduce((sum, cf) => 
        sum + Math.pow(cf - avgCashFlow, 2), 0) / cashFlows.length;
    
    const stdDev = Math.sqrt(variance);
    
    // Coefficient of variation
    return Math.abs(avgCashFlow) > 0 ? stdDev / Math.abs(avgCashFlow) : 0;
}

/**
 * 🔍 Identify Funding Gaps
 */
function identifyFundingGaps(monthlyProjections) {
    const gaps = [];
    
    monthlyProjections.forEach((projection, index) => {
        if (projection.endingCash < 0) {
            gaps.push({
                month: projection.month,
                shortfall: Math.abs(projection.endingCash),
                severity: projection.endingCash < -projection.totalOutflows ? "High" : "Medium"
            });
        }
    });
    
    return gaps;
}

/**
 * 🏦 Assess Liquidity Position
 */
function assessLiquidityPosition(liquidityData) {
    const availableCash = parseFloat(liquidityData.availableCash || 0);
    const totalLiquidAssets = parseFloat(liquidityData.totalLiquidAssets || 0);
    const pendingObligations = parseFloat(liquidityData.pendingDisbursements || 0) + 
                              parseFloat(liquidityData.scheduledDistributions || 0);
    
    return {
        immediatePosition: {
            availableCash: availableCash,
            liquidAssets: totalLiquidAssets,
            netLiquidity: totalLiquidAssets - pendingObligations,
            sufficiencyRatio: pendingObligations > 0 ? totalLiquidAssets / pendingObligations : 999
        },
        capacityAnalysis: {
            uncommittedCredit: parseFloat(liquidityData.uncommittedCredit || 0),
            availableForDraw: parseFloat(liquidityData.availableForDraw || 0),
            totalCapacity: totalLiquidAssets + parseFloat(liquidityData.uncommittedCredit || 0) + parseFloat(liquidityData.availableForDraw || 0)
        },
        utilizationMetrics: {
            cashUtilization: calculateCashUtilization(liquidityData),
            creditUtilization: calculateCreditUtilization(liquidityData),
            overallEfficiency: calculateLiquidityEfficiency(liquidityData)
        }
    };
}

/**
 * 💡 Identify Optimization Opportunities
 */
function identifyOptimizationOpportunities(liquidityData) {
    const opportunities = [];
    
    const availableCash = parseFloat(liquidityData.availableCash || 0);
    const moneyMarketInvestments = parseFloat(liquidityData.moneyMarketInvestments || 0);
    const totalLiquidAssets = parseFloat(liquidityData.totalLiquidAssets || 0);
    
    // Excess cash opportunity
    if (availableCash > totalLiquidAssets * 0.15) {
        opportunities.push({
            category: "Cash Deployment",
            opportunity: "Deploy excess cash in higher-yield instruments",
            potential: "Increase yield by 1-2% annually",
            impact: "Medium",
            timeline: "30 days"
        });
    }
    
    // Credit facility optimization
    if (parseFloat(liquidityData.uncommittedCredit || 0) === 0) {
        opportunities.push({
            category: "Credit Access",
            opportunity: "Establish committed credit facilities",
            potential: "Reduce liquidity risk and provide backup funding",
            impact: "High",
            timeline: "90 days"
        });
    }
    
    // Cash concentration
    if (availableCash / totalLiquidAssets > 0.8) {
        opportunities.push({
            category: "Diversification",
            opportunity: "Diversify liquid asset portfolio",
            potential: "Improve risk-adjusted returns",
            impact: "Medium",
            timeline: "60 days"
        });
    }
    
    return opportunities;
}

/**
 * 📋 Develop Operational Plan
 */
function developOperationalPlan(liquidityPosition, optimizationOpportunities) {
    const plan = {
        immediate: [], // 0-30 days
        shortTerm: [], // 30-90 days
        mediumTerm: [] // 90+ days
    };
    
    // Immediate actions based on liquidity position
    if (liquidityPosition.immediatePosition.sufficiencyRatio < 1.2) {
        plan.immediate.push({
            action: "Activate credit facilities or call LP capital",
            priority: "Critical",
            responsibility: "Treasury"
        });
    }
    
    // Short-term optimization
    optimizationOpportunities.forEach(opp => {
        const timelineDays = parseInt(opp.timeline) || 90;
        if (timelineDays <= 30) {
            plan.immediate.push({
                action: opp.opportunity,
                priority: opp.impact,
                responsibility: "Investment Committee"
            });
        } else if (timelineDays <= 90) {
            plan.shortTerm.push({
                action: opp.opportunity,
                priority: opp.impact,
                responsibility: "Treasury"
            });
        } else {
            plan.mediumTerm.push({
                action: opp.opportunity,
                priority: opp.impact,
                responsibility: "Management"
            });
        }
    });
    
    return plan;
}

/**
 * ⚠️ Assess Liquidity Risks
 */
function assessLiquidityRisks(liquidityData) {
    const risks = [];
    
    const cashRatio = parseFloat(liquidityData.availableCash || 0) / parseFloat(liquidityData.totalLiquidAssets || 1) * 100;
    
    if (cashRatio > 80) {
        risks.push({
            category: "Opportunity Cost",
            risk: "Excessive cash holdings reducing returns",
            impact: "Medium",
            mitigation: "Deploy excess cash in higher-yield instruments"
        });
    }
    
    if (parseFloat(liquidityData.uncommittedCredit || 0) === 0) {
        risks.push({
            category: "Funding Risk",
            risk: "No backup credit facilities",
            impact: "High",
            mitigation: "Establish committed credit lines"
        });
    }
    
    const operatingDays = parseFloat(liquidityData.operatingRunwayDays || 0);
    if (operatingDays < 90) {
        risks.push({
            category: "Operating Risk",
            risk: "Limited operating cash runway",
            impact: "High",
            mitigation: "Increase cash reserves or reduce expenses"
        });
    }
    
    return {
        identifiedRisks: risks,
        riskCount: risks.length,
        highImpactRisks: risks.filter(r => r.impact === "High").length,
        overallRiskLevel: risks.filter(r => r.impact === "High").length > 1 ? "High" : 
                         risks.length > 2 ? "Medium" : "Low"
    };
}

/**
 * 📊 Calculate Liquidity Ratio
 */
function calculateLiquidityRatio(liquidityData) {
    const totalLiquidAssets = parseFloat(liquidityData.totalLiquidAssets || 0);
    const nearTermObligations = parseFloat(liquidityData.pendingDisbursements || 0) + 
                               parseFloat(liquidityData.scheduledDistributions || 0);
    
    if (nearTermObligations === 0) return "N/A";
    return (totalLiquidAssets / nearTermObligations).toFixed(2) + "x";
}

/**
 * 📈 Generate Monitoring Metrics
 */
function generateMonitoringMetrics(liquidityData) {
    return {
        liquidityRatios: {
            currentRatio: calculateLiquidityRatio(liquidityData),
            cashRatio: ((parseFloat(liquidityData.availableCash || 0) / parseFloat(liquidityData.totalLiquidAssets || 1)) * 100).toFixed(1) + "%",
            quickRatio: calculateQuickRatio(liquidityData)
        },
        coverageMetrics: {
            operatingDaysCovered: parseFloat(liquidityData.operatingRunwayDays || 0),
            debtServiceCoverage: calculateDebtServiceCoverage(liquidityData),
            contingencyReserve: calculateContingencyReserve(liquidityData)
        },
        utilizationMetrics: {
            cashUtilization: calculateCashUtilization(liquidityData),
            creditUtilization: calculateCreditUtilization(liquidityData),
            capitalDeployment: calculateCapitalDeployment(liquidityData)
        }
    };
}

// Additional Helper Functions

function calculateQuickRatio(liquidityData) {
    const quickAssets = parseFloat(liquidityData.availableCash || 0) + 
                       parseFloat(liquidityData.moneyMarketInvestments || 0);
    const currentObligations = parseFloat(liquidityData.pendingDisbursements || 0);
    
    if (currentObligations === 0) return "N/A";
    return (quickAssets / currentObligations).toFixed(2) + "x";
}

function calculateDebtServiceCoverage(liquidityData) {
    const availableCash = parseFloat(liquidityData.availableCash || 0);
    const debtService = parseFloat(liquidityData.debtServiceDue || 0);
    
    if (debtService === 0) return "N/A";
    return (availableCash / debtService).toFixed(1) + "x";
}

function calculateContingencyReserve(liquidityData) {
    const totalAssets = parseFloat(liquidityData.totalLiquidAssets || 0);
    const monthlyOpex = totalAssets * 0.02; // Assume 2% monthly operating expense ratio
    
    return (totalAssets / monthlyOpex).toFixed(0) + " months";
}

function calculateCashUtilization(liquidityData) {
    const availableCash = parseFloat(liquidityData.availableCash || 0);
    const totalCapacity = parseFloat(liquidityData.totalLiquidAssets || 1);
    
    return ((availableCash / totalCapacity) * 100).toFixed(1) + "%";
}

function calculateCreditUtilization(liquidityData) {
    const creditFacilityCapacity = parseFloat(liquidityData.creditFacilityCapacity || 0);
    const uncommittedCredit = parseFloat(liquidityData.uncommittedCredit || 0);
    
    if (creditFacilityCapacity === 0) return "0%";
    const utilized = creditFacilityCapacity - uncommittedCredit;
    return ((utilized / creditFacilityCapacity) * 100).toFixed(1) + "%";
}

function calculateCapitalDeployment(liquidityData) {
    const drawnCapital = parseFloat(liquidityData.drawnCapital || 0);
    const committedCapital = parseFloat(liquidityData.committedLPCapital || 1);
    
    return ((drawnCapital / committedCapital) * 100).toFixed(1) + "%";
}

function calculateLiquidityEfficiency(liquidityData) {
    // Combined efficiency score based on multiple factors
    const cashUtil = parseFloat(calculateCashUtilization(liquidityData));
    const creditUtil = parseFloat(calculateCreditUtilization(liquidityData));
    const capitalDeploy = parseFloat(calculateCapitalDeployment(liquidityData));
    
    const efficiencyScore = (cashUtil * 0.3 + creditUtil * 0.3 + capitalDeploy * 0.4);
    return efficiencyScore.toFixed(1) + "%";
}

// Investment Optimization Helper Functions

function evaluateInvestmentOptions(investmentData) {
    const options = [];
    
    // Money Market Funds
    options.push({
        instrument: "Money Market Funds",
        yield: parseFloat(investmentData.moneyMarketRates || 4.5),
        liquidity: "Daily",
        risk: "Very Low",
        minInvestment: 10000,
        maxAllocation: 50
    });
    
    // Treasury Securities
    options.push({
        instrument: "US Treasury Securities",
        yield: parseFloat(investmentData.treasuryRates || 4.8),
        liquidity: "Daily (secondary market)",
        risk: "Very Low",
        minInvestment: 1000,
        maxAllocation: 60
    });
    
    // Corporate Bonds
    options.push({
        instrument: "Investment Grade Corporate Bonds",
        yield: parseFloat(investmentData.corporateBondYields || 5.5),
        liquidity: "Weekly",
        risk: "Low",
        minInvestment: 5000,
        maxAllocation: 30
    });
    
    // Bank CDs
    options.push({
        instrument: "Bank Certificates of Deposit",
        yield: 5.0, // Estimated
        liquidity: "At Maturity",
        risk: "Very Low",
        minInvestment: 25000,
        maxAllocation: 25
    });
    
    return options.sort((a, b) => b.yield - a.yield);
}

function calculateOptimalAllocation(investmentData, investmentOptions) {
    const excessCash = parseFloat(investmentData.excessCash || 0);
    const riskTolerance = investmentData.riskTolerance || "Conservative";
    const liquidityRequirements = investmentData.liquidityRequirements || "High";
    
    let allocation = {};
    let expectedYield = 0;
    let riskLevel = "Low";
    
    if (riskTolerance === "Conservative" && liquidityRequirements === "High") {
        // Conservative allocation favoring liquidity
        allocation = {
            "Money Market Funds": 40,
            "US Treasury Securities": 35,
            "Bank Certificates of Deposit": 15,
            "Investment Grade Corporate Bonds": 10
        };
        expectedYield = 4.7;
        riskLevel = "Very Low";
        
    } else if (riskTolerance === "Moderate") {
        // Balanced allocation
        allocation = {
            "Money Market Funds": 25,
            "US Treasury Securities": 30,
            "Investment Grade Corporate Bonds": 25,
            "Bank Certificates of Deposit": 20
        };
        expectedYield = 5.1;
        riskLevel = "Low";
        
    } else {
        // Aggressive allocation for higher yield
        allocation = {
            "Investment Grade Corporate Bonds": 40,
            "US Treasury Securities": 30,
            "Money Market Funds": 20,
            "Bank Certificates of Deposit": 10
        };
        expectedYield = 5.4;
        riskLevel = "Low-Medium";
    }
    
    // Convert percentages to dollar amounts
    const dollarAllocation = {};
    Object.keys(allocation).forEach(instrument => {
        dollarAllocation[instrument] = Math.round(excessCash * allocation[instrument] / 100);
    });
    
    return {
        percentageAllocation: allocation,
        dollarAllocation: dollarAllocation,
        expectedYield: expectedYield + "%",
        riskLevel: riskLevel,
        totalInvested: excessCash,
        expectedAnnualIncome: Math.round(excessCash * expectedYield / 100)
    };
}

function createImplementationPlan(optimalAllocation) {
    const plan = {
        phase1: {
            duration: "Week 1-2",
            actions: [
                "Execute money market fund investments",
                "Purchase Treasury securities in ladder structure",
                "Set up automated sweep accounts"
            ],
            allocation: 60 // Percentage of total to deploy in phase 1
        },
        phase2: {
            duration: "Week 3-4", 
            actions: [
                "Negotiate and execute CD placements",
                "Purchase corporate bonds after credit analysis",
                "Finalize custodial arrangements"
            ],
            allocation: 40 // Remaining percentage
        },
        ongoingManagement: {
            frequency: "Monthly",
            activities: [
                "Monitor performance vs benchmarks",
                "Rebalance allocations as needed",
                "Assess reinvestment opportunities",
                "Report to investment committee"
            ]
        }
    };
    
    return plan;
}

function setPerformanceTargets(investmentData, optimalAllocation) {
    const benchmarkYield = parseFloat(investmentData.treasuryRates || 4.8);
    
    return {
        primaryTargets: {
            yieldTarget: parseFloat(optimalAllocation.expectedYield),
            yieldVsBenchmark: (parseFloat(optimalAllocation.expectedYield) - benchmarkYield).toFixed(1) + "% above Treasury",
            maxDrawdown: "2%",
            liquidityAccess: "95% within 7 days"
        },
        riskLimits: {
            concentrationLimit: "No more than 25% in single issuer",
            creditQuality: "Minimum A- rating",
            durationLimit: "Maximum 2 years average",
            currencyExposure: "USD only"
        },
        reportingMetrics: [
            "Monthly yield and total return",
            "Liquidity position and access",
            "Risk metrics and compliance",
            "Market value vs cost basis"
        ]
    };
}

function defineRiskParameters(investmentData) {
    return {
        creditRisk: {
            minimumRating: "A-",
            maximumExposure: "30% below AA rating",
            diversificationRequired: "Minimum 5 issuers"
        },
        liquidityRisk: {
            dailyLiquid: "Minimum 40%",
            weeklyLiquid: "Minimum 70%",
            emergencyAccess: "100% within 30 days"
        },
        marketRisk: {
            maxDuration: "2.0 years",
            interestRateSensitivity: "Maximum 5% for 1% rate change",
            volatilityLimit: "Maximum 3% monthly standard deviation"
        },
        concentrationRisk: {
            singleIssuer: "Maximum 10%",
            sectorConcentration: "Maximum 25%",
            maturityConcentration: "Maximum 30% in single year"
        }
    };
}

// Alert Monitoring Helper Functions

function assessCurrentAlerts(monitoringData) {
    const alerts = [];
    const cashRatio = parseFloat(monitoringData.cashRatio || 20);
    const daysCash = parseFloat(monitoringData.daysCashOnHand || 90);
    const liquidityCoverage = parseFloat(monitoringData.liquidityCoverageRatio || 1.5);
    
    // Check thresholds
    if (cashRatio < parseFloat(monitoringData.criticalCashRatio || 5)) {
        alerts.push({
            level: "Critical",
            metric: "Cash Ratio",
            current: cashRatio + "%",
            threshold: monitoringData.criticalCashRatio + "%",
            action: "Immediate funding required"
        });
    } else if (cashRatio < parseFloat(monitoringData.minCashRatio || 10)) {
        alerts.push({
            level: "Warning",
            metric: "Cash Ratio", 
            current: cashRatio + "%",
            threshold: monitoringData.minCashRatio + "%",
            action: "Prepare funding sources"
        });
    }
    
    if (daysCash < parseFloat(monitoringData.minDaysCoverage || 30)) {
        alerts.push({
            level: daysCash < 15 ? "Critical" : "Warning",
            metric: "Days Cash Coverage",
            current: daysCash + " days",
            threshold: monitoringData.minDaysCoverage + " days",
            action: daysCash < 15 ? "Emergency funding needed" : "Increase cash reserves"
        });
    }
    
    if (liquidityCoverage < 1.0) {
        alerts.push({
            level: "Critical",
            metric: "Liquidity Coverage Ratio",
            current: liquidityCoverage.toFixed(2) + "x",
            threshold: "1.0x",
            action: "Insufficient liquidity coverage"
        });
    }
    
    return {
        alertLevel: alerts.some(a => a.level === "Critical") ? "Critical" : 
                   alerts.some(a => a.level === "Warning") ? "Warning" : "Normal",
        activeAlerts: alerts,
        alertCount: alerts.length,
        criticalAlerts: alerts.filter(a => a.level === "Critical").length
    };
}

function analyzeLiquidityTrends(monitoringData) {
    // Simplified trend analysis - in practice would use historical data
    const currentCash = parseFloat(monitoringData.currentCashBalance || 0);
    const sevenDayProjection = parseFloat(monitoringData.sevenDayProjection || 0);
    const thirtyDayProjection = parseFloat(monitoringData.thirtyDayProjection || 0);
    
    let shortTermTrend = "Stable";
    let mediumTermTrend = "Stable";
    let overallTrend = "Stable";
    
    // Analyze short-term trend
    if (sevenDayProjection < currentCash * 0.9) {
        shortTermTrend = "Declining";
    } else if (sevenDayProjection > currentCash * 1.1) {
        shortTermTrend = "Improving";
    }
    
    // Analyze medium-term trend
    if (thirtyDayProjection < currentCash * 0.8) {
        mediumTermTrend = "Declining";
    } else if (thirtyDayProjection > currentCash * 1.2) {
        mediumTermTrend = "Improving";
    }
    
    // Overall trend assessment
    if (shortTermTrend === "Declining" || mediumTermTrend === "Declining") {
        overallTrend = "Declining";
    } else if (shortTermTrend === "Improving" && mediumTermTrend === "Improving") {
        overallTrend = "Improving";
    }
    
    return {
        shortTermTrend: shortTermTrend,
        mediumTermTrend: mediumTermTrend,
        overallTrend: overallTrend,
        trendStrength: assessTrendStrength(currentCash, sevenDayProjection, thirtyDayProjection)
    };
}

function generateAlertActionPlan(alertStatus, trendAnalysis) {
    const actionPlan = {
        immediateActions: [],
        shortTermActions: [],
        preventiveActions: []
    };
    
    // Immediate actions for critical alerts
    alertStatus.activeAlerts.forEach(alert => {
        if (alert.level === "Critical") {
            actionPlan.immediateActions.push({
                action: alert.action,
                metric: alert.metric,
                deadline: "24 hours",
                responsibility: "CFO/Treasury"
            });
        }
    });
    
    // Short-term actions for warnings
    alertStatus.activeAlerts.forEach(alert => {
        if (alert.level === "Warning") {
            actionPlan.shortTermActions.push({
                action: alert.action,
                metric: alert.metric,
                deadline: "7 days",
                responsibility: "Treasury Manager"
            });
        }
    });
    
    // Preventive actions based on trends
    if (trendAnalysis.overallTrend === "Declining") {
        actionPlan.preventiveActions.push({
            action: "Implement cash flow acceleration measures",
            rationale: "Declining liquidity trend detected",
            deadline: "30 days",
            responsibility: "Management Team"
        });
    }
    
    return actionPlan;
}

function recommendSystemOptimization(monitoringData) {
    const recommendations = [];
    
    // Alert threshold optimization
    const alertCount = Object.keys(monitoringData.recentBreaches || {}).length;
    if (alertCount > 5) {
        recommendations.push({
            area: "Alert Calibration",
            recommendation: "Adjust alert thresholds to reduce false positives",
            impact: "Improved alert effectiveness",
            effort: "Low"
        });
    }
    
    // Forecasting accuracy
    recommendations.push({
        area: "Forecasting", 
        recommendation: "Implement machine learning for cash flow predictions",
        impact: "Better early warning capabilities",
        effort: "High"
    });
    
    // Automation opportunities
    recommendations.push({
        area: "Automation",
        recommendation: "Automate routine liquidity management tasks",
        impact: "Reduced operational risk and faster response",
        effort: "Medium"
    });
    
    return recommendations;
}

function generateDetailedMonitoringMetrics(monitoringData) {
    return {
        realTimeMetrics: {
            currentCashBalance: parseFloat(monitoringData.currentCashBalance || 0),
            cashRatio: parseFloat(monitoringData.cashRatio || 0),
            liquidityCoverageRatio: parseFloat(monitoringData.liquidityCoverageRatio || 0),
            daysCashOnHand: parseFloat(monitoringData.daysCashOnHand || 0)
        },
        forwardLookingMetrics: {
            sevenDayProjection: parseFloat(monitoringData.sevenDayProjection || 0),
            thirtyDayProjection: parseFloat(monitoringData.thirtyDayProjection || 0),
            upcomingOutflows: parseFloat(monitoringData.upcomingOutflows || 0)
        },
        complianceMetrics: {
            thresholdCompliance: assessThresholdCompliance(monitoringData),
            covenantStatus: monitoringData.covenantViolations || "Compliant",
            regulatoryReporting: "Current"
        }
    };
}

function assessTrendStrength(currentCash, sevenDay, thirtyDay) {
    const shortTermChange = Math.abs(sevenDay - currentCash) / currentCash;
    const mediumTermChange = Math.abs(thirtyDay - currentCash) / currentCash;
    
    const avgChange = (shortTermChange + mediumTermChange) / 2;
    
    if (avgChange > 0.2) return "Strong";
    if (avgChange > 0.1) return "Moderate";
    return "Weak";
}

function assessThresholdCompliance(monitoringData) {
    const cashRatio = parseFloat(monitoringData.cashRatio || 20);
    const minCashRatio = parseFloat(monitoringData.minCashRatio || 10);
    const daysCash = parseFloat(monitoringData.daysCashOnHand || 90);
    const minDays = parseFloat(monitoringData.minDaysCoverage || 30);
    
    let compliantMetrics = 0;
    let totalMetrics = 2;
    
    if (cashRatio >= minCashRatio) compliantMetrics++;
    if (daysCash >= minDays) compliantMetrics++;
    
    const complianceRate = (compliantMetrics / totalMetrics) * 100;
    
    if (complianceRate === 100) return "Full Compliance";
    if (complianceRate >= 50) return "Partial Compliance";
    return "Non-Compliance";
}

// 📊 EXPORT FUNCTIONS
module.exports = {
    // Cash flow forecasting
    forecastCashFlow,
    generateMonthlyProjections,
    performScenarioAnalysis,
    analyzeLiquidityPosition,
    generateCashFlowRecommendations,
    identifyCashFlowRisks,
    
    // Liquidity operations management
    manageLiquidityOperations,
    assessLiquidityPosition,
    identifyOptimizationOpportunities,
    developOperationalPlan,
    assessLiquidityRisks,
    calculateLiquidityRatio,
    generateMonitoringMetrics,
    
    // Cash investment optimization
    optimizeCashInvestment,
    evaluateInvestmentOptions,
    calculateOptimalAllocation,
    createImplementationPlan,
    setPerformanceTargets,
    defineRiskParameters,
    
    // Liquidity monitoring and alerts
    monitorLiquidityAlerts,
    assessCurrentAlerts,
    analyzeLiquidityTrends,
    generateAlertActionPlan,
    recommendSystemOptimization,
    generateDetailedMonitoringMetrics,
    
    // Utility functions
    getSeasonalityFactor,
    calculateLPContributions,
    calculateDistributions,
    calculateAverageCashFlow,
    assessLiquidityRating,
    assessCurrentLiquidity,
    calculateCashVolatility,
    identifyFundingGaps,
    
    // Helper calculation functions
    calculateQuickRatio,
    calculateDebtServiceCoverage,
    calculateContingencyReserve,
    calculateCashUtilization,
    calculateCreditUtilization,
    calculateCapitalDeployment,
    calculateLiquidityEfficiency,
    
    // Alert and trend analysis functions
    assessTrendStrength,
    assessThresholdCompliance,
    
    // Framework constants
    CASH_FLOW_FRAMEWORK
};

// 🏁 END OF CAMBODIA CASH FLOW MANAGEMENT SYSTEM
