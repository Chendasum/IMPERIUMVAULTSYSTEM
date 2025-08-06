// utils/cambodiaLending.js - PRIVATE LENDING FUND ENHANCEMENT SYSTEM
// Integrates with Ray Dalio AI for institutional-grade Cambodia fund management

const axios = require('axios');
const moment = require('moment-timezone');
const { getRayDalioMarketData, getFredData } = require('./liveData');
const { saveConversationDB, addPersistentMemoryDB } = require('./database');

// 🇰🇭 CAMBODIA MARKET DATA & CONSTANTS
const CAMBODIA_MARKET_DATA = {
    // Interest Rate Environment
    PRIME_LENDING_RATES: {
        commercial: { min: 12, max: 18, average: 15 },
        residential: { min: 8, max: 14, average: 11 },
        bridge: { min: 15, max: 25, average: 20 },
        development: { min: 18, max: 28, average: 22 }
    },
    
    // Phnom Penh Property Zones
    PROPERTY_ZONES: {
        'Chamkar Mon': { risk: 'LOW', appreciation: 'HIGH', liquidity: 'HIGH' },
        'Daun Penh': { risk: 'LOW', appreciation: 'MEDIUM', liquidity: 'HIGH' },
        '7 Makara': { risk: 'MEDIUM', appreciation: 'HIGH', liquidity: 'MEDIUM' },
        'Toul Kork': { risk: 'LOW', appreciation: 'MEDIUM', liquidity: 'HIGH' },
        'Russey Keo': { risk: 'MEDIUM', appreciation: 'HIGH', liquidity: 'MEDIUM' },
        'Sen Sok': { risk: 'MEDIUM', appreciation: 'MEDIUM', liquidity: 'MEDIUM' },
        'Meanchey': { risk: 'HIGH', appreciation: 'LOW', liquidity: 'LOW' }
    },
    
    // Economic Indicators
    ECONOMIC_BASELINE: {
        gdpGrowth: 7.0,
        inflation: 3.5,
        currencyStability: 0.95, // USD peg strength
        politicalRisk: 'MODERATE',
        regulatoryEnvironment: 'IMPROVING'
    },
    
    // Risk Multipliers
    RISK_MULTIPLIERS: {
        'FIRST_TIME_BORROWER': 1.3,
        'REPEAT_CLIENT': 0.8,
        'LOCAL_DEVELOPER': 1.0,
        'FOREIGN_INVESTOR': 1.4,
        'GOVERNMENT_CONNECTED': 0.7
    }
};

// 🏦 LENDING FUND CACHE
let fundCache = {
    lastUpdate: null,
    portfolioData: null,
    riskMetrics: null,
    marketConditions: null
};

/**
 * 🎯 1. DEAL ANALYSIS SYSTEM
 */
async function analyzeLendingDeal(dealParams) {
    try {
        console.log('🎯 Analyzing Cambodia lending deal...');
        
        const {
            amount,
            borrowerType,
            collateralType,
            location,
            interestRate,
            term,
            purpose,
            borrowerProfile,
            loanToValue
        } = dealParams;
        
        // Get current market data
        const marketData = await getRayDalioMarketData();
        const cambodiaConditions = await getCambodiaMarketConditions();
        
        // Risk Assessment
        const riskScore = calculateDealRiskScore(dealParams, cambodiaConditions);
        const creditScore = assessBorrowerCredit(borrowerProfile);
        const collateralValue = evaluateCollateral(collateralType, location, amount);
        
        // Market Analysis
        const marketAnalysis = analyzeMarketTiming(marketData, cambodiaConditions);
        const competitiveRate = calculateCompetitiveRate(dealParams, cambodiaConditions);
        
        // Ray Dalio Framework Application
        const rayDalioAssessment = applyRayDalioToLending(dealParams, marketData);
        
        const analysis = {
            dealId: `DEAL_${Date.now()}`,
            timestamp: new Date().toISOString(),
            
            // Deal Overview
            dealSummary: {
                amount: parseFloat(amount),
                rate: parseFloat(interestRate),
                term: parseInt(term),
                monthlyPayment: calculateMonthlyPayment(amount, interestRate, term),
                totalReturn: calculateTotalReturn(amount, interestRate, term),
                riskAdjustedReturn: 0 // Calculated below
            },
            
            // Risk Analysis
            riskAssessment: {
                overallScore: riskScore,
                creditRisk: creditScore,
                marketRisk: marketAnalysis.risk,
                collateralRisk: collateralValue.risk,
                currencyRisk: 'LOW', // USD denominated
                liquidityRisk: getLocationLiquidityRisk(location),
                riskCategory: getRiskCategory(riskScore)
            },
            
            // Market Context
            marketContext: {
                currentConditions: cambodiaConditions.summary,
                rateEnvironment: cambodiaConditions.interestRateEnvironment,
                propertyMarket: cambodiaConditions.propertyMarket,
                competitiveRate: competitiveRate,
                marketTiming: marketAnalysis.timing
            },
            
            // Ray Dalio Analysis
            rayDalioInsights: rayDalioAssessment,
            
            // Recommendation
            recommendation: generateLendingRecommendation(riskScore, marketAnalysis, rayDalioAssessment),
            
            // Financial Metrics
            metrics: {
                expectedReturn: parseFloat(interestRate),
                riskAdjustedReturn: (parseFloat(interestRate) * (100 - riskScore)) / 100,
                capitalEfficiency: amount / 100000, // Capital efficiency ratio
                portfolioImpact: calculatePortfolioImpact(amount, interestRate),
                breakEvenDefault: calculateBreakEvenDefault(interestRate, term),
                worstCaseScenario: calculateWorstCase(dealParams)
            },
            
            // Action Items
            actionItems: generateActionItems(riskScore, marketAnalysis),
            
            // Monitoring Alerts
            monitoringAlerts: generateMonitoringAlerts(dealParams, riskScore)
        };
        
        // Calculate risk-adjusted return
        analysis.dealSummary.riskAdjustedReturn = analysis.metrics.riskAdjustedReturn;
        
        console.log(`✅ Deal analysis complete: ${analysis.recommendation.decision} (${riskScore}/100 risk)`);
        return analysis;
        
    } catch (error) {
        console.error('Deal analysis error:', error.message);
        return {
            error: error.message,
            dealId: `ERROR_${Date.now()}`,
            recommendation: { decision: 'DECLINE', reason: 'Analysis failed' }
        };
    }
}

/**
 * 🏦 2. PORTFOLIO MANAGEMENT SYSTEM
 */
async function getPortfolioStatus(fundData = null) {
    try {
        console.log('🏦 Generating portfolio status...');
        
        // Update cache if needed
        const now = Date.now();
        if (!fundCache.lastUpdate || (now - fundCache.lastUpdate) > 30 * 60 * 1000) {
            await updateFundCache();
        }
        
        const marketData = await getRayDalioMarketData();
        
        const portfolio = {
            timestamp: new Date().toISOString(),
            
            // Fund Overview
            fundOverview: {
                totalAUM: fundData?.totalAUM || calculateTotalAUM(),
                availableCapital: fundData?.availableCapital || 0,
                deployedCapital: fundData?.deployedCapital || 0,
                deploymentRatio: calculateDeploymentRatio(fundData),
                numberOfDeals: fundData?.activeDeals || 0,
                averageDealSize: calculateAverageDealSize(fundData)
            },
            
            // Performance Metrics
            performance: {
                currentYieldRate: calculateCurrentYield(fundData),
                targetYieldRate: 18.0, // Target for Cambodia market
                actualVsTarget: calculateActualVsTarget(fundData),
                riskAdjustedReturn: calculateRiskAdjustedReturn(fundData),
                portfolioIRR: calculatePortfolioIRR(fundData),
                monthlyIncome: calculateMonthlyIncome(fundData),
                annualizedReturn: calculateAnnualizedReturn(fundData)
            },
            
            // Risk Metrics
            riskMetrics: {
                concentrationRisk: calculateConcentrationRisk(fundData),
                defaultRate: calculateDefaultRate(fundData),
                portfolioVaR: calculateValueAtRisk(fundData),
                stressTestResults: performStressTest(fundData),
                diversificationScore: calculateDiversificationScore(fundData),
                liquidity: assessPortfolioLiquidity(fundData)
            },
            
            // Geographic Allocation
            geographicAllocation: {
                phnomPenh: calculateGeographicAllocation(fundData, 'Phnom Penh'),
                sihanoukville: calculateGeographicAllocation(fundData, 'Sihanoukville'),
                siemReap: calculateGeographicAllocation(fundData, 'Siem Reap'),
                other: calculateGeographicAllocation(fundData, 'Other')
            },
            
            // Sector Allocation
            sectorAllocation: {
                commercial: calculateSectorAllocation(fundData, 'commercial'),
                residential: calculateSectorAllocation(fundData, 'residential'),
                development: calculateSectorAllocation(fundData, 'development'),
                bridge: calculateSectorAllocation(fundData, 'bridge'),
                other: calculateSectorAllocation(fundData, 'other')
            },
            
            // Ray Dalio Assessment
            rayDalioPortfolioAnalysis: {
                diversificationScore: assessRayDalioDiversification(fundData),
                riskParityAlignment: assessRiskParityAlignment(fundData),
                macroAlignment: assessMacroAlignment(fundData, marketData),
                regimePositioning: assessRegimePositioning(fundData, marketData)
            },
            
            // Recommendations
            recommendations: generatePortfolioRecommendations(fundData, marketData),
            
            // Alerts
            alerts: generatePortfolioAlerts(fundData)
        };
        
        console.log(`✅ Portfolio analysis complete: ${portfolio.fundOverview.totalAUM} AUM`);
        return portfolio;
        
    } catch (error) {
        console.error('Portfolio analysis error:', error.message);
        return {
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 🇰🇭 3. CAMBODIA MARKET INTELLIGENCE
 */
async function getCambodiaMarketConditions() {
    try {
        console.log('🇰🇭 Analyzing Cambodia market conditions...');
        
        // Get global market data for context
        const globalData = await getRayDalioMarketData();
        
        // Analyze Cambodia-specific factors
        const conditions = {
            timestamp: new Date().toISOString(),
            
            // Economic Environment
            economicEnvironment: {
                gdpGrowth: 7.0, // Latest estimates
                inflation: 3.5,
                unemployment: 0.3, // Very low in Cambodia
                currencyStability: assessUSDKHRStability(),
                politicalStability: 'STABLE',
                regulatoryEnvironment: 'IMPROVING'
            },
            
            // Interest Rate Environment
            interestRateEnvironment: {
                centralBankRate: 'N/A', // Cambodia uses USD
                commercialRates: CAMBODIA_MARKET_DATA.PRIME_LENDING_RATES,
                trendDirection: 'STABLE',
                fedImpact: analyzeFedImpactOnCambodia(globalData),
                competitiveEnvironment: 'MODERATE'
            },
            
            // Property Market
            propertyMarket: {
                phnomPenhTrend: 'STABLE_GROWTH',
                demandSupplyBalance: 'BALANCED',
                foreignInvestment: 'MODERATE',
                developmentActivity: 'HIGH',
                priceAppreciation: 'MODERATE',
                liquidity: 'GOOD'
            },
            
            // Banking Sector
            bankingSector: {
                liquidityConditions: 'ADEQUATE',
                creditGrowth: 'MODERATE',
                competitionLevel: 'HIGH',
                regulatoryChanges: 'ONGOING',
                digitalTransformation: 'ACCELERATING'
            },
            
            // Risk Factors
            riskFactors: {
                politicalRisk: 'LOW',
                economicRisk: 'MODERATE',
                currencyRisk: 'LOW',
                regulatoryRisk: 'MODERATE',
                marketRisk: 'MODERATE',
                liquidityRisk: 'LOW'
            },
            
            // Opportunities
            opportunities: [
                'Bridge lending for development projects',
                'Commercial property refinancing',
                'Foreign investor bridge loans',
                'Local business expansion financing',
                'Tourism sector recovery financing'
            ],
            
            // Global Context Impact
            globalImpact: analyzeGlobalImpactOnCambodia(globalData),
            
            // Market Timing
            marketTiming: {
                currentPhase: 'EXPANSION',
                timeInCycle: 'MID_CYCLE',
                nextPhaseExpected: 'LATE_EXPANSION',
                timingForLending: 'FAVORABLE'
            },
            
            // Summary Assessment
            summary: generateCambodiaMarketSummary(globalData)
        };
        
        console.log(`✅ Cambodia market analysis complete: ${conditions.summary}`);
        return conditions;
        
    } catch (error) {
        console.error('Cambodia market analysis error:', error.message);
        return {
            error: error.message,
            summary: 'Market analysis unavailable'
        };
    }
}

/**
 * 📊 4. RISK MANAGEMENT SYSTEM
 */
async function performRiskAssessment(portfolioData, newDeal = null) {
    try {
        console.log('📊 Performing comprehensive risk assessment...');
        
        const marketData = await getRayDalioMarketData();
        const cambodiaConditions = await getCambodiaMarketConditions();
        
        const riskAssessment = {
            timestamp: new Date().toISOString(),
            
            // Portfolio Risk Metrics
            portfolioRisk: {
                overallRiskScore: calculateOverallRiskScore(portfolioData),
                concentrationRisk: assessConcentrationRisk(portfolioData),
                creditRisk: assessPortfolioCreditRisk(portfolioData),
                marketRisk: assessMarketRisk(portfolioData, cambodiaConditions),
                liquidityRisk: assessLiquidityRisk(portfolioData),
                operationalRisk: assessOperationalRisk(),
                regulatoryRisk: assessRegulatoryRisk()
            },
            
            // Ray Dalio Risk Framework
            rayDalioRiskAnalysis: {
                diversificationEffectiveness: assessDiversificationEffectiveness(portfolioData),
                correlationRisks: identifyCorrelationRisks(portfolioData),
                tailRisks: identifyTailRisks(portfolioData, cambodiaConditions),
                hedgingRecommendations: generateHedgingRecommendations(portfolioData),
                riskParityAlignment: assessRiskParityInLending(portfolioData)
            },
            
            // Stress Testing
            stressTesting: {
                economicDownturn: simulateEconomicDownturn(portfolioData),
                interestRateShock: simulateRateShock(portfolioData),
                defaultScenarios: simulateDefaultScenarios(portfolioData),
                liquidityCrisis: simulateLiquidityCrisis(portfolioData),
                currencyDevaluation: simulateCurrencyShock(portfolioData)
            },
            
            // Early Warning Indicators
            earlyWarning: {
                macroIndicators: identifyMacroWarnings(marketData, cambodiaConditions),
                portfolioIndicators: identifyPortfolioWarnings(portfolioData),
                marketIndicators: identifyMarketWarnings(cambodiaConditions),
                regulatoryIndicators: identifyRegulatoryWarnings()
            },
            
            // Risk Limits
            riskLimits: {
                currentUtilization: calculateRiskLimitUtilization(portfolioData),
                recommendations: generateRiskLimitRecommendations(portfolioData),
                violations: identifyRiskLimitViolations(portfolioData),
                adjustments: recommendRiskLimitAdjustments(portfolioData)
            },
            
            // New Deal Impact (if provided)
            newDealImpact: newDeal ? assessNewDealImpact(portfolioData, newDeal) : null,
            
            // Action Items
            riskActionItems: generateRiskActionItems(portfolioData, cambodiaConditions),
            
            // Monitoring Requirements
            monitoringRequirements: generateMonitoringRequirements(portfolioData)
        };
        
        console.log(`✅ Risk assessment complete: ${riskAssessment.portfolioRisk.overallRiskScore}/100`);
        return riskAssessment;
        
    } catch (error) {
        console.error('Risk assessment error:', error.message);
        return {
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 💼 5. LP/INVESTOR TOOLS
 */
async function generateLPReport(reportType = 'monthly', lpData = null) {
    try {
        console.log(`💼 Generating ${reportType} LP report...`);
        
        const portfolioStatus = await getPortfolioStatus();
        const riskAssessment = await performRiskAssessment(lpData);
        const marketConditions = await getCambodiaMarketConditions();
        
        const report = {
            reportId: `LP_REPORT_${Date.now()}`,
            reportType: reportType.toUpperCase(),
            reportDate: new Date().toISOString(),
            reportPeriod: calculateReportPeriod(reportType),
            
            // Executive Summary
            executiveSummary: {
                fundPerformance: generateExecutiveSummary(portfolioStatus, riskAssessment),
                keyHighlights: generateKeyHighlights(portfolioStatus),
                marketOutlook: generateMarketOutlook(marketConditions),
                riskUpdate: generateRiskUpdate(riskAssessment)
            },
            
            // Financial Performance
            financialPerformance: {
                returns: {
                    periodReturn: portfolioStatus.performance.actualVsTarget,
                    annualizedReturn: portfolioStatus.performance.annualizedReturn,
                    targetVsActual: portfolioStatus.performance.actualVsTarget,
                    riskAdjustedReturn: portfolioStatus.performance.riskAdjustedReturn
                },
                income: {
                    interestIncome: portfolioStatus.performance.monthlyIncome * getMonthsInPeriod(reportType),
                    fees: calculateFeesForPeriod(portfolioStatus, reportType),
                    totalIncome: calculateTotalIncomeForPeriod(portfolioStatus, reportType)
                },
                deploymentMetrics: {
                    capitalDeployed: portfolioStatus.fundOverview.deployedCapital,
                    deploymentRatio: portfolioStatus.fundOverview.deploymentRatio,
                    pipelineDeal: calculatePipelineValue(),
                    targetDeployment: calculateTargetDeployment()
                }
            },
            
            // Portfolio Analytics
            portfolioAnalytics: {
                allocation: {
                    geographic: portfolioStatus.geographicAllocation,
                    sector: portfolioStatus.sectorAllocation,
                    riskProfile: calculateRiskProfileAllocation(portfolioStatus)
                },
                diversification: {
                    score: portfolioStatus.riskMetrics.diversificationScore,
                    rayDalioAlignment: portfolioStatus.rayDalioPortfolioAnalysis.diversificationScore,
                    recommendations: portfolioStatus.recommendations
                },
                dealMetrics: {
                    numberOfDeals: portfolioStatus.fundOverview.numberOfDeals,
                    averageDealSize: portfolioStatus.fundOverview.averageDealSize,
                    averageRate: calculateAverageRate(portfolioStatus),
                    averageTerm: calculateAverageTerm(portfolioStatus)
                }
            },
            
            // Risk Reporting
            riskReporting: {
                overallRisk: riskAssessment.portfolioRisk.overallRiskScore,
                riskBreakdown: riskAssessment.portfolioRisk,
                stressTestResults: riskAssessment.stressTesting,
                mitigation: riskAssessment.riskActionItems
            },
            
            // Market Commentary
            marketCommentary: {
                cambodiaMarket: generateCambodiaMarketCommentary(marketConditions),
                globalContext: generateGlobalMarketCommentary(marketConditions.globalImpact),
                outlook: generateOutlookCommentary(marketConditions),
                implications: generateImplicationsForFund(marketConditions)
            },
            
            // Deal Highlights
            dealHighlights: generateDealHighlights(portfolioStatus, reportType),
            
            // Looking Forward
            forwardLooking: {
                pipeline: generatePipelineUpdate(),
                strategy: generateStrategyUpdate(marketConditions),
                targets: generateTargetsUpdate(portfolioStatus),
                risks: generateForwardRisks(riskAssessment)
            },
            
            // Appendices
            appendices: {
                detailedPositions: generateDetailedPositions(portfolioStatus),
                riskMetrics: generateDetailedRiskMetrics(riskAssessment),
                marketData: generateMarketDataAppendix(marketConditions),
                glossary: generateGlossary()
            }
        };
        
        console.log(`✅ ${reportType} LP report generated: ${report.reportId}`);
        return report;
        
    } catch (error) {
        console.error('LP report generation error:', error.message);
        return {
            error: error.message,
            reportId: `ERROR_${Date.now()}`,
            reportType: reportType.toUpperCase()
        };
    }
}

// 🔧 HELPER FUNCTIONS

function calculateDealRiskScore(dealParams, conditions) {
    const { amount, borrowerType, location, loanToValue, term } = dealParams;
    
    let baseScore = 50; // Start with neutral
    
    // Amount risk
    if (amount > 1000000) baseScore += 10;
    else if (amount < 100000) baseScore -= 5;
    
    // Borrower type risk
    const borrowerRisk = CAMBODIA_MARKET_DATA.RISK_MULTIPLIERS[borrowerType] || 1.0;
    baseScore *= borrowerRisk;
    
    // Location risk
    const locationData = CAMBODIA_MARKET_DATA.PROPERTY_ZONES[location];
    if (locationData) {
        switch (locationData.risk) {
            case 'LOW': baseScore -= 10; break;
            case 'MEDIUM': baseScore += 0; break;
            case 'HIGH': baseScore += 15; break;
        }
    }
    
    // LTV risk
    if (loanToValue > 80) baseScore += 20;
    else if (loanToValue < 60) baseScore -= 10;
    
    // Term risk
    if (term > 24) baseScore += 10;
    else if (term < 6) baseScore += 5;
    
    return Math.max(0, Math.min(100, Math.round(baseScore)));
}

function assessBorrowerCredit(borrowerProfile) {
    // Simplified credit scoring
    if (!borrowerProfile) return 50;
    
    let score = 50;
    
    // Credit history
    if (borrowerProfile.creditHistory === 'EXCELLENT') score += 20;
    else if (borrowerProfile.creditHistory === 'GOOD') score += 10;
    else if (borrowerProfile.creditHistory === 'POOR') score -= 20;
    
    // Income stability
    if (borrowerProfile.incomeStability === 'STABLE') score += 10;
    else if (borrowerProfile.incomeStability === 'VARIABLE') score -= 10;
    
    // Experience
    if (borrowerProfile.experience === 'EXPERIENCED') score += 15;
    else if (borrowerProfile.experience === 'NEW') score -= 10;
    
    return Math.max(0, Math.min(100, score));
}

function evaluateCollateral(collateralType, location, amount) {
    const locationData = CAMBODIA_MARKET_DATA.PROPERTY_ZONES[location];
    
    return {
        value: amount * 1.2, // Assume 20% buffer
        liquidity: locationData?.liquidity || 'MEDIUM',
        risk: locationData?.risk || 'MEDIUM',
        appreciation: locationData?.appreciation || 'MEDIUM'
    };
}

function analyzeMarketTiming(marketData, cambodiaConditions) {
    const regime = marketData?.rayDalio?.regime?.currentRegime?.name || 'UNKNOWN';
    
    let timing = 'NEUTRAL';
    let risk = 50;
    
    // Regime-based timing
    if (regime === 'GROWTH_RISING_INFLATION_FALLING') {
        timing = 'FAVORABLE';
        risk = 30;
    } else if (regime === 'GROWTH_FALLING_INFLATION_RISING') {
        timing = 'CAUTIOUS';
        risk = 70;
    }
    
    // Cambodia-specific factors
    if (cambodiaConditions.propertyMarket.phnomPenhTrend === 'STABLE_GROWTH') {
        risk -= 10;
    }
    
    return { timing, risk: Math.max(0, Math.min(100, risk)) };
}

function calculateCompetitiveRate(dealParams, conditions) {
    const baseRates = CAMBODIA_MARKET_DATA.PRIME_LENDING_RATES;
    const dealType = dealParams.collateralType || 'commercial';
    
    return baseRates[dealType]?.average || 15;
}

function applyRayDalioToLending(dealParams, marketData) {
    const regime = marketData?.rayDalio?.regime?.currentRegime?.name || 'UNKNOWN';
    
    return {
        regimeAlignment: assessRegimeAlignment(dealParams, regime),
        diversificationImpact: assessDiversificationImpact(dealParams),
        riskParityConsideration: assessRiskParityForDeal(dealParams),
        macroFactors: assessMacroFactors(dealParams, marketData),
        recommendation: generateRayDalioRecommendation(dealParams, regime)
    };
}

function generateLendingRecommendation(riskScore, marketAnalysis, rayDalioAssessment) {
    let decision = 'DECLINE';
    let reasons = [];
    
    if (riskScore <= 40 && marketAnalysis.timing === 'FAVORABLE') {
        decision = 'APPROVE';
        reasons.push('Low risk profile with favorable market conditions');
    } else if (riskScore <= 60 && marketAnalysis.timing !== 'UNFAVORABLE') {
        decision = 'CONDITIONAL_APPROVE';
        reasons.push('Moderate risk - requires enhanced monitoring');
    } else {
        decision = 'DECLINE';
        reasons.push('High risk profile or unfavorable market conditions');
    }
    
    // Ray Dalio influence
    if (rayDalioAssessment.recommendation === 'AVOID') {
        decision = 'DECLINE';
        reasons.push('Ray Dalio analysis suggests avoiding');
    }
    
    return {
        decision,
        confidence: decision === 'APPROVE' ? 85 : decision === 'CONDITIONAL_APPROVE' ? 65 : 90,
        reasons,
        conditions: decision === 'CONDITIONAL_APPROVE' ? generateConditions(riskScore) : []
    };
}

// Additional helper functions would continue here...
// (Due to length constraints, I'm showing the core structure)

async function updateFundCache() {
    fundCache.lastUpdate = Date.now();
    // Update cache with current data
}

function calculateMonthlyPayment(principal, annualRate, termMonths) {
    const monthlyRate = annualRate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
           (Math.pow(1 + monthlyRate, termMonths) - 1);
}

function calculateTotalReturn(principal, annualRate, termMonths) {
    const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
    return (monthlyPayment * termMonths) - principal;
}

// Export all functions
module.exports = {
    // Main Systems
    analyzeLendingDeal,
    getPortfolioStatus,
    getCambodiaMarketConditions,
    performRiskAssessment,
    generateLPReport,
    
    // Helper Functions
    calculateDealRiskScore,
    assessBorrowerCredit,
    evaluateCollateral,
    analyzeMarketTiming,
    calculateCompetitiveRate,
    applyRayDalioToLending,
    
    // Constants
    CAMBODIA_MARKET_DATA
};
