export type PaymentStatus = 'created' | 'paid' | 'failed' | 'pending';

export interface CreatePaymentInput {
  studentId: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface PaymentResult {
  providerRef: string;
  status: PaymentStatus;
}

export interface PaymentProvider {
  readonly name: 'razorpay' | 'stripe' | 'mock';
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
}
