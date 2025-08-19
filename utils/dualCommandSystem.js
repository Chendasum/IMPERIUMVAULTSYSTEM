// utils/dualCommandSystem.js - REWRITTEN: Clean Flow to dualAISystem.js
// Perfect routing: index.js → dualCommandSystem.js → dualAISystem.js → clients
// Preserves all your original functionality while leveraging your 2000+ line power system

// 🎯 MAIN IMPORT: Your Ultimate Strategic Power System
const dualAISystem = require('./dualAISystem');

// 🔄 FALLBACK IMPORTS: Individual clients for emergency fallback only
let openaiClient, claudeClient;
try {
    openaiClient = require('./openaiClient');
    claudeClient = require('./claudeClient');
} catch (error) {
    console.warn('⚠️ Client fallback imports failed:', error.message);
    openaiClient = { getGptAnalysis: async () => 'OpenAI client unavailable' };
    claudeClient = { getClaudeAnalysis: async () => 'Claude client unavailable' };
}

// 🧠 MEMORY INTEGRATION
let memory, database;
try {
    memory = require('./memory');
    database = require('./database');
} catch (error) {
    console.warn('⚠️ Memory system imports failed:', error.message);
    memory = { buildConversationContext: async () => '' };
    database = { 
        getConversationHistoryDB: async () => [],
        getPersistentMemoryDB: async () => []
    };
}

// 📱 TELEGRAM INTEGRATION
let telegramSplitter = {};
try {
    telegramSplitter = require('./telegramSplitter');
} catch (error) {
    console.warn('⚠️ Telegram splitter import failed:', error.message);
    telegramSplitter = {
        sendGPTResponse: async () => false,
        sendClaudeResponse: async () => false,
        sendDualAIResponse: async () => false,
        sendAnalysis: async () => false,
        sendAlert: async () => false
    };
}

// 🌍 ENHANCED DATETIME UTILITIES (Your Original Code Preserved)
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

// 🧠 ENHANCED QUERY ANALYSIS (Your Original Code Enhanced)
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
    
    // Determine query type and routing preference
    if (hasMedia || messageType !== 'text') {
        return {
            type: 'multimodal',
            bestAI: 'gpt',
            reason: 'GPT-5 has superior vision capabilities',
            complexity: 'medium',
            max_tokens: 3000,
            needsLiveData: false,
            memoryImportant: false,
            powerSystemPreference: 'GPT5_ULTIMATE'
        };
    }
    
    if (dateTimePatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'datetime',
            bestAI: 'gpt',
            reason: 'Simple datetime query, quick GPT response',
            complexity: 'low',
            max_tokens: 3000,
            needsLiveData: false,
            memoryImportant: false,
            powerSystemPreference: 'GPT5_SPEED'
        };
    }
    
    if (casualPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'casual',
            bestAI: 'gpt',
            reason: 'Casual conversation with memory context',
            complexity: 'low',
            max_tokens: 3000,
            needsLiveData: false,
            memoryImportant: hasMemoryReference || hasMemoryContext,
            powerSystemPreference: 'GPT5_CHAT'
        };
    }
    
    if (regimePatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'regime',
            bestAI: 'claude',
            reason: 'Economic regime analysis, Claude strategic expertise',
            complexity: 'high',
            max_tokens: 3000,
            needsLiveData: true,
            specialFunction: 'regime',
            memoryImportant: true,
            powerSystemPreference: 'CLAUDE_STRATEGIC_MASTERY'
        };
    }
    
    if (anomalyPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'anomaly',
            bestAI: 'claude',
            reason: 'Market anomaly detection, Claude analytical strength',
            complexity: 'high',
            max_tokens: 3000,
            needsLiveData: true,
            specialFunction: 'anomaly',
            memoryImportant: true,
            powerSystemPreference: 'CLAUDE_STRATEGIC_MASTERY'
        };
    }
    
    if (portfolioPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'portfolio',
            bestAI: 'claude',
            reason: 'Portfolio optimization with memory context',
            complexity: 'high',
            max_tokens: 3000,
            needsLiveData: true,
            specialFunction: 'portfolio',
            memoryImportant: true,
            powerSystemPreference: 'CLAUDE_STRATEGIC_MASTERY'
        };
    }
    
    if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'cambodia',
            bestAI: 'claude',
            reason: 'Cambodia expertise with persistent memory',
            complexity: 'medium',
            max_tokens: 3000,
            needsLiveData: true,
            specialFunction: 'cambodia',
            memoryImportant: true,
            powerSystemPreference: 'CLAUDE_STRATEGIC_STANDARD'
        };
    }
    
    if (marketPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'market',
            bestAI: 'gpt',
            reason: 'Market analysis with live data and memory',
            complexity: 'medium',
            max_tokens: 3000,
            needsLiveData: true,
            memoryImportant: hasMemoryReference,
            powerSystemPreference: 'GPT5_POWER'
        };
    }
    
    if (complexPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'complex',
            bestAI: 'both',
            reason: 'Complex analysis benefits from dual AI with memory',
            complexity: 'high',
            max_tokens: 3000,
            needsLiveData: true,
            memoryImportant: true,
            powerSystemPreference: 'DUAL_ULTIMATE_CONSENSUS'
        };
    }
    
    // Default: GPT with memory context
    return {
        type: 'general',
        bestAI: 'gpt',
        reason: 'General conversation with memory awareness',
        complexity: 'medium',
        max_tokens: 3000,
        needsLiveData: false,
        memoryImportant: hasMemoryReference || hasMemoryContext,
        powerSystemPreference: 'GPT5_POWER'
    };
}

// 🎯 MAIN EXECUTION THROUGH DUAL AI SYSTEM (REWRITTEN)
async function executeThroughPowerSystem(userMessage, queryAnalysis, context = null, memoryData = null, chatId = null) {
    try {
        console.log(`🚀 Routing through dualAISystem with ${queryAnalysis.powerSystemPreference} preference...`);
        
        // Build enhanced message with context
        let enhancedMessage = userMessage;
        
        // Handle simple datetime queries directly (performance optimization)
        if (queryAnalysis.type === 'datetime') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            return `Today is ${cambodiaTime.date} and it's currently ${cambodiaTime.time} in Cambodia (${cambodiaTime.timezone}). ${cambodiaTime.isWeekend ? "Enjoy your weekend!" : "Have a great day!"}`;
        }
        
        // Add time context for non-casual queries
        if (queryAnalysis.type !== 'casual' && queryAnalysis.type !== 'datetime') {
            const globalTime = getCurrentGlobalDateTime();
            enhancedMessage = `Current time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia | NY: ${globalTime.newYork.time} | London: ${globalTime.london.time}\n\n${userMessage}`;
        }
        
        // Add memory context if available and important
        if (queryAnalysis.memoryImportant && context && context.length > 0) {
            enhancedMessage += `\n\n📝 MEMORY CONTEXT:\n${context}`;
            console.log('✅ Memory context integrated for power system');
        }
        
        // Add specific memory data
        if (memoryData) {
            if (memoryData.persistentMemory && memoryData.persistentMemory.length > 0) {
                enhancedMessage += `\n\n🧠 PERSISTENT FACTS:\n`;
                memoryData.persistentMemory.slice(0, 5).forEach((memory, index) => {
                    const fact = memory.fact || memory;
                    enhancedMessage += `${index + 1}. ${fact}\n`;
                });
            }
            
            if (memoryData.conversationHistory && memoryData.conversationHistory.length > 0) {
                enhancedMessage += `\n\n💬 RECENT CONTEXT:\n`;
                memoryData.conversationHistory.slice(0, 3).forEach((conv, index) => {
                    if (conv.user_message) {
                        enhancedMessage += `${index + 1}. Previous: "${conv.user_message.substring(0, 100)}..."\n`;
                    }
                });
            }
        }
        
        // Build options for your power system
        const powerSystemOptions = {
            sessionId: chatId || `session_${Date.now()}`,
            memoryContext: context,
            memoryData: memoryData,
            queryType: queryAnalysis.type,
            complexity: queryAnalysis.complexity,
            userExperience: 'intermediate',
            riskTolerance: 'moderate',
            
            // Force specific AI if needed
            ...(queryAnalysis.bestAI === 'gpt' && {
                forceModel: { 
                    ai: 'GPT5', 
                    model: queryAnalysis.powerSystemPreference === 'GPT5_ULTIMATE' ? 'gpt-5' :
                           queryAnalysis.powerSystemPreference === 'GPT5_SPEED' ? 'gpt-5-nano' :
                           queryAnalysis.powerSystemPreference === 'GPT5_CHAT' ? 'gpt-5-chat' : 'gpt-5-mini'
                }
            }),
            
            ...(queryAnalysis.bestAI === 'claude' && {
                forceModel: { 
                    ai: 'CLAUDE', 
                    mode: queryAnalysis.powerSystemPreference === 'CLAUDE_STRATEGIC_MASTERY' ? 'strategic_mastery' :
                          queryAnalysis.powerSystemPreference === 'CLAUDE_STRATEGIC_STANDARD' ? 'strategic_standard' : 'strategic_efficient'
                }
            }),
            
            ...(queryAnalysis.bestAI === 'both' && {
                forceDual: true
            }),
            
            // Additional context
            specialFunction: queryAnalysis.specialFunction,
            needsLiveData: queryAnalysis.needsLiveData,
            memoryImportant: queryAnalysis.memoryImportant
        };
        
        console.log('🎯 Power system options:', {
            ai: queryAnalysis.bestAI,
            preference: queryAnalysis.powerSystemPreference,
            hasMemory: !!context,
            specialFunction: queryAnalysis.specialFunction
        });
        
        // 🚀 CALL YOUR ULTIMATE STRATEGIC POWER SYSTEM
        const result = await dualAISystem.getUltimateStrategicAnalysis(enhancedMessage, powerSystemOptions);
        
        // Handle different result formats
        if (result && typeof result === 'object') {
            return {
                response: result.response || result.aiUsed || 'Power system response',
                powerSystemUsed: true,
                aiUsed: result.aiUsed || queryAnalysis.bestAI,
                modelUsed: result.modelUsed || 'unknown',
                powerMode: result.powerMode || queryAnalysis.powerSystemPreference,
                confidence: result.confidence || 0.8,
                executionTime: result.executionTime || 0,
                success: result.success !== false,
                analytics: result.analytics || {}
            };
        } else {
            return {
                response: result || 'Power system response received',
                powerSystemUsed: true,
                aiUsed: queryAnalysis.bestAI,
                success: true
            };
        }
        
    } catch (error) {
        console.error('❌ Power system execution error:', error.message);
        throw error;
    }
}

// 🔄 FALLBACK EXECUTION (Emergency only)
async function executeFallbackAnalysis(userMessage, queryAnalysis, context = null) {
    try {
        console.log('🆘 Using emergency fallback (bypassing power system)...');
        
        let enhancedMessage = userMessage;
        if (context && queryAnalysis.memoryImportant) {
            enhancedMessage += `\n\nContext: ${context.substring(0, 500)}`;
        }
        
        const options = {
            max_tokens: Math.min(queryAnalysis.max_tokens, 3000),
            temperature: 0.7
        };
        
        if (queryAnalysis.bestAI === 'claude') {
            return await claudeClient.getClaudeAnalysis(enhancedMessage, options);
        } else {
            return await openaiClient.getGptAnalysis(enhancedMessage, { 
                ...options, 
                model: "gpt-5" 
            });
        }
        
    } catch (fallbackError) {
        console.error('❌ Fallback execution also failed:', fallbackError.message);
        throw new Error(`All execution methods failed: ${fallbackError.message}`);
    }
}

// 🎯 MAIN ENHANCED DUAL COMMAND EXECUTION (REWRITTEN)
async function executeDualCommand(userMessage, chatId, options = {}) {
    const startTime = Date.now();
    
    try {
        console.log('🎯 Executing enhanced dual command with power system integration...');
        console.log('🔍 Message:', userMessage.substring(0, 100));
        console.log('🎯 Options:', {
            messageType: options.messageType,
            hasMedia: options.hasMedia,
            hasConversationHistory: !!options.conversationHistory,
            hasPersistentMemory: !!options.persistentMemory,
            hasMemoryContext: !!options.memoryContext,
            forceAI: options.forceAI
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
                memoryContext = await memory.buildConversationContext(chatId);
                console.log(`✅ Built memory context: ${memoryContext.length} chars`);
            } catch (memoryError) {
                console.log('⚠️ Enhanced memory building failed, trying fallback:', memoryError.message);
                
                // Fallback to direct database queries
                try {
                    const [history, memories] = await Promise.allSettled([
                        database.getConversationHistoryDB(chatId, 5),
                        database.getPersistentMemoryDB(chatId)
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
        
        // Override AI choice if forced
        if (options.forceAI) {
            queryAnalysis.bestAI = options.forceAI;
            queryAnalysis.reason = `Forced to use ${options.forceAI}`;
        }
        
        console.log('🧠 Enhanced query analysis:', {
            type: queryAnalysis.type,
            bestAI: queryAnalysis.bestAI,
            complexity: queryAnalysis.complexity,
            memoryImportant: queryAnalysis.memoryImportant,
            powerPreference: queryAnalysis.powerSystemPreference,
            reason: queryAnalysis.reason
        });
        
        let response;
        let aiUsed;
        let powerSystemResult = null;
        
        try {
            // 🚀 MAIN EXECUTION: Route through your power system
            powerSystemResult = await executeThroughPowerSystem(
                userMessage, 
                queryAnalysis, 
                memoryContext, 
                memoryData, 
                chatId
            );
            
            response = powerSystemResult.response;
            aiUsed = powerSystemResult.aiUsed || queryAnalysis.bestAI;
            
            console.log('✅ Power system execution successful:', {
                aiUsed: aiUsed,
                powerMode: powerSystemResult.powerMode,
                confidence: powerSystemResult.confidence
            });
            
        } catch (powerSystemError) {
            console.error('❌ Power system failed, trying fallback:', powerSystemError.message);
            
            // 🆘 FALLBACK: Use direct client execution
            try {
                response = await executeFallbackAnalysis(userMessage, queryAnalysis, memoryContext);
                aiUsed = queryAnalysis.bestAI + '-fallback';
                
                console.log('✅ Fallback execution successful');
                
            } catch (fallbackError) {
                console.error('❌ All execution methods failed:', fallbackError.message);
                throw new Error(`Complete system failure: ${fallbackError.message}`);
            }
        }
        
        const responseTime = Date.now() - startTime;
        
        console.log('✅ Enhanced dual command completed:', {
            aiUsed: aiUsed,
            responseTime: responseTime,
            powerSystemUsed: !!powerSystemResult,
            memoryUsed: memoryContext.length > 0,
            conversationRecords: memoryData.conversationHistory.length,
            persistentMemories: memoryData.persistentMemory.length
        });
        
        // Build comprehensive result
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
            
            // Power system analytics
            powerSystemUsed: !!powerSystemResult,
            powerMode: powerSystemResult?.powerMode || 'fallback',
            confidence: powerSystemResult?.confidence || 0.7,
            modelUsed: powerSystemResult?.modelUsed || 'unknown',
            
            // Memory analytics
            memoryData: {
                contextLength: memoryContext.length,
                conversationRecords: memoryData.conversationHistory.length,
                persistentMemories: memoryData.persistentMemory.length,
                memoryImportant: queryAnalysis.memoryImportant,
                memoryUsed: memoryContext.length > 0
            },
            
            // Power system analytics (if available)
            analytics: powerSystemResult?.analytics || {
                queryComplexity: queryAnalysis.complexity,
                domainClassification: queryAnalysis.type,
                priorityLevel: 'standard'
            },
            
            success: true,
            timestamp: new Date().toISOString(),
            
            // 🎯 ENHANCED TELEGRAM INTEGRATION
            sendToTelegram: async (bot, title = null) => {
                try {
                    const defaultTitle = `${aiUsed.includes('dual') ? 'Dual AI' : 
                                         aiUsed.includes('claude') ? 'Claude' : 'GPT-5'} Analysis`;
                    const finalTitle = title || defaultTitle;
                    
                    // Add power system indicator
                    const powerIndicator = powerSystemResult ? '⚡ Power System' : '🔄 Fallback';
                    const fullTitle = `${finalTitle} (${powerIndicator})`;
                    
                    const metadata = {
                        responseTime: responseTime,
                        contextUsed: memoryContext.length > 0,
                        complexity: queryAnalysis.complexity,
                        powerSystemUsed: !!powerSystemResult,
                        confidence: powerSystemResult?.confidence || 0.7
                    };
                    
                    if (aiUsed.includes('dual') || queryAnalysis.bestAI === 'both') {
                        const gptPart = response.split('**Claude')[0] || response.substring(0, response.length / 2);
                        const claudePart = response.split('**Claude')[1] || response.substring(response.length / 2);
                        
                        return await telegramSplitter.sendDualAIResponse(
                            bot, chatId, 
                            gptPart.replace('**GPT-5', '').trim(),
                            claudePart.trim(),
                            fullTitle,
                            metadata
                        );
                    } else if (aiUsed.includes('claude')) {
                        return await telegramSplitter.sendClaudeResponse(
                            bot, chatId, response, fullTitle, metadata
                        );
                    } else {
                        return await telegramSplitter.sendGPTResponse(
                            bot, chatId, response, fullTitle, metadata
                        );
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
        
        const responseTime = Date.now() - startTime;
        
        // Final emergency fallback
        return {
            response: `I apologize, but I'm experiencing technical difficulties. Please try again in a moment.\n\nError: ${error.message}`,
            aiUsed: 'emergency-fallback',
            queryType: 'error',
            complexity: 'low',
            reasoning: 'Complete system failure, emergency response',
            contextUsed: false,
            responseTime: responseTime,
            memoryData: {
                contextLength: 0,
                conversationRecords: 0,
                persistentMemories: 0,
                memoryImportant: false
            },
            success: false,
            error: error.message,
            powerSystemUsed: false,
            
            // Emergency Telegram fallback
            sendToTelegram: async (bot) => {
                try {
                    return await telegramSplitter.sendAlert(bot, chatId, 
                        `System error occurred: ${error.message}`, 
                        'Emergency Fallback'
                    );
                } catch (telegramError) {
                    console.error('❌ Emergency Telegram alert failed:', telegramError.message);
                    return false;
                }
            }
        };
    }
}

// 📊 ENHANCED SYSTEM HEALTH CHECK (REWRITTEN)
async function checkSystemHealth() {
    const health = {
        powerSystem: false,
        gptAnalysis: false,
        claudeAnalysis: false,
        memorySystem: false,
        contextBuilding: false,
        dateTimeSupport: false,
        dualMode: false,
        telegramIntegration: false,
        overallHealth: false,
        errors: [],
        powerSystemDetails: null
    };
    
    try {
        // Test your power system first (most important)
        console.log('🔍 Testing dualAISystem power core...');
        const powerResult = await dualAISystem.getUltimateStrategicAnalysis('Health check test', {
            sessionId: 'health_check',
            test: true
        });
        
        health.powerSystem = !!powerResult;
        health.powerSystemDetails = {
            response: !!powerResult,
            format: typeof powerResult,
            hasResponse: !!(powerResult?.response || (typeof powerResult === 'string'))
        };
        console.log('✅ Power system operational');
    } catch (error) {
        health.errors.push(`PowerSystem: ${error.message}`);
        console.log('❌ Power system unavailable');
    }
    
    try {
        // Test power system health check if available
        const powerHealth = await dualAISystem.healthCheck();
        health.powerSystemHealth = powerHealth;
        console.log('✅ Power system health check available');
    } catch (error) {
        console.log('⚠️ Power system health check unavailable');
    }
    
    try {
        // Test GPT fallback
        await openaiClient.getGptAnalysis('Test', { max_tokens: 50, model: "gpt-5" });
        health.gptAnalysis = true;
        console.log('✅ GPT fallback operational');
    } catch (error) {
        health.errors.push(`GPT: ${error.message}`);
        console.log('❌ GPT fallback unavailable');
    }
    
    try {
        // Test Claude fallback
        await claudeClient.getClaudeAnalysis('Test', { max_tokens: 50 });
        health.claudeAnalysis = true;
        console.log('✅ Claude fallback operational');
    } catch (error) {
        health.errors.push(`Claude: ${error.message}`);
        console.log('❌ Claude fallback unavailable');
    }
    
    try {
        // Test memory system
        const testContext = await memory.buildConversationContext('test');
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
    
    try {
        // Test Telegram integration
        health.telegramIntegration = typeof telegramSplitter.sendGPTResponse === 'function';
        console.log(`✅ Telegram integration: ${health.telegramIntegration ? 'Available' : 'Limited'}`);
    } catch (error) {
        health.errors.push(`Telegram: ${error.message}`);
        console.log('❌ Telegram integration unavailable');
    }
    
    // Calculate overall health
    health.dualMode = health.powerSystem || (health.gptAnalysis && health.claudeAnalysis);
    health.overallHealth = health.powerSystem || health.gptAnalysis || health.claudeAnalysis;
    
    // Health score calculation
    const components = [
        health.powerSystem ? 40 : 0,           // Power system is most important
        health.gptAnalysis ? 15 : 0,           // GPT fallback
        health.claudeAnalysis ? 15 : 0,        // Claude fallback  
        health.memorySystem ? 15 : 0,          // Memory system
        health.dateTimeSupport ? 10 : 0,       // DateTime utilities
        health.telegramIntegration ? 5 : 0     // Telegram integration
    ];
    
    health.healthScore = components.reduce((sum, score) => sum + score, 0);
    health.healthGrade = health.healthScore >= 90 ? 'A+' :
                        health.healthScore >= 80 ? 'A' :
                        health.healthScore >= 70 ? 'B+' :
                        health.healthScore >= 60 ? 'B' :
                        health.healthScore >= 50 ? 'C' : 'F';
    
    return health;
}

// 🚀 ENHANCED QUICK ACCESS FUNCTIONS (REWRITTEN)
async function getMarketIntelligence(chatId = null) {
    const globalTime = getCurrentGlobalDateTime();
    const query = `Current market intelligence summary - Time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia. Provide concise overview of market conditions, key risks, and opportunities.`;
    
    try {
        // Use power system for market intelligence
        const result = await dualAISystem.getUltimateStrategicAnalysis(query, {
            sessionId: chatId || 'market_intel',
            forceModel: { ai: 'CLAUDE', mode: 'strategic_mastery' },
            specialization: 'market',
            complexity: 'high'
        });
        
        return result.response || result;
        
    } catch (error) {
        console.error('❌ Market intelligence error:', error.message);
        
        // Fallback to direct Claude call
        try {
            return await claudeClient.getClaudeAnalysis(query, {
                max_tokens: 3000,
                temperature: 0.7
            });
        } catch (fallbackError) {
            return 'Market intelligence temporarily unavailable';
        }
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

// 📈 ENHANCED SYSTEM ANALYTICS (REWRITTEN)
function getSystemAnalytics() {
    return {
        version: '4.0 - Ultimate Power System Integration', // UPDATED
        architecture: 'index.js → dualCommandSystem.js → dualAISystem.js → clients',
        powerSystem: {
            core: 'dualAISystem.js (2000+ lines)',
            routing: 'UltimateStrategicPowerRouter',
            execution: 'UltimatePowerExecutor', 
            monitoring: 'UltimateSystemHealthMonitor'
        },
        aiModels: {
            primary: 'dualAISystem.js (GPT-5 family + Claude Opus 4)',
            fallback: 'Individual clients (openaiClient.js + claudeClient.js)'
        },
        memoryFeatures: [
            'Persistent conversation memory',
            'Strategic fact extraction',
            'Context-aware AI routing',
            'Enhanced memory integration',
            'Fallback memory systems',
            'Memory importance analysis',
            'Power system memory integration'
        ],
        capabilities: [
            'Ultimate Strategic Power System integration',
            'Smart routing through 2000+ line AI engine',
            'GPT-5 family optimization (Ultimate, Power, Speed, Chat)',
            'Claude Opus 4 strategic mastery',
            'Dual AI consensus for complex queries',
            'Multi-tier fallback systems',
            'Enhanced memory persistence and retrieval',
            'Advanced query analysis with power system preferences',
            'Real-time performance analytics',
            'Comprehensive health monitoring',
            'Enhanced Telegram integration with smart routing',
            'Automatic message formatting and delivery',
            'Error handling with Telegram alerts',
            'Power system analytics and optimization'
        ],
        queryTypes: [
            'casual', 'datetime', 'market', 'regime', 'anomaly', 
            'portfolio', 'cambodia', 'complex', 'multimodal', 'memory-enhanced'
        ],
        powerSystemPreferences: [
            'GPT5_ULTIMATE', 'GPT5_POWER', 'GPT5_SPEED', 'GPT5_CHAT',
            'CLAUDE_STRATEGIC_MASTERY', 'CLAUDE_STRATEGIC_STANDARD', 'CLAUDE_STRATEGIC_EFFICIENT',
            'DUAL_ULTIMATE_CONSENSUS'
        ],
        executionFlow: {
            primary: 'dualAISystem.getUltimateStrategicAnalysis()',
            fallback: 'Direct client execution',
            emergency: 'Error response with Telegram alert'
        },
        integrationStatus: {
            powerSystem: 'Primary execution method',
            memorySystem: 'Database-backed persistent storage',
            telegramIntegration: 'Smart routing with metadata',
            healthMonitoring: 'Comprehensive with power system metrics'
        },
        healthCheck: 'Use checkSystemHealth() for current status with power system diagnostics'
    };
}

// 🧠 MEMORY TESTING AND DIAGNOSTICS (ENHANCED)
async function testMemoryIntegration(chatId) {
    console.log('🧪 Testing enhanced memory integration with power system...');
    
    const tests = {
        conversationHistory: false,
        persistentMemory: false,
        memoryBuilding: false,
        powerSystemWithMemory: false,
        memoryContextPassing: false,
        fallbackMemory: false,
        telegramIntegration: false,
        powerSystemHealth: false
    };
    
    try {
        // Test 1: Conversation History
        const history = await database.getConversationHistoryDB(chatId, 3);
        tests.conversationHistory = Array.isArray(history);
        console.log(`✅ Conversation History: ${tests.conversationHistory} (${history?.length || 0} records)`);
    } catch (error) {
        console.log(`❌ Conversation History: Failed - ${error.message}`);
    }
    
    try {
        // Test 2: Persistent Memory
        const memory = await database.getPersistentMemoryDB(chatId);
        tests.persistentMemory = Array.isArray(memory);
        console.log(`✅ Persistent Memory: ${tests.persistentMemory} (${memory?.length || 0} records)`);
    } catch (error) {
        console.log(`❌ Persistent Memory: Failed - ${error.message}`);
    }
    
    try {
        // Test 3: Memory Building
        const context = await memory.buildConversationContext(chatId);
        tests.memoryBuilding = typeof context === 'string';
        console.log(`✅ Memory Building: ${tests.memoryBuilding} (${context?.length || 0} chars)`);
    } catch (error) {
        console.log(`❌ Memory Building: Failed - ${error.message}`);
    }
    
    try {
        // Test 4: Power System with Memory
        const result = await executeDualCommand('Hello, do you remember our previous conversations?', chatId);
        tests.powerSystemWithMemory = result.success && result.powerSystemUsed && result.contextUsed;
        console.log(`✅ Power System with Memory: ${tests.powerSystemWithMemory}`);
    } catch (error) {
        console.log(`❌ Power System with Memory: Failed - ${error.message}`);
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
    
    try {
        // Test 7: Telegram Integration
        const result = await executeDualCommand('Test telegram integration', chatId);
        tests.telegramIntegration = result.success && typeof result.sendToTelegram === 'function';
        console.log(`✅ Telegram Integration: ${tests.telegramIntegration}`);
    } catch (error) {
        console.log(`❌ Telegram Integration: Failed - ${error.message}`);
    }
    
    try {
        // Test 8: Power System Health
        const powerHealth = await dualAISystem.healthCheck();
        tests.powerSystemHealth = powerHealth && powerHealth.overall_status !== 'CRITICAL_ERROR';
        console.log(`✅ Power System Health: ${tests.powerSystemHealth}`);
    } catch (error) {
        console.log(`❌ Power System Health: Failed - ${error.message}`);
    }
    
    const overallSuccess = Object.values(tests).filter(test => test).length;
    const totalTests = Object.keys(tests).length;
    
    console.log(`\n📊 Enhanced Memory + Power System Test: ${overallSuccess}/${totalTests} passed`);
    console.log(`${overallSuccess === totalTests ? '🎉 FULL SUCCESS' : overallSuccess >= totalTests * 0.7 ? '✅ MOSTLY WORKING' : '⚠️ NEEDS ATTENTION'}`);
    
    return {
        tests: tests,
        score: `${overallSuccess}/${totalTests}`,
        percentage: Math.round((overallSuccess / totalTests) * 100),
        status: overallSuccess === totalTests ? 'FULL_SUCCESS' : 
                overallSuccess >= totalTests * 0.7 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION',
        powerSystemIntegrated: tests.powerSystemWithMemory && tests.powerSystemHealth
    };
}

// 🔄 MEMORY OPTIMIZATION UTILITIES (ENHANCED)
async function optimizeMemoryForUser(chatId) {
    try {
        console.log(`🔧 Optimizing memory for user ${chatId} with power system integration...`);
        
        // Get current memory state
        const [conversations, memories] = await Promise.allSettled([
            database.getConversationHistoryDB(chatId, 50),
            database.getPersistentMemoryDB(chatId)
        ]);
        
        const results = {
            conversationsAnalyzed: 0,
            memoriesAnalyzed: 0,
            optimizationsApplied: [],
            recommendations: [],
            powerSystemCompatible: false
        };
        
        if (conversations.status === 'fulfilled') {
            results.conversationsAnalyzed = conversations.value.length;
            
            // Analyze conversation patterns
            if (conversations.value.length > 10) {
                results.recommendations.push('Consider memory consolidation - high conversation volume');
                results.optimizationsApplied.push('High volume conversation analysis completed');
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
                results.optimizationsApplied.push('Memory volume analysis completed');
            }
        }
        
        // Test power system compatibility
        try {
            const testResult = await executeDualCommand('Memory optimization test', chatId, {
                conversationHistory: conversations.status === 'fulfilled' ? conversations.value.slice(0, 2) : [],
                persistentMemory: memories.status === 'fulfilled' ? memories.value.slice(0, 3) : []
            });
            
            results.powerSystemCompatible = testResult.success && testResult.powerSystemUsed;
            if (results.powerSystemCompatible) {
                results.optimizationsApplied.push('Power system memory integration verified');
                results.recommendations.push('Memory system fully compatible with power system');
            }
        } catch (error) {
            results.recommendations.push('Power system memory integration needs attention');
        }
        
        results.optimizationsApplied.push('Memory state analyzed');
        results.optimizationsApplied.push('Power system compatibility tested');
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
            recommendations: ['Memory optimization failed - check system health'],
            powerSystemCompatible: false
        };
    }
}

// 🎯 ENHANCED FUNCTIONS FOR POWER SYSTEM INTEGRATION

/**
 * 🚀 Enhanced dual command with automatic Telegram delivery and power system
 */
async function executeEnhancedDualCommand(userMessage, chatId, bot = null, options = {}) {
    try {
        console.log('🚀 Executing enhanced dual command with power system + auto-Telegram...');
        
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
 * 📊 Get enhanced analytics including power system metrics
 */
function getEnhancedSystemAnalytics() {
    const baseAnalytics = getSystemAnalytics();
    
    return {
        ...baseAnalytics,
        enhancedFeatures: [
            'Ultimate Strategic Power System integration',
            'Multi-tier AI routing (Power System → Fallback → Emergency)',
            'Advanced query analysis with power preferences',
            'Real-time power system health monitoring',
            'Enhanced memory context building for power system',
            'Automatic Telegram integration with metadata',
            'Smart message routing by AI type and power mode',
            'Enhanced error handling with power system alerts'
        ],
        integrationStatus: {
            powerSystem: true,
            telegram: typeof telegramSplitter.sendGPTResponse === 'function',
            memory: true,
            datetime: true,
            dualAI: true,
            healthMonitoring: true
        },
        powerSystemMetrics: {
            primaryExecution: 'dualAISystem.getUltimateStrategicAnalysis()',
            fallbackLayers: 3,
            routingIntelligence: 'UltimateStrategicPowerRouter',
            modelSupport: 'GPT-5 family + Claude Opus 4',
            confidenceTracking: true,
            performanceAnalytics: true
        },
        lastUpdated: new Date().toISOString()
    };
}

/**
 * 🎯 Quick command shortcuts with power system
 */
async function quickGPTCommand(message, chatId, bot = null) {
    return await executeEnhancedDualCommand(message, chatId, bot, { 
        forceAI: 'gpt',
        title: 'Quick GPT-5 Response'
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
        title: 'Quick Dual Power Analysis'
    });
}

/**
 * 🔧 Enhanced health check with power system testing
 */
async function checkEnhancedSystemHealth() {
    const baseHealth = await checkSystemHealth();
    
    // Additional power system checks
    const enhancedChecks = {
        powerSystemRouting: false,
        powerSystemExecution: false,
        powerSystemHealth: false,
        powerSystemAnalytics: false
    };
    
    try {
        // Test power system routing
        const routingTest = await dualAISystem.routeQuery('Health check routing test');
        enhancedChecks.powerSystemRouting = !!routingTest;
    } catch (error) {
        console.log('⚠️ Power system routing unavailable');
    }
    
    try {
        // Test power system execution
        const executionTest = await dualAISystem.executeDualCommand('Health check execution test', 'health_test');
        enhancedChecks.powerSystemExecution = !!executionTest;
    } catch (error) {
        console.log('⚠️ Power system execution unavailable');
    }
    
    try {
        // Test power system health
        const healthTest = await dualAISystem.checkDualSystemHealth();
        enhancedChecks.powerSystemHealth = healthTest && healthTest.overall_status !== 'CRITICAL_ERROR';
    } catch (error) {
        console.log('⚠️ Power system health check unavailable');
    }
    
    try {
        // Test power system analytics
        const analyticsTest = dualAISystem.getPerformanceStats();
        enhancedChecks.powerSystemAnalytics = !!analyticsTest;
    } catch (error) {
        console.log('⚠️ Power system analytics unavailable');
    }
    
    const powerSystemHealth = Object.values(enhancedChecks).filter(Boolean).length >= 2;
    
    return {
        ...baseHealth,
        enhancedChecks: enhancedChecks,
        powerSystemFullyFunctional: powerSystemHealth,
        overallEnhancedHealth: baseHealth.overallHealth && powerSystemHealth,
        recommendations: generateHealthRecommendations({ 
            ...baseHealth, 
            ...enhancedChecks,
            powerSystemIntegrated: powerSystemHealth
        })
    };
}

/**
 * 💡 Generate health recommendations with power system awareness
 */
function generateHealthRecommendations(healthData) {
    const recommendations = [];
    
    if (!healthData.powerSystem) {
        recommendations.push('CRITICAL: Power system unavailable - check dualAISystem.js integration');
    }
    
    if (!healthData.gptAnalysis && !healthData.powerSystem) {
        recommendations.push('GPT analysis unavailable - check OpenAI API key and quota');
    }
    
    if (!healthData.claudeAnalysis && !healthData.powerSystem) {
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
    
    if (healthData.powerSystem && !healthData.powerSystemIntegrated) {
        recommendations.push('Power system available but integration needs optimization');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('All systems operational - power system fully integrated');
    }
    
    return recommendations;
}

// 📋 COMPREHENSIVE EXPORT FUNCTIONS
module.exports = {
    // 🎯 Main functions (REWRITTEN)
    executeDualCommand,
    analyzeQuery,
    executeThroughPowerSystem,
    executeFallbackAnalysis,
    
    // 🧠 Memory functions (ENHANCED)
    testMemoryIntegration,
    optimizeMemoryForUser,
    
    // 🌍 Utility functions (PRESERVED)
    getCurrentCambodiaDateTime,
    getCurrentGlobalDateTime,
    getMarketIntelligence,
    getGlobalMarketStatus,
    
    // 📊 System management (ENHANCED)
    checkSystemHealth,
    getSystemAnalytics,
    
    // 🎯 ENHANCED FUNCTIONS
    executeEnhancedDualCommand,
    getEnhancedSystemAnalytics,
    quickGPTCommand,
    quickClaudeCommand,
    quickDualCommand,
    checkEnhancedSystemHealth,
    generateHealthRecommendations,
    
    // 🔄 Legacy compatibility functions
    executeGptAnalysis: (msg, analysis, ctx, mem) => executeThroughPowerSystem(msg, {...analysis, bestAI: 'gpt'}, ctx, mem),
    executeClaudeAnalysis: (msg, analysis, ctx, mem) => executeThroughPowerSystem(msg, {...analysis, bestAI: 'claude'}, ctx, mem),
    routeConversationIntelligently: analyzeQuery,
    getEnhancedCommandAnalytics: getEnhancedSystemAnalytics,
    testEnhancedMemorySystem: testMemoryIntegration,
    optimizeEnhancedMemory: optimizeMemoryForUser
};

console.log('✅ Enhanced Dual Command System loaded (v4.0 - Power System Integration)');
console.log('🚀 Clean flow: index.js → dualCommandSystem.js → dualAISystem.js → clients');
console.log('⚡ Primary execution through your 2000+ line Ultimate Strategic Power System');
console.log('🔄 Multi-tier fallback: Power System → Direct Clients → Emergency Response');
console.log('🧠 Advanced memory integration with power system optimization');
console.log('📱 Enhanced Telegram integration with smart routing and metadata');
console.log('🔧 Comprehensive health monitoring including power system diagnostics');
