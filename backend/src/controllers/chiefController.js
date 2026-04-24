const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllChiefs = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 6;

    if (page) {
      const skip = (page - 1) * limit;
      const totalItems = await prisma.chief.count();
      const chiefs = await prisma.chief.findMany({
        skip,
        take: limit,
      });
      return res.json({
        data: chiefs,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        totalItems
      });
    }

    const chiefs = await prisma.chief.findMany();
    res.json(chiefs);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching chiefs' });
  }
};

exports.getChiefById = async (req, res) => {
  try {
    const chief = await prisma.chief.findUnique({ where: { id: req.params.id } });
    if (!chief) return res.status(404).json({ error: 'Chief not found' });
    res.json(chief);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chief details' });
  }
};

exports.createChief = async (req, res) => {
  try {
    const { skills, ...rest } = req.body;
    const data = {
      ...rest,
      skills: skills ? (typeof skills === 'string' ? skills : JSON.stringify(skills)) : null
    };
    const chief = await prisma.chief.create({ data });
    res.status(201).json(chief);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chief' });
  }
};

exports.updateChief = async (req, res) => {
  try {
    const { skills, ...rest } = req.body;
    const data = {
      ...rest,
      skills: skills ? (typeof skills === 'string' ? skills : JSON.stringify(skills)) : null
    };
    const chief = await prisma.chief.update({
      where: { id: req.params.id },
      data
    });
    res.json(chief);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update chief' });
  }
};

exports.deleteChief = async (req, res) => {
  try {
    const chief = await prisma.chief.findUnique({ where: { id: req.params.id } });
    if (!chief) return res.status(404).json({ error: 'Chief not found' });

    await prisma.chief.delete({ where: { id: req.params.id } });

    // Clean up uploaded image
    const { deleteUploadedFile } = require('../utils/fileCleanup');
    deleteUploadedFile(chief.image);

    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete chief' });
  }
};
