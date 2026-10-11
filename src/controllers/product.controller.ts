import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';

export const listProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await productService.listProducts(req.query as any);
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=600, stale-while-revalidate=86400');
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const identifier = String(req.params.slugOrId || req.params.id);
    const product = await productService.getProductByIdOrSlug(identifier);
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400');
    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = String(req.params.id);
    const userId = req.user ? req.user.id : 'guest-user';
    const review = await productService.createReview(productId, userId, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductsBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let ids: string[] = [];
    if (req.method === 'POST' && Array.isArray(req.body?.ids)) {
      ids = req.body.ids;
    } else if (req.query.ids) {
      ids = String(req.query.ids).split(',').map((s) => s.trim()).filter(Boolean);
    }

    const products = await productService.getProductsBatch(ids);
    res.setHeader('Cache-Control', 'public, max-age=180, s-maxage=1200, stale-while-revalidate=86400');
    res.status(200).json({
      status: 'success',
      data: { products, count: products.length },
    });
  } catch (error) {
    next(error);
  }
};

// Backward compatibility object export
export const productController = {
  listProducts,
  getProduct,
  getProductsBatch,
  createReview,
};
