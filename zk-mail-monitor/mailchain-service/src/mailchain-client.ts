// mailchain-service/src/mailchain-client.ts
// Handles fetching emails from Mailchain network

import * as Mailchain from '@mailchain/sdk';


export interface MailchainConfig {
  secretRecoveryPhrase?: string;
  privateKey?: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: number;
  headers: Record<string, string>;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

export class MailchainClient {
  private client: any; // simplest

  private address: string | null = null;

  constructor(config: MailchainConfig) {
   this.client = Mailchain.Mailchain.fromSecretRecoveryPhrase(config.secretRecoveryPhrase || '');

  }

  /**
   * Initialize and get user's Mailchain address
   */
  async initialize(): Promise<string> {
    try {
      const addresses = await this.client.user().addresses();
      if (!addresses || addresses.length === 0) {
        throw new Error('No Mailchain addresses found');
      }
      this.address = addresses[0];
      console.log('✅ Mailchain initialized:', this.address);
      return this.address ?? '';

    } catch (error) {
      console.error('Failed to initialize Mailchain:', error);
      throw error;
    }
  }

  /**
   * Fetch all emails from inbox
   */
  async fetchInbox(limit: number = 50): Promise<EmailMessage[]> {
    if (!this.address) {
      throw new Error('Mailchain not initialized. Call initialize() first.');
    }

    try {
      const messages = await this.client.messages().list({
        address: this.address,
        limit,
      });

      return messages.map((msg:any) => ({
        id: msg.id || '',
        from: msg.from || '',
        to: msg.to?.[0] || '',
        subject: msg.subject || '',
        body: msg.body || '',
        timestamp: new Date(msg.date || Date.now()).getTime(),
        headers: msg.headers || {},
        attachments: msg.attachments?.map((att:any )=> ({
          filename: att.filename || 'unknown',
          contentType: att.contentType || 'application/octet-stream',
          size: att.size || 0,
        })),
      }));
    } catch (error) {
      console.error('Failed to fetch inbox:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific email by ID
   */
  async fetchEmail(messageId: string): Promise<EmailMessage | null> {
    if (!this.address) {
      throw new Error('Mailchain not initialized');
    }

    try {
      const msg = await this.client.messages().get({
        address: this.address,
        messageId,
      });

      if (!msg) return null;

      return {
        id: msg.id || '',
        from: msg.from || '',
        to: msg.to?.[0] || '',
        subject: msg.subject || '',
        body: msg.body || '',
        timestamp: new Date(msg.date || Date.now()).getTime(),
        headers: msg.headers || {},
        attachments: msg.attachments?.map((att:any) => ({
          filename: att.filename || 'unknown',
          contentType: att.contentType || 'application/octet-stream',
          size: att.size || 0,
        })),
      };
    } catch (error) {
      console.error('Failed to fetch email:', error);
      return null;
    }
  }

  /**
   * Send an email via Mailchain
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string
  ): Promise<boolean> {
    if (!this.address) {
      throw new Error('Mailchain not initialized');
    }

    try {
      await this.client.messages().send({
        from: this.address,
        to: [to],
        subject,
        content: {
          text: body,
          html: body,
        },
      });
      console.log('✅ Email sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Mark email as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      await this.client.messages().markAsRead({
        address: this.address!,
        messageId,
      });
      return true;
    } catch (error) {
      console.error('Failed to mark as read:', error);
      return false;
    }
  }

  /**
   * Get user's Mailchain address
   */
  getAddress(): string | null {
    return this.address;
  }
}

/**
 * Factory function for easy client creation
 */
export function createMailchainClient(
  config: MailchainConfig
): MailchainClient {
  return new MailchainClient(config);
}