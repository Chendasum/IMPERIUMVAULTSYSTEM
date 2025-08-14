// utils/tradingSignals.js
const { getUniversalAnalysis, getDualAnalysis } = require('./dualAISystem');
const { sendSmartMessage, sendAnalysis } = require('./telegramSplitter');
const { getLivePrice, getMarketData } = require('./liveData');
const { assessRisk, calculatePositionSize, getDynamicStopLoss } = require('./riskManager');
const { scanMarkets } = require('./marketScanner');
const { sendCustomAlert } = require('./alertSystem');
const { logInfo, logError, logWarning } = require('./logger');
const { saveToMemory, getFromMemory } = require('./memory');

class TradingSignals {
    constructor() {
        this.signalTypes = {
            // Momentum Signals
            macdCrossover: { name: 'MACD Crossover', strength: 'medium', timeframe: 'short', category: 'momentum' },
            rsiOversold: { name: 'RSI Oversold', strength: 'medium', timeframe: 'short', category: 'momentum' },
            rsiOverbought: { name: 'RSI Overbought', strength: 'medium', timeframe: 'short', category: 'momentum' },
            stochasticCross: { name: 'Stochastic Cross', strength: 'weak', timeframe: 'short', category: 'momentum' },
            
            // Trend Signals
            movingAverageCross: { name: 'MA Crossover', strength: 'strong', timeframe: 'medium', category: 'trend' },
            trendlineBreak: { name: 'Trendline Break', strength: 'strong', timeframe: 'medium', category: 'trend' },
            channelBreakout: { name: 'Channel Breakout', strength: 'medium', timeframe: 'medium', category: 'trend' },
            adxTrend: { name: 'ADX Trend Strength', strength: 'medium', timeframe: 'medium', category: 'trend' },
            
            // Pattern Signals
            triangleBreakout: { name: 'Triangle Breakout', strength: 'strong', timeframe: 'long', category: 'pattern' },
            headAndShoulders: { name: 'Head & Shoulders', strength: 'strong', timeframe: 'long', category: 'pattern' },
            doubleTop: { name: 'Double Top', strength: 'medium', timeframe: 'medium', category: 'pattern' },
            doubleBottom: { name: 'Double Bottom', strength: 'medium', timeframe: 'medium', category: 'pattern' },
            flagPattern: { name: 'Flag Pattern', strength: 'medium', timeframe: 'short', category: 'pattern' },
            
            // Volume Signals
            volumeSpike: { name: 'Volume Spike', strength: 'medium', timeframe: 'short', category: 'volume' },
            onBalanceVolume: { name: 'OBV Signal', strength: 'weak', timeframe: 'medium', category: 'volume' },
            volumePriceAnalysis: { name: 'Volume Price Analysis', strength: 'strong', timeframe: 'medium', category: 'volume' },
            
            // Support/Resistance Signals
            supportBounce: { name: 'Support Bounce', strength: 'medium', timeframe: 'short', category: 'levels' },
            resistanceReject: { name: 'Resistance Rejection', strength: 'medium', timeframe: 'short', category: 'levels' },
            supportBreak: { name: 'Support Break', strength: 'strong', timeframe: 'medium', category: 'levels' },
            resistanceBreak: { name: 'Resistance Break', strength: 'strong', timeframe: 'medium', category: 'levels' },
            
            // Advanced Signals
            fibonacciRetracement: { name: 'Fibonacci Signal', strength: 'medium', timeframe: 'medium', category: 'advanced' },
            ichimokuSignal: { name: 'Ichimoku Cloud', strength: 'strong', timeframe: 'long', category: 'advanced' },
            bollingerBands: { name: 'Bollinger Bands', strength: 'medium', timeframe: 'short', category: 'advanced' },
            williamsR: { name: 'Williams %R', strength: 'weak', timeframe: 'short', category: 'advanced' }
        };
        
        this.timeframes = {
            '1m': { name: '1 Minute', weight: 0.1, dataPoints: 1440 },
            '5m': { name: '5 Minutes', weight: 0.2, dataPoints: 288 },
            '15m': { name: '15 Minutes', weight: 0.3, dataPoints: 96 },
            '1h': { name: '1 Hour', weight: 0.5, dataPoints: 168 },
            '4h': { name: '4 Hours', weight: 0.7, dataPoints: 42 },
            '1d': { name: '1 Day', weight: 1.0, dataPoints: 365 },
            '1w': { name: '1 Week', weight: 0.8, dataPoints: 52 }
        };
        
        this.signalStrengths = {
            weak: { score: 1, confidence: 30, description: 'Low confidence signal' },
            medium: { score: 2, confidence: 60, description: 'Moderate confidence signal' },
            strong: { score: 3, confidence: 85, description: 'High confidence signal' }
        };
        
        this.activeSignals = new Map();
        this.signalHistory = [];
        this.watchlist = new Set();
        this.signalCache = new Map();
    }

    // 🎯 COMPREHENSIVE SIGNAL ANALYSIS
    async generateTradingSignals(symbols, timeframes, chatId) {
        try {
            logInfo('⚡ Starting comprehensive trading signal analysis');
            
            const signalAnalysis = {
                timestamp: Date.now(),
                totalSymbols: symbols.length,
                totalSignals: 0,
                signals: {},
                summary: {},
                recommendations: [],
                riskAssessment: {},
                aiInsights: ''
            };

            // Generate signals for each symbol
            for (const symbol of symbols) {
                signalAnalysis.signals[symbol] = await this.analyzeSymbolSignals(symbol, timeframes);
                signalAnalysis.totalSignals += signalAnalysis.signals[symbol].signals.length;
            }
            
            // Create signal summary
            signalAnalysis.summary = this.createSignalSummary(signalAnalysis.signals);
            
            // Generate trading recommendations
            signalAnalysis.recommendations = await this.generateTradingRecommendations(signalAnalysis.signals);
            
            // Assess overall risk
            signalAnalysis.riskAssessment = await this.assessSignalRisk(signalAnalysis.signals);
            
            // Get AI insights
            signalAnalysis.aiInsights = await this.getAISignalInsights(signalAnalysis, chatId);
            
            // Send signal report
            await this.sendTradingSignalsReport(signalAnalysis, chatId);
            
            // Save signal data
            await this.saveSignalAnalysis(signalAnalysis);
            
            return signalAnalysis;
            
        } catch (error) {
            logError('Trading signals analysis failed:', error);
            throw error;
        }
    }

    // 📊 SYMBOL SIGNAL ANALYSIS
    async analyzeSymbolSignals(symbol, timeframes) {
        try {
            const symbolAnalysis = {
                symbol: symbol,
                timestamp: Date.now(),
                signals: [],
                overallSignal: 'neutral',
                confidence: 0,
                strength: 0,
                timeframeAnalysis: {},
                priceAction: {},
                technicalIndicators: {},
                entryLevels: [],
                exitLevels: [],
                stopLoss: null,
                riskReward: null
            };

            // Get price data for all timeframes
            const priceData = await this.getPriceData(symbol, timeframes);
            
            // Analyze each timeframe
            for (const timeframe of timeframes) {
                const tfData = priceData[timeframe];
                if (!tfData) continue;
                
                const tfAnalysis = await this.analyzeTimeframe(symbol, timeframe, tfData);
                symbolAnalysis.timeframeAnalysis[timeframe] = tfAnalysis;
                
                // Add signals to main array
                symbolAnalysis.signals.push(...tfAnalysis.signals);
            }
            
            // Calculate technical indicators
            symbolAnalysis.technicalIndicators = await this.calculateTechnicalIndicators(symbol, priceData);
            
            // Analyze price action
            symbolAnalysis.priceAction = await this.analyzePriceAction(symbol, priceData);
            
            // Generate entry/exit levels
            symbolAnalysis.entryLevels = await this.generateEntryLevels(symbolAnalysis);
            symbolAnalysis.exitLevels = await this.generateExitLevels(symbolAnalysis);
            
            // Calculate stop loss and risk/reward
            const currentPrice = await getLivePrice(symbol);
            symbolAnalysis.stopLoss = await this.calculateOptimalStopLoss(symbol, symbolAnalysis, currentPrice);
            symbolAnalysis.riskReward = this.calculateRiskReward(currentPrice, symbolAnalysis.entryLevels, symbolAnalysis.stopLoss);
            
            // Determine overall signal
            symbolAnalysis.overallSignal = this.determineOverallSignal(symbolAnalysis.signals);
            symbolAnalysis.confidence = this.calculateSignalConfidence(symbolAnalysis.signals);
            symbolAnalysis.strength = this.calculateSignalStrength(symbolAnalysis.signals);
            
            return symbolAnalysis;
            
        } catch (error) {
            logError(`Signal analysis failed for ${symbol}:`, error);
            return { symbol, signals: [], error: error.message };
        }
    }

    // 📈 TIMEFRAME ANALYSIS
    async analyzeTimeframe(symbol, timeframe, priceData) {
        try {
            const analysis = {
                timeframe: timeframe,
                signals: [],
                trend: 'neutral',
                momentum: 'neutral',
                volatility: 0,
                volume: 'normal'
            };

            // Moving Average Signals
            const maSignals = await this.detectMovingAverageSignals(priceData, timeframe);
            analysis.signals.push(...maSignals);
            
            // RSI Signals
            const rsiSignals = await this.detectRSISignals(priceData, timeframe);
            analysis.signals.push(...rsiSignals);
            
            // MACD Signals
            const macdSignals = await this.detectMACDSignals(priceData, timeframe);
            analysis.signals.push(...macdSignals);
            
            // Bollinger Bands Signals
            const bbSignals = await this.detectBollingerBandsSignals(priceData, timeframe);
            analysis.signals.push(...bbSignals);
            
            // Support/Resistance Signals
            const srSignals = await this.detectSupportResistanceSignals(priceData, timeframe);
            analysis.signals.push(...srSignals);
            
            // Pattern Recognition Signals
            const patternSignals = await this.detectPatternSignals(priceData, timeframe);
            analysis.signals.push(...patternSignals);
            
            // Volume Analysis Signals
            const volumeSignals = await this.detectVolumeSignals(priceData, timeframe);
            analysis.signals.push(...volumeSignals);
            
            // Determine trend and momentum
            analysis.trend = this.determineTrend(priceData);
            analysis.momentum = this.determineMomentum(priceData);
            analysis.volatility = this.calculateVolatility(priceData);
            analysis.volume = this.analyzeVolumeProfile(priceData);
            
            return analysis;
            
        } catch (error) {
            logError(`Timeframe analysis failed for ${symbol} ${timeframe}:`, error);
            return { timeframe, signals: [], error: error.message };
        }
    }

    // 📊 TECHNICAL INDICATORS CALCULATION
    async calculateTechnicalIndicators(symbol, priceData) {
        try {
            const dailyData = priceData['1d'] || priceData['4h'] || Object.values(priceData)[0];
            if (!dailyData) return {};
            
            const indicators = {
                sma20: this.calculateSMA(dailyData, 20),
                sma50: this.calculateSMA(dailyData, 50),
                sma200: this.calculateSMA(dailyData, 200),
                ema12: this.calculateEMA(dailyData, 12),
                ema26: this.calculateEMA(dailyData, 26),
                rsi: this.calculateRSI(dailyData, 14),
                macd: this.calculateMACD(dailyData),
                bollingerBands: this.calculateBollingerBands(dailyData, 20, 2),
                atr: this.calculateATR(dailyData, 14),
                adx: this.calculateADX(dailyData, 14),
                stochastic: this.calculateStochastic(dailyData, 14),
                williamsR: this.calculateWilliamsR(dailyData, 14),
                obv: this.calculateOBV(dailyData),
                vwap: this.calculateVWAP(dailyData)
            };
            
            // Add current values
            const current = dailyData[dailyData.length - 1];
            indicators.currentPrice = current.close;
            indicators.priceChange = current.close - dailyData[dailyData.length - 2].close;
            indicators.priceChangePercent = (indicators.priceChange / dailyData[dailyData.length - 2].close) * 100;
            
            return indicators;
            
        } catch (error) {
            logError('Technical indicators calculation failed:', error);
            return {};
        }
    }

    // 🎯 MOVING AVERAGE SIGNALS
    async detectMovingAverageSignals(priceData, timeframe) {
        try {
            const signals = [];
            
            if (priceData.length < 50) return signals;
            
            const sma20 = this.calculateSMA(priceData, 20);
            const sma50 = this.calculateSMA(priceData, 50);
            const currentPrice = priceData[priceData.length - 1].close;
            
            // Golden Cross (SMA20 crosses above SMA50)
            if (sma20[sma20.length - 1] > sma50[sma50.length - 1] && 
                sma20[sma20.length - 2] <= sma50[sma50.length - 2]) {
                signals.push({
                    type: 'movingAverageCross',
                    direction: 'bullish',
                    timeframe: timeframe,
                    signal: 'Golden Cross - SMA20 above SMA50',
                    strength: 'strong',
                    confidence: 80,
                    timestamp: Date.now()
                });
            }
            
            // Death Cross (SMA20 crosses below SMA50)
            if (sma20[sma20.length - 1] < sma50[sma50.length - 1] && 
                sma20[sma20.length - 2] >= sma50[sma50.length - 2]) {
                signals.push({
                    type: 'movingAverageCross',
                    direction: 'bearish',
                    timeframe: timeframe,
                    signal: 'Death Cross - SMA20 below SMA50',
                    strength: 'strong',
                    confidence: 80,
                    timestamp: Date.now()
                });
            }
            
            // Price above/below moving averages
            if (currentPrice > sma20[sma20.length - 1] && currentPrice > sma50[sma50.length - 1]) {
                signals.push({
                    type: 'movingAverageCross',
                    direction: 'bullish',
                    timeframe: timeframe,
                    signal: 'Price above key moving averages',
                    strength: 'medium',
                    confidence: 65,
                    timestamp: Date.now()
                });
            }
            
            return signals;
            
        } catch (error) {
            logError('MA signal detection failed:', error);
            return [];
        }
    }

    // 📊 RSI SIGNALS
    async detectRSISignals(priceData, timeframe) {
        try {
            const signals = [];
            
            if (priceData.length < 14) return signals;
            
            const rsi = this.calculateRSI(priceData, 14);
            const currentRSI = rsi[rsi.length - 1];
            const previousRSI = rsi[rsi.length - 2];
            
            // RSI Oversold (below 30)
            if (currentRSI < 30 && previousRSI >= 30) {
                signals.push({
                    type: 'rsiOversold',
                    direction: 'bullish',
                    timeframe: timeframe,
                    signal: `RSI oversold at ${currentRSI.toFixed(2)}`,
                    strength: 'medium',
                    confidence: 70,
                    value: currentRSI,
                    timestamp: Date.now()
                });
            }
            
            // RSI Overbought (above 70)
            if (currentRSI > 70 && previousRSI <= 70) {
                signals.push({
                    type: 'rsiOverbought',
                    direction: 'bearish',
                    timeframe: timeframe,
                    signal: `RSI overbought at ${currentRSI.toFixed(2)}`,
                    strength: 'medium',
                    confidence: 70,
                    value: currentRSI,
                    timestamp: Date.now()
                });
            }
            
            // RSI Divergence
            const divergence = this.detectRSIDivergence(priceData, rsi);
            if (divergence.detected) {
                signals.push({
                    type: 'rsiOversold',
                    direction: divergence.type === 'bullish' ? 'bullish' : 'bearish',
                    timeframe: timeframe,
                    signal: `RSI ${divergence.type} divergence detected`,
                    strength: 'strong',
                    confidence: 85,
                    timestamp: Date.now()
                });
            }
            
            return signals;
            
        } catch (error) {
            logError('RSI signal detection failed:', error);
            return [];
        }
    }

    // ⚡ MACD SIGNALS
    async detectMACDSignals(priceData, timeframe) {
        try {
            const signals = [];
            
            if (priceData.length < 26) return signals;
            
            const macd = this.calculateMACD(priceData);
            const currentMACD = macd.macd[macd.macd.length - 1];
            const currentSignal = macd.signal[macd.signal.length - 1];
            const currentHistogram = macd.histogram[macd.histogram.length - 1];
            const previousHistogram = macd.histogram[macd.histogram.length - 2];
            
            // MACD Bullish Crossover
            if (currentMACD > currentSignal && currentHistogram > 0 && previousHistogram <= 0) {
                signals.push({
                    type: 'macdCrossover',
                    direction: 'bullish',
                    timeframe: timeframe,
                    signal: 'MACD bullish crossover',
                    strength: 'medium',
                    confidence: 75,
                    macdValue: currentMACD,
                    signalValue: currentSignal,
                    timestamp: Date.now()
                });
            }
            
            // MACD Bearish Crossover
            if (currentMACD < currentSignal && currentHistogram < 0 && previousHistogram >= 0) {
                signals.push({
                    type: 'macdCrossover',
                    direction: 'bearish',
                    timeframe: timeframe,
                    signal: 'MACD bearish crossover',
                    strength: 'medium',
                    confidence: 75,
                    macdValue: currentMACD,
                    signalValue: currentSignal,
                    timestamp: Date.now()
                });
            }
            
            return signals;
            
        } catch (error) {
            logError('MACD signal detection failed:', error);
            return [];
        }
    }

    // 📊 SUPPORT/RESISTANCE SIGNALS
    async detectSupportResistanceSignals(priceData, timeframe) {
        try {
            const signals = [];
            
            if (priceData.length < 20) return signals;
            
            const supportResistance = this.findSupportResistanceLevels(priceData);
            const currentPrice = priceData[priceData.length - 1].close;
            
            // Support bounce
            for (const support of supportResistance.support) {
                const distancePercent = Math.abs(currentPrice - support.level) / support.level;
                if (distancePercent < 0.02) { // Within 2%
                    signals.push({
                        type: 'supportBounce',
                        direction: 'bullish',
                        timeframe: timeframe,
                        signal: `Price near support at ${support.level.toFixed(2)}`,
                        strength: 'medium',
                        confidence: support.strength,
                        level: support.level,
                        timestamp: Date.now()
                    });
                }
            }
            
            // Resistance rejection
            for (const resistance of supportResistance.resistance) {
                const distancePercent = Math.abs(currentPrice - resistance.level) / resistance.level;
                if (distancePercent < 0.02) { // Within 2%
                    signals.push({
                        type: 'resistanceReject',
                        direction: 'bearish',
                        timeframe: timeframe,
                        signal: `Price near resistance at ${resistance.level.toFixed(2)}`,
                        strength: 'medium',
                        confidence: resistance.strength,
                        level: resistance.level,
                        timestamp: Date.now()
                    });
                }
            }
            
            return signals;
            
        } catch (error) {
            logError('Support/Resistance signal detection failed:', error);
            return [];
        }
    }

    // 🎯 GENERATE TRADING RECOMMENDATIONS
    async generateTradingRecommendations(signalsData) {
        try {
            const recommendations = [];
            
            for (const [symbol, analysis] of Object.entries(signalsData)) {
                if (analysis.error) continue;
                
                const recommendation = {
                    symbol: symbol,
                    action: analysis.overallSignal,
                    confidence: analysis.confidence,
                    strength: analysis.strength,
                    entryPrice: analysis.entryLevels[0]?.price || null,
                    stopLoss: analysis.stopLoss?.price || null,
                    takeProfit: analysis.exitLevels[0]?.price || null,
                    riskReward: analysis.riskReward || null,
                    timeframe: this.getBestTimeframe(analysis),
                    reasoning: this.generateReasoning(analysis),
                    risks: this.identifyRisks(analysis),
                    signals: analysis.signals.length
                };
                
                // Only include actionable recommendations
                if (recommendation.action !== 'neutral' && recommendation.confidence > 60) {
                    recommendations.push(recommendation);
                }
            }
            
            // Sort by confidence and strength
            recommendations.sort((a, b) => {
                const scoreA = a.confidence * a.strength;
                const scoreB = b.confidence * b.strength;
                return scoreB - scoreA;
            });
            
            return recommendations.slice(0, 10); // Top 10 recommendations
            
        } catch (error) {
            logError('Trading recommendations generation failed:', error);
            return [];
        }
    }

    // 🤖 AI SIGNAL INSIGHTS
    async getAISignalInsights(signalAnalysis, chatId) {
        try {
            const prompt = `
            Analyze these comprehensive trading signals and provide strategic insights:
            
            Signal Analysis Summary:
            - Total Symbols: ${signalAnalysis.totalSymbols}
            - Total Signals: ${signalAnalysis.totalSignals}
            - Top Recommendations: ${JSON.stringify(signalAnalysis.recommendations.slice(0, 5))}
            
            Signal Distribution:
            ${Object.entries(signalAnalysis.summary).map(([type, count]) => 
                `- ${type}: ${count} signals`
            ).join('\n')}
            
            Risk Assessment: ${JSON.stringify(signalAnalysis.riskAssessment)}
            
            Provide:
            1. Market condition assessment from signals
            2. Best trading opportunities analysis
            3. Risk management recommendations
            4. Entry/exit timing guidance
            5. Market sentiment interpretation
            6. Signal reliability assessment
            7. Portfolio impact considerations
            `;
            
            const insights = await getDualAnalysis(prompt, {
                chatId: chatId,
                context: 'trading_signals',
                priority: 'high'
            });
            
            return insights;
            
        } catch (error) {
            logError('AI signal insights failed:', error);
            return 'Signal insights unavailable';
        }
    }

    // 📱 SEND TRADING SIGNALS REPORT
    async sendTradingSignalsReport(signalAnalysis, chatId) {
        try {
            const topRecommendations = signalAnalysis.recommendations.slice(0, 5);
            const summary = signalAnalysis.summary;
            
            const report = `
⚡ **COMPREHENSIVE TRADING SIGNALS REPORT** 📊

**📈 SIGNAL SUMMARY:**
• Total Symbols Analyzed: **${signalAnalysis.totalSymbols}**
• Total Signals Generated: **${signalAnalysis.totalSignals}**
• Actionable Recommendations: **${signalAnalysis.recommendations.length}**

**🎯 TOP TRADING OPPORTUNITIES:**
${topRecommendations.map((rec, i) => 
    `${i + 1}. **${rec.symbol}** - ${rec.action.toUpperCase()}
   • Confidence: **${rec.confidence}%**
   • Entry: $${rec.entryPrice?.toFixed(2) || 'Market'}
   • Stop Loss: $${rec.stopLoss?.toFixed(2) || 'TBD'}
   • Risk/Reward: **${rec.riskReward?.toFixed(2) || 'N/A'}:1**
   • Signals: ${rec.signals}`
).join('\n\n')}

**📊 SIGNAL BREAKDOWN:**
${Object.entries(summary).slice(0, 6).map(([type, count]) => 
    `• **${type.replace(/([A-Z])/g, ' $1').trim()}**: ${count} signals`
).join('\n')}

**🛡️ RISK ASSESSMENT:**
• Overall Market Risk: **${signalAnalysis.riskAssessment.overallRisk || 'Medium'}**
• Signal Reliability: **${signalAnalysis.riskAssessment.reliability || 75}%**
• Recommended Position Size: **${signalAnalysis.riskAssessment.positionSize || 2}%** per trade

**🤖 AI INSIGHTS:**
${signalAnalysis.aiInsights}

**📋 TRADING GUIDELINES:**
1. Never risk more than 2% per trade
2. Always use stop losses
3. Confirm signals across timeframes
4. Consider market conditions
5. Monitor risk/reward ratios

⚠️ **Disclaimer**: Signals are for educational purposes. Always do your own research and manage risk carefully.

🔄 Next signal update: **Every 15 minutes**
            `;
            
            await sendAnalysis(report, chatId, '⚡ Trading Signals');
            
            // Send individual high-confidence alerts
            for (const rec of topRecommendations.slice(0, 3)) {
                if (rec.confidence > 80) {
                    const alertMessage = `⚡ **HIGH CONFIDENCE SIGNAL**\n${rec.symbol} - ${rec.action.toUpperCase()}\nConfidence: ${rec.confidence}%\nEntry: $${rec.entryPrice?.toFixed(2) || 'Market'}`;
                    await sendCustomAlert('trading_signal', chatId, alertMessage, 'tradingSignal');
                }
            }
            
        } catch (error) {
            logError('Failed to send trading signals report:', error);
        }
    }

    // 📊 TECHNICAL INDICATOR CALCULATIONS
    calculateSMA(data, period) {
        const sma = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
            sma.push(sum / period);
        }
        return sma;
    }

    calculateEMA(data, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);
        
        // Start with SMA for first value
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i].close;
        }
        ema.push(sum / period);
        
        // Calculate EMA for remaining values
        for (let i = period; i < data.length; i++) {
            const currentEMA = (data[i].close * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
            ema.push(currentEMA);
        }
        
        return ema;
    }

    calculateRSI(data, period = 14) {
        const rsi = [];
        const changes = [];
        
        // Calculate price changes
        for (let i = 1; i < data.length; i++) {
            changes.push(data[i].close - data[i - 1].close);
        }
        
        // Calculate initial average gains and losses
        let avgGain = 0;
        let avgLoss = 0;
        
        for (let i = 0; i < period; i++) {
            if (changes[i] > 0) avgGain += changes[i];
            else avgLoss += Math.abs(changes[i]);
        }
        
        avgGain /= period;
        avgLoss /= period;
        
                    // Calculate RSI
        for (let i = period; i < changes.length; i++) {
            const gain = changes[i] > 0 ? changes[i] : 0;
            const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
            
            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;
            
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsiValue = 100 - (100 / (1 + rs));
            rsi.push(rsiValue);
        }
        
        return rsi;
    }

    calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const emaFast = this.calculateEMA(data, fastPeriod);
        const emaSlow = this.calculateEMA(data, slowPeriod);
        
        const macdLine = [];
        const signalLine = [];
        const histogram = [];
        
        // Calculate MACD line
        const startIndex = slowPeriod - fastPeriod;
        for (let i = 0; i < emaFast.length - startIndex; i++) {
            macdLine.push(emaFast[i + startIndex] - emaSlow[i]);
        }
        
        // Calculate signal line (EMA of MACD)
        const macdData = macdLine.map(val => ({ close: val }));
        const signal = this.calculateEMA(macdData, signalPeriod);
        
        // Calculate histogram
        const histogramStartIndex = signalPeriod - 1;
        for (let i = 0; i < signal.length; i++) {
            histogram.push(macdLine[i + histogramStartIndex] - signal[i]);
        }
        
        return {
            macd: macdLine,
            signal: signal,
            histogram: histogram
        };
    }

    calculateBollingerBands(data, period = 20, standardDeviations = 2) {
        const sma = this.calculateSMA(data, period);
        const upperBand = [];
        const lowerBand = [];
        
        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const mean = sma[i - period + 1];
            
            // Calculate standard deviation
            const squaredDiffs = slice.map(val => Math.pow(val.close - mean, 2));
            const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
            const stdDev = Math.sqrt(variance);
            
            upperBand.push(mean + (standardDeviations * stdDev));
            lowerBand.push(mean - (standardDeviations * stdDev));
        }
        
        return {
            upper: upperBand,
            middle: sma,
            lower: lowerBand
        };
    }

    calculateATR(data, period = 14) {
        const trueRanges = [];
        
        for (let i = 1; i < data.length; i++) {
            const high = data[i].high;
            const low = data[i].low;
            const prevClose = data[i - 1].close;
            
            const tr1 = high - low;
            const tr2 = Math.abs(high - prevClose);
            const tr3 = Math.abs(low - prevClose);
            
            trueRanges.push(Math.max(tr1, tr2, tr3));
        }
        
        // Calculate ATR as SMA of true ranges
        const atr = [];
        for (let i = period - 1; i < trueRanges.length; i++) {
            const sum = trueRanges.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
            atr.push(sum / period);
        }
        
        return atr;
    }

    calculateStochastic(data, period = 14) {
        const stochastic = [];
        
        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const highest = Math.max(...slice.map(d => d.high));
            const lowest = Math.min(...slice.map(d => d.low));
            const current = data[i].close;
            
            const kPercent = ((current - lowest) / (highest - lowest)) * 100;
            stochastic.push(kPercent);
        }
        
        return stochastic;
    }

    calculateOBV(data) {
        const obv = [0];
        
        for (let i = 1; i < data.length; i++) {
            const priceChange = data[i].close - data[i - 1].close;
            const volume = data[i].volume || 1;
            
            if (priceChange > 0) {
                obv.push(obv[obv.length - 1] + volume);
            } else if (priceChange < 0) {
                obv.push(obv[obv.length - 1] - volume);
            } else {
                obv.push(obv[obv.length - 1]);
            }
        }
        
        return obv;
    }

    calculateVWAP(data) {
        let cumulativeVolume = 0;
        let cumulativeVolumePrice = 0;
        const vwap = [];
        
        for (let i = 0; i < data.length; i++) {
            const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
            const volume = data[i].volume || 1;
            
            cumulativeVolumePrice += typicalPrice * volume;
            cumulativeVolume += volume;
            
            vwap.push(cumulativeVolumePrice / cumulativeVolume);
        }
        
        return vwap;
    }

    // 🔍 PATTERN DETECTION
    async detectPatternSignals(priceData, timeframe) {
        try {
            const signals = [];
            
            if (priceData.length < 20) return signals;
            
            // Double top/bottom detection
            const doublePattern = this.detectDoubleTopBottom(priceData);
            if (doublePattern.detected) {
                signals.push({
                    type: doublePattern.type === 'top' ? 'doubleTop' : 'doubleBottom',
                    direction: doublePattern.type === 'top' ? 'bearish' : 'bullish',
                    timeframe: timeframe,
                    signal: `${doublePattern.type === 'top' ? 'Double Top' : 'Double Bottom'} pattern detected`,
                    strength: 'medium',
                    confidence: doublePattern.confidence,
                    timestamp: Date.now()
                });
            }
            
            // Triangle breakout detection
            const trianglePattern = this.detectTriangleBreakout(priceData);
            if (trianglePattern.detected) {
                signals.push({
                    type: 'triangleBreakout',
                    direction: trianglePattern.direction,
                    timeframe: timeframe,
                    signal: `${trianglePattern.type} triangle breakout`,
                    strength: 'strong',
                    confidence: trianglePattern.confidence,
                    timestamp: Date.now()
                });
            }
            
            // Head and shoulders detection
            const hsPattern = this.detectHeadAndShoulders(priceData);
            if (hsPattern.detected) {
                signals.push({
                    type: 'headAndShoulders',
                    direction: hsPattern.type === 'top' ? 'bearish' : 'bullish',
                    timeframe: timeframe,
                    signal: `Head and shoulders ${hsPattern.type} pattern`,
                    strength: 'strong',
                    confidence: hsPattern.confidence,
                    timestamp: Date.now()
                });
            }
            
            return signals;
            
        } catch (error) {
            logError('Pattern detection failed:', error);
            return [];
        }
    }

    // 📈 VOLUME ANALYSIS
    async detectVolumeSignals(priceData, timeframe) {
        try {
            const signals = [];
            
            if (priceData.length < 20) return signals;
            
            const volumes = priceData.map(d => d.volume || 1);
            const avgVolume = volumes.slice(-20).reduce((sum, vol) => sum + vol, 0) / 20;
            const currentVolume = volumes[volumes.length - 1];
            
            // Volume spike detection
            if (currentVolume > avgVolume * 2) {
                const priceChange = priceData[priceData.length - 1].close - priceData[priceData.length - 2].close;
                const direction = priceChange > 0 ? 'bullish' : 'bearish';
                
                signals.push({
                    type: 'volumeSpike',
                    direction: direction,
                    timeframe: timeframe,
                    signal: `Volume spike: ${(currentVolume / avgVolume).toFixed(2)}x average`,
                    strength: 'medium',
                    confidence: 75,
                    volumeRatio: currentVolume / avgVolume,
                    timestamp: Date.now()
                });
            }
            
            // Price-volume divergence
            const pvDivergence = this.detectPriceVolumeDivergence(priceData);
            if (pvDivergence.detected) {
                signals.push({
                    type: 'volumePriceAnalysis',
                    direction: pvDivergence.type,
                    timeframe: timeframe,
                    signal: `Price-volume divergence detected`,
                    strength: 'medium',
                    confidence: pvDivergence.confidence,
                    timestamp: Date.now()
                });
            }
            
            return signals;
            
        } catch (error) {
            logError('Volume signal detection failed:', error);
            return [];
        }
    }

    // 🎯 SIGNAL PROCESSING HELPERS
    determineOverallSignal(signals) {
        if (signals.length === 0) return 'neutral';
        
        let bullishScore = 0;
        let bearishScore = 0;
        
        signals.forEach(signal => {
            const weight = this.signalStrengths[signal.strength]?.score || 1;
            const confidence = signal.confidence || 50;
            const score = weight * (confidence / 100);
            
            if (signal.direction === 'bullish') {
                bullishScore += score;
            } else if (signal.direction === 'bearish') {
                bearishScore += score;
            }
        });
        
        const threshold = 0.5;
        if (bullishScore > bearishScore + threshold) return 'bullish';
        if (bearishScore > bullishScore + threshold) return 'bearish';
        return 'neutral';
    }

    calculateSignalConfidence(signals) {
        if (signals.length === 0) return 0;
        
        const totalConfidence = signals.reduce((sum, signal) => sum + (signal.confidence || 50), 0);
        const avgConfidence = totalConfidence / signals.length;
        
        // Boost confidence if multiple signals agree
        const directions = signals.map(s => s.direction);
        const bullishCount = directions.filter(d => d === 'bullish').length;
        const bearishCount = directions.filter(d => d === 'bearish').length;
        const consensus = Math.max(bullishCount, bearishCount) / signals.length;
        
        return Math.min(100, avgConfidence * (1 + consensus * 0.3));
    }

    calculateSignalStrength(signals) {
        if (signals.length === 0) return 0;
        
        const strengthScores = signals.map(signal => this.signalStrengths[signal.strength]?.score || 1);
        const avgStrength = strengthScores.reduce((sum, score) => sum + score, 0) / strengthScores.length;
        
        return Math.min(10, avgStrength * 3);
    }

    createSignalSummary(signalsData) {
        const summary = {};
        
        Object.values(signalsData).forEach(analysis => {
            if (analysis.signals) {
                analysis.signals.forEach(signal => {
                    summary[signal.type] = (summary[signal.type] || 0) + 1;
                });
            }
        });
        
        return summary;
    }

    // 📊 HELPER METHODS
    async getPriceData(symbol, timeframes) {
        // This would integrate with your liveData.js to get real price data
        // For now, return mock data structure
        const mockData = {};
        
        timeframes.forEach(tf => {
            mockData[tf] = this.generateMockPriceData(100); // 100 data points
        });
        
        return mockData;
    }

    generateMockPriceData(length) {
        const data = [];
        let price = 100;
        
        for (let i = 0; i < length; i++) {
            const change = (Math.random() - 0.5) * 4; // ±2% change
            price += change;
            
            data.push({
                timestamp: Date.now() - (length - i) * 3600000, // 1 hour intervals
                open: price,
                high: price + Math.random() * 2,
                low: price - Math.random() * 2,
                close: price,
                volume: Math.floor(Math.random() * 1000000) + 100000
            });
        }
        
        return data;
    }

    async saveSignalAnalysis(signalAnalysis) {
        await saveToMemory(`trading_signals_${Date.now()}`, signalAnalysis);
        this.signalHistory.push(signalAnalysis.timestamp);
        
        // Keep only last 50 signal analyses
        if (this.signalHistory.length > 50) {
            this.signalHistory.shift();
        }
    }
}

// Export functions for easy integration
module.exports = {
    TradingSignals,
    
    // Main signal functions
    generateSignals: async (symbols, timeframes, chatId) => {
        const signals = new TradingSignals();
        return await signals.generateTradingSignals(symbols, timeframes, chatId);
    },
    
    analyzeSymbol: async (symbol, timeframes, chatId) => {
        const signals = new TradingSignals();
        const analysis = await signals.generateTradingSignals([symbol], timeframes, chatId);
        return analysis.signals[symbol];
    },
    
    getQuickSignals: async (symbols, chatId) => {
        const signals = new TradingSignals();
        return await signals.generateTradingSignals(symbols, ['1h', '1d'], chatId);
    },
    
    scanForSignals: async (chatId, minConfidence = 70) => {
        const signals = new TradingSignals();
        const watchlist = ['AAPL', 'TSLA', 'BTC', 'ETH', 'SPY', 'QQQ']; // Default watchlist
        const analysis = await signals.generateTradingSignals(watchlist, ['1h', '4h', '1d'], chatId);
        
        return analysis.recommendations.filter(rec => rec.confidence >= minConfidence);
    },
    
    getSignalInsights: async (signalData, chatId) => {
        const signals = new TradingSignals();
        return await signals.getAISignalInsights(signalData, chatId);
    }
};
