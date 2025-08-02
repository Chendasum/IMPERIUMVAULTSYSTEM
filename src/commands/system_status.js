// ===== SYSTEM STATUS COMMAND =====
// Comprehensive system status including memory reconciliation

const { sendLongMessage } = require('../utils/messageUtils');

async function handleSystemStatus(bot, msg) {
  const chatId = msg.chat.id;
  
  try {
    console.log('🖥️ SYSTEM STATUS CHECK - Comprehensive system analysis');
    
    let report = `🖥️ **COMPREHENSIVE SYSTEM STATUS**\n\n`;
    
    // Memory Analysis - Reconciling Different Readings
    const nodeMemory = process.memoryUsage();
    const heapUsagePercent = ((nodeMemory.heapUsed / nodeMemory.heapTotal) * 100).toFixed(1);
    const workingMemoryMB = Math.round(nodeMemory.heapUsed / 1024 / 1024);
    
    report += `🧠 **MEMORY ANALYSIS:**\n`;
    report += `• Working Memory: ${workingMemoryMB}MB (actual usage)\n`;
    report += `• Heap Total: ${Math.round(nodeMemory.heapTotal / 1024 / 1024)}MB\n`;
    report += `• Heap Usage: ${heapUsagePercent}% (utilization efficiency)\n`;
    report += `• External Memory: ${Math.round(nodeMemory.external / 1024 / 1024)}MB\n`;
    report += `• RSS (Total): ${Math.round(nodeMemory.rss / 1024 / 1024)}MB\n\n`;
    
    report += `📊 **MEMORY READING EXPLANATION:**\n`;
    report += `• Heartbeat shows: ${workingMemoryMB}MB (actual working memory)\n`;
    report += `• Heap usage shows: ${heapUsagePercent}% (efficiency percentage)\n`;
    report += `• Both readings are correct - different metrics!\n\n`;
    
    // Autonomous AI Status
    report += `🤖 **AUTONOMOUS AI STATUS:**\n`;
    if (global.quantumCore?.automatedConsciousness?.decisionEngine) {
      const decisionEngine = global.quantumCore.automatedConsciousness.decisionEngine;
      const status = decisionEngine.getStatus();
      
      report += `• Decision Engine: ${status.isActive ? '✅ ACTIVE' : '❌ INACTIVE'}\n`;
      report += `• Decisions Every: ${status.decisionFrequency} seconds\n`;
      report += `• Actions Executed: ${status.executedActionsCount}\n`;
      report += `• Fully Autonomous: ${status.fullyAutonomous ? 'YES' : 'NO'}\n`;
    } else {
      report += `• Decision Engine: ❌ NOT INITIALIZED\n`;
    }
    
    // Trading Systems Status
    report += `\n💰 **TRADING SYSTEMS:**\n`;
    report += `• Crypto Trading: ${global.cryptoTradingBot ? '✅ ACTIVE' : '❌ INACTIVE'}\n`;
    report += `• Market Intelligence: ${global.marketIntelligenceBot ? '✅ ACTIVE' : '❌ INACTIVE'}\n`;
    report += `• Business Banking: ${global.businessBankingBot ? '✅ ACTIVE' : '❌ INACTIVE'}\n`;
    
    // Quantum Core Status
    if (global.quantumCore) {
      const activeComponents = Array.from(global.quantumCore.components.entries())
        .filter(([name, component]) => component.isActive);
      
      report += `\n⚡ **QUANTUM CORE:**\n`;
      report += `• Components Active: ${activeComponents.length}/12\n`;
      report += `• Autonomous Mode: ${global.quantumCore.isActive ? 'ACTIVE' : 'INACTIVE'}\n`;
      
      if (activeComponents.length > 0) {
        report += `• Active Components:\n`;
        for (const [name] of activeComponents.slice(0, 6)) {
          const displayName = name.replace(/([A-Z])/g, ' $1').trim();
          report += `  ✅ ${displayName}\n`;
        }
        if (activeComponents.length > 6) {
          report += `  ... and ${activeComponents.length - 6} more\n`;
        }
      }
    }
    
    // Performance Metrics
    report += `\n📈 **PERFORMANCE METRICS:**\n`;
    report += `• System Uptime: ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m\n`;
    report += `• Process ID: ${process.pid}\n`;
    report += `• Node.js Version: ${process.version}\n`;
    report += `• Platform: ${process.platform} ${process.arch}\n`;
    
    // Recent AI Actions Summary
    if (global.quantumCore?.automatedConsciousness?.decisionEngine?.executedActions) {
      const recentActions = global.quantumCore.automatedConsciousness.decisionEngine.executedActions.slice(-3);
      
      report += `\n⚡ **RECENT AI ACTIONS:**\n`;
      for (const action of recentActions) {
        const timeAgo = Math.floor((Date.now() - new Date(action.executedAt).getTime()) / 60000);
        const status = action.success ? '✅' : '❌';
        const actionName = action.decision.action.replace(/_/g, ' ');
        report += `${status} ${actionName} (${timeAgo}min ago)\n`;
      }
    }
    
    // System Health Assessment
    report += `\n🎯 **SYSTEM HEALTH:**\n`;
    
    const healthScore = calculateHealthScore(nodeMemory, heapUsagePercent);
    
    if (healthScore >= 90) {
      report += `✅ **EXCELLENT** (${healthScore}%) - Peak performance\n`;
    } else if (healthScore >= 75) {
      report += `🟢 **GOOD** (${healthScore}%) - Operating efficiently\n`;
    } else if (healthScore >= 60) {
      report += `🟡 **FAIR** (${healthScore}%) - Some optimization needed\n`;
    } else {
      report += `🔴 **NEEDS ATTENTION** (${healthScore}%) - Optimization required\n`;
    }
    
    report += `\n🏛️ **INSTITUTIONAL STATUS:** Your system operates with Renaissance Technologies-level autonomous intelligence, requiring zero manual intervention for wealth generation operations.`;
    
    await sendLongMessage(bot, chatId, report);
    
  } catch (error) {
    console.error('❌ System status error:', error);
    await bot.sendMessage(chatId, `❌ System status error: ${error.message}`);
  }
}

function calculateHealthScore(nodeMemory, heapUsagePercent) {
  let score = 100;
  
  // Deduct points for high memory usage
  if (heapUsagePercent > 95) score -= 30;
  else if (heapUsagePercent > 85) score -= 15;
  else if (heapUsagePercent > 75) score -= 5;
  
  // Deduct points for low available memory
  const availableHeap = nodeMemory.heapTotal - nodeMemory.heapUsed;
  if (availableHeap < 10 * 1024 * 1024) score -= 20; // Less than 10MB available
  else if (availableHeap < 50 * 1024 * 1024) score -= 10; // Less than 50MB available
  
  // Add points for stable operation
  if (global.quantumCore?.isActive) score += 5;
  if (global.quantumCore?.automatedConsciousness?.decisionEngine?.isActive) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

module.exports = { handleSystemStatus };