import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import {
  AffiliateProfileDTO,
  GenealogyNodeDTO,
  AffiliateDashboardSummaryDTO,
} from '../types/affiliate.types';

export const COMMISSION_RATES = {
  DIRECT: 0.20, // 20%
  LEVEL_1: 0.05, // 5%
  LEVEL_2: 0.04, // 4%
  LEVEL_3: 0.03, // 3%
  LEVEL_4: 0.02, // 2%
  LEVEL_5: 0.01, // 1%
};

export const MAX_COMMISSION_CAP = 0.35; // 35%

export class AffiliateService {
  private generateReferralCode(userEmail: string): string {
    const prefix = userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix || 'REP'}${rand}`;
  }

  async getProfileByUserId(userId: string): Promise<AffiliateProfileDTO | null> {
    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      userId: profile.userId,
      referralCode: profile.referralCode,
      slug: profile.slug,
      sponsorId: profile.sponsorId,
      status: profile.status,
      lifetimeEarnings: Number(profile.lifetimeEarnings),
      currentBalance: Number(profile.currentBalance),
      pendingBalance: Number(profile.pendingBalance),
      payoutMethod: profile.payoutMethod,
      payoutDetails: profile.payoutDetails,
      commissionRate: Number(profile.commissionRate),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async registerAffiliate(
    userId: string,
    data: {
      sponsorCode?: string;
      customSlug?: string;
      payoutMethod?: string;
      payoutDetails?: any;
    }
  ): Promise<AffiliateProfileDTO> {
    const existing = await prisma.affiliateProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      return (await this.getProfileByUserId(userId))!;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      const err: any = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    let sponsorId: string | null = null;
    let parentGenealogyNodeId: string | null = null;

    if (data.sponsorCode) {
      const cleanCode = data.sponsorCode.trim().toUpperCase();
      const sponsor = await prisma.affiliateProfile.findFirst({
        where: {
          OR: [
            { referralCode: cleanCode },
            { slug: cleanCode.toLowerCase() },
          ],
        },
        include: { genealogyNode: true },
      });

      if (sponsor && sponsor.userId !== userId) {
        sponsorId = sponsor.id;
        if (sponsor.genealogyNode) {
          parentGenealogyNodeId = sponsor.genealogyNode.id;
        }
      }
    }

    const referralCode = this.generateReferralCode(user.email);
    const slug = data.customSlug ? data.customSlug.toLowerCase() : referralCode.toLowerCase();

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.affiliateProfile.create({
        data: {
          userId,
          referralCode,
          slug,
          sponsorId,
          status: 'ACTIVE',
          commissionRate: COMMISSION_RATES.DIRECT,
          payoutMethod: data.payoutMethod || null,
          payoutDetails: data.payoutDetails || Prisma.DbNull,
        },
      });

      // Update user role to AFFILIATE if currently CUSTOMER
      if (user.role === 'CUSTOMER') {
        await tx.user.update({
          where: { id: userId },
          data: { role: 'AFFILIATE' },
        });
      }

      // Create GenealogyNode
      const parentNode = parentGenealogyNodeId
        ? await tx.genealogyNode.findUnique({ where: { id: parentGenealogyNodeId } })
        : null;

      const level = parentNode ? parentNode.level + 1 : 0;
      const path = parentNode ? `${parentNode.path}/${profile.id}` : `/${profile.id}`;

      await tx.genealogyNode.create({
        data: {
          affiliateId: profile.id,
          parentId: parentGenealogyNodeId,
          level,
          path,
        },
      });

      return profile;
    });

    return (await this.getProfileByUserId(result.userId))!;
  }

  async getProfileByReferralCode(code: string): Promise<any | null> {
    const clean = code.trim();
    const profile = await prisma.affiliateProfile.findFirst({
      where: {
        OR: [
          { referralCode: clean.toUpperCase() },
          { slug: clean.toLowerCase() },
        ],
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      referralCode: profile.referralCode,
      slug: profile.slug,
      name: `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim() || 'Official Representative',
      repUsername: profile.slug || profile.referralCode,
      status: profile.status,
    };
  }

  async trackVisit(data: {
    referralCode: string;
    ipAddress?: string;
    userAgent?: string;
    landingPage?: string;
    referrerUrl?: string;
  }): Promise<boolean> {
    const clean = data.referralCode.trim();
    const profile = await prisma.affiliateProfile.findFirst({
      where: {
        OR: [
          { referralCode: clean.toUpperCase() },
          { slug: clean.toLowerCase() },
        ],
      },
    });

    if (!profile) return false;

    await prisma.referralVisit.create({
      data: {
        affiliateId: profile.id,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        landingPage: data.landingPage,
        referrerUrl: data.referrerUrl,
      },
    });

    return true;
  }

  /**
   * Calculates and credits commissions for an order across up to 5 genealogy levels.
   * Transaction-safe, idempotent, duplicate-safe.
   */
  async processOrderCommissions(orderId: string, referralCode?: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) return;

    // Determine the direct referring affiliate
    let directAffiliate: any = null;

    if (referralCode) {
      const clean = referralCode.trim();
      directAffiliate = await prisma.affiliateProfile.findFirst({
        where: {
          OR: [
            { referralCode: clean.toUpperCase() },
            { slug: clean.toLowerCase() },
          ],
          status: 'ACTIVE',
        },
        include: { genealogyNode: true },
      });
    }

    // If order was placed by an affiliate themselves, check sponsor
    if (!directAffiliate && order.userId) {
      const buyerAffiliate = await prisma.affiliateProfile.findUnique({
        where: { userId: order.userId },
        include: { sponsor: { include: { genealogyNode: true } } },
      });
      if (buyerAffiliate && buyerAffiliate.sponsor) {
        directAffiliate = buyerAffiliate.sponsor;
      }
    }

    if (!directAffiliate) return;

    // Use subtotal minus discount as commissionable volume (net merchandise value)
    const commissionableAmount = Math.max(0, Number(order.subtotal) - Number(order.discountAmount));
    if (commissionableAmount <= 0) return;

    await prisma.$transaction(async (tx) => {
      // 1. Direct referral commission (Level 0 = 20%)
      const existingDirect = await tx.commissionRecord.findUnique({
        where: {
          affiliateId_orderId_level: {
            affiliateId: directAffiliate.id,
            orderId: order.id,
            level: 0,
          },
        },
      });

      if (!existingDirect) {
        const directRate = COMMISSION_RATES.DIRECT;
        const directAmount = Number((commissionableAmount * directRate).toFixed(2));

        if (directAmount > 0) {
          await tx.commissionRecord.create({
            data: {
              affiliateId: directAffiliate.id,
              orderId: order.id,
              level: 0,
              rate: directRate,
              orderAmount: commissionableAmount,
              commissionAmount: directAmount,
              status: 'PENDING',
              description: `Direct referral 20% on Order #${order.orderNumber}`,
            },
          });

          const updatedAffiliate = await tx.affiliateProfile.update({
            where: { id: directAffiliate.id },
            data: {
              pendingBalance: { increment: directAmount },
              lifetimeEarnings: { increment: directAmount },
            },
          });

          await tx.commissionLedgerEntry.create({
            data: {
              affiliateId: directAffiliate.id,
              type: 'CREDIT',
              amount: directAmount,
              balanceAfter: updatedAffiliate.currentBalance,
              reason: 'COMMISSION_DIRECT',
              referenceId: order.id,
            },
          });
        }
      }

      // 2. MLM Multi-Tier Genealogy Commissions (Levels 1 to 5)
      const tierRates = [
        COMMISSION_RATES.LEVEL_1, // L1 = 5%
        COMMISSION_RATES.LEVEL_2, // L2 = 4%
        COMMISSION_RATES.LEVEL_3, // L3 = 3%
        COMMISSION_RATES.LEVEL_4, // L4 = 2%
        COMMISSION_RATES.LEVEL_5, // L5 = 1%
      ];

      let currentGenealogyNode = directAffiliate.genealogyNode;

      for (let levelIndex = 0; levelIndex < 5; levelIndex++) {
        if (!currentGenealogyNode || !currentGenealogyNode.parentId) break;

        const parentNode = await tx.genealogyNode.findUnique({
          where: { id: currentGenealogyNode.parentId },
          include: { affiliate: true },
        });

        if (!parentNode || !parentNode.affiliate || parentNode.affiliate.status !== 'ACTIVE') {
          break;
        }

        const tierAffiliate = parentNode.affiliate;
        const levelNumber = levelIndex + 1;
        const tierRate = tierRates[levelIndex];
        const tierAmount = Number((commissionableAmount * tierRate).toFixed(2));

        const existingTier = await tx.commissionRecord.findUnique({
          where: {
            affiliateId_orderId_level: {
              affiliateId: tierAffiliate.id,
              orderId: order.id,
              level: levelNumber,
            },
          },
        });

        if (!existingTier && tierAmount > 0) {
          await tx.commissionRecord.create({
            data: {
              affiliateId: tierAffiliate.id,
              orderId: order.id,
              level: levelNumber,
              rate: tierRate,
              orderAmount: commissionableAmount,
              commissionAmount: tierAmount,
              status: 'PENDING',
              description: `Tier Level ${levelNumber} (${(tierRate * 100).toFixed(0)}%) on Order #${order.orderNumber}`,
            },
          });

          const updatedTierAffiliate = await tx.affiliateProfile.update({
            where: { id: tierAffiliate.id },
            data: {
              pendingBalance: { increment: tierAmount },
              lifetimeEarnings: { increment: tierAmount },
            },
          });

          await tx.commissionLedgerEntry.create({
            data: {
              affiliateId: tierAffiliate.id,
              type: 'CREDIT',
              amount: tierAmount,
              balanceAfter: updatedTierAffiliate.currentBalance,
              reason: 'COMMISSION_TIER',
              referenceId: order.id,
            },
          });
        }

        currentGenealogyNode = parentNode;
      }
    });
  }

  async getGenealogyTree(userId: string): Promise<GenealogyNodeDTO | null> {
    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        genealogyNode: true,
      },
    });

    if (!profile || !profile.genealogyNode) return null;

    const buildTree = async (nodeId: string, depth = 0): Promise<GenealogyNodeDTO[]> => {
      if (depth >= 5) return [];

      const childrenNodes = await prisma.genealogyNode.findMany({
        where: { parentId: nodeId },
        include: {
          affiliate: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
      });

      const children: GenealogyNodeDTO[] = [];
      for (const childNode of childrenNodes) {
        const subChildren = await buildTree(childNode.id, depth + 1);
        children.push({
          id: childNode.id,
          affiliateId: childNode.affiliateId,
          referralCode: childNode.affiliate.referralCode,
          name: `${childNode.affiliate.user.firstName || ''} ${childNode.affiliate.user.lastName || ''}`.trim() || 'Team Member',
          email: childNode.affiliate.user.email,
          level: depth + 1,
          status: childNode.affiliate.status,
          recruitsCount: subChildren.length,
          children: subChildren,
        });
      }

      return children;
    };

    const rootChildren = await buildTree(profile.genealogyNode.id, 0);

    return {
      id: profile.genealogyNode.id,
      affiliateId: profile.id,
      referralCode: profile.referralCode,
      name: `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim() || 'My Organization',
      email: profile.user.email,
      level: 0,
      status: profile.status,
      recruitsCount: rootChildren.length,
      children: rootChildren,
    };
  }

  async getCommissions(userId: string): Promise<any> {
    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId },
    });
    if (!profile) return { commissions: [], ledger: [] };

    const commissions = await prisma.commissionRecord.findMany({
      where: { affiliateId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const ledger = await prisma.commissionLedgerEntry.findMany({
      where: { affiliateId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      commissions: commissions.map((c) => ({
        id: c.id,
        orderId: c.orderId,
        level: c.level,
        rate: Number(c.rate),
        orderAmount: Number(c.orderAmount),
        commissionAmount: Number(c.commissionAmount),
        status: c.status,
        description: c.description,
        createdAt: c.createdAt,
      })),
      ledger: ledger.map((l) => ({
        id: l.id,
        type: l.type,
        amount: Number(l.amount),
        balanceAfter: Number(l.balanceAfter),
        reason: l.reason,
        referenceId: l.referenceId,
        createdAt: l.createdAt,
      })),
    };
  }

  async requestPayout(
    userId: string,
    data: { amount: number; payoutMethod: string; accountDetails: any }
  ): Promise<any> {
    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      const err: any = new Error('Affiliate profile not found');
      err.statusCode = 404;
      throw err;
    }

    if (profile.status !== 'ACTIVE') {
      const err: any = new Error('Affiliate account is suspended or inactive');
      err.statusCode = 403;
      throw err;
    }

    const availableBalance = Number(profile.currentBalance);
    if (data.amount < 10) {
      const err: any = new Error('Minimum payout threshold is $10.00');
      err.statusCode = 400;
      throw err;
    }

    if (data.amount > availableBalance) {
      const err: any = new Error(`Requested amount exceeds available balance ($${availableBalance.toFixed(2)})`);
      err.statusCode = 400;
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      const payout = await tx.payoutRequest.create({
        data: {
          affiliateId: profile.id,
          amount: data.amount,
          payoutMethod: data.payoutMethod,
          accountDetails: data.accountDetails,
          status: 'PENDING',
        },
      });

      const updatedProfile = await tx.affiliateProfile.update({
        where: { id: profile.id },
        data: {
          currentBalance: { decrement: data.amount },
        },
      });

      await tx.commissionLedgerEntry.create({
        data: {
          affiliateId: profile.id,
          type: 'DEBIT',
          amount: data.amount,
          balanceAfter: updatedProfile.currentBalance,
          reason: 'PAYOUT',
          referenceId: payout.id,
        },
      });

      return {
        id: payout.id,
        amount: Number(payout.amount),
        currency: payout.currency,
        status: payout.status,
        payoutMethod: payout.payoutMethod,
        createdAt: payout.createdAt,
      };
    });
  }

  async getPayouts(userId: string): Promise<any[]> {
    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId },
    });
    if (!profile) return [];

    const payouts = await prisma.payoutRequest.findMany({
      where: { affiliateId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    return payouts.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      payoutMethod: p.payoutMethod,
      referenceId: p.referenceId,
      processedAt: p.processedAt,
      notes: p.notes,
      createdAt: p.createdAt,
    }));
  }

  async getDashboardSummary(userId: string): Promise<AffiliateDashboardSummaryDTO> {
    const profile = await this.getProfileByUserId(userId);
    if (!profile) {
      const err: any = new Error('Affiliate profile not found');
      err.statusCode = 404;
      throw err;
    }

    const clicksCount = await prisma.referralVisit.count({
      where: { affiliateId: profile.id },
    });

    const conversionsCount = await prisma.referralVisit.count({
      where: { affiliateId: profile.id, converted: true },
    });

    const commissions = await prisma.commissionRecord.findMany({
      where: { affiliateId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const pendingTotal = await prisma.commissionRecord.aggregate({
      where: { affiliateId: profile.id, status: 'PENDING' },
      _sum: { commissionAmount: true },
    });

    const paidTotal = await prisma.payoutRequest.aggregate({
      where: { affiliateId: profile.id, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const teamCount = await prisma.genealogyNode.count({
      where: {
        path: { contains: profile.id },
        NOT: { affiliateId: profile.id },
      },
    });

    const recentPayouts = await this.getPayouts(userId);

    return {
      profile,
      stats: {
        totalClicks: clicksCount,
        totalConversions: conversionsCount,
        conversionRate: clicksCount > 0 ? Number(((conversionsCount / clicksCount) * 100).toFixed(1)) : 0,
        totalCommissions: profile.lifetimeEarnings,
        pendingCommissions: Number(pendingTotal._sum.commissionAmount || 0),
        paidCommissions: Number(paidTotal._sum.amount || 0),
        currentBalance: profile.currentBalance,
        teamMembersCount: teamCount,
      },
      recentCommissions: commissions.map((c) => ({
        id: c.id,
        affiliateId: c.affiliateId,
        orderId: c.orderId,
        level: c.level,
        rate: Number(c.rate),
        orderAmount: Number(c.orderAmount),
        commissionAmount: Number(c.commissionAmount),
        status: c.status,
        description: c.description,
        createdAt: c.createdAt,
      })),
      recentPayouts: recentPayouts.slice(0, 5),
    };
  }

  // Admin functions
  async listAllAffiliates(query: { page?: number; limit?: number; search?: string }): Promise<any> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AffiliateProfileWhereInput = query.search
      ? {
          OR: [
            { referralCode: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
            { user: { email: { contains: query.search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      prisma.affiliateProfile.count({ where }),
      prisma.affiliateProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      affiliates: items.map((a) => ({
        id: a.id,
        userId: a.userId,
        email: a.user.email,
        name: `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() || 'Representative',
        referralCode: a.referralCode,
        slug: a.slug,
        status: a.status,
        lifetimeEarnings: Number(a.lifetimeEarnings),
        currentBalance: Number(a.currentBalance),
        pendingBalance: Number(a.pendingBalance),
        payoutMethod: a.payoutMethod,
        createdAt: a.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateAffiliateStatus(id: string, status: string): Promise<any> {
    return await prisma.affiliateProfile.update({
      where: { id },
      data: { status },
    });
  }

  async listPayoutRequests(query: { page?: number; limit?: number; status?: string }): Promise<any> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.PayoutRequestWhereInput = query.status ? { status: query.status } : {};

    const [total, items] = await Promise.all([
      prisma.payoutRequest.count({ where }),
      prisma.payoutRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          affiliate: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      payouts: items.map((p) => ({
        id: p.id,
        affiliateId: p.affiliateId,
        affiliateName: `${p.affiliate.user.firstName || ''} ${p.affiliate.user.lastName || ''}`.trim(),
        affiliateEmail: p.affiliate.user.email,
        referralCode: p.affiliate.referralCode,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        payoutMethod: p.payoutMethod,
        accountDetails: p.accountDetails,
        referenceId: p.referenceId,
        processedAt: p.processedAt,
        notes: p.notes,
        createdAt: p.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePayoutStatus(
    id: string,
    status: string,
    referenceId?: string,
    notes?: string
  ): Promise<any> {
    return await prisma.$transaction(async (tx) => {
      const payout = await tx.payoutRequest.findUnique({ where: { id } });
      if (!payout) {
        const err: any = new Error('Payout request not found');
        err.statusCode = 404;
        throw err;
      }

      // If rejected, refund the amount back to currentBalance
      if (status === 'REJECTED' && payout.status !== 'REJECTED') {
        const updatedProfile = await tx.affiliateProfile.update({
          where: { id: payout.affiliateId },
          data: { currentBalance: { increment: payout.amount } },
        });

        await tx.commissionLedgerEntry.create({
          data: {
            affiliateId: payout.affiliateId,
            type: 'CREDIT',
            amount: payout.amount,
            balanceAfter: updatedProfile.currentBalance,
            reason: 'ADJUSTMENT',
            referenceId: payout.id,
          },
        });
      }

      const updatedPayout = await tx.payoutRequest.update({
        where: { id },
        data: {
          status,
          referenceId: referenceId || payout.referenceId,
          notes: notes || payout.notes,
          processedAt: status === 'COMPLETED' ? new Date() : payout.processedAt,
        },
      });

      return updatedPayout;
    });
  }
}

export const affiliateService = new AffiliateService();
