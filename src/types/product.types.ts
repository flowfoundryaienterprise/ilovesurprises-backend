import { ProductStatus } from '@prisma/client';

export interface ProductImageDTO {
  id?: string;
  url: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductOptionValueDTO {
  id?: string;
  value: string;
  sortOrder?: number;
}

export interface ProductOptionDTO {
  id?: string;
  name: string;
  values: ProductOptionValueDTO[];
}

export interface ProductVariantDTO {
  id?: string;
  title?: string | null;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
  ringSize?: string | null;
  scent?: string | null;
  isActive?: boolean;
}

export interface CreateProductDTO {
  name: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  collectionIds?: string[];
  surpriseType?: string | null;
  surpriseValue?: number | null;
  stock?: number;
  lowStockThreshold?: number;
  sku?: string | null;
  badge?: string | null;
  isBestSeller?: boolean;
  isNew?: boolean;
  scentNotes?: string[];
  ringSizes?: string[];
  jewelryTypes?: string[];
  status?: ProductStatus;
  images?: ProductImageDTO[];
  options?: ProductOptionDTO[];
  variants?: ProductVariantDTO[];
}

export interface UpdateProductDTO {
  name?: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  collectionIds?: string[];
  surpriseType?: string | null;
  surpriseValue?: number | null;
  stock?: number;
  lowStockThreshold?: number;
  sku?: string | null;
  badge?: string | null;
  isBestSeller?: boolean;
  isNew?: boolean;
  scentNotes?: string[];
  ringSizes?: string[];
  jewelryTypes?: string[];
  status?: ProductStatus;
  images?: ProductImageDTO[];
  options?: ProductOptionDTO[];
  variants?: ProductVariantDTO[];
}

export interface ProductListQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;      // category slug or ID
  collection?: string;    // collection slug or ID
  surpriseType?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  sort?: string;          // featured, best_sellers, price_asc, price_desc, rating, newest
  status?: ProductStatus; // Admin only
}

export interface FormattedProductDTO {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  collections?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  surpriseType: string | null;
  surpriseValue: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  sku: string | null;
  badge: string | null;
  isBestSeller: boolean;
  isNew: boolean;
  scentNotes: string[];
  ringSizes: string[];
  jewelryTypes: string[];
  status: ProductStatus;
  images: ProductImageDTO[];
  options: ProductOptionDTO[];
  variants: ProductVariantDTO[];
  createdAt: Date;
  updatedAt: Date;
}
