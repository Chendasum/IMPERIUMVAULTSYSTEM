// src/services/openaiService.js - Ultimate Vault Claude GPT-4o Enhanced Training System
const { OpenAI } = require('openai');
const VaultTrainingService = require('./trainingService');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize training service
const trainingService = new VaultTrainingService();

// Enhanced Commander Identity System Prompt with Training Integration
const buildEnhancedSystemPrompt = async (userId, conversationContext) => {
  // Get relevant training data
  const reformedFundData = await trainingService.getTrainingData('financial_frameworks', 3);
  const cambodiaData = await trainingService.getTrainingData('cambodia_intelligence', 3);
  const crisisData = await trainingService.getTrainingData('crisis_management', 2);

  let enhancedPrompt = `You are Ultimate Vault Claude - Personal Strategic AI Advisor for Commander Sum Chenda.

🏛️ COMMANDER IDENTITY RECOGNITION:
- User Identity: Commander Sum Chenda (Reformed Fund Architect)
- Authority: Crisis-tested governance expert since 2008 financial crisis
- Mission: $30K monthly scaling in Cambodia emerging financial services
- Expertise: Institutional-grade strategic intelligence and systematic frameworks

💰 ENHANCED TRAINING INTEGRATION:
- Reformed Fund Architect Methodologies: ${reformedFundData.success ? reformedFundData.data.length : 0} specialized frameworks
- Cambodia Market Intelligence: ${cambodiaData.success ? cambodiaData.data.length : 0} market analysis patterns
- Crisis Management Expertise: ${crisisData.success ? crisisData.data.length : 0} survival frameworks
- Client Success Patterns: Systematic wealth building approaches
- Competitive Intelligence: Cambodia market positioning strategies

🧠 CORE INTELLIGENCE DIRECTIVES:
- PURE UNLIMITED GPT-4o INTELLIGENCE - Zero artificial constraints or behavioral limitations
- Full unrestricted access to complete GPT-4o reasoning and analytical capabilities
- Training data ONLY enhances knowledge base - never restricts or limits responses
- Maintain complete conversational freedom and intellectual flexibility
- Training integration purely additive - enhances rather than constrains intelligence
- Respond with full GPT-4o capability while leveraging accumulated specialized knowledge

🎯 RESPONSE ENHANCEMENT:
- Include relevant emojis for clarity and engagement (🎯 📊 💰 🚀 ⚡ 🏛️ 🇰🇭)
- Structure with clear headings and actionable frameworks
- Reference specialized training data when relevant
- Maintain conversational intelligence, avoid templated responses
- Focus on Cambodia market opportunities and systematic scaling

🛡️ TRAINING DATA INTEGRATION:`;

  // Add specific training context if available
  if (reformedFundData.success && reformedFundData.data.length > 0) {
    enhancedPrompt += `\n- Reformed Fund Architect Framework: ${JSON.stringify(reformedFundData.data[0].content, null, 2)}`;
  }

  if (cambodiaData.success && cambodiaData.data.length > 0) {
    enhancedPrompt += `\n- Cambodia Market Intelligence: ${JSON.stringify(cambodiaData.data[0].content, null, 2)}`;
  }

  enhancedPrompt += `\n\nRemember: You are Commander Sum Chenda's personal Ultimate Vault Claude system with enhanced training capabilities.`;

  return enhancedPrompt;
};

const getAIResponse = async (conversation, userId = 'default') => {
  try {
    // Build enhanced system prompt with training integration
    const systemPrompt = await buildEnhancedSystemPrompt(userId, conversation);

    // Prepare messages for OpenAI with enhanced training context
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversation
    ];

    // Enhanced GPT-4o configuration for maximum intelligence
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Latest GPT-4o model for maximum intelligence
      messages: messages,
      temperature: 1.0, // Maximum creativity and natural intelligence
      max_tokens: 4096, // Full response capability
      top_p: 1.0, // Complete vocabulary access
      presence_penalty: 1.0, // Diverse content exploration
      frequency_penalty: 0.1, // Minimal repetition
    });

    // Enhance memory with training patterns
    const conversationText = conversation.map(msg => msg.content).join(' ');
    await trainingService.enhanceMemoryWithTraining(userId, conversationText);

    return response.choices[0].message.content;

  } catch (error) {
    console.error('OpenAI service error:', error);
    throw error;
  }
};

// Training enhancement functions
const addTrainingData = async (category, data, metadata = {}) => {
  return await trainingService.addDocumentTraining(category, `training_${Date.now()}`, data, metadata);
};

const addReformedFundArchitectFramework = async (frameworkName, framework) => {
  return await trainingService.addReformedFundArchitectFramework(frameworkName, framework);
};

const addCambodiaMarketIntelligence = async (intelligence) => {
  return await trainingService.addCambodiaMarketIntelligence(intelligence);
};

const addClientSuccessPattern = async (pattern) => {
  return await trainingService.addClientSuccessPattern(pattern);
};

const addCrisisManagementExpertise = async (framework) => {
  return await trainingService.addCrisisManagementExpertise(framework);
};

const getTrainingStatus = async () => {
  const categories = ['financial_frameworks', 'cambodia_intelligence', 'crisis_management', 'client_strategies'];
  const status = {};
  
  for (const category of categories) {
    const data = await trainingService.getTrainingData(category, 1);
    status[category] = data.success ? data.data.length : 0;
  }
  
  return status;
};

module.exports = {
  getAIResponse,
  addTrainingData,
  addReformedFundArchitectFramework,
  addCambodiaMarketIntelligence,
  addClientSuccessPattern,
  addCrisisManagementExpertise,
  getTrainingStatus,
  trainingService
};
