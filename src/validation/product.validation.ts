import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

export const listProductsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    search: z.string().optional(),
    category: z.string().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    sortBy: z.enum(['newest', 'price-asc', 'price-desc', 'rating', 'bestseller']).optional().default('newest'),
    featured: z.string().optional().transform((val) => val === 'true'),
  }),
});

export const createProductReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5, { message: 'Rating must be between 1 and 5' }),
    title: z.string().trim().optional(),
    comment: z.string().trim().min(3, { message: 'Review comment must be at least 3 characters' }),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, { message: 'Product name is required' }),
    slug: z.string().trim().optional(),
    shortDescription: z.string().trim().optional(),
    description: z.string().trim().optional(),
    price: z.number().positive({ message: 'Price must be positive' }),
    compareAtPrice: z.number().positive().optional(),
    imageUrl: z.string().url().optional(),
    categoryId: z.string().optional(),
    surpriseType: z.string().optional(),
    surpriseValue: z.number().optional(),
    badge: z.string().optional(),
    stock: z.number().int().nonnegative().optional().default(0),
    lowStockThreshold: z.number().int().nonnegative().optional().default(5),
    sku: z.string().trim().optional(),
    isBestSeller: z.boolean().optional().default(false),
    isNew: z.boolean().optional().default(false),
    scentNotes: z.array(z.string()).optional().default([]),
    ringSizes: z.array(z.string()).optional().default([]),
    jewelryTypes: z.array(z.string()).optional().default([]),
    status: z.nativeEnum(ProductStatus).optional().default(ProductStatus.ACTIVE),
    images: z.array(z.string().url()).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    slug: z.string().trim().optional(),
    shortDescription: z.string().trim().optional(),
    description: z.string().trim().optional(),
    price: z.number().positive().optional(),
    compareAtPrice: z.number().positive().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    surpriseType: z.string().nullable().optional(),
    surpriseValue: z.number().nullable().optional(),
    badge: z.string().nullable().optional(),
    stock: z.number().int().nonnegative().optional(),
    lowStockThreshold: z.number().int().nonnegative().optional(),
    sku: z.string().trim().nullable().optional(),
    isBestSeller: z.boolean().optional(),
    isNew: z.boolean().optional(),
    scentNotes: z.array(z.string()).optional(),
    ringSizes: z.array(z.string()).optional(),
    jewelryTypes: z.array(z.string()).optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    images: z.array(z.string().url()).optional(),
  }),
});
