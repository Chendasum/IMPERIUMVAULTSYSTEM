// utils/multimodal.js - GPT-5 Multimodal: Vision, Documents, Voice/Audio (2025-08)
// FIXED VERSION - Compatible with smart telegramSplitter.js

'use strict';

const fs = require('fs').promises;
const fsc = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const axios = require('axios');

// ───────────────────────────────────────────────────────────────────────────────
// Optional parsers (load if installed; instruct if not)
let pdfParse = null;
let mammoth = null;
let xlsxLib = null;
let textract = null;
try { pdfParse = require('pdf-parse'); } catch (_) {}
try { mammoth = require('mammoth'); } catch (_) {}
try { xlsxLib = require('xlsx'); } catch (_) {}
try { textract = require('textract'); } catch (_) {}

// ───────────────────────────────────────────────────────────────────────────────
// OpenAI client (your production client wrapper)
let openaiClient;
try {
  openaiClient = require('./openaiClient');
  console.log('OpenAI client loaded for multimodal analysis');
} catch (error) {
  console.error('OpenAI client not available:', error.message);
  openaiClient = null;
}

// Telegram splitter - FIXED to use correct function names
let telegramSplitter;
try {
  telegramSplitter = require('./telegramSplitter');
  console.log('Telegram splitter loaded');
} catch (error) {
  console.warn('Telegram splitter not available:', error.message);
  telegramSplitter = null;
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ───────────────────────────────────────────────────────────────────────────────
// Minimal conversation memory (local, capped)
const conversationMemory = new Map();

function saveConversationEmergency(chatId, userMessage, aiResponse, metadata = {}) {
  try {
    const conversation = conversationMemory.get(chatId) || [];
    conversation.push({
      timestamp: Date.now(),
      userMessage,
      aiResponse,
      metadata
    });
    if (conversation.length > 50) conversation.shift(); // cap memory
    conversationMemory.set(chatId, conversation);
    console.log(`Saved conversation for chat ${chatId} (${conversation.length} total)`);
  } catch (error) {
    console.warn('Failed to save conversation:', error.message);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Config
const MULTIMODAL_CONFIG = {
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
  SUPPORTED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  SUPPORTED_DOCUMENT_TYPES: ['pdf', 'txt', 'doc', 'docx', 'md', 'csv', 'xlsx', 'pptx'],
  SUPPORTED_AUDIO_TYPES: ['mp3', 'wav', 'm4a', 'ogg', 'oga', 'mp4', 'webm', 'mpga', 'mpeg', 'flac'],
  SUPPORTED_VIDEO_TYPES: ['mp4', 'mov', 'avi', 'webm'],
  TEMP_DIR: path.join(os.tmpdir(), 'imperium_multimodal'),
  CLEANUP_INTERVAL: 300000,          // 5 minutes
  DOCUMENT_CONTEXT_TIMEOUT: 1800000, // 30 minutes

  // Document processing thresholds
  DOC_MAX_CHARS_DIRECT: 120_000,     // direct analysis limit (chars)
  DOC_CHUNK_SIZE: 40_000,            // ~ chunk size before prompt wrapping
  DOC_CHUNK_OVERLAP: 1_000           // overlap to preserve continuity
};

// ───────────────────────────────────────────────────────────────────────────────
// Document context storage
const documentContexts = new Map();

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(MULTIMODAL_CONFIG.TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create temp directory:', error.message);
  }
}

// Generate temp filename
function generateTempFilename(originalName, kindFallback) {
  const ts = Date.now();
  const rnd = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName || '').toLowerCase() || `.${kindFallback}`;
  const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
  return `${kindFallback}_${ts}_${rnd}${safeExt}`;
}

// ───────────────────────────────────────────────────────────────────────────────
// Telegram file download (robust, correct for node-telegram-bot-api)
async function downloadTelegramFile(bot, fileId, finalFilenameGuess) {
  if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN missing');
  await ensureTempDir();

  // 1) Ask Telegram for file path
  const fileInfo = await bot.getFile(fileId);
  if (!fileInfo || !fileInfo.file_path) {
    throw new Error('Unable to get file path from Telegram');
  }

  // 2) Build download URL and fetch bytes
  const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  const buffer = Buffer.from(res.data);

  if (buffer.length === 0) throw new Error('Downloaded file is empty');

  // 3) Decide local filename & save
  const ext = path.extname(fileInfo.file_path || '').toLowerCase();
  const filename =
    finalFilenameGuess && path.extname(finalFilenameGuess)
      ? finalFilenameGuess
      : generateTempFilename(fileInfo.file_path, (ext || '.bin').replace('.', ''));

  const outPath = path.join(MULTIMODAL_CONFIG.TEMP_DIR, filename);
  await fs.writeFile(outPath, buffer);

  // 4) Size check
  const stats = await fs.stat(outPath);
  if (stats.size > MULTIMODAL_CONFIG.MAX_FILE_SIZE) {
    await fs.unlink(outPath).catch(() => {});
    throw new Error(`File too large: ${Math.round(stats.size / 1024 / 1024)}MB (max: 20MB)`);
  }

  return { path: outPath, size: stats.size, ext: ext.replace('.', ''), file_path: fileInfo.file_path };
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

// ───────────────────────────────────────────────────────────────────────────────
// Document context helpers
function storeDocumentContext(chatId, fileName, fileType, extractedText, analysis) {
  const context = {
    fileName,
    fileType,
    extractedText: String(extractedText || '').substring(0, 10000), // store a safe slice
    analysis: String(analysis || ''),
    timestamp: Date.now()
  };
  documentContexts.set(chatId, context);

  // auto-clean this specific entry after timeout (unless overwritten)
  setTimeout(() => {
    const current = documentContexts.get(chatId);
    if (current && current.timestamp === context.timestamp) {
      documentContexts.delete(chatId);
      console.log('Cleaned up document context for chat:', chatId);
    }
  }, MULTIMODAL_CONFIG.DOCUMENT_CONTEXT_TIMEOUT);
}

function getDocumentContext(chatId) {
  const context = documentContexts.get(chatId);
  if (context && Date.now() - context.timestamp < MULTIMODAL_CONFIG.DOCUMENT_CONTEXT_TIMEOUT) return context;
  return null;
}

// ───────────────────────────────────────────────────────────────────────────────
// SMART TELEGRAM DELIVERY - FIXED VERSION
// ───────────────────────────────────────────────────────────────────────────────

async function sendToTelegram(bot, chatId, analysis, metadata = {}) {
  try {
    if (!bot || !chatId) return false;

    if (telegramSplitter && typeof telegramSplitter.sendTelegramMessage === 'function') {
      const meta = {
        ...metadata,
        model: metadata?.model || 'gpt-5-mini',
        enhanced: true
      };
      const result = await telegramSplitter.sendTelegramMessage(bot, chatId, analysis, meta);
      return !!(result && result.success !== false);
    }

    // Basic fallback
    await bot.sendMessage(chatId, analysis);
    console.log('Basic telegram delivery successful');
    return true;
  } catch (error) {
    console.error('Telegram delivery failed:', error.message);
    try {
      await bot.sendMessage(chatId, analysis);
      return true;
    } catch {
      return false;
    }
  }
}

async function sendErrorToTelegram(bot, chatId, errorMessage) {
  try {
    if (telegramSplitter?.sendTelegramMessage) {
      await telegramSplitter.sendTelegramMessage(bot, chatId, errorMessage, {
        model: 'error-handler',
        error: true
      });
      return true;
    }
    await bot.sendMessage(chatId, errorMessage);
    return true;
  } catch (error) {
    console.error('Error message delivery failed:', error.message);
    return false;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// IMAGE ANALYSIS (GPT-4o vision via Chat Completions) - FIXED
// ───────────────────────────────────────────────────────────────────────────────

async function analyzeImage(bot, fileId, prompt, chatId) {
  let temp = null;
  const startedAt = Date.now();

  try {
    if (!openaiClient || !openaiClient.openai) {
      throw new Error('OpenAI client not properly configured');
    }

    console.log('Starting GPT-4o Vision image analysis...');
    const guess = generateTempFilename('image.jpg', 'img');
    const dl = await downloadTelegramFile(bot, fileId, guess);
    temp = dl.path;

    const ext = (dl.ext || '').replace('.', '').toLowerCase();
    if (!MULTIMODAL_CONFIG.SUPPORTED_IMAGE_TYPES.includes(ext)) {
      throw new Error(
        `Unsupported image format: .${ext}. Please send one of: ${MULTIMODAL_CONFIG.SUPPORTED_IMAGE_TYPES.join(', ')}`
      );
    }

    const buf = await fs.readFile(temp);
    const base64 = buf.toString('base64');
    const sizeKB = Math.round(buf.length / 1024);

    const visionPrompt =
      prompt ||
      'Analyze this image. Describe key elements, context, composition, notable objects, and provide concise, useful insights.';

    // Chat Completions with image (data URL supported)
    const resp = await openaiClient.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: visionPrompt },
            { type: 'image_url', image_url: { url: `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`, detail: 'high' } }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const analysis = resp.choices?.[0]?.message?.content;
    if (!analysis) throw new Error('No analysis returned from vision API');

    storeDocumentContext(chatId, path.basename(temp), ext, 'Image analysis completed', analysis);

    await saveConversationEmergency(
      chatId,
      'Image uploaded for analysis',
      analysis,
      {
        aiUsed: 'GPT-4o-Vision',
        type: 'image_analysis',
        fileSizeKB: sizeKB,
        processingMs: Date.now() - startedAt
      }
    );

    const ok = await sendToTelegram(bot, chatId, analysis, {
      type: 'image_analysis',
      fileSizeKB: sizeKB,
      processingMs: Date.now() - startedAt,
      model: 'gpt-4o'
    });

    return {
      success: true,
      type: 'image',
      analysis,
      aiUsed: 'GPT-4o-Vision',
      fileSizeKB: sizeKB,
      telegramDelivered: ok
    };
  } catch (error) {
    console.error('Image analysis error:', error.message);
    const msg = `Image analysis failed: ${error.message}`;
    await sendErrorToTelegram(bot, chatId, msg);
    return { success: false, error: error.message, type: 'image' };
  } finally {
    if (temp) await cleanupTempFile(temp);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// FILE TEXT EXTRACTION
// ───────────────────────────────────────────────────────────────────────────────

async function extractTextFromFile(filePath, fileExtension) {
  const ext = (fileExtension || path.extname(filePath).slice(1)).toLowerCase();

  switch (ext) {
    case 'txt':
    case 'md':
      return await fs.readFile(filePath, 'utf8');

    case 'pdf': {
      if (!pdfParse) throw new Error('PDF support requires "pdf-parse". Install: npm i pdf-parse');
      const buffer = await fs.readFile(filePath);
      const { text } = await pdfParse(buffer);
      return text || '';
    }

    case 'docx': {
      if (!mammoth) throw new Error('DOCX support requires "mammoth". Install: npm i mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result?.value || '';
    }

    case 'doc':
    case 'pptx': {
      if (!textract) throw new Error(`${ext.toUpperCase()} support requires "textract". Install: npm i textract`);
      return await new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, (err, text) => (err ? reject(err) : resolve(text || '')));
      });
    }

    case 'csv':
      return await fs.readFile(filePath, 'utf8');

    case 'xlsx': {
      if (!xlsxLib) throw new Error('XLSX support requires "xlsx". Install: npm i xlsx');
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

// ───────────────────────────────────────────────────────────────────────────────
// TEXT CHUNKING + HIERARCHICAL SUMMARIZATION (for huge docs)
// ───────────────────────────────────────────────────────────────────────────────

function splitTextIntoChunks(text, size, overlap) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + size, text.length);
    chunks.push(text.slice(i, end));
    i = end - overlap;
    if (i < 0) i = 0;
    if (i >= text.length) break;
  }
  return chunks;
}

async function summarizeChunk(fileName, fileType, chunkText, index, total) {
  const prompt =
`You are Codex Analyst. Summarize chunk ${index + 1}/${total} of ${fileName} (${fileType.toUpperCase()}).
Provide: 1) Key points 2) Data/metrics 3) Risks/flags 4) Action items. Keep it tight and structured.

--- BEGIN CHUNK ---
${chunkText}
--- END CHUNK ---`;

  return await openaiClient.getGPT5Analysis(prompt, {
    model: 'gpt-5-mini',
    max_output_tokens: 1200,
    reasoning_effort: 'medium',
    verbosity: 'medium'
  });
}

async function mergeChunkSummaries(fileName, fileType, summaries) {
  const merged =
`You are Codex Analyst. Merge the following ${summaries.length} chunk summaries of ${fileName} (${fileType.toUpperCase()}).
Return a single, coherent report with: Executive Summary, Key Findings, Data Highlights, Risks, Opportunities, and Actionable Next Steps.

--- BEGIN CHUNK SUMMARIES ---
${summaries.map((s, i) => `\n[Chunk ${i + 1}]\n${s}`).join('\n')}
--- END CHUNK SUMMARIES ---`;

  return await openaiClient.getGPT5Analysis(merged, {
    model: 'gpt-5',
    max_output_tokens: 2000,
    reasoning_effort: 'high',
    verbosity: 'high'
  });
}

// ───────────────────────────────────────────────────────────────────────────────
// DOCUMENT ANALYSIS (GPT-5) - FIXED
// ───────────────────────────────────────────────────────────────────────────────

async function analyzeDocument(bot, document, prompt, chatId) {
  let temp = null;

  try {
    if (!openaiClient) throw new Error('OpenAI client not available');
    console.log('Starting document analysis...');

    if (document.file_size > MULTIMODAL_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${Math.round(document.file_size / 1024 / 1024)}MB (max: 20MB)`);
    }

    const ext = (path.extname(document.file_name) || '').toLowerCase().slice(1);
    if (!MULTIMODAL_CONFIG.SUPPORTED_DOCUMENT_TYPES.includes(ext)) {
      throw new Error(`Unsupported document type: ${ext}`);
    }

    const guess = generateTempFilename(document.file_name, 'doc');
    const dl = await downloadTelegramFile(bot, document.file_id, guess);
    temp = dl.path;

    let text = await extractTextFromFile(temp, ext);
    if (!text || !text.trim()) {
      throw new Error('No extractable text found in document');
    }

    const originalTextLength = text.length;

    let finalAnalysis = '';
    if (text.length <= MULTIMODAL_CONFIG.DOC_MAX_CHARS_DIRECT) {
      const truncatedNotice =
        text.length > MULTIMODAL_CONFIG.DOC_MAX_CHARS_DIRECT
          ? '\n\nNote: Large file - content truncated for analysis.'
          : '';

      const analysisPrompt =
`${prompt || 'Analyze this document and provide a structured summary with key findings, important data, risks, metrics, and actionable insights.'}

DOCUMENT: ${document.file_name} (${ext.toUpperCase()})
--- BEGIN DOCUMENT TEXT ---
${text.slice(0, MULTIMODAL_CONFIG.DOC_MAX_CHARS_DIRECT)}
--- END DOCUMENT TEXT ---${truncatedNotice}`;

      finalAnalysis = await openaiClient.getGPT5Analysis(analysisPrompt, {
        model: 'gpt-5-mini',
        max_output_tokens: 3500,
        reasoning_effort: 'medium',
        verbosity: 'medium'
      });
    } else {
      const chunks = splitTextIntoChunks(
        text,
        MULTIMODAL_CONFIG.DOC_CHUNK_SIZE,
        MULTIMODAL_CONFIG.DOC_CHUNK_OVERLAP
      );
      const summaries = [];
      for (let i = 0; i < chunks.length; i++) {
        const s = await summarizeChunk(document.file_name, ext, chunks[i], i, chunks.length);
        summaries.push(s);
      }
      finalAnalysis = await mergeChunkSummaries(document.file_name, ext, summaries);
    }

    storeDocumentContext(chatId, document.file_name, ext, text, finalAnalysis);

    await saveConversationEmergency(
      chatId,
      `Document uploaded: ${document.file_name}`,
      `DOCUMENT ANALYSIS:\n\n${finalAnalysis}\n\n--- ORIGINAL TEXT (sample) ---\n${text.substring(0, 2000)}${text.length > 2000 ? '...' : ''}`,
      {
        aiUsed: 'GPT-5-Document',
        type: 'document_analysis',
        fileName: document.file_name,
        fileType: ext,
        fileSizeKB: Math.round(document.file_size / 1024),
        originalTextLength
      }
    );

    const enhanced =
      `Document: ${document.file_name} (${ext.toUpperCase()}, ${Math.round(document.file_size / 1024)}KB)\n\n` +
      `${finalAnalysis}\n\nYou can now ask follow-up questions about this document.`;

    const ok = await sendToTelegram(bot, chatId, enhanced, {
      type: 'document_analysis',
      fileName: document.file_name,
      fileSizeKB: Math.round(document.file_size / 1024),
      fileType: ext,
      model: 'gpt-5-mini'
    });

    return {
      success: true,
      type: 'document',
      analysis: enhanced,
      aiUsed: 'GPT-5-Document',
      fileName: document.file_name,
      fileType: ext,
      telegramDelivered: ok
    };
  } catch (error) {
    console.error('Document analysis error:', error.message);
    const errorMsg = `Document analysis failed: ${error.message}`;
    await sendErrorToTelegram(bot, chatId, errorMsg);
    return { success: false, error: error.message, type: 'document' };
  } finally {
    if (temp) await cleanupTempFile(temp);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// AUDIO / VOICE - FIXED
// ───────────────────────────────────────────────────────────────────────────────

async function transcribeAudioFromFile(filePath) {
  if (!openaiClient || !openaiClient.openai) {
    throw new Error('OpenAI client not available for transcription');
  }
  // Whisper supports: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
  const stream = fsc.createReadStream(filePath);
  const transcription = await openaiClient.openai.audio.transcriptions.create({
    file: stream,
    model: 'whisper-1'
  });
  return transcription?.text || '';
}

async function analyzeVoice(bot, voice, prompt, chatId) {
  let temp = null;

  try {
    if (!openaiClient) throw new Error('OpenAI client not available');
    console.log('Starting voice transcription and analysis...');

    const guess = generateTempFilename('voice.oga', 'voice');
    const dl = await downloadTelegramFile(bot, voice.file_id, guess);
    temp = dl.path;

    const transcribedText = await transcribeAudioFromFile(temp);
    if (!transcribedText) throw new Error('No transcription text returned');

    const analysisPrompt =
`${prompt || 'Analyze this transcribed voice message and provide a concise summary, sentiment analysis, key points, and actionable insights.'}

Transcribed voice message:
"${transcribedText}"`;

    const analysis = await openaiClient.getGPT5Analysis(analysisPrompt, {
      model: 'gpt-5-mini',
      max_output_tokens: 2000,
      reasoning_effort: 'medium',
      verbosity: 'medium'
    });

    const fullResponse =
`Voice Transcription (${voice.duration || 0}s):
"${transcribedText}"

Analysis:
${analysis}`;

    storeDocumentContext(chatId, `voice_${Date.now()}`, 'voice', transcribedText, analysis);

    await saveConversationEmergency(
      chatId,
      'Voice message received and transcribed',
      fullResponse,
      {
        aiUsed: 'Whisper + GPT-5-Mini',
        type: 'voice_analysis',
        duration: voice.duration || 0,
        transcriptionLength: transcribedText.length
      }
    );

    const ok = await sendToTelegram(bot, chatId, fullResponse, {
      type: 'voice_analysis',
      duration: voice.duration || 0,
      transcriptionLength: transcribedText.length,
      model: 'gpt-5-mini'
    });

    return {
      success: true,
      type: 'voice',
      analysis: fullResponse,
      transcription: transcribedText,
      aiUsed: 'Whisper + GPT-5-Mini',
      duration: voice.duration || 0,
      telegramDelivered: ok
    };
  } catch (error) {
    console.error('Voice analysis error:', error.message);
    const fallbackMessage =
      `Voice message received (${voice?.duration ?? 0}s). Transcription temporarily unavailable. ` +
      `Please send text for full analysis.\n\nError: ${error.message}`;

    await sendToTelegram(bot, chatId, fallbackMessage, {
      type: 'voice_fallback',
      duration: voice?.duration ?? 0,
      error: error.message,
      model: 'error-handler'
    });

    return { success: false, error: error.message, type: 'voice' };
  } finally {
    if (temp) await cleanupTempFile(temp);
  }
}

async function analyzeAudio(bot, audio, prompt, chatId) {
  // Audio objects in Telegram have file_id and may have file_name; treat like voice
  return await analyzeVoice(bot, audio, prompt, chatId);
}

// ───────────────────────────────────────────────────────────────────────────────
// VIDEO (placeholder) - FIXED
// ───────────────────────────────────────────────────────────────────────────────

async function analyzeVideo(bot, video, prompt, chatId) {
  try {
    console.log('Video analysis requested...');
    const analysis =
      "🎥 Video analysis is coming soon. For now, describe the video in text and I'll analyze based on your description.";

    storeDocumentContext(chatId, `video_${Date.now()}`, 'video', 'Video analysis requested', analysis);

    await saveConversationEmergency(
      chatId,
      'Video uploaded for analysis',
      analysis,
      { aiUsed: 'video-placeholder', type: 'video_analysis', duration: video?.duration ?? 0 }
    );

    const ok = await sendToTelegram(bot, chatId, analysis, {
      type: 'video_analysis',
      duration: video?.duration ?? 0,
      model: 'gpt-5-mini'
    });

    return {
      success: true,
      type: 'video',
      analysis,
      aiUsed: 'video-placeholder',
      duration: video?.duration ?? 0,
      telegramDelivered: ok
    };
  } catch (error) {
    return { success: false, error: error.message, type: 'video' };
  }
}

async function analyzeVideoNote(bot, videoNote, prompt, chatId) {
  return await analyzeVideo(bot, videoNote, prompt, chatId);
}

// ───────────────────────────────────────────────────────────────────────────────
// FOLLOW-UP CONTEXT
// ───────────────────────────────────────────────────────────────────────────────

function getContextForFollowUp(chatId, userMessage) {
  const context = getDocumentContext(chatId);
  if (!context) return null;

  return `RECENT DOCUMENT CONTEXT:
File: ${context.fileName} (${context.fileType})
Previous Analysis: ${context.analysis.substring(0, 1000)}...
Document Content (sample): ${context.extractedText.substring(0, 1000)}...

Current Question: ${userMessage}

Answer precisely based on the document context above.`;
}

// ───────────────────────────────────────────────────────────────────────────────
// STATUS
// ───────────────────────────────────────────────────────────────────────────────

function getMultimodalStatus() {
  return {
    available: !!openaiClient,
    memoryIntegration: true,
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
    models_used: {
      vision: 'GPT-4o Vision',
      documents: 'GPT-5 (Mini/Full with chunking)',
      voice: 'Whisper + GPT-5 Mini',
      transcription: 'whisper-1'
    },
    limitations: [
      !pdfParse ? 'Install pdf-parse for PDF support: npm i pdf-parse' : null,
      !mammoth ? 'Install mammoth for DOCX support: npm i mammoth' : null,
      !xlsxLib ? 'Install xlsx for Excel support: npm i xlsx' : null,
      !textract ? 'Install textract for DOC/PPTX support: npm i textract' : null,
      `File size limit: ${Math.round(MULTIMODAL_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB`,
      'Video analysis coming soon'
    ].filter(Boolean),
    activeContexts: documentContexts.size,
    conversationMemory: conversationMemory.size,
    telegramSplitterCompatible: !!telegramSplitter
  };
}

// ───────────────────────────────────────────────────────────────────────────────
setInterval(async () => {
  try {
    await ensureTempDir();
    const files = await fs.readdir(MULTIMODAL_CONFIG.TEMP_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(MULTIMODAL_CONFIG.TEMP_DIR, file);
      try {
        const stats = await fs.stat(filePath);
        if (now - stats.mtime.getTime() > 600000) {
          await cleanupTempFile(filePath);
        }
      } catch (_) {
        // ignore
      }
    }

    console.log(`Multimodal cleanup: ${files.length} temp files checked`);
  } catch (error) {
    console.warn('Periodic cleanup failed:', error.message);
  }
}, MULTIMODAL_CONFIG.CLEANUP_INTERVAL);

// ───────────────────────────────────────────────────────────────────────────────
// Init
// ───────────────────────────────────────────────────────────────────────────────

console.log('Multimodal module loaded - FIXED VERSION');
console.log('- GPT-4o Vision for image analysis');
console.log('- GPT-5 Mini/Full for document analysis (+ chunking)');
console.log('- Whisper + GPT-5 Mini for voice/audio analysis');
console.log('- Compatible with smart telegramSplitter.js');
console.log('- Built-in conversation memory');
ensureTempDir();

// ───────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ───────────────────────────────────────────────────────────────────────────────

module.exports = {
  // Main analysis functions
  analyzeImage,
  analyzeDocument,
  analyzeVoice,
  analyzeAudio,
  analyzeVideo,
  analyzeVideoNote,

  // Status and management
  getMultimodalStatus,
  getContextForFollowUp,
  getDocumentContext,
  storeDocumentContext,

  // Utilities
  downloadTelegramFile,
  cleanupTempFile,
  generateTempFilename,
  saveConversationEmergency,

  // Telegram delivery functions - FIXED
  sendToTelegram,
  sendErrorToTelegram,

  // Configuration
  MULTIMODAL_CONFIG
};
