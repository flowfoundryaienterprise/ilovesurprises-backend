import { Request, Response, NextFunction } from 'express';
import { appraisalService } from '../../services/appraisal.service';

export class AppraisalController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || null;
      const record = await appraisalService.createAppraisal(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Jewelry appraisal submitted successfully',
        data: { appraisal: record },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const records = await appraisalService.getCustomerAppraisals(userId);
      res.json({
        status: 'success',
        data: { appraisals: records },
      });
    } catch (error) {
      next(error);
    }
  }

  async getByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const code = String(req.params.code);
      const record = await appraisalService.getAppraisalByCode(code);
      if (!record) {
        return res.status(404).json({
          status: 'fail',
          message: 'Appraisal record not found',
        });
      }
      res.json({
        status: 'success',
        data: { appraisal: record },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin APIs
  async adminList(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await appraisalService.listAppraisalsAdmin({
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        status: req.query.status as string,
        search: req.query.search as string,
      });
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async adminUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const record = await appraisalService.updateAppraisalAdmin(id, req.body);
      res.json({
        status: 'success',
        message: 'Appraisal updated successfully',
        data: { appraisal: record },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const appraisalController = new AppraisalController();
