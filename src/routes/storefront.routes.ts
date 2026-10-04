import { Router } from 'express';
import { storefrontController } from '../controllers/storefront.controller';

export const storefrontRouter = Router();

/**
 * @openapi
 * /api/storefront:
 *   get:
 *     summary: Get live storefront homepage configuration
 *     description: Returns active showcase cards (Halloween, Christmas X, Cash Candles, Zodiac Cash Candles) and active storewide banners (Top Sticky Announcement Bar & Promotional Discount Alert Bar).
 *     tags:
 *       - Storefront
 *     responses:
 *       200:
 *         description: Active storefront configuration.
 */
storefrontRouter.get('/', (req, res, next) => {
  storefrontController.getStorefrontConfig(req, res, next);
});

/**
 * @openapi
 * /api/storefront/showcase:
 *   get:
 *     summary: Get active showcase cards for homepage priority collections
 *     tags:
 *       - Storefront
 *     responses:
 *       200:
 *         description: List of active priority showcase cards.
 */
storefrontRouter.get('/showcase', (req, res, next) => {
  storefrontController.getShowcaseCards(req, res, next);
});

/**
 * @openapi
 * /api/storefront/showcase/{cardKey}:
 *   get:
 *     summary: Get single showcase card by key or slug
 *     tags:
 *       - Storefront
 *     parameters:
 *       - in: path
 *         name: cardKey
 *         required: true
 *         schema:
 *           type: string
 *           example: halloween
 *     responses:
 *       200:
 *         description: Showcase card details.
 *       404:
 *         description: Showcase card not found.
 */
storefrontRouter.get('/showcase/:cardKey', (req, res, next) => {
  storefrontController.getShowcaseCardByKey(req, res, next);
});

/**
 * @openapi
 * /api/storefront/banners:
 *   get:
 *     summary: Get storewide announcement bar and promo alert bar
 *     tags:
 *       - Storefront
 *     responses:
 *       200:
 *         description: Storewide banner announcements.
 */
storefrontRouter.get('/banners', (req, res, next) => {
  storefrontController.getBanners(req, res, next);
});
