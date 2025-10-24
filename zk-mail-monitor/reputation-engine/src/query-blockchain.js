// reputation-engine/src/query-blockchain.ts
// Query Solana blockchain for sender proof history
import { Connection, PublicKey, } from '@solana/web3.js';
import { EventType } from '../../analyzer/src/detector.js';
export class BlockchainQuerier {
    constructor(connection, programId) {
        this.connection = connection;
        this.programId = programId;
    }
    /**
     * Fetch all proofs for a specific sender
     */
    async fetchSenderProofs(senderAddress) {
        console.log(`🔍 Fetching proofs for sender: ${senderAddress}`);
        try {
            // Create filter for sender's PDA
            const senderPubkey = new PublicKey(senderAddress);
            // Get all accounts with this sender as a seed
            const accounts = await this.connection.getProgramAccounts(this.programId, {
                filters: [
                    {
                        memcmp: {
                            offset: 8, // Skip discriminator
                            bytes: senderPubkey.toBase58(),
                        },
                    },
                ],
            });
            console.log(`Found ${accounts.length} proof records`);
            // Parse accounts into proof records
            const proofs = [];
            for (const account of accounts) {
                try {
                    const parsed = this.parseProofAccount(account.account.data, senderAddress);
                    if (parsed) {
                        proofs.push(parsed);
                    }
                }
                catch (e) {
                    console.error('Failed to parse proof account:', e);
                }
            }
            return proofs;
        }
        catch (error) {
            console.error('Error fetching sender proofs:', error);
            return [];
        }
    }
    /**
     * Fetch all proofs from the program
     */
    async fetchAllProofs() {
        console.log('🔍 Fetching all proofs from blockchain...');
        try {
            const accounts = await this.connection.getProgramAccounts(this.programId);
            console.log(`Found ${accounts.length} total accounts`);
            const proofs = [];
            for (const account of accounts) {
                try {
                    const parsed = this.parseFullProofAccount(account.pubkey.toBase58(), account.account.data);
                    if (parsed) {
                        proofs.push(parsed);
                    }
                }
                catch (e) {
                    console.error('Failed to parse account:', e);
                }
            }
            return proofs;
        }
        catch (error) {
            console.error('Error fetching all proofs:', error);
            return [];
        }
    }
    /**
     * Fetch recent proofs within time window
     */
    async fetchRecentProofs(timeWindowMs) {
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
    async getProofStatistics() {
        const allProofs = await this.fetchAllProofs();
        const byType = {
            Phishing: 0,
            Spam: 0,
            Malware: 0,
            SocialEngineering: 0,
        };
        const senders = new Set();
        for (const proof of allProofs) {
            const eventKey = EventType[proof.eventType];
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
    parseProofAccount(data, sender) {
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
            const eventType = data.readUInt8(offset);
            offset += 1;
            // Read timestamp (8 bytes, i64)
            const timestamp = Number(data.readBigInt64LE(offset)) * 1000; // Convert to ms
            return {
                eventType,
                timestamp,
                sender,
            };
        }
        catch (e) {
            return null;
        }
    }
    /**
     * Parse full proof account with all data
     */
    parseFullProofAccount(pubkey, data) {
        try {
            let offset = 8; // Skip discriminator
            // Read proof Vec<u8>
            const proofLength = data.readUInt32LE(offset);
            offset += 4;
            const proof = new Uint8Array(data.slice(offset, offset + proofLength));
            offset += proofLength;
            // Read event_type
            const eventType = data.readUInt8(offset);
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
        }
        catch (e) {
            return null;
        }
    }
    /**
     * Subscribe to new proofs
     */
    subscribeToProofs(callback) {
        console.log('👂 Subscribing to new proofs...');
        return this.connection.onProgramAccountChange(this.programId, (keyedAccountInfo, context) => {
            try {
                const dataBuffer = Buffer.from(keyedAccountInfo.accountInfo.data);
                const parsed = this.parseFullProofAccount(keyedAccountInfo.accountId.toBase58(), dataBuffer);
                if (parsed) {
                    callback(parsed);
                }
            }
            catch (e) {
                console.error('Error in subscription callback:', e);
            }
        });
    }
    /**
     * Unsubscribe from proofs
     */
    async unsubscribe(subscriptionId) {
        await this.connection.removeAccountChangeListener(subscriptionId);
        console.log('🔇 Unsubscribed from proofs');
    }
}
/**
 * Factory function
 */
export function createBlockchainQuerier(connection, programId) {
    return new BlockchainQuerier(connection, programId);
}
//# sourceMappingURL=query-blockchain.js.map