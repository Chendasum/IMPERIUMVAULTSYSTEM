// Put these near the top of dualcommandsystem.js
const { setupTelegramHandler } = require('./utils/telegramSplitter');

let __tgHandler = null;
function getTelegramHandler(bot) {
  // (Re)create if missing or if bot instance changed
  if (!__tgHandler) __tgHandler = setupTelegramHandler(bot);
  return __tgHandler;
}

function sget(obj, path, defVal) { // safe getter (no optional chaining)
  try {
    var parts = String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return defVal;
      cur = cur[parts[i]];
    }
    return (cur == null) ? defVal : cur;
  } catch (e) { return defVal; }
}

function resolveModelName(modelUsed) {
  var M = (typeof CONFIG !== 'undefined' && CONFIG.MODELS) ? CONFIG.MODELS : {};
  if (modelUsed === M.NANO) return 'gpt-5-nano';
  if (modelUsed === M.MINI) return 'gpt-5-mini';
  if (modelUsed === M.FULL) return 'gpt-5';
  if (modelUsed === M.CHAT) return 'gpt-5-chat-latest';
  return modelUsed || 'gpt-5';
}

// === REPLACE your createTelegramSender with this ===
function createTelegramSender(chatId, response, queryAnalysis, gpt5Result, responseTime, contextUsed) {
  return async function (bot, title) {
    try {
      if (!bot || !chatId) {
        console.warn('Delivery skipped: bot or chatId missing (chatId=' + chatId + ')');
        return false;
      }

      var handler = getTelegramHandler(bot);

      // Determine model + title
      var configuredModel = sget(gpt5Result, 'modelUsed', null) || sget(queryAnalysis, 'gpt5Model', null);
      var modelName = resolveModelName(configuredModel);

      var completionDetected = !!sget(gpt5Result, 'completionDetected', false);
      var defaultTitle = completionDetected ? 'Task Completion Acknowledged' :
        ('GPT-5 ' +
          (configuredModel === (CONFIG && CONFIG.MODELS && CONFIG.MODELS.NANO) ? 'Nano' :
          configuredModel === (CONFIG && CONFIG.MODELS && CONFIG.MODELS.MINI) ? 'Mini' :
          configuredModel === (CONFIG && CONFIG.MODELS && CONFIG.MODELS.FULL) ? 'Full' :
          configuredModel === (CONFIG && CONFIG.MODELS && CONFIG.MODELS.CHAT) ? 'Chat' : 'Analysis'));

      var finalTitle = title || defaultTitle;

      // Build metadata for the splitter header
      var metadata = {
        title: finalTitle,
        ms: responseTime,
        contextUsed: contextUsed,
        complexity: sget(queryAnalysis, 'complexity.complexity', 'medium'),
        confidence: sget(gpt5Result, 'confidence', sget(queryAnalysis, 'confidence', 0.75)),
        model: modelName,
        reasoning: sget(queryAnalysis, 'reasoning_effort', null),
        verbosity: sget(queryAnalysis, 'verbosity', null),
        costTier: (typeof getCostTier === 'function') ? getCostTier(configuredModel || modelName) : 'standard',
        fallbackUsed: !!sget(gpt5Result, 'fallbackUsed', false),
        completionDetected: completionDetected
      };

      // Use the splitter’s GPT response sender (handles formatting, splitting, retries)
      var res = await handler.sendGPTResponse(String(response), metadata, chatId);
      // .sendGPTResponse returns structured info; consider truthy success
      return !!(res && res.success);
    } catch (telegramError) {
      console.error('Telegram delivery error:', telegramError && telegramError.message ? telegramError.message : telegramError);
      // Last-resort fallback
      try {
        if (bot && bot.sendMessage && chatId) {
          await bot.sendMessage(chatId, String(response));
          return true;
        }
      } catch (fallbackError) {
        console.error('Telegram fallback also failed:', fallbackError && fallbackError.message ? fallbackError.message : fallbackError);
      }
      return false;
    }
  };
}

// === REPLACE your createErrorTelegramSender with this ===
function createErrorTelegramSender(chatId, errorResponse, originalError) {
  return async function (bot) {
    try {
      if (!bot || !chatId) {
        console.warn('Error delivery skipped: bot or chatId missing (chatId=' + chatId + ')');
        return false;
      }
      var handler = getTelegramHandler(bot);
      // Use the splitter's error helper (formats nicely and splits safely)
      var res = await handler.sendError(originalError || new Error(String(errorResponse)), 'System Error', chatId);
      return !!(res && res.success);
    } catch (telegramError) {
      console.error('Error telegram delivery failed:', telegramError && telegramError.message ? telegramError.message : telegramError);
      return false;
    }
  };
}
