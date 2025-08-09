// utils/openaiClient.js - Strategic Commander Enhanced (OPTIMIZED)
require("dotenv").config();
const { OpenAI } = require("openai");

// ✅ Single OpenAI client instance for entire application
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 300000, // 5 minutes - Extended timeout for comprehensive responses
    maxRetries: 3
});

// 🔍 Debug OpenAI configuration
console.log("🔧 OpenAI Client Configuration:");
console.log(`   API Key: ${process.env.OPENAI_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   Timeout: 300 seconds`);
console.log(`   Max Retries: 3`);

/**
 * 🎯 Strategic Commander GPT-4o Response with Institutional Authority
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
            // General GPT-4o mode for non-strategic queries
            systemContent = `You are GPT-4o (Omni) - OpenAI's most advanced multimodal AI with superior intelligence. Provide comprehensive, helpful responses across all knowledge domains while maintaining professional expertise.`;
        }

        console.log(`🎯 Making Strategic Commander API call (${useStrategicMode ? 'Strategic' : 'General'} mode)`);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // ✅ Verified correct model
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
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 16384, // Full capacity for comprehensive responses
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const response = completion.choices[0].message.content.trim();
        console.log(`✅ Strategic Commander response generated (${response.length} characters, ${completion.usage?.total_tokens || 'unknown'} tokens)`);
        
        return response;
    } catch (error) {
        console.error("❌ Strategic Commander API ERROR:", error.message);
        
        // Enhanced error handling
        if (error.message.includes('model')) {
            throw new Error(`Strategic Commander Model Error: ${error.message}. Verify GPT-4o access.`);
        } else if (error.message.includes('API key')) {
            throw new Error(`Strategic Commander API Key Error: Check OPENAI_API_KEY environment variable.`);
        } else if (error.message.includes('timeout')) {
            throw new Error(`Strategic Commander Timeout: Response took too long. Try a shorter query.`);
        } else {
            throw new Error(`Strategic Commander API Error: ${error.message}`);
        }
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
            enhancedQuery = `🔴 CURRENT STRATEGIC MARKET CONTEXT:
- Fed Rate: ${marketData.fedRate || 'N/A'}%
- VIX Fear Index: ${marketData.vix || 'N/A'}
- 10Y Treasury Yield: ${marketData.yield10Y || 'N/A'}%
- S&P 500: ${marketData.sp500 || 'N/A'}
- Dollar Index: ${marketData.dollar || 'N/A'}
- Bitcoin: ${marketData.bitcoin || 'N/A'}

🎯 STRATEGIC ANALYSIS REQUEST: ${query}

Execute comprehensive institutional-grade analysis with specific actionable recommendations.`;
        }

        return await getGptReply(enhancedQuery, { 
            strategic: true, 
            maxTokens: 16384,
            temperature: 0.7 
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
        let enhancedQuery = `🇰🇭 CAMBODIA PRIVATE LENDING FUND - STRATEGIC ANALYSIS

${dealData ? `📊 DEAL PARAMETERS:
- Amount: $${dealData.amount?.toLocaleString() || 'TBD'}
- Type: ${dealData.type || 'Commercial'}
- Location: ${dealData.location || 'Phnom Penh'}
- Interest Rate: ${dealData.rate || 'TBD'}%
- Term: ${dealData.term || 'TBD'} months
- LTV: ${dealData.ltv || '70'}%
` : ''}

🎯 STRATEGIC ANALYSIS REQUEST: ${dealQuery}

Execute institutional-grade Cambodia lending analysis including:
- Risk assessment and mitigation strategies
- Local market conditions and timing analysis
- Currency and political risk evaluation
- Comparative yield analysis vs global alternatives
- Portfolio correlation and diversification impact
- Specific deal structuring recommendations
- Exit strategies and liquidity considerations

Provide definitive strategic commands with exact execution parameters.`;

        return await getGptReply(enhancedQuery, { 
            strategic: true, 
            maxTokens: 16384,
            temperature: 0.6 // Slightly lower for financial analysis
        });
    } catch (error) {
        console.error("❌ Cambodia Fund Analysis Error:", error.message);
        throw error;
    }
}

/**
 * 🖼️ Vision Analysis - For image processing with Strategic Commander
 * @param {string} base64Image - Base64 encoded image
 * @param {string} prompt - Analysis prompt
 * @param {object} options - Additional options
 * @returns {Promise<string>} - Strategic image analysis
 */
async function getVisionAnalysis(base64Image, prompt, options = {}) {
    try {
        console.log("🖼️ Strategic Commander Vision Analysis starting...");
        
        const strategicPrompt = `As Strategic Commander of IMPERIUM VAULT SYSTEM, analyze this image with institutional expertise.

${prompt}

Execute comprehensive strategic analysis focusing on:
- Financial data, charts, or market information if present
- Strategic documents or investment materials
- Economic indicators or market signals
- Investment opportunities or risks
- Any strategic intelligence relevant to portfolio management

Provide detailed institutional-grade assessment with actionable strategic insights.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Vision-capable model
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander providing institutional-quality vision analysis. Focus on financial, strategic, and investment insights from visual content."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: strategicPrompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: options.detail || "high"
                            }
                        }
                    ],
                },
            ],
            max_tokens: options.maxTokens || 4096,
            temperature: options.temperature || 0.7
        });

        const analysis = completion.choices[0].message.content;
        console.log(`✅ Strategic Commander Vision Analysis complete (${analysis.length} characters)`);
        
        return analysis;
        
    } catch (error) {
        console.error("❌ Strategic Commander Vision Error:", error.message);
        
        if (error.message.includes('model')) {
            throw new Error(`Vision Model Error: ${error.message}. Verify GPT-4o vision access.`);
        } else {
            throw new Error(`Vision Analysis Error: ${error.message}`);
        }
    }
}

/**
 * 🎤 Audio Transcription - For voice processing
 * @param {ReadableStream} audioFile - Audio file stream
 * @returns {Promise<string>} - Transcribed text
 */
async function getAudioTranscription(audioFile) {
    try {
        console.log("🎤 Strategic Commander Audio Transcription starting...");
        
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: "en", // Optimize for English
            temperature: 0.0 // More accurate transcription
        });

        console.log(`✅ Audio transcription complete: "${transcription.text}"`);
        return transcription.text;
        
    } catch (error) {
        console.error("❌ Audio Transcription Error:", error.message);
        throw new Error(`Audio Transcription Error: ${error.message}`);
    }
}

/**
 * 🔧 General Query Handler - Non-strategic mode
 * @param {string} prompt - General question
 * @returns {Promise<string>} - Standard GPT-4o response
 */
async function getGeneralReply(prompt) {
    return await getGptReply(prompt, { strategic: false });
}

/**
 * 🔍 Test OpenAI Connection
 * @returns {Promise<boolean>} - Connection status
 */
async function testConnection() {
    try {
        console.log("🔍 Testing Strategic Commander OpenAI connection...");
        
        const testResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a test assistant."
                },
                {
                    role: "user",
                    content: "Respond with 'Strategic Commander OpenAI connection successful' if you receive this message."
                }
            ],
            max_tokens: 50,
            temperature: 0
        });

        const response = testResponse.choices[0].message.content;
        console.log("✅ OpenAI connection test result:", response);
        
        return response.includes("successful");
        
    } catch (error) {
        console.error("❌ OpenAI connection test failed:", error.message);
        return false;
    }
}

// Export the single OpenAI client for use in other modules
module.exports = {
    // Main client instance
    openai, // ✅ Export the client for other modules to use
    
    // Strategic Commander functions
    getGptReply,
    getStrategicAnalysis,
    getCambodiaFundAnalysis,
    getGeneralReply,
    
    // Multimodal functions
    getVisionAnalysis,
    getAudioTranscription,
    
    // Utility functions
    testConnection
};
