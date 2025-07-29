
class Conversation {
  constructor(chatId, userId) {
    this.chatId = chatId;
    this.userId = userId;
    this.messages = [];
    this.specialization = null;
    this.createdAt = new Date();
    this.lastActivity = new Date();
    this.messageCount = 0;
  }

  addMessage(role, content) {
    const message = {
      role,
      content,
      timestamp: new Date()
    };

    this.messages.push(message);
    this.messageCount += 1;
    this.lastActivity = new Date();

    // Keep only last 8 messages for context
    if (this.messages.length > 8) {
      this.messages = this.messages.slice(-8);
    }

    return message;
  }

  setSpecialization(specialization) {
    this.specialization = specialization;
  }

  clearSpecialization() {
    this.specialization = null;
  }

  getRecentMessages(count = 8) {
    return this.messages.slice(-count);
  }

  toJSON() {
    return {
      chatId: this.chatId,
      userId: this.userId,
      messages: this.messages,
      specialization: this.specialization,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      messageCount: this.messageCount
    };
  }
}

module.exports = Conversation;
