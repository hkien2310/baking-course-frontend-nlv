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

    // Base filters (apply these first to build the core where clause)
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
      const categoryInputs = category.split(',').map(c => c.trim());
      const cats = await prisma.category.findMany({
        where: {
          OR: [{ slug: { in: categoryInputs } }, { name: { in: categoryInputs } }],
          type: 'PROGRAM'
        }
      });
      const names = cats.map(c => c.name);
      where.category = { in: [...new Set([...names, ...categoryInputs])] };
    }

    // Simply return any program that has a salePrice
    if (hasDiscount === 'true') {
      where.salePrice = { not: null };
      
      // Optionally only return non-expired ones:
      AND.push({
        OR: [
          { saleEndDate: null },
          { saleEndDate: { gte: now } }
        ]
      });
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      const min = !isNaN(parseInt(minPrice)) ? parseInt(minPrice) : 0;
      const max = !isNaN(parseInt(maxPrice)) ? parseInt(maxPrice) : 999999999;
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

    let orderBy = [];
    if (sortBy === 'price_asc') {
      orderBy = [{ sortOrder: 'asc' }, { price: 'asc' }];
    } else if (sortBy === 'price_desc') {
      orderBy = [{ sortOrder: 'asc' }, { price: 'desc' }];
    } else if (sortBy === 'popular') {
      orderBy = [{ sortOrder: 'asc' }, { students: 'desc' }];
    } else {
      // Default: manual sortOrder first, then newest
      orderBy = [{ sortOrder: 'asc' }, { createdAt: 'desc' }];
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

      // Process programs to expire sales and strip premium content
      const processedPrograms = programs.map(p => {
        if (p.saleEndDate && p.saleEndDate < now) {
          p.salePrice = null;
          p.saleEndDate = null;
        }
        p.premiumContent = undefined; // Don't expose premium content in list
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
        p.salePrice = null;
        p.saleEndDate = null;
      }
      p.premiumContent = undefined; // Don't expose premium content in list
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
        const userRole = decoded.user?.role;
        
        if (userRole === 'ADMIN') {
          hasPurchased = true;
        } else if (userId) {
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

    // Auto-expire sale in details view as well
    const now = new Date();
    if (response.saleEndDate && new Date(response.saleEndDate) < now) {
      response.salePrice = null;
      response.saleEndDate = null;
    }

    // Strip premium content if not purchased, but keep titles for the playlist
    if (!hasPurchased && response.premiumContent && Array.isArray(response.premiumContent.videos)) {
      response.premiumContent.videos = response.premiumContent.videos.map(video => {
        if (video.isFree) {
          return video; // Keep everything for free lessons
        } else {
          return {
            title: video.title,
            isFree: false
            // Explicitly stripping url, resources, guides
          };
        }
      });
    }

    res.json(response);
  } catch (error) {
    console.error('getProgramByIdOrSlug error:', error);
    res.status(500).json({ error: 'Failed to fetch program details' });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const { title, category, description, price, salePrice, saleEndDate, thumbnail, slug, authorName, authorImage, learningGoals, classIncludes, curriculum, classSessions, chiefId, premiumContent, programType, students, reviews } = req.body;
    
    // Price validation
    if (salePrice != null && price != null && parseInt(salePrice) >= parseInt(price)) {
      return res.status(400).json({ error: 'Giá khuyến mãi phải nhỏ hơn giá gốc.' });
    }

    const finalSlug = slug || generateSlug(title);
    
    // Create nested classSessions
    const nestedSessions = classSessions && Array.isArray(classSessions) ? {
      create: classSessions.map(cs => {
        const start = cs.startDate ? new Date(cs.startDate) : null;
        const end = cs.endDate ? new Date(cs.endDate) : null;
        const now = new Date();
        now.setHours(0,0,0,0);

        if (start && start < now) {
          throw new Error('Ngày bắt đầu khóa học không được ở quá khứ.');
        }
        if (start && end && end <= start) {
          throw new Error('Ngày kết thúc khóa học phải lớn hơn ngày bắt đầu.');
        }

        return {
          startDate: start,
          endDate: end,
          enrollmentDeadline: cs.enrollmentDeadline ? new Date(cs.enrollmentDeadline) : null,
          dayOfWeek: cs.dayOfWeek || null,
          timeRange: cs.timeRange || null,
          instructorOverride: cs.instructorOverride || null,
        };
      })
    } : undefined;

    const program = await prisma.program.create({
      data: {
        title,
        slug: finalSlug,
        category: category || null,
        description,
        price: price != null ? parseInt(price) : null,
        salePrice: salePrice != null ? parseInt(salePrice) : null,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
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
    const { title, category, description, price, salePrice, saleEndDate, thumbnail, slug, authorName, authorImage, learningGoals, classIncludes, curriculum, classSessions, chiefId, premiumContent, programType, students, reviews } = req.body;
    
    // Price validation
    if (salePrice !== undefined && price !== undefined) {
       const p = price != null ? parseInt(price) : null;
       const sp = salePrice != null ? parseInt(salePrice) : null;
       if (sp != null && p != null && sp >= p) {
         return res.status(400).json({ error: 'Giá khuyến mãi phải nhỏ hơn giá gốc.' });
       }
    }

    // Process sessions validation
    if (classSessions && Array.isArray(classSessions)) {
      classSessions.forEach(cs => {
        const start = cs.startDate ? new Date(cs.startDate) : null;
        const end = cs.endDate ? new Date(cs.endDate) : null;
        const now = new Date();
        now.setHours(0,0,0,0);

        // We don't check start < now here because we might be editing an ongoing or past class.
        // if (start && start < now) {
        //   throw new Error('Ngày bắt đầu khóa học không được ở quá khứ.');
        // }
        if (start && end && end <= start) {
          throw new Error('Ngày kết thúc khóa học phải lớn hơn ngày bắt đầu.');
        }
      });
    }

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
        ...(saleEndDate !== undefined && { saleEndDate: saleEndDate ? new Date(saleEndDate) : null }),
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
    console.error('updateProgram error:', error);
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
    const { deleteFromCloudinary } = require('../utils/cloudinaryUtils');
    if (program.thumbnail) await deleteFromCloudinary(program.thumbnail);
    if (program.authorImage) await deleteFromCloudinary(program.authorImage);

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

exports.reorderPrograms = async (req, res) => {
  try {
    const { programs } = req.body;
    if (!Array.isArray(programs)) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    }

    await prisma.$transaction(
      programs.map((prog) =>
        prisma.program.update({
          where: { id: prog.id },
          data: { sortOrder: prog.sortOrder },
        })
      )
    );

    res.json({ message: 'Cập nhật thứ tự thành công' });
  } catch (error) {
    console.error('reorderPrograms error:', error);
    res.status(500).json({ error: 'Failed to reorder programs' });
  }
};
