// utils/telegramSplitter.js - STRATEGIC COMMANDER (HTML-safe rewrite)
// This version eliminates Telegram “can’t parse entities” errors by:
//   1) Using parse_mode: 'HTML' consistently
//   2) Escaping all user-supplied text via escapeHtml(...)
//   3) Avoiding fragile Markdown sequences
//   4) Keeping intelligent chunking and strategic headers intact

// 📏 TELEGRAM LIMITS - Strategic Command Optimized
const TELEGRAM_LIMITS = {
  MAX_MESSAGE_LENGTH: 4096,       // Telegram hard limit
  SAFE_MESSAGE_LENGTH: 4000,      // Safety buffer
  MAX_CAPTION_LENGTH: 1024,       // For media captions
  STRATEGIC_CHUNK_SIZE: 3800,     // Optimal chunk size for reports
  MAX_CHUNKS_PER_MESSAGE: 20,     // Anti-spam guard
  STRATEGIC_DELAY_MS: 1500,       // Default delay between chunks
  PRIORITY_DELAY_MS: 500          // Faster for urgent alerts
};

// 🎯 STRATEGIC MESSAGE TYPES
const STRATEGIC_MESSAGE_TYPES = {
  general:   { emoji: '💬', priority: 'normal', formatting: 'standard' },
  raydalio:  { emoji: '🏛️', priority: 'high',   formatting: 'institutional' },
  cambodia:  { emoji: '🇰🇭', priority: 'high',   formatting: 'institutional' },
  trading:   { emoji: '💹', priority: 'urgent', formatting: 'financial' },
  alert:     { emoji: '🚨', priority: 'urgent', formatting: 'alert' },
  analysis:  { emoji: '📊', priority: 'high',   formatting: 'analytical' }
};

// ========================= HTML SAFETY =========================
function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function strong(s = "") { return `<b>${escapeHtml(s)}</b>`; }
function em(s = "") { return `<i>${escapeHtml(s)}</i>`; }
function codeBlock(s = "") { return `<pre><code>${escapeHtml(s)}</code></pre>`; }

/**
 * 🎯 STRATEGIC SMART RESPONSE (HTML-safe)
 * Intelligently formats, splits, and sends messages.
 */
async function sendSmartResponse(bot, chatId, message, title = null, messageType = 'general', options = {}) {
  try {
    if (!message || String(message).trim().length === 0) {
      console.log('⚠️ Empty message - skipping send');
      return false;
    }

    const strategicConfig = STRATEGIC_MESSAGE_TYPES[messageType] || STRATEGIC_MESSAGE_TYPES.general;
    const messageDelay =
      strategicConfig.priority === 'urgent'
        ? TELEGRAM_LIMITS.PRIORITY_DELAY_MS
        : TELEGRAM_LIMITS.STRATEGIC_DELAY_MS;

    // HTML-safe formatting
    let formattedMessage = formatStrategicMessageHTML(message, title, messageType, strategicConfig);

    // Single chunk
    if (formattedMessage.length <= TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
      await bot.sendMessage(chatId, formattedMessage, {
        parse_mode: 'HTML',
        disable_web_page_preview: options.disablePreview !== false
      });
      console.log(`✅ Strategic Commander single message sent (${formattedMessage.length} chars)`);
      return true;
    }

    // Multi-chunk
    const chunks = splitStrategicMessage(formattedMessage, title, messageType);
    if (chunks.length > TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE) {
      console.log(`⚠️ Strategic message too long (${chunks.length} chunks), truncating to ${TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE}`);
      chunks.splice(TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE);
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isLast = i === chunks.length - 1;
      try {
        await bot.sendMessage(chatId, chunk, {
          parse_mode: 'HTML',
          disable_web_page_preview: options.disablePreview !== false
        });
        console.log(`✅ Strategic chunk ${i + 1}/${chunks.length} sent (${chunk.length} chars)`);
        if (!isLast) await new Promise(r => setTimeout(r, messageDelay));
      } catch (chunkError) {
        console.error(`❌ Strategic chunk ${i + 1} failed:`, chunkError.message);
        // Fallback: send without parse mode
        try {
          await bot.sendMessage(chatId, chunk.replace(/<[^>]*>/g, '')); // strip tags
          console.log(`✅ Strategic chunk ${i + 1} sent as plain text`);
        } catch (fallbackError) {
          console.error(`❌ Strategic chunk ${i + 1} completely failed:`, fallbackError.message);
        }
      }
    }

    console.log(`✅ Strategic Commander message complete: ${chunks.length} chunks sent`);
    return true;

  } catch (error) {
    console.error('❌ Strategic Smart Response error:', error.message);
    // Emergency fallback
    try {
      const emergency = `🚨 STRATEGIC COMMANDER ERROR\n\nMessage delivery failed. Error: ${escapeHtml(error.message)}\n\nOriginal length: ${String(message).length} chars`;
      await bot.sendMessage(chatId, emergency.slice(0, TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH));
    } catch (emergencyError) {
      console.error('❌ Emergency fallback also failed:', emergencyError.message);
    }
    return false;
  }
}

// ========================= FORMATTERS =========================

/**
 * 🏛️ HTML formatter
 */
function formatStrategicMessageHTML(message, title, messageType, config) {
  let formatted = '';

  // Header
  if (title) {
    const titleEmoji = config.emoji;
    formatted += `${titleEmoji} ${strong(String(title).toUpperCase())}\n\n`;
  }

  // Timestamp for urgent/trading
  if (config.priority === 'urgent' || messageType === 'trading') {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Phnom_Penh',
      hour12: false
    });
    formatted += `🕐 ${strong('Strategic Time:')} ${escapeHtml(timestamp)} Cambodia\n\n`;
  }

  // Main content (escaped)
  formatted += escapeHtml(String(message));

  // Footer
  const footer = getStrategicFooterHTML(messageType, config);
  if (footer) formatted += `\n\n${footer}`;

  return formatted;
}

/**
 * 📊 GET STRATEGIC FOOTER (HTML)
 */
function getStrategicFooterHTML(messageType, config) {
  switch (messageType) {
    case 'raydalio':
      return `🏛️ ${em('Strategic Commander • Institutional-Grade Analysis')}`;
    case 'cambodia':
      return `🇰🇭 ${em('Strategic Commander • Cambodia Fund Intelligence')}`;
    case 'trading':
      return `💹 ${em('Strategic Commander • Live Trading Intelligence')}`;
    case 'analysis':
      return `📊 ${em('Strategic Commander • Market Warfare Analysis')}`;
    case 'alert':
      return `🚨 ${em('Strategic Commander • Urgent Alert')}`;
    default:
      return '';
  }
}

// ========================= SPLITTING =========================

/**
 * ✂️ SPLIT STRATEGIC MESSAGE
 */
function splitStrategicMessage(message, title, messageType) {
  const chunks = [];
  let remainingMessage = message;
  let partNumber = 1;

  const config = STRATEGIC_MESSAGE_TYPES[messageType] || STRATEGIC_MESSAGE_TYPES.general;
  const maxChunkSize = TELEGRAM_LIMITS.STRATEGIC_CHUNK_SIZE;

  while (remainingMessage.length > maxChunkSize) {
    let splitPoint = findStrategicSplitPoint(remainingMessage, maxChunkSize);
    if (splitPoint === -1) splitPoint = maxChunkSize - 100; // Reserve for header

    let chunk = remainingMessage.substring(0, splitPoint).trim();

    // Header per chunk
    const chunkHeader = `${config.emoji} ${strong('STRATEGIC COMMANDER')} (Part ${partNumber})\n\n`;
    if (chunk.length + chunkHeader.length > maxChunkSize) {
      const available = maxChunkSize - chunkHeader.length - 50;
      chunk = chunk.substring(0, available).trim();
      const lastSentence = chunk.lastIndexOf('.');
      const lastLine = chunk.lastIndexOf('\n');
      const cut = Math.max(lastSentence, lastLine);
      if (cut > available * 0.7) chunk = chunk.substring(0, cut + 1).trim();
    }

    chunks.push(chunkHeader + chunk);
    remainingMessage = remainingMessage.substring(chunk.length).trim();
    partNumber++;

    if (partNumber > TELEGRAM_LIMITS.MAX_CHUNKS_PER_MESSAGE) {
      console.log('⚠️ Strategic message splitting reached maximum chunks limit');
      break;
    }
  }

  if (remainingMessage.length > 0) {
    const finalHeader =
      partNumber > 1 ? `${config.emoji} ${strong('STRATEGIC COMMANDER')} (Part ${partNumber} - Final)\n\n` : '';
    chunks.push(finalHeader + remainingMessage);
  }

  return chunks;
}

/**
 * 🔍 FIND STRATEGIC SPLIT POINT
 */
function findStrategicSplitPoint(text, maxLength) {
  // Prefer to split on section dividers or punctuation near the boundary
  const splitPatterns = [
    /\n\n🎯/g, /\n\n🏛️/g, /\n\n📊/g, /\n\n💰/g, /\n\n⚠️/g,
    /\n\n<b>[A-Z]/g,        // Bold-like HTML header pieces (rare in escaped content)
    /\n\n/g, /\.\s+/g, /\n/g, /;\s+/g, /,\s+/g
  ];

  const minSplitPoint = maxLength * 0.7;

  for (const pattern of splitPatterns) {
    const matches = [...text.matchAll(pattern)];
    for (let i = matches.length - 1; i >= 0; i--) {
      const matchEnd = matches[i].index + matches[i][0].length;
      if (matchEnd >= minSplitPoint && matchEnd <= maxLength) return matchEnd;
    }
  }
  return -1;
}

// ========================= LEGACY HELPERS =========================

function splitLongMessage(message, maxLength = TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) {
  if (message.length <= maxLength) return [message];
  const chunks = [];
  let remaining = message;
  while (remaining.length > maxLength) {
    let splitPoint = findStrategicSplitPoint(remaining, maxLength);
    if (splitPoint === -1) splitPoint = maxLength;
    chunks.push(remaining.substring(0, splitPoint).trim());
    remaining = remaining.substring(splitPoint).trim();
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

async function sendLongMessage(bot, chatId, message, delay = TELEGRAM_LIMITS.STRATEGIC_DELAY_MS) {
  const chunks = splitLongMessage(message);
  for (let i = 0; i < chunks.length; i++) {
    try {
      await bot.sendMessage(chatId, chunks[i], { parse_mode: 'HTML' });
      if (i < chunks.length - 1) await new Promise(r => setTimeout(r, delay));
    } catch (error) {
      console.error(`❌ Chunk ${i + 1} failed:`, error.message);
    }
  }
}

// ========================= FORMAT SHORTCUTS =========================

function formatRayDalioResponse(analysis, title = "Strategic Analysis") {
  let formatted = `🏛️ ${strong(title.toUpperCase())}\n\n`;
  const timestamp = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Phnom_Penh', hour12: false });
  formatted += `🕐 ${strong('Strategic Time:')} ${escapeHtml(timestamp)} Cambodia\n\n`;
  formatted += escapeHtml(analysis);
  formatted += `\n\n🏛️ ${em('Strategic Commander • Institutional-Grade Market Intelligence')}`;
  return formatted;
}

function formatCambodiaFundResponse(analysis, title = "Cambodia Fund Analysis") {
  let formatted = `🇰🇭 ${strong(title.toUpperCase())}\n\n`;
  const timestamp = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Phnom_Penh', hour12: false });
  formatted += `🕐 ${strong('Strategic Time:')} ${escapeHtml(timestamp)} Cambodia\n\n`;
  formatted += escapeHtml(analysis);
  formatted += `\n\n🇰🇭 ${em('Strategic Commander • Cambodia Private Lending Intelligence')}`;
  return formatted;
}

// ========================= STATS & REPORTS =========================

function getMessageStats(message) {
  if (!message || typeof message !== 'string') {
    return { length: 0, chunks: 0, estimatedSendTime: 0, type: 'invalid' };
  }
  const length = message.length;
  const chunks = Math.ceil(length / TELEGRAM_LIMITS.STRATEGIC_CHUNK_SIZE);
  const estimatedSendTime = chunks > 1 ? (chunks - 1) * TELEGRAM_LIMITS.STRATEGIC_DELAY_MS + 1000 : 1000;
  let type = 'short';
  if (length > TELEGRAM_LIMITS.SAFE_MESSAGE_LENGTH) type = chunks <= 5 ? 'medium' : 'long';
  return { length, chunks, estimatedSendTime, type, withinLimits: length <= TELEGRAM_LIMITS.MAX_MESSAGE_LENGTH };
}

async function sendStrategicAlert(bot, chatId, alertMessage, alertType = 'general') {
  const header = `🚨 ${strong('STRATEGIC COMMANDER ALERT')}\n\n`;
  const timestamp = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Phnom_Penh', hour12: false });
  const timeHeader = `🕐 ${strong('Alert Time:')} ${escapeHtml(timestamp)} Cambodia\n\n`;
  const fullAlert = header + timeHeader + escapeHtml(alertMessage) + `\n\n🚨 ${em('Strategic Commander • Urgent Alert System')}`;
  return await sendSmartResponse(bot, chatId, fullAlert, null, 'alert', { disablePreview: true, priority: 'urgent' });
}

async function sendStrategicReport(bot, chatId, reportContent, reportTitle, reportType = 'analysis') {
  return await sendSmartResponse(bot, chatId, escapeHtml(reportContent), reportTitle, reportType, {
    disablePreview: true,
    priority: 'high'
  });
}

// ========================= EXPORTS =========================

module.exports = {
  // 🎯 STRATEGIC COMMANDER FUNCTIONS
  sendSmartResponse,
  sendStrategicAlert,
  sendStrategicReport,

  // 🏛️ FORMATTING FUNCTIONS
  formatStrategicMessageHTML: formatStrategicMessageHTML,
  formatRayDalioResponse,
  formatCambodiaFundResponse,

  // ✂️ SPLITTING FUNCTIONS
  splitStrategicMessage,
  splitLongMessage,
  findStrategicSplitPoint,

  // 📊 UTILITY FUNCTIONS
  getMessageStats,

  // 📝 LEGACY
  sendLongMessage,

  // 📏 CONSTANTS
  TELEGRAM_LIMITS,
  STRATEGIC_MESSAGE_TYPES
};
