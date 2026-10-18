import { z } from 'zod';

export const listMembershipsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
    search: z.string().optional(),
    plan: z.string().optional(),
    status: z.string().optional(),
  }),
});

export const updateMembershipStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'past_due', 'suspended', 'cancelled', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED'], {
      message: 'Status must be active, past_due, suspended, or cancelled',
    }),
  }),
});

export const updateMembershipPricingSchema = z.object({
  body: z.object({
    monthlyPrice: z.number().min(0, 'Monthly price must be non-negative'),
    sixMonthDiscount: z.number().min(0).max(100, 'Discount must be between 0 and 100'),
    twelveMonthDiscount: z.number().min(0).max(100, 'Discount must be between 0 and 100'),
  }),
});

export const createMembershipPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Plan name is required'),
    slug: z.string().min(1, 'Plan slug is required'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be non-negative'),
    interval: z.string().default('MONTHLY'),
    discountPercent: z.number().min(0).max(100).optional().default(10),
    freeShipping: z.boolean().optional().default(true),
    perks: z.array(z.string()).optional().default([]),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateMembershipPlanSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    interval: z.string().optional(),
    discountPercent: z.number().min(0).max(100).optional(),
    freeShipping: z.boolean().optional(),
    perks: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const subscribeMembershipSchema = z.object({
  body: z.object({
    planId: z.string().min(1, 'Plan ID is required'),
  }),
});
