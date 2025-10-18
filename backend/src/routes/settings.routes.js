import express from 'express';
import { body } from 'express-validator';
import {
  getOrderStatuses,
  createOrderStatus,
  updateOrderStatus,
  reorderStatuses,
  getSiteSetting,
  updateSiteSetting
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Order Status Routes
router.get('/order-statuses', authenticate, authorize('admin'), getOrderStatuses);
router.post('/order-statuses', authenticate, authorize('admin'), [
  body('value').notEmpty().withMessage('Status value is required'),
  body('label').notEmpty().withMessage('Status label is required')
], validateRequest, createOrderStatus);
router.put('/order-statuses/:statusId', authenticate, authorize('admin'), updateOrderStatus);
router.put('/order-statuses/reorder', authenticate, authorize('admin'), [
  body('statusIds').isArray().withMessage('statusIds must be an array')
], validateRequest, reorderStatuses);

// Site Settings Routes
router.get('/site/:key', getSiteSetting); // Public endpoint for legal pages
router.put('/site/:key', authenticate, authorize('admin'), [
  body('value').notEmpty().withMessage('Setting value is required')
], validateRequest, updateSiteSetting);

export default router;

