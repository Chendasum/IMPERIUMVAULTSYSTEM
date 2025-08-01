// index.js - Entry point for Railway deployment
// This file loads the Ultimate Vault Claude bot with error handling

console.log('🏛️ Starting IMPERIUM VAULT SYSTEM...');
console.log('⚡ Initializing Ultimate Vault Claude Strategic AI...');

// Force use main bot.js file directly - no fallbacks
const fs = require('fs');
const path = require('path');

let botPath = './bot.js';  // Direct path to main bot.js

console.log('🔍 Loading main bot.js file with complete autotrading...');

// Verify main bot.js exists
if (!fs.existsSync(botPath)) {
  console.error('🚨 CRITICAL ERROR: Main bot.js file not found!');
  console.log('📁 Current directory contents:');
  try {
    const files = fs.readdirSync('.');
    files.forEach(file => console.log(`  - ${file}`));
  } catch (error) {
    console.error('Cannot read directory:', error.message);
  }
  process.exit(1);
}

console.log(`✅ Using main bot.js file: ${botPath}`);

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
