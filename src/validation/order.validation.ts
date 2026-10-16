import { z } from 'zod';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';

export const listOrdersSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 20)) : 20)),
    search: z.string().trim().optional(),
    status: z.string().trim().optional(),
    paymentStatus: z.string().trim().optional(),
    customerId: z.string().trim().optional(),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    sortBy: z.enum(['createdAt', 'totalAmount', 'orderNumber', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Order ID or Order Number is required'),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Order ID is required'),
  }),
  body: z.object({
    status: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.nativeEnum(OrderStatus, {
        message: 'Invalid status. Must be PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, or CANCELLED',
      })
    ),
    notes: z.string().trim().optional(),
  }),
});

export const createFulfillmentSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Order ID is required'),
  }),
  body: z.object({
    carrier: z.string().trim().min(1, 'Carrier is required (e.g. USPS, UPS, FedEx, DHL)'),
    trackingNumber: z.string().trim().optional(),
    trackingUrl: z.string().trim().optional(),
    status: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.nativeEnum(FulfillmentStatus).optional()
    ),
    notes: z.string().trim().optional(),
  }),
});

export const createOrderNoteSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Order ID is required'),
  }),
  body: z.object({
    note: z.string().trim().min(1, 'Note content cannot be empty'),
    isCustomerVisible: z.boolean().optional().default(false),
  }),
});

export const processOrderRefundSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Order ID is required'),
  }),
  body: z.object({
    amount: z.number().positive('Refund amount must be positive'),
    reason: z.string().trim().optional().default('Customer return or cancellation requested'),
    restockInventory: z.boolean().optional().default(true),
  }),
});
