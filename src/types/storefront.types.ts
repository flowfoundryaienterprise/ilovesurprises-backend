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
  updatedAt?: Date;
}

export interface TopStickyAnnouncementBarDTO {
  isActive: boolean;
  announcementCopy: string;
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

export interface StorefrontConfigDTO {
  showcaseCards: ShowcaseCardDTO[];
  banners: StorewideBannersDTO;
}

export interface UpdateShowcaseCardDTO {
  displayTitle?: string;
  highlightBadge?: string;
  tagline?: string;
  ctaButtonText?: string;
  targetCategoryKey?: string;
  showcaseImageUri?: string;
  displayOnHomepage?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateStorefrontBannersDTO {
  topStickyAnnouncementBar?: Partial<TopStickyAnnouncementBarDTO>;
  promotionalDiscountAlertBar?: Partial<PromotionalDiscountAlertBarDTO>;
}
