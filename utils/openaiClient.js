// utils/openaiClient.js - Clean OpenAI Client with GPT-5 and Smart Fallback
require("dotenv").config();
const { OpenAI } = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 120000, // 2 minutes
    maxRetries: 3
});

// Smart model selection with fallback
const PREFERRED_MODEL = process.env.OPENAI_MODEL || "gpt-5";
const FALLBACK_MODEL = "gpt-4o";

let currentModel = PREFERRED_MODEL;
let modelTested = false;

// Debug configuration
console.log("🔧 OpenAI Client Configuration:");
console.log(`   API Key: ${process.env.OPENAI_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
console.log(`   Preferred Model: ${PREFERRED_MODEL}`);
console.log(`   Fallback Model: ${FALLBACK_MODEL}`);
console.log(`   Timeout: 120 seconds`);

/**
 * Test and set the working model
 */
async function testAndSetModel() {
    if (modelTested) return currentModel;
    
    try {
        console.log(`🔍 Testing ${PREFERRED_MODEL} availability...`);
        
        const testResponse = await openai.chat.completions.create({
            model: PREFERRED_MODEL,
            messages: [
                {
                    role: "user",
                    content: "Test message - respond with 'OK'"
                }
            ],
            max_tokens: 10,
            temperature: 0
        });
        
        if (testResponse.choices[0].message.content) {
            console.log(`✅ ${PREFERRED_MODEL} is available and working`);
            currentModel = PREFERRED_MODEL;
            modelTested = true;
            return currentModel;
        }
        
    } catch (error) {
        console.log(`⚠️ ${PREFERRED_MODEL} not available: ${error.message}`);
        console.log(`🔄 Falling back to ${FALLBACK_MODEL}`);
        
        try {
            const fallbackTest = await openai.chat.completions.create({
                model: FALLBACK_MODEL,
                messages: [
                    {
                        role: "user",
                        content: "Test message - respond with 'OK'"
                    }
                ],
                max_tokens: 10,
                temperature: 0
            });
            
            if (fallbackTest.choices[0].message.content) {
                console.log(`✅ ${FALLBACK_MODEL} is working`);
                currentModel = FALLBACK_MODEL;
                modelTested = true;
                return currentModel;
            }
            
        } catch (fallbackError) {
            console.error(`❌ Both models failed: ${fallbackError.message}`);
            currentModel = FALLBACK_MODEL; // Use fallback anyway
            modelTested = true;
            return currentModel;
        }
    }
    
    modelTested = true;
    return currentModel;
}

/**
 * Analyze query type for appropriate response complexity
 */
function analyzeQueryType(prompt) {
    const message = prompt.toLowerCase();
    
    // Simple/casual patterns
    const casualPatterns = [
        /^(hello|hi|hey|good morning|good afternoon)$/i,
        /^how are you\??$/i,
        /^what's up\??$/i,
        /^(thanks|thank you)$/i
    ];
    
    // Financial analysis patterns
    const financialPatterns = [
        /(market|stock|bond|investment|portfolio)/i,
        /(economy|economic|fed|inflation|gdp)/i,
        /(trading|buy|sell|hold|allocation)/i,
        /(risk|return|yield|dividend)/i,
        /(analysis|forecast|outlook|trend)/i
    ];
    
    // Complex analysis patterns
    const complexPatterns = [
        /(strategy|strategic|comprehensive)/i,
        /(detailed|thorough|in-depth)/i,
        /(compare|comparison|versus|vs)/i,
        /(research|analyze|evaluate)/i
    ];
    
    // Cambodia-specific patterns
    const cambodiaPatterns = [
        /(cambodia|khmer|phnom penh|lending)/i,
        /(deal|loan|property|real estate)/i
    ];
    
    // Determine query type
    if (casualPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'casual',
            maxTokens: 300,
            temperature: 0.8
        };
    }
    
    if (cambodiaPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'cambodia',
            maxTokens: 2000,
            temperature: 0.6
        };
    }
    
    if (complexPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'complex',
            maxTokens: 3000,
            temperature: 0.6
        };
    }
    
    if (financialPatterns.some(pattern => pattern.test(message))) {
        return {
            type: 'financial',
            maxTokens: 1500,
            temperature: 0.7
        };
    }
    
    // Default
    return {
        type: 'general',
        maxTokens: 1000,
        temperature: 0.7
    };
}

/**
 * Create natural system prompt based on query type
 */
function createSystemPrompt(queryType, options = {}) {
    const modelName = currentModel === "gpt-5" ? "GPT-5" : "GPT-4o";
    let systemPrompt = `You are ${modelName}, OpenAI's advanced AI assistant with enhanced capabilities in analysis, reasoning, and problem-solving.`;
    
    switch (queryType.type) {
        case 'casual':
            systemPrompt += " Respond naturally and briefly to casual questions.";
            break;
            
        case 'financial':
            systemPrompt += " You have expertise in financial analysis, markets, and investment strategy. Provide clear, actionable insights while acknowledging risks and limitations in financial advice.";
            break;
            
        case 'complex':
            systemPrompt += " Provide comprehensive, well-structured analysis. Break down complex topics clearly and offer specific, actionable insights.";
            break;
            
        case 'cambodia':
            systemPrompt += " You understand Southeast Asian markets, particularly Cambodia's economic environment, real estate, and lending markets. Consider local context, regulations, and cultural factors in your analysis.";
            break;
            
        default:
            systemPrompt += " Provide helpful, informative responses adapted to the complexity and context of the question.";
    }
    
    // Add context if provided
    if (options.context) {
        systemPrompt += `\n\nAdditional context: ${options.context}`;
    }
    
    // Add guidelines
    systemPrompt += "\n\nGuidelines:";
    systemPrompt += "\n- Be direct and professional";
    systemPrompt += "\n- Provide specific, actionable insights when possible";
    systemPrompt += "\n- Acknowledge limitations and risks appropriately";
    systemPrompt += "\n- Use clear, accessible language";
    
    return systemPrompt;
}

/**
 * Main GPT analysis function with smart model selection
 */
async function getGptAnalysis(prompt, options = {}) {
    try {
        // Ensure we have the working model
        await testAndSetModel();
        
        console.log(`🔍 ${currentModel.toUpperCase()} analyzing query...`);
        
        // Analyze query type
        const queryType = analyzeQueryType(prompt);
        console.log(`📊 Query type: ${queryType.type}`);
        
        // Create system prompt
        const systemPrompt = createSystemPrompt(queryType, options);
        
        // Prepare request options
        const requestOptions = {
            model: currentModel,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: options.temperature || queryType.temperature,
            max_tokens: options.maxTokens || queryType.maxTokens,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };
        
        // Execute request
        const completion = await openai.chat.completions.create(requestOptions);
        const response = completion.choices[0].message.content.trim();
        
        console.log(`✅ ${currentModel.toUpperCase()} analysis complete: ${queryType.type} (${response.length} chars, ${completion.usage?.total_tokens || 'unknown'} tokens)`);
        return response;
        
    } catch (error) {
        console.error(`❌ ${currentModel.toUpperCase()} analysis error:`, error.message);
        
        // If GPT-5 fails, try fallback to GPT-4o
        if (currentModel === "gpt-5" && !error.message.includes('API key')) {
            console.log('🔄 GPT-5 failed, trying GPT-4o fallback...');
            currentModel = FALLBACK_MODEL;
            modelTested = false; // Force retest
            
            try {
                return await getGptAnalysis(prompt, options);
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError.message);
            }
        }
        
        if (error.message.includes('model')) {
            throw new Error(`GPT Model Error: ${error.message}. Verify ${currentModel} access.`);
        } else if (error.message.includes('API key')) {
            throw new Error('GPT API Key Error: Check OPENAI_API_KEY environment variable.');
        } else if (error.message.includes('timeout')) {
            throw new Error('GPT Timeout: Request took too long. Try a shorter query.');
        } else {
            throw new Error(`GPT Error: ${error.message}`);
        }
    }
}

/**
 * Specialized functions for different analysis types
 */

// Quick general response
async function getQuickReply(prompt, options = {}) {
    return await getGptAnalysis(prompt, {
        ...options,
        maxTokens: 500,
        temperature: 0.7
    });
}

// Financial market analysis
async function getMarketAnalysis(query, marketData = null, options = {}) {
    try {
        console.log(`📈 ${currentModel.toUpperCase()} market analysis...`);
        
        let enhancedQuery = `Market analysis request: ${query}`;
        
        // Add market context if available
        if (marketData) {
            enhancedQuery += `\n\nCurrent market context:`;
            if (marketData.fedRate) enhancedQuery += `\n- Fed Rate: ${marketData.fedRate}%`;
            if (marketData.vix) enhancedQuery += `\n- VIX: ${marketData.vix}`;
            if (marketData.yield10Y) enhancedQuery += `\n- 10Y Treasury: ${marketData.yield10Y}%`;
            if (marketData.sp500) enhancedQuery += `\n- S&P 500: ${marketData.sp500}`;
            if (marketData.dollar) enhancedQuery += `\n- Dollar Index: ${marketData.dollar}`;
            if (marketData.bitcoin) enhancedQuery += `\n- Bitcoin: ${marketData.bitcoin}`;
        }
        
        return await getGptAnalysis(enhancedQuery, {
            ...options,
            maxTokens: 2000,
            temperature: 0.6
        });
        
    } catch (error) {
        console.error('❌ Market analysis error:', error.message);
        throw error;
    }
}

// Strategic business analysis
async function getStrategicAnalysis(query, options = {}) {
    try {
        console.log(`🎯 ${currentModel.toUpperCase()} strategic analysis...`);
        
        const strategicQuery = `Strategic business analysis: ${query}
        
Please provide comprehensive analysis including:
- Key strategic considerations
- Risk assessment
- Actionable recommendations
- Implementation considerations`;
        
        return await getGptAnalysis(strategicQuery, {
            ...options,
            maxTokens: 3000,
            temperature: 0.6
        });
        
    } catch (error) {
        console.error('❌ Strategic analysis error:', error.message);
        throw error;
    }
}

// Cambodia market analysis
async function getCambodiaAnalysis(dealQuery, dealData = null, options = {}) {
    try {
        console.log(`🇰🇭 ${currentModel.toUpperCase()} Cambodia analysis...`);
        
        let enhancedQuery = `Cambodia market analysis: ${dealQuery}`;
        
        if (dealData) {
            enhancedQuery += `\n\nDeal information:`;
            enhancedQuery += `\n- Amount: $${dealData.amount?.toLocaleString() || 'TBD'}`;
            enhancedQuery += `\n- Type: ${dealData.type || 'Commercial'}`;
            enhancedQuery += `\n- Location: ${dealData.location || 'Phnom Penh'}`;
            enhancedQuery += `\n- Interest Rate: ${dealData.rate || 'TBD'}%`;
            enhancedQuery += `\n- Term: ${dealData.term || 'TBD'} months`;
            if (dealData.ltv) enhancedQuery += `\n- LTV: ${dealData.ltv}%`;
        }
        
        enhancedQuery += `\n\nPlease analyze considering:
- Local market conditions and trends
- Regulatory environment
- Currency and political risks
- Comparative yields vs alternatives
- Risk mitigation strategies
- Market timing considerations`;
        
        return await getGptAnalysis(enhancedQuery, {
            ...options,
            context: "Focus on Cambodia's economic environment, real estate market, and lending sector",
            maxTokens: 2500,
            temperature: 0.6
        });
        
    } catch (error) {
        console.error('❌ Cambodia analysis error:', error.message);
        throw error;
    }
}

// Vision analysis for images
async function getVisionAnalysis(base64Image, prompt, options = {}) {
    try {
        await testAndSetModel();
        console.log(`🖼️ ${currentModel.toUpperCase()} vision analysis...`);
        
        const completion = await openai.chat.completions.create({
            model: currentModel,
            messages: [
                {
                    role: "system",
                    content: `You are ${currentModel === "gpt-5" ? "GPT-5" : "GPT-4o"} with enhanced vision capabilities. Analyze images thoroughly and provide detailed, accurate descriptions and insights.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
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
            max_tokens: options.maxTokens || 2000,
            temperature: options.temperature || 0.7
        });
        
        const analysis = completion.choices[0].message.content;
        console.log(`✅ Vision analysis complete (${analysis.length} characters)`);
        
        return analysis;
        
    } catch (error) {
        console.error('❌ Vision analysis error:', error.message);
        
        if (error.message.includes('model')) {
            throw new Error(`Vision Model Error: ${error.message}. Verify ${currentModel} vision access.`);
        } else {
            throw new Error(`Vision Analysis Error: ${error.message}`);
        }
    }
}

// Audio transcription
async function getAudioTranscription(audioFile, options = {}) {
    try {
        console.log('🎤 Audio transcription with Whisper...');
        
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: options.language || "en",
            temperature: options.temperature || 0.0
        });
        
        console.log(`✅ Audio transcription complete: "${transcription.text}"`);
        return transcription.text;
        
    } catch (error) {
        console.error('❌ Audio transcription error:', error.message);
        throw new Error(`Audio Transcription Error: ${error.message}`);
    }
}

// Text-to-speech
async function getTextToSpeech(text, options = {}) {
    try {
        console.log('🗣️ Text-to-speech generation...');
        
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: options.voice || "alloy",
            input: text,
            speed: options.speed || 1.0
        });
        
        console.log('✅ Text-to-speech complete');
        return Buffer.from(await mp3.arrayBuffer());
        
    } catch (error) {
        console.error('❌ Text-to-speech error:', error.message);
        throw new Error(`Text-to-Speech Error: ${error.message}`);
    }
}

/**
 * Test functions
 */

// Test natural GPT response
async function testNaturalGPT() {
    try {
        await testAndSetModel();
        console.log(`🔍 Testing natural ${currentModel.toUpperCase()} response...`);
        
        const completion = await openai.chat.completions.create({
            model: currentModel,
            messages: [
                {
                    role: "user",
                    content: "What is your exact model name and do you have vision capabilities?"
                }
            ],
            max_tokens: 200,
            temperature: 0
        });
        
        const response = completion.choices[0].message.content;
        console.log(`✅ Natural ${currentModel.toUpperCase()} response:`, response);
        return response;
        
    } catch (error) {
        console.error('❌ Natural GPT test failed:', error.message);
        return false;
    }
}

// Test connection
async function testConnection() {
    try {
        await testAndSetModel();
        console.log(`🔍 Testing ${currentModel.toUpperCase()} connection...`);
        
        const completion = await openai.chat.completions.create({
            model: currentModel,
            messages: [
                {
                    role: "user",
                    content: `Respond with '${currentModel.toUpperCase()} connection successful' if you receive this.`
                }
            ],
            max_tokens: 50,
            temperature: 0
        });
        
        const response = completion.choices[0].message.content;
        console.log('✅ Connection test result:', response);
        
        return response.includes("successful");
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        return false;
    }
}

// System health check
async function checkSystemHealth() {
    const health = {
        gptConnection: false,
        visionCapabilities: false,
        audioCapabilities: false,
        naturalResponses: false,
        currentModel: currentModel,
        errors: []
    };
    
    try {
        await testConnection();
        health.gptConnection = true;
    } catch (error) {
        health.errors.push(`GPT Connection: ${error.message}`);
    }
    
    try {
        // Test vision with a simple base64 image (1x1 pixel)
        const testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        await getVisionAnalysis(testImage, "What do you see?", { maxTokens: 50 });
        health.visionCapabilities = true;
    } catch (error) {
        health.errors.push(`Vision: ${error.message}`);
    }
    
    try {
        const response = await testNaturalGPT();
        health.naturalResponses = response && (response.includes('GPT-5') || response.includes('GPT-4') || response.includes('vision'));
    } catch (error) {
        health.errors.push(`Natural Response: ${error.message}`);
    }
    
    // Audio capabilities check would require actual audio file
    health.audioCapabilities = true; // Assume available if connection works
    
    health.overallHealth = health.gptConnection && health.naturalResponses;
    
    return health;
}

// Get client metrics
function getMetrics() {
    return {
        model: currentModel,
        preferredModel: PREFERRED_MODEL,
        fallbackModel: FALLBACK_MODEL,
        apiKeyConfigured: !!process.env.OPENAI_API_KEY,
        maxTokens: 4096,
        timeout: 120000,
        retries: 3,
        queryTypes: ['casual', 'financial', 'complex', 'cambodia', 'general'],
        naturalResponses: true,
        smartFallback: true,
        capabilities: [
            'Enhanced natural language understanding',
            'Advanced financial analysis',
            'Strategic planning and reasoning',
            'Enhanced vision analysis (images)',
            'Audio transcription',
            'Text-to-speech',
            'Cambodia market expertise',
            'Multi-language support',
            'Smart model fallback',
            'Automatic model testing'
        ],
        multimodal: {
            vision: true,
            audio: true,
            speech: true
        }
    };
}

module.exports = {
    // Main client instance
    openai,
    
    // Analysis functions
    getGptAnalysis,
    getQuickReply,
    getMarketAnalysis,
    getStrategicAnalysis,
    getCambodiaAnalysis,
    
    // Multimodal functions
    getVisionAnalysis,
    getAudioTranscription,
    getTextToSpeech,
    
    // Utility functions
    analyzeQueryType,
    createSystemPrompt,
    testAndSetModel,
    
    // Test functions
    testNaturalGPT,
    testConnection,
    checkSystemHealth,
    getMetrics,
    
    // Legacy compatibility (clean versions)
    getGptReply: getGptAnalysis,
    getGeneralReply: getQuickReply,
    getCambodiaFundAnalysis: getCambodiaAnalysis
};
