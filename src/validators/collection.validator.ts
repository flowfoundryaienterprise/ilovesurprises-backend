import { z } from 'zod';

export const createCollectionSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Collection name is required'),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    bannerImage: z.string().trim().url('Invalid image URL').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const updateCollectionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Collection ID is required'),
  }),
  body: z.object({
    name: z.string().trim().min(1, 'Collection name cannot be empty').optional(),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    bannerImage: z.string().trim().url('Invalid image URL').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const getCollectionBySlugSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1, 'Collection slug is required'),
  }),
});
