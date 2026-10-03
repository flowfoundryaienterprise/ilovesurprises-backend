import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().trim().url('Invalid image URL'),
  altText: z.string().trim().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isPrimary: z.boolean().optional(),
});

const optionValueSchema = z.object({
  id: z.string().optional(),
  value: z.string().trim().min(1, 'Option value cannot be empty'),
  sortOrder: z.number().int().optional(),
});

const optionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Option name cannot be empty'),
  values: z.array(optionValueSchema).default([]),
});

const variantSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().optional().nullable(),
  sku: z.string().trim().optional().nullable(),
  price: z.number().nonnegative('Variant price must be 0 or greater'),
  compareAtPrice: z.number().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative().default(0),
  ringSize: z.string().trim().optional().nullable(),
  scent: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Product name is required'),
    slug: z.string().trim().optional(),
    shortDescription: z.string().trim().optional().nullable(),
    description: z.string().trim().optional().nullable(),
    price: z.number().nonnegative('Product price must be 0 or greater'),
    compareAtPrice: z.number().nonnegative().optional().nullable(),
    imageUrl: z.string().trim().url('Invalid image URL').optional().nullable().or(z.literal('')),
    categoryId: z.string().trim().optional().nullable().or(z.literal('')),
    collectionIds: z.array(z.string().trim()).optional().default([]),
    surpriseType: z.string().trim().optional().nullable(),
    surpriseValue: z.number().nonnegative().optional().nullable(),
    stock: z.number().int().nonnegative().default(0),
    lowStockThreshold: z.number().int().nonnegative().default(5),
    sku: z.string().trim().optional().nullable(),
    badge: z.string().trim().optional().nullable(),
    isBestSeller: z.boolean().optional().default(false),
    isNew: z.boolean().optional().default(false),
    scentNotes: z.array(z.string().trim()).optional().default([]),
    ringSizes: z.array(z.string().trim()).optional().default([]),
    jewelryTypes: z.array(z.string().trim()).optional().default([]),
    status: z.nativeEnum(ProductStatus).optional().default(ProductStatus.DRAFT),
    images: z.array(imageSchema).optional().default([]),
    options: z.array(optionSchema).optional().default([]),
    variants: z.array(variantSchema).optional().default([]),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    name: z.string().trim().min(1, 'Product name cannot be empty').optional(),
    slug: z.string().trim().optional(),
    shortDescription: z.string().trim().optional().nullable(),
    description: z.string().trim().optional().nullable(),
    price: z.number().nonnegative('Product price must be 0 or greater').optional(),
    compareAtPrice: z.number().nonnegative().optional().nullable(),
    imageUrl: z.string().trim().url('Invalid image URL').optional().nullable().or(z.literal('')),
    categoryId: z.string().trim().optional().nullable().or(z.literal('')),
    collectionIds: z.array(z.string().trim()).optional(),
    surpriseType: z.string().trim().optional().nullable(),
    surpriseValue: z.number().nonnegative().optional().nullable(),
    stock: z.number().int().nonnegative().optional(),
    lowStockThreshold: z.number().int().nonnegative().optional(),
    sku: z.string().trim().optional().nullable(),
    badge: z.string().trim().optional().nullable(),
    isBestSeller: z.boolean().optional(),
    isNew: z.boolean().optional(),
    scentNotes: z.array(z.string().trim()).optional(),
    ringSizes: z.array(z.string().trim()).optional(),
    jewelryTypes: z.array(z.string().trim()).optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    images: z.array(imageSchema).optional(),
    options: z.array(optionSchema).optional(),
    variants: z.array(variantSchema).optional(),
  }),
});

export const updateProductStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(ProductStatus, {
      message: 'Status must be ACTIVE, DRAFT, or ARCHIVED',
    }),
  }),
});

export const getProductBySlugSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1, 'Product slug is required'),
  }),
});

export const listProductsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
    limit: z.string().optional().transform((v) => (v ? Math.max(1, Math.min(100, parseInt(v, 10))) : 20)),
    search: z.string().optional(),
    category: z.string().optional(),
    collection: z.string().optional(),
    surpriseType: z.string().optional(),
    minPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    maxPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    rating: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    inStock: z.string().optional().transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
    isBestSeller: z.string().optional().transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
    isNew: z.string().optional().transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
    sort: z.string().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
  }),
});
