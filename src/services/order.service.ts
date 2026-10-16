import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import {
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  Prisma,
} from '@prisma/client';
import {
  AdminOrderDetailDTO,
  AdminOrderItemSummaryDTO,
  CreateFulfillmentDTO,
  CreateOrderNoteDTO,
  ListOrdersQueryDTO,
  OrderFulfillmentDTO,
  OrderItemDetailDTO,
  OrderNoteDTO,
  OrderRefundDTO,
  OrdersListResponseDTO,
  ProcessOrderRefundDTO,
  UpdateOrderStatusDTO,
} from '../types/order.types';
import { processOrderRefundCommission } from './commission.service';

export class OrderServiceError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
    this.name = 'OrderServiceError';
  }
}

// ─── HELPER MAPPINGS & FORMATTERS ─────────────────────────────────────────────

export const mapPaymentStatus = (
  status: PaymentStatus
): 'paid' | 'refunded' | 'pending' | 'failed' | 'partially_refunded' => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'paid';
    case PaymentStatus.REFUNDED:
      return 'refunded';
    case PaymentStatus.PARTIALLY_REFUNDED:
      return 'partially_refunded';
    case PaymentStatus.FAILED:
      return 'failed';
    case PaymentStatus.PENDING:
    case PaymentStatus.PROCESSING:
    default:
      return 'pending';
  }
};

export const mapOrderStatus = (
  status: OrderStatus
): 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' => {
  return status.toLowerCase() as any;
};

export const parseStatusFilter = (raw?: string): OrderStatus | undefined => {
  if (!raw || raw.toLowerCase() === 'all') return undefined;
  const upper = raw.toUpperCase();
  if (upper in OrderStatus) return upper as OrderStatus;
  return undefined;
};

export const parsePaymentStatusFilter = (raw?: string): PaymentStatus | undefined => {
  if (!raw || raw.toLowerCase() === 'all') return undefined;
  const upper = raw.toUpperCase();
  if (upper in PaymentStatus) return upper as PaymentStatus;
  return undefined;
};

export const generateCarrierTrackingUrl = (
  carrier?: string | null,
  trackingNumber?: string | null
): string | null => {
  if (!trackingNumber) return null;
  const c = carrier?.toUpperCase() || '';
  if (c.includes('USPS')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`;
  }
  if (c.includes('UPS')) {
    return `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`;
  }
  if (c.includes('FEDEX')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`;
  }
  if (c.includes('DHL')) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(trackingNumber)}`;
  }
  return null;
};

export const formatOrderItemSummary = (order: any): AdminOrderItemSummaryDTO => {
  const snapshot = (order.shippingAddressSnapshot || {}) as Record<string, any>;
  const user = order.users;

  const customerName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    snapshot.fullName ||
    (user?.email ? user.email.split('@')[0] : 'Customer');

  const customerEmail = user?.email || snapshot.email || 'customer@example.com';

  const items = order.order_items || [];
  const itemCount = items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
  const itemsSummary = items.map((i: any) => i.productName).join(', ') || 'Surprise Candle Item';

  const fulfillment = order.order_fulfillments?.[0];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName,
    customerEmail,
    total: Number(order.totalAmount),
    status: mapOrderStatus(order.status),
    paymentStatus: mapPaymentStatus(order.paymentStatus),
    itemCount,
    itemsSummary,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discountAmount: Number(order.discountAmount),
    paymentMethod: order.paymentMethod,
    carrier: fulfillment?.trackingCompany ?? undefined,
    trackingNumber: fulfillment?.trackingNumber ?? undefined,
    trackingUrl: fulfillment?.trackingUrl ?? generateCarrierTrackingUrl(fulfillment?.trackingCompany, fulfillment?.trackingNumber) ?? undefined,
  };
};

export const formatOrderDetail = (order: any): AdminOrderDetailDTO => {
  const summary = formatOrderItemSummary(order);
  const snapshot = (order.shippingAddressSnapshot || {}) as Record<string, any>;

  const items: OrderItemDetailDTO[] = (order.order_items || []).map((i: any) => ({
    id: i.id,
    productId: i.productId,
    productName: i.productName,
    variantTitle: i.variantTitle,
    sku: i.sku,
    unitPrice: Number(i.unitPrice),
    quantity: i.quantity,
    lineTotal: Number(i.lineTotal),
    selectedRingSize: i.selectedRingSize,
    selectedScent: i.selectedScent,
    customNote: i.customNote,
    imageUrl: i.imageUrl,
    isCommissionEligible: Boolean(i.isCommissionEligible),
  }));

  const fulfillments: OrderFulfillmentDTO[] = (order.order_fulfillments || []).map((f: any) => ({
    id: f.id,
    status: f.status,
    trackingCompany: f.trackingCompany,
    trackingNumber: f.trackingNumber,
    trackingUrl: f.trackingUrl || generateCarrierTrackingUrl(f.trackingCompany, f.trackingNumber),
    shippedAt: f.shippedAt ? new Date(f.shippedAt).toISOString() : null,
    deliveredAt: f.deliveredAt ? new Date(f.deliveredAt).toISOString() : null,
    notes: f.notes,
    createdAt: new Date(f.createdAt).toISOString(),
  }));

  const notes: OrderNoteDTO[] = (order.order_notes || []).map((n: any) => ({
    id: n.id,
    authorId: n.authorId,
    authorRole: n.authorRole,
    note: n.note,
    isCustomerVisible: Boolean(n.isCustomerVisible),
    createdAt: new Date(n.createdAt).toISOString(),
  }));

  const refunds: OrderRefundDTO[] = (order.refund_records || []).map((r: any) => ({
    id: r.id,
    amount: Number(r.amount),
    currency: r.currency,
    reason: r.reason,
    status: r.status,
    processedBy: r.processedBy,
    createdAt: new Date(r.createdAt).toISOString(),
  }));

  const rep = order.attributed_affiliate;

  return {
    ...summary,
    taxAmount: Number(order.taxAmount || 0),
    currency: order.currency || 'USD',
    customerNote: order.customerNote,
    shippingAddressSnapshot: snapshot,
    inventoryDeducted: Boolean(order.inventoryDeducted),
    items,
    fulfillments,
    notes,
    refunds,
    attributedAffiliate: rep
      ? {
          id: rep.id,
          username: rep.username,
          referralCode: rep.referralCode,
          commissionRate: Number(rep.commissionRate || 0.2),
        }
      : null,
  };
};

 
export const listOrders = async (query: ListOrdersQueryDTO): Promise<OrdersListResponseDTO> => {
  const page = Math.max(1, query.page || 1);
  const limit = Math.max(1, Math.min(100, query.limit || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.ordersWhereInput = {};

 
  const statusFilter = parseStatusFilter(query.status);
  if (statusFilter) {
    where.status = statusFilter;
  }
 
  const paymentFilter = parsePaymentStatusFilter(query.paymentStatus);
  if (paymentFilter) {
    where.paymentStatus = paymentFilter;
  }

 
  if (query.customerId) {
    where.userId = query.customerId;
  }

 
  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) {
      where.createdAt.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      where.createdAt.lte = new Date(query.endDate);
    }
  }

   if (query.search) {
    const s = query.search.trim();
    where.OR = [
      { orderNumber: { contains: s, mode: 'insensitive' } },
      { customerNote: { contains: s, mode: 'insensitive' } },
      { users: { email: { contains: s, mode: 'insensitive' } } },
      { users: { firstName: { contains: s, mode: 'insensitive' } } },
      { users: { lastName: { contains: s, mode: 'insensitive' } } },
      { order_items: { some: { productName: { contains: s, mode: 'insensitive' } } } },
    ];
  }

  const orderBy: Prisma.ordersOrderByWithRelationInput = {};
  const sortCol = query.sortBy || 'createdAt';
  const sortDir = query.sortOrder || 'desc';
  orderBy[sortCol] = sortDir;

  const [total, orders, allMetrics] = await Promise.all([
    prisma.orders.count({ where }),
    prisma.orders.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        users: { select: { id: true, email: true, firstName: true, lastName: true } },
        order_items: true,
        order_fulfillments: { orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.orders.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
  ]);

  let totalRevenue = 0;
  let processingCount = 0;
  let shippedCount = 0;
  let deliveredCount = 0;
  let cancelledCount = 0;

  allMetrics.forEach((g) => {
    const sum = Number(g._sum.totalAmount || 0);
    totalRevenue += sum;
    if (g.status === OrderStatus.PROCESSING || g.status === OrderStatus.CONFIRMED || g.status === OrderStatus.PENDING) {
      processingCount += g._count.id;
    } else if (g.status === OrderStatus.SHIPPED) {
      shippedCount += g._count.id;
    } else if (g.status === OrderStatus.DELIVERED) {
      deliveredCount += g._count.id;
    } else if (g.status === OrderStatus.CANCELLED) {
      cancelledCount += g._count.id;
    }
  });

  return {
    orders: orders.map(formatOrderItemSummary),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
    summary: {
      totalOrders: total,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
    },
  };
};

export const getOrderById = async (idOrNumber: string): Promise<AdminOrderDetailDTO> => {
  const order = await prisma.orders.findFirst({
    where: {
      OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
    },
    include: {
      users: { select: { id: true, email: true, firstName: true, lastName: true } },
      order_items: true,
      order_fulfillments: { orderBy: { createdAt: 'desc' } },
      order_notes: { orderBy: { createdAt: 'desc' } },
      refund_records: { orderBy: { createdAt: 'desc' } },
      attributed_affiliate: true,
      payment_transactions: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!order) {
    throw new OrderServiceError(`Order '${idOrNumber}' not found`, 404);
  }

  return formatOrderDetail(order);
};

export const updateOrderStatus = async (
  idOrNumber: string,
  input: UpdateOrderStatusDTO
): Promise<AdminOrderDetailDTO> => {
  const order = await prisma.orders.findFirst({
    where: { OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }] },
  });

  if (!order) {
    throw new OrderServiceError(`Order '${idOrNumber}' not found`, 404);
  }

  await prisma.orders.update({
    where: { id: order.id },
    data: {
      status: input.status,
      updatedAt: new Date(),
    },
  });

  if (input.notes) {
    await prisma.order_notes.create({
      data: {
        id: crypto.randomUUID(),
        orderId: order.id,
        authorRole: 'ADMIN',
        note: input.notes,
        isCustomerVisible: false,
      },
    });
  }

  return getOrderById(order.id);
};

export const createOrUpdateFulfillment = async (
  idOrNumber: string,
  input: CreateFulfillmentDTO
): Promise<AdminOrderDetailDTO> => {
  const order = await prisma.orders.findFirst({
    where: { OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }] },
    include: { order_fulfillments: true },
  });

  if (!order) {
    throw new OrderServiceError(`Order '${idOrNumber}' not found`, 404);
  }

  const trackingUrl = input.trackingUrl || generateCarrierTrackingUrl(input.carrier, input.trackingNumber);
  const targetFulfillmentStatus = input.status || FulfillmentStatus.SHIPPED;
  const now = new Date();

  // If order already has an unfulfilled or processing fulfillment record, update it.
  const existingFulfillment = order.order_fulfillments[0];

  if (existingFulfillment) {
    await prisma.order_fulfillments.update({
      where: { id: existingFulfillment.id },
      data: {
        status: targetFulfillmentStatus,
        trackingCompany: input.carrier,
        trackingNumber: input.trackingNumber || existingFulfillment.trackingNumber,
        trackingUrl: trackingUrl || existingFulfillment.trackingUrl,
        notes: input.notes !== undefined ? input.notes : existingFulfillment.notes,
        shippedAt: targetFulfillmentStatus === FulfillmentStatus.SHIPPED ? now : existingFulfillment.shippedAt,
        deliveredAt: targetFulfillmentStatus === FulfillmentStatus.DELIVERED ? now : existingFulfillment.deliveredAt,
        updatedAt: now,
      },
    });
  } else {
    await prisma.order_fulfillments.create({
      data: {
        id: crypto.randomUUID(),
        orderId: order.id,
        status: targetFulfillmentStatus,
        trackingCompany: input.carrier,
        trackingNumber: input.trackingNumber,
        trackingUrl,
        notes: input.notes,
        shippedAt: targetFulfillmentStatus === FulfillmentStatus.SHIPPED ? now : null,
        deliveredAt: targetFulfillmentStatus === FulfillmentStatus.DELIVERED ? now : null,
        updatedAt: now,
      },
    });
  }

  // Update order status: If marked SHIPPED, update order status to SHIPPED; if DELIVERED, update to DELIVERED
  const newOrderStatus =
    targetFulfillmentStatus === FulfillmentStatus.DELIVERED
      ? OrderStatus.DELIVERED
      : OrderStatus.SHIPPED;

  await prisma.orders.update({
    where: { id: order.id },
    data: {
      status: newOrderStatus,
      updatedAt: now,
    },
  });

  return getOrderById(order.id);
};

export const addOrderNote = async (
  idOrNumber: string,
  authorId: string | null,
  authorRole: string,
  input: CreateOrderNoteDTO
): Promise<OrderNoteDTO> => {
  const order = await prisma.orders.findFirst({
    where: { OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }] },
  });

  if (!order) {
    throw new OrderServiceError(`Order '${idOrNumber}' not found`, 404);
  }

  const note = await prisma.order_notes.create({
    data: {
      id: crypto.randomUUID(),
      orderId: order.id,
      authorId: authorId || undefined,
      authorRole,
      note: input.note,
      isCustomerVisible: Boolean(input.isCustomerVisible),
    },
  });

  return {
    id: note.id,
    authorId: note.authorId,
    authorRole: note.authorRole,
    note: note.note,
    isCustomerVisible: note.isCustomerVisible,
    createdAt: note.createdAt.toISOString(),
  };
};

export const processOrderRefund = async (
  idOrNumber: string,
  input: ProcessOrderRefundDTO,
  processedBy = 'Admin Operations'
): Promise<{ order: AdminOrderDetailDTO; refund: OrderRefundDTO }> => {
  const order = await prisma.orders.findFirst({
    where: { OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }] },
    include: {
      order_items: true,
      refund_records: true,
    },
  });

  if (!order) {
    throw new OrderServiceError(`Order '${idOrNumber}' not found`, 404);
  }

  const orderTotal = Number(order.totalAmount);
  const alreadyRefunded = (order.refund_records || []).reduce(
    (sum, r) => sum + Number(r.amount),
    0
  );
  const remainingRefundable = Math.max(0, Number((orderTotal - alreadyRefunded).toFixed(2)));

  if (input.amount <= 0) {
    throw new OrderServiceError('Refund amount must be greater than zero.', 400);
  }

  if (input.amount > remainingRefundable + 0.001) {
    throw new OrderServiceError(
      `Refund amount of $${input.amount.toFixed(2)} exceeds remaining refundable balance of $${remainingRefundable.toFixed(2)}.`,
      400
    );
  }

  const refundRecordId = crypto.randomUUID();
  const now = new Date();

  const refund = await prisma.refund_records.create({
    data: {
      id: refundRecordId,
      orderId: order.id,
      amount: new Prisma.Decimal(input.amount),
      currency: order.currency || 'USD',
      reason: input.reason || 'Admin processed refund',
      status: 'COMPLETED',
      processedBy,
    },
  });

  const totalRefundedAfter = alreadyRefunded + input.amount;
  const isFullRefund = totalRefundedAfter >= orderTotal - 0.001;

  const newPaymentStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
  const newOrderStatus = isFullRefund ? OrderStatus.CANCELLED : order.status;

  await prisma.orders.update({
    where: { id: order.id },
    data: {
      paymentStatus: newPaymentStatus,
      status: newOrderStatus,
      updatedAt: now,
    },
  });

   
  if (input.restockInventory && isFullRefund) {
    for (const item of order.order_items) {
      if (item.productId) {
        const prod = await prisma.products.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
        await prisma.inventory_logs.create({
          data: {
            id: crypto.randomUUID(),
            productId: item.productId,
            changeQty: item.quantity,
            previousQty: prod.stock - item.quantity,
            newQty: prod.stock,
            reason: `Order #${order.orderNumber} refund restock`,
            createdBy: processedBy,
          },
        });
      }
    }
  }

  // Offset affiliate commissions via the commission service reversal engine
  await processOrderRefundCommission(order.id, input.amount, isFullRefund, input.reason).catch(
    (err) => console.warn(`[orders] Commission refund reversal note: ${err?.message}`)
  );

  const updatedOrder = await getOrderById(order.id);

  return {
    order: updatedOrder,
    refund: {
      id: refund.id,
      amount: Number(refund.amount),
      currency: refund.currency,
      reason: refund.reason,
      status: refund.status,
      processedBy: refund.processedBy,
      createdAt: refund.createdAt.toISOString(),
    },
  };
};

// customer order operation 
export const getCustomerOrders = async (
  userId: string,
  page = 1,
  limit = 20
) => {
  const skip = (Math.max(1, page) - 1) * limit;

  const [total, orders] = await Promise.all([
    prisma.orders.count({ where: { userId } }),
    prisma.orders.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        order_items: true,
        order_fulfillments: { orderBy: { createdAt: 'desc' } },
      },
    }),
  ]);

  return {
    orders: orders.map(formatOrderItemSummary),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getCustomerOrderById = async (
  idOrNumber: string,
  userId: string
): Promise<AdminOrderDetailDTO> => {
  const order = await prisma.orders.findFirst({
    where: {
      userId,
      OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
    },
    include: {
      users: { select: { id: true, email: true, firstName: true, lastName: true } },
      order_items: true,
      order_fulfillments: { orderBy: { createdAt: 'desc' } },
      order_notes: {
        where: { isCustomerVisible: true },
        orderBy: { createdAt: 'desc' },
      },
      refund_records: { orderBy: { createdAt: 'desc' } },
      attributed_affiliate: true,
      payment_transactions: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!order) {
    throw new OrderServiceError(`Order '${idOrNumber}' not found`, 404);
  }

  return formatOrderDetail(order);
};

export const orderService = {
  listOrders,
  getOrderById,
  updateOrderStatus,
  createOrUpdateFulfillment,
  addOrderNote,
  processOrderRefund,
  getCustomerOrders,
  getCustomerOrderById,
  formatOrderItemSummary,
  formatOrderDetail,
};
