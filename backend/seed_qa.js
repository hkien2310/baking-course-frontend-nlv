const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const program = await prisma.program.findUnique({
    where: { slug: 'khoa-test-1-1657' }
  });

  if (!program) {
    console.error('Program not found!');
    process.exit(1);
  }

  const user = await prisma.user.findFirst();

  if (!user) {
    console.error('User not found!');
    process.exit(1);
  }

  const fakes = [
    {
      userId: user.id,
      programId: program.id,
      lessonTitle: 'Bài 1: Giới thiệu chung',
      question: 'Cô ơi cho em hỏi, loại bơ lạt nào thì phù hợp để làm bánh này ạ? Em đang dùng bơ President có được không?',
      answer: 'Bơ President là một lựa chọn rất tuyệt vời em nhé. Bơ này có độ béo cao và hương thơm đặc trưng, sẽ giúp cốt bánh của em mềm và béo hơn.',
      status: 'ANSWERED'
    },
    {
      userId: user.id,
      programId: program.id,
      lessonTitle: 'Bài 2: Chuẩn bị nguyên liệu',
      question: 'Nếu em không mua được heavy cream thì có thể dùng whipping cream thay thế được không cô?',
      answer: 'Được em nhé! Tuy nhiên whipping cream có độ béo thấp hơn một chút (khoảng 35%) so với heavy cream (khoảng 38%), nên kem khi đánh bông sẽ kém đứng form hơn một xíu. Em nhớ đánh kem thật lạnh nha.',
      status: 'ANSWERED'
    },
    {
      userId: user.id,
      programId: program.id,
      lessonTitle: 'Bài 3: Đánh trứng và trộn bột',
      question: 'Làm sao để biết trứng đã được đánh bông đạt chuẩn vậy ạ? Em đánh hay bị lỏng.',
      answer: 'Trứng đạt chuẩn là khi em nhấc que đánh lên, chóp trứng cong nhẹ và đứng vững, khi vẽ một hình số 8 trên mặt âu trứng thì hình không bị chìm xuống ngay. Em thử đánh thêm 1-2 phút ở tốc độ trung bình xem sao nhé.',
      status: 'ANSWERED'
    },
    {
      userId: user.id,
      programId: program.id,
      lessonTitle: 'Bài 4: Nướng bánh',
      question: 'Nhiệt độ lò nhà em bị lệch khoảng 10 độ, thì em nên chỉnh nhiệt độ như thế nào cho phù hợp ạ?',
      status: 'PENDING'
    },
    {
      userId: user.id,
      programId: program.id,
      lessonTitle: 'Bài 5: Trang trí',
      question: 'Phần bắt bông kem bị rỗ là do em đánh kem quá tay đúng không ạ? Có cách nào cứu vãn không cô?',
      status: 'PENDING'
    }
  ];

  for (const fake of fakes) {
    await prisma.courseQA.create({ data: fake });
  }

  console.log('Fake data seeded successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
