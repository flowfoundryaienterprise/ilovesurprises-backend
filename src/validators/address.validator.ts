import { z } from 'zod';

export const createAddressSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    phone: z.string().trim().min(5, 'Phone number is required'),
    addressLine1: z.string().trim().min(1, 'Address line 1 is required'),
    addressLine2: z.string().trim().optional().nullable(),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().trim().min(1, 'State is required'),
    postalCode: z.string().trim().min(1, 'Postal code is required'),
    country: z.string().trim().min(1, 'Country is required').default('US'),
    isDefault: z.boolean().optional().default(false),
  }),
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Address ID is required'),
  }),
  body: z.object({
    firstName: z.string().trim().min(1, 'First name cannot be empty').optional(),
    lastName: z.string().trim().min(1, 'Last name cannot be empty').optional(),
    phone: z.string().trim().min(5, 'Phone number cannot be empty').optional(),
    addressLine1: z.string().trim().min(1, 'Address line 1 cannot be empty').optional(),
    addressLine2: z.string().trim().optional().nullable(),
    city: z.string().trim().min(1, 'City cannot be empty').optional(),
    state: z.string().trim().min(1, 'State cannot be empty').optional(),
    postalCode: z.string().trim().min(1, 'Postal code cannot be empty').optional(),
    country: z.string().trim().min(1, 'Country cannot be empty').optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const addressIdParamSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Address ID is required'),
  }),
});
