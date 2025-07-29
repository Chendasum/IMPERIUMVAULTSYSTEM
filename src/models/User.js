
class User {
  constructor(userData) {
    this.id = userData.id;
    this.username = userData.username || null;
    this.firstName = userData.firstName || null;
    this.lastName = userData.lastName || null;
    this.joinedAt = new Date();
    this.lastActive = new Date();
    this.totalQueries = 0;
    this.isDynastyMember = false;
    this.status = 'active';
    this.preferences = {
      language: 'en',
      notifications: true,
      analysisDepth: 'detailed'
    };
  }

  updateActivity() {
    this.lastActive = new Date();
  }

  incrementQueries() {
    this.totalQueries += 1;
    this.updateActivity();
  }

  setDynastyStatus(status) {
    this.isDynastyMember = status;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      joinedAt: this.joinedAt,
      lastActive: this.lastActive,
      totalQueries: this.totalQueries,
      isDynastyMember: this.isDynastyMember,
      status: this.status,
      preferences: this.preferences
    };
  }
}

module.exports = User;
