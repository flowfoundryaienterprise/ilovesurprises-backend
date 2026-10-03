import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { DiscountCouponDTO, CouponValidationResultDTO } from '../types/coupon.types';

export class CouponService {
  private formatCoupon(c: any): DiscountCouponDTO {
    return {
      id: c.id,
      code: c.code,
      description: c.description,
      discountType: c.discountType as 'PERCENTAGE' | 'FIXED',
      discountValue: Number(c.discountValue),
      minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
      maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
      startDate: c.startDate,
      endDate: c.endDate,
      maxUses: c.maxUses,
      currentUses: c.currentUses,
      maxUsesPerUser: c.maxUsesPerUser,
      isActive: c.isActive,
      createdAt: c.createdAt,
    };
  }

  async validateCoupon(
    code: string,
    subtotal: number,
    userId?: string
  ): Promise<CouponValidationResultDTO> {
    const clean = code.trim().toUpperCase();
    const coupon = await prisma.discountCoupon.findUnique({
      where: { code: clean },
    });

    if (!coupon || !coupon.isActive) {
      const err: any = new Error('Invalid or inactive discount coupon code');
      err.statusCode = 400;
      throw err;
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      const err: any = new Error('Coupon is not yet active');
      err.statusCode = 400;
      throw err;
    }

    if (coupon.endDate && coupon.endDate < now) {
      const err: any = new Error('Coupon has expired');
      err.statusCode = 400;
      throw err;
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      const err: any = new Error('Coupon usage limit has been reached');
      err.statusCode = 400;
      throw err;
    }

    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      const err: any = new Error(`Order minimum of $${Number(coupon.minOrderAmount).toFixed(2)} required for this coupon`);
      err.statusCode = 400;
      throw err;
    }

    if (userId) {
      const userUsageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsageCount >= coupon.maxUsesPerUser) {
        const err: any = new Error('You have already used this coupon code');
        err.statusCode = 400;
        throw err;
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Number(((subtotal * Number(coupon.discountValue)) / 100).toFixed(2));
      if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
        discountAmount = Number(coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = Math.min(subtotal, Number(coupon.discountValue));
    }

    const newSubtotal = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType as 'PERCENTAGE' | 'FIXED',
      discountValue: Number(coupon.discountValue),
      discountAmount,
      subtotal,
      newSubtotal,
      message: `Coupon applied: ${coupon.description || coupon.code}`,
    };
  }

  async recordCouponUsage(
    couponCode: string,
    userId: string,
    orderId: string,
    discountApplied: number
  ): Promise<void> {
    const clean = couponCode.trim().toUpperCase();
    const coupon = await prisma.discountCoupon.findUnique({
      where: { code: clean },
    });

    if (!coupon) return;

    await prisma.$transaction([
      prisma.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId,
          orderId,
          discountApplied,
        },
      }),
      prisma.discountCoupon.update({
        where: { id: coupon.id },
        data: {
          currentUses: { increment: 1 },
        },
      }),
    ]);
  }

  // Admin CRUD
  async listCouponsAdmin(): Promise<DiscountCouponDTO[]> {
    const coupons = await prisma.discountCoupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return coupons.map((c) => this.formatCoupon(c));
  }

  async createCouponAdmin(data: any): Promise<DiscountCouponDTO> {
    const coupon = await prisma.discountCoupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser || 1,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return this.formatCoupon(coupon);
  }

  async updateCouponAdmin(id: string, data: any): Promise<DiscountCouponDTO> {
    const coupon = await prisma.discountCoupon.update({
      where: { id },
      data: {
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        isActive: data.isActive,
      },
    });
    return this.formatCoupon(coupon);
  }

  async deleteCouponAdmin(id: string): Promise<void> {
    await prisma.discountCoupon.delete({ where: { id } });
  }
}

export const couponService = new CouponService();
