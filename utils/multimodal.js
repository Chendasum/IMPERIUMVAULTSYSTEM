// utils/multimodal.js - Multimodal capabilities for GPT-5-ready setup
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const DEFAULT_MODEL = process.env.GPT_MODEL || "gpt-4o";

/**
 * Process voice messages using Whisper API
 */
async function processVoiceMessage(bot, fileId, chatId) {
    try {
        console.log('🎤 Processing voice message...');
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        const tempFilePath = path.join(__dirname, '../temp', `voice_${Date.now()}.ogg`);
        fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });

        const response = await axios.get(fileUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
        });

        fs.unlinkSync(tempFilePath);
        console.log('✅ Voice transcribed:', transcription.text);
        return transcription.text;

    } catch (error) {
        console.error('Voice processing error:', error.message);
        return null;
    }
}

/**
 * Process images using GPT Vision
 */
async function processImageMessage(bot, fileId, chatId, caption = '') {
    try {
        console.log('🖼️ Processing image message...');
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');

        const prompt = caption 
            ? `Analyze this image. Caption: "${caption}". Provide detailed insights.` 
            : 'Analyze this image. Describe its contents clearly.';

        const visionResponse = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
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
                    ]
                }
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
    const tempFilePath = path.join(__dirname, '../temp', `doc_${Date.now()}_${fileName}`);
    try {
        console.log('📄 Processing document:', fileName);
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
        fs.writeFileSync(tempFilePath, response.data);

        let extractedText = '';
        const ext = path.extname(fileName).toLowerCase();

        if (ext === '.txt') {
            extractedText = fs.readFileSync(tempFilePath, 'utf8');
        } else if (ext === '.pdf') {
            const pdfParse = require('pdf-parse');
            const pdfData = await pdfParse(fs.readFileSync(tempFilePath));
            extractedText = pdfData.text;
        } else if (ext === '.docx') {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ path: tempFilePath });
            extractedText = result.value;
        } else {
            extractedText = fs.readFileSync(tempFilePath, 'utf8');
        }

        fs.unlinkSync(tempFilePath);

        const analysis = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are analyzing a document. Provide a comprehensive summary and key insights."
                },
                {
                    role: "user",
                    content: `Filename: ${fileName}\n\nContent:\n${extractedText.substring(0, 50000)}`
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
        try {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        } catch (_) {}
        return null;
    }
}

/**
 * Process video files
 */
async function processVideoMessage(bot, fileId, chatId, caption = '') {
    try {
        console.log('🎥 Processing video message...');
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const tempFilePath = path.join(__dirname, '../temp', `video_${Date.now()}.mp4`);
        fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
        fs.writeFileSync(tempFilePath, response.data);

        const stats = fs.statSync(tempFilePath);
        const videoInfo = {
            size: Math.round(stats.size / 1024) + ' KB',
            caption: caption || 'No caption'
        };

        fs.unlinkSync(tempFilePath);

        const prompt = caption 
            ? `User sent a video (${videoInfo.size}) with caption: "${caption}". Provide intelligent insight.`
            : `User sent a video (${videoInfo.size}). Respond accordingly with a system-level question.`;

        const analysis = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                { role: "user", content: prompt }
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
