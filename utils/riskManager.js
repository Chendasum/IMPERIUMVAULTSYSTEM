// utils/riskManager.js
const { getUniversalAnalysis, getDualAnalysis } = require('./dualAISystem');
const { sendSmartMessage, sendAnalysis } = require('./telegramSplitter');
const { getLivePrice, getMarketData } = require('./liveData');
const { getPositions, getAccountInfo } = require('./metaTrader');
const { logInfo, logError, logWarning } = require('./logger');
const { saveToMemory, getFromMemory } = require('./memory');

class RiskManager {
    constructor() {
        this.riskLimits = {
            maxDrawdown: 0.15, // 15% max account drawdown
            maxPositionSize: 0.05, // 5% max per position
            maxCorrelation: 0.7, // 70% max correlation between positions
            maxLeverage: 10, // 10:1 max leverage
            maxDailyRisk: 0.02, // 2% max daily risk
            stopLossMultiplier: 2.0, // 2x ATR for stop loss
            profitTargetMultiplier: 3.0 // 3:1 risk/reward ratio
        };
        
        this.volatilityCache = new Map();
        this.correlationCache = new Map();
        this.lastRiskCheck = 0;
    }

    // 🎯 Main Risk Assessment Function
    async assessPortfolioRisk(chatId) {
        try {
            logInfo('🛡️ Starting portfolio risk assessment');
            
            const accountInfo = await getAccountInfo();
            const positions = await getPositions();
            const marketData = await this.getMarketRiskData();
            
            const riskMetrics = {
                accountRisk: await this.calculateAccountRisk(accountInfo),
                positionRisk: await this.calculatePositionRisk(positions),
                marketRisk: await this.calculateMarketRisk(marketData),
                correlationRisk: await this.calculateCorrelationRisk(positions),
                liquidityRisk: await this.calculateLiquidityRisk(positions),
                timestamp: Date.now()
            };
            
            const overallRisk = this.calculateOverallRiskScore(riskMetrics);
            riskMetrics.overallRiskScore = overallRisk;
            riskMetrics.riskLevel = this.getRiskLevel(overallRisk);
            
            // Get dual AI analysis
            const aiAnalysis = await this.getAIRiskAnalysis(riskMetrics, chatId);
            
            // Send formatted analysis
            await this.sendRiskReport(riskMetrics, aiAnalysis, chatId);
            
            // Save for historical tracking
            await this.saveRiskMetrics(riskMetrics);
            
            return riskMetrics;
            
        } catch (error) {
            logError('Risk assessment failed:', error);
            throw error;
        }
    }

    // 💰 Position Sizing Calculator
    async calculateOptimalPositionSize(symbol, accountBalance, stopLossPrice, entryPrice) {
        try {
            const riskAmount = accountBalance * this.riskLimits.maxPositionSize;
            const priceDistance = Math.abs(entryPrice - stopLossPrice);
            const positionSize = riskAmount / priceDistance;
            
            // Get volatility adjustment
            const volatility = await this.getSymbolVolatility(symbol);
            const volatilityAdjustment = Math.max(0.5, Math.min(2.0, 1 / volatility));
            
            const adjustedSize = positionSize * volatilityAdjustment;
            
            // Ensure within limits
            const maxPositionValue = accountBalance * this.riskLimits.maxPositionSize;
            const finalSize = Math.min(adjustedSize, maxPositionValue / entryPrice);
            
            logInfo(`📊 Optimal position size for ${symbol}: ${finalSize}`);
            
            return {
                optimalSize: finalSize,
                riskAmount: riskAmount,
                riskPercent: (riskAmount / accountBalance) * 100,
                volatilityAdjustment: volatilityAdjustment,
                stopLoss: stopLossPrice,
                riskRewardRatio: Math.abs(entryPrice - stopLossPrice) / (entryPrice * this.riskLimits.profitTargetMultiplier)
            };
            
        } catch (error) {
            logError('Position sizing calculation failed:', error);
            throw error;
        }
    }

    // 📈 Dynamic Stop Loss Calculator
    async calculateDynamicStopLoss(symbol, entryPrice, direction = 'long') {
        try {
            const atr = await this.getATR(symbol);
            const volatility = await this.getSymbolVolatility(symbol);
            
            // Adjust stop loss based on volatility
            const stopLossDistance = atr * this.riskLimits.stopLossMultiplier * (1 + volatility);
            
            const stopLoss = direction === 'long' 
                ? entryPrice - stopLossDistance 
                : entryPrice + stopLossDistance;
                
            const profitTarget = direction === 'long'
                ? entryPrice + (stopLossDistance * this.riskLimits.profitTargetMultiplier)
                : entryPrice - (stopLossDistance * this.riskLimits.profitTargetMultiplier);
            
            return {
                stopLoss: stopLoss,
                profitTarget: profitTarget,
                riskAmount: stopLossDistance,
                rewardAmount: stopLossDistance * this.riskLimits.profitTargetMultiplier,
                riskRewardRatio: this.riskLimits.profitTargetMultiplier,
                atr: atr,
                volatilityAdjustment: volatility
            };
            
        } catch (error) {
            logError('Dynamic stop loss calculation failed:', error);
            throw error;
        }
    }

    // 🚨 Real-time Risk Monitoring
    async monitorRealTimeRisk(chatId) {
        try {
            const now = Date.now();
            if (now - this.lastRiskCheck < 60000) return; // Check every minute
            
            this.lastRiskCheck = now;
            
            const positions = await getPositions();
            const accountInfo = await getAccountInfo();
            
            // Check for risk limit breaches
            const riskAlerts = [];
            
            // Check drawdown
            const currentDrawdown = this.calculateCurrentDrawdown(accountInfo);
            if (currentDrawdown > this.riskLimits.maxDrawdown) {
                riskAlerts.push({
                    type: 'CRITICAL',
                    message: `🚨 DRAWDOWN ALERT: ${(currentDrawdown * 100).toFixed(2)}% exceeds limit of ${(this.riskLimits.maxDrawdown * 100).toFixed(2)}%`,
                    action: 'REDUCE_POSITIONS'
                });
            }
            
            // Check position sizes
            for (const position of positions) {
                const positionRisk = await this.calculateSinglePositionRisk(position, accountInfo.balance);
                if (positionRisk > this.riskLimits.maxPositionSize) {
                    riskAlerts.push({
                        type: 'WARNING',
                        message: `⚠️ Position ${position.symbol} risk: ${(positionRisk * 100).toFixed(2)}%`,
                        action: 'REDUCE_SIZE'
                    });
                }
            }
            
            // Send alerts if any
            if (riskAlerts.length > 0) {
                await this.sendRiskAlerts(riskAlerts, chatId);
            }
            
        } catch (error) {
            logError('Real-time risk monitoring failed:', error);
        }
    }

    // 📊 Value at Risk (VaR) Calculation
    async calculateVaR(positions, confidenceLevel = 0.95, timeHorizon = 1) {
        try {
            const portfolioValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
            const portfolioReturns = await this.getPortfolioReturns(positions);
            
            // Calculate portfolio volatility
            const volatility = this.calculateVolatility(portfolioReturns);
            
            // Z-score for confidence level
            const zScore = this.getZScore(confidenceLevel);
            
            // VaR calculation
            const dailyVaR = portfolioValue * volatility * zScore * Math.sqrt(timeHorizon);
            
            return {
                valueAtRisk: dailyVaR,
                confidenceLevel: confidenceLevel,
                timeHorizon: timeHorizon,
                portfolioValue: portfolioValue,
                portfolioVolatility: volatility,
                varPercent: (dailyVaR / portfolioValue) * 100
            };
            
        } catch (error) {
            logError('VaR calculation failed:', error);
            return null;
        }
    }

    // 🔄 Correlation Analysis
    async calculateCorrelationRisk(positions) {
        try {
            if (positions.length < 2) return { averageCorrelation: 0, maxCorrelation: 0, riskScore: 0 };
            
            const correlations = [];
            
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    const correlation = await this.getCorrelation(positions[i].symbol, positions[j].symbol);
                    correlations.push(Math.abs(correlation));
                }
            }
            
            const avgCorrelation = correlations.reduce((sum, corr) => sum + corr, 0) / correlations.length;
            const maxCorrelation = Math.max(...correlations);
            
            const riskScore = maxCorrelation > this.riskLimits.maxCorrelation ? 
                (maxCorrelation - this.riskLimits.maxCorrelation) * 10 : 0;
            
            return {
                averageCorrelation: avgCorrelation,
                maxCorrelation: maxCorrelation,
                riskScore: riskScore,
                diversificationBenefit: 1 - avgCorrelation
            };
            
        } catch (error) {
            logError('Correlation analysis failed:', error);
            return { averageCorrelation: 0, maxCorrelation: 0, riskScore: 0 };
        }
    }

    // 🤖 AI-Enhanced Risk Analysis
    async getAIRiskAnalysis(riskMetrics, chatId) {
        try {
            const prompt = `
            Analyze this portfolio risk assessment and provide actionable insights:
            
            Risk Metrics:
            - Overall Risk Score: ${riskMetrics.overallRiskScore}/100
            - Risk Level: ${riskMetrics.riskLevel}
            - Account Risk: ${JSON.stringify(riskMetrics.accountRisk)}
            - Position Risk: ${JSON.stringify(riskMetrics.positionRisk)}
            - Market Risk: ${JSON.stringify(riskMetrics.marketRisk)}
            - Correlation Risk: ${JSON.stringify(riskMetrics.correlationRisk)}
            
            Provide:
            1. Risk assessment summary
            2. Top 3 risk concerns
            3. Specific risk mitigation actions
            4. Position sizing recommendations
            5. Market outlook impact on risk
            `;
            
            const analysis = await getDualAnalysis(prompt, {
                chatId: chatId,
                context: 'risk_management',
                priority: 'high'
            });
            
            return analysis;
            
        } catch (error) {
            logError('AI risk analysis failed:', error);
            return 'Risk analysis unavailable';
        }
    }

    // 📱 Send Risk Report
    async sendRiskReport(riskMetrics, aiAnalysis, chatId) {
        try {
            const riskEmoji = this.getRiskEmoji(riskMetrics.riskLevel);
            
            const report = `
🛡️ **PORTFOLIO RISK ASSESSMENT** ${riskEmoji}

📊 **Overall Risk Score:** ${riskMetrics.overallRiskScore}/100
🎯 **Risk Level:** ${riskMetrics.riskLevel}

💰 **Account Risk:**
• Drawdown: ${(riskMetrics.accountRisk.currentDrawdown * 100).toFixed(2)}%
• Daily Risk: ${(riskMetrics.accountRisk.dailyRisk * 100).toFixed(2)}%
• Leverage: ${riskMetrics.accountRisk.leverage.toFixed(2)}x

📈 **Position Risk:**
• Largest Position: ${(riskMetrics.positionRisk.largestPosition * 100).toFixed(2)}%
• Total Exposure: ${(riskMetrics.positionRisk.totalExposure * 100).toFixed(2)}%
• Risk Score: ${riskMetrics.positionRisk.riskScore.toFixed(1)}

🔄 **Diversification:**
• Max Correlation: ${(riskMetrics.correlationRisk.maxCorrelation * 100).toFixed(1)}%
• Diversification Benefit: ${(riskMetrics.correlationRisk.diversificationBenefit * 100).toFixed(1)}%

🤖 **AI Analysis:**
${aiAnalysis}
            `;
            
            await sendAnalysis(report, chatId, '🛡️ Risk Management');
            
        } catch (error) {
            logError('Failed to send risk report:', error);
        }
    }

    // 🚨 Send Risk Alerts
    async sendRiskAlerts(alerts, chatId) {
        try {
            const alertMessage = alerts.map(alert => 
                `${alert.type === 'CRITICAL' ? '🚨' : '⚠️'} ${alert.message}\n💡 Action: ${alert.action}`
            ).join('\n\n');
            
            await sendSmartMessage(`🛡️ **RISK ALERTS**\n\n${alertMessage}`, chatId);
            
        } catch (error) {
            logError('Failed to send risk alerts:', error);
        }
    }

    // Helper Functions
    calculateOverallRiskScore(metrics) {
        const weights = {
            accountRisk: 0.3,
            positionRisk: 0.25,
            marketRisk: 0.2,
            correlationRisk: 0.15,
            liquidityRisk: 0.1
        };
        
        return (
            (metrics.accountRisk.riskScore || 0) * weights.accountRisk +
            (metrics.positionRisk.riskScore || 0) * weights.positionRisk +
            (metrics.marketRisk.riskScore || 0) * weights.marketRisk +
            (metrics.correlationRisk.riskScore || 0) * weights.correlationRisk +
            (metrics.liquidityRisk.riskScore || 0) * weights.liquidityRisk
        );
    }

    getRiskLevel(score) {
        if (score < 20) return 'LOW';
        if (score < 40) return 'MODERATE';
        if (score < 60) return 'HIGH';
        if (score < 80) return 'VERY HIGH';
        return 'EXTREME';
    }

    getRiskEmoji(level) {
        const emojis = {
            'LOW': '🟢',
            'MODERATE': '🟡',
            'HIGH': '🟠',
            'VERY HIGH': '🔴',
            'EXTREME': '⚫'
        };
        return emojis[level] || '❓';
    }

    async saveRiskMetrics(metrics) {
        await saveToMemory(`risk_metrics_${Date.now()}`, metrics);
        
        // Keep only last 100 entries
        const keys = await getFromMemory('risk_metric_keys') || [];
        keys.push(`risk_metrics_${Date.now()}`);
        
        if (keys.length > 100) {
            const oldKey = keys.shift();
            // Could implement cleanup here
        }
        
        await saveToMemory('risk_metric_keys', keys);
    }

    // Placeholder methods that would integrate with your liveData.js and metaTrader.js
    async getSymbolVolatility(symbol) {
        // Implementation would use your liveData.js
        return 0.02; // 2% daily volatility as default
    }

    async getATR(symbol, period = 14) {
        // Implementation would use your liveData.js for ATR calculation
        return 0.001; // Default ATR value
    }

    async getCorrelation(symbol1, symbol2) {
        // Implementation would calculate correlation using historical data
        return 0.5; // Default correlation
    }

    getZScore(confidenceLevel) {
        const zScores = {
            0.90: 1.28,
            0.95: 1.645,
            0.99: 2.33
        };
        return zScores[confidenceLevel] || 1.645;
    }
}

// Export functions for your existing system integration
module.exports = {
    RiskManager,
    
    // Main functions for easy integration
    assessRisk: async (chatId) => {
        const rm = new RiskManager();
        return await rm.assessPortfolioRisk(chatId);
    },
    
    calculatePositionSize: async (symbol, accountBalance, stopLoss, entryPrice) => {
        const rm = new RiskManager();
        return await rm.calculateOptimalPositionSize(symbol, accountBalance, stopLoss, entryPrice);
    },
    
    getDynamicStopLoss: async (symbol, entryPrice, direction) => {
        const rm = new RiskManager();
        return await rm.calculateDynamicStopLoss(symbol, entryPrice, direction);
    },
    
    monitorRisk: async (chatId) => {
        const rm = new RiskManager();
        return await rm.monitorRealTimeRisk(chatId);
    },
    
    calculateVaR: async (positions) => {
        const rm = new RiskManager();
        return await rm.calculateVaR(positions);
    }
};
