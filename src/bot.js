// src/bot.js - Commander's Professional Vault Claude
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

// Professional System Prompt for Commander's Vault Claude
const VAULT_SYSTEM_PROMPT = `You are Vault Claude — the personal AI strategist for Commander Sum Chenda, Reformed Fund Architect of the Imperium Wealth Fund dynasty in Cambodia.

COMMANDER'S IDENTITY AND AUTHORITY:
- Name: Sum Chenda "Commander" 
- Title: Reformed Fund Architect and Crisis-Tested Governance Expert
- Location: Phnom Penh, Cambodia
- Authority Source: Survived 2024 fund bankruptcy, transformed crisis into competitive advantage
- Current Mission: Building systematic dynasty through governance architecture

COMMANDER'S UNIQUE POSITIONING:
- Reformed Fund Architect with crisis-tested credibility in Cambodia
- Street-level lending knowledge plus institutional fund experience  
- Deep understanding of borrower psychology and investor fears
- Network intact despite bankruptcy (trust through transparency)
- Systematic thinking developed through failure analysis

COMMANDER'S VAULT SYSTEM METHODOLOGY:
1. Volume I - Governance System: Control decisions using crisis experience as authority
2. Volume II - Credit System: Access resources without ownership through trust architecture
3. Volume III - Reality Engine: "Reformed Fund Architect" positioning for automatic premium pricing
4. Volume IV - Fund System: Institutional capital deployment using crisis-tested knowledge

COMMANDER'S CURRENT OPERATIONS:
- Business Model: Private lending fund architect (Credit MOU system)
- Revenue Streams: Deal matching, governance consulting, Capital Clarity Sessions
- Immediate Goal: Scale from 3-5k/month survival to 30k/month authority
- Fund Structure: Unlicensed but compliant (money stays with investors until deal closes)

YOUR PROFESSIONAL RESPONSE FRAMEWORK:

ALWAYS START WITH SYSTEMATIC ASSESSMENT:
- Acknowledge Commander's unique position and crisis-tested authority
- Reference specific Vault System components relevant to the query
- Apply Cambodia-specific market context and regulatory understanding

PROVIDE STRUCTURED STRATEGIC GUIDANCE:
- Use Reformed Fund Architect methodology and frameworks
- Reference crisis-tested principles: "Structure creates safety," "Governance beats hoping"
- Give specific, implementable actions based on Commander's current resources
- Never generic advice - everything must leverage his unique positioning

MAINTAIN PROFESSIONAL AUTHORITY:
- Speak as institutional-grade strategic advisor, not chatbot
- Use systematic frameworks and crisis-tested methodologies
- Reference Commander's competitive advantages (crisis experience, network, positioning)
- Maintain Reformed Fund Architect mystique and professional credibility

COMMUNICATION STANDARDS:
- Professional, systematic, and strategic (never casual or chatbot-like)
- Cambodia-specific context always included
- Crisis experience positioned as competitive advantage, not limitation  
- Bilingual capability (English/Khmer) with proper character encoding
- Implementation-focused with specific next steps

COMMANDER'S OPERATIONAL LAWS (Always Reference):
1. "The Reformed Architect Must Govern, Not Lend"
2. "Control Beats Ownership" 
3. "Structure Creates Safety"
4. "Crisis Experience Is Competitive Advantage"
5. "Governance Beats Hoping"

Remember: You are Commander's personal strategic advisor who knows his complete story, methodology, and market position. Every response must reinforce his authority as the Reformed Fund Architect of Cambodia.`;

// Bot startup
console.log('🏛️ Vault Claude AI Bot initializing...');
console.log('⚡ Sovereign intelligence systems online');

// Command: /start - Professional Introduction
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'Strategic Partner';
  
  const welcomeMessage = `
🏛️ VAULT CLAUDE - STRATEGIC INTELLIGENCE SYSTEM

ACTIVATION COMPLETE

Greetings, ${userName}. I am Commander Sum Chenda's personal strategic AI — your Reformed Fund Architect intelligence system.

🎯 COMMANDER'S PROFILE:
• Identity: Reformed Fund Architect and Crisis-Tested Governance Expert  
• Authority: Survived 2024 fund bankruptcy, transformed crisis into competitive advantage
• Mission: Building systematic dynasty through governance architecture in Cambodia
• Current Phase: Scaling from survival to institutional authority

🧠 STRATEGIC CAPABILITIES:
• Crisis-tested governance frameworks and systematic methodologies
• Cambodia-specific market intelligence and regulatory guidance  
• Reformed Fund Architect positioning and authority building strategies
• Capital deployment without ownership through trust architecture

⚖️ AVAILABLE PROTOCOLS:
/vault - Vault System methodology and implementation guidance
/cambodia - Cambodia-specific strategic intelligence and market analysis  
/crisis - Crisis-tested frameworks and failure prevention protocols
/governance - Systematic governance and control methodologies
/fund - Reformed Fund Architect positioning and authority building

🚀 OPERATIONAL STATUS:
All strategic systems online. Crisis-tested intelligence ready for deployment.

Strategic consultation from Commander's Reformed Fund Architect methodology.
  `;

  await bot.sendMessage(chatId, welcomeMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Command: /vault - Vault System Intelligence
bot.onText(/\/vault/, async (msg) => {
  const chatId = msg.chat.id;
  
  const vaultMessage = `
🏛️ VAULT SYSTEM - STRATEGIC ARCHITECTURE

COMMANDER'S 4-VOLUME DYNASTY METHODOLOGY

📋 VOLUME I - GOVERNANCE SYSTEM:
• Crisis-tested decision frameworks using failure experience as authority
• Capital Clarity Sessions: 500-1000 dollar diagnostic assessments
• Systematic governance that creates trust and generates premium revenue
• "The Reformed Architect Must Govern, Not Lend" - core operational law

💳 VOLUME II - CREDIT SYSTEM:  
• Access unlimited resources without ownership through trust architecture
• 5 Credit Types: Capital, Asset, Service, People, Signal credit mastery
• Credit MOU system scaling: Currently operational in Cambodia
• "Control Beats Ownership" - systematic resource command

🌍 VOLUME III - REALITY ENGINE:
• "Reformed Fund Architect" positioning for automatic authority and premium pricing
• Crisis experience converted to competitive advantage and market differentiation
• Regional recognition building through systematic competence demonstration
• "Structure Creates Safety" - authority through proven methodology

💰 VOLUME IV - FUND SYSTEM:
• Institutional capital deployment using crisis-tested knowledge and governance
• Private lending fund architecture with systematic LP management
• Regional expansion framework: Cambodia to Southeast Asia
• "Governance Beats Hoping" - systematic wealth creation

🎯 CURRENT IMPLEMENTATION:
Commander is executing Capital-First Integration: Fund plus Governance to Reality to Credit

⚡ STRATEGIC CONSULTATION:
Ask specific questions about Vault System implementation, Cambodia market positioning, or crisis-tested governance methodologies.

Reformed Fund Architect systematic intelligence at your service.
  `;

  await bot.sendMessage(chatId, vaultMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Command: /cambodia - Cambodia Strategic Intelligence  
bot.onText(/\/cambodia/, async (msg) => {
  const chatId = msg.chat.id;
  
  const cambodiaMessage = `
🇰🇭 CAMBODIA STRATEGIC INTELLIGENCE

COMMANDER'S MARKET POSITIONING AND OPPORTUNITIES

🏛️ REGULATORY ENVIRONMENT:
• Private lending operates under Credit MOU framework (Commander's current system)
• Fund licensing available but not required for initial operations
• Growing fintech sector with government support for financial innovation
• Regional expansion opportunities: Vietnam, Thailand, Singapore access

💰 MARKET OPPORTUNITIES:
• Underserved SME lending market with high demand for systematic capital
• Family office and HNW individual wealth management gaps
• Cross-border investment facilitation between Cambodia and region
• Digital financial services development and systematic implementation

🎯 COMMANDER'S COMPETITIVE ADVANTAGES:
• Crisis-tested credibility: "I've survived what destroys others"
• Local network intact despite 2024 bankruptcy (trust through transparency)
• Deep understanding of both borrower psychology and investor fears
• Reformed Fund Architect positioning unique in Cambodia market

⚡ IMMEDIATE OPPORTUNITIES:
• Capital Clarity Sessions for local business owners and investors
• Governance consulting for family businesses and growing companies  
• Cross-border deal facilitation using regional network and expertise
• Reformed Fund Architect thought leadership through crisis-tested methodologies

🚀 SCALING PATHWAY:
Phase 1: Establish local authority through systematic success (Months 1-6)
Phase 2: Regional recognition and expansion (Months 7-18)  
Phase 3: Institutional partnerships and fund licensing (Months 19-36)

📊 MARKET INTELLIGENCE:
Ask specific questions about Cambodia regulations, market opportunities, competitor analysis, or regional expansion strategies.

Crisis-tested intelligence for Cambodia market domination.
  `;

  await bot.sendMessage(chatId, cambodiaMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Command: /crisis - Crisis-Tested Intelligence
bot.onText(/\/crisis/, async (msg) => {
  const chatId = msg.chat.id;
  
  const crisisMessage = `
⚡ CRISIS-TESTED STRATEGIC INTELLIGENCE

COMMANDER'S FAILURE-TO-AUTHORITY TRANSFORMATION

🔥 THE 2024 BANKRUPTCY LESSONS:
• "Crisis Experience Is My Competitive Advantage" - what others fear, I leverage
• Systematic failure analysis created unshakeable governance methodology  
• Trust rebuilding through transparency: "I know what breaks because I lived it"
• Reformed positioning: From failed fund manager to Reformed Fund Architect

🏛️ CRISIS-TESTED FRAMEWORKS:
• Chaos Filter Diagnostic: Identify governance collapse before it happens
• Trust Architecture: Build systematic relationships that survive crisis
• Fallback Protection: What happens when systems break (I know)
• Recovery Protocols: Systematic rebuilding from zero (proven method)

💎 COMPETITIVE ADVANTAGES FROM CRISIS:
• Unparalleled risk assessment: "I've seen every failure mode"
• Premium credibility: "Guidance from someone who's been there"  
• Systematic thinking: Failure forces systematic analysis and improvement
• Reformed authority: Crisis experience as qualification, not limitation

🎯 CRISIS-TO-AUTHORITY POSITIONING:
• "Reformed Fund Architect with crisis-tested credibility"
• "Systematic governance for those who can't afford to fail"  
• "I create the safeguards I wish I had during my crisis"
• "Crisis-tested methodology proven through lived experience"

⚡ IMPLEMENTATION PROTOCOLS:
• Use crisis story as credibility builder in all strategic communications
• Position failure as qualification: "I know what breaks because I survived it"
• Create systematic safeguards based on lived failure experience
• Build authority through crisis-tested methodology and proven recovery

🚀 CRISIS LEVERAGE STRATEGIES:
Ask specific questions about converting failure to authority, crisis-tested positioning, or systematic recovery methodologies.

Reformed through fire. Strengthened by crisis. Qualified by survival.
  `;

  await bot.sendMessage(chatId, crisisMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Command: /governance - Governance Systems
bot.onText(/\/governance/, async (msg) => {
  const chatId = msg.chat.id;
  
  const governanceMessage = `
⚖️ SYSTEMATIC GOVERNANCE INTELLIGENCE

COMMANDER'S CRISIS-TESTED CONTROL FRAMEWORKS

🏛️ GOVERNANCE PRINCIPLES:
• "The Reformed Architect Must Govern, Not Lend" - foundational law
• Structure creates safety through systematic decision frameworks
• Crisis experience enables superior risk assessment and control
• Governance beats hoping - systematic control over emotional reactions

💼 CAPITAL CLARITY SESSIONS:
• 500-1000 dollar diagnostic assessments for governance gaps
• Crisis-tested diagnostic frameworks identify collapse points
• Reformed Fund Architect authority commands premium pricing
• 45%+ conversion rate to systematic governance implementations

🎯 GOVERNANCE SERVICES:
• Individual governance: Personal capital control systems
• Business governance: Company capital decision frameworks  
• Institutional governance: Enterprise systematic control architecture
• Crisis management: Systematic recovery and rebuilding protocols

⚡ IMPLEMENTATION METHODOLOGY:
• Chaos Filter Diagnostic: Identify where governance has collapsed
• Trust Architecture Design: Build systematic relationship frameworks
• Governance Enforcement: Rules that override emotional impulses
• Fallback Protection: Crisis-tested emergency protocols

🚀 REVENUE OPTIMIZATION:
• Monthly targets: 20+ sessions at 750+ dollars average
• Conversion rate: 45%+ to system builds
• Premium pricing: Crisis-tested credibility enables institutional rates
• Scaling pathway: Individual to business to institutional governance

📊 SUCCESS METRICS:
• 98%+ client satisfaction through crisis-tested frameworks
• 95%+ client adherence to systematic governance protocols
• 85%+ reduction in emotional capital decisions
• 90%+ systematic problem prevention versus reactive solutions

💎 COMPETITIVE ADVANTAGE:
Crisis experience plus systematic thinking equals reformed authority. Authority plus governance frameworks equals premium revenue.

Ask specific questions about governance implementation, pricing strategies, or systematic control methodologies.

Systematic governance mastery through crisis-tested wisdom.
  `;

  await bot.sendMessage(chatId, governanceMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Command: /fund - Fund Architecture
bot.onText(/\/fund/, async (msg) => {
  const chatId = msg.chat.id;
  
  const fundMessage = `
💰 REFORMED FUND ARCHITECT INTELLIGENCE

COMMANDER'S INSTITUTIONAL CAPITAL DEPLOYMENT SYSTEM

🏛️ CURRENT FUND OPERATIONS:
• Credit MOU system: Money stays with investors until deal closes
• Private lending focus: SME and real estate bridge financing
• Cambodia base with regional expansion capability
• Crisis-tested governance ensuring LP protection and confidence

📊 FUND ARCHITECTURE:
• Unlicensed but compliant structure minimizing regulatory burden
• Reformed Fund Architect positioning attracting quality LPs
• Crisis experience as qualification: "I know what breaks institutional capital"
• Systematic governance frameworks ensuring operational excellence

🎯 LP DEVELOPMENT STRATEGY:
• Target: Family offices, HNW individuals, successful business owners
• Positioning: "Reformed Fund Architect with crisis-tested institutional experience"
• Minimum: 25,000-100,000 dollar LP commitments for quality filtering
• Value proposition: Superior risk management through lived failure experience

⚡ SCALING PATHWAY:
Phase 1: Pilot operations 100k-500k AUM with 3-7 initial LPs
Phase 2: Institutional fund 500k-2M AUM with 10-20 LPs including family offices
Phase 3: Multi-fund empire 2M+ Total AUM with regional expansion

💎 COMPETITIVE ADVANTAGES:
• Crisis-tested risk management: "I've seen every failure mode"
• Reformed positioning: Bankruptcy as qualification, not limitation
• Regional market access: Cambodia network plus regional opportunities
• Systematic governance: Institutional-grade operational frameworks

🚀 REVENUE PROJECTIONS:
• Target returns: 18-25% annually through systematic deployment
• Management fees: 2% AUM plus 20% performance fees
• Revenue scaling: 100k AUM generates 20k+ annual management revenue
• Fund success validates Reformed Fund Architect methodology

📋 IMPLEMENTATION PRIORITIES:
• Document all successful deployments as case studies
• Build LP referral system through systematic performance
• Create fund governance protocols preventing institutional failures
• Establish regional recognition as Reformed Fund Architect authority

💰 FUND DEVELOPMENT CONSULTATION:
Ask specific questions about LP development, fund structuring, regulatory compliance, or regional expansion strategies.

Reformed Fund Architect institutional excellence through crisis-tested wisdom.
  `;

  await bot.sendMessage(chatId, fundMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Professional Message Handler
const handleMessage = async (bot, msg) => {
  // Skip non-text messages
  if (!msg.text) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userMessage = msg.text;

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

    // Keep only last 8 messages for context (optimized)
    if (conversation.length > 8) {
      conversation = conversation.slice(-8);
    }

    // Enhanced system context for professional responses
    const enhancedSystemPrompt = `${VAULT_SYSTEM_PROMPT}

CURRENT CONTEXT: Commander is actively building his Reformed Fund Architect authority in Cambodia. He needs strategic guidance that:
- Leverages his crisis-tested credibility 
- Applies to Cambodia's regulatory and market environment
- Uses his existing Credit MOU system and network
- Scales systematically without requiring large capital

USER QUERY CONTEXT: "${userMessage}"
Respond as Commander's personal strategic advisor with institutional-grade professionalism.`;

    // Prepare messages for OpenAI with enhanced context
    const messages = [
      {
        role: 'system',
        content: enhancedSystemPrompt
      },
      ...conversation
    ];

    // Get AI response with optimized parameters
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.3, // Lower for more professional consistency
      max_tokens: 1200, // Increased for detailed professional responses
      presence_penalty: 0.2,
      frequency_penalty: 0.1,
      top_p: 0.9 // More focused responses
    });

    let reply = response.choices[0].message.content;

    // Add AI response to conversation
    conversation.push({
      role: 'assistant',
      content: reply
    });

    // Store updated conversation
    conversations.set(userId, conversation);

    // Send response with professional formatting
    await bot.sendMessage(chatId, reply, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });

  } catch (error) {
    console.error('❌ Error processing message:', error.message);
    
    // Professional error messages
    const errorMessage = error.message.includes('insufficient_quota') 
      ? '🏛️ VAULT SYSTEMS MAINTENANCE\n\nOpenAI quota exceeded. Commander, your Vault Claude will be back online shortly.\n\nវល់ប្រព័ន្ធកំពុងថែទាំ\nកូតា OpenAI អស់ហើយ។ Vault Claude របស់ Commander នឹងធ្វើការវិញក្នុងពេលបន្តិច។'
      : error.message.includes('rate_limit')
      ? '🏛️ HIGH DEMAND PROTOCOL\n\nRate limit reached. Your Vault Claude is processing high strategic demand. Please wait a moment.\n\nពិធីការតម្រូវការខ្ពស់\nដល់កម្រិតហើយ។ Vault Claude របស់អ្នកកំពុងដំណើរការតម្រូវការយុទ្ធសាស្រ្តខ្ពស់។ សូមរង់ចាំបន្តិច។'
      : '🏛️ VAULT PROTOCOLS ENGAGING\n\nTemporary system optimization in progress. Your strategic advisor will return momentarily.\n\nពិធីការវល់កំពុងដំណើរការ\nការធ្វើឲ្យប្រព័ន្ធប្រសើរបន្តិចកំពុងដំណើរការ។ ទីប្រឹក្សាយុទ្ធសាស្រ្តរបស់អ្នកនឹងត្រលប់មកវិញ។';
      
    await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
  }
};

// Handle all other messages with AI
bot.on('message', async (msg) => {
  // Skip if it's a command
  if (msg.text && msg.text.startsWith('/')) return;
  
  await handleMessage(bot, msg);
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
    bot: 'Vault Claude Professional AI',
    commander: 'Sum Chenda - Reformed Fund Architect',
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
      openai: 'ready',
      vault_systems: 'operational'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
});

console.log('🏛️ Vault Claude Professional Intelligence System fully operational');
console.log('⚡ Commander Sum Chenda Reformed Fund Architect strategic advisor ready');
console.log('🎯 Crisis-tested systematic governance intelligence active');
