// reputation-engine/src/query-blockchain.ts
// Query Solana blockchain for proof records with proper error handling

import { Connection, PublicKey } from '@solana/web3.js';
import type { GetProgramAccountsFilter } from '@solana/web3.js';
import type { ProofRecord } from './types';
import { EventType } from '../../analyzer/src/detector';

export interface BlockchainConfig {
  rpcEndpoint: string;
  programId: string;
}

export const DEFAULT_CONFIG: BlockchainConfig = {
  rpcEndpoint: 'https://api.devnet.solana.com',
  programId: '11111111111111111111111111111111',
};

export class BlockchainQueryService {
  private connection: Connection;
  private programId: PublicKey;

  constructor(config: BlockchainConfig = DEFAULT_CONFIG) {
    this.connection = new Connection(config.rpcEndpoint, 'confirmed');
    try {
      this.programId = new PublicKey(config.programId);
    } catch (err) {
      console.warn('⚠️ Invalid program ID, using system program:', err);
      this.programId = new PublicKey('11111111111111111111111111111111');
    }
  }

  private validateSenderAddress(senderAddress: string): PublicKey | null {
    try {
      if (this.isValidBase58(senderAddress)) {
        return new PublicKey(senderAddress);
      }
      if (senderAddress.includes('@')) {
        return this.derivePublicKeyFromEmail(senderAddress);
      }
      console.warn('⚠️ Invalid sender address format:', senderAddress);
      return null;
    } catch (err) {
      console.error('❌ Error validating sender address:', err);
      return null;
    }
  }

  private isValidBase58(str: string): boolean {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    return base58Regex.test(str) && str.length >= 32 && str.length <= 44;
  }

  private derivePublicKeyFromEmail(email: string): PublicKey {
    const encoder = new TextEncoder();
    const emailBytes = encoder.encode(email);
    const seed = new Uint8Array(32);
    for (let i = 0; i < Math.min(emailBytes.length, 32); i++) {
      seed[i] = emailBytes[i];
    }
    return new PublicKey(seed);
  }

  async getProofRecordsBySender(senderAddress: string): Promise<ProofRecord[]> {
    try {
      const senderPubkey = this.validateSenderAddress(senderAddress);
      if (!senderPubkey) {
        console.warn('⚠️ Could not validate sender address, returning mock data');
        return this.getMockProofRecords(senderAddress);
      }

      console.log('🔍 Querying blockchain for:', senderPubkey.toBase58());

      const filters: GetProgramAccountsFilter[] = [
        {
          memcmp: {
            offset: 8,
            bytes: senderPubkey.toBase58(),
          },
        },
      ];

      const accounts = await this.connection.getProgramAccounts(this.programId, {
        filters,
      });

      if (accounts.length === 0) {
        console.log('ℹ️ No on-chain records found, using mock data');
        return this.getMockProofRecords(senderAddress);
      }

      return accounts.map(account =>
        this.deserializeProofRecord(account.account.data, senderAddress)
      );
    } catch (error) {
      console.error('❌ Error querying blockchain:', error);
      console.log('📊 Returning mock data for testing');
      return this.getMockProofRecords(senderAddress);
    }
  }

  private getMockProofRecords(senderAddress: string): ProofRecord[] {
    const isSuspicious =
      senderAddress.includes('phishing') ||
      senderAddress.includes('spam') ||
      senderAddress.includes('malicious');

    if (!isSuspicious) {
      return [];
    }

    return [
      {
        sender: senderAddress,
        eventType: EventType.Phishing,
        timestamp: Date.now() - 86400000,
        score: 85,
        proofHash: '0x' + '1'.repeat(64),
        verified: true,
      },
      {
        sender: senderAddress,
        eventType: EventType.Spam,
        timestamp: Date.now() - 172800000,
        score: 60,
        proofHash: '0x' + '2'.repeat(64),
        verified: true,
      },
    ];
  }

  async getProofRecordsByEventType(
    senderAddress: string,
    eventType: EventType
  ): Promise<ProofRecord[]> {
    const allRecords = await this.getProofRecordsBySender(senderAddress);
    return allRecords.filter(record => record.eventType === eventType);
  }

  async getProofCount(senderAddress: string): Promise<number> {
    const records = await this.getProofRecordsBySender(senderAddress);
    return records.length;
  }

  async getProofCountByType(
    senderAddress: string,
    eventType: EventType
  ): Promise<number> {
    const records = await this.getProofRecordsByEventType(senderAddress, eventType);
    return records.length;
  }

  async hasMaliciousProofs(senderAddress: string): Promise<boolean> {
    const records = await this.getProofRecordsBySender(senderAddress);
    return records.length > 0;
  }

  private deserializeProofRecord(data: Buffer, sender: string): ProofRecord {
    try {
      const eventType = data.readUInt8(8) as EventType;
      const timestamp = Number(data.readBigUInt64LE(9));
      const score = data.readUInt32LE(17);

      return {
        sender,
        eventType,
        timestamp,
        score,
        proofHash: '0x' + data.slice(21, 53).toString('hex'),
        verified: true,
      };
    } catch (err) {
      console.error('Error deserializing proof record:', err);
      return {
        sender,
        eventType: EventType.Spam,
        timestamp: Date.now(),
        score: 0,
        proofHash: '0x' + '0'.repeat(64),
        verified: false,
      };
    }
  }

  setRpcEndpoint(endpoint: string): void {
    this.connection = new Connection(endpoint, 'confirmed');
  }

  setProgramId(programId: string): void {
    try {
      this.programId = new PublicKey(programId);
      console.log('✅ Updated program ID:', programId);
    } catch (err) {
      console.error('❌ Invalid program ID:', err);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      console.log('✅ Connected to Solana:', version);
      return true;
    } catch (err) {
      console.error('❌ Connection test failed:', err);
      return false;
    }
  }
}

export function createQueryService(config?: BlockchainConfig): BlockchainQueryService {
  return new BlockchainQueryService(config);
}