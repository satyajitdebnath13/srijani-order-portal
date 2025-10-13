import express from 'express';
import { body } from 'express-validator';
import {
  createTicket,
  getTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus,
  getRecentTickets
} from '../controllers/supportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation
const createTicketValidation = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('category').isIn([
    'order_inquiry',
    'product_question',
    'shipping_issue',
    'return_exchange',
    'payment_issue',
    'quality_concern',
    'general_inquiry',
    'complaint'
  ]).withMessage('Valid category is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

const replyValidation = [
  body('message').trim().notEmpty().withMessage('Message is required')
];

// Routes
router.post('/', authenticate, createTicketValidation, createTicket);
router.get('/recent', authenticate, authorize('admin'), getRecentTickets);
router.get('/', authenticate, getTickets);
router.get('/:ticketId', authenticate, getTicketById);
router.post('/:ticketId/reply', authenticate, replyValidation, replyToTicket);
router.put('/:ticketId/status', authenticate, authorize('admin'), updateTicketStatus);

export default router;

