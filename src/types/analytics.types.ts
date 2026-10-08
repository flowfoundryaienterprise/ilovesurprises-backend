export type AnalyticsTimeframe = '7D' | '30D' | '90D' | 'YTD';

export interface KPICard {
  value: number;
  formatted: string;
  subValue?: number | string;
  subFormatted?: string;
  changePercent?: number;
}

export interface RevenueTrajectoryPoint {
  date: string;
  gmv: number;
  ordersCount: number;
  formattedGmv: string;
}

export interface ShopperSessionsPoint {
  date: string;
  sessions: number;
  checkouts: number;
  conversionRate: number;
  formattedConversionRate: string;
}

export interface CommissionTierDistribution {
  level: number;
  name: string;
  ratePercent: number;
  totalAmount: number;
  count: number;
  formattedTotal: string;
}

export interface SubscriptionPlanBreakdownItem {
  planId: string;
  name: string;
  price: number;
  interval: string;
  subscriberCount: number;
  mrr: number;
  formattedMrr: string;
}

export interface TopAffiliateItem {
  affiliateId: string;
  username: string;
  name: string;
  totalRetailSales: number;
  totalCommissionEarned: number;
  directOrdersCount: number;
  teamSize: number;
}

export interface AnalyticsReportDTO {
  timeframe: AnalyticsTimeframe;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  kpis: {
    grossSales: KPICard;
    trafficAndConversion: KPICard;
    membershipMrr: KPICard;
    commissionLiability: KPICard;
  };
  revenueTrajectory: {
    points: RevenueTrajectoryPoint[];
    aov: number;
    formattedAov: string;
    totalGmv: number;
  };
  shopperSessionsVsCheckouts: {
    points: ShopperSessionsPoint[];
    avgConversion: number;
    formattedAvgConversion: string;
    totalSessions: number;
    totalCheckouts: number;
  };
  commissionDistributionByTier: {
    tiers: CommissionTierDistribution[];
    totalDistributedUsd: number;
    programCapPercent: number;
  };
  subscriptionPlanBreakdown: {
    plans: SubscriptionPlanBreakdownItem[];
    totalMrr: number;
    totalActiveSubscribers: number;
  };
  tabCounts: {
    salesAndOrders: number;
    customerCohorts: number;
    commissionLedger: number;
    topAffiliates: number;
  };
}

export interface CommissionCentralScheduleItem {
  level: number;
  tierName: string;
  ratePercent: number;
  roleDescription: string;
}

export interface CommissionCentralSummaryDTO {
  programRules: {
    maxDistributionCapPercent: number;
    payoutSchedule: string;
    activeQualificationRuleThreshold: number;
    qualificationPolicyNote: string;
    policyStatus: string;
  };
  schedule: CommissionCentralScheduleItem[];
  metrics: {
    totalCommissionsEarned: number;
    pendingLiability: number;
    availableBalance: number;
    disbursedTotal: number;
    totalLedgerEntries: number;
    activeConsultantsCount: number;
  };
}

export interface AdminLedgerItemDTO {
  id: string;
  representative: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    status: string;
  };
  orderAndCustomer: {
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    orderDate: string;
  };
  tierLevel: {
    level: number;
    name: string;
    ratePercent: number;
  };
  orderVolume: number;
  commissionEarned: {
    rate: number;
    amountUsd: number;
    formattedAmount: string;
  };
  status: string;
  availableAt: string;
  ruleVersion: string;
  parentLedgerId: string | null;
  note: string | null;
  createdAt: string;
}
