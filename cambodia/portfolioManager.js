// cambodia/portfolioManager.js - COMPLETE Portfolio Management System for Cambodia Fund
// Professional fund portfolio tracking, performance monitoring, and risk management

const { executeDualCommand } = require('../utils/dualCommandSystem');

// 📊 PORTFOLIO CONFIGURATION
const PORTFOLIO_CONFIG = {
    // Deal statuses
    DEAL_STATUS: {
        PIPELINE: 'Pipeline',
        APPROVED: 'Approved',
        FUNDED: 'Funded',
        PERFORMING: 'Performing',
        PAST_DUE: 'Past Due',
        DEFAULT: 'Default',
        COMPLETED: 'Completed',
        WRITTEN_OFF: 'Written Off'
    },
    
    // Performance thresholds
    PERFORMANCE: {
        EXCELLENT: 18,      // 18%+ returns
        GOOD: 15,           // 15-18% returns
        SATISFACTORY: 12,   // 12-15% returns
        POOR: 10,           // 10-12% returns
        UNACCEPTABLE: 0     // <10% returns
    },
    
    // Risk levels
    RISK_LEVELS: {
        LOW: 'Low Risk',
        MEDIUM: 'Medium Risk',
        HIGH: 'High Risk',
        CRITICAL: 'Critical Risk'
    },
    
    // Concentration limits
    CONCENTRATION_LIMITS: {
        SINGLE_DEAL: 0.15,      // Max 15% in single deal
        SINGLE_BORROWER: 0.20,  // Max 20% to single borrower
        SINGLE_AREA: 0.30,      // Max 30% in single area
        DEVELOPMENT_DEALS: 0.25 // Max 25% in development deals
    },
    
    // Fund targets
    FUND_TARGETS: {
        TARGET_RETURN: 16,      // 16% target return
        MAX_DEALS: 50,          // Maximum 50 active deals
        MIN_DIVERSIFICATION: 10, // Minimum 10 deals for diversification
        CASH_RESERVE: 0.10      // 10% cash reserve
    }
};

// 📈 PORTFOLIO DATABASE - In production, use proper database
let PORTFOLIO_DATABASE = {
    deals: [],
    fundMetrics: {
        totalAUM: 0,
        totalCommitted: 0,
        totalDeployed: 0,
        availableCash: 0,
        totalReturns: 0,
        avgReturn: 0,
        activeDeals: 0,
        completedDeals: 0
    },
    performanceHistory: [],
    riskMetrics: {
        currentRisk: 'MEDIUM',
        concentrationRisks: [],
        creditRisk: 0,
        marketRisk: 0
    }
};

// 📊 PORTFOLIO MANAGEMENT FUNCTIONS

/**
 * 📈 Add new deal to portfolio
 */
async function addDealToPortfolio(dealData) {
    try {
        console.log('📈 Adding deal to portfolio...');
        
        const newDeal = {
            dealId: dealData.dealId || generateDealId(),
            addedDate: new Date().toISOString(),
            status: PORTFOLIO_CONFIG.DEAL_STATUS.PIPELINE,
            
            // Deal information
            dealInfo: {
                propertyType: dealData.propertyType,
                location: dealData.location,
                borrowerName: dealData.borrowerName,
                borrowerType: dealData.borrowerType || 'Local Developer',
                propertyValue: dealData.propertyValue,
                loanAmount: dealData.loanAmount,
                interestRate: dealData.interestRate,
                loanTerm: dealData.loanTerm,
                ltv: dealData.ltv,
                purpose: dealData.purpose
            },
            
            // Financial tracking
            financial: {
                principalOutstanding: dealData.loanAmount,
                interestAccrued: 0,
                paymentsReceived: 0,
                expectedReturn: (dealData.loanAmount * dealData.interestRate * dealData.loanTerm) / (100 * 12),
                actualReturn: 0,
                netReturn: 0,
                roi: 0
            },
            
            // Risk assessment
            risk: {
                riskScore: dealData.riskScore || 50,
                riskLevel: calculateRiskLevel(dealData.riskScore || 50),
                riskFactors: dealData.riskFactors || [],
                mitigationMeasures: dealData.mitigationMeasures || []
            },
            
            // LP participation
            lpParticipation: dealData.lpParticipation || [],
            totalLPCommitment: dealData.lpParticipation?.reduce((sum, lp) => sum + lp.amount, 0) || 0,
            
            // Timeline tracking
            timeline: {
                approvalDate: null,
                fundingDate: null,
                maturityDate: null,
                completionDate: null,
                daysActive: 0
            },
            
            // Payment history
            payments: [],
            
            // Performance metrics
            performance: {
                currentYield: 0,
                totalReturn: 0,
                daysOverdue: 0,
                paymentStatus: 'current',
                performanceRating: 'new'
            },
            
            // Notes and updates
            notes: []
        };
        
        PORTFOLIO_DATABASE.deals.push(newDeal);
        console.log(`✅ Deal added to portfolio: ${newDeal.dealId}`);
        
        // Update fund metrics
        await updateFundMetrics();
        
        // Generate AI-powered deal analysis
        const dealAnalysis = await analyzeDealForPortfolio(newDeal);
        
        return {
            success: true,
            dealId: newDeal.dealId,
            deal: newDeal,
            dealAnalysis: dealAnalysis,
            portfolioImpact: await calculatePortfolioImpact(newDeal)
        };
        
    } catch (error) {
        console.error('❌ Add deal to portfolio failed:', error.message);
        throw new Error(`Failed to add deal to portfolio: ${error.message}`);
    }
}

/**
 * 🔍 Analyze deal impact on portfolio
 */
async function analyzeDealForPortfolio(deal) {
    try {
        const portfolioMetrics = await calculateDetailedPortfolioMetrics();
        
        const analysisPrompt = `PORTFOLIO IMPACT ANALYSIS FOR NEW DEAL

DEAL DETAILS:
- Deal ID: ${deal.dealId}
- Property Type: ${deal.dealInfo.propertyType}
- Location: ${deal.dealInfo.location}
- Loan Amount: ${deal.dealInfo.loanAmount?.toLocaleString()}
- Interest Rate: ${deal.dealInfo.interestRate}%
- LTV: ${deal.dealInfo.ltv}%
- Risk Score: ${deal.risk.riskScore}/100

CURRENT PORTFOLIO:
- Total AUM: ${portfolioMetrics.totalAUM?.toLocaleString()}
- Active Deals: ${portfolioMetrics.activeDeals}
- Average Return: ${portfolioMetrics.avgReturn?.toFixed(2)}%
- Risk Level: ${portfolioMetrics.riskLevel}
- Concentration Risks: ${portfolioMetrics.concentrationRisks?.length || 0}

ANALYSIS REQUIREMENTS:
1. PORTFOLIO DIVERSIFICATION IMPACT
   - Geographic diversification effect
   - Property type diversification
   - Risk profile diversification
   - LP base diversification

2. CONCENTRATION RISK ANALYSIS
   - Single deal concentration impact
   - Borrower concentration assessment
   - Geographic concentration review
   - Asset type concentration evaluation

3. RISK-ADJUSTED RETURN IMPACT
   - Portfolio risk profile change
   - Expected return impact
   - Risk-adjusted metrics
   - Volatility considerations

4. LIQUIDITY AND CASH FLOW IMPACT
   - Cash deployment efficiency
   - Payment schedule alignment
   - Liquidity risk assessment
   - Cash flow timing analysis

5. STRATEGIC RECOMMENDATIONS
   - Deal approval recommendation
   - Optimal sizing suggestions
   - Risk mitigation requirements
   - Portfolio optimization opportunities

Provide comprehensive analysis with specific recommendations for portfolio management.`;

        const result = await executeSpeedOptimizedGPT5(analysisPrompt);
        
        return {
            analysisId: generateAnalysisId(),
            dealId: deal.dealId,
            analysisDate: new Date().toISOString(),
            analysis: result.response,
            aiModel: result.config.model,
            responseTime: result.responseTime,
            recommendations: extractKeyRecommendations(result.response)
        };
        
    } catch (error) {
        console.error('❌ Deal portfolio analysis failed:', error.message);
        return { error: error.message };
    }
}

/**
 * 📊 Generate comprehensive portfolio report
 */
async function generatePortfolioReport(reportType = 'comprehensive') {
    try {
        console.log(`📊 Generating ${reportType} portfolio report...`);
        
        const portfolioMetrics = await calculateDetailedPortfolioMetrics();
        const performanceAnalysis = await analyzePortfolioPerformance();
        const riskAnalysis = await analyzePortfolioRisk();
        
        let reportPrompt = '';
        
        switch (reportType) {
            case 'comprehensive':
                reportPrompt = `COMPREHENSIVE PORTFOLIO PERFORMANCE REPORT

PORTFOLIO OVERVIEW:
- Total AUM: ${portfolioMetrics.totalAUM?.toLocaleString()}
- Total Deployed: ${portfolioMetrics.totalDeployed?.toLocaleString()}
- Available Cash: ${portfolioMetrics.availableCash?.toLocaleString()}
- Active Deals: ${portfolioMetrics.activeDeals}
- Completed Deals: ${portfolioMetrics.completedDeals}

PERFORMANCE METRICS:
- Average Return: ${portfolioMetrics.avgReturn?.toFixed(2)}%
- Total Returns Generated: ${portfolioMetrics.totalReturns?.toLocaleString()}
- Net IRR: ${performanceAnalysis.netIRR?.toFixed(2)}%
- Risk-Adjusted Return: ${performanceAnalysis.riskAdjustedReturn?.toFixed(2)}%

RISK ANALYSIS:
- Portfolio Risk Level: ${riskAnalysis.portfolioRisk}
- Credit Risk Score: ${riskAnalysis.creditRisk}/100
- Concentration Risks: ${riskAnalysis.concentrationRisks?.length}
- Past Due Amount: ${riskAnalysis.pastDueAmount?.toLocaleString()}

DIVERSIFICATION:
- Geographic Distribution: ${portfolioMetrics.geoDistribution}
- Property Type Mix: ${portfolioMetrics.propertyTypeMix}
- Borrower Concentration: ${portfolioMetrics.borrowerConcentration}

Generate comprehensive portfolio report including:
1. Executive summary with key highlights
2. Performance analysis vs targets and benchmarks
3. Risk assessment and mitigation strategies
4. Diversification analysis and recommendations
5. Cash flow analysis and projections
6. Market outlook and strategic considerations
7. Action items and portfolio optimization opportunities

Focus on professional institutional-quality analysis.`;
                break;
                
            case 'performance':
                reportPrompt = `PORTFOLIO PERFORMANCE REPORT

PERFORMANCE METRICS:
${JSON.stringify(performanceAnalysis, null, 2)}

BENCHMARK COMPARISON:
- Target Return: ${PORTFOLIO_CONFIG.FUND_TARGETS.TARGET_RETURN}%
- Actual Return: ${portfolioMetrics.avgReturn?.toFixed(2)}%
- Performance vs Target: ${((portfolioMetrics.avgReturn / PORTFOLIO_CONFIG.FUND_TARGETS.TARGET_RETURN) * 100 - 100)?.toFixed(1)}%

Generate focused performance report with analysis and recommendations.`;
                break;
                
            case 'risk':
                reportPrompt = `PORTFOLIO RISK ANALYSIS REPORT

RISK METRICS:
${JSON.stringify(riskAnalysis, null, 2)}

CONCENTRATION ANALYSIS:
${JSON.stringify(portfolioMetrics.concentrationAnalysis, null, 2)}

Generate detailed risk assessment with mitigation strategies.`;
                break;
        }
        
        const result = await executeSpeedOptimizedGPT5(reportPrompt);
        
        return {
            reportId: generateReportId(),
            reportType: reportType,
            reportDate: new Date().toISOString(),
            portfolioMetrics: portfolioMetrics,
            performanceAnalysis: performanceAnalysis,
            riskAnalysis: riskAnalysis,
            report: result.response,
            aiModel: result.config.model,
            responseTime: result.responseTime
        };
        
    } catch (error) {
        console.error('❌ Portfolio report generation failed:', error.message);
        throw new Error(`Portfolio report failed: ${error.message}`);
    }
}

/**
 * ⚠️ Monitor portfolio risks
 */
async function monitorPortfolioRisks() {
    try {
        console.log('⚠️ Monitoring portfolio risks...');
        
        const risks = [];
        const portfolioMetrics = await calculateDetailedPortfolioMetrics();
        
        // Check concentration limits
        const concentrationRisks = checkConcentrationLimits(portfolioMetrics);
        risks.push(...concentrationRisks);
        
        // Check performance issues
        const performanceRisks = checkPerformanceRisks();
        risks.push(...performanceRisks);
        
        // Check credit risks
        const creditRisks = checkCreditRisks();
        risks.push(...creditRisks);
        
        // Check liquidity risks
        const liquidityRisks = checkLiquidityRisks(portfolioMetrics);
        risks.push(...liquidityRisks);
        
        // Generate AI-powered risk analysis
        if (risks.length > 0) {
            const riskAnalysis = await generateRiskAnalysis(risks);
            
            return {
                riskId: generateRiskId(),
                monitoringDate: new Date().toISOString(),
                totalRisks: risks.length,
                criticalRisks: risks.filter(r => r.severity === 'CRITICAL').length,
                highRisks: risks.filter(r => r.severity === 'HIGH').length,
                mediumRisks: risks.filter(r => r.severity === 'MEDIUM').length,
                risks: risks,
                riskAnalysis: riskAnalysis,
                recommendedActions: extractRiskActions(riskAnalysis.analysis)
            };
        }
        
        return {
            riskId: generateRiskId(),
            monitoringDate: new Date().toISOString(),
            totalRisks: 0,
            status: 'All clear - no significant risks detected',
            portfolioHealth: 'HEALTHY'
        };
        
    } catch (error) {
        console.error('❌ Risk monitoring failed:', error.message);
        throw new Error(`Risk monitoring failed: ${error.message}`);
    }
}

/**
 * 💰 Update deal payment
 */
function updateDealPayment(dealId, paymentData) {
    try {
        const deal = PORTFOLIO_DATABASE.deals.find(d => d.dealId === dealId);
        if (!deal) {
            throw new Error('Deal not found');
        }
        
        const payment = {
            paymentId: generatePaymentId(),
            date: paymentData.date || new Date().toISOString(),
            amount: paymentData.amount,
            principal: paymentData.principal || 0,
            interest: paymentData.interest || paymentData.amount,
            type: paymentData.type || 'interest',
            status: 'received'
        };
        
        // Update deal financials
        deal.payments.push(payment);
        deal.financial.paymentsReceived += paymentData.amount;
        deal.financial.principalOutstanding -= payment.principal;
        deal.financial.actualReturn += payment.interest;
        deal.financial.netReturn = deal.financial.actualReturn - deal.financial.paymentsReceived;
        deal.financial.roi = (deal.financial.actualReturn / deal.dealInfo.loanAmount) * 100;
        
        // Update performance metrics
        deal.performance.currentYield = (deal.financial.actualReturn / deal.dealInfo.loanAmount) * 100;
        deal.performance.paymentStatus = 'current';
        deal.performance.daysOverdue = 0;
        
        // Update last contact
        deal.notes.push({
            date: new Date().toISOString(),
            type: 'payment',
            note: `Payment received: ${paymentData.amount.toLocaleString()} (${payment.type})`
        });
        
        // Update fund metrics
        updateFundMetrics();
        
        console.log(`✅ Payment updated: ${dealId} - ${paymentData.amount.toLocaleString()}`);
        
        return {
            success: true,
            paymentId: payment.paymentId,
            dealUpdated: deal,
            newBalance: deal.financial.principalOutstanding
        };
        
    } catch (error) {
        console.error('❌ Payment update failed:', error.message);
        throw new Error(`Payment update failed: ${error.message}`);
    }
}

/**
 * 📈 Calculate detailed portfolio metrics
 */
async function calculateDetailedPortfolioMetrics() {
    const activeDeals = PORTFOLIO_DATABASE.deals.filter(d => 
        d.status === PORTFOLIO_CONFIG.DEAL_STATUS.PERFORMING ||
        d.status === PORTFOLIO_CONFIG.DEAL_STATUS.FUNDED
    );
    
    const completedDeals = PORTFOLIO_DATABASE.deals.filter(d => 
        d.status === PORTFOLIO_CONFIG.DEAL_STATUS.COMPLETED
    );
    
    // Basic metrics
    const totalAUM = PORTFOLIO_DATABASE.deals.reduce((sum, deal) => sum + deal.dealInfo.loanAmount, 0);
    const totalDeployed = activeDeals.reduce((sum, deal) => sum + deal.dealInfo.loanAmount, 0);
    const totalReturns = PORTFOLIO_DATABASE.deals.reduce((sum, deal) => sum + deal.financial.actualReturn, 0);
    
    // Performance calculations
    const avgReturn = activeDeals.length > 0 ? 
        activeDeals.reduce((sum, deal) => sum + deal.dealInfo.interestRate, 0) / activeDeals.length : 0;
    
    // Geographic distribution
    const geoDistribution = {};
    PORTFOLIO_DATABASE.deals.forEach(deal => {
        const location = deal.dealInfo.location;
        geoDistribution[location] = (geoDistribution[location] || 0) + deal.dealInfo.loanAmount;
    });
    
    // Property type distribution
    const propertyTypeMix = {};
    PORTFOLIO_DATABASE.deals.forEach(deal => {
        const type = deal.dealInfo.propertyType;
        propertyTypeMix[type] = (propertyTypeMix[type] || 0) + deal.dealInfo.loanAmount;
    });
    
    // Borrower concentration
    const borrowerConcentration = {};
    PORTFOLIO_DATABASE.deals.forEach(deal => {
        const borrower = deal.dealInfo.borrowerName;
        borrowerConcentration[borrower] = (borrowerConcentration[borrower] || 0) + deal.dealInfo.loanAmount;
    });
    
    // Risk distribution
    const riskDistribution = {
        low: PORTFOLIO_DATABASE.deals.filter(d => d.risk.riskScore < 40).length,
        medium: PORTFOLIO_DATABASE.deals.filter(d => d.risk.riskScore >= 40 && d.risk.riskScore < 70).length,
        high: PORTFOLIO_DATABASE.deals.filter(d => d.risk.riskScore >= 70).length
    };
    
    return {
        totalAUM,
        totalDeployed,
        availableCash: totalAUM - totalDeployed,
        totalReturns,
        avgReturn,
        activeDeals: activeDeals.length,
        completedDeals: completedDeals.length,
        geoDistribution,
        propertyTypeMix,
        borrowerConcentration,
        riskDistribution,
        concentrationAnalysis: analyzeConcentrations(geoDistribution, propertyTypeMix, borrowerConcentration, totalAUM)
    };
}

/**
 * 📊 Analyze portfolio performance
 */
async function analyzePortfolioPerformance() {
    const deals = PORTFOLIO_DATABASE.deals;
    const activeDeals = deals.filter(d => d.status === PORTFOLIO_CONFIG.DEAL_STATUS.PERFORMING);
    
    // Calculate performance metrics
    const totalInvested = deals.reduce((sum, deal) => sum + deal.dealInfo.loanAmount, 0);
    const totalReturns = deals.reduce((sum, deal) => sum + deal.financial.actualReturn, 0);
    
    // IRR calculation (simplified)
    const netIRR = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
    
    // Risk-adjusted return
    const avgRiskScore = deals.length > 0 ? 
        deals.reduce((sum, deal) => sum + deal.risk.riskScore, 0) / deals.length : 50;
    const riskAdjustment = 1 - (avgRiskScore / 200); // Adjust for risk
    const riskAdjustedReturn = netIRR * riskAdjustment;
    
    // Performance vs targets
    const targetAchievement = (netIRR / PORTFOLIO_CONFIG.FUND_TARGETS.TARGET_RETURN) * 100;
    
    return {
        netIRR,
        riskAdjustedReturn,
        targetAchievement,
        totalInvested,
        totalReturns,
        avgRiskScore,
        performanceRating: getPerformanceRating(netIRR)
    };
}

/**
 * ⚠️ Analyze portfolio risk
 */
async function analyzePortfolioRisk() {
    const deals = PORTFOLIO_DATABASE.deals;
    
    // Credit risk
    const pastDueDeals = deals.filter(d => d.status === PORTFOLIO_CONFIG.DEAL_STATUS.PAST_DUE);
    const pastDueAmount = pastDueDeals.reduce((sum, deal) => sum + deal.financial.principalOutstanding, 0);
    const creditRisk = (pastDueAmount / PORTFOLIO_DATABASE.fundMetrics.totalDeployed) * 100;
    
    // Concentration risks
    const concentrationRisks = [];
    
    // Check single deal concentration
    deals.forEach(deal => {
        const concentration = (deal.dealInfo.loanAmount / PORTFOLIO_DATABASE.fundMetrics.totalAUM) * 100;
        if (concentration > PORTFOLIO_CONFIG.CONCENTRATION_LIMITS.SINGLE_DEAL * 100) {
            concentrationRisks.push({
                type: 'Single Deal',
                dealId: deal.dealId,
                concentration: concentration.toFixed(1) + '%',
                limit: (PORTFOLIO_CONFIG.CONCENTRATION_LIMITS.SINGLE_DEAL * 100) + '%'
            });
        }
    });
    
    // Overall portfolio risk
    const avgRiskScore = deals.length > 0 ? 
        deals.reduce((sum, deal) => sum + deal.risk.riskScore, 0) / deals.length : 0;
    
    const portfolioRisk = avgRiskScore < 40 ? 'LOW' : 
                         avgRiskScore < 70 ? 'MEDIUM' : 'HIGH';
    
    return {
        portfolioRisk,
        creditRisk: Math.round(creditRisk),
        pastDueAmount,
        concentrationRisks,
        avgRiskScore: Math.round(avgRiskScore)
    };
}

// 🔧 UTILITY FUNCTIONS

function generateDealId() {
    return `DEAL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function generateAnalysisId() {
    return `ANALYSIS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function generateReportId() {
    return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function generateRiskId() {
    return `RISK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function generatePaymentId() {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function calculateRiskLevel(riskScore) {
    if (riskScore < 30) return PORTFOLIO_CONFIG.RISK_LEVELS.LOW;
    if (riskScore < 60) return PORTFOLIO_CONFIG.RISK_LEVELS.MEDIUM;
    if (riskScore < 80) return PORTFOLIO_CONFIG.RISK_LEVELS.HIGH;
    return PORTFOLIO_CONFIG.RISK_LEVELS.CRITICAL;
}

function getPerformanceRating(return_rate) {
    if (return_rate >= PORTFOLIO_CONFIG.PERFORMANCE.EXCELLENT) return 'EXCELLENT';
    if (return_rate >= PORTFOLIO_CONFIG.PERFORMANCE.GOOD) return 'GOOD';
    if (return_rate >= PORTFOLIO_CONFIG.PERFORMANCE.SATISFACTORY) return 'SATISFACTORY';
    if (return_rate >= PORTFOLIO_CONFIG.PERFORMANCE.POOR) return 'POOR';
    return 'UNACCEPTABLE';
}

function analyzeConcentrations(geo, propertyType, borrower, totalAUM) {
    const analysis = {
        geographical: Object.entries(geo).map(([location, amount]) => ({
            location,
            amount,
            percentage: ((amount / totalAUM) * 100).toFixed(1) + '%'
        })).sort((a, b) => b.amount - a.amount),
        
        propertyTypes: Object.entries(propertyType).map(([type, amount]) => ({
            type,
            amount,
            percentage: ((amount / totalAUM) * 100).toFixed(1) + '%'
        })).sort((a, b) => b.amount - a.amount),
        
        borrowers: Object.entries(borrower).map(([name, amount]) => ({
            borrower: name,
            amount,
            percentage: ((amount / totalAUM) * 100).toFixed(1) + '%'
        })).sort((a, b) => b.amount - a.amount)
    };
    
    return analysis;
}

function checkConcentrationLimits(metrics) {
    const risks = [];
    
    // Check borrower concentration
    Object.entries(metrics.borrowerConcentration).forEach(([borrower, amount]) => {
        const concentration = amount / metrics.totalAUM;
        if (concentration > PORTFOLIO_CONFIG.CONCENTRATION_LIMITS.SINGLE_BORROWER) {
            risks.push({
                type: 'CONCENTRATION',
                severity: 'HIGH',
                description: `Borrower concentration: ${borrower} (${(concentration * 100).toFixed(1)}%)`,
                limit: (PORTFOLIO_CONFIG.CONCENTRATION_LIMITS.SINGLE_BORROWER * 100) + '%',
                current: (concentration * 100).toFixed(1) + '%'
            });
        }
    });
    
    return risks;
}

function checkPerformanceRisks() {
    const risks = [];
    
    PORTFOLIO_DATABASE.deals.forEach(deal => {
        if (deal.status === PORTFOLIO_CONFIG.DEAL_STATUS.PAST_DUE) {
            risks.push({
                type: 'PERFORMANCE',
                severity: 'CRITICAL',
                description: `Deal ${deal.dealId} is past due`,
                dealId: deal.dealId,
                amount: deal.financial.principalOutstanding
            });
        }
        
        if (deal.performance.currentYield < PORTFOLIO_CONFIG.PERFORMANCE.POOR) {
            risks.push({
                type: 'PERFORMANCE', 
                severity: 'MEDIUM',
                description: `Deal ${deal.dealId} underperforming (${deal.performance.currentYield.toFixed(1)}%)`,
                dealId: deal.dealId,
                expectedReturn: deal.dealInfo.interestRate,
                actualReturn: deal.performance.currentYield
            });
        }
    });
    
    return risks;
}

function checkCreditRisks() {
    const risks = [];
    
    PORTFOLIO_DATABASE.deals.forEach(deal => {
        if (deal.risk.riskScore > 80) {
            risks.push({
                type: 'CREDIT',
                severity: 'HIGH',
                description: `High credit risk: Deal ${deal.dealId} (Risk Score: ${deal.risk.riskScore})`,
                dealId: deal.dealId,
                riskScore: deal.risk.riskScore,
                riskFactors: deal.risk.riskFactors
            });
        }
    });
    
    return risks;
}

function checkLiquidityRisks(metrics) {
    const risks = [];
    
    const cashRatio = metrics.availableCash / metrics.totalAUM;
    if (cashRatio < PORTFOLIO_CONFIG.FUND_TARGETS.CASH_RESERVE) {
        risks.push({
            type: 'LIQUIDITY',
            severity: 'MEDIUM',
            description: `Low cash reserves (${(cashRatio * 100).toFixed(1)}%)`,
            target: (PORTFOLIO_CONFIG.FUND_TARGETS.CASH_RESERVE * 100) + '%',
            current: (cashRatio * 100).toFixed(1) + '%'
        });
    }
    
    return risks;
}

async function generateRiskAnalysis(risks) {
    try {
        const riskPrompt = `PORTFOLIO RISK ANALYSIS

IDENTIFIED RISKS:
${risks.map((risk, index) => `
${index + 1}. ${risk.type} RISK (${risk.severity})
   Description: ${risk.description}
   ${risk.dealId ? `Deal ID: ${risk.dealId}` : ''}
   ${risk.current ? `Current: ${risk.current} | Limit: ${risk.limit}` : ''}
`).join('')}

ANALYSIS REQUIREMENTS:
1. Risk prioritization and impact assessment
2. Immediate action items for critical risks
3. Medium-term mitigation strategies
4. Portfolio adjustment recommendations
5. Monitoring and early warning improvements

Provide comprehensive risk analysis with specific action plan.`;

        const result = await executeSpeedOptimizedGPT5(riskPrompt);
        
        return {
            analysisId: generateAnalysisId(),
            analysisDate: new Date().toISOString(),
            analysis: result.response,
            aiModel: result.config.model,
            responseTime: result.responseTime
        };
        
    } catch (error) {
        console.error('❌ Risk analysis generation failed:', error.message);
        return { error: error.message };
    }
}

async function calculatePortfolioImpact(newDeal) {
    const currentMetrics = await calculateDetailedPortfolioMetrics();
    
    // Calculate impact
    const sizeImpact = (newDeal.dealInfo.loanAmount / currentMetrics.totalAUM) * 100;
    const returnImpact = newDeal.dealInfo.interestRate - currentMetrics.avgReturn;
    const riskImpact = newDeal.risk.riskScore > currentMetrics.riskDistribution ? 'INCREASE' : 'DECREASE';
    
    return {
        sizeImpact: sizeImpact.toFixed(2) + '%',
        returnImpact: returnImpact > 0 ? `+${returnImpact.toFixed(2)}%` : `${returnImpact.toFixed(2)}%`,
        riskImpact,
        diversificationImprovement: assessDiversificationImpact(newDeal, currentMetrics)
    };
}

function assessDiversificationImpact(newDeal, currentMetrics) {
    // Check if deal improves diversification
    const location = newDeal.dealInfo.location;
    const propertyType = newDeal.dealInfo.propertyType;
    
    const existingLocationExposure = currentMetrics.geoDistribution[location] || 0;
    const existingTypeExposure = currentMetrics.propertyTypeMix[propertyType] || 0;
    
    if (existingLocationExposure < currentMetrics.totalAUM * 0.1 || 
        existingTypeExposure < currentMetrics.totalAUM * 0.2) {
        return 'IMPROVED';
    }
    
    return 'NEUTRAL';
}

function extractKeyRecommendations(analysis) {
    const lines = analysis.split('\n');
    return lines.filter(line => 
        line.toLowerCase().includes('recommend') || 
        line.toLowerCase().includes('should') ||
        line.toLowerCase().includes('action') ||
        line.includes('•') ||
        line.includes('-')
    ).slice(0, 5);
}

function extractRiskActions(analysis) {
    const lines = analysis.split('\n');
    return lines.filter(line => 
        line.toLowerCase().includes('action') ||
        line.toLowerCase().includes('immediate') ||
        line.toLowerCase().includes('urgent') ||
        line.toLowerCase().includes('priority')
    ).slice(0, 3);
}

async function updateFundMetrics() {
    const metrics = await calculateDetailedPortfolioMetrics();
    PORTFOLIO_DATABASE.fundMetrics = {
        totalAUM: metrics.totalAUM,
        totalCommitted: metrics.totalAUM,
        totalDeployed: metrics.totalDeployed,
        availableCash: metrics.availableCash,
        totalReturns: metrics.totalReturns,
        avgReturn: metrics.avgReturn,
        activeDeals: metrics.activeDeals,
        completedDeals: metrics.completedDeals
    };
}

// 📊 PORTFOLIO DATABASE OPERATIONS

function getAllDeals() {
    return PORTFOLIO_DATABASE.deals;
}

function getDealById(dealId) {
    return PORTFOLIO_DATABASE.deals.find(deal => deal.dealId === dealId);
}

function getDealsByStatus(status) {
    return PORTFOLIO_DATABASE.deals.filter(deal => deal.status === status);
}

function getDealsByLocation(location) {
    return PORTFOLIO_DATABASE.deals.filter(deal => deal.dealInfo.location === location);
}

function getDealsByRiskLevel(riskLevel) {
    return PORTFOLIO_DATABASE.deals.filter(deal => deal.risk.riskLevel === riskLevel);
}

function updateDealStatus(dealId, newStatus) {
    const deal = PORTFOLIO_DATABASE.deals.find(d => d.dealId === dealId);
    if (deal) {
        deal.status = newStatus;
        deal.notes.push({
            date: new Date().toISOString(),
            type: 'status_change',
            note: `Status changed to ${newStatus}`
        });
        updateFundMetrics();
        return deal;
    }
    return null;
}

function getFundMetrics() {
    return PORTFOLIO_DATABASE.fundMetrics;
}

function getPortfolioSummary() {
    return {
        fundMetrics: PORTFOLIO_DATABASE.fundMetrics,
        riskMetrics: PORTFOLIO_DATABASE.riskMetrics,
        totalDeals: PORTFOLIO_DATABASE.deals.length,
        dealsByStatus: {
            pipeline: PORTFOLIO_DATABASE.deals.filter(d => d.status === PORTFOLIO_CONFIG.DEAL_STATUS.PIPELINE).length,
            funded: PORTFOLIO_DATABASE.deals.filter(d => d.status === PORTFOLIO_CONFIG.DEAL_STATUS.FUNDED).length,
            performing: PORTFOLIO_DATABASE.deals.filter(d => d.status === PORTFOLIO_CONFIG.DEAL_STATUS.PERFORMING).length,
            pastDue: PORTFOLIO_DATABASE.deals.filter(d => d.status === PORTFOLIO_CONFIG.DEAL_STATUS.PAST_DUE).length,
            completed: PORTFOLIO_DATABASE.deals.filter(d => d.status === PORTFOLIO_CONFIG.DEAL_STATUS.COMPLETED).length
        }
    };
}

// 📈 PERFORMANCE TRACKING

function trackPerformanceHistory() {
    const currentMetrics = PORTFOLIO_DATABASE.fundMetrics;
    const performanceSnapshot = {
        date: new Date().toISOString(),
        totalAUM: currentMetrics.totalAUM,
        totalDeployed: currentMetrics.totalDeployed,
        avgReturn: currentMetrics.avgReturn,
        activeDeals: currentMetrics.activeDeals,
        totalReturns: currentMetrics.totalReturns
    };
    
    PORTFOLIO_DATABASE.performanceHistory.push(performanceSnapshot);
    
    // Keep only last 365 days of history
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    PORTFOLIO_DATABASE.performanceHistory = PORTFOLIO_DATABASE.performanceHistory.filter(
        snapshot => new Date(snapshot.date) > oneYearAgo
    );
    
    return performanceSnapshot;
}

function getPerformanceHistory(days = 30) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return PORTFOLIO_DATABASE.performanceHistory.filter(
        snapshot => new Date(snapshot.date) > cutoffDate
    );
}

// 📊 ANALYTICS AND INSIGHTS

async function generatePortfolioInsights() {
    try {
        const metrics = await calculateDetailedPortfolioMetrics();
        const performance = await analyzePortfolioPerformance();
        const risks = await analyzePortfolioRisk();
        
        const insightsPrompt = `PORTFOLIO INSIGHTS AND RECOMMENDATIONS

CURRENT PORTFOLIO STATE:
- Total AUM: ${metrics.totalAUM?.toLocaleString()}
- Active Deals: ${metrics.activeDeals}
- Average Return: ${metrics.avgReturn?.toFixed(2)}%
- Risk Level: ${risks.portfolioRisk}

PERFORMANCE METRICS:
- Net IRR: ${performance.netIRR?.toFixed(2)}%
- Target Achievement: ${performance.targetAchievement?.toFixed(1)}%
- Risk-Adjusted Return: ${performance.riskAdjustedReturn?.toFixed(2)}%

DIVERSIFICATION:
- Geographic Distribution: ${Object.keys(metrics.geoDistribution).length} locations
- Property Types: ${Object.keys(metrics.propertyTypeMix).length} types
- Risk Distribution: ${metrics.riskDistribution.low}L/${metrics.riskDistribution.medium}M/${metrics.riskDistribution.high}H

RISK FACTORS:
- Credit Risk: ${risks.creditRisk}%
- Concentration Risks: ${risks.concentrationRisks?.length || 0}

Generate strategic insights including:
1. Portfolio optimization opportunities
2. Risk mitigation priorities
3. Growth and expansion recommendations
4. Performance improvement strategies
5. Market positioning analysis
6. Capital allocation optimization

Focus on actionable strategic recommendations for fund management.`;

        const result = await executeSpeedOptimizedGPT5(insightsPrompt);
        
        return {
            insightId: generateAnalysisId(),
            generatedDate: new Date().toISOString(),
            insights: result.response,
            aiModel: result.config.model,
            responseTime: result.responseTime,
            keyMetrics: {
                portfolioHealth: performance.targetAchievement > 90 ? 'EXCELLENT' : 
                               performance.targetAchievement > 75 ? 'GOOD' : 
                               performance.targetAchievement > 60 ? 'SATISFACTORY' : 'NEEDS_IMPROVEMENT',
                riskLevel: risks.portfolioRisk,
                diversificationScore: calculateDiversificationScore(metrics),
                performanceRating: performance.performanceRating
            }
        };
        
    } catch (error) {
        console.error('❌ Portfolio insights generation failed:', error.message);
        throw new Error(`Portfolio insights failed: ${error.message}`);
    }
}

function calculateDiversificationScore(metrics) {
    let score = 0;
    let maxScore = 0;
    
    // Geographic diversification (40 points)
    maxScore += 40;
    const geoCount = Object.keys(metrics.geoDistribution).length;
    score += Math.min(40, geoCount * 8); // Up to 5 locations for max points
    
    // Property type diversification (30 points)
    maxScore += 30;
    const typeCount = Object.keys(metrics.propertyTypeMix).length;
    score += Math.min(30, typeCount * 10); // Up to 3 types for max points
    
    // Risk diversification (20 points)
    maxScore += 20;
    const riskBalance = Math.min(
        metrics.riskDistribution.low,
        metrics.riskDistribution.medium,
        metrics.riskDistribution.high
    );
    score += Math.min(20, riskBalance * 2);
    
    // Deal count diversification (10 points)
    maxScore += 10;
    const dealCount = metrics.activeDeals;
    score += Math.min(10, dealCount); // 1 point per deal up to 10
    
    return Math.round((score / maxScore) * 100);
}

// 📧 AUTOMATED REPORTING

async function generateAutomatedReports() {
    try {
        const reports = [];
        
        // Daily risk monitoring
        const riskReport = await monitorPortfolioRisks();
        if (riskReport.totalRisks > 0) {
            reports.push({
                type: 'RISK_ALERT',
                priority: 'HIGH',
                report: riskReport
            });
        }
        
        // Weekly performance update
        const performanceReport = await generatePortfolioReport('performance');
        reports.push({
            type: 'PERFORMANCE_UPDATE',
            priority: 'MEDIUM',
            report: performanceReport
        });
        
        // Monthly comprehensive report
        const isMonthEnd = new Date().getDate() >= 28;
        if (isMonthEnd) {
            const comprehensiveReport = await generatePortfolioReport('comprehensive');
            reports.push({
                type: 'MONTHLY_COMPREHENSIVE',
                priority: 'HIGH',
                report: comprehensiveReport
            });
        }
        
        return {
            reportingDate: new Date().toISOString(),
            reportsGenerated: reports.length,
            reports: reports
        };
        
    } catch (error) {
        console.error('❌ Automated reporting failed:', error.message);
        throw new Error(`Automated reporting failed: ${error.message}`);
    }
}

// 📤 MAIN EXPORTS
module.exports = {
    // Core portfolio management
    addDealToPortfolio,
    analyzeDealForPortfolio,
    generatePortfolioReport,
    monitorPortfolioRisks,
    updateDealPayment,
    
    // Analytics and insights
    calculateDetailedPortfolioMetrics,
    analyzePortfolioPerformance,
    analyzePortfolioRisk,
    generatePortfolioInsights,
    
    // Database operations
    getAllDeals,
    getDealById,
    getDealsByStatus,
    getDealsByLocation,
    getDealsByRiskLevel,
    updateDealStatus,
    getFundMetrics,
    getPortfolioSummary,
    
    // Performance tracking
    trackPerformanceHistory,
    getPerformanceHistory,
    
    // Automated reporting
    generateAutomatedReports,
    
    // Configuration
    PORTFOLIO_CONFIG,
    
    // Utility functions
    calculateRiskLevel,
    getPerformanceRating,
    calculateDiversificationScore,
    
    // Portfolio health check
    checkPortfolioHealth: async () => {
        try {
            const metrics = await calculateDetailedPortfolioMetrics();
            const performance = await analyzePortfolioPerformance();
            const risks = await analyzePortfolioRisk();
            
            return {
                healthy: risks.portfolioRisk !== 'CRITICAL' && performance.targetAchievement > 60,
                portfolioHealth: performance.targetAchievement > 90 ? 'EXCELLENT' : 
                               performance.targetAchievement > 75 ? 'GOOD' : 
                               performance.targetAchievement > 60 ? 'SATISFACTORY' : 'NEEDS_IMPROVEMENT',
                metrics: {
                    totalAUM: metrics.totalAUM,
                    activeDeals: metrics.activeDeals,
                    avgReturn: metrics.avgReturn,
                    riskLevel: risks.portfolioRisk,
                    diversificationScore: calculateDiversificationScore(metrics)
                },
                alerts: risks.concentrationRisks?.length > 0 ? 
                       [`${risks.concentrationRisks.length} concentration risk(s) detected`] : 
                       ['No significant alerts'],
                recommendations: performance.targetAchievement < 80 ? 
                               ['Focus on performance improvement', 'Review underperforming deals'] : 
                               ['Maintain current strategy', 'Consider portfolio expansion']
            };
            
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                recommendations: ['Check portfolio management system', 'Review data integrity']
            };
        }
    },
    
    // Quick stats for dashboard
    getQuickStats: () => {
        return {
            totalDeals: PORTFOLIO_DATABASE.deals.length,
            totalAUM: PORTFOLIO_DATABASE.fundMetrics.totalAUM,
            activeDeals: PORTFOLIO_DATABASE.fundMetrics.activeDeals,
            avgReturn: PORTFOLIO_DATABASE.fundMetrics.avgReturn,
            availableCash: PORTFOLIO_DATABASE.fundMetrics.availableCash,
            lastUpdated: new Date().toISOString()
        };
    }
};

console.log('📊 Portfolio Management System Loaded');
console.log('💼 Professional fund portfolio tracking and analytics active');
console.log('⚠️ Real-time risk monitoring and performance analysis enabled');
console.log('📈 Automated reporting and portfolio optimization ready');
console.log('🎯 Cambodia fund portfolio operations optimized');
