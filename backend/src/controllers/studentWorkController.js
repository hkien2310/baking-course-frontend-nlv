const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/student-work — Submit student work (authenticated user)
exports.submitWork = async (req, res) => {
  try {
    const { studentName, imageUrl, description, programId } = req.body;
    const userId = req.user?.id || null;

    if (!studentName || !imageUrl || !description || !programId) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin nộp bài.' });
    }

    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
    }

    const work = await prisma.studentWork.create({
      data: {
        studentName,
        imageUrl,
        description,
        programId,
        userId,
      },
      include: {
        program: { select: { id: true, title: true, slug: true } }
      }
    });

    res.status(201).json({ message: 'Nộp bài thành công! Bài của bạn sẽ được duyệt trước khi hiển thị.', work });
  } catch (error) {
    console.error('submitWork error:', error);
    res.status(500).json({ error: 'Lỗi khi nộp bài.' });
  }
};

// GET /api/student-work/approved — Get all approved student works (public)
exports.getApprovedWorks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const programId = req.query.programId;
    const skip = (page - 1) * limit;

    const where = { status: 'APPROVED' };
    if (programId) where.programId = programId;

    const [works, total] = await Promise.all([
      prisma.studentWork.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          program: { select: { id: true, title: true, slug: true } }
        }
      }),
      prisma.studentWork.count({ where })
    ]);

    res.json({
      data: works,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('getApprovedWorks error:', error);
    res.status(500).json({ error: 'Lỗi khi tải sản phẩm học viên.' });
  }
};

// GET /api/student-work/all — Get all student works (Admin)
exports.getAllWorks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const status = req.query.status || 'ALL';
    const skip = (page - 1) * limit;

    const where = status === 'ALL' ? {} : { status };

    // Run queries in parallel
    const [works, totalItems, statusGroups] = await Promise.all([
      // 1. Get paginated works
      prisma.studentWork.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          program: { select: { id: true, title: true, slug: true } }
        }
      }),
      // 2. Get total for the current filter (for pagination math)
      prisma.studentWork.count({ where }),
      // 3. Get counts for ALL statuses to render the tabs
      prisma.studentWork.groupBy({
        by: ['status'],
        _count: { id: true }
      })
    ]);

    // Format counts for the frontend tabs
    let totalAll = 0;
    const counts = { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    statusGroups.forEach(group => {
      counts[group.status] = group._count.id;
      totalAll += group._count.id;
    });
    counts.ALL = totalAll;

    res.json({
      data: works,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      counts
    });
  } catch (error) {
    console.error('getAllWorks error:', error);
    res.status(500).json({ error: 'Lỗi khi tải danh sách bài nộp.' });
  }
};

// PATCH /api/student-work/:id/approve — Admin approves
exports.approveWork = async (req, res) => {
  try {
    const work = await prisma.studentWork.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' },
    });
    res.json({ message: 'Đã duyệt bài nộp.', work });
  } catch (error) {
    console.error('approveWork error:', error);
    res.status(500).json({ error: 'Lỗi khi duyệt bài.' });
  }
};

// PATCH /api/student-work/:id/reject — Admin rejects
exports.rejectWork = async (req, res) => {
  try {
    const work = await prisma.studentWork.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' },
    });
    res.json({ message: 'Đã từ chối bài nộp.', work });
  } catch (error) {
    console.error('rejectWork error:', error);
    res.status(500).json({ error: 'Lỗi khi từ chối bài.' });
  }
};

// DELETE /api/student-work/:id — Admin deletes
exports.deleteWork = async (req, res) => {
  try {
    const work = await prisma.studentWork.findUnique({ where: { id: req.params.id } });
    if (work?.imageUrl) {
      const { deleteFromCloudinary } = require('../utils/cloudinaryUtils');
      await deleteFromCloudinary(work.imageUrl);
    }
    await prisma.studentWork.delete({ where: { id: req.params.id } });
    res.json({ message: 'Đã xóa bài nộp.' });
  } catch (error) {
    console.error('deleteWork error:', error);
    res.status(500).json({ error: 'Lỗi khi xóa bài.' });
  }
};

// POST /api/student-work/admin — Admin creates work
exports.adminCreateWork = async (req, res) => {
  try {
    const { studentName, imageUrl, description, programId, status } = req.body;
    if (!studentName || !imageUrl || !description || !programId) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
    }
    const work = await prisma.studentWork.create({
      data: {
        studentName,
        imageUrl,
        description,
        programId,
        status: status || 'APPROVED',
        userId: req.user?.id || null
      },
      include: {
        program: { select: { id: true, title: true, slug: true } }
      }
    });
    res.status(201).json({ message: 'Tạo sản phẩm thành công', work });
  } catch (error) {
    console.error('adminCreateWork error:', error);
    res.status(500).json({ error: 'Lỗi khi tạo sản phẩm.' });
  }
};

// PUT /api/student-work/:id — Admin updates work
exports.updateWork = async (req, res) => {
  try {
    const { studentName, imageUrl, description, programId, status } = req.body;
    const work = await prisma.studentWork.update({
      where: { id: req.params.id },
      data: {
        studentName,
        imageUrl,
        description,
        programId,
        status
      },
      include: {
        program: { select: { id: true, title: true, slug: true } }
      }
    });
    res.json({ message: 'Cập nhật thành công', work });
  } catch (error) {
    console.error('updateWork error:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật sản phẩm.' });
  }
};
