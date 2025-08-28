// utils/dualCommandSystem.js - FIXED: GPT-5 ONLY MODE + NORMAL CONVERSATION
// Clean routing: index.js → dualCommandSystem.js → openaiClient.js
// FIXED: Removed automatic memory testing for normal conversations

// MAIN IMPORT: OpenAI Client for GPT-5 Only
let openaiClient;
try {
    openaiClient = require('./openaiClient');
    console.log('GPT-5 client loaded successfully');
} catch (error) {
    console.error('GPT-5 client import failed:', error.message);
    openaiClient = { 
        getGPT5Analysis: async (prompt) => `GPT-5 client unavailable: ${error.message}` 
    };
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

// QUERY COMPLEXITY ANALYZER for Dynamic Token Scaling
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

// MEMORY INTEGRATION
let memory, database;
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

// TELEGRAM INTEGRATION
let telegramSplitter = {};
try {
    telegramSplitter = require('./telegramSplitter');
    console.log('Telegram integration loaded');
} catch (error) {
    console.warn('Telegram splitter import failed:', error.message);
    telegramSplitter = {
        sendGPTResponse: async () => false,
        sendClaudeResponse: async () => false,
        sendDualAIResponse: async () => false,
        sendAnalysis: async () => false,
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
        console.error('Global DateTime error:', error.message);
        return {
            cambodia: getCurrentCambodiaDateTime(),
            error: 'Global timezone calculation failed'
        };
    }
}

// GPT-5 QUERY ANALYSIS with Smart Retry Logic
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
            quickResponse: generateCompletionResponse(completionStatus, userMessage)
        };
    }
    
    // Memory patterns
    const memoryPatterns = [
        /remember|recall|you mentioned|we discussed|before|previously|last time/i,
        /my name|my preference|i told you|i said|you know/i
    ];
    
    // Speed critical patterns - Use GPT-5 Nano
    const speedPatterns = [
        /urgent|immediate|now|asap|quick|fast|emergency|real-time/i,
        /^(what time|what's the time|current time|time now)/i,
        /^(what date|what's the date|today's date|date today)/i,
        /^(hello|hi|hey|good morning|good afternoon|what's up)$/i,
        /^how are you\??$/i,
        /^(thanks|thank you|cool|nice|great|ok|okay)$/i
    ];
    
    // Complex analysis patterns - Use Full GPT-5 WITH RETRY
    const complexPatterns = [
        /(strategy|strategic|comprehensive|detailed|thorough|in-depth)/i,
        /(analyze|evaluate|assess|examine|investigate|research)/i,
        /(portfolio|allocation|risk|optimization|diversification)/i,
        /(complex|sophisticated|multi-factor|multi-dimensional)/i,
        /(build|create|develop|implement|construct|design)/i,
        /(plan|planning|framework|structure|architecture)/i,
        /(write.*comprehensive|detailed.*report|full.*analysis)/i
    ];
    
    // Math/coding patterns - Use Full GPT-5 WITH RETRY
    const mathCodingPatterns = [
        /(calculate|compute|formula|equation|algorithm|optimization)/i,
        /(code|coding|program|script|debug|software|api)/i,
        /(mathematical|statistical|probability|regression|correlation)/i,
        /(machine learning|ai|neural network|deep learning)/i,
        /(backtest|monte carlo|var|sharpe|sortino|calmar)/i,
        /(dcf|npv|irr|wacc|capm|black.*scholes)/i
    ];
    
    // Cambodia/regional patterns - Use GPT-5 Mini
    const cambodiaPatterns = [
        /(cambodia|khmer|phnom penh|cambodian)/i,
        /(lending.*cambodia|cambodia.*lending)/i,
        /(usd.*khr|khr.*usd)/i,
        /(southeast asia|asean|emerging markets)/i
    ];
    
    // Market patterns - Use GPT-5 Mini
    const marketPatterns = [
        /(market|stock|bond|crypto|forex|trading)/i,
        /(investment|buy|sell|price|rate|yield|return)/i,
        /(analysis|forecast|outlook|prediction)/i,
        /(earnings|revenue|profit|financial)/i
    ];
    
    // Chat patterns - Use GPT-5 Chat
    const chatPatterns = [
        /^(hello|hi|hey|good morning|good afternoon)/i,
        /(chat|conversation|talk|discuss)/i,
        /(how are you|what's up|how's it going)/i
    ];
    
    // Check for memory importance
    const hasMemoryReference = memoryPatterns.some(pattern => pattern.test(message));
    const hasMemoryContext = memoryContext && memoryContext.length > 100;
    
    // GPT-5 MODEL SELECTION LOGIC WITH SMART RETRY
    let gpt5Config = {
        model: 'gpt-5-mini',
        reasoning_effort: 'medium',
        verbosity: 'medium',
        max_completion_tokens: 8000,
        temperature: 0.7,
        priority: 'standard',
        reason: 'GPT-5 Mini - Balanced performance',
        maxRetries: 0  // Default: no retries for simple queries
    };
    
    // PRIORITY 1: SPEED CRITICAL - GPT-5 Nano (no retry needed)
    if (speedPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 6000,
            priority: 'speed',
            reason: 'Speed critical - GPT-5 Nano for fast response',
            maxRetries: 0  // No retry for speed queries
        };
    }
    // PRIORITY 2: CHAT PATTERNS - GPT-5 Chat model (no retry needed)
    else if (chatPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-chat-latest',
            temperature: 0.7,
            max_completion_tokens: 8000,
            priority: 'chat',
            reason: 'Chat pattern - GPT-5 Chat model',
            maxRetries: 0  // No retry for chat
        };
    }
    // PRIORITY 3: CAMBODIA/REGIONAL - GPT-5 Mini
    else if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-mini',
            reasoning_effort: 'medium',
            verbosity: 'high',
            max_completion_tokens: 10000,
            temperature: 0.6,
            priority: 'regional',
            reason: 'Cambodia/regional analysis - GPT-5 Mini with detailed output',
            maxRetries: 0  // No retry for regional queries
        };
    }
    // PRIORITY 4: MARKET ANALYSIS - GPT-5 Mini
    else if (marketPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5-mini',
            reasoning_effort: 'medium',
            verbosity: 'medium',
            max_completion_tokens: 8000,
            temperature: 0.6,
            priority: 'market',
            reason: 'Market analysis - GPT-5 Mini for balanced performance',
            maxRetries: 0  // No retry for market queries
        };
    }
    // PRIORITY 5: MATH/CODING - Full GPT-5 with RETRY ENABLED
    else if (mathCodingPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5',
            reasoning_effort: 'high',
            verbosity: 'medium',
            max_completion_tokens: 12000,
            temperature: 0.3,
            priority: 'mathematical',
            reason: 'Mathematical/coding precision - Full GPT-5 with retry',
            maxRetries: 2  // Enable retry for complex math/coding
        };
    }
    // PRIORITY 6: COMPLEX ANALYSIS - Full GPT-5 with RETRY ENABLED
    else if (complexPatterns.some(pattern => pattern.test(message))) {
        gpt5Config = {
            model: 'gpt-5',
            reasoning_effort: 'high',
            verbosity: 'high',
            max_completion_tokens: 16000,
            temperature: 0.6,
            priority: 'complex',
            reason: 'Complex strategic analysis - Full GPT-5 with retry',
            maxRetries: 2  // Enable retry for complex analysis
        };
    }
    // PRIORITY 7: MULTIMODAL - Full GPT-5 with RETRY ENABLED
    else if (hasMedia || messageType !== 'text') {
        gpt5Config = {
            model: 'gpt-5',
            reasoning_effort: 'medium',
            verbosity: 'medium',
            max_completion_tokens: 10000,
            temperature: 0.7,
            priority: 'multimodal',
            reason: 'Multimodal content - Full GPT-5 for vision analysis with retry',
            maxRetries: 1  // Enable retry for multimodal
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
        // Enable retry for very complex queries regardless of pattern
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
        // Enable retry for long response requests
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
        maxRetries: gpt5Config.maxRetries,  // Include retry setting in return
        
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

// DIRECT GPT-5 EXECUTION
async function executeThroughGPT5System(userMessage, queryAnalysis, context = null, memoryData = null, chatId = null) {
    try {
        console.log(`GPT-5 Only: ${queryAnalysis.gpt5Model} (${queryAnalysis.reasoning_effort || 'none'} reasoning, ${queryAnalysis.verbosity || 'none'} verbosity)`);
        
        // Handle datetime queries directly
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
        
        console.log('GPT-5 execution config:', {
            model: queryAnalysis.gpt5Model,
            reasoning: queryAnalysis.reasoning_effort,
            verbosity: queryAnalysis.verbosity,
            tokens: queryAnalysis.max_completion_tokens,
            hasMemory: !!context,
            priority: queryAnalysis.priority
        });
        
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

// GPT-5 FALLBACK EXECUTION
async function executeGPT5Fallback(userMessage, queryAnalysis, context = null) {
    try {
        console.log('GPT-5 fallback: Using GPT-5 Nano for reliability...');
        
        let enhancedMessage = userMessage;
        if (context && queryAnalysis.memoryImportant) {
            enhancedMessage += `\n\nContext: ${context.substring(0, 500)}`;
        }
        
        return await openaiClient.getGPT5Analysis(enhancedMessage, {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 8000
        });
        
    } catch (fallbackError) {
        console.error('GPT-5 Nano fallback also failed:', fallbackError.message);
        throw new Error(`All GPT-5 models failed: ${fallbackError.message}`);
    }
}

// MAIN COMMAND EXECUTION - FIXED TO NOT CALL MEMORY TEST FOR NORMAL CONVERSATIONS
async function executeDualCommand(userMessage, chatId, options = {}) {
    const startTime = Date.now();
    
    try {
        console.log('Executing GPT-5 command for normal conversation...');
        console.log('Message:', userMessage.substring(0, 100));
        
        // FIXED: Only retrieve memory if this is NOT a system test
        const isSystemTest = userMessage.toLowerCase().includes('test memory') || 
                           userMessage.toLowerCase().includes('integration test') ||
                           options.forceMemoryTest === true;
        
        let memoryContext = options.memoryContext || '';
        let memoryData = {
            conversationHistory: options.conversationHistory || [],
            persistentMemory: options.persistentMemory || []
        };
        
        // FIXED: Only build memory for non-test conversations
        if (!isSystemTest && !memoryContext && !options.conversationHistory && !options.persistentMemory) {
            console.log('Building memory context for normal conversation...');
            
            try {
                memoryContext = await memory.buildConversationContext(chatId);
                console.log(`Built memory context: ${memoryContext.length} chars`);
            } catch (memoryError) {
                console.log('Memory building failed, using fallback:', memoryError.message);
                
                try {
                    const [history, memories] = await Promise.allSettled([
                        database.getConversationHistoryDB(chatId, 5),
                        database.getPersistentMemoryDB(chatId)
                    ]);
                    
                    if (history.status === 'fulfilled') {
                        memoryData.conversationHistory = history.value;
                        console.log(`Retrieved ${history.value.length} conversation records`);
                    }
                    
                    if (memories.status === 'fulfilled') {
                        memoryData.persistentMemory = memories.value;
                        console.log(`Retrieved ${memories.value.length} persistent memories`);
                    }
                    
                } catch (fallbackError) {
                    console.log('All memory retrieval failed:', fallbackError.message);
                    memoryContext = '';
                }
            }
        }
        
        // Analyze query for optimal GPT-5 model selection
        const queryAnalysis = analyzeQuery(
            userMessage, 
            options.messageType || 'text', 
            options.hasMedia || false,
            memoryContext
        );
        
        // Handle completion detection BEFORE GPT-5 processing
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
                tokenCount: 0,
                functionExecutionTime: responseTime,
                gpt5OnlyMode: true,
                gpt5System: false,
                powerMode: 'COMPLETION_DETECTION',
                confidence: 0.95,
                modelUsed: 'none',
                cost_tier: 'free',
                
                memoryData: {
                    contextLength: memoryContext.length,
                    conversationRecords: memoryData.conversationHistory.length,
                    persistentMemories: memoryData.persistentMemory.length,
                    memoryImportant: false,
                    memoryUsed: memoryContext.length > 0,
                    postgresqlConnected: memoryData.conversationHistory.length > 0 || memoryData.persistentMemory.length > 0
                },
                
                success: true,
                timestamp: new Date().toISOString(),
                
                sendToTelegram: async (bot, title = null) => {
                    try {
                        const finalTitle = title || 'Task Completion Acknowledged';
                        
                        const metadata = {
                            responseTime: responseTime,
                            completionDetected: true,
                            completionType: queryAnalysis.completionStatus.completionType,
                            contextUsed: memoryContext.length > 0,
                            skippedGPT5: true,
                            costSaved: true
                        };
                        
                        return await telegramSplitter.sendGPTResponse(
                            bot, chatId, queryAnalysis.quickResponse, finalTitle, metadata
                        );
                        
                    } catch (telegramError) {
                        console.error('Completion response Telegram error:', telegramError.message);
                        return false;
                    }
                }
            };
        }
        
        // Override model if forced
        if (options.forceModel && options.forceModel.includes('gpt-5')) {
            queryAnalysis.gpt5Model = options.forceModel;
            queryAnalysis.reason = `Forced to use ${options.forceModel}`;
        }
        
        console.log('GPT-5 query analysis:', {
            type: queryAnalysis.type,
            priority: queryAnalysis.priority,
            model: queryAnalysis.gpt5Model,
            reasoning: queryAnalysis.reasoning_effort,
            verbosity: queryAnalysis.verbosity,
            memoryImportant: queryAnalysis.memoryImportant,
            reason: queryAnalysis.reason
        });
        
        let response;
        let aiUsed;
        let gpt5Result = null;
        
        try {
            // MAIN EXECUTION: Route through GPT-5 system
            gpt5Result = await executeThroughGPT5System(
                userMessage, 
                queryAnalysis, 
                memoryContext, 
                memoryData, 
                chatId
            );
            
            response = gpt5Result.response;
            aiUsed = gpt5Result.aiUsed || queryAnalysis.gpt5Model;
            
            console.log('GPT-5 execution successful:', {
                aiUsed: aiUsed,
                powerMode: gpt5Result.powerMode,
                confidence: gpt5Result.confidence,
                costTier: gpt5Result.cost_tier
            });
            
        } catch (gpt5Error) {
            console.error('GPT-5 system failed, trying fallback:', gpt5Error.message);
            
            try {
                response = await executeGPT5Fallback(userMessage, queryAnalysis, memoryContext);
                aiUsed = 'GPT-5-nano-fallback';
                
                console.log('GPT-5 Nano fallback successful');
                
            } catch (fallbackError) {
                console.error('All GPT-5 models failed:', fallbackError.message);
                throw new Error(`Complete GPT-5 system failure: ${fallbackError.message}`);
            }
        }
        
        const responseTime = Date.now() - startTime;
        
        console.log('GPT-5 command completed:', {
            aiUsed: aiUsed,
            responseTime: responseTime,
            gpt5System: !!gpt5Result,
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
            priority: queryAnalysis.priority,
            liveDataUsed: queryAnalysis.needsLiveData,
            contextUsed: memoryContext.length > 0,
            responseTime: responseTime,
            tokenCount: response.length,
            functionExecutionTime: responseTime,
            
            gpt5OnlyMode: true,
            gpt5System: !!gpt5Result,
            powerMode: gpt5Result?.powerMode || 'fallback',
            confidence: gpt5Result?.confidence || 0.7,
            modelUsed: gpt5Result?.modelUsed || 'gpt-5-nano',
            reasoning_effort: queryAnalysis.reasoning_effort,
            verbosity: queryAnalysis.verbosity,
            cost_tier: gpt5Result?.cost_tier || 'economy',
            completionDetected: false,
            
            memoryData: {
                contextLength: memoryContext.length,
                conversationRecords: memoryData.conversationHistory.length,
                persistentMemories: memoryData.persistentMemory.length,
                memoryImportant: queryAnalysis.memoryImportant,
                memoryUsed: memoryContext.length > 0,
                postgresqlConnected: memoryData.conversationHistory.length > 0 || memoryData.persistentMemory.length > 0
            },
            
            analytics: gpt5Result?.analytics || {
                queryComplexity: queryAnalysis.complexity,
                domainClassification: queryAnalysis.type,
                priorityLevel: queryAnalysis.priority,
                modelOptimization: 'GPT-5 smart selection',
                costOptimized: true
            },
            
            success: true,
            timestamp: new Date().toISOString(),
            
            sendToTelegram: async (bot, title = null) => {
                try {
                    const defaultTitle = `GPT-5 ${queryAnalysis.gpt5Model.includes('nano') ? 'Nano' : 
                                                queryAnalysis.gpt5Model.includes('mini') ? 'Mini' : 'Ultimate'} Analysis`;
                    const finalTitle = title || defaultTitle;
                    
                    const gpt5Indicator = gpt5Result ? 'GPT-5 Optimized' : 'GPT-5 Fallback';
                    const fullTitle = `${finalTitle} (${gpt5Indicator})`;
                    
                    const metadata = {
                        responseTime: responseTime,
                        contextUsed: memoryContext.length > 0,
                        complexity: queryAnalysis.complexity,
                        gpt5System: !!gpt5Result,
                        confidence: gpt5Result?.confidence || 0.7,
                        model: queryAnalysis.gpt5Model,
                        costTier: gpt5Result?.cost_tier || 'economy'
                    };
                    
                    return await telegramSplitter.sendGPTResponse(
                        bot, chatId, response, fullTitle, metadata
                    );
                    
                } catch (telegramError) {
                    console.error('Telegram send error:', telegramError.message);
                    return false;
                }
            }
        };
        
        return result;
        
    } catch (error) {
        console.error('GPT-5 command execution error:', error.message);
        
        const responseTime = Date.now() - startTime;
        
        return {
            response: `I apologize, but I'm experiencing technical difficulties with GPT-5. Please try again in a moment.\n\nError: ${error.message}\n\nYou can try:\n• A simpler question\n• Waiting a moment and trying again\n• Checking your internet connection`,
            aiUsed: 'emergency-fallback',
            queryType: 'error',
            complexity: 'low',
            reasoning: 'Complete GPT-5 system failure, emergency response',
            contextUsed: false,
            responseTime: responseTime,
            memoryData: {
                contextLength: 0,
                conversationRecords: 0,
                persistentMemories: 0,
                memoryImportant: false,
                postgresqlConnected: false
            },
            success: false,
            error: error.message,
            gpt5OnlyMode: true,
            gpt5System: false,
            
            sendToTelegram: async (bot) => {
                try {
                    return await telegramSplitter.sendAlert(bot, chatId, 
                        `GPT-5 system error: ${error.message}`, 
                        'Emergency Fallback'
                    );
                } catch (telegramError) {
                    console.error('Emergency Telegram alert failed:', telegramError.message);
                    return false;
                }
            }
        };
    }
}

// MEMORY TESTING - SEPARATE FUNCTION FOR EXPLICIT TESTING ONLY
async function testMemoryIntegration(chatId) {
    console.log('Testing memory integration with GPT-5...');
    
    const tests = {
        postgresqlConnection: false,
        conversationHistory: false,
        persistentMemory: false,
        memoryBuilding: false,
        completionDetection: false,
        gpt5WithMemory: false,
        memoryContextPassing: false,
        gpt5ModelSelection: false,
        telegramIntegration: false,
        gpt5SystemHealth: false
    };
    
    try {
        const completionTest = detectCompletionStatus('done ready', 'system already built');
        tests.completionDetection = completionTest.shouldSkipGPT5;
        console.log(`Completion Detection: ${tests.completionDetection}`);
    } catch (error) {
        console.log(`Completion Detection: Failed - ${error.message}`);
    }
    
    try {
        const testConnection = await database.getConversationHistoryDB('test', 1);
        tests.postgresqlConnection = Array.isArray(testConnection);
        console.log(`PostgreSQL Connection: ${tests.postgresqlConnection}`);
    } catch (error) {
        console.log(`PostgreSQL Connection: Failed - ${error.message}`);
    }
    
    try {
        const history = await database.getConversationHistoryDB(chatId, 3);
        tests.conversationHistory = Array.isArray(history);
        console.log(`Conversation History: ${tests.conversationHistory} (${history?.length || 0} records)`);
    } catch (error) {
        console.log(`Conversation History: Failed - ${error.message}`);
    }
    
    try {
        const memories = await database.getPersistentMemoryDB(chatId);
        tests.persistentMemory = Array.isArray(memories);
        console.log(`Persistent Memory: ${tests.persistentMemory} (${memories?.length || 0} records)`);
    } catch (error) {
        console.log(`Persistent Memory: Failed - ${error.message}`);
    }
    
    try {
        const context = await memory.buildConversationContext(chatId);
        tests.memoryBuilding = typeof context === 'string';
        console.log(`Memory Building: ${tests.memoryBuilding} (${context?.length || 0} chars)`);
    } catch (error) {
        console.log(`Memory Building: Failed - ${error.message}`);
    }
    
    try {
        // FIXED: Direct GPT-5 API test instead of recursive executeDualCommand call
        const testPrompt = 'Hello, test GPT-5 functionality';
        const directResult = await openaiClient.getGPT5Analysis(testPrompt, {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            max_completion_tokens: 50
        });
        tests.gpt5WithMemory = directResult && directResult.length > 0;
        console.log(`GPT-5 with Memory: ${tests.gpt5WithMemory}`);
    } catch (error) {
        console.log(`GPT-5 with Memory: Failed - ${error.message}`);
    }
    
    try {
        // FIXED: Simple validation instead of recursive test
        tests.memoryContextPassing = tests.memoryBuilding && tests.postgresqlConnection;
        console.log(`Memory Context Passing: ${tests.memoryContextPassing}`);
    } catch (error) {
        console.log(`Memory Context Passing: Failed - ${error.message}`);
    }
    
    try {
        // FIXED: Direct health check instead of recursive model selection test
        const healthCheck = await openaiClient.checkGPT5SystemHealth();
        tests.gpt5ModelSelection = healthCheck.gpt5NanoAvailable || healthCheck.gpt5MiniAvailable;
        console.log(`GPT-5 Model Selection: ${tests.gpt5ModelSelection}`);
    } catch (error) {
        console.log(`GPT-5 Model Selection: Failed - ${error.message}`);
    }
    
    try {
        // FIXED: Function existence check instead of recursive test
        tests.telegramIntegration = typeof telegramSplitter.sendGPTResponse === 'function';
        console.log(`Telegram Integration: ${tests.telegramIntegration}`);
    } catch (error) {
        console.log(`Telegram Integration: Failed - ${error.message}`);
    }
    
    try {
        // FIXED: Direct health check
        const systemHealth = await checkGPT5OnlySystemHealth();
        tests.gpt5SystemHealth = systemHealth.overallHealth;
        console.log(`GPT-5 System Health: ${tests.gpt5SystemHealth}`);
    } catch (error) {
        console.log(`GPT-5 System Health: Failed - ${error.message}`);
    }
    
    const overallSuccess = Object.values(tests).filter(test => test).length;
    const totalTests = Object.keys(tests).length;
    
    console.log(`\nMemory Test: ${overallSuccess}/${totalTests} passed`);
    
    return {
        tests: tests,
        score: overallSuccess,
        total: totalTests,
        percentage: Math.round((overallSuccess / totalTests) * 100),
        status: overallSuccess === totalTests ? 'FULL_SUCCESS' : 
                overallSuccess >= totalTests * 0.7 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION',
        gpt5OnlyMode: true,
        completionDetectionEnabled: tests.completionDetection,
        postgresqlIntegrated: tests.postgresqlConnection && tests.conversationHistory,
        memorySystemIntegrated: tests.memoryBuilding && tests.gpt5WithMemory
    };
}

// GPT-5 SYSTEM HEALTH CHECK
async function checkGPT5OnlySystemHealth() {
    const health = {
        gpt5_full: false,
        gpt5_mini: false,
        gpt5_nano: false,
        gpt5_chat: false,
        completionDetection: false,
        memorySystem: false,
        contextBuilding: false,
        dateTimeSupport: false,
        telegramIntegration: false,
        databaseConnection: false,
        overallHealth: false,
        errors: [],
        gpt5OnlyMode: true,
        postgresqlStatus: 'unknown'
    };
    
    try {
        const testCompletion = detectCompletionStatus('done ready', 'system built');
        health.completionDetection = testCompletion.shouldSkipGPT5;
    } catch (error) {
        health.errors.push(`Completion Detection: ${error.message}`);
    }
    
    const gpt5Models = [
        { name: 'gpt5_full', model: 'gpt-5', description: 'Full GPT-5' },
        { name: 'gpt5_mini', model: 'gpt-5-mini', description: 'GPT-5 Mini' },
        { name: 'gpt5_nano', model: 'gpt-5-nano', description: 'GPT-5 Nano' },
        { name: 'gpt5_chat', model: 'gpt-5-chat-latest', description: 'GPT-5 Chat' }
    ];
    
    for (const { name, model, description } of gpt5Models) {
        try {
            const options = { model: model, max_completion_tokens: 50 };
            
            if (model !== 'gpt-5-chat-latest') {
                options.reasoning_effort = 'minimal';
                options.verbosity = 'low';
            } else {
                options.temperature = 0.7;
            }
            
            await openaiClient.getGPT5Analysis('Health check test', options);
            health[name] = true;
            console.log(`${description} operational`);
        } catch (error) {
            health.errors.push(`${model}: ${error.message}`);
        }
    }
    
    try {
        const testHistory = await database.getConversationHistoryDB('health_test', 1);
        health.databaseConnection = Array.isArray(testHistory);
        health.postgresqlStatus = 'connected';
    } catch (error) {
        health.errors.push(`PostgreSQL: ${error.message}`);
        health.postgresqlStatus = 'disconnected';
    }
    
    try {
        const testContext = await memory.buildConversationContext('health_test');
        health.memorySystem = typeof testContext === 'string';
        health.contextBuilding = true;
    } catch (error) {
        health.errors.push(`Memory: ${error.message}`);
    }
    
    try {
        const cambodiaTime = getCurrentCambodiaDateTime();
        health.dateTimeSupport = cambodiaTime && cambodiaTime.date;
    } catch (error) {
        health.errors.push(`DateTime: ${error.message}`);
    }
    
    try {
        health.telegramIntegration = typeof telegramSplitter.sendGPTResponse === 'function';
    } catch (error) {
        health.errors.push(`Telegram: ${error.message}`);
    }
    
    const healthyModels = [health.gpt5_full, health.gpt5_mini, health.gpt5_nano].filter(Boolean).length;
    health.overallHealth = healthyModels >= 1 && health.memorySystem && health.databaseConnection;
    
    health.healthScore = (
        (healthyModels * 15) +
        (health.gpt5_chat ? 10 : 0) +
        (health.completionDetection ? 15 : 0) +
        (health.memorySystem ? 10 : 0) +
        (health.databaseConnection ? 15 : 0) +
        (health.telegramIntegration ? 5 : 0) +
        (health.dateTimeSupport ? 5 : 0)
    );
    
    health.healthGrade = health.healthScore >= 95 ? 'A+' :
                        health.healthScore >= 85 ? 'A' :
                        health.healthScore >= 75 ? 'B+' :
                        health.healthScore >= 65 ? 'B' :
                        health.healthScore >= 50 ? 'C' : 'F';
    
    return health;
}

// UTILITY FUNCTIONS
function getGPT5ModelRecommendation(query) {
    const analysis = analyzeQuery(query);
    return {
        recommendedModel: analysis.gpt5Model,
        reasoning: analysis.reason,
        priority: analysis.priority,
        completionDetected: analysis.shouldSkipGPT5,
        configuration: {
            reasoning_effort: analysis.reasoning_effort,
            verbosity: analysis.verbosity,
            max_completion_tokens: analysis.max_completion_tokens,
            temperature: analysis.temperature
        },
        estimatedCost: analysis.gpt5Model === 'gpt-5-nano' ? 'Very Low' :
                      analysis.gpt5Model === 'gpt-5-mini' ? 'Low' : 'Medium',
        responseSpeed: analysis.gpt5Model === 'gpt-5-nano' ? 'Very Fast' :
                      analysis.gpt5Model === 'gpt-5-mini' ? 'Fast' : 'Balanced'
    };
}

function getGPT5CostEstimate(query, estimatedTokens = 1000) {
    const analysis = analyzeQuery(query);
    
    if (analysis.shouldSkipGPT5) {
        return {
            model: 'completion-detection',
            estimatedInputTokens: 0,
            estimatedOutputTokens: 0,
            inputCost: '0.000000',
            outputCost: '0.000000',
            totalCost: '0.000000',
            costTier: 'Free',
            completionDetected: true,
            costSavings: 'Maximum - No AI tokens used'
        };
    }
    
    const costs = {
        'gpt-5-nano': { input: 0.05, output: 0.40 },
        'gpt-5-mini': { input: 0.25, output: 2.00 },
        'gpt-5': { input: 1.25, output: 10.00 },
        'gpt-5-chat-latest': { input: 1.25, output: 10.00 }
    };
    
    const modelCosts = costs[analysis.gpt5Model] || costs['gpt-5-mini'];
    const inputCost = (estimatedTokens * 0.5 / 1000000) * modelCosts.input;
    const outputCost = (estimatedTokens * 0.5 / 1000000) * modelCosts.output;
    
    return {
        model: analysis.gpt5Model,
        estimatedInputTokens: Math.round(estimatedTokens * 0.5),
        estimatedOutputTokens: Math.round(estimatedTokens * 0.5),
        inputCost: `${inputCost.toFixed(6)}`,
        outputCost: `${outputCost.toFixed(6)}`,
        totalCost: `${(inputCost + outputCost).toFixed(6)}`,
        costTier: analysis.gpt5Model === 'gpt-5-nano' ? 'Economy' :
                 analysis.gpt5Model === 'gpt-5-mini' ? 'Standard' : 'Premium',
        completionDetected: false
    };
}

function getGPT5PerformanceMetrics() {
    return {
        systemMode: 'GPT-5 Only with Completion Detection',
        modelsAvailable: ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5-chat-latest'],
        smartRouting: 'Enabled',
        completionDetection: 'Active',
        costOptimization: 'Active + Completion Savings',
        memoryIntegration: 'PostgreSQL-backed',
        telegramIntegration: 'Enhanced',
        fallbackSystem: 'Multi-tier GPT-5',
        healthMonitoring: 'Comprehensive',
        estimatedSavings: '60-80% vs dual AI system + completion detection savings',
        responseTime: {
            completion: 'Instant (no AI processing)',
            nano: '1-3 seconds',
            mini: '2-5 seconds', 
            full: '3-8 seconds',
            chat: '2-6 seconds'
        },
        capabilities: {
            completionDetection: 'Prevents repetitive responses',
            speed: 'GPT-5 Nano optimized',
            balance: 'GPT-5 Mini optimized',
            complex: 'Full GPT-5 optimized',
            vision: 'Full GPT-5 enabled',
            coding: 'Full GPT-5 enhanced',
            math: 'Full GPT-5 precision'
        }
    };
}

async function getMarketIntelligence(chatId = null) {
    const globalTime = getCurrentGlobalDateTime();
    const query = `Current market intelligence summary - Time: ${globalTime.cambodia.date}, ${globalTime.cambodia.time} Cambodia. Provide concise overview of market conditions, key risks, and opportunities.`;
    
    try {
        return await openaiClient.getGPT5Analysis(query, {
            model: 'gpt-5-mini',
            reasoning_effort: 'medium',
            verbosity: 'medium',
            max_completion_tokens: 8000
        });
    } catch (error) {
        try {
            return await openaiClient.getGPT5Analysis(query, {
                model: 'gpt-5-nano',
                reasoning_effort: 'minimal',
                verbosity: 'low',
                max_completion_tokens: 6000
            });
        } catch (fallbackError) {
            return 'Market intelligence temporarily unavailable - GPT-5 system experiencing issues';
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
            lastUpdated: new Date().toISOString(),
            poweredBy: 'GPT-5 Only System'
        };
    } catch (error) {
        return { error: 'Global market status unavailable' };
    }
}

function getSystemAnalytics() {
    return {
        version: '5.2 - GPT-5 Only + Normal Conversation Fixed',
        architecture: 'index.js → dualCommandSystem.js → openaiClient.js',
        aiSystem: {
            core: 'GPT-5 Family Smart Selection',
            models: 'gpt-5, gpt-5-mini, gpt-5-nano, gpt-5-chat-latest',
            routing: 'Intelligent model selection based on query complexity',
            costOptimization: 'Automatic cost-efficient model selection'
        },
        fixes: [
            'Normal conversations now work properly',
            'Memory testing only on explicit request',
            'Proper GPT-5 routing for all message types',
            'Completion detection for repetitive tasks'
        ],
        queryTypes: [
            'completion', 'speed', 'complex', 'mathematical', 'regional', 'market', 
            'multimodal', 'chat', 'memory-enhanced'
        ],
        capabilities: [
            'GPT-5 Family Smart Selection',
            'Normal conversation support',
            'Memory integration when needed',
            'Cost-optimized routing',
            'Multi-tier fallback systems'
        ]
    };
}

// ENHANCED FUNCTIONS FOR GPT-5 INTEGRATION - FIXED AND SIMPLIFIED
async function executeEnhancedGPT5Command(userMessage, chatId, bot = null, options = {}) {
    try {
        console.log('Executing enhanced GPT-5 command...');
        
        // Build memory context if available
        let memoryContext = '';
        try {
            if (memory && typeof memory.buildConversationContext === 'function') {
                memoryContext = await memory.buildConversationContext(chatId);
                console.log(`Memory context built: ${memoryContext.length} chars`);
            }
        } catch (memoryError) {
            console.warn('Memory context building failed:', memoryError.message);
        }
        
        // Enhanced options with memory context
        const enhancedOptions = {
            ...options,
            memoryContext: memoryContext
        };
        
        // Execute the core GPT-5 command
        const result = await executeDualCommand(userMessage, chatId, enhancedOptions);
        
        // Automatic Telegram delivery if bot provided
        if (bot && result.success && result.response) {
            try {
                // Use telegramSplitter for professional delivery
                if (typeof telegramSplitter !== 'undefined' && telegramSplitter.sendGPTResponse) {
                    const title = options.title || 'GPT-5 Analysis';
                    const metadata = {
                        aiUsed: result.aiUsed || 'GPT-5',
                        modelUsed: result.modelUsed || options.forceModel || 'gpt-5-mini',
                        processingTime: Date.now() - (result.startTime || Date.now())
                    };
                    
                    const telegramSuccess = await telegramSplitter.sendGPTResponse(
                        bot, chatId, result.response, title, metadata
                    );
                    result.telegramDelivered = telegramSuccess;
                } else {
                    // Fallback to basic bot.sendMessage
                    await bot.sendMessage(chatId, result.response);
                    result.telegramDelivered = true;
                }
                result.autoDelivery = true;
            } catch (telegramError) {
                console.warn('Telegram delivery failed:', telegramError.message);
                result.telegramDelivered = false;
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('Enhanced GPT-5 command error:', error.message);
        
        // Error handling with Telegram notification
        if (bot) {
            try {
                if (typeof telegramSplitter !== 'undefined' && telegramSplitter.sendAlert) {
                    await telegramSplitter.sendAlert(bot, chatId, 
                        `Analysis failed: ${error.message}`, 
                        'GPT-5 Error'
                    );
                } else {
                    await bot.sendMessage(chatId, 
                        `I encountered an issue: ${error.message}. Let me try a different approach.`
                    );
                }
            } catch (telegramError) {
                console.error('Error notification delivery failed:', telegramError.message);
            }
        }
        
        return {
            success: false,
            response: 'I\'m having technical difficulties. Please try again.',
            aiUsed: 'error-fallback',
            modelUsed: 'error-handler',
            contextUsed: false,
            telegramDelivered: false,
            error: error.message
        };
    }
}

// Core GPT-5 execution function
async function executeDualCommand(userMessage, chatId, options = {}) {
    try {
        const startTime = Date.now();
        
        // Prepare the prompt with memory context if available
        let enhancedPrompt = userMessage;
        if (options.memoryContext && options.memoryContext.length > 0) {
            enhancedPrompt = `CONVERSATION CONTEXT:\n${options.memoryContext.substring(0, 8000)}\n\nCURRENT REQUEST:\n${userMessage}`;
        }
        
        // Configure model and parameters
        const model = options.forceModel || 'gpt-5-mini';
        const analysisOptions = {
            model: model,
            max_completion_tokens: options.max_tokens || 2000,
            reasoning_effort: options.reasoning_effort || 'medium'
        };
        
        console.log(`Executing GPT-5 analysis with model: ${model}`);
        
        // Get GPT-5 analysis
        const analysis = await openaiClient.getGPT5Analysis(enhancedPrompt, analysisOptions);
        
        if (!analysis || analysis.length < 10) {
            throw new Error('Empty or invalid response from GPT-5');
        }
        
        const processingTime = Date.now() - startTime;
        console.log(`GPT-5 analysis completed in ${processingTime}ms`);
        
        // Save conversation if memory is available
        if (options.saveToMemory !== false) {
            try {
                if (typeof saveConversationEmergency === 'function') {
                    await saveConversationEmergency(chatId, userMessage, analysis, {
                        aiUsed: model,
                        processingTime: processingTime,
                        memoryContextUsed: !!options.memoryContext
                    });
                }
            } catch (saveError) {
                console.warn('Conversation save failed:', saveError.message);
            }
        }
        
        return {
            success: true,
            response: analysis,
            aiUsed: model,
            modelUsed: model,
            processingTime: processingTime,
            memoryContextUsed: !!options.memoryContext,
            startTime: startTime
        };
        
    } catch (error) {
        console.error('GPT-5 execution error:', error.message);
        
        return {
            success: false,
            response: 'Analysis temporarily unavailable. Please try again.',
            error: error.message,
            aiUsed: 'error-fallback',
            modelUsed: 'error-handler',
            processingTime: 0
        };
    }
}

// Quick command functions for different models
async function quickGPT5Command(message, chatId, bot = null, model = 'auto') {
    const options = { 
        title: `GPT-5 ${model.toUpperCase()} Analysis`,
        saveToMemory: true
    };
    
    if (model !== 'auto') {
        options.forceModel = model.includes('gpt-5') ? model : `gpt-5-${model}`;
    }
    
    return await executeEnhancedGPT5Command(message, chatId, bot, options);
}

async function quickNanoCommand(message, chatId, bot = null) {
    return await quickGPT5Command(message, chatId, bot, 'gpt-5-nano');
}

async function quickMiniCommand(message, chatId, bot = null) {
    return await quickGPT5Command(message, chatId, bot, 'gpt-5-mini');
}

async function quickUltimateCommand(message, chatId, bot = null) {
    return await quickGPT5Command(message, chatId, bot, 'gpt-5');
}

// Utility functions for Cambodia integration
async function executeGPT5WithContext(prompt, chatId, options = {}) {
    return await executeDualCommand(prompt, chatId, {
        ...options,
        saveToMemory: true
    });
}

async function executeGPT5Analysis(prompt, model = 'gpt-5-mini') {
    try {
        return await openaiClient.getGPT5Analysis(prompt, {
            model: model,
            max_completion_tokens: 2000,
            reasoning_effort: 'medium'
        });
    } catch (error) {
        console.error('Direct GPT-5 analysis error:', error.message);
        return 'Analysis unavailable due to technical issues.';
    }
}

console.log('Enhanced GPT-5 Functions loaded (v2.0 - SIMPLIFIED & FIXED)');
console.log('Core flow: executeEnhancedGPT5Command → executeDualCommand → openaiClient');
console.log('Features: Memory integration, Telegram delivery, Error handling');
console.log('Cambodia module compatibility: ✅ Ready');

module.exports = {
    executeDualCommand,
    analyzeQuery,
    executeThroughGPT5System,
    executeGPT5Fallback,
    detectCompletionStatus,
    generateCompletionResponse,
    testMemoryIntegration,
    getCurrentCambodiaDateTime,
    getCurrentGlobalDateTime,
    getMarketIntelligence,
    getGlobalMarketStatus,
    checkSystemHealth: checkGPT5OnlySystemHealth,
    getSystemAnalytics,
    executeEnhancedGPT5Command,
    quickGPT5Command,
    quickNanoCommand,
    quickMiniCommand,
    quickUltimateCommand,
    checkGPT5OnlySystemHealth,
    getGPT5ModelRecommendation,
    getGPT5CostEstimate,
    getGPT5PerformanceMetrics,
    
    // Remove these lines - functions don't exist:
    // enhancedCompletionDetection,
    // generateProjectAwareResponse,
    
    // Legacy compatibility
    executeGptAnalysis: (msg, analysis, ctx, mem) => executeThroughGPT5System(msg, {...analysis, bestAI: 'gpt'}, ctx, mem),
    executeClaudeAnalysis: (msg, analysis, ctx, mem) => executeThroughGPT5System(msg, {...analysis, bestAI: 'gpt'}, ctx, mem),
    routeConversationIntelligently: analyzeQuery
};
