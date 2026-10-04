import { prisma } from '../lib/prisma';
import {
  ShowcaseCardDTO,
  StorewideBannersDTO,
  StorefrontConfigDTO,
  UpdateShowcaseCardDTO,
  UpdateStorefrontBannersDTO,
} from '../types/storefront.types';

export const DEFAULT_SHOWCASE_CARDS: readonly ShowcaseCardDTO[] = [
  {
    id: 'showcase-halloween',
    cardKey: 'halloween',
    displayTitle: 'Halloween',
    highlightBadge: 'Holiday Priority',
    tagline: 'Limited-edition Halloween reveal candles & bath treats with cash and jewelry inside',
    ctaButtonText: 'Shop Halloween Collection',
    targetCategoryKey: 'Halloween',
    showcaseImageUri: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Halloween.png',
    displayOnHomepage: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'showcase-christmas-x',
    cardKey: 'christmas-x',
    displayTitle: 'Christmas X',
    highlightBadge: 'Holiday Priority',
    tagline: 'Festive holiday priority reveal candles featuring certified diamond and cash surprises',
    ctaButtonText: 'Shop Christmas Collection',
    targetCategoryKey: 'Christmas',
    showcaseImageUri: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Christmas.png',
    displayOnHomepage: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'showcase-cash-candles',
    cardKey: 'cash-candles',
    displayTitle: 'Cash Candles',
    highlightBadge: 'Win Up To $2,500',
    tagline: 'Every single candle holds real cash inside from $2 up to $2,500 cold hard cash',
    ctaButtonText: 'Shop Cash Candles',
    targetCategoryKey: 'Cash Candles',
    showcaseImageUri: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Cash.png',
    displayOnHomepage: true,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'showcase-zodiac-cash-candles',
    cardKey: 'zodiac-cash-candles',
    displayTitle: 'Zodiac Cash Candles',
    highlightBadge: 'Real Cash Inside',
    tagline: 'Astrology-inspired surprise candles personalized to your celestial birth sign with real cash inside',
    ctaButtonText: 'Shop Zodiac Collection',
    targetCategoryKey: 'Zodiac',
    showcaseImageUri: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Zodiac.png',
    displayOnHomepage: true,
    isActive: true,
    sortOrder: 4,
  },
];

export const DEFAULT_BANNERS: StorewideBannersDTO = {
  topStickyAnnouncementBar: {
    isActive: true,
    announcementCopy: '⚡ FREE SHIPPING ON SURPRISE CANDLE ORDERS OVER $50 + REAL CASH PRIZES IN EVERY CANDLE!',
  },
  promotionalDiscountAlertBar: {
    isActive: true,
    promoCopy: 'Use code SURPRISE15 at checkout for 15% OFF your first surprise candle reveal!',
    promoCode: 'SURPRISE15',
  },
};

// Module-level closure state
let showcaseCardsCache: ShowcaseCardDTO[] = JSON.parse(JSON.stringify(DEFAULT_SHOWCASE_CARDS));
let bannersCache: StorewideBannersDTO = JSON.parse(JSON.stringify(DEFAULT_BANNERS));
let isInitialized = false;

const persistAllToDb = async (): Promise<void> => {
  try {
    for (const card of showcaseCardsCache) {
      const metadata = JSON.stringify({
        highlightBadge: card.highlightBadge,
        ctaButtonText: card.ctaButtonText,
        targetCategoryKey: card.targetCategoryKey,
        displayOnHomepage: card.displayOnHomepage,
      });

      await prisma.cms_banners.upsert({
        where: { id: card.id },
        create: {
          id: card.id,
          title: card.displayTitle,
          subtitle: card.tagline,
          imageUrl: card.showcaseImageUri,
          linkUrl: metadata,
          position: 'SHOWCASE_CARD',
          isActive: card.isActive,
          sortOrder: card.sortOrder,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          title: card.displayTitle,
          subtitle: card.tagline,
          imageUrl: card.showcaseImageUri,
          linkUrl: metadata,
          isActive: card.isActive,
          sortOrder: card.sortOrder,
          updatedAt: new Date(),
        },
      });
    }

    await prisma.cms_banners.upsert({
      where: { id: 'banner-top-sticky' },
      create: {
        id: 'banner-top-sticky',
        title: bannersCache.topStickyAnnouncementBar.announcementCopy,
        imageUrl: '',
        position: 'TOP_STICKY_ANNOUNCEMENT',
        isActive: bannersCache.topStickyAnnouncementBar.isActive,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: bannersCache.topStickyAnnouncementBar.announcementCopy,
        isActive: bannersCache.topStickyAnnouncementBar.isActive,
        updatedAt: new Date(),
      },
    });

    await prisma.cms_banners.upsert({
      where: { id: 'banner-promo-alert' },
      create: {
        id: 'banner-promo-alert',
        title: bannersCache.promotionalDiscountAlertBar.promoCopy,
        subtitle: bannersCache.promotionalDiscountAlertBar.promoCode,
        imageUrl: '',
        position: 'PROMO_DISCOUNT_ALERT',
        isActive: bannersCache.promotionalDiscountAlertBar.isActive,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: bannersCache.promotionalDiscountAlertBar.promoCopy,
        subtitle: bannersCache.promotionalDiscountAlertBar.promoCode,
        isActive: bannersCache.promotionalDiscountAlertBar.isActive,
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed persisting storefront to database:', err.message);
  }
};

const ensureInitialized = async (): Promise<void> => {
  if (isInitialized) return;

  try {
    const dbBanners = await prisma.cms_banners.findMany({
      where: {
        position: {
          in: ['SHOWCASE_CARD', 'TOP_STICKY_ANNOUNCEMENT', 'PROMO_DISCOUNT_ALERT'],
        },
      },
    });

    if (dbBanners.length > 0) {
      const showcaseInDb = dbBanners.filter((b) => b.position === 'SHOWCASE_CARD');
      if (showcaseInDb.length > 0) {
        showcaseCardsCache = showcaseCardsCache.map((card) => {
          const matched = showcaseInDb.find((b) => b.id === card.id || b.id === `showcase-${card.cardKey}`);
          if (!matched) return card;
          let meta: any = {};
          try {
            if (matched.linkUrl) meta = JSON.parse(matched.linkUrl);
          } catch {
            // ignore JSON error
          }

          return {
            ...card,
            displayTitle: matched.title || card.displayTitle,
            tagline: matched.subtitle || card.tagline,
            showcaseImageUri: matched.imageUrl || card.showcaseImageUri,
            isActive: matched.isActive,
            sortOrder: matched.sortOrder ?? card.sortOrder,
            highlightBadge: meta.highlightBadge || card.highlightBadge,
            ctaButtonText: meta.ctaButtonText || card.ctaButtonText,
            targetCategoryKey: meta.targetCategoryKey || card.targetCategoryKey,
            displayOnHomepage: meta.displayOnHomepage !== undefined ? meta.displayOnHomepage : card.displayOnHomepage,
          };
        });
      }

      const topBar = dbBanners.find((b) => b.position === 'TOP_STICKY_ANNOUNCEMENT');
      if (topBar) {
        bannersCache.topStickyAnnouncementBar = {
          isActive: topBar.isActive,
          announcementCopy: topBar.title,
        };
      }

      const promoBar = dbBanners.find((b) => b.position === 'PROMO_DISCOUNT_ALERT');
      if (promoBar) {
        bannersCache.promotionalDiscountAlertBar = {
          isActive: promoBar.isActive,
          promoCopy: promoBar.title,
          promoCode: promoBar.subtitle || 'SURPRISE15',
        };
      }
    } else {
      persistAllToDb().catch((err) => console.warn('Could not sync storefront defaults to DB:', err.message));
    }
  } catch (err: any) {
    console.warn('Storefront DB load error (using in-memory defaults):', err.message);
  }

  isInitialized = true;
};

export const getStorefrontConfig = async (activeOnly = true): Promise<StorefrontConfigDTO> => {
  await ensureInitialized();

  const showcaseCards = activeOnly
    ? showcaseCardsCache.filter((c) => c.isActive && c.displayOnHomepage)
    : showcaseCardsCache;

  return {
    showcaseCards,
    banners: bannersCache,
  };
};

export const getShowcaseCards = async (activeOnly = true): Promise<ShowcaseCardDTO[]> => {
  await ensureInitialized();
  if (activeOnly) {
    return showcaseCardsCache.filter((c) => c.isActive && c.displayOnHomepage);
  }
  return showcaseCardsCache;
};

export const getShowcaseCardByKey = async (cardKey: string): Promise<ShowcaseCardDTO> => {
  await ensureInitialized();
  const card = showcaseCardsCache.find(
    (c) => c.cardKey.toLowerCase() === cardKey.toLowerCase() || c.id.toLowerCase() === cardKey.toLowerCase()
  );

  if (!card) {
    const error: any = new Error(`Showcase card with key "${cardKey}" not found`);
    error.statusCode = 404;
    throw error;
  }

  return card;
};

export const updateShowcaseCard = async (
  cardKey: string,
  data: UpdateShowcaseCardDTO
): Promise<ShowcaseCardDTO> => {
  await ensureInitialized();
  const index = showcaseCardsCache.findIndex(
    (c) => c.cardKey.toLowerCase() === cardKey.toLowerCase() || c.id.toLowerCase() === cardKey.toLowerCase()
  );

  if (index === -1) {
    const error: any = new Error(`Showcase card with key "${cardKey}" not found`);
    error.statusCode = 404;
    throw error;
  }

  const current = showcaseCardsCache[index];
  const updated: ShowcaseCardDTO = {
    ...current,
    ...(data.displayTitle !== undefined && { displayTitle: data.displayTitle }),
    ...(data.highlightBadge !== undefined && { highlightBadge: data.highlightBadge }),
    ...(data.tagline !== undefined && { tagline: data.tagline }),
    ...(data.ctaButtonText !== undefined && { ctaButtonText: data.ctaButtonText }),
    ...(data.targetCategoryKey !== undefined && { targetCategoryKey: data.targetCategoryKey }),
    ...(data.showcaseImageUri !== undefined && { showcaseImageUri: data.showcaseImageUri }),
    ...(data.displayOnHomepage !== undefined && { displayOnHomepage: data.displayOnHomepage }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
    ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    updatedAt: new Date(),
  };

  showcaseCardsCache[index] = updated;

  const metadata = JSON.stringify({
    highlightBadge: updated.highlightBadge,
    ctaButtonText: updated.ctaButtonText,
    targetCategoryKey: updated.targetCategoryKey,
    displayOnHomepage: updated.displayOnHomepage,
  });

  try {
    await prisma.cms_banners.upsert({
      where: { id: updated.id },
      create: {
        id: updated.id,
        title: updated.displayTitle,
        subtitle: updated.tagline,
        imageUrl: updated.showcaseImageUri,
        linkUrl: metadata,
        position: 'SHOWCASE_CARD',
        isActive: updated.isActive,
        sortOrder: updated.sortOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: updated.displayTitle,
        subtitle: updated.tagline,
        imageUrl: updated.showcaseImageUri,
        linkUrl: metadata,
        isActive: updated.isActive,
        sortOrder: updated.sortOrder,
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed saving updated showcase card to DB:', err.message);
  }

  return updated;
};

export const getBanners = async (): Promise<StorewideBannersDTO> => {
  await ensureInitialized();
  return bannersCache;
};

export const updateBanners = async (data: UpdateStorefrontBannersDTO): Promise<StorewideBannersDTO> => {
  await ensureInitialized();

  if (data.topStickyAnnouncementBar) {
    bannersCache.topStickyAnnouncementBar = {
      ...bannersCache.topStickyAnnouncementBar,
      ...data.topStickyAnnouncementBar,
    };

    try {
      await prisma.cms_banners.upsert({
        where: { id: 'banner-top-sticky' },
        create: {
          id: 'banner-top-sticky',
          title: bannersCache.topStickyAnnouncementBar.announcementCopy,
          imageUrl: '',
          position: 'TOP_STICKY_ANNOUNCEMENT',
          isActive: bannersCache.topStickyAnnouncementBar.isActive,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          title: bannersCache.topStickyAnnouncementBar.announcementCopy,
          isActive: bannersCache.topStickyAnnouncementBar.isActive,
          updatedAt: new Date(),
        },
      });
    } catch (err: any) {
      console.warn('Failed saving top sticky banner to DB:', err.message);
    }
  }

  if (data.promotionalDiscountAlertBar) {
    bannersCache.promotionalDiscountAlertBar = {
      ...bannersCache.promotionalDiscountAlertBar,
      ...data.promotionalDiscountAlertBar,
    };

    try {
      await prisma.cms_banners.upsert({
        where: { id: 'banner-promo-alert' },
        create: {
          id: 'banner-promo-alert',
          title: bannersCache.promotionalDiscountAlertBar.promoCopy,
          subtitle: bannersCache.promotionalDiscountAlertBar.promoCode,
          imageUrl: '',
          position: 'PROMO_DISCOUNT_ALERT',
          isActive: bannersCache.promotionalDiscountAlertBar.isActive,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          title: bannersCache.promotionalDiscountAlertBar.promoCopy,
          subtitle: bannersCache.promotionalDiscountAlertBar.promoCode,
          isActive: bannersCache.promotionalDiscountAlertBar.isActive,
          updatedAt: new Date(),
        },
      });
    } catch (err: any) {
      console.warn('Failed saving promo alert bar to DB:', err.message);
    }
  }

  return bannersCache;
};

// Backward compatibility object export
export const storefrontService = {
  getStorefrontConfig,
  getShowcaseCards,
  getShowcaseCardByKey,
  updateShowcaseCard,
  getBanners,
  updateBanners,
};
