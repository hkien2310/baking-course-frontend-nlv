const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { generateSlug } = require('../utils/slugify');

exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;

    const whereClause = category ? { category } : {};

    if (page) {
      const skip = (page - 1) * limit;
      const totalItems = await prisma.post.count({ where: whereClause });
      const posts = await prisma.post.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
      return res.json({
        data: posts,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        totalItems
      });
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching posts' });
  }
};

// Categories are now managed by categoryController

exports.getPostByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;
    let post = await prisma.post.findUnique({ where: { slug: identifier } });
    
    if (!post) {
      post = await prisma.post.findUnique({ where: { id: identifier } });
    }

    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post details' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.slug) {
      payload.slug = generateSlug(payload.title);
    }
    const post = await prisma.post.create({ data: payload });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const identifier = req.params.id;
    let existingPost = await prisma.post.findUnique({ where: { slug: identifier } }).catch(() => null);
    if (!existingPost) {
      existingPost = await prisma.post.findUnique({ where: { id: identifier } }).catch(() => null);
    }
    if (!existingPost) return res.status(404).json({ error: 'Post not found' });

    const payload = { ...req.body };
    if (!payload.slug && payload.title) {
      payload.slug = generateSlug(payload.title);
    }
    const post = await prisma.post.update({
      where: { id: existingPost.id },
      data: payload
    });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update post' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const identifier = req.params.id;
    let existingPost = await prisma.post.findUnique({ where: { slug: identifier } }).catch(() => null);
    if (!existingPost) {
      existingPost = await prisma.post.findUnique({ where: { id: identifier } }).catch(() => null);
    }
    if (!existingPost) return res.status(404).json({ error: 'Post not found for deletion' });

    await prisma.post.delete({ where: { id: existingPost.id } });

    // Clean up uploaded thumbnail
    const { deleteUploadedFile } = require('../utils/fileCleanup');
    deleteUploadedFile(existingPost.thumbnail);

    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
