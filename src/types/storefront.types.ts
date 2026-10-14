export interface HeroBenefitTileDTO {
  id: string;
  title: string;
  subtitle: string;
  iconName?: 'Gem' | 'Gift' | 'Store' | 'Users' | 'Sparkles' | 'ShieldCheck' | string;
  actionType?: 'shop' | 'consultant' | 'scroll' | string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface HeroContentConfigDTO {
  desktopBannerImage: string;
  mobileBannerImage: string;
  headline: string;
  subheadline?: string;
  benefitTiles: HeroBenefitTileDTO[];
}

export interface ShowcaseCardDTO {
  id: string;
  cardKey: 'halloween' | 'christmas-x' | 'cash-candles' | 'zodiac-cash-candles' | string;
  displayTitle: string;
  highlightBadge: string;
  tagline: string;
  ctaButtonText: string;
  targetCategoryKey: string;
  showcaseImageUri: string;
  displayOnHomepage: boolean;
  isActive: boolean;
  sortOrder: number;
  itemCount?: number;
  accentBorder?: string;
  // Aliases for frontend compatibility
  title?: string;
  badge?: string;
  categoryKey?: string;
  ctaText?: string;
  image?: string;
  active?: boolean;
  updatedAt?: Date;
}

export interface HomepageFeaturedCardDTO {
  id: string;
  title: string;
  categoryKey: string;
  badge: string;
  tagline: string;
  ctaText: string;
  image: string;
  itemCount: number;
  accentBorder: string;
  active: boolean;
  sortOrder?: number;
  // Aliases
  cardKey?: string;
  displayTitle?: string;
  highlightBadge?: string;
  targetCategoryKey?: string;
  ctaButtonText?: string;
  showcaseImageUri?: string;
  displayOnHomepage?: boolean;
  isActive?: boolean;
}

export interface TopStickyAnnouncementBarDTO {
  isActive: boolean;
  announcementCopy: string;
  announcementLink?: string;
}

export interface PromotionalDiscountAlertBarDTO {
  isActive: boolean;
  promoCopy: string;
  promoCode: string;
}

export interface StorewideBannersDTO {
  topStickyAnnouncementBar: TopStickyAnnouncementBarDTO;
  promotionalDiscountAlertBar: PromotionalDiscountAlertBarDTO;
}

export interface ValuePropositionConfigDTO {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
}

export interface AboutContentConfigDTO {
  badge: string;
  headline: string;
  storyText: string;
  naturalSoyStat: string;
  unboxingsStat: string;
  realCashStat: string;
}

export interface FaqContentItemDTO {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface FooterContentConfigDTO {
  newsletterTitle: string;
  newsletterSubtitle: string;
  copyrightText: string;
  supportEmail: string;
  supportPhone: string;
  guaranteeText: string;
}

export interface StorefrontConfigDTO {
  showcaseCards: ShowcaseCardDTO[];
  featuredCards: HomepageFeaturedCardDTO[];
  banners: StorewideBannersDTO;
  hero: HeroContentConfigDTO;
  valueProposition: ValuePropositionConfigDTO;
  aboutContent: AboutContentConfigDTO;
  faqItems: FaqContentItemDTO[];
  footerContent: FooterContentConfigDTO;
  announcementText: string;
  announcementActive: boolean;
  announcementLink?: string;
  promoBannerText: string;
  promoBannerCode?: string;
  promoBannerActive: boolean;
}

export interface UpdateHeroDTO {
  desktopBannerImage?: string;
  mobileBannerImage?: string;
  headline?: string;
  subheadline?: string;
  benefitTiles?: HeroBenefitTileDTO[];
}

export interface CreateHeroBenefitTileDTO {
  id?: string;
  title: string;
  subtitle: string;
  iconName?: string;
  actionType?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateHeroBenefitTileDTO {
  title?: string;
  subtitle?: string;
  iconName?: string;
  actionType?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateShowcaseCardDTO {
  id?: string;
  cardKey: string;
  displayTitle?: string;
  highlightBadge?: string;
  tagline?: string;
  ctaButtonText?: string;
  targetCategoryKey?: string;
  showcaseImageUri?: string;
  displayOnHomepage?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  itemCount?: number;
  accentBorder?: string;
  // Aliases
  title?: string;
  badge?: string;
  categoryKey?: string;
  ctaText?: string;
  image?: string;
  active?: boolean;
}

export interface UpdateShowcaseCardDTO {
  cardKey?: string;
  displayTitle?: string;
  highlightBadge?: string;
  tagline?: string;
  ctaButtonText?: string;
  targetCategoryKey?: string;
  showcaseImageUri?: string;
  displayOnHomepage?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  itemCount?: number;
  accentBorder?: string;
  // Aliases
  title?: string;
  badge?: string;
  categoryKey?: string;
  ctaText?: string;
  image?: string;
  active?: boolean;
}

export interface UpdateStorefrontBannersDTO {
  topStickyAnnouncementBar?: Partial<TopStickyAnnouncementBarDTO>;
  promotionalDiscountAlertBar?: Partial<PromotionalDiscountAlertBarDTO>;
  announcementText?: string;
  announcementActive?: boolean;
  announcementLink?: string;
  promoBannerText?: string;
  promoBannerCode?: string;
  promoBannerActive?: boolean;
}

export interface UpdateValuePropositionDTO {
  eyebrow?: string;
  title?: string;
  description?: string;
  points?: string[];
}

export interface UpdateAboutContentDTO {
  badge?: string;
  headline?: string;
  storyText?: string;
  naturalSoyStat?: string;
  unboxingsStat?: string;
  realCashStat?: string;
}

export interface CreateFaqItemDTO {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateFaqItemDTO {
  question?: string;
  answer?: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateFooterContentDTO {
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  copyrightText?: string;
  supportEmail?: string;
  supportPhone?: string;
  guaranteeText?: string;
}

export interface UpdateFullHomepageContentDTO {
  announcementText?: string;
  announcementActive?: boolean;
  announcementLink?: string;
  promoBannerText?: string;
  promoBannerCode?: string;
  promoBannerActive?: boolean;
  banners?: UpdateStorefrontBannersDTO;
  featuredCards?: (ShowcaseCardDTO | HomepageFeaturedCardDTO)[];
  showcaseCards?: ShowcaseCardDTO[];
  hero?: UpdateHeroDTO;
  valueProposition?: UpdateValuePropositionDTO;
  aboutContent?: UpdateAboutContentDTO;
  faqItems?: FaqContentItemDTO[];
  footerContent?: UpdateFooterContentDTO;
}
