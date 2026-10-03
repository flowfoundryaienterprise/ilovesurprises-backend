export interface DiscountCouponDTO {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startDate: Date;
  endDate: Date | null;
  maxUses: number | null;
  currentUses: number;
  maxUsesPerUser: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CouponValidationResultDTO {
  valid: boolean;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  subtotal: number;
  newSubtotal: number;
  message?: string;
}
