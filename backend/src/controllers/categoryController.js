const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { generateSlug } = require('../utils/slugify');

exports.getAllCategories = async (req, res) => {
  try {
    const { includeInactive, type } = req.query;
    const where = {};
    if (includeInactive !== 'true') {
      where.isActive = true;
    }
    if (type) {
      where.type = type;
    }
    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, sortOrder, isActive, type } = req.body;
    const catType = type || 'PROGRAM';
    
    // Check if name already exists for this type
    const existing = await prisma.category.findUnique({ 
      where: { name_type: { name, type: catType } } 
    });
    if (existing) {
      return res.status(400).json({ error: 'Danh mục với tên này đã tồn tại.' });
    }

    const finalSlug = slug || generateSlug(name);
    
    // Also check slug
    const existingSlug = await prisma.category.findUnique({
      where: { slug_type: { slug: finalSlug, type: catType } }
    });
    if (existingSlug) {
      return res.status(400).json({ error: 'Đường dẫn (slug) này đã tồn tại.' });
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        type: catType,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, sortOrder, isActive, type } = req.body;
    
    // Fetch current category first to know its type
    const currentCat = await prisma.category.findUnique({ where: { id } });
    if (!currentCat) return res.status(404).json({ error: 'Không tìm thấy danh mục' });

    const catType = type || currentCat.type;

    if (name) {
      const existing = await prisma.category.findUnique({ 
        where: { name_type: { name, type: catType } } 
      });
      if (existing && existing.id !== id) {
        return res.status(400).json({ error: 'Danh mục với tên này đã tồn tại.' });
      }
    }

    if (slug) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug_type: { slug, type: catType } }
      });
      if (existingSlug && existingSlug.id !== id) {
        return res.status(400).json({ error: 'Đường dẫn (slug) này đã tồn tại.' });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(type && { type }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      }
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are programs or posts using this category
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: 'Không tìm thấy danh mục.' });

    if (category.type === 'PROGRAM') {
      const programCount = await prisma.program.count({
        where: { category: category.name }
      });

      if (programCount > 0) {
        return res.status(400).json({ 
          error: `Không thể xóa danh mục này. Có ${programCount} khóa học đang sử dụng danh mục "${category.name}".` 
        });
      }
    } else if (category.type === 'POST') {
      const postCount = await prisma.post.count({
        where: { category: category.name }
      });

      if (postCount > 0) {
        return res.status(400).json({ 
          error: `Không thể xóa danh mục này. Có ${postCount} bài viết đang sử dụng danh mục "${category.name}".` 
        });
      }
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

exports.reorderCategories = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, sortOrder }
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Execute bulk update in a transaction
    await prisma.$transaction(
      items.map(item => 
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    );

    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
};
