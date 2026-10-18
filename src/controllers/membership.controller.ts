import { Request, Response, NextFunction } from 'express';
import * as membershipService from '../services/membership.service';

export const listAdminMemberships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await membershipService.listAdminMemberships(req.query as any);
    res.status(200).json({
      status: 'success',
      connected: true,
      data: result,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMembershipStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const updated = await membershipService.updateMembershipStatus(id, status);
    res.status(200).json({
      status: 'success',
      message: 'Membership status updated successfully',
      data: { membership: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const getMembershipPricing = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pricing = await membershipService.getMembershipPricingConfig();
    res.status(200).json({
      status: 'success',
      data: { pricing },
      pricing,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMembershipPricing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await membershipService.updateMembershipPricingConfig(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Membership pricing updated successfully',
      data: { pricing: updated },
      pricing: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const listMembershipPlans = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await membershipService.listMembershipPlans();
    res.status(200).json({
      status: 'success',
      data: { plans },
      plans,
    });
  } catch (error) {
    next(error);
  }
};

export const createMembershipPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plan = await membershipService.createMembershipPlan(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Membership plan created successfully',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMembershipPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const plan = await membershipService.updateMembershipPlan(id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Membership plan updated successfully',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
};

export const assignMembership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, planId, status } = req.body;
    const membership = await membershipService.assignMembership(userId, planId, status);
    res.status(201).json({
      status: 'success',
      message: 'Membership assigned successfully',
      data: { membership },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMembership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    await membershipService.deleteMembership(id);
    res.status(200).json({
      status: 'success',
      message: 'Membership cancelled and deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyMembership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }
    const result = await membershipService.getMyMembership(userId);
    res.status(200).json({
      status: 'success',
      data: result,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const subscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }
    const { planId } = req.body;
    const membership = await membershipService.assignMembership(userId, planId, 'ACTIVE');
    res.status(200).json({
      status: 'success',
      message: 'Subscribed to membership plan successfully',
      data: { membership },
    });
  } catch (error) {
    next(error);
  }
};

export const membershipController = {
  listAdminMemberships,
  updateMembershipStatus,
  getMembershipPricing,
  updateMembershipPricing,
  listMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  assignMembership,
  deleteMembership,
  getMyMembership,
  subscribe,
};
