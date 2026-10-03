export interface AffiliateProfileDTO {
  id: string;
  userId: string;
  referralCode: string;
  slug: string | null;
  sponsorId: string | null;
  status: string;
  lifetimeEarnings: number;
  currentBalance: number;
  pendingBalance: number;
  payoutMethod: string | null;
  payoutDetails: any;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionRecordDTO {
  id: string;
  affiliateId: string;
  orderId: string;
  level: number;
  rate: number;
  orderAmount: number;
  commissionAmount: number;
  status: string;
  description: string | null;
  createdAt: Date;
}

export interface PayoutRequestDTO {
  id: string;
  affiliateId: string;
  amount: number;
  currency: string;
  status: string;
  payoutMethod: string;
  accountDetails: any;
  referenceId: string | null;
  processedAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

export interface GenealogyNodeDTO {
  id: string;
  affiliateId: string;
  referralCode: string;
  name: string;
  email: string;
  level: number;
  status: string;
  recruitsCount: number;
  children: GenealogyNodeDTO[];
}

export interface AffiliateDashboardSummaryDTO {
  profile: AffiliateProfileDTO;
  stats: {
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
    currentBalance: number;
    teamMembersCount: number;
  };
  recentCommissions: CommissionRecordDTO[];
  recentPayouts: PayoutRequestDTO[];
}
