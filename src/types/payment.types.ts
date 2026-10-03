export interface CreatePaymentIntentDTO {
  orderId: string;
}

export interface CreatePaymentIntentResponseDTO {
  clientSecret: string | null;
  paymentIntentId: string;
  amount: number;
  currency: string;
  orderNumber: string;
}
