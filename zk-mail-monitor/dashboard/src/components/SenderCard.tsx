// dashboard/src/components/SenderCard.tsx
import React from 'react';
import {
  ReputationScore,
  TrustLevel,
} from '../../../reputation-engine/src/calculator';
import { EventType } from '../../../analyzer/src/detector';

interface SenderCardProps {
  address: string;
  reputation: ReputationScore | null;
  loading: boolean;
}

export const SenderCard: React.FC<SenderCardProps> = ({
  address,
  reputation,
  loading,
}) => {
  const getTrustColor = (level: TrustLevel) => {
    switch (level) {
      case TrustLevel.Trusted:
        return 'border-green-500 bg-green-50';
      case TrustLevel.High:
        return 'border-green-400 bg-green-50';
      case TrustLevel.Medium:
        return 'border-yellow-500 bg-yellow-50';
      case TrustLevel.Low:
        return 'border-orange-500 bg-orange-50';
      case TrustLevel.Suspicious:
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getTrustIcon = (level: TrustLevel) => {
    switch (level) {
      case TrustLevel.Trusted:
        return '🌟';
      case TrustLevel.High:
        return '✅';
      case TrustLevel.Medium:
        return '⚡';
      case TrustLevel.Low:
        return '⚠️';
      case TrustLevel.Suspicious:
        return '🚨';
      default:
        return '❓';
    }
  };

  if (loading || !reputation) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg shadow-sm p-6 border-2 ${getTrustColor(
        reputation.trustLevel
      )}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1">Sender Address</p>
          <p className="font-mono text-sm text-gray-900 break-all">{address}</p>
        </div>
        <div className="text-4xl ml-4">{getTrustIcon(reputation.trustLevel)}</div>
      </div>

      {/* Trust Level */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Trust Level</span>
          <span className="font-bold text-lg">{reputation.trustLevel}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              reputation.score >= 0.9
                ? 'bg-green-500'
                : reputation.score >= 0.7
                ? 'bg-green-400'
                : reputation.score >= 0.5
                ? 'bg-yellow-500'
                : reputation.score >= 0.3
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${reputation.score * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-1 text-right">
          {(reputation.score * 100).toFixed(1)}% trusted
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Reports</p>
          <p className="text-2xl font-bold text-gray-900">
            {reputation.totalProofs}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Malicious</p>
          <p className="text-2xl font-bold text-red-600">
            {reputation.maliciousProofs}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      {reputation.maliciousProofs > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Threat Breakdown
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {reputation.breakdown.phishing > 0 && (
              <div className="flex items-center gap-2">
                <span>🎣 Phishing:</span>
                <span className="font-bold">{reputation.breakdown.phishing}</span>
              </div>
            )}
            {reputation.breakdown.spam > 0 && (
              <div className="flex items-center gap-2">
                <span>📧 Spam:</span>
                <span className="font-bold">{reputation.breakdown.spam}</span>
              </div>
            )}
            {reputation.breakdown.malware > 0 && (
              <div className="flex items-center gap-2">
                <span>🦠 Malware:</span>
                <span className="font-bold">{reputation.breakdown.malware}</span>
              </div>
            )}
            {reputation.breakdown.socialEngineering > 0 && (
              <div className="flex items-center gap-2">
                <span>🎭 Social Eng.:</span>
                <span className="font-bold">
                  {reputation.breakdown.socialEngineering}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="border-t border-gray-200 pt-3 mt-3">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(reputation.lastUpdated).toLocaleString()}
        </p>
      </div>
    </div>
  );
};