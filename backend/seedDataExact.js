const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seed exact data from index.html starting...');

  // Reset collections safely
  console.log('Cleaning up existing data (Except Users)...');
  await prisma.order.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.classSession.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.chief.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.testimonial.deleteMany({});

  console.log('Cleanup completed!');

  // 1. Chiefs
  console.log('Seeding Chiefs...');
  const chiefsData = [
    { name: 'Alexander Lamb', role: 'Bếp trưởng', image: '/baking/images/team/01.jpg', email: 'alex@baking.com', bio: 'Bếp trưởng chuyên về Ẩm thực Quốc tế.' },
    { name: 'Herbert Webster', role: 'Bếp trưởng', image: '/baking/images/team/02.jpg', email: 'herb@baking.com', bio: 'Chuyên gia về Cá, Thịt & Gia cầm.' },
    { name: 'Hana Montgom', role: 'Bếp trưởng', image: '/baking/images/team/03.jpg', email: 'hana@baking.com', bio: 'Nhà am hiểu về Ẩm thực Nam Mỹ.' },
    { name: 'Owen Bradley', role: 'Bếp trưởng', image: '/baking/images/team/04.jpg', email: 'owen@baking.com', bio: 'Chuyên gia bậc thầy về Tráng miệng Pháp.' },
    { name: 'Susie Perez', role: 'Bếp phó', image: '/baking/images/team/05.jpg', email: 'susie@baking.com', bio: 'Bếp phó phụ trách Sushi & đồ u.' },
    { name: 'Floyd Weaver', role: 'Chuyên gia rượu', image: '/baking/images/team/06.jpg', email: 'floyd@baking.com', bio: 'Chuyên gia Rượu vang và Hải sản.' }
  ];

  const bioText = "Hơn 15 năm kinh nghiệm làm việc tại các nhà hàng sao Michelin trên toàn cầu. Một triết lí nấu ăn tôn trọng hương vị nguyên bản và kỹ thuật chế biến tỉ mỉ. Các món ăn luôn được cân bằng hoàn hảo giữa sáng tạo và truyền thống.";
  const bioHTML = `<h4 class="mb-20">Tiểu sử:</h4>
<p>Bắt đầu sự nghiệp từ một học việc nhỏ trong lò bánh mì ở Pháp, từng bước vươn lên vị trí Bếp trưởng điều hành (Executive Chef) tại khách sạn 5 sao. Niềm đam mê mãnh liệt với các loại gia vị đã thúc đẩy việc nghiên cứu ẩm thực toàn cầu.</p>
<p>Phương châm làm việc: "Sự hoàn hảo không đến từ phép màu, nó đến từ những kỹ năng cơ bản được luyện tập nghìn lần". Có kinh nghiệm thiết kế thực đơn cho nhiều nguyên thủ quốc gia.</p>
<h4 class="mb-10 mt-40">Đời sống chuyên môn:</h4>
<p>Thường xuyên tổ chức các buổi hội thảo và lớp học chuyên sâu. Khám phá văn hóa ẩm thực các vùng miền để đưa vào giáo án. Sự chu đáo và tận tâm luôn là kim chỉ nam truyền lửa cho các lứa học viên.</p>`;
  const highlightsText = "Kỹ thuật thái dao điêu luyện|Bậc thầy kiểm soát nhiệt độ nướng|Chuyên gia phối hợp rượu và thực phẩm";
  const skillsJSON = JSON.stringify([
    { name: "Sáng tạo", percent: 85 },
    { name: "Kỹ thuật dao", percent: 95 },
    { name: "Quản lý bếp", percent: 90 },
    { name: "Gia vị", percent: 100 }
  ]);

  const createdChiefs = [];
  for (const c of chiefsData) {
    const chief = await prisma.chief.create({
      data: {
        name: c.name, 
        role: c.role, 
        bio: bioText, 
        image: c.image === '/baking/images/team/01.jpg' ? '/baking/images/team/single-profile.jpg' : c.image,
        biography: bioHTML,
        highlights: highlightsText,
        skills: skillsJSON,
        socialFb: '#',
        socialTw: '#',
        socialIn: '#'
      }
    });
    createdChiefs.push(chief);
  }

  // 2. Programs
  console.log('Seeding Programs...');
  
  const pgrmTemplate = {
    classIncludes: ["Tài liệu công thức chi tiết chuẩn nhà hàng", "Nguyên liệu cao cấp được chuẩn bị sẵn", "Phiếu giảm giá mua dụng cụ bếp độc quyền tại YumSaigon"],
    curriculum: [
      { title: "Bài 1: Giới thiệu và An toàn thực phẩm", content: "Hiểu về các nguyên tắc an toàn, sơ chế vi khuẩn và cách giữ vệ sinh trạm làm việc, cách dùng dao an toàn nhất." },
      { title: "Bài 2: Kỹ năng xử lý nhiệt và kỹ thuật cắt bản", content: "Nắm vững các kỹ thuật xào, áp chảo và 5 cách thái nguyên liệu chuẩn như brunoise, julienne." }
    ],
    learningGoals: [
      { skill: "Cơ bản", percent: 25 },
      { skill: "Vệ sinh", percent: 50 },
      { skill: "Kỹ năng dao", percent: 75 },
      { skill: "Độ nhạy bếp", percent: 100 }
    ]
  };

  const programsData = [
    { title: 'Làm bánh ngọt & Pastry', slug: 'baking-and-pastry', price: 55000, students: 18, reviews: 423, thumbnail: '/baking/images/service/01.jpg', description: 'Đắm mình trong men và bột mì. Nurture đôi tay đánh trứng và nướng bánh vàng ươm.', chiefId: createdChiefs[0].id, authorImage: '/baking/images/team/07.jpg' },
    { title: 'Xử lý Thịt, Cá & Gia Cầm', slug: 'fish-meat-poultry', price: 48000, students: 23, reviews: 658, thumbnail: '/baking/images/service/02.jpg', description: 'Hướng dẫn tách xương cá nghệ thuật, ướp thịt bò bít tết đúng chuẩn và cách quay da ngỗng giòn rụm.', chiefId: createdChiefs[1].id, authorImage: '/baking/images/team/08.jpg' },
    { title: 'Ẩm thực Ngoại m', slug: 'exotic-cuisines', price: 66000, students: 12, reviews: 359, thumbnail: '/baking/images/service/03.jpg', description: 'Du hành hương vị qua các quốc gia với những món ăn đầy sắc mầu gia vị từ vùng Caribbean đến Trung Đông.', chiefId: createdChiefs[2].id, authorImage: '/baking/images/team/09.jpg' },
    { title: 'Tráng Miệng Kiểu Pháp', slug: 'french-desserts', price: 35900, students: 24, reviews: 259, thumbnail: '/baking/images/service/04.jpg', description: 'Làm chủ nghệ thuật bánh Macaron, kĩ thuật đánh choux và cách tạo ra bánh opera tầng quyến rũ.', chiefId: createdChiefs[3].id, authorImage: '/baking/images/team/10.jpg' },
    { title: 'Ẩm thực Quốc tế Á Âu', slug: 'international-cuisine', price: 35000, students: 30, reviews: 751, thumbnail: '/baking/images/service/05.jpg', description: 'Từ món mì Ý cổ điển tới đĩa Sushi tinh tế. Các kĩ thuật đan xen Âu - Á đỉnh cao nhất hiện nay.', chiefId: createdChiefs[4].id, authorImage: '/baking/images/team/11.jpg' },
    { title: 'Hải sản Cao cấp & Rượu vang', slug: 'seafood-and-wine', price: 79900, students: 16, reviews: 469, thumbnail: '/baking/images/service/06.jpg', description: 'Pha chế nước sốt hảo hạng, xử lý tôm hùm, vẹm xanh và cách chọn vang trắng hoàn hảo để đi kèm.', chiefId: createdChiefs[5].id, authorImage: '/baking/images/team/12.jpg' }
  ];

  const createdPrograms = {}; // slug -> id
  for (const p of programsData) {
    const prog = await prisma.program.create({
      data: {
        title: p.title, slug: p.slug, price: p.price,
        students: p.students, reviews: p.reviews,
        thumbnail: p.thumbnail, description: p.description,
        chiefId: p.chiefId, authorImage: p.authorImage,
        learningGoals: pgrmTemplate.learningGoals,
        classIncludes: pgrmTemplate.classIncludes,
        curriculum: pgrmTemplate.curriculum,
      }
    });
    createdPrograms[p.slug] = prog.id;
  }

  // 3. Class Sessions (Timetable)
  console.log('Seeding Class Sessions...');
  
  // Create a helper to quickly insert sessions across different days
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 10);
  const getFDate = (offset) => { const d = new Date(baseDate); d.setDate(d.getDate() + offset); return d; };

  const sessions = [
    { pid: createdPrograms['international-cuisine'], dayOfWeek: 'Sunday', timeRange: '09:00 am - 11:30 am', startDate: getFDate(0), endDate: getFDate(30), instructorOverride: 'Alexander Lamb' },
    { pid: createdPrograms['fish-meat-poultry'], dayOfWeek: 'Sunday', timeRange: '11:30 am - 01:15 pm', startDate: getFDate(5), endDate: getFDate(40), instructorOverride: 'Bert Webster' },
    { pid: createdPrograms['exotic-cuisines'], dayOfWeek: 'Sunday', timeRange: '01:15 pm - 04:30 pm', startDate: getFDate(7), endDate: getFDate(45), instructorOverride: 'Hana Montgom' },
    { pid: createdPrograms['french-desserts'], dayOfWeek: 'Sunday', timeRange: '04:30 pm - 07:00 pm', startDate: getFDate(14), endDate: getFDate(60), instructorOverride: 'Elen Bucnan' },
    
    { pid: createdPrograms['french-desserts'], dayOfWeek: 'Monday', timeRange: '09:00 am - 11:30 am', startDate: getFDate(2), endDate: getFDate(32), instructorOverride: 'Alexander Lamb' },
    { pid: createdPrograms['international-cuisine'], dayOfWeek: 'Monday', timeRange: '11:30 am - 01:15 pm', startDate: getFDate(4), endDate: getFDate(44), instructorOverride: 'Bert Webster' },
    { pid: createdPrograms['fish-meat-poultry'], dayOfWeek: 'Monday', timeRange: '01:15 pm - 04:30 pm', startDate: getFDate(8), endDate: getFDate(50), instructorOverride: 'Hana Montgom' },
    { pid: createdPrograms['exotic-cuisines'], dayOfWeek: 'Monday', timeRange: '04:30 pm - 07:00 pm', startDate: getFDate(12), endDate: getFDate(56), instructorOverride: 'Elen Bucnan' },

    { pid: createdPrograms['international-cuisine'], dayOfWeek: 'Tuesday', timeRange: '09:00 am - 11:30 am', startDate: getFDate(1), endDate: getFDate(31), instructorOverride: 'Alexander Lamb' },
    { pid: createdPrograms['fish-meat-poultry'], dayOfWeek: 'Tuesday', timeRange: '11:30 am - 01:15 pm', startDate: getFDate(3), endDate: getFDate(40), instructorOverride: 'Bert Webster' },
    { pid: createdPrograms['exotic-cuisines'], dayOfWeek: 'Tuesday', timeRange: '01:15 pm - 04:30 pm', startDate: getFDate(9), endDate: getFDate(45), instructorOverride: 'Hana Montgom' },
    { pid: createdPrograms['french-desserts'], dayOfWeek: 'Tuesday', timeRange: '04:30 pm - 07:00 pm', startDate: getFDate(10), endDate: getFDate(55), instructorOverride: 'Elen Bucnan' },
    
    // Wed to Sat mapped simply to fill the DB robustly
    { pid: createdPrograms['baking-and-pastry'], dayOfWeek: 'Wednesday', timeRange: '09:00 am - 11:30 am', startDate: getFDate(3), endDate: getFDate(33) },
    { pid: createdPrograms['seafood-and-wine'], dayOfWeek: 'Thursday', timeRange: '11:30 am - 01:15 pm', startDate: getFDate(5), endDate: getFDate(35) },
    { pid: createdPrograms['exotic-cuisines'], dayOfWeek: 'Friday', timeRange: '01:15 pm - 04:30 pm', startDate: getFDate(6), endDate: getFDate(36) },
    { pid: createdPrograms['international-cuisine'], dayOfWeek: 'Saturday', timeRange: '09:00 am - 11:30 am', startDate: getFDate(7), endDate: getFDate(37) }
  ];

  for(const s of sessions) {
    if(s.pid) {
      await prisma.classSession.create({
        data: {
          programId: s.pid,
          startDate: s.startDate,
          endDate: s.endDate,
          enrollmentDeadline: s.startDate,
          dayOfWeek: s.dayOfWeek,
          timeRange: s.timeRange,
          instructorOverride: s.instructorOverride || null,
        }
      });
    }
  }

  // 4. Testimonials
  console.log('Seeding Testimonials...');
  const tests = [
    { name: 'Nguyễn Lê', role: 'Cựu học viên / Đầu bếp', text: 'Chương trình cực kỳ chất lượng, giảng viên Alexander hướng dẫn nhiệt tình. Lớp học mang tính chất thực hành cao và giúp tôi kiếm được việc làm mơ ước.', signature: '/baking/images/signature.png', excerpt: 'Điều tuyệt vời nhất là thái độ của thầy cô rất ân cần.' },
    { name: 'Thanh Trúc', role: 'Doanh nhân mở quán', text: 'Tôi mở một tiệm bánh nhỏ và kiến thức từ khoá Tráng miệng Pháp thực sự đã cứu rỗi menu của tôi. Doanh số tăng vọt nhờ vào bánh Macaron chuẩn vị.', signature: '/baking/images/signature.png', excerpt: 'Tôi rất biết ơn khóa học này.' },
    { name: 'Hoàng Kiên', role: 'Học viên đam mê', text: 'Từ một người chưa từng đứng bếp, giờ đây tôi tự tin đãi cả nhà những món hải sản sang trọng không kém nhà hàng. Chi phí khóa học vô cùng xứng đáng!', signature: '/baking/images/signature.png', excerpt: 'Khuyên mọi người nên đăng ký.' },
  ];
  for(const t of tests) {
    await prisma.testimonial.create({ data: t });
  }

  // 5. Posts
  console.log('Seeding Posts...');
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  const categories = ['Công thức', 'Lớp học', 'Nấu ăn', 'Mẹo vặt', 'Nhà bếp'];
  const thumbnails = [
    '/baking/images/img-01.jpg', '/baking/images/img-02.jpg', '/baking/images/img-03.jpg', 
    '/baking/images/gallery/01.jpg', '/baking/images/gallery/02.jpg', '/baking/images/gallery/03.jpg',
    '/baking/images/gallery/04.jpg', '/baking/images/gallery/05.jpg', '/baking/images/gallery/06.jpg',
    '/baking/images/gallery/07.jpg', '/baking/images/gallery/08.jpg', '/baking/images/gallery/09.jpg',
    '/baking/images/gallery/10.jpg', '/baking/images/gallery/11.jpg', '/baking/images/gallery/12.jpg'
  ];

  const posts = [
    { title: 'Bí Quyết Làm Bít Tết Mềm Tan Mọng Nước', slug: 'bi-quyet-lam-bit-tet-mem-tan-mong-nuoc', desc: 'Canh chuẩn thời gian và nhiệt độ bơ để có một phần thăn nõn bò hảo hạng.', category: 'Công thức' },
    { title: 'Mẹo Nướng Gà Tây Bằng Bếp Ga Tự Nhiên', slug: 'meo-nuong-ga-tay-bang-bep-ga-tu-nhien', desc: 'Bếp không cần quá đắt tiền, chỉ cần biết xếp vị trí giấy bạc và canh gió.', category: 'Công thức' },
    { title: 'Cách Ép Nước Trái Cây Thanh Lọc Mùa Hè', slug: 'cach-ep-nuoc-trai-cay-thanh-loc-mua-he', desc: 'Quy trình lựa dứa và táo tươi chuẩn nhà vườn giúp detox cơ thể tự nhiên và khỏe mạnh.', category: 'Công thức' },
    { title: 'Lớp Học Nấu Ăn Thay Đổi Tư Duy Dinh Dưỡng', slug: 'lop-hoc-nau-an-thay-doi-tu-duy', desc: 'Chỉ cần nắm nguyên lý cốt lõi, bạn sẽ tự thấy vui mỗi khi bước vào bếp.', category: 'Lớp học' },
    { title: 'Hướng Dẫn Chọn Masterclass Phù Hợp Cho Bạn', slug: 'huong-dan-chon-masterclass-phu-hop', desc: 'So sánh giữa khóa bánh ngọt mộng mơ và khóa hải sản sang trọng.', category: 'Lớp học' },
    { title: 'Top 5 Kỹ Năng Dao Tối Thượng Cần Kiểm Soát', slug: 'top-5-ky-nang-dao-toi-thuong', desc: 'Đừng sợ đứt tay, hãy học cách dùng dao đúng chuẩn nhà hàng Pháp.', category: 'Lớp học' },
    { title: 'Nghệ Thuật Tráng Trứng Omelette Chuẩn Pháp', slug: 'nghe-thuat-trang-trung-omelette', desc: 'Mềm mịn, vàng ươm và béo ngậy. Tuyệt đối không để lửa quá già.', category: 'Nấu ăn' },
    { title: 'Khắt Khe Về Độ Chín Của Cồi Sò Điệp', slug: 'khat-khe-ve-do-chin-coi-so-diep', desc: 'Bí kíp áp chảo hoàn hảo chỉ 1.5 phút mỗi mặt để đạt cảnh giới mềm tơi.', category: 'Nấu ăn' },
    { title: 'Kỹ Thuật Slow-Roasting Mang Lại Vị Ngọt Hậu', slug: 'ky-thuat-slow-roasting-ngot-hau', desc: 'Kiên nhẫn là mẹ thành công khi xử lý những tảng thịt cổ đầy gân gút khó xơi.', category: 'Nấu ăn' },
    { title: 'Tên Gọi Các Lối Thái Rau Củ Chuyên Nghiệp', slug: 'ten-goi-loi-thai-rau-cu-chuyen-nghiep', desc: 'Julienne, brunoise, hay chiffonade: Ngôn ngữ của sự tỉ mẩn.', category: 'Mẹo vặt' },
    { title: 'Hóa Học Đằng Sau Một Chiếc Bánh Hoàn Hảo', slug: 'hoa-hoc-dang-sau-chiec-banh-hoan-hao', desc: 'Cân tiểu ly và cái nhiệt kế làm bánh là hai vật bất ly thân nếu bạn muốn bánh giòn.', category: 'Mẹo vặt' },
    { title: 'Nghệ Thuật Decor Đĩa Thức Ăn Như Bếp Trưởng', slug: 'nghe-thuat-decor-dia-thuc-an', desc: 'Đánh lừa thị giác và tăng độ hấp dẫn món ăn qua việc vận dụng khoảng trắng.', category: 'Mẹo vặt' },
    { title: 'Dụng Cụ Cần Thiết Trong Căn Bếp Hiện Đại', slug: 'dung-cu-can-thiet-trong-bep', desc: 'Thứ bạn thực sự cần, vs những thứ lòe loẹt mà review trên mạng khuyên bạn mua.', category: 'Nhà bếp' },
    { title: 'Sắp Xếp Tủ Đồ Khô Thông Minh Gọn Gàng', slug: 'sap-xep-tu-do-kho-thong-minh', desc: 'Nguyên tắc FIFO (Vào trước - Ra trước) cứu rỗi những túi bột hết hạn.', category: 'Nhà bếp' },
    { title: 'Bảo Dưỡng Chảo Gan Đúng Cách Cả Đời Không Hỏng', slug: 'bao-duong-chao-gan-dung-cach', desc: 'Tôi dầu ra sao, rửa thế nào để chảo lúc nào cũng giữ lớp chống dính tự nhiên thần thánh.', category: 'Nhà bếp' }
  ].map((p, idx) => ({
    ...p,
    thumbnail: thumbnails[idx % thumbnails.length],
    content: `<p>${p.desc}</p><p>Nấu ăn là một hành trình thú vị. Nó không chỉ đơn thuần là việc kết hợp các nguyên liệu trên lửa, mà còn là sự thăng hoa của cảm xúc, của sự tỉ mỉ và tình yêu dành cho người thưởng thức. Từ việc lựa chọn những lát thịt tươi ngon nhất ngoài chợ sáng cho đến khoảnh khắc bạn vung dao lướt qua nhánh măng tây.</p><p>Tại YumSaigon, chúng tôi luôn khuyên học viên rằng 50% độ ngon của món ăn nằm ở bí quyết chuẩn bị, và 50% còn lại đến từ sự tuân thủ nghiêm ngặt kỹ thuật lửa và gia vị. Hãy luôn kiên nhẫn, vì nụ cười khi thưởng thức bữa ăn ngon sẽ đền đáp tất cả.</p>`,
    createdAt: new Date(new Date('2018-01-19T00:00:00Z').getTime() + idx * 86400000)
  }));

  for(const pt of posts) {
    await prisma.post.create({
       data: {
         title: pt.title, slug: pt.slug, desc: pt.desc, content: pt.content, thumbnail: pt.thumbnail,
         authorId: admin ? admin.id : null, category: pt.category,
         createdAt: pt.createdAt
       }
    });
  }

  console.log('🎉 All 100% Mock Data Seeded Successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
