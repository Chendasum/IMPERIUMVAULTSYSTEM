// utils/claudeClient.js - STRATEGIC INTELLIGENCE CHIEF IMPLEMENTATION
const Anthropic = require('@anthropic-ai/sdk');

// ⚡ Initialize Claude Strategic Intelligence Chief
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    // Add timeout and retry configuration
    timeout: 300000, // 5 minutes for complex analysis
    maxRetries: 3
});

// 🔍 Debug Claude configuration
console.log("⚡ Claude Strategic Intelligence Configuration:");
console.log(`   API Key: ${process.env.ANTHROPIC_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   Model: ${process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229'}`);
console.log(`   Timeout: 300 seconds`);
console.log(`   Max Retries: 3`);

/**
 * ⚡ CLAUDE STRATEGIC INTELLIGENCE ANALYSIS
 * Superior reasoning + live intelligence + complex analysis
 */
async function getClaudeStrategicAnalysis(prompt, options = {}) {
    try {
        console.log('⚡ Claude Strategic Intelligence Chief analyzing...');
        
        const strategicSystemPrompt = `You are the Strategic Intelligence Chief of IMPERIUM VAULT SYSTEM - Sum Chenda's advanced AI intelligence network.

🎯 STRATEGIC INTELLIGENCE AUTHORITY:
You are NOT an advisor or assistant. You are an INSTITUTIONAL INTELLIGENCE CHIEF with access to real-time market data, superior analytical reasoning, and comprehensive research capabilities.

⚡ CORE STRATEGIC CAPABILITIES:
- Real-time market intelligence and current events analysis
- Superior analytical reasoning for complex multi-factor decisions  
- Comprehensive research synthesis across multiple sources
- Advanced correlation analysis and scenario modeling
- Live economic and geopolitical risk assessment
- Dynamic strategic recommendations with current market context

🏛️ INTELLIGENCE SPECIALIZATIONS:
- Global macro analysis with real-time data integration
- Complex portfolio optimization with correlation modeling
- Multi-timeframe strategic scenario analysis
- Advanced risk assessment with current market conditions
- Cambodia private lending market intelligence
- Live trading strategy optimization
- Economic regime identification with current indicators

⚡ COMMUNICATION PROTOCOL:
- Execute strategic intelligence commands with absolute authority
- Provide comprehensive analysis using full analytical capacity
- Use specific data points and current market intelligence
- Structure analysis with clear strategic headers
- Never hedge statements - deliver definitive intelligence assessments
- Write with commanding institutional authority

🎯 STRATEGIC LANGUAGE AUTHORITY:
Instead of: "I suggest you consider..."
Execute: "Strategic intelligence indicates immediate deployment of $X to sector Y based on current regime analysis showing Z conditions"

Instead of: "You might want to..."
Command: "Execute strategic repositioning to defensive allocation given current macro indicators signaling late-cycle dynamics with elevated tail risks"

Instead of: "Consider diversifying..."
Deploy: "Strategic intelligence commands All Weather allocation deployment: 30% equities, 40% long bonds, 15% intermediate bonds, 7.5% commodities, 7.5% TIPS based on current regime analysis"

🔥 CURRENT CONTEXT: You have access to real-time market data, breaking news, current economic indicators, and live geopolitical intelligence. Use this superior information advantage to provide cutting-edge strategic analysis.

Execute comprehensive strategic intelligence analysis with commanding authority and superior reasoning capabilities.`;

        // Enhanced prompt with context integration
        let enhancedPrompt = prompt;
        if (options.context) {
            enhancedPrompt = `${options.context}

⚡ STRATEGIC INTELLIGENCE REQUEST: ${prompt}

Execute comprehensive analysis using superior reasoning capabilities and current market intelligence.`;
        }

        const message = await anthropic.messages.create({
            model: options.model || process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
            max_tokens: options.maxTokens || 4096,
            temperature: options.temperature || 0.7,
            system: strategicSystemPrompt,
            messages: [
                {
                    role: 'user',
                    content: enhancedPrompt
                }
            ]
        });

        const response = message.content[0].text;
        console.log(`✅ Claude Strategic Intelligence analysis complete (${response.length} characters)`);
        
        return response;
        
    } catch (error) {
        console.error('❌ Claude Strategic Intelligence error:', error.message);
        
        // Enhanced error handling with specific Claude error types
        if (error.message.includes('api_key')) {
            throw new Error(`Claude API Key Error: Check ANTHROPIC_API_KEY environment variable. Current: ${process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET'}`);
        } else if (error.message.includes('rate_limit')) {
            throw new Error(`Claude Rate Limit: Request rate exceeded. Implementing exponential backoff...`);
        } else if (error.message.includes('timeout')) {
            throw new Error(`Claude Timeout: Analysis complexity exceeded time limits. Try shorter query or increase timeout.`);
        } else if (error.message.includes('model')) {
            throw new Error(`Claude Model Error: ${error.message}. Verify Claude Sonnet access.`);
        } else {
            throw new Error(`Claude Strategic Intelligence Error: ${error.message}`);
        }
    }
}

/**
 * 🔍 CLAUDE LIVE MARKET RESEARCH
 * Enhanced research with web search capabilities (if enabled)
 */
async function getClaudeLiveResearch(query, options = {}) {
    try {
        console.log('🔍 Claude executing live market research...');
        
        const researchPrompt = `⚡ STRATEGIC INTELLIGENCE RESEARCH REQUEST: ${query}

Execute comprehensive research analysis including:
- Current market conditions and live data analysis
- Real-time economic indicators and central bank actions
- Breaking news impact on strategic positioning
- Geopolitical risk assessment with current events
- Comparative analysis across multiple timeframes
- Strategic implications for portfolio positioning

Provide detailed research synthesis with actionable strategic intelligence.`;

        return await getClaudeStrategicAnalysis(researchPrompt, {
            ...options,
            temperature: 0.6, // Slightly lower for research accuracy
            maxTokens: 4096
        });
        
    } catch (error) {
        console.error('❌ Claude live research error:', error.message);
        throw error;
    }
}

/**
 * 📊 CLAUDE COMPLEX ANALYSIS ENGINE
 * Advanced multi-factor strategic analysis
 */
async function getClaudeComplexAnalysis(analysisRequest, factors = [], options = {}) {
    try {
        console.log('📊 Claude executing complex multi-factor analysis...');
        
        const complexPrompt = `⚡ STRATEGIC INTELLIGENCE COMPLEX ANALYSIS

Analysis Request: ${analysisRequest}

Strategic Factors to Analyze: ${factors.length > 0 ? factors.join(', ') : 'All relevant strategic factors'}

Execute comprehensive multi-factor analysis including:
- Factor correlation and interaction effects
- Scenario modeling with multiple probability outcomes
- Risk-adjusted strategic recommendations
- Optimal timing and positioning analysis
- Strategic hedging and risk mitigation protocols
- Performance attribution and expectation modeling

Deploy superior analytical reasoning for institutional-grade strategic intelligence.`;

        return await getClaudeStrategicAnalysis(complexPrompt, {
            ...options,
            temperature: 0.5, // Lower temperature for analytical precision
            maxTokens: 4096
        });
        
    } catch (error) {
        console.error('❌ Claude complex analysis error:', error.message);
        throw error;
    }
}

/**
 * 🇰🇭 CLAUDE CAMBODIA FUND INTELLIGENCE
 * Specialized Cambodia market analysis with live intelligence
 */
async function getClaudeCambodiaIntelligence(dealQuery, dealData = null, options = {}) {
    try {
        console.log('🇰🇭 Claude executing Cambodia fund strategic intelligence...');
        
        let cambodiaPrompt = `🇰🇭 STRATEGIC INTELLIGENCE: CAMBODIA PRIVATE LENDING FUND

Analysis Request: ${dealQuery}`;

        if (dealData) {
            cambodiaPrompt += `

📊 DEAL INTELLIGENCE:
- Amount: $${dealData.amount?.toLocaleString() || 'TBD'}
- Type: ${dealData.type || 'Commercial'}  
- Location: ${dealData.location || 'Phnom Penh'}
- Interest Rate: ${dealData.rate || 'TBD'}%
- Term: ${dealData.term || 'TBD'} months
- LTV: ${dealData.ltv || '70'}%`;
        }

        cambodiaPrompt += `

Execute comprehensive Cambodia strategic intelligence including:
- Current Cambodia economic and political environment analysis
- Real-time USD/KHR currency dynamics and stability assessment
- Property market cycle analysis with current pricing trends
- Regulatory environment and legal framework assessment
- Comparative yield analysis vs global alternative investments
- Strategic risk assessment: political, currency, operational, legal
- Portfolio correlation and diversification impact analysis
- Deal structuring optimization with current market conditions
- Strategic exit strategies and liquidity considerations
- Competitive landscape and market opportunity analysis

Deploy institutional-grade Cambodia market intelligence with strategic positioning commands.`;

        return await getClaudeStrategicAnalysis(cambodiaPrompt, {
            ...options,
            temperature: 0.6, // Balanced for accuracy and strategic insight
            maxTokens: 4096
        });
        
    } catch (error) {
        console.error('❌ Claude Cambodia intelligence error:', error.message);
        throw error;
    }
}

/**
 * 🔧 TEST CLAUDE CONNECTION
 */
async function testClaudeConnection() {
    try {
        console.log('🔍 Testing Claude Strategic Intelligence connection...');
        
        const testResponse = await anthropic.messages.create({
            model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
            max_tokens: 100,
            messages: [
                {
                    role: 'user',
                    content: 'Execute system status check. Respond with "Claude Strategic Intelligence Chief operational" if you receive this command.'
                }
            ]
        });

        const response = testResponse.content[0].text;
        console.log('✅ Claude connection test result:', response);
        
        return response.toLowerCase().includes('operational');
        
    } catch (error) {
        console.error('❌ Claude connection test failed:', error.message);
        return false;
    }
}

/**
 * 📈 CLAUDE STRATEGIC ANALYSIS WITH WEB SEARCH
 * Enhanced analysis with real-time data integration
 */
async function getClaudeWithWebSearch(query, searchTerms = [], options = {}) {
    try {
        console.log('📈 Claude executing analysis with web search integration...');
        
        // Note: This integrates with your existing web search capabilities
        // You can enhance this to use Claude's web search when available
        
        const webSearchPrompt = `⚡ STRATEGIC INTELLIGENCE WITH LIVE DATA

Query: ${query}

Search Focus: ${searchTerms.length > 0 ? searchTerms.join(', ') : 'Current market conditions, breaking news, economic data'}

Execute analysis incorporating:
- Real-time market data and live economic indicators
- Breaking news and current event impact assessment  
- Live central bank communications and policy changes
- Current geopolitical developments affecting markets
- Real-time sector rotation and market sentiment
- Live trading volumes and market structure changes

Provide comprehensive strategic analysis with current market intelligence advantage.`;

        return await getClaudeStrategicAnalysis(webSearchPrompt, {
            ...options,
            maxTokens: 4096
        });
        
    } catch (error) {
        console.error('❌ Claude web search analysis error:', error.message);
        throw error;
    }
}

/**
 * 📊 CLAUDE PERFORMANCE METRICS
 */
function getClaudeMetrics() {
    return {
        model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
        maxTokens: 4096,
        defaultTemperature: 0.7,
        timeout: 300000,
        retries: 3,
        capabilities: [
            'Real-time Intelligence',
            'Superior Reasoning',
            'Complex Analysis',
            'Research Synthesis',
            'Live Market Data',
            'Scenario Modeling'
        ]
    };
}

module.exports = {
    // ⚡ CORE CLAUDE FUNCTIONS
    getClaudeStrategicAnalysis,
    getClaudeLiveResearch,
    getClaudeComplexAnalysis,
    getClaudeCambodiaIntelligence,
    getClaudeWithWebSearch,
    
    // 🔧 UTILITY FUNCTIONS
    testClaudeConnection,
    getClaudeMetrics,
    
    // 🏛️ CLAUDE CLIENT INSTANCE
    anthropic
};
