// utils/database.js - RAY DALIO ENHANCED PostgreSQL Memory & Analytics System

const { Pool } = require('pg');

// Initialize PostgreSQL connection (Railway provides this for free)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10
});

// Suppress verbose connection logging
pool.on('error', (err) => {
    console.error('Database connection error:', err.message);
});

/**
 * 🏛️ INITIALIZE RAY DALIO ENHANCED DATABASE SCHEMA
 */
async function initializeDatabase() {
    try {
        await pool.query(`
            -- Original tables (preserved)
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                user_message TEXT NOT NULL,
                gpt_response TEXT NOT NULL,
                message_type VARCHAR(20) DEFAULT 'text',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                context_data JSONB
            );
            
            CREATE TABLE IF NOT EXISTS user_profiles (
                chat_id VARCHAR(50) PRIMARY KEY,
                conversation_count INTEGER DEFAULT 0,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                preferences JSONB DEFAULT '{}'
            );
            
            CREATE TABLE IF NOT EXISTS persistent_memories (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                fact TEXT NOT NULL,
                importance VARCHAR(10) DEFAULT 'medium',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS training_documents (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                document_type VARCHAR(50) DEFAULT 'general',
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                word_count INTEGER,
                summary TEXT
            );

            -- 🏛️ RAY DALIO ENHANCED TABLES
            
            -- Economic Regime Tracking
            CREATE TABLE IF NOT EXISTS regime_history (
                id SERIAL PRIMARY KEY,
                regime_name VARCHAR(100) NOT NULL,
                confidence DECIMAL(5,2) NOT NULL,
                growth_direction VARCHAR(20),
                inflation_direction VARCHAR(20),
                policy_stance VARCHAR(20),
                market_sentiment VARCHAR(20),
                regime_data JSONB NOT NULL,
                fed_rate DECIMAL(5,2),
                inflation_rate DECIMAL(5,2),
                yield_curve_2s10s DECIMAL(6,3),
                vix_level DECIMAL(6,2),
                credit_spread_high_yield DECIMAL(6,2),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_detected DATE DEFAULT CURRENT_DATE
            );

            -- Portfolio Allocation History
            CREATE TABLE IF NOT EXISTS portfolio_allocations (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                allocation_type VARCHAR(50), -- 'ACTUAL', 'RECOMMENDED', 'TARGET'
                regime_name VARCHAR(100),
                asset_class VARCHAR(50) NOT NULL, -- 'STOCKS', 'BONDS', 'COMMODITIES', 'CASH', 'CRYPTO'
                allocation_percent DECIMAL(5,2) NOT NULL,
                allocation_amount DECIMAL(15,2),
                reasoning TEXT,
                confidence_level INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Trading Performance by Regime
            CREATE TABLE IF NOT EXISTS regime_performance (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                regime_name VARCHAR(100) NOT NULL,
                trade_symbol VARCHAR(20),
                trade_type VARCHAR(10), -- 'LONG', 'SHORT'
                entry_price DECIMAL(10,5),
                exit_price DECIMAL(10,5),
                position_size DECIMAL(10,2),
                profit_loss DECIMAL(15,2),
                trade_duration_hours INTEGER,
                regime_confidence DECIMAL(5,2),
                risk_percent DECIMAL(5,2),
                trade_opened TIMESTAMP,
                trade_closed TIMESTAMP,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Risk Assessment Archives
            CREATE TABLE IF NOT EXISTS risk_assessments (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                assessment_type VARCHAR(50), -- 'DAILY', 'WEEKLY', 'MONTHLY', 'REGIME_CHANGE'
                total_risk_percent DECIMAL(5,2),
                correlation_risk VARCHAR(20),
                regime_risk VARCHAR(20),
                position_count INTEGER,
                diversification_score DECIMAL(5,2),
                account_balance DECIMAL(15,2),
                current_regime VARCHAR(100),
                regime_confidence DECIMAL(5,2),
                risk_data JSONB,
                recommendations TEXT[],
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Market Signals & Alerts
            CREATE TABLE IF NOT EXISTS market_signals (
                id SERIAL PRIMARY KEY,
                signal_type VARCHAR(50), -- 'REGIME_CHANGE', 'YIELD_CURVE_INVERSION', 'CREDIT_STRESS'
                signal_strength VARCHAR(20), -- 'WEAK', 'MODERATE', 'STRONG', 'CRITICAL'
                signal_description TEXT NOT NULL,
                market_data JSONB,
                triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP,
                impact_level VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
                actionable_insights TEXT[]
            );

            -- Position Sizing History
            CREATE TABLE IF NOT EXISTS position_sizing_history (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                symbol VARCHAR(20) NOT NULL,
                direction VARCHAR(10), -- 'LONG', 'SHORT'
                recommended_size DECIMAL(10,2),
                actual_size DECIMAL(10,2),
                risk_percent DECIMAL(5,2),
                regime_multiplier DECIMAL(4,2),
                volatility_multiplier DECIMAL(4,2),
                correlation_multiplier DECIMAL(4,2),
                entry_price DECIMAL(10,5),
                stop_loss DECIMAL(10,5),
                account_balance DECIMAL(15,2),
                current_regime VARCHAR(100),
                sizing_rationale TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Bridgewater-Style Daily Observations
            CREATE TABLE IF NOT EXISTS daily_observations (
                id SERIAL PRIMARY KEY,
                observation_date DATE DEFAULT CURRENT_DATE,
                market_regime VARCHAR(100),
                regime_confidence DECIMAL(5,2),
                key_themes TEXT[],
                market_moves JSONB,
                economic_data JSONB,
                outlook TEXT,
                risk_factors TEXT[],
                opportunities TEXT[],
                position_recommendations JSONB,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Command Usage Analytics
            CREATE TABLE IF NOT EXISTS command_analytics (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                command VARCHAR(50) NOT NULL,
                command_type VARCHAR(30), -- 'REGIME', 'TRADING', 'ANALYSIS', 'GENERAL'
                execution_time_ms INTEGER,
                success BOOLEAN DEFAULT true,
                error_message TEXT,
                regime_context VARCHAR(100),
                market_conditions JSONB,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 📊 CREATE INDEXES FOR PERFORMANCE
            CREATE INDEX IF NOT EXISTS idx_conversations_chat_id ON conversations(chat_id);
            CREATE INDEX IF NOT EXISTS idx_memories_chat_id ON persistent_memories(chat_id);
            CREATE INDEX IF NOT EXISTS idx_training_chat_id ON training_documents(chat_id);
            
            -- Ray Dalio indexes
            CREATE INDEX IF NOT EXISTS idx_regime_history_date ON regime_history(date_detected);
            CREATE INDEX IF NOT EXISTS idx_regime_history_name ON regime_history(regime_name);
            CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_chat_id ON portfolio_allocations(chat_id);
            CREATE INDEX IF NOT EXISTS idx_regime_performance_chat_id ON regime_performance(chat_id);
            CREATE INDEX IF NOT EXISTS idx_regime_performance_regime ON regime_performance(regime_name);
            CREATE INDEX IF NOT EXISTS idx_risk_assessments_chat_id ON risk_assessments(chat_id);
            CREATE INDEX IF NOT EXISTS idx_market_signals_type ON market_signals(signal_type);
            CREATE INDEX IF NOT EXISTS idx_position_sizing_chat_id ON position_sizing_history(chat_id);
            CREATE INDEX IF NOT EXISTS idx_daily_observations_date ON daily_observations(observation_date);
            CREATE INDEX IF NOT EXISTS idx_command_analytics_chat_id ON command_analytics(chat_id);
            CREATE INDEX IF NOT EXISTS idx_command_analytics_command ON command_analytics(command);
        `);
        
        console.log('✅ Ray Dalio enhanced database tables initialized');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

/**
 * 🏛️ SAVE ECONOMIC REGIME DATA
 */
async function saveRegimeData(regimeData) {
    try {
        if (!regimeData || !regimeData.currentRegime) {
            return false;
        }

        const regime = regimeData.currentRegime;
        const signals = regimeData.signals || {};

        await pool.query(`
            INSERT INTO regime_history (
                regime_name, confidence, growth_direction, inflation_direction,
                policy_stance, market_sentiment, regime_data, fed_rate,
                inflation_rate, yield_curve_2s10s, vix_level, credit_spread_high_yield
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
            regime.name,
            regimeData.confidence,
            regime.growth,
            regime.inflation,
            regime.policy,
            regime.market,
            JSON.stringify(regimeData),
            signals.policy?.realRate || null,
            signals.inflation?.indicators?.headline || null,
            signals.policy?.yieldCurve || null,
            signals.market?.vix || null,
            signals.market?.creditSpread || null
        ]);

        // Keep only last 1000 regime records
        await pool.query(`
            DELETE FROM regime_history 
            WHERE id NOT IN (
                SELECT id FROM regime_history 
                ORDER BY timestamp DESC 
                LIMIT 1000
            )
        `);

        console.log(`🏛️ Regime data saved: ${regime.name} (${regimeData.confidence}% confidence)`);
        return true;
    } catch (error) {
        console.error('Save regime data error:', error.message);
        return false;
    }
}

/**
 * 📊 SAVE PORTFOLIO ALLOCATION
 */
async function savePortfolioAllocation(chatId, allocationType, regimeName, allocations) {
    try {
        // Delete previous allocations of same type for this user
        await pool.query(`
            DELETE FROM portfolio_allocations 
            WHERE chat_id = $1 AND allocation_type = $2
        `, [chatId, allocationType]);

        // Insert new allocations
        for (const [assetClass, data] of Object.entries(allocations)) {
            await pool.query(`
                INSERT INTO portfolio_allocations (
                    chat_id, allocation_type, regime_name, asset_class,
                    allocation_percent, allocation_amount, reasoning, confidence_level
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                chatId,
                allocationType,
                regimeName,
                assetClass.toUpperCase(),
                data.percent || 0,
                data.amount || null,
                data.reasoning || null,
                data.confidence || 75
            ]);
        }

        console.log(`📊 Portfolio allocation saved for ${chatId}: ${allocationType}`);
        return true;
    } catch (error) {
        console.error('Save portfolio allocation error:', error.message);
        return false;
    }
}

/**
 * ⚠️ SAVE RISK ASSESSMENT
 */
async function saveRiskAssessment(chatId, assessmentData) {
    try {
        await pool.query(`
            INSERT INTO risk_assessments (
                chat_id, assessment_type, total_risk_percent, correlation_risk,
                regime_risk, position_count, diversification_score, account_balance,
                current_regime, regime_confidence, risk_data, recommendations
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
            chatId,
            assessmentData.type || 'DAILY',
            assessmentData.totalRiskPercent || 0,
            assessmentData.correlationRisk || 'MODERATE',
            assessmentData.regimeRisk || 'MODERATE',
            assessmentData.positionCount || 0,
            assessmentData.diversificationScore || 0,
            assessmentData.accountBalance || 0,
            assessmentData.currentRegime || 'UNKNOWN',
            assessmentData.regimeConfidence || 0,
            JSON.stringify(assessmentData.riskData || {}),
            assessmentData.recommendations || []
        ]);

        // Keep only last 100 risk assessments per user
        await pool.query(`
            DELETE FROM risk_assessments 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM risk_assessments 
                WHERE chat_id = $1 
                ORDER BY timestamp DESC 
                LIMIT 100
            )
        `, [chatId]);

        console.log(`⚠️ Risk assessment saved for ${chatId}`);
        return true;
    } catch (error) {
        console.error('Save risk assessment error:', error.message);
        return false;
    }
}

/**
 * 🎯 SAVE POSITION SIZING CALCULATION
 */
async function savePositionSizing(chatId, symbol, direction, sizingData) {
    try {
        await pool.query(`
            INSERT INTO position_sizing_history (
                chat_id, symbol, direction, recommended_size, risk_percent,
                regime_multiplier, volatility_multiplier, correlation_multiplier,
                entry_price, stop_loss, account_balance, current_regime, sizing_rationale
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
            chatId,
            symbol,
            direction,
            sizingData.recommendedSize || 0,
            sizingData.riskPercent || 0,
            sizingData.regimeMultiplier || 1.0,
            sizingData.volatilityMultiplier || 1.0,
            sizingData.correlationMultiplier || 1.0,
            sizingData.entryPrice || 0,
            sizingData.stopLoss || 0,
            sizingData.accountBalance || 0,
            sizingData.currentRegime || 'UNKNOWN',
            sizingData.rationale || ''
        ]);

        // Keep only last 200 position sizing records per user
        await pool.query(`
            DELETE FROM position_sizing_history 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM position_sizing_history 
                WHERE chat_id = $1 
                ORDER BY timestamp DESC 
                LIMIT 200
            )
        `, [chatId]);

        console.log(`🎯 Position sizing saved: ${symbol} ${direction} ${sizingData.recommendedSize} lots`);
        return true;
    } catch (error) {
        console.error('Save position sizing error:', error.message);
        return false;
    }
}

/**
 * 🚨 SAVE MARKET SIGNAL
 */
async function saveMarketSignal(signalType, strength, description, marketData = {}, insights = []) {
    try {
        await pool.query(`
            INSERT INTO market_signals (
                signal_type, signal_strength, signal_description,
                market_data, impact_level, actionable_insights
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            signalType,
            strength,
            description,
            JSON.stringify(marketData),
            strength === 'CRITICAL' ? 'CRITICAL' : strength === 'STRONG' ? 'HIGH' : 'MEDIUM',
            insights
        ]);

        console.log(`🚨 Market signal saved: ${signalType} (${strength})`);
        return true;
    } catch (error) {
        console.error('Save market signal error:', error.message);
        return false;
    }
}

/**
 * 📝 SAVE DAILY OBSERVATION (Bridgewater Style)
 */
async function saveDailyObservation(observationData) {
    try {
        // Check if observation already exists for today
        const existing = await pool.query(`
            SELECT id FROM daily_observations WHERE observation_date = CURRENT_DATE
        `);

        if (existing.rows.length > 0) {
            // Update existing observation
            await pool.query(`
                UPDATE daily_observations SET
                    market_regime = $1, regime_confidence = $2, key_themes = $3,
                    market_moves = $4, economic_data = $5, outlook = $6,
                    risk_factors = $7, opportunities = $8, position_recommendations = $9
                WHERE observation_date = CURRENT_DATE
            `, [
                observationData.regime,
                observationData.confidence,
                observationData.themes || [],
                JSON.stringify(observationData.marketMoves || {}),
                JSON.stringify(observationData.economicData || {}),
                observationData.outlook || '',
                observationData.riskFactors || [],
                observationData.opportunities || [],
                JSON.stringify(observationData.recommendations || {})
            ]);
        } else {
            // Insert new observation
            await pool.query(`
                INSERT INTO daily_observations (
                    market_regime, regime_confidence, key_themes, market_moves,
                    economic_data, outlook, risk_factors, opportunities, position_recommendations
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                observationData.regime,
                observationData.confidence,
                observationData.themes || [],
                JSON.stringify(observationData.marketMoves || {}),
                JSON.stringify(observationData.economicData || {}),
                observationData.outlook || '',
                observationData.riskFactors || [],
                observationData.opportunities || [],
                JSON.stringify(observationData.recommendations || {})
            ]);
        }

        // Keep only last 90 days of observations
        await pool.query(`
            DELETE FROM daily_observations 
            WHERE observation_date < CURRENT_DATE - INTERVAL '90 days'
        `);

        console.log(`📝 Daily observation saved for ${new Date().toLocaleDateString()}`);
        return true;
    } catch (error) {
        console.error('Save daily observation error:', error.message);
        return false;
    }
}

/**
 * 📈 LOG COMMAND USAGE ANALYTICS
 */
async function logCommandUsage(chatId, command, commandType, executionTime, success = true, errorMessage = null, regimeContext = null, marketConditions = {}) {
    try {
        await pool.query(`
            INSERT INTO command_analytics (
                chat_id, command, command_type, execution_time_ms,
                success, error_message, regime_context, market_conditions
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            chatId,
            command,
            commandType,
            executionTime,
            success,
            errorMessage,
            regimeContext,
            JSON.stringify(marketConditions)
        ]);

        return true;
    } catch (error) {
        console.error('Log command usage error:', error.message);
        return false;
    }
}

/**
 * 📊 GET REGIME TRANSITION ANALYSIS
 */
async function getRegimeTransitions(days = 30) {
    try {
        const result = await pool.query(`
            SELECT 
                regime_name,
                confidence,
                date_detected,
                LAG(regime_name) OVER (ORDER BY date_detected) as previous_regime,
                LAG(confidence) OVER (ORDER BY date_detected) as previous_confidence
            FROM regime_history 
            WHERE date_detected >= CURRENT_DATE - INTERVAL '${days} days'
            ORDER BY date_detected DESC
        `);

        const transitions = result.rows.filter(row => 
            row.previous_regime && row.regime_name !== row.previous_regime
        );

        return {
            transitions: transitions,
            currentRegime: result.rows[0]?.regime_name || 'UNKNOWN',
            regimeStability: transitions.length === 0 ? 'STABLE' : transitions.length > 3 ? 'VOLATILE' : 'MODERATE'
        };
    } catch (error) {
        console.error('Get regime transitions error:', error.message);
        return { transitions: [], currentRegime: 'UNKNOWN', regimeStability: 'UNKNOWN' };
    }
}

/**
 * 💼 GET PORTFOLIO PERFORMANCE BY REGIME
 */
async function getPortfolioPerformanceByRegime(chatId, days = 90) {
    try {
        const result = await pool.query(`
            SELECT 
                regime_name,
                COUNT(*) as trade_count,
                SUM(profit_loss) as total_pnl,
                AVG(profit_loss) as avg_pnl,
                AVG(regime_confidence) as avg_confidence,
                COUNT(CASE WHEN profit_loss > 0 THEN 1 END) as winning_trades,
                AVG(risk_percent) as avg_risk_per_trade
            FROM regime_performance 
            WHERE chat_id = $1 
                AND trade_closed >= CURRENT_DATE - INTERVAL '${days} days'
            GROUP BY regime_name
            ORDER BY total_pnl DESC
        `, [chatId]);

        return result.rows.map(row => ({
            regime: row.regime_name,
            tradeCount: parseInt(row.trade_count),
            totalPnL: parseFloat(row.total_pnl),
            averagePnL: parseFloat(row.avg_pnl),
            winRate: (parseInt(row.winning_trades) / parseInt(row.trade_count) * 100).toFixed(1),
            averageConfidence: parseFloat(row.avg_confidence),
            averageRisk: parseFloat(row.avg_risk_per_trade)
        }));
    } catch (error) {
        console.error('Get portfolio performance error:', error.message);
        return [];
    }
}

/**
 * 🎯 GET POSITION SIZING ANALYTICS
 */
async function getPositionSizingAnalytics(chatId, days = 30) {
    try {
        const result = await pool.query(`
            SELECT 
                AVG(risk_percent) as avg_risk_percent,
                AVG(regime_multiplier) as avg_regime_multiplier,
                AVG(volatility_multiplier) as avg_volatility_multiplier,
                AVG(correlation_multiplier) as avg_correlation_multiplier,
                COUNT(*) as total_calculations,
                COUNT(DISTINCT symbol) as symbols_traded,
                COUNT(DISTINCT current_regime) as regimes_encountered
            FROM position_sizing_history 
            WHERE chat_id = $1 
                AND timestamp >= CURRENT_DATE - INTERVAL '${days} days'
        `, [chatId]);

        const row = result.rows[0];
        if (!row || !row.total_calculations) {
            return {
                averageRisk: 0,
                averageRegimeMultiplier: 1.0,
                averageVolatilityMultiplier: 1.0,
                averageCorrelationMultiplier: 1.0,
                totalCalculations: 0,
                symbolsTraded: 0,
                regimesEncountered: 0
            };
        }

        return {
            averageRisk: parseFloat(row.avg_risk_percent).toFixed(2),
            averageRegimeMultiplier: parseFloat(row.avg_regime_multiplier).toFixed(2),
            averageVolatilityMultiplier: parseFloat(row.avg_volatility_multiplier).toFixed(2),
            averageCorrelationMultiplier: parseFloat(row.avg_correlation_multiplier).toFixed(2),
            totalCalculations: parseInt(row.total_calculations),
            symbolsTraded: parseInt(row.symbols_traded),
            regimesEncountered: parseInt(row.regimes_encountered)
        };
    } catch (error) {
        console.error('Get position sizing analytics error:', error.message);
        return {};
    }
}

/**
 * 📈 GET COMMAND USAGE STATISTICS
 */
async function getCommandUsageStats(chatId, days = 30) {
    try {
        const result = await pool.query(`
            SELECT 
                command,
                command_type,
                COUNT(*) as usage_count,
                AVG(execution_time_ms) as avg_execution_time,
                COUNT(CASE WHEN success THEN 1 END) as successful_executions,
                COUNT(CASE WHEN NOT success THEN 1 END) as failed_executions
            FROM command_analytics 
            WHERE chat_id = $1 
                AND timestamp >= CURRENT_DATE - INTERVAL '${days} days'
            GROUP BY command, command_type
            ORDER BY usage_count DESC
        `, [chatId]);

        return result.rows.map(row => ({
            command: row.command,
            type: row.command_type,
            usageCount: parseInt(row.usage_count),
            averageExecutionTime: Math.round(parseFloat(row.avg_execution_time)),
            successRate: (parseInt(row.successful_executions) / parseInt(row.usage_count) * 100).toFixed(1),
            failureCount: parseInt(row.failed_executions)
        }));
    } catch (error) {
        console.error('Get command usage stats error:', error.message);
        return [];
    }
}

/**
 * 🏛️ GET RAY DALIO ENHANCED DATABASE STATISTICS
 */
async function getRayDalioStats() {
    try {
        const [users, conversations, memories, documents, regimes, allocations, risks, signals] = await Promise.all([
            pool.query('SELECT COUNT(DISTINCT chat_id) as count FROM user_profiles'),
            pool.query('SELECT COUNT(*) as count FROM conversations'),
            pool.query('SELECT COUNT(*) as count FROM persistent_memories'),
            pool.query('SELECT COUNT(*) as count FROM training_documents'),
            pool.query('SELECT COUNT(*) as count FROM regime_history'),
            pool.query('SELECT COUNT(*) as count FROM portfolio_allocations'),
            pool.query('SELECT COUNT(*) as count FROM risk_assessments'),
            pool.query('SELECT COUNT(*) as count FROM market_signals')
        ]);

        // Get current regime
        const currentRegimeResult = await pool.query(`
            SELECT regime_name, confidence, timestamp 
            FROM regime_history 
            ORDER BY timestamp DESC 
            LIMIT 1
        `);

        // Get recent signals
        const recentSignalsResult = await pool.query(`
            SELECT signal_type, signal_strength, triggered_at 
            FROM market_signals 
            WHERE triggered_at >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY triggered_at DESC
            LIMIT 5
        `);

        return {
            totalUsers: users.rows[0].count,
            totalConversations: conversations.rows[0].count,
            totalMemories: memories.rows[0].count,
            totalDocuments: documents.rows[0].count,
            totalRegimeRecords: regimes.rows[0].count,
            totalAllocations: allocations.rows[0].count,
            totalRiskAssessments: risks.rows[0].count,
            totalMarketSignals: signals.rows[0].count,
            currentRegime: currentRegimeResult.rows[0] || null,
            recentSignals: recentSignalsResult.rows,
            storage: 'PostgreSQL Database (Ray Dalio Enhanced)',
            institutionalGrade: true
        };
    } catch (error) {
        console.error('Get Ray Dalio stats error:', error.message);
        return {
            totalUsers: '0',
            totalConversations: '0',
            totalMemories: '0',
            totalDocuments: '0',
            totalRegimeRecords: '0',
            totalAllocations: '0',
            totalRiskAssessments: '0',
            totalMarketSignals: '0',
            storage: 'Database Error',
            institutionalGrade: false
        };
    }
}

// 🔄 PRESERVE ALL EXISTING FUNCTIONS

async function saveConversationDB(chatId, userMessage, gptResponse, messageType = 'text', contextData = null) {
    try {
        await pool.query(
            'INSERT INTO conversations (chat_id, user_message, gpt_response, message_type, context_data) VALUES ($1, $2, $3, $4, $5)',
            [chatId, userMessage, gptResponse, messageType, contextData]
        );
        
        await pool.query(`
            INSERT INTO user_profiles (chat_id, conversation_count, last_seen) 
            VALUES ($1, 1, CURRENT_TIMESTAMP)
            ON CONFLICT (chat_id) 
            DO UPDATE SET 
                conversation_count = user_profiles.conversation_count + 1,
                last_seen = CURRENT_TIMESTAMP
        `, [chatId]);
        
        await pool.query(`
            DELETE FROM conversations 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM conversations 
                WHERE chat_id = $1 
                ORDER BY timestamp DESC 
                LIMIT 100
            )
        `, [chatId]);
        
        return true;
    } catch (error) {
        console.error('Save conversation error:', error);
        return false;
    }
}

async function getConversationHistoryDB(chatId, limit = 10) {
    try {
        const result = await pool.query(
            'SELECT user_message, gpt_response, message_type, timestamp FROM conversations WHERE chat_id = $1 ORDER BY timestamp DESC LIMIT $2',
            [chatId, limit]
        );
        
        return result.rows.reverse();
    } catch (error) {
        console.error('Get history error:', error);
        return [];
    }
}

async function addPersistentMemoryDB(chatId, fact, importance = 'medium') {
    try {
        await pool.query(
            'INSERT INTO persistent_memories (chat_id, fact, importance) VALUES ($1, $2, $3)',
            [chatId, fact, importance]
        );
        
        await pool.query(`
            DELETE FROM persistent_memories 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM persistent_memories 
                WHERE chat_id = $1 
                ORDER BY 
                    CASE importance 
                        WHEN 'high' THEN 3 
                        WHEN 'medium' THEN 2 
                        WHEN 'low' THEN 1 
                    END DESC, 
                    timestamp DESC 
                LIMIT 50
            )
        `, [chatId]);
        
        console.log(`💾 Persistent memory saved to database for ${chatId}: ${fact}`);
        return true;
    } catch (error) {
        console.error('Add persistent memory error:', error);
        return false;
    }
}

async function getPersistentMemoryDB(chatId) {
    try {
        const result = await pool.query(
            'SELECT fact, importance, timestamp FROM persistent_memories WHERE chat_id = $1 ORDER BY timestamp DESC',
            [chatId]
        );
        
        return result.rows;
    } catch (error) {
        console.error('Get persistent memory error:', error);
        return [];
    }
}

async function getUserProfileDB(chatId) {
    try {
        const result = await pool.query(
            'SELECT * FROM user_profiles WHERE chat_id = $1',
            [chatId]
        );
        
        return result.rows[0] || null;
    } catch (error) {
        console.error('Get user profile error:', error);
        return null;
    }
}

async function updateUserPreferencesDB(chatId, preferences) {
    try {
        await pool.query(
            'UPDATE user_profiles SET preferences = $2 WHERE chat_id = $1',
            [chatId, JSON.stringify(preferences)]
        );
        return true;
    } catch (error) {
        console.error('Update preferences error:', error);
        return false;
    }
}

async function saveTrainingDocumentDB(chatId, fileName, content, documentType, wordCount, summary) {
    try {
        await pool.query(
            'INSERT INTO training_documents (chat_id, file_name, content, document_type, word_count, summary) VALUES ($1, $2, $3, $4, $5, $6)',
            [chatId, fileName, content, documentType, wordCount, summary]
        );
        
        await pool.query(`
            DELETE FROM training_documents 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM training_documents 
                WHERE chat_id = $1 
                ORDER BY upload_date DESC 
                LIMIT 20
            )
        `, [chatId]);
        
        return true;
    } catch (error) {
        console.error('Save training document error:', error);
        return false;
    }
}

async function getTrainingDocumentsDB(chatId) {
    try {
        const result = await pool.query(
            'SELECT file_name, content, document_type, upload_date, word_count, summary FROM training_documents WHERE chat_id = $1 ORDER BY upload_date DESC',
            [chatId]
        );
        
        return result.rows;
    } catch (error) {
        console.error('Get training documents error:', error);
        return [];
    }
}

async function getDatabaseStats() {
    try {
        return await getRayDalioStats();
    } catch (error) {
        console.error('Get database stats error:', error);
        return {
            totalUsers: 0,
            totalConversations: 0,
            totalMemories: 0,
            totalDocuments: 0,
            storage: 'Database Error'
        };
    }
}

async function clearUserDataDB(chatId) {
    try {
        await Promise.all([
            pool.query('DELETE FROM conversations WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM persistent_memories WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM training_documents WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM user_profiles WHERE chat_id = $1', [chatId]),
            // Ray Dalio tables
            pool.query('DELETE FROM portfolio_allocations WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM regime_performance WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM risk_assessments WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM position_sizing_history WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM command_analytics WHERE chat_id = $1', [chatId])
        ]);
        
        console.log(`🗑️ All data cleared for user ${chatId} (including Ray Dalio data)`);
        return true;
    } catch (error) {
        console.error('Clear user data error:', error);
        return false;
    }
}

/**
 * 🎯 RAY DALIO HELPER FUNCTIONS
 */

// Get latest regime for context
async function getCurrentRegime() {
    try {
        const result = await pool.query(`
            SELECT regime_name, confidence, growth_direction, inflation_direction, timestamp
            FROM regime_history 
            ORDER BY timestamp DESC 
            LIMIT 1
        `);
        
        return result.rows[0] || null;
    } catch (error) {
        console.error('Get current regime error:', error.message);
        return null;
    }
}

// Get user's latest risk assessment
async function getLatestRiskAssessment(chatId) {
    try {
        const result = await pool.query(`
            SELECT * FROM risk_assessments 
            WHERE chat_id = $1 
            ORDER BY timestamp DESC 
            LIMIT 1
        `, [chatId]);
        
        return result.rows[0] || null;
    } catch (error) {
        console.error('Get latest risk assessment error:', error.message);
        return null;
    }
}

// Get active market signals
async function getActiveMarketSignals() {
    try {
        const result = await pool.query(`
            SELECT * FROM market_signals 
            WHERE resolved_at IS NULL 
                AND triggered_at >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY 
                CASE signal_strength 
                    WHEN 'CRITICAL' THEN 4
                    WHEN 'STRONG' THEN 3
                    WHEN 'MODERATE' THEN 2
                    WHEN 'WEAK' THEN 1
                END DESC,
                triggered_at DESC
            LIMIT 10
        `);
        
        return result.rows;
    } catch (error) {
        console.error('Get active market signals error:', error.message);
        return [];
    }
}

// Get recent daily observations
async function getRecentDailyObservations(days = 7) {
    try {
        const result = await pool.query(`
            SELECT * FROM daily_observations 
            WHERE observation_date >= CURRENT_DATE - INTERVAL '${days} days'
            ORDER BY observation_date DESC
        `);
        
        return result.rows;
    } catch (error) {
        console.error('Get recent daily observations error:', error.message);
        return [];
    }
}

// Clean up old data (maintenance function)
async function cleanupOldData() {
    try {
        const results = await Promise.all([
            // Keep only last 6 months of regime history
            pool.query('DELETE FROM regime_history WHERE timestamp < NOW() - INTERVAL \'6 months\''),
            
            // Keep only last 3 months of portfolio allocations
            pool.query('DELETE FROM portfolio_allocations WHERE timestamp < NOW() - INTERVAL \'3 months\''),
            
            // Keep only last 6 months of regime performance
            pool.query('DELETE FROM regime_performance WHERE timestamp < NOW() - INTERVAL \'6 months\''),
            
            // Keep only last 3 months of risk assessments per user (top 100)
            pool.query(`
                DELETE FROM risk_assessments 
                WHERE id NOT IN (
                    SELECT DISTINCT ON (chat_id) unnest(
                        array_agg(id ORDER BY timestamp DESC) OVER (PARTITION BY chat_id)
                    )[1:100]
                    FROM risk_assessments
                )
            `),
            
            // Keep only last 1 month of position sizing history per user
            pool.query(`
                DELETE FROM position_sizing_history 
                WHERE timestamp < NOW() - INTERVAL '1 month'
            `),
            
            // Resolve old market signals
            pool.query(`
                UPDATE market_signals 
                SET resolved_at = NOW() 
                WHERE triggered_at < NOW() - INTERVAL '30 days' 
                    AND resolved_at IS NULL
            `),
            
            // Keep only last 90 days of daily observations
            pool.query('DELETE FROM daily_observations WHERE observation_date < CURRENT_DATE - INTERVAL \'90 days\''),
            
            // Keep only last 30 days of command analytics
            pool.query('DELETE FROM command_analytics WHERE timestamp < NOW() - INTERVAL \'30 days\'')
        ]);
        
        const totalCleaned = results.reduce((sum, result) => sum + (result.rowCount || 0), 0);
        console.log(`🧹 Database cleanup completed: ${totalCleaned} old records removed`);
        return true;
    } catch (error) {
        console.error('Database cleanup error:', error.message);
        return false;
    }
}

/**
 * 🔍 ADVANCED ANALYTICS FUNCTIONS
 */

// Get regime performance summary
async function getRegimePerformanceSummary(chatId) {
    try {
        const result = await pool.query(`
            SELECT 
                regime_name,
                COUNT(*) as total_trades,
                SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as winning_trades,
                AVG(profit_loss) as avg_pnl,
                SUM(profit_loss) as total_pnl,
                AVG(regime_confidence) as avg_confidence
            FROM regime_performance 
            WHERE chat_id = $1
            GROUP BY regime_name
            ORDER BY total_pnl DESC
        `, [chatId]);
        
        return result.rows.map(row => ({
            regime: row.regime_name,
            totalTrades: parseInt(row.total_trades),
            winRate: ((parseInt(row.winning_trades) / parseInt(row.total_trades)) * 100).toFixed(1),
            averagePnL: parseFloat(row.avg_pnl).toFixed(2),
            totalPnL: parseFloat(row.total_pnl).toFixed(2),
            averageConfidence: parseFloat(row.avg_confidence).toFixed(1)
        }));
    } catch (error) {
        console.error('Get regime performance summary error:', error.message);
        return [];
    }
}

// Get risk trend analysis
async function getRiskTrendAnalysis(chatId, days = 30) {
    try {
        const result = await pool.query(`
            SELECT 
                DATE(timestamp) as assessment_date,
                AVG(total_risk_percent) as avg_risk,
                AVG(diversification_score) as avg_diversification,
                COUNT(*) as assessment_count
            FROM risk_assessments 
            WHERE chat_id = $1 
                AND timestamp >= CURRENT_DATE - INTERVAL '${days} days'
            GROUP BY DATE(timestamp)
            ORDER BY assessment_date DESC
        `, [chatId]);
        
        return result.rows.map(row => ({
            date: row.assessment_date,
            averageRisk: parseFloat(row.avg_risk).toFixed(2),
            averageDiversification: parseFloat(row.avg_diversification).toFixed(1),
            assessmentCount: parseInt(row.assessment_count)
        }));
    } catch (error) {
        console.error('Get risk trend analysis error:', error.message);
        return [];
    }
}

module.exports = {
    // 🏛️ RAY DALIO ENHANCED FUNCTIONS
    initializeDatabase,
    saveRegimeData,
    savePortfolioAllocation,
    saveRiskAssessment,
    savePositionSizing,
    saveMarketSignal,
    saveDailyObservation,
    logCommandUsage,
    
    // Analytics Functions
    getRegimeTransitions,
    getPortfolioPerformanceByRegime,
    getPositionSizingAnalytics,
    getCommandUsageStats,
    getRayDalioStats,
    
    // Helper Functions
    getCurrentRegime,
    getLatestRiskAssessment,
    getActiveMarketSignals,
    getRecentDailyObservations,
    cleanupOldData,
    getRegimePerformanceSummary,
    getRiskTrendAnalysis,
    
    // Original Functions (preserved)
    saveConversationDB,
    getConversationHistoryDB,
    addPersistentMemoryDB,
    getPersistentMemoryDB,
    getUserProfileDB,
    updateUserPreferencesDB,
    saveTrainingDocumentDB,
    getTrainingDocumentsDB,
    getDatabaseStats,
    clearUserDataDB
};
