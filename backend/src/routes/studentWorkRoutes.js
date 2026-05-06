const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/studentWorkController');

// Public — get approved works
router.get('/approved', ctrl.getApprovedWorks);

// Authenticated user — submit work
router.post('/', auth, ctrl.submitWork);

// Admin routes (auth required, role check in controller if needed)
router.get('/all', auth, ctrl.getAllWorks);
router.patch('/:id/approve', auth, ctrl.approveWork);
router.patch('/:id/reject', auth, ctrl.rejectWork);
router.delete('/:id', auth, ctrl.deleteWork);

module.exports = router;
