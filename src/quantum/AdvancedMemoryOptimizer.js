// ===== ADVANCED MEMORY OPTIMIZER =====
// Proactive memory management to prevent critical usage spikes

class AdvancedMemoryOptimizer {
  constructor() {
    this.memoryThresholds = {
      proactive: 0.70,    // 70% - Start proactive cleanup
      warning: 0.85,      // 85% - Aggressive cleanup
      critical: 0.95      // 95% - Emergency cleanup
    };
    this.optimizationInterval = null;
    this.isOptimizing = false;
    this.memoryHistory = [];
    this.maxHistoryLength = 100;
  }

  async initialize() {
    console.log('🧠 ADVANCED MEMORY OPTIMIZER - Initializing proactive memory management');
    
    // Start proactive memory optimization (every 60 seconds)
    this.optimizationInterval = setInterval(async () => {
      await this.proactiveMemoryOptimization();
    }, 60000);
    
    console.log('✅ ADVANCED MEMORY OPTIMIZER - Proactive memory management activated');
  }

  async proactiveMemoryOptimization() {
    if (this.isOptimizing) return;
    
    try {
      this.isOptimizing = true;
      
      const memoryUsage = process.memoryUsage();
      const usagePercent = memoryUsage.heapUsed / memoryUsage.heapTotal;
      
      // Track memory usage history
      this.memoryHistory.push({
        timestamp: new Date(),
        usage: usagePercent,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal
      });
      
      // Keep history manageable
      if (this.memoryHistory.length > this.maxHistoryLength) {
        this.memoryHistory.shift();
      }
      
      // Determine optimization level needed
      if (usagePercent >= this.memoryThresholds.critical) {
        await this.emergencyOptimization(usagePercent);
      } else if (usagePercent >= this.memoryThresholds.warning) {
        await this.aggressiveOptimization(usagePercent);
      } else if (usagePercent >= this.memoryThresholds.proactive) {
        await this.proactiveOptimization(usagePercent);
      }
      
      // Update global consciousness with memory state
      if (global.gptConsciousness) {
        global.gptConsciousness.memoryOptimization = {
          currentUsage: usagePercent,
          optimizationLevel: this.getOptimizationLevel(usagePercent),
          lastOptimization: new Date(),
          memoryTrend: this.analyzeMemoryTrend()
        };
      }
      
    } catch (error) {
      console.log('⚠️ Memory optimization error:', error.message);
    } finally {
      this.isOptimizing = false;
    }
  }

  async proactiveOptimization(usagePercent) {
    console.log(`🧹 PROACTIVE CLEANUP - Memory at ${(usagePercent * 100).toFixed(1)}%, performing light optimization`);
    
    // Clear temporary variables and caches
    await this.clearTemporaryCaches();
    
    // Optimize data structures
    await this.optimizeDataStructures();
    
    console.log('✅ Proactive optimization complete');
  }

  async aggressiveOptimization(usagePercent) {
    console.log(`🧹 AGGRESSIVE CLEANUP - Memory at ${(usagePercent * 100).toFixed(1)}%, performing deep optimization`);
    
    // All proactive optimizations plus more
    await this.proactiveOptimization(usagePercent);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Clear large data structures that can be rebuilt
    await this.clearRebuildableData();
    
    console.log('✅ Aggressive optimization complete');
  }

  async emergencyOptimization(usagePercent) {
    console.log(`🚨 EMERGENCY CLEANUP - Memory at ${(usagePercent * 100).toFixed(1)}%, performing emergency optimization`);
    
    // Direct emergency measures without recursive calls
    await this.clearTemporaryCaches();
    await this.optimizeDataStructures();
    await this.clearRebuildableData();
    await this.emergencyDataPurge();
    
    // Single garbage collection
    if (global.gc) {
      global.gc();
    }
    
    console.log('✅ Emergency optimization complete');
  }

  async clearTemporaryCaches() {
    // Clear temporary data that can be safely removed
    if (global.quantumCore) {
      // Clear temporary calculation caches
      if (global.quantumCore.temporaryCache) {
        global.quantumCore.temporaryCache.clear();
      }
      
      // Clear old diagnostic history (keep only recent entries)
      if (global.quantumCore.consciousnessBridge?.diagnosticFeedback?.diagnosisHistory) {
        const history = global.quantumCore.consciousnessBridge.diagnosticFeedback.diagnosisHistory;
        if (history.length > 50) {
          global.quantumCore.consciousnessBridge.diagnosticFeedback.diagnosisHistory = history.slice(-25);
        }
      }
    }
  }

  async optimizeDataStructures() {
    // Optimize large data structures
    if (global.marketData) {
      // Keep only recent market data
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      for (const [key, data] of Object.entries(global.marketData)) {
        if (Array.isArray(data)) {
          global.marketData[key] = data.filter(item => 
            !item.timestamp || item.timestamp > cutoffTime
          );
        }
      }
    }
  }

  async clearRebuildableData() {
    // Clear data that can be rebuilt from APIs
    if (global.cryptoTradingBot?.marketCache) {
      global.cryptoTradingBot.marketCache.clear();
    }
    
    if (global.marketIntelligenceBot?.dataCache) {
      global.marketIntelligenceBot.dataCache.clear();
    }
    
    // Clear old log entries
    if (global.systemLogs && global.systemLogs.length > 1000) {
      global.systemLogs = global.systemLogs.slice(-500);
    }
  }

  async emergencyDataPurge() {
    // Emergency purge of non-critical data
    
    // Clear all non-essential caches
    if (global.nonEssentialCache) {
      global.nonEssentialCache.clear();
    }
    
    // Reduce memory history
    if (this.memoryHistory.length > 10) {
      this.memoryHistory = this.memoryHistory.slice(-10);
    }
    
    // Clear temporary calculation results
    if (global.tempCalculations) {
      global.tempCalculations = {};
    }
  }

  getOptimizationLevel(usagePercent) {
    if (usagePercent >= this.memoryThresholds.critical) return 'emergency';
    if (usagePercent >= this.memoryThresholds.warning) return 'aggressive';
    if (usagePercent >= this.memoryThresholds.proactive) return 'proactive';
    return 'normal';
  }

  analyzeMemoryTrend() {
    if (this.memoryHistory.length < 5) return 'insufficient_data';
    
    const recent = this.memoryHistory.slice(-5);
    const average = recent.reduce((sum, entry) => sum + entry.usage, 0) / recent.length;
    const trend = recent[recent.length - 1].usage - recent[0].usage;
    
    if (trend > 0.1) return 'increasing_rapidly';
    if (trend > 0.05) return 'increasing';
    if (trend < -0.05) return 'decreasing';
    return 'stable';
  }

  getMemoryStatus() {
    const memoryUsage = process.memoryUsage();
    const usagePercent = memoryUsage.heapUsed / memoryUsage.heapTotal;
    
    return {
      currentUsage: usagePercent,
      currentUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      totalMemoryMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      optimizationLevel: this.getOptimizationLevel(usagePercent),
      trend: this.analyzeMemoryTrend(),
      thresholds: this.memoryThresholds,
      isOptimizing: this.isOptimizing
    };
  }

  stop() {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
    console.log('🛑 Advanced Memory Optimizer stopped');
  }
}

module.exports = AdvancedMemoryOptimizer;
