const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      programsCount,
      categoriesCount,
      postsCount,
      ordersCount,
      contactsCount,
      slidersCount,
      testimonialsCount,
      chiefsCount
    ] = await Promise.all([
      prisma.program.count(),
      prisma.category.count(),
      prisma.post.count(),
      prisma.order.count(),
      prisma.contact.count(),
      prisma.program.count({ where: { isFeatured: true } }), // Assuming sliders are featured programs
      prisma.testimonial.count(),
      prisma.chief.count()
    ]);

    res.json({
      programs: programsCount,
      categories: categoriesCount,
      posts: postsCount,
      orders: ordersCount,
      contacts: contactsCount,
      sliders: slidersCount,
      testimonials: testimonialsCount,
      chiefs: chiefsCount
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
