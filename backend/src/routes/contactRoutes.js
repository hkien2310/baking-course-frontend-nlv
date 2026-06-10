const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

// Public route to submit a form
router.post('/', contactController.submitContact);

// Admin only routes
router.get('/', auth, requireRole('ADMIN'), contactController.getAllContacts);
router.delete('/:id', auth, requireRole('ADMIN'), contactController.deleteContact);

module.exports = router;
