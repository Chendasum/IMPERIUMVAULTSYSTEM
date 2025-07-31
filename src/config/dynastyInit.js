const userDatabase = require('./database');

// Initialize Dynasty Members
function initializeDynasty() {
  const DYNASTY_FOUNDING_MEMBERS = [
    // Add your Telegram user ID here (get from @userinfobot)
    // Example: 123456789
    // YOUR ACTUAL TELEGRAM USER ID:
    484389665  // Your verified dynasty member ID
  ];

  DYNASTY_FOUNDING_MEMBERS.forEach(userId => {
    userDatabase.addDynastyMember(userId);
  });

  console.log(`👑 Dynasty initialized with ${DYNASTY_FOUNDING_MEMBERS.length} founding members`);
}

// Auto-initialize on require
initializeDynasty();

module.exports = { initializeDynasty };
