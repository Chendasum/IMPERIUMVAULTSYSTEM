// utils/strategicIntegration.js - LIGHTWEIGHT INTEGRATION LAYER
// Works with existing telegramSplitter.js and modular system structure

const telegramSplitter = require('./telegramSplitter');
const metaTrader = require('./metaTrader');
const cambodiaLending = require('./cambodiaLending');
const liveData = require('./liveData');

// 🎯 STRATEGIC INTEGRATION CONFIGURATION
const INTEGRATION_CONFIG = {
    // GPT-5 and Claude Opus 4.1 optimization
    AI_PROCESSING: {
        GPT5_ENABLED: true,
        CLAUDE_OPUS_ENABLED: true,
        CONFIDENCE_THRESHOLD: 0.75,
        MAX_TOKENS_PER_ANALYSIS: 4000
    },
    
    // Monitoring intervals (minutes)
    INTERVALS: {
        OPPORTUNITY_SCAN: 30,
        RISK_CHECK: 15,
        HEALTH_MONITOR: 60,
        REGIME_WATCH: 10
    },
    
    // Alert thresholds
    THRESHOLDS: {
        PORTFOLIO_RISK: 5.0,
        OPPORTUNITY_SCORE: 75,
        MARGIN_LEVEL: 200,
        CORRELATION_RISK: 0.8
    },
    
    // Daily schedule
    SCHEDULE: {
        DAILY_REPORT_TIME: '08:00',
        TIMEZONE: 'Asia/Phnom_Penh'
    }
};

// 📊 MONITORING STATE
let monitoringActive = false;
let intervalHandlers = {};
let lastAnalysisCache = {};

/**
 * 🚀 INITIALIZE STRATEGIC INTEGRATION
 * Lightweight initialization that works with existing modules
 */
async function initializeStrategicIntegration(bot, chatId, config = {}) {
    try {
        console.log('🚀 Initializing Strategic Commander Integration Layer...');
        
        // Merge custom config
        const finalConfig = { ...INTEGRATION_CONFIG, ...config };
        
        // Quick system check using existing modules
        const systemCheck = await performSystemCheck();
        
        // Send initialization status using existing telegramSplitter
        const statusMessage = formatSystemStatus(systemCheck);
        await telegramSplitter.sendAnalysis(bot, chatId, statusMessage, 
            'Strategic Commander Integration Status', 'analysis');
        
        // Start monitoring if systems are ready
        if (systemCheck.readyToMonitor) {
            await startMonitoring(bot, chatId, finalConfig);
            console.log('✅ Strategic Commander Integration initialized successfully');
        } else {
            console.log('⚠️ Strategic Commander Integration initialized with warnings');
        }
        
        return {
            success: true,
            config: finalConfig,
            systemStatus: systemCheck,
            monitoringActive: monitoringActive
        };
        
    } catch (error) {
        console.error('❌ Strategic Integration initialization error:', error.message);
        
        await telegramSplitter.sendAlert(bot, chatId, 
            `Integration initialization failed: ${error.message}`,
            'System Error');
        
        return { success: false, error: error.message };
    }
}

/**
 * 🔍 PERFORM SYSTEM CHECK
 * Uses existing module functions to check system status
 */
async function performSystemCheck() {
    const checks = {
        metaTrader: false,
        cambodiaLending: false,
        liveData: false,
        telegramSplitter: true // Always available since we're using it
    };
    
    const details = {};
    
    try {
        // Check MetaTrader module
        if (metaTrader && typeof metaTrader.getConnectionStatus === 'function') {
            const mtStatus = await metaTrader.getConnectionStatus();
            checks.metaTrader = mtStatus.connected && mtStatus.synchronized;
            details.metaTrader = mtStatus;
        }
    } catch (error) {
        details.metaTrader = { error: error.message };
    }
    
    try {
        // Check Cambodia Lending module
        if (cambodiaLending && typeof cambodiaLending.getPortfolioStatus === 'function') {
            const clStatus = await cambodiaLending.getPortfolioStatus();
            checks.cambodiaLending = !!clStatus;
            details.cambodiaLending = clStatus;
        }
    } catch (error) {
        details.cambodiaLending = { error: error.message };
    }
    
    try {
        // Check Live Data module
        if (liveData && typeof liveData.getRayDalioMarketData === 'function') {
            const ldStatus = await liveData.getRayDalioMarketData();
            checks.liveData = !!ldStatus;
            details.liveData = { available: !!ldStatus };
        }
    } catch (error) {
        details.liveData = { error: error.message };
    }
    
    const readyToMonitor = checks.metaTrader && checks.telegramSplitter;
    const allSystemsOnline = Object.values(checks).every(check => check === true);
    
    return {
        checks,
        details,
        readyToMonitor,
        allSystemsOnline,
        timestamp: new Date().toISOString()
    };
}

/**
 * 📋 FORMAT SYSTEM STATUS
 */
function formatSystemStatus(systemCheck) {
    let status = `**STRATEGIC COMMANDER INTEGRATION STATUS**\n\n`;
    
    status += `**SYSTEM MODULES**\n`;
    status += `• MetaTrader: ${systemCheck.checks.metaTrader ? '✅ Online' : '❌ Offline'}\n`;
    status += `• Cambodia Lending: ${systemCheck.checks.cambodiaLending ? '✅ Online' : '❌ Offline'}\n`;
    status += `• Live Data Feed: ${systemCheck.checks.liveData ? '✅ Online' : '❌ Offline'}\n`;
    status += `• Telegram System: ${systemCheck.checks.telegramSplitter ? '✅ Online' : '❌ Offline'}\n\n`;
    
    status += `**OVERALL STATUS**\n`;
    status += `• Ready to Monitor: ${systemCheck.readyToMonitor ? '✅ Yes' : '❌ No'}\n`;
    status += `• All Systems: ${systemCheck.allSystemsOnline ? '✅ Online' : '⚠️ Some Offline'}\n\n`;
    
    if (systemCheck.details.metaTrader?.error) {
        status += `**METATRADER ISSUE**\n• ${systemCheck.details.metaTrader.error}\n\n`;
    }
    
    if (systemCheck.details.cambodiaLending?.error) {
        status += `**CAMBODIA LENDING ISSUE**\n• ${systemCheck.details.cambodiaLending.error}\n\n`;
    }
    
    status += `**AI INTEGRATION**\n`;
    status += `• GPT-5 Ready: ${INTEGRATION_CONFIG.AI_PROCESSING.GPT5_ENABLED ? '✅' : '❌'}\n`;
    status += `• Claude Opus 4.1 Ready: ${INTEGRATION_CONFIG.AI_PROCESSING.CLAUDE_OPUS_ENABLED ? '✅' : '❌'}\n\n`;
    
    if (systemCheck.readyToMonitor) {
        status += `**✅ INTEGRATION LAYER ACTIVE**\nAutomated monitoring started.`;
    } else {
        status += `**⚠️ MANUAL INTERVENTION REQUIRED**\nCheck MetaTrader connection.`;
    }
    
    return status;
}

/**
 * 🔄 START MONITORING
 */
async function startMonitoring(bot, chatId, config) {
    if (monitoringActive) {
        console.log('⚠️ Monitoring already active');
        return;
    }
    
    console.log('🔄 Starting Strategic Commander monitoring...');
    monitoringActive = true;
    
    // Schedule daily report
    scheduleDailyReport(bot, chatId, config.SCHEDULE.DAILY_REPORT_TIME);
    
    // Start interval-based monitoring
    intervalHandlers.opportunities = setInterval(() => {
        checkOpportunities(bot, chatId);
    }, config.INTERVALS.OPPORTUNITY_SCAN * 60 * 1000);
    
    intervalHandlers.risk = setInterval(() => {
        checkRiskLevels(bot, chatId);
    }, config.INTERVALS.RISK_CHECK * 60 * 1000);
    
    intervalHandlers.health = setInterval(() => {
        checkPortfolioHealth(bot, chatId);
    }, config.INTERVALS.HEALTH_MONITOR * 60 * 1000);
    
    intervalHandlers.regime = setInterval(() => {
        checkRegimeChanges(bot, chatId);
    }, config.INTERVALS.REGIME_WATCH * 60 * 1000);
    
    console.log('✅ Strategic monitoring active');
}

/**
 * 🎯 CHECK OPPORTUNITIES
 */
async function checkOpportunities(bot, chatId) {
    try {
        if (!metaTrader.scanStrategicTradingOpportunities) return;
        
        const opportunities = await metaTrader.scanStrategicTradingOpportunities();
        const highPriority = opportunities.opportunities?.filter(op => 
            op.priority === 'HIGH' && op.score >= INTEGRATION_CONFIG.THRESHOLDS.OPPORTUNITY_SCORE
        ) || [];
        
        if (highPriority.length === 0) return;
        
        // Check if already alerted
        const cacheKey = `opportunities_${highPriority.map(op => op.symbol).join('_')}`;
        if (lastAnalysisCache[cacheKey]) return;
        
        let alert = `**HIGH PRIORITY OPPORTUNITIES**\n\n`;
        highPriority.forEach((opp, i) => {
            alert += `${i + 1}. **${opp.symbol}** (Score: ${opp.score}/100)\n`;
            alert += `   • Direction: ${opp.directionBias}\n`;
            alert += `   • Recommendation: ${opp.strategicRecommendation}\n\n`;
        });
        
        await telegramSplitter.sendAlert(bot, chatId, alert, 
            `${highPriority.length} High Priority Opportunities`);
        
        // Cache for 2 hours
        lastAnalysisCache[cacheKey] = Date.now();
        setTimeout(() => delete lastAnalysisCache[cacheKey], 2 * 60 * 60 * 1000);
        
    } catch (error) {
        console.error('❌ Opportunity check error:', error.message);
    }
}

/**
 * ⚠️ CHECK RISK LEVELS
 */
async function checkRiskLevels(bot, chatId) {
    try {
        if (!metaTrader.getAccountInfo || !metaTrader.calculateStrategicPortfolioRisk) return;
        
        const accountInfo = await metaTrader.getAccountInfo();
        if (!accountInfo?.balance) return;
        
        const riskAnalysis = await metaTrader.calculateStrategicPortfolioRisk(accountInfo.balance);
        
        const alerts = [];
        
        if (riskAnalysis.totalStrategicRiskPercent > INTEGRATION_CONFIG.THRESHOLDS.PORTFOLIO_RISK) {
            alerts.push(`Portfolio risk: ${riskAnalysis.formattedRiskPercent}`);
        }
        
        if (accountInfo.marginLevel < INTEGRATION_CONFIG.THRESHOLDS.MARGIN_LEVEL) {
            alerts.push(`Margin level: ${accountInfo.formattedMarginLevel}`);
        }
        
        if (riskAnalysis.strategicCorrelationRisk === 'HIGH') {
            alerts.push('High correlation risk detected');
        }
        
        if (alerts.length === 0) return;
        
        const riskAlert = `**PORTFOLIO RISK ALERT**\n\n${alerts.map(a => `• ${a}`).join('\n')}`;
        
        await telegramSplitter.sendAlert(bot, chatId, riskAlert, 'Risk Alert');
        
    } catch (error) {
        console.error('❌ Risk check error:', error.message);
    }
}

/**
 * 💚 CHECK PORTFOLIO HEALTH
 */
async function checkPortfolioHealth(bot, chatId) {
    try {
        if (!metaTrader.getEnhancedTradingSummary) return;
        
        const summary = await metaTrader.getEnhancedTradingSummary();
        const currentScore = summary.healthScore?.score || 0;
        const lastScore = lastAnalysisCache.healthScore || currentScore;
        
        const scoreDifference = Math.abs(currentScore - lastScore);
        if (scoreDifference < 15) return; // Only alert on significant changes
        
        const improvement = currentScore > lastScore;
        const healthUpdate = `**PORTFOLIO HEALTH UPDATE**\n\n` +
            `Score: ${currentScore}/100 (${improvement ? '+' : ''}${scoreDifference})\n` +
            `Grade: ${summary.healthScore?.grade || 'Unknown'}\n` +
            `Status: ${summary.healthScore?.description || 'N/A'}`;
        
        const messageType = currentScore >= 70 ? 'sendAnalysis' : 'sendAlert';
        await telegramSplitter[messageType](bot, chatId, healthUpdate, 'Portfolio Health Update');
        
        lastAnalysisCache.healthScore = currentScore;
        
    } catch (error) {
        console.error('❌ Health check error:', error.message);
    }
}

/**
 * 🏛️ CHECK REGIME CHANGES
 */
async function checkRegimeChanges(bot, chatId) {
    try {
        if (!liveData.getRayDalioMarketData) return;
        
        const marketData = await liveData.getRayDalioMarketData();
        const currentRegime = marketData?.rayDalio?.regime?.currentRegime?.name;
        const confidence = marketData?.rayDalio?.regime?.confidence || 0;
        
        if (!currentRegime) return;
        
        const lastRegime = lastAnalysisCache.regime;
        
        if (currentRegime !== lastRegime && lastRegime) {
            const regimeAlert = `**ECONOMIC REGIME CHANGE**\n\n` +
                `Previous: ${lastRegime}\n` +
                `Current: ${currentRegime}\n` +
                `Confidence: ${confidence}%\n\n` +
                `Review position sizing and risk parameters.`;
            
            await telegramSplitter.sendRegimeAnalysis(bot, chatId, regimeAlert, 
                `Regime Change: ${currentRegime}`);
        }
        
        lastAnalysisCache.regime = currentRegime;
        
    } catch (error) {
        console.error('❌ Regime check error:', error.message);
    }
}

/**
 * 📅 SCHEDULE DAILY REPORT
 */
function scheduleDailyReport(bot, chatId, timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    function scheduleNext() {
        const now = new Date();
        const scheduled = new Date();
        scheduled.setHours(hours, minutes, 0, 0);
        
        if (scheduled <= now) {
            scheduled.setDate(scheduled.getDate() + 1);
        }
        
        const delay = scheduled.getTime() - now.getTime();
        
        setTimeout(async () => {
            await generateDailyReport(bot, chatId);
            
            // Schedule next day
            setTimeout(() => scheduleNext(), 24 * 60 * 60 * 1000);
        }, delay);
        
        console.log(`📅 Daily report scheduled for ${scheduled.toLocaleString()}`);
    }
    
    scheduleNext();
}

/**
 * 📊 GENERATE DAILY REPORT
 */
async function generateDailyReport(bot, chatId) {
    try {
        console.log('📊 Generating daily report...');
        
        const [summary, opportunities] = await Promise.all([
            metaTrader.getEnhancedTradingSummary?.() || Promise.resolve(null),
            metaTrader.scanStrategicTradingOpportunities?.() || Promise.resolve(null)
        ]);
        
        let report = `**DAILY STRATEGIC COMMANDER REPORT**\n`;
        report += `Date: ${new Date().toLocaleDateString()}\n\n`;
        
        if (summary) {
            report += `**PORTFOLIO OVERVIEW**\n`;
            report += `• Health Score: ${summary.healthScore?.score || 0}/100\n`;
            report += `• Account Balance: ${summary.account?.formattedBalance || 'N/A'}\n`;
            report += `• Active Positions: ${summary.positions?.count || 0}\n`;
            report += `• Net P&L: ${summary.positions?.formattedNetProfit || 'N/A'}\n\n`;
        }
        
        if (opportunities) {
            report += `**MARKET OPPORTUNITIES**\n`;
            report += `• Total Opportunities: ${opportunities.totalOpportunities || 0}\n`;
            report += `• High Priority: ${opportunities.highPriorityOpportunities || 0}\n`;
            report += `• Market Regime: ${opportunities.marketRegime || 'Unknown'}\n\n`;
        }
        
        if (summary?.recommendations?.length > 0) {
            report += `**KEY RECOMMENDATIONS**\n`;
            summary.recommendations.slice(0, 3).forEach(rec => {
                report += `• ${rec.message || rec}\n`;
            });
        }
        
        await telegramSplitter.sendPortfolioAnalysis(bot, chatId, report, 
            `Daily Report - ${new Date().toLocaleDateString()}`);
        
        console.log('✅ Daily report sent');
        
    } catch (error) {
        console.error('❌ Daily report error:', error.message);
        await telegramSplitter.sendAlert(bot, chatId, 
            `Daily report generation failed: ${error.message}`, 'Report Error');
    }
}

/**
 * 🛑 STOP MONITORING
 */
function stopMonitoring() {
    if (!monitoringActive) return;
    
    console.log('🛑 Stopping Strategic Commander monitoring...');
    
    Object.values(intervalHandlers).forEach(handler => {
        if (handler) clearInterval(handler);
    });
    
    intervalHandlers = {};
    monitoringActive = false;
    
    console.log('✅ Monitoring stopped');
}

/**
 * 📱 MANUAL COMMANDS (using existing telegramSplitter)
 */

async function manualPortfolioStatus(bot, chatId) {
    try {
        const summary = await metaTrader.getEnhancedTradingSummary?.();
        if (!summary) {
            await telegramSplitter.sendAlert(bot, chatId, 'Portfolio data unavailable', 'Error');
            return;
        }
        
        const report = `**CURRENT PORTFOLIO STATUS**\n\n` +
            `Health: ${summary.healthScore?.score || 0}/100\n` +
            `Balance: ${summary.account?.formattedBalance || 'N/A'}\n` +
            `Positions: ${summary.positions?.count || 0}\n` +
            `P&L: ${summary.positions?.formattedNetProfit || 'N/A'}`;
        
        await telegramSplitter.sendPortfolioAnalysis(bot, chatId, report, 'Portfolio Status');
        
    } catch (error) {
        await telegramSplitter.sendAlert(bot, chatId, `Status error: ${error.message}`, 'Error');
    }
}

async function manualOpportunityScan(bot, chatId) {
    try {
        const opportunities = await metaTrader.scanStrategicTradingOpportunities?.();
        if (!opportunities?.opportunities) {
            await telegramSplitter.sendAlert(bot, chatId, 'Opportunity data unavailable', 'Error');
            return;
        }
        
        const topOps = opportunities.opportunities.slice(0, 5);
        let report = `**CURRENT OPPORTUNITIES**\n\n`;
        
        topOps.forEach((opp, i) => {
            report += `${i + 1}. ${opp.symbol}: ${opp.score}/100 (${opp.priority})\n`;
        });
        
        await telegramSplitter.sendMarketAnalysis(bot, chatId, report, 'Opportunity Scan');
        
    } catch (error) {
        await telegramSplitter.sendAlert(bot, chatId, `Scan error: ${error.message}`, 'Error');
    }
}

async function manualSystemCheck(bot, chatId) {
    try {
        const systemCheck = await performSystemCheck();
        const statusMessage = formatSystemStatus(systemCheck);
        
        await telegramSplitter.sendAnalysis(bot, chatId, statusMessage, 'System Check');
        
    } catch (error) {
        await telegramSplitter.sendAlert(bot, chatId, `System check error: ${error.message}`, 'Error');
    }
}

/**
 * 📤 MODULE EXPORTS
 */
module.exports = {
    // Core functions
    initializeStrategicIntegration,
    performSystemCheck,
    formatSystemStatus,
    
    // Monitoring control
    startMonitoring,
    stopMonitoring,
    isMonitoringActive: () => monitoringActive,
    
    // Manual commands
    manualPortfolioStatus,
    manualOpportunityScan,
    manualSystemCheck,
    
    // Individual checkers (can be called manually)
    checkOpportunities,
    checkRiskLevels,
    checkPortfolioHealth,
    checkRegimeChanges,
    generateDailyReport,
    
    // Configuration
    INTEGRATION_CONFIG,
    
    // Status
    getMonitoringStatus: () => ({
        active: monitoringActive,
        intervals: Object.keys(intervalHandlers),
        lastAnalysis: lastAnalysisCache
    })
};

console.log('✅ Strategic Commander Integration Layer loaded');
console.log('🎯 Works with existing modular structure');
console.log('📱 Uses existing telegramSplitter functions');
console.log('🤖 Optimized for GPT-5 and Claude Opus 4.1');
console.log('');
console.log('Usage: await initializeStrategicIntegration(bot, chatId);');
