// utils/gpt5SpeedOptimization.js - COMPLETE with Complex Query Support

// ✅ FIXED: Import GPT-5 functions from openaiClient
const {
    getGPT5Analysis,
    getQuickNanoResponse,
    getQuickMiniResponse,
    getDeepAnalysis,
    getChatResponse,
    analyzeQueryForGPT5
} = require('./openaiClient');

// 🚀 ENHANCED SPEED-OPTIMIZED GPT-5 CONFIGURATION
const SPEED_OPTIMIZED_CONFIG = {
    // Default to fastest model unless complexity detected
    DEFAULT_MODEL: "gpt-5-nano",        // Fastest, cheapest
    DEFAULT_REASONING: "minimal",       // Fastest reasoning
    DEFAULT_VERBOSITY: "low",           // Concise responses
    DEFAULT_TOKENS: 800,                // Smaller responses = faster
    
    // Speed thresholds for model selection
    NANO_MAX_WORDS: 15,                 // Use Nano for very short queries
    MINI_MAX_WORDS: 50,                 // Use Mini for medium queries
    FULL_MIN_COMPLEXITY_SCORE: 4,       // Only use Full for very complex queries
    
    // ✅ ENHANCED: Timeout settings (increased for complex tasks)
    NANO_TIMEOUT: 10000,                // 10 seconds for Nano
    MINI_TIMEOUT: 45000,                // 45 seconds for Mini  
    FULL_TIMEOUT: 120000,               // 2 minutes for Full
    COMPLEX_TIMEOUT: 180000,            // 3 minutes for very complex tasks
    DOCUMENT_TIMEOUT: 240000,           // 4 minutes for document creation
    
    // Speed keywords - always use Nano with minimal reasoning
    SPEED_KEYWORDS: [
        'quick', 'fast', 'urgent', 'now', 'asap', 'immediate',
        'hello', 'hi', 'thanks', 'yes', 'no', 'ok', 'time', 'date'
    ],
    
    // ✅ NEW: Complex document keywords
    COMPLEX_DOCUMENT_KEYWORDS: [
        'draft', 'create', 'write', 'compose', 'generate', 'develop',
        'memo', 'document', 'report', 'analysis', 'plan', 'strategy',
        'criteria', 'checklist', 'outline', 'framework', 'proposal',
        'pitch', 'presentation', 'summary', 'overview', 'guide'
    ],
    
    // ✅ NEW: Cambodia/Finance specific keywords
    FINANCE_KEYWORDS: [
        'cambodia', 'fund', 'investment', 'portfolio', 'lp', 'limited partner',
        'deployment', 'lending', 'real estate', 'due diligence',
        'risk assessment', 'financial', 'valuation', 'irr', 'roi'
    ]
};

// 🎯 ENHANCED Speed-First Query Analysis with Complex Document Detection
function analyzeQueryForSpeed(prompt) {
    const message = prompt.toLowerCase().trim();
    const words = message.split(/\s+/);
    const wordCount = words.length;
    
    console.log(`🔍 Analyzing query: ${wordCount} words - "${message.substring(0, 50)}..."`);
    
    // Calculate base complexity score (0-5)
    let complexityScore = 0;
    
    // Word count factor
    if (wordCount > 100) complexityScore += 3;
    else if (wordCount > 50) complexityScore += 2;
    else if (wordCount > 20) complexityScore += 1;
    
    // ✅ NEW: Detect complex document creation requests
    const complexDocumentPatterns = [
        /draft|create|write|compose|generate|develop/i,
        /memo|document|report|analysis|plan|strategy/i,
        /criteria|checklist|outline|framework|proposal/i,
        /cambodia.*fund|lp.*criteria|investor.*pitch/i,
        /comprehensive|detailed|thorough|in-depth/i,
        /governance|operational|deployment|lending/i
    ];
    
    const isComplexDocument = complexDocumentPatterns.some(pattern => pattern.test(message));
    const hasFinanceKeywords = SPEED_OPTIMIZED_CONFIG.FINANCE_KEYWORDS.some(keyword => 
        message.includes(keyword)
    );
    
    // ✅ NEW: Enhanced complexity detection
    const complexityIndicators = [
        /analyze|evaluate|assess|compare|optimize/i,
        /portfolio|strategy|analysis|calculation/i,
        /comprehensive|detailed|thorough/i,
        /multi|complex|sophisticated/i,
        /step.*by.*step|break.*down|explain.*how/i
    ];
    
    complexityIndicators.forEach(pattern => {
        if (pattern.test(message)) complexityScore += 1;
    });
    
    // Boost complexity for document requests
    if (isComplexDocument) complexityScore += 2;
    if (hasFinanceKeywords) complexityScore += 1;
    
    console.log(`📊 Complexity analysis: score=${complexityScore}, isDocument=${isComplexDocument}, hasFinance=${hasFinanceKeywords}`);
    
    // ✅ PRIORITY 1: Speed keywords (force ultra-fast)
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
            priority: 'ultra_speed',
            complexityScore: 0,
            isComplexDocument: false
        };
    }
    
    // ✅ PRIORITY 2: Complex document creation (optimized for documents)
    if (isComplexDocument) {
        console.log('📝 Complex document request detected');
        
        // For very long or complex documents, use Mini with extended timeout
        if (wordCount > 30 || complexityScore > 4) {
            return {
                model: 'gpt-5-mini',  // Use Mini instead of Full for better speed
                reasoning_effort: 'medium',
                verbosity: 'high',
                max_completion_tokens: 4000,
                timeout: SPEED_OPTIMIZED_CONFIG.DOCUMENT_TIMEOUT,
                reason: 'Complex document creation - GPT-5 Mini with extended timeout',
                priority: 'complex_document',
                complexityScore: complexityScore,
                isComplexDocument: true
            };
        } else {
            // Shorter documents can use Mini with faster settings
            return {
                model: 'gpt-5-mini',
                reasoning_effort: 'low',  // Faster reasoning for shorter docs
                verbosity: 'high',
                max_completion_tokens: 2500,
                timeout: SPEED_OPTIMIZED_CONFIG.MINI_TIMEOUT,
                reason: 'Simple document creation - GPT-5 Mini optimized',
                priority: 'simple_document',
                complexityScore: complexityScore,
                isComplexDocument: true
            };
        }
    }
    
    // ✅ PRIORITY 3: Simple queries - Nano with minimal reasoning
    if (wordCount <= SPEED_OPTIMIZED_CONFIG.NANO_MAX_WORDS || complexityScore === 0) {
        return {
            model: 'gpt-5-nano',
            reasoning_effort: 'minimal',
            verbosity: 'low', 
            max_completion_tokens: 600,
            timeout: SPEED_OPTIMIZED_CONFIG.NANO_TIMEOUT,
            reason: 'Simple query - Nano with minimal reasoning',
            priority: 'speed',
            complexityScore: complexityScore,
            isComplexDocument: false
        };
    }
    
    // ✅ PRIORITY 4: Medium queries - Mini with low reasoning for speed
    if (wordCount <= SPEED_OPTIMIZED_CONFIG.MINI_MAX_WORDS || complexityScore <= 2) {
        return {
            model: 'gpt-5-mini',
            reasoning_effort: 'low',  // Changed from 'medium' to 'low' for speed
            verbosity: 'medium',
            max_completion_tokens: 1500,
            timeout: SPEED_OPTIMIZED_CONFIG.MINI_TIMEOUT,
            reason: 'Medium query - Mini with low reasoning for speed',
            priority: 'balanced',
            complexityScore: complexityScore,
            isComplexDocument: false
        };
    }
    
    // ✅ PRIORITY 5: Complex analysis - Use Mini first, not Full (for speed)
    if (complexityScore <= 4) {
        return {
            model: 'gpt-5-mini',  // Use Mini instead of Full for better speed
            reasoning_effort: 'medium',
            verbosity: 'high',
            max_completion_tokens: 2500,
            timeout: SPEED_OPTIMIZED_CONFIG.COMPLEX_TIMEOUT,
            reason: 'Complex analysis - GPT-5 Mini with medium reasoning',
            priority: 'complex',
            complexityScore: complexityScore,
            isComplexDocument: false
        };
    }
    
    // ✅ PRIORITY 6: Only use Full GPT-5 for extremely complex queries
    return {
        model: 'gpt-5',
        reasoning_effort: 'medium', // Don't use 'high' to avoid timeouts
        verbosity: 'high',
        max_completion_tokens: 3000,
        timeout: SPEED_OPTIMIZED_CONFIG.COMPLEX_TIMEOUT,
        reason: 'Extremely complex query - Full GPT-5 with medium reasoning',
        priority: 'very_complex',
        complexityScore: complexityScore,
        isComplexDocument: false
    };
}

// 🔥 ENHANCED Speed-Optimized GPT-5 Execution with Complex Document Support
async function executeSpeedOptimizedGPT5(prompt, options = {}) {
    const startTime = Date.now();
    
    try {
        // Get speed-optimized configuration
        const config = analyzeQueryForSpeed(prompt);
        console.log(`🚀 Speed Config: ${config.model} | ${config.reasoning_effort} | ${config.verbosity} | Score: ${config.complexityScore}`);
        
        // ✅ NEW: Special handling for complex documents
        if (config.isComplexDocument) {
            console.log(`📝 Complex document detected - priority: ${config.priority}`);
            
            try {
                // Use optimized approach for document creation
                const documentResult = await createComplexDocument(prompt, config);
                
                const responseTime = Date.now() - startTime;
                console.log(`✅ Complex document completed: ${responseTime}ms using ${documentResult.config.model}`);
                
                return {
                    response: documentResult.response,
                    responseTime: responseTime,
                    config: documentResult.config,
                    optimizedForSpeed: true,
                    complexityScore: config.complexityScore,
                    isComplexDocument: true,
                    priority: config.priority
                };
                
            } catch (documentError) {
                console.error(`❌ Document creation failed: ${documentError.message}`);
                
                // Fallback for document creation
                return await fallbackDocumentCreation(prompt, config, startTime);
            }
        }
        
        // ✅ Enhanced: Regular query processing with better timeout handling
        const finalConfig = {
            model: options.forceModel || config.model,
            reasoning_effort: options.reasoning_effort || config.reasoning_effort,
            verbosity: options.verbosity || config.verbosity,
            max_completion_tokens: options.max_completion_tokens || config.max_completion_tokens,
        };
        
        console.log(`🎯 Executing with timeout: ${config.timeout}ms`);
        
        // Create request with timeout
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
            complexityScore: config.complexityScore,
            priority: config.priority
        };
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`❌ Speed execution failed (${responseTime}ms):`, error.message);
        
        // Enhanced fallback system
        if (!options.isFailover) {
            console.log('🔄 Trying enhanced fallback system...');
            return await enhancedFallbackSystem(prompt, responseTime, options);
        }
        
        throw error;
    }
}

// ✅ NEW: Specialized function for complex document creation
async function createComplexDocument(prompt, config) {
    console.log(`📝 Creating complex document with ${config.model}`);
    
    // Enhanced prompt for document creation
    const enhancedPrompt = `DOCUMENT CREATION REQUEST: ${prompt}

Please create a professional, well-structured document that is:
- Clear and actionable
- Appropriately formatted with headers and sections
- Comprehensive but concise
- Ready for business use

Focus on delivering high-quality content efficiently.`;
    
    const result = await getGPT5Analysis(enhancedPrompt, {
        model: config.model,
        reasoning_effort: config.reasoning_effort,
        verbosity: config.verbosity,
        max_completion_tokens: config.max_completion_tokens
    });
    
    return {
        response: result,
        config: {
            model: config.model,
            reasoning_effort: config.reasoning_effort,
            verbosity: config.verbosity
        }
    };
}

// ✅ NEW: Fallback for document creation when primary method fails
async function fallbackDocumentCreation(prompt, originalConfig, startTime) {
    console.log('🔄 Document creation fallback - trying reduced complexity...');
    
    try {
        // Try with reduced settings
        const fallbackResult = await getGPT5Analysis(prompt, {
            model: 'gpt-5-mini',
            reasoning_effort: 'low',  // Reduced reasoning
            verbosity: 'medium',      // Reduced verbosity
            max_completion_tokens: 2000  // Reduced tokens
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`✅ Document fallback completed: ${responseTime}ms`);
        
        return {
            response: fallbackResult,
            responseTime: responseTime,
            config: { 
                model: 'gpt-5-mini', 
                reasoning_effort: 'low',
                verbosity: 'medium'
            },
            optimizedForSpeed: true,
            complexityScore: originalConfig.complexityScore,
            isComplexDocument: true,
            usedFallback: true,
            priority: 'document_fallback'
        };
        
    } catch (fallbackError) {
        console.error('❌ Document fallback also failed:', fallbackError.message);
        throw new Error(`Document creation completely failed: ${fallbackError.message}`);
    }
}

// ✅ NEW: Enhanced fallback system for all query types
async function enhancedFallbackSystem(prompt, originalResponseTime, options) {
    console.log('🆘 Enhanced fallback system activated...');
    
    const fallbackStrategies = [
        // Strategy 1: GPT-5 Nano with minimal settings
        {
            name: 'Ultra-Fast Nano',
            config: {
                model: 'gpt-5-nano',
                reasoning_effort: 'minimal',
                verbosity: 'low',
                max_completion_tokens: 800
            }
        },
        // Strategy 2: GPT-5 Mini with minimal settings
        {
            name: 'Fast Mini',
            config: {
                model: 'gpt-5-mini',
                reasoning_effort: 'minimal',
                verbosity: 'low',
                max_completion_tokens: 1000
            }
        },
        // Strategy 3: Quick functions fallback
        {
            name: 'Quick Function',
            useQuickFunction: true
        }
    ];
    
    for (const strategy of fallbackStrategies) {
        try {
            console.log(`🔄 Trying fallback strategy: ${strategy.name}`);
            const strategyStartTime = Date.now();
            
            let result;
            
            if (strategy.useQuickFunction) {
                // Use quick function as last resort
                result = await getQuickNanoResponse(prompt, {
                    reasoning_effort: 'minimal',
                    verbosity: 'low',
                    max_completion_tokens: 600
                });
            } else {
                // Use regular analysis with fallback config
                result = await getGPT5Analysis(prompt, strategy.config);
            }
            
            const strategyResponseTime = Date.now() - strategyStartTime;
            console.log(`✅ Fallback strategy ${strategy.name} succeeded: ${strategyResponseTime}ms`);
            
            return {
                response: result,
                responseTime: originalResponseTime + strategyResponseTime,
                config: strategy.config || { model: 'gpt-5-nano', reasoning_effort: 'minimal' },
                optimizedForSpeed: true,
                isFailover: true,
                fallbackStrategy: strategy.name
            };
            
        } catch (strategyError) {
            console.log(`❌ Fallback strategy ${strategy.name} failed: ${strategyError.message}`);
            continue;
        }
    }
    
    // If all strategies fail, throw error
    throw new Error('All fallback strategies failed');
}

// 🎯 ENHANCED Quick Command Shortcuts with Better Error Handling

async function ultraFastResponse(prompt) {
    try {
        console.log('⚡ Ultra-fast response using GPT-5 Nano...');
        const startTime = Date.now();
        
        const result = await getQuickNanoResponse(prompt, {
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 500
        });
        
        return {
            response: result,
            responseTime: Date.now() - startTime,
            config: { model: 'gpt-5-nano', reasoning_effort: 'minimal' },
            optimizedForSpeed: true,
            priority: 'ultra_fast'
        };
    } catch (error) {
        console.error('❌ Ultra-fast response failed:', error.message);
        
        // Emergency fallback
        try {
            const fallback = await getGPT5Analysis(prompt, {
                model: 'gpt-5-nano',
                reasoning_effort: 'minimal',
                verbosity: 'low',
                max_completion_tokens: 300
            });
            
            return {
                response: fallback,
                responseTime: Date.now() - Date.now(),
                config: { model: 'gpt-5-nano', reasoning_effort: 'minimal' },
                optimizedForSpeed: true,
                priority: 'ultra_fast_fallback'
            };
        } catch (fallbackError) {
            throw new Error(`Ultra-fast response completely failed: ${fallbackError.message}`);
        }
    }
}

async function fastResponse(prompt) {
    try {
        console.log('🚀 Fast response using GPT-5 Nano+...');
        const startTime = Date.now();
        
        const result = await getQuickNanoResponse(prompt, {
            reasoning_effort: 'minimal',
            verbosity: 'medium',
            max_completion_tokens: 800
        });
        
        return {
            response: result,
            responseTime: Date.now() - startTime,
            config: { model: 'gpt-5-nano', reasoning_effort: 'minimal' },
            optimizedForSpeed: true,
            priority: 'fast'
        };
    } catch (error) {
        console.error('❌ Fast response failed:', error.message);
        throw error;
    }
}

async function balancedResponse(prompt) {
    try {
        console.log('⚖️ Balanced response using GPT-5 Mini...');
        const startTime = Date.now();
        
        const result = await getQuickMiniResponse(prompt, {
            reasoning_effort: 'low',  // Reduced for speed
            verbosity: 'medium',
            max_completion_tokens: 1200
        });
        
        return {
            response: result,
            responseTime: Date.now() - startTime,
            config: { model: 'gpt-5-mini', reasoning_effort: 'low' },
            optimizedForSpeed: true,
            priority: 'balanced'
        };
    } catch (error) {
        console.error('❌ Balanced response failed:', error.message);
        throw error;
    }
}

// 🔧 ENHANCED Speed Testing Function with Complex Document Testing
async function testGPT5Speed() {
    const testQueries = [
        // Speed tests
        { query: "Hello", expectedTime: "2-4s", expectedModel: "nano" },
        { query: "What time is it?", expectedTime: "2-4s", expectedModel: "nano" },
        { query: "Quick market update", expectedTime: "3-6s", expectedModel: "nano" },
        
        // Medium complexity tests
        { query: "Analyze my investment portfolio strategy", expectedTime: "10-20s", expectedModel: "mini" },
        
        // Complex document tests
        { query: "Draft a concise investment memo for Cambodia fund", expectedTime: "30-60s", expectedModel: "mini" },
        { query: "Create a comprehensive LP criteria document", expectedTime: "45-90s", expectedModel: "mini" },
        
        // Very complex tests
        { query: "Comprehensive financial analysis of Cambodia real estate market with risk assessment", expectedTime: "60-120s", expectedModel: "mini/full" }
    ];
    
    console.log('🚀 Testing GPT-5 Speed Optimization with Complex Document Support...\n');
    
    let totalTests = 0;
    let successfulTests = 0;
    
    for (const test of testQueries) {
        totalTests++;
        try {
            console.log(`\n📝 Testing: "${test.query}"`);
            console.log(`📊 Expected: ${test.expectedTime} using ${test.expectedModel}`);
            
            const startTime = Date.now();
            const result = await executeSpeedOptimizedGPT5(test.query);
            const actualTime = Date.now() - startTime;
            
            const seconds = Math.round(actualTime / 1000);
            
            console.log(`✅ SUCCESS:`);
            console.log(`   Model: ${result.config.model}`);
            console.log(`   Time: ${seconds}s (${actualTime}ms)`);
            console.log(`   Reasoning: ${result.config.reasoning_effort}`);
            console.log(`   Priority: ${result.priority || 'unknown'}`);
            console.log(`   Response Length: ${result.response.length} chars`);
            console.log(`   Complex Document: ${result.isComplexDocument ? 'Yes' : 'No'}`);
            
            if (result.usedFallback) {
                console.log(`   ⚠️ Used Fallback: ${result.fallbackStrategy || 'Yes'}`);
            }
            
            successfulTests++;
            
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
        }
        
        console.log('---');
    }
    
    console.log(`\n📊 SPEED TEST SUMMARY:`);
    console.log(`✅ Successful: ${successfulTests}/${totalTests} (${Math.round((successfulTests/totalTests) * 100)}%)`);
    console.log(`🚀 Complex Document Support: ${successfulTests >= totalTests * 0.8 ? 'WORKING' : 'NEEDS ATTENTION'}`);
    
    if (successfulTests === totalTests) {
        console.log(`🎉 ALL TESTS PASSED - GPT-5 Speed + Complex Document system is working perfectly!`);
    } else if (successfulTests >= totalTests * 0.7) {
        console.log(`✅ MOSTLY WORKING - ${successfulTests} out of ${totalTests} tests passed`);
    } else {
        console.log(`⚠️ NEEDS ATTENTION - Only ${successfulTests} out of ${totalTests} tests passed`);
    }
}

// ✅ ENHANCED: Export all functions with new complex document support
module.exports = {
    // Configuration
    SPEED_OPTIMIZED_CONFIG,
    
    // Main functions
    analyzeQueryForSpeed,
    executeSpeedOptimizedGPT5,
    
    // Quick response functions
    ultraFastResponse,
    fastResponse,
    balancedResponse,
    
    // ✅ NEW: Complex document functions
    createComplexDocument,
    fallbackDocumentCreation,
    enhancedFallbackSystem,
    
    // Testing function
    testGPT5Speed,
    
    // ✅ NEW: Utility functions
    detectComplexDocument: (prompt) => {
        const config = analyzeQueryForSpeed(prompt);
        return config.isComplexDocument;
    },
    
    getOptimalTimeout: (prompt) => {
        const config = analyzeQueryForSpeed(prompt);
        return config.timeout;
    },
    
    getRecommendedModel: (prompt) => {
        const config = analyzeQueryForSpeed(prompt);
        return {
            model: config.model,
            reasoning: config.reasoning_effort,
            verbosity: config.verbosity,
            reason: config.reason,
            priority: config.priority
        };
    }
};

console.log('🚀 Enhanced GPT-5 Speed Optimization loaded with Complex Document Support');
console.log('📝 Complex document creation: Optimized for memos, reports, and analysis');
console.log('⚡ Speed optimization: 3-tier fallback system active');
console.log('🔧 Enhanced timeouts: Up to 4 minutes for complex documents');
console.log('🎯 Smart routing: Auto-detects document requests for optimal processing');
