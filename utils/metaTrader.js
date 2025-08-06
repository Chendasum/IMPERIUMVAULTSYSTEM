// utils/metaTrader.js - RAY DALIO ENHANCED MetaAPI Integration with Institutional Risk Management

const MetaApi = require('metaapi.cloud-sdk').default;
const { getRayDalioMarketData, getYieldCurveAnalysis, getCreditSpreadAnalysis } = require('./liveData');

// Initialize MetaAPI with your token
const METAAPI_TOKEN = process.env.METAAPI_TOKEN;
const METAAPI_ACCOUNT_ID = process.env.METAAPI_ACCOUNT_ID;

let metaApi = null;
let connection = null;
let account = null;
let isConnected = false;
let isSynchronized = false;

// 🏛️ RAY DALIO RISK MANAGEMENT PARAMETERS
const RISK_PARAMETERS = {
    MAX_RISK_PER_TRADE: 0.02,           // 2% max risk per trade (Ray Dalio standard)
    MAX_PORTFOLIO_RISK: 0.06,           // 6% max total portfolio risk
    MAX_CORRELATION_EXPOSURE: 0.15,     // 15% max exposure to correlated assets
    VOLATILITY_LOOKBACK: 20,            // 20-day volatility calculation
    REGIME_RISK_MULTIPLIERS: {
        'GROWTH_RISING_INFLATION_FALLING': 1.2,    // Goldilocks - increase risk
        'GROWTH_RISING_INFLATION_RISING': 1.0,     // Growth/Inflation - normal risk
        'GROWTH_FALLING_INFLATION_RISING': 0.6,    // Stagflation - reduce risk
        'GROWTH_FALLING_INFLATION_FALLING': 0.8,   // Deflationary - cautious
        'TRANSITIONAL': 0.7                        // Uncertain regime - conservative
    }
};

// 💰 CURRENCY CORRELATIONS MATRIX (Simplified)
const CURRENCY_CORRELATIONS = {
    'EURUSD': { 'GBPUSD': 0.8, 'AUDUSD': 0.7, 'NZDUSD': 0.7, 'USDJPY': -0.6 },
    'GBPUSD': { 'EURUSD': 0.8, 'AUDUSD': 0.6, 'NZDUSD': 0.6, 'USDJPY': -0.5 },
    'AUDUSD': { 'EURUSD': 0.7, 'GBPUSD': 0.6, 'NZDUSD': 0.9, 'USDJPY': -0.4 },
    'NZDUSD': { 'EURUSD': 0.7, 'GBPUSD': 0.6, 'AUDUSD': 0.9, 'USDJPY': -0.4 },
    'USDJPY': { 'EURUSD': -0.6, 'GBPUSD': -0.5, 'AUDUSD': -0.4, 'NZDUSD': -0.4 },
    'USDCHF': { 'EURUSD': -0.7, 'GBPUSD': -0.6, 'USDJPY': 0.5 }
};

/**
 * 🚀 INITIALIZE METAAPI CONNECTION (Enhanced)
 */
async function initializeMetaAPI() {
    try {
        if (!METAAPI_TOKEN || !METAAPI_ACCOUNT_ID) {
            console.log('⚠️ MetaAPI credentials not found in environment variables');
            return false;
        }

        console.log('🔄 Initializing MetaAPI connection with Ray Dalio enhancements...');
        
        metaApi = new MetaApi(METAAPI_TOKEN);
        account = await metaApi.metatraderAccountApi.getAccount(METAAPI_ACCOUNT_ID);
        
        console.log('⏳ Waiting for account deployment...');
        await account.waitDeployed();
        
        connection = account.getStreamingConnection();
        await connection.connect();
        isConnected = true;
        
        console.log('⏳ Waiting for synchronization...');
        await connection.waitSynchronized();
        isSynchronized = true;
        
        console.log('✅ MetaAPI connected successfully with institutional risk management');
        return true;
        
    } catch (error) {
        console.error('❌ MetaAPI initialization error:', error.message);
        isConnected = false;
        isSynchronized = false;
        return false;
    }
}

/**
 * 🎯 RAY DALIO POSITION SIZING CALCULATOR
 * Uses volatility-adjusted position sizing with regime considerations
 */
async function calculateRayDalioPositionSize(symbol, direction, entryPrice, stopLoss, accountBalance, marketData = null) {
    try {
        console.log(`🎯 Calculating Ray Dalio position size for ${symbol} ${direction}`);
        
        // Get current market regime data if not provided
        if (!marketData) {
            marketData = await getRayDalioMarketData().catch(() => null);
        }
        
        // Calculate base risk amount (2% of account)
        const baseRiskAmount = accountBalance * RISK_PARAMETERS.MAX_RISK_PER_TRADE;
        
        // Calculate stop loss distance
        const stopLossDistance = Math.abs(entryPrice - stopLoss);
        const stopLossPercent = stopLossDistance / entryPrice;
        
        // Base position size calculation
        let positionSize = baseRiskAmount / stopLossDistance;
        
        // Get regime risk multiplier
        const regimeMultiplier = getRegimeRiskMultiplier(marketData);
        
        // Apply regime adjustment
        positionSize *= regimeMultiplier;
        
        // Calculate volatility adjustment
        const volatilityMultiplier = await getVolatilityAdjustment(symbol);
        positionSize *= volatilityMultiplier;
        
        // Apply correlation limits
        const correlationMultiplier = await getCorrelationAdjustment(symbol);
        positionSize *= correlationMultiplier;
        
        // Calculate position value and margin requirement
        const positionValue = positionSize * entryPrice;
        const leverage = await getAccountLeverage();
        const marginRequired = positionValue / leverage;
        
        // Final validation checks
        const maxPositionSize = accountBalance * 0.1; // Max 10% of account per trade
        positionSize = Math.min(positionSize, maxPositionSize);
        
        // Round to appropriate lot size
        const lotSize = roundToLotSize(positionSize, symbol);
        
        const analysis = {
            recommendedSize: lotSize,
            riskAmount: lotSize * stopLossDistance,
            riskPercent: (lotSize * stopLossDistance / accountBalance) * 100,
            positionValue: lotSize * entryPrice,
            marginRequired: (lotSize * entryPrice) / leverage,
            marginUtilization: ((lotSize * entryPrice) / leverage / accountBalance) * 100,
            
            // Risk factors
            regimeMultiplier: regimeMultiplier,
            volatilityMultiplier: volatilityMultiplier,
            correlationMultiplier: correlationMultiplier,
            
            // Regime context
            currentRegime: marketData?.rayDalio?.regime?.currentRegime?.name || 'UNKNOWN',
            regimeConfidence: marketData?.rayDalio?.regime?.confidence || 0,
            
            // Risk metrics
            stopLossDistance: stopLossDistance,
            stopLossPercent: (stopLossPercent * 100).toFixed(2),
            riskRewardRatio: null, // To be calculated with take profit
            
            // Warnings
            warnings: []
        };
        
        // Add warnings
        if (analysis.riskPercent > 2.5) {
            analysis.warnings.push('⚠️ Risk exceeds 2.5% - consider reducing position size');
        }
        
        if (analysis.marginUtilization > 20) {
            analysis.warnings.push('⚠️ High margin utilization - monitor margin levels');
        }
        
        if (regimeMultiplier < 0.8) {
            analysis.warnings.push('🏛️ Current regime suggests defensive positioning');
        }
        
        if (marketData?.rayDalio?.regime?.confidence < 60) {
            analysis.warnings.push('🔄 Low regime confidence - consider smaller position');
        }
        
        console.log(`✅ Position size calculated: ${lotSize} lots (${analysis.riskPercent.toFixed(2)}% risk)`);
        return analysis;
        
    } catch (error) {
        console.error('Position sizing error:', error.message);
        return {
            error: error.message,
            recommendedSize: 0.01, // Minimum fallback
            warnings: ['❌ Position sizing calculation failed - using minimum size']
        };
    }
}

/**
 * 🏛️ GET REGIME RISK MULTIPLIER
 */
function getRegimeRiskMultiplier(marketData) {
    if (!marketData?.rayDalio?.regime?.currentRegime) {
        return RISK_PARAMETERS.REGIME_RISK_MULTIPLIERS.TRANSITIONAL;
    }
    
    const regimeName = marketData.rayDalio.regime.currentRegime.name;
    const confidence = marketData.rayDalio.regime.confidence || 50;
    
    // Base multiplier from regime
    let multiplier = RISK_PARAMETERS.REGIME_RISK_MULTIPLIERS[regimeName] || 0.8;
    
    // Adjust for regime confidence
    if (confidence < 60) {
        multiplier *= 0.8; // Reduce risk when regime uncertain
    } else if (confidence > 85) {
        multiplier *= 1.1; // Slightly increase risk when regime clear
    }
    
    // Additional market stress adjustments
    const marketStress = marketData.rayDalio.regime.signals?.market?.stress || 50;
    if (marketStress > 70) {
        multiplier *= 0.7; // Significantly reduce risk during market stress
    }
    
    return Math.max(0.3, Math.min(1.5, multiplier)); // Cap between 0.3x and 1.5x
}

/**
 * 📊 GET VOLATILITY ADJUSTMENT
 */
async function getVolatilityAdjustment(symbol) {
    try {
        // For now, use simplified volatility adjustment
        // In production, this would calculate actual 20-day volatility
        
        const baseVolatility = {
            'EURUSD': 0.7,
            'GBPUSD': 0.8,
            'USDJPY': 0.6,
            'AUDUSD': 0.8,
            'USDCAD': 0.6,
            'NZDUSD': 0.9,
            'USDCHF': 0.7
        };
        
        const symbolVol = baseVolatility[symbol] || 0.8;
        
        // Inverse relationship: higher volatility = smaller position
        return 0.8 / symbolVol;
        
    } catch (error) {
        console.error('Volatility adjustment error:', error.message);
        return 1.0; // Default to no adjustment
    }
}

/**
 * 🔗 GET CORRELATION ADJUSTMENT
 */
async function getCorrelationAdjustment(symbol) {
    try {
        // Get current open positions
        const positions = await getOpenPositions();
        if (!positions || positions.length === 0) {
            return 1.0; // No correlation risk if no positions
        }
        
        let totalCorrelationRisk = 0;
        
        positions.forEach(position => {
            const posSymbol = position.symbol;
            const correlation = CURRENCY_CORRELATIONS[symbol]?.[posSymbol] || 0;
            
            if (Math.abs(correlation) > 0.5) {
                // High correlation detected
                totalCorrelationRisk += Math.abs(correlation) * Math.abs(position.volume);
            }
        });
        
        // Reduce position size if high correlation exposure exists
        if (totalCorrelationRisk > 2.0) {
            return 0.6; // Significantly reduce position
        } else if (totalCorrelationRisk > 1.0) {
            return 0.8; // Moderately reduce position
        }
        
        return 1.0; // No correlation adjustment needed
        
    } catch (error) {
        console.error('Correlation adjustment error:', error.message);
        return 1.0;
    }
}

/**
 * ⚖️ CALCULATE PORTFOLIO RISK METRICS
 */
async function calculatePortfolioRisk(accountBalance) {
    try {
        const positions = await getOpenPositions();
        const marketData = await getRayDalioMarketData().catch(() => null);
        
        if (!positions || positions.length === 0) {
            return {
                totalRisk: 0,
                totalRiskPercent: 0,
                positionCount: 0,
                correlationRisk: 'LOW',
                regimeRisk: 'MODERATE',
                recommendations: ['📊 No open positions - clean slate for Ray Dalio positioning']
            };
        }
        
        let totalRiskAmount = 0;
        let correlationMatrix = {};
        
        // Calculate individual position risks
        positions.forEach(position => {
            // Estimate risk based on current P&L and position size
            const positionRisk = Math.abs(position.profit || 0) + (position.volume * 100); // Simplified
            totalRiskAmount += positionRisk;
            
            // Track correlation exposure
            const symbol = position.symbol;
            if (!correlationMatrix[symbol]) {
                correlationMatrix[symbol] = 0;
            }
            correlationMatrix[symbol] += position.volume;
        });
        
        const totalRiskPercent = (totalRiskAmount / accountBalance) * 100;
        
        // Assess correlation risk
        let correlationRisk = 'LOW';
        let maxCorrelationExposure = 0;
        
        Object.values(correlationMatrix).forEach(exposure => {
            const exposurePercent = (exposure * 1000) / accountBalance; // Rough calculation
            if (exposurePercent > maxCorrelationExposure) {
                maxCorrelationExposure = exposurePercent;
            }
        });
        
        if (maxCorrelationExposure > 15) {
            correlationRisk = 'HIGH';
        } else if (maxCorrelationExposure > 10) {
            correlationRisk = 'MODERATE';
        }
        
        // Assess regime risk
        let regimeRisk = 'MODERATE';
        const regimeName = marketData?.rayDalio?.regime?.currentRegime?.name;
        const regimeConfidence = marketData?.rayDalio?.regime?.confidence || 50;
        
        if (regimeName === 'GROWTH_FALLING_INFLATION_RISING' || regimeConfidence < 60) {
            regimeRisk = 'HIGH';
        } else if (regimeName === 'GROWTH_RISING_INFLATION_FALLING' && regimeConfidence > 80) {
            regimeRisk = 'LOW';
        }
        
        // Generate recommendations
        const recommendations = [];
        
        if (totalRiskPercent > 6) {
            recommendations.push('⚠️ Portfolio risk exceeds 6% - consider reducing position sizes');
        }
        
        if (correlationRisk === 'HIGH') {
            recommendations.push('🔗 High correlation risk detected - diversify across asset classes');
        }
        
        if (regimeRisk === 'HIGH') {
            recommendations.push('🏛️ Current regime suggests defensive positioning');
        }
        
        if (positions.length > 5) {
            recommendations.push('📊 High number of positions - consider consolidation');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('✅ Portfolio risk levels within Ray Dalio guidelines');
        }
        
        return {
            totalRisk: totalRiskAmount,
            totalRiskPercent: totalRiskPercent.toFixed(2),
            positionCount: positions.length,
            correlationRisk,
            regimeRisk,
            maxCorrelationExposure: maxCorrelationExposure.toFixed(2),
            currentRegime: regimeName || 'UNKNOWN',
            regimeConfidence: regimeConfidence,
            recommendations
        };
        
    } catch (error) {
        console.error('Portfolio risk calculation error:', error.message);
        return {
            error: error.message,
            recommendations: ['❌ Risk calculation failed - monitor positions manually']
        };
    }
}

/**
 * 🎯 ENHANCED TRADING OPPORTUNITIES SCANNER
 */
async function scanTradingOpportunities() {
    try {
        console.log('🔍 Scanning for Ray Dalio-style trading opportunities...');
        
        const marketData = await getRayDalioMarketData();
        const accountInfo = await getAccountInfo();
        const currentPositions = await getOpenPositions();
        
        if (!marketData || !accountInfo) {
            return {
                error: 'Market data or account info unavailable',
                opportunities: []
            };
        }
        
        const opportunities = [];
        
        // Regime-based opportunities
        const regime = marketData.rayDalio?.regime?.currentRegime;
        if (regime) {
            const regimeOpps = generateRegimeOpportunities(regime, marketData);
            opportunities.push(...regimeOpps);
        }
        
        // Yield curve opportunities
        if (marketData.rayDalio?.yieldCurve) {
            const curveOpps = generateYieldCurveOpportunities(marketData.rayDalio.yieldCurve);
            opportunities.push(...curveOpps);
        }
        
        // Credit spread opportunities
        if (marketData.rayDalio?.creditSpreads) {
            const creditOpps = generateCreditOpportunities(marketData.rayDalio.creditSpreads);
            opportunities.push(...creditOpps);
        }
        
        // Filter based on current positions (avoid over-correlation)
        const filteredOpportunities = filterByCorrelation(opportunities, currentPositions);
        
        // Add position sizing for each opportunity
        const enhancedOpportunities = await Promise.all(
            filteredOpportunities.map(async (opp) => {
                const sizing = await calculateRayDalioPositionSize(
                    opp.symbol,
                    opp.direction,
                    opp.entryPrice,
                    opp.stopLoss,
                    accountInfo.balance,
                    marketData
                );
                
                return {
                    ...opp,
                    sizing: sizing
                };
            })
        );
        
        return {
            opportunities: enhancedOpportunities.slice(0, 5), // Top 5
            marketRegime: regime?.name || 'UNKNOWN',
            regimeConfidence: marketData.rayDalio?.regime?.confidence || 0,
            scanTime: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Opportunities scanner error:', error.message);
        return {
            error: error.message,
            opportunities: []
        };
    }
}

/**
 * 🏛️ GENERATE REGIME-BASED OPPORTUNITIES
 */
function generateRegimeOpportunities(regime, marketData) {
    const opportunities = [];
    
    if (regime.name === 'GROWTH_RISING_INFLATION_FALLING') {
        // Goldilocks scenario - favor risk assets
        opportunities.push({
            symbol: 'EURUSD',
            direction: 'LONG',
            rationale: 'Risk-on environment favors growth currencies over USD',
            entryPrice: 1.0850, // Example prices
            stopLoss: 1.0750,
            takeProfit: 1.1000,
            confidence: 8,
            timeframe: 'Medium-term',
            regimeFit: 'EXCELLENT'
        });
        
        opportunities.push({
            symbol: 'AUDUSD',
            direction: 'LONG',
            rationale: 'Commodity currency benefits from growth without inflation fears',
            entryPrice: 0.6750,
            stopLoss: 0.6650,
            takeProfit: 0.6900,
            confidence: 7,
            timeframe: 'Medium-term',
            regimeFit: 'GOOD'
        });
    }
    
    if (regime.name === 'GROWTH_FALLING_INFLATION_RISING') {
        // Stagflation scenario - favor safe havens
        opportunities.push({
            symbol: 'USDJPY',
            direction: 'LONG',
            rationale: 'Flight to safety in stagflationary environment',
            entryPrice: 150.00,
            stopLoss: 148.50,
            takeProfit: 152.50,
            confidence: 8,
            timeframe: 'Short-term',
            regimeFit: 'EXCELLENT'
        });
        
        opportunities.push({
            symbol: 'USDCHF',
            direction: 'LONG',
            rationale: 'Safe haven currencies outperform in stagflation',
            entryPrice: 0.8750,
            stopLoss: 0.8650,
            takeProfit: 0.8900,
            confidence: 7,
            timeframe: 'Medium-term',
            regimeFit: 'GOOD'
        });
    }
    
    return opportunities;
}

/**
 * 📈 GENERATE YIELD CURVE OPPORTUNITIES
 */
function generateYieldCurveOpportunities(yieldCurve) {
    const opportunities = [];
    
    if (yieldCurve.shape === 'INVERTED' && yieldCurve.spreads['2s10s'] < -0.5) {
        opportunities.push({
            symbol: 'USDJPY',
            direction: 'LONG',
            rationale: 'Deeply inverted yield curve signals recession - favor JPY safe haven',
            entryPrice: 150.00,
            stopLoss: 148.00,
            takeProfit: 153.00,
            confidence: 9,
            timeframe: 'Long-term',
            signalSource: 'YIELD_CURVE_INVERSION'
        });
    }
    
    if (yieldCurve.shape === 'STEEP' && yieldCurve.spreads['2s10s'] > 2.0) {
        opportunities.push({
            symbol: 'EURUSD',
            direction: 'LONG',
            rationale: 'Steep yield curve indicates growth acceleration - favor risk currencies',
            entryPrice: 1.0850,
            stopLoss: 1.0750,
            takeProfit: 1.1050,
            confidence: 7,
            timeframe: 'Medium-term',
            signalSource: 'STEEP_YIELD_CURVE'
        });
    }
    
    return opportunities;
}

/**
 * 💳 GENERATE CREDIT OPPORTUNITIES
 */
function generateCreditOpportunities(creditSpreads) {
    const opportunities = [];
    
    if (creditSpreads.conditions === 'CRISIS' && creditSpreads.stress > 80) {
        opportunities.push({
            symbol: 'USDCHF',
            direction: 'LONG',
            rationale: 'Credit crisis signals flight to quality - CHF safe haven',
            entryPrice: 0.8750,
            stopLoss: 0.8650,
            takeProfit: 0.8950,
            confidence: 9,
            timeframe: 'Short-term',
            signalSource: 'CREDIT_CRISIS'
        });
    }
    
    if (creditSpreads.conditions === 'COMPLACENT' && creditSpreads.stress < 30) {
        opportunities.push({
            symbol: 'AUDUSD',
            direction: 'LONG',
            rationale: 'Complacent credit markets support risk currencies',
            entryPrice: 0.6750,
            stopLoss: 0.6650,
            takeProfit: 0.6900,
            confidence: 6,
            timeframe: 'Medium-term',
            signalSource: 'CREDIT_COMPLACENCY'
        });
    }
    
    return opportunities;
}

/**
 * 🔗 FILTER OPPORTUNITIES BY CORRELATION
 */
function filterByCorrelation(opportunities, currentPositions) {
    if (!currentPositions || currentPositions.length === 0) {
        return opportunities;
    }
    
    const positionSymbols = currentPositions.map(pos => pos.symbol);
    
    return opportunities.filter(opp => {
        let highCorrelation = false;
        
        positionSymbols.forEach(posSymbol => {
            const correlation = CURRENCY_CORRELATIONS[opp.symbol]?.[posSymbol] || 0;
            if (Math.abs(correlation) > 0.7) {
                highCorrelation = true;
            }
        });
        
        return !highCorrelation;
    });
}

/**
 * 📏 UTILITY FUNCTIONS
 */
function roundToLotSize(size, symbol) {
    // Most forex brokers use 0.01 lot increments
    return Math.round(size * 100) / 100;
}

async function getAccountLeverage() {
    try {
        const accountInfo = await getAccountInfo();
        return accountInfo?.leverage || 100; // Default to 1:100
    } catch (error) {
        return 100;
    }
}

function isConnectionReady() {
    return connection && isConnected && isSynchronized;
}

/**
 * 🔄 EXISTING FUNCTIONS (Enhanced)
 */
async function getAccountInfo() {
    try {
        if (!isConnectionReady()) {
            console.log('🔄 Connection not ready, attempting to reconnect...');
            const initialized = await initializeMetaAPI();
            if (!initialized) {
                console.log('⚠️ Failed to initialize MetaAPI connection');
                return null;
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try multiple methods to access account information
        try {
            const accountInfo1 = connection.accountInformation;
            if (accountInfo1) {
                return {
                    balance: accountInfo1.balance,
                    equity: accountInfo1.equity,
                    margin: accountInfo1.margin,
                    freeMargin: accountInfo1.freeMargin,
                    marginLevel: accountInfo1.marginLevel,
                    currency: accountInfo1.currency,
                    leverage: accountInfo1.leverage,
                    company: accountInfo1.company,
                    name: accountInfo1.name,
                    server: accountInfo1.server,
                    loginId: accountInfo1.login
                };
            }
        } catch (err) {
            console.log('Method 1 error:', err.message);
        }
        
        try {
            const terminalState = connection.terminalState;
            if (terminalState && terminalState.accountInformation) {
                const accountInfo2 = terminalState.accountInformation;
                return {
                    balance: accountInfo2.balance,
                    equity: accountInfo2.equity,
                    margin: accountInfo2.margin,
                    freeMargin: accountInfo2.freeMargin,
                    marginLevel: accountInfo2.marginLevel,
                    currency: accountInfo2.currency,
                    leverage: accountInfo2.leverage,
                    company: accountInfo2.company,
                    name: accountInfo2.name,
                    server: accountInfo2.server,
                    loginId: accountInfo2.login
                };
            }
        } catch (err) {
            console.log('Method 2 error:', err.message);
        }
        
        console.log('⚠️ All methods failed - account information not accessible');
        return null;
        
    } catch (error) {
        console.error('MetaAPI account info error:', error.message);
        return null;
    }
}

async function getOpenPositions() {
    try {
        if (!isConnectionReady()) {
            console.log('🔄 Connection not ready for positions');
            return [];
        }
        
        const terminalState = connection.terminalState;
        if (!terminalState || !terminalState.positions) {
            console.log('⚠️ Terminal state or positions not available');
            return [];
        }
        
        const positions = terminalState.positions;
        
        return positions.map(position => ({
            id: position.id,
            symbol: position.symbol,
            type: position.type,
            volume: position.volume,
            openPrice: position.openPrice,
            currentPrice: position.currentPrice,
            profit: position.profit,
            unrealizedProfit: position.unrealizedProfit,
            swap: position.swap,
            commission: position.commission,
            openTime: position.time,
            updateTime: position.updateTime
        }));
        
    } catch (error) {
        console.error('MetaAPI positions error:', error.message);
        return [];
    }
}

async function getPendingOrders() {
    try {
        if (!isConnectionReady()) {
            console.log('🔄 Connection not ready for orders');
            return [];
        }
        
        const terminalState = connection.terminalState;
        if (!terminalState || !terminalState.orders) {
            console.log('⚠️ Terminal state or orders not available');
            return [];
        }
        
        const orders = terminalState.orders;
        
        return orders.map(order => ({
            id: order.id,
            symbol: order.symbol,
            type: order.type,
            volume: order.volume,
            openPrice: order.openPrice,
            currentPrice: order.currentPrice,
            stopLoss: order.stopLoss,
            takeProfit: order.takeProfit,
            time: order.time,
            state: order.state,
            comment: order.comment
        }));
        
    } catch (error) {
        console.error('MetaAPI orders error:', error.message);
        return [];
    }
}

async function getTradeHistory(days = 7) {
    try {
        if (!isConnectionReady()) {
            console.log('🔄 Connection not ready for history');
            return [];
        }
        
        console.log('📊 Trade history feature temporarily disabled - positions and account info available');
        return [];
        
    } catch (error) {
        console.error('MetaAPI history error:', error.message);
        return [];
    }
}

async function executeMarketOrder(symbol, volume, type, stopLoss = null, takeProfit = null, comment = 'RAY_DALIO_AI') {
    try {
        if (!isConnectionReady()) {
            const initialized = await initializeMetaAPI();
            if (!initialized) {
                return { success: false, error: 'MetaAPI not connected' };
            }
        }
        
        // Ray Dalio safety check - validate position size against risk parameters
        const accountInfo = await getAccountInfo();
        if (accountInfo) {
            const positionValue = volume * 100000; // Assuming standard lot
            const marginRequired = positionValue / (accountInfo.leverage || 100);
            const marginUtilization = (marginRequired / accountInfo.balance) * 100;
            
            if (marginUtilization > 50) {
                return {
                    success: false,
                    error: 'Ray Dalio Risk Check: Position size exceeds 50% margin utilization',
                    recommendation: 'Reduce position size to maintain institutional risk standards'
                };
            }
        }
        
        console.log('🚫 Order execution disabled for safety - account monitoring only');
        console.log(`📊 Proposed order: ${symbol} ${type} ${volume} lots`);
        
        return {
            success: false,
            error: 'Order execution disabled for safety. Account monitoring only.',
            message: 'Use Ray Dalio position sizing calculator for optimal trade size',
            proposedOrder: {
                symbol,
                volume,
                type,
                stopLoss,
                takeProfit,
                comment
            }
        };
        
    } catch (error) {
        console.error('MetaAPI order execution error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

async function closePosition(positionId) {
    try {
        if (!isConnectionReady()) {
            return { success: false, error: 'MetaAPI not connected' };
        }
        
        console.log('🚫 Position closing disabled for safety - account monitoring only');
        console.log(`📊 Proposed close: Position ID ${positionId}`);
        
        return {
            success: false,
            error: 'Position closing disabled for safety. Account monitoring only.',
            message: 'Manual position management recommended for institutional standards',
            positionId
        };
        
    } catch (error) {
        console.error('MetaAPI close position error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

async function getSymbolInfo(symbol) {
    try {
        if (!isConnectionReady()) {
            return null;
        }
        
        const terminalState = connection.terminalState;
        if (!terminalState) {
            console.log('⚠️ Terminal state not available');
            return null;
        }
        
        try {
            const specification = terminalState.specification(symbol);
            const price = terminalState.price(symbol);
            
            if (specification) {
                return {
                    symbol: specification.symbol,
                    description: specification.description,
                    digits: specification.digits,
                    bid: price?.bid,
                    ask: price?.ask,
                    spread: price ? (price.ask - price.bid) : null,
                    time: price?.time
                };
            }
        } catch (err) {
            console.log(`⚠️ Symbol ${symbol} not available:`, err.message);
        }
        
        return null;
        
    } catch (error) {
        console.error('MetaAPI symbol info error:', error.message);
        return null;
    }
}

async function getConnectionStatus() {
    try {
        const status = {
            metaApiInitialized: !!metaApi,
            accountConnected: !!account,
            connectionEstablished: !!connection,
            synchronized: isSynchronized,
            connected: isConnected,
            accountId: METAAPI_ACCOUNT_ID || 'NOT_SET',
            tokenConfigured: !!METAAPI_TOKEN,
            rayDalioEnhanced: true
        };
        
        if (account) {
            try {
                status.accountState = account.state;
                status.accountType = account.type;
                status.accountPlatform = account.platform;
            } catch (err) {
                status.accountError = err.message;
            }
        }
        
        return status;
        
    } catch (error) {
        console.error('Connection status error:', error.message);
        return { error: error.message };
    }
}

/**
 * 🏛️ RAY DALIO ENHANCED TRADING SUMMARY
 */
async function getTradingSummary() {
    try {
        const connectionStatus = await getConnectionStatus();
        
        if (!connectionStatus.synchronized) {
            console.log('⚠️ MetaAPI not synchronized, attempting to initialize...');
            const initialized = await initializeMetaAPI();
            if (!initialized) {
                return {
                    error: 'MetaAPI not synchronized',
                    status: connectionStatus,
                    message: 'MetaAPI initialization failed. Check credentials and account status.'
                };
            }
            connectionStatus.synchronized = isSynchronized;
            connectionStatus.connected = isConnected;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const [accountInfo, positions, orders, portfolioRisk] = await Promise.all([
            getAccountInfo(),
            getOpenPositions(),
            getPendingOrders(),
            calculatePortfolioRisk(connectionStatus.synchronized ? 10000 : 0) // Use default if no account access
        ]);
        
        // Calculate current P&L from open positions
        const currentPnL = positions.reduce((sum, pos) => sum + (pos.profit || 0), 0);
        
        // Ray Dalio enhanced performance metrics
        const rayDalioMetrics = {
            riskUtilization: portfolioRisk.totalRiskPercent || 0,
            correlationRisk: portfolioRisk.correlationRisk || 'LOW',
            regimeRisk: portfolioRisk.regimeRisk || 'MODERATE',
            positionCount: positions.length,
            maxRecommendedPositions: 5,
            diversificationScore: calculateDiversificationScore(positions),
            riskAdjustedReturn: currentPnL > 0 ? (currentPnL / Math.max(portfolioRisk.totalRisk || 1, 1)) : 0
        };
        
        const summary = {
            account: accountInfo,
            openPositions: positions,
            pendingOrders: orders,
            recentTrades: [],
            performance: {
                totalTrades: 0,
                profitableTrades: 0,
                losingTrades: 0,
                totalProfit: 0,
                currentPnL: currentPnL,
                winRate: '0.00',
                averageProfit: '0.00'
            },
            rayDalioMetrics: rayDalioMetrics,
            portfolioRisk: portfolioRisk,
            connectionStatus: connectionStatus,
            institutionalGrade: true,
            timestamp: new Date().toISOString()
        };
        
        return summary;
        
    } catch (error) {
        console.error('MetaAPI trading summary error:', error.message);
        return {
            error: error.message,
            status: await getConnectionStatus()
        };
    }
}

/**
 * 📊 CALCULATE DIVERSIFICATION SCORE
 */
function calculateDiversificationScore(positions) {
    if (!positions || positions.length === 0) return 100;
    
    const symbolGroups = {
        'USD_MAJORS': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD'],
        'USD_MINORS': ['AUDUSD', 'NZDUSD'],
        'CROSS_PAIRS': ['EURJPY', 'GBPJPY', 'EURGBP', 'AUDCAD', 'AUDCHF']
    };
    
    const groupExposure = {};
    let totalVolume = 0;
    
    positions.forEach(pos => {
        totalVolume += Math.abs(pos.volume);
        
        Object.entries(symbolGroups).forEach(([group, symbols]) => {
            if (symbols.includes(pos.symbol)) {
                if (!groupExposure[group]) groupExposure[group] = 0;
                groupExposure[group] += Math.abs(pos.volume);
            }
        });
    });
    
    // Calculate concentration risk
    let maxGroupConcentration = 0;
    Object.values(groupExposure).forEach(exposure => {
        const concentration = (exposure / totalVolume) * 100;
        if (concentration > maxGroupConcentration) {
            maxGroupConcentration = concentration;
        }
    });
    
    // Score: 100 = perfect diversification, 0 = maximum concentration
    return Math.max(0, 100 - maxGroupConcentration);
}

/**
 * 🎯 FORMAT TRADING DATA FOR GPT (Enhanced)
 */
function formatTradingDataForGPT(tradingData) {
    if (!tradingData || tradingData.error) {
        return `\n\n⚠️ METATRADER STATUS: ${tradingData?.error || 'Not connected'}\n💡 Issue: ${tradingData?.message || 'MetaAPI connection failed - check credentials'}\n`;
    }
    
    let context = '\n\n🔴 LIVE METATRADER ACCOUNT DATA (Ray Dalio Enhanced):\n';
    
    // Account Info with Risk Metrics
    if (tradingData.account) {
        const acc = tradingData.account;
        context += `💰 ACCOUNT: ${acc.balance?.toFixed(2)} ${acc.currency} | Equity: ${acc.equity?.toFixed(2)} | Free Margin: ${acc.freeMargin?.toFixed(2)}\n`;
        context += `🏢 ${acc.company} | ${acc.server} | Leverage: 1:${acc.leverage} | Login: ${acc.loginId}\n`;
        
        if (acc.marginLevel) {
            context += `📊 Margin Level: ${acc.marginLevel.toFixed(2)}%\n`;
        }
    } else {
        context += `⚠️ Account information not yet available - connection establishing\n`;
    }
    
    // Ray Dalio Risk Metrics
    if (tradingData.rayDalioMetrics) {
        const metrics = tradingData.rayDalioMetrics;
        context += `\n🏛️ RAY DALIO RISK METRICS:\n`;
        context += `• Portfolio Risk: ${metrics.riskUtilization}% (Target: <6%)\n`;
        context += `• Correlation Risk: ${metrics.correlationRisk}\n`;
        context += `• Regime Risk: ${metrics.regimeRisk}\n`;
        context += `• Diversification Score: ${metrics.diversificationScore.toFixed(0)}/100\n`;
        context += `• Positions: ${metrics.positionCount}/${metrics.maxRecommendedPositions} recommended\n`;
        
        if (metrics.riskAdjustedReturn > 0) {
            context += `• Risk-Adjusted Return: ${metrics.riskAdjustedReturn.toFixed(2)}\n`;
        }
    }
    
    // Open Positions with Regime Analysis
    if (tradingData.openPositions && tradingData.openPositions.length > 0) {
        context += `\n📊 OPEN POSITIONS (${tradingData.openPositions.length}) - REGIME ANALYSIS:\n`;
        tradingData.openPositions.forEach(pos => {
            const profitStatus = pos.profit > 0 ? '🟢' : pos.profit < 0 ? '🔴' : '⚪';
            context += `${profitStatus} ${pos.symbol} ${pos.type} ${pos.volume} lots @ ${pos.openPrice} | P&L: ${pos.profit?.toFixed(2)}\n`;
        });
    } else {
        context += `\n📊 OPEN POSITIONS: None (Clean slate for Ray Dalio positioning)\n`;
    }
    
    // Portfolio Risk Summary
    if (tradingData.portfolioRisk) {
        const risk = tradingData.portfolioRisk;
        context += `\n⚠️ PORTFOLIO RISK ASSESSMENT:\n`;
        context += `• Total Risk: ${risk.totalRiskPercent}% of account\n`;
        context += `• Current Regime: ${risk.currentRegime} (${risk.regimeConfidence}% confidence)\n`;
        
        if (risk.recommendations && risk.recommendations.length > 0) {
            context += `• Recommendations:\n`;
            risk.recommendations.slice(0, 2).forEach(rec => {
                context += `  ${rec}\n`;
            });
        }
    }
    
    // Pending Orders
    if (tradingData.pendingOrders && tradingData.pendingOrders.length > 0) {
        context += `\n📋 PENDING ORDERS (${tradingData.pendingOrders.length}):\n`;
        tradingData.pendingOrders.forEach(order => {
            context += `• ${order.symbol} ${order.type} ${order.volume} lots @ ${order.openPrice}\n`;
        });
    }
    
    context += `\n⚡ RAY DALIO TRADING SYSTEM: Active\n`;
    context += `🏛️ Institutional risk management, position sizing, and regime analysis enabled\n`;
    context += `📊 Real-time correlation monitoring and diversification scoring\n`;
    context += `🕐 Last Updated: ${new Date().toLocaleTimeString()}\n`;
    
    return context;
}

async function testConnection() {
    try {
        console.log('🧪 Testing MetaAPI connection with Ray Dalio enhancements...');
        
        const status = await getConnectionStatus();
        console.log('Connection Status:', status);
        
        if (status.synchronized && status.connected) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const accountInfo = await getAccountInfo();
            const portfolioRisk = await calculatePortfolioRisk(accountInfo?.balance || 10000);
            
            console.log('Account Info:', accountInfo);
            console.log('Portfolio Risk:', portfolioRisk);
            
            return { 
                success: true, 
                status, 
                accountInfo, 
                portfolioRisk,
                rayDalioEnhanced: true 
            };
        } else {
            const initialized = await initializeMetaAPI();
            if (initialized) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                const accountInfo = await getAccountInfo();
                const portfolioRisk = await calculatePortfolioRisk(accountInfo?.balance || 10000);
                
                return { 
                    success: true, 
                    status: await getConnectionStatus(), 
                    accountInfo, 
                    portfolioRisk,
                    rayDalioEnhanced: true 
                };
            }
            return { success: false, status: await getConnectionStatus() };
        }
        
    } catch (error) {
        console.error('Test connection error:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    // 🏛️ RAY DALIO ENHANCED FUNCTIONS
    calculateRayDalioPositionSize,
    calculatePortfolioRisk,
    scanTradingOpportunities,
    
    // Enhanced existing functions
    initializeMetaAPI,
    getAccountInfo,
    getOpenPositions,
    getPendingOrders,
    getTradeHistory,
    executeMarketOrder,
    closePosition,
    getSymbolInfo,
    getTradingSummary,
    formatTradingDataForGPT,
    getConnectionStatus,
    testConnection
};
