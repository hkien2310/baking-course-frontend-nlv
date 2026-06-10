const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/studentWorkController');

// Public — get approved works
router.get('/approved', ctrl.getApprovedWorks);

// Authenticated user — submit work
router.post('/', auth, ctrl.submitWork);

// Admin only routes
router.get('/all', auth, requireRole('ADMIN'), ctrl.getAllWorks);
router.post('/admin', auth, requireRole('ADMIN'), ctrl.adminCreateWork);
router.put('/:id', auth, requireRole('ADMIN'), ctrl.updateWork);
router.patch('/:id/approve', auth, requireRole('ADMIN'), ctrl.approveWork);
router.patch('/:id/reject', auth, requireRole('ADMIN'), ctrl.rejectWork);
router.delete('/:id', auth, requireRole('ADMIN'), ctrl.deleteWork);

module.exports = router;
