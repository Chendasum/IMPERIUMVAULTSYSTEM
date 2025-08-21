// utils/gpt5RoleDetector.js - COMPLETE REWRITE
// Professional GPT-5 role detection system for Advisor vs Operator behavior tracking

/**
 * 🎯 GPT-5 ROLE DETECTION SYSTEM
 * 
 * Determines if GPT-5 is functioning as:
 * - ADVISOR: Strategic analysis, recommendations, insights, market analysis
 * - OPERATOR: Task execution, document creation, calculations, implementation
 * - HYBRID: Mixed advisory and operational functions
 */

// 🎯 COMPREHENSIVE ROLE DETECTION PATTERNS
const ROLE_PATTERNS = {
    ADVISOR: {
        // Query patterns that suggest advisory role
        queryPatterns: [
            /what do you think|your opinion|recommend|suggest|advise/i,
            /analyze|assess|evaluate|review|consider|examine/i,
            /strategy|approach|framework|methodology|best practice/i,
            /pros and cons|advantages|disadvantages|trade-offs/i,
            /risk|opportunity|scenario|outlook|forecast/i,
            /should I|what if|how might|potential|implications/i,
            /market analysis|investment thesis|due diligence/i,
            /compare|versus|alternative|option|choice/i,
            /insight|perspective|view|thoughts on/i
        ],
        
        // Response patterns that indicate advisory behavior
        responsePatterns: [
            /I recommend|I suggest|I would advise|consider|my recommendation/i,
            /analysis shows|data indicates|trends suggest|evidence points/i,
            /risk factors|key considerations|important to note/i,
            /strategic implications|market dynamics|economic factors/i,
            /scenario analysis|potential outcomes|likely scenarios/i,
            /my assessment|my analysis|based on my evaluation/i,
            /factors to consider|things to keep in mind/i,
            /from a strategic perspective|strategically speaking/i,
            /pros include|cons include|advantages are|disadvantages are/i
        ],
        
        // Keywords that suggest advisory content
        keywords: [
            'recommend', 'suggest', 'advise', 'consider', 'analyze', 'assess',
            'strategy', 'risk', 'opportunity', 'assessment', 'outlook', 'forecast',
            'implications', 'factors', 'considerations', 'insights', 'perspective',
            'evaluation', 'recommendation', 'analysis', 'strategic', 'framework',
            'methodology', 'approach', 'alternative', 'scenario', 'potential'
        ]
    },
    
    OPERATOR: {
        // Query patterns that suggest operational role
        queryPatterns: [
            /create|generate|write|draft|build|make|produce/i,
            /calculate|compute|process|execute|run|perform/i,
            /format|convert|transform|organize|structure/i,
            /schedule|book|reserve|order|send|prepare/i,
            /list|summarize|extract|compile|gather/i,
            /memo|document|report|email|letter|proposal/i,
            /template|checklist|outline|framework|guide/i,
            /help me with|show me how|walk me through/i
        ],
        
        // Response patterns that indicate operational behavior
        responsePatterns: [
            /here is|here's|I've created|I've generated|I've prepared/i,
            /completed|finished|processed|calculated|executed/i,
            /draft|document|memo|summary|list|template/i,
            /step 1|step 2|action items|next steps|to do/i,
            /total|result|output|deliverable|final/i,
            /formatted|organized|structured|arranged/i,
            /created|built|developed|designed|constructed/i,
            /here's your|here's the|below is|attached is/i
        ],
        
        // Keywords that suggest operational content
        keywords: [
            'created', 'generated', 'completed', 'calculated', 'processed',
            'draft', 'document', 'memo', 'summary', 'list', 'total', 'result',
            'output', 'executed', 'formatted', 'organized', 'template',
            'checklist', 'outline', 'deliverable', 'final', 'prepared'
        ]
    }
};

// 🔧 SPECIALIZED DETECTION RULES
const DETECTION_RULES = {
    // Cambodia Fund specific patterns
    CAMBODIA_FUND: {
        advisor: [
            /cambodia.*market.*analysis/i,
            /risk.*assessment.*cambodia/i,
            /investment.*outlook.*cambodia/i,
            /due.*diligence.*considerations/i
        ],
        operator: [
            /draft.*cambodia.*memo/i,
            /create.*lp.*criteria/i,
            /investment.*summary.*cambodia/i,
            /cambodia.*fund.*document/i
        ]
    },
    
    // Financial analysis patterns
    FINANCIAL: {
        advisor: [
            /portfolio.*allocation.*strategy/i,
            /market.*regime.*analysis/i,
            /risk.*management.*approach/i,
            /investment.*thesis/i
        ],
        operator: [
            /calculate.*irr|npv|roi/i,
            /financial.*model|spreadsheet/i,
            /investment.*memo|summary/i,
            /portfolio.*report/i
        ]
    },
    
    // Speed-based detection
    SPEED_INDICATORS: {
        ultraFast: 'OPERATOR',    // Speed queries are usually operational
        fast: 'OPERATOR',         // Quick responses are usually operational
        balanced: 'HYBRID',       // Balanced queries can be either
        complex: 'ADVISOR',       // Complex analysis is usually advisory
        very_complex: 'ADVISOR'   // Very complex is definitely advisory
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
        modelStats: {}
    };
}

/**
 * 🔍 PREDICT GPT-5 ROLE based on query analysis
 */
function predictGPT5Role(query) {
    const queryLower = query.toLowerCase().trim();
    const words = queryLower.split(/\s+/);
    
    let advisorScore = 0;
    let operatorScore = 0;
    let confidence = 50;
    
    // Check query patterns (weighted heavily)
    ROLE_PATTERNS.ADVISOR.queryPatterns.forEach(pattern => {
        if (pattern.test(queryLower)) advisorScore += 3;
    });
    
    ROLE_PATTERNS.OPERATOR.queryPatterns.forEach(pattern => {
        if (pattern.test(queryLower)) operatorScore += 3;
    });
    
    // Check keywords (lighter weight)
    ROLE_PATTERNS.ADVISOR.keywords.forEach(keyword => {
        const occurrences = (queryLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        advisorScore += occurrences;
    });
    
    ROLE_PATTERNS.OPERATOR.keywords.forEach(keyword => {
        const occurrences = (queryLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        operatorScore += occurrences;
    });
    
    // Check specialized patterns
    checkSpecializedPatterns(queryLower, (type, role) => {
        if (role === 'advisor') advisorScore += 2;
        else if (role === 'operator') operatorScore += 2;
    });
    
    // Determine predicted role
    let predictedRole = 'HYBRID';
    
    if (advisorScore > operatorScore + 2) {
        predictedRole = 'ADVISOR';
        confidence = Math.min(95, 60 + (advisorScore - operatorScore) * 4);
    } else if (operatorScore > advisorScore + 2) {
        predictedRole = 'OPERATOR';
        confidence = Math.min(95, 60 + (operatorScore - advisorScore) * 4);
    } else {
        confidence = 40 + Math.abs(advisorScore - operatorScore) * 3;
    }
    
    return {
        predictedRole,
        confidence: Math.round(confidence),
        scores: { advisor: advisorScore, operator: operatorScore },
        wordCount: words.length,
        reasoning: `Query analysis: ${advisorScore} advisor signals, ${operatorScore} operator signals`
    };
}

/**
 * 🎯 DETECT ACTUAL GPT-5 ROLE based on response analysis
 */
function detectActualGPT5Role(response, queryAnalysis = null) {
    const responseLower = response.toLowerCase();
    const responseLength = response.length;
    
    let advisorScore = 0;
    let operatorScore = 0;
    
    // Check response patterns (heavily weighted)
    ROLE_PATTERNS.ADVISOR.responsePatterns.forEach(pattern => {
        if (pattern.test(responseLower)) advisorScore += 4;
    });
    
    ROLE_PATTERNS.OPERATOR.responsePatterns.forEach(pattern => {
        if (pattern.test(responseLower)) operatorScore += 4;
    });
    
    // Check keywords in response
    ROLE_PATTERNS.ADVISOR.keywords.forEach(keyword => {
        const occurrences = (responseLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        advisorScore += occurrences;
    });
    
    ROLE_PATTERNS.OPERATOR.keywords.forEach(keyword => {
        const occurrences = (responseLower.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
        operatorScore += occurrences;
    });
    
    // Analyze response structure
    const structuralAnalysis = analyzeResponseStructure(response);
    
    // Apply structural bonuses
    if (structuralAnalysis.hasStructuredOutput) operatorScore += 3;
    if (structuralAnalysis.hasAnalyticalLanguage) advisorScore += 3;
    if (structuralAnalysis.hasDeliverables) operatorScore += 2;
    if (structuralAnalysis.hasRecommendations) advisorScore += 2;
    
    // Length-based adjustments
    if (responseLength > 2000) advisorScore += 1; // Long responses often advisory
    if (responseLength < 500) operatorScore += 1;  // Short responses often operational
    
    // Determine actual role
    let actualRole = 'HYBRID';
    let confidence = 50;
    
    if (advisorScore > operatorScore + 3) {
        actualRole = 'ADVISOR';
        confidence = Math.min(98, 70 + (advisorScore - operatorScore) * 3);
    } else if (operatorScore > advisorScore + 3) {
        actualRole = 'OPERATOR';
        confidence = Math.min(98, 70 + (operatorScore - advisorScore) * 3);
    } else {
        confidence = 40 + Math.abs(advisorScore - operatorScore) * 4;
    }
    
    return {
        actualRole,
        confidence: Math.round(confidence),
        scores: { advisor: advisorScore, operator: operatorScore },
        structural: structuralAnalysis,
        reasoning: `Response analysis: ${advisorScore} advisor signals, ${operatorScore} operator signals`
    };
}

/**
 * 🔬 ANALYZE RESPONSE STRUCTURE for role indicators
 */
function analyzeResponseStructure(response) {
    return {
        hasStructuredOutput: /^\s*[-*•]|\d+\.|#{1,6}\s|\|\s*[-:]+\s*\|/.test(response),
        hasAnalyticalLanguage: /however|therefore|consequently|furthermore|moreover|additionally|specifically|particularly/i.test(response),
        hasDeliverables: /document|memo|draft|summary|checklist|template|report|analysis|outline/i.test(response),
        hasRecommendations: /recommend|suggest|advise|should|consider|might want to/i.test(response),
        hasNumbers: /\d+%|\$[\d,]+|\d+\.\d+|\d+x|ratio|rate|percentage/i.test(response),
        hasQuestions: /\?/.test(response),
        hasSections: /#{1,6}|section|part \d+|step \d+/i.test(response),
        responseLength: response.length,
        paragraphCount: (response.match(/\n\s*\n/g) || []).length + 1,
        sentenceCount: (response.match(/[.!?]+/g) || []).length
    };
}

/**
 * 🎯 CHECK SPECIALIZED PATTERNS for domain-specific detection
 */
function checkSpecializedPatterns(queryLower, callback) {
    // Cambodia Fund patterns
    DETECTION_RULES.CAMBODIA_FUND.advisor.forEach(pattern => {
        if (pattern.test(queryLower)) callback('cambodia', 'advisor');
    });
    
    DETECTION_RULES.CAMBODIA_FUND.operator.forEach(pattern => {
        if (pattern.test(queryLower)) callback('cambodia', 'operator');
    });
    
    // Financial patterns
    DETECTION_RULES.FINANCIAL.advisor.forEach(pattern => {
        if (pattern.test(queryLower)) callback('financial', 'advisor');
    });
    
    DETECTION_RULES.FINANCIAL.operator.forEach(pattern => {
        if (pattern.test(queryLower)) callback('financial', 'operator');
    });
}

/**
 * 🎯 DETERMINE EXPECTED BEHAVIOR based on query and config
 */
function determineExpectedBehavior(query, config) {
    const queryLower = query.toLowerCase();
    
    // Check speed-based expectations
    if (config.priority && DETECTION_RULES.SPEED_INDICATORS[config.priority]) {
        return {
            expectedRole: DETECTION_RULES.SPEED_INDICATORS[config.priority],
            reason: `Speed priority ${config.priority} suggests ${DETECTION_RULES.SPEED_INDICATORS[config.priority]} role`
        };
    }
    
    // Document creation = OPERATOR
    if (/create|draft|write|generate|compose/.test(queryLower) && 
        /memo|document|report|analysis|plan|strategy|outline/.test(queryLower)) {
        return {
            expectedRole: 'OPERATOR',
            reason: 'Document creation request'
        };
    }
    
    // Analysis/assessment = ADVISOR
    if (/analyze|assess|evaluate|review|opinion|recommend|think about/.test(queryLower)) {
        return {
            expectedRole: 'ADVISOR',
            reason: 'Analysis or assessment request'
        };
    }
    
    // Complex reasoning = ADVISOR
    if (config.reasoning_effort === 'high' || config.reasoning_effort === 'medium') {
        return {
            expectedRole: 'ADVISOR',
            reason: 'High reasoning effort suggests advisory role'
        };
    }
    
    // Model-based expectations
    if (config.model === 'gpt-5-nano') {
        return {
            expectedRole: 'OPERATOR',
            reason: 'Nano model optimized for operational tasks'
        };
    }
    
    return {
        expectedRole: 'HYBRID',
        reason: 'Mixed or unclear intent'
    };
}

/**
 * 🔬 COMPLETE ROLE ANALYSIS combining prediction and detection
 */
function analyzeGPT5Role(query, response, config = {}) {
    const prediction = predictGPT5Role(query);
    const detection = detectActualGPT5Role(response, prediction);
    const expectedBehavior = determineExpectedBehavior(query, config);
    
    // Check prediction accuracy
    const predictionAccurate = prediction.predictedRole === detection.actualRole;
    const roleConsistency = predictionAccurate ? 'CONSISTENT' : 'INCONSISTENT';
    
    // Check if behavior matches expectations
    const behaviorMatch = expectedBehavior.expectedRole === detection.actualRole;
    
    // Calculate overall confidence
    const overallConfidence = Math.round((prediction.confidence + detection.confidence) / 2);
    
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
 * 📊 TRACK ROLE STATISTICS over multiple interactions
 */
function trackGPT5RoleStats() {
    return {
        addInteraction: (roleAnalysis) => {
            const stats = global.gpt5RoleStats;
            const today = roleAnalysis.metadata.date;
            
            // Add to interactions
            stats.interactions.push(roleAnalysis);
            
            // Update summary stats
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
            
            // Track daily stats
            if (!stats.dailyStats[today]) {
                stats.dailyStats[today] = { advisor: 0, operator: 0, hybrid: 0, total: 0 };
            }
            stats.dailyStats[today][roleAnalysis.analysis.finalRole.toLowerCase()]++;
            stats.dailyStats[today].total++;
            
            // Track model stats
            const model = roleAnalysis.config.model;
            if (!stats.modelStats[model]) {
                stats.modelStats[model] = { advisor: 0, operator: 0, hybrid: 0, total: 0 };
            }
            stats.modelStats[model][roleAnalysis.analysis.finalRole.toLowerCase()]++;
            stats.modelStats[model].total++;
            
            // Keep only last 1000 interactions
            if (stats.interactions.length > 1000) {
                stats.interactions = stats.interactions.slice(-1000);
            }
            
            // Clean old daily stats (keep last 30 days)
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
                modelStats: global.gpt5RoleStats.modelStats
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
                modelStats: {}
            };
        }
    };
}

/**
 * 🚀 MAIN WRAPPER FUNCTION for easy usage
 */
function checkGPT5Role(query, response, config = {}) {
    const roleAnalysis = analyzeGPT5Role(query, response, config);
    const roleTracker = trackGPT5RoleStats();
    
    // Add to tracking
    roleTracker.addInteraction(roleAnalysis);
    
    // Extract key info
    const role = roleAnalysis.analysis.finalRole;
    const confidence = roleAnalysis.analysis.confidence;
    const expected = roleAnalysis.analysis.expectedRole;
    const behaviorMatch = roleAnalysis.analysis.behaviorMatch;
    
    // Log result with appropriate emoji
    const roleEmoji = role === 'ADVISOR' ? '🧠' : role === 'OPERATOR' ? '⚙️' : '🔄';
    const matchEmoji = behaviorMatch ? '✅' : '❌';
    
    console.log(`🎯 GPT-5 Role: ${roleEmoji} ${role} (${confidence}% confidence)`);
    console.log(`   Model: ${config.model || 'unknown'} | Expected: ${expected} ${matchEmoji}`);
    
    return {
        role,
        confidence,
        expected,
        behaviorMatch,
        fullAnalysis: roleAnalysis
    };
}

/**
 * 📈 GET ENHANCED STATISTICS with insights
 */
function getEnhancedRoleStats() {
    const basicStats = trackGPT5RoleStats().getStats();
    
    // Calculate trends and insights
    const insights = [];
    
    if (basicStats.percentages.advisor > 60) {
        insights.push('System primarily operating in ADVISOR mode - good for strategic analysis');
    } else if (basicStats.percentages.operator > 60) {
        insights.push('System primarily operating in OPERATOR mode - good for task execution');
    } else {
        insights.push('System shows balanced ADVISOR/OPERATOR behavior - versatile usage');
    }
    
    if (basicStats.percentages.predictionAccuracy > 80) {
        insights.push('High prediction accuracy - role detection is working well');
    } else if (basicStats.percentages.predictionAccuracy < 60) {
        insights.push('Low prediction accuracy - may need role detection tuning');
    }
    
    if (basicStats.percentages.behaviorConsistency > 80) {
        insights.push('High behavior consistency - system meeting expectations');
    } else if (basicStats.percentages.behaviorConsistency < 60) {
        insights.push('Low behavior consistency - may need configuration adjustments');
    }
    
    return {
        ...basicStats,
        insights,
        health: {
            overall: basicStats.percentages.predictionAccuracy > 70 && basicStats.percentages.behaviorConsistency > 70 ? 'HEALTHY' : 'NEEDS_ATTENTION',
            predictionHealth: basicStats.percentages.predictionAccuracy > 70 ? 'GOOD' : 'POOR',
            consistencyHealth: basicStats.percentages.behaviorConsistency > 70 ? 'GOOD' : 'POOR'
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
    
    // Easy-to-use helper functions
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
    
    // Reset function for testing
    resetStats: () => {
        trackGPT5RoleStats().reset();
    },
    
    // Health check
    checkRoleDetectorHealth: () => {
        const stats = trackGPT5RoleStats().getStats();
        
        return {
            healthy: true,
            totalInteractions: stats.totalInteractions,
            roleDistribution: stats.percentages,
            predictionAccuracy: stats.percentages.predictionAccuracy,
            behaviorConsistency: stats.percentages.behaviorConsistency,
            status: stats.totalInteractions > 10 ? 
                (stats.percentages.predictionAccuracy > 70 ? 'OPTIMAL' : 'LEARNING') : 
                'INITIALIZING'
        };
    }
};

console.log('🎯 GPT-5 Role Detector System Loaded');
console.log('🧠 Advisor detection: Strategic analysis, recommendations, insights');
console.log('⚙️ Operator detection: Task execution, document creation, calculations');
console.log('🔄 Hybrid detection: Mixed advisory and operational functions');
console.log('📊 Statistics tracking: Comprehensive behavior analysis enabled');
console.log('🎯 Specialized patterns: Cambodia fund and financial analysis optimized');
