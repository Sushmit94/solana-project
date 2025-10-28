// dashboard/src/components/SenderCard.tsx
import React from 'react';
import { TrustLevel, ReputationScore } from '@reputation-engine/calculator';

interface SenderCardProps {
  reputation: ReputationScore;
}

export const SenderCard: React.FC<SenderCardProps> = ({ reputation }) => {
  const getTrustColor = (level: TrustLevel): string => {
    switch (level) {
      case TrustLevel.Trusted:
        return 'border-green-600 bg-green-50';
      case TrustLevel.Neutral:
        return 'border-yellow-500 bg-yellow-50';
      case TrustLevel.Suspicious:
        return 'border-orange-500 bg-orange-50';
      case TrustLevel.Dangerous:
        return 'border-red-600 bg-red-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const getTrustIcon = (level: TrustLevel): string => {
    switch (level) {
      case TrustLevel.Trusted:
        return '✅';
      case TrustLevel.Neutral:
        return '⚡';
      case TrustLevel.Suspicious:
        return '⚠️';
      case TrustLevel.Dangerous:
        return '🚨';
      default:
        return '❓';
    }
  };

  const getTrustLabel = (level: TrustLevel): string => {
    switch (level) {
      case TrustLevel.Trusted:
        return 'Trusted';
      case TrustLevel.Neutral:
        return 'Neutral';
      case TrustLevel.Suspicious:
        return 'Suspicious';
      case TrustLevel.Dangerous:
        return 'Dangerous';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString();
  };

  // Count proofs by type
  const proofsByType = reputation.proofRecords.reduce((acc, proof) => {
    const type = proof.eventType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentActivity = reputation.proofRecords.filter(
    proof => proof.timestamp > thirtyDaysAgo
  ).length;

  // Get first and last seen
  const timestamps = reputation.proofRecords.map(p => p.timestamp).filter(Boolean);
  const firstSeen = timestamps.length > 0 ? Math.min(...timestamps) : reputation.lastUpdated;
  const lastSeen = timestamps.length > 0 ? Math.max(...timestamps) : reputation.lastUpdated;

  return (
    <div className={`p-4 rounded-lg border-2 ${getTrustColor(reputation.trustLevel)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTrustIcon(reputation.trustLevel)}</span>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {reputation.sender.slice(0, 8)}...
              {reputation.sender.length > 15 ? reputation.sender.slice(-6) : ''}
            </p>
            <p className="text-xs text-gray-500">{getTrustLabel(reputation.trustLevel)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">Trust Score</p>
          <p
            className="text-2xl font-bold"
            style={{
              color:
                reputation.score > 70
                  ? '#16a34a'
                  : reputation.score > 40
                  ? '#eab308'
                  : '#dc2626',
            }}
          >
            {reputation.score.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Total Reports</p>
          <p className="text-xl font-bold text-gray-800">{reputation.totalProofs}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Recent (30d)</p>
          <p className="text-xl font-bold text-orange-600">{recentActivity}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">First Seen</p>
          <p className="text-xs font-medium text-gray-700">{formatDate(firstSeen)}</p>
        </div>
      </div>

      {/* Breakdown */}
      {reputation.totalProofs > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Threat Breakdown</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(proofsByType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                <span>
                  {type.includes('Phishing')
                    ? '🎣'
                    : type.includes('Spam')
                    ? '📧'
                    : type.includes('Malware')
                    ? '🦠'
                    : '⚠️'}{' '}
                  {type}:
                </span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-3 mt-3">
        <p className="text-xs text-gray-500">Last seen: {formatDate(lastSeen)}</p>
      </div>
    </div>
  );
};