import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().trim().min(1, 'Product ID is required'),
    variantId: z.string().trim().optional().nullable().or(z.literal('')),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
    selectedRingSize: z.string().trim().optional().nullable(),
    selectedScent: z.string().trim().optional().nullable(),
    customNote: z.string().trim().optional().nullable(),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Cart item ID is required'),
  }),
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

export const deleteCartItemSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Cart item ID is required'),
  }),
});
