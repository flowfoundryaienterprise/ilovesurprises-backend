import { Request, Response, NextFunction } from 'express';
import * as affiliateService from '../services/affiliate.service';

export const resolveAffiliate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawUsername = String(req.params.username);
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const landingPage = (req.query.landingPage as string) || `/${rawUsername}`;
    const referrerUrl = req.headers['referer'] || (req.query.ref as string);

    const affiliate = await affiliateService.resolveAffiliateByUsername(rawUsername, {
      ipAddress,
      userAgent,
      landingPage,
      referrerUrl,
    });

    if (!affiliate) {
      res.status(404).json({
        status: 'error',
        message: `Affiliate with username or referral code "${rawUsername}" not found`,
      });
      return;
    }

    // Set signed/secure HTTP-only tracking cookie for 30 days
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('ils_affiliate_id', affiliate.id, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    });

    res.status(200).json({
      status: 'success',
      data: {
        affiliate: {
          id: affiliate.id,
          username: affiliate.username,
          referralCode: affiliate.referralCode,
          status: affiliate.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerAffiliate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const affiliate = await affiliateService.registerAffiliate({
      ...req.body,
      userId,
    });

    res.status(201).json({
      status: 'success',
      message: 'Affiliate profile created successfully',
      data: { affiliate },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const dashboard = await affiliateService.getAffiliateDashboard(userId);

    res.status(200).json({
      status: 'success',
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLedger = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const dashboard = await affiliateService.getAffiliateDashboard(userId);
    const ledger = await affiliateService.getAffiliateLedger(
      dashboard.profile.id,
      req.query as any
    );

    res.status(200).json({
      status: 'success',
      data: ledger,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyGenealogy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const dashboard = await affiliateService.getAffiliateDashboard(userId);
    const tree = await affiliateService.getGenealogyDownlines(dashboard.profile.id, 5);

    res.status(200).json({
      status: 'success',
      data: { genealogy: tree },
    });
  } catch (error) {
    next(error);
  }
};

export const affiliateController = {
  resolveAffiliate,
  registerAffiliate,
  getMe,
  getMyLedger,
  getMyGenealogy,
};
