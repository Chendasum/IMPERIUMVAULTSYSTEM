// utils/alertSystem.js
const { getUniversalAnalysis, getDualAnalysis } = require('./dualAISystem');
const { sendSmartMessage, sendAnalysis } = require('./telegramSplitter');
const { getLivePrice, getMarketData } = require('./liveData');
const { assessRisk, monitorRisk } = require('./riskManager');
const { scanMarkets, getTopOpportunities } = require('./marketScanner');
const { getOptimalAllocation, calculateRebalancing } = require('./portfolioOptimizer');
const { findYields, getTopYields } = require('./yieldFinder');
const { trackWealth, checkMilestones } = require('./wealthTracker');
const { logInfo, logError, logWarning } = require('./logger');
const { saveToMemory, getFromMemory } = require('./memory');

class AlertSystem {
    constructor() {
        this.alertTypes = {
            // Market Alerts
            priceTarget: { name: 'Price Target Hit', priority: 'high', icon: '🎯', category: 'market' },
            breakout: { name: 'Technical Breakout', priority: 'medium', icon: '📈', category: 'market' },
            arbitrage: { name: 'Arbitrage Opportunity', priority: 'high', icon: '🔄', category: 'market' },
            momentum: { name: 'Momentum Signal', priority: 'medium', icon: '⚡', category: 'market' },
            
            // Risk Alerts
            riskLimit: { name: 'Risk Limit Breach', priority: 'critical', icon: '🚨', category: 'risk' },
            drawdown: { name: 'Drawdown Warning', priority: 'high', icon: '📉', category: 'risk' },
            correlation: { name: 'High Correlation Risk', priority: 'medium', icon: '🔗', category: 'risk' },
            volatility: { name: 'Volatility Spike', priority: 'medium', icon: '🌊', category: 'risk' },
            
            // Portfolio Alerts
            rebalance: { name: 'Rebalancing Due', priority: 'medium', icon: '⚖️', category: 'portfolio' },
            allocation: { name: 'Allocation Drift', priority: 'low', icon: '📊', category: 'portfolio' },
            performance: { name: 'Performance Update', priority: 'low', icon: '📈', category: 'portfolio' },
            
            // Income/Yield Alerts
            highYield: { name: 'High Yield Found', priority: 'medium', icon: '💰', category: 'income' },
            dividendDate: { name: 'Dividend Ex-Date', priority: 'low', icon: '💵', category: 'income' },
            yieldDrop: { name: 'Yield Dropped', priority: 'medium', icon: '📉', category: 'income' },
            
            // Wealth Alerts
            milestone: { name: 'Wealth Milestone', priority: 'high', icon: '🏆', category: 'wealth' },
            goalProgress: { name: 'Goal Progress Update', priority: 'low', icon: '🎯', category: 'wealth' },
            netWorthChange: { name: 'Net Worth Change', priority: 'medium', icon: '📊', category: 'wealth' },
            
            // News & Events
            earnings: { name: 'Earnings Release', priority: 'medium', icon: '📋', category: 'news' },
            economic: { name: 'Economic Data', priority: 'medium', icon: '🏛️', category: 'news' },
            fed: { name: 'Fed Announcement', priority: 'high', icon: '🏦', category: 'news' },
            
            // System Alerts
            systemHealth: { name: 'System Health', priority: 'low', icon: '⚙️', category: 'system' },
            dataUpdate: { name: 'Data Updated', priority: 'low', icon: '🔄', category: 'system' },
            error: { name: 'System Error', priority: 'critical', icon: '❌', category: 'system' }
        };
        
        this.alertSettings = {
            enabled: true,
            quietHours: { start: 22, end: 7 }, // 10 PM to 7 AM
            maxAlertsPerHour: 10,
            priorities: {
                critical: { enabled: true, quietHours: false },
                high: { enabled: true, quietHours: true },
                medium: { enabled: true, quietHours: true },
                low: { enabled: true, quietHours: true }
            },
            categories: {
                market: true,
                risk: true,
                portfolio: true,
                income: true,
                wealth: true,
                news: true,
                system: false
            }
        };
        
        this.activeAlerts = new Map();
        this.alertHistory = [];
        this.alertQueue = [];
        this.lastAlertTimes = new Map();
        this.subscriptions = new Map();
    }

    // 🎯 MAIN ALERT MONITORING SYSTEM
    async startAlertMonitoring(userId, chatId, preferences = {}) {
        try {
            logInfo('🚨 Starting comprehensive alert monitoring system');
            
            // Initialize user preferences
            await this.initializeUserAlertSettings(userId, preferences);
            
            // Start monitoring loops
            this.startMarketAlertMonitoring(userId, chatId);
            this.startRiskAlertMonitoring(userId, chatId);
            this.startPortfolioAlertMonitoring(userId, chatId);
            this.startIncomeAlertMonitoring(userId, chatId);
            this.startWealthAlertMonitoring(userId, chatId);
            this.startNewsAlertMonitoring(userId, chatId);
            
            // Send confirmation
            await this.sendAlertSystemStatus(userId, chatId);
            
            logInfo('✅ Alert monitoring system activated');
            
        } catch (error) {
            logError('Alert monitoring startup failed:', error);
            throw error;
        }
    }

    // 📈 MARKET ALERT MONITORING
    async startMarketAlertMonitoring(userId, chatId) {
        const monitorMarketAlerts = async () => {
            try {
                // Price target alerts
                await this.checkPriceTargets(userId, chatId);
                
                // Technical breakout alerts
                await this.checkTechnicalBreakouts(userId, chatId);
                
                // Arbitrage opportunity alerts
                await this.checkArbitrageOpportunities(userId, chatId);
                
                // Momentum signal alerts
                await this.checkMomentumSignals(userId, chatId);
                
                // Volume spike alerts
                await this.checkVolumeSpikes(userId, chatId);
                
                // Support/resistance level alerts
                await this.checkSupportResistanceLevels(userId, chatId);
                
            } catch (error) {
                logError('Market alert monitoring failed:', error);
            }
        };
        
        // Run every 1 minute
        setInterval(monitorMarketAlerts, 60000);
        
        // Run immediately
        monitorMarketAlerts();
    }

    // 🛡️ RISK ALERT MONITORING
    async startRiskAlertMonitoring(userId, chatId) {
        const monitorRiskAlerts = async () => {
            try {
                // Risk limit breach alerts
                await this.checkRiskLimitBreaches(userId, chatId);
                
                // Drawdown warning alerts
                await this.checkDrawdownWarnings(userId, chatId);
                
                // Correlation risk alerts
                await this.checkCorrelationRisks(userId, chatId);
                
                // Volatility spike alerts
                await this.checkVolatilitySpikes(userId, chatId);
                
                // Leverage alerts
                await this.checkLeverageAlerts(userId, chatId);
                
                // Liquidity alerts
                await this.checkLiquidityAlerts(userId, chatId);
                
            } catch (error) {
                logError('Risk alert monitoring failed:', error);
            }
        };
        
        // Run every 5 minutes
        setInterval(monitorRiskAlerts, 300000);
        
        // Run immediately
        monitorRiskAlerts();
    }

    // 📊 PORTFOLIO ALERT MONITORING
    async startPortfolioAlertMonitoring(userId, chatId) {
        const monitorPortfolioAlerts = async () => {
            try {
                // Rebalancing alerts
                await this.checkRebalancingNeeds(userId, chatId);
                
                // Allocation drift alerts
                await this.checkAllocationDrift(userId, chatId);
                
                // Performance alerts
                await this.checkPerformanceAlerts(userId, chatId);
                
                // Tax loss harvesting alerts
                await this.checkTaxLossHarvesting(userId, chatId);
                
                // Asset concentration alerts
                await this.checkAssetConcentration(userId, chatId);
                
            } catch (error) {
                logError('Portfolio alert monitoring failed:', error);
            }
        };
        
        // Run every 30 minutes
        setInterval(monitorPortfolioAlerts, 1800000);
        
        // Run immediately
        monitorPortfolioAlerts();
    }

    // 💰 INCOME ALERT MONITORING
    async startIncomeAlertMonitoring(userId, chatId) {
        const monitorIncomeAlerts = async () => {
            try {
                // High yield opportunities
                await this.checkHighYieldOpportunities(userId, chatId);
                
                // Dividend ex-dates
                await this.checkDividendDates(userId, chatId);
                
                // Yield drops
                await this.checkYieldDrops(userId, chatId);
                
                // Staking rewards
                await this.checkStakingRewards(userId, chatId);
                
                // Interest rate changes
                await this.checkInterestRateChanges(userId, chatId);
                
            } catch (error) {
                logError('Income alert monitoring failed:', error);
            }
        };
        
        // Run every 1 hour
        setInterval(monitorIncomeAlerts, 3600000);
        
        // Run immediately
        monitorIncomeAlerts();
    }

    // 🏆 WEALTH ALERT MONITORING
    async startWealthAlertMonitoring(userId, chatId) {
        const monitorWealthAlerts = async () => {
            try {
                // Wealth milestone alerts
                await this.checkWealthMilestones(userId, chatId);
                
                // Goal progress alerts
                await this.checkGoalProgress(userId, chatId);
                
                // Net worth change alerts
                await this.checkNetWorthChanges(userId, chatId);
                
                // Savings rate alerts
                await this.checkSavingsRateAlerts(userId, chatId);
                
                // Financial independence progress
                await this.checkFIProgress(userId, chatId);
                
            } catch (error) {
                logError('Wealth alert monitoring failed:', error);
            }
        };
        
        // Run every 6 hours
        setInterval(monitorWealthAlerts, 21600000);
        
        // Run immediately
        monitorWealthAlerts();
    }

    // 📰 NEWS ALERT MONITORING
    async startNewsAlertMonitoring(userId, chatId) {
        const monitorNewsAlerts = async () => {
            try {
                // Earnings announcements
                await this.checkEarningsAlerts(userId, chatId);
                
                // Economic data releases
                await this.checkEconomicDataAlerts(userId, chatId);
                
                // Fed announcements
                await this.checkFedAlerts(userId, chatId);
                
                // Market moving news
                await this.checkMarketMovingNews(userId, chatId);
                
                // Crypto news
                await this.checkCryptoNews(userId, chatId);
                
            } catch (error) {
                logError('News alert monitoring failed:', error);
            }
        };
        
        // Run every 15 minutes
        setInterval(monitorNewsAlerts, 900000);
        
        // Run immediately
        monitorNewsAlerts();
    }

    // 🎯 PRICE TARGET ALERTS
    async checkPriceTargets(userId, chatId) {
        try {
            const userTargets = await this.getUserPriceTargets(userId);
            
            for (const target of userTargets) {
                const currentPrice = await getLivePrice(target.symbol);
                
                if (this.isPriceTargetHit(currentPrice, target)) {
                    const alert = {
                        type: 'priceTarget',
                        symbol: target.symbol,
                        targetPrice: target.price,
                        currentPrice: currentPrice,
                        direction: target.direction,
                        message: `🎯 **PRICE TARGET HIT!**\n${target.symbol} reached $${currentPrice} (target: $${target.price})`
                    };
                    
                    await this.sendAlert(userId, chatId, alert);
                    await this.removeUserPriceTarget(userId, target.id);
                }
            }
            
        } catch (error) {
            logError('Price target check failed:', error);
        }
    }

    // 📈 TECHNICAL BREAKOUT ALERTS
    async checkTechnicalBreakouts(userId, chatId) {
        try {
            const watchlist = await this.getUserWatchlist(userId);
            
            for (const symbol of watchlist) {
                const breakout = await this.detectTechnicalBreakout(symbol);
                
                if (breakout.detected) {
                    const alert = {
                        type: 'breakout',
                        symbol: symbol,
                        pattern: breakout.pattern,
                        direction: breakout.direction,
                        strength: breakout.strength,
                        message: `📈 **BREAKOUT DETECTED!**\n${symbol} ${breakout.direction} breakout from ${breakout.pattern}\nStrength: ${breakout.strength}/10`
                    };
                    
                    await this.sendAlert(userId, chatId, alert);
                }
            }
            
        } catch (error) {
            logError('Breakout check failed:', error);
        }
    }

    // 🚨 RISK LIMIT BREACH ALERTS
    async checkRiskLimitBreaches(userId, chatId) {
        try {
            const riskAssessment = await assessRisk(chatId);
            const userRiskLimits = await this.getUserRiskLimits(userId);
            
            const breaches = [];
            
            // Check drawdown limit
            if (riskAssessment.accountRisk?.currentDrawdown > userRiskLimits.maxDrawdown) {
                breaches.push({
                    type: 'drawdown',
                    current: riskAssessment.accountRisk.currentDrawdown,
                    limit: userRiskLimits.maxDrawdown,
                    severity: 'critical'
                });
            }
            
            // Check position size limit
            if (riskAssessment.positionRisk?.largestPosition > userRiskLimits.maxPositionSize) {
                breaches.push({
                    type: 'position_size',
                    current: riskAssessment.positionRisk.largestPosition,
                    limit: userRiskLimits.maxPositionSize,
                    severity: 'high'
                });
            }
            
            // Check leverage limit
            if (riskAssessment.accountRisk?.leverage > userRiskLimits.maxLeverage) {
                breaches.push({
                    type: 'leverage',
                    current: riskAssessment.accountRisk.leverage,
                    limit: userRiskLimits.maxLeverage,
                    severity: 'critical'
                });
            }
            
            for (const breach of breaches) {
                const alert = {
                    type: 'riskLimit',
                    severity: breach.severity,
                    riskType: breach.type,
                    current: breach.current,
                    limit: breach.limit,
                    message: `🚨 **RISK LIMIT BREACH!**\n${breach.type.toUpperCase()}: ${(breach.current * 100).toFixed(2)}% exceeds limit of ${(breach.limit * 100).toFixed(2)}%\n⚠️ IMMEDIATE ACTION REQUIRED`
                };
                
                await this.sendAlert(userId, chatId, alert);
            }
            
        } catch (error) {
            logError('Risk limit check failed:', error);
        }
    }

    // 💰 HIGH YIELD OPPORTUNITY ALERTS
    async checkHighYieldOpportunities(userId, chatId) {
        try {
            const userYieldThreshold = await this.getUserYieldThreshold(userId);
            const topYields = await getTopYields('all', chatId, 20);
            
            for (const opportunity of topYields) {
                if ((opportunity.yield || 0) > userYieldThreshold && 
                    !this.isRecentlyAlerted(userId, 'highYield', opportunity.symbol)) {
                    
                    const alert = {
                        type: 'highYield',
                        symbol: opportunity.symbol || opportunity.name,
                        yield: opportunity.yield,
                        category: opportunity.categoryName,
                        riskLevel: opportunity.riskLevel,
                        message: `💰 **HIGH YIELD OPPORTUNITY!**\n${opportunity.symbol || opportunity.name} (${opportunity.categoryName})\nYield: ${(opportunity.yield * 100).toFixed(2)}%\nRisk Level: ${opportunity.riskLevel}/10`
                    };
                    
                    await this.sendAlert(userId, chatId, alert);
                    this.markAsRecentlyAlerted(userId, 'highYield', opportunity.symbol);
                }
            }
            
        } catch (error) {
            logError('High yield opportunity check failed:', error);
        }
    }

    // 🏆 WEALTH MILESTONE ALERTS
    async checkWealthMilestones(userId, chatId) {
        try {
            await checkMilestones(userId, chatId);
            
        } catch (error) {
            logError('Wealth milestone check failed:', error);
        }
    }

    // 📊 REBALANCING ALERTS
    async checkRebalancingNeeds(userId, chatId) {
        try {
            const currentPortfolio = await this.getUserPortfolio(userId);
            const optimalAllocation = await getOptimalAllocation(currentPortfolio, {}, chatId);
            const rebalancing = await calculateRebalancing(currentPortfolio, optimalAllocation);
            
            if (rebalancing.needed && rebalancing.urgency !== 'low') {
                const alert = {
                    type: 'rebalance',
                    totalTrades: rebalancing.totalTrades,
                    estimatedCost: rebalancing.estimatedCost,
                    urgency: rebalancing.urgency,
                    message: `⚖️ **REBALANCING RECOMMENDED**\n${rebalancing.totalTrades} trades needed\nEstimated cost: $${rebalancing.estimatedCost?.toFixed(2) || '0'}\nUrgency: ${rebalancing.urgency.toUpperCase()}`
                };
                
                await this.sendAlert(userId, chatId, alert);
            }
            
        } catch (error) {
            logError('Rebalancing check failed:', error);
        }
    }

    // 🚨 SMART ALERT DELIVERY
    async sendAlert(userId, chatId, alert) {
        try {
            // Check if alerts are enabled
            if (!await this.areAlertsEnabled(userId, alert)) {
                return;
            }
            
            // Check quiet hours
            if (await this.isQuietHours(userId, alert)) {
                this.queueAlert(userId, alert);
                return;
            }
            
            // Check rate limiting
            if (await this.isRateLimited(userId)) {
                this.queueAlert(userId, alert);
                return;
            }
            
            // Get alert configuration
            const alertConfig = this.alertTypes[alert.type];
            const priority = alertConfig?.priority || 'medium';
            const icon = alertConfig?.icon || '🔔';
            
            // Format alert message
            const formattedMessage = `${icon} **${alertConfig?.name || 'Alert'}**\n\n${alert.message}\n\n⏰ ${new Date().toLocaleTimeString()}`;
            
            // Send alert
            if (priority === 'critical' || priority === 'high') {
                await sendSmartMessage(formattedMessage, chatId);
            } else {
                await sendAnalysis(formattedMessage, chatId, `${icon} Alert`);
            }
            
            // Log alert
            this.logAlert(userId, alert);
            
            // Update rate limiting
            this.updateRateLimit(userId);
            
        } catch (error) {
            logError('Alert sending failed:', error);
        }
    }

    // 🤖 AI-POWERED ALERT INSIGHTS
    async generateAlertInsights(userId, chatId) {
        try {
            const recentAlerts = this.getRecentAlerts(userId, 24); // Last 24 hours
            
            if (recentAlerts.length === 0) {
                return 'No recent alerts to analyze';
            }
            
            const prompt = `
            Analyze these recent alerts and provide strategic insights:
            
            Recent Alerts (${recentAlerts.length} in last 24h):
            ${recentAlerts.map(alert => 
                `- ${alert.type}: ${alert.message}`
            ).join('\n')}
            
            Alert Categories:
            ${this.categorizeAlerts(recentAlerts)}
            
            Provide:
            1. Alert pattern analysis
            2. Risk assessment from alerts
            3. Opportunity identification
            4. Action priority recommendations
            5. Alert optimization suggestions
            `;
            
            const insights = await getDualAnalysis(prompt, {
                chatId: chatId,
                context: 'alert_analysis',
                priority: 'medium'
            });
            
            return insights;
            
        } catch (error) {
            logError('Alert insights generation failed:', error);
            return 'Alert insights unavailable';
        }
    }

    // 📱 ALERT SYSTEM STATUS
    async sendAlertSystemStatus(userId, chatId) {
        try {
            const settings = await this.getUserAlertSettings(userId);
            const activeAlerts = this.getActiveAlertsCount(userId);
            const recentAlerts = this.getRecentAlerts(userId, 24);
            
            const status = `
🚨 **ALERT SYSTEM STATUS** ✅

**MONITORING ACTIVE:**
• Market Alerts: ${settings.categories.market ? '✅' : '❌'}
• Risk Alerts: ${settings.categories.risk ? '✅' : '❌'}
• Portfolio Alerts: ${settings.categories.portfolio ? '✅' : '❌'}
• Income Alerts: ${settings.categories.income ? '✅' : '❌'}
• Wealth Alerts: ${settings.categories.wealth ? '✅' : '❌'}
• News Alerts: ${settings.categories.news ? '✅' : '❌'}

**ALERT ACTIVITY:**
• Active Monitoring: **${activeAlerts} items**
• Alerts Last 24h: **${recentAlerts.length}**
• Quiet Hours: **${settings.quietHours.start}:00 - ${settings.quietHours.end}:00**
• Max Per Hour: **${settings.maxAlertsPerHour}**

**PRIORITY SETTINGS:**
• Critical: ${settings.priorities.critical.enabled ? '🔴 ON' : '⚪ OFF'}
• High: ${settings.priorities.high.enabled ? '🟠 ON' : '⚪ OFF'}  
• Medium: ${settings.priorities.medium.enabled ? '🟡 ON' : '⚪ OFF'}
• Low: ${settings.priorities.low.enabled ? '🟢 ON' : '⚪ OFF'}

🎯 **Ready to monitor your wealth opportunities 24/7!**

Configure alerts: **/alerts config**
View recent: **/alerts recent**
            `;
            
            await sendAnalysis(status, chatId, '🚨 Alert System');
            
        } catch (error) {
            logError('Failed to send alert system status:', error);
        }
    }

    // Helper Methods
    isPriceTargetHit(currentPrice, target) {
        if (target.direction === 'above') {
            return currentPrice >= target.price;
        } else {
            return currentPrice <= target.price;
        }
    }

    async isQuietHours(userId, alert) {
        const settings = await this.getUserAlertSettings(userId);
        const priority = this.alertTypes[alert.type]?.priority;
        
        if (!settings.priorities[priority]?.quietHours) {
            return false;
        }
        
        const now = new Date();
        const hour = now.getHours();
        
        return hour >= settings.quietHours.start || hour < settings.quietHours.end;
    }

    async isRateLimited(userId) {
        const settings = await this.getUserAlertSettings(userId);
        const lastHour = Date.now() - 3600000; // 1 hour ago
        
        const recentAlerts = this.alertHistory.filter(alert => 
            alert.userId === userId && alert.timestamp > lastHour
        );
        
        return recentAlerts.length >= settings.maxAlertsPerHour;
    }

    logAlert(userId, alert) {
        this.alertHistory.push({
            userId: userId,
            timestamp: Date.now(),
            type: alert.type,
            message: alert.message,
            priority: this.alertTypes[alert.type]?.priority || 'medium'
        });
        
        // Keep only last 1000 alerts
        if (this.alertHistory.length > 1000) {
            this.alertHistory = this.alertHistory.slice(-1000);
        }
    }

    getRecentAlerts(userId, hours = 24) {
        const cutoff = Date.now() - (hours * 3600000);
        return this.alertHistory.filter(alert => 
            alert.userId === userId && alert.timestamp > cutoff
        );
    }

    // Placeholder methods that would integrate with real data
    async getUserPriceTargets(userId) {
        return []; // Would fetch from database
    }

    async getUserWatchlist(userId) {
        return ['AAPL', 'TSLA', 'BTC', 'ETH']; // Would fetch from database
    }

    async getUserRiskLimits(userId) {
        return {
            maxDrawdown: 0.15,
            maxPositionSize: 0.10,
            maxLeverage: 3.0
        };
    }

    async getUserYieldThreshold(userId) {
        return 0.06; // 6% minimum yield threshold
    }

    async detectTechnicalBreakout(symbol) {
        // Would implement technical analysis
        return {
            detected: Math.random() > 0.95,
            pattern: 'ascending triangle',
            direction: 'bullish',
            strength: Math.floor(Math.random() * 10) + 1
        };
    }
}

// Export functions for easy integration
module.exports = {
    AlertSystem,
    
    // Main alert functions
    startAlerts: async (userId, chatId, preferences) => {
        const alertSystem = new AlertSystem();
        return await alertSystem.startAlertMonitoring(userId, chatId, preferences);
    },
    
    sendCustomAlert: async (userId, chatId, message, type = 'custom') => {
        const alertSystem = new AlertSystem();
        const alert = { type, message };
        return await alertSystem.sendAlert(userId, chatId, alert);
    },
    
    getAlertStatus: async (userId, chatId) => {
        const alertSystem = new AlertSystem();
        return await alertSystem.sendAlertSystemStatus(userId, chatId);
    },
    
    configureAlerts: async (userId, settings) => {
        const alertSystem = new AlertSystem();
        return await alertSystem.updateUserAlertSettings(userId, settings);
    },
    
    getAlertInsights: async (userId, chatId) => {
        const alertSystem = new AlertSystem();
        return await alertSystem.generateAlertInsights(userId, chatId);
    }
};
