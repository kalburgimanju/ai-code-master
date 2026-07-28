export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export interface SendResult {
  messageId: string;
  status: MessageStatus;
}

export interface InboundMessage {
  from: string;
  body: string;
  receivedAt: string;
}

export interface WhatsAppProvider {
  readonly name: string;
  sendMessage(
    to: string,
    body: string,
    opts?: { template?: string; mediaUrl?: string },
  ): Promise<SendResult>;
  receiveWebhook?(payload: unknown): Promise<InboundMessage>;
}
