import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  FulfillmentStatus,
} from '@prisma/client';

export interface CheckoutDTO {
  shippingAddressId?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  items?: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
    selectedRingSize?: string | null;
    selectedScent?: string | null;
    customNote?: string | null;
  }>;
  promoCode?: string | null;
  attributedRep?: any;
  customerNote?: string | null;
  notes?: string | null;
}

export interface CodCheckoutDTO extends CheckoutDTO {}


export interface OrderItemResponseDTO {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantTitle: string | null;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  selectedRingSize: string | null;
  selectedScent: string | null;
  customNote: string | null;
  imageUrl: string | null;
}

export interface OrderResponseDTO {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  currency: string;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  customerNote: string | null;
  shippingAddressId: string | null;
  shippingAddressSnapshot: any;
  inventoryDeducted: boolean;
  items: OrderItemResponseDTO[];
  fulfillments?: any[];
  notes?: any[];
  payments?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  note?: string;
}

export interface UpdateFulfillmentDTO {
  status: FulfillmentStatus;
  trackingCompany?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
}

export interface CreateOrderNoteDTO {
  note: string;
  isCustomerVisible?: boolean;
}

export interface ListOrdersQueryDTO {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  page?: number;
  limit?: number;
}
