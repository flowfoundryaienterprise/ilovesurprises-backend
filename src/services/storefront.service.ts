import { prisma } from '../lib/prisma';
import {
  ShowcaseCardDTO,
  HomepageFeaturedCardDTO,
  StorewideBannersDTO,
  StorefrontConfigDTO,
  HeroContentConfigDTO,
  HeroBenefitTileDTO,
  ValuePropositionConfigDTO,
  AboutContentConfigDTO,
  FaqContentItemDTO,
  FooterContentConfigDTO,
  UpdateShowcaseCardDTO,
  CreateShowcaseCardDTO,
  UpdateStorefrontBannersDTO,
  UpdateHeroDTO,
  CreateHeroBenefitTileDTO,
  UpdateHeroBenefitTileDTO,
  UpdateValuePropositionDTO,
  UpdateAboutContentDTO,
  CreateFaqItemDTO,
  UpdateFaqItemDTO,
  UpdateFooterContentDTO,
  UpdateFullHomepageContentDTO,
} from '../types/storefront.types';

// ─── DEFAULT SYSTEM VALUES ───────────────────────────────────────────────────

export const DEFAULT_HERO: HeroContentConfigDTO = {
  desktopBannerImage: '/assets/ilovesurprises/banners/New banner.jpeg',
  mobileBannerImage: '/assets/ilovesurprises/banners/mobile-banner.jpg',
  headline: 'ILoveSurprises.com — Discover jewelry, cash, and surprises inside every candle & bath bomb',
  subheadline: 'Handcrafted soy candles and bath treats with authentic real cash and luxury jewelry reveals in every product.',
  benefitTiles: [
    {
      id: 'hidden-jewelry',
      title: 'Hidden Jewelry Reveals',
      subtitle: 'Real jewelry in every product',
      iconName: 'Gem',
      actionType: 'shop',
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 'viral-unboxing',
      title: 'Viral Unboxing Fun',
      subtitle: 'Share, surprise, repeat',
      iconName: 'Gift',
      actionType: 'shop',
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 'start-store',
      title: 'Start Your Store',
      subtitle: 'Your business. Your way.',
      iconName: 'Store',
      actionType: 'consultant',
      sortOrder: 3,
      isActive: true,
    },
    {
      id: 'earn-5-levels',
      title: 'Earn From 5 Levels',
      subtitle: 'Build your team. Grow together.',
      iconName: 'Users',
      actionType: 'consultant',
      sortOrder: 4,
      isActive: true,
    },
  ],
};

export const DEFAULT_SHOWCASE_CARDS: readonly ShowcaseCardDTO[] = [
  {
    id: 'showcase-halloween',
    cardKey: 'halloween',
    displayTitle: 'Halloween',
    title: 'Halloween',
    highlightBadge: 'Holiday Priority',
    badge: 'Holiday Priority',
    tagline: 'Limited-edition Halloween reveal candles & bath treats with cash and jewelry inside',
    ctaButtonText: 'Shop Halloween Collection',
    ctaText: 'Shop Halloween Collection',
    targetCategoryKey: 'Halloween',
    categoryKey: 'Halloween',
    showcaseImageUri: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Halloween.png',
    image: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Halloween.png',
    itemCount: 83,
    accentBorder: 'hover:border-orange-500',
    displayOnHomepage: true,
    isActive: true,
    active: true,
    sortOrder: 1,
  },
  {
    id: 'showcase-christmas-x',
    cardKey: 'christmas-x',
    displayTitle: 'Christmas X',
    title: 'Christmas X',
    highlightBadge: 'Holiday Priority',
    badge: 'Holiday Priority',
    tagline: 'Festive holiday priority reveal candles featuring certified diamond and cash surprises',
    ctaButtonText: 'Shop Christmas Collection',
    ctaText: 'Shop Christmas Collection',
    targetCategoryKey: 'Christmas',
    categoryKey: 'Christmas Candles',
    showcaseImageUri: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Christmas.png',
    image: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Christmas.png',
    itemCount: 98,
    accentBorder: 'hover:border-red-500',
    displayOnHomepage: true,
    isActive: true,
    active: true,
    sortOrder: 2,
  },
  {
    id: 'showcase-cash-candles',
    cardKey: 'cash-candles',
    displayTitle: 'Cash Candles',
    title: 'Cash Candles',
    highlightBadge: 'Win Up To $2,500',
    badge: 'Win Up To $2,500',
    tagline: 'Every single candle holds real cash inside from $2 up to $2,500 cold hard cash',
    ctaButtonText: 'Shop Cash Candles',
    ctaText: 'Shop Cash Candles',
    targetCategoryKey: 'Cash Candles',
    categoryKey: 'Cash Candles',
    showcaseImageUri: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Cash.png',
    image: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Cash.png',
    itemCount: 495,
    accentBorder: 'hover:border-emerald-400',
    displayOnHomepage: true,
    isActive: true,
    active: true,
    sortOrder: 3,
  },
  {
    id: 'showcase-zodiac-cash-candles',
    cardKey: 'zodiac-cash-candles',
    displayTitle: 'Zodiac Cash Candles',
    title: 'Zodiac Cash Candles',
    highlightBadge: 'Real Cash Inside',
    badge: 'Real Cash Inside',
    tagline: 'Astrology-inspired surprise candles personalized to your celestial birth sign with real cash inside',
    ctaButtonText: 'Shop Zodiac Collection',
    ctaText: 'Shop Zodiac Collection',
    targetCategoryKey: 'Zodiac',
    categoryKey: 'ZODIAC CASH MONEY CANDLES',
    showcaseImageUri: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Zodiac.png',
    image: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Zodiac.png',
    itemCount: 12,
    accentBorder: 'hover:border-purple-500',
    displayOnHomepage: true,
    isActive: true,
    active: true,
    sortOrder: 4,
  },
];

export const DEFAULT_BANNERS: StorewideBannersDTO = {
  topStickyAnnouncementBar: {
    isActive: true,
    announcementCopy: '⚡ FREE SHIPPING ON SURPRISE CANDLE ORDERS OVER $50 + REAL CASH PRIZES IN EVERY CANDLE!',
    announcementLink: '/shop',
  },
  promotionalDiscountAlertBar: {
    isActive: true,
    promoCopy: 'Use code SURPRISE15 at checkout for 15% OFF your first surprise candle reveal!',
    promoCode: 'SURPRISE15',
  },
};

export const DEFAULT_VALUE_PROPOSITION: ValuePropositionConfigDTO = {
  eyebrow: '100% Real Reveal Guarantee',
  title: 'Why Customers Love I Love Surprises',
  description: 'Every single hand-poured candle and artisan bath treat conceals an authentic legal tender cash prize ($2 to $2,500) or genuine fine jewelry appraised up to $7,500.',
  points: [
    'Guaranteed genuine cash prizes sealed in protective gold foil',
    'Solid .925 sterling silver & 14k gold rings with verified appraisal tags',
    'Handcrafted with clean, 100% natural USA soy wax',
    'Fast nationwide dispatch with real-time tracking',
  ],
};

export const DEFAULT_ABOUT_CONTENT: AboutContentConfigDTO = {
  badge: 'Our Brand Story & Craftsmanship',
  headline: 'Where Luxury Fragrance Meets the Thrill of Real Surprises',
  storyText: 'Hand-poured 100% natural soy wax candles crafted with artisan care in the USA. Every single candle, bath treat, and wax melt is guaranteed to conceal authentic cash ($2 to $2,500) or luxury fine jewelry (appraised up to $7,500).',
  naturalSoyStat: '100% Natural Soy',
  unboxingsStat: '85,000+ Unboxings',
  realCashStat: '$2 to $2.5K Real Cash',
};

export const DEFAULT_FAQS: FaqContentItemDTO[] = [
  {
    id: 'faq-1',
    question: 'What is I Love Surprises?',
    answer: 'I Love Surprises offers fun products designed around the excitement of discovering a surprise. Depending on the product, the surprise may include jewelry, cash, or another featured reward.',
    category: 'About Surprises',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'faq-2',
    question: 'What kinds of products do you offer?',
    answer: 'Our assortment includes candles, wax melts, bath products, soaps, candy, chocolates, slimes, greeting cards, jewelry, and other surprise products.',
    category: 'Products',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'faq-3',
    question: 'Are the candles soy based?',
    answer: 'Where specified on the product page, our candle products are made with 100% natural soy wax.',
    category: 'Products',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'faq-4',
    question: 'Can I choose my jewelry or ring size?',
    answer: 'Yes! Jewelry surprise products allow you to select ring sizes from 5 to 10 or preferred jewelry styles right on the product page.',
    category: 'Jewelry & Sizing',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'faq-5',
    question: 'How do I check my jewelry appraisal code?',
    answer: 'Visit our Appraisal Verification portal (/appraise) and enter the authentic verification code printed on your jewelry reveal tag to inspect assessed retail value.',
    category: 'Jewelry & Sizing',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'faq-6',
    question: 'Where do you ship and what are rates?',
    answer: 'We ship nationwide across the United States and selected international regions. Orders over $50 enjoy Free Express Shipping.',
    category: 'Shipping & Delivery',
    sortOrder: 6,
    isActive: true,
  },
];

export const DEFAULT_FOOTER: FooterContentConfigDTO = {
  newsletterTitle: 'Unlock 15% Off Your Next Surprise & Weekly Cash Drop Alerts',
  newsletterSubtitle: 'Join over 85,000+ unboxing fans. Be first to know about new limited scents, rare diamond jewelry drops, and grand cash reveals.',
  copyrightText: '© 2026 ILoveSurprises.com. All rights reserved. Hand-poured with love in the USA.',
  supportEmail: 'support@ilovesurprises.com',
  supportPhone: '1-800-SURPRISE',
  guaranteeText: '256-Bit SSL Encrypted Bank-Grade Checkout',
};

// ─── IN-MEMORY STATE CACHE ────────────────────────────────────────────────────

let heroCache: HeroContentConfigDTO = JSON.parse(JSON.stringify(DEFAULT_HERO));
let showcaseCardsCache: ShowcaseCardDTO[] = JSON.parse(JSON.stringify(DEFAULT_SHOWCASE_CARDS));
let bannersCache: StorewideBannersDTO = JSON.parse(JSON.stringify(DEFAULT_BANNERS));
let valuePropositionCache: ValuePropositionConfigDTO = JSON.parse(JSON.stringify(DEFAULT_VALUE_PROPOSITION));
let aboutContentCache: AboutContentConfigDTO = JSON.parse(JSON.stringify(DEFAULT_ABOUT_CONTENT));
let faqsCache: FaqContentItemDTO[] = JSON.parse(JSON.stringify(DEFAULT_FAQS));
let footerCache: FooterContentConfigDTO = JSON.parse(JSON.stringify(DEFAULT_FOOTER));

let isInitialized = false;

// ─── DATABASE PERSISTENCE HELPERS ─────────────────────────────────────────────

const persistAllToDb = async (): Promise<void> => {
  try {
    // 1. Hero Banner
    await prisma.cms_banners.upsert({
      where: { id: 'hero-banner' },
      create: {
        id: 'hero-banner',
        title: heroCache.headline,
        subtitle: heroCache.subheadline || '',
        imageUrl: heroCache.desktopBannerImage,
        linkUrl: heroCache.mobileBannerImage,
        position: 'HERO_BANNER',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: heroCache.headline,
        subtitle: heroCache.subheadline || '',
        imageUrl: heroCache.desktopBannerImage,
        linkUrl: heroCache.mobileBannerImage,
        updatedAt: new Date(),
      },
    });

    // 2. Benefit Tiles
    for (let i = 0; i < heroCache.benefitTiles.length; i++) {
      const tile = heroCache.benefitTiles[i];
      await prisma.cms_banners.upsert({
        where: { id: tile.id },
        create: {
          id: tile.id,
          title: tile.title,
          subtitle: tile.subtitle,
          imageUrl: tile.iconName || 'Gem',
          linkUrl: tile.actionType || 'shop',
          position: 'HERO_BENEFIT_TILE',
          isActive: tile.isActive !== undefined ? tile.isActive : true,
          sortOrder: tile.sortOrder ?? i + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          title: tile.title,
          subtitle: tile.subtitle,
          imageUrl: tile.iconName || 'Gem',
          linkUrl: tile.actionType || 'shop',
          isActive: tile.isActive !== undefined ? tile.isActive : true,
          sortOrder: tile.sortOrder ?? i + 1,
          updatedAt: new Date(),
        },
      });
    }

    // 3. Showcase Cards
    for (const card of showcaseCardsCache) {
      const metadata = JSON.stringify({
        cardKey: card.cardKey,
        highlightBadge: card.highlightBadge || card.badge,
        ctaButtonText: card.ctaButtonText || card.ctaText,
        targetCategoryKey: card.targetCategoryKey || card.categoryKey,
        displayOnHomepage: card.displayOnHomepage ?? card.active ?? true,
        itemCount: card.itemCount ?? 0,
        accentBorder: card.accentBorder ?? '',
      });

      await prisma.cms_banners.upsert({
        where: { id: card.id },
        create: {
          id: card.id,
          title: card.displayTitle || card.title || '',
          subtitle: card.tagline || '',
          imageUrl: card.showcaseImageUri || card.image || '',
          linkUrl: metadata,
          position: 'SHOWCASE_CARD',
          isActive: card.isActive ?? card.active ?? true,
          sortOrder: card.sortOrder,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          title: card.displayTitle || card.title || '',
          subtitle: card.tagline || '',
          imageUrl: card.showcaseImageUri || card.image || '',
          linkUrl: metadata,
          isActive: card.isActive ?? card.active ?? true,
          sortOrder: card.sortOrder,
          updatedAt: new Date(),
        },
      });
    }

    // 4. Banners
    await prisma.cms_banners.upsert({
      where: { id: 'banner-top-sticky' },
      create: {
        id: 'banner-top-sticky',
        title: bannersCache.topStickyAnnouncementBar.announcementCopy,
        linkUrl: bannersCache.topStickyAnnouncementBar.announcementLink || '/shop',
        imageUrl: '',
        position: 'TOP_STICKY_ANNOUNCEMENT',
        isActive: bannersCache.topStickyAnnouncementBar.isActive,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: bannersCache.topStickyAnnouncementBar.announcementCopy,
        linkUrl: bannersCache.topStickyAnnouncementBar.announcementLink || '/shop',
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

    // 5. Value Proposition
    await prisma.cms_banners.upsert({
      where: { id: 'value-proposition' },
      create: {
        id: 'value-proposition',
        title: valuePropositionCache.title,
        subtitle: valuePropositionCache.eyebrow,
        imageUrl: '',
        linkUrl: JSON.stringify({
          description: valuePropositionCache.description,
          points: valuePropositionCache.points,
        }),
        position: 'VALUE_PROPOSITION',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: valuePropositionCache.title,
        subtitle: valuePropositionCache.eyebrow,
        linkUrl: JSON.stringify({
          description: valuePropositionCache.description,
          points: valuePropositionCache.points,
        }),
        updatedAt: new Date(),
      },
    });

    // 6. About Brand Story
    await prisma.cms_banners.upsert({
      where: { id: 'about-brand-story' },
      create: {
        id: 'about-brand-story',
        title: aboutContentCache.headline,
        subtitle: aboutContentCache.badge,
        imageUrl: '',
        linkUrl: JSON.stringify({
          storyText: aboutContentCache.storyText,
          naturalSoyStat: aboutContentCache.naturalSoyStat,
          unboxingsStat: aboutContentCache.unboxingsStat,
          realCashStat: aboutContentCache.realCashStat,
        }),
        position: 'ABOUT_BRAND_STORY',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: aboutContentCache.headline,
        subtitle: aboutContentCache.badge,
        linkUrl: JSON.stringify({
          storyText: aboutContentCache.storyText,
          naturalSoyStat: aboutContentCache.naturalSoyStat,
          unboxingsStat: aboutContentCache.unboxingsStat,
          realCashStat: aboutContentCache.realCashStat,
        }),
        updatedAt: new Date(),
      },
    });

    // 7. FAQs
    for (let i = 0; i < faqsCache.length; i++) {
      const faq = faqsCache[i];
      await prisma.cms_banners.upsert({
        where: { id: faq.id },
        create: {
          id: faq.id,
          title: faq.question,
          subtitle: faq.category,
          imageUrl: '',
          linkUrl: faq.answer,
          position: 'FAQ_ITEM',
          isActive: faq.isActive !== undefined ? faq.isActive : true,
          sortOrder: faq.sortOrder ?? i + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          title: faq.question,
          subtitle: faq.category,
          linkUrl: faq.answer,
          isActive: faq.isActive !== undefined ? faq.isActive : true,
          sortOrder: faq.sortOrder ?? i + 1,
          updatedAt: new Date(),
        },
      });
    }

    // 8. Footer
    await prisma.cms_banners.upsert({
      where: { id: 'storewide-footer' },
      create: {
        id: 'storewide-footer',
        title: footerCache.newsletterTitle,
        subtitle: footerCache.newsletterSubtitle,
        imageUrl: '',
        linkUrl: JSON.stringify({
          copyrightText: footerCache.copyrightText,
          supportEmail: footerCache.supportEmail,
          supportPhone: footerCache.supportPhone,
          guaranteeText: footerCache.guaranteeText,
        }),
        position: 'STOREWIDE_FOOTER',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: footerCache.newsletterTitle,
        subtitle: footerCache.newsletterSubtitle,
        linkUrl: JSON.stringify({
          copyrightText: footerCache.copyrightText,
          supportEmail: footerCache.supportEmail,
          supportPhone: footerCache.supportPhone,
          guaranteeText: footerCache.guaranteeText,
        }),
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed persisting storefront to database:', err?.message);
  }
};

const ensureInitialized = async (): Promise<void> => {
  if (isInitialized) return;

  try {
    const dbBanners = await prisma.cms_banners.findMany();

    if (dbBanners.length > 0) {
      // 1. Hero Banner
      const heroBanner = dbBanners.find((b) => b.id === 'hero-banner' || b.position === 'HERO_BANNER');
      if (heroBanner) {
        heroCache.headline = heroBanner.title || heroCache.headline;
        heroCache.subheadline = heroBanner.subtitle || heroCache.subheadline;
        heroCache.desktopBannerImage = heroBanner.imageUrl || heroCache.desktopBannerImage;
        heroCache.mobileBannerImage = heroBanner.linkUrl || heroCache.mobileBannerImage;
      }

      // 2. Benefit Tiles
      const benefitTilesInDb = dbBanners
        .filter((b) => b.position === 'HERO_BENEFIT_TILE')
        .sort((a, b) => a.sortOrder - b.sortOrder);

      if (benefitTilesInDb.length > 0) {
        heroCache.benefitTiles = benefitTilesInDb.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || '',
          iconName: b.imageUrl || 'Gem',
          actionType: b.linkUrl || 'shop',
          sortOrder: b.sortOrder,
          isActive: b.isActive,
        }));
      }

      // 3. Showcase Cards
      const showcaseInDb = dbBanners
        .filter((b) => b.position === 'SHOWCASE_CARD')
        .sort((a, b) => a.sortOrder - b.sortOrder);

      if (showcaseInDb.length > 0) {
        showcaseCardsCache = showcaseInDb.map((b) => {
          let meta: any = {};
          try {
            if (b.linkUrl) meta = JSON.parse(b.linkUrl);
          } catch {
            // ignore
          }

          const cardKey = meta.cardKey || b.id.replace(/^showcase-/, '');
          const title = b.title;
          const badge = meta.highlightBadge || meta.badge || 'Holiday Priority';
          const tagline = b.subtitle || '';
          const ctaText = meta.ctaButtonText || meta.ctaText || 'Shop Collection';
          const categoryKey = meta.targetCategoryKey || meta.categoryKey || title;
          const image = b.imageUrl;
          const displayOnHomepage = meta.displayOnHomepage !== undefined ? meta.displayOnHomepage : true;

          return {
            id: b.id,
            cardKey,
            displayTitle: title,
            title,
            highlightBadge: badge,
            badge,
            tagline,
            ctaButtonText: ctaText,
            ctaText,
            targetCategoryKey: categoryKey,
            categoryKey,
            showcaseImageUri: image,
            image,
            itemCount: meta.itemCount ?? 0,
            accentBorder: meta.accentBorder ?? 'hover:border-red-500',
            displayOnHomepage,
            isActive: b.isActive,
            active: b.isActive,
            sortOrder: b.sortOrder,
            updatedAt: b.updatedAt,
          };
        });
      }

      // 4. Banners
      const topBar = dbBanners.find((b) => b.id === 'banner-top-sticky' || b.position === 'TOP_STICKY_ANNOUNCEMENT');
      if (topBar) {
        bannersCache.topStickyAnnouncementBar = {
          isActive: topBar.isActive,
          announcementCopy: topBar.title,
          announcementLink: topBar.linkUrl || '/shop',
        };
      }

      const promoBar = dbBanners.find((b) => b.id === 'banner-promo-alert' || b.position === 'PROMO_DISCOUNT_ALERT');
      if (promoBar) {
        bannersCache.promotionalDiscountAlertBar = {
          isActive: promoBar.isActive,
          promoCopy: promoBar.title,
          promoCode: promoBar.subtitle || 'SURPRISE15',
        };
      }

      // 5. Value Proposition
      const vp = dbBanners.find((b) => b.id === 'value-proposition' || b.position === 'VALUE_PROPOSITION');
      if (vp) {
        let meta: any = {};
        try {
          if (vp.linkUrl) meta = JSON.parse(vp.linkUrl);
        } catch {
          // ignore
        }
        valuePropositionCache = {
          title: vp.title || valuePropositionCache.title,
          eyebrow: vp.subtitle || valuePropositionCache.eyebrow,
          description: meta.description || valuePropositionCache.description,
          points: Array.isArray(meta.points) ? meta.points : valuePropositionCache.points,
        };
      }

      // 6. About Brand Story
      const about = dbBanners.find((b) => b.id === 'about-brand-story' || b.position === 'ABOUT_BRAND_STORY');
      if (about) {
        let meta: any = {};
        try {
          if (about.linkUrl) meta = JSON.parse(about.linkUrl);
        } catch {
          // ignore
        }
        aboutContentCache = {
          headline: about.title || aboutContentCache.headline,
          badge: about.subtitle || aboutContentCache.badge,
          storyText: meta.storyText || aboutContentCache.storyText,
          naturalSoyStat: meta.naturalSoyStat || aboutContentCache.naturalSoyStat,
          unboxingsStat: meta.unboxingsStat || aboutContentCache.unboxingsStat,
          realCashStat: meta.realCashStat || aboutContentCache.realCashStat,
        };
      }

      // 7. FAQs
      const faqsInDb = dbBanners
        .filter((b) => b.position === 'FAQ_ITEM')
        .sort((a, b) => a.sortOrder - b.sortOrder);

      if (faqsInDb.length > 0) {
        faqsCache = faqsInDb.map((b) => ({
          id: b.id,
          question: b.title,
          answer: b.linkUrl || '',
          category: b.subtitle || 'General',
          sortOrder: b.sortOrder,
          isActive: b.isActive,
        }));
      }

      // 8. Footer
      const footer = dbBanners.find((b) => b.id === 'storewide-footer' || b.position === 'STOREWIDE_FOOTER');
      if (footer) {
        let meta: any = {};
        try {
          if (footer.linkUrl) meta = JSON.parse(footer.linkUrl);
        } catch {
          // ignore
        }
        footerCache = {
          newsletterTitle: footer.title || footerCache.newsletterTitle,
          newsletterSubtitle: footer.subtitle || footerCache.newsletterSubtitle,
          copyrightText: meta.copyrightText || footerCache.copyrightText,
          supportEmail: meta.supportEmail || footerCache.supportEmail,
          supportPhone: meta.supportPhone || footerCache.supportPhone,
          guaranteeText: meta.guaranteeText || footerCache.guaranteeText,
        };
      }
    } else {
      persistAllToDb().catch((err) => console.warn('Could not sync storefront defaults to DB:', err?.message));
    }
  } catch (err: any) {
    console.warn('Storefront DB load notice (serving in-memory defaults):', err?.message);
  }

  isInitialized = true;
};

// ─── GET COMPLETE STOREFRONT CONFIG ───────────────────────────────────────────

export const getStorefrontConfig = async (activeOnly = true): Promise<StorefrontConfigDTO> => {
  await ensureInitialized();

  const showcaseCards = activeOnly
    ? showcaseCardsCache.filter((c) => (c.isActive || c.active) && c.displayOnHomepage)
    : showcaseCardsCache;

  const featuredCards: HomepageFeaturedCardDTO[] = showcaseCards.map((c) => ({
    id: c.id,
    title: c.displayTitle || c.title || '',
    categoryKey: c.targetCategoryKey || c.categoryKey || '',
    badge: c.highlightBadge || c.badge || '',
    tagline: c.tagline,
    ctaText: c.ctaButtonText || c.ctaText || '',
    image: c.showcaseImageUri || c.image || '',
    itemCount: c.itemCount ?? 0,
    accentBorder: c.accentBorder ?? 'hover:border-red-500',
    active: c.isActive || c.active || false,
    sortOrder: c.sortOrder,
    cardKey: c.cardKey,
    displayTitle: c.displayTitle || c.title,
    highlightBadge: c.highlightBadge || c.badge,
    targetCategoryKey: c.targetCategoryKey || c.categoryKey,
    ctaButtonText: c.ctaButtonText || c.ctaText,
    showcaseImageUri: c.showcaseImageUri || c.image,
    displayOnHomepage: c.displayOnHomepage,
    isActive: c.isActive,
  }));

  const activeBenefitTiles = activeOnly
    ? heroCache.benefitTiles.filter((t) => t.isActive !== false)
    : heroCache.benefitTiles;

  const activeFaqs = activeOnly
    ? faqsCache.filter((f) => f.isActive !== false)
    : faqsCache;

  return {
    showcaseCards,
    featuredCards,
    banners: bannersCache,
    hero: {
      ...heroCache,
      benefitTiles: activeBenefitTiles,
    },
    valueProposition: valuePropositionCache,
    aboutContent: aboutContentCache,
    faqItems: activeFaqs,
    footerContent: footerCache,
    announcementText: bannersCache.topStickyAnnouncementBar.announcementCopy,
    announcementActive: bannersCache.topStickyAnnouncementBar.isActive,
    announcementLink: bannersCache.topStickyAnnouncementBar.announcementLink || '/shop',
    promoBannerText: bannersCache.promotionalDiscountAlertBar.promoCopy,
    promoBannerCode: bannersCache.promotionalDiscountAlertBar.promoCode,
    promoBannerActive: bannersCache.promotionalDiscountAlertBar.isActive,
  };
};

// ─── FULL STOREFRONT UPDATE & RESET ──────────────────────────────────────────

export const updateFullStorefrontConfig = async (
  data: UpdateFullHomepageContentDTO
): Promise<StorefrontConfigDTO> => {
  await ensureInitialized();

  // 1. Hero
  if (data.hero) {
    heroCache = {
      ...heroCache,
      ...(data.hero.desktopBannerImage !== undefined && { desktopBannerImage: data.hero.desktopBannerImage }),
      ...(data.hero.mobileBannerImage !== undefined && { mobileBannerImage: data.hero.mobileBannerImage }),
      ...(data.hero.headline !== undefined && { headline: data.hero.headline }),
      ...(data.hero.subheadline !== undefined && { subheadline: data.hero.subheadline }),
      ...(data.hero.benefitTiles && { benefitTiles: data.hero.benefitTiles }),
    };
  }

  // 2. Showcase / Featured Cards
  if (data.featuredCards && Array.isArray(data.featuredCards)) {
    showcaseCardsCache = data.featuredCards.map((fc: any, index: number) => {
      const existing = showcaseCardsCache.find(
        (c) => c.id === fc.id || c.cardKey.toLowerCase() === (fc.cardKey || fc.id || '').toLowerCase()
      );
      const title = fc.title || fc.displayTitle || existing?.displayTitle || '';
      const cardKey = fc.cardKey || existing?.cardKey || fc.id?.replace(/^showcase-/, '') || `card-${index + 1}`;
      const badge = fc.badge || fc.highlightBadge || existing?.highlightBadge || '';
      const image = fc.image || fc.showcaseImageUri || existing?.showcaseImageUri || '';
      const cta = fc.ctaText || fc.ctaButtonText || existing?.ctaButtonText || 'Shop Collection';
      const catKey = fc.categoryKey || fc.targetCategoryKey || existing?.targetCategoryKey || title;
      const isActive = fc.active !== undefined ? fc.active : fc.isActive !== undefined ? fc.isActive : true;

      return {
        id: fc.id || existing?.id || `showcase-${cardKey}`,
        cardKey,
        displayTitle: title,
        title,
        highlightBadge: badge,
        badge,
        tagline: fc.tagline ?? existing?.tagline ?? '',
        ctaButtonText: cta,
        ctaText: cta,
        targetCategoryKey: catKey,
        categoryKey: catKey,
        showcaseImageUri: image,
        image,
        itemCount: fc.itemCount ?? existing?.itemCount ?? 0,
        accentBorder: fc.accentBorder ?? existing?.accentBorder ?? 'hover:border-red-500',
        displayOnHomepage: fc.displayOnHomepage ?? fc.active ?? true,
        isActive,
        active: isActive,
        sortOrder: fc.sortOrder ?? existing?.sortOrder ?? index + 1,
        updatedAt: new Date(),
      };
    });
  } else if (data.showcaseCards && Array.isArray(data.showcaseCards)) {
    showcaseCardsCache = data.showcaseCards;
  }

  // 3. Announcements & Banners
  if (data.banners) {
    if (data.banners.topStickyAnnouncementBar) {
      bannersCache.topStickyAnnouncementBar = {
        ...bannersCache.topStickyAnnouncementBar,
        ...data.banners.topStickyAnnouncementBar,
      };
    }
    if (data.banners.promotionalDiscountAlertBar) {
      bannersCache.promotionalDiscountAlertBar = {
        ...bannersCache.promotionalDiscountAlertBar,
        ...data.banners.promotionalDiscountAlertBar,
      };
    }
  }

  if (data.announcementText !== undefined) {
    bannersCache.topStickyAnnouncementBar.announcementCopy = data.announcementText;
  }
  if (data.announcementActive !== undefined) {
    bannersCache.topStickyAnnouncementBar.isActive = data.announcementActive;
  }
  if (data.announcementLink !== undefined) {
    bannersCache.topStickyAnnouncementBar.announcementLink = data.announcementLink;
  }
  if (data.promoBannerText !== undefined) {
    bannersCache.promotionalDiscountAlertBar.promoCopy = data.promoBannerText;
  }
  if (data.promoBannerCode !== undefined) {
    bannersCache.promotionalDiscountAlertBar.promoCode = data.promoBannerCode;
  }
  if (data.promoBannerActive !== undefined) {
    bannersCache.promotionalDiscountAlertBar.isActive = data.promoBannerActive;
  }

  // 4. Value Proposition
  if (data.valueProposition) {
    valuePropositionCache = {
      ...valuePropositionCache,
      ...data.valueProposition,
    };
  }

  // 5. About Content
  if (data.aboutContent) {
    aboutContentCache = {
      ...aboutContentCache,
      ...data.aboutContent,
    };
  }

  // 6. FAQs
  if (data.faqItems && Array.isArray(data.faqItems)) {
    faqsCache = data.faqItems.map((f, i) => ({
      id: f.id || `faq-${Date.now()}-${i}`,
      question: f.question,
      answer: f.answer,
      category: f.category || 'General',
      sortOrder: f.sortOrder ?? i + 1,
      isActive: f.isActive !== false,
    }));
  }

  // 7. Footer
  if (data.footerContent) {
    footerCache = {
      ...footerCache,
      ...data.footerContent,
    };
  }

  // Persist to database asynchronously
  persistAllToDb().catch((err) => console.warn('Storefront DB sync failed on bulk update:', err?.message));

  return getStorefrontConfig(false);
};

export const resetStorefrontDefaults = async (): Promise<StorefrontConfigDTO> => {
  heroCache = JSON.parse(JSON.stringify(DEFAULT_HERO));
  showcaseCardsCache = JSON.parse(JSON.stringify(DEFAULT_SHOWCASE_CARDS));
  bannersCache = JSON.parse(JSON.stringify(DEFAULT_BANNERS));
  valuePropositionCache = JSON.parse(JSON.stringify(DEFAULT_VALUE_PROPOSITION));
  aboutContentCache = JSON.parse(JSON.stringify(DEFAULT_ABOUT_CONTENT));
  faqsCache = JSON.parse(JSON.stringify(DEFAULT_FAQS));
  footerCache = JSON.parse(JSON.stringify(DEFAULT_FOOTER));

  await persistAllToDb();
  return getStorefrontConfig(false);
};

// ─── HERO & BENEFIT TILES CRUD ───────────────────────────────────────────────

export const getHeroContent = async (activeOnly = true): Promise<HeroContentConfigDTO> => {
  await ensureInitialized();
  const benefitTiles = activeOnly
    ? heroCache.benefitTiles.filter((t) => t.isActive !== false)
    : heroCache.benefitTiles;

  return {
    ...heroCache,
    benefitTiles,
  };
};

export const updateHeroContent = async (data: UpdateHeroDTO): Promise<HeroContentConfigDTO> => {
  await ensureInitialized();

  heroCache = {
    ...heroCache,
    ...(data.desktopBannerImage !== undefined && { desktopBannerImage: data.desktopBannerImage }),
    ...(data.mobileBannerImage !== undefined && { mobileBannerImage: data.mobileBannerImage }),
    ...(data.headline !== undefined && { headline: data.headline }),
    ...(data.subheadline !== undefined && { subheadline: data.subheadline }),
    ...(data.benefitTiles && { benefitTiles: data.benefitTiles }),
  };

  try {
    await prisma.cms_banners.upsert({
      where: { id: 'hero-banner' },
      create: {
        id: 'hero-banner',
        title: heroCache.headline,
        subtitle: heroCache.subheadline || '',
        imageUrl: heroCache.desktopBannerImage,
        linkUrl: heroCache.mobileBannerImage,
        position: 'HERO_BANNER',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: heroCache.headline,
        subtitle: heroCache.subheadline || '',
        imageUrl: heroCache.desktopBannerImage,
        linkUrl: heroCache.mobileBannerImage,
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed saving hero to DB:', err?.message);
  }

  return heroCache;
};

export const getBenefitTiles = async (activeOnly = true): Promise<HeroBenefitTileDTO[]> => {
  await ensureInitialized();
  if (activeOnly) {
    return heroCache.benefitTiles.filter((t) => t.isActive !== false);
  }
  return heroCache.benefitTiles;
};

export const getBenefitTileById = async (id: string): Promise<HeroBenefitTileDTO> => {
  await ensureInitialized();
  const tile = heroCache.benefitTiles.find((t) => t.id === id);
  if (!tile) {
    const error: any = new Error(`Benefit tile with id "${id}" not found`);
    error.statusCode = 404;
    throw error;
  }
  return tile;
};

export const createBenefitTile = async (data: CreateHeroBenefitTileDTO): Promise<HeroBenefitTileDTO> => {
  await ensureInitialized();
  const newTile: HeroBenefitTileDTO = {
    id: data.id || `tile-${Date.now()}`,
    title: data.title,
    subtitle: data.subtitle,
    iconName: data.iconName || 'Gem',
    actionType: data.actionType || 'shop',
    sortOrder: data.sortOrder ?? heroCache.benefitTiles.length + 1,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  heroCache.benefitTiles.push(newTile);

  try {
    await prisma.cms_banners.create({
      data: {
        id: newTile.id,
        title: newTile.title,
        subtitle: newTile.subtitle,
        imageUrl: newTile.iconName || 'Gem',
        linkUrl: newTile.actionType || 'shop',
        position: 'HERO_BENEFIT_TILE',
        isActive: newTile.isActive !== false,
        sortOrder: newTile.sortOrder ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed creating benefit tile in DB:', err?.message);
  }

  return newTile;
};

export const updateBenefitTile = async (
  id: string,
  data: UpdateHeroBenefitTileDTO
): Promise<HeroBenefitTileDTO> => {
  await ensureInitialized();
  const index = heroCache.benefitTiles.findIndex((t) => t.id === id);
  if (index === -1) {
    const error: any = new Error(`Benefit tile with id "${id}" not found`);
    error.statusCode = 404;
    throw error;
  }

  const current = heroCache.benefitTiles[index];
  const updated: HeroBenefitTileDTO = {
    ...current,
    ...(data.title !== undefined && { title: data.title }),
    ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
    ...(data.iconName !== undefined && { iconName: data.iconName }),
    ...(data.actionType !== undefined && { actionType: data.actionType }),
    ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
  };

  heroCache.benefitTiles[index] = updated;

  try {
    await prisma.cms_banners.upsert({
      where: { id: updated.id },
      create: {
        id: updated.id,
        title: updated.title,
        subtitle: updated.subtitle,
        imageUrl: updated.iconName || 'Gem',
        linkUrl: updated.actionType || 'shop',
        position: 'HERO_BENEFIT_TILE',
        isActive: updated.isActive !== false,
        sortOrder: updated.sortOrder ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: updated.title,
        subtitle: updated.subtitle,
        imageUrl: updated.iconName || 'Gem',
        linkUrl: updated.actionType || 'shop',
        isActive: updated.isActive !== false,
        sortOrder: updated.sortOrder ?? 0,
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed updating benefit tile in DB:', err?.message);
  }

  return updated;
};

export const deleteBenefitTile = async (id: string): Promise<{ success: boolean; message: string }> => {
  await ensureInitialized();
  const index = heroCache.benefitTiles.findIndex((t) => t.id === id);
  if (index === -1) {
    const error: any = new Error(`Benefit tile with id "${id}" not found`);
    error.statusCode = 404;
    throw error;
  }

  heroCache.benefitTiles.splice(index, 1);

  try {
    await prisma.cms_banners.deleteMany({
      where: { id },
    });
  } catch (err: any) {
    console.warn('Failed deleting benefit tile from DB:', err?.message);
  }

  return { success: true, message: `Benefit tile "${id}" deleted successfully` };
};

// ─── SHOWCASE CARDS / PRIORITY COLLECTIONS CRUD ───────────────────────────────

export const getShowcaseCards = async (activeOnly = true): Promise<ShowcaseCardDTO[]> => {
  await ensureInitialized();
  if (activeOnly) {
    return showcaseCardsCache.filter((c) => (c.isActive || c.active) && c.displayOnHomepage);
  }
  return showcaseCardsCache;
};

export const getShowcaseCardByKey = async (cardKey: string): Promise<ShowcaseCardDTO> => {
  await ensureInitialized();
  const card = showcaseCardsCache.find(
    (c) =>
      c.cardKey.toLowerCase() === cardKey.toLowerCase() ||
      c.id.toLowerCase() === cardKey.toLowerCase() ||
      (c.categoryKey && c.categoryKey.toLowerCase() === cardKey.toLowerCase())
  );

  if (!card) {
    const error: any = new Error(`Showcase card with key "${cardKey}" not found`);
    error.statusCode = 404;
    throw error;
  }

  return card;
};

export const createShowcaseCard = async (data: CreateShowcaseCardDTO): Promise<ShowcaseCardDTO> => {
  await ensureInitialized();

  const title = data.displayTitle || data.title || 'Collection';
  const badge = data.highlightBadge || data.badge || 'Priority';
  const cta = data.ctaButtonText || data.ctaText || 'Shop Collection';
  const catKey = data.targetCategoryKey || data.categoryKey || title;
  const image = data.showcaseImageUri || data.image || '';
  const isActive = data.isActive !== undefined ? data.isActive : data.active !== undefined ? data.active : true;
  const displayOnHomepage = data.displayOnHomepage !== undefined ? data.displayOnHomepage : isActive;

  const newCard: ShowcaseCardDTO = {
    id: data.id || `showcase-${data.cardKey.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    cardKey: data.cardKey,
    displayTitle: title,
    title,
    highlightBadge: badge,
    badge,
    tagline: data.tagline || '',
    ctaButtonText: cta,
    ctaText: cta,
    targetCategoryKey: catKey,
    categoryKey: catKey,
    showcaseImageUri: image,
    image,
    itemCount: data.itemCount ?? 0,
    accentBorder: data.accentBorder ?? 'hover:border-red-500',
    displayOnHomepage,
    isActive,
    active: isActive,
    sortOrder: data.sortOrder ?? showcaseCardsCache.length + 1,
    updatedAt: new Date(),
  };

  showcaseCardsCache.push(newCard);

  const metadata = JSON.stringify({
    cardKey: newCard.cardKey,
    highlightBadge: newCard.highlightBadge,
    ctaButtonText: newCard.ctaButtonText,
    targetCategoryKey: newCard.targetCategoryKey,
    displayOnHomepage: newCard.displayOnHomepage,
    itemCount: newCard.itemCount,
    accentBorder: newCard.accentBorder,
  });

  try {
    await prisma.cms_banners.create({
      data: {
        id: newCard.id,
        title: newCard.displayTitle,
        subtitle: newCard.tagline,
        imageUrl: newCard.showcaseImageUri,
        linkUrl: metadata,
        position: 'SHOWCASE_CARD',
        isActive: newCard.isActive,
        sortOrder: newCard.sortOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed creating showcase card in DB:', err?.message);
  }

  return newCard;
};

export const updateShowcaseCard = async (
  cardKey: string,
  data: UpdateShowcaseCardDTO
): Promise<ShowcaseCardDTO> => {
  await ensureInitialized();
  const index = showcaseCardsCache.findIndex(
    (c) =>
      c.cardKey.toLowerCase() === cardKey.toLowerCase() ||
      c.id.toLowerCase() === cardKey.toLowerCase()
  );

  if (index === -1) {
    const error: any = new Error(`Showcase card with key "${cardKey}" not found`);
    error.statusCode = 404;
    throw error;
  }

  const current = showcaseCardsCache[index];
  const title = data.displayTitle ?? data.title ?? current.displayTitle;
  const badge = data.highlightBadge ?? data.badge ?? current.highlightBadge;
  const cta = data.ctaButtonText ?? data.ctaText ?? current.ctaButtonText;
  const catKey = data.targetCategoryKey ?? data.categoryKey ?? current.targetCategoryKey;
  const image = data.showcaseImageUri ?? data.image ?? current.showcaseImageUri;
  const isActive = data.isActive ?? data.active ?? current.isActive;
  const displayOnHomepage = data.displayOnHomepage ?? current.displayOnHomepage;

  const updated: ShowcaseCardDTO = {
    ...current,
    displayTitle: title,
    title,
    highlightBadge: badge,
    badge,
    tagline: data.tagline ?? current.tagline,
    ctaButtonText: cta,
    ctaText: cta,
    targetCategoryKey: catKey,
    categoryKey: catKey,
    showcaseImageUri: image,
    image,
    displayOnHomepage,
    isActive,
    active: isActive,
    sortOrder: data.sortOrder ?? current.sortOrder,
    itemCount: data.itemCount ?? current.itemCount,
    accentBorder: data.accentBorder ?? current.accentBorder,
    updatedAt: new Date(),
  };

  showcaseCardsCache[index] = updated;

  const metadata = JSON.stringify({
    cardKey: updated.cardKey,
    highlightBadge: updated.highlightBadge,
    ctaButtonText: updated.ctaButtonText,
    targetCategoryKey: updated.targetCategoryKey,
    displayOnHomepage: updated.displayOnHomepage,
    itemCount: updated.itemCount,
    accentBorder: updated.accentBorder,
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
    console.warn('Failed saving updated showcase card to DB:', err?.message);
  }

  return updated;
};

export const deleteShowcaseCard = async (cardKey: string): Promise<{ success: boolean; message: string }> => {
  await ensureInitialized();
  const index = showcaseCardsCache.findIndex(
    (c) =>
      c.cardKey.toLowerCase() === cardKey.toLowerCase() ||
      c.id.toLowerCase() === cardKey.toLowerCase()
  );

  if (index === -1) {
    const error: any = new Error(`Showcase card with key "${cardKey}" not found`);
    error.statusCode = 404;
    throw error;
  }

  const target = showcaseCardsCache[index];
  showcaseCardsCache.splice(index, 1);

  try {
    await prisma.cms_banners.deleteMany({
      where: {
        OR: [{ id: target.id }, { id: `showcase-${target.cardKey}` }],
      },
    });
  } catch (err: any) {
    console.warn('Failed deleting showcase card from DB:', err?.message);
  }

  return { success: true, message: `Showcase card "${cardKey}" deleted successfully` };
};

// ─── BANNERS & ANNOUNCEMENTS ──────────────────────────────────────────────────

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
  }

  if (data.announcementText !== undefined) {
    bannersCache.topStickyAnnouncementBar.announcementCopy = data.announcementText;
  }
  if (data.announcementActive !== undefined) {
    bannersCache.topStickyAnnouncementBar.isActive = data.announcementActive;
  }
  if (data.announcementLink !== undefined) {
    bannersCache.topStickyAnnouncementBar.announcementLink = data.announcementLink;
  }

  try {
    await prisma.cms_banners.upsert({
      where: { id: 'banner-top-sticky' },
      create: {
        id: 'banner-top-sticky',
        title: bannersCache.topStickyAnnouncementBar.announcementCopy,
        linkUrl: bannersCache.topStickyAnnouncementBar.announcementLink || '/shop',
        imageUrl: '',
        position: 'TOP_STICKY_ANNOUNCEMENT',
        isActive: bannersCache.topStickyAnnouncementBar.isActive,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: bannersCache.topStickyAnnouncementBar.announcementCopy,
        linkUrl: bannersCache.topStickyAnnouncementBar.announcementLink || '/shop',
        isActive: bannersCache.topStickyAnnouncementBar.isActive,
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed saving top sticky banner to DB:', err?.message);
  }

  if (data.promotionalDiscountAlertBar) {
    bannersCache.promotionalDiscountAlertBar = {
      ...bannersCache.promotionalDiscountAlertBar,
      ...data.promotionalDiscountAlertBar,
    };
  }

  if (data.promoBannerText !== undefined) {
    bannersCache.promotionalDiscountAlertBar.promoCopy = data.promoBannerText;
  }
  if (data.promoBannerCode !== undefined) {
    bannersCache.promotionalDiscountAlertBar.promoCode = data.promoBannerCode;
  }
  if (data.promoBannerActive !== undefined) {
    bannersCache.promotionalDiscountAlertBar.isActive = data.promoBannerActive;
  }

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
    console.warn('Failed saving promo alert bar to DB:', err?.message);
  }

  return bannersCache;
};

// ─── VALUE PROPOSITION ────────────────────────────────────────────────────────

export const getValueProposition = async (): Promise<ValuePropositionConfigDTO> => {
  await ensureInitialized();
  return valuePropositionCache;
};

export const updateValueProposition = async (
  data: UpdateValuePropositionDTO
): Promise<ValuePropositionConfigDTO> => {
  await ensureInitialized();

  valuePropositionCache = {
    ...valuePropositionCache,
    ...(data.eyebrow !== undefined && { eyebrow: data.eyebrow }),
    ...(data.title !== undefined && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.points !== undefined && { points: data.points }),
  };

  try {
    await prisma.cms_banners.upsert({
      where: { id: 'value-proposition' },
      create: {
        id: 'value-proposition',
        title: valuePropositionCache.title,
        subtitle: valuePropositionCache.eyebrow,
        imageUrl: '',
        linkUrl: JSON.stringify({
          description: valuePropositionCache.description,
          points: valuePropositionCache.points,
        }),
        position: 'VALUE_PROPOSITION',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: valuePropositionCache.title,
        subtitle: valuePropositionCache.eyebrow,
        linkUrl: JSON.stringify({
          description: valuePropositionCache.description,
          points: valuePropositionCache.points,
        }),
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed saving value proposition to DB:', err?.message);
  }

  return valuePropositionCache;
};

// ─── ABOUT BRAND STORY ────────────────────────────────────────────────────────

export const getAboutContent = async (): Promise<AboutContentConfigDTO> => {
  await ensureInitialized();
  return aboutContentCache;
};

export const updateAboutContent = async (
  data: UpdateAboutContentDTO
): Promise<AboutContentConfigDTO> => {
  await ensureInitialized();

  aboutContentCache = {
    ...aboutContentCache,
    ...(data.badge !== undefined && { badge: data.badge }),
    ...(data.headline !== undefined && { headline: data.headline }),
    ...(data.storyText !== undefined && { storyText: data.storyText }),
    ...(data.naturalSoyStat !== undefined && { naturalSoyStat: data.naturalSoyStat }),
    ...(data.unboxingsStat !== undefined && { unboxingsStat: data.unboxingsStat }),
    ...(data.realCashStat !== undefined && { realCashStat: data.realCashStat }),
  };

  try {
    await prisma.cms_banners.upsert({
      where: { id: 'about-brand-story' },
      create: {
        id: 'about-brand-story',
        title: aboutContentCache.headline,
        subtitle: aboutContentCache.badge,
        imageUrl: '',
        linkUrl: JSON.stringify({
          storyText: aboutContentCache.storyText,
          naturalSoyStat: aboutContentCache.naturalSoyStat,
          unboxingsStat: aboutContentCache.unboxingsStat,
          realCashStat: aboutContentCache.realCashStat,
        }),
        position: 'ABOUT_BRAND_STORY',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: aboutContentCache.headline,
        subtitle: aboutContentCache.badge,
        linkUrl: JSON.stringify({
          storyText: aboutContentCache.storyText,
          naturalSoyStat: aboutContentCache.naturalSoyStat,
          unboxingsStat: aboutContentCache.unboxingsStat,
          realCashStat: aboutContentCache.realCashStat,
        }),
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed saving about content to DB:', err?.message);
  }

  return aboutContentCache;
};

// ─── FAQ CONTENT CRUD ─────────────────────────────────────────────────────────

export const getFaqs = async (
  category?: string,
  activeOnly = true
): Promise<FaqContentItemDTO[]> => {
  await ensureInitialized();
  let faqs = activeOnly ? faqsCache.filter((f) => f.isActive !== false) : faqsCache;

  if (category) {
    faqs = faqs.filter((f) => f.category.toLowerCase() === category.toLowerCase());
  }

  return faqs;
};

export const getFaqById = async (id: string): Promise<FaqContentItemDTO> => {
  await ensureInitialized();
  const faq = faqsCache.find((f) => f.id === id);
  if (!faq) {
    const error: any = new Error(`FAQ item with id "${id}" not found`);
    error.statusCode = 404;
    throw error;
  }
  return faq;
};

export const createFaq = async (data: CreateFaqItemDTO): Promise<FaqContentItemDTO> => {
  await ensureInitialized();
  const newFaq: FaqContentItemDTO = {
    id: data.id || `faq-${Date.now()}`,
    question: data.question,
    answer: data.answer,
    category: data.category || 'General',
    sortOrder: data.sortOrder ?? faqsCache.length + 1,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  faqsCache.push(newFaq);

  try {
    await prisma.cms_banners.create({
      data: {
        id: newFaq.id,
        title: newFaq.question,
        subtitle: newFaq.category,
        imageUrl: '',
        linkUrl: newFaq.answer,
        position: 'FAQ_ITEM',
        isActive: newFaq.isActive !== false,
        sortOrder: newFaq.sortOrder ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed creating FAQ in DB:', err?.message);
  }

  return newFaq;
};

export const updateFaq = async (
  id: string,
  data: UpdateFaqItemDTO
): Promise<FaqContentItemDTO> => {
  await ensureInitialized();
  const index = faqsCache.findIndex((f) => f.id === id);
  if (index === -1) {
    const error: any = new Error(`FAQ item with id "${id}" not found`);
    error.statusCode = 404;
    throw error;
  }

  const current = faqsCache[index];
  const updated: FaqContentItemDTO = {
    ...current,
    ...(data.question !== undefined && { question: data.question }),
    ...(data.answer !== undefined && { answer: data.answer }),
    ...(data.category !== undefined && { category: data.category }),
    ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
  };

  faqsCache[index] = updated;

  try {
    await prisma.cms_banners.upsert({
      where: { id: updated.id },
      create: {
        id: updated.id,
        title: updated.question,
        subtitle: updated.category,
        imageUrl: '',
        linkUrl: updated.answer,
        position: 'FAQ_ITEM',
        isActive: updated.isActive !== false,
        sortOrder: updated.sortOrder ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: updated.question,
        subtitle: updated.category,
        linkUrl: updated.answer,
        isActive: updated.isActive !== false,
        sortOrder: updated.sortOrder ?? 0,
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed updating FAQ in DB:', err?.message);
  }

  return updated;
};

export const deleteFaq = async (id: string): Promise<{ success: boolean; message: string }> => {
  await ensureInitialized();
  const index = faqsCache.findIndex((f) => f.id === id);
  if (index === -1) {
    const error: any = new Error(`FAQ item with id "${id}" not found`);
    error.statusCode = 404;
    throw error;
  }

  faqsCache.splice(index, 1);

  try {
    await prisma.cms_banners.deleteMany({
      where: { id },
    });
  } catch (err: any) {
    console.warn('Failed deleting FAQ from DB:', err?.message);
  }

  return { success: true, message: `FAQ item "${id}" deleted successfully` };
};

// ─── FOOTER & LEGAL ───────────────────────────────────────────────────────────

export const getFooterContent = async (): Promise<FooterContentConfigDTO> => {
  await ensureInitialized();
  return footerCache;
};

export const updateFooterContent = async (
  data: UpdateFooterContentDTO
): Promise<FooterContentConfigDTO> => {
  await ensureInitialized();

  footerCache = {
    ...footerCache,
    ...(data.newsletterTitle !== undefined && { newsletterTitle: data.newsletterTitle }),
    ...(data.newsletterSubtitle !== undefined && { newsletterSubtitle: data.newsletterSubtitle }),
    ...(data.copyrightText !== undefined && { copyrightText: data.copyrightText }),
    ...(data.supportEmail !== undefined && { supportEmail: data.supportEmail }),
    ...(data.supportPhone !== undefined && { supportPhone: data.supportPhone }),
    ...(data.guaranteeText !== undefined && { guaranteeText: data.guaranteeText }),
  };

  try {
    await prisma.cms_banners.upsert({
      where: { id: 'storewide-footer' },
      create: {
        id: 'storewide-footer',
        title: footerCache.newsletterTitle,
        subtitle: footerCache.newsletterSubtitle,
        imageUrl: '',
        linkUrl: JSON.stringify({
          copyrightText: footerCache.copyrightText,
          supportEmail: footerCache.supportEmail,
          supportPhone: footerCache.supportPhone,
          guaranteeText: footerCache.guaranteeText,
        }),
        position: 'STOREWIDE_FOOTER',
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: footerCache.newsletterTitle,
        subtitle: footerCache.newsletterSubtitle,
        linkUrl: JSON.stringify({
          copyrightText: footerCache.copyrightText,
          supportEmail: footerCache.supportEmail,
          supportPhone: footerCache.supportPhone,
          guaranteeText: footerCache.guaranteeText,
        }),
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn('Failed saving footer to DB:', err?.message);
  }

  return footerCache;
};

// ─── OBJECT EXPORTS ───────────────────────────────────────────────────────────

export const storefrontService = {
  getStorefrontConfig,
  updateFullStorefrontConfig,
  resetStorefrontDefaults,
  getHeroContent,
  updateHeroContent,
  getBenefitTiles,
  getBenefitTileById,
  createBenefitTile,
  updateBenefitTile,
  deleteBenefitTile,
  getShowcaseCards,
  getShowcaseCardByKey,
  createShowcaseCard,
  updateShowcaseCard,
  deleteShowcaseCard,
  getBanners,
  updateBanners,
  getValueProposition,
  updateValueProposition,
  getAboutContent,
  updateAboutContent,
  getFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  getFooterContent,
  updateFooterContent,
};
