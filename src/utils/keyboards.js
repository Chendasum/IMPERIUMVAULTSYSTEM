// src/utils/keyboards.js

const getMainKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🏛️ Codex Law', callback_data: 'codex' },
        { text: '💰 Capital Protection', callback_data: 'capital' }
      ],
      [
        { text: '🎯 Legacy Planning', callback_data: 'legacy' },
        { text: '🛡️ Vault Security', callback_data: 'vault' }
      ],
      [
        { text: '📚 Help Menu', callback_data: 'help' },
        { text: '🧠 AI Chat Mode', callback_data: 'ai_mode' }
      ]
    ]
  }
});

const getLanguageKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🇺🇸 English', callback_data: 'lang_en' },
        { text: '🇰🇭 ខ្មែរ', callback_data: 'lang_km' }
      ],
      [
        { text: '🔙 Back to Menu', callback_data: 'main_menu' }
      ]
    ]
  }
});

const getAIModeKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🏛️ Constitutional Advisor', callback_data: 'ai_constitutional' },
        { text: '💰 Wealth Strategist', callback_data: 'ai_wealth' }
      ],
      [
        { text: '🎯 Legacy Planner', callback_data: 'ai_legacy' },
        { text: '🛡️ Security Expert', callback_data: 'ai_security' }
      ],
      [
        { text: '🧠 General Sovereign AI', callback_data: 'ai_general' }
      ],
      [
        { text: '🔙 Back to Menu', callback_data: 'main_menu' }
      ]
    ]
  }
});

module.exports = {
  getMainKeyboard,
  getLanguageKeyboard,
  getAIModeKeyboard
};
