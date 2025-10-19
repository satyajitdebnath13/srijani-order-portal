/**
 * Validation Schemas for Video Routes
 * 
 * This module defines comprehensive validation schemas for all video-related endpoints
 * to ensure enterprise-grade input validation and security.
 */

export const videoValidationSchemas = {
  // Schema for saving video URL to order
  saveVideoToOrder: {
    params: {
      orderId: { type: 'uuid', required: true }
    },
    body: {
      videoUrl: { type: 'videoUrl', required: true },
      videoType: { 
        type: 'string', 
        required: true,
        enum: ['file', 'link']
      }
    }
  },

  // Schema for uploading video file
  uploadVideoFile: {
    params: {
      orderId: { type: 'uuid', required: true }
    },
    // File validation is handled by multer middleware
    file: {
      maxSize: 104857600, // 100MB
      allowedTypes: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
      allowedExtensions: ['mp4', 'mov', 'avi', 'webm']
    }
  },

  // Schema for getting upload URL
  getUploadUrl: {
    params: {
      orderId: { type: 'uuid', required: true }
    }
  },

  // Schema for getting order video
  getOrderVideo: {
    params: {
      orderId: { type: 'uuid', required: true }
    }
  }
};

export default videoValidationSchemas;
