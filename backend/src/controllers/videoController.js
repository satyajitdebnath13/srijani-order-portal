import db from '../models/index.js';
import logger from '../utils/logger.js';
import { generateSignedUploadUrl, validateVideoLink, uploadVideo } from '../services/videoService.js';
import multer from 'multer';
import path from 'path';

const { Order, ActivityLog } = db;

// Configure multer for video uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 104857600 // 100 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, AVI, and WEBM are allowed.'));
    }
  }
}).single('video');

/**
 * Generate signed upload URL for direct frontend uploads
 */
export const getUploadUrl = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify order exists and user has access
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization (customer owns order or admin)
    if (req.user.role !== 'admin' && order.customer_id !== req.user.customerProfile?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const uploadParams = await generateSignedUploadUrl('package_videos', `order_${orderId}`);

    res.json({
      uploadParams,
      message: 'Upload URL generated successfully'
    });
  } catch (error) {
    logger.error('Get upload URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};

/**
 * Save video URL to order (after frontend upload or link submission)
 */
export const saveVideoToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { videoUrl, videoType } = req.body;

    if (!videoUrl || !videoType) {
      return res.status(400).json({ error: 'Video URL and type are required' });
    }

    if (!['file', 'link'].includes(videoType)) {
      return res.status(400).json({ error: 'Invalid video type' });
    }

    // Verify order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.customer_id !== req.user.customerProfile?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate video link if type is 'link'
    if (videoType === 'link') {
      const validation = validateVideoLink(videoUrl);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
    }

    // Update order with video info
    await order.update({
      package_video_url: videoUrl,
      package_video_type: videoType,
      video_uploaded_at: new Date()
    });

    // Log activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'package_video_uploaded',
      entity_type: 'order',
      entity_id: order.id,
      details: {
        video_type: videoType,
        order_number: order.order_number
      },
      ip_address: req.ip
    });

    logger.info(`Package video uploaded for order ${order.order_number} by user ${req.user.email}`);

    res.json({
      message: 'Video saved successfully',
      order: {
        id: order.id,
        order_number: order.order_number,
        package_video_url: order.package_video_url,
        package_video_type: order.package_video_type,
        video_uploaded_at: order.video_uploaded_at
      }
    });
  } catch (error) {
    logger.error('Save video to order error:', error);
    res.status(500).json({ error: 'Failed to save video' });
  }
};

/**
 * Upload video directly (for admin or fallback)
 */
export const uploadVideoFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      logger.error('Video upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { orderId } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      // Verify order exists
      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && order.customer_id !== req.user.customerProfile?.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Upload to Cloudinary
      const result = await uploadVideo(req.file.buffer, {
        folder: 'package_videos',
        public_id: `order_${orderId}_${Date.now()}`
      });

      // Update order
      await order.update({
        package_video_url: result.url,
        package_video_type: 'file',
        video_uploaded_at: new Date()
      });

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action: 'package_video_uploaded',
        entity_type: 'order',
        entity_id: order.id,
        details: {
          video_type: 'file',
          file_size: result.size,
          duration: result.duration,
          order_number: order.order_number
        },
        ip_address: req.ip
      });

      logger.info(`Package video uploaded for order ${order.order_number}`);

      res.json({
        message: 'Video uploaded successfully',
        video: result,
        order: {
          id: order.id,
          order_number: order.order_number,
          package_video_url: order.package_video_url
        }
      });
    } catch (error) {
      logger.error('Upload video file error:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  });
};

/**
 * Get video info for an order
 */
export const getOrderVideo = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      attributes: ['id', 'order_number', 'package_video_url', 'package_video_type', 'video_uploaded_at']
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.customer_id !== req.user.customerProfile?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      video: {
        url: order.package_video_url,
        type: order.package_video_type,
        uploaded_at: order.video_uploaded_at
      }
    });
  } catch (error) {
    logger.error('Get order video error:', error);
    res.status(500).json({ error: 'Failed to get video info' });
  }
};

export default {
  getUploadUrl,
  saveVideoToOrder,
  uploadVideoFile,
  getOrderVideo
};

