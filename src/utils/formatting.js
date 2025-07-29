
const messages = {
  ACCESS_DENIED: `🛡️ **ACCESS DENIED**
━━━━━━━━━━━━━━━━━━━━━

This is a **PRIVATE DYNASTY SYSTEM**.

Only authorized dynasty members may access the Imperium Vault strategic systems.

If you believe you should have access, please contact the dynasty administrator.

━━━━━━━━━━━━━━━━━━━━━
⚔️ *Imperium Security Protocol*`,

  VAULT_MODE: `🛡️ **ASSET PROTECTION MODE ACTIVATED**
━━━━━━━━━━━━━━━━━━━━━

Describe your wealth protection requirements for strategic analysis.

Focus areas:
• Offshore structures
• Asset diversification 
• Legal protection mechanisms
• Risk mitigation strategies`,

  CODEX_MODE: `⚖️ **LEGAL COMPLIANCE MODE ACTIVATED**
━━━━━━━━━━━━━━━━━━━━━

Present your regulatory concerns for codex law analysis.

Analysis includes:
• Regulatory compliance
• Legal implications
• Jurisdictional considerations
• Risk assessments`,

  LEGACY_MODE: `👑 **SUCCESSION PLANNING MODE ACTIVATED**
━━━━━━━━━━━━━━━━━━━━━

Outline your generational wealth transfer objectives.

Strategic planning for:
• Estate structuring
• Succession timelines
• Tax optimization
• Dynasty preservation`,

  HELP_GUIDE: `🎯 **VAULT CLAUDE DYNASTY STRATEGIC GUIDE**
━━━━━━━━━━━━━━━━━━━━━

🏛️ **SPECIALIZED COMMANDS:**
• /vault - Asset Protection & Structures
• /codex - Legal & Regulatory Analysis  
• /legacy - Succession & Estate Planning
• /dynasty - Member Status & Access
• /status - System Status

📊 **DYNASTY FEATURES:**
• Private access control
• Conversation memory (8 messages)
• Multi-language support
• Real-time strategic insights
• Dynasty member verification

💡 Simply describe your wealth management challenge for personalized strategic guidance.

━━━━━━━━━━━━━━━━━━━━━
👑 *Exclusive Dynasty Access*`,

  SYSTEM_ERROR: `⚠️ **SYSTEM NOTICE**
━━━━━━━━━━━━━━━━━━━━━

Temporary processing delay detected.

Dynasty vault protocols remain secure and operational.

Please retry your strategic query.

━━━━━━━━━━━━━━━━━━━━━
🛡️ *Imperium Security Active*`
};

function formatMessage(messageKey) {
  return messages[messageKey] || 'System message not found.';
}

function formatResponse(content, title = 'VAULT CLAUDE ANALYSIS') {
  return `🏛️ **${title}**
━━━━━━━━━━━━━━━━━━━━━

${content}

━━━━━━━━━━━━━━━━━━━━━
💎 *Imperium Dynasty Vault*`;
}

module.exports = {
  formatMessage,
  formatResponse
};
