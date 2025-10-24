// dashboard/src/pages/InboxPage.tsx
import React, { useEffect, useState } from 'react';
import { EmailList } from '../components/EmailList';
import { ThreatBadge } from '../components/ThreatBadge';
import { useMailchain } from '../hooks/useMailchain';
import { useAnalyzer } from '../hooks/useAnalyzer';
import { EmailMessage } from '../../../mailchain-service/src/mailchain-client';
import { ThreatAnalysis } from '../../../analyzer/src/detector';

interface EmailWithAnalysis {
  email: EmailMessage;
  analysis: ThreatAnalysis | null;
  loading: boolean;
}

export const InboxPage: React.FC = () => {
  const { emails, loading: emailsLoading, refresh } = useMailchain();
  const { analyzeEmail } = useAnalyzer();
  const [emailsWithAnalysis, setEmailsWithAnalysis] = useState<EmailWithAnalysis[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailWithAnalysis | null>(null);
  const [filter, setFilter] = useState<'all' | 'safe' | 'threats'>('all');

  // Analyze emails when loaded
  useEffect(() => {
    if (emails.length > 0) {
      const analyzed = emails.map(email => ({
        email,
        analysis: null,
        loading: true,
      }));
      setEmailsWithAnalysis(analyzed);

      // Analyze each email
      emails.forEach(async (email, index) => {
        const analysis = await analyzeEmail(email);
        setEmailsWithAnalysis(prev => {
          const updated = [...prev];
          updated[index] = { email, analysis, loading: false };
          return updated;
        });
      });
    }
  }, [emails]);

  // Filter emails
  const filteredEmails = emailsWithAnalysis.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'safe') return item.analysis && !item.analysis.isMalicious;
    if (filter === 'threats') return item.analysis && item.analysis.isMalicious;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Inbox</h1>
          <p className="text-gray-600">
            Zero-knowledge email monitoring with privacy protection
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({emailsWithAnalysis.length})
              </button>
              <button
                onClick={() => setFilter('safe')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'safe'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Safe (
                {emailsWithAnalysis.filter(e => e.analysis && !e.analysis.isMalicious).length})
              </button>
              <button
                onClick={() => setFilter('threats')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'threats'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Threats (
                {emailsWithAnalysis.filter(e => e.analysis && e.analysis.isMalicious).length})
              </button>
            </div>
            <button
              onClick={refresh}
              disabled={emailsLoading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
            >
              {emailsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Email List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List View */}
          <div className="lg:col-span-1">
            {emailsLoading && emailsWithAnalysis.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading emails...</p>
              </div>
            ) : (
             <EmailList
  emails={filteredEmails}
  onSelect={(email) => setSelectedEmail(email)}
  selectedId={selectedEmail?.email.id}
/>

            )}
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            {selectedEmail ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Email Header */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedEmail.email.subject}
                    </h2>
                    {selectedEmail.analysis && (
                      <ThreatBadge analysis={selectedEmail.analysis} />
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">From:</span>{' '}
                      <span className="text-gray-600">{selectedEmail.email.from}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">To:</span>{' '}
                      <span className="text-gray-600">{selectedEmail.email.to}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>{' '}
                      <span className="text-gray-600">
                        {new Date(selectedEmail.email.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Threat Analysis */}
                {selectedEmail.analysis && selectedEmail.analysis.isMalicious && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-red-900 mb-2">⚠️ Threat Detected</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Confidence:</span>{' '}
                        {(selectedEmail.analysis.confidence * 100).toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-medium">Detected Keywords:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedEmail.analysis.detectedKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedEmail.analysis.reasons.length > 0 && (
                        <div>
                          <span className="font-medium">Reasons:</span>
                          <ul className="mt-1 list-disc list-inside text-red-800">
                            {selectedEmail.analysis.reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Email Body */}
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {selectedEmail.email.body}
                  </div>
                </div>

                {/* Attachments */}
                {selectedEmail.email.attachments && selectedEmail.email.attachments.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedEmail.email.attachments.map((att, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                        >
                          <span className="text-gray-700">{att.filename}</span>
                          <span className="text-xs text-gray-500">
                            ({(att.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">Select an email to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};