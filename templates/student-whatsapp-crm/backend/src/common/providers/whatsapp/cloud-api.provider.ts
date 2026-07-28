import {
  InboundMessage,
  SendResult,
  WhatsAppProvider,
} from './whatsapp-provider.interface';

/**
 * Meta WhatsApp Business Cloud API adapter. Active only when WHATSAPP_CLOUD_TOKEN
 * and WHATSAPP_CLOUD_PHONE_NUMBER_ID are set. Throws at construction otherwise.
 */
export class CloudApiProvider implements WhatsAppProvider {
  readonly name = 'cloud';
  private token: string;
  private phoneNumberId: string;

  constructor() {
    const token = process.env.WHATSAPP_CLOUD_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
      throw new Error(
        'CloudApiProvider requires WHATSAPP_CLOUD_TOKEN and WHATSAPP_CLOUD_PHONE_NUMBER_ID',
      );
    }
    this.token = token;
    this.phoneNumberId = phoneNumberId;
  }

  async sendMessage(
    to: string,
    body: string,
    opts?: { template?: string; mediaUrl?: string },
  ): Promise<SendResult> {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { preview_url: !!opts?.mediaUrl, body },
        }),
      },
    );
    const json = (await res.json()) as any;
    if (!res.ok) {
      return { messageId: '', status: 'failed' };
    }
    return { messageId: json.messages?.[0]?.id ?? '', status: 'sent' };
  }

  async receiveWebhook(payload: unknown): Promise<InboundMessage> {
    const p = payload as any;
    const entry = p?.entry?.[0]?.changes?.[0]?.value;
    const msg = entry?.messages?.[0];
    return {
      from: msg?.from ?? '',
      body: msg?.text?.body ?? '',
      receivedAt: new Date().toISOString(),
    };
  }
}
