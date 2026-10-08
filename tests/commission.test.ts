import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Decimal } from 'decimal.js';
import crypto from 'crypto';
import {
  calculateCommissionableBaseUSD,
  COMMISSION_RATES,
  MAX_COMMISSION_CAP,
  processOrderCommission,
  processOrderRefundCommission,
  resolveGenealogyPayoutChain,
} from '../src/services/commission.service';
import { prisma } from '../src/lib/prisma';
import { UserRole } from '@prisma/client';

describe('Commission & 5-Level MLM Engine', () => {
  describe('Mathematical Formulas & Precision (Section 1 & 3)', () => {
    it('should verify exact tier distribution rates sum to exactly 35.0%', () => {
      expect(COMMISSION_RATES[0].toNumber()).toBe(0.20);
      expect(COMMISSION_RATES[1].toNumber()).toBe(0.05);
      expect(COMMISSION_RATES[2].toNumber()).toBe(0.04);
      expect(COMMISSION_RATES[3].toNumber()).toBe(0.03);
      expect(COMMISSION_RATES[4].toNumber()).toBe(0.02);
      expect(COMMISSION_RATES[5].toNumber()).toBe(0.01);

      const totalRate = Object.values(COMMISSION_RATES).reduce(
        (sum, rate) => sum.plus(rate),
        new Decimal(0)
      );

      expect(totalRate.equals(MAX_COMMISSION_CAP)).toBe(true);
      expect(totalRate.toNumber()).toBe(0.35);
    });

    it('should correctly calculate commissionable base USD with discount proration and FX rates', () => {
      // Order with $100 subtotal, $20 discount, FX rate 1.25 to USD
      const order = {
        subtotal: 100.0,
        discountAmount: 20.0,
        fxRateToUsd: 1.25,
      };

      // Items: Item 1 ($60, eligible), Item 2 ($40, ineligible e.g. gift wrap/upsell)
      const items = [
        { lineTotal: 60.0, isCommissionEligible: true },
        { lineTotal: 40.0, isCommissionEligible: false },
      ];

      // Eligible subtotal = 60
      // Prorated discount on eligible items: 60 - (60 / 60 * 20) = 40
      // Base in USD: 40 * 1.25 = 50.0000
      const baseUSD = calculateCommissionableBaseUSD(order, items);
      expect(baseUSD.toNumber()).toBe(50.0);
    });

    it('should exclude taxes, shipping, and ineligible items from commissionable base', () => {
      const order = {
        subtotal: 150.0,
        discountAmount: 0.0,
        fxRateToUsd: 1.0,
      };

      const items = [
        { lineTotal: 75.0, isCommissionEligible: true },
        { lineTotal: 25.0, isCommissionEligible: false }, // Ineligible upsell
        { lineTotal: 50.0, isCommissionEligible: true },
      ];

      // Eligible items = 75 + 50 = 125
      const baseUSD = calculateCommissionableBaseUSD(order, items);
      expect(baseUSD.toNumber()).toBe(125.0);
    });

    it('should return 0 commissionable base when discount exceeds eligible subtotal', () => {
      const order = {
        subtotal: 50.0,
        discountAmount: 60.0,
        fxRateToUsd: 1.0,
      };

      const items = [{ lineTotal: 50.0, isCommissionEligible: true }];

      const baseUSD = calculateCommissionableBaseUSD(order, items);
      expect(baseUSD.toNumber()).toBe(0.0);
    });
  });

  describe('Genealogy Traversal & Strict No-Compression Rule (Section 1.2 & 4)', () => {
    // Generate isolated test affiliates
    const prefix = `test_mlm_${Date.now()}_`;
    let userIds: string[] = [];
    let affiliateIds: string[] = [];

    beforeAll(async () => {
      // Create test users and affiliate profiles: L5 -> L4 -> L3 -> L2 -> L1 -> L0
      // Rep 5 (top)
      const u5 = await prisma.user.create({
        data: {
          email: `${prefix}u5@test.com`,
          passwordHash: 'hash123',
          role: UserRole.AFFILIATE,
        },
      });
      const a5 = await prisma.affiliate_profiles.create({
        data: {
          id: crypto.randomUUID(),
          userId: u5.id,
          username: `${prefix}rep5`,
          referralCode: `${prefix}rep5`,
          isActive: true,
          payoutStatus: 'active',
          updatedAt: new Date(),
        },
      });

      // Rep 4 (sponsored by Rep 5)
      const u4 = await prisma.user.create({
        data: {
          email: `${prefix}u4@test.com`,
          passwordHash: 'hash123',
          role: UserRole.AFFILIATE,
        },
      });
      const a4 = await prisma.affiliate_profiles.create({
        data: {
          id: crypto.randomUUID(),
          userId: u4.id,
          username: `${prefix}rep4`,
          referralCode: `${prefix}rep4`,
          sponsorId: a5.id,
          isActive: true,
          payoutStatus: 'active',
          updatedAt: new Date(),
        },
      });

      // Rep 3 (INACTIVE / SUSPENDED - to test STRICT NO COMPRESSION)
      const u3 = await prisma.user.create({
        data: {
          email: `${prefix}u3@test.com`,
          passwordHash: 'hash123',
          role: UserRole.AFFILIATE,
        },
      });
      const a3 = await prisma.affiliate_profiles.create({
        data: {
          id: crypto.randomUUID(),
          userId: u3.id,
          username: `${prefix}rep3`,
          referralCode: `${prefix}rep3`,
          sponsorId: a4.id,
          isActive: false, // INACTIVE!
          payoutStatus: 'suspended', // SUSPENDED!
          updatedAt: new Date(),
        },
      });

      // Rep 2 (sponsored by Rep 3)
      const u2 = await prisma.user.create({
        data: {
          email: `${prefix}u2@test.com`,
          passwordHash: 'hash123',
          role: UserRole.AFFILIATE,
        },
      });
      const a2 = await prisma.affiliate_profiles.create({
        data: {
          id: crypto.randomUUID(),
          userId: u2.id,
          username: `${prefix}rep2`,
          referralCode: `${prefix}rep2`,
          sponsorId: a3.id,
          isActive: true,
          payoutStatus: 'active',
          updatedAt: new Date(),
        },
      });

      // Rep 1 (sponsored by Rep 2)
      const u1 = await prisma.user.create({
        data: {
          email: `${prefix}u1@test.com`,
          passwordHash: 'hash123',
          role: UserRole.AFFILIATE,
        },
      });
      const a1 = await prisma.affiliate_profiles.create({
        data: {
          id: crypto.randomUUID(),
          userId: u1.id,
          username: `${prefix}rep1`,
          referralCode: `${prefix}rep1`,
          sponsorId: a2.id,
          isActive: true,
          payoutStatus: 'active',
          updatedAt: new Date(),
        },
      });

      // Selling Rep (L0) (sponsored by Rep 1)
      const u0 = await prisma.user.create({
        data: {
          email: `${prefix}u0@test.com`,
          passwordHash: 'hash123',
          role: UserRole.AFFILIATE,
        },
      });
      const a0 = await prisma.affiliate_profiles.create({
        data: {
          id: crypto.randomUUID(),
          userId: u0.id,
          username: `${prefix}rep0`,
          referralCode: `${prefix}rep0`,
          sponsorId: a1.id,
          isActive: true,
          payoutStatus: 'active',
          updatedAt: new Date(),
        },
      });

      userIds = [u0.id, u1.id, u2.id, u3.id, u4.id, u5.id];
      affiliateIds = [a0.id, a1.id, a2.id, a3.id, a4.id, a5.id];
    });

    afterAll(async () => {
      // Clean up test data
      await prisma.commission_ledger.deleteMany({
        where: { beneficiaryId: { in: affiliateIds } },
      });
      await prisma.referral_visits.deleteMany({
        where: { affiliateId: { in: affiliateIds } },
      });
      await prisma.affiliate_profiles.deleteMany({
        where: { id: { in: affiliateIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    });

    it('should strictly enforce NO-COMPRESSION when Level 3 is inactive', async () => {
      const customerId = 'random-customer-123';
      const sellingRepId = affiliateIds[0];

      const chain = await resolveGenealogyPayoutChain(sellingRepId, customerId);

      // Verify chain structure:
      // Level 0 (Selling Rep): 20%
      // Level 1 (Rep 1): 5%
      // Level 2 (Rep 2): 4%
      // Level 3 (Rep 3 is inactive/suspended): MUST BE DROPPED! (NO 3% paid)
      // Level 4 (Rep 4): MUST NOT COMPRESS INTO LEVEL 3! Strictly receives 2% (Level 4 rate)
      // Level 5 (Rep 5): Strictly receives 1% (Level 5 rate)

      const levelsInChain = chain.map((c) => c.level);
      expect(levelsInChain).toContain(0);
      expect(levelsInChain).toContain(1);
      expect(levelsInChain).toContain(2);
      expect(levelsInChain).not.toContain(3); // Level 3 was dropped!
      expect(levelsInChain).toContain(4);
      expect(levelsInChain).toContain(5);

      const l4Entry = chain.find((c) => c.level === 4);
      expect(l4Entry).toBeDefined();
      expect(l4Entry!.rate.toNumber()).toBe(0.02); // Still exactly Level 4 rate 2%, NOT compressed to 3%!
      expect(l4Entry!.affiliateId).toBe(affiliateIds[4]);

      const l5Entry = chain.find((c) => c.level === 5);
      expect(l5Entry).toBeDefined();
      expect(l5Entry!.rate.toNumber()).toBe(0.01); // Still exactly Level 5 rate 1%
      expect(l5Entry!.affiliateId).toBe(affiliateIds[5]);

      // Total rate should be: 0.20 + 0.05 + 0.04 + 0.02 + 0.01 = 0.32 (3% surrendered)
      const totalRate = chain.reduce((acc, c) => acc.plus(c.rate), new Decimal(0));
      expect(totalRate.toNumber()).toBe(0.32);
      expect(totalRate.lessThanOrEqualTo(MAX_COMMISSION_CAP)).toBe(true);
    });

    it('should prevent self-referral personal 20% commission (Section 7.2)', async () => {
      // Selling Rep purchases as customer
      const sellingRepUserId = userIds[0];
      const sellingRepId = affiliateIds[0];

      const chain = await resolveGenealogyPayoutChain(sellingRepId, sellingRepUserId);

      // Level 0 must NOT be present in payout chain
      const l0 = chain.find((c) => c.level === 0);
      expect(l0).toBeUndefined();

      // Uplines L1..L5 still receive their commissions
      const l1 = chain.find((c) => c.level === 1);
      expect(l1).toBeDefined();
      expect(l1!.rate.toNumber()).toBe(0.05);
    });
  });

  describe('Transactional Commission Pipeline & Refund Reversal (Section 5 & 6)', () => {
    const runId = `tx_test_${Date.now()}`;
    let testUserId: string;
    let testAffiliateId: string;
    let testOrderId: string;

    beforeAll(async () => {
      // Create user & affiliate
      const user = await prisma.user.create({
        data: {
          email: `${runId}@example.com`,
          passwordHash: 'hash',
          role: UserRole.AFFILIATE,
        },
      });
      testUserId = user.id;

      const affiliate = await prisma.affiliate_profiles.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          username: `${runId}_rep`,
          referralCode: `${runId}_code`,
          isActive: true,
          payoutStatus: 'active',
          updatedAt: new Date(),
        },
      });
      testAffiliateId = affiliate.id;

      // Create test order
      const order = await prisma.orders.create({
        data: {
          id: crypto.randomUUID(),
          orderNumber: `ORD-${runId}`,
          userId: testUserId,
          currency: 'USD',
          subtotal: 100.0,
          totalAmount: 100.0,
          discountAmount: 0.0,
          attributedAffiliateId: testAffiliateId,
          fxRateToUsd: 1.0,
          shippingAddressSnapshot: { city: 'New York' },
          paymentMethod: 'STRIPE',
          updatedAt: new Date(),
        },
      });
      testOrderId = order.id;

      // Create order item
      await prisma.order_items.create({
        data: {
          id: crypto.randomUUID(),
          orderId: testOrderId,
          productName: 'Surprise Candle Gold Reveal',
          unitPrice: 100.0,
          quantity: 1,
          lineTotal: 100.0,
          isCommissionEligible: true,
          updatedAt: new Date(),
        },
      });
    });

    afterAll(async () => {
      await prisma.commission_ledger.deleteMany({ where: { orderId: testOrderId } });
      await prisma.order_items.deleteMany({ where: { orderId: testOrderId } });
      await prisma.orders.deleteMany({ where: { id: testOrderId } });
      await prisma.affiliate_profiles.deleteMany({ where: { id: testAffiliateId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
    });

    it('should process order commission with idempotency guarantee', async () => {
      // First run: Create a non-self purchase order
      const customer = await prisma.user.create({
        data: {
          email: `${runId}_cust@example.com`,
          passwordHash: 'hash',
        },
      });

      await prisma.orders.update({
        where: { id: testOrderId },
        data: { userId: customer.id },
      });

      const result1 = await processOrderCommission(testOrderId);
      expect(result1.status).toBe('success');
      expect(result1.payoutsCount).toBe(1); // Level 0 (no uplines)
      expect(result1.commissionableBaseUsd).toBe(100.0);
      expect(result1.payouts![0].amountUsd).toBe(20.0); // 20% of 100

      // Verify ledger record in database
      const ledgers = await prisma.commission_ledger.findMany({
        where: { orderId: testOrderId },
      });
      expect(ledgers.length).toBe(1);
      expect(Number(ledgers[0].rate)).toBe(0.2);
      expect(Number(ledgers[0].amountUsd)).toBe(20.0);
      expect(ledgers[0].status).toBe('pending');

      // Second run: IDEMPOTENCY CHECK
      const result2 = await processOrderCommission(testOrderId);
      expect(result2.status).toBe('already_processed');

      // Verify no duplicate ledger records created
      const ledgersAfter = await prisma.commission_ledger.findMany({
        where: { orderId: testOrderId },
      });
      expect(ledgersAfter.length).toBe(1);
    });

    it('should process partial refund with proportional negative ledger reversal', async () => {
      // 50% partial refund on $100 order ($50 refunded)
      const refundResult = await processOrderRefundCommission(
        testOrderId,
        50.0,
        false,
        'Partial refund test'
      );

      expect(refundResult.status).toBe('success');
      expect(refundResult.reversalCount).toBe(1);
      expect(refundResult.totalReversalUsd).toBe(10.0); // 50% of $20 = $10

      // Verify offsetting negative ledger entry created
      const reversalLedgers = await prisma.commission_ledger.findMany({
        where: { orderId: testOrderId, status: 'reversed' },
      });

      expect(reversalLedgers.length).toBe(1);
      expect(Number(reversalLedgers[0].amountUsd)).toBe(-10.0);
      expect(reversalLedgers[0].parentLedgerId).toBeDefined();
    });
  });
});
