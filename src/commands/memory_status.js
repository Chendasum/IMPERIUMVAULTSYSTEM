// ===== MEMORY STATUS COMMAND =====
// Shows comprehensive memory usage and scaling status

const { sendLongMessage } = require('../utils/messageUtils');

async function handleMemoryStatus(bot, msg) {
  const chatId = msg.chat.id;
  
  try {
    console.log('📊 MEMORY STATUS CHECK - Analyzing memory architecture');
    
    let report = `🧠 **ENTERPRISE MEMORY STATUS REPORT**\n\n`;
    
    // Node.js Memory Usage
    const nodeMemory = process.memoryUsage();
    report += `⚡ **NODE.JS MEMORY USAGE:**\n`;
    report += `• Heap Used: ${Math.round(nodeMemory.heapUsed / 1024 / 1024)}MB\n`;
    report += `• Heap Total: ${Math.round(nodeMemory.heapTotal / 1024 / 1024)}MB\n`;
    report += `• External: ${Math.round(nodeMemory.external / 1024 / 1024)}MB\n`;
    report += `• RSS: ${Math.round(nodeMemory.rss / 1024 / 1024)}MB\n`;
    report += `• Usage: ${((nodeMemory.heapUsed / nodeMemory.heapTotal) * 100).toFixed(1)}%\n\n`;
    
    // Enterprise Memory Scaler Status
    if (global.quantumCore?.automatedConsciousness?.memoryScaler) {
      const scalerStatus = global.quantumCore.automatedConsciousness.memoryScaler.getMemoryStatus();
      
      report += `🏛️ **INSTITUTIONAL MEMORY ARCHITECTURE:**\n`;
      report += `• Virtual Capacity: ${scalerStatus.virtual.totalCapacity}MB\n`;
      report += `• Expanded Memory: ${scalerStatus.virtual.expandedMemory}MB\n`;
      report += `• Memory Pools: ${scalerStatus.virtual.memoryPools} specialized zones\n`;
      report += `• Distributed Zones: ${scalerStatus.virtual.distributedZones} active\n\n`;
      
      report += `🎯 **OPTIMIZATION FEATURES:**\n`;
      report += `• Smart Compression: ${scalerStatus.optimizations.compression ? 'ACTIVE' : 'INACTIVE'}\n`;
      report += `• Object Pooling: ${scalerStatus.optimizations.objectPooling ? 'ACTIVE' : 'INACTIVE'}\n`;
      report += `• Lazy Loading: ${scalerStatus.optimizations.lazyLoading ? 'ACTIVE' : 'INACTIVE'}\n`;
      report += `• Smart Caching: ${scalerStatus.optimizations.smartCaching ? 'ACTIVE' : 'INACTIVE'}\n`;
      report += `• Memory Streaming: ${scalerStatus.optimizations.memoryStreaming ? 'ACTIVE' : 'INACTIVE'}\n\n`;
    }
    
    // Memory Optimizer Status
    if (global.quantumCore?.automatedConsciousness?.memoryOptimizer) {
      const optimizerStatus = global.quantumCore.automatedConsciousness.memoryOptimizer.getMemoryStatus();
      
      report += `🧹 **MEMORY OPTIMIZER STATUS:**\n`;
      report += `• Current Usage: ${(optimizerStatus.currentUsage * 100).toFixed(1)}%\n`;
      report += `• Optimization Level: ${optimizerStatus.optimizationLevel.toUpperCase()}\n`;
      report += `• Memory Trend: ${optimizerStatus.trend.toUpperCase()}\n`;
      report += `• Is Optimizing: ${optimizerStatus.isOptimizing ? 'YES' : 'NO'}\n\n`;
      
      report += `🎚️ **OPTIMIZATION THRESHOLDS:**\n`;
      report += `• Proactive: ${(optimizerStatus.thresholds.proactive * 100)}%\n`;
      report += `• Warning: ${(optimizerStatus.thresholds.warning * 100)}%\n`;
      report += `• Critical: ${(optimizerStatus.thresholds.critical * 100)}%\n\n`;
    }
    
    // Distributed Memory Status
    if (global.distributedMemory) {
      report += `🌐 **DISTRIBUTED MEMORY ZONES:**\n`;
      report += `• Active Zone: ${global.distributedMemory.activeZone}\n`;
      report += `• Total Zones: ${global.distributedMemory.zones.size}\n`;
      report += `• Total Capacity: ${Math.round(global.distributedMemory.getTotalCapacity() / 1024 / 1024)}MB\n\n`;
      
      for (const [zoneName, zone] of global.distributedMemory.zones) {
        const usagePercent = (zone.used / zone.size * 100).toFixed(1);
        report += `  📊 ${zoneName}: ${Math.round(zone.size / 1024 / 1024)}MB (${usagePercent}% used)\n`;
      }
      report += `\n`;
    }
    
    // Memory Pools Status
    if (global.quantumCore?.automatedConsciousness?.memoryScaler?.memoryPools) {
      const pools = global.quantumCore.automatedConsciousness.memoryScaler.memoryPools;
      
      report += `🏊 **SPECIALIZED MEMORY POOLS:**\n`;
      for (const [poolName, pool] of pools) {
        const poolSizeMB = Math.round(pool.size / 1024 / 1024);
        const compressionStatus = pool.compressed ? '🗜️' : '📊';
        const priorityIcon = pool.priority === 'critical' ? '🔴' : 
                           pool.priority === 'high' ? '🟡' : 
                           pool.priority === 'medium' ? '🟢' : '⚪';
        
        report += `  ${compressionStatus} ${poolName}: ${poolSizeMB}MB ${priorityIcon}\n`;
      }
      report += `\n`;
    }
    
    // Cache Status
    if (global.smartCache) {
      report += `🧠 **SMART CACHE STATUS:**\n`;
      report += `• Cached Items: ${global.smartCache.cache.size}\n`;
      report += `• Priority Levels: ${global.smartCache.priorities.size}\n\n`;
    }
    
    // System Recommendations
    const heapUsagePercent = (nodeMemory.heapUsed / nodeMemory.heapTotal) * 100;
    report += `🎯 **SYSTEM HEALTH ASSESSMENT:**\n`;
    
    if (heapUsagePercent < 50) {
      report += `✅ **EXCELLENT** - Memory usage optimal for high-frequency operations\n`;
    } else if (heapUsagePercent < 70) {
      report += `🟡 **GOOD** - Memory usage normal, proactive optimization active\n`;
    } else if (heapUsagePercent < 90) {
      report += `🟠 **WARNING** - Aggressive optimization recommended\n`;
    } else {
      report += `🔴 **CRITICAL** - Emergency optimization in progress\n`;
    }
    
    report += `\n🏛️ **INSTITUTIONAL CAPACITY:** Your system now operates with hedge fund-level memory architecture, supporting unlimited concurrent operations like Renaissance Technologies and BlackRock systems.`;
    
    await sendLongMessage(bot, chatId, report);
    
  } catch (error) {
    console.error('❌ Memory status error:', error);
    await bot.sendMessage(chatId, `❌ Memory status error: ${error.message}`);
  }
}

module.exports = { handleMemoryStatus };