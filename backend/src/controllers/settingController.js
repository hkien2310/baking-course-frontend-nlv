const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { DEFAULT_LOYALTY_CONFIG } = require('../services/loyaltyService');

// The default config we fall back to if database is empty
const DEFAULT_SITE_CONFIG = {
  name: "Học Làm Bánh Online",
  logoText: "Học Làm Bánh Online",
  logoDot: "",
  description: "Mỗi công thức tại Học Làm Bánh Online được xây dựng từ trải nghiệm thực tế, hướng đến sự ổn định và khả năng ứng dụng trong kinh doanh.",
  contact: {
    address: "114B Hoàng Hoa Thám Phường Bảy Hiền TP Hồ Chí Minh",
    phone: "0938561989",
    email: "cskh.hoclambanhonline@gmail.com",
    website: "www.hoclambanhonline.com",
    workingHours: "T2-T7: 8:00 - 17:00",
    googleMapsUrl: "https://maps.google.com/maps?q=114B%20Ho%C3%A0ng%20Hoa%20Th%C3%A1m%20Ph%C6%B0%E1%BB%9Dng%20B%E1%BA%A3y%20Hi%E1%BB%81n%20TP%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed"
  },
  socials: {
    facebook: "https://facebook.com/hoclambanhonline",
    instagram: "https://instagram.com/hoclambanhonline.com",
    tiktok: "https://www.tiktok.com/@hoclambanhkhongkho",
    youtube: "#"
  },
  copyrightYear: new Date().getFullYear(),
  footer: {
    newsletterTitle: "Đăng ký nhận bản tin",
    newsletterDescription: "Nhập Email của bạn để nhận những mẹo làm bánh và công thức mới nhất. Chúng tôi cam kết không gửi thư rác!"
  },
  about: {
    historyParagraphs: [
      'Học Làm Bánh Online được thành lập với mục tiêu mang nghệ thuật ẩm thực đến gần hơn với mọi người. Ban đầu, chúng tôi chỉ là một phòng lab nhỏ dành cho những người yêu thích bánh kem và bánh mì nghệ thuật.',
      'Trải qua quá trình phát triển, Học Làm Bánh Online đã đào tạo nhiều học viên. Đội ngũ tự tin khẳng định chất lượng qua các khóa học thực tế, và hơn hết là ngọn lửa đam mê truyền lửa cho thế hệ tương lai.'
    ],
    historyFeatures: [
      'Cơ sở vật chất hiện đại chuẩn',
      'Giáo trình thực hành bám sát thực tế',
      'Công thức chuẩn kinh doanh',
      'Môi trường rèn luyện thực tế nghề nghiệp'
    ],
    achievements: [
      {
        icon: 'fa-trophy',
        title: 'Hơn 50 Giải Thưởng Nấu Ăn',
        desc: 'Được công nhận về chất lượng xuất sắc, mang về các giải thưởng danh giá tại nhiều đấu trường ẩm thực lớn.'
      },
      {
        icon: 'fa-group',
        title: '27 Đầu Bếp Chuyên Gia',
        desc: 'Đội ngũ giáo viên giàu kinh nghiệm thực chiến từ các nhà hàng, khách sạn lớn trong và ngoài nước.'
      },
      {
        icon: 'fa-hourglass-half',
        title: 'Cam Kết Việc Làm',
        desc: 'Định hướng lộ trình sự nghiệp vững chắc, hỗ trợ giới thiệu tận tay cho các đơn vị liên kết uy tín.'
      }
    ]
  }
};

const getSiteConfig = async (req, res) => {
  try {
    let setting = await prisma.setting.findUnique({
      where: { key: 'siteConfig' }
    });

    if (!setting) {
      // Create default if not exists
      setting = await prisma.setting.create({
        data: {
          key: 'siteConfig',
          value: DEFAULT_SITE_CONFIG
        }
      });
    }

    res.json(setting.value);
  } catch (error) {
    console.error("Error fetching siteConfig:", error);
    res.status(500).json({ error: "Lỗi khi tải cấu hình website" });
  }
};

const updateSiteConfig = async (req, res) => {
  try {
    const updatedValue = req.body;
    
    // Upsert to ensure it's created or updated safely
    const setting = await prisma.setting.upsert({
      where: { key: 'siteConfig' },
      update: { value: updatedValue },
      create: { key: 'siteConfig', value: updatedValue }
    });

    res.json({ message: "Cập nhật cấu hình thành công", config: setting.value });
  } catch (error) {
    console.error("Error updating siteConfig:", error);
    res.status(500).json({ error: "Lỗi khi lưu cấu hình website" });
  }
};

const getLoyaltyConfig = async (req, res) => {
  try {
    let setting = await prisma.setting.findUnique({ where: { key: 'loyaltyConfig' } });
    if (!setting) {
      setting = await prisma.setting.create({
        data: { key: 'loyaltyConfig', value: DEFAULT_LOYALTY_CONFIG }
      });
    }
    res.json(setting.value);
  } catch (error) {
    console.error('Error fetching loyaltyConfig:', error);
    res.status(500).json({ error: 'Lỗi khi tải cấu hình loyalty' });
  }
};

const updateLoyaltyConfig = async (req, res) => {
  try {
    const { determineTier } = require('../services/loyaltyService');
    const config = req.body;
    
    const setting = await prisma.setting.upsert({
      where: { key: 'loyaltyConfig' },
      update: { value: config },
      create: { key: 'loyaltyConfig', value: config }
    });

    // Background update all users' tiers based on new config
    const users = await prisma.user.findMany({ select: { id: true, totalSpent: true, memberTier: true } });
    const updatePromises = users.map(user => {
      const newTier = determineTier(user.totalSpent || 0, config.tiers);
      if (newTier !== user.memberTier) {
        return prisma.user.update({
          where: { id: user.id },
          data: { memberTier: newTier }
        });
      }
      return null;
    }).filter(p => p !== null);

    if (updatePromises.length > 0) {
      Promise.all(updatePromises).catch(err => console.error('Error batch updating user tiers:', err));
    }

    res.json({ message: 'Cập nhật cấu hình loyalty thành công và đã đồng bộ hạng thành viên.', config: setting.value });
  } catch (error) {
    console.error('Error updating loyaltyConfig:', error);
    res.status(500).json({ error: 'Lỗi khi lưu cấu hình loyalty' });
  }
};

module.exports = {
  getSiteConfig,
  updateSiteConfig,
  getLoyaltyConfig,
  updateLoyaltyConfig,
};
