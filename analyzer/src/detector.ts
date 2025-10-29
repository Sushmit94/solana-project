// analyzer/src/detector.ts - FIXED VERSION
// Enhanced malicious mail detector with comprehensive threat analysis
import type { EmailMessage } from '../../mailchain-service/src/mailchain-client';
import { EmailParser } from '../../mailchain-service/src/email-parser';
import type { ParsedEmail } from '../../mailchain-service/src/email-parser';
import { keywords } from './keywords';

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
    const kw = (keywords as any) ?? {};
    this.phishingKeywords = Array.isArray(kw.phishing) ? kw.phishing.map(String) : [];
    this.spamKeywords = Array.isArray(kw.spam) ? kw.spam.map(String) : [];
    this.malwareKeywords = Array.isArray(kw.malware) ? kw.malware.map(String) : [];
    this.socialEngineeringKeywords = Array.isArray(kw.socialEngineering)
      ? kw.socialEngineering.map(String)
      : [];

    // Debug: Log loaded keywords
    console.log('🔧 Detector initialized with keywords:', {
      phishing: this.phishingKeywords.length,
      spam: this.spamKeywords.length,
      malware: this.malwareKeywords.length,
      socialEngineering: this.socialEngineeringKeywords.length,
    });
  }

  /**
   * Analyze email for malicious content
   */
  analyze(email: EmailMessage): ThreatAnalysis {
    console.log('🔍 Starting email analysis...');
    console.log('📧 Email details:', {
      from: email.from,
      subject: email.subject,
      hasBody: !!email.body,
    });

    const parsed = EmailParser.parse(email) as ParsedEmail | Record<string, unknown>;
    const plain = (parsed && (parsed as any).plainText) ?? '';
    const text = `${email.subject ?? ''} ${plain}`.toLowerCase();

    console.log('📝 Text to analyze (first 200 chars):', text.substring(0, 200));

    const suspiciousPatterns: string[] = ((parsed as any).suspiciousPatterns as string[]) ?? [];
    const urls: string[] = ((parsed as any).urls as string[]) ?? [];
    const domains: string[] = ((parsed as any).domains as string[]) ?? [];

    let totalScore = 0;
    let maxCategoryScore = 0;
    let dominantEventType = EventType.Spam;
    const detectedKeywords: string[] = [];
    const reasons: string[] = [];

    // 1. Check phishing patterns (WEIGHTED HIGHER)
    const phishingScore = this.checkKeywords(
      text,
      this.phishingKeywords,
      detectedKeywords,
      'phishing'
    );
    const weightedPhishing = phishingScore * 2; // Double weight for phishing
    totalScore += weightedPhishing;
    if (weightedPhishing > maxCategoryScore) {
      maxCategoryScore = weightedPhishing;
      dominantEventType = EventType.Phishing;
    }
    if (phishingScore > 0) {
      reasons.push(`Phishing indicators found (${phishingScore} keywords, score: ${weightedPhishing})`);
      console.log('🎣 Phishing keywords detected:', phishingScore);
    }

    // 2. Check spam patterns
    const spamScore = this.checkKeywords(
      text,
      this.spamKeywords,
      detectedKeywords,
      'spam'
    );
    totalScore += spamScore;
    if (spamScore > maxCategoryScore && phishingScore === 0) {
      maxCategoryScore = spamScore;
      dominantEventType = EventType.Spam;
    }
    if (spamScore > 0) {
      reasons.push(`Spam indicators found (${spamScore} keywords)`);
      console.log('📧 Spam keywords detected:', spamScore);
    }

    // 3. Check malware patterns (WEIGHTED HIGHER)
    const malwareScore = this.checkKeywords(
      text,
      this.malwareKeywords,
      detectedKeywords,
      'malware'
    );
    const weightedMalware = malwareScore * 2.5; // High weight for malware
    totalScore += weightedMalware;
    if (weightedMalware > maxCategoryScore) {
      maxCategoryScore = weightedMalware;
      dominantEventType = EventType.Malware;
    }
    if (malwareScore > 0) {
      reasons.push(`Malware indicators found (${malwareScore} keywords, score: ${weightedMalware})`);
      console.log('🦠 Malware keywords detected:', malwareScore);
    }

    // 4. Check social engineering (WEIGHTED)
    const socialScore = this.checkKeywords(
      text,
      this.socialEngineeringKeywords,
      detectedKeywords,
      'social_engineering'
    );
    const weightedSocial = socialScore * 1.5;
    totalScore += weightedSocial;
    if (weightedSocial > maxCategoryScore && phishingScore === 0 && malwareScore === 0) {
      maxCategoryScore = weightedSocial;
      dominantEventType = EventType.SocialEngineering;
    }
    if (socialScore > 0) {
      reasons.push(`Social engineering tactics detected (${socialScore} keywords, score: ${weightedSocial})`);
      console.log('🎭 Social engineering keywords detected:', socialScore);
    }

    // 5. Check suspicious patterns from parser
    const patternScore = suspiciousPatterns.length * 3; // Increased weight
    totalScore += patternScore;
    if (patternScore > 0) {
      reasons.push(`Suspicious patterns: ${suspiciousPatterns.join(', ')}`);
      console.log('⚠️ Suspicious patterns:', suspiciousPatterns);
    }

    // 6. URL analysis (WEIGHTED HIGHER)
    const urlScore = this.analyzeUrls(urls, domains, reasons);
    totalScore += urlScore;

    // 7. Check sender domain
    const domainScore = this.analyzeSenderDomain(email.from, reasons);
    totalScore += domainScore;

    // 8. Attachment analysis
    const attachments = (email.attachments as Array<{ filename?: string; contentType?: string; size?: number }> | undefined) ?? [];
    if (attachments.length > 0) {
      const attachmentScore = this.analyzeAttachments(attachments, reasons);
      totalScore += attachmentScore;
    }

    console.log('📊 Analysis complete - Total score:', totalScore);
    console.log('🔍 Detected keywords:', detectedKeywords);
    console.log('📋 Reasons:', reasons);

    // Calculate threat level and confidence
    const threatLevel = this.calculateThreatLevel(totalScore);
    const confidence = Math.min(totalScore / 15, 1.0); // Normalize to 0-1
    const isMalicious = threatLevel >= ThreatLevel.Medium;

    console.log('🎯 Final verdict:', {
      isMalicious,
      threatLevel: ThreatLevel[threatLevel],
      eventType: EventType[dominantEventType],
      confidence: `${(confidence * 100).toFixed(1)}%`,
    });

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
        console.log(`✓ Keyword match: "${keyword}" in category: ${category}`);
      }
    }
    return score;
  }

  /**
   * Analyze sender domain for suspicious patterns
   */
  private analyzeSenderDomain(from: string, reasons: string[]): number {
    let score = 0;
    const domain = from.split('@')[1]?.toLowerCase() || '';

    if (!domain) return 0;

    console.log('🌐 Analyzing sender domain:', domain);

    // Check for suspicious keywords in domain
    const suspiciousWords = ['suspicious', 'phishing', 'scam', 'lottery', 'fake', 'noreply'];
    for (const word of suspiciousWords) {
      if (domain.includes(word)) {
        score += 5;
        reasons.push(`Suspicious domain keyword: ${word} in ${domain}`);
        console.log(`⚠️ Suspicious domain word found: ${word}`);
      }
    }

    // Check for suspicious TLDs
    const suspiciousTlds = ['.xyz', '.top', '.club', '.work', '.click', '.tk', '.ml', '.ga'];
    for (const tld of suspiciousTlds) {
      if (domain.endsWith(tld)) {
        score += 3;
        reasons.push(`Suspicious TLD: ${tld}`);
        console.log(`⚠️ Suspicious TLD: ${tld}`);
      }
    }

    // Check for excessive numbers in domain
    const numberCount = (domain.match(/\d/g) || []).length;
    if (numberCount > 3) {
      score += 2;
      reasons.push(`Unusual number of digits in domain: ${numberCount}`);
      console.log(`⚠️ Too many numbers in domain: ${numberCount}`);
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

    console.log('🔗 Analyzing URLs:', _urls.length);

    // Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co'];
    for (const domain of _domains) {
      if (shorteners.some(s => domain.includes(s))) {
        score += 4; // Increased weight
        reasons.push(`URL shortener detected: ${domain}`);
        console.log(`🔗 URL shortener found: ${domain}`);
      }
    }

    // Check for IP addresses in URLs
    if (_urls.some(url => /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url))) {
      score += 5; // Increased weight
      reasons.push('Direct IP address in URL');
      console.log('🔗 IP address in URL detected');
    }

    // Check for suspicious keywords in URLs
    const suspiciousUrlWords = ['phishing', 'verify', 'login', 'secure', 'account', 'reset', 'update'];
    for (const url of _urls) {
      const urlLower = url.toLowerCase();
      for (const word of suspiciousUrlWords) {
        if (urlLower.includes(word)) {
          score += 2;
          reasons.push(`Suspicious keyword in URL: ${word}`);
          console.log(`🔗 Suspicious URL keyword: ${word}`);
          break; // Only count once per URL
        }
      }
    }

    // Check for suspicious TLDs
    const suspiciousTlds = ['.xyz', '.top', '.club', '.work', '.click'];
    for (const domain of _domains) {
      if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
        score += 3; // Increased weight
        reasons.push(`Suspicious TLD in URL: ${domain}`);
        console.log(`🔗 Suspicious TLD in URL: ${domain}`);
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

    console.log('📎 Analyzing attachments:', attachments.length);

    for (const attachment of attachments) {
      const filename = String(attachment.filename ?? '').toLowerCase();
      if (filename && dangerousExtensions.some(ext => filename.endsWith(ext))) {
        score += 8; // High weight for dangerous attachments
        reasons.push(`Dangerous attachment: ${attachment.filename ?? filename}`);
        console.log('📎 Dangerous attachment found:', filename);
      }
    }

    return score;
  }

  /**
   * Calculate threat level based on total score
   */
  private calculateThreatLevel(score: number): ThreatLevel {
    // Adjusted thresholds for better sensitivity
    if (score >= 15) return ThreatLevel.Critical;
    if (score >= 10) return ThreatLevel.High;
    if (score >= 6) return ThreatLevel.Medium;  // Lowered from 7
    if (score >= 3) return ThreatLevel.Low;     // Lowered from 4
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