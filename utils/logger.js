// Add this at the top of your index.js (after other requires)
const logger = require("./utils/logger");

// Replace your existing console.log statements with logger calls:

// ✅ In your environment check section, replace:
// console.log('🔧 Environment check:');
logger.info('🔧 Environment check - System starting');

// ✅ In your bot message handler, replace console.log with:
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Replace: console.log(`📨 Message received from ${chatId}:`, msg.chat?.type || 'private');
    logger.info(`📨 Message received from ${chatId} (${msg.chat?.first_name || 'Unknown'}) - Type: ${msg.chat?.type || 'private'}`);
    
    // ✅ For unauthorized access, replace console.log with:
    if (!isAuthorizedUser(chatId)) {
        logger.warn(`🚫 Unauthorized access attempt from ${chatId} (Name: ${msg.chat?.first_name || 'Unknown'} ${msg.chat?.last_name || ''}, Username: ${msg.chat?.username || 'None'})`);
        await bot.sendMessage(chatId, `🚫 Access denied. This is a private GPT system.\n\nYour Chat ID: ${chatId}\nAuthorized ID: 484389665\n\nIf this is your personal account, contact system admin.`);
        return;
    }
    
    // ✅ For successful commands:
    if (text === '/start') {
        // ... your welcome message code ...
        logger.success(`✅ Welcome message sent to authorized user ${chatId}`);
        return;
    }
    
    // ✅ For memory operations:
    if (text === '/memory_test') {
        // ... your memory test code ...
        logger.info(`🧠 Memory test requested by user ${chatId}`);
        // ... rest of code ...
        return;
    }
});

// ✅ In your handleGPTConversation function, replace console.log with:
async function handleGPTConversation(chatId, userMessage) {
    logger.info(`🤖 GPT conversation started - User: ${chatId}, Message: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}"`);
    
    try {
        // ... your existing code ...
        
        // Replace: console.log(`🧠 Adding ${conversationHistory.length} previous conversations to context`);
        logger.info(`🧠 Adding ${conversationHistory.length} previous conversations to context for user ${chatId}`);
        
        // Replace: console.log(`📝 Sending ${messages.length} messages to gpt-5 (including ${conversationHistory.length} previous conversations)`);
        logger.info(`📝 Sending ${messages.length} messages to gpt-5 (including ${conversationHistory.length} previous conversations) for user ${chatId}`);
        
        const completion = await openai.chat.completions.create({
            // ... your existing API call ...
        });

        const gptResponse = completion.choices[0].message.content;
        
        // Save conversation to memory and extract important facts
        await saveConversation(chatId, userMessage, gptResponse, 'text');
        await extractAndSaveFacts(chatId, userMessage, gptResponse);
        
        // Replace: console.log(`✅ GPT response sent to ${chatId}. Tokens used: ${completion.usage?.total_tokens || 'unknown'}`);
        logger.success(`✅ GPT response sent to user ${chatId}. Tokens used: ${completion.usage?.total_tokens || 'unknown'}, Response length: ${gptResponse.length} chars`);
        
        await bot.sendMessage(chatId, gptResponse);

    } catch (error) {
        // Replace: console.error("OpenAI Error:", error.message);
        logger.error(`❌ OpenAI API Error for user ${chatId}: ${error.message}`);
        
        await bot.sendMessage(chatId, "GPT API connection issue. Please try again.");
        
        // Replace: console.log('❌ Error sent to:', chatId);
        logger.warn(`❌ Error message sent to user ${chatId}`);
    }
}

// ✅ In your server startup, replace console.log with:
app.listen(PORT, '0.0.0.0', () => {
    logger.success("✅ gpt-5 (Omni) API Service running on port " + PORT);
    logger.info("🧠 128K context | 4096 max tokens | Full multimodal capabilities");
    logger.info("🎤 Voice: Whisper transcription | 🖼️ Images: gpt-5 Vision");
    logger.info("📄 Documents: PDF, DOCX, TXT | 🎥 Videos: Content analysis");
    logger.info("📊 Live data: Crypto prices, Forex rates, Market times");
    logger.info("🔗 Direct API: http://localhost:" + PORT + "/analyze?q=your-question");
    logger.info("📱 Telegram interface: http://localhost:" + PORT + "/webhook");
    
    // Set webhook for Railway deployment
    const webhookUrl = `https://imperiumvaultsystem-production.up.railway.app/webhook`;
    bot.setWebHook(webhookUrl).then(() => {
        logger.success("🔗 Webhook configured: " + webhookUrl);
    }).catch(err => {
        logger.error("❌ Webhook setup failed: " + err.message);
    });
});

// ✅ Add logging to your memory.js file too:
// At the top of memory.js, add:
// const logger = require("./logger");

// Then replace console.log statements with:
// logger.info(`🧠 Building hybrid memory for user ${chatId}: ${recentHistory.length} recent + ${persistentMemory.length} persistent memories`);
// logger.info(`📝 Hybrid memory context built: ${context.length} characters`);
// logger.success(`💾 Persistent memory added for ${chatId}: ${fact}`);
// logger.warn('🗑️ All conversation data cleared');

// ✅ Add API endpoint to view logs:
app.get('/logs', (req, res) => {
    const type = req.query.type || 'info';
    const date = req.query.date || new Date().toISOString().split("T")[0];
    
    try {
        const logFile = path.join(__dirname, 'logs', `${type}-${date}.log`);
        if (fs.existsSync(logFile)) {
            const logs = fs.readFileSync(logFile, 'utf-8');
            res.json({
                service: 'gpt-5 System Logs',
                type: type,
                date: date,
                logs: logs.split('\n').slice(-50), // Last 50 lines
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                service: 'gpt-5 System Logs', 
                message: `No ${type} logs found for ${date}`,
                available_types: ['info', 'success', 'warn', 'error', 'debug'],
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        logger.error(`Error reading logs: ${error.message}`);
        res.status(500).json({ error: 'Could not read logs' });
    }
});

// ✅ Add log management command:
if (text === '/logs') {
    const today = new Date().toISOString().split("T")[0];
    const logTypes = ['info', 'success', 'warn', 'error'];
    
    let msg = `📊 **System Logs for ${today}:**\n\n`;
    
    logTypes.forEach(type => {
        const logFile = path.join(__dirname, 'logs', `${type}-${today}.log`);
        if (fs.existsSync(logFile)) {
            const logContent = fs.readFileSync(logFile, 'utf-8');
            const lineCount = logContent.split('\n').length - 1;
            msg += `${type.toUpperCase()}: ${lineCount} entries\n`;
        } else {
            msg += `${type.toUpperCase()}: No logs\n`;
        }
    });
    
    msg += `\n🌐 **View full logs:**\n`;
    msg += `https://imperiumvaultsystem-production.up.railway.app/logs?type=info\n`;
    msg += `https://imperiumvaultsystem-production.up.railway.app/logs?type=error`;
    
    await bot.sendMessage(chatId, msg);
    logger.info(`📊 Log summary requested by user ${chatId}`);
    return;
}
