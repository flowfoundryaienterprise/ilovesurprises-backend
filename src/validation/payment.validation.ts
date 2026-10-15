import { z } from 'zod';

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1, { message: 'Full name is required' }).max(120),
  email: z.string().trim().email({ message: 'A valid email is required' }),
  phone: z.string().trim().min(1, { message: 'Phone is required' }).max(40),
  addressLine1: z.string().trim().min(1, { message: 'Address is required' }).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, { message: 'City is required' }).max(100),
  state: z.string().trim().min(1, { message: 'State is required' }).max(100),
  zipCode: z.string().trim().min(1, { message: 'ZIP code is required' }).max(20),
  country: z.string().trim().min(1, { message: 'Country is required' }).max(100),
});

// Only identifiers and quantities are accepted; prices are always read from
// the database.
export const createCheckoutSchema = z.object({
  body: z.object({
    paymentMethod: z.enum(['card', 'apple_pay', 'google_pay', 'paypal', 'cod']),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().positive().max(99),
          selectedRingSize: z.string().trim().max(20).optional(),
          selectedSurpriseOption: z.string().trim().max(200).optional(),
        })
      )
      .min(1, { message: 'Your bag is empty' })
      .max(50),
    shippingAddress: shippingAddressSchema,
    deliveryMethodId: z.enum(['standard', 'express']).default('standard'),
    promoCode: z.string().trim().max(50).optional(),
    repUsername: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(500).optional(),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({ orderId: z.string().min(1) }),
});
