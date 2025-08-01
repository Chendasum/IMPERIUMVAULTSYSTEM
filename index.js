// index.js - Entry point for Railway deployment
// This file loads the Ultimate Vault Claude bot with error handling

console.log('🏛️ Starting IMPERIUM VAULT SYSTEM...');
console.log('⚡ Initializing Ultimate Vault Claude Strategic AI...');

// Railway deployment - use src structure since main bot.js not deployed
const fs = require('fs');
const path = require('path');

let botPath = './src/bot.js';  // Use src/bot.js in Railway deployment

console.log('🔍 Loading bot.js from src directory...');

// Verify src/bot.js exists
if (!fs.existsSync(botPath)) {
  console.error('🚨 CRITICAL ERROR: src/bot.js file not found!');
  console.log('📁 Current directory contents:');
  try {
    const files = fs.readdirSync('.');
    files.forEach(file => console.log(`  - ${file}`));
  } catch (error) {
    console.error('Cannot read directory:', error.message);
  }
  process.exit(1);
}

console.log(`✅ Using Railway deployment bot file: ${botPath}`);

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
