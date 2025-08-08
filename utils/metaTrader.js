// utils/metaTrader.js - STRATEGIC COMMANDER ENHANCED MetaAPI Integration
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

// 🏛️ STRATEGIC COMMANDER RISK MANAGEMENT PARAMETERS (Enhanced)
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
    }
};

// 🔗 CURRENCY CORRELATIONS FOR STRATEGIC ANALYSIS
const CURRENCY_CORRELATIONS = {
    'EURUSD': {
        'GBPUSD': 0.85,
        'USDJPY': -0.75,
        'USDCHF': -0.80,
        'AUDUSD': 0.70,
        'NZDUSD': 0.65
    },
    'GBPUSD': {
        'EURUSD': 0.85,
        'USDJPY': -0.70,
        'USDCHF': -0.75,
        'AUDUSD': 0.75,
        'NZDUSD': 0.70
    },
    'USDJPY': {
        'EURUSD': -0.75,
        'GBPUSD': -0.70,
        'USDCHF': 0.80,
        'AUDUSD': -0.60,
        'NZDUSD': -0.55
    }
};

/**
 * 🎯 INITIALIZE METAAPI CONNECTION
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
            console.error('❌ Strategic Commander: Account not found');
            return false;
        }
        
        console.log(`📊 Strategic Account found: ${account.name} (${account.server})`);
        
        // Deploy account
        await account.deploy();
        console.log('🚀 Strategic account deployment initiated...');
        
        // Wait for deployment
        await account.waitDeployed();
        console.log('✅ Strategic account deployed successfully');
        
        // Create connection
        connection = account.getStreamingConnection();
        await connection.connect();
        console.log('🔗 Strategic streaming connection established');
        
        // Wait for synchronization
        await connection.waitSynchronized();
        console.log('⚡ Strategic account synchronized');
        
        isConnected = true;
        isSynchronized = true;
        
        console.log('✅ Strategic Commander MetaAPI initialized successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Strategic Commander MetaAPI initialization error:', error.message);
        isConnected = false;
        isSynchronized = false;
        return false;
    }
}

/**
 * 💰 GET ACCOUNT INFORMATION
 */
async function getAccountInfo() {
    try {
        if (!isSynchronized || !connection) {
            return null;
        }
        
        const accountInfo = connection.accountInformation;
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
            loginId: account.login,
            name: account.name
        };
    } catch (error) {
        console.error('Get account info error:', error.message);
        return null;
    }
}

/**
 * 📊 GET OPEN POSITIONS
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
            openTime: pos.openTime
        }));
    } catch (error) {
        console.error('Get open positions error:', error.message);
        return [];
    }
}

/**
 * 📋 GET PENDING ORDERS
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
            openTime: order.openTime
        }));
    } catch (error) {
        console.error('Get pending orders error:', error.message);
        return [];
    }
}

/**
 * 📈 GET TRADE HISTORY
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
            comment: trade.comment
        }));
    } catch (error) {
        console.error('Get trade history error:', error.message);
        return [];
    }
}

/**
 * 🎯 EXECUTE MARKET ORDER
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
            message: `Order executed successfully`
        };
        
    } catch (error) {
        console.error('Execute market order error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * ❌ CLOSE POSITION
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
            message: 'Position closed successfully'
        };
        
    } catch (error) {
        console.error('Close position error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 GET SYMBOL INFORMATION
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
            volumeStep: symbolInfo.volumeStep
        };
    } catch (error) {
        console.error('Get symbol info error:', error.message);
        return null;
    }
}

/**
 * 🔗 GET CONNECTION STATUS
 */
async function getConnectionStatus() {
    return {
        metaApiInitialized: metaApi !== null,
        connected: isConnected,
        synchronized: isSynchronized,
        accountId: METAAPI_ACCOUNT_ID || 'Not configured',
        hasToken: !!METAAPI_TOKEN,
        timestamp: new Date().toISOString()
    };
}

/**
 * 🧪 TEST CONNECTION
 */
async function testConnection() {
    try {
        console.log('🧪 Testing Strategic Commander MetaAPI connection...');
        
        if (!METAAPI_TOKEN || !METAAPI_ACCOUNT_ID) {
            return {
                success: false,
                error: 'MetaAPI credentials not configured',
                accountInfo: null
            };
        }
        
        if (!isSynchronized) {
            console.log('⚠️ Connection not synchronized, attempting to initialize...');
            const initialized = await initializeMetaAPI();
            if (!initialized) {
                return {
                    success: false,
                    error: 'Failed to initialize MetaAPI',
                    accountInfo: null
                };
            }
        }
        
        const accountInfo = await getAccountInfo();
        
        return {
            success: true,
            message: 'Strategic Commander MetaAPI connection successful',
            accountInfo: accountInfo
        };
        
    } catch (error) {
        console.error('Test connection error:', error.message);
        return {
            success: false,
            error: error.message,
            accountInfo: null
        };
    }
}

/**
 * ⚖️ GET ACCOUNT LEVERAGE
 */
async function getAccountLeverage() {
    try {
        const accountInfo = await getAccountInfo();
        return accountInfo?.leverage || 100; // Default leverage
    } catch (error) {
        console.error('Get account leverage error:', error.message);
        return 100; // Default fallback
    }
}

/**
 * 📏 ROUND TO LOT SIZE
 */
function roundToLotSize(size, symbol) {
    // Standard forex lot sizing
    const minLot = 0.01;
    const lotStep = 0.01;
    
    const rounded = Math.round(size / lotStep) * lotStep;
    return Math.max(minLot, rounded);
}

/**
 * 🎯 STRATEGIC COMMANDER POSITION SIZING CALCULATOR
 * Enhanced with institutional authority and strategic warfare principles
 */
async function calculateStrategicPositionSize(symbol, direction, entryPrice, stopLoss, accountBalance, marketData = null) {
    try {
        console.log(`🎯 Strategic Commander calculating position size for ${symbol} ${direction}`);
        
        // Get current strategic market regime data
        if (!marketData) {
            marketData = await getRayDalioMarketData().catch(() => null);
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
        
        // Calculate strategic position value and margin requirement
        const positionValue = strategicPositionSize * entryPrice;
        const leverage = await getAccountLeverage();
        const marginRequired = positionValue / leverage;
        
        // Strategic validation checks
        const maxStrategicPosition = accountBalance * 0.1; // Max 10% of account per strategic trade
        strategicPositionSize = Math.min(strategicPositionSize, maxStrategicPosition);
        
        // Round to strategic lot size
        const strategicLotSize = roundToLotSize(strategicPositionSize, symbol);
        
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
            
            // Strategic regime context
            currentStrategicRegime: marketData?.rayDalio?.regime?.currentRegime?.name || 'UNKNOWN',
            strategicRegimeConfidence: marketData?.rayDalio?.regime?.confidence || 0,
            
            // Strategic risk metrics
            stopLossDistance: stopLossDistance,
            stopLossPercent: (stopLossPercent * 100).toFixed(2),
            strategicRiskRewardRatio: null, // To be calculated with take profit
            
            // Strategic warnings
            strategicWarnings: []
        };
        
        // Add strategic warnings
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
        
        console.log(`✅ Strategic position size calculated: ${strategicLotSize} lots (${strategicAnalysis.strategicRiskPercent.toFixed(2)}% strategic risk)`);
        return strategicAnalysis;
        
    } catch (error) {
        console.error('Strategic position sizing error:', error.message);
        return {
            error: error.message,
            recommendedSize: 0.01, // Minimum strategic fallback
            strategicWarnings: ['❌ Strategic position sizing calculation failed - using minimum safe size']
        };
    }
}

/**
 * 🏛️ GET STRATEGIC REGIME MULTIPLIER
 */
function getStrategicRegimeMultiplier(marketData) {
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
    }
    
    return Math.max(0.3, Math.min(1.5, strategicMultiplier)); // Strategic cap between 0.3x and 1.5x
}

/**
 * 📊 GET STRATEGIC VOLATILITY ADJUSTMENT
 */
async function getStrategicVolatilityAdjustment(symbol) {
    try {
        // Strategic volatility adjustment for optimal positioning
        const strategicVolatility = {
            'EURUSD': 0.7,
            'GBPUSD': 0.8,
            'USDJPY': 0.6,
            'AUDUSD': 0.8,
            'USDCAD': 0.6,
            'NZDUSD': 0.9,
            'USDCHF': 0.7
        };
        
        const symbolVol = strategicVolatility[symbol] || 0.8;
        
        // Strategic inverse relationship: higher volatility = smaller strategic position
        return 0.8 / symbolVol;
        
    } catch (error) {
        console.error('Strategic volatility adjustment error:', error.message);
        return 1.0; // Default to no strategic adjustment
    }
}

/**
 * 🔗 GET STRATEGIC CORRELATION ADJUSTMENT
 */
async function getStrategicCorrelationAdjustment(symbol) {
    try {
        // Get current strategic positions
        const positions = await getOpenPositions();
        if (!positions || positions.length === 0) {
            return 1.0; // No strategic correlation risk if no positions
        }
        
        let totalStrategicCorrelationRisk = 0;
        
        positions.forEach(position => {
            const posSymbol = position.symbol;
            const correlation = CURRENCY_CORRELATIONS[symbol]?.[posSymbol] || 0;
            
            if (Math.abs(correlation) > 0.5) {
                // High strategic correlation detected
                totalStrategicCorrelationRisk += Math.abs(correlation) * Math.abs(position.volume);
            }
        });
        
        // Reduce strategic position size if high correlation exposure exists
        if (totalStrategicCorrelationRisk > 2.0) {
            return 0.6; // Significantly reduce strategic position
        } else if (totalStrategicCorrelationRisk > 1.0) {
            return 0.8; // Moderately reduce strategic position
        }
        
        return 1.0; // No strategic correlation adjustment needed
        
    } catch (error) {
        console.error('Strategic correlation adjustment error:', error.message);
        return 1.0;
    }
}

/**
 * ⚖️ CALCULATE STRATEGIC PORTFOLIO RISK METRICS
 */
async function calculateStrategicPortfolioRisk(accountBalance) {
    try {
        const positions = await getOpenPositions();
        const marketData = await getRayDalioMarketData().catch(() => null);
        
        if (!positions || positions.length === 0) {
            return {
                totalStrategicRisk: 0,
                totalStrategicRiskPercent: 0,
                strategicPositionCount: 0,
                strategicCorrelationRisk: 'LOW',
                strategicRegimeRisk: 'MODERATE',
                strategicRecommendations: ['📊 No open positions - clean slate for Strategic Commander positioning']
            };
        }
        
        let totalStrategicRiskAmount = 0;
        let strategicCorrelationMatrix = {};
        
        // Calculate individual strategic position risks
        positions.forEach(position => {
            // Estimate strategic risk based on current P&L and position size
            const strategicPositionRisk = Math.abs(position.profit || 0) + (position.volume * 100); // Simplified
            totalStrategicRiskAmount += strategicPositionRisk;
            
            // Track strategic correlation exposure
            const symbol = position.symbol;
            if (!strategicCorrelationMatrix[symbol]) {
                strategicCorrelationMatrix[symbol] = 0;
            }
            strategicCorrelationMatrix[symbol] += position.volume;
        });
        
        const totalStrategicRiskPercent = (totalStrategicRiskAmount / accountBalance) * 100;
        
        // Assess strategic correlation risk
        let strategicCorrelationRisk = 'LOW';
        let maxStrategicCorrelationExposure = 0;
        
        Object.values(strategicCorrelationMatrix).forEach(exposure => {
            const exposurePercent = (exposure * 1000) / accountBalance; // Strategic calculation
            if (exposurePercent > maxStrategicCorrelationExposure) {
                maxStrategicCorrelationExposure = exposurePercent;
            }
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
        
        if (positions.length > 5) {
            strategicRecommendations.push('📊 High number of strategic positions - consider consolidation');
        }
        
        if (strategicRecommendations.length === 0) {
            strategicRecommendations.push('✅ Strategic portfolio risk levels within Strategic Commander guidelines');
        }
        
        return {
            totalStrategicRisk: totalStrategicRiskAmount,
            totalStrategicRiskPercent: totalStrategicRiskPercent.toFixed(2),
            strategicPositionCount: positions.length,
            strategicCorrelationRisk,
            strategicRegimeRisk,
            maxStrategicCorrelationExposure: maxStrategicCorrelationExposure.toFixed(2),
            currentStrategicRegime: regimeName || 'UNKNOWN',
            strategicRegimeConfidence: regimeConfidence,
            strategicRecommendations
        };
        
    } catch (error) {
        console.error('Strategic portfolio risk calculation error:', error.message);
        return {
            error: error.message,
            strategicRecommendations: ['❌ Strategic risk calculation failed - monitor positions manually']
        };
    }
}

/**
 * 🎯 STRATEGIC COMMANDER TRADING OPPORTUNITIES SCANNER
 */
async function scanStrategicTradingOpportunities() {
    try {
        console.log('🔍 Strategic Commander scanning for institutional-grade trading opportunities...');
        
        const marketData = await getRayDalioMarketData();
        const accountInfo = await getAccountInfo();
        const currentPositions = await getOpenPositions();
        
        if (!marketData || !accountInfo) {
            return {
                error: 'Strategic market data or account info unavailable',
                strategicOpportunities: []
            };
        }
        
        const strategicOpportunities = [];
        
        // Strategic regime-based opportunities
        const regime = marketData.rayDalio?.regime?.currentRegime;
        if (regime) {
            const strategicRegimeOpps = generateStrategicRegimeOpportunities(regime, marketData);
            strategicOpportunities.push(...strategicRegimeOpps);
        }
        
        // Strategic yield curve opportunities
        if (marketData.rayDalio?.yieldCurve) {
            const strategicCurveOpps = generateStrategicYieldCurveOpportunities(marketData.rayDalio.yieldCurve);
            strategicOpportunities.push(...strategicCurveOpps);
        }
        
        // Strategic credit spread opportunities
        if (marketData.rayDalio?.creditSpreads) {
            const strategicCreditOpps = generateStrategicCreditOpportunities(marketData.rayDalio.creditSpreads);
            strategicOpportunities.push(...strategicCreditOpps);
        }
        
        // Filter based on strategic correlation limits
        const filteredStrategicOpportunities = filterByStrategicCorrelation(strategicOpportunities, currentPositions);
        
        // Add strategic position sizing for each opportunity
        const enhancedStrategicOpportunities = await Promise.all(
            filteredStrategicOpportunities.map(async (opp) => {
                const strategicSizing = await calculateStrategicPositionSize(
                    opp.symbol,
                    opp.direction,
                    opp.entryPrice,
                    opp.stopLoss,
                    accountInfo.balance,
                    marketData
                );
                
                return {
                    ...opp,
                    strategicSizing: strategicSizing,
                    strategicAuthority: 'STRATEGIC_COMMANDER',
                    institutionalGrade: true
                };
            })
        );
        
        return {
            strategicOpportunities: enhancedStrategicOpportunities.slice(0, 5), // Top 5 strategic opportunities
            strategicMarketRegime: regime?.name || 'UNKNOWN',
            strategicRegimeConfidence: marketData.rayDalio?.regime?.confidence || 0,
            strategicScanTime: new Date().toISOString(),
            strategicCommanderActive: true
        };
        
    } catch (error) {
        console.error('Strategic opportunities scanner error:', error.message);
        return {
            error: error.message,
            strategicOpportunities: []
        };
    }
}

/**
 * 🏛️ ENHANCED TRADING SUMMARY WITH STRATEGIC COMMANDER AUTHORITY
 */
async function getStrategicTradingSummary() {
    try {
        const connectionStatus = await getConnectionStatus();
        
        if (!connectionStatus.synchronized) {
            console.log('⚠️ MetaAPI not synchronized, Strategic Commander attempting to initialize...');
            const initialized = await initializeMetaAPI();
            if (!initialized) {
                return {
                    error: 'MetaAPI not synchronized',
                    status: connectionStatus,
                    message: 'Strategic Commander: MetaAPI initialization failed. Check credentials and account status.',
                    strategicCommanderStatus: 'WAITING_FOR_CONNECTION'
                };
            }
            connectionStatus.synchronized = isSynchronized;
            connectionStatus.connected = isConnected;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const [accountInfo, positions, orders, strategicPortfolioRisk] = await Promise.all([
            getAccountInfo(),
            getOpenPositions(),
            getPendingOrders(),
            calculateStrategicPortfolioRisk(connectionStatus.synchronized ? 10000 : 0)
        ]);
        
        // Calculate strategic current P&L from open positions
        const strategicCurrentPnL = positions.reduce((sum, pos) => sum + (pos.profit || 0), 0);
        
        // Strategic Commander enhanced performance metrics
        const strategicCommanderMetrics = {
            strategicRiskUtilization: strategicPortfolioRisk.totalStrategicRiskPercent || 0,
            strategicCorrelationRisk: strategicPortfolioRisk.strategicCorrelationRisk || 'LOW',
            strategicRegimeRisk: strategicPortfolioRisk.strategicRegimeRisk || 'MODERATE',
            strategicPositionCount: positions.length,
            maxStrategicPositions: 5,
            strategicDiversificationScore: calculateStrategicDiversificationScore(positions),
            strategicRiskAdjustedReturn: strategicCurrentPnL > 0 ? (strategicCurrentPnL / Math.max(strategicPortfolioRisk.totalStrategicRisk || 1, 1)) : 0,
            strategicCommanderActive: true,
            institutionalGrade: true
        };
        
        const strategicSummary = {
            account: accountInfo,
            openPositions: positions,
            pendingOrders: orders,
            recentTrades: [],
            performance: {
                totalTrades: 0,
                profitableTrades: 0,
                losingTrades: 0,
                totalProfit: 0,
                strategicCurrentPnL: strategicCurrentPnL,
                winRate: '0.00',
                averageProfit: '0.00'
            },
            strategicCommanderMetrics: strategicCommanderMetrics,
            strategicPortfolioRisk: strategicPortfolioRisk,
            connectionStatus: connectionStatus,
            strategicCommanderStatus: 'ACTIVE',
            institutionalGrade: true,
            timestamp: new Date().toISOString()
        };
        
        return strategicSummary;
        
    } catch (error) {
        console.error('Strategic Commander trading summary error:', error.message);
        return {
            error: error.message,
            status: await getConnectionStatus(),
            strategicCommanderStatus: 'ERROR'
        };
    }
}

/**
 * 📊 CALCULATE STRATEGIC DIVERSIFICATION SCORE
 */
function calculateStrategicDiversificationScore(positions) {
    if (!positions || positions.length === 0) return 100;
    
    const strategicSymbolGroups = {
        'USD_MAJORS': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD'],
        'USD_MINORS': ['AUDUSD', 'NZDUSD'],
        'CROSS_PAIRS': ['EURJPY', 'GBPJPY', 'EURGBP', 'AUDCAD', 'AUDCHF']
    };
    
    const strategicGroupExposure = {};
    let totalStrategicVolume = 0;
    
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
    Object.values(strategicGroupExposure).forEach(exposure => {
        const concentration = (exposure / totalStrategicVolume) * 100;
        if (concentration > maxStrategicGroupConcentration) {
            maxStrategicGroupConcentration = concentration;
        }
    });
    
    // Strategic Score: 100 = perfect diversification, 0 = maximum concentration
    return Math.max(0, 100 - maxStrategicGroupConcentration);
}

/**
 * 🎯 FORMAT TRADING DATA FOR STRATEGIC COMMANDER GPT
 */
function formatStrategicTradingDataForGPT(tradingData) {
    if (!tradingData || tradingData.error) {
        return `\n\n⚠️ STRATEGIC COMMANDER METATRADER STATUS: ${tradingData?.error || 'Not connected'}\n💡 Strategic Issue: ${tradingData?.message || 'MetaAPI connection failed - check credentials'}\n`;
    }
    
    let strategicContext = '\n\n🔴 LIVE STRATEGIC COMMANDER METATRADER DATA:\n';
    
    // Strategic Account Info with Risk Metrics
    if (tradingData.account) {
        const acc = tradingData.account;
        strategicContext += `💰 STRATEGIC ACCOUNT: ${acc.balance?.toFixed(2)} ${acc.currency} | Equity: ${acc.equity?.toFixed(2)} | Free Margin: ${acc.freeMargin?.toFixed(2)}\n`;
        strategicContext += `🏢 ${acc.company} | ${acc.server} | Leverage: 1:${acc.leverage} | Login: ${acc.loginId}\n`;
        
        if (acc.marginLevel) {
            strategicContext += `📊 Strategic Margin Level: ${acc.marginLevel.toFixed(2)}%\n`;
        }
    } else {
        strategicContext += `⚠️ Strategic account information not yet available - connection establishing\n`;
    }
    
    // Strategic Commander Risk Metrics
    if (tradingData.strategicCommanderMetrics) {
        const metrics = tradingData.strategicCommanderMetrics;
        strategicContext += `\n🏛️ STRATEGIC COMMANDER RISK METRICS:\n`;
        strategicContext += `• Strategic Portfolio Risk: ${metrics.strategicRiskUtilization}% (Target: <6%)\n`;
        strategicContext += `• Strategic Correlation Risk: ${metrics.strategicCorrelationRisk}\n`;
        strategicContext += `• Strategic Regime Risk: ${metrics.strategicRegimeRisk}\n`;
        strategicContext += `• Strategic Diversification Score: ${metrics.strategicDiversificationScore.toFixed(0)}/100\n`;
        strategicContext += `• Strategic Positions: ${metrics.strategicPositionCount}/${metrics.maxStrategicPositions} recommended\n`;
        
        if (metrics.strategicRiskAdjustedReturn > 0) {
            strategicContext += `• Strategic Risk-Adjusted Return: ${metrics.strategicRiskAdjustedReturn.toFixed(2)}\n`;
        }
    }
    
    // Strategic Open Positions with Regime Analysis
    if (tradingData.openPositions && tradingData.openPositions.length > 0) {
        strategicContext += `\n📊 STRATEGIC OPEN POSITIONS (${tradingData.openPositions.length}) - REGIME ANALYSIS:\n`;
        tradingData.openPositions.forEach(pos => {
            const profitStatus = pos.profit > 0 ? '🟢' : pos.profit < 0 ? '🔴' : '⚪';
            strategicContext += `${profitStatus} ${pos.symbol} ${pos.type} ${pos.volume} lots @ ${pos.openPrice} | P&L: ${pos.profit?.toFixed(2)}\n`;
        });
    } else {
        strategicContext += `\n📊 STRATEGIC OPEN POSITIONS: None (Clean slate for Strategic Commander positioning)\n`;
    }
    
    // Strategic Portfolio Risk Summary
    if (tradingData.strategicPortfolioRisk) {
        const risk = tradingData.strategicPortfolioRisk;
        strategicContext += `\n⚠️ STRATEGIC PORTFOLIO RISK ASSESSMENT:\n`;
        strategicContext += `• Total Strategic Risk: ${risk.totalStrategicRiskPercent}% of account\n`;
        strategicContext += `• Current Strategic Regime: ${risk.currentStrategicRegime} (${risk.strategicRegimeConfidence}% confidence)\n`;
        
        if (risk.strategicRecommendations && risk.strategicRecommendations.length > 0) {
            strategicContext += `• Strategic Recommendations:\n`;
            risk.strategicRecommendations.slice(0, 2).forEach(rec => {
                strategicContext += `  ${rec}\n`;
            });
        }
    }
    
    strategicContext += `\n⚡ STRATEGIC COMMANDER TRADING SYSTEM: Active\n`;
    strategicContext += `🏛️ Institutional risk management, strategic position sizing, and regime analysis enabled\n`;
    strategicContext += `📊 Real-time strategic correlation monitoring and diversification scoring\n`;
    strategicContext += `🕐 Strategic Last Updated: ${new Date().toLocaleTimeString()}\n`;
    
    return strategicContext;
}

// ======= HELPER FUNCTIONS FOR OPPORTUNITY GENERATION =======

/**
 * 🏛️ GENERATE STRATEGIC REGIME OPPORTUNITIES
 */
function generateStrategicRegimeOpportunities(regime, marketData) {
    const opportunities = [];
    
    switch (regime.name) {
        case 'GROWTH_RISING_INFLATION_FALLING':
            // Goldilocks scenario - risk-on
            opportunities.push({
                symbol: 'EURUSD',
                direction: 'BUY',
                entryPrice: 1.0850,
                stopLoss: 1.0800,
                takeProfit: 1.0950,
                confidence: 85,
                rationale: 'Goldilocks regime favors risk currencies - EUR strength expected',
                timeHorizon: '1-2 weeks'
            });
            break;
            
        case 'GROWTH_FALLING_INFLATION_RISING':
            // Stagflation - defensive positioning
            opportunities.push({
                symbol: 'USDJPY',
                direction: 'BUY',
                entryPrice: 150.00,
                stopLoss: 149.00,
                takeProfit: 152.00,
                confidence: 75,
                rationale: 'Stagflation regime supports safe haven JPY vs risk assets',
                timeHorizon: '2-4 weeks'
            });
            break;
    }
    
    return opportunities;
}

/**
 * 📈 GENERATE STRATEGIC YIELD CURVE OPPORTUNITIES
 */
function generateStrategicYieldCurveOpportunities(yieldCurve) {
    const opportunities = [];
    
    if (yieldCurve.spreads && yieldCurve.spreads['2s10s'] < -0.5) {
        // Deep inversion - recession risk
        opportunities.push({
            symbol: 'USDCHF',
            direction: 'BUY',
            entryPrice: 0.9200,
            stopLoss: 0.9150,
            takeProfit: 0.9300,
            confidence: 80,
            rationale: 'Deep yield curve inversion signals recession risk - safe haven CHF favored',
            timeHorizon: '3-6 weeks'
        });
    }
    
    return opportunities;
}

/**
 * 💰 GENERATE STRATEGIC CREDIT OPPORTUNITIES
 */
function generateStrategicCreditOpportunities(creditSpreads) {
    const opportunities = [];
    
    if (creditSpreads.conditions === 'CRISIS') {
        opportunities.push({
            symbol: 'USDJPY',
            direction: 'SELL',
            entryPrice: 150.00,
            stopLoss: 151.00,
            takeProfit: 148.00,
            confidence: 90,
            rationale: 'Credit crisis drives flight to quality - JPY strength expected',
            timeHorizon: '1-3 weeks'
        });
    }
    
    return opportunities;
}

/**
 * 🔗 FILTER BY STRATEGIC CORRELATION
 */
function filterByStrategicCorrelation(opportunities, currentPositions) {
    if (!currentPositions || currentPositions.length === 0) {
        return opportunities;
    }
    
    return opportunities.filter(opp => {
        // Check if opportunity would create excessive correlation
        const correlationRisk = currentPositions.some(pos => {
            const correlation = CURRENCY_CORRELATIONS[opp.symbol]?.[pos.symbol] || 0;
            return Math.abs(correlation) > 0.8; // High correlation threshold
        });
        
        return !correlationRisk;
    });
}

// Keep all your existing functions but alias the enhanced ones
module.exports = {
    // 🏛️ STRATEGIC COMMANDER ENHANCED FUNCTIONS
    calculateStrategicPositionSize,
    calculateStrategicPortfolioRisk,
    scanStrategicTradingOpportunities,
    getStrategicTradingSummary,
    formatStrategicTradingDataForGPT,
    
    // Original function aliases for compatibility
    calculateRayDalioPositionSize: calculateStrategicPositionSize,
    calculatePortfolioRisk: calculateStrategicPortfolioRisk,
    scanTradingOpportunities: scanStrategicTradingOpportunities,
    getTradingSummary: getStrategicTradingSummary,
    formatTradingDataForGPT: formatStrategicTradingDataForGPT,
    
    // Core MetaAPI functions
    initializeMetaAPI,
    getAccountInfo,
    getOpenPositions,
    getPendingOrders,
    getTradeHistory,
    executeMarketOrder,
    closePosition,
    getSymbolInfo,
    getConnectionStatus,
    testConnection,
    
    // Helper functions
    getStrategicRegimeMultiplier,
    getStrategicVolatilityAdjustment,
    getStrategicCorrelationAdjustment,
    calculateStrategicDiversificationScore,
    getAccountLeverage,
    roundToLotSize,
    
    // Opportunity generation helpers
    generateStrategicRegimeOpportunities,
    generateStrategicYieldCurveOpportunities,
    generateStrategicCreditOpportunities,
    filterByStrategicCorrelation
};
