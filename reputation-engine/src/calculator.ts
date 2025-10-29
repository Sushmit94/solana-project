// reputation-engine/src/calculator.ts
import type { ProofRecord, ReputationScore } from './types';
import { TrustLevel } from './types';
import { EventType } from '../../analyzer/src/detector';

export type { ProofRecord, ReputationScore };
export { TrustLevel };

export class ReputationCalculator {
  private readonly BASE_SCORE = 100;
  private readonly PENALTY_WEIGHTS = {
    phishing: 30,
    spam: 15,
    malware: 40,
    scam: 35,
  };

  /**
   * Calculate reputation score based on proof records
   */
  calculateReputation(sender: string, proofRecords: ProofRecord[]): ReputationScore {
    const totalProofs = proofRecords.length;

    // Start with base score
    let score = this.BASE_SCORE;

    // Apply penalties for each proof
    proofRecords.forEach((proof) => {
      const penalty = this.calculatePenalty(proof);
      score -= penalty;
    });

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Determine trust level
    const trustLevel = this.determineTrustLevel(score, totalProofs);

    return {
      sender,
      score,
      trustLevel,
      totalProofs,
      proofRecords,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Calculate penalty for a single proof record
   */
  private calculatePenalty(proof: ProofRecord): number {
    // Base penalty from event type
    let penalty = 0;
    const eventType = String(proof.eventType || 'spam').toLowerCase();

    if (eventType.includes('phishing')) {
      penalty = this.PENALTY_WEIGHTS.phishing;
    } else if (eventType.includes('malware')) {
      penalty = this.PENALTY_WEIGHTS.malware;
    } else if (eventType.includes('scam')) {
      penalty = this.PENALTY_WEIGHTS.scam;
    } else {
      penalty = this.PENALTY_WEIGHTS.spam;
    }

    // Adjust based on proof score (0-100)
    const scoreMultiplier = proof.score / 100;
    penalty *= scoreMultiplier;

    // Recent proofs have more weight
    const age = Date.now() - proof.timestamp;
    const daysOld = age / (1000 * 60 * 60 * 24);
    const recencyMultiplier = Math.max(0.5, 1 - daysOld / 365); // Decay over a year
    penalty *= recencyMultiplier;

    return penalty;
  }

  /**
   * Determine trust level based on score and proof count
   */
  private determineTrustLevel(score: number, proofCount: number): TrustLevel {
    // If there are many proofs, be more strict
    if (proofCount >= 5) {
      return TrustLevel.Dangerous;
    }

    if (score >= 80 && proofCount === 0) {
      return TrustLevel.Trusted;
    }

    if (score >= 60) {
      return TrustLevel.Neutral;
    }

    if (score >= 40) {
      return TrustLevel.Suspicious;
    }

    return TrustLevel.Dangerous;
  }

  /**
   * Check if sender is trustworthy
   */
  isTrustworthy(score: ReputationScore): boolean {
    return score.trustLevel === TrustLevel.Trusted;
  }

  /**
   * Check if sender is dangerous
   */
  isDangerous(score: ReputationScore): boolean {
    return score.trustLevel === TrustLevel.Dangerous;
  }

  /**
   * Get reputation summary text
   */
  getReputationSummary(score: ReputationScore): string {
    switch (score.trustLevel) {
      case TrustLevel.Trusted:
        return 'This sender has an excellent reputation with no reported incidents.';
      case TrustLevel.Neutral:
        return 'This sender has a neutral reputation. Exercise normal caution.';
      case TrustLevel.Suspicious:
        return 'This sender has some reported incidents. Be cautious.';
      case TrustLevel.Dangerous:
        return 'This sender has multiple malicious reports. DO NOT TRUST.';
      default:
        return 'Reputation unknown.';
    }
  }
}

/**
 * Factory function to create calculator instance
 */
export function createCalculator(): ReputationCalculator {
  return new ReputationCalculator();
}