import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { signToken } from '../src/utils/jwt';
import { prisma } from '../src/lib/prisma';
import { UserRole } from '@prisma/client';

describe('Storefront & Admin Customization API', () => {
  const app = createApp();

  describe('Public Storefront Endpoints', () => {
    it('GET /api/storefront should return 4 priority showcase cards and storewide banners', async () => {
      const res = await request(app).get('/api/storefront');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.showcaseCards).toBeDefined();
      expect(res.body.data.showcaseCards.length).toBe(4);

      const titles = res.body.data.showcaseCards.map((c: any) => c.displayTitle);
      expect(titles.some((t: string) => t.includes('Halloween'))).toBe(true);

      const banners = res.body.data.banners;
      expect(banners.topStickyAnnouncementBar).toBeDefined();
      expect(banners.topStickyAnnouncementBar.isActive).toBe(true);
      expect(typeof banners.topStickyAnnouncementBar.announcementCopy).toBe('string');
      expect(banners.topStickyAnnouncementBar.announcementCopy.length).toBeGreaterThan(0);

      expect(banners.promotionalDiscountAlertBar).toBeDefined();
      expect(banners.promotionalDiscountAlertBar.promoCode).toBeDefined();
    });

    it('GET /api/storefront/showcase should return active showcase cards', async () => {
      const res = await request(app).get('/api/storefront/showcase');
      expect(res.status).toBe(200);
      expect(res.body.data.showcaseCards.length).toBe(4);
    });

    it('GET /api/storefront/showcase/halloween should return Halloween card matching screenshot 1', async () => {
      const res = await request(app).get('/api/storefront/showcase/halloween');
      expect(res.status).toBe(200);
      const card = res.body.data.showcaseCard;
      expect(card.cardKey).toBe('halloween');
      expect(card.displayTitle).toBeDefined();
      expect(card.highlightBadge).toBeDefined();
      expect(typeof card.ctaButtonText).toBe('string');
      expect(card.ctaButtonText.length).toBeGreaterThan(0);
      expect(card.targetCategoryKey).toBe('Halloween');
      expect(card.showcaseImageUri).toContain('cdn.shopify.com');
      expect(card.displayOnHomepage).toBe(true);
      expect(card.isActive).toBe(true);
    });

    it('GET /api/storefront/showcase/non-existent-card should return 404', async () => {
      const res = await request(app).get('/api/storefront/showcase/non-existent-card');
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });

    it('GET /api/storefront/banners should return top announcement bar and promo alert bar', async () => {
      const res = await request(app).get('/api/storefront/banners');
      expect(res.status).toBe(200);
      expect(res.body.data.banners.topStickyAnnouncementBar).toBeDefined();
      expect(res.body.data.banners.promotionalDiscountAlertBar).toBeDefined();
    });
  });

  describe('Admin Storefront Customization (Screenshots 1 & 2)', () => {
    it('PATCH /api/admin/storefront/showcase/halloween should require ADMIN authentication', async () => {
      // 1. Without token: 401
      const unauthRes = await request(app)
        .patch('/api/admin/storefront/showcase/halloween')
        .send({ displayTitle: 'Hacked Halloween' });
      expect(unauthRes.status).toBe(401);

      // 2. With customer token: 403
      const customerUser = await prisma.user.findFirst({ where: { role: UserRole.CUSTOMER } });
      if (customerUser) {
        const customerToken = signToken({
          id: customerUser.id,
          email: customerUser.email,
          role: customerUser.role,
        });

        const forbiddenRes = await request(app)
          .patch('/api/admin/storefront/showcase/halloween')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({ displayTitle: 'Hacked Halloween' });
        expect(forbiddenRes.status).toBe(403);
      }
    });

    it('PATCH /api/admin/storefront/showcase/halloween with ADMIN role should successfully update showcase card', async () => {
      const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
      expect(adminUser).toBeDefined();

      const adminToken = signToken({
        id: adminUser!.id,
        email: adminUser!.email,
        role: adminUser!.role,
      });

      const updatePayload = {
        displayTitle: 'Halloween Spooktacular Reveal',
        highlightBadge: 'Exclusive Priority',
        tagline: 'Limited-edition Halloween candles with guaranteed diamonds & cash prizes!',
        ctaButtonText: 'Claim Spooky Candle',
      };

      const res = await request(app)
        .patch('/api/admin/storefront/showcase/halloween')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.showcaseCard.displayTitle).toBe(updatePayload.displayTitle);
      expect(res.body.data.showcaseCard.highlightBadge).toBe(updatePayload.highlightBadge);
      expect(res.body.data.showcaseCard.ctaButtonText).toBe(updatePayload.ctaButtonText);

      // Verify that public endpoint reflects updated showcase card
      const publicRes = await request(app).get('/api/storefront/showcase/halloween');
      expect(publicRes.body.data.showcaseCard.displayTitle).toBe(updatePayload.displayTitle);
    });

    it('PATCH /api/admin/storefront/banners with ADMIN role should update storewide banners', async () => {
      const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
      const adminToken = signToken({
        id: adminUser!.id,
        email: adminUser!.email,
        role: adminUser!.role,
      });

      const res = await request(app)
        .patch('/api/admin/storefront/banners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          topStickyAnnouncementBar: {
            announcementCopy: '⚡ FLASH SALE: FREE SHIPPING ON ALL CASH CANDLES TODAY ONLY!',
          },
          promotionalDiscountAlertBar: {
            promoCode: 'SPOOKY20',
            promoCopy: 'Use code SPOOKY20 for 20% OFF your surprise reveal!',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.banners.topStickyAnnouncementBar.announcementCopy).toContain('FLASH SALE');
      expect(res.body.data.banners.promotionalDiscountAlertBar.promoCode).toBe('SPOOKY20');

      // Verify public banner endpoint
      const publicBannerRes = await request(app).get('/api/storefront/banners');
      expect(publicBannerRes.body.data.banners.promotionalDiscountAlertBar.promoCode).toBe('SPOOKY20');
    });
  });
});
