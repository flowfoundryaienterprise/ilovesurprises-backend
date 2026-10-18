import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { signToken } from '../src/utils/jwt';
import { prisma } from '../src/lib/prisma';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';

describe('Jewelry Appraisals API (Screenshots 2, 3 & 4)', () => {
  const app = createApp();

  let adminToken: string;
  let customerToken: string;
  let adminUser: any;
  let customerUser: any;
  let createdAppraisalId: string;
  let createdSubmissionId: string;
  const testCode = `TEST-RUBY-${Date.now().toString().slice(-4)}`;

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
    it('GET /api/admin/appraisals should reject unauthorized requests with 401', async () => {
      const res = await request(app).get('/api/admin/appraisals');
      expect(res.status).toBe(401);
    });

    it('GET /api/admin/appraisals should reject non-admin users with 403', async () => {
      const res = await request(app)
        .get('/api/admin/appraisals')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Admin Appraisal Management & Metrics (Screenshots 2 & 3)', () => {
    it('GET /api/admin/appraisals should return registered codes and complete KPI stats', async () => {
      const res = await request(app)
        .get('/api/admin/appraisals')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.connected).toBe(true);

      // Verify KPI stats for Certificate Verification Codes (Screenshot 3)
      const certStats = res.body.stats.certificates;
      expect(certStats).toBeDefined();
      expect(certStats.registeredCodes).toBeGreaterThanOrEqual(1);
      expect(certStats.totalAppraisedValuePool).toBeGreaterThan(0);
      expect(certStats.customerPortalRoute).toBe('/appraise-your-jewelry');

      // Verify KPI stats for Customer Submissions (Screenshot 2)
      const subStats = res.body.stats.submissions;
      expect(subStats).toBeDefined();
      expect(subStats.totalSubmissions).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/admin/appraisals should register a new appraisal code (Screenshot 4 Modal)', async () => {
      const res = await request(app)
        .post('/api/admin/appraisals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          appraisalCode: testCode,
          estimatedValue: 250,
          jewelryName: '14K Gold CZ Halo Ring',
          jewelryType: 'Ring',
          metalType: 'Solid .925 Sterling Silver',
          gemstoneType: 'AAA Cubic Zirconia',
          jewelryImagePreset: '/assets/ilovesurprises/appraisals/sterling-silver-halo-ring.jpg',
          customerName: 'Sarah Jenkins',
          customerEmail: 'example@gmail.com',
          orderNumber: 'ILS-89104-US',
          sourceProduct: 'Midnight Amber Cash Candle',
          artisanDescription: 'Handcrafted genuine fine jewelry surprise reveal.',
          status: 'active',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.appraisal.code).toBe(testCode);
      expect(res.body.appraisal.estimatedValue).toBe(250);
      expect(res.body.appraisal.jewelryName).toBe('14K Gold CZ Halo Ring');
      expect(res.body.appraisal.status).toBe('active');
      createdAppraisalId = res.body.appraisal.id;
    });

    it('GET /api/admin/appraisals/:id should retrieve appraisal record by ID or code', async () => {
      const res = await request(app)
        .get(`/api/admin/appraisals/${testCode}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.appraisal.code).toBe(testCode);
      expect(res.body.appraisal.retailValue).toBe(250);
    });

    it('PATCH /api/admin/appraisals/:id should update appraisal valuation and details', async () => {
      const res = await request(app)
        .patch(`/api/admin/appraisals/${createdAppraisalId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estimatedValue: 350,
          jewelryName: '14K Gold CZ Halo Ring - Special Edition',
        });

      expect(res.status).toBe(200);
      expect(res.body.appraisal.estimatedValue).toBe(350);
      expect(res.body.appraisal.name).toBe('14K Gold CZ Halo Ring - Special Edition');
    });
  });

  describe('Customer Submissions Flow (Screenshot 2)', () => {
    it('POST /api/appraisals/submit should allow a customer to submit their surprise jewelry for review', async () => {
      const res = await request(app)
        .post('/api/appraisals/submit')
        .send({
          customerName: 'Emily Watson',
          customerEmail: 'emily.w@example.com',
          orderNumber: 'ILS-77889-US',
          productName: 'Lavender Diamond Cash Candle',
          jewelryType: 'Necklace',
          codeInfo: 'ILS-NECK-100',
          photoPreviews: ['/assets/ilovesurprises/appraisals/sapphire-halo-pendant.jpg'],
          notes: 'Revealed a gorgeous blue sapphire pendant.',
          estimatedValue: 120,
        });

      expect(res.status).toBe(201);
      expect(res.body.submission.customerName).toBe('Emily Watson');
      expect(res.body.submission.status).toBe('pending');
      createdSubmissionId = res.body.submission.id;
    });

    it('GET /api/admin/appraisals/submissions should list customer submissions for gemologist review', async () => {
      const res = await request(app)
        .get('/api/admin/appraisals/submissions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.submissions.length).toBeGreaterThanOrEqual(1);
    });

    it('PATCH /api/admin/appraisals/submissions/:id should record gemologist review and valuation', async () => {
      const res = await request(app)
        .patch(`/api/admin/appraisals/submissions/${createdSubmissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
          estimatedValue: 450,
          appraiserNotes: 'Verified genuine lab-grown sapphire in sterling silver setting.',
        });

      expect(res.status).toBe(200);
      expect(res.body.submission.status).toBe('approved');
      expect(res.body.submission.estimatedValue).toBe(450);
    });
  });

  describe('Public Certificate Lookup Flow (/appraise-your-jewelry)', () => {
    it('GET /api/appraisals/verify/:code should return verified certificate details for valid active code', async () => {
      const res = await request(app).get(`/api/appraisals/verify/${testCode}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe(testCode);
      expect(res.body.data.estimatedValue).toBe(350);
      expect(res.body.data.serialNumber).toBeDefined();
    });

    it('GET /api/appraisals/:code should also work as a direct alias lookup route', async () => {
      const res = await request(app).get(`/api/appraisals/${testCode}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe(testCode);
    });

    it('GET /api/appraisals/verify/:code should return 404 for an unknown code', async () => {
      const res = await request(app).get('/api/appraisals/verify/UNKNOWN-NONEXISTENT-CODE-999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("couldn't find that jewelry code");
    });
  });

  describe('Records Deletion & Reset Functionality', () => {
    it('DELETE /api/admin/appraisals/:id should delete single appraisal record', async () => {
      const res = await request(app)
        .delete(`/api/admin/appraisals/${createdAppraisalId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('POST /api/admin/appraisals/reset should restore platform default appraisal codes', async () => {
      const res = await request(app)
        .post('/api/admin/appraisals/reset')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Verify defaults restored
      const listRes = await request(app)
        .get('/api/admin/appraisals')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(listRes.body.stats.certificates.registeredCodes).toBeGreaterThanOrEqual(3);
    });
  });

  afterAll(async () => {
    if (createdSubmissionId) {
      await prisma.appraisal_records.deleteMany({
        where: { id: createdSubmissionId },
      });
    }
  });
});
