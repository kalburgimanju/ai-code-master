import {
  CreatePaymentInput,
  PaymentProvider,
  PaymentResult,
} from './payment-provider.interface';

/** Stripe adapter. Active only when STRIPE_SECRET_KEY is set. */
export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe' as const;
  private secretKey: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('StripeProvider requires STRIPE_SECRET_KEY');
    }
    this.secretKey = secretKey;
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(Math.round(input.amount * 100)),
        currency: input.currency.toLowerCase(),
        metadata: JSON.stringify({ studentId: input.studentId }),
      }).toString(),
    });
    const json = (await res.json()) as any;
    return { providerRef: json.id ?? '', status: res.ok ? 'created' : 'failed' };
  }
}
