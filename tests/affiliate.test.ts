import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { signToken } from '../src/utils/jwt';
import { UserRole } from '@prisma/client';

describe('Affiliate Lifecycle & Attribution API', () => {
  const app = createApp();
  const testId = `aff_api_${Date.now()}`;
  let testUser: any;
  let authToken: string;
  let testAffiliate: any;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: `${testId}@example.com`,
        passwordHash: 'hash',
        role: UserRole.CUSTOMER,
      },
    });

    authToken = signToken({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    testAffiliate = await prisma.affiliate_profiles.create({
      data: {
        id: crypto.randomUUID(),
        userId: testUser.id,
        username: `${testId}_influencer`,
        referralCode: `${testId}_influencer`,
        isActive: true,
        payoutStatus: 'active',
        updatedAt: new Date(),
      },
    });
  });

  afterAll(async () => {
    await prisma.referral_visits.deleteMany({
      where: { affiliateId: testAffiliate.id },
    });
    await prisma.affiliate_profiles.deleteMany({
      where: { id: testAffiliate.id },
    });
    await prisma.user.deleteMany({
      where: { id: testUser.id },
    });
  });

  describe('GET /api/affiliates/resolve/:username', () => {
    it('should resolve active affiliate and set HTTP-only tracking cookie', async () => {
      const res = await request(app).get(
        `/api/affiliates/resolve/${testAffiliate.username}`
      );

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.affiliate.username).toBe(testAffiliate.username);

      // Verify ils_affiliate_id cookie was set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const affCookie = cookies.find((c: string) => c.includes('ils_affiliate_id'));
      expect(affCookie).toBeDefined();
      expect(affCookie).toContain('HttpOnly');
    });

    it('should return 404 for non-existent affiliate handle', async () => {
      const res = await request(app).get(
        '/api/affiliates/resolve/non_existent_affiliate_handle_xyz'
      );

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/affiliates/register', () => {
    it('should reject reserved route usernames (admin, api, cart)', async () => {
      const res = await request(app)
        .post('/api/affiliates/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'admin',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('reserved');
    });
  });

  describe('GET /api/affiliates/me', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/affiliates/me');
      expect(res.status).toBe(401);
    });

    it('should return affiliate dashboard metrics for authenticated user', async () => {
      const res = await request(app)
        .get('/api/affiliates/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.profile.username).toBe(testAffiliate.username);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.lifetimeEarnings).toBe(0);
    });
  });
});
