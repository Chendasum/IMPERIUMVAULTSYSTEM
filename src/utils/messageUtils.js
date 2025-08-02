// Message Utilities for Telegram Bot
// Handles message splitting for Telegram's 4096 character limit

async function sendLongMessage(bot, chatId, message, options = {}) {
  try {
    const maxLength = 4096;
    
    if (message.length <= maxLength) {
      return await bot.sendMessage(chatId, message, options);
    }
    
    // Split message into chunks
    const chunks = splitMessage(message, maxLength);
    
    // Send each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Add part indicator for multi-part messages
      let finalChunk = chunk;
      if (chunks.length > 1) {
        finalChunk = `📄 Part ${i + 1}/${chunks.length}\n\n${chunk}`;
      }
      
      await bot.sendMessage(chatId, finalChunk, options);
      
      // Small delay between messages to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return { success: true, parts: chunks.length };
    
  } catch (error) {
    console.error('Error in sendLongMessage:', error);
    throw error;
  }
}

function splitMessage(message, maxLength) {
  if (message.length <= maxLength) {
    return [message];
  }
  
  const chunks = [];
  let currentChunk = '';
  const lines = message.split('\n');
  
  for (const line of lines) {
    // If adding this line would exceed the limit
    if (currentChunk.length + line.length + 1 > maxLength) {
      // If we have content in current chunk, save it
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // If single line is too long, split it by words
      if (line.length > maxLength) {
        const words = line.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          if (wordChunk.length + word.length + 1 > maxLength) {
            if (wordChunk.trim()) {
              chunks.push(wordChunk.trim());
            }
            wordChunk = word;
          } else {
            wordChunk += (wordChunk ? ' ' : '') + word;
          }
        }
        
        if (wordChunk.trim()) {
          currentChunk = wordChunk;
        }
      } else {
        currentChunk = line;
      }
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }
  
  // Add remaining content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

module.exports = {
  sendLongMessage,
  splitMessage
};