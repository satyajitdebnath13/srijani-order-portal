import db from '../models/index.js';
import logger from '../utils/logger.js';
import { generateSignedUploadUrl, validateVideoLink, uploadVideo } from '../services/videoService.js';
import { validateRequest } from '../utils/inputValidation.js';
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
        logger.warn('Video URL validation failed:', { 
          error: validation.error, 
          url: videoUrl,
          orderId,
          userId: req.user.id 
        });
        return res.status(400).json({ 
          error: validation.error,
          securityFlags: validation.securityFlags || []
        });
      }

      // Log security flags if any
      if (validation.securityFlags && validation.securityFlags.length > 0) {
        logger.warn('Video URL has security flags:', { 
          flags: validation.securityFlags, 
          url: videoUrl,
          orderId,
          userId: req.user.id 
        });
      }

      // Use sanitized URL
      videoUrl = validation.url;
    }

    // Update order with video info
    await order.update({
      package_video_url: videoUrl,
      package_video_type: videoType,
      video_uploaded_at: new Date()
    });

    // Log activity with enhanced security information
    const activityDetails = {
      video_type: videoType,
      order_number: order.order_number,
      platform: videoType === 'link' ? validation?.platform : 'cloudinary',
      video_id: videoType === 'link' ? validation?.videoId : null,
      security_flags: videoType === 'link' ? (validation?.securityFlags || []) : []
    };

    await ActivityLog.create({
      user_id: req.user.id,
      action: 'package_video_uploaded',
      entity_type: 'order',
      entity_id: order.id,
      details: activityDetails,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
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
      logger.error('Video upload multer error:', {
        error: err.message,
        code: err.code,
        field: err.field
      });
      return res.status(400).json({ error: err.message });
    }

    try {
      const { orderId } = req.params;

      logger.info(`Starting video upload for order ${orderId}`, {
        userId: req.user.id,
        userEmail: req.user.email,
        fileSize: req.file?.size,
        fileType: req.file?.mimetype
      });

      if (!req.file) {
        logger.error('No video file provided in request');
        return res.status(400).json({ error: 'No video file provided' });
      }

      // Verify order exists
      const order = await Order.findByPk(orderId);
      if (!order) {
        logger.error(`Order not found: ${orderId}`);
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && order.customer_id !== req.user.customerProfile?.id) {
        logger.error(`Unauthorized video upload attempt for order ${orderId} by user ${req.user.email}`);
        return res.status(403).json({ error: 'Unauthorized' });
      }

      logger.info(`Uploading video to Cloudinary for order ${order.order_number}`, {
        fileSize: req.file.size,
        fileName: req.file.originalname,
        fileType: req.file.mimetype
      });

      // Upload to Cloudinary
      const result = await uploadVideo(req.file.buffer, {
        folder: 'package_videos',
        public_id: `order_${orderId}_${Date.now()}`
      });

      logger.info(`Cloudinary upload successful for order ${order.order_number}`, {
        cloudinaryUrl: result.url,
        publicId: result.publicId,
        fileSize: result.size
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
          order_number: order.order_number,
          cloudinary_url: result.url,
          public_id: result.publicId
        },
        ip_address: req.ip
      });

      logger.info(`Package video uploaded successfully for order ${order.order_number}`, {
        videoUrl: result.url,
        orderId: order.id
      });

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
      logger.error('Upload video file error:', {
        error: error.message,
        stack: error.stack,
        orderId: req.params.orderId,
        userId: req.user?.id
      });
      res.status(500).json({ 
        error: 'Failed to upload video',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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

