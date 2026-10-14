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

    it('Hero & Benefit Tiles: PATCH /hero, POST/PATCH/DELETE /hero/tiles', async () => {
      const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
      const adminToken = signToken({
        id: adminUser!.id,
        email: adminUser!.email,
        role: adminUser!.role,
      });

      // 1. Update hero images & headline
      const heroUpdate = {
        headline: 'Discover Genuine Surprises Inside Every Candle!',
        desktopBannerImage: '/uploads/new-hero-banner.jpg',
        mobileBannerImage: '/uploads/mobile-banner.jpg',
      };
      const heroRes = await request(app)
        .patch('/api/admin/storefront/hero')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(heroUpdate);
      expect(heroRes.status).toBe(200);
      expect(heroRes.body.data.hero.headline).toBe(heroUpdate.headline);

      // Verify public hero
      const publicHero = await request(app).get('/api/storefront/hero');
      expect(publicHero.status).toBe(200);
      expect(publicHero.body.data.hero.headline).toBe(heroUpdate.headline);

      // 2. Create a new benefit tile
      const newTileRes = await request(app)
        .post('/api/admin/storefront/hero/tiles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          id: 'test-custom-tile',
          title: 'Instant Cash Reveal',
          subtitle: 'Win cash prizes up to $2,500',
          iconName: 'Sparkles',
          actionType: 'shop',
        });
      expect(newTileRes.status).toBe(201);
      expect(newTileRes.body.data.benefitTile.title).toBe('Instant Cash Reveal');

      // 3. Update benefit tile
      const updateTileRes = await request(app)
        .patch('/api/admin/storefront/hero/tiles/test-custom-tile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Instant Cash Drop' });
      expect(updateTileRes.status).toBe(200);
      expect(updateTileRes.body.data.benefitTile.title).toBe('Instant Cash Drop');

      // 4. Delete benefit tile
      const delTileRes = await request(app)
        .delete('/api/admin/storefront/hero/tiles/test-custom-tile')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(delTileRes.status).toBe(200);
      expect(delTileRes.body.status).toBe('success');
    });

    it('Showcase Cards CRUD: POST & DELETE /showcase', async () => {
      const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
      const adminToken = signToken({
        id: adminUser!.id,
        email: adminUser!.email,
        role: adminUser!.role,
      });

      // 1. Create a new showcase card
      const createRes = await request(app)
        .post('/api/admin/storefront/showcase')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cardKey: 'spring-reveal',
          title: 'Spring Bloom Candles',
          highlightBadge: 'Limited Seasonal',
          tagline: 'Spring seasonal surprises with diamond ring reveals',
          ctaButtonText: 'Shop Spring Bloom',
          targetCategoryKey: 'Spring',
          showcaseImageUri: '/assets/ilovesurprises/spring.jpg',
          displayOnHomepage: true,
          isActive: true,
        });
      expect(createRes.status).toBe(201);
      expect(createRes.body.data.showcaseCard.cardKey).toBe('spring-reveal');

      // 2. Fetch created card
      const getRes = await request(app).get('/api/storefront/showcase/spring-reveal');
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.showcaseCard.displayTitle).toBe('Spring Bloom Candles');

      // 3. Delete showcase card
      const delRes = await request(app)
        .delete('/api/admin/storefront/showcase/spring-reveal')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.status).toBe('success');
    });

    it('Value Proposition & About Brand Story: GET & PATCH', async () => {
      const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
      const adminToken = signToken({
        id: adminUser!.id,
        email: adminUser!.email,
        role: adminUser!.role,
      });

      // 1. Value Proposition
      const vpRes = await request(app)
        .patch('/api/admin/storefront/value-proposition')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          eyebrow: '100% Real Reveal Guarantee Tested',
          title: 'Why Thousands Adore ILoveSurprises',
          description: 'Authentic cash prizes and verified fine jewelry inside every candle.',
          points: ['Guaranteed real cash', 'Fine .925 sterling silver jewelry'],
        });
      expect(vpRes.status).toBe(200);
      expect(vpRes.body.data.valueProposition.title).toBe('Why Thousands Adore ILoveSurprises');

      // Public GET
      const pubVp = await request(app).get('/api/storefront/value-proposition');
      expect(pubVp.status).toBe(200);
      expect(pubVp.body.data.valueProposition.title).toBe('Why Thousands Adore ILoveSurprises');

      // 2. About Brand Story
      const aboutRes = await request(app)
        .patch('/api/admin/storefront/about')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          headline: 'Crafted with Passion & Real Surprises',
          storyText: 'Handcrafted soy candles with cash and diamonds.',
          naturalSoyStat: '100% Soy Wax',
          unboxingsStat: '100,000+ Unboxings',
        });
      expect(aboutRes.status).toBe(200);
      expect(aboutRes.body.data.aboutContent.naturalSoyStat).toBe('100% Soy Wax');

      // Public GET
      const pubAbout = await request(app).get('/api/storefront/about');
      expect(pubAbout.status).toBe(200);
      expect(pubAbout.body.data.aboutContent.naturalSoyStat).toBe('100% Soy Wax');
    });

    it('FAQ Catalog CRUD: POST, PATCH, DELETE /faqs', async () => {
      const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
      const adminToken = signToken({
        id: adminUser!.id,
        email: adminUser!.email,
        role: adminUser!.role,
      });

      // 1. Add new FAQ item (matching "+ Add to FAQ Catalog")
      const newFaq = {
        question: 'Are there cash prizes in every single candle?',
        answer: 'Yes! Every cash candle contains genuine cold hard cash from $2 up to $2,500.',
        category: 'Cash Prizes',
      };
      const createRes = await request(app)
        .post('/api/admin/storefront/faqs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newFaq);
      expect(createRes.status).toBe(201);
      const createdId = createRes.body.data.faq.id;
      expect(createdId).toBeDefined();

      // 2. Update FAQ item
      const updateRes = await request(app)
        .patch(`/api/admin/storefront/faqs/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ question: 'Are there guaranteed cash prizes in all cash candles?' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.faq.question).toContain('guaranteed cash prizes');

      // 3. Delete FAQ item
      const delRes = await request(app)
        .delete(`/api/admin/storefront/faqs/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.status).toBe('success');
    });

    it('Footer & Legal: GET & PATCH /footer', async () => {
      const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
      const adminToken = signToken({
        id: adminUser!.id,
        email: adminUser!.email,
        role: adminUser!.role,
      });

      const footerRes = await request(app)
        .patch('/api/admin/storefront/footer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newsletterTitle: 'Unlock 20% Off Your Next Surprise Reveal',
          supportEmail: 'care@ilovesurprises.com',
          supportPhone: '1-888-SURPRISE',
        });
      expect(footerRes.status).toBe(200);
      expect(footerRes.body.data.footerContent.supportEmail).toBe('care@ilovesurprises.com');

      const pubFooter = await request(app).get('/api/storefront/footer');
      expect(pubFooter.status).toBe(200);
      expect(pubFooter.body.data.footerContent.supportEmail).toBe('care@ilovesurprises.com');
    });

    it('Storefront Bulk Publish & Reset: PUT /storefront and POST /storefront/reset', async () => {
      const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
      const adminToken = signToken({
        id: adminUser!.id,
        email: adminUser!.email,
        role: adminUser!.role,
      });

      // 1. Bulk Publish
      const bulkRes = await request(app)
        .put('/api/admin/storefront')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          announcementText: '🔥 STOREWIDE MEGA SALE LIVE NOW!',
          announcementActive: true,
          hero: {
            headline: 'Bulk Published Headline Test',
          },
        });
      expect(bulkRes.status).toBe(200);
      expect(bulkRes.body.data.announcementText).toBe('🔥 STOREWIDE MEGA SALE LIVE NOW!');

      // 2. Reset Defaults (matching "Reset Defaults" button)
      const resetRes = await request(app)
        .post('/api/admin/storefront/reset')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(resetRes.status).toBe(200);
      expect(resetRes.body.status).toBe('success');
      expect(resetRes.body.data.showcaseCards.length).toBe(4);
    });

    it('Image Upload: POST /api/admin/storefront/upload with base64 Data URL and multipart file', async () => {
      const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
      const adminToken = signToken({
        id: adminUser!.id,
        email: adminUser!.email,
        role: adminUser!.role,
      });

      // 1. Base64 Data URL upload
      const testPngBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const base64Res = await request(app)
        .post('/api/admin/storefront/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ image: testPngBase64 });

      expect(base64Res.status).toBe(200);
      expect(base64Res.body.status).toBe('success');
      expect(base64Res.body.data.url).toMatch(/^\/uploads\/upload-/);

      // Verify the uploaded file is accessible via express.static
      const staticRes = await request(app).get(base64Res.body.data.url);
      expect(staticRes.status).toBe(200);

      // 2. Multipart file upload
      const multipartRes = await request(app)
        .post('/api/storefront/upload')
        .attach('image', Buffer.from('fake image content'), 'test-banner.png');

      expect(multipartRes.status).toBe(200);
      expect(multipartRes.body.status).toBe('success');
      expect(multipartRes.body.data.url).toMatch(/^\/uploads\//);
    });
  });
});

