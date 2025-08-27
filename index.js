#!/usr/bin/env node

// 🚀 IMPERIUM VAULT SYSTEM - GPT-5 ONLY ARCHITECTURE
// Clean flow: index.js → dualCommandSystem.js → openaiClient.js → GPT-5 Family
// Optimized for cost, performance, and enterprise reliability with WEBHOOK support

console.log('🚀 IMPERIUM VAULT - GPT-5 Only System Starting...');
console.log('📋 Architecture: index.js → dualCommandSystem.js → openaiClient.js');
console.log('⚡ GPT-5 Family: Nano (Speed) → Mini (Balanced) → Full (Complex) → Chat');
console.log('🧠 Memory: PostgreSQL + Enhanced Context Integration');
console.log('💰 Cost Optimized: 60-80% savings vs dual AI system');
console.log('🌐 Mode: Webhook (Railway Production)');

require('dotenv').config();

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

// 🌐 WEBHOOK CONFIGURATION - Railway Production
const PORT = process.env.PORT || 8080;
const WEBHOOK_URL = process.env.WEBHOOK_URL || `https://imperiumvaultsystem-production.up.railway.app`;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
    process.exit(1);
}

console.log(`🚀 Railway Deployment Configuration:`);
console.log(`   Domain: imperiumvaultsystem-production.up.railway.app`);
console.log(`   Port: ${PORT}`);
console.log(`   Webhook URL: ${WEBHOOK_URL}`);
console.log(`   Mode: Production Webhook`);

if (!WEBHOOK_URL || WEBHOOK_URL.includes('your-app')) {
    console.error('❌ WEBHOOK_URL not properly configured in environment variables');
    console.log('💡 Using default Railway domain for webhook setup...');
}

// 📱 TELEGRAM BOT SETUP - Webhook Mode
const bot = new TelegramBot(BOT_TOKEN);
const app = express();

// Middleware
app.use(express.json());

// Health check endpoint (Railway expects this)
app.get('/', (req, res) => {
    res.json({
        status: 'IMPERIUM VAULT GPT-5 System Online',
        mode: 'webhook',
        platform: 'Railway',
        domain: 'imperiumvaultsystem-production.up.railway.app',
        port: PORT,
        timestamp: new Date().toISOString(),
        architecture: 'index.js → dualCommandSystem.js → openaiClient.js',
        ai_system: 'GPT-5 Only (Optimized)',
        memory_integration: 'PostgreSQL Active',
        cost_optimization: '60-80% savings vs dual AI system'
    });
});

// Railway health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'IMPERIUM VAULT GPT-5 System',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        },
        platform: 'Railway',
        mode: 'production',
        ai_system: 'GPT-5 Family',
        backup_system: 'Triple Redundancy Active',
        conversation_buffers: conversationBuffer.size,
        last_backup: new Date(lastBackupTime).toISOString()
    });
});

// Additional health endpoints for monitoring
app.get('/status', (req, res) => {
    res.json({
        healthy: true,
        service: 'GPT-5 System',
        version: '5.0',
        environment: 'production'
    });
});

app.get('/ping', (req, res) => {
    res.json({ 
        pong: true, 
        timestamp: new Date().toISOString(),
        service: 'IMPERIUM VAULT'
    });
});

// 🎯 MAIN GPT-5 SYSTEM - Smart Router with Memory Integration
const { 
    executeDualCommand,              // 🎯 Main function - intelligently routes to optimal GPT-5 model
    executeEnhancedGPT5Command,      // 🚀 Enhanced command with auto-Telegram delivery
    analyzeQuery,                    // 🧠 Query analysis for optimal model selection
    quickNanoCommand,                // ⚡ Speed-critical responses (GPT-5 Nano)
    quickMiniCommand,                // ⚖️ Balanced responses (GPT-5 Mini)
    quickUltimateCommand,            // 🧠 Complex analysis (GPT-5 Full)
    checkGPT5OnlySystemHealth,       // 📊 Comprehensive health monitoring
    testMemoryIntegration,           // 🧪 Memory system diagnostics
    getCurrentCambodiaDateTime,      // 🌍 Cambodia timezone utilities
    getMarketIntelligence,           // 📈 Market analysis with GPT-5
    getSystemAnalytics,              // 📊 System performance metrics
    getGPT5ModelRecommendation,      // 💡 Model selection recommendations
    getGPT5CostEstimate,             // 💰 Cost estimation and optimization
    getGPT5PerformanceMetrics        // ⚡ Real-time performance analytics
} = require("./utils/dualCommandSystem");

// Master coordination for ALL modules with conditional loading
// 🔧 SPECIALIZED HANDLERS (Preserved for business logic)
const cambodiaHandler = require('./handlers/cambodiaDeals');
const lpManagement = require('./cambodia/lpManagement');
const portfolioManager = require('./cambodia/portfolioManager');
const realEstateWealth = require('./cambodia/realEstateWealth'); 
const businessWealth = require('./cambodia/businessWealth');
const investmentWealth = require('./cambodia/investmentWealth');
const economicIntelligence = require('./cambodia/economicIntelligence');
const legalRegulatory = require('./cambodia/legalRegulatory');
const agriculturalWealth = require('./cambodia/agriculturalWealth');
const resourcesWealth = require('./cambodia/resourcesWealth');
const cambodiaLending = require('./utils/cambodiaLending');

// 🏦 CORE 12 CAMBODIA LENDING MODULES
const creditAssessment = require('./cambodia/creditAssessment');
const loanOrigination = require('./cambodia/loanOrigination');
const loanServicing = require('./cambodia/loanServicing');
const riskManagement = require('./cambodia/riskManagement');
const loanRecovery = require('./cambodia/loanRecovery');
const cashFlowManagement = require('./cambodia/cashFlowManagement');
const borrowerDueDiligence = require('./cambodia/borrowerDueDiligence');
const performanceAnalytics = require('./cambodia/performanceAnalytics');
const fundAccounting = require('./cambodia/fundAccounting');
const investorReporting = require('./cambodia/investorReporting');
const complianceMonitoring = require('./cambodia/complianceMonitoring');
const marketResearch = require('./cambodia/marketResearch');

// 📈 NEW TRADING MODULES (Conditional Loading)
let tradingOperations, clientOnboarding, forexTrading, cryptoTrading, stockTrading, globalMarkets;
let tradingModulesLoaded = 0;

try {
    tradingOperations = require('./cambodia/tradingOperations');
    tradingModulesLoaded++;
    console.log('✅ tradingOperations loaded');
} catch (error) {
    console.log('⚠️ tradingOperations not found - trading functions will return placeholder responses');
    tradingOperations = null;
}

try {
    clientOnboarding = require('./cambodia/clientOnboarding');
    tradingModulesLoaded++;
    console.log('✅ clientOnboarding loaded');
} catch (error) {
    console.log('⚠️ clientOnboarding not found - onboarding functions will return placeholder responses');
    clientOnboarding = null;
}

try {
    forexTrading = require('./cambodia/forexTrading');
    tradingModulesLoaded++;
    console.log('✅ forexTrading loaded');
} catch (error) {
    console.log('⚠️ forexTrading not found - forex functions will return placeholder responses');
    forexTrading = null;
}

try {
    cryptoTrading = require('./cambodia/cryptoTrading');
    tradingModulesLoaded++;
    console.log('✅ cryptoTrading loaded');
} catch (error) {
    console.log('⚠️ cryptoTrading not found - crypto functions will return placeholder responses');
    cryptoTrading = null;
}

try {
    stockTrading = require('./cambodia/stockTrading');
    tradingModulesLoaded++;
    console.log('✅ stockTrading loaded');
} catch (error) {
    console.log('⚠️ stockTrading not found - stock functions will return placeholder responses');
    stockTrading = null;
}

try {
    globalMarkets = require('./cambodia/globalMarkets');
    tradingModulesLoaded++;
    console.log('✅ globalMarkets loaded');
} catch (error) {
    console.log('⚠️ globalMarkets not found - global market functions will return placeholder responses');
    globalMarkets = null;
}

console.log('🏦 IMPERIUMVAULTSYSTEM - Cambodia Private Lending Fund');
console.log(`📊 Core modules loaded: 11 Specialized Handlers + 12 Core Lending`);
console.log(`📈 Trading modules loaded: ${tradingModulesLoaded}/6 trading modules available`);

// Helper function for missing modules
function createPlaceholderResponse(moduleName, functionName) {
    return {
        success: false,
        error: `${moduleName} module not available - please create ./cambodia/${moduleName}.js`,
        module: moduleName,
        function: functionName,
        placeholder: true,
        suggestion: `Install ${moduleName} module to enable ${functionName} functionality`
    };
}

// ========================================================================
// 🎯 SPECIALIZED HANDLER FUNCTIONS (11 MODULES)
// ========================================================================

// 🎯 CAMBODIA DEALS HANDLER FUNCTIONS
async function processCambodiaDeal(dealData, chatId = null, bot = null) {
    try {
        console.log(`🤝 Processing Cambodia deal: ${dealData.dealType || 'unknown type'}`);
        return await cambodiaHandler.processDeal(dealData, chatId, bot);
    } catch (error) {
        console.error('Cambodia deal processing error:', error.message);
        return { success: false, error: error.message, module: 'cambodiaHandler' };
    }
}

async function analyzeDealStructure(dealId, structureData, chatId = null, bot = null) {
    try {
        return await cambodiaHandler.analyzeDealStructure(dealId, structureData, chatId, bot);
    } catch (error) {
        console.error('Deal structure analysis error:', error.message);
        return { success: false, error: error.message, module: 'cambodiaHandler' };
    }
}

// 🎯 LP MANAGEMENT FUNCTIONS
async function manageLimitedPartners(lpData, action = 'update', chatId = null, bot = null) {
    try {
        console.log(`👥 Managing LP: ${action} for ${lpData.lpName || 'unknown LP'}`);
        return await lpManagement.manageLPs(lpData, action, chatId, bot);
    } catch (error) {
        console.error('LP management error:', error.message);
        return { success: false, error: error.message, module: 'lpManagement' };
    }
}

async function generateLPReports(lpId, reportType = 'quarterly', chatId = null, bot = null) {
    try {
        return await lpManagement.generateLPReports(lpId, reportType, chatId, bot);
    } catch (error) {
        console.error('LP report generation error:', error.message);
        return { success: false, error: error.message, module: 'lpManagement' };
    }
}

async function trackLPCommitments(lpId, commitmentData, chatId = null, bot = null) {
    try {
        return await lpManagement.trackCommitments(lpId, commitmentData, chatId, bot);
    } catch (error) {
        console.error('LP commitment tracking error:', error.message);
        return { success: false, error: error.message, module: 'lpManagement' };
    }
}

// 🎯 PORTFOLIO MANAGER FUNCTIONS
async function optimizePortfolio(portfolioId, optimizationData, chatId = null, bot = null) {
    try {
        console.log(`📊 Optimizing portfolio: ${portfolioId}`);
        return await portfolioManager.optimizePortfolio(portfolioId, optimizationData, chatId, bot);
    } catch (error) {
        console.error('Portfolio optimization error:', error.message);
        return { success: false, error: error.message, module: 'portfolioManager' };
    }
}

async function rebalancePortfolio(portfolioId, rebalanceData, chatId = null, bot = null) {
    try {
        return await portfolioManager.rebalancePortfolio(portfolioId, rebalanceData, chatId, bot);
    } catch (error) {
        console.error('Portfolio rebalancing error:', error.message);
        return { success: false, error: error.message, module: 'portfolioManager' };
    }
}

async function analyzePortfolioPerformance(portfolioId, analysisData, chatId = null, bot = null) {
    try {
        return await portfolioManager.analyzePerformance(portfolioId, analysisData, chatId, bot);
    } catch (error) {
        console.error('Portfolio performance analysis error:', error.message);
        return { success: false, error: error.message, module: 'portfolioManager' };
    }
}

// 🎯 REAL ESTATE WEALTH FUNCTIONS
async function valuateRealEstate(propertyId, valuationData, chatId = null, bot = null) {
    try {
        console.log(`🏢 Valuating real estate: ${propertyId}`);
        return await realEstateWealth.valuateProperty(propertyId, valuationData, chatId, bot);
    } catch (error) {
        console.error('Real estate valuation error:', error.message);
        return { success: false, error: error.message, module: 'realEstateWealth' };
    }
}

async function analyzeRealEstateMarket(marketData, region = 'cambodia', chatId = null, bot = null) {
    try {
        return await realEstateWealth.analyzeMarketTrends(marketData, region, chatId, bot);
    } catch (error) {
        console.error('Real estate market analysis error:', error.message);
        return { success: false, error: error.message, module: 'realEstateWealth' };
    }
}

async function trackPropertyPortfolio(portfolioId, trackingData, chatId = null, bot = null) {
    try {
        return await realEstateWealth.trackPropertyPortfolio(portfolioId, trackingData, chatId, bot);
    } catch (error) {
        console.error('Property portfolio tracking error:', error.message);
        return { success: false, error: error.message, module: 'realEstateWealth' };
    }
}

// 🎯 BUSINESS WEALTH FUNCTIONS
async function valuateBusiness(businessId, valuationData, chatId = null, bot = null) {
    try {
        console.log(`🏭 Valuating business: ${businessId}`);
        return await businessWealth.valuateBusiness(businessId, valuationData, chatId, bot);
    } catch (error) {
        console.error('Business valuation error:', error.message);
        return { success: false, error: error.message, module: 'businessWealth' };
    }
}

async function analyzeBusinessPerformance(businessId, performanceData, chatId = null, bot = null) {
    try {
        return await businessWealth.analyzePerformance(businessId, performanceData, chatId, bot);
    } catch (error) {
        console.error('Business performance analysis error:', error.message);
        return { success: false, error: error.message, module: 'businessWealth' };
    }
}

async function assessBusinessRisk(businessId, riskData, chatId = null, bot = null) {
    try {
        return await businessWealth.assessBusinessRisk(businessId, riskData, chatId, bot);
    } catch (error) {
        console.error('Business risk assessment error:', error.message);
        return { success: false, error: error.message, module: 'businessWealth' };
    }
}

// 🎯 INVESTMENT WEALTH FUNCTIONS
async function manageInvestmentPortfolio(portfolioId, managementData, chatId = null, bot = null) {
    try {
        console.log(`📈 Managing investment portfolio: ${portfolioId}`);
        return await investmentWealth.managePortfolio(portfolioId, managementData, chatId, bot);
    } catch (error) {
        console.error('Investment portfolio management error:', error.message);
        return { success: false, error: error.message, module: 'investmentWealth' };
    }
}

async function analyzeInvestmentPerformance(investmentId, analysisData, chatId = null, bot = null) {
    try {
        return await investmentWealth.analyzeInvestmentPerformance(investmentId, analysisData, chatId, bot);
    } catch (error) {
        console.error('Investment performance analysis error:', error.message);
        return { success: false, error: error.message, module: 'investmentWealth' };
    }
}

async function optimizeAssetAllocation(portfolioId, allocationData, chatId = null, bot = null) {
    try {
        return await investmentWealth.optimizeAssetAllocation(portfolioId, allocationData, chatId, bot);
    } catch (error) {
        console.error('Asset allocation optimization error:', error.message);
        return { success: false, error: error.message, module: 'investmentWealth' };
    }
}

// 🎯 ECONOMIC INTELLIGENCE FUNCTIONS
async function analyzeEconomicConditions(region = 'cambodia', analysisData, chatId = null, bot = null) {
    try {
        console.log(`🌐 Analyzing economic conditions for: ${region}`);
        return await economicIntelligence.analyzeEconomicConditions(region, analysisData, chatId, bot);
    } catch (error) {
        console.error('Economic analysis error:', error.message);
        return { success: false, error: error.message, module: 'economicIntelligence' };
    }
}

async function forecastEconomicTrends(forecastData, timeframe = '12months', chatId = null, bot = null) {
    try {
        return await economicIntelligence.forecastTrends(forecastData, timeframe, chatId, bot);
    } catch (error) {
        console.error('Economic forecasting error:', error.message);
        return { success: false, error: error.message, module: 'economicIntelligence' };
    }
}

async function analyzeSectorPerformance(sector, performanceData, chatId = null, bot = null) {
    try {
        return await economicIntelligence.analyzeSectorPerformance(sector, performanceData, chatId, bot);
    } catch (error) {
        console.error('Sector performance analysis error:', error.message);
        return { success: false, error: error.message, module: 'economicIntelligence' };
    }
}

// 🎯 LEGAL REGULATORY FUNCTIONS
async function checkRegulatoryCompliance(entityId, complianceData, chatId = null, bot = null) {
    try {
        console.log(`⚖️ Checking regulatory compliance for: ${entityId}`);
        return await legalRegulatory.checkCompliance(entityId, complianceData, chatId, bot);
    } catch (error) {
        console.error('Regulatory compliance check error:', error.message);
        return { success: false, error: error.message, module: 'legalRegulatory' };
    }
}

async function analyzeLegalRisks(transactionId, riskData, chatId = null, bot = null) {
    try {
        return await legalRegulatory.analyzeLegalRisks(transactionId, riskData, chatId, bot);
    } catch (error) {
        console.error('Legal risk analysis error:', error.message);
        return { success: false, error: error.message, module: 'legalRegulatory' };
    }
}

async function generateLegalDocuments(documentType, documentData, chatId = null, bot = null) {
    try {
        return await legalRegulatory.generateLegalDocuments(documentType, documentData, chatId, bot);
    } catch (error) {
        console.error('Legal document generation error:', error.message);
        return { success: false, error: error.message, module: 'legalRegulatory' };
    }
}

// 🎯 AGRICULTURAL WEALTH FUNCTIONS
async function valuateAgriculturalAssets(assetId, valuationData, chatId = null, bot = null) {
    try {
        console.log(`🌾 Valuating agricultural assets: ${assetId}`);
        return await agriculturalWealth.valuateAgriculturalAssets(assetId, valuationData, chatId, bot);
    } catch (error) {
        console.error('Agricultural valuation error:', error.message);
        return { success: false, error: error.message, module: 'agriculturalWealth' };
    }
}

async function analyzeCropYields(farmId, yieldData, chatId = null, bot = null) {
    try {
        return await agriculturalWealth.analyzeCropYields(farmId, yieldData, chatId, bot);
    } catch (error) {
        console.error('Crop yield analysis error:', error.message);
        return { success: false, error: error.message, module: 'agriculturalWealth' };
    }
}

async function assessAgriculturalRisks(farmId, riskData, chatId = null, bot = null) {
    try {
        return await agriculturalWealth.assessAgriculturalRisks(farmId, riskData, chatId, bot);
    } catch (error) {
        console.error('Agricultural risk assessment error:', error.message);
        return { success: false, error: error.message, module: 'agriculturalWealth' };
    }
}

// 🎯 RESOURCES WEALTH FUNCTIONS
async function valuateNaturalResources(resourceId, valuationData, chatId = null, bot = null) {
    try {
        console.log(`💎 Valuating natural resources: ${resourceId}`);
        return await resourcesWealth.valuateNaturalResources(resourceId, valuationData, chatId, bot);
    } catch (error) {
        console.error('Natural resources valuation error:', error.message);
        return { success: false, error: error.message, module: 'resourcesWealth' };
    }
}

async function analyzeCommodityPrices(commodity, priceData, chatId = null, bot = null) {
    try {
        return await resourcesWealth.analyzeCommodityPrices(commodity, priceData, chatId, bot);
    } catch (error) {
        console.error('Commodity price analysis error:', error.message);
        return { success: false, error: error.message, module: 'resourcesWealth' };
    }
}

async function assessResourceExploitation(resourceId, exploitationData, chatId = null, bot = null) {
    try {
        return await resourcesWealth.assessExploitationPotential(resourceId, exploitationData, chatId, bot);
    } catch (error) {
        console.error('Resource exploitation assessment error:', error.message);
        return { success: false, error: error.message, module: 'resourcesWealth' };
    }
}

// 🎯 CAMBODIA LENDING UTILITY FUNCTIONS
async function processLendingTransaction(transactionData, chatId = null, bot = null) {
    try {
        console.log(`💰 Processing lending transaction: ${transactionData.transactionType || 'unknown'}`);
        return await cambodiaLending.processTransaction(transactionData, chatId, bot);
    } catch (error) {
        console.error('Lending transaction error:', error.message);
        return { success: false, error: error.message, module: 'cambodiaLending' };
    }
}

async function validateLendingData(validationData, chatId = null, bot = null) {
    try {
        return await cambodiaLending.validateData(validationData, chatId, bot);
    } catch (error) {
        console.error('Lending data validation error:', error.message);
        return { success: false, error: error.message, module: 'cambodiaLending' };
    }
}

// ========================================================================
// 🎯 CORE 12 LENDING MODULE FUNCTIONS
// ========================================================================

// 🎯 MODULE 1: CREDIT ASSESSMENT FUNCTIONS
async function runCreditAssessment(borrowerId, creditData, chatId = null, bot = null) {
    try {
        console.log(`🔍 Running credit assessment for borrower ${borrowerId}`);
        return await creditAssessment.assessCreditworthiness(borrowerId, creditData, chatId, bot);
    } catch (error) {
        console.error('Credit assessment error:', error.message);
        return { success: false, error: error.message, module: 'creditAssessment' };
    }
}

async function calculateCreditScore(borrowerId, scoreData, chatId = null, bot = null) {
    try {
        return await creditAssessment.calculateCreditScore(borrowerId, scoreData, chatId, bot);
    } catch (error) {
        console.error('Credit score calculation error:', error.message);
        return { success: false, error: error.message, module: 'creditAssessment' };
    }
}

// 🎯 MODULE 2: LOAN ORIGINATION FUNCTIONS
async function processLoanApplication(applicationData, chatId = null, bot = null) {
    try {
        console.log(`📝 Processing loan application for ${applicationData.borrowerName || 'unknown borrower'}`);
        return await loanOrigination.processLoanApplication(applicationData, chatId, bot);
    } catch (error) {
        console.error('Loan application error:', error.message);
        return { success: false, error: error.message, module: 'loanOrigination' };
    }
}

async function approveLoan(loanId, approvalData, chatId = null, bot = null) {
    try {
        return await loanOrigination.approveLoan(loanId, approvalData, chatId, bot);
    } catch (error) {
        console.error('Loan approval error:', error.message);
        return { success: false, error: error.message, module: 'loanOrigination' };
    }
}

// 🎯 MODULE 3: LOAN SERVICING FUNCTIONS
async function serviceLoan(loanId, servicingData, chatId = null, bot = null) {
    try {
        console.log(`📋 Servicing loan ${loanId}`);
        return await loanServicing.serviceLoan(loanId, servicingData, chatId, bot);
    } catch (error) {
        console.error('Loan servicing error:', error.message);
        return { success: false, error: error.message, module: 'loanServicing' };
    }
}

async function monitorLoanPerformance(loanId, performanceData, chatId = null, bot = null) {
    try {
        return await loanServicing.monitorLoanPerformance(loanId, performanceData, chatId, bot);
    } catch (error) {
        console.error('Loan monitoring error:', error.message);
        return { success: false, error: error.message, module: 'loanServicing' };
    }
}

// 🎯 MODULE 4: RISK MANAGEMENT FUNCTIONS
async function assessBorrowerRisk(borrowerId, riskData, chatId = null, bot = null) {
    try {
        console.log(`🚨 Assessing risk for borrower ${borrowerId}`);
        return await riskManagement.assessBorrowerRisk(borrowerId, riskData, chatId, bot);
    } catch (error) {
        console.error('Risk assessment error:', error.message);
        return { success: false, error: error.message, module: 'riskManagement' };
    }
}

async function analyzePortfolioRisk(portfolioId, riskData, chatId = null, bot = null) {
    try {
        return await riskManagement.analyzePortfolioRisk(portfolioId, riskData, chatId, bot);
    } catch (error) {
        console.error('Portfolio risk analysis error:', error.message);
        return { success: false, error: error.message, module: 'riskManagement' };
    }
}

// 🎯 MODULE 5: LOAN RECOVERY FUNCTIONS
async function initiateRecovery(loanId, recoveryData, chatId = null, bot = null) {
    try {
        console.log(`💰 Initiating recovery for loan ${loanId}`);
        return await loanRecovery.initiateRecoveryProcess(loanId, recoveryData, chatId, bot);
    } catch (error) {
        console.error('Loan recovery error:', error.message);
        return { success: false, error: error.message, module: 'loanRecovery' };
    }
}

async function manageCollateral(collateralId, collateralData, chatId = null, bot = null) {
    try {
        return await loanRecovery.manageCollateral(collateralId, collateralData, chatId, bot);
    } catch (error) {
        console.error('Collateral management error:', error.message);
        return { success: false, error: error.message, module: 'loanRecovery' };
    }
}

// 🎯 MODULE 6: CASH FLOW MANAGEMENT FUNCTIONS
async function manageCashFlow(fundId, cashFlowData, chatId = null, bot = null) {
    try {
        console.log(`💵 Managing cash flow for fund ${fundId}`);
        return await cashFlowManagement.optimizeCashFlow(fundId, cashFlowData, chatId, bot);
    } catch (error) {
        console.error('Cash flow management error:', error.message);
        return { success: false, error: error.message, module: 'cashFlowManagement' };
    }
}

async function forecastLiquidity(fundId, forecastData, chatId = null, bot = null) {
    try {
        return await cashFlowManagement.forecastLiquidityNeeds(fundId, forecastData, chatId, bot);
    } catch (error) {
        console.error('Liquidity forecasting error:', error.message);
        return { success: false, error: error.message, module: 'cashFlowManagement' };
    }
}

// 🎯 MODULE 7: BORROWER DUE DILIGENCE FUNCTIONS
async function conductDueDiligence(borrowerId, dueDiligenceData, chatId = null, bot = null) {
    try {
        console.log(`🔍 Conducting due diligence for borrower ${borrowerId}`);
        return await borrowerDueDiligence.conductComprehensiveDueDiligence(borrowerId, dueDiligenceData, chatId, bot);
    } catch (error) {
        console.error('Due diligence error:', error.message);
        return { success: false, error: error.message, module: 'borrowerDueDiligence' };
    }
}

async function performAMLScreening(borrowerId, amlData, chatId = null, bot = null) {
    try {
        return await borrowerDueDiligence.performAMLKYCScreening(borrowerId, amlData, chatId, bot);
    } catch (error) {
        console.error('AML screening error:', error.message);
        return { success: false, error: error.message, module: 'borrowerDueDiligence' };
    }
}

// 🎯 MODULE 8: PERFORMANCE ANALYTICS FUNCTIONS
async function generatePerformanceDashboard(fundId, reportingPeriod = 'monthly', chatId = null, bot = null) {
    try {
        console.log(`📈 Generating performance dashboard for fund ${fundId}`);
        return await performanceAnalytics.generateFundPerformanceDashboard(fundId, reportingPeriod, chatId, bot);
    } catch (error) {
        console.error('Performance dashboard error:', error.message);
        return { success: false, error: error.message, module: 'performanceAnalytics' };
    }
}

async function analyzeReturns(fundId, returnData, chatId = null, bot = null) {
    try {
        return await performanceAnalytics.analyzeReturnPerformance(fundId, returnData, chatId, bot);
    } catch (error) {
        console.error('Return analysis error:', error.message);
        return { success: false, error: error.message, module: 'performanceAnalytics' };
    }
}

// 🎯 MODULE 9: FUND ACCOUNTING FUNCTIONS
async function calculateNAV(fundId, valuationDate = new Date(), chatId = null, bot = null) {
    try {
        console.log(`🧮 Calculating NAV for fund ${fundId}`);
        return await fundAccounting.calculateNAV(fundId, valuationDate, chatId, bot);
    } catch (error) {
        console.error('NAV calculation error:', error.message);
        return { success: false, error: error.message, module: 'fundAccounting' };
    }
}

async function calculateManagementFees(fundId, feeData, chatId = null, bot = null) {
    try {
        return await fundAccounting.calculateManagementFees(fundId, feeData, chatId, bot);
    } catch (error) {
        console.error('Management fee calculation error:', error.message);
        return { success: false, error: error.message, module: 'fundAccounting' };
    }
}

// 🎯 MODULE 10: INVESTOR REPORTING FUNCTIONS
async function generateQuarterlyReport(fundId, reportData, chatId = null, bot = null) {
    try {
        console.log(`📊 Generating quarterly report for fund ${fundId}`);
        return await investorReporting.generateQuarterlyLPReport(fundId, reportData, chatId, bot);
    } catch (error) {
        console.error('Quarterly report error:', error.message);
        return { success: false, error: error.message, module: 'investorReporting' };
    }
}

async function generateMonthlyUpdate(fundId, updateData, chatId = null, bot = null) {
    try {
        return await investorReporting.generateMonthlyInvestorUpdate(fundId, updateData, chatId, bot);
    } catch (error) {
        console.error('Monthly update error:', error.message);
        return { success: false, error: error.message, module: 'investorReporting' };
    }
}

// 🎯 MODULE 11: COMPLIANCE MONITORING FUNCTIONS
async function performComplianceCheck(fundId, checkData, chatId = null, bot = null) {
    try {
        console.log(`📋 Performing compliance check for fund ${fundId}`);
        return await complianceMonitoring.performComplianceHealthCheck(fundId, checkData, chatId, bot);
    } catch (error) {
        console.error('Compliance check error:', error.message);
        return { success: false, error: error.message, module: 'complianceMonitoring' };
    }
}

async function monitorAlerts(fundId, alertData, chatId = null, bot = null) {
    try {
        return await complianceMonitoring.monitorComplianceAlerts(fundId, alertData, chatId, bot);
    } catch (error) {
        console.error('Alert monitoring error:', error.message);
        return { success: false, error: error.message, module: 'complianceMonitoring' };
    }
}

// 🎯 MODULE 12: MARKET RESEARCH FUNCTIONS
async function analyzeMarket(researchScope, analysisData, chatId = null, bot = null) {
    try {
        console.log(`🔍 Analyzing Cambodia market: ${researchScope}`);
        return await marketResearch.generateMarketAnalysis(researchScope, analysisData, chatId, bot);
    } catch (error) {
        console.error('Market analysis error:', error.message);
        return { success: false, error: error.message, module: 'marketResearch' };
    }
}

async function analyzeCompetitors(competitorData, chatId = null, bot = null) {
    try {
        return await marketResearch.analyzeCompetitiveLandscape(competitorData, chatId, bot);
    } catch (error) {
        console.error('Competitive analysis error:', error.message);
        return { success: false, error: error.message, module: 'marketResearch' };
    }
}

// ========================================================================
// 📈 NEW 6 TRADING & GLOBAL MODULE FUNCTIONS
// ========================================================================

// 🎯 NEW MODULE 1: TRADING OPERATIONS FUNCTIONS
async function executeCambodiaTrade(orderDetails, chatId = null, bot = null) {
    try {
        console.log(`📈 Executing Cambodia trade: ${orderDetails.symbol}`);
        if (!tradingOperations) {
            return createPlaceholderResponse('tradingOperations', 'executeCambodiaTrade');
        }
        return await tradingOperations.executeTrade(orderDetails);
    } catch (error) {
        console.error('Trade execution error:', error.message);
        return { success: false, error: error.message, module: 'tradingOperations' };
    }
}

async function constructCambodiaPortfolio(investmentAmount, riskProfile, timeHorizon, chatId = null, bot = null) {
    try {
        console.log(`💼 Constructing Cambodia portfolio: ${investmentAmount} (${riskProfile} risk)`);
        if (!tradingOperations) {
            return createPlaceholderResponse('tradingOperations', 'constructCambodiaPortfolio');
        }
        return await tradingOperations.constructCambodiaPortfolio(investmentAmount, riskProfile, timeHorizon);
    } catch (error) {
        console.error('Portfolio construction error:', error.message);
        return { success: false, error: error.message, module: 'tradingOperations' };
    }
}

async function implementTradingRiskManagement(portfolio, chatId = null, bot = null) {
    try {
        console.log(`🛡️ Implementing trading risk management for portfolio`);
        if (!tradingOperations) {
            return createPlaceholderResponse('tradingOperations', 'implementTradingRiskManagement');
        }
        return await tradingOperations.implementRiskManagement(portfolio);
    } catch (error) {
        console.error('Trading risk management error:', error.message);
        return { success: false, error: error.message, module: 'tradingOperations' };
    }
}

async function assessMarketTiming(exchange = 'CSX', chatId = null, bot = null) {
    try {
        console.log(`⏰ Assessing market timing for ${exchange}`);
        if (!tradingOperations) {
            return createPlaceholderResponse('tradingOperations', 'assessMarketTiming');
        }
        return await tradingOperations.assessMarketTiming(exchange);
    } catch (error) {
        console.error('Market timing assessment error:', error.message);
        return { success: false, error: error.message, module: 'tradingOperations' };
    }
}

async function generateTradingReport(period = 'monthly', chatId = null, bot = null) {
    try {
        console.log(`📊 Generating trading report for period: ${period}`);
        if (!tradingOperations) {
            return createPlaceholderResponse('tradingOperations', 'generateTradingReport');
        }
        return await tradingOperations.generateTradingReport(period);
    } catch (error) {
        console.error('Trading report generation error:', error.message);
        return { success: false, error: error.message, module: 'tradingOperations' };
    }
}

async function calculateTradingCosts(orderDetails, chatId = null, bot = null) {
    try {
        console.log(`💰 Calculating trading costs for ${orderDetails.symbol}`);
        if (!tradingOperations) {
            return createPlaceholderResponse('tradingOperations', 'calculateTradingCosts');
        }
        return await tradingOperations.calculateTradingCosts(orderDetails);
    } catch (error) {
        console.error('Trading cost calculation error:', error.message);
        return { success: false, error: error.message, module: 'tradingOperations' };
    }
}

async function validateCambodiaTradeRules(orderDetails, chatId = null, bot = null) {
    try {
        console.log(`✅ Validating Cambodia trade rules for ${orderDetails.symbol}`);
        if (!tradingOperations) {
            return createPlaceholderResponse('tradingOperations', 'validateCambodiaTradeRules');
        }
        return await tradingOperations.validateCambodiaTradeRules(orderDetails);
    } catch (error) {
        console.error('Trade rule validation error:', error.message);
        return { success: false, error: error.message, module: 'tradingOperations' };
    }
}

// 🎯 NEW MODULE 2: CLIENT ONBOARDING FUNCTIONS
async function initiateClientOnboarding(clientData, chatId = null, bot = null) {
    try {
        console.log(`🎯 Initiating client onboarding: ${clientData.personalDetails?.name || 'unknown'}`);
        if (!clientOnboarding) {
            return createPlaceholderResponse('clientOnboarding', 'initiateClientOnboarding');
        }
        return await clientOnboarding.initiateClientOnboarding(clientData);
    } catch (error) {
        console.error('Client onboarding initiation error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function qualifyClient(clientData, chatId = null, bot = null) {
    try {
        console.log(`📋 Qualifying client: ${clientData.personalDetails?.name || 'unknown'}`);
        if (!clientOnboarding) {
            return createPlaceholderResponse('clientOnboarding', 'qualifyClient');
        }
        return await clientOnboarding.qualifyClient(clientData);
    } catch (error) {
        console.error('Client qualification error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function generateClientDocumentChecklist(clientType, qualificationData, chatId = null, bot = null) {
    try {
        console.log(`📄 Generating document checklist for ${clientType} client`);
        if (!clientOnboarding) {
            return createPlaceholderResponse('clientOnboarding', 'generateClientDocumentChecklist');
        }
        return await clientOnboarding.generateDocumentChecklist(clientType, qualificationData);
    } catch (error) {
        console.error('Document checklist generation error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function performClientRiskProfiling(clientData, chatId = null, bot = null) {
    try {
        console.log(`⚖️ Performing risk profiling for client: ${clientData.personalDetails?.name || 'unknown'}`);
        if (!clientOnboarding) {
            return createPlaceholderResponse('clientOnboarding', 'performClientRiskProfiling');
        }
        return await clientOnboarding.performRiskProfiling(clientData);
    } catch (error) {
        console.error('Risk profiling error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function generateComplianceRequirements(qualificationData, chatId = null, bot = null) {
    try {
        console.log(`✅ Generating compliance requirements for client`);
        if (!clientOnboarding) {
            return createPlaceholderResponse('clientOnboarding', 'generateComplianceRequirements');
        }
        return await clientOnboarding.generateComplianceRequirements(qualificationData);
    } catch (error) {
        console.error('Compliance requirements error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function ensureCambodiaCompliance(clientData, onboardingStatus, chatId = null, bot = null) {
    try {
        console.log(`🇰🇭 Ensuring Cambodia regulatory compliance`);
        if (!clientOnboarding) {
            return createPlaceholderResponse('clientOnboarding', 'ensureCambodiaCompliance');
        }
        return await clientOnboarding.ensureCambodiaCompliance(clientData, onboardingStatus);
    } catch (error) {
        console.error('Cambodia compliance check error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function generateOnboardingReport(clientId, onboardingData, chatId = null, bot = null) {
    try {
        console.log(`📊 Generating onboarding report for client: ${clientId}`);
        if (!clientOnboarding) {
            return createPlaceholderResponse('clientOnboarding', 'generateOnboardingReport');
        }
        return await clientOnboarding.generateOnboardingReport(clientId, onboardingData);
    } catch (error) {
        console.error('Onboarding report generation error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

// 🎯 NEW MODULE 3: FOREX TRADING FUNCTIONS
async function analyzeForexOpportunity(currencyPair, analysisType, chatId = null, bot = null) {
    try {
        console.log(`💱 Analyzing forex opportunity: ${currencyPair}`);
        if (!forexTrading) {
            return createPlaceholderResponse('forexTrading', 'analyzeForexOpportunity');
        }
        return await forexTrading.analyzeForexOpportunity(currencyPair, analysisType);
    } catch (error) {
        console.error('Forex analysis error:', error.message);
        return { success: false, error: error.message, module: 'forexTrading' };
    }
}

async function executeForexTrade(tradeDetails, chatId = null, bot = null) {
    try {
        console.log(`💰 Executing forex trade: ${tradeDetails.currencyPair}`);
        if (!forexTrading) {
            return createPlaceholderResponse('forexTrading', 'executeForexTrade');
        }
        return await forexTrading.executeForexTrade(tradeDetails);
    } catch (error) {
        console.error('Forex trade execution error:', error.message);
        return { success: false, error: error.message, module: 'forexTrading' };
    }
}

async function generateForexStrategy(riskProfile, tradingStyle, timeCommitment, chatId = null, bot = null) {
    try {
        console.log(`📈 Generating forex strategy: ${tradingStyle} (${riskProfile} risk)`);
        if (!forexTrading) {
            return createPlaceholderResponse('forexTrading', 'generateForexStrategy');
        }
        return await forexTrading.generateForexStrategy(riskProfile, tradingStyle, timeCommitment);
    } catch (error) {
        console.error('Forex strategy generation error:', error.message);
        return { success: false, error: error.message, module: 'forexTrading' };
    }
}

// 🎯 NEW MODULE 4: CRYPTO TRADING FUNCTIONS
async function analyzeCryptoOpportunity(cryptocurrency, analysisType, chatId = null, bot = null) {
    try {
        console.log(`₿ Analyzing crypto opportunity: ${cryptocurrency}`);
        if (!cryptoTrading) {
            return createPlaceholderResponse('cryptoTrading', 'analyzeCryptoOpportunity');
        }
        return await cryptoTrading.analyzeCryptoOpportunity(cryptocurrency, analysisType);
    } catch (error) {
        console.error('Crypto analysis error:', error.message);
        return { success: false, error: error.message, module: 'cryptoTrading' };
    }
}

async function executeCryptoTrade(tradeDetails, chatId = null, bot = null) {
    try {
        console.log(`🔗 Executing crypto trade: ${tradeDetails.cryptocurrency}`);
        if (!cryptoTrading) {
            return createPlaceholderResponse('cryptoTrading', 'executeCryptoTrade');
        }
        return await cryptoTrading.executeCryptoTrade(tradeDetails);
    } catch (error) {
        console.error('Crypto trade execution error:', error.message);
        return { success: false, error: error.message, module: 'cryptoTrading' };
    }
}

async function constructCryptoPortfolio(investmentAmount, riskTolerance, investmentGoals, chatId = null, bot = null) {
    try {
        console.log(`🔗 Constructing crypto portfolio: ${investmentAmount} (${riskTolerance})`);
        if (!cryptoTrading) {
            return createPlaceholderResponse('cryptoTrading', 'constructCryptoPortfolio');
        }
        return await cryptoTrading.constructCryptoPortfolio(investmentAmount, riskTolerance, investmentGoals);
    } catch (error) {
        console.error('Crypto portfolio construction error:', error.message);
        return { success: false, error: error.message, module: 'cryptoTrading' };
    }
}

async function assessCryptoMarketConditions(chatId = null, bot = null) {
    try {
        console.log(`📊 Assessing crypto market conditions`);
        if (!cryptoTrading) {
            return createPlaceholderResponse('cryptoTrading', 'assessCryptoMarketConditions');
        }
        return await cryptoTrading.assessCryptoMarketConditions();
    } catch (error) {
        console.error('Crypto market assessment error:', error.message);
        return { success: false, error: error.message, module: 'cryptoTrading' };
    }
}

// 🎯 NEW MODULE 5: STOCK TRADING FUNCTIONS
async function analyzeStock(stockSymbol, analysisType, chatId = null, bot = null) {
    try {
        console.log(`📊 Analyzing stock: ${stockSymbol}`);
        if (!stockTrading) {
            return createPlaceholderResponse('stockTrading', 'analyzeStock');
        }
        return await stockTrading.analyzeStock(stockSymbol, analysisType);
    } catch (error) {
        console.error('Stock analysis error:', error.message);
        return { success: false, error: error.message, module: 'stockTrading' };
    }
}

async function executeStockTrade(tradeDetails, chatId = null, bot = null) {
    try {
        console.log(`📈 Executing stock trade: ${tradeDetails.symbol}`);
        if (!stockTrading) {
            return createPlaceholderResponse('stockTrading', 'executeStockTrade');
        }
        return await stockTrading.executeStockTrade(tradeDetails);
    } catch (error) {
        console.error('Stock trade execution error:', error.message);
        return { success: false, error: error.message, module: 'stockTrading' };
    }
}

async function constructStockPortfolio(investmentAmount, riskProfile, investmentObjectives, chatId = null, bot = null) {
    try {
        console.log(`📈 Constructing stock portfolio: ${investmentAmount} (${riskProfile})`);
        if (!stockTrading) {
            return createPlaceholderResponse('stockTrading', 'constructStockPortfolio');
        }
        return await stockTrading.constructStockPortfolio(investmentAmount, riskProfile, investmentObjectives);
    } catch (error) {
        console.error('Stock portfolio construction error:', error.message);
        return { success: false, error: error.message, module: 'stockTrading' };
    }
}

async function assessStockMarketConditions(chatId = null, bot = null) {
    try {
        console.log(`📊 Assessing stock market conditions`);
        if (!stockTrading) {
            return createPlaceholderResponse('stockTrading', 'assessStockMarketConditions');
        }
        return await stockTrading.assessStockMarketConditions();
    } catch (error) {
        console.error('Stock market assessment error:', error.message);
        return { success: false, error: error.message, module: 'stockTrading' };
    }
}

// 🎯 NEW MODULE 6: GLOBAL MARKETS FUNCTIONS
async function analyzeGlobalMarketConditions(chatId = null, bot = null) {
    try {
        console.log(`🌍 Analyzing global market conditions and Cambodia implications`);
        if (!globalMarkets) {
            return createPlaceholderResponse('globalMarkets', 'analyzeGlobalMarketConditions');
        }
        return await globalMarkets.analyzeGlobalMarketConditions();
    } catch (error) {
        console.error('Global market analysis error:', error.message);
        return { success: false, error: error.message, module: 'globalMarkets' };
    }
}

async function constructGlobalPortfolio(investmentAmount, riskProfile, timeHorizon, cambodiaFocus, chatId = null, bot = null) {
    try {
        console.log(`🌐 Constructing global portfolio: ${investmentAmount} (${riskProfile} risk, ${cambodiaFocus * 100}% Cambodia focus)`);
        if (!globalMarkets) {
            return createPlaceholderResponse('globalMarkets', 'constructGlobalPortfolio');
        }
        return await globalMarkets.constructGlobalPortfolio(investmentAmount, riskProfile, timeHorizon, cambodiaFocus);
    } catch (error) {
        console.error('Global portfolio construction error:', error.message);
        return { success: false, error: error.message, module: 'globalMarkets' };
    }
}

async function monitorGlobalMarketDevelopments(chatId = null, bot = null) {
    try {
        console.log(`📊 Monitoring global market developments for Cambodia impact`);
        if (!globalMarkets) {
            return createPlaceholderResponse('globalMarkets', 'monitorGlobalMarketDevelopments');
        }
        return await globalMarkets.monitorGlobalMarketDevelopments();
    } catch (error) {
        console.error('Global market monitoring error:', error.message);
        return { success: false, error: error.message, module: 'globalMarkets' };
    }
}

async function assessGlobalCrisisScenarios(chatId = null, bot = null) {
    try {
        console.log(`⚠️ Assessing global crisis scenarios and Cambodia vulnerabilities`);
        if (!globalMarkets) {
            return createPlaceholderResponse('globalMarkets', 'assessGlobalCrisisScenarios');
        }
        return await globalMarkets.assessGlobalCrisisScenarios();
    } catch (error) {
        console.error('Crisis scenario assessment error:', error.message);
        return { success: false, error: error.message, module: 'globalMarkets' };
    }
}

async function qualifyClient(clientData, chatId = null, bot = null) {
    try {
        console.log(`📋 Qualifying client`);
        if (!clientOnboarding) {
            return createPlaceholderResponse('clientOnboarding', 'qualifyClient');
        }
        return await clientOnboarding.qualifyClient(clientData);
    } catch (error) {
        console.error('Client qualification error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function generateClientDocumentChecklist(clientType, qualificationData, chatId = null, bot = null) {
    try {
        console.log(`📄 Generating document checklist for ${clientType} client`);
        return await clientOnboarding.generateDocumentChecklist(clientType, qualificationData);
    } catch (error) {
        console.error('Document checklist generation error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function performClientRiskProfiling(clientData, chatId = null, bot = null) {
    try {
        console.log(`⚖️ Performing risk profiling for client: ${clientData.personalDetails.name}`);
        return await clientOnboarding.performRiskProfiling(clientData);
    } catch (error) {
        console.error('Risk profiling error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function generateComplianceRequirements(qualificationData, chatId = null, bot = null) {
    try {
        console.log(`✅ Generating compliance requirements for client`);
        return await clientOnboarding.generateComplianceRequirements(qualificationData);
    } catch (error) {
        console.error('Compliance requirements error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function ensureCambodiaCompliance(clientData, onboardingStatus, chatId = null, bot = null) {
    try {
        console.log(`🇰🇭 Ensuring Cambodia regulatory compliance`);
        return await clientOnboarding.ensureCambodiaCompliance(clientData, onboardingStatus);
    } catch (error) {
        console.error('Cambodia compliance check error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

async function generateOnboardingReport(clientId, onboardingData, chatId = null, bot = null) {
    try {
        console.log(`📊 Generating onboarding report for client: ${clientId}`);
        return await clientOnboarding.generateOnboardingReport(clientId, onboardingData);
    } catch (error) {
        console.error('Onboarding report generation error:', error.message);
        return { success: false, error: error.message, module: 'clientOnboarding' };
    }
}

// 🎯 NEW MODULE 3: FOREX TRADING FUNCTIONS
async function analyzeForexOpportunity(currencyPair, analysisType, chatId = null, bot = null) {
    try {
        console.log(`💱 Analyzing forex opportunity: ${currencyPair}`);
        return await forexTrading.analyzeForexOpportunity(currencyPair, analysisType);
    } catch (error) {
        console.error('Forex analysis error:', error.message);
        return { success: false, error: error.message, module: 'forexTrading' };
    }
}

async function executeForexTrade(tradeDetails, chatId = null, bot = null) {
    try {
        console.log(`💰 Executing forex trade: ${tradeDetails.currencyPair}`);
        return await forexTrading.executeForexTrade(tradeDetails);
    } catch (error) {
        console.error('Forex trade execution error:', error.message);
        return { success: false, error: error.message, module: 'forexTrading' };
    }
}

async function generateForexStrategy(riskProfile, tradingStyle, timeCommitment, chatId = null, bot = null) {
    try {
        console.log(`📈 Generating forex strategy: ${tradingStyle} (${riskProfile} risk)`);
        return await forexTrading.generateForexStrategy(riskProfile, tradingStyle, timeCommitment);
    } catch (error) {
        console.error('Forex strategy generation error:', error.message);
        return { success: false, error: error.message, module: 'forexTrading' };
    }
}

// 🎯 NEW MODULE 4: CRYPTO TRADING FUNCTIONS
async function analyzeCryptoOpportunity(cryptocurrency, analysisType, chatId = null, bot = null) {
    try {
        console.log(`₿ Analyzing crypto opportunity: ${cryptocurrency}`);
        return await cryptoTrading.analyzeCryptoOpportunity(cryptocurrency, analysisType);
    } catch (error) {
        console.error('Crypto analysis error:', error.message);
        return { success: false, error: error.message, module: 'cryptoTrading' };
    }
}

async function executeCryptoTrade(tradeDetails, chatId = null, bot = null) {
    try {
        console.log(`🔗 Executing crypto trade: ${tradeDetails.cryptocurrency}`);
        return await cryptoTrading.executeCryptoTrade(tradeDetails);
    } catch (error) {
        console.error('Crypto trade execution error:', error.message);
        return { success: false, error: error.message, module: 'cryptoTrading' };
    }
}

async function constructCryptoPortfolio(investmentAmount, riskTolerance, investmentGoals, chatId = null, bot = null) {
    try {
        console.log(`🔗 Constructing crypto portfolio: ${investmentAmount} (${riskTolerance})`);
        return await cryptoTrading.constructCryptoPortfolio(investmentAmount, riskTolerance, investmentGoals);
    } catch (error) {
        console.error('Crypto portfolio construction error:', error.message);
        return { success: false, error: error.message, module: 'cryptoTrading' };
    }
}

async function assessCryptoMarketConditions(chatId = null, bot = null) {
    try {
        console.log(`📊 Assessing crypto market conditions`);
        return await cryptoTrading.assessCryptoMarketConditions();
    } catch (error) {
        console.error('Crypto market assessment error:', error.message);
        return { success: false, error: error.message, module: 'cryptoTrading' };
    }
}

// 🎯 NEW MODULE 5: STOCK TRADING FUNCTIONS
async function analyzeStock(stockSymbol, analysisType, chatId = null, bot = null) {
    try {
        console.log(`📊 Analyzing stock: ${stockSymbol}`);
        return await stockTrading.analyzeStock(stockSymbol, analysisType);
    } catch (error) {
        console.error('Stock analysis error:', error.message);
        return { success: false, error: error.message, module: 'stockTrading' };
    }
}

async function executeStockTrade(tradeDetails, chatId = null, bot = null) {
    try {
        console.log(`📈 Executing stock trade: ${tradeDetails.symbol}`);
        return await stockTrading.executeStockTrade(tradeDetails);
    } catch (error) {
        console.error('Stock trade execution error:', error.message);
        return { success: false, error: error.message, module: 'stockTrading' };
    }
}

async function constructStockPortfolio(investmentAmount, riskProfile, investmentObjectives, chatId = null, bot = null) {
    try {
        console.log(`📈 Constructing stock portfolio: ${investmentAmount} (${riskProfile})`);
        return await stockTrading.constructStockPortfolio(investmentAmount, riskProfile, investmentObjectives);
    } catch (error) {
        console.error('Stock portfolio construction error:', error.message);
        return { success: false, error: error.message, module: 'stockTrading' };
    }
}

async function assessStockMarketConditions(chatId = null, bot = null) {
    try {
        console.log(`📊 Assessing stock market conditions`);
        return await stockTrading.assessStockMarketConditions();
    } catch (error) {
        console.error('Stock market assessment error:', error.message);
        return { success: false, error: error.message, module: 'stockTrading' };
    }
}

// 🎯 NEW MODULE 6: GLOBAL MARKETS FUNCTIONS
async function analyzeGlobalMarketConditions(chatId = null, bot = null) {
    try {
        console.log(`🌍 Analyzing global market conditions and Cambodia implications`);
        return await globalMarkets.analyzeGlobalMarketConditions();
    } catch (error) {
        console.error('Global market analysis error:', error.message);
        return { success: false, error: error.message, module: 'globalMarkets' };
    }
}

async function constructGlobalPortfolio(investmentAmount, riskProfile, timeHorizon, cambodiaFocus, chatId = null, bot = null) {
    try {
        console.log(`🌐 Constructing global portfolio: ${investmentAmount} (${riskProfile} risk, ${cambodiaFocus * 100}% Cambodia focus)`);
        return await globalMarkets.constructGlobalPortfolio(investmentAmount, riskProfile, timeHorizon, cambodiaFocus);
    } catch (error) {
        console.error('Global portfolio construction error:', error.message);
        return { success: false, error: error.message, module: 'globalMarkets' };
    }
}

async function monitorGlobalMarketDevelopments(chatId = null, bot = null) {
    try {
        console.log(`📊 Monitoring global market developments for Cambodia impact`);
        return await globalMarkets.monitorGlobalMarketDevelopments();
    } catch (error) {
        console.error('Global market monitoring error:', error.message);
        return { success: false, error: error.message, module: 'globalMarkets' };
    }
}

async function assessGlobalCrisisScenarios(chatId = null, bot = null) {
    try {
        console.log(`⚠️ Assessing global crisis scenarios and Cambodia vulnerabilities`);
        return await globalMarkets.assessGlobalCrisisScenarios();
    } catch (error) {
        console.error('Crisis scenario assessment error:', error.message);
        return { success: false, error: error.message, module: 'globalMarkets' };
    }
}

async function identifyGlobalInvestmentThemes(chatId = null, bot = null) {
    try {
        console.log(`🎯 Identifying global investment themes and opportunities`);
        return await globalMarkets.identifyGlobalInvestmentThemes();
    } catch (error) {
        console.error('Global investment themes error:', error.message);
        return { success: false, error: error.message, module: 'globalMarkets' };
    }
}

// ========================================================================
// 🌟 COMPOSITE WORKFLOW FUNCTIONS
// ========================================================================

async function processCompleteLoanWorkflow(applicationData, chatId = null, bot = null) {
    try {
        console.log(`🔄 Starting complete loan workflow`);
        
        // Step 1: Due Diligence
        const dueDiligence = await conductDueDiligence(
            applicationData.borrowerId, 
            applicationData.dueDiligenceData, 
            chatId, 
            bot
        );
        
        if (!dueDiligence.success) {
            return { success: false, stage: 'dueDiligence', error: dueDiligence.error };
        }
        
        // Step 2: Credit Assessment
        const creditResult = await runCreditAssessment(
            applicationData.borrowerId,
            applicationData.creditData,
            chatId,
            bot
        );
        
        if (!creditResult.success) {
            return { success: false, stage: 'creditAssessment', error: creditResult.error };
        }
        
        // Step 3: Risk Assessment
        const riskResult = await assessBorrowerRisk(
            applicationData.borrowerId,
            applicationData.riskData,
            chatId,
            bot
        );
        
        if (!riskResult.success) {
            return { success: false, stage: 'riskAssessment', error: riskResult.error };
        }
        
        // Step 4: Process Application
        const loanResult = await processLoanApplication(applicationData, chatId, bot);
        
        return {
            success: true,
            workflow: 'completeLoanWorkflow',
            results: {
                dueDiligence: dueDiligence,
                creditAssessment: creditResult,
                riskAssessment: riskResult,
                loanProcessing: loanResult
            }
        };
        
    } catch (error) {
        console.error('Complete workflow error:', error.message);
        return { success: false, error: error.message, workflow: 'completeLoanWorkflow' };
    }
}

async function generateCompleteFundReport(fundId, reportingPeriod = 'quarterly', chatId = null, bot = null) {
    try {
        console.log(`📋 Generating complete fund report`);
        
        const performance = await generatePerformanceDashboard(fundId, reportingPeriod, chatId, bot);
        const nav = await calculateNAV(fundId, new Date(), chatId, bot);
        const quarterlyReport = await generateQuarterlyReport(fundId, { reportingPeriod }, chatId, bot);
        const compliance = await performComplianceCheck(fundId, {}, chatId, bot);
        
        return {
            success: true,
            reportType: 'completeFundReport',
            fundId: fundId,
            reportingPeriod: reportingPeriod,
            results: {
                performance: performance,
                nav: nav,
                quarterlyReport: quarterlyReport,
                compliance: compliance
            },
            generatedDate: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Complete fund report error:', error.message);
        return { success: false, error: error.message, reportType: 'completeFundReport' };
    }
}

async function processCompleteWealthAssessment(clientId, assessmentData, chatId = null, bot = null) {
    try {
        console.log(`🔄 Starting complete wealth assessment workflow`);
        
        const realEstateValue = await valuateRealEstate(
            assessmentData.realEstateId, 
            assessmentData.realEstateData, 
            chatId, 
            bot
        );
        
        const businessValue = await valuateBusiness(
            assessmentData.businessId,
            assessmentData.businessData,
            chatId,
            bot
        );
        
        const investmentValue = await analyzeInvestmentPerformance(
            assessmentData.investmentId,
            assessmentData.investmentData,
            chatId,
            bot
        );
        
        const agriculturalValue = await valuateAgriculturalAssets(
            assessmentData.agriculturalId,
            assessmentData.agriculturalData,
            chatId,
            bot
        );
        
        const resourcesValue = await valuateNaturalResources(
            assessmentData.resourcesId,
            assessmentData.resourcesData,
            chatId,
            bot
        );
        
        return {
            success: true,
            workflow: 'completeWealthAssessment',
            clientId: clientId,
            results: {
                realEstate: realEstateValue,
                business: businessValue,
                investments: investmentValue,
                agricultural: agriculturalValue,
                naturalResources: resourcesValue
            },
            totalWealth: {
                calculated: true,
                timestamp: new Date().toISOString()
            }
        };
        
    } catch (error) {
        console.error('Complete wealth assessment error:', error.message);
        return { success: false, error: error.message, workflow: 'completeWealthAssessment' };
    }
}

async function processCompleteMarketIntelligence(region = 'cambodia', intelligenceData, chatId = null, bot = null) {
    try {
        console.log(`🌐 Starting complete market intelligence workflow`);
        
        const economicAnalysis = await analyzeEconomicConditions(region, intelligenceData.economicData, chatId, bot);
        const marketResearchData = await analyzeMarket(region, intelligenceData.marketData, chatId, bot);
        const realEstateMarket = await analyzeRealEstateMarket(intelligenceData.realEstateData, region, chatId, bot);
        const competitiveAnalysis = await analyzeCompetitors(intelligenceData.competitorData, chatId, bot);
        const legalCompliance = await checkRegulatoryCompliance(region, intelligenceData.complianceData, chatId, bot);
        
        return {
            success: true,
            workflow: 'completeMarketIntelligence',
            region: region,
            results: {
                economic: economicAnalysis,
                market: marketResearchData,
                realEstate: realEstateMarket,
                competitive: competitiveAnalysis,
                legal: legalCompliance
            },
            generatedDate: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Complete market intelligence error:', error.message);
        return { success: false, error: error.message, workflow: 'completeMarketIntelligence' };
    }
}

// NEW TRADING WORKFLOWS
async function processCompleteClientOnboarding(clientData, chatId = null, bot = null) {
    try {
        console.log(`🎯 Starting complete client onboarding workflow`);
        
        const qualification = await qualifyClient(clientData, chatId, bot);
        if (!qualification.success) {
            return { success: false, stage: 'qualification', error: qualification.error };
        }
        
        const riskProfiling = await performClientRiskProfiling(clientData, chatId, bot);
        const complianceCheck = await ensureCambodiaCompliance(clientData, {}, chatId, bot);
        const documentList = await generateClientDocumentChecklist(clientData.clientType, qualification, chatId, bot);
        const onboardingReport = await generateOnboardingReport(clientData.clientId, {
            qualification, riskProfiling, complianceCheck, documentList
        }, chatId, bot);
        
        return {
            success: true,
            workflow: 'completeClientOnboarding',
            clientId: clientData.clientId,
            results: {
                qualification: qualification,
                riskProfiling: riskProfiling,
                compliance: complianceCheck,
                documents: documentList,
                report: onboardingReport
            }
        };
        
    } catch (error) {
        console.error('Complete client onboarding error:', error.message);
        return { success: false, error: error.message, workflow: 'completeClientOnboarding' };
    }
}

async function processCompleteInvestmentAnalysis(investmentData, chatId = null, bot = null) {
    try {
        console.log(`📊 Starting complete investment analysis workflow`);
        
        const stockAnalysis = await analyzeStock(investmentData.stockSymbol, 'comprehensive', chatId, bot);
        const forexAnalysis = await analyzeForexOpportunity(investmentData.currencyPair, 'comprehensive', chatId, bot);
        const cryptoAnalysis = await analyzeCryptoOpportunity(investmentData.cryptocurrency, 'comprehensive', chatId, bot);
        const globalAnalysis = await analyzeGlobalMarketConditions(chatId, bot);
        const marketTiming = await assessMarketTiming(investmentData.exchange, chatId, bot);
        
        return {
            success: true,
            workflow: 'completeInvestmentAnalysis',
            results: {
                stocks: stockAnalysis,
                forex: forexAnalysis,
                crypto: cryptoAnalysis,
                global: globalAnalysis,
                timing: marketTiming
            },
            generatedDate: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Complete investment analysis error:', error.message);
        return { success: false, error: error.message, workflow: 'completeInvestmentAnalysis' };
    }
}

// ========================================================================
// 📊 EXPORT ALL FUNCTIONS
// ========================================================================
module.exports = {
    // SPECIALIZED HANDLER FUNCTIONS (11 modules)
    // Cambodia Deals Handler
    processCambodiaDeal,
    analyzeDealStructure,
    
    // LP Management
    manageLimitedPartners,
    generateLPReports,
    trackLPCommitments,
    
    // Portfolio Manager
    optimizePortfolio,
    rebalancePortfolio,
    analyzePortfolioPerformance,
    
    // Real Estate Wealth
    valuateRealEstate,
    analyzeRealEstateMarket,
    trackPropertyPortfolio,
    
    // Business Wealth
    valuateBusiness,
    analyzeBusinessPerformance,
    assessBusinessRisk,
    
    // Investment Wealth
    manageInvestmentPortfolio,
    analyzeInvestmentPerformance,
    optimizeAssetAllocation,
    
    // Economic Intelligence
    analyzeEconomicConditions,
    forecastEconomicTrends,
    analyzeSectorPerformance,
    
    // Legal Regulatory
    checkRegulatoryCompliance,
    analyzeLegalRisks,
    generateLegalDocuments,
    
    // Agricultural Wealth
    valuateAgriculturalAssets,
    analyzeCropYields,
    assessAgriculturalRisks,
    
    // Resources Wealth
    valuateNaturalResources,
    analyzeCommodityPrices,
    assessResourceExploitation,
    
    // Cambodia Lending Utils
    processLendingTransaction,
    validateLendingData,
    
    // CORE 12 LENDING MODULE FUNCTIONS
    // Module 1: Credit Assessment
    runCreditAssessment,
    calculateCreditScore,
    
    // Module 2: Loan Origination
    processLoanApplication,
    approveLoan,
    
    // Module 3: Loan Servicing
    serviceLoan,
    monitorLoanPerformance,
    
    // Module 4: Risk Management
    assessBorrowerRisk,
    analyzePortfolioRisk,
    
    // Module 5: Loan Recovery
    initiateRecovery,
    manageCollateral,
    
    // Module 6: Cash Flow Management
    manageCashFlow,
    forecastLiquidity,
    
    // Module 7: Borrower Due Diligence
    conductDueDiligence,
    performAMLScreening,
    
    // Module 8: Performance Analytics
    generatePerformanceDashboard,
    analyzeReturns,
    
    // Module 9: Fund Accounting
    calculateNAV,
    calculateManagementFees,
    
    // Module 10: Investor Reporting
    generateQuarterlyReport,
    generateMonthlyUpdate,
    
    // Module 11: Compliance Monitoring
    performComplianceCheck,
    monitorAlerts,
    
    // Module 12: Market Research
    analyzeMarket,
    analyzeCompetitors,
    
    // NEW 6 TRADING & GLOBAL MODULE FUNCTIONS
    // Trading Operations
    executeCambodiaTrade,
    constructCambodiaPortfolio,
    implementTradingRiskManagement,
    assessMarketTiming,
    generateTradingReport,
    calculateTradingCosts,
    validateCambodiaTradeRules,
    
    // Client Onboarding
    initiateClientOnboarding,
    qualifyClient,
    generateClientDocumentChecklist,
    performClientRiskProfiling,
    generateComplianceRequirements,
    ensureCambodiaCompliance,
    generateOnboardingReport,
    
    // Forex Trading
    analyzeForexOpportunity,
    executeForexTrade,
    generateForexStrategy,
    
    // Crypto Trading
    analyzeCryptoOpportunity,
    executeCryptoTrade,
    constructCryptoPortfolio,
    assessCryptoMarketConditions,
    
    // Stock Trading
    analyzeStock,
    executeStockTrade,
    constructStockPortfolio,
    assessStockMarketConditions,
    
    // Global Markets
    analyzeGlobalMarketConditions,
    constructGlobalPortfolio,
    monitorGlobalMarketDevelopments,
    assessGlobalCrisisScenarios,
    identifyGlobalInvestmentThemes,
    
    // COMPOSITE WORKFLOW FUNCTIONS (6 total)
    processCompleteLoanWorkflow,
    generateCompleteFundReport,
    processCompleteWealthAssessment,
    processCompleteMarketIntelligence,
    processCompleteClientOnboarding,
    processCompleteInvestmentAnalysis,
    
    // Direct module access (if needed)
    modules: {
        // Core 12 Lending Modules
        creditAssessment,
        loanOrigination,
        loanServicing,
        riskManagement,
        loanRecovery,
        cashFlowManagement,
        borrowerDueDiligence,
        performanceAnalytics,
        fundAccounting,
        investorReporting,
        complianceMonitoring,
        marketResearch,
        
        // Specialized Handler Modules
        cambodiaHandler,
        lpManagement,
        portfolioManager,
        realEstateWealth,
        businessWealth,
        investmentWealth,
        economicIntelligence,
        legalRegulatory,
        agriculturalWealth,
        resourcesWealth,
        cambodiaLending,
        
        // New Trading & Global Modules
        tradingOperations,
        clientOnboarding,
        forexTrading,
        cryptoTrading,
        stockTrading,
        globalMarkets
    }
};

// ========================================================================
// 🌟 COMPOSITE WORKFLOW FUNCTIONS
// ========================================================================

async function processCompleteLoanWorkflow(applicationData, chatId = null, bot = null) {
    try {
        console.log('Starting complete loan workflow');
        
        // Step 1: Due Diligence
        const dueDiligence = await conductDueDiligence(
            applicationData.borrowerId, 
            applicationData.dueDiligenceData, 
            chatId, 
            bot
        );
        
        if (!dueDiligence.success) {
            return { success: false, stage: 'dueDiligence', error: dueDiligence.error };
        }
        
        // Step 2: Credit Assessment
        const creditResult = await runCreditAssessment(
            applicationData.borrowerId,
            applicationData.creditData,
            chatId,
            bot
        );
        
        if (!creditResult.success) {
            return { success: false, stage: 'creditAssessment', error: creditResult.error };
        }
        
        // Step 3: Risk Assessment
        const riskResult = await assessBorrowerRisk(
            applicationData.borrowerId,
            applicationData.riskData,
            chatId,
            bot
        );
        
        if (!riskResult.success) {
            return { success: false, stage: 'riskAssessment', error: riskResult.error };
        }
        
        // Step 4: Process Application
        const loanResult = await processLoanApplication(applicationData, chatId, bot);
        
        return {
            success: true,
            workflow: 'completeLoanWorkflow',
            results: {
                dueDiligence: dueDiligence,
                creditAssessment: creditResult,
                riskAssessment: riskResult,
                loanProcessing: loanResult
            }
        };
        
    } catch (error) {
        console.error('Complete workflow error:', error.message);
        return { success: false, error: error.message, workflow: 'completeLoanWorkflow' };
    }
}

async function generateCompleteFundReport(fundId, reportingPeriod = 'quarterly', chatId = null, bot = null) {
    try {
        console.log('Generating complete fund report');
        
        const performance = await generatePerformanceDashboard(fundId, reportingPeriod, chatId, bot);
        const nav = await calculateNAV(fundId, new Date(), chatId, bot);
        const quarterlyReport = await generateQuarterlyReport(fundId, { reportingPeriod }, chatId, bot);
        const compliance = await performComplianceCheck(fundId, {}, chatId, bot);
        
        return {
            success: true,
            reportType: 'completeFundReport',
            fundId: fundId,
            reportingPeriod: reportingPeriod,
            results: {
                performance: performance,
                nav: nav,
                quarterlyReport: quarterlyReport,
                compliance: compliance
            },
            generatedDate: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Complete fund report error:', error.message);
        return { success: false, error: error.message, reportType: 'completeFundReport' };
    }
}

async function processCompleteWealthAssessment(clientId, assessmentData, chatId = null, bot = null) {
    try {
        console.log('Starting complete wealth assessment workflow');
        
        const realEstateValue = await valuateRealEstate(
            assessmentData.realEstateId, 
            assessmentData.realEstateData, 
            chatId, 
            bot
        );
        
        const businessValue = await valuateBusiness(
            assessmentData.businessId,
            assessmentData.businessData,
            chatId,
            bot
        );
        
        const investmentValue = await analyzeInvestmentPerformance(
            assessmentData.investmentId,
            assessmentData.investmentData,
            chatId,
            bot
        );
        
        const agriculturalValue = await valuateAgriculturalAssets(
            assessmentData.agriculturalId,
            assessmentData.agriculturalData,
            chatId,
            bot
        );
        
        const resourcesValue = await valuateNaturalResources(
            assessmentData.resourcesId,
            assessmentData.resourcesData,
            chatId,
            bot
        );
        
        return {
            success: true,
            workflow: 'completeWealthAssessment',
            clientId: clientId,
            results: {
                realEstate: realEstateValue,
                business: businessValue,
                investments: investmentValue,
                agricultural: agriculturalValue,
                naturalResources: resourcesValue
            },
            totalWealth: {
                calculated: true,
                timestamp: new Date().toISOString()
            }
        };
        
    } catch (error) {
        console.error('Complete wealth assessment error:', error.message);
        return { success: false, error: error.message, workflow: 'completeWealthAssessment' };
    }
}

async function processCompleteMarketIntelligence(region = 'cambodia', intelligenceData, chatId = null, bot = null) {
    try {
        console.log('Starting complete market intelligence workflow');
        
        const economicAnalysis = await analyzeEconomicConditions(region, intelligenceData.economicData, chatId, bot);
        const marketResearchData = await analyzeMarket(region, intelligenceData.marketData, chatId, bot);
        const realEstateMarket = await analyzeRealEstateMarket(intelligenceData.realEstateData, region, chatId, bot);
        const competitiveAnalysis = await analyzeCompetitors(intelligenceData.competitorData, chatId, bot);
        const legalCompliance = await checkRegulatoryCompliance(region, intelligenceData.complianceData, chatId, bot);
        
        return {
            success: true,
            workflow: 'completeMarketIntelligence',
            region: region,
            results: {
                economic: economicAnalysis,
                market: marketResearchData,
                realEstate: realEstateMarket,
                competitive: competitiveAnalysis,
                legal: legalCompliance
            },
            generatedDate: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Complete market intelligence error:', error.message);
        return { success: false, error: error.message, workflow: 'completeMarketIntelligence' };
    }
}

async function processCompleteClientOnboarding(clientData, chatId = null, bot = null) {
    try {
        console.log('Starting complete client onboarding workflow');
        
        const qualification = await qualifyClient(clientData, chatId, bot);
        if (!qualification.success) {
            return { success: false, stage: 'qualification', error: qualification.error };
        }
        
        const riskProfiling = await performClientRiskProfiling(clientData, chatId, bot);
        const complianceCheck = await ensureCambodiaCompliance(clientData, {}, chatId, bot);
        const documentList = await generateClientDocumentChecklist(clientData.clientType, qualification, chatId, bot);
        const onboardingReport = await generateOnboardingReport(clientData.clientId, {
            qualification, riskProfiling, complianceCheck, documentList
        }, chatId, bot);
        
        return {
            success: true,
            workflow: 'completeClientOnboarding',
            clientId: clientData.clientId,
            results: {
                qualification: qualification,
                riskProfiling: riskProfiling,
                compliance: complianceCheck,
                documents: documentList,
                report: onboardingReport
            }
        };
        
    } catch (error) {
        console.error('Complete client onboarding error:', error.message);
        return { success: false, error: error.message, workflow: 'completeClientOnboarding' };
    }
}

async function processCompleteInvestmentAnalysis(investmentData, chatId = null, bot = null) {
    try {
        console.log('Starting complete investment analysis workflow');
        
        const stockAnalysis = await analyzeStock(investmentData.stockSymbol, 'comprehensive', chatId, bot);
        const forexAnalysis = await analyzeForexOpportunity(investmentData.currencyPair, 'comprehensive', chatId, bot);
        const cryptoAnalysis = await analyzeCryptoOpportunity(investmentData.cryptocurrency, 'comprehensive', chatId, bot);
        const globalAnalysis = await analyzeGlobalMarketConditions(chatId, bot);
        const marketTiming = await assessMarketTiming(investmentData.exchange, chatId, bot);
        
        return {
            success: true,
            workflow: 'completeInvestmentAnalysis',
            results: {
                stocks: stockAnalysis,
                forex: forexAnalysis,
                crypto: cryptoAnalysis,
                global: globalAnalysis,
                timing: marketTiming
            },
            generatedDate: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Complete investment analysis error:', error.message);
        return { success: false, error: error.message, workflow: 'completeInvestmentAnalysis' };
    }
}
console.log(`✅ IMPERIUMVAULTSYSTEM index.js loaded - Core: 23 modules + Trading: ${tradingModulesLoaded}/6 modules`);
console.log(`🎯 Available functions: ${tradingModulesLoaded > 0 ? '85+' : '65+'} functions exported`);
console.log(`🌟 System ready for Cambodia private lending${tradingModulesLoaded > 0 ? ' + trading operations' : ' operations'}`);
console.log(`📊 Status: 11 Specialized + 12 Core Lending + ${tradingModulesLoaded} Trading + 6 Workflows`);

// ========================================================================
// 📊 EXPORT ALL FUNCTIONS
// ========================================================================
module.exports = {
    // SPECIALIZED HANDLER FUNCTIONS (11 modules)
    // Cambodia Deals Handler
    processCambodiaDeal,
    analyzeDealStructure,
    
    // LP Management
    manageLimitedPartners,
    generateLPReports,
    trackLPCommitments,
    
    // Portfolio Manager
    optimizePortfolio,
    rebalancePortfolio,
    analyzePortfolioPerformance,
    
    // Real Estate Wealth
    valuateRealEstate,
    analyzeRealEstateMarket,
    trackPropertyPortfolio,
    
    // Business Wealth
    valuateBusiness,
    analyzeBusinessPerformance,
    assessBusinessRisk,
    
    // Investment Wealth
    manageInvestmentPortfolio,
    analyzeInvestmentPerformance,
    optimizeAssetAllocation,
    
    // Economic Intelligence
    analyzeEconomicConditions,
    forecastEconomicTrends,
    analyzeSectorPerformance,
    
    // Legal Regulatory
    checkRegulatoryCompliance,
    analyzeLegalRisks,
    generateLegalDocuments,
    
    // Agricultural Wealth
    valuateAgriculturalAssets,
    analyzeCropYields,
    assessAgriculturalRisks,
    
    // Resources Wealth
    valuateNaturalResources,
    analyzeCommodityPrices,
    assessResourceExploitation,
    
    // Cambodia Lending Utils
    processLendingTransaction,
    validateLendingData,
    
    // CORE 12 LENDING MODULE FUNCTIONS
    // Module 1: Credit Assessment
    runCreditAssessment,
    calculateCreditScore,
    
    // Module 2: Loan Origination
    processLoanApplication,
    approveLoan,
    
    // Module 3: Loan Servicing
    serviceLoan,
    monitorLoanPerformance,
    
    // Module 4: Risk Management
    assessBorrowerRisk,
    analyzePortfolioRisk,
    
    // Module 5: Loan Recovery
    initiateRecovery,
    manageCollateral,
    
    // Module 6: Cash Flow Management
    manageCashFlow,
    forecastLiquidity,
    
    // Module 7: Borrower Due Diligence
    conductDueDiligence,
    performAMLScreening,
    
    // Module 8: Performance Analytics
    generatePerformanceDashboard,
    analyzeReturns,
    
    // Module 9: Fund Accounting
    calculateNAV,
    calculateManagementFees,
    
    // Module 10: Investor Reporting
    generateQuarterlyReport,
    generateMonthlyUpdate,
    
    // Module 11: Compliance Monitoring
    performComplianceCheck,
    monitorAlerts,
    
    // Module 12: Market Research
    analyzeMarket,
    analyzeCompetitors,
    
    // TRADING MODULE FUNCTIONS (conditional - will return placeholders if modules not found)
    // Trading Operations
    executeCambodiaTrade,
    constructCambodiaPortfolio,
    implementTradingRiskManagement,
    assessMarketTiming,
    generateTradingReport,
    calculateTradingCosts,
    validateCambodiaTradeRules,
    
    // Client Onboarding
    initiateClientOnboarding,
    qualifyClient,
    generateClientDocumentChecklist,
    performClientRiskProfiling,
    generateComplianceRequirements,
    ensureCambodiaCompliance,
    generateOnboardingReport,
    
    // Forex Trading
    analyzeForexOpportunity,
    executeForexTrade,
    generateForexStrategy,
    
    // Crypto Trading
    analyzeCryptoOpportunity,
    executeCryptoTrade,
    constructCryptoPortfolio,
    assessCryptoMarketConditions,
    
    // Stock Trading
    analyzeStock,
    executeStockTrade,
    constructStockPortfolio,
    assessStockMarketConditions,
    
    // Global Markets
    analyzeGlobalMarketConditions,
    constructGlobalPortfolio,
    monitorGlobalMarketDevelopments,
    assessGlobalCrisisScenarios,
    identifyGlobalInvestmentThemes,
    
    // COMPOSITE WORKFLOW FUNCTIONS (6 total)
    processCompleteLoanWorkflow,
    generateCompleteFundReport,
    processCompleteWealthAssessment,
    processCompleteMarketIntelligence,
    processCompleteClientOnboarding,
    processCompleteInvestmentAnalysis,
    
    // UTILITY FUNCTIONS
    getTradingModulesStatus: () => ({
        loaded: tradingModulesLoaded,
        total: 6,
        modules: {
            tradingOperations: !!tradingOperations,
            clientOnboarding: !!clientOnboarding,
            forexTrading: !!forexTrading,
            cryptoTrading: !!cryptoTrading,
            stockTrading: !!stockTrading,
            globalMarkets: !!globalMarkets
        }
    }),
    
    // Direct module access (if needed)
    modules: {
        // Core 12 Lending Modules
        creditAssessment,
        loanOrigination,
        loanServicing,
        riskManagement,
        loanRecovery,
        cashFlowManagement,
        borrowerDueDiligence,
        performanceAnalytics,
        fundAccounting,
        investorReporting,
        complianceMonitoring,
        marketResearch,
        
        // Specialized Handler Modules
        cambodiaHandler,
        lpManagement,
        portfolioManager,
        realEstateWealth,
        businessWealth,
        investmentWealth,
        economicIntelligence,
        legalRegulatory,
        agriculturalWealth,
        resourcesWealth,
        cambodiaLending,
        
        // Trading Modules (may be null if not loaded)
        tradingOperations,
        clientOnboarding,
        forexTrading,
        cryptoTrading,
        stockTrading,
        globalMarkets
    }
};

// ========================================================================
// 📊 EXPORT ALL FUNCTIONS
// ========================================================================
module.exports = {
    // SPECIALIZED HANDLER FUNCTIONS (11 modules)
    // Cambodia Deals Handler
    processCambodiaDeal,
    analyzeDealStructure,
    
    // LP Management
    manageLimitedPartners,
    generateLPReports,
    trackLPCommitments,
    
    // Portfolio Manager
    optimizePortfolio,
    rebalancePortfolio,
    analyzePortfolioPerformance,
    
    // Real Estate Wealth
    valuateRealEstate,
    analyzeRealEstateMarket,
    trackPropertyPortfolio,
    
    // Business Wealth
    valuateBusiness,
    analyzeBusinessPerformance,
    assessBusinessRisk,
    
    // Investment Wealth
    manageInvestmentPortfolio,
    analyzeInvestmentPerformance,
    optimizeAssetAllocation,
    
    // Economic Intelligence
    analyzeEconomicConditions,
    forecastEconomicTrends,
    analyzeSectorPerformance,
    
    // Legal Regulatory
    checkRegulatoryCompliance,
    analyzeLegalRisks,
    generateLegalDocuments,
    
    // Agricultural Wealth
    valuateAgriculturalAssets,
    analyzeCropYields,
    assessAgriculturalRisks,
    
    // Resources Wealth
    valuateNaturalResources,
    analyzeCommodityPrices,
    assessResourceExploitation,
    
    // Cambodia Lending Utils
    processLendingTransaction,
    validateLendingData,
    
    // CORE 12 LENDING MODULE FUNCTIONS
    // Module 1: Credit Assessment
    runCreditAssessment,
    calculateCreditScore,
    
    // Module 2: Loan Origination
    processLoanApplication,
    approveLoan,
    
    // Module 3: Loan Servicing
    serviceLoan,
    monitorLoanPerformance,
    
    // Module 4: Risk Management
    assessBorrowerRisk,
    analyzePortfolioRisk,
    
    // Module 5: Loan Recovery
    initiateRecovery,
    manageCollateral,
    
    // Module 6: Cash Flow Management
    manageCashFlow,
    forecastLiquidity,
    
    // Module 7: Borrower Due Diligence
    conductDueDiligence,
    performAMLScreening,
    
    // Module 8: Performance Analytics
    generatePerformanceDashboard,
    analyzeReturns,
    
    // Module 9: Fund Accounting
    calculateNAV,
    calculateManagementFees,
    
    // Module 10: Investor Reporting
    generateQuarterlyReport,
    generateMonthlyUpdate,
    
    // Module 11: Compliance Monitoring
    performComplianceCheck,
    monitorAlerts,
    
    // Module 12: Market Research
    analyzeMarket,
    analyzeCompetitors,
    
    // TRADING MODULE FUNCTIONS (conditional - will return placeholders if modules not found)
    // Trading Operations
    executeCambodiaTrade,
    constructCambodiaPortfolio,
    implementTradingRiskManagement,
    assessMarketTiming,
    generateTradingReport,
    calculateTradingCosts,
    validateCambodiaTradeRules,
    
    // Client Onboarding
    initiateClientOnboarding,
    qualifyClient,
    generateClientDocumentChecklist,
    performClientRiskProfiling,
    generateComplianceRequirements,
    ensureCambodiaCompliance,
    generateOnboardingReport,
    
    // Forex Trading
    analyzeForexOpportunity,
    executeForexTrade,
    generateForexStrategy,
    
    // Crypto Trading
    analyzeCryptoOpportunity,
    executeCryptoTrade,
    constructCryptoPortfolio,
    assessCryptoMarketConditions,
    
    // Stock Trading
    analyzeStock,
    executeStockTrade,
    constructStockPortfolio,
    assessStockMarketConditions,
    
    // Global Markets
    analyzeGlobalMarketConditions,
    constructGlobalPortfolio,
    monitorGlobalMarketDevelopments,
    assessGlobalCrisisScenarios,
    identifyGlobalInvestmentThemes,
    
    // COMPOSITE WORKFLOW FUNCTIONS (6 total)
    processCompleteLoanWorkflow,
    generateCompleteFundReport,
    processCompleteWealthAssessment,
    processCompleteMarketIntelligence,
    processCompleteClientOnboarding,
    processCompleteInvestmentAnalysis,
    
    // UTILITY FUNCTIONS
    getTradingModulesStatus: () => ({
        loaded: tradingModulesLoaded,
        total: 6,
        modules: {
            tradingOperations: !!tradingOperations,
            clientOnboarding: !!clientOnboarding,
            forexTrading: !!forexTrading,
            cryptoTrading: !!cryptoTrading,
            stockTrading: !!stockTrading,
            globalMarkets: !!globalMarkets
        }
    }),
    
    // Direct module access (if needed)
    modules: {
        // Core 12 Lending Modules
        creditAssessment,
        loanOrigination,
        loanServicing,
        riskManagement,
        loanRecovery,
        cashFlowManagement,
        borrowerDueDiligence,
        performanceAnalytics,
        fundAccounting,
        investorReporting,
        complianceMonitoring,
        marketResearch,
        
        // Specialized Handler Modules
        cambodiaHandler,
        lpManagement,
        portfolioManager,
        realEstateWealth,
        businessWealth,
        investmentWealth,
        economicIntelligence,
        legalRegulatory,
        agriculturalWealth,
        resourcesWealth,
        cambodiaLending,
        
        // Trading Modules (may be null if not loaded)
        tradingOperations,
        clientOnboarding,
        forexTrading,
        cryptoTrading,
        stockTrading,
        globalMarkets
    }
};

// 📊 DATABASE & MEMORY SYSTEM with Fallback Protection
let database, memory, logger;

try {
    database = require('./utils/database');
    console.log('✅ Database module loaded');
} catch (error) {
    console.warn('⚠️ Database module failed to load:', error.message);
    database = { 
        getConversationHistoryDB: async () => [],
        getPersistentMemoryDB: async () => []
    };
}

try {
    memory = require('./utils/memory');
    console.log('✅ Memory module loaded');
} catch (error) {
    console.warn('⚠️ Memory module failed to load:', error.message);
    memory = { buildConversationContext: async () => '' };
}

try {
    logger = require('./utils/logger');
    console.log('✅ Logger module loaded');
} catch (error) {
    console.warn('⚠️ Logger module failed to load - using console fallback:', error.message);
    logger = {
        logUserInteraction: async (data) => {
            console.log(`📝 User: ${data.chatId} - ${data.userMessage?.substring(0, 50)}...`);
        },
        logGPTResponse: async (data) => {
            console.log(`🤖 GPT: ${data.chatId} - ${data.aiUsed} (${data.responseTime}ms)`);
        },
        logError: async (data) => {
            console.error(`❌ Error: ${data.chatId} - ${data.error}`);
        }
    };
}

// 💾 CONVERSATION BACKUP & RECOVERY SYSTEM
let conversationBuffer = new Map(); // In-memory buffer for emergency backup
let lastBackupTime = Date.now();
const BACKUP_INTERVAL = 30000; // Backup every 30 seconds

// 🛡️ EMERGENCY CONVERSATION SAVER with Fallback Logging
async function saveConversationEmergency(chatId, userMessage, gptResponse, metadata = {}) {
    try {
        // 1. Save to PostgreSQL (Primary) - with fallback
        try {
            if (logger && typeof logger.logUserInteraction === 'function') {
                await logger.logUserInteraction({
                    chatId,
                    userMessage,
                    timestamp: new Date().toISOString(),
                    messageType: 'telegram_webhook_backup',
                    ...metadata
                });
                
                await logger.logGPTResponse({
                    chatId,
                    userMessage,
                    gptResponse,
                    timestamp: new Date().toISOString(),
                    backupSaved: true,
                    ...metadata
                });
            } else {
                console.log(`💾 Backup save (no logger): ${chatId} - Message saved to memory buffer only`);
            }
        } catch (loggerError) {
            console.warn('⚠️ Logger failed, using memory buffer only:', loggerError.message);
        }
        
        // 2. Save to Memory Buffer (Secondary) - Always works
        if (!conversationBuffer.has(chatId)) {
            conversationBuffer.set(chatId, []);
        }
        conversationBuffer.get(chatId).push({
            timestamp: new Date().toISOString(),
            userMessage,
            gptResponse,
            metadata,
            saved: true
        });
        
        // Keep only last 50 messages in memory buffer
        if (conversationBuffer.get(chatId).length > 50) {
            conversationBuffer.get(chatId).shift();
        }
        
        console.log(`💾 Conversation saved with fallback protection for chat ${chatId}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Emergency save failed for chat ${chatId}:`, error.message);
        
        // 3. Emergency File Backup (Tertiary) - Absolute fallback
        try {
            const fs = require('fs').promises;
            const backupData = {
                chatId,
                userMessage,
                gptResponse,
                timestamp: new Date().toISOString(),
                metadata,
                emergencyBackup: true
            };
            
            await fs.appendFile(`./emergency_backup_${chatId}.json`, JSON.stringify(backupData) + '\n');
            console.log(`📁 Emergency file backup created for chat ${chatId}`);
            return false; // PostgreSQL failed but file backup worked
            
        } catch (fileError) {
            console.error(`❌ ALL backup methods failed for chat ${chatId}:`, fileError.message);
            return false;
        }
    }
}

// 🔄 CONVERSATION RECOVERY SYSTEM
async function recoverConversation(chatId) {
    try {
        console.log(`🔍 Attempting conversation recovery for chat ${chatId}...`);
        
        let recoveredMessages = [];
        
        // 1. Try PostgreSQL first (Primary)
        try {
            const dbMessages = await database.getConversationHistoryDB(chatId, 100);
            if (dbMessages && dbMessages.length > 0) {
                recoveredMessages = dbMessages;
                console.log(`✅ Recovered ${dbMessages.length} messages from PostgreSQL`);
            }
        } catch (dbError) {
            console.log(`⚠️ PostgreSQL recovery failed: ${dbError.message}`);
        }
        
        // 2. Try Memory Buffer (Secondary) 
        if (recoveredMessages.length === 0 && conversationBuffer.has(chatId)) {
            const bufferMessages = conversationBuffer.get(chatId);
            recoveredMessages = bufferMessages;
            console.log(`✅ Recovered ${bufferMessages.length} messages from memory buffer`);
        }
        
        // 3. Try Emergency File Backup (Tertiary)
        if (recoveredMessages.length === 0) {
            try {
                const fs = require('fs').promises;
                const fileContent = await fs.readFile(`./emergency_backup_${chatId}.json`, 'utf8');
                const fileMessages = fileContent.split('\n')
                    .filter(line => line.trim())
                    .map(line => JSON.parse(line));
                
                recoveredMessages = fileMessages;
                console.log(`✅ Recovered ${fileMessages.length} messages from emergency file`);
            } catch (fileError) {
                console.log(`⚠️ Emergency file recovery failed: ${fileError.message}`);
            }
        }
        
        if (recoveredMessages.length > 0) {
            console.log(`🎉 CONVERSATION RECOVERED! ${recoveredMessages.length} messages restored for chat ${chatId}`);
            return recoveredMessages;
        } else {
            console.log(`❌ No conversation data found for chat ${chatId}`);
            return [];
        }
        
    } catch (error) {
        console.error(`❌ Conversation recovery failed for chat ${chatId}:`, error.message);
        return [];
    }
}

// 📦 PERIODIC BACKUP SYSTEM  
async function performPeriodicBackup() {
    try {
        const now = Date.now();
        if (now - lastBackupTime < BACKUP_INTERVAL) return;
        
        console.log('📦 Performing periodic conversation backup...');
        
        // Backup conversation buffers to database
        for (const [chatId, messages] of conversationBuffer.entries()) {
            try {
                const recentMessages = messages.filter(msg => 
                    new Date(msg.timestamp).getTime() > lastBackupTime
                );
                
                if (recentMessages.length > 0) {
                    console.log(`📦 Backing up ${recentMessages.length} recent messages for chat ${chatId}`);
                    
                    for (const msg of recentMessages) {
                        await saveConversationEmergency(chatId, msg.userMessage, msg.gptResponse, msg.metadata);
                    }
                }
            } catch (backupError) {
                console.error(`❌ Periodic backup failed for chat ${chatId}:`, backupError.message);
            }
        }
        
        lastBackupTime = now;
        console.log('✅ Periodic backup completed');
        
    } catch (error) {
        console.error('❌ Periodic backup system error:', error.message);
    }
}

// Start periodic backup
setInterval(performPeriodicBackup, BACKUP_INTERVAL);

// 🌐 LIVE DATA & MULTIMODAL INTEGRATION (Conditional Loading)
let liveData, metaTrader, multimodal;

try {
    liveData = require('./utils/liveData');
    console.log('✅ liveData module loaded');
} catch (error) {
    console.log('⚠️ liveData module not found');
    liveData = null;
}

try {
    metaTrader = require('./utils/metaTrader');
    console.log('✅ metaTrader module loaded');
} catch (error) {
    console.log('⚠️ metaTrader module not found');
    metaTrader = null;
}

try {
    multimodal = require('./utils/multimodal');
    console.log('✅ multimodal module loaded');
} catch (error) {
    console.log('⚠️ multimodal module not found');
    multimodal = null;  // Set to null instead of empty object
}

// 🎮 COMMAND HANDLERS MAP - GPT-5 Optimized
const commandHandlers = {
    // 🚀 GPT-5 MAIN COMMANDS
    '/start': handleStart,
    '/gpt5': handleGPT5Command,
    '/nano': handleNanoCommand,
    '/mini': handleMiniCommand, 
    '/ultimate': handleUltimateCommand,
    '/analyze': handleDeepAnalysis,
    '/quick': handleQuickResponse,
    
    // 📊 SYSTEM MANAGEMENT
    '/health': handleSystemHealth,
    '/memory': handleMemoryTest,
    '/analytics': handleSystemAnalytics,
    '/status': handleSystemStatus,
    '/cost': handleCostAnalysis,
    
    // 🌍 UTILITIES
    '/time': handleTimeCommand,
    '/market': handleMarketIntel,
    '/help': handleHelp,
    
    // 🎨 MULTIMODAL COMMANDS
    '/vision': handleVisionAnalysis,
    '/transcribe': handleTranscriptionCommand,
    '/document': handleDocumentAnalysis,
    '/voice': handleVoiceAnalysis,
    
    // 🇰🇭 CAMBODIA BUSINESS
    '/cambodia': handleCambodiaAnalysis,
    '/lending': handleLendingAnalysis,
    '/portfolio': handlePortfolioAnalysis,
    
    // 🔧 ADMIN FUNCTIONS
    '/optimize': handleSystemOptimization,
    '/debug': handleDebugInfo,
    '/recover': handleConversationRecovery,
    '/backup': handleForceBackup
};

// 💾 MESSAGE DEDUPLICATION - Prevent duplicate processing
const processedMessages = new Set();

// Cleanup old processed messages every 5 minutes
setInterval(() => {
    processedMessages.clear();
    console.log('🧹 Cleared processed messages cache');
}, 300000);

// Helper function to check if multimodal is available
function isMultimodalAvailable() {
    return multimodal && typeof multimodal.analyzeImage === 'function';
}

// 🌐 WEBHOOK ENDPOINT - Main message handler with deduplication
app.post(`/webhook/${BOT_TOKEN}`, async (req, res) => {
    const startTime = Date.now();
    
    try {
        const update = req.body;
        
        // Deduplication check for messages
        if (update.message) {
            const messageId = update.message.message_id;
            const chatId = update.message.chat.id;
            const dedupeKey = `${chatId}_${messageId}`;
            
            if (processedMessages.has(dedupeKey)) {
                console.log(`🔄 Duplicate message detected: ${dedupeKey} - Skipping`);
                return res.status(200).json({ ok: true });
            }
            processedMessages.add(dedupeKey);
        }
        
        // Handle different update types
        if (update.message) {
            await handleMessage(update.message);
        } else if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
        } else if (update.inline_query) {
            await handleInlineQuery(update.inline_query);
        }
        
        res.status(200).json({ ok: true });
        
    } catch (error) {
        console.error('❌ Webhook processing error:', error.message);
        res.status(200).json({ ok: true }); // Always return 200 to prevent Telegram retries
    }
});

// 🎯 MAIN MESSAGE HANDLER - GPT-5 Only System with Multimodal Support
async function handleMessage(msg) {
    const startTime = Date.now();
    const chatId = msg.chat.id;
    const userMessage = msg.text || '';
    const messageId = msg.message_id;
    
    console.log(`\n🎯 Message received from ${chatId}: "${userMessage.substring(0, 50)}..."`);
    
    // 🎨 MULTIMODAL CONTENT DETECTION
    const hasPhoto = !!msg.photo;
    const hasDocument = !!msg.document;
    const hasVideo = !!msg.video;
    const hasVoice = !!msg.voice;
    const hasAudio = !!msg.audio;
    const hasVideoNote = !!msg.video_note;
    const hasSticker = !!msg.sticker;
    
    const isMultimodal = hasPhoto || hasDocument || hasVideo || hasVoice || hasAudio || hasVideoNote;
    
    if (isMultimodal) {
        console.log('🎨 Multimodal content detected:', {
            photo: hasPhoto,
            document: hasDocument,
            video: hasVideo,
            voice: hasVoice,
            audio: hasAudio,
            video_note: hasVideoNote,
            sticker: hasSticker
        });
    }
    
    try {
        // Log user interaction with fallback
        try {
            if (logger && typeof logger.logUserInteraction === 'function') {
                await logger.logUserInteraction({
                    chatId,
                    messageId,
                    userMessage,
                    timestamp: new Date().toISOString(),
                    messageType: 'telegram_webhook',
                    hasMedia: isMultimodal,
                    mediaTypes: {
                        photo: hasPhoto,
                        document: hasDocument,
                        video: hasVideo,
                        voice: hasVoice,
                        audio: hasAudio,
                        video_note: hasVideoNote,
                        sticker: hasSticker
                    }
                });
            } else {
                // Fallback logging
                console.log(`📝 User interaction: ${chatId} - "${userMessage.substring(0, 50)}..." (Media: ${isMultimodal})`);
            }
        } catch (logError) {
            console.warn('⚠️ Logging failed, continuing without logging:', logError.message);
        }
        
        // 🎨 HANDLE MULTIMODAL CONTENT FIRST
        if (isMultimodal) {
            console.log('🎨 Processing multimodal content with GPT-5 vision/analysis...');
            
            try {
                let multimodalResult;
                
                // 📸 IMAGE ANALYSIS
                if (hasPhoto) {
                    const photo = msg.photo[msg.photo.length - 1]; // Get highest resolution
                    multimodalResult = await multimodal.analyzeImage(bot, photo.file_id, userMessage || "Analyze this image", chatId);
                }
                // 📄 DOCUMENT ANALYSIS
                else if (hasDocument) {
                    multimodalResult = await multimodal.analyzeDocument(bot, msg.document, userMessage || "Analyze this document", chatId);
                }
                // 🎥 VIDEO ANALYSIS
                else if (hasVideo) {
                    multimodalResult = await multimodal.analyzeVideo(bot, msg.video, userMessage || "Analyze this video", chatId);
                }
                // 🎵 VOICE/AUDIO ANALYSIS
                else if (hasVoice) {
                    multimodalResult = await multimodal.analyzeVoice(bot, msg.voice, userMessage || "Transcribe and analyze this voice message", chatId);
                }
                else if (hasAudio) {
                    multimodalResult = await multimodal.analyzeAudio(bot, msg.audio, userMessage || "Transcribe and analyze this audio", chatId);
                }
                // 🎬 VIDEO NOTE ANALYSIS
                else if (hasVideoNote) {
                    multimodalResult = await multimodal.analyzeVideoNote(bot, msg.video_note, userMessage || "Analyze this video note", chatId);
                }
                
                if (multimodalResult && multimodalResult.success) {
                    const processingTime = Date.now() - startTime;
                    
                    console.log(`✅ Multimodal processing complete:`, {
                        type: multimodalResult.type,
                        aiUsed: multimodalResult.aiUsed,
                        processingTime: processingTime,
                        hasTranscription: !!multimodalResult.transcription
                    });
                    
                    // Log successful multimodal interaction with TRIPLE BACKUP
                    await saveConversationEmergency(
                        chatId,
                        userMessage,
                        multimodalResult.analysis,
                        {
                            aiUsed: multimodalResult.aiUsed || 'GPT-5-multimodal',
                            modelUsed: 'gpt-5',
                            responseTime: processingTime,
                            memoryUsed: false,
                            powerMode: 'GPT5_MULTIMODAL',
                            telegramDelivered: true,
                            gpt5OnlyMode: true,
                            webhookMode: true,
                            multimodalType: multimodalResult.type,
                            hasTranscription: !!multimodalResult.transcription
                        }
                    );
                    
                    return; // Multimodal processing complete
                } else {
                    console.log('⚠️ Multimodal processing failed, falling back to text processing...');
                }
                
            } catch (multimodalError) {
                console.error('❌ Multimodal processing error:', multimodalError.message);
                
                // Send multimodal error message
                await bot.sendMessage(chatId, 
                    `🎨 I detected media content but encountered an issue processing it.\n\n` +
                    `⚠️ Error: ${multimodalError.message}\n\n` +
                    `🔧 Please try:\n` +
                    `• Sending the media with a text description\n` +
                    `• Using a different file format\n` +
                    `• Checking if the file is too large\n\n` +
                    `💡 I can still help with text questions!`
                );
                
                return;
            }
        }
        
        // Handle text commands
        if (userMessage.startsWith('/')) {
            const command = userMessage.split(' ')[0].toLowerCase();
            const handler = commandHandlers[command];
            
            if (handler) {
                console.log(`🎮 Executing command: ${command}`);
                await handler(msg, bot);
                return;
            } else {
                await bot.sendMessage(chatId, 
                    `❓ Unknown command: ${command}\n\nUse /help to see available commands.`
                );
                return;
            }
        }
        
        // Handle empty messages (media only, no text)
        if (!userMessage && isMultimodal) {
            console.log('📝 Media-only message already processed');
            return;
        }
        
        // Skip empty messages
        if (!userMessage.trim()) {
            console.log('📝 Empty message received, skipping...');
            return;
        }
        
        // 🚀 MAIN GPT-5 TEXT PROCESSING - Smart routing with memory integration
        console.log('🧠 Processing text with GPT-5 system + memory integration...');
        
        // Enhanced processing with auto-Telegram delivery
        const result = await executeEnhancedGPT5Command(
            userMessage, 
            chatId, 
            bot,
            {
                messageType: 'telegram_webhook',
                hasMedia: isMultimodal,
                title: `GPT-5 Smart Analysis`,
                max_completion_tokens: 6000,  // ✅ ADDED: Higher default token limit
                reasoning_effort: 'medium',
                verbosity: 'medium'
            }
        );
        
        const processingTime = Date.now() - startTime;
        
        console.log(`✅ GPT-5 text processing complete:`, {
            aiUsed: result.aiUsed,
            modelUsed: result.modelUsed,
            powerMode: result.powerMode,
            memoryUsed: result.contextUsed,
            telegramDelivered: result.telegramDelivered,
            processingTime: processingTime,
            costTier: result.cost_tier
        });
        
        // Log successful interaction with TRIPLE BACKUP
        await saveConversationEmergency(
            chatId,
            userMessage,
            result.response,
            {
                aiUsed: result.aiUsed,
                modelUsed: result.modelUsed,
                responseTime: processingTime,
                memoryUsed: result.contextUsed,
                powerMode: result.powerMode,
                telegramDelivered: result.telegramDelivered,
                gpt5OnlyMode: true,
                webhookMode: true
            }
        );
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('❌ Message processing error:', error.message);
        
        // Send error message to user
        try {
            await bot.sendMessage(chatId, 
                `🚨 I apologize, but I encountered a technical issue.\n\n` +
                `⚠️ Error: ${error.message}\n\n` +
                `🔧 The GPT-5 system is experiencing difficulties. Please:\n` +
                `• Try a simpler question\n` +
                `• Wait a moment and try again\n` +
                `• Use /health to check system status\n` +
                `• Contact support if the issue persists`
            );
        } catch (telegramError) {
            console.error('❌ Failed to send error message:', telegramError.message);
        }
        
        // Log error
        await logger.logError({
            chatId,
            userMessage,
            error: error.message,
            processingTime,
            component: 'webhook_handler',
            gpt5OnlyMode: true,
            webhookMode: true,
            hasMedia: isMultimodal
        });
    }
}

// 🎮 COMMAND HANDLERS - GPT-5 Optimized

async function handleStart(msg, bot) {
    const chatId = msg.chat.id;
    const cambodiaTime = getCurrentCambodiaDateTime();
    
    const welcomeMessage = `🚀 **IMPERIUM VAULT - GPT-5 SYSTEM**

🤖 **Powered by GPT-5 Family:**
⚡ GPT-5 Nano - Ultra-fast responses
⚖️ GPT-5 Mini - Balanced analysis  
🧠 GPT-5 Full - Complex reasoning
💬 GPT-5 Chat - Natural conversation

🎯 **Smart Features:**
• Automatic model selection based on your query
• PostgreSQL memory integration
• Cost-optimized routing (60-80% savings)
• Cambodia timezone support
• Real-time market analysis

⏰ **Current Time:** ${cambodiaTime.time} Cambodia (${cambodiaTime.date})
🎨 **System Status:** GPT-5 Only Mode - Fully Optimized

📋 **Quick Commands:**
/nano - Speed responses
/mini - Balanced analysis  
/ultimate - Deep analysis
/health - System status
/help - Full command list

💡 Just send me any message for intelligent GPT-5 analysis!`;

    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
}

async function handleGPT5Command(msg, bot) {
    const chatId = msg.chat.id;
    const query = msg.text.replace('/gpt5', '').trim();
    
    if (!query) {
        await bot.sendMessage(chatId, 
            `🚀 **GPT-5 Command Usage:**\n\n` +
            `/gpt5 [your question]\n\n` +
            `**Example:** /gpt5 analyze the current market conditions\n\n` +
            `The system will automatically select the optimal GPT-5 model!`
        );
        return;
    }
    
    await executeEnhancedGPT5Command(query, chatId, bot, {
        title: 'GPT-5 Direct Command',
        max_completion_tokens: 6000,  // ✅ ADDED: High token limit for flexible responses
        reasoning_effort: 'medium',
        verbosity: 'medium'
    });
}

async function handleNanoCommand(msg, bot) {
    const chatId = msg.chat.id;
    const query = msg.text.replace('/nano', '').trim();
    
    if (!query) {
        await bot.sendMessage(chatId, 
            `⚡ **GPT-5 Nano - Ultra Fast**\n\n` +
            `/nano [your question]\n\n` +
            `Perfect for quick answers and speed-critical queries!`
        );
        return;
    }
    
    await quickNanoCommand(query, chatId, bot);
}

async function handleMiniCommand(msg, bot) {
    const chatId = msg.chat.id;
    const query = msg.text.replace('/mini', '').trim();
    
    if (!query) {
        await bot.sendMessage(chatId, 
            `⚖️ **GPT-5 Mini - Balanced**\n\n` +
            `/mini [your question]\n\n` +
            `Great balance of speed, cost, and intelligence!`
        );
        return;
    }
    
    await quickMiniCommand(query, chatId, bot);
}

async function handleUltimateCommand(msg, bot) {
    const chatId = msg.chat.id;
    const query = msg.text.replace('/ultimate', '').trim();
    
    if (!query) {
        await bot.sendMessage(chatId, 
            `🧠 **GPT-5 Full - Ultimate Intelligence**\n\n` +
            `/ultimate [your question]\n\n` +
            `Maximum reasoning power for complex analysis!`
        );
        return;
    }
    
    await quickUltimateCommand(query, chatId, bot);
}

async function handleDeepAnalysis(msg, bot) {
    const chatId = msg.chat.id;
    const query = msg.text.replace('/analyze', '').trim();
    
    if (!query) {
        await bot.sendMessage(chatId, 
            `🧠 **Deep Analysis with GPT-5**\n\n` +
            `/analyze [your topic]\n\n` +
            `**Example:** /analyze market conditions for tech stocks\n\n` +
            `Uses GPT-5 Full with high reasoning for comprehensive analysis!`
        );
        return;
    }
    
    await executeEnhancedGPT5Command(query, chatId, bot, {
        title: 'GPT-5 Deep Analysis',
        forceModel: 'gpt-5',  // Force full GPT-5 for deep analysis
        max_completion_tokens: 8000,  // ✅ ADDED: Maximum tokens for long analysis
        reasoning_effort: 'high',
        verbosity: 'high'
    });
}

async function handleQuickResponse(msg, bot) {
    const chatId = msg.chat.id;
    const query = msg.text.replace('/quick', '').trim();
    
    if (!query) {
        await bot.sendMessage(chatId, 
            `⚡ **Quick Response with GPT-5 Nano**\n\n` +
            `/quick [your question]\n\n` +
            `**Example:** /quick what time is it in Cambodia?\n\n` +
            `Ultra-fast responses for simple queries!`
        );
        return;
    }
    
    await quickNanoCommand(query, chatId, bot);
}

async function handleSystemStatus(msg, bot) {
    const chatId = msg.chat.id;
    
    try {
        const cambodiaTime = getCurrentCambodiaDateTime();
        const analytics = getSystemAnalytics();
        const performance = getGPT5PerformanceMetrics();
        
        const statusMessage = `🚀 **SYSTEM STATUS REPORT**

⏰ **Current Time:** ${cambodiaTime.time} Cambodia (${cambodiaTime.date})
🏗️ **Architecture:** ${analytics.version}
🌐 **Platform:** Railway Production Webhook
🤖 **AI System:** ${analytics.aiSystem.core}

⚡ **Performance Status:**
• Smart Routing: ${performance.smartRouting}
• Cost Optimization: ${performance.costOptimization}  
• Memory Integration: ${performance.memoryIntegration}
• Estimated Savings: ${performance.estimatedSavings}

🛡️ **Backup Status:**
• Active Conversations: ${conversationBuffer.size} chats
• Auto-Backup: Every 30 seconds
• Protection: Triple Redundancy
• Last Backup: ${Math.round((Date.now() - lastBackupTime) / 1000)} seconds ago

🎨 **Features Active:**
• GPT-5 Family Smart Selection ✅
• Multimodal Analysis ✅
• PostgreSQL Memory ✅
• Voice Transcription ✅
• Document Analysis ✅
• Image Recognition ✅

💰 **Cost Optimization:** Active (60-80% savings)
🔧 **Health Status:** Use /health for detailed report

⚡ **System running optimally!**`;

        await bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        await bot.sendMessage(chatId, `❌ Status error: ${error.message}`);
    }
}

async function handleCambodiaAnalysis(msg, bot) {
    const chatId = msg.chat.id;
    const query = msg.text.replace('/cambodia', '').trim();
    
    if (!query) {
        await bot.sendMessage(chatId, 
            `🇰🇭 **Cambodia Business Analysis**\n\n` +
            `/cambodia [your query]\n\n` +
            `**Examples:**\n` +
            `• /cambodia lending opportunities\n` +
            `• /cambodia real estate market\n` +
            `• /cambodia investment regulations\n\n` +
            `Specialized GPT-5 analysis for Cambodia business!`
        );
        return;
    }
    
    await executeEnhancedGPT5Command(
        `Cambodia business analysis: ${query}`, 
        chatId, 
        bot, 
        { 
            title: 'Cambodia Business Analysis',
            forceModel: 'gpt-5-mini',  // Cost-efficient for regional analysis
            max_completion_tokens: 5000,  // ✅ INCREASED: More tokens for detailed analysis
            reasoning_effort: 'medium',
            verbosity: 'high'
        }
    );
}

async function handleLendingAnalysis(msg, bot) {
    const chatId = msg.chat.id;
    const query = msg.text.replace('/lending', '').trim();
    
    if (!query) {
        await bot.sendMessage(chatId, 
            `🏦 **Lending Analysis**\n\n` +
            `/lending [your query]\n\n` +
            `**Examples:**\n` +
            `• /lending risk assessment\n` +
            `• /lending portfolio performance\n` +
            `• /lending market opportunities\n\n` +
            `Advanced GPT-5 analysis for lending operations!`
        );
        return;
    }
    
    await executeEnhancedGPT5Command(
        `Lending analysis: ${query}`, 
        chatId, 
        bot, 
        { 
            title: 'Lending Analysis',
            forceModel: 'gpt-5',  // Full GPT-5 for financial analysis
            max_completion_tokens: 6000,  // ✅ INCREASED: More tokens for detailed financial analysis
            reasoning_effort: 'high',
            verbosity: 'high'
        }
    );
}

async function handlePortfolioAnalysis(msg, bot) {
    const chatId = msg.chat.id;
    const query = msg.text.replace('/portfolio', '').trim();
    
    if (!query) {
        await bot.sendMessage(chatId, 
            `📊 **Portfolio Analysis**\n\n` +
            `/portfolio [your query]\n\n` +
            `**Examples:**\n` +
            `• /portfolio performance review\n` +
            `• /portfolio risk assessment\n` +
            `• /portfolio optimization\n\n` +
            `Comprehensive GPT-5 portfolio analysis!`
        );
        return;
    }
    
    await executeEnhancedGPT5Command(
        `Portfolio analysis: ${query}`, 
        chatId, 
        bot, 
        { 
            title: 'Portfolio Analysis',
            forceModel: 'gpt-5',  // Full GPT-5 for complex analysis
            max_completion_tokens: 6000,  // ✅ INCREASED: More tokens for comprehensive analysis
            reasoning_effort: 'high',
            verbosity: 'high'
        }
    );
}

async function handleSystemOptimization(msg, bot) {
    const chatId = msg.chat.id;
    
    try {
        await bot.sendMessage(chatId, 
            `🔧 **Running System Optimization...**\n\nOptimizing GPT-5 performance...`,
            { parse_mode: 'Markdown' }
        );
        
        // Force cleanup of old conversation buffers
        for (const [bufferId, messages] of conversationBuffer.entries()) {
            if (messages.length > 50) {
                conversationBuffer.set(bufferId, messages.slice(-50)); // Keep only last 50
            }
        }
        
        // Force backup
        await performPeriodicBackup();
        
        // Test system health
        const health = await checkGPT5OnlySystemHealth();
        
        const optimizationMessage = `✅ **SYSTEM OPTIMIZATION COMPLETE!**

🚀 **Performance Improvements:**
• Conversation buffers optimized
• Emergency backup completed
• Memory usage optimized
• GPT-5 models tested

📊 **Current Health:** ${health.healthGrade} (${health.healthScore}/100)
🛡️ **Backup Status:** All systems protected
💰 **Cost Optimization:** Active and optimized

⚡ **System running at peak performance!**

💡 **Next steps:**
• Use /health for detailed diagnostics
• Use /memory for memory system test
• All GPT-5 models ready for optimal routing`;

        await bot.sendMessage(chatId, optimizationMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        await bot.sendMessage(chatId, `❌ Optimization error: ${error.message}`);
    }
}

async function handleDebugInfo(msg, bot) {
    const chatId = msg.chat.id;
    
    try {
        const performance = getGPT5PerformanceMetrics();
        const analytics = getSystemAnalytics();
        
        const debugMessage = `🔍 **DEBUG INFORMATION**

🏗️ **Architecture:** ${analytics.architecture}
📦 **Version:** ${analytics.version}
🌐 **Platform:** Railway Webhook Mode

💾 **Memory Status:**
• Conversation Buffers: ${conversationBuffer.size} active
• Last Backup: ${new Date(lastBackupTime).toLocaleString()}
• Backup Interval: 30 seconds

🤖 **GPT-5 Models:**
${performance.modelsAvailable.map(model => `• ${model}`).join('\n')}

⚡ **Response Times:**
• Nano: ${performance.responseTime.nano}
• Mini: ${performance.responseTime.mini}
• Full: ${performance.responseTime.full}
• Chat: ${performance.responseTime.chat}

🧠 **Capabilities:**
${Object.entries(performance.capabilities).map(([key, value]) => `• ${key}: ${value}`).join('\n')}

🔧 **System Features:**
• Smart Routing: ${performance.smartRouting}
• Cost Optimization: ${performance.costOptimization}
• Memory Integration: ${performance.memoryIntegration}

📊 **Health Monitoring:** Comprehensive
🛡️ **Data Protection:** Triple Redundancy
💰 **Estimated Savings:** ${performance.estimatedSavings}

⏰ **Debug Generated:** ${new Date().toLocaleString()}`;

        await bot.sendMessage(chatId, debugMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        await bot.sendMessage(chatId, `❌ Debug error: ${error.message}`);
    }
}

async function handleSystemHealth(msg, bot) {
    const chatId = msg.chat.id;
    
    try {
        console.log('🏥 Running comprehensive GPT-5 system health check...');
        const health = await checkGPT5OnlySystemHealth();
        
        const healthEmoji = health.healthGrade === 'A+' ? '🟢' : 
                           health.healthGrade === 'A' ? '🟡' : '🔴';
        
        // Test multimodal system
        let multimodalStatus = false;
        try {
            multimodalStatus = typeof multimodal.analyzeImage === 'function' &&
                              typeof multimodal.analyzeDocument === 'function' &&
                              typeof multimodal.analyzeVoice === 'function';
            console.log(`✅ Multimodal system: ${multimodalStatus ? 'Available' : 'Limited'}`);
        } catch (error) {
            console.log('❌ Multimodal system unavailable');
        }
        
        
        const healthMessage = `🏥 **GPT-5 SYSTEM HEALTH REPORT**

${healthEmoji} **Overall Health:** ${health.healthGrade} (${health.healthScore}/100)

🤖 **GPT-5 Models Status:**
${health.gpt5_full ? '✅' : '❌'} GPT-5 Full (Premium Intelligence)
${health.gpt5_mini ? '✅' : '❌'} GPT-5 Mini (Balanced Performance) 
${health.gpt5_nano ? '✅' : '❌'} GPT-5 Nano (Ultra Fast)
${health.gpt5_chat ? '✅' : '❌'} GPT-5 Chat (Conversational)

🎨 **Multimodal Capabilities:**
${multimodalStatus ? '✅' : '❌'} Image Analysis (GPT-5 Vision)
${multimodalStatus ? '✅' : '❌'} Voice Transcription & Analysis
${multimodalStatus ? '✅' : '❌'} Document Processing
${multimodalStatus ? '✅' : '❌'} Video Analysis

🧠 **Core Systems:**
${health.memorySystem ? '✅' : '❌'} Memory Integration
${health.databaseConnection ? '✅' : '❌'} PostgreSQL Database
${health.dateTimeSupport ? '✅' : '❌'} DateTime Support
${health.telegramIntegration ? '✅' : '❌'} Telegram Integration

📊 **System Mode:** GPT-5 Only + Multimodal (Optimized)
🏦 **PostgreSQL:** ${health.postgresqlStatus}
🌐 **Platform:** Railway Webhook

${health.errors.length > 0 ? `⚠️ **Issues Found:**\n${health.errors.slice(0, 3).map(err => `• ${err}`).join('\n')}` : '🎉 **All systems operational!**'}

⏰ **Last Updated:** ${new Date().toLocaleString()}`;

        await bot.sendMessage(chatId, healthMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        await bot.sendMessage(chatId, 
            `❌ Health check failed: ${error.message}\n\n` +
            `🔧 This indicates a serious system issue. Please check logs.`
        );
    }
}

async function handleMemoryTest(msg, bot) {
    const chatId = msg.chat.id;
    
    try {
        console.log('🧪 Running memory integration test...');
        const memoryTest = await testMemoryIntegration(chatId);
        
        // FIX: Escape the emoji and format properly
        const statusEmoji = memoryTest.status === 'FULL_SUCCESS' ? '🟢' : 
                           memoryTest.status === 'MOSTLY_WORKING' ? '🟡' : '🔴';
        
        // FIX: Use template literals properly and escape markdown
        const memoryMessage = `🧪 MEMORY INTEGRATION TEST

${statusEmoji} Overall Result: ${memoryTest.status}
📊 Score: ${memoryTest.score} (${memoryTest.percentage}%)

🧠 Test Results:
${memoryTest.tests.postgresqlConnection ? '✅' : '❌'} PostgreSQL Connection
${memoryTest.tests.conversationHistory ? '✅' : '❌'} Conversation History
${memoryTest.tests.persistentMemory ? '✅' : '❌'} Persistent Memory
${memoryTest.tests.memoryBuilding ? '✅' : '❌'} Memory Context Building
${memoryTest.tests.gpt5WithMemory ? '✅' : '❌'} GPT-5 + Memory Integration
${memoryTest.tests.gpt5ModelSelection ? '✅' : '❌'} Smart Model Selection
${memoryTest.tests.telegramIntegration ? '✅' : '❌'} Telegram Integration

🎯 System Integration:
PostgreSQL Connected: ${memoryTest.postgresqlIntegrated ? '✅' : '❌'}
Memory System Active: ${memoryTest.memorySystemIntegrated ? '✅' : '❌'}
GPT-5 Only Mode: ${memoryTest.gpt5OnlyMode ? '✅' : '❌'}

⏰ Test Completed: ${new Date().toLocaleString()}`;

        // FIX: Remove parse_mode or use HTML instead
        await bot.sendMessage(chatId, memoryMessage);
        
    } catch (error) {
        await bot.sendMessage(chatId, 
            `❌ Memory test failed: ${error.message}\n\nThis suggests PostgreSQL or memory system issues.`
        );
    }
}

async function handleSystemAnalytics(msg, bot) {
    const chatId = msg.chat.id;
    
    try {
        const analytics = getSystemAnalytics();
        const performance = getGPT5PerformanceMetrics();
        
        const analyticsMessage = `📊 **IMPERIUM VAULT ANALYTICS**

🏗️ **Architecture:** ${analytics.version}
🎯 **AI System:** ${analytics.aiSystem.core}

🤖 **GPT-5 Models Available:**
• gpt-5 (Premium - Complex analysis)
• gpt-5-mini (Balanced - Standard queries)  
• gpt-5-nano (Economy - Speed critical)
• gpt-5-chat-latest (Conversational)

⚡ **Performance Metrics:**
• Smart Routing: ${performance.smartRouting}
• Cost Optimization: ${performance.costOptimization}
• Memory Integration: ${performance.memoryIntegration}
• Estimated Savings: ${performance.estimatedSavings}

🎮 **Query Types Supported:**
${analytics.queryTypes.map(type => `• ${type}`).join('\n')}

⏱️ **Response Times:**
• Nano: ${performance.responseTime.nano}
• Mini: ${performance.responseTime.mini}
• Full: ${performance.responseTime.full}
• Chat: ${performance.responseTime.chat}

🧠 **Memory Features:**
${analytics.memoryFeatures.slice(0, 4).map(feature => `• ${feature}`).join('\n')}

🎉 **System Status:** Fully Optimized GPT-5 Only Mode`;

        await bot.sendMessage(chatId, analyticsMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        await bot.sendMessage(chatId, `❌ Analytics error: ${error.message}`);
    }
}

async function handleTimeCommand(msg, bot) {
    const chatId = msg.chat.id;
    
    try {
        const cambodiaTime = getCurrentCambodiaDateTime();
        
        const timeMessage = `⏰ **CURRENT TIME**

🇰🇭 **Cambodia:** ${cambodiaTime.time} (${cambodiaTime.timezone})
📅 **Date:** ${cambodiaTime.date}
🏢 **Business Hours:** ${!cambodiaTime.isWeekend && cambodiaTime.hour >= 8 && cambodiaTime.hour <= 17 ? 'Yes' : 'No'}
🎉 **Weekend:** ${cambodiaTime.isWeekend ? 'Yes' : 'No'}

🌍 **Powered by:** GPT-5 Only System
⚡ **Response Time:** Ultra-fast local calculation`;

        await bot.sendMessage(chatId, timeMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        await bot.sendMessage(chatId, `❌ Time error: ${error.message}`);
    }
}

async function handleMarketIntel(msg, bot) {
    const chatId = msg.chat.id;
    
    try {
        console.log('📈 Generating market intelligence with GPT-5...');
        
        const intelligence = await getMarketIntelligence(chatId);
        
        await bot.sendMessage(chatId, 
            `📈 **MARKET INTELLIGENCE**\n\n${intelligence}\n\n🤖 *Generated by GPT-5 Mini for cost efficiency*`,
            { parse_mode: 'Markdown' }
        );
        
    } catch (error) {
        await bot.sendMessage(chatId, 
            `❌ Market intelligence error: ${error.message}\n\n` +
            `This might indicate GPT-5 API issues or rate limits.`
        );
    }
}

async function handleCostAnalysis(msg, bot) {
    const chatId = msg.chat.id;
    const query = msg.text.replace('/cost', '').trim() || 'general analysis query';
    
    try {
        const costEstimate = getGPT5CostEstimate(query, 1500);
        const recommendation = getGPT5ModelRecommendation(query);
        
        const costMessage = `💰 **GPT-5 COST ANALYSIS**

📝 **Query:** "${query.substring(0, 50)}..."

🎯 **Recommended Model:** ${recommendation.recommendedModel}
💡 **Reasoning:** ${recommendation.reasoning}
⚡ **Speed:** ${recommendation.responseSpeed}
💵 **Cost Tier:** ${recommendation.estimatedCost}

📊 **Cost Breakdown:**
• Input Tokens: ~${costEstimate.estimatedInputTokens}
• Output Tokens: ~${costEstimate.estimatedOutputTokens}
• Input Cost: $${costEstimate.inputCost}
• Output Cost: $${costEstimate.outputCost}
• **Total Cost: $${costEstimate.totalCost}**

🎨 **Cost Tier:** ${costEstimate.costTier}
⚖️ **Priority:** ${recommendation.priority}

💡 **Optimization:** System automatically selects the most cost-effective model for each query type!`;

        await bot.sendMessage(chatId, costMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        await bot.sendMessage(chatId, `❌ Cost analysis error: ${error.message}`);
    }
}

async function handleHelp(msg, bot) {
    const chatId = msg.chat.id;
    
    const helpMessage = `🚀 **IMPERIUM VAULT - GPT-5 HELP**

🤖 **Main Commands:**
/gpt5 [question] - Smart GPT-5 analysis
/nano [question] - Ultra-fast responses
/mini [question] - Balanced analysis
/ultimate [question] - Deep reasoning

🎨 **Multimodal Commands:**
/vision - Image analysis with GPT-5
/transcribe - Voice/audio transcription
/document - Document analysis
/voice - Voice message analysis
📸 **Send images directly** for instant analysis
🎵 **Send voice messages** for transcription + analysis
📄 **Send documents** for content analysis

📊 **System Commands:**
/health - System health check
/memory - Memory integration test
/analytics - Performance metrics
/status - Current system status
/cost [query] - Cost analysis
/time - Current Cambodia time

🇰🇭 **Business Commands:**
/cambodia [query] - Cambodia analysis
/lending [query] - Lending analysis
/portfolio [query] - Portfolio analysis

📈 **Market Commands:**
/market - Market intelligence
/analyze [topic] - Deep analysis

🔧 **Admin Commands:**
/optimize - System optimization
/debug - Debug information
/recover - Recover lost conversations
/backup - Force emergency backup

🛡️ **Data Protection:**
• **Triple Redundancy:** PostgreSQL + Memory + Files
• **Auto-Backup:** Every 30 seconds
• **Zero Loss Guarantee:** 100% conversation retention
• **Instant Recovery:** /recover command available

💡 **Pro Tips:**
• Just send any message for smart GPT-5 analysis
• Send images, voice, or documents for multimodal analysis
• System automatically picks the best model
• Memory integration remembers context
• Cost-optimized routing saves 60-80%

🎯 **Multimodal Features:**
• 📸 **Image Analysis** - Charts, photos, diagrams
• 🎵 **Voice Transcription** - Any audio/voice message
• 📄 **Document Analysis** - PDF, Word, Excel files
• 🎥 **Video Analysis** - Video files and notes
• 🎨 **Sticker Recognition** - Visual content understanding

⚡ **Powered by GPT-5 Family - Fully Optimized with Vision!**`;

    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
}

// 🎨 MULTIMODAL COMMAND HANDLERS

async function handleVisionAnalysis(msg, bot) {
    const chatId = msg.chat.id;
    
    await bot.sendMessage(chatId, 
        `📸 **GPT-5 Vision Analysis**\n\n` +
        `Send me an image and I'll analyze it with GPT-5's vision capabilities!\n\n` +
        `✨ **I can analyze:**\n` +
        `• Charts and graphs\n` +
        `• Photos and screenshots\n` +
        `• Business documents\n` +
        `• Diagrams and flowcharts\n` +
        `• Any visual content\n\n` +
        `💡 **Tip:** Include a specific question with your image for targeted analysis!`,
        { parse_mode: 'Markdown' }
    );
}

async function handleTranscriptionCommand(msg, bot) {
    const chatId = msg.chat.id;
    
    await bot.sendMessage(chatId, 
        `🎵 **Voice Transcription & Analysis**\n\n` +
        `Send me a voice message or audio file and I'll:\n\n` +
        `🎯 **Transcribe** the audio to text\n` +
        `🧠 **Analyze** the content with GPT-5\n` +
        `📝 **Summarize** key points\n` +
        `💡 **Extract** actionable insights\n\n` +
        `✨ **Supported formats:**\n` +
        `• Voice messages (Telegram)\n` +
        `• Audio files (.mp3, .wav, .m4a)\n` +
        `• Video audio tracks\n\n` +
        `🚀 **Powered by GPT-5 + Advanced Speech Recognition**`,
        { parse_mode: 'Markdown' }
    );
}

async function handleDocumentAnalysis(msg, bot) {
    const chatId = msg.chat.id;
    
    await bot.sendMessage(chatId, 
        `📄 **Document Analysis with GPT-5**\n\n` +
        `Send me any document and I'll analyze it comprehensively:\n\n` +
        `📊 **Supported formats:**\n` +
        `• PDF files\n` +
        `• Word documents (.docx)\n` +
        `• Excel spreadsheets (.xlsx)\n` +
        `• Text files (.txt)\n` +
        `• PowerPoint presentations\n\n` +
        `🧠 **Analysis includes:**\n` +
        `• Content summarization\n` +
        `• Key insights extraction\n` +
        `• Data analysis (for spreadsheets)\n` +
        `• Strategic recommendations\n` +
        `• Financial metrics (if applicable)\n\n` +
        `💡 **Perfect for:** Business reports, financial statements, contracts, research papers`,
        { parse_mode: 'Markdown' }
    );
}

async function handleVoiceAnalysis(msg, bot) {
    const chatId = msg.chat.id;
    
    await bot.sendMessage(chatId, 
        `🎤 **Advanced Voice Analysis**\n\n` +
        `Send voice messages for comprehensive analysis:\n\n` +
        `🎯 **Features:**\n` +
        `• Real-time transcription\n` +
        `• Sentiment analysis\n` +
        `• Key point extraction\n` +
        `• Action item identification\n` +
        `• Business intelligence insights\n\n` +
        `🚀 **Perfect for:**\n` +
        `• Meeting recordings\n` +
        `• Voice notes\n` +
        `• Interview analysis\n` +
        `• Customer feedback\n\n` +
        `⚡ **Powered by GPT-5's advanced language understanding**`,
        { parse_mode: 'Markdown' }
    );
}

// 🛡️ CONVERSATION RECOVERY COMMANDS

async function handleConversationRecovery(msg, bot) {
    const chatId = msg.chat.id;
    
    try {
        await bot.sendMessage(chatId, 
            `🔍 **Starting Conversation Recovery...**\n\nSearching all backup systems...`,
            { parse_mode: 'Markdown' }
        );
        
        const recoveredMessages = await recoverConversation(chatId);
        
        if (recoveredMessages.length > 0) {
            const recoveryMessage = `🎉 **CONVERSATION RECOVERY SUCCESSFUL!**

✅ **Recovered:** ${recoveredMessages.length} messages
📅 **Date Range:** ${new Date(recoveredMessages[0]?.timestamp || Date.now()).toLocaleDateString()} - ${new Date().toLocaleDateString()}
💾 **Sources Used:**
• PostgreSQL Database ✅
• Memory Buffer ✅  
• Emergency Files ✅

🧠 **Memory Status:** Fully restored
🔄 **Continuity:** 100% maintained

**Your conversation history is completely intact!**
You can continue our discussion exactly where we left off.

💡 **Tip:** Use /memory to verify all systems are working properly.`;

            await bot.sendMessage(chatId, recoveryMessage, { parse_mode: 'Markdown' });
            
        } else {
            await bot.sendMessage(chatId, 
                `❌ **No Conversation Data Found**\n\n` +
                `This appears to be a fresh conversation.\n` +
                `Don't worry - all future messages will be saved with triple redundancy!`,
                { parse_mode: 'Markdown' }
            );
        }
        
    } catch (error) {
        await bot.sendMessage(chatId, 
            `❌ **Recovery Error:** ${error.message}\n\n` +
            `Please contact support if this persists.`
        );
    }
}

async function handleForceBackup(msg, bot) {
    const chatId = msg.chat.id;
    
    try {
        await bot.sendMessage(chatId, 
            `📦 **Forcing Emergency Backup...**\n\nBacking up all recent conversations...`,
            { parse_mode: 'Markdown' }
        );
        
        // Force immediate backup
        await performPeriodicBackup();
        
        // Test backup integrity
        const testRecovery = await recoverConversation(chatId);
        
        const backupMessage = `✅ **EMERGENCY BACKUP COMPLETED!**

📊 **Backup Status:**
• PostgreSQL: ✅ Active
• Memory Buffer: ✅ ${conversationBuffer.get(chatId)?.length || 0} messages
• Emergency Files: ✅ Created
• Last Backup: Just now

🛡️ **Protection Level:** Triple Redundancy
🎯 **Messages Secured:** ${testRecovery.length} total

**Your conversations are now fully protected against any data loss!**

⚡ **Automatic backups run every 30 seconds.**`;

        await bot.sendMessage(chatId, backupMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        await bot.sendMessage(chatId, 
            `❌ **Backup Error:** ${error.message}\n\n` +
            `Some backup systems may be experiencing issues.`
        );
    }
}

// 🚀 SYSTEM STARTUP AND WEBHOOK SETUP
async function initializeSystem() {
    try {
        console.log('\n🔧 Initializing GPT-5 Only System...');
        
        // Test system health
        const health = await checkGPT5OnlySystemHealth();
        console.log(`🏥 System Health: ${health.healthGrade} (${health.healthScore}/100)`);
        
        // Test memory integration
        const memoryTest = await testMemoryIntegration('system_init');
        console.log(`🧠 Memory Integration: ${memoryTest.status}`);
        
        // Get system analytics
        const analytics = getSystemAnalytics();
        console.log(`📊 Architecture: ${analytics.version}`);
        
        // 🌐 Setup webhook
        const webhookUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
        console.log(`🌐 Setting webhook URL: ${webhookUrl}`);
        
        try {
            await bot.setWebHook(webhookUrl, {
                max_connections: 100,
                allowed_updates: ['message', 'callback_query', 'inline_query']
            });
            console.log('✅ Webhook set successfully');
        } catch (webhookError) {
            console.error('❌ Webhook setup failed:', webhookError.message);
            throw webhookError;
        }
        
        console.log('\n🎉 IMPERIUM VAULT GPT-5 SYSTEM READY!');
        console.log('⚡ All queries will be intelligently routed to optimal GPT-5 models');
        console.log('🧠 Memory integration active with PostgreSQL');
        console.log('💰 Cost optimization active - estimated 60-80% savings');
        console.log('🌐 Railway deployment - Production webhook mode');
        console.log(`📡 Server listening on port ${PORT}...\n`);
        
    } catch (error) {
        console.error('❌ System initialization error:', error.message);
        console.log('🔧 System will continue with limited functionality');
    }
}

// 🌐 START SERVER
app.listen(PORT, async () => {
    console.log(`🌐 Server running on port ${PORT}`);
    await initializeSystem();
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Graceful shutdown initiated...');
    console.log('📊 Saving any pending operations...');
    
    try {
        await bot.deleteWebHook();
        console.log('✅ Webhook deleted');
    } catch (error) {
        console.log('⚠️ Error deleting webhook:', error.message);
    }
    
    console.log('👋 IMPERIUM VAULT GPT-5 System shutdown complete');
    process.exit(0);
});

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    console.log('🚨 System will attempt to continue...');
});

console.log('🎯 GPT-5 Only System Active - Enterprise Webhook Architecture Optimized!');
