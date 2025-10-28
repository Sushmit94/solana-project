import { Connection, PublicKey } from '@solana/web3.js';
import type { ProofRecord } from './calculator';
import { EventType } from '../../analyzer/src/detector';
export interface BlockchainProofData {
    pubkey: string;
    proof: Uint8Array;
    eventType: EventType;
    timestamp: number;
    sender: string;
}
export declare class BlockchainQuerier {
    private connection;
    private programId;
    constructor(connection: Connection, programId: PublicKey);
    /**
     * Fetch all proofs for a specific sender
     */
    fetchSenderProofs(senderAddress: string): Promise<ProofRecord[]>;
    /**
     * Fetch all proofs from the program
     */
    fetchAllProofs(): Promise<BlockchainProofData[]>;
    /**
     * Fetch recent proofs within time window
     */
    fetchRecentProofs(timeWindowMs: number): Promise<ProofRecord[]>;
    /**
     * Get proof count by event type
     */
    getProofStatistics(): Promise<{
        total: number;
        byType: Record<string, number>;
        uniqueSenders: number;
    }>;
    /**
     * Parse proof account data into ProofRecord
     */
    private parseProofAccount;
    /**
     * Parse full proof account with all data
     */
    private parseFullProofAccount;
    /**
     * Subscribe to new proofs
     */
    subscribeToProofs(callback: (proof: BlockchainProofData) => void): number;
    /**
     * Unsubscribe from proofs
     */
    unsubscribe(subscriptionId: number): Promise<void>;
}
/**
 * Factory function
 */
export declare function createBlockchainQuerier(connection: Connection, programId: PublicKey): BlockchainQuerier;
//# sourceMappingURL=query-blockchain.d.ts.map