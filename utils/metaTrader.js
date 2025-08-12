// utils/metaTrader.js - STRATEGIC COMMANDER ENHANCED MetaAPI Integration
// Part 1 of 4: Setup, Configuration & Initialization

const MetaApi = require('metaapi.cloud-sdk').default;
const { getRayDalioMarketData, getYieldCurveAnalysis, getCreditSpreadAnalysis } = require('./liveData');
// Enhanced integration with Cambodia Lending System
const { errorHandler, formatter, calculator } = require('./cambodiaLending');

// Initialize MetaAPI with your token
const METAAPI_TOKEN = process.env.METAAPI_TOKEN;
const METAAPI_ACCOUNT_ID = process.env.METAAPI_ACCOUNT_ID;

let metaApi = null;
let connection = null;
let account = null;
let isConnected = false;
let isSynchronized = false;

// 🏛️ STRATEGIC COMMANDER RISK MANAGEMENT PARAMETERS (Enhanced with Cambodia Integration)
const STRATEGIC_RISK_PARAMETERS = {
    MAX_RISK_PER_TRADE: 0.02,           // 2% max risk per trade (Strategic Commander standard)
    MAX_PORTFOLIO_RISK: 0.06,           // 6% max total portfolio risk
    MAX_CORRELATION_EXPOSURE: 0.15,     // 15% max exposure to correlated assets
    VOLATILITY_LOOKBACK: 20,            // 20-day volatility calculation
    STRATEGIC_REGIME_MULTIPLIERS: {
        'GROWTH_RISING_INFLATION_FALLING': 1.2,    // Goldilocks - increase strategic risk
        'GROWTH_RISING_INFLATION_RISING': 1.0,     // Growth/Inflation - normal strategic risk
        'GROWTH_FALLING_INFLATION_RISING': 0.6,    // Stagflation - reduce strategic risk
        'GROWTH_FALLING_INFLATION_FALLING': 0.8,   // Deflationary - cautious strategic positioning
        'TRANSITIONAL': 0.7                        // Uncertain regime - conservative strategic stance
    },
    // Enhanced Cambodia Lending integration
    CAMBODIA_LENDING_CORRELATION: 0.3,   // Correlation with Cambodia lending portfolio
    FX_LENDING_HEDGE_RATIO: 0.15        // 15% of lending portfolio can be hedged via FX
};

// 🔗 CURRENCY CORRELATIONS FOR STRATEGIC ANALYSIS (Enhanced with Cambodia)
const CURRENCY_CORRELATIONS = {
    'EURUSD': {
        'GBPUSD': 0.85,
        'USDJPY': -0.75,
        'USDCHF': -0.80,
        'AUDUSD': 0.70,
        'NZDUSD': 0.65,
        'USDKHR': -0.90  // Added Cambodia Riel correlation
    },
    'GBPUSD': {
        'EURUSD': 0.85,
        'USDJPY': -0.70,
        'USDCHF': -0.75,
        'AUDUSD': 0.75,
        'NZDUSD': 0.70,
        'USDKHR': -0.85
    },
    'USDJPY': {
        'EURUSD': -0.75,
        'GBPUSD': -0.70,
        'USDCHF': 0.80,
        'AUDUSD': -0.60,
        'NZDUSD': -0.55,
        'USDKHR': 0.95   // High correlation (USD peg)
    },
    'USDCHF': {
        'EURUSD': -0.80,
        'GBPUSD': -0.75,
        'USDJPY': 0.80,
        'AUDUSD': -0.65,
        'NZDUSD': -0.60,
        'USDKHR': 0.85
    },
    'AUDUSD': {
        'EURUSD': 0.70,
        'GBPUSD': 0.75,
        'USDJPY': -0.60,
        'USDCHF': -0.65,
        'NZDUSD': 0.80,
        'USDKHR': -0.80
    },
    'NZDUSD': {
        'EURUSD': 0.65,
        'GBPUSD': 0.70,
        'USDJPY': -0.55,
        'USDCHF': -0.60,
        'AUDUSD': 0.80,
        'USDKHR': -0.75
    },
    // Cambodia-specific currency risk
    'USDKHR': {
        'EURUSD': -0.90,
        'GBPUSD': -0.85,
        'USDJPY': 0.95,
        'USDCHF': 0.85,
        'AUDUSD': -0.80,
        'NZDUSD': -0.75
    }
};

/**
 * 🎯 INITIALIZE METAAPI CONNECTION (Enhanced with Cambodia Integration)
 */
async function initializeMetaAPI() {
    try {
        console.log('🚀 Initializing Strategic Commander MetaAPI connection...');
        
        if (!METAAPI_TOKEN) {
            console.log('⚠️ METAAPI_TOKEN not configured - MetaAPI features disabled');
            return false;
        }
        
        if (!METAAPI_ACCOUNT_ID) {
            console.log('⚠️ METAAPI_ACCOUNT_ID not configured - MetaAPI features disabled');
            return false;
        }
        
        // Initialize MetaAPI
        metaApi = new MetaApi(METAAPI_TOKEN);
        
        // Get trading account
        account = await metaApi.metatraderAccountApi.getAccount(METAAPI_ACCOUNT_ID);
        
        if (!account) {
            const error = new Error('Strategic Commander: Account not found');
            errorHandler.handleError(error, 'METATRADER_INIT');
            return false;
        }
        
        console.log(`📊 Strategic Account found: ${account.name} (${account.server})`);
        
        // Deploy account with timeout
        await account.deploy();
        console.log('🚀 Strategic account deployment initiated...');
        
        // Wait for deployment with enhanced timeout handling
        await Promise.race([
            account.waitDeployed(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Deployment timeout after 30 seconds')), 30000))
        ]);
        console.log('✅ Strategic account deployed successfully');
        
        // Create connection
        connection = account.getStreamingConnection();
        await connection.connect();
        console.log('🔗 Strategic streaming connection established');
        
        // Wait for synchronization with enhanced timeout
        await Promise.race([
            connection.waitSynchronized(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Synchronization timeout after 60 seconds')), 60000))
        ]);
        console.log('⚡ Strategic account synchronized');
        
        isConnected = true;
        isSynchronized = true;
        
        console.log('✅ Strategic Commander MetaAPI initialized successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Strategic Commander MetaAPI initialization error:', error.message);
        errorHandler.handleError(error, 'METATRADER_INIT');
        isConnected = false;
        isSynchronized = false;
        return false;
    }
}

/**
 * 💰 GET ACCOUNT INFORMATION (Enhanced with formatting)
 */
async function getAccountInfo() {
    try {
        if (!isSynchronized || !connection) {
            return null;
        }
        
        const accountInfo = connection.accountInformation;
        
        if (!accountInfo) {
            errorHandler.handleError(new Error('Account information not available'), 'ACCOUNT_INFO');
            return null;
        }
        
        return {
            balance: accountInfo.balance,
            equity: accountInfo.equity,
            margin: accountInfo.margin,
            freeMargin: accountInfo.freeMargin,
            marginLevel: accountInfo.marginLevel,
            currency: accountInfo.currency,
            company: accountInfo.company,
            server: accountInfo.server,
            leverage: accountInfo.leverage,
            loginId: account?.login,
            name: account?.name,
            // Enhanced formatting using Cambodia Lending formatter
            formattedBalance: formatter.formatCurrency(accountInfo.balance),
            formattedEquity: formatter.formatCurrency(accountInfo.equity),
            formattedMargin: formatter.formatCurrency(accountInfo.margin),
            formattedFreeMargin: formatter.formatCurrency(accountInfo.freeMargin),
            formattedMarginLevel: formatter.formatPercentage(accountInfo.marginLevel)
        };
    } catch (error) {
        console.error('Get account info error:', error.message);
        errorHandler.handleError(error, 'ACCOUNT_INFO');
        return null;
    }
}

/**
 * 📊 GET OPEN POSITIONS (Enhanced with formatting)
 */
async function getOpenPositions() {
    try {
        if (!isSynchronized || !connection) {
            return [];
        }
        
        const positions = connection.positions;
        return positions.map(pos => ({
            id: pos.id,
            symbol: pos.symbol,
            type: pos.type,
            volume: pos.volume,
            openPrice: pos.openPrice,
            profit: pos.profit,
            swap: pos.swap,
            comment: pos.comment,
            openTime: pos.openTime,
            // Enhanced formatting
            formattedProfit: formatter.formatCurrency(pos.profit || 0),
            formattedSwap: formatter.formatCurrency(pos.swap || 0),
            formattedOpenPrice: pos.openPrice?.toFixed(5) || 'N/A'
        }));
    } catch (error) {
        console.error('Get open positions error:', error.message);
        errorHandler.handleError(error, 'GET_POSITIONS');
        return [];
    }
}

/**
 * 📋 GET PENDING ORDERS (Enhanced with formatting)
 */
async function getPendingOrders() {
    try {
        if (!isSynchronized || !connection) {
            return [];
        }
        
        const orders = connection.orders;
        return orders.map(order => ({
            id: order.id,
            symbol: order.symbol,
            type: order.type,
            volume: order.volume,
            openPrice: order.openPrice,
            stopLoss: order.stopLoss,
            takeProfit: order.takeProfit,
            comment: order.comment,
            openTime: order.openTime,
            // Enhanced formatting
            formattedOpenPrice: order.openPrice?.toFixed(5) || 'N/A',
            formattedStopLoss: order.stopLoss?.toFixed(5) || 'N/A',
            formattedTakeProfit: order.takeProfit?.toFixed(5) || 'N/A'
        }));
    } catch (error) {
        console.error('Get pending orders error:', error.message);
        errorHandler.handleError(error, 'GET_ORDERS');
        return [];
    }
}

/**
 * 📈 GET TRADE HISTORY (Enhanced with error handling)
 */
async function getTradeHistory(startTime = null, endTime = null) {
    try {
        if (!account) {
            return [];
        }
        
        const now = new Date();
        const start = startTime || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        const end = endTime || now;
        
        const history = await account.getHistoryOrdersByTimeRange(start, end);
        
        return history.map(trade => ({
            id: trade.id,
            symbol: trade.symbol,
            type: trade.type,
            volume: trade.volume,
            openPrice: trade.openPrice,
            closePrice: trade.closePrice,
            profit: trade.profit,
            openTime: trade.openTime,
            closeTime: trade.closeTime,
            comment: trade.comment,
            // Enhanced formatting
            formattedProfit: formatter.formatCurrency(trade.profit || 0),
            formattedOpenPrice: trade.openPrice?.toFixed(5) || 'N/A',
            formattedClosePrice: trade.closePrice?.toFixed(5) || 'N/A'
        }));
    } catch (error) {
        console.error('Get trade history error:', error.message);
        errorHandler.handleError(error, 'GET_HISTORY');
        return [];
    }
}

console.log('✅ MetaTrader Part 1 of 4 loaded: Setup & Configuration');

// utils/metaTrader.js - STRATEGIC COMMANDER ENHANCED MetaAPI Integration
// Part 2 of 4: Trading Operations & Strategic Position Sizing

/**
 * 🎯 EXECUTE MARKET ORDER (Enhanced with error handling)
 */
async function executeMarketOrder(symbol, volume, type, stopLoss = null, takeProfit = null, comment = '') {
    try {
        if (!isSynchronized || !connection) {
            throw new Error('MetaAPI not synchronized');
        }
        
        const trade = {
            symbol: symbol,
            volume: volume,
            type: type, // 'buy' or 'sell'
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            comment: comment || 'Strategic Commander Trade'
        };
        
        const result = await connection.createMarketOrder(trade);
        console.log(`✅ Strategic order executed: ${symbol} ${type} ${volume} lots`);
        
        return {
            success: true,
            orderId: result.orderId,
            message: `Order executed successfully`,
            formattedVolume: volume.toFixed(2),
            formattedStopLoss: stopLoss ? stopLoss.toFixed(5) : 'None',
            formattedTakeProfit: takeProfit ? takeProfit.toFixed(5) : 'None'
        };
        
    } catch (error) {
        console.error('Execute market order error:', error.message);
        errorHandler.handleError(error, 'EXECUTE_ORDER', { symbol, volume, type });
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * ❌ CLOSE POSITION (Enhanced with error handling)
 */
async function closePosition(positionId) {
    try {
        if (!isSynchronized || !connection) {
            throw new Error('MetaAPI not synchronized');
        }
        
        const result = await connection.closePosition(positionId);
        console.log(`✅ Strategic position closed: ${positionId}`);
        
        return {
            success: true,
            message: 'Position closed successfully',
            positionId: positionId
        };
        
    } catch (error) {
        console.error('Close position error:', error.message);
        errorHandler.handleError(error, 'CLOSE_POSITION', { positionId });
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 GET SYMBOL INFORMATION (Enhanced with formatting)
 */
async function getSymbolInfo(symbol) {
    try {
        if (!isSynchronized || !connection) {
            return null;
        }
        
        const symbolInfo = connection.symbolSpecification(symbol);
        return {
            symbol: symbolInfo.symbol,
            description: symbolInfo.description,
            digits: symbolInfo.digits,
            spread: symbolInfo.spread,
            minVolume: symbolInfo.volumeMin,
            maxVolume: symbolInfo.volumeMax,
            volumeStep: symbolInfo.volumeStep,
            // Enhanced formatting
            formattedSpread: symbolInfo.spread?.toFixed(1) || 'N/A',
            formattedMinVolume: symbolInfo.volumeMin?.toFixed(2) || '0.01',
            formattedMaxVolume: symbolInfo.volumeMax?.toFixed(2) || 'N/A'
        };
    } catch (error) {
        console.error('Get symbol info error:', error.message);
        errorHandler.handleError(error, 'SYMBOL_INFO', { symbol });
        return null;
    }
}

/**
 * 🔗 GET CONNECTION STATUS (Enhanced)
 */
async function getConnectionStatus() {
    return {
        metaApiInitialized: metaApi !== null,
        connected: isConnected,
        synchronized: isSynchronized,
        accountId: METAAPI_ACCOUNT_ID || 'Not configured',
        hasToken: !!METAAPI_TOKEN,
        timestamp: new Date().toISOString(),
        // Enhanced status info
        formattedTimestamp: formatter.formatDate(new Date()),
        connectionQuality: isConnected && isSynchronized ? 'EXCELLENT' : isConnected ? 'CONNECTING' : 'DISCONNECTED'
    };
}

/**
 * 🧪 TEST CONNECTION (Enhanced with better feedback)
 */
async function testConnection() {
    try {
        console.log('🧪 Testing Strategic Commander MetaAPI connection...');
        
        if (!METAAPI_TOKEN || !METAAPI_ACCOUNT_ID) {
            return {
                success: false,
                error: 'MetaAPI credentials not configured',
                accountInfo: null,
                recommendations: [
                    'Set METAAPI_TOKEN environment variable',
                    'Set METAAPI_ACCOUNT_ID environment variable',
                    'Verify MetaAPI account is active'
                ]
            };
        }
        
        if (!isSynchronized) {
            console.log('⚠️ Connection not synchronized, attempting to initialize...');
            const initialized = await initializeMetaAPI();
            if (!initialized) {
                return {
                    success: false,
                    error: 'Failed to initialize MetaAPI',
                    accountInfo: null,
                    recommendations: [
                        'Check MetaAPI account status',
                        'Verify account is deployed',
                        'Check internet connection'
                    ]
                };
            }
        }
        
        const accountInfo = await getAccountInfo();
        
        return {
            success: true,
            message: 'Strategic Commander MetaAPI connection successful',
            accountInfo: accountInfo,
            connectionTime: new Date().toISOString(),
            formattedConnectionTime: formatter.formatDate(new Date(), { includeTime: true })
        };
        
    } catch (error) {
        console.error('Test connection error:', error.message);
        errorHandler.handleError(error, 'TEST_CONNECTION');
        return {
            success: false,
            error: error.message,
            accountInfo: null,
            recommendations: [
                'Check MetaAPI service status',
                'Verify credentials are correct',
                'Try again in a few minutes'
            ]
        };
    }
}

/**
 * ⚖️ GET ACCOUNT LEVERAGE (Enhanced)
 */
async function getAccountLeverage() {
    try {
        const accountInfo = await getAccountInfo();
        const leverage = accountInfo?.leverage || 100;
        return {
            leverage: leverage,
            formattedLeverage: `1:${leverage}`,
            riskWarning: leverage > 500 ? 'HIGH_RISK' : leverage > 200 ? 'MODERATE_RISK' : 'STANDARD_RISK'
        };
    } catch (error) {
        console.error('Get account leverage error:', error.message);
        errorHandler.handleError(error, 'GET_LEVERAGE');
        return {
            leverage: 100,
            formattedLeverage: '1:100',
            riskWarning: 'UNKNOWN'
        };
    }
}

/**
 * 📏 ROUND TO LOT SIZE (Enhanced)
 */
function roundToLotSize(size, symbol) {
    try {
        // Standard forex lot sizing
        const minLot = 0.01;
        const lotStep = 0.01;
        
        const rounded = Math.round(size / lotStep) * lotStep;
        const finalSize = Math.max(minLot, rounded);
        
        return {
            size: finalSize,
            formattedSize: finalSize.toFixed(2),
            originalSize: size,
            adjustment: size - finalSize
        };
    } catch (error) {
        errorHandler.handleError(error, 'LOT_SIZE_CALCULATION', { size, symbol });
        return {
            size: 0.01,
            formattedSize: '0.01',
            originalSize: size,
            adjustment: 0
        };
    }
}

/**
 * 🇰🇭 GET CAMBODIA PORTFOLIO FOR INTEGRATION
 */
async function getCambodiaPortfolioForIntegration() {
    try {
        if (typeof require('./cambodiaLending').getPortfolioStatus === 'function') {
            const portfolio = await require('./cambodiaLending').getPortfolioStatus();
            return {
                ...portfolio,
                integrationStatus: 'ACTIVE',
                lastSync: new Date().toISOString(),
                formattedAUM: formatter.formatCurrency(portfolio.totalAUM || 0),
                formattedDeployed: formatter.formatCurrency(portfolio.deployedCapital || 0),
                formattedYield: formatter.formatPercentage(portfolio.portfolioYield || 0)
            };
        }
    } catch (error) {
        console.log('Cambodia portfolio integration not available');
        errorHandler.handleError(error, 'CAMBODIA_INTEGRATION');
        return {
            integrationStatus: 'UNAVAILABLE',
            error: error.message
        };
    }
    return {
        integrationStatus: 'NOT_CONFIGURED'
    };
}

/**
 * 🎯 STRATEGIC COMMANDER POSITION SIZING CALCULATOR (Enhanced with Cambodia Integration)
 */
async function calculateStrategicPositionSize(symbol, direction, entryPrice, stopLoss, accountBalance, marketData = null, cambodiaPortfolio = null) {
    try {
        console.log(`🎯 Strategic Commander calculating position size for ${symbol} ${direction}`);
        
        // Get current strategic market regime data
        if (!marketData) {
            marketData = await getRayDalioMarketData().catch(() => null);
        }
        
        // Get Cambodia Lending portfolio data for correlation analysis
        if (!cambodiaPortfolio) {
            cambodiaPortfolio = await getCambodiaPortfolioForIntegration();
        }
        
        // Calculate base strategic risk amount (2% of account)
        const baseStrategicRisk = accountBalance * STRATEGIC_RISK_PARAMETERS.MAX_RISK_PER_TRADE;
        
        // Calculate strategic stop loss distance
        const stopLossDistance = Math.abs(entryPrice - stopLoss);
        const stopLossPercent = stopLossDistance / entryPrice;
        
        // Base strategic position size calculation
        let strategicPositionSize = baseStrategicRisk / stopLossDistance;
        
        // Get strategic regime multiplier
        const regimeMultiplier = getStrategicRegimeMultiplier(marketData);
        
        // Apply strategic regime adjustment
        strategicPositionSize *= regimeMultiplier;
        
        // Calculate strategic volatility adjustment
        const volatilityMultiplier = await getStrategicVolatilityAdjustment(symbol);
        strategicPositionSize *= volatilityMultiplier;
        
        // Apply strategic correlation limits
        const correlationMultiplier = await getStrategicCorrelationAdjustment(symbol);
        strategicPositionSize *= correlationMultiplier;
        
        // Enhanced Cambodia Lending correlation adjustment
        let cambodiaCorrelationMultiplier = 1.0;
        if (cambodiaPortfolio && cambodiaPortfolio.integrationStatus === 'ACTIVE') {
            if (symbol === 'USDKHR' || CURRENCY_CORRELATIONS['USDKHR']?.[symbol]) {
                const lendingExposure = cambodiaPortfolio.deployedCapital || 0;
                const fxExposure = strategicPositionSize * entryPrice;
                const totalExposure = lendingExposure + fxExposure;
                const correlation = Math.abs(CURRENCY_CORRELATIONS['USDKHR']?.[symbol] || 0);
                
                if (correlation > 0.7 && totalExposure > lendingExposure * 1.15) {
                    cambodiaCorrelationMultiplier = 0.7; // Reduce FX position due to high correlation
                } else if (correlation > 0.5 && totalExposure > lendingExposure * 1.25) {
                    cambodiaCorrelationMultiplier = 0.85; // Moderate reduction
                }
            }
        }
        strategicPositionSize *= cambodiaCorrelationMultiplier;
        
        // Calculate strategic position value and margin requirement
        const positionValue = strategicPositionSize * entryPrice;
        const leverageInfo = await getAccountLeverage();
        const leverage = leverageInfo.leverage;
        const marginRequired = positionValue / leverage;
        
        // Strategic validation checks
        const maxStrategicPosition = accountBalance * 0.1; // Max 10% of account per strategic trade
        strategicPositionSize = Math.min(strategicPositionSize, maxStrategicPosition);
        
        // Round to strategic lot size
        const lotSizeInfo = roundToLotSize(strategicPositionSize, symbol);
        const strategicLotSize = lotSizeInfo.size;
        
        const strategicAnalysis = {
            recommendedSize: strategicLotSize,
            strategicRiskAmount: strategicLotSize * stopLossDistance,
            strategicRiskPercent: (strategicLotSize * stopLossDistance / accountBalance) * 100,
            positionValue: strategicLotSize * entryPrice,
            marginRequired: (strategicLotSize * entryPrice) / leverage,
            marginUtilization: ((strategicLotSize * entryPrice) / leverage / accountBalance) * 100,
            
            // Strategic risk factors
            strategicRegimeMultiplier: regimeMultiplier,
            strategicVolatilityMultiplier: volatilityMultiplier,
            strategicCorrelationMultiplier: correlationMultiplier,
            cambodiaCorrelationMultiplier: cambodiaCorrelationMultiplier,
            
            // Strategic regime context
            currentStrategicRegime: marketData?.rayDalio?.regime?.currentRegime?.name || 'UNKNOWN',
            strategicRegimeConfidence: marketData?.rayDalio?.regime?.confidence || 0,
            
            // Strategic risk metrics
            stopLossDistance: stopLossDistance,
            stopLossPercent: (stopLossPercent * 100).toFixed(2),
            strategicRiskRewardRatio: null, // To be calculated with take profit
            
            // Cambodia Lending integration metrics
            cambodiaLendingExposure: cambodiaPortfolio?.deployedCapital || 0,
            totalCombinedExposure: (cambodiaPortfolio?.deployedCapital || 0) + (strategicLotSize * entryPrice),
            cambodiaIntegrationStatus: cambodiaPortfolio?.integrationStatus || 'NOT_CONFIGURED',
            currencyCorrelation: CURRENCY_CORRELATIONS['USDKHR']?.[symbol] || 0,
            
            // Enhanced formatting
            formattedRecommendedSize: strategicLotSize.toFixed(2),
            formattedRiskAmount: formatter.formatCurrency(strategicLotSize * stopLossDistance),
            formattedPositionValue: formatter.formatCurrency(strategicLotSize * entryPrice),
            formattedMarginRequired: formatter.formatCurrency((strategicLotSize * entryPrice) / leverage),
            formattedRiskPercent: formatter.formatPercentage(strategicLotSize * stopLossDistance / accountBalance * 100),
            
            // Strategic warnings
            strategicWarnings: []
        };
        
        // Enhanced strategic warnings
        if (strategicAnalysis.strategicRiskPercent > 2.5) {
            strategicAnalysis.strategicWarnings.push('⚠️ Strategic risk exceeds 2.5% - reduce position size immediately');
        }
        
        if (strategicAnalysis.marginUtilization > 20) {
            strategicAnalysis.strategicWarnings.push('⚠️ High margin utilization detected - monitor strategic levels');
        }
        
        if (regimeMultiplier < 0.8) {
            strategicAnalysis.strategicWarnings.push('🏛️ Current regime demands defensive strategic positioning');
        }
        
        if (marketData?.rayDalio?.regime?.confidence < 60) {
            strategicAnalysis.strategicWarnings.push('🔄 Low regime confidence - implement smaller strategic position');
        }
        
        if (cambodiaCorrelationMultiplier < 1.0) {
            strategicAnalysis.strategicWarnings.push('🇰🇭 Cambodia Lending correlation detected - position size reduced for risk management');
        }
        
        if (leverageInfo.riskWarning === 'HIGH_RISK') {
            strategicAnalysis.strategicWarnings.push('⚠️ High account leverage detected - exercise extreme caution');
        }
        
        console.log(`✅ Strategic position size calculated: ${strategicLotSize} lots (${strategicAnalysis.strategicRiskPercent.toFixed(2)}% strategic risk)`);
        return strategicAnalysis;
        
    } catch (error) {
        console.error('Strategic position sizing error:', error.message);
        errorHandler.handleError(error, 'POSITION_SIZING', { symbol, direction, entryPrice, stopLoss });
        return {
            error: error.message,
            recommendedSize: 0.01, // Minimum strategic fallback
            formattedRecommendedSize: '0.01',
            strategicWarnings: ['❌ Strategic position sizing calculation failed - using minimum safe size'],
            cambodiaIntegrationStatus: 'ERROR'
        };
    }
}

console.log('✅ MetaTrader Part 2 of 4 loaded: Trading Operations & Strategic Position Sizing');

// utils/metaTrader.js - STRATEGIC COMMANDER ENHANCED MetaAPI Integration
// Part 3 of 4: Risk Analysis & Ray Dalio Framework

/**
 * 🏛️ GET STRATEGIC REGIME MULTIPLIER (Enhanced with Cambodia Integration)
 */
function getStrategicRegimeMultiplier(marketData) {
    try {
        if (!marketData?.rayDalio?.regime?.currentRegime) {
            return STRATEGIC_RISK_PARAMETERS.STRATEGIC_REGIME_MULTIPLIERS.TRANSITIONAL;
        }
        
        const regimeName = marketData.rayDalio.regime.currentRegime.name;
        const confidence = marketData.rayDalio.regime.confidence || 50;
        
        // Base strategic multiplier from regime
        let strategicMultiplier = STRATEGIC_RISK_PARAMETERS.STRATEGIC_REGIME_MULTIPLIERS[regimeName] || 0.8;
        
        // Adjust for strategic regime confidence
        if (confidence < 60) {
            strategicMultiplier *= 0.8; // Reduce strategic risk when regime uncertain
        } else if (confidence > 85) {
            strategicMultiplier *= 1.1; // Increase strategic risk when regime clear
        }
        
        // Strategic market stress adjustments
        const marketStress = marketData.rayDalio.regime.signals?.market?.stress || 50;
        if (marketStress > 70) {
            strategicMultiplier *= 0.7; // Significantly reduce strategic risk during market stress
        } else if (marketStress < 30) {
            strategicMultiplier *= 1.05; // Slight increase during calm markets
        }
        
        // Cambodia-specific adjustments
        if (marketData.rayDalio.regime.currentRegime.name === 'GROWTH_FALLING_INFLATION_RISING') {
            strategicMultiplier *= 0.9; // Extra caution during stagflation for emerging market exposure
        }
        
        const finalMultiplier = Math.max(0.3, Math.min(1.5, strategicMultiplier));
        
        return {
            multiplier: finalMultiplier,
            regime: regimeName,
            confidence: confidence,
            marketStress: marketStress,
            formattedMultiplier: (finalMultiplier * 100).toFixed(0) + '%',
            riskAdjustment: finalMultiplier > 1 ? 'INCREASED' : finalMultiplier < 1 ? 'REDUCED' : 'NEUTRAL'
        };
        
    } catch (error) {
        errorHandler.handleError(error, 'REGIME_MULTIPLIER');
        return {
            multiplier: STRATEGIC_RISK_PARAMETERS.STRATEGIC_REGIME_MULTIPLIERS.TRANSITIONAL,
            regime: 'ERROR',
            confidence: 0,
            marketStress: 50,
            formattedMultiplier: '70%',
            riskAdjustment: 'DEFENSIVE'
        };
    }
}

/**
 * 📊 GET STRATEGIC VOLATILITY ADJUSTMENT (Enhanced)
 */
async function getStrategicVolatilityAdjustment(symbol) {
    try {
        // Enhanced strategic volatility adjustment for optimal positioning
        const strategicVolatility = {
            'EURUSD': { vol: 0.7, description: 'Low volatility major' },
            'GBPUSD': { vol: 0.8, description: 'Moderate volatility major' },
            'USDJPY': { vol: 0.6, description: 'Low volatility carry trade' },
            'AUDUSD': { vol: 0.8, description: 'Commodity currency volatility' },
            'USDCAD': { vol: 0.6, description: 'Stable North American pair' },
            'NZDUSD': { vol: 0.9, description: 'High volatility commodity currency' },
            'USDCHF': { vol: 0.7, description: 'Safe haven volatility' },
            'USDKHR': { vol: 0.3, description: 'Pegged currency - very low volatility' }
        };
        
        const symbolData = strategicVolatility[symbol] || { vol: 0.8, description: 'Standard volatility' };
        const symbolVol = symbolData.vol;
        
        // Strategic inverse relationship: higher volatility = smaller strategic position
        const adjustment = 0.8 / symbolVol;
        
        return {
            adjustment: adjustment,
            volatilityScore: symbolVol,
            description: symbolData.description,
            formattedAdjustment: (adjustment * 100).toFixed(0) + '%',
            riskLevel: symbolVol > 0.8 ? 'HIGH' : symbolVol > 0.6 ? 'MODERATE' : 'LOW'
        };
        
    } catch (error) {
        console.error('Strategic volatility adjustment error:', error.message);
        errorHandler.handleError(error, 'VOLATILITY_ADJUSTMENT', { symbol });
        return {
            adjustment: 1.0,
            volatilityScore: 0.8,
            description: 'Default volatility adjustment',
            formattedAdjustment: '100%',
            riskLevel: 'UNKNOWN'
        };
    }
}

/**
 * 🔗 GET STRATEGIC CORRELATION ADJUSTMENT (Enhanced)
 */
async function getStrategicCorrelationAdjustment(symbol) {
    try {
        // Get current strategic positions
        const positions = await getOpenPositions();
        if (!positions || positions.length === 0) {
            return {
                adjustment: 1.0,
                correlationRisk: 'NONE',
                exposedPairs: [],
                formattedAdjustment: '100%',
                recommendation: 'No correlation risk - clean portfolio'
            };
        }
        
        let totalStrategicCorrelationRisk = 0;
        const exposedPairs = [];
        const correlationDetails = [];
        
        positions.forEach(position => {
            const posSymbol = position.symbol;
            const correlation = CURRENCY_CORRELATIONS[symbol]?.[posSymbol] || 0;
            
            if (Math.abs(correlation) > 0.5) {
                // High strategic correlation detected
                const correlationRisk = Math.abs(correlation) * Math.abs(position.volume);
                totalStrategicCorrelationRisk += correlationRisk;
                
                exposedPairs.push({
                    symbol: posSymbol,
                    correlation: correlation,
                    volume: position.volume,
                    riskContribution: correlationRisk,
                    formattedCorrelation: formatter.formatPercentage(Math.abs(correlation) * 100),
                    correlationType: correlation > 0 ? 'POSITIVE' : 'NEGATIVE'
                });
                
                correlationDetails.push(`${posSymbol}: ${(correlation * 100).toFixed(0)}% correlation`);
            }
        });
        
        // Calculate strategic adjustment
        let strategicAdjustment = 1.0;
        let correlationRisk = 'LOW';
        let recommendation = 'Correlation risk within acceptable limits';
        
        if (totalStrategicCorrelationRisk > 2.0) {
            strategicAdjustment = 0.6; // Significantly reduce strategic position
            correlationRisk = 'HIGH';
            recommendation = 'High correlation risk - reduce position size significantly';
        } else if (totalStrategicCorrelationRisk > 1.0) {
            strategicAdjustment = 0.8; // Moderately reduce strategic position
            correlationRisk = 'MODERATE';
            recommendation = 'Moderate correlation risk - reduce position size';
        }
        
        return {
            adjustment: strategicAdjustment,
            correlationRisk: correlationRisk,
            totalRisk: totalStrategicCorrelationRisk,
            exposedPairs: exposedPairs,
            correlationDetails: correlationDetails,
            formattedAdjustment: (strategicAdjustment * 100).toFixed(0) + '%',
            formattedTotalRisk: totalStrategicCorrelationRisk.toFixed(2),
            recommendation: recommendation
        };
        
    } catch (error) {
        console.error('Strategic correlation adjustment error:', error.message);
        errorHandler.handleError(error, 'CORRELATION_ADJUSTMENT', { symbol });
        return {
            adjustment: 1.0,
            correlationRisk: 'UNKNOWN',
            exposedPairs: [],
            formattedAdjustment: '100%',
            recommendation: 'Unable to assess correlation risk'
        };
    }
}

/**
 * ⚖️ CALCULATE STRATEGIC PORTFOLIO RISK METRICS (Enhanced)
 */
async function calculateStrategicPortfolioRisk(accountBalance) {
    try {
        const positions = await getOpenPositions();
        const marketData = await getRayDalioMarketData().catch(() => null);
        const cambodiaPortfolio = await getCambodiaPortfolioForIntegration();
        
        if (!positions || positions.length === 0) {
            return {
                totalStrategicRisk: 0,
                totalStrategicRiskPercent: 0,
                strategicPositionCount: 0,
                strategicCorrelationRisk: 'LOW',
                strategicRegimeRisk: 'MODERATE',
                cambodiaIntegrationRisk: 'NONE',
                formattedTotalRisk: formatter.formatCurrency(0),
                formattedRiskPercent: formatter.formatPercentage(0),
                strategicRecommendations: ['📊 No open positions - clean slate for Strategic Commander positioning']
            };
        }
        
        let totalStrategicRiskAmount = 0;
        let strategicCorrelationMatrix = {};
        const positionAnalysis = [];
        
        // Calculate individual strategic position risks
        for (const position of positions) {
            // Estimate strategic risk based on current P&L and position size
            const currentProfit = position.profit || 0;
            const estimatedRisk = Math.abs(currentProfit) + (position.volume * 1000); // Enhanced risk calculation
            totalStrategicRiskAmount += estimatedRisk;
            
            // Track strategic correlation exposure
            const symbol = position.symbol;
            if (!strategicCorrelationMatrix[symbol]) {
                strategicCorrelationMatrix[symbol] = 0;
            }
            strategicCorrelationMatrix[symbol] += position.volume;
            
            positionAnalysis.push({
                symbol: symbol,
                volume: position.volume,
                profit: currentProfit,
                estimatedRisk: estimatedRisk,
                formattedProfit: formatter.formatCurrency(currentProfit),
                formattedRisk: formatter.formatCurrency(estimatedRisk),
                riskContribution: (estimatedRisk / totalStrategicRiskAmount * 100) || 0
            });
        }
        
        const totalStrategicRiskPercent = (totalStrategicRiskAmount / accountBalance) * 100;
        
        // Assess strategic correlation risk
        let strategicCorrelationRisk = 'LOW';
        let maxStrategicCorrelationExposure = 0;
        const correlationBreakdown = [];
        
        Object.entries(strategicCorrelationMatrix).forEach(([symbol, exposure]) => {
            const exposurePercent = (exposure * 1000) / accountBalance; // Strategic calculation
            if (exposurePercent > maxStrategicCorrelationExposure) {
                maxStrategicCorrelationExposure = exposurePercent;
            }
            
            correlationBreakdown.push({
                symbol: symbol,
                exposure: exposure,
                exposurePercent: exposurePercent,
                formattedExposure: exposure.toFixed(2),
                formattedExposurePercent: formatter.formatPercentage(exposurePercent)
            });
        });
        
        if (maxStrategicCorrelationExposure > 15) {
            strategicCorrelationRisk = 'HIGH';
        } else if (maxStrategicCorrelationExposure > 10) {
            strategicCorrelationRisk = 'MODERATE';
        }
        
        // Assess strategic regime risk
        let strategicRegimeRisk = 'MODERATE';
        const regimeName = marketData?.rayDalio?.regime?.currentRegime?.name;
        const regimeConfidence = marketData?.rayDalio?.regime?.confidence || 50;
        
        if (regimeName === 'GROWTH_FALLING_INFLATION_RISING' || regimeConfidence < 60) {
            strategicRegimeRisk = 'HIGH';
        } else if (regimeName === 'GROWTH_RISING_INFLATION_FALLING' && regimeConfidence > 80) {
            strategicRegimeRisk = 'LOW';
        }
        
        // Assess Cambodia integration risk
        let cambodiaIntegrationRisk = 'NONE';
        let cambodiaRiskDetails = [];
        
        if (cambodiaPortfolio && cambodiaPortfolio.integrationStatus === 'ACTIVE') {
            const lendingExposure = cambodiaPortfolio.deployedCapital || 0;
            const fxExposure = totalStrategicRiskAmount;
            const combinedExposure = lendingExposure + fxExposure;
            
            // Check for currency correlation risk
            positions.forEach(pos => {
                const correlation = CURRENCY_CORRELATIONS['USDKHR']?.[pos.symbol] || 0;
                if (Math.abs(correlation) > 0.7) {
                    cambodiaIntegrationRisk = 'HIGH';
                    cambodiaRiskDetails.push(`${pos.symbol} has ${(Math.abs(correlation) * 100).toFixed(0)}% correlation with Cambodia lending`);
                } else if (Math.abs(correlation) > 0.5) {
                    cambodiaIntegrationRisk = cambodiaIntegrationRisk === 'NONE' ? 'MODERATE' : cambodiaIntegrationRisk;
                    cambodiaRiskDetails.push(`${pos.symbol} has moderate correlation with Cambodia portfolio`);
                }
            });
        }
        
        // Generate strategic recommendations
        const strategicRecommendations = [];
        
        if (totalStrategicRiskPercent > 6) {
            strategicRecommendations.push('⚠️ Strategic portfolio risk exceeds 6% - reduce position sizes immediately');
        }
        
        if (strategicCorrelationRisk === 'HIGH') {
            strategicRecommendations.push('🔗 High strategic correlation risk detected - diversify across asset classes');
        }
        
        if (strategicRegimeRisk === 'HIGH') {
            strategicRecommendations.push('🏛️ Current regime demands defensive strategic positioning');
        }
        
        if (cambodiaIntegrationRisk === 'HIGH') {
            strategicRecommendations.push('🇰🇭 High correlation with Cambodia lending portfolio - reduce FX exposure');
        }
        
        if (positions.length > 5) {
            strategicRecommendations.push('📊 High number of strategic positions - consider consolidation');
        }
        
        if (strategicRecommendations.length === 0) {
            strategicRecommendations.push('✅ Strategic portfolio risk levels within Strategic Commander guidelines');
        }
        
        return {
            totalStrategicRisk: totalStrategicRiskAmount,
            totalStrategicRiskPercent: totalStrategicRiskPercent,
            strategicPositionCount: positions.length,
            strategicCorrelationRisk,
            strategicRegimeRisk,
            cambodiaIntegrationRisk,
            maxStrategicCorrelationExposure: maxStrategicCorrelationExposure,
            currentStrategicRegime: regimeName || 'UNKNOWN',
            strategicRegimeConfidence: regimeConfidence,
            
            // Enhanced formatting
            formattedTotalRisk: formatter.formatCurrency(totalStrategicRiskAmount),
            formattedRiskPercent: formatter.formatPercentage(totalStrategicRiskPercent),
            formattedMaxCorrelation: formatter.formatPercentage(maxStrategicCorrelationExposure),
            
            // Detailed analysis
            positionAnalysis: positionAnalysis,
            correlationBreakdown: correlationBreakdown,
            cambodiaRiskDetails: cambodiaRiskDetails,
            strategicRecommendations: strategicRecommendations,
            
            // Cambodia integration
            cambodiaPortfolio: cambodiaPortfolio,
            combinedPortfolioValue: accountBalance + (cambodiaPortfolio?.totalAUM || 0)
        };
        
    } catch (error) {
        console.error('Strategic portfolio risk calculation error:', error.message);
        errorHandler.handleError(error, 'PORTFOLIO_RISK');
        return {
            error: error.message,
            totalStrategicRisk: 0,
            totalStrategicRiskPercent: 0,
            strategicPositionCount: 0,
            formattedTotalRisk: formatter.formatCurrency(0),
            formattedRiskPercent: formatter.formatPercentage(0),
            strategicRecommendations: ['❌ Strategic risk calculation failed - monitor positions manually']
        };
    }
}

/**
 * 📊 CALCULATE STRATEGIC DIVERSIFICATION SCORE (Enhanced)
 */
function calculateStrategicDiversificationScore(positions) {
    try {
        if (!positions || positions.length === 0) return {
            score: 100,
            grade: 'EXCELLENT',
            description: 'No positions - perfect diversification opportunity'
        };
        
        const strategicSymbolGroups = {
            'USD_MAJORS': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD'],
            'USD_MINORS': ['AUDUSD', 'NZDUSD'],
            'CROSS_PAIRS': ['EURJPY', 'GBPJPY', 'EURGBP', 'AUDCAD', 'AUDCHF'],
            'EXOTIC_PAIRS': ['USDKHR', 'USDTHB', 'USDSGD']
        };
        
        const strategicGroupExposure = {};
        let totalStrategicVolume = 0;
        const groupDetails = [];
        
        positions.forEach(pos => {
            totalStrategicVolume += Math.abs(pos.volume);
            
            Object.entries(strategicSymbolGroups).forEach(([group, symbols]) => {
                if (symbols.includes(pos.symbol)) {
                    if (!strategicGroupExposure[group]) strategicGroupExposure[group] = 0;
                    strategicGroupExposure[group] += Math.abs(pos.volume);
                }
            });
        });
        
        // Calculate strategic concentration risk
        let maxStrategicGroupConcentration = 0;
        Object.entries(strategicGroupExposure).forEach(([group, exposure]) => {
            const concentration = (exposure / totalStrategicVolume) * 100;
            if (concentration > maxStrategicGroupConcentration) {
                maxStrategicGroupConcentration = concentration;
            }
            
            groupDetails.push({
                group: group,
                exposure: exposure,
                concentration: concentration,
                formattedExposure: exposure.toFixed(2),
                formattedConcentration: formatter.formatPercentage(concentration)
            });
        });
        
        // Strategic Score: 100 = perfect diversification, 0 = maximum concentration
        const score = Math.max(0, 100 - maxStrategicGroupConcentration);
        
        let grade = 'POOR';
        let description = 'High concentration risk';
        
        if (score >= 85) {
            grade = 'EXCELLENT';
            description = 'Well diversified across currency groups';
        } else if (score >= 70) {
            grade = 'GOOD';
            description = 'Good diversification with minor concentration';
        } else if (score >= 55) {
            grade = 'FAIR';
            description = 'Moderate diversification - room for improvement';
        } else if (score >= 40) {
            grade = 'POOR';
            description = 'Poor diversification - high concentration risk';
        } else {
            grade = 'CRITICAL';
            description = 'Critical concentration risk - immediate diversification needed';
        }
        
        return {
            score: Math.round(score),
            grade: grade,
            description: description,
            maxConcentration: maxStrategicGroupConcentration,
            groupDetails: groupDetails,
            formattedScore: `${Math.round(score)}/100`,
            formattedMaxConcentration: formatter.formatPercentage(maxStrategicGroupConcentration),
            recommendation: score < 70 ? 'Diversify across more currency groups' : 'Maintain current diversification'
        };
        
    } catch (error) {
        errorHandler.handleError(error, 'DIVERSIFICATION_SCORE');
        return {
            score: 0,
            grade: 'ERROR',
            description: 'Unable to calculate diversification score',
            formattedScore: 'ERROR'
        };
    }
}

console.log('✅ MetaTrader Part 3 of 4 loaded: Risk Analysis & Ray Dalio Framework');

// utils/metaTrader.js - STRATEGIC COMMANDER ENHANCED MetaAPI Integration
// Part 4 of 4: Trading Opportunity Scanner, Enhanced Summary & GPT Formatting

/**
 * 🎯 STRATEGIC TRADING OPPORTUNITY SCANNER (Enhanced with Cambodia Integration)
 */
async function scanStrategicTradingOpportunities() {
    try {
        console.log('🔍 Strategic Commander scanning for trading opportunities...');
        
        const marketData = await getRayDalioMarketData().catch(() => null);
        const cambodiaPortfolio = await getCambodiaPortfolioForIntegration();
        const accountInfo = await getAccountInfo();
        const portfolioRisk = await calculateStrategicPortfolioRisk(accountInfo?.balance || 10000);
        
        const strategicOpportunities = [];
        const scanResults = {
            timestamp: new Date().toISOString(),
            formattedTimestamp: formatter.formatDate(new Date(), { includeTime: true }),
            marketRegime: marketData?.rayDalio?.regime?.currentRegime?.name || 'UNKNOWN',
            regimeConfidence: marketData?.rayDalio?.regime?.confidence || 0,
            portfolioRiskLevel: portfolioRisk.strategicCorrelationRisk,
            cambodiaIntegrationStatus: cambodiaPortfolio?.integrationStatus || 'NOT_CONFIGURED',
            totalOpportunities: 0,
            highPriorityOpportunities: 0,
            mediumPriorityOpportunities: 0,
            lowPriorityOpportunities: 0
        };
        
        // Define strategic currency pairs for scanning
        const strategicPairs = [
            'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDKHR'
        ];
        
        // Scan each strategic pair
        for (const symbol of strategicPairs) {
            try {
                const opportunity = await analyzeStrategicOpportunity(symbol, marketData, cambodiaPortfolio, portfolioRisk);
                if (opportunity && opportunity.score > 30) { // Only include viable opportunities
                    strategicOpportunities.push(opportunity);
                    scanResults.totalOpportunities++;
                    
                    if (opportunity.priority === 'HIGH') {
                        scanResults.highPriorityOpportunities++;
                    } else if (opportunity.priority === 'MEDIUM') {
                        scanResults.mediumPriorityOpportunities++;
                    } else {
                        scanResults.lowPriorityOpportunities++;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Error scanning ${symbol}: ${error.message}`);
            }
        }
        
        // Sort opportunities by strategic score
        strategicOpportunities.sort((a, b) => b.score - a.score);
        
        // Generate strategic market summary
        const marketSummary = generateStrategicMarketSummary(marketData, cambodiaPortfolio, portfolioRisk);
        
        // Generate strategic recommendations
        const strategicRecommendations = generateStrategicRecommendations(strategicOpportunities, portfolioRisk, cambodiaPortfolio);
        
        console.log(`✅ Strategic scan complete: ${scanResults.totalOpportunities} opportunities found`);
        
        return {
            ...scanResults,
            opportunities: strategicOpportunities,
            marketSummary: marketSummary,
            strategicRecommendations: strategicRecommendations,
            nextScanRecommended: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
            formattedNextScan: formatter.formatDate(new Date(Date.now() + 30 * 60 * 1000), { includeTime: true })
        };
        
    } catch (error) {
        console.error('Strategic opportunity scanner error:', error.message);
        errorHandler.handleError(error, 'OPPORTUNITY_SCANNER');
        return {
            error: error.message,
            totalOpportunities: 0,
            opportunities: [],
            strategicRecommendations: ['❌ Strategic scanner failed - manual analysis required']
        };
    }
}

/**
 * 🔍 ANALYZE STRATEGIC OPPORTUNITY FOR SINGLE PAIR
 */
async function analyzeStrategicOpportunity(symbol, marketData, cambodiaPortfolio, portfolioRisk) {
    try {
        // Get strategic volatility and correlation data
        const volatilityData = await getStrategicVolatilityAdjustment(symbol);
        const correlationData = await getStrategicCorrelationAdjustment(symbol);
        const regimeData = getStrategicRegimeMultiplier(marketData);
        
        // Calculate strategic opportunity score (0-100)
        let strategicScore = 50; // Base score
        
        // Regime scoring
        if (typeof regimeData === 'object' && regimeData.multiplier) {
            strategicScore += (regimeData.multiplier - 1) * 30; // +/- 30 points based on regime
        }
        
        // Volatility scoring (lower volatility = higher score for stability)
        if (volatilityData.volatilityScore) {
            strategicScore += (0.8 - volatilityData.volatilityScore) * 20; // Adjust by volatility
        }
        
        // Correlation scoring (lower correlation risk = higher score)
        if (correlationData.correlationRisk === 'LOW') {
            strategicScore += 15;
        } else if (correlationData.correlationRisk === 'HIGH') {
            strategicScore -= 15;
        }
        
        // Cambodia integration scoring
        let cambodiaAdjustment = 0;
        if (cambodiaPortfolio?.integrationStatus === 'ACTIVE') {
            const correlation = CURRENCY_CORRELATIONS['USDKHR']?.[symbol] || 0;
            if (symbol === 'USDKHR') {
                cambodiaAdjustment = -10; // Reduce score for direct exposure
            } else if (Math.abs(correlation) > 0.7) {
                cambodiaAdjustment = -8; // High correlation penalty
            } else if (Math.abs(correlation) < 0.3) {
                cambodiaAdjustment = +5; // Diversification bonus
            }
        }
        strategicScore += cambodiaAdjustment;
        
        // Portfolio risk adjustment
        if (portfolioRisk.totalStrategicRiskPercent > 5) {
            strategicScore -= 10; // Reduce scores when portfolio risk is high
        }
        
        // Determine priority level
        let priority = 'LOW';
        if (strategicScore >= 70) {
            priority = 'HIGH';
        } else if (strategicScore >= 55) {
            priority = 'MEDIUM';
        }
        
        // Generate strategic signals
        const signals = [];
        if (regimeData.riskAdjustment === 'INCREASED') {
            signals.push('🏛️ Regime favors increased risk-taking');
        }
        if (volatilityData.riskLevel === 'LOW') {
            signals.push('📊 Low volatility environment');
        }
        if (correlationData.correlationRisk === 'LOW') {
            signals.push('🔗 Low correlation risk');
        }
        if (cambodiaAdjustment > 0) {
            signals.push('🇰🇭 Good diversification from Cambodia portfolio');
        }
        
        // Determine strategic direction bias
        let directionBias = 'NEUTRAL';
        let biasReason = 'No clear directional signal';
        
        if (marketData?.rayDalio?.regime?.currentRegime) {
            const regime = marketData.rayDalio.regime.currentRegime.name;
            if (regime === 'GROWTH_RISING_INFLATION_FALLING' && symbol.includes('USD')) {
                directionBias = 'USD_STRONG';
                biasReason = 'Goldilocks regime typically supports USD strength';
            } else if (regime === 'GROWTH_FALLING_INFLATION_RISING' && symbol.includes('USD')) {
                directionBias = 'USD_WEAK';
                biasReason = 'Stagflation regime typically weakens USD';
            }
        }
        
        return {
            symbol: symbol,
            score: Math.max(0, Math.min(100, Math.round(strategicScore))),
            priority: priority,
            directionBias: directionBias,
            biasReason: biasReason,
            
            // Strategic metrics
            regimeMultiplier: regimeData.multiplier || 1,
            volatilityScore: volatilityData.volatilityScore || 0.8,
            correlationRisk: correlationData.correlationRisk || 'UNKNOWN',
            cambodiaCorrelation: CURRENCY_CORRELATIONS['USDKHR']?.[symbol] || 0,
            cambodiaAdjustment: cambodiaAdjustment,
            
            // Formatted data
            formattedScore: `${Math.round(strategicScore)}/100`,
            formattedVolatility: volatilityData.formattedAdjustment || 'N/A',
            formattedCambodiaCorrelation: formatter.formatPercentage(Math.abs(CURRENCY_CORRELATIONS['USDKHR']?.[symbol] || 0) * 100),
            
            // Strategic signals and recommendations
            signals: signals,
            strategicRecommendation: generateSymbolRecommendation(symbol, strategicScore, priority, directionBias),
            
            // Risk warnings
            riskWarnings: generateRiskWarnings(symbol, volatilityData, correlationData, cambodiaAdjustment),
            
            // Analysis timestamp
            analysisTime: new Date().toISOString(),
            formattedAnalysisTime: formatter.formatDate(new Date(), { includeTime: true })
        };
        
    } catch (error) {
        console.error(`Strategic analysis error for ${symbol}:`, error.message);
        errorHandler.handleError(error, 'ANALYZE_OPPORTUNITY', { symbol });
        return null;
    }
}

/**
 * 📊 GENERATE STRATEGIC MARKET SUMMARY
 */
function generateStrategicMarketSummary(marketData, cambodiaPortfolio, portfolioRisk) {
    try {
        const regime = marketData?.rayDalio?.regime?.currentRegime?.name || 'UNKNOWN';
        const confidence = marketData?.rayDalio?.regime?.confidence || 0;
        const marketStress = marketData?.rayDalio?.regime?.signals?.market?.stress || 50;
        
        let strategicOutlook = 'NEUTRAL';
        let outlookDescription = 'Mixed signals in current market environment';
        
        if (regime === 'GROWTH_RISING_INFLATION_FALLING' && confidence > 70) {
            strategicOutlook = 'BULLISH';
            outlookDescription = 'Goldilocks environment supports strategic risk-taking';
        } else if (regime === 'GROWTH_FALLING_INFLATION_RISING' || marketStress > 70) {
            strategicOutlook = 'BEARISH';
            outlookDescription = 'Challenging environment demands defensive positioning';
        } else if (confidence < 50) {
            strategicOutlook = 'CAUTIOUS';
            outlookDescription = 'Low regime confidence suggests careful positioning';
        }
        
        const keyThemes = [];
        
        // Regime-based themes
        if (regime === 'GROWTH_RISING_INFLATION_FALLING') {
            keyThemes.push('🌟 Goldilocks environment supports growth assets');
            keyThemes.push('💵 USD strength likely to continue');
        } else if (regime === 'GROWTH_FALLING_INFLATION_RISING') {
            keyThemes.push('⚠️ Stagflation risks rising - defensive positioning needed');
            keyThemes.push('📉 Growth assets under pressure');
        } else if (regime === 'GROWTH_FALLING_INFLATION_FALLING') {
            keyThemes.push('🏛️ Deflationary forces - central bank easing expected');
            keyThemes.push('💎 Safe haven currencies favored');
        }
        
        // Market stress themes
        if (marketStress > 70) {
            keyThemes.push('🔥 High market stress - risk management critical');
        } else if (marketStress < 30) {
            keyThemes.push('☀️ Low market stress - opportunity for strategic positioning');
        }
        
        // Cambodia integration themes
        if (cambodiaPortfolio?.integrationStatus === 'ACTIVE') {
            const lendingYield = cambodiaPortfolio.portfolioYield || 0;
            if (lendingYield > 15) {
                keyThemes.push('🇰🇭 Strong Cambodia lending yields - consider FX hedging');
            }
            keyThemes.push('🔗 Monitor USD/KHR correlation with FX positions');
        }
        
        // Portfolio risk themes
        if (portfolioRisk.totalStrategicRiskPercent > 5) {
            keyThemes.push('⚖️ Portfolio risk elevated - consider position reduction');
        } else if (portfolioRisk.totalStrategicRiskPercent < 2) {
            keyThemes.push('📈 Portfolio risk low - opportunity for strategic additions');
        }
        
        return {
            strategicOutlook: strategicOutlook,
            outlookDescription: outlookDescription,
            currentRegime: regime,
            regimeConfidence: confidence,
            marketStress: marketStress,
            keyThemes: keyThemes,
            
            // Formatted data
            formattedConfidence: formatter.formatPercentage(confidence),
            formattedMarketStress: formatter.formatPercentage(marketStress),
            
            // Strategic recommendations
            strategicFocus: generateStrategicFocus(regime, confidence, marketStress, cambodiaPortfolio),
            riskManagementPriority: portfolioRisk.totalStrategicRiskPercent > 4 ? 'HIGH' : portfolioRisk.totalStrategicRiskPercent > 2 ? 'MEDIUM' : 'LOW'
        };
        
    } catch (error) {
        errorHandler.handleError(error, 'MARKET_SUMMARY');
        return {
            strategicOutlook: 'ERROR',
            outlookDescription: 'Unable to generate market summary',
            keyThemes: ['❌ Market analysis error - manual review required']
        };
    }
}

/**
 * 🎯 GENERATE STRATEGIC RECOMMENDATIONS
 */
function generateStrategicRecommendations(opportunities, portfolioRisk, cambodiaPortfolio) {
    const recommendations = [];
    
    try {
        // Portfolio-level recommendations
        if (portfolioRisk.totalStrategicRiskPercent > 6) {
            recommendations.push({
                type: 'RISK_MANAGEMENT',
                priority: 'HIGH',
                message: '⚠️ Portfolio risk exceeds 6% - immediate position reduction required',
                action: 'REDUCE_POSITIONS'
            });
        }
        
        if (portfolioRisk.strategicCorrelationRisk === 'HIGH') {
            recommendations.push({
                type: 'DIVERSIFICATION',
                priority: 'HIGH',
                message: '🔗 High correlation risk detected - diversify across asset classes',
                action: 'DIVERSIFY'
            });
        }
        
        // Opportunity-based recommendations
        const highPriorityOps = opportunities.filter(op => op.priority === 'HIGH');
        const mediumPriorityOps = opportunities.filter(op => op.priority === 'MEDIUM');
        
        if (highPriorityOps.length > 0) {
            const topOp = highPriorityOps[0];
            recommendations.push({
                type: 'OPPORTUNITY',
                priority: 'HIGH',
                message: `🎯 Top strategic opportunity: ${topOp.symbol} (Score: ${topOp.score}/100)`,
                action: 'CONSIDER_ENTRY',
                symbol: topOp.symbol,
                details: topOp.strategicRecommendation
            });
        }
        
        if (mediumPriorityOps.length > 2) {
            recommendations.push({
                type: 'OPPORTUNITY',
                priority: 'MEDIUM',
                message: `📊 Multiple medium-priority opportunities available (${mediumPriorityOps.length} pairs)`,
                action: 'REVIEW_OPPORTUNITIES'
            });
        }
        
        // Cambodia-specific recommendations
        if (cambodiaPortfolio?.integrationStatus === 'ACTIVE') {
            const cambodiaYield = cambodiaPortfolio.portfolioYield || 0;
            if (cambodiaYield > 20) {
                recommendations.push({
                    type: 'CAMBODIA_INTEGRATION',
                    priority: 'MEDIUM',
                    message: '🇰🇭 Strong Cambodia lending yields - consider currency hedging strategy',
                    action: 'HEDGE_CURRENCY'
                });
            }
            
            // Check for high correlation exposure
            const highCorrelationOps = opportunities.filter(op => 
                Math.abs(op.cambodiaCorrelation) > 0.7
            );
            
            if (highCorrelationOps.length > 1) {
                recommendations.push({
                    type: 'CAMBODIA_INTEGRATION',
                    priority: 'HIGH',
                    message: '🔗 Multiple FX positions highly correlated with Cambodia lending - reduce correlation risk',
                    action: 'REDUCE_CORRELATION'
                });
            }
        }
        
        // Market regime recommendations
        const currentRegime = portfolioRisk.currentStrategicRegime;
        if (currentRegime === 'GROWTH_FALLING_INFLATION_RISING') {
            recommendations.push({
                type: 'REGIME_STRATEGY',
                priority: 'HIGH',
                message: '🏛️ Stagflation regime detected - implement defensive strategy',
                action: 'DEFENSIVE_POSITIONING'
            });
        } else if (currentRegime === 'GROWTH_RISING_INFLATION_FALLING') {
            recommendations.push({
                type: 'REGIME_STRATEGY',
                priority: 'MEDIUM',
                message: '🌟 Goldilocks regime - opportunistic risk-taking appropriate',
                action: 'OPPORTUNISTIC_POSITIONING'
            });
        }
        
        // Default recommendation if no specific ones
        if (recommendations.length === 0) {
            recommendations.push({
                type: 'GENERAL',
                priority: 'LOW',
                message: '✅ Portfolio within Strategic Commander guidelines - maintain current approach',
                action: 'MAINTAIN'
            });
        }
        
        return recommendations.slice(0, 8); // Limit to top 8 recommendations
        
    } catch (error) {
        errorHandler.handleError(error, 'GENERATE_RECOMMENDATIONS');
        return [{
            type: 'ERROR',
            priority: 'HIGH',
            message: '❌ Unable to generate strategic recommendations - manual review required',
            action: 'MANUAL_REVIEW'
        }];
    }
}

/**
 * 📋 ENHANCED STRATEGIC TRADING SUMMARY
 */
async function getEnhancedTradingSummary() {
    try {
        console.log('📊 Generating Enhanced Strategic Trading Summary...');
        
        const [accountInfo, positions, orders, history, portfolioRisk, opportunities] = await Promise.all([
            getAccountInfo(),
            getOpenPositions(),
            getPendingOrders(),
            getTradeHistory(),
            calculateStrategicPortfolioRisk(10000), // Will use actual balance
            scanStrategicTradingOpportunities()
        ]);
        
        // Calculate actual portfolio risk with real balance
        const realPortfolioRisk = accountInfo?.balance ? 
            await calculateStrategicPortfolioRisk(accountInfo.balance) : portfolioRisk;
        
        // Performance calculations
        const totalProfit = positions.reduce((sum, pos) => sum + (pos.profit || 0), 0);
        const totalSwap = positions.reduce((sum, pos) => sum + (pos.swap || 0), 0);
        const netProfit = totalProfit + totalSwap;
        
        // Historical performance (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentTrades = history.filter(trade => 
            new Date(trade.closeTime) > thirtyDaysAgo
        );
        const historicalProfit = recentTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
        
        // Win rate calculation
        const winningTrades = recentTrades.filter(trade => (trade.profit || 0) > 0);
        const winRate = recentTrades.length > 0 ? (winningTrades.length / recentTrades.length) * 100 : 0;
        
        // Diversification analysis
        const diversificationScore = calculateStrategicDiversificationScore(positions);
        
        // Cambodia integration analysis
        const cambodiaPortfolio = await getCambodiaPortfolioForIntegration();
        
        const summary = {
            // Timestamp
            generatedAt: new Date().toISOString(),
            formattedGeneratedAt: formatter.formatDate(new Date(), { includeTime: true }),
            
            // Account Overview
            account: {
                balance: accountInfo?.balance || 0,
                equity: accountInfo?.equity || 0,
                margin: accountInfo?.margin || 0,
                freeMargin: accountInfo?.freeMargin || 0,
                marginLevel: accountInfo?.marginLevel || 0,
                leverage: accountInfo?.leverage || 100,
                
                // Formatted values
                formattedBalance: accountInfo?.formattedBalance || '$0.00',
                formattedEquity: accountInfo?.formattedEquity || '$0.00',
                formattedMargin: accountInfo?.formattedMargin || '$0.00',
                formattedFreeMargin: accountInfo?.formattedFreeMargin || '$0.00',
                formattedMarginLevel: accountInfo?.formattedMarginLevel || '0%'
            },
            
            // Position Summary
            positions: {
                count: positions.length,
                totalVolume: positions.reduce((sum, pos) => sum + Math.abs(pos.volume), 0),
                totalProfit: totalProfit,
                totalSwap: totalSwap,
                netProfit: netProfit,
                
                // Formatted values
                formattedTotalVolume: positions.reduce((sum, pos) => sum + Math.abs(pos.volume), 0).toFixed(2),
                formattedTotalProfit: formatter.formatCurrency(totalProfit),
                formattedTotalSwap: formatter.formatCurrency(totalSwap),
                formattedNetProfit: formatter.formatCurrency(netProfit),
                
                // Position breakdown
                breakdown: positions.map(pos => ({
                    symbol: pos.symbol,
                    type: pos.type,
                    volume: pos.volume,
                    profit: pos.profit,
                    formattedProfit: pos.formattedProfit
                }))
            },
            
            // Orders Summary
            orders: {
                count: orders.length,
                breakdown: orders.map(order => ({
                    symbol: order.symbol,
                    type: order.type,
                    volume: order.volume,
                    openPrice: order.openPrice,
                    formattedOpenPrice: order.formattedOpenPrice
                }))
            },
            
            // Performance Analysis
            performance: {
                thirtyDayProfit: historicalProfit,
                thirtyDayTrades: recentTrades.length,
                winRate: winRate,
                winningTrades: winningTrades.length,
                losingTrades: recentTrades.length - winningTrades.length,
                
                // Formatted values
                formattedThirtyDayProfit: formatter.formatCurrency(historicalProfit),
                formattedWinRate: formatter.formatPercentage(winRate),
                
                // Performance grade
                performanceGrade: winRate >= 70 ? 'EXCELLENT' : winRate >= 60 ? 'GOOD' : winRate >= 50 ? 'FAIR' : 'POOR'
            },
            
            // Risk Analysis
            risk: {
                ...realPortfolioRisk,
                diversificationScore: diversificationScore
            },
            
            // Market Opportunities
            opportunities: {
                total: opportunities.totalOpportunities || 0,
                highPriority: opportunities.highPriorityOpportunities || 0,
                mediumPriority: opportunities.mediumPriorityOpportunities || 0,
                lowPriority: opportunities.lowPriorityOpportunities || 0,
                top3: (opportunities.opportunities || []).slice(0, 3),
                marketSummary: opportunities.marketSummary || {}
            },
            
            // Cambodia Integration
            cambodiaIntegration: {
                status: cambodiaPortfolio?.integrationStatus || 'NOT_CONFIGURED',
                portfolio: cambodiaPortfolio || {},
                correlationRisk: realPortfolioRisk.cambodiaIntegrationRisk || 'NONE',
                recommendations: (opportunities.strategicRecommendations || []).filter(rec => 
                    rec.type === 'CAMBODIA_INTEGRATION'
                )
            },
            
            // Strategic Recommendations
            recommendations: opportunities.strategicRecommendations || [],
            
            // Health Score (Overall portfolio health 0-100)
            healthScore: calculateOverallHealthScore({
                winRate,
                diversificationScore: diversificationScore.score,
                riskLevel: realPortfolioRisk.totalStrategicRiskPercent,
                marginLevel: accountInfo?.marginLevel || 0,
                profitability: netProfit > 0 ? 100 : 0
            })
        };
        
        console.log('✅ Enhanced Strategic Trading Summary generated successfully');
        return summary;
        
    } catch (error) {
        console.error('Enhanced trading summary error:', error.message);
        errorHandler.handleError(error, 'ENHANCED_SUMMARY');
        return {
            error: error.message,
            generatedAt: new Date().toISOString(),
            formattedGeneratedAt: formatter.formatDate(new Date(), { includeTime: true }),
            healthScore: {
                score: 0,
                grade: 'ERROR',
                description: 'Unable to calculate health score'
            }
        };
    }
}

/**
 * 🎯 GPT FORMATTING FUNCTIONS FOR STRATEGIC COMMANDER
 */
const gptFormatting = {
    
    /**
     * Format trading summary for GPT consumption
     */
    formatTradingSummaryForGPT(summary) {
        try {
            const gptFormat = {
                // Executive Summary
                executiveSummary: {
                    timestamp: summary.formattedGeneratedAt,
                    accountBalance: summary.account.formattedBalance,
                    totalPositions: summary.positions.count,
                    netProfit: summary.positions.formattedNetProfit,
                    healthScore: `${summary.healthScore.score}/100 (${summary.healthScore.grade})`,
                    overallStatus: summary.healthScore.score >= 70 ? '✅ HEALTHY' : summary.healthScore.score >= 50 ? '⚠️ CAUTION' : '🚨 CRITICAL'
                },
                
                // Key Metrics
                keyMetrics: {
                    performance: {
                        winRate: summary.performance.formattedWinRate,
                        thirtyDayProfit: summary.performance.formattedThirtyDayProfit,
                        grade: summary.performance.performanceGrade
                    },
                    risk: {
                        portfolioRisk: summary.risk.formattedRiskPercent,
                        correlationRisk: summary.risk.strategicCorrelationRisk,
                        diversificationScore: summary.risk.diversificationScore.formattedScore
                    },
                    opportunities: {
                        total: summary.opportunities.total,
                        highPriority: summary.opportunities.highPriority,
                        marketOutlook: summary.opportunities.marketSummary.strategicOutlook
                    }
                },
                
                // Active Positions (GPT-friendly format)
                activePositions: summary.positions.breakdown.map(pos => 
                    `${pos.symbol} ${pos.type} ${pos.volume} lots: ${pos.formattedProfit}`
                ),
                
                // Top Opportunities (GPT-friendly format)
                topOpportunities: summary.opportunities.top3.map(opp => 
                    `${opp.symbol}: ${opp.formattedScore} - ${opp.strategicRecommendation}`
                ),
                
                // Recommendations (GPT-friendly format)
                immediateActions: summary.recommendations
                    .filter(rec => rec.priority === 'HIGH')
                    .map(rec => `${rec.type}: ${rec.message}`)
                    .slice(0, 3),
                
                // Cambodia Integration Status
                cambodiaStatus: {
                    integrationActive: summary.cambodiaIntegration.status === 'ACTIVE',
                    correlationRisk: summary.cambodiaIntegration.correlationRisk,
                    portfolioValue: summary.cambodiaIntegration.portfolio.formattedAUM || 'N/A'
                },
                
                // Market Context
                marketContext: {
                    regime: summary.opportunities.marketSummary.currentRegime,
                    confidence: summary.opportunities.marketSummary.formattedConfidence,
                    outlook: summary.opportunities.marketSummary.strategicOutlook,
                    keyThemes: summary.opportunities.marketSummary.keyThemes?.slice(0, 3) || []
                }
            };
            
            return gptFormat;
            
        } catch (error) {
            errorHandler.handleError(error, 'GPT_FORMAT_SUMMARY');
            return {
                error: 'Failed to format summary for GPT',
                rawSummary: summary
            };
        }
    },
    
    /**
     * Format position analysis for GPT
     */
    formatPositionAnalysisForGPT(positionSize, symbol, direction) {
        try {
            return {
                recommendation: {
                    symbol: symbol,
                    direction: direction,
                    recommendedSize: positionSize.formattedRecommendedSize,
                    riskAmount: positionSize.formattedRiskAmount,
                    riskPercent: positionSize.formattedRiskPercent,
                    positionValue: positionSize.formattedPositionValue
                },
                strategicFactors: {
                    regimeMultiplier: positionSize.strategicRegimeMultiplier,
                    currentRegime: positionSize.currentStrategicRegime,
                    volatilityAdjustment: positionSize.strategicVolatilityMultiplier,
                    correlationRisk: positionSize.strategicCorrelationMultiplier,
                    cambodiaCorrelation: positionSize.cambodiaCorrelationMultiplier
                },
                riskWarnings: positionSize.strategicWarnings || [],
                cambodiaIntegration: {
                    status: positionSize.cambodiaIntegrationStatus,
                    correlationWithLending: positionSize.currencyCorrelation,
                    totalExposure: formatter.formatCurrency(positionSize.totalCombinedExposure || 0)
                },
                summary: `${symbol} ${direction}: ${positionSize.formattedRecommendedSize} lots (${positionSize.formattedRiskPercent} risk)`
            };
            
        } catch (error) {
            errorHandler.handleError(error, 'GPT_FORMAT_POSITION');
            return {
                error: 'Failed to format position analysis for GPT',
                rawAnalysis: positionSize
            };
        }
    },
    
    /**
     * Format opportunity scan for GPT
     */
    formatOpportunityScanForGPT(scanResults) {
        try {
            return {
                scanSummary: {
                    timestamp: scanResults.formattedTimestamp,
                    totalOpportunities: scanResults.totalOpportunities,
                    marketRegime: scanResults.marketRegime,
                    regimeConfidence: `${scanResults.regimeConfidence}%`,
                    portfolioRiskLevel: scanResults.portfolioRiskLevel
                },
                topOpportunities: scanResults.opportunities?.slice(0, 5).map(opp => ({
                    symbol: opp.symbol,
                    score: opp.formattedScore,
                    priority: opp.priority,
                    direction: opp.directionBias,
                    signals: opp.signals.join(', '),
                    recommendation: opp.strategicRecommendation,
                    riskWarnings: opp.riskWarnings?.join(', ') || 'None'
                })) || [],
                marketInsights: {
                    outlook: scanResults.marketSummary?.strategicOutlook || 'NEUTRAL',
                    description: scanResults.marketSummary?.outlookDescription || 'No clear trend',
                    keyThemes: scanResults.marketSummary?.keyThemes?.slice(0, 4) || [],
                    riskFocus: scanResults.marketSummary?.riskManagementPriority || 'MEDIUM'
                },
                actionItems: scanResults.strategicRecommendations?.slice(0, 3).map(rec => 
                    `${rec.priority}: ${rec.message}`
                ) || [],
                nextScanRecommended: scanResults.formattedNextScan
            };
            
        } catch (error) {
            errorHandler.handleError(error, 'GPT_FORMAT_SCAN');
            return {
                error: 'Failed to format opportunity scan for GPT',
                rawScan: scanResults
            };
        }
    },
    
    /**
     * Format risk analysis for GPT
     */
    formatRiskAnalysisForGPT(riskAnalysis) {
        try {
            return {
                portfolioRisk: {
                    totalRisk: riskAnalysis.formattedTotalRisk,
                    riskPercent: riskAnalysis.formattedRiskPercent,
                    positionCount: riskAnalysis.strategicPositionCount,
                    correlationRisk: riskAnalysis.strategicCorrelationRisk,
                    regimeRisk: riskAnalysis.strategicRegimeRisk,
                    cambodiaRisk: riskAnalysis.cambodiaIntegrationRisk
                },
                diversification: {
                    score: riskAnalysis.diversificationScore?.formattedScore || 'N/A',
                    grade: riskAnalysis.diversificationScore?.grade || 'UNKNOWN',
                    recommendation: riskAnalysis.diversificationScore?.recommendation || 'Monitor diversification'
                },
                keyRisks: riskAnalysis.strategicRecommendations?.slice(0, 3) || [],
                cambodiaIntegration: {
                    status: riskAnalysis.cambodiaPortfolio?.integrationStatus || 'NOT_CONFIGURED',
                    portfolioValue: riskAnalysis.cambodiaPortfolio?.formattedAUM || 'N/A',
                    correlationDetails: riskAnalysis.cambodiaRiskDetails || []
                },
                immediateActions: riskAnalysis.strategicRecommendations?.filter(rec => 
                    rec.includes('⚠️') || rec.includes('🚨')
                ) || []
            };
            
        } catch (error) {
            errorHandler.handleError(error, 'GPT_FORMAT_RISK');
            return {
                error: 'Failed to format risk analysis for GPT',
                rawRisk: riskAnalysis
            };
        }
    }
};

/**
 * 🔧 HELPER FUNCTIONS
 */

/**
 * Generate symbol-specific recommendation
 */
function generateSymbolRecommendation(symbol, score, priority, directionBias) {
    try {
        if (score >= 80) {
            return `Excellent strategic opportunity - consider ${directionBias !== 'NEUTRAL' ? directionBias.toLowerCase() + ' bias' : 'both directions'}`;
        } else if (score >= 70) {
            return `Strong strategic setup - good risk/reward profile`;
        } else if (score >= 60) {
            return `Moderate opportunity - monitor for entry signals`;
        } else if (score >= 45) {
            return `Fair setup - wait for better confirmation`;
        } else {
            return `Low priority - focus on higher-scoring opportunities`;
        }
    } catch (error) {
        return 'Unable to generate recommendation';
    }
}

/**
 * Generate risk warnings for symbol
 */
function generateRiskWarnings(symbol, volatilityData, correlationData, cambodiaAdjustment) {
    const warnings = [];
    
    try {
        if (volatilityData.riskLevel === 'HIGH') {
            warnings.push('⚠️ High volatility - use smaller position sizes');
        }
        
        if (correlationData.correlationRisk === 'HIGH') {
            warnings.push('🔗 High correlation with existing positions');
        }
        
        if (cambodiaAdjustment < -5) {
            warnings.push('🇰🇭 High correlation with Cambodia lending portfolio');
        }
        
        if (symbol === 'USDKHR') {
            warnings.push('💱 Pegged currency - limited volatility but policy risk');
        }
        
        if (symbol.includes('NZD') || symbol.includes('AUD')) {
            warnings.push('🏗️ Commodity currency - sensitive to risk sentiment');
        }
        
        return warnings;
        
    } catch (error) {
        return ['⚠️ Unable to assess risk warnings'];
    }
}

/**
 * Generate strategic focus based on market conditions
 */
function generateStrategicFocus(regime, confidence, marketStress, cambodiaPortfolio) {
    try {
        const focuses = [];
        
        if (regime === 'GROWTH_RISING_INFLATION_FALLING') {
            focuses.push('Growth assets and risk currencies');
            focuses.push('USD strength themes');
        } else if (regime === 'GROWTH_FALLING_INFLATION_RISING') {
            focuses.push('Defensive positioning');
            focuses.push('Safe haven currencies');
        } else if (regime === 'GROWTH_FALLING_INFLATION_FALLING') {
            focuses.push('Deflationary hedges');
            focuses.push('Central bank easing trades');
        }
        
        if (confidence < 60) {
            focuses.push('Reduced position sizing');
            focuses.push('Increased diversification');
        }
        
        if (marketStress > 70) {
            focuses.push('Risk management priority');
            focuses.push('Liquidity preservation');
        }
        
        if (cambodiaPortfolio?.integrationStatus === 'ACTIVE') {
            focuses.push('Currency correlation monitoring');
            focuses.push('Integrated portfolio optimization');
        }
        
        return focuses.slice(0, 4); // Limit to top 4 focuses
        
    } catch (error) {
        return ['Manual analysis required'];
    }
}

/**
 * Calculate overall portfolio health score
 */
function calculateOverallHealthScore(metrics) {
    try {
        let score = 0;
        
        // Win rate contribution (30%)
        score += (metrics.winRate / 100) * 30;
        
        // Diversification contribution (25%)
        score += (metrics.diversificationScore / 100) * 25;
        
        // Risk level contribution (25%) - inverse relationship
        const riskScore = Math.max(0, (6 - metrics.riskLevel) / 6); // 6% is max acceptable risk
        score += riskScore * 25;
        
        // Margin level contribution (10%)
        const marginScore = metrics.marginLevel > 1000 ? 1 : metrics.marginLevel / 1000;
        score += marginScore * 10;
        
        // Profitability contribution (10%)
        score += (metrics.profitability / 100) * 10;
        
        const finalScore = Math.round(Math.max(0, Math.min(100, score)));
        
        let grade = 'POOR';
        let description = 'Portfolio needs attention';
        
        if (finalScore >= 85) {
            grade = 'EXCELLENT';
            description = 'Portfolio in excellent health';
        } else if (finalScore >= 70) {
            grade = 'GOOD';
            description = 'Portfolio performing well';
        } else if (finalScore >= 55) {
            grade = 'FAIR';
            description = 'Portfolio has room for improvement';
        } else if (finalScore >= 40) {
            grade = 'POOR';
            description = 'Portfolio needs significant attention';
        } else {
            grade = 'CRITICAL';
            description = 'Portfolio requires immediate action';
        }
        
        return {
            score: finalScore,
            grade: grade,
            description: description,
            formattedScore: `${finalScore}/100`,
            breakdown: {
                winRate: Math.round((metrics.winRate / 100) * 30),
                diversification: Math.round((metrics.diversificationScore / 100) * 25),
                riskManagement: Math.round(riskScore * 25),
                marginHealth: Math.round(marginScore * 10),
                profitability: Math.round((metrics.profitability / 100) * 10)
            }
        };
        
    } catch (error) {
        errorHandler.handleError(error, 'HEALTH_SCORE');
        return {
            score: 0,
            grade: 'ERROR',
            description: 'Unable to calculate health score',
            formattedScore: 'ERROR'
        };
    }
}

/**
 * 🔄 CLEANUP AND DISCONNECT
 */
async function disconnectMetaAPI() {
    try {
        if (connection) {
            await connection.close();
            console.log('🔌 Strategic Commander MetaAPI connection closed');
        }
        
        isConnected = false;
        isSynchronized = false;
        connection = null;
        
        return { success: true, message: 'Strategic Commander disconnected successfully' };
        
    } catch (error) {
        console.error('Disconnect error:', error.message);
        errorHandler.handleError(error, 'DISCONNECT');
        return { success: false, error: error.message };
    }
}

/**
 * 📤 MODULE EXPORTS - STRATEGIC COMMANDER METATRADER INTEGRATION
 */
module.exports = {
    // Core Connection Functions
    initializeMetaAPI,
    getConnectionStatus,
    testConnection,
    disconnectMetaAPI,
    
    // Account & Position Functions
    getAccountInfo,
    getOpenPositions,
    getPendingOrders,
    getTradeHistory,
    getAccountLeverage,
    
    // Trading Operations
    executeMarketOrder,
    closePosition,
    getSymbolInfo,
    
    // Strategic Position Sizing & Risk Management
    calculateStrategicPositionSize,
    calculateStrategicPortfolioRisk,
    getStrategicVolatilityAdjustment,
    getStrategicCorrelationAdjustment,
    getStrategicRegimeMultiplier,
    calculateStrategicDiversificationScore,
    roundToLotSize,
    
    // Strategic Opportunity Analysis
    scanStrategicTradingOpportunities,
    analyzeStrategicOpportunity,
    generateStrategicMarketSummary,
    generateStrategicRecommendations,
    
    // Enhanced Summary & Reporting
    getEnhancedTradingSummary,
    
    // Cambodia Integration
    getCambodiaPortfolioForIntegration,
    
    // GPT Formatting Functions
    gptFormatting,
    
    // Utility Functions
    calculateOverallHealthScore,
    generateSymbolRecommendation,
    generateRiskWarnings,
    generateStrategicFocus,
    
    // Constants
    STRATEGIC_RISK_PARAMETERS,
    CURRENCY_CORRELATIONS,
    
    // Status Getters
    isMetaAPIConnected: () => isConnected,
    isMetaAPISynchronized: () => isSynchronized,
    getMetaAPIAccount: () => account,
    getMetaAPIConnection: () => connection
};

console.log('✅ MetaTrader Part 4 of 4 loaded: Trading Scanner, Enhanced Summary & GPT Formatting');
console.log('🎯 STRATEGIC COMMANDER MetaAPI Integration Complete - All 4 Parts Loaded Successfully!');
console.log('');
console.log('📊 Available Functions:');
console.log('   🔌 Connection: initializeMetaAPI, testConnection, getConnectionStatus');
console.log('   💰 Account: getAccountInfo, getOpenPositions, getTradeHistory');
console.log('   📈 Trading: executeMarketOrder, closePosition, calculateStrategicPositionSize');
console.log('   ⚖️ Risk: calculateStrategicPortfolioRisk, scanStrategicTradingOpportunities');
console.log('   📋 Summary: getEnhancedTradingSummary, gptFormatting functions');
console.log('   🇰🇭 Integration: getCambodiaPortfolioForIntegration');
console.log('');
console.log('🚀 Strategic Commander ready for deployment!');
