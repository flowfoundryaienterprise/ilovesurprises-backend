import { Request, Response, NextFunction } from 'express';
import { membershipService } from '../../services/membership.service';

export class MembershipController {
  async getPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await membershipService.getActivePlans();
      res.json({
        status: 'success',
        data: { plans },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const membership = await membershipService.getUserMembership(userId);
      res.json({
        status: 'success',
        data: { membership },
      });
    } catch (error) {
      next(error);
    }
  }

  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { planSlug } = req.body;
      const membership = await membershipService.subscribe(userId, planSlug);
      res.json({
        status: 'success',
        message: 'Successfully subscribed to VIP membership',
        data: { membership },
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await membershipService.cancelMembership(userId);
      res.json({
        status: 'success',
        message: 'Membership cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async adminList(_req: Request, res: Response, next: NextFunction) {
    try {
      const memberships = await membershipService.listAllMemberships();
      res.json({
        status: 'success',
        data: { memberships },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const membershipController = new MembershipController();
