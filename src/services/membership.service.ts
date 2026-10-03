import { prisma } from '../lib/prisma';
import { MembershipPlanDTO, UserMembershipDTO } from '../types/membership.types';

export class MembershipService {
  private formatPlan(p: any): MembershipPlanDTO {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      interval: p.interval,
      discountPercent: Number(p.discountPercent),
      freeShipping: p.freeShipping,
      perks: p.perks || [],
      isActive: p.isActive,
    };
  }

  async getActivePlans(): Promise<MembershipPlanDTO[]> {
    let plans = await prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    // Seed default plans if none exist
    if (plans.length === 0) {
      await prisma.membershipPlan.createMany({
        data: [
          {
            name: 'VIP Club Member',
            slug: 'vip-club',
            description: 'Exclusive member pricing, early drop access, and free shipping.',
            price: 9.99,
            interval: 'MONTHLY',
            discountPercent: 10,
            freeShipping: true,
            perks: [
              '10% off all orders',
              'Free shipping on all orders',
              'Secret surprise reveal hints',
              'Exclusive access to limited releases',
            ],
            isActive: true,
          },
          {
            name: 'Diamond VIP Annual',
            slug: 'diamond-vip',
            description: 'Ultimate surprise lover experience with 15% discount and priority appraisals.',
            price: 99.00,
            interval: 'YEARLY',
            discountPercent: 15,
            freeShipping: true,
            perks: [
              '15% off all orders',
              'Free priority shipping',
              'Free certified jewelry appraisals',
              'Birthday mystery gift candle',
            ],
            isActive: true,
          },
        ],
      });

      plans = await prisma.membershipPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      });
    }

    return plans.map((p) => this.formatPlan(p));
  }

  async getUserMembership(userId: string): Promise<UserMembershipDTO | null> {
    const mem = await prisma.userMembership.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!mem) return null;

    // Check expiration
    if (mem.endDate && mem.endDate < new Date() && mem.status === 'ACTIVE') {
      await prisma.userMembership.update({
        where: { id: mem.id },
        data: { status: 'EXPIRED' },
      });
      mem.status = 'EXPIRED';
    }

    return {
      id: mem.id,
      userId: mem.userId,
      status: mem.status,
      startDate: mem.startDate,
      endDate: mem.endDate,
      autoRenew: mem.autoRenew,
      plan: this.formatPlan(mem.plan),
    };
  }

  async subscribe(userId: string, planSlug: string): Promise<UserMembershipDTO> {
    const plan = await prisma.membershipPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan || !plan.isActive) {
      const err: any = new Error('Membership plan not found or inactive');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date();
    const endDate = new Date(now);
    if (plan.interval === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const membership = await prisma.userMembership.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        startDate: now,
        endDate,
        autoRenew: true,
      },
      create: {
        userId,
        planId: plan.id,
        status: 'ACTIVE',
        startDate: now,
        endDate,
        autoRenew: true,
      },
      include: { plan: true },
    });

    return {
      id: membership.id,
      userId: membership.userId,
      status: membership.status,
      startDate: membership.startDate,
      endDate: membership.endDate,
      autoRenew: membership.autoRenew,
      plan: this.formatPlan(membership.plan),
    };
  }

  async cancelMembership(userId: string): Promise<void> {
    const mem = await prisma.userMembership.findUnique({ where: { userId } });
    if (!mem) {
      const err: any = new Error('No active membership found');
      err.statusCode = 404;
      throw err;
    }

    await prisma.userMembership.update({
      where: { userId },
      data: {
        autoRenew: false,
        status: 'CANCELLED',
      },
    });
  }

  // Admin APIs
  async listAllMemberships(): Promise<any[]> {
    const mems = await prisma.userMembership.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return mems.map((m) => ({
      id: m.id,
      userId: m.userId,
      userName: `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim(),
      userEmail: m.user.email,
      planName: m.plan.name,
      planPrice: Number(m.plan.price),
      status: m.status,
      startDate: m.startDate,
      endDate: m.endDate,
      autoRenew: m.autoRenew,
    }));
  }
}

export const membershipService = new MembershipService();
