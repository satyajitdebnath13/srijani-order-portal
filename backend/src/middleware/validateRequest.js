import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

/**
 * Middleware to handle express-validator validation results
 * This middleware checks for validation errors and returns them if present
 * Should be used after validation chains in route definitions
 * 
 * @example
 * router.post('/orders', 
 *   authenticate, 
 *   authorize('admin'), 
 *   createOrderValidation, 
 *   validateRequest,  // <-- Add this middleware
 *   createOrder
 * );
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors for debugging
    logger.warn('Validation failed', {
      url: req.url,
      method: req.method,
      errors: errors.array(),
      body: req.body,
      user: req.user?.id
    });
    
    // Return formatted errors to client
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  // No validation errors, proceed to next middleware/controller
  next();
};

/**
 * Alternative validation handler that runs validation chains imperatively
 * Useful for more complex validation scenarios
 * 
 * @param {Array} validations - Array of validation chains
 * @returns {Function} Middleware function
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations in parallel
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    logger.warn('Validation failed', {
      url: req.url,
      method: req.method,
      errors: errors.array(),
      body: req.body,
      user: req.user?.id
    });
    
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  };
};

export default validateRequest;

