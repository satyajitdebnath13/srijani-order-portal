/**
 * Performance Monitoring Middleware
 * 
 * This module provides comprehensive performance monitoring and optimization
 * capabilities to track and improve application performance.
 */

import logger from './logger.js';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      totalResponseTime: 0,
      slowRequests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      dbQueries: 0,
      dbQueryTime: 0
    };
    
    this.slowRequestThreshold = parseInt(process.env.SLOW_REQUEST_THRESHOLD) || 1000; // 1 second
    this.enableDetailedLogging = process.env.NODE_ENV === 'development';
  }

  /**
   * Middleware to monitor request performance
   */
  requestMonitor() {
    return (req, res, next) => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();
      
      // Track request
      this.metrics.requests++;
      
      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = function(...args) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const endMemory = process.memoryUsage();
        
        // Update metrics
        this.metrics.totalResponseTime += responseTime;
        
        if (responseTime > this.slowRequestThreshold) {
          this.metrics.slowRequests++;
          logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
            responseTime,
            memoryUsage: {
              rss: endMemory.rss - startMemory.rss,
              heapUsed: endMemory.heapUsed - startMemory.heapUsed,
              heapTotal: endMemory.heapTotal - startMemory.heapTotal
            },
            userAgent: req.headers['user-agent'],
            ip: req.ip
          });
        }
        
        if (this.enableDetailedLogging) {
          logger.debug(`Request completed: ${req.method} ${req.path}`, {
            responseTime,
            statusCode: res.statusCode,
            memoryDelta: endMemory.heapUsed - startMemory.heapUsed
          });
        }
        
        // Call original end method
        originalEnd.apply(res, args);
      }.bind(this);
      
      next();
    };
  }

  /**
   * Track database query performance
   */
  trackDbQuery(query, executionTime) {
    this.metrics.dbQueries++;
    this.metrics.dbQueryTime += executionTime;
    
    if (executionTime > 100) { // Log slow queries (>100ms)
      logger.warn('Slow database query detected:', {
        query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
        executionTime,
        timestamp: new Date().toISOString()
      });
    }
    
    if (this.enableDetailedLogging) {
      logger.debug('Database query executed:', {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        executionTime
      });
    }
  }

  /**
   * Track cache performance
   */
  trackCacheHit(key) {
    this.metrics.cacheHits++;
    if (this.enableDetailedLogging) {
      logger.debug(`Cache hit: ${key}`);
    }
  }

  trackCacheMiss(key) {
    this.metrics.cacheMisses++;
    if (this.enableDetailedLogging) {
      logger.debug(`Cache miss: ${key}`);
    }
  }

  /**
   * Track errors
   */
  trackError(error, context = {}) {
    this.metrics.errors++;
    logger.error('Application error:', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    const avgResponseTime = this.metrics.requests > 0 
      ? this.metrics.totalResponseTime / this.metrics.requests 
      : 0;
    
    const avgDbQueryTime = this.metrics.dbQueries > 0 
      ? this.metrics.dbQueryTime / this.metrics.dbQueries 
      : 0;
    
    const cacheHitRate = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
      : 0;

    return {
      ...this.metrics,
      avgResponseTime: Math.round(avgResponseTime),
      avgDbQueryTime: Math.round(avgDbQueryTime),
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      requests: 0,
      totalResponseTime: 0,
      slowRequests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      dbQueries: 0,
      dbQueryTime: 0
    };
    logger.info('Performance metrics reset');
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const metrics = this.getMetrics();
    const memoryUsage = metrics.memoryUsage;
    
    return {
      timestamp: new Date().toISOString(),
      uptime: Math.round(metrics.uptime),
      requests: {
        total: metrics.requests,
        slow: metrics.slowRequests,
        avgResponseTime: metrics.avgResponseTime,
        errorRate: metrics.requests > 0 ? (metrics.errors / metrics.requests) * 100 : 0
      },
      database: {
        queries: metrics.dbQueries,
        avgQueryTime: metrics.avgDbQueryTime
      },
      cache: {
        hits: metrics.cacheHits,
        misses: metrics.cacheMisses,
        hitRate: metrics.cacheHitRate
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024) // MB
      },
      performance: {
        slowRequestThreshold: this.slowRequestThreshold,
        slowRequestsPercentage: metrics.requests > 0 ? (metrics.slowRequests / metrics.requests) * 100 : 0
      }
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
