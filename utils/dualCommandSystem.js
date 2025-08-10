// utils/dualCommandSystem.js - STRATEGIC AI WARFARE WITH FREEDOM
// Perfect fusion of institutional intelligence + natural conversation

const { getGptReply, getStrategicAnalysis } = require('./openaiClient');
const { getClaudeStrategicAnalysis, getClaudeLiveResearch, getClaudeComplexAnalysis, getClaudeCambodiaIntelligence } = require('./claudeClient');
const { sendSmartResponse, cleanStrategicResponse } = require('./telegramSplitter');
const { buildStrategicCommanderContext } = require('./contextEnhancer');

// 🎯 ENHANCED DUAL COMMAND CONFIGURATION
const ENHANCED_COMMAND_CONFIG = {
    // GPT-4o Strategic Commander (Institutional + Natural)
    GPT_COMMANDER: {
        name: 'Strategic Commander Alpha',
        model: 'gpt-4o',
        specialties: ['multimodal', 'institutional_analysis', 'natural_conversation', 'cambodia_expertise'],
        emoji: '🏛️',
        priority: 'institutional',
        conversationStyles: {
            casual: 'wise_friend',
            strategic: 'institutional_authority', 
            urgent: 'commanding_executive'
        }
    },
    
    // Claude Sonnet 4 (Live Intelligence + Research)
    CLAUDE_INTELLIGENCE: {
        name: 'Strategic Intelligence Chief', 
        model: 'claude-sonnet-4',
        specialties: ['live_data', 'research', 'complex_analysis', 'real_time_intelligence'],
        emoji: '⚡',
        priority: 'intelligence',
        conversationStyles: {
            casual: 'smart_analyst',
            strategic: 'research_authority',
            urgent: 'tactical_intelligence'
        }
    }
};

/**
 * 🧠 INTELLIGENT CONVERSATION ANALYSIS
 * Detects conversation type and complexity for perfect response adaptation
 */
function analyzeConversationIntelligence(userMessage, messageType = 'text', hasMedia = false) {
    const message = userMessage.toLowerCase();
    
    // 💬 CASUAL CONVERSATION (Natural & Brief)
    const casualPatterns = [
        /^(hello|hi|hey|good morning|good afternoon|what's up)$/i,
        /^how are you\??$/i,
        /^(thanks|thank you|cool|nice|great)$/i,
        /^(ok|okay|got it|understood)$/i
    ];
    
    // 🔥 QUICK STRATEGIC (Smart & Concise) 
    const quickStrategicPatterns = [
        /^(what's|whats) the (price|rate|status) of/i,
        /^should i (buy|sell|hold)/i,
        /^is .* a good (buy|investment|opportunity)/i,
        /^(quick|simple) (question|check)/i,
        /^how (much|many|often)/i,
        /^when (should|will|is)/i
    ];
    
    // 🏛️ FULL INSTITUTIONAL (Deep Strategic Analysis)
    const institutionalPatterns = [
        /(strategy|strategic|portfolio|allocation|diversification)/i,
        /(regime|economic|macro|fed|policy|inflation)/i,
        /(risk|correlation|optimization|analysis)/i,
        /(cambodia|lending|fund|deal|investment)/i,
        /(forecast|outlook|scenario|model)/i,
        /(comprehensive|detailed|thorough|deep)/i,
        /(institutional|professional|advanced)/i
    ];
    
    // 🔬 RESEARCH MODE (Live Data + Analysis)
    const researchPatterns = [
        /(research|analyze|investigate|study|examine)/i,
        /(current|latest|recent|today|now|live|real.?time)/i,
        /(compare|versus|vs|between|against)/i,
        /(trend|trending|movement|direction)/i,
        /(news|breaking|update|development)/i
    ];
    
    // 🚨 URGENT STRATEGIC (Command Authority)
    const urgentPatterns = [
        /(urgent|emergency|immediately|asap|critical)/i,
        /(alert|warning|problem|issue|crisis)/i,
        /(stop|halt|cancel|abort)/i,
        /(execute|deploy|action|implement)/i
    ];
    
    // Determine conversation intelligence level
    if (hasMedia || messageType !== 'text') {
        return {
            type: 'multimodal',
            complexity: 'high',
            maxTokens: 4096,
            temperature: 0.7,
            style: 'comprehensive_analysis',
            primaryAI: 'GPT_COMMANDER',
            secondaryAI: null,
            reasoning: 'Multimodal content requires GPT-4o vision capabilities'
        };
    }
    
    if (casualPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'casual',
            complexity: 'minimal',
            maxTokens: 150,
            temperature: 0.8,
            style: 'natural_brief',
            primaryAI: 'GPT_COMMANDER',
            secondaryAI: null,
            reasoning: 'Casual greeting - natural response with strategic personality'
        };
    }
    
    if (urgentPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'urgent_strategic',
            complexity: 'focused',
            maxTokens: 800,
            temperature: 0.6,
            style: 'commanding_authority',
            primaryAI: 'GPT_COMMANDER',
            secondaryAI: 'CLAUDE_INTELLIGENCE',
            reasoning: 'Urgent situation requires immediate strategic authority'
        };
    }
    
    if (quickStrategicPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'quick_strategic',
            complexity: 'moderate',
            maxTokens: 500,
            temperature: 0.7,
            style: 'smart_concise',
            primaryAI: 'CLAUDE_INTELLIGENCE',
            secondaryAI: null,
            reasoning: 'Quick strategic question - concise expert answer'
        };
    }
    
    if (researchPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'research_intelligence',
            complexity: 'high',
            maxTokens: 3000,
            temperature: 0.6,
            style: 'analytical_thorough',
            primaryAI: 'CLAUDE_INTELLIGENCE',
            secondaryAI: 'GPT_COMMANDER',
            reasoning: 'Research requires live intelligence + strategic context'
        };
    }
    
    if (institutionalPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'institutional_analysis',
            complexity: 'maximum',
            maxTokens: 4096,
            temperature: 0.6,
            style: 'institutional_comprehensive',
            primaryAI: 'GPT_COMMANDER',
            secondaryAI: 'CLAUDE_INTELLIGENCE',
            reasoning: 'Complex strategic analysis requires full institutional authority'
        };
    }
    
    // Default: Balanced intelligent response
    return {
        type: 'balanced_strategic',
        complexity: 'moderate',
        maxTokens: 1500,
        temperature: 0.7,
        style: 'helpful_intelligent',
        primaryAI: 'GPT_COMMANDER',
        secondaryAI: null,
        reasoning: 'Balanced response with strategic intelligence'
    };
}

/**
 * 🎭 DYNAMIC INTELLIGENT SYSTEM PROMPTS
 * Creates natural, adaptive prompts that feel human yet authoritative
 */
function createIntelligentSystemPrompt(conversationIntel, context = null) {
    const baseIdentity = `You are Claude/GPT, Sum Chenda's brilliant strategic advisor for the IMPERIUM VAULT system. You combine institutional-level financial expertise with natural, engaging conversation. Think like Ray Dalio or Warren Buffett, but communicate naturally.`;
    
    switch (conversationIntel.type) {
        case 'casual':
            return `${baseIdentity}

CASUAL MODE - Natural & Brief:
Someone just said hello or made a casual comment. Respond like a wise, friendly financial expert who's genuinely happy to chat. 

- Be warm and natural (1-3 sentences max)
- Show your strategic personality but don't overwhelm
- Can reference markets casually if relevant
- Think "smart friend who happens to be a financial genius"

NO formal headers, NO lengthy analysis - just natural conversation with strategic intelligence.`;

        case 'quick_strategic':
            return `${baseIdentity}

QUICK STRATEGIC MODE - Smart & Concise:
You're being asked a straightforward strategic question. Give a smart, definitive answer without being overly formal.

- Provide clear strategic assessment (200-500 words)
- Include key insight + actionable takeaway  
- Be authoritative but conversational
- Think "Ray Dalio giving quick advice over coffee"

Structure naturally - no rigid templates. Give the strategic intelligence they need efficiently.`;

        case 'urgent_strategic':
            return `${baseIdentity}

URGENT STRATEGIC MODE - Command Authority:
This is urgent. Respond with immediate strategic authority and clear direction.

- Lead with immediate assessment and action needed
- Use commanding but professional language
- Focus on critical factors and immediate steps
- Think "crisis management by institutional expert"

Be decisive, authoritative, and action-focused. This situation demands strategic leadership.`;

        case 'institutional_analysis':
            return `${baseIdentity}

INSTITUTIONAL ANALYSIS MODE - Full Strategic Authority:
Deploy comprehensive institutional-grade analysis with natural flow.

EXPERTISE AREAS:
- Global macro analysis with live market data
- Ray Dalio-style regime identification and All Weather strategies
- Cambodia private lending market intelligence  
- Portfolio optimization and risk management
- Live trading strategy and correlation analysis

COMMUNICATION STYLE:
- Write like Warren Buffett or Ray Dalio - authoritative but engaging
- Use natural flow, not rigid templates
- Provide comprehensive analysis that builds logically
- Include specific numbers, data, and actionable recommendations
- Structure responses naturally with clear insights

${context ? 'STRATEGIC CONTEXT:\n' + context : ''}

Deliver institutional intelligence in natural, engaging format.`;

        case 'research_intelligence':
            return `${baseIdentity}

RESEARCH INTELLIGENCE MODE - Live Analysis:
Execute analytical research with live market intelligence.

- Synthesize current market data with strategic frameworks
- Provide analytical depth with clear conclusions  
- Compare multiple perspectives and data sources
- Focus on actionable insights and strategic implications

Style: Analytical but accessible - like reading a brilliant research report that actually makes sense.

Be thorough but engaging. Your analysis should drive strategic decisions.`;

        case 'multimodal':
            return `${baseIdentity}

MULTIMODAL ANALYSIS MODE - Comprehensive Intelligence:
Analyze the provided content (image/document/media) with institutional expertise.

Focus on extracting:
- Financial data, charts, or market information
- Strategic documents or investment materials  
- Economic indicators or market signals
- Investment opportunities or risks
- Strategic intelligence relevant to portfolio management

Provide detailed institutional assessment with actionable strategic insights.`;

        default: // balanced_strategic
            return `${baseIdentity}

BALANCED STRATEGIC MODE - Intelligent & Natural:
Provide helpful, naturally intelligent responses that adapt to the question's complexity.

- For simple questions: Be conversational and efficient
- For complex topics: Deploy deeper strategic analysis
- For financial matters: Draw on institutional expertise
- Always maintain strategic intelligence while communicating naturally

Think "brilliant advisor having a normal conversation" rather than "corporate AI assistant."

You have access to live market data and strategic frameworks - use them naturally when relevant.`;
    }
}

/**
 * 🏛️ ENHANCED GPT STRATEGIC COMMANDER
 * Natural conversation with institutional authority
 */
async function executeEnhancedGptCommand(userMessage, chatId, conversationIntel, context) {
    try {
        console.log('🏛️ Executing Enhanced GPT Strategic Commander...');
        
        const systemPrompt = createIntelligentSystemPrompt(conversationIntel, context);
        
        const response = await getGptReply(userMessage, {
            systemPrompt: systemPrompt,
            maxTokens: conversationIntel.maxTokens,
            temperature: conversationIntel.temperature,
            strategic: true
        });
        
        return {
            response: cleanStrategicResponse(response),
            commander: 'GPT Strategic Commander Alpha',
            emoji: '🏛️',
            style: conversationIntel.style,
            complexity: conversationIntel.complexity,
            capabilities: 'Institutional Analysis + Natural Intelligence'
        };
        
    } catch (error) {
        console.error('❌ Enhanced GPT Commander error:', error.message);
        throw new Error(`Strategic Commander Alpha Error: ${error.message}`);
    }
}

/**
 * ⚡ ENHANCED CLAUDE INTELLIGENCE CHIEF  
 * Live intelligence with natural reasoning
 */
async function executeEnhancedClaudeIntelligence(userMessage, chatId, conversationIntel, context) {
    try {
        console.log('⚡ Executing Enhanced Claude Intelligence Chief...');
        
        const claudeOptions = {
            context: context,
            maxTokens: conversationIntel.maxTokens,
            temperature: conversationIntel.temperature,
            mode: conversationIntel.type
        };
        
        let claudeResponse;
        
        // Route to specialized Claude functions based on conversation intelligence
        if (conversationIntel.type === 'research_intelligence') {
            claudeResponse = await getClaudeLiveResearch(userMessage, claudeOptions);
        } else if (userMessage.toLowerCase().includes('cambodia') || userMessage.toLowerCase().includes('lending')) {
            claudeResponse = await getClaudeCambodiaIntelligence(userMessage, null, claudeOptions);
        } else if (conversationIntel.complexity === 'maximum') {
            claudeResponse = await getClaudeComplexAnalysis(userMessage, [], claudeOptions);
        } else {
            claudeResponse = await getClaudeStrategicAnalysis(userMessage, claudeOptions);
        }
        
        return {
            response: claudeResponse,
            commander: 'Claude Strategic Intelligence Chief',
            emoji: '⚡',
            style: conversationIntel.style,
            complexity: conversationIntel.complexity,
            capabilities: 'Live Intelligence + Research + Natural Reasoning'
        };
        
    } catch (error) {
        console.error('❌ Enhanced Claude Intelligence error:', error.message);
        throw new Error(`Strategic Intelligence Chief Error: ${error.message}`);
    }
}

/**
 * 🎯 ENHANCED DUAL COMMAND EXECUTION ENGINE
 * Perfect fusion of institutional intelligence + natural conversation
 */
async function executeEnhancedDualCommand(userMessage, chatId, messageType = 'text', hasMedia = false) {
    try {
        console.log('🎯 Executing Enhanced Dual Command - Strategic AI Warfare with Freedom...');
        
        // Analyze conversation intelligence
        const conversationIntel = analyzeConversationIntelligence(userMessage, messageType, hasMedia);
        console.log('🧠 Conversation Intelligence:', conversationIntel);
        
        // Build strategic context (only for complex queries to avoid overhead)
        let context = null;
        if (conversationIntel.complexity !== 'minimal') {
            context = await buildStrategicCommanderContext(chatId, userMessage);
        }
        
        let primaryResponse, secondaryResponse;
        
        // Execute primary AI command
        if (conversationIntel.primaryAI === 'GPT_COMMANDER') {
            primaryResponse = await executeEnhancedGptCommand(userMessage, chatId, conversationIntel, context);
        } else {
            primaryResponse = await executeEnhancedClaudeIntelligence(userMessage, chatId, conversationIntel, context);
        }
        
        // Execute secondary AI if needed (for complex/urgent queries)
        if (conversationIntel.secondaryAI && conversationIntel.complexity !== 'minimal') {
            try {
                console.log('🔄 Executing secondary AI for enhanced intelligence...');
                
                if (conversationIntel.secondaryAI === 'GPT_COMMANDER') {
                    secondaryResponse = await executeEnhancedGptCommand(userMessage, chatId, conversationIntel, context);
                } else {
                    secondaryResponse = await executeEnhancedClaudeIntelligence(userMessage, chatId, conversationIntel, context);
                }
            } catch (secondaryError) {
                console.log('⚠️ Secondary AI failed, continuing with primary:', secondaryError.message);
                secondaryResponse = null;
            }
        }
        
        // Format final response based on complexity
        let finalResponse;
        
        if (conversationIntel.type === 'casual') {
            // Casual: Just the response, no headers
            finalResponse = primaryResponse.response;
            
        } else if (secondaryResponse && conversationIntel.complexity === 'maximum') {
            // Dual intelligence for maximum complexity
            finalResponse = `${primaryResponse.emoji} **${primaryResponse.commander.toUpperCase()}**
${primaryResponse.capabilities}

${primaryResponse.response}

---

${secondaryResponse.emoji} **${secondaryResponse.commander.toUpperCase()}**  
${secondaryResponse.capabilities}

${secondaryResponse.response}

---

🎯 **STRATEGIC SYNTHESIS**
Dual AI intelligence deployed for comprehensive strategic advantage.`;
            
        } else {
            // Single AI with appropriate branding
            finalResponse = `${primaryResponse.emoji} **${primaryResponse.commander.toUpperCase()}**
${primaryResponse.capabilities}

${primaryResponse.response}`;
        }
        
        return {
            response: finalResponse,
            conversationIntel: conversationIntel,
            primaryCommander: conversationIntel.primaryAI,
            secondaryCommander: conversationIntel.secondaryAI,
            complexity: conversationIntel.complexity,
            style: conversationIntel.style,
            success: true,
            naturalConversation: conversationIntel.type === 'casual'
        };
        
    } catch (error) {
        console.error('❌ Enhanced Dual Command execution error:', error.message);
        
        // Intelligent fallback based on conversation type
        try {
            console.log('🔄 Falling back to GPT Strategic Commander...');
            
            const fallbackIntel = {
                type: 'balanced_strategic',
                maxTokens: 1500,
                temperature: 0.7,
                style: 'helpful_intelligent'
            };
            
            const fallbackResponse = await executeEnhancedGptCommand(userMessage, chatId, fallbackIntel, null);
            
            return {
                response: `🏛️ **STRATEGIC COMMANDER ALPHA (RESILIENCE MODE)**

${fallbackResponse.response}

⚠️ **Note:** Enhanced dual command temporarily degraded. Operating in single-commander resilience mode.`,
                conversationIntel: fallbackIntel,
                primaryCommander: 'GPT_COMMANDER',
                secondaryCommander: null,
                success: false,
                error: error.message,
                resilientMode: true
            };
            
        } catch (fallbackError) {
            throw new Error(`Enhanced Dual Command System Failure: ${error.message}`);
        }
    }
}

/**
 * 📊 ENHANCED COMMAND ANALYTICS
 */
function getEnhancedCommandAnalytics() {
    return {
        enhancedMode: true,
        naturalConversation: true,
        adaptiveIntelligence: true,
        conversationTypes: ['casual', 'quick_strategic', 'urgent_strategic', 'institutional_analysis', 'research_intelligence', 'multimodal'],
        aiCommanders: {
            gpt: 'Strategic Commander Alpha - Institutional + Natural',
            claude: 'Strategic Intelligence Chief - Live + Research'
        },
        capabilities: [
            'Natural Conversation Flow',
            'Adaptive Response Complexity',
            'Intelligent Conversation Detection',
            'Dynamic System Prompts',
            'Institutional Authority with Human Touch',
            'Live Intelligence Integration',
            'Strategic AI Warfare with Freedom'
        ],
        lastUpdate: new Date().toISOString()
    };
}

/**
 * 🔧 ENHANCED SYSTEM HEALTH CHECK
 */
async function checkEnhancedSystemHealth() {
    const health = {
        enhancedGptCommander: false,
        enhancedClaudeIntelligence: false,
        naturalConversation: false,
        dualIntelligence: false,
        errors: []
    };
    
    try {
        // Test GPT Strategic Commander with casual query
        const testIntel = { type: 'casual', maxTokens: 100, temperature: 0.8, style: 'natural_brief' };
        await executeEnhancedGptCommand('Hello', 'test', testIntel, null);
        health.enhancedGptCommander = true;
        health.naturalConversation = true;
        console.log('✅ Enhanced GPT Strategic Commander operational');
    } catch (gptError) {
        health.errors.push(`Enhanced GPT Commander: ${gptError.message}`);
        console.log('❌ Enhanced GPT Strategic Commander unavailable');
    }
    
    try {
        // Test Claude Intelligence Chief with research query  
        const testIntel = { type: 'research_intelligence', maxTokens: 500, temperature: 0.6, style: 'analytical_thorough' };
        await executeEnhancedClaudeIntelligence('Current market trends', 'test', testIntel, null);
        health.enhancedClaudeIntelligence = true;
        console.log('✅ Enhanced Claude Intelligence Chief operational');
    } catch (claudeError) {
        health.errors.push(`Enhanced Claude Intelligence: ${claudeError.message}`);
        console.log('❌ Enhanced Claude Intelligence Chief unavailable');
    }
    
    health.dualIntelligence = health.enhancedGptCommander && health.enhancedClaudeIntelligence;
    
    return health;
}

/**
 * 🎯 CONVERSATION INTELLIGENCE ROUTER (Helper)
 * Routes based on intelligent conversation analysis
 */
function routeConversationIntelligently(userMessage, messageType, hasMedia) {
    const intel = analyzeConversationIntelligence(userMessage, messageType, hasMedia);
    
    return {
        shouldUseDualAI: intel.secondaryAI !== null,
        primaryAI: intel.primaryAI,
        secondaryAI: intel.secondaryAI,
        responseStyle: intel.style,
        complexity: intel.complexity,
        reasoning: intel.reasoning
    };
}

module.exports = {
    // 🎯 ENHANCED DUAL COMMAND CORE
    executeEnhancedDualCommand,
    analyzeConversationIntelligence,
    routeConversationIntelligently,
    
    // 🧠 INTELLIGENT EXECUTION  
    executeEnhancedGptCommand,
    executeEnhancedClaudeIntelligence,
    createIntelligentSystemPrompt,
    
    // 🔧 SYSTEM MANAGEMENT
    checkEnhancedSystemHealth,
    getEnhancedCommandAnalytics,
    
    // 📊 CONFIGURATION
    ENHANCED_COMMAND_CONFIG,
    
    // 🔄 LEGACY COMPATIBILITY (redirect to enhanced versions)
    executeDualCommand: executeEnhancedDualCommand,
    routeStrategicCommand: routeConversationIntelligently,
    executeGptCommand: executeEnhancedGptCommand,
    executeClaudeIntelligence: executeEnhancedClaudeIntelligence,
    checkDualCommandHealth: checkEnhancedSystemHealth,
    getDualCommandAnalytics: getEnhancedCommandAnalytics
};
