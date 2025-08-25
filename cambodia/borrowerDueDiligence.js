// cambodia/borrowerDueDiligence.js - COMPLETE: Cambodia Borrower Due Diligence & KYC System
// Enterprise-grade borrower screening with GPT-5 intelligence for private lending fund

const { executeEnhancedGPT5Command } = require('../utils/dualCommandSystem');

// 🔧 SPECIALIZED HANDLERS (Integration with existing systems)
const cambodiaHandler = require('../handlers/cambodiaDeals');
const lpManagement = require('./lpManagement');
const portfolioManager = require('./portfolioManager');
const creditAssessment = require('./creditAssessment');
const loanOrigination = require('./loanOrigination');
const riskManagement = require('./riskManagement');
const legalRegulatory = require('./legalRegulatory');
const businessWealth = require('./businessWealth');
const realEstateWealth = require('./realEstateWealth');
const economicIntelligence = require('./economicIntelligence');

// 🔍 CAMBODIA BORROWER DUE DILIGENCE FRAMEWORK
const DUE_DILIGENCE_FRAMEWORK = {
    // Due diligence categories and classifications
    dueDiligenceCategories: {
        identity_verification: {
            name: "Identity Verification",
            description: "Comprehensive identity and document authentication",
            components: [
                "National ID card verification",
                "Passport authentication", 
                "Business registration certificates",
                "Tax identification numbers",
                "Address verification documents",
                "Biometric verification (where applicable)"
            ],
            priority: "critical",
            completion_requirement: "mandatory"
        },
        financial_verification: {
            name: "Financial Verification",
            description: "Income, assets, and financial capacity assessment",
            components: [
                "Bank statements (6-12 months)",
                "Tax returns and assessments",
                "Business financial statements",
                "Asset ownership documentation",
                "Existing debt obligations",
                "Investment portfolio verification"
            ],
            priority: "high",
            completion_requirement: "mandatory"
        },
        credit_history_check: {
            name: "Credit History Check",
            description: "Credit bureau reports and payment history analysis",
            components: [
                "Cambodia Credit Bureau report",
                "Banking relationship history",
                "Trade credit references",
                "Previous loan performance",
                "Default and bankruptcy records",
                "Credit dispute history"
            ],
            priority: "high",
            completion_requirement: "mandatory"
        },
        business_verification: {
            name: "Business Verification",
            description: "Business operations and commercial activity validation",
            components: [
                "Business license verification",
                "Industry permits and certifications",
                "Commercial registration status",
                "Business premises verification",
                "Key management identification",
                "Operational capacity assessment"
            ],
            priority: "high",
            completion_requirement: "business_loans_only"
        },
        reputation_screening: {
            name: "Reputation Screening",
            description: "Public records and reputation risk assessment",
            components: [
                "Criminal background checks",
                "Civil litigation history",
                "Regulatory sanctions screening",
                "Media and news coverage analysis",
                "Professional licensing verification",
                "Industry reputation assessment"
            ],
            priority: "medium",
            completion_requirement: "recommended"
        },
        collateral_verification: {
            name: "Collateral Verification",
            description: "Security and collateral authentication",
            components: [
                "Property title verification",
                "Asset ownership confirmation",
                "Valuation and appraisal reports",
                "Insurance coverage verification",
                "Lien and encumbrance search",
                "Marketability assessment"
            ],
            priority: "high",
            completion_requirement: "secured_loans_only"
        },
        aml_kyc_compliance: {
            name: "AML/KYC Compliance",
            description: "Anti-money laundering and regulatory compliance",
            components: [
                "PEP (Politically Exposed Person) screening",
                "Sanctions list checking",
                "Source of funds verification",
                "Ultimate beneficial ownership",
                "Transaction monitoring setup",
                "Suspicious activity assessment"
            ],
            priority: "critical",
            completion_requirement: "mandatory"
        },
        relationship_mapping: {
            name: "Relationship Mapping",
            description: "Connected parties and relationship analysis",
            components: [
                "Family member identification",
                "Business associate mapping",
                "Guarantor relationship analysis",
                "Cross-default risk assessment",
                "Concentration risk evaluation",
                "Conflict of interest screening"
            ],
            priority: "medium",
            completion_requirement: "recommended"
        }
    },

    // Risk scoring methodology
    riskScoringFramework: {
        identity_risk: {
            weight: 20,
            factors: [
                "Document authenticity",
                "Address verification",
                "Identity consistency",
                "Biometric matching"
            ]
        },
        financial_risk: {
            weight: 25,
            factors: [
                "Income stability",
                "Asset quality",
                "Debt-to-income ratio",
                "Cash flow adequacy"
            ]
        },
        credit_risk: {
            weight: 25,
            factors: [
                "Payment history",
                "Credit utilization",
                "Length of credit history",
                "Credit mix diversity"
            ]
        },
        business_risk: {
            weight: 15,
            factors: [
                "Business legitimacy",
                "Operational stability",
                "Industry position",
                "Management quality"
            ]
        },
        reputation_risk: {
            weight: 10,
            factors: [
                "Criminal history",
                "Legal proceedings",
                "Regulatory issues",
                "Media coverage"
            ]
        },
        compliance_risk: {
            weight: 5,
            factors: [
                "AML/KYC compliance",
                "Sanctions screening",
                "PEP status",
                "Source of funds"
            ]
        }
    },

    // Cambodia-specific requirements
    cambodiaRequirements: {
        mandatory_documents: [
            "National Identity Card (Khmer)",
            "Family Record Book",
            "Tax Identification Number",
            "Proof of Address (Utility Bill)",
            "Bank Account Statements"
        ],
        business_documents: [
            "Business License (Ministry of Commerce)",
            "Patent Tax Certificate",
            "VAT Certificate (if applicable)",
            "Social Security Registration",
            "Qualified Investment Project (QIP) if applicable"
        ],
        regulatory_compliance: [
            "National Bank of Cambodia regulations",
            "Anti-Money Laundering Law compliance",
            "Law on Banking and Financial Institutions",
            "Consumer Protection regulations",
            "Data Protection compliance"
        ],
        cultural_considerations: [
            "Family decision-making involvement",
            "Community reputation factors",
            "Traditional business practices",
            "Religious and cultural holidays",
            "Language and communication preferences"
        ]
    },

    // Verification standards and thresholds
    verificationStandards: {
        document_authentication: {
            primary_documents: "Government-issued with photo ID",
            secondary_documents: "Utility bills, bank statements",
            verification_method: "Physical inspection + digital verification",
            retention_period: "7 years post-relationship"
        },
        financial_verification: {
            income_documentation: "3-6 months bank statements minimum",
            asset_verification: "Independent appraisal for assets > $50K",
            debt_confirmation: "Credit bureau + borrower declaration",
            variance_tolerance: "±10% between declared and verified"
        },
        business_verification: {
            operating_history: "Minimum 2 years for new business loans",
            premises_verification: "Physical site visit required",
            management_verification: "Key person background checks",
            financial_audits: "Audited statements for loans > $250K"
        }
    },

    // Red flag indicators
    redFlagIndicators: {
        identity_red_flags: [
            "Inconsistent personal information",
            "Recently issued identity documents",
            "Multiple addresses or identities",
            "Reluctance to provide documentation",
            "Document tampering or forgery signs"
        ],
        financial_red_flags: [
            "Unexplained wealth or income sources",
            "Irregular income patterns",
            "High debt-to-income ratios",
            "Recent large cash deposits",
            "Undisclosed liabilities"
        ],
        business_red_flags: [
            "Shell company characteristics",
            "Unclear business purpose",
            "Unusually high cash transactions",
            "Complex ownership structures",
            "Offshore connections without explanation"
        ],
        behavioral_red_flags: [
            "Pressure for quick approvals",
            "Evasive responses to questions",
            "Unwillingness to meet in person",
            "Inconsistent story details",
            "Third-party intermediaries"
        ]
    }
};

// 🔍 BORROWER DUE DILIGENCE FUNCTIONS

/**
 * 📋 Comprehensive Borrower Due Diligence Assessment
 */
async function conductComprehensiveDueDiligence(borrowerId, dueDiligenceData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - COMPREHENSIVE BORROWER DUE DILIGENCE ASSESSMENT

BORROWER IDENTIFICATION:
• Borrower ID: ${borrowerId}
• Borrower Name: ${dueDiligenceData.borrowerName || 'Not specified'}
• Borrower Type: ${dueDiligenceData.borrowerType || 'Not specified'} (Individual/Business)
• Loan Amount Requested: $${dueDiligenceData.requestedLoanAmount ? dueDiligenceData.requestedLoanAmount.toLocaleString() : 'Not provided'} USD
• Loan Purpose: ${dueDiligenceData.loanPurpose || 'Not specified'}
• Relationship Type: ${dueDiligenceData.relationshipType || 'New'} customer

IDENTITY VERIFICATION STATUS:
• National ID Verification: ${dueDiligenceData.nationalIdStatus || 'Not completed'}
• Address Verification: ${dueDiligenceData.addressVerification || 'Not completed'}
• Document Authentication: ${dueDiligenceData.documentAuthentication || 'Not completed'}
• Biometric Verification: ${dueDiligenceData.biometricVerification || 'Not applicable'}

FINANCIAL VERIFICATION RESULTS:
• Income Verification: ${dueDiligenceData.incomeVerification || 'Not completed'}
• Asset Verification: ${dueDiligenceData.assetVerification || 'Not completed'}
• Bank Statements Review: ${dueDiligenceData.bankStatementReview || 'Not completed'}
• Tax Records Verification: ${dueDiligenceData.taxRecordsVerification || 'Not completed'}

CREDIT AND BACKGROUND CHECKS:
• Credit Bureau Report: ${dueDiligenceData.creditBureauReport || 'Not obtained'}
• Banking History: ${dueDiligenceData.bankingHistory || 'Not researched'}
• Criminal Background Check: ${dueDiligenceData.criminalBackgroundCheck || 'Not completed'}
• Litigation History: ${dueDiligenceData.litigationHistory || 'Not researched'}

BUSINESS VERIFICATION (if applicable):
• Business License Status: ${dueDiligenceData.businessLicenseStatus || 'Not applicable'}
• Business Operations Verification: ${dueDiligenceData.businessOperationsVerification || 'Not applicable'}
• Management Background Checks: ${dueDiligenceData.managementBackgroundChecks || 'Not applicable'}
• Industry Standing: ${dueDiligenceData.industryStanding || 'Not applicable'}

AML/KYC COMPLIANCE:
• PEP Screening Results: ${dueDiligenceData.pepScreeningResults || 'Not completed'}
• Sanctions List Check: ${dueDiligenceData.sanctionsListCheck || 'Not completed'}
• Source of Funds Verification: ${dueDiligenceData.sourceOfFundsVerification || 'Not completed'}
• Ultimate Beneficial Ownership: ${dueDiligenceData.ultimateBeneficialOwnership || 'Not identified'}

COLLATERAL VERIFICATION (if applicable):
• Collateral Type: ${dueDiligenceData.collateralType || 'Not applicable'}
• Title Verification: ${dueDiligenceData.titleVerification || 'Not applicable'}
• Valuation Report: ${dueDiligenceData.valuationReport || 'Not applicable'}
• Insurance Coverage: ${dueDiligenceData.insuranceCoverage || 'Not applicable'}

COMPREHENSIVE DUE DILIGENCE ANALYSIS:

1. **IDENTITY AND AUTHENTICATION ASSESSMENT**
   - Document authenticity and integrity verification
   - Identity consistency across multiple sources
   - Address and contact information validation
   - Biometric and physical verification results

2. **FINANCIAL CAPACITY AND VERIFICATION**
   - Income source legitimacy and sustainability
   - Asset ownership and value confirmation
   - Debt obligation identification and assessment
   - Financial capacity for loan repayment

3. **CREDIT AND PAYMENT HISTORY EVALUATION**
   - Historical payment performance analysis
   - Credit utilization and management patterns
   - Default risk indicators and warning signs
   - Credit behavior consistency and trends

4. **BUSINESS OPERATIONS AND LEGITIMACY**
   - Business model viability and sustainability
   - Operational premises and activity verification
   - Management competency and background
   - Industry position and competitive analysis

5. **REPUTATION AND BACKGROUND SCREENING**
   - Criminal history and legal proceedings review
   - Regulatory compliance and sanctions screening
   - Media coverage and public reputation analysis
   - Professional standing and industry reputation

6. **COLLATERAL AND SECURITY VERIFICATION**
   - Asset ownership and title verification
   - Market value and marketability assessment
   - Legal encumbrances and lien search results
   - Insurance and risk protection adequacy

7. **REGULATORY COMPLIANCE AND AML SCREENING**
   - Anti-money laundering compliance verification
   - Know Your Customer (KYC) requirements fulfillment
   - Politically Exposed Person (PEP) screening results
   - Source of wealth and funds legitimacy assessment

8. **RELATIONSHIP MAPPING AND CONCENTRATION ANALYSIS**
   - Connected party identification and assessment
   - Cross-default risk and relationship exposure
   - Portfolio concentration impact evaluation
   - Conflict of interest identification and management

CAMBODIA-SPECIFIC DUE DILIGENCE FACTORS:
• Local regulatory compliance and documentation requirements
• Cultural and family relationship considerations
• Business practice norms and industry standards
• Language and communication effectiveness
• Government and political connection screening
• Economic sector and geographic risk assessment

RED FLAG IDENTIFICATION AND ASSESSMENT:
• Identity inconsistencies or documentation issues
• Financial irregularities or unexplained wealth sources
• Business legitimacy concerns or operational red flags
• Reputation issues or adverse background information
• Compliance violations or regulatory concerns

DUE DILIGENCE RECOMMENDATIONS:
• Overall borrower risk assessment and classification
• Required additional verification and documentation
• Risk mitigation measures and conditions precedent
• Loan structure and pricing adjustments based on risk
• Ongoing monitoring and review requirements

Provide comprehensive borrower due diligence assessment with risk classification and recommendations.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🔍 Comprehensive Due Diligence Assessment",
            forceModel: "gpt-5" // Full model for comprehensive analysis
        });

        // Conduct detailed due diligence analysis
        const verificationResults = analyzeVerificationResults(dueDiligenceData);
        const riskAssessment = calculateDueDiligenceRiskScore(dueDiligenceData);
        const redFlags = identifyRedFlags(dueDiligenceData);
        const complianceStatus = assessComplianceStatus(dueDiligenceData);
        const recommendations = generateDueDiligenceRecommendations(riskAssessment, redFlags, complianceStatus);

        return {
            analysis: result.response,
            borrowerId: borrowerId,
            borrowerName: dueDiligenceData.borrowerName,
            dueDiligenceSummary: {
                overallRiskRating: riskAssessment.overallRating,
                verificationCompleteness: verificationResults.completenessScore,
                redFlagCount: redFlags.totalRedFlags,
                complianceStatus: complianceStatus.overallStatus,
                recommendationLevel: recommendations.recommendationLevel
            },
            verificationResults: verificationResults,
            riskAssessment: riskAssessment,
            redFlags: redFlags,
            complianceStatus: complianceStatus,
            recommendations: recommendations,
            nextSteps: generateNextSteps(riskAssessment, recommendations),
            dueDiligenceDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Due diligence assessment error:', error.message);
        return {
            analysis: `Due diligence assessment unavailable: ${error.message}`,
            borrowerId: borrowerId,
            dueDiligenceSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 🔐 AML/KYC Compliance Screening
 */
async function performAMLKYCScreening(borrowerId, screeningData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING FUND - AML/KYC COMPLIANCE SCREENING

BORROWER IDENTIFICATION:
• Borrower ID: ${borrowerId}
• Full Legal Name: ${screeningData.fullLegalName || 'Not provided'}
• Date of Birth: ${screeningData.dateOfBirth || 'Not provided'}
• Nationality: ${screeningData.nationality || 'Not specified'}
• Identification Numbers: ${screeningData.identificationNumbers || 'Not provided'}

BUSINESS INFORMATION (if applicable):
• Business Legal Name: ${screeningData.businessLegalName || 'Not applicable'}
• Business Registration Number: ${screeningData.businessRegistrationNumber || 'Not applicable'}
• Industry/Sector: ${screeningData.industry || 'Not applicable'}
• Ultimate Beneficial Owners: ${screeningData.ultimateBeneficialOwners || 'Not identified'}

SCREENING PARAMETERS:
• Transaction Amount: $${screeningData.transactionAmount ? screeningData.transactionAmount.toLocaleString() : 'Not specified'} USD
• Transaction Type: ${screeningData.transactionType || 'Not specified'}
• Geographic Risk Factors: ${screeningData.geographicRiskFactors || 'Not assessed'}
• Customer Risk Classification: ${screeningData.customerRiskClassification || 'Not classified'}

SCREENING RESULTS:
• PEP Screening Status: ${screeningData.pepScreeningStatus || 'Not completed'}
• Sanctions List Results: ${screeningData.sanctionsListResults || 'Not completed'}
• Adverse Media Check: ${screeningData.adverseMediaCheck || 'Not completed'}
• Law Enforcement Database: ${screeningData.lawEnforcementDatabase || 'Not checked'}

SOURCE OF FUNDS ANALYSIS:
• Declared Source of Funds: ${screeningData.declaredSourceOfFunds || 'Not provided'}
• Supporting Documentation: ${screeningData.supportingDocumentation || 'Not provided'}
• Funds Origin Verification: ${screeningData.fundsOriginVerification || 'Not completed'}
• Legitimacy Assessment: ${screeningData.legitimacyAssessment || 'Not assessed'}

AML/KYC COMPLIANCE ANALYSIS:

1. **CUSTOMER IDENTITY VERIFICATION (CIV)**
   - Identity document authentication and verification
   - Biographic data consistency and validation
   - Address verification and residence confirmation
   - Digital identity verification and cross-referencing

2. **POLITICALLY EXPOSED PERSON (PEP) SCREENING**
   - Domestic PEP identification and classification
   - Foreign PEP screening and risk assessment
   - International organization official screening
   - Family member and close associate identification

3. **SANCTIONS AND WATCHLIST SCREENING**
   - OFAC sanctions list comprehensive screening
   - UN sanctions list and EU sanctions checking
   - National sanctions and watchlist verification
   - Terrorism financing and criminal organization screening

4. **ADVERSE MEDIA AND REPUTATION SCREENING**
   - Global media database screening for negative coverage
   - Financial crime and regulatory action identification
   - Corruption and bribery allegation screening
   - Criminal conviction and legal proceeding identification

5. **SOURCE OF WEALTH AND FUNDS VERIFICATION**
   - Legitimate business activity and income verification
   - Asset accumulation consistency and timeline analysis
   - Unexplained wealth identification and investigation
   - High-risk jurisdiction fund source screening

6. **ULTIMATE BENEFICIAL OWNERSHIP (UBO) ANALYSIS**
   - Ownership structure mapping and verification
   - Control mechanism identification and assessment
   - Beneficial ownership transparency and disclosure
   - Complex structure risk assessment and monitoring

7. **ONGOING MONITORING AND TRANSACTION SCREENING**
   - Real-time transaction monitoring system setup
   - Suspicious activity pattern identification
   - Threshold-based alert generation and investigation
   - Periodic customer review and risk reassessment

8. **REGULATORY COMPLIANCE AND REPORTING**
   - Cambodia AML law compliance verification
   - Financial Intelligence Unit (CAFIU) reporting requirements
   - Currency transaction reporting thresholds
   - Suspicious transaction reporting obligations

CAMBODIA AML/KYC SPECIFIC REQUIREMENTS:
• Law on Anti-Money Laundering and Combating Financing of Terrorism compliance
• National Bank of Cambodia (NBC) regulations adherence
• Cambodia Financial Intelligence Unit (CAFIU) reporting obligations
• ASEAN AML/CFT standards alignment
• International cooperation and information sharing requirements

RISK CLASSIFICATION AND SCORING:
• Customer risk level assessment and classification
• Transaction risk evaluation and monitoring requirements
• Geographic and jurisdictional risk factor analysis
• Product and service risk assessment and mitigation

COMPLIANCE RECOMMENDATIONS:
• Enhanced due diligence requirements and procedures
• Ongoing monitoring and review frequency recommendations
• Documentation and record-keeping requirements
• Staff training and awareness program needs
• Technology and system enhancement recommendations

Provide comprehensive AML/KYC compliance screening results with risk classification and regulatory guidance.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🔐 AML/KYC Compliance Screening",
            forceModel: "gpt-5" // Full model for compliance analysis
        });

        // Analyze screening results
        const screeningResults = processScreeningResults(screeningData);
        const complianceRisk = assessComplianceRisk(screeningData, screeningResults);
        const regulatoryRequirements = identifyRegulatoryRequirements(complianceRisk);
        const monitoringPlan = developMonitoringPlan(complianceRisk, screeningResults);

        return {
            analysis: result.response,
            borrowerId: borrowerId,
            screeningSummary: {
                overallRiskLevel: complianceRisk.overallRiskLevel,
                pepStatus: screeningResults.pepStatus,
                sanctionsStatus: screeningResults.sanctionsStatus,
                complianceRating: complianceRisk.complianceRating,
                enhancedDueDiligenceRequired: complianceRisk.enhancedDueDiligenceRequired
            },
            screeningResults: screeningResults,
            complianceRisk: complianceRisk,
            regulatoryRequirements: regulatoryRequirements,
            monitoringPlan: monitoringPlan,
            documentationRequirements: generateDocumentationRequirements(complianceRisk),
            screeningDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ AML/KYC screening error:', error.message);
        return {
            analysis: `AML/KYC screening unavailable: ${error.message}`,
            borrowerId: borrowerId,
            screeningSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 🏢 Business Entity Verification
 */
async function verifyBusinessEntity(businessId, verificationData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING FUND - BUSINESS ENTITY VERIFICATION

BUSINESS IDENTIFICATION:
• Business ID: ${businessId}
• Business Legal Name: ${verificationData.businessLegalName || 'Not provided'}
• Registration Number: ${verificationData.registrationNumber || 'Not provided'}
• Industry/Sector: ${verificationData.industry || 'Not specified'}
• Business Type: ${verificationData.businessType || 'Not specified'}

REGISTRATION AND LICENSING:
• Business License Status: ${verificationData.businessLicenseStatus || 'Not verified'}
• Registration Date: ${verificationData.registrationDate || 'Not provided'}
• License Expiry Date: ${verificationData.licenseExpiryDate || 'Not provided'}
• Industry-Specific Permits: ${verificationData.industrySpecificPermits || 'Not verified'}
• Professional Licenses: ${verificationData.professionalLicenses || 'Not applicable'}

OPERATIONAL VERIFICATION:
• Business Premises: ${verificationData.businessPremises || 'Not verified'}
• Operating Address: ${verificationData.operatingAddress || 'Not provided'}
• Years in Operation: ${verificationData.yearsInOperation || 'Not specified'}
• Employee Count: ${verificationData.employeeCount || 'Not provided'}
• Annual Revenue: $${verificationData.annualRevenue ? verificationData.annualRevenue.toLocaleString() : 'Not disclosed'} USD

OWNERSHIP AND MANAGEMENT:
• Ownership Structure: ${verificationData.ownershipStructure || 'Not documented'}
• Key Shareholders: ${verificationData.keyShareholders || 'Not identified'}
• Management Team: ${verificationData.managementTeam || 'Not provided'}
• Ultimate Beneficial Owners: ${verificationData.ultimateBeneficialOwners || 'Not identified'}

FINANCIAL INFORMATION:
• Financial Statements Available: ${verificationData.financialStatementsAvailable || 'Not provided'}
• Audited Statements: ${verificationData.auditedStatements || 'Not available'}
• Tax Compliance Status: ${verificationData.taxComplianceStatus || 'Not verified'}
• Banking Relationships: ${verificationData.bankingRelationships || 'Not disclosed'}

BUSINESS ENTITY VERIFICATION ANALYSIS:

1. **LEGAL ENTITY VALIDATION**
   - Business registration authenticity and current status
   - Corporate structure legitimacy and compliance
   - Legal name consistency across documentation
   - Jurisdiction-specific registration requirements fulfillment

2. **OPERATIONAL LEGITIMACY ASSESSMENT**
   - Business premises existence and operational activity
   - Commercial activity evidence and business substance
   - Employee presence and operational infrastructure
   - Customer base and business relationship validation

3. **LICENSING AND REGULATORY COMPLIANCE**
   - Required business licenses and permits verification
   - Industry-specific regulatory compliance assessment
   - Professional certification and qualification validation
   - Regulatory standing and compliance history review

4. **OWNERSHIP AND CONTROL VERIFICATION**
   - Shareholder identification and ownership percentage validation
   - Ultimate beneficial ownership transparency and disclosure
   - Management team background and qualification verification
   - Control mechanism and decision-making authority assessment

5. **FINANCIAL CAPACITY AND STABILITY ASSESSMENT**
   - Financial statement quality and auditor credibility
   - Revenue generation consistency and sustainability
   - Asset base and capital structure evaluation
   - Cash flow adequacy and working capital assessment

6. **INDUSTRY AND MARKET POSITION ANALYSIS**
   - Industry sector risk assessment and characteristics
   - Competitive position and market share evaluation
   - Business model viability and sustainability analysis
   - Economic cycle sensitivity and resilience assessment

7. **REPUTATION AND TRACK RECORD EVALUATION**
   - Business reputation and market standing assessment
   - Customer and supplier relationship quality
   - Payment history and commercial credit rating
   - Legal disputes and regulatory enforcement actions

8. **RISK FACTOR IDENTIFICATION AND ASSESSMENT**
   - Business model and operational risk evaluation
   - Industry-specific risk factors and mitigation measures
   - Geographic and jurisdictional risk considerations
   - Technology and cyber security risk assessment

CAMBODIA BUSINESS VERIFICATION REQUIREMENTS:
• Ministry of Commerce business registration verification
• General Department of Taxation tax compliance confirmation
• Labor law compliance and employee registration verification
• Environmental and safety permit validation
• Foreign investment approval and compliance (if applicable)

VERIFICATION FINDINGS AND RECOMMENDATIONS:
• Business legitimacy confirmation and risk assessment
• Operational capacity and financial stability evaluation
• Regulatory compliance status and risk mitigation needs
• Enhanced monitoring and review requirements
• Loan structuring and security recommendations

Provide comprehensive business entity verification with risk assessment and lending recommendations.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🏢 Business Entity Verification",
            forceModel: "gpt-5" // Full model for business analysis
        });

        // Analyze business verification
        const verificationResults = analyzeBusinessVerification(verificationData);
        const legitimacyAssessment = assessBusinessLegitimacy(verificationData);
        const operationalRisk = evaluateOperationalRisk(verificationData);
        const businessRecommendations = generateBusinessRecommendations(legitimacyAssessment, operationalRisk);

        return {
            analysis: result.response,
            businessId: businessId,
            verificationSummary: {
                businessLegalName: verificationData.businessLegalName,
                legitimacyStatus: legitimacyAssessment.legitimacyStatus,
                operationalRisk: operationalRisk.riskLevel,
                complianceStatus: verificationResults.complianceStatus,
                recommendedAction: businessRecommendations.recommendedAction
            },
            verificationResults: verificationResults,
            legitimacyAssessment: legitimacyAssessment,
            operationalRisk: operationalRisk,
            businessRecommendations: businessRecommendations,
            requiredDocuments: identifyRequiredBusinessDocuments(legitimacyAssessment),
            verificationDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Business entity verification error:', error.message);
        return {
            analysis: `Business entity verification unavailable: ${error.message}`,
            businessId: businessId,
            verificationSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * ⚠️ Red Flag Detection and Analysis
 */
async function detectAndAnalyzeRedFlags(borrowerId, redFlagData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING FUND - RED FLAG DETECTION AND ANALYSIS

BORROWER IDENTIFICATION:
• Borrower ID: ${borrowerId}
• Borrower Name: ${redFlagData.borrowerName || 'Not specified'}
• Risk Assessment Date: ${new Date().toISOString().split('T')[0]}
• Review Trigger: ${redFlagData.reviewTrigger || 'Routine screening'}

IDENTIFIED RED FLAGS:
• Identity Red Flags: ${redFlagData.identityRedFlags ? redFlagData.identityRedFlags.length : 0} identified
• Financial Red Flags: ${redFlagData.financialRedFlags ? redFlagData.financialRedFlags.length : 0} identified
• Business Red Flags: ${redFlagData.businessRedFlags ? redFlagData.businessRedFlags.length : 0} identified
• Behavioral Red Flags: ${redFlagData.behavioralRedFlags ? redFlagData.behavioralRedFlags.length : 0} identified
• Compliance Red Flags: ${redFlagData.complianceRedFlags ? redFlagData.complianceRedFlags.length : 0} identified

SPECIFIC RED FLAG DETAILS:
${redFlagData.identityRedFlags ? '• Identity Issues: ' + redFlagData.identityRedFlags.join(', ') : '• Identity Issues: None identified'}
${redFlagData.financialRedFlags ? '• Financial Concerns: ' + redFlagData.financialRedFlags.join(', ') : '• Financial Concerns: None identified'}
${redFlagData.businessRedFlags ? '• Business Issues: ' + redFlagData.businessRedFlags.join(', ') : '• Business Issues: None identified'}
${redFlagData.behavioralRedFlags ? '• Behavioral Concerns: ' + redFlagData.behavioralRedFlags.join(', ') : '• Behavioral Concerns: None identified'}
${redFlagData.complianceRedFlags ? '• Compliance Issues: ' + redFlagData.complianceRedFlags.join(', ') : '• Compliance Issues: None identified'}

SEVERITY ASSESSMENT:
• Critical Red Flags: ${redFlagData.criticalRedFlags || 0}
• High Risk Red Flags: ${redFlagData.highRiskRedFlags || 0}
• Medium Risk Red Flags: ${redFlagData.mediumRiskRedFlags || 0}
• Total Red Flag Score: ${redFlagData.totalRedFlagScore || 'Not calculated'}

INVESTIGATION STATUS:
• Investigation Completed: ${redFlagData.investigationCompleted || 'Not started'}
• Additional Information Required: ${redFlagData.additionalInfoRequired || 'Not determined'}
• Third-Party Verification Needed: ${redFlagData.thirdPartyVerificationNeeded || 'Not determined'}
• Legal Review Required: ${redFlagData.legalReviewRequired || 'Not determined'}

RED FLAG ANALYSIS AND ASSESSMENT:

1. **RED FLAG CATEGORIZATION AND PRIORITIZATION**
   - Critical red flags requiring immediate attention and investigation
   - High-risk indicators necessitating enhanced due diligence
   - Medium-risk concerns requiring additional verification
   - Low-risk observations for monitoring and documentation

2. **PATTERN ANALYSIS AND CORRELATION**
   - Red flag clustering and relationship identification
   - Historical pattern analysis and trend identification
   - Cross-reference with known fraud indicators
   - Behavioral consistency evaluation and anomaly detection

3. **INVESTIGATION SCOPE AND METHODOLOGY**
   - Required investigation depth and resource allocation
   - Primary and secondary verification source identification
   - Third-party expert engagement and specialist consultation
   - Timeline and milestone establishment for investigation completion

4. **RISK IMPACT ASSESSMENT**
   - Potential financial loss exposure and quantification
   - Regulatory compliance risk and violation consequences
   - Reputational risk and institutional impact evaluation
   - Operational risk and resource requirement assessment

5. **MITIGATION STRATEGY DEVELOPMENT**
   - Immediate risk containment and exposure limitation
   - Enhanced monitoring and surveillance implementation
   - Additional security and collateral requirements
   - Loan structure modification and risk transfer mechanisms

6. **DECISION FRAMEWORK AND RECOMMENDATIONS**
   - Application approval, conditional approval, or decline recommendation
   - Enhanced due diligence requirements and conditions precedent
   - Ongoing monitoring and review frequency recommendations
   - Exit strategy and relationship termination considerations

7. **REGULATORY AND COMPLIANCE IMPLICATIONS**
   - Suspicious activity reporting requirements and obligations
   - Know Your Customer (KYC) enhancement and update needs
   - Anti-money laundering (AML) investigation and documentation
   - Regulatory notification and cooperation requirements

CAMBODIA-SPECIFIC RED FLAG CONSIDERATIONS:
• Political connection and influence assessment
• Family and tribal relationship complexity evaluation
• Informal economy and cash transaction prevalence
• Cross-border activity and regional risk factors
• Cultural and language barrier impact on verification

RED FLAG RESOLUTION AND ACTION PLAN:
• Immediate actions required for critical red flags
• Investigation timeline and resource allocation
• Additional documentation and verification requirements
• Decision criteria and approval authority framework
• Monitoring and follow-up procedure implementation

Provide comprehensive red flag analysis with specific investigation requirements and risk mitigation recommendations.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "⚠️ Red Flag Detection and Analysis",
            forceModel: "gpt-5" // Full model for comprehensive red flag analysis
        });

        // Analyze red flags and develop response
        const redFlagAnalysis = analyzeIdentifiedRedFlags(redFlagData);
        const severityAssessment = assessRedFlagSeverity(redFlagData);
        const investigationPlan = developInvestigationPlan(redFlagAnalysis, severityAssessment);
        const mitigationStrategy = createRedFlagMitigationStrategy(severityAssessment);

        return {
            analysis: result.response,
            borrowerId: borrowerId,
            redFlagSummary: {
                totalRedFlags: redFlagAnalysis.totalRedFlags,
                criticalCount: severityAssessment.criticalCount,
                overallSeverity: severityAssessment.overallSeverity,
                investigationRequired: investigationPlan.investigationRequired,
                recommendedAction: mitigationStrategy.recommendedAction
            },
            redFlagAnalysis: redFlagAnalysis,
            severityAssessment: severityAssessment,
            investigationPlan: investigationPlan,
            mitigationStrategy: mitigationStrategy,
            nextActions: generateRedFlagNextActions(severityAssessment, investigationPlan),
            detectionDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Red flag detection error:', error.message);
        return {
            analysis: `Red flag detection unavailable: ${error.message}`,
            borrowerId: borrowerId,
            redFlagSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

// 🧮 DUE DILIGENCE HELPER FUNCTIONS

/**
 * 📊 Analyze Verification Results
 */
function analyzeVerificationResults(dueDiligenceData) {
    const verificationCategories = [
        'nationalIdStatus', 'addressVerification', 'incomeVerification',
        'assetVerification', 'creditBureauReport', 'businessLicenseStatus',
        'pepScreeningResults', 'sanctionsListCheck', 'titleVerification'
    ];
    
    let completedVerifications = 0;
    let totalVerifications = 0;
    const verificationDetails = {};
    
    verificationCategories.forEach(category => {
        if (dueDiligenceData.hasOwnProperty(category)) {
            totalVerifications++;
            const status = dueDiligenceData[category];
            verificationDetails[category] = status;
            
            if (status && !status.toLowerCase().includes('not') && 
                !status.toLowerCase().includes('pending')) {
                completedVerifications++;
            }
        }
    });
    
    const completenessScore = totalVerifications > 0 ? 
        Math.round((completedVerifications / totalVerifications) * 100) : 0;
    
    return {
        completenessScore: completenessScore,
        completedVerifications: completedVerifications,
        totalVerifications: totalVerifications,
        verificationDetails: verificationDetails,
        completenessLevel: completenessScore >= 90 ? "Complete" : 
                          completenessScore >= 70 ? "Substantial" : 
                          completenessScore >= 50 ? "Partial" : "Insufficient"
    };
}

/**
 * 🎯 Calculate Due Diligence Risk Score
 */
function calculateDueDiligenceRiskScore(dueDiligenceData) {
    const framework = DUE_DILIGENCE_FRAMEWORK.riskScoringFramework;
    let totalScore = 0;
    let maxPossibleScore = 0;
    const categoryScores = {};
    
    // Identity Risk Assessment
    let identityScore = 5; // Start with best score
    if (dueDiligenceData.nationalIdStatus === 'Not completed') identityScore -= 2;
    if (dueDiligenceData.addressVerification === 'Not completed') identityScore -= 1;
    if (dueDiligenceData.documentAuthentication === 'Failed') identityScore -= 2;
    identityScore = Math.max(1, identityScore);
    categoryScores.identityRisk = identityScore;
    totalScore += identityScore * framework.identity_risk.weight;
    maxPossibleScore += 5 * framework.identity_risk.weight;
    
    // Financial Risk Assessment
    let financialScore = 5;
    if (dueDiligenceData.incomeVerification === 'Not completed') financialScore -= 2;
    if (dueDiligenceData.assetVerification === 'Not completed') financialScore -= 1;
    if (dueDiligenceData.bankStatementReview === 'Not completed') financialScore -= 1;
    financialScore = Math.max(1, financialScore);
    categoryScores.financialRisk = financialScore;
    totalScore += financialScore * framework.financial_risk.weight;
    maxPossibleScore += 5 * framework.financial_risk.weight;
    
    // Credit Risk Assessment
    let creditScore = 5;
    if (dueDiligenceData.creditBureauReport === 'Not obtained') creditScore -= 2;
    if (dueDiligenceData.bankingHistory === 'Poor') creditScore -= 2;
    creditScore = Math.max(1, creditScore);
    categoryScores.creditRisk = creditScore;
    totalScore += creditScore * framework.credit_risk.weight;
    maxPossibleScore += 5 * framework.credit_risk.weight;
    
    // Business Risk Assessment (if applicable)
    let businessScore = 5;
    if (dueDiligenceData.borrowerType === 'Business') {
        if (dueDiligenceData.businessLicenseStatus === 'Not verified') businessScore -= 2;
        if (dueDiligenceData.businessOperationsVerification === 'Failed') businessScore -= 2;
        businessScore = Math.max(1, businessScore);
    }
    categoryScores.businessRisk = businessScore;
    totalScore += businessScore * framework.business_risk.weight;
    maxPossibleScore += 5 * framework.business_risk.weight;
    
    // Reputation Risk Assessment
    let reputationScore = 5;
    if (dueDiligenceData.criminalBackgroundCheck === 'Issues identified') reputationScore -= 3;
    if (dueDiligenceData.litigationHistory === 'Multiple cases') reputationScore -= 1;
    reputationScore = Math.max(1, reputationScore);
    categoryScores.reputationRisk = reputationScore;
    totalScore += reputationScore * framework.reputation_risk.weight;
    maxPossibleScore += 5 * framework.reputation_risk.weight;
    
    // Compliance Risk Assessment
    let complianceScore = 5;
    if (dueDiligenceData.pepScreeningResults === 'PEP identified') complianceScore -= 2;
    if (dueDiligenceData.sanctionsListCheck === 'Match found') complianceScore -= 3;
    complianceScore = Math.max(1, complianceScore);
    categoryScores.complianceRisk = complianceScore;
    totalScore += complianceScore * framework.compliance_risk.weight;
    maxPossibleScore += 5 * framework.compliance_risk.weight;
    
    // Calculate final score
    const overallScore = Math.round((totalScore / maxPossibleScore) * 100);
    
    // Determine risk rating
    let overallRating;
    if (overallScore >= 90) overallRating = "Low Risk";
    else if (overallScore >= 75) overallRating = "Medium-Low Risk";
    else if (overallScore >= 60) overallRating = "Medium Risk";
    else if (overallScore >= 45) overallRating = "Medium-High Risk";
    else overallRating = "High Risk";
    
    return {
        overallScore: overallScore,
        overallRating: overallRating,
        categoryScores: categoryScores,
        riskFactors: identifyRiskFactors(categoryScores),
        scoreBreakdown: {
            identityRisk: Math.round(categoryScores.identityRisk * framework.identity_risk.weight),
            financialRisk: Math.round(categoryScores.financialRisk * framework.financial_risk.weight),
            creditRisk: Math.round(categoryScores.creditRisk * framework.credit_risk.weight),
            businessRisk: Math.round(categoryScores.businessRisk * framework.business_risk.weight),
            reputationRisk: Math.round(categoryScores.reputationRisk * framework.reputation_risk.weight),
            complianceRisk: Math.round(categoryScores.complianceRisk * framework.compliance_risk.weight)
        }
    };
}

/**
 * 🚩 Identify Red Flags
 */
function identifyRedFlags(dueDiligenceData) {
    const redFlags = {
        identity: [],
        financial: [],
        business: [],
        behavioral: [],
        compliance: []
    };
    
    // Identity Red Flags
    if (dueDiligenceData.nationalIdStatus === 'Not completed' || 
        dueDiligenceData.nationalIdStatus === 'Failed') {
        redFlags.identity.push("National ID verification failed or incomplete");
    }
    
    if (dueDiligenceData.documentAuthentication === 'Failed' || 
        dueDiligenceData.documentAuthentication?.toLowerCase().includes('suspicious')) {
        redFlags.identity.push("Document authentication issues identified");
    }
    
    // Financial Red Flags
    if (dueDiligenceData.incomeVerification?.toLowerCase().includes('inconsistent')) {
        redFlags.financial.push("Inconsistent income verification");
    }
    
    if (dueDiligenceData.sourceOfFundsVerification?.toLowerCase().includes('unclear') ||
        dueDiligenceData.sourceOfFundsVerification?.toLowerCase().includes('suspicious')) {
        redFlags.financial.push("Unclear or suspicious source of funds");
    }
    
    // Business Red Flags
    if (dueDiligenceData.businessLicenseStatus === 'Expired' || 
        dueDiligenceData.businessLicenseStatus === 'Invalid') {
        redFlags.business.push("Business license expired or invalid");
    }
    
    if (dueDiligenceData.businessOperationsVerification?.toLowerCase().includes('shell') ||
        dueDiligenceData.businessOperationsVerification?.toLowerCase().includes('inactive')) {
        redFlags.business.push("Shell company or inactive business operations");
    }
    
    // Behavioral Red Flags
    if (dueDiligenceData.borrowerCooperation?.toLowerCase().includes('evasive') ||
        dueDiligenceData.borrowerCooperation?.toLowerCase().includes('uncooperative')) {
        redFlags.behavioral.push("Evasive or uncooperative borrower behavior");
    }
    
    // Compliance Red Flags
    if (dueDiligenceData.pepScreeningResults?.toLowerCase().includes('pep identified')) {
        redFlags.compliance.push("Politically Exposed Person (PEP) identified");
    }
    
    if (dueDiligenceData.sanctionsListCheck?.toLowerCase().includes('match')) {
        redFlags.compliance.push("Sanctions list match found");
    }
    
    if (dueDiligenceData.criminalBackgroundCheck?.toLowerCase().includes('criminal history') ||
        dueDiligenceData.criminalBackgroundCheck?.toLowerCase().includes('convictions')) {
        redFlags.compliance.push("Criminal history or convictions identified");
    }
    
    // Calculate totals
    const totalRedFlags = Object.values(redFlags).reduce((sum, flags) => sum + flags.length, 0);
    
    return {
        identityRedFlags: redFlags.identity,
        financialRedFlags: redFlags.financial,
        businessRedFlags: redFlags.business,
        behavioralRedFlags: redFlags.behavioral,
        complianceRedFlags: redFlags.compliance,
        totalRedFlags: totalRedFlags,
        redFlagSeverity: totalRedFlags > 5 ? "High" : totalRedFlags > 2 ? "Medium" : "Low"
    };
}

/**
 * ✅ Assess Compliance Status
 */
function assessComplianceStatus(dueDiligenceData) {
    const complianceChecks = {
        amlCompliance: dueDiligenceData.pepScreeningResults !== 'Not completed' && 
                      dueDiligenceData.sanctionsListCheck !== 'Not completed',
        kycCompliance: dueDiligenceData.nationalIdStatus !== 'Not completed' && 
                      dueDiligenceData.addressVerification !== 'Not completed',
        documentCompliance: dueDiligenceData.documentAuthentication !== 'Not completed',
        sourceOfFundsCompliance: dueDiligenceData.sourceOfFundsVerification !== 'Not completed'
    };
    
    const complianceCount = Object.values(complianceChecks).filter(Boolean).length;
    const totalChecks = Object.keys(complianceChecks).length;
    const compliancePercentage = Math.round((complianceCount / totalChecks) * 100);
    
    let overallStatus;
    if (compliancePercentage >= 100) overallStatus = "Fully Compliant";
    else if (compliancePercentage >= 75) overallStatus = "Substantially Compliant";
    else if (compliancePercentage >= 50) overallStatus = "Partially Compliant";
    else overallStatus = "Non-Compliant";
    
    return {
        overallStatus: overallStatus,
        compliancePercentage: compliancePercentage,
        complianceChecks: complianceChecks,
        missingCompliance: Object.keys(complianceChecks).filter(key => !complianceChecks[key])
    };
}

/**
 * 💡 Generate Due Diligence Recommendations
 */
function generateDueDiligenceRecommendations(riskAssessment, redFlags, complianceStatus) {
    const recommendations = [];
    let recommendationLevel = "Standard";
    
    // Based on overall risk rating
    if (riskAssessment.overallRating === "High Risk") {
        recommendationLevel = "Decline";
        recommendations.push({
            category: "Application Decision",
            recommendation: "Recommend loan application decline",
            priority: "Critical",
            rationale: "High overall risk rating indicates unacceptable risk level"
        });
    } else if (riskAssessment.overallRating === "Medium-High Risk") {
        recommendationLevel = "Enhanced Due Diligence";
        recommendations.push({
            category: "Enhanced Due Diligence",
            recommendation: "Require comprehensive enhanced due diligence",
            priority: "High",
            rationale: "Medium-high risk requires additional verification and monitoring"
        });
    }
    
    // Based on red flags
    if (redFlags.totalRedFlags > 3) {
        recommendations.push({
            category: "Red Flag Investigation",
            recommendation: "Conduct thorough investigation of all identified red flags",
            priority: "High",
            rationale: "Multiple red flags require comprehensive investigation before approval"
        });
    }
    
    // Based on compliance status
    if (complianceStatus.overallStatus === "Non-Compliant" || 
        complianceStatus.overallStatus === "Partially Compliant") {
        recommendations.push({
            category: "Compliance Remediation",
            recommendation: "Complete all outstanding compliance requirements",
            priority: "Critical",
            rationale: "Regulatory compliance must be achieved before loan approval"
        });
    }
    
    // Category-specific recommendations
    if (riskAssessment.categoryScores.identityRisk < 3) {
        recommendations.push({
            category: "Identity Verification",
            recommendation: "Enhanced identity verification with third-party validation",
            priority: "High",
            rationale: "Identity risk concerns require additional verification"
        });
    }
    
    if (riskAssessment.categoryScores.financialRisk < 3) {
        recommendations.push({
            category: "Financial Verification", 
            recommendation: "Independent financial verification and asset confirmation",
            priority: "Medium",
            rationale: "Financial risk concerns require independent verification"
        });
    }
    
    return {
        recommendationLevel: recommendationLevel,
        recommendations: recommendations,
        totalRecommendations: recommendations.length,
        criticalRecommendations: recommendations.filter(r => r.priority === "Critical").length
    };
}

/**
 * 📋 Generate Next Steps
 */
function generateNextSteps(riskAssessment, recommendations) {
    const nextSteps = [];
    
    if (recommendations.recommendationLevel === "Decline") {
        nextSteps.push({
            step: "Prepare decline letter with specific reasons",
            deadline: "Within 2 business days",
            responsibility: "Credit Manager"
        });
        
        nextSteps.push({
            step: "Document all findings for regulatory compliance",
            deadline: "Within 5 business days",
            responsibility: "Compliance Officer"
        });
    } else {
        nextSteps.push({
            step: "Complete outstanding due diligence items",
            deadline: "Within 10 business days",
            responsibility: "Due Diligence Team"
        });
        
        if (recommendations.recommendationLevel === "Enhanced Due Diligence") {
            nextSteps.push({
                step: "Engage third-party verification services",
                deadline: "Within 5 business days",
                responsibility: "Operations Manager"
            });
            
            nextSteps.push({
                step: "Schedule enhanced customer interview",
                deadline: "Within 7 business days",
                responsibility: "Relationship Manager"
            });
        }
        
        nextSteps.push({
            step: "Prepare credit committee presentation",
            deadline: "After due diligence completion",
            responsibility: "Credit Analyst"
        });
    }
    
    return nextSteps;
}

// AML/KYC Helper Functions

/**
 * 🔍 Process Screening Results
 */
function processScreeningResults(screeningData) {
    const results = {
        pepStatus: "Clear",
        sanctionsStatus: "Clear",
        adverseMediaStatus: "Clear",
        overallScreeningResult: "Pass"
    };
    
    // PEP Screening
    if (screeningData.pepScreeningStatus?.toLowerCase().includes('identified') ||
        screeningData.pepScreeningStatus?.toLowerCase().includes('match')) {
        results.pepStatus = "PEP Identified";
        results.overallScreeningResult = "Requires Review";
    }
    
    // Sanctions Screening
    if (screeningData.sanctionsListResults?.toLowerCase().includes('match') ||
        screeningData.sanctionsListResults?.toLowerCase().includes('hit')) {
        results.sanctionsStatus = "Match Found";
        results.overallScreeningResult = "Fail";
    }
    
    // Adverse Media
    if (screeningData.adverseMediaCheck?.toLowerCase().includes('negative') ||
        screeningData.adverseMediaCheck?.toLowerCase().includes('adverse')) {
        results.adverseMediaStatus = "Adverse Media Found";
        if (results.overallScreeningResult === "Pass") {
            results.overallScreeningResult = "Requires Review";
        }
    }
    
    return results;
}

/**
 * ⚖️ Assess Compliance Risk
 */
function assessComplianceRisk(screeningData, screeningResults) {
    let riskScore = 0;
    let enhancedDueDiligenceRequired = false;
    
    // PEP Risk
    if (screeningResults.pepStatus === "PEP Identified") {
        riskScore += 30;
        enhancedDueDiligenceRequired = true;
    }
    
    // Sanctions Risk
    if (screeningResults.sanctionsStatus === "Match Found") {
        riskScore += 50; // High risk
        enhancedDueDiligenceRequired = true;
    }
    
    // Adverse Media Risk
    if (screeningResults.adverseMediaStatus === "Adverse Media Found") {
        riskScore += 20;
        enhancedDueDiligenceRequired = true;
    }
    
    // Transaction Risk
    const transactionAmount = parseFloat(screeningData.transactionAmount || 0);
    if (transactionAmount > 100000) riskScore += 10; // High value transaction
    
    // Geographic Risk
    if (screeningData.geographicRiskFactors?.toLowerCase().includes('high')) {
        riskScore += 15;
    }
    
    // Risk Level Assessment
    let overallRiskLevel;
    if (riskScore >= 50) overallRiskLevel = "High";
    else if (riskScore >= 25) overallRiskLevel = "Medium";
    else overallRiskLevel = "Low";
    
    // Compliance Rating
    let complianceRating;
    if (screeningResults.sanctionsStatus === "Match Found") complianceRating = "Non-Compliant";
    else if (enhancedDueDiligenceRequired) complianceRating = "Conditional";
    else complianceRating = "Compliant";
    
    return {
        riskScore: riskScore,
        overallRiskLevel: overallRiskLevel,
        complianceRating: complianceRating,
        enhancedDueDiligenceRequired: enhancedDueDiligenceRequired,
        riskFactors: identifyComplianceRiskFactors(screeningData, screeningResults)
    };
}

/**
 * 📋 Identify Regulatory Requirements
 */
function identifyRegulatoryRequirements(complianceRisk) {
    const requirements = [];
    
    if (complianceRisk.enhancedDueDiligenceRequired) {
        requirements.push({
            requirement: "Enhanced Due Diligence (EDD)",
            description: "Comprehensive background investigation and verification",
            deadline: "Before account opening",
            authority: "Cambodia AML Law"
        });
    }
    
    if (complianceRisk.overallRiskLevel === "High") {
        requirements.push({
            requirement: "Senior Management Approval",
            description: "High-risk relationship requires senior management approval",
            deadline: "Before relationship establishment",
            authority: "NBC Regulations"
        });
    }
    
    requirements.push({
        requirement: "Ongoing Monitoring",
        description: "Regular review and monitoring of customer activities",
        deadline: "Continuous",
        authority: "AML/CFT Guidelines"
    });
    
    if (complianceRisk.riskScore > 30) {
        requirements.push({
            requirement: "Increased Reporting Frequency",
            description: "Enhanced transaction monitoring and reporting",
            deadline: "Monthly reviews",
            authority: "CAFIU Guidelines"
        });
    }
    
    return requirements;
}

/**
 * 📊 Develop Monitoring Plan
 */
function developMonitoringPlan(complianceRisk, screeningResults) {
    let monitoringFrequency;
    let monitoringLevel;
    
    if (complianceRisk.overallRiskLevel === "High") {
        monitoringFrequency = "Monthly";
        monitoringLevel = "Enhanced";
    } else if (complianceRisk.overallRiskLevel === "Medium") {
        monitoringFrequency = "Quarterly";
        monitoringLevel = "Standard Plus";
    } else {
        monitoringFrequency = "Annual";
        monitoringLevel = "Standard";
    }
    
    const monitoringElements = [
        "Transaction pattern analysis",
        "Source of funds verification",
        "Beneficial ownership updates"
    ];
    
    if (screeningResults.pepStatus === "PEP Identified") {
        monitoringElements.push("PEP status monitoring");
        monitoringElements.push("Political exposure assessment");
    }
    
    if (complianceRisk.enhancedDueDiligenceRequired) {
        monitoringElements.push("Enhanced customer profiling");
        monitoringElements.push("Adverse media monitoring");
    }
    
    return {
        monitoringLevel: monitoringLevel,
        monitoringFrequency: monitoringFrequency,
        monitoringElements: monitoringElements,
        nextReviewDate: calculateNextReviewDate(monitoringFrequency),
        alertThresholds: defineAlertThresholds(complianceRisk)
    };
}

/**
 * 📄 Generate Documentation Requirements
 */
function generateDocumentationRequirements(complianceRisk) {
    const requirements = [];
    
    // Standard Requirements
    requirements.push({
        document: "Customer Identification Program (CIP) Documentation",
        description: "Complete identity verification documentation",
        retention: "5 years after relationship termination"
    });
    
    requirements.push({
        document: "Risk Assessment Documentation",
        description: "Formal risk assessment and classification",
        retention: "7 years"
    });
    
    // Enhanced Requirements
    if (complianceRisk.enhancedDueDiligenceRequired) {
        requirements.push({
            document: "Enhanced Due Diligence File",
            description: "Comprehensive EDD investigation documentation",
            retention: "7 years after relationship termination"
        });
        
        requirements.push({
            document: "Source of Wealth Documentation",
            description: "Detailed documentation of wealth accumulation",
            retention: "7 years"
        });
    }
    
    // High Risk Requirements
    if (complianceRisk.overallRiskLevel === "High") {
        requirements.push({
            document: "Senior Management Approval",
            description: "Documented approval from senior management",
            retention: "Life of relationship + 5 years"
        });
        
        requirements.push({
            document: "Ongoing Monitoring Records",
            description: "Enhanced monitoring and review documentation",
            retention: "5 years from date of review"
        });
    }
    
    return requirements;
}

// Business Verification Helper Functions

/**
 * 🏢 Analyze Business Verification
 */
function analyzeBusinessVerification(verificationData) {
    const verificationAreas = {
        legalStatus: assessLegalStatus(verificationData),
        operationalStatus: assessOperationalStatus(verificationData),
        financialStatus: assessFinancialStatus(verificationData),
        complianceStatus: assessBusinessCompliance(verificationData)
    };
    
    const overallScore = Object.values(verificationAreas).reduce((sum, area) => sum + area.score, 0) / 4;
    
    let complianceStatus;
    if (overallScore >= 4) complianceStatus = "Verified";
    else if (overallScore >= 3) complianceStatus = "Substantially Verified";
    else if (overallScore >= 2) complianceStatus = "Partially Verified";
    else complianceStatus = "Unverified";
    
    return {
        verificationAreas: verificationAreas,
        overallScore: overallScore.toFixed(1),
        complianceStatus: complianceStatus,
        verificationGaps: identifyVerificationGaps(verificationAreas)
    };
}

/**
 * ✅ Assess Business Legitimacy
 */
function assessBusinessLegitimacy(verificationData) {
    let legitimacyScore = 0;
    const legitimacyFactors = [];
    
    // Business Registration
    if (verificationData.businessLicenseStatus === 'Valid') {
        legitimacyScore += 25;
        legitimacyFactors.push("Valid business license confirmed");
    } else if (verificationData.businessLicenseStatus === 'Expired') {
        legitimacyFactors.push("Business license expired - renewal required");
    }
    
    // Operating History
    const yearsInOperation = parseInt(verificationData.yearsInOperation || 0);
    if (yearsInOperation >= 5) {
        legitimacyScore += 25;
        legitimacyFactors.push("Established operating history (5+ years)");
    } else if (yearsInOperation >= 2) {
        legitimacyScore += 15;
        legitimacyFactors.push("Moderate operating history (2-5 years)");
    } else {
        legitimacyFactors.push("Limited operating history (<2 years)");
    }
    
    // Business Premises
    if (verificationData.businessPremises === 'Verified') {
        legitimacyScore += 20;
        legitimacyFactors.push("Business premises verified and operational");
    } else {
        legitimacyFactors.push("Business premises not verified");
    }
    
    // Financial Statements
    if (verificationData.auditedStatements === 'Available') {
        legitimacyScore += 15;
        legitimacyFactors.push("Audited financial statements available");
    } else if (verificationData.financialStatementsAvailable === 'Yes') {
        legitimacyScore += 10;
        legitimacyFactors.push("Unaudited financial statements available");
    }
    
    // Tax Compliance
    if (verificationData.taxComplianceStatus === 'Compliant') {
        legitimacyScore += 15;
        legitimacyFactors.push("Tax compliance verified");
    } else {
        legitimacyFactors.push("Tax compliance issues identified");
    }
    
    // Determine legitimacy status
    let legitimacyStatus;
    if (legitimacyScore >= 80) legitimacyStatus = "Fully Legitimate";
    else if (legitimacyScore >= 60) legitimacyStatus = "Substantially Legitimate";
    else if (legitimacyScore >= 40) legitimacyStatus = "Questionable Legitimacy";
    else legitimacyStatus = "Illegitimate Concerns";
    
    return {
        legitimacyScore: legitimacyScore,
        legitimacyStatus: legitimacyStatus,
        legitimacyFactors: legitimacyFactors,
        legitimacyRisk: legitimacyScore < 60 ? "High" : legitimacyScore < 80 ? "Medium" : "Low"
    };
}

/**
 * 📊 Evaluate Operational Risk
 */
function evaluateOperationalRisk(verificationData) {
    let riskScore = 100; // Start with no risk
    const riskFactors = [];
    
    // Industry Risk
    const industry = verificationData.industry || "";
    if (industry.toLowerCase().includes("construction") || 
        industry.toLowerCase().includes("real estate development")) {
        riskScore -= 20;
        riskFactors.push("High-risk industry (construction/real estate)");
    } else if (industry.toLowerCase().includes("tourism") || 
               industry.toLowerCase().includes("hospitality")) {
        riskScore -= 15;
        riskFactors.push("Cyclical industry risk (tourism/hospitality)");
    }
    
    // Operating History Risk
    const yearsInOperation = parseInt(verificationData.yearsInOperation || 0);
    if (yearsInOperation < 2) {
        riskScore -= 25;
        riskFactors.push("Limited operating history increases risk");
    }
    
    // Financial Risk
    if (verificationData.financialStatementsAvailable !== 'Yes') {
        riskScore -= 15;
        riskFactors.push("Financial statements not available");
    }
    
    if (verificationData.auditedStatements !== 'Available') {
        riskScore -= 10;
        riskFactors.push("No audited financial statements");
    }
    
    // Management Risk
    if (!verificationData.managementTeam || verificationData.managementTeam === 'Not provided') {
        riskScore -= 15;
        riskFactors.push("Management team information not provided");
    }
    
    // Employee Base Risk
    const employeeCount = parseInt(verificationData.employeeCount || 0);
    if (employeeCount < 5) {
        riskScore -= 10;
        riskFactors.push("Small employee base indicates limited scale");
    }
    
    // Determine risk level
    let riskLevel;
    if (riskScore >= 80) riskLevel = "Low";
    else if (riskScore >= 60) riskLevel = "Medium";
    else if (riskScore >= 40) riskLevel = "High";
    else riskLevel = "Very High";
    
    return {
        riskScore: Math.max(0, riskScore),
        riskLevel: riskLevel,
        riskFactors: riskFactors,
        mitigationRecommendations: generateOperationalRiskMitigation(riskLevel, riskFactors)
    };
}

/**
 * 💡 Generate Business Recommendations
 */
function generateBusinessRecommendations(legitimacyAssessment, operationalRisk) {
    const recommendations = [];
    let recommendedAction = "Approve";
    
    // Based on legitimacy assessment
    if (legitimacyAssessment.legitimacyStatus === "Illegitimate Concerns") {
        recommendedAction = "Decline";
        recommendations.push({
            area: "Business Legitimacy",
            recommendation: "Decline loan application due to legitimacy concerns",
            priority: "Critical",
            rationale: "Significant questions about business legitimacy"
        });
    } else if (legitimacyAssessment.legitimacyStatus === "Questionable Legitimacy") {
        recommendedAction = "Conditional Approval";
        recommendations.push({
            area: "Enhanced Verification",
            recommendation: "Require additional business verification before approval",
            priority: "High",
            rationale: "Legitimacy questions require additional verification"
        });
    }
    
    // Based on operational risk
    if (operationalRisk.riskLevel === "Very High") {
        recommendedAction = "Decline";
        recommendations.push({
            area: "Operational Risk",
            recommendation: "Decline due to excessive operational risk",
            priority: "Critical",
            rationale: "Operational risk exceeds acceptable thresholds"
        });
    } else if (operationalRisk.riskLevel === "High") {
        if (recommendedAction !== "Decline") {
            recommendedAction = "Conditional Approval";
        }
        recommendations.push({
            area: "Risk Mitigation",
            recommendation: "Implement enhanced risk mitigation measures",
            priority: "High",
            rationale: "High operational risk requires additional protections"
        });
    }
    
    // Specific recommendations
    if (legitimacyAssessment.legitimacyScore < 80) {
        recommendations.push({
            area: "Documentation",
            recommendation: "Obtain additional business documentation and verification",
            priority: "Medium",
            rationale: "Strengthen business legitimacy documentation"
        });
    }
    
    if (operationalRisk.riskScore < 70) {
        recommendations.push({
            area: "Monitoring",
            recommendation: "Implement enhanced ongoing monitoring",
            priority: "Medium",
            rationale: "Higher risk profile requires closer monitoring"
        });
    }
    
    return {
        recommendedAction: recommendedAction,
        recommendations: recommendations,
        totalRecommendations: recommendations.length,
        criticalRecommendations: recommendations.filter(r => r.priority === "Critical").length
    };
}

/**
 * 📋 Identify Required Business Documents
 */
function identifyRequiredBusinessDocuments(legitimacyAssessment) {
    const documents = [];
    
    // Standard business documents
    documents.push({
        document: "Business License/Registration Certificate",
        description: "Current and valid business operating license",
        priority: "Critical",
        obtained: legitimacyAssessment.legitimacyFactors.some(f => f.includes("Valid business license"))
    });
    
    documents.push({
        document: "Financial Statements",
        description: "Latest 2-3 years of financial statements",
        priority: "High",
        obtained: legitimacyAssessment.legitimacyFactors.some(f => f.includes("financial statements"))
    });
    
    documents.push({
        document: "Tax Returns and Compliance Certificates",
        description: "Tax returns and compliance verification",
        priority: "High",
        obtained: legitimacyAssessment.legitimacyFactors.some(f => f.includes("Tax compliance"))
    });
    
    // Additional documents based on legitimacy assessment
    if (legitimacyAssessment.legitimacyScore < 70) {
        documents.push({
            document: "Business Premises Lease/Ownership",
            description: "Proof of business premises ownership or lease agreement",
            priority: "High",
            obtained: false
        });
        
        documents.push({
            document: "Management Team CVs",
            description: "Detailed background of key management personnel",
            priority: "Medium",
            obtained: false
        });
        
        documents.push({
            document: "Major Customer/Supplier Contracts",
            description: "Evidence of ongoing business relationships",
            priority: "Medium",
            obtained: false
        });
    }
    
    return documents;
}

// Red Flag Analysis Helper Functions

/**
 * 🚩 Analyze Identified Red Flags
 */
function analyzeIdentifiedRedFlags(redFlagData) {
    const allRedFlags = [
        ...(redFlagData.identityRedFlags || []),
        ...(redFlagData.financialRedFlags || []),
        ...(redFlagData.businessRedFlags || []),
        ...(redFlagData.behavioralRedFlags || []),
        ...(redFlagData.complianceRedFlags || [])
    ];
    
    const redFlagsByCategory = {
        identity: redFlagData.identityRedFlags || [],
        financial: redFlagData.financialRedFlags || [],
        business: redFlagData.businessRedFlags || [],
        behavioral: redFlagData.behavioralRedFlags || [],
        compliance: redFlagData.complianceRedFlags || []
    };
    
    // Identify patterns
    const patterns = identifyRedFlagPatterns(redFlagsByCategory);
    
    return {
        totalRedFlags: allRedFlags.length,
        redFlagsByCategory: redFlagsByCategory,
        redFlagPatterns: patterns,
        highestRiskCategory: identifyHighestRiskCategory(redFlagsByCategory)
    };
}

/**
 * ⚖️ Assess Red Flag Severity
 */
function assessRedFlagSeverity(redFlagData) {
    let severityScore = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    
    // Critical red flags (automatic decline triggers)
    const criticalFlags = [
        "Sanctions list match",
        "Criminal convictions",
        "Document forgery",
        "Money laundering concerns"
    ];
    
    // High severity red flags
    const highSeverityFlags = [
        "PEP identification",
        "Unexplained wealth",
        "Business legitimacy issues",
        "Identity inconsistencies"
    ];
    
    // Analyze all red flags
    const allFlags = [
        ...(redFlagData.identityRedFlags || []),
        ...(redFlagData.financialRedFlags || []),
        ...(redFlagData.businessRedFlags || []),
        ...(redFlagData.behavioralRedFlags || []),
        ...(redFlagData.complianceRedFlags || [])
    ];
    
    allFlags.forEach(flag => {
        const flagLower = flag.toLowerCase();
        
        if (criticalFlags.some(cf => flagLower.includes(cf.toLowerCase()))) {
            severityScore += 50;
            criticalCount++;
        } else if (highSeverityFlags.some(hf => flagLower.includes(hf.toLowerCase()))) {
            severityScore += 25;
            highCount++;
        } else {
            severityScore += 10;
            mediumCount++;
        }
    });
    
    // Determine overall severity
    let overallSeverity;
    if (criticalCount > 0) overallSeverity = "Critical";
    else if (severityScore >= 75) overallSeverity = "High";
    else if (severityScore >= 35) overallSeverity = "Medium";
    else overallSeverity = "Low";
    
    return {
        severityScore: severityScore,
        overallSeverity: overallSeverity,
        criticalCount: criticalCount,
        highCount: highCount,
        mediumCount: mediumCount,
        totalFlags: allFlags.length,
        riskLevel: overallSeverity
    };
}

/**
 * 🔍 Develop Investigation Plan
 */
function developInvestigationPlan(redFlagAnalysis, severityAssessment) {
    const investigationRequired = severityAssessment.overallSeverity !== "Low";
    const investigationSteps = [];
    
    if (investigationRequired) {
        // Critical investigations
        if (severityAssessment.criticalCount > 0) {
            investigationSteps.push({
                step: "Immediate escalation to compliance officer",
                priority: "Critical",
                timeline: "Immediate",
                resources: ["Compliance Officer", "Legal Counsel"]
            });
            
            investigationSteps.push({
                step: "Comprehensive background investigation",
                priority: "Critical",
                timeline: "48 hours",
                resources: ["Private Investigator", "Legal Team"]
            });
        }
        
        // High priority investigations
        if (severityAssessment.overallSeverity === "High" || severityAssessment.overallSeverity === "Critical") {
            investigationSteps.push({
                step: "Third-party verification of identity and business",
                priority: "High",
                timeline: "5 business days",
                resources: ["Verification Service Provider"]
            });
            
            investigationSteps.push({
                step: "Enhanced source of funds investigation",
                priority: "High",
                timeline: "7 business days",
                resources: ["Financial Investigator"]
            });
        }
        
        // Standard investigations
        investigationSteps.push({
            step: "Document all red flag findings",
            priority: "Medium",
            timeline: "3 business days",
            resources: ["Due Diligence Team"]
        });
        
        investigationSteps.push({
            step: "Prepare investigation summary report",
            priority: "Medium",
            timeline: "Upon completion of investigations",
            resources: ["Credit Analyst", "Compliance Officer"]
        });
    }
    
    return {
        investigationRequired: investigationRequired,
        investigationSteps: investigationSteps,
        estimatedTimeline: calculateInvestigationTimeline(investigationSteps),
        resourceRequirements: extractResourceRequirements(investigationSteps),
        escalationRequired: severityAssessment.criticalCount > 0
    };
}

/**
 * 🛡️ Create Red Flag Mitigation Strategy
 */
function createRedFlagMitigationStrategy(severityAssessment) {
    let recommendedAction;
    const mitigationMeasures = [];
    
    if (severityAssessment.criticalCount > 0) {
        recommendedAction = "Immediate Decline";
        mitigationMeasures.push({
            measure: "Immediately decline loan application",
            rationale: "Critical red flags present unacceptable risk",
            implementation: "Immediate"
        });
        
        mitigationMeasures.push({
            measure: "File suspicious activity report if required",
            rationale: "Regulatory compliance obligation",
            implementation: "Within regulatory timeframes"
        });
        
    } else if (severityAssessment.overallSeverity === "High") {
        recommendedAction = "Conditional Decline Pending Investigation";
        mitigationMeasures.push({
            measure: "Suspend application processing pending investigation",
            rationale: "High-risk red flags require thorough investigation",
            implementation: "Immediate"
        });
        
        mitigationMeasures.push({
            measure: "Require enhanced due diligence and verification",
            rationale: "Additional verification may resolve red flag concerns",
            implementation: "Before any approval consideration"
        });
        
    } else if (severityAssessment.overallSeverity === "Medium") {
        recommendedAction = "Enhanced Due Diligence Required";
        mitigationMeasures.push({
            measure: "Require additional documentation and verification",
            rationale: "Medium-risk concerns require additional comfort",
            implementation: "Before approval"
        });
        
        mitigationMeasures.push({
            measure: "Implement enhanced ongoing monitoring",
            rationale: "Ongoing risk management for identified concerns",
            implementation: "Throughout relationship"
        });
        
    } else {
        recommendedAction = "Standard Processing with Documentation";
        mitigationMeasures.push({
            measure: "Document red flag assessment and resolution",
            rationale: "Maintain complete audit trail",
            implementation: "Before approval"
        });
    }
    
    return {
        recommendedAction: recommendedAction,
        mitigationMeasures: mitigationMeasures,
        ongoingMonitoring: generateOngoingMonitoringPlan(severityAssessment),
        reviewPeriod: determineReviewPeriod(severityAssessment)
    };
}

/**
 * 📋 Generate Red Flag Next Actions
 */
function generateRedFlagNextActions(severityAssessment, investigationPlan) {
    const nextActions = [];
    
    if (severityAssessment.criticalCount > 0) {
        nextActions.push({
            action: "Immediately notify senior management and compliance",
            deadline: "Within 2 hours",
            responsibility: "Due Diligence Manager",
            priority: "Critical"
        });
        
        nextActions.push({
            action: "Prepare decline notification and documentation",
            deadline: "Within 24 hours",
            responsibility: "Credit Manager",
            priority: "Critical"
        });
        
    } else if (investigationPlan.investigationRequired) {
        nextActions.push({
            action: "Initiate investigation procedures",
            deadline: "Within 24 hours",
            responsibility: "Due Diligence Team",
            priority: "High"
        });
        
        nextActions.push({
            action: "Engage required external resources",
            deadline: "Within 48 hours",
            responsibility: "Operations Manager",
            priority: "High"
        });
        
        nextActions.push({
            action: "Set investigation review meeting",
            deadline: "Upon investigation completion",
            responsibility: "Credit Committee",
            priority: "Medium"
        });
    }
    
    nextActions.push({
        action: "Update risk assessment and borrower profile",
        deadline: "Upon red flag resolution",
        responsibility: "Risk Management",
        priority: "Medium"
    });
    
    return nextActions;
}

// Additional Helper Functions

function identifyRiskFactors(categoryScores) {
    const riskFactors = [];
    
    Object.keys(categoryScores).forEach(category => {
        if (categoryScores[category] < 3) {
            riskFactors.push(`${category.replace('Risk', ' Risk')}: Below acceptable threshold`);
        }
    });
    
    return riskFactors;
}

function identifyComplianceRiskFactors(screeningData, screeningResults) {
    const factors = [];
    
    if (screeningResults.pepStatus === "PEP Identified") {
        factors.push("Politically Exposed Person identified");
    }
    
    if (screeningResults.sanctionsStatus === "Match Found") {
        factors.push("Sanctions list match found");
    }
    
    if (screeningResults.adverseMediaStatus === "Adverse Media Found") {
        factors.push("Negative media coverage identified");
    }
    
    const transactionAmount = parseFloat(screeningData.transactionAmount || 0);
    if (transactionAmount > 100000) {
        factors.push("High-value transaction above threshold");
    }
    
    return factors;
}

function calculateNextReviewDate(frequency) {
    const today = new Date();
    const nextReview = new Date(today);
    
    switch (frequency) {
        case "Monthly":
            nextReview.setMonth(today.getMonth() + 1);
            break;
        case "Quarterly":
            nextReview.setMonth(today.getMonth() + 3);
            break;
        case "Annual":
            nextReview.setFullYear(today.getFullYear() + 1);
            break;
        default:
            nextReview.setFullYear(today.getFullYear() + 1);
    }
    
    return nextReview.toISOString().split('T')[0];
}

function defineAlertThresholds(complianceRisk) {
    const thresholds = {};
    
    if (complianceRisk.overallRiskLevel === "High") {
        thresholds.transactionThreshold = 50000;
        thresholds.aggregateThreshold = 100000;
        thresholds.velocityThreshold = 10; // transactions per month
    } else if (complianceRisk.overallRiskLevel === "Medium") {
        thresholds.transactionThreshold = 100000;
        thresholds.aggregateThreshold = 250000;
        thresholds.velocityThreshold = 20;
    } else {
        thresholds.transactionThreshold = 250000;
        thresholds.aggregateThreshold = 500000;
        thresholds.velocityThreshold = 50;
    }
    
    return thresholds;
}

function assessLegalStatus(verificationData) {
    let score = 1;
    
    if (verificationData.businessLicenseStatus === 'Valid') score = 5;
    else if (verificationData.businessLicenseStatus === 'Expired') score = 2;
    
    return { area: "Legal Status", score: score };
}

function assessOperationalStatus(verificationData) {
    let score = 1;
    
    if (verificationData.businessPremises === 'Verified') score += 2;
    if (parseInt(verificationData.yearsInOperation || 0) >= 3) score += 2;
    if (parseInt(verificationData.employeeCount || 0) >= 5) score += 1;
    
    return { area: "Operational Status", score: Math.min(5, score) };
}

function assessFinancialStatus(verificationData) {
    let score = 1;
    
    if (verificationData.auditedStatements === 'Available') score += 2;
    else if (verificationData.financialStatementsAvailable === 'Yes') score += 1;
    
    if (verificationData.bankingRelationships !== 'Not disclosed') score += 1;
    if (parseFloat(verificationData.annualRevenue || 0) > 100000) score += 1;
    
    return { area: "Financial Status", score: Math.min(5, score) };
}

function assessBusinessCompliance(verificationData) {
    let score = 1;
    
    if (verificationData.taxComplianceStatus === 'Compliant') score += 2;
    if (verificationData.industrySpecificPermits === 'Verified') score += 1;
    if (verificationData.professionalLicenses === 'Valid') score += 1;
    
    return { area: "Compliance Status", score: Math.min(5, score) };
}

function identifyVerificationGaps(verificationAreas) {
    const gaps = [];
    
    Object.values(verificationAreas).forEach(area => {
        if (area.score < 3) {
            gaps.push(`${area.area}: Requires additional verification`);
        }
    });
    
    return gaps;
}

function generateOperationalRiskMitigation(riskLevel, riskFactors) {
    const mitigation = [];
    
    if (riskLevel === "Very High" || riskLevel === "High") {
        mitigation.push("Require personal guarantees from business owners");
        mitigation.push("Implement enhanced collateral requirements");
        mitigation.push("Monthly financial reporting and monitoring");
    }
    
    if (riskFactors.some(rf => rf.includes("Limited operating history"))) {
        mitigation.push("Require demonstrated management experience");
        mitigation.push("Consider lower initial loan amounts");
    }
    
    if (riskFactors.some(rf => rf.includes("Financial statements"))) {
        mitigation.push("Require third-party financial verification");
        mitigation.push("Mandate regular accounting oversight");
    }
    
    return mitigation;
}

function identifyRedFlagPatterns(redFlagsByCategory) {
    const patterns = [];
    
    // Identity + Financial pattern
    if (redFlagsByCategory.identity.length > 0 && redFlagsByCategory.financial.length > 0) {
        patterns.push("Identity and financial irregularities suggest potential fraud");
    }
    
    // Business + Compliance pattern
    if (redFlagsByCategory.business.length > 0 && redFlagsByCategory.compliance.length > 0) {
        patterns.push("Business legitimacy and compliance issues indicate high risk");
    }
    
    // Multiple category pattern
    const categoriesWithFlags = Object.values(redFlagsByCategory).filter(flags => flags.length > 0).length;
    if (categoriesWithFlags >= 3) {
        patterns.push("Multiple categories affected suggest systemic issues");
    }
    
    return patterns;
}

function identifyHighestRiskCategory(redFlagsByCategory) {
    let maxFlags = 0;
    let highestRiskCategory = "None";
    
    Object.keys(redFlagsByCategory).forEach(category => {
        if (redFlagsByCategory[category].length > maxFlags) {
            maxFlags = redFlagsByCategory[category].length;
            highestRiskCategory = category;
        }
    });
    
    return highestRiskCategory;
}

function calculateInvestigationTimeline(investigationSteps) {
    if (investigationSteps.length === 0) return "No investigation required";
    
    const criticalSteps = investigationSteps.filter(step => step.priority === "Critical").length;
    const highSteps = investigationSteps.filter(step => step.priority === "High").length;
    
    if (criticalSteps > 0) return "2-5 business days";
    if (highSteps > 0) return "5-10 business days";
    return "3-7 business days";
}

function extractResourceRequirements(investigationSteps) {
    const resources = new Set();
    
    investigationSteps.forEach(step => {
        step.resources.forEach(resource => resources.add(resource));
    });
    
    return Array.from(resources);
}

function generateOngoingMonitoringPlan(severityAssessment) {
    if (severityAssessment.overallSeverity === "Critical" || severityAssessment.overallSeverity === "High") {
        return {
            frequency: "Monthly",
            elements: [
                "Enhanced transaction monitoring",
                "Regular compliance screening updates",
                "Periodic risk reassessment",
                "Management review of red flag status"
            ]
        };
    } else if (severityAssessment.overallSeverity === "Medium") {
        return {
            frequency: "Quarterly",
            elements: [
                "Standard transaction monitoring",
                "Periodic screening updates",
                "Annual risk reassessment"
            ]
        };
    } else {
        return {
            frequency: "Annual",
            elements: [
                "Standard risk review",
                "Compliance screening refresh"
            ]
        };
    }
}

function determineReviewPeriod(severityAssessment) {
    if (severityAssessment.overallSeverity === "Critical") return "Immediate";
    if (severityAssessment.overallSeverity === "High") return "30 days";
    if (severityAssessment.overallSeverity === "Medium") return "90 days";
    return "Annual";
}

// 📊 EXPORT FUNCTIONS
module.exports = {
    // Comprehensive due diligence
    conductComprehensiveDueDiligence,
    analyzeVerificationResults,
    calculateDueDiligenceRiskScore,
    identifyRedFlags,
    assessComplianceStatus,
    generateDueDiligenceRecommendations,
    generateNextSteps,
    
    // AML/KYC screening
    performAMLKYCScreening,
    processScreeningResults,
    assessComplianceRisk,
    identifyRegulatoryRequirements,
    developMonitoringPlan,
    generateDocumentationRequirements,
    
    // Business verification
    verifyBusinessEntity,
    analyzeBusinessVerification,
    assessBusinessLegitimacy,
    evaluateOperationalRisk,
    generateBusinessRecommendations,
    identifyRequiredBusinessDocuments,
    
    // Red flag analysis
    detectAndAnalyzeRedFlags,
    analyzeIdentifiedRedFlags,
    assessRedFlagSeverity,
    developInvestigationPlan,
    createRedFlagMitigationStrategy,
    generateRedFlagNextActions,
    
    // Utility functions
    identifyRiskFactors,
    identifyComplianceRiskFactors,
    calculateNextReviewDate,
    defineAlertThresholds,
    assessLegalStatus,
    assessOperationalStatus,
    assessFinancialStatus,
    assessBusinessCompliance,
    identifyVerificationGaps,
    generateOperationalRiskMitigation,
    identifyRedFlagPatterns,
    identifyHighestRiskCategory,
    calculateInvestigationTimeline,
    extractResourceRequirements,
    generateOngoingMonitoringPlan,
    determineReviewPeriod,
    
    // Framework constants
    DUE_DILIGENCE_FRAMEWORK
};

// 🏁 END OF CAMBODIA BORROWER DUE DILIGENCE SYSTEM
