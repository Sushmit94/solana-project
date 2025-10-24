// reputation-engine/src/query-blockchain.ts
// Query Solana blockchain for sender proof history

import {
  Connection,
  PublicKey,
} from '@solana/web3.js';
import type {GetProgramAccountsFilter} from '@solana/web3.js';
import type { ProofRecord } from './calculator.js';
import { EventType } from '../../analyzer/src/detector.js';

export interface BlockchainProofData {
  pubkey: string;
  proof: Uint8Array;
  eventType: EventType;
  timestamp: number;
  sender: string;
}

export class BlockchainQuerier {
  constructor(
    private connection: Connection,
    private programId: PublicKey
  ) {}

  /**
   * Fetch all proofs for a specific sender
   */
  async fetchSenderProofs(senderAddress: string): Promise<ProofRecord[]> {
    console.log(`🔍 Fetching proofs for sender: ${senderAddress}`);

    try {
      // Create filter for sender's PDA
      const senderPubkey = new PublicKey(senderAddress);
      
      // Get all accounts with this sender as a seed
      const accounts = await this.connection.getProgramAccounts(
        this.programId,
        {
          filters: [
            {
              memcmp: {
                offset: 8, // Skip discriminator
                bytes: senderPubkey.toBase58(),
              },
            },
          ],
        }
      );

      console.log(`Found ${accounts.length} proof records`);

      // Parse accounts into proof records
      const proofs: ProofRecord[] = [];
      for (const account of accounts) {
        try {
          const parsed = this.parseProofAccount(account.account.data, senderAddress);
          if (parsed) {
            proofs.push(parsed);
          }
        } catch (e) {
          console.error('Failed to parse proof account:', e);
        }
      }

      return proofs;
    } catch (error) {
      console.error('Error fetching sender proofs:', error);
      return [];
    }
  }

  /**
   * Fetch all proofs from the program
   */
  async fetchAllProofs(): Promise<BlockchainProofData[]> {
    console.log('🔍 Fetching all proofs from blockchain...');

    try {
      const accounts = await this.connection.getProgramAccounts(this.programId);
      console.log(`Found ${accounts.length} total accounts`);

      const proofs: BlockchainProofData[] = [];
      for (const account of accounts) {
        try {
          const parsed = this.parseFullProofAccount(
            account.pubkey.toBase58(),
            account.account.data
          );
          if (parsed) {
            proofs.push(parsed);
          }
        } catch (e) {
          console.error('Failed to parse account:', e);
        }
      }

      return proofs;
    } catch (error) {
      console.error('Error fetching all proofs:', error);
      return [];
    }
  }

  /**
   * Fetch recent proofs within time window
   */
  async fetchRecentProofs(timeWindowMs: number): Promise<ProofRecord[]> {
    const now = Date.now();
    const cutoffTime = now - timeWindowMs;

    console.log(`🔍 Fetching proofs from last ${timeWindowMs / 1000 / 60 / 60} hours`);

    const allProofs = await this.fetchAllProofs();
    const recentProofs = allProofs
      .filter(proof => proof.timestamp >= cutoffTime)
      .map(proof => ({
        eventType: proof.eventType,
        timestamp: proof.timestamp,
        sender: proof.sender,
      }));

    console.log(`Found ${recentProofs.length} recent proofs`);
    return recentProofs;
  }

  /**
   * Get proof count by event type
   */
  async getProofStatistics(): Promise<{
    total: number;
    byType: Record<string, number>;
    uniqueSenders: number;
  }> {
    const allProofs = await this.fetchAllProofs();

    const byType: Record<string, number> = {
      Phishing: 0,
      Spam: 0,
      Malware: 0,
      SocialEngineering: 0,
    };

    const senders = new Set<string>();

   for (const proof of allProofs) {
  const eventKey = EventType[proof.eventType] as keyof typeof EventType;
  if (eventKey && byType[eventKey] !== undefined) {
    byType[eventKey]++;
  }
  senders.add(proof.sender);
}

    return {
      total: allProofs.length,
      byType,
      uniqueSenders: senders.size,
    };
  }

  /**
   * Parse proof account data into ProofRecord
   */
  private parseProofAccount(data: Buffer, sender: string): ProofRecord | null {
    try {
      // Account structure: [discriminator:8][proof:Vec<u8>][event_type:1][timestamp:8]
      
      // Skip discriminator (8 bytes)
      let offset = 8;

      // Read Vec<u8> length (4 bytes)
      const proofLength = data.readUInt32LE(offset);
      offset += 4;

      // Skip proof bytes
      offset += proofLength;

      // Read event_type (1 byte)
      const eventType = data.readUInt8(offset) as EventType;
      offset += 1;

      // Read timestamp (8 bytes, i64)
      const timestamp = Number(data.readBigInt64LE(offset)) * 1000; // Convert to ms

      return {
        eventType,
        timestamp,
        sender,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Parse full proof account with all data
   */
  private parseFullProofAccount(
    pubkey: string,
    data: Buffer
  ): BlockchainProofData | null {
    try {
      let offset = 8; // Skip discriminator

      // Read proof Vec<u8>
      const proofLength = data.readUInt32LE(offset);
      offset += 4;
      const proof = new Uint8Array(data.slice(offset, offset + proofLength));
      offset += proofLength;

      // Read event_type
      const eventType = data.readUInt8(offset) as EventType;
      offset += 1;

      // Read timestamp
      const timestamp = Number(data.readBigInt64LE(offset)) * 1000;

      // Extract sender from PDA (simplified - in production parse PDA seeds)
      const sender = 'unknown'; // Would derive from PDA seeds

      return {
        pubkey,
        proof,
        eventType,
        timestamp,
        sender,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Subscribe to new proofs
   */
  subscribeToProofs(
  callback: (proof: BlockchainProofData) => void
): number {
  console.log('👂 Subscribing to new proofs...');

  return this.connection.onProgramAccountChange(
    this.programId,
    (keyedAccountInfo, context) => {
      try {
        const dataBuffer = Buffer.from(keyedAccountInfo.accountInfo.data);
        const parsed = this.parseFullProofAccount(
          keyedAccountInfo.accountId.toBase58(),
          dataBuffer
        );
        if (parsed) {
          callback(parsed);
        }
      } catch (e) {
        console.error('Error in subscription callback:', e);
      }
    }
  );
}

  /**
   * Unsubscribe from proofs
   */
  async unsubscribe(subscriptionId: number): Promise<void> {
    await this.connection.removeAccountChangeListener(subscriptionId);
    console.log('🔇 Unsubscribed from proofs');
  }
}

/**
 * Factory function
 */
export function createBlockchainQuerier(
  connection: Connection,
  programId: PublicKey
): BlockchainQuerier {
  return new BlockchainQuerier(connection, programId);
}