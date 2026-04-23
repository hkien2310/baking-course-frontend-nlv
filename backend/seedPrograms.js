require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ errorFormat: 'minimal' });

// Helper to build a program object quickly
const P = (slug, title, category, price, salePrice, students, isFeatured, desc, thumb) => ({
  slug, title, category, price, salePrice, students, isFeatured,
  programType: 'VIDEO_COURSE', description: desc, thumbnail: thumb,
  learningGoals: [{ skill: 'Kỹ năng chính', percent: 90 }],
  classIncludes: ['Video bài giảng HD', 'Tài liệu PDF', 'Nhóm hỗ trợ Zalo'],
  curriculum: [{ title: 'Tổng quan khóa học', content: 'Nội dung chi tiết sẽ được cập nhật.' }],
});

const programs = [
  // ── 5 FEATURED ──
  P('lam-banh-ngot-pastry', 'Làm Bánh Ngọt & Pastry', 'Bánh Ngọt', 550000, 450000, 186, true,
    'Đắm mình trong men và bột mì. Khóa học hướng dẫn từ cơ bản đến nâng cao: đánh trứng, nướng bánh vàng ươm, làm kem bơ và tạo hình fondant chuyên nghiệp.',
    '/baking/images/service/01.jpg'),
  P('xu-ly-thit-ca-gia-cam', 'Xử Lý Thịt, Cá & Gia Cầm', 'Món Âu', 480000, 380000, 234, true,
    'Hướng dẫn tách xương cá nghệ thuật, ướp thịt bò bít tết đúng chuẩn và cách quay da ngỗng giòn rụm. Từ chọn nguyên liệu đến trình bày đĩa ăn chuyên nghiệp.',
    '/baking/images/service/02.jpg'),
  P('am-thuc-ngoai-quoc', 'Ẩm Thực Ngoại Quốc', 'Đa Quốc Gia', 660000, 520000, 127, true,
    'Du hành hương vị qua các quốc gia với những món ăn đầy sắc màu gia vị từ vùng Caribbean đến Trung Đông, Pad Thai, Paella, Tagine và nhiều hơn nữa.',
    '/baking/images/service/03.jpg'),
  P('pho-bo-truyen-thong', 'Phở Bò Truyền Thống Hà Nội', 'Món Việt', 380000, null, 567, true,
    'Bí quyết nấu nước dùng phở bò trong vắt, thơm nức mũi từ xương ống và gia vị truyền thống. Học cách làm bánh phở tươi tại nhà chuẩn Hà Nội.',
    '/baking/images/gallery/03.jpg'),
  P('masterclass-sushi-sashimi', 'Masterclass Sushi & Sashimi', 'Món Nhật', 750000, 600000, 189, true,
    'Kỹ thuật cắt cá sashimi, cuộn sushi maki/nigiri, pha trộn giấm sushi. Trải nghiệm thực hành 100% với đầu bếp phong cách Nhật Bản.',
    '/baking/images/service/06.jpg'),

  // ── 13 NEW COURSES ──
  P('che-lot-thai-suong-sa', 'Lớp Chè Lọt Thái Sương Sa Hạt Lựu', 'Tráng Miệng', 600000, null, 328, false,
    'Món tráng miệng thanh mát, béo ngậy, với sợi chè lọt xanh mướt dẻo dai, hòa quyện cùng nước cốt dừa thơm béo và sương sa hạt lựu trong veo.',
    '/baking/images/service/04.jpg'),
  P('banh-trung-thu-handmade', 'Workshop Bánh Trung Thu Handmade', 'Bánh Ngọt', 550000, 450000, 245, false,
    'Tự tay làm bánh Trung Thu nhân thập cẩm và nhân đậu xanh trứng muối. Học từ khâu làm vỏ đến ép khuôn chuyên nghiệp.',
    '/baking/images/service/05.jpg'),
  P('lam-banh-mi-viet-nam', 'Bánh Mì Việt Nam Chuẩn Vị Sài Gòn', 'Bánh Mì', 420000, 350000, 412, false,
    'Bí quyết làm bánh mì vỏ giòn ruột xốp đúng kiểu Sài Gòn. Từ ủ bột, nướng lò đến pate gan, chả lụa, thịt nguội và đồ chua.',
    '/baking/images/gallery/01.jpg'),
  P('decorating-cake-fondant', 'Decorating Cake Fondant Nghệ Thuật', 'Bánh Ngọt', 850000, 680000, 156, false,
    'Phủ fondant mượt mà, tạo hoa hồng, lá và chi tiết trang trí bánh kem. Từ bánh sinh nhật đơn giản đến bánh cưới nhiều tầng sang trọng.',
    '/baking/images/gallery/02.jpg'),
  P('bun-bo-hue-chuan-xu', 'Bún Bò Huế Chuẩn Xứ Cố Đô', 'Món Việt', 350000, 280000, 389, false,
    'Nấu nước lèo bún bò Huế cay nồng đậm đà với sả, ruốc, ớt đặc trưng. Kèm theo cách làm giò heo, huyết và các loại rau sống ăn kèm.',
    '/baking/images/gallery/04.jpg'),
  P('com-tam-saigon', 'Cơm Tấm Sài Gòn Đúng Điệu', 'Món Việt', 320000, null, 478, false,
    'Bí quyết nướng sườn cơm tấm thơm lừng, cách kho nước mắm pha chuẩn vị và chả trứng hấp mềm mịn. Trọn bộ bữa cơm tấm hoàn hảo.',
    '/baking/images/gallery/05.jpg'),
  P('banh-cuon-thanh-tri', 'Bánh Cuốn Thanh Trì Truyền Thống', 'Món Việt', 280000, 220000, 201, false,
    'Cách tráng bánh cuốn mỏng mịn, nhân thịt băm mộc nhĩ thơm ngon. Pha nước chấm và hành phi giòn rụm chuẩn vị Hà Nội.',
    '/baking/images/gallery/06.jpg'),
  P('lau-thai-tom-yum', 'Lẩu Thái Tom Yum Kung', 'Đa Quốc Gia', 450000, 380000, 167, false,
    'Nấu nước lẩu Tom Yum chua cay nồng nàn, đậm đà hương sả, lá chanh Thái và galangal. Kèm hải sản tươi và rau ăn lẩu.',
    '/baking/images/gallery/07.jpg'),
  P('banh-mi-chao-bo-ne', 'Bánh Mì Chảo Bò Né Sáng Sớm', 'Món Âu', 290000, null, 534, false,
    'Bí quyết áp chảo bò né xèo xèo trên chảo gang nóng, kèm trứng ốp la, pate và bánh mì nóng giòn. Món sáng kinh điển Sài Gòn.',
    '/baking/images/gallery/08.jpg'),
  P('dimsum-cantonese', 'Dim Sum Quảng Đông Chính Gốc', 'Món Hoa', 680000, 550000, 98, false,
    'Làm há cảo, xíu mại, bánh bao xá xíu và bánh bột lọc. Kỹ thuật nhào bột, tạo hình và hấp dim sum chuẩn nhà hàng Hong Kong.',
    '/baking/images/gallery/09.jpg'),
  P('mon-chay-hien-dai', 'Ẩm Thực Chay Hiện Đại', 'Món Chay', 390000, 320000, 276, false,
    'Biến tấu các món chay truyền thống thành phiên bản hiện đại, đẹp mắt và giàu dinh dưỡng. Từ salad, soup đến main course thuần thực vật.',
    '/baking/images/gallery/10.jpg'),
  P('cocktail-mocktail', 'Pha Chế Cocktail & Mocktail', 'Pha Chế', 520000, 420000, 145, false,
    'Học pha chế từ cơ bản đến nâng cao: Mojito, Margarita, Espresso Martini và các loại mocktail không cồn. Kỹ thuật lắc, khuấy và trang trí ly.',
    '/baking/images/gallery/11.jpg'),
  P('kimchi-han-quoc', 'Làm Kimchi & Banchan Hàn Quốc', 'Món Hàn', 350000, null, 312, false,
    'Tự tay muối kimchi cải thảo lên men chuẩn vị Hàn, kèm theo 5 món banchan phổ biến: japchae, kongnamul, gamja jorim và spinach namul.',
    '/baking/images/gallery/12.jpg'),
];

async function main() {
  console.log('🌱 Seeding 18 khóa học Premium Content...');
  await prisma.order.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.classSession.deleteMany({});
  await prisma.program.deleteMany({});

  const chiefList = await prisma.chief.findMany();

  for (let i = 0; i < programs.length; i++) {
    const p = programs[i];
    const chiefId = chiefList.length > 0 ? chiefList[i % chiefList.length].id : undefined;
    await prisma.program.upsert({
      where: { slug: p.slug },
      update: { title: p.title, category: p.category, price: p.price, salePrice: p.salePrice, students: p.students,
        description: p.description, thumbnail: p.thumbnail, programType: p.programType,
        isFeatured: p.isFeatured, learningGoals: p.learningGoals, classIncludes: p.classIncludes,
        curriculum: p.curriculum, ...(chiefId && { chiefId }) },
      create: { slug: p.slug, title: p.title, category: p.category, price: p.price, salePrice: p.salePrice, students: p.students,
        description: p.description, thumbnail: p.thumbnail, programType: p.programType,
        isFeatured: p.isFeatured, learningGoals: p.learningGoals, classIncludes: p.classIncludes,
        curriculum: p.curriculum, ...(chiefId && { chiefId }) },
    });
    console.log(`  ${p.isFeatured ? '⭐' : '🆕'} ${p.title}`);
  }

  const featured = programs.filter(p => p.isFeatured).length;
  console.log(`\n📦 Tổng: ${programs.length} | Nổi bật: ${featured} | Mới: ${programs.length - featured}`);
  console.log('🎉 Seeding hoàn tất!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
