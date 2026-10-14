import { Router } from 'express';
import { storefrontController } from '../controllers/storefront.controller';
import { uploadImageMiddleware } from '../middlewares/upload.middleware';

const handleMulterUpload = (req: any, res: any, next: any) => {
  if (req.is('multipart/form-data')) {
    uploadImageMiddleware.any()(req, res, (err) => {
      if (err) return next(err);
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        req.file = req.files[0];
      }
      next();
    });
  } else {
    next();
  }
};

export const storefrontRouter = Router();

/**
 * @openapi
 * /api/storefront:
 *   get:
 *     summary: Get live storefront homepage configuration
 *     description: Returns the complete active storefront configuration including hero banner, benefit tiles, priority collection cards, storewide announcements, value proposition, brand story, FAQs, and footer settings.
 *     tags:
 *       - Storefront
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: If true, returns all items including drafts/inactives
 *     responses:
 *       200:
 *         description: Active storefront configuration.
 */
storefrontRouter.get('/', (req, res, next) => {
  storefrontController.getStorefrontConfig(req, res, next);
});

/**
 * @openapi
 * /api/storefront/hero:
 *   get:
 *     summary: Get hero banners and benefit quick-action tiles
 *     tags:
 *       - Storefront
 *     responses:
 *       200:
 *         description: Hero section configuration.
 */
storefrontRouter.get('/hero', (req, res, next) => {
  storefrontController.getHeroContent(req, res, next);
});

/**
 * @openapi
 * /api/storefront/hero/tiles:
 *   get:
 *     summary: Get all hero benefit tiles
 *     tags:
 *       - Storefront
 *     responses:
 *       200:
 *         description: List of hero benefit tiles.
 */
storefrontRouter.get('/hero/tiles', (req, res, next) => {
  storefrontController.getBenefitTiles(req, res, next);
});

/**
 * @openapi
 * /api/storefront/hero/tiles/{id}:
 *   get:
 *     summary: Get single benefit tile by ID
 *     tags:
 *       - Storefront
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Benefit tile details.
 */
storefrontRouter.get('/hero/tiles/:id', (req, res, next) => {
  storefrontController.getBenefitTileById(req, res, next);
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

/**
 * @openapi
 * /api/storefront/value-proposition:
 *   get:
 *     summary: Get value proposition and guarantee pillars
 *     tags:
 *       - Storefront
 *     responses:
 *       200:
 *         description: Value proposition copy and bullet points.
 */
storefrontRouter.get('/value-proposition', (req, res, next) => {
  storefrontController.getValueProposition(req, res, next);
});

/**
 * @openapi
 * /api/storefront/about:
 *   get:
 *     summary: Get brand story and craftsmanship content
 *     tags:
 *       - Storefront
 *     responses:
 *       200:
 *         description: About brand story and proof stats.
 */
storefrontRouter.get('/about', (req, res, next) => {
  storefrontController.getAboutContent(req, res, next);
});

/**
 * @openapi
 * /api/storefront/faqs:
 *   get:
 *     summary: Get public FAQs catalog
 *     tags:
 *       - Storefront
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Optional category filter (e.g. Products, About Surprises)
 *     responses:
 *       200:
 *         description: List of FAQs.
 */
storefrontRouter.get('/faqs', (req, res, next) => {
  storefrontController.getFaqs(req, res, next);
});

/**
 * @openapi
 * /api/storefront/faqs/{id}:
 *   get:
 *     summary: Get single FAQ by ID
 *     tags:
 *       - Storefront
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ details.
 */
storefrontRouter.get('/faqs/:id', (req, res, next) => {
  storefrontController.getFaqById(req, res, next);
});

/**
 * @openapi
 * /api/storefront/footer:
 *   get:
 *     summary: Get storewide footer copy, support contacts, and legal notices
 *     tags:
 *       - Storefront
 *     responses:
 *       200:
 *         description: Storewide footer copy.
 */
storefrontRouter.get('/footer', (req, res, next) => {
  storefrontController.getFooterContent(req, res, next);
});

/**
 * @openapi
 * /api/storefront/upload:
 *   post:
 *     summary: Upload storefront images (hero banners, showcase cards, brand story)
 *     tags:
 *       - Storefront
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               image:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 Data URL (e.g. data:image/png;base64,...)
 *     responses:
 *       200:
 *         description: Image uploaded successfully with file URI.
 */
storefrontRouter.post('/upload', handleMulterUpload, (req, res, next) => {
  storefrontController.uploadImage(req, res, next);
});

storefrontRouter.post('/upload-image', handleMulterUpload, (req, res, next) => {
  storefrontController.uploadImage(req, res, next);
});

