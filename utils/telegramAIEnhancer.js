// utils/telegramAIEnhancer.js - AI-SPECIFIC ENHANCEMENTS FOR YOUR EXISTING TELEGRAM SPLITTER
// Adds GPT-5 + Claude Opus 4.1 optimization without replacing your core splitter

const telegramSplitter = require('./telegramSplitter'); // Your original file

// 🤖 AI-SPECIFIC MESSAGE TYPES (extends your existing MESSAGE_TYPES)
const AI_MESSAGE_TYPES = {
    ...telegramSplitter.MESSAGE_TYPES,
    'gpt5': { emoji: '🧠', priority: 'high' },
    'claude': { emoji: '⚡', priority: 'high' },
    'dual_ai': { emoji: '🔄', priority: 'urgent' },
    'memory_query': { emoji: '🧠', priority: 'high' },
    'context_enhanced': { emoji: '🎯', priority: 'high' },
    'strategic_analysis': { emoji: '📊', priority: 'high' },
    'ai_fallback': { emoji: '🔧', priority: 'normal' }
};

// 🎯 AI RESPONSE OPTIMIZATION
function optimizeAIResponse(text, aiModel = 'gpt5', options = {}) {
    if (!text || typeof text !== 'string') return '';
    
    let optimized = text;
    
    // GPT-5 specific optimizations
    if (aiModel === 'gpt5') {
        optimized = optimized
            // Handle GPT-5's structured outputs
            .replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
                return `\`${code.trim()}\``;
            })
            // Simplify GPT-5's table formatting
            .replace(/\|([^|]+)\|([^|]+)\|/g, '$1: $2')
            // Handle GPT-5's nested lists
            .replace(/^\s{2,}-\s+/gm, '  • ');
    }
    
    // Claude Opus 4.1 specific optimizations  
    if (aiModel === 'claude') {
        optimized = optimized
            // Handle Claude's analytical structure
            .replace(/^#{4,6}\s+(.+)/gm, '• $1')
            // Simplify Claude's detailed breakdowns
            .replace(/\*\*(Analysis|Summary|Conclusion|Key Points?):\*\*/gi, '\n**$1:**')
            // Handle Claude's numbered insights
            .replace(/^(\d+)\.\s+\*\*(.*?)\*\*/gm, '$1. $2');
    }
    
    // General AI optimizations for both models
    optimized = optimized
        // Remove excessive emphasis
        .replace(/\*{3,}/g, '**')
        // Normalize spacing
        .replace(/\n{4,}/g, '\n\n\n')
        // Handle AI confidence indicators
        .replace(/\(confidence:\s*\d+%\)/gi, '')
        // Clean up AI reasoning markers
        .replace(/\[reasoning\]|\[analysis\]|\[context\]/gi, '');
    
    return telegramSplitter.cleanResponse(optimized);
}

// 🧠 TOKEN MANAGEMENT FOR AI MODELS
function manageAITokens(text, maxTokens = 4000, aiModel = 'gpt5') {
    const estimatedTokens = Math.ceil(text.length / 4); // Rough estimation
    
    if (estimatedTokens <= maxTokens) {
        return {
            text: text,
            tokens: estimatedTokens,
            needsSplitting: false,
            withinLimits: true
        };
    }
    
    // Smart truncation for AI responses
    const maxChars = maxTokens * 4 * 0.9; // 90% safety margin
    
    // Find good truncation point
    const truncationPoint = findAITruncationPoint(text, maxChars);
    const truncated = text.substring(0, truncationPoint);
    
    return {
        text: truncated + '\n\n*(Response truncated for length)*',
        tokens: Math.ceil(truncated.length / 4),
        needsSplitting: false,
        withinLimits: true,
        wasTruncated: true
    };
}

function findAITruncationPoint(text, maxLength) {
    // Preferred truncation points for AI responses
    const truncationPatterns = [
        /\n\n\*\*(Summary|Conclusion|Key Points?):\*\*/gi,
        /\n\n---/g,
        /\n\n#{1,3}\s+/g,
        /\n\n\d+\.\s+/g,
        /\.\s+\n/g,
        /\n\n/g
    ];
    
    for (const pattern of truncationPatterns) {
        const matches = [...text.matchAll(pattern)];
        
        for (let i = matches.length - 1; i >= 0; i--) {
            const matchStart = matches[i].index;
            if (matchStart <= maxLength && matchStart > maxLength * 0.7) {
                return matchStart;
            }
        }
    }
    
    // Fallback to safe truncation
    return Math.floor(maxLength * 0.9);
}

// 🎯 ENHANCED AI MESSAGE SENDER
async function sendAIResponse(bot, chatId, response, options = {}) {
    try {
        const {
            aiModel = 'gpt5',
            queryType = 'general',
            maxTokens = 4000,
            includeMetadata = false,
            contextUsed = false,
            responseTime = null
        } = options;
        
        console.log(`🤖 Sending AI response: ${aiModel} (${response?.length || 0} chars)`);
        
        // Optimize response for AI model
        let optimizedResponse = optimizeAIResponse(response, aiModel, options);
        
        // Manage tokens if needed
        const tokenInfo = manageAITokens(optimizedResponse, maxTokens, aiModel);
        optimizedResponse = tokenInfo.text;
        
        // Add metadata if requested
        if (includeMetadata) {
            const metadata = buildResponseMetadata(aiModel, queryType, tokenInfo, contextUsed, responseTime);
            optimizedResponse += `\n\n${metadata}`;
        }
        
        // Determine message type
        let messageType = 'analysis';
        if (queryType === 'casual') messageType = 'general';
        else if (queryType === 'regime') messageType = 'regime';
        else if (queryType === 'cambodia') messageType = 'cambodia';
        else if (queryType === 'portfolio') messageType = 'portfolio';
        else if (queryType === 'market') messageType = 'market';
        else if (queryType === 'anomaly') messageType = 'anomaly';
        else if (aiModel === 'dual') messageType = 'dual_ai';
        else if (contextUsed) messageType = 'context_enhanced';
        
        // Use your existing telegramSplitter functions
        const title = options.title || generateAITitle(aiModel, queryType);
        
        return await telegramSplitter.sendAnalysis(bot, chatId, optimizedResponse, title, messageType);
        
    } catch (error) {
        console.error('❌ AI response send error:', error.message);
        
        // Fallback to basic sending
        return await telegramSplitter.sendSmartMessage(bot, chatId, 
            `AI Response Error: ${error.message}`, {
                type: 'alert',
                title: 'AI System Error'
            });
    }
}

// 🏷️ RESPONSE METADATA BUILDER
function buildResponseMetadata(aiModel, queryType, tokenInfo, contextUsed, responseTime) {
    let metadata = `\n*AI: ${aiModel === 'gpt5' ? 'GPT-5' : aiModel === 'claude' ? 'Claude Opus 4.1' : aiModel}*`;
    
    if (queryType && queryType !== 'general') {
        metadata += ` | *Type: ${queryType}*`;
    }
    
    if (tokenInfo.tokens && tokenInfo.tokens > 1000) {
        metadata += ` | *Tokens: ${tokenInfo.tokens}*`;
    }
    
    if (contextUsed) {
        metadata += ` | *Context: Enhanced*`;
    }
    
    if (responseTime && responseTime > 1000) {
        metadata += ` | *Time: ${Math.round(responseTime / 1000)}s*`;
    }
    
    if (tokenInfo.wasTruncated) {
        metadata += ` | *Truncated: Yes*`;
    }
    
    return metadata;
}

// 🎯 AI TITLE GENERATOR
function generateAITitle(aiModel, queryType) {
    const aiName = aiModel === 'gpt5' ? 'GPT-5' : 
                   aiModel === 'claude' ? 'Claude Opus 4.1' : 
                   aiModel === 'dual' ? 'Dual AI' : 'AI';
    
    const typeMap = {
        'casual': 'Response',
        'market': 'Market Analysis',
        'regime': 'Economic Regime Analysis', 
        'portfolio': 'Portfolio Analysis',
        'cambodia': 'Cambodia Analysis',
        'anomaly': 'Market Anomaly Analysis',
        'strategic': 'Strategic Analysis',
        'memory_query': 'Memory Recall',
        'complex': 'Comprehensive Analysis'
    };
    
    return `${aiName} ${typeMap[queryType] || 'Analysis'}`;
}

// 📊 STRUCTURED DATA FORMATTER FOR AI
function formatAIStructuredData(data, format = 'readable') {
    if (!data || typeof data !== 'object') return data;
    
    if (format === 'readable') {
        // Convert JSON to human-readable format
        return JSON.stringify(data, null, 2)
            .replace(/[{}]/g, '')
            .replace(/"/g, '')
            .replace(/,\n/g, '\n')
            .replace(/^\s+/gm, '• ');
    }
    
    if (format === 'telegram') {
        // Format for Telegram display
        let formatted = '';
        
        Object.entries(data).forEach(([key, value]) => {
            const cleanKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
            const capitalizedKey = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);
            
            if (typeof value === 'object') {
                formatted += `**${capitalizedKey}:**\n`;
                Object.entries(value).forEach(([subKey, subValue]) => {
                    const cleanSubKey = subKey.replace(/_/g, ' ');
                    formatted += `• ${cleanSubKey}: ${subValue}\n`;
                });
                formatted += '\n';
            } else {
                formatted += `**${capitalizedKey}:** ${value}\n`;
            }
        });
        
        return formatted;
    }
    
    return data;
}

// 🔄 AI CONTEXT PRESERVATION
function preserveAIContext(message, context = {}) {
    let enhanced = message;
    
    // Add context markers that AI models can understand
    if (context.previousQuery) {
        enhanced = `[Previous: "${context.previousQuery.substring(0, 50)}..."]\\n${enhanced}`;
    }
    
    if (context.memory && context.memory.length > 0) {
        enhanced = `[Memory Context Available]\\n${enhanced}`;
    }
    
    if (context.timestamp) {
        const time = new Date(context.timestamp).toISOString();
        enhanced = `[Time: ${time}]\\n${enhanced}`;
    }
    
    if (context.aiModel) {
        enhanced = `[AI: ${context.aiModel}]\\n${enhanced}`;
    }
    
    return enhanced;
}

// 🧪 AI RESPONSE VALIDATOR
function validateAIResponse(response, expectedLength = null, requiredElements = []) {
    const validation = {
        isValid: true,
        issues: [],
        suggestions: []
    };
    
    // Basic validation
    if (!response || typeof response !== 'string') {
        validation.isValid = false;
        validation.issues.push('Response is empty or invalid');
        return validation;
    }
    
    // Length validation
    if (expectedLength && response.length < expectedLength * 0.5) {
        validation.issues.push('Response shorter than expected');
        validation.suggestions.push('Consider requesting more detailed analysis');
    }
    
    // Content validation
    requiredElements.forEach(element => {
        if (!response.toLowerCase().includes(element.toLowerCase())) {
            validation.issues.push(`Missing expected element: ${element}`);
        }
    });
    
    // AI hallucination checks
    const suspiciousPatterns = [
        /as an ai language model/gi,
        /i don't have access to real-time/gi,
        /i cannot provide/gi,
        /\[placeholder\]/gi,
        /\[insert.*\]/gi
    ];
    
    suspiciousPatterns.forEach(pattern => {
        if (pattern.test(response)) {
            validation.issues.push('Response contains AI limitation language');
            validation.suggestions.push('Consider refining the query or using different AI model');
        }
    });
    
    validation.isValid = validation.issues.length === 0;
    return validation;
}

// 📱 ENHANCED MESSAGE FUNCTIONS FOR YOUR AI SYSTEM

/**
 * Send GPT-5 response with optimization
 */
async function sendGPTResponse(bot, chatId, response, options = {}) {
    return await sendAIResponse(bot, chatId, response, {
        ...options,
        aiModel: 'gpt5'
    });
}

/**
 * Send Claude Opus 4.1 response with optimization  
 */
async function sendClaudeResponse(bot, chatId, response, options = {}) {
    return await sendAIResponse(bot, chatId, response, {
        ...options,
        aiModel: 'claude'
    });
}

/**
 * Send dual AI response
 */
async function sendDualAIResponse(bot, chatId, gptResponse, claudeResponse, options = {}) {
    const combinedResponse = `**GPT-5 Analysis:**\n${gptResponse}\n\n**Claude Opus 4.1 Analysis:**\n${claudeResponse}`;
    
    return await sendAIResponse(bot, chatId, combinedResponse, {
        ...options,
        aiModel: 'dual',
        title: 'Dual AI Analysis'
    });
}

/**
 * Send memory-enhanced response
 */
async function sendMemoryResponse(bot, chatId, response, memoryContext, options = {}) {
    return await sendAIResponse(bot, chatId, response, {
        ...options,
        queryType: 'memory_query',
        contextUsed: !!memoryContext,
        title: 'Memory-Enhanced Response'
    });
}

/**
 * Send strategic analysis with full context
 */
async function sendStrategicAnalysis(bot, chatId, analysis, options = {}) {
    return await sendAIResponse(bot, chatId, analysis, {
        ...options,
        queryType: 'strategic',
        includeMetadata: true,
        title: 'Strategic Commander Analysis'
    });
}

// 📊 AI SYSTEM STATISTICS
function getAIMessageStats(response, aiModel) {
    const stats = telegramSplitter.getMessageStats(response);
    
    return {
        ...stats,
        aiModel: aiModel,
        estimatedTokens: Math.ceil(response.length / 4),
        aiOptimized: true,
        complexity: response.length > 2000 ? 'high' : response.length > 800 ? 'medium' : 'low'
    };
}

// 📤 MODULE EXPORTS
module.exports = {
    // Enhanced AI sending functions
    sendAIResponse,
    sendGPTResponse,
    sendClaudeResponse,
    sendDualAIResponse,
    sendMemoryResponse,
    sendStrategicAnalysis,
    
    // AI optimization functions
    optimizeAIResponse,
    manageAITokens,
    formatAIStructuredData,
    preserveAIContext,
    validateAIResponse,
    
    // Utility functions
    generateAITitle,
    buildResponseMetadata,
    findAITruncationPoint,
    getAIMessageStats,
    
    // Enhanced message types
    AI_MESSAGE_TYPES,
    
    // Re-export your original functions for convenience
    ...telegramSplitter
};

console.log('✅ Telegram AI Enhancements loaded');
console.log('🤖 GPT-5 + Claude Opus 4.1 optimization active');
console.log('🎯 Works with your existing telegramSplitter.js');
console.log('');
console.log('Usage:');
console.log('  await sendGPTResponse(bot, chatId, gptResponse);');
console.log('  await sendClaudeResponse(bot, chatId, claudeResponse);');
console.log('  await sendDualAIResponse(bot, chatId, gpt, claude);');
