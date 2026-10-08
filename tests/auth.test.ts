import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Auth & Validation API', () => {
  const app = createApp();

  describe('POST /api/auth/register validation', () => {
    it('should reject invalid email format with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'validPassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Validation failed');
    });

    it('should reject password less than 6 characters with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'valid@example.com',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login validation', () => {
    it('should return 401 for wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent.user.test@example.com',
          password: 'IncorrectPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should respond safely to prevent email enumeration', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'random.customer@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('password reset link has been sent');
    });
  });

  describe('Protected user routes without token', () => {
    it('GET /api/users/me should return 401 without Bearer token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/google', () => {
    const googleTestEmail = `google_oauth_${Date.now()}@example.com`;

    afterAll(async () => {
      const { prisma } = await import('../src/lib/prisma');
      await prisma.user.deleteMany({
        where: { email: googleTestEmail },
      });
    });

    it('should reject request without any token or email with 400', async () => {
      const res = await request(app)
        .post('/api/auth/google')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Validation failed');
    });

    it('should register new user and extract firstName and lastName from Google', async () => {
      const res = await request(app)
        .post('/api/auth/google')
        .send({
          email: googleTestEmail,
          firstName: 'Sergei',
          lastName: 'Brin',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(googleTestEmail);
      expect(res.body.data.user.firstName).toBe('Sergei');
      expect(res.body.data.user.lastName).toBe('Brin');
      expect(res.body.data.token).toBeDefined();

      // Verify that the issued token works for authenticated routes
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${res.body.data.token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.user.firstName).toBe('Sergei');
      expect(meRes.body.data.user.lastName).toBe('Brin');
    });

    it('should log in existing user via Google and preserve/update profile', async () => {
      const res = await request(app)
        .post('/api/auth/google')
        .send({
          email: googleTestEmail,
          firstName: 'Sergei',
          lastName: 'Brin',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(googleTestEmail);
      expect(res.body.data.user.firstName).toBe('Sergei');
      expect(res.body.data.user.lastName).toBe('Brin');
      expect(res.body.data.token).toBeDefined();
    });
  });
});

