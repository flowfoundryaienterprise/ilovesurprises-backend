import { z } from 'zod';

export const analyticsReportSchema = z.object({
  query: z.object({
    timeframe: z.enum(['7D', '30D', '90D', 'YTD']).default('7D'),
  }),
});

export const adminCommissionLedgerSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    status: z.string().trim().optional(),
    tier: z
      .string()
      .optional()
      .transform((val) => (val !== undefined && val !== '' ? parseInt(val, 10) : undefined)),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20)),
  }),
});

export const exportCsvSchema = z.object({
  query: z.object({
    type: z.enum(['sales', 'ledger', 'affiliates']).default('sales'),
  }),
});
