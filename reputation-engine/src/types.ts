// reputation-engine/src/types.ts
import { EventType } from '../../analyzer/src/detector';

/**
 * Trust level classification for sender reputation
 */
export enum TrustLevel {
  Trusted = 0,
  Neutral = 1,
  Suspicious = 2,
  Dangerous = 3,
}

/**
 * A single proof record from blockchain
 */
export interface ProofRecord {
  sender: string;
  eventType: EventType;
  timestamp: number;
  score: number;
  proofHash: string;
  verified: boolean;
}

/**
 * Complete reputation score for a sender
 */
export interface ReputationScore {
  sender: string;
  score: number;
  trustLevel: TrustLevel;
  totalProofs: number;
  proofRecords: ProofRecord[];
  lastUpdated: number;
}