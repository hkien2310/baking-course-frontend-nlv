const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllBanners = async (req, res) => {
  try {
    const { isActive } = req.query;
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    res.json(banners);
  } catch (error) {
    console.error('getAllBanners error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách banner' });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { title, imageUrl, countdownDate, targetUrl, isActive } = req.body;

    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl,
        countdownDate: countdownDate ? new Date(countdownDate) : null,
        targetUrl: targetUrl || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error('createBanner error:', error);
    res.status(500).json({ error: 'Lỗi khi tạo banner' });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, imageUrl, countdownDate, targetUrl, isActive } = req.body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        imageUrl,
        countdownDate: countdownDate ? new Date(countdownDate) : null,
        targetUrl: targetUrl || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.json(banner);
  } catch (error) {
    console.error('updateBanner error:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật banner' });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({
      where: { id },
    });
    res.json({ message: 'Đã xóa banner thành công' });
  } catch (error) {
    console.error('deleteBanner error:', error);
    res.status(500).json({ error: 'Lỗi khi xóa banner' });
  }
};

exports.reorderBanners = async (req, res) => {
  try {
    const { banners } = req.body;
    if (!Array.isArray(banners)) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    }

    await prisma.$transaction(
      banners.map((banner) =>
        prisma.banner.update({
          where: { id: banner.id },
          data: { sortOrder: banner.sortOrder },
        })
      )
    );

    res.json({ message: 'Cập nhật thứ tự banner thành công' });
  } catch (error) {
    console.error('reorderBanners error:', error);
    res.status(500).json({ error: 'Failed to reorder banners' });
  }
};
