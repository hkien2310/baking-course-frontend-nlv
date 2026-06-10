const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/authMiddleware');

router.get('/', categoryController.getAllCategories);
router.put('/reorder', auth, requirePermission('categories'), categoryController.reorderCategories);
router.post('/', auth, requirePermission('categories'), categoryController.createCategory);
router.put('/:id', auth, requirePermission('categories'), categoryController.updateCategory);
router.delete('/:id', auth, requirePermission('categories'), categoryController.deleteCategory);

module.exports = router;
