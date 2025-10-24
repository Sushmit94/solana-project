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
export declare class MailchainClient {
    private client;
    private address;
    constructor(config: MailchainConfig);
    /**
     * Initialize and get user's Mailchain address
     */
    initialize(): Promise<string>;
    /**
     * Fetch all emails from inbox
     */
    fetchInbox(limit?: number): Promise<EmailMessage[]>;
    /**
     * Fetch a specific email by ID
     */
    fetchEmail(messageId: string): Promise<EmailMessage | null>;
    /**
     * Send an email via Mailchain
     */
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
    /**
     * Mark email as read
     */
    markAsRead(messageId: string): Promise<boolean>;
    /**
     * Get user's Mailchain address
     */
    getAddress(): string | null;
}
/**
 * Factory function for easy client creation
 */
export declare function createMailchainClient(config: MailchainConfig): MailchainClient;
//# sourceMappingURL=mailchain-client.d.ts.map