const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { generateSlug } = require('../utils/slugify');

exports.getAllPrograms = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    const { dayOfWeek, chiefId, search, category, minPrice, maxPrice, sortBy, isFeatured, hasDiscount } = req.query;

    const now = new Date();
    const where = {};
    const AND = [];

    if (hasDiscount === 'true') {
      where.salePrice = { not: null };
      AND.push({
        OR: [
          { saleEndDate: null },
          { saleEndDate: { gte: now } }
        ]
      });
    }
    if (dayOfWeek) {
      where.classSessions = {
        some: { dayOfWeek }
      };
    }
    if (chiefId) {
      where.chiefId = chiefId;
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (category) {
      // Support multiple categories by splitting commas
      const categoryInputs = category.split(',').map(c => c.trim());
      
      // Look up names for the provided slugs (or names)
      const cats = await prisma.category.findMany({
        where: {
          OR: [
            { slug: { in: categoryInputs } },
            { name: { in: categoryInputs } }
          ],
          type: 'PROGRAM'
        }
      });
      
      const names = cats.map(c => c.name);
      
      // For backwards compatibility, if some inputs weren't slugs (or are deleted), we still query them exactly
      const resolvedCategories = [...new Set([...names, ...categoryInputs])];
      
      where.category = { in: resolvedCategories };
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const min = !isNaN(parseInt(minPrice)) ? parseInt(minPrice) : 0;
      const max = !isNaN(parseInt(maxPrice)) ? parseInt(maxPrice) : 999999999;
      // Filter logic: program effective price is salePrice if it exists, otherwise price.
      // Prisma doesn't support complex OR conditions on computed fields easily, so we use OR:
      AND.push({
        OR: [
          { salePrice: { gte: min, lte: max } },
          { salePrice: null, price: { gte: min, lte: max } }
        ]
      });
    }

    if (AND.length > 0) {
      where.AND = AND;
    }

    let orderBy = {};
    if (sortBy === 'price_asc') {
      // Because price logic is complex, Prisma sorting might just use base price
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'popular') {
      orderBy = { students: 'desc' };
    } else {
      // Default newest
      orderBy = { createdAt: 'desc' };
    }

    if (page) {
      const skip = (page - 1) * limit;
      const totalItems = await prisma.program.count({ where });
      const programs = await prisma.program.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { chief: true, classSessions: { include: { enrollments: true } } },
      });

      // Process programs to expire sales
      const processedPrograms = programs.map(p => {
        if (p.saleEndDate && p.saleEndDate < now) {
          return { ...p, salePrice: null, saleEndDate: null };
        }
        return p;
      });

      return res.json({
        data: processedPrograms,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        totalItems
      });
    }

    const programs = await prisma.program.findMany({
      where,
      orderBy,
      include: { chief: true, classSessions: { include: { enrollments: true } } },
    });

    const processedPrograms = programs.map(p => {
      if (p.saleEndDate && p.saleEndDate < now) {
        return { ...p, salePrice: null, saleEndDate: null };
      }
      return p;
    });

    res.json(processedPrograms);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching programs' });
  }
};

exports.getProgramByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;
    const jwt = require('jsonwebtoken');
    
    // Try to find by slug first
    let program = await prisma.program.findUnique({ 
      where: { slug: identifier },
      include: { chief: true, classSessions: true } 
    });
    
    // If not found, it might be an ID
    if (!program) {
      program = await prisma.program.findUnique({ 
        where: { id: identifier },
        include: { chief: true, classSessions: true }
      });
    }

    if (!program) return res.status(404).json({ error: 'Program not found' });

    // Content gating: check if user has purchased this program
    let hasPurchased = false;
    let orderStatus = null;
    
    // Try to extract user from token (optional — don't require auth)
    const token = req.header('x-auth-token') || 
      (req.header('Authorization')?.startsWith('Bearer ') ? req.header('Authorization').split(' ')[1] : null);
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_123');
        const userId = decoded.user?.id;
        
        if (userId) {
          const order = await prisma.order.findFirst({
            where: { userId, programId: program.id },
            orderBy: { createdAt: 'desc' }
          });
          
          if (order) {
            orderStatus = order.status;
            hasPurchased = order.status === 'CONFIRMED';
          }
        }
      } catch (e) {
        // Invalid token — just treat as guest
      }
    }

    // Build response
    const response = {
      ...program,
      hasPurchased,
      orderStatus, // null, PENDING, AWAITING_CONFIRM, CONFIRMED, REJECTED, CANCELLED
    };

    // Strip premiumContent if not purchased
    if (!hasPurchased) {
      response.premiumContent = null;
    }

    res.json(response);
  } catch (error) {
    console.error('getProgramByIdOrSlug error:', error);
    res.status(500).json({ error: 'Failed to fetch program details' });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const { title, category, description, price, salePrice, thumbnail, slug, authorName, authorImage, learningGoals, classIncludes, curriculum, classSessions, chiefId, premiumContent, programType, students, reviews } = req.body;
    const finalSlug = slug || generateSlug(title);
    
    // Create nested classSessions
    const nestedSessions = classSessions && Array.isArray(classSessions) ? {
      create: classSessions.map(cs => ({
        startDate: cs.startDate ? new Date(cs.startDate) : null,
        endDate: cs.endDate ? new Date(cs.endDate) : null,
        enrollmentDeadline: cs.enrollmentDeadline ? new Date(cs.enrollmentDeadline) : null,
        dayOfWeek: cs.dayOfWeek || null,
        timeRange: cs.timeRange || null,
        instructorOverride: cs.instructorOverride || null,
      }))
    } : undefined;

    const program = await prisma.program.create({
      data: {
        title,
        slug: finalSlug,
        category: category || null,
        description,
        price: price != null ? parseInt(price) : null,
        salePrice: salePrice != null ? parseInt(salePrice) : null,
        thumbnail,
        chiefId: chiefId || null,
        programType: programType || 'LIVE_CLASS',
        authorName,
        authorImage,
        learningGoals: learningGoals || null,
        classIncludes: classIncludes || null,
        curriculum: curriculum || null,
        premiumContent: premiumContent || null,
        isFeatured: req.body.isFeatured || false,
        students: students != null ? parseInt(students) : 0,
        reviews: reviews != null ? parseInt(reviews) : 0,
        classSessions: nestedSessions
      },
      include: {
        classSessions: true
      }
    });
    res.status(201).json(program);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while creating program' });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, price, salePrice, thumbnail, slug, authorName, authorImage, learningGoals, classIncludes, curriculum, classSessions, chiefId, premiumContent, programType, students, reviews } = req.body;
    
    const finalSlug = slug || (title ? generateSlug(title) : undefined);

    let program = await prisma.program.update({
      where: { id },
      data: {
        title,
        ...(finalSlug && { slug: finalSlug }),
        ...(category !== undefined && { category }),
        description,
        price: price != null ? parseInt(price) : undefined,
        ...(salePrice !== undefined && { salePrice: salePrice != null ? parseInt(salePrice) : null }),
        thumbnail,
        chiefId: chiefId || null,
        authorName,
        authorImage,
        ...(learningGoals !== undefined && { learningGoals }),
        ...(classIncludes !== undefined && { classIncludes }),
        ...(curriculum !== undefined && { curriculum }),
        ...(premiumContent !== undefined && { premiumContent }),
        ...(req.body.isFeatured !== undefined && { isFeatured: req.body.isFeatured }),
        ...(programType !== undefined && { programType }),
        ...(students !== undefined && { students: parseInt(students) }),
        ...(reviews !== undefined && { reviews: parseInt(reviews) })
      },
      include: {
        classSessions: true
      }
    });

    // If classSessions is provided, we overwrite current sessions
    if (classSessions && Array.isArray(classSessions)) {
      // Delete old sessions
      await prisma.classSession.deleteMany({
        where: { programId: id }
      });
      // Insert new sessions
      if (classSessions.length > 0) {
        await prisma.classSession.createMany({
          data: classSessions.map(cs => ({
            programId: id,
            startDate: cs.startDate ? new Date(cs.startDate) : null,
            endDate: cs.endDate ? new Date(cs.endDate) : null,
            enrollmentDeadline: cs.enrollmentDeadline ? new Date(cs.enrollmentDeadline) : null,
            dayOfWeek: cs.dayOfWeek || null,
            timeRange: cs.timeRange || null,
            instructorOverride: cs.instructorOverride || null,
          }))
        });
      }
      
      program = await prisma.program.findUnique({
        where: { id },
        include: { classSessions: true }
      });
    }
    res.json(program);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update program' });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch before deleting to get image URLs
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) return res.status(404).json({ error: 'Program not found' });

    await prisma.program.delete({ where: { id } });

    // Clean up uploaded images
    const { deleteUploadedFile } = require('../utils/fileCleanup');
    deleteUploadedFile(program.thumbnail);
    deleteUploadedFile(program.authorImage);

    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete program' });
  }
};

exports.getUpcomingPrograms = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const now = new Date();

    const programs = await prisma.program.findMany({
      where: {
        classSessions: { some: { startDate: { gte: now } } }
      },
      include: { classSessions: true },
      take: limit,
    });

    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming programs' });
  }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    if (isFeatured) {
      // Check if program exists
      const targetProgram = await prisma.program.findUnique({
        where: { id }
      });
      if (!targetProgram) return res.status(404).json({ error: 'Program not found' });

      // Check if we already have 3 featured programs
      const featuredCount = await prisma.program.count({ where: { isFeatured: true } });
      if (featuredCount >= 3) {
        return res.status(400).json({ error: 'Maximum of 3 programs can be featured.' });
      }
    }

    const program = await prisma.program.update({
      where: { id },
      data: { isFeatured: Boolean(isFeatured) }
    });

    res.json(program);
  } catch (error) {
    console.error('toggleFeatured error:', error);
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
};
exports.getTimetable = async (req, res) => {
  try {
    const classSessions = await prisma.classSession.findMany({
      include: {
        program: {
          select: { id: true, title: true, slug: true, price: true, thumbnail: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    res.json(classSessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timetables' });
  }
};
