// mailchain-service/src/email-parser.ts
// Parse email content and extract metadata

import type { EmailMessage } from './mailchain-client';

export interface ParsedEmail {
  plainText: string;
  htmlText: string;
  urls: string[];
  domains: string[];
  suspiciousPatterns: string[];
  hasUrgentLanguage: boolean;
  hasMoneyRequests: boolean;
}

export class EmailParser {
  /**
   * Parse email message and extract relevant information
   */
  static parse(email: EmailMessage): ParsedEmail {
    const plainText = email.body || '';
    const htmlText = (email as any).html || plainText; // html might not be in base interface

    const urls = this.extractUrls(plainText);
    const domains = this.extractDomains(urls);
    const suspiciousPatterns = this.detectSuspiciousPatterns(plainText);
    const hasUrgentLanguage = this.hasUrgentLanguage(plainText);
    const hasMoneyRequests = this.hasMoneyRequests(plainText);

    return {
      plainText,
      htmlText,
      urls,
      domains,
      suspiciousPatterns,
      hasUrgentLanguage,
      hasMoneyRequests,
    };
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
        const urlObj = new URL(url);
        domains.push(urlObj.hostname);
      } catch {
        // Invalid URL, skip
      }
    }

    return [...new Set(domains)];
  }

  /**
   * Detect suspicious patterns
   */
  private static detectSuspiciousPatterns(text: string): string[] {
    const patterns: string[] = [];
    const lowerText = text.toLowerCase();

    // Check for hidden text (HTML comments, zero-width chars)
    if (text.includes('<!--') || text.includes('\u200B')) {
      patterns.push('hidden_text');
    }

    // Check for base64 encoded content
    if (/[A-Za-z0-9+/]{40,}={0,2}/.test(text)) {
      patterns.push('base64_content');
    }

    // Check for excessive punctuation
    if (/[!?]{3,}/.test(text)) {
      patterns.push('excessive_punctuation');
    }

    // Check for ALL CAPS
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.3 && text.length > 20) {
      patterns.push('excessive_caps');
    }

    return patterns;
  }

  /**
   * Check for urgent language
   */
  private static hasUrgentLanguage(text: string): boolean {
    const urgentTerms = [
      'urgent',
      'immediate',
      'act now',
      'expires',
      'limited time',
      'hurry',
      'quick',
      'asap',
    ];

    const lowerText = text.toLowerCase();
    return urgentTerms.some(term => lowerText.includes(term));
  }

  /**
   * Check for money requests
   */
  private static hasMoneyRequests(text: string): boolean {
    const moneyTerms = [
      'wire transfer',
      'send money',
      'payment',
      'bank account',
      'credit card',
      'paypal',
      'venmo',
      'bitcoin',
      'cryptocurrency',
    ];

    const lowerText = text.toLowerCase();
    return moneyTerms.some(term => lowerText.includes(term));
  }
}

/**
 * Factory function for parser
 */
export function createParser(): typeof EmailParser {
  return EmailParser;
}