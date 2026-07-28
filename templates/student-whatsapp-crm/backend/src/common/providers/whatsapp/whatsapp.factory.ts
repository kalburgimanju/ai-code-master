import { WhatsAppProvider } from './whatsapp-provider.interface';
import { MockWhatsAppProvider } from './mock-whatsapp.provider';
import { CloudApiProvider } from './cloud-api.provider';
import { TwilioProvider } from './twilio.provider';
import { InteraktProvider } from './interakt.provider';

/**
 * Returns the WhatsApp provider selected by WHATSAPP_PROVIDER. Falls back to mock
 * when the requested real provider cannot be constructed (missing env vars).
 */
export function createWhatsAppProvider(): WhatsAppProvider {
  const choice = (process.env.WHATSAPP_PROVIDER ?? 'mock').toLowerCase();
  if (choice === 'mock') {
    return new MockWhatsAppProvider();
  }
  try {
    if (choice === 'cloud') return new CloudApiProvider();
    if (choice === 'twilio') return new TwilioProvider();
    if (choice === 'interakt') return new InteraktProvider();
  } catch (err) {
    console.warn(
      `[whatsapp] ${choice} provider unavailable (${(err as Error).message}); using mock`,
    );
  }
  return new MockWhatsAppProvider();
}
