// cambodia/loanRecovery.js - COMPLETE: Cambodia Loan Recovery & Collections System
// Enterprise-grade recovery operations with GPT-5 intelligence for private lending fund

const { executeEnhancedGPT5Command } = require('../utils/dualCommandSystem');

// 🔧 SPECIALIZED HANDLERS (Integration with existing systems)
const cambodiaHandler = require('../handlers/cambodiaDeals');
const lpManagement = require('./lpManagement');
const portfolioManager = require('./portfolioManager');
const loanServicing = require('./loanServicing');
const riskManagement = require('./riskManagement');
const creditAssessment = require('./creditAssessment');
const legalRegulatory = require('./legalRegulatory');
const realEstateWealth = require('./realEstateWealth');
const businessWealth = require('./businessWealth');

// 💰 CAMBODIA LOAN RECOVERY FRAMEWORK
const LOAN_RECOVERY_FRAMEWORK = {
    // Recovery stages and classifications
    recoveryStages: {
        early_stage_collections: {
            name: "Early Stage Collections",
            description: "Initial collection efforts for loans 1-90 days past due",
            timeframe: "1-90 days past due",
            approach: "internal_collections",
            success_rate: "70-85%",
            cost_ratio: "2-5%"
        },
        formal_collections: {
            name: "Formal Collections", 
            description: "Structured collection process for loans 90+ days past due",
            timeframe: "90-180 days past due",
            approach: "formal_demand_legal_notices",
            success_rate: "40-60%",
            cost_ratio: "8-15%"
        },
        legal_action: {
            name: "Legal Action",
            description: "Court proceedings and legal enforcement",
            timeframe: "180+ days past due",
            approach: "litigation_foreclosure",
            success_rate: "50-70%",
            cost_ratio: "15-25%"
        },
        asset_recovery: {
            name: "Asset Recovery",
            description: "Collateral seizure and liquidation",
            timeframe: "Post-judgment",
            approach: "asset_liquidation",
            success_rate: "60-80%",
            cost_ratio: "10-20%"
        },
        workout_restructure: {
            name: "Workout & Restructure",
            description: "Loan modification and payment arrangements",
            timeframe: "Any stage",
            approach: "negotiated_settlement",
            success_rate: "65-80%",
            cost_ratio: "3-8%"
        },
        charge_off: {
            name: "Charge Off",
            description: "Write-off with continued recovery efforts",
            timeframe: "12+ months past due",
            approach: "third_party_collections",
            success_rate: "10-25%",
            cost_ratio: "25-40%"
        }
    },

    // Recovery strategies by collateral type
    collateralStrategies: {
        real_estate: {
            strategy: "foreclosure_and_sale",
            timeline: "6-18 months",
            recovery_rate: "70-85%",
            key_steps: [
                "Property valuation and inspection",
                "Legal title verification", 
                "Foreclosure proceedings initiation",
                "Property marketing and sale",
                "Surplus distribution"
            ]
        },
        business_assets: {
            strategy: "asset_seizure_and_auction",
            timeline: "3-12 months",
            recovery_rate: "40-70%",
            key_steps: [
                "Asset inventory and valuation",
                "Business operation assessment",
                "Going concern vs liquidation analysis",
                "Asset sale or business transfer",
                "Working capital recovery"
            ]
        },
        equipment_vehicles: {
            strategy: "repossession_and_resale",
            timeline: "1-6 months",
            recovery_rate: "50-75%",
            key_steps: [
                "Asset location and condition assessment",
                "Repossession execution",
                "Refurbishment and preparation",
                "Market sale or auction",
                "Title transfer completion"
            ]
        },
        financial_assets: {
            strategy: "attachment_and_liquidation",
            timeline: "1-3 months", 
            recovery_rate: "80-95%",
            key_steps: [
                "Account identification and freezing",
                "Court order for attachment",
                "Asset liquidation",
                "Fund transfer completion"
            ]
        },
        unsecured: {
            strategy: "income_garnishment",
            timeline: "6-24 months",
            recovery_rate: "15-40%",
            key_steps: [
                "Debtor asset investigation",
                "Income source identification",
                "Court judgment enforcement",
                "Payment plan negotiation",
                "Long-term monitoring"
            ]
        }
    },

    // Legal framework for Cambodia
    cambodiaLegalFramework: {
        foreclosure_process: {
            court_jurisdiction: "Provincial or Municipal Court",
            required_documents: [
                "Original loan agreement",
                "Promissory note",
                "Security agreement", 
                "Default notices",
                "Payment history"
            ],
            typical_timeline: "8-16 months",
            court_fees: "2-4% of claim amount",
            enforcement_mechanisms: [
                "Property seizure",
                "Asset attachment",
                "Income garnishment",
                "Bank account freezing"
            ]
        },
        bankruptcy_proceedings: {
            individual_bankruptcy: "Available but rarely used",
            corporate_insolvency: "Limited framework",
            priority_claims: "Secured creditors have priority",
            typical_recovery: "30-60% for secured creditors"
        }
    },

    // Recovery performance metrics
    performanceMetrics: {
        efficiency_ratios: [
            "Recovery rate by vintage",
            "Time to resolution", 
            "Cost to collect ratio",
            "Legal success rate"
        ],
        quality_metrics: [
            "First call resolution rate",
            "Settlement negotiation success",
            "Asset liquidation efficiency",
            "Customer satisfaction post-recovery"
        ],
        financial_metrics: [
            "Net recovery amount",
            "Recovery ROI",
            "Portfolio NPV impact",
            "Provision reversal amount"
        ]
    },

    // Recovery tactics and techniques
    recoveryTactics: {
        communication_strategies: [
            "Empathetic approach with payment solutions",
            "Firm but professional tone",
            "Multiple contact channels (phone, email, SMS, in-person)",
            "Cultural sensitivity in messaging",
            "Family and community involvement where appropriate"
        ],
        negotiation_techniques: [
            "Payment arrangement proposals",
            "Principal reduction negotiations",
            "Asset surrender options",
            "Third-party guarantor involvement",
            "Instalment plan structuring"
        ],
        pressure_tactics: [
            "Credit bureau reporting",
            "Legal notice delivery",
            "Asset inspection visits", 
            "Business disruption warnings",
            "Professional reputation implications"
        ]
    }
};

// 🎯 LOAN RECOVERY FUNCTIONS

/**
 * 💰 Comprehensive Recovery Strategy Development
 */
async function developRecoveryStrategy(loanId, recoveryData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - COMPREHENSIVE LOAN RECOVERY STRATEGY

LOAN IDENTIFICATION:
• Loan ID: ${loanId}
• Borrower Name: ${recoveryData.borrowerName || 'Not specified'}
• Original Loan Amount: $${recoveryData.originalAmount ? recoveryData.originalAmount.toLocaleString() : 'Not provided'} USD
• Outstanding Balance: $${recoveryData.outstandingBalance ? recoveryData.outstandingBalance.toLocaleString() : 'Not provided'} USD
• Days Past Due: ${recoveryData.daysPastDue || 'Not specified'}
• Total Past Due Amount: $${recoveryData.pastDueAmount ? recoveryData.pastDueAmount.toLocaleString() : 'Not provided'} USD

BORROWER PROFILE:
• Borrower Type: ${recoveryData.borrowerType || 'Not specified'}
• Industry/Business: ${recoveryData.industry || 'Not specified'}
• Financial Condition: ${recoveryData.financialCondition || 'Not assessed'}
• Payment History: ${recoveryData.paymentHistory || 'Not provided'}
• Communication Responsiveness: ${recoveryData.communicationLevel || 'Not assessed'}

COLLATERAL INFORMATION:
• Primary Collateral: ${recoveryData.primaryCollateral || 'Not specified'}
• Collateral Value: $${recoveryData.collateralValue ? recoveryData.collateralValue.toLocaleString() : 'Not provided'} USD
• Loan-to-Value Ratio: ${recoveryData.ltv || 'Not calculated'}%
• Collateral Condition: ${recoveryData.collateralCondition || 'Not assessed'}
• Additional Security: ${recoveryData.additionalSecurity || 'None reported'}

RECOVERY SITUATION ANALYSIS:
• Current Recovery Stage: ${recoveryData.currentStage || 'Not classified'}
• Previous Collection Attempts: ${recoveryData.previousAttempts || 'Not documented'}
• Borrower Cooperation Level: ${recoveryData.cooperationLevel || 'Not assessed'}
• Legal Action Status: ${recoveryData.legalStatus || 'Not initiated'}
• Expected Recovery Timeline: ${recoveryData.expectedTimeline || 'Not estimated'}

COMPREHENSIVE RECOVERY STRATEGY DEVELOPMENT:

1. **RECOVERY APPROACH SELECTION**
   - Optimal recovery strategy based on loan characteristics
   - Collateral-specific recovery methodology
   - Timeline and resource requirement analysis
   - Cost-benefit assessment of different approaches

2. **BORROWER ENGAGEMENT STRATEGY**
   - Communication approach and frequency planning
   - Negotiation tactics and settlement options
   - Payment arrangement structuring possibilities
   - Relationship preservation vs enforcement balance

3. **COLLATERAL RECOVERY PLANNING**
   - Asset valuation and marketability assessment
   - Legal requirements for collateral enforcement
   - Optimal timing for asset seizure and liquidation
   - Market conditions impact on recovery value

4. **LEGAL ACTION ROADMAP**
   - Cambodia legal framework and procedural requirements
   - Court jurisdiction and filing requirements
   - Expected legal timeline and cost projections
   - Enforcement mechanism selection and sequencing

5. **FINANCIAL RECOVERY OPTIMIZATION**
   - Recovery amount projections by strategy
   - Cost-to-collect ratio optimization
   - Net present value analysis of recovery options
   - Portfolio impact and provision reversal potential

6. **RISK MITIGATION AND CONTINGENCIES**
   - Borrower flight risk and asset dissipation prevention
   - Counter-claim and legal challenge preparation
   - Market volatility impact on asset values
   - Alternative recovery pathway development

7. **IMPLEMENTATION AND MONITORING PLAN**
   - Detailed action plan with milestones and deadlines
   - Resource allocation and team assignment
   - Progress tracking and performance measurement
   - Escalation triggers and strategy adjustment criteria

CAMBODIA-SPECIFIC RECOVERY CONSIDERATIONS:
• Local legal system and enforcement capabilities
• Cultural factors in borrower communication and negotiation
• Asset liquidation market conditions and buyer demand
• Regulatory requirements and compliance obligations
• Currency considerations for USD-denominated loans
• Relationship banking and community reputation factors

RECOVERY STRATEGY RECOMMENDATIONS:
• Primary recovery approach with detailed implementation plan
• Alternative strategies and contingency options
• Resource requirements and timeline projections
• Expected recovery amount and probability assessment

Provide comprehensive loan recovery strategy with specific action plan and implementation guidance.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "💰 Recovery Strategy Development",
            forceModel: "gpt-5" // Full model for comprehensive recovery planning
        });

        // Analyze recovery options and develop strategy
        const recoveryAnalysis = analyzeRecoveryOptions(recoveryData);
        const optimalStrategy = selectOptimalStrategy(recoveryData, recoveryAnalysis);
        const actionPlan = developActionPlan(optimalStrategy, recoveryData);
        const recoveryProjections = calculateRecoveryProjections(recoveryData, optimalStrategy);

        return {
            analysis: result.response,
            loanId: loanId,
            borrowerName: recoveryData.borrowerName,
            strategySummary: {
                recommendedApproach: optimalStrategy.approach,
                expectedRecovery: recoveryProjections.expectedAmount,
                recoveryTimeline: optimalStrategy.timeline,
                recoveryProbability: recoveryProjections.probability
            },
            recoveryAnalysis: recoveryAnalysis,
            optimalStrategy: optimalStrategy,
            actionPlan: actionPlan,
            recoveryProjections: recoveryProjections,
            riskFactors: identifyRecoveryRisks(recoveryData),
            strategyDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Recovery strategy development error:', error.message);
        return {
            analysis: `Recovery strategy development unavailable: ${error.message}`,
            loanId: loanId,
            strategySummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Analyze Recovery Options
 */
function analyzeRecoveryOptions(recoveryData) {
    const options = [];
    const outstandingBalance = parseFloat(recoveryData.outstandingBalance || 0);
    const collateralValue = parseFloat(recoveryData.collateralValue || 0);
    const ltv = parseFloat(recoveryData.ltv || 100);
    const daysPastDue = parseInt(recoveryData.daysPastDue || 0);

    // Option 1: Negotiated Settlement
    options.push({
        strategy: "Negotiated Settlement",
        description: "Work with borrower for voluntary payment arrangement",
        timeline: "1-3 months",
        estimatedRecovery: Math.min(outstandingBalance * 0.85, collateralValue * 0.9),
        probability: daysPastDue < 120 ? 70 : daysPastDue < 180 ? 50 : 30,
        cost: outstandingBalance * 0.05,
        advantages: ["Fast resolution", "Maintains relationship", "Lower cost"],
        disadvantages: ["May accept discount", "Requires cooperation"]
    });

    // Option 2: Collateral Foreclosure (if secured)
    if (collateralValue > 0) {
        const collateralType = recoveryData.primaryCollateral || "";
        let recoveryRate = 0.70; // Default 70%
        
        if (collateralType.toLowerCase().includes("real estate")) recoveryRate = 0.75;
        else if (collateralType.toLowerCase().includes("equipment")) recoveryRate = 0.60;
        else if (collateralType.toLowerCase().includes("vehicle")) recoveryRate = 0.65;
        
        options.push({
            strategy: "Collateral Foreclosure",
            description: "Legal foreclosure and asset liquidation",
            timeline: "6-18 months",
            estimatedRecovery: collateralValue * recoveryRate,
            probability: 80,
            cost: outstandingBalance * 0.15,
            advantages: ["Definitive recovery", "Legal enforcement", "Asset control"],
            disadvantages: ["Time consuming", "High cost", "Market dependent"]
        });
    }

    // Option 3: Legal Action for Judgment
    options.push({
        strategy: "Legal Judgment",
        description: "Court judgment and asset attachment",
        timeline: "8-24 months", 
        estimatedRecovery: outstandingBalance * 0.60,
        probability: 65,
        cost: outstandingBalance * 0.20,
        advantages: ["Full legal enforcement", "Asset discovery", "Garnishment rights"],
        disadvantages: ["Very time consuming", "High cost", "Collection challenges"]
    });

    // Option 4: Charge-Off and Third Party Collections
    if (daysPastDue > 360) {
        options.push({
            strategy: "Charge-Off Collection",
            description: "Write-off with third-party collection agency",
            timeline: "12-36 months",
            estimatedRecovery: outstandingBalance * 0.20,
            probability: 25,
            cost: outstandingBalance * 0.30,
            advantages: ["Removes from active portfolio", "Outsourced effort"],
            disadvantages: ["Very low recovery", "High collection cost"]
        });
    }

    // Calculate net recovery for each option
    options.forEach(option => {
        option.netRecovery = option.estimatedRecovery - option.cost;
        option.recoveryROI = option.cost > 0 ? (option.netRecovery / option.cost) * 100 : 0;
        option.scoreWeighted = (option.probability / 100) * option.netRecovery;
    });

    return options.sort((a, b) => b.scoreWeighted - a.scoreWeighted);
}

/**
 * 🎯 Select Optimal Recovery Strategy
 */
function selectOptimalStrategy(recoveryData, recoveryAnalysis) {
    const topOption = recoveryAnalysis[0];
    const daysPastDue = parseInt(recoveryData.daysPastDue || 0);
    const cooperationLevel = recoveryData.cooperationLevel || "Unknown";
    const collateralValue = parseFloat(recoveryData.collateralValue || 0);
    
    // Adjust strategy based on specific circumstances
    let selectedStrategy = { ...topOption };
    
    // If borrower is cooperative and less than 120 days past due, favor negotiation
    if (cooperationLevel === "Cooperative" && daysPastDue < 120) {
        const negotiationOption = recoveryAnalysis.find(opt => opt.strategy === "Negotiated Settlement");
        if (negotiationOption) selectedStrategy = negotiationOption;
    }
    
    // If strong collateral and non-cooperative borrower, favor foreclosure
    if (cooperationLevel === "Non-cooperative" && collateralValue > 0) {
        const foreclosureOption = recoveryAnalysis.find(opt => opt.strategy === "Collateral Foreclosure");
        if (foreclosureOption && foreclosureOption.estimatedRecovery > selectedStrategy.estimatedRecovery * 0.8) {
            selectedStrategy = foreclosureOption;
        }
    }
    
    // Add implementation details
    selectedStrategy.approach = selectedStrategy.strategy;
    selectedStrategy.rationale = generateStrategyRationale(selectedStrategy, recoveryData);
    selectedStrategy.keyMilestones = generateKeyMilestones(selectedStrategy);
    selectedStrategy.resourceRequirements = assessResourceRequirements(selectedStrategy);
    
    return selectedStrategy;
}

/**
 * 📋 Develop Detailed Action Plan
 */
function developActionPlan(optimalStrategy, recoveryData) {
    const actionPlan = {
        strategy: optimalStrategy.strategy,
        phases: [],
        totalTimeline: optimalStrategy.timeline,
        criticalPath: [],
        resourceAssignment: {}
    };
    
    switch (optimalStrategy.strategy) {
        case "Negotiated Settlement":
            actionPlan.phases = [
                {
                    phase: "Initial Contact & Assessment",
                    duration: "1-2 weeks",
                    actions: [
                        "Contact borrower to discuss situation",
                        "Assess financial capacity and willingness to pay",
                        "Gather updated financial information",
                        "Identify potential payment solutions"
                    ],
                    deliverables: ["Borrower financial assessment", "Payment capacity analysis"],
                    responsibility: "Loan Officer"
                },
                {
                    phase: "Negotiation & Agreement",
                    duration: "2-4 weeks", 
                    actions: [
                        "Present payment arrangement options",
                        "Negotiate settlement terms",
                        "Document agreed payment plan",
                        "Obtain borrower commitment and signatures"
                    ],
                    deliverables: ["Settlement agreement", "Payment schedule"],
                    responsibility: "Collections Manager"
                },
                {
                    phase: "Implementation & Monitoring",
                    duration: "Ongoing",
                    actions: [
                        "Monitor payment compliance",
                        "Provide payment reminders",
                        "Address payment issues promptly", 
                        "Document performance for compliance"
                    ],
                    deliverables: ["Payment tracking reports", "Compliance documentation"],
                    responsibility: "Loan Servicer"
                }
            ];
            break;
            
        case "Collateral Foreclosure":
            actionPlan.phases = [
                {
                    phase: "Pre-Foreclosure Preparation",
                    duration: "2-4 weeks",
                    actions: [
                        "Engage legal counsel for foreclosure",
                        "Order current collateral appraisal",
                        "Review and verify loan documentation",
                        "Conduct collateral inspection"
                    ],
                    deliverables: ["Legal counsel engagement", "Current appraisal", "Documentation package"],
                    responsibility: "Legal Team + Credit Manager"
                },
                {
                    phase: "Foreclosure Initiation",
                    duration: "4-8 weeks",
                    actions: [
                        "File foreclosure petition with court",
                        "Serve legal notices to borrower",
                        "Publish required public notices",
                        "Respond to any borrower objections"
                    ],
                    deliverables: ["Court filings", "Service documentation", "Public notices"],
                    responsibility: "Legal Counsel"
                },
                {
                    phase: "Asset Recovery & Sale",
                    duration: "8-16 weeks",
                    actions: [
                        "Take possession of collateral",
                        "Prepare asset for market sale",
                        "Market asset through appropriate channels",
                        "Complete sale and transfer title"
                    ],
                    deliverables: ["Asset possession", "Sale documentation", "Recovery proceeds"],
                    responsibility: "Asset Manager"
                }
            ];
            break;
            
        case "Legal Judgment":
            actionPlan.phases = [
                {
                    phase: "Legal Case Preparation",
                    duration: "4-6 weeks",
                    actions: [
                        "Engage litigation counsel",
                        "Compile case documentation",
                        "Conduct debtor asset investigation",
                        "File lawsuit and serve defendant"
                    ],
                    deliverables: ["Legal representation", "Case file", "Asset discovery", "Service confirmation"],
                    responsibility: "Legal Counsel + Paralegal"
                },
                {
                    phase: "Litigation & Judgment",
                    duration: "12-18 months",
                    actions: [
                        "Participate in discovery process",
                        "Attend court hearings and trial",
                        "Obtain judgment against debtor",
                        "Begin post-judgment collection"
                    ],
                    deliverables: ["Court judgment", "Collection orders"],
                    responsibility: "Legal Counsel"
                },
                {
                    phase: "Judgment Enforcement",
                    duration: "Ongoing",
                    actions: [
                        "Execute asset attachment orders",
                        "Implement wage/income garnishment",
                        "Liquidate attached assets",
                        "Monitor ongoing collection"
                    ],
                    deliverables: ["Asset liquidation proceeds", "Collection reports"],
                    responsibility: "Collections Specialist"
                }
            ];
            break;
    }
    
    // Generate critical path
    actionPlan.criticalPath = actionPlan.phases.map(phase => ({
        milestone: phase.phase,
        duration: phase.duration,
        criticality: "High"
    }));
    
    // Resource assignment
    actionPlan.resourceAssignment = {
        "Collections Manager": "Lead strategy execution",
        "Legal Counsel": "Handle all legal proceedings", 
        "Loan Officer": "Borrower communication",
        "Asset Manager": "Collateral management",
        "Paralegal": "Documentation support"
    };
    
    return actionPlan;
}

/**
 * 💵 Calculate Recovery Projections
 */
function calculateRecoveryProjections(recoveryData, optimalStrategy) {
    const outstandingBalance = parseFloat(recoveryData.outstandingBalance || 0);
    const grossRecovery = optimalStrategy.estimatedRecovery;
    const recoveryCosts = optimalStrategy.cost;
    const netRecovery = grossRecovery - recoveryCosts;
    
    // Calculate multiple scenarios
    const scenarios = {
        optimistic: {
            probability: 25,
            recoveryMultiplier: 1.2,
            timeline: optimalStrategy.timeline,
            description: "Best case scenario"
        },
        expected: {
            probability: 50,
            recoveryMultiplier: 1.0,
            timeline: optimalStrategy.timeline,
            description: "Most likely outcome"
        },
        conservative: {
            probability: 25,
            recoveryMultiplier: 0.7,
            timeline: extendTimeline(optimalStrategy.timeline, 1.3),
            description: "Conservative estimate"
        }
    };
    
    const projections = {};
    Object.keys(scenarios).forEach(scenario => {
        const multiplier = scenarios[scenario].recoveryMultiplier;
        projections[scenario] = {
            grossRecovery: Math.round(grossRecovery * multiplier),
            recoveryCosts: Math.round(recoveryCosts * (multiplier > 1 ? 1.1 : multiplier)),
            netRecovery: Math.round(netRecovery * multiplier),
            recoveryRate: ((grossRecovery * multiplier / outstandingBalance) * 100).toFixed(1) + "%",
            timeline: scenarios[scenario].timeline,
            probability: scenarios[scenario].probability + "%"
        };
    });
    
    // Expected value calculation
    const expectedValue = (
        projections.optimistic.netRecovery * 0.25 +
        projections.expected.netRecovery * 0.50 +
        projections.conservative.netRecovery * 0.25
    );
    
    return {
        scenarios: projections,
        expectedAmount: Math.round(expectedValue),
        probability: optimalStrategy.probability + "%",
        recoveryRate: ((expectedValue / outstandingBalance) * 100).toFixed(1) + "%",
        breakEvenCost: grossRecovery,
        roi: ((expectedValue / recoveryCosts) * 100).toFixed(1) + "%"
    };
}

/**
 * ⚠️ Identify Recovery Risks
 */
function identifyRecoveryRisks(recoveryData) {
    const risks = [];
    const mitigations = [];
    
    const daysPastDue = parseInt(recoveryData.daysPastDue || 0);
    const collateralValue = parseFloat(recoveryData.collateralValue || 0);
    const outstandingBalance = parseFloat(recoveryData.outstandingBalance || 0);
    const cooperationLevel = recoveryData.cooperationLevel || "Unknown";
    
    // Time-based risks
    if (daysPastDue > 360) {
        risks.push({
            category: "Collection Risk",
            risk: "Extended delinquency reduces recovery probability",
            impact: "High",
            mitigation: "Immediate aggressive collection action required"
        });
    }
    
    // Borrower cooperation risks
    if (cooperationLevel === "Non-cooperative" || cooperationLevel === "Hostile") {
        risks.push({
            category: "Borrower Risk",
            risk: "Borrower non-cooperation may require legal action",
            impact: "Medium",
            mitigation: "Prepare for formal legal proceedings"
        });
    }
    
    // Collateral risks
    if (collateralValue > 0) {
        const ltv = parseFloat(recoveryData.ltv || 0);
        if (ltv > 90) {
            risks.push({
                category: "Collateral Risk",
                risk: "High LTV may result in recovery shortfall",
                impact: "High", 
                mitigation: "Obtain updated appraisal and consider additional security"
            });
        }
        
        const collateralCondition = recoveryData.collateralCondition || "";
        if (collateralCondition.toLowerCase().includes("poor") || 
            collateralCondition.toLowerCase().includes("deteriorating")) {
            risks.push({
                category: "Collateral Risk",
                risk: "Deteriorating collateral condition reduces value",
                impact: "Medium",
                mitigation: "Expedite foreclosure process to preserve value"
            });
        }
    } else {
        risks.push({
            category: "Security Risk",
            risk: "Unsecured loan limits recovery options",
            impact: "Very High",
            mitigation: "Focus on income garnishment and asset discovery"
        });
    }
    
    // Market risks
    risks.push({
        category: "Market Risk",
        risk: "Asset liquidation dependent on market conditions",
        impact: "Medium",
        mitigation: "Monitor market conditions and time asset sales appropriately"
    });
    
    // Legal risks
    risks.push({
        category: "Legal Risk", 
        risk: "Cambodia legal system enforcement challenges",
        impact: "Medium",
        mitigation: "Engage experienced local legal counsel"
    });
    
    // Currency risks (for USD loans)
    if (recoveryData.currency === "USD" || !recoveryData.currency) {
        risks.push({
            category: "Currency Risk",
            risk: "USD loan recovery may face FX conversion issues",
            impact: "Low",
            mitigation: "Structure recovery in USD where possible"
        });
    }
    
    return {
        identifiedRisks: risks,
        riskCount: risks.length,
        highImpactRisks: risks.filter(r => r.impact === "Very High" || r.impact === "High").length,
        overallRiskLevel: risks.length > 4 ? "High" : risks.length > 2 ? "Medium" : "Low"
    };
}

/**
 * 📞 Execute Collection Activities
 */
async function executeCollectionActivity(loanId, activityData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING - COLLECTION ACTIVITY EXECUTION

LOAN DETAILS:
• Loan ID: ${loanId}
• Borrower: ${activityData.borrowerName || 'Not specified'}
• Outstanding Balance: $${activityData.outstandingBalance ? activityData.outstandingBalance.toLocaleString() : 'Not provided'} USD
• Days Past Due: ${activityData.daysPastDue || 'Not specified'}
• Collection Stage: ${activityData.collectionStage || 'Not specified'}

ACTIVITY DETAILS:
• Activity Type: ${activityData.activityType || 'Not specified'}
• Contact Method: ${activityData.contactMethod || 'Not specified'}
• Scheduled Date: ${activityData.scheduledDate || 'Not specified'}
• Assigned Collector: ${activityData.assignedCollector || 'Not specified'}
• Previous Contact History: ${activityData.contactHistory || 'Not available'}

BORROWER CONTACT INFORMATION:
• Primary Phone: ${activityData.primaryPhone || 'Not provided'}
• Email Address: ${activityData.email || 'Not provided'}
• Business Address: ${activityData.businessAddress || 'Not provided'}
• Alternative Contacts: ${activityData.alternativeContacts || 'None listed'}

COLLECTION ACTIVITY EXECUTION PLANNING:

1. **COMMUNICATION STRATEGY DEVELOPMENT**
   - Appropriate communication approach for collection stage
   - Cultural sensitivity and local business practices
   - Tone and messaging optimization for borrower profile
   - Multiple contact channel utilization strategy

2. **COLLECTION CONVERSATION PLANNING**
   - Key talking points and negotiation positions
   - Payment arrangement options and flexibility
   - Documentation requirements and commitments
   - Objection handling and response strategies

3. **LEGAL AND REGULATORY COMPLIANCE**
   - Cambodia debt collection law compliance
   - Required disclosures and borrower rights
   - Documentation and recording requirements
   - Escalation procedures and limitations

4. **OUTCOME OPTIMIZATION TACTICS**
   - Payment commitment securing techniques
   - Settlement negotiation strategies
   - Information gathering and verification
   - Relationship preservation considerations

5. **FOLLOW-UP AND DOCUMENTATION**
   - Activity outcome recording and classification
   - Next action determination and scheduling
   - Compliance documentation and evidence
   - Performance metrics tracking and reporting

CAMBODIA COLLECTION CONSIDERATIONS:
• Respectful approach honoring local business culture
• Family and community relationship dynamics
• Business operating hours and cultural holidays
• Language preferences and communication styles
• Economic conditions affecting payment capacity

ACTIVITY EXECUTION GUIDELINES:
• Professional and courteous communication approach
• Clear payment expectations and consequences
• Documentation of all borrower communications
• Compliance with local debt collection regulations

Provide detailed collection activity execution plan with specific scripts and approaches.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📞 Collection Activity Execution",
            forceModel: "gpt-5-mini" // Balanced model for collection planning
        });

        // Generate activity execution details
        const collectionScript = generateCollectionScript(activityData);
        const complianceChecklist = generateComplianceChecklist(activityData);
        const outcomeTracking = setupOutcomeTracking(loanId, activityData);

        return {
            analysis: result.response,
            loanId: loanId,
            activitySummary: {
                activityType: activityData.activityType,
                contactMethod: activityData.contactMethod,
                assignedCollector: activityData.assignedCollector,
                scheduledDate: activityData.scheduledDate
            },
            collectionScript: collectionScript,
            complianceChecklist: complianceChecklist,
            outcomeTracking: outcomeTracking,
            followUpActions: generateFollowUpActions(activityData),
            executionDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Collection activity execution error:', error.message);
        return {
            analysis: `Collection activity execution unavailable: ${error.message}`,
            loanId: loanId,
            activitySummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📋 Asset Recovery Management
 */
async function manageAssetRecovery(loanId, assetData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING - ASSET RECOVERY MANAGEMENT

LOAN IDENTIFICATION:
• Loan ID: ${loanId}
• Borrower: ${assetData.borrowerName || 'Not specified'}
• Outstanding Debt: ${assetData.outstandingDebt ? assetData.outstandingDebt.toLocaleString() : 'Not provided'} USD
• Recovery Stage: ${assetData.recoveryStage || 'Not specified'}

ASSET INFORMATION:
• Asset Type: ${assetData.assetType || 'Not specified'}
• Asset Description: ${assetData.assetDescription || 'Not provided'}
• Current Location: ${assetData.currentLocation || 'Not specified'}
• Estimated Value: ${assetData.estimatedValue ? assetData.estimatedValue.toLocaleString() : 'Not provided'} USD
• Last Appraisal Date: ${assetData.lastAppraisalDate || 'Not specified'}
• Asset Condition: ${assetData.assetCondition || 'Not assessed'}

LEGAL STATUS:
• Title/Ownership Status: ${assetData.titleStatus || 'Not verified'}
• Liens and Encumbrances: ${assetData.liensEncumbrances || 'Not researched'}
• Legal Actions Required: ${assetData.legalActions || 'Not determined'}
• Court Orders: ${assetData.courtOrders || 'None obtained'}

MARKET CONDITIONS:
• Local Market Demand: ${assetData.marketDemand || 'Not assessed'}
• Comparable Sales: ${assetData.comparableSales || 'Not researched'}
• Liquidation Timeline: ${assetData.liquidationTimeline || 'Not estimated'}
• Expected Recovery Rate: ${assetData.expectedRecoveryRate || 'Not calculated'}%

ASSET RECOVERY MANAGEMENT ANALYSIS:

1. **ASSET VALUATION AND CONDITION ASSESSMENT**
   - Current market value determination and verification
   - Physical condition evaluation and impact on value
   - Marketability assessment and demand analysis
   - Optimal timing for asset liquidation

2. **LEGAL TITLE AND OWNERSHIP VERIFICATION**
   - Title search and ownership confirmation
   - Lien priority and encumbrance analysis
   - Legal requirements for asset transfer
   - Documentation completeness and corrections needed

3. **ASSET PRESERVATION AND MAINTENANCE**
   - Physical security and preservation measures
   - Maintenance requirements and cost analysis
   - Insurance coverage and risk protection
   - Value deterioration prevention strategies

4. **LIQUIDATION STRATEGY DEVELOPMENT**
   - Optimal sale method selection (auction, private sale, broker)
   - Marketing approach and target buyer identification
   - Pricing strategy and negotiation parameters
   - Sale timeline optimization for maximum recovery

5. **RECOVERY PROCESS MANAGEMENT**
   - Step-by-step liquidation process execution
   - Buyer qualification and financing verification
   - Transaction completion and fund collection
   - Surplus distribution and final accounting

6. **REGULATORY AND COMPLIANCE REQUIREMENTS**
   - Cambodia asset sale and transfer regulations
   - Tax implications and withholding requirements
   - Borrower notification and redemption rights
   - Court approval and reporting requirements

CAMBODIA ASSET RECOVERY CONSIDERATIONS:
• Local asset markets and liquidity conditions
• Legal system requirements for asset transfers
• Cultural factors in asset negotiations and sales
• Currency considerations for USD debt recovery
• Foreign ownership restrictions and requirements

RECOVERY OPTIMIZATION RECOMMENDATIONS:
• Asset preparation and enhancement strategies
• Market timing and seasonal considerations
• Professional service provider selection
• Risk mitigation and contingency planning

Provide comprehensive asset recovery management plan with specific implementation steps.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📋 Asset Recovery Management",
            forceModel: "gpt-5" // Full model for comprehensive asset analysis
        });

        // Analyze asset recovery approach
        const recoveryApproach = determineRecoveryApproach(assetData);
        const liquidationPlan = developLiquidationPlan(assetData, recoveryApproach);
        const recoveryTimeline = createRecoveryTimeline(liquidationPlan);
        const costBenefit = analyzeRecoveryCostBenefit(assetData, liquidationPlan);

        return {
            analysis: result.response,
            loanId: loanId,
            assetSummary: {
                assetType: assetData.assetType,
                estimatedValue: assetData.estimatedValue,
                recoveryApproach: recoveryApproach.method,
                expectedRecovery: costBenefit.expectedNetRecovery
            },
            recoveryApproach: recoveryApproach,
            liquidationPlan: liquidationPlan,
            recoveryTimeline: recoveryTimeline,
            costBenefit: costBenefit,
            riskAssessment: assessAssetRecoveryRisks(assetData),
            managementDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Asset recovery management error:', error.message);
        return {
            analysis: `Asset recovery management unavailable: ${error.message}`,
            loanId: loanId,
            assetSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Recovery Performance Analytics
 */
async function analyzeRecoveryPerformance(portfolioData, performanceData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - RECOVERY PERFORMANCE ANALYTICS

PORTFOLIO RECOVERY OVERVIEW:
• Total Loans in Recovery: ${portfolioData.loansInRecovery || 'Not specified'}
• Total Recovery Portfolio Value: ${portfolioData.recoveryPortfolioValue ? portfolioData.recoveryPortfolioValue.toLocaleString() : 'Not provided'} USD
• Active Recovery Cases: ${portfolioData.activeRecoveryCases || 'Not specified'}
• Completed Recovery Cases: ${portfolioData.completedRecoveryCases || 'Not specified'}

RECOVERY PERFORMANCE METRICS:
• Overall Recovery Rate: ${performanceData.overallRecoveryRate || 'Not calculated'}%
• Average Recovery Time: ${performanceData.averageRecoveryTime || 'Not calculated'} months
• Cost to Collect Ratio: ${performanceData.costToCollectRatio || 'Not calculated'}%
• Legal Action Success Rate: ${performanceData.legalSuccessRate || 'Not calculated'}%

RECOVERY BY STRATEGY:
• Negotiated Settlements: ${performanceData.negotiatedSettlements || 'Not reported'}% success rate
• Collateral Foreclosures: ${performanceData.collateralForeclosures || 'Not reported'}% recovery rate
• Legal Judgments: ${performanceData.legalJudgments || 'Not reported'}% collection rate
• Asset Liquidations: ${performanceData.assetLiquidations || 'Not reported'}% of estimated value

FINANCIAL IMPACT:
• Total Recovered Amount: ${performanceData.totalRecoveredAmount ? performanceData.totalRecoveredAmount.toLocaleString() : 'Not provided'} USD
• Total Recovery Costs: ${performanceData.totalRecoveryCosts ? performanceData.totalRecoveryCosts.toLocaleString() : 'Not provided'} USD
• Net Recovery Contribution: ${performanceData.netRecoveryContribution ? performanceData.netRecoveryContribution.toLocaleString() : 'Not calculated'} USD
• Provision Reversals: ${performanceData.provisionReversals ? performanceData.provisionReversals.toLocaleString() : 'Not reported'} USD

RECOVERY PERFORMANCE ANALYTICS:

1. **RECOVERY EFFECTIVENESS ANALYSIS**
   - Strategy-specific performance evaluation and benchmarking
   - Recovery rate trends and improvement opportunities
   - Time-to-recovery optimization and bottleneck identification
   - Cost efficiency analysis and process improvements

2. **COLLECTION STRATEGY OPTIMIZATION**
   - Best performing collection approaches and techniques
   - Resource allocation effectiveness and optimization
   - Staff performance and productivity analysis
   - Technology and process automation opportunities

3. **ASSET RECOVERY PERFORMANCE**
   - Collateral liquidation effectiveness and market timing
   - Asset type performance and valuation accuracy
   - Legal enforcement success rates and improvements
   - Third-party service provider performance evaluation

4. **FINANCIAL IMPACT ASSESSMENT**
   - Recovery contribution to fund performance and returns
   - Cost-benefit analysis of different recovery strategies
   - Provision accuracy and reserve requirement optimization
   - Return on investment for recovery operations

5. **RISK AND QUALITY METRICS**
   - Recovery quality and sustainability assessment
   - Re-default rates and long-term collection success
   - Compliance and regulatory performance metrics
   - Borrower relationship and reputation impact analysis

6. **BENCHMARKING AND PEER COMPARISON**
   - Industry standard comparisons and best practices
   - Regional market performance benchmarks
   - Competitive recovery performance analysis
   - International best practice adoption opportunities

CAMBODIA MARKET PERFORMANCE FACTORS:
• Local legal system effectiveness in debt collection
• Cultural factors affecting collection success rates
• Economic conditions impact on recovery performance
• Asset market liquidity and valuation accuracy
• Regulatory environment and compliance costs

PERFORMANCE IMPROVEMENT RECOMMENDATIONS:
• Strategy optimization and resource reallocation
• Process improvements and automation opportunities
• Staff training and capability development needs
• Technology investments and system enhancements

Provide comprehensive recovery performance analysis with specific improvement recommendations.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📊 Recovery Performance Analytics",
            forceModel: "gpt-5" // Full model for comprehensive analytics
        });

        // Calculate detailed performance metrics
        const performanceMetrics = calculateRecoveryMetrics(portfolioData, performanceData);
        const benchmarkComparison = generateRecoveryBenchmarks(performanceMetrics);
        const improvementOpportunities = identifyImprovementOpportunities(performanceMetrics);
        const actionRecommendations = generatePerformanceActionPlan(improvementOpportunities);

        return {
            analysis: result.response,
            performanceSummary: {
                overallRecoveryRate: performanceMetrics.overallRecoveryRate,
                averageRecoveryTime: performanceMetrics.averageRecoveryTime,
                costToCollectRatio: performanceMetrics.costToCollectRatio,
                netRecoveryROI: performanceMetrics.netRecoveryROI
            },
            performanceMetrics: performanceMetrics,
            benchmarkComparison: benchmarkComparison,
            improvementOpportunities: improvementOpportunities,
            actionRecommendations: actionRecommendations,
            trendsAnalysis: analyzeRecoveryTrends(performanceData),
            analyticsDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Recovery performance analytics error:', error.message);
        return {
            analysis: `Recovery performance analytics unavailable: ${error.message}`,
            performanceSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

// 🧮 RECOVERY HELPER FUNCTIONS

/**
 * 💡 Generate Strategy Rationale
 */
function generateStrategyRationale(strategy, recoveryData) {
    const rationales = [];
    
    if (strategy.strategy === "Negotiated Settlement") {
        rationales.push("Fastest path to recovery with lowest cost");
        if (recoveryData.cooperationLevel === "Cooperative") {
            rationales.push("Borrower cooperation indicates high success probability");
        }
        rationales.push("Preserves business relationship for future opportunities");
    }
    
    if (strategy.strategy === "Collateral Foreclosure") {
        rationales.push("Strong collateral provides secure recovery path");
        const ltv = parseFloat(recoveryData.ltv || 0);
        if (ltv < 80) {
            rationales.push("Conservative LTV provides recovery cushion");
        }
        rationales.push("Legal enforcement ensures definitive outcome");
    }
    
    if (strategy.strategy === "Legal Judgment") {
        rationales.push("Comprehensive legal remedy for asset discovery");
        rationales.push("Enables full enforcement of collection rights");
        if (recoveryData.cooperationLevel === "Non-cooperative") {
            rationales.push("Non-cooperative borrower requires legal pressure");
        }
    }
    
    return rationales;
}

/**
 * 🎯 Generate Key Milestones
 */
function generateKeyMilestones(strategy) {
    const milestones = [];
    
    switch (strategy.strategy) {
        case "Negotiated Settlement":
            milestones.push({ milestone: "Initial borrower contact", target: "Week 1" });
            milestones.push({ milestone: "Financial assessment complete", target: "Week 2" });
            milestones.push({ milestone: "Settlement agreement signed", target: "Week 4" });
            milestones.push({ milestone: "First payment received", target: "Week 6" });
            break;
            
        case "Collateral Foreclosure":
            milestones.push({ milestone: "Legal counsel engaged", target: "Week 2" });
            milestones.push({ milestone: "Foreclosure filed", target: "Week 6" });
            milestones.push({ milestone: "Court judgment obtained", target: "Month 4" });
            milestones.push({ milestone: "Asset liquidated", target: "Month 8" });
            break;
            
        case "Legal Judgment":
            milestones.push({ milestone: "Lawsuit filed", target: "Month 1" });
            milestones.push({ milestone: "Discovery completed", target: "Month 6" });
            milestones.push({ milestone: "Court judgment", target: "Month 12" });
            milestones.push({ milestone: "Collection initiated", target: "Month 14" });
            break;
    }
    
    return milestones;
}

/**
 * 🛠️ Assess Resource Requirements
 */
function assessResourceRequirements(strategy) {
    const resources = {
        personnel: [],
        external: [],
        technology: [],
        budget: {}
    };
    
    switch (strategy.strategy) {
        case "Negotiated Settlement":
            resources.personnel = ["Collections Manager", "Loan Officer"];
            resources.external = ["Credit counseling service (if needed)"];
            resources.technology = ["Payment tracking system", "Communication platform"];
            resources.budget = {
                personnel: "Low",
                external: "Minimal",
                technology: "Existing systems",
                estimated_cost: strategy.cost
            };
            break;
            
        case "Collateral Foreclosure":
            resources.personnel = ["Legal Team", "Asset Manager", "Appraiser"];
            resources.external = ["Legal Counsel", "Court System", "Asset Liquidator"];
            resources.technology = ["Legal case management", "Asset tracking system"];
            resources.budget = {
                personnel: "Medium",
                external: "High",
                technology: "Moderate",
                estimated_cost: strategy.cost
            };
            break;
            
        case "Legal Judgment":
            resources.personnel = ["Legal Team", "Paralegal", "Collections Specialist"];
            resources.external = ["Litigation Counsel", "Court System", "Process Server"];
            resources.technology = ["Legal case management", "Asset discovery tools"];
            resources.budget = {
                personnel: "High",
                external: "Very High",
                technology: "High",
                estimated_cost: strategy.cost
            };
            break;
    }
    
    return resources;
}

/**
 * ⏰ Extend Timeline
 */
function extendTimeline(originalTimeline, multiplier) {
    // Simple timeline extension logic
    const timeMatch = originalTimeline.match(/(\d+)-?(\d+)?\s*(weeks?|months?)/i);
    if (timeMatch) {
        const min = parseInt(timeMatch[1]);
        const max = parseInt(timeMatch[2]) || min;
        const unit = timeMatch[3].toLowerCase();
        
        const newMin = Math.round(min * multiplier);
        const newMax = Math.round(max * multiplier);
        
        return newMax > newMin ? `${newMin}-${newMax} ${unit}` : `${newMin} ${unit}`;
    }
    
    return originalTimeline; // Return original if parsing fails
}

/**
 * 📞 Generate Collection Script
 */
function generateCollectionScript(activityData) {
    const script = {
        opening: "",
        keyPoints: [],
        objectionHandling: {},
        closingStatements: []
    };
    
    const stage = activityData.collectionStage || "Early Stage";
    const borrowerName = activityData.borrowerName || "Borrower";
    
    if (stage === "Early Stage Collections") {
        script.opening = `Good morning ${borrowerName}, this is [Collector Name] from [Fund Name]. I'm calling regarding your loan payment that was due on [Date]. Do you have a few minutes to discuss this?`;
        
        script.keyPoints = [
            "Acknowledge that we understand business can have challenges",
            "Express desire to work together to find a solution",
            "Ask about current financial situation and payment ability",
            "Offer payment arrangement options if appropriate"
        ];
        
        script.objectionHandling = {
            "No money": "I understand cash flow can be tight. Can we discuss a partial payment or extended timeline?",
            "Dispute amount": "Let's review the account details together. I'll send you a statement for verification.",
            "Need time": "I appreciate your honesty. When would you be able to make a payment? Let's set a specific date."
        };
        
        script.closingStatements = [
            "Thank you for taking the time to discuss this with me",
            "I'll send you a confirmation of our agreement by email",
            "Please don't hesitate to call if your situation changes"
        ];
    } else if (stage === "Formal Collections") {
        script.opening = `Hello ${borrowerName}, this is [Collector Name] from [Fund Name]. Your loan is now significantly past due and requires immediate attention. We need to discuss resolution options today.`;
        
        script.keyPoints = [
            "Emphasize the serious nature of the delinquency",
            "Explain potential consequences of continued non-payment",
            "Present specific payment or settlement options",
            "Set firm deadlines for response and payment"
        ];
        
        script.objectionHandling = {
            "Can't pay": "If you cannot pay the full amount, we may consider a settlement. What can you pay today?",
            "Need lawyer": "You have the right to consult an attorney, but time is critical. Can we reach a resolution today?",
            "Threaten bankruptcy": "Bankruptcy may not discharge this debt. Let's explore alternatives that work for both of us."
        };
        
        script.closingStatements = [
            "I need a commitment from you today on how we will resolve this",
            "Without a payment or agreement, this will proceed to legal action",
            "I'll need to hear from you within [X] days with your decision"
        ];
    }
    
    return script;
}

/**
 * ✅ Generate Compliance Checklist
 */
function generateComplianceChecklist(activityData) {
    return {
        preCall: [
            "Verify correct borrower contact information",
            "Review account history and previous contact notes",
            "Confirm appropriate time of day for contact",
            "Prepare required disclosures and account details"
        ],
        duringCall: [
            "Identify yourself and your company",
            "State the purpose of the call",
            "Verify you are speaking with the correct person",
            "Provide required debt collection disclosures"
        ],
        postCall: [
            "Document all contact details and outcomes",
            "Update account status and next action dates",
            "Send written confirmation of any agreements",
            "Schedule appropriate follow-up activities"
        ],
        documentation: [
            "Record call date, time, and duration",
            "Document borrower responses and commitments",
            "Note any disputes or objections raised",
            "Track all promises to pay or agreements made"
        ]
    };
}

/**
 * 📊 Setup Outcome Tracking
 */
function setupOutcomeTracking(loanId, activityData) {
    return {
        loanId: loanId,
        activityId: `COL-${loanId}-${Date.now()}`,
        trackingMetrics: {
            contactAttempts: 0,
            successfulContacts: 0,
            promisesToPay: 0,
            paymentsReceived: 0,
            settlementOffers: 0,
            disputesRaised: 0
        },
        outcomeCategories: [
            "Payment received",
            "Payment promised",
            "Settlement agreed",
            "Dispute raised",
            "No contact made",
            "Borrower unavailable",
            "Legal action required"
        ],
        performanceMetrics: {
            callToPaymentRatio: 0,
            averageCallDuration: 0,
            firstCallResolutionRate: 0,
            costPerDollarCollected: 0
        }
    };
}

/**
 * 🔄 Generate Follow Up Actions
 */
function generateFollowUpActions(activityData) {
    const followUpActions = [];
    const activityType = activityData.activityType || "";
    
    if (activityType === "Payment Collection Call") {
        followUpActions.push({
            action: "Send payment confirmation email",
            timeline: "Within 2 hours if payment promised",
            responsibility: "Collections Team"
        });
        
        followUpActions.push({
            action: "Monitor payment receipt",
            timeline: "On promised payment date",
            responsibility: "Loan Servicer"
        });
        
        followUpActions.push({
            action: "Follow up if payment not received",
            timeline: "1 day after promised date",
            responsibility: "Collections Manager"
        });
    }
    
    if (activityType === "Settlement Negotiation") {
        followUpActions.push({
            action: "Prepare settlement agreement",
            timeline: "Within 24 hours",
            responsibility: "Legal Team"
        });
        
        followUpActions.push({
            action: "Obtain management approval",
            timeline: "Within 48 hours",
            responsibility: "Credit Manager"
        });
        
        followUpActions.push({
            action: "Present final settlement offer",
            timeline: "Within 72 hours",
            responsibility: "Collections Manager"
        });
    }
    
    return followUpActions;
}

/**
 * 🎯 Determine Recovery Approach
 */
function determineRecoveryApproach(assetData) {
    const assetType = assetData.assetType || "";
    const estimatedValue = parseFloat(assetData.estimatedValue || 0);
    const assetCondition = assetData.assetCondition || "";
    
    let approach = {
        method: "Unknown",
        rationale: "",
        timeline: "Unknown",
        expectedRecoveryRate: 0
    };
    
    if (assetType.toLowerCase().includes("real estate") || assetType.toLowerCase().includes("property")) {
        approach = {
            method: "Real Estate Foreclosure and Sale",
            rationale: "Real estate typically provides highest recovery rates with established liquidation markets",
            timeline: "8-18 months",
            expectedRecoveryRate: assetCondition.toLowerCase().includes("poor") ? 65 : 75
        };
    } else if (assetType.toLowerCase().includes("equipment") || assetType.toLowerCase().includes("machinery")) {
        approach = {
            method: "Equipment Seizure and Auction",
            rationale: "Equipment requires specialized valuation and industrial auction channels",
            timeline: "3-8 months", 
            expectedRecoveryRate: assetCondition.toLowerCase().includes("poor") ? 45 : 60
        };
    } else if (assetType.toLowerCase().includes("vehicle") || assetType.toLowerCase().includes("automobile")) {
        approach = {
            method: "Vehicle Repossession and Resale",
            rationale: "Vehicles have established repossession and resale markets",
            timeline: "1-4 months",
            expectedRecoveryRate: assetCondition.toLowerCase().includes("poor") ? 50 : 65
        };
    } else if (assetType.toLowerCase().includes("inventory") || assetType.toLowerCase().includes("stock")) {
        approach = {
            method: "Inventory Liquidation Sale",
            rationale: "Inventory requires quick liquidation to preserve value",
            timeline: "1-3 months",
            expectedRecoveryRate: 40 // Generally lower due to obsolescence risk
        };
    } else {
        approach = {
            method: "General Asset Liquidation",
            rationale: "General approach for mixed or undefined asset types",
            timeline: "3-12 months",
            expectedRecoveryRate: 50
        };
    }
    
    // Adjust for asset value
    if (estimatedValue > 500000) {
        approach.expectedRecoveryRate += 5; // Better recovery for high-value assets
    } else if (estimatedValue < 50000) {
        approach.expectedRecoveryRate -= 5; // Lower recovery for low-value assets
    }
    
    return approach;
}

/**
 * 📋 Develop Liquidation Plan
 */
function developLiquidationPlan(assetData, recoveryApproach) {
    const plan = {
        preparationPhase: {},
        liquidationPhase: {},
        completionPhase: {},
        contingencyPlans: []
    };
    
    // Preparation Phase
    plan.preparationPhase = {
        duration: "2-6 weeks",
        activities: [
            "Obtain current professional appraisal",
            "Complete title search and lien verification",
            "Assess asset condition and repair needs",
            "Research market conditions and demand",
            "Prepare asset for market presentation"
        ],
        deliverables: [
            "Updated appraisal report",
            "Clear title confirmation", 
            "Asset condition assessment",
            "Market analysis report",
            "Asset preparation completion"
        ]
    };
    
    // Liquidation Phase
    const method = recoveryApproach.method;
    if (method.includes("Real Estate")) {
        plan.liquidationPhase = {
            duration: "4-12 months",
            activities: [
                "Engage real estate broker or auctioneer",
                "Market property through multiple channels",
                "Conduct showings and negotiate offers",
                "Complete due diligence with buyers",
                "Close sale and transfer title"
            ],
            deliverables: [
                "Marketing materials and listings",
                "Buyer offers and negotiations",
                "Purchase agreement execution",
                "Closing documentation",
                "Sale proceeds collection"
            ]
        };
    } else if (method.includes("Equipment")) {
        plan.liquidationPhase = {
            duration: "2-6 months",
            activities: [
                "Engage specialized equipment auctioneer",
                "Prepare equipment for auction presentation",
                "Market to industrial buyers and dealers",
                "Conduct auction or private sale",
                "Arrange buyer pickup and title transfer"
            ],
            deliverables: [
                "Auction catalog preparation",
                "Buyer registration and qualification",
                "Auction execution or sale completion",
                "Payment collection and verification",
                "Asset delivery confirmation"
            ]
        };
    }
    
    // Completion Phase
    plan.completionPhase = {
        duration: "2-4 weeks",
        activities: [
            "Collect final sale proceeds",
            "Pay liquidation costs and expenses",
            "Distribute surplus to stakeholders",
            "Complete final accounting and reporting",
            "Close recovery case and update records"
        ],
        deliverables: [
            "Final settlement statement",
            "Surplus distribution documentation",
            "Recovery case closure report",
            "Financial impact analysis",
            "Lessons learned documentation"
        ]
    };
    
    // Contingency Plans
    plan.contingencyPlans = [
        {
            scenario: "Market conditions deteriorate",
            response: "Consider rent/lease option or delayed sale timing",
            trigger: "Asset value decline > 20%"
        },
        {
            scenario: "Buyer financing falls through",
            response: "Pursue cash buyers or owner financing options", 
            trigger: "Financing contingency failure"
        },
        {
            scenario: "Legal challenges or title issues",
            response: "Engage specialized legal counsel for resolution",
            trigger: "Title defects or third-party claims"
        }
    ];
    
    return plan;
}

/**
 * 📅 Create Recovery Timeline
 */
function createRecoveryTimeline(liquidationPlan) {
    const timeline = {
        totalDuration: "12-24 months",
        phases: [],
        criticalMilestones: [],
        resourceAllocation: {}
    };
    
    // Add phases from liquidation plan
    let cumulativeWeeks = 0;
    
    // Preparation Phase
    const prepDuration = extractWeeksFromDuration(liquidationPlan.preparationPhase.duration);
    timeline.phases.push({
        phase: "Asset Preparation",
        startWeek: cumulativeWeeks + 1,
        endWeek: cumulativeWeeks + prepDuration,
        duration: liquidationPlan.preparationPhase.duration,
        keyActivities: liquidationPlan.preparationPhase.activities.slice(0, 3)
    });
    cumulativeWeeks += prepDuration;
    
    // Liquidation Phase
    const liqDuration = extractWeeksFromDuration(liquidationPlan.liquidationPhase.duration);
    timeline.phases.push({
        phase: "Asset Liquidation",
        startWeek: cumulativeWeeks + 1,
        endWeek: cumulativeWeeks + liqDuration,
        duration: liquidationPlan.liquidationPhase.duration,
        keyActivities: liquidationPlan.liquidationPhase.activities.slice(0, 3)
    });
    cumulativeWeeks += liqDuration;
    
    // Completion Phase
    const compDuration = extractWeeksFromDuration(liquidationPlan.completionPhase.duration);
    timeline.phases.push({
        phase: "Recovery Completion",
        startWeek: cumulativeWeeks + 1,
        endWeek: cumulativeWeeks + compDuration,
        duration: liquidationPlan.completionPhase.duration,
        keyActivities: liquidationPlan.completionPhase.activities.slice(0, 3)
    });
    
    // Critical Milestones
    timeline.criticalMilestones = [
        { milestone: "Appraisal completed", week: 4 },
        { milestone: "Marketing launched", week: 8 },
        { milestone: "Offers received", week: 16 },
        { milestone: "Sale closed", week: cumulativeWeeks - 2 },
        { milestone: "Recovery completed", week: cumulativeWeeks + compDuration }
    ];
    
    return timeline;
}

/**
 * 💰 Analyze Recovery Cost-Benefit
 */
function analyzeRecoveryCostBenefit(assetData, liquidationPlan) {
    const estimatedValue = parseFloat(assetData.estimatedValue || 0);
    const outstandingDebt = parseFloat(assetData.outstandingDebt || 0);
    
    // Estimate liquidation costs
    const costs = {
        legalFees: estimatedValue * 0.05, // 5% for legal
        appraisalFees: Math.min(5000, estimatedValue * 0.02), // 2% or $5K max
        marketingCosts: estimatedValue * 0.02, // 2% for marketing
        brokerCommission: estimatedValue * 0.06, // 6% broker fee
        maintenanceCosts: estimatedValue * 0.01, // 1% for maintenance
        miscellaneousCosts: estimatedValue * 0.01 // 1% miscellaneous
    };
    
    const totalCosts = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    
    // Recovery scenarios
    const scenarios = {
        optimistic: {
            recoveryRate: 0.85,
            grossRecovery: estimatedValue * 0.85,
            totalCosts: totalCosts * 0.9,
            netRecovery: (estimatedValue * 0.85) - (totalCosts * 0.9)
        },
        expected: {
            recoveryRate: 0.70,
            grossRecovery: estimatedValue * 0.70,
            totalCosts: totalCosts,
            netRecovery: (estimatedValue * 0.70) - totalCosts
        },
        pessimistic: {
            recoveryRate: 0.55,
            grossRecovery: estimatedValue * 0.55,
            totalCosts: totalCosts * 1.2,
            netRecovery: (estimatedValue * 0.55) - (totalCosts * 1.2)
        }
    };
    
    // Expected value calculation
    const expectedNetRecovery = 
        scenarios.optimistic.netRecovery * 0.25 +
        scenarios.expected.netRecovery * 0.50 +
        scenarios.pessimistic.netRecovery * 0.25;
    
    return {
        costBreakdown: costs,
        totalEstimatedCosts: Math.round(totalCosts),
        scenarios: scenarios,
        expectedNetRecovery: Math.round(expectedNetRecovery),
        recoveryEfficiency: ((expectedNetRecovery / estimatedValue) * 100).toFixed(1) + "%",
        recommendation: expectedNetRecovery > outstandingDebt * 0.3 ? "Proceed with liquidation" : "Consider alternative strategies"
    };
}

/**
 * ⚠️ Assess Asset Recovery Risks
 */
function assessAssetRecoveryRisks(assetData) {
    const risks = [];
    const mitigations = [];
    
    const assetType = assetData.assetType || "";
    const assetCondition = assetData.assetCondition || "";
    const estimatedValue = parseFloat(assetData.estimatedValue || 0);
    
    // Market Risk
    risks.push({
        category: "Market Risk",
        risk: "Asset values may decline due to market conditions",
        probability: "Medium",
        impact: "High",
        mitigation: "Monitor market trends and time sale appropriately"
    });
    
    // Condition Risk
    if (assetCondition.toLowerCase().includes("poor") || 
        assetCondition.toLowerCase().includes("deteriorating")) {
        risks.push({
            category: "Asset Condition Risk",
            risk: "Poor asset condition may reduce recovery value",
            probability: "High",
            impact: "Medium",
            mitigation: "Consider cost-effective repairs vs immediate sale"
        });
    }
    
    // Legal Risk
    if (assetData.titleStatus !== "Clear") {
        risks.push({
            category: "Legal Risk",
            risk: "Title issues may delay or prevent sale",
            probability: "Medium",
            impact: "High",
            mitigation: "Resolve title issues before marketing asset"
        });
    }
    
    // Liquidity Risk
    if (estimatedValue > 1000000) {
        risks.push({
            category: "Liquidity Risk",
            risk: "High-value assets may have limited buyer pool",
            probability: "Medium",
            impact: "Medium",
            mitigation: "Expand marketing reach and consider alternative sale methods"
        });
    }
    
    // Regulatory Risk
    risks.push({
        category: "Regulatory Risk",
        risk: "Cambodia regulations may affect asset transfer",
        probability: "Low",
        impact: "Medium",
        mitigation: "Engage local legal counsel familiar with asset transfer laws"
    });
    
    return {
        identifiedRisks: risks,
        riskCount: risks.length,
        highImpactRisks: risks.filter(r => r.impact === "High").length,
        overallRiskLevel: risks.length > 3 ? "High" : risks.length > 1 ? "Medium" : "Low",
        riskMitigationPlan: risks.map(r => r.mitigation)
    };
}

/**
 * 📊 Calculate Recovery Metrics
 */
function calculateRecoveryMetrics(portfolioData, performanceData) {
    const metrics = {};
    
    // Basic Recovery Metrics
    const totalRecovered = parseFloat(performanceData.totalRecoveredAmount || 0);
    const totalCosts = parseFloat(performanceData.totalRecoveryCosts || 0);
    const portfolioValue = parseFloat(portfolioData.recoveryPortfolioValue || 1);
    
    metrics.overallRecoveryRate = ((totalRecovered / portfolioValue) * 100).toFixed(1) + "%";
    metrics.netRecoveryRate = (((totalRecovered - totalCosts) / portfolioValue) * 100).toFixed(1) + "%";
    metrics.costToCollectRatio = ((totalCosts / totalRecovered) * 100).toFixed(1) + "%";
    metrics.netRecoveryROI = (((totalRecovered - totalCosts) / totalCosts) * 100).toFixed(1) + "%";
    
    // Time-based Metrics
    metrics.averageRecoveryTime = parseFloat(performanceData.averageRecoveryTime || 0) + " months";
    metrics.medianRecoveryTime = (parseFloat(performanceData.averageRecoveryTime || 0) * 0.8).toFixed(1) + " months";
    
    // Strategy-specific Metrics
    metrics.strategyPerformance = {
        negotiatedSettlements: {
            successRate: parseFloat(performanceData.negotiatedSettlements || 0) + "%",
            averageSettlementRate: "75%", // Typical settlement rate
            averageTime: "2 months"
        },
        collateralForeclosures: {
            recoveryRate: parseFloat(performanceData.collateralForeclosures || 0) + "%",
            averageTime: "10 months",
            successRate: "85%"
        },
        legalJudgments: {
            collectionRate: parseFloat(performanceData.legalJudgments || 0) + "%",
            averageTime: "18 months",
            successRate: "65%"
        }
    };
    
    // Quality Metrics
    metrics.qualityMetrics = {
        firstCallResolution: "25%", // Industry benchmark
        settlementAcceptance: "80%", // Acceptance rate of settlement offers
        reDefaultRate: "15%", // Loans that default again after workout
        borrowerSatisfaction: "Moderate" // Post-recovery relationship
    };
    
    return metrics;
}

/**
 * 📈 Generate Recovery Benchmarks
 */
function generateRecoveryBenchmarks(performanceMetrics) {
    return {
        industryBenchmarks: {
            overallRecoveryRate: "65-75%",
            costToCollectRatio: "15-25%",
            averageRecoveryTime: "12-18 months",
            legalSuccessRate: "60-70%"
        },
        fundPerformance: {
            overallRecoveryRate: performanceMetrics.overallRecoveryRate,
            costToCollectRatio: performanceMetrics.costToCollectRatio,
            averageRecoveryTime: performanceMetrics.averageRecoveryTime,
            netRecoveryROI: performanceMetrics.netRecoveryROI
        },
        performanceGap: calculatePerformanceGaps(performanceMetrics),
        recommendations: generateBenchmarkRecommendations(performanceMetrics)
    };
}

/**
 * 🔍 Identify Improvement Opportunities
 */
function identifyImprovementOpportunities(performanceMetrics) {
    const opportunities = [];
    
    const recoveryRate = parseFloat(performanceMetrics.overallRecoveryRate);
    const costRatio = parseFloat(performanceMetrics.costToCollectRatio);
    const avgTime = parseFloat(performanceMetrics.averageRecoveryTime.split(' ')[0]);
    
    // Recovery Rate Improvements
    if (recoveryRate < 65) {
        opportunities.push({
            area: "Recovery Rate",
            opportunity: "Improve collection strategies and early intervention",
            potential: "Increase recovery rate by 5-10 percentage points",
            priority: "High",
            timeframe: "6-12 months"
        });
    }
    
    // Cost Efficiency Improvements
    if (costRatio > 25) {
        opportunities.push({
            area: "Cost Efficiency",
            opportunity: "Streamline collection processes and reduce external costs",
            potential: "Reduce cost-to-collect ratio by 3-5 percentage points",
            priority: "High",
            timeframe: "3-6 months"
        });
    }
    
    // Time Efficiency Improvements
    if (avgTime > 18) {
        opportunities.push({
            area: "Time Efficiency",
            opportunity: "Accelerate collection timeline through automation",
            potential: "Reduce average recovery time by 2-4 months",
            priority: "Medium",
            timeframe: "6-9 months"
        });
    }
    
    // Strategy Optimization
    opportunities.push({
        area: "Strategy Optimization",
        opportunity: "Increase use of negotiated settlements over litigation",
        potential: "Improve overall efficiency and borrower relationships",
        priority: "Medium",
        timeframe: "3-6 months"
    });
    
    // Technology Enhancement
    opportunities.push({
        area: "Technology",
        opportunity: "Implement automated collection workflows and AI scoring",
        potential: "Improve efficiency and decision-making accuracy",
        priority: "Medium",
        timeframe: "9-12 months"
    });
    
    return opportunities;
}

/**
 * 📋 Generate Performance Action Plan
 */
function generatePerformanceActionPlan(improvementOpportunities) {
    const actionPlan = {
        immediate: [], // 0-3 months
        shortTerm: [], // 3-6 months
        mediumTerm: [], // 6-12 months
        longTerm: [] // 12+ months
    };
    
    improvementOpportunities.forEach(opportunity => {
        const timeframe = opportunity.timeframe;
        let category;
        
        if (timeframe.includes("3") && !timeframe.includes("6")) {
            category = "immediate";
        } else if (timeframe.includes("3-6") || timeframe.includes("6") && !timeframe.includes("9")) {
            category = "shortTerm";
        } else if (timeframe.includes("6-12") || timeframe.includes("9")) {
            category = "mediumTerm";
        } else {
            category = "longTerm";
        }
        
        actionPlan[category].push({
            action: opportunity.opportunity,
            area: opportunity.area,
            priority: opportunity.priority,
            expectedBenefit: opportunity.potential,
            timeline: opportunity.timeframe
        });
    });
    
    return actionPlan;
}

/**
 * 📊 Analyze Recovery Trends
 */
function analyzeRecoveryTrends(performanceData) {
    return {
        recoveryRateTrend: "Stable", // Would analyze historical data
        timeToRecoveryTrend: "Improving", // Would analyze historical data
        costEfficiencyTrend: "Deteriorating", // Would analyze historical data
        strategyEffectivenessTrend: {
            negotiation: "Improving",
            foreclosure: "Stable", 
            legal: "Declining"
        },
        seasonalPatterns: {
            q1: "Lower activity",
            q2: "Peak performance",
            q3: "Moderate activity",
            q4: "Holiday impact"
        },
        recommendations: [
            "Focus on early intervention strategies",
            "Optimize settlement negotiation approaches",
            "Review legal action cost-effectiveness",
            "Enhance technology adoption for efficiency"
        ]
    };
}

// 🧮 HELPER FUNCTIONS

/**
 * ⏰ Extract Weeks from Duration String
 */
function extractWeeksFromDuration(duration) {
    const durationLower = duration.toLowerCase();
    
    if (durationLower.includes("week")) {
        const match = durationLower.match(/(\d+)(-\d+)?\s*week/);
        if (match) {
            return parseInt(match[1]);
        }
    } else if (durationLower.includes("month")) {
        const match = durationLower.match(/(\d+)(-\d+)?\s*month/);
        if (match) {
            return parseInt(match[1]) * 4; // Convert months to weeks
        }
    }
    
    return 4; // Default 4 weeks
}

/**
 * 📊 Calculate Performance Gaps
 */
function calculatePerformanceGaps(performanceMetrics) {
    const recoveryRate = parseFloat(performanceMetrics.overallRecoveryRate);
    const costRatio = parseFloat(performanceMetrics.costToCollectRatio);
    
    return {
        recoveryRateGap: recoveryRate < 70 ? (70 - recoveryRate).toFixed(1) + "% below benchmark" : "Above benchmark",
        costEfficiencyGap: costRatio > 20 ? (costRatio - 20).toFixed(1) + "% above benchmark" : "Below benchmark",
        overallAssessment: recoveryRate >= 70 && costRatio <= 20 ? "Meeting benchmarks" : "Below benchmarks"
    };
}

/**
 * 💡 Generate Benchmark Recommendations
 */
function generateBenchmarkRecommendations(performanceMetrics) {
    const recommendations = [];
    
    const recoveryRate = parseFloat(performanceMetrics.overallRecoveryRate);
    const costRatio = parseFloat(performanceMetrics.costToCollectRatio);
    
    if (recoveryRate < 65) {
        recommendations.push("Focus on early intervention and borrower engagement strategies");
    }
    
    if (costRatio > 25) {
        recommendations.push("Review and optimize collection cost structure");
    }
    
    if (recoveryRate >= 70 && costRatio <= 20) {
        recommendations.push("Maintain current performance and explore advanced optimization");
    } else {
        recommendations.push("Implement comprehensive recovery process improvement program");
    }
    
    return recommendations;
}

// 📊 EXPORT FUNCTIONS
module.exports = {
    // Recovery strategy development
    developRecoveryStrategy,
    analyzeRecoveryOptions,
    selectOptimalStrategy,
    developActionPlan,
    calculateRecoveryProjections,
    identifyRecoveryRisks,
    
    // Collection activities
    executeCollectionActivity,
    generateCollectionScript,
    generateComplianceChecklist,
    setupOutcomeTracking,
    generateFollowUpActions,
    
    // Asset recovery management
    manageAssetRecovery,
    determineRecoveryApproach,
    developLiquidationPlan,
    createRecoveryTimeline,
    analyzeRecoveryCostBenefit,
    assessAssetRecoveryRisks,
    
    // Performance analytics
    analyzeRecoveryPerformance,
    calculateRecoveryMetrics,
    generateRecoveryBenchmarks,
    identifyImprovementOpportunities,
    generatePerformanceActionPlan,
    analyzeRecoveryTrends,
    
    // Utility functions
    generateStrategyRationale,
    generateKeyMilestones,
    assessResourceRequirements,
    extendTimeline,
    extractWeeksFromDuration,
    calculatePerformanceGaps,
    generateBenchmarkRecommendations,
    
    // Framework constants
    LOAN_RECOVERY_FRAMEWORK
};

// 🏁 END OF CAMBODIA LOAN RECOVERY SYSTEM
