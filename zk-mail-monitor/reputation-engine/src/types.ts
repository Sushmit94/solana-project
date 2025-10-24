// reputation-engine/src/types.ts
// Centralized type definitions for the reputation engine

import { EventType } from '../../analyzer/src/detector.js';

/**
 * Represents a single proof record stored on the blockchain.
 * These correspond to on-chain reports of malicious or verified behavior.
 */
export interface ProofRecord {
  eventType: EventType;   // Type of malicious event (Phishing, Spam, etc.)
  timestamp: number;      // Unix timestamp in milliseconds
  sender: string;         // Sender's public address
}

/**
 * Represents full blockchain data fetched directly from Solana accounts.
 * Extends ProofRecord with additional blockchain context.
 */
export interface BlockchainProofData extends ProofRecord {
  pubkey: string;         // Public key of the proof account
  proof: Uint8Array;      // Raw cryptographic proof data
}

/**
 * Trust level categories based on sender reputation.
 */
export enum TrustLevel {
  Unknown = 'Unknown',
  Suspicious = 'Suspicious',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Trusted = 'Trusted',
}

/**
 * Aggregated reputation score for a given sender.
 * Computed from historical on-chain proof data.
 */
export interface ReputationScore {
  address: string;   // Sender’s public address
  score: number;     // Normalized score (0–1): higher = more trusted
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
  prediction: number; // Predicted future score (0–1)
}

/**
 * Summary of proof statistics across all senders.
 */
export interface ProofStatistics {
  total: number;
  byType: Record<string, number>;
  uniqueSenders: number;
}
