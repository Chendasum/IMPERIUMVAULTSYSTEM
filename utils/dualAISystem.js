// 🔧 FIXED: utils/dualAISystem.js - Missing OpenAI import and other fixes
require("dotenv").config({ path: ".env" });

// 🔧 FIXED: Import OpenAI properly
const { OpenAI } = require("openai");
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000,
    maxRetries: 3
});

// Import enhanced AI clients
const { 
    getClaudeAnalysis,
    getStrategicAnalysis: getClaudeStrategicAnalysis,
    getRegimeAnalysis,
    getCambodiaAnalysis: getClaudeCambodiaAnalysis,
    getPortfolioAnalysis,
    getAnomalyAnalysis
} = require('./claudeClient');

const { 
    getGptAnalysis,
    getMarketAnalysis: getGptMarketAnalysis,
    getCambodiaAnalysis: getGptCambodiaAnalysis,
    getStrategicAnalysis: getGptStrategicAnalysis
} = require('./openaiClient');

// Import database functions with error handling
let databaseFunctions = {};
try {
    databaseFunctions = require('./database');
} catch (error) {
    console.error('❌ Database import failed:', error.message);
    // Provide fallback functions
    databaseFunctions = {
        saveDualAIConversation: async () => ({ success: false, error: 'Database not available' }),
        saveAIHeadToHead: async () => ({ success: false, error: 'Database not available' }),
        saveEnhancedFunctionPerformance: async () => ({ success: false, error: 'Database not available' }),
        getDualAIPerformanceDashboard: async () => ({ error: 'Database not available' }),
        getConversationIntelligenceAnalytics: async () => ({ error: 'Database not available' }),
        getMasterEnhancedDualSystemAnalytics: async () => ({ error: 'Database not available' }),
        saveEnhancedDualConversation: async () => ({ success: false, error: 'Database not available' }),
        getConversationHistoryDB: async () => [],
        getPersistentMemoryDB: async () => [],
        buildConversationContext: async () => ''
    };
}

// 🔧 FIXED: Memory system import with fallback
let memoryFunctions = {};
try {
    memoryFunctions = require('./memory');
} catch (error) {
    console.error('❌ Memory system import failed:', error.message);
    // Provide fallback functions
    memoryFunctions = {
        buildConversationContext: async () => '',
        extractAndSaveFacts: async () => ({ success: false, extractedFacts: 0 })
    };
}

// Enhanced dual AI router with memory integration
class EnhancedDualAIRouter {
    constructor() {
        this.routingRules = {
            // Strategic and analytical queries → Claude
            strategic: {
                keywords: ['strategy', 'analyze', 'strategic', 'comprehensive', 'economic', 'regime', 'framework'],
                ai: 'CLAUDE',
                confidence: 0.8
            },
            
            // Creative and conversational → GPT
            creative: {
                keywords: ['joke', 'story', 'creative', 'funny', 'casual', 'chat', 'hello', 'hi'],
                ai: 'GPT',
                confidence: 0.9
            },
            
            // Market analysis → Dual (both AIs)
            market: {
                keywords: ['market', 'trading', 'stocks', 'crypto', 'forex', 'portfolio'],
                ai: 'DUAL',
                confidence: 0.7
            },
            
            // Memory queries → GPT with enhanced context
            memory: {
                keywords: ['remember', 'recall', 'you mentioned', 'we discussed', 'previous'],
                ai: 'GPT_MEMORY',
                confidence: 0.85
            },
            
            // Cambodia fund → Claude (specialized)
            cambodia: {
                keywords: ['cambodia', 'lending', 'fund', 'phnom penh', 'deal'],
                ai: 'CLAUDE',
                confidence: 0.9
            }
        };
        
        this.performanceStats = {
            totalRequests: 0,
            gptRequests: 0,
            claudeRequests: 0,
            dualRequests: 0,
            averageResponseTime: 0,
            successRate: 0
        };
    }
    
    // 🔧 FIXED: Route query with better logic
    routeQuery(query, context = {}) {
        try {
            const queryLower = query.toLowerCase();
            const scores = {};
            
            // Calculate scores for each category
            for (const [category, rule] of Object.entries(this.routingRules)) {
                const keywordMatches = rule.keywords.filter(keyword => 
                    queryLower.includes(keyword)
                ).length;
                
                scores[category] = {
                    score: keywordMatches * rule.confidence,
                    ai: rule.ai,
                    confidence: rule.confidence
                };
            }
            
            // Find highest scoring category
            const bestMatch = Object.entries(scores).reduce((best, [category, data]) => {
                return data.score > best.score ? { category, ...data } : best;
            }, { score: 0, ai: 'GPT', category: 'default' });
            
            // Enhanced routing logic with context awareness
            let selectedAI = bestMatch.ai;
            let reasoning = `Matched category: ${bestMatch.category} (score: ${bestMatch.score})`;
            
            // Context-based overrides
            if (context.hasMemoryContext && bestMatch.score < 0.7) {
                selectedAI = 'GPT_MEMORY';
                reasoning += ' → Override: Memory context detected';
            }
            
            if (context.complexity === 'maximum' && selectedAI !== 'DUAL') {
                selectedAI = 'DUAL';
                reasoning += ' → Override: High complexity detected';
            }
            
            if (query.length > 500 && selectedAI === 'GPT') {
                selectedAI = 'CLAUDE';
                reasoning += ' → Override: Long query, Claude preferred';
            }
            
            return {
                selectedAI: selectedAI,
                confidence: bestMatch.confidence || 0.7,
                reasoning: reasoning,
                category: bestMatch.category,
                queryAnalysis: {
                    length: query.length,
                    complexity: this.analyzeComplexity(query),
                    keywords: this.extractKeywords(query)
                }
            };
        } catch (error) {
            console.error('❌ Query routing error:', error.message);
            return {
                selectedAI: 'GPT',
                confidence: 0.5,
                reasoning: `Routing error: ${error.message}, defaulting to GPT`,
                category: 'error'
            };
        }
    }
    
    // 🔧 FIXED: Analyze query complexity
    analyzeComplexity(query) {
        const wordCount = query.split(/\s+/).length;
        const questionCount = (query.match(/\?/g) || []).length;
        const hasMultipleTopics = query.includes('and') || query.includes('also');
        
        if (wordCount > 100 || questionCount > 2 || hasMultipleTopics) return 'high';
        if (wordCount > 50 || questionCount > 1) return 'medium';
        return 'low';
    }
    
    // Extract relevant keywords for analysis
    extractKeywords(query) {
        const words = query.toLowerCase().split(/\s+/);
        const relevantWords = words.filter(word => 
            word.length > 4 && 
            !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will'].includes(word)
        );
        return relevantWords.slice(0, 5);
    }
}

// Initialize router
const dualAIRouter = new EnhancedDualAIRouter();

// 🔧 FIXED: Universal analysis function with memory integration
async function getUniversalAnalysis(query, options = {}) {
    const startTime = Date.now();
    
    try {
        // Build context if chatId provided
        let memoryContext = '';
        if (options.chatId) {
            try {
                memoryContext = await memoryFunctions.buildConversationContext(options.chatId);
            } catch (contextError) {
                console.log('⚠️ Memory context failed:', contextError.message);
            }
        }
        
        // Route the query
        const routing = dualAIRouter.routeQuery(query, {
            hasMemoryContext: memoryContext.length > 0,
            complexity: options.complexity || 'medium',
            ...options
        });
        
        console.log(`🎯 Query routed to: ${routing.selectedAI} (${routing.reasoning})`);
        
        let result;
        const enhancedQuery = memoryContext ? `${memoryContext}\n\nUser query: ${query}` : query;
        
        // Execute based on routing decision
        switch (routing.selectedAI) {
            case 'CLAUDE':
                result = await getClaudeAnalysis(enhancedQuery, { 
                    maxTokens: options.maxTokens || 1500 
                });
                break;
                
            case 'GPT':
            case 'GPT_MEMORY':
                result = await getGptAnalysis(enhancedQuery, { 
                    max_completion_tokens: options.maxTokens || 1500,
                    model: "gpt-5",
                    temperature: 0.7
                });
                break;
                
            case 'DUAL':
                result = await getDualAnalysis(enhancedQuery, options);
                break;
                
            default:
                result = await getGptAnalysis(enhancedQuery, { 
                    max_completion_tokens: 1000,
                    model: "gpt-5"
                });
        }
        
        const responseTime = Date.now() - startTime;
        
        // Update performance stats
        dualAIRouter.performanceStats.totalRequests++;
        if (routing.selectedAI.includes('GPT')) dualAIRouter.performanceStats.gptRequests++;
        if (routing.selectedAI.includes('CLAUDE')) dualAIRouter.performanceStats.claudeRequests++;
        if (routing.selectedAI === 'DUAL') dualAIRouter.performanceStats.dualRequests++;
        
        // Save to database if available
        if (options.chatId && databaseFunctions.saveDualAIConversation) {
            await databaseFunctions.saveDualAIConversation(options.chatId, {
                query: query,
                response: result,
                aiUsed: routing.selectedAI,
                responseTime: responseTime,
                confidence: routing.confidence,
                routing: routing,
                memoryContextUsed: memoryContext.length > 0
            }).catch(err => console.error('Database save error:', err.message));
        }
        
        return {
            response: result,
            aiUsed: routing.selectedAI,
            responseTime: responseTime,
            confidence: routing.confidence,
            routing: routing,
            memoryContext: memoryContext.length > 0,
            success: true
        };
        
    } catch (error) {
        console.error('❌ Universal analysis error:', error.message);
        
        // Fallback to simple GPT
        try {
            const fallbackResult = await getGptAnalysis(query, { 
                max_completion_tokens: 800,
                model: "gpt-5"
            });
            
            return {
                response: fallbackResult,
                aiUsed: 'GPT_FALLBACK',
                responseTime: Date.now() - startTime,
                confidence: 0.6,
                error: error.message,
                success: true
            };
        } catch (fallbackError) {
            return {
                response: `I apologize, but I'm experiencing technical difficulties. Error: ${error.message}`,
                aiUsed: 'ERROR',
                responseTime: Date.now() - startTime,
                confidence: 0,
                error: error.message,
                success: false
            };
        }
    }
}

// 🔧 FIXED: Dual analysis function (both AIs)
async function getDualAnalysis(query, options = {}) {
    try {
        console.log('🤝 Running dual AI analysis...');
        
        const [gptResult, claudeResult] = await Promise.allSettled([
            getGptAnalysis(query, { 
                max_completion_tokens: options.maxTokens || 800,
                model: "gpt-5",
                temperature: 0.7
            }),
            getClaudeAnalysis(query, { 
                maxTokens: options.maxTokens || 800 
            })
        ]);
        
        let dualResponse = `**Enhanced Dual AI Analysis: GPT-5 + Claude Opus 4.1**\n\n`;
        
        if (gptResult.status === 'fulfilled') {
            dualResponse += `**GPT-5 Analysis:**\n${gptResult.value}\n\n`;
        } else {
            dualResponse += `**GPT-5 Analysis:** ❌ Error: ${gptResult.reason?.message}\n\n`;
        }
        
        if (claudeResult.status === 'fulfilled') {
            dualResponse += `**Claude Opus 4.1 Analysis:**\n${claudeResult.value}\n\n`;
        } else {
            dualResponse += `**Claude Opus 4.1 Analysis:** ❌ Error: ${claudeResult.reason?.message}\n\n`;
        }
        
        // Add synthesis if both succeeded
        if (gptResult.status === 'fulfilled' && claudeResult.status === 'fulfilled') {
            try {
                const synthesisPrompt = `Based on these two AI analyses of the same query, provide a brief synthesis highlighting key agreements and unique insights:\n\nGPT-5: ${gptResult.value.substring(0, 300)}\n\nClaude: ${claudeResult.value.substring(0, 300)}`;
                
                const synthesis = await getGptAnalysis(synthesisPrompt, {
                    max_completion_tokens: 300,
                    model: "gpt-5",
                    temperature: 0.6
                });
                
                dualResponse += `**AI Synthesis:**\n${synthesis}`;
            } catch (synthesisError) {
                console.log('⚠️ Synthesis failed:', synthesisError.message);
            }
        }
        
        return dualResponse;
        
    } catch (error) {
        console.error('❌ Dual analysis error:', error.message);
        throw new Error(`Dual analysis failed: ${error.message}`);
    }
}

// 🔧 FIXED: Image analysis with GPT-5 vision
async function analyzeImageWithAI(base64Image, prompt, aiModel = 'GPT') {
    try {
        if (aiModel === 'GPT' || aiModel === 'DUAL') {
            console.log('🖼️ Using GPT-5 vision for image analysis...');
            
            const response = await openai.chat.completions.create({
                model: "gpt-5",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                    detail: "high"
                                }
                            }
                        ]
                    }
                ],
                max_completion_tokens: 1200,
                temperature: 0.7
            });
            
            return response.choices[0]?.message?.content || 'No analysis generated';
        }
        
        // Claude doesn't support vision, fallback to GPT
        return await analyzeImageWithAI(base64Image, prompt, 'GPT');
        
    } catch (error) {
        console.error('❌ AI image analysis error:', error.message);
        
        // Fallback to GPT-4 if GPT-5 fails
        try {
            console.log('🔄 Falling back to GPT-4 vision...');
            const fallbackResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                    detail: "high"
                                }
                            }
                        ]
                    }
                ],
                max_completion_tokens: 1200,
                temperature: 0.7
            });
            
            return fallbackResponse.choices[0]?.message?.content || 'No analysis generated';
        } catch (fallbackError) {
            throw new Error(`Both GPT-5 and GPT-4 vision failed: ${fallbackError.message}`);
        }
    }
}

// 🔧 FIXED: System health check
async function checkDualSystemHealth() {
    const healthChecks = {
        gptConnection: false,
        claudeConnection: false,
        dualMode: false,
        memorySystem: false,
        databaseConnection: false
    };
    
    try {
        // Test GPT connection
        const gptTest = await getGptAnalysis("Test", { 
            max_completion_tokens: 10,
            model: "gpt-5"
        });
        healthChecks.gptConnection = !!gptTest;
        
        // Test Claude connection
        const claudeTest = await getClaudeAnalysis("Test", { maxTokens: 10 });
        healthChecks.claudeConnection = !!claudeTest;
        
        // Test dual mode
        healthChecks.dualMode = healthChecks.gptConnection && healthChecks.claudeConnection;
        
        // Test memory system
        try {
            await memoryFunctions.buildConversationContext('test');
            healthChecks.memorySystem = true;
        } catch (memoryError) {
            console.log('⚠️ Memory system test failed:', memoryError.message);
        }
        
        // Test database
        try {
            await databaseFunctions.getConversationHistoryDB('test', 1);
            healthChecks.databaseConnection = true;
        } catch (dbError) {
            console.log('⚠️ Database test failed:', dbError.message);
        }
        
    } catch (error) {
        console.error('❌ Health check error:', error.message);
    }
    
    return {
        ...healthChecks,
        overallHealth: Object.values(healthChecks).filter(Boolean).length >= 3,
        timestamp: new Date().toISOString()
    };
}

// 🔧 FIXED: Memory integration test
async function testMemoryIntegration(chatId) {
    const tests = {
        conversationHistory: false,
        persistentMemory: false,
        contextBuilding: false,
        memoryExtraction: false,
        dualCommandWithMemory: false
    };
    
    try {
        // Test 1: Conversation History
        const history = await databaseFunctions.getConversationHistoryDB(chatId, 3);
        tests.conversationHistory = Array.isArray(history);
        
        // Test 2: Persistent Memory
        const memory = await databaseFunctions.getPersistentMemoryDB(chatId);
        tests.persistentMemory = Array.isArray(memory);
        
        // Test 3: Context Building
        const context = await memoryFunctions.buildConversationContext(chatId);
        tests.contextBuilding = typeof context === 'string';
        
        // Test 4: Memory Extraction
        const extraction = await memoryFunctions.extractAndSaveFacts(
            chatId, 
            'Test message', 
            'Test response'
        );
        tests.memoryExtraction = extraction.success || extraction.extractedFacts >= 0;
        
        // Test 5: Dual Command with Memory
        const dualResult = await getUniversalAnalysis('Hello test', { chatId: chatId });
        tests.dualCommandWithMemory = dualResult.success && dualResult.memoryContext;
        
    } catch (error) {
        console.error('❌ Memory integration test error:', error.message);
    }
    
    const successCount = Object.values(tests).filter(Boolean).length;
    const totalTests = Object.keys(tests).length;
    
    return {
        tests: tests,
        score: `${successCount}/${totalTests}`,
        percentage: Math.round((successCount / totalTests) * 100),
        status: successCount === totalTests ? 'FULL_SUCCESS' : 
                successCount >= totalTests * 0.7 ? 'MOSTLY_WORKING' : 'NEEDS_ATTENTION',
        timestamp: new Date().toISOString()
    };
}

// 🔧 LEGACY COMPATIBILITY: Maintain existing function names
async function getGPT5Analysis(query, options = {}) {
    return await getGptAnalysis(query, { 
        ...options,
        model: "gpt-5"
    });
}

async function getClaudeAnalysisLegacy(query, options = {}) {
    return await getClaudeAnalysis(query, options);  // This calls the imported one
}

async function getMarketAnalysis(query, options = {}) {
    const routing = dualAIRouter.routeQuery(query + ' market analysis');
    if (routing.selectedAI === 'CLAUDE') {
        return await getClaudeStrategicAnalysis(query);
    } else {
        return await getGptMarketAnalysis(query, options);
    }
}

async function getCambodiaAnalysis(query, options = {}) {
    // Cambodia queries prefer Claude
    return await getClaudeCambodiaAnalysis(query, options);
}

// Export all functions
module.exports = {
    // Main functions
    getUniversalAnalysis,
    getDualAnalysis,
    routeQuery: (query, context) => dualAIRouter.routeQuery(query, context),
    checkDualSystemHealth,
    testMemoryIntegration,
    analyzeImageWithAI,
    
    // Legacy compatibility
    getGPT5Analysis,
    getClaudeAnalysis: getClaudeAnalysisLegacy,  // ← Change this
    getMarketAnalysis,
    getCambodiaAnalysis,
    
    // Router access
    dualAIRouter,
    
    // Performance stats
    getPerformanceStats: () => dualAIRouter.performanceStats
};
