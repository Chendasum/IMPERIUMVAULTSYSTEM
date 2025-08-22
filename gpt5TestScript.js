// GPT-5 AI System Test Script
// Run this to verify your GPT-5 AI system is working correctly

require("dotenv").config();

const {
    processAIQuery,
    initializeGPT5System,
    getSystemStatus,
    healthCheck,
    quickAI,
    smartAI,
    documentAI
} = require("./gpt5Controller");

/**
 * 🧪 COMPREHENSIVE GPT-5 AI SYSTEM TEST
 */
async function runGPT5Tests() {
    console.log('🚀 Starting GPT-5 AI System Tests...\n');
    
    const tests = {
        initialization: false,
        healthCheck: false,
        speedOptimization: false,
        memoryIntegration: false,
        roleDetection: false,
        documentCreation: false,
        complexAnalysis: false
    };
    
    let totalTests = Object.keys(tests).length;
    let passedTests = 0;
    
    try {
        // Test 1: System Initialization
        console.log('📋 Test 1: System Initialization...');
        try {
            const initResult = await initializeGPT5System();
            if (initResult.success) {
                tests.initialization = true;
                passedTests++;
                console.log('✅ PASS: System initialized successfully');
                console.log(`   GPT-5 Available: ${initResult.capabilities.available}`);
                console.log(`   System Health: ${initResult.health.overallHealth}`);
            } else {
                throw new Error('Initialization failed');
            }
        } catch (error) {
            console.log('❌ FAIL: System initialization failed -', error.message);
        }
        console.log('');
        
        // Test 2: Health Check
        console.log('📋 Test 2: Health Check...');
        try {
            const health = await healthCheck();
            if (health.healthy) {
                tests.healthCheck = true;
                passedTests++;
                console.log('✅ PASS: Health check successful');
                console.log(`   Response Time: ${health.responseTime}ms`);
                console.log(`   Active Model: ${health.model}`);
            } else {
                throw new Error(health.error);
            }
        } catch (error) {
            console.log('❌ FAIL: Health check failed -', error.message);
        }
        console.log('');
        
        // Test 3: Speed Optimization
        console.log('📋 Test 3: Speed Optimization...');
        try {
            const speedQueries = [
                { query: "Hello", expectedTime: 5000, expectedModel: "nano" },
                { query: "Quick market update", expectedTime: 8000, expectedModel: "nano" },
                { query: "urgent response needed now", expectedTime: 6000, expectedModel: "nano" }
            ];
            
            let speedTestsPassed = 0;
            
            for (const test of speedQueries) {
                const startTime = Date.now();
                const result = await quickAI(test.query);
                const responseTime = Date.now() - startTime;
                
                if (result.success && responseTime <= test.expectedTime * 1.5) { // Allow 50% tolerance
                    speedTestsPassed++;
                    console.log(`   ✅ "${test.query}" - ${responseTime}ms (${result.metadata.model})`);
                } else {
                    console.log(`   ❌ "${test.query}" - ${responseTime}ms (too slow or failed)`);
                }
            }
            
            if (speedTestsPassed >= speedQueries.length * 0.7) { // 70% pass rate
                tests.speedOptimization = true;
                passedTests++;
                console.log('✅ PASS: Speed optimization working');
            } else {
                console.log('❌ FAIL: Speed optimization needs improvement');
            }
        } catch (error) {
            console.log('❌ FAIL: Speed optimization test failed -', error.message);
        }
        console.log('');
        
        // Test 4: Memory Integration
        console.log('📋 Test 4: Memory Integration...');
        try {
            const testChatId = 'test_user_12345';
            
            // Set a memory
            const memorySetResult = await smartAI("My name is TestBot and I love AI systems", testChatId);
            
            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Test memory recall
            const memoryRecallResult = await smartAI("What is my name?", testChatId);
            
            if (memorySetResult.success && memoryRecallResult.success) {
                const hasMemory = memoryRecallResult.metadata.memoryUsed || 
                                memoryRecallResult.response.toLowerCase().includes('testbot');
                
                if (hasMemory) {
                    tests.memoryIntegration = true;
                    passedTests++;
                    console.log('✅ PASS: Memory integration working');
                    console.log(`   Memory Used: ${memoryRecallResult.metadata.memoryUsed}`);
                } else {
                    console.log('❌ FAIL: Memory not recalled properly');
                }
            } else {
                throw new Error('Memory test queries failed');
            }
        } catch (error) {
            console.log('❌ FAIL: Memory integration test failed -', error.message);
        }
        console.log('');
        
        // Test 5: Role Detection
        console.log('📋 Test 5: Role Detection...');
        try {
            const roleTests = [
                { query: "What do you think about this investment strategy?", expectedRole: "ADVISOR" },
                { query: "Create a memo for investors", expectedRole: "OPERATOR" },
                { query: "Analyze this deal and create a summary", expectedRole: "HYBRID" }
            ];
            
            let roleTestsPassed = 0;
            
            for (const test of roleTests) {
                const result = await processAIQuery(test.query);
                
                if (result.success && result.metadata.role) {
                    const roleMatch = result.metadata.role === test.expectedRole ||
                                    (test.expectedRole === "HYBRID" && result.metadata.role !== "UNKNOWN");
                    
                    if (roleMatch) {
                        roleTestsPassed++;
                        console.log(`   ✅ "${test.query.substring(0, 30)}..." → ${result.metadata.role}`);
                    } else {
                        console.log(`   ❌ "${test.query.substring(0, 30)}..." → ${result.metadata.role} (expected ${test.expectedRole})`);
                    }
                } else {
                    console.log(`   ❌ Role detection failed for query`);
                }
            }
            
            if (roleTestsPassed >= roleTests.length * 0.7) {
                tests.roleDetection = true;
                passedTests++;
                console.log('✅ PASS: Role detection working');
            } else {
                console.log('❌ FAIL: Role detection needs improvement');
            }
        } catch (error) {
            console.log('❌ FAIL: Role detection test failed -', error.message);
        }
        console.log('');
        
        // Test 6: Document Creation
        console.log('📋 Test 6: Document Creation...');
        try {
            const docResult = await documentAI("Create a simple investment memo template", 'test_user_doc');
            
            if (docResult.success) {
                const hasStructure = docResult.response.includes('MEMO') || 
                                  docResult.response.includes('Investment') ||
                                  docResult.response.includes('##') ||
                                  docResult.response.includes('**');
                
                const isLongEnough = docResult.response.length > 500;
                
                if (hasStructure && isLongEnough) {
                    tests.documentCreation = true;
                    passedTests++;
                    console.log('✅ PASS: Document creation working');
                    console.log(`   Document Length: ${docResult.response.length} chars`);
                    console.log(`   Model Used: ${docResult.metadata.model}`);
                    console.log(`   Role: ${docResult.metadata.role}`);
                } else {
                    console.log('❌ FAIL: Document lacks structure or too short');
                }
            } else {
                throw new Error('Document creation failed');
            }
        } catch (error) {
            console.log('❌ FAIL: Document creation test failed -', error.message);
        }
        console.log('');
        
        // Test 7: Complex Analysis
        console.log('📋 Test 7: Complex Analysis...');
        try {
            const complexQuery = "Analyze the investment strategy for Cambodia real estate market considering economic risks, political factors, and return potential";
            const complexResult = await processAIQuery(complexQuery);
            
            if (complexResult.success) {
                const isComprehensive = complexResult.response.length > 800;
                const hasAnalysis = complexResult.response.toLowerCase().includes('analysis') ||
                                  complexResult.response.toLowerCase().includes('risk') ||
                                  complexResult.response.toLowerCase().includes('cambodia');
                
                const usedAdvancedModel = complexResult.metadata.model.includes('gpt-5') &&
                                        !complexResult.metadata.model.includes('nano');
                
                if (isComprehensive && hasAnalysis && usedAdvancedModel) {
                    tests.complexAnalysis = true;
                    passedTests++;
                    console.log('✅ PASS: Complex analysis working');
                    console.log(`   Response Length: ${complexResult.response.length} chars`);
                    console.log(`   Model Used: ${complexResult.metadata.model}`);
                    console.log(`   Priority: ${complexResult.metadata.priority}`);
                } else {
                    console.log('❌ FAIL: Complex analysis insufficient');
                }
            } else {
                throw new Error('Complex analysis failed');
            }
        } catch (error) {
            console.log('❌ FAIL: Complex analysis test failed -', error.message);
        }
        console.log('');
        
        // Final Results
        console.log('🎯 TEST RESULTS SUMMARY');
        console.log('========================');
        console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
        console.log(`📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
        console.log('');
        
        // Individual test results
        Object.entries(tests).forEach(([testName, passed]) => {
            const status = passed ? '✅ PASS' : '❌ FAIL';
            const name = testName.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase());
            console.log(`${status}: ${name}`);
        });
        console.log('');
        
        // Overall assessment
        if (passedTests === totalTests) {
            console.log('🎉 EXCELLENT: All tests passed! Your GPT-5 AI system is fully operational.');
        } else if (passedTests >= totalTests * 0.8) {
            console.log('✅ GOOD: Most tests passed. System is working well with minor issues.');
        } else if (passedTests >= totalTests * 0.6) {
            console.log('⚠️ FAIR: Some tests passed. System has functionality but needs improvement.');
        } else {
            console.log('❌ POOR: Few tests passed. System needs significant attention.');
        }
        
        // Get system status
        console.log('\n📊 CURRENT SYSTEM STATUS');
        console.log('=========================');
        try {
            const status = await getSystemStatus();
            console.log(`GPT-5 Available: ${status.systemHealth.gpt5Available}`);
            console.log(`Total Requests: ${status.performance.totalRequests}`);
            console.log(`Success Rate: ${Math.round((status.performance.successfulRequests / Math.max(1, status.performance.totalRequests)) * 100)}%`);
            console.log(`Avg Response Time: ${status.performance.averageResponseTime}ms`);
            
            if (Object.keys(status.performance.modelUsage).length > 0) {
                console.log('\nModel Usage:');
                Object.entries(status.performance.modelUsage).forEach(([model, count]) => {
                    console.log(`  ${model}: ${count} requests`);
                });
            }
            
            if (status.recommendations.length > 0) {
                console.log('\nRecommendations:');
                status.recommendations.forEach(rec => {
                    console.log(`  [${rec.type}] ${rec.message}`);
                });
            }
            
        } catch (statusError) {
            console.log('⚠️ Could not retrieve system status:', statusError.message);
        }
        
        console.log('\n🚀 GPT-5 AI SYSTEM TEST COMPLETE!');
        console.log('==================================');
        
        return {
            success: passedTests >= totalTests * 0.7, // 70% pass rate required
            totalTests,
            passedTests,
            successRate: Math.round((passedTests / totalTests) * 100),
            testResults: tests,
            recommendation: passedTests === totalTests ? 
                'System is production-ready!' :
                passedTests >= totalTests * 0.8 ?
                'System is mostly ready with minor issues to address.' :
                'System needs improvement before production use.'
        };
        
    } catch (error) {
        console.error('❌ CRITICAL ERROR during testing:', error.message);
        return {
            success: false,
            error: error.message,
            recommendation: 'Fix critical errors before proceeding.'
        };
    }
}

/**
 * 🔧 QUICK DIAGNOSTIC TEST
 * Fast test for basic functionality
 */
async function quickDiagnostic() {
    console.log('⚡ Running Quick GPT-5 Diagnostic...\n');
    
    try {
        // Test basic query
        const startTime = Date.now();
        const result = await processAIQuery("Hello, test the GPT-5 system");
        const responseTime = Date.now() - startTime;
        
        if (result.success) {
            console.log('✅ DIAGNOSTIC PASSED');
            console.log(`   Response Time: ${responseTime}ms`);
            console.log(`   Model: ${result.metadata.model}`);
            console.log(`   Role: ${result.metadata.role}`);
            console.log(`   Priority: ${result.metadata.priority}`);
            console.log(`   Response Length: ${result.response.length} chars`);
            console.log('\n🎯 GPT-5 AI system is responding correctly!');
            
            return { success: true, responseTime, model: result.metadata.model };
        } else {
            throw new Error(result.error || 'Query failed');
        }
        
    } catch (error) {
        console.log('❌ DIAGNOSTIC FAILED');
        console.log(`   Error: ${error.message}`);
        console.log('\n⚠️ GPT-5 AI system needs attention!');
        
        return { success: false, error: error.message };
    }
}

/**
 * 📊 PERFORMANCE BENCHMARK TEST
 * Test response times across different model types
 */
async function performanceBenchmark() {
    console.log('📊 Running GPT-5 Performance Benchmark...\n');
    
    const benchmarkTests = [
        { name: "Ultra-Fast Query", query: "Hello", expectedTime: 5000 },
        { name: "Quick Analysis", query: "Quick market status", expectedTime: 8000 },
        { name: "Medium Analysis", query: "Analyze investment portfolio strategy", expectedTime: 15000 },
        { name: "Document Creation", query: "Create investment memo template", expectedTime: 25000 },
        { name: "Complex Analysis", query: "Comprehensive risk analysis of Cambodia real estate market with political and economic factors", expectedTime: 40000 }
    ];
    
    const results = [];
    
    for (const test of benchmarkTests) {
        try {
            console.log(`🏃 Testing: ${test.name}...`);
            const startTime = Date.now();
            const result = await processAIQuery(test.query);
            const responseTime = Date.now() - startTime;
            
            const status = responseTime <= test.expectedTime ? '✅ PASS' : '⚠️ SLOW';
            const efficiency = Math.round((test.expectedTime / responseTime) * 100);
            
            console.log(`   ${status}: ${responseTime}ms (${result.metadata.model}) - ${efficiency}% efficiency`);
            
            results.push({
                name: test.name,
                responseTime,
                expectedTime: test.expectedTime,
                model: result.metadata.model,
                success: result.success,
                efficient: responseTime <= test.expectedTime,
                efficiency
            });
            
        } catch (error) {
            console.log(`   ❌ FAIL: ${error.message}`);
            results.push({
                name: test.name,
                error: error.message,
                success: false,
                efficient: false
            });
        }
    }
    
    // Calculate overall performance
    const successfulTests = results.filter(r => r.success);
    const efficientTests = results.filter(r => r.efficient);
    const avgResponseTime = successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length;
    const avgEfficiency = successfulTests.reduce((sum, r) => sum + r.efficiency, 0) / successfulTests.length;
    
    console.log('\n📊 BENCHMARK RESULTS');
    console.log('=====================');
    console.log(`Successful Tests: ${successfulTests.length}/${results.length}`);
    console.log(`Efficient Tests: ${efficientTests.length}/${results.length}`);
    console.log(`Average Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`Average Efficiency: ${Math.round(avgEfficiency)}%`);
    
    const overallGrade = avgEfficiency >= 90 ? 'A+' :
                        avgEfficiency >= 80 ? 'A' :
                        avgEfficiency >= 70 ? 'B+' :
                        avgEfficiency >= 60 ? 'B' : 'C';
    
    console.log(`Overall Performance Grade: ${overallGrade}`);
    
    return {
        results,
        summary: {
            successfulTests: successfulTests.length,
            totalTests: results.length,
            efficientTests: efficientTests.length,
            avgResponseTime: Math.round(avgResponseTime),
            avgEfficiency: Math.round(avgEfficiency),
            grade: overallGrade
        }
    };
}

/**
 * 🎯 ROLE DETECTION ACCURACY TEST
 * Test the accuracy of role detection across different query types
 */
async function roleDetectionTest() {
    console.log('🎯 Testing GPT-5 Role Detection Accuracy...\n');
    
    const roleTests = [
        // Should be ADVISOR
        { query: "What do you think about this investment strategy?", expected: "ADVISOR" },
        { query: "Analyze the risks of Cambodia market", expected: "ADVISOR" },
        { query: "Should I invest in this opportunity?", expected: "ADVISOR" },
        { query: "Evaluate the political risks", expected: "ADVISOR" },
        { query: "What's your opinion on market conditions?", expected: "ADVISOR" },
        
        // Should be OPERATOR  
        { query: "Create a memo for investors", expected: "OPERATOR" },
        { query: "Calculate the IRR for this deal", expected: "OPERATOR" },
        { query: "Generate a due diligence checklist", expected: "OPERATOR" },
        { query: "Draft investment summary", expected: "OPERATOR" },
        { query: "Write a quick market update", expected: "OPERATOR" },
        
        // Should be HYBRID
        { query: "Analyze this deal and create a summary", expected: "HYBRID" },
        { query: "Review the portfolio and generate report", expected: "HYBRID" },
        { query: "Assess the investment and draft recommendation", expected: "HYBRID" }
    ];
    
    let correctPredictions = 0;
    const results = [];
    
    for (const test of roleTests) {
        try {
            const result = await processAIQuery(test.query);
            
            if (result.success) {
                const predicted = result.metadata.role;
                const correct = predicted === test.expected;
                const confidence = result.metadata.roleConfidence || 0;
                
                if (correct) correctPredictions++;
                
                const status = correct ? '✅' : '❌';
                console.log(`${status} "${test.query.substring(0, 40)}..." → ${predicted} (${confidence}%)`);
                
                results.push({
                    query: test.query,
                    expected: test.expected,
                    predicted,
                    confidence,
                    correct
                });
            }
            
        } catch (error) {
            console.log(`❌ Error testing: ${error.message}`);
            results.push({
                query: test.query,
                expected: test.expected,
                error: error.message,
                correct: false
            });
        }
    }
    
    const accuracy = Math.round((correctPredictions / roleTests.length) * 100);
    
    console.log('\n🎯 ROLE DETECTION RESULTS');
    console.log('==========================');
    console.log(`Correct Predictions: ${correctPredictions}/${roleTests.length}`);
    console.log(`Accuracy: ${accuracy}%`);
    
    // Calculate accuracy by role type
    const advisorTests = results.filter(r => r.expected === 'ADVISOR');
    const operatorTests = results.filter(r => r.expected === 'OPERATOR');
    const hybridTests = results.filter(r => r.expected === 'HYBRID');
    
    const advisorAccuracy = Math.round((advisorTests.filter(r => r.correct).length / advisorTests.length) * 100);
    const operatorAccuracy = Math.round((operatorTests.filter(r => r.correct).length / operatorTests.length) * 100);
    const hybridAccuracy = Math.round((hybridTests.filter(r => r.correct).length / hybridTests.length) * 100);
    
    console.log(`ADVISOR Accuracy: ${advisorAccuracy}%`);
    console.log(`OPERATOR Accuracy: ${operatorAccuracy}%`);
    console.log(`HYBRID Accuracy: ${hybridAccuracy}%`);
    
    const gradeThreshold = accuracy >= 85 ? '🎯 EXCELLENT' :
                          accuracy >= 70 ? '✅ GOOD' :
                          accuracy >= 55 ? '⚠️ FAIR' : '❌ POOR';
    
    console.log(`Role Detection Grade: ${gradeThreshold}`);
    
    return {
        totalTests: roleTests.length,
        correctPredictions,
        accuracy,
        byRole: {
            advisor: advisorAccuracy,
            operator: operatorAccuracy,
            hybrid: hybridAccuracy
        },
        results
    };
}

/**
 * 🎮 INTERACTIVE TEST MODE
 * Allow manual testing with live queries
 */
async function interactiveTest() {
    console.log('🎮 GPT-5 Interactive Test Mode');
    console.log('==============================');
    console.log('Type your queries to test the GPT-5 AI system.');
    console.log('Commands: "exit" to quit, "status" for system info, "benchmark" for performance test');
    console.log('');
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const askQuestion = () => {
        rl.question('🤖 Enter your query: ', async (query) => {
            if (query.toLowerCase() === 'exit') {
                console.log('👋 Exiting interactive test mode...');
                rl.close();
                return;
            }
            
            if (query.toLowerCase() === 'status') {
                try {
                    const status = await getSystemStatus();
                    console.log('\n📊 System Status:');
                    console.log(`GPT-5 Available: ${status.systemHealth.gpt5Available}`);
                    console.log(`Total Requests: ${status.performance.totalRequests}`);
                    console.log(`Success Rate: ${Math.round((status.performance.successfulRequests / Math.max(1, status.performance.totalRequests)) * 100)}%`);
                    console.log('');
                } catch (error) {
                    console.log('❌ Status error:', error.message);
                }
                askQuestion();
                return;
            }
            
            if (query.toLowerCase() === 'benchmark') {
                await performanceBenchmark();
                askQuestion();
                return;
            }
            
            if (!query.trim()) {
                console.log('⚠️ Please enter a valid query.\n');
                askQuestion();
                return;
            }
            
            try {
                console.log('🚀 Processing...');
                const startTime = Date.now();
                const result = await processAIQuery(query);
                const responseTime = Date.now() - startTime;
                
                if (result.success) {
                    console.log('\n✅ Response received:');
                    console.log(`📊 Metadata: ${result.metadata.model} | ${result.metadata.role} | ${responseTime}ms`);
                    console.log(`📝 Response: ${result.response.substring(0, 500)}${result.response.length > 500 ? '...' : ''}`);
                } else {
                    console.log('\n❌ Query failed:', result.error);
                }
                
            } catch (error) {
                console.log('\n❌ Error:', error.message);
            }
            
            console.log('');
            askQuestion();
        });
    };
    
    askQuestion();
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const testType = args[0] || 'full';
    
    console.log(`🚀 GPT-5 AI System Testing - Mode: ${testType.toUpperCase()}\n`);
    
    try {
        switch (testType.toLowerCase()) {
            case 'quick':
            case 'diagnostic':
                await quickDiagnostic();
                break;
                
            case 'benchmark':
            case 'performance':
                await performanceBenchmark();
                break;
                
            case 'role':
            case 'roles':
                await roleDetectionTest();
                break;
                
            case 'interactive':
            case 'manual':
                await interactiveTest();
                break;
                
            case 'full':
            case 'complete':
            default:
                const testResult = await runGPT5Tests();
                
                if (testResult.success) {
                    console.log('\n🎉 OVERALL RESULT: GPT-5 AI System is ready for production!');
                } else {
                    console.log('\n⚠️ OVERALL RESULT: GPT-5 AI System needs improvements before production.');
                }
                
                if (testResult.recommendation) {
                    console.log(`💡 RECOMMENDATION: ${testResult.recommendation}`);
                }
                break;
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

// Export for programmatic use
module.exports = {
    runGPT5Tests,
    quickDiagnostic,
    performanceBenchmark,
    roleDetectionTest,
    interactiveTest
};

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Critical error:', error.message);
        process.exit(1);
    });
}
