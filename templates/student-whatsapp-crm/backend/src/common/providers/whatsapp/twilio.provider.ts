import {
  InboundMessage,
  SendResult,
  WhatsAppProvider,
} from './whatsapp-provider.interface';

/**
 * Twilio WhatsApp adapter. Active only when TWILIO_SID and TWILIO_TOKEN are set.
 */
export class TwilioProvider implements WhatsAppProvider {
  readonly name = 'twilio';
  private sid: string;
  private token: string;
  private from: string;

  constructor() {
    const sid = process.env.TWILIO_SID;
    const token = process.env.TWILIO_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    if (!sid || !token || !from) {
      throw new Error('TwilioProvider requires TWILIO_SID, TWILIO_TOKEN, TWILIO_WHATSAPP_FROM');
    }
    this.sid = sid;
    this.token = token;
    this.from = from;
  }

  async sendMessage(
    to: string,
    body: string,
    opts?: { template?: string; mediaUrl?: string },
  ): Promise<SendResult> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`;
    const params = new URLSearchParams({
      From: `whatsapp:${this.from}`,
      To: `whatsapp:${to}`,
      Body: body,
    });
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${this.sid}:${this.token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const json = (await res.json()) as any;
    return { messageId: json.sid ?? '', status: res.ok ? 'sent' : 'failed' };
  }

  async receiveWebhook(payload: unknown): Promise<InboundMessage> {
    const p = payload as any;
    return {
      from: p?.From?.replace('whatsapp:', '') ?? '',
      body: p?.Body ?? '',
      receivedAt: new Date().toISOString(),
    };
  }
}
