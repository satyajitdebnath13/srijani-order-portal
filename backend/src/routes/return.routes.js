import express from 'express';
import { body } from 'express-validator';
import {
  createReturn,
  getReturns,
  getReturnById,
  updateReturnStatus
} from '../controllers/returnController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Validation
const createReturnValidation = [
  body('order_id').isUUID().withMessage('Valid order ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('reason').isIn([
    'wrong_size',
    'wrong_color',
    'defective',
    'not_as_described',
    'changed_mind',
    'other'
  ]).withMessage('Valid reason is required'),
  body('return_type').isIn(['refund', 'exchange']).withMessage('Return type must be refund or exchange')
];

// Routes
router.post('/', authenticate, createReturnValidation, validateRequest, createReturn);
router.get('/', authenticate, getReturns);
router.get('/:returnId', authenticate, getReturnById);
router.put('/:returnId/status', authenticate, authorize('admin'), updateReturnStatus);

export default router;

