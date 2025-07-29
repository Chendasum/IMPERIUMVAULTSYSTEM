
const fs = require('fs');
const path = require('path');

class UserDatabase {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.dynastyMembers = new Set(); // Your private dynasty access list
    this.memoryFile = path.join(__dirname, '../data/user_memory.json');
    this.loadPersistentMemory();
  }

  // Load persistent memory from file
  loadPersistentMemory() {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.memoryFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.memoryFile)) {
        const data = JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
        
        // Restore user data
        if (data.users) {
          Object.entries(data.users).forEach(([userId, userData]) => {
            this.users.set(parseInt(userId), userData);
          });
        }

        console.log(`💾 Loaded memory for ${this.users.size} users`);
      }
    } catch (error) {
      console.log('📝 Creating new memory file...');
    }
  }

  // Save persistent memory to file
  savePersistentMemory() {
    try {
      const data = {
        users: Object.fromEntries(this.users),
        lastSaved: new Date().toISOString()
      };

      fs.writeFileSync(this.memoryFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Failed to save memory:', error.message);
    }
  }

  // Dynasty Access Control
  addDynastyMember(userId) {
    this.dynastyMembers.add(userId);
    console.log(`👑 Dynasty member added: ${userId}`);
  }

  isDynastyMember(userId) {
    return this.dynastyMembers.has(userId);
  }

  removeDynastyMember(userId) {
    this.dynastyMembers.delete(userId);
    console.log(`🚪 Dynasty member removed: ${userId}`);
  }

  // User Session Management
  createSession(chatId, userId) {
    this.sessions.set(chatId, {
      userId,
      messages: [],
      specialization: null,
      createdAt: new Date(),
      lastActivity: new Date()
    });
  }

  getSession(chatId) {
    return this.sessions.get(chatId);
  }

  updateSession(chatId, updates) {
    const session = this.sessions.get(chatId);
    if (session) {
      Object.assign(session, updates, { lastActivity: new Date() });
    }
  }

  // User Profile Management
  createUser(userId, userData) {
    const user = {
      id: userId,
      joinedAt: new Date(),
      totalQueries: 0,
      lastActive: new Date(),
      status: 'active',
      personalInfo: {
        name: null,
        preferences: [],
        interests: [],
        conversationHistory: []
      },
      ...userData
    };
    
    this.users.set(userId, user);
    this.savePersistentMemory();
    return user;
  }

  getUser(userId) {
    return this.users.get(userId);
  }

  updateUser(userId, updates) {
    const user = this.users.get(userId);
    if (user) {
      Object.assign(user, updates, { lastActive: new Date() });
      this.savePersistentMemory();
    }
  }

  // Personal memory methods
  savePersonalInfo(userId, info) {
    let user = this.getUser(userId);
    if (!user) {
      user = this.createUser(userId, {});
    }
    
    if (!user.personalInfo) {
      user.personalInfo = {
        name: null,
        preferences: [],
        interests: [],
        conversationHistory: []
      };
    }
    
    Object.assign(user.personalInfo, info);
    this.savePersistentMemory();
  }

  addToPersonalHistory(userId, interaction) {
    let user = this.getUser(userId);
    if (!user) {
      user = this.createUser(userId, {});
    }
    
    if (!user.personalInfo) {
      user.personalInfo = { conversationHistory: [] };
    }
    
    if (!user.personalInfo.conversationHistory) {
      user.personalInfo.conversationHistory = [];
    }
    
    user.personalInfo.conversationHistory.push({
      timestamp: new Date(),
      interaction: interaction
    });
    
    // Keep only last 50 interactions
    if (user.personalInfo.conversationHistory.length > 50) {
      user.personalInfo.conversationHistory = user.personalInfo.conversationHistory.slice(-50);
    }
    
    this.savePersistentMemory();
  }

  // Analytics
  getTotalUsers() {
    return this.users.size;
  }

  getActiveSessions() {
    return this.sessions.size;
  }

  getDynastySize() {
    return this.dynastyMembers.size;
  }
}

module.exports = new UserDatabase();
