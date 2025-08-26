// cambodia/riskManagement.js - COMPLETE: Cambodia Risk Management & Portfolio Analytics System
// Enterprise-grade risk modeling with GPT-5 intelligence for private lending fund

// 🚨 CAMBODIA RISK MANAGEMENT FRAMEWORK
const RISK_MANAGEMENT_FRAMEWORK = {
    // Risk categories and classifications
    riskCategories: {
        credit_risk: {
            name: "Credit Risk",
            description: "Risk of borrower default and principal loss",
            metrics: ["PD", "LGD", "EAD", "Expected Loss"],
            monitoring: "continuous",
            tolerance: "medium"
        },
        concentration_risk: {
            name: "Concentration Risk", 
            description: "Risk from portfolio concentration by geography, industry, or borrower",
            metrics: ["HHI", "Top 10 Exposure", "Industry Concentration"],
            monitoring: "monthly",
            tolerance: "low"
        },
        liquidity_risk: {
            name: "Liquidity Risk",
            description: "Risk of inability to meet cash flow obligations",
            metrics: ["Cash Ratio", "Liquidity Coverage", "Maturity Mismatch"],
            monitoring: "daily",
            tolerance: "low"
        },
        market_risk: {
            name: "Market Risk",
            description: "Risk from changes in interest rates, FX, and market conditions",
            metrics: ["Duration", "FX Exposure", "Interest Rate Sensitivity"],
            monitoring: "daily",
            tolerance: "medium"
        },
        operational_risk: {
            name: "Operational Risk",
            description: "Risk from internal processes, people, and systems failures",
            metrics: ["Error Rate", "System Downtime", "Process Failures"],
            monitoring: "ongoing",
            tolerance: "low"
        },
        legal_regulatory_risk: {
            name: "Legal & Regulatory Risk",
            description: "Risk from legal proceedings and regulatory changes",
            metrics: ["Compliance Score", "Legal Cases", "Regulatory Changes"],
            monitoring: "ongoing",
            tolerance: "very_low"
        },
        country_risk: {
            name: "Country Risk",
            description: "Risk from Cambodia political, economic, and sovereign factors",
            metrics: ["Sovereign Rating", "Political Stability", "Economic Indicators"],
            monitoring: "monthly",
            tolerance: "medium"
        }
    },

    // Risk tolerance levels and thresholds
    riskTolerances: {
        portfolio_level: {
            max_default_rate: 5.0, // 5% annual default rate
            max_concentration_single_borrower: 10.0, // 10% of portfolio
            max_concentration_industry: 25.0, // 25% in single industry
            max_concentration_geography: 40.0, // 40% in single region
            min_liquidity_ratio: 15.0, // 15% liquid assets
            max_leverage_ratio: 4.0 // 4:1 debt to equity
        },
        loan_level: {
            max_loan_to_value: 80.0, // 80% LTV for secured loans
            min_debt_service_coverage: 1.25, // 1.25x DSCR
            max_debt_to_income: 40.0, // 40% DTI for individuals
            min_current_ratio: 1.2, // 1.2x for business loans
            max_single_loan_exposure: 15.0 // 15% of fund capital
        }
    },

    // Risk measurement methodologies
    methodologies: {
        probability_of_default: {
            method: "scorecard_plus_macroeconomic",
            inputs: ["credit_score", "financial_ratios", "payment_history", "economic_factors"],
            frequency: "monthly",
            validation: "annual"
        },
        loss_given_default: {
            method: "collateral_based_recovery",
            inputs: ["collateral_value", "collateral_type", "recovery_costs", "market_conditions"],
            frequency: "quarterly",
            validation: "annual"
        },
        exposure_at_default: {
            method: "commitment_utilization",
            inputs: ["current_exposure", "undrawn_commitments", "utilization_rate"],
            frequency: "daily",
            validation: "quarterly"
        },
        stress_testing: {
            method: "scenario_analysis",
            scenarios: ["base", "adverse", "severely_adverse"],
            frequency: "quarterly",
            validation: "annual"
        }
    },

    // Early warning indicators
    earlyWarningSystem: {
        borrower_level: [
            "Payment delays > 15 days",
            "Covenant violations",
            "Declining financial performance",
            "Management changes",
            "Industry distress signals",
            "Collateral deterioration",
            "Guarantor financial stress"
        ],
        portfolio_level: [
            "Rising delinquency rates",
            "Increasing provision requirements",
            "Concentration limit breaches",
            "Liquidity ratio deterioration",
            "Economic indicator warnings",
            "Peer performance deterioration",
            "Regulatory environment changes"
        ],
        macro_level: [
            "GDP growth decline",
            "Currency depreciation",
            "Interest rate changes",
            "Political instability",
            "Natural disasters",
            "Trade disruptions",
            "Banking sector stress"
        ]
    },

    // Risk mitigation strategies
    mitigationStrategies: {
        credit_risk: [
            "Enhanced due diligence",
            "Collateral requirements",
            "Guarantor arrangements",
            "Covenant monitoring",
            "Early intervention programs",
            "Workout arrangements",
            "Portfolio diversification"
        ],
        concentration_risk: [
            "Exposure limits by borrower",
            "Industry diversification targets",
            "Geographic diversification",
            "Correlation monitoring",
            "Regular rebalancing",
            "New market expansion",
            "Risk-based pricing"
        ],
        liquidity_risk: [
            "Cash flow forecasting",
            "Committed credit facilities",
            "Asset liability matching",
            "Liquidity buffers",
            "Stress testing",
            "Contingency funding plans",
            "Regular LP communication"
        ]
    }
};

// 🎯 RISK ASSESSMENT FUNCTIONS

/**
 * 🚨 Comprehensive Portfolio Risk Assessment
 */
async function assessPortfolioRisk(portfolioData, marketData = {}, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - COMPREHENSIVE PORTFOLIO RISK ASSESSMENT

PORTFOLIO OVERVIEW:
• Total Portfolio Value: $${portfolioData.totalValue ? portfolioData.totalValue.toLocaleString() : 'Not provided'} USD
• Number of Active Loans: ${portfolioData.activeLoans || 'Not specified'}
• Average Loan Size: $${portfolioData.averageLoanSize ? portfolioData.averageLoanSize.toLocaleString() : 'Not calculated'} USD
• Portfolio Maturity: ${portfolioData.weightedAverageMaturity || 'Not specified'} months
• Current Yield: ${portfolioData.currentYield || 'Not specified'}%

RISK METRICS OVERVIEW:
• Current Default Rate: ${portfolioData.defaultRate || 'Not calculated'}%
• 30+ Days Past Due: ${portfolioData.pastDue30Plus || 'Not calculated'}%
• Provision Coverage Ratio: ${portfolioData.provisionCoverage || 'Not calculated'}%
• Liquidity Ratio: ${portfolioData.liquidityRatio || 'Not calculated'}%

CONCENTRATION ANALYSIS:
• Largest Single Exposure: ${portfolioData.largestExposure || 'Not calculated'}%
• Top 10 Borrowers: ${portfolioData.top10Concentration || 'Not calculated'}%
• Industry Concentration (Top Sector): ${portfolioData.topIndustryConcentration || 'Not calculated'}%
• Geographic Concentration: ${portfolioData.geographicConcentration || 'Not calculated'}%

MARKET ENVIRONMENT:
• Cambodia GDP Growth: ${marketData.gdpGrowth || 'Not available'}%
• USD/KHR Exchange Rate: ${marketData.exchangeRate || 'Not available'}
• Bank of Cambodia Policy Rate: ${marketData.policyRate || 'Not available'}%
• Inflation Rate: ${marketData.inflationRate || 'Not available'}%

COMPREHENSIVE RISK ANALYSIS:

1. **CREDIT RISK ASSESSMENT**
   - Portfolio quality trends and migration analysis
   - Expected loss calculations and stress scenarios
   - Borrower risk rating distribution and changes
   - Early warning indicator activation and trends

2. **CONCENTRATION RISK EVALUATION**
   - Single name concentration and correlation analysis
   - Industry sector concentration and cyclical risks
   - Geographic concentration and regional economic risks
   - Maturity concentration and refinancing risks

3. **LIQUIDITY RISK ANALYSIS**
   - Cash flow forecasting and liquidity gap analysis
   - Asset-liability maturity matching assessment
   - Stress liquidity scenarios and contingency planning
   - Funding source diversification and stability

4. **MARKET RISK ASSESSMENT**
   - Interest rate sensitivity and duration analysis
   - Foreign exchange exposure and hedging assessment
   - Economic cycle correlation and sensitivity analysis
   - Collateral value volatility and market risk

5. **OPERATIONAL RISK EVALUATION**
   - Process risk assessment and control effectiveness
   - System and technology risk evaluation
   - Human capital and key person risk analysis
   - Legal and compliance risk assessment

6. **COUNTRY AND SOVEREIGN RISK**
   - Cambodia political and economic stability assessment
   - Regulatory environment and policy risk evaluation
   - Currency convertibility and transfer risk analysis
   - Natural disaster and force majeure risk assessment

7. **INTEGRATED RISK SCORING**
   - Overall portfolio risk score and rating
   - Risk-adjusted return analysis and optimization
   - Capital adequacy and stress test results
   - Risk tolerance breach identification

CAMBODIA-SPECIFIC RISK FACTORS:
• Dollarization impact and currency risk
• Microfinance sector competition and regulation
• Agricultural seasonality and rural lending risks
• Tourism and hospitality sector concentration
• Infrastructure development impact on lending
• ASEAN integration and trade impacts

RISK MITIGATION RECOMMENDATIONS:
• Immediate risk reduction actions required
• Portfolio optimization and rebalancing strategies
• Risk monitoring and early warning enhancements
• Capital and liquidity buffer adjustments

Provide comprehensive portfolio risk assessment with actionable risk management recommendations.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🚨 Portfolio Risk Assessment",
            forceModel: "gpt-5" // Full model for comprehensive risk analysis
        });

        // Calculate detailed risk metrics
        const riskMetrics = calculateRiskMetrics(portfolioData);
        const concentrationAnalysis = analyzeConcentrationRisk(portfolioData);
        const stressTestResults = performStressTest(portfolioData, marketData);
        const riskScore = calculateOverallRiskScore(riskMetrics, concentrationAnalysis);

        return {
            analysis: result.response,
            portfolioSummary: {
                totalValue: portfolioData.totalValue,
                activeLoans: portfolioData.activeLoans,
                defaultRate: portfolioData.defaultRate,
                overallRiskScore: riskScore.overall
            },
            riskMetrics: riskMetrics,
            concentrationAnalysis: concentrationAnalysis,
            stressTestResults: stressTestResults,
            riskRecommendations: generateRiskRecommendations(riskScore, concentrationAnalysis),
            earlyWarnings: identifyEarlyWarnings(portfolioData, riskMetrics),
            assessmentDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Portfolio risk assessment error:', error.message);
        return {
            analysis: `Portfolio risk assessment unavailable: ${error.message}`,
            portfolioSummary: portfolioData,
            riskMetrics: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Calculate Comprehensive Risk Metrics
 */
function calculateRiskMetrics(portfolioData) {
    const metrics = {};
    
    // Credit Risk Metrics
    metrics.creditRisk = {
        defaultRate: parseFloat(portfolioData.defaultRate || 0),
        delinquencyRate: parseFloat(portfolioData.pastDue30Plus || 0),
        provisionCoverage: parseFloat(portfolioData.provisionCoverage || 0),
        expectedLoss: calculateExpectedLoss(portfolioData),
        creditRiskScore: assessCreditRiskLevel(portfolioData)
    };
    
    // Liquidity Risk Metrics
    metrics.liquidityRisk = {
        liquidityRatio: parseFloat(portfolioData.liquidityRatio || 0),
        cashRatio: calculateCashRatio(portfolioData),
        maturityMismatch: calculateMaturityMismatch(portfolioData),
        liquidityRiskScore: assessLiquidityRiskLevel(portfolioData)
    };
    
    // Market Risk Metrics
    metrics.marketRisk = {
        interestRateSensitivity: calculateInterestRateSensitivity(portfolioData),
        fxExposure: calculateFXExposure(portfolioData),
        durationRisk: calculateDurationRisk(portfolioData),
        marketRiskScore: assessMarketRiskLevel(portfolioData)
    };
    
    // Operational Risk Metrics
    metrics.operationalRisk = {
        processRiskScore: 3, // Placeholder - would integrate with operational metrics
        systemRiskScore: 2,
        complianceRiskScore: assessComplianceRisk(portfolioData),
        operationalRiskScore: 2.5
    };
    
    return metrics;
}

/**
 * 🎯 Analyze Concentration Risk
 */
function analyzeConcentrationRisk(portfolioData) {
    const analysis = {};
    
    // Single Name Concentration
    const largestExposure = parseFloat(portfolioData.largestExposure || 0);
    const top10Concentration = parseFloat(portfolioData.top10Concentration || 0);
    
    analysis.singleNameRisk = {
        largestExposure: largestExposure,
        top10Concentration: top10Concentration,
        riskLevel: largestExposure > 15 ? "High" : largestExposure > 10 ? "Medium" : "Low",
        exceedsLimit: largestExposure > RISK_MANAGEMENT_FRAMEWORK.riskTolerances.portfolio_level.max_concentration_single_borrower
    };
    
    // Industry Concentration
    const topIndustryConcentration = parseFloat(portfolioData.topIndustryConcentration || 0);
    analysis.industryRisk = {
        topIndustryConcentration: topIndustryConcentration,
        riskLevel: topIndustryConcentration > 30 ? "High" : topIndustryConcentration > 20 ? "Medium" : "Low",
        exceedsLimit: topIndustryConcentration > RISK_MANAGEMENT_FRAMEWORK.riskTolerances.portfolio_level.max_concentration_industry
    };
    
    // Geographic Concentration
    const geoConcentration = parseFloat(portfolioData.geographicConcentration || 0);
    analysis.geographicRisk = {
        concentration: geoConcentration,
        riskLevel: geoConcentration > 50 ? "High" : geoConcentration > 35 ? "Medium" : "Low",
        exceedsLimit: geoConcentration > RISK_MANAGEMENT_FRAMEWORK.riskTolerances.portfolio_level.max_concentration_geography
    };
    
    // Overall Concentration Score
    let concentrationScore = 0;
    if (analysis.singleNameRisk.riskLevel === "High") concentrationScore += 3;
    else if (analysis.singleNameRisk.riskLevel === "Medium") concentrationScore += 2;
    else concentrationScore += 1;
    
    if (analysis.industryRisk.riskLevel === "High") concentrationScore += 3;
    else if (analysis.industryRisk.riskLevel === "Medium") concentrationScore += 2;
    else concentrationScore += 1;
    
    if (analysis.geographicRisk.riskLevel === "High") concentrationScore += 3;
    else if (analysis.geographicRisk.riskLevel === "Medium") concentrationScore += 2;
    else concentrationScore += 1;
    
    analysis.overallConcentrationScore = concentrationScore;
    analysis.overallConcentrationLevel = concentrationScore >= 7 ? "High" : concentrationScore >= 5 ? "Medium" : "Low";
    
    return analysis;
}

/**
 * 🧪 Perform Portfolio Stress Test
 */
function performStressTest(portfolioData, marketData) {
    const scenarios = {};
    const baseDefaultRate = parseFloat(portfolioData.defaultRate || 2);
    const portfolioValue = portfolioData.totalValue || 100000000; // Default $100M
    
    // Base Case Scenario
    scenarios.baseCase = {
        name: "Base Case",
        probability: "Most Likely",
        assumptions: {
            defaultRateIncrease: 0,
            collateralValueDecline: 0,
            interestRateChange: 0,
            fxChange: 0
        },
        results: {
            projectedDefaultRate: baseDefaultRate.toFixed(1) + "%",
            expectedLoss: (portfolioValue * baseDefaultRate / 100).toFixed(0),
            portfolioValue: portfolioValue.toFixed(0),
            capitalImpact: 0
        }
    };
    
    // Adverse Scenario
    scenarios.adverseCase = {
        name: "Adverse Scenario",
        probability: "10-15%",
        assumptions: {
            defaultRateIncrease: 100, // Double default rate
            collateralValueDecline: 15, // 15% collateral decline
            interestRateChange: 200, // +2% interest rates
            fxChange: -10 // 10% KHR depreciation
        },
        results: {
            projectedDefaultRate: (baseDefaultRate * 2).toFixed(1) + "%",
            expectedLoss: (portfolioValue * baseDefaultRate * 2 / 100).toFixed(0),
            portfolioValue: (portfolioValue * 0.95).toFixed(0),
            capitalImpact: (portfolioValue * 0.05).toFixed(0)
        }
    };
    
    // Severely Adverse Scenario
    scenarios.severelyAdverse = {
        name: "Severely Adverse",
        probability: "2-5%",
        assumptions: {
            defaultRateIncrease: 200, // Triple default rate
            collateralValueDecline: 30, // 30% collateral decline
            interestRateChange: 400, // +4% interest rates
            fxChange: -20 // 20% KHR depreciation
        },
        results: {
            projectedDefaultRate: (baseDefaultRate * 3).toFixed(1) + "%",
            expectedLoss: (portfolioValue * baseDefaultRate * 3 / 100).toFixed(0),
            portfolioValue: (portfolioValue * 0.85).toFixed(0),
            capitalImpact: (portfolioValue * 0.15).toFixed(0)
        }
    };
    
    // Stress Test Summary
    const stressSummary = {
        passesStressTest: true,
        capitalAdequacy: "Adequate",
        recommendedActions: [],
        worstCaseCapitalImpact: parseFloat(scenarios.severelyAdverse.results.capitalImpact)
    };
    
    // Check if stress tests pass
    const severeCapitalImpact = parseFloat(scenarios.severelyAdverse.results.capitalImpact);
    const assumedCapital = portfolioValue * 0.20; // Assume 20% capital ratio
    
    if (severeCapitalImpact > assumedCapital * 0.5) {
        stressSummary.passesStressTest = false;
        stressSummary.capitalAdequacy = "Insufficient";
        stressSummary.recommendedActions.push("Increase capital buffer");
        stressSummary.recommendedActions.push("Reduce portfolio concentration");
        stressSummary.recommendedActions.push("Enhance risk monitoring");
    }
    
    return {
        scenarios: scenarios,
        summary: stressSummary,
        testDate: new Date().toISOString(),
        nextTestDue: getNextStressTestDate()
    };
}

/**
 * 🎯 Calculate Overall Risk Score
 */
function calculateOverallRiskScore(riskMetrics, concentrationAnalysis) {
    let totalScore = 0;
    let maxScore = 0;
    const weights = {
        credit: 0.35,
        concentration: 0.25,
        liquidity: 0.20,
        market: 0.15,
        operational: 0.05
    };
    
    // Credit Risk Score (1-5 scale)
    const creditScore = riskMetrics.creditRisk.creditRiskScore;
    totalScore += creditScore * weights.credit;
    maxScore += 5 * weights.credit;
    
    // Concentration Risk Score (1-5 scale)
    const concentrationScore = Math.min(5, concentrationAnalysis.overallConcentrationScore / 2);
    totalScore += concentrationScore * weights.concentration;
    maxScore += 5 * weights.concentration;
    
    // Liquidity Risk Score (1-5 scale)
    const liquidityScore = riskMetrics.liquidityRisk.liquidityRiskScore;
    totalScore += liquidityScore * weights.liquidity;
    maxScore += 5 * weights.liquidity;
    
    // Market Risk Score (1-5 scale)
    const marketScore = riskMetrics.marketRisk.marketRiskScore;
    totalScore += marketScore * weights.market;
    maxScore += 5 * weights.market;
    
    // Operational Risk Score (1-5 scale)
    const operationalScore = riskMetrics.operationalRisk.operationalRiskScore;
    totalScore += operationalScore * weights.operational;
    maxScore += 5 * weights.operational;
    
    const overallScore = (totalScore / maxScore) * 100;
    
    return {
        overall: overallScore.toFixed(1),
        overallLevel: overallScore >= 70 ? "High" : overallScore >= 40 ? "Medium" : "Low",
        components: {
            credit: creditScore,
            concentration: concentrationScore.toFixed(1),
            liquidity: liquidityScore,
            market: marketScore,
            operational: operationalScore
        },
        weights: weights
    };
}

/**
 * ⚠️ Identify Early Warning Indicators
 */
function identifyEarlyWarnings(portfolioData, riskMetrics) {
    const warnings = [];
    const alerts = [];
    
    // Credit Risk Warnings
    if (riskMetrics.creditRisk.defaultRate > 3) {
        warnings.push({
            category: "Credit Risk",
            indicator: "Rising Default Rate",
            current: riskMetrics.creditRisk.defaultRate + "%",
            threshold: "3%",
            severity: "High"
        });
    }
    
    if (riskMetrics.creditRisk.delinquencyRate > 8) {
        warnings.push({
            category: "Credit Risk", 
            indicator: "High Delinquency Rate",
            current: riskMetrics.creditRisk.delinquencyRate + "%",
            threshold: "8%",
            severity: "Medium"
        });
    }
    
    // Concentration Warnings
    const largestExposure = parseFloat(portfolioData.largestExposure || 0);
    if (largestExposure > 15) {
        warnings.push({
            category: "Concentration Risk",
            indicator: "Single Borrower Concentration",
            current: largestExposure + "%",
            threshold: "15%",
            severity: "High"
        });
    }
    
    // Liquidity Warnings
    if (riskMetrics.liquidityRisk.liquidityRatio < 15) {
        warnings.push({
            category: "Liquidity Risk",
            indicator: "Low Liquidity Ratio", 
            current: riskMetrics.liquidityRisk.liquidityRatio + "%",
            threshold: "15%",
            severity: "High"
        });
    }
    
    // Generate Alerts for immediate attention
    warnings.forEach(warning => {
        if (warning.severity === "High") {
            alerts.push({
                alert: `URGENT: ${warning.indicator}`,
                action: `Immediate review required - ${warning.category}`,
                deadline: "24 hours"
            });
        }
    });
    
    return {
        warnings: warnings,
        alerts: alerts,
        warningCount: warnings.length,
        criticalCount: warnings.filter(w => w.severity === "High").length
    };
}

// 🧮 RISK CALCULATION HELPER FUNCTIONS

/**
 * 💰 Calculate Expected Loss
 */
function calculateExpectedLoss(portfolioData) {
    const defaultRate = parseFloat(portfolioData.defaultRate || 2) / 100;
    const lossGivenDefault = 0.45; // Assume 45% LGD
    const exposureAtDefault = parseFloat(portfolioData.totalValue || 100000000);
    
    const expectedLoss = defaultRate * lossGivenDefault * exposureAtDefault;
    return Math.round(expectedLoss);
}

/**
 * 🏦 Assess Credit Risk Level
 */
function assessCreditRiskLevel(portfolioData) {
    const defaultRate = parseFloat(portfolioData.defaultRate || 0);
    const delinquencyRate = parseFloat(portfolioData.pastDue30Plus || 0);
    
    let score = 1; // Start with lowest risk
    
    if (defaultRate > 5 || delinquencyRate > 15) score = 5;
    else if (defaultRate > 3 || delinquencyRate > 10) score = 4;
    else if (defaultRate > 2 || delinquencyRate > 6) score = 3;
    else if (defaultRate > 1 || delinquencyRate > 3) score = 2;
    
    return score;
}

/**
 * 💧 Calculate Cash Ratio
 */
function calculateCashRatio(portfolioData) {
    const cashAndEquivalents = portfolioData.cashAndEquivalents || (portfolioData.totalValue * 0.10);
    const totalAssets = portfolioData.totalValue || 100000000;
    
    return ((cashAndEquivalents / totalAssets) * 100).toFixed(1);
}

/**
 * 📅 Calculate Maturity Mismatch
 */
function calculateMaturityMismatch(portfolioData) {
    const avgLoanMaturity = parseFloat(portfolioData.weightedAverageMaturity || 24);
    const avgFundingMaturity = portfolioData.avgFundingMaturity || 60; // Assume 5-year fund
    
    const mismatch = Math.abs(avgLoanMaturity - avgFundingMaturity);
    return mismatch.toFixed(1) + " months";
}

/**
 * 🌊 Assess Liquidity Risk Level
 */
function assessLiquidityRiskLevel(portfolioData) {
    const liquidityRatio = parseFloat(portfolioData.liquidityRatio || 20);
    
    if (liquidityRatio < 10) return 5; // High risk
    if (liquidityRatio < 15) return 4;
    if (liquidityRatio < 20) return 3;
    if (liquidityRatio < 25) return 2;
    return 1; // Low risk
}

/**
 * 📈 Calculate Interest Rate Sensitivity
 */
function calculateInterestRateSensitivity(portfolioData) {
    const avgDuration = parseFloat(portfolioData.weightedAverageMaturity || 24) / 12; // Convert to years
    const sensitivity = avgDuration * 100; // Simplified duration-based sensitivity
    
    return sensitivity.toFixed(1) + " bps per 1% rate change";
}

/**
 * 💱 Calculate FX Exposure
 */
function calculateFXExposure(portfolioData) {
    const dollarizedLoans = portfolioData.dollarizedPercentage || 85; // Assume 85% USD loans
    return dollarizedLoans.toFixed(1) + "% USD exposure";
}

/**
 * ⏱️ Calculate Duration Risk
 */
function calculateDurationRisk(portfolioData) {
    const avgMaturity = parseFloat(portfolioData.weightedAverageMaturity || 24);
    const duration = avgMaturity / 12; // Simplified duration calculation
    
    let riskLevel;
    if (duration > 5) riskLevel = "High";
    else if (duration > 3) riskLevel = "Medium";
    else riskLevel = "Low";
    
    return {
        duration: duration.toFixed(1) + " years",
        riskLevel: riskLevel
    };
}

/**
 * 📊 Assess Market Risk Level
 */
function assessMarketRiskLevel(portfolioData) {
    const dollarizedPercentage = parseFloat(portfolioData.dollarizedPercentage || 85);
    const avgMaturity = parseFloat(portfolioData.weightedAverageMaturity || 24);
    
    let score = 1;
    
    // Higher FX exposure increases risk
    if (dollarizedPercentage > 90) score += 1;
    else if (dollarizedPercentage > 75) score += 0.5;
    
    // Longer duration increases interest rate risk
    if (avgMaturity > 36) score += 1;
    else if (avgMaturity > 24) score += 0.5;
    
    return Math.min(5, Math.round(score));
}

/**
 * ⚖️ Assess Compliance Risk
 */
function assessComplianceRisk(portfolioData) {
    // Simplified compliance risk assessment
    // In practice, would integrate with compliance monitoring system
    let score = 2; // Base medium risk
    
    const largestExposure = parseFloat(portfolioData.largestExposure || 0);
    if (largestExposure > 15) score += 1; // Concentration limit breach
    
    const defaultRate = parseFloat(portfolioData.defaultRate || 0);
    if (defaultRate > 5) score += 1; // High default rate compliance concern
    
    return Math.min(5, score);
}

/**
 * 📅 Get Next Stress Test Date
 */
function getNextStressTestDate() {
    const today = new Date();
    const nextTest = new Date(today);
    nextTest.setMonth(today.getMonth() + 3); // Quarterly stress tests
    return nextTest.toISOString().split('T')[0];
}

/**
 * 💡 Generate Risk Recommendations
 */
function generateRiskRecommendations(riskScore, concentrationAnalysis) {
    const recommendations = [];
    
    // Overall Risk Level Recommendations
    if (parseFloat(riskScore.overall) >= 70) {
        recommendations.push({
            category: "Critical",
            action: "Immediate risk reduction required",
            priority: "Urgent",
            timeline: "30 days"
        });
        recommendations.push({
            category: "Portfolio",
            action: "Suspend new lending until risk levels reduced",
            priority: "High",
            timeline: "Immediate"
        });
    } else if (parseFloat(riskScore.overall) >= 40) {
        recommendations.push({
            category: "Monitoring",
            action: "Enhanced risk monitoring and reporting",
            priority: "High",
            timeline: "Immediate"
        });
    }
    
    // Credit Risk Recommendations
    if (riskScore.components.credit >= 4) {
        recommendations.push({
            category: "Credit Risk",
            action: "Tighten underwriting standards immediately",
            priority: "High",
            timeline: "30 days"
        });
        recommendations.push({
            category: "Credit Risk",
            action: "Increase loan loss provisions",
            priority: "Medium",
            timeline: "Next month-end"
        });
    }
    
    // Concentration Risk Recommendations
    if (concentrationAnalysis.overallConcentrationLevel === "High") {
        recommendations.push({
            category: "Concentration Risk",
            action: "Implement immediate concentration limits",
            priority: "High",
            timeline: "15 days"
        });
        
        if (concentrationAnalysis.singleNameRisk.exceedsLimit) {
            recommendations.push({
                category: "Concentration Risk",
                action: "Reduce largest single exposure below 10% limit",
                priority: "Urgent",
                timeline: "60 days"
            });
        }
        
        if (concentrationAnalysis.industryRisk.exceedsLimit) {
            recommendations.push({
                category: "Concentration Risk",
                action: "Diversify industry exposure below 25% limit",
                priority: "Medium",
                timeline: "6 months"
            });
        }
    }
    
    // Liquidity Risk Recommendations
    if (riskScore.components.liquidity >= 4) {
        recommendations.push({
            category: "Liquidity Risk",
            action: "Establish committed credit facilities",
            priority: "High",
            timeline: "90 days"
        });
        recommendations.push({
            category: "Liquidity Risk",
            action: "Increase cash reserves to minimum 15%",
            priority: "Medium",
            timeline: "60 days"
        });
    }
    
    // Market Risk Recommendations
    if (riskScore.components.market >= 3) {
        recommendations.push({
            category: "Market Risk",
            action: "Consider FX hedging for USD exposure",
            priority: "Medium",
            timeline: "90 days"
        });
        recommendations.push({
            category: "Market Risk",
            action: "Implement interest rate risk monitoring",
            priority: "Medium",
            timeline: "30 days"
        });
    }
    
    return recommendations;
}

/**
 * 🔍 Individual Loan Risk Assessment
 */
async function assessIndividualLoanRisk(loanId, loanData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING - INDIVIDUAL LOAN RISK ASSESSMENT

LOAN IDENTIFICATION:
• Loan ID: ${loanId}
• Borrower Name: ${loanData.borrowerName || 'Not specified'}
• Loan Amount: ${loanData.loanAmount ? loanData.loanAmount.toLocaleString() : 'Not provided'} USD
• Outstanding Balance: ${loanData.outstandingBalance ? loanData.outstandingBalance.toLocaleString() : 'Not provided'} USD
• Interest Rate: ${loanData.interestRate || 'Not specified'}%
• Maturity Date: ${loanData.maturityDate || 'Not specified'}

BORROWER PROFILE:
• Borrower Type: ${loanData.borrowerType || 'Not specified'}
• Industry/Sector: ${loanData.industry || 'Not specified'}
• Credit Score: ${loanData.creditScore || 'Not available'}
• Years in Business: ${loanData.yearsInBusiness || 'Not specified'}
• Annual Revenue: ${loanData.annualRevenue ? loanData.annualRevenue.toLocaleString() : 'Not provided'} USD

FINANCIAL METRICS:
• Debt Service Coverage Ratio: ${loanData.dscr || 'Not calculated'}x
• Loan-to-Value Ratio: ${loanData.ltv || 'Not calculated'}%
• Debt-to-Income Ratio: ${loanData.dti || 'Not calculated'}%
• Current Ratio: ${loanData.currentRatio || 'Not calculated'}x

COLLATERAL INFORMATION:
• Collateral Type: ${loanData.collateralType || 'Not specified'}
• Collateral Value: ${loanData.collateralValue ? loanData.collateralValue.toLocaleString() : 'Not provided'} USD
• Last Appraisal Date: ${loanData.lastAppraisalDate || 'Not specified'}
• Insurance Status: ${loanData.insuranceStatus || 'Not specified'}

PAYMENT PERFORMANCE:
• Current Status: ${loanData.paymentStatus || 'Not specified'}
• Days Past Due: ${loanData.daysPastDue || '0'}
• Payment History (12 months): ${loanData.paymentHistory || 'Not available'}
• Late Payments YTD: ${loanData.latePaymentsYTD || '0'}

INDIVIDUAL LOAN RISK ANALYSIS:

1. **CREDIT RISK ASSESSMENT**
   - Borrower creditworthiness and financial strength analysis
   - Payment capacity and cash flow sustainability evaluation
   - Credit score trends and rating migration assessment
   - Industry and business model risk evaluation

2. **COLLATERAL RISK EVALUATION**
   - Collateral adequacy and coverage analysis
   - Market value trends and volatility assessment
   - Liquidity and marketability of collateral
   - Legal perfection and documentation review

3. **STRUCTURAL RISK ANALYSIS**
   - Loan terms and pricing appropriateness
   - Covenant structure and monitoring effectiveness
   - Guarantee and security arrangements adequacy
   - Legal and documentation risk assessment

4. **PERFORMANCE RISK MONITORING**
   - Payment performance trends and early warnings
   - Financial covenant compliance and breaches
   - Operational performance indicators
   - Management quality and key person risks

5. **MARKET AND ENVIRONMENTAL RISKS**
   - Industry cyclicality and competitive position
   - Economic sensitivity and correlation analysis
   - Regulatory and compliance risk factors
   - Geographic and concentration risk impacts

6. **RECOVERY AND WORKOUT ASSESSMENT**
   - Recovery prospects in default scenarios
   - Collateral realization and liquidation analysis
   - Workout and restructuring options
   - Legal enforcement and collection capabilities

CAMBODIA-SPECIFIC LOAN CONSIDERATIONS:
• Local market conditions and business environment
• Currency and foreign exchange risk factors
• Legal system and enforcement capabilities
• Cultural and relationship factors in lending
• Regulatory compliance and licensing requirements

RISK SCORING AND CLASSIFICATION:
• Individual loan risk score and rating
• Probability of default estimation
• Loss given default assessment
• Risk-adjusted pricing recommendations

MONITORING AND ACTION RECOMMENDATIONS:
• Enhanced monitoring triggers and frequency
• Covenant modifications and adjustments
• Risk mitigation and enhancement measures
• Collection and workout strategy preparation

Provide comprehensive individual loan risk assessment with specific risk mitigation recommendations.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🔍 Individual Loan Risk Assessment",
            forceModel: "gpt-5" // Full model for comprehensive loan analysis
        });

        // Calculate individual loan risk metrics
        const loanRiskMetrics = calculateLoanRiskMetrics(loanData);
        const probabilityOfDefault = calculateProbabilityOfDefault(loanData);
        const lossGivenDefault = calculateLossGivenDefault(loanData);
        const riskRating = assignRiskRating(loanRiskMetrics, probabilityOfDefault);

        return {
            analysis: result.response,
            loanId: loanId,
            borrowerName: loanData.borrowerName,
            riskSummary: {
                riskRating: riskRating.rating,
                probabilityOfDefault: probabilityOfDefault.percentage,
                lossGivenDefault: lossGivenDefault.percentage,
                expectedLoss: calculateExpectedLossAmount(loanData, probabilityOfDefault, lossGivenDefault),
                riskLevel: riskRating.level
            },
            riskMetrics: loanRiskMetrics,
            riskFactors: identifyLoanRiskFactors(loanData, loanRiskMetrics),
            mitigationActions: generateLoanRiskMitigation(riskRating, loanRiskMetrics),
            monitoringPlan: generateLoanMonitoringPlan(riskRating),
            assessmentDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Individual loan risk assessment error:', error.message);
        return {
            analysis: `Individual loan risk assessment unavailable: ${error.message}`,
            loanId: loanId,
            riskSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Calculate Individual Loan Risk Metrics
 */
function calculateLoanRiskMetrics(loanData) {
    const metrics = {};
    
    // Financial Strength Metrics
    metrics.dscr = parseFloat(loanData.dscr || 0);
    metrics.ltv = parseFloat(loanData.ltv || 0);
    metrics.dti = parseFloat(loanData.dti || 0);
    metrics.currentRatio = parseFloat(loanData.currentRatio || 0);
    
    // Payment Performance Metrics
    metrics.daysPastDue = parseInt(loanData.daysPastDue || 0);
    metrics.latePaymentsYTD = parseInt(loanData.latePaymentsYTD || 0);
    metrics.paymentPerformanceScore = calculatePaymentPerformanceScore(loanData);
    
    // Risk Scores (1-5 scale, 5 = highest risk)
    metrics.financialRiskScore = assessFinancialRiskScore(loanData);
    metrics.collateralRiskScore = assessCollateralRiskScore(loanData);
    metrics.performanceRiskScore = assessPerformanceRiskScore(loanData);
    metrics.industryRiskScore = assessIndustryRiskScore(loanData.industry);
    
    return metrics;
}

/**
 * 🎯 Calculate Probability of Default
 */
function calculateProbabilityOfDefault(loanData) {
    let basePD = 2.0; // Base 2% annual PD
    
    // Adjust for financial metrics
    const dscr = parseFloat(loanData.dscr || 0);
    if (dscr < 1.0) basePD *= 3.0;
    else if (dscr < 1.25) basePD *= 2.0;
    else if (dscr > 2.0) basePD *= 0.7;
    
    const ltv = parseFloat(loanData.ltv || 0);
    if (ltv > 90) basePD *= 2.5;
    else if (ltv > 80) basePD *= 1.5;
    else if (ltv < 60) basePD *= 0.8;
    
    // Adjust for payment performance
    const daysPastDue = parseInt(loanData.daysPastDue || 0);
    if (daysPastDue > 90) basePD *= 5.0;
    else if (daysPastDue > 60) basePD *= 3.0;
    else if (daysPastDue > 30) basePD *= 2.0;
    else if (daysPastDue > 0) basePD *= 1.5;
    
    const latePaymentsYTD = parseInt(loanData.latePaymentsYTD || 0);
    if (latePaymentsYTD > 6) basePD *= 2.0;
    else if (latePaymentsYTD > 3) basePD *= 1.3;
    
    // Adjust for industry risk
    const industry = loanData.industry || "";
    if (industry.toLowerCase().includes("tourism") || 
        industry.toLowerCase().includes("hospitality")) {
        basePD *= 1.5; // Higher risk post-COVID
    }
    
    // Cap at 95%
    const finalPD = Math.min(95, basePD);
    
    return {
        percentage: finalPD.toFixed(1) + "%",
        numeric: finalPD / 100,
        confidenceLevel: finalPD < 5 ? "High" : finalPD < 15 ? "Medium" : "Low"
    };
}

/**
 * 💰 Calculate Loss Given Default
 */
function calculateLossGivenDefault(loanData) {
    let baseLGD = 45.0; // Base 45% LGD
    
    // Adjust for collateral
    const ltv = parseFloat(loanData.ltv || 80);
    const collateralType = loanData.collateralType || "";
    
    if (collateralType.toLowerCase().includes("real estate")) {
        baseLGD = 30.0; // Lower LGD for real estate
        if (ltv > 80) baseLGD += 10;
        else if (ltv < 60) baseLGD -= 5;
    } else if (collateralType.toLowerCase().includes("equipment")) {
        baseLGD = 50.0; // Higher LGD for equipment
    } else if (collateralType.toLowerCase().includes("unsecured")) {
        baseLGD = 70.0; // High LGD for unsecured
    }
    
    // Adjust for borrower type
    if (loanData.borrowerType === "Individual") {
        baseLGD += 5; // Slightly higher for individuals
    }
    
    // Adjust for loan size (economies of scale in recovery)
    const loanAmount = parseFloat(loanData.loanAmount || 0);
    if (loanAmount > 1000000) baseLGD -= 5; // Better recovery for large loans
    else if (loanAmount < 100000) baseLGD += 5; // Worse recovery for small loans
    
    const finalLGD = Math.max(10, Math.min(90, baseLGD));
    
    return {
        percentage: finalLGD.toFixed(1) + "%",
        numeric: finalLGD / 100,
        collateralRecovery: (100 - finalLGD).toFixed(1) + "%"
    };
}

/**
 * 🎯 Assign Risk Rating
 */
function assignRiskRating(loanRiskMetrics, probabilityOfDefault) {
    const pd = parseFloat(probabilityOfDefault.percentage);
    let rating, level, description;
    
    if (pd <= 1.0) {
        rating = "AAA";
        level = "Minimal";
        description = "Exceptional credit quality";
    } else if (pd <= 2.5) {
        rating = "AA";
        level = "Low";
        description = "Very strong credit quality";
    } else if (pd <= 5.0) {
        rating = "A";
        level = "Low";
        description = "Strong credit quality";
    } else if (pd <= 10.0) {
        rating = "BBB";
        level = "Medium";
        description = "Good credit quality";
    } else if (pd <= 20.0) {
        rating = "BB";
        level = "Medium";
        description = "Speculative credit quality";
    } else if (pd <= 35.0) {
        rating = "B";
        level = "High";
        description = "Highly speculative";
    } else {
        rating = "CCC";
        level = "Very High";
        description = "Substantial credit risk";
    }
    
    return {
        rating: rating,
        level: level,
        description: description,
        probabilityOfDefault: pd
    };
}

/**
 * 💵 Calculate Expected Loss Amount
 */
function calculateExpectedLossAmount(loanData, probabilityOfDefault, lossGivenDefault) {
    const outstandingBalance = parseFloat(loanData.outstandingBalance || loanData.loanAmount || 0);
    const pd = probabilityOfDefault.numeric;
    const lgd = lossGivenDefault.numeric;
    
    const expectedLoss = outstandingBalance * pd * lgd;
    
    return {
        amount: Math.round(expectedLoss),
        percentage: ((expectedLoss / outstandingBalance) * 100).toFixed(2) + "%",
        annualProvision: Math.round(expectedLoss)
    };
}

/**
 * ⚠️ Identify Loan Risk Factors
 */
function identifyLoanRiskFactors(loanData, loanRiskMetrics) {
    const riskFactors = [];
    const strengths = [];
    
    // Financial Risk Factors
    if (loanRiskMetrics.dscr < 1.25) {
        riskFactors.push("Low debt service coverage ratio");
    } else if (loanRiskMetrics.dscr > 2.0) {
        strengths.push("Strong debt service coverage");
    }
    
    if (loanRiskMetrics.ltv > 80) {
        riskFactors.push("High loan-to-value ratio");
    } else if (loanRiskMetrics.ltv < 60) {
        strengths.push("Conservative loan-to-value ratio");
    }
    
    // Performance Risk Factors
    if (loanRiskMetrics.daysPastDue > 0) {
        riskFactors.push(`Currently ${loanRiskMetrics.daysPastDue} days past due`);
    }
    
    if (loanRiskMetrics.latePaymentsYTD > 3) {
        riskFactors.push("Pattern of late payments");
    } else if (loanRiskMetrics.latePaymentsYTD === 0) {
        strengths.push("Perfect payment history");
    }
    
    // Industry Risk Factors
    const industry = loanData.industry || "";
    if (industry.toLowerCase().includes("tourism") || 
        industry.toLowerCase().includes("hospitality")) {
        riskFactors.push("High-risk industry (tourism/hospitality)");
    }
    
    // Collateral Risk Factors
    if (loanData.collateralType && loanData.collateralType.toLowerCase().includes("unsecured")) {
        riskFactors.push("Unsecured loan structure");
    }
    
    // Borrower Risk Factors
    const yearsInBusiness = parseInt(loanData.yearsInBusiness || 0);
    if (yearsInBusiness < 2) {
        riskFactors.push("Limited business operating history");
    } else if (yearsInBusiness > 10) {
        strengths.push("Established business with long operating history");
    }
    
    return {
        riskFactors: riskFactors,
        strengths: strengths,
        riskCount: riskFactors.length,
        strengthCount: strengths.length,
        netRiskScore: riskFactors.length - strengths.length
    };
}

/**
 * 🛠️ Generate Loan Risk Mitigation Actions
 */
function generateLoanRiskMitigation(riskRating, loanRiskMetrics) {
    const actions = [];
    
    if (riskRating.level === "Very High" || riskRating.level === "High") {
        actions.push({
            action: "Place on watch list for enhanced monitoring",
            category: "Monitoring",
            priority: "High",
            timeline: "Immediate"
        });
        
        if (loanRiskMetrics.daysPastDue > 30) {
            actions.push({
                action: "Initiate formal collection procedures",
                category: "Collections",
                priority: "Urgent",
                timeline: "24 hours"
            });
        }
        
        actions.push({
            action: "Require additional collateral or guarantees",
            category: "Credit Enhancement",
            priority: "High",
            timeline: "30 days"
        });
        
        actions.push({
            action: "Consider loan workout or restructuring",
            category: "Restructuring",
            priority: "Medium",
            timeline: "60 days"
        });
    }
    
    if (riskRating.level === "Medium") {
        actions.push({
            action: "Increase monitoring frequency to monthly",
            category: "Monitoring",
            priority: "Medium",
            timeline: "Next month"
        });
        
        if (loanRiskMetrics.dscr < 1.25) {
            actions.push({
                action: "Request updated financial statements",
                category: "Documentation",
                priority: "Medium",
                timeline: "15 days"
            });
        }
    }
    
    if (riskRating.level === "Low" || riskRating.level === "Minimal") {
        actions.push({
            action: "Continue routine quarterly monitoring",
            category: "Monitoring",
            priority: "Low",
            timeline: "Next quarter"
        });
    }
    
    // Universal actions based on specific metrics
    if (loanRiskMetrics.ltv > 80) {
        actions.push({
            action: "Order updated collateral appraisal",
            category: "Collateral Management",
            priority: "Medium",
            timeline: "30 days"
        });
    }
    
    return actions;
}

/**
 * 📋 Generate Loan Monitoring Plan
 */
function generateLoanMonitoringPlan(riskRating) {
    let frequency, requirements;
    
    switch (riskRating.level) {
        case "Very High":
            frequency = "Weekly";
            requirements = [
                "Weekly payment status check",
                "Monthly financial statement review",
                "Quarterly collateral inspection",
                "Continuous covenant monitoring"
            ];
            break;
            
        case "High":
            frequency = "Monthly";
            requirements = [
                "Monthly payment performance review",
                "Quarterly financial statements",
                "Semi-annual collateral verification",
                "Quarterly covenant compliance check"
            ];
            break;
            
        case "Medium":
            frequency = "Quarterly";
            requirements = [
                "Quarterly payment review",
                "Semi-annual financial statements",
                "Annual collateral appraisal",
                "Annual covenant compliance review"
            ];
            break;
            
        default:
            frequency = "Semi-Annual";
            requirements = [
                "Semi-annual performance review",
                "Annual financial statements",
                "Bi-annual collateral verification",
                "Annual risk rating review"
            ];
    }
    
    return {
        frequency: frequency,
        requirements: requirements,
        escalationTriggers: [
            "Payment delay > 15 days",
            "Covenant violation",
            "Significant financial deterioration",
            "Collateral value decline > 20%",
            "Management or ownership changes"
        ],
        nextReviewDate: calculateNextLoanReviewDate(frequency)
    };
}

/**
 * 📅 Calculate Next Loan Review Date
 */
function calculateNextLoanReviewDate(frequency) {
    const today = new Date();
    const nextReview = new Date(today);
    
    switch (frequency) {
        case "Weekly":
            nextReview.setDate(today.getDate() + 7);
            break;
        case "Monthly":
            nextReview.setMonth(today.getMonth() + 1);
            break;
        case "Quarterly":
            nextReview.setMonth(today.getMonth() + 3);
            break;
        case "Semi-Annual":
        default:
            nextReview.setMonth(today.getMonth() + 6);
            break;
    }
    
    return nextReview.toISOString().split('T')[0];
}

// 🧮 ADDITIONAL RISK HELPER FUNCTIONS

function calculatePaymentPerformanceScore(loanData) {
    let score = 100; // Start with perfect score
    
    const daysPastDue = parseInt(loanData.daysPastDue || 0);
    const latePaymentsYTD = parseInt(loanData.latePaymentsYTD || 0);
    
    // Deduct for current delinquency
    if (daysPastDue > 90) score -= 50;
    else if (daysPastDue > 60) score -= 35;
    else if (daysPastDue > 30) score -= 20;
    else if (daysPastDue > 0) score -= 10;
    
    // Deduct for late payment history
    score -= (latePaymentsYTD * 3); // 3 points per late payment
    
    return Math.max(0, score);
}

function assessFinancialRiskScore(loanData) {
    let score = 1; // Start with lowest risk
    
    const dscr = parseFloat(loanData.dscr || 0);
    const currentRatio = parseFloat(loanData.currentRatio || 0);
    const dti = parseFloat(loanData.dti || 0);
    
    if (dscr < 1.0) score = 5;
    else if (dscr < 1.25) score = 4;
    else if (dscr < 1.5) score = 3;
    else if (dscr < 2.0) score = 2;
    
    if (currentRatio < 1.0) score = Math.max(score, 4);
    else if (currentRatio < 1.2) score = Math.max(score, 3);
    
    if (dti > 50) score = Math.max(score, 4);
    else if (dti > 40) score = Math.max(score, 3);
    
    return score;
}

function assessCollateralRiskScore(loanData) {
    let score = 3; // Base medium risk
    
    const ltv = parseFloat(loanData.ltv || 0);
    const collateralType = loanData.collateralType || "";
    
    if (ltv > 90) score = 5;
    else if (ltv > 80) score = 4;
    else if (ltv < 60) score = 1;
    else if (ltv < 70) score = 2;
    
    if (collateralType.toLowerCase().includes("real estate")) {
        score = Math.max(1, score - 1); // Real estate is lower risk
    } else if (collateralType.toLowerCase().includes("unsecured")) {
        score = 5; // Unsecured is highest risk
    }
    
    return score;
}

function assessPerformanceRiskScore(loanData) {
    let score = 1; // Start with lowest risk
    
    const daysPastDue = parseInt(loanData.daysPastDue || 0);
    const latePaymentsYTD = parseInt(loanData.latePaymentsYTD || 0);
    
    if (daysPastDue > 90) score = 5;
    else if (daysPastDue > 60) score = 4;
    else if (daysPastDue > 30) score = 3;
    else if (daysPastDue > 0) score = 2;
    
    if (latePaymentsYTD > 6) score = Math.max(score, 4);
    else if (latePaymentsYTD > 3) score = Math.max(score, 3);
    else if (latePaymentsYTD > 1) score = Math.max(score, 2);
    
    return score;
}

function assessIndustryRiskScore(industry) {
    const industryLower = (industry || "").toLowerCase();
    
    if (industryLower.includes("tourism") || industryLower.includes("hospitality") || 
        industryLower.includes("restaurant") || industryLower.includes("entertainment")) {
        return 4; // High risk industries
    } else if (industryLower.includes("construction") || industryLower.includes("retail")) {
        return 3; // Medium-high risk
    } else if (industryLower.includes("manufacturing") || industryLower.includes("agriculture")) {
        return 2; // Medium risk
    } else if (industryLower.includes("healthcare") || industryLower.includes("education") ||
               industryLower.includes("government")) {
        return 1; // Low risk
    }
    
    return 2; // Default medium risk
}

// 📊 EXPORT FUNCTIONS
module.exports = {
    // Portfolio risk assessment
    assessPortfolioRisk,
    calculateRiskMetrics,
    analyzeConcentrationRisk,
    performStressTest,
    calculateOverallRiskScore,
    identifyEarlyWarnings,
    generateRiskRecommendations,
    
    // Individual loan risk assessment
    assessIndividualLoanRisk,
    calculateLoanRiskMetrics,
    calculateProbabilityOfDefault,
    calculateLossGivenDefault,
    assignRiskRating,
    calculateExpectedLossAmount,
    identifyLoanRiskFactors,
    generateLoanRiskMitigation,
    generateLoanMonitoringPlan,
    
    // Utility functions
    calculateExpectedLoss,
    assessCreditRiskLevel,
    calculateCashRatio,
    calculateMaturityMismatch,
    assessLiquidityRiskLevel,
    calculateInterestRateSensitivity,
    calculateFXExposure,
    calculateDurationRisk,
    assessMarketRiskLevel,
    assessComplianceRisk,
    getNextStressTestDate,
    calculateNextLoanReviewDate,
    
    // Helper functions for risk scoring
    calculatePaymentPerformanceScore,
    assessFinancialRiskScore,
    assessCollateralRiskScore,
    assessPerformanceRiskScore,
    assessIndustryRiskScore,
    
    // Framework constants
    RISK_MANAGEMENT_FRAMEWORK
};

// 🏁 END OF CAMBODIA RISK MANAGEMENT SYSTEM
