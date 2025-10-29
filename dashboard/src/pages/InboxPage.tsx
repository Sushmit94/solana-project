// dashboard/src/pages/InboxPage.tsx
import React, { useEffect, useState } from 'react';
import { EmailList } from '../components/EmailList';
import { ThreatBadge } from '../components/ThreatBadge';
import { useAnalyzer } from '../hooks/useAnalyzer';
import { createMailchainClient, EmailMessage } from '@mailchain-service/mailchain-client';
import { ThreatAnalysis } from '@analyzer/detector';

interface EmailWithAnalysis {
  email: EmailMessage;
  analysis: ThreatAnalysis | null;
  loading: boolean;
}

export const InboxPage: React.FC = () => {
  const { analyzeEmail } = useAnalyzer();
  const [emailsWithAnalysis, setEmailsWithAnalysis] = useState<EmailWithAnalysis[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailWithAnalysis | null>(null);
  const [filter, setFilter] = useState<'all' | 'safe' | 'threats'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mailchainAddress, setMailchainAddress] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);

    try {
      const secret = process.env.REACT_APP_MAILCHAIN_SECRET;
      if (!secret) throw new Error('REACT_APP_MAILCHAIN_SECRET not configured.');

      console.log('🔐 Initializing Mailchain client...');
      const client = createMailchainClient({ secretRecoveryPhrase: secret });
      const address = await client.initialize();
      setMailchainAddress(address);

      console.log('📬 Fetching inbox...');
      const inbox = await client.fetchInbox(10);
      console.log('✅ Fetched', inbox.length, 'emails');

      const analyzed: EmailWithAnalysis[] = inbox.map((email) => ({
        email,
        analysis: null,
        loading: true,
      }));
      setEmailsWithAnalysis(analyzed);

      inbox.forEach(async (email, index) => {
        try {
          const analysis = await analyzeEmail(email);
          setEmailsWithAnalysis((prev) => {
            const updated = [...prev];
            if (updated[index]) updated[index] = { email, analysis, loading: false };
            return updated;
          });
        } catch (err) {
          console.error('Failed to analyze email:', email.id, err);
          setEmailsWithAnalysis((prev) => {
            const updated = [...prev];
            if (updated[index]) updated[index] = { email, analysis: null, loading: false };
            return updated;
          });
        }
      });
    } catch (err: any) {
      console.error('❌ Error fetching emails:', err);
      setError(err.message || 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const filteredEmails = emailsWithAnalysis.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'safe') return item.analysis && !item.analysis.isMalicious;
    if (filter === 'threats') return item.analysis && item.analysis.isMalicious;
    return true;
  });

  const safeCount = emailsWithAnalysis.filter((e) => e.analysis && !e.analysis.isMalicious).length;
  const threatCount = emailsWithAnalysis.filter((e) => e.analysis && e.analysis.isMalicious).length;

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Secure Inbox</h1>
          <p className="text-gray-400">
            Zero-knowledge email monitoring with privacy protection
          </p>
          {mailchainAddress && (
            <p className="text-sm text-gray-500 mt-1">Connected: {mailchainAddress}</p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-300 mb-1">Connection Error</h3>
                <p className="text-sm text-red-200">{error}</p>
                <button
                  onClick={fetchEmails}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#161b22] rounded-lg shadow-md p-4 mb-6 border border-gray-800">
         <div className="flex items-center justify-between">
  <div className="flex gap-2">
    <button
      onClick={() => setFilter('all')}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        filter === 'all'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      All ({emailsWithAnalysis.length})
    </button>
    <button
      onClick={() => setFilter('safe')}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        filter === 'safe'
          ? 'bg-green-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      Safe ({safeCount})
    </button>
    <button
      onClick={() => setFilter('threats')}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        filter === 'threats'
          ? 'bg-red-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      Threats ({threatCount})
    </button>
  </div>

  {/* --- Added Navigation Buttons + Refresh --- */}
  <div className="flex gap-3">
    <button
      onClick={() => (window.location.href = '/reputation')}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
    >
      Reputation Page
    </button>
    <button
      onClick={() => (window.location.href = '/analysis')}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
    >
      Analysis Page
    </button>
    <button
      onClick={fetchEmails}
      disabled={loading}
      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          Refreshing...
        </span>
      ) : (
        'Refresh'
      )}
    </button>
  </div>
</div>

        </div>

        {/* Email List and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List View */}
          <div className="lg:col-span-1">
            {loading && emailsWithAnalysis.length === 0 ? (
              <div className="bg-[#161b22] rounded-lg shadow-md p-8 text-center border border-gray-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400 font-medium">Loading emails...</p>
                <p className="text-sm text-gray-500 mt-2">Connecting to Mailchain</p>
              </div>
            ) : (
              <EmailList
                emails={filteredEmails}
                onSelect={setSelectedEmail}
                selectedId={selectedEmail?.email.id}
              />
            )}
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            {selectedEmail ? (
              <div className="bg-[#161b22] rounded-lg shadow-md p-6 border border-gray-800">
                <div className="border-b border-gray-700 pb-4 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-2xl font-bold text-white flex-1">
                      {selectedEmail.email.subject}
                    </h2>
                    {selectedEmail.analysis && <ThreatBadge analysis={selectedEmail.analysis} />}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-300">From:</span>{' '}
                      <span className="text-gray-400">{selectedEmail.email.from}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-300">To:</span>{' '}
                      <span className="text-gray-400">
                        {Array.isArray(selectedEmail.email.to)
                          ? selectedEmail.email.to.join(', ')
                          : selectedEmail.email.to}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-300">Date:</span>{' '}
                      <span className="text-gray-400">
                        {new Date(selectedEmail.email.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedEmail.loading && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                      <span className="text-blue-300">Analyzing email for threats...</span>
                    </div>
                  </div>
                )}

                {!selectedEmail.loading && selectedEmail.analysis?.isMalicious && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2">
                      <span className="text-xl">⚠️</span> Threat Detected
                    </h3>
                    <div className="space-y-2 text-sm text-red-200">
                      <div>
                        <span className="font-medium">Confidence:</span>{' '}
                        {(selectedEmail.analysis.confidence * 100).toFixed(1)}%
                      </div>
                      {selectedEmail.analysis.detectedKeywords.length > 0 && (
                        <div>
                          <span className="font-medium">Detected Keywords:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {selectedEmail.analysis.detectedKeywords.map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-red-800 text-red-100 rounded text-xs font-medium"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!selectedEmail.loading && selectedEmail.analysis && !selectedEmail.analysis.isMalicious && (
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-xl">✓</span>
                      <span className="text-green-200 font-medium">
                        No threats detected in this email
                      </span>
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-wrap text-gray-300 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  {selectedEmail.email.body || '(Empty message)'}
                </div>
              </div>
            ) : (
              <div className="bg-[#161b22] rounded-lg shadow-md p-12 text-center border border-gray-800">
                <div className="text-6xl mb-4">📧</div>
                <p className="text-gray-500 text-lg">Select an email to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
