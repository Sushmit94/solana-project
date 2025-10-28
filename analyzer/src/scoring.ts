// analyzer/src/scoring.ts
// Calculate threat scores with weighted criteria
import type { ThreatAnalysis } from './detector';
import { ThreatLevel } from './detector';



export interface ScoringWeights {
  keywordMatches: number;
  suspiciousPatterns: number;
  urlAnalysis: number;
  attachmentRisk: number;
  senderReputation: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  keywordMatches: 1.0,
  suspiciousPatterns: 1.5,
  urlAnalysis: 2.0,
  attachmentRisk: 2.5,
  senderReputation: 1.2,
};

export class ThreatScorer {
  constructor(private weights: ScoringWeights = DEFAULT_WEIGHTS) {}

  /**
   * Calculate weighted threat score
   */
  calculateWeightedScore(analysis: ThreatAnalysis, senderScore: number = 0.5): number {
    let weightedScore = 0;

    // Keyword matches
    weightedScore += analysis.detectedKeywords.length * this.weights.keywordMatches;

    // Suspicious patterns
    weightedScore += analysis.detectedPatterns.length * this.weights.suspiciousPatterns;

    // URL analysis
    weightedScore += analysis.metadata.suspiciousUrls.length * this.weights.urlAnalysis;

    // Attachment risk
    if (analysis.metadata.hasAttachments) {
      weightedScore += this.weights.attachmentRisk;
    }

    // Sender reputation (inverse - lower reputation = higher threat)
    weightedScore += (1 - senderScore) * this.weights.senderReputation * 5;

    return weightedScore;
  }

  /**
   * Normalize score to 0-100 range
   */
  normalizeScore(rawScore: number): number {
    // Cap at 100
    return Math.min(Math.round((rawScore / 20) * 100), 100);
  }

  /**
   * Get threat level description
   */
  getThreatDescription(level: ThreatLevel): string {
    switch (level) {
      case ThreatLevel.Safe:
        return 'This email appears safe with no significant threats detected.';
      case ThreatLevel.Low:
        return 'Minor suspicious indicators detected. Exercise caution.';
      case ThreatLevel.Medium:
        return 'Moderate threat detected. Verify sender before taking action.';
      case ThreatLevel.High:
        return 'High threat level. This email shows multiple red flags.';
      case ThreatLevel.Critical:
        return 'CRITICAL THREAT. This email is highly likely to be malicious. Do not interact.';
      default:
        return 'Unknown threat level';
    }
  }

  /**
   * Get recommended actions based on threat level
   */
  getRecommendedActions(level: ThreatLevel): string[] {
    switch (level) {
      case ThreatLevel.Safe:
        return ['Email appears safe to read'];
      case ThreatLevel.Low:
        return [
          'Verify sender identity',
          'Avoid clicking unknown links',
          'Report if suspicious'
        ];
      case ThreatLevel.Medium:
        return [
          'Do not click any links',
          'Do not download attachments',
          'Verify sender through alternative channel',
          'Report to IT department'
        ];
      case ThreatLevel.High:
        return [
          'DO NOT interact with this email',
          'Do not reply or forward',
          'Report immediately to authorities',
          'Delete after reporting'
        ];
      case ThreatLevel.Critical:
        return [
          'IMMEDIATE ACTION REQUIRED',
          'Do not open any attachments',
          'Do not click any links',
          'Report to college IT security immediately',
          'Consider changing passwords if you interacted',
          'Delete permanently after reporting'
        ];
      default:
        return [];
    }
  }

  /**
   * Generate detailed threat report
   */
  generateReport(analysis: ThreatAnalysis, senderScore: number = 0.5): {
    score: number;
    normalizedScore: number;
    level: ThreatLevel;
    description: string;
    actions: string[];
    details: string[];
  } {
    const rawScore = this.calculateWeightedScore(analysis, senderScore);
    const normalizedScore = this.normalizeScore(rawScore);

    return {
      score: rawScore,
      normalizedScore,
      level: analysis.threatLevel,
      description: this.getThreatDescription(analysis.threatLevel),
      actions: this.getRecommendedActions(analysis.threatLevel),
      details: [
        `Confidence: ${(analysis.confidence * 100).toFixed(1)}%`,
        `Keywords detected: ${analysis.detectedKeywords.length}`,
        `Suspicious patterns: ${analysis.detectedPatterns.length}`,
        `Suspicious URLs: ${analysis.metadata.suspiciousUrls.length}`,
        `Has attachments: ${analysis.metadata.hasAttachments ? 'Yes' : 'No'}`,
      ],
    };
  }

  /**
   * Compare two threat analyses
   */
  compareThreat(a: ThreatAnalysis, b: ThreatAnalysis): number {
    return b.score - a.score; // Higher score = more dangerous
  }

  /**
   * Update scoring weights
   */
  updateWeights(newWeights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }
}

/**
 * Factory function for scorer
 */
export function createScorer(weights?: ScoringWeights): ThreatScorer {
  return new ThreatScorer(weights);
}