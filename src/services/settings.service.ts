import { prisma } from '../lib/prisma';
import {
  SystemSettingsDTO,
  UpdateSystemSettingsDTO,
  PublicSystemSettingsDTO,
  StarterKitDTO,
  PaymentGatewayDTO,
  TransactionalEmailDTO,
  SiteAnnouncementsDTO,
} from '../types/settings.types';
import { updateBanners } from './storefront.service';

const CMS_SETTINGS_SLUG = 'system-settings';

// ─── DEFAULT VALUES (Matches Frontend Screenshots 1, 2, 3) ───────────────────

export const DEFAULT_RESTRICTED_USERNAMES: string[] = [
  'admin',
  'administrator',
  'ilovesurprises',
  'official',
  'support',
  'help',
  'ceo',
  'founder',
  'billing',
  'root',
  'payouts',
  'security',
  'mod',
  'staff',
];

export const DEFAULT_STARTER_KITS: StarterKitDTO[] = [
  {
    id: 'pro-ambassador',
    name: 'Pro Ambassador Starter Kit',
    price: 99.0,
    currency: 'USD',
    description:
      'Contains 4 Best-Selling Cash Candles, 2 Bath Bombs, 2 Wax Melts, Scent Sampler Strips, and 100 Catalogs.',
    includes: [
      'Cash Candles (2x)',
      'Diamond Ring Candles (2x)',
      'Aroma Samplers (50x)',
      'Branded Swag Bag',
    ],
    isActive: true,
  },
  {
    id: 'essential-launch',
    name: 'Essential Launch Starter Kit',
    price: 49.0,
    currency: 'USD',
    description:
      'Ideal starter inventory to host initial home reveal parties and unboxing live streams.',
    includes: [
      'Cash Candles (1x)',
      'Surprise Ring Candle (1x)',
      'Bath Bomb Cash (2x)',
      'Quickstart Digital Guide',
    ],
    isActive: true,
  },
];

export const DEFAULT_PAYMENT_GATEWAYS: PaymentGatewayDTO[] = [
  {
    id: 'stripe',
    name: 'Stripe Credit / Debit Engine',
    status: 'Webhook Status: Healthy (200 OK)',
    enabled: true,
    subtext: 'Webhook Status: Healthy (200 OK)',
  },
  {
    id: 'paypal',
    name: 'PayPal Express & Rep Payouts',
    status: 'Monthly Disbursement Active (15th)',
    enabled: true,
    subtext: 'Monthly Disbursement Active (15th)',
  },
  {
    id: 'apple-google-pay',
    name: 'Apple Pay & Google Pay Mobile Wallets',
    status: '1-Click biometric checkout',
    enabled: true,
    subtext: '1-Click biometric checkout',
  },
];

export const DEFAULT_TRANSACTIONAL_EMAIL: TransactionalEmailDTO = {
  activeProvider: 'Twilio SendGrid (Standard)',
  senderName: 'ILoveSurprises Customer Experience',
  senderEmail: 'support@ilovesurprises.com',
  registeredTemplates: [
    {
      id: 'order-confirmation',
      name: 'Order Confirmation & Tracking',
      status: 'Ready ✓',
      enabled: true,
    },
    {
      id: 'rep-welcome',
      name: 'Representative Welcome & Store Link',
      status: 'Ready ✓',
      enabled: true,
    },
    {
      id: 'commission-approved',
      name: 'Commission Approved Notice',
      status: 'Ready ✓',
      enabled: true,
    },
    {
      id: 'payment-past-due',
      name: 'Payment Past Due Alert',
      status: 'Ready ✓',
      enabled: true,
    },
  ],
};

export const DEFAULT_ANNOUNCEMENTS: SiteAnnouncementsDTO = {
  storeAnnouncementBarText:
    '✨ FREE EXPRESS SHIPPING OVER $50 • GUARANTEED REAL SURPRISE INSIDE EVERY ORDER ✨',
  vipRevealClubPromoCopy:
    'VIP Reveal Club: Save 15% with code SURPRISE15 at checkout',
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsDTO = {
  referralAttributionWindowDays: 60,
  referralAttributionWindow: 60,
  restrictedRepUsernames: [...DEFAULT_RESTRICTED_USERNAMES],
  onboardingStarterKits: JSON.parse(JSON.stringify(DEFAULT_STARTER_KITS)),
  starterKits: JSON.parse(JSON.stringify(DEFAULT_STARTER_KITS)),
  paymentGateways: JSON.parse(JSON.stringify(DEFAULT_PAYMENT_GATEWAYS)),
  transactionalEmail: JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONAL_EMAIL)),
  emailRelay: JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONAL_EMAIL)),
  announcements: { ...DEFAULT_ANNOUNCEMENTS },
  storeAnnouncementBarText: DEFAULT_ANNOUNCEMENTS.storeAnnouncementBarText,
  vipRevealClubPromoCopy: DEFAULT_ANNOUNCEMENTS.vipRevealClubPromoCopy,
  updatedAt: new Date().toISOString(),
};

// ─── IN-MEMORY CACHE & INITIALIZATION ─────────────────────────────────────────

let settingsCache: SystemSettingsDTO = JSON.parse(
  JSON.stringify(DEFAULT_SYSTEM_SETTINGS)
);
let isInitialized = false;

const normalizeUsername = (u: string): string =>
  u.trim().toLowerCase().replace(/^@/, '');

export const ensureInitialized = async (): Promise<void> => {
  if (isInitialized) return;

  try {
    const record = await prisma.cms_pages.findUnique({
      where: { slug: CMS_SETTINGS_SLUG },
    });

    if (record && record.content) {
      const parsed = JSON.parse(record.content);
      settingsCache = {
        ...DEFAULT_SYSTEM_SETTINGS,
        ...parsed,
        announcements: {
          ...DEFAULT_ANNOUNCEMENTS,
          ...(parsed.announcements || {}),
        },
        transactionalEmail: {
          ...DEFAULT_TRANSACTIONAL_EMAIL,
          ...(parsed.transactionalEmail || parsed.emailRelay || {}),
        },
        updatedAt: record.updatedAt || new Date().toISOString(),
      };
      // Synchronize convenience properties
      settingsCache.referralAttributionWindow =
        settingsCache.referralAttributionWindowDays;
      settingsCache.starterKits = settingsCache.onboardingStarterKits;
      settingsCache.emailRelay = settingsCache.transactionalEmail;
      settingsCache.storeAnnouncementBarText =
        settingsCache.announcements.storeAnnouncementBarText;
      settingsCache.vipRevealClubPromoCopy =
        settingsCache.announcements.vipRevealClubPromoCopy;
    } else {
      // First run: persist default settings to database
      await persistToDb(settingsCache);
    }
    isInitialized = true;
  } catch (err: any) {
    console.warn(
      '[settings.service] Failed initializing settings from DB, using fallback memory cache:',
      err?.message
    );
    isInitialized = true;
  }
};

const persistToDb = async (settings: SystemSettingsDTO): Promise<void> => {
  try {
    const payload = JSON.stringify(settings);
    await prisma.cms_pages.upsert({
      where: { slug: CMS_SETTINGS_SLUG },
      create: {
        id: 'system-settings',
        slug: CMS_SETTINGS_SLUG,
        title: 'System Configuration & Rules',
        content: payload,
        metaTitle: 'Store & System Settings',
        metaDescription:
          'Attribution cookie windows, reserved handles, starter bundles, email providers, and gateway configurations.',
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        title: 'System Configuration & Rules',
        content: payload,
        updatedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.warn(
      '[settings.service] Failed persisting settings to cms_pages DB:',
      err?.message
    );
  }
};

// ─── SERVICE METHODS ──────────────────────────────────────────────────────────

/**
 * Returns complete store and system configuration.
 */
export const getSettings = async (): Promise<SystemSettingsDTO> => {
  await ensureInitialized();
  return JSON.parse(JSON.stringify(settingsCache));
};

/**
 * Updates system settings and persists changes to DB.
 */
export const updateSettings = async (
  data: UpdateSystemSettingsDTO
): Promise<SystemSettingsDTO> => {
  await ensureInitialized();

  // 1. Referral Attribution Window
  const attributionDays =
    data.referralAttributionWindowDays ?? data.referralAttributionWindow;
  if (attributionDays !== undefined) {
    settingsCache.referralAttributionWindowDays = attributionDays;
    settingsCache.referralAttributionWindow = attributionDays;
  }

  // 2. Restricted Rep Usernames
  if (data.restrictedRepUsernames !== undefined) {
    // Normalize: remove @, trim, lowercase, remove duplicates
    const normalized = Array.from(
      new Set(
        data.restrictedRepUsernames
          .map(normalizeUsername)
          .filter((u) => u.length > 0)
      )
    );
    settingsCache.restrictedRepUsernames = normalized;
  }

  // 3. Onboarding Starter Kits
  const kits = data.onboardingStarterKits ?? data.starterKits;
  if (kits !== undefined) {
    settingsCache.onboardingStarterKits = kits.map((k) => ({
      ...k,
      currency: k.currency || 'USD',
      isActive: k.isActive ?? true,
    }));
    settingsCache.starterKits = settingsCache.onboardingStarterKits;
  }

  // 4. Payment Gateways
  if (data.paymentGateways !== undefined) {
    settingsCache.paymentGateways = data.paymentGateways;
  }

  // 5. Transactional Email Relay
  const emailData = data.transactionalEmail ?? data.emailRelay;
  if (emailData !== undefined) {
    settingsCache.transactionalEmail = {
      ...settingsCache.transactionalEmail,
      ...emailData,
      registeredTemplates:
        emailData.registeredTemplates ??
        settingsCache.transactionalEmail.registeredTemplates,
    };
    settingsCache.emailRelay = settingsCache.transactionalEmail;
  }

  // 6. Announcements / Top Banner Copy
  const announcementText =
    data.announcements?.storeAnnouncementBarText ??
    data.storeAnnouncementBarText;
  const promoCopy =
    data.announcements?.vipRevealClubPromoCopy ??
    data.vipRevealClubPromoCopy;

  if (announcementText !== undefined) {
    settingsCache.announcements.storeAnnouncementBarText = announcementText;
    settingsCache.storeAnnouncementBarText = announcementText;

    // Sync with live storefront banner
    try {
      await updateBanners({
        announcementText,
        topStickyAnnouncementBar: {
          announcementCopy: announcementText,
          isActive: true,
        },
      });
    } catch {
      // Non-blocking sync
    }
  }

  if (promoCopy !== undefined) {
    settingsCache.announcements.vipRevealClubPromoCopy = promoCopy;
    settingsCache.vipRevealClubPromoCopy = promoCopy;
  }

  settingsCache.updatedAt = new Date().toISOString();

  // Persist to database
  await persistToDb(settingsCache);

  return JSON.parse(JSON.stringify(settingsCache));
};

/**
 * Resets settings back to system defaults.
 */
export const resetSettings = async (): Promise<SystemSettingsDTO> => {
  settingsCache = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
  settingsCache.updatedAt = new Date().toISOString();
  await persistToDb(settingsCache);
  return JSON.parse(JSON.stringify(settingsCache));
};

/**
 * Checks if a representative username is restricted.
 */
export const isUsernameRestricted = (username: string): boolean => {
  const normalized = normalizeUsername(username);
  return settingsCache.restrictedRepUsernames.some(
    (restricted) => normalizeUsername(restricted) === normalized
  );
};

/**
 * Returns current cookie attribution duration in days.
 */
export const getReferralAttributionDays = (): number => {
  return settingsCache.referralAttributionWindowDays || 60;
};

/**
 * Returns public-safe settings for guest shoppers & representative registration.
 */
export const getPublicSettings = async (): Promise<PublicSystemSettingsDTO> => {
  await ensureInitialized();
  return {
    referralAttributionWindowDays: settingsCache.referralAttributionWindowDays,
    onboardingStarterKits: settingsCache.onboardingStarterKits.filter(
      (k) => k.isActive
    ),
    announcements: settingsCache.announcements,
    paymentGateways: settingsCache.paymentGateways.map((g) => ({
      id: g.id,
      name: g.name,
      enabled: g.enabled,
    })),
  };
};

/**
 * Returns available starter kits for representative onboarding.
 */
export const getStarterKits = async (): Promise<StarterKitDTO[]> => {
  await ensureInitialized();
  return settingsCache.onboardingStarterKits;
};

export const settingsService = {
  getSettings,
  updateSettings,
  resetSettings,
  isUsernameRestricted,
  getReferralAttributionDays,
  getPublicSettings,
  getStarterKits,
  DEFAULT_SYSTEM_SETTINGS,
};
