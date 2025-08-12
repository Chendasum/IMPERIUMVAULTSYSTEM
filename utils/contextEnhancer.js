// utils/contextEnhancer.js - Enhanced Context System with Memory Integration
// Advanced context building and query enhancement for dual AI system

const { getGptAnalysis, getMarketAnalysis, getCambodiaAnalysis } = require('./openaiClient');
const { 
    getClaudeAnalysis,
    getStrategicAnalysis,
    getRegimeAnalysis,
    getPortfolioAnalysis,
    getCambodiaAnalysis: getClaudeCambodiaAnalysis,
    getAnomalyAnalysis
} = require('./claudeClient');

// Enhanced memory and database integration
const { buildConversationContext } = require('./memory');
const { getConversationHistoryDB, getPersistentMemoryDB } = require('./database');

// 🧠 ENHANCED STRATEGIC CONTEXT BUILDER
async function buildStrategicCommanderContext(chatId, userMessage) {
    try {
        console.log(`🏗️ Building strategic context for ${chatId}...`);
        
        // Try enhanced memory building first
        const enhancedContext = await buildConversationContext(chatId);
        
        if (enhancedContext && enhancedContext.length > 100) {
            console.log(`✅ Enhanced context built: ${enhancedContext.length} chars`);
            return enhancedContext;
        }
        
        throw new Error('Enhanced context too short, using fallback');
        
    } catch (error) {
        console.log('⚠️ Enhanced context building failed, using fallback:', error.message);
        
        // Comprehensive fallback context building
        try {
            const [recentHistory, persistentMemory, userProfile] = await Promise.allSettled([
                getConversationHistoryDB(chatId, 8),
                getPersistentMemoryDB(chatId),
                getUserProfileData(chatId)
            ]);
            
            let fallbackContext = '';
            
            // Add user profile context
            if (userProfile.status === 'fulfilled' && userProfile.value) {
                fallbackContext += `\n\n👤 USER PROFILE:\n`;
                fallbackContext += `• Conversations: ${userProfile.value.conversation_count || 0}\n`;
                fallbackContext += `• Member since: ${new Date(userProfile.value.first_seen || Date.now()).toLocaleDateString()}\n`;
                
                if (userProfile.value.preferences) {
                    fallbackContext += `• Preferences: ${JSON.stringify(userProfile.value.preferences)}\n`;
                }
            }
            
            // Add conversation history context
            if (recentHistory.status === 'fulfilled' && recentHistory.value.length > 0) {
                fallbackContext += `\n\n📝 RECENT CONVERSATIONS (${recentHistory.value.length}):\n`;
                recentHistory.value.forEach((conv, index) => {
                    const userMsg = conv.user_message?.substring(0, 80) || '';
                    const aiMsg = conv.gpt_response?.substring(0, 80) || '';
                    const timestamp = new Date(conv.timestamp || Date.now()).toLocaleDateString();
                    
                    fallbackContext += `${index + 1}. [${timestamp}] User: "${userMsg}"\n`;
                    fallbackContext += `   AI: "${aiMsg}"\n`;
                });
            }
            
            // Add persistent memory context
            if (persistentMemory.status === 'fulfilled' && persistentMemory.value.length > 0) {
                fallbackContext += `\n\n🧠 PERSISTENT MEMORY (${persistentMemory.value.length}):\n`;
                persistentMemory.value.slice(0, 8).forEach((memory, index) => {
                    const fact = memory.fact || memory;
                    const importance = memory.importance || 'medium';
                    const timestamp = new Date(memory.created_at || Date.now()).toLocaleDateString();
                    
                    const importanceEmoji = {
                        'critical': '🔴',
                        'high': '🟡', 
                        'medium': '🟢',
                        'low': '⚪'
                    }[importance] || '🟢';
                    
                    fallbackContext += `• ${importanceEmoji} ${fact.substring(0, 120)} (${timestamp})\n`;
                });
            }
            
            // Add current context hint
            if (userMessage && userMessage.length > 0) {
                fallbackContext += `\n\n💬 CURRENT QUERY CONTEXT:\n`;
                fallbackContext += `• Query type: ${analyzeQueryType(userMessage)}\n`;
                fallbackContext += `• Complexity: ${analyzeQueryComplexity(userMessage)}\n`;
                fallbackContext += `• Memory relevant: ${isMemoryRelevant(userMessage)}\n`;
            }
            
            // Add strategic instructions
            fallbackContext += `\n\n🎯 STRATEGIC INSTRUCTIONS:\n`;
            fallbackContext += `• Use persistent memory facts when relevant\n`;
            fallbackContext += `• Reference conversation history for continuity\n`;
            fallbackContext += `• Maintain institutional-grade analysis\n`;
            fallbackContext += `• Extract new facts for future memory\n`;
            
            console.log(`✅ Fallback context built: ${fallbackContext.length} chars`);
            return fallbackContext;
            
        } catch (fallbackError) {
            console.error('❌ Fallback context building failed:', fallbackError.message);
            
            // Emergency minimal context
            return `\n\n🚨 MINIMAL CONTEXT MODE:\n` +
                   `• User ID: ${chatId}\n` +
                   `• Session: ${new Date().toISOString()}\n` +
                   `• Query: "${userMessage?.substring(0, 100) || 'Unknown'}"\n` +
                   `• Memory: Limited due to system issues\n`;
        }
    }
}

// 🔍 ADVANCED QUERY ANALYSIS
function analyzeQueryType(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (/remember|recall|you mentioned|we discussed|before|previously|last time/i.test(message)) {
        return 'memory_query';
    }
    if /(cambodia|khmer|phnom penh|cambodian)/i.test(message)) {
        return 'cambodia_specific';
    }
    if /(regime|dalio|bridgewater|economic)/i.test(message)) {
        return 'regime_analysis';
    }
    if /(portfolio|allocation|risk|hedge)/i.test(message)) {
        return 'portfolio_analysis';
    }
    if /(market|trading|investment|stock)/i.test(message)) {
        return 'market_analysis';
    }
    if /(strategy|strategic|comprehensive)/i.test(message)) {
        return 'strategic_analysis';
    }
    if (/^(hello|hi|hey|how are you)/i.test(message)) {
        return 'casual_conversation';
    }
    if (/^(what time|what date|today)/i.test(message)) {
        return 'datetime_query';
    }
    
    return 'general_query';
}

function analyzeQueryComplexity(userMessage) {
    const message = userMessage.toLowerCase();
    const wordCount = userMessage.split(/\s+/).length;
    
    if (wordCount < 5) return 'simple';
    if (wordCount < 15) return 'moderate';
    if (wordCount < 30) return 'complex';
    return 'comprehensive';
}

function isMemoryRelevant(userMessage) {
    const memoryPatterns = [
        /remember|recall|you mentioned|we discussed/i,
        /my name|my preference|i told you|i said/i,
        /before|previously|last time|earlier/i,
        /you know|as we discussed|like i mentioned/i
    ];
    
    return memoryPatterns.some(pattern => pattern.test(userMessage));
}

// 🌍 ENHANCED DATETIME UTILITIES
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
            timestamp: cambodiaTime.toISOString(),
            marketStatus: isWeekend ? 'Weekend' : 'Weekday',
            businessHours: !isWeekend && hour >= 8 && hour <= 17
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
        const tokyoTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
        
        return {
            cambodia: {
                ...getCurrentCambodiaDateTime(),
                timezone: 'ICT (UTC+7)'
            },
            newYork: {
                time: `${newYorkTime.getHours()}:${newYorkTime.getMinutes().toString().padStart(2, '0')}`,
                hour: newYorkTime.getHours(),
                timezone: 'EST/EDT (UTC-5/-4)',
                isMarketHours: !cambodiaTime.getDay() % 6 === 0 && 
                              newYorkTime.getHours() >= 9 && 
                              newYorkTime.getHours() <= 16
            },
            london: {
                time: `${londonTime.getHours()}:${londonTime.getMinutes().toString().padStart(2, '0')}`,
                hour: londonTime.getHours(),
                timezone: 'GMT/BST (UTC+0/+1)',
                isMarketHours: !cambodiaTime.getDay() % 6 === 0 && 
                              londonTime.getHours() >= 8 && 
                              londonTime.getHours() <= 16
            },
            tokyo: {
                time: `${tokyoTime.getHours()}:${tokyoTime.getMinutes().toString().padStart(2, '0')}`,
                hour: tokyoTime.getHours(),
                timezone: 'JST (UTC+9)',
                isMarketHours: !cambodiaTime.getDay() % 6 === 0 && 
                              tokyoTime.getHours() >= 9 && 
                              tokyoTime.getHours() <= 15
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

// 🧠 ENHANCED QUERY ANALYSIS WITH MEMORY AWARENESS
function analyzeQuery(userMessage, messageType = 'text', hasMedia = false, memoryContext = null) {
    const message = userMessage.toLowerCase();
    const hasMemoryContext = memoryContext && memoryContext.length > 100;
    const isMemoryQuery = isMemoryRelevant(userMessage);
    
    // Enhanced patterns with memory integration
    const memoryPatterns = [
        /remember|recall|you mentioned|we discussed|before|previously|last time/i,
        /my name|my preference|i told you|i said|you know/i,
        /as we discussed|like i mentioned|you said|we talked about/i
    ];
    
    const dateTimePatterns = [
        /^(what time|what's the time|current time|time now)/i,
        /^(what date|what's the date|today's date|date today)/i,
        /^(what day|what's today|today is)/i,
        /^(time in cambodia|cambodia time)/i
    ];
    
    const casualPatterns = [
        /^(hello|hi|hey|good morning|good afternoon|what's up)$/i,
        /^how are you\??$/i,
        /^(thanks|thank you|cool|nice|great)$/i,
        /^(ok|okay|got it|understood)$/i
    ];
    
    const regimePatterns = [
        /(economic regime|market regime|regime analysis)/i,
        /(growth.*inflation|inflation.*growth)/i,
        /(all weather|ray dalio|bridgewater)/i,
        /(recession|expansion|stagflation)/i
    ];
    
    const anomalyPatterns = [
        /(anomaly|anomalies|market stress|crisis)/i,
        /(bubble|crash|panic|volatility spike)/i,
        /(yield.*invert|curve.*invert)/i,
        /(credit.*spread|spread.*widen)/i
    ];
    
    const portfolioPatterns = [
        /(portfolio.*optim|allocation.*optim)/i,
        /(rebalanc|diversif|correlation)/i,
        /(risk.*adjust|hedge|position.*siz)/i,
        /(asset.*allocation)/i
    ];
    
    const cambodiaPatterns = [
        /(cambodia|khmer|phnom penh|cambodian)/i,
        /(lending.*cambodia|cambodia.*lending)/i,
        /(usd.*khr|khr.*usd)/i
    ];
    
    const marketPatterns = [
        /(market|stock|bond|crypto|forex)/i,
        /(trading|investment|buy|sell)/i,
        /(price|rate|yield|return)/i,
        /(analysis|forecast|outlook)/i
    ];
    
    const complexPatterns = [
        /(strategy|strategic|comprehensive)/i,
        /(detailed|thorough|in-depth)/i,
        /(compare|comparison|versus)/i,
        /(research|evaluate|assess)/i
    ];
    
    // Determine optimal AI and response type with memory consideration
    if (hasMedia || messageType !== 'text') {
        return {
            type: 'multimodal',
            bestAI: 'gpt',
            reason: 'gpt-5 has superior vision capabilities',
            complexity: 'medium',
            maxTokens: 2000,
            needsLiveData: false,
            memoryImportant: false,
            memoryQuery: false
        };
    }
    
    // Memory-specific queries
    if (memoryPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'memory_query',
            bestAI: hasMemoryContext ? 'gpt' : 'claude',
            reason: 'Memory query - use AI with better context integration',
            complexity: 'medium',
            maxTokens: 1500,
            needsLiveData: false,
            memoryImportant: true,
            memoryQuery: true
        };
    }
    
    if (dateTimePatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'datetime',
            bestAI: 'gpt',
            reason: 'Simple datetime query, quick GPT response',
            complexity: 'low',
            maxTokens: 200,
            needsLiveData: false,
            memoryImportant: false,
            memoryQuery: false
        };
    }
    
    if (casualPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'casual',
            bestAI: 'gpt',
            reason: 'Casual conversation with memory awareness',
            complexity: 'low',
            maxTokens: 400,
            needsLiveData: false,
            memoryImportant: isMemoryQuery || hasMemoryContext,
            memoryQuery: isMemoryQuery
        };
    }
    
    if (regimePatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'regime',
            bestAI: 'claude',
            reason: 'Economic regime analysis with historical context',
            complexity: 'high',
            maxTokens: 2500,
            needsLiveData: true,
            specialFunction: 'regime',
            memoryImportant: true,
            memoryQuery: isMemoryQuery
        };
    }
    
    if (anomalyPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'anomaly',
            bestAI: 'claude',
            reason: 'Market anomaly detection with memory context',
            complexity: 'high',
            maxTokens: 2000,
            needsLiveData: true,
            specialFunction: 'anomaly',
            memoryImportant: true,
            memoryQuery: isMemoryQuery
        };
    }
    
    if (portfolioPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'portfolio',
            bestAI: 'claude',
            reason: 'Portfolio optimization with persistent memory',
            complexity: 'high',
            maxTokens: 2500,
            needsLiveData: true,
            specialFunction: 'portfolio',
            memoryImportant: true,
            memoryQuery: isMemoryQuery
        };
    }
    
    if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'cambodia',
            bestAI: 'claude',
            reason: 'Cambodia expertise with historical knowledge',
            complexity: 'medium',
            maxTokens: 2000,
            needsLiveData: true,
            specialFunction: 'cambodia',
            memoryImportant: true,
            memoryQuery: isMemoryQuery
        };
    }
    
    if (marketPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'market',
            bestAI: 'gpt',
            reason: 'Market analysis with memory context',
            complexity: 'medium',
            maxTokens: 1500,
            needsLiveData: true,
            memoryImportant: isMemoryQuery || hasMemoryContext,
            memoryQuery: isMemoryQuery
        };
    }
    
    if (complexPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'complex',
            bestAI: 'both',
            reason: 'Complex analysis benefits from dual AI with memory',
            complexity: 'high',
            maxTokens: 3000,
            needsLiveData: true,
            memoryImportant: true,
            memoryQuery: isMemoryQuery
        };
    }
    
    // Default: GPT with memory awareness
    return {
        type: 'general',
        bestAI: 'gpt',
        reason: 'General conversation with memory context',
        complexity: 'medium',
        maxTokens: 1200,
        needsLiveData: false,
        memoryImportant: isMemoryQuery || hasMemoryContext,
        memoryQuery: isMemoryQuery
    };
}

// 🎯 ENHANCED gpt-5 EXECUTION WITH CONTEXT
async function executeGptAnalysis(userMessage, queryAnalysis, context = null) {
    try {
        console.log('🔍 Executing gpt-5 analysis with enhanced context...');
        
        // Handle simple date/time queries directly
        if (queryAnalysis.type === 'datetime') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            return `Today is ${cambodiaTime.date} and it's currently ${cambodiaTime.time} in Cambodia (${cambodiaTime.timezone}). ${cambodiaTime.isWeekend ? "Enjoy your weekend!" : "Have a great day!"}`;
        }
        
        // Build enhanced message with context integration
        let enhancedMessage = userMessage;
        
        // Add time context for non-casual queries
        if (queryAnalysis.type !== 'casual' && queryAnalysis.type !== 'datetime') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            enhancedMessage = `Current time: ${cambodiaTime.date}, ${cambodiaTime.time} Cambodia (${cambodiaTime.marketStatus})\n\n${userMessage}`;
        }
        
        // Add memory context if important for this query
        if (queryAnalysis.memoryImportant && context && context.length > 0) {
            enhancedMessage += context;
            console.log('✅ Memory context integrated into GPT message');
        }
        
        // Configure model options with stability
        const modelOptions = {
            maxTokens: queryAnalysis.maxTokens,
            context: context,
            model: "gpt-5", // Use stable gpt-5
            temperature: queryAnalysis.type === 'casual' ? 0.8 : 0.7
        };
        
        // Route to appropriate GPT function
        if (queryAnalysis.type === 'market') {
            return await getMarketAnalysis(enhancedMessage, null, modelOptions);
        } else if (queryAnalysis.type === 'cambodia') {
            return await getCambodiaAnalysis(enhancedMessage, null, modelOptions);
        } else {
            return await getGptAnalysis(enhancedMessage, modelOptions);
        }
        
    } catch (error) {
        console.error('❌ GPT analysis error:', error.message);
        throw error;
    }
}

// ⚡ ENHANCED CLAUDE EXECUTION WITH CONTEXT
async function executeClaudeAnalysis(userMessage, queryAnalysis, context = null) {
    try {
        console.log('⚡ Executing Claude analysis with enhanced context...');
        
        // Add comprehensive global time context
        const globalTime = getCurrentGlobalDateTime();
        let timeContext = `Current global time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia | NY: ${globalTime.newYork.time} | London: ${globalTime.london.time} | Tokyo: ${globalTime.tokyo.time} | Market status: ${globalTime.cambodia.marketStatus}\n\n${userMessage}`;
        
        // Add memory context if important for this query
        if (queryAnalysis.memoryImportant && context && context.length > 0) {
            timeContext += context;
            console.log('✅ Memory context integrated into Claude message');
        }
        
        const options = {
            maxTokens: queryAnalysis.maxTokens,
            context: context,
            temperature: 0.7
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
            // Standard Claude analysis with memory
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

// 🎯 ENHANCED DUAL COMMAND EXECUTION
async function executeDualCommand(userMessage, chatId, options = {}) {
    const startTime = Date.now();
    
    try {
        console.log('🎯 Executing enhanced dual command with context...');
        
        // Build strategic context
        let context = null;
        if (!options.skipContext) {
            try {
                context = await buildStrategicCommanderContext(chatId, userMessage);
                console.log(`✅ Strategic context built: ${context.length} chars`);
            } catch (contextError) {
                console.log('⚠️ Context building failed:', contextError.message);
            }
        }
        
        // Analyze query with context awareness
        const queryAnalysis = analyzeQuery(
            userMessage, 
            options.messageType || 'text', 
            options.hasMedia || false,
            context
        );
        
        console.log('🧠 Enhanced query analysis:', {
            type: queryAnalysis.type,
            bestAI: queryAnalysis.bestAI,
            complexity: queryAnalysis.complexity,
            memoryImportant: queryAnalysis.memoryImportant,
            memoryQuery: queryAnalysis.memoryQuery,
            reason: queryAnalysis.reason
        });
        
        let response;
        let aiUsed;
        
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
            aiUsed = 'dual';
            
        } else {
            // Use single AI with enhanced context
            if (queryAnalysis.bestAI === 'claude') {
                response = await executeClaudeAnalysis(userMessage, queryAnalysis, context);
                aiUsed = 'claude';
            } else {
                response = await executeGptAnalysis(userMessage, queryAnalysis, context);
                aiUsed = 'gpt';
            }
        }
        
        const responseTime = Date.now() - startTime;
        
        return {
            response: response,
            aiUsed: aiUsed,
            queryType: queryAnalysis.type,
            complexity: queryAnalysis.complexity,
            reasoning: queryAnalysis.reason,
            specialFunction: queryAnalysis.specialFunction,
            liveDataUsed: queryAnalysis.needsLiveData,
            contextUsed: !!context,
            memoryImportant: queryAnalysis.memoryImportant,
            memoryQuery: queryAnalysis.memoryQuery,
            responseTime: responseTime,
            success: true
        };
        
    } catch (error) {
        console.error('❌ Enhanced dual command execution error:', error.message);
        
        // Enhanced fallback with context attempt
        try {
            console.log('🔄 Enhanced fallback to gpt-5...');
            
            const fallbackResponse = await getGptAnalysis(userMessage, {
                maxTokens: 1200,
                temperature: 0.7,
                model: "gpt-5"
            });
            
            const responseTime = Date.now() - startTime;
            
            return {
                response: `${fallbackResponse}\n\n*Note: Using enhanced fallback mode.*`,
                aiUsed: 'gpt-fallback',
                queryType: 'fallback',
                complexity: 'medium',
                reasoning: 'Enhanced fallback after system error',
                contextUsed: false,
                responseTime: responseTime,
                success: false,
                error: error.message
            };
            
        } catch (fallbackError) {
            throw new Error(`Enhanced context system failure: ${error.message}`);
        }
    }
}

// 📊 ENHANCED SYSTEM HEALTH CHECK
async function checkSystemHealth() {
    const health = {
        gptAnalysis: false,
        claudeAnalysis: false,
        contextBuilding: false,
        memorySystem: false,
        dateTimeSupport: false,
        dualMode: false,
        errors: []
    };
    
    try {
        // Test gpt-5
        await executeGptAnalysis('Test', { 
            type: 'casual', 
            maxTokens: 50, 
            memoryImportant: false 
        });
        health.gptAnalysis = true;
        console.log('✅ gpt-5 analysis operational');
    } catch (error) {
        health.errors.push(`GPT: ${error.message}`);
        console.log('❌ gpt-5 analysis unavailable');
    }
    
    try {
        // Test Claude
        await executeClaudeAnalysis('Test', { 
            type: 'general', 
            maxTokens: 50, 
            memoryImportant: false 
        });
        health.claudeAnalysis = true;
        console.log('✅ Claude analysis operational');
    } catch (error) {
        health.errors.push(`Claude: ${error.message}`);
        console.log('❌ Claude analysis unavailable');
    }
    
    try {
        // Test context building
        const testContext = await buildStrategicCommanderContext('test_health', 'test query');
        health.contextBuilding = typeof testContext === 'string';
        console.log('✅ Context building operational');
    } catch (error) {
        health.errors.push(`Context: ${error.message}`);
        console.log('❌ Context building unavailable');
    }
    
    try {
        // Test memory system
        const testMemory = await buildConversationContext('test_memory');
        health.memorySystem = typeof testMemory === 'string';
        console.log('✅ Memory system operational');
    } catch (error) {
        health.errors.push(`Memory: ${error.message}`);
        console.log('❌ Memory system unavailable');
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
    
    health.dualMode = health.gptAnalysis && health.claudeAnalysis;
    health.overallHealth = health.gptAnalysis || health.claudeAnalysis;
    
    return health;
}

// 🚀 ENHANCED QUICK ACCESS FUNCTIONS
async function getMarketIntelligence(chatId = null) {
    const globalTime = getCurrentGlobalDateTime();
    const query = `Enhanced market intelligence summary - Time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia. Provide comprehensive overview of current market conditions, key risks, and strategic opportunities with memory context.`;
    
    try {
        let context = null;
        if (chatId) {
            context = await buildStrategicCommanderContext(chatId, query).catch(() => null);
        }
        
        return await executeClaudeAnalysis(query, {
            type: 'market',
            maxTokens: 1000,
            needsLiveData: true,
            specialFunction: 'regime',
            memoryImportant: !!context
        }, context);
    } catch (error) {
        console.error('❌ Enhanced market intelligence error:', error.message);
        return 'Enhanced market intelligence temporarily unavailable';
    }
}

function getGlobalMarketStatus() {
    try {
        const globalTime = getCurrentGlobalDateTime();
        
        return {
            cambodia: {
                time: globalTime.cambodia.time,
                isBusinessHours: globalTime.cambodia.businessHours,
                isWeekend: globalTime.cambodia.isWeekend,
                marketStatus: globalTime.cambodia.marketStatus
            },
            newYork: {
                time: globalTime.newYork.time,
                isMarketHours: globalTime.newYork.isMarketHours,
                timezone: globalTime.newYork.timezone
            },
            london: {
                time: globalTime.london.time,
                isMarketHours: globalTime.london.isMarketHours,
                timezone: globalTime.london.timezone
            },
            tokyo: {
                time: globalTime.tokyo.time,
                isMarketHours: globalTime.tokyo.isMarketHours,
                timezone: globalTime.tokyo.timezone
            },
            summary: globalTime.cambodia.isWeekend ? 
                    'Weekend - Global Markets Closed' : 
                    'Weekday - Check individual market hours',
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Global market status error:', error.message);
        return { error: 'Global market status unavailable' };
    }
}

// 🔧 UTILITY FUNCTIONS
async function getUserProfileData(chatId) {
    try {
        const { getUserProfileDB } = require('./database');
        return await getUserProfileDB(chatId);
    } catch (error) {
        console.log('⚠️ User profile retrieval failed:', error.message);
        return null;
    }
}

function buildContextPrompt(userMessage, context, queryType) {
    let prompt = userMessage;
    
    if (context && context.length > 0) {
        prompt += `\n\n${context}`;
    }
    
    // Add specific instructions based on query type
    switch (queryType) {
        case 'memory_query':
            prompt += `\n\n🧠 MEMORY INSTRUCTION: Use the provided memory context to answer accurately. Reference specific facts when relevant.`;
            break;
        case 'regime_analysis':
            prompt += `\n\n🏛️ REGIME INSTRUCTION: Apply Ray Dalio's All Weather framework with historical context from memory.`;
            break;
        case 'cambodia_specific':
            prompt += `\n\n🇰🇭 CAMBODIA INSTRUCTION: Use stored Cambodia-specific knowledge and market context.`;
            break;
        case 'portfolio_analysis':
            prompt += `\n\n📊 PORTFOLIO INSTRUCTION: Apply institutional-grade analysis with risk management context.`;
            break;
    }
    
    return prompt;
}

// 📈 ENHANCED SYSTEM ANALYTICS
function getSystemAnalytics() {
    return {
        version: '3.0 - Enhanced Context & Memory Integration',
        aiModels: {
            gpt: 'gpt-5 (multimodal, natural conversation, stable)',
            claude: 'Claude Opus 4.1 (advanced reasoning, strategic analysis)'
        },
        contextFeatures: [
            'Strategic context building',
            'Enhanced memory integration',
            'Fallback context systems',
            'Query-aware context routing',
            'Memory relevance analysis',
            'Multi-source context aggregation'
        ],
        capabilities: [
            'Enhanced query routing with memory awareness',
            'Strategic context building with fallbacks',
            'Natural AI responses with conversation history',
            'Global timezone and market status integration',
            'Economic regime analysis with historical context',
            'Portfolio optimization with persistent knowledge',
            'Market anomaly detection with memory',
            'Cambodia market expertise with stored insights',
            'Dual AI synthesis for complex queries with context',
            'Memory-aware conversation enhancement'
        ],
        queryTypes: [
            'memory_query', 'casual', 'datetime', 'market', 'regime', 
            'anomaly', 'portfolio', 'cambodia', 'complex', 'multimodal', 'general'
        ],
        specialFunctions: [
            'regime analysis', 'anomaly detection', 'portfolio optimization', 
            'cambodia analysis', 'context building', 'memory integration'
        ],
        contextSources: [
            'Conversation history', 'Persistent memory', 'User profiles',
            'Strategic instructions', 'Query analysis', 'Fallback systems'
        ],
        memoryIntegration: {
            contextBuilding: 'Enhanced memory-aware context construction',
            queryAnalysis: 'Memory relevance detection and routing',
            fallbackSystems: 'Multiple layers of context recovery',
            strategicInstructions: 'Context-aware AI guidance'
        },
        healthCheck: 'Use checkSystemHealth() for current status with context diagnostics'
    };
}

// 🧪 CONTEXT TESTING AND DIAGNOSTICS
async function testContextSystem(chatId) {
    console.log('🧪 Testing enhanced context system...');
    
    const tests = {
        basicContextBuilding: false,
        memoryIntegration: false,
        queryAnalysis: false,
        fallbackContext: false,
        dualCommandWithContext: false,
        contextPromptBuilding: false
    };
    
    try {
        // Test 1: Basic Context Building
        const basicContext = await buildStrategicCommanderContext(chatId, 'test query');
        tests.basicContextBuilding = typeof basicContext === 'string' && basicContext.length > 50;
        console.log(`✅ Basic Context Building: ${tests.basicContextBuilding} (${basicContext?.length || 0} chars)`);
    } catch (error) {
        console.log(`❌ Basic Context Building: Failed - ${error.message}`);
    }
    
    try {
        // Test 2: Memory Integration
        const memoryContext = await buildConversationContext(chatId);
        tests.memoryIntegration = typeof memoryContext === 'string';
        console.log(`✅ Memory Integration: ${tests.memoryIntegration} (${memoryContext?.length || 0} chars)`);
    } catch (error) {
        console.log(`❌ Memory Integration: Failed - ${error.message}`);
    }
    
    try {
        // Test 3: Query Analysis
        const analysis = analyzeQuery('Remember my name is John and analyze the market', 'text', false, 'test context');
        tests.queryAnalysis = analysis && analysis.type && analysis.bestAI;
        console.log(`✅ Query Analysis: ${tests.queryAnalysis} (${analysis?.type}, ${analysis?.bestAI})`);
    } catch (error) {
        console.log(`❌ Query Analysis: Failed - ${error.message}`);
    }
    
    try {
        // Test 4: Fallback Context
        const fallbackContext = await buildStrategicCommanderContext('nonexistent_user', 'test');
        tests.fallbackContext = typeof fallbackContext === 'string' && fallbackContext.length > 0;
        console.log(`✅ Fallback Context: ${tests.fallbackContext}`);
    } catch (error) {
        console.log(`❌ Fallback Context: Failed - ${error.message}`);
    }
    
    try {
        // Test 5: Dual Command with Context
        const result = await executeDualCommand('Test context integration', chatId);
        tests.dualCommandWithContext = result.success && result.contextUsed !== undefined;
        console.log(`✅ Dual Command with Context: ${tests.dualCommandWithContext}`);
    } catch (error) {
        console.log(`❌ Dual Command with Context: Failed - ${error.message}`);
    }
    
    try {
        // Test 6: Context Prompt Building
        const prompt = buildContextPrompt('test message', 'test context', 'memory_query');
        tests.contextPromptBuilding = typeof prompt === 'string' && prompt.includes('MEMORY INSTRUCTION');
        console.log(`✅ Context Prompt Building: ${tests.contextPromptBuilding}`);
    } catch (error) {
        console.log(`❌ Context Prompt Building: Failed - ${error.message}`);
    }
    
    const overallSuccess = Object.values(tests).filter(test => test).length;
    const totalTests = Object.keys(tests).length;
    
    console.log(`\n📊 Enhanced Context System Test: ${overallSuccess}/${totalTests} passed`);
    console.log(`${overallSuccess === totalTests ? '🎉 FULL SUCCESS' : overallSuccess >= totalTests * 0.7 ? '✅ MOSTLY WORKING' : '⚠️ NEEDS ATTENTION'}`);
    
    return {
        tests: tests,
        score: `${overallSuccess}/${totalTests}`,
        percentage: Math.round((overallSuccess / totalTests) * 100),
        status: overallSuccess === totalTests ? 'FULL_SUCCESS' : 
                overallSuccess >= totalTests * 0.7 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION'
    };
}

// 📋 ENHANCED EXPORT FUNCTIONS
module.exports = {
    // 🎯 Main functions
    executeDualCommand,
    analyzeQuery,
    executeGptAnalysis,
    executeClaudeAnalysis,
    
    // 🏗️ Context functions
    buildStrategicCommanderContext,
    buildContextPrompt,
    
    // 🧠 Analysis functions
    analyzeQueryType,
    analyzeQueryComplexity,
    isMemoryRelevant,
    
    // 🌍 Utility functions
    getCurrentCambodiaDateTime,
    getCurrentGlobalDateTime,
    getMarketIntelligence,
    getGlobalMarketStatus,
    getUserProfileData,
    
    // 📊 System management
    checkSystemHealth,
    getSystemAnalytics,
    
    // 🧪 Testing functions
    testContextSystem,
    
    // 🔄 Legacy compatibility
    executeEnhancedDualCommand: executeDualCommand,
    routeConversationIntelligently: analyzeQuery,
    getEnhancedCommandAnalytics: getSystemAnalytics,
    checkEnhancedSystemHealth: checkSystemHealth,
    
    // 🎯 Enhanced exports
    buildEnhancedStrategicContext: buildStrategicCommanderContext,
    analyzeEnhancedQuery: analyzeQuery,
    testEnhancedContextSystem: testContextSystem
};
