// cambodia/creditAssessment.js - COMPLETE: Cambodia Credit Assessment & Risk Analysis
// Enterprise-grade credit evaluation with GPT-5 intelligence for private lending fund

// 🏦 CAMBODIA CREDIT ASSESSMENT FRAMEWORK
const CAMBODIA_CREDIT_FRAMEWORK = {
    // Credit scoring parameters for Cambodia market
    scoringCriteria: {
        financial: {
            weight: 35,
            factors: [
                "Revenue stability", "Cash flow patterns", "Debt-to-income ratio",
                "Bank statements", "Asset quality", "Working capital"
            ]
        },
        business: {
            weight: 25, 
            factors: [
                "Industry sector", "Business model", "Market position",
                "Management experience", "Competitive advantages", "Growth trajectory"
            ]
        },
        collateral: {
            weight: 20,
            factors: [
                "Asset value", "Liquidity", "Title clarity", 
                "Location quality", "Market demand", "Insurance coverage"
            ]
        },
        character: {
            weight: 15,
            factors: [
                "Credit history", "Business reputation", "Personal integrity",
                "Community standing", "Previous loan performance", "Reference quality"
            ]
        },
        capacity: {
            weight: 5,
            factors: [
                "Debt service coverage", "Future earnings potential", "Economic resilience",
                "Stress test performance", "Seasonal variations", "Market adaptability"
            ]
        }
    },
    
    // Risk categories and thresholds
    riskCategories: {
        excellent: { score: "90-100", description: "Prime borrowers", interestRate: "8-12% USD", loanToValue: "80%" },
        good: { score: "80-89", description: "Strong borrowers", interestRate: "12-16% USD", loanToValue: "70%" },
        acceptable: { score: "70-79", description: "Standard borrowers", interestRate: "16-20% USD", loanToValue: "60%" },
        watchlist: { score: "60-69", description: "Monitored borrowers", interestRate: "20-24% USD", loanToValue: "50%" },
        subprime: { score: "50-59", description: "High-risk borrowers", interestRate: "24-30% USD", loanToValue: "40%" },
        declined: { score: "0-49", description: "Rejected applications", interestRate: "N/A", loanToValue: "N/A" }
    },
    
    // Cambodia-specific risk factors
    cambodiaFactors: {
        currency: {
            usdLoans: "Preferred for stability",
            khrLoans: "Higher risk due to volatility", 
            dualCurrency: "Complex but manageable"
        },
        sectors: {
            highRisk: ["Mining", "Tourism", "Garment manufacturing", "Agriculture (seasonal)"],
            mediumRisk: ["Real estate", "Construction", "Import/export", "Manufacturing"],
            lowRisk: ["Education", "Healthcare", "Essential services", "Government contracts"]
        },
        regions: {
            tier1: ["Phnom Penh", "Siem Reap", "Sihanoukville"],
            tier2: ["Battambang", "Kampong Cham", "Kandal"],
            tier3: ["Rural provinces", "Border areas", "Remote locations"]
        },
        documentation: {
            required: ["Business license", "Tax returns", "Bank statements", "Collateral documents"],
            preferred: ["Audited financials", "Insurance policies", "Credit bureau reports", "Trade references"],
            cambodiaSpecific: ["Ministry registrations", "Local permits", "Land titles", "Commune certificates"]
        }
    },
    
    // Loan products and terms
    loanProducts: {
        workingCapital: {
            amount: "$10K - $500K USD",
            term: "3-12 months",
            rate: "18-30% annually",
            collateral: "Inventory, receivables, equipment"
        },
        realEstate: {
            amount: "$50K - $2M USD", 
            term: "12-36 months",
            rate: "12-24% annually",
            collateral: "Property mortgage (1st lien)"
        },
        equipment: {
            amount: "$25K - $1M USD",
            term: "6-24 months", 
            rate: "15-25% annually",
            collateral: "Equipment lien + personal guarantee"
        },
        tradeFacility: {
            amount: "$20K - $800K USD",
            term: "1-6 months",
            rate: "20-35% annually",
            collateral: "Goods, LC, trade documents"
        },
        development: {
            amount: "$100K - $5M USD",
            term: "12-48 months",
            rate: "15-28% annually",
            collateral: "Land + construction + completion guarantee"
        }
    }
};

// 📊 BORROWER PROFILE TEMPLATES
const BORROWER_PROFILES = {
    sme: {
        name: "Small-Medium Enterprise",
        criteria: ["Annual revenue $50K-$2M", "2+ years operation", "Formal business registration"],
        evaluation: ["Financial statements", "Business plan", "Market analysis", "Management assessment"],
        collateral: ["Business assets", "Personal guarantees", "Real estate", "Equipment"],
        documentation: ["Business license", "Tax compliance", "Bank statements (12 months)", "Trade references"]
    },
    
    realEstate: {
        name: "Real Estate Developer",
        criteria: ["Property development", "Land acquisition", "Construction projects"],
        evaluation: ["Project feasibility", "Market demand", "Construction experience", "Exit strategy"],
        collateral: ["Land title", "Development rights", "Completion guarantee", "Pre-sales"],
        documentation: ["Development permits", "Construction contracts", "Market studies", "Insurance"]
    },
    
    trader: {
        name: "Import/Export Trader", 
        criteria: ["Trade business", "International transactions", "Inventory financing"],
        evaluation: ["Trade history", "Supplier relationships", "Market knowledge", "Currency exposure"],
        collateral: ["Inventory", "Receivables", "Trade documents", "Letters of credit"],
        documentation: ["Trade licenses", "Customs records", "Supplier contracts", "Customer agreements"]
    },
    
    individual: {
        name: "High Net Worth Individual",
        criteria: ["Personal loans", "Investment purposes", "Asset-backed lending"],
        evaluation: ["Income verification", "Asset portfolio", "Investment experience", "Repayment capacity"],
        collateral: ["Real estate", "Investment portfolio", "Business ownership", "Luxury assets"],
        documentation: ["Income statements", "Asset valuations", "Investment records", "Employment verification"]
    }
};

// 📋 CREDIT ASSESSMENT FUNCTIONS

/**
 * 🏦 Comprehensive Credit Assessment Analysis
 */
async function performCreditAssessment(borrowerData, loanRequest, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - COMPREHENSIVE CREDIT ASSESSMENT

BORROWER PROFILE:
• Name: ${borrowerData.name || 'Confidential'}
• Business Type: ${borrowerData.businessType || 'Not specified'}
• Industry: ${borrowerData.industry || 'Not specified'}
• Years in Operation: ${borrowerData.yearsOperation || 'Not specified'}
• Location: ${borrowerData.location || 'Cambodia'}

LOAN REQUEST:
• Amount: $${loanRequest.amount ? loanRequest.amount.toLocaleString() : 'Not specified'} USD
• Purpose: ${loanRequest.purpose || 'Not specified'}
• Term: ${loanRequest.term || 'Not specified'} months
• Proposed Collateral: ${loanRequest.collateral || 'Not specified'}

FINANCIAL INFORMATION:
• Annual Revenue: $${borrowerData.revenue ? borrowerData.revenue.toLocaleString() : 'Not provided'} USD
• Monthly Cash Flow: $${borrowerData.cashFlow ? borrowerData.cashFlow.toLocaleString() : 'Not provided'} USD
• Existing Debt: $${borrowerData.existingDebt ? borrowerData.existingDebt.toLocaleString() : 'Not provided'} USD
• Assets Value: $${borrowerData.assets ? borrowerData.assets.toLocaleString() : 'Not provided'} USD

CREDIT ASSESSMENT FRAMEWORK:

1. **FINANCIAL ANALYSIS (35% Weight)**
   - Revenue stability and growth trends
   - Cash flow adequacy for debt service
   - Debt-to-income and leverage ratios
   - Working capital and liquidity position
   - Financial statement quality and reliability

2. **BUSINESS EVALUATION (25% Weight)**
   - Industry sector risk assessment
   - Business model viability and sustainability
   - Market position and competitive advantages
   - Management quality and experience
   - Growth prospects and strategic planning

3. **COLLATERAL ASSESSMENT (20% Weight)**
   - Asset valuation and market liquidity
   - Title clarity and legal encumbrances
   - Insurance coverage and protection
   - Location quality and market demand
   - Loan-to-value ratio appropriateness

4. **CHARACTER ANALYSIS (15% Weight)**
   - Credit history and repayment track record
   - Business reputation and market standing
   - Personal integrity and reliability
   - References and community relationships
   - Previous banking and lending relationships

5. **CAPACITY EVALUATION (5% Weight)**
   - Debt service coverage ratio calculation
   - Stress testing under adverse scenarios
   - Seasonal business variations impact
   - Economic resilience and adaptability
   - Future earnings and growth potential

CAMBODIA-SPECIFIC CONSIDERATIONS:
• Currency preference (USD vs KHR vs dual)
• Regulatory compliance and licensing
• Documentation quality and availability
• Regional economic factors and risks
• Local market conditions and trends

RISK ASSESSMENT REQUIREMENTS:
• Overall credit score (0-100 scale)
• Risk category classification
• Recommended interest rate range
• Maximum loan-to-value ratio
• Required covenants and conditions
• Monitoring and reporting requirements

FINAL RECOMMENDATION:
• APPROVE / CONDITIONAL APPROVE / DECLINE
• Approved amount and terms
• Required mitigating factors
• Special conditions and covenants
• Next steps and documentation needed

Provide detailed, professional credit assessment suitable for private lending fund decision-making.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🏦 Complete Credit Assessment Report",
            forceModel: "gpt-5" // Full model for comprehensive credit analysis
        });

        // Calculate preliminary credit score based on available data
        const creditScore = calculateCreditScore(borrowerData, loanRequest);
        const riskCategory = determineRiskCategory(creditScore);
        const loanRecommendations = generateLoanRecommendations(creditScore, loanRequest);

        return {
            assessment: result.response,
            borrowerProfile: {
                name: borrowerData.name,
                businessType: borrowerData.businessType,
                industry: borrowerData.industry,
                location: borrowerData.location
            },
            loanRequest: {
                amount: loanRequest.amount,
                purpose: loanRequest.purpose,
                term: loanRequest.term,
                collateral: loanRequest.collateral
            },
            creditAnalysis: {
                creditScore: creditScore,
                riskCategory: riskCategory,
                recommendations: loanRecommendations
            },
            assessmentDate: new Date().toISOString(),
            assessor: "IMPERIUMVAULT AI Credit System",
            success: result.success,
            aiUsed: result.aiUsed,
            responseTime: result.responseTime
        };

    } catch (error) {
        console.error('❌ Credit assessment error:', error.message);
        return {
            assessment: `Credit assessment analysis unavailable: ${error.message}`,
            creditAnalysis: {
                creditScore: null,
                riskCategory: "Unable to assess",
                recommendations: "Manual review required"
            },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Calculate Preliminary Credit Score
 */
function calculateCreditScore(borrowerData, loanRequest) {
    try {
        let score = 0;
        const weights = CAMBODIA_CREDIT_FRAMEWORK.scoringCriteria;
        
        // Financial Score (35%)
        let financialScore = 0;
        if (borrowerData.revenue && borrowerData.cashFlow) {
            const debtServiceCoverage = (borrowerData.cashFlow * 12) / ((loanRequest.amount || 0) * 0.25);
            financialScore = Math.min(100, debtServiceCoverage * 20);
        } else {
            financialScore = 50; // Default middle score if data unavailable
        }
        score += (financialScore * weights.financial.weight) / 100;
        
        // Business Score (25%)
        let businessScore = 60; // Default score
        if (borrowerData.yearsOperation) {
            businessScore = Math.min(100, borrowerData.yearsOperation * 10 + 40);
        }
        if (borrowerData.industry && CAMBODIA_CREDIT_FRAMEWORK.cambodiaFactors.sectors.lowRisk.includes(borrowerData.industry)) {
            businessScore += 10;
        } else if (borrowerData.industry && CAMBODIA_CREDIT_FRAMEWORK.cambodiaFactors.sectors.highRisk.includes(borrowerData.industry)) {
            businessScore -= 15;
        }
        score += (businessScore * weights.business.weight) / 100;
        
        // Collateral Score (20%)
        let collateralScore = 70; // Default
        if (loanRequest.collateral && loanRequest.collateral.toLowerCase().includes('real estate')) {
            collateralScore = 85;
        } else if (loanRequest.collateral && loanRequest.collateral.toLowerCase().includes('equipment')) {
            collateralScore = 75;
        }
        score += (collateralScore * weights.collateral.weight) / 100;
        
        // Character Score (15%) - Default good score
        const characterScore = 75;
        score += (characterScore * weights.character.weight) / 100;
        
        // Capacity Score (5%) - Based on loan to income ratio
        let capacityScore = 70;
        if (borrowerData.revenue && loanRequest.amount) {
            const loanToRevenue = loanRequest.amount / borrowerData.revenue;
            capacityScore = Math.max(30, 100 - (loanToRevenue * 50));
        }
        score += (capacityScore * weights.capacity.weight) / 100;
        
        return Math.round(score);
        
    } catch (error) {
        console.error('❌ Credit score calculation error:', error.message);
        return 60; // Default middle score
    }
}

/**
 * 🎯 Determine Risk Category
 */
function determineRiskCategory(creditScore) {
    const categories = CAMBODIA_CREDIT_FRAMEWORK.riskCategories;
    
    if (creditScore >= 90) return categories.excellent;
    if (creditScore >= 80) return categories.good;
    if (creditScore >= 70) return categories.acceptable;
    if (creditScore >= 60) return categories.watchlist;
    if (creditScore >= 50) return categories.subprime;
    return categories.declined;
}

/**
 * 💰 Generate Loan Recommendations
 */
function generateLoanRecommendations(creditScore, loanRequest) {
    const riskCategory = determineRiskCategory(creditScore);
    
    return {
        decision: creditScore >= 60 ? "APPROVE" : "DECLINE",
        approvedAmount: creditScore >= 70 ? loanRequest.amount : Math.round(loanRequest.amount * 0.75),
        interestRate: riskCategory.interestRate,
        maxLoanToValue: riskCategory.loanToValue,
        conditions: generateConditions(creditScore),
        monitoring: generateMonitoringRequirements(creditScore)
    };
}

/**
 * 📋 Generate Loan Conditions
 */
function generateConditions(creditScore) {
    const conditions = [];
    
    if (creditScore < 80) {
        conditions.push("Personal guarantee required");
        conditions.push("Quarterly financial reporting");
    }
    
    if (creditScore < 70) {
        conditions.push("Monthly cash flow reporting");
        conditions.push("Maintain minimum cash reserves");
        conditions.push("Insurance requirements");
    }
    
    if (creditScore < 60) {
        conditions.push("Weekly monitoring calls");
        conditions.push("Restricted dividend payments");
        conditions.push("Additional collateral may be required");
    }
    
    return conditions;
}

/**
 * 📊 Generate Monitoring Requirements  
 */
function generateMonitoringRequirements(creditScore) {
    if (creditScore >= 80) {
        return "Standard monitoring - Quarterly reviews";
    } else if (creditScore >= 70) {
        return "Enhanced monitoring - Monthly reviews";
    } else if (creditScore >= 60) {
        return "Close monitoring - Bi-weekly reviews";
    } else {
        return "Intensive monitoring - Weekly reviews";
    }
}

/**
 * 🔍 Industry-Specific Risk Assessment
 */
async function analyzeIndustryRisk(industry, location, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING - INDUSTRY RISK ANALYSIS

INDUSTRY ANALYSIS REQUEST:
• Target Industry: ${industry}
• Location: ${location}
• Analysis Purpose: Credit risk assessment for private lending

FRAMEWORK FOR ANALYSIS:

1. **INDUSTRY OVERVIEW**
   - Market size and growth trends in Cambodia
   - Key players and market structure
   - Regulatory environment and compliance requirements
   - Government support and incentives

2. **RISK FACTORS**
   - Cyclical vs seasonal business patterns
   - Sensitivity to economic changes
   - Currency exposure and foreign exchange risks
   - Supply chain vulnerabilities

3. **CAMBODIA-SPECIFIC CONSIDERATIONS**
   - Local market dynamics and competition
   - Infrastructure dependencies
   - Labor market and skill availability
   - Regional economic factors

4. **LENDING IMPLICATIONS**
   - Typical loan purposes and structures
   - Collateral preferences and availability
   - Cash flow patterns and seasonality
   - Default risk indicators

5. **RISK MITIGATION STRATEGIES**
   - Recommended loan structures
   - Monitoring requirements
   - Covenant considerations
   - Exit strategies and recovery options

Provide actionable insights for lending decision-making in this industry sector.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: `🏭 ${industry} Industry Risk Analysis`,
            forceModel: "gpt-5-mini"
        });

        // Determine industry risk level
        const riskLevel = determineIndustryRisk(industry);
        const lendingGuidelines = generateIndustryLendingGuidelines(industry, riskLevel);

        return {
            analysis: result.response,
            industry: industry,
            location: location,
            riskAssessment: {
                riskLevel: riskLevel,
                riskFactors: getIndustryRiskFactors(industry),
                lendingGuidelines: lendingGuidelines
            },
            recommendations: {
                maxLTV: riskLevel === 'high' ? "50%" : riskLevel === 'medium' ? "65%" : "75%",
                interestPremium: riskLevel === 'high' ? "+5%" : riskLevel === 'medium' ? "+2%" : "0%",
                monitoring: riskLevel === 'high' ? "Monthly" : riskLevel === 'medium' ? "Quarterly" : "Standard"
            },
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Industry risk analysis error:', error.message);
        return {
            analysis: `Industry risk analysis unavailable: ${error.message}`,
            industry: industry,
            riskAssessment: { riskLevel: "unknown" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 🏭 Determine Industry Risk Level
 */
function determineIndustryRisk(industry) {
    const cambodiaFactors = CAMBODIA_CREDIT_FRAMEWORK.cambodiaFactors.sectors;
    
    if (cambodiaFactors.highRisk.some(sector => industry.toLowerCase().includes(sector.toLowerCase()))) {
        return 'high';
    } else if (cambodiaFactors.lowRisk.some(sector => industry.toLowerCase().includes(sector.toLowerCase()))) {
        return 'low';
    } else {
        return 'medium';
    }
}

/**
 * 📋 Get Industry Risk Factors
 */
function getIndustryRiskFactors(industry) {
    const riskLevel = determineIndustryRisk(industry);
    
    const riskFactors = {
        high: ["Market volatility", "Regulatory changes", "Economic sensitivity", "Competition pressure"],
        medium: ["Seasonal variations", "Supply chain risks", "Currency exposure", "Market competition"],
        low: ["Stable demand", "Regulatory protection", "Essential services", "Government support"]
    };
    
    return riskFactors[riskLevel] || riskFactors.medium;
}

/**
 * 📊 Generate Industry Lending Guidelines
 */
function generateIndustryLendingGuidelines(industry, riskLevel) {
    return {
        preferredLoanTypes: riskLevel === 'low' ? 
            ["Working capital", "Equipment", "Real estate"] :
            riskLevel === 'medium' ? 
            ["Working capital", "Trade finance"] :
            ["Asset-based", "Trade finance"],
        
        collateralRequirements: riskLevel === 'high' ? 
            "Strong collateral + personal guarantees" :
            riskLevel === 'medium' ? 
            "Adequate collateral coverage" :
            "Standard collateral requirements",
            
        documentationLevel: riskLevel === 'high' ? "Enhanced" : "Standard",
        
        monitoringFrequency: riskLevel === 'high' ? 
            "Monthly reporting" :
            riskLevel === 'medium' ? 
            "Quarterly reporting" :
            "Semi-annual reporting"
    };
}

/**
 * 🏠 Real Estate Collateral Assessment
 */
async function assessRealEstateCollateral(propertyData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA REAL ESTATE COLLATERAL ASSESSMENT

PROPERTY DETAILS:
• Property Type: ${propertyData.type || 'Not specified'}
• Location: ${propertyData.location || 'Cambodia'}
• Size: ${propertyData.size || 'Not specified'}
• Current Value: $${propertyData.currentValue ? propertyData.currentValue.toLocaleString() : 'Not appraised'} USD
• Purchase Price: $${propertyData.purchasePrice ? propertyData.purchasePrice.toLocaleString() : 'Not provided'} USD
• Purchase Date: ${propertyData.purchaseDate || 'Not provided'}

TITLE AND LEGAL:
• Title Status: ${propertyData.titleStatus || 'Not verified'}
• Ownership: ${propertyData.ownership || 'Not specified'}
• Encumbrances: ${propertyData.encumbrances || 'Not disclosed'}
• Permits: ${propertyData.permits || 'Not verified'}

COLLATERAL ASSESSMENT FRAMEWORK:

1. **VALUATION ANALYSIS**
   - Current market value assessment
   - Comparable property analysis
   - Appreciation/depreciation trends
   - Forced sale value estimation

2. **LIQUIDITY ASSESSMENT**
   - Market demand and absorption rates
   - Time to sell in normal market
   - Time to sell in distressed situation
   - Buyer pool and financing availability

3. **LEGAL AND TITLE REVIEW**
   - Title clarity and ownership verification
   - Encumbrance and lien analysis
   - Permit and compliance status
   - Transfer and foreclosure processes

4. **LOCATION AND MARKET FACTORS**
   - Neighborhood quality and trends
   - Infrastructure and accessibility
   - Economic development prospects
   - Environmental and regulatory risks

5. **COLLATERAL VALUE DETERMINATION**
   - Loan-to-value ratio recommendations
   - Collateral coverage assessment
   - Risk-adjusted collateral value
   - Insurance and protection requirements

CAMBODIA REAL ESTATE CONSIDERATIONS:
• Foreign ownership restrictions and implications
• Land title types (hard title vs soft title)
• Local market dynamics and pricing trends
• Regulatory changes and compliance requirements
• Currency considerations (USD vs KHR pricing)

LENDING RECOMMENDATIONS:
• Maximum loan-to-value ratio
• Required insurance coverage
• Environmental assessments needed
• Legal documentation requirements
• Ongoing monitoring and revaluation schedule

Provide detailed collateral assessment for lending decision-making.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🏠 Real Estate Collateral Assessment",
            forceModel: "gpt-5-mini"
        });

        // Calculate collateral metrics
        const collateralMetrics = calculateCollateralMetrics(propertyData);
        const ltvRecommendation = recommendLTV(propertyData, collateralMetrics);

        return {
            assessment: result.response,
            propertyDetails: {
                type: propertyData.type,
                location: propertyData.location,
                currentValue: propertyData.currentValue,
                size: propertyData.size
            },
            collateralAnalysis: {
                metrics: collateralMetrics,
                ltvRecommendation: ltvRecommendation,
                riskFactors: identifyCollateralRisks(propertyData),
                requirements: generateCollateralRequirements(propertyData)
            },
            assessmentDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Real estate collateral assessment error:', error.message);
        return {
            assessment: `Real estate collateral assessment unavailable: ${error.message}`,
            propertyDetails: propertyData,
            collateralAnalysis: { riskLevel: "unknown" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Calculate Collateral Metrics
 */
function calculateCollateralMetrics(propertyData) {
    const metrics = {};
    
    if (propertyData.currentValue && propertyData.purchasePrice) {
        metrics.appreciation = ((propertyData.currentValue - propertyData.purchasePrice) / propertyData.purchasePrice * 100).toFixed(2);
    }
    
    if (propertyData.location) {
        const locationTier = determineLocationTier(propertyData.location);
        metrics.locationTier = locationTier;
        metrics.liquidityScore = locationTier === 'tier1' ? 85 : locationTier === 'tier2' ? 70 : 55;
    }
    
    metrics.riskAdjustedValue = propertyData.currentValue ? 
        Math.round(propertyData.currentValue * 0.85) : null; // 15% haircut for conservative valuation
    
    return metrics;
}

/**
 * 🎯 Determine Location Tier
 */
function determineLocationTier(location) {
    const tiers = CAMBODIA_CREDIT_FRAMEWORK.cambodiaFactors.regions;
    
    if (tiers.tier1.some(city => location.toLowerCase().includes(city.toLowerCase()))) return 'tier1';
    if (tiers.tier2.some(city => location.toLowerCase().includes(city.toLowerCase()))) return 'tier2';
    return 'tier3';
}

/**
 * 💰 Recommend Loan-to-Value Ratio
 */
function recommendLTV(propertyData, collateralMetrics) {
    let baseLTV = 70; // Standard LTV
    
    // Adjust based on location tier
    if (collateralMetrics.locationTier === 'tier1') {
        baseLTV = 75;
    } else if (collateralMetrics.locationTier === 'tier3') {
        baseLTV = 60;
    }
    
    // Adjust based on property type
    if (propertyData.type && propertyData.type.toLowerCase().includes('commercial')) {
        baseLTV -= 10;
    } else if (propertyData.type && propertyData.type.toLowerCase().includes('residential')) {
        baseLTV += 5;
    }
    
    return Math.max(40, Math.min(80, baseLTV)); // Cap between 40% and 80%
}

/**
 * ⚠️ Identify Collateral Risks
 */
function identifyCollateralRisks(propertyData) {
    const risks = [];
    
    if (!propertyData.titleStatus || propertyData.titleStatus === 'unclear') {
        risks.push("Title clarity concerns");
    }
    
    if (propertyData.encumbrances && propertyData.encumbrances !== 'none') {
        risks.push("Existing encumbrances");
    }
    
    if (determineLocationTier(propertyData.location || '') === 'tier3') {
        risks.push("Limited market liquidity");
    }
    
    if (!propertyData.permits || propertyData.permits === 'incomplete') {
        risks.push("Permit and compliance issues");
    }
    
    return risks;
}

/**
 * 📋 Generate Collateral Requirements
 */
function generateCollateralRequirements(propertyData) {
    const requirements = [
        "Professional property appraisal",
        "Title verification and legal opinion",
        "Property insurance (fire and comprehensive)",
        "Survey and boundary verification"
    ];
    
    if (propertyData.type && propertyData.type.toLowerCase().includes('commercial')) {
        requirements.push("Environmental assessment");
        requirements.push("Occupancy and lease verification");
    }
    
    if (determineLocationTier(propertyData.location || '') === 'tier3') {
        requirements.push("Enhanced market analysis");
        requirements.push("Local legal counsel review");
    }
    
    return requirements;
}

/**
 * 🎯 Quick Credit Decision (Preliminary)
 */
async function getQuickCreditDecision(borrowerData, loanRequest) {
    try {
        const creditScore = calculateCreditScore(borrowerData, loanRequest);
        const riskCategory = determineRiskCategory(creditScore);
        
        const decision = {
            preliminaryDecision: creditScore >= 60 ? "PRE-APPROVED" : "REQUIRES REVIEW",
            creditScore: creditScore,
            riskCategory: riskCategory.description,
            estimatedRate: riskCategory.interestRate,
            maxLTV: riskCategory.loanToValue,
            nextSteps: generateNextSteps(creditScore),
            timeline: creditScore >= 70 ? "2-3 business days" : "5-7 business days",
            conditions: generateConditions(creditScore)
        };

        return {
            quickDecision: decision,
            borrowerName: borrowerData.name,
            requestedAmount: loanRequest.amount,
            assessmentDate: new Date().toISOString(),
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            disclaimer: "Preliminary assessment subject to full underwriting and documentation review"
        };

    } catch (error) {
        console.error('❌ Quick credit decision error:', error.message);
        return {
            quickDecision: {
                preliminaryDecision: "MANUAL REVIEW REQUIRED",
                creditScore: null,
                error: error.message
            }
        };
    }
}

/**
 * 📋 Generate Next Steps
 */
function generateNextSteps(creditScore) {
    if (creditScore >= 80) {
        return [
            "Submit formal loan application",
            "Provide required documentation",
            "Schedule property appraisal (if applicable)",
            "Await final underwriting approval"
        ];
    } else if (creditScore >= 60) {
        return [
            "Submit formal loan application",
            "Provide comprehensive financial documentation",
            "Schedule property appraisal and inspection",
            "Prepare additional collateral documentation",
            "Await enhanced underwriting review"
        ];
    } else {
        return [
            "Strengthen financial position",
            "Consider additional collateral",
            "Improve credit profile",
            "Reapply in 6 months"
        ];
    }
}

/**
 * 📊 Comprehensive Credit Portfolio Analysis
 */
async function analyzeCreditPortfolio(portfolioData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - CREDIT PORTFOLIO ANALYSIS

PORTFOLIO OVERVIEW:
• Total Loans Outstanding: ${portfolioData.totalLoans || 'Not specified'}
• Total Portfolio Value: ${portfolioData.portfolioValue ? portfolioData.portfolioValue.toLocaleString() : 'Not provided'} USD
• Average Loan Size: ${portfolioData.averageLoanSize ? portfolioData.averageLoanSize.toLocaleString() : 'Not calculated'} USD
• Portfolio Maturity: ${portfolioData.avgMaturity || 'Not specified'} months

PERFORMANCE METRICS:
• Current Default Rate: ${portfolioData.defaultRate || 'Not provided'}%
• 30+ Days Past Due: ${portfolioData.pastDue30 || 'Not provided'}%
• 90+ Days Past Due: ${portfolioData.pastDue90 || 'Not provided'}%
• Average Portfolio Yield: ${portfolioData.avgYield || 'Not provided'}%

PORTFOLIO COMPOSITION:
• Real Estate Loans: ${portfolioData.realEstate || 'Not specified'}%
• Working Capital: ${portfolioData.workingCapital || 'Not specified'}%
• Equipment Financing: ${portfolioData.equipment || 'Not specified'}%
• Trade Finance: ${portfolioData.tradeFin || 'Not specified'}%
• Other: ${portfolioData.other || 'Not specified'}%

ANALYSIS FRAMEWORK:

1. **PORTFOLIO RISK ASSESSMENT**
   - Overall credit quality distribution
   - Concentration risk analysis (geographic, industry, borrower)
   - Correlation risk and diversification metrics
   - Economic sensitivity and stress testing

2. **PERFORMANCE ANALYSIS**
   - Historical default and recovery trends
   - Vintage analysis and seasoning effects
   - Early warning indicators and leading metrics
   - Benchmark comparison with regional markets

3. **RISK MANAGEMENT EVALUATION**
   - Provision adequacy and coverage ratios
   - Collateral coverage and valuation trends
   - Risk rating migration and watch list management
   - Collection and recovery effectiveness

4. **OPTIMIZATION OPPORTUNITIES**
   - Pricing optimization across risk segments
   - Portfolio rebalancing recommendations
   - New origination strategy alignment
   - Risk appetite and limit structure review

5. **FORWARD-LOOKING ANALYSIS**
   - Economic scenario impact assessment
   - Portfolio growth and composition targets
   - Capital adequacy and funding requirements
   - Strategic positioning recommendations

CAMBODIA MARKET CONTEXT:
• Local economic conditions and outlook
• Regulatory environment and compliance requirements
• Currency and foreign exchange considerations
• Competition and market positioning

Provide comprehensive portfolio analysis with actionable recommendations for risk management and performance optimization.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📊 Credit Portfolio Risk Analysis",
            forceModel: "gpt-5" // Full model for comprehensive portfolio analysis
        });

        // Calculate portfolio metrics
        const portfolioMetrics = calculatePortfolioMetrics(portfolioData);
        const riskAssessment = assessPortfolioRisk(portfolioData);
        const recommendations = generatePortfolioRecommendations(portfolioMetrics, riskAssessment);

        return {
            analysis: result.response,
            portfolioSummary: {
                totalValue: portfolioData.portfolioValue,
                loanCount: portfolioData.totalLoans,
                averageSize: portfolioData.averageLoanSize,
                avgYield: portfolioData.avgYield
            },
            riskMetrics: portfolioMetrics,
            riskAssessment: riskAssessment,
            recommendations: recommendations,
            analysisDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Credit portfolio analysis error:', error.message);
        return {
            analysis: `Credit portfolio analysis unavailable: ${error.message}`,
            portfolioSummary: portfolioData,
            success: false,
            error: error.message
        };
    }
}

/**
 * 📈 Calculate Portfolio Metrics
 */
function calculatePortfolioMetrics(portfolioData) {
    const metrics = {};
    
    if (portfolioData.portfolioValue && portfolioData.totalLoans) {
        metrics.averageLoanSize = Math.round(portfolioData.portfolioValue / portfolioData.totalLoans);
    }
    
    if (portfolioData.defaultRate !== undefined) {
        metrics.riskLevel = portfolioData.defaultRate > 5 ? "High" : 
                           portfolioData.defaultRate > 2 ? "Medium" : "Low";
    }
    
    if (portfolioData.avgYield !== undefined) {
        metrics.yieldCategory = portfolioData.avgYield > 20 ? "High Yield" :
                               portfolioData.avgYield > 15 ? "Standard" : "Conservative";
    }
    
    // Calculate concentration risk (simplified)
    const concentrationScore = calculateConcentrationRisk(portfolioData);
    metrics.concentrationRisk = concentrationScore;
    
    return metrics;
}

/**
 * 🎯 Calculate Concentration Risk
 */
function calculateConcentrationRisk(portfolioData) {
    let riskScore = 0;
    
    // Check sector concentration
    const sectors = [
        portfolioData.realEstate || 0,
        portfolioData.workingCapital || 0,
        portfolioData.equipment || 0,
        portfolioData.tradeFin || 0
    ];
    
    const maxConcentration = Math.max(...sectors);
    if (maxConcentration > 50) riskScore += 3;
    else if (maxConcentration > 35) riskScore += 2;
    else if (maxConcentration > 25) riskScore += 1;
    
    return riskScore <= 1 ? "Low" : riskScore <= 3 ? "Medium" : "High";
}

/**
 * ⚠️ Assess Portfolio Risk
 */
function assessPortfolioRisk(portfolioData) {
    const riskFactors = [];
    const opportunities = [];
    
    if (portfolioData.defaultRate > 3) {
        riskFactors.push("Elevated default rate requires attention");
    }
    
    if (portfolioData.pastDue30 > 8) {
        riskFactors.push("High early delinquency indicates collection issues");
    }
    
    if ((portfolioData.realEstate || 0) > 40) {
        riskFactors.push("High real estate concentration risk");
    }
    
    if (portfolioData.avgYield < 15) {
        opportunities.push("Potential for yield optimization");
    }
    
    if ((portfolioData.tradeFin || 0) < 10) {
        opportunities.push("Opportunity to expand trade finance");
    }
    
    return {
        riskFactors: riskFactors,
        opportunities: opportunities,
        overallRisk: riskFactors.length > 2 ? "High" : riskFactors.length > 0 ? "Medium" : "Low"
    };
}

/**
 * 💡 Generate Portfolio Recommendations
 */
function generatePortfolioRecommendations(metrics, riskAssessment) {
    const recommendations = [];
    
    if (riskAssessment.overallRisk === "High") {
        recommendations.push("Implement enhanced risk management procedures");
        recommendations.push("Increase loan loss provisions");
        recommendations.push("Tighten underwriting standards");
    }
    
    if (metrics.concentrationRisk === "High") {
        recommendations.push("Diversify portfolio across sectors and geographies");
        recommendations.push("Implement concentration limits");
    }
    
    if (riskAssessment.opportunities.length > 0) {
        recommendations.push("Explore identified growth opportunities");
        recommendations.push("Optimize pricing strategy");
    }
    
    recommendations.push("Regular portfolio stress testing");
    recommendations.push("Enhanced early warning system implementation");
    
    return recommendations;
}

/**
 * 🎯 Credit Assessment Quick Insights
 */
function getCreditAssessmentQuickInsights() {
    return {
        frameworkSummary: {
            scoringCriteria: Object.keys(CAMBODIA_CREDIT_FRAMEWORK.scoringCriteria),
            riskCategories: Object.keys(CAMBODIA_CREDIT_FRAMEWORK.riskCategories).length,
            loanProducts: Object.keys(CAMBODIA_CREDIT_FRAMEWORK.loanProducts).length,
            borrowerTypes: Object.keys(BORROWER_PROFILES).length
        },
        
        riskCategories: {
            excellent: "90-100 score, 8-12% rates",
            good: "80-89 score, 12-16% rates", 
            acceptable: "70-79 score, 16-20% rates",
            watchlist: "60-69 score, 20-24% rates",
            subprime: "50-59 score, 24-30% rates",
            declined: "0-49 score, not approved"
        },
        
        loanProducts: {
            workingCapital: "$10K-$500K, 3-12mo, 18-30%",
            realEstate: "$50K-$2M, 12-36mo, 12-24%",
            equipment: "$25K-$1M, 6-24mo, 15-25%",
            tradeFacility: "$20K-$800K, 1-6mo, 20-35%",
            development: "$100K-$5M, 12-48mo, 15-28%"
        },
        
        cambodiaSpecific: {
            preferredCurrency: "USD for stability",
            highRiskSectors: CAMBODIA_CREDIT_FRAMEWORK.cambodiaFactors.sectors.highRisk,
            tier1Locations: CAMBODIA_CREDIT_FRAMEWORK.cambodiaFactors.regions.tier1,
            requiredDocs: CAMBODIA_CREDIT_FRAMEWORK.cambodiaFactors.documentation.required
        },
        
        keyFeatures: [
            "GPT-5 enhanced credit analysis",
            "Cambodia-specific risk factors",
            "Real estate collateral assessment",
            "Industry risk evaluation",
            "Portfolio risk management",
            "Quick preliminary decisions"
        ],

        dataTimestamp: new Date().toISOString(),
        systemVersion: "IMPERIUMVAULT Credit Assessment v1.0"
    };
}

// 📤 COMPREHENSIVE EXPORTS
module.exports = {
    // 📊 Framework and data
    CAMBODIA_CREDIT_FRAMEWORK,
    BORROWER_PROFILES,
    
    // 🏦 Core credit assessment functions
    performCreditAssessment,
    getQuickCreditDecision,
    analyzeCreditPortfolio,
    
    // 🔍 Specialized analysis functions
    analyzeIndustryRisk,
    assessRealEstateCollateral,
    
    // 🎯 Quick access functions
    getCreditAssessmentQuickInsights,
    
    // 📈 Utility functions
    calculateCreditScore,
    determineRiskCategory,
    generateLoanRecommendations,
    
    // 🔧 Helper functions
    determineIndustryRisk,
    calculateCollateralMetrics,
    recommendLTV,
    identifyCollateralRisks,
    
    // 📊 Portfolio management
    calculatePortfolioMetrics,
    assessPortfolioRisk,
    generatePortfolioRecommendations
};

console.log('🏦 Cambodia Credit Assessment Module Loaded');
console.log('📊 Framework: 5-Factor Credit Scoring + Cambodia Risk Factors');
console.log('🎯 Coverage: SME, Real Estate, Trading, Individual Lending');
console.log('💰 Products: Working Capital, Real Estate, Equipment, Trade, Development');
console.log('🚀 GPT-5 Enhanced: Comprehensive Credit Analysis + Risk Assessment');
console.log('✅ Ready for professional lending fund operations');
