import { Request, Response, NextFunction } from 'express';
import * as storefrontService from '../services/storefront.service';
import { saveBase64Image } from '../middlewares/upload.middleware';

// ─── PUBLIC STOREFRONT CONTROLLERS ───────────────────────────────────────────

export const getStorefrontConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const activeOnly = req.query.all !== 'true';
    const config = await storefrontService.getStorefrontConfig(activeOnly);
    res.status(200).json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

export const getHeroContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const activeOnly = req.query.all !== 'true';
    const hero = await storefrontService.getHeroContent(activeOnly);
    res.status(200).json({
      status: 'success',
      data: { hero },
    });
  } catch (error) {
    next(error);
  }
};

export const getBenefitTiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const activeOnly = req.query.all !== 'true';
    const benefitTiles = await storefrontService.getBenefitTiles(activeOnly);
    res.status(200).json({
      status: 'success',
      data: { benefitTiles },
    });
  } catch (error) {
    next(error);
  }
};

export const getBenefitTileById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const tile = await storefrontService.getBenefitTileById(id);
    res.status(200).json({
      status: 'success',
      data: { benefitTile: tile },
    });
  } catch (error) {
    next(error);
  }
};

export const getShowcaseCards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const activeOnly = req.query.all !== 'true';
    const showcaseCards = await storefrontService.getShowcaseCards(activeOnly);
    res.status(200).json({
      status: 'success',
      data: { showcaseCards, featuredCards: showcaseCards },
    });
  } catch (error) {
    next(error);
  }
};

export const getShowcaseCardByKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cardKey = String(req.params.cardKey);
    const card = await storefrontService.getShowcaseCardByKey(cardKey);
    res.status(200).json({
      status: 'success',
      data: { showcaseCard: card, featuredCard: card },
    });
  } catch (error) {
    next(error);
  }
};

export const getBanners = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const banners = await storefrontService.getBanners();
    res.status(200).json({
      status: 'success',
      data: { banners },
    });
  } catch (error) {
    next(error);
  }
};

export const getValueProposition = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const valueProposition = await storefrontService.getValueProposition();
    res.status(200).json({
      status: 'success',
      data: { valueProposition },
    });
  } catch (error) {
    next(error);
  }
};

export const getAboutContent = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const aboutContent = await storefrontService.getAboutContent();
    res.status(200).json({
      status: 'success',
      data: { aboutContent },
    });
  } catch (error) {
    next(error);
  }
};

export const getFaqs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const activeOnly = req.query.all !== 'true';
    const faqs = await storefrontService.getFaqs(category, activeOnly);
    res.status(200).json({
      status: 'success',
      data: { faqs, faqItems: faqs },
    });
  } catch (error) {
    next(error);
  }
};

export const getFaqById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const faq = await storefrontService.getFaqById(id);
    res.status(200).json({
      status: 'success',
      data: { faq, faqItem: faq },
    });
  } catch (error) {
    next(error);
  }
};

export const getFooterContent = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const footerContent = await storefrontService.getFooterContent();
    res.status(200).json({
      status: 'success',
      data: { footerContent },
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN STOREFRONT MUTATION CONTROLLERS ────────────────────────────────────

export const getAdminStorefrontConfig = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await storefrontService.getStorefrontConfig(false);
    res.status(200).json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFullStorefrontConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await storefrontService.updateFullStorefrontConfig(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Storefront content published live across all sections',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const resetStorefrontDefaults = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const defaults = await storefrontService.resetStorefrontDefaults();
    res.status(200).json({
      status: 'success',
      message: 'All storefront content successfully reset to system defaults',
      data: defaults,
    });
  } catch (error) {
    next(error);
  }
};

// Hero & Tiles
export const updateHeroContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hero = await storefrontService.updateHeroContent(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Hero images and headline updated successfully',
      data: { hero },
    });
  } catch (error) {
    next(error);
  }
};

export const createBenefitTile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tile = await storefrontService.createBenefitTile(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Hero benefit tile created successfully',
      data: { benefitTile: tile },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBenefitTile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const tile = await storefrontService.updateBenefitTile(id, req.body);
    res.status(200).json({
      status: 'success',
      message: `Benefit tile "${id}" updated successfully`,
      data: { benefitTile: tile },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBenefitTile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const result = await storefrontService.deleteBenefitTile(id);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// Showcase Cards
export const createShowcaseCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const card = await storefrontService.createShowcaseCard(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Showcase card created successfully',
      data: { showcaseCard: card, featuredCard: card },
    });
  } catch (error) {
    next(error);
  }
};

export const updateShowcaseCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cardKey = String(req.params.cardKey);
    const updatedCard = await storefrontService.updateShowcaseCard(cardKey, req.body);
    res.status(200).json({
      status: 'success',
      message: `Showcase card "${cardKey}" updated successfully`,
      data: { showcaseCard: updatedCard, featuredCard: updatedCard },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShowcaseCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cardKey = String(req.params.cardKey);
    const result = await storefrontService.deleteShowcaseCard(cardKey);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// Banners
export const updateStorefrontBanners = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updatedBanners = await storefrontService.updateBanners(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Storefront banners and announcements updated successfully',
      data: { banners: updatedBanners },
    });
  } catch (error) {
    next(error);
  }
};

// Value Proposition
export const updateValueProposition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await storefrontService.updateValueProposition(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Value proposition updated successfully',
      data: { valueProposition: updated },
    });
  } catch (error) {
    next(error);
  }
};

// About Brand Story
export const updateAboutContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await storefrontService.updateAboutContent(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Brand story and about copy updated successfully',
      data: { aboutContent: updated },
    });
  } catch (error) {
    next(error);
  }
};

// FAQs
export const createFaq = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const faq = await storefrontService.createFaq(req.body);
    res.status(201).json({
      status: 'success',
      message: 'FAQ item added to catalog successfully',
      data: { faq, faqItem: faq },
    });
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const faq = await storefrontService.updateFaq(id, req.body);
    res.status(200).json({
      status: 'success',
      message: `FAQ item "${id}" updated successfully`,
      data: { faq, faqItem: faq },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const result = await storefrontService.deleteFaq(id);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// Footer
export const updateFooterContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await storefrontService.updateFooterContent(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Storewide footer and legal copy updated successfully',
      data: { footerContent: updated },
    });
  } catch (error) {
    next(error);
  }
};

// Image Upload
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Multipart uploaded file via Multer
    if (req.file) {
      const relativeUrl = `/uploads/${req.file.filename}`;
      const protocol = req.protocol;
      const host = req.get('host');
      const absoluteUrl = `${protocol}://${host}${relativeUrl}`;

      res.status(200).json({
        status: 'success',
        message: 'Image uploaded successfully',
        data: {
          url: relativeUrl,
          absoluteUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
      return;
    }

    // 2. Base64 Data URL (e.g. data:image/png;base64,...)
    const base64Data = req.body.image || req.body.dataUrl || req.body.file;
    if (typeof base64Data === 'string' && base64Data.startsWith('data:image/')) {
      const relativeUrl = await saveBase64Image(base64Data);
      const protocol = req.protocol;
      const host = req.get('host');
      const absoluteUrl = `${protocol}://${host}${relativeUrl}`;

      res.status(200).json({
        status: 'success',
        message: 'Image uploaded successfully from Data URL',
        data: {
          url: relativeUrl,
          absoluteUrl,
        },
      });
      return;
    }

    // 3. Existing URL passed through
    if (typeof base64Data === 'string' && (base64Data.startsWith('http://') || base64Data.startsWith('https://') || base64Data.startsWith('/'))) {
      res.status(200).json({
        status: 'success',
        message: 'Image URL received',
        data: {
          url: base64Data,
        },
      });
      return;
    }

    res.status(400).json({
      status: 'error',
      message: 'No image file or valid base64 image data provided',
    });
  } catch (error) {
    next(error);
  }
};

// ─── BACKWARD COMPATIBILITY CONTROLLER EXPORT ─────────────────────────────────

export const storefrontController = {
  getStorefrontConfig,
  getHeroContent,
  getBenefitTiles,
  getBenefitTileById,
  getShowcaseCards,
  getShowcaseCardByKey,
  getBanners,
  getValueProposition,
  getAboutContent,
  getFaqs,
  getFaqById,
  getFooterContent,
  getAdminStorefrontConfig,
  updateFullStorefrontConfig,
  resetStorefrontDefaults,
  updateHeroContent,
  createBenefitTile,
  updateBenefitTile,
  deleteBenefitTile,
  createShowcaseCard,
  updateShowcaseCard,
  deleteShowcaseCard,
  updateStorefrontBanners,
  updateValueProposition,
  updateAboutContent,
  createFaq,
  updateFaq,
  deleteFaq,
  updateFooterContent,
  uploadImage,
};
