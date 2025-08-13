// 🔧 PART 3: COMPLETE FIXED utils/openaiClient.js - GPT-5 + Enhanced Parameters
// Replace your entire utils/openaiClient.js file with this working version

const { OpenAI } = require("openai");

// Initialize OpenAI with proper configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000,
    maxRetries: 3
});

/**
 * 🔧 FIXED: Main GPT Analysis Function with Correct Parameters
 */
async function getGptAnalysis(query, options = {}) {
    try {
        console.log(`🤖 GPT-5 Analysis Request: ${query.substring(0, 100)}...`);
        
        const response = await openai.chat.completions.create({
            model: options.model || "gpt-5",  // Your GPT-5 model
            messages: [
                {
                    role: "system",
                    content: options.systemPrompt || "You are the Strategic Commander of IMPERIUM VAULT SYSTEM providing institutional-quality analysis and strategic intelligence. Provide comprehensive, actionable insights with commanding authority."
                },
                {
                    role: "user", 
                    content: query
                }
            ],
            max_completion_tokens: options.max_completion_tokens || options.maxTokens || 1500,  // 🔧 FIXED: Correct parameter
            temperature: options.temperature || 0.7,
            presence_penalty: options.presence_penalty || 0,
            frequency_penalty: options.frequency_penalty || 0,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content || "No response generated";
        console.log(`✅ GPT-5 Analysis Complete: ${result.length} characters`);
        
        return result;
        
    } catch (error) {
        console.error("❌ GPT-5 Analysis Error:", error.message);
        
        // Enhanced error handling with fallbacks
        if (error.message.includes('gpt-5') || error.message.includes('model')) {
            console.log("🔄 GPT-5 unavailable, falling back to GPT-4...");
            return await getGptAnalysisWithFallback(query, options);
        }
        
        throw new Error(`GPT-5 analysis failed: ${error.message}`);
    }
}

/**
 * 🔧 FALLBACK: GPT-4 Analysis Function
 */
async function getGptAnalysisWithFallback(query, options = {}) {
    try {
        console.log("🔄 Using GPT-4 fallback...");
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o",  // Stable fallback model
            messages: [
                {
                    role: "system",
                    content: options.systemPrompt || "You are the Strategic Commander providing institutional-quality analysis."
                },
                {
                    role: "user", 
                    content: query
                }
            ],
            max_completion_tokens: options.max_completion_tokens || options.maxTokens || 1500,  // 🔧 FIXED
            temperature: options.temperature || 0.7,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content || "No response generated";
        return `**GPT-4 Analysis** (GPT-5 unavailable)\n\n${result}`;
        
    } catch (fallbackError) {
        console.error("❌ GPT-4 Fallback Error:", fallbackError.message);
        throw new Error(`Both GPT-5 and GPT-4 failed: ${fallbackError.message}`);
    }
}

/**
 * 📊 ENHANCED: Market Analysis Function
 */
async function getMarketAnalysis(query, options = {}) {
    try {
        console.log("📊 GPT-5 Market Analysis Request...");
        
        const enhancedPrompt = `As Strategic Commander of IMPERIUM VAULT SYSTEM, provide comprehensive market analysis:

${query}

Focus on:
- Current market conditions and trends
- Economic indicators and their implications
- Strategic investment opportunities
- Risk factors and mitigation strategies
- Actionable trading insights
- Portfolio positioning recommendations

Execute institutional-grade market intelligence analysis.`;

        const response = await openai.chat.completions.create({
            model: options.model || "gpt-5",
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander specializing in market analysis and investment strategy. Provide precise, actionable market intelligence with institutional authority."
                },
                {
                    role: "user",
                    content: enhancedPrompt
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 1800,  // 🔧 FIXED
            temperature: options.temperature || 0.6,  // Slightly lower for market analysis
            stream: false
        });
        
        const result = response.choices[0]?.message?.content || "Market analysis unavailable";
        console.log(`✅ GPT-5 Market Analysis Complete: ${result.length} characters`);
        
        return result;
        
    } catch (error) {
        console.error("❌ Market Analysis Error:", error.message);
        
        // Fallback for market analysis
        if (error.message.includes('gpt-5')) {
            return await getMarketAnalysisWithFallback(query, options);
        }
        
        throw new Error(`Market analysis failed: ${error.message}`);
    }
}

/**
 * 📊 FALLBACK: Market Analysis with GPT-4
 */
async function getMarketAnalysisWithFallback(query, options = {}) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a market analysis expert providing institutional-quality insights."
                },
                {
                    role: "user",
                    content: `Provide comprehensive market analysis: ${query}`
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 1800,  // 🔧 FIXED
            temperature: 0.6,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content;
        return `**GPT-4 Market Analysis** (GPT-5 unavailable)\n\n${result}`;
        
    } catch (fallbackError) {
        throw new Error(`Market analysis fallback failed: ${fallbackError.message}`);
    }
}

/**
 * 🇰🇭 ENHANCED: Cambodia Analysis Function
 */
async function getCambodiaAnalysis(query, options = {}) {
    try {
        console.log("🇰🇭 GPT-5 Cambodia Analysis Request...");
        
        const cambodiaPrompt = `As Strategic Commander of IMPERIUM VAULT SYSTEM with expertise in Cambodia markets, analyze:

${query}

Provide strategic analysis covering:
- Cambodia economic environment and market conditions
- Real estate and lending market dynamics
- Investment opportunities and risk assessment
- Regulatory environment and compliance considerations
- Currency stability and economic indicators
- Strategic recommendations for Cambodia operations

Execute institutional-grade Cambodia market intelligence.`;

        const response = await openai.chat.completions.create({
            model: options.model || "gpt-5",
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander with deep expertise in Cambodia markets, real estate, and investment opportunities. Provide authoritative analysis of Cambodian business environment."
                },
                {
                    role: "user",
                    content: cambodiaPrompt
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 1600,  // 🔧 FIXED
            temperature: options.temperature || 0.65,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content || "Cambodia analysis unavailable";
        console.log(`✅ GPT-5 Cambodia Analysis Complete: ${result.length} characters`);
        
        return result;
        
    } catch (error) {
        console.error("❌ Cambodia Analysis Error:", error.message);
        
        if (error.message.includes('gpt-5')) {
            return await getCambodiaAnalysisWithFallback(query, options);
        }
        
        throw new Error(`Cambodia analysis failed: ${error.message}`);
    }
}

/**
 * 🇰🇭 FALLBACK: Cambodia Analysis with GPT-4
 */
async function getCambodiaAnalysisWithFallback(query, options = {}) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in Cambodia markets and investment opportunities."
                },
                {
                    role: "user",
                    content: `Provide comprehensive Cambodia market analysis: ${query}`
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 1600,  // 🔧 FIXED
            temperature: 0.65,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content;
        return `**GPT-4 Cambodia Analysis** (GPT-5 unavailable)\n\n${result}`;
        
    } catch (fallbackError) {
        throw new Error(`Cambodia analysis fallback failed: ${fallbackError.message}`);
    }
}

/**
 * 📈 ENHANCED: Strategic Analysis Function
 */
async function getStrategicAnalysis(query, options = {}) {
    try {
        console.log("📈 GPT-5 Strategic Analysis Request...");
        
        const strategicPrompt = `As Strategic Commander of IMPERIUM VAULT SYSTEM, provide comprehensive strategic analysis:

${query}

Execute strategic intelligence focusing on:
- Strategic opportunities and competitive advantages
- Risk assessment and mitigation strategies
- Market positioning and competitive analysis
- Resource allocation and portfolio optimization
- Scenario planning and strategic recommendations
- Implementation roadmap and success metrics

Provide institutional-grade strategic intelligence with commanding authority.`;

        const response = await openai.chat.completions.create({
            model: options.model || "gpt-5",
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander providing institutional-quality strategic analysis. Focus on strategic opportunities, competitive intelligence, and actionable recommendations with commanding authority."
                },
                {
                    role: "user",
                    content: strategicPrompt
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 2000,  // 🔧 FIXED
            temperature: options.temperature || 0.7,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content || "Strategic analysis unavailable";
        console.log(`✅ GPT-5 Strategic Analysis Complete: ${result.length} characters`);
        
        return result;
        
    } catch (error) {
        console.error("❌ Strategic Analysis Error:", error.message);
        
        if (error.message.includes('gpt-5')) {
            return await getStrategicAnalysisWithFallback(query, options);
        }
        
        throw new Error(`Strategic analysis failed: ${error.message}`);
    }
}

/**
 * 📈 FALLBACK: Strategic Analysis with GPT-4
 */
async function getStrategicAnalysisWithFallback(query, options = {}) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a strategic analysis expert providing institutional-quality insights."
                },
                {
                    role: "user",
                    content: `Provide comprehensive strategic analysis: ${query}`
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 2000,  // 🔧 FIXED
            temperature: 0.7,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content;
        return `**GPT-4 Strategic Analysis** (GPT-5 unavailable)\n\n${result}`;
        
    } catch (fallbackError) {
        throw new Error(`Strategic analysis fallback failed: ${fallbackError.message}`);
    }
}

/**
 * 💬 ENHANCED: Conversational Analysis Function
 */
async function getConversationalAnalysis(query, options = {}) {
    try {
        console.log("💬 GPT-5 Conversational Analysis Request...");
        
        const response = await openai.chat.completions.create({
            model: options.model || "gpt-5",
            messages: [
                {
                    role: "system",
                    content: options.systemPrompt || "You are the Strategic Commander of IMPERIUM VAULT SYSTEM providing helpful, intelligent responses with institutional expertise. Be conversational yet authoritative."
                },
                {
                    role: "user",
                    content: query
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 1200,  // 🔧 FIXED
            temperature: options.temperature || 0.8,  // Higher for conversational
            stream: false
        });
        
        const result = response.choices[0]?.message?.content || "Response unavailable";
        console.log(`✅ GPT-5 Conversational Analysis Complete: ${result.length} characters`);
        
        return result;
        
    } catch (error) {
        console.error("❌ Conversational Analysis Error:", error.message);
        
        if (error.message.includes('gpt-5')) {
            return await getConversationalAnalysisWithFallback(query, options);
        }
        
        throw new Error(`Conversational analysis failed: ${error.message}`);
    }
}

/**
 * 💬 FALLBACK: Conversational Analysis with GPT-4
 */
async function getConversationalAnalysisWithFallback(query, options = {}) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant providing intelligent, conversational responses."
                },
                {
                    role: "user",
                    content: query
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 1200,  // 🔧 FIXED
            temperature: 0.8,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content;
        return `**GPT-4 Response** (GPT-5 unavailable)\n\n${result}`;
        
    } catch (fallbackError) {
        throw new Error(`Conversational analysis fallback failed: ${fallbackError.message}`);
    }
}

/**
 * 🎯 ENHANCED: Quick Response Function
 */
async function getQuickGptResponse(query, options = {}) {
    try {
        console.log("🎯 GPT-5 Quick Response Request...");
        
        const response = await openai.chat.completions.create({
            model: options.model || "gpt-5",
            messages: [
                {
                    role: "user",
                    content: query
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 800,  // 🔧 FIXED
            temperature: options.temperature || 0.7,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content || "Quick response unavailable";
        console.log(`✅ GPT-5 Quick Response Complete: ${result.length} characters`);
        
        return result;
        
    } catch (error) {
        console.error("❌ Quick Response Error:", error.message);
        
        if (error.message.includes('gpt-5')) {
            // Quick fallback
            try {
                const fallbackResponse = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: query }],
                    max_completion_tokens: 800,  // 🔧 FIXED
                    temperature: 0.7
                });
                
                return `**GPT-4 Response** (GPT-5 unavailable)\n\n${fallbackResponse.choices[0]?.message?.content}`;
            } catch (fallbackError) {
                throw new Error(`Quick response failed: ${fallbackError.message}`);
            }
        }
        
        throw new Error(`Quick response failed: ${error.message}`);
    }
}

/**
 * 🖼️ ENHANCED: Image Analysis Function (GPT-5 Vision)
 */
async function analyzeImageWithGPT(base64Image, prompt, options = {}) {
    try {
        console.log("🖼️ GPT-5 Vision Analysis Request...");
        
        const response = await openai.chat.completions.create({
            model: options.model || "gpt-5",  // Your GPT-5 vision model
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander providing institutional-quality image analysis. Extract maximum intelligence from visual content."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: options.detail || "high"
                            }
                        }
                    ]
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 1500,  // 🔧 FIXED
            temperature: options.temperature || 0.7,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content || "Image analysis unavailable";
        console.log(`✅ GPT-5 Vision Analysis Complete: ${result.length} characters`);
        
        return result;
        
    } catch (error) {
        console.error("❌ Image Analysis Error:", error.message);
        
        if (error.message.includes('gpt-5')) {
            // Fallback to GPT-4 vision
            try {
                const fallbackResponse = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`,
                                        detail: "high"
                                    }
                                }
                            ]
                        }
                    ],
                    max_completion_tokens: 1500,  // 🔧 FIXED
                    temperature: 0.7
                });
                
                return `**GPT-4 Vision Analysis** (GPT-5 unavailable)\n\n${fallbackResponse.choices[0]?.message?.content}`;
            } catch (fallbackError) {
                throw new Error(`Image analysis fallback failed: ${fallbackError.message}`);
            }
        }
        
        throw new Error(`Image analysis failed: ${error.message}`);
    }
}

/**
 * 🎤 ENHANCED: Audio Transcription Function
 */
async function transcribeAudio(audioFile, options = {}) {
    try {
        console.log("🎤 Whisper Transcription Request...");
        
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: options.model || "whisper-1",
            language: options.language || "en",
            temperature: options.temperature || 0.2,
            response_format: options.response_format || "text"
        });
        
        console.log(`✅ Whisper Transcription Complete: ${transcription.length || 0} characters`);
        return transcription;
        
    } catch (error) {
        console.error("❌ Audio Transcription Error:", error.message);
        throw new Error(`Audio transcription failed: ${error.message}`);
    }
}

/**
 * 🧠 ENHANCED: Memory-Aware Analysis Function
 */
async function getMemoryAwareAnalysis(query, memoryContext = '', options = {}) {
    try {
        console.log("🧠 GPT-5 Memory-Aware Analysis Request...");
        
        const enhancedQuery = memoryContext ? 
            `${memoryContext}\n\nUser Question: ${query}` : query;
        
        const response = await openai.chat.completions.create({
            model: options.model || "gpt-5",
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander with access to persistent memory about this user. Use the provided context to give personalized, intelligent responses that reference previous conversations and learned facts."
                },
                {
                    role: "user",
                    content: enhancedQuery
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 1500,  // 🔧 FIXED
            temperature: options.temperature || 0.7,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content || "Memory-aware response unavailable";
        console.log(`✅ GPT-5 Memory-Aware Analysis Complete: ${result.length} characters`);
        
        return result;
        
    } catch (error) {
        console.error("❌ Memory-Aware Analysis Error:", error.message);
        
        if (error.message.includes('gpt-5')) {
            return await getMemoryAwareAnalysisWithFallback(query, memoryContext, options);
        }
        
        throw new Error(`Memory-aware analysis failed: ${error.message}`);
    }
}

/**
 * 🧠 FALLBACK: Memory-Aware Analysis with GPT-4
 */
async function getMemoryAwareAnalysisWithFallback(query, memoryContext = '', options = {}) {
    try {
        const enhancedQuery = memoryContext ? 
            `${memoryContext}\n\nUser Question: ${query}` : query;
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant with access to context about this user."
                },
                {
                    role: "user",
                    content: enhancedQuery
                }
            ],
            max_completion_tokens: options.max_completion_tokens || 1500,  // 🔧 FIXED
            temperature: 0.7,
            stream: false
        });
        
        const result = response.choices[0]?.message?.content;
        return `**GPT-4 Memory Response** (GPT-5 unavailable)\n\n${result}`;
        
    } catch (fallbackError) {
        throw new Error(`Memory-aware analysis fallback failed: ${fallbackError.message}`);
    }
}

/**
 * 🔍 UTILITY: Test OpenAI Connection
 */
async function testOpenAIConnection() {
    try {
        console.log("🔍 Testing OpenAI connection...");
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o",  // Use stable model for testing
            messages: [
                {
                    role: "user",
                    content: "Test connection. Respond with: Connection successful."
                }
            ],
            max_completion_tokens: 50,  // 🔧 FIXED
            temperature: 0
        });
        
        const result = response.choices[0]?.message?.content;
        console.log("✅ OpenAI Connection Test Result:", result);
        
        return {
            success: true,
            result: result,
            model: "gpt-4o"
        };
        
    } catch (error) {
        console.error("❌ OpenAI Connection Test Failed:", error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 UTILITY: Get Model Usage Stats
 */
async function getModelUsageStats() {
    try {
        // This would typically connect to OpenAI usage API if available
        // For now, return basic information
        return {
            preferredModel: "gpt-5",
            fallbackModel: "gpt-4o",
            visionModel: "gpt-5",
            audioModel: "whisper-1",
            parametersFixed: true,
            enhancedFeatures: [
                "GPT-5 with GPT-4 fallback",
                "Fixed max_completion_tokens parameter",
                "Enhanced error handling",
                "Memory-aware analysis",
                "Strategic command prompts",
                "Image analysis support"
            ]
        };
    } catch (error) {
        console.error("Model usage stats error:", error.message);
        return { error: error.message };
    }
}

// Export all functions
module.exports = {
    // Main analysis functions
    getGptAnalysis,
    getMarketAnalysis,
    getCambodiaAnalysis,
    getStrategicAnalysis,
    getConversationalAnalysis,
    getQuickGptResponse,
    
    // Enhanced functions
    analyzeImageWithGPT,
    transcribeAudio,
    getMemoryAwareAnalysis,
    
    // Fallback functions
    getGptAnalysisWithFallback,
    getMarketAnalysisWithFallback,
    getCambodiaAnalysisWithFallback,
    getStrategicAnalysisWithFallback,
    getConversationalAnalysisWithFallback,
    getMemoryAwareAnalysisWithFallback,
    
    // Utility functions
    testOpenAIConnection,
    getModelUsageStats
};
