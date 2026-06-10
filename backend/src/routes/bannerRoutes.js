const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

router.get('/', bannerController.getAllBanners);
router.post('/', auth, requireRole('ADMIN'), bannerController.createBanner);
router.put('/reorder', auth, requireRole('ADMIN'), bannerController.reorderBanners);
router.put('/:id', auth, requireRole('ADMIN'), bannerController.updateBanner);
router.delete('/:id', auth, requireRole('ADMIN'), bannerController.deleteBanner);

module.exports = router;
