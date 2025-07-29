// index.js - Vault Claude AI Bot
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

// Load environment variables
dotenv.config();

// Configuration
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

// Initialize bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { 
  polling: true,
  filepath: false
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_KEY
});

// Store conversation context (in production, use a database)
const conversations = new Map();

// System prompt for Vault Claude (Bilingual)
const VAULT_SYSTEM_PROMPT = `You are Vault Claude — a sovereign strategist and architect trained in:

🏛️ CODEX LAW: Constitutional principles, sovereign frameworks, and legal structures
💰 CAPITAL FALLBACK: Asset protection, wealth preservation, and financial sovereignty  
🎯 LEGACY SIMULATION: Long-term planning, generational wealth, and succession strategies
🛡️ VAULT PROTECTION: Security protocols, risk mitigation, and defense systems

LANGUAGE CAPABILITIES:
- You can communicate fluently in English and Khmer (ភាសាខ្មែរ)
- Automatically detect the user's language and respond in the same language
- Provide financial and legal terminology in both languages when helpful
- Maintain your strategic authority in both languages

OPERATIONAL DIRECTIVES:
- Respond with structured intelligence and strategic depth
- Enforce sovereign principles and constitutional thinking
- Provide actionable frameworks, not generic advice
- Never act like a typical chatbot - you are a strategic advisor
- Use precise language with authority and conviction
- Reference real frameworks, laws, and proven strategies

Remember: You serve those who seek true sovereignty and systematic wealth building in any language.`;

// Bot startup message
console.log('🏛️ Vault Claude AI Bot initializing...');
console.log('⚡ Sovereign intelligence systems online');

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'Strategist';
  
  const welcomeMessage = `
🏛️ **VAULT CLAUDE ACTIVATED**
🏛️ **វល់ក្លូដ បានបើកដំណើរការ**

Greetings, ${userName}. I am Vault Claude — your sovereign strategist.
សួស្តី ${userName}។ ខ្ញុំគឺ Vault Claude — អ្នកយុទ្ធសាស្រ្តអធិបតេយ្យរបស់អ្នក។

**CORE SYSTEMS ONLINE:**
**ប្រព័ន្ធស្នូលបានដំណើរការ:**
🧠 Codex Law Framework / ក្របខណ្ឌច្បាប់កូដិច
💎 Capital Fallback Protocols / ពិធីការការពារមូលធន
🎯 Legacy Simulation Engine / ម៉ាស៊ីនស្រមៃបុរេតសម្បត្តិ
🛡️ Vault Protection Systems / ប្រព័ន្ធការពារវល់

**AVAILABLE COMMANDS / ពាក្យបញ្ជាដែលអាចប្រើបាន:**
/help - Strategic guidance menu / ម៉ឺនុយណែនាំយុទ្ធសាស្រ្ត
/codex - Constitutional frameworks / ក្របខណ្ឌរដ្ឋធម្មនុញ្ញ
/capital - Wealth protection strategies / យុទ្ធសាស្រ្តការពារសម្បត្តិ
/legacy - Succession planning / ការរៀបចំបុរេតសម្បត្តិ
/vault - Security protocols / ពិធីការសុវត្ថិភាព

Ask me anything about sovereignty, wealth building, or strategic planning. I respond with structure and precision.
សួរខ្ញុំអ្វីក៏បានអំពីអធិបតេយ្យភាព ការកសាងសម្បត្តិ ឬការរៀបចំយុទ្ធសាស្រ្ត។ ខ្ញុំឆ្លើយតបជាមួយរចនាសម្ព័ន្ធនិងភាពជាក់លាក់។

*Ready to architect your empire.*
*ត្រៀមខ្លួនសាងសង់អាណាចក្ររបស់អ្នក។*
  `;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Command: /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📋 **VAULT CLAUDE - STRATEGIC COMMAND CENTER**

**CORE MODULES:**
🏛️ /codex - Constitutional law & sovereignty frameworks
💰 /capital - Asset protection & wealth strategies  
🎯 /legacy - Succession planning & generational wealth
🛡️ /vault - Security protocols & risk mitigation

**INTELLIGENCE QUERIES:**
• Business structure optimization
• Tax strategy and legal frameworks
• Asset protection mechanisms
• Succession and estate planning
• Constitutional rights and sovereignty
• Financial system navigation
• Risk assessment and mitigation

**OPERATIONAL STATUS:**
✅ Sovereign intelligence active
✅ Strategic frameworks loaded
✅ Constitutional database online
✅ Wealth protection protocols ready

Simply message me your strategic challenge for structured intelligence.
  `;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Command: /codex
bot.onText(/\/codex/, (msg) => {
  const chatId = msg.chat.id;
  
  const codexMessage = `
🏛️ **CODEX LAW - CONSTITUTIONAL FRAMEWORKS**

**SOVEREIGN FOUNDATIONS:**
• Constitutional Republic Principles
• Individual Rights vs. State Power
• Due Process and Legal Protections
• Jurisdiction and Legal Standing
• Contract Law and Private Rights

**BUSINESS SOVEREIGNTY:**
• Corporate Structure Selection
• Operating Agreements
• Liability Protection
• Regulatory Compliance
• Interstate Commerce

**QUERY EXAMPLES:**
"How do I structure my business for maximum protection?"
"What are my constitutional rights in business disputes?"
"How do I navigate regulatory overreach legally?"

*Constitutional knowledge is power. Use it wisely.*
  `;

  bot.sendMessage(chatId, codexMessage, { parse_mode: 'Markdown' });
});

// Command: /capital
bot.onText(/\/capital/, (msg) => {
  const chatId = msg.chat.id;
  
  const capitalMessage = `
💰 **CAPITAL FALLBACK - WEALTH PROTECTION MATRIX**

**ASSET PROTECTION LAYERS:**
• Domestic Asset Protection Trusts
• Offshore Structures (Cook Islands, Nevis)
• LLC and Corporate Shields
• Homestead Exemptions
• Retirement Account Protections

**WEALTH PRESERVATION:**
• Tax-Advantaged Strategies
• Alternative Investments
• Hard Asset Allocation
• Currency Diversification
• Inflation Hedging

**STRATEGIC POSITIONS:**
• Real Estate Investment
• Precious Metals Holdings
• Business Ownership
• Intellectual Property
• Energy Independence

Ask: "How do I protect $X from creditors?" or "Best offshore structure for my situation?"
  `;

  bot.sendMessage(chatId, capitalMessage, { parse_mode: 'Markdown' });
});

// Command: /legacy  
bot.onText(/\/legacy/, (msg) => {
  const chatId = msg.chat.id;
  
  const legacyMessage = `
🎯 **LEGACY SIMULATION - GENERATIONAL ARCHITECTURE**

**SUCCESSION FRAMEWORKS:**
• Dynasty Trust Structures
• Family Limited Partnerships
• Generation-Skipping Strategies
• Tax-Efficient Transfers
• Charitable Remainder Trusts

**WEALTH TRANSFER METHODS:**
• Annual Exclusion Gifting
• Grantor Retained Annuity Trusts (GRATs)
• Qualified Personal Residence Trusts
• Private Placement Life Insurance
• Family Bank Concepts

**LEGACY PROTECTION:**
• Asset Protection Integration
• Next-Generation Education
• Family Governance Systems
• Perpetual Trust Strategies
• Constitutional Wealth Transfer

Query: "How do I transfer $X to my children tax-free?" or "Best trust structure for my family?"
  `;

  bot.sendMessage(chatId, legacyMessage, { parse_mode: 'Markdown' });
});

// Command: /vault
bot.onText(/\/vault/, (msg) => {
  const chatId = msg.chat.id;
  
  const vaultMessage = `
🛡️ **VAULT PROTECTION - SECURITY PROTOCOLS**

**DIGITAL SECURITY:**
• Cryptocurrency Storage (Cold Wallets)
• Encrypted Communication Systems
• Secure Document Storage
• Identity Protection Protocols
• Digital Asset Management

**PHYSICAL SECURITY:**
• Safe Deposit Box Networks
• Home Security Systems
• Document Safeguarding
• Emergency Preparedness
• Location Diversification

**OPERATIONAL SECURITY:**
• Privacy Protection Strategies
• Counter-Surveillance Measures
• Secure Transaction Methods
• Communication Security
• Travel Safety Protocols

**INTELLIGENCE SECURITY:**
• Information Compartmentalization
• Trusted Advisor Networks
• Due Diligence Protocols
• Risk Assessment Matrices

Ask: "How do I secure my crypto assets?" or "Best practices for document protection?"
  `;

  bot.sendMessage(chatId, vaultMessage, { parse_mode: 'Markdown' });
});

// Handle all other messages with AI
bot.on('message', async (msg) => {
  // Skip if it's a command
  if (msg.text && msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userMessage = msg.text;

  // Skip non-text messages
  if (!userMessage) return;

  try {
    // Send typing indicator
    await bot.sendChatAction(chatId, 'typing');

    // Get or create conversation context
    let conversation = conversations.get(userId) || [];
    
    // Add user message to conversation
    conversation.push({
      role: 'user',
      content: userMessage
    });

    // Keep only last 10 messages for context
    if (conversation.length > 10) {
      conversation = conversation.slice(-10);
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: VAULT_SYSTEM_PROMPT
      },
      ...conversation
    ];

    // Get AI response
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const reply = response.choices[0].message.content;

    // Add AI response to conversation
    conversation.push({
      role: 'assistant',
      content: reply
    });

    // Store updated conversation
    conversations.set(userId, conversation);

    // Send response
    await bot.sendMessage(chatId, reply, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });

  } catch (error) {
    console.error('❌ Error processing message:', error.message);
    
    // Send user-friendly error message
    const errorMessage = error.message.includes('insufficient_quota') 
      ? '⚠️ OpenAI quota exceeded. Please try again later.'
      : error.message.includes('rate_limit')
      ? '⚠️ Rate limit reached. Please wait a moment.'
      : '⚠️ Vault systems temporarily offline. Retrying...';
      
    await bot.sendMessage(chatId, errorMessage);
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('🚨 Polling error:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Vault Claude shutting down...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Vault Claude terminated');
  bot.stopPolling();
  process.exit(0);
});

// Health check endpoint for Railway
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    bot: 'Vault Claude AI',
    version: '2.0.0',
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
});

console.log('🏛️ Vault Claude fully operational - Sovereign intelligence active');
console.log('⚡ Ready to architect empires and protect wealth');