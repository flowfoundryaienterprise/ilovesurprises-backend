import { ProductStatus } from '@prisma/client';

export interface ScentOption {
  id: string;
  name: string;
  subtitle?: string;
  isPriority?: boolean;
}

export interface LimitedBatchInfo {
  badge: string;
  urgencyText: string;
  countdownHours: number;
  countdownMinutes: number;
  countdownSeconds: number;
}

export interface SurpriseRevealInfo {
  badge: string;
  valueRange: string;
  description: string;
  appraisalCallout: string;
}

export interface RatingBreakdownItem {
  stars: number;
  percentage: number;
  count: number;
}

export interface ReviewsSummary {
  overallRating: number;
  maxRating: number;
  totalReviews: number;
  breakdown: RatingBreakdownItem[];
  appraisedValueRange: string;
  guaranteeBadge: string;
}

export interface ProductResponseDTO {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images: string[];
  categoryId: string | null;
  categoryName?: string | null;
  badge: string | null;
  rating: number;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  lowStockThreshold: number;
  sku: string | null;
  isBestSeller: boolean;
  isNew: boolean;
  status: ProductStatus;
  scentNotes: string[];
  scentOptions: ScentOption[];
  ringSizes: string[];
  jewelryTypes: string[];
  limitedBatchInfo: LimitedBatchInfo;
  surpriseRevealInfo: SurpriseRevealInfo;
  trustBadges: string[];
  reviewsSummary: ReviewsSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListProductsQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'bestseller';
  featured?: boolean;
}

export interface CreateProductDTO {
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  categoryId?: string;
  surpriseType?: string;
  surpriseValue?: number;
  badge?: string;
  stock?: number;
  lowStockThreshold?: number;
  sku?: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  scentNotes?: string[];
  ringSizes?: string[];
  jewelryTypes?: string[];
  status?: ProductStatus;
  images?: string[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface CreateReviewDTO {
  rating: number;
  title?: string;
  comment: string;
}
