import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Generate a signed upload URL for direct frontend uploads
 * @param {string} folder - Folder name in Cloudinary
 * @param {string} publicId - Optional public ID for the video
 * @returns {Promise<Object>} - Signed upload parameters
 */
export const generateSignedUploadUrl = async (folder = 'package_videos', publicId = null) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadPreset = 'package_opening_videos'; // You can create this in Cloudinary dashboard
    
    const params = {
      timestamp,
      folder,
      resource_type: 'video',
      allowed_formats: 'mp4,mov,avi,webm',
      max_file_size: 104857600, // 100 MB
      ...(publicId && { public_id: publicId })
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    return {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
    };
  } catch (error) {
    logger.error('Error generating signed upload URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

/**
 * Upload video directly from backend (for admin uploads)
 * @param {string} filePath - Path to video file or buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with URL
 */
export const uploadVideo = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: options.folder || 'package_videos',
      allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
      max_file_size: 104857600, // 100 MB
      ...options
    });

    logger.info(`Video uploaded successfully: ${result.public_id}`);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
      size: result.bytes,
      width: result.width,
      height: result.height,
      createdAt: result.created_at
    };
  } catch (error) {
    logger.error('Error uploading video to Cloudinary:', error);
    throw new Error('Failed to upload video');
  }
};

/**
 * Delete video from Cloudinary
 * @param {string} publicId - Public ID of the video
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteVideo = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video'
    });

    logger.info(`Video deleted successfully: ${publicId}`);
    return result;
  } catch (error) {
    logger.error('Error deleting video from Cloudinary:', error);
    throw new Error('Failed to delete video');
  }
};

/**
 * Validate video URL (for external links like YouTube, Google Drive)
 * @param {string} url - Video URL to validate
 * @returns {Object} - Validation result with type
 */
export const validateVideoLink = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return { valid: true, type: 'youtube', url };
    }

    // Google Drive
    if (hostname.includes('drive.google.com')) {
      return { valid: true, type: 'google_drive', url };
    }

    // Vimeo
    if (hostname.includes('vimeo.com')) {
      return { valid: true, type: 'vimeo', url };
    }

    // Cloudinary (our own uploads)
    if (hostname.includes('cloudinary.com')) {
      return { valid: true, type: 'cloudinary', url };
    }

    // Other valid URLs (must be https)
    if (urlObj.protocol === 'https:') {
      return { valid: true, type: 'external', url };
    }

    return { valid: false, error: 'Unsupported video link. Please use YouTube, Google Drive, Vimeo, or upload directly.' };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Get video metadata from Cloudinary
 * @param {string} publicId - Public ID of the video
 * @returns {Promise<Object>} - Video metadata
 */
export const getVideoMetadata = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'video'
    });

    return {
      url: result.secure_url,
      format: result.format,
      duration: result.duration,
      size: result.bytes,
      width: result.width,
      height: result.height,
      createdAt: result.created_at
    };
  } catch (error) {
    logger.error('Error fetching video metadata:', error);
    throw new Error('Failed to fetch video metadata');
  }
};

export default {
  generateSignedUploadUrl,
  uploadVideo,
  deleteVideo,
  validateVideoLink,
  getVideoMetadata
};

