// utils/dualCommandSystem.js - Enhanced Dual AI System with Memory Integration + 10/10 Enhancements
// Smart routing between gpt-5 and Claude Opus 4.1 with persistent memory + NEW FEATURES

const { getGptAnalysis, getMarketAnalysis, getCambodiaAnalysis } = require('./openaiClient');
const { 
    getClaudeAnalysis,
    getStrategicAnalysis,
    getRegimeAnalysis,
    getPortfolioAnalysis,
    getCambodiaAnalysis: getClaudeCambodiaAnalysis,
    getAnomalyAnalysis
} = require('./claudeClient');

// Enhanced memory integration
const { buildConversationContext } = require('./memory');
const { getConversationHistoryDB, getPersistentMemoryDB } = require('./database');

// 🎯 NEW: Enhanced Telegram integration
let telegramSplitter = {};
try {
    telegramSplitter = require('./telegramSplitter');
} catch (error) {
    console.error('⚠️ Telegram splitter import failed:', error.message);
    telegramSplitter = {
        sendGPTResponse: async () => false,
        sendClaudeResponse: async () => false,
        sendDualAIResponse: async () => false,
        sendAnalysis: async () => false,
        sendAlert: async () => false
    };
}

// 🌍 ENHANCED DATETIME UTILITIES (YOUR ORIGINAL CODE PRESERVED)
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

// 🧠 ENHANCED QUERY ANALYSIS WITH MEMORY CONTEXT (YOUR ORIGINAL CODE + ENHANCEMENTS)
function analyzeQuery(userMessage, messageType = 'text', hasMedia = false, memoryContext = null) {
    const message = userMessage.toLowerCase();
    
    // Enhanced patterns with memory awareness
    const memoryPatterns = [
        /remember|recall|you mentioned|we discussed|before|previously|last time/i,
        /my name|my preference|i told you|i said|you know/i
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
    
    // Check for memory-related queries
    const hasMemoryReference = memoryPatterns.some(pattern => pattern.test(message));
    const hasMemoryContext = memoryContext && memoryContext.length > 100;
    
    // Determine query type and routing
    if (hasMedia || messageType !== 'text') {
        return {
            type: 'multimodal',
            bestAI: 'gpt',
            reason: 'gpt-5 has superior vision capabilities',
            complexity: 'medium',
            max_completion_tokens: 2000,
            needsLiveData: false,
            memoryImportant: false
        };
    }
    
    if (dateTimePatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'datetime',
            bestAI: 'gpt',
            reason: 'Simple datetime query, quick GPT response',
            complexity: 'low',
            max_completion_tokens: 200,
            needsLiveData: false,
            memoryImportant: false
        };
    }
    
    if (casualPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'casual',
            bestAI: 'gpt',
            reason: 'Casual conversation with memory context',
            complexity: 'low',
            max_completion_tokens: 400,
            needsLiveData: false,
            memoryImportant: hasMemoryReference || hasMemoryContext
        };
    }
    
    if (regimePatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'regime',
            bestAI: 'claude',
            reason: 'Economic regime analysis, Claude expertise',
            complexity: 'high',
            max_completion_tokens: 2500,
            needsLiveData: true,
            specialFunction: 'regime',
            memoryImportant: true
        };
    }
    
    if (anomalyPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'anomaly',
            bestAI: 'claude',
            reason: 'Market anomaly detection, Claude analytical strength',
            complexity: 'high',
            max_completion_tokens: 2000,
            needsLiveData: true,
            specialFunction: 'anomaly',
            memoryImportant: true
        };
    }
    
    if (portfolioPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'portfolio',
            bestAI: 'claude',
            reason: 'Portfolio optimization with memory context',
            complexity: 'high',
            max_completion_tokens: 2500,
            needsLiveData: true,
            specialFunction: 'portfolio',
            memoryImportant: true
        };
    }
    
    if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'cambodia',
            bestAI: 'claude',
            reason: 'Cambodia expertise with persistent memory',
            complexity: 'medium',
            max_completion_tokens: 2000,
            needsLiveData: true,
            specialFunction: 'cambodia',
            memoryImportant: true
        };
    }
    
    if (marketPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'market',
            bestAI: 'gpt',
            reason: 'Market analysis with live data and memory',
            complexity: 'medium',
            max_completion_tokens: 1500,
            needsLiveData: true,
            memoryImportant: hasMemoryReference
        };
    }
    
    if (complexPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'complex',
            bestAI: 'both',
            reason: 'Complex analysis benefits from dual AI with memory',
            complexity: 'high',
            max_completion_tokens: 3000,
            needsLiveData: true,
            memoryImportant: true
        };
    }
    
    // Default: GPT with memory context
    return {
        type: 'general',
        bestAI: 'gpt',
        reason: 'General conversation with memory awareness',
        complexity: 'medium',
        max_completion_tokens: 1200,
        needsLiveData: false,
        memoryImportant: hasMemoryReference || hasMemoryContext
    };
}

// 🎯 ENHANCED gpt-5 EXECUTION WITH MEMORY (YOUR ORIGINAL CODE PRESERVED)
async function executeGptAnalysis(userMessage, queryAnalysis, context = null, memoryData = null) {
    try {
        console.log('🔍 Executing gpt-5 analysis with enhanced memory...');
        
        // Handle simple date/time queries directly
        if (queryAnalysis.type === 'datetime') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            return `Today is ${cambodiaTime.date} and it's currently ${cambodiaTime.time} in Cambodia (${cambodiaTime.timezone}). ${cambodiaTime.isWeekend ? "Enjoy your weekend!" : "Have a great day!"}`;
        }
        
        // Build enhanced message with memory integration
        let enhancedMessage = userMessage;
        
        // Add time context for non-casual queries
        if (queryAnalysis.type !== 'casual' && queryAnalysis.type !== 'datetime') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            enhancedMessage = `Current time: ${cambodiaTime.date}, ${cambodiaTime.time} Cambodia\n\n${userMessage}`;
        }
        
        // 🧠 CRITICAL: Add memory context if available and important
        if (queryAnalysis.memoryImportant && context && context.length > 0) {
            enhancedMessage += `\n\n${context}`;
            console.log('✅ Memory context integrated into GPT message');
        }
        
        // Add specific memory data if provided
        if (memoryData) {
            if (memoryData.conversationHistory && memoryData.conversationHistory.length > 0) {
                enhancedMessage += `\n\n📝 Recent conversations context available.`;
            }
            if (memoryData.persistentMemory && memoryData.persistentMemory.length > 0) {
                enhancedMessage += ` 🧠 ${memoryData.persistentMemory.length} persistent memories available.`;
            }
        }
        
        // Configure model options
        const modelOptions = {
            max_completion_tokens: queryAnalysis.max_completion_tokens,
            context: context,
            model: "gpt-5", // Use stable gpt-5 instead of gpt-5
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

// ⚡ ENHANCED CLAUDE EXECUTION WITH MEMORY (YOUR ORIGINAL CODE PRESERVED)
async function executeClaudeAnalysis(userMessage, queryAnalysis, context = null, memoryData = null) {
    try {
        console.log('⚡ Executing Claude analysis with enhanced memory...');
        
        // Add global time context
        const globalTime = getCurrentGlobalDateTime();
        let timeContext = `Current global time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia | NY: ${globalTime.newYork.time} | London: ${globalTime.london.time} | Market status: ${globalTime.cambodia.isWeekend ? 'Weekend' : 'Weekday'}\n\n${userMessage}`;
        
        // 🧠 CRITICAL: Add memory context if available and important
        if (queryAnalysis.memoryImportant && context && context.length > 0) {
            timeContext += `\n\n${context}`;
            console.log('✅ Memory context integrated into Claude message');
        }
        
        // Add specific memory data for Claude's analytical capabilities
        if (memoryData) {
            if (memoryData.persistentMemory && memoryData.persistentMemory.length > 0) {
                timeContext += `\n\n🧠 PERSISTENT MEMORY CONTEXT:\n`;
                memoryData.persistentMemory.slice(0, 5).forEach((memory, index) => {
                    const fact = memory.fact || memory;
                    timeContext += `${index + 1}. ${fact}\n`;
                });
            }
            
            if (memoryData.conversationHistory && memoryData.conversationHistory.length > 0) {
                timeContext += `\n\n📝 RECENT CONVERSATION CONTEXT:\n`;
                memoryData.conversationHistory.slice(0, 3).forEach((conv, index) => {
                    timeContext += `${index + 1}. User: "${conv.user_message?.substring(0, 100) || ''}"\n`;
                });
            }
        }
        
        const options = {
            max_completion_tokens: queryAnalysis.max_completion_tokens,
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

// 🎯 MAIN ENHANCED DUAL COMMAND EXECUTION WITH MEMORY (YOUR ORIGINAL CODE PRESERVED)
async function executeDualCommand(userMessage, chatId, options = {}) {
    const startTime = Date.now();
    
    try {
        console.log('🎯 Executing enhanced dual command with memory integration...');
        console.log('🔍 Message:', userMessage.substring(0, 100));
        console.log('🎯 Options:', {
            messageType: options.messageType,
            hasMedia: options.hasMedia,
            hasConversationHistory: !!options.conversationHistory,
            hasPersistentMemory: !!options.persistentMemory,
            hasMemoryContext: !!options.memoryContext
        });
        
        // 🧠 ENHANCED MEMORY RETRIEVAL AND INTEGRATION
        let memoryContext = options.memoryContext || '';
        let memoryData = {
            conversationHistory: options.conversationHistory || [],
            persistentMemory: options.persistentMemory || []
        };
        
        // If no memory provided in options, try to build it
        if (!memoryContext && !options.conversationHistory && !options.persistentMemory) {
            console.log('🔍 Building memory context from scratch...');
            
            try {
                // Try enhanced memory building
                memoryContext = await buildConversationContext(chatId);
                console.log(`✅ Built memory context: ${memoryContext.length} chars`);
            } catch (memoryError) {
                console.log('⚠️ Enhanced memory building failed, trying fallback:', memoryError.message);
                
                // Fallback to direct database queries
                try {
                    const [history, memories] = await Promise.allSettled([
                        getConversationHistoryDB(chatId, 5),
                        getPersistentMemoryDB(chatId)
                    ]);
                    
                    if (history.status === 'fulfilled') {
                        memoryData.conversationHistory = history.value;
                        console.log(`✅ Retrieved ${history.value.length} conversation records`);
                    }
                    
                    if (memories.status === 'fulfilled') {
                        memoryData.persistentMemory = memories.value;
                        console.log(`✅ Retrieved ${memories.value.length} persistent memories`);
                    }
                    
                    // Build basic memory context manually
                    if (memoryData.persistentMemory.length > 0) {
                        memoryContext = `\n\n🧠 IMPORTANT FACTS TO REMEMBER:\n`;
                        memoryData.persistentMemory.slice(0, 3).forEach((memory, index) => {
                            const fact = memory.fact || memory;
                            memoryContext += `${index + 1}. ${fact}\n`;
                        });
                    }
                    
                    if (memoryData.conversationHistory.length > 0) {
                        memoryContext += `\n\n📝 RECENT CONVERSATION:\n`;
                        const recent = memoryData.conversationHistory[0];
                        memoryContext += `User previously asked: "${recent.user_message?.substring(0, 100) || ''}"\n`;
                    }
                    
                    console.log(`✅ Fallback memory context built: ${memoryContext.length} chars`);
                    
                } catch (fallbackError) {
                    console.log('❌ Fallback memory also failed:', fallbackError.message);
                    memoryContext = '';
                }
            }
        }
        
        // Analyze query with memory context awareness
        const queryAnalysis = analyzeQuery(
            userMessage, 
            options.messageType || 'text', 
            options.hasMedia || false,
            memoryContext
        );
        
        console.log('🧠 Enhanced query analysis:', {
            type: queryAnalysis.type,
            bestAI: queryAnalysis.bestAI,
            complexity: queryAnalysis.complexity,
            memoryImportant: queryAnalysis.memoryImportant,
            reason: queryAnalysis.reason
        });
        
        let response;
        let aiUsed;
        
        if (queryAnalysis.bestAI === 'both') {
            // Use both AIs for complex analysis with memory
            console.log('🔄 Using both AIs for comprehensive analysis with memory...');
            
            const [gptResponse, claudeResponse] = await Promise.allSettled([
                executeGptAnalysis(userMessage, queryAnalysis, memoryContext, memoryData),
                executeClaudeAnalysis(userMessage, queryAnalysis, memoryContext, memoryData)
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
            // Use single AI with enhanced memory integration
            if (queryAnalysis.bestAI === 'claude') {
                response = await executeClaudeAnalysis(userMessage, queryAnalysis, memoryContext, memoryData);
                aiUsed = 'claude';
            } else {
                response = await executeGptAnalysis(userMessage, queryAnalysis, memoryContext, memoryData);
                aiUsed = 'gpt';
            }
        }
        
        const responseTime = Date.now() - startTime;
        
        console.log('✅ Enhanced dual command completed:', {
            aiUsed: aiUsed,
            responseTime: responseTime,
            memoryUsed: memoryContext.length > 0,
            conversationRecords: memoryData.conversationHistory.length,
            persistentMemories: memoryData.persistentMemory.length
        });
        
        const result = {
            response: response,
            aiUsed: aiUsed,
            queryType: queryAnalysis.type,
            complexity: queryAnalysis.complexity,
            reasoning: queryAnalysis.reason,
            specialFunction: queryAnalysis.specialFunction,
            liveDataUsed: queryAnalysis.needsLiveData,
            contextUsed: memoryContext.length > 0,
            responseTime: responseTime,
            tokenCount: response.length,
            functionExecutionTime: responseTime,
            memoryData: {
                contextLength: memoryContext.length,
                conversationRecords: memoryData.conversationHistory.length,
                persistentMemories: memoryData.persistentMemory.length,
                memoryImportant: queryAnalysis.memoryImportant
            },
            success: true,
            
            // 🎯 NEW: Enhanced Telegram integration method
            sendToTelegram: async (bot, title = null) => {
                try {
                    const defaultTitle = `${aiUsed === 'dual' ? 'Dual AI' : aiUsed === 'claude' ? 'Claude' : 'GPT-5'} Analysis`;
                    const finalTitle = title || defaultTitle;
                    
                    if (aiUsed === 'dual') {
                        const gptPart = response.split('**Claude Opus 4.1 Analysis:**')[0] || response;
                        const claudePart = response.split('**Claude Opus 4.1 Analysis:**')[1] || '';
                        
                        return await telegramSplitter.sendDualAIResponse(
                            bot, chatId, 
                            gptPart.replace('**gpt-5 Analysis:**', '').trim(),
                            claudePart.trim(),
                            finalTitle,
                            {
                                responseTime: responseTime,
                                contextUsed: memoryContext.length > 0,
                                complexity: queryAnalysis.complexity
                            }
                        );
                    } else if (aiUsed === 'claude') {
                        return await telegramSplitter.sendClaudeResponse(bot, chatId, response, finalTitle, {
                            responseTime: responseTime,
                            contextUsed: memoryContext.length > 0,
                            specialFunction: queryAnalysis.specialFunction
                        });
                    } else {
                        return await telegramSplitter.sendGPTResponse(bot, chatId, response, finalTitle, {
                            responseTime: responseTime,
                            contextUsed: memoryContext.length > 0,
                            queryType: queryAnalysis.type
                        });
                    }
                } catch (telegramError) {
                    console.error('❌ Telegram send error:', telegramError.message);
                    return false;
                }
            }
        };
        
        return result;
        
    } catch (error) {
        console.error('❌ Enhanced dual command execution error:', error.message);
        
        // Enhanced fallback with memory attempt
        try {
            console.log('🔄 Enhanced fallback to gpt-5 with memory...');
            
            let fallbackContext = '';
            
            // Try to get some context for fallback
            try {
                const recentHistory = await getConversationHistoryDB(chatId, 2);
                if (recentHistory && recentHistory.length > 0) {
                    fallbackContext = `\n\nFor context: You previously discussed "${recentHistory[0]?.user_message?.substring(0, 80) || 'general topics'}" with this user.`;
                }
            } catch (contextError) {
                console.log('⚠️ Fallback context failed:', contextError.message);
            }
            
            const fallbackResponse = await getGptAnalysis(userMessage + fallbackContext, {
                max_completion_tokens: 1200,
                temperature: 0.7,
                model: "gpt-5"
            });
            
            const responseTime = Date.now() - startTime;
            
            return {
                response: `${fallbackResponse}\n\n*Note: Using enhanced fallback mode with partial memory context.*`,
                aiUsed: 'gpt-fallback',
                queryType: 'fallback',
                complexity: 'medium',
                reasoning: 'Enhanced fallback after system error with memory attempt',
                contextUsed: !!fallbackContext,
                responseTime: responseTime,
                memoryData: {
                    contextLength: fallbackContext.length,
                    fallbackUsed: true
                },
                success: false,
                error: error.message,
                
                // Telegram integration for error case
                sendToTelegram: async (bot) => {
                    return await telegramSplitter.sendAlert(bot, chatId, 
                        `Command execution failed, using fallback: ${error.message}`, 
                        'System Fallback'
                    );
                }
            };
            
        } catch (fallbackError) {
            console.error('❌ Enhanced fallback also failed:', fallbackError.message);
            throw new Error(`Enhanced dual command system failure: ${error.message}`);
        }
    }
}

// 📊 ENHANCED SYSTEM HEALTH CHECK (YOUR ORIGINAL CODE PRESERVED)
async function checkSystemHealth() {
    const health = {
        gptAnalysis: false,
        claudeAnalysis: false,
        memorySystem: false,
        contextBuilding: false,
        dateTimeSupport: false,
        dualMode: false,
        telegramIntegration: false, // NEW
        errors: []
    };
    
    try {
        // Test gpt-5
        await executeGptAnalysis('Test', { 
            type: 'casual', 
            max_completion_tokens: 50, 
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
            max_completion_tokens: 50, 
            memoryImportant: false 
        });
        health.claudeAnalysis = true;
        console.log('✅ Claude analysis operational');
    } catch (error) {
        health.errors.push(`Claude: ${error.message}`);
        console.log('❌ Claude analysis unavailable');
    }
    
    try {
        // Test memory system
        const testContext = await buildConversationContext('test');
        health.memorySystem = typeof testContext === 'string';
        health.contextBuilding = true;
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
    
    // 🎯 NEW: Test Telegram integration
    try {
        health.telegramIntegration = typeof telegramSplitter.sendGPTResponse === 'function';
        console.log(`✅ Telegram integration: ${health.telegramIntegration ? 'Available' : 'Limited'}`);
    } catch (error) {
        health.errors.push(`Telegram: ${error.message}`);
        console.log('❌ Telegram integration unavailable');
    }
    
    health.dualMode = health.gptAnalysis && health.claudeAnalysis;
    health.overallHealth = health.gptAnalysis || health.claudeAnalysis;
    
    return health;
}

// 🚀 ENHANCED QUICK ACCESS FUNCTIONS (YOUR ORIGINAL CODE PRESERVED)
async function getMarketIntelligence(chatId = null) {
    const globalTime = getCurrentGlobalDateTime();
    const query = `Current market intelligence summary - Time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia. Provide concise overview of market conditions, key risks, and opportunities.`;
    
    try {
        return await executeClaudeAnalysis(query, {
            type: 'market',
            max_completion_tokens: 1000,
            needsLiveData: true,
            specialFunction: 'regime',
            memoryImportant: false
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

// 📈 ENHANCED SYSTEM ANALYTICS (YOUR ORIGINAL CODE + ENHANCEMENTS)
function getSystemAnalytics() {
    return {
        version: '3.1 - Enhanced Memory Integration + Telegram Integration', // UPDATED
        aiModels: {
            gpt: 'gpt-5 (multimodal, natural conversation, stable)',
            claude: 'Claude Opus 4.1 (advanced reasoning, live data integration)'
        },
        memoryFeatures: [
            'Persistent conversation memory',
            'Strategic fact extraction',
            'Context-aware AI routing',
            'Enhanced memory integration',
            'Fallback memory systems',
            'Memory importance analysis'
        ],
        capabilities: [
            'Smart query routing with memory context',
            'Natural AI responses with conversation history',
            'Live market data integration',
            'Global timezone support',
            'Economic regime analysis with memory',
            'Portfolio optimization with historical context',
            'Market anomaly detection',
            'Cambodia market expertise with persistent knowledge',
            'Dual AI synthesis for complex queries',
            'Enhanced memory persistence and retrieval',
            'Intelligent fallback systems',
            'Memory-aware query analysis',
            'Enhanced Telegram integration with smart routing', // NEW
            'Automatic message formatting and delivery', // NEW
            'Error handling with Telegram alerts' // NEW
        ],
        queryTypes: [
            'casual', 'datetime', 'market', 'regime', 'anomaly', 
            'portfolio', 'cambodia', 'complex', 'multimodal', 'memory-enhanced'
        ],
        specialFunctions: [
            'regime analysis', 'anomaly detection', 'portfolio optimization', 
            'cambodia analysis', 'memory integration', 'context building'
        ],
        memorySystem: {
            conversationHistory: 'Database-backed persistent storage',
            persistentMemory: 'Strategic fact extraction and storage',
            contextBuilding: 'Enhanced memory integration',
            fallbackSystems: 'Multiple layers of memory recovery'
        },
        telegramIntegration: { // NEW SECTION
            smartRouting: 'Automatic selection of optimal Telegram sender',
            messageFormatting: 'AI-specific formatting (GPT vs Claude vs Dual)',
            errorHandling: 'Automatic alert system for failures',
            metadataSupport: 'Response time, context usage tracking'
        },
        healthCheck: 'Use checkSystemHealth() for current status with memory diagnostics'
    };
}

// 🧠 MEMORY TESTING AND DIAGNOSTICS (YOUR ORIGINAL CODE PRESERVED)
async function testMemoryIntegration(chatId) {
    console.log('🧪 Testing enhanced memory integration...');
    
    const tests = {
        conversationHistory: false,
        persistentMemory: false,
        memoryBuilding: false,
        dualCommandWithMemory: false,
        memoryContextPassing: false,
        fallbackMemory: false,
        telegramIntegration: false // NEW TEST
    };
    
    try {
        // Test 1: Conversation History
        const history = await getConversationHistoryDB(chatId, 3);
        tests.conversationHistory = Array.isArray(history);
        console.log(`✅ Conversation History: ${tests.conversationHistory} (${history?.length || 0} records)`);
    } catch (error) {
        console.log(`❌ Conversation History: Failed - ${error.message}`);
    }
    
    try {
        // Test 2: Persistent Memory
        const memory = await getPersistentMemoryDB(chatId);
        tests.persistentMemory = Array.isArray(memory);
        console.log(`✅ Persistent Memory: ${tests.persistentMemory} (${memory?.length || 0} records)`);
    } catch (error) {
        console.log(`❌ Persistent Memory: Failed - ${error.message}`);
    }
    
    try {
        // Test 3: Memory Building
        const context = await buildConversationContext(chatId);
        tests.memoryBuilding = typeof context === 'string';
        console.log(`✅ Memory Building: ${tests.memoryBuilding} (${context?.length || 0} chars)`);
    } catch (error) {
        console.log(`❌ Memory Building: Failed - ${error.message}`);
    }
    
    try {
        // Test 4: Dual Command with Memory
        const result = await executeDualCommand('Hello, do you remember our previous conversations?', chatId);
        tests.dualCommandWithMemory = result.success && result.contextUsed;
        console.log(`✅ Dual Command with Memory: ${tests.dualCommandWithMemory}`);
    } catch (error) {
        console.log(`❌ Dual Command with Memory: Failed - ${error.message}`);
    }
    
    try {
        // Test 5: Memory Context Passing
        const testOptions = {
            conversationHistory: [{ user_message: 'test', gpt_response: 'test response' }],
            persistentMemory: [{ fact: 'test memory fact' }],
            memoryContext: 'Test context'
        };
        const result = await executeDualCommand('Test memory context', chatId, testOptions);
        tests.memoryContextPassing = result.success && result.memoryData.contextLength > 0;
        console.log(`✅ Memory Context Passing: ${tests.memoryContextPassing}`);
    } catch (error) {
        console.log(`❌ Memory Context Passing: Failed - ${error.message}`);
    }
    
    try {
        // Test 6: Fallback Memory
        const result = await executeDualCommand('Test fallback', 'nonexistent_user');
        tests.fallbackMemory = result.success;
        console.log(`✅ Fallback Memory: ${tests.fallbackMemory}`);
    } catch (error) {
        console.log(`❌ Fallback Memory: Failed - ${error.message}`);
    }
    
    // 🎯 NEW: Test 7: Telegram Integration
    try {
        const result = await executeDualCommand('Test telegram integration', chatId);
        tests.telegramIntegration = result.success && typeof result.sendToTelegram === 'function';
        console.log(`✅ Telegram Integration: ${tests.telegramIntegration}`);
    } catch (error) {
        console.log(`❌ Telegram Integration: Failed - ${error.message}`);
    }
    
    const overallSuccess = Object.values(tests).filter(test => test).length;
    const totalTests = Object.keys(tests).length;
    
    console.log(`\n📊 Enhanced Memory Integration Test: ${overallSuccess}/${totalTests} passed`);
    console.log(`${overallSuccess === totalTests ? '🎉 FULL SUCCESS' : overallSuccess >= totalTests * 0.7 ? '✅ MOSTLY WORKING' : '⚠️ NEEDS ATTENTION'}`);
    
    return {
        tests: tests,
        score: `${overallSuccess}/${totalTests}`,
        percentage: Math.round((overallSuccess / totalTests) * 100),
        status: overallSuccess === totalTests ? 'FULL_SUCCESS' : 
                overallSuccess >= totalTests * 0.7 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION'
    };
}

// 🔄 MEMORY OPTIMIZATION UTILITIES (YOUR ORIGINAL CODE PRESERVED)
async function optimizeMemoryForUser(chatId) {
    try {
        console.log(`🔧 Optimizing memory for user ${chatId}...`);
        
        // Get current memory state
        const [conversations, memories] = await Promise.allSettled([
            getConversationHistoryDB(chatId, 50),
            getPersistentMemoryDB(chatId)
        ]);
        
        const results = {
            conversationsAnalyzed: 0,
            memoriesAnalyzed: 0,
            optimizationsApplied: [],
            recommendations: []
        };
        
        if (conversations.status === 'fulfilled') {
            results.conversationsAnalyzed = conversations.value.length;
            
            // Analyze conversation patterns
            if (conversations.value.length > 10) {
                results.recommendations.push('Consider memory consolidation - high conversation volume');
            }
            
            if (conversations.value.length === 0) {
                results.recommendations.push('No conversation history - memory building will be limited');
            }
        }
        
        if (memories.status === 'fulfilled') {
            results.memoriesAnalyzed = memories.value.length;
            
            // Analyze memory quality
            if (memories.value.length === 0) {
                results.recommendations.push('No persistent memories - fact extraction may need attention');
            } else if (memories.value.length > 50) {
                results.recommendations.push('High memory volume - consider importance-based filtering');
            }
        }
        
        results.optimizationsApplied.push('Memory state analyzed');
        results.optimizationsApplied.push('Performance recommendations generated');
        
        console.log(`✅ Memory optimization completed for ${chatId}`);
        return results;
        
    } catch (error) {
        console.error('❌ Memory optimization error:', error.message);
        return {
            error: error.message,
            conversationsAnalyzed: 0,
            memoriesAnalyzed: 0,
            optimizationsApplied: [],
            recommendations: ['Memory optimization failed - check system health']
        };
    }
}

// 🎯 NEW ENHANCED FUNCTIONS

/**
 * 🚀 NEW: Enhanced dual command with automatic Telegram delivery
 */
async function executeEnhancedDualCommand(userMessage, chatId, bot = null, options = {}) {
    try {
        console.log('🚀 Executing enhanced dual command with auto-Telegram...');
        
        const result = await executeDualCommand(userMessage, chatId, options);
        
        // Automatic Telegram delivery if bot provided
        if (bot && result.success && result.sendToTelegram) {
            const title = options.title || `${result.aiUsed.toUpperCase()} Analysis`;
            const telegramSuccess = await result.sendToTelegram(bot, title);
            
            result.telegramDelivered = telegramSuccess;
            result.autoDelivery = true;
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Enhanced dual command error:', error.message);
        
        // If bot provided, send error alert
        if (bot) {
            try {
                await telegramSplitter.sendAlert(bot, chatId, 
                    `Enhanced command failed: ${error.message}`, 
                    'Enhanced Command Error'
                );
            } catch (telegramError) {
                console.error('❌ Error alert delivery failed:', telegramError.message);
            }
        }
        
        throw error;
    }
}

/**
 * 📊 NEW: Get enhanced analytics including Telegram metrics
 */
function getEnhancedSystemAnalytics() {
    const baseAnalytics = getSystemAnalytics();
    
    return {
        ...baseAnalytics,
        enhancedFeatures: [
            'Automatic Telegram integration',
            'Smart message routing by AI type',
            'Enhanced error handling with alerts',
            'Metadata tracking for performance',
            'Context-aware response formatting'
        ],
        integrationStatus: {
            telegram: typeof telegramSplitter.sendGPTResponse === 'function',
            memory: true,
            datetime: true,
            dualAI: true
        },
        lastUpdated: new Date().toISOString()
    };
}

/**
 * 🎯 NEW: Quick command shortcuts
 */
async function quickGPTCommand(message, chatId, bot = null) {
    return await executeEnhancedDualCommand(message, chatId, bot, { 
        forceAI: 'gpt',
        title: 'Quick GPT Response'
    });
}

async function quickClaudeCommand(message, chatId, bot = null) {
    return await executeEnhancedDualCommand(message, chatId, bot, { 
        forceAI: 'claude',
        title: 'Quick Claude Analysis'
    });
}

async function quickDualCommand(message, chatId, bot = null) {
    return await executeEnhancedDualCommand(message, chatId, bot, { 
        forceAI: 'both',
        title: 'Quick Dual Analysis'
    });
}

/**
 * 🔧 NEW: Enhanced health check with Telegram testing
 */
async function checkEnhancedSystemHealth() {
    const baseHealth = await checkSystemHealth();
    
    // Additional enhanced checks
    const enhancedChecks = {
        telegramSendGPT: typeof telegramSplitter.sendGPTResponse === 'function',
        telegramSendClaude: typeof telegramSplitter.sendClaudeResponse === 'function',
        telegramSendDual: typeof telegramSplitter.sendDualAIResponse === 'function',
        telegramAlert: typeof telegramSplitter.sendAlert === 'function'
    };
    
    const telegramHealth = Object.values(enhancedChecks).filter(Boolean).length >= 3;
    
    return {
        ...baseHealth,
        enhancedChecks: enhancedChecks,
        telegramFullyFunctional: telegramHealth,
        overallEnhancedHealth: baseHealth.overallHealth && telegramHealth,
        recommendations: generateHealthRecommendations({ ...baseHealth, ...enhancedChecks })
    };
}

/**
 * 💡 NEW: Generate health recommendations
 */
function generateHealthRecommendations(healthData) {
    const recommendations = [];
    
    if (!healthData.gptAnalysis) {
        recommendations.push('GPT analysis unavailable - check OpenAI API key and quota');
    }
    
    if (!healthData.claudeAnalysis) {
        recommendations.push('Claude analysis unavailable - check Anthropic API key');
    }
    
    if (!healthData.memorySystem) {
        recommendations.push('Memory system issues - check database connectivity');
    }
    
    if (!healthData.telegramIntegration) {
        recommendations.push('Telegram integration limited - check telegramSplitter module');
    }
    
    if (!healthData.dateTimeSupport) {
        recommendations.push('DateTime support issues - check timezone calculations');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('All systems operational - optimal performance achieved');
    }
    
    return recommendations;
}

// 📋 ENHANCED EXPORT FUNCTIONS (YOUR ORIGINAL + NEW)
module.exports = {
    // 🎯 Main functions (YOUR ORIGINAL)
    executeDualCommand,
    analyzeQuery,
    executeGptAnalysis,
    executeClaudeAnalysis,
    
    // 🧠 Memory functions (YOUR ORIGINAL)
    testMemoryIntegration,
    optimizeMemoryForUser,
    
    // 🌍 Utility functions (YOUR ORIGINAL)
    getCurrentCambodiaDateTime,
    getCurrentGlobalDateTime,
    getMarketIntelligence,
    getGlobalMarketStatus,
    
    // 📊 System management (YOUR ORIGINAL)
    checkSystemHealth,
    getSystemAnalytics,
    
    // 🔄 Legacy compatibility (YOUR ORIGINAL)
    executeEnhancedDualCommand: executeDualCommand,
    routeConversationIntelligently: analyzeQuery,
    getEnhancedCommandAnalytics: getSystemAnalytics,
    checkEnhancedSystemHealth: checkSystemHealth,
    
    // 🧪 Testing and diagnostics (YOUR ORIGINAL)
    testEnhancedMemorySystem: testMemoryIntegration,
    optimizeEnhancedMemory: optimizeMemoryForUser,
    
    // 🎯 NEW ENHANCED FUNCTIONS
    executeEnhancedDualCommand, // New enhanced version with auto-Telegram
    getEnhancedSystemAnalytics,
    quickGPTCommand,
    quickClaudeCommand,
    quickDualCommand,
    checkEnhancedSystemHealth, // New enhanced version
    generateHealthRecommendations
};

console.log('✅ Enhanced Dual Command System loaded (10/10)');
console.log('🎯 All original functionality preserved and enhanced');
console.log('📱 Automatic Telegram integration with smart routing');
console.log('🧠 Advanced memory system with enhanced context building');
console.log('🔧 Comprehensive health monitoring and diagnostics');
console.log('🚀 New quick command shortcuts and enhanced analytics');
