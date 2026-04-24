const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

/**
 * GET /api/stats/orphan-files
 * Scan the uploads directory and compare against all image URLs in the database.
 * Returns a list of files on disk that are NOT referenced by any record.
 */
exports.getOrphanFiles = async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ orphanFiles: [], totalUploads: 0, totalReferenced: 0 });
    }

    // 1. Get all files on disk
    const filesOnDisk = fs.readdirSync(uploadsDir)
      .filter(f => !f.startsWith('.'))
      .map(f => `/uploads/${f}`);

    // 2. Collect all image URLs from database
    const [programs, posts, chiefs, orders, paymentConfigs] = await Promise.all([
      prisma.program.findMany({ select: { thumbnail: true, authorImage: true } }),
      prisma.post.findMany({ select: { thumbnail: true } }),
      prisma.chief.findMany({ select: { image: true } }),
      prisma.order.findMany({ select: { proofImage: true } }),
      prisma.paymentConfig.findMany({ select: { qrImage: true } }),
    ]);

    const referencedUrls = new Set();

    programs.forEach(p => {
      if (p.thumbnail) referencedUrls.add(p.thumbnail);
      if (p.authorImage) referencedUrls.add(p.authorImage);
    });
    posts.forEach(p => { if (p.thumbnail) referencedUrls.add(p.thumbnail); });
    chiefs.forEach(c => { if (c.image) referencedUrls.add(c.image); });
    orders.forEach(o => { if (o.proofImage) referencedUrls.add(o.proofImage); });
    paymentConfigs.forEach(pc => { if (pc.qrImage) referencedUrls.add(pc.qrImage); });

    // 3. Find orphans
    const orphanFiles = filesOnDisk.filter(f => !referencedUrls.has(f));

    res.json({
      totalUploads: filesOnDisk.length,
      totalReferenced: referencedUrls.size,
      orphanCount: orphanFiles.length,
      orphanFiles,
    });
  } catch (error) {
    console.error('getOrphanFiles error:', error);
    res.status(500).json({ error: 'Failed to scan for orphan files' });
  }
};

/**
 * DELETE /api/stats/orphan-files
 * Delete all orphan files from disk.
 */
exports.deleteOrphanFiles = async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ deleted: 0, freedBytes: 0 });
    }

    // Reuse the scan logic
    const filesOnDisk = fs.readdirSync(uploadsDir)
      .filter(f => !f.startsWith('.'))
      .map(f => `/uploads/${f}`);

    const [programs, posts, chiefs, orders, paymentConfigs] = await Promise.all([
      prisma.program.findMany({ select: { thumbnail: true, authorImage: true } }),
      prisma.post.findMany({ select: { thumbnail: true } }),
      prisma.chief.findMany({ select: { image: true } }),
      prisma.order.findMany({ select: { proofImage: true } }),
      prisma.paymentConfig.findMany({ select: { qrImage: true } }),
    ]);

    const referencedUrls = new Set();
    programs.forEach(p => {
      if (p.thumbnail) referencedUrls.add(p.thumbnail);
      if (p.authorImage) referencedUrls.add(p.authorImage);
    });
    posts.forEach(p => { if (p.thumbnail) referencedUrls.add(p.thumbnail); });
    chiefs.forEach(c => { if (c.image) referencedUrls.add(c.image); });
    orders.forEach(o => { if (o.proofImage) referencedUrls.add(o.proofImage); });
    paymentConfigs.forEach(pc => { if (pc.qrImage) referencedUrls.add(pc.qrImage); });

    const orphanFiles = filesOnDisk.filter(f => !referencedUrls.has(f));

    let deleted = 0;
    let freedBytes = 0;

    orphanFiles.forEach(fileUrl => {
      const filePath = path.join(process.cwd(), fileUrl);
      try {
        const stats = fs.statSync(filePath);
        freedBytes += stats.size;
        fs.unlinkSync(filePath);
        deleted++;
        console.log(`[GC] Deleted orphan: ${fileUrl}`);
      } catch (err) {
        console.warn(`[GC] Failed to delete ${fileUrl}:`, err.message);
      }
    });

    const freedMB = (freedBytes / 1024 / 1024).toFixed(2);

    res.json({
      deleted,
      freedBytes,
      freedMB: `${freedMB} MB`,
      message: `Đã dọn sạch ${deleted} file rác, giải phóng ${freedMB} MB.`
    });
  } catch (error) {
    console.error('deleteOrphanFiles error:', error);
    res.status(500).json({ error: 'Failed to delete orphan files' });
  }
};
