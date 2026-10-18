import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import {
  MembershipPricingConfig,
  MembershipPlanDTO,
  MembershipAdminRecord,
  MembershipListResponse,
  CreateMembershipPlanDTO,
  UpdateMembershipPlanDTO,
  UserMembershipStatusDTO,
  MembershipPlanType,
  MembershipStatus,
} from '../types/membership.types';

export const DEFAULT_MEMBERSHIP_PRICING: MembershipPricingConfig = {
  monthlyPrice: 19.99,
  sixMonthDiscount: 10,
  twelveMonthDiscount: 15,
};

export const DEFAULT_PLANS: CreateMembershipPlanDTO[] = [
  {
    name: 'Monthly Active Plan',
    slug: 'monthly-active',
    description: 'Standard monthly rep access & back office privileges.',
    price: 19.99,
    interval: 'MONTHLY',
    discountPercent: 0,
    freeShipping: true,
    perks: ['Standard monthly rep access', 'Back office privileges'],
    isActive: true,
  },
  {
    name: '6-Month Prepaid',
    slug: '6-month-prepaid',
    description: 'Save $11.99 upfront compared to monthly billing.',
    price: 107.95,
    interval: '6_MONTH',
    discountPercent: 10,
    freeShipping: true,
    perks: ['Save $11.99 upfront compared to monthly billing', '10% Discount', 'Back office privileges'],
    isActive: true,
  },
  {
    name: '12-Month Annual VIP',
    slug: '12-month-annual-vip',
    description: 'Best value. Save $35.98 upfront with year-round perks.',
    price: 203.90,
    interval: 'ANNUAL',
    discountPercent: 15,
    freeShipping: true,
    perks: ['Best value', 'Save $35.98 upfront', 'Year-round perks', 'VIP Support'],
    isActive: true,
  },
];

/**
 * Ensures default plans exist in database if none are present
 */
export async function seedDefaultMembershipPlansIfEmpty(): Promise<void> {
  const count = await prisma.membership_plans.count();
  if (count === 0) {
    for (const plan of DEFAULT_PLANS) {
      await prisma.membership_plans.create({
        data: {
          id: `plan-${plan.slug}`,
          name: plan.name,
          slug: plan.slug,
          description: plan.description || '',
          price: plan.price,
          interval: plan.interval,
          discountPercent: plan.discountPercent ?? 10,
          freeShipping: plan.freeShipping ?? true,
          perks: plan.perks ?? [],
          isActive: plan.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }
}

/**
 * Formats a raw Prisma membership plan into a clean DTO
 */
export function formatMembershipPlan(plan: any): MembershipPlanDTO {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    price: Number(plan.price || 0),
    interval: plan.interval,
    discountPercent: Number(plan.discountPercent || 0),
    freeShipping: Boolean(plan.freeShipping),
    perks: plan.perks || [],
    isActive: Boolean(plan.isActive),
    features: plan.perks || [],
    billingPeriod: plan.interval === 'MONTHLY' ? 'month' : plan.interval === 'ANNUAL' ? 'year' : '6 months',
    createdAt: plan.createdAt?.toISOString ? plan.createdAt.toISOString() : String(plan.createdAt),
    updatedAt: plan.updatedAt?.toISOString ? plan.updatedAt.toISOString() : String(plan.updatedAt),
  };
}

/**
 * Maps plan slug or interval to MembershipPlanType
 */
function mapPlanType(plan: any): MembershipPlanType {
  const slug = (plan.slug || '').toLowerCase();
  const interval = (plan.interval || '').toUpperCase();
  if (slug.includes('twelve') || slug.includes('annual') || interval === 'ANNUAL' || interval === 'YEARLY') {
    return 'twelve_month';
  }
  if (slug.includes('six') || slug.includes('6-month') || interval === '6_MONTH' || interval === 'SEMI_ANNUAL') {
    return 'six_month';
  }
  return 'monthly';
}

/**
 * Maps interval to billingFrequency
 */
function mapBillingFrequency(plan: any): 'monthly' | 'every_6_months' | 'annually' {
  const planType = mapPlanType(plan);
  if (planType === 'twelve_month') return 'annually';
  if (planType === 'six_month') return 'every_6_months';
  return 'monthly';
}

/**
 * Retrieve all membership plans
 */
export async function listMembershipPlans(): Promise<MembershipPlanDTO[]> {
  await seedDefaultMembershipPlansIfEmpty();
  const plans = await prisma.membership_plans.findMany({
    orderBy: { price: 'asc' },
  });
  return plans.map(formatMembershipPlan);
}

/**
 * Get pricing config
 */
export async function getMembershipPricingConfig(): Promise<MembershipPricingConfig> {
  await seedDefaultMembershipPlansIfEmpty();
  const plans = await prisma.membership_plans.findMany();
  let monthlyPrice = DEFAULT_MEMBERSHIP_PRICING.monthlyPrice;
  let sixMonthDiscount = DEFAULT_MEMBERSHIP_PRICING.sixMonthDiscount;
  let twelveMonthDiscount = DEFAULT_MEMBERSHIP_PRICING.twelveMonthDiscount;

  for (const p of plans) {
    const pType = mapPlanType(p);
    if (pType === 'monthly') {
      monthlyPrice = Number(p.price);
    } else if (pType === 'six_month') {
      sixMonthDiscount = Number(p.discountPercent);
    } else if (pType === 'twelve_month') {
      twelveMonthDiscount = Number(p.discountPercent);
    }
  }

  return {
    monthlyPrice,
    sixMonthDiscount,
    twelveMonthDiscount,
  };
}

/**
 * Update pricing configuration across plans
 */
export async function updateMembershipPricingConfig(config: MembershipPricingConfig): Promise<MembershipPricingConfig> {
  await seedDefaultMembershipPlansIfEmpty();

  const monthlyPrice = Number(config.monthlyPrice);
  const sixMonthDiscount = Number(config.sixMonthDiscount);
  const twelveMonthDiscount = Number(config.twelveMonthDiscount);

  const sixMonthPrice = Number((monthlyPrice * 6 * (1 - sixMonthDiscount / 100)).toFixed(2));
  const twelveMonthPrice = Number((monthlyPrice * 12 * (1 - twelveMonthDiscount / 100)).toFixed(2));

  const plans = await prisma.membership_plans.findMany();

  for (const p of plans) {
    const pType = mapPlanType(p);
    if (pType === 'monthly') {
      await prisma.membership_plans.update({
        where: { id: p.id },
        data: {
          price: monthlyPrice,
          discountPercent: 0,
          updatedAt: new Date(),
        },
      });
    } else if (pType === 'six_month') {
      await prisma.membership_plans.update({
        where: { id: p.id },
        data: {
          price: sixMonthPrice,
          discountPercent: sixMonthDiscount,
          description: `Save $${(monthlyPrice * 6 - sixMonthPrice).toFixed(2)} upfront compared to monthly billing.`,
          updatedAt: new Date(),
        },
      });
    } else if (pType === 'twelve_month') {
      await prisma.membership_plans.update({
        where: { id: p.id },
        data: {
          price: twelveMonthPrice,
          discountPercent: twelveMonthDiscount,
          description: `Best value. Save $${(monthlyPrice * 12 - twelveMonthPrice).toFixed(2)} upfront with year-round perks.`,
          updatedAt: new Date(),
        },
      });
    }
  }

  return {
    monthlyPrice,
    sixMonthDiscount,
    twelveMonthDiscount,
  };
}

/**
 * Create a new membership plan
 */
export async function createMembershipPlan(data: CreateMembershipPlanDTO): Promise<MembershipPlanDTO> {
  const existing = await prisma.membership_plans.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    const err: any = new Error(`Membership plan with slug "${data.slug}" already exists`);
    err.statusCode = 400;
    throw err;
  }

  const created = await prisma.membership_plans.create({
    data: {
      id: `plan-${data.slug}`,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      price: data.price,
      interval: data.interval,
      discountPercent: data.discountPercent ?? 0,
      freeShipping: data.freeShipping ?? true,
      perks: data.perks ?? [],
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return formatMembershipPlan(created);
}

/**
 * Update a membership plan
 */
export async function updateMembershipPlan(id: string, data: UpdateMembershipPlanDTO): Promise<MembershipPlanDTO> {
  const existing = await prisma.membership_plans.findUnique({
    where: { id },
  });
  if (!existing) {
    const err: any = new Error('Membership plan not found');
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.membership_plans.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.interval !== undefined && { interval: data.interval }),
      ...(data.discountPercent !== undefined && { discountPercent: data.discountPercent }),
      ...(data.freeShipping !== undefined && { freeShipping: data.freeShipping }),
      ...(data.perks !== undefined && { perks: data.perks }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    },
  });

  return formatMembershipPlan(updated);
}

/**
 * List representative memberships for Admin panel
 */
export async function listAdminMemberships(query: {
  page?: number;
  limit?: number;
  search?: string;
  plan?: string;
  status?: string;
}): Promise<MembershipListResponse> {
  await seedDefaultMembershipPlansIfEmpty();

  const page = Math.max(1, query.page || 1);
  const limit = Math.max(1, Math.min(100, query.limit || 50));
  const skip = (page - 1) * limit;

  const rawMemberships = await prisma.user_memberships.findMany({
    include: {
      membership_plans: true,
      users: {
        include: {
          affiliate_profiles: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate high-level metrics
  let totalMrr = 0;
  let activeSubscriptions = 0;
  const planCountMap = new Map<string, { count: number; revenue: number }>();

  const formattedRecords: MembershipAdminRecord[] = rawMemberships.map((m) => {
    const plan = m.membership_plans;
    const user = m.users;
    const affiliate = user?.affiliate_profiles;

    const repName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown Rep';
    const repUsername = affiliate?.username ? `@${affiliate.username}` : `@${user?.email.split('@')[0] || 'member'}`;
    const planType = mapPlanType(plan);
    const billingFrequency = mapBillingFrequency(plan);

    const rawStatus = (m.status || 'ACTIVE').toLowerCase();
    const status: MembershipStatus =
      rawStatus === 'active' ? 'active' : rawStatus === 'past_due' ? 'past_due' : rawStatus === 'suspended' ? 'suspended' : 'cancelled';

    const price = Number(plan?.price || 0);

    if (status === 'active') {
      activeSubscriptions++;
      totalMrr += price;
    }

    const planKey = plan?.name || 'Unknown Plan';
    const curPlanData = planCountMap.get(planKey) || { count: 0, revenue: 0 };
    curPlanData.count += 1;
    curPlanData.revenue += price;
    planCountMap.set(planKey, curPlanData);

    const nextBillingDate = m.endDate ? m.endDate.toISOString().split('T')[0] : new Date(m.startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      id: m.id,
      representativeId: user?.id || m.userId,
      repName,
      repUsername,
      repAvatar: affiliate?.username ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(repName)}` : '',
      repEmail: user?.email || '',
      plan: planType,
      planId: plan?.id || m.planId,
      planName: plan?.name || 'Standard Plan',
      price,
      billingFrequency,
      discountNotice: Number(plan?.discountPercent || 0) > 0 ? `Save ${plan.discountPercent}% upfront` : undefined,
      paymentStatus: status === 'active' ? 'paid' : status === 'past_due' ? 'failed' : 'pending',
      status,
      nextBillingDate,
      renewalStatus: m.autoRenew ? 'auto_renew' : 'manual',
      cancellationStatus: status === 'cancelled' ? 'cancelled' : 'none',
      startedAt: m.startDate.toISOString().split('T')[0],
      paymentMethodSnippet: 'Visa ending in •••• 4242',
      autoRenew: m.autoRenew,
    };
  });

  // Apply filters
  let filtered = formattedRecords;

  if (query.search) {
    const s = query.search.toLowerCase().trim();
    filtered = filtered.filter(
      (m) =>
        m.repName.toLowerCase().includes(s) ||
        m.repUsername.toLowerCase().includes(s) ||
        m.repEmail.toLowerCase().includes(s) ||
        m.planName.toLowerCase().includes(s)
    );
  }

  if (query.plan && query.plan !== 'all') {
    const p = query.plan.toLowerCase();
    filtered = filtered.filter((m) => m.plan === p || m.planId === p || m.planName.toLowerCase().includes(p));
  }

  if (query.status && query.status !== 'all') {
    const st = query.status.toLowerCase();
    filtered = filtered.filter((m) => m.status === st);
  }

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  const plans = await listMembershipPlans();
  const pricing = await getMembershipPricingConfig();

  const plansBreakdown = Array.from(planCountMap.entries()).map(([pName, val]) => ({
    plan: pName,
    count: val.count,
    revenue: Number(val.revenue.toFixed(2)),
  }));

  return {
    memberships: paginated,
    plans,
    pricing,
    stats: {
      totalSubscriptions: formattedRecords.length,
      activeSubscriptions,
      totalMrr: Number(totalMrr.toFixed(2)),
      plansBreakdown,
    },
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Update membership status
 */
export async function updateMembershipStatus(id: string, status: string): Promise<MembershipAdminRecord> {
  const normStatus = status.toUpperCase();
  const existing = await prisma.user_memberships.findUnique({
    where: { id },
  });
  if (!existing) {
    const err: any = new Error('Membership not found');
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.user_memberships.update({
    where: { id },
    data: {
      status: normStatus,
      updatedAt: new Date(),
    },
    include: {
      membership_plans: true,
      users: {
        include: { affiliate_profiles: true },
      },
    },
  });

  const list = await listAdminMemberships({});
  const found = list.memberships.find((m) => m.id === id);
  if (!found) {
    throw new Error('Failed to resolve updated membership record');
  }
  return found;
}

/**
 * Assign or subscribe a user to a membership plan
 */
export async function assignMembership(userId: string, planId: string, status: string = 'ACTIVE'): Promise<any> {
  await seedDefaultMembershipPlansIfEmpty();

  const plan = await prisma.membership_plans.findFirst({
    where: {
      OR: [{ id: planId }, { slug: planId }],
    },
  });

  if (!plan) {
    const err: any = new Error('Selected membership plan does not exist');
    err.statusCode = 404;
    throw err;
  }

  const existing = await prisma.user_memberships.findUnique({
    where: { userId },
  });

  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (existing) {
    return prisma.user_memberships.update({
      where: { userId },
      data: {
        planId: plan.id,
        status: status.toUpperCase(),
        startDate: now,
        endDate,
        autoRenew: true,
        updatedAt: now,
      },
      include: { membership_plans: true },
    });
  }

  return prisma.user_memberships.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      planId: plan.id,
      status: status.toUpperCase(),
      startDate: now,
      endDate,
      autoRenew: true,
      createdAt: now,
      updatedAt: now,
    },
    include: { membership_plans: true },
  });
}

/**
 * Get logged-in user's membership status
 */
export async function getMyMembership(userId: string): Promise<UserMembershipStatusDTO> {
  const membership = await prisma.user_memberships.findUnique({
    where: { userId },
    include: { membership_plans: true },
  });

  if (!membership || membership.status.toUpperCase() !== 'ACTIVE') {
    return {
      hasActiveMembership: false,
    };
  }

  return {
    hasActiveMembership: true,
    membership: {
      id: membership.id,
      plan: formatMembershipPlan(membership.membership_plans),
      status: membership.status.toLowerCase(),
      currentPeriodStart: membership.startDate.toISOString(),
      currentPeriodEnd: membership.endDate ? membership.endDate.toISOString() : new Date(membership.startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: membership.autoRenew,
    },
  };
}

/**
 * Delete / Cancel membership
 */
export async function deleteMembership(id: string): Promise<void> {
  const existing = await prisma.user_memberships.findUnique({
    where: { id },
  });
  if (!existing) {
    const err: any = new Error('Membership not found');
    err.statusCode = 404;
    throw err;
  }

  await prisma.user_memberships.delete({
    where: { id },
  });
}
