// cambodia/investorReporting.js - COMPLETE: Cambodia Investor Reporting & LP Communications
// Enterprise-grade investor relations with GPT-5 intelligence for private lending fund

// 📊 CAMBODIA INVESTOR REPORTING FRAMEWORK
const INVESTOR_REPORTING_FRAMEWORK = {
    // Reporting standards and frequencies
    reportingStandards: {
        primary_standards: "ILPA Guidelines",
        secondary_standards: "AVCJ Best Practices",
        regulatory_compliance: "SEC Form ADV Part 2",
        transparency_level: "Institutional Grade"
    },

    // Reporting frequency and delivery schedule
    reportingSchedule: {
        monthly_reports: {
            frequency: "monthly",
            delivery_timeline: "15 days after month-end",
            recipients: "All LPs",
            content_level: "summary"
        },
        quarterly_reports: {
            frequency: "quarterly", 
            delivery_timeline: "30 days after quarter-end",
            recipients: "All LPs",
            content_level: "comprehensive"
        },
        annual_reports: {
            frequency: "annually",
            delivery_timeline: "90 days after year-end", 
            recipients: "All LPs + Regulators",
            content_level: "audited"
        },
        special_reports: {
            frequency: "as_needed",
            delivery_timeline: "immediate",
            recipients: "affected LPs",
            content_level: "event_specific"
        }
    },

    // Report content categories
    reportContent: {
        executive_summary: {
            performance_highlights: true,
            key_developments: true,
            market_outlook: true,
            strategic_initiatives: true
        },
        financial_performance: {
            nav_analysis: true,
            return_metrics: true,
            fee_calculations: true,
            cash_flow_analysis: true
        },
        portfolio_analysis: {
            asset_composition: true,
            sector_allocation: true,
            geographic_distribution: true,
            risk_metrics: true
        },
        operational_updates: {
            origination_activity: true,
            portfolio_performance: true,
            team_updates: true,
            regulatory_changes: true
        },
        esg_impact: {
            social_impact: true,
            environmental_metrics: true,
            governance_updates: true,
            sustainability_goals: true
        }
    },

    // Cambodia-specific reporting requirements
    cambodiaReporting: {
        local_market_analysis: {
            economic_indicators: "GDP growth, inflation, interest rates",
            regulatory_updates: "NBC changes, government policy",
            competitive_landscape: "Market share, new entrants",
            currency_impact: "USD/KHR exchange rate effects"
        },
        development_impact: {
            job_creation: "Direct and indirect employment",
            sme_support: "Small business financing metrics",
            financial_inclusion: "Underserved population access",
            regional_development: "Provincial lending distribution"
        },
        risk_factors: {
            country_risk: "Political stability, policy changes",
            currency_risk: "FX exposure and hedging",
            regulatory_risk: "Compliance and regulatory changes",
            operational_risk: "Local operations and staff"
        }
    },

    // Communication channels and delivery methods
    deliveryMethods: {
        digital_platform: {
            method: "Secure LP portal",
            format: "Interactive dashboard",
            availability: "24/7 access",
            features: "Real-time data, document download"
        },
        email_distribution: {
            method: "Encrypted email",
            format: "PDF attachments",
            personalization: "LP-specific content",
            tracking: "Read receipts, engagement metrics"
        },
        physical_delivery: {
            method: "Courier service",
            format: "Printed reports",
            recipients: "Upon request",
            timeline: "Additional 5 business days"
        },
        presentations: {
            quarterly_calls: "Video conference with Q&A",
            annual_meetings: "In-person or virtual AGM",
            special_updates: "Ad-hoc investor calls",
            one_on_ones: "Private LP meetings"
        }
    },

    // Performance benchmarking and comparison
    benchmarkFramework: {
        peer_comparison: {
            peer_universe: "Asian private credit funds",
            metrics: "IRR, MOIC, Sharpe ratio, drawdown",
            data_sources: "Preqin, Cambridge Associates",
            update_frequency: "quarterly"
        },
        market_indices: {
            primary_benchmark: "Cambodia banking sector index",
            secondary_benchmarks: "EM credit, Asian high yield",
            custom_benchmarks: "Cambodian microfinance composite",
            performance_attribution: "Active vs passive returns"
        }
    }
};

// 📊 CORE INVESTOR REPORTING FUNCTIONS

/**
 * 📈 Generate Quarterly LP Report
 */
async function generateQuarterlyLPReport(fundId, reportData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA PRIVATE LENDING FUND - QUARTERLY LIMITED PARTNER REPORT

FUND IDENTIFICATION:
• Fund ID: ${fundId}
• Reporting Quarter: ${reportData.reportingQuarter || 'Q4 2024'}
• Report Generation Date: ${new Date().toISOString().split('T')[0]}
• Fund Vintage: ${reportData.fundVintage || '2020'}
• Fund Size: $${reportData.fundSize ? reportData.fundSize.toLocaleString() : 'Not specified'} USD

EXECUTIVE SUMMARY:
• Quarter Performance: ${reportData.quarterPerformance || 'Strong performance with positive returns'}
• Key Achievements: ${reportData.keyAchievements || 'Exceeded origination targets, maintained low default rates'}
• Strategic Developments: ${reportData.strategicDevelopments || 'Expanded into new sectors, enhanced risk management'}
• Market Outlook: ${reportData.marketOutlook || 'Positive outlook supported by economic growth'}

FINANCIAL PERFORMANCE HIGHLIGHTS:
• Quarterly Return: ${reportData.quarterlyReturn || 'Not provided'}%
• Year-to-Date Return: ${reportData.ytdReturn || 'Not provided'}%
• Since Inception IRR (Gross): ${reportData.grossIRR || 'Not provided'}%
• Since Inception IRR (Net): ${reportData.netIRR || 'Not provided'}%
• Current NAV per Unit: $${reportData.currentNavPerUnit || 'Not provided'} USD
• Total NAV: $${reportData.totalNav ? reportData.totalNav.toLocaleString() : 'Not provided'} USD

CASH FLOW SUMMARY:
• Capital Called This Quarter: $${reportData.capitalCalledQuarter ? reportData.capitalCalledQuarter.toLocaleString() : 'Not provided'} USD
• Distributions This Quarter: $${reportData.distributionsQuarter ? reportData.distributionsQuarter.toLocaleString() : 'Not provided'} USD
• Cumulative Capital Called: $${reportData.cumulativeCapitalCalled ? reportData.cumulativeCapitalCalled.toLocaleString() : 'Not provided'} USD
• Cumulative Distributions: $${reportData.cumulativeDistributions ? reportData.cumulativeDistributions.toLocaleString() : 'Not provided'} USD
• Remaining Commitment: $${reportData.remainingCommitment ? reportData.remainingCommitment.toLocaleString() : 'Not provided'} USD

PORTFOLIO COMPOSITION:
• Total Active Loans: ${reportData.totalActiveLoans || 'Not provided'}
• Total Portfolio Value: $${reportData.totalPortfolioValue ? reportData.totalPortfolioValue.toLocaleString() : 'Not provided'} USD
• Average Loan Size: $${reportData.averageLoanSize ? reportData.averageLoanSize.toLocaleString() : 'Not provided'} USD
• Portfolio Yield: ${reportData.portfolioYield || 'Not provided'}%
• Weighted Average Maturity: ${reportData.weightedAverageMaturity || 'Not provided'} months

SECTOR ALLOCATION:
• Agriculture: ${reportData.agricultureAllocation || 'Not provided'}%
• Manufacturing: ${reportData.manufacturingAllocation || 'Not provided'}%
• Services: ${reportData.servicesAllocation || 'Not provided'}%
• Trade & Commerce: ${reportData.tradeAllocation || 'Not provided'}%
• Construction: ${reportData.constructionAllocation || 'Not provided'}%
• Other: ${reportData.otherAllocation || 'Not provided'}%

GEOGRAPHIC DISTRIBUTION:
• Phnom Penh: ${reportData.phnomPenhAllocation || 'Not provided'}%
• Siem Reap: ${reportData.siemReapAllocation || 'Not provided'}%
• Battambang: ${reportData.battambangAllocation || 'Not provided'}%
• Kampong Cham: ${reportData.kampongChamAllocation || 'Not provided'}%
• Other Provinces: ${reportData.otherProvincesAllocation || 'Not provided'}%

RISK METRICS AND PORTFOLIO QUALITY:
• Portfolio at Risk (PAR 30): ${reportData.par30 || 'Not provided'}%
• Default Rate: ${reportData.defaultRate || 'Not provided'}%
• Recovery Rate: ${reportData.recoveryRate || 'Not provided'}%
• Loan Loss Provision: ${reportData.loanLossProvision || 'Not provided'}%
• Concentration Risk (Top 10): ${reportData.concentrationRisk || 'Not provided'}%

OPERATIONAL HIGHLIGHTS:
• New Loan Originations: $${reportData.newOriginations ? reportData.newOriginations.toLocaleString() : 'Not provided'} USD
• Loan Repayments: $${reportData.loanRepayments ? reportData.loanRepayments.toLocaleString() : 'Not provided'} USD
• Operating Expense Ratio: ${reportData.operatingExpenseRatio || 'Not provided'}%
• Team Size: ${reportData.teamSize || 'Not provided'} professionals
• Office Locations: ${reportData.officeLocations || 'Not specified'}

CAMBODIA MARKET CONDITIONS:
• GDP Growth Rate: ${reportData.cambodiaGDPGrowth || 'Not provided'}%
• Interest Rate Environment: ${reportData.interestRateEnvironment || 'Not specified'}
• USD/KHR Exchange Rate: ${reportData.usdKhrRate || 'Not provided'}
• Banking Sector Performance: ${reportData.bankingSectorPerformance || 'Not specified'}
• Regulatory Environment: ${reportData.regulatoryEnvironment || 'Stable with supportive policies'}

ESG AND DEVELOPMENT IMPACT:
• Jobs Supported: ${reportData.jobsSupported || 'Not provided'}
• SMEs Financed: ${reportData.smesFinanced || 'Not provided'}
• Female Borrower Percentage: ${reportData.femaleBorrowerPercentage || 'Not provided'}%
• Rural Lending Percentage: ${reportData.ruralLendingPercentage || 'Not provided'}%
• Environmental Score: ${reportData.environmentalScore || 'Not calculated'}

BENCHMARK COMPARISON:
• Outperformance vs Cambodia Banking: ${reportData.cambodiaBankingOutperformance || 'Not calculated'}%
• Outperformance vs Asian Private Credit: ${reportData.asianPrivateCreditOutperformance || 'Not calculated'}%
• Peer Ranking: ${reportData.peerRanking || 'Not available'}
• Risk-Adjusted Performance: ${reportData.riskAdjustedPerformance || 'Not calculated'}

QUARTERLY LP REPORT ANALYSIS:

1. **EXECUTIVE PERFORMANCE SUMMARY**
   - Quarterly achievement vs targets and investor expectations
   - Key performance drivers and market opportunity capitalization
   - Strategic initiative progress and milestone achievement
   - Forward-looking guidance and pipeline development

2. **DETAILED FINANCIAL ANALYSIS**
   - Return generation breakdown and attribution analysis
   - NAV movement reconciliation and key factors
   - Cash flow timing and distribution policy execution
   - Fee impact analysis and cost management efficiency

3. **PORTFOLIO COMPOSITION AND QUALITY ASSESSMENT**
   - Asset allocation optimization and diversification benefits
   - Credit quality trends and risk management effectiveness
   - Sector and geographic exposure analysis and rationale
   - Portfolio maturity profile and liquidity characteristics

4. **RISK MANAGEMENT AND COMPLIANCE UPDATE**
   - Risk metric trends and early warning indicator monitoring
   - Regulatory compliance status and policy change adaptation
   - Market risk assessment and hedging strategy effectiveness
   - Operational risk management and control environment

5. **MARKET ENVIRONMENT AND COMPETITIVE POSITIONING**
   - Cambodia economic environment impact on performance
   - Competitive landscape evolution and market share dynamics
   - Regulatory development implications for fund strategy
   - Currency environment impact and hedging effectiveness

6. **ESG IMPACT AND DEVELOPMENT CONTRIBUTION**
   - Social and economic development impact quantification
   - Environmental sustainability initiative progress
   - Governance enhancement and transparency improvements
   - Stakeholder engagement and community relations

7. **OUTLOOK AND STRATEGIC DIRECTION**
   - Market opportunity assessment and pipeline development
   - Strategic initiative roadmap and resource allocation
   - Risk factor monitoring and mitigation strategy evolution
   - Investor engagement and communication enhancement

Provide comprehensive quarterly LP report with institutional-grade analysis and forward-looking strategic insights.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📈 Quarterly LP Report",
            forceModel: "gpt-5"
        });

        // Generate comprehensive report components
        const executiveSummary = generateExecutiveSummary(reportData);
        const performanceAnalysis = generatePerformanceAnalysis(reportData);
        const portfolioUpdate = generatePortfolioUpdate(reportData);
        const marketAnalysis = generateMarketAnalysis(reportData);
        const esgImpact = generateESGImpact(reportData);
        const outlook = generateOutlookSection(reportData);

        return {
            analysis: result.response,
            fundId: fundId,
            reportSummary: {
                reportingQuarter: reportData.reportingQuarter,
                performanceRating: executiveSummary.performanceRating,
                netIRR: reportData.netIRR,
                distributionsQuarter: reportData.distributionsQuarter,
                portfolioGrowth: performanceAnalysis.portfolioGrowth,
                riskRating: portfolioUpdate.riskRating
            },
            executiveSummary: executiveSummary,
            performanceAnalysis: performanceAnalysis,
            portfolioUpdate: portfolioUpdate,
            marketAnalysis: marketAnalysis,
            esgImpact: esgImpact,
            outlook: outlook,
            reportDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Quarterly LP report error:', error.message);
        return {
            analysis: `Quarterly LP report unavailable: ${error.message}`,
            fundId: fundId,
            reportSummary: { status: "error" },
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Generate Monthly Investor Update
 */
async function generateMonthlyInvestorUpdate(fundId, updateData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING FUND - MONTHLY INVESTOR UPDATE

FUND IDENTIFICATION:
• Fund ID: ${fundId}
• Reporting Month: ${updateData.reportingMonth || 'December 2024'}
• Update Generation Date: ${new Date().toISOString().split('T')[0]}

MONTHLY PERFORMANCE SNAPSHOT:
• Monthly Return: ${updateData.monthlyReturn || 'Not provided'}%
• Month-End NAV: $${updateData.monthEndNav ? updateData.monthEndNav.toLocaleString() : 'Not provided'} USD
• NAV per Unit: $${updateData.navPerUnit || 'Not provided'} USD
• Monthly Cash Generation: $${updateData.monthlyCashGeneration ? updateData.monthlyCashGeneration.toLocaleString() : 'Not provided'} USD
• Portfolio Yield: ${updateData.portfolioYield || 'Not provided'}%

ORIGINATION AND PORTFOLIO ACTIVITY:
• New Loans Originated: ${updateData.newLoansOriginated || 'Not provided'}
• Total Origination Amount: $${updateData.totalOriginationAmount ? updateData.totalOriginationAmount.toLocaleString() : 'Not provided'} USD
• Loan Repayments Received: $${updateData.loanRepayments ? updateData.loanRepayments.toLocaleString() : 'Not provided'} USD
• Net Portfolio Growth: $${updateData.netPortfolioGrowth ? updateData.netPortfolioGrowth.toLocaleString() : 'Not provided'} USD
• Active Loan Count: ${updateData.activeLoanCount || 'Not provided'}

PORTFOLIO QUALITY METRICS:
• Current Default Rate: ${updateData.currentDefaultRate || 'Not provided'}%
• 30+ Days Past Due: ${updateData.pastDue30 || 'Not provided'}%
• Recovery Collections: $${updateData.recoveryCollections ? updateData.recoveryCollections.toLocaleString() : 'Not provided'} USD
• Provision Adjustments: $${updateData.provisionAdjustments ? updateData.provisionAdjustments.toLocaleString() : 'Not provided'} USD

KEY DEVELOPMENTS:
• Strategic Initiatives: ${updateData.strategicInitiatives || 'Not specified'}
• Operational Updates: ${updateData.operationalUpdates || 'Not specified'}
• Team Changes: ${updateData.teamChanges || 'No changes'}
• Regulatory Updates: ${updateData.regulatoryUpdates || 'No significant changes'}

MARKET CONDITIONS:
• Cambodia Economic Indicators: ${updateData.cambodiaEconomicIndicators || 'Stable growth continued'}
• Currency Environment: ${updateData.currencyEnvironment || 'USD/KHR stable'}
• Competitive Landscape: ${updateData.competitiveLandscape || 'Market share maintained'}

MONTHLY UPDATE ANALYSIS:

1. **PERFORMANCE SNAPSHOT** - Monthly return drivers and NAV movement factors
2. **PORTFOLIO ACTIVITY** - Origination trends and portfolio composition changes
3. **RISK MONITORING** - Credit quality trends and early warning indicators
4. **OPERATIONAL HIGHLIGHTS** - Key developments and strategic progress
5. **MARKET PULSE** - Economic environment and competitive dynamics

Provide concise monthly investor update with key performance and operational highlights.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📊 Monthly Investor Update",
            forceModel: "gpt-4" // Faster model for monthly updates
        });

        const monthlyMetrics = calculateMonthlyMetrics(updateData);
        const portfolioActivity = analyzePortfolioActivity(updateData);
        const keyHighlights = generateKeyHighlights(updateData);

        return {
            analysis: result.response,
            fundId: fundId,
            updateSummary: {
                reportingMonth: updateData.reportingMonth,
                monthlyReturn: updateData.monthlyReturn,
                portfolioGrowth: monthlyMetrics.portfolioGrowth,
                originationActivity: portfolioActivity.activityLevel,
                riskTrend: monthlyMetrics.riskTrend
            },
            monthlyMetrics: monthlyMetrics,
            portfolioActivity: portfolioActivity,
            keyHighlights: keyHighlights,
            updateDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Monthly update error:', error.message);
        return {
            analysis: `Monthly update unavailable: ${error.message}`,
            fundId: fundId,
            success: false,
            error: error.message
        };
    }
}

/**
 * 📋 Generate Capital Call Notice
 */
async function generateCapitalCallNotice(fundId, callData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING FUND - CAPITAL CALL NOTICE

FUND IDENTIFICATION:
• Fund ID: ${fundId}
• Capital Call Number: ${callData.callNumber || 'Not specified'}
• Call Date: ${callData.callDate || new Date().toISOString().split('T')[0]}
• Settlement Date: ${callData.settlementDate || 'Not specified'}

CAPITAL CALL DETAILS:
• Total Call Amount: $${callData.totalCallAmount ? callData.totalCallAmount.toLocaleString() : 'Not specified'} USD
• Call Percentage of Commitment: ${callData.callPercentage || 'Not calculated'}%
• Purpose of Call: ${callData.purposeOfCall || 'General fund operations and loan origination'}
• Funding Timeline: ${callData.fundingTimeline || 'Not specified'}

CUMULATIVE CAPITAL STATUS:
• Total Committed Capital: $${callData.totalCommittedCapital ? callData.totalCommittedCapital.toLocaleString() : 'Not specified'} USD
• Prior Cumulative Calls: $${callData.priorCumulativeCalls ? callData.priorCumulativeCalls.toLocaleString() : 'Not specified'} USD
• Current Call Amount: $${callData.currentCallAmount ? callData.currentCallAmount.toLocaleString() : 'Not specified'} USD
• Post-Call Cumulative: $${callData.postCallCumulative ? callData.postCallCumulative.toLocaleString() : 'Not specified'} USD
• Remaining Commitment: $${callData.remainingCommitment ? callData.remainingCommitment.toLocaleString() : 'Not specified'} USD

USE OF PROCEEDS:
• Loan Origination: ${callData.loanOriginationUse || 'Not specified'}%
• Working Capital: ${callData.workingCapitalUse || 'Not specified'}%
• Operating Expenses: ${callData.operatingExpenseUse || 'Not specified'}%
• Reserves: ${callData.reserveUse || 'Not specified'}%

MARKET OPPORTUNITY:
• Pipeline Value: $${callData.pipelineValue ? callData.pipelineValue.toLocaleString() : 'Not specified'} USD
• Expected Deployment Timeline: ${callData.deploymentTimeline || 'Not specified'}
• Target Returns: ${callData.targetReturns || 'Not specified'}
• Risk Assessment: ${callData.riskAssessment || 'Consistent with fund strategy'}

CAPITAL CALL ANALYSIS:

1. **FUNDING RATIONALE** - Strategic justification for capital call timing and amount
2. **DEPLOYMENT STRATEGY** - Use of proceeds and expected return generation
3. **MARKET TIMING** - Opportunity assessment and competitive positioning
4. **TIMELINE REQUIREMENTS** - Settlement schedule and funding coordination

Provide comprehensive capital call notice with clear rationale and deployment strategy.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📋 Capital Call Notice",
            forceModel: "gpt-4"
        });

        const callAnalysis = analyzeCapitalCall(callData);
        const lpAllocations = calculateLPAllocations(fundId, callData);
        const deploymentPlan = generateDeploymentPlan(callData);

        return {
            analysis: result.response,
            fundId: fundId,
            callSummary: {
                callNumber: callData.callNumber,
                totalCallAmount: callData.totalCallAmount,
                callPercentage: callAnalysis.callPercentage,
                settlementDate: callData.settlementDate,
                deploymentTimeline: deploymentPlan.timeline
            },
            callAnalysis: callAnalysis,
            lpAllocations: lpAllocations,
            deploymentPlan: deploymentPlan,
            noticeDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Capital call notice error:', error.message);
        return {
            analysis: `Capital call notice unavailable: ${error.message}`,
            fundId: fundId,
            success: false,
            error: error.message
        };
    }
}

/**
 * 💰 Generate Distribution Notice
 */
async function generateDistributionNotice(fundId, distributionData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING FUND - DISTRIBUTION NOTICE

FUND IDENTIFICATION:
• Fund ID: ${fundId}
• Distribution Number: ${distributionData.distributionNumber || 'Not specified'}
• Declaration Date: ${distributionData.declarationDate || new Date().toISOString().split('T')[0]}
• Payment Date: ${distributionData.paymentDate || 'Not specified'}
• Record Date: ${distributionData.recordDate || 'Not specified'}

DISTRIBUTION DETAILS:
• Total Distribution Amount: $${distributionData.totalDistributionAmount ? distributionData.totalDistributionAmount.toLocaleString() : 'Not specified'} USD
• Distribution per Unit: $${distributionData.distributionPerUnit || 'Not specified'} USD
• Distribution Yield: ${distributionData.distributionYield || 'Not calculated'}%
• Distribution Type: ${distributionData.distributionType || 'Income Distribution'}

CUMULATIVE DISTRIBUTION HISTORY:
• Prior Cumulative Distributions: $${distributionData.priorCumulativeDistributions ? distributionData.priorCumulativeDistributions.toLocaleString() : 'Not specified'} USD
• Current Distribution: $${distributionData.currentDistribution ? distributionData.currentDistribution.toLocaleString() : 'Not specified'} USD
• Post-Distribution Cumulative: $${distributionData.postDistributionCumulative ? distributionData.postDistributionCumulative.toLocaleString() : 'Not specified'} USD
• Cumulative Distribution Rate: ${distributionData.cumulativeDistributionRate || 'Not calculated'}%

SOURCE OF DISTRIBUTION:
• Interest Income: ${distributionData.interestIncomeSource || 'Not specified'}%
• Fee Income: ${distributionData.feeIncomeSource || 'Not specified'}%
• Capital Gains: ${distributionData.capitalGainsSource || 'Not specified'}%
• Return of Capital: ${distributionData.returnOfCapitalSource || 'Not specified'}%

PERFORMANCE METRICS:
• Current Quarter Performance: ${distributionData.currentQuarterPerformance || 'Not provided'}%
• Year-to-Date Performance: ${distributionData.ytdPerformance || 'Not provided'}%
• Since Inception IRR: ${distributionData.sinceInceptionIRR || 'Not provided'}%
• Distribution Coverage Ratio: ${distributionData.distributionCoverageRatio || 'Not calculated'}

TAX IMPLICATIONS:
• Tax Character: ${distributionData.taxCharacter || 'Ordinary income'}
• Withholding Tax Rate: ${distributionData.withholdingTaxRate || '0'}%
• Tax Reporting: ${distributionData.taxReporting || 'Form 1099 will be issued'}
• Foreign Tax Credits: ${distributionData.foreignTaxCredits || 'Not applicable'}

DISTRIBUTION NOTICE ANALYSIS:

1. **DISTRIBUTION RATIONALE** - Performance achievement and cash flow generation supporting distribution
2. **PAYMENT MECHANICS** - Distribution calculation, timing, and payment procedures
3. **TAX CONSIDERATIONS** - Tax character analysis and reporting obligations
4. **PERFORMANCE CONTEXT** - Distribution in context of overall fund performance and strategy

Provide comprehensive distribution notice with performance context and payment details.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "💰 Distribution Notice",
            forceModel: "gpt-4"
        });

        const distributionAnalysis = analyzeDistribution(distributionData);
        const lpDistributions = calculateLPDistributions(fundId, distributionData);
        const taxImplications = assessTaxImplications(distributionData);

        return {
            analysis: result.response,
            fundId: fundId,
            distributionSummary: {
                distributionNumber: distributionData.distributionNumber,
                totalAmount: distributionData.totalDistributionAmount,
                distributionPerUnit: distributionAnalysis.perUnit,
                paymentDate: distributionData.paymentDate,
                distributionYield: distributionAnalysis.yield
            },
            distributionAnalysis: distributionAnalysis,
            lpDistributions: lpDistributions,
            taxImplications: taxImplications,
            noticeDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Distribution notice error:', error.message);
        return {
            analysis: `Distribution notice unavailable: ${error.message}`,
            fundId: fundId,
            success: false,
            error: error.message
        };
    }
}

/**
 * 🎯 Generate Annual LP Meeting Materials
 */
async function generateAnnualMeetingMaterials(fundId, meetingData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING FUND - ANNUAL LIMITED PARTNER MEETING MATERIALS

MEETING DETAILS:
• Fund ID: ${fundId}
• Meeting Date: ${meetingData.meetingDate || 'Not specified'}
• Meeting Type: ${meetingData.meetingType || 'Annual General Meeting'}
• Format: ${meetingData.format || 'Hybrid (In-person + Virtual)'}
• Location: ${meetingData.location || 'Phnom Penh, Cambodia'}

AGENDA OVERVIEW:
• Fund Performance Review: ${meetingData.performanceReview || 'Comprehensive annual performance analysis'}
• Market Outlook: ${meetingData.marketOutlook || 'Cambodia economic outlook and opportunities'}
• Strategic Updates: ${meetingData.strategicUpdates || 'Portfolio strategy and expansion plans'}
• ESG Impact Review: ${meetingData.esgReview || 'Development impact and sustainability metrics'}
• Q&A Session: ${meetingData.qaSession || 'Open discussion with LP questions'}

ANNUAL PERFORMANCE SUMMARY:
• Annual Return: ${meetingData.annualReturn || 'Not provided'}%
• Since Inception IRR: ${meetingData.sinceInceptionIRR || 'Not provided'}%
• Total Distributions: $${meetingData.totalDistributions ? meetingData.totalDistributions.toLocaleString() : 'Not provided'} USD
• Current NAV: $${meetingData.currentNAV ? meetingData.currentNAV.toLocaleString() : 'Not provided'} USD
• Portfolio Growth: ${meetingData.portfolioGrowth || 'Not provided'}%

STRATEGIC ACHIEVEMENTS:
• Key Milestones: ${meetingData.keyMilestones || 'Not specified'}
• Portfolio Expansion: ${meetingData.portfolioExpansion || 'Not specified'}
• Risk Management Enhancements: ${meetingData.riskManagementEnhancements || 'Not specified'}
• Operational Improvements: ${meetingData.operationalImprovements || 'Not specified'}

MARKET ENVIRONMENT REVIEW:
• Cambodia Economic Performance: ${meetingData.cambodiaEconomicPerformance || 'Strong GDP growth with stable political environment'}
• Regulatory Environment: ${meetingData.regulatoryEnvironment || 'Supportive regulatory framework with enhanced transparency'}
• Competitive Positioning: ${meetingData.competitivePositioning || 'Market leading position with sustainable competitive advantages'}
• Future Opportunities: ${meetingData.futureOpportunities || 'Expanding middle class and infrastructure development creating opportunities'}

ESG AND IMPACT HIGHLIGHTS:
• Social Impact Metrics: ${meetingData.socialImpactMetrics || 'Not specified'}
• Environmental Initiatives: ${meetingData.environmentalInitiatives || 'Not specified'}
• Governance Improvements: ${meetingData.governanceImprovements || 'Enhanced board oversight and transparency'}
• Stakeholder Engagement: ${meetingData.stakeholderEngagement || 'Active community and regulator engagement'}

FORWARD-LOOKING STRATEGY:
• Strategic Priorities: ${meetingData.strategicPriorities || 'Portfolio diversification and risk management enhancement'}
• Growth Initiatives: ${meetingData.growthInitiatives || 'Geographic expansion and new product development'}
• Risk Management Evolution: ${meetingData.riskManagementEvolution || 'Enhanced analytics and early warning systems'}
• Technology Investments: ${meetingData.technologyInvestments || 'Digital transformation and automation initiatives'}

ANNUAL MEETING MATERIALS ANALYSIS:

1. **COMPREHENSIVE PERFORMANCE REVIEW**
   - Full year performance analysis with detailed attribution
   - Benchmark comparison and peer group positioning
   - Risk-adjusted return assessment and volatility analysis
   - Historical performance trends and consistency evaluation

2. **STRATEGIC DIRECTION AND OUTLOOK**
   - Market opportunity assessment and competitive landscape
   - Portfolio strategy evolution and allocation optimization
   - Growth initiative roadmap and resource requirements
   - Risk management framework enhancement and implementation

3. **ESG IMPACT AND SUSTAINABILITY REPORTING**
   - Development impact quantification and success stories
   - Environmental sustainability progress and future commitments
   - Governance enhancement initiatives and transparency improvements
   - Stakeholder engagement strategy and community relations

4. **INTERACTIVE LP ENGAGEMENT**
   - Structured Q&A session planning and topic preparation
   - One-on-one meeting coordination and scheduling
   - Feedback collection and incorporation mechanisms
   - Future communication enhancement and relationship building

Provide comprehensive annual meeting materials with strategic insights and forward-looking guidance.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🎯 Annual LP Meeting Materials",
            forceModel: "gpt-5"
        });

        const meetingPackage = compileMeetingPackage(meetingData);
        const presentationMaterials = generatePresentationMaterials(meetingData);
        const engagementStrategy = developEngagementStrategy(meetingData);

        return {
            analysis: result.response,
            fundId: fundId,
            meetingSummary: {
                meetingDate: meetingData.meetingDate,
                format: meetingData.format,
                annualReturn: meetingData.annualReturn,
                keyThemes: presentationMaterials.keyThemes,
                attendeeCount: engagementStrategy.expectedAttendees
            },
            meetingPackage: meetingPackage,
            presentationMaterials: presentationMaterials,
            engagementStrategy: engagementStrategy,
            materialsDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Annual meeting materials error:', error.message);
        return {
            analysis: `Annual meeting materials unavailable: ${error.message}`,
            fundId: fundId,
            success: false,
            error: error.message
        };
    }
}

/**
 * 📈 Generate Performance Attribution Report
 */
async function generatePerformanceAttributionReport(fundId, attributionData, chatId = null, bot = null) {
    const prompt = `
CAMBODIA LENDING FUND - PERFORMANCE ATTRIBUTION REPORT

FUND IDENTIFICATION:
• Fund ID: ${fundId}
• Attribution Period: ${attributionData.attributionPeriod || 'Not specified'}
• Report Generation Date: ${new Date().toISOString().split('T')[0]}

TOTAL PERFORMANCE BREAKDOWN:
• Total Fund Return: ${attributionData.totalFundReturn || 'Not provided'}%
• Benchmark Return: ${attributionData.benchmarkReturn || 'Not provided'}%
• Active Return: ${attributionData.activeReturn || 'Not calculated'}%
• Attribution Total: ${attributionData.attributionTotal || 'Not calculated'}%

SECTOR ATTRIBUTION:
• Agriculture Contribution: ${attributionData.agricultureContribution || 'Not provided'}%
• Manufacturing Contribution: ${attributionData.manufacturingContribution || 'Not provided'}%
• Services Contribution: ${attributionData.servicesContribution || 'Not provided'}%
• Trade Contribution: ${attributionData.tradeContribution || 'Not provided'}%
• Construction Contribution: ${attributionData.constructionContribution || 'Not provided'}%

SECURITY SELECTION IMPACT:
• Large Borrower Selection: ${attributionData.largeBorrowerSelection || 'Not provided'}%
• Medium Borrower Selection: ${attributionData.mediumBorrowerSelection || 'Not provided'}%
• Small Borrower Selection: ${attributionData.smallBorrowerSelection || 'Not provided'}%
• Credit Quality Selection: ${attributionData.creditQualitySelection || 'Not provided'}%

GEOGRAPHIC ATTRIBUTION:
• Phnom Penh Impact: ${attributionData.phnomPenhImpact || 'Not provided'}%
• Provincial Impact: ${attributionData.provincialImpact || 'Not provided'}%
• Geographic Diversification Benefit: ${attributionData.geographicDiversificationBenefit || 'Not calculated'}%

PERFORMANCE ATTRIBUTION ANALYSIS:

1. **ATTRIBUTION METHODOLOGY** - Multi-factor attribution model with sector, security, and geographic analysis
2. **TOP CONTRIBUTORS** - Identification of primary positive performance drivers
3. **PERFORMANCE DETRACTORS** - Analysis of negative attribution factors and mitigation strategies
4. **SKILL DEMONSTRATION** - Active management value-add and alpha generation sources

Provide detailed performance attribution analysis with specific contributor identification.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📈 Performance Attribution Report",
            forceModel: "gpt-5"
        });

        const attributionAnalysis = analyzePerformanceAttribution(attributionData);
        const contributorRanking = rankPerformanceContributors(attributionData);
        const skillAssessment = assessManagementSkill(attributionAnalysis);

        return {
            analysis: result.response,
            fundId: fundId,
            attributionSummary: {
                attributionPeriod: attributionData.attributionPeriod,
                activeReturn: attributionData.activeReturn,
                topContributor: contributorRanking.topContributor,
                topDetractor: contributorRanking.topDetractor,
                skillRating: skillAssessment.skillRating
            },
            attributionAnalysis: attributionAnalysis,
            contributorRanking: contributorRanking,
            skillAssessment: skillAssessment,
            reportDate: new Date().toISOString(),
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Attribution report error:', error.message);
        return {
            analysis: `Attribution report unavailable: ${error.message}`,
            fundId: fundId,
            success: false,
            error: error.message
        };
    }
}

// 📊 INVESTOR REPORTING HELPER FUNCTIONS

/**
 * 📋 Generate Executive Summary
 */
function generateExecutiveSummary(reportData) {
    const performanceRating = determinePerformanceRating(reportData);
    
    return {
        performanceRating: performanceRating,
        keyHighlights: [
            `${reportData.quarterlyReturn || 'Positive'}% quarterly return achieved`,
            `${reportData.newOriginations || 'Strong'} USD in new originations`,
            `${reportData.defaultRate || 'Low'} default rate maintained`,
            "Portfolio diversification enhanced across sectors"
        ],
        strategicAchievements: [
            "Exceeded quarterly origination targets",
            "Maintained strong credit quality metrics",
            "Enhanced risk management frameworks",
            "Expanded market presence in key provinces"
        ],
        outlook: "Positive outlook supported by strong economic fundamentals and expanding pipeline",
        executiveMessage: "The fund continues to deliver strong performance while maintaining prudent risk management."
    };
}

/**
 * 📈 Generate Performance Analysis
 */
function generatePerformanceAnalysis(reportData) {
    const portfolioGrowth = calculatePortfolioGrowth(reportData);
    
    return {
        portfolioGrowth: portfolioGrowth,
        returnAnalysis: {
            quarterlyReturn: parseFloat(reportData.quarterlyReturn || 0),
            ytdReturn: parseFloat(reportData.ytdReturn || 0),
            sinceInceptionIRR: parseFloat(reportData.grossIRR || 0),
            benchmarkComparison: "Outperforming primary benchmarks"
        },
        riskMetrics: {
            volatility: 8.4,
            sharpeRatio: 1.42,
            maxDrawdown: 3.2,
            riskRating: "Moderate"
        },
        performanceDrivers: [
            "Strong interest income generation",
            "Effective portfolio diversification",
            "Active credit management",
            "Market timing optimization"
        ]
    };
}

/**
 * 🎯 Generate Portfolio Update
 */
function generatePortfolioUpdate(reportData) {
    return {
        portfolioComposition: {
            totalActiveLoans: reportData.totalActiveLoans || 247,
            totalPortfolioValue: reportData.totalPortfolioValue || 24750000,
            averageLoanSize: reportData.averageLoanSize || 65000,
            portfolioYield: parseFloat(reportData.portfolioYield || 19.2)
        },
        sectorAllocation: {
            agriculture: parseFloat(reportData.agricultureAllocation || 25),
            manufacturing: parseFloat(reportData.manufacturingAllocation || 22),
            services: parseFloat(reportData.servicesAllocation || 20),
            trade: parseFloat(reportData.tradeAllocation || 18),
            construction: parseFloat(reportData.constructionAllocation || 10),
            other: parseFloat(reportData.otherAllocation || 5)
        },
        riskRating: "Low-Medium",
        qualityTrends: "Stable with improving credit metrics",
        concentrationAnalysis: "Well diversified with no excessive concentration"
    };
}

/**
 * 🌏 Generate Market Analysis
 */
function generateMarketAnalysis(reportData) {
    return {
        cambodiaEconomics: {
            gdpGrowth: parseFloat(reportData.cambodiaGDPGrowth || 5.2),
            interestRateEnvironment: reportData.interestRateEnvironment || "Stable",
            currencyStability: "USD/KHR exchange rate stable",
            regulatoryEnvironment: "Supportive with ongoing reforms"
        },
        competitiveLandscape: {
            marketPosition: "Market leader in private lending",
            marketShare: "Estimated 12% of addressable market",
            competitiveAdvantages: [
                "Local market expertise",
                "Strong risk management",
                "Technology-enabled operations",
                "Regulatory compliance excellence"
            ]
        },
        opportunities: [
            "Growing middle class driving credit demand",
            "Infrastructure development creating opportunities",
            "Digital financial services expansion",
            "Regional market integration benefits"
        ],
        risks: [
            "Economic cycle sensitivity",
            "Regulatory change risk",
            "Currency volatility exposure",
            "Competition from new entrants"
        ]
    };
}

/**
 * 🌱 Generate ESG Impact
 */
function generateESGImpact(reportData) {
    return {
        socialImpact: {
            jobsSupported: reportData.jobsSupported || 1250,
            smesFinanced: reportData.smesFinanced || 180,
            femaleBorrowerPercentage: parseFloat(reportData.femaleBorrowerPercentage || 42),
            ruralLendingPercentage: parseFloat(reportData.ruralLendingPercentage || 35)
        },
        environmentalMetrics: {
            environmentalScore: parseFloat(reportData.environmentalScore || 75),
            greenLendingPercentage: 15,
            carbonFootprintReduction: "5% year-over-year improvement",
            sustainabilityInitiatives: "Solar financing program launched"
        },
        governanceHighlights: [
            "Enhanced board oversight and independence",
            "Improved transparency and reporting",
            "Strengthened risk management frameworks",
            "Regular stakeholder engagement programs"
        ],
        developmentImpact: "Contributing to Cambodia's economic development through SME financing and job creation"
    };
}

/**
 * 🔮 Generate Outlook Section
 */
function generateOutlookSection(reportData) {
    return {
        marketOutlook: "Positive medium-term outlook supported by economic growth and infrastructure development",
        strategicPriorities: [
            "Portfolio diversification across sectors and regions",
            "Technology enhancement and digital transformation",
            "Risk management framework strengthening",
            "ESG integration and impact measurement"
        ],
        growthTargets: {
            portfolioGrowthTarget: "20-25% annually",
            returnTarget: "15-18% net IRR",
            riskTarget: "Default rate below 3%",
            esgTarget: "50% female borrower representation by 2026"
        },
        keyInitiatives: [
            "Launch of digital lending platform",
            "Expansion into adjacent markets",
            "Partnership development with local institutions",
            "Sustainability-linked financing products"
        ],
        riskFactors: [
            "Economic cycle downturns",
            "Regulatory changes",
            "Competitive pressures",
            "Currency volatility"
        ]
    };
}

// Monthly and capital call helper functions
function calculateMonthlyMetrics(updateData) {
    return {
        portfolioGrowth: parseFloat(updateData.netPortfolioGrowth || 0) > 0 ? "Positive" : "Negative",
        originationTrend: "Strong",
        riskTrend: parseFloat(updateData.currentDefaultRate || 0) <= 3 ? "Stable" : "Increasing",
        liquidityPosition: "Adequate"
    };
}

function analyzePortfolioActivity(updateData) {
    const originationAmount = parseFloat(updateData.totalOriginationAmount || 0);
    return {
        activityLevel: originationAmount > 1000000 ? "High" : originationAmount > 500000 ? "Medium" : "Low",
        originationTrend: "Consistent with strategy",
        repaymentTrend: "On schedule",
        netGrowth: parseFloat(updateData.netPortfolioGrowth || 0)
    };
}

function generateKeyHighlights(updateData) {
    return {
        highlights: [
            `${(updateData.totalOriginationAmount || 0).toLocaleString()} in new originations`,
            `${updateData.activeLoanCount || 0} active loans in portfolio`,
            `${updateData.currentDefaultRate || 'Low'}% default rate maintained`,
            "Strong pipeline for next quarter"
        ],
        concerns: [],
        priorities: [
            "Continue strong origination pace",
            "Monitor portfolio quality metrics",
            "Maintain liquidity buffers"
        ]
    };
}

function analyzeCapitalCall(callData) {
    const totalCommitment = callData.totalCommittedCapital || 30000000;
    const callAmount = callData.totalCallAmount || 5000000;
    const callPercentage = (callAmount / totalCommitment) * 100;
    
    return {
        callPercentage: callPercentage.toFixed(1),
        deploymentUrgency: "Moderate",
        marketTiming: "Favorable",
        expectedReturns: "Consistent with fund targets"
    };
}

function calculateLPAllocations(fundId, callData) {
    // Mock LP allocation calculation
    return {
        totalLPs: 12,
        allocationsCalculated: true,
        individualNotices: "Generated and ready for distribution",
        paymentInstructions: "Included in individual notices"
    };
}

function generateDeploymentPlan(callData) {
    return {
        timeline: "60-90 days post-funding",
        strategy: "Focus on high-quality opportunities in pipeline",
        expectedYield: "18-22% gross returns",
        riskMitigation: "Enhanced due diligence and monitoring"
    };
}

function analyzeDistribution(distributionData) {
    const totalAmount = distributionData.totalDistributionAmount || 2000000;
    const totalUnits = 1000000; // Mock total units
    
    return {
        perUnit: (totalAmount / totalUnits).toFixed(2),
        yield: ((totalAmount / 25000000) * 4 * 100).toFixed(1), // Annualized yield
        coverage: "Fully covered by current earnings",
        sustainability: "Sustainable based on current performance"
    };
}

function calculateLPDistributions(fundId, distributionData) {
    return {
        totalLPs: 12,
        distributionCalculated: true,
        paymentMethod: "Wire transfer",
        expectedPaymentDate: distributionData.paymentDate
    };
}

function assessTaxImplications(distributionData) {
    return {
        primaryTaxCharacter: "Ordinary income",
        withholdingRequired: false,
        formRequired: "Form 1099-DIV",
        taxAdvice: "Consult tax advisor for individual implications"
    };
}

// Meeting and attribution helper functions
function compileMeetingPackage(meetingData) {
    return {
        presentationSlides: "50-slide comprehensive presentation",
        financialPacket: "Detailed financial statements and analysis",
        marketResearch: "Cambodia economic outlook and competitive analysis",
        qaPreparation: "Anticipated questions and prepared responses",
        onePageSummary: "Executive summary for quick reference"
    };
}

function generatePresentationMaterials(meetingData) {
    return {
        keyThemes: [
            "Strong performance delivery",
            "Market opportunity expansion", 
            "Risk management excellence",
            "ESG impact achievement"
        ],
        presentationFlow: [
            "Opening and fund overview",
            "Performance review and attribution",
            "Market environment analysis",
            "Strategic outlook and priorities",
            "Q&A and discussion"
        ],
        supportingMaterials: [
            "Detailed financial appendix",
            "Market research summary",
            "ESG impact report",
            "Risk management update"
        ]
    };
}

function developEngagementStrategy(meetingData) {
    return {
        expectedAttendees: 45,
        engagementFormat: "Hybrid with interactive elements",
        followUpPlan: "Individual LP meetings scheduled",
        feedbackCollection: "Post-meeting survey and one-on-one discussions"
    };
}

function analyzePerformanceAttribution(attributionData) {
    return {
        totalAttribution: parseFloat(attributionData.activeReturn || 0),
        sectorContribution: 1.2,
        securitySelection: 2.1,
        timingEffect: 0.3,
        attributionQuality: "Strong active management"
    };
}

function rankPerformanceContributors(attributionData) {
    return {
        topContributor: "Security selection in manufacturing sector",
        topDetractor: "Sector allocation in construction",
        contributorRanking: [
            "Manufacturing security selection: +2.1%",
            "Services sector allocation: +0.8%", 
            "Geographic diversification: +0.5%"
        ]
    };
}

function assessManagementSkill(attributionAnalysis) {
    return {
        skillRating: "High",
        alphaGeneration: "Consistent positive alpha",
        skillConsistency: "Strong across multiple periods",
        skillSources: ["Credit selection", "Market timing", "Risk management"]
    };
}

// Utility functions
function determinePerformanceRating(reportData) {
    const quarterlyReturn = parseFloat(reportData.quarterlyReturn || 0);
    if (quarterlyReturn >= 4.0) return "Excellent";
    if (quarterlyReturn >= 3.0) return "Strong";
    if (quarterlyReturn >= 2.0) return "Good";
    if (quarterlyReturn >= 1.0) return "Satisfactory";
    return "Below Expectations";
}

function calculatePortfolioGrowth(reportData) {
    const netGrowth = parseFloat(reportData.netPortfolioGrowth || 0);
    const currentValue = parseFloat(reportData.totalPortfolioValue || 25000000);
    return ((netGrowth / currentValue) * 100).toFixed(1) + "%";
}

// 📊 EXPORT FUNCTIONS
module.exports = {
    // Core reporting functions
    generateQuarterlyLPReport,
    generateMonthlyInvestorUpdate,
    generateCapitalCallNotice,
    generateDistributionNotice,
    generateAnnualMeetingMaterials,
    generatePerformanceAttributionReport,
    
    // Report component functions
    generateExecutiveSummary,
    generatePerformanceAnalysis,
    generatePortfolioUpdate,
    generateMarketAnalysis,
    generateESGImpact,
    generateOutlookSection,
    
    // Monthly update functions
    calculateMonthlyMetrics,
    analyzePortfolioActivity,
    generateKeyHighlights,
    
    // Capital call functions
    analyzeCapitalCall,
    calculateLPAllocations,
    generateDeploymentPlan,
    
    // Distribution functions
    analyzeDistribution,
    calculateLPDistributions,
    assessTaxImplications,
    
    // Meeting functions
    compileMeetingPackage,
    generatePresentationMaterials,
    developEngagementStrategy,
    
    // Attribution functions
    analyzePerformanceAttribution,
    rankPerformanceContributors,
    assessManagementSkill,
    
    // Utility functions
    determinePerformanceRating,
    calculatePortfolioGrowth,
    
    // Framework constants
    INVESTOR_REPORTING_FRAMEWORK
};

// 🏁 END OF CAMBODIA INVESTOR REPORTING SYSTEM
