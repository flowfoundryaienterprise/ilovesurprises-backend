export interface WishlistItemDTO {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string | null;
    rating: number;
    reviewCount: number;
    stock: number;
    badge: string | null;
  };
  createdAt: Date;
}
