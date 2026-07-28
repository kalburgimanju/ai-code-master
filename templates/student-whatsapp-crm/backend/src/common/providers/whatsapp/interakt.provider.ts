import {
  InboundMessage,
  SendResult,
  WhatsAppProvider,
} from './whatsapp-provider.interface';

/**
 * Interakt WhatsApp adapter. Active only when INTERAKT_API_KEY is set. Faster setup
 * option for teams that want a managed WhatsApp layer.
 */
export class InteraktProvider implements WhatsAppProvider {
  readonly name = 'interakt';
  private apiKey: string;
  private accountId: string;

  constructor() {
    const apiKey = process.env.INTERAKT_API_KEY;
    const accountId = process.env.INTERAKT_ACCOUNT_ID;
    if (!apiKey) {
      throw new Error('InteraktProvider requires INTERAKT_API_KEY');
    }
    this.apiKey = apiKey;
    this.accountId = accountId ?? '';
  }

  async sendMessage(
    to: string,
    body: string,
    opts?: { template?: string; mediaUrl?: string },
  ): Promise<SendResult> {
    const res = await fetch('https://api.interakt.ai/v1/public/message/', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryCode: '+91',
        phoneNumber: to.replace(/\D/g, '').slice(-10),
        type: 'Template',
        templateName: opts?.template ?? 'generic_message',
        body: body,
      }),
    });
    const json = (await res.json()) as any;
    return { messageId: json?.messageId ?? '', status: res.ok ? 'sent' : 'failed' };
  }

  async receiveWebhook(payload: unknown): Promise<InboundMessage> {
    const p = payload as any;
    return {
      from: p?.phoneNumber ?? '',
      body: p?.body ?? '',
      receivedAt: new Date().toISOString(),
    };
  }
}
