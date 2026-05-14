const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const programId = 'b9fc36a0-fbb4-41b0-96db-a22a362f8705';

const fakeWorks = [
  { studentName: 'Nguyễn Thị Hoa', imageUrl: 'https://images.unsplash.com/photo-1558961363-a0c84ce23610?w=600&q=80', description: 'Thành quả bài đầu tiên của mình đây ạ. Rất cảm ơn cô giáo đã hướng dẫn nhiệt tình!', status: 'APPROVED', programId },
  { studentName: 'Trần Văn Kiên', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', description: 'Làm lần đầu mà bánh đã xốp và ngon thế này rồi. Quá tuyệt vời!', status: 'APPROVED', programId },
  { studentName: 'Lê Minh Thúy', imageUrl: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80', description: 'Công thức rất chuẩn, mình làm thử 1 nửa định lượng vẫn ngon xuất sắc.', status: 'APPROVED', programId },
  { studentName: 'Phạm Hương Giang', imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80', description: 'Hơi cháy xém chút ở viền do lò nhà mình nhiệt không đều, nhưng bên trong cực kỳ mềm mịn.', status: 'APPROVED', programId },
  { studentName: 'Đặng Quốc Huy', imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600&q=80', description: 'Mình là nam giới ít khi vào bếp mà học theo video cũng làm được luôn. Vợ khen nức nở.', status: 'APPROVED', programId },
  { studentName: 'Bùi Lan Ngọc', imageUrl: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600&q=80', description: 'Trang trí hơi khó so với mình, nhưng vị trí bánh thì không chê vào đâu được.', status: 'APPROVED', programId },
  { studentName: 'Hoàng Diệu Anh', imageUrl: 'https://images.unsplash.com/photo-1605807646983-377bc5a7644e?w=600&q=80', description: 'Mọi người nhớ đánh trứng thật kỹ nhé, bí quyết để bánh nở bung đấy.', status: 'APPROVED', programId },
  { studentName: 'Võ Thị Hồng', imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=600&q=80', description: 'Bánh thơm mùi vani và bơ. Cả nhà tranh nhau ăn vèo cái hết sạch.', status: 'APPROVED', programId },
  { studentName: 'Đinh Tuấn Anh', imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80', description: 'Khóa học đáng đồng tiền bát gạo nhất mình từng mua. Rất dễ hiểu.', status: 'APPROVED', programId },
  { studentName: 'Lý Thanh Tâm', imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80', description: 'Sản phẩm hoàn thiện của mình đây. Tự hào quá đi mất thôi!', status: 'APPROVED', programId },
];

async function seed() {
  await prisma.studentWork.createMany({
    data: fakeWorks
  });
  console.log('Seeded 10 student works successfully!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
