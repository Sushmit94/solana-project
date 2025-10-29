import { EmailMessage } from './mailchain-client';
export interface ParsedEmail {
    message: EmailMessage;
    plainText: string;
    htmlText: string;
    urls: string[];
    domains: string[];
    emailAddresses: string[];
    suspiciousPatterns: string[];
}
export declare class EmailParser {
    /**
     * Parse email and extract useful information
     */
    static parse(email: EmailMessage): ParsedEmail;
    /**
     * Extract plain text from HTML or return as-is
     */
    private static extractPlainText;
    /**
     * Extract URLs from text
     */
    private static extractUrls;
    /**
     * Extract domains from URLs
     */
    private static extractDomains;
    /**
     * Extract email addresses from text
     */
    private static extractEmails;
    /**
     * Detect suspicious patterns in email
     */
    private static detectSuspiciousPatterns;
    /**
     * Check if email body contains specific keyword
     */
    static containsKeyword(email: EmailMessage, keyword: string): boolean;
    /**
     * Get email metadata summary
     */
    static getMetadata(email: EmailMessage): {
        id: string;
        from: string;
        to: string;
        subject: string;
        timestamp: number;
        hasAttachments: boolean;
        attachmentCount: number;
    };
}
//# sourceMappingURL=email-parser.d.ts.map