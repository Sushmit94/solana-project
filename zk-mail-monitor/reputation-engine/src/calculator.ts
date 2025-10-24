// reputation-engine/src/calculator.ts
// Calculate sender reputation based on blockchain history

import { EventType } from '../../analyzer/src/detector.js';

export interface ReputationScore {
  address: string;
  score: number; // 0-1 (1 = trusted, 0 = malicious)
  totalProofs: number;
  maliciousProofs: number;
  lastUpdated: number;
  breakdown: {
    phishing: number;
    spam: number;
    malware: number;
    socialEngineering: number;
  };
  trustLevel: TrustLevel;
}

export enum TrustLevel {
  Unknown = 'Unknown',
  Suspicious = 'Suspicious',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Trusted = 'Trusted',
}

export interface ProofRecord {
  eventType: EventType;
  timestamp: number;
  sender: string;
}

export class ReputationCalculator {
  // Decay factor for older proofs (older = less weight)
  private readonly DECAY_FACTOR = 0.95;
  private readonly TIME_WINDOW = 90 * 24 * 60 * 60 * 1000; // 90 days

  /**
   * Calculate reputation score for a sender
   */
  calculateReputation(
    senderAddress: string,
    proofs: ProofRecord[]
  ): ReputationScore {
    const now = Date.now();
    const relevantProofs = this.filterRelevantProofs(proofs, now);

    // Initialize breakdown
    const breakdown = {
      phishing: 0,
      spam: 0,
      malware: 0,
      socialEngineering: 0,
    };

    // Count proof types
    for (const proof of relevantProofs) {
      switch (proof.eventType) {
        case EventType.Phishing:
          breakdown.phishing++;
          break;
        case EventType.Spam:
          breakdown.spam++;
          break;
        case EventType.Malware:
          breakdown.malware++;
          break;
        case EventType.SocialEngineering:
          breakdown.socialEngineering++;
          break;
      }
    }

    // Calculate weighted score
    const totalMalicious = relevantProofs.length;
    const weightedScore = this.calculateWeightedScore(relevantProofs, now);
    
    // Base score starts at 1.0 (fully trusted)
    // Each malicious proof reduces the score
    const score = Math.max(0, 1.0 - weightedScore);

    const trustLevel = this.determineTrustLevel(score, totalMalicious);

    return {
      address: senderAddress,
      score,
      totalProofs: proofs.length,
      maliciousProofs: totalMalicious,
      lastUpdated: now,
      breakdown,
      trustLevel,
    };
  }

  /**
   * Filter proofs within time window
   */
  private filterRelevantProofs(proofs: ProofRecord[], now: number): ProofRecord[] {
    return proofs.filter(proof => {
      const age = now - proof.timestamp;
      return age <= this.TIME_WINDOW;
    });
  }

  /**
   * Calculate weighted score based on proof severity and age
   */
  private calculateWeightedScore(proofs: ProofRecord[], now: number): number {
    let weightedSum = 0;

    for (const proof of proofs) {
      // Calculate time decay
      const age = now - proof.timestamp;
      const daysSince = age / (24 * 60 * 60 * 1000);
      const timeDecay = Math.pow(this.DECAY_FACTOR, daysSince);

      // Calculate severity weight
      const severityWeight = this.getSeverityWeight(proof.eventType);

      // Add weighted score
      weightedSum += severityWeight * timeDecay;
    }

    return weightedSum;
  }

  /**
   * Get severity weight for event type
   */
  private getSeverityWeight(eventType: EventType): number {
    switch (eventType) {
      case EventType.Malware:
        return 0.5; // Most severe
      case EventType.Phishing:
        return 0.4;
      case EventType.SocialEngineering:
        return 0.3;
      case EventType.Spam:
        return 0.1; // Least severe
      default:
        return 0.1;
    }
  }

  /**
   * Determine trust level from score
   */
  private determineTrustLevel(score: number, totalProofs: number): TrustLevel {
    if (totalProofs === 0) {
      return TrustLevel.Unknown;
    }

    if (score >= 0.9) return TrustLevel.Trusted;
    if (score >= 0.7) return TrustLevel.High;
    if (score >= 0.5) return TrustLevel.Medium;
    if (score >= 0.3) return TrustLevel.Low;
    return TrustLevel.Suspicious;
  }

  /**
   * Compare two reputation scores
   */
  compareReputation(a: ReputationScore, b: ReputationScore): number {
    return b.score - a.score; // Higher score = more trusted
  }

  /**
   * Get reputation summary
   */
  getReputationSummary(reputation: ReputationScore): string {
    const percentage = (reputation.score * 100).toFixed(1);
    return `${reputation.trustLevel} (${percentage}% trusted) - ${reputation.maliciousProofs} malicious activities detected`;
  }

  /**
   * Predict future reputation based on trend
   */
  predictTrend(currentScore: number, recentProofs: ProofRecord[]): {
    trend: 'improving' | 'declining' | 'stable';
    prediction: number;
  } {
    if (recentProofs.length < 2) {
      return { trend: 'stable', prediction: currentScore };
    }

    // Sort by timestamp
    const sorted = [...recentProofs].sort((a, b) => a.timestamp - b.timestamp);
    
    // Calculate trend
    const oldHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const newHalf = sorted.slice(Math.floor(sorted.length / 2));

    const oldScore = oldHalf.length;
    const newScore = newHalf.length;

    let trend: 'improving' | 'declining' | 'stable';
    if (newScore > oldScore * 1.2) {
      trend = 'declining';
    } else if (newScore < oldScore * 0.8) {
      trend = 'improving';
    } else {
      trend = 'stable';
    }

    // Simple prediction: current score +/- 10%
    const prediction = trend === 'declining' 
      ? Math.max(0, currentScore - 0.1)
      : trend === 'improving'
      ? Math.min(1, currentScore + 0.1)
      : currentScore;

    return { trend, prediction };
  }

  /**
   * Calculate batch reputations
   */
  calculateBatchReputations(
    senders: string[],
    allProofs: ProofRecord[]
  ): Map<string, ReputationScore> {
    const reputations = new Map<string, ReputationScore>();

    for (const sender of senders) {
      const senderProofs = allProofs.filter(p => p.sender === sender);
      const reputation = this.calculateReputation(sender, senderProofs);
      reputations.set(sender, reputation);
    }

    return reputations;
  }
}

/**
 * Factory function
 */
export function createReputationCalculator(): ReputationCalculator {
  return new ReputationCalculator();
}