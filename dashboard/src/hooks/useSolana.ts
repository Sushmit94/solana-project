// dashboard/src/hooks/useSolana.ts - FIXED VERSION WITH DEBUGGING
import { useState, useEffect, useCallback } from 'react';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { ZKProof } from '@analyzer/proof-generator';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: () => void) => void;
      publicKey: PublicKey | null;
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

const PROGRAM_ID = new PublicKey('G9DrkqHZj8LwKdTMtCwP9tdLBLf8ZegkwDWUA47wvZzQ');
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

export const useSolana = (): UseSolanaResult => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connection] = useState(() => new Connection(RPC_ENDPOINT, 'confirmed'));

  const checkPhantom = useCallback(() => {
    if (!window.solana || !window.solana.isPhantom) {
      alert('Please install Phantom wallet: https://phantom.app/');
      return false;
    }
    return true;
  }, []);

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
      alert(`Wallet connection failed: ${error}`);
    } finally {
      setConnecting(false);
    }
  }, [checkPhantom]);

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

  const submitProof = useCallback(
    async (proof: ZKProof): Promise<string | null> => {
      if (!connected || !publicKey || !window.solana) {
        const error = 'Wallet not connected';
        console.error('❌', error);
        throw new Error(error);
      }

      try {
        console.log('📤 Submitting proof to Solana...');
        console.log('🔍 Proof object:', proof);

        const userPubkey = new PublicKey(publicKey);

        // Check wallet balance
        const balance = await connection.getBalance(userPubkey);
        console.log(`💰 Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
        
        if (balance < 0.001 * LAMPORTS_PER_SOL) {
          throw new Error(
            `Insufficient balance: ${balance / LAMPORTS_PER_SOL} SOL. Need at least 0.001 SOL for transaction fees.`
          );
        }

        // Validate proof structure
        if (!proof.proof || proof.proof.length === 0) {
          throw new Error('Invalid proof: proof bytes are empty');
        }
        if (!proof.publicInputs || typeof proof.publicInputs.eventType !== 'number') {
          throw new Error('Invalid proof: missing or invalid publicInputs');
        }

        // Find PDA for proof record
        const [proofPDA, bump] = await PublicKey.findProgramAddress(
          [Buffer.from('proof'), userPubkey.toBuffer()],
          PROGRAM_ID
        );

        console.log('📍 Proof PDA:', proofPDA.toString());
        console.log('📍 PDA Bump:', bump);

        // Check if PDA account already exists
        const accountInfo = await connection.getAccountInfo(proofPDA);
        console.log('📊 PDA Account exists?', accountInfo !== null);

        // Build instruction data according to Rust program
        // Format: [instruction_discriminator, proof_length, ...proof_bytes, event_type]
        const proofBytes = Array.from(proof.proof);
        const eventTypeByte = proof.publicInputs.eventType;
        
        console.log(`📦 Proof length: ${proofBytes.length} bytes`);
        console.log(`🏷️ Event type: ${eventTypeByte}`);

        // Instruction discriminator (use 0 for the first instruction)
        const discriminator = 0;
        
        // Build instruction data
        const instructionData = Buffer.concat([
          Buffer.from([discriminator]),           // Instruction type (1 byte)
          Buffer.from([proofBytes.length]),       // Proof length (1 byte)
          Buffer.from(proofBytes),                // Proof bytes (variable)
          Buffer.from([eventTypeByte]),           // Event type (1 byte)
        ]);

        console.log(`📋 Instruction data length: ${instructionData.length} bytes`);

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

        console.log('📝 Instruction created');

        // Create transaction
        const transaction = new Transaction();
        transaction.add(instruction);
        transaction.feePayer = userPubkey;

        // Get recent blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        transaction.recentBlockhash = blockhash;

        console.log('🔗 Blockhash:', blockhash);

        // Estimate transaction size
        const serializedTx = transaction.serialize({ requireAllSignatures: false });
        console.log(`📏 Transaction size: ${serializedTx.length} bytes (max: 1232 bytes)`);

        if (serializedTx.length > 1232) {
          throw new Error(`Transaction too large: ${serializedTx.length} bytes (max: 1232)`);
        }

        // Sign and send transaction
        console.log('✍️ Signing transaction...');
        const { signature } = await window.solana.signAndSendTransaction(transaction);
        
        console.log('✅ Transaction sent! Signature:', signature);
        console.log(`🔗 View on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

        // Wait for confirmation with timeout
        console.log('⏳ Waiting for confirmation...');
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          'confirmed'
        );

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        console.log('✅ Transaction confirmed!');
        
        return signature;
      } catch (error: any) {
        console.error('❌ Failed to submit proof:', error);
        
        // Enhanced error messages
        let errorMessage = 'Unknown error occurred';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error.toString) {
          errorMessage = error.toString();
        }

        // Check for common errors
        if (errorMessage.includes('0x1')) {
          errorMessage = 'Transaction failed: Insufficient funds for rent';
        } else if (errorMessage.includes('0x0')) {
          errorMessage = 'Transaction failed: Program error occurred';
        } else if (errorMessage.includes('Transaction simulation failed')) {
          errorMessage = 'Transaction simulation failed - check program logic';
        }

        console.error('💬 Error details:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    [connected, publicKey, connection]
  );

  useEffect(() => {
    if (window.solana && window.solana.publicKey) {
      setPublicKey(window.solana.publicKey.toString());
      setConnected(true);
    }

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