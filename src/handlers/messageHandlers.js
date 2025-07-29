// src/handlers/messageHandlers.js
const { getAIResponse } = require('../services/openaiService');

// Store conversation context (in production, use database)
const conversations = new Map();

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

    // Keep only last 10 messages for context
    if (conversation.length > 10) {
      conversation = conversation.slice(-10);
    }

    // Get AI response
    const aiResponse = await getAIResponse(conversation);

    // Add AI response to conversation
    conversation.push({
      role: 'assistant',
      content: aiResponse
    });

    // Store updated conversation
    conversations.set(userId, conversation);

    // Send response
    await bot.sendMessage(chatId, aiResponse, { 
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
};

module.exports = {
  handleMessage
};
