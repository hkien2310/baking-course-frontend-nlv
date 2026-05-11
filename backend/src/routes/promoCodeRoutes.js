const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promoCodeController');
const auth = require('../middleware/authMiddleware');

// Public — user validate mã khi checkout
router.post('/validate', ctrl.validate);

// Admin only
router.get('/', auth, ctrl.getAll);
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
