// utils/gpt5SpeedOptimization.js - FIXED: Proper imports for GPT-5 functions

// ✅ FIXED: Import GPT-5 functions from openaiClient
const {
    getGPT5Analysis,
    getQuickNanoResponse,
    getQuickMiniResponse,
    getDeepAnalysis,
    getChatResponse,
    analyzeQueryForGPT5
} = require('./openaiClient');

// 🚀 SPEED-OPTIMIZED GPT-5 DEFAULTS
const SPEED_OPTIMIZED_CONFIG = {
    // Default to fastest model unless complexity detected
    DEFAULT_MODEL: "gpt-5-nano",
    DEFAULT_REASONING: "minimal",
    DEFAULT_VERBOSITY: "low",
    DEFAULT_TOKENS: 800,
    
    // Speed thresholds for model selection
    NANO_MAX_WORDS: 20,
    MINI_MAX_WORDS: 100,
    FULL_MIN_COMPLEXITY_SCORE: 3,
    
    // ✅ UPDATED: Longer timeout settings for complex tasks
    NANO_TIMEOUT: 10000,                // 10 seconds for Nano
    MINI_TIMEOUT: 30000,                // 30 seconds for Mini  
    FULL_TIMEOUT: 120000,               // 2 minutes for Full
    COMPLEX_TIMEOUT: 180000,            // 3 minutes for very complex tasks
    
    // Speed keywords - always use Nano with minimal reasoning
    SPEED_KEYWORDS: [
        'quick', 'fast', 'urgent', 'now', 'asap', 'immediate',
        'hello', 'hi', 'thanks', 'yes', 'no', 'ok', 'time', 'date'
    ]
};

// 🎯 Enhanced Speed-First Query Analysis
function analyzeQueryForSpeed(prompt) {
    const message = prompt.toLowerCase().trim();
    const words = message.split(/\s+/);
    const wordCount = words.length;
    
    // Calculate complexity score (0-5)
    let complexityScore = 0;
    
    // Word count factor
    if (wordCount > 50) complexityScore += 2;
    else if (wordCount > 20) complexityScore += 1;
    
    // Complexity indicators
    const complexPatterns = [
        /analyze|evaluate|assess|compare|optimize/i,
        /portfolio|strategy|analysis|calculation/i,
        /comprehensive|detailed|thorough/i,
        /multi|complex|sophisticated/i
    ];
    
    complexPatterns.forEach(pattern => {
        if (pattern.test(message)) complexityScore += 1;
    });
    
    // Speed indicators (force Nano regardless of other factors)
    const hasSpeedKeyword = SPEED_OPTIMIZED_CONFIG.SPEED_KEYWORDS.some(
        keyword => message.includes(keyword)
    );
    
    if (hasSpeedKeyword) {
        return {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 400,
            timeout: SPEED_OPTIMIZED_CONFIG.NANO_TIMEOUT,
            reason: 'Speed keyword detected - using fastest configuration',
            priority: 'speed',
            complexityScore: 0
        };
    }
    
    // Simple queries - Nano with minimal reasoning
    if (wordCount <= SPEED_OPTIMIZED_CONFIG.NANO_MAX_WORDS || complexityScore === 0) {
        return {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            verbosity: 'low', 
            max_completion_tokens: 600,
            timeout: SPEED_OPTIMIZED_CONFIG.NANO_TIMEOUT,
            reason: 'Simple query - Nano with minimal reasoning',
            priority: 'speed',
            complexityScore: complexityScore
        };
    }
    
    // Medium queries - Mini with low reasoning for speed
    if (wordCount <= SPEED_OPTIMIZED_CONFIG.MINI_MAX_WORDS || complexityScore <= 2) {
        return {
            model: 'gpt-5-mini',
            reasoning_effort: 'low',  // Changed from 'medium' to 'low'
            verbosity: 'medium',
            max_completion_tokens: 1200,
            timeout: SPEED_OPTIMIZED_CONFIG.MINI_TIMEOUT,
            reason: 'Medium query - Mini with low reasoning for speed',
            priority: 'balanced',
            complexityScore: complexityScore
        };
    }
    
    // Only use Full GPT-5 for genuinely complex queries
    return {
        model: 'gpt-5',
        reasoning_effort: 'medium', // Don't default to 'high'
        verbosity: 'medium',
        max_completion_tokens: 2000,
        timeout: SPEED_OPTIMIZED_CONFIG.FULL_TIMEOUT,
        reason: 'Complex query - Full GPT-5 with medium reasoning',
        priority: 'complex',
        complexityScore: complexityScore
    };
}

// 🔥 Speed-Optimized GPT-5 Execution (FIXED with proper imports)
async function executeSpeedOptimizedGPT5(prompt, options = {}) {
    const startTime = Date.now();
    
    try {
        // Get speed-optimized configuration
        const config = analyzeQueryForSpeed(prompt);
        console.log(`🚀 Speed Config: ${config.model} | ${config.reasoning_effort} | ${config.verbosity} | Score: ${config.complexityScore}`);
        
        // Override with user options if provided
        const finalConfig = {
            model: options.forceModel || config.model,
            reasoning_effort: options.reasoning_effort || config.reasoning_effort,
            verbosity: options.verbosity || config.verbosity,
            max_completion_tokens: options.max_completion_tokens || config.max_completion_tokens,
        };
        
        // ✅ FIXED: Use the properly imported getGPT5Analysis function
        const requestPromise = getGPT5Analysis(prompt, finalConfig);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), config.timeout);
        });
        
        const result = await Promise.race([requestPromise, timeoutPromise]);
        const responseTime = Date.now() - startTime;
        
        console.log(`⚡ Response time: ${responseTime}ms | Model: ${finalConfig.model}`);
        
        return {
            response: result,
            responseTime: responseTime,
            config: finalConfig,
            optimizedForSpeed: true,
            complexityScore: config.complexityScore
        };
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`❌ Speed execution failed (${responseTime}ms):`, error.message);
        
        // Ultra-fast fallback - try the quick functions instead
        if (!options.isFailover) {
            console.log('🔄 Trying ultra-fast fallback...');
            try {
                // ✅ FIXED: Use properly imported quick functions
                const fallbackResult = await getQuickNanoResponse(prompt, {
                    reasoning_effort: 'minimal',
                    verbosity: 'low',
                    max_completion_tokens: 300
                });
                
                return {
                    response: fallbackResult,
                    responseTime: Date.now() - startTime,
                    config: { model: 'gpt-5-nano', reasoning_effort: 'minimal' },
                    optimizedForSpeed: true,
                    isFailover: true
                };
            } catch (fallbackError) {
                throw new Error(`All speed optimizations failed: ${fallbackError.message}`);
            }
        }
        
        throw error;
    }
}

// 🎯 Quick Command Shortcuts for Different Speed Levels (FIXED)
async function ultraFastResponse(prompt) {
    try {
        console.log('⚡ Ultra-fast response using GPT-5 Nano...');
        // ✅ FIXED: Use the properly imported function
        const result = await getQuickNanoResponse(prompt, {
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 300
        });
        
        return {
            response: result,
            responseTime: 0, // Will be set by caller
            config: { model: 'gpt-5-nano', reasoning_effort: 'minimal' },
            optimizedForSpeed: true
        };
    } catch (error) {
        console.error('❌ Ultra-fast response failed:', error.message);
        throw error;
    }
}

async function fastResponse(prompt) {
    try {
        console.log('🚀 Fast response using GPT-5 Nano+...');
        // ✅ FIXED: Use the properly imported function
        const result = await getQuickNanoResponse(prompt, {
            reasoning_effort: 'minimal',
            verbosity: 'medium',
            max_completion_tokens: 600
        });
        
        return {
            response: result,
            responseTime: 0, // Will be set by caller
            config: { model: 'gpt-5-nano', reasoning_effort: 'minimal' },
            optimizedForSpeed: true
        };
    } catch (error) {
        console.error('❌ Fast response failed:', error.message);
        throw error;
    }
}

async function balancedResponse(prompt) {
    try {
        console.log('⚖️ Balanced response using GPT-5 Mini...');
        // ✅ FIXED: Use the properly imported function
        const result = await getQuickMiniResponse(prompt, {
            reasoning_effort: 'low',
            verbosity: 'medium',
            max_completion_tokens: 1000
        });
        
        return {
            response: result,
            responseTime: 0, // Will be set by caller
            config: { model: 'gpt-5-mini', reasoning_effort: 'low' },
            optimizedForSpeed: true
        };
    } catch (error) {
        console.error('❌ Balanced response failed:', error.message);
        throw error;
    }
}

// 🔧 Speed Testing Function (FIXED)
async function testGPT5Speed() {
    const testQueries = [
        "Hello",
        "What time is it?", 
        "Quick market update",
        "Analyze portfolio optimization strategy",
        "Comprehensive financial analysis of Cambodia real estate market"
    ];
    
    console.log('🚀 Testing GPT-5 Speed Optimization...\n');
    
    for (const query of testQueries) {
        try {
            const startTime = Date.now();
            const result = await executeSpeedOptimizedGPT5(query);
            const actualTime = Date.now() - startTime;
            
            console.log(`Query: "${query}"`);
            console.log(`Model: ${result.config.model} | Time: ${actualTime}ms | Reasoning: ${result.config.reasoning_effort}`);
            console.log(`Response Length: ${result.response.length} chars`);
            console.log('---');
        } catch (error) {
            console.log(`Query: "${query}" - FAILED: ${error.message}`);
            console.log('---');
        }
    }
}

// ✅ FIXED: Export all functions
module.exports = {
    SPEED_OPTIMIZED_CONFIG,
    analyzeQueryForSpeed,
    executeSpeedOptimizedGPT5,
    ultraFastResponse,
    fastResponse,
    balancedResponse,
    testGPT5Speed
};
