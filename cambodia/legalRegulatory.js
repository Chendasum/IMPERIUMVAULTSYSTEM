// cambodia/legalRegulatory.js - Cambodia Legal & Regulatory Intelligence
// Powered by IMPERIUM VAULT GPT-5 System

const { executeEnhancedGPT5Command } = require('../utils/dualCommandSystem');

class CambodiaLegalRegulatory {
    constructor() {
        this.businessStructures = {
            'Sole Proprietorship': {
                foreignOwnership: 'Not allowed',
                minCapital: '$0',
                registration: '1-2 weeks',
                complexity: 'Simple',
                taxation: 'Personal income tax',
                liability: 'Unlimited personal liability',
                suitableFor: 'Cambodian citizens only',
                compliance: 'Basic business license'
            },
            'Private Limited Company (Ltd.)': {
                foreignOwnership: '100% allowed',
                minCapital: '$1,000 USD',
                registration: '2-4 weeks',
                complexity: 'Moderate',
                taxation: 'Corporate tax 20%',
                liability: 'Limited liability',
                suitableFor: 'Most foreign investors',
                compliance: 'Annual audits, tax filings'
            },
            'Public Limited Company (Plc.)': {
                foreignOwnership: '100% allowed',
                minCapital: '$300,000 USD',
                registration: '4-8 weeks',
                complexity: 'High',
                taxation: 'Corporate tax 20%',
                liability: 'Limited liability',
                suitableFor: 'Large investments, public offerings',
                compliance: 'Extensive reporting, SEC registration'
            },
            'Branch Office': {
                foreignOwnership: '100% (of parent)',
                minCapital: 'No minimum',
                registration: '3-6 weeks',
                complexity: 'Moderate',
                taxation: 'Corporate tax 20% on Cambodia income',
                liability: 'Parent company liable',
                suitableFor: 'Extensions of foreign companies',
                compliance: 'Parent company guarantees'
            },
            'Representative Office': {
                foreignOwnership: '100%',
                minCapital: 'No minimum',
                registration: '2-4 weeks',
                complexity: 'Simple',
                taxation: 'No income generation allowed',
                liability: 'Parent company liable',
                suitableFor: 'Market research, liaison only',
                compliance: 'No commercial activities'
            },
            'Joint Venture': {
                foreignOwnership: 'Negotiable (typically 49-70%)',
                minCapital: 'Varies by project',
                registration: '4-12 weeks',
                complexity: 'High',
                taxation: 'Corporate tax 20%',
                liability: 'Limited or unlimited (depends on structure)',
                suitableFor: 'Large projects, local partnerships',
                compliance: 'Complex agreements, multiple approvals'
            }
        };

        this.foreignOwnershipRules = {
            'Allowed Sectors (100% Foreign)': [
                'Manufacturing',
                'Hotels and restaurants',
                'Tourism services',
                'Import/export',
                'Construction',
                'Banking (with license)',
                'Insurance (with license)',
                'Real estate development',
                'Information technology',
                'Telecommunications (with restrictions)'
            ],
            'Restricted Sectors (Partnership Required)': [
                'Rice production and trading',
                'Natural rubber plantation',
                'Corn production',
                'Vegetable growing',
                'Cattle and pig raising',
                'Fish and aquaculture',
                'Forestry and logging',
                'Transportation services',
                'Professional services (law, accounting)',
                'Publishing and media'
            ],
            'Prohibited Sectors (Foreigners Not Allowed)': [
                'National defense and security',
                'Post and telecommunications (some services)',
                'Radio and television broadcasting',
                'Production of cigarettes',
                'Cultural heritage sites',
                'Land ownership (except condominiums above ground floor)',
                'Rice seed production',
                'Gemstone mining and cutting'
            ]
        };

        this.taxFramework = {
            'Corporate Income Tax': {
                rate: '20%',
                calculation: 'On taxable income',
                incentives: 'QIP projects: 0% for 6 years + 50% for next 3 years',
                minimumTax: 'Minimum 1% of turnover',
                payment: 'Monthly prepayments, annual filing',
                exemptions: 'Non-profit, government entities'
            },
            'Personal Income Tax': {
                residents: '0-20% progressive',
                nonresidents: '20% flat rate',
                exemption: '$1,200 annually for residents',
                calculation: 'On Cambodia-source income',
                withholding: 'Required for salary payments',
                filing: 'Annual return required'
            },
            'Value Added Tax (VAT)': {
                standardRate: '10%',
                registration: 'Mandatory if turnover > 125M KHR',
                exemptions: 'Financial services, education, healthcare',
                refunds: 'Available for exporters',
                filing: 'Monthly returns',
                penalties: 'Late filing: 2% per month'
            },
            'Withholding Tax': {
                dividends: '14%',
                interest: '14%',
                royalties: '14%',
                managementFees: '14%',
                technicalServices: '14%',
                treaties: 'Reduced rates with some countries'
            },
            'Other Taxes': {
                salaryTax: '20% on non-resident salaries',
                rentalTax: '10% on rental income',
                capitalGainsTax: 'Not implemented',
                propertyTax: '0.1% annually on property value',
                stampDuty: '0.1% on property transfers',
                patentTax: 'Fixed amounts by business type'
            }
        };

        this.propertyOwnership = {
            'Land Ownership': {
                citizens: 'Full ownership rights',
                foreigners: 'Cannot own land',
                companies: 'Local companies (51%+ Cambodian) can own land',
                leases: 'Long-term leases up to 50 years + 50 year extension',
                inheritance: 'Foreign spouses cannot inherit land',
                workarounds: 'Nominee arrangements (risky), long-term leases'
            },
            'Condominium Ownership': {
                citizens: 'Full ownership of any unit',
                foreigners: 'Can own units above ground floor only',
                restrictions: 'Maximum 70% foreign ownership per building',
                financing: 'Limited mortgage options for foreigners',
                inheritance: 'Can be inherited by foreign heirs',
                documentation: 'Proper title and ownership certificates required'
            },
            'Borey/Villa Ownership': {
                structure: 'Foreigner owns structure, leases land',
                leaseTerm: '15-50 years typical',
                renewal: 'Renewable but not guaranteed',
                ownership: 'Structure ownership transferable',
                risks: 'Land lease expiry, renewal terms',
                documentation: 'Separate land lease and structure ownership'
            }
        };

        this.complianceRequirements = {
            'Annual Obligations': [
                'Corporate income tax return filing',
                'Audited financial statements (companies)',
                'Annual corporate registration renewal',
                'Work permit renewals (foreign employees)',
                'Business license renewals',
                'Patent tax declarations',
                'Social security fund contributions',
                'VAT annual reconciliation'
            ],
            'Monthly Obligations': [
                'VAT return filing and payment',
                'Withholding tax returns',
                'Salary tax payments',
                'Fringe benefit tax',
                'Social security contributions',
                'Monthly accounting records',
                'Inventory reports (if required)',
                'Import/export declarations'
            ],
            'Ad-hoc Obligations': [
                'Transaction-specific tax filings',
                'Property transfer registrations',
                'Contract registrations (if required)',
                'Environmental impact assessments',
                'Labor compliance reporting',
                'Customs and trade documentation',
                'Banking compliance reports',
                'Foreign investment approvals'
            ]
        };

        this.investmentIncentives = {
            'Qualified Investment Project (QIP)': {
                sectors: ['Manufacturing', 'Agriculture', 'Tourism', 'Infrastructure', 'Energy'],
                benefits: [
                    'Corporate tax exemption: 6 years',
                    'Corporate tax reduction: 50% for next 3 years',
                    'Import duty exemption on production equipment',
                    'VAT exemption on production equipment',
                    'Land ownership for QIP companies',
                    'Profit repatriation guarantees'
                ],
                requirements: [
                    'Minimum investment thresholds',
                    'Job creation commitments',
                    'Technology transfer (some sectors)',
                    'Environmental compliance',
                    'Export targets (manufacturing)'
                ],
                application: 'Cambodia Development Council (CDC)',
                timeline: '45 days approval process'
            },
            'Special Economic Zones (SEZ)': {
                locations: ['Sihanoukville', 'Bavet', 'Koh Kong', 'Phnom Penh'],
                benefits: [
                    'One-stop service for licenses',
                    'Streamlined customs procedures',
                    'Modern infrastructure',
                    'QIP benefits available',
                    'Simplified labor regulations'
                ],
                industries: ['Manufacturing', 'Logistics', 'Services'],
                requirements: 'SEZ developer and government approvals'
            }
        };

        this.legalRisks = {
            'Regulatory Risk': {
                level: 'Medium-High',
                factors: ['Changing regulations', 'Inconsistent enforcement', 'Administrative discretion'],
                mitigation: ['Legal counsel', 'Compliance monitoring', 'Government relations'],
                monitoring: 'Quarterly regulatory updates'
            },
            'Contract Enforcement': {
                level: 'Medium',
                factors: ['Court system development', 'Arbitration options', 'Commercial dispute resolution'],
                mitigation: ['Strong contracts', 'Arbitration clauses', 'Local legal representation'],
                alternatives: 'Singapore or Hong Kong arbitration'
            },
            'Corruption Risk': {
                level: 'Medium-High',
                factors: ['Administrative processes', 'Permit approvals', 'Contract awards'],
                mitigation: ['Compliance programs', 'Due diligence', 'Anti-corruption policies'],
                monitoring: 'Regular compliance audits'
            },
            'Property Rights': {
                level: 'Medium',
                factors: ['Title disputes', 'Land registration', 'Inheritance issues'],
                mitigation: ['Due diligence', 'Title insurance', 'Legal verification'],
                protection: 'Proper documentation and registration'
            }
        };
    }

    // ⚖️ MAIN LEGAL ANALYSIS FUNCTIONS

    async analyzeLegalStructure(businessType, ownership, investment, objectives, chatId, bot = null) {
        try {
            console.log(`⚖️ Analyzing legal structure: ${businessType}, Ownership: ${ownership}, Investment: ${investment}`);

            const prompt = `CAMBODIA LEGAL STRUCTURE OPTIMIZATION ANALYSIS

**Business Parameters:**
- Business Type: ${businessType}
- Desired Ownership: ${ownership}
- Investment Amount: ${investment}
- Business Objectives: ${objectives}

**Comprehensive Legal Structure Analysis:**

1. **OPTIMAL BUSINESS STRUCTURE RECOMMENDATION**
   - Best legal structure for ${businessType} business
   - Foreign ownership restrictions and compliance
   - Capital requirements and registration process
   - Tax implications and optimization strategies
   - Liability protection and risk management
   - Operational flexibility and future scalability

2. **REGISTRATION & SETUP REQUIREMENTS**
   - Step-by-step business registration process
   - Required documentation and certificates
   - Government approvals and licenses needed
   - Timeline and costs for complete setup
   - Professional services requirements (lawyer, accountant)
   - Banking setup and financial compliance

3. **TAX OPTIMIZATION STRATEGY**
   - Corporate tax obligations and rates (20% standard)
   - Available tax incentives and QIP benefits
   - VAT registration and compliance requirements
   - Withholding tax implications and planning
   - Personal tax obligations for foreign investors
   - Tax treaty benefits and optimization

4. **COMPLIANCE FRAMEWORK**
   - Annual compliance obligations and deadlines
   - Monthly reporting and tax requirements
   - Audit requirements and financial reporting
   - Labor law compliance and work permits
   - Environmental and sector-specific regulations
   - Ongoing maintenance and renewal requirements

5. **RISK ASSESSMENT & MITIGATION**
   - Legal and regulatory risks specific to structure
   - Contract enforcement and dispute resolution
   - Foreign ownership restrictions and changes
   - Property rights and asset protection
   - Corruption risks and compliance programs
   - Exit strategy and asset repatriation

6. **IMPLEMENTATION ROADMAP**
   - Priority actions and sequencing
   - Professional service provider selection
   - Documentation preparation and notarization
   - Government submission and follow-up
   - Banking and operational setup
   - Ongoing compliance and management

**Legal Context:**
- Foreign Ownership: Generally allowed with sector restrictions
- Corporate Tax Rate: 20% (incentives available)
- VAT Rate: 10% (registration required if turnover > 125M KHR)
- Business Registration: 2-8 weeks depending on structure
- Available Structures: Ltd, Plc, Branch, Representative, Joint Venture

**Business Structure Options:**
${Object.entries(this.businessStructures).map(([structure, details]) => 
    `• ${structure}: ${details.foreignOwnership}, Min Capital: ${details.minCapital}, Tax: ${details.taxation}`
).join('\n')}

**Provide specific legal structure recommendations with step-by-step implementation guidance.**`;

            const result = await executeEnhancedGPT5Command(
                prompt, 
                chatId, 
                bot,
                {
                    title: `⚖️ Cambodia Legal Structure Analysis`,
                    forceModel: 'gpt-5',
                    max_output_tokens: 12000,
                    reasoning_effort: 'high',
                    verbosity: 'high'
                }
            );

            return {
                success: true,
                analysis: result.response,
                businessType: businessType,
                ownership: ownership,
                investment: investment,
                recommendedStructure: this.getRecommendedStructure(businessType, ownership, investment),
                taxOptimization: this.getTaxOptimization(businessType, investment),
                complianceChecklist: this.getComplianceChecklist()
            };

        } catch (error) {
            console.error('❌ Legal structure analysis error:', error.message);
            throw error;
        }
    }

    async analyzePropertyLegal(propertyType, ownershipStructure, location, value, chatId, bot = null) {
        try {
            const prompt = `CAMBODIA PROPERTY LEGAL ANALYSIS

**Property Parameters:**
- Property Type: ${propertyType}
- Ownership Structure: ${ownershipStructure}
- Location: ${location}
- Property Value: ${value}

**Comprehensive Property Legal Analysis:**

1. **OWNERSHIP STRUCTURE ANALYSIS**
   - Legal ownership options for ${propertyType}
   - Foreign ownership restrictions and compliance
   - Optimal legal structure for property investment
   - Company setup requirements for property ownership
   - Nominee arrangements risks and alternatives
   - Long-term ownership sustainability

2. **LEGAL COMPLIANCE REQUIREMENTS**
   - Property registration and title verification
   - Due diligence process and documentation
   - Government approvals and permits required
   - Tax obligations and stamp duties
   - Building permits and construction compliance
   - Environmental clearances (if applicable)

3. **TRANSACTION STRUCTURE**
   - Purchase agreement terms and conditions
   - Payment structure and escrow arrangements
   - Title transfer process and documentation
   - Property inspection and verification
   - Insurance requirements and coverage
   - Closing procedures and timeline

4. **TAX IMPLICATIONS**
   - Property transfer taxes and stamp duties
   - Annual property tax obligations
   - Rental income tax treatment
   - Capital gains tax (future implementation)
   - VAT on property transactions (if applicable)
   - Tax optimization strategies

5. **RISK ASSESSMENT**
   - Title disputes and ownership risks
   - Legal protection and insurance options
   - Future law changes and grandfathering
   - Inheritance and succession planning
   - Exit strategy and sale restrictions
   - Enforcement and remedies available

6. **LEGAL PROTECTION STRATEGIES**
   - Asset protection and structuring
   - Insurance and risk mitigation
   - Legal documentation and agreements
   - Dispute resolution mechanisms
   - Regulatory compliance monitoring
   - Exit planning and succession

**Property Ownership Rules:**
- Land: Foreigners cannot own land directly
- Condos: Foreigners can own above ground floor (max 70% per building)
- Leases: Long-term leases available (50 years + extension)
- Companies: Local companies (51%+ Cambodian) can own land
- Structure: Foreigners can own structures on leased land

**Provide specific property legal recommendations with risk mitigation strategies.**`;

            const result = await executeEnhancedGPT5Command(
                prompt,
                chatId,
                bot,
                {
                    title: `🏠 Cambodia Property Legal Analysis`,
                    forceModel: 'gpt-5',
                    max_output_tokens: 10000,
                    reasoning_effort: 'high',
                    verbosity: 'high'
                }
            );

            return {
                success: true,
                analysis: result.response,
                propertyType: propertyType,
                ownershipStructure: ownershipStructure,
                location: location,
                value: value,
                ownershipOptions: this.getPropertyOwnershipOptions(propertyType),
                legalRisks: this.getPropertyLegalRisks(propertyType),
                complianceSteps: this.getPropertyComplianceSteps()
            };

        } catch (error) {
            console.error('❌ Property legal analysis error:', error.message);
            throw error;
        }
    }

    async analyzeTaxOptimization(businessStructure, income, activities, timeframe, chatId, bot = null) {
        try {
            const prompt = `CAMBODIA TAX OPTIMIZATION ANALYSIS

**Tax Optimization Parameters:**
- Business Structure: ${businessStructure}
- Annual Income: ${income}
- Business Activities: ${activities}
- Planning Timeframe: ${timeframe}

**Comprehensive Tax Optimization Analysis:**

1. **CURRENT TAX ASSESSMENT**
   - Corporate income tax obligations (20% standard)
   - VAT requirements and optimization (10% rate)
   - Withholding tax exposures (14% rates)
   - Personal income tax for foreign investors
   - Other taxes and duties applicable
   - Current effective tax rate calculation

2. **AVAILABLE TAX INCENTIVES**
   - Qualified Investment Project (QIP) benefits
   - Special Economic Zone (SEZ) advantages
   - Sector-specific tax incentives
   - Export promotion incentives
   - Investment threshold benefits
   - Tax holidays and rate reductions

3. **OPTIMIZATION STRATEGIES**
   - Business structure optimization
   - Income and expense timing strategies
   - Transfer pricing and related party transactions
   - Treaty benefits and international structures
   - Investment incentive application process
   - Loss utilization and carry-forward planning

4. **COMPLIANCE OPTIMIZATION**
   - Filing strategy and deadline management
   - Documentation and record-keeping
   - Tax provision and cash flow planning
   - Audit defense and preparation
   - Penalty avoidance and risk management
   - Professional service coordination

5. **FUTURE PLANNING**
   - Tax law changes and impact assessment
   - Business expansion tax implications
   - Exit strategy tax planning
   - Succession and inheritance planning
   - International tax coordination
   - Ongoing optimization opportunities

6. **IMPLEMENTATION ROADMAP**
   - Immediate tax optimization actions
   - Incentive application process and timeline
   - Documentation and compliance requirements
   - Professional service engagement
   - Monitoring and review schedule
   - Performance measurement and adjustment

**Tax Framework:**
- Corporate Tax: 20% (QIP: 0% for 6 years, then 50% for 3 years)
- VAT: 10% (registration required if turnover > 125M KHR)
- Withholding Tax: 14% on dividends, interest, royalties
- Personal Tax: 0-20% progressive for residents, 20% flat for non-residents
- Minimum Tax: 1% of turnover (alternative minimum)

**Available Incentives:**
- QIP: Up to 9 years of corporate tax benefits
- SEZ: Streamlined procedures and infrastructure
- Export Incentives: Various duty exemptions
- Investment Thresholds: Enhanced benefits for larger investments

**Provide specific tax optimization recommendations with quantified savings estimates.**`;

            const result = await executeEnhancedGPT5Command(
                prompt,
                chatId,
                bot,
                {
                    title: `💰 Cambodia Tax Optimization Analysis`,
                    forceModel: 'gpt-5',
                    max_output_tokens: 10000,
                    reasoning_effort: 'high',
                    verbosity: 'high'
                }
            );

            return {
                success: true,
                analysis: result.response,
                businessStructure: businessStructure,
                income: income,
                activities: activities,
                timeframe: timeframe,
                currentTaxBurden: this.calculateTaxBurden(businessStructure, income),
                availableIncentives: this.getAvailableIncentives(activities, income),
                optimizationOpportunities: this.getOptimizationOpportunities(businessStructure)
            };

        } catch (error) {
            console.error('❌ Tax optimization analysis error:', error.message);
            throw error;
        }
    }

    // 📊 HELPER FUNCTIONS

    getRecommendedStructure(businessType, ownership, investment) {
        const investmentAmount = parseInt(investment.replace(/[^\d]/g, '')) || 0;
        
        if (ownership.includes('100%') || ownership.includes('foreign')) {
            if (investmentAmount >= 300000) {
                return this.businessStructures['Public Limited Company (Plc.)'];
            } else if (investmentAmount >= 1000) {
                return this.businessStructures['Private Limited Company (Ltd.)'];
            } else {
                return this.businessStructures['Representative Office'];
            }
        } else if (ownership.includes('partnership') || ownership.includes('joint')) {
            return this.businessStructures['Joint Venture'];
        } else {
            return this.businessStructures['Private Limited Company (Ltd.)'];
        }
    }

    getTaxOptimization(businessType, investment) {
        const investmentAmount = parseInt(investment.replace(/[^\d]/g, '')) || 0;
        
        const optimization = {
            corporateTax: '20% standard rate',
            incentives: [],
            strategies: []
        };

        if (investmentAmount >= 500000 || businessType.includes('manufacturing')) {
            optimization.incentives.push('QIP eligibility - 0% tax for 6 years + 50% for 3 years');
        }
        
        if (businessType.includes('export')) {
            optimization.incentives.push('Export incentives - duty exemptions');
        }
        
        optimization.strategies.push('VAT optimization through proper structuring');
        optimization.strategies.push('Withholding tax management through treaties');
        
        return optimization;
    }

    getComplianceChecklist() {
        return {
            setup: [
                'Business registration with MoC',
                'Tax registration with GDT', 
                'VAT registration (if required)',
                'Patent tax registration',
                'Social security registration',
                'Banking account opening',
                'Work permit applications'
            ],
            ongoing: this.complianceRequirements['Annual Obligations'].concat(
                this.complianceRequirements['Monthly Obligations']
            )
        };
    }

    getPropertyOwnershipOptions(propertyType) {
        if (propertyType.toLowerCase().includes('condo')) {
            return this.propertyOwnership['Condominium Ownership'];
        } else if (propertyType.toLowerCase().includes('land')) {
            return this.propertyOwnership['Land Ownership'];
        } else {
            return this.propertyOwnership['Borey/Villa Ownership'];
        }
    }

    getPropertyLegalRisks(propertyType) {
        return {
            titleRisk: 'Medium - Due diligence essential',
            ownershipRisk: propertyType.toLowerCase().includes('land') ? 'High - Foreign restrictions' : 'Medium',
            regulatoryRisk: 'Medium - Law changes possible',
            enforcementRisk: 'Medium - Court system developing',
            exitRisk: 'Medium - Liquidity considerations'
        };
    }

    getPropertyComplianceSteps() {
        return [
            'Title verification and due diligence',
            'Legal structure setup (if required)',
            'Purchase agreement negotiation',
            'Property inspection and survey',
            'Government approvals and permits',
            'Tax payments and registrations',
            'Title transfer and registration',
            'Insurance and protection setup'
        ];
    }

    calculateTaxBurden(businessStructure, income) {
        const incomeAmount = parseInt(income.replace(/[^\d]/g, '')) || 0;
        
        let corporateTax = incomeAmount * 0.20; // 20% standard rate
        let minimumTax = incomeAmount * 0.01; // 1% minimum tax
        let effectiveRate = 20;
        
        if (businessStructure.includes('QIP')) {
            corporateTax = 0; // Tax holiday
            effectiveRate = 0;
        }
        
        return {
            corporateTax: corporateTax,
            minimumTax: minimumTax,
            actualTax: Math.max(corporateTax, minimumTax),
            effectiveRate: effectiveRate,
            vatLiability: 'Depends on turnover and sales'
        };
    }

    getAvailableIncentives(activities, income) {
        const incentives = [];
        const incomeAmount = parseInt(income.replace(/[^\d]/g, '')) || 0;
        
        if (activities.includes('manufacturing') || activities.includes('export') || incomeAmount >= 500000) {
            incentives.push(this.investmentIncentives['Qualified Investment Project (QIP)']);
        }
        
        if (activities.includes('manufacturing') || activities.includes('logistics')) {
            incentives.push(this.investmentIncentives['Special Economic Zones (SEZ)']);
        }
        
        return incentives;
    }

    getOptimizationOpportunities(businessStructure) {
        return [
            'QIP application for tax holidays',
            'SEZ location for operational benefits',
            'Treaty shopping for reduced withholding tax',
            'Transfer pricing optimization',
            'Timing strategies for income and expenses',
            'Loss utilization and planning',
            'VAT optimization through structure',
            'International holding structure consideration'
        ];
    }

    // 🎯 QUICK ACCESS METHODS

    async quickLegalAnalysis(message, chatId, bot = null) {
        const businessType = this.extractBusinessType(message) || 'General Business';
        const ownership = this.extractOwnership(message) || '100% Foreign';
        const investment = this.extractInvestment(message) || '$100,000';
        const objectives = this.extractObjectives(message) || 'Wealth Building';

        return await this.analyzeLegalStructure(businessType, ownership, investment, objectives, chatId, bot);
    }

    extractBusinessType(message) {
        const types = ['manufacturing', 'real estate', 'tourism', 'restaurant', 'import', 'export', 'technology', 'consulting'];
        return types.find(type => message.toLowerCase().includes(type));
    }

    extractOwnership(message) {
        if (message.toLowerCase().includes('100%') || message.toLowerCase().includes('fully foreign')) {
            return '100% Foreign';
        } else if (message.toLowerCase().includes('joint') || message.toLowerCase().includes('partnership')) {
            return 'Joint Venture';
        } else if (message.toLowerCase().includes('local') || message.toLowerCase().includes('cambodian')) {
            return 'Local Partnership Required';
        }
        return null;
    }

    extractInvestment(message) {
        const investmentMatch = message.match(/\$[\d,]+|\d+k|\d+\s*million|USD\s*[\d,]+/i);
        return investmentMatch ? investmentMatch[0] : null;
    }

    extractObjectives(message) {
        const objectives = ['wealth building', 'business expansion', 'tax optimization', 'asset protection'];
        return objectives.find(obj => message.toLowerCase().includes(obj));
    }

    // 📋 LEGAL INTELLIGENCE REPORTS

    async getRegulatoryUpdate(sector, chatId, bot = null) {
        const prompt = `CAMBODIA REGULATORY UPDATE ANALYSIS

**Sector Focus: ${sector}**

**Comprehensive Regulatory Intelligence:**

1. **RECENT REGULATORY CHANGES**
   - New laws and regulations affecting ${sector}
   - Implementation timelines and effective dates
   - Compliance requirements and obligations
   - Penalties for non-compliance
   - Transition periods and grandfathering provisions
   - Government guidance and interpretations

2. **UPCOMING REGULATORY DEVELOPMENTS**
   - Proposed legislation and draft regulations
   - Public consultation processes and timelines
   - Expected implementation dates
   - Industry feedback and likely modifications
   - Government priorities and policy direction
   - International standard alignment efforts

3. **SECTOR-SPECIFIC COMPLIANCE**
   - ${sector}-specific regulatory requirements
   - Licensing and permit obligations
   - Operational compliance standards
   - Reporting and disclosure requirements
   - Professional qualification requirements
   - Environmental and safety regulations

4. **ENFORCEMENT TRENDS**
   - Regulatory enforcement patterns and priorities
   - Penalty levels and enforcement actions
   - Compliance audit frequency and focus areas
   - Government agency coordination
   - International cooperation and standards
   - Best practice compliance approaches

5. **BUSINESS IMPACT ASSESSMENT**
   - Cost of compliance and operational impact
   - Competitive implications and market effects
   - Investment decision considerations
   - Risk mitigation strategies and approaches
   - Opportunity identification and capture
   - Strategic positioning and adaptation

6. **COMPLIANCE STRATEGY RECOMMENDATIONS**
   - Immediate compliance actions required
   - Medium-term compliance planning
   - Regulatory relationship management
   - Professional service requirements
   - Monitoring and early warning systems
   - Contingency planning and risk management

**Regulatory Context:**
- Government Priority: Economic development with regulation
- Compliance Culture: Developing but increasingly important
- Enforcement Trend: Strengthening oversight and penalties
- International Alignment: ASEAN and global standards integration
- Business Environment: Balancing growth with governance

**Provide actionable regulatory intelligence with compliance guidance.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: `📋 Cambodia Regulatory Update - ${sector}`,
                forceModel: 'gpt-5-mini',
                max_output_tokens: 8000,
                reasoning_effort: 'medium',
                verbosity: 'high'
            }
        );

        return result;
    }

    async getContractAnalysis(contractType, parties, value, chatId, bot = null) {
        const prompt = `CAMBODIA CONTRACT LEGAL ANALYSIS

**Contract Parameters:**
- Contract Type: ${contractType}
- Parties: ${parties}
- Contract Value: ${value}

**Comprehensive Contract Analysis:**

1. **LEGAL FRAMEWORK ANALYSIS**
   - Applicable laws and regulations for ${contractType}
   - Contract formation requirements and validity
   - Mandatory contract terms and provisions
   - Prohibited clauses and restrictions
   - Government approvals and registrations required
   - Notarization and authentication requirements

2. **RISK ASSESSMENT**
   - Contract enforceability and court system
   - Dispute resolution mechanisms and options
   - Arbitration clauses and international options
   - Force majeure and extraordinary circumstances
   - Breach remedies and damage calculations
      - Force majeure and extraordinary circumstances
   - Breach remedies and damage calculations
   - Termination rights and procedures

3. **PROTECTION STRATEGIES**
   - Asset protection and security arrangements
   - Performance guarantees and bonds
   - Insurance requirements and coverage
   - Escrow and payment protection mechanisms
   - Intellectual property protection clauses
   - Confidentiality and non-disclosure provisions

4. **COMPLIANCE REQUIREMENTS**
   - Regulatory approvals and permits needed
   - Tax implications and withholding obligations
   - Foreign exchange and repatriation rules
   - Labor law compliance (if applicable)
   - Environmental compliance requirements
   - Anti-corruption and ethics compliance

5. **NEGOTIATION STRATEGY**
   - Key terms and conditions optimization
   - Risk allocation and mitigation clauses
   - Payment terms and currency considerations
   - Performance milestones and deliverables
   - Amendment and modification procedures
   - Exit strategies and termination provisions

6. **IMPLEMENTATION RECOMMENDATIONS**
   - Contract execution and signing process
   - Registration and filing requirements
   - Monitoring and compliance framework
   - Relationship management and communication
   - Performance measurement and review
   - Dispute prevention and early resolution

**Contract Legal Context:**
- Court System: Developing commercial courts
- Arbitration: Available through Cambodia Commercial Arbitration Centre
- International Arbitration: Singapore/Hong Kong often preferred
- Contract Registration: Required for certain contract types
- Foreign Participation: Generally allowed with restrictions
- Enforcement: Improving but still developing

**Provide specific contract optimization recommendations with risk mitigation strategies.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: `📄 Cambodia Contract Legal Analysis`,
                forceModel: 'gpt-5-mini',
                max_output_tokens: 8000,
                reasoning_effort: 'medium',
                verbosity: 'high'
            }
        );

        return result;
    }

    // 🛡️ COMPLIANCE MANAGEMENT

    async getComplianceAudit(businessType, structure, timeframe, chatId, bot = null) {
        const prompt = `CAMBODIA COMPLIANCE AUDIT ANALYSIS

**Audit Parameters:**
- Business Type: ${businessType}
- Legal Structure: ${structure}
- Audit Period: ${timeframe}

**Comprehensive Compliance Audit:**

1. **CORPORATE COMPLIANCE REVIEW**
   - Business registration status and renewals
   - Corporate governance and documentation
   - Shareholder and director compliance
   - Annual filing and reporting obligations
   - Board resolutions and corporate actions
   - Record keeping and documentation standards

2. **TAX COMPLIANCE ASSESSMENT**
   - Corporate income tax filings and payments
   - VAT registration and return compliance
   - Withholding tax obligations and filings
   - Monthly and annual tax compliance
   - Tax incentive compliance and reporting
   - Audit defense preparedness and documentation

3. **REGULATORY COMPLIANCE EVALUATION**
   - Sector-specific licensing and permits
   - Government approvals and renewals
   - Environmental compliance and permits
   - Labor law compliance and work permits
   - Foreign investment compliance
   - Import/export compliance (if applicable)

4. **FINANCIAL COMPLIANCE REVIEW**
   - Banking compliance and reporting
   - Foreign exchange compliance
   - Anti-money laundering compliance
   - Financial reporting standards compliance
   - Audit requirements and external auditor
   - Internal controls and procedures

5. **OPERATIONAL COMPLIANCE CHECK**
   - Operational licenses and permits
   - Health and safety compliance
   - Quality standards and certifications
   - Contract compliance and management
   - Intellectual property compliance
   - Data protection and privacy compliance

6. **COMPLIANCE IMPROVEMENT PLAN**
   - Priority compliance gaps and remediation
   - Implementation timeline and responsibilities
   - Professional service requirements
   - Cost estimates and budget planning
   - Monitoring and review procedures
   - Risk mitigation and contingency planning

**Compliance Framework:**
- Annual Obligations: 8+ requirements including tax returns, audits
- Monthly Obligations: 8+ requirements including VAT, withholding tax
- Ad-hoc Obligations: Transaction and event-specific requirements
- Regulatory Bodies: Multiple agencies with overlapping jurisdiction
- Penalties: Administrative and criminal penalties for non-compliance
- Professional Support: Legal and accounting services typically required

**Provide specific compliance gap analysis with remediation recommendations.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: `🛡️ Cambodia Compliance Audit`,
                forceModel: 'gpt-5',
                max_output_tokens: 9000,
                reasoning_effort: 'high',
                verbosity: 'high'
            }
        );

        return result;
    }

    // 🔍 SPECIALIZED LEGAL ANALYSIS

    async getIntellectualPropertyAnalysis(ipType, protection, enforcement, chatId, bot = null) {
        const prompt = `CAMBODIA INTELLECTUAL PROPERTY ANALYSIS

**IP Parameters:**
- IP Type: ${ipType}
- Protection Strategy: ${protection}
- Enforcement Requirements: ${enforcement}

**Comprehensive IP Analysis:**

1. **IP PROTECTION LANDSCAPE**
   - Cambodia IP law framework and WIPO compliance
   - ${ipType} protection availability and scope
   - Registration process and requirements
   - Protection duration and renewal procedures
   - International treaties and reciprocity
   - Enforcement mechanisms and remedies

2. **REGISTRATION STRATEGY**
   - Optimal registration approach for ${ipType}
   - Priority and filing strategy considerations
   - Documentation and evidence requirements
   - Cost estimates and timeline projections
   - Professional service requirements
   - International filing strategy coordination

3. **PROTECTION OPTIMIZATION**
   - Comprehensive protection strategy
   - Trade secret vs registration considerations
   - Defensive and offensive IP strategies
   - Portfolio management and maintenance
   - Licensing and commercialization options
   - Exit strategy and asset monetization

4. **ENFORCEMENT FRAMEWORK**
   - Available enforcement mechanisms
   - Civil and criminal enforcement options
   - Customs enforcement and border measures
   - Alternative dispute resolution options
   - International enforcement coordination
   - Cost-benefit analysis of enforcement actions

5. **COMMERCIAL EXPLOITATION**
   - Licensing and technology transfer opportunities
   - Joint venture and partnership structures
   - Valuation and monetization strategies
   - Tax implications of IP transactions
   - Foreign investment and IP considerations
   - Exit planning and asset optimization

6. **STRATEGIC RECOMMENDATIONS**
   - Priority actions and implementation timeline
   - Budget planning and cost optimization
   - Professional service provider selection
   - Risk mitigation and insurance considerations
   - Monitoring and enforcement procedures
   - Portfolio review and optimization schedule

**IP Legal Context:**
- IP Law: Comprehensive framework aligned with international standards
- Enforcement: Improving but still developing
- Registration: Mandatory for most IP types
- International Treaties: WIPO member, Paris Convention
- Commercial Courts: Specialized IP courts available
- Professional Services: Qualified IP attorneys and agents available

**Provide actionable IP strategy with protection and enforcement recommendations.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: `🔐 Cambodia IP Analysis - ${ipType}`,
                forceModel: 'gpt-5-mini',
                max_output_tokens: 8000,
                reasoning_effort: 'medium',
                verbosity: 'high'
            }
        );

        return result;
    }

    // 🌍 INTERNATIONAL LEGAL COORDINATION

    async getInternationalStructuring(countries, objectives, assets, chatId, bot = null) {
        const prompt = `CAMBODIA INTERNATIONAL LEGAL STRUCTURING

**Structuring Parameters:**
- Countries Involved: ${countries}
- Business Objectives: ${objectives}
- Asset Types: ${assets}

**Comprehensive International Structuring Analysis:**

1. **CROSS-BORDER STRUCTURE OPTIMIZATION**
   - Optimal international holding structure
   - Tax treaty benefits and optimization
   - Withholding tax minimization strategies
   - Transfer pricing considerations and compliance
   - Substance requirements and economic reality
   - Regulatory compliance across jurisdictions

2. **CAMBODIA INTEGRATION STRATEGY**
   - Cambodia entity role in international structure
   - Optimal Cambodia legal form and capitalization
   - Local compliance and regulatory requirements
   - Foreign investment approvals and restrictions
   - Repatriation and dividend distribution strategies
   - Exit strategy and asset monetization planning

3. **TAX OPTIMIZATION FRAMEWORK**
   - International tax planning and coordination
   - Double taxation treaty utilization
   - Withholding tax reduction and elimination
   - Transfer pricing documentation and compliance
   - Controlled foreign company rules navigation
   - Base erosion and profit shifting considerations

4. **RISK MANAGEMENT STRATEGY**
   - Political and regulatory risk mitigation
   - Currency and foreign exchange risk management
   - Legal and enforcement risk assessment
   - Operational and business risk considerations
   - Compliance and reputational risk management
   - Insurance and protection mechanisms

5. **OPERATIONAL INTEGRATION**
   - Management and control considerations
   - Operational coordination and efficiency
   - Banking and treasury management
   - Reporting and compliance coordination
   - Professional service coordination
   - Technology and system integration

6. **IMPLEMENTATION ROADMAP**
   - Structure implementation sequence and timeline
   - Professional service requirements and selection
   - Regulatory approvals and documentation
   - Capitalization and funding strategies
   - Ongoing management and maintenance
   - Performance monitoring and optimization

**International Context:**
- Tax Treaties: Limited but growing network
- ASEAN Integration: Increasing coordination and benefits
- OECD Standards: Gradual adoption and implementation
- Regulatory Coordination: Improving but still developing
- Professional Services: International and local coordination required
- Compliance Complexity: Multi-jurisdictional requirements

**Provide specific international structuring recommendations with implementation guidance.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: `🌍 International Legal Structuring with Cambodia`,
                forceModel: 'gpt-5',
                max_output_tokens: 10000,
                reasoning_effort: 'high',
                verbosity: 'high'
            }
        );

        return result;
    }

    // 📊 DATA ACCESS AND UTILITIES

    getBusinessStructures() {
        return this.businessStructures;
    }

    getForeignOwnershipRules() {
        return this.foreignOwnershipRules;
    }

    getTaxFramework() {
        return this.taxFramework;
    }

    getPropertyOwnership() {
        return this.propertyOwnership;
    }

    getComplianceRequirements() {
        return this.complianceRequirements;
    }

    getInvestmentIncentives() {
        return this.investmentIncentives;
    }

    getLegalRisks() {
        return this.legalRisks;
    }

    // 🎯 LEGAL HEALTH CHECK

    async getLegalHealthCheck(businessStructure, operations, compliance, chatId, bot = null) {
        const prompt = `CAMBODIA LEGAL HEALTH CHECK

**Health Check Parameters:**
- Business Structure: ${businessStructure}
- Operations: ${operations}
- Compliance Status: ${compliance}

**Comprehensive Legal Health Assessment:**

1. **STRUCTURAL HEALTH EVALUATION**
   - Current legal structure adequacy and optimization
   - Corporate governance and documentation status
   - Ownership structure compliance and protection
   - Operational license and permit currency
   - Banking and financial compliance status
   - Insurance and risk protection adequacy

2. **COMPLIANCE HEALTH REVIEW**
   - Tax compliance status and currency
   - Regulatory compliance and permit status
   - Labor law compliance and work permit status
   - Environmental compliance and permit status
   - Contract compliance and management status
   - Record keeping and documentation adequacy

3. **RISK EXPOSURE ASSESSMENT**
   - Legal and regulatory risk exposure
   - Tax and financial risk assessment
   - Operational and business risk evaluation
   - Reputational and compliance risk analysis
   - Political and policy risk consideration
   - Exit and asset protection risk review

4. **OPTIMIZATION OPPORTUNITIES**
   - Structure optimization and enhancement
   - Tax optimization and incentive opportunities
   - Compliance efficiency and cost reduction
   - Risk mitigation and insurance optimization
   - Operational efficiency and legal streamlining
   - Professional service optimization

5. **REMEDIATION PRIORITIES**
   - Critical issues requiring immediate attention
   - Medium-term improvements and enhancements
   - Long-term optimization and planning
   - Cost estimates and budget requirements
   - Professional service requirements
   - Timeline and implementation planning

6. **STRATEGIC RECOMMENDATIONS**
   - Priority actions and implementation sequence
   - Investment in legal infrastructure and systems
   - Professional relationship development
   - Monitoring and review procedures
   - Contingency planning and risk management
   - Performance measurement and optimization

**Legal Health Indicators:**
- Green: Fully compliant and optimized
- Yellow: Generally compliant with optimization opportunities
- Red: Compliance gaps requiring immediate attention
- Critical: Legal violations requiring urgent remediation

**Provide comprehensive legal health assessment with priority recommendations.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: `🏥 Cambodia Legal Health Check`,
                forceModel: 'gpt-5',
                max_output_tokens: 9000,
                reasoning_effort: 'high',
                verbosity: 'high'
            }
        );

        return result;
    }
}

// Export singleton instance
const cambodiaLegal = new CambodiaLegalRegulatory();

module.exports = {
    // Main analysis functions
    analyzeLegalStructure: (businessType, ownership, investment, objectives, chatId, bot) => 
        cambodiaLegal.analyzeLegalStructure(businessType, ownership, investment, objectives, chatId, bot),
    
    analyzePropertyLegal: (propertyType, ownershipStructure, location, value, chatId, bot) => 
        cambodiaLegal.analyzePropertyLegal(propertyType, ownershipStructure, location, value, chatId, bot),
    
    analyzeTaxOptimization: (businessStructure, income, activities, timeframe, chatId, bot) => 
        cambodiaLegal.analyzeTaxOptimization(businessStructure, income, activities, timeframe, chatId, bot),

    // Quick access methods
    quickLegalAnalysis: (message, chatId, bot) => 
        cambodiaLegal.quickLegalAnalysis(message, chatId, bot),

    // Legal intelligence reports
    getRegulatoryUpdate: (sector, chatId, bot) => 
        cambodiaLegal.getRegulatoryUpdate(sector, chatId, bot),
    
    getContractAnalysis: (contractType, parties, value, chatId, bot) => 
        cambodiaLegal.getContractAnalysis(contractType, parties, value, chatId, bot),
    
    getComplianceAudit: (businessType, structure, timeframe, chatId, bot) => 
        cambodiaLegal.getComplianceAudit(businessType, structure, timeframe, chatId, bot),

    // Specialized legal analysis
    getIntellectualPropertyAnalysis: (ipType, protection, enforcement, chatId, bot) => 
        cambodiaLegal.getIntellectualPropertyAnalysis(ipType, protection, enforcement, chatId, bot),
    
    getInternationalStructuring: (countries, objectives, assets, chatId, bot) => 
        cambodiaLegal.getInternationalStructuring(countries, objectives, assets, chatId, bot),
    
    getLegalHealthCheck: (businessStructure, operations, compliance, chatId, bot) => 
        cambodiaLegal.getLegalHealthCheck(businessStructure, operations, compliance, chatId, bot),

    // Data access functions
    getBusinessStructures: () => cambodiaLegal.getBusinessStructures(),
    getForeignOwnershipRules: () => cambodiaLegal.getForeignOwnershipRules(),
    getTaxFramework: () => cambodiaLegal.getTaxFramework(),
    getPropertyOwnership: () => cambodiaLegal.getPropertyOwnership(),
    getComplianceRequirements: () => cambodiaLegal.getComplianceRequirements(),
    getInvestmentIncentives: () => cambodiaLegal.getInvestmentIncentives(),
    getLegalRisks: () => cambodiaLegal.getLegalRisks(),

    // Export class for advanced usage
    CambodiaLegalRegulatory: cambodiaLegal
};

console.log('⚖️ Cambodia Legal & Regulatory Intelligence Module loaded');
console.log('🏢 Features: Business structures, property ownership, tax optimization, compliance');
console.log('📋 Structures: Ltd, Plc, Branch, Representative, Joint Venture options');
console.log('💰 Tax: 20% corporate (QIP: 0% for 6 years), 10% VAT, optimization strategies');
console.log('🏠 Property: Foreign ownership rules, condo rights, land lease structures');
console.log('🛡️ Compliance: Annual, monthly, ad-hoc obligations with audit framework');
console.log('⚖️ Legal Protection: Risk mitigation, contract optimization, IP strategy');
console.log('🇰🇭 Cambodia legal ecosystem mastery with GPT-5 integration');
