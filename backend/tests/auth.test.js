const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock bcrypt and jwt to avoid external dependencies and speed up tests
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../src/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));

const authRoutes = require('../src/routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Controller Tests', () => {
  let prismaMock;
  const JWT_SECRET = 'test_secret';
  process.env.JWT_SECRET = JWT_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock = new PrismaClient();
  });

  describe('POST /api/auth/login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: loginData.email,
        password: 'hashed_password',
        role: 'USER',
        fullName: 'Test User',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock_token');

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token', 'mock_token');
      expect(res.body.user).toEqual({
        id: mockUser.id,
        role: mockUser.role,
        fullName: mockUser.fullName,
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
    });

    it('should return 401 for invalid email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Thông tin đăng nhập không hợp lệ.');
    });

    it('should return 401 for invalid password', async () => {
      const mockUser = { id: 1, email: loginData.email, password: 'hashed_password' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Thông tin đăng nhập không hợp lệ.');
    });

    it('should return 400 if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Vui lòng cung cấp email và mật khẩu.');
    });
  });

  describe('GET /api/auth/me (Token Validation)', () => {
    it('should return user info for a valid token', async () => {
      const mockUser = {
        id: 1,
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        createdAt: new Date(),
        enrollments: [],
        orders: [],
      };

      const decodedToken = { user: { id: 1 } };
      jwt.verify.mockReturnValue(decodedToken);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid_token');

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe(mockUser.email);
      expect(prismaMock.user.findUnique).toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Access denied, no token provided.');
    });

    it('should return 401 for an invalid token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid token.');
    });
  });

  describe('POST /api/auth/forgot-password & /reset-password', () => {
    const testEmail = 'user@example.com';

    it('should return 404 if email does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testEmail });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Không tìm thấy tài khoản với email này.');
    });

    it('should return 200 and send an email if email exists', async () => {
      const mockUser = { id: 1, email: testEmail, fullName: 'Test User' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const emailServiceMock = require('../src/services/emailService');
      emailServiceMock.sendEmail.mockClear();

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testEmail });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(emailServiceMock.sendEmail).toHaveBeenCalled();

      // Extract the OTP code from the email call args
      const sendEmailCallArgs = emailServiceMock.sendEmail.mock.calls[0][0];
      const emailHtml = sendEmailCallArgs.html;
      const codeMatch = emailHtml.match(/>(\d{6})<\/span>/);
      const generatedCode = codeMatch ? codeMatch[1] : null;

      expect(generatedCode).not.toBeNull();

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed_new_password');
      prismaMock.user.update.mockResolvedValue({ id: 1, email: testEmail });

      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: testEmail,
          code: generatedCode,
          newPassword: 'newpassword123'
        });

      expect(resetRes.statusCode).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { email: testEmail }
      }));
    });
  });
});
