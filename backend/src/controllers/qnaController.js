const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const submitQuestion = async (req, res) => {
  try {
    const { programId, lessonTitle, question } = req.body;
    const userId = req.user.id;

    // Optional: We can check if user has access to program, but we trust frontend for now
    const newQA = await prisma.courseQA.create({
      data: {
        userId,
        programId,
        lessonTitle,
        question
      }
    });

    res.status(201).json(newQA);
  } catch (error) {
    console.error("Error submitting question:", error);
    res.status(500).json({ error: "Lỗi khi gửi câu hỏi" });
  }
};

const getMyQuestions = async (req, res) => {
  try {
    const { programId } = req.query;
    const userId = req.user.id;

    const query = { userId };
    if (programId) query.programId = programId;

    const questions = await prisma.courseQA.findMany({
      where: query,
      orderBy: { createdAt: 'desc' }
    });

    res.json(questions);
  } catch (error) {
    console.error("Error fetching my questions:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách câu hỏi" });
  }
};

const getAdminQuestions = async (req, res) => {
  try {
    const { programId, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (programId) query.programId = programId;
    if (status && status !== 'ALL') query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [questions, total] = await Promise.all([
      prisma.courseQA.findMany({
        where: query,
        include: {
          user: { select: { fullName: true, email: true } },
          program: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.courseQA.count({ where: query })
    ]);

    res.json({
      data: questions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching admin questions:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách câu hỏi" });
  }
};

const answerQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const updatedQA = await prisma.courseQA.update({
      where: { id },
      data: {
        answer,
        status: 'ANSWERED'
      }
    });

    res.json(updatedQA);
  } catch (error) {
    console.error("Error answering question:", error);
    res.status(500).json({ error: "Lỗi khi trả lời câu hỏi" });
  }
};

module.exports = {
  submitQuestion,
  getMyQuestions,
  getAdminQuestions,
  answerQuestion
};
