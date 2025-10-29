import { EventType } from '../../analyzer/src/detector';
/**
 * Represents a single proof record stored on the blockchain.
 * These correspond to on-chain reports of malicious or verified behavior.
 */
export interface ProofRecord {
    eventType: EventType;
    timestamp: number;
    sender: string;
}
/**
 * Represents full blockchain data fetched directly from Solana accounts.
 * Extends ProofRecord with additional blockchain context.
 */
export interface BlockchainProofData extends ProofRecord {
    pubkey: string;
    proof: Uint8Array;
}
/**
 * Trust level categories based on sender reputation.
 */
export declare enum TrustLevel {
    Unknown = "Unknown",
    Suspicious = "Suspicious",
    Low = "Low",
    Medium = "Medium",
    High = "High",
    Trusted = "Trusted"
}
/**
 * Aggregated reputation score for a given sender.
 * Computed from historical on-chain proof data.
 */
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
/**
 * Trend analysis result for reputation prediction.
 */
export interface ReputationTrend {
    trend: 'improving' | 'declining' | 'stable';
    prediction: number;
}
/**
 * Summary of proof statistics across all senders.
 */
export interface ProofStatistics {
    total: number;
    byType: Record<string, number>;
    uniqueSenders: number;
}
//# sourceMappingURL=types.d.ts.map