import { z } from 'zod';

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1, 'Coupon code is required'),
    subtotal: z.number().nonnegative('Subtotal must be non-negative'),
  }),
});

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1, 'Code is required').toUpperCase(),
    description: z.string().trim().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive('Discount value must be positive'),
    minOrderAmount: z.number().nonnegative().optional(),
    maxDiscountAmount: z.number().positive().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional().nullable(),
    maxUses: z.number().int().positive().optional(),
    maxUsesPerUser: z.number().int().positive().default(1),
    isActive: z.boolean().default(true),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Coupon ID is required'),
  }),
  body: z.object({
    description: z.string().trim().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    discountValue: z.number().positive().optional(),
    minOrderAmount: z.number().nonnegative().optional().nullable(),
    maxDiscountAmount: z.number().positive().optional().nullable(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional().nullable(),
    maxUses: z.number().int().positive().optional().nullable(),
    maxUsesPerUser: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});
