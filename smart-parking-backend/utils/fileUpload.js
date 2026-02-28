// File Upload Utility — Cloudinary via express-fileupload
const cloudinary = require('../config/cloudinary');

/**
 * Upload a file to Cloudinary.
 *
 * @param {Object} file    - File object from req.files (express-fileupload)
 * @param {string} folder  - Cloudinary destination folder
 * @param {number} [quality] - Optional quality (1–100)
 * @param {number} [height]  - Optional height constraint
 * @returns {Promise<Object>} Cloudinary upload result
 */
exports.uploadFiles = async (file, folder, quality, height) => {
  try {
    const option = { folder };

    if (quality) option.quality = quality;
    if (height)  option.height  = height;

    option.resource_type = 'auto'; // handles images and videos

    const result = await cloudinary.uploader.upload(file.tempFilePath, option);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    return {
      success: false,
      message: 'Image upload failed',
    };
  }
};
