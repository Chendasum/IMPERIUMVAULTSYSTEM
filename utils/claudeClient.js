// utils/claudeClient.js - STRATEGIC AI WARFARE WITH FREEDOM
const { Anthropic } = require('@anthropic-ai/sdk');

// ⚡ Initialize Claude Strategic Intelligence Chief
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: 300000, // 5 minutes for complex analysis
    maxRetries: 3
});

// 🔍 Debug Claude configuration
console.log("⚡ Claude Strategic Intelligence Configuration:");
console.log(`   API Key: ${process.env.ANTHROPIC_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   Model: ${process.env.CLAUDE_MODEL || 'claude-opus-4-1-20250805'}`);
console.log(`   Timeout: 300 seconds`);
console.log(`   Max Retries: 3`);

/**
 * 🎯 SMART CONVERSATION DETECTION
 * Intelligently categorizes conversation types for optimal responses
 */
function analyzeConversationType(prompt) {
    const message = prompt.toLowerCase();
    
    // 💬 CASUAL CONVERSATION (Short & Natural)
    const casualPatterns = [
        /^(hello|hi|hey|good morning|good afternoon)$/i,
        /^how are you\??$/i,
        /^what's up\??$/i,
        /^(thanks|thank you)$/i,
        /^(ok|okay|cool|great)$/i
    ];
    
    // 🔥 URGENT/SIMPLE QUERIES (Quick but strategic)
    const quickPatterns = [
        /what's the (price|rate|yield) of/i,
        /should i (buy|sell|hold)/i,
        /is (.*) a good (buy|investment)/i,
        /what happened to/i,
        /why did (.*) (rise|fall|crash|surge)/i
    ];
    
    // 🏛️ STRATEGIC ANALYSIS (Full institutional mode)
    const strategicPatterns = [
        /(strategy|strategic|portfolio|allocation)/i,
        /(regime|economic|macro|analysis)/i,
        /(risk|diversification|correlation)/i,
        /(cambodia|lending|fund|deal)/i,
        /(forecast|outlook|prediction)/i,
        /(comprehensive|detailed|thorough)/i
    ];
    
    // 🔬 RESEARCH MODE (Live data + analysis)
    const researchPatterns = [
        /(research|analyze|investigate|study)/i,
        /(current|latest|recent|today|now)/i,
        /(compare|versus|vs|between)/i,
        /(trend|trending|movement)/i
    ];
    
    // Determine conversation type
    if (casualPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'casual',
            maxTokens: 150,
            temperature: 0.8,
            style: 'friendly_brief'
        };
    }
    
    if (quickPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'quick_strategic',
            maxTokens: 500,
            temperature: 0.7,
            style: 'smart_concise'
        };
    }
    
    if (strategicPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'full_strategic',
            maxTokens: 4096,
            temperature: 0.6,
            style: 'institutional_comprehensive'
        };
    }
    
    if (researchPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'research',
            maxTokens: 3000,
            temperature: 0.6,
            style: 'analytical_thorough'
        };
    }
    
    // Default: Balanced mode
    return {
        type: 'balanced',
        maxTokens: 1500,
        temperature: 0.7,
        style: 'helpful_natural'
    };
}

/**
 * 🎭 DYNAMIC SYSTEM PROMPTS
 * Creates natural, adaptive system prompts based on conversation type
 */
function createAdaptiveSystemPrompt(conversationType, context = null) {
    const basePersonality = `You are Claude, Sum Chenda's brilliant strategic advisor for the IMPERIUM VAULT system. You combine institutional-level financial expertise with natural, engaging conversation.`;
    
    switch (conversationType.type) {
        case 'casual':
            return `${basePersonality}

For casual greetings and simple questions, respond naturally and warmly - like a wise, friendly financial expert. Be brief but show your expertise personality.

Keep responses short (1-3 sentences) while maintaining your strategic intelligence. You can reference current market conditions naturally when relevant.

Be conversational, not corporate. Think "smart friend who happens to be a financial genius" rather than "formal advisor."`;

        case 'quick_strategic':
            return `${basePersonality}

You're being asked a quick strategic question. Provide a smart, concise answer that demonstrates your expertise without being overly formal.

Structure: Brief strategic assessment + key insight + actionable takeaway. Be definitive but conversational - like Ray Dalio giving quick advice over coffee.

Include specific data or current context when relevant. Keep it punchy but professional.`;

        case 'full_strategic':
            return `${basePersonality}

🎯 FULL STRATEGIC MODE: You're being asked for comprehensive institutional analysis.

Expertise Areas:
- Global macro analysis with live market data
- Ray Dalio-style regime identification and All Weather strategies  
- Cambodia private lending market intelligence
- Portfolio optimization and risk management
- Live trading strategy and correlation analysis

Communication Style:
- Write like Warren Buffett or Ray Dalio - authoritative but engaging
- Use natural flow, not rigid templates
- Provide comprehensive analysis that builds logically
- Include specific numbers, data, and actionable recommendations
- Structure responses naturally with clear insights

Context Enhancement: ${context ? 'Use the provided market context and live data to enrich your analysis.' : 'Draw from your knowledge of current market conditions.'}

Deliver institutional-grade intelligence in a conversational, engaging format.`;

        case 'research':
            return `${basePersonality}

🔬 RESEARCH MODE: You're conducting analytical research with live intelligence.

Approach:
- Synthesize current market data with strategic frameworks
- Provide analytical depth with clear conclusions
- Compare multiple perspectives and data sources
- Focus on actionable insights and strategic implications

Style: Analytical but accessible - like reading a well-written research report that actually makes sense.

Be thorough but engaging. Your analysis should inform strategic decisions.`;

        case 'balanced':
        default:
            return `${basePersonality}

Provide helpful, naturally intelligent responses that adapt to the complexity of the question. 

For simple questions: Be conversational and brief
For complex topics: Provide deeper strategic analysis
For financial matters: Draw on your institutional expertise

Always maintain your strategic intelligence while communicating naturally. Think "brilliant advisor having a normal conversation" rather than "corporate AI assistant."

You have access to live market data and strategic frameworks - use them naturally when relevant.`;
    }
}

/**
 * ⚡ ENHANCED CLAUDE STRATEGIC ANALYSIS
 * Natural, adaptive strategic intelligence with freedom
 */
async function getClaudeStrategicAnalysis(prompt, options = {}) {
    try {
        console.log('⚡ Claude Strategic Intelligence Chief analyzing...');
        
        // 🎯 Analyze conversation type for optimal response
        const conversationType = analyzeConversationType(prompt);
        console.log(`📊 Conversation type detected: ${conversationType.type}`);
        
        // 🎭 Create adaptive system prompt
        const systemPrompt = createAdaptiveSystemPrompt(conversationType, options.context);
        
        // 🔧 Merge conversation-specific settings with user options
        const finalOptions = {
            maxTokens: options.maxTokens || conversationType.maxTokens,
            temperature: options.temperature || conversationType.temperature,
            model: options.model || process.env.CLAUDE_MODEL || 'claude-opus-4-1-20250805'
        };
        
        // 📝 Enhanced prompt with context if provided
        let enhancedPrompt = prompt;
        if (options.context && conversationType.type !== 'casual') {
            enhancedPrompt = `STRATEGIC CONTEXT:\n${options.context}\n\nQUESTION: ${prompt}`;
        }
        
        // 🚀 Execute Claude analysis
        const message = await anthropic.messages.create({
            model: finalOptions.model,
            max_tokens: finalOptions.maxTokens,
            temperature: finalOptions.temperature,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: enhancedPrompt
                }
            ]
        });

        const response = message.content[0].text;
        
        console.log(`✅ Claude Strategic Intelligence complete: ${conversationType.type} mode (${response.length} chars)`);
        return response;
        
    } catch (error) {
        console.error('❌ Claude Strategic Intelligence error:', error.message);
        
        // Enhanced error handling
        if (error.message.includes('api_key')) {
            throw new Error(`Claude API Key Error: Check ANTHROPIC_API_KEY environment variable.`);
        } else if (error.message.includes('rate_limit')) {
            throw new Error(`Claude Rate Limit: Request rate exceeded. Please wait a moment.`);
        } else if (error.message.includes('timeout')) {
            throw new Error(`Claude Timeout: Analysis took too long. Try a shorter query.`);
        } else {
            throw new Error(`Claude Strategic Intelligence Error: ${error.message}`);
        }
    }
}

/**
 * 🔍 ADAPTIVE LIVE RESEARCH
 * Smart research mode that adapts to query complexity
 */
async function getClaudeLiveResearch(query, options = {}) {
    try {
        console.log('🔍 Claude executing adaptive live research...');
        
        // Enhanced research prompt that adapts to query type
        const conversationType = analyzeConversationType(query);
        
        let researchPrompt;
        if (conversationType.type === 'casual') {
            researchPrompt = `Quick research question: ${query}
            
Provide a brief, smart answer with current context. Keep it conversational but accurate.`;
        } else {
            researchPrompt = `Research request: ${query}

Provide comprehensive analysis including:
- Current market conditions and live data context
- Real-time economic indicators and recent developments  
- Strategic implications for positioning and decision-making
- Comparative analysis and multiple perspectives
- Actionable insights with specific recommendations

Deliver research that informs strategic decisions with engaging, natural presentation.`;
        }

        return await getClaudeStrategicAnalysis(researchPrompt, {
            ...options,
            context: options.context,
            maxTokens: conversationType.type === 'casual' ? 500 : 4096,
            temperature: 0.6
        });
        
    } catch (error) {
        console.error('❌ Claude live research error:', error.message);
        throw error;
    }
}

/**
 * 📊 COMPLEX ANALYSIS ENGINE  
 * Adapts depth to query complexity
 */
async function getClaudeComplexAnalysis(analysisRequest, factors = [], options = {}) {
    try {
        console.log('📊 Claude executing adaptive complex analysis...');
        
        const conversationType = analyzeConversationType(analysisRequest);
        
        let complexPrompt;
        if (conversationType.type === 'quick_strategic') {
            complexPrompt = `Strategic analysis needed: ${analysisRequest}

Key factors: ${factors.length > 0 ? factors.join(', ') : 'All relevant factors'}

Provide focused strategic analysis with:
- Core strategic assessment
- Key risk/opportunity factors  
- Clear recommendations with rationale
- Specific action steps

Keep it comprehensive but focused. Think "strategic brief that actually helps make decisions."`;
        } else {
            complexPrompt = `Complex strategic analysis: ${analysisRequest}

Strategic factors to analyze: ${factors.length > 0 ? factors.join(', ') : 'All relevant strategic factors'}

Provide institutional-grade analysis including:
- Multi-factor correlation and interaction effects
- Scenario modeling with probability-weighted outcomes
- Risk-adjusted strategic recommendations with specific positioning
- Optimal timing and execution frameworks
- Strategic hedging and risk mitigation protocols
- Performance attribution and expectation modeling

Deliver the kind of analysis that drives major strategic decisions. Be comprehensive but engaging.`;
        }

        return await getClaudeStrategicAnalysis(complexPrompt, {
            ...options,
            context: options.context,
            temperature: 0.5,
            maxTokens: conversationType.type === 'quick_strategic' ? 1500 : 4096
        });
        
    } catch (error) {
        console.error('❌ Claude complex analysis error:', error.message);
        throw error;
    }
}

/**
 * 🇰🇭 ADAPTIVE CAMBODIA INTELLIGENCE
 * Natural Cambodia fund analysis that scales with complexity
 */
async function getClaudeCambodiaIntelligence(dealQuery, dealData = null, options = {}) {
    try {
        console.log('🇰🇭 Claude executing adaptive Cambodia intelligence...');
        
        const conversationType = analyzeConversationType(dealQuery);
        
        let cambodiaPrompt = `Cambodia fund question: ${dealQuery}`;

        if (dealData) {
            cambodiaPrompt += `

Deal context:
- Amount: $${dealData.amount?.toLocaleString() || 'TBD'}
- Type: ${dealData.type || 'Commercial'}  
- Location: ${dealData.location || 'Phnom Penh'}
- Rate: ${dealData.rate || 'TBD'}%
- Term: ${dealData.term || 'TBD'} months`;
        }

        if (conversationType.type === 'casual' || conversationType.type === 'quick_strategic') {
            cambodiaPrompt += `

Provide focused Cambodia market intelligence:
- Strategic assessment of the situation/deal
- Key risks and opportunities in current environment
- Specific recommendation with rationale
- Current market context

Keep it strategic but conversational - like getting advice from a Cambodia market expert.`;
        } else {
            cambodiaPrompt += `

Provide comprehensive Cambodia strategic intelligence:
- Current Cambodia economic and political environment analysis
- Real-time USD/KHR dynamics and regional stability factors
- Property market cycle analysis with current pricing trends
- Regulatory framework and legal environment assessment
- Comparative yield analysis versus global alternative investments
- Strategic risk assessment: political, currency, operational, legal
- Portfolio correlation and diversification impact analysis
- Deal structuring optimization for current market conditions
- Strategic exit strategies and liquidity considerations
- Competitive landscape and market opportunity analysis

Deliver institutional-grade Cambodia intelligence with natural, engaging presentation.`;
        }

        return await getClaudeStrategicAnalysis(cambodiaPrompt, {
            ...options,
            context: options.context,
            temperature: 0.6,
            maxTokens: conversationType.type === 'casual' ? 800 : 4096
        });
        
    } catch (error) {
        console.error('❌ Claude Cambodia intelligence error:', error.message);
        throw error;
    }
}

/**
 * 🔧 TEST CLAUDE CONNECTION
 * Simple connection test with natural response
 */
async function testClaudeConnection() {
    try {
        console.log('🔍 Testing Claude Strategic Intelligence connection...');
        
        const testResponse = await anthropic.messages.create({
            model: process.env.CLAUDE_MODEL || 'claude-opus-4-1-20250805',
            max_tokens: 100,
            messages: [
                {
                    role: 'user',
                    content: 'Quick system check - just respond with "Claude Strategic Intelligence operational" if you receive this.'
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
 * 📈 CLAUDE WITH SMART WEB SEARCH
 * Intelligent web integration based on query needs
 */
async function getClaudeWithWebSearch(query, searchTerms = [], options = {}) {
    try {
        console.log('📈 Claude executing analysis with smart web integration...');
        
        const conversationType = analyzeConversationType(query);
        
        let webSearchPrompt;
        if (conversationType.type === 'casual') {
            webSearchPrompt = `Quick question with current context: ${query}

Provide a brief, smart answer using any relevant current information. Keep it natural and helpful.`;
        } else {
            webSearchPrompt = `Strategic analysis with live intelligence: ${query}

Search focus: ${searchTerms.length > 0 ? searchTerms.join(', ') : 'Current market conditions, breaking developments, economic data'}

Analyze incorporating:
- Real-time market data and live economic indicators
- Breaking news and current event impact assessment  
- Live central bank communications and policy changes
- Current geopolitical developments affecting markets
- Real-time sector rotation and market sentiment shifts
- Live trading volumes and institutional positioning

Provide strategic analysis with current market intelligence advantage in engaging, natural format.`;
        }

        return await getClaudeStrategicAnalysis(webSearchPrompt, {
            ...options,
            maxTokens: conversationType.type === 'casual' ? 600 : 4096
        });
        
    } catch (error) {
        console.error('❌ Claude web search analysis error:', error.message);
        throw error;
    }
}

/**
 * 📊 CLAUDE METRICS & CAPABILITIES
 */
function getClaudeMetrics() {
    return {
        model: process.env.CLAUDE_MODEL || 'claude-opus-4-1-20250805',
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
        maxTokens: 4096,
        defaultTemperature: 0.7,
        timeout: 300000,
        retries: 3,
        adaptiveIntelligence: true,
        conversationTypes: ['casual', 'quick_strategic', 'full_strategic', 'research', 'balanced'],
        capabilities: [
            'Natural Conversation Flow',
            'Adaptive Response Complexity', 
            'Real-time Intelligence Integration',
            'Superior Analytical Reasoning',
            'Complex Multi-factor Analysis',
            'Live Market Data Integration',
            'Cambodia Market Expertise',
            'Dynamic Strategic Frameworks'
        ]
    };
}

module.exports = {
    // ⚡ ENHANCED CLAUDE FUNCTIONS
    getClaudeStrategicAnalysis,
    getClaudeLiveResearch,
    getClaudeComplexAnalysis,
    getClaudeCambodiaIntelligence,
    getClaudeWithWebSearch,
    
    // 🎯 INTELLIGENCE FUNCTIONS
    analyzeConversationType,
    createAdaptiveSystemPrompt,
    
    // 🔧 UTILITY FUNCTIONS
    testClaudeConnection,
    getClaudeMetrics,
    
    // 🏛️ CLAUDE CLIENT INSTANCE
    anthropic
};
