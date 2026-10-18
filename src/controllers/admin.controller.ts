import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import * as productService from '../services/product.service';
import { storefrontController } from './storefront.controller';

// ─── USER MANAGEMENT (ADMIN) ──────────────────────────────────────────────────

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

// ─── STOREFRONT CUSTOMIZATION (ADMIN) ─────────────────────────────────────────

export const getStorefrontConfig = storefrontController.getAdminStorefrontConfig;
export const updateFullStorefrontConfig = storefrontController.updateFullStorefrontConfig;
export const resetStorefrontDefaults = storefrontController.resetStorefrontDefaults;

// Hero & Tiles
export const updateHeroContent = storefrontController.updateHeroContent;
export const createBenefitTile = storefrontController.createBenefitTile;
export const updateBenefitTile = storefrontController.updateBenefitTile;
export const deleteBenefitTile = storefrontController.deleteBenefitTile;

// Showcase Cards / Collections
export const createShowcaseCard = storefrontController.createShowcaseCard;
export const updateShowcaseCard = storefrontController.updateShowcaseCard;
export const deleteShowcaseCard = storefrontController.deleteShowcaseCard;

// Announcements & Banners
export const updateStorefrontBanners = storefrontController.updateStorefrontBanners;

// Value Proposition
export const updateValueProposition = storefrontController.updateValueProposition;

// About Brand Story
export const updateAboutContent = storefrontController.updateAboutContent;

// FAQs
export const createFaq = storefrontController.createFaq;
export const updateFaq = storefrontController.updateFaq;
export const deleteFaq = storefrontController.deleteFaq;

// Footer
export const updateFooterContent = storefrontController.updateFooterContent;

// Upload
export const uploadImage = storefrontController.uploadImage;

//  PRODUCT CATALOG (ADMIN) 

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

import * as orderController from './order.controller';
import { membershipController } from './membership.controller';
import { appraisalController } from './appraisal.controller';

// Backward compatibility object export
export const adminController = {
  listUsers,
  getUserById,
  updateUser,
  updateUserRole,
  getStorefrontConfig,
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
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders: orderController.listOrders,
  getOrderById: orderController.getOrderById,
  updateOrderStatus: orderController.updateOrderStatus,
  createOrUpdateFulfillment: orderController.createOrUpdateFulfillment,
  addOrderNote: orderController.addOrderNote,
  processOrderRefund: orderController.processOrderRefund,
  // Memberships
  listMemberships: membershipController.listAdminMemberships,
  updateMembershipStatus: membershipController.updateMembershipStatus,
  getMembershipPricing: membershipController.getMembershipPricing,
  updateMembershipPricing: membershipController.updateMembershipPricing,
  listMembershipPlans: membershipController.listMembershipPlans,
  createMembershipPlan: membershipController.createMembershipPlan,
  updateMembershipPlan: membershipController.updateMembershipPlan,
  assignMembership: membershipController.assignMembership,
  deleteMembership: membershipController.deleteMembership,
  // Appraisals
  listAppraisals: appraisalController.listAdminAppraisals,
  getAppraisalStats: appraisalController.getAppraisalStats,
  createAppraisal: appraisalController.createAppraisal,
  getAppraisalById: appraisalController.getAppraisalById,
  updateAppraisal: appraisalController.updateAppraisal,
  deleteAppraisal: appraisalController.deleteAppraisal,
  clearAppraisals: appraisalController.clearAppraisals,
  resetAppraisals: appraisalController.resetAppraisals,
  updateCustomerSubmission: appraisalController.updateCustomerSubmission,
  deleteCustomerSubmission: appraisalController.deleteCustomerSubmission,
};


