import { z } from 'zod';

export const createAppraisalSchema = z.object({
  body: z.object({
    customerName: z.string().trim().min(1, 'Customer name is required'),
    customerEmail: z.string().trim().email('Invalid email address'),
    customerPhone: z.string().trim().optional(),
    jewelryType: z.string().trim().min(1, 'Jewelry type is required'),
    metalType: z.string().trim().optional(),
    gemstoneType: z.string().trim().optional(),
    description: z.string().trim().optional(),
    images: z.array(z.string()).default([]),
    estimatedValue: z.number().positive().optional(),
  }),
});

export const updateAppraisalAdminSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Appraisal ID is required'),
  }),
  body: z.object({
    appraisedValue: z.number().positive().optional(),
    appraiserNotes: z.string().trim().optional(),
    certificateNumber: z.string().trim().optional(),
    status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'APPRAISED', 'REJECTED']),
  }),
});
