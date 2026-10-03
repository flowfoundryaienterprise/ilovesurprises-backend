import { Request, Response, NextFunction } from 'express';
import { affiliateService } from '../../services/affiliate.service';

export class AffiliateController {
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const profile = await affiliateService.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({
          status: 'fail',
          message: 'Affiliate profile not found. You can register as an affiliate.',
        });
      }
      res.json({
        status: 'success',
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const profile = await affiliateService.registerAffiliate(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Affiliate registration successful',
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  async getReferralPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const code = String(req.params.code);
      const rep = await affiliateService.getProfileByReferralCode(code);
      if (!rep) {
        return res.status(404).json({
          status: 'fail',
          message: 'Representative not found',
        });
      }
      res.json({
        status: 'success',
        data: { representative: rep },
      });
    } catch (error) {
      next(error);
    }
  }

  async trackVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await affiliateService.trackVisit({
        ...req.body,
        ipAddress,
        userAgent,
      });
      res.json({ status: 'success', message: 'Visit tracked' });
    } catch (error) {
      next(error);
    }
  }

  async getGenealogy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const tree = await affiliateService.getGenealogyTree(userId);
      res.json({
        status: 'success',
        data: { tree },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommissions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await affiliateService.getCommissions(userId);
      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async requestPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const payout = await affiliateService.requestPayout(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Payout request submitted successfully',
        data: { payout },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const payouts = await affiliateService.getPayouts(userId);
      res.json({
        status: 'success',
        data: { payouts },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const dashboard = await affiliateService.getDashboardSummary(userId);
      res.json({
        status: 'success',
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin handlers
  async adminListAffiliates(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await affiliateService.listAllAffiliates({
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        search: req.query.search as string,
      });
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async adminUpdateAffiliateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { status } = req.body;
      const updated = await affiliateService.updateAffiliateStatus(id, status);
      res.json({ status: 'success', data: { affiliate: updated } });
    } catch (error) {
      next(error);
    }
  }

  async adminListPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await affiliateService.listPayoutRequests({
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        status: req.query.status as string,
      });
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async adminUpdatePayoutStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { status, referenceId, notes } = req.body;
      const updated = await affiliateService.updatePayoutStatus(id, status, referenceId, notes);
      res.json({ status: 'success', data: { payout: updated } });
    } catch (error) {
      next(error);
    }
  }
}

export const affiliateController = new AffiliateController();
