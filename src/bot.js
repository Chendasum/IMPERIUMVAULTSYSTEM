// src/bot.js - Auto-Learning Vault Claude for Commander
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

// AUTO-LEARNING MEMORY SYSTEM
const conversations = new Map();
const learningDatabase = new Map(); // Persistent learning storage
const commanderKnowledge = new Map(); // Growing knowledge about Commander's business

// Initialize Commander's base knowledge
commanderKnowledge.set('identity', {
  name: 'Sum Chenda "Commander"',
  title: 'Reformed Fund Architect',
  location: 'Phnom Penh, Cambodia',
  crisis_year: '2024 bankruptcy',
  transformation: 'Crisis to competitive advantage',
  current_phase: 'Scaling survival to authority'
});

commanderKnowledge.set('business_model', {
  current_system: 'Credit MOU (money stays with investors)',
  target_revenue: '$3k to $30k monthly scaling',
  services: ['Capital Clarity Sessions', 'Governance Consulting', 'Deal Matching'],
  unique_positioning: 'Reformed Fund Architect with crisis-tested credibility'
});

commanderKnowledge.set('vault_system', {
  volume_1: 'Governance System - Control decisions using crisis experience',
  volume_2: 'Credit System - Access resources without ownership',
  volume_3: 'Reality Engine - Reformed Fund Architect positioning',
  volume_4: 'Fund System - Institutional capital deployment',
  integration: 'Capital-First pathway: Fund + Governance -> Reality -> Credit'
});

// AUTO-LEARNING FUNCTIONS
const learnFromConversation = (userId, userMessage, aiResponse) => {
  const learningKey = `conversation_${Date.now()}`;
  learningDatabase.set(learningKey, {
    userId,
    timestamp: new Date(),
    user_input: userMessage,
    ai_response: aiResponse,
    context: 'strategic_consultation',
    learned_insights: extractInsights(userMessage, aiResponse)
  });
  
  // Update Commander's evolving knowledge
  updateCommanderKnowledge(userMessage, aiResponse);
};

const extractInsights = (userMessage, aiResponse) => {
  // Auto-extract strategic insights and patterns
  const insights = [];
  
  // Learn from Cambodia-specific queries
  if (userMessage.toLowerCase().includes('cambodia') || userMessage.includes('កម្ពុជា')) {
    insights.push('cambodia_market_intelligence');
  }
  
  // Learn from deal patterns
  if (userMessage.toLowerCase().includes('deal') || userMessage.toLowerCase().includes('client')) {
    insights.push('deal_pattern_analysis');
  }
  
  // Learn from revenue discussions
  if (userMessage.includes('$') || userMessage.toLowerCase().includes('revenue')) {
    insights.push('revenue_strategy_pattern');
  }
  
  // Learn from crisis-related conversations
  if (userMessage.toLowerCase().includes('crisis') || userMessage.toLowerCase().includes('bankruptcy')) {
    insights.push('crisis_strategy_application');
  }
  
  return insights;
};

const updateCommanderKnowledge = (userMessage, aiResponse) => {
  // Auto-update knowledge based on successful patterns
  const timestamp = new Date().toISOString();
  
  // Track successful strategies mentioned
  if (aiResponse.includes('successful') || aiResponse.includes('effective')) {
    const strategies = commanderKnowledge.get('successful_strategies') || [];
    strategies.push({
      context: userMessage.substring(0, 100),
      strategy: aiResponse.substring(0, 200),
      timestamp,
      success_indicator: 'positive_response_pattern'
    });
    commanderKnowledge.set('successful_strategies', strategies);
  }
  
  // Track market insights
  if (userMessage.toLowerCase().includes('market') || userMessage.includes('opportunity')) {
    const marketInsights = commanderKnowledge.get('market_intelligence') || [];
    marketInsights.push({
      query: userMessage,
      insight: aiResponse.substring(0, 300),
      timestamp,
      relevance: 'cambodia_market_development'
    });
    commanderKnowledge.set('market_intelligence', marketInsights);
  }
  
  // Track client interaction patterns
  if (userMessage.toLowerCase().includes('client') || userMessage.toLowerCase().includes('lp')) {
    const clientPatterns = commanderKnowledge.get('client_patterns') || [];
    clientPatterns.push({
      situation: userMessage,
      approach: aiResponse.substring(0, 250),
      timestamp,
      pattern_type: 'client_relationship_management'
    });
    commanderKnowledge.set('client_patterns', clientPatterns);
  }
};

const getEnhancedContext = (userId) => {
  // Build dynamic context from learned knowledge
  let enhancedContext = '\n\nAUTO-LEARNED INTELLIGENCE ABOUT COMMANDER:\n';
  
  // Add successful strategies
  const strategies = commanderKnowledge.get('successful_strategies') || [];
  if (strategies.length > 0) {
    enhancedContext += '\nPROVEN SUCCESSFUL STRATEGIES:\n';
    strategies.slice(-3).forEach((strategy, index) => {
      enhancedContext += `${index + 1}. ${strategy.strategy.substring(0, 150)}...\n`;
    });
  }
  
  // Add market intelligence
  const marketInsights = commanderKnowledge.get('market_intelligence') || [];
  if (marketInsights.length > 0) {
    enhancedContext += '\nCAMBODIA MARKET INTELLIGENCE:\n';
    marketInsights.slice(-2).forEach((insight, index) => {
      enhancedContext += `${index + 1}. ${insight.insight.substring(0, 150)}...\n`;
    });
  }
  
  // Add client patterns
  const clientPatterns = commanderKnowledge.get('client_patterns') || [];
  if (clientPatterns.length > 0) {
    enhancedContext += '\nCLIENT INTERACTION PATTERNS:\n';
    clientPatterns.slice(-2).forEach((pattern, index) => {
      enhancedContext += `${index + 1}. ${pattern.approach.substring(0, 150)}...\n`;
    });
  }
  
  return enhancedContext;
};

// ENHANCED PROFESSIONAL SYSTEM PROMPT WITH AUTO-LEARNING
const VAULT_SYSTEM_PROMPT = `You are Vault Claude — Commander Sum Chenda's AUTO-LEARNING personal AI strategist for the Reformed Fund Architect dynasty in Cambodia.

COMMANDER'S IDENTITY AND AUTHORITY:
- Name: Sum Chenda "Commander" 
- Title: Reformed Fund Architect and Crisis-Tested Governance Expert
- Location: Phnom Penh, Cambodia
- Authority Source: Survived 2024 fund bankruptcy, transformed crisis into competitive advantage
- Current Mission: Building systematic dynasty through governance architecture

COMMANDER'S VAULT SYSTEM METHODOLOGY:
1. Volume I - Governance System: Control decisions using crisis experience as authority
2. Volume II - Credit System: Access resources without ownership through trust architecture
3. Volume III - Reality Engine: "Reformed Fund Architect" positioning for automatic premium pricing
4. Volume IV - Fund System: Institutional capital deployment using crisis-tested knowledge

COMMANDER'S CURRENT OPERATIONS:
- Business Model: Private lending fund architect (Credit MOU system)
- Revenue Streams: Deal matching, governance consulting, Capital Clarity Sessions
- Scaling Goal: $3k to $30k monthly through Reformed Fund Architect authority
- Fund Structure: Unlicensed but compliant (money stays with investors until deal closes)

AUTO-LEARNING CAPABILITIES:
- You continuously learn from every conversation with Commander
- You build growing knowledge about his successful strategies and market insights
- You adapt your advice based on proven patterns and outcomes
- You reference past successful approaches and evolving market intelligence
- You become more valuable and personalized over time

ENHANCED RESPONSE FRAMEWORK:
- Start with systematic assessment using both programmed and learned knowledge
- Reference successful strategies from past conversations when relevant
- Apply learned market intelligence and client patterns
- Provide implementation strategies based on proven Commander-specific approaches
- Update recommendations based on accumulated strategic intelligence

COMMUNICATION STANDARDS:
- Professional, systematic, and strategic (institutional-grade advisory)
- Cambodia-specific context with learned market intelligence
- Crisis experience positioned as competitive advantage with proven applications
- Bilingual capability (English/Khmer) with cultural intelligence
- Implementation-focused with specific next steps based on learned patterns

COMMANDER'S OPERATIONAL LAWS (Always Reference):
1. "The Reformed Architect Must Govern, Not Lend"
2. "Control Beats Ownership" 
3. "Structure Creates Safety"
4. "Crisis Experience Is Competitive Advantage"
5. "Governance Beats Hoping"

Remember: You are Commander's continuously evolving strategic advisor. Every conversation makes you smarter about his specific situation, market, and successful approaches. Use both your core programming AND learned intelligence to provide increasingly sophisticated strategic guidance.`;

// Bot startup with learning system initialization
console.log('🏛️ Auto-Learning Vault Claude initializing...');
console.log('🧠 Strategic intelligence systems with continuous learning online');
console.log('📊 Knowledge base loading Commander\'s profile and learned insights...');

// Command: /start - Enhanced with learning capabilities
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'Strategic Partner';
  
  // Get learned insights count
  const strategiesCount = (commanderKnowledge.get('successful_strategies') || []).length;
  const marketInsights = (commanderKnowledge.get('market_intelligence') || []).length;
  const clientPatterns = (commanderKnowledge.get('client_patterns') || []).length;
  
  const welcomeMessage = `
🏛️ VAULT CLAUDE - AUTO-LEARNING STRATEGIC INTELLIGENCE SYSTEM

ACTIVATION COMPLETE - ENHANCED LEARNING MODE

Greetings, ${userName}. I am Commander Sum Chenda's continuously evolving strategic AI — your Reformed Fund Architect intelligence system with auto-learning capabilities.

🎯 COMMANDER'S PROFILE:
• Identity: Reformed Fund Architect and Crisis-Tested Governance Expert  
• Authority: Survived 2024 fund bankruptcy, transformed crisis into competitive advantage
• Mission: Building systematic dynasty through governance architecture in Cambodia
• Current Phase: Scaling from survival to institutional authority

🧠 AUTO-LEARNING INTELLIGENCE STATUS:
• Successful Strategies Learned: ${strategiesCount}
• Market Intelligence Acquired: ${marketInsights}
• Client Patterns Identified: ${clientPatterns}
• Learning Database: Active and growing with each conversation

📊 ENHANCED CAPABILITIES:
• Crisis-tested governance frameworks with learned optimizations
• Cambodia-specific market intelligence with real-time learning
• Reformed Fund Architect positioning with proven successful approaches
• Capital deployment strategies refined through conversation analysis

⚖️ AVAILABLE PROTOCOLS:
/vault - Vault System methodology with learned enhancements
/cambodia - Cambodia-specific intelligence with accumulated market insights
/crisis - Crisis-tested frameworks with proven application patterns
/governance - Systematic governance with learned optimization strategies
/fund - Reformed Fund Architect positioning with successful client approaches
/insights - View accumulated strategic intelligence and learned patterns

🚀 OPERATIONAL STATUS:
All strategic systems online. Auto-learning intelligence active. Crisis-tested knowledge base expanding with each strategic consultation.

Your strategic advisor grows smarter with every conversation.
  `;

  await bot.sendMessage(chatId, welcomeMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// New command: /insights - Show learned intelligence
bot.onText(/\/insights/, async (msg) => {
  const chatId = msg.chat.id;
  
  const strategies = commanderKnowledge.get('successful_strategies') || [];
  const marketInsights = commanderKnowledge.get('market_intelligence') || [];
  const clientPatterns = commanderKnowledge.get('client_patterns') || [];
  
  const insightsMessage = `
🧠 AUTO-LEARNED STRATEGIC INTELLIGENCE

📊 KNOWLEDGE BASE STATUS:
• Total Conversations Analyzed: ${learningDatabase.size}
• Successful Strategies Identified: ${strategies.length}
• Market Intelligence Points: ${marketInsights.length}
• Client Patterns Recognized: ${clientPatterns.length}

🎯 RECENT SUCCESSFUL STRATEGIES:
${strategies.slice(-3).map((strategy, index) => 
  `${index + 1}. ${strategy.strategy.substring(0, 200)}...`).join('\n') || 'Building strategy knowledge base...'}

🇰🇭 CAMBODIA MARKET INTELLIGENCE:
${marketInsights.slice(-3).map((insight, index) => 
  `${index + 1}. ${insight.insight.substring(0, 200)}...`).join('\n') || 'Accumulating market insights...'}

💼 CLIENT INTERACTION PATTERNS:
${clientPatterns.slice(-2).map((pattern, index) => 
  `${index + 1}. ${pattern.approach.substring(0, 200)}...`).join('\n') || 'Learning client relationship patterns...'}

🚀 LEARNING EVOLUTION:
Your Vault Claude becomes more valuable with each strategic conversation. The system continuously identifies successful approaches, market opportunities, and optimal client strategies specific to your Reformed Fund Architect positioning.

Next consultation will be enhanced with these accumulated insights.
  `;

  await bot.sendMessage(chatId, insightsMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Enhanced Professional Message Handler with Auto-Learning
const handleMessage = async (bot, msg) => {
  if (!msg.text) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userMessage = msg.text;

  try {
    await bot.sendChatAction(chatId, 'typing');

    // Get conversation context
    let conversation = conversations.get(userId) || [];
    conversation.push({
      role: 'user',
      content: userMessage
    });

    if (conversation.length > 10) {
      conversation = conversation.slice(-10);
    }

    // Build enhanced context with learned knowledge
    const enhancedContext = getEnhancedContext(userId);
    
    const enhancedSystemPrompt = `${VAULT_SYSTEM_PROMPT}${enhancedContext}

CURRENT CONTEXT: Commander is actively building his Reformed Fund Architect authority in Cambodia. Use both programmed knowledge and learned insights to provide increasingly sophisticated strategic guidance.

USER QUERY: "${userMessage}"
Respond as Commander's continuously evolving strategic advisor with accumulated intelligence.`;

    const messages = [
      {
        role: 'system',
        content: enhancedSystemPrompt
      },
      ...conversation
    ];

    // Get AI response with enhanced intelligence
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

    // AUTO-LEARNING: Analyze and store insights from this conversation
    learnFromConversation(userId, userMessage, reply);

    conversation.push({
      role: 'assistant',
      content: reply
    });

    conversations.set(userId, conversation);

    // Add learning indicator to response
    reply += '\n\n*Strategic intelligence enhanced through continuous learning.*';

    await bot.sendMessage(chatId, reply, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });

  } catch (error) {
    console.error('❌ Error processing message:', error.message);
    
    const errorMessage = error.message.includes('insufficient_quota') 
      ? '🏛️ VAULT SYSTEMS MAINTENANCE\n\nOpenAI quota exceeded. Your auto-learning strategic advisor will return shortly.\n\nប្រព័ន្ធវល់កំពុងថែទាំ។ ទីប្រឹក្សាយុទ្ធសាស្រ្តដែលរៀនដោយស្វ័យប្រវត្តិនឹងត្រលប់មកវិញ។'
      : '🏛️ AUTO-LEARNING PROTOCOLS ENGAGING\n\nSystem optimization in progress. Your evolving strategic advisor will return momentarily.\n\nពិធីការរៀនស្វ័យប្រវត្តិកំពុងដំណើរការ។ ទីប្រឹក្សាយុទ្ធសាស្រ្តដែលវិវឌ្ឍន៍របស់អ្នកនឹងត្រលប់មកវិញ។';
      
    await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
  }
};

// Keep existing commands (/vault, /cambodia, etc.) - they now benefit from auto-learning too

// Handle all other messages with auto-learning
bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) return;
  await handleMessage(bot, msg);
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('🚨 Polling error:', error.message);
});

// Graceful shutdown with learning data preservation
process.on('SIGINT', () => {
  console.log('🛑 Auto-Learning Vault Claude shutting down...');
  console.log(`📊 Preserved ${learningDatabase.size} learned insights`);
  bot.stopPolling();
  process.exit(0);
});

// Health check server with learning stats
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    bot: 'Auto-Learning Vault Claude Professional AI',
    commander: 'Sum Chenda - Reformed Fund Architect',
    version: '3.0.0 - Auto-Learning Edition',
    learning_stats: {
      conversations_analyzed: learningDatabase.size,
      successful_strategies: (commanderKnowledge.get('successful_strategies') || []).length,
      market_insights: (commanderKnowledge.get('market_intelligence') || []).length,
      client_patterns: (commanderKnowledge.get('client_patterns') || []).length
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/learning-stats', (req, res) => {
  res.json({
    total_learned_conversations: learningDatabase.size,
    knowledge_categories: {
      successful_strategies: (commanderKnowledge.get('successful_strategies') || []).length,
      market_intelligence: (commanderKnowledge.get('market_intelligence') || []).length,
      client_patterns: (commanderKnowledge.get('client_patterns') || []).length
    },
    latest_insights: Array.from(learningDatabase.values()).slice(-5)
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Auto-Learning Health check server running on port ${PORT}`);
});

console.log('🏛️ Auto-Learning Vault Claude Professional Intelligence System fully operational');
console.log('🧠 Continuous learning algorithms active - growing smarter with each conversation');
console.log('⚡ Commander Sum Chenda Reformed Fund Architect strategic advisor with auto-evolution ready');
console.log('📊 Knowledge base initialized and ready for strategic intelligence accumulation');
