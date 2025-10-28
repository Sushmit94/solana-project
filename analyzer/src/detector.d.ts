import type { EmailMessage } from '../../mailchain-service/src/mailchain-client';
export declare enum ThreatLevel {
    Safe = 0,
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}
export declare enum EventType {
    Phishing = 0,
    Spam = 1,
    Malware = 2,
    SocialEngineering = 3
}
export interface ThreatAnalysis {
    isMalicious: boolean;
    threatLevel: ThreatLevel;
    eventType: EventType;
    confidence: number;
    score: number;
    detectedKeywords: string[];
    detectedPatterns: string[];
    reasons: string[];
    metadata: {
        suspiciousUrls: string[];
        suspiciousDomains: string[];
        hasAttachments: boolean;
    };
}
export declare class MaliciousMailDetector {
    private phishingKeywords;
    private spamKeywords;
    private malwareKeywords;
    private socialEngineeringKeywords;
    constructor();
    /**
     * Analyze email for malicious content
     */
    analyze(email: EmailMessage): ThreatAnalysis;
    /**
     * Check text for keyword matches
     */
    private checkKeywords;
    /**
     * Analyze URLs for suspicious patterns
     */
    private analyzeUrls;
    /**
     * Analyze attachments for threats
     */
    private analyzeAttachments;
    /**
     * Calculate threat level based on total score
     */
    private calculateThreatLevel;
    /**
     * Batch analyze multiple emails
     */
    analyzeBatch(emails: EmailMessage[]): ThreatAnalysis[];
}
/**
 * Factory function for detector
 */
export declare function createDetector(): MaliciousMailDetector;
//# sourceMappingURL=detector.d.ts.map