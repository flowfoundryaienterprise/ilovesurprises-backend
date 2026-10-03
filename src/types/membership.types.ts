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
}

export interface UserMembershipDTO {
  id: string;
  userId: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  autoRenew: boolean;
  plan: MembershipPlanDTO;
}
