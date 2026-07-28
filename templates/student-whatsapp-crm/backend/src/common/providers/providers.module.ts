import { Global, Module } from '@nestjs/common';
import { WhatsAppProvider } from './whatsapp/whatsapp-provider.interface';
import { createWhatsAppProvider } from './whatsapp/whatsapp.factory';
import { AIProvider } from './ai/ai-provider.interface';
import { createAIProvider } from './ai/ai.factory';
import { PaymentProvider } from './payment/payment-provider.interface';
import { createPaymentProvider } from './payment/payment.factory';

/**
 * Singletons for the external provider adapters (WhatsApp / AI / Payment).
 * Each resolves to the mock implementation unless the relevant env vars are set.
 */
@Global()
@Module({
  providers: [
    {
      provide: 'WHATSAPP_PROVIDER',
      useFactory: (): WhatsAppProvider => createWhatsAppProvider(),
    },
    {
      provide: 'AI_PROVIDER',
      useFactory: (): AIProvider => createAIProvider(),
    },
    {
      provide: 'PAYMENT_PROVIDER',
      useFactory: (): PaymentProvider => createPaymentProvider(),
    },
  ],
  exports: ['WHATSAPP_PROVIDER', 'AI_PROVIDER', 'PAYMENT_PROVIDER'],
})
export class ProvidersModule {}
