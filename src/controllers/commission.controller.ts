import { Request, Response, NextFunction } from 'express';
import * as commissionService from '../services/commission.service';
import { prisma } from '../lib/prisma';

export const processOrderCommission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = String(req.params.orderId);
    const result = await commissionService.processOrderCommission(orderId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refundOrderCommission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = String(req.params.orderId);
    const { refundedEligibleAmount, isFullRefund, note } = req.body;

    const result = await commissionService.processOrderRefundCommission(
      orderId,
      refundedEligibleAmount,
      Boolean(isFullRefund),
      note
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderCommissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = String(req.params.orderId);
    const ledgers = await prisma.commission_ledger.findMany({
      where: { orderId },
      include: {
        affiliate_profiles: {
          select: {
            id: true,
            username: true,
            referralCode: true,
          },
        },
      },
      orderBy: { level: 'asc' },
    });

    res.status(200).json({
      status: 'success',
      data: {
        orderId,
        commissions: ledgers.map((l) => ({
          id: l.id,
          level: l.level,
          rate: Number(l.rate),
          commissionableBaseUsd: Number(l.commissionableBaseUsd),
          amountUsd: Number(l.amountUsd),
          status: l.status,
          beneficiary: l.affiliate_profiles,
          availableAt: l.availableAt,
          parentLedgerId: l.parentLedgerId,
          note: l.note,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const commissionController = {
  processOrderCommission,
  refundOrderCommission,
  getOrderCommissions,
};
