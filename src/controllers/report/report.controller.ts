import { Request, Response, NextFunction } from 'express';
import { reportService } from '../../services/report.service';

export class ReportController {
  async getDashboardKPIs(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getDashboardKPIs();
      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSalesAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const data = await reportService.getSalesAnalytics(days);
      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryReport(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getInventoryReport();
      res.json({
        status: 'success',
        data: { inventory: data },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
