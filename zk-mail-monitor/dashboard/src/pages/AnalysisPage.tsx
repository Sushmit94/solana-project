// dashboard/src/pages/AnalysisPage.tsx
import React, { useState, useEffect } from 'react';
import { useMailchain } from '../hooks/useMailchain';
import { useAnalyzer } from '../hooks/useAnalyzer';
import { useSolana } from '../hooks/useSolana';
import { ThreatBadge } from '../components/ThreatBadge';
import { ThreatLevel, EventType } from '../../../analyzer/src/detector';

export const AnalysisPage: React.FC = () => {
  const { emails } = useMailchain();
  const { analyzeEmail, generateProof } = useAnalyzer();
  const { submitProof, connected } = useSolana();
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    safe: 0,
    threats: 0,
    byLevel: {
      [ThreatLevel.Critical]: 0,
      [ThreatLevel.High]: 0,
      [ThreatLevel.Medium]: 0,
      [ThreatLevel.Low]: 0,
      [ThreatLevel.Safe]: 0,
    },
    byType: {
      [EventType.Phishing]: 0,
      [EventType.Spam]: 0,
      [EventType.Malware]: 0,
      [EventType.SocialEngineering]: 0,
    },
  });

  // Analyze all emails and calculate statistics
  useEffect(() => {
    const analyzeAll = async () => {
      if (emails.length === 0) return;

      setAnalyzing(true);
      const stats = {
        total: emails.length,
        safe: 0,
        threats: 0,
        byLevel: {
          [ThreatLevel.Critical]: 0,
          [ThreatLevel.High]: 0,
          [ThreatLevel.Medium]: 0,
          [ThreatLevel.Low]: 0,
          [ThreatLevel.Safe]: 0,
        },
        byType: {
          [EventType.Phishing]: 0,
          [EventType.Spam]: 0,
          [EventType.Malware]: 0,
          [EventType.SocialEngineering]: 0,
        },
      };

      for (const email of emails) {
        const analysis = await analyzeEmail(email);
        
        if (analysis.isMalicious) {
          stats.threats++;
          stats.byLevel[analysis.threatLevel]++;
          stats.byType[analysis.eventType]++;
        } else {
          stats.safe++;
          stats.byLevel[ThreatLevel.Safe]++;
        }
      }

      setStatistics(stats);
      setAnalyzing(false);
    };

    analyzeAll();
  }, [emails, analyzeEmail]);

  // Submit all malicious proofs to blockchain
  const handleSubmitAllProofs = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    setSubmitting(true);
    let submitted = 0;

    for (const email of emails) {
      const analysis = await analyzeEmail(email);
      
      if (analysis.isMalicious) {
        const proof = await generateProof(email, analysis);
        if (proof) {
          const signature = await submitProof(proof);
          if (signature) {
            submitted++;
          }
        }
      }
    }

    setSubmitting(false);
    alert(`Successfully submitted ${submitted} proofs to blockchain`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Threat Analysis Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time email threat detection and analysis
          </p>
        </div>

        {analyzing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-blue-900 font-medium">
                Analyzing {emails.length} emails...
              </span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl mb-2">📧</div>
            <div className="text-3xl font-bold text-gray-900">{statistics.total}</div>
            <div className="text-sm text-gray-600">Total Emails</div>
          </div>

          <div className="bg-green-50 rounded-lg shadow-sm p-6 border-2 border-green-500">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-700">{statistics.safe}</div>
            <div className="text-sm text-green-700 font-medium">Safe Emails</div>
          </div>

          <div className="bg-red-50 rounded-lg shadow-sm p-6 border-2 border-red-500">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-3xl font-bold text-red-700">{statistics.threats}</div>
            <div className="text-sm text-red-700 font-medium">Threats Detected</div>
          </div>

          <div className="bg-purple-50 rounded-lg shadow-sm p-6 border-2 border-purple-500">
            <div className="text-3xl mb-2">🔐</div>
            <div className="text-3xl font-bold text-purple-700">
              {statistics.threats}
            </div>
            <div className="text-sm text-purple-700 font-medium">Proofs Ready</div>
          </div>
        </div>

        {/* Threat Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* By Threat Level */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Threats by Level
            </h3>
            <div className="space-y-3">
              {[
                { level: ThreatLevel.Critical, label: 'Critical', color: 'red' },
                { level: ThreatLevel.High, label: 'High', color: 'orange' },
                { level: ThreatLevel.Medium, label: 'Medium', color: 'yellow' },
                { level: ThreatLevel.Low, label: 'Low', color: 'blue' },
              ].map(({ level, label, color }) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-gray-700">{label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${color}-500 h-2 rounded-full`}
                        style={{
                          width: `${
                            statistics.threats > 0
                              ? (statistics.byLevel[level] / statistics.threats) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-900 w-8 text-right">
                      {statistics.byLevel[level]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Threat Type */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Threats by Type
            </h3>
            <div className="space-y-3">
              {[
                { type: EventType.Phishing, label: 'Phishing', icon: '🎣' },
                { type: EventType.Spam, label: 'Spam', icon: '📧' },
                { type: EventType.Malware, label: 'Malware', icon: '🦠' },
                { type: EventType.SocialEngineering, label: 'Social Eng.', icon: '🎭' },
              ].map(({ type, label, icon }) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {icon} {label}
                  </span>
                  <span className="font-bold text-gray-900">
                    {statistics.byType[type]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={handleSubmitAllProofs}
              disabled={submitting || !connected || statistics.threats === 0}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Submitting Proofs...
                </span>
              ) : (
                `Submit ${statistics.threats} Proofs to Blockchain`
              )}
            </button>
            {!connected && (
              <span className="text-sm text-gray-600 self-center">
                Connect wallet to submit proofs
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};