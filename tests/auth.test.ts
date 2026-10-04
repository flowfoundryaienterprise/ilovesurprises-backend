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
});
