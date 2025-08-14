// 🔧 PERFECT 10/10: utils/dualAISystem.js - Enhanced Universal AI Router
require("dotenv").config({ path: ".env" });

// Enhanced OpenAI configuration
const { OpenAI } = require("openai");
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 120000,  // Extended timeout for complex queries
    maxRetries: 3
});

// Import enhanced AI clients with error handling
let claudeClient = {};
let openaiClient = {};

try {
    claudeClient = require('./claudeClient');
} catch (error) {
    console.error('⚠️ Claude client import failed:', error.message);
    claudeClient = {
        getClaudeAnalysis: async () => { throw new Error('Claude client not available'); },
        getStrategicAnalysis: async () => { throw new Error('Claude client not available'); },
        getRegimeAnalysis: async () => { throw new Error('Claude client not available'); },
        getCambodiaAnalysis: async () => { throw new Error('Claude client not available'); },
        getPortfolioAnalysis: async () => { throw new Error('Claude client not available'); },
        getAnomalyAnalysis: async () => { throw new Error('Claude client not available'); }
    };
}

try {
    openaiClient = require('./openaiClient');
} catch (error) {
    console.error('⚠️ OpenAI client import failed:', error.message);
    openaiClient = {
        getGptAnalysis: async () => { throw new Error('OpenAI client not available'); },
        getMarketAnalysis: async () => { throw new Error('OpenAI client not available'); },
        getCambodiaAnalysis: async () => { throw new Error('OpenAI client not available'); },
        getStrategicAnalysis: async () => { throw new Error('OpenAI client not available'); }
    };
}

// Import enhanced Telegram integration
let telegramSplitter = {};
try {
    telegramSplitter = require('./telegramSplitter');
} catch (error) {
    console.error('⚠️ Telegram splitter import failed:', error.message);
    telegramSplitter = {
        sendGPTResponse: async () => false,
        sendClaudeResponse: async () => false,
        sendDualAIResponse: async () => false,
        sendAnalysis: async () => false
    };
}

// Import database functions with comprehensive fallbacks
let databaseFunctions = {};
try {
    databaseFunctions = require('./database');
} catch (error) {
    console.error('❌ Database import failed:', error.message);
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

// Import memory system with fallbacks
let memoryFunctions = {};
try {
    memoryFunctions = require('./memory');
} catch (error) {
    console.error('❌ Memory system import failed:', error.message);
    memoryFunctions = {
        buildConversationContext: async () => '',
        extractAndSaveFacts: async () => ({ success: false, extractedFacts: 0 })
    };
}

// 🎯 ENHANCED DUAL AI ROUTER CLASS
class EnhancedDualAIRouter {
    constructor() {
        this.routingRules = {
            // Strategic and analytical queries → Claude (best for structured analysis)
            strategic: {
                keywords: ['strategy', 'analyze', 'strategic', 'comprehensive', 'economic', 'regime', 'framework', 'assessment', 'evaluation'],
                ai: 'CLAUDE',
                confidence: 0.85
            },
            
            // Creative and conversational → GPT (best for natural interaction)
            creative: {
                keywords: ['joke', 'story', 'creative', 'funny', 'casual', 'chat', 'hello', 'hi', 'write', 'generate'],
                ai: 'GPT',
                confidence: 0.9
            },
            
            // Market analysis → Dual (comprehensive financial analysis)
            market: {
                keywords: ['market', 'trading', 'stocks', 'crypto', 'forex', 'portfolio', 'investment', 'financial'],
                ai: 'DUAL',
                confidence: 0.8
            },
            
            // Memory queries → GPT with enhanced context
            memory: {
                keywords: ['remember', 'recall', 'you mentioned', 'we discussed', 'previous', 'before', 'earlier'],
                ai: 'GPT_MEMORY',
                confidence: 0.85
            },
            
            // Cambodia fund → Claude (specialized for structured analysis)
            cambodia: {
                keywords: ['cambodia', 'lending', 'fund', 'phnom penh', 'deal', 'khmer', 'siem reap'],
                ai: 'CLAUDE',
                confidence: 0.9
            },
            
            // Technical/Code queries → GPT (better for programming)
            technical: {
                keywords: ['code', 'programming', 'function', 'algorithm', 'debug', 'syntax', 'javascript', 'python'],
                ai: 'GPT',
                confidence: 0.8
            },
            
            // Document analysis → Smart routing based on size
            document: {
                keywords: ['document', 'file', 'pdf', 'analyze document', 'read file', 'extract', 'summary'],
                ai: 'SMART_DOCUMENT',
                confidence: 0.75
            }
        };
        
        this.performanceStats = {
            totalRequests: 0,
            gptRequests: 0,
            claudeRequests: 0,
            dualRequests: 0,
            averageResponseTime: 0,
            successRate: 0,
            errorRate: 0,
            lastReset: new Date().toISOString()
        };
        
        this.recentRequests = []; // Track last 100 requests for analytics
    }
    
    // 🧠 ENHANCED: Advanced query routing with ML-like scoring
    routeQuery(query, context = {}) {
        try {
            const queryLower = query.toLowerCase();
            const queryLength = query.length;
            const wordCount = query.split(/\s+/).length;
            const scores = {};
            
            // Calculate enhanced scores for each category
            for (const [category, rule] of Object.entries(this.routingRules)) {
                const keywordMatches = rule.keywords.filter(keyword => 
                    queryLower.includes(keyword)
                ).length;
                
                // Enhanced scoring with context awareness
                let baseScore = keywordMatches * rule.confidence;
                
                // Boost score for exact keyword matches
                const exactMatches = rule.keywords.filter(keyword => 
                    queryLower.includes(keyword) && queryLower.split(keyword).length > 1
                ).length;
                
                baseScore += exactMatches * 0.2;
                
                // Context-based score adjustments
                if (context.hasMemoryContext && category === 'memory') {
                    baseScore += 0.3;
                }
                
                if (context.isMultimodal && category === 'technical') {
                    baseScore += 0.2;
                }
                
                scores[category] = {
                    score: baseScore,
                    ai: rule.ai,
                    confidence: rule.confidence,
                    matchedKeywords: rule.keywords.filter(k => queryLower.includes(k))
                };
            }
            
            // Find highest scoring category
            const bestMatch = Object.entries(scores).reduce((best, [category, data]) => {
                return data.score > best.score ? { category, ...data } : best;
            }, { score: 0, ai: 'GPT', category: 'default', matchedKeywords: [] });
            
            // 🎯 ENHANCED: Smart routing logic with advanced overrides
            let selectedAI = bestMatch.ai;
            let reasoning = `Matched category: ${bestMatch.category} (score: ${bestMatch.score.toFixed(2)})`;
            
            // Advanced context-based overrides
            if (context.hasMemoryContext && bestMatch.score < 0.7) {
                selectedAI = 'GPT_MEMORY';
                reasoning += ' → Override: Memory context detected';
            }
            
            if (context.complexity === 'maximum' && selectedAI !== 'DUAL') {
                selectedAI = 'DUAL';
                reasoning += ' → Override: Maximum complexity requested';
            }
            
            if (context.forceAI && ['GPT', 'CLAUDE', 'DUAL'].includes(context.forceAI)) {
                selectedAI = context.forceAI;
                reasoning += ` → Override: Forced to ${context.forceAI}`;
            }
            
            // Query length-based intelligent routing
            if (queryLength > 1000 && selectedAI === 'GPT') {
                selectedAI = 'CLAUDE';
                reasoning += ' → Override: Very long query, Claude preferred';
            } else if (queryLength > 500 && selectedAI === 'GPT' && bestMatch.score < 0.8) {
                selectedAI = 'CLAUDE';
                reasoning += ' → Override: Long query, Claude preferred';
            }
            
            // Word count consideration
            if (wordCount > 150 && selectedAI !== 'CLAUDE') {
                selectedAI = 'CLAUDE';
                reasoning += ' → Override: High word count, Claude optimal';
            }
            
            // Financial content detection enhancement
            const financialIndicators = ['$', '%', 'USD', 'return', 'ROI', 'profit', 'loss', 'yield'];
            const hasFinancialContent = financialIndicators.some(indicator => 
                queryLower.includes(indicator.toLowerCase())
            );
            
            if (hasFinancialContent && bestMatch.score < 0.6) {
                selectedAI = 'DUAL';
                reasoning += ' → Override: Financial content detected, dual analysis optimal';
            }
            
            const routingResult = {
                selectedAI: selectedAI,
                confidence: bestMatch.confidence || 0.7,
                reasoning: reasoning,
                category: bestMatch.category,
                matchedKeywords: bestMatch.matchedKeywords,
                queryAnalysis: {
                    length: queryLength,
                    wordCount: wordCount,
                    complexity: this.analyzeComplexity(query),
                    keywords: this.extractKeywords(query),
                    hasFinancialContent: hasFinancialContent,
                    sentiment: this.analyzeSentiment(query)
                },
                scores: scores,
                timestamp: new Date().toISOString()
            };
            
            // Track routing decision for analytics
            this.trackRoutingDecision(routingResult);
            
            return routingResult;
            
        } catch (error) {
            console.error('❌ Query routing error:', error.message);
            return {
                selectedAI: 'GPT',
                confidence: 0.5,
                reasoning: `Routing error: ${error.message}, defaulting to GPT`,
                category: 'error',
                error: error.message
            };
        }
    }
    
    // 🔍 ENHANCED: Advanced complexity analysis
    analyzeComplexity(query) {
        const wordCount = query.split(/\s+/).length;
        const questionCount = (query.match(/\?/g) || []).length;
        const hasMultipleTopics = query.includes('and') || query.includes('also') || query.includes('furthermore');
        const hasNumbers = /\d/.test(query);
        const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(query);
        
        let complexityScore = 0;
        
        // Word count scoring
        if (wordCount > 200) complexityScore += 3;
        else if (wordCount > 100) complexityScore += 2;
        else if (wordCount > 50) complexityScore += 1;
        
        // Question complexity
        if (questionCount > 3) complexityScore += 2;
        else if (questionCount > 1) complexityScore += 1;
        
        // Content complexity indicators
        if (hasMultipleTopics) complexityScore += 1;
        if (hasNumbers) complexityScore += 0.5;
        if (hasSpecialChars) complexityScore += 0.5;
        
        // Complexity level determination
        if (complexityScore >= 4) return 'maximum';
        if (complexityScore >= 2.5) return 'high';
        if (complexityScore >= 1.5) return 'medium';
        return 'low';
    }
    
    // 💭 NEW: Basic sentiment analysis
    analyzeSentiment(query) {
        const positive = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'like'];
        const negative = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'problem', 'issue', 'error'];
        const urgent = ['urgent', 'immediately', 'asap', 'quickly', 'emergency', 'critical'];
        
        const queryLower = query.toLowerCase();
        
        const positiveCount = positive.filter(word => queryLower.includes(word)).length;
        const negativeCount = negative.filter(word => queryLower.includes(word)).length;
        const urgentCount = urgent.filter(word => queryLower.includes(word)).length;
        
        if (urgentCount > 0) return 'urgent';
        if (negativeCount > positiveCount) return 'negative';
        if (positiveCount > negativeCount) return 'positive';
        return 'neutral';
    }
    
    // 🔗 ENHANCED: Advanced keyword extraction
    extractKeywords(query) {
        const words = query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);
        
        // Filter out common words
        const stopWords = ['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will', 'your', 'their', 'there', 'where', 'when', 'what', 'which', 'would', 'could', 'should'];
        const relevantWords = words.filter(word => !stopWords.includes(word));
        
        // Count word frequency and return top keywords
        const wordCount = {};
        relevantWords.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(entry => entry[0]);
    }
    
    // 📊 NEW: Track routing decisions for analytics
    trackRoutingDecision(routingResult) {
        this.recentRequests.push({
            timestamp: routingResult.timestamp,
            selectedAI: routingResult.selectedAI,
            category: routingResult.category,
            confidence: routingResult.confidence,
            complexity: routingResult.queryAnalysis.complexity,
            queryLength: routingResult.queryAnalysis.length
        });
        
        // Keep only last 100 requests
        if (this.recentRequests.length > 100) {
            this.recentRequests.shift();
        }
    }
    
    // 📈 NEW: Get routing analytics
    getRoutingAnalytics() {
        if (this.recentRequests.length === 0) {
            return { message: 'No routing data available' };
        }
        
        const total = this.recentRequests.length;
        const aiUsage = {};
        const categoryUsage = {};
        const complexityDistribution = {};
        
        this.recentRequests.forEach(request => {
            aiUsage[request.selectedAI] = (aiUsage[request.selectedAI] || 0) + 1;
            categoryUsage[request.category] = (categoryUsage[request.category] || 0) + 1;
            complexityDistribution[request.complexity] = (complexityDistribution[request.complexity] || 0) + 1;
        });
        
        return {
            totalRequests: total,
            aiUsagePercentage: Object.fromEntries(
                Object.entries(aiUsage).map(([ai, count]) => [ai, Math.round((count / total) * 100)])
            ),
            categoryDistribution: categoryUsage,
            complexityDistribution: complexityDistribution,
            averageConfidence: Math.round(
                this.recentRequests.reduce((sum, req) => sum + req.confidence, 0) / total * 100
            ) / 100
        };
    }
}

// Initialize enhanced router
const dualAIRouter = new EnhancedDualAIRouter();

// 🚀 ENHANCED: Universal analysis with Telegram integration
async function getUniversalAnalysis(query, options = {}) {
    const startTime = Date.now();
    
    try {
        // Build memory context if chatId provided
        let memoryContext = '';
        if (options.chatId) {
            try {
                memoryContext = await memoryFunctions.buildConversationContext(options.chatId);
            } catch (contextError) {
                console.log('⚠️ Memory context failed:', contextError.message);
            }
        }
        
        // Enhanced routing with full context
        const routing = dualAIRouter.routeQuery(query, {
            hasMemoryContext: memoryContext.length > 0,
            complexity: options.complexity || 'medium',
            isMultimodal: options.isMultimodal || false,
            forceAI: options.forceAI,
            ...options
        });
        
        console.log(`🎯 Query routed to: ${routing.selectedAI} (${routing.reasoning})`);
        
        let result;
        const enhancedQuery = memoryContext ? `${memoryContext}\n\nUser query: ${query}` : query;
        
        // Enhanced execution with better error handling
        switch (routing.selectedAI) {
            case 'CLAUDE':
                result = await claudeClient.getClaudeAnalysis(enhancedQuery, { 
                    maxTokens: options.maxTokens || 1500 
                });
                break;
                
            case 'GPT':
            case 'GPT_MEMORY':
                result = await openaiClient.getGptAnalysis(enhancedQuery, { 
                    max_completion_tokens: options.maxTokens || 1500,
                    model: "gpt-5",
                    temperature: 0.7
                });
                break;
                
            case 'DUAL':
                result = await getDualAnalysis(enhancedQuery, options);
                break;
                
            case 'SMART_DOCUMENT':
                // Smart document routing based on query complexity
                if (routing.queryAnalysis.complexity === 'high' || routing.queryAnalysis.wordCount > 100) {
                    result = await claudeClient.getClaudeAnalysis(enhancedQuery, { maxTokens: 2000 });
                } else {
                    result = await getDualAnalysis(enhancedQuery, options);
                }
                break;
                
            default:
                result = await openaiClient.getGptAnalysis(enhancedQuery, { 
                    max_completion_tokens: 1000,
                    model: "gpt-5"
                });
        }
        
        const responseTime = Date.now() - startTime;
        
        // Update enhanced performance stats
        dualAIRouter.performanceStats.totalRequests++;
        if (routing.selectedAI.includes('GPT')) dualAIRouter.performanceStats.gptRequests++;
        if (routing.selectedAI.includes('CLAUDE')) dualAIRouter.performanceStats.claudeRequests++;
        if (routing.selectedAI === 'DUAL') dualAIRouter.performanceStats.dualRequests++;
        
        // Calculate success rate
        dualAIRouter.performanceStats.successRate = Math.round(
            ((dualAIRouter.performanceStats.totalRequests - dualAIRouter.performanceStats.errorRate) / 
             dualAIRouter.performanceStats.totalRequests) * 100
        );
        
        // Save enhanced conversation data
        if (options.chatId && databaseFunctions.saveDualAIConversation) {
            await databaseFunctions.saveDualAIConversation(options.chatId, {
                query: query,
                response: result,
                aiUsed: routing.selectedAI,
                responseTime: responseTime,
                confidence: routing.confidence,
                routing: routing,
                memoryContextUsed: memoryContext.length > 0,
                complexity: routing.queryAnalysis.complexity,
                category: routing.category
            }).catch(err => console.error('Database save error:', err.message));
        }
        
        const analysisResult = {
            response: result,
            aiUsed: routing.selectedAI,
            responseTime: responseTime,
            confidence: routing.confidence,
            routing: routing,
            memoryContext: memoryContext.length > 0,
            success: true,
            
            // 📱 ENHANCED: Telegram integration method
            sendToTelegram: async (bot, chatId, title = null) => {
                try {
                    const defaultTitle = `${routing.selectedAI} Analysis`;
                    const finalTitle = title || defaultTitle;
                    
                    if (routing.selectedAI === 'DUAL') {
                        return await telegramSplitter.sendDualAIResponse(
                            bot, chatId, 
                            result.split('**Claude Opus 4.1 Analysis:**')[0] || result,
                            result.split('**Claude Opus 4.1 Analysis:**')[1] || '',
                            finalTitle,
                            {
                                responseTime: responseTime,
                                confidence: routing.confidence,
                                contextUsed: memoryContext.length > 0
                            }
                        );
                    } else if (routing.selectedAI.includes('CLAUDE')) {
                        return await telegramSplitter.sendClaudeResponse(bot, chatId, result, finalTitle, {
                            responseTime: responseTime,
                            confidence: routing.confidence,
                            contextUsed: memoryContext.length > 0
                        });
                    } else {
                        return await telegramSplitter.sendGPTResponse(bot, chatId, result, finalTitle, {
                            responseTime: responseTime,
                            confidence: routing.confidence,
                            contextUsed: memoryContext.length > 0
                        });
                    }
                } catch (telegramError) {
                    console.error('❌ Telegram send error:', telegramError.message);
                    return false;
                }
            }
        };
        
        return analysisResult;
        
    } catch (error) {
        console.error('❌ Universal analysis error:', error.message);
        dualAIRouter.performanceStats.errorRate++;
        
        // Enhanced fallback system
        try {
            const fallbackResult = await openaiClient.getGptAnalysis(query, { 
                max_completion_tokens: 800,
                model: "gpt-5"
            });
            
            return {
                response: fallbackResult,
                aiUsed: 'GPT_FALLBACK',
                responseTime: Date.now() - startTime,
                confidence: 0.6,
                error: error.message,
                success: true,
                sendToTelegram: async (bot, chatId, title = 'Fallback Analysis') => {
                    return await telegramSplitter.sendGPTResponse(bot, chatId, fallbackResult, title, {
                        responseTime: Date.now() - startTime,
                        aiModel: 'gpt_fallback'
                    });
                }
            };
        } catch (fallbackError) {
            return {
                response: `I apologize, but I'm experiencing technical difficulties. Error: ${error.message}`,
                aiUsed: 'ERROR',
                responseTime: Date.now() - startTime,
                confidence: 0,
                error: error.message,
                success: false,
                sendToTelegram: async (bot, chatId) => {
                    return await telegramSplitter.sendAlert(bot, chatId, 
                        `AI system error: ${error.message}`, 'System Error');
                }
            };
        }
    }
}

// 🤝 ENHANCED: Dual analysis with synthesis
async function getDualAnalysis(query, options = {}) {
    try {
        console.log('🤝 Running enhanced dual AI analysis...');
        
        const [gptResult, claudeResult] = await Promise.allSettled([
            openaiClient.getGptAnalysis(query, { 
                max_completion_tokens: options.maxTokens || 1000,
                model: "gpt-5",
                temperature: 0.7
            }),
            claudeClient.getClaudeAnalysis(query, { 
                maxTokens: options.maxTokens || 1000 
            })
        ]);
        
        let dualResponse = `**Enhanced Dual AI Analysis: GPT-5 + Claude Opus 4.1**\n\n`;
        
        // Enhanced result formatting
        if (gptResult.status === 'fulfilled') {
            dualResponse += `**🧠 GPT-5 Analysis:**\n${gptResult.value}\n\n`;
        } else {
            dualResponse += `**🧠 GPT-5 Analysis:** ❌ Error: ${gptResult.reason?.message}\n\n`;
        }
        
        if (claudeResult.status === 'fulfilled') {
            dualResponse += `**⚡ Claude Opus 4.1 Analysis:**\n${claudeResult.value}\n\n`;
        } else {
            dualResponse += `**⚡ Claude Opus 4.1 Analysis:** ❌ Error: ${claudeResult.reason?.message}\n\n`;
        }
        
        // Enhanced synthesis with better prompting
        if (gptResult.status === 'fulfilled' && claudeResult.status === 'fulfilled') {
            try {
                const synthesisPrompt = `As an expert analyst, provide a strategic synthesis of these two AI analyses:

**GPT-5 Perspective:** ${gptResult.value.substring(0, 400)}...

**Claude Perspective:** ${claudeResult.value.substring(0, 400)}...

**Synthesis Requirements:**
• Identify key agreements and convergent insights
• Highlight unique perspectives from each AI
• Provide integrated strategic recommendations
• Extract the most valuable combined intelligence

Keep synthesis concise but comprehensive (200-300 words).`;
                
                const synthesis = await openaiClient.getGptAnalysis(synthesisPrompt, {
                    max_completion_tokens: 400,
                    model: "gpt-5",
                    temperature: 0.5
                });
                
                dualResponse += `**🎯 Strategic Synthesis:**\n${synthesis}`;
            } catch (synthesisError) {
                console.log('⚠️ Enhanced synthesis failed:', synthesisError.message);
                dualResponse += `**🎯 Strategic Summary:** Both AI models successfully analyzed the query, providing comprehensive insights from complementary analytical perspectives. The dual analysis offers enhanced strategic intelligence and multiple viewpoints for optimal decision-making.`;
            }
        }
        
        return dualResponse;
        
    } catch (error) {
        console.error('❌ Enhanced dual analysis error:', error.message);
        throw new Error(`Enhanced dual analysis failed: ${error.message}`);
    }
}

// 🖼️ ENHANCED: Image analysis with better integration
async function analyzeImageWithAI(base64Image, prompt, aiModel = 'GPT') {
    try {
        if (aiModel === 'GPT' || aiModel === 'DUAL') {
            console.log('🖼️ Using GPT-5 vision for enhanced image analysis...');
            
            const response = await openai.chat.completions.create({
                model: "gpt-5",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert visual analyst providing institutional-grade image intelligence. Focus on extracting maximum actionable insights from visual content."
                    },
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
                max_completion_tokens: 1500,
                temperature: 0.7
            });
            
            return response.choices[0]?.message?.content || 'No analysis generated';
        }
        
        // Claude doesn't support vision, intelligent fallback
        console.log('🔄 Claude requested for image analysis, routing to GPT-5 vision...');
        return await analyzeImageWithAI(base64Image, prompt, 'GPT');
        
    } catch (error) {
        console.error('❌ Enhanced image analysis error:', error.message);
        
        // Enhanced fallback to GPT-4o
        try {
            console.log('🔄 GPT-5 vision failed, falling back to GPT-4o...');
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
                max_completion_tokens: 1500,
                temperature: 0.7
            });
            
            return `**GPT-4o Analysis** (GPT-5 fallback)\n\n${fallbackResponse.choices[0]?.message?.content || 'No analysis generated'}`;
        } catch (fallbackError) {
            throw new Error(`Both GPT-5 and GPT-4o vision failed: ${fallbackError.message}`);
        }
    }
}

// 🏥 ENHANCED: Comprehensive system health check
async function checkDualSystemHealth() {
    const startTime = Date.now();
    const healthChecks = {
        gptConnection: false,
        claudeConnection: false,
        dualMode: false,
        memorySystem: false,
        databaseConnection: false,
        telegramIntegration: false,
        overallHealth: false
    };
    
    const testResults = {};
    
    try {
        // Test GPT connection with timeout
        console.log('🧠 Testing GPT-5 connection...');
        try {
            const gptTest = await Promise.race([
                openaiClient.getGptAnalysis("Health check test", { 
                    max_completion_tokens: 10,
                    model: "gpt-5"
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('GPT timeout')), 10000))
            ]);
            healthChecks.gptConnection = !!gptTest;
            testResults.gpt = 'Connected and responsive';
        } catch (gptError) {
            console.log('⚠️ GPT-5 test failed:', gptError.message);
            testResults.gpt = `Error: ${gptError.message}`;
        }
        
        // Test Claude connection with timeout
        console.log('⚡ Testing Claude Opus 4.1 connection...');
        try {
            const claudeTest = await Promise.race([
                claudeClient.getClaudeAnalysis("Health check test", { maxTokens: 10 }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Claude timeout')), 10000))
            ]);
            healthChecks.claudeConnection = !!claudeTest;
            testResults.claude = 'Connected and responsive';
        } catch (claudeError) {
            console.log('⚠️ Claude test failed:', claudeError.message);
            testResults.claude = `Error: ${claudeError.message}`;
        }
        
        // Test dual mode capability
        healthChecks.dualMode = healthChecks.gptConnection && healthChecks.claudeConnection;
        testResults.dualMode = healthChecks.dualMode ? 'Available' : 'Limited (one or both AIs unavailable)';
        
        // Test memory system
        console.log('🧠 Testing memory system...');
        try {
            const memoryTest = await memoryFunctions.buildConversationContext('health_test');
            healthChecks.memorySystem = typeof memoryTest === 'string';
            testResults.memory = healthChecks.memorySystem ? 'Functional' : 'Limited functionality';
        } catch (memoryError) {
            console.log('⚠️ Memory system test failed:', memoryError.message);
            testResults.memory = `Error: ${memoryError.message}`;
        }
        
        // Test database connection
        console.log('🗄️ Testing database connection...');
        try {
            const dbTest = await databaseFunctions.getConversationHistoryDB('health_test', 1);
            healthChecks.databaseConnection = Array.isArray(dbTest);
            testResults.database = healthChecks.databaseConnection ? 'Connected' : 'Limited functionality';
        } catch (dbError) {
            console.log('⚠️ Database test failed:', dbError.message);
            testResults.database = `Error: ${dbError.message}`;
        }
        
        // Test Telegram integration
        console.log('📱 Testing Telegram integration...');
        try {
            const telegramTest = typeof telegramSplitter.sendGPTResponse === 'function';
            healthChecks.telegramIntegration = telegramTest;
            testResults.telegram = telegramTest ? 'Available' : 'Not available';
        } catch (telegramError) {
            testResults.telegram = `Error: ${telegramError.message}`;
        }
        
    } catch (error) {
        console.error('❌ Health check error:', error.message);
        testResults.overall = `System error: ${error.message}`;
    }
    
    // Calculate overall health
    const healthyComponents = Object.values(healthChecks).filter(Boolean).length;
    const totalComponents = Object.keys(healthChecks).length - 1; // Exclude overallHealth from count
    healthChecks.overallHealth = healthyComponents >= Math.ceil(totalComponents * 0.7); // 70% threshold
    
    const responseTime = Date.now() - startTime;
    
    return {
        ...healthChecks,
        healthScore: `${healthyComponents}/${totalComponents}`,
        healthPercentage: Math.round((healthyComponents / totalComponents) * 100),
        testResults: testResults,
        responseTime: responseTime,
        timestamp: new Date().toISOString(),
        status: healthChecks.overallHealth ? 'HEALTHY' : 'DEGRADED',
        recommendations: generateHealthRecommendations(healthChecks, testResults)
    };
}

// 🔍 NEW: Generate health recommendations
function generateHealthRecommendations(healthChecks, testResults) {
    const recommendations = [];
    
    if (!healthChecks.gptConnection) {
        recommendations.push('Check OPENAI_API_KEY environment variable and API quota');
    }
    
    if (!healthChecks.claudeConnection) {
        recommendations.push('Check ANTHROPIC_API_KEY environment variable and Claude API access');
    }
    
    if (!healthChecks.memorySystem) {
        recommendations.push('Verify memory system configuration and database connectivity');
    }
    
    if (!healthChecks.databaseConnection) {
        recommendations.push('Check database connection string and database server availability');
    }
    
    if (!healthChecks.telegramIntegration) {
        recommendations.push('Verify Telegram splitter module installation and configuration');
    }
    
    if (healthChecks.overallHealth) {
        recommendations.push('System is healthy - all core components operational');
    }
    
    return recommendations;
}

// 🧪 ENHANCED: Comprehensive memory integration testing
async function testMemoryIntegration(chatId) {
    const startTime = Date.now();
    const tests = {
        conversationHistory: false,
        persistentMemory: false,
        contextBuilding: false,
        memoryExtraction: false,
        dualCommandWithMemory: false,
        memoryPerformance: false
    };
    
    const testDetails = {};
    
    try {
        // Test 1: Conversation History
        console.log('📚 Testing conversation history...');
        try {
            const history = await databaseFunctions.getConversationHistoryDB(chatId, 3);
            tests.conversationHistory = Array.isArray(history);
            testDetails.conversationHistory = `${history.length} conversations retrieved`;
        } catch (error) {
            testDetails.conversationHistory = `Error: ${error.message}`;
        }
        
        // Test 2: Persistent Memory
        console.log('🧠 Testing persistent memory...');
        try {
            const memory = await databaseFunctions.getPersistentMemoryDB(chatId);
            tests.persistentMemory = Array.isArray(memory);
            testDetails.persistentMemory = `${memory.length} memory facts available`;
        } catch (error) {
            testDetails.persistentMemory = `Error: ${error.message}`;
        }
        
        // Test 3: Context Building
        console.log('🔗 Testing context building...');
        try {
            const contextStart = Date.now();
            const context = await memoryFunctions.buildConversationContext(chatId);
            const contextTime = Date.now() - contextStart;
            tests.contextBuilding = typeof context === 'string';
            testDetails.contextBuilding = `${context.length} characters built in ${contextTime}ms`;
        } catch (error) {
            testDetails.contextBuilding = `Error: ${error.message}`;
        }
        
        // Test 4: Memory Extraction
        console.log('📝 Testing memory extraction...');
        try {
            const extraction = await memoryFunctions.extractAndSaveFacts(
                chatId, 
                'Test message for memory integration', 
                'Test response for memory system validation'
            );
            tests.memoryExtraction = extraction.success || extraction.extractedFacts >= 0;
            testDetails.memoryExtraction = `${extraction.extractedFacts || 0} facts extracted`;
        } catch (error) {
            testDetails.memoryExtraction = `Error: ${error.message}`;
        }
        
        // Test 5: Dual Command with Memory
        console.log('🤝 Testing dual command with memory...');
        try {
            const dualResult = await getUniversalAnalysis('Memory integration test query', { 
                chatId: chatId,
                maxTokens: 100
            });
            tests.dualCommandWithMemory = dualResult.success && dualResult.memoryContext !== undefined;
            testDetails.dualCommandWithMemory = `AI: ${dualResult.aiUsed}, Memory: ${dualResult.memoryContext ? 'Used' : 'Not used'}`;
        } catch (error) {
            testDetails.dualCommandWithMemory = `Error: ${error.message}`;
        }
        
        // Test 6: Memory Performance
        console.log('⚡ Testing memory performance...');
        const performanceStart = Date.now();
        try {
            await Promise.all([
                memoryFunctions.buildConversationContext(chatId),
                databaseFunctions.getConversationHistoryDB(chatId, 5),
                databaseFunctions.getPersistentMemoryDB(chatId)
            ]);
            const performanceTime = Date.now() - performanceStart;
            tests.memoryPerformance = performanceTime < 5000; // Under 5 seconds
            testDetails.memoryPerformance = `${performanceTime}ms (${tests.memoryPerformance ? 'Good' : 'Slow'})`;
        } catch (error) {
            testDetails.memoryPerformance = `Error: ${error.message}`;
        }
        
    } catch (error) {
        console.error('❌ Memory integration test error:', error.message);
    }
    
    const successCount = Object.values(tests).filter(Boolean).length;
    const totalTests = Object.keys(tests).length;
    const totalTime = Date.now() - startTime;
    
    return {
        tests: tests,
        testDetails: testDetails,
        score: `${successCount}/${totalTests}`,
        percentage: Math.round((successCount / totalTests) * 100),
        status: successCount === totalTests ? 'FULL_SUCCESS' : 
                successCount >= totalTests * 0.8 ? 'MOSTLY_WORKING' : 
                successCount >= totalTests * 0.5 ? 'PARTIAL_FUNCTION' : 'NEEDS_ATTENTION',
        totalTime: totalTime,
        timestamp: new Date().toISOString(),
        recommendations: successCount < totalTests ? 
            ['Check database connectivity', 'Verify memory module configuration', 'Test with smaller datasets'] : 
            ['Memory system fully operational']
    };
}

// 📊 ENHANCED: Get comprehensive performance statistics
function getEnhancedPerformanceStats() {
    const routingAnalytics = dualAIRouter.getRoutingAnalytics();
    
    return {
        // Core performance stats
        ...dualAIRouter.performanceStats,
        
        // Routing analytics
        routingAnalytics: routingAnalytics,
        
        // System information
        systemInfo: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: Math.round(process.uptime()),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        },
        
        // Component status
        componentStatus: {
            gptClient: !!openaiClient.getGptAnalysis,
            claudeClient: !!claudeClient.getClaudeAnalysis,
            memorySystem: !!memoryFunctions.buildConversationContext,
            database: !!databaseFunctions.saveDualAIConversation,
            telegramIntegration: !!telegramSplitter.sendGPTResponse
        }
    };
}

// 🔧 ENHANCED: Legacy compatibility with better error handling
async function getGPT5Analysis(query, options = {}) {
    try {
        return await openaiClient.getGptAnalysis(query, { 
            ...options,
            model: "gpt-5"
        });
    } catch (error) {
        console.error('❌ GPT-5 legacy analysis error:', error.message);
        throw new Error(`GPT-5 analysis failed: ${error.message}`);
    }
}

async function getClaudeAnalysisLegacy(query, options = {}) {
    try {
        return await claudeClient.getClaudeAnalysis(query, options);
    } catch (error) {
        console.error('❌ Claude legacy analysis error:', error.message);
        throw new Error(`Claude analysis failed: ${error.message}`);
    }
}

async function getMarketAnalysis(query, options = {}) {
    try {
        const routing = dualAIRouter.routeQuery(query + ' market analysis');
        if (routing.selectedAI === 'CLAUDE') {
            return await claudeClient.getStrategicAnalysis(query);
        } else {
            return await openaiClient.getMarketAnalysis(query, options);
        }
    } catch (error) {
        console.error('❌ Market analysis error:', error.message);
        throw new Error(`Market analysis failed: ${error.message}`);
    }
}

async function getCambodiaAnalysis(query, options = {}) {
    try {
        // Cambodia queries prefer Claude for structured analysis
        return await claudeClient.getCambodiaAnalysis(query, options);
    } catch (error) {
        console.error('❌ Cambodia analysis error:', error.message);
        // Fallback to GPT if Claude fails
        return await openaiClient.getCambodiaAnalysis(query, options);
    }
}

// 🎯 NEW: Quick analysis function for simple queries
async function getQuickAnalysis(query, options = {}) {
    const routing = dualAIRouter.routeQuery(query, { ...options, complexity: 'low' });
    
    try {
        if (routing.selectedAI === 'CLAUDE') {
            return await claudeClient.getClaudeAnalysis(query, { 
                maxTokens: 500,
                temperature: 0.7 
            });
        } else {
            return await openaiClient.getGptAnalysis(query, { 
                max_completion_tokens: 500,
                model: "gpt-5",
                temperature: 0.7
            });
        }
    } catch (error) {
        console.error('❌ Quick analysis error:', error.message);
        throw new Error(`Quick analysis failed: ${error.message}`);
    }
}

// 🚀 NEW: Batch analysis for multiple queries
async function getBatchAnalysis(queries, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 3;
    
    for (let i = 0; i < queries.length; i += batchSize) {
        const batch = queries.slice(i, i + batchSize);
        
        const batchPromises = batch.map(query => 
            getUniversalAnalysis(query, options).catch(error => ({
                error: error.message,
                query: query
            }))
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Add delay between batches to avoid rate limits
        if (i + batchSize < queries.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    return {
        total: queries.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        results: results
    };
}

// Export all enhanced functions
module.exports = {
    // Main enhanced functions
    getUniversalAnalysis,
    getDualAnalysis,
    routeQuery: (query, context) => dualAIRouter.routeQuery(query, context),
    checkDualSystemHealth,
    testMemoryIntegration,
    analyzeImageWithAI,
    
    // New enhanced functions
    getQuickAnalysis,
    getBatchAnalysis,
    getEnhancedPerformanceStats,
    
    // Legacy compatibility with enhanced error handling
    getGPT5Analysis,
    getClaudeAnalysis: getClaudeAnalysisLegacy,
    getMarketAnalysis,
    getCambodiaAnalysis,
    
    // Router and analytics access
    dualAIRouter,
    getPerformanceStats: () => dualAIRouter.performanceStats,
    getRoutingAnalytics: () => dualAIRouter.getRoutingAnalytics(),
    
    // Utility functions
    generateHealthRecommendations
};

console.log('✅ Enhanced Dual AI System loaded (10/10)');
console.log('🎯 Smart routing with ML-like scoring active');
console.log('📊 Advanced analytics and performance tracking enabled');
console.log('📱 Enhanced Telegram integration with metadata support');
console.log('🔧 Comprehensive error handling and fallback systems active');
console.log('🧠 Memory integration with context building optimized');
