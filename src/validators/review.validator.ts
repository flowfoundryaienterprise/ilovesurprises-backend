import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().trim().min(1, 'Product ID is required'),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    title: z.string().trim().optional(),
    comment: z.string().trim().min(2, 'Comment must be at least 2 characters'),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Review ID is required'),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().trim().optional(),
    comment: z.string().trim().min(2).optional(),
  }),
});

export const reviewIdParamSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Review ID is required'),
  }),
});
