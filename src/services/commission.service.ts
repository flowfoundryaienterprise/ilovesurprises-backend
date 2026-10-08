import { Decimal } from 'decimal.js';
import { prisma } from '../lib/prisma';
import {
  CommissionCalculationResult,
  PayoutChainItem,
  RefundCommissionResult,
} from '../types/commission.types';

export const COMMISSION_RATES: Record<number, Decimal> = {
  0: new Decimal('0.20'), // Personal Selling Rep (Direct Attribution): 20.0%
  1: new Decimal('0.05'), // Upline Level 1 (Direct Sponsor): 5.0%
  2: new Decimal('0.04'), // Upline Level 2: 4.0%
  3: new Decimal('0.03'), // Upline Level 3: 3.0%
  4: new Decimal('0.02'), // Upline Level 4: 2.0%
  5: new Decimal('0.01'), // Upline Level 5: 1.0%
};

export const MAX_COMMISSION_CAP = new Decimal('0.35'); // 35.0% system hard cap
export const PENDING_HOLDING_DAYS = 30; // 30-day return & review window

/**
 * Calculates server-side commissionable base in USD for a given order and its line items.
 * Applies order-level discount proration across eligible items and multi-currency FX normalization.
 */
export function calculateCommissionableBaseUSD(
  order: {
    discountAmount: any;
    fxRateToUsd: any;
    subtotal: any;
  },
  items: Array<{
    lineTotal: any;
    isCommissionEligible: boolean;
  }>
): Decimal {
  const fxRate = new Decimal(order.fxRateToUsd?.toString() || '1.0');
  const orderDiscount = new Decimal(order.discountAmount?.toString() || '0.0');

  // 1. Calculate eligible line items sum before order discount
  let eligibleSubtotal = new Decimal(0);
  const eligibleItems: Array<{ lineTotal: Decimal }> = [];

  for (const item of items) {
    if (item.isCommissionEligible) {
      const lineNet = new Decimal(item.lineTotal.toString());
      if (lineNet.isPositive()) {
        eligibleSubtotal = eligibleSubtotal.plus(lineNet);
        eligibleItems.push({ lineTotal: lineNet });
      }
    }
  }

  if (eligibleSubtotal.isZero() || eligibleSubtotal.isNegative()) {
    return new Decimal(0);
  }

  // 2. Order-level discount proration:
  // If order-level discount D exists, prorate across eligible items proportionally:
  // LineCommissionableNet = LineSubtotal - (LineSubtotal / EligibleSubtotal * D)
  let commissionableBaseOrder = new Decimal(0);
  if (orderDiscount.isPositive() && orderDiscount.lessThan(eligibleSubtotal)) {
    for (const item of eligibleItems) {
      const proratedDiscount = item.lineTotal.times(orderDiscount).dividedBy(eligibleSubtotal);
      const lineNetAfterDiscount = item.lineTotal.minus(proratedDiscount);
      commissionableBaseOrder = commissionableBaseOrder.plus(lineNetAfterDiscount);
    }
  } else if (orderDiscount.greaterThanOrEqualTo(eligibleSubtotal)) {
    // Discount absorbs the entire eligible subtotal
    return new Decimal(0);
  } else {
    commissionableBaseOrder = eligibleSubtotal;
  }

  // 3. Multi-Currency Normalization to USD
  return commissionableBaseOrder.times(fxRate).toDecimalPlaces(4, Decimal.ROUND_HALF_UP);
}

/**
 * Traverses the MLM genealogy up to 5 levels starting from the selling representative.
 * Strictly adheres to the "No-Compression" rule:
 * Inactive, suspended, or missing uplines surrender that tier's payout permanently;
 * higher levels DO NOT compress or move down.
 */
export async function resolveGenealogyPayoutChain(
  sellingRepId: string,
  customerId: string,
  txClient: any = prisma
): Promise<PayoutChainItem[]> {
  const payoutChain: PayoutChainItem[] = [];
  const visited = new Set<string>();

  // Fetch selling representative profile
  const sellingRep = await txClient.affiliate_profiles.findUnique({
    where: { id: sellingRepId },
  });

  if (!sellingRep) {
    return payoutChain;
  }

  visited.add(sellingRep.id);

  // Self-referral prevention rule:
  // Selling reps cannot earn personal 20% Level 0 commission on their own purchases.
  const isSelfPurchase = sellingRep.userId === customerId;

  if (!isSelfPurchase) {
    if (sellingRep.isActive && sellingRep.payoutStatus !== 'suspended') {
      payoutChain.push({
        level: 0,
        affiliateId: sellingRep.id,
        rate: COMMISSION_RATES[0],
      });
    }
  }

  // Traverse Uplines: Level 1 through Level 5
  let currentSponsorId = sellingRep.sponsorId;

  for (let level = 1; level <= 5; level++) {
    if (!currentSponsorId) {
      // Uplines exhausted. STRICT NO-COMPRESSION: do not search further or shift.
      break;
    }

    if (visited.has(currentSponsorId)) {
      console.warn(`[Genealogy Cycle Alert] Detected cycle in affiliate tree: ${currentSponsorId}`);
      break;
    }

    const sponsor = await txClient.affiliate_profiles.findUnique({
      where: { id: currentSponsorId },
    });

    if (!sponsor) {
      // Missing upline record. STRICT NO-COMPRESSION: Drop this level.
      break;
    }

    visited.add(sponsor.id);

    // Active status & payout eligibility check
    if (sponsor.isActive && sponsor.payoutStatus !== 'suspended') {
      payoutChain.push({
        level,
        affiliateId: sponsor.id,
        rate: COMMISSION_RATES[level],
      });
    } else {
      // Inactive/Suspended: STRICT NO-COMPRESSION.
      // This level's rate is permanently surrendered. Higher uplines still receive their fixed rates.
    }

    currentSponsorId = sponsor.sponsorId;
  }

  return payoutChain;
}

/**
 * Processes commission generation for an order within an isolated database transaction.
 * Validates attribution, idempotency, arbitrary-precision commissionable base,
 * strict no-compression MLM traversal, and the 35% hard cap before writing immutable ledger entries.
 */
export async function processOrderCommission(
  orderId: string
): Promise<CommissionCalculationResult> {
  return await prisma.$transaction(async (tx) => {
    // 1. Lock and fetch order
    const orderRows: any[] = await tx.$queryRawUnsafe(
      `SELECT * FROM "orders" WHERE "id" = $1 FOR UPDATE`,
      orderId
    );
    const order = orderRows[0];

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // 2. Attribution Check
    if (!order.attributedAffiliateId) {
      return { status: 'no_affiliate_attributed' };
    }

    // 3. Idempotency Check: Verify if commissions already created for this order
    const existingLedgerCount = await tx.commission_ledger.count({
      where: { orderId },
    });

    if (existingLedgerCount > 0) {
      return { status: 'already_processed' };
    }

    // 4. Fetch order items
    const items = await tx.order_items.findMany({
      where: { orderId },
    });

    // 5. Calculate Commissionable Base USD
    const commissionableBaseUSD = calculateCommissionableBaseUSD(order, items);

    if (commissionableBaseUSD.isZero() || commissionableBaseUSD.isNegative()) {
      return { status: 'zero_commissionable_base' };
    }

    // 6. Traverse Genealogy (Level 0 through Level 5)
    const payoutChain = await resolveGenealogyPayoutChain(
      order.attributedAffiliateId,
      order.userId,
      tx
    );

    if (payoutChain.length === 0) {
      return { status: 'self_referral_blocked_completely' };
    }

    // 7. Hard Cap Validation: SUM(commission_rates) <= 0.35 (35%)
    let totalRateAssigned = new Decimal(0);
    for (const entry of payoutChain) {
      totalRateAssigned = totalRateAssigned.plus(entry.rate);
    }

    if (totalRateAssigned.greaterThan(MAX_COMMISSION_CAP)) {
      throw new Error(
        `CRITICAL COMMISSION ANOMALY: Total rate ${totalRateAssigned.toString()} exceeds hard cap of ${MAX_COMMISSION_CAP.toString()}`
      );
    }

    // 8. Write Immutable Ledger Rows
    const availableAt = new Date(Date.now() + PENDING_HOLDING_DAYS * 24 * 60 * 60 * 1000);
    const payoutSummaries: Array<{
      level: number;
      beneficiaryId: string;
      rate: number;
      amountUsd: number;
    }> = [];

    for (const entry of payoutChain) {
      const payoutAmountUSD = commissionableBaseUSD
        .times(entry.rate)
        .toDecimalPlaces(4, Decimal.ROUND_HALF_UP);

      await tx.commission_ledger.create({
        data: {
          orderId,
          beneficiaryId: entry.affiliateId,
          level: entry.level,
          rate: entry.rate.toNumber(),
          commissionableBaseUsd: commissionableBaseUSD.toNumber(),
          amountUsd: payoutAmountUSD.toNumber(),
          status: 'pending',
          ruleVersion: 'v4.0',
          availableAt,
          note: `Level ${entry.level} commission on Order ${order.orderNumber || orderId}`,
        },
      });

      // Update affiliate pending balance
      await tx.affiliate_profiles.update({
        where: { id: entry.affiliateId },
        data: {
          pendingBalance: {
            increment: payoutAmountUSD.toNumber(),
          },
        },
      });

      payoutSummaries.push({
        level: entry.level,
        beneficiaryId: entry.affiliateId,
        rate: entry.rate.toNumber(),
        amountUsd: payoutAmountUSD.toNumber(),
      });
    }

    // 9. Update Order snapshot
    await tx.orders.update({
      where: { id: orderId },
      data: {
        commissionableBaseUsd: commissionableBaseUSD.toNumber(),
      },
    });

    return {
      status: 'success',
      orderId,
      commissionableBaseUsd: commissionableBaseUSD.toNumber(),
      totalRate: totalRateAssigned.toNumber(),
      payoutsCount: payoutChain.length,
      payouts: payoutSummaries,
    };
  });
}

/**
 * Handles order refund / chargeback commission reversal pipeline.
 * Performs full or proportional partial refund reversals with offsetting negative ledger rows
 * and updates pending balances.
 */
export async function processOrderRefundCommission(
  orderId: string,
  refundedEligibleAmount?: number,
  isFullRefund: boolean = false,
  note?: string
): Promise<RefundCommissionResult> {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch original active/pending ledger records
    const originalLedgers = await tx.commission_ledger.findMany({
      where: {
        orderId,
        status: { in: ['pending', 'available'] },
        amountUsd: { gt: 0 },
      },
    });

    if (originalLedgers.length === 0) {
      return {
        status: 'no_commissions_found',
        orderId,
        reversalCount: 0,
        totalReversalUsd: 0,
      };
    }

    const order = await tx.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const fxRate = new Decimal(order.fxRateToUsd?.toString() || '1.0');
    const originalCommissionableBaseUSD = new Decimal(
      originalLedgers[0].commissionableBaseUsd.toString()
    );

    let refundRatio = new Decimal(1);

    if (!isFullRefund && refundedEligibleAmount !== undefined && originalCommissionableBaseUSD.gt(0)) {
      const refundedBaseUSD = new Decimal(refundedEligibleAmount).times(fxRate);
      refundRatio = refundedBaseUSD.dividedBy(originalCommissionableBaseUSD);
      if (refundRatio.gt(1)) refundRatio = new Decimal(1);
    }

    let totalReversalUsd = new Decimal(0);
    let reversalCount = 0;

    for (const original of originalLedgers) {
      const originalAmount = new Decimal(original.amountUsd.toString());
      const reversalAmount = originalAmount.times(refundRatio).toDecimalPlaces(4, Decimal.ROUND_HALF_UP);
      const reversalBase = originalCommissionableBaseUSD
        .times(refundRatio)
        .toDecimalPlaces(4, Decimal.ROUND_HALF_UP);

      if (reversalAmount.isZero()) continue;

      // Create offsetting negative ledger row
      await tx.commission_ledger.create({
        data: {
          orderId,
          beneficiaryId: original.beneficiaryId,
          level: original.level,
          rate: original.rate,
          commissionableBaseUsd: reversalBase.negated().toNumber(),
          amountUsd: reversalAmount.negated().toNumber(),
          status: 'reversed',
          ruleVersion: 'v4.0',
          parentLedgerId: original.id,
          availableAt: original.availableAt,
          note: note || (isFullRefund ? 'Full refund reversal' : `Partial refund reversal (${refundRatio.times(100).toFixed(1)}%)`),
        },
      });

      // Deduct from affiliate pending balance (or current balance if already available)
      if (original.status === 'pending') {
        await tx.affiliate_profiles.update({
          where: { id: original.beneficiaryId },
          data: {
            pendingBalance: {
              decrement: reversalAmount.toNumber(),
            },
          },
        });
      } else {
        await tx.affiliate_profiles.update({
          where: { id: original.beneficiaryId },
          data: {
            currentBalance: {
              decrement: reversalAmount.toNumber(),
            },
          },
        });
      }

      if (isFullRefund) {
        await tx.commission_ledger.update({
          where: { id: original.id },
          data: { status: 'reversed' },
        });
      }

      totalReversalUsd = totalReversalUsd.plus(reversalAmount);
      reversalCount++;
    }

    return {
      status: 'success',
      orderId,
      reversalCount,
      totalReversalUsd: totalReversalUsd.toNumber(),
    };
  });
}
