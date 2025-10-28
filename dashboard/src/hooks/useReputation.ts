// dashboard/src/hooks/useReputation.ts
import { useState, useCallback } from 'react';
import {
  ReputationCalculator,
  createCalculator,
  ReputationScore,
  TrustLevel,
} from '@reputation-engine/calculator';
import {
  BlockchainQueryService,
  createQueryService,
} from '@reputation-engine/query-blockchain';

export function useReputation() {
  const [reputationCache, setReputationCache] = useState<Map<string, ReputationScore>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize services lazily
  const [calculator] = useState(() => createCalculator());
  const [queryService] = useState(() => {
    try {
      return createQueryService({
        rpcEndpoint: process.env.REACT_APP_SOLANA_RPC || 'https://api.devnet.solana.com',
        programId: process.env.REACT_APP_PROGRAM_ID || '11111111111111111111111111111111',
      });
    } catch (err) {
      console.error('Failed to initialize query service:', err);
      return createQueryService(); // Use defaults
    }
  });

  const getSenderReputation = useCallback(
    async (senderAddress: string): Promise<ReputationScore> => {
      // Validate input
      if (!senderAddress || !senderAddress.trim()) {
        throw new Error('Sender address is required');
      }

      const normalizedAddress = senderAddress.trim();

      // Check cache first
      const cached = reputationCache.get(normalizedAddress);
      if (cached) {
        console.log('✅ Using cached reputation for:', normalizedAddress);
        return cached;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching reputation for:', normalizedAddress);

        // Query blockchain for proof records (with fallback to mock data)
        const proofRecords = await queryService.getProofRecordsBySender(normalizedAddress);
        console.log('📊 Found', proofRecords.length, 'proof records');

        // Calculate reputation score
        const score = calculator.calculateReputation(normalizedAddress, proofRecords);
        console.log('✅ Calculated reputation:', score);

        // Update cache
        setReputationCache((prev) => new Map(prev).set(normalizedAddress, score));

        return score;
      } catch (err) {
        console.error('❌ Error fetching reputation:', err);
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to fetch reputation';
        setError(errorMsg);

        // Return a default neutral score on error
        const defaultScore: ReputationScore = {
          sender: normalizedAddress,
          score: 50,
          trustLevel: TrustLevel.Neutral,
          totalProofs: 0,
          proofRecords: [],
          lastUpdated: Date.now(),
        };

        return defaultScore;
      } finally {
        setLoading(false);
      }
    },
    [reputationCache, calculator, queryService]
  );

  const refreshReputation = useCallback(
    async (senderAddress: string): Promise<void> => {
      const normalizedAddress = senderAddress.trim();

      // Remove from cache to force refresh
      setReputationCache((prev) => {
        const newCache = new Map(prev);
        newCache.delete(normalizedAddress);
        return newCache;
      });

      await getSenderReputation(normalizedAddress);
    },
    [getSenderReputation]
  );

  const clearCache = useCallback(() => {
    setReputationCache(new Map());
    setError(null);
  }, []);

  const getCachedReputation = useCallback(
    (senderAddress: string): ReputationScore | null => {
      return reputationCache.get(senderAddress.trim()) || null;
    },
    [reputationCache]
  );

  return {
    getSenderReputation,
    refreshReputation,
    getCachedReputation,
    clearCache,
    reputationCache,
    loading,
    error,
  };
}