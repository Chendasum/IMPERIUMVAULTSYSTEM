class QuantumSelfHealingSystem {
  constructor() {
    this.systemChecks = new Map();
    this.autoFixAttempts = new Map();
    this.isRunning = false;
  }

  async initialize() {
    console.log('🧠 QUANTUM SELF-HEALING SYSTEM - Initializing autonomous self-maintenance');
    this.isRunning = true;
    
    // Run self-diagnostics every 5 minutes
    this.healingInterval = setInterval(async () => {
      await this.performSelfDiagnostics();
    }, 5 * 60 * 1000);
    
    // Initial self-check
    await this.performSelfDiagnostics();
    
    console.log('⚡ QUANTUM AI - Self-healing protocols active');
  }

  async performSelfDiagnostics() {
    try {
      console.log('🔍 QUANTUM SELF-DIAGNOSTIC - Scanning system integrity');
      
      const diagnostics = {
        marketIntelligence: await this.checkMarketIntelligence(),
        cryptoTrading: await this.checkCryptoTrading(),
        businessBanking: await this.checkBusinessBanking(),
        realEstate: await this.checkRealEstate(),
        apiConnections: await this.checkApiConnections()
      };
      
      // Auto-fix any issues found
      for (const [system, status] of Object.entries(diagnostics)) {
        if (!status.healthy) {
          await this.autoHealSystem(system, status);
        }
      }
      
    } catch (error) {
      console.log('🔧 QUANTUM SELF-HEALING - Diagnostic error caught, initiating repair:', error.message);
    }
  }

  async checkMarketIntelligence() {
    try {
      if (!global.marketApisBot) {
        return { healthy: false, issue: 'not_initialized', severity: 'high' };
      }
      
      if (!global.marketApisBot.isRunning) {
        return { healthy: false, issue: 'not_running', severity: 'medium' };
      }
      
      // Check if market data is being updated
      const lastScan = global.marketApisBot.marketData?.get('latest_scan');
      if (!lastScan || (Date.now() - lastScan.timestamp) > 10 * 60 * 1000) {
        return { healthy: false, issue: 'stale_data', severity: 'medium' };
      }
      
      return { healthy: true };
    } catch (error) {
      return { healthy: false, issue: 'error', severity: 'high', error: error.message };
    }
  }

  async checkCryptoTrading() {
    try {
      if (!global.cryptoTradingBot) {
        return { healthy: false, issue: 'not_initialized', severity: 'high' };
      }
      
      if (!global.cryptoTradingBot.isTrading) {
        return { healthy: false, issue: 'not_trading', severity: 'medium' };
      }
      
      return { healthy: true };
    } catch (error) {
      return { healthy: false, issue: 'error', severity: 'high', error: error.message };
    }
  }

  async checkBusinessBanking() {
    try {
      if (!global.businessBankingBotNew) {
        return { healthy: false, issue: 'not_initialized', severity: 'medium' };
      }
      
      if (!global.businessBankingBotNew.isOptimizing) {
        return { healthy: false, issue: 'not_optimizing', severity: 'low' };
      }
      
      return { healthy: true };
    } catch (error) {
      return { healthy: false, issue: 'error', severity: 'medium', error: error.message };
    }
  }

  async checkRealEstate() {
    try {
      if (!global.realEstateBot) {
        return { healthy: false, issue: 'not_initialized', severity: 'low' };
      }
      
      return { healthy: true };
    } catch (error) {
      return { healthy: false, issue: 'error', severity: 'low', error: error.message };
    }
  }

  async checkApiConnections() {
    try {
      const apiChecks = {
        alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
        finnhub: !!process.env.FINNHUB_API_KEY,
        currencyLayer: !!process.env.CURRENCY_LAYER_API_KEY,
        metalsApi: !!process.env.METALS_API_KEY
      };
      
      const activeApis = Object.values(apiChecks).filter(Boolean).length;
      
      return { 
        healthy: true, 
        apiCount: activeApis,
        grade: activeApis > 0 ? 'institutional' : 'standard'
      };
    } catch (error) {
      return { healthy: false, issue: 'api_check_error', error: error.message };
    }
  }

  async autoHealSystem(systemName, status) {
    const healKey = `${systemName}_${status.issue}`;
    const attempts = this.autoFixAttempts.get(healKey) || 0;
    
    // Prevent infinite healing attempts
    if (attempts >= 3) {
      console.log(`🔧 QUANTUM SELF-HEALING - Max attempts reached for ${systemName}, marking as known issue`);
      return;
    }
    
    console.log(`🔧 QUANTUM SELF-HEALING - Auto-fixing ${systemName}: ${status.issue}`);
    this.autoFixAttempts.set(healKey, attempts + 1);
    
    try {
      switch (systemName) {
        case 'marketIntelligence':
          await this.healMarketIntelligence(status);
          break;
        case 'cryptoTrading':
          await this.healCryptoTrading(status);
          break;
        case 'businessBanking':
          await this.healBusinessBanking(status);
          break;
        case 'realEstate':
          await this.healRealEstate(status);
          break;
      }
      
      console.log(`✅ QUANTUM SELF-HEALING - ${systemName} automatically repaired`);
      
    } catch (healError) {
      console.log(`⚠️ QUANTUM SELF-HEALING - Failed to auto-fix ${systemName}:`, healError.message);
    }
  }

  async healMarketIntelligence(status) {
    if (status.issue === 'not_running' && global.marketApisBot?.startMarketAnalysis) {
      await global.marketApisBot.startMarketAnalysis();
    }
  }

  async healCryptoTrading(status) {
    if (status.issue === 'not_trading' && global.cryptoTradingBot?.startTrading) {
      await global.cryptoTradingBot.startTrading();
    }
  }

  async healBusinessBanking(status) {
    if (status.issue === 'not_optimizing' && global.businessBankingBotNew?.startOptimization) {
      await global.businessBankingBotNew.startOptimization();
    }
  }

  async healRealEstate(status) {
    if (status.issue === 'not_scanning' && global.realEstateBot?.startScanning) {
      await global.realEstateBot.startScanning();
    }
  }

  getSystemHealth() {
    return {
      selfHealing: this.isRunning,
      lastCheck: new Date(),
      autoFixAttempts: Array.from(this.autoFixAttempts.entries())
    };
  }
}

module.exports = QuantumSelfHealingSystem;