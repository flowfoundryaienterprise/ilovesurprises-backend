import { z } from 'zod';

const starterKitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  currency: z.string().default('USD').optional(),
  description: z.string(),
  includes: z.array(z.string()).default([]),
  badge: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});

const paymentGatewaySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: z.string().optional(),
  enabled: z.boolean().default(true),
  subtext: z.string().optional(),
});

const emailTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: z.string().default('Ready ✓'),
  enabled: z.boolean().default(true).optional(),
});

const transactionalEmailSchema = z.object({
  activeProvider: z.string().optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().email().optional(),
  registeredTemplates: z.array(emailTemplateSchema).optional(),
});

const siteAnnouncementsSchema = z.object({
  storeAnnouncementBarText: z.string().optional(),
  vipRevealClubPromoCopy: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  body: z.object({
    referralAttributionWindowDays: z.number().int().min(1).max(365).optional(),
    referralAttributionWindow: z.number().int().min(1).max(365).optional(),
    restrictedRepUsernames: z.array(z.string()).optional(),
    onboardingStarterKits: z.array(starterKitSchema).optional(),
    starterKits: z.array(starterKitSchema).optional(),
    paymentGateways: z.array(paymentGatewaySchema).optional(),
    transactionalEmail: transactionalEmailSchema.optional(),
    emailRelay: transactionalEmailSchema.optional(),
    announcements: siteAnnouncementsSchema.optional(),
    storeAnnouncementBarText: z.string().optional(),
    vipRevealClubPromoCopy: z.string().optional(),
  }),
});
