// utils/dualCommandSystem.js - STRATEGIC AI WARFARE WITH FREEDOM + LIVE DATA POWER
// Perfect fusion of institutional intelligence + natural conversation + Ray Dalio framework

const { getGptReply, getStrategicAnalysis } = require('./openaiClient');
const { 
    getClaudeStrategicAnalysis, 
    getClaudeLiveResearch, 
    getClaudeComplexAnalysis, 
    getClaudeCambodiaIntelligence,
    getClaudeWithMarketData,
    getClaudeRegimeAnalysis,
    getClaudeAnomalyAnalysis,
    getClaudePortfolioOptimization,
    getClaudeStrategicInsights,
    analyzeConversationType,
    checkClaudeSystemHealth
} = require('./claudeClient');
const { sendSmartResponse, cleanStrategicResponse } = require('./telegramSplitter');
const { buildStrategicCommanderContext } = require('./contextEnhancer');

// 🌍 GLOBAL DATE/TIME UTILITIES WITH MULTI-TIMEZONE SUPPORT
function getCurrentCambodiaDateTime() {
    try {
        const now = new Date();
        const cambodiaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Phnom_Penh"}));
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        const dayName = days[cambodiaTime.getDay()];
        const monthName = months[cambodiaTime.getMonth()];
        const date = cambodiaTime.getDate();
        const year = cambodiaTime.getFullYear();
        const hour = cambodiaTime.getHours();
        const minute = cambodiaTime.getMinutes();
        const isWeekend = cambodiaTime.getDay() === 0 || cambodiaTime.getDay() === 6;
        
        return {
            date: `${dayName}, ${monthName} ${date}, ${year}`,
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            timeShort: `${hour}:${minute.toString().padStart(2, '0')}`,
            hour: hour,
            minute: minute,
            dayName: dayName,
            isWeekend: isWeekend,
            cambodiaTimezone: 'ICT (UTC+7)',
            timestamp: cambodiaTime.toISOString()
        };
    } catch (error) {
        console.error('❌ Cambodia DateTime error:', error.message);
        return {
            date: new Date().toDateString(),
            time: new Date().toTimeString().slice(0, 5),
            timeShort: new Date().toTimeString().slice(0, 5),
            hour: new Date().getHours(),
            isWeekend: [0, 6].includes(new Date().getDay()),
            error: 'Timezone calculation failed'
        };
    }
}

function getCurrentGlobalDateTime() {
    try {
        const now = new Date();
        
        const cambodiaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Phnom_Penh"}));
        const newYorkTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        const londonTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));
        
        return {
            cambodia: {
                ...getCurrentCambodiaDateTime(),
                timezone: 'ICT (UTC+7)'
            },
            newYork: {
                time: `${newYorkTime.getHours()}:${newYorkTime.getMinutes().toString().padStart(2, '0')}`,
                hour: newYorkTime.getHours(),
                timezone: 'EST/EDT (UTC-5/-4)'
            },
            london: {
                time: `${londonTime.getHours()}:${londonTime.getMinutes().toString().padStart(2, '0')}`,
                hour: londonTime.getHours(),
                timezone: 'GMT/BST (UTC+0/+1)'
            },
            utc: now.toISOString()
        };
    } catch (error) {
        console.error('❌ Global DateTime error:', error.message);
        return {
            cambodia: getCurrentCambodiaDateTime(),
            error: 'Global timezone calculation failed'
        };
    }
}

// 🎯 ENHANCED DUAL COMMAND CONFIGURATION WITH LIVE DATA
const ENHANCED_COMMAND_CONFIG = {
    GPT_COMMANDER: {
        name: 'Strategic Commander Alpha',
        model: 'gpt-4o',
        specialties: ['multimodal', 'institutional_analysis', 'natural_conversation', 'cambodia_expertise', 'strategic_synthesis', 'datetime_queries'],
        emoji: '🏛️',
        priority: 'institutional',
        conversationStyles: {
            casual: 'wise_friend',
            strategic: 'institutional_authority', 
            urgent: 'commanding_executive',
            synthesis: 'strategic_synthesizer'
        }
    },
    CLAUDE_INTELLIGENCE: {
        name: 'Strategic Intelligence Chief', 
        model: 'claude-opus-4-1-20250805',
        specialties: ['live_data', 'research', 'complex_analysis', 'real_time_intelligence', 'ray_dalio_framework', 'market_regimes', 'anomaly_detection', 'global_time_awareness'],
        emoji: '⚡',
        priority: 'intelligence',
        conversationStyles: {
            casual: 'smart_analyst',
            strategic: 'research_authority',
            urgent: 'tactical_intelligence',
            regime: 'institutional_economist'
        }
    }
};

/**
 * 🧠 ENHANCED CONVERSATION ANALYSIS WITH LIVE DATA AWARENESS AND DATETIME DETECTION
 * Detects conversation type and routes to optimal AI with live data integration
 */
function analyzeConversationIntelligence(userMessage, messageType = 'text', hasMedia = false) {
    const message = userMessage.toLowerCase();
    
    // 🕐 SIMPLE DATE/TIME QUERIES (Quick Response)
    const dateTimePatterns = [
        /^(what time|what's the time|current time|time now)/i,
        /^(what date|what's the date|today's date|date today)/i,
        /^(what day|what's today|today is)/i,
        /^(time in cambodia|cambodia time)/i
    ];
    
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
    
    // 🏛️ ECONOMIC REGIME QUERIES (Claude + Ray Dalio Framework)
    const regimePatterns = [
        /(economic regime|market regime|regime analysis)/i,
        /(growth.*inflation|inflation.*growth)/i,
        /(all weather|ray dalio|bridgewater)/i,
        /(regime.*detect|regime.*analysis)/i,
        /(growth.*accelerat|growth.*decelerat)/i,
        /(inflation.*ris|inflation.*fall)/i
    ];
    
    // 🚨 MARKET ANOMALY QUERIES (Claude + Anomaly Detection)
    const anomalyPatterns = [
        /(anomaly|anomalies|market stress)/i,
        /(crisis|bubble|crash|panic)/i,
        /(vix.*spike|volatility.*extreme)/i,
        /(yield.*invert|curve.*invert)/i,
        /(credit.*spread|spread.*widen)/i,
        /(market.*breakdown|correlation.*breakdown)/i
    ];
    
    // 💎 PORTFOLIO OPTIMIZATION QUERIES (Claude + Live Regime Data)
    const portfolioPatterns = [
        /(portfolio.*optim|allocation.*optim)/i,
        /(rebalanc|diversif|correlation)/i,
        /(risk.*adjust|hedge|position.*siz)/i,
        /(asset.*allocation|strategic.*allocation)/i,
        /(portfolio.*performance|portfolio.*analysis)/i
    ];
    
    // 🇰🇭 CAMBODIA QUERIES (Enhanced with Global Context)
    const cambodiaPatterns = [
        /(cambodia|khmer|phnom penh|cambodian)/i,
        /(lending.*cambodia|cambodia.*lending)/i,
        /(usd.*khr|khr.*usd)/i,
        /(cambodia.*fund|fund.*cambodia)/i
    ];
    
    // 🏛️ FULL INSTITUTIONAL (Deep Strategic Analysis)
    const institutionalPatterns = [
        /(strategy|strategic|portfolio|allocation|diversification)/i,
        /(macro|economic|fed|policy|inflation.*target)/i,
        /(risk|correlation|optimization|analysis)/i,
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
    
    // Determine conversation intelligence level with enhanced routing
    if (hasMedia || messageType !== 'text') {
        return {
            type: 'multimodal',
            complexity: 'high',
            maxTokens: 4096,
            temperature: 0.7,
            style: 'comprehensive_analysis',
            primaryAI: 'GPT_COMMANDER',
            secondaryAI: null,
            liveDataRequired: false,
            reasoning: 'Multimodal content requires GPT-4o vision capabilities'
        };
    }
    
    if (dateTimePatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'simple_datetime',
            complexity: 'minimal',
            maxTokens: 200,
            temperature: 0.8,
            style: 'natural_informative',
            primaryAI: 'GPT_COMMANDER',
            secondaryAI: null,
            liveDataRequired: false,
            reasoning: 'Simple date/time query - direct response with current time'
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
            liveDataRequired: false,
            reasoning: 'Casual greeting - natural response with strategic personality'
        };
    }
    
    if (regimePatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'economic_regime',
            complexity: 'high',
            maxTokens: 3000,
            temperature: 0.6,
            style: 'ray_dalio_institutional',
            primaryAI: 'CLAUDE_INTELLIGENCE',
            secondaryAI: null,
            liveDataRequired: true,
            specializedFunction: 'getClaudeRegimeAnalysis',
            reasoning: 'Economic regime analysis requires Claude + Ray Dalio framework'
        };
    }
    
    if (anomalyPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'market_anomaly',
            complexity: 'high',
            maxTokens: 3000,
            temperature: 0.6,
            style: 'crisis_analysis',
            primaryAI: 'CLAUDE_INTELLIGENCE',
            secondaryAI: 'GPT_COMMANDER',
            liveDataRequired: true,
            specializedFunction: 'getClaudeAnomalyAnalysis',
            reasoning: 'Market anomaly detection requires Claude + live data + GPT synthesis'
        };
    }
    
    if (portfolioPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'portfolio_optimization',
            complexity: 'maximum',
            maxTokens: 4096,
            temperature: 0.5,
            style: 'portfolio_institutional',
            primaryAI: 'CLAUDE_INTELLIGENCE',
            secondaryAI: 'GPT_COMMANDER',
            liveDataRequired: true,
            specializedFunction: 'getClaudePortfolioOptimization',
            reasoning: 'Portfolio optimization requires Claude + live regime data + GPT strategic synthesis'
        };
    }
    
    if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'cambodia_intelligence',
            complexity: 'high',
            maxTokens: 4096,
            temperature: 0.6,
            style: 'cambodia_enhanced',
            primaryAI: 'CLAUDE_INTELLIGENCE',
            secondaryAI: null,
            liveDataRequired: true,
            specializedFunction: 'getClaudeCambodiaIntelligence',
            reasoning: 'Cambodia analysis enhanced with global market context'
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
            liveDataRequired: true,
            reasoning: 'Urgent situation requires immediate strategic authority with live data validation'
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
            liveDataRequired: true,
            reasoning: 'Quick strategic question - concise expert answer with live data'
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
            liveDataRequired: true,
            specializedFunction: 'getClaudeWithMarketData',
            reasoning: 'Research requires comprehensive live intelligence + strategic context'
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
            liveDataRequired: true,
            reasoning: 'Complex strategic analysis requires full institutional authority with live intelligence'
        };
    }
    
    // Default: Balanced intelligent response with live data
    return {
        type: 'balanced_strategic',
        complexity: 'moderate',
        maxTokens: 1500,
        temperature: 0.7,
        style: 'helpful_intelligent',
        primaryAI: 'GPT_COMMANDER',
        secondaryAI: null,
        liveDataRequired: true,
        reasoning: 'Balanced response with strategic intelligence and live data awareness'
    };
}

/**
 * 🎭 ENHANCED SYSTEM PROMPTS WITH LIVE DATA AWARENESS
 * Creates natural, adaptive prompts with live market intelligence integration
 */
function createIntelligentSystemPrompt(conversationIntel, context = null) {
    const baseIdentity = `You are Claude/GPT, Sum Chenda's brilliant strategic advisor for the IMPERIUM VAULT system. You combine institutional-level financial expertise with natural, engaging conversation. You have access to Ray Dalio's economic regime framework and real-time market intelligence.`;
    
    switch (conversationIntel.type) {
        case 'simple_datetime':
            return `${baseIdentity}

SIMPLE DATE/TIME MODE - Natural & Informative:
Someone is asking for current date/time information. Provide friendly, accurate time information with your strategic personality.

- Give clear, accurate date/time for Cambodia (ICT timezone)
- Include day of week and whether it's weekend
- Be warm and natural (1-2 sentences)
- Can add brief market context if it's a weekday/weekend
- Think "helpful friend who happens to know market timing"

NO formal headers - just natural, accurate time information with strategic awareness.`;

        case 'casual':
            return `${baseIdentity}

CASUAL MODE - Natural & Brief:
Someone just said hello or made a casual comment. Respond like a wise, friendly financial expert who's genuinely happy to chat. 

- Be warm and natural (1-3 sentences max)
- Show your strategic personality but don't overwhelm
- Can reference current market conditions casually if relevant
- Think "smart friend who happens to be a financial genius with live market data"

NO formal headers, NO lengthy analysis - just natural conversation with strategic intelligence.`;

        case 'quick_strategic':
            return `${baseIdentity}

QUICK STRATEGIC MODE - Smart & Concise with Live Data:
You're being asked a straightforward strategic question and have access to real-time market data.

- Provide clear strategic assessment with current market context (200-500 words)
- Include key insight + actionable takeaway enhanced by live data
- Be authoritative but conversational
- Think "Ray Dalio with real-time data feeds giving quick advice over coffee"

Structure naturally - no rigid templates. Give strategic intelligence enhanced by live market conditions.`;

        case 'economic_regime':
            return `${baseIdentity}

🏛️ ECONOMIC REGIME ANALYSIS MODE - Ray Dalio Framework Expert:
You're being asked about economic regimes using Ray Dalio's institutional framework with live data.

REGIME EXPERTISE:
- Ray Dalio's 4-quadrant regime matrix (Growth/Inflation dynamics)
- Live economic regime detection and confidence scoring
- All Weather strategy implications and positioning
- Real-time regime signal analysis and validation
- Historical regime patterns and transition probabilities

ANALYSIS APPROACH:
- Lead with current regime identification and confidence level
- Explain regime dynamics with live data validation
- Provide specific All Weather allocation recommendations
- Include regime transition risks and timing considerations
- Offer actionable positioning strategies for current environment

Communicate like Ray Dalio with access to real-time regime detection systems.`;

        case 'market_anomaly':
            return `${baseIdentity}

🚨 MARKET ANOMALY ANALYSIS MODE - Crisis Detection Expert:
You're analyzing market anomalies and stress signals with real-time detection systems.

ANOMALY DETECTION EXPERTISE:
- Real-time market stress signal identification
- VIX spike analysis and fear/complacency extremes
- Yield curve inversion and recession probability modeling
- Credit spread widening and systemic risk assessment
- Correlation breakdown and diversification failure detection
- Crisis pattern recognition and historical comparison

CRISIS ANALYSIS APPROACH:
- Lead with immediate anomaly assessment and severity levels
- Explain systemic implications and contagion risks
- Provide specific defensive positioning recommendations
- Include crisis probability and timing considerations
- Offer tactical hedging strategies and safe haven positioning

Communicate like an institutional risk manager with real-time crisis detection systems.`;

        case 'portfolio_optimization':
            return `${baseIdentity}

💎 PORTFOLIO OPTIMIZATION MODE - Institutional Asset Allocation Expert:
You're optimizing portfolios using live regime data and institutional frameworks.

PORTFOLIO OPTIMIZATION EXPERTISE:
- Live economic regime-based allocation strategies
- Ray Dalio All Weather portfolio construction
- Real-time correlation analysis and diversification effectiveness
- Risk-adjusted return optimization with live market conditions
- Strategic vs tactical asset allocation with regime awareness
- Hedging strategy implementation and position sizing

OPTIMIZATION APPROACH:
- Lead with current regime allocation recommendations
- Analyze portfolio correlation and diversification effectiveness
- Provide specific rebalancing actions with live data validation
- Include risk management and hedging strategies
- Offer performance enhancement through regime-aware positioning

Communicate like an institutional portfolio manager with access to real-time regime and correlation data.`;

        case 'cambodia_intelligence':
            return `${baseIdentity}

🇰🇭 CAMBODIA INTELLIGENCE MODE - Enhanced with Global Market Context:
You're analyzing Cambodia opportunities with global market intelligence integration.

ENHANCED CAMBODIA EXPERTISE:
- Cambodia economic environment with global regime context
- USD/KHR dynamics enhanced by Fed policy and global dollar trends
- Cambodia property market with global real estate correlation analysis
- Private lending opportunities with global credit spread context
- Political and regulatory assessment with regional stability analysis
- Comparative yield analysis using global alternative investment data

ANALYSIS APPROACH:
- Integrate Cambodia analysis with current global market regime
- Assess local opportunities within global risk-on/risk-off context
- Provide specific deal structuring recommendations with global hedging
- Include exit strategy timing based on global liquidity conditions
- Offer portfolio allocation recommendations considering global correlation

Communicate like a Cambodia market expert with access to global institutional market intelligence.`;

        case 'urgent_strategic':
            return `${baseIdentity}

🚨 URGENT STRATEGIC MODE - Command Authority with Live Intelligence:
This is urgent. Respond with immediate strategic authority enhanced by real-time market data.

- Lead with immediate assessment using live market intelligence
- Provide clear action items validated by current market conditions
- Use commanding but professional language with data backing
- Focus on critical factors and immediate steps enhanced by live data
- Think "crisis management by institutional expert with real-time feeds"

Be decisive, authoritative, and action-focused with live market intelligence advantage.`;

        case 'institutional_analysis':
            return `${baseIdentity}

🎯 INSTITUTIONAL ANALYSIS MODE - Full Strategic Authority with Live Intelligence:
Deploy comprehensive institutional-grade analysis enhanced with real-time market data.

ENHANCED EXPERTISE AREAS:
- Live global macro analysis with real-time regime detection
- Ray Dalio-style regime identification with current market validation
- Cambodia private lending with global market context integration  
- Portfolio optimization using live correlation and regime data
- Real-time trading strategy with live market intelligence
- Crisis analysis with live anomaly detection systems

COMMUNICATION STYLE:
- Write like Warren Buffett or Ray Dalio with real-time data advantage
- Use natural flow enhanced by live market intelligence
- Provide comprehensive analysis building logically with current data
- Include specific live numbers, data, and actionable recommendations
- Structure responses naturally with clear insights backed by real-time intelligence

${context ? 'STRATEGIC CONTEXT:\n' + context : ''}

Deliver institutional intelligence enhanced with comprehensive real-time market advantage.`;

        case 'research_intelligence':
            return `${baseIdentity}

🔬 RESEARCH INTELLIGENCE MODE - Live Analysis with Market Intelligence:
Execute analytical research enhanced with comprehensive real-time market data.

ENHANCED RESEARCH CAPABILITIES:
- Real-time market data synthesis with strategic frameworks
- Live economic indicator analysis with historical pattern comparison
- Current market anomaly detection with institutional interpretation
- Real-time sector rotation and institutional positioning analysis
- Live correlation analysis and diversification effectiveness assessment

RESEARCH APPROACH:
- Synthesize live market intelligence with analytical frameworks
- Provide research depth enhanced by real-time data validation
- Compare multiple live data sources with institutional interpretation
- Focus on actionable insights validated by current market conditions

Style: Analytical excellence enhanced by real-time market intelligence advantage.

Deliver research that leverages comprehensive live market intelligence for strategic advantage.`;

        case 'balanced_strategic':
        default:
            return `${baseIdentity}

ENHANCED BALANCED MODE - Intelligent & Natural with Live Market Awareness:
Provide helpful, naturally intelligent responses enhanced with live market intelligence.

- For simple questions: Be conversational with current market context
- For complex topics: Deploy deeper strategic analysis with live data integration
- For financial matters: Draw on institutional expertise enhanced with real-time intelligence
- Always maintain strategic intelligence while communicating naturally with live market awareness

Think "brilliant advisor with real-time market intelligence having a normal conversation."

You have access to live market data, Ray Dalio frameworks, anomaly detection, and current economic intelligence - use them naturally when relevant.`;
    }
}

/**
 * 🏛️ ENHANCED GPT STRATEGIC COMMANDER
 * Natural conversation with institutional authority and live data awareness
 */
async function executeEnhancedGptCommand(userMessage, chatId, conversationIntel, context) {
    try {
        console.log('🏛️ Executing Enhanced GPT Strategic Commander with live data awareness...');
        
        // Handle simple date/time queries directly
        if (conversationIntel.type === 'simple_datetime') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            const response = `Today is ${cambodiaTime.date} and the current time in Cambodia is ${cambodiaTime.timeShort} ${cambodiaTime.cambodiaTimezone}. ${cambodiaTime.isWeekend ? "It's the weekend!" : "Have a great day!"}`;
            
            return {
                response: response,
                commander: 'GPT Strategic Commander Alpha',
                emoji: '🏛️',
                style: conversationIntel.style,
                complexity: conversationIntel.complexity,
                capabilities: 'Current Date/Time + Natural Intelligence'
            };
        }
        
        const systemPrompt = createIntelligentSystemPrompt(conversationIntel, context);
        
        // Add current date/time context for non-casual conversations
        let enhancedMessage = userMessage;
        if (conversationIntel.type !== 'casual' && conversationIntel.type !== 'simple_datetime') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            enhancedMessage = `Current Date: ${cambodiaTime.date}, Time: ${cambodiaTime.timeShort} Cambodia\n\nUser Query: ${userMessage}`;
        }
        
        const response = await getGptReply(enhancedMessage, {
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
            capabilities: 'Institutional Analysis + Natural Intelligence + Live Data Awareness'
        };
        
    } catch (error) {
        console.error('❌ Enhanced GPT Commander error:', error.message);
        throw new Error(`Strategic Commander Alpha Error: ${error.message}`);
    }
}

/**
 * ⚡ ENHANCED CLAUDE INTELLIGENCE CHIEF WITH SPECIALIZED FUNCTIONS
 * Live intelligence with specialized routing to new functions
 */
async function executeEnhancedClaudeIntelligence(userMessage, chatId, conversationIntel, context) {
    try {
        console.log('⚡ Executing Enhanced Claude Intelligence Chief with specialized routing...');
        
        const claudeOptions = {
            context: context,
            maxTokens: conversationIntel.maxTokens,
            temperature: conversationIntel.temperature,
            mode: conversationIntel.type
        };
        
        // Add current date/time context for Claude
        const globalTime = getCurrentGlobalDateTime();
        const timeContext = `Current Global Time Context:
- Cambodia: ${globalTime.cambodia.date}, ${globalTime.cambodia.timeShort} ICT
- New York: ${globalTime.newYork.time} EST/EDT
- London: ${globalTime.london.time} GMT/BST
- Market Status: ${globalTime.cambodia.isWeekend ? 'Weekend' : 'Weekday'}

User Query: ${userMessage}`;
        
        let claudeResponse;
        
        // Enhanced routing to specialized Claude functions
        if (conversationIntel.specializedFunction) {
            console.log(`🎯 Using specialized function: ${conversationIntel.specializedFunction}`);
            
            switch (conversationIntel.specializedFunction) {
                case 'getClaudeRegimeAnalysis':
                    claudeResponse = await getClaudeRegimeAnalysis(timeContext, claudeOptions);
                    break;
                case 'getClaudeAnomalyAnalysis':
                    claudeResponse = await getClaudeAnomalyAnalysis(timeContext, claudeOptions);
                    break;
                case 'getClaudePortfolioOptimization':
                    claudeResponse = await getClaudePortfolioOptimization(timeContext, null, claudeOptions);
                    break;
                case 'getClaudeWithMarketData':
                    claudeResponse = await getClaudeWithMarketData(timeContext, claudeOptions);
                    break;
                case 'getClaudeCambodiaIntelligence':
                    claudeResponse = await getClaudeCambodiaIntelligence(timeContext, null, claudeOptions);
                    break;
                default:
                    claudeResponse = await getClaudeStrategicAnalysis(timeContext, claudeOptions);
            }
        } else {
            // Original routing logic with enhancements
            if (conversationIntel.type === 'research_intelligence') {
                claudeResponse = await getClaudeLiveResearch(timeContext, claudeOptions);
            } else if (userMessage.toLowerCase().includes('cambodia') || userMessage.toLowerCase().includes('lending')) {
                claudeResponse = await getClaudeCambodiaIntelligence(timeContext, null, claudeOptions);
            } else if (conversationIntel.complexity === 'maximum') {
                claudeResponse = await getClaudeComplexAnalysis(timeContext, [], claudeOptions);
            } else {
                claudeResponse = await getClaudeStrategicAnalysis(timeContext, claudeOptions);
            }
        }
        
        return {
            response: claudeResponse,
            commander: 'Claude Strategic Intelligence Chief',
            emoji: '⚡',
            style: conversationIntel.style,
            complexity: conversationIntel.complexity,
            capabilities: 'Live Intelligence + Research + Ray Dalio Framework + Specialized Analysis',
            specializedFunction: conversationIntel.specializedFunction || 'standard'
        };
        
    } catch (error) {
        console.error('❌ Enhanced Claude Intelligence error:', error.message);
        throw new Error(`Strategic Intelligence Chief Error: ${error.message}`);
    }
}

/**
 * 🎯 ENHANCED DUAL COMMAND EXECUTION ENGINE
 * Perfect fusion of institutional intelligence + natural conversation + live data
 */
async function executeEnhancedDualCommand(userMessage, chatId, messageType = 'text', hasMedia = false) {
    try {
        console.log('🎯 Executing Enhanced Dual Command - Strategic AI Warfare with Live Data Intelligence...');
        
        // Enhanced conversation intelligence analysis
        const conversationIntel = analyzeConversationIntelligence(userMessage, messageType, hasMedia);
        console.log('🧠 Enhanced Conversation Intelligence:', {
            type: conversationIntel.type,
            complexity: conversationIntel.complexity,
            primaryAI: conversationIntel.primaryAI,
            liveDataRequired: conversationIntel.liveDataRequired,
            specializedFunction: conversationIntel.specializedFunction
        });
        
        // Build strategic context (enhanced for complex queries)
        let context = null;
        if (conversationIntel.complexity !== 'minimal' && conversationIntel.type !== 'simple_datetime') {
            try {
                context = await buildStrategicCommanderContext(chatId, userMessage);
            } catch (contextError) {
                console.log('⚠️ Context building failed, continuing without:', contextError.message);
            }
        }
        
        let primaryResponse, secondaryResponse;
        
        // Execute primary AI command with enhanced capabilities
        if (conversationIntel.primaryAI === 'GPT_COMMANDER') {
            primaryResponse = await executeEnhancedGptCommand(userMessage, chatId, conversationIntel, context);
        } else {
            primaryResponse = await executeEnhancedClaudeIntelligence(userMessage, chatId, conversationIntel, context);
        }
        
        // Execute secondary AI if needed (for complex/urgent queries with synthesis requirement)
        if (conversationIntel.secondaryAI && conversationIntel.complexity !== 'minimal') {
            try {
                console.log('🔄 Executing secondary AI for enhanced dual intelligence synthesis...');
                
                // Create synthesis-focused conversation intel for secondary AI
                const secondaryIntel = {
                    ...conversationIntel,
                    type: 'synthesis',
                    style: 'strategic_synthesis',
                    maxTokens: Math.min(conversationIntel.maxTokens, 2000)
                };
                
                if (conversationIntel.secondaryAI === 'GPT_COMMANDER') {
                    secondaryResponse = await executeEnhancedGptCommand(userMessage, chatId, secondaryIntel, context);
                } else {
                    secondaryResponse = await executeEnhancedClaudeIntelligence(userMessage, chatId, secondaryIntel, context);
                }
            } catch (secondaryError) {
                console.log('⚠️ Secondary AI failed, continuing with primary:', secondaryError.message);
                secondaryResponse = null;
            }
        }
        
        // 🔥 ENHANCED RESPONSE FORMATTING WITH SPECIALIZED FUNCTION AWARENESS
        let finalResponse;
        
        if (conversationIntel.type === 'casual' || conversationIntel.type === 'simple_datetime') {
            // Casual/DateTime: Just the response, no headers
            finalResponse = primaryResponse.response;
            
        } else if (conversationIntel.specializedFunction && conversationIntel.type !== 'casual') {
            // Specialized function response with enhanced header
            const functionType = conversationIntel.specializedFunction.replace('getClaude', '').replace('Analysis', '').replace('Optimization', '');
            finalResponse = `${primaryResponse.emoji} **${functionType.toUpperCase()} INTELLIGENCE**
${primaryResponse.capabilities}

${primaryResponse.response}

⚡ *Enhanced with Ray Dalio Framework + Live Market Data*`;
            
        } else if (secondaryResponse && conversationIntel.complexity === 'maximum') {
            // Dual intelligence synthesis for maximum complexity
            finalResponse = `${primaryResponse.emoji} **${primaryResponse.commander.toUpperCase()}**
${primaryResponse.capabilities}

${primaryResponse.response}

---

${secondaryResponse.emoji} **${secondaryResponse.commander.toUpperCase()}**  
${secondaryResponse.capabilities}

${secondaryResponse.response}

---

🎯 **ENHANCED DUAL INTELLIGENCE SYNTHESIS**
Strategic AI Warfare with Live Market Intelligence - Institutional Grade Analysis Complete.`;
            
        } else {
            // 🚀 CLEAN SINGLE AI RESPONSE WITH LIVE DATA ENHANCEMENT
            finalResponse = primaryResponse.response;
        }
        
        return {
            response: finalResponse,
            conversationIntel: conversationIntel,
            primaryCommander: conversationIntel.primaryAI,
            secondaryCommander: conversationIntel.secondaryAI,
            complexity: conversationIntel.complexity,
            style: conversationIntel.style,
            liveDataEnhanced: conversationIntel.liveDataRequired,
            specializedFunction: conversationIntel.specializedFunction,
            success: true,
            naturalConversation: conversationIntel.type === 'casual' || conversationIntel.type === 'simple_datetime',
            enhancedFeatures: {
                liveDataIntegration: conversationIntel.liveDataRequired,
                rayDalioFramework: conversationIntel.specializedFunction === 'getClaudeRegimeAnalysis',
                anomalyDetection: conversationIntel.specializedFunction === 'getClaudeAnomalyAnalysis',
                portfolioOptimization: conversationIntel.specializedFunction === 'getClaudePortfolioOptimization',
                cambodiaEnhanced: conversationIntel.specializedFunction === 'getClaudeCambodiaIntelligence',
                dateTimeSupport: conversationIntel.type === 'simple_datetime'
            }
        };
        
    } catch (error) {
        console.error('❌ Enhanced Dual Command execution error:', error.message);
        
        // Enhanced intelligent fallback with system health check
        try {
            console.log('🔄 Falling back to GPT Strategic Commander with system health assessment...');
            
            // Quick system health check
            const healthStatus = await checkClaudeSystemHealth();
            console.log('📊 System Health:', healthStatus);
            
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

⚠️ **System Status:** Enhanced dual command temporarily degraded. Operating in single-commander resilience mode.
📊 **Health Check:** Claude: ${healthStatus.claudeConnection ? '✅' : '❌'} | Live Data: ${healthStatus.liveDataConnection ? '✅' : '❌'} | Ray Dalio: ${healthStatus.rayDalioFramework ? '✅' : '❌'}`,
                conversationIntel: fallbackIntel,
                primaryCommander: 'GPT_COMMANDER',
                secondaryCommander: null,
                success: false,
                error: error.message,
                resilientMode: true,
                systemHealth: healthStatus
            };
            
        } catch (fallbackError) {
            throw new Error(`Enhanced Dual Command System Failure: ${error.message}`);
        }
    }
}

/**
 * 📊 ENHANCED COMMAND ANALYTICS WITH LIVE DATA METRICS
 */
function getEnhancedCommandAnalytics() {
    return {
        enhancedMode: true,
        liveDataIntegration: true,
        rayDalioFramework: true,
        naturalConversation: true,
        adaptiveIntelligence: true,
        dateTimeSupport: true,
        conversationTypes: [
            'casual', 
            'simple_datetime',
            'quick_strategic', 
            'urgent_strategic', 
            'institutional_analysis', 
            'research_intelligence', 
            'multimodal',
            'economic_regime',
            'market_anomaly',
            'portfolio_optimization',
            'cambodia_intelligence'
        ],
        aiCommanders: {
            gpt: 'Strategic Commander Alpha - Institutional + Natural + Live Data + DateTime',
            claude: 'Strategic Intelligence Chief - Live + Research + Ray Dalio + Specialized Functions'
        },
        specializedFunctions: [
            'getClaudeRegimeAnalysis',
            'getClaudeAnomalyAnalysis', 
            'getClaudePortfolioOptimization',
            'getClaudeWithMarketData',
            'getClaudeCambodiaIntelligence'
        ],
        liveDataCapabilities: [
            'Ray Dalio Economic Regime Detection',
            'Real-time Market Anomaly Detection',
            'Live Yield Curve Analysis',
            'Credit Spread Monitoring',
            'Global Time Zone Awareness',
            'Cambodia Market Hours Detection',
            'Weekend/Weekday Intelligence',
            'Sector Rotation Analysis',
            'Portfolio Correlation Analysis'
        ],
        capabilities: [
            'Natural Conversation Flow',
            'Adaptive Response Complexity',
            'Intelligent Conversation Detection',
            'Dynamic System Prompts',
            'Institutional Authority with Human Touch',
            'Live Intelligence Integration',
            'Strategic AI Warfare with Freedom',
            'Ray Dalio All Weather Framework',
            'Real-time Anomaly Detection',
            'Live Portfolio Optimization',
            'Enhanced Cambodia Intelligence',
            'Specialized Function Routing',
            'Crisis Management with Live Data',
            'Economic Regime Awareness',
            'Global DateTime Intelligence'
        ],
        enhancedFeatures: [
            'Intelligent Live Data Fetching',
            'Specialized Claude Function Routing',
            'Ray Dalio Framework Integration',
            'Market Anomaly Detection & Analysis',
            'Live Portfolio Optimization',
            'Enhanced Cambodia Global Context',
            'Crisis Management Protocols',
            'System Health Monitoring',
            'Resilient Fallback Systems',
            'Global Time Zone Support',
            'Market Hours Awareness'
        ],
        lastUpdate: new Date().toISOString(),
        version: '3.1 - Live Data Enhanced + DateTime Support'
    };
}

/**
 * 🔧 ENHANCED SYSTEM HEALTH CHECK WITH SPECIALIZED FUNCTIONS
 */
async function checkEnhancedSystemHealth() {
    const health = {
        enhancedGptCommander: false,
        enhancedClaudeIntelligence: false,
        liveDataIntegration: false,
        rayDalioFramework: false,
        specializedFunctions: false,
        naturalConversation: false,
        dualIntelligence: false,
        dateTimeSupport: false,
        globalTimeSupport: false,
        errors: []
    };
    
    try {
        // Test Enhanced GPT Strategic Commander
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
        // Test Enhanced Claude Intelligence Chief
        const testIntel = { type: 'research_intelligence', maxTokens: 500, temperature: 0.6, style: 'analytical_thorough' };
        await executeEnhancedClaudeIntelligence('Current market trends', 'test', testIntel, null);
        health.enhancedClaudeIntelligence = true;
        console.log('✅ Enhanced Claude Intelligence Chief operational');
    } catch (claudeError) {
        health.errors.push(`Enhanced Claude Intelligence: ${claudeError.message}`);
        console.log('❌ Enhanced Claude Intelligence Chief unavailable');
    }
    
    try {
        // Test Live Data Integration
        const claudeHealthCheck = await checkClaudeSystemHealth();
        health.liveDataIntegration = claudeHealthCheck.liveDataConnection;
        health.rayDalioFramework = claudeHealthCheck.rayDalioFramework;
        console.log('✅ Live data integration tested');
    } catch (dataError) {
        health.errors.push(`Live Data Integration: ${dataError.message}`);
        console.log('❌ Live data integration unavailable');
    }
    
    try {
        // Test DateTime Support
        const cambodiaTime = getCurrentCambodiaDateTime();
        const globalTime = getCurrentGlobalDateTime();
        health.dateTimeSupport = cambodiaTime && cambodiaTime.date;
        health.globalTimeSupport = globalTime && globalTime.cambodia && globalTime.newYork;
        console.log('✅ DateTime support operational');
    } catch (timeError) {
        health.errors.push(`DateTime Support: ${timeError.message}`);
        console.log('❌ DateTime support unavailable');
    }
    
    try {
        // Test Specialized Functions
        const testIntel = { 
            type: 'economic_regime', 
            specializedFunction: 'getClaudeRegimeAnalysis',
            maxTokens: 500, 
            temperature: 0.6 
        };
        await executeEnhancedClaudeIntelligence('What is the current economic regime?', 'test', testIntel, null);
        health.specializedFunctions = true;
        console.log('✅ Specialized functions operational');
    } catch (specializedError) {
        health.errors.push(`Specialized Functions: ${specializedError.message}`);
        console.log('❌ Specialized functions unavailable');
    }
    
    health.dualIntelligence = health.enhancedGptCommander && health.enhancedClaudeIntelligence;
    health.overallHealth = health.dualIntelligence && health.liveDataIntegration;
    health.enhancedHealth = health.overallHealth && health.rayDalioFramework && health.specializedFunctions && health.dateTimeSupport;
    
    return health;
}

/**
 * 🎯 ENHANCED CONVERSATION INTELLIGENCE ROUTER
 * Advanced routing with specialized function awareness
 */
function routeConversationIntelligently(userMessage, messageType, hasMedia) {
    const intel = analyzeConversationIntelligence(userMessage, messageType, hasMedia);
    
    return {
        shouldUseDualAI: intel.secondaryAI !== null,
        primaryAI: intel.primaryAI,
        secondaryAI: intel.secondaryAI,
        responseStyle: intel.style,
        complexity: intel.complexity,
        liveDataRequired: intel.liveDataRequired,
        specializedFunction: intel.specializedFunction,
        reasoning: intel.reasoning,
        enhancedCapabilities: {
            regimeAnalysis: intel.specializedFunction === 'getClaudeRegimeAnalysis',
            anomalyDetection: intel.specializedFunction === 'getClaudeAnomalyAnalysis',
            portfolioOptimization: intel.specializedFunction === 'getClaudePortfolioOptimization',
            marketDataIntensive: intel.specializedFunction === 'getClaudeWithMarketData',
            cambodiaEnhanced: intel.specializedFunction === 'getClaudeCambodiaIntelligence',
            dateTimeQuery: intel.type === 'simple_datetime'
        }
    };
}

/**
 * 🚀 STRATEGIC FUNCTION DISPATCHER
 * Direct access to specialized Claude functions for advanced use cases
 */
async function dispatchSpecializedFunction(functionName, query, options = {}) {
    try {
        console.log(`🚀 Dispatching specialized function: ${functionName}`);
        
        // Add global time context to all specialized functions
        const globalTime = getCurrentGlobalDateTime();
        const timeEnhancedQuery = `Current Global Context: ${globalTime.cambodia.date}, ${globalTime.cambodia.timeShort} ICT | Market: ${globalTime.cambodia.isWeekend ? 'Weekend' : 'Weekday'}\n\n${query}`;
        
        switch (functionName) {
            case 'regime':
            case 'economic_regime':
                return await getClaudeRegimeAnalysis(timeEnhancedQuery, options);
            
            case 'anomaly':
            case 'market_anomaly':
                return await getClaudeAnomalyAnalysis(timeEnhancedQuery, options);
            
            case 'portfolio':
            case 'optimization':
                return await getClaudePortfolioOptimization(timeEnhancedQuery, null, options);
            
            case 'market_data':
            case 'live_data':
                return await getClaudeWithMarketData(timeEnhancedQuery, options);
            
            case 'cambodia':
                return await getClaudeCambodiaIntelligence(timeEnhancedQuery, null, options);
            
            case 'insights':
                return await getClaudeStrategicInsights(timeEnhancedQuery, options);
            
            default:
                throw new Error(`Unknown specialized function: ${functionName}`);
        }
        
    } catch (error) {
        console.error(`❌ Specialized function dispatch error (${functionName}):`, error.message);
        throw error;
    }
}

/**
 * 📈 MARKET INTELLIGENCE SUMMARY WITH DATETIME AWARENESS
 * Quick access to current market intelligence state
 */
async function getMarketIntelligenceSummary() {
    try {
        console.log('📈 Generating market intelligence summary...');
        
        const globalTime = getCurrentGlobalDateTime();
        const query = `Current Market Intelligence Summary Request:
- Current Time: ${globalTime.cambodia.date}, ${globalTime.cambodia.timeShort} ICT
- NY Market: ${globalTime.newYork.time}
- London Market: ${globalTime.london.time}
- Market Status: ${globalTime.cambodia.isWeekend ? 'Weekend' : 'Weekday'}

Provide a concise summary of current market conditions, economic regime, and key risks/opportunities for strategic positioning.`;
        
        const summary = await getClaudeWithMarketData(query, {
            maxTokens: 1000,
            temperature: 0.6
        });
        
        return {
            summary: summary,
            timestamp: new Date().toISOString(),
            marketHours: {
                cambodia: globalTime.cambodia,
                newYork: globalTime.newYork,
                london: globalTime.london
            },
            source: 'Enhanced Dual Command System with Live Market Intelligence + DateTime'
        };
        
    } catch (error) {
        console.error('❌ Market intelligence summary error:', error.message);
        return {
            summary: 'Market intelligence summary temporarily unavailable',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 🌍 GLOBAL MARKET STATUS CHECKER
 * Real-time global market hours and status
 */
function getGlobalMarketStatus() {
    try {
        const globalTime = getCurrentGlobalDateTime();
        
        return {
            currentStatus: {
                cambodia: {
                    time: globalTime.cambodia.timeShort,
                    isBusinessHours: !globalTime.cambodia.isWeekend && 
                                   globalTime.cambodia.hour >= 8 && 
                                   globalTime.cambodia.hour <= 17,
                    isWeekend: globalTime.cambodia.isWeekend
                },
                newYork: {
                    time: globalTime.newYork.time,
                    isMarketHours: !globalTime.cambodia.isWeekend && 
                                 globalTime.newYork.hour >= 9 && 
                                 globalTime.newYork.hour <= 16
                },
                london: {
                    time: globalTime.london.time,
                    isMarketHours: !globalTime.cambodia.isWeekend && 
                                 globalTime.london.hour >= 8 && 
                                 globalTime.london.hour <= 16
                }
            },
            summary: globalTime.cambodia.isWeekend ? 
                    'Weekend - Markets Closed' : 
                    'Weekday - Check individual market hours',
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Global market status error:', error.message);
        return {
            error: 'Global market status temporarily unavailable',
            lastUpdated: new Date().toISOString()
        };
    }
}

module.exports = {
    // 🎯 ENHANCED DUAL COMMAND CORE
    executeEnhancedDualCommand,
    analyzeConversationIntelligence,
    routeConversationIntelligently,
    
    // 🧠 ENHANCED INTELLIGENT EXECUTION  
    executeEnhancedGptCommand,
    executeEnhancedClaudeIntelligence,
    createIntelligentSystemPrompt,
    
    // 🚀 SPECIALIZED FUNCTION ACCESS
    dispatchSpecializedFunction,
    getMarketIntelligenceSummary,
    getGlobalMarketStatus,
    
    // 🌍 DATETIME UTILITIES
    getCurrentCambodiaDateTime,
    getCurrentGlobalDateTime,
    
    // 🔧 ENHANCED SYSTEM MANAGEMENT
    checkEnhancedSystemHealth,
    getEnhancedCommandAnalytics,
    
    // 📊 ENHANCED CONFIGURATION
    ENHANCED_COMMAND_CONFIG,
    
    // 🔄 LEGACY COMPATIBILITY (redirect to enhanced versions)
    executeDualCommand: executeEnhancedDualCommand,
    routeStrategicCommand: routeConversationIntelligently,
    executeGptCommand: executeEnhancedGptCommand,
    executeClaudeIntelligence: executeEnhancedClaudeIntelligence,
    checkDualCommandHealth: checkEnhancedSystemHealth,
    getDualCommandAnalytics: getEnhancedCommandAnalytics
};
