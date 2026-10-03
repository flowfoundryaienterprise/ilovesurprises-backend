import { z } from 'zod';

export const addToWishlistSchema = z.object({
  body: z.object({
    productId: z.string().trim().min(1, 'Product ID is required'),
  }),
});

export const wishlistProductParamSchema = z.object({
  params: z.object({
    productId: z.string().trim().min(1, 'Product ID is required'),
  }),
});
