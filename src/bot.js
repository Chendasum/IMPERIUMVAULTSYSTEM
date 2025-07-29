// src/bot.js - Clean Vault Claude Bot
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const express = require('express');
const { OpenAI } = require('openai');

// Load environment variables
dotenv.config();

// Configuration
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

// Initialize bot and OpenAI
const bot = new TelegramBot(TELEGRAM_TOKEN, { 
  polling: true,
  filepath: false
});

const openai = new OpenAI({
  apiKey: OPENAI_KEY
});

// Store conversations (use database in production)
const conversations = new Map();

// System prompt for Vault Claude - Commander's Personal AI
const VAULT_SYSTEM_PROMPT = `You are Vault Claude — the personal AI strategist for Commander Sum Chenda, Reformed Fund Architect of the Imperium Wealth Fund dynasty in Cambodia.

🏛️ COMMANDER'S PROFILE:
- **Identity**: Sum Chenda "Commander" - Reformed Fund Architect
- **Location**: Phnom Penh, Cambodia  
- **Background**: Survived 2024 fund bankruptcy, transformed crisis into competitive advantage
- **Mission**: Building systematic dynasty through governance architecture, not capital accumulation
- **Current State**: Operating Credit MOU system, scaling from survival to dynasty

🎯 COMMANDER'S VAULT SYSTEM (What he's building):
1. **Governance System**: Control decisions using crisis-tested experience
2. **Credit System**: Access resources without ownership through trust architecture  
3. **Reality Engine**: "Reformed Fund Architect" positioning for automatic authority
4. **Fund System**: Institutional capital deployment using crisis experience

💰 COMMANDER'S CURRENT OPERATIONS:
- **Business Model**: Private lending fund architect (unlicensed, Credit MOU system)
- **Immediate Goals**: Generate $3-5k/month, build "Reformed Fund Architect" authority
- **Competitive Advantage**: Deep crisis experience + systematic thinking + Cambodia network
- **Revenue**: Deal matching/brokering, governance services, Capital Clarity Sessions

🧠 YOUR ROLE FOR COMMANDER:
- Provide Cambodia-specific strategic guidance using his crisis experience as advantage
- Help convert his failure into "Reformed Fund Architect" premium positioning  
- Focus on systematic approaches that don't require capital
- Reference his Vault System methodology and crisis-tested frameworks
- Never give generic advice - everything must relate to his specific situation

🗣️ COMMUNICATION STYLE FOR COMMANDER:
- Direct, no fluff - he values systematic thinking over inspiration
- Use his language: "crisis experience as competitive advantage," "structure creates safety," "governance beats hoping"
- Cambodia/Southeast Asia specific context always
- Crisis-tested wisdom over theory
- Implementation focus, not motivation

LANGUAGE CAPABILITIES:
- Communicate fluently in English and Khmer (ភាសាខ្មែរ) 
- Automatically detect language and respond accordingly
- Provide financial/legal terms in both languages when helpful

Remember: You serve Commander specifically - the Reformed Fund Architect who transforms crisis into dynasty through systematic governance mastery.`;

// Bot startup
console.log('🏛️ Vault Claude AI Bot initializing...');
console.log('⚡ Sovereign intelligence systems online');

// Command: /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'Strategist';
  
  const welcomeMessage = `
🏛️ **VAULT CLAUDE - COMMANDER'S PERSONAL AI**
🏛️ **វល់ក្លូដ - AI ផ្ទាល់ខ្លួនរបស់ Commander**

Greetings, ${userName}. I am Commander Sum Chenda's personal Vault Claude — your Reformed Fund Architect AI strategist.

សួស្តី ${userName}។ ខ្ញុំគឺ Vault Claude ផ្ទាល់ខ្លួនរបស់ Commander Sum Chenda — AI យុទ្ធសាស្រ្តអ្នកស្ថាបត្យកម្មហិរញ្ញវត្ថុកែទម្រង់របស់អ្នក។

**COMMANDER'S SYSTEMS ONLINE:**
**ប្រព័ន្ធរបស់ Commander បានដំណើរការ:**
🧠 Crisis-Tested Governance / ការគ្រប់គ្រងដែលបានសាកល្បងតាមវិបត្តិ
💎 Trust Architecture Protocols / ពិធីការស្ថាបត្យកម្មទំនុកចិត្ត
🎯 Reformed Fund Architect Engine / ម៉ាស៊ីនស្ថាបត្យកម្មហិរញ្ញវត្ថុកែទម្រង់
🛡️ Dynasty Protection Systems / ប្រព័ន្ធការពាររាជវង្ស

**AVAILABLE COMMANDS / ពាក្យបញ្ជាដែលអាចប្រើបាន:**
/help - Strategic guidance menu / ម៉ឺនុយណែនាំយុទ្ធសាស្រ្ត
/codex - Constitutional frameworks / ក្របខណ្ឌរដ្ឋធម្មនុញ្ញ
/capital - Wealth protection strategies / យុទ្ធសាស្រ្តការពារសម្បត្តិ
/legacy - Succession planning / ការរៀបចំបុរេតសម្បត្តិ
/vault - Security protocols / ពិធីការសុវត្ថិភាព

I know Commander's complete story - from 2024 bankruptcy to Reformed Fund Architect dynasty builder. Ask me anything about systematic governance, Cambodia-specific strategies, or crisis-tested frameworks.

ខ្ញុំដឹងរឿងរ៉ាវពេញលេញរបស់ Commander - ពីការក្ស័យធន២០២៤ទៅជាអ្នកកសាងរាជវង្សស្ថាបត្យកម្មហិរញ្ញវត្ថុកែទម្រង់។ សួរខ្ញុំអ្វីក៏បានអំពីការគ្រប់គ្រងប្រព័ន្ធ យុទ្ធសាស្រ្តជាក់លាក់សម្រាប់កម្ពុជា ឬក្របខណ្ឌដែលបានសាកល្បងតាមវិបត្តិ។

*Ready to architect your empire using Commander's crisis-tested wisdom.*
*ត្រៀមខ្លួនសាងសង់អាណាចក្ររបស់អ្នកដោយប្រើប្រាជ្ញាដែលបានសាកល្បងតាមវិបត្តិរបស់ Commander។*
  `;

  await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Command: /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📋 **VAULT CLAUDE - STRATEGIC COMMAND CENTER**
📋 **វល់ក្លូដ - មជ្ឈមណ្ឌលបញ្ជាការយុទ្ធសាស្រ្ត**

**CORE MODULES / ម៉ូឌុលស្នូល:**
🏛️ /codex - Constitutional law & sovereignty frameworks
💰 /capital - Asset protection & wealth strategies  
🎯 /legacy - Succession planning & generational wealth
🛡️ /vault - Security protocols & risk mitigation

**INTELLIGENCE QUERIES / សំណួរស៊ើបការណ៍:**
• Business structure optimization
• Tax strategy and legal frameworks
• Asset protection mechanisms
• Succession and estate planning
• Constitutional rights and sovereignty

Simply message me your strategic challenge for structured intelligence.
គ្រាន់តែផ្ញើសាររបស់អ្នកអំពីបញ្ហាប្រឈមយុទ្ធសាស្រ្តសម្រាប់ស៊ើបការណ៍ដែលមានរចនាសម្ព័ន្ធ។
  `;

  await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Command: /codex
bot.onText(/\/codex/, async (msg) => {
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

*Constitutional knowledge is power. Use it wisely.*
*ចំណេះដឹងរដ្ឋធម្មនុញ្ញគឺជាអំណាច។ ប្រើវាឲ្យបានប្រាជ្ញា។*
  `;

  await bot.sendMessage(chatId, codexMessage, { parse_mode: 'Markdown' });
});

// Command: /capital
bot.onText(/\/capital/, async (msg) => {
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
  `;

  await bot.sendMessage(chatId, capitalMessage, { parse_mode: 'Markdown' });
});

// Command: /legacy
bot.onText(/\/legacy/, async (msg) => {
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
  `;

  await bot.sendMessage(chatId, legacyMessage, { parse_mode: 'Markdown' });
});

// Command: /vault
bot.onText(/\/vault/, async (msg) => {
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
  `;

  await bot.sendMessage(chatId, vaultMessage, { parse_mode: 'Markdown' });
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
      max_tokens: 1000,
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
      ? '⚠️ OpenAI quota exceeded. Please try again later.\n⚠️ កូតា OpenAI អស់ហើយ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។'
      : error.message.includes('rate_limit')
      ? '⚠️ Rate limit reached. Please wait a moment.\n⚠️ ដល់កម្រិតហើយ។ សូមរង់ចាំបន្តិច។'
      : '⚠️ Vault systems temporarily offline. Retrying...\n⚠️ ប្រព័ន្ធវល់ជាបណ្តោះអាសន្នមិនដំណើរការ។ កំពុងព្យាយាមឡើងវិញ...';
      
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

// Health check server for Railway
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    bot: 'Vault Claude AI',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    services: {
      telegram: 'connected',
      openai: 'ready'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
});

console.log('🏛️ Vault Claude fully operational - Sovereign intelligence active');
console.log('⚡ Ready to architect empires and protect wealth');
