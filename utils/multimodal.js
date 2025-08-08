// utils/multimodal.js - Multimodal capabilities for GPT-4o
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Process voice messages using Whisper API
 */
async function processVoiceMessage(bot, fileId, chatId) {
    try {
        console.log('🎤 Processing voice message...');
        
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
        
        console.log('✅ Voice transcribed:', transcription.text);
        return transcription.text;
        
    } catch (error) {
        console.error('Voice processing error:', error.message);
        return null;
    }
}

/**
 * Process images using GPT-4o Vision
 */
async function processImageMessage(bot, fileId, chatId, caption = '') {
    try {
        console.log('🖼️ Processing image message...');
        
        // Get file info from Telegram
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        // Download image
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');
        
        // Analyze image with GPT-4o Vision
        const prompt = caption ? 
            `Analyze this image. User caption: "${caption}". Provide detailed analysis of what you see.` :
            'Analyze this image in detail. Describe what you see, any text, objects, people, or important details.';
            
        const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ],
                },
            ],
            max_tokens: 1000,
        });
        
        console.log('✅ Image analyzed');
        return visionResponse.choices[0].message.content;
        
    } catch (error) {
        console.error('Image processing error:', error.message);
        return null;
    }
}

/**
 * Process document files (PDF, DOCX, TXT)
 */
async function processDocumentMessage(bot, fileId, chatId, fileName) {
    try {
        console.log('📄 Processing document:', fileName);
        
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
            // For PDF processing, we'll need pdf-parse
            const pdfParse = require('pdf-parse');
            const pdfBuffer = fs.readFileSync(tempFilePath);
            const pdfData = await pdfParse(pdfBuffer);
            extractedText = pdfData.text;
        } else if (ext === '.docx') {
            // For DOCX processing, we'll need mammoth
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ path: tempFilePath });
            extractedText = result.value;
        } else {
            // Try reading as text for other formats
            extractedText = fs.readFileSync(tempFilePath, 'utf8');
        }
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        // Analyze document with GPT-4o
        const analysis = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are analyzing a document. Provide a comprehensive summary and key insights."
                },
                {
                    role: "user",
                    content: `Analyze this document content:\n\nFilename: ${fileName}\n\nContent:\n${extractedText.substring(0, 50000)}` // Limit content length
                }
            ],
            max_tokens: 2000,
        });
        
        console.log('✅ Document analyzed');
        return {
            analysis: analysis.choices[0].message.content,
            extractedText: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? '...' : '')
        };
        
    } catch (error) {
        console.error('Document processing error:', error.message);
        // Clean up temp file if it exists
        try {
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
 * Process video messages (extract frame and analyze)
 */
async function processVideoMessage(bot, fileId, chatId, caption = '') {
    try {
        console.log('🎥 Processing video message...');
        
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
        
        // For now, return basic video info
        // Advanced video analysis would require ffmpeg for frame extraction
        const stats = fs.statSync(tempFilePath);
        const videoInfo = {
            size: Math.round(stats.size / 1024) + ' KB',
            caption: caption || 'No caption'
        };
        
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        
        const prompt = caption ? 
            `User sent a video file (${videoInfo.size}) with caption: "${caption}". Provide relevant analysis or response about the video content based on the caption.` :
            `User sent a video file (${videoInfo.size}). Let them know you received it and ask what they'd like to know about it.`;
            
        const analysis = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 500,
        });
        
        console.log('✅ Video processed');
        return analysis.choices[0].message.content;
        
    } catch (error) {
        console.error('Video processing error:', error.message);
        return null;
    }
}

module.exports = {
    processVoiceMessage,
    processImageMessage,
    processDocumentMessage,
    processVideoMessage
};
