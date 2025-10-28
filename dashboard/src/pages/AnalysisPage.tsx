// dashboard/src/pages/AnalysisPage.tsx - FIXED WITH ERROR HANDLING
import React, { useState, useEffect } from 'react';
import { useMailchain } from '../hooks/useMailchain';
import { useAnalyzer } from '../hooks/useAnalyzer';
import { useSolana } from '../hooks/useSolana';
import { ThreatLevel, EventType } from '@analyzer/detector';

interface SubmissionError {
  email: string;
  error: string;
}

export const AnalysisPage: React.FC = () => {
  const { emails } = useMailchain();
  const { analyzeEmail, generateProof } = useAnalyzer();
  const { submitProof, connected, publicKey, connect } = useSolana();
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState<SubmissionError[]>([]);
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

  useEffect(() => {
    console.log('💰 Wallet State:', { connected, publicKey });
  }, [connected, publicKey]);

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

  const handleSubmitAllProofs = async () => {
    console.log('🔘 Submit button clicked');
    console.log('📊 Current state:', { connected, publicKey, threatsCount: statistics.threats });

    if (!connected || !publicKey) {
      console.warn('⚠️ Wallet not connected');
      alert('Please connect your wallet first');
      await connect();
      return;
    }

    if (statistics.threats === 0) {
      alert('No threats detected to submit');
      return;
    }

    setSubmitting(true);
    setSubmissionErrors([]);
    let submitted = 0;
    const errors: SubmissionError[] = [];

    console.log(`🚀 Starting to submit ${statistics.threats} proofs...`);

    for (const email of emails) {
      try {
        const analysis = await analyzeEmail(email);
        
        if (analysis.isMalicious) {
          console.log(`📧 Processing malicious email from: ${email.from}`);
          
          // Generate proof
          const proof = await generateProof(email, analysis);
          if (!proof) {
            const error = 'Failed to generate proof';
            console.error('❌', error);
            errors.push({ email: email.from, error });
            continue;
          }
          
          console.log('🔐 Proof generated successfully');
          console.log('📦 Proof details:', {
            proofLength: proof.proof.length,
            eventType: proof.publicInputs.eventType,
            timestamp: proof.publicInputs.timestamp,
          });
          
          // Submit to blockchain
          try {
            const signature = await submitProof(proof);
            
            if (signature) {
              submitted++;
              console.log(`✅ Proof submitted! Signature: ${signature}`);
              console.log(`🔗 View on explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
            } else {
              const error = 'No signature returned';
              console.error('❌', error);
              errors.push({ email: email.from, error });
            }
          } catch (submitError: any) {
            const error = submitError.message || 'Blockchain submission failed';
            console.error('❌ Submission error:', error);
            errors.push({ email: email.from, error });
          }
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Unknown error';
        console.error('❌ Error processing email:', errorMsg);
        errors.push({ email: email.from, error: errorMsg });
      }
    }

    setSubmitting(false);
    setSubmissionErrors(errors);
    
    // Show detailed results
    if (errors.length === 0) {
      alert(`✅ Successfully submitted all ${submitted} proofs to blockchain!`);
    } else {
      console.log('⚠️ Submission errors:', errors);
    }
    
    console.log('📊 Submission complete:', { submitted, failed: errors.length });
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Threat Analysis Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time email threat detection and blockchain proof submission
              </p>
            </div>
            
            {connected && publicKey && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium text-sm">
                    {truncateAddress(publicKey)}
                  </span>
                </div>
              </div>
            )}
          </div>
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

        {/* Error Display */}
        {submissionErrors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <span>⚠️</span>
              <span>Submission Errors ({submissionErrors.length})</span>
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {submissionErrors.map((err, idx) => (
                <div key={idx} className="bg-white rounded p-3 border border-red-200">
                  <div className="font-medium text-gray-900 text-sm mb-1">
                    📧 {err.email}
                  </div>
                  <div className="text-red-700 text-sm font-mono">
                    {err.error}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <button
                onClick={handleSubmitAllProofs}
                disabled={submitting || statistics.threats === 0 || !connected}
                className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Submitting Proofs...</span>
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    <span>Submit {statistics.threats} Proofs to Blockchain</span>
                  </>
                )}
              </button>
              
              {!connected && (
                <button
                  onClick={connect}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                >
                  Connect Wallet
                </button>
              )}
            </div>
            
            {!connected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Connect your Phantom wallet to submit proofs
                </p>
              </div>
            )}
            
            {connected && statistics.threats === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  ℹ️ No threats detected. All emails are safe!
                </p>
              </div>
            )}
            
            {connected && statistics.threats > 0 && !submitting && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  ✅ Ready to submit {statistics.threats} proof(s) to Solana devnet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4 border border-gray-300">
          <details>
            <summary className="font-bold text-gray-900 cursor-pointer">
              🔍 Debug Information (click to expand)
            </summary>
            <div className="mt-4 space-y-2 font-mono text-sm">
              <div><strong>Connected:</strong> {connected ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Public Key:</strong> {publicKey || 'Not connected'}</div>
              <div><strong>Threats:</strong> {statistics.threats}</div>
              <div><strong>Errors:</strong> {submissionErrors.length}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};