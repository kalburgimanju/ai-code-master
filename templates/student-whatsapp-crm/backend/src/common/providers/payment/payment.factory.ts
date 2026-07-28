import { PaymentProvider } from './payment-provider.interface';
import { MockPaymentProvider } from './mock-payment.provider';
import { RazorpayProvider } from './razorpay.provider';
import { StripeProvider } from './stripe.provider';

/** Selects payment provider from PAYMENT_PROVIDER; falls back to mock. */
export function createPaymentProvider(): PaymentProvider {
  const choice = (process.env.PAYMENT_PROVIDER ?? 'mock').toLowerCase();
  if (choice === 'mock') return new MockPaymentProvider();
  try {
    if (choice === 'razorpay') return new RazorpayProvider();
    if (choice === 'stripe') return new StripeProvider();
  } catch (err) {
    console.warn(`[payment] ${choice} unavailable (${(err as Error).message}); using mock`);
  }
  return new MockPaymentProvider();
}
