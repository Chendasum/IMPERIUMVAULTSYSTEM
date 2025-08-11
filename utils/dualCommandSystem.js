// utils/dualCommandSystem.js - Clean Dual AI System with Natural Responses
// Smart routing between gpt-5 and Claude Opus 4.1 with live data integration

const { getGptAnalysis, getMarketAnalysis, getCambodiaAnalysis } = require('./openaiClient');
const { 
    getClaudeAnalysis,
    getStrategicAnalysis,
    getRegimeAnalysis,
    getPortfolioAnalysis,
    getCambodiaAnalysis: getClaudeCambodiaAnalysis,
    getAnomalyAnalysis
} = require('./claudeClient');
const { buildConversationContext } = require('./memory');

// 🌍 DATETIME UTILITIES
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
            hour: hour,
            minute: minute,
            dayName: dayName,
            isWeekend: isWeekend,
            timezone: 'ICT (UTC+7)',
            timestamp: cambodiaTime.toISOString()
        };
    } catch (error) {
        console.error('❌ Cambodia DateTime error:', error.message);
        return {
            date: new Date().toDateString(),
            time: new Date().toTimeString().slice(0, 5),
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

// 🧠 SMART QUERY ANALYSIS
function analyzeQuery(userMessage, messageType = 'text', hasMedia = false) {
    const message = userMessage.toLowerCase();
    
    // Simple date/time queries
    const dateTimePatterns = [
        /^(what time|what's the time|current time|time now)/i,
        /^(what date|what's the date|today's date|date today)/i,
        /^(what day|what's today|today is)/i,
        /^(time in cambodia|cambodia time)/i
    ];
    
    // Casual conversation
    const casualPatterns = [
        /^(hello|hi|hey|good morning|good afternoon|what's up)$/i,
        /^how are you\??$/i,
        /^(thanks|thank you|cool|nice|great)$/i,
        /^(ok|okay|got it|understood)$/i
    ];
    
    // Economic regime queries (best for Claude)
    const regimePatterns = [
        /(economic regime|market regime|regime analysis)/i,
        /(growth.*inflation|inflation.*growth)/i,
        /(all weather|ray dalio|bridgewater)/i,
        /(recession|expansion|stagflation)/i
    ];
    
    // Market anomaly/crisis (best for Claude)
    const anomalyPatterns = [
        /(anomaly|anomalies|market stress|crisis)/i,
        /(bubble|crash|panic|volatility spike)/i,
        /(yield.*invert|curve.*invert)/i,
        /(credit.*spread|spread.*widen)/i
    ];
    
    // Portfolio analysis (best for Claude)
    const portfolioPatterns = [
        /(portfolio.*optim|allocation.*optim)/i,
        /(rebalanc|diversif|correlation)/i,
        /(risk.*adjust|hedge|position.*siz)/i,
        /(asset.*allocation)/i
    ];
    
    // Cambodia specific (can use either, but Claude has better context integration)
    const cambodiaPatterns = [
        /(cambodia|khmer|phnom penh|cambodian)/i,
        /(lending.*cambodia|cambodia.*lending)/i,
        /(usd.*khr|khr.*usd)/i
    ];
    
    // Market analysis (good for either)
    const marketPatterns = [
        /(market|stock|bond|crypto|forex)/i,
        /(trading|investment|buy|sell)/i,
        /(price|rate|yield|return)/i,
        /(analysis|forecast|outlook)/i
    ];
    
    // Complex strategic (good for either, but prefer GPT for synthesis)
    const complexPatterns = [
        /(strategy|strategic|comprehensive)/i,
        /(detailed|thorough|in-depth)/i,
        /(compare|comparison|versus)/i,
        /(research|evaluate|assess)/i
    ];
    
    // Determine optimal AI and response type
    if (hasMedia || messageType !== 'text') {
        return {
            type: 'multimodal',
            bestAI: 'gpt',
            reason: 'gpt-5 has vision capabilities',
            complexity: 'medium',
            maxTokens: 2000,
            needsLiveData: false
        };
    }
    
    if (dateTimePatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'datetime',
            bestAI: 'gpt',
            reason: 'Simple query, quick response',
            complexity: 'low',
            maxTokens: 200,
            needsLiveData: false
        };
    }
    
    if (casualPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'casual',
            bestAI: 'gpt',
            reason: 'Casual conversation, natural response',
            complexity: 'low',
            maxTokens: 300,
            needsLiveData: false
        };
    }
    
    if (regimePatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'regime',
            bestAI: 'claude',
            reason: 'Economic regime analysis, Ray Dalio framework',
            complexity: 'high',
            maxTokens: 2500,
            needsLiveData: true,
            specialFunction: 'regime'
        };
    }
    
    if (anomalyPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'anomaly',
            bestAI: 'claude',
            reason: 'Market anomaly detection and analysis',
            complexity: 'high',
            maxTokens: 2000,
            needsLiveData: true,
            specialFunction: 'anomaly'
        };
    }
    
    if (portfolioPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'portfolio',
            bestAI: 'claude',
            reason: 'Portfolio optimization with live data',
            complexity: 'high',
            maxTokens: 2500,
            needsLiveData: true,
            specialFunction: 'portfolio'
        };
    }
    
    if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'cambodia',
            bestAI: 'claude',
            reason: 'Cambodia expertise with global context',
            complexity: 'medium',
            maxTokens: 2000,
            needsLiveData: true,
            specialFunction: 'cambodia'
        };
    }
    
    if (marketPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'market',
            bestAI: 'gpt',
            reason: 'Market analysis with current data',
            complexity: 'medium',
            maxTokens: 1500,
            needsLiveData: true
        };
    }
    
    if (complexPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'complex',
            bestAI: 'both',
            reason: 'Complex analysis benefits from dual perspectives',
            complexity: 'high',
            maxTokens: 3000,
            needsLiveData: true
        };
    }
    
    // Default: balanced analysis
    return {
        type: 'general',
        bestAI: 'gpt',
        reason: 'General query, GPT for natural conversation',
        complexity: 'medium',
        maxTokens: 1200,
        needsLiveData: false
    };
}

// 🎯 EXECUTE gpt-5 ANALYSIS
async function executeGptAnalysis(userMessage, queryAnalysis, context = null) {
    try {
        console.log('🔍 Executing gpt-5 analysis...');
        
        // Handle simple date/time queries directly
        if (queryAnalysis.type === 'datetime') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            return `Today is ${cambodiaTime.date} and it's currently ${cambodiaTime.time} in Cambodia (${cambodiaTime.timezone}). ${cambodiaTime.isWeekend ? "Enjoy your weekend!" : "Have a great day!"}`;
        }
        
        // Add time context for non-casual queries
        let enhancedMessage = userMessage;
        if (queryAnalysis.type !== 'casual' && queryAnalysis.type !== 'datetime') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            enhancedMessage = `Current time: ${cambodiaTime.date}, ${cambodiaTime.time} Cambodia\n\n${userMessage}`;
        }
        
        // Route to appropriate GPT function
        if (queryAnalysis.type === 'market') {
            return await getMarketAnalysis(enhancedMessage, null, {
                maxTokens: queryAnalysis.maxTokens,
                context: context
            });
        } else if (queryAnalysis.type === 'cambodia') {
            return await getCambodiaAnalysis(enhancedMessage, null, {
                maxTokens: queryAnalysis.maxTokens,
                context: context
            });
        } else {
            return await getGptAnalysis(enhancedMessage, {
                maxTokens: queryAnalysis.maxTokens,
                context: context
            });
        }
        
    } catch (error) {
        console.error('❌ GPT analysis error:', error.message);
        throw error;
    }
}

// ⚡ EXECUTE CLAUDE ANALYSIS
async function executeClaudeAnalysis(userMessage, queryAnalysis, context = null) {
    try {
        console.log('⚡ Executing Claude analysis...');
        
        // Add global time context
        const globalTime = getCurrentGlobalDateTime();
        const timeContext = `Current global time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia | NY: ${globalTime.newYork.time} | London: ${globalTime.london.time} | Market status: ${globalTime.cambodia.isWeekend ? 'Weekend' : 'Weekday'}\n\n${userMessage}`;
        
        const options = {
            maxTokens: queryAnalysis.maxTokens,
            context: context
        };
        
        // Route to specialized Claude functions
        if (queryAnalysis.specialFunction) {
            switch (queryAnalysis.specialFunction) {
                case 'regime':
                    return await getRegimeAnalysis(timeContext, options);
                case 'anomaly':
                    return await getAnomalyAnalysis(timeContext, options);
                case 'portfolio':
                    return await getPortfolioAnalysis(timeContext, null, options);
                case 'cambodia':
                    return await getClaudeCambodiaAnalysis(timeContext, null, options);
                default:
                    return await getStrategicAnalysis(timeContext, options);
            }
        } else {
            // Standard Claude analysis
            if (queryAnalysis.complexity === 'high') {
                return await getStrategicAnalysis(timeContext, options);
            } else {
                return await getClaudeAnalysis(timeContext, options);
            }
        }
        
    } catch (error) {
        console.error('❌ Claude analysis error:', error.message);
        throw error;
    }
}

// 🎯 MAIN DUAL COMMAND EXECUTION
async function executeDualCommand(userMessage, chatId, messageType = 'text', hasMedia = false) {
    try {
        console.log('🎯 Executing dual command analysis...');
        
        // Analyze the query to determine optimal routing
        const queryAnalysis = analyzeQuery(userMessage, messageType, hasMedia);
        console.log('🧠 Query analysis:', {
            type: queryAnalysis.type,
            bestAI: queryAnalysis.bestAI,
            complexity: queryAnalysis.complexity,
            reason: queryAnalysis.reason
        });
        
        // Build context for complex queries
        let context = null;
        if (queryAnalysis.complexity !== 'low') {
            try {
                context = await buildConversationContext(chatId);
            } catch (contextError) {
                console.log('⚠️ Context building failed, continuing without:', contextError.message);
            }
        }
        
        let response;
        
        if (queryAnalysis.bestAI === 'both') {
            // Use both AIs for complex analysis
            console.log('🔄 Using both AIs for comprehensive analysis...');
            
            const [gptResponse, claudeResponse] = await Promise.allSettled([
                executeGptAnalysis(userMessage, queryAnalysis, context),
                executeClaudeAnalysis(userMessage, queryAnalysis, context)
            ]);
            
            let finalResponse = '';
            
            if (gptResponse.status === 'fulfilled') {
                finalResponse += `**gpt-5 Analysis:**\n${gptResponse.value}\n\n`;
            }
            
            if (claudeResponse.status === 'fulfilled') {
                finalResponse += `**Claude Opus 4.1 Analysis:**\n${claudeResponse.value}`;
            }
            
            if (!finalResponse) {
                throw new Error('Both AI analyses failed');
            }
            
            response = finalResponse;
            
        } else {
            // Use single AI
            if (queryAnalysis.bestAI === 'claude') {
                response = await executeClaudeAnalysis(userMessage, queryAnalysis, context);
            } else {
                response = await executeGptAnalysis(userMessage, queryAnalysis, context);
            }
        }
        
        return {
            response: response,
            aiUsed: queryAnalysis.bestAI,
            queryType: queryAnalysis.type,
            complexity: queryAnalysis.complexity,
            reasoning: queryAnalysis.reason,
            specialFunction: queryAnalysis.specialFunction,
            liveDataUsed: queryAnalysis.needsLiveData,
            success: true
        };
        
    } catch (error) {
        console.error('❌ Dual command execution error:', error.message);
        
        // Fallback to gpt-5
        try {
            console.log('🔄 Falling back to gpt-5...');
            
            const fallbackAnalysis = {
                type: 'fallback',
                maxTokens: 1200,
                needsLiveData: false
            };
            
            const fallbackResponse = await executeGptAnalysis(userMessage, fallbackAnalysis);
            
            return {
                response: `${fallbackResponse}\n\n*Note: Using fallback mode due to system issue.*`,
                aiUsed: 'gpt',
                queryType: 'fallback',
                complexity: 'medium',
                reasoning: 'Fallback after system error',
                success: false,
                error: error.message
            };
            
        } catch (fallbackError) {
            throw new Error(`Dual command system failure: ${error.message}`);
        }
    }
}

// 📊 SYSTEM HEALTH CHECK
async function checkSystemHealth() {
    const health = {
        gptAnalysis: false,
        claudeAnalysis: false,
        contextBuilding: false,
        dateTimeSupport: false,
        dualMode: false,
        errors: []
    };
    
    try {
        // Test gpt-5
        await executeGptAnalysis('Hello', { type: 'casual', maxTokens: 100 });
        health.gptAnalysis = true;
        console.log('✅ gpt-5 analysis operational');
    } catch (error) {
        health.errors.push(`GPT: ${error.message}`);
        console.log('❌ gpt-5 analysis unavailable');
    }
    
    try {
        // Test Claude
        await executeClaudeAnalysis('Test', { type: 'general', maxTokens: 100 });
        health.claudeAnalysis = true;
        console.log('✅ Claude analysis operational');
    } catch (error) {
        health.errors.push(`Claude: ${error.message}`);
        console.log('❌ Claude analysis unavailable');
    }
    
    try {
        // Test datetime
        const cambodiaTime = getCurrentCambodiaDateTime();
        health.dateTimeSupport = cambodiaTime && cambodiaTime.date;
        console.log('✅ DateTime support operational');
    } catch (error) {
        health.errors.push(`DateTime: ${error.message}`);
        console.log('❌ DateTime support unavailable');
    }
    
    try {
        // Test context building
        await buildStrategicCommanderContext('test', 'test query');
        health.contextBuilding = true;
        console.log('✅ Context building operational');
    } catch (error) {
        health.errors.push(`Context: ${error.message}`);
        console.log('❌ Context building unavailable');
    }
    
    health.dualMode = health.gptAnalysis && health.claudeAnalysis;
    health.overallHealth = health.gptAnalysis || health.claudeAnalysis; // At least one AI working
    
    return health;
}

// 🚀 QUICK ACCESS FUNCTIONS
async function getMarketIntelligence() {
    const globalTime = getCurrentGlobalDateTime();
    const query = `Current market intelligence summary - Time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia. Provide concise overview of market conditions, key risks, and opportunities.`;
    
    try {
        return await executeClaudeAnalysis(query, {
            type: 'market',
            maxTokens: 1000,
            needsLiveData: true,
            specialFunction: 'regime'
        });
    } catch (error) {
        console.error('❌ Market intelligence error:', error.message);
        return 'Market intelligence temporarily unavailable';
    }
}

function getGlobalMarketStatus() {
    try {
        const globalTime = getCurrentGlobalDateTime();
        
        return {
            cambodia: {
                time: globalTime.cambodia.time,
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
            },
            summary: globalTime.cambodia.isWeekend ? 
                    'Weekend - Markets Closed' : 
                    'Weekday - Check individual market hours',
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Global market status error:', error.message);
        return { error: 'Global market status unavailable' };
    }
}

// 📈 SYSTEM ANALYTICS
function getSystemAnalytics() {
    return {
        version: '2.0 - Clean Natural Responses',
        aiModels: {
            gpt: 'gpt-5 (multimodal, natural conversation)',
            claude: 'Claude Opus 4.1 (advanced reasoning, live data)'
        },
        capabilities: [
            'Smart query routing',
            'Natural AI responses',
            'Live market data integration',
            'Global timezone support',
            'Economic regime analysis',
            'Portfolio optimization',
            'Market anomaly detection',
            'Cambodia market expertise',
            'Dual AI synthesis for complex queries'
        ],
        queryTypes: [
            'casual', 'datetime', 'market', 'regime', 'anomaly', 
            'portfolio', 'cambodia', 'complex', 'multimodal'
        ],
        specialFunctions: [
            'regime analysis', 'anomaly detection', 'portfolio optimization', 'cambodia analysis'
        ],
        healthCheck: 'Use checkSystemHealth() for current status'
    };
}

module.exports = {
    // Main functions
    executeDualCommand,
    analyzeQuery,
    executeGptAnalysis,
    executeClaudeAnalysis,
    
    // Utility functions
    getCurrentCambodiaDateTime,
    getCurrentGlobalDateTime,
    getMarketIntelligence,
    getGlobalMarketStatus,
    
    // System management
    checkSystemHealth,
    getSystemAnalytics,
    
    // Legacy compatibility
    executeEnhancedDualCommand: executeDualCommand,
    routeConversationIntelligently: analyzeQuery,
    getEnhancedCommandAnalytics: getSystemAnalytics,
    checkEnhancedSystemHealth: checkSystemHealth
};
