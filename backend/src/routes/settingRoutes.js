const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const auth = require('../middleware/authMiddleware');

// Public route to get config
router.get('/siteConfig', settingController.getSiteConfig);

// Admin route to update config
router.put('/siteConfig', auth, settingController.updateSiteConfig);

module.exports = router;
