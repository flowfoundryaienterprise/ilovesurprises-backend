import { z } from 'zod';

export const updateShowcaseCardSchema = z.object({
  params: z.object({
    cardKey: z.string().min(1, { message: 'Card key or ID is required' }),
  }),
  body: z.object({
    displayTitle: z.string().trim().min(1, { message: 'Display title is required' }).optional(),
    highlightBadge: z.string().trim().min(1, { message: 'Highlight badge is required' }).optional(),
    tagline: z.string().trim().optional(),
    ctaButtonText: z.string().trim().optional(),
    targetCategoryKey: z.string().trim().optional(),
    showcaseImageUri: z.string().trim().url({ message: 'Valid image URI is required' }).optional(),
    displayOnHomepage: z.boolean().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const updateStorefrontBannersSchema = z.object({
  body: z.object({
    topStickyAnnouncementBar: z
      .object({
        isActive: z.boolean().optional(),
        announcementCopy: z.string().trim().optional(),
      })
      .optional(),
    promotionalDiscountAlertBar: z
      .object({
        isActive: z.boolean().optional(),
        promoCopy: z.string().trim().optional(),
        promoCode: z.string().trim().optional(),
      })
      .optional(),
  }),
});
