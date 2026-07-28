import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  InboundMessage,
  SendResult,
  WhatsAppProvider,
} from './whatsapp-provider.interface';

/**
 * Mock WhatsApp provider. Records every "delivery" to data/mock-whatsapp.log as
 * JSONL and immediately resolves with a delivered status. No network calls.
 */
export class MockWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'mock';
  private logPath = join(process.cwd(), 'data', 'mock-whatsapp.log');

  constructor() {
    try {
      mkdirSync(join(process.cwd(), 'data'), { recursive: true });
    } catch {
      /* ignore */
    }
  }

  async sendMessage(
    to: string,
    body: string,
    opts?: { template?: string; mediaUrl?: string },
  ): Promise<SendResult> {
    const entry = {
      to,
      body,
      template: opts?.template,
      mediaUrl: opts?.mediaUrl,
      status: 'delivered',
      at: new Date().toISOString(),
    };
    try {
      appendFileSync(this.logPath, JSON.stringify(entry) + '\n');
    } catch {
      /* ignore logging failure */
    }
    return { messageId: `mock_${Date.now()}_${to}`, status: 'delivered' };
  }

  async receiveWebhook(payload: unknown): Promise<InboundMessage> {
    const p = payload as any;
    return {
      from: p?.from ?? '',
      body: p?.body ?? '',
      receivedAt: new Date().toISOString(),
    };
  }
}
