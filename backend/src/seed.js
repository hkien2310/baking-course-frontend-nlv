require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ errorFormat: 'minimal' });

const MOCK_DATA = {
  slider: [
    {
      image: '/baking/images/slide01.jpg',
      titleHighlight: 'Học Nấu Ăn Chuyên Nghiệp Tại Nhà',
      titleMain: 'Khóa Học Tiếp Theo Bắt Đầu Trong:',
      btnLink: '#',
      btnText: 'Đăng ký ngay'
    },
    {
      image: '/baking/images/slide02.jpg',
      titleHighlight: 'Nâng Tầm Kỹ Năng Bếp Của Bạn',
      titleMain: 'Khóa Học Tiếp Theo Bắt Đầu Trong:',
      btnLink: '#',
      btnText: 'Đăng ký ngay'
    },
    {
      image: '/baking/images/slide03.jpg',
      titleHighlight: 'Từ Người Mới Đến Đầu Bếp Chuyên Nghiệp',
      titleMain: 'Khóa Học Tiếp Theo Bắt Đầu Trong:',
      btnLink: '#',
      btnText: 'Đăng ký ngay'
    }
  ],
  programs: [
    // ── FEATURED (isFeatured: true) ──
    {
      slug: 'lam-banh-ngot-pastry',
      category: "Bánh Ngọt & Pastry",
      title: 'Làm bánh ngọt & Pastry',
      price: 550000,
      salePrice: 450000,
      students: 186,
      isFeatured: true,
      programType: 'VIDEO_COURSE',
      description: 'Đắm mình trong men và bột mì. Khóa học hướng dẫn từ cơ bản đến nâng cao: đánh trứng và nướng bánh vàng ươm, làm kem bơ, tạo hình fondant chuyên nghiệp.',
      thumbnail: '/baking/images/service/01.jpg',
      learningGoals: [
        { skill: 'Nướng bánh mì, croissant chuẩn Pháp', percent: 90 },
        { skill: 'Tạo hình fondant và trang trí kem', percent: 85 },
        { skill: 'Làm các loại pastry truyền thống châu Âu', percent: 80 }
      ],
      classIncludes: ['12 video bài giảng HD', 'Tài liệu công thức PDF', 'Nhóm hỗ trợ Zalo'],
      curriculum: [
        { title: 'Phần 1: Nguyên liệu & Dụng cụ cơ bản', content: 'Tìm hiểu các loại bột, đường, bơ và dụng cụ không thể thiếu.' },
        { title: 'Phần 2: Kỹ thuật nhồi bột & Ủ men', content: 'Học cách nhồi bột đúng kỹ thuật, kiểm soát nhiệt độ ủ men.' },
        { title: 'Phần 3: Nướng & Hoàn thiện', content: 'Nhiệt độ lò, thời gian nướng, và trang trí bánh hoàn chỉnh.' }
      ]
    },
    {
      slug: 'xu-ly-thit-ca-gia-cam',
      category: "Món Âu",
      title: 'Xử lý Thịt, Cá & Gia Cầm',
      price: 480000,
      salePrice: 380000,
      students: 234,
      isFeatured: true,
      programType: 'VIDEO_COURSE',
      description: 'Hướng dẫn tách xương cá nghệ thuật, ướp thịt bò bít tết đúng chuẩn và cách quay da ngỗng giòn rụm. Từ chọn nguyên liệu đến trình bày đĩa ăn chuyên nghiệp.',
      thumbnail: '/baking/images/service/02.jpg',
      learningGoals: [
        { skill: 'Kỹ thuật phi lê cá chuyên nghiệp', percent: 88 },
        { skill: 'Ướp và nướng thịt bò hoàn hảo', percent: 92 },
        { skill: 'Chế biến gia cầm đa phong cách', percent: 85 }
      ],
      classIncludes: ['15 video bài giảng HD', 'Sách công thức điện tử', 'Chứng nhận hoàn thành'],
      curriculum: [
        { title: 'Phần 1: Chọn nguyên liệu tươi sống', content: 'Cách phân biệt thịt tươi, cá tươi và mẹo bảo quản.' },
        { title: 'Phần 2: Kỹ thuật sơ chế', content: 'Tách xương, phi lê, cắt miếng chuẩn nhà hàng.' },
        { title: 'Phần 3: Nấu và trình bày', content: 'Áp chảo, nướng, hầm và bày đĩa nghệ thuật.' }
      ]
    },
    {
      slug: 'am-thuc-ngoai-quoc',
      category: "Món Á & Quốc Tế",
      title: 'Ẩm thực Ngoại quốc',
      price: 660000,
      salePrice: 520000,
      students: 127,
      isFeatured: true,
      programType: 'VIDEO_COURSE',
      description: 'Du hành hương vị qua các quốc gia với những món ăn đầy sắc màu gia vị từ vùng Caribbean đến Trung Đông. Học cách nấu Pad Thai, Paella, Tagine và nhiều hơn nữa.',
      thumbnail: '/baking/images/service/03.jpg',
      learningGoals: [
        { skill: 'Nấu các món Á: Pad Thai, Sushi, Ramen', percent: 85 },
        { skill: 'Ẩm thực Địa Trung Hải & Trung Đông', percent: 80 },
        { skill: 'Phối gia vị quốc tế chuyên nghiệp', percent: 90 }
      ],
      classIncludes: ['20 video bài giảng HD', 'Bộ sưu tập 50+ công thức', 'Cập nhật trọn đời'],
      curriculum: [
        { title: 'Phần 1: Ẩm thực châu Á', content: 'Pad Thai, Sushi cơ bản, Ramen Nhật Bản.' },
        { title: 'Phần 2: Ẩm thực châu Âu', content: 'Paella Tây Ban Nha, Risotto Ý, Bouillabaisse Pháp.' },
        { title: 'Phần 3: Trung Đông & châu Phi', content: 'Tagine Morocco, Hummus, Falafel và các loại gia vị.' }
      ]
    },
    // ── NEW COURSES (isFeatured: false) ──
    {
      slug: 'che-lot-thai-suong-sa',
      category: "Chè & Tráng Miệng",
      title: 'Lớp Chè Lọt Thái Sương Sa Hat Lựu',
      price: 600000,
      salePrice: null,
      students: 328,
      isFeatured: false,
      programType: 'VIDEO_COURSE',
      description: 'Món tráng miệng thanh mát, béo ngậy, với những sợi chè lọt xanh mướt dẻo dai, hòa quyện cùng nước cốt dừa thơm béo. Học cách làm sương sa hạt lựu trong veo chuẩn vị.',
      thumbnail: '/baking/images/service/04.jpg',
      learningGoals: [
        { skill: 'Làm sợi chè lọt dẻo dai xanh mướt', percent: 95 },
        { skill: 'Nấu nước cốt dừa thơm béo chuẩn vị', percent: 90 },
        { skill: 'Làm sương sa hạt lựu trong veo', percent: 88 }
      ],
      classIncludes: ['8 video bài giảng HD', 'Công thức chi tiết PDF', 'Nhóm trao đổi Zalo'],
      curriculum: [
        { title: 'Phần 1: Chuẩn bị nguyên liệu', content: 'Chọn bột, lá dứa, nước cốt dừa và các loại topping.' },
        { title: 'Phần 2: Kỹ thuật làm sợi chè lọt', content: 'Pha bột, tạo sợi dẻo dai và giữ màu xanh tự nhiên.' },
        { title: 'Phần 3: Hoàn thiện & Trình bày', content: 'Phối topping, nước cốt dừa và cách bày tô hấp dẫn.' }
      ]
    },
    {
      slug: 'banh-trung-thu-handmade',
      category: "Bánh Truyền Thống",
      title: 'Workshop Bánh Trung Thu Handmade',
      price: 550000,
      salePrice: 450000,
      students: 245,
      isFeatured: false,
      programType: 'VIDEO_COURSE',
      description: 'Tự tay làm bánh Trung Thu nhân thập cẩm và nhân đậu xanh trứng muối. Mỗi học viên mang về 4 chiếc bánh thành phẩm. Học từ khâu làm vỏ đến ép khuôn chuyên nghiệp.',
      thumbnail: '/baking/images/service/05.jpg',
      learningGoals: [
        { skill: 'Làm vỏ bánh nướng mềm mịn', percent: 90 },
        { skill: 'Chế biến nhân thập cẩm truyền thống', percent: 88 },
        { skill: 'Ép khuôn và nướng bánh hoàn hảo', percent: 85 }
      ],
      classIncludes: ['10 video bài giảng HD', 'Danh sách nguyên liệu chi tiết', 'Video bonus trang trí'],
      curriculum: [
        { title: 'Phần 1: Làm vỏ bánh', content: 'Pha bột, nhào và ủ vỏ bánh nướng truyền thống.' },
        { title: 'Phần 2: Chế biến nhân', content: 'Nhân thập cẩm, nhân đậu xanh trứng muối, nhân custard.' },
        { title: 'Phần 3: Ép khuôn & Nướng', content: 'Bao nhân, ép khuôn đẹp và kỹ thuật nướng vàng đều.' }
      ]
    },
    {
      slug: 'masterclass-sushi-sashimi',
      category: "Món Á & Quốc Tế",
      title: 'Masterclass Sushi & Sashimi',
      price: 750000,
      salePrice: 600000,
      students: 189,
      isFeatured: false,
      programType: 'VIDEO_COURSE',
      description: 'Học trực tiếp với đầu bếp Nhật Bản: Kỹ thuật cắt cá sashimi, cuộn sushi maki/nigiri, pha trộn giấm sushi. Trải nghiệm thực hành 100% tại xưởng bếp chuyên nghiệp.',
      thumbnail: '/baking/images/service/06.jpg',
      learningGoals: [
        { skill: 'Cắt cá sashimi chuẩn Nhật', percent: 92 },
        { skill: 'Cuộn sushi maki và nigiri đẹp mắt', percent: 88 },
        { skill: 'Pha trộn giấm sushi và nấu cơm sushi', percent: 95 }
      ],
      classIncludes: ['18 video bài giảng HD', 'Bộ công thức Sushi toàn tập', 'Chứng nhận hoàn thành'],
      curriculum: [
        { title: 'Phần 1: Cơm sushi hoàn hảo', content: 'Chọn gạo, nấu cơm và pha giấm sushi chuẩn vị.' },
        { title: 'Phần 2: Kỹ thuật cắt cá', content: 'Các kiểu cắt sashimi, chuẩn bị hải sản tươi sống.' },
        { title: 'Phần 3: Cuộn & Trình bày', content: 'Maki, nigiri, temaki và nghệ thuật bày đĩa sushi.' }
      ]
    },
    {
      slug: 'lam-banh-mi-viet-nam',
      category: "Bánh Mì & Bakery",
      title: 'Làm Bánh Mì Việt Nam Chuẩn Vị Sài Gòn',
      price: 420000,
      salePrice: 350000,
      students: 412,
      isFeatured: false,
      programType: 'VIDEO_COURSE',
      description: 'Bí quyết làm bánh mì vỏ giòn ruột xốp đúng kiểu Sài Gòn. Từ cách ủ bột, nướng lò đến các loại nhân: pate gan, chả lụa, thịt nguội và đồ chua.',
      thumbnail: '/baking/images/gallery/01.jpg',
      learningGoals: [
        { skill: 'Ủ bột và nướng bánh mì giòn xốp', percent: 95 },
        { skill: 'Làm pate gan và chả lụa tại nhà', percent: 85 },
        { skill: 'Phối nhân và trình bày ổ bánh mì hoàn chỉnh', percent: 90 }
      ],
      classIncludes: ['9 video bài giảng HD', 'Công thức bột bánh mì bí truyền', 'Nhóm hỗ trợ Zalo'],
      curriculum: [
        { title: 'Phần 1: Bột bánh mì', content: 'Pha bột, nhào, ủ và tạo hình ổ bánh.' },
        { title: 'Phần 2: Nhân bánh mì', content: 'Pate gan, chả lụa, thịt nguội, đồ chua.' },
        { title: 'Phần 3: Nướng & Phối hợp', content: 'Kỹ thuật nướng giòn và ráp ổ bánh mì hoàn hảo.' }
      ]
    },
    {
      slug: 'decorating-cake-fondant',
      category: "Bánh Ngọt & Pastry",
      title: 'Decorating Cake Fondant Nghệ Thuật',
      price: 850000,
      salePrice: 680000,
      students: 156,
      isFeatured: false,
      programType: 'VIDEO_COURSE',
      description: 'Học cách phủ fondant mượt mà, tạo hoa hồng, lá và các chi tiết trang trí bánh kem. Từ bánh sinh nhật đơn giản đến bánh cưới nhiều tầng sang trọng.',
      thumbnail: '/baking/images/gallery/02.jpg',
      learningGoals: [
        { skill: 'Phủ fondant mượt mà không nứt', percent: 90 },
        { skill: 'Tạo hoa hồng và chi tiết 3D', percent: 85 },
        { skill: 'Thiết kế bánh cưới nhiều tầng', percent: 80 }
      ],
      classIncludes: ['14 video bài giảng HD', 'Bộ template thiết kế bánh', 'Cập nhật trọn đời'],
      curriculum: [
        { title: 'Phần 1: Chuẩn bị fondant', content: 'Nhào fondant, tô màu và bảo quản đúng cách.' },
        { title: 'Phần 2: Phủ bánh', content: 'Kỹ thuật phủ fondant mượt, xử lý góc cạnh.' },
        { title: 'Phần 3: Tạo hình nâng cao', content: 'Hoa hồng, lá, ruy-băng và trang trí 3D.' }
      ]
    },
    {
      slug: 'pho-bo-truyen-thong',
      category: "Món Á & Quốc Tế",
      title: 'Phở Bò Truyền Thống Hà Nội',
      price: 380000,
      salePrice: null,
      students: 567,
      isFeatured: false,
      programType: 'VIDEO_COURSE',
      description: 'Bí quyết nấu nước dùng phở bò trong vắt, thơm nức mũi từ xương ống và gia vị truyền thống. Học cách làm bánh phở tươi tại nhà và trình bày tô phở chuẩn Hà Nội.',
      thumbnail: '/baking/images/gallery/03.jpg',
      learningGoals: [
        { skill: 'Hầm nước dùng xương trong vắt 12 tiếng', percent: 95 },
        { skill: 'Phối gia vị phở chuẩn vị', percent: 92 },
        { skill: 'Làm bánh phở tươi tại nhà', percent: 80 }
      ],
      classIncludes: ['7 video bài giảng HD', 'Công thức gia vị bí truyền', 'Video bonus phở gà'],
      curriculum: [
        { title: 'Phần 1: Nước dùng', content: 'Chọn xương, chần, hầm và lọc nước dùng trong vắt.' },
        { title: 'Phần 2: Gia vị & Bánh phở', content: 'Phối gia vị, nướng hành gừng, làm bánh phở.' },
        { title: 'Phần 3: Hoàn thiện', content: 'Thái thịt, bày tô và rau ăn kèm chuẩn vị.' }
      ]
    }
  ],
  chiefs: [
    {
      name: 'Nguyễn Minh Tuấn',
      role: 'Bếp Trưởng',
      image: '/baking/images/team/01.jpg',
      socialFb: '#', socialTw: '#', socialIn: '#'
    },
    {
      name: 'Trần Thị Hương',
      role: 'Bếp Trưởng Bánh',
      image: '/baking/images/team/02.jpg',
      socialFb: '#', socialTw: '#', socialIn: '#'
    },
    {
      name: 'Lê Văn Đức',
      role: 'Chuyên gia Ẩm thực',
      image: '/baking/images/team/03.jpg',
      socialFb: '#', socialTw: '#', socialIn: '#'
    },
    {
      name: 'Phạm Thị Mai',
      role: 'Giảng viên',
      image: '/baking/images/team/04.jpg',
      socialFb: '#', socialTw: '#', socialIn: '#'
    }
  ],
  blog: [
    {
      title: 'Bí Quyết Nướng Bánh Mì Giòn Xốp Tại Nhà',
      dateString: '15 Tháng 4, 2026',
      dateIso: '2026-04-15T08:00:00+07:00',
      image: '/baking/images/img-01.jpg',
      authorName: 'Admin',
      category: 'Công thức',
      content: 'Khám phá bí quyết để nướng được ổ bánh mì vỏ giòn tan, ruột xốp mềm ngay tại nhà mà không cần lò nướng chuyên nghiệp.',
      slug: 'bi-quyet-nuong-banh-mi'
    },
    {
      title: '5 Món Tráng Miệng Không Cần Lò Nướng',
      dateString: '18 Tháng 4, 2026',
      dateIso: '2026-04-18T08:00:00+07:00',
      image: '/baking/images/img-02.jpg',
      authorName: 'Admin',
      category: 'Mẹo vặt',
      content: 'Tổng hợp 5 món tráng miệng siêu dễ làm tại nhà mà không cần sử dụng lò nướng, phù hợp cho mọi bếp gia đình.',
      slug: '5-mon-trang-mieng'
    },
    {
      title: 'Cách Chọn Nguyên Liệu Tươi Cho Bếp Nhà',
      dateString: '20 Tháng 4, 2026',
      dateIso: '2026-04-20T08:00:00+07:00',
      image: '/baking/images/img-03.jpg',
      authorName: 'Admin',
      category: 'Kiến thức',
      content: 'Hướng dẫn chi tiết cách phân biệt và chọn mua nguyên liệu tươi sống chất lượng cao cho bữa ăn gia đình.',
      slug: 'cach-chon-nguyen-lieu'
    }
  ],
  testimonials: [
    {
      excerpt: 'Khóa học rất chất lượng, tôi đã làm được bánh mì giòn xốp tại nhà.',
      text: 'Sau khi hoàn thành khóa học, tôi có thể tự tin nướng bánh mì, làm pastry và trang trí bánh kem cho gia đình. Giảng viên hướng dẫn rất tận tâm và dễ hiểu. Đây là khoản đầu tư xứng đáng nhất cho đam mê nấu ăn của tôi.',
      name: 'Nguyễn Thị Lan',
      role: 'Học viên khóa Bánh Ngọt'
    },
    {
      excerpt: 'Video bài giảng rõ ràng, có thể xem lại bất cứ lúc nào rất tiện.',
      text: 'Tôi rất thích hình thức học premium content vì có thể xem đi xem lại nhiều lần. Công thức chi tiết, từng bước một rất dễ theo dõi. Nhóm Zalo hỗ trợ cũng rất nhiệt tình khi tôi gặp vấn đề.',
      name: 'Trần Minh Khoa',
      role: 'Học viên khóa Phở Bò'
    },
    {
      excerpt: 'Chất lượng video và nội dung vượt xa mong đợi của tôi.',
      text: 'Ban đầu tôi hơi ngại mua khóa học online, nhưng sau khi trải nghiệm thì thực sự ấn tượng. Video quay rất đẹp, hướng dẫn từng chi tiết nhỏ. Giờ tôi đã mở được tiệm bánh nhỏ tại nhà nhờ kiến thức từ các khóa học.',
      name: 'Phạm Hồng Nhung',
      role: 'Học viên khóa Trang Trí Bánh'
    }
  ]
};

async function main() {
  console.log('🌱 Bắt đầu seeding dữ liệu mới (Premium Content Only)...');

  // Clear existing data
  console.log('  → Xóa dữ liệu cũ...');
  await prisma.order.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.classSession.deleteMany({});
  await prisma.program.deleteMany({});

  // Seed programs — all VIDEO_COURSE (Premium Content)
  const chiefList = await prisma.chief.findMany();
  
  for (let i = 0; i < MOCK_DATA.programs.length; i++) {
    const p = MOCK_DATA.programs[i];
    
    // Assign a chief if available
    const chiefId = chiefList.length > 0 ? chiefList[i % chiefList.length].id : undefined;

    await prisma.program.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        price: p.price,
        salePrice: p.salePrice,
        students: p.students,
        description: p.description,
        thumbnail: p.thumbnail,
        programType: p.programType,
        isFeatured: p.isFeatured,
        learningGoals: p.learningGoals,
        classIncludes: p.classIncludes,
        curriculum: p.curriculum,
        ...(chiefId && { chiefId }),
      },
      create: {
        slug: p.slug,
        title: p.title,
        price: p.price,
        salePrice: p.salePrice,
        students: p.students,
        description: p.description,
        thumbnail: p.thumbnail,
        programType: p.programType,
        isFeatured: p.isFeatured,
        learningGoals: p.learningGoals,
        classIncludes: p.classIncludes,
        curriculum: p.curriculum,
        ...(chiefId && { chiefId }),
      },
    });
    console.log(`  ✅ ${p.isFeatured ? '⭐' : '🆕'} ${p.title}`);
  }
  console.log(`\n📦 Đã seed ${MOCK_DATA.programs.length} khóa học Premium Content`);
  console.log(`   → Nổi bật: ${MOCK_DATA.programs.filter(p => p.isFeatured).length}`);
  console.log(`   → Mới: ${MOCK_DATA.programs.filter(p => !p.isFeatured).length}`);

  // Seed chiefs
  await prisma.chief.deleteMany({});
  for (const chief of MOCK_DATA.chiefs) {
    await prisma.chief.create({ data: chief });
  }
  console.log(`✅ Đã seed ${MOCK_DATA.chiefs.length} giảng viên`);

  // Seed blog posts
  for (const post of MOCK_DATA.blog) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        content: post.content,
        thumbnail: post.image,
        desc: post.content,
        authorName: post.authorName,
        category: post.category,
        dateString: post.dateString,
        dateIso: new Date(post.dateIso)
      },
    });
  }
  console.log(`✅ Đã seed ${MOCK_DATA.blog.length} bài viết`);

  // Seed testimonials
  await prisma.testimonial.deleteMany({});
  for (const t of MOCK_DATA.testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`✅ Đã seed ${MOCK_DATA.testimonials.length} nhận xét`);

  console.log('\n🎉 Seeding hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
