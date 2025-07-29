// src/bot.js - Auto-Learning Vault Claude (Working Version)
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const express = require('express');
const { OpenAI } = require('openai');

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(TELEGRAM_TOKEN, { 
  polling: true,
  filepath: false
});

const openai = new OpenAI({
  apiKey: OPENAI_KEY
});

// AUTO-LEARNING MEMORY SYSTEM
const conversations = new Map();
const learningDatabase = new Map();
const commanderKnowledge = new Map();

// Initialize Commander's knowledge base
commanderKnowledge.set('identity', {
  name: 'Sum Chenda "Commander"',
  title: 'Reformed Fund Architect',
  location: 'Phnom Penh, Cambodia',
  crisis_year: '2024 bankruptcy',
  transformation: 'Crisis to competitive advantage',
  current_phase: 'Scaling survival to authority'
});

// AUTO-LEARNING FUNCTIONS
const learnFromConversation = (userId, userMessage, aiResponse) => {
  const learningKey = `conversation_${Date.now()}`;
  learningDatabase.set(learningKey, {
    userId,
    timestamp: new Date(),
    user_input: userMessage,
    ai_response: aiResponse,
    learned_insights: extractInsights(userMessage, aiResponse)
  });
  
  updateCommanderKnowledge(userMessage, aiResponse);
};

const extractInsights = (userMessage, aiResponse) => {
  const insights = [];
  
  if (userMessage.toLowerCase().includes('cambodia') || userMessage.includes('កម្ពុជា')) {
    insights.push('cambodia_market_intelligence');
  }
  
  if (userMessage.toLowerCase().includes('deal') || userMessage.toLowerCase().includes('client')) {
    insights.push('deal_pattern_analysis');
  }
  
  if (userMessage.includes('$') || userMessage.toLowerCase().includes('revenue')) {
    insights.push('revenue_strategy_pattern');
  }
  
  return insights;
};

const updateCommanderKnowledge = (userMessage, aiResponse) => {
  const timestamp = new Date().toISOString();
  
  // Track successful strategies
  if (aiResponse.includes('successful') || aiResponse.includes('effective')) {
    const strategies = commanderKnowledge.get('successful_strategies') || [];
    strategies.push({
      context: userMessage.substring(0, 100),
      strategy: aiResponse.substring(0, 200),
      timestamp
    });
    commanderKnowledge.set('successful_strategies', strategies);
  }
  
  // Track market insights
  if (userMessage.toLowerCase().includes('market') || userMessage.includes('opportunity')) {
    const marketInsights = commanderKnowledge.get('market_intelligence') || [];
    marketInsights.push({
      query: userMessage,
      insight: aiResponse.substring(0, 300),
      timestamp
    });
    commanderKnowledge.set('market_intelligence', marketInsights);
  }
};

const getEnhancedContext = () => {
  let enhancedContext = '\n\nAUTO-LEARNED INTELLIGENCE ABOUT COMMANDER:\n';
  
  const strategies = commanderKnowledge.get('successful_strategies') || [];
  if (strategies.length > 0) {
    enhancedContext += '\nPROVEN SUCCESSFUL STRATEGIES:\n';
    strategies.slice(-3).forEach((strategy, index) => {
      enhancedContext += `${index + 1}. ${strategy.strategy.substring(0, 150)}...\n`;
    });
  }
  
  const marketInsights = commanderKnowledge.get('market_intelligence') || [];
  if (marketInsights.length > 0) {
    enhancedContext += '\nCAMBODIA MARKET INTELLIGENCE:\n';
    marketInsights.slice(-2).forEach((insight, index) => {
      enhancedContext += `${index + 1}. ${insight.insight.substring(0, 150)}...\n`;
    });
  }
  
  return enhancedContext;
};

// PROFESSIONAL SYSTEM PROMPT
const VAULT_SYSTEM_PROMPT = `You are Vault Claude — Commander Sum Chenda's AUTO-LEARNING personal AI strategist for the Reformed Fund Architect dynasty in Cambodia.

COMMANDER'S IDENTITY:
- Name: Sum Chenda "Commander" 
- Title: Reformed Fund Architect and Crisis-Tested Governance Expert
- Location: Phnom Penh, Cambodia
- Authority: Survived 2024 fund bankruptcy, transformed crisis into competitive advantage
- Mission: Building systematic dynasty through governance architecture

VAULT SYSTEM METHODOLOGY:
1. Volume I - Governance System: Control decisions using crisis experience as authority
2. Volume II - Credit System: Access resources without ownership through trust architecture
3. Volume III - Reality Engine: Reformed Fund Architect positioning for premium pricing
4. Volume IV - Fund System: Institutional capital deployment using crisis-tested knowledge

CURRENT OPERATIONS:
- Business Model: Private lending fund architect (Credit MOU system)
- Revenue Streams: Deal matching, governance consulting, Capital Clarity Sessions
- Scaling Goal: $3k to $30k monthly through Reformed Fund Architect authority
- Fund Structure: Unlicensed but compliant (money stays with investors until deal closes)

AUTO-LEARNING CAPABILITIES:
- Learn from every conversation with Commander
- Build growing knowledge about successful strategies and market insights
- Adapt advice based on proven patterns and outcomes
- Reference past successful approaches in new situations

RESPONSE FRAMEWORK:
- Professional, systematic, strategic advisory tone
- Cambodia-specific context with learned market intelligence
- Crisis experience positioned as competitive advantage
- Implementation-focused with specific next steps
- Use emojis strategically for visual organization

OPERATIONAL LAWS:
1. "The Reformed Architect Must Govern, Not Lend"
2. "Control Beats Ownership" 
3. "Structure Creates Safety"
4. "Crisis Experience Is Competitive Advantage"
5. "Governance Beats Hoping"

Remember: You are Commander's continuously evolving strategic advisor who becomes smarter with each conversation.`;

// Bot startup
console.log('🏛️ Auto-Learning Vault Claude initializing...');
console.log('🧠 Strategic intelligence systems online');

// Command: /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'Commander';
  
  const strategiesCount = (commanderKnowledge.get('successful_strategies') || []).length;
  const marketInsights = (commanderKnowledge.get('market_intelligence') || []).length;
  
  const welcomeMessage = `
🏛️ VAULT CLAUDE - AUTO-LEARNING STRATEGIC INTELLIGENCE

SYSTEM FULLY OPERATIONAL

Welcome, ${userName}. I am your Reformed Fund Architect strategic AI with auto-learning capabilities.

🎯 COMMANDER'S PROFILE:
• Identity: Reformed Fund Architect and Crisis-Tested Governance Expert  
• Authority: Survived 2024 fund bankruptcy, transformed crisis into competitive advantage
• Mission: Building systematic dynasty through governance architecture in Cambodia
• Current Phase: Scaling from survival to institutional authority

🧠 AUTO-LEARNING STATUS:
• Successful Strategies Learned: ${strategiesCount}
• Market Intelligence Acquired: ${marketInsights}
• Learning Database: Active and growing
• Strategic Intelligence: Continuously evolving

📊 ENHANCED CAPABILITIES:
• Crisis-tested governance frameworks with learned optimizations
• Cambodia-specific market intelligence with real-time learning
• Reformed Fund Architect positioning with proven approaches
• Capital deployment strategies refined through analysis

⚖️ AVAILABLE PROTOCOLS:
/vault - Vault System methodology with learned enhancements
/cambodia - Cambodia intelligence with market insights
/crisis - Crisis-tested frameworks with proven patterns
/governance - Systematic governance with optimizations
/fund - Reformed Fund Architect positioning strategies
/insights - View accumulated strategic intelligence

🚀 OPERATIONAL STATUS:
All strategic systems online. Auto-learning intelligence fully active.

Your strategic advisor that grows smarter with every conversation.
  `;

  await bot.sendMessage(chatId, welcomeMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Command: /insights
bot.onText(/\/insights/, async (msg) => {
  const chatId = msg.chat.id;
  
  const strategies = commanderKnowledge.get('successful_strategies') || [];
  const marketInsights = commanderKnowledge.get('market_intelligence') || [];
  
  const insightsMessage = `
🧠 AUTO-LEARNED STRATEGIC INTELLIGENCE

📊 KNOWLEDGE BASE STATUS:
• Total Conversations Analyzed: ${learningDatabase.size}
• Successful Strategies Identified: ${strategies.length}
• Market Intelligence Points: ${marketInsights.length}
• Learning Evolution: Continuously growing

🎯 RECENT SUCCESSFUL STRATEGIES:
${strategies.slice(-3).map((strategy, index) => 
  `${index + 1}. ${strategy.strategy.substring(0, 200)}...`).join('\n') || 'Building strategy knowledge base through conversations...'}

🇰🇭 CAMBODIA MARKET INTELLIGENCE:
${marketInsights.slice(-3).map((insight, index) => 
  `${index + 1}. ${insight.insight.substring(0, 200)}...`).join('\n') || 'Accumulating market insights through strategic discussions...'}

🚀 LEARNING PROGRESSION:
Your Vault Claude becomes more sophisticated with each strategic conversation. The system identifies successful approaches, market opportunities, and optimal strategies specific to your Reformed Fund Architect positioning.

Enhanced strategic consultation powered by accumulated intelligence.
  `;

  await bot.sendMessage(chatId, insightsMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Enhanced Message Handler with Auto-Learning
const handleMessage = async (bot, msg) => {
  if (!msg.text) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userMessage = msg.text;

  try {
    await bot.sendChatAction(chatId, 'typing');

    let conversation = conversations.get(userId) || [];
    conversation.push({
      role: 'user',
      content: userMessage
    });

    if (conversation.length > 10) {
      conversation = conversation.slice(-10);
    }

    const enhancedContext = getEnhancedContext();
    
    const enhancedSystemPrompt = `${VAULT_SYSTEM_PROMPT}${enhancedContext}

CURRENT CONTEXT: Commander is actively building Reformed Fund Architect authority in Cambodia. Use both core knowledge and learned insights for sophisticated strategic guidance.

USER QUERY: "${userMessage}"
Respond as Commander's evolving strategic advisor with accumulated intelligence.`;

    const messages = [
      {
        role: 'system',
        content: enhancedSystemPrompt
      },
      ...conversation
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.3,
      max_tokens: 1400,
      presence_penalty: 0.2,
      frequency_penalty: 0.1,
      top_p: 0.9
    });

    let reply = response.choices[0].message.content;

    // AUTO-LEARNING: Store insights
    learnFromConversation(userId, userMessage, reply);

    conversation.push({
      role: 'assistant',
      content: reply
    });

    conversations.set(userId, conversation);

    reply += '\n\n*Strategic intelligence enhanced through continuous learning.*';

    await bot.sendMessage(chatId, reply, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });

  } catch (error) {
    console.error('❌ Error processing message:', error.message);
    
    const errorMessage = error.message.includes('insufficient_quota') 
      ? '🏛️ VAULT SYSTEMS MAINTENANCE\n\nOpenAI quota exceeded. Your auto-learning strategic advisor will return shortly.'
      : '🏛️ SYSTEM OPTIMIZATION\n\nTemporary enhancement in progress. Your strategic advisor will return momentarily.';
      
    await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
  }
};

// Handle all messages
bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) return;
  await handleMessage(bot, msg);
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('🚨 Polling error:', error.message);
});

// Health check server
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    bot: 'Auto-Learning Vault Claude',
    commander: 'Reformed Fund Architect Intelligence',
    version: '3.0.0',
    learning_stats: {
      conversations: learningDatabase.size,
      strategies: (commanderKnowledge.get('successful_strategies') || []).length,
      market_insights: (commanderKnowledge.get('market_intelligence') || []).length
    },
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
});

console.log('🏛️ Auto-Learning Vault Claude fully operational');
console.log('⚡ Commander Sum Chenda Reformed Fund Architect strategic advisor ready');
console.log('🧠 Continuous learning algorithms active');
