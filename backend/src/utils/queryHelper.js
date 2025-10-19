/**
 * Optimized Database Query Helper
 * 
 * This module provides optimized database query methods with caching,
 * performance monitoring, and connection pooling.
 */

import db from '../config/database.js';
import queryCache from './queryCache.js';
import performanceMonitor from './performanceMonitor.js';
import logger from './logger.js';

class OptimizedQueryHelper {
  constructor() {
    this.models = db.models;
  }

  /**
   * Optimized find with caching
   * @param {Object} model - Sequelize model
   * @param {Object} options - Query options
   * @param {number} cacheTTL - Cache TTL in seconds
   * @returns {Promise<any>} - Query result
   */
  async findWithCache(model, options = {}, cacheTTL = 300) {
    const startTime = Date.now();
    
    try {
      // Generate cache key
      const cacheKey = `find:${model.name}:${JSON.stringify(options)}`;
      
      // Try to get from cache first
      const cachedResult = await queryCache.getCachedQuery(cacheKey, options);
      if (cachedResult) {
        return cachedResult;
      }
      
      // Execute query
      const result = await model.findAll(options);
      
      // Cache the result
      await queryCache.cacheQuery(cacheKey, result, cacheTTL);
      
      // Track performance
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`SELECT ${model.name}`, executionTime);
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`SELECT ${model.name} (ERROR)`, executionTime);
      performanceMonitor.trackError(error, { model: model.name, options });
      throw error;
    }
  }

  /**
   * Optimized findOne with caching
   * @param {Object} model - Sequelize model
   * @param {Object} options - Query options
   * @param {number} cacheTTL - Cache TTL in seconds
   * @returns {Promise<any>} - Query result
   */
  async findOneWithCache(model, options = {}, cacheTTL = 300) {
    const startTime = Date.now();
    
    try {
      // Generate cache key
      const cacheKey = `findOne:${model.name}:${JSON.stringify(options)}`;
      
      // Try to get from cache first
      const cachedResult = await queryCache.getCachedQuery(cacheKey, options);
      if (cachedResult) {
        return cachedResult;
      }
      
      // Execute query
      const result = await model.findOne(options);
      
      // Cache the result
      await queryCache.cacheQuery(cacheKey, result, cacheTTL);
      
      // Track performance
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`SELECT ONE ${model.name}`, executionTime);
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`SELECT ONE ${model.name} (ERROR)`, executionTime);
      performanceMonitor.trackError(error, { model: model.name, options });
      throw error;
    }
  }

  /**
   * Optimized findByPk with caching
   * @param {Object} model - Sequelize model
   * @param {string|number} id - Primary key
   * @param {Object} options - Query options
   * @param {number} cacheTTL - Cache TTL in seconds
   * @returns {Promise<any>} - Query result
   */
  async findByPkWithCache(model, id, options = {}, cacheTTL = 300) {
    const startTime = Date.now();
    
    try {
      // Generate cache key
      const cacheKey = `findByPk:${model.name}:${id}:${JSON.stringify(options)}`;
      
      // Try to get from cache first
      const cachedResult = await queryCache.getCachedQuery(cacheKey, { id, ...options });
      if (cachedResult) {
        return cachedResult;
      }
      
      // Execute query
      const result = await model.findByPk(id, options);
      
      // Cache the result
      await queryCache.cacheQuery(cacheKey, result, cacheTTL);
      
      // Track performance
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`SELECT BY PK ${model.name}`, executionTime);
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`SELECT BY PK ${model.name} (ERROR)`, executionTime);
      performanceMonitor.trackError(error, { model: model.name, id, options });
      throw error;
    }
  }

  /**
   * Optimized count with caching
   * @param {Object} model - Sequelize model
   * @param {Object} options - Query options
   * @param {number} cacheTTL - Cache TTL in seconds
   * @returns {Promise<number>} - Count result
   */
  async countWithCache(model, options = {}, cacheTTL = 300) {
    const startTime = Date.now();
    
    try {
      // Generate cache key
      const cacheKey = `count:${model.name}:${JSON.stringify(options)}`;
      
      // Try to get from cache first
      const cachedResult = await queryCache.getCachedQuery(cacheKey, options);
      if (cachedResult !== null) {
        return cachedResult;
      }
      
      // Execute query
      const result = await model.count(options);
      
      // Cache the result
      await queryCache.cacheQuery(cacheKey, result, cacheTTL);
      
      // Track performance
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`COUNT ${model.name}`, executionTime);
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`COUNT ${model.name} (ERROR)`, executionTime);
      performanceMonitor.trackError(error, { model: model.name, options });
      throw error;
    }
  }

  /**
   * Create record and invalidate related cache
   * @param {Object} model - Sequelize model
   * @param {Object} data - Data to create
   * @param {Object} options - Create options
   * @returns {Promise<any>} - Created record
   */
  async createAndInvalidateCache(model, data, options = {}) {
    const startTime = Date.now();
    
    try {
      // Execute create
      const result = await model.create(data, options);
      
      // Invalidate cache for this table
      await queryCache.invalidateTable(model.name);
      
      // Track performance
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`INSERT ${model.name}`, executionTime);
      
      logger.info(`Record created in ${model.name}:`, { id: result.id });
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`INSERT ${model.name} (ERROR)`, executionTime);
      performanceMonitor.trackError(error, { model: model.name, data });
      throw error;
    }
  }

  /**
   * Update record and invalidate related cache
   * @param {Object} model - Sequelize model
   * @param {Object} data - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<any>} - Updated record
   */
  async updateAndInvalidateCache(model, data, options = {}) {
    const startTime = Date.now();
    
    try {
      // Execute update
      const result = await model.update(data, options);
      
      // Invalidate cache for this table
      await queryCache.invalidateTable(model.name);
      
      // Track performance
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`UPDATE ${model.name}`, executionTime);
      
      logger.info(`Record updated in ${model.name}:`, { affectedRows: result[0] });
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`UPDATE ${model.name} (ERROR)`, executionTime);
      performanceMonitor.trackError(error, { model: model.name, data, options });
      throw error;
    }
  }

  /**
   * Delete record and invalidate related cache
   * @param {Object} model - Sequelize model
   * @param {Object} options - Delete options
   * @returns {Promise<number>} - Number of deleted records
   */
  async deleteAndInvalidateCache(model, options = {}) {
    const startTime = Date.now();
    
    try {
      // Execute delete
      const result = await model.destroy(options);
      
      // Invalidate cache for this table
      await queryCache.invalidateTable(model.name);
      
      // Track performance
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`DELETE ${model.name}`, executionTime);
      
      logger.info(`Record deleted from ${model.name}:`, { deletedRows: result });
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`DELETE ${model.name} (ERROR)`, executionTime);
      performanceMonitor.trackError(error, { model: model.name, options });
      throw error;
    }
  }

  /**
   * Execute raw query with performance tracking
   * @param {string} query - SQL query
   * @param {Object} options - Query options
   * @returns {Promise<any>} - Query result
   */
  async executeRawQuery(query, options = {}) {
    const startTime = Date.now();
    
    try {
      const result = await db.query(query, options);
      
      // Track performance
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(query, executionTime);
      
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      performanceMonitor.trackDbQuery(`${query} (ERROR)`, executionTime);
      performanceMonitor.trackError(error, { query, options });
      throw error;
    }
  }

  /**
   * Get database connection status
   * @returns {Promise<Object>} - Connection status
   */
  async getConnectionStatus() {
    try {
      await db.authenticate();
      return {
        connected: true,
        dialect: db.getDialect(),
        database: db.getDatabaseName(),
        host: db.getHostname(),
        port: db.getPort()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const queryHelper = new OptimizedQueryHelper();

export default queryHelper;
