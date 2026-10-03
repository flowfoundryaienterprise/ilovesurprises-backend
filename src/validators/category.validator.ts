import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Category name is required'),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    image: z.string().trim().url('Invalid image URL').optional().or(z.literal('')),
    parentId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category ID is required'),
  }),
  body: z.object({
    name: z.string().trim().min(1, 'Category name cannot be empty').optional(),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    image: z.string().trim().url('Invalid image URL').optional().or(z.literal('')),
    parentId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const getCategoryBySlugSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1, 'Category slug is required'),
  }),
});
