import express from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  getUploadUrl,
  saveVideoToOrder,
  uploadVideoFile,
  getOrderVideo
} from '../controllers/videoController.js';

const router = express.Router();

// Get signed upload URL for direct frontend uploads
router.get(
  '/orders/:orderId/upload-url',
  authenticate,
  param('orderId').isUUID().withMessage('Invalid order ID'),
  validateRequest,
  getUploadUrl
);

// Save video URL to order (after upload or link submission)
router.post(
  '/orders/:orderId/video',
  authenticate,
  [
    param('orderId').isUUID().withMessage('Invalid order ID'),
    body('videoUrl').notEmpty().withMessage('Video URL is required'),
    body('videoType').isIn(['file', 'link']).withMessage('Video type must be either "file" or "link"')
  ],
  validateRequest,
  saveVideoToOrder
);

// Upload video file directly (fallback method)
router.post(
  '/orders/:orderId/upload',
  authenticate,
  param('orderId').isUUID().withMessage('Invalid order ID'),
  validateRequest,
  uploadVideoFile
);

// Get video info for an order
router.get(
  '/orders/:orderId/video',
  authenticate,
  param('orderId').isUUID().withMessage('Invalid order ID'),
  validateRequest,
  getOrderVideo
);

export default router;

