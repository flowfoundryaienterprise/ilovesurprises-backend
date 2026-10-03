export interface AddToCartDTO {
  productId: string;
  variantId?: string | null;
  quantity?: number;
  selectedRingSize?: string | null;
  selectedScent?: string | null;
  customNote?: string | null;
}

export interface UpdateCartItemDTO {
  quantity: number;
}

export interface CartItemResponseDTO {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  productPrice: number;
  productCompareAtPrice: number | null;
  productStock: number;
  isProductActive: boolean;

  variantId: string | null;
  variantTitle: string | null;
  variantPrice: number | null;
  variantStock: number | null;
  variantIsActive?: boolean;

  quantity: number;
  selectedRingSize: string | null;
  selectedScent: string | null;
  customNote: string | null;

  unitPrice: number;
  lineSubtotal: number;
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface CartResponseDTO {
  id: string;
  userId: string;
  items: CartItemResponseDTO[];
  totalQuantity: number;
  itemCount: number;
  subtotal: number;
  isAvailable: boolean;
  unavailableCount: number;
  updatedAt: Date;
}

export interface CartValidationItemDTO {
  cartItemId: string;
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
  unitPrice: number;
  isValid: boolean;
  message?: string;
}

export interface CartValidationResponseDTO {
  isValid: boolean;
  cart: CartResponseDTO;
  issues: CartValidationItemDTO[];
}
