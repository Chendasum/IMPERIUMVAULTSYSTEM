// utils/multimodal.js - Strategic Commander Multimodal Capabilities
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { OpenAI } = require('openai');

const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 120000 // Extended timeout for comprehensive analysis
});

/**
 * 🎤 Process voice messages with Strategic Commander intelligence
 */
async function processVoiceMessage(bot, fileId, chatId) {
    try {
        console.log('🎤 Processing voice message with Strategic Commander...');
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        // Download voice file
        const response = await axios.get(fileUrl, { responseType: 'stream' });
        const tempFilePath = path.join(__dirname, '../temp', `voice_${Date.now()}.ogg`);
        
        // Ensure temp directory exists
        if (!fs.existsSync(path.dirname(tempFilePath))) {
            fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
        }
        
        // Save voice file
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        
        // Transcribe with Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
        });
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        console.log('✅ Voice transcribed for Strategic Commander:', transcription.text);
        return transcription.text;
        
    } catch (error) {
        console.error('Strategic Commander voice processing error:', error.message);
        return null;
    }
}

/**
 * 🖼️ Process images with Strategic Commander financial analysis
 */
async function processImageMessage(bot, fileId, chatId, caption = '') {
    try {
        console.log('🖼️ Processing image with Strategic Commander analysis...');
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        // Download image
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');
        
        // Strategic Commander image analysis prompt
        const strategicPrompt = caption ? 
            `As Strategic Commander of IMPERIUM VAULT SYSTEM, analyze this image with institutional expertise. User caption: "${caption}". 

Provide strategic analysis focusing on:
- Financial charts, market data, or economic indicators if present
- Strategic documents, reports, or deal structures
- Investment opportunities or market intelligence
- Risk factors or strategic considerations
- Any actionable strategic insights for portfolio management

Execute comprehensive institutional-grade analysis.` :
            
            `As Strategic Commander of IMPERIUM VAULT SYSTEM, analyze this image with institutional expertise.

Focus on identifying:
- Financial data, charts, or market information
- Strategic documents or investment materials
- Economic indicators or market signals
- Investment opportunities or risks
- Any strategic intelligence relevant to portfolio management

Provide detailed strategic assessment with actionable insights.`;
            
        const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander providing institutional-quality analysis. Focus on financial, strategic, and investment insights from visual content."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: strategicPrompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ],
                },
            ],
            max_tokens: 2000, // Increased for comprehensive strategic analysis
            temperature: 0.7
        });
        
        console.log('✅ Image analyzed by Strategic Commander');
        return visionResponse.choices[0].message.content;
        
    } catch (error) {
        console.error('Strategic Commander image processing error:', error.message);
        return null;
    }
}

/**
 * 📄 Process documents with Strategic Commander analysis
 */
async function processDocumentMessage(bot, fileId, chatId, fileName) {
    try {
        console.log('📄 Processing document with Strategic Commander:', fileName);
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        // Download document
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const tempFilePath = path.join(__dirname, '../temp', `doc_${Date.now()}_${fileName}`);
        
        // Ensure temp directory exists
        if (!fs.existsSync(path.dirname(tempFilePath))) {
            fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
        }
        
        fs.writeFileSync(tempFilePath, response.data);
        
        let extractedText = '';
        const ext = path.extname(fileName).toLowerCase();
        
        if (ext === '.txt') {
            extractedText = fs.readFileSync(tempFilePath, 'utf8');
        } else if (ext === '.pdf') {
            try {
                const pdfParse = require('pdf-parse');
                const pdfBuffer = fs.readFileSync(tempFilePath);
                const pdfData = await pdfParse(pdfBuffer);
                extractedText = pdfData.text;
            } catch (pdfError) {
                console.log('PDF parsing failed, treating as binary');
                extractedText = 'PDF content could not be extracted for analysis.';
            }
        } else if (ext === '.docx') {
            try {
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ path: tempFilePath });
                extractedText = result.value;
            } catch (docxError) {
                console.log('DOCX parsing failed, treating as binary');
                extractedText = 'DOCX content could not be extracted for analysis.';
            }
        } else {
            // Try reading as text for other formats
            try {
                extractedText = fs.readFileSync(tempFilePath, 'utf8');
            } catch (textError) {
                extractedText = 'Document content could not be extracted as text.';
            }
        }
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        // Strategic Commander document analysis
        const analysis = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are the Strategic Commander of IMPERIUM VAULT SYSTEM providing institutional-quality document analysis.

DOCUMENT ANALYSIS EXPERTISE:
- Financial reports and investment documentation
- Market research and economic analysis
- Deal structures and investment opportunities
- Risk assessments and due diligence materials
- Strategic planning and portfolio management documents

ANALYSIS REQUIREMENTS:
- Provide comprehensive strategic insights
- Identify key financial metrics and strategic data
- Assess investment opportunities or risks
- Extract actionable strategic intelligence
- Offer specific strategic recommendations when appropriate

Execute institutional-grade document analysis with strategic authority.`
                },
                {
                    role: "user",
                    content: `Execute strategic analysis of this document:

**Document:** ${fileName}
**File Type:** ${ext.toUpperCase()}
**Strategic Priority:** Extract key financial intelligence and strategic insights

**Document Content:**
${extractedText.substring(0, 60000)} ${extractedText.length > 60000 ? '\n\n[Content truncated for analysis...]' : ''}

Provide comprehensive strategic analysis with actionable insights for portfolio management and investment decisions.`
                }
            ],
            max_tokens: 4000, // Increased for comprehensive strategic analysis
            temperature: 0.6 // Slightly lower for document analysis precision
        });
        
        console.log('✅ Document analyzed by Strategic Commander');
        return {
            analysis: analysis.choices[0].message.content,
            extractedText: extractedText.substring(0, 2000) + (extractedText.length > 2000 ? '...' : ''),
            wordCount: extractedText.split(/\s+/).filter(word => word.length > 0).length
        };
        
    } catch (error) {
        console.error('Strategic Commander document processing error:', error.message);
        // Clean up temp file if it exists
        try {
            const tempFilePath = path.join(__dirname, '../temp', `doc_${Date.now()}_${fileName}`);
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
        return null;
    }
}

/**
 * 🎥 Process video messages with Strategic Commander analysis
 */
async function processVideoMessage(bot, fileId, chatId, caption = '') {
    try {
        console.log('🎥 Processing video with Strategic Commander...');
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        // Download video
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const tempFilePath = path.join(__dirname, '../temp', `video_${Date.now()}.mp4`);
        
        // Ensure temp directory exists
        if (!fs.existsSync(path.dirname(tempFilePath))) {
            fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
        }
        
        fs.writeFileSync(tempFilePath, response.data);
        
        // Get video info
        const stats = fs.statSync(tempFilePath);
        const videoInfo = {
            size: Math.round(stats.size / 1024) + ' KB',
            caption: caption || 'No caption'
        };
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        // Strategic Commander video analysis prompt
        const strategicPrompt = caption ? 
            `As Strategic Commander of IMPERIUM VAULT SYSTEM, acknowledge receipt of video content (${videoInfo.size}) with caption: "${caption}".

Strategic Analysis Protocol:
- If the caption indicates financial content (charts, presentations, market data), provide strategic assessment guidance
- If related to Cambodia business or investment opportunities, offer strategic market intelligence
- If concerning portfolio management or trading, provide institutional-level strategic context
- Focus on actionable strategic insights based on the described content

Execute strategic response with institutional authority.` :
            
            `As Strategic Commander of IMPERIUM VAULT SYSTEM, acknowledge receipt of video content (${videoInfo.size}).

Strategic Protocol:
Video content received for strategic analysis. To provide comprehensive institutional-grade assessment, please describe the video content focus:

- Financial charts or market analysis presentations?
- Cambodia business or investment opportunity documentation?
- Trading strategy or portfolio management content?
- Economic analysis or strategic planning materials?

Provide context for optimal strategic intelligence extraction.`;
            
        const analysis = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander providing institutional-quality analysis. Focus on strategic intelligence and actionable insights."
                },
                {
                    role: "user",
                    content: strategicPrompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });
        
        console.log('✅ Video processed by Strategic Commander');
        return analysis.choices[0].message.content;
        
    } catch (error) {
        console.error('Strategic Commander video processing error:', error.message);
        return null;
    }
}

/**
 * 📊 Process financial charts and market data images
 */
async function processFinancialChart(bot, fileId, chatId, chartType = 'market_data') {
    try {
        console.log('📊 Processing financial chart with Strategic Commander...');
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        // Download image
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');
        
        // Specialized financial chart analysis
        const chartAnalysisPrompt = `As Strategic Commander of IMPERIUM VAULT SYSTEM, execute comprehensive analysis of this financial chart/market data.

STRATEGIC CHART ANALYSIS PROTOCOL:
- Identify chart type (price action, technical indicators, economic data, portfolio performance)
- Extract key price levels, support/resistance, trends, and patterns
- Assess strategic implications for portfolio positioning
- Identify entry/exit opportunities or risk factors
- Provide specific strategic trading or investment recommendations
- Calculate risk/reward ratios where applicable
- Suggest position sizing and timing considerations

Execute institutional-grade technical and strategic analysis with specific actionable directives.`;
            
        const chartResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are the Strategic Commander specializing in financial chart analysis and market intelligence. Provide precise technical analysis with strategic positioning recommendations."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: chartAnalysisPrompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ],
                },
            ],
            max_tokens: 3000, // Extended for comprehensive chart analysis
            temperature: 0.6 // Lower for technical precision
        });
        
        console.log('✅ Financial chart analyzed by Strategic Commander');
        return chartResponse.choices[0].message.content;
        
    } catch (error) {
        console.error('Strategic Commander chart analysis error:', error.message);
        return null;
    }
}

module.exports = {
    processVoiceMessage,
    processImageMessage,
    processDocumentMessage,
    processVideoMessage,
    processFinancialChart // New specialized function
};
