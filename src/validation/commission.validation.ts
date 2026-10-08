import { z } from 'zod';

export const processCommissionSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, { message: 'Order ID is required' }).trim(),
  }),
});

export const refundCommissionSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, { message: 'Order ID is required' }).trim(),
  }),
  body: z.object({
    refundedEligibleAmount: z.number().positive().optional(),
    isFullRefund: z.boolean().default(false),
    note: z.string().trim().optional(),
  }),
});
