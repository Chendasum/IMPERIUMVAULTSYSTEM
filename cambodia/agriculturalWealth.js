// cambodia/agriculturalWealth.js - COMPLETE: Cambodia Agricultural & Fisheries Intelligence
// Enterprise-grade agricultural analysis with GPT-5 integration

const { executeEnhancedGPT5Command } = require('../utils/dualCommandSystem');

// 🔧 SPECIALIZED HANDLERS (Preserved for business logic)
const lpManagement = require('./cambodia/lpManagement');
const portfolioManager = require('./cambodia/portfolioManager');
const realEstateWealth = require('./cambodia/realEstateWealth'); 
const businessWealth = require('./cambodia/businessWealth');
const investmentWealth = require('./cambodia/investmentWealth');
const economicIntelligence = require('./cambodia/economicIntelligence');
const legalRegulatory = require('./cambodia/legalRegulatory'); // ✅ Legal & compliance
const resourcesWealth = require('./cambodia/resourcesWealth'); // ⛏️ Natural resources
const cambodiaLending = require('./utils/cambodiaLending');
const creditAssessment = require('./cambodia/creditAssessment');
const loanOrigination = require('./cambodia/loanOrigination');
const loanServicing = require('./cambodia/loanServicing'); // 📋 NEW: Loan servicing & collections
const riskManagement = require('./cambodia/riskManagement'); // 🚨 NEW: Risk assessment & monitoring
const loanRecovery = require('./cambodia/loanRecovery'); // 💰 NEW: Collections & asset recovery
const cashFlowManagement = require('./cambodia/cashFlowManagement'); // 💵 NEW: Cash flow & liquidity management
const borrowerDueDiligence = require('./cambodia/borrowerDueDiligence'); // 🔍 NEW: KYC & due diligence screening
const performanceAnalytics = require('./cambodia/performanceAnalytics');
const fundAccounting = require('./cambodia/fundAccounting'); // 🧮 NEW: NAV & accounting system
const investorReporting = require('./cambodia/investorReporting'); // 📊 NEW: LP reporting & communications
const complianceMonitoring = require('./cambodia/complianceMonitoring'); // 📋 NEW: Compliance monitoring & tracking

 
// 🌾 CAMBODIA AGRICULTURAL DATA & INTELLIGENCE
const CAMBODIA_AGRICULTURAL_DATA = {
    // Major agricultural sectors by GDP contribution
    sectors: {
        rice: {
            name: "Rice Production & Export",
            gdpContribution: "15.2%",
            exportValue: "450M USD annually",
            majorProvinces: ["Battambang", "Banteay Meanchey", "Prey Veng"],
            seasonality: {
                wetSeason: "May-October",
                drySeason: "November-April",
                harvestPeak: "December-February"
            },
            qualityGrades: ["Fragrant", "White Rice", "Parboiled", "Broken Rice"],
            exportMarkets: ["EU", "China", "Singapore", "Malaysia"]
        },
        
        rubber: {
            name: "Natural Rubber",
            gdpContribution: "8.7%",
            exportValue: "280M USD annually",
            majorProvinces: ["Kampong Cham", "Kratie", "Mondulkiri"],
            productionCycle: "7-year maturity, 25-30 year productive life",
            globalRanking: "#6 rubber exporter worldwide",
            challenges: ["Price volatility", "Aging plantations", "Labor shortage"]
        },
        
        cassava: {
            name: "Cassava & Starch",
            gdpContribution: "4.3%",
            exportValue: "120M USD annually",
            majorProvinces: ["Tboung Khmum", "Kampong Cham", "Prey Veng"],
            processing: ["Dried chips", "Starch", "Ethanol"],
            exportMarkets: ["China", "Vietnam", "Thailand"]
        },
        
        fisheries: {
            name: "Fisheries & Aquaculture",
            gdpContribution: "6.8%",
            exportValue: "200M USD annually",
            majorAreas: ["Tonle Sap Lake", "Mekong River", "Coastal Waters"],
            species: ["Freshwater fish", "Marine fish", "Shrimp", "Crab"],
            seasonality: {
                tonleSapPeak: "November-May",
                mekongPeak: "June-October",
                coastalYear: "Year-round"
            }
        },
        
        palmOil: {
            name: "Palm Oil",
            gdpContribution: "2.1%",
            exportValue: "85M USD annually",
            majorProvinces: ["Koh Kong", "Sihanoukville", "Kampot"],
            growthTrend: "15% annual increase",
            sustainability: "RSPO certification increasing"
        },
        
        pepper: {
            name: "Kampot Pepper",
            gdpContribution: "0.8%",
            exportValue: "35M USD annually",
            speciality: "Protected Geographic Indication (PGI)",
            premiumMarkets: ["France", "Japan", "USA", "Australia"],
            uniqueValue: "Premium pricing - 10x regular pepper"
        },
        
        corn: {
            name: "Corn (Maize)",
            gdpContribution: "3.2%",
            exportValue: "95M USD annually",
            majorProvinces: ["Battambang", "Pailin", "Banteay Meanchey"],
            uses: ["Animal feed", "Food processing", "Export"]
        }
    },
    
    // Agricultural economic indicators
    economics: {
        totalGdpContribution: "41.2%",
        totalExportValue: "1.265B USD annually",
        employmentShare: "48.7% of total workforce",
        smallholderFarms: "85% of agricultural land",
        averageFarmSize: "1.2 hectares",
        mechanizationLevel: "Low - 15% mechanized",
        irrigationCoverage: "22% of agricultural land"
    },
    
    // Investment opportunities
    opportunities: {
        agritech: {
            potential: "High - digitization gap",
            areas: ["Precision farming", "IoT sensors", "Drone monitoring"],
            investmentNeeded: "500M USD over 5 years"
        },
        processing: {
            potential: "Very High - value-add gap",
            areas: ["Rice mills", "Cassava processing", "Fish processing"],
            investmentNeeded: "800M USD over 5 years"
        },
        logistics: {
            potential: "Critical - infrastructure gap",
            areas: ["Cold storage", "Transportation", "Port facilities"],
            investmentNeeded: "1.2B USD over 7 years"
        }
    },
    
    // Climate and sustainability factors
    sustainability: {
        climateRisks: ["Flooding", "Drought", "Irregular rainfall"],
        adaptation: ["Drought-resistant varieties", "Improved irrigation", "Climate insurance"],
        carbonSequestration: "High potential in rice and forestry",
        sustainablePractices: "Organic farming growth 12% annually"
    }
};

// 🐟 FISHERIES SPECIFIC DATA
const CAMBODIA_FISHERIES_DATA = {
    tonleSapLake: {
        area: "2,700-16,000 km² (seasonal variation)",
        species: "Over 200 freshwater species",
        annualCatch: "300,000-400,000 tons",
        economicValue: "400M USD annually",
        employment: "1.2 million people dependent",
        challenges: ["Overfishing", "Illegal fishing", "Dam construction"]
    },
    
    mekongRiver: {
        length: "500km in Cambodia",
        species: "Catfish, carp, snakehead",
        annualCatch: "56,000 tons",
        threats: ["Upstream dams", "Climate change", "Pollution"]
    },
    
    coastal: {
        coastlineLength: "443 km",
        species: ["Tuna", "Mackerel", "Shrimp", "Crab"],
        annualCatch: "75,000 tons",
        aquaculture: "Growing 18% annually"
    },
    
    aquaculture: {
        production: "226,000 tons annually",
        species: ["Pangasius", "Tilapia", "Giant freshwater prawn"],
        growthRate: "15% annually",
        exportPotential: "Very high to regional markets"
    }
};

// 📊 MARKET ANALYSIS FUNCTIONS

/**
 * 🌾 Rice Market Analysis with GPT-5 Intelligence
 */
async function analyzeRiceMarket(chatId = null, bot = null) {
    const prompt = `
CAMBODIA RICE MARKET ANALYSIS REQUEST

Current Market Data:
• Production: 10.8 million tons annually (3rd largest exporter in region)
• Export Value: $450M USD annually  
• Major Markets: EU (35%), China (28%), Singapore (15%)
• Quality: Premium fragrant rice, Jasmine varieties
• Provinces: Battambang, Banteay Meanchey, Prey Veng

Please provide comprehensive analysis covering:

1. **Global Market Position**
   - Cambodia's ranking vs Thailand, Vietnam, India
   - Price competitiveness analysis
   - Quality differentiation factors

2. **Export Opportunities** 
   - Emerging markets (Middle East, Africa)
   - Premium market penetration strategies
   - Value-added products potential

3. **Investment Analysis**
   - Mill modernization needs
   - Logistics infrastructure gaps  
   - Technology adoption opportunities

4. **Risk Assessment**
   - Climate change impacts
   - Trade policy changes
   - Supply chain vulnerabilities

5. **Strategic Recommendations**
   - 5-year growth strategy
   - Investment priorities
   - Market diversification approach

Focus on actionable insights for investors and policy makers.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🌾 Cambodia Rice Market Intelligence",
            forceModel: "gpt-5-mini" // Balanced for market analysis
        });

        return {
            analysis: result.response,
            sector: "rice",
            marketSize: CAMBODIA_AGRICULTURAL_DATA.sectors.rice.exportValue,
            gdpContribution: CAMBODIA_AGRICULTURAL_DATA.sectors.rice.gdpContribution,
            keyMetrics: {
                production: "10.8M tons annually",
                exports: "$450M USD",
                globalRank: "#3 in Southeast Asia",
                majorMarkets: ["EU", "China", "Singapore"]
            },
            success: result.success,
            aiUsed: result.aiUsed,
            responseTime: result.responseTime
        };

    } catch (error) {
        console.error('❌ Rice market analysis error:', error.message);
        return {
            analysis: `Rice market analysis temporarily unavailable: ${error.message}`,
            sector: "rice",
            success: false,
            error: error.message
        };
    }
}

/**
 * 🌳 Rubber Market Analysis with Price Forecasting
 */
async function analyzeRubberMarket(chatId = null, bot = null) {
    const prompt = `
CAMBODIA RUBBER MARKET ANALYSIS REQUEST

Current Market Position:
• Export Value: $280M USD annually
• Global Ranking: #6 rubber exporter worldwide
• Production Areas: Kampong Cham, Kratie, Mondulkiri  
• Plantation Age: 60% aging plantations (20+ years)
• Employment: 300,000+ workers

Market Context:
• Global demand: Electric vehicle growth driving synthetic alternatives
• Regional competition: Thailand, Malaysia, Indonesia
• Price volatility: 40-60% swings annually
• Sustainability pressure: ESG compliance increasing

Provide comprehensive analysis:

1. **Price Forecasting**
   - 12-month price outlook
   - Demand drivers analysis  
   - Supply chain constraints

2. **Competitive Positioning**
   - Cost structure vs regional competitors
   - Quality advantages/disadvantages
   - Market share trends

3. **Modernization Opportunities**
   - Plantation rejuvenation investment needs
   - Processing technology upgrades
   - Sustainability certification benefits

4. **Risk Mitigation**
   - Price hedging strategies
   - Market diversification options
   - Climate resilience measures

5. **Investment Recommendations**
   - Priority investment areas
   - ROI expectations
   - Timeline for improvements

Focus on practical strategies for rubber industry stakeholders.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🌳 Cambodia Rubber Industry Analysis",
            forceModel: "gpt-5-mini"
        });

        return {
            analysis: result.response,
            sector: "rubber",
            marketSize: CAMBODIA_AGRICULTURAL_DATA.sectors.rubber.exportValue,
            keyMetrics: {
                globalRank: "#6 exporter",
                exportValue: "$280M USD",
                employment: "300,000+ workers",
                plantationAge: "60% aging (20+ years)"
            },
            challenges: CAMBODIA_AGRICULTURAL_DATA.sectors.rubber.challenges,
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Rubber market analysis error:', error.message);
        return {
            analysis: `Rubber market analysis unavailable: ${error.message}`,
            sector: "rubber",
            success: false,
            error: error.message
        };
    }
}

/**
 * 🐟 Fisheries Sustainability & Investment Analysis
 */
async function analyzeFisheriesMarket(chatId = null, bot = null) {
    const prompt = `
CAMBODIA FISHERIES & AQUACULTURE ANALYSIS REQUEST

Current Sector Overview:
• Total Value: $200M USD export annually
• GDP Contribution: 6.8% of national GDP
• Employment: 1.2 million people dependent (direct/indirect)
• Production: 631,000 tons annually (75% inland, 25% marine)

Key Resources:
• Tonle Sap Lake: World's largest freshwater fishery (seasonal)
• Mekong River: 500km of productive waters
• Coastal Waters: 443km coastline with aquaculture potential

Current Challenges:
• Overfishing pressure on Tonle Sap
• Mekong dam impacts on fish migration
• Limited processing and cold storage infrastructure
• Illegal fishing practices

Growth Opportunities:
• Aquaculture expansion (15% annual growth)
• Export processing facilities  
• Sustainable fishing practices
• Premium market development

Provide comprehensive analysis:

1. **Sustainability Assessment**
   - Current fishing practices impact
   - Sustainable yield calculations
   - Conservation recommendations

2. **Aquaculture Development**
   - Species diversification opportunities
   - Technology adoption needs
   - Market expansion potential

3. **Value Chain Analysis**
   - Processing infrastructure gaps
   - Export market opportunities
   - Premium product development

4. **Investment Priorities**
   - Infrastructure development needs
   - Technology modernization requirements
   - Capacity building investments

5. **Policy Recommendations**
   - Regulatory framework improvements
   - International cooperation needs
   - Community-based management

Focus on balancing economic development with environmental sustainability.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🐟 Cambodia Fisheries Sustainability Analysis",
            forceModel: "gpt-5" // Full model for complex sustainability analysis
        });

        return {
            analysis: result.response,
            sector: "fisheries",
            marketSize: CAMBODIA_AGRICULTURAL_DATA.sectors.fisheries.exportValue,
            keyResources: {
                tonleSapLake: CAMBODIA_FISHERIES_DATA.tonleSapLake,
                mekongRiver: CAMBODIA_FISHERIES_DATA.mekongRiver,
                coastal: CAMBODIA_FISHERIES_DATA.coastal,
                aquaculture: CAMBODIA_FISHERIES_DATA.aquaculture
            },
            sustainability: {
                employment: "1.2M people dependent",
                production: "631,000 tons annually",
                aquacultureGrowth: "15% annually"
            },
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Fisheries analysis error:', error.message);
        return {
            analysis: `Fisheries analysis unavailable: ${error.message}`,
            sector: "fisheries",
            success: false,
            error: error.message
        };
    }
}

/**
 * 🌿 Emerging Crops Analysis (Cassava, Palm Oil, Pepper)
 */
async function analyzeEmergingCrops(chatId = null, bot = null) {
    const prompt = `
CAMBODIA EMERGING AGRICULTURAL CROPS ANALYSIS

Focus Sectors:

1. **CASSAVA & STARCH**
   • Export Value: $120M USD annually
   • Major Markets: China (70%), Vietnam (20%)
   • Processing: Dried chips, starch, ethanol potential
   • Growth: 8% annual increase

2. **PALM OIL**
   • Export Value: $85M USD annually  
   • Growth Rate: 15% annually
   • Sustainability: RSPO certification increasing
   • Investment: Malaysian & Indonesian companies active

3. **KAMPOT PEPPER**
   • Premium Product: Protected Geographic Indication
   • Export Value: $35M USD (10x premium pricing)
   • Markets: France, Japan, USA, Australia
   • Unique Position: World's finest pepper

Analysis Requirements:

1. **Market Development Potential**
   - Growth trajectory for each crop
   - Market saturation risks
   - New market opportunities

2. **Value Chain Optimization**
   - Processing capabilities needed
   - Export infrastructure requirements
   - Quality standards compliance

3. **Investment Analysis**
   - Capital requirements for expansion
   - ROI expectations by crop
   - Risk-return profiles

4. **Competitive Advantages**
   - Cambodia's unique positioning
   - Quality differentiation factors
   - Sustainability credentials

5. **Strategic Recommendations**
   - Priority crops for investment
   - Market development strategies
   - Infrastructure development needs

Provide actionable insights for agricultural investors and exporters.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🌿 Cambodia Emerging Crops Intelligence",
            forceModel: "gpt-5-mini"
        });

        return {
            analysis: result.response,
            sectors: {
                cassava: CAMBODIA_AGRICULTURAL_DATA.sectors.cassava,
                palmOil: CAMBODIA_AGRICULTURAL_DATA.sectors.palmOil,
                pepper: CAMBODIA_AGRICULTURAL_DATA.sectors.pepper
            },
            totalMarketSize: "$240M USD combined",
            keyOpportunities: [
                "Cassava processing expansion",
                "Sustainable palm oil certification", 
                "Kampot pepper premium marketing"
            ],
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Emerging crops analysis error:', error.message);
        return {
            analysis: `Emerging crops analysis unavailable: ${error.message}`,
            sectors: "cassava, palm oil, pepper",
            success: false,
            error: error.message
        };
    }
}

/**
 * 🚜 AgriTech Investment Analysis
 */
async function analyzeAgriTechOpportunities(chatId = null, bot = null) {
    const prompt = `
CAMBODIA AGRITECH INVESTMENT OPPORTUNITIES ANALYSIS

Current Agricultural Technology Landscape:
• Mechanization Level: Only 15% of farms mechanized
• Digital Adoption: <5% of farmers use digital tools
• Irrigation: 22% of agricultural land irrigated
• Precision Farming: Virtually non-existent
• Supply Chain: Largely manual and inefficient

Investment Opportunity Areas:

1. **Precision Agriculture**
   - IoT sensors for soil/weather monitoring
   - Drone-based crop monitoring and spraying
   - GPS-guided tractors and equipment
   - Data analytics for yield optimization

2. **Digital Platforms**
   - Farm management software
   - Market price information systems
   - Supply chain tracking
   - Financial services for farmers

3. **Processing Technology**
   - Automated rice mills
   - Cassava processing equipment
   - Fish processing and cold storage
   - Quality control systems

4. **Irrigation & Water Management**
   - Smart irrigation systems
   - Water conservation technology
   - Flood prediction and management
   - Drought-resistant crop varieties

Market Context:
• Small Holder Dominated: 85% of farms <2 hectares
• Limited Capital: Average farm income $1,200/year
• Government Support: National AgriTech strategy launched
• Foreign Investment: Growing interest from regional players

Provide comprehensive analysis:

1. **Market Sizing**
   - Total addressable market for each tech segment
   - Adoption timeline projections
   - Revenue potential analysis

2. **Implementation Challenges**
   - Affordability constraints
   - Digital literacy barriers
   - Infrastructure limitations

3. **Business Model Innovation**
   - Suitable financing mechanisms
   - Cooperative purchasing models
   - Service-based offerings

4. **Strategic Recommendations**
   - Priority technology areas
   - Partnership opportunities
   - Policy support requirements

5. **Investment Framework**
   - Expected returns by segment
   - Risk mitigation strategies
   - Exit opportunities

Focus on practical, scalable solutions for Cambodia's agricultural modernization.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🚜 Cambodia AgriTech Investment Analysis",
            forceModel: "gpt-5" // Full model for complex tech analysis
        });

        return {
            analysis: result.response,
            marketOpportunity: "$500M USD over 5 years",
            currentState: {
                mechanization: "15% of farms",
                digitalAdoption: "<5% of farmers",
                irrigationCoverage: "22% of land",
                avgFarmSize: "1.2 hectares"
            },
            keyAreas: [
                "Precision Agriculture",
                "Digital Platforms", 
                "Processing Technology",
                "Water Management"
            ],
            challenges: [
                "Small holder farms",
                "Limited capital",
                "Digital literacy",
                "Infrastructure gaps"
            ],
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ AgriTech analysis error:', error.message);
        return {
            analysis: `AgriTech analysis unavailable: ${error.message}`,
            opportunity: "Agricultural technology modernization",
            success: false,
            error: error.message
        };
    }
}

/**
 * 🌡️ Climate Impact & Adaptation Analysis
 */
async function analyzeClimateImpact(chatId = null, bot = null) {
    const prompt = `
CAMBODIA AGRICULTURAL CLIMATE IMPACT ANALYSIS

Climate Context:
• Temperature: Increasing 0.2°C per decade
• Rainfall: More irregular patterns, intense storms
• Flooding: Annual Mekong floods affecting 1.5M people
• Drought: Dry seasons becoming more severe
• Sea Level: Rising 3mm/year affecting coastal agriculture

Agricultural Vulnerabilities:
• Rice: Sensitive to temperature and water stress
• Rubber: Declining yields in some regions
• Fisheries: Changing water levels and temperatures
• Coastal: Saltwater intrusion threatening farmland

Current Adaptation Efforts:
• Climate-resilient rice varieties development
• Early warning systems implementation
• Improved irrigation infrastructure
• Crop diversification programs

Analysis Requirements:

1. **Risk Assessment by Sector**
   - Quantify climate risks for each major crop
   - Identify most vulnerable regions
   - Timeline for impact escalation

2. **Adaptation Strategies**
   - Technology solutions available
   - Cost-benefit analysis of adaptations
   - Best practice examples from region

3. **Investment Needs**
   - Infrastructure resilience improvements
   - Research and development priorities
   - Farmer training and support programs

4. **Opportunity Identification**
   - Climate-smart agriculture potential
   - Carbon credit opportunities
   - Sustainable intensification benefits

5. **Policy Framework**
   - Regulatory support needs
   - International cooperation opportunities
   - Financing mechanism requirements

Focus on actionable climate adaptation strategies for agricultural resilience.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "🌡️ Cambodia Agricultural Climate Analysis",
            forceModel: "gpt-5" // Full model for complex climate analysis
        });

        return {
            analysis: result.response,
            climateRisks: CAMBODIA_AGRICULTURAL_DATA.sustainability.climateRisks,
            adaptationMeasures: CAMBODIA_AGRICULTURAL_DATA.sustainability.adaptation,
            vulnerableSectors: ["Rice", "Rubber", "Coastal Fisheries"],
            opportunities: [
                "Climate-smart agriculture",
                "Carbon sequestration",
                "Drought-resistant varieties",
                "Flood management systems"
            ],
            success: result.success,
            aiUsed: result.aiUsed
        };

    } catch (error) {
        console.error('❌ Climate analysis error:', error.message);
        return {
            analysis: `Climate impact analysis unavailable: ${error.message}`,
            focus: "Agricultural climate adaptation",
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 Comprehensive Agricultural Portfolio Analysis  
 */
async function getAgriculturalPortfolioAnalysis(chatId = null, bot = null) {
    const prompt = `
COMPREHENSIVE CAMBODIA AGRICULTURAL SECTOR ANALYSIS

Executive Request: Complete agricultural investment portfolio analysis covering all major sectors.

Sector Overview:
• Total GDP Contribution: 41.2% of national GDP
• Export Value: $1.265B USD annually
• Employment: 48.7% of workforce (2.3M+ people)
• Land Use: 5.3M hectares agricultural land

Major Sectors Performance:
1. Rice: $450M exports (Premium jasmine varieties)
2. Rubber: $280M exports (Global rank #6)
3. Fisheries: $200M exports (Sustainable yield concerns)
4. Cassava: $120M exports (China demand driven)
5. Palm Oil: $85M exports (15% annual growth)
6. Pepper: $35M exports (Premium Kampot PGI)

Investment Themes:
• Value-Add Processing: $800M opportunity
• AgriTech Modernization: $500M opportunity  
• Logistics Infrastructure: $1.2B opportunity
• Sustainable Practices: Growing ESG demand
• Export Diversification: Reduce China dependency

Analysis Framework:

1. **Strategic Sector Analysis**
   - Growth potential ranking by sector
   - Investment attractiveness matrix
   - Risk-return profiles comparison

2. **Value Chain Optimization**
   - Processing infrastructure gaps
   - Export logistics bottlenecks
   - Technology adoption opportunities

3. **Competitive Positioning**
   - Cambodia vs regional competitors
   - Unique value propositions
   - Market differentiation strategies

4. **Investment Prioritization**
   - High-impact investment areas
   - Capital allocation recommendations
   - Timeline and sequencing strategy

5. **Risk Management Framework**
   - Climate change adaptation
   - Market diversification needs
   - Policy and regulatory risks

6. **Performance Metrics**
   - ROI expectations by sector
   - Job creation potential
   - Export growth projections

Provide executive-level strategic recommendations for agricultural investment portfolio optimization.
    `;

    try {
        const result = await executeEnhancedGPT5Command(prompt, chatId, bot, {
            title: "📊 Cambodia Agricultural Portfolio Analysis",
            forceModel: "gpt-5" // Full model for comprehensive analysis
        });

        return {
            analysis: result.response,
            portfolioOverview: {
                totalGdpContribution: CAMBODIA_AGRICULTURAL_DATA.economics.totalGdpContribution,
                totalExportValue: CAMBODIA_AGRICULTURAL_DATA.economics.totalExportValue,
                employmentShare: CAMBODIA_AGRICULTURAL_DATA.economics.employmentShare,
                majorSectors: Object.keys(CAMBODIA_AGRICULTURAL_DATA.sectors)
            },
            investmentOpportunities: CAMBODIA_AGRICULTURAL_DATA.opportunities,
            keyMetrics: {
                sectorCount: Object.keys(CAMBODIA_AGRICULTURAL_DATA.sectors).length,
                totalInvestmentNeeded: "$2.5B over 5-7 years",
                prioritySectors: ["Rice Processing", "AgriTech", "Fisheries Sustainability"]
            },
            success: result.success,
            aiUsed: result.aiUsed,
            comprehensive: true
        };

    } catch (error) {
        console.error('❌ Portfolio analysis error:', error.message);
        return {
            analysis: `Agricultural portfolio analysis unavailable: ${error.message}`,
            portfolioOverview: CAMBODIA_AGRICULTURAL_DATA.economics,
            success: false,
            error: error.message
        };
    }
}

/**
 * 🎯 Quick Agricultural Insights (Summary Function)
 */
function getAgriculturalQuickInsights() {
    return {
        sectorSummary: {
            totalSectors: Object.keys(CAMBODIA_AGRICULTURAL_DATA.sectors).length,
            gdpContribution: CAMBODIA_AGRICULTURAL_DATA.economics.totalGdpContribution,
            exportValue: CAMBODIA_AGRICULTURAL_DATA.economics.totalExportValue,
            employment: CAMBODIA_AGRICULTURAL_DATA.economics.employmentShare
        },
        
        topPerformers: {
            byExportValue: [
                { sector: "Rice", value: "$450M USD", rank: 1 },
                { sector: "Rubber", value: "$280M USD", rank: 2 },
                { sector: "Fisheries", value: "$200M USD", rank: 3 }
            ],
            byGrowthRate: [
                { sector: "Palm Oil", growth: "15% annually", trend: "strong" },
                { sector: "Aquaculture", growth: "15% annually", trend: "strong" },
                { sector: "Organic Farming", growth: "12% annually", trend: "emerging" }
            ]
        },
        
        investmentHighlights: {
            totalOpportunity: "$2.5B over 5-7 years",
            priorityAreas: [
                "Value-add processing ($800M)",
                "AgriTech modernization ($500M)", 
                "Logistics infrastructure ($1.2B)"
            ],
            sustainabilityFocus: "ESG compliance and climate adaptation"
        },
        
        keyRisks: [
            "Climate change impacts",
            "Infrastructure bottlenecks", 
            "Market concentration (China dependency)",
            "Limited mechanization"
        ],
        
        competitiveAdvantages: [
            "Premium rice quality (Jasmine varieties)",
            "Kampot pepper PGI status",
            "Large freshwater fisheries",
            "Low labor costs",
            "Strategic ASEAN location"
        ],

        dataTimestamp: new Date().toISOString(),
        nextUpdate: "Real-time analysis available via GPT-5 integration"
    };
}

// 📤 COMPREHENSIVE EXPORTS
module.exports = {
    // 📊 Data exports
    CAMBODIA_AGRICULTURAL_DATA,
    CAMBODIA_FISHERIES_DATA,
    
    // 🔍 Market analysis functions  
    analyzeRiceMarket,
    analyzeRubberMarket,
    analyzeFisheriesMarket,
    analyzeEmergingCrops,
    
    // 🚀 Advanced analysis functions
    analyzeAgriTechOpportunities,
    analyzeClimateImpact,
    getAgriculturalPortfolioAnalysis,
    
    // 🎯 Quick access functions
    getAgriculturalQuickInsights,
    
    // 📈 Sector-specific shortcuts
    getRiceIntelligence: analyzeRiceMarket,
    getRubberIntelligence: analyzeRubberMarket,
    getFisheriesIntelligence: analyzeFisheriesMarket,
    getAgriTechIntelligence: analyzeAgriTechOpportunities,
    getClimateIntelligence: analyzeClimateImpact
};

console.log('🌾 Cambodia Agricultural Intelligence Module Loaded');
console.log('📊 Coverage: Rice, Rubber, Fisheries, Cassava, Palm Oil, Pepper, Corn');
console.log('🚀 GPT-5 Enhanced Analysis: Market Intelligence + Investment Opportunities');
console.log('🎯 Total Market: $1.265B USD exports, 41.2% GDP contribution');
console.log('✅ Ready for comprehensive agricultural portfolio analysis');
