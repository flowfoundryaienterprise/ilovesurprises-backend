export interface AffiliateProfileDTO {
  id: string;
  userId: string;
  username: string | null;
  referralCode: string;
  slug: string | null;
  sponsorId: string | null;
  status: string;
  isActive: boolean;
  payoutStatus: string;
  lifetimeEarnings: number;
  currentBalance: number;
  pendingBalance: number;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
  sponsor?: {
    id: string;
    username: string | null;
    referralCode: string;
  } | null;
}

export interface RegisterAffiliateDTO {
  userId: string;
  username: string;
  sponsorCodeOrId?: string;
  payoutMethod?: string;
  payoutDetails?: Record<string, any>;
}

export interface AffiliateDashboardStatsDTO {
  profile: AffiliateProfileDTO;
  metrics: {
    lifetimeEarnings: number;
    pendingBalance: number;
    availableBalance: number;
    totalOrdersReferred: number;
    directReferralOrders: number;
  };
  recentCommissions: Array<{
    id: string;
    orderId: string;
    level: number;
    rate: number;
    amountUsd: number;
    status: string;
    createdAt: Date;
    availableAt: Date;
  }>;
}

export interface GenealogyTreeNode {
  affiliateId: string;
  username: string | null;
  referralCode: string;
  level: number;
  isActive: boolean;
  payoutStatus: string;
  createdAt: Date;
  children?: GenealogyTreeNode[];
}
