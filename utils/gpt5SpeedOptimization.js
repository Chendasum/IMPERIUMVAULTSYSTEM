// utils/gpt5SpeedOptimization.js - COMPLETE REWRITE with Role Detection Integration
// Professional GPT-5 speed optimization with comprehensive error handling and role tracking

// ✅ SAFE IMPORTS with error handling
let openaiClient;
let gpt5RoleDetector;

try {
    openaiClient = require('./openaiClient');
    console.log('✅ OpenAI Client loaded successfully');
} catch (error) {
    console.error('❌ Failed to load OpenAI Client:', error.message);
    console.log('🔄 Operating in standalone mode');
}

try {
    gpt5RoleDetector = require('./gpt5RoleDetector');
    console.log('✅ GPT-5 Role Detector loaded successfully');
} catch (error) {
    console.error('❌ Failed to load GPT-5 Role Detector:', error.message);
    console.log('🔄 Role detection will be disabled');
}

// Extract functions with null checks
const {
    getGPT5Analysis,
    getQuickNanoResponse,
    getQuickMiniResponse,
    getDeepAnalysis,
    getChatResponse,
    analyzeQueryForGPT5,
    testGPT5Capabilities
} = openaiClient || {};

// 🚀 COMPREHENSIVE SPEED-OPTIMIZED CONFIGURATION
const SPEED_CONFIG = {
    // Model selection thresholds
    MODELS: {
        NANO: "gpt-5-nano",         // Ultra-fast, simple queries
        MINI: "gpt-5-mini",         // Balanced speed/quality
        FULL: "gpt-5",              // Complex analysis
        CHAT: "gpt-5-chat-latest"   // Conversational
    },
    
    // Speed thresholds
    THRESHOLDS: {
        NANO_MAX_WORDS: 15,         // Use Nano for very short queries
        MINI_MAX_WORDS: 50,         // Use Mini for medium queries
        FULL_MIN_COMPLEXITY: 4,     // Only use Full for very complex queries
        DOCUMENT_MIN_WORDS: 10      // Minimum words to consider document creation
    },
    
    // Timeout configuration (increased for reliability)
    TIMEOUTS: {
        NANO: 15000,                // 15 seconds for Nano
        MINI: 60000,                // 60 seconds for Mini
        FULL: 120000,               // 2 minutes for Full
        COMPLEX: 180000,            // 3 minutes for very complex
        DOCUMENT: 240000            // 4 minutes for document creation
    },
    
    // Default parameters for speed
    DEFAULTS: {
        REASONING: "minimal",       // Fastest reasoning
        VERBOSITY: "low",           // Concise responses
        TOKENS: 800                 // Smaller responses = faster
    },
    
    // Speed keywords - force ultra-fast processing
    SPEED_KEYWORDS: [
        'quick', 'fast', 'urgent', 'now', 'asap', 'immediate',
        'hello', 'hi', 'thanks', 'yes', 'no', 'ok', 'time', 'date'
    ],
    
    // Document creation keywords
    DOCUMENT_KEYWORDS: [
        'draft', 'create', 'write', 'compose', 'generate', 'develop',
        'memo', 'document', 'report', 'analysis', 'plan', 'strategy',
        'criteria', 'checklist', 'outline', 'framework', 'proposal',
        'pitch', 'presentation', 'summary', 'overview', 'guide'
    ],
    
    // Finance-specific keywords for Cambodia fund
    FINANCE_KEYWORDS: [
        'cambodia', 'fund', 'investment', 'portfolio', 'lp', 'limited partner',
        'deployment', 'lending', 'real estate', 'due diligence',
        'risk assessment', 'financial', 'valuation', 'irr', 'roi'
    ]
};

// 🎯 INTELLIGENT QUERY ANALYSIS with Enhanced Logic
function analyzeQueryForSpeed(prompt) {
    const message = prompt.toLowerCase().trim();
    const words = message.split(/\s+/);
    const wordCount = words.length;
    
    console.log(`🔍 Query Analysis: ${wordCount} words - "${message.substring(0, 50)}..."`);
    
    // Calculate complexity score (0-6 scale)
    let complexityScore = 0;
    
    // Word count factor
    if (wordCount > 100) complexityScore += 3;
    else if (wordCount > 50) complexityScore += 2;
    else if (wordCount > 20) complexityScore += 1;
    
    // Document creation detection
    const isDocumentRequest = SPEED_CONFIG.DOCUMENT_KEYWORDS.some(keyword => 
        message.includes(keyword)
    );
    
    // Finance/Cambodia context detection
    const hasFinanceContext = SPEED_CONFIG.FINANCE_KEYWORDS.some(keyword => 
        message.includes(keyword)
    );
    
    // Complexity indicators
    const complexityPatterns = [
        /analyze|evaluate|assess|compare|optimize/i,
        /portfolio|strategy|analysis|calculation/i,
        /comprehensive|detailed|thorough|in-depth/i,
        /multi|complex|sophisticated/i,
        /step.*by.*step|break.*down|explain.*how/i
    ];
    
    complexityPatterns.forEach(pattern => {
        if (pattern.test(message)) complexityScore += 1;
    });
    
    // Boost for document/finance requests
    if (isDocumentRequest) complexityScore += 2;
    if (hasFinanceContext) complexityScore += 1;
    
    console.log(`📊 Analysis: complexity=${complexityScore}, document=${isDocumentRequest}, finance=${hasFinanceContext}`);
    
    // 🚀 PRIORITY 1: Speed keywords (ultra-fast route)
    const hasSpeedKeyword = SPEED_CONFIG.SPEED_KEYWORDS.some(keyword => 
        message.includes(keyword)
    );
    
    if (hasSpeedKeyword) {
        return createConfig({
            model: SPEED_CONFIG.MODELS.NANO,
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 400,
            timeout: SPEED_CONFIG.TIMEOUTS.NANO,
            priority: 'ultra_speed',
            complexityScore: 0,
            isDocumentRequest: false,
            reason: 'Speed keyword detected - ultra-fast processing'
        });
    }
    
    // 🚀 PRIORITY 2: Document creation (optimized routing)
    if (isDocumentRequest) {
        console.log('📝 Document creation request detected');
        
        // Complex documents use Mini with extended timeout
        if (wordCount > 30 || complexityScore > 4) {
            return createConfig({
                model: SPEED_CONFIG.MODELS.MINI,
                reasoning_effort: 'medium',
                verbosity: 'high',
                max_completion_tokens: 4000,
                timeout: SPEED_CONFIG.TIMEOUTS.DOCUMENT,
                priority: 'complex_document',
                complexityScore,
                isDocumentRequest: true,
                reason: 'Complex document - GPT-5 Mini with extended processing'
            });
        } else {
            // Simple documents use Mini with faster settings
            return createConfig({
                model: SPEED_CONFIG.MODELS.MINI,
                reasoning_effort: 'low',
                verbosity: 'high',
                max_completion_tokens: 2500,
                timeout: SPEED_CONFIG.TIMEOUTS.MINI,
                priority: 'simple_document',
                complexityScore,
                isDocumentRequest: true,
                reason: 'Simple document - GPT-5 Mini optimized'
            });
        }
    }
    
    // 🚀 PRIORITY 3: Simple queries (Nano route)
    if (wordCount <= SPEED_CONFIG.THRESHOLDS.NANO_MAX_WORDS || complexityScore === 0) {
        return createConfig({
            model: SPEED_CONFIG.MODELS.NANO,
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 600,
            timeout: SPEED_CONFIG.TIMEOUTS.NANO,
            priority: 'speed',
            complexityScore,
            isDocumentRequest: false,
            reason: 'Simple query - Nano with minimal processing'
        });
    }
    
    // 🚀 PRIORITY 4: Medium queries (Mini route)
    if (wordCount <= SPEED_CONFIG.THRESHOLDS.MINI_MAX_WORDS || complexityScore <= 2) {
        return createConfig({
            model: SPEED_CONFIG.MODELS.MINI,
            reasoning_effort: 'low',
            verbosity: 'medium',
            max_completion_tokens: 1500,
            timeout: SPEED_CONFIG.TIMEOUTS.MINI,
            priority: 'balanced',
            complexityScore,
            isDocumentRequest: false,
            reason: 'Medium query - Mini with balanced processing'
        });
    }
    
    // 🚀 PRIORITY 5: Complex analysis (prefer Mini for speed)
    if (complexityScore <= 4) {
        return createConfig({
            model: SPEED_CONFIG.MODELS.MINI,
            reasoning_effort: 'medium',
            verbosity: 'high',
            max_completion_tokens: 2500,
            timeout: SPEED_CONFIG.TIMEOUTS.COMPLEX,
            priority: 'complex',
            complexityScore,
            isDocumentRequest: false,
            reason: 'Complex analysis - GPT-5 Mini with enhanced processing'
        });
    }
    
    // 🚀 PRIORITY 6: Very complex (Full GPT-5)
    return createConfig({
        model: SPEED_CONFIG.MODELS.FULL,
        reasoning_effort: 'medium',
        verbosity: 'high',
        max_completion_tokens: 3000,
        timeout: SPEED_CONFIG.TIMEOUTS.COMPLEX,
        priority: 'very_complex',
        complexityScore,
        isDocumentRequest: false,
        reason: 'Very complex - Full GPT-5 with comprehensive processing'
    });
}

// 🔧 HELPER: Create standardized config object
function createConfig(params) {
    return {
        model: params.model,
        reasoning_effort: params.reasoning_effort,
        verbosity: params.verbosity,
        max_completion_tokens: params.max_completion_tokens,
        timeout: params.timeout,
        priority: params.priority,
        complexityScore: params.complexityScore,
        isDocumentRequest: params.isDocumentRequest,
        reason: params.reason
    };
}

// 🚀 MAIN EXECUTION ENGINE with Comprehensive Error Handling
async function executeSpeedOptimizedGPT5(prompt, options = {}) {
    const startTime = Date.now();
    
    try {
        // Validate inputs
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            throw new Error('Invalid prompt provided');
        }
        
        // Check system availability
        if (!openaiClient || !getGPT5Analysis) {
            throw new Error('OpenAI Client not available - check openaiClient.js configuration');
        }
        
        // Get optimized configuration
        const config = analyzeQueryForSpeed(prompt);
        console.log(`🚀 Config: ${config.model} | ${config.reasoning_effort} | ${config.verbosity} | Score: ${config.complexityScore}`);
        
        // Handle document creation with specialized processing
        if (config.isDocumentRequest) {
            return await processDocumentRequest(prompt, config, startTime, options);
        }
        
        // Execute regular query with timeout protection
        return await executeRegularQuery(prompt, config, startTime, options);
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`❌ Execution failed (${responseTime}ms):`, error.message);
        
        // Attempt fallback recovery
        if (!options.isFailover) {
            console.log('🔄 Attempting fallback recovery...');
            return await executeFailoverStrategy(prompt, responseTime, options);
        }
        
        throw new Error(`GPT-5 execution completely failed: ${error.message}`);
    }
}

// 📝 DOCUMENT PROCESSING with Specialized Handling
async function processDocumentRequest(prompt, config, startTime, options) {
    console.log(`📝 Processing document request - priority: ${config.priority}`);
    
    try {
        // Enhanced prompt for document creation
        const enhancedPrompt = `DOCUMENT CREATION REQUEST: ${prompt}

Please create a professional, well-structured document that is:
- Clear and actionable
- Appropriately formatted with headers and sections
- Comprehensive but concise
- Ready for business use

Focus on delivering high-quality content efficiently.`;
        
        const result = await executeWithTimeout(enhancedPrompt, config);
        const responseTime = Date.now() - startTime;
        
        // Detect role after response
        const roleAnalysis = detectRole(prompt, result, config);
        
        console.log(`✅ Document completed: ${responseTime}ms using ${config.model}`);
        
        return {
            response: result,
            responseTime,
            config,
            optimizedForSpeed: true,
            complexityScore: config.complexityScore,
            isDocumentRequest: true,
            priority: config.priority,
            gpt5Role: roleAnalysis?.role || 'OPERATOR',
            roleConfidence: roleAnalysis?.confidence || 0,
            expectedRole: roleAnalysis?.expected || 'OPERATOR',
            behaviorMatch: roleAnalysis?.behaviorMatch || false,
            roleAnalysis
        };
        
    } catch (documentError) {
        console.error(`❌ Document creation failed: ${documentError.message}`);
        return await fallbackDocumentCreation(prompt, config, startTime);
    }
}

// ⚡ REGULAR QUERY PROCESSING with Timeout Protection
async function executeRegularQuery(prompt, config, startTime, options) {
    // Override config with options if provided
    const finalConfig = {
        model: options.forceModel || config.model,
        reasoning_effort: options.reasoning_effort || config.reasoning_effort,
        verbosity: options.verbosity || config.verbosity,
        max_completion_tokens: options.max_completion_tokens || config.max_completion_tokens
    };
    
    console.log(`🎯 Executing with timeout: ${config.timeout}ms`);
    
    const result = await executeWithTimeout(prompt, finalConfig, config.timeout);
    const responseTime = Date.now() - startTime;
    
    // Detect role after response
    const roleAnalysis = detectRole(prompt, result, { ...finalConfig, priority: config.priority });
    
    console.log(`⚡ Response: ${responseTime}ms | Model: ${finalConfig.model}`);
    
    return {
        response: result,
        responseTime,
        config: finalConfig,
        optimizedForSpeed: true,
        complexityScore: config.complexityScore,
        priority: config.priority,
        isDocumentRequest: config.isDocumentRequest,
        gpt5Role: roleAnalysis?.role || 'unknown',
        roleConfidence: roleAnalysis?.confidence || 0,
        expectedRole: roleAnalysis?.expected || 'unknown',
        behaviorMatch: roleAnalysis?.behaviorMatch || false,
        roleAnalysis
    };
}

// ⏱️ TIMEOUT-PROTECTED EXECUTION
async function executeWithTimeout(prompt, config, timeout = 60000) {
    const requestPromise = getGPT5Analysis(prompt, config);
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout);
    });
    
    return await Promise.race([requestPromise, timeoutPromise]);
}

// 🎯 ROLE DETECTION with Safe Execution
function detectRole(prompt, response, config) {
    if (!gpt5RoleDetector || !gpt5RoleDetector.checkGPT5Role) {
        return null;
    }
    
    try {
        const roleAnalysis = gpt5RoleDetector.checkGPT5Role(prompt, response, config);
        console.log(`🎯 Role: ${roleAnalysis.role} (${roleAnalysis.confidence}% confidence)`);
        return roleAnalysis;
    } catch (roleError) {
        console.log('⚠️ Role detection failed:', roleError.message);
        return null;
    }
}

// 🔄 FALLBACK DOCUMENT CREATION
async function fallbackDocumentCreation(prompt, originalConfig, startTime) {
    console.log('🔄 Document fallback - reducing complexity...');
    
    try {
        const fallbackConfig = {
            model: SPEED_CONFIG.MODELS.MINI,
            reasoning_effort: 'low',
            verbosity: 'medium',
            max_completion_tokens: 2000
        };
        
        const result = await executeWithTimeout(prompt, fallbackConfig, SPEED_CONFIG.TIMEOUTS.MINI);
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ Document fallback completed: ${responseTime}ms`);
        
        return {
            response: result,
            responseTime,
            config: fallbackConfig,
            optimizedForSpeed: true,
            complexityScore: originalConfig.complexityScore,
            isDocumentRequest: true,
            usedFallback: true,
            priority: 'document_fallback',
            gpt5Role: 'OPERATOR',
            roleConfidence: 70,
            expectedRole: 'OPERATOR',
            behaviorMatch: true
        };
        
    } catch (fallbackError) {
        console.error('❌ Document fallback failed:', fallbackError.message);
        throw new Error(`Document creation completely failed: ${fallbackError.message}`);
    }
}

// 🆘 COMPREHENSIVE FAILOVER STRATEGY
async function executeFailoverStrategy(prompt, originalResponseTime, options) {
    console.log('🆘 Executing comprehensive failover strategy...');
    
    const strategies = [
        {
            name: 'Ultra-Fast Nano',
            config: {
                model: SPEED_CONFIG.MODELS.NANO,
                reasoning_effort: 'minimal',
                verbosity: 'low',
                max_completion_tokens: 800
            },
            timeout: SPEED_CONFIG.TIMEOUTS.NANO
        },
        {
            name: 'Fast Mini',
            config: {
                model: SPEED_CONFIG.MODELS.MINI,
                reasoning_effort: 'minimal',
                verbosity: 'low',
                max_completion_tokens: 1000
            },
            timeout: SPEED_CONFIG.TIMEOUTS.MINI
        },
        {
            name: 'Quick Function',
            useQuickFunction: true
        }
    ];
    
    for (const strategy of strategies) {
        try {
            console.log(`🔄 Trying: ${strategy.name}`);
            const strategyStartTime = Date.now();
            
            let result;
            
            if (strategy.useQuickFunction && getQuickNanoResponse) {
                result = await getQuickNanoResponse(prompt, {
                    reasoning_effort: 'minimal',
                    verbosity: 'low',
                    max_completion_tokens: 600
                });
            } else if (strategy.config) {
                result = await executeWithTimeout(prompt, strategy.config, strategy.timeout);
            } else {
                continue;
            }
            
            const strategyResponseTime = Date.now() - strategyStartTime;
            console.log(`✅ Failover ${strategy.name} succeeded: ${strategyResponseTime}ms`);
            
            return {
                response: result,
                responseTime: originalResponseTime + strategyResponseTime,
                config: strategy.config || { model: SPEED_CONFIG.MODELS.NANO },
                optimizedForSpeed: true,
                isFailover: true,
                fallbackStrategy: strategy.name,
                gpt5Role: 'unknown',
                roleConfidence: 0,
                expectedRole: 'unknown',
                behaviorMatch: false
            };
            
        } catch (strategyError) {
            console.log(`❌ ${strategy.name} failed: ${strategyError.message}`);
            continue;
        }
    }
    
    throw new Error('All failover strategies exhausted');
}

// 🎯 QUICK RESPONSE FUNCTIONS with Enhanced Error Handling

async function ultraFastResponse(prompt) {
    try {
        console.log('⚡ Ultra-fast response...');
        const startTime = Date.now();
        
        const config = {
            model: SPEED_CONFIG.MODELS.NANO,
            reasoning_effort: 'minimal',
            verbosity: 'low',
            max_completion_tokens: 500
        };
        
        let result;
        if (getQuickNanoResponse) {
            result = await getQuickNanoResponse(prompt, config);
        } else if (getGPT5Analysis) {
            result = await executeWithTimeout(prompt, config, SPEED_CONFIG.TIMEOUTS.NANO);
        } else {
            throw new Error('No GPT-5 functions available');
        }
        
        return {
            response: result,
            responseTime: Date.now() - startTime,
            config,
            optimizedForSpeed: true,
            priority: 'ultra_fast',
            gpt5Role: 'OPERATOR',
            roleConfidence: 80
        };
        
    } catch (error) {
        console.error('❌ Ultra-fast response failed:', error.message);
        throw error;
    }
}

async function fastResponse(prompt) {
    try {
        console.log('🚀 Fast response...');
        const startTime = Date.now();
        
        const config = {
            model: SPEED_CONFIG.MODELS.NANO,
            reasoning_effort: 'minimal',
            verbosity: 'medium',
            max_completion_tokens: 800
        };
        
        let result;
        if (getQuickNanoResponse) {
            result = await getQuickNanoResponse(prompt, config);
        } else if (getGPT5Analysis) {
            result = await executeWithTimeout(prompt, config, SPEED_CONFIG.TIMEOUTS.NANO);
        } else {
            throw new Error('No GPT-5 functions available');
        }
        
        return {
            response: result,
            responseTime: Date.now() - startTime,
            config,
            optimizedForSpeed: true,
            priority: 'fast',
            gpt5Role: 'OPERATOR',
            roleConfidence: 75
        };
        
    } catch (error) {
        console.error('❌ Fast response failed:', error.message);
        throw error;
    }
}

async function balancedResponse(prompt) {
    try {
        console.log('⚖️ Balanced response...');
        const startTime = Date.now();
        
        const config = {
            model: SPEED_CONFIG.MODELS.MINI,
            reasoning_effort: 'low',
            verbosity: 'medium',
            max_completion_tokens: 1200
        };
        
        let result;
        if (getQuickMiniResponse) {
            result = await getQuickMiniResponse(prompt, config);
        } else if (getGPT5Analysis) {
            result = await executeWithTimeout(prompt, config, SPEED_CONFIG.TIMEOUTS.MINI);
        } else {
            throw new Error('No GPT-5 functions available');
        }
        
        return {
            response: result,
            responseTime: Date.now() - startTime,
            config,
            optimizedForSpeed: true,
            priority: 'balanced',
            gpt5Role: 'HYBRID',
            roleConfidence: 70
        };
        
    } catch (error) {
        console.error('❌ Balanced response failed:', error.message);
        throw error;
    }
}

// 🔧 COMPREHENSIVE TESTING FUNCTION
async function testGPT5Speed() {
    console.log('🚀 Testing GPT-5 Speed Optimization System...\n');
    
    if (!openaiClient || !getGPT5Analysis) {
        console.log('❌ OpenAI Client not available - cannot run tests');
        return { success: false, error: 'OpenAI Client not available' };
    }
    
    const testQueries = [
        { query: "Hello", expectedTime: "2-5s", expectedModel: "nano", expectedRole: "OPERATOR" },
        { query: "What time is it?", expectedTime: "2-5s", expectedModel: "nano", expectedRole: "OPERATOR" },
        { query: "Analyze investment portfolio strategy", expectedTime: "10-30s", expectedModel: "mini", expectedRole: "ADVISOR" },
        { query: "Draft investment memo for Cambodia fund", expectedTime: "30-60s", expectedModel: "mini", expectedRole: "OPERATOR" },
        { query: "Comprehensive risk analysis of real estate market", expectedTime: "60-120s", expectedModel: "mini", expectedRole: "ADVISOR" }
    ];
    
    let totalTests = 0;
    let successfulTests = 0;
    const results = [];
    
    for (const test of testQueries) {
        totalTests++;
        try {
            console.log(`\n📝 Testing: "${test.query}"`);
            console.log(`📊 Expected: ${test.expectedTime} | ${test.expectedModel} | ${test.expectedRole}`);
            
            const startTime = Date.now();
            const result = await executeSpeedOptimizedGPT5(test.query);
            const actualTime = Date.now() - startTime;
            const seconds = Math.round(actualTime / 1000);
            
            console.log(`✅ SUCCESS:`);
            console.log(`   Time: ${seconds}s (${actualTime}ms)`);
            console.log(`   Model: ${result.config.model}`);
            console.log(`   Role: ${result.gpt5Role} (${result.roleConfidence}%)`);
            console.log(`   Priority: ${result.priority}`);
            console.log(`   Response Length: ${result.response.length} chars`);
            
            results.push({
                query: test.query,
                success: true,
                actualTime,
                model: result.config.model,
                role: result.gpt5Role,
                priority: result.priority
            });
            
            successfulTests++;
            
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
            results.push({
                query: test.query,
                success: false,
                error: error.message
            });
        }
        
        console.log('---');
    }
    
    const successRate = Math.round((successfulTests / totalTests) * 100);
    
    console.log(`\n📊 TEST SUMMARY:`);
    console.log(`✅ Successful: ${successfulTests}/${totalTests} (${successRate}%)`);
    console.log(`🎯 Role Detection: ${gpt5RoleDetector ? 'Active' : 'Disabled'}`);
    
    if (successfulTests === totalTests) {
        console.log(`🎉 ALL TESTS PASSED - System working perfectly!`);
    } else if (successfulTests >= totalTests * 0.7) {
        console.log(`✅ MOSTLY WORKING - ${successfulTests}/${totalTests} passed`);
    } else {
        console.log(`⚠️ NEEDS ATTENTION - Only ${successfulTests}/${totalTests} passed`);
    }
    
    return {
        success: successfulTests >= totalTests * 0.7,
        totalTests,
        successfulTests,
        successRate,
        results
    };
}

// 🔍 SYSTEM HEALTH CHECK
async function checkSpeedOptimizationHealth() {
    try {
        if (!openaiClient) {
            return {
                healthy: false,
                error: 'OpenAI Client not loaded',
                recommendations: ['Check openaiClient.js configuration', 'Verify API key']
            };
        }
        
        // Test basic functionality
        const testResult = await ultraFastResponse("Health check test");
        
        return {
            healthy: true,
            openaiClientLoaded: true,
            roleDetectorLoaded: !!gpt5RoleDetector,
            functionsAvailable: {
                getGPT5Analysis: !!getGPT5Analysis,
                getQuickNanoResponse: !!getQuickNanoResponse,
                getQuickMiniResponse: !!getQuickMiniResponse
            },
            testResponse: {
                success: true,
                responseTime: testResult.responseTime,
                model: testResult.config.model
            }
        };
        
    } catch (error) {
        return {
            healthy: false,
            error: error.message,
            recommendations: ['Check API key', 'Verify model access', 'Check network connectivity']
        };
    }
}

// 📊 ROLE STATISTICS WRAPPER
function getRoleStats() {
    if (gpt5RoleDetector && gpt5RoleDetector.getRoleStats) {
        return gpt5RoleDetector.getRoleStats();
    } else {
        return {
            totalInteractions: 0,
            percentages: { advisor: 0, operator: 0, hybrid: 0 },
            message: 'Role detector not available'
        };
    }
}

// 📤 COMPREHENSIVE EXPORTS
module.exports = {
    // Core configuration
    SPEED_CONFIG,
    
    // Main functions
    analyzeQueryForSpeed,
    executeSpeedOptimizedGPT5,
    
    // Quick response functions
    ultraFastResponse,
    fastResponse,
    balancedResponse,
    
    // Document processing
    processDocumentRequest,
    fallbackDocumentCreation,
    
    // Failover and recovery
    executeFailoverStrategy,
    
    // Testing and diagnostics
    testGPT5Speed,
    checkSpeedOptimizationHealth,
    
    // Role detection integration
    checkGPT5Role: (query, response, config = {}) => {
        return detectRole(query, response, config) || {
            role: 'unknown',
            confidence: 0,
            expected: 'unknown',
            behaviorMatch: false
        };
    },
    getRoleStats,
    
    // Utility functions
    detectComplexDocument: (prompt) => {
        const config = analyzeQueryForSpeed(prompt);
        return config.isDocumentRequest;
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
    },
    
    // Status checks
    isAdvisorMode: (query, response, config) => {
        const result = detectRole(query, response, config);
        return result?.role === 'ADVISOR';
    },
    
    isOperatorMode: (query, response, config) => {
        const result = detectRole(query, response, config);
        return result?.role === 'OPERATOR';
    }
};

// 🚀 STARTUP LOGGING
console.log('🚀 GPT-5 Speed Optimization System Loaded');
console.log('📝 Document creation: Enhanced processing for memos, reports, analysis');
console.log('⚡ Speed optimization: Multi-tier routing with intelligent fallbacks');
console.log('🔧 Timeouts: 15s-240s based on complexity and document type');
console.log('🎯 Smart routing: Auto-detects queries for optimal model selection');
console.log('🛠️ Error handling: Comprehensive fallback and recovery systems');
console.log('🎯 Role detection: Advisor vs Operator behavior tracking integrated');

// Auto-run health check in development
if (process.env.NODE_ENV !== 'production') {
    setTimeout(async () => {
        try {
            const health = await module.exports.checkSpeedOptimizationHealth();
            if (health.healthy) {
                console.log('✅ Speed optimization system: Healthy');
                console.log(`🎯 Role detection: ${health.roleDetectorLoaded ? 'Active' : 'Disabled'}`);
            } else {
                console.log('⚠️ Speed optimization system: Issues detected');
                console.log(`🔧 Error: ${health.error}`);
            }
        } catch (error) {
            console.log('⚠️ Health check failed:', error.message);
        }
    }, 1000);
}
