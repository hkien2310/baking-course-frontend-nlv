const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');

router.get('/', postController.getAllPosts);
router.post('/', auth, postController.createPost);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);


router.get('/:identifier', postController.getPostByIdOrSlug);

module.exports = router;
