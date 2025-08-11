// utils/enhancedDualCommandSystem.js - GPT-5 + Claude Opus 4.1 Strategic System
const { getGPT5Analysis, getEnhancedMarketAnalysis, getEnhancedCambodiaAnalysis } = require('./openaiClient');
const { 
    getClaudeAnalysis,
    getStrategicAnalysis,
    getRegimeAnalysis,
    getPortfolioAnalysis,
    getCambodiaAnalysis: getClaudeCambodiaAnalysis,
    getAnomalyAnalysis
} = require('./claudeClient');
const { buildConversationContext } = require('./memory');

// Enhanced AI capabilities matrix
const AI_CAPABILITIES = {
    gpt5: {
        strengths: [
            'Enhanced reasoning and problem-solving',
            'Superior mathematical calculations', 
            'Improved code generation',
            'Better instruction following',
            'Reduced hallucinations',
            'Natural conversation flow',
            'Complex financial modeling',
            'Multi-step analysis',
            'Creative solutions'
        ],
        optimalFor: [
            'financial_calculations',
            'code_generation', 
            'creative_analysis',
            'step_by_step_reasoning',
            'mathematical_modeling',
            'strategic_planning',
            'multimodal_analysis'
        ]
    },
    claude: {
        strengths: [
            'Extended reasoning and thinking',
            'Superior analytical depth',
            'Excellent document analysis',
            'Strong ethical reasoning',
            'Nuanced understanding',
            'Research synthesis',
            'Complex scenario analysis',
            'Tool use during thinking',
            'Long-form content analysis'
        ],
        optimalFor: [
            'regime_analysis',
            'risk_assessment',
            'document_analysis',
            'research_synthesis',
            'strategic_thinking',
            'anomaly_detection',
            'portfolio_optimization'
        ]
    }
};

/**
 * Enhanced query analysis for optimal AI routing
 */
function analyzeQueryForOptimalAI(userMessage, messageType = 'text', hasMedia = false) {
    const message = userMessage.toLowerCase();
    
    // Immediate GPT-5 routing patterns
    const gpt5Patterns = [
        // Mathematical and computational
        /calculate|compute|derive|solve|formula|equation|optimization/i,
        /portfolio.*allocation|efficient.*frontier|monte.*carlo/i,
        /dcf|npv|irr|wacc|capm|black.*scholes|var.*calculation/i,
        
        // Code and technical implementation
        /code|script|function|algorithm|implement|build|create.*system/i,
        /api|database|programming|technical.*solution/i,
        
        // Creative and synthesis
        /design|creative|innovative|brainstorm|generate.*ideas/i,
        /strategy.*development|business.*plan|marketing.*strategy/i,
        
        // Step-by-step reasoning
        /step.*by.*step|walk.*through|explain.*process|methodology/i,
        /how.*to.*implement|detailed.*plan|systematic.*approach/i
    ];
    
    // Immediate Claude routing patterns  
    const claudePatterns = [
        // Regime and economic analysis
        /regime|economic.*regime|ray.*dalio|bridgewater|all.*weather/i,
        /recession|expansion|stagflation|deflationary/i,
        
        // Risk and anomaly detection
        /risk.*assessment|anomaly|crisis|stress.*test|tail.*risk/i,
        /correlation|diversification|hedge|risk.*management/i,
        
        // Research and analysis
        /research|analyze.*thoroughly|comprehensive.*analysis/i,
        /evaluate|assess|compare.*multiple|pros.*and.*cons/i,
        
        // Document and content analysis
        /summarize|extract.*insights|key.*findings|document.*analysis/i,
        /review.*literature|academic|scholarly|research.*paper/i
    ];
    
    // Dual AI patterns (use both for comprehensive analysis)
    const dualPatterns = [
        /comprehensive.*strategy|complete.*analysis|full.*assessment/i,
        /dual.*perspective|multiple.*viewpoints|different.*approaches/i,
        /complex.*decision|major.*investment|strategic.*choice/i,
        /both.*quantitative.*and.*qualitative/i
    ];
    
    // Cambodia-specific routing (prefer Claude for nuanced market analysis)
    const cambodiaPatterns = [
        /cambodia|phnom.*penh|khmer|cambodian.*market/i,
        /southeast.*asia|emerging.*market|frontier.*market/i,
        /lending.*cambodia|real.*estate.*cambodia/i
    ];
    
    // Media handling (GPT-5 has enhanced multimodal capabilities)
    if (hasMedia || messageType !== 'text') {
        return {
            optimalAI: 'gpt5',
            confidence: 0.9,
            reasoning: 'GPT-5 has enhanced multimodal capabilities',
            complexity: 'medium',
            needsLiveData: false,
            useEnhancedReasoning: true
        };
    }
    
    // Route to dual AI for complex strategic queries
    if (dualPatterns.some(pattern => pattern.test(message))) {
        return {
            optimalAI: 'both',
            confidence: 0.95,
            reasoning: 'Complex strategic analysis benefits from dual AI perspectives',
            complexity: 'high',
            needsLiveData: true,
            useEnhancedReasoning: true,
            useBothAIs: true
        };
    }
    
    // Route to GPT-5 for computational/creative tasks
    if (gpt5Patterns.some(pattern => pattern.test(message))) {
        return {
            optimalAI: 'gpt5',
            confidence: 0.85,
            reasoning: 'GPT-5 excels at mathematical reasoning and creative solutions',
            complexity: determineComplexity(message),
            needsLiveData: requiresLiveData(message),
            useEnhancedReasoning: true
        };
    }
    
    // Route to Claude for analytical/research tasks
    if (claudePatterns.some(pattern => pattern.test(message))) {
        return {
            optimalAI: 'claude',
            confidence: 0.85,
            reasoning: 'Claude excels at deep analysis and research synthesis',
            complexity: determineComplexity(message),
            needsLiveData: requiresLiveData(message),
            useExtendedThinking: true
        };
    }
    
    // Cambodia-specific routing
    if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        return {
            optimalAI: 'claude',
            confidence: 0.8,
            reasoning: 'Claude better handles nuanced emerging market analysis',
            complexity: 'medium',
            needsLiveData: true,
            useExtendedThinking: true,
            specialization: 'cambodia'
        };
    }
    
    // Default intelligent routing based on query characteristics
    const queryLength = message.length;
    const hasQuestionWords = /what|how|why|when|where|which|should|would|could/i.test(message);
    const hasFinancialTerms = /market|trading|investment|portfolio|risk|return/i.test(message);
    const hasAnalyticalTerms = /analyze|evaluate|assess|review|examine/i.test(message);
    
    // Default routing logic
    if (hasAnalyticalTerms && queryLength > 100) {
        return {
            optimalAI: 'claude',
            confidence: 0.7,
            reasoning: 'Longer analytical queries benefit from Claude\'s extended reasoning',
            complexity: 'medium',
            needsLiveData: hasFinancialTerms,
            useExtendedThinking: true
        };
    } else if (hasFinancialTerms || hasQuestionWords) {
        return {
            optimalAI: 'gpt5',
            confidence: 0.7,
            reasoning: 'GPT-5 provides enhanced financial reasoning and natural responses',
            complexity: queryLength > 200 ? 'medium' : 'low',
            needsLiveData: hasFinancialTerms,
            useEnhancedReasoning: queryLength > 100
        };
    }
    
    // Fallback to GPT-5 for general queries
    return {
        optimalAI: 'gpt5',
        confidence: 0.6,
        reasoning: 'GPT-5 default for general conversation and improved responses',
        complexity: 'low',
        needsLiveData: false,
        useEnhancedReasoning: false
    };
}

/**
 * Determine query complexity
 */
function determineComplexity(message) {
    if (message.length > 500) return 'high';
    if (message.length > 200) return 'medium';
    return 'low';
}

/**
 * Check if query requires live data
 */
function requiresLiveData(message) {
    const liveDataIndicators = [
        /current|latest|today|now|recent/i,
        /market.*condition|economic.*data|price|rate/i,
        /fed.*rate|inflation|unemployment|gdp/i,
        /regime|volatility|vix|yield.*curve/i
    ];
    
    return liveDataIndicators.some(pattern => pattern.test(message));
}

/**
 * Execute GPT-5 analysis with enhanced capabilities
 */
async function executeEnhancedGPT5Analysis(userMessage, routingDecision, context = null) {
    try {
        console.log('🚀 Executing GPT-5 Enhanced Analysis...');
        
        let enhancedMessage = userMessage;
        
        // Add context if available
        if (context) {
            enhancedMessage = `Context: ${context}\n\nQuery: ${userMessage}`;
        }
        
        // Add live data context if needed
        if (routingDecision.needsLiveData) {
            try {
                const { getRayDalioMarketData } = require('./liveData');
                const marketData = await getRayDalioMarketData();
                
                if (marketData && marketData.rayDalio?.regime) {
                    const regime = marketData.rayDalio.regime;
                    enhancedMessage += `\n\nCurrent Market Context: Economic regime is ${regime.currentRegime?.name} with ${regime.confidence}% confidence.`;
                }
            } catch (dataError) {
                console.log('⚠️ Live data unavailable:', dataError.message);
            }
        }
        
        // Route to specialized functions based on query type
        if (routingDecision.specialization === 'cambodia') {
            return await getEnhancedCambodiaAnalysis(enhancedMessage);
        } else if (routingDecision.needsLiveData && /market|trading|investment/i.test(userMessage)) {
            return await getEnhancedMarketAnalysis(enhancedMessage);
        } else {
            return await getGPT5Analysis(enhancedMessage, {
                useEnhancedReasoning: routingDecision.useEnhancedReasoning,
                maxTokens: routingDecision.complexity === 'high' ? 4000 : 
                          routingDecision.complexity === 'medium' ? 2000 : 1000
            });
        }
        
    } catch (error) {
        console.error('❌ GPT-5 execution error:', error.message);
        throw error;
    }
}

/**
 * Execute Claude analysis with extended thinking
 */
async function executeEnhancedClaudeAnalysis(userMessage, routingDecision, context = null) {
    try {
        console.log('⚡ Executing Claude Enhanced Analysis...');
        
        let enhancedMessage = userMessage;
        
        // Add context for Claude's analysis
        if (context) {
            enhancedMessage = `Previous context: ${context}\n\nCurrent query: ${userMessage}`;
        }
        
        // Add global time context for Claude
        const cambodiaTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Phnom_Penh"});
        enhancedMessage = `Current time: ${cambodiaTime} Cambodia\n\n${enhancedMessage}`;
        
        // Route to specialized Claude functions
        if (routingDecision.specialization === 'cambodia') {
            return await getClaudeCambodiaAnalysis(enhancedMessage);
        } else if (/regime|economic|ray.*dalio/i.test(userMessage)) {
            return await getRegimeAnalysis(enhancedMessage);
        } else if (/portfolio|allocation|optimization/i.test(userMessage)) {
            return await getPortfolioAnalysis(enhancedMessage);
        } else if (/anomaly|crisis|risk.*detection/i.test(userMessage)) {
            return await getAnomalyAnalysis(enhancedMessage);
        } else if (routingDecision.complexity === 'high') {
            return await getStrategicAnalysis(enhancedMessage);
        } else {
            return await getClaudeAnalysis(enhancedMessage, {
                useExtendedThinking: routingDecision.useExtendedThinking
            });
        }
        
    } catch (error) {
        console.error('❌ Claude execution error:', error.message);
        throw error;
    }
}

/**
 * Execute dual AI analysis for complex queries
 */
async function executeDualAIAnalysis(userMessage, routingDecision, context = null) {
    try {
        console.log('🔄 Executing Dual AI Analysis (GPT-5 + Claude Opus 4.1)...');
        
        // Execute both AIs in parallel
        const [gpt5Result, claudeResult] = await Promise.allSettled([
            executeEnhancedGPT5Analysis(userMessage, routingDecision, context),
            executeEnhancedClaudeAnalysis(userMessage, routingDecision, context)
        ]);
        
        let response = `# Dual AI Strategic Analysis\n\n`;
        
        // Add GPT-5 analysis
        if (gpt5Result.status === 'fulfilled') {
            response += `## GPT-5 Enhanced Analysis\n\n${gpt5Result.value}\n\n`;
        } else {
            response += `## GPT-5 Analysis\n*Analysis unavailable: ${gpt5Result.reason}*\n\n`;
        }
        
        // Add Claude analysis
        if (claudeResult.status === 'fulfilled') {
            response += `## Claude Opus 4.1 Strategic Analysis\n\n${claudeResult.value}\n\n`;
        } else {
            response += `## Claude Analysis\n*Analysis unavailable: ${claudeResult.reason}*\n\n`;
        }
        
        // Add synthesis if both succeeded
        if (gpt5Result.status === 'fulfilled' && claudeResult.status === 'fulfilled') {
            response += `## Strategic Synthesis\n\n`;
            response += `**Combined Insights:** Both AI systems provide complementary perspectives. `;
            response += `GPT-5 offers enhanced computational reasoning while Claude provides extended analytical depth. `;
            response += `Together, they deliver institutional-grade strategic intelligence.\n\n`;
            response += `**Recommendation:** Consider both analyses for comprehensive decision-making, `;
            response += `with GPT-5 insights informing quantitative aspects and Claude insights guiding qualitative strategy.`;
        }
        
        return response;
        
    } catch (error) {
        console.error('❌ Dual AI execution error:', error.message);
        throw error;
    }
}

/**
 * Main enhanced dual command execution
 */
async function executeEnhancedDualCommand(userMessage, chatId, options = {}) {
    try {
        console.log('🎯 Enhanced Dual Command System - GPT-5 + Claude Opus 4.1');
        
        const startTime = Date.now();
        
        // Analyze query for optimal AI routing
        const routingDecision = analyzeQueryForOptimalAI(
            userMessage, 
            options.messageType || 'text', 
            options.hasMedia || false
        );
        
        console.log('🧠 Enhanced Routing Decision:', {
            optimalAI: routingDecision.optimalAI,
            confidence: routingDecision.confidence,
            reasoning: routingDecision.reasoning,
            complexity: routingDecision.complexity
        });
        
        // Build conversation context for complex queries
        let context = null;
        if (routingDecision.complexity !== 'low') {
            try {
                context = await buildConversationContext(chatId);
            } catch (contextError) {
                console.log('⚠️ Context building failed:', contextError.message);
            }
        }
        
        let response;
        let aiUsed = routingDecision.optimalAI;
        
        // Execute based on routing decision
        switch (routingDecision.optimalAI) {
            case 'both':
                response = await executeDualAIAnalysis(userMessage, routingDecision, context);
                aiUsed = 'gpt5+claude';
                break;
                
            case 'claude':
                response = await executeEnhancedClaudeAnalysis(userMessage, routingDecision, context);
                break;
                
            case 'gpt5':
            default:
                response = await executeEnhancedGPT5Analysis(userMessage, routingDecision, context);
                break;
        }
        
        const executionTime = Date.now() - startTime;
        
        return {
            response: response,
            aiUsed: aiUsed,
            routingDecision: routingDecision,
            executionTime: executionTime,
            success: true,
            enhancedCapabilities: true,
            systemVersion: 'Enhanced Dual AI v2.0'
        };
        
    } catch (error) {
        console.error('❌ Enhanced dual command error:', error.message);
        
        // Enhanced fallback system
        try {
            console.log('🔄 Attempting GPT-5 fallback...');
            
            const fallbackResponse = await getGPT5Analysis(userMessage, {
                maxTokens: 1500,
                useEnhancedReasoning: false
            });
            
            return {
                response: `${fallbackResponse}\n\n*Note: Using GPT-5 fallback mode due to system issue.*`,
                aiUsed: 'gpt5-fallback',
                routingDecision: { optimalAI: 'fallback', reasoning: 'System error recovery' },
                executionTime: Date.now() - (Date.now() - 5000),
                success: false,
                error: error.message,
                fallbackUsed: true
            };
            
        } catch (fallbackError) {
            throw new Error(`Enhanced dual command system failure: ${error.message}`);
        }
    }
}

/**
 * Enhanced system health check
 */
async function checkEnhancedSystemHealth() {
    const health = {
        gpt5Available: false,
        claudeAvailable: false,
        dualModeOperational: false,
        enhancedFeatures: false,
        contextBuilding: false,
        liveDataIntegration: false,
        overallStatus: 'UNKNOWN',
        errors: [],
        capabilities: {}
    };
    
    try {
        // Test GPT-5
        const { checkGPT5SystemHealth } = require('./openaiClient');
        const gpt5Health = await checkGPT5SystemHealth();
        health.gpt5Available = gpt5Health.overallHealth;
        health.capabilities.gpt5 = gpt5Health.capabilities;
        
        if (!gpt5Health.overallHealth) {
            health.errors.push(`GPT-5: ${gpt5Health.errors.join(', ')}`);
        }
        
    } catch (error) {
        health.errors.push(`GPT-5 Test: ${error.message}`);
    }
    
    try {
        // Test Claude
        const { checkSystemHealth } = require('./claudeClient');
        const claudeHealth = await checkSystemHealth();
        health.claudeAvailable = claudeHealth.overallHealth;
        health.capabilities.claude = claudeHealth;
        
        if (!claudeHealth.overallHealth) {
            health.errors.push(`Claude: ${claudeHealth.errors.join(', ')}`);
        }
        
    } catch (error) {
        health.errors.push(`Claude Test: ${error.message}`);
    }
    
    try {
        // Test context building
        await buildConversationContext('test_health_check');
        health.contextBuilding = true;
    } catch (error) {
        health.errors.push(`Context: ${error.message}`);
    }
    
    try {
        // Test live data integration
        const { getRayDalioMarketData } = require('./liveData');
        await getRayDalioMarketData();
        health.liveDataIntegration = true;
    } catch (error) {
        health.errors.push(`Live Data: ${error.message}`);
    }
    
    // Determine overall status
    health.dualModeOperational = health.gpt5Available && health.claudeAvailable;
    health.enhancedFeatures = health.dualModeOperational && health.contextBuilding;
    
    if (health.enhancedFeatures && health.liveDataIntegration) {
        health.overallStatus = 'FULLY_OPERATIONAL';
    } else if (health.dualModeOperational) {
        health.overallStatus = 'OPERATIONAL';
    } else if (health.gpt5Available || health.claudeAvailable) {
        health.overallStatus = 'DEGRADED';
    } else {
        health.overallStatus = 'OFFLINE';
    }
    
    return health;
}

/**
 * Get enhanced system analytics
 */
function getEnhancedSystemAnalytics() {
    return {
        systemName: 'Enhanced Dual AI Command System',
        version: '2.0 - GPT-5 + Claude Opus 4.1',
        aiModels: {
            primary: 'GPT-5 (Enhanced reasoning, superior math, improved financial analysis)',
            secondary: 'Claude Opus 4.1 (Extended thinking, research synthesis, analytical depth)',
            dualMode: 'Intelligent routing with parallel processing for complex queries'
        },
        enhancedCapabilities: [
            'GPT-5 enhanced reasoning and mathematical capabilities',
            'Claude Opus 4.1 extended thinking and tool use',
            'Intelligent query routing based on AI strengths',
            'Dual AI analysis for comprehensive insights',
            'Enhanced multimodal processing (GPT-5)',
            'Extended context analysis (Claude)',
            'Real-time market data integration',
            'Strategic financial modeling',
            'Cambodia market specialization',
            'Institutional-grade risk analysis'
        ],
        routingCapabilities: [
            'Mathematical/computational → GPT-5',
            'Analytical/research → Claude',
            'Strategic/complex → Dual AI',
            'Multimodal → GPT-5 enhanced',
            'Cambodia markets → Claude specialized',
            'Creative/synthesis → GPT-5',
            'Risk/regime analysis → Claude'
        ],
        performanceOptimizations: [
            'Smart caching for live data',
            'Parallel processing for dual queries', 
            'Context-aware response generation',
            'Adaptive complexity handling',
            'Enhanced error recovery',
            'Intelligent fallback systems'
        ]
    };
}

/**
 * Quick access functions for compatibility
 */
async function getMarketIntelligence() {
    const query = "Provide current market intelligence summary with key risks and opportunities";
    const result = await executeEnhancedDualCommand(query, 'system');
    return result.response;
}

async function getCambodiaIntelligence() {
    const query = "Analyze current Cambodia market conditions for lending and real estate investment";
    const result = await executeEnhancedDualCommand(query, 'system');
    return result.response;
}

module.exports = {
    // Main enhanced functions
    executeEnhancedDualCommand,
    analyzeQueryForOptimalAI,
    executeEnhancedGPT5Analysis,
    executeEnhancedClaudeAnalysis,
    executeDualAIAnalysis,
    
    // System management
    checkEnhancedSystemHealth,
    getEnhancedSystemAnalytics,
    
    // Quick access
    getMarketIntelligence,
    getCambodiaIntelligence,
    
    // Utility functions
    determineComplexity,
    requiresLiveData,
    
    // Legacy compatibility
    executeDualCommand: executeEnhancedDualCommand,
    checkSystemHealth: checkEnhancedSystemHealth,
    getSystemAnalytics: getEnhancedSystemAnalytics,
    
    // AI capabilities reference
    AI_CAPABILITIES
};
