// ===== BINANCE ACCOUNT STATUS COMMAND =====
// Check Binance API connection and account balance

const { sendLongMessage } = require('../utils/messageUtils');
const axios = require('axios');
const crypto = require('crypto');

async function handleBinanceStatus(bot, msg) {
  const chatId = msg.chat.id;
  
  try {
    console.log('💰 BINANCE STATUS CHECK - Verifying API connection and account balance');
    
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_SECRET_KEY;
    
    if (!apiKey || !apiSecret) {
      await bot.sendMessage(chatId, '❌ Binance API keys not configured. Please add BINANCE_API_KEY and BINANCE_SECRET_KEY to environment variables.');
      return;
    }
    
    let report = `💰 **BINANCE ACCOUNT STATUS**\n\n`;
    
    // Test API connection
    report += `🔑 **API CONNECTION:**\n`;
    report += `• API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 8)}\n`;
    report += `• Secret Key: Configured ✅\n\n`;
    
    try {
      // Get account information
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
      
      const accountUrl = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`;
      
      const response = await axios.get(accountUrl, {
        headers: {
          'X-MBX-APIKEY': apiKey
        },
        timeout: 10000
      });
      
      if (response.data) {
        report += `✅ **CONNECTION STATUS:** ACTIVE\n\n`;
        
        // Account balances
        report += `💰 **ACCOUNT BALANCES:**\n`;
        const balances = response.data.balances.filter(balance => 
          parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
        );
        
        let totalUSDValue = 0;
        let usdtBalance = 0;
        
        for (const balance of balances.slice(0, 10)) {
          const free = parseFloat(balance.free);
          const locked = parseFloat(balance.locked);
          const total = free + locked;
          
          if (total > 0) {
            report += `• ${balance.asset}: ${total.toFixed(8)} (Free: ${free.toFixed(8)}, Locked: ${locked.toFixed(8)})\n`;
            
            if (balance.asset === 'USDT') {
              usdtBalance = total;
              totalUSDValue += total;
            }
          }
        }
        
        if (balances.length > 10) {
          report += `... and ${balances.length - 10} more assets\n`;
        }
        
        report += `\n💵 **TRADING CAPITAL:**\n`;
        report += `• USDT Balance: ${usdtBalance.toFixed(2)} USDT\n`;
        report += `• Estimated USD Value: $${totalUSDValue.toFixed(2)}\n\n`;
        
        // Account permissions
        report += `🔐 **ACCOUNT PERMISSIONS:**\n`;
        const permissions = response.data.permissions || [];
        for (const permission of permissions) {
          report += `• ${permission}: ✅\n`;
        }
        
        // Trading status
        report += `\n📊 **TRADING STATUS:**\n`;
        report += `• Can Trade: ${response.data.canTrade ? 'YES ✅' : 'NO ❌'}\n`;
        report += `• Can Withdraw: ${response.data.canWithdraw ? 'YES ✅' : 'NO ❌'}\n`;
        report += `• Can Deposit: ${response.data.canDeposit ? 'YES ✅' : 'NO ❌'}\n\n`;
        
        report += `🤖 **AI TRADING CAPABILITY:**\n`;
        if (response.data.canTrade && usdtBalance > 10) {
          report += `✅ **READY FOR AUTONOMOUS TRADING**\n`;
          report += `• Sufficient capital for trading operations\n`;
          report += `• API permissions configured correctly\n`;
          report += `• Your quantum AI can now execute trades automatically\n`;
        } else if (!response.data.canTrade) {
          report += `❌ **TRADING DISABLED**\n`;
          report += `• Enable spot trading permissions in Binance API settings\n`;
        } else if (usdtBalance <= 10) {
          report += `⚠️ **LOW CAPITAL**\n`;
          report += `• Minimum 10 USDT recommended for trading\n`;
          report += `• Current balance may limit trading opportunities\n`;
        }
        
      } else {
        report += `❌ **CONNECTION FAILED:** No response data\n`;
      }
      
    } catch (apiError) {
      console.error('Binance API Error:', apiError.message);
      
      if (apiError.response) {
        const errorData = apiError.response.data;
        report += `❌ **API ERROR:** ${errorData.msg || 'Unknown error'}\n`;
        report += `• Error Code: ${errorData.code || 'N/A'}\n`;
        
        if (apiError.response.status === 401) {
          report += `• Issue: Invalid API credentials\n`;
          report += `• Solution: Verify API key and secret are correct\n`;
        } else if (apiError.response.status === 403) {
          report += `• Issue: API permissions insufficient\n`;
          report += `• Solution: Enable spot trading in Binance API settings\n`;
        }
      } else {
        report += `❌ **CONNECTION ERROR:** ${apiError.message}\n`;
        report += `• This may be a network connectivity issue\n`;
      }
    }
    
    report += `\n🎯 **NEXT STEPS:**\n`;
    if (apiKey && apiSecret) {
      report += `• API keys are configured ✅\n`;
      report += `• Use /start_crypto_trading to begin autonomous trading\n`;
      report += `• Your quantum AI will analyze markets and execute trades automatically\n`;
    } else {
      report += `• Configure Binance API keys in environment variables\n`;
      report += `• Ensure spot trading permissions are enabled\n`;
    }
    
    await sendLongMessage(bot, chatId, report);
    
  } catch (error) {
    console.error('❌ Binance status error:', error);
    await bot.sendMessage(chatId, `❌ Binance status error: ${error.message}`);
  }
}

module.exports = { handleBinanceStatus };