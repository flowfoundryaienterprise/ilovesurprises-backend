export type MembershipPlanType = 'monthly' | 'six_month' | 'twelve_month';
export type MembershipPaymentStatus = 'paid' | 'failed' | 'pending';
export type MembershipRenewalStatus = 'auto_renew' | 'manual' | 'failing';
export type MembershipCancellationStatus = 'none' | 'pending_end_of_period' | 'cancelled';
export type MembershipStatus = 'active' | 'past_due' | 'suspended' | 'cancelled';

export interface MembershipPricingConfig {
  monthlyPrice: number;
  sixMonthDiscount: number;
  twelveMonthDiscount: number;
}

export interface MembershipPlanDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  interval: string;
  discountPercent: number;
  freeShipping: boolean;
  perks: string[];
  isActive: boolean;
  features?: string[];
  billingPeriod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipAdminRecord {
  id: string;
  representativeId: string;
  repName: string;
  repUsername: string;
  repAvatar: string;
  repEmail: string;
  plan: MembershipPlanType;
  planId: string;
  planName: string;
  price: number;
  billingFrequency: 'monthly' | 'every_6_months' | 'annually';
  discountNotice?: string;
  paymentStatus: MembershipPaymentStatus;
  status: MembershipStatus;
  nextBillingDate: string;
  renewalStatus: MembershipRenewalStatus;
  cancellationStatus: MembershipCancellationStatus;
  startedAt: string;
  paymentMethodSnippet: string;
  autoRenew: boolean;
}

export interface MembershipListResponse {
  memberships: MembershipAdminRecord[];
  plans: MembershipPlanDTO[];
  pricing: MembershipPricingConfig;
  stats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalMrr: number;
    plansBreakdown: { plan: string; count: number; revenue: number }[];
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateMembershipPlanDTO {
  name: string;
  slug: string;
  description?: string;
  price: number;
  interval: string;
  discountPercent?: number;
  freeShipping?: boolean;
  perks?: string[];
  isActive?: boolean;
}

export interface UpdateMembershipPlanDTO {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  interval?: string;
  discountPercent?: number;
  freeShipping?: boolean;
  perks?: string[];
  isActive?: boolean;
}

export interface UserMembershipStatusDTO {
  hasActiveMembership: boolean;
  membership?: {
    id: string;
    plan: MembershipPlanDTO;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    autoRenew: boolean;
  };
}
