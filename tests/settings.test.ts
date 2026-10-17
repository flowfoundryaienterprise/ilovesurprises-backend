import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { signToken } from '../src/utils/jwt';
import { prisma } from '../src/lib/prisma';
import { UserRole } from '@prisma/client';
import { resetSettings } from '../src/services/settings.service';

describe('System Settings & Store Rules API', () => {
  const app = createApp();

  let adminToken: string;
  let customerToken: string;

  beforeEach(async () => {
    // Ensure clean state before tests
    await resetSettings();

    // Setup Admin Token
    const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
    if (adminUser) {
      adminToken = signToken({
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      });
    } else {
      adminToken = signToken({
        id: 'mock-admin-id',
        email: 'admin@ilovesurprises.com',
        role: UserRole.ADMIN,
      });
    }

    // Setup Customer Token
    const customerUser = await prisma.user.findFirst({ where: { role: UserRole.CUSTOMER } });
    if (customerUser) {
      customerToken = signToken({
        id: customerUser.id,
        email: customerUser.email,
        role: customerUser.role,
      });
    } else {
      customerToken = signToken({
        id: 'mock-cust-id',
        email: 'customer@example.com',
        role: UserRole.CUSTOMER,
      });
    }
  });

  describe('Security & Role Protection', () => {
    it('GET /api/admin/settings should reject unauthorized requests with 401', async () => {
      const res = await request(app).get('/api/admin/settings');
      expect(res.status).toBe(401);
    });

    it('GET /api/admin/settings should reject non-admin users with 403', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('PUT /api/admin/settings should reject unauthenticated requests with 401', async () => {
      const res = await request(app)
        .put('/api/admin/settings')
        .send({ referralAttributionWindowDays: 90 });
      expect(res.status).toBe(401);
    });
  });

  describe('Admin Settings Dashboard Retrieval (Screenshots 1, 2 & 3)', () => {
    it('GET /api/admin/settings should return all default configuration matching frontend screenshots', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      const { settings } = res.body.data;
      expect(settings).toBeDefined();

      // Screenshot 1: Referral Attribution Window (60 Days Recommended)
      expect(settings.referralAttributionWindowDays).toBe(60);

      // Screenshot 1: Restricted Rep Usernames (14 Reserved)
      expect(settings.restrictedRepUsernames).toBeInstanceOf(Array);
      expect(settings.restrictedRepUsernames.length).toBe(14);
      expect(settings.restrictedRepUsernames).toContain('admin');
      expect(settings.restrictedRepUsernames).toContain('administrator');
      expect(settings.restrictedRepUsernames).toContain('ilovesurprises');
      expect(settings.restrictedRepUsernames).toContain('official');
      expect(settings.restrictedRepUsernames).toContain('support');
      expect(settings.restrictedRepUsernames).toContain('help');
      expect(settings.restrictedRepUsernames).toContain('ceo');
      expect(settings.restrictedRepUsernames).toContain('founder');
      expect(settings.restrictedRepUsernames).toContain('billing');
      expect(settings.restrictedRepUsernames).toContain('root');
      expect(settings.restrictedRepUsernames).toContain('payouts');
      expect(settings.restrictedRepUsernames).toContain('security');
      expect(settings.restrictedRepUsernames).toContain('mod');
      expect(settings.restrictedRepUsernames).toContain('staff');

      // Screenshot 2: Onboarding Starter Kits
      expect(settings.onboardingStarterKits).toBeInstanceOf(Array);
      expect(settings.onboardingStarterKits.length).toBe(2);

      const proAmbassador = settings.onboardingStarterKits.find(
        (k: any) => k.id === 'pro-ambassador'
      );
      expect(proAmbassador).toBeDefined();
      expect(proAmbassador.name).toBe('Pro Ambassador Starter Kit');
      expect(proAmbassador.price).toBe(99.0);
      expect(proAmbassador.includes).toContain('Cash Candles (2x)');
      expect(proAmbassador.includes).toContain('Diamond Ring Candles (2x)');

      const essentialLaunch = settings.onboardingStarterKits.find(
        (k: any) => k.id === 'essential-launch'
      );
      expect(essentialLaunch).toBeDefined();
      expect(essentialLaunch.name).toBe('Essential Launch Starter Kit');
      expect(essentialLaunch.price).toBe(49.0);
      expect(essentialLaunch.includes).toContain('Quickstart Digital Guide');

      // Screenshot 2: Payment Gateways & Webhooks
      expect(settings.paymentGateways).toBeInstanceOf(Array);
      expect(settings.paymentGateways.length).toBe(3);
      const stripe = settings.paymentGateways.find((g: any) => g.id === 'stripe');
      expect(stripe).toBeDefined();
      expect(stripe.enabled).toBe(true);
      expect(stripe.status).toContain('Webhook Status: Healthy');

      const paypal = settings.paymentGateways.find((g: any) => g.id === 'paypal');
      expect(paypal).toBeDefined();
      expect(paypal.enabled).toBe(true);

      const appleGoogle = settings.paymentGateways.find(
        (g: any) => g.id === 'apple-google-pay'
      );
      expect(appleGoogle).toBeDefined();
      expect(appleGoogle.enabled).toBe(true);

      // Screenshot 2: Transactional Email Relay
      expect(settings.transactionalEmail).toBeDefined();
      expect(settings.transactionalEmail.activeProvider).toBe('Twilio SendGrid (Standard)');
      expect(settings.transactionalEmail.senderName).toBe('ILoveSurprises Customer Experience');
      expect(settings.transactionalEmail.senderEmail).toBe('support@ilovesurprises.com');
      expect(settings.transactionalEmail.registeredTemplates.length).toBe(4);
      expect(
        settings.transactionalEmail.registeredTemplates.some(
          (t: any) => t.name.includes('Order Confirmation')
        )
      ).toBe(true);

      // Screenshot 3: Top Banner & Site Announcement Copy
      expect(settings.announcements).toBeDefined();
      expect(settings.announcements.storeAnnouncementBarText).toContain('FREE EXPRESS SHIPPING OVER $50');
      expect(settings.announcements.vipRevealClubPromoCopy).toContain('VIP Reveal Club: Save 15%');
    });

    it('GET /api/admin/store-settings should work as an alias route', async () => {
      const res = await request(app)
        .get('/api/admin/store-settings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.settings.referralAttributionWindowDays).toBe(60);
    });
  });

  describe('Update System Settings (SAVE CHANGES)', () => {
    it('PUT /api/admin/settings should update settings across all modules and persist them', async () => {
      const updatePayload = {
        referralAttributionWindowDays: 90,
        restrictedRepUsernames: [
          '@admin',
          '@billing',
          '@vip',
          '@official',
          'support',
        ],
        announcements: {
          storeAnnouncementBarText: '✨ HOLIDAY FLASH SALE: 20% OFF EVERYTHING ✨',
          vipRevealClubPromoCopy: 'Join VIP Club today for exclusive jewelry drops!',
        },
        transactionalEmail: {
          activeProvider: 'Amazon SES',
          senderName: 'ILoveSurprises VIP Support',
          senderEmail: 'vip@ilovesurprises.com',
        },
      };

      const res = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('saved successfully');

      const saved = res.body.data.settings;
      expect(saved.referralAttributionWindowDays).toBe(90);

      // Verify usernames are normalized (leading @ stripped, lowercased, deduplicated)
      expect(saved.restrictedRepUsernames).toContain('vip');
      expect(saved.restrictedRepUsernames).toContain('admin');
      expect(saved.restrictedRepUsernames).toContain('billing');
      expect(saved.restrictedRepUsernames).not.toContain('@vip');

      expect(saved.announcements.storeAnnouncementBarText).toBe(
        '✨ HOLIDAY FLASH SALE: 20% OFF EVERYTHING ✨'
      );
      expect(saved.transactionalEmail.activeProvider).toBe('Amazon SES');
      expect(saved.transactionalEmail.senderEmail).toBe('vip@ilovesurprises.com');

      // Verify persistent on next GET
      const verifyRes = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(verifyRes.body.data.settings.referralAttributionWindowDays).toBe(90);
      expect(verifyRes.body.data.settings.restrictedRepUsernames).toContain('vip');
    });

    it('PATCH /api/admin/settings should allow partial updates', async () => {
      const res = await request(app)
        .patch('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          referralAttributionWindowDays: 180,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.settings.referralAttributionWindowDays).toBe(180);
      // Other settings remain intact
      expect(res.body.data.settings.paymentGateways.length).toBe(3);
    });

    it('POST /api/admin/settings/reset should restore platform defaults', async () => {
      // 1. Modify
      await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ referralAttributionWindowDays: 30 });

      // 2. Reset
      const resetRes = await request(app)
        .post('/api/admin/settings/reset')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.data.settings.referralAttributionWindowDays).toBe(60);
      expect(resetRes.body.data.settings.restrictedRepUsernames.length).toBe(14);
    });
  });

  describe('Public Endpoints & Representative Onboarding', () => {
    it('GET /api/settings/starter-kits should return starter kits publicly for signup flow', async () => {
      const res = await request(app).get('/api/settings/starter-kits');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.starterKits.length).toBe(2);
    });

    it('GET /api/settings should return public-safe settings without requiring auth', async () => {
      const res = await request(app).get('/api/settings');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.onboardingStarterKits).toBeDefined();
      expect(res.body.data.announcements).toBeDefined();
      // Should not expose internal email credentials to anonymous visitors
      expect(res.body.data.transactionalEmail).toBeUndefined();
    });
  });

  describe('Integration with Affiliate System', () => {
    it('POST /api/affiliates/register should reject handles restricted in System Settings', async () => {
      // 'billing' is in the 14 restricted usernames list
      const res = await request(app)
        .post('/api/affiliates/register')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          username: 'billing',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('reserved by the system');
    });

    it('GET /api/affiliates/resolve/:username should set cookie maxAge according to attribution window', async () => {
      // Find an existing affiliate
      const affiliate = await prisma.affiliate_profiles.findFirst({ where: { isActive: true } });
      if (affiliate && affiliate.username) {
        const res = await request(app).get(`/api/affiliates/resolve/${affiliate.username}`);
        expect(res.status).toBe(200);
        const cookie = res.headers['set-cookie']?.[0];
        expect(cookie).toBeDefined();
        // 60 days * 24h * 3600s = 5,184,000 seconds
        expect(cookie).toContain('Max-Age=5184000');
      }
    });
  });
});
