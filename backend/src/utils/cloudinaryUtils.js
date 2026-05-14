const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;
  
  try {
    const parts = imageUrl.split('/');
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return;
    
    const pathParts = parts.slice(uploadIndex + 2);
    const fullPath = pathParts.join('/');
    const publicId = fullPath.substring(0, fullPath.lastIndexOf('.'));
    
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`[Cloudinary] Deleted: ${publicId}`);
    }
  } catch (error) {
    console.error(`[Cloudinary] Error deleting image:`, error);
  }
};

module.exports = { cloudinary, deleteFromCloudinary };
