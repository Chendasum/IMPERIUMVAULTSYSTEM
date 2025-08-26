// cambodia/clientOnboarding.js - Cambodia Client Onboarding & KYC
// Powered by IMPERIUM VAULT GPT-5 System

class CambodiaClientOnboarding {
    constructor() {
        this.regulatoryRequirements = {
            nationalBankCambodia: {
                kycRequirements: ['Identity verification', 'Address verification', 'Source of funds', 'Beneficial ownership'],
                amlCompliance: ['Sanctions screening', 'PEP screening', 'Risk assessment', 'Ongoing monitoring'],
                documentRetention: '7 years minimum',
                reportingThresholds: {
                    cashTransactions: '$10,000 USD equivalent',
                    suspiciousActivity: 'Any amount requiring STR',
                    crossBorder: '$2,000 USD equivalent'
                }
            },
            seccomCambodia: {
                investorClassification: ['Retail investor', 'Professional investor', 'Institutional investor'],
                suitabilityAssessment: 'Required for all investment products',
                riskDisclosure: 'Comprehensive risk warnings mandatory',
                coolingOffPeriod: '7 days for complex products'
            },
            fatca: {
                applicability: 'US persons and entities',
                forms: ['W-8BEN', 'W-8BEN-E', 'W-9'],
                thresholds: '$50,000 for individuals, $250,000 for entities',
                reporting: 'Annual to US IRS'
            },
            crs: {
                participatingJurisdictions: ['Most OECD countries', 'EU member states', 'Major financial centers'],
                reportingThresholds: 'Various by jurisdiction',
                selfCertification: 'Required for all account holders'
            }
        };

        this.clientCategories = {
            retailInvestor: {
                definition: 'Individual investors with limited investment experience',
                investmentLimits: 'Up to $50,000 USD per investment product',
                requiredDocuments: ['National ID', 'Proof of address', 'Income verification', 'Investment experience questionnaire'],
                protections: ['Cooling-off periods', 'Simplified risk warnings', 'Complaints procedure'],
                suitableProducts: ['Government bonds', 'Bank deposits', 'Blue chip stocks', 'Conservative mutual funds']
            },
            professionalInvestor: {
                definition: 'Experienced investors meeting minimum criteria',
                qualificationCriteria: {
                    netWorth: '$100,000 USD minimum',
                    investmentExperience: '2+ years active trading',
                    professionalQualification: 'Financial industry certification'
                },
                investmentLimits: 'Up to $500,000 USD per product',
                requiredDocuments: ['Enhanced KYC', 'Professional qualification proof', 'Investment portfolio evidence'],
                availableProducts: ['Derivatives', 'Complex structured products', 'Private placements', 'Leveraged products']
            },
            institutionalInvestor: {
                definition: 'Banks, insurance companies, pension funds, investment funds',
                minimumAssets: '$1,000,000 USD',
                requiredDocuments: ['Corporate registration', 'Audited financials', 'Board resolutions', 'Authorized signatory list'],
                dueDigence: ['Enhanced due diligence', 'Ultimate beneficial owner identification', 'Source of funds verification'],
                availableProducts: ['All investment products', 'Wholesale markets', 'OTC derivatives', 'Prime brokerage']
            },
            highNetWorth: {
                definition: 'Individuals with significant investable assets',
                threshold: '$500,000 USD investable assets',
                enhancedServices: ['Dedicated relationship manager', 'Customized investment solutions', 'Tax optimization advice'],
                requiredDocuments: ['Wealth verification', 'Tax residency certificates', 'Source of wealth documentation'],
                riskToleranceAssessment: 'Comprehensive profiling required'
            }
        };

        this.onboardingProcess = {
            initialContact: {
                duration: '1-2 days',
                activities: ['Lead qualification', 'Preliminary risk assessment', 'Service presentation', 'Fee disclosure'],
                outcomes: ['Client interest confirmed', 'Service agreement signed', 'Document collection initiated']
            },
            documentCollection: {
                duration: '3-5 days',
                activities: ['KYC document gathering', 'Identity verification', 'Address verification', 'Financial status verification'],
                cambodiaSpecific: ['Khmer ID card verification', 'Foreigner registration card (if applicable)', 'Work permit verification'],
                outcomes: ['Complete documentation file', 'Initial compliance screening passed']
            },
            complianceScreening: {
                duration: '2-3 days',
                activities: ['AML screening', 'Sanctions check', 'PEP screening', 'Adverse media search'],
                tools: ['World-Check database', 'Local PEP lists', 'Sanctions databases'],
                outcomes: ['Compliance clearance obtained', 'Risk rating assigned']
            },
            riskProfiling: {
                duration: '1 day',
                activities: ['Investment experience assessment', 'Risk tolerance evaluation', 'Investment objectives clarification', 'Time horizon determination'],
                questionnaire: 'Comprehensive risk questionnaire',
                outcomes: ['Investment profile created', 'Suitable products identified']
            },
            accountOpening: {
                duration: '1-2 days',
                activities: ['Account setup', 'Trading platform access', 'Initial deposit processing', 'Welcome package delivery'],
                outcomes: ['Active trading account', 'Client portal access', 'Relationship manager assigned']
            }
        };

        this.riskFactors = {
            high: {
                indicators: ['PEP status', 'High-risk jurisdiction', 'Complex ownership structure', 'Cryptocurrency involvement', 'Political exposure'],
                additionalRequirements: ['Enhanced due diligence', 'Senior management approval', 'Ongoing monitoring', 'Regular reviews'],
                approvalLevel: 'Senior management'
            },
            medium: {
                indicators: ['Moderate wealth', 'Some investment experience', 'Standard documentation', 'Established business'],
                requirements: ['Standard KYC', 'Regular monitoring', 'Annual review'],
                approvalLevel: 'Compliance officer'
            },
            low: {
                indicators: ['Local resident', 'Stable employment', 'Simple investment needs', 'Complete documentation'],
                requirements: ['Basic KYC', 'Periodic monitoring', 'Biennial review'],
                approvalLevel: 'Relationship manager'
            }
        };
    }

    // Main onboarding orchestration
    async initiateClientOnboarding(clientData) {
        const {
            clientType,
            personalDetails,
            financialInformation,
            investmentObjectives,
            riskTolerance
        } = clientData;

        // Step 1: Initial qualification
        const qualification = await this.qualifyClient(clientData);
        if (!qualification.qualified) {
            return {
                status: 'rejected',
                reason: qualification.reason,
                alternatives: qualification.alternatives
            };
        }

        // Step 2: Determine onboarding track
        const onboardingTrack = this.determineOnboardingTrack(qualification);
        
        // Step 3: Generate document checklist
        const documentChecklist = this.generateDocumentChecklist(clientType, qualification);
        
        // Step 4: Create compliance requirements
        const complianceRequirements = this.generateComplianceRequirements(qualification);
        
        // Step 5: Risk assessment
        const riskAssessment = this.performInitialRiskAssessment(clientData);

        return {
            status: 'onboarding_initiated',
            clientId: this.generateClientId(),
            onboardingTrack: onboardingTrack,
            estimatedCompletion: this.calculateCompletionDate(onboardingTrack),
            requirements: {
                documents: documentChecklist,
                compliance: complianceRequirements,
                riskProfile: riskAssessment
            },
            nextSteps: this.generateNextSteps(onboardingTrack),
            assignedManager: this.assignRelationshipManager(qualification),
            regulatoryNotes: this.getCambodiaRegulatoryNotes(clientType)
        };
    }

    // Client qualification assessment
    qualifyClient(clientData) {
        const { personalDetails, financialInformation, investmentObjectives } = clientData;
        
        // Age verification
        if (personalDetails.age < 18) {
            return {
                qualified: false,
                reason: 'Minimum age requirement: 18 years',
                alternatives: ['Joint account with parent/guardian', 'Trust account setup']
            };
        }

        // Residency verification
        if (!this.verifyResidencyStatus(personalDetails.residency)) {
            return {
                qualified: false,
                reason: 'Invalid residency status for Cambodia financial services',
                alternatives: ['Obtain proper residency documentation', 'Consider offshore account options']
            };
        }

        // Minimum investment threshold
        if (financialInformation.initialInvestment < 1000) {
            return {
                qualified: false,
                reason: 'Minimum initial investment: $1,000 USD',
                alternatives: ['Accumulate minimum investment amount', 'Consider regular savings plan']
            };
        }

        // Sanctions screening
        const sanctionsCheck = this.performSanctionsScreening(personalDetails);
        if (!sanctionsCheck.cleared) {
            return {
                qualified: false,
                reason: 'Failed sanctions screening',
                alternatives: ['Provide additional documentation for review']
            };
        }

        return {
            qualified: true,
            clientCategory: this.determineClientCategory(financialInformation),
            riskRating: this.calculateInitialRiskRating(clientData),
            recommendedServices: this.recommendServices(clientData)
        };
    }

    // Generate comprehensive document checklist
    generateDocumentChecklist(clientType, qualification) {
        let documents = {
            mandatory: [],
            conditional: [],
            enhanced: []
        };

        // Base mandatory documents for all clients
        documents.mandatory = [
            'Valid national ID or passport',
            'Proof of address (utility bill, bank statement)',
            'Proof of income (salary slip, tax return)',
            'Bank account details for funding',
            'Investment experience questionnaire',
            'Risk tolerance assessment'
        ];

        // Cambodia-specific documents
        if (qualification.residencyStatus === 'cambodian_national') {
            documents.mandatory.push('Khmer national ID card');
        } else if (qualification.residencyStatus === 'foreign_resident') {
            documents.mandatory.push(
                'Foreigner registration card',
                'Valid work permit',
                'Visa documentation'
            );
        }

        // Client type specific documents
        if (clientType === 'corporate') {
            documents.mandatory.push(
                'Certificate of incorporation',
                'Board resolution for account opening',
                'Authorized signatory list',
                'Ultimate beneficial owner declaration',
                'Audited financial statements'
            );
        }

        // Enhanced documents for high-risk clients
        if (qualification.riskRating === 'high') {
            documents.enhanced = [
                'Source of wealth documentation',
                'Reference letters from existing banks',
                'Professional references',
                'Detailed business plan (if applicable)',
                'Tax clearance certificate'
            ];
        }

        // Professional investor requirements
        if (qualification.clientCategory === 'professionalInvestor') {
            documents.conditional.push(
                'Professional qualification certificates',
                'Investment portfolio statements',
                'Trading experience evidence'
            );
        }

        return {
            total: documents.mandatory.length + documents.conditional.length + documents.enhanced.length,
            breakdown: documents,
            estimatedCollectionTime: this.estimateDocumentCollectionTime(documents),
            cambodiaSpecificNotes: this.getCambodiaDocumentNotes()
        };
    }

    // Compliance requirements generation
    generateComplianceRequirements(qualification) {
        let requirements = {
            kyc: [],
            aml: [],
            regulatory: [],
            ongoing: []
        };

        // Standard KYC requirements
        requirements.kyc = [
            'Identity verification against government databases',
            'Address verification through utility bills',
            'Financial status verification',
            'Investment experience assessment'
        ];

        // AML requirements based on risk rating
        requirements.aml = [
            'Sanctions database screening',
            'PEP (Politically Exposed Person) screening',
            'Adverse media search',
            'Source of funds verification'
        ];

        if (qualification.riskRating === 'high') {
            requirements.aml.push(
                'Enhanced due diligence procedures',
                'Senior management approval required',
                'Independent verification of documents',
                'In-person interview requirement'
            );
        }

        // Regulatory compliance
        requirements.regulatory = [
            'FATCA compliance (if US person)',
            'CRS self-certification',
            'Local tax reporting obligations',
            'NBC foreign exchange compliance'
        ];

        // Ongoing monitoring requirements
        requirements.ongoing = [
            'Annual KYC review and update',
            'Transaction monitoring for suspicious activity',
            'Regular risk rating reassessment',
            'Periodic client contact and verification'
        ];

        return {
            requirements: requirements,
            approvalLevels: this.getRequiredApprovalLevels(qualification),
            estimatedProcessingTime: this.estimateComplianceProcessingTime(qualification),
            regulatoryDeadlines: this.getRegulatoryDeadlines()
        };
    }

    // Risk profiling and suitability assessment
    performRiskProfiling(clientData) {
        const { investmentObjectives, financialInformation, personalDetails } = clientData;
        
        let riskScore = 0;
        let riskFactors = [];

        // Age-based risk tolerance
        if (personalDetails.age < 30) {
            riskScore += 40; // Higher risk tolerance for young investors
            riskFactors.push('Young age allows for longer investment horizon');
        } else if (personalDetails.age > 60) {
            riskScore += 10; // Lower risk tolerance for older investors
            riskFactors.push('Conservative approach appropriate for age');
        } else {
            riskScore += 25;
        }

        // Income stability
        if (financialInformation.employmentType === 'stable_employment') {
            riskScore += 20;
            riskFactors.push('Stable employment provides regular income');
        } else if (financialInformation.employmentType === 'business_owner') {
            riskScore += 30;
            riskFactors.push('Business ownership indicates higher risk tolerance');
        }

        // Investment experience
        if (investmentObjectives.experience === 'experienced') {
            riskScore += 30;
            riskFactors.push('Investment experience allows for complex products');
        } else if (investmentObjectives.experience === 'beginner') {
            riskScore += 10;
            riskFactors.push('Limited experience requires conservative approach');
        }

        // Financial capacity
        const investmentRatio = financialInformation.initialInvestment / financialInformation.netWorth;
        if (investmentRatio < 0.1) {
            riskScore += 25;
            riskFactors.push('Investment represents small portion of net worth');
        } else if (investmentRatio > 0.5) {
            riskScore += 5;
            riskFactors.push('Large investment proportion requires careful consideration');
        }

        return {
            overallRiskScore: Math.min(riskScore, 100),
            riskProfile: this.categorizeRiskProfile(riskScore),
            riskFactors: riskFactors,
            recommendedAllocation: this.generateRiskBasedAllocation(riskScore),
            suitableProducts: this.identifySuitableProducts(riskScore),
            restrictions: this.identifyProductRestrictions(riskScore),
            reviewFrequency: this.determineReviewFrequency(riskScore)
        };
    }

    // Cambodia-specific regulatory compliance
    ensureCambodiaCompliance(clientData, onboardingStatus) {
        let complianceChecks = {
            nbcCompliance: false,
            seccomCompliance: false,
            taxCompliance: false,
            foreignExchangeCompliance: false
        };

        // NBC (National Bank of Cambodia) compliance
        complianceChecks.nbcCompliance = this.checkNBCCompliance(clientData);
        
        // SECC (Securities and Exchange Commission of Cambodia) compliance
        complianceChecks.seccomCompliance = this.checkSECCOMCompliance(clientData);
        
        // Tax compliance
        complianceChecks.taxCompliance = this.checkTaxCompliance(clientData);
        
        // Foreign exchange compliance
        complianceChecks.foreignExchangeCompliance = this.checkFXCompliance(clientData);

        return {
            overallCompliance: Object.values(complianceChecks).every(check => check),
            individualChecks: complianceChecks,
            requiredActions: this.generateComplianceActions(complianceChecks),
            regulatoryDeadlines: this.getComplianceDeadlines(clientData),
            cambodiaSpecificRisks: this.identifyCambodiaRisks(clientData)
        };
    }

    // Generate onboarding completion report
    generateOnboardingReport(clientId, onboardingData) {
        return {
            clientSummary: {
                clientId: clientId,
                onboardingDate: new Date().toISOString().split('T')[0],
                clientCategory: onboardingData.qualification.clientCategory,
                riskRating: onboardingData.qualification.riskRating,
                approvedProducts: onboardingData.approvedProducts,
                initialInvestment: onboardingData.financialInformation.initialInvestment
            },
            complianceStatus: {
                kycCompleted: onboardingData.compliance.kycCompleted,
                amlCleared: onboardingData.compliance.amlCleared,
                regulatoryApproval: onboardingData.compliance.regulatoryApproval,
                documentsVerified: onboardingData.compliance.documentsVerified
            },
            riskAssessment: {
                overallRiskProfile: onboardingData.riskProfile.profile,
                investmentRestrictions: onboardingData.riskProfile.restrictions,
                monitoringRequirements: onboardingData.riskProfile.monitoring,
                reviewSchedule: onboardingData.riskProfile.reviewSchedule
            },
            relationshipStructure: {
                assignedManager: onboardingData.assignedManager,
                serviceLevel: onboardingData.serviceLevel,
                communicationPreferences: onboardingData.communicationPreferences,
                reportingRequirements: onboardingData.reportingRequirements
            },
            nextSteps: {
                immediateActions: this.getImmediateActions(onboardingData),
                firstMonthMilestones: this.getFirstMonthMilestones(onboardingData),
                ongoingRequirements: this.getOngoingRequirements(onboardingData)
            }
        };
    }

    // Helper methods
    generateClientId() {
        const timestamp = Date.now().toString();
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `CAM${timestamp.slice(-6)}${randomSuffix}`;
    }

    determineClientCategory(financialInfo) {
        if (financialInfo.netWorth > 500000) return 'highNetWorth';
        if (financialInfo.investmentExperience > 2 && financialInfo.netWorth > 100000) return 'professionalInvestor';
        if (financialInfo.entityType === 'institution') return 'institutionalInvestor';
        return 'retailInvestor';
    }

    calculateInitialRiskRating(clientData) {
        const riskFactors = [
            clientData.personalDetails.politically_exposed || false,
            clientData.personalDetails.high_risk_jurisdiction || false,
            clientData.financialInformation.source_of_funds_unclear || false,
            clientData.personalDetails.adverse_media || false
        ];
        
        const riskCount = riskFactors.filter(factor => factor).length;
        
        if (riskCount >= 3) return 'high';
        if (riskCount >= 1) return 'medium';
        return 'low';
    }

    getCambodiaRegulatoryNotes(clientType) {
        return [
            'All foreign currency transactions above $2,000 USD require NBC reporting',
            'Foreign investors subject to specific ownership limitations in certain sectors',
            'Tax withholding rates: 6% on dividends, 20% on capital gains for non-residents',
            'Annual reporting requirements to General Department of Taxation',
            'Compliance with Anti-Money Laundering Law of Cambodia mandatory'
        ];
    }
}

module.exports = CambodiaClientOnboarding;
