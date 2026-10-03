import { z } from 'zod';

export const registerAffiliateSchema = z.object({
  body: z.object({
    sponsorCode: z.string().trim().optional(),
    customSlug: z.string().trim().regex(/^[a-zA-Z0-9_-]+$/, 'Custom slug must be alphanumeric').optional(),
    payoutMethod: z.enum(['PAYPAL', 'STRIPE', 'BANK']).optional(),
    payoutDetails: z.record(z.string(), z.any()).optional(),
  }),
});

export const trackVisitSchema = z.object({
  body: z.object({
    referralCode: z.string().trim().min(1, 'Referral code is required'),
    landingPage: z.string().trim().optional(),
    referrerUrl: z.string().trim().optional(),
  }),
});

export const createPayoutRequestSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    payoutMethod: z.enum(['PAYPAL', 'STRIPE', 'BANK']),
    accountDetails: z.record(z.string(), z.any()),
  }),
});

export const updatePayoutStatusSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Payout ID is required'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED']),
    referenceId: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  }),
});

export const updateAffiliateStatusSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Affiliate ID is required'),
  }),
  body: z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING']),
  }),
});
