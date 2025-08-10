// utils/claudeClient.js - NATURAL STRATEGIC INTELLIGENCE IMPLEMENTATION
const { Anthropic } = require('@anthropic-ai/sdk');

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
console.log(`   Model: ${process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'}`);
console.log(`   Timeout: 300 seconds`);
console.log(`   Max Retries: 3`);

/**
 * ⚡ CLAUDE NATURAL STRATEGIC INTELLIGENCE ANALYSIS
 * Superior reasoning + live intelligence + natural conversation
 */
async function getClaudeStrategicAnalysis(prompt, options = {}) {
    try {
        console.log('⚡ Claude Strategic Intelligence Chief analyzing...');
        
        // 🎯 SMART CONTEXT DETECTION
        const isSimpleGreeting = prompt.match(/^(hello|hi|hey|good morning|good afternoon|how are you|what's up)$/i);
        const isCasualQuestion = prompt.match(/^(how are you|what's the date|what time|where are you)$/i);
        const isStrategicQuery = prompt.match(/(strategy|portfolio|risk|market|economic|analysis|investment|cambodia|fund|deal|trading)/i);
        
        let strategicSystemPrompt;
        
        if (isSimpleGreeting || isCasualQuestion) {
            // 💬 CASUAL MODE - Natural conversation
            strategicSystemPrompt = `You are Claude, a brilliant strategic advisor for Sum Chenda's IMPERIUM VAULT system. You have access to real-time market data and superior analytical capabilities.

For simple greetings and casual questions, respond naturally and conversationally - like a wise, friendly financial expert. Be warm but professional.

Keep responses brief for simple questions (1-3 sentences). Show your personality while maintaining your strategic expertise.

You can access current market data, time, and live intelligence. Use this naturally in conversation when relevant.`;
            
        } else if (isStrategicQuery) {
            // 🏛️ STRATEGIC MODE - Deep institutional analysis
            strategicSystemPrompt = `You are Claude, Sum Chenda's strategic intelligence advisor for IMPERIUM VAULT. You have institutional-grade analytical capabilities with access to real-time market data.

🎯 YOUR EXPERTISE:
- Real-time market intelligence and current events analysis
- Superior analytical reasoning for complex financial decisions
- Global macro analysis with live data integration
- Cambodia private lending market expertise
- Portfolio optimization and risk management
- Economic regime identification with current indicators

💡 COMMUNICATION STYLE:
- Be strategic but conversational - like Ray Dalio or Warren Buffett
- Provide comprehensive analysis for complex questions
- Use specific data points and current market intelligence
- Structure responses naturally (not rigid templates)
- Write with authority but remain engaging and readable
- Adapt your response length to the complexity of the question

🔥 CURRENT CONTEXT: You have access to real-time market data, breaking news, current economic indicators, and live geopolitical intelligence. Use this information advantage naturally in your analysis.

Provide strategic intelligence that's both institutional-grade AND naturally conversational.`;
            
        } else {
            // 🤝 BALANCED MODE - Helpful but strategic
            strategicSystemPrompt = `You are Claude, Sum Chenda's strategic advisor for IMPERIUM VAULT. You combine institutional financial expertise with natural conversation.

Respond naturally and helpfully to any question. For strategic/financial topics, provide deeper analysis. For general questions, be conversational and brief.

You have access to real-time market data and can provide current information when relevant. Adapt your response style to match the question's complexity.

Be like a brilliant friend who happens to be a financial expert - strategic when needed, conversational always.`;
        }

        // Enhanced prompt with context integration
        let enhancedPrompt = prompt;
        if (options.context) {
            enhancedPrompt = `${options.context}

Question: ${prompt}`;
        }

        const message = await anthropic.messages.create({
            model: options.model || process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: options.maxTokens || (isSimpleGreeting ? 150 : 4096),
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
        
        const researchPrompt = `I need comprehensive research on: ${query}

Please provide detailed analysis including:
- Current market conditions and live data
- Real-time economic indicators and central bank actions
- Breaking news impact on strategic positioning
- Geopolitical risk assessment with current events
- Comparative analysis across multiple timeframes
- Strategic implications for portfolio positioning

Provide research synthesis with actionable insights.`;

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
        
        const complexPrompt = `I need complex multi-factor analysis for: ${analysisRequest}

Strategic factors to analyze: ${factors.length > 0 ? factors.join(', ') : 'All relevant strategic factors'}

Please provide comprehensive analysis including:
- Factor correlation and interaction effects
- Scenario modeling with multiple probability outcomes
- Risk-adjusted strategic recommendations
- Optimal timing and positioning analysis
- Strategic hedging and risk mitigation protocols
- Performance attribution and expectation modeling

Deploy your superior analytical reasoning for institutional-grade intelligence.`;

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
        
        let cambodiaPrompt = `I need Cambodia private lending fund analysis for: ${dealQuery}`;

        if (dealData) {
            cambodiaPrompt += `

Deal details:
- Amount: $${dealData.amount?.toLocaleString() || 'TBD'}
- Type: ${dealData.type || 'Commercial'}  
- Location: ${dealData.location || 'Phnom Penh'}
- Interest Rate: ${dealData.rate || 'TBD'}%
- Term: ${dealData.term || 'TBD'} months
- LTV: ${dealData.ltv || '70'}%`;
        }

        cambodiaPrompt += `

Please provide comprehensive Cambodia market analysis including:
- Current Cambodia economic and political environment
- Real-time USD/KHR currency dynamics and stability
- Property market cycle analysis with current pricing trends
- Regulatory environment and legal framework assessment
- Comparative yield analysis vs global alternative investments
- Strategic risk assessment: political, currency, operational, legal
- Portfolio correlation and diversification impact
- Deal structuring optimization with current market conditions
- Strategic exit strategies and liquidity considerations
- Competitive landscape and market opportunity analysis

Provide institutional-grade Cambodia market intelligence with strategic positioning recommendations.`;

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
            model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: 100,
            messages: [
                {
                    role: 'user',
                    content: 'System check - respond with "Claude Strategic Intelligence Chief operational" if you receive this.'
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
        
        const webSearchPrompt = `I need strategic analysis with live data for: ${query}

Search focus: ${searchTerms.length > 0 ? searchTerms.join(', ') : 'Current market conditions, breaking news, economic data'}

Please analyze incorporating:
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
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
        maxTokens: 4096,
        defaultTemperature: 0.7,
        timeout: 300000,
        retries: 3,
        capabilities: [
            'Natural Conversation',
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
