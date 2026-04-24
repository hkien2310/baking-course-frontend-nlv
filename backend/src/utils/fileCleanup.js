const fs = require('fs');
const path = require('path');

/**
 * Delete an uploaded file from disk if it's a local /uploads/ path.
 * Safe to call with null/undefined/external URLs — they're ignored.
 * @param {string|null} fileUrl - e.g. "/uploads/image-1713926391000-123.jpg"
 */
const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;

  const filePath = path.join(process.cwd(), fileUrl);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Cleanup] Deleted: ${fileUrl}`);
    }
  } catch (err) {
    // Non-critical: log but don't throw
    console.warn(`[Cleanup] Failed to delete ${fileUrl}:`, err.message);
  }
};

/**
 * Delete multiple uploaded files at once.
 * @param {string[]} urls - array of file URLs
 */
const deleteUploadedFiles = (urls) => {
  if (!Array.isArray(urls)) return;
  urls.forEach(deleteUploadedFile);
};

module.exports = { deleteUploadedFile, deleteUploadedFiles };
