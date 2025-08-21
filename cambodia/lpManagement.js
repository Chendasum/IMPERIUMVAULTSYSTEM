// cambodia/lpManagement.js - COMPLETE LP Management System for Cambodia Fund
// Professional Limited Partner relationship and investment management

const { executeSpeedOptimizedGPT5 } = require('../utils/gpt5SpeedOptimization');
const { sendSmartMessage } = require('../utils/telegramSplitter');

// 🏦 LP MANAGEMENT CONFIGURATION
const LP_CONFIG = {
    // Investment categories
    CATEGORIES: {
        INDIVIDUAL: 'Individual Investor',
        FAMILY_OFFICE: 'Family Office',
        INSTITUTION: 'Institutional Investor',
        CORPORATE: 'Corporate Treasury',
        FUND: 'Fund of Funds'
    },
    
    // Risk profiles
    RISK_PROFILES: {
        CONSERVATIVE: {
            name: 'Conservative',
            targetReturn: 12,
            maxReturn: 15,
            maxLTV: 60,
            preferredTerms: '12-18 months',
            riskTolerance: 'low'
        },
        BALANCED: {
            name: 'Balanced',
            targetReturn: 15,
            maxReturn: 18,
            maxLTV: 70,
            preferredTerms: '18-24 months',
            riskTolerance: 'medium'
        },
        AGGRESSIVE: {
            name: 'Aggressive',
            targetReturn: 18,
            maxReturn: 25,
            maxLTV: 80,
            preferredTerms: '6-36 months',
            riskTolerance: 'high'
        }
    },
    
    // Investment status
    STATUS: {
        PROSPECT: 'Prospect',
        QUALIFIED: 'Qualified',
        ACTIVE: 'Active Investor',
        COMMITTED: 'Committed Capital',
        DEPLOYED: 'Capital Deployed',
        INACTIVE: 'Inactive'
    },
    
    // Cambodia specific preferences
    CAMBODIA_AREAS: [
        'BKK1', 'BKK2', 'BKK3', 'Chamkar Mon', 'Daun Penh',
        'Toul Kork', 'Sen Sok', 'Mean Chey', 'Russey Keo',
        'Siem Reap', 'Sihanoukville', 'Battambang'
    ]
};

// 📊 LP DATABASE - In production, use proper database
let LP_DATABASE = [];

// 🏦 LP MANAGEMENT FUNCTIONS

/**
 * 👤 Add new LP to database
 */
async function addNewLP(lpData) {
    try {
        console.log('👤 Adding new LP to database...');
        
        const newLP = {
            id: generateLPId(),
            addedDate: new Date().toISOString(),
            status: LP_CONFIG.STATUS.PROSPECT,
            
            // Basic information
            name: lpData.name,
            type: lpData.type || LP_CONFIG.CATEGORIES.INDIVIDUAL,
            email: lpData.email,
            phone: lpData.phone,
            country: lpData.country || 'Unknown',
            
            // Investment profile
            investmentProfile: {
                riskProfile: lpData.riskProfile || 'BALANCED',
                targetReturn: lpData.targetReturn || 15,
                minInvestment: lpData.minInvestment || 100000,
                maxInvestment: lpData.maxInvestment || 1000000,
                availableCapital: lpData.availableCapital || lpData.maxInvestment,
                preferredAreas: lpData.preferredAreas || ['BKK1', 'BKK2'],
                maxLTV: lpData.maxLTV || 70,
                preferredTerms: lpData.preferredTerms || '18-24 months'
            },
            
            // Investment history
            investments: [],
            totalInvested: 0,
            totalReturns: 0,
            avgReturn: 0,
            activeInvestments: 0,
            
            // Communication preferences
            communicationPrefs: {
                frequency: lpData.commFreq || 'monthly',
                preferredChannel: lpData.preferredChannel || 'email',
                reportingDetail: lpData.reportingDetail || 'standard'
            },
            
            // KYC/AML status
            compliance: {
                kycCompleted: false,
                amlChecked: false,
                accreditationVerified: false,
                documentsReceived: []
            },
            
            // Relationship tracking
            relationship: {
                source: lpData.source || 'direct',
                referredBy: lpData.referredBy || null,
                relationshipManager: lpData.relationshipManager || 'Admin',
                lastContact: new Date().toISOString(),
                nextFollowUp: null,
                notes: []
            },
            
            // Performance tracking
            performance: {
                satisfactionScore: null,
                retentionRisk: 'low',
                investmentActivity: 'new',
                lastInvestment: null
            }
        };
        
        LP_DATABASE.push(newLP);
        console.log(`✅ LP added: ${newLP.name} (${newLP.id})`);
        
        // Generate AI-powered LP profile analysis
        const profileAnalysis = await analyzeNewLPProfile(newLP);
        
        return {
            success: true,
            lpId: newLP.id,
            lp: newLP,
            profileAnalysis: profileAnalysis
        };
        
    } catch (error) {
        console.error('❌ Add LP failed:', error.message);
        throw new Error(`Failed to add LP: ${error.message}`);
    }
}

/**
 * 🔍 Analyze new LP profile with AI
 */
async function analyzeNewLPProfile(lp) {
    try {
        const analysisPrompt = `NEW LP PROFILE ANALYSIS

LP DETAILS:
- Name: ${lp.name}
- Type: ${lp.type}
- Country: ${lp.country}

INVESTMENT PROFILE:
- Risk Profile: ${lp.investmentProfile.riskProfile}
- Target Return: ${lp.investmentProfile.targetReturn}%
- Investment Range: $${lp.investmentProfile.minInvestment?.toLocaleString()} - $${lp.investmentProfile.maxInvestment?.toLocaleString()}
- Available Capital: $${lp.investmentProfile.availableCapital?.toLocaleString()}
- Preferred Areas: ${lp.investmentProfile.preferredAreas?.join(', ')}
- Max LTV: ${lp.investmentProfile.maxLTV}%
- Preferred Terms: ${lp.investmentProfile.preferredTerms}

ANALYSIS REQUIREMENTS:
1. LP CATEGORIZATION
   - Investment sophistication level
   - Cambodia market familiarity assessment
   - Risk appetite evaluation
   - Capital deployment timeline

2. OPTIMAL DEAL MATCHING
   - Ideal deal characteristics for this LP
   - Deal types to avoid
   - Optimal investment structure
   - Geographic preferences alignment

3. RELATIONSHIP STRATEGY
   - Communication approach recommendations
   - Reporting frequency and detail level
   - Onboarding priority and timeline
   - Potential partnership opportunities

4. RISK ASSESSMENT
   - LP retention risk factors
   - Capital stability assessment
   - Regulatory compliance considerations
   - Red flags or concerns

5. GROWTH POTENTIAL
   - Future investment capacity
   - Referral potential assessment
   - Relationship development opportunities
   - Strategic value to fund

Please provide comprehensive LP profile analysis with specific recommendations for relationship management and deal matching.`;

        const result = await executeSpeedOptimizedGPT5(analysisPrompt);
        
        return {
            analysisId: generateAnalysisId(),
            lpId: lp.id,
            analysisDate: new Date().toISOString(),
            analysis: result.response,
            aiModel: result.config.model,
            responseTime: result.responseTime,
            recommendations: extractRecommendations(result.response)
        };
        
    } catch (error) {
        console.error('❌ LP profile analysis failed:', error.message);
        return { error: error.message };
    }
}

/**
 * 🎯 Find LPs for specific deal
 */
async function findMatchingLPs(dealCriteria) {
    try {
        console.log('🎯 Finding matching LPs for deal...');
        
        // Filter LPs based on deal criteria
        const eligibleLPs = LP_DATABASE.filter(lp => {
            const profile = lp.investmentProfile;
            
            // Basic qualification checks
            const hasCapacity = profile.availableCapital >= dealCriteria.minInvestment;
            const returnsMatch = dealCriteria.expectedReturn >= profile.targetReturn;
            const ltvAcceptable = dealCriteria.ltv <= profile.maxLTV;
            const areaMatch = profile.preferredAreas === 'all' || 
                             profile.preferredAreas.includes(dealCriteria.location);
            
            return hasCapacity && returnsMatch && ltvAcceptable && areaMatch;
        });
        
        if (eligibleLPs.length === 0) {
            return {
                matches: [],
                message: 'No matching LPs found for this deal criteria'
            };
        }
        
        // Calculate compatibility scores
        const scoredLPs = eligibleLPs.map(lp => {
            const score = calculateLPDealCompatibility(lp, dealCriteria);
            return {
                ...lp,
                compatibilityScore: score,
                investmentFit: assessInvestmentFit(lp, dealCriteria),
                recommendedAllocation: calculateRecommendedAllocation(lp, dealCriteria)
            };
        }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        
        // Generate AI analysis of LP matches
        const matchingAnalysis = await generateLPMatchingAnalysis(dealCriteria, scoredLPs.slice(0, 5));
        
        return {
            matches: scoredLPs,
            topMatches: scoredLPs.slice(0, 3),
            totalEligible: eligibleLPs.length,
            totalCapacity: eligibleLPs.reduce((sum, lp) => sum + lp.investmentProfile.availableCapital, 0),
            matchingAnalysis: matchingAnalysis
        };
        
    } catch (error) {
        console.error('❌ LP matching failed:', error.message);
        throw new Error(`LP matching failed: ${error.message}`);
    }
}

/**
 * 📊 Generate LP portfolio report
 */
async function generateLPPortfolioReport(lpId) {
    try {
        console.log('📊 Generating LP portfolio report...');
        
        const lp = LP_DATABASE.find(l => l.id === lpId);
        if (!lp) {
            throw new Error('LP not found');
        }
        
        // Calculate portfolio metrics
        const portfolioMetrics = calculateLPPortfolioMetrics(lp);
        
        const reportPrompt = `LP PORTFOLIO PERFORMANCE REPORT

LP INFORMATION:
- Name: ${lp.name}
- Type: ${lp.type}
- Risk Profile: ${lp.investmentProfile.riskProfile}
- Member Since: ${new Date(lp.addedDate).toLocaleDateString()}

PORTFOLIO METRICS:
- Total Invested: $${lp.totalInvested.toLocaleString()}
- Total Returns: $${lp.totalReturns.toLocaleString()}
- Average Return: ${lp.avgReturn.toFixed(2)}%
- Active Investments: ${lp.activeInvestments}
- Available Capital: $${lp.investmentProfile.availableCapital.toLocaleString()}

INVESTMENT HISTORY:
${lp.investments.map(inv => `
- ${inv.dealId}: $${inv.amount.toLocaleString()} at ${inv.rate}% (${inv.status})
`).join('')}

PERFORMANCE ANALYSIS:
- Portfolio IRR: ${portfolioMetrics.irr.toFixed(2)}%
- Risk-Adjusted Return: ${portfolioMetrics.riskAdjustedReturn.toFixed(2)}%
- Portfolio Diversification: ${portfolioMetrics.diversificationScore}/100
- Investment Activity: ${portfolioMetrics.activityLevel}

Generate comprehensive portfolio report including:
1. Performance summary and key metrics
2. Risk analysis and portfolio health
3. Benchmark comparison vs Cambodia market
4. Investment recommendations and opportunities
5. Market outlook and strategic considerations

Focus on actionable insights and clear performance communication.`;

        const result = await executeSpeedOptimizedGPT5(reportPrompt);
        
        return {
            reportId: generateReportId(),
            lpId: lpId,
            reportDate: new Date().toISOString(),
            portfolioMetrics: portfolioMetrics,
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
 * 📧 Generate LP communication
 */
async function generateLPCommunication(type, lpId, data = {}) {
    try {
        console.log(`📧 Generating ${type} communication for LP ${lpId}...`);
        
        const lp = LP_DATABASE.find(l => l.id === lpId);
        if (!lp) {
            throw new Error('LP not found');
        }
        
        let prompt = '';
        
        switch (type) {
            case 'welcome':
                prompt = `WELCOME COMMUNICATION FOR NEW LP

LP PROFILE:
- Name: ${lp.name}
- Type: ${lp.type}
- Risk Profile: ${lp.investmentProfile.riskProfile}
- Investment Range: $${lp.investmentProfile.minInvestment?.toLocaleString()} - $${lp.investmentProfile.maxInvestment?.toLocaleString()}

Create professional welcome communication including:
- Personal welcome message
- Fund overview and strategy
- Cambodia market opportunity
- Next steps in onboarding process
- Contact information and support
- Expectations and timeline

Tone: Professional, welcoming, informative`;
                break;
                
            case 'deal_invitation':
                prompt = `DEAL INVITATION FOR LP

LP PROFILE:
${JSON.stringify({ name: lp.name, riskProfile: lp.investmentProfile.riskProfile }, null, 2)}

DEAL OPPORTUNITY:
${JSON.stringify(data.dealSummary, null, 2)}

Create compelling deal invitation including:
- Deal overview and highlights
- Why this deal fits LP's profile
- Key terms and expected returns
- Risk assessment and mitigation
- Investment timeline and process
- Call to action and next steps

Tone: Professional, compelling, personalized`;
                break;
                
            case 'monthly_update':
                prompt = `MONTHLY UPDATE FOR LP

LP PERFORMANCE:
- Current Investments: ${lp.activeInvestments}
- Portfolio Value: $${lp.totalInvested.toLocaleString()}
- YTD Returns: ${lp.avgReturn.toFixed(2)}%

FUND UPDATE:
${JSON.stringify(data.fundUpdate, null, 2)}

Create comprehensive monthly update including:
- LP-specific portfolio performance
- Fund-level highlights and metrics
- Market conditions and outlook
- New opportunities in pipeline
- Regulatory and operational updates
- Upcoming events and milestones

Tone: Professional, transparent, forward-looking`;
                break;
        }
        
        const result = await executeSpeedOptimizedGPT5(prompt);
        
        return {
            communicationId: generateCommunicationId(),
            lpId: lpId,
            type: type,
            createdDate: new Date().toISOString(),
            content: result.response,
            aiModel: result.config.model,
            responseTime: result.responseTime,
            status: 'draft'
        };
        
    } catch (error) {
        console.error('❌ LP communication generation failed:', error.message);
        throw new Error(`LP communication failed: ${error.message}`);
    }
}

/**
 * 📈 Track LP investment
 */
function trackLPInvestment(lpId, investmentData) {
    try {
        const lp = LP_DATABASE.find(l => l.id === lpId);
        if (!lp) {
            throw new Error('LP not found');
        }
        
        const investment = {
            investmentId: generateInvestmentId(),
            dealId: investmentData.dealId,
            amount: investmentData.amount,
            rate: investmentData.rate,
            term: investmentData.term,
            startDate: new Date().toISOString(),
            expectedReturn: investmentData.expectedReturn,
            status: 'active',
            payments: []
        };
        
        // Update LP record
        lp.investments.push(investment);
        lp.totalInvested += investmentData.amount;
        lp.activeInvestments += 1;
        lp.investmentProfile.availableCapital -= investmentData.amount;
        lp.performance.lastInvestment = new Date().toISOString();
        lp.performance.investmentActivity = 'active';
        
        // Update relationship tracking
        lp.relationship.lastContact = new Date().toISOString();
        lp.relationship.notes.push({
            date: new Date().toISOString(),
            type: 'investment',
            note: `Invested $${investmentData.amount.toLocaleString()} in ${investmentData.dealId}`
        });
        
        console.log(`✅ Investment tracked: ${lp.name} invested $${investmentData.amount.toLocaleString()}`);
        
        return {
            success: true,
            investmentId: investment.investmentId,
            lpUpdated: lp
        };
        
    } catch (error) {
        console.error('❌ Investment tracking failed:', error.message);
        throw new Error(`Investment tracking failed: ${error.message}`);
    }
}

// 🔧 UTILITY FUNCTIONS

function generateLPId() {
    return `LP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function generateAnalysisId() {
    return `ANALYSIS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function generateReportId() {
    return `RPT-LP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function generateCommunicationId() {
    return `COMM-LP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function generateInvestmentId() {
    return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function calculateLPDealCompatibility(lp, dealCriteria) {
    let score = 0;
    let maxScore = 0;
    
    // Return compatibility (40 points)
    maxScore += 40;
    if (dealCriteria.expectedReturn >= lp.investmentProfile.targetReturn) {
        score += 40;
    } else if (dealCriteria.expectedReturn >= lp.investmentProfile.targetReturn - 2) {
        score += 25;
    }
    
    // Investment size compatibility (30 points)
    maxScore += 30;
    if (dealCriteria.minInvestment <= lp.investmentProfile.maxInvestment) {
        score += 30;
    } else if (dealCriteria.minInvestment <= lp.investmentProfile.maxInvestment * 1.2) {
        score += 20;
    }
    
    // Location preference (20 points)
    maxScore += 20;
    if (lp.investmentProfile.preferredAreas === 'all' || 
        lp.investmentProfile.preferredAreas.includes(dealCriteria.location)) {
        score += 20;
    }
    
    // LTV compatibility (10 points)
    maxScore += 10;
    if (dealCriteria.ltv <= lp.investmentProfile.maxLTV) {
        score += 10;
    } else if (dealCriteria.ltv <= lp.investmentProfile.maxLTV + 5) {
        score += 5;
    }
    
    return Math.round((score / maxScore) * 100);
}

function assessInvestmentFit(lp, dealCriteria) {
    const capacityRatio = dealCriteria.minInvestment / lp.investmentProfile.availableCapital;
    
    if (capacityRatio <= 0.3) return 'EXCELLENT';
    if (capacityRatio <= 0.5) return 'GOOD';
    if (capacityRatio <= 0.8) return 'ACCEPTABLE';
    return 'STRETCHED';
}

function calculateRecommendedAllocation(lp, dealCriteria) {
    const maxAllocation = Math.min(
        lp.investmentProfile.availableCapital * 0.3, // Max 30% of available capital
        lp.investmentProfile.maxInvestment,
        dealCriteria.totalAmount
    );
    
    return Math.max(dealCriteria.minInvestment, maxAllocation);
}

function calculateLPPortfolioMetrics(lp) {
    // Basic portfolio calculations
    const totalInvestments = lp.investments.length;
    const avgInvestmentSize = totalInvestments > 0 ? lp.totalInvested / totalInvestments : 0;
    
    // Calculate IRR (simplified)
    const irr = lp.avgReturn || 0;
    
    // Risk-adjusted return (simplified)
    const riskProfile = lp.investmentProfile.riskProfile;
    const riskAdjustment = riskProfile === 'CONSERVATIVE' ? 0.8 : 
                          riskProfile === 'BALANCED' ? 1.0 : 1.2;
    const riskAdjustedReturn = irr * riskAdjustment;
    
    // Diversification score
    const uniqueDeals = new Set(lp.investments.map(inv => inv.dealId)).size;
    const diversificationScore = Math.min(100, (uniqueDeals / Math.max(1, totalInvestments)) * 100);
    
    // Activity level
    const daysSinceLastInvestment = lp.performance.lastInvestment ? 
        (Date.now() - new Date(lp.performance.lastInvestment).getTime()) / (1000 * 60 * 60 * 24) : 
        365;
    
    const activityLevel = daysSinceLastInvestment < 30 ? 'High' :
                         daysSinceLastInvestment < 90 ? 'Medium' : 'Low';
    
    return {
        irr,
        riskAdjustedReturn,
        diversificationScore,
        activityLevel,
        avgInvestmentSize,
        totalInvestments
    };
}

async function generateLPMatchingAnalysis(dealCriteria, topLPs) {
    try {
        const analysisPrompt = `LP MATCHING ANALYSIS FOR DEAL

DEAL CRITERIA:
${JSON.stringify(dealCriteria, null, 2)}

TOP MATCHING LPs:
${topLPs.map((lp, index) => `
${index + 1}. ${lp.name}
   - Compatibility: ${lp.compatibilityScore}%
   - Risk Profile: ${lp.investmentProfile.riskProfile}
   - Available Capital: $${lp.investmentProfile.availableCapital?.toLocaleString()}
   - Investment Fit: ${lp.investmentFit}
   - Recommended Allocation: $${lp.recommendedAllocation?.toLocaleString()}
`).join('')}

Provide analysis including:
1. Match quality assessment
2. Optimal allocation strategy
3. Approach recommendations for each LP
4. Potential concerns and mitigation
5. Expected conversion probability`;

        const result = await executeSpeedOptimizedGPT5(analysisPrompt);
        return result.response;
        
    } catch (error) {
        console.error('❌ LP matching analysis failed:', error.message);
        return 'Analysis generation failed';
    }
}

function extractRecommendations(analysis) {
    // Simple extraction of bullet points and recommendations
    const lines = analysis.split('\n');
    return lines.filter(line => 
        line.toLowerCase().includes('recommend') || 
        line.toLowerCase().includes('should') ||
        line.includes('•') ||
        line.includes('-')
    ).slice(0, 5);
}

// 📊 LP DATABASE OPERATIONS

function getAllLPs() {
    return LP_DATABASE;
}

function getLPById(lpId) {
    return LP_DATABASE.find(lp => lp.id === lpId);
}

function getLPsByStatus(status) {
    return LP_DATABASE.filter(lp => lp.status === status);
}

function getLPsByRiskProfile(riskProfile) {
    return LP_DATABASE.filter(lp => lp.investmentProfile.riskProfile === riskProfile);
}

function updateLPStatus(lpId, newStatus) {
    const lp = LP_DATABASE.find(l => l.id === lpId);
    if (lp) {
        lp.status = newStatus;
        lp.relationship.lastContact = new Date().toISOString();
        return lp;
    }
    return null;
}

// 📤 MAIN EXPORTS
module.exports = {
    // Core LP management
    addNewLP,
    analyzeNewLPProfile,
    findMatchingLPs,
    generateLPPortfolioReport,
    generateLPCommunication,
    trackLPInvestment,
    
    // Database operations
    getAllLPs,
    getLPById,
    getLPsByStatus,
    getLPsByRiskProfile,
    updateLPStatus,
    
    // Utility functions
    calculateLPDealCompatibility,
    calculateLPPortfolioMetrics,
    
    // Configuration
    LP_CONFIG,
    
    // Analytics functions
    getLPStatistics: () => {
        return {
            totalLPs: LP_DATABASE.length,
            activeInvestors: LP_DATABASE.filter(lp => lp.status === LP_CONFIG.STATUS.ACTIVE).length,
            totalCapital: LP_DATABASE.reduce((sum, lp) => sum + lp.investmentProfile.availableCapital, 0),
            totalInvested: LP_DATABASE.reduce((sum, lp) => sum + lp.totalInvested, 0),
            avgInvestmentSize: LP_DATABASE.length > 0 ? 
                LP_DATABASE.reduce((sum, lp) => sum + lp.totalInvested, 0) / LP_DATABASE.length : 0,
            
            byRiskProfile: {
                conservative: LP_DATABASE.filter(lp => lp.investmentProfile.riskProfile === 'CONSERVATIVE').length,
                balanced: LP_DATABASE.filter(lp => lp.investmentProfile.riskProfile === 'BALANCED').length,
                aggressive: LP_DATABASE.filter(lp => lp.investmentProfile.riskProfile === 'AGGRESSIVE').length
            },
            
            byStatus: {
                prospect: LP_DATABASE.filter(lp => lp.status === LP_CONFIG.STATUS.PROSPECT).length,
                qualified: LP_DATABASE.filter(lp => lp.status === LP_CONFIG.STATUS.QUALIFIED).length,
                active: LP_DATABASE.filter(lp => lp.status === LP_CONFIG.STATUS.ACTIVE).length,
                committed: LP_DATABASE.filter(lp => lp.status === LP_CONFIG.STATUS.COMMITTED).length
            }
        };
    }
};

console.log('🏦 LP Management System Loaded');
console.log('👥 Limited Partner relationship management active');
console.log('🎯 AI-powered LP analysis and matching enabled');
console.log('📊 Professional LP reporting and communications ready');
console.log('💼 Cambodia fund LP operations optimized');
