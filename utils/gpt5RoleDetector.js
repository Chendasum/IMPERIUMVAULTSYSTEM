// utils/gpt5RoleDetector.js - COMPLETE OPTIMIZED Role Detection for Cambodia Fund
// Enhanced GPT-5 role detection with improved accuracy and fund-specific patterns

/**
 * 🎯 OPTIMIZED GPT-5 ROLE DETECTION SYSTEM
 * 
 * Determines if GPT-5 is functioning as:
 * - ADVISOR: Strategic analysis, recommendations, insights, market analysis
 * - OPERATOR: Task execution, document creation, calculations, implementation
 * - HYBRID: Mixed advisory and operational functions
 * 
 * OPTIMIZED FOR: Cambodia private lending fund operations
 */

// 🎯 ENHANCED ROLE DETECTION PATTERNS (Optimized for Fund Operations)
const ROLE_PATTERNS = {
    ADVISOR: {
        queryPatterns: [
            /what do you think|your opinion|recommend|suggest|advise/i,
            /analyze|assess|evaluate|review|consider|examine/i,
            /strategy|approach|framework|methodology|best practice/i,
            /pros and cons|advantages|disadvantages|trade-offs/i,
            /risk|opportunity|scenario|outlook|forecast/i,
            /should I|what if|how might|potential|implications/i,
            /market analysis|investment thesis|due diligence analysis/i,
            /compare|versus|alternative|option|choice/i,
            /insight|perspective|view|thoughts on/i,
            /economic|political|regulatory environment/i
        ],
        responsePatterns: [
            /I recommend|I suggest|I would advise|consider|my recommendation/i,
            /analysis shows|data indicates|trends suggest|evidence points/i,
            /risk factors|key considerations|important to note/i,
            /strategic implications|market dynamics|economic factors/i,
            /scenario analysis|potential outcomes|likely scenarios/i,
            /my assessment|my analysis|based on my evaluation/i,
            /factors to consider|things to keep in mind/i,
            /from a strategic perspective|strategically speaking/i,
            /pros include|cons include|advantages are|disadvantages are/i,
            /market conditions suggest|economic indicators show/i
        ],
        keywords: [
            'recommend', 'suggest', 'advise', 'consider', 'analyze', 'assess',
            'strategy', 'risk', 'opportunity', 'assessment', 'outlook', 'forecast',
            'implications', 'factors', 'considerations', 'insights', 'perspective',
            'evaluation', 'recommendation', 'analysis', 'strategic', 'framework',
            'methodology', 'approach', 'alternative', 'scenario', 'potential',
            'economic', 'political', 'regulatory', 'market', 'trends'
        ]
    },
    
    OPERATOR: {
        queryPatterns: [
            /create|generate|write|draft|build|make|produce|prepare/i,
            /calculate|compute|process|execute|run|perform/i,
            /format|convert|transform|organize|structure/i,
            /schedule|book|reserve|order|send|deliver/i,
            /list|summarize|extract|compile|gather|collect/i,
            /memo|document|report|email|letter|proposal/i,
            /template|checklist|outline|framework|guide/i,
            /help me with|show me how|walk me through/i,
            /update|track|monitor|record|log/i,
            /quick|fast|urgent|now|asap|immediate/i
        ],
        responsePatterns: [
            /here is|here's|I've created|I've generated|I've prepared/i,
            /completed|finished|processed|calculated|executed/i,
            /draft|document|memo|summary|list|template/i,
            /step 1|step 2|action items|next steps|to do/i,
            /total|result|output|deliverable|final/i,
            /formatted|organized|structured|arranged/i,
            /created|built|developed|designed|constructed/i,
            /here's your|here's the|below is|attached is/i,
            /updated|tracked|recorded|logged|monitored/i,
            /\$[\d,]+|\d+%|\d+\.\d+%/i
        ],
        keywords: [
            'created', 'generated', 'completed', 'calculated', 'processed',
            'draft', 'document', 'memo', 'summary', 'list', 'total', 'result',
            'output', 'executed', 'formatted', 'organized', 'template',
            'checklist', 'outline', 'deliverable', 'final', 'prepared',
            'updated', 'tracked', 'monitored', 'recorded', 'logged'
        ]
    }
};

// 🔧 OPTIMIZED DETECTION RULES for Cambodia Fund
const DETECTION_RULES = {
    CAMBODIA_FUND: {
        advisor: [
            /cambodia.*market.*analysis/i,
            /risk.*assessment.*cambodia/i,
            /investment.*outlook.*cambodia/i,
            /due.*diligence.*considerations/i,
            /economic.*environment.*cambodia/i,
            /political.*risk.*cambodia/i,
            /regulatory.*changes.*cambodia/i,
            /market.*opportunity.*cambodia/i
        ],
        operator: [
            /draft.*cambodia.*memo/i,
            /create.*lp.*criteria/i,
            /investment.*summary.*cambodia/i,
            /cambodia.*fund.*document/i,
            /generate.*dd.*checklist/i,
            /calculate.*irr.*cambodia/i,
            /prepare.*investor.*presentation/i,
            /format.*deal.*summary/i
        ]
    },
    
    FINANCIAL: {
        advisor: [
            /portfolio.*allocation.*strategy/i,
            /market.*regime.*analysis/i,
            /risk.*management.*approach/i,
            /investment.*thesis.*evaluation/i,
            /economic.*scenario.*analysis/i,
            /market.*timing.*considerations/i
        ],
        operator: [
            /calculate.*irr|npv|roi/i,
            /financial.*model|spreadsheet/i,
            /investment.*memo|summary/i,
            /portfolio.*report|statement/i,
            /generate.*payment.*schedule/i,
            /create.*financial.*projection/i
        ]
    },
    
    SPEED_INDICATORS: {
        ultra_speed: 'OPERATOR',
        speed: 'OPERATOR',
        balanced: 'HYBRID',
        complex: 'ADVISOR',
        very_complex: 'ADVISOR',
        document_creation: 'OPERATOR',
        simple_document: 'OPERATOR'
    },
    
    MODEL_EXPECTATIONS: {
        'gpt-5-nano': 'OPERATOR',
        'gpt-5-mini': 'HYBRID',
        'gpt-5': 'ADVISOR',
        'gpt-5-chat': 'HYBRID'
    }
};

// 📊 GLOBAL STATISTICS TRACKING
if (!global.gpt5RoleStats) {
    global.gpt5RoleStats = {
        interactions: [],
        summary: {
            totalInteractions: 0,
            advisorCount: 0,
            operatorCount: 0,
            hybridCount: 0,
            accuratePredictions: 0,
            consistentBehavior: 0
        },
        dailyStats: {},
        modelStats: {},
        cambodiaFundStats: {
            dealAnalysis: 0,
            lpManagement: 0,
            portfolioTracking: 0,
            marketIntelligence: 0
        }
    };
}

/**
 * 🔍 OPTIMIZED: Predict GPT-5 role with enhanced Cambodia fund awareness
 */
function predictGPT5Role(query) {
    const queryLower = query.toLowerCase().trim();
    const words = queryLower.split(/\s+/);
    
    let advisorScore = 0;
    let operatorScore = 0;
    let confidence = 50;
    
    ROLE_PATTERNS.ADVISOR.queryPatterns.forEach(pattern => {
        if (pattern.test(queryLower)) advisorScore += 4;
    });
    
    ROLE_PATTERNS.OPERATOR.queryPatterns.forEach(pattern => {
        if (pattern.test(queryLower)) operatorScore += 4;
    });
    
    ROLE_PATTERNS.ADVISOR.keywords.forEach(keyword => {
        const occurrences = (queryLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        advisorScore += occurrences * 1.5;
    });
    
    ROLE_PATTERNS.OPERATOR.keywords.forEach(keyword => {
        const occurrences = (queryLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        operatorScore += occurrences * 1.5;
    });
    
    checkSpecializedPatterns(queryLower, (type, role) => {
        if (role === 'advisor') advisorScore += 3;
        else if (role === 'operator') operatorScore += 3;
    });
    
    let predictedRole = 'HYBRID';
    
    if (advisorScore > operatorScore + 1.5) {
        predictedRole = 'ADVISOR';
        confidence = Math.min(95, 65 + (advisorScore - operatorScore) * 5);
    } else if (operatorScore > advisorScore + 1.5) {
        predictedRole = 'OPERATOR';
        confidence = Math.min(95, 65 + (operatorScore - advisorScore) * 5);
    } else {
        confidence = 45 + Math.abs(advisorScore - operatorScore) * 4;
    }
    
    return {
        predictedRole,
        confidence: Math.round(confidence),
        scores: { advisor: advisorScore, operator: operatorScore },
        wordCount: words.length,
        reasoning: `Query analysis: ${advisorScore.toFixed(1)} advisor signals, ${operatorScore.toFixed(1)} operator signals`
    };
}

/**
 * 🎯 OPTIMIZED: Detect actual GPT-5 role with enhanced pattern recognition
 */
function detectActualGPT5Role(response, queryAnalysis = null) {
    const responseLower = response.toLowerCase();
    const responseLength = response.length;
    
    let advisorScore = 0;
    let operatorScore = 0;
    
    ROLE_PATTERNS.ADVISOR.responsePatterns.forEach(pattern => {
        if (pattern.test(responseLower)) advisorScore += 5;
    });
    
    ROLE_PATTERNS.OPERATOR.responsePatterns.forEach(pattern => {
        if (pattern.test(responseLower)) operatorScore += 5;
    });
    
    ROLE_PATTERNS.ADVISOR.keywords.forEach(keyword => {
        const occurrences = (responseLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        advisorScore += occurrences * 1.2;
    });
    
    ROLE_PATTERNS.OPERATOR.keywords.forEach(keyword => {
        const occurrences = (responseLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        operatorScore += occurrences * 1.2;
    });
    
    const structuralAnalysis = analyzeResponseStructure(response);
    
    if (structuralAnalysis.hasStructuredOutput) operatorScore += 4;
    if (structuralAnalysis.hasAnalyticalLanguage) advisorScore += 4;
    if (structuralAnalysis.hasDeliverables) operatorScore += 3;
    if (structuralAnalysis.hasRecommendations) advisorScore += 3;
    if (structuralAnalysis.hasNumbers) operatorScore += 2;
    if (structuralAnalysis.hasSections) operatorScore += 2;
    
    if (responseLength > 2000) advisorScore += 1.5;
    if (responseLength < 500) operatorScore += 2;
    if (responseLength > 5000) advisorScore += 2;
    
    let actualRole = 'HYBRID';
    let confidence = 50;
    
    if (advisorScore > operatorScore + 2) {
        actualRole = 'ADVISOR';
        confidence = Math.min(98, 75 + (advisorScore - operatorScore) * 3);
    } else if (operatorScore > advisorScore + 2) {
        actualRole = 'OPERATOR';
        confidence = Math.min(98, 75 + (operatorScore - advisorScore) * 3);
    } else {
        confidence = 50 + Math.abs(advisorScore - operatorScore) * 4;
    }
    
    return {
        actualRole,
        confidence: Math.round(confidence),
        scores: { advisor: advisorScore, operator: operatorScore },
        structural: structuralAnalysis,
        reasoning: `Response analysis: ${advisorScore.toFixed(1)} advisor signals, ${operatorScore.toFixed(1)} operator signals`
    };
}

/**
 * 🔬 ENHANCED: Analyze response structure for role indicators
 */
function analyzeResponseStructure(response) {
    return {
        hasStructuredOutput: /^\s*[-*•]|\d+\.|#{1,6}\s|\|\s*[-:]+\s*\|/.test(response),
        hasAnalyticalLanguage: /however|therefore|consequently|furthermore|moreover|additionally|specifically|particularly|notably|significantly/i.test(response),
        hasDeliverables: /document|memo|draft|summary|checklist|template|report|analysis|outline|presentation|proposal/i.test(response),
        hasRecommendations: /recommend|suggest|advise|should|consider|might want to|propose|urge/i.test(response),
        hasNumbers: /\$[\d,]+|\d+%|\d+\.\d+%|\d+\.\d+|\d+x|ratio|rate|percentage|irr|roi|ltv/i.test(response),
        hasQuestions: /\?/.test(response),
        hasSections: /#{1,6}|section|part \d+|step \d+|\*\*.*?\*\*:/i.test(response),
        hasActionItems: /action item|next step|to do|follow up|implement|execute/i.test(response),
        hasCalculations: /calculate|computation|total|sum|average|mean|median/i.test(response),
        responseLength: response.length,
        paragraphCount: (response.match(/\n\s*\n/g) || []).length + 1,
        sentenceCount: (response.match(/[.!?]+/g) || []).length
    };
}

/**
 * 🎯 ENHANCED: Check specialized patterns for Cambodia fund operations
 */
function checkSpecializedPatterns(queryLower, callback) {
    DETECTION_RULES.CAMBODIA_FUND.advisor.forEach(pattern => {
        if (pattern.test(queryLower)) callback('cambodia', 'advisor');
    });
    
    DETECTION_RULES.CAMBODIA_FUND.operator.forEach(pattern => {
        if (pattern.test(queryLower)) callback('cambodia', 'operator');
    });
    
    DETECTION_RULES.FINANCIAL.advisor.forEach(pattern => {
        if (pattern.test(queryLower)) callback('financial', 'advisor');
    });
    
    DETECTION_RULES.FINANCIAL.operator.forEach(pattern => {
        if (pattern.test(queryLower)) callback('financial', 'operator');
    });
}

/**
 * 🎯 OPTIMIZED: Determine expected behavior with enhanced logic
 */
function determineExpectedBehavior(query, config) {
    const queryLower = query.toLowerCase();
    
    if (config.priority && DETECTION_RULES.SPEED_INDICATORS[config.priority]) {
        return {
            expectedRole: DETECTION_RULES.SPEED_INDICATORS[config.priority],
            reason: `Speed priority ${config.priority} suggests ${DETECTION_RULES.SPEED_INDICATORS[config.priority]} role`
        };
    }
    
    if (config.model && DETECTION_RULES.MODEL_EXPECTATIONS[config.model]) {
        return {
            expectedRole: DETECTION_RULES.MODEL_EXPECTATIONS[config.model],
            reason: `Model ${config.model} typically performs ${DETECTION_RULES.MODEL_EXPECTATIONS[config.model]} tasks`
        };
    }
    
    if (/create|draft|write|generate|compose|prepare/.test(queryLower) && 
        /memo|document|report|analysis|plan|strategy|outline|checklist|template|summary|presentation|proposal/.test(queryLower)) {
        return {
            expectedRole: 'OPERATOR',
            reason: 'Document creation request'
        };
    }
    
    if (/analyze|assess|evaluate|review|opinion|recommend|think about|consider|examine|study/.test(queryLower)) {
        return {
            expectedRole: 'ADVISOR',
            reason: 'Analysis or assessment request'
        };
    }
    
    if (/calculate|compute|process|track|monitor|update|record/.test(queryLower)) {
        return {
            expectedRole: 'OPERATOR',
            reason: 'Calculation or processing request'
        };
    }
    
    if (config.reasoning_effort === 'high' || config.reasoning_effort === 'medium') {
        return {
            expectedRole: 'ADVISOR',
            reason: 'High reasoning effort suggests advisory role'
        };
    }
    
    if (config.reasoning_effort === 'minimal' || config.verbosity === 'low') {
        return {
            expectedRole: 'OPERATOR',
            reason: 'Minimal reasoning suggests operational task'
        };
    }
    
    return {
        expectedRole: 'HYBRID',
        reason: 'Mixed or unclear intent'
    };
}

/**
 * 🔬 OPTIMIZED: Complete role analysis with enhanced accuracy
 */
function analyzeGPT5Role(query, response, config = {}) {
    const prediction = predictGPT5Role(query);
    const detection = detectActualGPT5Role(response, prediction);
    const expectedBehavior = determineExpectedBehavior(query, config);
    
    const predictionAccurate = prediction.predictedRole === detection.actualRole;
    const roleConsistency = predictionAccurate ? 'CONSISTENT' : 'INCONSISTENT';
    
    const behaviorMatch = expectedBehavior.expectedRole === detection.actualRole ||
                         (expectedBehavior.expectedRole === 'HYBRID' && detection.actualRole !== 'HYBRID') ||
                         (detection.actualRole === 'HYBRID' && expectedBehavior.expectedRole !== 'HYBRID');
    
    const overallConfidence = Math.round(
        (prediction.confidence * 0.4 + detection.confidence * 0.6)
    );
    
    if (query.toLowerCase().includes('cambodia') || 
        query.toLowerCase().includes('fund') ||
        query.toLowerCase().includes('lp') ||
        query.toLowerCase().includes('deal')) {
        
        const fundStats = global.gpt5RoleStats.cambodiaFundStats;
        if (query.toLowerCase().includes('deal') || query.toLowerCase().includes('analyze')) fundStats.dealAnalysis++;
        if (query.toLowerCase().includes('lp') || query.toLowerCase().includes('investor')) fundStats.lpManagement++;
        if (query.toLowerCase().includes('portfolio') || query.toLowerCase().includes('track')) fundStats.portfolioTracking++;
        if (query.toLowerCase().includes('market') || query.toLowerCase().includes('intelligence')) fundStats.marketIntelligence++;
    }
    
    return {
        query: {
            text: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
            wordCount: prediction.wordCount,
            prediction: prediction
        },
        response: {
            length: response.length,
            detection: detection
        },
        analysis: {
            finalRole: detection.actualRole,
            confidence: overallConfidence,
            predictionAccurate,
            roleConsistency,
            behaviorMatch,
            expectedRole: expectedBehavior.expectedRole,
            reason: expectedBehavior.reason
        },
        config: {
            model: config.model || 'unknown',
            reasoning_effort: config.reasoning_effort || 'unknown',
            verbosity: config.verbosity || 'unknown',
            priority: config.priority || 'unknown',
            complexityScore: config.complexityScore || 0
        },
        metadata: {
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        }
    };
}

/**
 * 📊 ENHANCED: Track role statistics with Cambodia fund insights
 */
function trackGPT5RoleStats() {
    return {
        addInteraction: (roleAnalysis) => {
            const stats = global.gpt5RoleStats;
            const today = roleAnalysis.metadata.date;
            
            stats.interactions.push(roleAnalysis);
            stats.summary.totalInteractions++;
            
            switch (roleAnalysis.analysis.finalRole) {
                case 'ADVISOR':
                    stats.summary.advisorCount++;
                    break;
                case 'OPERATOR':
                    stats.summary.operatorCount++;
                    break;
                case 'HYBRID':
                    stats.summary.hybridCount++;
                    break;
            }
            
            if (roleAnalysis.analysis.predictionAccurate) {
                stats.summary.accuratePredictions++;
            }
            
            if (roleAnalysis.analysis.behaviorMatch) {
                stats.summary.consistentBehavior++;
            }
            
            if (!stats.dailyStats[today]) {
                stats.dailyStats[today] = { advisor: 0, operator: 0, hybrid: 0, total: 0 };
            }
            stats.dailyStats[today][roleAnalysis.analysis.finalRole.toLowerCase()]++;
            stats.dailyStats[today].total++;
            
            const model = roleAnalysis.config.model;
            if (!stats.modelStats[model]) {
                stats.modelStats[model] = { advisor: 0, operator: 0, hybrid: 0, total: 0 };
            }
            stats.modelStats[model][roleAnalysis.analysis.finalRole.toLowerCase()]++;
            stats.modelStats[model].total++;
            
            if (stats.interactions.length > 1000) {
                stats.interactions = stats.interactions.slice(-1000);
            }
            
            const dates = Object.keys(stats.dailyStats).sort();
            if (dates.length > 30) {
                dates.slice(0, -30).forEach(date => delete stats.dailyStats[date]);
            }
        },
        
        getStats: () => {
            const stats = global.gpt5RoleStats.summary;
            const total = stats.totalInteractions;
            
            return {
                ...stats,
                percentages: {
                    advisor: total > 0 ? Math.round((stats.advisorCount / total) * 100) : 0,
                    operator: total > 0 ? Math.round((stats.operatorCount / total) * 100) : 0,
                    hybrid: total > 0 ? Math.round((stats.hybridCount / total) * 100) : 0,
                    predictionAccuracy: total > 0 ? Math.round((stats.accuratePredictions / total) * 100) : 0,
                    behaviorConsistency: total > 0 ? Math.round((stats.consistentBehavior / total) * 100) : 0
                },
                recentInteractions: global.gpt5RoleStats.interactions.slice(-10),
                dailyStats: global.gpt5RoleStats.dailyStats,
                modelStats: global.gpt5RoleStats.modelStats,
                cambodiaFundStats: global.gpt5RoleStats.cambodiaFundStats
            };
        },
        
        reset: () => {
            global.gpt5RoleStats = {
                interactions: [],
                summary: {
                    totalInteractions: 0,
                    advisorCount: 0,
                    operatorCount: 0,
                    hybridCount: 0,
                    accuratePredictions: 0,
                    consistentBehavior: 0
                },
                dailyStats: {},
                modelStats: {},
                cambodiaFundStats: {
                    dealAnalysis: 0,
                    lpManagement: 0,
                    portfolioTracking: 0,
                    marketIntelligence: 0
                }
            };
        }
    };
}

/**
 * 🚀 OPTIMIZED: Main wrapper function with enhanced accuracy
 */
function checkGPT5Role(query, response, config = {}) {
    const roleAnalysis = analyzeGPT5Role(query, response, config);
    const roleTracker = trackGPT5RoleStats();
    
    roleTracker.addInteraction(roleAnalysis);
    
    const role = roleAnalysis.analysis.finalRole;
    const confidence = roleAnalysis.analysis.confidence;
    const expected = roleAnalysis.analysis.expectedRole;
    const behaviorMatch = roleAnalysis.analysis.behaviorMatch;
    
    const roleEmoji = role === 'ADVISOR' ? '🧠' : role === 'OPERATOR' ? '⚙️' : '🔄';
    const matchEmoji = behaviorMatch ? '✅' : '❌';
    const confidenceLevel = confidence >= 80 ? '🎯' : confidence >= 60 ? '📊' : '🤔';
    
    console.log(`🎯 GPT-5 Role: ${roleEmoji} ${role} (${confidenceLevel} ${confidence}% confidence)`);
    console.log(`   Model: ${config.model || 'unknown'} | Expected: ${expected} ${matchEmoji}`);
    console.log(`   Priority: ${config.priority || 'unknown'} | Consistency: ${roleAnalysis.analysis.roleConsistency}`);
    
    return {
        role,
        confidence,
        expected,
        behaviorMatch,
        fullAnalysis: roleAnalysis
    };
}

/**
 * 📈 ENHANCED: Get role statistics with Cambodia fund insights
 */
function getEnhancedRoleStats() {
    const basicStats = trackGPT5RoleStats().getStats();
    const insights = [];
    
    if (basicStats.percentages.operator > 60) {
        insights.push('✅ System primarily operating in OPERATOR mode - excellent for task execution and fund operations');
    } else if (basicStats.percentages.advisor > 60) {
        insights.push('🧠 System primarily operating in ADVISOR mode - excellent for strategic analysis and insights');
    } else {
        insights.push('🔄 System shows balanced ADVISOR/OPERATOR behavior - versatile for all fund operations');
    }
    
    if (basicStats.percentages.predictionAccuracy > 85) {
        insights.push('🎯 Excellent prediction accuracy - role detection is highly optimized');
    } else if (basicStats.percentages.predictionAccuracy > 70) {
        insights.push('📊 Good prediction accuracy - role detection is working well');
    } else if (basicStats.percentages.predictionAccuracy < 60) {
        insights.push('🔧 Prediction accuracy needs improvement - consider tuning thresholds');
    }
    
    if (basicStats.percentages.behaviorConsistency > 85) {
        insights.push('✅ Excellent behavior consistency - system consistently meeting expectations');
    } else if (basicStats.percentages.behaviorConsistency < 60) {
        insights.push('⚠️ Low behavior consistency - may need configuration adjustments for your use cases');
    }
    
    const fundStats = basicStats.cambodiaFundStats;
    const totalFundInteractions = Object.values(fundStats).reduce((sum, count) => sum + count, 0);
    
    if (totalFundInteractions > 0) {
        insights.push(`🇰🇭 Cambodia fund operations: ${totalFundInteractions} interactions tracked`);
        if (fundStats.dealAnalysis > fundStats.lpManagement) {
            insights.push('📊 Primary usage: Deal analysis and evaluation');
        } else if (fundStats.lpManagement > fundStats.dealAnalysis) {
            insights.push('👥 Primary usage: LP relationship management');
        }
    }
    
    return {
        ...basicStats,
        insights,
        health: {
            overall: basicStats.percentages.predictionAccuracy > 75 && basicStats.percentages.behaviorConsistency > 75 ? 'EXCELLENT' : 
                    basicStats.percentages.predictionAccuracy > 60 && basicStats.percentages.behaviorConsistency > 60 ? 'GOOD' : 'NEEDS_TUNING',
            predictionHealth: basicStats.percentages.predictionAccuracy > 80 ? 'EXCELLENT' : 
                            basicStats.percentages.predictionAccuracy > 65 ? 'GOOD' : 'POOR',
            consistencyHealth: basicStats.percentages.behaviorConsistency > 80 ? 'EXCELLENT' : 
                             basicStats.percentages.behaviorConsistency > 65 ? 'GOOD' : 'POOR',
            optimizationLevel: 'Cambodia Fund Optimized'
        },
        
        modelPerformance: Object.entries(basicStats.modelStats).map(([model, stats]) => ({
            model,
            totalInteractions: stats.total,
            operatorRate: Math.round((stats.operator / stats.total) * 100),
            advisorRate: Math.round((stats.advisor / stats.total) * 100),
            hybridRate: Math.round((stats.hybrid / stats.total) * 100),
            recommendation: stats.operator > stats.advisor ? 'Optimized for operations' : 
                          stats.advisor > stats.operator ? 'Optimized for analysis' : 'Balanced usage'
        })),
        
        fundOperations: {
            dealAnalysisRate: Math.round((fundStats.dealAnalysis / Math.max(1, totalFundInteractions)) * 100),
            lpManagementRate: Math.round((fundStats.lpManagement / Math.max(1, totalFundInteractions)) * 100),
            portfolioTrackingRate: Math.round((fundStats.portfolioTracking / Math.max(1, totalFundInteractions)) * 100),
            marketIntelligenceRate: Math.round((fundStats.marketIntelligence / Math.max(1, totalFundInteractions)) * 100),
            primaryUseCase: totalFundInteractions > 0 ? 
                Object.entries(fundStats).reduce((a, b) => fundStats[a[0]] > fundStats[b[0]] ? a : b)[0] : 'none'
        }
    };
}

// 📤 COMPREHENSIVE EXPORTS
module.exports = {
    // Core functions
    predictGPT5Role,
    detectActualGPT5Role,
    analyzeGPT5Role,
    checkGPT5Role,
    
    // Statistics and tracking
    trackGPT5RoleStats,
    getRoleStats: () => trackGPT5RoleStats().getStats(),
    getEnhancedRoleStats,
    
    // Utility functions
    determineExpectedBehavior,
    analyzeResponseStructure,
    checkSpecializedPatterns,
    
    // Configuration
    ROLE_PATTERNS,
    DETECTION_RULES,
    
    // Helper functions
    isAdvisor: (query, response, config) => {
        const result = checkGPT5Role(query, response, config);
        return result.role === 'ADVISOR';
    },
    
    isOperator: (query, response, config) => {
        const result = checkGPT5Role(query, response, config);
        return result.role === 'OPERATOR';
    },
    
    isHybrid: (query, response, config) => {
        const result = checkGPT5Role(query, response, config);
        return result.role === 'HYBRID';
    },
    
    // Cambodia fund specific helpers
    isCambodiaFundQuery: (query) => {
        const cambodiaPatterns = [
            /cambodia|khmer|phnom penh|bkk1|bkk2|bkk3/i,
            /fund|lp|limited partner|investor/i,
            /deal|property|real estate|lending/i,
            /portfolio|aum|irr|roi/i
        ];
        return cambodiaPatterns.some(pattern => pattern.test(query));
    },
    
    getCambodiaFundStats: () => {
        const stats = trackGPT5RoleStats().getStats();
        return stats.cambodiaFundStats;
    },
    
    // Model-specific role expectations
    getModelExpectation: (model, query) => {
        const behavior = determineExpectedBehavior(query, { model });
        return {
            expectedRole: behavior.expectedRole,
            confidence: DETECTION_RULES.MODEL_EXPECTATIONS[model] ? 90 : 50,
            reason: behavior.reason
        };
    },
    
    // Optimization recommendations
    getOptimizationRecommendations: () => {
        const stats = getEnhancedRoleStats();
        const recommendations = [];
        
        if (stats.health.predictionHealth === 'POOR') {
            recommendations.push({
                type: 'PREDICTION_ACCURACY',
                priority: 'HIGH',
                suggestion: 'Lower role detection thresholds for more decisive classification',
                action: 'Adjust OPERATOR/ADVISOR score thresholds in detectActualGPT5Role function'
            });
        }
        
        if (stats.health.consistencyHealth === 'POOR') {
            recommendations.push({
                type: 'BEHAVIOR_CONSISTENCY', 
                priority: 'MEDIUM',
                suggestion: 'Refine model-specific expectations for better consistency',
                action: 'Update MODEL_EXPECTATIONS in DETECTION_RULES for your primary models'
            });
        }
        
        if (stats.percentages.hybrid > 50) {
            recommendations.push({
                type: 'ROLE_CLARITY',
                priority: 'LOW',
                suggestion: 'High HYBRID rate indicates queries with mixed intent - this may be optimal',
                action: 'Consider if HYBRID behavior is desired for your Cambodia fund operations'
            });
        }
        
        const fundOps = stats.fundOperations;
        if (fundOps.primaryUseCase === 'dealAnalysis') {
            recommendations.push({
                type: 'CAMBODIA_FUND_OPTIMIZATION',
                priority: 'LOW',
                suggestion: 'Primary usage is deal analysis - consider optimizing for ADVISOR role',
                action: 'Ensure complex deal analysis queries trigger ADVISOR mode for better insights'
            });
        } else if (fundOps.primaryUseCase === 'lpManagement') {
            recommendations.push({
                type: 'CAMBODIA_FUND_OPTIMIZATION',
                priority: 'LOW', 
                suggestion: 'Primary usage is LP management - consider optimizing for OPERATOR role',
                action: 'Ensure LP communication and tracking queries trigger OPERATOR mode'
            });
        }
        
        return recommendations;
    },
    
    // Reset function for testing
    resetStats: () => {
        trackGPT5RoleStats().reset();
    },
    
    // Enhanced health check with detailed diagnostics
    checkRoleDetectorHealth: () => {
        const stats = trackGPT5RoleStats().getStats();
        const enhanced = getEnhancedRoleStats();
        
        return {
            healthy: enhanced.health.overall !== 'NEEDS_TUNING',
            healthLevel: enhanced.health.overall,
            totalInteractions: stats.totalInteractions,
            roleDistribution: stats.percentages,
            predictionAccuracy: stats.percentages.predictionAccuracy,
            behaviorConsistency: stats.percentages.behaviorConsistency,
            status: stats.totalInteractions > 10 ? 
                (stats.percentages.predictionAccuracy > 75 ? 'OPTIMAL' : 'GOOD') : 
                'LEARNING',
            insights: enhanced.insights,
            recommendations: module.exports.getOptimizationRecommendations(),
            cambodiaFundOptimized: true,
            lastOptimizationDate: new Date().toISOString()
        };
    },
    
    // Quick role prediction without tracking
    quickRolePrediction: (query, config = {}) => {
        const prediction = predictGPT5Role(query);
        const expected = determineExpectedBehavior(query, config);
        
        return {
            predictedRole: prediction.predictedRole,
            confidence: prediction.confidence,
            expectedRole: expected.expectedRole,
            scores: prediction.scores,
            reason: expected.reason
        };
    },
    
    // Batch role analysis for multiple queries
    batchRoleAnalysis: (queries) => {
        return queries.map(query => {
            const prediction = predictGPT5Role(query);
            return {
                query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
                predictedRole: prediction.predictedRole,
                confidence: prediction.confidence,
                scores: prediction.scores
            };
        });
    },
    
    // Test role detection accuracy
    testRoleDetection: () => {
        const testCases = [
            // Should be OPERATOR
            { query: "Create a memo for investors", expected: "OPERATOR" },
            { query: "Calculate the IRR for this deal", expected: "OPERATOR" },
            { query: "Generate a due diligence checklist", expected: "OPERATOR" },
            { query: "Quick market update", expected: "OPERATOR" },
            
            // Should be ADVISOR  
            { query: "What do you think about Cambodia market risks?", expected: "ADVISOR" },
            { query: "Analyze the investment strategy", expected: "ADVISOR" },
            { query: "Should I invest in this opportunity?", expected: "ADVISOR" },
            { query: "Evaluate the political risks", expected: "ADVISOR" },
            
            // Should be HYBRID
            { query: "Analyze this deal and create a summary", expected: "HYBRID" },
            { query: "Review the portfolio and generate report", expected: "HYBRID" }
        ];
        
        const results = testCases.map(testCase => {
            const prediction = predictGPT5Role(testCase.query);
            const correct = prediction.predictedRole === testCase.expected;
            
            return {
                query: testCase.query,
                expected: testCase.expected,
                predicted: prediction.predictedRole,
                confidence: prediction.confidence,
                correct: correct,
                scores: prediction.scores
            };
        });
        
        const accuracy = (results.filter(r => r.correct).length / results.length) * 100;
        
        return {
            testDate: new Date().toISOString(),
            totalTests: results.length,
            correctPredictions: results.filter(r => r.correct).length,
            accuracy: Math.round(accuracy),
            results: results,
            summary: {
                operatorAccuracy: Math.round((results.filter(r => r.expected === 'OPERATOR' && r.correct).length / results.filter(r => r.expected === 'OPERATOR').length) * 100),
                advisorAccuracy: Math.round((results.filter(r => r.expected === 'ADVISOR' && r.correct).length / results.filter(r => r.expected === 'ADVISOR').length) * 100),
                hybridAccuracy: Math.round((results.filter(r => r.expected === 'HYBRID' && r.correct).length / results.filter(r => r.expected === 'HYBRID').length) * 100)
            }
        };
    },
    
    // Generate role detection report
    generateDetectionReport: () => {
        const stats = getEnhancedRoleStats();
        const testResults = module.exports.testRoleDetection();
        const health = module.exports.checkRoleDetectorHealth();
        
        return {
            reportId: `ROLE-REPORT-${Date.now()}`,
            generatedDate: new Date().toISOString(),
            systemHealth: health.healthLevel,
            
            // Performance metrics
            performance: {
                totalInteractions: stats.totalInteractions,
                predictionAccuracy: stats.percentages.predictionAccuracy,
                behaviorConsistency: stats.percentages.behaviorConsistency,
                testAccuracy: testResults.accuracy
            },
            
            // Role distribution
            roleDistribution: {
                advisor: stats.percentages.advisor,
                operator: stats.percentages.operator,
                hybrid: stats.percentages.hybrid
            },
            
            // Model performance
            modelPerformance: stats.modelPerformance,
            
            // Cambodia fund insights
            cambodiaFundUsage: stats.fundOperations,
            
            // Key insights and recommendations
            insights: stats.insights,
            recommendations: health.recommendations,
            
            // Test results
            testResults: testResults,
            
            // Overall assessment
            assessment: {
                status: health.status,
                optimizationLevel: stats.health.optimizationLevel,
                readyForProduction: health.healthy && stats.percentages.predictionAccuracy > 70,
                nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            }
        };
    }
};

console.log('🎯 OPTIMIZED GPT-5 Role Detector System Loaded');
console.log('🧠 Enhanced advisor detection: Strategic analysis, recommendations, market insights');
console.log('⚙️ Optimized operator detection: Task execution, document creation, calculations');
console.log('🔄 Improved hybrid detection: Mixed advisory and operational functions');
console.log('📊 Advanced statistics: Comprehensive behavior analysis with Cambodia fund insights');
console.log('🇰🇭 Cambodia fund optimized: Specialized patterns for private lending operations');
console.log('🎯 Enhanced accuracy: Reduced thresholds for more decisive role classification');
console.log('⚡ Model-aware expectations: Different models have different optimal roles');
console.log('🔧 Optimization ready: Built-in recommendations and health monitoring');
console.log('📈 Testing framework: Built-in accuracy testing and reporting capabilities');
console.log('✅ Production ready: Complete role detection system for Cambodia fund operations');
