// dashboard/src/hooks/useReputation.ts
import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  ReputationCalculator,
  ReputationScore,
  createReputationCalculator,
} from '../../../reputation-engine/src/calculator';
import {
  BlockchainQuerier,
  createBlockchainQuerier,
} from '../../../reputation-engine/src/query-blockchain';
import { useSolana } from './useSolana';

interface UseReputationResult {
  calculator: ReputationCalculator;
  querier: BlockchainQuerier | null;
  getSenderReputation: (address: string) => Promise<ReputationScore | null>;
  reputationCache: Map<string, ReputationScore>;
  loading: boolean;
  refreshReputation: (address: string) => Promise<void>;
}

const PROGRAM_ID = new PublicKey('6TUYfEDCCohKxniVqxeRpv1AAZ9mMxXUV9d2vxUvPFdV');

export const useReputation = (): UseReputationResult => {
  const { connection } = useSolana();
  const [calculator] = useState(() => createReputationCalculator());
  const [querier, setQuerier] = useState<BlockchainQuerier | null>(null);
  const [reputationCache, setReputationCache] = useState<Map<string, ReputationScore>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);

  // Initialize querier when connection is available
  useEffect(() => {
    if (connection) {
      const newQuerier = createBlockchainQuerier(connection, PROGRAM_ID);
      setQuerier(newQuerier);
      console.log('✅ Reputation querier initialized');
    }
  }, [connection]);

  // Get sender reputation
  const getSenderReputation = useCallback(
    async (address: string): Promise<ReputationScore | null> => {
      // Check cache first
      if (reputationCache.has(address)) {
        return reputationCache.get(address)!;
      }

      if (!querier) {
        console.error('Querier not initialized');
        return null;
      }

      setLoading(true);
      try {
        // Fetch proofs for this sender
        const proofs = await querier.fetchSenderProofs(address);
        
        // Calculate reputation
        const reputation = calculator.calculateReputation(address, proofs);
        
        // Cache result
        setReputationCache(prev => new Map(prev).set(address, reputation));
        
        console.log(`✅ Reputation calculated for ${address}:`, {
          score: reputation.score,
          trustLevel: reputation.trustLevel,
          maliciousProofs: reputation.maliciousProofs,
        });
        
        return reputation;
      } catch (error) {
        console.error('Failed to get reputation:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [querier, calculator, reputationCache]
  );

  // Refresh reputation (bypass cache)
  const refreshReputation = useCallback(
    async (address: string): Promise<void> => {
      // Remove from cache
      setReputationCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(address);
        return newCache;
      });
      
      // Fetch fresh data
      await getSenderReputation(address);
    },
    [getSenderReputation]
  );

  return {
    calculator,
    querier,
    getSenderReputation,
    reputationCache,
    loading,
    refreshReputation,
  };
};