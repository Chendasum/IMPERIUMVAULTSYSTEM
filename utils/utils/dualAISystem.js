// 🤖🤖 ULTIMATE DUAL AI SYSTEM: GPT-5 + Claude Opus 4.1
// Supreme Strategic AI Commander for IMPERIUM VAULT SYSTEM

require("dotenv").config();
const { OpenAI } = require("openai");
const { Anthropic } = require('@anthropic-ai/sdk');

// Import your existing AI clients
const { 
    getGptAnalysis,
    getMarketAnalysis: getGPTMarketAnalysis,
    getCambodiaAnalysis: getGPTCambodiaAnalysis,
    analyzeImageWithGPT,
    testModelCapabilities: testGPTCapabilities
} = require('./openaiClient');

const { 
    getClaudeAnalysis: getClaudeAnalysisOriginal,
    getStrategicAnalysis: getClaudeStrategicAnalysis,
    getRegimeAnalysis,
    getCambodiaAnalysis: getClaudeCambodiaAnalysis,
    checkSystemHealth: checkClaudeHealth
} = require('./claudeClient');

// Import live data system
const {
    getRayDalioMarketData,
    detectEconomicRegime,
    getYieldCurveAnalysis,
    getCreditSpreadAnalysis,
    getInflationExpectations,
    getSectorRotationSignals,
    getEnhancedLiveData,
    detectMarketAnomalies,
    generateMarketInsights
} = require('./liveData');

// Note: We'll use the existing initialized clients from openaiClient.js and claudeClient.js
// This avoids duplicate initialization and leverages your existing configurations

// 🚀 ULTIMATE DUAL AI CONFIGURATION
const DUAL_AI_CONFIG = {
    // Model Selection
    GPT5_MODELS: {
        primary: "gpt-5",
        mini: "gpt-5-mini",
        nano: "gpt-5-nano",
        vision: "gpt-5"
    },
    CLAUDE_MODELS: {
        primary: "claude-opus-4-1-20250805",  // Your Claude Opus 4.1
        fallback: "claude-3-opus-20240229"    // Fallback
    },
    
    // AI Specializations - Strategic Assignment
    SPECIALIZATIONS: {
        GPT5_BEST_FOR: [
            'coding', 'mathematics', 'step-by-step calculations',
            'technical analysis', 'data processing', 'complex reasoning',
            'structured financial models', 'quantitative analysis',
            'vision analysis', 'image interpretation', 'chart analysis'
        ],
        CLAUDE_BEST_FOR: [
            'strategic thinking', 'nuanced analysis', 'complex writing',
            'creative problem solving', 'philosophical reasoning',
            'contextual understanding', 'synthesis of information',
            'comprehensive research', 'natural conversation',
            'ethical considerations', 'risk assessment narratives'
        ]
    },
    
    // Routing Strategy
    ROUTING_PATTERNS: {
        // GPT-5 Patterns
        USE_GPT5: [
            /(calculate|compute|math|formula|equation)/i,
            /(code|programming|technical|api|debug)/i,
            /(chart|graph|image|visual|analyze.*image)/i,
            /(step.*by.*step|methodology|procedure)/i,
            /(quantitative|statistical|numerical)/i,
            /(portfolio.*optimization|modern.*portfolio.*theory)/i
        ],
        // Claude Patterns  
        USE_CLAUDE: [
            /(strategy|strategic|philosophy|think)/i,
            /(write|essay|report|comprehensive|detailed)/i,
            /(explain|understand|context|nuance)/i,
            /(creative|innovative|brainstorm|ideate)/i,
            /(risk.*assessment|scenario.*planning)/i,
            /(ethical|moral|consideration|implication)/i
        ],
        // Dual Analysis Patterns
        USE_BOTH: [
            /(compare|versus|vs|contrast)/i,
            /(comprehensive.*analysis|full.*analysis)/i,
            /(dual.*perspective|multiple.*viewpoint)/i,
            /(cross.*validate|second.*opinion)/i,
            /(complex.*decision|major.*investment)/i
        ]
    },
    
    // Performance Settings
    PERFORMANCE: {
        GPT5_MAX_TOKENS: 8192,
        CLAUDE_MAX_TOKENS: 4096,
        GPT5_CONTEXT: 200000,
        CLAUDE_CONTEXT: 200000,
        TIMEOUT: 180000,
        DUAL_ANALYSIS_DELAY: 1000 // Stagger dual requests
    }
};

// Global state
let systemHealth = {
    gpt5Available: false,
    claudeAvailable: false,
    lastHealthCheck: null,
    preferredPrimary: 'auto' // 'gpt5', 'claude', 'auto'
};

console.log("🏛️ ULTIMATE DUAL AI SYSTEM v4.0 - IMPERIUM VAULT");
console.log(`   GPT-5: ${process.env.OPENAI_API_KEY ? "✅" : "❌"} (${DUAL_AI_CONFIG.GPT5_MODELS.primary})`);
console.log(`   Claude Opus 4.1: ${process.env.ANTHROPIC_API_KEY ? "✅" : "❌"} (${DUAL_AI_CONFIG.CLAUDE_MODELS.primary})`);
console.log(`   Live Data Integration: ✅ ENABLED`);
console.log(`   Dual Analysis Capability: ✅ READY`);

/**
 * 🧠 Intelligent AI Router - Determines best AI for query
 */
function routeQuery(query, options = {}) {
    // Force specific AI if requested
    if (options.forceGPT5) return { ai: 'gpt5', confidence: 1.0, reason: 'Forced GPT-5' };
    if (options.forceClaude) return { ai: 'claude', confidence: 1.0, reason: 'Forced Claude' };
    if (options.dualAnalysis) return { ai: 'both', confidence: 1.0, reason: 'Requested dual analysis' };
    
    const queryLower = query.toLowerCase();
    let gpt5Score = 0;
    let claudeScore = 0;
    
    // Score for GPT-5
    DUAL_AI_CONFIG.ROUTING_PATTERNS.USE_GPT5.forEach(pattern => {
        if (pattern.test(queryLower)) gpt5Score += 1;
    });
    
    // Score for Claude
    DUAL_AI_CONFIG.ROUTING_PATTERNS.USE_CLAUDE.forEach(pattern => {
        if (pattern.test(queryLower)) claudeScore += 1;
    });
    
    // Check for dual analysis patterns
    const needsDual = DUAL_AI_CONFIG.ROUTING_PATTERNS.USE_BOTH.some(pattern => 
        pattern.test(queryLower)
    );
    
    if (needsDual) {
        return { ai: 'both', confidence: 0.9, reason: 'Complex query requiring dual perspective' };
    }
    
    // Determine primary AI
    if (gpt5Score > claudeScore) {
        return { 
            ai: 'gpt5', 
            confidence: Math.min(gpt5Score / 3, 1.0), 
            reason: `GPT-5 specialization (score: ${gpt5Score} vs ${claudeScore})` 
        };
    } else if (claudeScore > gpt5Score) {
        return { 
            ai: 'claude', 
            confidence: Math.min(claudeScore / 3, 1.0), 
            reason: `Claude specialization (score: ${claudeScore} vs ${gpt5Score})` 
        };
    }
    
    // Default routing based on query characteristics
    if (queryLower.length < 50 && !/analysis|strategy|comprehensive/.test(queryLower)) {
        return { ai: 'claude', confidence: 0.6, reason: 'Short query - Claude conversation' };
    }
    
    if (/cambodia|fund|lending|deal/.test(queryLower)) {
        return { ai: 'claude', confidence: 0.8, reason: 'Strategic analysis - Claude expertise' };
    }
    
    // Auto-select based on availability and preference
    if (systemHealth.preferredPrimary === 'gpt5' && systemHealth.gpt5Available) {
        return { ai: 'gpt5', confidence: 0.5, reason: 'Default GPT-5 preference' };
    }
    
    return { ai: 'claude', confidence: 0.5, reason: 'Default Claude selection' };
}

/**
 * 🎯 Enhanced GPT-5 Analysis (uses your existing openaiClient.js)
 */
async function getGPT5Analysis(query, options = {}) {
    try {
        console.log('🤖 GPT-5 Strategic Analysis (via openaiClient)...');
        
        // Use your existing GPT-5 function with enhanced options
        const result = await getGptAnalysis(query, {
            ...options,
            reasoning_effort: options.reasoning_effort || 'medium',
            verbosity: options.verbosity || 'balanced'
        });
        
        return {
            response: result,
            ai: 'gpt5',
            model: 'gpt-5',
            source: 'openaiClient.js'
        };
        
    } catch (error) {
        console.error('❌ GPT-5 Analysis Error:', error.message);
        throw new Error(`GPT-5 Error: ${error.message}`);
    }
}

/**
 * 🎭 Enhanced Claude Opus 4.1 Analysis (uses your existing claudeClient.js)
 */
async function getClaudeAnalysis(query, options = {}) {
    try {
        console.log('🎭 Claude Opus 4.1 Strategic Analysis (via claudeClient)...');
        
        // Use your existing Claude function
        const result = await getClaudeAnalysisOriginal(query, {
            ...options,
            model: options.model || DUAL_AI_CONFIG.CLAUDE_MODELS.primary
        });
        
        return {
            response: result,
            ai: 'claude',
            model: DUAL_AI_CONFIG.CLAUDE_MODELS.primary,
            source: 'claudeClient.js',
            context_included: true // Your claudeClient includes live data
        };
        
    } catch (error) {
        console.error('❌ Claude Analysis Error:', error.message);
        throw new Error(`Claude Error: ${error.message}`);
    }
}

/**
 * 🔄 Dual AI Analysis - Get perspectives from both
 */
async function getDualAnalysis(query, options = {}) {
    try {
        console.log('🔄 Dual AI Analysis: GPT-5 + Claude Opus 4.1...');
        
        // Enhance query for dual analysis
        const dualQuery = options.skipEnhancement ? query : 
            `DUAL AI ANALYSIS REQUEST:\n${query}\n\nProvide your unique perspective and expertise on this query.`;
        
        // Execute both analyses with slight delay
        const [gpt5Result, claudeResult] = await Promise.allSettled([
            getGPT5Analysis(dualQuery, { ...options, systemPrompt: options.gpt5SystemPrompt }),
            new Promise(resolve => setTimeout(() => 
                getClaudeAnalysis(dualQuery, { ...options, systemPrompt: options.claudeSystemPrompt })
                    .then(resolve), 
                DUAL_AI_CONFIG.PERFORMANCE.DUAL_ANALYSIS_DELAY
            ))
        ]);
        
        // Process results
        const results = {
            success: true,
            gpt5: gpt5Result.status === 'fulfilled' ? gpt5Result.value : { error: gpt5Result.reason?.message },
            claude: claudeResult.status === 'fulfilled' ? claudeResult.value : { error: claudeResult.reason?.message },
            query: query,
            timestamp: new Date().toISOString()
        };
        
        // Create synthesis if both succeeded
        if (gpt5Result.status === 'fulfilled' && claudeResult.status === 'fulfilled') {
            results.synthesis = createSynthesis(results.gpt5, results.claude, query);
        }
        
        console.log('✅ Dual Analysis Complete');
        return results;
        
    } catch (error) {
        console.error('❌ Dual Analysis Error:', error.message);
        throw error;
    }
}

/**
 * 🔗 Create synthesis from dual analysis
 */
function createSynthesis(gpt5Result, claudeResult, originalQuery) {
    const gpt5Response = gpt5Result.response;
    const claudeResponse = claudeResult.response;
    
    return {
        summary: `Dual AI Synthesis for: "${originalQuery.substring(0, 100)}${originalQuery.length > 100 ? '...' : ''}"`,
        gpt5_perspective: {
            model: gpt5Result.model,
            length: gpt5Response.length,
            reasoning_effort: gpt5Result.reasoning_effort,
            key_strengths: ['Quantitative analysis', 'Step-by-step reasoning', 'Technical precision']
        },
        claude_perspective: {
            model: claudeResult.model,
            length: claudeResponse.length,
            context_aware: claudeResult.context_included,
            key_strengths: ['Strategic insight', 'Contextual understanding', 'Nuanced analysis']
        },
        convergence_areas: extractConvergenceAreas(gpt5Response, claudeResponse),
        unique_insights: extractUniqueInsights(gpt5Response, claudeResponse),
        recommendation: "Review both perspectives for comprehensive understanding"
    };
}

/**
 * 🎯 Main Universal AI Analysis Function
 */
async function getUniversalAnalysis(query, options = {}) {
    try {
        console.log('🎯 Universal AI Analysis - Routing query...');
        
        // Route the query
        const routing = routeQuery(query, options);
        console.log(`🧭 Route Decision: ${routing.ai} (confidence: ${(routing.confidence * 100).toFixed(0)}%) - ${routing.reason}`);
        
        // Execute based on routing
        switch (routing.ai) {
            case 'gpt5':
                return await getGPT5Analysis(query, options);
                
            case 'claude':
                return await getClaudeAnalysis(query, options);
                
            case 'both':
                return await getDualAnalysis(query, options);
                
            default:
                throw new Error(`Invalid AI routing: ${routing.ai}`);
        }
        
    } catch (error) {
        console.error('❌ Universal Analysis Error:', error.message);
        
        // Intelligent fallback
        if (!options.fallbackAttempted) {
            console.log('🔄 Attempting fallback analysis...');
            
            // Try the other AI
            const fallbackOptions = { ...options, fallbackAttempted: true };
            
            if (routing.ai === 'gpt5') {
                return await getClaudeAnalysis(query, fallbackOptions);
            } else if (routing.ai === 'claude') {
                return await getGPT5Analysis(query, fallbackOptions);
            }
        }
        
        throw error;
    }
}

/**
 * 🏥 System Health Check (uses your existing health checks)
 */
async function checkDualSystemHealth() {
    console.log('🏥 Checking Dual AI System Health...');
    
    const health = {
        timestamp: new Date().toISOString(),
        gpt5: { available: false, source: 'openaiClient.js' },
        claude: { available: false, source: 'claudeClient.js' },
        liveData: { available: false },
        overall: 'UNKNOWN'
    };
    
    // Test GPT-5 via your existing client
    try {
        await testGPTCapabilities();
        health.gpt5.available = true;
        console.log('✅ GPT-5 Health: ONLINE (via openaiClient)');
    } catch (error) {
        health.gpt5.error = error.message;
        console.log('❌ GPT-5 Health: OFFLINE');
    }
    
    // Test Claude via your existing client  
    try {
        const claudeHealth = await checkClaudeHealth();
        health.claude.available = claudeHealth.overallHealth;
        health.claude.details = claudeHealth;
        console.log('✅ Claude Health: ONLINE (via claudeClient)');
    } catch (error) {
        health.claude.error = error.message;
        console.log('❌ Claude Health: OFFLINE');
    }
    
    // Test Live Data
    try {
        await getEnhancedLiveData();
        health.liveData.available = true;
        console.log('✅ Live Data: ONLINE');
    } catch (error) {
        health.liveData.error = error.message;
        console.log('❌ Live Data: OFFLINE');
    }
    
    // Determine overall health
    if (health.gpt5.available && health.claude.available) {
        health.overall = 'EXCELLENT';
    } else if (health.gpt5.available || health.claude.available) {
        health.overall = 'FUNCTIONAL';
    } else {
        health.overall = 'CRITICAL';
    }
    
    // Update global state
    systemHealth = {
        gpt5Available: health.gpt5.available,
        claudeAvailable: health.claude.available,
        lastHealthCheck: health.timestamp,
        preferredPrimary: systemHealth.preferredPrimary
    };
    
    console.log(`🏥 Overall System Health: ${health.overall}`);
    return health;
}

/**
 * 📊 Specialized Analysis Functions
 */

// Market Analysis with optimal AI selection
async function getMarketAnalysis(query, marketData = null, options = {}) {
    const enhancedQuery = `STRATEGIC MARKET ANALYSIS:\n${query}`;
    
    if (marketData) {
        enhancedQuery += `\n\nMarket Context:\n${JSON.stringify(marketData, null, 2)}`;
    }
    
    // Use Claude for strategic market insights
    return await getClaudeAnalysis(enhancedQuery, {
        ...options,
        systemPrompt: "You are Claude Opus 4.1 providing institutional-grade market analysis. Focus on strategic implications, regime dynamics, and actionable investment insights."
    });
}

// Quantitative Analysis with GPT-5
async function getQuantitativeAnalysis(query, data = null, options = {}) {
    const enhancedQuery = `QUANTITATIVE ANALYSIS REQUEST:\n${query}`;
    
    if (data) {
        enhancedQuery += `\n\nData:\n${JSON.stringify(data, null, 2)}`;
    }
    
    enhancedQuery += `\n\nProvide step-by-step quantitative analysis with calculations, formulas, and precise numerical results.`;
    
    return await getGPT5Analysis(enhancedQuery, {
        ...options,
        reasoning_effort: 'high',
        verbosity: 'detailed',
        systemPrompt: "You are GPT-5 providing precise quantitative analysis. Use advanced mathematical reasoning, show all calculations, and provide exact numerical results."
    });
}

// Cambodia Analysis with dual perspective
async function getCambodiaAnalysis(query, dealData = null, options = {}) {
    let enhancedQuery = `CAMBODIA MARKET ANALYSIS:\n${query}`;
    
    if (dealData) {
        enhancedQuery += `\n\nDeal Parameters:\n${JSON.stringify(dealData, null, 2)}`;
    }
    
    // Use dual analysis for comprehensive Cambodia assessment
    return await getDualAnalysis(enhancedQuery, {
        ...options,
        gpt5SystemPrompt: "You are GPT-5 analyzing Cambodia investment opportunities. Focus on quantitative risk assessment, financial calculations, and data-driven insights.",
        claudeSystemPrompt: "You are Claude Opus 4.1 analyzing Cambodia market strategy. Focus on contextual understanding, political risk, cultural factors, and strategic positioning."
    });
}

// Vision Analysis with GPT-5 (uses your existing function)
async function analyzeImageWithAI(base64Image, prompt, options = {}) {
    try {
        console.log('🖼️ AI Vision Analysis with GPT-5 (via openaiClient)...');
        
        // Use your existing vision analysis function
        const result = await analyzeImageWithGPT(base64Image, prompt, options);
        
        return {
            response: result,
            ai: 'gpt5',
            model: 'gpt-5',
            analysis_type: 'vision',
            source: 'openaiClient.js'
        };
        
    } catch (error) {
        console.error('❌ Vision analysis error:', error.message);
        throw new Error(`Vision Analysis Error: ${error.message}`);
    }
}

// Utility functions
function extractConvergenceAreas(response1, response2) {
    // Simple keyword overlap detection
    const words1 = response1.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    const words2 = response2.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    const overlap = words1.filter(w => words2.includes(w));
    return overlap.slice(0, 5); // Top 5 common concepts
}

function extractUniqueInsights(gpt5Response, claudeResponse) {
    return {
        gpt5_unique: "Quantitative precision and step-by-step methodology",
        claude_unique: "Strategic context and nuanced risk assessment"
    };
}

// Get system metrics
function getDualSystemMetrics() {
    return {
        system: "ULTIMATE DUAL AI SYSTEM v4.0",
        models: {
            gpt5: DUAL_AI_CONFIG.GPT5_MODELS.primary,
            claude: DUAL_AI_CONFIG.CLAUDE_MODELS.primary
        },
        capabilities: [
            'Intelligent AI routing',
            'GPT-5 quantitative analysis',
            'Claude strategic insights', 
            'Dual perspective analysis',
            'Live market data integration',
            'Vision analysis',
            'System health monitoring',
            'Automatic fallback handling'
        ],
        health: systemHealth,
        routing_confidence: 'Adaptive based on query patterns'
    };
}

// Export all functions
module.exports = {
    // Main Functions
    getUniversalAnalysis,
    getDualAnalysis,
    getGPT5Analysis,
    getClaudeAnalysis,
    
    // Specialized Functions
    getMarketAnalysis,
    getQuantitativeAnalysis,
    getCambodiaAnalysis,
    analyzeImageWithAI,
    
    // System Functions
    checkDualSystemHealth,
    routeQuery,
    getDualSystemMetrics,
    
    // Utility Functions
    createSynthesis,
    extractConvergenceAreas,
    extractUniqueInsights,
    
    // Direct Client Access
    openai,
    anthropic,
    DUAL_AI_CONFIG,
    
    // Legacy Compatibility
    getGptAnalysis: getGPT5Analysis,
    getClaudeAnalysis: getClaudeAnalysis,
    getStrategicAnalysis: (query, options) => getClaudeAnalysis(query, options),
    getEnhancedAnalysis: getUniversalAnalysis
};
