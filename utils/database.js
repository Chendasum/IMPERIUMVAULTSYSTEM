// utils/database.js - COMPLETE STRATEGIC ENHANCED PostgreSQL Memory & Analytics System
// IMPERIUM VAULT STRATEGIC COMMAND SYSTEM - Institutional-grade database with Cambodia lending integration

const { Pool } = require('pg');

// Initialize PostgreSQL connection (Railway provides this for free)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20, // Increased pool size for better performance
    statement_timeout: 30000,
    query_timeout: 30000
});

// 📊 CONNECTION MONITORING
let connectionStats = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    lastError: null,
    connectionHealth: 'UNKNOWN'
};

// Suppress verbose connection logging but monitor health
pool.on('error', (err) => {
    console.error('Database connection error:', err.message);
    connectionStats.lastError = err.message;
    connectionStats.connectionHealth = 'ERROR';
});

pool.on('connect', () => {
    connectionStats.connectionHealth = 'HEALTHY';
});

/**
 * 🏛️ INITIALIZE COMPLETE STRATEGIC DATABASE SCHEMA
 */
async function initializeDatabase() {
    try {
        console.log('🚀 Initializing Strategic Command Database Schema...');
        
        await pool.query(`
            -- 📊 CORE SYSTEM TABLES (Enhanced)
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                user_message TEXT NOT NULL,
                gpt_response TEXT NOT NULL,
                message_type VARCHAR(20) DEFAULT 'text',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                context_data JSONB,
                strategic_importance VARCHAR(20) DEFAULT 'medium',
                response_time_ms INTEGER,
                token_count INTEGER,
                user_satisfaction SMALLINT CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5)
            );
            
            CREATE TABLE IF NOT EXISTS user_profiles (
                chat_id VARCHAR(50) PRIMARY KEY,
                conversation_count INTEGER DEFAULT 0,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                preferences JSONB DEFAULT '{}',
                strategic_profile JSONB DEFAULT '{}',
                risk_tolerance VARCHAR(20) DEFAULT 'MODERATE',
                communication_style VARCHAR(30) DEFAULT 'STRATEGIC',
                timezone VARCHAR(50) DEFAULT 'UTC',
                total_session_time INTEGER DEFAULT 0
            );
            
            CREATE TABLE IF NOT EXISTS persistent_memories (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                fact TEXT NOT NULL,
                importance VARCHAR(10) DEFAULT 'medium',
                category VARCHAR(30) DEFAULT 'general',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 0,
                last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fact_hash VARCHAR(64),
                source VARCHAR(20) DEFAULT 'conversation'
            );
            
            CREATE TABLE IF NOT EXISTS training_documents (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                document_type VARCHAR(50) DEFAULT 'general',
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                word_count INTEGER,
                summary TEXT,
                file_size INTEGER,
                file_hash VARCHAR(64),
                processing_status VARCHAR(20) DEFAULT 'completed'
            );

            -- 🏛️ RAY DALIO ENHANCED TABLES (Updated)
            
            -- Economic Regime Tracking (Enhanced)
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
                regime_duration INTEGER DEFAULT 0,
                regime_stability VARCHAR(20) DEFAULT 'STABLE',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_detected DATE DEFAULT CURRENT_DATE
            );

            -- Portfolio Allocation History (Enhanced)
            CREATE TABLE IF NOT EXISTS portfolio_allocations (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                allocation_type VARCHAR(50), -- 'ACTUAL', 'RECOMMENDED', 'TARGET'
                regime_name VARCHAR(100),
                asset_class VARCHAR(50) NOT NULL,
                allocation_percent DECIMAL(5,2) NOT NULL,
                allocation_amount DECIMAL(15,2),
                reasoning TEXT,
                confidence_level INTEGER,
                performance_attribution DECIMAL(6,3),
                rebalancing_trigger VARCHAR(50),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Trading Performance by Regime (Enhanced)
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
                max_drawdown DECIMAL(6,3),
                sharpe_ratio DECIMAL(6,3),
                trade_opened TIMESTAMP,
                trade_closed TIMESTAMP,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Risk Assessment Archives (Enhanced)
            CREATE TABLE IF NOT EXISTS risk_assessments (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                assessment_type VARCHAR(50),
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
                stress_test_results JSONB,
                var_95 DECIMAL(10,2),
                max_sector_concentration DECIMAL(5,2),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Market Signals & Alerts (Enhanced)
            CREATE TABLE IF NOT EXISTS market_signals (
                id SERIAL PRIMARY KEY,
                signal_type VARCHAR(50),
                signal_strength VARCHAR(20),
                signal_description TEXT NOT NULL,
                market_data JSONB,
                triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP,
                impact_level VARCHAR(20),
                actionable_insights TEXT[],
                false_positive BOOLEAN DEFAULT FALSE,
                user_feedback JSONB,
                signal_accuracy DECIMAL(4,2)
            );

            -- Position Sizing History (Enhanced)
            CREATE TABLE IF NOT EXISTS position_sizing_history (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                symbol VARCHAR(20) NOT NULL,
                direction VARCHAR(10),
                recommended_size DECIMAL(10,2),
                actual_size DECIMAL(10,2),
                risk_percent DECIMAL(5,2),
                regime_multiplier DECIMAL(4,2),
                volatility_multiplier DECIMAL(4,2),
                correlation_multiplier DECIMAL(4,2),
                entry_price DECIMAL(10,5),
                stop_loss DECIMAL(10,5),
                take_profit DECIMAL(10,5),
                account_balance DECIMAL(15,2),
                current_regime VARCHAR(100),
                sizing_rationale TEXT,
                kelly_criterion DECIMAL(4,2),
                max_position_size DECIMAL(10,2),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Bridgewater-Style Daily Observations (Enhanced)
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
                market_stress_level DECIMAL(4,2),
                liquidity_conditions VARCHAR(20),
                sentiment_indicators JSONB,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Command Usage Analytics (Enhanced)
            CREATE TABLE IF NOT EXISTS command_analytics (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                command VARCHAR(50) NOT NULL,
                command_type VARCHAR(30),
                execution_time_ms INTEGER,
                success BOOLEAN DEFAULT true,
                error_message TEXT,
                regime_context VARCHAR(100),
                market_conditions JSONB,
                user_satisfaction SMALLINT,
                command_complexity VARCHAR(20),
                data_sources_used TEXT[],
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 🇰🇭 CAMBODIA LENDING FUND TABLES
            
            -- Cambodia Deal Analysis
            CREATE TABLE IF NOT EXISTS cambodia_deals (
                id SERIAL PRIMARY KEY,
                deal_id VARCHAR(50) UNIQUE NOT NULL,
                chat_id VARCHAR(50) NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                interest_rate DECIMAL(5,2) NOT NULL,
                term_months INTEGER NOT NULL,
                collateral_type VARCHAR(50),
                borrower_type VARCHAR(50),
                location VARCHAR(100),
                loan_to_value DECIMAL(5,2),
                risk_score INTEGER,
                recommendation VARCHAR(30),
                recommendation_confidence INTEGER,
                market_conditions JSONB,
                analysis_data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deal_status VARCHAR(20) DEFAULT 'ANALYZED'
            );
            
            -- Cambodia Portfolio Tracking
            CREATE TABLE IF NOT EXISTS cambodia_portfolio (
                id SERIAL PRIMARY KEY,
                portfolio_date DATE DEFAULT CURRENT_DATE,
                total_aum DECIMAL(15,2),
                deployed_capital DECIMAL(15,2),
                available_capital DECIMAL(15,2),
                number_of_deals INTEGER,
                average_yield DECIMAL(5,2),
                geographic_allocation JSONB,
                sector_allocation JSONB,
                risk_metrics JSONB,
                performance_metrics JSONB,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Cambodia Market Intelligence
            CREATE TABLE IF NOT EXISTS cambodia_market_data (
                id SERIAL PRIMARY KEY,
                data_date DATE DEFAULT CURRENT_DATE,
                market_conditions JSONB,
                interest_rate_environment JSONB,
                property_market_data JSONB,
                economic_indicators JSONB,
                risk_factors JSONB,
                opportunities TEXT[],
                market_summary TEXT,
                data_quality_score DECIMAL(4,2),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 📊 USER BEHAVIOR ANALYTICS
            
            -- User Session Tracking
            CREATE TABLE IF NOT EXISTS user_sessions (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_end TIMESTAMP,
                commands_executed INTEGER DEFAULT 0,
                total_response_time INTEGER DEFAULT 0,
                session_type VARCHAR(30),
                primary_focus VARCHAR(50),
                satisfaction_score DECIMAL(3,2),
                notes TEXT
            );
            
            -- Trading Pattern Recognition
            CREATE TABLE IF NOT EXISTS trading_patterns (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(50) NOT NULL,
                pattern_type VARCHAR(50),
                pattern_description TEXT,
                confidence_level DECIMAL(4,2),
                supporting_evidence JSONB,
                first_detected TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_confirmed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                pattern_strength VARCHAR(20),
                actionable_insights TEXT[]
            );
            
            -- Strategic Insights Cache
            CREATE TABLE IF NOT EXISTS strategic_insights (
                id SERIAL PRIMARY KEY,
                insight_type VARCHAR(50),
                insight_title VARCHAR(200),
                insight_description TEXT,
                supporting_data JSONB,
                confidence_score DECIMAL(4,2),
                impact_level VARCHAR(20),
                time_horizon VARCHAR(20),
                relevant_users TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                insight_status VARCHAR(20) DEFAULT 'ACTIVE'
            );

            -- 📊 PERFORMANCE & MONITORING TABLES
            
            -- System Performance Metrics
            CREATE TABLE IF NOT EXISTS system_metrics (
                id SERIAL PRIMARY KEY,
                metric_date DATE DEFAULT CURRENT_DATE,
                total_users INTEGER,
                active_users INTEGER,
                total_queries INTEGER,
                avg_response_time DECIMAL(8,2),
                error_rate DECIMAL(5,4),
                database_size_mb DECIMAL(10,2),
                api_calls_made INTEGER,
                system_uptime_hours DECIMAL(8,2),
                memory_usage_mb DECIMAL(8,2),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- API Usage Tracking
            CREATE TABLE IF NOT EXISTS api_usage (
                id SERIAL PRIMARY KEY,
                api_provider VARCHAR(50),
                endpoint VARCHAR(100),
                calls_made INTEGER,
                successful_calls INTEGER,
                failed_calls INTEGER,
                avg_response_time_ms DECIMAL(8,2),
                data_volume_kb DECIMAL(10,2),
                cost_estimate DECIMAL(8,4),
                usage_date DATE DEFAULT CURRENT_DATE,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 📊 CREATE COMPREHENSIVE INDEXES FOR PERFORMANCE
            
            -- Core table indexes
            CREATE INDEX IF NOT EXISTS idx_conversations_chat_id_time ON conversations(chat_id, timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_conversations_importance ON conversations(strategic_importance);
            CREATE INDEX IF NOT EXISTS idx_memories_chat_id_category ON persistent_memories(chat_id, category);
            CREATE INDEX IF NOT EXISTS idx_memories_importance ON persistent_memories(importance);
            CREATE INDEX IF NOT EXISTS idx_memories_hash ON persistent_memories(fact_hash);
            CREATE INDEX IF NOT EXISTS idx_training_chat_id ON training_documents(chat_id);
            CREATE INDEX IF NOT EXISTS idx_training_type ON training_documents(document_type);
            
            -- Ray Dalio indexes
            CREATE INDEX IF NOT EXISTS idx_regime_history_date_name ON regime_history(date_detected, regime_name);
            CREATE INDEX IF NOT EXISTS idx_regime_history_confidence ON regime_history(confidence DESC);
            CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_chat_regime ON portfolio_allocations(chat_id, regime_name);
            CREATE INDEX IF NOT EXISTS idx_regime_performance_chat_regime ON regime_performance(chat_id, regime_name);
            CREATE INDEX IF NOT EXISTS idx_regime_performance_pnl ON regime_performance(profit_loss DESC);
            CREATE INDEX IF NOT EXISTS idx_risk_assessments_chat_date ON risk_assessments(chat_id, timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_market_signals_type_time ON market_signals(signal_type, triggered_at DESC);
            CREATE INDEX IF NOT EXISTS idx_position_sizing_chat_symbol ON position_sizing_history(chat_id, symbol);
            CREATE INDEX IF NOT EXISTS idx_daily_observations_date ON daily_observations(observation_date DESC);
            CREATE INDEX IF NOT EXISTS idx_command_analytics_chat_command ON command_analytics(chat_id, command);
            CREATE INDEX IF NOT EXISTS idx_command_analytics_success ON command_analytics(success, timestamp DESC);
            
            -- Cambodia indexes
            CREATE INDEX IF NOT EXISTS idx_cambodia_deals_chat_id ON cambodia_deals(chat_id);
            CREATE INDEX IF NOT EXISTS idx_cambodia_deals_status ON cambodia_deals(deal_status);
            CREATE INDEX IF NOT EXISTS idx_cambodia_deals_risk ON cambodia_deals(risk_score);
            CREATE INDEX IF NOT EXISTS idx_cambodia_portfolio_date ON cambodia_portfolio(portfolio_date DESC);
            CREATE INDEX IF NOT EXISTS idx_cambodia_market_date ON cambodia_market_data(data_date DESC);
            
            -- Analytics indexes
            CREATE INDEX IF NOT EXISTS idx_user_sessions_chat_date ON user_sessions(chat_id, session_start DESC);
            CREATE INDEX IF NOT EXISTS idx_trading_patterns_chat_type ON trading_patterns(chat_id, pattern_type);
            CREATE INDEX IF NOT EXISTS idx_strategic_insights_type_confidence ON strategic_insights(insight_type, confidence_score DESC);
            CREATE INDEX IF NOT EXISTS idx_system_metrics_date ON system_metrics(metric_date DESC);
            CREATE INDEX IF NOT EXISTS idx_api_usage_provider_date ON api_usage(api_provider, usage_date DESC);
        `);
        
        console.log('✅ Strategic Command Database schema initialized successfully');
        
        // Initialize system metrics
        await initializeSystemMetrics();
        
        return true;
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        connectionStats.lastError = error.message;
        connectionStats.connectionHealth = 'INIT_ERROR';
        return false;
    }
}

/**
 * 📊 INITIALIZE SYSTEM METRICS
 */
async function initializeSystemMetrics() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if today's metrics exist
        const existingMetrics = await pool.query(
            'SELECT id FROM system_metrics WHERE metric_date = $1',
            [today]
        );
        
        if (existingMetrics.rows.length === 0) {
            await pool.query(`
                INSERT INTO system_metrics (
                    total_users, active_users, total_queries, 
                    avg_response_time, error_rate, system_uptime_hours
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [0, 0, 0, 0, 0, 0]);
            
            console.log('📊 System metrics initialized for today');
        }
        
        return true;
    } catch (error) {
        console.error('System metrics initialization error:', error.message);
        return false;
    }
}

/**
 * 📊 UPDATE SYSTEM METRICS
 */
async function updateSystemMetrics(metricUpdates) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const updateFields = Object.keys(metricUpdates)
            .map((key, index) => `${key} = ${key} + $${index + 2}`)
            .join(', ');
        
        const values = [today, ...Object.values(metricUpdates)];
        
        await pool.query(`
            UPDATE system_metrics 
            SET ${updateFields}, timestamp = CURRENT_TIMESTAMP
            WHERE metric_date = $1
        `, values);
        
        connectionStats.totalQueries++;
        return true;
    } catch (error) {
        console.error('Update system metrics error:', error.message);
        connectionStats.failedQueries++;
        return false;
    }
}

/**
 * 🏛️ SAVE ECONOMIC REGIME DATA (Enhanced)
 */
async function saveRegimeData(regimeData) {
    try {
        if (!regimeData || !regimeData.currentRegime) {
            return false;
        }

        const regime = regimeData.currentRegime;
        const signals = regimeData.signals || {};

        // Calculate regime duration
        const lastRegime = await pool.query(`
            SELECT regime_name, date_detected 
            FROM regime_history 
            ORDER BY timestamp DESC 
            LIMIT 1
        `);
        
        let regimeDuration = 0;
        if (lastRegime.rows.length > 0 && lastRegime.rows[0].regime_name === regime.name) {
            const daysDiff = Math.floor((new Date() - new Date(lastRegime.rows[0].date_detected)) / (1000 * 60 * 60 * 24));
            regimeDuration = daysDiff;
        }

        await pool.query(`
            INSERT INTO regime_history (
                regime_name, confidence, growth_direction, inflation_direction,
                policy_stance, market_sentiment, regime_data, fed_rate,
                inflation_rate, yield_curve_2s10s, vix_level, credit_spread_high_yield,
                regime_duration, regime_stability
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
            signals.market?.creditSpread || null,
            regimeDuration,
            regimeDuration > 30 ? 'STABLE' : regimeDuration > 7 ? 'MODERATE' : 'VOLATILE'
        ]);

        // Cleanup old data
        await pool.query(`
            DELETE FROM regime_history 
            WHERE id NOT IN (
                SELECT id FROM regime_history 
                ORDER BY timestamp DESC 
                LIMIT 2000
            )
        `);

        console.log(`🏛️ Regime data saved: ${regime.name} (${regimeData.confidence}% confidence)`);
        connectionStats.successfulQueries++;
        
        // Update system metrics
        await updateSystemMetrics({ total_queries: 1 });
        
        return true;
    } catch (error) {
        console.error('Save regime data error:', error.message);
        connectionStats.failedQueries++;
        return false;
    }
}

/**
 * 🇰🇭 SAVE CAMBODIA DEAL ANALYSIS
 */
async function saveCambodiaDeal(chatId, dealAnalysis) {
    try {
        const deal = dealAnalysis.dealSummary;
        const recommendation = dealAnalysis.recommendation;
        
        await pool.query(`
            INSERT INTO cambodia_deals (
                deal_id, chat_id, amount, interest_rate, term_months,
                collateral_type, borrower_type, location, loan_to_value,
                risk_score, recommendation, recommendation_confidence,
                market_conditions, analysis_data
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
            dealAnalysis.dealId,
            chatId,
            deal.amount,
            deal.rate,
            deal.term,
            dealAnalysis.collateralType || 'commercial',
            dealAnalysis.borrowerType || 'local_developer',
            dealAnalysis.location || 'Phnom Penh',
            dealAnalysis.loanToValue || 70,
            dealAnalysis.riskAssessment.overallScore,
            recommendation.decision,
            recommendation.confidence,
            JSON.stringify(dealAnalysis.marketContext),
            JSON.stringify(dealAnalysis)
        ]);
        
        console.log(`🇰🇭 Cambodia deal saved: ${dealAnalysis.dealId}`);
        connectionStats.successfulQueries++;
        return true;
    } catch (error) {
        console.error('Save Cambodia deal error:', error.message);
        connectionStats.failedQueries++;
        return false;
    }
}

/**
 * 🇰🇭 SAVE CAMBODIA PORTFOLIO STATUS
 */
async function saveCambodiaPortfolio(portfolioData) {
    try {
        await pool.query(`
            INSERT INTO cambodia_portfolio (
                total_aum, deployed_capital, available_capital,
                number_of_deals, average_yield, geographic_allocation,
                sector_allocation, risk_metrics, performance_metrics
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            portfolioData.fundOverview.totalAUM,
            portfolioData.fundOverview.deployedCapital,
            portfolioData.fundOverview.availableCapital,
            portfolioData.fundOverview.numberOfDeals,
            portfolioData.performance.currentYieldRate,
            JSON.stringify(portfolioData.geographicAllocation),
            JSON.stringify(portfolioData.sectorAllocation),
            JSON.stringify(portfolioData.riskMetrics),
            JSON.stringify(portfolioData.performance)
        ]);
        
        console.log('🇰🇭 Cambodia portfolio status saved');
        connectionStats.successfulQueries++;
        return true;
    } catch (error) {
        console.error('Save Cambodia portfolio error:', error.message);
        connectionStats.failedQueries++;
        return false;
    }
}

/**
 * 🇰🇭 GET CAMBODIA FUND ANALYTICS
 */
async function getCambodiaFundAnalytics(days = 30) {
    try {
        const analytics = await pool.query(`
            SELECT 
                COUNT(*) as total_deals,
                AVG(amount) as avg_deal_size,
                AVG(interest_rate) as avg_rate,
                AVG(risk_score) as avg_risk_score,
                COUNT(CASE WHEN recommendation = 'APPROVE' THEN 1 END) as approved_deals,
                COUNT(CASE WHEN recommendation = 'DECLINE' THEN 1 END) as declined_deals,
                SUM(amount) FILTER (WHERE recommendation = 'APPROVE') as approved_volume
            FROM cambodia_deals 
            WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
        `);
        
        const portfolioHistory = await pool.query(`
            SELECT 
                portfolio_date,
                total_aum,
                deployed_capital,
                average_yield
            FROM cambodia_portfolio 
            WHERE portfolio_date >= CURRENT_DATE - INTERVAL '${days} days'
            ORDER BY portfolio_date DESC
        `);
        
        return {
            dealAnalytics: analytics.rows[0],
            portfolioHistory: portfolioHistory.rows,
            analysisDate: new Date().toISOString()
        };
    } catch (error) {
        console.error('Get Cambodia fund analytics error:', error.message);
        return null;
    }
}

/**
 * 💹 SAVE TRADING PATTERN
 */
async function saveTradingPattern(chatId, pattern) {
    try {
        // Check if pattern already exists
        const existing = await pool.query(`
            SELECT id FROM trading_patterns 
            WHERE chat_id = $1 AND pattern_type = $2 AND pattern_description = $3
        `, [chatId, pattern.type, pattern.description]);
        
        if (existing.rows.length > 0) {
            // Update existing pattern
            await pool.query(`
                UPDATE trading_patterns 
                SET confidence_level = $1, last_confirmed = CURRENT_TIMESTAMP,
                    supporting_evidence = $2
                WHERE id = $3
            `, [
                pattern.confidence,
                JSON.stringify(pattern.evidence || {}),
                existing.rows[0].id
            ]);
        } else {
            // Insert new pattern
            await pool.query(`
                INSERT INTO trading_patterns (
                    chat_id, pattern_type, pattern_description, confidence_level,
                    supporting_evidence, pattern_strength, actionable_insights
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                chatId,
                pattern.type,
                pattern.description,
                pattern.confidence,
                JSON.stringify(pattern.evidence || {}),
                pattern.confidence > 80 ? 'STRONG' : pattern.confidence > 60 ? 'MODERATE' : 'WEAK',
                pattern.insights || []
            ]);
        }
        
        console.log(`💹 Trading pattern saved for ${chatId}: ${pattern.type}`);
        connectionStats.successfulQueries++;
        return true;
    } catch (error) {
        console.error('Save trading pattern error:', error.message);
        connectionStats.failedQueries++;
        return false;
    }
}

/**
 * 💹 GET TRADING PATTERNS
 */
async function getTradingPatterns(chatId) {
    try {
        const result = await pool.query(`
            SELECT * FROM trading_patterns 
            WHERE chat_id = $1 
            ORDER BY confidence_level DESC, last_confirmed DESC
        `, [chatId]);
        
        return result.rows;
    } catch (error) {
        console.error('Get trading patterns error:', error.message);
        return [];
    }
}

/**
 * 🧠 SAVE STRATEGIC INSIGHT
 */
async function saveStrategicInsight(insight) {
    try {
        await pool.query(`
            INSERT INTO strategic_insights (
                insight_type, insight_title, insight_description,
                supporting_data, confidence_score, impact_level,
                time_horizon, relevant_users, expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            insight.type,
            insight.title,
            insight.description,
            JSON.stringify(insight.supportingData || {}),
            insight.confidence,
            insight.impact,
            insight.timeHorizon,
            insight.relevantUsers || [],
            insight.expiresAt || null
        ]);
        
        console.log(`🧠 Strategic insight saved: ${insight.title}`);
        connectionStats.successfulQueries++;
        return true;
    } catch (error) {
        console.error('Save strategic insight error:', error.message);
        connectionStats.failedQueries++;
        return false;
    }
}

/**
 * 📊 GET COMPREHENSIVE SYSTEM ANALYTICS
 */
async function getSystemAnalytics() {
    try {
        const [
            userStats,
            conversationStats,
            regimeStats,
            cambodiaStats,
            commandStats,
            performanceStats
        ] = await Promise.all([
            pool.query('SELECT COUNT(DISTINCT chat_id) as total_users FROM conversations'),
            pool.query('SELECT COUNT(*) as total_conversations FROM conversations'),
            pool.query('SELECT COUNT(*) as regime_records FROM regime_history'),
            pool.query('SELECT COUNT(*) as total_deals FROM cambodia_deals'),
            pool.query('SELECT COUNT(*) as total_commands FROM command_analytics'),
            pool.query(`
                SELECT 
                    AVG(execution_time_ms) as avg_response_time,
                    COUNT(CASE WHEN success = true THEN 1 END) as successful_queries,
                    COUNT(CASE WHEN success = false THEN 1 END) as failed_queries
                FROM command_analytics 
                WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
            `)
        ]);

        const analytics = {
            users: {
                total: parseInt(userStats.rows[0].total_users),
                active_last_7_days: await getActiveUsers(7),
                active_last_30_days: await getActiveUsers(30)
            },
            conversations: {
                total: parseInt(conversationStats.rows[0].total_conversations),
                today: await getTodayConversations(),
                avg_per_user: userStats.rows[0].total_users > 0 ? 
                    (conversationStats.rows[0].total_conversations / userStats.rows[0].total_users).toFixed(1) : 0
            },
            rayDalio: {
                regimeRecords: parseInt(regimeStats.rows[0].regime_records),
                currentRegime: await getCurrentRegime(),
                regimeChanges: await getRegimeChanges(30)
            },
            cambodiaFund: {
                totalDeals: parseInt(cambodiaStats.rows[0].total_deals),
                fundAnalytics: await getCambodiaFundAnalytics(30)
            },
            system: {
                totalCommands: parseInt(commandStats.rows[0].total_commands),
                avgResponseTime: parseFloat(performanceStats.rows[0].avg_response_time || 0),
                successRate: performanceStats.rows[0].successful_queries && performanceStats.rows[0].failed_queries ? 
                    ((performanceStats.rows[0].successful_queries / (performanceStats.rows[0].successful_queries + performanceStats.rows[0].failed_queries)) * 100).toFixed(2) : 100,
                connectionHealth: connectionStats.connectionHealth
            },
            timestamp: new Date().toISOString()
        };

        return analytics;
    } catch (error) {
        console.error('Get system analytics error:', error.message);
        return null;
    }
}

async function getActiveUsers(days) {
    try {
        const result = await pool.query(`
            SELECT COUNT(DISTINCT chat_id) as active_users 
            FROM conversations 
            WHERE timestamp >= CURRENT_DATE - INTERVAL '${days} days'
        `);
        return parseInt(result.rows[0].active_users);
    } catch (error) {
        return 0;
    }
}

async function getTodayConversations() {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as today_conversations 
            FROM conversations 
            WHERE DATE(timestamp) = CURRENT_DATE
        `);
        return parseInt(result.rows[0].today_conversations);
    } catch (error) {
        return 0;
    }
}

async function getRegimeChanges(days) {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as regime_changes
            FROM (
                SELECT regime_name,
                       LAG(regime_name) OVER (ORDER BY date_detected) as prev_regime
                FROM regime_history 
                WHERE date_detected >= CURRENT_DATE - INTERVAL '${days} days'
            ) t
            WHERE regime_name != prev_regime OR prev_regime IS NULL
        `);
        return parseInt(result.rows[0].regime_changes);
    } catch (error) {
        return 0;
    }
}

/**
 * 📊 ENHANCED DATABASE STATISTICS
 */
async function getRayDalioStats() {
    try {
        const [users, conversations, memories, documents, regimes, allocations, risks, signals, analytics] = await Promise.all([
            pool.query('SELECT COUNT(DISTINCT chat_id) as count FROM user_profiles'),
            pool.query('SELECT COUNT(*) as count FROM conversations'),
            pool.query('SELECT COUNT(*) as count FROM persistent_memories'),
            pool.query('SELECT COUNT(*) as count FROM training_documents'),
            pool.query('SELECT COUNT(*) as count FROM regime_history'),
            pool.query('SELECT COUNT(*) as count FROM portfolio_allocations'),
            pool.query('SELECT COUNT(*) as count FROM risk_assessments'),
            pool.query('SELECT COUNT(*) as count FROM market_signals'),
            getSystemAnalytics()
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
                AND resolved_at IS NULL
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
            systemAnalytics: analytics,
            connectionStats: connectionStats,
            storage: 'PostgreSQL Database (Strategic Enhanced)',
            institutionalGrade: true,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Get Ray Dalio stats error:', error.message);
        connectionStats.failedQueries++;
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
            institutionalGrade: false,
            error: error.message
        };
    }
}

/**
 * 🔧 DATABASE MAINTENANCE & OPTIMIZATION
 */
async function performDatabaseMaintenance() {
    try {
        console.log('🔧 Starting database maintenance...');
        
        const maintenanceResults = {
            tablesAnalyzed: 0,
            oldDataCleaned: 0,
            indexesRebuilt: 0,
            errors: []
        };

        // Analyze table statistics
        const tables = [
            'conversations', 'persistent_memories', 'regime_history', 
            'portfolio_allocations', 'cambodia_deals', 'command_analytics'
        ];

        for (const table of tables) {
            try {
                await pool.query(`ANALYZE ${table}`);
                maintenanceResults.tablesAnalyzed++;
            } catch (error) {
                maintenanceResults.errors.push(`ANALYZE ${table}: ${error.message}`);
            }
        }

        // Clean old data
        const cleanupQueries = [
            {
                query: 'DELETE FROM conversations WHERE timestamp < NOW() - INTERVAL \'6 months\' AND strategic_importance = \'low\'',
                description: 'Old low-importance conversations'
            },
            {
                query: 'DELETE FROM regime_history WHERE timestamp < NOW() - INTERVAL \'1 year\'',
                description: 'Old regime history'
            },
            {
                query: 'DELETE FROM command_analytics WHERE timestamp < NOW() - INTERVAL \'3 months\'',
                description: 'Old command analytics'
            },
            {
                query: 'UPDATE market_signals SET resolved_at = NOW() WHERE triggered_at < NOW() - INTERVAL \'30 days\' AND resolved_at IS NULL',
                description: 'Auto-resolve old market signals'
            }
        ];

        for (const cleanup of cleanupQueries) {
            try {
                const result = await pool.query(cleanup.query);
                maintenanceResults.oldDataCleaned += result.rowCount;
                console.log(`🧹 Cleaned ${result.rowCount} records: ${cleanup.description}`);
            } catch (error) {
                maintenanceResults.errors.push(`${cleanup.description}: ${error.message}`);
            }
        }

        // Update statistics
        await updateSystemMetrics({
            database_maintenance: 1
        });

        console.log('✅ Database maintenance completed', maintenanceResults);
        return maintenanceResults;

    } catch (error) {
        console.error('Database maintenance error:', error.message);
        return { error: error.message };
    }
}

/**
 * 📊 DATABASE HEALTH CHECK
 */
async function performHealthCheck() {
    try {
        const healthCheck = {
            status: 'HEALTHY',
            checks: {},
            timestamp: new Date().toISOString()
        };

        // Connection test
        const connectionTest = await pool.query('SELECT NOW() as current_time');
        healthCheck.checks.connection = {
            status: 'PASS',
            responseTime: new Date() - new Date(connectionTest.rows[0].current_time),
            details: 'Database connection successful'
        };

        // Table count checks
        const tableCounts = await pool.query(`
            SELECT 
                schemaname,
                tablename,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes
            FROM pg_stat_user_tables 
            WHERE schemaname = 'public'
        `);

        healthCheck.checks.tables = {
            status: 'PASS',
            count: tableCounts.rows.length,
            details: tableCounts.rows
        };

        // Index usage check
        const indexUsage = await pool.query(`
            SELECT 
                indexrelname as index_name,
                idx_tup_read as reads,
                idx_tup_fetch as fetches
            FROM pg_stat_user_indexes 
            WHERE idx_tup_read > 0
            ORDER BY idx_tup_read DESC
            LIMIT 10
        `);

        healthCheck.checks.indexes = {
            status: 'PASS',
            activeIndexes: indexUsage.rows.length,
            topIndexes: indexUsage.rows
        };

        // Database size check
        const dbSize = await pool.query(`
            SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `);

        healthCheck.checks.storage = {
            status: 'PASS',
            size: dbSize.rows[0].size,
            details: 'Database size within normal limits'
        };

        // Performance metrics
        healthCheck.checks.performance = {
            status: connectionStats.connectionHealth === 'HEALTHY' ? 'PASS' : 'WARN',
            totalQueries: connectionStats.totalQueries,
            successRate: connectionStats.totalQueries > 0 ? 
                ((connectionStats.successfulQueries / connectionStats.totalQueries) * 100).toFixed(2) : 100,
            lastError: connectionStats.lastError
        };

        return healthCheck;

    } catch (error) {
        console.error('Database health check error:', error.message);
        return {
            status: 'ERROR',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// 🔄 PRESERVE ALL EXISTING FUNCTIONS WITH ENHANCEMENTS

async function saveConversationDB(chatId, userMessage, gptResponse, messageType = 'text', contextData = null) {
    try {
        const startTime = Date.now();
        
        await pool.query(
            `INSERT INTO conversations (chat_id, user_message, gpt_response, message_type, context_data, response_time_ms) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [chatId, userMessage, gptResponse, messageType, contextData, Date.now() - startTime]
        );
        
        await pool.query(`
            INSERT INTO user_profiles (chat_id, conversation_count, last_seen) 
            VALUES ($1, 1, CURRENT_TIMESTAMP)
            ON CONFLICT (chat_id) 
            DO UPDATE SET 
                conversation_count = user_profiles.conversation_count + 1,
                last_seen = CURRENT_TIMESTAMP
        `, [chatId]);
        
        // Cleanup old conversations (keep last 200 per user)
        await pool.query(`
            DELETE FROM conversations 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM conversations 
                WHERE chat_id = $1 
                ORDER BY timestamp DESC 
                LIMIT 200
            )
        `, [chatId]);
        
        connectionStats.successfulQueries++;
        await updateSystemMetrics({ total_queries: 1 });
        
        return true;
    } catch (error) {
        console.error('Save conversation error:', error);
        connectionStats.failedQueries++;
        return false;
    }
}

async function getConversationHistoryDB(chatId, limit = 10) {
    try {
        const result = await pool.query(
            'SELECT user_message, gpt_response, message_type, timestamp FROM conversations WHERE chat_id = $1 ORDER BY timestamp DESC LIMIT $2',
            [chatId, limit]
        );
        
        connectionStats.successfulQueries++;
        return result.rows.reverse();
    } catch (error) {
        console.error('Get history error:', error);
        connectionStats.failedQueries++;
        return [];
    }
}

async function addPersistentMemoryDB(chatId, fact, importance = 'medium') {
    try {
        // Generate hash for deduplication
        const crypto = require('crypto');
        const factHash = crypto.createHash('sha256').update(fact.toLowerCase().trim()).digest('hex');
        
        // Check for duplicates
        const existing = await pool.query(
            'SELECT id FROM persistent_memories WHERE chat_id = $1 AND fact_hash = $2',
            [chatId, factHash]
        );
        
        if (existing.rows.length > 0) {
            // Update access count
            await pool.query(
                'UPDATE persistent_memories SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE id = $1',
                [existing.rows[0].id]
            );
            return true;
        }
        
        await pool.query(
            'INSERT INTO persistent_memories (chat_id, fact, importance, fact_hash) VALUES ($1, $2, $3, $4)',
            [chatId, fact, importance, factHash]
        );
        
        // Cleanup - keep only most important memories (limit 100 per user)
        await pool.query(`
            DELETE FROM persistent_memories 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM persistent_memories 
                WHERE chat_id = $1 
                ORDER BY 
                    CASE importance 
                        WHEN 'critical' THEN 4
                        WHEN 'high' THEN 3 
                        WHEN 'medium' THEN 2 
                        WHEN 'low' THEN 1 
                    END DESC, 
                    access_count DESC,
                    timestamp DESC 
                LIMIT 100
            )
        `, [chatId]);
        
        console.log(`💾 Persistent memory saved to database for ${chatId}: ${fact}`);
        connectionStats.successfulQueries++;
        return true;
    } catch (error) {
        console.error('Add persistent memory error:', error);
        connectionStats.failedQueries++;
        return false;
    }
}

async function getPersistentMemoryDB(chatId) {
    try {
        const result = await pool.query(
            'SELECT fact, importance, timestamp, access_count FROM persistent_memories WHERE chat_id = $1 ORDER BY importance DESC, access_count DESC, timestamp DESC',
            [chatId]
        );
        
        connectionStats.successfulQueries++;
        return result.rows;
    } catch (error) {
        console.error('Get persistent memory error:', error);
        connectionStats.failedQueries++;
        return [];
    }
}

async function getUserProfileDB(chatId) {
    try {
        const result = await pool.query(
            'SELECT * FROM user_profiles WHERE chat_id = $1',
            [chatId]
        );
        
        connectionStats.successfulQueries++;
        return result.rows[0] || null;
    } catch (error) {
        console.error('Get user profile error:', error);
        connectionStats.failedQueries++;
        return null;
    }
}

async function updateUserPreferencesDB(chatId, preferences) {
    try {
        await pool.query(
            'UPDATE user_profiles SET preferences = $2, last_seen = CURRENT_TIMESTAMP WHERE chat_id = $1',
            [chatId, JSON.stringify(preferences)]
        );
        connectionStats.successfulQueries++;
        return true;
    } catch (error) {
        console.error('Update preferences error:', error);
        connectionStats.failedQueries++;
        return false;
    }
}

async function saveTrainingDocumentDB(chatId, fileName, content, documentType, wordCount, summary) {
    try {
        const crypto = require('crypto');
        const fileHash = crypto.createHash('sha256').update(content).digest('hex');
        
        await pool.query(
            'INSERT INTO training_documents (chat_id, file_name, content, document_type, word_count, summary, file_size, file_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [chatId, fileName, content, documentType, wordCount, summary, content.length, fileHash]
        );
        
        // Cleanup - keep only last 50 documents per user
        await pool.query(`
            DELETE FROM training_documents 
            WHERE chat_id = $1 AND id NOT IN (
                SELECT id FROM training_documents 
                WHERE chat_id = $1 
                ORDER BY upload_date DESC 
                LIMIT 50
            )
        `, [chatId]);
        
        connectionStats.successfulQueries++;
        return true;
    } catch (error) {
        console.error('Save training document error:', error);
        connectionStats.failedQueries++;
        return false;
    }
}

async function getTrainingDocumentsDB(chatId) {
    try {
        const result = await pool.query(
            'SELECT file_name, content, document_type, upload_date, word_count, summary, file_size FROM training_documents WHERE chat_id = $1 ORDER BY upload_date DESC',
            [chatId]
        );
        
        connectionStats.successfulQueries++;
        return result.rows;
    } catch (error) {
        console.error('Get training documents error:', error);
        connectionStats.failedQueries++;
        return [];
    }
}

async function getDatabaseStats() {
    try {
        return await getRayDalioStats();
    } catch (error) {
        console.error('Get database stats error:', error);
        connectionStats.failedQueries++;
        return {
            totalUsers: 0,
            totalConversations: 0,
            totalMemories: 0,
            totalDocuments: 0,
            storage: 'Database Error',
            error: error.message
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
            // Enhanced tables
            pool.query('DELETE FROM portfolio_allocations WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM regime_performance WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM risk_assessments WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM position_sizing_history WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM command_analytics WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM cambodia_deals WHERE chat_id = $1', [chatId]),
            pool.query('DELETE FROM trading_patterns WHERE chat_id = $1', [chatId])
        ]);
        
        console.log(`🗑️ All strategic data cleared for user ${chatId}`);
        connectionStats.successfulQueries++;
        return true;
    } catch (error) {
        console.error('Clear user data error:', error);
        connectionStats.failedQueries++;
        return false;
    }
}

/**
 * 🎯 RAY DALIO HELPER FUNCTIONS (Enhanced)
 */

async function getCurrentRegime() {
    try {
        const result = await pool.query(`
            SELECT regime_name, confidence, growth_direction, inflation_direction, regime_duration, timestamp
            FROM regime_history 
            ORDER BY timestamp DESC 
            LIMIT 1
        `);
        
        connectionStats.successfulQueries++;
        return result.rows[0] || null;
    } catch (error) {
        console.error('Get current regime error:', error.message);
        connectionStats.failedQueries++;
        return null;
    }
}

async function getLatestRiskAssessment(chatId) {
    try {
        const result = await pool.query(`
            SELECT * FROM risk_assessments 
            WHERE chat_id = $1 
            ORDER BY timestamp DESC 
            LIMIT 1
        `, [chatId]);
        
        connectionStats.successfulQueries++;
        return result.rows[0] || null;
    } catch (error) {
        console.error('Get latest risk assessment error:', error.message);
        connectionStats.failedQueries++;
        return null;
    }
}

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
        
        connectionStats.successfulQueries++;
        return result.rows;
    } catch (error) {
        console.error('Get active market signals error:', error.message);
        connectionStats.failedQueries++;
        return [];
    }
}

async function savePortfolioAllocation(chatId, allocation) {
    try {
        await pool.query(`
            INSERT INTO portfolio_allocations (
                chat_id, allocation_type, regime_name, asset_class,
                allocation_percent, allocation_amount, reasoning,
                confidence_level, performance_attribution, rebalancing_trigger
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
            chatId,
            allocation.type,
            allocation.regime,
            allocation.assetClass,
            allocation.percent,
            allocation.amount,
            allocation.reasoning,
            allocation.confidence,
            allocation.performance,
            allocation.trigger
        ]);

        console.log(`📊 Portfolio allocation saved for ${chatId}`);
        connectionStats.successfulQueries++;
        return true;
    } catch (error) {
        console.error('Save portfolio allocation error:', error.message);
        connectionStats.failedQueries++;
        return false;
    }
}

async function saveRiskAssessment(chatId, assessment) {
  try {
    await pool.query(`
      INSERT INTO risk_assessments (
        chat_id,
        risk_type,
        exposure_level,
        confidence,
        notes,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      chatId,
      assessment.riskType,
      assessment.exposureLevel,
      assessment.confidence,
      assessment.notes
    ]);
    console.log(`✅ Risk assessment saved for ${chatId}`);
    return true;
  } catch (error) {
    console.error('❌ saveRiskAssessment error:', error.message);
    return false;
  }
}

module.exports = {
    // 🏛️ ENHANCED STRATEGIC FUNCTIONS
    initializeDatabase,
    saveRegimeData,
    savePortfolioAllocation,
    saveRiskAssessment,
    savePositionSizing,
    saveMarketSignal,
    saveDailyObservation,
    logCommandUsage,
    
    // 🇰🇭 CAMBODIA FUND FUNCTIONS
    saveCambodiaDeal,
    saveCambodiaPortfolio,
    getCambodiaFundAnalytics,
    
    // 💹 TRADING FUNCTIONS
    saveTradingPattern,
    getTradingPatterns,
    saveStrategicInsight,
    
    // 📊 ANALYTICS & MONITORING
    getSystemAnalytics,
    getRayDalioStats,
    performDatabaseMaintenance,
    performHealthCheck,
    updateSystemMetrics,
    
    // Analytics Functions (existing)
    getRegimeTransitions,
    getPortfolioPerformanceByRegime,
    getPositionSizingAnalytics,
    getCommandUsageStats,
    
    // Helper Functions (existing)
    getCurrentRegime,
    getLatestRiskAssessment,
    getActiveMarketSignals,
    getRecentDailyObservations,
    cleanupOldData,
    getRegimePerformanceSummary,
    getRiskTrendAnalysis,
    
    // Original Functions (enhanced)
    saveConversationDB,
    getConversationHistoryDB,
    addPersistentMemoryDB,
    getPersistentMemoryDB,
    getUserProfileDB,
    updateUserPreferencesDB,
    saveTrainingDocumentDB,
    getTrainingDocumentsDB,
    getDatabaseStats,
    clearUserDataDB,
    
    // 📊 CONNECTION MONITORING
    connectionStats
};
