import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { signToken } from '../src/utils/jwt';
import { prisma } from '../src/lib/prisma';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';

describe('VIP Memberships API (Screenshot 1)', () => {
  const app = createApp();

  let adminToken: string;
  let customerToken: string;
  let adminUser: any;
  let customerUser: any;
  let testPlanId: string;
  let testMembershipId: string;

  beforeEach(async () => {
    // 1. Admin user
    adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          id: `admin-${crypto.randomUUID().substring(0, 8)}`,
          email: `admin-${Date.now()}@example.com`,
          passwordHash: 'hash',
          role: UserRole.ADMIN,
        },
      });
    }
    adminToken = signToken({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    // 2. Customer user
    customerUser = await prisma.user.findFirst({ where: { role: UserRole.CUSTOMER } });
    if (!customerUser) {
      customerUser = await prisma.user.create({
        data: {
          id: `cust-${crypto.randomUUID().substring(0, 8)}`,
          email: `cust-${Date.now()}@example.com`,
          passwordHash: 'hash',
          role: UserRole.CUSTOMER,
        },
      });
    }
    customerToken = signToken({
      id: customerUser.id,
      email: customerUser.email,
      role: customerUser.role,
    });
  });

  describe('Security & Role Protection', () => {
    it('GET /api/admin/memberships should reject unauthorized requests with 401', async () => {
      const res = await request(app).get('/api/admin/memberships');
      expect(res.status).toBe(401);
    });

    it('GET /api/admin/memberships should reject non-admin users with 403', async () => {
      const res = await request(app)
        .get('/api/admin/memberships')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Admin Memberships Retrieval & Management', () => {
    it('GET /api/admin/memberships should return connected status, plans, and metrics', async () => {
      const res = await request(app)
        .get('/api/admin/memberships')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.connected).toBe(true);
      expect(res.body.data.plans.length).toBeGreaterThanOrEqual(3);
      expect(res.body.data.pricing).toBeDefined();
      expect(res.body.data.pricing.monthlyPrice).toBe(19.99);
      expect(res.body.data.stats).toBeDefined();
    });

    it('GET /api/admin/memberships/pricing should return the current pricing tier configuration', async () => {
      const res = await request(app)
        .get('/api/admin/memberships/pricing')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pricing.monthlyPrice).toBe(19.99);
      expect(res.body.pricing.sixMonthDiscount).toBe(10);
      expect(res.body.pricing.twelveMonthDiscount).toBe(15);
    });

    it('PUT /api/admin/memberships/pricing should update pricing and recalculate savings across tiers', async () => {
      const res = await request(app)
        .put('/api/admin/memberships/pricing')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          monthlyPrice: 24.99,
          sixMonthDiscount: 12,
          twelveMonthDiscount: 20,
        });

      expect(res.status).toBe(200);
      expect(res.body.pricing.monthlyPrice).toBe(24.99);
      expect(res.body.pricing.sixMonthDiscount).toBe(12);
      expect(res.body.pricing.twelveMonthDiscount).toBe(20);

      // Restore default pricing
      await request(app)
        .put('/api/admin/memberships/pricing')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          monthlyPrice: 19.99,
          sixMonthDiscount: 10,
          twelveMonthDiscount: 15,
        });
    });

    it('POST /api/admin/memberships should assign a membership plan to a user', async () => {
      const plansRes = await request(app)
        .get('/api/admin/memberships/plans')
        .set('Authorization', `Bearer ${adminToken}`);
      testPlanId = plansRes.body.plans[0].id;

      const res = await request(app)
        .post('/api/admin/memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: customerUser.id,
          planId: testPlanId,
          status: 'ACTIVE',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.membership.userId).toBe(customerUser.id);
      expect(res.body.data.membership.status).toBe('ACTIVE');
      testMembershipId = res.body.data.membership.id;
    });

    it('PATCH /api/admin/memberships/:id/status should update membership status (active, past_due, suspended, cancelled)', async () => {
      const res = await request(app)
        .patch(`/api/admin/memberships/${testMembershipId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'past_due' });

      expect(res.status).toBe(200);
      expect(res.body.data.membership.status).toBe('past_due');
      expect(res.body.data.membership.paymentStatus).toBe('failed');
    });

    it('GET /api/admin/memberships should filter records by search query and status', async () => {
      const res = await request(app)
        .get(`/api/admin/memberships?status=past_due&search=${encodeURIComponent(customerUser.email)}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.memberships.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Public & Customer Self-Service Endpoints', () => {
    it('GET /api/memberships/plans should return public membership plans without authentication', async () => {
      const res = await request(app).get('/api/memberships/plans');
      expect(res.status).toBe(200);
      expect(res.body.plans.length).toBeGreaterThanOrEqual(3);
    });

    it('GET /api/memberships/me should return current user active membership status', async () => {
      // Re-activate membership
      await request(app)
        .patch(`/api/admin/memberships/${testMembershipId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });

      const res = await request(app)
        .get('/api/memberships/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.hasActiveMembership).toBe(true);
      expect(res.body.membership.plan).toBeDefined();
    });

    it('POST /api/memberships/subscribe should allow logged in user to subscribe to a plan', async () => {
      const res = await request(app)
        .post('/api/memberships/subscribe')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ planId: testPlanId });

      expect(res.status).toBe(200);
      expect(res.body.data.membership.status).toBe('ACTIVE');
    });
  });

  afterAll(async () => {
    if (testMembershipId) {
      await prisma.user_memberships.deleteMany({
        where: { id: testMembershipId },
      });
    }
  });
});
