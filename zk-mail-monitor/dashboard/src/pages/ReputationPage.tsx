// dashboard/src/pages/ReputationPage.tsx
import React, { useState, useEffect } from 'react';
import { useMailchain } from '../hooks/useMailchain';
import { useReputation } from '../hooks/useReputation';
import { SenderCard } from '../components/SenderCard';
import { TrustLevel } from '../../../reputation-engine/src/calculator';

export const ReputationPage: React.FC = () => {
  const { emails } = useMailchain();
  const { getSenderReputation, reputationCache, loading } = useReputation();
  const [senders, setSenders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique senders from emails
  useEffect(() => {
   const uniqueSenders = Array.from(new Set(emails.map(e => e.from)));

    setSenders(uniqueSenders);

    // Fetch reputation for each sender
    uniqueSenders.forEach(sender => {
      if (!reputationCache.has(sender)) {
        getSenderReputation(sender);
      }
    });
  }, [emails, getSenderReputation, reputationCache]);

  // Filter senders by search query
  const filteredSenders = senders.filter(sender =>
    sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort senders by reputation score
  const sortedSenders = [...filteredSenders].sort((a, b) => {
    const repA = reputationCache.get(a);
    const repB = reputationCache.get(b);
    if (!repA && !repB) return 0;
    if (!repA) return 1;
    if (!repB) return -1;
    return repB.score - repA.score;
  });

  // Calculate statistics
  const stats = {
    total: senders.length,
    trusted: Array.from(reputationCache.values()).filter(
      r => r.trustLevel === TrustLevel.Trusted || r.trustLevel === TrustLevel.High
    ).length,
    suspicious: Array.from(reputationCache.values()).filter(
      r => r.trustLevel === TrustLevel.Suspicious || r.trustLevel === TrustLevel.Low
    ).length,
    unknown: Array.from(reputationCache.values()).filter(
      r => r.trustLevel === TrustLevel.Unknown
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sender Reputation
          </h1>
          <p className="text-gray-600">
            Track sender trustworthiness based on blockchain history
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Senders</div>
          </div>

          <div className="bg-green-50 rounded-lg shadow-sm p-6 border-2 border-green-500">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-700">{stats.trusted}</div>
            <div className="text-sm text-green-700 font-medium">Trusted</div>
          </div>

          <div className="bg-red-50 rounded-lg shadow-sm p-6 border-2 border-red-500">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-3xl font-bold text-red-700">{stats.suspicious}</div>
            <div className="text-sm text-red-700 font-medium">Suspicious</div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow-sm p-6 border-2 border-gray-300">
            <div className="text-3xl mb-2">❓</div>
            <div className="text-3xl font-bold text-gray-700">{stats.unknown}</div>
            <div className="text-sm text-gray-700 font-medium">Unknown</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <input
            type="text"
            placeholder="Search senders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        {/* Sender List */}
        {loading && sortedSenders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reputation data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedSenders.map((sender) => {
              const reputation = reputationCache.get(sender);
              return (
                <SenderCard
                  key={sender}
                  address={sender}
                  reputation={reputation || null}
                  loading={!reputation}
                />
              );
            })}
          </div>
        )}

        {sortedSenders.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No senders found</p>
          </div>
        )}
      </div>
    </div>
  );
};