import { OrderStatus, PaymentStatus, PaymentMethod, FulfillmentStatus } from '@prisma/client';

export interface AdminOrderItemSummaryDTO {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'refunded' | 'pending' | 'failed' | 'partially_refunded';
  itemCount: number;
  itemsSummary: string;
  createdAt: string;
  subtotal?: number;
  shippingFee?: number;
  discountAmount?: number;
  paymentMethod?: PaymentMethod;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface OrderItemDetailDTO {
  id: string;
  productId: string | null;
  productName: string;
  variantTitle?: string | null;
  sku?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  selectedRingSize?: string | null;
  selectedScent?: string | null;
  customNote?: string | null;
  imageUrl?: string | null;
  isCommissionEligible: boolean;
}

export interface OrderFulfillmentDTO {
  id: string;
  status: FulfillmentStatus;
  trackingCompany?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface OrderNoteDTO {
  id: string;
  authorId?: string | null;
  authorRole?: string | null;
  note: string;
  isCustomerVisible: boolean;
  createdAt: string;
}

export interface OrderRefundDTO {
  id: string;
  amount: number;
  currency: string;
  reason?: string | null;
  status: string;
  processedBy?: string | null;
  createdAt: string;
}

export interface AdminOrderDetailDTO extends AdminOrderItemSummaryDTO {
  taxAmount: number;
  currency: string;
  customerNote?: string | null;
  shippingAddressSnapshot: Record<string, any>;
  inventoryDeducted: boolean;
  items: OrderItemDetailDTO[];
  fulfillments: OrderFulfillmentDTO[];
  notes: OrderNoteDTO[];
  refunds: OrderRefundDTO[];
  attributedAffiliate?: {
    id: string;
    username?: string | null;
    referralCode: string;
    commissionRate: number;
  } | null;
}

export interface ListOrdersQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus | string;
  paymentStatus?: PaymentStatus | string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'totalAmount' | 'orderNumber' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  notes?: string;
}

export interface CreateFulfillmentDTO {
  carrier: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status?: FulfillmentStatus;
  notes?: string;
}

export interface CreateOrderNoteDTO {
  note: string;
  isCustomerVisible?: boolean;
}

export interface ProcessOrderRefundDTO {
  amount: number;
  reason?: string;
  restockInventory?: boolean;
}

export interface OrdersListResponseDTO {
  orders: AdminOrderItemSummaryDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    processingCount: number;
    shippedCount: number;
    deliveredCount: number;
    cancelledCount: number;
  };
}
