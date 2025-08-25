// cambodia/loanOrigination.js - COMPLETE: Cambodia Loan Origination & Processing System
// Enterprise-grade loan processing with GPT-5 intelligence for private lending fund

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

// 💰 CAMBODIA LOAN ORIGINATION FRAMEWORK
const LOAN_ORIGINATION_FRAMEWORK = {
    // Loan application stages
    applicationStages: {
        initial: {
            stage: 1,
            name: "Initial Application",
            duration: "1-2 days",
            requirements: ["Basic application form", "Initial documentation", "Preliminary review"],
            outcome: "Pre-qualification decision"
        },
        documentation: {
            stage: 2,  
            name: "Documentation Collection",
            duration: "3-5 days",
            requirements: ["Complete financial documents", "Collateral documentation", "Legal papers"],
            outcome: "Documentation completeness verification"
        },
        underwriting: {
            stage: 3,
            name: "Credit Underwriting",
            duration: "2-4 days", 
            requirements: ["Credit analysis", "Risk assessment", "Collateral valuation"],
            outcome: "Credit decision and terms"
        },
        approval: {
            stage: 4,
            name: "Final Approval",
            duration: "1-2 days",
            requirements: ["Management approval", "Terms negotiation", "Conditions fulfillment"],
            outcome: "Loan approval with final terms"
        },
        documentation_final: {
            stage: 5,
            name: "Legal Documentation", 
            duration: "2-3 days",
            requirements: ["Loan agreement", "Security documents", "Legal review"],
            outcome: "Executed loan documents"
        },
        funding: {
            stage: 6,
            name: "Loan Funding",
            duration: "1 day",
            requirements: ["Final conditions met", "Disbursement instructions", "Fund transfer"],
            outcome: "Loan funded and active"
        }
    },

    // Document requirements by loan type
    documentRequirements: {
        workingCapital: {
            financial: ["3 years tax returns", "12 months bank statements", "Financial statements"],
            business: ["Business license", "Registration documents", "Trade references"],
            collateral: ["Inventory list", "Receivables aging", "Equipment list"],
            legal: ["Personal guarantee", "UCC filings", "Insurance certificates"]
        },
        realEstate: {
            financial: ["Income verification", "Asset statements", "Debt schedule"],
            property: ["Property appraisal", "Title report", "Survey", "Environmental report"],
            legal: ["Purchase agreement", "Insurance binder", "Property tax records"],
            permits: ["Building permits", "Zoning compliance", "Occupancy permits"]
        },
        equipment: {
            financial: ["Financial statements", "Cash flow projections", "Tax returns"],
            equipment: ["Equipment specifications", "Vendor invoices", "Installation quotes"],
            business: ["Business plan", "Management resumes", "Industry analysis"],
            legal: ["Equipment lien", "Personal guarantee", "Insurance coverage"]
        },
        tradeFacility: {
            trade: ["Trade history", "Supplier agreements", "Customer contracts"],
            financial: ["Bank statements", "Trade finance experience", "Credit references"],
            inventory: ["Inventory reports", "Warehouse receipts", "Quality certificates"],
            legal: ["Trade license", "Import/export permits", "Insurance documents"]
        },
        development: {
            project: ["Development plans", "Construction contracts", "Market studies"],
            financial: ["Project pro forma", "Construction budget", "Funding sources"],
            approvals: ["Development permits", "Environmental clearance", "Zoning approval"],
            legal: ["Land title", "Construction agreements", "Completion guarantee"]
        }
    },

    // Cambodia-specific requirements
    cambodiaRequirements: {
        businessLicense: {
            required: ["Ministry of Commerce registration", "Tax registration", "VAT certificate"],
            optional: ["Industry-specific licenses", "Environmental permits", "Labor permits"],
            validity: "Must be current and in good standing"
        },
        landTitle: {
            hardTitle: "Preferred - full ownership rights",
            softTitle: "Acceptable with additional due diligence", 
            statePrivate: "Case-by-case evaluation",
            foreignOwnership: "Requires legal structure review"
        },
        banking: {
            localBanks: ["ABA Bank", "Canadia Bank", "ACLEDA Bank", "Vattanac Bank"],
            documentation: "12 months statements required",
            currency: "USD preferred, KHR acceptable",
            creditBureau: "Limited coverage - manual verification required"
        },
        compliance: {
            aml: "Anti-money laundering compliance required",
            kyc: "Know your customer verification",
            sanctions: "OFAC and local sanctions screening",
            taxCompliance: "Current tax filings required"
        }
    },

    // Processing timelines
    processingTimelines: {
        expedited: {
            duration: "5-7 business days",
            requirements: ["Complete documentation", "Simple loan structure", "Strong credit"],
            additionalFee: "0.5% of loan amount",
            eligibility: "Existing customers, loans under $500K"
        },
        standard: {
            duration: "10-14 business days", 
            requirements: ["Standard documentation", "Normal underwriting"],
            additionalFee: "None",
            eligibility: "All loan types and amounts"
        },
        complex: {
            duration: "15-25 business days",
            requirements: ["Complex structure", "Multiple collateral", "Large amounts"],
            additionalFee: "Legal and advisory fees",
            eligibility: "Loans over $2M, complex structures"
        }
    },

    // Approval authorities
    approvalAuthorities: {
        level1: {
            amount: "Up to $100,000",
            authority: "Senior Credit Officer",
            requirements: ["Credit score 70+", "Standard terms", "Adequate collateral"]
        },
        level2: {
            amount: "$100,001 - $500,000", 
            authority: "Credit Committee (3 members)",
            requirements: ["Detailed analysis", "Risk assessment", "Collateral valuation"]
        },
        level3: {
            amount: "$500,001 - $2,000,000",
            authority: "Senior Credit Committee",
            requirements: ["Comprehensive review", "Independent appraisal", "Legal opinion"]
        },
        level4: {
            amount: "Over $2,000,000",
            authority: "Board of Directors",
            requirements: ["Full due diligence", "Third-party validation", "Detailed risk analysis"]
        }
    }
};

// 📋 LOAN APPLICATION PROCESSING FUNCTIONS

/**
 * 🚀 Initiate New Loan Application
 */
async function initiateApplication(applicationData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - NEW LOAN APPLICATION INITIATION

APPLICATION OVERVIEW:
• Applicant Name: ${applicationData.applicantName || 'Not provided'}
• Business/Entity: ${applicationData.businessName || 'Not provided'}
• Loan Purpose: ${applicationData.loanPurpose || 'Not specified'}
• Requested Amount: $${applicationData.requestedAmount ? applicationData.requestedAmount.toLocaleString() : 'Not specified'} USD
• Requested Term: ${applicationData.requestedTerm || 'Not specified'} months
• Collateral Offered: ${applicationData.collateralType || 'Not specified'}

BORROWER INFORMATION:
• Industry/Sector: ${applicationData.industry || 'Not specified'}
• Years in Business: ${applicationData.yearsInBusiness || 'Not provided'}
• Annual Revenue: $${applicationData.annualRevenue ? applicationData.annualRevenue.toLocaleString() : 'Not provided'} USD
• Location: ${applicationData.location || 'Cambodia'}
• Business Type: ${applicationData.businessType || 'Not specified'}

LOAN APPLICATION INITIATION ANALYSIS:

1. **INITIAL ELIGIBILITY ASSESSMENT**
   - Loan amount and purpose alignment
   - Basic borrower qualification review
   - Industry and sector suitability
   - Preliminary risk indicators

2. **DOCUMENTATION REQUIREMENTS PLANNING**
   - Required documents by loan type
   - Cambodia-specific documentation needs
   - Collateral documentation requirements
   - Legal and compliance documentation

3. **PROCESSING TIMELINE ESTIMATION**
   - Expected processing duration
   - Critical path activities identification
   - Resource requirements assessment
   - Potential delay factors

4. **INITIAL RISK SCREENING**
   - Red flag identification
   - Preliminary risk category assessment
   - Enhanced due diligence triggers
   - Compliance screening requirements

5. **NEXT STEPS AND RECOMMENDATIONS**
   - Immediate action items
   - Documentation collection priorities
   - Processing track recommendation (expedited/standard/complex)
   - Resource allocation and team assignment

CAMBODIA LENDING CONSIDERATIONS:
• Documentation standards and verification processes
• Local legal and regulatory requirements
• Currency and foreign exchange considerations
• Industry-specific risks and opportunities
• Collateral types and valuation methods

PROCESSING FRAMEWORK:
• Stage 1: Initial Application Review
• Stage 2: Documentation Collection
• Stage 3: Credit Underwriting
• Stage 4: Final Approval Process
• Stage 5: Legal Documentation
• Stage 6: Loan Funding

Provide comprehensive application initiation analysis with clear next steps and timeline.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🚀 New Loan Application Initiated",
            forceModel: "gpt-5-mini" // Balanced for application processing
        });

        // Determine loan processing track
        const processingTrack = determineProcessingTrack(applicationData);
        const documentationPlan = generateDocumentationPlan(applicationData);
        const approvalLevel = determineApprovalLevel(applicationData.requestedAmount);

        return {
            analysis: result.response,
            applicationSummary: {
                applicantName: applicationData.applicantName,
                businessName: applicationData.businessName,
                requestedAmount: applicationData.requestedAmount,
                loanPurpose: applicationData.loanPurpose,
                collateralType: applicationData.collateralType
            },
            processingPlan: {
                track: processingTrack,
                estimatedTimeline: processingTrack.duration,
                approvalLevel: approvalLevel,
                documentationPlan: documentationPlan
            },
            applicationId: generateApplicationId(applicationData),
            currentStage: LOAN_ORIGINATION_FRAMEWORK.applicationStages.initial,
            nextSteps: generateInitialNextSteps(applicationData, processingTrack),
            initiationDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Loan application initiation error:', error.message);
        return {
            analysis: `Loan application analysis unavailable: ${error.message}`,
            applicationSummary: applicationData,
            processingPlan: { track: "manual_review" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📋 Generate Documentation Plan
 */
function generateDocumentationPlan(applicationData) {
    const loanType = determineLoanType(applicationData.loanPurpose, applicationData.collateralType);
    const requirements = LOAN_ORIGINATION_FRAMEWORK.documentRequirements[loanType] || 
                        LOAN_ORIGINATION_FRAMEWORK.documentRequirements.workingCapital;

    return {
        loanType: loanType,
        requiredDocuments: {
            financial: requirements.financial || [],
            business: requirements.business || requirements.trade || [],
            collateral: requirements.collateral || requirements.property || requirements.equipment || [],
            legal: requirements.legal || []
        },
        cambodiaSpecific: [
            "Business registration certificate",
            "Tax compliance certificate", 
            "Bank account verification",
            "Beneficial ownership disclosure"
        ],
        priorityDocuments: [
            "Financial statements (most recent)",
            "Bank statements (12 months)",
            "Business license (current)",
            "Collateral documentation"
        ],
        timeline: {
            requestSent: "Day 1",
            followUpRequired: "Day 3",
            completionTarget: "Day 5-7",
            escalationPoint: "Day 10"
        }
    };
}

/**
 * 🎯 Determine Loan Type
 */
function determineLoanType(loanPurpose, collateralType) {
    const purpose = (loanPurpose || '').toLowerCase();
    const collateral = (collateralType || '').toLowerCase();

    if (purpose.includes('working capital') || purpose.includes('inventory') || purpose.includes('receivables')) {
        return 'workingCapital';
    } else if (purpose.includes('real estate') || purpose.includes('property') || collateral.includes('real estate')) {
        return 'realEstate';
    } else if (purpose.includes('equipment') || purpose.includes('machinery') || collateral.includes('equipment')) {
        return 'equipment';
    } else if (purpose.includes('trade') || purpose.includes('import') || purpose.includes('export')) {
        return 'tradeFacility';
    } else if (purpose.includes('development') || purpose.includes('construction') || purpose.includes('project')) {
        return 'development';
    } else {
        return 'workingCapital'; // Default
    }
}

/**
 * 📊 Determine Processing Track
 */
function determineProcessingTrack(applicationData) {
    const amount = applicationData.requestedAmount || 0;
    const purpose = (applicationData.loanPurpose || '').toLowerCase();
    
    // Complex track criteria
    if (amount > 2000000 || 
        purpose.includes('development') || 
        purpose.includes('construction') ||
        (applicationData.collateralType && applicationData.collateralType.toLowerCase().includes('multiple'))) {
        return LOAN_ORIGINATION_FRAMEWORK.processingTimelines.complex;
    }
    
    // Expedited track criteria
    if (amount <= 500000 && 
        applicationData.yearsInBusiness >= 3 && 
        applicationData.annualRevenue >= amount * 2) {
        return LOAN_ORIGINATION_FRAMEWORK.processingTimelines.expedited;
    }
    
    // Standard track (default)
    return LOAN_ORIGINATION_FRAMEWORK.processingTimelines.standard;
}

/**
 * 🎯 Determine Approval Level
 */
function determineApprovalLevel(requestedAmount) {
    const amount = requestedAmount || 0;
    
    if (amount <= 100000) {
        return LOAN_ORIGINATION_FRAMEWORK.approvalAuthorities.level1;
    } else if (amount <= 500000) {
        return LOAN_ORIGINATION_FRAMEWORK.approvalAuthorities.level2;
    } else if (amount <= 2000000) {
        return LOAN_ORIGINATION_FRAMEWORK.approvalAuthorities.level3;
    } else {
        return LOAN_ORIGINATION_FRAMEWORK.approvalAuthorities.level4;
    }
}

/**
 * 🆔 Generate Application ID
 */
function generateApplicationId(applicationData) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return `IVLF-${year}${month}${day}-${random}`;
}

/**
 * 📝 Generate Initial Next Steps
 */
function generateInitialNextSteps(applicationData, processingTrack) {
    const steps = [];
    
    steps.push({
        step: 1,
        action: "Send documentation request letter",
        responsibility: "Loan Officer",
        deadline: "Within 24 hours",
        status: "pending"
    });
    
    steps.push({
        step: 2,
        action: "Schedule borrower meeting",
        responsibility: "Loan Officer", 
        deadline: "Within 48 hours",
        status: "pending"
    });
    
    steps.push({
        step: 3,
        action: "Initiate preliminary credit checks",
        responsibility: "Credit Analyst",
        deadline: "Within 72 hours", 
        status: "pending"
    });
    
    if (applicationData.collateralType) {
        steps.push({
            step: 4,
            action: "Order collateral appraisal",
            responsibility: "Credit Analyst",
            deadline: processingTrack.duration === "5-7 business days" ? "Day 2" : "Day 3",
            status: "pending"
        });
    }
    
    return steps;
}

/**
 * 📄 Process Documentation Stage
 */
async function processDocumentationStage(applicationId, documentationStatus, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING - DOCUMENTATION STAGE PROCESSING

APPLICATION ID: ${applicationId}
PROCESSING STAGE: Documentation Collection and Review

DOCUMENTATION STATUS:
• Financial Documents: ${documentationStatus.financial || 'Not provided'}
• Business Documents: ${documentationStatus.business || 'Not provided'}
• Collateral Documents: ${documentationStatus.collateral || 'Not provided'}
• Legal Documents: ${documentationStatus.legal || 'Not provided'}
• Cambodia-Specific: ${documentationStatus.cambodiaSpecific || 'Not provided'}

DOCUMENT QUALITY ASSESSMENT:
• Completeness: ${documentationStatus.completeness || 'Not assessed'}%
• Accuracy: ${documentationStatus.accuracy || 'Not verified'}
• Currency: ${documentationStatus.currency || 'Not checked'}
• Authenticity: ${documentationStatus.authenticity || 'Not verified'}

DOCUMENTATION REVIEW FRAMEWORK:

1. **COMPLETENESS VERIFICATION**
   - Required documents checklist review
   - Missing document identification
   - Critical vs non-critical gaps assessment
   - Additional documentation needs

2. **DOCUMENT QUALITY ANALYSIS**
   - Financial statement quality and reliability
   - Legal document validity and enforceability
   - Collateral documentation adequacy
   - Third-party verification requirements

3. **CAMBODIA COMPLIANCE REVIEW**
   - Local regulatory compliance verification
   - Business license and permit validation
   - Tax compliance confirmation
   - AML/KYC documentation review

4. **RED FLAG IDENTIFICATION**
   - Inconsistencies in documentation
   - Potential fraud indicators
   - Compliance concerns
   - Missing critical information

5. **NEXT STAGE READINESS**
   - Underwriting stage preparation
   - Outstanding item resolution
   - Third-party report requirements
   - Timeline and milestone updates

PROCESSING DECISIONS:
• PROCEED TO UNDERWRITING (documentation complete and satisfactory)
• REQUEST ADDITIONAL DOCUMENTATION (specific gaps identified)
• REQUIRE THIRD-PARTY VERIFICATION (quality or authenticity concerns)
• DECLINE APPLICATION (material deficiencies or red flags)

Provide detailed documentation stage analysis with clear recommendations.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📄 Documentation Stage Review",
            forceModel: "gpt-5-mini"
        });

        // Analyze documentation completeness
        const completenessScore = calculateDocumentationCompleteness(documentationStatus);
        const qualityAssessment = assessDocumentationQuality(documentationStatus);
        const nextStageDecision = determineNextStageDecision(completenessScore, qualityAssessment);

        return {
            analysis: result.response,
            applicationId: applicationId,
            currentStage: LOAN_ORIGINATION_FRAMEWORK.applicationStages.documentation,
            documentationAssessment: {
                completenessScore: completenessScore,
                qualityAssessment: qualityAssessment,
                overallRating: calculateOverallDocumentationRating(completenessScore, qualityAssessment)
            },
            decision: nextStageDecision,
            outstandingItems: identifyOutstandingItems(documentationStatus),
            nextSteps: generateDocumentationNextSteps(nextStageDecision, documentationStatus),
            reviewDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Documentation processing error:', error.message);
        return {
            analysis: `Documentation analysis unavailable: ${error.message}`,
            applicationId: applicationId,
            decision: { action: "manual_review", reason: "System error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Calculate Documentation Completeness
 */
function calculateDocumentationCompleteness(documentationStatus) {
    const categories = ['financial', 'business', 'collateral', 'legal', 'cambodiaSpecific'];
    const statusMap = {
        'complete': 100,
        'partial': 60,
        'missing': 0,
        'pending': 30
    };
    
    let totalScore = 0;
    let categoryCount = 0;
    
    categories.forEach(category => {
        if (documentationStatus[category]) {
            const status = documentationStatus[category].toLowerCase();
            totalScore += statusMap[status] || 0;
            categoryCount++;
        }
    });
    
    return categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;
}

/**
 * 🎯 Assess Documentation Quality
 */
function assessDocumentationQuality(documentationStatus) {
    const qualityFactors = {
        accuracy: documentationStatus.accuracy || 'unknown',
        currency: documentationStatus.currency || 'unknown',
        authenticity: documentationStatus.authenticity || 'unknown'
    };
    
    const qualityScore = Object.values(qualityFactors).reduce((score, factor) => {
        if (factor === 'verified' || factor === 'good') return score + 100;
        if (factor === 'acceptable' || factor === 'fair') return score + 75;
        if (factor === 'questionable' || factor === 'poor') return score + 25;
        return score + 50; // Unknown/pending
    }, 0) / 3;
    
    return {
        score: Math.round(qualityScore),
        factors: qualityFactors,
        rating: qualityScore >= 90 ? 'excellent' : 
               qualityScore >= 75 ? 'good' :
               qualityScore >= 60 ? 'acceptable' : 'needs_improvement'
    };
}

/**
 * 🎯 Calculate Overall Documentation Rating
 */
function calculateOverallDocumentationRating(completenessScore, qualityAssessment) {
    const overallScore = (completenessScore * 0.6) + (qualityAssessment.score * 0.4);
    
    if (overallScore >= 90) return 'excellent';
    if (overallScore >= 80) return 'good';
    if (overallScore >= 70) return 'acceptable';
    if (overallScore >= 60) return 'needs_improvement';
    return 'insufficient';
}

/**
 * 🚦 Determine Next Stage Decision
 */
function determineNextStageDecision(completenessScore, qualityAssessment) {
    if (completenessScore >= 90 && qualityAssessment.score >= 80) {
        return {
            action: 'proceed_to_underwriting',
            reason: 'Documentation complete and satisfactory',
            confidence: 'high'
        };
    } else if (completenessScore >= 75 && qualityAssessment.score >= 70) {
        return {
            action: 'proceed_with_conditions', 
            reason: 'Minor gaps acceptable, proceed with underwriting notes',
            confidence: 'medium'
        };
    } else if (completenessScore >= 60 || qualityAssessment.score >= 60) {
        return {
            action: 'request_additional_docs',
            reason: 'Significant gaps require resolution before underwriting',
            confidence: 'low'
        };
    } else {
        return {
            action: 'require_complete_resubmission',
            reason: 'Documentation insufficient for underwriting',
            confidence: 'very_low'
        };
    }
}

/**
 * 📋 Identify Outstanding Items
 */
function identifyOutstandingItems(documentationStatus) {
    const outstandingItems = [];
    
    Object.entries(documentationStatus).forEach(([category, status]) => {
        if (status === 'missing' || status === 'partial' || status === 'pending') {
            outstandingItems.push({
                category: category,
                status: status,
                priority: category === 'financial' ? 'high' : 
                         category === 'legal' ? 'high' : 'medium',
                actionRequired: getActionRequired(category, status)
            });
        }
    });
    
    return outstandingItems;
}

/**
 * 🎯 Get Action Required
 */
function getActionRequired(category, status) {
    const actions = {
        financial: {
            missing: "Request complete financial statements and tax returns",
            partial: "Request missing financial documents", 
            pending: "Follow up on pending financial documentation"
        },
        business: {
            missing: "Request business registration and licensing documents",
            partial: "Complete business documentation package",
            pending: "Verify business document authenticity"
        },
        collateral: {
            missing: "Request complete collateral documentation",
            partial: "Complete collateral title and valuation documents",
            pending: "Complete collateral appraisal process"
        },
        legal: {
            missing: "Request all required legal documents",
            partial: "Complete legal documentation review",
            pending: "Complete legal document verification"
        }
    };
    
    return actions[category]?.[status] || `Complete ${category} documentation`;
}

/**
 * 📝 Generate Documentation Next Steps
 */
function generateDocumentationNextSteps(decision, documentationStatus) {
    const steps = [];
    
    if (decision.action === 'proceed_to_underwriting') {
        steps.push({
            step: 1,
            action: "Initiate credit underwriting process",
            responsibility: "Credit Analyst",
            deadline: "Next business day",
            priority: "high"
        });
        
        steps.push({
            step: 2,
            action: "Schedule collateral inspection (if applicable)",
            responsibility: "Credit Analyst",
            deadline: "Within 2 days",
            priority: "medium"
        });
        
    } else if (decision.action === 'request_additional_docs') {
        steps.push({
            step: 1,
            action: "Send specific documentation request letter",
            responsibility: "Loan Officer", 
            deadline: "Within 24 hours",
            priority: "high"
        });
        
        steps.push({
            step: 2,
            action: "Schedule borrower meeting to discuss gaps",
            responsibility: "Loan Officer",
            deadline: "Within 48 hours", 
            priority: "medium"
        });
        
        steps.push({
            step: 3,
            action: "Set documentation completion deadline",
            responsibility: "Loan Officer",
            deadline: "Within 24 hours",
            priority: "high"
        });
    }
    
    return steps;
}

/**
 * 🏦 Process Underwriting Stage
 */
async function processUnderwritingStage(applicationId, underwritingData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING - CREDIT UNDERWRITING STAGE

APPLICATION ID: ${applicationId}
PROCESSING STAGE: Credit Underwriting and Risk Assessment

UNDERWRITING DATA:
• Credit Score: ${underwritingData.creditScore || 'Not calculated'}
• Debt Service Coverage: ${underwritingData.debtServiceCoverage || 'Not calculated'}
• Loan-to-Value Ratio: ${underwritingData.loanToValue || 'Not calculated'}%
• Collateral Value: $${underwritingData.collateralValue ? underwritingData.collateralValue.toLocaleString() : 'Not appraised'} USD
• Net Worth: $${underwritingData.netWorth ? underwritingData.netWorth.toLocaleString() : 'Not provided'} USD

RISK ASSESSMENT:
• Industry Risk: ${underwritingData.industryRisk || 'Not assessed'}
• Geographic Risk: ${underwritingData.geographicRisk || 'Not assessed'}
• Management Risk: ${underwritingData.managementRisk || 'Not assessed'}
• Financial Risk: ${underwritingData.financialRisk || 'Not assessed'}
• Overall Risk Rating: ${underwritingData.overallRisk || 'Not determined'}

UNDERWRITING ANALYSIS FRAMEWORK:

1. **CREDIT QUALITY ASSESSMENT**
   - Borrower creditworthiness evaluation
   - Financial strength and stability analysis
   - Cash flow adequacy for debt service
   - Historical performance and trends

2. **COLLATERAL EVALUATION**
   - Collateral valuation and quality assessment
   - Marketability and liquidity analysis
   - Legal title and lien position review
   - Collateral coverage and loan-to-value analysis

3. **RISK FACTOR ANALYSIS**
   - Industry and sector risk evaluation
   - Geographic and market risk assessment
   - Management and operational risk review
   - Economic sensitivity and stress testing

4. **LOAN STRUCTURE OPTIMIZATION**
   - Appropriate loan amount and terms
   - Interest rate and pricing recommendations
   - Covenant structure and monitoring requirements
   - Collateral and guarantee requirements

5. **APPROVAL RECOMMENDATION**
   - Credit decision recommendation
   - Approved terms and conditions
   - Risk mitigation requirements
   - Ongoing monitoring and reporting needs

CAMBODIA LENDING CONSIDERATIONS:
• Local market conditions and economic factors
• Currency and foreign exchange risks
• Regulatory compliance and legal requirements
• Industry-specific risks and opportunities
• Collateral enforcement and recovery prospects

UNDERWRITING DECISION OPTIONS:
• APPROVE AS REQUESTED (meets all criteria)
• APPROVE WITH MODIFICATIONS (terms adjustment required)
• APPROVE WITH CONDITIONS (additional requirements)
• COUNTER-OFFER (different terms proposed)
• DECLINE (does not meet credit standards)

Provide comprehensive underwriting analysis with clear credit decision and reasoning.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🏦 Credit Underwriting Analysis",
            forceModel: "gpt-5" // Full model for comprehensive underwriting analysis
        });

        // Perform detailed underwriting calculations
        const creditMetrics = calculateCreditMetrics(underwritingData);
        const riskAssessment = performRiskAssessment(underwritingData);
        const underwritingDecision = generateUnderwritingDecision(creditMetrics, riskAssessment);
        const loanTerms = recommendLoanTerms(underwritingDecision, underwritingData);

        return {
            analysis: result.response,
            applicationId: applicationId,
            currentStage: LOAN_ORIGINATION_FRAMEWORK.applicationStages.underwriting,
            creditMetrics: creditMetrics,
            riskAssessment: riskAssessment,
            underwritingDecision: underwritingDecision,
            recommendedTerms: loanTerms,
            conditions: generateLoanConditions(underwritingDecision, riskAssessment),
            nextSteps: generateUnderwritingNextSteps(underwritingDecision),
            underwritingDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Underwriting processing error:', error.message);
        return {
            analysis: `Underwriting analysis unavailable: ${error.message}`,
            applicationId: applicationId,
            underwritingDecision: { decision: "manual_review", reason: "System error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Calculate Credit Metrics
 */
function calculateCreditMetrics(underwritingData) {
    const metrics = {};
    
    // Debt Service Coverage Ratio
    if (underwritingData.annualCashFlow && underwritingData.requestedAmount && underwritingData.interestRate) {
        const annualDebtService = (underwritingData.requestedAmount * underwritingData.interestRate / 100) + 
                                 (underwritingData.requestedAmount / (underwritingData.loanTerm || 12));
        metrics.debtServiceCoverage = (underwritingData.annualCashFlow / annualDebtService).toFixed(2);
    }
    
    // Loan-to-Value Ratio
    if (underwritingData.requestedAmount && underwritingData.collateralValue) {
        metrics.loanToValue = ((underwritingData.requestedAmount / underwritingData.collateralValue) * 100).toFixed(1);
    }
    
    // Leverage Ratio
    if (underwritingData.totalDebt && underwritingData.netWorth) {
        metrics.leverageRatio = ((underwritingData.totalDebt / underwritingData.netWorth) * 100).toFixed(1);
    }
    
    // Current Ratio
    if (underwritingData.currentAssets && underwritingData.currentLiabilities) {
        metrics.currentRatio = (underwritingData.currentAssets / underwritingData.currentLiabilities).toFixed(2);
    }
    
    return metrics;
}

/**
 * ⚠️ Perform Risk Assessment
 */
function performRiskAssessment(underwritingData) {
    const riskFactors = {};
    
    // Credit Risk
    const creditScore = underwritingData.creditScore || 70;
    riskFactors.creditRisk = creditScore >= 80 ? 'low' : creditScore >= 70 ? 'medium' : 'high';
    
    // Collateral Risk
    const loanToValue = parseFloat(underwritingData.loanToValue) || 70;
    riskFactors.collateralRisk = loanToValue <= 60 ? 'low' : loanToValue <= 75 ? 'medium' : 'high';
    
    // Industry Risk
    const industryRiskMap = {
        'healthcare': 'low',
        'education': 'low', 
        'real estate': 'medium',
        'manufacturing': 'medium',
        'agriculture': 'high',
        'tourism': 'high',
        'mining': 'high'
    };
    
    const industry = (underwritingData.industry || '').toLowerCase();
    riskFactors.industryRisk = industryRiskMap[industry] || 'medium';
    
    // Financial Risk
    const debtServiceCoverage = parseFloat(underwritingData.debtServiceCoverage) || 1.2;
    riskFactors.financialRisk = debtServiceCoverage >= 1.5 ? 'low' : 
                               debtServiceCoverage >= 1.2 ? 'medium' : 'high';
    
    // Overall Risk Rating
    const riskScores = Object.values(riskFactors).map(risk => 
        risk === 'low' ? 1 : risk === 'medium' ? 2 : 3
    );
    const avgRiskScore = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
    
    riskFactors.overallRisk = avgRiskScore <= 1.5 ? 'low' : 
                             avgRiskScore <= 2.5 ? 'medium' : 'high';
    
    return riskFactors;
}

/**
 * 🎯 Generate Underwriting Decision
 */
function generateUnderwritingDecision(creditMetrics, riskAssessment) {
    const debtServiceCoverage = parseFloat(creditMetrics.debtServiceCoverage) || 0;
    const loanToValue = parseFloat(creditMetrics.loanToValue) || 100;
    const overallRisk = riskAssessment.overallRisk;
    
    // Decision logic
    if (debtServiceCoverage >= 1.3 && loanToValue <= 75 && overallRisk === 'low') {
        return {
            decision: 'approve_as_requested',
            confidence: 'high',
            reason: 'Strong credit metrics and low risk profile'
        };
    } else if (debtServiceCoverage >= 1.2 && loanToValue <= 80 && overallRisk !== 'high') {
        return {
            decision: 'approve_with_conditions',
            confidence: 'medium',
            reason: 'Acceptable metrics with risk mitigation conditions'
        };
    } else if (debtServiceCoverage >= 1.1 && loanToValue <= 85) {
        return {
            decision: 'counter_offer',
            confidence: 'medium',
            reason: 'Requires modified terms to meet credit standards'
        };
    } else if (overallRisk === 'high' || debtServiceCoverage < 1.1 || loanToValue > 85) {
        return {
            decision: 'decline',
            confidence: 'high',
            reason: 'Does not meet minimum credit standards'
        };
    } else {
        return {
            decision: 'manual_review',
            confidence: 'low',
            reason: 'Requires senior management review'
        };
    }
}

/**
 * 💰 Recommend Loan Terms
 */
function recommendLoanTerms(underwritingDecision, underwritingData) {
    const baseRate = 15; // Base rate for Cambodia lending
    const requestedAmount = underwritingData.requestedAmount || 0;
    const requestedTerm = underwritingData.requestedTerm || 12;
    
    let recommendedTerms = {
        amount: requestedAmount,
        term: requestedTerm,
        interestRate: baseRate,
        structure: 'monthly_payments'
    };
    
    if (underwritingDecision.decision === 'approve_as_requested') {
        // No changes needed
        recommendedTerms.interestRate = baseRate;
    } else if (underwritingDecision.decision === 'approve_with_conditions') {
        // Slight rate increase for conditions
        recommendedTerms.interestRate = baseRate + 2;
    } else if (underwritingDecision.decision === 'counter_offer') {
        // Modified terms
        recommendedTerms.amount = Math.round(requestedAmount * 0.85);
        recommendedTerms.term = Math.min(requestedTerm, 24);
        recommendedTerms.interestRate = baseRate + 3;
    }
    
    return recommendedTerms;
}

/**
 * 📋 Generate Loan Conditions
 */
function generateLoanConditions(underwritingDecision, riskAssessment) {
    const conditions = [];
    
    if (underwritingDecision.decision === 'approve_with_conditions' || 
        underwritingDecision.decision === 'counter_offer') {
        
        conditions.push("Personal guarantee from principal owner");
        conditions.push("Quarterly financial reporting required");
        
        if (riskAssessment.financialRisk === 'high') {
            conditions.push("Monthly cash flow reporting");
            conditions.push("Maintain minimum cash reserves of 3 months operating expenses");
        }
        
        if (riskAssessment.collateralRisk === 'high') {
            conditions.push("Additional collateral or guarantee required");
            conditions.push("Annual collateral revaluation");
        }
        
        if (riskAssessment.industryRisk === 'high') {
            conditions.push("Industry-specific insurance coverage required");
            conditions.push("Enhanced monitoring and reporting");
        }
        
        conditions.push("Compliance with all loan covenants");
        conditions.push("No material adverse changes in business");
    }
    
    return conditions;
}

/**
 * 📝 Generate Underwriting Next Steps
 */
function generateUnderwritingNextSteps(underwritingDecision) {
    const steps = [];
    
    if (underwritingDecision.decision === 'approve_as_requested' || 
        underwritingDecision.decision === 'approve_with_conditions') {
        
        steps.push({
            step: 1,
            action: "Prepare credit committee presentation",
            responsibility: "Credit Analyst",
            deadline: "Next business day",
            priority: "high"
        });
        
        steps.push({
            step: 2,
            action: "Schedule credit committee meeting",
            responsibility: "Credit Manager",
            deadline: "Within 2 days",
            priority: "high"
        });
        
        steps.push({
            step: 3,
            action: "Prepare loan approval documentation",
            responsibility: "Credit Analyst",
            deadline: "Within 3 days",
            priority: "medium"
        });
        
    } else if (underwritingDecision.decision === 'counter_offer') {
        
        steps.push({
            step: 1,
            action: "Prepare counter-offer proposal",
            responsibility: "Loan Officer",
            deadline: "Next business day", 
            priority: "high"
        });
        
        steps.push({
            step: 2,
            action: "Schedule borrower meeting to discuss terms",
            responsibility: "Loan Officer",
            deadline: "Within 2 days",
            priority: "high"
        });
        
    } else if (underwritingDecision.decision === 'decline') {
        
        steps.push({
            step: 1,
            action: "Prepare decline letter with detailed reasoning",
            responsibility: "Credit Manager",
            deadline: "Next business day",
            priority: "high"
        });
        
        steps.push({
            step: 2,
            action: "Schedule borrower meeting to explain decision",
            responsibility: "Loan Officer",
            deadline: "Within 2 days",
            priority: "medium"
        });
    }
    
    return steps;
}

/**
 * ✅ Process Approval Stage
 */
async function processApprovalStage(applicationId, approvalData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING - FINAL APPROVAL STAGE

APPLICATION ID: ${applicationId}
PROCESSING STAGE: Final Approval and Terms Negotiation

APPROVAL DATA:
• Committee Decision: ${approvalData.committeeDecision || 'Not decided'}
• Approved Amount: ${approvalData.approvedAmount ? approvalData.approvedAmount.toLocaleString() : 'Not specified'} USD
• Approved Term: ${approvalData.approvedTerm || 'Not specified'} months
• Interest Rate: ${approvalData.interestRate || 'Not specified'}% annually
• Approval Authority: ${approvalData.approvalAuthority || 'Not specified'}

CONDITIONS AND COVENANTS:
• Financial Covenants: ${approvalData.financialCovenants || 'Standard'}
• Reporting Requirements: ${approvalData.reportingRequirements || 'Standard'}
• Insurance Requirements: ${approvalData.insuranceRequirements || 'Standard'}
• Collateral Requirements: ${approvalData.collateralRequirements || 'As appraised'}

FINAL APPROVAL ANALYSIS:

1. **APPROVAL TERMS REVIEW**
   - Approved loan structure and terms
   - Interest rate and pricing validation
   - Repayment schedule optimization
   - Fee structure and closing costs

2. **CONDITIONS PRECEDENT**
   - Pre-closing conditions identification
   - Documentation requirements finalization
   - Third-party requirements (insurance, appraisals)
   - Compliance and legal requirements

3. **COVENANT STRUCTURE**
   - Financial covenant specifications
   - Operational covenant requirements
   - Reporting and monitoring obligations
   - Default triggers and remedies

4. **LOAN DOCUMENTATION PLANNING**
   - Required legal documents identification
   - Security document requirements
   - Corporate resolution needs
   - Guarantee and collateral documentation

5. **CLOSING COORDINATION**
   - Closing timeline and milestones
   - Stakeholder coordination requirements
   - Funding logistics and procedures
   - Post-closing obligations

CAMBODIA LEGAL CONSIDERATIONS:
• Local legal documentation requirements
• Regulatory compliance and filing obligations
• Collateral perfection and registration
• Foreign exchange and currency considerations

FINAL APPROVAL OUTCOMES:
• APPROVED FOR DOCUMENTATION (proceed to legal documentation)
• APPROVED WITH MODIFIED CONDITIONS (require borrower acceptance)
• CONDITIONAL APPROVAL (additional conditions must be met)
• APPROVAL DEFERRED (requires additional review or information)

Provide comprehensive final approval analysis with clear documentation roadmap.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "✅ Final Approval Processing",
            forceModel: "gpt-5-mini"
        });

        // Generate final approval documentation
        const approvalSummary = generateApprovalSummary(approvalData);
        const documentationPlan = generateDocumentationPlan(approvalData);
        const closingTimeline = generateClosingTimeline(approvalData);

        return {
            analysis: result.response,
            applicationId: applicationId,
            currentStage: LOAN_ORIGINATION_FRAMEWORK.applicationStages.approval,
            approvalSummary: approvalSummary,
            finalTerms: {
                amount: approvalData.approvedAmount,
                term: approvalData.approvedTerm,
                rate: approvalData.interestRate,
                structure: approvalData.paymentStructure || 'monthly'
            },
            conditionsPrecedent: generateConditionsPrecedent(approvalData),
            documentationPlan: documentationPlan,
            closingTimeline: closingTimeline,
            nextSteps: generateApprovalNextSteps(approvalData),
            approvalDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Approval processing error:', error.message);
        return {
            analysis: `Approval analysis unavailable: ${error.message}`,
            applicationId: applicationId,
            approvalSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Generate Approval Summary
 */
function generateApprovalSummary(approvalData) {
    return {
        decision: approvalData.committeeDecision || 'approved',
        approvedAmount: approvalData.approvedAmount,
        approvedTerm: approvalData.approvedTerm,
        interestRate: approvalData.interestRate,
        approvalAuthority: approvalData.approvalAuthority,
        conditionsCount: (approvalData.conditions || []).length,
        covenantCount: (approvalData.covenants || []).length,
        estimatedClosingDate: calculateEstimatedClosingDate()
    };
}

/**
 * 📅 Calculate Estimated Closing Date
 */
function calculateEstimatedClosingDate() {
    const now = new Date();
    const closingDate = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 business days
    return closingDate.toISOString().split('T')[0];
}

/**
 * 📋 Generate Conditions Precedent
 */
function generateConditionsPrecedent(approvalData) {
    const conditions = [
        "Execution of loan agreement and security documents",
        "Current insurance certificates with lender named as additional insured",
        "Updated financial statements (if older than 90 days)",
        "Evidence of business license renewal (if applicable)"
    ];

    if (approvalData.collateralRequirements) {
        conditions.push("Completion of collateral perfection and registration");
    }

    if (approvalData.guaranteeRequired) {
        conditions.push("Personal guarantee executed by principal owners");
    }

    return conditions.map((condition, index) => ({
        id: index + 1,
        condition: condition,
        status: 'pending',
        responsibility: 'borrower',
        critical: condition.includes('loan agreement') || condition.includes('security documents')
    }));
}

/**
 * 📅 Generate Closing Timeline
 */
function generateClosingTimeline(approvalData) {
    const timeline = [];
    const today = new Date();
    
    timeline.push({
        day: 1,
        date: addBusinessDays(today, 1),
        milestone: "Send loan approval letter to borrower",
        responsibility: "Loan Officer"
    });
    
    timeline.push({
        day: 2,
        date: addBusinessDays(today, 2),
        milestone: "Begin legal document preparation",
        responsibility: "Legal Team"
    });
    
    timeline.push({
        day: 3,
        date: addBusinessDays(today, 3),
        milestone: "Borrower review and execution of documents",
        responsibility: "Borrower"
    });
    
    timeline.push({
        day: 4,
        date: addBusinessDays(today, 4),
        milestone: "Complete conditions precedent verification",
        responsibility: "Credit Team"
    });
    
    timeline.push({
        day: 5,
        date: addBusinessDays(today, 5),
        milestone: "Loan closing and funding",
        responsibility: "Operations Team"
    });
    
    return timeline;
}

/**
 * 📅 Add Business Days Helper
 */
function addBusinessDays(date, days) {
    const result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        if (result.getDay() !== 0 && result.getDay() !== 6) { // Skip weekends
            addedDays++;
        }
    }
    
    return result.toISOString().split('T')[0];
}

/**
 * 📝 Generate Approval Next Steps
 */
function generateApprovalNextSteps(approvalData) {
    return [
        {
            step: 1,
            action: "Send approval letter to borrower",
            responsibility: "Loan Officer",
            deadline: "Next business day",
            priority: "high"
        },
        {
            step: 2,
            action: "Coordinate with legal team for document preparation",
            responsibility: "Credit Manager",
            deadline: "Within 24 hours",
            priority: "high"
        },
        {
            step: 3,
            action: "Schedule closing meeting with borrower",
            responsibility: "Loan Officer",
            deadline: "Within 2 days",
            priority: "medium"
        },
        {
            step: 4,
            action: "Coordinate funding logistics with operations",
            responsibility: "Credit Manager",
            deadline: "Within 3 days",
            priority: "medium"
        }
    ];
}

/**
 * 🎯 Loan Origination Quick Insights
 */
function getLoanOriginationQuickInsights() {
    return {
        frameworkSummary: {
            applicationStages: Object.keys(LOAN_ORIGINATION_FRAMEWORK.applicationStages).length,
            loanTypes: Object.keys(LOAN_ORIGINATION_FRAMEWORK.documentRequirements).length,
            processingTracks: Object.keys(LOAN_ORIGINATION_FRAMEWORK.processingTimelines).length,
            approvalLevels: Object.keys(LOAN_ORIGINATION_FRAMEWORK.approvalAuthorities).length
        },
        
        processingStages: {
            initial: "1-2 days - Application review and pre-qualification",
            documentation: "3-5 days - Complete documentation collection",
            underwriting: "2-4 days - Credit analysis and risk assessment",
            approval: "1-2 days - Final approval and terms",
            documentation_final: "2-3 days - Legal documentation",
            funding: "1 day - Loan funding"
        },
        
        processingTracks: {
            expedited: "5-7 days - Simple loans under $500K",
            standard: "10-14 days - Normal processing",
            complex: "15-25 days - Complex structures over $2M"
        },
        
        approvalLevels: {
            level1: "Up to $100K - Senior Credit Officer",
            level2: "$100K-$500K - Credit Committee",
            level3: "$500K-$2M - Senior Credit Committee", 
            level4: "Over $2M - Board of Directors"
        },
        
        loanProducts: {
            workingCapital: "Inventory, receivables, general business",
            realEstate: "Property acquisition and development",
            equipment: "Machinery and equipment financing",
            tradeFacility: "Import/export and trade finance",
            development: "Construction and project financing"
        },
        
        keyFeatures: [
            "GPT-5 enhanced application processing",
            "Cambodia-specific documentation requirements",
            "Automated credit scoring and risk assessment",
            "Multi-level approval workflow",
            "Comprehensive documentation planning",
            "Integrated closing timeline management"
        ],

        dataTimestamp: new Date().toISOString(),
        systemVersion: "IMPERIUMVAULT Loan Origination v1.0"
    };
}

// 📤 COMPREHENSIVE EXPORTS
module.exports = {
    // 📊 Framework and data
    LOAN_ORIGINATION_FRAMEWORK,
    
    // 🚀 Core origination functions
    initiateApplication,
    processDocumentationStage,
    processUnderwritingStage,
    processApprovalStage,
    
    // 📋 Utility functions
    generateApplicationId,
    determineLoanType,
    determineProcessingTrack,
    determineApprovalLevel,
    generateDocumentationPlan,
    
    // 📊 Analysis functions
    calculateCreditMetrics,
    performRiskAssessment,
    generateUnderwritingDecision,
    recommendLoanTerms,
    
    // 🎯 Quick access functions
    getLoanOriginationQuickInsights,
    
    // 📅 Timeline and workflow functions
    generateClosingTimeline,
    calculateEstimatedClosingDate,
    addBusinessDays
};

console.log('💰 Cambodia Loan Origination Module Loaded');
console.log('📊 Framework: 6-Stage Processing + Multi-Level Approval');
console.log('🎯 Coverage: 5 Loan Products + Cambodia Documentation Requirements');
console.log('⚡ Processing: Expedited (5-7 days) to Complex (15-25 days)');
console.log('🚀 GPT-5 Enhanced: Complete Application Processing + Risk Assessment');
console.log('✅ Ready for professional loan origination operations');
