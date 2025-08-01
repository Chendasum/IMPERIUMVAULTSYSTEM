// index.js - Entry point for Railway deployment
// This file loads the Ultimate Vault Claude bot with error handling

console.log('🏛️ Starting IMPERIUM VAULT SYSTEM...');
console.log('⚡ Initializing Ultimate Vault Claude Strategic AI...');

// Try multiple paths to find the bot file
const fs = require('fs');
const path = require('path');

let botPath = null;

// Check possible bot file locations (prioritize root bot.js with autotrading)
const possiblePaths = [
  './bot.js',           // Main bot with autotrading features
  path.join(__dirname, 'bot.js'),
  // './src/bot.js',     // Commented out - older version without autotrading
  // path.join(__dirname, 'src', 'bot.js')
];

console.log('🔍 Searching for bot.js file...');
for (const testPath of possiblePaths) {
  try {
    if (fs.existsSync(testPath)) {
      botPath = testPath;
      console.log(`✅ Found bot.js at: ${testPath}`);
      break;
    }
  } catch (error) {
    console.log(`❌ Cannot access: ${testPath}`);
  }
}

if (!botPath) {
  console.error('🚨 CRITICAL ERROR: bot.js file not found in any expected location');
  console.log('📁 Current directory contents:');
  try {
    const files = fs.readdirSync('.');
    files.forEach(file => console.log(`  - ${file}`));
  } catch (error) {
    console.error('Cannot read directory:', error.message);
  }
  process.exit(1);
}

// Load the main bot application
console.log(`🚀 Loading Ultimate Vault Claude from: ${botPath}`);
try {
  require(botPath);
  console.log('✅ Ultimate Vault Claude Strategic AI loaded successfully!');
  console.log('🏛️ ULTIMATE VAULT CLAUDE SUPREME STRATEGIC INTELLIGENCE SYSTEM FULLY OPERATIONAL');
} catch (error) {
  console.error('🚨 FATAL ERROR loading bot:', error.message);
  console.error('Full error details:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
