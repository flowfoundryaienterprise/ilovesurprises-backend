import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  body: z.object({
    orderId: z.string().trim().min(1, 'Order ID is required'),
  }),
});
