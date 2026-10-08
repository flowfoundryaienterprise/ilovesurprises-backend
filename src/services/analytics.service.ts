import { prisma } from '../lib/prisma';
import {
  AdminLedgerItemDTO,
  AnalyticsReportDTO,
  AnalyticsTimeframe,
  CommissionCentralSummaryDTO,
  CommissionTierDistribution,
  RevenueTrajectoryPoint,
  ShopperSessionsPoint,
  SubscriptionPlanBreakdownItem,
} from '../types/analytics.types';
import { UserRole } from '@prisma/client';

export const TIER_CONFIG = [
  { level: 0, name: 'Direct Sale', ratePercent: 20.0, roleDescription: 'Selling Representative' },
  { level: 1, name: 'Tier 1 Sponsor', ratePercent: 5.0, roleDescription: 'Level 1 Downline' },
  { level: 2, name: 'Tier 2 Leader', ratePercent: 4.0, roleDescription: 'Level 2 Downline' },
  { level: 3, name: 'Tier 3 Partner', ratePercent: 3.0, roleDescription: 'Level 3 Downline' },
  { level: 4, name: 'Tier 4 Network', ratePercent: 2.0, roleDescription: 'Level 4 Downline' },
  { level: 5, name: 'Tier 5 Infinity', ratePercent: 1.0, roleDescription: 'Level 5 Downline' },
];

export function getStartDateForTimeframe(timeframe: AnalyticsTimeframe): Date {
  const now = new Date();
  switch (timeframe) {
    case '7D':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30D':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90D':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'YTD':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export async function getAnalyticsReport(
  timeframe: AnalyticsTimeframe = '7D'
): Promise<AnalyticsReportDTO> {
  const startDate = getStartDateForTimeframe(timeframe);
  const endDate = new Date();

  // 1. Fetch orders in timeframe
  const orders = await prisma.orders.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      id: true,
      totalAmount: true,
      subtotal: true,
      discountAmount: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  // 2. Fetch referral visits in timeframe
  const visits = await prisma.referral_visits.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      id: true,
      createdAt: true,
      converted: true,
    },
  });

  // 3. Compute Gross Sales & Net Sales
  let grossSales = 0;
  let totalDiscounts = 0;
  let validOrdersCount = 0;

  for (const o of orders) {
    if (o.paymentStatus !== 'FAILED') {
      grossSales += Number(o.totalAmount || 0);
      totalDiscounts += Number(o.discountAmount || 0);
      validOrdersCount++;
    }
  }
  const netSales = Math.max(0, grossSales - totalDiscounts);

  // 4. Traffic & Conversion
  const uniqueSessions = visits.length;
  const checkouts = validOrdersCount;
  const conversionRate =
    uniqueSessions > 0 ? (checkouts / uniqueSessions) * 100 : 0;

  // 5. Membership MRR & Subscribers
  const activeMemberships = await prisma.user_memberships.findMany({
    where: { status: 'ACTIVE' },
    include: { membership_plans: true },
  });

  let totalMrr = 0;
  for (const m of activeMemberships) {
    totalMrr += Number(m.membership_plans?.price || 0);
  }
  const activeSubscribersCount = activeMemberships.length;

  // 6. Commission Liability & Disbursed
  const allCommissions = await prisma.commission_ledger.findMany({
    select: {
      amountUsd: true,
      status: true,
      level: true,
    },
  });

  let commissionLiability = 0;
  let disbursedTotal = 0;
  for (const c of allCommissions) {
    const amt = Number(c.amountUsd || 0);
    if ((c.status === 'pending' || c.status === 'available') && amt > 0) {
      commissionLiability += amt;
    } else if (c.status === 'paid' && amt > 0) {
      disbursedTotal += amt;
    }
  }

  // 7. Revenue Trajectory (Daily points)
  const daysDiff = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const dailyGmvMap = new Map<string, { gmv: number; count: number }>();
  const dailySessionsMap = new Map<string, { sessions: number; checkouts: number }>();

  for (let i = 0; i <= daysDiff; i++) {
    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    dailyGmvMap.set(dateStr, { gmv: 0, count: 0 });
    dailySessionsMap.set(dateStr, { sessions: 0, checkouts: 0 });
  }

  for (const o of orders) {
    if (o.paymentStatus !== 'FAILED') {
      const dateStr = o.createdAt.toISOString().split('T')[0];
      const existing = dailyGmvMap.get(dateStr) || { gmv: 0, count: 0 };
      existing.gmv += Number(o.totalAmount || 0);
      existing.count += 1;
      dailyGmvMap.set(dateStr, existing);

      const sess = dailySessionsMap.get(dateStr) || { sessions: 0, checkouts: 0 };
      sess.checkouts += 1;
      dailySessionsMap.set(dateStr, sess);
    }
  }

  for (const v of visits) {
    const dateStr = v.createdAt.toISOString().split('T')[0];
    const sess = dailySessionsMap.get(dateStr) || { sessions: 0, checkouts: 0 };
    sess.sessions += 1;
    dailySessionsMap.set(dateStr, sess);
  }

  const trajectoryPoints: RevenueTrajectoryPoint[] = [];
  dailyGmvMap.forEach((val, date) => {
    trajectoryPoints.push({
      date,
      gmv: Number(val.gmv.toFixed(2)),
      ordersCount: val.count,
      formattedGmv: formatCurrency(val.gmv),
    });
  });

  const shopperSessionsPoints: ShopperSessionsPoint[] = [];
  dailySessionsMap.forEach((val, date) => {
    const conv = val.sessions > 0 ? (val.checkouts / val.sessions) * 100 : 0;
    shopperSessionsPoints.push({
      date,
      sessions: val.sessions,
      checkouts: val.checkouts,
      conversionRate: Number(conv.toFixed(2)),
      formattedConversionRate: `${conv.toFixed(1)}%`,
    });
  });

  const aov = validOrdersCount > 0 ? grossSales / validOrdersCount : 0;

  // 8. Commission Distribution by Tier
  const tierMap = new Map<number, { amount: number; count: number }>();
  for (let i = 0; i <= 5; i++) {
    tierMap.set(i, { amount: 0, count: 0 });
  }

  for (const c of allCommissions) {
    const amt = Number(c.amountUsd || 0);
    if (c.status !== 'reversed' && amt > 0) {
      const existing = tierMap.get(c.level) || { amount: 0, count: 0 };
      existing.amount += amt;
      existing.count += 1;
      tierMap.set(c.level, existing);
    }
  }

  let totalDistributedUsd = 0;
  const tierDistributions: CommissionTierDistribution[] = TIER_CONFIG.map((t) => {
    const data = tierMap.get(t.level) || { amount: 0, count: 0 };
    totalDistributedUsd += data.amount;
    return {
      level: t.level,
      name: `${t.name} (${t.ratePercent}%)`,
      ratePercent: t.ratePercent,
      totalAmount: Number(data.amount.toFixed(2)),
      count: data.count,
      formattedTotal: formatCurrency(data.amount),
    };
  });

  // 9. Subscription Plan Breakdown
  const plans = await prisma.membership_plans.findMany({
    include: {
      user_memberships: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  const subscriptionPlanBreakdown: SubscriptionPlanBreakdownItem[] = plans.map((p) => {
    const count = p.user_memberships.length;
    const planMrr = count * Number(p.price || 0);
    return {
      planId: p.id,
      name: p.name,
      price: Number(p.price || 0),
      interval: p.interval,
      subscriberCount: count,
      mrr: Number(planMrr.toFixed(2)),
      formattedMrr: formatCurrency(planMrr),
    };
  });

  // 10. Tab Counts
  const [customerCohorts, commissionLedgerCount, topAffiliatesCount] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
    prisma.commission_ledger.count(),
    prisma.affiliate_profiles.count({ where: { isActive: true } }),
  ]);

  return {
    timeframe,
    dateRange: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    },
    kpis: {
      grossSales: {
        value: Number(grossSales.toFixed(2)),
        formatted: formatCurrency(grossSales),
        subValue: Number(netSales.toFixed(2)),
        subFormatted: `Net Sales: ${formatCurrency(netSales)}`,
      },
      trafficAndConversion: {
        value: Number(conversionRate.toFixed(1)),
        formatted: `${conversionRate.toFixed(0)}%`,
        subValue: uniqueSessions,
        subFormatted: `From ${uniqueSessions} unique web sessions`,
      },
      membershipMrr: {
        value: Number(totalMrr.toFixed(2)),
        formatted: formatCurrency(totalMrr),
        subValue: activeSubscribersCount,
        subFormatted: `Across ${activeSubscribersCount} active subscribers`,
      },
      commissionLiability: {
        value: Number(commissionLiability.toFixed(2)),
        formatted: formatCurrency(commissionLiability),
        subValue: Number(disbursedTotal.toFixed(2)),
        subFormatted: `${formatCurrency(disbursedTotal)} already disbursed`,
      },
    },
    revenueTrajectory: {
      points: trajectoryPoints,
      aov: Number(aov.toFixed(2)),
      formattedAov: `AOV: ${formatCurrency(aov)}`,
      totalGmv: Number(grossSales.toFixed(2)),
    },
    shopperSessionsVsCheckouts: {
      points: shopperSessionsPoints,
      avgConversion: Number(conversionRate.toFixed(2)),
      formattedAvgConversion: `${conversionRate.toFixed(0)}% Avg Conversion`,
      totalSessions: uniqueSessions,
      totalCheckouts: checkouts,
    },
    commissionDistributionByTier: {
      tiers: tierDistributions,
      totalDistributedUsd: Number(totalDistributedUsd.toFixed(2)),
      programCapPercent: 35.0,
    },
    subscriptionPlanBreakdown: {
      plans: subscriptionPlanBreakdown,
      totalMrr: Number(totalMrr.toFixed(2)),
      totalActiveSubscribers: activeSubscribersCount,
    },
    tabCounts: {
      salesAndOrders: validOrdersCount,
      customerCohorts,
      commissionLedger: commissionLedgerCount,
      topAffiliates: topAffiliatesCount,
    },
  };
}

export async function getCommissionCentralOverview(): Promise<CommissionCentralSummaryDTO> {
  const [allCommissions, activeConsultantsCount] = await Promise.all([
    prisma.commission_ledger.findMany({
      select: { amountUsd: true, status: true },
    }),
    prisma.affiliate_profiles.count({ where: { isActive: true } }),
  ]);

  let totalCommissionsEarned = 0;
  let pendingLiability = 0;
  let availableBalance = 0;
  let disbursedTotal = 0;

  for (const c of allCommissions) {
    const amt = Number(c.amountUsd || 0);
    if (c.status !== 'reversed' && amt > 0) {
      totalCommissionsEarned += amt;
    }
    if (c.status === 'pending' && amt > 0) {
      pendingLiability += amt;
    } else if (c.status === 'available' && amt > 0) {
      availableBalance += amt;
    } else if (c.status === 'paid' && amt > 0) {
      disbursedTotal += amt;
    }
  }

  const schedule = TIER_CONFIG.map((t) => ({
    level: t.level,
    tierName: t.name,
    ratePercent: t.ratePercent,
    roleDescription: t.roleDescription,
  }));

  return {
    programRules: {
      maxDistributionCapPercent: 35.0,
      payoutSchedule: 'Monthly Payouts: 15th of every month',
      activeQualificationRuleThreshold: 125.0,
      qualificationPolicyNote:
        'Surprise Consultants must generate at least $125.00 in qualifying retail customer sales each calendar month to receive team/downline commissions. Rep personal purchases receive a 20% discount upfront, generate $0 commission, and do not count toward the $125 requirement. $20 Rep signup/monthly fees do not generate commission income.',
      policyStatus: 'POLICY ENFORCED ($125 FIXED)',
    },
    schedule,
    metrics: {
      totalCommissionsEarned: Number(totalCommissionsEarned.toFixed(2)),
      pendingLiability: Number(pendingLiability.toFixed(2)),
      availableBalance: Number(availableBalance.toFixed(2)),
      disbursedTotal: Number(disbursedTotal.toFixed(2)),
      totalLedgerEntries: allCommissions.length,
      activeConsultantsCount,
    },
  };
}

export async function getAdminCommissionLedger(query: {
  search?: string;
  status?: string;
  tier?: number;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, query.page || 1);
  const limit = Math.max(1, Math.min(100, query.limit || 20));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.status && query.status !== 'all') {
    where.status = query.status.toLowerCase();
  }

  if (query.tier !== undefined && !isNaN(query.tier)) {
    where.level = Number(query.tier);
  }

  if (query.search && query.search.trim()) {
    const s = query.search.trim();
    where.OR = [
      {
        orders: {
          OR: [
            { orderNumber: { contains: s, mode: 'insensitive' } },
            { users: { email: { contains: s, mode: 'insensitive' } } },
            { users: { firstName: { contains: s, mode: 'insensitive' } } },
            { users: { lastName: { contains: s, mode: 'insensitive' } } },
          ],
        },
      },
      {
        affiliate_profiles: {
          OR: [
            { username: { contains: s, mode: 'insensitive' } },
            { referralCode: { contains: s, mode: 'insensitive' } },
            { users: { email: { contains: s, mode: 'insensitive' } } },
            { users: { firstName: { contains: s, mode: 'insensitive' } } },
            { users: { lastName: { contains: s, mode: 'insensitive' } } },
          ],
        },
      },
    ];
  }

  const [total, ledgers] = await Promise.all([
    prisma.commission_ledger.count({ where }),
    prisma.commission_ledger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        affiliate_profiles: {
          include: { users: true },
        },
        orders: {
          include: { users: true },
        },
      },
    }),
  ]);

  const items: AdminLedgerItemDTO[] = ledgers.map((l) => {
    const tier = TIER_CONFIG.find((t) => t.level === l.level) || {
      level: l.level,
      name: `Level ${l.level}`,
      ratePercent: Number(l.rate) * 100,
      roleDescription: 'Downline',
    };

    const repUser = l.affiliate_profiles.users;
    const custUser = l.orders?.users;

    const repFullName =
      repUser?.firstName || repUser?.lastName
        ? `${repUser.firstName || ''} ${repUser.lastName || ''}`.trim()
        : l.affiliate_profiles.username || 'Affiliate Rep';

    const custFullName =
      custUser?.firstName || custUser?.lastName
        ? `${custUser.firstName || ''} ${custUser.lastName || ''}`.trim()
        : custUser?.email || 'Customer';

    return {
      id: l.id,
      representative: {
        id: l.affiliate_profiles.id,
        username: l.affiliate_profiles.username || l.affiliate_profiles.referralCode,
        fullName: repFullName,
        email: repUser?.email || '',
        status: l.affiliate_profiles.status,
      },
      orderAndCustomer: {
        orderId: l.orderId,
        orderNumber: l.orders?.orderNumber || l.orderId,
        customerName: custFullName,
        customerEmail: custUser?.email || '',
        orderDate: l.orders?.createdAt?.toISOString() || l.createdAt.toISOString(),
      },
      tierLevel: {
        level: l.level,
        name: tier.name,
        ratePercent: tier.ratePercent,
      },
      orderVolume: Number(l.commissionableBaseUsd || l.orders?.totalAmount || 0),
      commissionEarned: {
        rate: Number(l.rate),
        amountUsd: Number(l.amountUsd),
        formattedAmount: formatCurrency(Number(l.amountUsd)),
      },
      status: l.status.toUpperCase(),
      availableAt: l.availableAt.toISOString(),
      ruleVersion: l.ruleVersion,
      parentLedgerId: l.parentLedgerId,
      note: l.note,
      createdAt: l.createdAt.toISOString(),
    };
  });

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function exportCsvData(type: 'sales' | 'ledger' | 'affiliates'): Promise<string> {
  if (type === 'ledger') {
    const ledgers = await prisma.commission_ledger.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000,
      include: {
        affiliate_profiles: { include: { users: true } },
        orders: { include: { users: true } },
      },
    });

    const headers = [
      'Ledger ID',
      'Representative Username',
      'Representative Email',
      'Order Number',
      'Customer Email',
      'Tier Level',
      'Rate',
      'Commissionable Base (USD)',
      'Commission Amount (USD)',
      'Status',
      'Created At',
      'Available At',
    ];

    const rows = ledgers.map((l) => [
      l.id,
      `"${l.affiliate_profiles.username || l.affiliate_profiles.referralCode}"`,
      `"${l.affiliate_profiles.users?.email || ''}"`,
      `"${l.orders?.orderNumber || l.orderId}"`,
      `"${l.orders?.users?.email || ''}"`,
      l.level,
      l.rate,
      l.commissionableBaseUsd,
      l.amountUsd,
      l.status,
      l.createdAt.toISOString(),
      l.availableAt.toISOString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  // Default sales export
  const orders = await prisma.orders.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
    include: { users: true },
  });

  const headers = [
    'Order ID',
    'Order Number',
    'Customer Email',
    'Subtotal',
    'Discount',
    'Total Amount',
    'Currency',
    'Payment Status',
    'Created At',
  ];

  const rows = orders.map((o) => [
    o.id,
    `"${o.orderNumber}"`,
    `"${o.users?.email || ''}"`,
    o.subtotal,
    o.discountAmount,
    o.totalAmount,
    o.currency,
    o.paymentStatus,
    o.createdAt.toISOString(),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
