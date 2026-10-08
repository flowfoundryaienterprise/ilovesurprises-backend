import { Decimal } from 'decimal.js';

export interface PayoutChainItem {
  level: number;
  affiliateId: string;
  rate: Decimal;
}

export interface CommissionCalculationResult {
  status:
    | 'success'
    | 'no_affiliate_attributed'
    | 'already_processed'
    | 'zero_commissionable_base'
    | 'self_referral_blocked_completely';
  orderId?: string;
  commissionableBaseUsd?: number;
  totalRate?: number;
  payoutsCount?: number;
  payouts?: Array<{
    level: number;
    beneficiaryId: string;
    rate: number;
    amountUsd: number;
  }>;
}

export interface RefundCommissionResult {
  status: 'success' | 'order_not_found' | 'no_commissions_found';
  orderId: string;
  reversalCount: number;
  totalReversalUsd: number;
}
