// analyzer/src/detector.ts
// Enhanced malicious mail detector with comprehensive threat analysis
import type { EmailMessage } from '../../mailchain-service/src/mailchain-client.js';
import { EmailParser } from '../../mailchain-service/src/email-parser.js';
import type { ParsedEmail } from '../../mailchain-service/src/email-parser.js';
import keywordsJson from './keywords.json';

export enum ThreatLevel {
  Safe = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

export enum EventType {
  Phishing = 0,
  Spam = 1,
  Malware = 2,
  SocialEngineering = 3,
}

export interface ThreatAnalysis {
  isMalicious: boolean;
  threatLevel: ThreatLevel;
  eventType: EventType;
  confidence: number; // 0-1
  score: number; // Raw threat score
  detectedKeywords: string[];
  detectedPatterns: string[];
  reasons: string[];
  metadata: {
    suspiciousUrls: string[];
    suspiciousDomains: string[];
    hasAttachments: boolean;
  };
}

export class MaliciousMailDetector {
  private phishingKeywords: string[];
  private spamKeywords: string[];
  private malwareKeywords: string[];
  private socialEngineeringKeywords: string[];

  constructor() {
    const kw = (keywordsJson as any) ?? {};
    this.phishingKeywords = Array.isArray(kw.phishing) ? kw.phishing.map(String) : [];
    this.spamKeywords = Array.isArray(kw.spam) ? kw.spam.map(String) : [];
    this.malwareKeywords = Array.isArray(kw.malware) ? kw.malware.map(String) : [];
    this.socialEngineeringKeywords = Array.isArray(kw.socialEngineering)
      ? kw.socialEngineering.map(String)
      : [];
  }

  /**
   * Analyze email for malicious content
   */
  analyze(email: EmailMessage): ThreatAnalysis {
    const parsed = EmailParser.parse(email) as ParsedEmail | Record<string, unknown>;
    const plain = (parsed && (parsed as any).plainText) ?? '';
    const text = `${email.subject ?? ''} ${plain}`.toLowerCase();

    const suspiciousPatterns: string[] = ((parsed as any).suspiciousPatterns as string[]) ?? [];
    const urls: string[] = ((parsed as any).urls as string[]) ?? [];
    const domains: string[] = ((parsed as any).domains as string[]) ?? [];

    let totalScore = 0;
    let maxCategoryScore = 0;
    let dominantEventType = EventType.Spam;
    const detectedKeywords: string[] = [];
    const reasons: string[] = [];

    // 1. Check phishing patterns
    const phishingScore = this.checkKeywords(
      text,
      this.phishingKeywords,
      detectedKeywords,
      'phishing'
    );
    totalScore += phishingScore;
    if (phishingScore > maxCategoryScore) {
      maxCategoryScore = phishingScore;
      dominantEventType = EventType.Phishing;
    }
    if (phishingScore > 0) {
      reasons.push(`Phishing indicators found (score: ${phishingScore})`);
    }

    // 2. Check spam patterns
    const spamScore = this.checkKeywords(
      text,
      this.spamKeywords,
      detectedKeywords,
      'spam'
    );
    totalScore += spamScore;
    if (spamScore > maxCategoryScore) {
      maxCategoryScore = spamScore;
      dominantEventType = EventType.Spam;
    }
    if (spamScore > 0) {
      reasons.push(`Spam indicators found (score: ${spamScore})`);
    }

    // 3. Check malware patterns
    const malwareScore = this.checkKeywords(
      text,
      this.malwareKeywords,
      detectedKeywords,
      'malware'
    );
    totalScore += malwareScore;
    if (malwareScore > maxCategoryScore) {
      maxCategoryScore = malwareScore;
      dominantEventType = EventType.Malware;
    }
    if (malwareScore > 0) {
      reasons.push(`Malware indicators found (score: ${malwareScore})`);
    }

    // 4. Check social engineering
    const socialScore = this.checkKeywords(
      text,
      this.socialEngineeringKeywords,
      detectedKeywords,
      'social_engineering'
    );
    totalScore += socialScore;
    if (socialScore > maxCategoryScore) {
      maxCategoryScore = socialScore;
      dominantEventType = EventType.SocialEngineering;
    }
    if (socialScore > 0) {
      reasons.push(`Social engineering tactics detected (score: ${socialScore})`);
    }

    // 5. Check suspicious patterns from parser
    const patternScore = suspiciousPatterns.length * 2;
    totalScore += patternScore;
    if (patternScore > 0) {
      reasons.push(`Suspicious patterns: ${suspiciousPatterns.join(', ')}`);
    }

    // 6. URL analysis
    const urlScore = this.analyzeUrls(urls, domains, reasons);
    totalScore += urlScore;

    // 7. Attachment analysis
    const attachments = (email.attachments as Array<{ filename?: string; contentType?: string; size?: number }> | undefined) ?? [];
    if (attachments.length > 0) {
      const attachmentScore = this.analyzeAttachments(attachments, reasons);
      totalScore += attachmentScore;
    }

    // Calculate threat level and confidence
    const threatLevel = this.calculateThreatLevel(totalScore);
    const confidence = Math.min(totalScore / 15, 1.0); // Normalize to 0-1
    const isMalicious = threatLevel >= ThreatLevel.Medium;

    return {
      isMalicious,
      threatLevel,
      eventType: dominantEventType,
      confidence,
      score: totalScore,
      detectedKeywords: [...new Set(detectedKeywords)],
      detectedPatterns: suspiciousPatterns,
      reasons,
      metadata: {
        suspiciousUrls: urls,
        suspiciousDomains: domains,
        hasAttachments: attachments.length > 0,
      },
    };
  }

  /**
   * Check text for keyword matches
   */
  private checkKeywords(
    text: string,
    keywords: Array<string>,
    detected: string[],
    category: string
  ): number {
    let score = 0;
    for (const keyword of keywords) {
      const k = String(keyword).toLowerCase();
      if (k && text.includes(k)) {
        score++;
        detected.push(`[${category}] ${keyword}`);
      }
    }
    return score;
  }

  /**
   * Analyze URLs for suspicious patterns
   */
  private analyzeUrls(urls?: string[], domains?: string[], reasons: string[] = []): number {
    const _urls = urls ?? [];
    const _domains = domains ?? [];
    let score = 0;

    // Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co'];
    for (const domain of _domains) {
      if (shorteners.some(s => domain.includes(s))) {
        score += 3;
        reasons.push(`URL shortener detected: ${domain}`);
      }
    }

    // Check for IP addresses in URLs
    if (_urls.some(url => /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url))) {
      score += 4;
      reasons.push('Direct IP address in URL');
    }

    // Check for suspicious TLDs
    const suspiciousTlds = ['.xyz', '.top', '.club', '.work', '.click'];
    for (const domain of _domains) {
      if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
        score += 2;
        reasons.push(`Suspicious TLD: ${domain}`);
      }
    }

    return score;
  }

  /**
   * Analyze attachments for threats
   */
  private analyzeAttachments(
    attachments: Array<{ filename?: string; contentType?: string; size?: number }>,
    reasons: string[]
  ): number {
    let score = 0;
    const dangerousExtensions = [
      '.exe', '.scr', '.bat', '.cmd', '.com', '.pif',
      '.vbs', '.js', '.jar', '.msi', '.dll'
    ];

    for (const attachment of attachments) {
      const filename = String(attachment.filename ?? '').toLowerCase();
      if (filename && dangerousExtensions.some(ext => filename.endsWith(ext))) {
        score += 5;
        reasons.push(`Dangerous attachment: ${attachment.filename ?? filename}`);
      }
    }

    return score;
  }

  /**
   * Calculate threat level based on total score
   */
  private calculateThreatLevel(score: number): ThreatLevel {
    if (score >= 10) return ThreatLevel.Critical;
    if (score >= 7) return ThreatLevel.High;
    if (score >= 4) return ThreatLevel.Medium;
    if (score >= 2) return ThreatLevel.Low;
    return ThreatLevel.Safe;
  }

  /**
   * Batch analyze multiple emails
   */
  analyzeBatch(emails: EmailMessage[]): ThreatAnalysis[] {
    return emails.map(email => this.analyze(email));
  }
}

/**
 * Factory function for detector
 */
export function createDetector(): MaliciousMailDetector {
  return new MaliciousMailDetector();
}