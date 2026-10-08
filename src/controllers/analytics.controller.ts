import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';
import { AnalyticsTimeframe } from '../types/analytics.types';

export const getAnalyticsReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const timeframe = (req.query.timeframe as AnalyticsTimeframe) || '7D';
    const report = await analyticsService.getAnalyticsReport(timeframe);

    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getCommissionCentralOverview = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const overview = await analyticsService.getCommissionCentralOverview();

    res.status(200).json({
      status: 'success',
      data: overview,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminCommissionLedger = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, status, tier, page, limit } = req.query as any;
    const ledger = await analyticsService.getAdminCommissionLedger({
      search,
      status,
      tier,
      page,
      limit,
    });

    res.status(200).json({
      status: 'success',
      data: ledger,
    });
  } catch (error) {
    next(error);
  }
};

export const exportReportsCsv = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const type = (req.query.type as 'sales' | 'ledger' | 'affiliates') || 'sales';
    const csv = await analyticsService.exportCsvData(type);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_report.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const analyticsController = {
  getAnalyticsReport,
  getCommissionCentralOverview,
  getAdminCommissionLedger,
  exportReportsCsv,
};
