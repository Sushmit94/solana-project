// dashboard/src/hooks/useSolana.ts
import { useState, useEffect, useCallback } from 'react';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
} from '@solana/web3.js';
import { ZKProof } from '../../../analyzer/src/proof-generator';
import { EventType } from '../../../analyzer/src/detector';

// Phantom wallet types
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: () => void) => void;
      publicKey: PublicKey | null;

      // 🆕 Add these missing methods:
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
      signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
      signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
    };
  }
}


interface UseSolanaResult {
  connected: boolean;
  publicKey: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  submitProof: (proof: ZKProof) => Promise<string | null>;
  connection: Connection | null;
}

const PROGRAM_ID = new PublicKey('6TUYfEDCCohKxniVqxeRpv1AAZ9mMxXUV9d2vxUvPFdV');
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

export const useSolana = (): UseSolanaResult => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connection] = useState(() => new Connection(RPC_ENDPOINT, 'confirmed'));

  // Check if Phantom is installed
  const checkPhantom = useCallback(() => {
    if (!window.solana || !window.solana.isPhantom) {
      alert('Please install Phantom wallet: https://phantom.app/');
      return false;
    }
    return true;
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!checkPhantom()) return;

    setConnecting(true);
    try {
      const response = await window.solana!.connect();
      setPublicKey(response.publicKey.toString());
      setConnected(true);
      console.log('✅ Wallet connected:', response.publicKey.toString());
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  }, [checkPhantom]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (!window.solana) return;

    try {
      await window.solana.disconnect();
      setPublicKey(null);
      setConnected(false);
      console.log('✅ Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, []);

  // Submit proof to blockchain
  const submitProof = useCallback(
    async (proof: ZKProof): Promise<string | null> => {
      if (!connected || !publicKey || !window.solana) {
        console.error('Wallet not connected');
        return null;
      }

      try {
        console.log('📤 Submitting proof to Solana...');

        const userPubkey = new PublicKey(publicKey);

        // Find PDA for proof record
        const [proofPDA] = await PublicKey.findProgramAddress(
          [Buffer.from('proof'), userPubkey.toBuffer()],
          PROGRAM_ID
        );

        console.log('Proof PDA:', proofPDA.toString());

        // Build instruction data: [proof_bytes, event_type]
        const proofBytes = Array.from(proof.proof);
        const eventTypeByte = proof.publicInputs.eventType;
        
        const instructionData = Buffer.concat([
          Buffer.from(new Uint8Array([proofBytes.length])),
          Buffer.from(proofBytes),
          Buffer.from([eventTypeByte]),
        ]);

        // Create instruction
        const instruction = new TransactionInstruction({
          keys: [
            { pubkey: proofPDA, isSigner: false, isWritable: true },
            { pubkey: userPubkey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          programId: PROGRAM_ID,
          data: instructionData,
        });

        // Create and send transaction
        const transaction = new Transaction().add(instruction);
        transaction.feePayer = userPubkey;
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;

        // Sign and send with Phantom
        const { signature } = await window.solana.signAndSendTransaction(transaction);
        
        console.log('✅ Proof submitted! Signature:', signature);
        
        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');
        
        return signature;
      } catch (error) {
        console.error('Failed to submit proof:', error);
        return null;
      }
    },
    [connected, publicKey, connection]
  );

  // Auto-connect on mount if already connected
  useEffect(() => {
    if (window.solana && window.solana.publicKey) {
      setPublicKey(window.solana.publicKey.toString());
      setConnected(true);
    }

    // Listen for account changes
    if (window.solana) {
      window.solana.on('accountChanged', () => {
        if (window.solana?.publicKey) {
          setPublicKey(window.solana.publicKey.toString());
          setConnected(true);
        } else {
          setPublicKey(null);
          setConnected(false);
        }
      });
    }
  }, []);

  return {
    connected,
    publicKey,
    connecting,
    connect,
    disconnect,
    submitProof,
    connection,
  };
};