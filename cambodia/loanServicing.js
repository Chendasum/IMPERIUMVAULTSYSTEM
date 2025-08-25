// cambodia/loanServicing.js - COMPLETE: Cambodia Loan Servicing & Portfolio Management System
// Enterprise-grade loan servicing with GPT-5 intelligence for private lending fund

const { executeEnhancedGPT5Command } = require('../utils/dualCommandSystem');

// 🔧 SPECIALIZED HANDLERS (Integration with existing systems)
const cambodiaHandler = require('../handlers/cambodiaDeals');
const lpManagement = require('./lpManagement');
const portfolioManager = require('./portfolioManager');
const realEstateWealth = require('./realEstateWealth');
const businessWealth = require('./businessWealth');
const investmentWealth = require('./investmentWealth');
const economicIntelligence = require('./economicIntelligence');
const legalRegulatory = require('./legalRegulatory');
const agriculturalWealth = require('./agriculturalWealth');
const resourcesWealth = require('./resourcesWealth');
const creditAssessment = require('./creditAssessment');
const loanOrigination = require('./loanOrigination');

// 🏦 CAMBODIA LOAN SERVICING FRAMEWORK
const LOAN_SERVICING_FRAMEWORK = {
    // Loan statuses and lifecycle
    loanStatuses: {
        current: {
            status: "Current",
            description: "All payments current, no past due amounts",
            riskLevel: "low",
            actionRequired: "routine_monitoring"
        },
        pastDue_1_30: {
            status: "Past Due 1-30 Days",
            description: "Payment overdue by 1-30 days",
            riskLevel: "medium",
            actionRequired: "collection_calls"
        },
        pastDue_31_60: {
            status: "Past Due 31-60 Days", 
            description: "Payment overdue by 31-60 days",
            riskLevel: "high",
            actionRequired: "formal_collection_notice"
        },
        pastDue_61_90: {
            status: "Past Due 61-90 Days",
            description: "Payment overdue by 61-90 days",
            riskLevel: "high",
            actionRequired: "default_notice"
        },
        default: {
            status: "Default",
            description: "Payment overdue by 90+ days or covenant violation",
            riskLevel: "critical",
            actionRequired: "legal_action"
        },
        workout: {
            status: "Workout/Restructure",
            description: "Loan under modification or workout agreement",
            riskLevel: "high",
            actionRequired: "workout_monitoring"
        },
        foreclosure: {
            status: "Foreclosure",
            description: "Legal foreclosure proceedings initiated",
            riskLevel: "critical",
            actionRequired: "foreclosure_management"
        },
        charged_off: {
            status: "Charged Off",
            description: "Loan written off as uncollectible",
            riskLevel: "critical",
            actionRequired: "recovery_efforts"
        },
        paid_off: {
            status: "Paid Off",
            description: "Loan fully repaid and closed",
            riskLevel: "none",
            actionRequired: "file_closure"
        }
    },

    // Payment processing and monitoring
    paymentProcessing: {
        acceptedMethods: [
            "Bank transfer (preferred)",
            "ACH/Wire transfer",
            "Check (with processing time)",
            "Cash (at approved locations)"
        ],
        processingTimelines: {
            bankTransfer: "Same day",
            achWire: "1-2 business days",
            check: "3-5 business days",
            cash: "Same day"
        },
        lateFees: {
            gracePeriod: "5 days",
            lateFeeAmount: "5% of payment or $25 minimum",
            compounding: "No compounding late fees",
            maximumFee: "10% of outstanding principal"
        }
    },

    // Monitoring and reporting requirements
    monitoringRequirements: {
        financial_reporting: {
            frequency: "Monthly/Quarterly based on loan size",
            requirements: [
                "Profit & Loss Statement",
                "Balance Sheet", 
                "Cash Flow Statement",
                "Accounts Receivable Aging"
            ],
            dueDate: "15th of following month"
        },
        collateral_monitoring: {
            frequency: "Annual or as required",
            requirements: [
                "Property inspection",
                "Insurance verification",
                "Tax payment verification",
                "Environmental compliance"
            ]
        },
        covenant_monitoring: {
            financial_covenants: [
                "Debt Service Coverage Ratio ≥ 1.25",
                "Current Ratio ≥ 1.10",
                "Tangible Net Worth > $X",
                "Maximum Leverage Ratio ≤ 4:1"
            ],
            operational_covenants: [
                "Maintain insurance coverage",
                "Provide financial reports",
                "No additional debt without consent",
                "Maintain business operations"
            ]
        }
    },

    // Collection and workout procedures
    collectionProcedures: {
        early_stage: {
            days_1_15: [
                "Friendly payment reminder call",
                "Email payment notice",
                "Payment arrangement discussion"
            ],
            days_16_30: [
                "Formal collection call",
                "Written demand letter", 
                "Late fee assessment"
            ]
        },
        formal_collection: {
            days_31_60: [
                "Formal collection notice",
                "Borrower meeting scheduled",
                "Workout discussion initiation",
                "Collateral inspection"
            ],
            days_61_90: [
                "Default notice (formal)",
                "Legal review initiation",
                "Guarantor notification",
                "Asset preservation actions"
            ]
        },
        legal_action: {
            days_90_plus: [
                "Legal counsel engagement",
                "Foreclosure initiation",
                "Asset seizure procedures",
                "Recovery action planning"
            ]
        }
    },

    // Performance metrics and KPIs
    performanceMetrics: {
        portfolio_health: [
            "Current payment percentage",
            "Past due aging analysis",
            "Default rate tracking",
            "Loss rate calculation"
        ],
        collection_effectiveness: [
            "Collection rate by age bucket",
            "Recovery rate post-default", 
            "Time to resolution",
            "Collection cost ratio"
        ],
        risk_indicators: [
            "Early payment default (EPD) rate",
            "Migration analysis",
            "Concentration risk metrics",
            "Economic sensitivity analysis"
        ]
    }
};

// 💰 LOAN SERVICING FUNCTIONS

/**
 * 🏦 Monitor Loan Portfolio Performance
 */
async function monitorPortfolioPerformance(portfolioData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - PORTFOLIO PERFORMANCE MONITORING

PORTFOLIO OVERVIEW:
• Total Active Loans: ${portfolioData.totalActiveLoans || 'Not specified'}
• Total Outstanding Principal: $${portfolioData.totalOutstanding ? portfolioData.totalOutstanding.toLocaleString() : 'Not provided'} USD
• Average Loan Size: $${portfolioData.averageLoanSize ? portfolioData.averageLoanSize.toLocaleString() : 'Not calculated'} USD
• Portfolio Maturity: ${portfolioData.weightedAverageMaturity || 'Not specified'} months

PAYMENT PERFORMANCE:
• Current Loans: ${portfolioData.currentLoans || 'Not specified'} (${portfolioData.currentPercentage || 'Not calculated'}%)
• Past Due 1-30 Days: ${portfolioData.pastDue30 || 'Not specified'} (${portfolioData.pastDue30Percentage || 'Not calculated'}%)
• Past Due 31-60 Days: ${portfolioData.pastDue60 || 'Not specified'} (${portfolioData.pastDue60Percentage || 'Not calculated'}%)
• Past Due 61-90 Days: ${portfolioData.pastDue90 || 'Not specified'} (${portfolioData.pastDue90Percentage || 'Not calculated'}%)
• Default/NPL: ${portfolioData.defaultLoans || 'Not specified'} (${portfolioData.defaultPercentage || 'Not calculated'}%)

FINANCIAL METRICS:
• Portfolio Yield: ${portfolioData.portfolioYield || 'Not calculated'}% annually
• Net Charge-Offs (YTD): $${portfolioData.chargeOffs ? portfolioData.chargeOffs.toLocaleString() : 'Not reported'} USD
• Provision Coverage: ${portfolioData.provisionCoverage || 'Not calculated'}%
• Collection Effectiveness: ${portfolioData.collectionRate || 'Not calculated'}%

PORTFOLIO PERFORMANCE ANALYSIS:

1. **PAYMENT PERFORMANCE ASSESSMENT**
   - Current payment status analysis and trends
   - Delinquency migration patterns and early warning indicators
   - Seasonal payment patterns and borrower behavior analysis
   - Payment method effectiveness and processing efficiency

2. **RISK CONCENTRATION ANALYSIS**
   - Industry concentration and diversification metrics
   - Geographic concentration and regional risk assessment
   - Loan size concentration and large exposure analysis
   - Borrower concentration and relationship risk evaluation

3. **COLLECTION AND RECOVERY EFFECTIVENESS**
   - Collection strategy performance by delinquency stage
   - Recovery rates and time-to-resolution analysis
   - Legal action effectiveness and cost analysis
   - Workout and restructuring success rates

4. **PROFITABILITY AND YIELD ANALYSIS**
   - Net interest margin and spread analysis
   - Fee income and non-interest revenue assessment
   - Cost-to-income ratio and operational efficiency
   - Risk-adjusted return on assets (RAROA) calculation

5. **FORWARD-LOOKING RISK ASSESSMENT**
   - Early warning indicators and predictive analytics
   - Economic scenario impact modeling
   - Borrower stress testing and vulnerability assessment
   - Portfolio optimization and strategy recommendations

CAMBODIA MARKET CONSIDERATIONS:
• Local economic conditions and business cycles
• Currency stability and foreign exchange impact
• Industry-specific risks and market developments
• Regulatory changes and compliance requirements
• Seasonal factors affecting borrower performance

PERFORMANCE BENCHMARKING:
• Industry standard comparisons and peer analysis
• Regional market performance benchmarks
• Historical performance trends and cycle analysis
• Best practice identification and implementation opportunities

Provide comprehensive portfolio performance analysis with actionable recommendations for optimization.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🏦 Portfolio Performance Analysis",
            forceModel: "gpt-5" // Full model for comprehensive portfolio analysis
        });

        // Calculate detailed performance metrics
        const performanceMetrics = calculatePortfolioMetrics(portfolioData);
        const riskAnalysis = analyzePortfolioRisk(portfolioData);
        const recommendations = generatePortfolioRecommendations(performanceMetrics, riskAnalysis);

        return {
            analysis: result.response,
            portfolioSummary: {
                totalLoans: portfolioData.totalActiveLoans,
                totalOutstanding: portfolioData.totalOutstanding,
                currentPercentage: portfolioData.currentPercentage,
                pastDueTotal: calculateTotalPastDue(portfolioData)
            },
            performanceMetrics: performanceMetrics,
            riskAnalysis: riskAnalysis,
            recommendations: recommendations,
            benchmarks: generatePortfolioBenchmarks(performanceMetrics),
            monitoringDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Portfolio monitoring error:', error.message);
        return {
            analysis: `Portfolio performance analysis unavailable: ${error.message}`,
            portfolioSummary: portfolioData,
            performanceMetrics: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Calculate Portfolio Metrics
 */
function calculatePortfolioMetrics(portfolioData) {
    const metrics = {};
    
    // Basic performance ratios
    const totalLoans = portfolioData.totalActiveLoans || 1;
    const totalOutstanding = portfolioData.totalOutstanding || 1;
    
    metrics.currentRatio = ((portfolioData.currentLoans || 0) / totalLoans * 100).toFixed(1);
    metrics.delinquencyRate = (((portfolioData.pastDue30 || 0) + (portfolioData.pastDue60 || 0) + (portfolioData.pastDue90 || 0)) / totalLoans * 100).toFixed(1);
    metrics.defaultRate = ((portfolioData.defaultLoans || 0) / totalLoans * 100).toFixed(1);
    
    // Financial metrics
    if (portfolioData.portfolioYield) {
        metrics.netYield = (portfolioData.portfolioYield - (portfolioData.costOfFunds || 8)).toFixed(2);
    }
    
    if (portfolioData.chargeOffs && totalOutstanding) {
        metrics.chargeOffRate = ((portfolioData.chargeOffs / totalOutstanding) * 100).toFixed(2);
    }
    
    // Risk metrics
    metrics.concentrationRisk = assessConcentrationRisk(portfolioData);
    metrics.qualityTrend = assessQualityTrend(portfolioData);
    
    return metrics;
}

/**
 * ⚠️ Analyze Portfolio Risk
 */
function analyzePortfolioRisk(portfolioData) {
    const riskFactors = [];
    const opportunities = [];
    
    const delinquencyRate = parseFloat(portfolioData.pastDue30Percentage || 0) + 
                          parseFloat(portfolioData.pastDue60Percentage || 0) + 
                          parseFloat(portfolioData.pastDue90Percentage || 0);
    
    // Risk assessment
    if (delinquencyRate > 10) {
        riskFactors.push("High delinquency rate requires immediate attention");
    }
    
    if (parseFloat(portfolioData.defaultPercentage || 0) > 5) {
        riskFactors.push("Default rate above acceptable threshold");
    }
    
    if (parseFloat(portfolioData.currentPercentage || 100) < 85) {
        riskFactors.push("Low current payment percentage indicates collection issues");
    }
    
    // Opportunity identification
    if (parseFloat(portfolioData.portfolioYield || 0) < 18) {
        opportunities.push("Potential for yield optimization through repricing");
    }
    
    if (parseFloat(portfolioData.collectionRate || 0) < 80) {
        opportunities.push("Collection process improvements needed");
    }
    
    return {
        riskFactors: riskFactors,
        opportunities: opportunities,
        overallRiskLevel: riskFactors.length > 2 ? "High" : riskFactors.length > 0 ? "Medium" : "Low",
        riskScore: Math.max(0, 100 - (riskFactors.length * 15))
    };
}

/**
 * 🎯 Assess Concentration Risk
 */
function assessConcentrationRisk(portfolioData) {
    // Simplified concentration assessment
    let riskScore = 0;
    
    if (portfolioData.largestLoanPercentage > 15) riskScore += 2;
    if (portfolioData.top10LoansPercentage > 50) riskScore += 2;
    if (portfolioData.singleIndustryPercentage > 30) riskScore += 1;
    
    return riskScore <= 1 ? "Low" : riskScore <= 3 ? "Medium" : "High";
}

/**
 * 📈 Assess Quality Trend
 */
function assessQualityTrend(portfolioData) {
    // Compare current vs previous period if available
    if (portfolioData.previousPeriodDefault && portfolioData.defaultPercentage) {
        const trend = parseFloat(portfolioData.defaultPercentage) - parseFloat(portfolioData.previousPeriodDefault);
        return trend > 1 ? "Deteriorating" : trend < -1 ? "Improving" : "Stable";
    }
    return "Unknown";
}

/**
 * 💡 Generate Portfolio Recommendations
 */
function generatePortfolioRecommendations(performanceMetrics, riskAnalysis) {
    const recommendations = [];
    
    if (riskAnalysis.overallRiskLevel === "High") {
        recommendations.push("Implement enhanced collection procedures immediately");
        recommendations.push("Review and tighten underwriting standards");
        recommendations.push("Increase loan loss provisions");
    }
    
    if (parseFloat(performanceMetrics.delinquencyRate) > 8) {
        recommendations.push("Focus on early-stage collection effectiveness");
        recommendations.push("Implement borrower payment assistance programs");
    }
    
    if (performanceMetrics.concentrationRisk === "High") {
        recommendations.push("Diversify loan portfolio across industries and geographies");
        recommendations.push("Implement concentration limits and monitoring");
    }
    
    if (riskAnalysis.opportunities.length > 0) {
        recommendations.push("Explore identified growth and optimization opportunities");
    }
    
    recommendations.push("Regular stress testing and scenario analysis");
    
    return recommendations;
}

/**
 * 📊 Generate Portfolio Benchmarks
 */
function generatePortfolioBenchmarks(performanceMetrics) {
    return {
        industryBenchmarks: {
            currentRatio: "≥ 90%",
            delinquencyRate: "≤ 5%", 
            defaultRate: "≤ 2%",
            netYield: "12-18%"
        },
        portfolioPerformance: {
            currentRatio: performanceMetrics.currentRatio + "%",
            delinquencyRate: performanceMetrics.delinquencyRate + "%",
            defaultRate: performanceMetrics.defaultRate + "%",
            netYield: performanceMetrics.netYield + "%"
        },
        performanceGrade: calculatePerformanceGrade(performanceMetrics)
    };
}

/**
 * 🎯 Calculate Performance Grade
 */
function calculatePerformanceGrade(metrics) {
    let score = 0;
    
    if (parseFloat(metrics.currentRatio) >= 90) score += 25;
    else if (parseFloat(metrics.currentRatio) >= 85) score += 20;
    else if (parseFloat(metrics.currentRatio) >= 80) score += 15;
    
    if (parseFloat(metrics.delinquencyRate) <= 3) score += 25;
    else if (parseFloat(metrics.delinquencyRate) <= 5) score += 20;
    else if (parseFloat(metrics.delinquencyRate) <= 8) score += 15;
    
    if (parseFloat(metrics.defaultRate) <= 1) score += 25;
    else if (parseFloat(metrics.defaultRate) <= 2) score += 20;
    else if (parseFloat(metrics.defaultRate) <= 3) score += 15;
    
    if (parseFloat(metrics.netYield) >= 12) score += 25;
    else if (parseFloat(metrics.netYield) >= 8) score += 20;
    else if (parseFloat(metrics.netYield) >= 5) score += 15;
    
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B+";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    return "F";
}

/**
 * 📋 Process Individual Loan Servicing
 */
async function processLoanServicing(loanId, servicingData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING - INDIVIDUAL LOAN SERVICING ANALYSIS

LOAN IDENTIFICATION:
• Loan ID: ${loanId}
• Borrower Name: ${servicingData.borrowerName || 'Not specified'}
• Original Amount: $${servicingData.originalAmount ? servicingData.originalAmount.toLocaleString() : 'Not provided'} USD
• Outstanding Balance: $${servicingData.outstandingBalance ? servicingData.outstandingBalance.toLocaleString() : 'Not provided'} USD
• Monthly Payment: $${servicingData.monthlyPayment ? servicingData.monthlyPayment.toLocaleString() : 'Not provided'} USD

PAYMENT STATUS:
• Current Status: ${servicingData.currentStatus || 'Not specified'}
• Days Past Due: ${servicingData.daysPastDue || 'Current'}
• Last Payment Date: ${servicingData.lastPaymentDate || 'Not recorded'}
• Last Payment Amount: $${servicingData.lastPaymentAmount ? servicingData.lastPaymentAmount.toLocaleString() : 'Not recorded'} USD
• Next Payment Due: ${servicingData.nextPaymentDue || 'Not specified'}

ACCOUNT HISTORY:
• Payment History (12 months): ${servicingData.paymentHistory || 'Not available'}
• Late Payments YTD: ${servicingData.latePaymentsYTD || 'Not recorded'}
• Total Late Fees: $${servicingData.totalLateFees || 0} USD
• Covenant Violations: ${servicingData.covenantViolations || 'None reported'}

LOAN SERVICING ANALYSIS:

1. **PAYMENT PERFORMANCE EVALUATION**
   - Payment pattern analysis and consistency assessment
   - Delinquency history and trend identification
   - Seasonal payment variations and borrower behavior
   - Early warning indicators and risk signals

2. **ACCOUNT STATUS DETERMINATION**
   - Current loan status classification
   - Required servicing actions based on status
   - Collection strategy recommendations
   - Risk escalation requirements

3. **BORROWER COMMUNICATION STRATEGY**
   - Appropriate communication approach for current status
   - Required notices and documentation
   - Payment arrangement and workout options
   - Relationship management recommendations

4. **COVENANT AND COMPLIANCE MONITORING**
   - Financial covenant compliance assessment
   - Reporting requirement fulfillment
   - Insurance and collateral status verification
   - Regulatory compliance review

5. **RISK ASSESSMENT AND MITIGATION**
   - Current risk level and probability of default
   - Collateral protection and valuation status
   - Guarantor strength and collectibility
   - Recovery prospects and strategy

CAMBODIA SERVICING CONSIDERATIONS:
• Local legal requirements and collection procedures
• Cultural considerations in borrower communication
• Currency and payment method preferences
• Holiday and business calendar impacts on collections

SERVICING ACTIONS AND RECOMMENDATIONS:
• Immediate actions required
• Follow-up timeline and responsibilities
• Escalation triggers and procedures
• Documentation and reporting requirements

Provide detailed loan servicing analysis with specific action recommendations.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📋 Individual Loan Servicing Analysis",
            forceModel: "gpt-5-mini" // Balanced for individual loan analysis
        });

        // Determine servicing actions
        const loanStatus = determineLoanStatus(servicingData);
        const requiredActions = generateServicingActions(loanStatus, servicingData);
        const riskAssessment = assessIndividualLoanRisk(servicingData);

        return {
            analysis: result.response,
            loanId: loanId,
            borrowerName: servicingData.borrowerName,
            accountSummary: {
                originalAmount: servicingData.originalAmount,
                outstandingBalance: servicingData.outstandingBalance,
                currentStatus: loanStatus.status,
                daysPastDue: servicingData.daysPastDue,
                riskLevel: loanStatus.riskLevel
            },
            servicingActions: requiredActions,
            riskAssessment: riskAssessment,
            nextReviewDate: calculateNextReviewDate(loanStatus),
            servicingDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Loan servicing error:', error.message);
        return {
            analysis: `Loan servicing analysis unavailable: ${error.message}`,
            loanId: loanId,
            accountSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 🎯 Determine Loan Status
 */
function determineLoanStatus(servicingData) {
    const daysPastDue = parseInt(servicingData.daysPastDue) || 0;
    const covenantViolations = servicingData.covenantViolations !== 'None reported' && servicingData.covenantViolations;
    
    if (covenantViolations || daysPastDue >= 90) {
        return LOAN_SERVICING_FRAMEWORK.loanStatuses.default;
    } else if (daysPastDue >= 61) {
        return LOAN_SERVICING_FRAMEWORK.loanStatuses.pastDue_61_90;
    } else if (daysPastDue >= 31) {
        return LOAN_SERVICING_FRAMEWORK.loanStatuses.pastDue_31_60;
    } else if (daysPastDue >= 1) {
        return LOAN_SERVICING_FRAMEWORK.loanStatuses.pastDue_1_30;
    } else {
        return LOAN_SERVICING_FRAMEWORK.loanStatuses.current;
    }
}

/**
 * 📝 Generate Servicing Actions
 */
function generateServicingActions(loanStatus, servicingData) {
    const actions = [];
    const daysPastDue = parseInt(servicingData.daysPastDue) || 0;
    
    if (loanStatus.status === "Current") {
        actions.push({
            action: "Routine monitoring",
            priority: "low",
            deadline: "Next scheduled review",
            responsibility: "Loan Servicer"
        });
        
    } else if (loanStatus.status.includes("Past Due")) {
        if (daysPastDue <= 15) {
            actions.push({
                action: "Friendly payment reminder call",
                priority: "medium",
                deadline: "Within 24 hours",
                responsibility: "Loan Officer"
            });
            
        } else if (daysPastDue <= 30) {
            actions.push({
                action: "Formal collection call and email notice",
                priority: "high", 
                deadline: "Within 24 hours",
                responsibility: "Collections Team"
            });
            
            actions.push({
                action: "Assess and apply late fees",
                priority: "medium",
                deadline: "Within 48 hours", 
                responsibility: "Loan Servicer"
            });
            
        } else if (daysPastDue <= 60) {
            actions.push({
                action: "Send formal collection notice",
                priority: "high",
                deadline: "Immediately",
                responsibility: "Collections Manager"
            });
            
            actions.push({
                action: "Schedule borrower meeting",
                priority: "high",
                deadline: "Within 5 days",
                responsibility: "Loan Officer"
            });
            
        } else if (daysPastDue <= 90) {
            actions.push({
                action: "Issue default notice",
                priority: "urgent",
                deadline: "Immediately", 
                responsibility: "Collections Manager"
            });
            
            actions.push({
                action: "Initiate legal review",
                priority: "urgent",
                deadline: "Within 3 days",
                responsibility: "Legal Team"
            });
        }
        
    } else if (loanStatus.status === "Default") {
        actions.push({
            action: "Engage legal counsel",
            priority: "urgent",
            deadline: "Immediately",
            responsibility: "Credit Manager"
        });
        
        actions.push({
            action: "Initiate asset preservation measures",
            priority: "urgent", 
            deadline: "Within 48 hours",
            responsibility: "Collections Team"
        });
        
        actions.push({
            action: "Notify guarantors",
            priority: "high",
            deadline: "Within 3 days",
            responsibility: "Loan Officer"
        });
    }
    
    return actions;
}

/**
 * ⚠️ Assess Individual Loan Risk
 */
function assessIndividualLoanRisk(servicingData) {
    const riskFactors = [];
    const daysPastDue = parseInt(servicingData.daysPastDue) || 0;
    const latePaymentsYTD = parseInt(servicingData.latePaymentsYTD) || 0;
    
    if (daysPastDue > 0) {
        riskFactors.push(`Currently ${daysPastDue} days past due`);
    }
    
    if (latePaymentsYTD > 3) {
        riskFactors.push("Chronic late payment pattern");
    }
    
    if (servicingData.covenantViolations && servicingData.covenantViolations !== 'None reported') {
        riskFactors.push("Financial covenant violations");
    }
    
    const outstandingBalance = servicingData.outstandingBalance || 0;
    const monthlyPayment = servicingData.monthlyPayment || 1;
    const monthsToMaturity = outstandingBalance / monthlyPayment;
    
    if (monthsToMaturity > 36) {
        riskFactors.push("Extended remaining term");
    }
    
    return {
        riskLevel: daysPastDue >= 60 ? "High" : daysPastDue >= 30 ? "Medium" : "Low",
        riskFactors: riskFactors,
        probabilityOfDefault: calculateProbabilityOfDefault(daysPastDue, latePaymentsYTD),
        recommendedAction: daysPastDue >= 60 ? "Immediate attention" : 
                          daysPastDue >= 30 ? "Enhanced monitoring" : "Routine monitoring"
    };
}

/**
 * 📊 Calculate Probability of Default
 */
function calculateProbabilityOfDefault(daysPastDue, latePaymentsYTD) {
    let baseRate = 2; // Base 2% default rate
    
    if (daysPastDue >= 90) baseRate = 50;
    else if (daysPastDue >= 60) baseRate = 25;
    else if (daysPastDue >= 30) baseRate = 10;
    else if (daysPastDue >= 15) baseRate = 5;
    
    if (latePaymentsYTD > 6) baseRate *= 1.5;
    else if (latePaymentsYTD > 3) baseRate *= 1.2;
    
    return Math.min(100, Math.round(baseRate));
}

/**
 * 📅 Calculate Next Review Date (CONTINUATION)
 */
function calculateNextReviewDate(loanStatus) {
    const today = new Date();
    let daysToAdd;
    
    switch (loanStatus.riskLevel) {
        case 'critical':
            daysToAdd = 1; // Daily review
            break;
        case 'high':
            daysToAdd = 7; // Weekly review
            break;
        case 'medium':
            daysToAdd = 14; // Bi-weekly review
            break;
        case 'low':
        default:
            daysToAdd = 30; // Monthly review
            break;
    }
    
    const nextReviewDate = new Date(today);
    nextReviewDate.setDate(today.getDate() + daysToAdd);
    
    return nextReviewDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

/**
 * 📊 Calculate Total Past Due
 */
function calculateTotalPastDue(portfolioData) {
    return (portfolioData.pastDue30 || 0) + 
           (portfolioData.pastDue60 || 0) + 
           (portfolioData.pastDue90 || 0);
}

/**
 * 🚨 Generate Collection Notices
 */
async function generateCollectionNotice(loanId, noticeType, borrowerData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING - COLLECTION NOTICE GENERATION

NOTICE TYPE: ${noticeType}
LOAN DETAILS:
• Loan ID: ${loanId}
• Borrower: ${borrowerData.borrowerName || 'Not specified'}
• Outstanding Balance: $${borrowerData.outstandingBalance ? borrowerData.outstandingBalance.toLocaleString() : 'Not provided'} USD
• Days Past Due: ${borrowerData.daysPastDue || 'Not specified'}
• Past Due Amount: $${borrowerData.pastDueAmount ? borrowerData.pastDueAmount.toLocaleString() : 'Not provided'} USD
• Late Fees: $${borrowerData.lateFees || 0} USD

COLLECTION NOTICE REQUIREMENTS:

1. **NOTICE FORMATTING**
   - Professional business letter format
   - Clear and direct language
   - Compliant with Cambodia lending regulations
   - Appropriate urgency level for notice type

2. **REQUIRED ELEMENTS**
   - Formal header with fund letterhead
   - Borrower identification and loan reference
   - Clear statement of delinquency amount
   - Payment deadline and consequences
   - Contact information for payment arrangements

3. **LEGAL COMPLIANCE**
   - Cambodia debt collection law compliance
   - Fair debt collection practices
   - Required disclosures and borrower rights
   - Appropriate language and tone

4. **ESCALATION PATHWAY**
   - Clear next steps if payment not received
   - Timeline for escalation actions
   - Legal remedy notifications
   - Asset protection measures

NOTICE TYPES:
• Friendly Reminder: Courteous payment reminder
• Formal Demand: Official payment demand letter
• Default Notice: Formal default declaration
• Legal Notice: Pre-litigation warning

Generate professional collection notice appropriate for ${noticeType} stage.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🚨 Collection Notice Generation",
            forceModel: "gpt-5-mini"
        });

        // Generate notice metadata
        const noticeMetadata = {
            noticeId: `CN-${loanId}-${Date.now()}`,
            loanId: loanId,
            noticeType: noticeType,
            borrowerName: borrowerData.borrowerName,
            generationDate: new Date().toISOString(),
            dueDate: calculateNoticeDueDate(noticeType),
            deliveryMethod: determineDeliveryMethod(noticeType),
            followUpRequired: true,
            escalationDate: calculateEscalationDate(noticeType)
        };

        return {
            notice: result.response,
            metadata: noticeMetadata,
            deliveryInstructions: generateDeliveryInstructions(noticeType),
            followUpActions: generateFollowUpActions(noticeType),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Collection notice generation error:', error.message);
        return {
            notice: `Collection notice generation unavailable: ${error.message}`,
            metadata: { noticeType: noticeType, error: true },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📅 Calculate Notice Due Date
 */
function calculateNoticeDueDate(noticeType) {
    const today = new Date();
    let daysToAdd;
    
    switch (noticeType) {
        case 'Friendly Reminder':
            daysToAdd = 10;
            break;
        case 'Formal Demand':
            daysToAdd = 15;
            break;
        case 'Default Notice':
            daysToAdd = 30;
            break;
        case 'Legal Notice':
            daysToAdd = 10;
            break;
        default:
            daysToAdd = 15;
    }
    
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + daysToAdd);
    
    return dueDate.toISOString().split('T')[0];
}

/**
 * 🎯 Determine Delivery Method
 */
function determineDeliveryMethod(noticeType) {
    switch (noticeType) {
        case 'Friendly Reminder':
            return ['Email', 'Phone Call'];
        case 'Formal Demand':
            return ['Certified Mail', 'Email', 'Hand Delivery'];
        case 'Default Notice':
            return ['Certified Mail', 'Legal Service', 'Hand Delivery'];
        case 'Legal Notice':
            return ['Legal Service', 'Certified Mail', 'Publication if Required'];
        default:
            return ['Email', 'Regular Mail'];
    }
}

/**
 * 📈 Calculate Escalation Date
 */
function calculateEscalationDate(noticeType) {
    const today = new Date();
    let daysToAdd;
    
    switch (noticeType) {
        case 'Friendly Reminder':
            daysToAdd = 15; // Escalate to Formal Demand
            break;
        case 'Formal Demand':
            daysToAdd = 20; // Escalate to Default Notice
            break;
        case 'Default Notice':
            daysToAdd = 35; // Escalate to Legal Action
            break;
        case 'Legal Notice':
            daysToAdd = 15; // Proceed with legal action
            break;
        default:
            daysToAdd = 20;
    }
    
    const escalationDate = new Date(today);
    escalationDate.setDate(today.getDate() + daysToAdd);
    
    return escalationDate.toISOString().split('T')[0];
}

/**
 * 📝 Generate Delivery Instructions
 */
function generateDeliveryInstructions(noticeType) {
    const instructions = {
        preparation: [],
        delivery: [],
        followUp: []
    };
    
    switch (noticeType) {
        case 'Friendly Reminder':
            instructions.preparation.push("Print on company letterhead");
            instructions.delivery.push("Send via email and regular mail");
            instructions.followUp.push("Follow up with phone call in 3 days");
            break;
            
        case 'Formal Demand':
            instructions.preparation.push("Print on company letterhead with signatures");
            instructions.preparation.push("Prepare certified mail receipt");
            instructions.delivery.push("Send via certified mail with return receipt");
            instructions.delivery.push("Email PDF copy simultaneously");
            instructions.followUp.push("Confirm delivery within 5 days");
            break;
            
        case 'Default Notice':
            instructions.preparation.push("Legal review required before sending");
            instructions.preparation.push("Prepare all service documentation");
            instructions.delivery.push("Legal service or certified mail");
            instructions.delivery.push("Document all delivery attempts");
            instructions.followUp.push("Confirm service and prepare next steps");
            break;
            
        case 'Legal Notice':
            instructions.preparation.push("Attorney preparation required");
            instructions.preparation.push("Court filing preparation if needed");
            instructions.delivery.push("Legal service through authorized process server");
            instructions.followUp.push("File proof of service with court");
            break;
    }
    
    return instructions;
}

/**
 * 🔄 Generate Follow Up Actions
 */
function generateFollowUpActions(noticeType) {
    const actions = [];
    
    switch (noticeType) {
        case 'Friendly Reminder':
            actions.push({
                action: "Phone call to borrower",
                timeline: "3 days after notice sent",
                responsibility: "Loan Officer"
            });
            actions.push({
                action: "Email follow-up if no response",
                timeline: "7 days after notice sent",
                responsibility: "Loan Servicer"
            });
            break;
            
        case 'Formal Demand':
            actions.push({
                action: "Confirm receipt of notice",
                timeline: "5 days after sending",
                responsibility: "Collections Team"
            });
            actions.push({
                action: "Schedule payment arrangement meeting",
                timeline: "10 days after notice sent",
                responsibility: "Loan Officer"
            });
            break;
            
        case 'Default Notice':
            actions.push({
                action: "Verify service completion",
                timeline: "3 days after service attempt",
                responsibility: "Collections Manager"
            });
            actions.push({
                action: "Prepare legal action documents",
                timeline: "15 days after service",
                responsibility: "Legal Team"
            });
            break;
            
        case 'Legal Notice':
            actions.push({
                action: "File proof of service",
                timeline: "Immediately after service",
                responsibility: "Legal Team"
            });
            actions.push({
                action: "Initiate legal proceedings",
                timeline: "As specified in notice",
                responsibility: "Legal Counsel"
            });
            break;
    }
    
    return actions;
}

/**
 * 💼 Process Payment Arrangement
 */
async function processPaymentArrangement(loanId, arrangementData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING - PAYMENT ARRANGEMENT PROCESSING

LOAN DETAILS:
• Loan ID: ${loanId}
• Borrower: ${arrangementData.borrowerName || 'Not specified'}
• Current Balance: $${arrangementData.currentBalance ? arrangementData.currentBalance.toLocaleString() : 'Not provided'} USD
• Past Due Amount: $${arrangementData.pastDueAmount ? arrangementData.pastDueAmount.toLocaleString() : 'Not provided'} USD
• Original Monthly Payment: $${arrangementData.originalPayment ? arrangementData.originalPayment.toLocaleString() : 'Not provided'} USD

PROPOSED ARRANGEMENT:
• Arrangement Type: ${arrangementData.arrangementType || 'Not specified'}
• New Payment Amount: $${arrangementData.newPaymentAmount ? arrangementData.newPaymentAmount.toLocaleString() : 'Not provided'} USD
• Payment Frequency: ${arrangementData.paymentFrequency || 'Monthly'}
• Duration: ${arrangementData.duration || 'Not specified'} months
• Catch-up Plan: ${arrangementData.catchUpPlan || 'Not specified'}

BORROWER FINANCIAL SITUATION:
• Monthly Income: $${arrangementData.monthlyIncome ? arrangementData.monthlyIncome.toLocaleString() : 'Not provided'} USD
• Monthly Expenses: $${arrangementData.monthlyExpenses ? arrangementData.monthlyExpenses.toLocaleString() : 'Not provided'} USD
• Available Cash Flow: $${arrangementData.availableCashFlow ? arrangementData.availableCashFlow.toLocaleString() : 'Not calculated'} USD
• Reason for Hardship: ${arrangementData.hardshipReason || 'Not provided'}

PAYMENT ARRANGEMENT ANALYSIS:

1. **ARRANGEMENT FEASIBILITY ASSESSMENT**
   - Borrower's ability to meet proposed payment terms
   - Cash flow sufficiency analysis
   - Sustainability of arrangement over proposed duration
   - Risk of re-default evaluation

2. **FINANCIAL IMPACT ANALYSIS**
   - Impact on loan yield and fund returns
   - Extension of loan term and cash flow implications
   - Comparison with foreclosure/charge-off alternatives
   - Net present value analysis of arrangement

3. **RISK MITIGATION MEASURES**
   - Additional collateral or guarantees required
   - Monitoring and reporting requirements
   - Performance milestones and triggers
   - Modification terms and conditions

4. **LEGAL AND REGULATORY COMPLIANCE**
   - Cambodia lending law compliance for modifications
   - Required documentation and approvals
   - Borrower disclosure requirements
   - Impact on loan classification and provisioning

5. **RECOMMENDATION AND TERMS**
   - Approval recommendation with supporting rationale
   - Suggested modification terms and conditions
   - Implementation timeline and requirements
   - Monitoring and review schedule

CAMBODIA CONSIDERATIONS:
• Local economic conditions affecting borrower
• Cultural factors in payment arrangement discussions
• Legal requirements for loan modifications
• Impact on relationship and future lending opportunities

Provide comprehensive payment arrangement analysis with recommendation.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "💼 Payment Arrangement Analysis",
            forceModel: "gpt-5"
        });

        // Analyze arrangement feasibility
        const feasibilityAnalysis = analyzeFeasibility(arrangementData);
        const financialImpact = calculateFinancialImpact(arrangementData);
        const recommendation = generateArrangementRecommendation(feasibilityAnalysis, financialImpact);

        return {
            analysis: result.response,
            loanId: loanId,
            arrangementSummary: {
                type: arrangementData.arrangementType,
                newPayment: arrangementData.newPaymentAmount,
                duration: arrangementData.duration,
                feasibilityScore: feasibilityAnalysis.score
            },
            feasibilityAnalysis: feasibilityAnalysis,
            financialImpact: financialImpact,
            recommendation: recommendation,
            requiredDocuments: generateRequiredDocuments(),
            monitoringPlan: generateMonitoringPlan(arrangementData),
            processingDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Payment arrangement processing error:', error.message);
        return {
            analysis: `Payment arrangement analysis unavailable: ${error.message}`,
            loanId: loanId,
            recommendation: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Analyze Arrangement Feasibility
 */
function analyzeFeasibility(arrangementData) {
    const monthlyIncome = arrangementData.monthlyIncome || 0;
    const monthlyExpenses = arrangementData.monthlyExpenses || 0;
    const newPayment = arrangementData.newPaymentAmount || 0;
    const availableCashFlow = monthlyIncome - monthlyExpenses;
    
    const paymentToIncomeRatio = monthlyIncome > 0 ? (newPayment / monthlyIncome) * 100 : 100;
    const paymentToCashFlowRatio = availableCashFlow > 0 ? (newPayment / availableCashFlow) * 100 : 100;
    
    let score = 0;
    let riskFactors = [];
    let positiveFactors = [];
    
    // Score based on payment ratios
    if (paymentToIncomeRatio <= 25) {
        score += 25;
        positiveFactors.push("Payment-to-income ratio acceptable");
    } else if (paymentToIncomeRatio <= 35) {
        score += 15;
        positiveFactors.push("Payment-to-income ratio manageable");
    } else {
        riskFactors.push("High payment-to-income ratio");
    }
    
    if (paymentToCashFlowRatio <= 60) {
        score += 25;
        positiveFactors.push("Sufficient cash flow coverage");
    } else if (paymentToCashFlowRatio <= 80) {
        score += 15;
    } else {
        riskFactors.push("Tight cash flow coverage");
    }
    
    // Score based on arrangement type
    if (arrangementData.arrangementType === "Payment Reduction") {
        score += 20;
    } else if (arrangementData.arrangementType === "Term Extension") {
        score += 15;
    } else if (arrangementData.arrangementType === "Interest Rate Reduction") {
        score += 10;
    }
    
    // Score based on duration
    const duration = parseInt(arrangementData.duration) || 0;
    if (duration <= 6) {
        score += 15;
        positiveFactors.push("Short-term arrangement");
    } else if (duration <= 12) {
        score += 10;
    } else {
        riskFactors.push("Extended arrangement period");
    }
    
    // Score based on hardship reason
    if (arrangementData.hardshipReason && arrangementData.hardshipReason.toLowerCase().includes('temporary')) {
        score += 15;
        positiveFactors.push("Temporary hardship identified");
    }
    
    return {
        score: score,
        feasibilityLevel: score >= 70 ? "High" : score >= 50 ? "Medium" : "Low",
        paymentToIncomeRatio: paymentToIncomeRatio.toFixed(1) + "%",
        paymentToCashFlowRatio: paymentToCashFlowRatio.toFixed(1) + "%",
        availableCashFlow: availableCashFlow,
        riskFactors: riskFactors,
        positiveFactors: positiveFactors
    };
}

/**
 * 💰 Calculate Financial Impact
 */
function calculateFinancialImpact(arrangementData) {
    const originalPayment = arrangementData.originalPayment || 0;
    const newPayment = arrangementData.newPaymentAmount || 0;
    const duration = parseInt(arrangementData.duration) || 12;
    const currentBalance = arrangementData.currentBalance || 0;
    
    const monthlyReduction = originalPayment - newPayment;
    const totalReduction = monthlyReduction * duration;
    const reductionPercentage = originalPayment > 0 ? (monthlyReduction / originalPayment) * 100 : 0;
    
    // Estimate impact on loan term (simplified)
    const estimatedTermExtension = totalReduction > 0 ? Math.ceil(totalReduction / newPayment) : 0;
    
    // Calculate NPV impact (simplified at 12% discount rate)
    const discountRate = 0.12 / 12; // Monthly rate
    let npvImpact = 0;
    for (let i = 1; i <= duration; i++) {
        npvImpact += monthlyReduction / Math.pow(1 + discountRate, i);
    }
    
    return {
        monthlyPaymentReduction: monthlyReduction,
        totalPaymentReduction: totalReduction,
        reductionPercentage: reductionPercentage.toFixed(1) + "%",
        estimatedTermExtension: estimatedTermExtension + " months",
        npvImpact: Math.round(npvImpact),
        yieldImpact: calculateYieldImpact(reductionPercentage, duration),
        recoveryComparison: compareWithRecoveryAlternatives(currentBalance, newPayment)
    };
}

/**
 * 📈 Calculate Yield Impact
 */
function calculateYieldImpact(reductionPercentage, duration) {
    const baseYield = 18; // Assumed base yield
    const impactFactor = (parseFloat(reductionPercentage) / 100) * (duration / 12);
    const newYield = baseYield * (1 - impactFactor);
    
    return {
        originalYield: baseYield.toFixed(1) + "%",
        projectedYield: newYield.toFixed(1) + "%",
        yieldReduction: (baseYield - newYield).toFixed(1) + "%"
    };
}

/**
 * ⚖️ Compare with Recovery Alternatives
 */
function compareWithRecoveryAlternatives(currentBalance, newPayment) {
    const foreclosureRecovery = currentBalance * 0.70; // Assume 70% recovery
    const chargeOffRecovery = currentBalance * 0.20; // Assume 20% recovery
    
    const arrangementProjection = newPayment * 12; // 1 year projection
    
    return {
        foreclosureRecovery: Math.round(foreclosureRecovery),
        chargeOffRecovery: Math.round(chargeOffRecovery),
        arrangementProjection: Math.round(arrangementProjection),
        bestAlternative: arrangementProjection > foreclosureRecovery ? "Payment Arrangement" : "Foreclosure"
    };
}

/**
 * 🎯 Generate Arrangement Recommendation
 */
function generateArrangementRecommendation(feasibilityAnalysis, financialImpact) {
    const recommendation = {
        approved: false,
        conditions: [],
        reasoning: [],
        alternatives: []
    };
    
    if (feasibilityAnalysis.feasibilityLevel === "High" && 
        parseFloat(financialImpact.reductionPercentage) < 30) {
        recommendation.approved = true;
        recommendation.reasoning.push("High feasibility score and manageable financial impact");
        
        if (feasibilityAnalysis.riskFactors.length > 0) {
            recommendation.conditions.push("Address identified risk factors");
            recommendation.conditions.push("Enhanced monitoring required");
        }
        
    } else if (feasibilityAnalysis.feasibilityLevel === "Medium") {
        recommendation.approved = true;
        recommendation.conditions.push("Require additional collateral or guarantee");
        recommendation.conditions.push("Monthly financial reporting");
        recommendation.conditions.push("Quarterly performance review");
        recommendation.reasoning.push("Medium feasibility requires enhanced risk mitigation");
        
    } else {
        recommendation.approved = false;
        recommendation.reasoning.push("Low feasibility score indicates high re-default risk");
        recommendation.alternatives.push("Short-term forbearance with full catch-up plan");
        recommendation.alternatives.push("Asset liquidation to reduce principal");
        recommendation.alternatives.push("Third-party workout specialist engagement");
    }
    
    return recommendation;
}

/**
 * 📋 Generate Required Documents
 */
function generateRequiredDocuments() {
    return [
        "Completed hardship affidavit",
        "Current financial statements (personal or business)",
        "Proof of income documentation",
        "Bank statements (3 months)",
        "Modification agreement (if approved)",
        "Updated promissory note",
        "Revised payment schedule",
        "Guarantor consent (if applicable)"
    ];
}

/**
 * 📊 Generate Monitoring Plan
 */
function generateMonitoringPlan(arrangementData) {
    const duration = parseInt(arrangementData.duration) || 12;
    
    return {
        frequency: duration <= 6 ? "Monthly" : "Bi-monthly",
        requirements: [
            "Payment performance tracking",
            "Financial condition monitoring", 
            "Covenant compliance verification",
            "Communication log maintenance"
        ],
        milestones: [
            {
                month: Math.ceil(duration / 4),
                action: "First quarter performance review"
            },
            {
                month: Math.ceil(duration / 2), 
                action: "Mid-term arrangement assessment"
            },
            {
                month: duration,
                action: "Arrangement completion and return to regular terms"
            }
        ],
        escalationTriggers: [
            "Missed payment under arrangement",
            "Deteriorating financial condition",
            "Covenant violation",
            "Communication breakdown"
        ]
    };
}

// 📊 EXPORT FUNCTIONS
module.exports = {
    // Portfolio monitoring
    monitorPortfolioPerformance,
    calculatePortfolioMetrics,
    analyzePortfolioRisk,
    generatePortfolioRecommendations,
    generatePortfolioBenchmarks,
    
    // Individual loan servicing
    processLoanServicing,
    determineLoanStatus,
    generateServicingActions,
    assessIndividualLoanRisk,
    calculateProbabilityOfDefault,
    calculateNextReviewDate,
    
    // Collection management
    generateCollectionNotice,
    calculateNoticeDueDate,
    determineDeliveryMethod,
    generateDeliveryInstructions,
    generateFollowUpActions,
    
    // Payment arrangements
    processPaymentArrangement,
    analyzeFeasibility,
    calculateFinancialImpact,
    generateArrangementRecommendation,
    generateRequiredDocuments,
    generateMonitoringPlan,
    
    // Utility functions
    calculateTotalPastDue,
    assessConcentrationRisk,
    assessQualityTrend,
    calculatePerformanceGrade,
    
    // Framework constants
    LOAN_SERVICING_FRAMEWORK
};

// 🏁 END OF CAMBODIA LOAN SERVICING SYSTEM
