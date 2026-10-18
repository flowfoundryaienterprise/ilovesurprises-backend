import { z } from 'zod';

export const listAppraisalsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
    search: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    section: z.string().optional(),
    tab: z.string().optional(),
  }),
});

export const createAppraisalSchema = z.object({
  body: z.object({
    appraisalCode: z.string().optional(),
    code: z.string().optional(),
    estimatedValue: z.number().min(0, 'Estimated value must be non-negative'),
    appraisedValue: z.number().min(0).optional(),
    jewelryName: z.string().optional(),
    name: z.string().optional(),
    jewelryType: z.string().optional(),
    type: z.string().optional(),
    metalType: z.string().optional(),
    material: z.string().optional(),
    gemstoneType: z.string().optional(),
    stone: z.string().optional(),
    cutSetting: z.string().optional(),
    jewelryImagePreset: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    customerName: z.string().optional(),
    customerEmail: z.string().optional(),
    customerPhone: z.string().optional(),
    orderNumber: z.string().optional(),
    orderId: z.string().optional(),
    sourceProduct: z.string().optional(),
    productName: z.string().optional(),
    productId: z.string().optional(),
    description: z.string().optional(),
    artisanDescription: z.string().optional(),
    status: z.string().optional(),
    serialNumber: z.string().optional(),
    certificateNumber: z.string().optional(),
    inspectedDate: z.string().optional(),
    notes: z.string().optional(),
  }).refine((data) => Boolean(data.appraisalCode || data.code), {
    message: 'Jewelry code is required',
    path: ['code'],
  }),
});

export const updateAppraisalSchema = z.object({
  body: z.object({
    appraisalCode: z.string().optional(),
    code: z.string().optional(),
    estimatedValue: z.number().min(0).optional(),
    appraisedValue: z.number().min(0).optional(),
    jewelryName: z.string().optional(),
    name: z.string().optional(),
    jewelryType: z.string().optional(),
    type: z.string().optional(),
    metalType: z.string().optional(),
    material: z.string().optional(),
    gemstoneType: z.string().optional(),
    stone: z.string().optional(),
    cutSetting: z.string().optional(),
    jewelryImagePreset: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    customerName: z.string().optional(),
    customerEmail: z.string().optional(),
    customerPhone: z.string().optional(),
    orderNumber: z.string().optional(),
    orderId: z.string().optional(),
    sourceProduct: z.string().optional(),
    productName: z.string().optional(),
    productId: z.string().optional(),
    description: z.string().optional(),
    artisanDescription: z.string().optional(),
    status: z.string().optional(),
    serialNumber: z.string().optional(),
    certificateNumber: z.string().optional(),
    inspectedDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const submitCustomerAppraisalSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    customerEmail: z.string().email('Valid customer email is required'),
    customerPhone: z.string().optional(),
    orderNumber: z.string().optional(),
    productName: z.string().min(1, 'Product name is required'),
    jewelryType: z.string().default('Ring'),
    metalType: z.string().optional(),
    gemstoneType: z.string().optional(),
    codeInfo: z.string().optional(),
    photoPreviews: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    notes: z.string().optional(),
    estimatedValue: z.number().optional(),
  }),
});

export const updateCustomerSubmissionSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'reviewed', 'approved', 'rejected', 'SUBMITTED', 'PENDING', 'REVIEWED', 'APPROVED', 'REJECTED']).optional(),
    notes: z.string().optional(),
    appraiserNotes: z.string().optional(),
    estimatedValue: z.number().min(0).optional(),
    appraisedValue: z.number().min(0).optional(),
  }),
});

export const lookupAppraisalCodeSchema = z.object({
  params: z.object({
    code: z.string().min(1, 'Appraisal code is required'),
  }),
});
