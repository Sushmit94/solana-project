// dashboard/src/pages/ReputationPage.tsx
import React, { useState } from 'react';
import { useReputation } from '../hooks/useReputation';
import { ReputationScore, TrustLevel } from '@reputation-engine/calculator';

export const ReputationPage: React.FC = () => {
  const { getSenderReputation, loading, error } = useReputation();
  const [searchAddress, setSearchAddress] = useState('');
  const [currentScore, setCurrentScore] = useState<ReputationScore | null>(null);

  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      alert('Please enter a sender address');
      return;
    }

    try {
      const score = await getSenderReputation(searchAddress.trim());
      setCurrentScore(score);
    } catch (err) {
      console.error('Failed to get reputation:', err);
    }
  };

  const handleTestSender = async (testAddress: string, description: string) => {
    setSearchAddress(testAddress);
    try {
      const score = await getSenderReputation(testAddress);
      setCurrentScore(score);
    } catch (err) {
      console.error('Failed to get reputation:', err);
    }
  };

  const getTrustLevelColor = (level?: TrustLevel) => {
    switch (level) {
      case TrustLevel.Trusted:
        return 'bg-green-100 text-green-800 border-green-300';
      case TrustLevel.Neutral:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case TrustLevel.Suspicious:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case TrustLevel.Dangerous:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTrustLevelBadge = (level?: TrustLevel) => {
    switch (level) {
      case TrustLevel.Trusted:
        return '✓ Trusted';
      case TrustLevel.Neutral:
        return '○ Neutral';
      case TrustLevel.Suspicious:
        return '⚠ Suspicious';
      case TrustLevel.Dangerous:
        return '✗ Dangerous';
      default:
        return '? Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sender Reputation</h1>
          <p className="text-gray-600">
            Check sender trust scores based on blockchain-verified proof history
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter sender email or Solana address"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchAddress.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Checking...
                </span>
              ) : (
                'Check Reputation'
              )}
            </button>
          </div>

          {/* Test Senders */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">Quick test with sample senders:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTestSender('security@mailchain.com', 'Clean sender')}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
              >
                ✓ Clean Sender
              </button>
              <button
                onClick={() => handleTestSender('phishing-test@spam.com', 'Phishing sender')}
                className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
              >
                ⚠ Phishing Sender
              </button>
              <button
                onClick={() => handleTestSender('spam@malicious.net', 'Spam sender')}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm hover:bg-orange-200"
              >
                ⚠ Spam Sender
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {currentScore && (
          <div className="space-y-6">
            {/* Trust Level Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {currentScore.sender}
                  </h2>
                  <p className="text-sm text-gray-600">Reputation Analysis</p>
                </div>
                <div
                  className={`px-6 py-3 rounded-lg border-2 font-bold text-lg ${getTrustLevelColor(
                    currentScore.trustLevel
                  )}`}
                >
                  {getTrustLevelBadge(currentScore.trustLevel)}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Trust Score</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentScore.score.toFixed(0)}
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${currentScore.score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentScore.totalProofs}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Blockchain-verified incidents
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Confidence</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentScore.totalProofs > 0 ? '95' : '50'}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {currentScore.totalProofs} records
                  </p>
                </div>
              </div>
            </div>

            {/* Proof History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Proof History</h3>
              {currentScore.proofRecords.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✓</div>
                  <p className="text-gray-600 font-medium">No malicious activity detected</p>
                  <p className="text-sm text-gray-500 mt-1">
                    This sender has a clean record with no reported incidents
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentScore.proofRecords.map((proof, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              {proof.eventType}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(proof.timestamp).toLocaleDateString()}
                            </span>
                            {proof.verified && (
                              <span className="text-green-600 text-xs">✓ Verified</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 font-mono truncate">
                            Proof: {proof.proofHash}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Threat Score</p>
                          <p className="text-lg font-bold text-red-600">{proof.score}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendation */}
            <div
              className={`rounded-lg border-2 p-6 ${
                currentScore.trustLevel === TrustLevel.Trusted
                  ? 'bg-green-50 border-green-300'
                  : currentScore.trustLevel === TrustLevel.Dangerous
                  ? 'bg-red-50 border-red-300'
                  : 'bg-yellow-50 border-yellow-300'
              }`}
            >
              <h3 className="font-bold text-gray-900 mb-2">Recommendation</h3>
              <p className="text-gray-700">
                {currentScore.trustLevel === TrustLevel.Trusted &&
                  'This sender has a strong reputation with no reported incidents. Emails from this address are likely safe.'}
                {currentScore.trustLevel === TrustLevel.Neutral &&
                  'This sender has limited history. Exercise normal caution when interacting with emails from this address.'}
                {currentScore.trustLevel === TrustLevel.Suspicious &&
                  'This sender has some reported incidents. Be cautious and verify any suspicious content before taking action.'}
                {currentScore.trustLevel === TrustLevel.Dangerous &&
                  'This sender has multiple verified malicious reports. DO NOT trust emails from this address and avoid clicking any links.'}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!currentScore && !loading && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Check Sender Reputation
            </h3>
            <p className="text-gray-600 mb-6">
              Enter an email address or Solana address to view their trust score and
              proof history
            </p>
            <div className="text-sm text-gray-500">
              <p>✓ Blockchain-verified proof records</p>
              <p>✓ Real-time trust scoring</p>
              <p>✓ Historical incident tracking</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};