const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const STUDENT_WORKS = [
    {
      studentName: 'Nguyễn Thị Lan',
      imageUrl: '/images/gallery/01.jpg',
      description: 'Lần đầu tiên tôi nướng được ổ bánh mì giòn rụm như thế này. Cảm ơn khóa học đã hướng dẫn rất tận tình từ khâu trộn bột đến canh nhiệt độ lò.',
      programSlug: 'lam-banh-ngot-pastry',
      status: 'APPROVED'
    },
    {
      studentName: 'Trần Minh Khoa',
      imageUrl: '/images/gallery/02.jpg',
      description: 'Bánh kem fondant đầu tay của tôi làm cho sinh nhật con gái. Lớp học cực kỳ chi tiết, giúp tôi thạo các kỹ thuật khó.',
      programSlug: 'decorating-cake-fondant',
      status: 'APPROVED'
    },
    {
      studentName: 'Phạm Hồng Nhung',
      imageUrl: '/images/gallery/03.jpg',
      description: 'Tô phở bò nóng hổi từ công thức bí truyền Hà Nội. Chồng tôi bảo ngon hơn cả ngoài tiệm. Thật sự đáng giá từng xu!',
      programSlug: 'pho-bo-truyen-thong',
      status: 'APPROVED'
    },
    {
      studentName: 'Lê Hoàng Hải',
      imageUrl: '/images/gallery/04.jpg',
      description: 'Bài nộp khóa bánh trung thu. Lần đầu làm nên vỏ bánh hơi nứt một xíu nhưng nhân đậu xanh trứng muối rất ngon.',
      programSlug: 'banh-trung-thu-handmade',
      status: 'PENDING'
    },
    {
      studentName: 'Đinh Tuấn Vũ',
      imageUrl: '/images/gallery/05.jpg',
      description: 'Sushi nigiri và maki. Cơm hơi nhão xíu nhưng cá thì siêu tươi. Cần luyện tập thêm kỹ thuật cắt cá.',
      programSlug: 'masterclass-sushi-sashimi',
      status: 'PENDING'
    },
    {
      studentName: 'Vũ Thị Trà My',
      imageUrl: '/images/gallery/06.jpg',
      description: 'Chè lọt Thái xanh mướt. Thơm mùi lá dứa và béo cốt dừa. Rất thành công ngay từ lần đầu!',
      programSlug: 'che-lot-thai-suong-sa',
      status: 'PENDING'
    },
    {
      studentName: 'Bùi Anh Tuấn',
      imageUrl: '/images/gallery/07.jpg',
      description: 'Đây là bánh gì tôi cũng không biết nữa, làm đại thấy ăn cũng được.',
      programSlug: 'lam-banh-ngot-pastry',
      status: 'REJECTED'
    },
    {
      studentName: 'Ngô Thanh Vân',
      imageUrl: '/images/gallery/08.jpg',
      description: 'Trang trí bánh cưới 3 tầng. Học thầy xong giờ mình có thể mở tiệm nhận order luôn rồi.',
      programSlug: 'decorating-cake-fondant',
      status: 'APPROVED'
    },
    {
      studentName: 'Lý Quốc Bảo',
      imageUrl: '/images/gallery/09.jpg',
      description: 'Bánh mì Sài Gòn đặc ruột. Công thức này chuẩn thật sự.',
      programSlug: 'lam-banh-mi-viet-nam',
      status: 'APPROVED'
    },
    {
      studentName: 'Hoàng Thùy Linh',
      imageUrl: '/images/gallery/10.jpg',
      description: 'Món Paella Tây Ban Nha. Thơm lừng mùi hải sản và nghệ tây.',
      programSlug: 'am-thuc-ngoai-quoc',
      status: 'APPROVED'
    },
    {
      studentName: 'Trương Ngọc Ánh',
      imageUrl: '/images/gallery/11.jpg',
      description: 'Hình chụp mờ quá mong admin thông cảm. Bò bít tết ngon tuyệt vời.',
      programSlug: 'xu-ly-thit-ca-gia-cam',
      status: 'REJECTED'
    },
    {
      studentName: 'Phan Đình Tùng',
      imageUrl: '/images/gallery/12.jpg',
      description: 'Phở bò Hà Nội, nước dùng trong vắt, xương ống hầm đủ 12 tiếng.',
      programSlug: 'pho-bo-truyen-thong',
      status: 'APPROVED'
    }
];

async function main() {
  console.log('🚀 Seeding ONLY Student Works...');
  
  // Optional: ask user if they want to clear first. Assuming YES for seeding.
  await prisma.studentWork.deleteMany({});
  console.log('  → Deleted existing student works.');

  let seededCount = 0;
  for (const sw of STUDENT_WORKS) {
    const program = await prisma.program.findUnique({ where: { slug: sw.programSlug } });
    if (program) {
      await prisma.studentWork.create({
        data: {
          studentName: sw.studentName,
          imageUrl: sw.imageUrl,
          description: sw.description,
          status: sw.status,
          programId: program.id
        }
      });
      seededCount++;
    } else {
      console.warn(`  ⚠️ Program not found for slug: ${sw.programSlug}. Skipping...`);
    }
  }

  console.log(`✅ Successfully seeded ${seededCount} student works!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
