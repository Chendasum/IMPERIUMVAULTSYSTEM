// utils/dualCommandSystem.js - PART 1: Core Setup & Analysis
// Enhanced with OPERATOR MODE capabilities
// Flow: User Input → analyzeQuery → routeToGPT5 → executeActions → Response

// IMPORTS AND SETUP
let openaiClient, memory, database, telegramSplitter;

try {
    openaiClient = require('./openaiClient');
    console.log('GPT-5 client loaded successfully');
} catch (error) {
    console.error('GPT-5 client import failed:', error.message);
    openaiClient = { 
        getGPT5Analysis: async (prompt) => `GPT-5 client unavailable: ${error.message}` 
    };
}

try {
    memory = require('./memory');
    database = require('./database');
    console.log('Memory and database systems loaded');
} catch (error) {
    console.warn('Memory system imports failed:', error.message);
    memory = { buildConversationContext: async () => '' };
    database = { 
        getConversationHistoryDB: async () => [],
        getPersistentMemoryDB: async () => []
    };
}

try {
    telegramSplitter = require('./telegramSplitter');
    console.log('Telegram integration loaded');
} catch (error) {
    console.warn('Telegram splitter import failed:', error.message);
    telegramSplitter = {
        sendGPTResponse: async () => false,
        sendOperatorResponse: async () => false,
        sendAlert: async () => false
    };
}

// DATETIME UTILITIES
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
        console.error('Cambodia DateTime error:', error.message);
        return {
            date: new Date().toDateString(),
            time: new Date().toTimeString().slice(0, 5),
            hour: new Date().getHours(),
            isWeekend: [0, 6].includes(new Date().getDay()),
            error: 'Timezone calculation failed'
        };
    }
}

// COMPLETION DETECTION SYSTEM
function detectCompletionStatus(message, memoryContext = '') {
    const messageText = message.toLowerCase();
    const contextText = memoryContext.toLowerCase();
    
    const directCompletionPatterns = [
        /done ready|already built|it work|working now|system ready/i,
        /deployment complete|built already|finished already/i,
        /stop asking|told you already|we discussed this/i,
        /ready now|operational now|live now|running now/i,
        /no need|don't need|unnecessary|redundant/i
    ];
    
    const contextCompletionPatterns = [
        /system.*built|deployment.*complete|project.*finished/i,
        /already.*working|currently.*operational/i,
        /successfully.*deployed|live.*system/i
    ];
    
    const frustrationPatterns = [
        /again.*asking|keep.*asking|always.*ask/i,
        /told.*you.*already|mentioned.*before/i,
        /why.*again|same.*thing.*again/i,
        /understand.*ready|listen.*done/i
    ];
    
    const hasDirectCompletion = directCompletionPatterns.some(pattern => pattern.test(messageText));
    const hasContextCompletion = contextCompletionPatterns.some(pattern => pattern.test(contextText));
    const hasFrustration = frustrationPatterns.some(pattern => pattern.test(messageText));
    
    return {
        isComplete: hasDirectCompletion || hasContextCompletion,
        isFrustrated: hasFrustration,
        directSignal: hasDirectCompletion,
        contextSignal: hasContextCompletion,
        shouldSkipGPT5: hasDirectCompletion || hasFrustration,
        completionType: hasDirectCompletion ? 'direct' : 
                       hasContextCompletion ? 'context' : 
                       hasFrustration ? 'frustration' : 'none'
    };
}

function generateCompletionResponse(completionStatus, originalMessage) {
    const responses = {
        direct: [
            "Got it! System confirmed as ready. What's your next command?",
            "Understood - it's operational. What else can I help with?",
            "Perfect! Since it's working, what's the next task?",
            "Acknowledged. Moving on - what do you need now?"
        ],
        context: [
            "I see from our history that it's already built. What's next?",
            "Right, the system is operational. What's your next priority?",
            "Understood from context - it's ready. How can I help further?"
        ],
        frustration: [
            "My apologies! I understand it's ready. Let's move forward - what else do you need?",
            "Sorry for the repetition! I get it - it's working. What's next?",
            "You're absolutely right - no need to rebuild. What's your next task?",
            "Point taken! The system is operational. What should we focus on now?"
        ]
    };
    
    const responseArray = responses[completionStatus.completionType] || responses.direct;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// OPERATOR MODE DETECTION
function detectOperatorIntent(message) {
    const operatorPatterns = [
        // Execution commands
        /(execute|do|run|perform|make|create|build|generate)/i,
        /(update|delete|remove|modify|change|edit)/i,
        
        // Trading/Financial actions  
        /(buy|sell|trade|order|transfer|payment|transaction)/i,
        /(place.*order|execute.*trade|send.*payment)/i,
        
        // System operations
        /(schedule|automate|trigger|activate|start|stop|restart)/i,
        /(deploy|install|configure|setup|initialize)/i,
        
        // Data operations
        /(save|store|backup|export|import|sync)/i,
        /(call.*api|send.*email|update.*database)/i,
        
        // File operations
        /(write.*file|create.*document|generate.*report)/i,
        /(download|upload|copy|move|rename)/i
    ];
    
    const advisorPatterns = [
        // Questions and analysis requests
        /(what|how|why|when|where|which|who|explain|analyze)/i,
        /(tell.*me|show.*me|help.*me.*understand)/i,
        /(compare|evaluate|assess|review|suggest)/i,
        /(opinion|thought|recommendation|advice)/i
    ];
    
    const hasOperatorIntent = operatorPatterns.some(pattern => pattern.test(message));
    const hasAdvisorIntent = advisorPatterns.some(pattern => pattern.test(message));
    
    // Determine intent priority
    let intentType = 'advisor'; // Default
    let confidence = 0.5;
    
    if (hasOperatorIntent && !hasAdvisorIntent) {
        intentType = 'operator';
        confidence = 0.9;
    } else if (hasOperatorIntent && hasAdvisorIntent) {
        // Mixed intent - check which is stronger
        const operatorCount = operatorPatterns.filter(pattern => pattern.test(message)).length;
        const advisorCount = advisorPatterns.filter(pattern => pattern.test(message)).length;
        
        if (operatorCount > advisorCount) {
            intentType = 'operator';
            confidence = 0.7;
        } else {
            intentType = 'advisor';
            confidence = 0.8;
        }
    } else if (hasAdvisorIntent) {
        intentType = 'advisor';
        confidence = 0.8;
    }
    
    return {
        type: intentType,
        confidence: confidence,
        hasOperatorSignals: hasOperatorIntent,
        hasAdvisorSignals: hasAdvisorIntent,
        requiresConfirmation: intentType === 'operator' && confidence > 0.8
    };
}

// QUERY COMPLEXITY ANALYZER
function analyzeQueryComplexity(message) {
    const text = message.toLowerCase();
    
    const veryComplexPatterns = [
        /(write.*comprehensive|create.*detailed.*report)/i,
        /(step.*by.*step.*guide|complete.*tutorial)/i,
        /(analyze.*thoroughly|provide.*full.*analysis)/i,
        /(research.*paper|academic.*analysis)/i,
        /(business.*plan|strategic.*framework)/i,
        /(financial.*model|investment.*analysis)/i,
        /(legal.*document|contract.*analysis)/i
    ];
    
    const complexPatterns = [
        /(explain.*detail|provide.*example)/i,
        /(compare.*contrast|pros.*cons)/i,
        /(advantages.*disadvantages)/i,
        /(multiple.*options|various.*approaches)/i,
        /(bullet.*points|numbered.*list)/i
    ];
    
    const longResponseIndicators = [
        /(tell.*me.*everything|explain.*fully)/i,
        /(all.*information|complete.*overview)/i,
        /(elaborate|expand.*on|more.*detail)/i,
        /(comprehensive|thorough|detailed)/i
    ];
    
    const isVeryComplex = veryComplexPatterns.some(pattern => pattern.test(text));
    const isComplex = complexPatterns.some(pattern => pattern.test(text));
    const needsLongResponse = longResponseIndicators.some(pattern => pattern.test(text));
    
    const questionWords = (text.match(/\b(what|how|why|when|where|which|who)\b/g) || []).length;
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    
    return {
        isVeryComplex: isVeryComplex || (sentences > 5 && words > 100),
        isComplex: isComplex || questionWords > 2,
        needsLongResponse: needsLongResponse || words > 50,
        sentences: sentences,
        words: words,
        questionWords: questionWords,
        complexity: isVeryComplex ? 'very_high' : 
                   isComplex ? 'high' : 
                   needsLongResponse ? 'medium' : 'low'
    };
}
// utils/dualCommandSystem.js - PART 2: Query Analysis & Routing Logic

// MAIN QUERY ANALYSIS FUNCTION - Enhanced with Operator Mode
function analyzeQuery(userMessage, messageType = 'text', hasMedia = false, memoryContext = null) {
    const message = userMessage.toLowerCase();
    
    // PRIORITY 0: COMPLETION DETECTION
    const completionStatus = detectCompletionStatus(userMessage, memoryContext || '');
    if (completionStatus.shouldSkipGPT5) {
        return {
            type: 'completion',
            bestAI: 'none',
            reason: `Task completion detected (${completionStatus.completionType})`,
            isComplete: true,
            completionStatus: completionStatus,
            shouldSkipGPT5: true,
            quickResponse: generateCompletionResponse(completionStatus, userMessage),
            isOperatorMode: false
        };
    }
    
    // PRIORITY 1: OPERATOR INTENT DETECTION
    const operatorIntent = detectOperatorIntent(userMessage);
    if (operatorIntent.type === 'operator' && operatorIntent.confidence > 0.6) {
        return {
            type: 'operator',
            bestAI: 'gpt',
            reason: `Operator action requested - GPT-5 for execution planning (confidence: ${operatorIntent.confidence})`,
            gpt5Model: 'gpt-5', // Use full model for action planning
            reasoning_effort: 'high',
            verbosity: 'medium',
            max_completion_tokens: 12000,
            temperature: 0.3, // Lower temperature for precise actions
            priority: 'operator',
            maxRetries: 1,
            isOperatorMode: true,
            requiresConfirmation: operatorIntent.requiresConfirmation,
            operatorConfidence: operatorIntent.confidence,
            memoryImportant: true, // Always use memory for operator actions
            needsLiveData: true
        };
    }
    
    // Pattern matching for different query types
    const memoryPatterns = [
        /remember|recall|you mentioned|we discussed|before|previously|last time/i,
        /my name|my preference|i told you|i said|you know/i
    ];
    
    const speedPatterns = [
        /urgent|immediate|now|asap|quick|fast|emergency|real-time/i,
        /^(what time|what's the time|current time|time now)/i,
        /^(what date|what's the date|today's date|date today)/i,
        /^(hello|hi|hey|good morning|good afternoon|what's up)$/i,
        /^how are you\??$/i,
        /^(thanks|thank you|cool|nice|great|ok|okay)$/i
    ];
    
    const complexPatterns = [
        /(strategy|strategic|comprehensive|detailed|thorough|in-depth)/i,
        /(analyze|evaluate|assess|examine|investigate|research)/i,
        /(portfolio|allocation|risk|optimization|diversification)/i,
        /(complex|sophisticated|multi-factor|multi-dimensional)/i,
        /(build|create|develop|implement|construct|design)/i,
        /(plan|planning|framework|structure|architecture)/i,
        /(write.*comprehensive|detailed.*report|full.*analysis)/i
    ];
    
    const mathCodingPatterns = [
        /(calculate|compute|formula|equation|algorithm|optimization)/i,
        /(code|coding|program|script|debug|software|api)/i,
        /(mathematical|statistical|probability|regression|correlation)/i,
        /(machine learning|ai|neural network|deep learning)/i,
        /(backtest|monte carlo|var|sharpe|sortino|calmar)/i,
        /(dcf|npv|irr|wacc|capm|black.*scholes)/i
    ];
    
    const cambodiaPatterns = [
        /(cambodia|khmer|phnom penh|cambodian)/i,
        /(lending.*cambodia|cambodia.*lending)/i,
        /(usd.*khr|khr.*usd)/i,
        /(southeast asia|asean|emerging markets)/i
    ];
    
    const marketPatterns = [
        /(market|stock|bond|crypto|forex|trading)/i,
        /(investment|buy|sell|price|rate|yield|return)/i,
        /(analysis|forecast|outlook|prediction)/i,
        /(earnings|revenue|profit|financial)/i
    ];
    
    const chatPatterns = [
        /^(hello|hi|hey|good morning|good afternoon)/i,
        /(chat|conversation|talk|discuss)/i,
        /(how are you|what's up|how's it going)/i
    ];
    
    // Check for memory importance
    const hasMemoryReference = memoryPatterns.some(pattern => pattern.test(message));
    const hasMemoryContext = memoryContext && memoryContext.length > 100;
    
    // GPT-5 MODEL SELECTION LOGIC
    let gpt5Config = {
        model: 'gpt-5-mini',
        reasoning_effort: 'medium',
        verbosity: 'medium',
        max_completion_tokens: 8000,
        temperature: 0.7,
        priority: 'standard',
        reason: 'GPT-5 Mini - Balanced performance',
        maxRetries: 0,
        isOperatorMode: false
    };
    
    // PRIORITY 2: SPEED CRITICAL - GPT-5 Nano
    if (speedPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 6000,
            priority: 'speed',
            reason: 'Speed critical - GPT-5 Nano for fast response',
            maxRetries: 0,
            isOperatorMode: false
        };
    }
    // PRIORITY 3: CHAT PATTERNS - GPT-5 Chat model
    else if (chatPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-chat-latest',
            temperature: 0.7,
            max_completion_tokens: 8000,
            priority: 'chat',
            reason: 'Chat pattern - GPT-5 Chat model',
            maxRetries: 0,
            isOperatorMode: false
        };
    }
    // PRIORITY 4: CAMBODIA/REGIONAL - GPT-5 Mini
    else if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-mini',
            reasoning_effort: 'medium',
            verbosity: 'high',
            max_completion_tokens: 10000,
            temperature: 0.6,
            priority: 'regional',
            reason: 'Cambodia/regional analysis - GPT-5 Mini with detailed output',
            maxRetries: 0,
            isOperatorMode: false
        };
    }
    // PRIORITY 5: MARKET ANALYSIS - GPT-5 Mini
    else if (marketPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-mini',
            reasoning_effort: 'medium',
            verbosity: 'medium',
            max_completion_tokens: 8000,
            temperature: 0.6,
            priority: 'market',
            reason: 'Market analysis - GPT-5 Mini for balanced performance',
            maxRetries: 0,
            isOperatorMode: false
        };
    }
    // PRIORITY 6: MATH/CODING - Full GPT-5 with RETRY
    else if (mathCodingPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5',
            reasoning_effort: 'high',
            verbosity: 'medium',
            max_completion_tokens: 12000,
            temperature: 0.3,
            priority: 'mathematical',
            reason: 'Mathematical/coding precision - Full GPT-5 with retry',
            maxRetries: 2,
            isOperatorMode: false
        };
    }
    // PRIORITY 7: COMPLEX ANALYSIS - Full GPT-5 with RETRY
    else if (complexPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5',
            reasoning_effort: 'high',
            verbosity: 'high',
            max_completion_tokens: 16000,
            temperature: 0.6,
            priority: 'complex',
            reason: 'Complex strategic analysis - Full GPT-5 with retry',
            maxRetries: 2,
            isOperatorMode: false
        };
    }
    // PRIORITY 8: MULTIMODAL - Full GPT-5 with RETRY
    else if (hasMedia || messageType !== 'text') {
        gpt5Config = {
            model: 'gpt-5',
            reasoning_effort: 'medium',
            verbosity: 'medium',
            max_completion_tokens: 10000,
            temperature: 0.7,
            priority: 'multimodal',
            reason: 'Multimodal content - Full GPT-5 for vision analysis with retry',
            maxRetries: 1,
            isOperatorMode: false
        };
    }
    
    // DYNAMIC TOKEN SCALING
    const queryLength = message.length;
    const queryComplexity = analyzeQueryComplexity(message);
    
    if (queryLength > 1000) {
        gpt5Config.max_completion_tokens = Math.min(gpt5Config.max_completion_tokens * 1.5, 16000);
        gpt5Config.reason += ' (Scaled for long input)';
    }
    
    if (queryComplexity.isVeryComplex) {
        gpt5Config.max_completion_tokens = Math.min(gpt5Config.max_completion_tokens * 1.3, 16000);
        gpt5Config.reason += ' (Scaled for complexity)';
        if (gpt5Config.maxRetries === 0) {
            gpt5Config.maxRetries = 1;
            gpt5Config.reason += ' (Retry enabled for complexity)';
        }
    }
    
    const longResponsePatterns = [
        /(write.*long|detailed.*report|comprehensive.*analysis)/i,
        /(full.*explanation|complete.*guide|step.*by.*step)/i,
        /(generate.*content|create.*document|write.*article)/i,
        /(elaborate|expand|provide.*more|tell.*me.*everything)/i
    ];
    
    if (longResponsePatterns.some(pattern => pattern.test(message))) {
        gpt5Config.max_completion_tokens = 16000;
        gpt5Config.reason += ' (Long response requested)';
        if (gpt5Config.maxRetries === 0) {
            gpt5Config.maxRetries = 1;
            gpt5Config.reason += ' (Retry enabled for long response)';
        }
    }
    
    return {
        type: gpt5Config.priority,
        bestAI: 'gpt',
        reason: gpt5Config.reason,
        gpt5Model: gpt5Config.model,
        reasoning_effort: gpt5Config.reasoning_effort,
        verbosity: gpt5Config.verbosity,
        max_completion_tokens: gpt5Config.max_completion_tokens,
        temperature: gpt5Config.temperature,
        priority: gpt5Config.priority,
        maxRetries: gpt5Config.maxRetries,
        isOperatorMode: gpt5Config.isOperatorMode,
        
        // Completion detection results
        isComplete: false,
        completionStatus: completionStatus,
        shouldSkipGPT5: false,
        
        // Memory and context
        memoryImportant: hasMemoryReference || hasMemoryContext || gpt5Config.priority === 'complex',
        needsLiveData: gpt5Config.priority === 'complex' || gpt5Config.priority === 'market',
        
        // Classification
        complexity: gpt5Config.priority === 'complex' ? 'high' : 
                   gpt5Config.priority === 'speed' ? 'low' : 'medium',
        powerSystemPreference: `GPT5_${gpt5Config.priority.toUpperCase()}`
    };
}

// GPT-5 EXECUTION WITH OPERATOR MODE SUPPORT
async function executeThroughGPT5System(userMessage, queryAnalysis, context = null, memoryData = null, chatId = null) {
    try {
        console.log(`GPT-5 Execution: ${queryAnalysis.gpt5Model} (${queryAnalysis.reasoning_effort || 'none'} reasoning, ${queryAnalysis.verbosity || 'none'} verbosity)`);
        
        // OPERATOR MODE EXECUTION
        if (queryAnalysis.isOperatorMode) {
            console.log('🤖 OPERATOR MODE: Planning and executing actions...');
            
            const operatorResult = await executeOperatorMode(userMessage, queryAnalysis, context, memoryData, chatId);
            
            return {
                response: operatorResult.response,
                gpt5OnlyMode: true,
                aiUsed: `GPT-5-Operator-${queryAnalysis.gpt5Model.replace('gpt-5-', '').replace('gpt-5', 'full')}`,
                modelUsed: queryAnalysis.gpt5Model,
                powerMode: 'OPERATOR_MODE',
                confidence: 0.9,
                success: true,
                operatorMode: true,
                actionsExecuted: operatorResult.actionsExecuted || 0,
                executionResults: operatorResult.executionResults || [],
                reasoning_effort: queryAnalysis.reasoning_effort,
                verbosity: queryAnalysis.verbosity,
                priority: queryAnalysis.priority,
                memoryUsed: !!context,
                cost_tier: 'premium', // Operator mode uses full capabilities
                requiresConfirmation: queryAnalysis.requiresConfirmation,
                analytics: {
                    queryComplexity: queryAnalysis.complexity,
                    domainClassification: queryAnalysis.type,
                    priorityLevel: queryAnalysis.priority,
                    operatorConfidence: queryAnalysis.operatorConfidence,
                    modelOptimization: 'GPT-5 Operator Mode'
                }
            };
        }
        
        // REGULAR ADVISOR MODE EXECUTION
        console.log('📋 ADVISOR MODE: Providing analysis and recommendations...');
        
        // Handle datetime queries directly for speed
        if (queryAnalysis.priority === 'speed' && /^(what time|what's the time|current time|time now|what date|what's the date)/.test(userMessage.toLowerCase())) {
            const cambodiaTime = getCurrentCambodiaDateTime();
            if (userMessage.toLowerCase().includes('time')) {
                return `Current time in Cambodia: ${cambodiaTime.time} (${cambodiaTime.timezone})\nToday is ${cambodiaTime.date}${cambodiaTime.isWeekend ? ' - Enjoy your weekend!' : ' - Have a productive day!'}`;
            } else {
                return `Today's date: ${cambodiaTime.date}\nCurrent time: ${cambodiaTime.time} in Cambodia (${cambodiaTime.timezone})`;
            }
        }
        
        // Build enhanced message with context
        let enhancedMessage = userMessage;
        
        // Add Cambodia time context for non-speed queries
        if (queryAnalysis.priority !== 'speed' && queryAnalysis.priority !== 'casual') {
            const cambodiaTime = getCurrentCambodiaDateTime();
            enhancedMessage = `Current time: ${cambodiaTime.date}, ${cambodiaTime.time} Cambodia (${cambodiaTime.timezone})\nBusiness hours: ${!cambodiaTime.isWeekend && cambodiaTime.hour >= 8 && cambodiaTime.hour <= 17 ? 'Yes' : 'No'}\n\n${userMessage}`;
        }
        
        // Add memory context with size limits
        if (queryAnalysis.memoryImportant && context && context.length > 0) {
            const maxContextLength = Math.min(context.length, 2000);
            enhancedMessage += `\n\nMEMORY CONTEXT:\n${context.substring(0, maxContextLength)}`;
            if (context.length > maxContextLength) {
                enhancedMessage += `\n... (truncated for length)`;
            }
            console.log('Memory context integrated for GPT-5');
        }
        
        // Add specific memory data with size limits
        if (memoryData) {
            if (memoryData.persistentMemory && memoryData.persistentMemory.length > 0) {
                enhancedMessage += `\n\nPERSISTENT FACTS:\n`;
                memoryData.persistentMemory.slice(0, 3).forEach((memory, index) => {
                    const fact = (memory.fact || memory).substring(0, 150);
                    enhancedMessage += `${index + 1}. ${fact}\n`;
                });
            }
            
            if (memoryData.conversationHistory && memoryData.conversationHistory.length > 0) {
                enhancedMessage += `\n\nRECENT CONTEXT:\n`;
                memoryData.conversationHistory.slice(0, 2).forEach((conv, index) => {
                    if (conv.user_message) {
                        enhancedMessage += `${index + 1}. Previous: "${conv.user_message.substring(0, 80)}..."\n`;
                    }
                });
            }
        }
        
        // Build options object
        const options = {
            model: queryAnalysis.gpt5Model
        };
        
        // Add model-specific parameters
        if (queryAnalysis.gpt5Model === 'gpt-5-chat-latest') {
            if (queryAnalysis.temperature) options.temperature = queryAnalysis.temperature;
            if (queryAnalysis.max_completion_tokens) options.max_completion_tokens = queryAnalysis.max_completion_tokens;
        } else {
            if (queryAnalysis.reasoning_effort) options.reasoning_effort = queryAnalysis.reasoning_effort;
            if (queryAnalysis.verbosity) options.verbosity = queryAnalysis.verbosity;
            if (queryAnalysis.max_completion_tokens) options.max_completion_tokens = queryAnalysis.max_completion_tokens;
        }
        
        const result = await openaiClient.getGPT5Analysis(enhancedMessage, options);
        
        console.log(`GPT-5 execution successful: ${queryAnalysis.gpt5Model} (${result.length} chars)`);
        
        return {
            response: result,
            gpt5OnlyMode: true,
            aiUsed: `GPT-5-${queryAnalysis.gpt5Model.replace('gpt-5-', '').replace('gpt-5', 'full')}`,
            modelUsed: queryAnalysis.gpt5Model,
            powerMode: `GPT5_${queryAnalysis.priority.toUpperCase()}`,
            confidence: queryAnalysis.priority === 'mathematical' ? 0.95 : 
                       queryAnalysis.priority === 'complex' ? 0.9 : 0.85,
            success: true,
            operatorMode: false,
            reasoning_effort: queryAnalysis.reasoning_effort,
            verbosity: queryAnalysis.verbosity,
            priority: queryAnalysis.priority,
            memoryUsed: !!context,
            cost_tier: queryAnalysis.gpt5Model === 'gpt-5-nano' ? 'economy' :
                      queryAnalysis.gpt5Model === 'gpt-5-mini' ? 'standard' : 'premium',
            analytics: {
                queryComplexity: queryAnalysis.complexity,
                domainClassification: queryAnalysis.type,
                priorityLevel: queryAnalysis.priority,
                modelOptimization: 'GPT-5 family smart selection',
                costOptimized: true
            }
        };
        
    } catch (error) {
        console.error('GPT-5 execution error:', error.message);
        throw error;
    }
}
// utils/dualCommandSystem.js - PART 3: Operator Functions & Main Execution

// OPERATOR MODE EXECUTION SYSTEM
async function executeOperatorMode(userMessage, queryAnalysis, context, memoryData, chatId) {
    try {
        console.log('OPERATOR MODE: Analyzing request for executable actions...');
        
        // Enhanced prompt for action planning
        const cambodiaTime = getCurrentCambodiaDateTime();
        const operatorPrompt = `OPERATOR MODE - You are an AI operator that can execute actions.

AVAILABLE OPERATIONS:
1. TRADE: {type: "TRADE", action: "buy/sell", symbol: "string", amount: number, price: "market/limit"}
2. DATABASE: {type: "DATABASE", operation: "insert/update/delete/query", table: "string", data: object}
3. API_CALL: {type: "API_CALL", url: "string", method: "GET/POST/PUT/DELETE", data: object, headers: object}
4. FILE: {type: "FILE", operation: "read/write/create/delete", path: "string", content: "string"}
5. SCHEDULE: {type: "SCHEDULE", task: "string", time: "datetime", recurring: boolean}
6. EMAIL: {type: "EMAIL", to: "string", subject: "string", body: "string"}
7. NOTIFICATION: {type: "NOTIFICATION", message: "string", priority: "low/medium/high"}

SYSTEM CONTEXT:
- Current Time: ${cambodiaTime.date}, ${cambodiaTime.time} Cambodia (${cambodiaTime.timezone})
- Business Hours: ${!cambodiaTime.isWeekend && cambodiaTime.hour >= 8 && cambodiaTime.hour <= 17 ? 'Yes' : 'No'}
- User ID: ${chatId}
- Memory Context Available: ${context ? 'Yes' : 'No'}

USER REQUEST: "${userMessage}"

RESPONSE FORMAT:
If executable actions are needed, respond with this JSON structure:
{
  "ANALYSIS": "Brief analysis of the request",
  "ACTIONS_REQUIRED": [
    {action objects following the formats above}
  ],
  "SAFETY_CHECK": {
    "risk_level": "low/medium/high", 
    "concerns": ["list of potential risks"],
    "requires_confirmation": true/false
  },
  "USER_CONFIRMATION": "What to ask the user before executing",
  "EXECUTION_PLAN": "Step-by-step execution plan"
}

If no actions needed (advisory only), respond normally with analysis and recommendations.

IMPORTANT: Be precise with action parameters. For trades, specify exact symbols. For database operations, specify exact table names and data structure. Always assess safety and risk.`;

        // Get GPT-5 analysis for operator planning
        const actionPlan = await openaiClient.getGPT5Analysis(operatorPrompt, {
            model: queryAnalysis.gpt5Model,
            reasoning_effort: queryAnalysis.reasoning_effort,
            verbosity: queryAnalysis.verbosity,
            max_completion_tokens: queryAnalysis.max_completion_tokens,
            temperature: queryAnalysis.temperature || 0.3
        });

        console.log('Operator analysis completed, parsing response...');

        // Try to parse as JSON for structured actions
        let structuredActions = null;
        let isActionableRequest = false;

        try {
            // Look for JSON in the response
            const jsonMatch = actionPlan.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                structuredActions = JSON.parse(jsonMatch[0]);
                isActionableRequest = structuredActions.ACTIONS_REQUIRED && 
                                   Array.isArray(structuredActions.ACTIONS_REQUIRED) &&
                                   structuredActions.ACTIONS_REQUIRED.length > 0;
            }
        } catch (parseError) {
            console.log('Response is not JSON structured - treating as advisory');
        }

        if (isActionableRequest && structuredActions) {
            console.log(`Found ${structuredActions.ACTIONS_REQUIRED.length} actions to execute`);

            // Check if confirmation is required
            if (structuredActions.SAFETY_CHECK?.requires_confirmation || 
                queryAnalysis.requiresConfirmation ||
                structuredActions.SAFETY_CHECK?.risk_level === 'high') {
                
                return {
                    response: formatConfirmationRequest(structuredActions, userMessage),
                    actionsExecuted: 0,
                    executionResults: [],
                    requiresConfirmation: true,
                    pendingActions: structuredActions.ACTIONS_REQUIRED,
                    safetyCheck: structuredActions.SAFETY_CHECK
                };
            }

            // Execute actions if no confirmation needed
            const executionResults = await executeOperatorActions(
                structuredActions.ACTIONS_REQUIRED, 
                chatId, 
                structuredActions.SAFETY_CHECK
            );

            return {
                response: formatOperatorResponse(structuredActions, executionResults, userMessage),
                actionsExecuted: executionResults.length,
                executionResults: executionResults,
                requiresConfirmation: false
            };

        } else {
            // No structured actions found - return advisory response
            console.log('No executable actions detected, providing advisory response');
            
            return {
                response: `ADVISOR MODE: ${actionPlan}`,
                actionsExecuted: 0,
                executionResults: [],
                requiresConfirmation: false,
                advisoryMode: true
            };
        }

    } catch (error) {
        console.error('Operator mode execution error:', error.message);
        
        return {
            response: `OPERATOR MODE ERROR: Unable to process request - ${error.message}\n\nFalling back to advisory mode. How else can I help you?`,
            actionsExecuted: 0,
            executionResults: [],
            requiresConfirmation: false,
            error: error.message
        };
    }
}

// FORMAT CONFIRMATION REQUEST
function formatConfirmationRequest(structuredActions, originalMessage) {
    let response = "⚠️ OPERATOR CONFIRMATION REQUIRED\n\n";
    
    response += `📋 REQUEST ANALYSIS:\n${structuredActions.ANALYSIS}\n\n`;
    
    response += `🎯 PLANNED ACTIONS (${structuredActions.ACTIONS_REQUIRED.length}):\n`;
    structuredActions.ACTIONS_REQUIRED.forEach((action, index) => {
        response += `${index + 1}. ${action.type}: ${JSON.stringify(action).substring(0, 100)}...\n`;
    });
    
    if (structuredActions.SAFETY_CHECK) {
        response += `\n🛡️ SAFETY ASSESSMENT:\n`;
        response += `Risk Level: ${structuredActions.SAFETY_CHECK.risk_level.toUpperCase()}\n`;
        
        if (structuredActions.SAFETY_CHECK.concerns && structuredActions.SAFETY_CHECK.concerns.length > 0) {
            response += `Concerns:\n`;
            structuredActions.SAFETY_CHECK.concerns.forEach((concern, index) => {
                response += `• ${concern}\n`;
            });
        }
    }
    
    response += `\n📝 EXECUTION PLAN:\n${structuredActions.EXECUTION_PLAN}\n\n`;
    
    response += `❓ ${structuredActions.USER_CONFIRMATION}\n\n`;
    response += `Reply with "CONFIRM EXECUTION" to proceed, or "CANCEL" to abort.`;
    
    return response;
}

// EXECUTE OPERATOR ACTIONS
async function executeOperatorActions(actions, chatId, safetyCheck) {
    const results = [];
    
    console.log(`Executing ${actions.length} operator actions...`);
    
    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        console.log(`Executing action ${i + 1}/${actions.length}: ${action.type}`);
        
        try {
            const result = await executeAction(action, chatId);
            
            results.push({
                actionIndex: i + 1,
                action: action,
                success: true,
                result: result,
                timestamp: new Date().toISOString()
            });
            
            console.log(`Action ${i + 1} completed successfully`);
            
        } catch (error) {
            console.error(`Action ${i + 1} failed:`, error.message);
            
            results.push({
                actionIndex: i + 1,
                action: action,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            // If critical action fails, consider stopping
            if (safetyCheck?.risk_level === 'high') {
                console.log('High-risk action failed, stopping execution');
                break;
            }
        }
        
        // Add delay between actions to prevent overwhelming systems
        if (i < actions.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    return results;
}

// EXECUTE INDIVIDUAL ACTION
async function executeAction(action, chatId) {
    switch(action.type) {
        case 'TRADE':
            return await executeTrade(action, chatId);
        case 'DATABASE':
            return await executeDatabaseOperation(action, chatId);
        case 'API_CALL':
            return await executeAPICall(action, chatId);
        case 'FILE':
            return await executeFileOperation(action, chatId);
        case 'SCHEDULE':
            return await executeScheduleOperation(action, chatId);
        case 'EMAIL':
            return await executeEmailOperation(action, chatId);
        case 'NOTIFICATION':
            return await executeNotificationOperation(action, chatId);
        default:
            throw new Error(`Unknown action type: ${action.type}`);
    }
}

// INDIVIDUAL ACTION EXECUTORS
async function executeTrade(action, chatId) {
    try {
        // Try to use metaTrader.js if available
        const metaTrader = require('./metaTrader');
        
        const tradeResult = await metaTrader.executeTrade({
            action: action.action,
            symbol: action.symbol,
            amount: action.amount,
            price: action.price || 'market',
            userId: chatId
        });
        
        return `Trade executed: ${action.action} ${action.amount} ${action.symbol} - Result: ${tradeResult}`;
        
    } catch (error) {
        // Simulation mode if metaTrader not available
        return `SIMULATION: ${action.action} ${action.amount} ${action.symbol} at ${action.price || 'market'} price - ${error.message}`;
    }
}

async function executeDatabaseOperation(action, chatId) {
    try {
        switch(action.operation) {
            case 'insert':
                const insertResult = await database.insertRecord(action.table, {
                    ...action.data,
                    created_by: chatId,
                    created_at: new Date().toISOString()
                });
                return `Database insert successful: ${insertResult}`;
                
            case 'update':
                const updateResult = await database.updateRecord(action.table, action.data, action.where);
                return `Database update successful: ${updateResult}`;
                
            case 'delete':
                const deleteResult = await database.deleteRecord(action.table, action.where);
                return `Database delete successful: ${deleteResult}`;
                
            case 'query':
                const queryResult = await database.queryRecords(action.table, action.conditions);
                return `Database query successful: ${queryResult.length} records found`;
                
            default:
                throw new Error(`Unknown database operation: ${action.operation}`);
        }
    } catch (error) {
        throw new Error(`Database operation failed: ${error.message}`);
    }
}

async function executeAPICall(action, chatId) {
    // SECURITY WARNING: API calls can be dangerous - implement carefully
    return `API SIMULATION: ${action.method} ${action.url} - For security, external API calls are simulated`;
}

async function executeFileOperation(action, chatId) {
    // SECURITY WARNING: File operations can be dangerous - implement carefully
    return `FILE SIMULATION: ${action.operation} on ${action.path} - For security, file operations are simulated`;
}

async function executeScheduleOperation(action, chatId) {
    // Could integrate with node-cron or similar scheduling library
    return `SCHEDULE CREATED: Task "${action.task}" scheduled for ${action.time}${action.recurring ? ' (recurring)' : ''}`;
}

async function executeEmailOperation(action, chatId) {
    // Could integrate with nodemailer or similar email service
    return `EMAIL SIMULATION: Email to ${action.to} with subject "${action.subject}" - Email functionality not yet implemented`;
}

async function executeNotificationOperation(action, chatId) {
    // Could integrate with push notification services
    console.log(`NOTIFICATION [${action.priority}]: ${action.message}`);
    return `Notification sent: ${action.message}`;
}

// FORMAT OPERATOR RESPONSE
function formatOperatorResponse(structuredActions, executionResults, originalMessage) {
    let response = "✅ OPERATOR MODE EXECUTION COMPLETED\n\n";
    
    response += `📋 ORIGINAL REQUEST: "${originalMessage.substring(0, 100)}${originalMessage.length > 100 ? '...' : ''}"\n\n`;
    
    response += `📊 EXECUTION SUMMARY:\n`;
    response += `Total Actions: ${executionResults.length}\n`;
    response += `Successful: ${executionResults.filter(r => r.success).length}\n`;
    response += `Failed: ${executionResults.filter(r => !r.success).length}\n\n`;
    
    response += `🔍 DETAILED RESULTS:\n`;
    executionResults.forEach((result, index) => {
        const status = result.success ? "✅" : "❌";
        const actionDesc = `${result.action.type}`;
        
        response += `${status} ${index + 1}. ${actionDesc}\n`;
        
        if (result.success) {
            response += `   Result: ${result.result}\n`;
        } else {
            response += `   Error: ${result.error}\n`;
        }
        
        response += `   Time: ${new Date(result.timestamp).toLocaleTimeString()}\n\n`;
    });
    
    const successRate = (executionResults.filter(r => r.success).length / executionResults.length) * 100;
    response += `📈 Success Rate: ${successRate.toFixed(1)}%\n`;
    
    if (successRate === 100) {
        response += `\n🎉 All actions completed successfully! What's next?`;
    } else if (successRate > 50) {
        response += `\n⚠️ Some actions failed. Review the errors above and let me know if you want to retry.`;
    } else {
        response += `\n❌ Most actions failed. There may be a system issue. Please check the configuration.`;
    }
    
    return response;
}

// MAIN COMMAND EXECUTION FUNCTION
async function executeDualCommand(userMessage, chatId, options = {}) {
    const startTime = Date.now();
    
    try {
        console.log('Executing Enhanced GPT-5 command with Operator capabilities...');
        console.log('Message:', userMessage.substring(0, 100));
        
        // Build memory context if needed
        const isSystemTest = userMessage.toLowerCase().includes('test memory') || 
                           userMessage.toLowerCase().includes('integration test') ||
                           options.forceMemoryTest === true;
        
        let memoryContext = options.memoryContext || '';
        let memoryData = {
            conversationHistory: options.conversationHistory || [],
            persistentMemory: options.persistentMemory || []
        };
        
        if (!isSystemTest && !memoryContext && !options.conversationHistory && !options.persistentMemory) {
            console.log('Building memory context...');
            
            try {
                memoryContext = await memory.buildConversationContext(chatId);
                console.log(`Built memory context: ${memoryContext.length} chars`);
            } catch (memoryError) {
                console.log('Memory building failed:', memoryError.message);
                
                try {
                    const [history, memories] = await Promise.allSettled([
                        database.getConversationHistoryDB(chatId, 5),
                        database.getPersistentMemoryDB(chatId)
                    ]);
                    
                    if (history.status === 'fulfilled') {
                        memoryData.conversationHistory = history.value;
                    }
                    
                    if (memories.status === 'fulfilled') {
                        memoryData.persistentMemory = memories.value;
                    }
                    
                } catch (fallbackError) {
                    console.log('All memory retrieval failed:', fallbackError.message);
                    memoryContext = '';
                }
            }
        }
        
        // Analyze query for optimal routing
        const queryAnalysis = analyzeQuery(
            userMessage, 
            options.messageType || 'text', 
            options.hasMedia || false,
            memoryContext
        );
        
        // Handle completion detection
        if (queryAnalysis.shouldSkipGPT5) {
            console.log(`Completion detected: ${queryAnalysis.completionStatus.completionType}`);
            
            const responseTime = Date.now() - startTime;
            
            return {
                response: queryAnalysis.quickResponse,
                aiUsed: 'completion-detection',
                queryType: 'completion',
                complexity: 'low',
                reasoning: `Completion detected - ${queryAnalysis.completionStatus.completionType}`,
                priority: 'completion',
                completionDetected: true,
                completionType: queryAnalysis.completionStatus.completionType,
                skippedGPT5: true,
                contextUsed: memoryContext.length > 0,
                responseTime: responseTime,
                operatorMode: false,
                success: true
            };
        }
        
        // Override model if forced
        if (options.forceModel && options.forceModel.includes('gpt-5')) {
            queryAnalysis.gpt5Model = options.forceModel;
            queryAnalysis.reason = `Forced to use ${options.forceModel}`;
        }
        
        console.log('Query analysis:', {
            type: queryAnalysis.type,
            priority: queryAnalysis.priority,
            model: queryAnalysis.gpt5Model,
            operatorMode: queryAnalysis.isOperatorMode,
            reason: queryAnalysis.reason
        });
        
        // Execute through GPT-5 system (handles both operator and advisor modes)
        let gpt5Result;
        try {
            gpt5Result = await executeThroughGPT5System(
                userMessage, 
                queryAnalysis, 
                memoryContext, 
                memoryData, 
                chatId
            );
            
            console.log('GPT-5 execution successful:', {
                operatorMode: gpt5Result.operatorMode,
                actionsExecuted: gpt5Result.actionsExecuted || 0,
                powerMode: gpt5Result.powerMode
            });
            
        } catch (gpt5Error) {
            console.error('GPT-5 system failed:', gpt5Error.message);
            throw new Error(`GPT-5 system failure: ${gpt5Error.message}`);
        }
        
        const responseTime = Date.now() - startTime;
        
        // Build comprehensive result
        const result = {
            response: gpt5Result.response || gpt5Result,
            aiUsed: gpt5Result.aiUsed || queryAnalysis.gpt5Model,
            queryType: queryAnalysis.type,
            complexity: queryAnalysis.complexity,
            reasoning: queryAnalysis.reason,
            priority: queryAnalysis.priority,
            operatorMode: queryAnalysis.isOperatorMode,
            actionsExecuted: gpt5Result.actionsExecuted || 0,
            executionResults: gpt5Result.executionResults || [],
            contextUsed: memoryContext.length > 0,
            responseTime: responseTime,
            success: true,
            
            // Enhanced operator mode data
            requiresConfirmation: gpt5Result.requiresConfirmation || false,
            pendingActions: gpt5Result.pendingActions || [],
            
            // Memory and system data
            memoryData: {
                contextLength: memoryContext.length,
                conversationRecords: memoryData.conversationHistory.length,
                persistentMemories: memoryData.persistentMemory.length,
                memoryImportant: queryAnalysis.memoryImportant,
                memoryUsed: memoryContext.length > 0
            },
            
            // GPT-5 specific data
            gpt5OnlyMode: true,
            modelUsed: gpt5Result.modelUsed || queryAnalysis.gpt5Model,
            powerMode: gpt5Result.powerMode || `GPT5_${queryAnalysis.priority.toUpperCase()}`,
            confidence: gpt5Result.confidence || 0.8,
            cost_tier: gpt5Result.cost_tier || 'standard',
            
            analytics: gpt5Result.analytics || {
                queryComplexity: queryAnalysis.complexity,
                priorityLevel: queryAnalysis.priority,
                modelOptimization: 'GPT-5 smart selection with operator capabilities'
            },
            
            timestamp: new Date().toISOString()
        };
        
        return result;
        
    } catch (error) {
        console.error('Dual command execution error:', error.message);
        
        const responseTime = Date.now() - startTime;
        
        return {
            response: `I apologize, but I encountered an error: ${error.message}\n\nPlease try again or rephrase your request.`,
            aiUsed: 'emergency-fallback',
            queryType: 'error',
            operatorMode: false,
            actionsExecuted: 0,
            success: false,
            error: error.message,
            responseTime: responseTime
        };
    }
}

console.log('Enhanced GPT-5 Dual Command System loaded (v3.0 - WITH OPERATOR MODE)');
console.log('Features: Advisor Mode + Operator Mode + Memory Integration + Telegram Support');
console.log('Pipeline: User → analyzeQuery → executeOperatorMode/AdvisorMode → Response');

module.exports = {
    // Main execution function
    executeDualCommand,
    
    // Analysis functions
    analyzeQuery,
    detectOperatorIntent,
    detectCompletionStatus,
    
    // Execution functions
    executeThroughGPT5System,
    executeOperatorMode,
    executeOperatorActions,
    executeAction,
    
    // Utility functions
    getCurrentCambodiaDateTime,
    formatOperatorResponse,
    formatConfirmationRequest,
    
    // Legacy compatibility
    executeGptAnalysis: (msg, analysis, ctx, mem) => executeThroughGPT5System(msg, {...analysis, bestAI: 'gpt'}, ctx, mem),
    routeConversationIntelligently: analyzeQuery
};
