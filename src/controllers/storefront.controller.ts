import { Request, Response, NextFunction } from 'express';
import * as storefrontService from '../services/storefront.service';

export const getStorefrontConfig = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await storefrontService.getStorefrontConfig(true);
    res.status(200).json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

export const getShowcaseCards = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const showcaseCards = await storefrontService.getShowcaseCards(true);
    res.status(200).json({
      status: 'success',
      data: { showcaseCards },
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
      data: { showcaseCard: card },
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

// Backward compatibility object export
export const storefrontController = {
  getStorefrontConfig,
  getShowcaseCards,
  getShowcaseCardByKey,
  getBanners,
};
