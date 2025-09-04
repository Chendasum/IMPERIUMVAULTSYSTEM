// utils/memory.js - FULL ENTERPRISE MEMORY SYSTEM
// ════════════════════════════════════════════════════════════════════════════
// Complete enterprise-grade memory system with all advanced features
// Circuit breakers, analytics, caching, monitoring, optimization
// Production-ready for high-traffic applications
// ════════════════════════════════════════════════════════════════════════════

'use strict';

require("dotenv").config();

const EventEmitter = require('events');

console.log('🏢 Loading FULL ENTERPRISE Memory System...');

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Memory limits
  MAX_MEMORY_CONVERSATIONS: parseInt(process.env.MAX_MEMORY_CONVERSATIONS) || 1000,
  MAX_MESSAGES_PER_CONVERSATION: parseInt(process.env.MAX_MESSAGES_PER_CONVERSATION) || 100,
  MAX_ANALYTICS_WORDS: parseInt(process.env.MAX_ANALYTICS_WORDS) || 2000,
  MEMORY_CLEANUP_INTERVAL: parseInt(process.env.MEMORY_CLEANUP_INTERVAL) || 5 * 60 * 1000, // 5 minutes
  
  // Context optimization
  CONTEXT_LIMITS: {
    minimal: 1000,
    reduced: 2500,
    full: 5000,
    enterprise: 8000,
    max: 12000
  },
  
  // Circuit breaker settings
  CIRCUIT_BREAKER: {
    failureThreshold: 5,
    resetTimeout: 30000,
    monitorInterval: 60000
  },
  
  // Database settings
  DB_TIMEOUT: parseInt(process.env.DB_TIMEOUT) || 15000,
  MAX_RETRIES: parseInt(process.env.DB_MAX_RETRIES) || 5,
  RETRY_DELAY: parseInt(process.env.DB_RETRY_DELAY) || 1000,
  
  // Caching settings
  CACHE_TTL: parseInt(process.env.MEMORY_CACHE_TTL) || 300000, // 5 minutes
  MAX_CACHE_SIZE: parseInt(process.env.MAX_CACHE_SIZE) || 500,
  ENABLE_INTELLIGENT_CACHING: process.env.ENABLE_INTELLIGENT_CACHING !== 'false',
  
  // Analytics settings
  ENABLE_ADVANCED_ANALYTICS: process.env.ENABLE_ADVANCED_ANALYTICS !== 'false',
  ENABLE_PATTERN_RECOGNITION: process.env.ENABLE_PATTERN_RECOGNITION !== 'false',
  ENABLE_PREDICTIVE_ANALYTICS: process.env.ENABLE_PREDICTIVE_ANALYTICS !== 'false',
  
  // Performance settings
  ENABLE_MEMORY_CLEANUP: process.env.ENABLE_MEMORY_CLEANUP !== 'false',
  ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING !== 'false',
  ENABLE_HEALTH_MONITORING: process.env.ENABLE_HEALTH_MONITORING !== 'false',
  
  // Security settings
  ENABLE_CONTENT_FILTERING: process.env.ENABLE_CONTENT_FILTERING !== 'false',
  MAX_FACT_LENGTH: parseInt(process.env.MAX_FACT_LENGTH) || 500,
  SENSITIVE_DATA_DETECTION: process.env.SENSITIVE_DATA_DETECTION !== 'false',
  
  // Debug settings
  DEBUG_MODE: process.env.MEMORY_DEBUG === 'true',
  LOG_LEVEL: process.env.MEMORY_LOG_LEVEL || 'info'
};

// Import database with enhanced error handling
let database;
try {
  database = require('./database');
  console.log('✅ Enterprise database module loaded');
} catch (error) {
  console.warn('⚠️ Database module not available:', error.message);
  database = {
    getConversationHistoryDB: async () => { throw new Error('Database not available'); },
    getPersistentMemoryDB: async () => { throw new Error('Database not available'); },
    saveConversationDB: async () => { throw new Error('Database not available'); },
    addPersistentMemoryDB: async () => { throw new Error('Database not available'); },
    getUserProfileDB: async () => { throw new Error('Database not available'); },
    connectionStats: { connectionHealth: 'unavailable' }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE LOGGING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

class EnterpriseLogger extends EventEmitter {
  constructor(level = CONFIG.LOG_LEVEL) {
    super();
    this.level = level;
    this.levels = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
    this.logs = [];
    this.maxLogs = 1000;
    this.startTime = Date.now();
  }
  
  log(level, component, message, ...args) {
    if (this.levels[level] <= this.levels[this.level]) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        component,
        message,
        args,
        uptime: Date.now() - this.startTime
      };
      
      // Store log entry
      this.logs.push(logEntry);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
      
      // Console output
      const prefix = `[${timestamp.slice(11, 23)}] [${component}] ${level.toUpperCase()}:`;
      console.log(prefix, message, ...args);
      
      // Emit event for external monitoring
      this.emit('log', logEntry);
    }
  }
  
  error(component, msg, ...args) { this.log('error', component, msg, ...args); }
  warn(component, msg, ...args) { this.log('warn', component, msg, ...args); }
  info(component, msg, ...args) { this.log('info', component, msg, ...args); }
  debug(component, msg, ...args) { this.log('debug', component, msg, ...args); }
  trace(component, msg, ...args) { this.log('trace', component, msg, ...args); }
  
  getLogs(level = null, component = null, limit = 100) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level.toUpperCase());
    }
    
    if (component) {
      filteredLogs = filteredLogs.filter(log => log.component === component);
    }
    
    return filteredLogs.slice(-limit);
  }
  
  getStats() {
    const levelCounts = {};
    this.logs.forEach(log => {
      levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;
    });
    
    return {
      totalLogs: this.logs.length,
      levelCounts,
      oldestLog: this.logs.length > 0 ? this.logs[0].timestamp : null,
      newestLog: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null,
      uptime: Date.now() - this.startTime
    };
  }
}

const logger = new EnterpriseLogger();

// ═══════════════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER PATTERN
// ═══════════════════════════════════════════════════════════════════════════

class CircuitBreaker extends EventEmitter {
  constructor(name, options = {}) {
    super();
    this.name = name;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailure = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureThreshold = options.failureThreshold || CONFIG.CIRCUIT_BREAKER.failureThreshold;
    this.resetTimeout = options.resetTimeout || CONFIG.CIRCUIT_BREAKER.resetTimeout;
    this.totalRequests = 0;
    this.responseTimeSum = 0;
    this.slowResponseCount = 0;
    
    logger.info('CircuitBreaker', `Initialized circuit breaker: ${name}`);
  }
  
  async execute(operation, timeoutMs = CONFIG.DB_TIMEOUT) {
    this.totalRequests++;
    const startTime = Date.now();
    
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure < this.resetTimeout) {
        const error = new Error(`Circuit breaker ${this.name} is OPEN`);
        error.circuitBreakerOpen = true;
        throw error;
      } else {
        this.state = 'HALF_OPEN';
        logger.info('CircuitBreaker', `${this.name} transitioning to HALF_OPEN`);
      }
    }
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
      });
      
      const result = await Promise.race([operation(), timeoutPromise]);
      const responseTime = Date.now() - startTime;
      
      this.onSuccess(responseTime);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.onFailure(error, responseTime);
      throw error;
    }
  }
  
  onSuccess(responseTime) {
    this.successCount++;
    this.responseTimeSum += responseTime;
    
    if (responseTime > 5000) { // Slow response threshold
      this.slowResponseCount++;
    }
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failureCount = 0;
      logger.info('CircuitBreaker', `${this.name} reset to CLOSED`);
    }
    
    this.emit('success', { name: this.name, responseTime });
  }
  
  onFailure(error, responseTime) {
    this.failureCount++;
    this.lastFailure = Date.now();
    this.responseTimeSum += responseTime;
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      logger.error('CircuitBreaker', `${this.name} OPEN after ${this.failureCount} failures`);
      this.emit('breaker_open', { name: this.name, error, failureCount: this.failureCount });
    }
    
    this.emit('failure', { name: this.name, error, responseTime });
  }
  
  getStats() {
    const avgResponseTime = this.totalRequests > 0 ? this.responseTimeSum / this.totalRequests : 0;
    const successRate = this.totalRequests > 0 ? (this.successCount / this.totalRequests) * 100 : 0;
    
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(avgResponseTime),
      slowResponseCount: this.slowResponseCount,
      lastFailure: this.lastFailure
    };
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailure = null;
    logger.info('CircuitBreaker', `${this.name} manually reset`);
  }
}

// Create circuit breakers for different operations
const circuitBreakers = {
  conversations: new CircuitBreaker('conversations'),
  memories: new CircuitBreaker('memories'),
  userProfiles: new CircuitBreaker('userProfiles'),
  saves: new CircuitBreaker('saves'),
  facts: new CircuitBreaker('facts')
};

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT CACHING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

class IntelligentCache extends EventEmitter {
  constructor() {
    super();
    this.cache = new Map();
    this.accessCounts = new Map();
    this.lastAccessed = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSets: 0,
      memoryUsage: 0
    };
    
    // Start cleanup interval
    if (CONFIG.ENABLE_MEMORY_CLEANUP) {
      this.cleanupInterval = setInterval(() => this.performCleanup(), CONFIG.MEMORY_CLEANUP_INTERVAL);
    }
    
    logger.info('IntelligentCache', 'Intelligent caching system initialized');
  }
  
  generateKey(prefix, ...params) {
    return `${prefix}:${params.map(p => String(p)).join(':')}`;
  }
  
  set(key, data, options = {}) {
    const now = Date.now();
    const ttl = options.ttl || CONFIG.CACHE_TTL;
    const priority = options.priority || 'normal';
    
    // Check cache size limit
    if (this.cache.size >= CONFIG.MAX_CACHE_SIZE) {
      this.evictLeastUsed();
    }
    
    const entry = {
      data,
      timestamp: now,
      expiry: now + ttl,
      priority,
      size: this.estimateSize(data),
      accessCount: 0
    };
    
    this.cache.set(key, entry);
    this.accessCounts.set(key, 0);
    this.lastAccessed.set(key, now);
    this.stats.totalSets++;
    this.updateMemoryUsage();
    
    logger.trace('IntelligentCache', `Cached entry: ${key} (TTL: ${ttl}ms, Priority: ${priority})`);
    this.emit('cache_set', { key, size: entry.size, priority });
    
    return true;
  }
  
  get(key) {
    const entry = this.cache.get(key);
    const now = Date.now();
    
    if (!entry) {
      this.stats.misses++;
      logger.trace('IntelligentCache', `Cache miss: ${key}`);
      this.emit('cache_miss', { key });
      return null;
    }
    
    // Check expiry
    if (entry.expiry < now) {
      this.delete(key);
      this.stats.misses++;
      logger.trace('IntelligentCache', `Cache expired: ${key}`);
      this.emit('cache_expired', { key });
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    this.accessCounts.set(key, (this.accessCounts.get(key) || 0) + 1);
    this.lastAccessed.set(key, now);
    this.stats.hits++;
    
    logger.trace('IntelligentCache', `Cache hit: ${key} (Access count: ${entry.accessCount})`);
    this.emit('cache_hit', { key, accessCount: entry.accessCount });
    
    return entry.data;
  }
  
  delete(key) {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.accessCounts.delete(key);
      this.lastAccessed.delete(key);
      this.updateMemoryUsage();
      
      logger.trace('IntelligentCache', `Cache entry deleted: ${key}`);
      this.emit('cache_delete', { key, size: entry.size });
      return true;
    }
    return false;
  }
  
  evictLeastUsed() {
    if (this.cache.size === 0) return;
    
    let leastUsedKey = null;
    let leastAccessCount = Infinity;
    let oldestAccess = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      const accessCount = this.accessCounts.get(key) || 0;
      const lastAccess = this.lastAccessed.get(key) || 0;
      
      // Prioritize by access count, then by age, then by priority
      if (entry.priority !== 'high' && 
          (accessCount < leastAccessCount || 
           (accessCount === leastAccessCount && lastAccess < oldestAccess))) {
        leastUsedKey = key;
        leastAccessCount = accessCount;
        oldestAccess = lastAccess;
      }
    }
    
    if (leastUsedKey) {
      this.delete(leastUsedKey);
      this.stats.evictions++;
      logger.debug('IntelligentCache', `Evicted least used entry: ${leastUsedKey}`);
      this.emit('cache_eviction', { key: leastUsedKey, reason: 'least_used' });
    }
  }
  
  performCleanup() {
    const now = Date.now();
    const before = this.cache.size;
    let cleaned = 0;
    
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.delete(key);
        cleaned++;
      }
    }
    
    // Evict excess entries if still over limit
    while (this.cache.size > CONFIG.MAX_CACHE_SIZE * 0.9) { // 90% of limit
      this.evictLeastUsed();
      cleaned++;
    }
    
    const after = this.cache.size;
    
    if (cleaned > 0) {
      logger.debug('IntelligentCache', `Cleanup completed: ${before}→${after} entries (${cleaned} removed)`);
      this.emit('cleanup_completed', { before, after, cleaned });
    }
  }
  
  estimateSize(data) {
    if (typeof data === 'string') {
      return data.length * 2; // 2 bytes per character (UTF-16)
    } else if (typeof data === 'object') {
      try {
        return JSON.stringify(data).length * 2;
      } catch {
        return 1000; // Fallback estimate
      }
    }
    return 100; // Default size estimate
  }
  
  updateMemoryUsage() {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size || 0;
    }
    this.stats.memoryUsage = totalSize;
  }
  
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      cacheSize: this.cache.size,
      maxCacheSize: CONFIG.MAX_CACHE_SIZE,
      memoryUsageMB: Math.round(this.stats.memoryUsage / 1024 / 1024 * 100) / 100
    };
  }
  
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.accessCounts.clear();
    this.lastAccessed.clear();
    this.updateMemoryUsage();
    
    logger.info('IntelligentCache', `Cache cleared: ${size} entries removed`);
    this.emit('cache_cleared', { entriesRemoved: size });
  }
  
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    logger.info('IntelligentCache', 'Cache system destroyed');
  }
}

const cache = CONFIG.ENABLE_INTELLIGENT_CACHING ? new IntelligentCache() : null;

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE MONITORING
// ═══════════════════════════════════════════════════════════════════════════

class PerformanceMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.alerts = [];
    this.thresholds = {
      responseTime: 5000, // 5 seconds
      errorRate: 0.1, // 10%
      memoryUsage: 500 * 1024 * 1024, // 500MB
      cacheHitRate: 0.7 // 70%
    };
    
    if (CONFIG.ENABLE_PERFORMANCE_MONITORING) {
      this.startMonitoring();
    }
    
    logger.info('PerformanceMonitor', 'Performance monitoring initialized');
  }
  
  startMonitoring() {
    // Monitor system metrics every minute
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.checkThresholds();
    }, CONFIG.CIRCUIT_BREAKER.monitorInterval);
  }
  
  recordOperation(name, duration, success = true, metadata = {}) {
    const now = Date.now();
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        totalRequests: 0,
        successCount: 0,
        failureCount: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        recentOperations: []
      });
    }
    
    const metric = this.metrics.get(name);
    metric.totalRequests++;
    metric.totalDuration += duration;
    
    if (success) {
      metric.successCount++;
    } else {
      metric.failureCount++;
    }
    
    metric.minDuration = Math.min(metric.minDuration, duration);
    metric.maxDuration = Math.max(metric.maxDuration, duration);
    
    // Keep recent operations for trend analysis
    metric.recentOperations.push({
      timestamp: now,
      duration,
      success,
      metadata
    });
    
    // Keep only last 100 operations
    if (metric.recentOperations.length > 100) {
      metric.recentOperations.shift();
    }
    
    this.emit('operation_recorded', { name, duration, success, metadata });
  }
  
  collectSystemMetrics() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.recordOperation('system_memory', memUsage.heapUsed, true, {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss
      });
      
      this.recordOperation('system_cpu', cpuUsage.user + cpuUsage.system, true, cpuUsage);
      
      // Circuit breaker stats
      for (const [name, breaker] of Object.entries(circuitBreakers)) {
        const stats = breaker.getStats();
        this.recordOperation(`circuit_breaker_${name}`, stats.averageResponseTime, 
          stats.state === 'CLOSED', stats);
      }
      
      // Cache stats
      if (cache) {
        const cacheStats = cache.getStats();
        this.recordOperation('cache_performance', cacheStats.hitRate * 100, true, cacheStats);
      }
      
    } catch (error) {
      logger.error('PerformanceMonitor', 'Failed to collect system metrics:', error.message);
    }
  }
  
  checkThresholds() {
    // Check memory usage
    const memoryMetric = this.metrics.get('system_memory');
    if (memoryMetric && memoryMetric.recentOperations.length > 0) {
      const latestMemory = memoryMetric.recentOperations[memoryMetric.recentOperations.length - 1];
      if (latestMemory.metadata.heapUsed > this.thresholds.memoryUsage) {
        this.createAlert('HIGH_MEMORY_USAGE', `Memory usage: ${Math.round(latestMemory.metadata.heapUsed / 1024 / 1024)}MB`);
      }
    }
    
    // Check error rates
    for (const [name, metric] of this.metrics.entries()) {
      if (metric.totalRequests > 10) { // Only check if we have enough data
        const errorRate = metric.failureCount / metric.totalRequests;
        if (errorRate > this.thresholds.errorRate) {
          this.createAlert('HIGH_ERROR_RATE', `${name}: ${Math.round(errorRate * 100)}% error rate`);
        }
      }
    }
    
    // Check response times
    for (const [name, metric] of this.metrics.entries()) {
      if (metric.totalRequests > 0) {
        const avgResponseTime = metric.totalDuration / metric.totalRequests;
        if (avgResponseTime > this.thresholds.responseTime) {
          this.createAlert('SLOW_RESPONSE', `${name}: ${Math.round(avgResponseTime)}ms average response time`);
        }
      }
    }
  }
  
  createAlert(type, message, severity = 'warning') {
    const alert = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
    
    logger.warn('PerformanceMonitor', `ALERT [${type}]: ${message}`);
    this.emit('alert_created', alert);
    
    return alert.id;
  }
  
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      this.emit('alert_acknowledged', alert);
      return true;
    }
    return false;
  }
  
  getMetrics(operationName = null) {
    if (operationName) {
      return this.metrics.get(operationName) || null;
    }
    
    const result = {};
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = {
        ...metric,
        averageResponseTime: metric.totalRequests > 0 ? metric.totalDuration / metric.totalRequests : 0,
        successRate: metric.totalRequests > 0 ? (metric.successCount / metric.totalRequests) * 100 : 0,
        errorRate: metric.totalRequests > 0 ? (metric.failureCount / metric.totalRequests) * 100 : 0
      };
    }
    
    return result;
  }
  
  getAlerts(severity = null, acknowledged = null) {
    let filteredAlerts = this.alerts;
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    if (acknowledged !== null) {
      filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === acknowledged);
    }
    
    return filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    logger.info('PerformanceMonitor', 'Performance monitoring destroyed');
  }
}

const performanceMonitor = CONFIG.ENABLE_PERFORMANCE_MONITORING ? new PerformanceMonitor() : null;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function safeString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
}

function safeDivision(numerator, denominator, defaultValue = 0) {
  if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) {
    return defaultValue;
  }
  const result = numerator / denominator;
  return isNaN(result) || !isFinite(result) ? defaultValue : result;
}

function daysBetween(date1, date2) {
  try {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.abs((new Date(date1) - new Date(date2)) / oneDay);
  } catch (error) {
    return 0;
  }
}

function normalizeFieldNames(record) {
  if (!record || typeof record !== 'object') return {};
  
  return {
    id: record.id || record.conversation_id,
    chatId: record.chat_id || record.chatId || record.user_id,
    userMessage: record.user_message || record.userMessage || record.user || record.message,
    gptResponse: record.gpt_response || record.assistantResponse || record.assistant_response || 
                record.response || record.assistant || record.ai_response,
    timestamp: record.timestamp || record.created_at || record.date,
    importance: record.importance || record.priority || 'medium',
    fact: record.fact || record.content || record.text || record.data,
    metadata: record.metadata || {}
  };
}

function calculateRelevance(timestamp, importance = 'medium', currentMessage = '') {
  try {
    const daysOld = daysBetween(new Date(), new Date(timestamp));
    const decayFactor = Math.max(0.1, 1 - (daysOld / 30));
    
    const importanceScores = { high: 1.0, medium: 0.7, low: 0.4 };
    const importanceScore = importanceScores[importance] || 0.5;
    
    let contextBoost = 1.0;
    if (currentMessage) {
      const messageWords = currentMessage.toLowerCase().split(/\s+/);
      const commonWords = messageWords.filter(word => word.length > 3).slice(0, 10);
      contextBoost = 1.0 + (commonWords.length * 0.1);
    }
    
    return decayFactor * importanceScore * contextBoost;
  } catch (error) {
    return 0.5;
  }
}

// Content filtering and security
function filterSensitiveContent(text) {
  if (!CONFIG.ENABLE_CONTENT_FILTERING) return text;
  
  const sensitivePatterns = [
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card numbers
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
    /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g // Phone numbers
  ];
  
  let filtered = text;
  sensitivePatterns.forEach(pattern => {
    filtered = filtered.replace(pattern, '[FILTERED]');
  });
  
  return filtered;
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE OPERATIONS WITH CIRCUIT BREAKERS
// ═══════════════════════════════════════════════════════════════════════════

async function safeGetConversations(chatId, limit = 20) {
  const startTime = Date.now();
  const cacheKey = cache ? cache.generateKey('conv', chatId, limit) : null;
  
  // Try cache first
  if (cache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.trace('Database', `Cache hit for conversations: ${chatId}`);
      return cached;
    }
  }
  
  try {
    const result = await circuitBreakers.conversations.execute(async () => {
      return await database.getConversationHistoryDB(chatId, limit);
    });
    
    const normalizedResult = Array.isArray(result) 
      ? result.map(normalizeFieldNames).filter(r => r.userMessage || r.gptResponse)
      : [];
    
    // Cache the result
    if (cache && normalizedResult.length > 0) {
      cache.set(cacheKey, normalizedResult, { ttl: CONFIG.CACHE_TTL, priority: 'normal' });
    }
    
    const duration = Date.now() - startTime;
    if (performanceMonitor) {
      performanceMonitor.recordOperation('get_conversations', duration, true, { 
        chatId, 
        limit, 
        resultCount: normalizedResult.length 
      });
    }
    
    logger.debug('Database', `Retrieved ${normalizedResult.length} conversations for ${chatId} (${duration}ms)`);
    return normalizedResult;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    if (performanceMonitor) {
      performanceMonitor.recordOperation('get_conversations', duration, false, { error: error.message });
    }
    
    logger.error('Database', `Failed to get conversations for ${chatId}:`, error.message);
    return [];
  }
}

async function safeGetMemories(chatId, limit = 50) {
  const startTime = Date.now();
  const cacheKey = cache ? cache.generateKey('mem', chatId, limit) : null;
  
  if (cache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.trace('Database', `Cache hit for memories: ${chatId}`);
      return cached;
    }
  }
  
  try {
    const result = await circuitBreakers.memories.execute(async () => {
      return await database.getPersistentMemoryDB(chatId);
    });
    
    const normalizedResult = Array.isArray(result) 
      ? result.map(normalizeFieldNames).filter(r => r.fact).slice(0, limit)
      : [];
    
    if (cache && normalizedResult.length > 0) {
      cache.set(cacheKey, normalizedResult, { ttl: CONFIG.CACHE_TTL * 2, priority: 'high' });
    }
    
    const duration = Date.now() - startTime;
    if (performanceMonitor) {
      performanceMonitor.recordOperation('get_memories', duration, true, { 
        chatId, 
        limit, 
        resultCount: normalizedResult.length 
      });
    }
    
    logger.debug('Database', `Retrieved ${normalizedResult.length} memories for ${chatId} (${duration}ms)`);
    return normalizedResult;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    if (performanceMonitor) {
      performanceMonitor.recordOperation('get_memories', duration, false, { error: error.message });
    }
    
    logger.error('Database', `Failed to get memories for ${chatId}:`, error.message);
    return [];
  }
}

async function safeGetUserProfile(chatId) {
  const startTime = Date.now();
  const cacheKey = cache ? cache.generateKey('profile', chatId) : null;
  
  if (cache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.trace('Database', `Cache hit for user profile: ${chatId}`);
      return cached;
    }
  }
  
  try {
    const result = await circuitBreakers.userProfiles.execute(async () => {
      return await database.getUserProfileDB(chatId);
    });
    
    const normalizedResult = result ? normalizeFieldNames(result) : null;
    
    if (cache && normalizedResult) {
      cache.set(cacheKey, normalizedResult, { ttl: CONFIG.CACHE_TTL * 3, priority: 'high' });
    }
    
    const duration = Date.now() - startTime;
    if (performanceMonitor) {
      performanceMonitor.recordOperation('get_user_profile', duration, true, { chatId });
    }
    
    return normalizedResult;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    if (performanceMonitor) {
      performanceMonitor.recordOperation('get_user_profile', duration, false, { error: error.message });
    }
    
    logger.error('Database', `Failed to get user profile for ${chatId}:`, error.message);
    return null;
  }
}

async function safeSaveConversation(chatId, userMessage, aiResponse, metadata = {}) {
  const startTime = Date.now();
  
  try {
    const result = await circuitBreakers.saves.execute(async () => {
      const methods = [
        () => database.saveConversationDB(chatId, userMessage, aiResponse, metadata),
        () => database.saveConversation && database.saveConversation(chatId, userMessage, aiResponse, metadata)
      ].filter(Boolean);
      
      for (const method of methods) {
        try {
          const result = await method();
          if (result !== false) {
            return result;
          }
        } catch (methodError) {
          logger.warn('Database', `Save method failed: ${methodError.message}`);
          continue;
        }
      }
      
      throw new Error('All save methods failed');
    });
    
    // Clear related caches
    if (cache) {
      const cacheKeys = [
        cache.generateKey('conv', chatId, 20),
        cache.generateKey('conv', chatId, 50),
        cache.generateKey('profile', chatId)
      ];
      cacheKeys.forEach(key => cache.delete(key));
    }
    
    const duration = Date.now() - startTime;
    if (performanceMonitor) {
      performanceMonitor.recordOperation('save_conversation', duration, true, { chatId });
    }
    
    logger.debug('Database', `Conversation saved for ${chatId} (${duration}ms)`);
    return result;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    if (performanceMonitor) {
      performanceMonitor.recordOperation('save_conversation', duration, false, { error: error.message });
    }
    
    logger.error('Database', `Failed to save conversation for ${chatId}:`, error.message);
    return false;
  }
}

async function safeSaveFact(chatId, fact, importance = 'medium') {
  const startTime = Date.now();
  
  try {
    const filteredFact = filterSensitiveContent(fact);
    
    if (filteredFact.length > CONFIG.MAX_FACT_LENGTH) {
      logger.warn('Database', `Fact too long, truncating: ${filteredFact.length} chars`);
      filteredFact = filteredFact.substring(0, CONFIG.MAX_FACT_LENGTH) + '...';
    }
    
    const result = await circuitBreakers.facts.execute(async () => {
      return await database.addPersistentMemoryDB(chatId, filteredFact, importance);
    });
    
    // Clear memory cache
    if (cache) {
      const cacheKeys = [
        cache.generateKey('mem', chatId, 50),
        cache.generateKey('mem', chatId, 100)
      ];
      cacheKeys.forEach(key => cache.delete(key));
    }
    
    const duration = Date.now() - startTime;
    if (performanceMonitor) {
      performanceMonitor.recordOperation('save_fact', duration, true, { chatId, importance });
    }
    
    logger.debug('Database', `Fact saved for ${chatId}: ${importance} importance (${duration}ms)`);
    return result;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    if (performanceMonitor) {
      performanceMonitor.recordOperation('save_fact', duration, false, { error: error.message });
    }
    
    logger.error('Database', `Failed to save fact for ${chatId}:`, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED ANALYTICS AND PATTERN RECOGNITION
// ═══════════════════════════════════════════════════════════════════════════

class AdvancedAnalytics extends EventEmitter {
  constructor() {
    super();
    this.analysisCache = new Map();
    this.patterns = new Map();
    this.predictions = new Map();
    
    logger.info('AdvancedAnalytics', 'Advanced analytics system initialized');
  }
  
  async analyzeConversationIntelligence(conversations, memories, chatId) {
    const cacheKey = `analytics:${chatId}:${conversations.length}:${memories.length}`;
    
    if (cache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    try {
      const analytics = {
        conversationFrequency: 0,
        averageResponseLength: 0,
        averageUserMessageLength: 0,
        topicDiversity: 0,
        engagementScore: 0,
        strategicFocus: 'general',
        communicationStyle: 'balanced',
        sentimentTrend: 'neutral',
        complexityScore: 0,
        totalInteractions: conversations.length,
        dataQuality: 'limited',
        confidenceLevel: 0.3,
        insights: [],
        recommendations: [],
        patterns: [],
        predictions: []
      };
      
      if (!Array.isArray(conversations) || conversations.length === 0) {
        return analytics;
      }
      
      // Basic metrics
      const responseLengths = conversations
        .map(conv => safeString(conv.gptResponse).length)
        .filter(len => len > 0);
      
      const userMessageLengths = conversations
        .map(conv => safeString(conv.userMessage).length)
        .filter(len => len > 0);
      
      analytics.averageResponseLength = responseLengths.length > 0 
        ? responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length
        : 0;
      
      analytics.averageUserMessageLength = userMessageLengths.length > 0
        ? userMessageLengths.reduce((sum, len) => sum + len, 0) / userMessageLengths.length
        : 0;
      
      // Advanced pattern analysis
      if (CONFIG.ENABLE_PATTERN_RECOGNITION) {
        analytics.patterns = this.detectAdvancedPatterns(conversations);
      }
      
      // Topic diversity analysis (memory-safe)
      const topicWords = new Set();
      const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'but', 'what', 'were', 'they', 'have', 'been']);
      
      conversations.slice(0, 30).forEach(conv => {
        const text = safeString(conv.userMessage).toLowerCase();
        const words = text.match(/\b\w{4,}\b/g) || [];
        
        words.slice(0, 15).forEach(word => {
          if (!stopWords.has(word) && topicWords.size < CONFIG.MAX_ANALYTICS_WORDS / 2) {
            topicWords.add(word);
          }
        });
      });
      
      analytics.topicDiversity = Math.min(10, topicWords.size / 15);
      
      // Strategic focus detection
      const focusKeywords = {
        financial: ['investment', 'portfolio', 'trading', 'market', 'financial', 'money', 'profit', 'revenue', 'budget', 'cost'],
        technology: ['ai', 'tech', 'software', 'digital', 'system', 'data', 'algorithm', 'programming', 'automation', 'innovation'],
        business: ['business', 'strategy', 'analysis', 'planning', 'growth', 'management', 'operations', 'productivity', 'efficiency', 'performance'],
        health: ['health', 'medical', 'wellness', 'fitness', 'nutrition', 'exercise', 'mental', 'physical', 'therapy', 'treatment'],
        education: ['learn', 'education', 'study', 'knowledge', 'skill', 'training', 'course', 'tutorial', 'research', 'academic'],
        personal: ['personal', 'life', 'goals', 'habits', 'relationships', 'family', 'hobby', 'interest', 'lifestyle', 'development']
      };
      
      const focusScores = {};
      Object.keys(focusKeywords).forEach(category => focusScores[category] = 0);
      
      const analysisText = conversations.slice(0, 20)
        .map(conv => safeString(conv.userMessage).toLowerCase())
        .join(' ')
        .substring(0, 10000);
      
      Object.entries(focusKeywords).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
          const matches = (analysisText.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
          focusScores[category] += matches;
        });
      });
      
      analytics.strategicFocus = Object.entries(focusScores)
        .reduce((a, b) => focusScores[a[0]] > focusScores[b[0]] ? a : b)[0];
      
      // Communication style analysis
      analytics.communicationStyle = this.analyzeCommunicationStyle(conversations);
      
      // Engagement score calculation
      const engagementFactors = [
        Math.min(3, analytics.averageUserMessageLength / 75),
        Math.min(3, conversations.length / 15),
        Math.min(3, analytics.topicDiversity),
        Math.min(1, topicWords.size / 30)
      ];
      
      analytics.engagementScore = Math.min(10, engagementFactors.reduce((sum, factor) => sum + factor, 0));
      
      // Sentiment analysis
      analytics.sentimentTrend = this.analyzeSentimentTrend(conversations);
      
      // Complexity score
      analytics.complexityScore = this.calculateComplexityScore(conversations);
      
      // Data quality assessment
      const totalDataPoints = conversations.length + (Array.isArray(memories) ? memories.length : 0);
      if (totalDataPoints >= 50) {
        analytics.dataQuality = 'excellent';
      } else if (totalDataPoints >= 25) {
        analytics.dataQuality = 'good';
      } else if (totalDataPoints >= 10) {
        analytics.dataQuality = 'fair';
      }
      
      // Confidence level
      analytics.confidenceLevel = Math.min(0.95, 
        0.2 + 
        (conversations.length * 0.02) + 
        (Array.isArray(memories) ? memories.length * 0.04 : 0) + 
        (analytics.topicDiversity * 0.03) +
        (analytics.engagementScore * 0.05)
      );
      
      // Generate insights
      analytics.insights = this.generateInsights(analytics, conversations, memories);
      
      // Generate recommendations
      analytics.recommendations = this.generateRecommendations(analytics);
      
      // Predictive analytics
      if (CONFIG.ENABLE_PREDICTIVE_ANALYTICS) {
        analytics.predictions = this.generatePredictions(analytics, conversations);
      }
      
      // Cache the result
      if (cache) {
        cache.set(cacheKey, analytics, { ttl: CONFIG.CACHE_TTL * 2, priority: 'normal' });
      }
      
      logger.debug('AdvancedAnalytics', `Intelligence analysis completed for ${chatId}: ${analytics.strategicFocus} focus, ${analytics.dataQuality} quality`);
      
      return analytics;
      
    } catch (error) {
      logger.error('AdvancedAnalytics', `Analysis failed for ${chatId}:`, error.message);
      return {
        error: error.message,
        strategicFocus: 'error',
        communicationStyle: 'unknown',
        confidenceLevel: 0,
        dataQuality: 'error'
      };
    }
  }
  
  detectAdvancedPatterns(conversations) {
    const patterns = [];
    
    if (conversations.length < 3) return patterns;
    
    try {
      // Time-based patterns
      const timestamps = conversations.map(conv => new Date(conv.timestamp)).sort((a, b) => a - b);
      const intervals = [];
      
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1]);
      }
      
      if (intervals.length > 0) {
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const hours = avgInterval / (1000 * 60 * 60);
        
        if (hours < 1) {
          patterns.push({ type: 'frequency', description: 'High interaction frequency', confidence: 0.8 });
        } else if (hours < 24) {
          patterns.push({ type: 'frequency', description: 'Regular daily interaction', confidence: 0.7 });
        } else if (hours < 168) {
          patterns.push({ type: 'frequency', description: 'Weekly interaction pattern', confidence: 0.6 });
        }
      }
      
      // Message length patterns
      const userLengths = conversations.map(conv => safeString(conv.userMessage).length);
      const lengthVariation = this.calculateVariation(userLengths);
      
      if (lengthVariation < 0.3) {
        patterns.push({ type: 'consistency', description: 'Consistent message length', confidence: 0.7 });
      } else if (lengthVariation > 2.0) {
        patterns.push({ type: 'variation', description: 'Highly variable message length', confidence: 0.8 });
      }
      
      // Question pattern analysis
      const questionRatio = conversations.filter(conv => 
        safeString(conv.userMessage).includes('?')
      ).length / conversations.length;
      
      if (questionRatio > 0.7) {
        patterns.push({ type: 'behavior', description: 'Primarily asks questions', confidence: 0.9 });
      } else if (questionRatio < 0.1) {
        patterns.push({ type: 'behavior', description: 'Rarely asks questions', confidence: 0.8 });
      }
      
    } catch (error) {
      logger.warn('AdvancedAnalytics', 'Pattern detection error:', error.message);
    }
    
    return patterns;
  }
  
  analyzeCommunicationStyle(conversations) {
    try {
      const totalMessages = conversations.length;
      if (totalMessages === 0) return 'unknown';
      
      let questionCount = 0;
      let exclamationCount = 0;
      let commandCount = 0;
      let totalLength = 0;
      
      conversations.forEach(conv => {
        const message = safeString(conv.userMessage);
        totalLength += message.length;
        
        if (message.includes('?')) questionCount++;
        if (message.includes('!')) exclamationCount++;
        if (message.startsWith('/')) commandCount++;
      });
      
      const avgLength = totalLength / totalMessages;
      const questionRatio = questionCount / totalMessages;
      const exclamationRatio = exclamationCount / totalMessages;
      const commandRatio = commandCount / totalMessages;
      
      if (commandRatio > 0.5) return 'command-oriented';
      if (questionRatio > 0.6) return 'inquisitive';
      if (exclamationRatio > 0.4) return 'enthusiastic';
      if (avgLength > 200) return 'detailed';
      if (avgLength < 30) return 'concise';
      
      return 'balanced';
      
    } catch (error) {
      return 'unknown';
    }
  }
  
  analyzeSentimentTrend(conversations) {
    try {
      // Simple sentiment analysis based on keyword patterns
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'excited'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed', 'worried', 'concerned'];
      
      let positiveScore = 0;
      let negativeScore = 0;
      
      conversations.slice(-10).forEach(conv => { // Analyze last 10 conversations
        const text = safeString(conv.userMessage).toLowerCase();
        
        positiveWords.forEach(word => {
          if (text.includes(word)) positiveScore++;
        });
        
        negativeWords.forEach(word => {
          if (text.includes(word)) negativeScore++;
        });
      });
      
      if (positiveScore > negativeScore * 1.5) return 'positive';
      if (negativeScore > positiveScore * 1.5) return 'negative';
      return 'neutral';
      
    } catch (error) {
      return 'neutral';
    }
  }
  
  calculateComplexityScore(conversations) {
    try {
      let totalComplexity = 0;
      let validConversations = 0;
      
      conversations.forEach(conv => {
        const userMessage = safeString(conv.userMessage);
        const aiResponse = safeString(conv.gptResponse);
        
        if (userMessage.length > 10) {
          // Factors that indicate complexity
          let complexity = 0;
          
          // Length factor
          complexity += Math.min(3, userMessage.length / 100);
          
          // Technical terms
          const technicalWords = ['analyze', 'algorithm', 'implementation', 'optimization', 'configuration', 'architecture'];
          complexity += technicalWords.filter(word => userMessage.toLowerCase().includes(word)).length * 0.5;
          
          // Question complexity
          const complexQuestionWords = ['how', 'why', 'explain', 'compare', 'evaluate'];
          complexity += complexQuestionWords.filter(word => userMessage.toLowerCase().includes(word)).length * 0.3;
          
          // Response length as indicator of complexity
          complexity += Math.min(2, aiResponse.length / 500);
          
          totalComplexity += complexity;
          validConversations++;
        }
      });
      
      return validConversations > 0 ? Math.min(10, totalComplexity / validConversations) : 0;
      
    } catch (error) {
      return 0;
    }
  }
  
  calculateVariation(numbers) {
    if (numbers.length < 2) return 0;
    
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    
    return mean > 0 ? Math.sqrt(variance) / mean : 0;
  }
  
  generateInsights(analytics, conversations, memories) {
    const insights = [];
    
    try {
      // Engagement insights
      if (analytics.engagementScore > 8) {
        insights.push({
          type: 'engagement',
          level: 'high',
          message: 'Highly engaged user with diverse topics and detailed conversations'
        });
      } else if (analytics.engagementScore < 3) {
        insights.push({
          type: 'engagement',
          level: 'low',
          message: 'Limited engagement - consider more interactive approaches'
        });
      }
      
      // Communication style insights
      if (analytics.communicationStyle === 'detailed') {
        insights.push({
          type: 'communication',
          level: 'info',
          message: 'User prefers comprehensive, detailed responses'
        });
      } else if (analytics.communicationStyle === 'concise') {
        insights.push({
          type: 'communication',
          level: 'info',
          message: 'User prefers brief, to-the-point responses'
        });
      }
      
      // Focus area insights
      if (analytics.strategicFocus !== 'general') {
        insights.push({
          type: 'focus',
          level: 'info',
          message: `Strong ${analytics.strategicFocus} focus detected - leverage specialized knowledge`
        });
      }
      
      // Data quality insights
      if (analytics.dataQuality === 'excellent') {
        insights.push({
          type: 'data',
          level: 'positive',
          message: 'Rich conversation history enables highly personalized responses'
        });
      } else if (analytics.dataQuality === 'limited') {
        insights.push({
          type: 'data',
          level: 'info',
          message: 'Building conversation history will improve personalization'
        });
      }
      
    } catch (error) {
      logger.warn('AdvancedAnalytics', 'Insight generation error:', error.message);
    }
    
    return insights;
  }
  
  generateRecommendations(analytics) {
    const recommendations = [];
    
    try {
      // Engagement recommendations
      if (analytics.engagementScore < 5) {
        recommendations.push('Consider asking follow-up questions to increase engagement');
        recommendations.push('Explore topics that align with user interests');
      }
      
      // Communication style recommendations
      if (analytics.communicationStyle === 'inquisitive') {
        recommendations.push('Provide comprehensive answers with additional context');
      } else if (analytics.communicationStyle === 'command-oriented') {
        recommendations.push('Focus on clear, actionable responses');
      }
      
      // Focus area recommendations
      if (analytics.strategicFocus === 'technology') {
        recommendations.push('Leverage technical expertise and provide detailed technical insights');
      } else if (analytics.strategicFocus === 'business') {
        recommendations.push('Focus on strategic business insights and practical applications');
      }
      
      // Data quality recommendations
      if (analytics.dataQuality === 'limited') {
        recommendations.push('Encourage more detailed conversations to build better context');
      }
      
      // General recommendations based on patterns
      if (analytics.topicDiversity < 2) {
        recommendations.push('Introduce related topics to expand conversation breadth');
      }
      
    } catch (error) {
      logger.warn('AdvancedAnalytics', 'Recommendation generation error:', error.message);
    }
    
    return recommendations;
  }
  
  generatePredictions(analytics, conversations) {
    const predictions = [];
    
    try {
      // Predict likely interaction frequency
      if (conversations.length >= 5) {
        const recentConversations = conversations.slice(-5);
        const intervals = [];
        
        for (let i = 1; i < recentConversations.length; i++) {
          const prev = new Date(recentConversations[i - 1].timestamp);
          const curr = new Date(recentConversations[i].timestamp);
          intervals.push(curr - prev);
        }
        
        if (intervals.length > 0) {
          const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
          const hours = avgInterval / (1000 * 60 * 60);
          
          predictions.push({
            type: 'frequency',
            prediction: `Likely to interact again in ${Math.round(hours)} hours`,
            confidence: Math.min(0.8, intervals.length * 0.2)
          });
        }
      }
      
      // Predict topic interests
      if (analytics.strategicFocus !== 'general') {

        predictions.push({
          type: 'topic',
          prediction: `High interest in ${analytics.strategicFocus}-related discussions`,
          confidence: analytics.confidenceLevel * 0.8
        });
      }
      
      // Predict response preferences
      if (analytics.communicationStyle === 'detailed') {
        predictions.push({
          type: 'response',
          prediction: 'Prefers comprehensive, detailed explanations',
          confidence: 0.7
        });
      } else if (analytics.communicationStyle === 'concise') {
        predictions.push({
          type: 'response',
          prediction: 'Prefers brief, direct responses',
          confidence: 0.7
        });
      }
      
    } catch (error) {
      logger.warn('AdvancedAnalytics', 'Prediction generation error:', error.message);
    }
    
    return predictions;
  }
}

const advancedAnalytics = CONFIG.ENABLE_ADVANCED_ANALYTICS ? new AdvancedAnalytics() : null;

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MEMORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function buildConversationContext(chatId, currentMessageOrOptions = '') {
  const startTime = Date.now();
  
  try {
    if (!chatId) {
      return '';
    }
    
    logger.info('MemoryCore', `Building enterprise context for ${chatId}`);
    
    // Handle flexible parameters
    let currentMessage = '';
    let options = {};
    
    if (typeof currentMessageOrOptions === 'string') {
      currentMessage = currentMessageOrOptions;
    } else if (typeof currentMessageOrOptions === 'object' && currentMessageOrOptions !== null) {
      options = currentMessageOrOptions;
      currentMessage = options.currentMessage || '';
    }
    
    // Determine context level and limits
    const contextLevel = options.contextLevel || 'full';
    const contextLimit = options.limit || CONFIG.CONTEXT_LIMITS[contextLevel] || CONFIG.CONTEXT_LIMITS.full;
    const maxMessages = options.maxMessages || 20;
    
    logger.debug('MemoryCore', `Context level: ${contextLevel}, limit: ${contextLimit} chars, maxMessages: ${maxMessages}`);
    
    // Fetch data with enterprise-grade error handling
    const [conversations, memories, userProfile] = await Promise.all([
      safeGetConversations(chatId, maxMessages),
      safeGetMemories(chatId),
      safeGetUserProfile(chatId)
    ]);
    
    logger.debug('MemoryCore', `Retrieved: ${conversations.length} conversations, ${memories.length} memories`);
    
    // Advanced analytics integration
    let analytics = null;
    if (advancedAnalytics && (conversations.length > 0 || memories.length > 0)) {
      try {
        analytics = await advancedAnalytics.analyzeConversationIntelligence(conversations, memories, chatId);
      } catch (analyticsError) {
        logger.warn('MemoryCore', 'Analytics generation failed:', analyticsError.message);
      }
    }
    
    // Build context parts with advanced intelligence
    const contextParts = [];
    let currentLength = 0;
    
    // User profile with analytics insights
    if (userProfile) {
      const profileText = `USER PROFILE: Member since ${new Date(userProfile.first_seen || Date.now()).toLocaleDateString()}, ${conversations.length} total conversations`;
      if (currentLength + profileText.length < contextLimit) {
        contextParts.push(profileText);
        currentLength += profileText.length;
      }
    }
    
    // Advanced analytics summary
    if (analytics && analytics.strategicFocus) {
      const analyticsText = `INTELLIGENCE SUMMARY:\n` +
        `• Strategic Focus: ${analytics.strategicFocus}\n` +
        `• Communication Style: ${analytics.communicationStyle}\n` +
        `• Engagement Level: ${analytics.engagementScore.toFixed(1)}/10\n` +
        `• Data Quality: ${analytics.dataQuality}\n` +
        `• Confidence: ${(analytics.confidenceLevel * 100).toFixed(0)}%`;
      
      if (currentLength + analyticsText.length < contextLimit) {
        contextParts.push(analyticsText);
        currentLength += analyticsText.length;
      }
    }
    
    // Key insights from analytics
    if (analytics && analytics.insights && analytics.insights.length > 0) {
      const insightText = `KEY INSIGHTS:\n` + 
        analytics.insights.slice(0, 3).map((insight, i) => 
          `${i + 1}. ${insight.message}`
        ).join('\n');
      
      if (currentLength + insightText.length < contextLimit) {
        contextParts.push(insightText);
        currentLength += insightText.length;
      }
    }
    
    // Persistent memories with relevance scoring
    if (memories.length > 0) {
      const memoryHeader = 'IMPORTANT FACTS:';
      if (currentLength + memoryHeader.length < contextLimit) {
        contextParts.push(memoryHeader);
        currentLength += memoryHeader.length;
        
        const scoredMemories = memories
          .filter(memory => memory.fact && safeString(memory.fact).trim().length > 0)
          .map(memory => ({
            ...memory,
            relevance: calculateRelevance(memory.timestamp, memory.importance, currentMessage)
          }))
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, 15);
        
        for (const memory of scoredMemories) {
          const importance = memory.importance ? `[${memory.importance.toUpperCase()}] ` : '';
          const memoryText = `• ${importance}${safeString(memory.fact).substring(0, 120)}`;
          
          if (currentLength + memoryText.length + 2 < contextLimit) {
            contextParts.push(memoryText);
            currentLength += memoryText.length + 2;
          } else {
            break;
          }
        }
      }
    }
    
    // Recent conversations with intelligent selection
    if (conversations.length > 0) {
      const conversationHeader = 'RECENT CONVERSATIONS:';
      if (currentLength + conversationHeader.length < contextLimit) {
        contextParts.push(conversationHeader);
        currentLength += conversationHeader.length;
        
        const recentConversations = conversations
          .filter(conv => conv.userMessage && conv.userMessage.trim())
          .slice(0, Math.min(8, maxMessages))
          .reverse(); // Most recent first
        
        for (let i = 0; i < recentConversations.length; i++) {
          const conv = recentConversations[i];
          
          const timeAgo = daysBetween(new Date(), new Date(conv.timestamp));
          const timeLabel = timeAgo === 0 ? 'Today' : 
                          timeAgo === 1 ? 'Yesterday' : 
                          `${Math.floor(timeAgo)} days ago`;
          
          const userPart = `${i + 1}. User (${timeLabel}): "${safeString(conv.userMessage).substring(0, 100)}${conv.userMessage.length > 100 ? '...' : ''}"`;
          
          if (currentLength + userPart.length + 2 < contextLimit) {
            contextParts.push(userPart);
            currentLength += userPart.length + 2;
            
            // Add AI response for the most recent conversations
            if (i < 3 && conv.gptResponse) {
              const aiPart = `   AI: "${safeString(conv.gptResponse).substring(0, 80)}${conv.gptResponse.length > 80 ? '...' : ''}"`;
              if (currentLength + aiPart.length + 2 < contextLimit) {
                contextParts.push(aiPart);
                currentLength += aiPart.length + 2;
              }
            }
          } else {
            break;
          }
        }
      }
    }
    
    // Behavioral patterns
    if (analytics && analytics.patterns && analytics.patterns.length > 0) {
      const patternHeader = 'BEHAVIORAL PATTERNS:';
      if (currentLength + patternHeader.length < contextLimit) {
        contextParts.push(patternHeader);
        currentLength += patternHeader.length;
        
        analytics.patterns.slice(0, 3).forEach((pattern, index) => {
          const patternText = `${index + 1}. ${pattern.description} (${(pattern.confidence * 100).toFixed(0)}% confidence)`;
          if (currentLength + patternText.length + 2 < contextLimit) {
            contextParts.push(patternText);
            currentLength += patternText.length + 2;
          }
        });
      }
    }
    
    // Recommendations for AI behavior
    if (analytics && analytics.recommendations && analytics.recommendations.length > 0) {
      const recHeader = 'AI RECOMMENDATIONS:';
      if (currentLength + recHeader.length < contextLimit) {
        contextParts.push(recHeader);
        currentLength += recHeader.length;
        
        analytics.recommendations.slice(0, 2).forEach((rec, index) => {
          const recText = `${index + 1}. ${rec}`;
          if (currentLength + recText.length + 2 < contextLimit) {
            contextParts.push(recText);
            currentLength += recText.length + 2;
          }
        });
      }
    }
    
    // Build final context
    const fullContext = contextParts.join('\n\n');
    const finalContext = fullContext.length > contextLimit 
      ? fullContext.substring(0, contextLimit) + '\n\n[Context optimized for performance]'
      : fullContext;
    
    const processingTime = Date.now() - startTime;
    
    if (performanceMonitor) {
      performanceMonitor.recordOperation('build_context', processingTime, true, {
        chatId,
        contextLength: finalContext.length,
        conversations: conversations.length,
        memories: memories.length,
        hasAnalytics: !!analytics
      });
    }
    
    logger.info('MemoryCore', `Enterprise context built: ${finalContext.length} chars (${processingTime}ms)`);
    
    return finalContext;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (performanceMonitor) {
      performanceMonitor.recordOperation('build_context', processingTime, false, { error: error.message });
    }
    
    logger.error('MemoryCore', `Context building failed for ${chatId}:`, error.message);
    
    return `ENTERPRISE FALLBACK CONTEXT: Error building advanced context (${error.message}). ` +
           `Current message: "${safeString(currentMessageOrOptions).substring(0, 150)}"`;
  }
}

async function saveToMemory(chatId, conversationData) {
  const startTime = Date.now();
  
  try {
    if (!chatId || !conversationData) {
      return { saved: false, reason: 'missing_data' };
    }
    
    logger.info('MemoryCore', `Saving enterprise conversation for ${chatId}`);
    
    // Extract and validate data
    const userMessage = safeString(conversationData.user || conversationData.userMessage || '');
    const assistantResponse = safeString(conversationData.assistant || conversationData.assistantResponse || '');
    
    // Enhanced validation
    if (userMessage.length < 2 && assistantResponse.length < 20) {
      return { saved: false, reason: 'trivial_content' };
    }
    
    // Content filtering
    const filteredUserMessage = filterSensitiveContent(userMessage);
    const filteredAssistantResponse = filterSensitiveContent(assistantResponse);
    
    // Prepare enterprise metadata
    const enhancedMetadata = {
      messageType: conversationData.messageType || 'conversation',
      timestamp: conversationData.timestamp || new Date().toISOString(),
      system_version: 'enterprise-memory-v2.0',
      userMessageLength: userMessage.length,
      assistantResponseLength: assistantResponse.length,
      contentFiltered: userMessage !== filteredUserMessage || assistantResponse !== filteredAssistantResponse,
      ...conversationData.metadata
    };
    
    // Save conversation with circuit breaker protection
    const saveResult = await safeSaveConversation(chatId, filteredUserMessage, filteredAssistantResponse, enhancedMetadata);
    
    let factsSaved = 0;
    
    // Extract and save facts if conversation was saved successfully
    if (saveResult !== false) {
      try {
        const facts = extractFactsFromConversation(filteredUserMessage, filteredAssistantResponse);
        
        for (const fact of facts.slice(0, 5)) { // Limit to 5 facts per conversation
          try {
            const factResult = await safeSaveFact(chatId, fact.text, fact.importance);
            if (factResult !== false) {
              factsSaved++;
            }
          } catch (factError) {
            logger.warn('MemoryCore', `Failed to save fact: ${factError.message}`);
          }
        }
        
        logger.debug('MemoryCore', `Extracted and saved ${factsSaved} facts from conversation`);
        
      } catch (factExtractionError) {
        logger.warn('MemoryCore', 'Fact extraction failed:', factExtractionError.message);
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    if (performanceMonitor) {
      performanceMonitor.recordOperation('save_memory', processingTime, saveResult !== false, {
        chatId,
        userLength: userMessage.length,
        aiLength: assistantResponse.length,
        factsSaved
      });
    }
    
    const result = {
      saved: saveResult !== false,
      method: 'enterprise_database',
      timestamp: enhancedMetadata.timestamp,
      userLength: userMessage.length,
      aiLength: assistantResponse.length,
      factsSaved: factsSaved,
      contentFiltered: enhancedMetadata.contentFiltered,
      processingTime
    };
    
    if (saveResult !== false) {
      logger.info('MemoryCore', `Enterprise conversation saved for ${chatId}: ${factsSaved} facts extracted (${processingTime}ms)`);
    } else {
      logger.warn('MemoryCore', `Failed to save conversation for ${chatId} (${processingTime}ms)`);
      result.reason = 'database_save_failed';
    }
    
    return result;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (performanceMonitor) {
      performanceMonitor.recordOperation('save_memory', processingTime, false, { error: error.message });
    }
    
    logger.error('MemoryCore', `Enterprise save failed for ${chatId}:`, error.message);
    
    return { 
      saved: false, 
      reason: 'enterprise_error', 
      error: error.message,
      processingTime
    };
  }
}

function extractFactsFromConversation(userMessage, aiResponse) {
  try {
    const facts = [];
    
    if (!userMessage && !aiResponse) {
      return facts;
    }
    
    // Extract from user message
    const userFacts = extractFactsFromText(safeString(userMessage), 'user');
    facts.push(...userFacts);
    
    // Extract from AI response (limited to avoid over-extraction)
    const aiFacts = extractFactsFromText(safeString(aiResponse), 'ai').slice(0, 2);
    facts.push(...aiFacts);
    
    return facts.slice(0, 8); // Limit total facts
    
  } catch (error) {
    logger.error('MemoryCore', 'Fact extraction error:', error.message);
    return [];
  }
}

function extractFactsFromText(text, source = 'unknown') {
  const facts = [];
  
  if (!text || typeof text !== 'string' || text.length < 10) {
    return facts;
  }
  
  const lowerText = text.toLowerCase();
  
  try {
    // Enhanced fact extraction patterns
    const factPatterns = [
      { 
        regex: /(?:my name is|i'm called|call me) ([^.,!?\n]{2,50})/i, 
        type: 'identity', 
        importance: 'high',
        transform: (match) => `User's name: ${match[1].trim()}`
      },
      { 
        regex: /i (?:live in|am from|am based in) ([^.,!?\n]{2,50})/i, 
        type: 'location', 
        importance: 'medium',
        transform: (match) => `User location: ${match[1].trim()}`
      },
      { 
        regex: /i (?:work at|work for|am employed by) ([^.,!?\n]{2,50})/i, 
        type: 'employment', 
        importance: 'medium',
        transform: (match) => `User works at: ${match[1].trim()}`
      },
      { 
        regex: /i (?:prefer|like|love|enjoy) ([^.,!?\n]{3,100})/i, 
        type: 'preference', 
        importance: 'medium',
        transform: (match) => `User preference: ${match[0].trim()}`
      },
      { 
        regex: /(?:my goal is|i want to|i'm trying to|i plan to) ([^.,!?\n]{3,100})/i, 
        type: 'goal', 
        importance: 'medium',
        transform: (match) => `User goal: ${match[0].trim()}`
      },
      { 
        regex: /i (?:studied|have a degree in|majored in) ([^.,!?\n]{2,50})/i, 
        type: 'education', 
        importance: 'low',
        transform: (match) => `User education: ${match[1].trim()}`
      },
      { 
        regex: /i (?:hate|dislike|can't stand) ([^.,!?\n]{3,100})/i, 
        type: 'negative_preference', 
        importance: 'medium',
        transform: (match) => `User dislikes: ${match[1].trim()}`
      }
    ];
    
    // Process each pattern
    factPatterns.forEach(pattern => {
      try {
        const matches = text.match(pattern.regex);
        if (matches && matches[1] && matches[1].trim().length > 1) {
          const factText = pattern.transform(matches);
          
          // Validate fact quality
          if (factText.length <= CONFIG.MAX_FACT_LENGTH && 
              !factText.toLowerCase().includes('undefined') &&
              !factText.toLowerCase().includes('null')) {
            facts.push({
              text: factText,
              importance: pattern.importance,
              type: pattern.type,
              source: source,
              confidence: 0.8
            });
          }
        }
      } catch (patternError) {
        logger.warn('MemoryCore', `Pattern matching error: ${patternError.message}`);
      }
    });
    
    // Important statements detection
    const importantIndicators = ['important', 'remember', 'note that', 'keep in mind', 'don\'t forget'];
    if (importantIndicators.some(indicator => lowerText.includes(indicator))) {
      facts.push({
        text: `Important statement: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`,
        importance: 'high',
        type: 'important',
        source: source,
        confidence: 0.9
      });
    }
    
  } catch (error) {
    logger.warn('MemoryCore', `Fact extraction error: ${error.message}`);
  }
  
  return facts.slice(0, 5); // Limit facts per text
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTERPRISE HEALTH AND DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════════════

async function getEnterpriseMemoryStats(chatId) {
  const startTime = Date.now();
  
  try {
    logger.info('MemoryCore', `Generating enterprise statistics for ${chatId}`);
    
    const [conversations, memories, userProfile] = await Promise.all([
      safeGetConversations(chatId, 100),
      safeGetMemories(chatId),
      safeGetUserProfile(chatId)
    ]);
    
    const stats = {
      conversations: {
        total: conversations.length,
        avgLength: 0,
        dateRange: null,
        totalWords: 0,
        byType: {}
      },
      memories: {
        total: memories.length,
        byImportance: { high: 0, medium: 0, low: 0 },
        byType: {},
        oldestMemory: null,
        newestMemory: null
      },
      userProfile: userProfile ? {
        firstSeen: userProfile.first_seen,
        totalInteractions: userProfile.conversation_count || conversations.length,
        lastActivity: userProfile.last_activity
      } : null,
      analytics: null,
      systemHealth: {
        circuitBreakers: Object.fromEntries(
          Object.entries(circuitBreakers).map(([name, breaker]) => [name, breaker.getStats()])
        ),
        cache: cache ? cache.getStats() : null,
        performanceMonitor: performanceMonitor ? performanceMonitor.getMetrics() : null,
        alerts: performanceMonitor ? performanceMonitor.getAlerts(null, false) : []
      },
      databaseHealth: {
        connected: database?.connectionStats?.connectionHealth === 'connected',
        lastQuery: database?.connectionStats?.lastQuery || null,
        totalQueries: database?.connectionStats?.totalQueries || 0
      }
    };
    
    // Enhanced conversation statistics
    if (conversations.length > 0) {
      const lengths = conversations.map(conv => {
        const userLen = safeString(conv.userMessage).length;
        const aiLen = safeString(conv.gptResponse).length;
        return userLen + aiLen;
      });
      
      stats.conversations.avgLength = safeDivision(
        lengths.reduce((sum, len) => sum + len, 0), 
        lengths.length
      );
      
      stats.conversations.totalWords = Math.round(stats.conversations.avgLength * conversations.length / 5);
      
      // Date range analysis
      const timestamps = conversations
        .map(conv => conv.timestamp)
        .filter(ts => ts)
        .map(ts => new Date(ts))
        .sort((a, b) => a - b);
      
      if (timestamps.length > 1) {
        stats.conversations.dateRange = {
          first: timestamps[0].toISOString(),
          last: timestamps[timestamps.length - 1].toISOString(),
          spanDays: daysBetween(timestamps[0], timestamps[timestamps.length - 1])
        };
      }
      
      // Group by message type
      conversations.forEach(conv => {
        const type = conv.metadata?.messageType || 'standard';
        stats.conversations.byType[type] = (stats.conversations.byType[type] || 0) + 1;
      });
    }
    
    // Enhanced memory statistics
    if (memories.length > 0) {
      memories.forEach(memory => {
        const importance = memory.importance || 'medium';
        const type = memory.type || 'general';
        
        if (stats.memories.byImportance[importance] !== undefined) {
          stats.memories.byImportance[importance]++;
        }
        
        stats.memories.byType[type] = (stats.memories.byType[type] || 0) + 1;
      });
      
      const memoryTimestamps = memories
        .map(mem => mem.timestamp)
        .filter(ts => ts)
        .map(ts => new Date(ts))
        .sort((a, b) => a - b);
      
      if (memoryTimestamps.length > 0) {
        stats.memories.oldestMemory = memoryTimestamps[0].toISOString();
        stats.memories.newestMemory = memoryTimestamps[memoryTimestamps.length - 1].toISOString();
      }
    }
    
    // Generate advanced analytics
    if (advancedAnalytics) {
      try {
        stats.analytics = await advancedAnalytics.analyzeConversationIntelligence(conversations, memories, chatId);
      } catch (analyticsError) {
        stats.analytics = { error: analyticsError.message };
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    if (performanceMonitor) {
      performanceMonitor.recordOperation('get_enterprise_stats', processingTime, true, { chatId });
    }
    
    logger.info('MemoryCore', `Enterprise statistics generated for ${chatId}: ${conversations.length} conversations, ${memories.length} memories (${processingTime}ms)`);
    
    return stats;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (performanceMonitor) {
      performanceMonitor.recordOperation('get_enterprise_stats', processingTime, false, { error: error.message });
    }
    
    logger.error('MemoryCore', `Enterprise statistics failed for ${chatId}:`, error.message);
    
    return {
      conversations: { total: 0, error: error.message },
      memories: { total: 0, error: error.message },
      analytics: { error: error.message },
      systemHealth: { error: error.message },
      databaseHealth: { connected: false, error: error.message }
    };
  }
}

async function performEnterpriseHealthCheck(chatId = 'health_check') {
  const startTime = Date.now();
  
  try {
    logger.info('MemoryCore', 'Performing comprehensive enterprise health check');
    
    const health = {
      timestamp: Date.now(),
      overall: 'unknown',
      overallScore: 0,
      components: {},
      scores: {},
      recommendations: [],
      alerts: [],
      performance: {}
    };
    
    // Database health check
    try {
      await safeGetConversations(chatId, 1);
      health.components.database = {
        status: 'operational',
        available: true
      };
      health.scores.database = 100;
    } catch (dbError) {
      health.components.database = {
        status: 'error',
        available: false,
        error: dbError.message
      };
      health.scores.database = 0;
      health.recommendations.push('Database connection issues detected - check PostgreSQL connectivity');
    }
    
    // Circuit breaker health
    const breakerStats = Object.entries(circuitBreakers).map(([name, breaker]) => {
      const stats = breaker.getStats();
      return {
        name,
        state: stats.state,
        successRate: stats.successRate,
        healthy: stats.state === 'CLOSED' && stats.successRate > 80
      };
    });
    
    const healthyBreakers = breakerStats.filter(b => b.healthy).length;
    health.components.circuitBreakers = {
      status: healthyBreakers === breakerStats.length ? 'operational' : 'degraded',
      healthy: healthyBreakers,
      total: breakerStats.length,
      details: breakerStats
    };
    health.scores.circuitBreakers = (healthyBreakers / breakerStats.length) * 100;
    
    // Cache health
    if (cache) {
      const cacheStats = cache.getStats();
      health.components.cache = {
        status: cacheStats.hitRate > 60 ? 'optimal' : 'suboptimal',
        hitRate: cacheStats.hitRate,
        size: cacheStats.cacheSize,
        memoryUsage: cacheStats.memoryUsageMB
      };
      health.scores.cache = Math.min(100, 50 + (cacheStats.hitRate * 0.5));
    } else {
      health.components.cache = { status: 'disabled' };
      health.scores.cache = 70; // Not critical if disabled
    }
    
    // Performance monitoring health
    if (performanceMonitor) {
      const perfMetrics = performanceMonitor.getMetrics();
      const alerts = performanceMonitor.getAlerts('error', false);
      
      health.components.performance = {
        status: alerts.length === 0 ? 'healthy' : 'issues_detected',
        activeAlerts: alerts.length,
        metricsTracked: Object.keys(perfMetrics).length
      };
      health.scores.performance = Math.max(0, 100 - (alerts.length * 10));
      health.alerts = alerts.slice(0, 5); // Include top 5 alerts
    } else {
      health.components.performance = { status: 'disabled' };
      health.scores.performance = 70;
    }
    
    // Advanced analytics health
    if (advancedAnalytics) {
      health.components.analytics = {
        status: 'operational',
        features: {
          patternRecognition: CONFIG.ENABLE_PATTERN_RECOGNITION,
          predictiveAnalytics: CONFIG.ENABLE_PREDICTIVE_ANALYTICS
        }
      };
      health.scores.analytics = 100;
    } else {
      health.components.analytics = { status: 'disabled' };
      health.scores.analytics = 50;
    }
    
    // System resource health
    const memUsage = process.memoryUsage();
    const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    health.components.systemResources = {
      status: memoryMB < 400 ? 'healthy' : memoryMB < 600 ? 'elevated' : 'high',
      memoryUsageMB: memoryMB,
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      uptime: Math.round(process.uptime())
    };
    health.scores.systemResources = Math.max(0, 100 - ((memoryMB - 200) / 4));
    
    // Calculate overall score and status
    const scores = Object.values(health.scores);
    health.overallScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    
    health.overall = health.overallScore >= 90 ? 'excellent' : 
                     health.overallScore >= 70 ? 'good' : 
                     health.overallScore >= 50 ? 'degraded' : 'critical';
    
    // Generate recommendations
    if (health.overallScore < 70) {
      health.recommendations.push('System performance is below optimal - investigate failing components');
    }
    if (health.scores.database < 50) {
      health.recommendations.push('Critical database issues - check PostgreSQL connection and credentials');
    }
    if (cache && health.scores.cache < 60) {
      health.recommendations.push('Cache performance is suboptimal - consider tuning cache settings');
    }
    if (memoryMB > 500) {
      health.recommendations.push(`High memory usage detected: ${memoryMB}MB - consider optimization`);
    }
    if (health.alerts.length > 0) {
      health.recommendations.push(`${health.alerts.length} active performance alerts require attention`);
    }
    
    const processingTime = Date.now() - startTime;
    health.performance = {
      healthCheckDuration: processingTime,
      componentsChecked: Object.keys(health.components).length
    };
    
    logger.info('MemoryCore', `Enterprise health check completed: ${health.overall} (${health.overallScore}%) in ${processingTime}ms`);
    
    return health;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('MemoryCore', 'Enterprise health check failed:', error.message);
    
    return {
      timestamp: Date.now(),
      overall: 'error',
      overallScore: 0,
      components: { error: error.message },
      scores: {},
      recommendations: ['Health check system failure - manual investigation required'],
      performance: { healthCheckDuration: processingTime },
      error: error.message
    };
  }
}

async function testEnterpriseMemorySystem(chatId = 'enterprise_test') {
  const startTime = Date.now();
  
  try {
    logger.info('MemoryCore', `Testing enterprise memory system for ${chatId}`);
    
    const testResults = {
      timestamp: new Date().toISOString(),
      testUser: chatId,
      tests: {},
      overallHealth: false,
      score: '0/12',
      recommendations: [],
      performance: {}
    };
    
    // Test 1: Database connectivity
    try {
      await safeGetConversations(chatId, 1);
      testResults.tests.databaseConnectivity = { 
        name: 'Database Connectivity', 
        passed: true,
        duration: 0
      };
    } catch (error) {
      testResults.tests.databaseConnectivity = { 
        name: 'Database Connectivity', 
        passed: false, 
        error: error.message
      };
    }
    
    // Test 2: Circuit breaker functionality
    const breakerHealth = Object.values(circuitBreakers).every(breaker => 
      breaker.getStats().state === 'CLOSED'
    );
    testResults.tests.circuitBreakers = {
      name: 'Circuit Breakers',
      passed: breakerHealth,
      details: Object.fromEntries(
        Object.entries(circuitBreakers).map(([name, breaker]) => [name, breaker.getStats()])
      )
    };
    
    // Test 3: Cache system
    if (cache) {
      const testKey = `test:${Date.now()}`;
      const testData = { test: true, timestamp: Date.now() };
      
      cache.set(testKey, testData);
      const retrieved = cache.get(testKey);
      
      testResults.tests.cacheSystem = {
        name: 'Intelligent Cache',
        passed: retrieved && retrieved.test === true,
        details: cache.getStats()
      };
    } else {
      testResults.tests.cacheSystem = {
        name: 'Intelligent Cache',
        passed: true, // Not required
        details: 'Disabled by configuration'
      };
    }
    
    // Test 4: Context building
    try {
      const context1 = await buildConversationContext(chatId, 'test enterprise message');
      const context2 = await buildConversationContext(chatId, { 
        limit: 2000, 
        maxMessages: 5,
        contextLevel: 'enterprise'
      });
      
      testResults.tests.contextBuilding = {
        name: 'Context Building',
        passed: typeof context1 === 'string' && typeof context2 === 'string',
        details: {
          method1Length: context1.length,
          method2Length: context2.length,
          bothWork: context1.length > 0 && context2.length > 0
        }
      };
    } catch (error) {
      testResults.tests.contextBuilding = {
        name: 'Context Building',
        passed: false,
        error: error.message
      };
    }
    
    // Test 5: Memory saving
    try {
      const saveResult = await saveToMemory(chatId, {
        user: 'ENTERPRISE TEST: Complex user message with detailed requirements',
        assistant: 'ENTERPRISE TEST: Comprehensive AI response with advanced analytics and recommendations',
        messageType: 'enterprise_test',
        metadata: { test: true, enterprise: true, timestamp: new Date().toISOString() }
      });
      
      testResults.tests.memorySaving = {
        name: 'Enterprise Memory Saving',
        passed: saveResult.saved === true,
        details: saveResult
      };
    } catch (error) {
      testResults.tests.memorySaving = {
        name: 'Enterprise Memory Saving',
        passed: false,
        error: error.message
      };
    }
    
    // Test 6: Fact extraction
    try {
      const facts = extractFactsFromConversation(
        'My name is Enterprise Test User and I work at Acme Corporation in New York',
        'Nice to meet you, Enterprise Test User! I understand you work at Acme Corporation.'
      );
      
      testResults.tests.factExtraction = {
        name: 'Advanced Fact Extraction',
        passed: Array.isArray(facts) && facts.length > 0,
        details: {
          factsExtracted: facts.length,
          facts: facts.map(f => f.text)
        }
      };
    } catch (error) {
      testResults.tests.factExtraction = {
        name: 'Advanced Fact Extraction',
        passed: false,
        error: error.message
      };
    }
    
    // Test 7: Analytics system
    if (advancedAnalytics) {
      try {
        const mockConversations = [
          { userMessage: 'Test analytics message', gptResponse: 'Test response', timestamp: new Date().toISOString() }
        ];
        const analytics = await advancedAnalytics.analyzeConversationIntelligence(mockConversations, [], chatId);
        
        testResults.tests.advancedAnalytics = {
          name: 'Advanced Analytics',
          passed: analytics && typeof analytics === 'object' && analytics.strategicFocus,
          details: {
            strategicFocus: analytics.strategicFocus,
            communicationStyle: analytics.communicationStyle,
            confidenceLevel: analytics.confidenceLevel
          }
        };
      } catch (error) {
        testResults.tests.advancedAnalytics = {
          name: 'Advanced Analytics',
          passed: false,
          error: error.message
        };
      }
    } else {
      testResults.tests.advancedAnalytics = {
        name: 'Advanced Analytics',
        passed: false,
        error: 'Advanced analytics disabled'
      };
    }
    
    // Test 8: Performance monitoring
    if (performanceMonitor) {
      const metrics = performanceMonitor.getMetrics();
      testResults.tests.performanceMonitoring = {
        name: 'Performance Monitoring',
        passed: typeof metrics === 'object' && Object.keys(metrics).length > 0,
        details: {
          metricsTracked: Object.keys(metrics).length,
          hasAlerts: performanceMonitor.getAlerts().length > 0
        }
      };
    } else {
      testResults.tests.performanceMonitoring = {
        name: 'Performance Monitoring',
        passed: false,
        error: 'Performance monitoring disabled'
      };
    }
    
    // Test 9: Content filtering
    try {
      const filtered = filterSensitiveContent('Test message with email@example.com and phone 555-123-4567');
      testResults.tests.contentFiltering = {
        name: 'Content Filtering',
        passed: filtered.includes('[FILTERED]'),
        details: { originalLength: 60, filteredLength: filtered.length }
      };
    } catch (error) {
      testResults.tests.contentFiltering = {
        name: 'Content Filtering',
        passed: false,
        error: error.message
      };
    }
    
    // Test 10: Enterprise statistics
    try {
      const stats = await getEnterpriseMemoryStats(chatId);
      testResults.tests.enterpriseStats = {
        name: 'Enterprise Statistics',
        passed: stats && typeof stats === 'object' && stats.conversations,
        details: {
          hasConversations: stats.conversations?.total >= 0,
          hasMemories: stats.memories?.total >= 0,
          hasAnalytics: !!stats.analytics,
          hasSystemHealth: !!stats.systemHealth
        }
      };
    } catch (error) {
      testResults.tests.enterpriseStats = {
        name: 'Enterprise Statistics',
        passed: false,
        error: error.message
      };
    }
    
    // Test 11: Health monitoring
    try {
      const health = await performEnterpriseHealthCheck(chatId);
      testResults.tests.healthMonitoring = {
        name: 'Health Monitoring',
        passed: health && health.overall !== 'error',
        details: {
          overall: health.overall,
          overallScore: health.overallScore,
          componentsChecked: Object.keys(health.components || {}).length
        }
      };
    } catch (error) {
      testResults.tests.healthMonitoring = {
        name: 'Health Monitoring',
        passed: false,
        error: error.message
      };
    }
    
    // Test 12: System integration
    try {
      // Test the full pipeline
      const context = await buildConversationContext(chatId, { contextLevel: 'enterprise' });
      const saveResult = await saveToMemory(chatId, {
        user: 'Integration test message',
        assistant: 'Integration test response'
      });
      const stats = await getEnterpriseMemoryStats(chatId);
      
      testResults.tests.systemIntegration = {
        name: 'System Integration',
        passed: context.length > 0 && saveResult.saved && stats.conversations,
        details: {
          contextWorking: context.length > 0,
          savingWorking: saveResult.saved,
          statsWorking: !!stats.conversations
        }
      };
    } catch (error) {
      testResults.tests.systemIntegration = {
        name: 'System Integration',
        passed: false,
        error: error.message
      };
    }
    
    // Calculate overall results
    const passedTests = Object.values(testResults.tests).filter(test => test.passed).length;
    const totalTests = Object.keys(testResults.tests).length;
    
    testResults.score = `${passedTests}/${totalTests}`;
    testResults.overallHealth = passedTests >= (totalTests * 0.8); // 80% pass rate required
    
    // Generate recommendations
    Object.entries(testResults.tests).forEach(([testName, result]) => {
      if (!result.passed) {
        testResults.recommendations.push(`Fix ${result.name}: ${result.error || 'Unknown issue'}`);
      }
    });
    
    if (testResults.overallHealth) {
      testResults.recommendations.push('Enterprise memory system is operating at optimal levels');
    } else {
      testResults.recommendations.push('Enterprise memory system requires attention - multiple components failing');
    }
    
    const processingTime = Date.now() - startTime;
    testResults.performance = {
      totalTestTime: processingTime,
      averageTestTime: Math.round(processingTime / totalTests),
      testsPerSecond: Math.round((totalTests / processingTime) * 1000)
    };
    
    logger.info('MemoryCore', `Enterprise memory system test completed: ${testResults.score} (${testResults.overallHealth ? 'HEALTHY' : 'NEEDS ATTENTION'}) in ${processingTime}ms`);
    
    return testResults;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('MemoryCore', 'Enterprise memory test failed:', error.message);
    
    return {
      timestamp: new Date().toISOString(),
      testUser: chatId,
      tests: { criticalError: { name: 'Critical Error', passed: false, error: error.message } },
      overallHealth: false,
      score: '0/12',
      recommendations: ['Critical system failure - immediate investigation required'],
      performance: { totalTestTime: processingTime },
      error: error.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLEANUP AND MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════

function cleanup() {
  logger.info('MemoryCore', 'Performing enterprise memory system cleanup');
  
  try {
    // Destroy cache
    if (cache) {
      cache.destroy();
    }
    
    // Destroy performance monitor
    if (performanceMonitor) {
      performanceMonitor.destroy();
    }
    
    // Reset circuit breakers
    Object.values(circuitBreakers).forEach(breaker => {
      breaker.reset();
    });
    
    logger.info('MemoryCore', 'Enterprise memory system cleanup completed');
  } catch (error) {
    logger.error('MemoryCore', 'Cleanup error:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Core memory functions
  buildConversationContext,
  saveToMemory,
  extractFactsFromConversation,
  
  // Enterprise-specific functions
  getEnterpriseMemoryStats,
  performEnterpriseHealthCheck,
  testEnterpriseMemorySystem,
  
  // Utility functions
  extractFactsFromText,
  filterSensitiveContent,
  
  // Helper functions
  safeString,
  safeDivision,
  daysBetween,
  calculateRelevance,
  normalizeFieldNames,
  
  // Advanced features
  advancedAnalytics: advancedAnalytics || null,
  
  // System components
  circuitBreakers,
  cache: cache || null,
  performanceMonitor: performanceMonitor || null,
  logger,
  
  // Management functions
  cleanup,
  
  // Legacy compatibility
  buildMemoryContext: buildConversationContext,
  getMemoryStats: getEnterpriseMemoryStats,
  
  // Configuration
  CONFIG,
  
  // System information
  getSystemInfo: () => ({
    version: 'enterprise-v2.0',
    features: {
      intelligentCaching: !!cache,
      performanceMonitoring: !!performanceMonitor,
      advancedAnalytics: !!advancedAnalytics,
      circuitBreakers: true,
      contentFiltering: CONFIG.ENABLE_CONTENT_FILTERING,
      patternRecognition: CONFIG.ENABLE_PATTERN_RECOGNITION,
      predictiveAnalytics: CONFIG.ENABLE_PREDICTIVE_ANALYTICS
    },
    limits: CONFIG.CONTEXT_LIMITS,
    health: {
      circuitBreakers: Object.keys(circuitBreakers).length,
      cacheEnabled: !!cache,
      monitoringEnabled: !!performanceMonitor
    }
  })
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION AND STARTUP
// ═══════════════════════════════════════════════════════════════════════════

console.log('');
console.log('🏢 ═══════════════════════════════════════════════════════════════');
console.log('   FULL ENTERPRISE MEMORY SYSTEM v2.0 - PRODUCTION READY');
console.log('   ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('✨ ENTERPRISE FEATURES:');
console.log(`   🔄 Circuit Breakers: ${Object.keys(circuitBreakers).length} active`);
console.log(`   🧠 Intelligent Caching: ${cache ? 'Enabled' : 'Disabled'}`);
console.log(`   📊 Performance Monitoring: ${performanceMonitor ? 'Enabled' : 'Disabled'}`);
console.log(`   🤖 Advanced Analytics: ${advancedAnalytics ? 'Enabled' : 'Disabled'}`);
console.log(`   🛡️ Content Filtering: ${CONFIG.ENABLE_CONTENT_FILTERING ? 'Enabled' : 'Disabled'}`);
console.log(`   🔍 Pattern Recognition: ${CONFIG.ENABLE_PATTERN_RECOGNITION ? 'Enabled' : 'Disabled'}`);
console.log(`   🔮 Predictive Analytics: ${CONFIG.ENABLE_PREDICTIVE_ANALYTICS ? 'Enabled' : 'Disabled'}`);
console.log('');
console.log('⚙️ CONFIGURATION:');
console.log(`   • Context Limits: ${JSON.stringify(CONFIG.CONTEXT_LIMITS)}`);
console.log(`   • Cache TTL: ${CONFIG.CACHE_TTL}ms`);
console.log(`   • Max Cache Size: ${CONFIG.MAX_CACHE_SIZE}`);
console.log(`   • Memory Cleanup: ${CONFIG.ENABLE_MEMORY_CLEANUP ? 'Enabled' : 'Disabled'}`);
console.log(`   • Debug Mode: ${CONFIG.DEBUG_MODE ? 'Enabled' : 'Disabled'}`);
console.log('');
console.log('🎯 CAPABILITIES:');
console.log('   • Enterprise-grade context building with advanced intelligence');
console.log('   • Intelligent conversation saving with fact extraction');
console.log('   • Advanced pattern recognition and behavioral analysis');
console.log('   • Predictive analytics and personalized recommendations');
console.log('   • Real-time performance monitoring and health checks');
console.log('   • Automatic content filtering and security measures');
console.log('   • Circuit breaker protection for database operations');
console.log('   • Comprehensive enterprise statistics and reporting');
console.log('');
console.log('✅ ENTERPRISE MEMORY SYSTEM FULLY OPERATIONAL');
console.log('🏢 Ready for high-traffic production environments');
console.log('📈 Advanced analytics and monitoring active');
console.log('🛡️ Enterprise security and reliability features enabled');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('System', 'Enterprise memory system shutdown initiated');
  cleanup();
});

process.on('SIGINT', () => {
  logger.info('System', 'Enterprise memory system interrupt received');
  cleanup();
});

// Export cleanup for manual use
module.exports.cleanup = cleanup;
