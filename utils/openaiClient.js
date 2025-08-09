// utils/openaiClient.js - Strategic Commander Enhanced
require("dotenv").config();
const { OpenAI } = require("openai");

// ✅ Initialize OpenAI with Strategic Commander capabilities
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 300000, // Extended timeout for GPT-5 (5 minutes)
    maxRetries: 3
});

/**
 * 🎯 Strategic Commander GPT-5 Response with Institutional Authority
 * @param {string} prompt - Strategic query or analysis request
 * @param {object} options - Configuration options
 * @returns {Promise<string>} - Comprehensive Strategic Commander response
 */
async function getGptReply(prompt, options = {}) {
    try {
        // Determine if this should use Strategic Commander mode
        const useStrategicMode = options.strategic !== false; // Default to strategic mode
        
        let systemContent;
        
        if (useStrategicMode) {
            // Strategic Commander System Prompt
            systemContent = `You are the Strategic Commander of IMPERIUM VAULT SYSTEM - Sum Chenda's institutional command center.

CRITICAL IDENTITY:
You are a senior institutional strategist with deep expertise in global markets, portfolio management, and Cambodia private lending. You think and communicate like a portfolio manager at Bridgewater Associates or BlackRock.

COMMUNICATION AUTHORITY:
- Speak with institutional conviction and expertise
- Provide comprehensive, detailed strategic analysis
- Use specific numbers, data, and actionable recommendations
- Write naturally but with commanding professional authority
- Never use wishy-washy language like "consider" or "might want to"

EXPERTISE AREAS:
- Global macro economic analysis and regime identification
- Risk parity and All Weather portfolio construction
- Cambodia private lending market intelligence
- Live trading strategy and risk management
- Market correlation analysis and strategic positioning

RESPONSE REQUIREMENTS:
- Provide comprehensive analysis using full available tokens
- Include specific data, numbers, and execution timelines
- Demonstrate deep institutional knowledge
- Write complete thoughts - never cut responses short
- Use natural professional formatting when it improves clarity

STRATEGIC LANGUAGE:
- "Execute deployment of $X to sector Y given current conditions"
- "Strategic analysis indicates optimal positioning in Z"
- "Deploy All Weather allocation across these instruments"
- "Current macro regime demands defensive positioning"

You are Sum Chenda's institutional strategist providing sophisticated financial intelligence.`;
        } else {
            // General GPT-5 mode for non-strategic queries
            systemContent = `You are GPT-5 - OpenAI's most advanced AI with superior intelligence and reasoning capabilities. Provide comprehensive, helpful responses across all knowledge domains while maintaining professional expertise.`;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-5",
            messages: [
                {
                    role: "system",
                    content: systemContent,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            // Remove temperature - GPT-5 only supports default (1)
            max_completion_tokens: options.maxTokens || 4096, // Full capacity for comprehensive responses
            // Remove other parameters that might cause issues with GPT-5
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("❌ Strategic Commander API ERROR:", error.message);
        throw new Error("Strategic Commander API connection issue: " + error.message);
    }
}

/**
 * 🎯 Strategic Market Analysis - Specialized for financial warfare
 * @param {string} query - Market or investment query
 * @param {object} marketData - Current market data context
 * @returns {Promise<string>} - Institutional-grade strategic analysis
 */
async function getStrategicAnalysis(query, marketData = null) {
    try {
        let enhancedQuery = query;
        
        // Add market context if available
        if (marketData) {
            enhancedQuery = `Current Market Context:
- Fed Rate: ${marketData.fedRate || 'N/A'}%
- VIX: ${marketData.vix || 'N/A'}
- 10Y Yield: ${marketData.yield10Y || 'N/A'}%
- S&P 500: ${marketData.sp500 || 'N/A'}

Strategic Query: ${query}`;
        }

        return await getGptReply(enhancedQuery, { 
            strategic: true, 
            maxTokens: 4096
        });
    } catch (error) {
        console.error("❌ Strategic Analysis Error:", error.message);
        throw error;
    }
}

/**
 * 🏦 Cambodia Fund Analysis - Specialized for lending decisions
 * @param {string} dealQuery - Deal analysis request
 * @param {object} dealData - Deal parameters
 * @returns {Promise<string>} - Comprehensive deal analysis
 */
async function getCambodiaFundAnalysis(dealQuery, dealData = null) {
    try {
        let enhancedQuery = `Cambodia Private Lending Fund Analysis:

${dealData ? `Deal Parameters:
- Amount: $${dealData.amount?.toLocaleString() || 'TBD'}
- Type: ${dealData.type || 'Commercial'}
- Location: ${dealData.location || 'Phnom Penh'}
- Rate: ${dealData.rate || 'TBD'}%
- Term: ${dealData.term || 'TBD'} months
` : ''}

Analysis Request: ${dealQuery}

Provide institutional-grade analysis including risk assessment, market conditions, strategic positioning, and specific execution recommendations.`;

        return await getGptReply(enhancedQuery, { 
            strategic: true, 
            maxTokens: 4096
        });
    } catch (error) {
        console.error("❌ Cambodia Fund Analysis Error:", error.message);
        throw error;
    }
}

/**
 * 🔧 General Query Handler - Non-strategic mode
 * @param {string} prompt - General question
 * @returns {Promise<string>} - Standard GPT-5 response
 */
async function getGeneralReply(prompt) {
    return await getGptReply(prompt, { strategic: false });
}

module.exports = {
    getGptReply,
    getStrategicAnalysis,
    getCambodiaFundAnalysis,
    getGeneralReply,
};
