const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Basic route to test the server
app.get('/api', (req, res) => {
  res.json({ message: 'Baking Course API is running' });
});

// Routes will be imported here
const programRoutes = require('./routes/programRoutes');
const postRoutes = require('./routes/postRoutes');
const chiefRoutes = require('./routes/chiefRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contactRoutes = require('./routes/contactRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentConfigRoutes = require('./routes/paymentConfigRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const vnpayRoutes = require('./routes/vnpayRoutes');
const statsRoutes = require('./routes/statsRoutes');
const settingRoutes = require('./routes/settingRoutes');
const studentWorkRoutes = require('./routes/studentWorkRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');

app.use('/api/programs', programRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chiefs', chiefRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment-config', paymentConfigRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/vnpay', vnpayRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/student-work', studentWorkRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Schedule daily cleanup of orphan uploaded files at 3:00 AM
  const cron = require('node-cron');
  const { PrismaClient } = require('@prisma/client');
  const fs = require('fs');
  const path = require('path');

  cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Starting daily orphan file cleanup...');
    try {
      const prisma = new PrismaClient();
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) return;

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
      programs.forEach(p => { if (p.thumbnail) referencedUrls.add(p.thumbnail); if (p.authorImage) referencedUrls.add(p.authorImage); });
      posts.forEach(p => { if (p.thumbnail) referencedUrls.add(p.thumbnail); });
      chiefs.forEach(c => { if (c.image) referencedUrls.add(c.image); });
      orders.forEach(o => { if (o.proofImage) referencedUrls.add(o.proofImage); });
      paymentConfigs.forEach(pc => { if (pc.qrImage) referencedUrls.add(pc.qrImage); });

      const orphans = filesOnDisk.filter(f => !referencedUrls.has(f));
      let deleted = 0, freedBytes = 0;

      orphans.forEach(fileUrl => {
        try {
          const filePath = path.join(process.cwd(), fileUrl);
          freedBytes += fs.statSync(filePath).size;
          fs.unlinkSync(filePath);
          deleted++;
        } catch (e) { /* skip */ }
      });

      await prisma.$disconnect();
      const freedMB = (freedBytes / 1024 / 1024).toFixed(2);
      console.log(`[CRON] Cleanup done: ${deleted} orphan files deleted, ${freedMB} MB freed.`);
    } catch (err) {
      console.error('[CRON] Cleanup failed:', err.message);
    }
  });
});
