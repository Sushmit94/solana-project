// mailchain-service/src/email-parser.ts
// Parses email content and extracts relevant information

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

export class EmailParser {
  /**
   * Parse email and extract useful information
   */
  static parse(email: EmailMessage): ParsedEmail {
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
  private static extractPlainText(body: string): string {
    // Simple HTML tag removal
    return body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Extract URLs from text
   */
  private static extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Extract domains from URLs
   */
  private static extractDomains(urls: string[]): string[] {
    const domains: string[] = [];
    for (const url of urls) {
      try {
        const domain = new URL(url).hostname;
        domains.push(domain);
      } catch (e) {
        // Invalid URL, skip
      }
    }
    return [...new Set(domains)];
  }

  /**
   * Extract email addresses from text
   */
  private static extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Detect suspicious patterns in email
   */
  private static detectSuspiciousPatterns(text: string): string[] {
    const patterns: string[] = [];
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
  static containsKeyword(email: EmailMessage, keyword: string): boolean {
    const text = `${email.subject} ${email.body}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  }

  /**
   * Get email metadata summary
   */
  static getMetadata(email: EmailMessage) {
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