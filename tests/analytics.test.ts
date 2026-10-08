import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { signToken } from '../src/utils/jwt';
import { UserRole } from '@prisma/client';

describe('Admin Analytics, Financials & Reports API (Screenshots 1 & 2)', () => {
  const app = createApp();
  const testId = `analytics_test_${Date.now()}`;
  let adminUser: any;
  let adminToken: string;
  let customerUser: any;
  let customerToken: string;
  let affiliateUser: any;
  let affiliateProfile: any;
  let testOrderId: string;
  let testLedgerId: string;

  beforeAll(async () => {
    // 1. Admin user
    adminUser = await prisma.user.create({
      data: {
        email: `${testId}_admin@example.com`,
        passwordHash: 'hash',
        role: UserRole.ADMIN,
      },
    });
    adminToken = signToken({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    // 2. Customer user
    customerUser = await prisma.user.create({
      data: {
        email: `${testId}_cust@example.com`,
        passwordHash: 'hash',
        role: UserRole.CUSTOMER,
      },
    });
    customerToken = signToken({
      id: customerUser.id,
      email: customerUser.email,
      role: customerUser.role,
    });

    // 3. Affiliate user & profile
    affiliateUser = await prisma.user.create({
      data: {
        email: `${testId}_rep@example.com`,
        passwordHash: 'hash',
        firstName: 'Ravi',
        lastName: 'Sharma',
        role: UserRole.AFFILIATE,
      },
    });

    affiliateProfile = await prisma.affiliate_profiles.create({
      data: {
        id: crypto.randomUUID(),
        userId: affiliateUser.id,
        username: `${testId}_ravi`,
        referralCode: `${testId}_ravi`,
        isActive: true,
        payoutStatus: 'active',
        updatedAt: new Date(),
      },
    });

    // 4. Test Order & Item
    const order = await prisma.orders.create({
      data: {
        id: crypto.randomUUID(),
        orderNumber: `ILS-${Date.now().toString().slice(-5)}`,
        userId: customerUser.id,
        subtotal: 100.0,
        totalAmount: 100.0,
        discountAmount: 10.0,
        currency: 'USD',
        paymentStatus: 'PAID',
        paymentMethod: 'STRIPE',
        shippingAddressSnapshot: { city: 'Los Angeles' },
        attributedAffiliateId: affiliateProfile.id,
        commissionableBaseUsd: 90.0,
        updatedAt: new Date(),
      },
    });
    testOrderId = order.id;

    // 5. Test Commission Ledger Entry (Direct 20%)
    const ledger = await prisma.commission_ledger.create({
      data: {
        orderId: testOrderId,
        beneficiaryId: affiliateProfile.id,
        level: 0,
        rate: 0.2,
        commissionableBaseUsd: 90.0,
        amountUsd: 18.0,
        status: 'pending',
        ruleVersion: 'v4.0',
        availableAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        note: 'Direct sale commission',
      },
    });
    testLedgerId = ledger.id;

    // 6. Test Referral Visit
    await prisma.referral_visits.create({
      data: {
        id: crypto.randomUUID(),
        affiliateId: affiliateProfile.id,
        landingPage: `/${affiliateProfile.username}`,
        converted: true,
        orderId: testOrderId,
      },
    });
  });

  afterAll(async () => {
    await prisma.referral_visits.deleteMany({
      where: { affiliateId: affiliateProfile.id },
    });
    await prisma.commission_ledger.deleteMany({
      where: { orderId: testOrderId },
    });
    await prisma.orders.deleteMany({
      where: { id: testOrderId },
    });
    await prisma.affiliate_profiles.deleteMany({
      where: { id: affiliateProfile.id },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, customerUser.id, affiliateUser.id] } },
    });
  });

  describe('GET /api/admin/reports/analytics (Screenshot 1: Analytics & Financials)', () => {
    it('should reject non-admin request with 403', async () => {
      const res = await request(app)
        .get('/api/admin/reports/analytics')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should return complete analytics dashboard payload matching Screenshot 1', async () => {
      const res = await request(app)
        .get('/api/admin/reports/analytics?timeframe=7D')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      const data = res.body.data;
      expect(data.timeframe).toBe('7D');
      expect(data.dateRange).toBeDefined();

      // 1. KPI Cards (Gross Sales, Traffic & Conversion, Membership MRR, Commission Liability)
      expect(data.kpis).toBeDefined();
      expect(data.kpis.grossSales).toBeDefined();
      expect(data.kpis.grossSales.value).toBeGreaterThanOrEqual(100.0);
      expect(data.kpis.grossSales.formatted).toContain('$');
      expect(data.kpis.grossSales.subFormatted).toContain('Net Sales:');

      expect(data.kpis.trafficAndConversion).toBeDefined();
      expect(data.kpis.trafficAndConversion.formatted).toContain('%');
      expect(data.kpis.trafficAndConversion.subFormatted).toContain('unique web sessions');

      expect(data.kpis.membershipMrr).toBeDefined();
      expect(data.kpis.membershipMrr.subFormatted).toContain('active subscribers');

      expect(data.kpis.commissionLiability).toBeDefined();
      expect(data.kpis.commissionLiability.value).toBeGreaterThanOrEqual(18.0);
      expect(data.kpis.commissionLiability.subFormatted).toContain('already disbursed');

      // 2. Revenue Trajectory
      expect(data.revenueTrajectory).toBeDefined();
      expect(data.revenueTrajectory.points.length).toBeGreaterThan(0);
      expect(data.revenueTrajectory.formattedAov).toContain('AOV: $');

      // 3. Shopper Sessions vs Checkouts
      expect(data.shopperSessionsVsCheckouts).toBeDefined();
      expect(data.shopperSessionsVsCheckouts.points.length).toBeGreaterThan(0);
      expect(data.shopperSessionsVsCheckouts.formattedAvgConversion).toContain('Avg Conversion');

      // 4. Commission Distribution by Tier (All 6 tiers & 35% cap)
      expect(data.commissionDistributionByTier).toBeDefined();
      expect(data.commissionDistributionByTier.programCapPercent).toBe(35.0);
      expect(data.commissionDistributionByTier.tiers.length).toBe(6);

      const directTier = data.commissionDistributionByTier.tiers.find(
        (t: any) => t.level === 0
      );
      expect(directTier).toBeDefined();
      expect(directTier.name).toContain('Direct Sale (20%)');
      expect(directTier.ratePercent).toBe(20.0);
      expect(directTier.totalAmount).toBeGreaterThanOrEqual(18.0);

      // 5. Subscription Plan Breakdown
      expect(data.subscriptionPlanBreakdown).toBeDefined();

      // 6. Tab Counts
      expect(data.tabCounts).toBeDefined();
      expect(data.tabCounts.salesAndOrders).toBeGreaterThanOrEqual(1);
      expect(data.tabCounts.customerCohorts).toBeGreaterThanOrEqual(1);
      expect(data.tabCounts.commissionLedger).toBeGreaterThanOrEqual(1);
      expect(data.tabCounts.topAffiliates).toBeGreaterThanOrEqual(1);
    });

    it('should support 30D, 90D, and YTD timeframes', async () => {
      for (const tf of ['30D', '90D', 'YTD']) {
        const res = await request(app)
          .get(`/api/admin/reports/analytics?timeframe=${tf}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.timeframe).toBe(tf);
      }
    });
  });

  describe('GET /api/admin/commission/central (Screenshot 2: Commission Central)', () => {
    it('should return approved multi-tier schedule and qualification rules', async () => {
      const res = await request(app)
        .get('/api/admin/commission/central')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      const data = res.body.data;
      expect(data.programRules).toBeDefined();
      expect(data.programRules.maxDistributionCapPercent).toBe(35.0);
      expect(data.programRules.payoutSchedule).toContain('15th of every month');
      expect(data.programRules.activeQualificationRuleThreshold).toBe(125.0);
      expect(data.programRules.policyStatus).toContain('POLICY ENFORCED ($125 FIXED)');

      // Verify approved 6-tier schedule: 20%, 5%, 4%, 3%, 2%, 1%
      expect(data.schedule.length).toBe(6);
      expect(data.schedule[0].ratePercent).toBe(20.0);
      expect(data.schedule[1].ratePercent).toBe(5.0);
      expect(data.schedule[2].ratePercent).toBe(4.0);
      expect(data.schedule[3].ratePercent).toBe(3.0);
      expect(data.schedule[4].ratePercent).toBe(2.0);
      expect(data.schedule[5].ratePercent).toBe(1.0);

      // Verify metrics
      expect(data.metrics).toBeDefined();
      expect(data.metrics.pendingLiability).toBeGreaterThanOrEqual(18.0);
      expect(data.metrics.totalLedgerEntries).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/admin/commission/ledger (Screenshot 2: Ledger Table)', () => {
    it('should return unilevel commission audit ledger matching table columns', async () => {
      const res = await request(app)
        .get('/api/admin/commission/ledger')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      const data = res.body.data;
      expect(data.items).toBeDefined();
      expect(data.items.length).toBeGreaterThanOrEqual(1);

      const entry = data.items.find((item: any) => item.id === testLedgerId);
      expect(entry).toBeDefined();

      // Check Representative column data
      expect(entry.representative.username).toBe(affiliateProfile.username);
      expect(entry.representative.fullName).toContain('Ravi Sharma');

      // Check Order & Customer column data
      expect(entry.orderAndCustomer.customerEmail).toBe(customerUser.email);
      expect(entry.orderAndCustomer.orderNumber).toContain('ILS-');

      // Check Tier Level column data
      expect(entry.tierLevel.level).toBe(0);
      expect(entry.tierLevel.name).toBe('Direct Sale');
      expect(entry.tierLevel.ratePercent).toBe(20.0);

      // Check Volume & Commission Earned
      expect(entry.orderVolume).toBe(90.0);
      expect(entry.commissionEarned.amountUsd).toBe(18.0);
      expect(entry.commissionEarned.formattedAmount).toBe('$18.00');
      expect(entry.status).toBe('PENDING');
      expect(entry.availableAt).toBeDefined();
    });

    it('should filter ledger by search term (rep handle or customer email)', async () => {
      const res = await request(app)
        .get(`/api/admin/commission/ledger?search=${affiliateProfile.username}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.items[0].representative.username).toBe(affiliateProfile.username);
    });

    it('should filter ledger by status (pending)', async () => {
      const res = await request(app)
        .get('/api/admin/commission/ledger?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.items[0].status).toBe('PENDING');
    });

    it('should filter ledger by tier (level 0)', async () => {
      const res = await request(app)
        .get('/api/admin/commission/ledger?tier=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.items[0].tierLevel.level).toBe(0);
    });
  });

  describe('GET /api/admin/reports/export (CSV Export Button)', () => {
    it('should export commission ledger as CSV', async () => {
      const res = await request(app)
        .get('/api/admin/reports/export?type=ledger')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Ledger ID');
      expect(res.text).toContain('Representative Username');
      expect(res.text).toContain(affiliateProfile.username);
    });

    it('should export sales orders as CSV', async () => {
      const res = await request(app)
        .get('/api/admin/reports/export?type=sales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Order ID');
      expect(res.text).toContain('Total Amount');
    });
  });
});
