import { EmailParser } from '../../mailchain-service/src/email-parser.js';
import keywords from './keywords.json';
export var ThreatLevel;
(function (ThreatLevel) {
    ThreatLevel[ThreatLevel["Safe"] = 0] = "Safe";
    ThreatLevel[ThreatLevel["Low"] = 1] = "Low";
    ThreatLevel[ThreatLevel["Medium"] = 2] = "Medium";
    ThreatLevel[ThreatLevel["High"] = 3] = "High";
    ThreatLevel[ThreatLevel["Critical"] = 4] = "Critical";
})(ThreatLevel || (ThreatLevel = {}));
export var EventType;
(function (EventType) {
    EventType[EventType["Phishing"] = 0] = "Phishing";
    EventType[EventType["Spam"] = 1] = "Spam";
    EventType[EventType["Malware"] = 2] = "Malware";
    EventType[EventType["SocialEngineering"] = 3] = "SocialEngineering";
})(EventType || (EventType = {}));
export class MaliciousMailDetector {
    constructor() {
        // Load keywords from JSON file
        this.phishingKeywords = keywords.phishing || [];
        this.spamKeywords = keywords.spam || [];
        this.malwareKeywords = keywords.malware || [];
        this.socialEngineeringKeywords = keywords.socialEngineering || [];
    }
    /**
     * Analyze email for malicious content
     */
    analyze(email) {
        const parsed = EmailParser.parse(email);
        const text = `${email.subject} ${parsed.plainText}`.toLowerCase();
        let totalScore = 0;
        let maxCategoryScore = 0;
        let dominantEventType = EventType.Spam;
        const detectedKeywords = [];
        const reasons = [];
        // 1. Check phishing patterns
        const phishingScore = this.checkKeywords(text, this.phishingKeywords, detectedKeywords, 'phishing');
        totalScore += phishingScore;
        if (phishingScore > maxCategoryScore) {
            maxCategoryScore = phishingScore;
            dominantEventType = EventType.Phishing;
        }
        if (phishingScore > 0) {
            reasons.push(`Phishing indicators found (score: ${phishingScore})`);
        }
        // 2. Check spam patterns
        const spamScore = this.checkKeywords(text, this.spamKeywords, detectedKeywords, 'spam');
        totalScore += spamScore;
        if (spamScore > maxCategoryScore) {
            maxCategoryScore = spamScore;
            dominantEventType = EventType.Spam;
        }
        if (spamScore > 0) {
            reasons.push(`Spam indicators found (score: ${spamScore})`);
        }
        // 3. Check malware patterns
        const malwareScore = this.checkKeywords(text, this.malwareKeywords, detectedKeywords, 'malware');
        totalScore += malwareScore;
        if (malwareScore > maxCategoryScore) {
            maxCategoryScore = malwareScore;
            dominantEventType = EventType.Malware;
        }
        if (malwareScore > 0) {
            reasons.push(`Malware indicators found (score: ${malwareScore})`);
        }
        // 4. Check social engineering
        const socialScore = this.checkKeywords(text, this.socialEngineeringKeywords, detectedKeywords, 'social_engineering');
        totalScore += socialScore;
        if (socialScore > maxCategoryScore) {
            maxCategoryScore = socialScore;
            dominantEventType = EventType.SocialEngineering;
        }
        if (socialScore > 0) {
            reasons.push(`Social engineering tactics detected (score: ${socialScore})`);
        }
        // 5. Check suspicious patterns from parser
        const patternScore = parsed.suspiciousPatterns.length * 2;
        totalScore += patternScore;
        if (patternScore > 0) {
            reasons.push(`Suspicious patterns: ${parsed.suspiciousPatterns.join(', ')}`);
        }
        // 6. URL analysis
        const urlScore = this.analyzeUrls(parsed.urls, parsed.domains, reasons);
        totalScore += urlScore;
        // 7. Attachment analysis
        if (email.attachments && email.attachments.length > 0) {
            const attachmentScore = this.analyzeAttachments(email.attachments, reasons);
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
            detectedPatterns: parsed.suspiciousPatterns,
            reasons,
            metadata: {
                suspiciousUrls: parsed.urls,
                suspiciousDomains: parsed.domains,
                hasAttachments: (email.attachments?.length || 0) > 0,
            },
        };
    }
    /**
     * Check text for keyword matches
     */
    checkKeywords(text, keywords, detected, category) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                score++;
                detected.push(`[${category}] ${keyword}`);
            }
        }
        return score;
    }
    /**
     * Analyze URLs for suspicious patterns
     */
    analyzeUrls(urls, domains, reasons) {
        let score = 0;
        // Check for URL shorteners
        const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co'];
        for (const domain of domains) {
            if (shorteners.some(s => domain.includes(s))) {
                score += 3;
                reasons.push(`URL shortener detected: ${domain}`);
            }
        }
        // Check for IP addresses in URLs
        if (urls.some(url => /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url))) {
            score += 4;
            reasons.push('Direct IP address in URL');
        }
        // Check for suspicious TLDs
        const suspiciousTlds = ['.xyz', '.top', '.club', '.work', '.click'];
        for (const domain of domains) {
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
    analyzeAttachments(attachments, reasons) {
        let score = 0;
        const dangerousExtensions = [
            '.exe', '.scr', '.bat', '.cmd', '.com', '.pif',
            '.vbs', '.js', '.jar', '.msi', '.dll'
        ];
        for (const attachment of attachments) {
            const filename = attachment.filename.toLowerCase();
            if (dangerousExtensions.some(ext => filename.endsWith(ext))) {
                score += 5;
                reasons.push(`Dangerous attachment: ${attachment.filename}`);
            }
        }
        return score;
    }
    /**
     * Calculate threat level based on total score
     */
    calculateThreatLevel(score) {
        if (score >= 10)
            return ThreatLevel.Critical;
        if (score >= 7)
            return ThreatLevel.High;
        if (score >= 4)
            return ThreatLevel.Medium;
        if (score >= 2)
            return ThreatLevel.Low;
        return ThreatLevel.Safe;
    }
    /**
     * Batch analyze multiple emails
     */
    analyzeBatch(emails) {
        return emails.map(email => this.analyze(email));
    }
}
/**
 * Factory function for detector
 */
export function createDetector() {
    return new MaliciousMailDetector();
}
//# sourceMappingURL=detector.js.map