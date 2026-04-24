const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const cleanupController = require('../controllers/cleanupController');
const auth = require('../middleware/authMiddleware');

router.get('/', statsController.getDashboardStats);

// Garbage collector: preview then clean orphan uploads
router.get('/orphan-files', auth, cleanupController.getOrphanFiles);
router.delete('/orphan-files', auth, cleanupController.deleteOrphanFiles);

module.exports = router;
