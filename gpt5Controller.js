// Enhanced GPT-5 AI System - Main Controller
// Combines all your existing modules with improved coordination

require("dotenv").config();

// Import your existing modules
const { 
    getGPT5Analysis,
    getQuickNanoResponse,
    getQuickMiniResponse,
    getDeepAnalysis,
    testGPT5Capabilities,
    checkGPT5SystemHealth
} = require("./utils/openaiClient");

const {
    executeSpeedOptimizedGPT5,
    ultraFastResponse,
    fastResponse,
    balancedResponse,
    analyzeQueryForSpeed
} = require("./utils/gpt5SpeedOptimization");

const {
    checkGPT5Role,
    getRoleStats,
    getEnhancedRoleStats
} = require("./utils/gpt5RoleDetector");

const {
    buildConversationContext
} = require("./utils/memory");

const {
    saveConversationDB,
    getPersistentMemoryDB,
    getConversationHistoryDB
} = require("./utils/database");

/**
 * 🚀 ENHANCED GPT-5 AI CONTROLLER
 * Coordinates all your existing systems for optimal performance
 */
class GPT5AIController {
    constructor() {
        this.isInitialized = false;
        this.systemHealth = {};
        this.performanceMetrics = {
            totalRequests: 0,
            successfulRequests: 0,
            averageResponseTime: 0,
            modelUsage: {},
            roleDistribution: {}
        };
    }

    /**
     * Initialize the GPT-5 AI system
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Enhanced GPT-5 AI System...');
            
            // Test GPT-5 capabilities
            const capabilities = await testGPT5Capabilities();
            console.log('✅ GPT-5 capabilities tested:', capabilities.available);
            
            // Check system health
            this.systemHealth = await checkGPT5SystemHealth();
            console.log('✅ System health checked:', this.systemHealth.overallHealth);
            
            // Initialize performance tracking
            this.resetMetrics();
            
            this.isInitialized = true;
            console.log('🎉 GPT-5 AI System fully initialized!');
            
            return {
                success: true,
                capabilities,
                health: this.systemHealth,
                message: 'GPT-5 AI System ready for production use'
            };
            
        } catch (error) {
            console.error('❌ GPT-5 initialization failed:', error.message);
            throw new Error(`System initialization failed: ${error.message}`);
        }
    }

    /**
     * 🎯 MAIN AI PROCESSING METHOD
     * Routes queries through your existing optimization systems
     */
    async processQuery(query, options = {}) {
        if (!this.isInitialized) {
            throw new Error('GPT-5 system not initialized. Call initialize() first.');
        }

        const startTime = Date.now();
        this.performanceMetrics.totalRequests++;

        try {
            console.log(`🎯 Processing query: "${query.substring(0, 50)}..."`);
            
            // 1. Analyze query for optimal routing
            const speedAnalysis = analyzeQueryForSpeed(query);
            console.log(`📊 Speed analysis: ${speedAnalysis.priority} (${speedAnalysis.reason})`);
            
            // 2. Build memory context if needed
            let memoryContext = '';
            if (options.chatId && speedAnalysis.priority !== 'ultra_speed') {
                try {
                    memoryContext = await buildConversationContext(options.chatId, query);
                    console.log(`🧠 Memory context: ${memoryContext.length} chars`);
                } catch (memoryError) {
                    console.log('⚠️ Memory context failed:', memoryError.message);
                }
            }
            
            // 3. Execute with optimal strategy
            let result;
            
            if (speedAnalysis.priority === 'ultra_speed') {
                result = await ultraFastResponse(query);
            } else if (speedAnalysis.isDocumentRequest) {
                result = await this.handleDocumentRequest(query, speedAnalysis, memoryContext);
            } else if (speedAnalysis.complexityScore >= 4) {
                result = await this.handleComplexAnalysis(query, speedAnalysis, memoryContext);
            } else {
                result = await executeSpeedOptimizedGPT5(
                    memoryContext ? `${memoryContext}\n\nCurrent Query: ${query}` : query
                );
            }
            
            // 4. Detect role and track performance
            const roleAnalysis = checkGPT5Role(query, result.response, result.config);
            
            // 5. Update metrics
            const responseTime = Date.now() - startTime;
            this.updateMetrics(result, roleAnalysis, responseTime);
            
            // 6. Save to database if chatId provided
            if (options.chatId) {
                await this.saveInteraction(options.chatId, query, result, roleAnalysis, memoryContext);
            }
            
            console.log(`✅ Query processed: ${responseTime}ms | ${result.config.model} | ${roleAnalysis.role}`);
            
            return {
                response: result.response,
                metadata: {
                    responseTime,
                    model: result.config.model,
                    priority: speedAnalysis.priority,
                    role: roleAnalysis.role,
                    confidence: roleAnalysis.confidence,
                    memoryUsed: memoryContext.length > 0,
                    complexityScore: speedAnalysis.complexityScore,
                    isDocumentRequest: speedAnalysis.isDocumentRequest
                },
                success: true
            };
            
        } catch (error) {
            console.error('❌ Query processing failed:', error.message);
            
            // Try emergency fallback
            try {
                const fallbackResult = await ultraFastResponse(query);
                const responseTime = Date.now() - startTime;
                
                console.log(`🆘 Fallback succeeded: ${responseTime}ms`);
                
                return {
                    response: fallbackResult.response,
                    metadata: {
                        responseTime,
                        model: 'gpt-5-nano',
                        priority: 'emergency_fallback',
                        role: 'OPERATOR',
                        confidence: 50,
                        memoryUsed: false,
                        isEmergencyFallback: true
                    },
                    success: true,
                    warning: `Primary processing failed: ${error.message}`
                };
                
            } catch (fallbackError) {
                this.performanceMetrics.totalRequests--;
                throw new Error(`Complete processing failure: ${error.message}`);
            }
        }
    }

    /**
     * Handle document creation requests
     */
    async handleDocumentRequest(query, speedAnalysis, memoryContext) {
        console.log('📝 Handling document request...');
        
        const enhancedQuery = `${memoryContext ? memoryContext + '\n\n' : ''}DOCUMENT CREATION REQUEST: ${query}

Create a professional, well-structured document that is:
- Clear and actionable
- Appropriately formatted with headers and sections  
- Comprehensive but concise
- Ready for business use

Focus on delivering high-quality content efficiently.`;

        if (speedAnalysis.complexityScore > 4) {
            return await getDeepAnalysis(enhancedQuery, {
                reasoning_effort: "medium",
                verbosity: "high",
                max_completion_tokens: 4000
            });
        } else {
            return await getQuickMiniResponse(enhancedQuery, {
                reasoning_effort: "low", 
                verbosity: "high",
                max_completion_tokens: 2500
            });
        }
    }

    /**
     * Handle complex analysis requests
     */
    async handleComplexAnalysis(query, speedAnalysis, memoryContext) {
        console.log('🧠 Handling complex analysis...');
        
        const enhancedQuery = `${memoryContext ? memoryContext + '\n\n' : ''}COMPLEX STRATEGIC ANALYSIS: ${query}

Apply comprehensive analytical framework:
- Multi-perspective evaluation
- Risk-benefit assessment  
- Strategic implications
- Actionable recommendations
- Data-driven insights where applicable`;

        return await getDeepAnalysis(enhancedQuery, {
            reasoning_effort: "medium",
            verbosity: "medium", 
            max_completion_tokens: 3000
        });
    }

    /**
     * Update performance metrics
     */
    updateMetrics(result, roleAnalysis, responseTime) {
        this.performanceMetrics.successfulRequests++;
        
        // Update average response time
        const total = this.performanceMetrics.successfulRequests;
        const current = this.performanceMetrics.averageResponseTime;
        this.performanceMetrics.averageResponseTime = 
            Math.round((current * (total - 1) + responseTime) / total);
        
        // Track model usage
        const model = result.config.model;
        this.performanceMetrics.modelUsage[model] = 
            (this.performanceMetrics.modelUsage[model] || 0) + 1;
        
        // Track role distribution
        const role = roleAnalysis.role;
        this.performanceMetrics.roleDistribution[role] = 
            (this.performanceMetrics.roleDistribution[role] || 0) + 1;
    }

    /**
     * Save interaction to database
     */
    async saveInteraction(chatId, query, result, roleAnalysis, memoryContext) {
        try {
            const metadata = {
                model: result.config.model,
                responseTime: result.responseTime,
                role: roleAnalysis.role,
                confidence: roleAnalysis.confidence,
                priority: result.priority,
                complexityScore: result.complexityScore,
                memoryContextLength: memoryContext.length,
                isDocumentRequest: result.isDocumentRequest,
                gpt5System: true
            };
            
            await saveConversationDB(chatId, query, result.response, "gpt5_enhanced", metadata);
            console.log('💾 Interaction saved to database');
            
        } catch (saveError) {
            console.log('⚠️ Database save failed:', saveError.message);
        }
    }

    /**
     * Get comprehensive system status
     */
    async getSystemStatus() {
        const health = await checkGPT5SystemHealth();
        const roleStats = getEnhancedRoleStats();
        
        return {
            systemHealth: health,
            performance: this.performanceMetrics,
            roleAnalytics: roleStats,
            capabilities: {
                gpt5Available: health.gpt5Available,
                speedOptimization: true,
                memoryIntegration: true,
                roleDetection: true,
                documentCreation: true,
                complexAnalysis: true
            },
            recommendations: this.generateRecommendations(health, roleStats)
        };
    }

    /**
     * Generate system recommendations
     */
    generateRecommendations(health, roleStats) {
        const recommendations = [];
        
        if (!health.gpt5Available) {
            recommendations.push({
                type: 'CRITICAL',
                message: 'GPT-5 not available - check API key and model access',
                action: 'Verify OpenAI API configuration'
            });
        }
        
        if (this.performanceMetrics.averageResponseTime > 30000) {
            recommendations.push({
                type: 'PERFORMANCE',
                message: 'High average response time detected',
                action: 'Consider using more Nano/Mini models for speed'
            });
        }
        
        if (roleStats.percentages.predictionAccuracy < 70) {
            recommendations.push({
                type: 'OPTIMIZATION',
                message: 'Role prediction accuracy below optimal',
                action: 'Review query patterns and adjust thresholds'
            });
        }
        
        const successRate = this.performanceMetrics.successfulRequests / 
                          Math.max(1, this.performanceMetrics.totalRequests) * 100;
        
        if (successRate < 95) {
            recommendations.push({
                type: 'RELIABILITY',
                message: 'Success rate below 95%',
                action: 'Investigate error patterns and improve fallbacks'
            });
        }
        
        return recommendations;
    }

    /**
     * Reset performance metrics
     */
    resetMetrics() {
        this.performanceMetrics = {
            totalRequests: 0,
            successfulRequests: 0,
            averageResponseTime: 0,
            modelUsage: {},
            roleDistribution: {}
        };
    }

    /**
     * Quick health check
     */
    async healthCheck() {
        try {
            const testQuery = "System health check test";
            const result = await this.processQuery(testQuery);
            
            return {
                healthy: true,
                responseTime: result.metadata.responseTime,
                model: result.metadata.model,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Create singleton instance
const gpt5AI = new GPT5AIController();

/**
 * 🚀 SIMPLIFIED API FOR YOUR EXISTING CODE
 */
async function processAIQuery(query, options = {}) {
    if (!gpt5AI.isInitialized) {
        await gpt5AI.initialize();
    }
    
    return await gpt5AI.processQuery(query, options);
}

/**
 * Initialize and test the system
 */
async function initializeGPT5System() {
    try {
        const result = await gpt5AI.initialize();
        console.log('🎉 GPT-5 AI System ready!');
        return result;
    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
        throw error;
    }
}

module.exports = {
    // Main AI controller
    GPT5AIController,
    gpt5AI,
    
    // Simplified API
    processAIQuery,
    initializeGPT5System,
    
    // Quick access functions
    quickAI: async (query) => await processAIQuery(query),
    smartAI: async (query, chatId) => await processAIQuery(query, { chatId }),
    documentAI: async (query, chatId) => await processAIQuery(`Create document: ${query}`, { chatId }),
    
    // System management
    getSystemStatus: () => gpt5AI.getSystemStatus(),
    healthCheck: () => gpt5AI.healthCheck(),
    resetMetrics: () => gpt5AI.resetMetrics(),
    
    // Integration helpers for your existing code
    integrateWithTelegram: async (bot, chatId, query) => {
        const result = await processAIQuery(query, { chatId });
        
        if (result.success) {
            // Split long messages for Telegram
            const maxLength = 4000;
            const response = result.response;
            
            if (response.length <= maxLength) {
                await bot.sendMessage(chatId, response);
            } else {
                // Split into chunks
                const chunks = [];
                for (let i = 0; i < response.length; i += maxLength) {
                    chunks.push(response.substring(i, i + maxLength));
                }
                
                for (let i = 0; i < chunks.length; i++) {
                    const header = i === 0 ? `🤖 GPT-5 ${result.metadata.model} Response (Part ${i + 1}/${chunks.length}):\n\n` : `Part ${i + 1}/${chunks.length}:\n\n`;
                    await bot.sendMessage(chatId, header + chunks[i]);
                }
            }
        }
        
        return result;
    }
};

// Auto-initialize in development
if (process.env.NODE_ENV !== 'production') {
    setTimeout(async () => {
        try {
            await initializeGPT5System();
        } catch (error) {
            console.log('⚠️ Auto-initialization failed:', error.message);
        }
    }, 1000);
}
