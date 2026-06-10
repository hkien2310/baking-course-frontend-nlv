const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promoCodeController');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

// Public — user validate mã khi checkout
router.post('/validate', ctrl.validate);

// Admin only
router.get('/', auth, requireRole('ADMIN'), ctrl.getAll);
router.post('/', auth, requireRole('ADMIN'), ctrl.create);
router.put('/:id', auth, requireRole('ADMIN'), ctrl.update);
router.delete('/:id', auth, requireRole('ADMIN'), ctrl.remove);

module.exports = router;
