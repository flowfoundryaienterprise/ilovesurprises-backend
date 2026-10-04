import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import * as storefrontService from '../services/storefront.service';
import * as productService from '../services/product.service';

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await adminService.listUsers(req.query as any);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const user = await adminService.getUserById(id);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const user = await adminService.updateUser(id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const user = await adminService.updateUserRole(id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const getStorefrontConfig = async (
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
      data: { showcaseCard: updatedCard },
    });
  } catch (error) {
    next(error);
  }
};

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

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const product = await productService.updateProduct(id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const result = await productService.deleteProduct(id);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// Backward compatibility object export
export const adminController = {
  listUsers,
  getUserById,
  updateUser,
  updateUserRole,
  getStorefrontConfig,
  updateShowcaseCard,
  updateStorefrontBanners,
  createProduct,
  updateProduct,
  deleteProduct,
};
