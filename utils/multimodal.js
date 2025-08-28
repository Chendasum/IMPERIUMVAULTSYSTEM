// utils/multimodal.js - GPT-5 Vision, Document, Voice/Audio, and Video Analysis
// Integrates with GPT-5's multimodal capabilities and adds robust document parsing.

// Core deps
const fs = require('fs').promises;
const fsc = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Optional parsers (loaded lazily if available) ---
let pdfParse = null;
let mammoth = null;
let xlsxLib = null;
let textract = null;
try { pdfParse = require('pdf-parse'); } catch (_) {}
try { mammoth  = require('mammoth'); }    catch (_) {}
try { xlsxLib  = require('xlsx'); }       catch (_) {}
try { textract = require('textract'); }   catch (_) {}

// --- OpenAI client (your existing wrapper) ---
let openaiClient;
try {
  openaiClient = require('./openaiClient');
  console.log('GPT-5 client loaded for multimodal analysis');
} catch (error) {
  console.error('OpenAI client not available for multimodal:', error.message);
  openaiClient = null;
}

// --- Telegram splitter for delivery ---
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

// --- Config ---
const MULTIMODAL_CONFIG = {
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
  SUPPORTED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  SUPPORTED_DOCUMENT_TYPES: [
    'pdf', 'txt', 'doc', 'docx', 'md',
    'csv', 'xlsx', 'pptx'
  ],
  SUPPORTED_AUDIO_TYPES: ['mp3', 'wav', 'm4a', 'ogg'],
  SUPPORTED_VIDEO_TYPES: ['mp4', 'mov', 'avi', 'webm'],
  TEMP_DIR: './temp_multimodal',
  CLEANUP_INTERVAL: 300000 // 5 minutes
};

// --- Temp dir ensure ---
async function ensureTempDir() {
  try {
    await fs.mkdir(MULTIMODAL_CONFIG.TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create temp directory:', error.message);
  }
}

// --- Unique filename ---
function generateTempFilename(originalName, type) {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  const extension = ext && ext.length > 1 ? ext : `.${type}`;
  return `${type}_${timestamp}_${randomId}${extension}`;
}

// --- Download Telegram file ---
async function downloadTelegramFile(bot, fileId, filename) {
  try {
    await ensureTempDir();
    // getFile to make sure file exists (and get path)
    await bot.getFile(fileId);
    const filePath = path.join(MULTIMODAL_CONFIG.TEMP_DIR, filename);

    // Stream download
    const fileStream = bot.getFileStream(fileId);
    const writeStream = fsc.createWriteStream(filePath);

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

// --- Cleanup a single file ---
async function cleanupTempFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log('Cleaned up temp file:', filePath);
  } catch (error) {
    console.warn('Cleanup failed for:', filePath, error.message);
  }
}

// --- Periodic cleanup (old files > 10min) ---
setInterval(async () => {
  try {
    await ensureTempDir();
    const files = await fs.readdir(MULTIMODAL_CONFIG.TEMP_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(MULTIMODAL_CONFIG.TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtime.getTime() > 600000) {
        await cleanupTempFile(filePath);
      }
    }
  } catch (error) {
    console.warn('Periodic cleanup failed:', error.message);
  }
}, MULTIMODAL_CONFIG.CLEANUP_INTERVAL);

// --- Helper: Extract text from file by extension ---
async function extractTextFromFile(filePath, fileExtension) {
  const ext = (fileExtension || path.extname(filePath).slice(1)).toLowerCase();

  switch (ext) {
    case 'txt':
    case 'md': {
      return await fs.readFile(filePath, 'utf8');
    }

    case 'pdf': {
      if (!pdfParse) throw new Error('PDF support requires "pdf-parse". Run: npm i pdf-parse');
      const buffer = await fs.readFile(filePath);
      const { text } = await pdfParse(buffer);
      return text || '';
    }

    case 'docx': {
      if (!mammoth) throw new Error('DOCX support requires "mammoth". Run: npm i mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return (result && result.value) ? result.value : '';
    }

    case 'doc':
    case 'pptx': {
      if (!textract) throw new Error(`${ext.toUpperCase()} support requires "textract". Run: npm i textract`);
      return await new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, (err, text) => {
          if (err) return reject(err);
          resolve(text || '');
        });
      });
    }

    case 'csv': {
      return await fs.readFile(filePath, 'utf8');
    }

    case 'xlsx': {
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
    }

    default:
      throw new Error(`Unsupported document type: ${ext}`);
  }
}

// --- GPT-5 Vision: Image analysis ---
async function analyzeImage(bot, fileId, prompt, chatId) {
  let tempFilePath = null;
  const startedAt = Date.now();

  try {
    if (!openaiClient) throw new Error('OpenAI client not available');
    console.log('Starting GPT-5 image analysis...');

    const filename = generateTempFilename('image.jpg', 'img');
    tempFilePath = await downloadTelegramFile(bot, fileId, filename);

    const imageBuffer = await fs.readFile(tempFilePath);
    const base64Image = imageBuffer.toString('base64');
    const imageSizeKB = Math.round(imageBuffer.length / 1024);

    const visionPrompt = prompt || "Analyze this image in detail. Describe key elements, context, and provide insights.";

    const analysis = await openaiClient.getGPT5Analysis([
      { type: "text", text: visionPrompt },
      {
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: "high" }
      }
    ], {
      model: 'gpt-5',
      max_completion_tokens: 2000,
      reasoning_effort: 'medium'
    });

    const success = await telegramSplitter.sendGPTResponse(
      bot,
      chatId,
      analysis,
      'GPT-5 Vision Analysis',
      {
        type: 'image_analysis',
        fileSizeKB: imageSizeKB,
        processingMs: Date.now() - startedAt,
        aiUsed: 'GPT-5-vision'
      }
    );

    return {
      success: true,
      type: 'image',
      analysis,
      aiUsed: 'GPT-5-vision',
      fileSizeKB: imageSizeKB,
      telegramDelivered: success
    };

  } catch (error) {
    console.error('Image analysis error:', error.message);
    await telegramSplitter.sendAlert(bot, chatId, `Image analysis failed: ${error.message}`, 'Vision Analysis Error');
    return { success: false, error: error.message, type: 'image' };
  } finally {
    if (tempFilePath) await cleanupTempFile(tempFilePath);
  }
}

// --- Document analysis (PDF, DOCX, DOC, CSV, XLSX, MD, TXT, PPTX) ---
async function analyzeDocument(bot, document, prompt, chatId) {
  let tempFilePath = null;

  try {
    if (!openaiClient) throw new Error('OpenAI client not available');
    console.log('Starting document analysis...');

    // Size guard
    if (document.file_size > MULTIMODAL_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${Math.round(document.file_size / 1024 / 1024)}MB (max: 20MB)`);
    }

    // Type guard
    const fileExtension = (path.extname(document.file_name) || '').toLowerCase().slice(1);
    if (!MULTIMODAL_CONFIG.SUPPORTED_DOCUMENT_TYPES.includes(fileExtension)) {
      throw new Error(`Unsupported document type: ${fileExtension}`);
    }

    // Download
    const filename = generateTempFilename(document.file_name, 'doc');
    tempFilePath = await downloadTelegramFile(bot, document.file_id, filename);

    // Extract text
    let documentText = await extractTextFromFile(tempFilePath, fileExtension);
    if (!documentText || !documentText.trim()) {
      throw new Error('No extractable text found in document');
    }

    // Limit size for GPT
    const MAX_CHARS = 120_000;
    let truncatedNotice = '';
    if (documentText.length > MAX_CHARS) {
      documentText = documentText.slice(0, MAX_CHARS) + '\n\n...[truncated for analysis]';
      truncatedNotice = '\n\n⚠️ Note: Large file — content truncated for analysis.';
    }

    // Prompt
    const analysisPrompt =
      `${prompt || 'Analyze this document and provide a structured summary (sections, key findings, risks, metrics, and action items).'}\n\n` +
      `--- BEGIN DOCUMENT TEXT ---\n${documentText}\n--- END DOCUMENT TEXT ---${truncatedNotice}`;

    // GPT analysis
    const analysis = await openaiClient.getGPT5Analysis(analysisPrompt, {
      model: 'gpt-5-mini',
      max_completion_tokens: 3500,
      reasoning_effort: 'medium'
    });

    // Deliver
    const success = await telegramSplitter.sendGPTResponse(
      bot,
      chatId,
      analysis,
      'Document Analysis',
      {
        type: 'document_analysis',
        fileName: document.file_name,
        fileSizeKB: Math.round(document.file_size / 1024),
        fileType: fileExtension,
        aiUsed: 'GPT-5-document'
      }
    );

    return {
      success: true,
      type: 'document',
      analysis,
      aiUsed: 'GPT-5-document',
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

// --- Helper: transcribe audio file via Whisper (OpenAI) ---
async function transcribeAudioFromFile(filePath) {
  if (!openaiClient || !openaiClient.openai || !openaiClient.openai.audio || !openaiClient.openai.audio.transcriptions) {
    throw new Error('Whisper transcription client not available on openaiClient');
  }
  // Using your original approach/signature
  const transcription = await openaiClient.openai.audio.transcriptions.create({
    file: fsc.createReadStream(filePath),
    model: 'whisper-1',
    // language: 'en' // optional — auto-detect if omitted
  });
  return transcription && transcription.text ? transcription.text : '';
}

// --- Voice analysis (uses Telegram voice object) ---
async function analyzeVoice(bot, voice, prompt, chatId) {
  let tempFilePath = null;
  try {
    if (!openaiClient) throw new Error('OpenAI client not available');
    console.log('Starting voice transcription and analysis...');

    const filename = generateTempFilename('voice.ogg', 'ogg');
    tempFilePath = await downloadTelegramFile(bot, voice.file_id, filename);

    const transcribedText = await transcribeAudioFromFile(tempFilePath);
    if (!transcribedText) throw new Error('No transcription text returned');

    const analysisPrompt = `${prompt || 'Analyze this transcribed voice message and produce a concise summary, sentiment, key points, and action items.'}\n\nTranscribed text:\n"${transcribedText}"`;

    const analysis = await openaiClient.getGPT5Analysis(analysisPrompt, {
      model: 'gpt-5-mini',
      max_completion_tokens: 2000,
      reasoning_effort: 'medium'
    });

    const fullResponse = `**Transcription:**\n${transcribedText}\n\n**Analysis:**\n${analysis}`;

    const success = await telegramSplitter.sendGPTResponse(
      bot,
      chatId,
      fullResponse,
      'Voice Transcription & Analysis',
      {
        type: 'voice_analysis',
        duration: voice.duration,
        transcriptionLength: transcribedText.length,
        aiUsed: 'Whisper + GPT-5'
      }
    );

    return {
      success: true,
      type: 'voice',
      analysis: fullResponse,
      transcription: transcribedText,
      aiUsed: 'Whisper + GPT-5',
      duration: voice.duration,
      telegramDelivered: success
    };

  } catch (error) {
    console.error('Voice analysis error:', error.message);
    const fallbackMessage = `Voice message received (${voice?.duration ?? 0}s). Transcription temporarily unavailable. Please send text for full GPT-5 analysis.\n\nError: ${error.message}`;
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

// --- Audio analysis (Telegram "audio" object) ---
async function analyzeAudio(bot, audio, prompt, chatId) {
  // Same flow as voice; Telegram audio has file_id and duration too.
  return await analyzeVoice(bot, audio, prompt, chatId);
}

// --- Video analysis (placeholder) ---
async function analyzeVideo(bot, video, prompt, chatId) {
  try {
    console.log('Video analysis requested (placeholder)...');
    const analysis =
      "Video analysis capabilities are being developed. For now, please describe the video content in text and I can analyze based on your description.";
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

// --- Video note analysis (placeholder re-use) ---
async function analyzeVideoNote(bot, videoNote, prompt, chatId) {
  return await analyzeVideo(bot, videoNote, prompt, chatId);
}

// --- Capability / status ---
function getMultimodalStatus() {
  return {
    available: !!openaiClient,
    capabilities: {
      image_analysis: !!openaiClient,
      voice_transcription: true, // using Whisper via openaiClient
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
      video_analysis: false // placeholder
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
      !textract ? 'Install textract for DOC/PPTX and broader formats' : null,
      `File size limit: ${Math.round(MULTIMODAL_CONFIG.MAX_FILE_SIZE/1024/1024)}MB`
    ].filter(Boolean)
  };
}

// --- Init ---
console.log('Multimodal module loaded with GPT-5 vision + extended document support');
ensureTempDir();

// --- Exports ---
module.exports = {
  analyzeImage,
  analyzeDocument,
  analyzeVoice,
  analyzeAudio,
  analyzeVideo,
  analyzeVideoNote,
  getMultimodalStatus,

  // Utilities
  downloadTelegramFile,
  cleanupTempFile,
  generateTempFilename,

  // Config
  MULTIMODAL_CONFIG
};

