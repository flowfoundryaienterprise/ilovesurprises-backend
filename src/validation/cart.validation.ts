import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, { message: 'Product ID is required' }),
    variantId: z.string().optional(),
    quantity: z.number().int().positive({ message: 'Quantity must be at least 1' }).default(1),
    selectedRingSize: z.string().trim().optional(),
    selectedScent: z.string().trim().optional(),
    customNote: z.string().trim().optional(),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().nonnegative({ message: 'Quantity cannot be negative' }).optional(),
    selectedRingSize: z.string().trim().optional(),
    selectedScent: z.string().trim().optional(),
    customNote: z.string().trim().optional(),
  }),
});
