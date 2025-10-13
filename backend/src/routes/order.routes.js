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

const router = express.Router();

// Validation
const createOrderValidation = [
  body('customer_id').isUUID().withMessage('Valid customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_name').notEmpty().withMessage('Product name is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be valid')
];

// Routes
router.post('/', authenticate, authorize('admin'), createOrderValidation, createOrder);
router.post('/:orderId/approve', authenticate, approveOrder);
router.put('/:orderId/status', authenticate, authorize('admin'), updateOrderStatus);
router.get('/stats', authenticate, authorize('admin'), getOrderStats);
router.get('/recent', authenticate, authorize('admin'), getRecentOrders);
router.get('/', authenticate, getOrders);
router.get('/:orderId', authenticate, getOrderById);
router.get('/:orderId/invoice', authenticate, downloadInvoice);

export default router;

