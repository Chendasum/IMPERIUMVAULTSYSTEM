// utils/dualCommandSystem.js - STRATEGIC DUAL COMMAND ARCHITECTURE
const { getGptReply, getStrategicAnalysis } = require('./openaiClient');
const { sendSmartResponse, cleanStrategicResponse } = require('./telegramSplitter');
const { buildStrategicCommanderContext } = require('./contextEnhancer');
const axios = require('axios');

// 🏛️ DUAL COMMAND SYSTEM CONFIGURATION
const COMMAND_CONFIG = {
    // GPT-4o Strategic Commander (Multimodal + Institutional Analysis)
    GPT_COMMANDER: {
        name: 'Strategic Commander Alpha',
        model: 'gpt-4o',
        specialties: ['multimodal', 'voice', 'images', 'documents', 'institutional_analysis'],
        emoji: '🏛️',
        priority: 'institutional'
    },
    
    // Claude Sonnet 4 (Live Intelligence + Research + Complex Analysis)
    CLAUDE_INTELLIGENCE: {
        name: 'Strategic Intelligence Chief',
        model: 'claude-sonnet-4',
        specialties: ['live_data', 'research', 'complex_analysis', 'real_time_intelligence'],
        emoji: '⚡',
        priority: 'intelligence'
    }
};

/**
 * 🎯 STRATEGIC COMMAND ROUTER
 * Routes queries to optimal AI system based on strategic requirements
 */
function routeStrategicCommand(userMessage, messageType = 'text', hasMedia = false) {
    const message = userMessage.toLowerCase();
    
    // Force GPT-4o for multimodal content
    if (hasMedia || messageType !== 'text') {
        return {
            primary: 'GPT_COMMANDER',
            secondary: null,
            reasoning: 'Multimodal content requires GPT-4o capabilities'
        };
    }
    
    // Analyze strategic requirements
    const requiresLiveData = /current|latest|recent|today|now|real.?time|breaking|news/.test(message);
    const requiresResearch = /research|analyze|compare|investigate|study|examine/.test(message);
    const requiresComplexAnalysis = /strategy|forecast|scenario|correlation|optimization|model/.test(message);
    const requiresInstitutional = /portfolio|allocation|deploy|execute|risk|performance/.test(message);
    const requiresCambodia = /cambodia|deal|lending|fund/.test(message);
    
    // Strategic routing logic
    if (requiresLiveData || requiresResearch) {
        return {
            primary: 'CLAUDE_INTELLIGENCE',
            secondary: requiresInstitutional ? 'GPT_COMMANDER' : null,
            reasoning: 'Live intelligence and research capabilities required'
        };
    }
    
    if (requiresComplexAnalysis && !requiresInstitutional) {
        return {
            primary: 'CLAUDE_INTELLIGENCE',
            secondary: null,
            reasoning: 'Complex analysis requires Claude\'s superior reasoning'
        };
    }
    
    if (requiresCambodia && requiresLiveData) {
        return {
            primary: 'CLAUDE_INTELLIGENCE',
            secondary: 'GPT_COMMANDER',
            reasoning: 'Cambodia fund analysis with live market intelligence'
        };
    }
    
    if (requiresInstitutional) {
        return {
            primary: 'GPT_COMMANDER',
            secondary: requiresLiveData ? 'CLAUDE_INTELLIGENCE' : null,
            reasoning: 'Institutional analysis requires Strategic Commander expertise'
        };
    }
    
    // Default: Use Claude for superior reasoning, GPT for institutional context
    return {
        primary: 'CLAUDE_INTELLIGENCE',
        secondary: 'GPT_COMMANDER',
        reasoning: 'Hybrid analysis for comprehensive strategic intelligence'
    };
}

/**
 * 🏛️ GPT-4O STRATEGIC COMMANDER HANDLER
 */
async function executeGptCommand(userMessage, chatId, context) {
    try {
        console.log('🏛️ Executing GPT-4o Strategic Commander...');
        
        // Build comprehensive context for institutional analysis
        const strategicContext = context || await buildStrategicCommanderContext(chatId, userMessage);
        
        // Execute Strategic Commander analysis
        const response = await getStrategicAnalysis(userMessage, {
            context: strategicContext,
            mode: 'institutional',
            maxTokens: 16384
        });
        
        return {
            response: cleanStrategicResponse(response),
            commander: 'GPT Strategic Commander Alpha',
            emoji: '🏛️',
            capabilities: 'Institutional Analysis + Multimodal Intelligence'
        };
        
    } catch (error) {
        console.error('❌ GPT Strategic Commander error:', error.message);
        throw new Error(`Strategic Commander Alpha Error: ${error.message}`);
    }
}

/**
 * ⚡ CLAUDE STRATEGIC INTELLIGENCE HANDLER
 */
async function executeClaudeIntelligence(userMessage, chatId, context) {
    try {
        console.log('⚡ Executing Claude Strategic Intelligence Chief...');
        
        // Note: This is a placeholder for Claude API integration
        // You'll need to implement actual Claude API calls here
        
        const claudeResponse = await callClaudeAPI(userMessage, {
            context: context,
            mode: 'strategic_intelligence',
            enable_search: true,
            enable_research: true
        });
        
        return {
            response: claudeResponse,
            commander: 'Claude Strategic Intelligence Chief',
            emoji: '⚡',
            capabilities: 'Live Intelligence + Research + Complex Analysis'
        };
        
    } catch (error) {
        console.error('❌ Claude Strategic Intelligence error:', error.message);
        throw new Error(`Strategic Intelligence Chief Error: ${error.message}`);
    }
}

/**
 * 🔗 CLAUDE API INTEGRATION (FULLY IMPLEMENTED)
 * Live Claude Strategic Intelligence Chief integration
 */
const { getClaudeStrategicAnalysis, getClaudeLiveResearch, getClaudeComplexAnalysis, getClaudeCambodiaIntelligence } = require('./claudeClient');

async function callClaudeAPI(message, options = {}) {
    try {
        console.log('⚡ Executing Claude Strategic Intelligence Chief...');
        
        // Determine analysis type based on options and message content
        const messageContent = message.toLowerCase();
        
        // Route to specialized Claude functions based on content
        if (options.mode === 'cambodia' || messageContent.includes('cambodia') || messageContent.includes('lending') || messageContent.includes('fund')) {
            return await getClaudeCambodiaIntelligence(message, options.dealData, options);
        }
        
        if (options.mode === 'research' || messageContent.includes('research') || messageContent.includes('current') || messageContent.includes('latest')) {
            return await getClaudeLiveResearch(message, options);
        }
        
        if (options.mode === 'complex' || messageContent.includes('analysis') || messageContent.includes('scenario') || messageContent.includes('correlation')) {
            const factors = options.factors || [];
            return await getClaudeComplexAnalysis(message, factors, options);
        }
        
        // Default to comprehensive strategic analysis
        return await getClaudeStrategicAnalysis(message, options);
        
    } catch (error) {
        console.error('❌ Claude Strategic Intelligence error:', error.message);
        throw new Error(`Strategic Intelligence Chief Error: ${error.message}`);
    }
}

/**
 * 🎯 DUAL COMMAND EXECUTION ENGINE
 */
async function executeDualCommand(userMessage, chatId, messageType = 'text', hasMedia = false) {
    try {
        console.log('🎯 Executing Dual Command Strategic Analysis...');
        
        // Route strategic command
        const routing = routeStrategicCommand(userMessage, messageType, hasMedia);
        console.log('📊 Strategic routing:', routing);
        
        // Build strategic context
        const context = await buildStrategicCommanderContext(chatId, userMessage);
        
        let primaryResponse, secondaryResponse;
        
        // Execute primary command
        if (routing.primary === 'GPT_COMMANDER') {
            primaryResponse = await executeGptCommand(userMessage, chatId, context);
        } else {
            primaryResponse = await executeClaudeIntelligence(userMessage, chatId, context);
        }
        
        // Execute secondary command if needed
        if (routing.secondary) {
            try {
                if (routing.secondary === 'GPT_COMMANDER') {
                    secondaryResponse = await executeGptCommand(userMessage, chatId, context);
                } else {
                    secondaryResponse = await executeClaudeIntelligence(userMessage, chatId, context);
                }
            } catch (secondaryError) {
                console.log('⚠️ Secondary command failed:', secondaryError.message);
                secondaryResponse = null;
            }
        }
        
        // Combine responses if dual analysis
        let finalResponse = primaryResponse.response;
        
        if (secondaryResponse) {
            finalResponse = `${primaryResponse.emoji} **${primaryResponse.commander.toUpperCase()}**
${primaryResponse.capabilities}

${primaryResponse.response}

---

${secondaryResponse.emoji} **${secondaryResponse.commander.toUpperCase()}**
${secondaryResponse.capabilities}

${secondaryResponse.response}

---

🎯 **STRATEGIC COMMAND SYNTHESIS**
Combined intelligence from dual AI warfare systems for comprehensive strategic advantage.`;
        } else {
            finalResponse = `${primaryResponse.emoji} **${primaryResponse.commander.toUpperCase()}**
${primaryResponse.capabilities}

${primaryResponse.response}`;
        }
        
        return {
            response: finalResponse,
            routing: routing,
            primaryCommander: routing.primary,
            secondaryCommander: routing.secondary,
            success: true
        };
        
    } catch (error) {
        console.error('❌ Dual Command execution error:', error.message);
        
        // Fallback to single GPT-4o command
        try {
            console.log('🔄 Falling back to GPT Strategic Commander...');
            const fallbackResponse = await executeGptCommand(userMessage, chatId);
            
            return {
                response: `🏛️ **STRATEGIC COMMANDER ALPHA (FALLBACK MODE)**

${fallbackResponse.response}

⚠️ **Note:** Dual command system temporarily unavailable. Operating in single-commander mode.`,
                routing: { primary: 'GPT_COMMANDER', secondary: null, reasoning: 'Fallback mode' },
                primaryCommander: 'GPT_COMMANDER',
                secondaryCommander: null,
                success: false,
                error: error.message
            };
            
        } catch (fallbackError) {
            throw new Error(`Dual Command System Failure: ${error.message}`);
        }
    }
}

/**
 * 📊 COMMAND SYSTEM ANALYTICS
 */
function getDualCommandAnalytics() {
    return {
        gptCommands: 0, // TODO: Implement counters
        claudeCommands: 0,
        dualCommands: 0,
        totalCommands: 0,
        averageResponseTime: 0,
        systemUptime: process.uptime(),
        lastUpdate: new Date().toISOString()
    };
}

/**
 * 🔧 SYSTEM HEALTH CHECK
 */
async function checkDualCommandHealth() {
    const health = {
        gptCommander: false,
        claudeIntelligence: false,
        dualSystem: false,
        errors: []
    };
    
    // Test GPT-4o Strategic Commander
    try {
        await getGptReply('System health check', { strategic: true, maxTokens: 100 });
        health.gptCommander = true;
        console.log('✅ GPT Strategic Commander operational');
    } catch (gptError) {
        health.errors.push(`GPT Commander: ${gptError.message}`);
        console.log('❌ GPT Strategic Commander unavailable');
    }
    
    // Test Claude Strategic Intelligence
    try {
        await callClaudeAPI('System health check', { mode: 'test' });
        health.claudeIntelligence = true;
        console.log('✅ Claude Strategic Intelligence operational');
    } catch (claudeError) {
        health.errors.push(`Claude Intelligence: ${claudeError.message}`);
        console.log('❌ Claude Strategic Intelligence unavailable');
    }
    
    health.dualSystem = health.gptCommander && health.claudeIntelligence;
    
    return health;
}

module.exports = {
    // 🎯 DUAL COMMAND CORE FUNCTIONS
    executeDualCommand,
    routeStrategicCommand,
    
    // 🏛️ INDIVIDUAL COMMAND FUNCTIONS
    executeGptCommand,
    executeClaudeIntelligence,
    
    // 🔧 SYSTEM MANAGEMENT
    checkDualCommandHealth,
    getDualCommandAnalytics,
    
    // 📊 CONFIGURATION
    COMMAND_CONFIG,
    
    // 🔗 API INTEGRATION (for implementation)
    callClaudeAPI
};
