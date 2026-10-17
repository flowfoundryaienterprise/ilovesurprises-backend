export interface StarterKitDTO {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  includes: string[];
  badge?: string;
  isActive: boolean;
}

export interface PaymentGatewayDTO {
  id: string;
  name: string;
  status: string;
  enabled: boolean;
  subtext?: string;
}

export interface EmailTemplateDTO {
  id: string;
  name: string;
  status: string;
  enabled: boolean;
}

export interface TransactionalEmailDTO {
  activeProvider: string;
  senderName: string;
  senderEmail: string;
  registeredTemplates: EmailTemplateDTO[];
}

export interface SiteAnnouncementsDTO {
  storeAnnouncementBarText: string;
  vipRevealClubPromoCopy: string;
}

export interface SystemSettingsDTO {
  referralAttributionWindowDays: number;
  referralAttributionWindow?: number;
  restrictedRepUsernames: string[];
  onboardingStarterKits: StarterKitDTO[];
  starterKits?: StarterKitDTO[];
  paymentGateways: PaymentGatewayDTO[];
  transactionalEmail: TransactionalEmailDTO;
  emailRelay?: TransactionalEmailDTO;
  announcements: SiteAnnouncementsDTO;
  storeAnnouncementBarText?: string;
  vipRevealClubPromoCopy?: string;
  updatedAt?: string | Date;
}

export interface UpdateSystemSettingsDTO {
  referralAttributionWindowDays?: number;
  referralAttributionWindow?: number;
  restrictedRepUsernames?: string[];
  onboardingStarterKits?: StarterKitDTO[];
  starterKits?: StarterKitDTO[];
  paymentGateways?: PaymentGatewayDTO[];
  transactionalEmail?: Partial<TransactionalEmailDTO>;
  emailRelay?: Partial<TransactionalEmailDTO>;
  announcements?: Partial<SiteAnnouncementsDTO>;
  storeAnnouncementBarText?: string;
  vipRevealClubPromoCopy?: string;
}

export interface PublicSystemSettingsDTO {
  referralAttributionWindowDays: number;
  onboardingStarterKits: StarterKitDTO[];
  announcements: SiteAnnouncementsDTO;
  paymentGateways: { id: string; name: string; enabled: boolean }[];
}
