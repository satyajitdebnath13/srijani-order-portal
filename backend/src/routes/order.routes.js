import express from 'express';
import { body, param } from 'express-validator';
import {
  createOrder,
  approveOrder,
  updateOrderStatus,
  getOrders,
  getOrderById,
  downloadInvoice,
  getOrderStats,
  getRecentOrders
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest, validate } from '../middleware/validateRequest.js';

const router = express.Router();

// Validation
const createOrderValidation = [
  body('customer_id').optional().isUUID().withMessage('Valid customer ID is required'),
  body('customer_email').optional().isEmail().withMessage('Valid customer email is required'),
  body('customer_name').optional().notEmpty().withMessage('Customer name is required'),
  body('customer_phone').optional().isString().withMessage('Customer phone must be a string'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_name').notEmpty().withMessage('Product name is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be valid'),
  // Custom validation to ensure either customer_id OR customer_email+name is provided
  body().custom((value) => {
    if (!value.customer_id && (!value.customer_email || !value.customer_name)) {
      throw new Error('Either customer_id or both customer_email and customer_name are required');
    }
    return true;
  })
];

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const db = await import('../models/index.js');
    await db.default.sequelize.authenticate();
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test email endpoint
router.post('/test-email', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { sendOrderApprovalEmail } = await import('../services/emailService.js');
    
    // Create a test order object
    const testOrder = {
      order_number: 'TEST-123',
      total_amount: 100,
      currency: 'EUR',
      created_at: new Date()
    };
    
    const testCustomer = {
      name: 'Test Customer',
      user: {
        email: req.body.testEmail || 'test@example.com'
      }
    };
    
    const testItems = [{
      product_name: 'Test Product',
      quantity: 1,
      unit_price: 100,
      subtotal: 100
    }];
    
    const result = await sendOrderApprovalEmail(testOrder, testCustomer, testItems);
    
    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Test email failed',
      error: result.error || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

// Debug endpoint
router.post('/debug', authenticate, authorize('admin'), (req, res) => {
  try {
    res.json({
      message: 'Debug endpoint working',
      user: req.user,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Routes
router.post('/', authenticate, authorize('admin'), validate(createOrderValidation), createOrder);
router.post('/:orderId/approve', authenticate, approveOrder);
router.put('/:orderId/status', authenticate, authorize('admin'), updateOrderStatus);
router.get('/stats', authenticate, authorize('admin'), getOrderStats);
router.get('/recent', authenticate, authorize('admin'), getRecentOrders);
router.get('/', authenticate, getOrders);
router.get('/:orderId', authenticate, getOrderById);
router.get('/:orderId/invoice', authenticate, downloadInvoice);

export default router;

