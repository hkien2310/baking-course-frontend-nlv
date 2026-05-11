const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const auth = require('../middleware/authMiddleware');

// Public routes
router.get('/siteConfig', settingController.getSiteConfig);
router.get('/loyalty', settingController.getLoyaltyConfig);

// Admin routes
router.put('/siteConfig', auth, settingController.updateSiteConfig);
router.put('/loyalty', auth, settingController.updateLoyaltyConfig);

module.exports = router;
