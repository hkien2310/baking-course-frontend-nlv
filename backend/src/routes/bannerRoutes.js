const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const auth = require('../middleware/authMiddleware');

router.get('/', bannerController.getAllBanners);
router.post('/', auth, bannerController.createBanner);
router.put('/reorder', auth, bannerController.reorderBanners);
router.put('/:id', auth, bannerController.updateBanner);
router.delete('/:id', auth, bannerController.deleteBanner);

module.exports = router;
