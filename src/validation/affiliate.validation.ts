import { z } from 'zod';

export const registerAffiliateSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, { message: 'Username must be at least 3 characters' })
      .max(30, { message: 'Username must be at most 30 characters' })
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        { message: 'Username can only contain alphanumeric characters, underscores, and hyphens' }
      ),
    sponsorCodeOrId: z.string().trim().optional(),
    payoutMethod: z.string().trim().optional(),
    payoutDetails: z.record(z.string(), z.any()).optional(),
  }),
});

export const listAffiliateLedgerSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    status: z.enum(['pending', 'available', 'paid', 'hold', 'void', 'reversed']).optional(),
  }),
});
