import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateRequest as customValidateRequest } from '../utils/inputValidation.js';
import { videoValidationSchemas } from '../validation/videoSchemas.js';
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
  customValidateRequest(videoValidationSchemas.getUploadUrl),
  getUploadUrl
);

// Save video URL to order (after upload or link submission)
router.post(
  '/orders/:orderId/video',
  authenticate,
  customValidateRequest(videoValidationSchemas.saveVideoToOrder),
  saveVideoToOrder
);

// Upload video file directly (fallback method)
router.post(
  '/orders/:orderId/upload',
  authenticate,
  customValidateRequest(videoValidationSchemas.uploadVideoFile),
  uploadVideoFile
);

// Get video info for an order
router.get(
  '/orders/:orderId/video',
  authenticate,
  customValidateRequest(videoValidationSchemas.getOrderVideo),
  getOrderVideo
);

export default router;

