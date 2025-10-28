import { EventType } from '../../analyzer/src/detector';
export interface ReputationScore {
    address: string;
    score: number;
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
export declare enum TrustLevel {
    Unknown = "Unknown",
    Suspicious = "Suspicious",
    Low = "Low",
    Medium = "Medium",
    High = "High",
    Trusted = "Trusted"
}
export interface ProofRecord {
    eventType: EventType;
    timestamp: number;
    sender: string;
}
export declare class ReputationCalculator {
    private readonly DECAY_FACTOR;
    private readonly TIME_WINDOW;
    /**
     * Calculate reputation score for a sender
     */
    calculateReputation(senderAddress: string, proofs: ProofRecord[]): ReputationScore;
    /**
     * Filter proofs within time window
     */
    private filterRelevantProofs;
    /**
     * Calculate weighted score based on proof severity and age
     */
    private calculateWeightedScore;
    /**
     * Get severity weight for event type
     */
    private getSeverityWeight;
    /**
     * Determine trust level from score
     */
    private determineTrustLevel;
    /**
     * Compare two reputation scores
     */
    compareReputation(a: ReputationScore, b: ReputationScore): number;
    /**
     * Get reputation summary
     */
    getReputationSummary(reputation: ReputationScore): string;
    /**
     * Predict future reputation based on trend
     */
    predictTrend(currentScore: number, recentProofs: ProofRecord[]): {
        trend: 'improving' | 'declining' | 'stable';
        prediction: number;
    };
    /**
     * Calculate batch reputations
     */
    calculateBatchReputations(senders: string[], allProofs: ProofRecord[]): Map<string, ReputationScore>;
}
/**
 * Factory function
 */
export declare function createReputationCalculator(): ReputationCalculator;
//# sourceMappingURL=calculator.d.ts.map