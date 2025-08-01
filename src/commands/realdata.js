// REAL DATA COMMAND - Actually gather and display live Cambodia intelligence
const CambodiaIntelligenceGathering = require('../intelligence/CambodiaDataGathering');

const intelligence = new CambodiaIntelligenceGathering();

// Command: /realdata - Gather actual Cambodia market intelligence
const handleRealDataCommand = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  try {
    await bot.sendMessage(chatId, "🔍 GATHERING REAL CAMBODIA INTELLIGENCE...");
    await bot.sendChatAction(chatId, "typing");
    
    // Actually gather real data
    const results = await intelligence.gatherAllIntelligence();
    
    let responseMessage = `🏛️ REAL CAMBODIA MARKET INTELLIGENCE REPORT\n\n`;
    
    // Business Directory Results
    if (results.businesses.success) {
      responseMessage += `✅ BUSINESS DIRECTORY: Found ${results.businesses.count} companies\n`;
      responseMessage += `📊 Sample businesses:\n`;
      results.businesses.data.slice(0, 5).forEach((business, index) => {
        responseMessage += `${index + 1}. ${business.company} (${business.sector})\n`;
      });
    } else {
      responseMessage += `❌ Business Directory: ${results.businesses.error}\n`;
    }
    
    responseMessage += `\n`;
    
    // Economic Data Results
    if (results.economic.success) {
      responseMessage += `✅ ECONOMIC DATA: Real indicators retrieved\n`;
      if (results.economic.data.gdp.length > 0) {
        const latestGDP = results.economic.data.gdp[0];
        responseMessage += `📈 Latest GDP: $${(latestGDP.value / 1e9).toFixed(1)}B (${latestGDP.date})\n`;
      }
    } else {
      responseMessage += `❌ Economic Data: ${results.economic.error}\n`;
    }
    
    responseMessage += `\n`;
    
    // Government Projects Results
    if (results.projects.success) {
      responseMessage += `✅ GOVERNMENT PROJECTS: Found ${results.projects.count} active projects\n`;
    } else {
      responseMessage += `❌ Government Projects: ${results.projects.error}\n`;
    }
    
    responseMessage += `\n`;
    
    // Forex Results
    if (results.forex.success) {
      responseMessage += `✅ FOREX RATES: USD/KHR = ${results.forex.data.usd_khr}\n`;
    } else {
      responseMessage += `❌ Forex Rates: ${results.forex.error}\n`;
    }
    
    responseMessage += `\n📅 Report Generated: ${new Date().toLocaleString()}\n`;
    responseMessage += `\n🔄 Use /realdata again to refresh with latest information`;
    
    await bot.sendMessage(chatId, responseMessage, {
      disable_web_page_preview: true
    });
    
  } catch (error) {
    console.error('❌ Real data command error:', error.message);
    await bot.sendMessage(chatId, 
      `❌ INTELLIGENCE GATHERING ERROR\n\n` +
      `Error: ${error.message}\n\n` +
      `This happens when:\n` +
      `• Websites block automated access\n` +
      `• APIs require authentication\n` +
      `• Internet connectivity issues\n\n` +
      `🔧 Solutions:\n` +
      `• Use VPN for blocked websites\n` +
      `• Get API keys for premium data\n` +
      `• Try manual research for sensitive data`
    );
  }
};

module.exports = { handleRealDataCommand };