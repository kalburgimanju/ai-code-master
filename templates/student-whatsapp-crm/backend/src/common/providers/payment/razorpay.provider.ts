import {
  CreatePaymentInput,
  PaymentProvider,
  PaymentResult,
} from './payment-provider.interface';

/** Razorpay adapter. Active only when RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET set. */
export class RazorpayProvider implements PaymentProvider {
  readonly name = 'razorpay' as const;
  private keyId: string;
  private keySecret: string;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('RazorpayProvider requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
    }
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(input.amount * 100),
        currency: input.currency,
        receipt: input.studentId,
      }),
    });
    const json = (await res.json()) as any;
    return { providerRef: json.id ?? '', status: res.ok ? 'created' : 'failed' };
  }
}
