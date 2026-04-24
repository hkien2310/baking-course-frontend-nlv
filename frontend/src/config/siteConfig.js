import { ROUTES } from '../constants/routes';

export const siteConfig = {
  name: "YUM Saigon",
  logoText: "YUM Saigon",
  logoDot: "",
  description: "Mỗi công thức tại YUM Saigon được xây dựng từ trải nghiệm thực tế, hướng đến sự ổn định và khả năng ứng dụng trong kinh doanh.",
  contact: {
    address: "114B Hoàng Hoa Thám Phường Bảy Hiền TP Hồ Chí Minh",
    phone: "0938561989",
    email: "yumsaigon2020@gmail.com",
    website: "www.yumsaigon.com",
    workingHours: "T2-T7: 8:00 - 17:00",
    googleMapsUrl: "https://maps.google.com/maps?q=114B%20Ho%C3%A0ng%20Hoa%20Th%C3%A1m%20Ph%C6%B0%E1%BB%9Dng%20B%E1%BA%A3y%20Hi%E1%BB%81n%20TP%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed"
  },
  socials: {
    facebook: "https://facebook.com/yumsaigon2020",
    twitter: "#",
    instagram: "https://instagram.com/yumsaigon.com",
    tiktok: "https://www.tiktok.com/@yumsaigon.com",
    youtube: "#"
  },
  copyrightYear: new Date().getFullYear(),
  heroSliderInterval: 7000, // Duration in milliseconds before auto-sliding
  header: {
    ctaButtonText: "Visit workshop",
    ctaButtonLink: "#classes"
  },
  footer: {
    newsletterTitle: "Đăng ký nhận bản tin",
    newsletterDescription: "Nhập Email của bạn để nhận những mẹo làm bánh và công thức mới nhất. Chúng tôi cam kết không gửi thư rác!"
  },
  about: {
    historyParagraphs: [
      'YUM Saigon được thành lập với mục tiêu mang nghệ thuật ẩm thực đến gần hơn với mọi người. Ban đầu, chúng tôi chỉ là một phòng lab nhỏ dành cho những người yêu thích bánh kem và bánh mì nghệ thuật.',
      'Trải qua quá trình phát triển, YUM Saigon đã đào tạo nhiều học viên. Đội ngũ tự tin khẳng định chất lượng qua các khóa học thực tế, và hơn hết là ngọn lửa đam mê truyền lửa cho thế hệ tương lai.'
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
  },
  sidebar: {
    categories: [
      { name: 'Recipes', count: null, link: ROUTES.RECEIPT },
      { name: 'Classes', count: null, link: ROUTES.RECEIPT },
      { name: 'Cook', count: null, link: ROUTES.RECEIPT },
      { name: 'Kitchen', count: null, link: ROUTES.RECEIPT },
      { name: 'Baking', count: null, link: ROUTES.RECEIPT }
    ],
    tags: [
      'Beef', 'Baking', 'Recipes', 'Cook', 'Kitchen', 'Classes', 'Pastry', 'Healthy', 'Menu'
    ]
  }
};
