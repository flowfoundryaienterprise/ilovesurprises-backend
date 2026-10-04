export interface AddToCartDTO {
  productId: string;
  variantId?: string;
  quantity?: number;
  selectedRingSize?: string;
  selectedScent?: string;
  customNote?: string;
}

export interface UpdateCartItemDTO {
  quantity?: number;
  selectedRingSize?: string;
  selectedScent?: string;
  customNote?: string;
}

export interface CartItemDTO {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  selectedRingSize: string | null;
  selectedScent: string | null;
  customNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSummaryDTO {
  id: string;
  userId: string | null;
  items: CartItemDTO[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  freeShippingEligible: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  updatedAt: Date;
}
