import { z } from 'zod';

export const updateHeroSchema = z.object({
  body: z.object({
    desktopBannerImage: z.string().trim().optional(),
    mobileBannerImage: z.string().trim().optional(),
    headline: z.string().trim().optional(),
    subheadline: z.string().trim().optional(),
    benefitTiles: z
      .array(
        z.object({
          id: z.string(),
          title: z.string().trim().min(1),
          subtitle: z.string().trim().optional().default(''),
          iconName: z.string().trim().optional(),
          actionType: z.string().trim().optional(),
          sortOrder: z.number().int().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .optional(),
  }),
});

export const createBenefitTileSchema = z.object({
  body: z.object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(1, { message: 'Title is required' }),
    subtitle: z.string().trim().min(1, { message: 'Subtitle is required' }),
    iconName: z.string().trim().optional().default('Gem'),
    actionType: z.string().trim().optional().default('shop'),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateBenefitTileSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Tile ID is required' }),
  }),
  body: z.object({
    title: z.string().trim().min(1).optional(),
    subtitle: z.string().trim().optional(),
    iconName: z.string().trim().optional(),
    actionType: z.string().trim().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createShowcaseCardSchema = z.object({
  body: z.object({
    id: z.string().trim().optional(),
    cardKey: z.string().trim().min(1, { message: 'Card key is required' }),
    displayTitle: z.string().trim().optional(),
    title: z.string().trim().optional(),
    highlightBadge: z.string().trim().optional(),
    badge: z.string().trim().optional(),
    tagline: z.string().trim().optional(),
    ctaButtonText: z.string().trim().optional(),
    ctaText: z.string().trim().optional(),
    targetCategoryKey: z.string().trim().optional(),
    categoryKey: z.string().trim().optional(),
    showcaseImageUri: z.string().trim().optional(),
    image: z.string().trim().optional(),
    displayOnHomepage: z.boolean().optional(),
    isActive: z.boolean().optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    itemCount: z.number().int().optional(),
    accentBorder: z.string().trim().optional(),
  }),
});

export const updateShowcaseCardSchema = z.object({
  params: z.object({
    cardKey: z.string().min(1, { message: 'Card key or ID is required' }),
  }),
  body: z.object({
    displayTitle: z.string().trim().optional(),
    title: z.string().trim().optional(),
    highlightBadge: z.string().trim().optional(),
    badge: z.string().trim().optional(),
    tagline: z.string().trim().optional(),
    ctaButtonText: z.string().trim().optional(),
    ctaText: z.string().trim().optional(),
    targetCategoryKey: z.string().trim().optional(),
    categoryKey: z.string().trim().optional(),
    showcaseImageUri: z.string().trim().optional(),
    image: z.string().trim().optional(),
    displayOnHomepage: z.boolean().optional(),
    isActive: z.boolean().optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    itemCount: z.number().int().optional(),
    accentBorder: z.string().trim().optional(),
  }),
});

export const updateStorefrontBannersSchema = z.object({
  body: z.object({
    topStickyAnnouncementBar: z
      .object({
        isActive: z.boolean().optional(),
        announcementCopy: z.string().trim().optional(),
        announcementLink: z.string().trim().optional(),
      })
      .optional(),
    promotionalDiscountAlertBar: z
      .object({
        isActive: z.boolean().optional(),
        promoCopy: z.string().trim().optional(),
        promoCode: z.string().trim().optional(),
      })
      .optional(),
    announcementText: z.string().trim().optional(),
    announcementActive: z.boolean().optional(),
    announcementLink: z.string().trim().optional(),
    promoBannerText: z.string().trim().optional(),
    promoBannerCode: z.string().trim().optional(),
    promoBannerActive: z.boolean().optional(),
  }),
});

export const updateValuePropositionSchema = z.object({
  body: z.object({
    eyebrow: z.string().trim().optional(),
    title: z.string().trim().optional(),
    description: z.string().trim().optional(),
    points: z.array(z.string().trim()).optional(),
  }),
});

export const updateAboutContentSchema = z.object({
  body: z.object({
    badge: z.string().trim().optional(),
    headline: z.string().trim().optional(),
    storyText: z.string().trim().optional(),
    naturalSoyStat: z.string().trim().optional(),
    unboxingsStat: z.string().trim().optional(),
    realCashStat: z.string().trim().optional(),
  }),
});

export const createFaqSchema = z.object({
  body: z.object({
    id: z.string().trim().optional(),
    question: z.string().trim().min(1, { message: 'Question is required' }),
    answer: z.string().trim().min(1, { message: 'Answer is required' }),
    category: z.string().trim().optional().default('General'),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateFaqSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'FAQ ID is required' }),
  }),
  body: z.object({
    question: z.string().trim().min(1).optional(),
    answer: z.string().trim().min(1).optional(),
    category: z.string().trim().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateFooterSchema = z.object({
  body: z.object({
    newsletterTitle: z.string().trim().optional(),
    newsletterSubtitle: z.string().trim().optional(),
    copyrightText: z.string().trim().optional(),
    supportEmail: z.string().trim().optional(),
    supportPhone: z.string().trim().optional(),
    guaranteeText: z.string().trim().optional(),
  }),
});

export const updateFullStorefrontSchema = z.object({
  body: z.object({
    announcementText: z.string().trim().optional(),
    announcementActive: z.boolean().optional(),
    announcementLink: z.string().trim().optional(),
    promoBannerText: z.string().trim().optional(),
    promoBannerCode: z.string().trim().optional(),
    promoBannerActive: z.boolean().optional(),
    banners: z.any().optional(),
    featuredCards: z.array(z.any()).optional(),
    showcaseCards: z.array(z.any()).optional(),
    hero: z.any().optional(),
    valueProposition: z.any().optional(),
    aboutContent: z.any().optional(),
    faqItems: z.array(z.any()).optional(),
    footerContent: z.any().optional(),
  }),
});
