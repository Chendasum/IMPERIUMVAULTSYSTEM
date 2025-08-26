// cambodia/economicIntelligence.js - Cambodia Economic Intelligence & Market Timing
// Powered by IMPERIUM VAULT GPT-5 System

class CambodiaEconomicIntelligence {
    constructor() {
        this.economicIndicators = {
            'GDP Growth': {
                historical: '6-8% annually',
                current: '5-7% estimated',
                forecast: '6-8% medium term',
                drivers: ['Manufacturing', 'Services', 'Construction', 'Agriculture'],
                risks: ['Global slowdown', 'Political stability', 'Climate change'],
                wealthImpact: 'Strong GDP growth drives asset prices and business opportunities'
            },
            'Inflation Rate': {
                historical: '2-5% annually',
                current: '3-6% estimated',
                forecast: '3-5% target range',
                drivers: ['Food prices', 'Energy costs', 'Currency stability', 'Import prices'],
                risks: ['Global inflation', 'Supply chain disruptions', 'Currency devaluation'],
                wealthImpact: 'Moderate inflation supports real assets like property and stocks'
            },
            'Currency (KHR/USD)': {
                historical: '4000-4100 KHR per USD',
                current: '4000-4200 range',
                forecast: 'Gradual depreciation likely',
                drivers: ['Trade balance', 'Foreign investment', 'Tourism', 'Remittances'],
                risks: ['Dollar strength', 'Political instability', 'Current account deficit'],
                wealthImpact: 'USD investments provide currency hedge, KHR assets for local exposure'
            },
            'Interest Rates': {
                central_bank: '1.25-2.5% policy rate',
                deposit_rates: '3-8% depending on term',
                lending_rates: '8-18% depending on sector',
                trend: 'Gradual normalization',
                wealthImpact: 'Rising rates favor fixed income, may pressure equity valuations'
            },
            'Foreign Investment': {
                annual_fdi: '$2-4 billion',
                main_sources: ['China', 'Japan', 'South Korea', 'Singapore'],
                sectors: ['Manufacturing', 'Real Estate', 'Energy', 'Tourism'],
                trend: 'Steady inflows with diversification',
                wealthImpact: 'FDI drives economic growth and asset demand'
            },
            'Trade Balance': {
                exports: '$15-20 billion annually',
                imports: '$20-25 billion annually',
                deficit: '$3-6 billion typically',
                main_exports: ['Garments', 'Rice', 'Rubber', 'Tourism services'],
                main_imports: ['Machinery', 'Fuel', 'Consumer goods'],
                wealthImpact: 'Export growth supports currency and economic expansion'
            }
        };

        this.marketCycles = {
            'Property Cycle': {
                phase: 'Growth phase',
                duration: '7-10 years typically',
                drivers: ['Urbanization', 'Foreign investment', 'Economic growth'],
                timing: 'Early to mid-cycle currently',
                opportunity: 'Continue buying in growth areas',
                risk: 'Oversupply in some segments'
            },
            'Business Cycle': {
                phase: 'Expansion phase',
                duration: '5-8 years typically',
                drivers: ['Infrastructure investment', 'Manufacturing growth', 'Consumer demand'],
                timing: 'Mid-cycle expansion',
                opportunity: 'Invest in growth sectors',
                risk: 'Labor shortages, cost inflation'
            },
            'Stock Market Cycle': {
                phase: 'Development phase',
                duration: 'Long-term growth trend',
                drivers: ['Market development', 'New listings', 'Foreign participation'],
                timing: 'Early stage development',
                opportunity: 'Long-term accumulation',
                risk: 'Low liquidity, volatility'
            },
            'Credit Cycle': {
                phase: 'Expansion phase',
                duration: '5-7 years typically',
                drivers: ['Banking development', 'Economic growth', 'Financial inclusion'],
                timing: 'Mid-cycle expansion',
                opportunity: 'Access to credit improving',
                risk: 'Asset quality concerns'
            }
        };

        this.geopoliticalFactors = {
            'China Relations': {
                impact: 'Very High',
                trends: ['Belt and Road Initiative', 'Trade partnerships', 'Infrastructure investment'],
                opportunities: ['Manufacturing', 'Infrastructure', 'Trade facilitation'],
                risks: ['Dependency', 'Debt sustainability', 'Geopolitical tensions'],
                wealthStrategy: 'Benefit from infrastructure while diversifying exposure'
            },
            'ASEAN Integration': {
                impact: 'High',
                trends: ['Regional trade growth', 'Investment flows', 'Economic cooperation'],
                opportunities: ['Export markets', 'Regional supply chains', 'Tourism'],
                risks: ['Competition', 'Standards harmonization', 'Economic disparities'],
                wealthStrategy: 'Position for regional growth and integration benefits'
            },
            'US-China Relations': {
                impact: 'Medium-High',
                trends: ['Trade war impacts', 'Supply chain shifts', 'Investment diversification'],
                opportunities: ['Manufacturing relocation', 'Alternative supply chains'],
                risks: ['Economic volatility', 'Policy uncertainty', 'Trade disruptions'],
                wealthStrategy: 'Hedge against global tensions with diverse assets'
            },
            'Climate Change': {
                impact: 'Medium',
                trends: ['Extreme weather', 'Sustainable development', 'Green financing'],
                opportunities: ['Renewable energy', 'Climate adaptation', 'ESG investing'],
                risks: ['Agricultural impact', 'Infrastructure damage', 'Economic disruption'],
                wealthStrategy: 'Invest in climate-resilient and sustainable assets'
            }
        };

        this.investmentTiming = {
            'Buy Signals': [
                'GDP growth above 6%',
                'Political stability indicators strong',
                'Currency stability maintained',
                'Foreign investment inflows increasing',
                'Infrastructure spending announced',
                'Tourism recovery momentum'
            ],
            'Caution Signals': [
                'GDP growth below 4%',
                'Political uncertainty rising',
                'Currency under pressure',
                'Foreign investment declining',
                'High inflation (>6%)',
                'Regional economic slowdown'
            ],
            'Sell Signals': [
                'GDP contraction',
                'Political instability/crisis',
                'Currency crisis',
                'Capital flight',
                'Banking system stress',
                'Major external shocks'
            ]
        };
    }

    // 📊 MAIN ECONOMIC ANALYSIS FUNCTIONS

    async analyzeEconomicConditions(timeframe, sectors, chatId, bot = null) {
        try {
            console.log(`📊 Analyzing economic conditions: ${timeframe}, Sectors: ${sectors}`);

            const prompt = `CAMBODIA ECONOMIC INTELLIGENCE ANALYSIS

**Analysis Parameters:**
- Time Horizon: ${timeframe}
- Focus Sectors: ${sectors}

**Comprehensive Economic Intelligence Required:**

1. **MACROECONOMIC ASSESSMENT**
   - Current GDP growth trends and drivers
   - Inflation dynamics and price stability
   - Currency stability and exchange rate outlook
   - Interest rate environment and monetary policy
   - Fiscal policy and government spending priorities
   - Balance of payments and external stability

2. **SECTORAL ECONOMIC ANALYSIS**
   - ${sectors} sector economic performance and outlook
   - Growth drivers and constraints by sector
   - Investment flows and capacity utilization
   - Employment trends and labor market dynamics
   - Productivity growth and competitiveness
   - Export performance and market access

3. **MARKET CYCLES & TIMING**
   - Current position in economic and market cycles
   - Property market cycle analysis and timing
   - Business investment cycle assessment
   - Credit cycle position and banking health
   - Consumer spending patterns and confidence
   - Investment sentiment and capital flows

4. **GEOPOLITICAL & STRUCTURAL FACTORS**
   - China relations and Belt and Road impact
   - ASEAN integration benefits and challenges
   - Global trade dynamics and supply chain shifts
   - Climate change impacts and adaptation needs
   - Demographic trends and urbanization effects
   - Technology adoption and digital transformation

5. **RISK ASSESSMENT & SCENARIOS**
   - Key economic risks and vulnerabilities
   - Political stability and policy continuity
   - External shock resilience and adaptability
   - Financial system stability and development
   - Social stability and inequality trends
   - Environmental and climate risks

6. **INVESTMENT TIMING & OPPORTUNITIES**
   - Optimal timing for different asset classes
   - Sector rotation and investment themes
   - Risk-adjusted opportunity assessment
   - Market entry and exit timing guidance
   - Portfolio positioning recommendations
   - Hedging and risk management strategies

**Economic Data Context:**
- Historical GDP Growth: 6-8% annually
- Current Growth Estimate: 5-7%
- Inflation Target: 3-5%
- FDI Inflows: $2-4 billion annually
- Trade Deficit: $3-6 billion typically
- Currency Range: 4000-4200 KHR/USD

**Provide actionable economic intelligence for wealth building decisions in ${timeframe} timeframe.**`;

            const result = await executeEnhancedGPT5Command(
                prompt, 
                chatId, 
                bot,
                {
                    title: `📊 Cambodia Economic Intelligence Analysis`,
                    forceModel: 'gpt-5',
                    max_output_tokens: 12000,
                    reasoning_effort: 'high',
                    verbosity: 'high'
                }
            );

            return {
                success: true,
                analysis: result.response,
                timeframe: timeframe,
                sectors: sectors,
                economicIndicators: this.getCurrentIndicators(),
                marketCycles: this.getCurrentCycles(),
                investmentTiming: this.getTimingSignals(),
                riskFactors: this.getRiskAssessment()
            };

        } catch (error) {
            console.error('❌ Economic conditions analysis error:', error.message);
            throw error;
        }
    }

    async analyzeMarketTiming(assetClass, investmentHorizon, riskTolerance, chatId, bot = null) {
        try {
            const prompt = `CAMBODIA MARKET TIMING ANALYSIS

**Market Timing Parameters:**
- Asset Class: ${assetClass}
- Investment Horizon: ${investmentHorizon}
- Risk Tolerance: ${riskTolerance}

**Comprehensive Market Timing Analysis:**

1. **CURRENT MARKET POSITION**
   - ${assetClass} market cycle analysis and current phase
   - Valuation metrics and historical comparisons
   - Supply and demand dynamics assessment
   - Market sentiment and investor behavior
   - Technical indicators and trend analysis
   - Momentum and contrarian signals

2. **ECONOMIC TIMING FACTORS**
   - Macroeconomic cycle position and outlook
   - Interest rate cycle and monetary policy impact
   - Credit cycle and financing conditions
   - Inflation cycle and real return implications
   - Currency cycle and foreign investment flows
   - Government policy cycle and regulatory changes

3. **SECTOR-SPECIFIC TIMING**
   - ${assetClass} sector fundamentals and growth outlook
   - Industry lifecycle and development stage
   - Competitive dynamics and market structure
   - Technology disruption and innovation impacts
   - Regulatory environment and policy support
   - Global trends and local market integration

4. **RISK-REWARD ASSESSMENT**
   - Current risk-adjusted return opportunities
   - Probability-weighted scenario analysis
   - Downside protection and tail risk assessment
   - Upside potential and growth catalysts
   - Volatility expectations and range trading
   - Correlation analysis and diversification benefits

5. **TIMING SIGNALS & INDICATORS**
   - Buy, hold, or sell signals analysis
   - Leading and lagging indicator assessment
   - Market breadth and participation analysis
   - Sentiment indicators and crowd psychology
   - Technical analysis and chart patterns
   - Fundamental value vs market price gaps

6. **STRATEGIC TIMING RECOMMENDATIONS**
   - Optimal entry timing and accumulation strategy
   - Position sizing and dollar-cost averaging
   - Exit timing and profit-taking approaches
   - Hedging and risk management timing
   - Rebalancing frequency and triggers
   - Market timing vs time-in-market balance

**Market Timing Context:**
- Current Economic Phase: Expansion
- Property Cycle: Growth phase
- Stock Market: Development phase
- Credit Cycle: Mid-cycle expansion
- Investment Climate: Generally favorable
- Risk Environment: Moderate

**Provide specific market timing guidance with clear entry/exit recommendations.**`;

            const result = await executeEnhancedGPT5Command(
                prompt,
                chatId,
                bot,
                {
                    title: `⏰ Cambodia Market Timing Analysis - ${assetClass}`,
                    forceModel: 'gpt-5',
                    max_output_tokens: 10000,
                    reasoning_effort: 'high',
                    verbosity: 'high'
                }
            );

            return {
                success: true,
                analysis: result.response,
                assetClass: assetClass,
                investmentHorizon: investmentHorizon,
                riskTolerance: riskTolerance,
                timingSignals: this.getAssetTimingSignals(assetClass),
                marketCycle: this.getAssetCyclePosition(assetClass)
            };

        } catch (error) {
            console.error('❌ Market timing analysis error:', error.message);
            throw error;
        }
    }

    async analyzeGeopoliticalImpact(events, portfolioExposure, timeframe, chatId, bot = null) {
        try {
            const prompt = `CAMBODIA GEOPOLITICAL IMPACT ANALYSIS

**Geopolitical Parameters:**
- Events/Factors: ${events}
- Portfolio Exposure: ${portfolioExposure}
- Analysis Timeframe: ${timeframe}

**Comprehensive Geopolitical Analysis:**

1. **GEOPOLITICAL LANDSCAPE ASSESSMENT**
   - Current geopolitical tensions and developments
   - China-Cambodia relations and strategic implications
   - US-China tensions impact on Cambodia
   - ASEAN dynamics and regional integration
   - Bilateral relationships with key partners
   - International organization engagement (IMF, World Bank, ADB)

2. **ECONOMIC IMPACT ANALYSIS**
   - Trade relationships and export market access
   - Foreign direct investment flows and patterns
   - Supply chain disruptions and opportunities
   - Tourism impact from regional developments
   - Currency stability and capital flow effects
   - Commodity price impacts and terms of trade

3. **INVESTMENT IMPLICATIONS**
   - ${portfolioExposure} exposure to geopolitical risks
   - Sector-specific impacts and opportunities
   - Asset class rotation and reallocation needs
   - Currency hedging and exposure management
   - Country risk assessment and monitoring
   - Exit strategy and liquidity planning

4. **POLICY RESPONSE ANALYSIS**
   - Government policy responses and adaptations
   - Regulatory changes and investment rules
   - Trade policy adjustments and negotiations
   - Infrastructure development priorities
   - Economic diversification strategies
   - Financial market development plans

5. **SCENARIO PLANNING**
   - Base case scenario and probability
   - Upside scenario with growth catalysts
   - Downside scenario and risk factors
   - Stress testing and extreme scenarios
   - Portfolio impact under each scenario
   - Risk mitigation and opportunity capture

6. **STRATEGIC RECOMMENDATIONS**
   - Portfolio positioning for geopolitical resilience
   - Hedging strategies and risk management
   - Opportunity identification and timing
   - Diversification and concentration balance
   - Monitoring framework and early warning signals
   - Contingency planning and response strategies

**Geopolitical Context:**
- China Relations: Very High Impact
- ASEAN Integration: High Impact  
- US-China Tensions: Medium-High Impact
- Climate Change: Medium Impact
- Regional Stability: Generally Positive
- Investment Climate: Cautiously Optimistic

**Provide actionable geopolitical intelligence for investment decision-making.**`;

            const result = await executeEnhancedGPT5Command(
                prompt,
                chatId,
                bot,
                {
                    title: `🌍 Cambodia Geopolitical Impact Analysis`,
                    forceModel: 'gpt-5',
                    max_output_tokens: 10000,
                    reasoning_effort: 'high',
                    verbosity: 'high'
                }
            );

            return {
                success: true,
                analysis: result.response,
                events: events,
                portfolioExposure: portfolioExposure,
                timeframe: timeframe,
                geopoliticalFactors: this.geopoliticalFactors,
                riskMatrix: this.getGeopoliticalRiskMatrix()
            };

        } catch (error) {
            console.error('❌ Geopolitical impact analysis error:', error.message);
            throw error;
        }
    }

    // 📊 HELPER FUNCTIONS

    getCurrentIndicators() {
        return this.economicIndicators;
    }

    getCurrentCycles() {
        return this.marketCycles;
    }

    getTimingSignals() {
        return this.investmentTiming;
    }

    getRiskAssessment() {
        return {
            economicRisk: 'Medium - Steady growth with some vulnerabilities',
            politicalRisk: 'Medium - Stable but evolving',
            currencyRisk: 'Medium - Gradual depreciation likely',
            externalRisk: 'Medium-High - Global dependencies',
            overallRisk: 'Medium - Manageable with proper diversification'
        };
    }

    getAssetTimingSignals(assetClass) {
        const signals = {
            'Real Estate': {
                buy: ['Urban growth', 'Infrastructure development', 'Foreign investment'],
                hold: ['Market maturity', 'Regulatory stability', 'Liquidity constraints'],
                caution: ['Oversupply', 'Speculation', 'Policy changes']
            },
            'Stocks': {
                buy: ['Market development', 'New listings', 'Economic growth'],
                hold: ['Limited liquidity', 'Small market size', 'Valuation concerns'],
                caution: ['Political uncertainty', 'External shocks', 'Low volumes']
            },
            'Bonds': {
                buy: ['Yield attractive', 'Government backing', 'Portfolio diversification'],
                hold: ['Interest rate stability', 'Credit quality', 'Currency hedging'],
                caution: ['Rising rates', 'Inflation', 'Currency weakness']
            },
            'Business': {
                buy: ['Economic expansion', 'Labor availability', 'Market growth'],
                hold: ['Competition increase', 'Cost pressures', 'Regulatory changes'],
                caution: ['Economic slowdown', 'Political instability', 'External shocks']
            }
        };

        return signals[assetClass] || {
            buy: ['Economic growth', 'Market development', 'Foreign investment'],
            hold: ['Stable conditions', 'Moderate growth', 'Policy continuity'],
            caution: ['Economic uncertainty', 'Political risks', 'External pressures']
        };
    }

    getAssetCyclePosition(assetClass) {
        const cycles = {
            'Real Estate': 'Growth phase - Early to mid-cycle',
            'Stocks': 'Development phase - Long-term growth trend',
            'Bonds': 'Expansion phase - Yield normalization',
            'Business': 'Expansion phase - Mid-cycle growth'
        };

        return cycles[assetClass] || 'Analysis required for specific asset class';
    }

    getGeopoliticalRiskMatrix() {
        return {
            'China Relations': { probability: 'High', impact: 'Very High', trend: 'Stable' },
            'ASEAN Integration': { probability: 'High', impact: 'High', trend: 'Positive' },
            'US-China Tensions': { probability: 'Medium', impact: 'Medium-High', trend: 'Volatile' },
            'Regional Stability': { probability: 'High', impact: 'Medium', trend: 'Stable' },
            'Climate Impact': { probability: 'Medium', impact: 'Medium', trend: 'Increasing' }
        };
    }

    // 🎯 QUICK ACCESS METHODS

    async quickEconomicAnalysis(message, chatId, bot = null) {
        const timeframe = this.extractTimeframe(message) || '12 months';
        const sectors = this.extractSectors(message) || 'General Economy';

        return await this.analyzeEconomicConditions(timeframe, sectors, chatId, bot);
    }

    async quickTimingAnalysis(message, chatId, bot = null) {
        const assetClass = this.extractAssetClass(message) || 'General Investment';
        const horizon = this.extractHorizon(message) || '3-5 years';
        const risk = this.extractRisk(message) || 'Medium';

        return await this.analyzeMarketTiming(assetClass, horizon, risk, chatId, bot);
    }

    extractTimeframe(message) {
        const timeframes = ['6 months', '12 months', '18 months', '2 years', '3 years', '5 years'];
        return timeframes.find(tf => message.toLowerCase().includes(tf.toLowerCase()));
    }

    extractSectors(message) {
        const sectors = ['real estate', 'manufacturing', 'tourism', 'banking', 'agriculture', 'technology'];
        const found = sectors.filter(sector => message.toLowerCase().includes(sector));
        return found.length > 0 ? found.join(', ') : null;
    }

    extractAssetClass(message) {
        const assets = ['real estate', 'stocks', 'bonds', 'business', 'property', 'equities'];
        return assets.find(asset => message.toLowerCase().includes(asset));
    }

    extractHorizon(message) {
        const horizons = ['short term', 'medium term', 'long term', '1-2 years', '3-5 years', '5+ years'];
        return horizons.find(horizon => message.toLowerCase().includes(horizon.replace(/[^\w\s]/g, '')));
    }

    extractRisk(message) {
        const risks = ['conservative', 'low', 'moderate', 'medium', 'aggressive', 'high'];
        return risks.find(risk => message.toLowerCase().includes(risk));
    }

    // 📈 ECONOMIC INTELLIGENCE REPORTS

    async getEconomicOutlook(timeframe, chatId, bot = null) {
        const prompt = `CAMBODIA ECONOMIC OUTLOOK REPORT

**Outlook Timeframe: ${timeframe}**

**Comprehensive Economic Outlook:**

1. **MACROECONOMIC PROJECTIONS**
   - GDP growth forecasts and confidence intervals
   - Inflation outlook and price stability assessment
   - Currency projections and exchange rate stability
   - Interest rate outlook and monetary policy path
   - Fiscal outlook and government spending priorities
   - External balance and current account projections

2. **SECTORAL OUTLOOK**
   - Manufacturing sector growth and competitiveness
   - Services sector expansion and modernization
   - Agriculture sector development and productivity
   - Construction and real estate market outlook
   - Tourism recovery and growth prospects
   - Technology sector emergence and potential

3. **INVESTMENT CLIMATE ASSESSMENT**
   - Foreign direct investment outlook and trends
   - Domestic investment conditions and incentives
   - Infrastructure development pipeline and impact
   - Regulatory environment and policy predictability
   - Financial market development and access
   - Business confidence and sentiment trends

4. **RISK FACTORS & CHALLENGES**
   - Domestic economic risks and vulnerabilities
   - External risks and global economic linkages
   - Political risks and policy uncertainty
   - Environmental risks and climate adaptation
   - Social risks and inequality challenges
   - Financial risks and banking system stability

5. **OPPORTUNITIES & CATALYSTS**
   - Emerging economic opportunities and themes
   - Policy initiatives and reform programs
   - Infrastructure projects and connectivity
   - Regional integration and trade opportunities
   - Demographic dividend and human capital
   - Technology adoption and digital transformation

6. **STRATEGIC IMPLICATIONS**
   - Investment timing and sector allocation
   - Risk management and hedging strategies
   - Market entry and expansion opportunities
   - Portfolio positioning and asset allocation
   - Exit timing and profit realization
   - Long-term wealth building strategies

**Economic Context:**
- Historical Growth: 6-8% GDP annually
- Development Stage: Lower middle income
- Key Strengths: Young population, strategic location, political stability
- Key Challenges: Infrastructure gaps, skills shortage, economic diversification
- Growth Drivers: Manufacturing, tourism, agriculture, services

**Provide actionable economic outlook for investment and business decisions.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: `📊 Cambodia Economic Outlook - ${timeframe}`,
                forceModel: 'gpt-5',
                max_output_tokens: 10000,
                reasoning_effort: 'high',
                verbosity: 'high'
            }
        );

        return result;
    }

    async getPolicyAnalysis(policyArea, chatId, bot = null) {
        const prompt = `CAMBODIA POLICY ANALYSIS & INVESTMENT IMPACT

**Policy Focus Area: ${policyArea}**

**Comprehensive Policy Analysis:**

1. **CURRENT POLICY LANDSCAPE**
   - Existing policies and regulatory framework in ${policyArea}
   - Recent policy changes and implementation status
   - Government priorities and strategic objectives
   - International commitments and alignment
   - Stakeholder consultation and feedback processes
   - Implementation timeline and milestones

2. **POLICY EFFECTIVENESS ASSESSMENT**
   - Achievement of stated policy objectives
   - Economic impact and measurable outcomes
   - Unintended consequences and side effects
   - Cost-benefit analysis and resource allocation
   - International best practice comparison
   - Stakeholder satisfaction and compliance

3. **UPCOMING POLICY DEVELOPMENTS**
   - Proposed policy changes and reforms
   - Legislative pipeline and approval process
   - International pressure and recommendations
   - Consultation processes and stakeholder input
   - Expected timeline and implementation phases
   - Political feasibility and consensus building

4. **INVESTMENT IMPLICATIONS**
   - Direct impact on investment opportunities
   - Regulatory compliance requirements and costs
   - Market access and competitive dynamics
   - Risk profile changes and mitigation needs
   - Sector rotation and allocation adjustments
   - Long-term strategic positioning implications

5. **BUSINESS IMPACT ANALYSIS**
   - Operational changes and adaptation requirements
   - Cost structure impacts and margin effects
   - Market opportunities and competitive advantages
   - Compliance burdens and administrative costs
   - Strategic partnerships and alliance needs
   - Exit strategy and risk management considerations

6. **STRATEGIC RECOMMENDATIONS**
   - Investment timing relative to policy changes
   - Sector and asset allocation adjustments
   - Risk management and hedging strategies
   - Regulatory compliance and preparation
   - Government relations and engagement
   - Long-term positioning and adaptation

**Policy Context Areas:**
- Foreign Investment: Openness and restrictions
- Tax Policy: Incentives and obligations
- Labor Policy: Workforce and regulations
- Environmental Policy: Sustainability and compliance
- Trade Policy: Export promotion and market access
- Financial Policy: Banking and capital markets

**Provide actionable policy intelligence for investment decision-making.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: `📋 Cambodia Policy Analysis - ${policyArea}`,
                forceModel: 'gpt-5-mini',
                max_output_tokens: 8000,
                reasoning_effort: 'medium',
                verbosity: 'high'
            }
        );

        return result;
    }

    // 🌐 REGIONAL & GLOBAL INTELLIGENCE

    async getRegionalAnalysis(focus, chatId, bot = null) {
        const prompt = `CAMBODIA REGIONAL ECONOMIC INTELLIGENCE

**Regional Focus: ${focus}**

**Comprehensive Regional Analysis:**

1. **ASEAN INTEGRATION IMPACT**
   - ASEAN Economic Community benefits and challenges
   - Trade creation and diversion effects
   - Investment flows and regional supply chains
   - Regulatory harmonization and standards
   - Market access improvements and restrictions
   - Competitive positioning within ASEAN

2. **CHINA-CAMBODIA ECONOMIC RELATIONS**
   - Belt and Road Initiative projects and impact
   - Trade relationships and dependency analysis
   - Investment flows and sector concentration
   - Infrastructure development and connectivity
   - Technology transfer and industrial cooperation
   - Debt sustainability and financial implications

3. **GLOBAL ECONOMIC LINKAGES**
   - Export market dependence and diversification
   - Global supply chain integration and risks
   - Commodity price impacts and terms of trade
   - Foreign exchange earnings and stability
   - Tourism source markets and vulnerability
   - Capital flow sensitivity and volatility

4. **COMPETITIVE POSITIONING**
   - Competitive advantages and disadvantages
   - Cost competitiveness and productivity
   - Infrastructure quality and connectivity
   - Human capital and skills development
   - Innovation capacity and technology adoption
   - Business environment and ease of doing business

5. **REGIONAL OPPORTUNITIES**
   - Emerging market opportunities and niches
   - Regional value chain participation
   - Cross-border investment and partnerships
   - Tourism and services trade potential
   - Digital economy and fintech opportunities
   - Sustainable development and green finance

6. **INVESTMENT STRATEGY IMPLICATIONS**
   - Regional portfolio diversification benefits
   - Cross-border investment opportunities
   - Currency and political risk hedging
   - Market timing and regional cycles
   - Sector rotation and regional themes
   - Long-term positioning and adaptation

**Regional Context:**
- ASEAN Growth: 4-6% regional average
- China Relations: Strategic partnership
- Global Integration: Increasing connectivity
- Competitive Position: Cost-competitive with infrastructure gaps
- Regional Role: Manufacturing and tourism hub potential

**Provide actionable regional intelligence for investment positioning.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: `🌏 Cambodia Regional Economic Analysis`,
                forceModel: 'gpt-5-mini',
                max_output_tokens: 8000,
                reasoning_effort: 'medium',
                verbosity: 'high'
            }
        );

        return result;
    }
}

// Export singleton instance
const cambodiaEconomic = new CambodiaEconomicIntelligence();

module.exports = {
    // Main analysis functions
    analyzeEconomicConditions: (timeframe, sectors, chatId, bot) => 
        cambodiaEconomic.analyzeEconomicConditions(timeframe, sectors, chatId, bot),
    
    analyzeMarketTiming: (assetClass, investmentHorizon, riskTolerance, chatId, bot) => 
        cambodiaEconomic.analyzeMarketTiming(assetClass, investmentHorizon, riskTolerance, chatId, bot),
    
    analyzeGeopoliticalImpact: (events, portfolioExposure, timeframe, chatId, bot) => 
        cambodiaEconomic.analyzeGeopoliticalImpact(events, portfolioExposure, timeframe, chatId, bot),

    // Quick access methods
    quickEconomicAnalysis: (message, chatId, bot) => 
        cambodiaEconomic.quickEconomicAnalysis(message, chatId, bot),
    
    quickTimingAnalysis: (message, chatId, bot) => 
        cambodiaEconomic.quickTimingAnalysis(message, chatId, bot),

    // Intelligence reports
    getEconomicOutlook: (timeframe, chatId, bot) => 
        cambodiaEconomic.getEconomicOutlook(timeframe, chatId, bot),
    
    getPolicyAnalysis: (policyArea, chatId, bot) => 
        cambodiaEconomic.getPolicyAnalysis(policyArea, chatId, bot),
    
    getRegionalAnalysis: (focus, chatId, bot) => 
        cambodiaEconomic.getRegionalAnalysis(focus, chatId, bot),

    // Data access
    getEconomicIndicators: () => cambodiaEconomic.economicIndicators,
    getMarketCycles: () => cambodiaEconomic.marketCycles,
    getGeopoliticalFactors: () => cambodiaEconomic.geopoliticalFactors,
    getInvestmentTiming: () => cambodiaEconomic.investmentTiming,

    // Export class for advanced usage
    CambodiaEconomicIntelligence: cambodiaEconomic
};

console.log('📊 Cambodia Economic Intelligence & Market Timing Module loaded');
console.log('💡 Features: Economic analysis, market timing, geopolitical intelligence');
console.log('📈 Indicators: GDP, inflation, currency, interest rates, FDI, trade balance');
console.log('⏰ Timing: Market cycles, investment signals, buy/hold/sell recommendations');
console.log('🌍 Geopolitical: China relations, ASEAN integration, global linkages');
console.log('🎯 Intelligence: Policy analysis, regional positioning, economic outlook');
console.log('🇰🇭 Cambodia economic ecosystem mastery with GPT-5 integration');
