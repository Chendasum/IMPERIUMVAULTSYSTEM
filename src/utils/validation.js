
function validateEnvironment() {
  const requiredVars = ['TELEGRAM_BOT_TOKEN', 'OPENAI_API_KEY'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error(`❌ MISSING ENVIRONMENT VARIABLES: ${missing.join(', ')}`);
    console.error('🔧 Create a .env file with the required variables');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

function validateDynastyAccess(userId) {
  // Add your Telegram user ID here for dynasty access
  const DYNASTY_MEMBERS = [
    // Example: 123456789, 987654321
    // Add your Telegram user ID (get it from @userinfobot)
  ];

  return DYNASTY_MEMBERS.includes(userId);
}

module.exports = {
  validateEnvironment,
  validateDynastyAccess
};
