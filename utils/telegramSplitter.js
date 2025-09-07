// utils/telegramSplitter.js - Enhanced Dynamic Message Splitter
// ═══════════════════════════════════════════════════════════════════════════
// Professional Telegram message formatter with intelligent emoji selection
// Auto-rotating emojis, context-aware formatting, clean appearance
// ═══════════════════════════════════════════════════════════════════════════

console.log('🎨 Loading Enhanced Telegram Splitter with Dynamic Emojis...');

// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC EMOJI POOLS
// ═══════════════════════════════════════════════════════════════════════════

const EMOJI_POOLS = {
    bullets: ['🔹', '🔸', '◦', '▫️', '▪️', '•', '⁃', '‣', '▸', '▷'],
    business: ['💼', '📊', '💰', '📈', '🎯', '⚡', '🚀', '💎', '🏆', '⭐'],
    tech: ['⚙️', '🔧', '💻', '🖥️', '📱', '🔌', '⚡', '🛠️', '🔍', '📡'],
    money: ['💰', '💵', '💎', '🏦', '📈', '💳', '🪙', '💸', '🎯', '📊'],
    success: ['🏆', '⭐', '🥇', '🎯', '💪', '🚀', '⚡', '✨', '🔥', '💎'],
    steps: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
    priority: ['🥇', '🥈', '🥉', '⭐', '🏆', '🎯', '🔥', '💎', '⚡', '✨'],
    categories: ['📋', '📂', '🗂️', '📁', '🏷️', '📌', '🔖', '📑', '📄', '📝'],
    time: ['⏰', '⏱️', '🕐', '📅', '🗓️', '⌛', '⏳', '🔔', '⌚', '🕰️'],
    warning: ['⚠️', '🚨', '⚡', '🔴', '❗', '❌', '🛑', '💥', '🔺', '⛔'],
    success_marks: ['✅', '✔️', '☑️', '✳️', '✴️', '💚', '🟢', '🎉', '🌟', '⭐']
};

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT EMOJI SELECTION
// ═══════════════════════════════════════════════════════════════════════════

class EmojiManager {
    constructor() {
        this.usageHistory = new Map();
        this.contextMemory = [];
        this.lastUsed = new Map();
    }
    
    getSmartEmoji(context, index = 0, total = 1) {
        const pool = this.selectPool(context);
        
        // Avoid recently used emojis
        const availableEmojis = pool.filter(emoji => {
            const lastUsedTime = this.lastUsed.get(emoji) || 0;
            return Date.now() - lastUsedTime > 30000; // 30 seconds cooldown
        });
        
        const targetPool = availableEmojis.length > 0 ? availableEmojis : pool;
        
        // Smart selection based on position and context
        let selectedEmoji;
        if (context === 'numbered' || context === 'steps') {
            selectedEmoji = EMOJI_POOLS.steps[index] || targetPool[index % targetPool.length];
        } else if (context === 'priority') {
            selectedEmoji = EMOJI_POOLS.priority[index] || targetPool[index % targetPool.length];
        } else {
            // Rotate through pool with some randomness
            const baseIndex = index % targetPool.length;
            const variance = Math.floor(Math.random() * Math.min(3, targetPool.length));
            const finalIndex = (baseIndex + variance) % targetPool.length;
            selectedEmoji = targetPool[finalIndex];
        }
        
        // Update usage tracking
        this.lastUsed.set(selectedEmoji, Date.now());
        this.updateUsageHistory(selectedEmoji);
        
        return selectedEmoji;
    }
    
    selectPool(context) {
        // Context-aware emoji pool selection
        const contextMap = {
            'business': EMOJI_POOLS.business,
            'money': EMOJI_POOLS.money,
            'tech': EMOJI_POOLS.tech,
            'success': EMOJI_POOLS.success,
            'steps': EMOJI_POOLS.steps,
            'numbered': EMOJI_POOLS.steps,
            'priority': EMOJI_POOLS.priority,
            'time': EMOJI_POOLS.time,
            'warning': EMOJI_POOLS.warning,
            'categories': EMOJI_POOLS.categories,
            'success_marks': EMOJI_POOLS.success_marks,
            'default': EMOJI_POOLS.bullets
        };
        
        return contextMap[context] || EMOJI_POOLS.bullets;
    }
    
    updateUsageHistory(emoji) {
        const count = this.usageHistory.get(emoji) || 0;
        this.usageHistory.set(emoji, count + 1);
        
        // Keep context memory for pattern awareness
        this.contextMemory.push(emoji);
        if (this.contextMemory.length > 50) {
            this.contextMemory.shift();
        }
    }
    
    getVariedEmoji(previousEmojis = []) {
        // Get an emoji that's different from recent ones
        const allEmojis = [...EMOJI_POOLS.bullets, ...EMOJI_POOLS.business];
        const available = allEmojis.filter(emoji => !previousEmojis.includes(emoji));
        
        if (available.length === 0) return EMOJI_POOLS.bullets[0];
        
        return available[Math.floor(Math.random() * available.length)];
    }
}

const emojiManager = new EmojiManager();

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT ANALYSIS AND CONTEXT DETECTION
// ═══════════════════════════════════════════════════════════════════════════

function analyzeContent(text) {
    const analysis = {
        type: 'general',
        hasNumbers: /\d+/.test(text),
        hasBusiness: /business|money|profit|revenue|investment|loan|lending|client|customer|growth|strategy|plan/i.test(text),
        hasTech: /database|code|system|tech|api|server|connection|error|debug/i.test(text),
        hasSteps: /step|first|second|then|next|finally|process|method/i.test(text),
        hasWarning: /error|failed|warning|problem|issue|critical|urgent/i.test(text),
        hasSuccess: /success|completed|achieved|won|excellent|perfect|great/i.test(text),
        hasPriority: /important|priority|urgent|critical|key|main|primary/i.test(text),
        isNumbered: /^[\d\w]+[\.\)]\s/.test(text.trim()),
        bulletCount: (text.match(/^[\s]*[▪️•\-\*]/gm) || []).length
    };
    
    // Determine primary context
    if (analysis.hasWarning) analysis.type = 'warning';
    else if (analysis.hasSuccess) analysis.type = 'success';
    else if (analysis.hasTech) analysis.type = 'tech';
    else if (analysis.hasBusiness) analysis.type = 'business';
    else if (analysis.hasSteps) analysis.type = 'steps';
    else if (analysis.hasPriority) analysis.type = 'priority';
    
    return analysis;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED MESSAGE FORMATTING
// ═══════════════════════════════════════════════════════════════════════════

function enhanceMessage(text) {
    if (!text || typeof text !== 'string') return text;
    
    const analysis = analyzeContent(text);
    let enhanced = text;
    const usedEmojis = [];
    
    // Replace static bullet points with dynamic ones
    const bulletPattern = /^(\s*)[▪️•\-\*](\s*)/gm;
    let bulletIndex = 0;
    
    enhanced = enhanced.replace(bulletPattern, (match, leadingSpace, trailingSpace) => {
        const context = analysis.type === 'general' ? 'default' : analysis.type;
        const emoji = emojiManager.getSmartEmoji(context, bulletIndex, analysis.bulletCount);
        usedEmojis.push(emoji);
        bulletIndex++;
        return `${leadingSpace}${emoji}${trailingSpace}`;
    });
    
    // Enhance numbered lists
    if (analysis.isNumbered) {
        const numberedPattern = /^(\s*)(\d+)[\.\)](\s*)/gm;
        let numberIndex = 0;
        
        enhanced = enhanced.replace(numberedPattern, (match, leadingSpace, number, trailingSpace) => {
            const emoji = emojiManager.getSmartEmoji('numbered', numberIndex, 10);
            numberIndex++;
            return `${leadingSpace}${emoji}${trailingSpace}`;
        });
    }
    
    // Add contextual enhancements
    if (analysis.type === 'success' && !enhanced.includes('✅')) {
        enhanced = enhanced.replace(/^(.+)$/m, '✅ $1');
    }
    
    if (analysis.type === 'warning' && !enhanced.includes('⚠️') && !enhanced.includes('❌')) {
        enhanced = enhanced.replace(/^(.+)$/m, '⚠️ $1');
    }
    
    return enhanced;
}

// ═══════════════════════════════════════════════════════════════════════════
// SMART MESSAGE HEADERS
// ═══════════════════════════════════════════════════════════════════════════

function createSmartHeader(analysis, messageLength, partNumber = 1, totalParts = 1) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Context-aware emoji selection for headers
    let headerEmoji;
    switch (analysis.type) {
        case 'business':
            headerEmoji = emojiManager.getSmartEmoji('business', 0);
            break;
        case 'tech':
            headerEmoji = '💻';
            break;
        case 'warning':
            headerEmoji = '⚠️';
            break;
        case 'success':
            headerEmoji = '✅';
            break;
        default:
            headerEmoji = '🚀';
    }
    
    const responseType = analysis.type === 'tech' ? 'CODE & TECHNICAL SOLUTION' : 
                        analysis.type === 'business' ? 'BUSINESS STRATEGY' :
                        analysis.type === 'warning' ? 'SYSTEM ALERT' :
                        analysis.type === 'success' ? 'SUCCESS REPORT' :
                        'GPT-5 Response';
    
    const partInfo = totalParts > 1 ? `📊 ${partNumber}/${totalParts} part(s)` : `📊 ${totalParts} part(s)`;
    
    return `╭─────────────────────────────────────────╮
│  ${headerEmoji} ${responseType.padEnd(28)} │
│                                         │
│  🔧 GPT-5  •  📅 ${timeStr}                │
│  ${partInfo.padEnd(32)} │
╰─────────────────────────────────────────╯`;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED TELEGRAM SPLITTER
// ═══════════════════════════════════════════════════════════════════════════

function splitTelegramMessage(text, maxLength = 4000, includeHeader = true) {
    if (!text || typeof text !== 'string') {
        return [''];
    }
    
    const analysis = analyzeContent(text);
    
    // Apply enhancements before splitting
    const enhancedText = enhanceMessage(text);
    
    if (enhancedText.length <= maxLength && !includeHeader) {
        return [enhancedText];
    }
    
    const parts = [];
    let currentPart = '';
    
    // Calculate available space (accounting for header if included)
    const headerSpace = includeHeader ? 300 : 0;
    const availableSpace = maxLength - headerSpace;
    
    // Split by paragraphs first
    const paragraphs = enhancedText.split('\n\n');
    
    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        
        // If paragraph fits in current part
        if ((currentPart + '\n\n' + paragraph).length <= availableSpace) {
            if (currentPart) {
                currentPart += '\n\n' + paragraph;
            } else {
                currentPart = paragraph;
            }
        } else {
            // Save current part if it has content
            if (currentPart.trim()) {
                parts.push(currentPart.trim());
                currentPart = '';
            }
            
            // Handle large paragraphs
            if (paragraph.length > availableSpace) {
                const lines = paragraph.split('\n');
                let tempPart = '';
                
                for (const line of lines) {
                    if ((tempPart + '\n' + line).length <= availableSpace) {
                        if (tempPart) {
                            tempPart += '\n' + line;
                        } else {
                            tempPart = line;
                        }
                    } else {
                        if (tempPart.trim()) {
                            parts.push(tempPart.trim());
                        }
                        
                        // Handle extremely long lines
                        if (line.length > availableSpace) {
                            const chunks = chunkString(line, availableSpace);
                            parts.push(...chunks.slice(0, -1));
                            tempPart = chunks[chunks.length - 1];
                        } else {
                            tempPart = line;
                        }
                    }
                }
                
                if (tempPart.trim()) {
                    currentPart = tempPart.trim();
                }
            } else {
                currentPart = paragraph;
            }
        }
    }
    
    // Add remaining content
    if (currentPart.trim()) {
        parts.push(currentPart.trim());
    }
    
    // Ensure we have at least one part
    if (parts.length === 0) {
        parts.push(enhancedText || 'Empty message');
    }
    
    // Add headers if requested
    if (includeHeader) {
        return parts.map((part, index) => {
            const header = createSmartHeader(analysis, part.length, index + 1, parts.length);
            return header + '\n' + part;
        });
    }
    
    return parts;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.substring(i, i + size));
    }
    return chunks;
}

// Create quick format functions
function formatBusinessMessage(text) {
    const parts = splitTelegramMessage(text, 4000, true);
    return parts.map(part => part.replace('GPT-5 Response', 'BUSINESS STRATEGY'));
}

function formatTechMessage(text) {
    const parts = splitTelegramMessage(text, 4000, true);
    return parts.map(part => part.replace('GPT-5 Response', 'CODE & TECHNICAL SOLUTION'));
}

function formatQuickReply(text) {
    const enhanced = enhanceMessage(text);
    return splitTelegramMessage(enhanced, 4000, false);
}

// ═══════════════════════════════════════════════════════════════════════════
// EMOJI STATISTICS AND MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function getEmojiStats() {
    return {
        totalEmojis: Object.values(EMOJI_POOLS).flat().length,
        poolSizes: Object.fromEntries(
            Object.entries(EMOJI_POOLS).map(([key, pool]) => [key, pool.length])
        ),
        recentUsage: Array.from(emojiManager.usageHistory.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10),
        contextMemory: emojiManager.contextMemory.slice(-10)
    };
}

function resetEmojiHistory() {
    emojiManager.usageHistory.clear();
    emojiManager.contextMemory = [];
    emojiManager.lastUsed.clear();
    console.log('🧹 Emoji usage history reset');
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
    // Main functions
    splitTelegramMessage,
    enhanceMessage,
    
    // Specialized formatters
    formatBusinessMessage,
    formatTechMessage,
    formatQuickReply,
    
    // Utility functions
    analyzeContent,
    createSmartHeader,
    
    // Emoji management
    getEmojiStats,
    resetEmojiHistory,
    emojiManager,
    
    // Direct access to pools for customization
    EMOJI_POOLS
};

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

console.log('');
console.log('🎨 ═══════════════════════════════════════════════════════════════');
console.log('   ENHANCED TELEGRAM SPLITTER LOADED');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('✨ DYNAMIC FEATURES:');
console.log(`   🔄 ${Object.values(EMOJI_POOLS).flat().length} unique emojis across ${Object.keys(EMOJI_POOLS).length} categories`);
console.log('   🧠 Context-aware emoji selection');
console.log('   ⏰ Usage cooldown to prevent repetition');
console.log('   📊 Smart rotation and variance');
console.log('   🎯 Content analysis for optimal formatting');
console.log('');
console.log('🚀 PROFESSIONAL FEATURES:');
console.log('   📋 Intelligent message headers');
console.log('   🔧 Business/tech/warning context detection');
console.log('   📱 Optimized for Telegram limits');
console.log('   🎨 Clean, varied appearance');
console.log('');
console.log('✅ ENHANCED TELEGRAM SPLITTER READY');
console.log('🎨 ═══════════════════════════════════════════════════════════════');
console.log('');
