// utils/multimodal.js - GPT-5 Vision and Audio Analysis
// Integrates with GPT-5's multimodal capabilities for image, document, voice, and video analysis

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Import OpenAI client for GPT-5 vision
let openaiClient;
try {
    openaiClient = require('./openaiClient');
    console.log('GPT-5 client loaded for multimodal analysis');
} catch (error) {
    console.error('OpenAI client not available for multimodal:', error.message);
    openaiClient = null;
}

// Import Telegram splitter for response delivery
let telegramSplitter;
try {
    telegramSplitter = require('./telegramSplitter');
    console.log('Telegram splitter loaded for multimodal responses');
} catch (error) {
    console.warn('Telegram splitter not available:', error.message);
    telegramSplitter = {
        sendGPTResponse: async () => false,
        sendAlert: async () => false
    };
}

// Configuration
const MULTIMODAL_CONFIG = {
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
    SUPPORTED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    SUPPORTED_DOCUMENT_TYPES: ['pdf', 'txt', 'doc', 'docx'],
    SUPPORTED_AUDIO_TYPES: ['mp3', 'wav', 'm4a', 'ogg'],
    SUPPORTED_VIDEO_TYPES: ['mp4', 'mov', 'avi', 'webm'],
    TEMP_DIR: './temp_multimodal',
    CLEANUP_INTERVAL: 300000 // 5 minutes
};

// Ensure temp directory exists
async function ensureTempDir() {
    try {
        await fs.mkdir(MULTIMODAL_CONFIG.TEMP_DIR, { recursive: true });
    } catch (error) {
        console.error('Failed to create temp directory:', error.message);
    }
}

// Generate unique filename
function generateTempFilename(originalName, type) {
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName) || `.${type}`;
    return `${type}_${timestamp}_${randomId}${extension}`;
}

// Download file from Telegram
async function downloadTelegramFile(bot, fileId, filename) {
    try {
        await ensureTempDir();
        
        const fileInfo = await bot.getFile(fileId);
        const filePath = path.join(MULTIMODAL_CONFIG.TEMP_DIR, filename);
        
        // Download file stream
        const fileStream = bot.getFileStream(fileId);
        const writeStream = require('fs').createWriteStream(filePath);
        
        return new Promise((resolve, reject) => {
            fileStream.pipe(writeStream);
            writeStream.on('finish', () => resolve(filePath));
            writeStream.on('error', reject);
            fileStream.on('error', reject);
        });
        
    } catch (error) {
        console.error('File download error:', error.message);
        throw new Error(`Failed to download file: ${error.message}`);
    }
}

// Cleanup temp files
async function cleanupTempFile(filePath) {
    try {
        await fs.unlink(filePath);
        console.log('Cleaned up temp file:', filePath);
    } catch (error) {
        console.warn('Cleanup failed for:', filePath, error.message);
    }
}

// Periodic cleanup of old temp files
setInterval(async () => {
    try {
        const files = await fs.readdir(MULTIMODAL_CONFIG.TEMP_DIR);
        const now = Date.now();
        
        for (const file of files) {
            const filePath = path.join(MULTIMODAL_CONFIG.TEMP_DIR, file);
            const stats = await fs.stat(filePath);
            
            // Delete files older than 10 minutes
            if (now - stats.mtime.getTime() > 600000) {
                await cleanupTempFile(filePath);
            }
        }
    } catch (error) {
        console.warn('Periodic cleanup failed:', error.message);
    }
}, MULTIMODAL_CONFIG.CLEANUP_INTERVAL);

// IMAGE ANALYSIS with GPT-5 Vision
async function analyzeImage(bot, fileId, prompt, chatId) {
    let tempFilePath = null;
    
    try {
        if (!openaiClient) {
            throw new Error('OpenAI client not available');
        }
        
        console.log('Starting GPT-5 image analysis...');
        
        // Download image
        const filename = generateTempFilename('image', 'img');
        tempFilePath = await downloadTelegramFile(bot, fileId, filename);
        
        // Read image as base64
        const imageBuffer = await fs.readFile(tempFilePath);
        const base64Image = imageBuffer.toString('base64');
        const imageSize = Math.round(imageBuffer.length / 1024);
        
        console.log(`Image downloaded: ${imageSize}KB`);
        
        // Prepare vision prompt
        const visionPrompt = prompt || "Analyze this image in detail. Describe what you see, identify key elements, and provide insights.";
        
        // GPT-5 Vision API call
        const analysis = await openaiClient.getGPT5Analysis([
            {
                type: "text",
                text: visionPrompt
            },
            {
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: "high"
                }
            }
        ], {
            model: 'gpt-5', // Use full GPT-5 for vision
            max_completion_tokens: 2000,
            reasoning_effort: 'medium'
        });
        
        // Send response via Telegram
        const success = await telegramSplitter.sendGPTResponse(
            bot,
            chatId,
            analysis,
            'GPT-5 Vision Analysis',
            {
                type: 'image_analysis',
                fileSize: imageSize,
                processingTime: Date.now(),
                aiUsed: 'GPT-5-vision'
            }
        );
        
        return {
            success: true,
            type: 'image',
            analysis: analysis,
            aiUsed: 'GPT-5-vision',
            fileSize: imageSize,
            telegramDelivered: success
        };
        
    } catch (error) {
        console.error('Image analysis error:', error.message);
        
        // Send error alert
        await telegramSplitter.sendAlert(
            bot,
            chatId,
            `Image analysis failed: ${error.message}`,
            'Vision Analysis Error'
        );
        
        return {
            success: false,
            error: error.message,
            type: 'image'
        };
        
    } finally {
        if (tempFilePath) {
            await cleanupTempFile(tempFilePath);
        }
    }
}

// DOCUMENT ANALYSIS
async function analyzeDocument(bot, document, prompt, chatId) {
    let tempFilePath = null;
    
    try {
        if (!openaiClient) {
            throw new Error('OpenAI client not available');
        }
        
        console.log('Starting document analysis...');
        
        // Check file size
        if (document.file_size > MULTIMODAL_CONFIG.MAX_FILE_SIZE) {
            throw new Error(`File too large: ${Math.round(document.file_size / 1024 / 1024)}MB (max: 20MB)`);
        }
        
        // Check file type
        const fileExtension = path.extname(document.file_name).toLowerCase().slice(1);
        if (!MULTIMODAL_CONFIG.SUPPORTED_DOCUMENT_TYPES.includes(fileExtension)) {
            throw new Error(`Unsupported document type: ${fileExtension}`);
        }
        
        // Download document
        const filename = generateTempFilename(document.file_name, 'doc');
        tempFilePath = await downloadTelegramFile(bot, document.file_id, filename);
        
        let documentText = '';
        
        // Extract text based on file type
        if (fileExtension === 'txt') {
            documentText = await fs.readFile(tempFilePath, 'utf8');
        } else if (fileExtension === 'pdf') {
            // For PDF, we'd need a PDF parser library
            // For now, send a message about PDF limitation
            throw new Error('PDF parsing not yet implemented. Please convert to text format.');
        } else {
            throw new Error(`Document processing for ${fileExtension} not yet implemented`);
        }
        
        // Limit text length
        if (documentText.length > 50000) {
            documentText = documentText.substring(0, 50000) + '\n... (truncated for analysis)';
        }
        
        // Prepare analysis prompt
        const analysisPrompt = `${prompt || 'Analyze this document'}\n\nDocument content:\n${documentText}`;
        
        // GPT-5 analysis
        const analysis = await openaiClient.getGPT5Analysis(analysisPrompt, {
            model: 'gpt-5-mini',
            max_completion_tokens: 3000,
            reasoning_effort: 'medium'
        });
        
        // Send response
        const success = await telegramSplitter.sendGPTResponse(
            bot,
            chatId,
            analysis,
            'Document Analysis',
            {
                type: 'document_analysis',
                fileName: document.file_name,
                fileSize: Math.round(document.file_size / 1024),
                aiUsed: 'GPT-5-document'
            }
        );
        
        return {
            success: true,
            type: 'document',
            analysis: analysis,
            aiUsed: 'GPT-5-document',
            fileName: document.file_name,
            telegramDelivered: success
        };
        
    } catch (error) {
        console.error('Document analysis error:', error.message);
        
        await telegramSplitter.sendAlert(
            bot,
            chatId,
            `Document analysis failed: ${error.message}`,
            'Document Analysis Error'
        );
        
        return {
            success: false,
            error: error.message,
            type: 'document'
        };
        
    } finally {
        if (tempFilePath) {
            await cleanupTempFile(tempFilePath);
        }
    }
}

// VOICE ANALYSIS (Transcription + Analysis)
async function analyzeVoice(bot, voice, prompt, chatId) {
    let tempFilePath = null;
    
    try {
        if (!openaiClient) {
            throw new Error('OpenAI client not available');
        }
        
        console.log('Starting voice analysis...');
        
        // Download voice file
        const filename = generateTempFilename('voice', 'ogg');
        tempFilePath = await downloadTelegramFile(bot, voice.file_id, filename);
        
        // For now, we'll send a placeholder response
        // Full voice transcription would require Whisper API integration
        const analysis = "Voice message received. Transcription and analysis capabilities are being developed. Please send text messages for full GPT-5 analysis.";
        
        const success = await telegramSplitter.sendGPTResponse(
            bot,
            chatId,
            analysis,
            'Voice Analysis (Limited)',
            {
                type: 'voice_analysis',
                duration: voice.duration,
                aiUsed: 'voice-placeholder'
            }
        );
        
        return {
            success: true,
            type: 'voice',
            analysis: analysis,
            aiUsed: 'voice-placeholder',
            duration: voice.duration,
            telegramDelivered: success,
            transcription: null
        };
        
    } catch (error) {
        console.error('Voice analysis error:', error.message);
        
        await telegramSplitter.sendAlert(
            bot,
            chatId,
            `Voice analysis failed: ${error.message}`,
            'Voice Analysis Error'
        );
        
        return {
            success: false,
            error: error.message,
            type: 'voice'
        };
        
    } finally {
        if (tempFilePath) {
            await cleanupTempFile(tempFilePath);
        }
    }
}

// AUDIO ANALYSIS
async function analyzeAudio(bot, audio, prompt, chatId) {
    return await analyzeVoice(bot, audio, prompt, chatId);
}

// VIDEO ANALYSIS
async function analyzeVideo(bot, video, prompt, chatId) {
    try {
        console.log('Video analysis requested...');
        
        const analysis = "Video analysis capabilities are being developed. For now, please describe the video content in text and I can provide analysis based on your description.";
        
        const success = await telegramSplitter.sendGPTResponse(
            bot,
            chatId,
            analysis,
            'Video Analysis (Limited)',
            {
                type: 'video_analysis',
                duration: video.duration,
                aiUsed: 'video-placeholder'
            }
        );
        
        return {
            success: true,
            type: 'video',
            analysis: analysis,
            aiUsed: 'video-placeholder',
            duration: video.duration,
            telegramDelivered: success
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            type: 'video'
        };
    }
}

// VIDEO NOTE ANALYSIS
async function analyzeVideoNote(bot, videoNote, prompt, chatId) {
    return await analyzeVideo(bot, videoNote, prompt, chatId);
}

// SYSTEM STATUS
function getMultimodalStatus() {
    return {
        available: !!openaiClient,
        capabilities: {
            image_analysis: !!openaiClient,
            voice_transcription: false, // Placeholder
            document_processing: !!openaiClient,
            video_analysis: false // Placeholder
        },
        supported_formats: {
            images: MULTIMODAL_CONFIG.SUPPORTED_IMAGE_TYPES,
            documents: MULTIMODAL_CONFIG.SUPPORTED_DOCUMENT_TYPES,
            audio: MULTIMODAL_CONFIG.SUPPORTED_AUDIO_TYPES,
            video: MULTIMODAL_CONFIG.SUPPORTED_VIDEO_TYPES
        },
        limitations: [
            'PDF processing requires additional libraries',
            'Voice transcription needs Whisper API integration',
            'Video analysis is placeholder only',
            'File size limit: 20MB'
        ]
    };
}

// Initialize
console.log('Multimodal module loaded with GPT-5 vision support');
ensureTempDir();

module.exports = {
    analyzeImage,
    analyzeDocument,
    analyzeVoice,
    analyzeAudio,
    analyzeVideo,
    analyzeVideoNote,
    getMultimodalStatus,
    
    // Utility functions
    downloadTelegramFile,
    cleanupTempFile,
    generateTempFilename,
    
    // Configuration
    MULTIMODAL_CONFIG
};
