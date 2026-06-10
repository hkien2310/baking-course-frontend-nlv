const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/authMiddleware');

router.get('/', postController.getAllPosts);
router.post('/', auth, requirePermission('posts'), postController.createPost);
router.put('/:id', auth, requirePermission('posts'), postController.updatePost);
router.delete('/:id', auth, requirePermission('posts'), postController.deletePost);

router.get('/:identifier', postController.getPostByIdOrSlug);

module.exports = router;
