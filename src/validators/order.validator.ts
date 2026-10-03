import { z } from 'zod';
import { OrderStatus, PaymentStatus, PaymentMethod, FulfillmentStatus } from '@prisma/client';

export const checkoutSchema = z.object({
  body: z.object({
    shippingAddressId: z.string().trim().optional(),
    shippingAddress: z
      .object({
        firstName: z.string().trim().min(1, 'First name is required'),
        lastName: z.string().trim().min(1, 'Last name is required'),
        phone: z.string().trim().min(1, 'Phone is required'),
        addressLine1: z.string().trim().min(1, 'Address line 1 is required'),
        addressLine2: z.string().trim().optional().nullable(),
        city: z.string().trim().min(1, 'City is required'),
        state: z.string().trim().min(1, 'State is required'),
        postalCode: z.string().trim().min(1, 'Postal code is required'),
        country: z.string().trim().default('US'),
      })
      .optional(),
    items: z
      .array(
        z.object({
          productId: z.string().trim().min(1),
          variantId: z.string().trim().optional().nullable(),
          quantity: z.number().int().positive().default(1),
          selectedRingSize: z.string().trim().optional().nullable(),
          selectedScent: z.string().trim().optional().nullable(),
          customNote: z.string().trim().optional().nullable(),
        })
      )
      .optional(),
    promoCode: z.string().trim().optional().nullable(),
    attributedRep: z.any().optional(),
    customerNote: z.string().trim().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Order ID is required'),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Order ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      message: 'Invalid order status',
    }),
    note: z.string().trim().optional(),
  }),
});

export const updateFulfillmentSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Order ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(FulfillmentStatus, {
      message: 'Invalid fulfillment status',
    }),
    trackingCompany: z.string().trim().optional().nullable(),
    trackingNumber: z.string().trim().optional().nullable(),
    trackingUrl: z.string().trim().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
  }),
});

export const createOrderNoteSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Order ID is required'),
  }),
  body: z.object({
    note: z.string().trim().min(1, 'Note content is required'),
    isCustomerVisible: z.boolean().optional().default(false),
  }),
});

export const listOrdersQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});
