// utils/multimodal.js - Fixed GPT-5 Vision, Document, Voice/Audio Analysis
// Working image analysis with proper OpenAI integration

const fs = require('fs').promises;
const fsc = require('fs');
const path = require('path');
const crypto = require('crypto');

// Optional parsers
let pdfParse = null;
let mammoth = null;
let xlsxLib = null;
let textract = null;
try { pdfParse = require('pdf-parse'); } catch (_) {}
try { mammoth = require('mammoth'); } catch (_) {}
try { xlsxLib = require('xlsx'); } catch (_) {}
try { textract = require('textract'); } catch (_) {}

// OpenAI client - fixed import
let openaiClient;
try {
  openaiClient = require('./openaiClient');
  console.log('OpenAI client loaded for multimodal analysis');
} catch (error) {
  console.error('OpenAI client not available:', error.message);
  openaiClient = null;
}

// Telegram splitter
let telegramSplitter;
try {
  telegramSplitter = require('./telegramSplitter');
  console.log('Telegram splitter loaded');
} catch (error) {
  console.warn('Telegram splitter not available:', error.message);
  telegramSplitter = {
    sendGPTResponse: async () => false,
    sendAlert: async () => false
  };
}

// Memory integration
let saveConversationEmergency;
try {
  const memoryModule = require('./memoryIntegration');
  saveConversationEmergency = memoryModule.saveConversationEmergency;
  console.log('Memory integration loaded');
} catch (error) {
  console.warn('Memory integration not available:', error.message);
  saveConversationEmergency = async () => {};
}

// Configuration
const MULTIMODAL_CONFIG = {
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  SUPPORTED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  SUPPORTED_DOCUMENT_TYPES: ['pdf', 'txt', 'doc', 'docx', 'md', 'csv', 'xlsx', 'pptx'],
  SUPPORTED_AUDIO_TYPES: ['mp3', 'wav', 'm4a', 'ogg'],
  SUPPORTED_VIDEO_TYPES: ['mp4', 'mov', 'avi', 'webm'],
  TEMP_DIR: './temp_multimodal',
  CLEANUP_INTERVAL: 300000,
  DOCUMENT_CONTEXT_TIMEOUT: 1800000
};

// Document context storage
const documentContexts = new Map();

// Ensure temp directory
async function ensureTempDir() {
  try {
    await fs.mkdir(MULTIMODAL_CONFIG.TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create temp directory:', error.message);
  }
}

// Generate filename
function generateTempFilename(originalName, type) {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  const extension = ext && ext.length > 1 ? ext : `.${type}`;
  return `${type}_${timestamp}_${randomId}${extension}`;
}

// Download Telegram file - fixed implementation
async function downloadTelegramFile(bot, fileId, filename) {
  try {
    await ensureTempDir();
    
    // Get file info first
    const fileInfo = await bot.getFile(fileId);
    if (!fileInfo || !fileInfo.file_path) {
      throw new Error('Unable to get file path from Telegram');
    }
    
    const filePath = path.join(MULTIMODAL_CONFIG.TEMP_DIR, filename);
    
    // Use bot's downloadFile method if available, otherwise use file stream
    if (typeof bot.downloadFile === 'function') {
      const buffer = await bot.downloadFile(fileId, MULTIMODAL_CONFIG.TEMP_DIR);
      await fs.writeFile(filePath, buffer);
    } else {
      // Fallback to stream method
      const fileStream = bot.getFileStream(fileId);
      const writeStream = fsc.createWriteStream(filePath);
      
      await new Promise((resolve, reject) => {
        fileStream.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        fileStream.on('error', reject);
      });
    }
    
    return filePath;
  } catch (error) {
    console.error('File download error:', error.message);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

// Store document context
function storeDocumentContext(chatId, fileName, fileType, extractedText, analysis) {
  const context = {
    fileName,
    fileType,
    extractedText: extractedText.substring(0, 10000),
    analysis,
    timestamp: Date.now()
  };
  
  documentContexts.set(chatId, context);
  
  setTimeout(() => {
    if (documentContexts.has(chatId)) {
      const stored = documentContexts.get(chatId);
      if (stored.timestamp === context.timestamp) {
        documentContexts.delete(chatId);
        console.log('Cleaned up document context for chat:', chatId);
      }
    }
  }, MULTIMODAL_CONFIG.DOCUMENT_CONTEXT_TIMEOUT);
}

// Get document context
function getDocumentContext(chatId) {
  const context = documentContexts.get(chatId);
  if (context && Date.now() - context.timestamp < MULTIMODAL_CONFIG.DOCUMENT_CONTEXT_TIMEOUT) {
    return context;
  }
  return null;
}

// Cleanup temp file
async function cleanupTempFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log('Cleaned up temp file:', filePath);
  } catch (error) {
    console.warn('Cleanup failed for:', filePath, error.message);
  }
}

// Fixed image analysis with proper OpenAI vision API
async function analyzeImage(bot, fileId, prompt, chatId) {
  let tempFilePath = null;
  const startedAt = Date.now();

  try {
    if (!openaiClient || !openaiClient.openai) {
      throw new Error('OpenAI client not properly configured');
    }
    
    console.log('Starting GPT-5 image analysis...');

    const filename = generateTempFilename('image.jpg', 'img');
    tempFilePath = await downloadTelegramFile(bot, fileId, filename);

    // Verify file exists and has content
    const stats = await fs.stat(tempFilePath);
    if (stats.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    const imageBuffer = await fs.readFile(tempFilePath);
    const base64Image = imageBuffer.toString('base64');
    const imageSizeKB = Math.round(imageBuffer.length / 1024);

    console.log(`Image loaded: ${imageSizeKB}KB`);

    const visionPrompt = prompt || "Analyze this image in detail. Describe key elements, context, and provide insights.";

    // Use OpenAI vision API directly
    const response = await openaiClient.openai.chat.completions.create({
      model: "gpt-4o", // Use GPT-4 with vision
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: visionPrompt },
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
      max_tokens: 2000
    });

    const analysis = response.choices[0]?.message?.content;
    if (!analysis) {
      throw new Error('No analysis returned from vision API');
    }

    // Store context for follow-up questions
    storeDocumentContext(chatId, filename, 'image', 'Image analysis completed', analysis);

    // Save to conversation memory
    await saveConversationEmergency(chatId, 
      'Image uploaded for analysis', 
      analysis, 
      { 
        aiUsed: 'GPT-4-vision',
        type: 'image_analysis',
        fileSizeKB: imageSizeKB,
        processingMs: Date.now() - startedAt
      }
    );

    // Send response via telegram splitter
    const success = await telegramSplitter.sendGPTResponse(
      bot,
      chatId,
      analysis,
      'Vision Analysis',
      {
        type: 'image_analysis',
        fileSizeKB: imageSizeKB,
        processingMs: Date.now() - startedAt,
        aiUsed: 'GPT-4-vision'
      }
    );

    return {
      success: true,
      type: 'image',
      analysis,
      aiUsed: 'GPT-4-vision',
      fileSizeKB: imageSizeKB,
      telegramDelivered: success
    };

  } catch (error) {
    console.error('Image analysis error:', error.message);
    
    // Send error alert
    await telegramSplitter.sendAlert(bot, chatId, 
      `Image analysis failed: ${error.message}`, 
      'Vision Analysis Error'
    );
    
    return { success: false, error: error.message, type: 'image' };
  } finally {
    if (tempFilePath) {
      await cleanupTempFile(tempFilePath);
    }
  }
}

// Extract text from documents
async function extractTextFromFile(filePath, fileExtension) {
  const ext = (fileExtension || path.extname(filePath).slice(1)).toLowerCase();

  switch (ext) {
    case 'txt':
    case 'md':
      return await fs.readFile(filePath, 'utf8');

    case 'pdf':
      if (!pdfParse) throw new Error('PDF support requires "pdf-parse". Run: npm i pdf-parse');
      const buffer = await fs.readFile(filePath);
      const { text } = await pdfParse(buffer);
      return text || '';

    case 'docx':
      if (!mammoth) throw new Error('DOCX support requires "mammoth". Run: npm i mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return (result && result.value) ? result.value : '';

    case 'doc':
    case 'pptx':
      if (!textract) throw new Error(`${ext.toUpperCase()} support requires "textract". Run: npm i textract`);
      return await new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, (err, text) => {
          if (err) return reject(err);
          resolve(text || '');
        });
      });

    case 'csv':
      return await fs.readFile(filePath, 'utf8');

    case 'xlsx':
      if (!xlsxLib) throw new Error('XLSX support requires "xlsx". Run: npm i xlsx');
      const wb = xlsxLib.readFile(filePath, { cellDates: true });
      let out = [];
      wb.SheetNames.forEach((name) => {
        const sheet = wb.Sheets[name];
        const rows = xlsxLib.utils.sheet_to_json(sheet, { header: 1 });
        const preview = rows.slice(0, 100).map(r => (Array.isArray(r) ? r.join('\t') : String(r))).join('\n');
        out.push(`--- Sheet: ${name} ---\n${preview}`);
      });
      return out.join('\n\n');

    default:
      throw new Error(`Unsupported document type: ${ext}`);
  }
}

// Document analysis with memory
async function analyzeDocument(bot, document, prompt, chatId) {
  let tempFilePath = null;

  try {
    if (!openaiClient) throw new Error('OpenAI client not available');
    console.log('Starting document analysis...');

    if (document.file_size > MULTIMODAL_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${Math.round(document.file_size / 1024 / 1024)}MB (max: 20MB)`);
    }

    const fileExtension = (path.extname(document.file_name) || '').toLowerCase().slice(1);
    if (!MULTIMODAL_CONFIG.SUPPORTED_DOCUMENT_TYPES.includes(fileExtension)) {
      throw new Error(`Unsupported document type: ${fileExtension}`);
    }

    const filename = generateTempFilename(document.file_name, 'doc');
    tempFilePath = await downloadTelegramFile(bot, document.file_id, filename);

    let documentText = await extractTextFromFile(tempFilePath, fileExtension);
    if (!documentText || !documentText.trim()) {
      throw new Error('No extractable text found in document');
    }

    const originalTextLength = documentText.length;
    const MAX_CHARS = 120_000;
    let truncatedNotice = '';
    
    if (documentText.length > MAX_CHARS) {
      documentText = documentText.slice(0, MAX_CHARS) + '\n\n...[truncated for analysis]';
      truncatedNotice = '\n\n⚠️ Note: Large file — content truncated for analysis.';
    }

    const analysisPrompt = 
      `${prompt || 'Analyze this document and provide a structured summary with key findings, important data, risks, metrics, and actionable insights.'}\n\n` +
      `DOCUMENT: ${document.file_name} (${fileExtension.toUpperCase()})\n` +
      `--- BEGIN DOCUMENT TEXT ---\n${documentText}\n--- END DOCUMENT TEXT ---${truncatedNotice}`;

    // Use OpenAI API for analysis
    const analysis = await openaiClient.getGPT5Analysis(analysisPrompt, {
      model: 'gpt-4o-mini',
      max_completion_tokens: 3500
    });

    // Store context and save to memory
    storeDocumentContext(chatId, document.file_name, fileExtension, documentText, analysis);

    await saveConversationEmergency(chatId, 
      `Document uploaded: ${document.file_name}`, 
      `DOCUMENT ANALYSIS:\n\n${analysis}\n\n--- ORIGINAL DOCUMENT TEXT (truncated) ---\n${documentText.substring(0, 2000)}${documentText.length > 2000 ? '...' : ''}`, 
      { 
        aiUsed: 'GPT-4-document',
        type: 'document_analysis',
        fileName: document.file_name,
        fileType: fileExtension,
        fileSizeKB: Math.round(document.file_size / 1024),
        originalTextLength: originalTextLength
      }
    );

    const enhancedAnalysis = `**Document:** ${document.file_name} (${fileExtension.toUpperCase()}, ${Math.round(document.file_size / 1024)}KB)\n\n${analysis}\n\n💡 *You can now ask follow-up questions about this document.*`;

    const success = await telegramSplitter.sendGPTResponse(
      bot,
      chatId,
      enhancedAnalysis,
      'Document Analysis',
      {
        type: 'document_analysis',
        fileName: document.file_name,
        fileSizeKB: Math.round(document.file_size / 1024),
        fileType: fileExtension,
        aiUsed: 'GPT-4-document'
      }
    );

    return {
      success: true,
      type: 'document',
      analysis: enhancedAnalysis,
      aiUsed: 'GPT-4-document',
      fileName: document.file_name,
      fileType: fileExtension,
      telegramDelivered: success
    };

  } catch (error) {
    console.error('Document analysis error:', error.message);
    await telegramSplitter.sendAlert(bot, chatId, `Document analysis failed: ${error.message}`, 'Document Analysis Error');
    return { success: false, error: error.message, type: 'document' };
  } finally {
    if (tempFilePath) await cleanupTempFile(tempFilePath);
  }
}

// Transcribe audio using Whisper
async function transcribeAudioFromFile(filePath) {
  if (!openaiClient || !openaiClient.openai) {
    throw new Error('OpenAI client not available for transcription');
  }
  
  const transcription = await openaiClient.openai.audio.transcriptions.create({
    file: fsc.createReadStream(filePath),
    model: 'whisper-1'
  });
  
  return transcription && transcription.text ? transcription.text : '';
}

// Voice analysis with transcription
async function analyzeVoice(bot, voice, prompt, chatId) {
  let tempFilePath = null;
  
  try {
    if (!openaiClient) throw new Error('OpenAI client not available');
    console.log('Starting voice transcription and analysis...');

    const filename = generateTempFilename('voice.ogg', 'ogg');
    tempFilePath = await downloadTelegramFile(bot, voice.file_id, filename);

    const transcribedText = await transcribeAudioFromFile(tempFilePath);
    if (!transcribedText) throw new Error('No transcription text returned');

    const analysisPrompt = `${prompt || 'Analyze this transcribed voice message and provide a concise summary, sentiment analysis, key points, and actionable insights.'}\n\nTranscribed voice message:\n"${transcribedText}"`;

    const analysis = await openaiClient.getGPT5Analysis(analysisPrompt, {
      model: 'gpt-4o-mini',
      max_completion_tokens: 2000
    });

    const fullResponse = `**Voice Transcription (${voice.duration}s):**\n"${transcribedText}"\n\n**Analysis:**\n${analysis}`;

    storeDocumentContext(chatId, `voice_${Date.now()}`, 'voice', transcribedText, analysis);

    await saveConversationEmergency(chatId, 
      'Voice message received and transcribed', 
      fullResponse, 
      { 
        aiUsed: 'Whisper + GPT-4',
        type: 'voice_analysis',
        duration: voice.duration,
        transcriptionLength: transcribedText.length
      }
    );

    const success = await telegramSplitter.sendGPTResponse(
      bot,
      chatId,
      fullResponse,
      'Voice Transcription & Analysis',
      {
        type: 'voice_analysis',
        duration: voice.duration,
        transcriptionLength: transcribedText.length,
        aiUsed: 'Whisper + GPT-4'
      }
    );

    return {
      success: true,
      type: 'voice',
      analysis: fullResponse,
      transcription: transcribedText,
      aiUsed: 'Whisper + GPT-4',
      duration: voice.duration,
      telegramDelivered: success
    };

  } catch (error) {
    console.error('Voice analysis error:', error.message);
    const fallbackMessage = `Voice message received (${voice?.duration ?? 0}s). Transcription temporarily unavailable. Please send text for full analysis.\n\nError: ${error.message}`;
    
    await telegramSplitter.sendGPTResponse(bot, chatId, fallbackMessage, 'Voice Analysis (Limited)', {
      type: 'voice_fallback',
      duration: voice?.duration ?? 0,
      error: error.message
    });
    
    return { success: false, error: error.message, type: 'voice' };
  } finally {
    if (tempFilePath) await cleanupTempFile(tempFilePath);
  }
}

// Audio analysis (same as voice)
async function analyzeAudio(bot, audio, prompt, chatId) {
  return await analyzeVoice(bot, audio, prompt, chatId);
}

// Video analysis placeholder
async function analyzeVideo(bot, video, prompt, chatId) {
  try {
    console.log('Video analysis requested (placeholder)...');
    const analysis = "Video analysis capabilities are being developed. For now, please describe the video content in text and I can analyze based on your description.";
    
    storeDocumentContext(chatId, `video_${Date.now()}`, 'video', 'Video analysis requested', analysis);
    
    await saveConversationEmergency(chatId, 
      'Video uploaded for analysis', 
      analysis, 
      { 
        aiUsed: 'video-placeholder',
        type: 'video_analysis',
        duration: video?.duration ?? 0
      }
    );

    const success = await telegramSplitter.sendGPTResponse(
      bot, chatId, analysis, 'Video Analysis (Limited)',
      { type: 'video_analysis', duration: video?.duration ?? 0, aiUsed: 'video-placeholder' }
    );
    
    return {
      success: true,
      type: 'video',
      analysis,
      aiUsed: 'video-placeholder',
      duration: video?.duration ?? 0,
      telegramDelivered: success
    };
  } catch (error) {
    return { success: false, error: error.message, type: 'video' };
  }
}

// Video note analysis
async function analyzeVideoNote(bot, videoNote, prompt, chatId) {
  return await analyzeVideo(bot, videoNote, prompt, chatId);
}

// Get context for follow-up questions
function getContextForFollowUp(chatId, userMessage) {
  const context = getDocumentContext(chatId);
  if (!context) return null;
  
  return `RECENT DOCUMENT CONTEXT:
File: ${context.fileName} (${context.fileType})
Previous Analysis: ${context.analysis.substring(0, 1000)}...
Document Content (sample): ${context.extractedText.substring(0, 1000)}...

Current Question: ${userMessage}

Please answer based on the document context above.`;
}

// Status check
function getMultimodalStatus() {
  return {
    available: !!openaiClient,
    memoryIntegration: !!saveConversationEmergency,
    contextTracking: true,
    capabilities: {
      image_analysis: !!openaiClient,
      voice_transcription: !!openaiClient,
      document_processing: {
        txt: true,
        md: true,
        pdf: !!pdfParse,
        docx: !!mammoth,
        doc: !!textract,
        csv: true,
        xlsx: !!xlsxLib,
        pptx: !!textract
      },
      video_analysis: false,
      follow_up_questions: true
    },
    supported_formats: {
      images: MULTIMODAL_CONFIG.SUPPORTED_IMAGE_TYPES,
      documents: MULTIMODAL_CONFIG.SUPPORTED_DOCUMENT_TYPES,
      audio: MULTIMODAL_CONFIG.SUPPORTED_AUDIO_TYPES,
      video: MULTIMODAL_CONFIG.SUPPORTED_VIDEO_TYPES
    },
    limitations: [
      !pdfParse ? 'Install pdf-parse for PDF text extraction' : null,
      !mammoth ? 'Install mammoth for DOCX text extraction' : null,
      !xlsxLib ? 'Install xlsx for Excel parsing' : null,
      !textract ? 'Install textract for DOC/PPTX formats' : null,
      `File size limit: ${Math.round(MULTIMODAL_CONFIG.MAX_FILE_SIZE/1024/1024)}MB`
    ].filter(Boolean),
    activeContexts: documentContexts.size
  };
}

// Cleanup interval
setInterval(async () => {
  try {
    await ensureTempDir();
    const files = await fs.readdir(MULTIMODAL_CONFIG.TEMP_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(MULTIMODAL_CONFIG.TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtime.getTime() > 600000) { // 10 minutes
        await cleanupTempFile(filePath);
      }
    }
  } catch (error) {
    console.warn('Periodic cleanup failed:', error.message);
  }
}, MULTIMODAL_CONFIG.CLEANUP_INTERVAL);

// Initialize
console.log('Fixed multimodal module loaded with working image analysis');
ensureTempDir();

// Exports
module.exports = {
  analyzeImage,
  analyzeDocument,
  analyzeVoice,
  analyzeAudio,
  analyzeVideo,
  analyzeVideoNote,
  getMultimodalStatus,
  getContextForFollowUp,
  getDocumentContext,
  storeDocumentContext,
  downloadTelegramFile,
  cleanupTempFile,
  generateTempFilename,
  MULTIMODAL_CONFIG
};
