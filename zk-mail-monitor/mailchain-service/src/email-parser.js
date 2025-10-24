"use strict";
// mailchain-service/src/email-parser.ts
// Parses email content and extracts relevant information
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailParser = void 0;
const mailchain_client_1 = require("./mailchain-client");
class EmailParser {
    /**
     * Parse email and extract useful information
     */
    static parse(email) {
        const plainText = this.extractPlainText(email.body);
        const htmlText = email.body;
        const urls = this.extractUrls(plainText);
        const domains = this.extractDomains(urls);
        const emailAddresses = this.extractEmails(plainText);
        const suspiciousPatterns = this.detectSuspiciousPatterns(plainText);
        return {
            message: email,
            plainText,
            htmlText,
            urls,
            domains,
            emailAddresses,
            suspiciousPatterns,
        };
    }
    /**
     * Extract plain text from HTML or return as-is
     */
    static extractPlainText(body) {
        // Simple HTML tag removal
        return body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    /**
     * Extract URLs from text
     */
    static extractUrls(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);
        return matches ? [...new Set(matches)] : [];
    }
    /**
     * Extract domains from URLs
     */
    static extractDomains(urls) {
        const domains = [];
        for (const url of urls) {
            try {
                const domain = new URL(url).hostname;
                domains.push(domain);
            }
            catch (e) {
                // Invalid URL, skip
            }
        }
        return [...new Set(domains)];
    }
    /**
     * Extract email addresses from text
     */
    static extractEmails(text) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = text.match(emailRegex);
        return matches ? [...new Set(matches)] : [];
    }
    /**
     * Detect suspicious patterns in email
     */
    static detectSuspiciousPatterns(text) {
        const patterns = [];
        const lowerText = text.toLowerCase();
        // URL shorteners
        if (/(bit\.ly|tinyurl|goo\.gl|ow\.ly)/i.test(text)) {
            patterns.push('url_shortener');
        }
        // Excessive urgency
        if (/(urgent|immediate|asap|expires|limited time)/i.test(lowerText)) {
            patterns.push('urgency_language');
        }
        // Request for credentials
        if (/(password|username|pin|social security|credit card)/i.test(lowerText)) {
            patterns.push('credential_request');
        }
        // Suspicious file extensions
        if (/\.(exe|scr|bat|cmd|com|pif|vbs|js)$/i.test(text)) {
            patterns.push('suspicious_attachment');
        }
        // Mismatched sender
        const fromDomain = this.extractDomains([text])[0];
        if (fromDomain && /paypal|amazon|microsoft|apple|google/i.test(text) &&
            !fromDomain.includes('paypal') && !fromDomain.includes('amazon')) {
            patterns.push('domain_mismatch');
        }
        return patterns;
    }
    /**
     * Check if email body contains specific keyword
     */
    static containsKeyword(email, keyword) {
        const text = `${email.subject} ${email.body}`.toLowerCase();
        return text.includes(keyword.toLowerCase());
    }
    /**
     * Get email metadata summary
     */
    static getMetadata(email) {
        return {
            id: email.id,
            from: email.from,
            to: email.to,
            subject: email.subject,
            timestamp: email.timestamp,
            hasAttachments: (email.attachments?.length || 0) > 0,
            attachmentCount: email.attachments?.length || 0,
        };
    }
}
exports.EmailParser = EmailParser;
//# sourceMappingURL=email-parser.js.map