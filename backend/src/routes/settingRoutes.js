const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/siteConfig', settingController.getSiteConfig);
router.get('/loyalty', settingController.getLoyaltyConfig);

// Admin only routes
router.put('/siteConfig', auth, requireRole('ADMIN'), settingController.updateSiteConfig);
router.put('/loyalty', auth, requireRole('ADMIN'), settingController.updateLoyaltyConfig);

module.exports = router;
