// cambodia/dealIntelligence.js - REAL AI Integration for Cambodia Private Lending
// Professional deal matching and analysis system using GPT-5

// 🇰🇭 CAMBODIA DEAL INTELLIGENCE CONFIGURATION
const CAMBODIA_CONFIG = {
    // Market parameters
    MARKET: {
        CURRENCY: 'USD',
        MIN_DEAL_SIZE: 100000,        // $100K minimum
        MAX_DEAL_SIZE: 10000000,      // $10M maximum
        TYPICAL_RATES: {
            COMMERCIAL: { min: 12, max: 18 },     // 12-18% annually
            RESIDENTIAL: { min: 10, max: 15 },    // 10-15% annually
            DEVELOPMENT: { min: 15, max: 24 }     // 15-24% annually
        },
        HOT_AREAS: [
            'BKK1', 'BKK2', 'BKK3', 'Chamkar Mon', 'Daun Penh',
            'Toul Kork', 'Sen Sok', 'Siem Reap', 'Sihanoukville'
        ]
    },
    
    // LP criteria templates
    LP_PROFILES: {
        CONSERVATIVE: {
            risk_tolerance: 'low',
            min_return: 12,
            max_ltv: 60,
            preferred_areas: ['BKK1', 'BKK2', 'BKK3'],
            max_investment: 1000000
        },
        BALANCED: {
            risk_tolerance: 'medium',
            min_return: 15,
            max_ltv: 70,
            preferred_areas: ['BKK1', 'BKK2', 'BKK3', 'Chamkar Mon'],
            max_investment: 2000000
        },
        AGGRESSIVE: {
            risk_tolerance: 'high',
            min_return: 18,
            max_ltv: 80,
            preferred_areas: 'all',
            max_investment: 5000000
        }
    }
};

// 🎯 DEAL ANALYSIS FUNCTIONS

/**
 * 📊 Analyze incoming deal opportunity
 */
async function analyzeDealOpportunity(dealData) {
    try {
        console.log('🏢 Analyzing Cambodia deal opportunity...');
        
        const analysisPrompt = `CAMBODIA REAL ESTATE DEAL ANALYSIS

DEAL DETAILS:
- Property Type: ${dealData.propertyType || 'Commercial'}
- Location: ${dealData.location || 'Phnom Penh'}
- Loan Amount: $${dealData.loanAmount?.toLocaleString() || 'TBD'}
- Interest Rate: ${dealData.interestRate || 'TBD'}% annually
- Loan Term: ${dealData.loanTerm || 'TBD'} months
- LTV Ratio: ${dealData.ltv || 'TBD'}%
- Borrower Profile: ${dealData.borrowerProfile || 'To be assessed'}
- Property Value: $${dealData.propertyValue?.toLocaleString() || 'TBD'}
- Purpose: ${dealData.purpose || 'Investment/Development'}

ANALYSIS REQUIREMENTS:
1. RISK ASSESSMENT
   - Location risk (political, economic, market)
   - Borrower risk profile
   - Property type and market segment analysis
   - LTV and collateral evaluation

2. MARKET COMPARISON
   - Compare rates vs current Cambodia market (12-24% range)
   - Location desirability (BKK1/2/3 premium vs outer areas)
   - Property type demand and liquidity

3. LP MATCHING POTENTIAL
   - Conservative LP fit (low risk, 12-15% return)
   - Balanced LP fit (medium risk, 15-18% return)  
   - Aggressive LP fit (high risk, 18%+ return)

4. DEAL STRUCTURE RECOMMENDATIONS
   - Optimal loan terms and conditions
   - Risk mitigation strategies
   - Exit strategy considerations

5. REGULATORY & COMPLIANCE
   - Foreign ownership considerations
   - Legal structure recommendations
   - Documentation requirements

Please provide comprehensive analysis with specific recommendations for LP matching and deal optimization.`;

        const result = await executeSpeedOptimizedGPT5(analysisPrompt);
        
        return {
            dealId: generateDealId(),
            analysisDate: new Date().toISOString(),
            dealData: dealData,
            analysis: result.response,
            aiModel: result.config.model,
            responseTime: result.responseTime,
            gpt5Role: result.gpt5Role,
            confidence: result.roleConfidence,
            riskScore: calculateRiskScore(dealData),
            lpCompatibility: await calculateLPCompatibility(dealData, result.response)
        };
        
    } catch (error) {
        console.error('❌ Deal analysis failed:', error.message);
        throw new Error(`Deal analysis failed: ${error.message}`);
    }
}

/**
 * 🎯 Match deal with available LPs
 */
async function matchWithLPs(dealAnalysis, availableLPs = []) {
    try {
        console.log('🎯 Matching deal with LPs...');
        
        const matchingPrompt = `LP MATCHING ANALYSIS FOR CAMBODIA DEAL

DEAL SUMMARY:
${dealAnalysis.analysis.substring(0, 1000)}...

AVAILABLE LP PROFILES:
${availableLPs.map((lp, index) => `
LP ${index + 1}: ${lp.name || `LP-${index + 1}`}
- Risk Tolerance: ${lp.riskTolerance || 'Medium'}
- Target Return: ${lp.targetReturn || '15'}%+ annually
- Max Investment: $${lp.maxInvestment?.toLocaleString() || '1M'}
- Preferred Areas: ${lp.preferredAreas?.join(', ') || 'BKK1, BKK2, BKK3'}
- Max LTV: ${lp.maxLTV || '70'}%
- Investment Timeline: ${lp.timeline || '12-24 months'}
`).join('')}

MATCHING ANALYSIS REQUIREMENTS:
1. COMPATIBILITY SCORING (0-100%)
   - Risk profile alignment
   - Return expectation match
   - Investment size fit
   - Location preference match
   - Timeline compatibility

2. RANKING & RECOMMENDATIONS
   - Rank LPs by compatibility score
   - Identify best fit LP(s)
   - Flag any misalignments

3. PITCH STRATEGY
   - Key selling points for each LP
   - Address potential concerns
   - Recommended approach for each LP

4. DEAL MODIFICATION SUGGESTIONS
   - Potential adjustments to improve LP fit
   - Alternative structuring options

Please provide detailed LP matching analysis with specific recommendations.`;

        const result = await executeSpeedOptimizedGPT5(matchingPrompt);
        
        // Calculate compatibility scores
        const lpScores = availableLPs.map((lp, index) => ({
            lpId: lp.id || `LP-${index + 1}`,
            name: lp.name || `LP-${index + 1}`,
            compatibilityScore: calculateCompatibilityScore(dealAnalysis.dealData, lp),
            riskMatch: assessRiskMatch(dealAnalysis.riskScore, lp.riskTolerance),
            investmentFit: assessInvestmentFit(dealAnalysis.dealData.loanAmount, lp.maxInvestment)
        })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        
        return {
            matchingId: generateMatchingId(),
            dealId: dealAnalysis.dealId,
            matchingDate: new Date().toISOString(),
            matchingAnalysis: result.response,
            lpScores: lpScores,
            topMatches: lpScores.slice(0, 3),
            aiModel: result.config.model,
            responseTime: result.responseTime,
            recommendedAction: getRecommendedAction(lpScores)
        };
        
    } catch (error) {
        console.error('❌ LP matching failed:', error.message);
        throw new Error(`LP matching failed: ${error.message}`);
    }
}

/**
 * 📋 Generate due diligence checklist
 */
async function generateDueDiligenceChecklist(dealData) {
    try {
        console.log('📋 Generating due diligence checklist...');
        
        const checklistPrompt = `CAMBODIA REAL ESTATE DUE DILIGENCE CHECKLIST

DEAL PARAMETERS:
- Property Type: ${dealData.propertyType}
- Location: ${dealData.location}
- Loan Amount: $${dealData.loanAmount?.toLocaleString()}
- Property Value: $${dealData.propertyValue?.toLocaleString()}
- Borrower: ${dealData.borrowerProfile}

Generate comprehensive due diligence checklist covering:

1. LEGAL DUE DILIGENCE
   - Property title verification
   - Land ownership documentation
   - Foreign ownership compliance
   - Zoning and permits
   - Legal encumbrances

2. FINANCIAL DUE DILIGENCE  
   - Borrower financial statements
   - Property valuation verification
   - Income/rental verification
   - Debt service coverage analysis
   - Cash flow projections

3. PROPERTY DUE DILIGENCE
   - Physical property inspection
   - Structural assessment
   - Environmental review
   - Utilities and infrastructure
   - Market comparables

4. MARKET DUE DILIGENCE
   - Local market analysis
   - Comparable sales/rentals
   - Area development plans
   - Economic indicators
   - Political stability assessment

5. REGULATORY DUE DILIGENCE
   - SECC compliance requirements
   - Tax implications
   - Foreign exchange regulations
   - Banking regulations
   - Exit strategy legal framework

Create detailed checklist with specific action items, required documents, and responsible parties.`;

        const result = await executeSpeedOptimizedGPT5(checklistPrompt);
        
        return {
            checklistId: generateChecklistId(),
            dealId: dealData.dealId,
            createdDate: new Date().toISOString(),
            checklist: result.response,
            aiModel: result.config.model,
            responseTime: result.responseTime,
            estimatedCompletionTime: '5-10 business days',
            criticalItems: extractCriticalItems(result.response)
        };
        
    } catch (error) {
        console.error('❌ Checklist generation failed:', error.message);
        throw new Error(`Checklist generation failed: ${error.message}`);
    }
}

/**
 * 📈 Generate market intelligence report
 */
async function generateMarketIntelligence() {
    try {
        console.log('📈 Generating Cambodia market intelligence...');
        
        const marketPrompt = `CAMBODIA REAL ESTATE LENDING MARKET INTELLIGENCE REPORT

Generate comprehensive market analysis covering:

1. CURRENT MARKET CONDITIONS (Q4 2024/Q1 2025)
   - Interest rate environment (12-24% range analysis)
   - Property price trends by area
   - Lending volume and activity
   - Foreign investment flows

2. ECONOMIC INDICATORS
   - GDP growth impact on real estate
   - USD-KHR exchange rate stability
   - Inflation effects on property values
   - Government fiscal policy impacts

3. POLITICAL & REGULATORY ENVIRONMENT
   - Political stability assessment
   - Regulatory changes affecting foreign investment
   - Banking sector developments
   - SECC regulatory updates

4. MARKET OPPORTUNITIES
   - Undervalued areas with growth potential
   - Emerging property types and uses
   - Gap analysis in lending market
   - Optimal deal structures for current environment

5. RISK FACTORS
   - Key risks for 2025
   - Early warning indicators
   - Risk mitigation strategies
   - Black swan scenarios

6. INVESTMENT RECOMMENDATIONS
   - Preferred locations and property types
   - Optimal lending terms and structures
   - LP positioning strategies
   - Market timing considerations

Focus on actionable insights for private lending operations in Cambodia.`;

        const result = await executeSpeedOptimizedGPT5(marketPrompt);
        
        return {
            reportId: generateReportId(),
            reportDate: new Date().toISOString(),
            reportType: 'Market Intelligence',
            market: 'Cambodia Real Estate Lending',
            content: result.response,
            aiModel: result.config.model,
            responseTime: result.responseTime,
            validityPeriod: '30 days',
            nextUpdateDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
    } catch (error) {
        console.error('❌ Market intelligence generation failed:', error.message);
        throw new Error(`Market intelligence failed: ${error.message}`);
    }
}

/**
 * 📧 Generate investor communication
 */
async function generateInvestorCommunication(type, data = {}) {
    try {
        console.log(`📧 Generating ${type} communication...`);
        
        let prompt = '';
        
        switch (type) {
            case 'deal_presentation':
                prompt = `INVESTOR DEAL PRESENTATION

DEAL OPPORTUNITY:
${JSON.stringify(data.dealSummary, null, 2)}

Create professional investor presentation including:
- Executive summary
- Deal highlights and key metrics
- Market opportunity analysis
- Risk assessment and mitigation
- Investment structure and terms
- Expected returns and timeline
- Next steps and call to action

Tone: Professional, confident, data-driven
Format: Structured presentation with clear sections`;
                break;
                
            case 'monthly_update':
                prompt = `MONTHLY INVESTOR UPDATE

PORTFOLIO DATA:
${JSON.stringify(data.portfolioSummary, null, 2)}

Create comprehensive monthly update including:
- Portfolio performance summary
- New deal pipeline and completions
- Market conditions and outlook
- Regulatory updates affecting investments
- Key metrics and financial highlights
- Upcoming opportunities and timeline

Tone: Professional, transparent, forward-looking`;
                break;
                
            case 'deal_completion':
                prompt = `DEAL COMPLETION NOTICE

COMPLETED DEAL:
${JSON.stringify(data.completedDeal, null, 2)}

Create deal completion announcement including:
- Deal summary and final terms
- Timeline from origination to completion
- Key success factors
- Returns achieved vs projected
- Lessons learned and best practices
- Thank you to participating LPs

Tone: Celebratory, professional, grateful`;
                break;
        }
        
        const result = await executeSpeedOptimizedGPT5(prompt);
        
        return {
            communicationId: generateCommunicationId(),
            type: type,
            createdDate: new Date().toISOString(),
            content: result.response,
            aiModel: result.config.model,
            responseTime: result.responseTime,
            recipientType: 'LPs and Investors',
            status: 'draft'
        };
        
    } catch (error) {
        console.error('❌ Communication generation failed:', error.message);
        throw new Error(`Communication generation failed: ${error.message}`);
    }
}

// 🔧 UTILITY FUNCTIONS

function generateDealId() {
    return `DEAL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function generateMatchingId() {
    return `MATCH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function generateChecklistId() {
    return `DD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function generateReportId() {
    return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function generateCommunicationId() {
    return `COMM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function calculateRiskScore(dealData) {
    let score = 50; // Base score
    
    // Location risk adjustment
    if (CAMBODIA_CONFIG.MARKET.HOT_AREAS.includes(dealData.location)) {
        score -= 10; // Lower risk for hot areas
    } else {
        score += 10; // Higher risk for other areas
    }
    
    // LTV risk adjustment
    if (dealData.ltv > 80) score += 15;
    else if (dealData.ltv > 70) score += 5;
    else if (dealData.ltv < 60) score -= 5;
    
    // Loan amount risk adjustment
    if (dealData.loanAmount > 5000000) score += 10;
    else if (dealData.loanAmount < 500000) score += 5;
    
    return Math.max(0, Math.min(100, score));
}

async function calculateLPCompatibility(dealData, analysis) {
    const profiles = Object.keys(CAMBODIA_CONFIG.LP_PROFILES);
    const compatibility = {};
    
    profiles.forEach(profile => {
        const lpProfile = CAMBODIA_CONFIG.LP_PROFILES[profile];
        let score = 50;
        
        // Rate compatibility
        if (dealData.interestRate >= lpProfile.min_return) score += 20;
        
        // LTV compatibility  
        if (dealData.ltv <= lpProfile.max_ltv) score += 15;
        
        // Location compatibility
        if (lpProfile.preferred_areas === 'all' || lpProfile.preferred_areas.includes(dealData.location)) {
            score += 15;
        }
        
        compatibility[profile] = Math.max(0, Math.min(100, score));
    });
    
    return compatibility;
}

function calculateCompatibilityScore(dealData, lpProfile) {
    let score = 0;
    let maxScore = 0;
    
    // Interest rate match (30 points)
    maxScore += 30;
    if (dealData.interestRate >= lpProfile.targetReturn) {
        score += 30;
    } else if (dealData.interestRate >= lpProfile.targetReturn - 2) {
        score += 20;
    }
    
    // Investment size match (25 points)
    maxScore += 25;
    if (dealData.loanAmount <= lpProfile.maxInvestment) {
        score += 25;
    } else if (dealData.loanAmount <= lpProfile.maxInvestment * 1.2) {
        score += 15;
    }
    
    // Location match (20 points)
    maxScore += 20;
    if (lpProfile.preferredAreas === 'all' || lpProfile.preferredAreas.includes(dealData.location)) {
        score += 20;
    }
    
    // LTV match (15 points)
    maxScore += 15;
    if (dealData.ltv <= lpProfile.maxLTV) {
        score += 15;
    } else if (dealData.ltv <= lpProfile.maxLTV + 5) {
        score += 10;
    }
    
    // Risk tolerance match (10 points)
    maxScore += 10;
    const dealRisk = calculateRiskScore(dealData);
    if ((lpProfile.riskTolerance === 'low' && dealRisk < 40) ||
        (lpProfile.riskTolerance === 'medium' && dealRisk < 70) ||
        (lpProfile.riskTolerance === 'high')) {
        score += 10;
    }
    
    return Math.round((score / maxScore) * 100);
}

function assessRiskMatch(dealRiskScore, lpRiskTolerance) {
    if (lpRiskTolerance === 'low' && dealRiskScore < 40) return 'EXCELLENT';
    if (lpRiskTolerance === 'medium' && dealRiskScore < 70) return 'GOOD';
    if (lpRiskTolerance === 'high') return 'ACCEPTABLE';
    return 'POOR';
}

function assessInvestmentFit(dealAmount, lpMaxInvestment) {
    const ratio = dealAmount / lpMaxInvestment;
    if (ratio <= 0.8) return 'EXCELLENT';
    if (ratio <= 1.0) return 'GOOD';
    if (ratio <= 1.2) return 'ACCEPTABLE';
    return 'POOR';
}

function getRecommendedAction(lpScores) {
    const topScore = lpScores[0]?.compatibilityScore || 0;
    
    if (topScore >= 80) return 'PROCEED - Excellent LP match found';
    if (topScore >= 60) return 'CONSIDER - Good LP match, review terms';
    if (topScore >= 40) return 'MODIFY - Adjust deal structure for better fit';
    return 'HOLD - Poor LP compatibility, seek alternative opportunities';
}

function extractCriticalItems(checklist) {
    // Simple extraction of items marked as critical/urgent
    const lines = checklist.split('\n');
    return lines.filter(line => 
        line.toLowerCase().includes('critical') || 
        line.toLowerCase().includes('urgent') ||
        line.toLowerCase().includes('required')
    ).slice(0, 5);
}

// 📊 TELEGRAM INTEGRATION for Real-time Updates

async function sendDealAnalysisToTelegram(bot, chatId, dealAnalysis) {
    const summary = `🏢 *CAMBODIA DEAL ANALYSIS COMPLETE*

📋 *Deal ID:* ${dealAnalysis.dealId}
🏠 *Property:* ${dealAnalysis.dealData.propertyType} in ${dealAnalysis.dealData.location}
💰 *Loan Amount:* $${dealAnalysis.dealData.loanAmount?.toLocaleString()}
📊 *Risk Score:* ${dealAnalysis.riskScore}/100
🎯 *LP Compatibility:* ${Object.entries(dealAnalysis.lpCompatibility).map(([profile, score]) => `${profile}: ${score}%`).join(', ')}

🤖 *AI Analysis:* ${dealAnalysis.gpt5Role} mode (${dealAnalysis.confidence}% confidence)
⏱️ *Processing Time:* ${Math.round(dealAnalysis.responseTime / 1000)}s

*Full analysis available for review.*`;

    return await sendSmartMessage(bot, chatId, summary, {
        title: 'Deal Analysis Complete',
        type: 'cambodia',
        aiModel: dealAnalysis.aiModel,
        responseTime: dealAnalysis.responseTime,
        includeMetadata: true
    });
}

async function sendLPMatchingToTelegram(bot, chatId, matchingResult) {
    const topMatches = matchingResult.topMatches.slice(0, 3);
    
    const summary = `🎯 *LP MATCHING COMPLETE*

📋 *Deal ID:* ${matchingResult.dealId}
🎯 *Matching ID:* ${matchingResult.matchingId}

*TOP LP MATCHES:*
${topMatches.map((match, index) => `
${index + 1}. **${match.name}**
   • Compatibility: ${match.compatibilityScore}%
   • Risk Match: ${match.riskMatch}
   • Investment Fit: ${match.investmentFit}`).join('')}

💡 *Recommendation:* ${matchingResult.recommendedAction}

⏱️ *Processing Time:* ${Math.round(matchingResult.responseTime / 1000)}s

*Detailed analysis and pitch strategies available.*`;

    return await sendSmartMessage(bot, chatId, summary, {
        title: 'LP Matching Complete',
        type: 'portfolio',
        aiModel: matchingResult.aiModel,
        responseTime: matchingResult.responseTime,
        includeMetadata: true
    });
}

// 📤 MAIN EXPORTS
module.exports = {
    // Core functions
    analyzeDealOpportunity,
    matchWithLPs,
    generateDueDiligenceChecklist,
    generateMarketIntelligence,
    generateInvestorCommunication,
    
    // Telegram integration
    sendDealAnalysisToTelegram,
    sendLPMatchingToTelegram,
    
    // Configuration
    CAMBODIA_CONFIG,
    
    // Utility functions
    generateDealId,
    calculateRiskScore,
    calculateCompatibilityScore,
    
    // Workflow functions
    processDealWorkflow: async (dealData, availableLPs = [], options = {}) => {
        try {
            console.log('🔄 Starting Cambodia deal workflow...');
            
            // Step 1: Analyze deal
            const dealAnalysis = await analyzeDealOpportunity(dealData);
            
            // Step 2: Match with LPs
            const lpMatching = await matchWithLPs(dealAnalysis, availableLPs);
            
            // Step 3: Generate due diligence checklist
            const ddChecklist = await generateDueDiligenceChecklist({
                ...dealData,
                dealId: dealAnalysis.dealId
            });
            
            // Step 4: Send Telegram updates if configured
            if (options.telegramBot && options.chatId) {
                await sendDealAnalysisToTelegram(options.telegramBot, options.chatId, dealAnalysis);
                await sendLPMatchingToTelegram(options.telegramBot, options.chatId, lpMatching);
            }
            
            return {
                workflowId: `WF-${Date.now()}`,
                status: 'completed',
                dealAnalysis,
                lpMatching,
                ddChecklist,
                summary: {
                    dealId: dealAnalysis.dealId,
                    riskScore: dealAnalysis.riskScore,
                    topLPMatch: lpMatching.topMatches[0],
                    recommendedAction: lpMatching.recommendedAction,
                    totalProcessingTime: dealAnalysis.responseTime + lpMatching.responseTime
                }
            };
            
        } catch (error) {
            console.error('❌ Deal workflow failed:', error.message);
            throw error;
        }
    }
};

console.log('🇰🇭 Cambodia Deal Intelligence System Loaded');
console.log('🏢 Real estate deal analysis and LP matching active');
console.log('🎯 AI-powered due diligence and market intelligence ready');
console.log('📊 Professional investor communications and reporting enabled');
console.log('🚀 Ready to process Cambodia private lending opportunities');
