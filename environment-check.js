// ENVIRONMENT & GITHUB READINESS CHECKER
// Verifies your system is ready for real OpenAI deployment

require("dotenv").config();

/**
 * 🔍 CHECK ENVIRONMENT SETUP
 */
function checkEnvironment() {
    console.log("🔍 CHECKING ENVIRONMENT SETUP...");
    console.log("=".repeat(50));
    
    const requiredEnvVars = {
        'OPENAI_API_KEY': 'OpenAI API access',
        'TELEGRAM_BOT_TOKEN': 'Telegram Bot connection',
        'ADMIN_CHAT_ID': 'Authorized user access',
        'DATABASE_URL': 'PostgreSQL database (Railway provides this)',
        'METAAPI_TOKEN': 'MetaTrader integration (optional)',
        'METAAPI_ACCOUNT_ID': 'MetaTrader account (optional)'
    };

    let allGood = true;
    const results = {};

    Object.entries(requiredEnvVars).forEach(([key, description]) => {
        const value = process.env[key];
        const exists = !!value;
        const masked = value ? `${value.substring(0, 8)}...` : 'NOT SET';
        
        console.log(`${exists ? '✅' : '❌'} ${key}: ${masked}`);
        console.log(`   📝 ${description}`);
        
        results[key] = { exists, description, valid: exists };
        
        if (!exists && !key.includes('METAAPI')) {
            allGood = false;
        }
    });

    // Validate OpenAI key format
    if (process.env.OPENAI_API_KEY) {
        const apiKey = process.env.OPENAI_API_KEY;
        const validFormat = apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-');
        const correctLength = apiKey.length > 40;
        
        results.OPENAI_API_KEY.valid = validFormat && correctLength;
        
        if (!validFormat) {
            console.log("⚠️  OpenAI key format invalid - should start with 'sk-proj-' or 'sk-'");
            allGood = false;
        }
        
        if (!correctLength) {
            console.log("⚠️  OpenAI key too short - check full key is copied");
            allGood = false;
        }
    }

    // Validate Telegram token format
    if (process.env.TELEGRAM_BOT_TOKEN) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const validFormat = /^\d+:[A-Za-z0-9_-]+$/.test(token);
        
        results.TELEGRAM_BOT_TOKEN.valid = validFormat;
        
        if (!validFormat) {
            console.log("⚠️  Telegram token format invalid - should be BOTID:TOKEN_STRING");
            allGood = false;
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log(allGood ? "✅ Environment setup: READY" : "❌ Environment setup: ISSUES FOUND");
    
    return { allGood, results };
}

/**
 * 📁 CHECK FILE STRUCTURE
 */
function checkFileStructure() {
    console.log("\n📁 CHECKING FILE STRUCTURE...");
    console.log("=".repeat(50));
    
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = {
        'index.js': 'Main application file',
        'package.json': 'Dependencies configuration', 
        '.env': 'Environment variables',
        'utils/liveData.js': 'Ray Dalio market data',
        'utils/contextEnhancer.js': 'Ray Dalio context intelligence',
        'utils/metaTrader.js': 'Ray Dalio risk management',
        'utils/database.js': 'Ray Dalio data persistence',
        'utils/memory.js': 'Memory system',
        'utils/multimodal.js': 'Multimodal capabilities',
        'utils/trainingData.js': 'Training documents'
    };

    const optionalFiles = {
        'README.md': 'Documentation',
        '.gitignore': 'Git ignore rules',
        'railway.json': 'Railway deployment config'
    };

    let filesGood = true;

    console.log("📋 Required files:");
    Object.entries(requiredFiles).forEach(([file, description]) => {
        const exists = fs.existsSync(file);
        console.log(`${exists ? '✅' : '❌'} ${file} - ${description}`);
        if (!exists) filesGood = false;
    });

    console.log("\n📋 Optional files:");
    Object.entries(optionalFiles).forEach(([file, description]) => {
        const exists = fs.existsSync(file);
        console.log(`${exists ? '✅' : '⚠️ '} ${file} - ${description}`);
    });

    // Check utils directory
    const utilsExists = fs.existsSync('utils');
    console.log(`\n📂 utils/ directory: ${utilsExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!utilsExists) {
        filesGood = false;
        console.log("💡 Create utils/ directory and add the enhanced files");
    }

    console.log("\n" + "=".repeat(50));
    console.log(filesGood ? "✅ File structure: READY" : "❌ File structure: MISSING FILES");
    
    return filesGood;
}

/**
 * 📦 CHECK DEPENDENCIES
 */
function checkDependencies() {
    console.log("\n📦 CHECKING DEPENDENCIES...");
    console.log("=".repeat(50));
    
    const fs = require('fs');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = packageJson.dependencies || {};
        
        const criticalDeps = [
            'openai',
            'node-telegram-bot-api', 
            'express',
            'axios',
            'pg',
            'metaapi.cloud-sdk',
            'dotenv'
        ];

        let depsGood = true;

        console.log("📋 Critical dependencies:");
        criticalDeps.forEach(dep => {
            const installed = dependencies[dep];
            console.log(`${installed ? '✅' : '❌'} ${dep}: ${installed || 'NOT INSTALLED'}`);
            if (!installed) depsGood = false;
        });

        // Check Ray Dalio enhancements
        const rayDalioConfig = packageJson.rayDalio;
        const hasRayDalioConfig = !!rayDalioConfig;
        
        console.log(`\n🏛️ Ray Dalio Configuration: ${hasRayDalioConfig ? '✅ CONFIGURED' : '❌ MISSING'}`);
        
        if (hasRayDalioConfig) {
            console.log("   Features enabled:", Object.keys(rayDalioConfig.features || {}).length);
            console.log("   Risk management:", rayDalioConfig.riskManagement ? '✅' : '❌');
        }

        console.log("\n" + "=".repeat(50));
        console.log(depsGood ? "✅ Dependencies: READY" : "❌ Dependencies: MISSING PACKAGES");
        
        return { depsGood, packageJson };
        
    } catch (error) {
        console.log("❌ Cannot read package.json:", error.message);
        return { depsGood: false, error: error.message };
    }
}

/**
 * 🐙 CHECK GITHUB READINESS
 */
function checkGitHubReadiness() {
    console.log("\n🐙 CHECKING GITHUB READINESS...");
    console.log("=".repeat(50));
    
    const fs = require('fs');
    const { execSync } = require('child_process');
    
    let gitGood = true;
    
    // Check if .git exists
    const isGitRepo = fs.existsSync('.git');
    console.log(`📁 Git repository: ${isGitRepo ? '✅ INITIALIZED' : '❌ NOT INITIALIZED'}`);
    
    if (!isGitRepo) {
        console.log("💡 Run: git init");
        gitGood = false;
    }

    // Check .gitignore
    const hasGitignore = fs.existsSync('.gitignore');
    console.log(`📄 .gitignore: ${hasGitignore ? '✅ EXISTS' : '⚠️  MISSING'}`);
    
    if (!hasGitignore) {
        console.log("💡 Create .gitignore to exclude sensitive files");
    }

    // Check for sensitive files
    const sensitiveFiles = ['.env', 'node_modules'];
    let hasSensitiveFiles = false;
    
    console.log("\n🔒 Checking for sensitive files:");
    sensitiveFiles.forEach(file => {
        const exists = fs.existsSync(file);
        if (exists) {
            console.log(`⚠️  ${file} exists - ensure it's in .gitignore`);
            hasSensitiveFiles = true;
        } else {
            console.log(`✅ ${file} - handled`);
        }
    });

    // Check git status if possible
    if (isGitRepo) {
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            const hasChanges = status.trim().length > 0;
            console.log(`\n📝 Git status: ${hasChanges ? 'CHANGES DETECTED' : 'CLEAN'}`);
            
            if (hasChanges) {
                console.log("💡 Files ready to commit:");
                console.log(status.trim());
            }
        } catch (error) {
            console.log("⚠️  Cannot check git status");
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log(gitGood ? "✅ GitHub readiness: READY" : "⚠️  GitHub readiness: NEEDS SETUP");
    
    return { gitGood, hasSensitiveFiles };
}

/**
 * 🎯 GENERATE SETUP INSTRUCTIONS
 */
function generateSetupInstructions(checks) {
    console.log("\n🎯 SETUP INSTRUCTIONS:");
    console.log("=".repeat(50));
    
    const { env, files, deps, git } = checks;
    
    if (!env.allGood) {
        console.log("\n1️⃣ ENVIRONMENT VARIABLES:");
        console.log("   Create .env file with:");
        Object.entries(env.results).forEach(([key, result]) => {
            if (!result.exists && !key.includes('METAAPI')) {
                console.log(`   ${key}=your_${key.toLowerCase()}_here`);
            }
        });
        console.log("\n   🔑 Get OpenAI key: https://platform.openai.com/api-keys");
        console.log("   🤖 Get Telegram token: https://t.me/BotFather");
    }

    if (!files) {
        console.log("\n2️⃣ MISSING FILES:");
        console.log("   Create utils/ directory");
        console.log("   Add enhanced Ray Dalio files");
        console.log("   Copy the enhanced code I provided");
    }

    if (!deps.depsGood) {
        console.log("\n3️⃣ INSTALL DEPENDENCIES:");
        console.log("   npm install");
        console.log("   Or use the enhanced package.json I provided");
    }

    if (!git.gitGood) {
        console.log("\n4️⃣ GITHUB SETUP:");
        console.log("   git init");
        console.log("   Create .gitignore");
        console.log("   git add .");
        console.log("   git commit -m 'Initial Ray Dalio system'");
        console.log("   git branch -M main");
        console.log("   git remote add origin your-repo-url");
        console.log("   git push -u origin main");
    }

    console.log("\n5️⃣ VERIFICATION:");
    console.log("   node verification-script.js");
    console.log("   npm test");
    console.log("   npm start");
    
    console.log("\n6️⃣ DEPLOYMENT:");
    console.log("   Connect GitHub to Railway");
    console.log
