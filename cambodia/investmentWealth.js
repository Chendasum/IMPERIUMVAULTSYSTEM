// cambodia/investmentWealth.js - Cambodia Financial Markets & Investment Wealth Intelligence
// Powered by IMPERIUM VAULT GPT-5 System

class CambodiaInvestmentWealth {
    constructor() {
        this.financialMarkets = {
            'Cambodia Stock Exchange (CSX)': {
                totalCompanies: '15+',
                marketCap: '$2.5B+',
                mainSectors: ['Banking', 'Insurance', 'Real Estate', 'Manufacturing', 'Tourism'],
                tradingHours: '9:00 AM - 11:30 AM',
                currency: 'KHR and USD',
                minInvestment: '$1,000',
                expectedReturns: '8-25% annually',
                liquidity: 'Limited but improving',
                risks: ['Low liquidity', 'Limited companies', 'Regulatory development']
            },
            'Government Bonds': {
                types: ['Treasury Bills', 'Government Bonds', 'Development Bonds'],
                denominations: ['USD', 'KHR'],
                yields: '4-8% annually',
                maturity: '3 months - 10 years',
                minInvestment: '$1,000',
                risks: ['Currency risk (KHR)', 'Interest rate risk', 'Sovereign risk'],
                advantages: ['Government backing', 'Regular income', 'Portfolio diversification']
            },
            'Banking Sector': {
                types: ['Commercial Banks', 'Microfinance', 'Specialized Banks'],
                opportunities: ['Bank stocks', 'Bank deposits', 'Partnership investments'],
                yields: '3-12% annually',
                growth: '15-20% sector growth',
                risks: ['Credit risk', 'Regulatory changes', 'Competition'],
                advantages: ['Growing economy', 'Financial inclusion', 'Stable dividends']
            },
            'Private Equity & Venture Capital': {
                focus: ['SME investments', 'Growth companies', 'Real estate funds'],
                minInvestment: '$25,000 - $500,000',
                timeHorizon: '3-7 years',
                expectedReturns: '15-30% IRR',
                sectors: ['Technology', 'Healthcare', 'Consumer goods', 'Financial services'],
                risks: ['Illiquidity', 'Due diligence challenges', 'Exit limitations']
            }
        };

        this.investmentVehicles = {
            'Direct Stock Investment': {
                description: 'Buy shares directly on CSX',
                pros: ['Direct ownership', 'Voting rights', 'Full upside potential'],
                cons: ['High minimum', 'Research intensive', 'Limited diversification'],
                suitableFor: ['Experienced investors', 'Large capital', 'Long-term horizon']
            },
            'Mutual Funds': {
                description: 'Pooled investment funds (limited options)',
                pros: ['Professional management', 'Diversification', 'Lower minimums'],
                cons: ['Management fees', 'Limited options', 'Less control'],
                suitableFor: ['Retail investors', 'Diversification seekers', 'Passive investors']
            },
            'Fixed Income': {
                description: 'Government and corporate bonds',
                pros: ['Stable income', 'Principal protection', 'Portfolio balance'],
                cons: ['Lower returns', 'Interest rate risk', 'Inflation risk'],
                suitableFor: ['Conservative investors', 'Income seekers', 'Capital preservation']
            },
            'Alternative Investments': {
                description: 'Real estate funds, commodities, private equity',
                pros: ['Higher returns potential', 'Diversification', 'Inflation hedge'],
                cons: ['Higher risk', 'Illiquidity', 'Complex structures'],
                suitableFor: ['Sophisticated investors', 'Long-term capital', 'Risk tolerance']
            }
        };

        this.portfolioStrategies = {
            'Conservative Growth': {
                allocation: '20% Stocks, 60% Bonds, 20% Cash/Deposits',
                expectedReturn: '6-10% annually',
                riskLevel: 'Low-Medium',
                timeHorizon: '3-10 years',
                suitableFor: 'Capital preservation with modest growth'
            },
            'Balanced Growth': {
                allocation: '40% Stocks, 40% Bonds, 10% Real Estate, 10% Cash',
                expectedReturn: '8-15% annually',
                riskLevel: 'Medium',
                timeHorizon: '5-15 years',
                suitableFor: 'Balanced risk-return profile'
            },
            'Aggressive Growth': {
                allocation: '60% Stocks, 20% Private Equity, 15% Real Estate, 5% Cash',
                expectedReturn: '12-25% annually',
                riskLevel: 'High',
                timeHorizon: '7-20 years',
                suitableFor: 'Long-term wealth building, higher risk tolerance'
            },
            'Cambodia Focus': {
                allocation: '50% Cambodia Assets, 30% Regional, 20% Global',
                expectedReturn: '10-20% annually',
                riskLevel: 'Medium-High',
                timeHorizon: '5-15 years',
                suitableFor: 'Cambodia economy believers, local expertise'
            }
        };

        this.riskFactors = {
            'Political Risk': {
                level: 'Medium',
                factors: ['Government stability', 'Policy changes', 'Regulatory environment'],
                mitigation: ['Diversification', 'Government bonds', 'Exit strategies']
            },
            'Currency Risk': {
                level: 'Medium-High',
                factors: ['KHR volatility', 'USD dependence', 'Inflation'],
                mitigation: ['USD investments', 'Currency hedging', 'Hard assets']
            },
            'Liquidity Risk': {
                level: 'High',
                factors: ['Small market size', 'Limited trading', 'Exit challenges'],
                mitigation: ['Diversification', 'Long-term horizon', 'Quality assets']
            },
            'Credit Risk': {
                level: 'Medium',
                factors: ['Banking system development', 'Corporate governance', 'Economic cycles'],
                mitigation: ['Due diligence', 'Diversification', 'Government securities']
            }
        };
    }

    // 📈 MAIN INVESTMENT ANALYSIS FUNCTIONS

    async analyzePortfolioStrategy(investmentAmount, riskTolerance, timeHorizon, objectives, chatId, bot = null) {
        try {
            console.log(`📈 Analyzing portfolio strategy: ${investmentAmount}, Risk: ${riskTolerance}, Time: ${timeHorizon}`);

            const prompt = `CAMBODIA INVESTMENT PORTFOLIO STRATEGY ANALYSIS

**Investment Parameters:**
- Investment Amount: ${investmentAmount}
- Risk Tolerance: ${riskTolerance}
- Time Horizon: ${timeHorizon}
- Investment Objectives: ${objectives}

**Comprehensive Portfolio Analysis Required:**

1. **STRATEGIC ASSET ALLOCATION**
   - Optimal asset allocation for Cambodia-focused portfolio
   - Risk-adjusted returns and expected performance
   - Diversification across asset classes and sectors
   - Geographic allocation (Cambodia vs Regional vs Global)
   - Currency exposure and hedging strategies

2. **CAMBODIA INVESTMENT OPPORTUNITIES**
   - Cambodia Stock Exchange (CSX) investment options
   - Government bonds and fixed income opportunities
   - Private equity and venture capital access
   - Real estate investment trusts and funds
   - Banking sector investment opportunities

3. **PORTFOLIO CONSTRUCTION**
   - Specific investment recommendations by asset class
   - Position sizing and concentration limits
   - Investment timing and implementation strategy
   - Rebalancing frequency and triggers
   - Tax optimization and efficiency strategies

4. **RISK MANAGEMENT**
   - Portfolio risk assessment and measurement
   - Specific Cambodia risks (political, currency, liquidity)
   - Risk mitigation and hedging strategies
   - Stress testing and scenario analysis
   - Insurance and protection strategies

5. **PERFORMANCE MONITORING**
   - Key performance indicators and benchmarks
   - Reporting and review frequency
   - Performance attribution analysis
   - Rebalancing triggers and methodology
   - Exit strategies and liquidity planning

6. **IMPLEMENTATION ROADMAP**
   - Step-by-step portfolio implementation plan
   - Broker and platform selection
   - Due diligence and investment research
   - Ongoing monitoring and management
   - Annual review and strategy updates

**Cambodia Market Data:**
- CSX Companies: 15+ listed companies
- Market Cap: $2.5B+ total market
- Average Returns: 8-25% annually for stocks
- Bond Yields: 4-8% for government securities
- Economic Growth: 6-8% GDP growth historically

**Provide specific, actionable portfolio recommendations optimized for Cambodia wealth building.**`;

            const result = await executeEnhancedGPT5Command(
                prompt, 
                chatId, 
                bot,
                {
                    title: `📈 Cambodia Portfolio Strategy Analysis`,
                    forceModel: 'gpt-5',
                    max_output_tokens: 10000,
                    reasoning_effort: 'high',
                    verbosity: 'high'
                }
            );

            return {
                success: true,
                analysis: result.response,
                investmentAmount: investmentAmount,
                riskTolerance: riskTolerance,
                timeHorizon: timeHorizon,
                recommendedStrategy: this.getRecommendedStrategy(riskTolerance),
                assetAllocation: this.getAssetAllocation(riskTolerance),
                riskAssessment: this.getRiskAssessment()
            };

        } catch (error) {
            console.error('❌ Portfolio strategy analysis error:', error.message);
            throw error;
        }
    }

    async analyzeStockInvestment(sector, company, investmentSize, chatId, bot = null) {
        try {
            const prompt = `CAMBODIA STOCK INVESTMENT ANALYSIS

**Stock Investment Parameters:**
- Sector: ${sector}
- Company/Focus: ${company}
- Investment Size: ${investmentSize}

**Comprehensive Stock Analysis Required:**

1. **COMPANY & SECTOR ANALYSIS**
   - Company fundamentals and financial health
   - Business model and competitive positioning
   - Market share and growth prospects
   - Management quality and corporate governance
   - Sector dynamics and growth drivers

2. **FINANCIAL ANALYSIS**
   - Revenue and profitability trends
   - Balance sheet strength and debt levels
   - Cash flow generation and sustainability
   - Valuation metrics and comparison to peers
   - Dividend policy and yield analysis

3. **MARKET ANALYSIS**
   - Stock price performance and trends
   - Trading volumes and liquidity analysis
   - Technical analysis and entry points
   - Market sentiment and analyst coverage
   - Peer comparison and relative valuation

4. **RISK ASSESSMENT**
   - Company-specific risks and challenges
   - Sector and market risks
   - Regulatory and political risks
   - Currency and economic risks
   - Liquidity and exit risks

5. **INVESTMENT THESIS**
   - Key investment drivers and catalysts
   - Growth prospects and value creation
   - Competitive advantages and moats
   - Risk-reward profile and expected returns
   - Time horizon and exit strategy

6. **ACTIONABLE RECOMMENDATIONS**
   - Investment recommendation (Buy/Hold/Sell)
   - Target price and expected returns
   - Position sizing and risk management
   - Entry strategy and timing
   - Monitoring and review framework

**Cambodia Stock Exchange (CSX) Context:**
- Total Listed Companies: 15+
- Main Sectors: Banking, Insurance, Real Estate, Manufacturing, Tourism
- Trading Hours: 9:00 AM - 11:30 AM
- Minimum Investment: Typically $1,000+
- Average Daily Volume: Limited but improving

**Provide specific investment analysis with clear buy/sell recommendations.**`;

            const result = await executeEnhancedGPT5Command(
                prompt,
                chatId,
                bot,
                {
                    title: `📊 Cambodia Stock Investment Analysis - ${sector}`,
                    forceModel: 'gpt-5',
                    max_output_tokens: 8000,
                    reasoning_effort: 'high',
                    verbosity: 'high'
                }
            );

            return {
                success: true,
                analysis: result.response,
                sector: sector,
                company: company,
                investmentSize: investmentSize,
                marketData: this.getMarketData(sector),
                riskProfile: this.getStockRiskProfile(sector)
            };

        } catch (error) {
            console.error('❌ Stock investment analysis error:', error.message);
            throw error;
        }
    }

    async analyzeBondInvestment(bondType, maturity, amount, currency, chatId, bot = null) {
        try {
            const prompt = `CAMBODIA BOND INVESTMENT ANALYSIS

**Bond Investment Parameters:**
- Bond Type: ${bondType}
- Maturity: ${maturity}
- Investment Amount: ${amount}
- Currency: ${currency}

**Comprehensive Bond Analysis Required:**

1. **BOND MARKET OVERVIEW**
   - Cambodia government bond market size and depth
   - Available bond types and maturities
   - Current yield curves and interest rate environment
   - Credit ratings and sovereign risk assessment
   - Market liquidity and trading characteristics

2. **SPECIFIC BOND ANALYSIS**
   - Bond specifications and terms
   - Yield to maturity and current pricing
   - Credit quality and default risk
   - Interest rate sensitivity and duration
   - Call provisions and embedded options

3. **CURRENCY ANALYSIS**
   - ${currency} bond characteristics and risks
   - Currency stability and exchange rate trends
   - Inflation impact on real returns
   - Currency hedging options and costs
   - Comparative analysis (USD vs KHR bonds)

4. **RISK ASSESSMENT**
   - Credit risk and sovereign rating
   - Interest rate risk and duration analysis
   - Currency risk (if applicable)
   - Liquidity risk and secondary market
   - Reinvestment risk and cash flow timing

5. **PORTFOLIO INTEGRATION**
   - Role in overall investment portfolio
   - Diversification benefits and correlations
   - Income generation and cash flow planning
   - Laddering and maturity strategies
   - Tax implications and efficiency

6. **INVESTMENT RECOMMENDATIONS**
   - Investment suitability assessment
   - Optimal allocation and position sizing
   - Entry timing and purchase strategy
   - Monitoring and management approach
   - Exit strategy and maturity planning

**Cambodia Bond Market Data:**
- Government Bond Yields: 4-8% across maturities
- Available Currencies: USD and KHR denominated
- Minimum Investment: Typically $1,000
- Maturity Range: 3 months to 10 years
- Credit Rating: Developing market sovereign rating

**Provide specific bond investment recommendations with yield and risk analysis.**`;

            const result = await executeEnhancedGPT5Command(
                prompt,
                chatId,
                bot,
                {
                    title: `💰 Cambodia Bond Investment Analysis`,
                    forceModel: 'gpt-5-mini',
                    max_output_tokens: 7000,
                    reasoning_effort: 'medium',
                    verbosity: 'high'
                }
            );

            return {
                success: true,
                analysis: result.response,
                bondType: bondType,
                maturity: maturity,
                amount: amount,
                currency: currency,
                yieldData: this.getBondYieldData(maturity, currency),
                riskProfile: this.getBondRiskProfile(bondType, currency)
            };

        } catch (error) {
            console.error('❌ Bond investment analysis error:', error.message);
            throw error;
        }
    }

    // 📊 HELPER FUNCTIONS

    getRecommendedStrategy(riskTolerance) {
        const strategies = {
            'Conservative': this.portfolioStrategies['Conservative Growth'],
            'Low': this.portfolioStrategies['Conservative Growth'],
            'Moderate': this.portfolioStrategies['Balanced Growth'],
            'Medium': this.portfolioStrategies['Balanced Growth'],
            'Aggressive': this.portfolioStrategies['Aggressive Growth'],
            'High': this.portfolioStrategies['Aggressive Growth'],
            'Cambodia Focused': this.portfolioStrategies['Cambodia Focus']
        };

        return strategies[riskTolerance] || this.portfolioStrategies['Balanced Growth'];
    }

    getAssetAllocation(riskTolerance) {
        const strategy = this.getRecommendedStrategy(riskTolerance);
        return {
            allocation: strategy.allocation,
            expectedReturn: strategy.expectedReturn,
            riskLevel: strategy.riskLevel,
            timeHorizon: strategy.timeHorizon
        };
    }

    getRiskAssessment() {
        return this.riskFactors;
    }

    getMarketData(sector) {
        const sectorData = {
            'Banking': {
                companies: ['ACLEDA Bank', 'Canadia Bank', 'First Commercial Bank'],
                avgPE: '12-18x',
                dividendYield: '4-8%',
                growth: '15-20% annually',
                risks: ['Credit risk', 'Regulatory changes']
            },
            'Insurance': {
                companies: ['Forte Insurance', 'Infinity General Insurance'],
                avgPE: '10-15x',
                dividendYield: '3-6%',
                growth: '10-15% annually',
                risks: ['Claims volatility', 'Regulatory environment']
            },
            'Real Estate': {
                companies: ['Borey Peng Huoth', 'World Bridge Land'],
                avgPE: '15-25x',
                dividendYield: '2-5%',
                growth: '20-30% annually',
                risks: ['Market cycles', 'Liquidity']
            }
        };

        return sectorData[sector] || {
            companies: ['Market research needed'],
            avgPE: 'Varies by company',
            dividendYield: '3-8% typical',
            growth: '10-20% estimated',
            risks: ['Market development', 'Liquidity']
        };
    }

    getStockRiskProfile(sector) {
        return {
            marketRisk: 'High - Small market size',
            liquidityRisk: 'High - Limited trading volume',
            currencyRisk: 'Medium - USD/KHR exposure',
            regulatoryRisk: 'Medium - Developing framework',
            specificRisk: sector === 'Banking' ? 'Credit and regulatory' :
                         sector === 'Real Estate' ? 'Market cycles' :
                         sector === 'Manufacturing' ? 'Operational and export' :
                         'Sector-specific analysis needed'
        };
    }

    getBondYieldData(maturity, currency) {
        const yieldCurves = {
            'USD': {
                '3 months': '4.0-4.5%',
                '6 months': '4.5-5.0%',
                '1 year': '5.0-5.5%',
                '2 years': '5.5-6.0%',
                '5 years': '6.0-7.0%',
                '10 years': '7.0-8.0%'
            },
            'KHR': {
                '3 months': '5.0-6.0%',
                '6 months': '6.0-7.0%',
                '1 year': '7.0-8.0%',
                '2 years': '8.0-9.0%',
                '5 years': '9.0-11.0%',
                '10 years': '11.0-13.0%'
            }
        };

        return yieldCurves[currency] || yieldCurves['USD'];
    }

    getBondRiskProfile(bondType, currency) {
        return {
            creditRisk: bondType.includes('Government') ? 'Low-Medium' : 'Medium',
            interestRateRisk: 'Medium - Developing market',
            currencyRisk: currency === 'KHR' ? 'High' : 'Low',
            liquidityRisk: 'Medium-High - Secondary market limited',
            inflationRisk: 'Medium - Economic development phase'
        };
    }

    // 🎯 QUICK ACCESS METHODS

    async quickInvestmentAnalysis(message, chatId, bot = null) {
        const amount = this.extractAmount(message) || '$50,000';
        const risk = this.extractRiskTolerance(message) || 'Medium';
        const timeframe = this.extractTimeframe(message) || '5-10 years';
        const objectives = this.extractObjectives(message) || 'Wealth Building';

        return await this.analyzePortfolioStrategy(amount, risk, timeframe, objectives, chatId, bot);
    }

    extractAmount(message) {
        const amountMatch = message.match(/\$[\d,]+|\d+k|\d+\s*million|USD\s*[\d,]+/i);
        return amountMatch ? amountMatch[0] : null;
    }

    extractRiskTolerance(message) {
        const riskTerms = ['conservative', 'low', 'moderate', 'medium', 'aggressive', 'high'];
        return riskTerms.find(term => message.toLowerCase().includes(term));
    }

    extractTimeframe(message) {
        const timeframes = ['1-2 years', '3-5 years', '5-10 years', '10+ years', 'long term', 'short term'];
        return timeframes.find(tf => 
            message.toLowerCase().includes(tf.toLowerCase().replace(/[^\w\s]/g, ''))
        );
    }

    extractObjectives(message) {
        const objectives = ['wealth building', 'income', 'growth', 'preservation', 'retirement'];
        return objectives.find(obj => message.toLowerCase().includes(obj));
    }

    // 📈 MARKET INTELLIGENCE

    async getMarketUpdate(chatId, bot = null) {
        const prompt = `CAMBODIA FINANCIAL MARKETS UPDATE

**Provide comprehensive financial markets intelligence:**

1. **STOCK MARKET UPDATE**
   - Cambodia Stock Exchange (CSX) performance and trends
   - Individual stock performances and highlights
   - Sector rotation and investment themes
   - New listings and market developments
   - Trading volumes and liquidity trends

2. **BOND MARKET ANALYSIS**
   - Government bond yields and curve movements
   - Credit conditions and sovereign developments
   - Currency bond performance (USD vs KHR)
   - New issuances and market opportunities
   - Interest rate outlook and policy implications

3. **BANKING SECTOR INTELLIGENCE**
   - Banking sector performance and profitability
   - Credit growth and asset quality trends
   - New banking regulations and policy changes
   - Deposit rates and lending conditions
   - Fintech disruption and digital banking

4. **ECONOMIC INDICATORS**
   - GDP growth and economic performance
   - Inflation trends and monetary policy
   - Currency stability and exchange rates
   - Foreign investment flows and capital markets
   - Trade balance and current account

5. **INVESTMENT OPPORTUNITIES**
   - Emerging investment themes and sectors
   - Undervalued opportunities and value plays
   - New financial products and instruments
   - Private equity and alternative investments
   - Regional and global market connections

6. **RISK FACTORS & OUTLOOK**
   - Political developments affecting markets
   - Regulatory changes and policy risks
   - Global economic impacts on Cambodia
   - Market outlook and investment timing
   - Strategic recommendations for investors

**Focus on actionable intelligence for investment decision-making.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: '📈 Cambodia Financial Markets Update',
                forceModel: 'gpt-5-mini',
                max_output_tokens: 7000,
                reasoning_effort: 'medium',
                verbosity: 'high'
            }
        );

        return result;
    }

    // 🔍 SPECIALIZED ANALYSIS

    async getBankingAnalysis(chatId, bot = null) {
        return await this.getDetailedSectorAnalysis('Banking', chatId, bot);
    }

    async getInsuranceAnalysis(chatId, bot = null) {
        return await this.getDetailedSectorAnalysis('Insurance', chatId, bot);
    }

    async getRealEstateStocksAnalysis(chatId, bot = null) {
        return await this.getDetailedSectorAnalysis('Real Estate', chatId, bot);
    }

    async getDetailedSectorAnalysis(sector, chatId, bot = null) {
        const sectorData = this.getMarketData(sector);
        
        const prompt = `CAMBODIA ${sector.toUpperCase()} SECTOR INVESTMENT ANALYSIS

**Sector Focus: ${sector} Investment Opportunities**

**Comprehensive Investment Analysis:**

1. **SECTOR OVERVIEW**
   - ${sector} sector size and market dynamics
   - Key players and market share analysis
   - Growth drivers and market trends
   - Regulatory environment and policy support
   - Competitive landscape and barriers to entry

2. **LISTED COMPANIES ANALYSIS**
   - Individual company profiles and analysis
   - Financial performance and metrics comparison
   - Valuation analysis and peer comparison
   - Dividend policies and shareholder returns
   - Management quality and corporate governance

3. **INVESTMENT METRICS**
   - Current P/E ratios and valuation multiples
   - Dividend yields and income potential
   - Growth rates and earnings projections
   - Return on equity and profitability trends
   - Book value and asset quality analysis

4. **RISK ASSESSMENT**
   - Sector-specific risks and challenges
   - Regulatory and policy risks
   - Market and competitive risks
   - Operational and execution risks
   - Macroeconomic sensitivity analysis

5. **INVESTMENT OPPORTUNITIES**
   - Best investment candidates in the sector
   - Value opportunities and growth stories
   - Dividend income strategies
   - Long-term wealth building potential
   - Risk-adjusted return expectations

6. **STRATEGIC RECOMMENDATIONS**
   - Portfolio allocation recommendations
   - Entry timing and valuation considerations
   - Risk management and position sizing
   - Monitoring framework and review process
   - Exit strategy and profit-taking approach

**Known ${sector} Data:**
- Average P/E: ${sectorData.avgPE}
- Dividend Yield: ${sectorData.dividendYield}
- Expected Growth: ${sectorData.growth}
- Key Companies: ${sectorData.companies.join(', ')}
- Main Risks: ${sectorData.risks.join(', ')}

**Provide specific investment recommendations with clear rationale.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: `📊 Cambodia ${sector} Investment Analysis`,
                forceModel: 'gpt-5',
                max_output_tokens: 8000,
                reasoning_effort: 'high',
                verbosity: 'high'
            }
        );

        return result;
    }

    // 💰 WEALTH OPTIMIZATION

    async getWealthOptimizationStrategy(currentPortfolio, goals, timeframe, chatId, bot = null) {
        const prompt = `CAMBODIA INVESTMENT WEALTH OPTIMIZATION

**Current Situation:**
- Current Portfolio: ${currentPortfolio}
- Wealth Goals: ${goals}
- Timeframe: ${timeframe}

**Optimization Analysis:**

1. **PORTFOLIO ASSESSMENT**
   - Current asset allocation analysis
   - Performance and risk metrics
   - Diversification and concentration analysis
   - Cost and efficiency evaluation
   - Tax optimization opportunities

2. **REBALANCING STRATEGY**
   - Optimal asset allocation recommendations
   - Rebalancing triggers and methodology
   - Tax-efficient rebalancing approaches
   - Cost minimization strategies
   - Implementation timeline and approach

3. **GROWTH ACCELERATION**
   - Higher return opportunities in Cambodia
   - Alternative investment integration
   - Leverage and margin strategies (if appropriate)
   - Active vs passive management decisions
   - Sector rotation and tactical allocation

4. **RISK OPTIMIZATION**
   - Risk reduction without sacrificing returns
   - Hedging strategies for Cambodia-specific risks
   - Diversification improvements
   - Insurance and protection strategies
   - Stress testing and scenario planning

5. **INCOME OPTIMIZATION**
   - Dividend income maximization
   - Bond laddering and income strategies
   - Tax-efficient income generation
   - Cash flow management and planning
   - Reinvestment and compounding strategies

6. **IMPLEMENTATION ROADMAP**
   - Priority actions and sequencing
   - Investment platform and broker selection
   - Monitoring and review schedule
   - Performance benchmarking
   - Ongoing optimization process

**Provide actionable wealth optimization recommendations.**`;

        const result = await executeEnhancedGPT5Command(
            prompt,
            chatId,
            bot,
            {
                title: '💎 Cambodia Investment Wealth Optimization',
                forceModel: 'gpt-5',
                max_output_tokens: 8000,
                reasoning_effort: 'high',
                verbosity: 'high'
            }
        );

        return result;
    }
}

// Export singleton instance
const cambodiaInvestment = new CambodiaInvestmentWealth();

module.exports = {
    // Main analysis functions
    analyzePortfolioStrategy: (investmentAmount, riskTolerance, timeHorizon, objectives, chatId, bot) => 
        cambodiaInvestment.analyzePortfolioStrategy(investmentAmount, riskTolerance, timeHorizon, objectives, chatId, bot),
    
    analyzeStockInvestment: (sector, company, investmentSize, chatId, bot) => 
        cambodiaInvestment.analyzeStockInvestment(sector, company, investmentSize, chatId, bot),
    
    analyzeBondInvestment: (bondType, maturity, amount, currency, chatId, bot) => 
        cambodiaInvestment.analyzeBondInvestment(bondType, maturity, amount, currency, chatId, bot),

    // Quick access methods
    quickInvestmentAnalysis: (message, chatId, bot) => 
        cambodiaInvestment.quickInvestmentAnalysis(message, chatId, bot),

    // Market intelligence
    getMarketUpdate: (chatId, bot) => 
        cambodiaInvestment.getMarketUpdate(chatId, bot),

    // Sector analysis
    getBankingAnalysis: (chatId, bot) => 
        cambodiaInvestment.getBankingAnalysis(chatId, bot),
    
    getInsuranceAnalysis: (chatId, bot) => 
        cambodiaInvestment.getInsuranceAnalysis(chatId, bot),
    
    getRealEstateStocksAnalysis: (chatId, bot) => 
        cambodiaInvestment.getRealEstateStocksAnalysis(chatId, bot),

    // Wealth optimization
    getWealthOptimizationStrategy: (currentPortfolio, goals, timeframe, chatId, bot) => 
        cambodiaInvestment.getWealthOptimizationStrategy(currentPortfolio, goals, timeframe, chatId, bot),

    // Data access
    getFinancialMarkets: () => cambodiaInvestment.financialMarkets,
    getInvestmentVehicles: () => cambodiaInvestment.investmentVehicles,
    getPortfolioStrategies: () => cambodiaInvestment.portfolioStrategies,
    getRiskFactors: () => cambodiaInvestment.riskFactors,

    // Export class for advanced usage
    CambodiaInvestmentWealth: cambodiaInvestment
};

console.log('📈 Cambodia Investment & Financial Markets Wealth Module loaded');
console.log('💰 Features: Portfolio strategy, stock analysis, bond investments, market intelligence');
console.log('🏦 Markets: CSX stocks, government bonds, banking sector, private equity');
console.log('📊 Strategies: Conservative to aggressive growth, Cambodia-focused allocations');
console.log('⚡ Risk Management: Political, currency, liquidity, and credit risk analysis');
console.log('🇰🇭 Cambodia financial markets specialized with GPT-5 integration');
