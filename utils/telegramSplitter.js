// utils/telegramSplitter.js — Smart, Clean Telegram Delivery (v5)
// Focus: professional spacing, clear layout, safe delivery (no parse_mode)
// Public API preserved: sendTelegramMessage, setupTelegramHandler,
// classes TelegramFormatter, TelegramMessageHandler, SmartFormatter, CONFIG

'use strict';

// ───────────────────────────────────────────────────────────────────────────────
// Config

const CONFIG = {
  MAX_MESSAGE_LENGTH: 4096,     // Telegram hard cap
  SAFE_LENGTH: 3900,            // play it safe under the hard cap
  CHUNK_TARGET: 3400,           // aim to split before SAFE_LENGTH
  DELAY_MS: 180,                // base delay between chunks
  MAX_RETRIES: 3,               // retries per chunk
  RETRY_DELAY_MS: 1000,         // backoff base
  ADAPTIVE_RETRY: true,

  // Formatting prefs
  MAX_LINE_LENGTH: 76,          // pleasant reading width
  BOX_WIDTH_MIN: 24,
  BOX_WIDTH_MAX: 44,
  ADD_MODEL_HEADER: true,       // can be disabled via metadata.noHeader
};

// ───────────────────────────────────────────────────────────────────────────────
// Smart text utilities (no Telegram parse_mode, so we keep it plain/unicode-safe)

class SmartFormatter {
  constructor(opts = {}) {
    this.lineWidth = opts.MAX_LINE_LENGTH || CONFIG.MAX_LINE_LENGTH;
  }

  // Normalize whitespace & newlines without destroying content
  normalize(text) {
    // Convert Windows newlines, collapse excessive vertical spacing
    return String(text)
      .replace(/\r\n?/g, '\n')
      .replace(/[^\S\n]+/g, ' ')     // collapse runs of spaces but keep newlines
      .replace(/[ \t]+$/gm, '')      // trim end-of-line spaces
      .replace(/\n{3,}/g, '\n\n')    // max 2 consecutive blank lines
      .trim();
  }

  // Turn lightweight markdown-ish input into clean plain text
  markdownToPlain(text) {
    let out = text;

    // Headers: # .. ###### -> tidy blocks with separators
    out = out.replace(/^(#{1,6})\s*(.+?)\s*$/gm, (_m, hashes, title) => {
      const level = hashes.length;
      const max = Math.max(
        CONFIG.BOX_WIDTH_MIN,
        Math.min(CONFIG.BOX_WIDTH_MAX, title.length + 6)
      );
      const bar = level <= 2 ? '─'.repeat(max) : '┈'.repeat(Math.max(12, Math.min(28, title.length)));
      if (level === 1) {
        return `\n${bar}\n${title.toUpperCase()}\n${bar}\n`;
      }
      if (level === 2) {
        return `\n${bar}\n${title}\n${bar}\n`;
      }
      return `\n▸ ${title}\n${bar}\n`;
    });

    // Bold/italic/underline markers → keep text, drop asterisks/underscores
    out = out.replace(/\*\*(.*?)\*\*/g, '$1');
    out = out.replace(/\*(.*?)\*/g, '$1');
    out = out.replace(/_(.*?)_/g, '$1');

    // Inline code: `code` → ⟨code⟩ (safe, no parse-mode)
    out = out.replace(/`([^`]+)`/g, '⟨$1⟩');

    // Code blocks: ```lang?\n...\n``` → boxed monospaced-style (plain)
    out = out.replace(/```([\s\S]*?)```/g, (_m, body) => {
      const lines = String(body).trim().split('\n');
      const maxLen = Math.min(
        Math.max(10, ...lines.map(l => l.length)),
        this.lineWidth + 6
      );
      const top = '┌' + '─'.repeat(maxLen + 2) + '┐';
      const bot = '└' + '─'.repeat(maxLen + 2) + '┘';
      const content = lines.map(l => `│ ${l.padEnd(maxLen)} │`).join('\n');
      return `\n${top}\n${content}\n${bot}\n`;
    });

    // Bullet lists (- * + ) → •, numbered → 1) text
    out = out.replace(/^[ \t]*[-*+]\s+(.+)$/gm, '• $1');
    out = out.replace(/^[ \t]*(\d+)[\.\)]\s+(.+)$/gm, '$1) $2');

    // Quotes: "> text" → neat quote bar
    out = out.replace(/^>\s*(.+)$/gm, '❝ $1');

    return out;
  }

  // Wrap long lines (keep code boxes and heavy separator lines intact)
  wrapLines(text, width = this.lineWidth) {
    const lines = text.split('\n');
    const wrapped = [];

    const isSolid = (s) =>
      /^[\s]*[─━═┈]{6,}[\s]*$/.test(s) ||
      /^[\s]*[╭╮╰╯┌┐└┘│┃╭─╮╰─╯┏━┓┗━┛]+[\s]*$/.test(s);

    let inBox = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect start/end of our code-ish box
      if (/^┌[─]+┐\s*$/.test(line)) { inBox = true; wrapped.push(line); continue; }
      if (/^└[─]+┘\s*$/.test(line)) { inBox = false; wrapped.push(line); continue; }
      if (inBox) { wrapped.push(line); continue; }

      if (isSolid(line.trim()) || line.trim().length <= width) {
        wrapped.push(line);
        continue;
      }

      // Word-wrap (don’t break long CJK lines; fall back to character wrap)
      const words = line.split(' ');
      if (words.length === 1) {
        wrapped.push(line);
        continue;
      }

      let current = '';
      for (const w of words) {
        const test = current.length ? `${current} ${w}` : w;
        if (test.length <= width) {
          current = test;
        } else {
          if (current) wrapped.push(current);
          current = w.length > width ? w : w; // keep as is; next loop will place it
        }
      }
      if (current) wrapped.push(current);
    }

    return wrapped.join('\n');
  }

  // Gentle spacing polish
  polish(text) {
    return text
      // ensure a blank line around big separators
      .replace(/([^\n])\n(─{6,}|━{6,}|═{6,})\n([^\n])/g, '$1\n\n$2\n\n$3')
      // ensure max two consecutive blank lines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  finalize(text) {
    return this.polish(this.wrapLines(this.markdownToPlain(this.normalize(text))));
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Telegram message formatter + splitter

class TelegramFormatter {
  constructor(custom = {}) {
    this.cfg = { ...CONFIG, ...custom };
    this.smart = new SmartFormatter(this.cfg);

    this.metrics = {
      totalSent: 0,
      totalFailed: 0,
      averageDelay: this.cfg.DELAY_MS,
      lastSuccess: Date.now(),
    };

    this.breaker = {
      failures: 0,
      open: false,
      lastFailure: 0,
      resetMs: 60_000,
    };
  }

  // Model detection → lightweight, metadata first
  detectModel(_text, metadata = {}) {
    if (metadata.model) return String(metadata.model);
    return 'gpt-5-mini';
  }

  modelHeader(model, metadata = {}) {
    if (metadata.noHeader || !this.cfg.ADD_MODEL_HEADER) return '';

    const display = {
      'gpt-5':       { icon: '🚀', name: 'GPT-5',        sub: 'Advanced Reasoning' },
      'gpt-5-mini':  { icon: '⚡', name: 'GPT-5 Mini',   sub: 'Balanced Performance' },
      'gpt-5-nano':  { icon: '💨', name: 'GPT-5 Nano',   sub: 'Ultra-Fast Response' },
      'gpt-4o':      { icon: '🔥', name: 'GPT-4o',       sub: 'Multimodal Intelligence' },
      'error':       { icon: '🚨', name: 'System',       sub: 'Notification' },
      'default':     { icon: '🤖', name: 'AI Assistant', sub: 'Intelligent Response' },
    }[model] || { icon: '🤖', name: 'AI Assistant', sub: 'Intelligent Response' };

    const width = Math.min(
      CONFIG.BOX_WIDTH_MAX,
      Math.max(CONFIG.BOX_WIDTH_MIN, display.name.length + display.sub.length + 6)
    );
    const top = '╭' + '─'.repeat(width) + '╮';
    const mid1 = `│ ${display.icon} ${display.name.padEnd(width - 4)} │`;
    const mid2 = `│ ${display.sub.padEnd(width - 2)} │`;
    const bot = '╰' + '─'.repeat(width) + '╯';

    return `${top}\n${mid1}\n${mid2}\n${bot}\n`;
  }

  format(text, metadata = {}) {
    const model = this.detectModel(text, metadata);
    const header = this.modelHeader(model, metadata);
    const body = this.smart.finalize(
      String(text)
        // strip leading “[GPT-x]” tags and “GPT-x:” labels if present
        .replace(/^\s*\[[^\]]+]\s*/gm, '')
        .replace(/^GPT-\d+[^:]*:\s*/gm, '')
    );
    const formatted = `${header}${body}`.trim();

    return { formatted, model };
  }

  split(text) {
    if (text.length <= this.cfg.MAX_MESSAGE_LENGTH) return [text];

    const out = [];
    const sections = text.split(/\n(?=(?:╭|┌)|(?:[─━═]{6,}))/); // split on big separators or boxes
    let current = '';

    const pushCurrent = () => {
      if (current.trim()) out.push(current.trim());
      current = '';
    };

    for (const sec of sections) {
      const add = current ? `${current}\n${sec}` : sec;
      if (add.length > this.cfg.CHUNK_TARGET) {
        if (current) pushCurrent();

        // secondary split: paragraphs
        const paras = sec.split(/\n{2,}/);
        let cur2 = '';
        for (const p of paras) {
          const test = cur2 ? `${cur2}\n\n${p}` : p;
          if (test.length > this.cfg.CHUNK_TARGET) {
            if (cur2) { out.push(cur2.trim()); cur2 = p; }
            else {
              // tertiary split: sentences
              const sentences = p.split(/(?<=[.!?])\s+/);
              let cur3 = '';
              for (const s of sentences) {
                const t3 = cur3 ? `${cur3} ${s}` : s;
                if (t3.length > this.cfg.CHUNK_TARGET) {
                  if (cur3) { out.push(cur3.trim()); cur3 = s; }
                  else { out.push(s.trim()); }
                } else {
                  cur3 = t3;
                }
              }
              if (cur3) out.push(cur3.trim());
              cur2 = '';
            }
          } else {
            cur2 = test;
          }
        }
        if (cur2) out.push(cur2.trim());
        current = '';
      } else {
        current = add;
      }
    }
    if (current) pushCurrent();

    // tag parts
    if (out.length > 1) {
      return out.map((c, i) =>
        `${c}\n\n${'─'.repeat(16)}\n📄 Part ${i + 1} of ${out.length}\n${'─'.repeat(16)}`
      );
    }
    return out;
  }

  async sendWithRetry(bot, chatId, text, options = {}) {
    // NO parse_mode to avoid “can't parse entities”
    if (bot?.sendMessage) return await bot.sendMessage(chatId, text, { disable_web_page_preview: true, ...options });
    if (bot?.telegram?.sendMessage) return await bot.telegram.sendMessage(chatId, text, { disable_web_page_preview: true, ...options });
    if (typeof bot === 'function') return await bot(chatId, text, { disable_web_page_preview: true, ...options });
    throw new Error('Invalid bot instance (no sendMessage)');
  }

  async sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  resetBreaker() {
    this.breaker.open = false;
    this.breaker.failures = 0;
    this.breaker.lastFailure = 0;
  }

  async splitAndSend(text, bot, chatId, { metadata = {}, telegramOptions = {} } = {}) {
    // circuit breaker
    if (this.breaker.open) {
      const wait = Date.now() - this.breaker.lastFailure;
      if (wait < this.breaker.resetMs) {
        throw new Error(`Circuit breaker open. Retry in ${Math.ceil((this.breaker.resetMs - wait)/1000)}s`);
      }
      this.resetBreaker();
    }

    const { formatted, model } = this.format(text, metadata);
    const chunks = this.split(formatted);

    let delay = this.cfg.DELAY_MS;
    const results = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      let attempts = 0;
      let sent = false;

      while (attempts < this.cfg.MAX_RETRIES && !sent) {
        attempts++;
        try {
          const res = await this.sendWithRetry(bot, chatId, chunk, telegramOptions);
          results.push({ i, ok: true, len: chunk.length, attempts, id: res?.message_id });
          this.metrics.totalSent++;
          sent = true;

          // adaptive delay tweak
          delay = attempts === 1
            ? Math.max(this.cfg.DELAY_MS, Math.floor(delay * 0.9))
            : Math.min(2000, Math.floor(delay * 1.5));

        } catch (err) {
          if (attempts < this.cfg.MAX_RETRIES) {
            const backoff = this.cfg.RETRY_DELAY_MS * Math.pow(2, attempts - 1);
            await this.sleep(backoff);
          } else {
            results.push({ i, ok: false, err: err?.message || String(err), attempts });
            this.metrics.totalFailed++;
            this.breaker.failures++;
            this.breaker.lastFailure = Date.now();
            if (this.breaker.failures >= 3) {
              this.breaker.open = true;
            }
          }
        }
      }

      if (sent && i < chunks.length - 1) {
        await this.sleep(delay);
      }
    }

    const ok = results.every(r => r.ok);
    if (ok) this.metrics.lastSuccess = Date.now();

    return {
      success: ok,
      enhanced: true,
      smartFormatted: true,
      totalChunks: chunks.length,
      sentChunks: results.filter(r => r.ok).length,
      failedChunks: results.filter(r => !r.ok).length,
      modelInfo: { model },
      results,
    };
  }

  // Format-only helpers for callers that want pre-styled strings
  formatMessageSmart(text, options = {}) {
    const { formatted } = this.format(text, options.metadata || {});
    return formatted;
  }

  formatSystemStatus(status) {
    const ts = new Date().toLocaleString();
    const lines = [
      '────────────────────────────────────────',
      `System Status • ${ts}`,
      '────────────────────────────────────────',
      '',
      'AI Models:',
      `• GPT-5:        ${status.gpt5Available ? 'Online' : 'Offline'}`,
      `• GPT-5 Mini:   ${status.gpt5MiniAvailable ? 'Online' : 'Offline'}`,
      `• GPT-5 Nano:   ${status.gpt5NanoAvailable ? 'Online' : 'Offline'}`,
      `• Fallback:     ${status.fallbackWorking ? 'Ready' : 'Unavailable'}`,
      '',
    ];

    if (status.metrics) {
      lines.push(
        'Metrics:',
        `• Success Rate:  ${status.metrics.successRate}%`,
        `• Sent:          ${status.metrics.totalSent}`,
        `• Failed:        ${status.metrics.totalFailed}`,
        ''
      );
    }

    const cb = status.circuitBreakerState || 'CLOSED';
    lines.push(`Circuit Breaker: ${cb}`, '');
    if (status.currentModel) lines.push(`Active Model: ${status.currentModel}`, '');

    return this.smart.finalize(lines.join('\n'));
  }

  formatError(error, context = '') {
    const ts = new Date().toLocaleString();
    const e = (error && error.message) ? error.message : String(error);
    const lines = [
      '────────────────────────────────────────',
      `Error • ${ts}`,
      '────────────────────────────────────────',
      '',
    ];
    if (context) lines.push(`Context: ${context}`, '');
    lines.push(`Message: ${e}`, '');
    return this.smart.finalize(lines.join('\n'));
  }

  formatSuccess(message, details = {}) {
    const ts = new Date().toLocaleString();
    const lines = [
      '────────────────────────────────────────',
      `Success • ${ts}`,
      '────────────────────────────────────────',
      '',
      message,
      '',
    ];
    const keys = Object.keys(details || {});
    if (keys.length) {
      lines.push('Details:');
      for (const k of keys) lines.push(`• ${k}: ${details[k]}`);
      lines.push('');
    }
    return this.smart.finalize(lines.join('\n'));
  }

  getMetrics() {
    const total = this.metrics.totalSent + this.metrics.totalFailed;
    return {
      totalSent: this.metrics.totalSent,
      totalFailed: this.metrics.totalFailed,
      successRate: total ? ((this.metrics.totalSent / total) * 100).toFixed(2) : '100.00',
      averageDelay: this.metrics.averageDelay,
      circuitBreakerOpen: this.breaker.open,
      lastSuccessTime: new Date(this.metrics.lastSuccess).toLocaleString(),
    };
  }

  resetCircuitBreaker() { this.resetBreaker(); }
}

// ───────────────────────────────────────────────────────────────────────────────
// High-level handler class

class TelegramMessageHandler {
  constructor(bot, defaultOptions = {}) {
    this.bot = bot;
    this.formatter = new TelegramFormatter(defaultOptions.config || {});
    this.defaultOptions = defaultOptions;
    console.log('✨ TelegramMessageHandler ready — clean formatting enabled.');
  }

  async sendFormattedMessage(text, chatId, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    try {
      const result = await this.formatter.splitAndSend(text, this.bot, chatId, opts);
      if (result.success) return result;

      // soft fallback (very rare)
      return await this.basicFallback(text, chatId, options);
    } catch (err) {
      console.warn('Smart delivery failed, using basic fallback:', err?.message || err);
      return await this.basicFallback(text, chatId, options);
    }
  }

  async basicFallback(text, chatId, _options = {}) {
    try {
      const clean = new SmartFormatter().finalize(text);
      await this.bot.sendMessage(chatId, clean, { disable_web_page_preview: true });
      return { success: true, enhanced: false, fallback: true, totalChunks: 1, sentChunks: 1, failedChunks: 0 };
    } catch (e) {
      return { success: false, enhanced: false, fallback: true, error: e?.message || String(e) };
    }
  }

  // Convenience wrappers
  formatGPTResponse(response, metadata = {}) { return this.formatter.formatMessageSmart(response, { metadata }); }
  formatSystemStatus(status) { return this.formatter.formatSystemStatus(status); }
  formatError(error, context = '') { return this.formatter.formatError(error, context); }
  formatSuccess(message, details = {}) { return this.formatter.formatSuccess(message, details); }

  getMetrics() { return this.formatter.getMetrics(); }
  resetCircuitBreaker() { this.formatter.resetCircuitBreaker(); }
}

// ───────────────────────────────────────────────────────────────────────────────
// Helper functions (same signatures as your current code)

async function sendTelegramMessage(bot, chatId, gptResponse, metadata = {}) {
  const handler = new TelegramMessageHandler(bot);
  const res = await handler.sendFormattedMessage(gptResponse, chatId, { metadata });
  if (res.success) {
    return {
      success: true,
      enhanced: !!res.enhanced,
      smartFormatted: !!res.smartFormatted,
      fallback: !!res.fallback,
      chunks: res.totalChunks,
      model: res.modelInfo?.model,
    };
  }
  return { success: false, error: res.error || 'Unknown delivery error' };
}

function setupTelegramHandler(bot, config = {}) {
  const handler = new TelegramMessageHandler(bot, config);
  return {
    send: (text, chatId, options = {}) => handler.sendFormattedMessage(text, chatId, options),
    sendGPTResponse: (response, metadata, chatId) => {
      const formatted = handler.formatGPTResponse(response, metadata);
      return handler.sendFormattedMessage(formatted, chatId, { metadata });
    },
    sendSystemStatus: (status, chatId) => handler.sendFormattedMessage(handler.formatSystemStatus(status), chatId),
    sendError: (error, context, chatId) => handler.sendFormattedMessage(handler.formatError(error, context), chatId),
    sendSuccess: (message, details, chatId) => handler.sendFormattedMessage(handler.formatSuccess(message, details), chatId),
    getMetrics: () => handler.getMetrics(),
    resetCircuitBreaker: () => handler.resetCircuitBreaker(),
    handler,
  };
}

// ───────────────────────────────────────────────────────────────────────────────
// Exports

module.exports = {
  CONFIG,
  SmartFormatter,
  TelegramFormatter,
  TelegramMessageHandler,
  sendTelegramMessage,
  setupTelegramHandler,
};

console.log('✨ telegramSplitter.js loaded (v5) — clean spacing, natural splits, safe delivery.');
