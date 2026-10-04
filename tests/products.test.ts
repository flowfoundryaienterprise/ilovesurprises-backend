import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Products & PDP API (Screenshots 3 & 4)', () => {
  const app = createApp();

  describe('GET /api/products', () => {
    it('should return a paginated product catalog', async () => {
      const res = await request(app).get('/api/products?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.products).toBeDefined();
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
    });

    it('should filter products by search term', async () => {
      const res = await request(app).get('/api/products?search=halloween');
      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBeGreaterThan(0);
      const first = res.body.data.products[0];
      expect(first.name.toLowerCase()).toContain('halloween');
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/products?category=candles');
      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/products/:slugOrId (Creepin' real this halloween)", () => {
    const slug = 'creepin-real-this-halloween-fragrance-bath-bombs';

    it('should return complete product detail page payload matching Screenshot 3', async () => {
      const res = await request(app).get(`/api/products/${slug}`);
      expect(res.status).toBe(200);
      const product = res.body.data.product;

      // Basic info
      expect(product.name).toBe("Creepin' real this halloween Fragrance Bath Bombs");
      expect(product.price).toBe(19.99);
      expect(product.badge).toBe('CANDLES');
      expect(product.inStock).toBe(true);

      // Limited Surprise Batch Urgency (Screenshot 3)
      expect(product.limitedBatchInfo).toBeDefined();
      expect(product.limitedBatchInfo.badge).toBe('LIMITED SURPRISE BATCH');
      expect(product.limitedBatchInfo.urgencyText).toContain('ship today');

      // Guaranteed Fine Jewelry Inside (Screenshot 3)
      expect(product.surpriseRevealInfo).toBeDefined();
      expect(product.surpriseRevealInfo.badge).toBe('Guaranteed Fine Jewelry Inside');
      expect(product.surpriseRevealInfo.valueRange).toBe('Jewelry inside worth $10 - $7,500');
      expect(product.surpriseRevealInfo.description).toContain('sealed, waterproof, heat-resistant capsule');
      expect(product.surpriseRevealInfo.appraisalCallout).toContain('tailored in Size 7 appraised $10 to $7,500');

      // Fragrance / Scent Options (Screenshot 3)
      expect(product.scentOptions).toBeDefined();
      expect(product.scentOptions.length).toBeGreaterThanOrEqual(1);
      const pumpkinScent = product.scentOptions[0];
      expect(pumpkinScent.name).toContain('Pumpkin Spice');
      expect(pumpkinScent.subtitle).toContain('holiday favorite');
      expect(pumpkinScent.isPriority).toBe(true);

      // Jewelry Reveal Types (Screenshot 3)
      expect(product.jewelryTypes).toEqual(
        expect.arrayContaining(['Ring', 'Necklace', 'Earrings', 'Bracelet'])
      );

      // Ring Sizes (Screenshot 3)
      expect(product.ringSizes).toEqual(
        expect.arrayContaining(['5', '6', '7', '8', '9', '10'])
      );

      // Trust Badges (Screenshot 3)
      expect(product.trustBadges).toEqual(
        expect.arrayContaining([
          '100% Win Guarantee',
          'Free Shipping $50+',
          '30-Day Returns',
          'Made in USA',
        ])
      );

      // Customer Reviews Summary & Rating Breakdown (Screenshot 4)
      expect(product.reviewsSummary).toBeDefined();
      expect(product.reviewsSummary.overallRating).toBe(4.8);
      expect(product.reviewsSummary.maxRating).toBe(5.0);
      expect(product.reviewsSummary.appraisedValueRange).toBe('$10 - $7,500');
      expect(product.reviewsSummary.guaranteeBadge).toContain('100% Win Guarantee Verified');

      // Check star percentage breakdown
      const breakdown = product.reviewsSummary.breakdown;
      const fiveStar = breakdown.find((b: any) => b.stars === 5);
      expect(fiveStar).toBeDefined();
      expect(fiveStar.percentage).toBe(88);
    });

    it('should return 404 for unknown product identifier', async () => {
      const res = await request(app).get('/api/products/completely-unknown-slug-xyz');
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/products/:id/reviews', () => {
    it('should submit a product review and return success', async () => {
      const res = await request(app)
        .post('/api/products/prod-halloween-bath-bomb-01/reviews')
        .send({
          rating: 5,
          title: 'Unbelievable Diamond Reveal!',
          comment: 'The scent was heavenly and I revealed an authentic appraised ring inside!',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.review.rating).toBe(5);
    });

    it('should reject invalid review payload with 400', async () => {
      const res = await request(app)
        .post('/api/products/prod-halloween-bath-bomb-01/reviews')
        .send({
          rating: 7, // Invalid rating > 5
          comment: 'ab', // Too short
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
});
