import {
  CreatePaymentInput,
  PaymentProvider,
  PaymentResult,
} from './payment-provider.interface';

/** Mock payment provider. Records a created payment locally; no real gateway. */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock' as const;

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    return {
      providerRef: `mock_pay_${Date.now()}`,
      status: 'created',
    };
  }
}
