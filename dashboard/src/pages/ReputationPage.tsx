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

  const handleTestSender = async (testAddress: string) => {
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
        return 'bg-green-900/30 text-green-300 border-green-700';
      case TrustLevel.Neutral:
        return 'bg-blue-900/30 text-blue-300 border-blue-700';
      case TrustLevel.Suspicious:
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case TrustLevel.Dangerous:
        return 'bg-red-900/30 text-red-300 border-red-700';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
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
    <div className="min-h-screen bg-[#0d1117] text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sender Reputation</h1>
          <p className="text-gray-400">
            Check sender trust scores based on blockchain-verified proof history
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-[#161b22] rounded-lg shadow-md p-6 mb-6 border border-gray-700">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter sender email or Solana address"
              className="flex-1 px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-3">Quick test with sample senders:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTestSender('security@mailchain.com')}
                className="px-3 py-1 bg-green-900/40 text-green-300 rounded text-sm hover:bg-green-800"
              >
                ✓ Clean Sender
              </button>
              <button
                onClick={() => handleTestSender('phishing-test@spam.com')}
                className="px-3 py-1 bg-red-900/40 text-red-300 rounded text-sm hover:bg-red-800"
              >
                ⚠ Phishing Sender
              </button>
              <button
                onClick={() => handleTestSender('spam@malicious.net')}
                className="px-3 py-1 bg-yellow-900/40 text-yellow-300 rounded text-sm hover:bg-yellow-800"
              >
                ⚠ Spam Sender
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 mb-6 text-red-300">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold mb-1">Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {currentScore && (
          <div className="space-y-6">
            {/* Trust Level Card */}
            <div className="bg-[#161b22] rounded-lg shadow-md p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{currentScore.sender}</h2>
                  <p className="text-sm text-gray-400">Reputation Analysis</p>
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
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Trust Score</p>
                  <p className="text-3xl font-bold text-white">
                    {currentScore.score.toFixed(0)}
                  </p>
                  <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${currentScore.score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Total Reports</p>
                  <p className="text-3xl font-bold text-white">{currentScore.totalProofs}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Blockchain-verified incidents
                  </p>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Confidence</p>
                  <p className="text-3xl font-bold text-white">
                    {currentScore.totalProofs > 0 ? '95' : '50'}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {currentScore.totalProofs} records
                  </p>
                </div>
              </div>
            </div>

            {/* Proof History */}
            <div className="bg-[#161b22] rounded-lg shadow-md p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Proof History</h3>
              {currentScore.proofRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-5xl mb-3">✓</div>
                  <p className="font-medium">No malicious activity detected</p>
                  <p className="text-sm mt-1">
                    This sender has a clean record with no reported incidents
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentScore.proofRecords.map((proof, index) => (
                    <div
                      key={index}
                      className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-red-900/40 text-red-300 rounded text-xs font-medium">
                              {proof.eventType}
                            </span>
                            <span className="text-sm text-gray-400">
                              {new Date(proof.timestamp).toLocaleDateString()}
                            </span>
                            {proof.verified && (
                              <span className="text-green-400 text-xs">✓ Verified</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 font-mono truncate">
                            Proof: {proof.proofHash}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Threat Score</p>
                          <p className="text-lg font-bold text-red-400">{proof.score}</p>
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
                  ? 'bg-green-900/30 border-green-700'
                  : currentScore.trustLevel === TrustLevel.Dangerous
                  ? 'bg-red-900/30 border-red-700'
                  : 'bg-yellow-900/30 border-yellow-700'
              }`}
            >
              <h3 className="font-bold text-white mb-2">Recommendation</h3>
              <p className="text-gray-300">
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
          <div className="bg-[#161b22] rounded-lg shadow-md p-12 text-center border border-gray-700">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">Check Sender Reputation</h3>
            <p className="text-gray-400 mb-6">
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
