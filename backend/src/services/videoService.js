import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';
import { validateVideoUrl } from '../utils/urlValidation.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.error(`Missing Cloudinary environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing Cloudinary configuration: ${missing.join(', ')}`);
  }
  
  logger.info('Cloudinary configuration validated successfully');
};

/**
 * Generate a signed upload URL for direct frontend uploads
 * @param {string} folder - Folder name in Cloudinary
 * @param {string} publicId - Optional public ID for the video
 * @returns {Promise<Object>} - Signed upload parameters
 */
export const generateSignedUploadUrl = async (folder = 'package_videos', publicId = null) => {
  try {
    validateCloudinaryConfig();
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const params = {
      timestamp,
      folder,
      resource_type: 'video',
      allowed_formats: 'mp4,mov,avi,webm',
      max_file_size: 104857600, // 100 MB
      ...(publicId && { public_id: publicId })
    };

    logger.info(`Generating signed upload URL for folder: ${folder}, publicId: ${publicId || 'auto-generated'}`);

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    const result = {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
    };

    logger.info('Signed upload URL generated successfully');
    return result;
  } catch (error) {
    logger.error('Error generating signed upload URL:', error);
    throw new Error(`Failed to generate upload URL: ${error.message}`);
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
    validateCloudinaryConfig();
    
    logger.info(`Starting video upload to Cloudinary with options:`, {
      folder: options.folder || 'package_videos',
      publicId: options.public_id || 'auto-generated',
      fileSize: filePath.length || 'unknown'
    });

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: options.folder || 'package_videos',
      allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
      max_file_size: 104857600, // 100 MB
      ...options
    });

    logger.info(`Video uploaded successfully:`, {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      duration: result.duration
    });

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
    logger.error('Error uploading video to Cloudinary:', {
      error: error.message,
      stack: error.stack,
      options: options
    });
    throw new Error(`Failed to upload video: ${error.message}`);
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
    logger.info(`Validating video URL: ${url}`);
    
    const validation = validateVideoUrl(url);
    
    if (!validation.isValid) {
      logger.warn(`Video URL validation failed: ${validation.error}`);
      return { 
        valid: false, 
        error: validation.error,
        securityFlags: validation.securityFlags || []
      };
    }

    // Log security flags if any
    if (validation.securityFlags && validation.securityFlags.length > 0) {
      logger.warn(`Video URL has security flags: ${validation.securityFlags.join(', ')}`);
    }

    logger.info(`Video URL validation successful: ${validation.platform} - ${validation.videoId}`);
    
    return { 
      valid: true, 
      type: validation.videoType,
      platform: validation.platform,
      videoId: validation.videoId,
      url: validation.sanitizedUrl,
      securityFlags: validation.securityFlags || []
    };
  } catch (error) {
    logger.error('Error validating video URL:', error);
    return { 
      valid: false, 
      error: 'Invalid URL format or validation error',
      securityFlags: ['validation_error']
    };
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

