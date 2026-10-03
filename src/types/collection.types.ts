export interface CreateCollectionDTO {
  name: string;
  slug?: string;
  description?: string;
  bannerImage?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCollectionDTO {
  name?: string;
  slug?: string;
  description?: string;
  bannerImage?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CollectionResponseDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerImage: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    products: number;
  };
}
