// dashboard/src/components/EmailList.tsx
import React from 'react';
import { ThreatLevel } from '@analyzer/detector';
import { EmailMessage } from '@mailchain-service/mailchain-client';
import { ThreatAnalysis } from '@analyzer/detector';

interface EmailWithAnalysis {
  email: EmailMessage;
  analysis: ThreatAnalysis | null;
  loading: boolean;
}

interface EmailListProps {
  emails: EmailWithAnalysis[];
  onSelect: (email: EmailWithAnalysis) => void;
  selectedId?: string;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  onSelect,
  selectedId,
}) => {
  const getThreatColor = (level?: ThreatLevel) => {
    switch (level) {
      case ThreatLevel.Critical:
        return 'border-l-4 border-red-600 bg-red-50';
      case ThreatLevel.High:
        return 'border-l-4 border-orange-500 bg-orange-50';
      case ThreatLevel.Medium:
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case ThreatLevel.Low:
        return 'border-l-4 border-blue-400 bg-blue-50';
      default:
        return 'border-l-4 border-green-500 bg-white';
    }
  };

 // Accepts string or number
const formatDate = (dateValue: string | number) => {
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'Invalid date';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};


  return (
    <div className="space-y-2">
      {emails.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No emails found</p>
        </div>
      ) : (
        emails.map((item) => (
          <div
            key={item.email.id}
            onClick={() => onSelect(item)}
            className={`
              p-4 rounded-lg cursor-pointer transition-all
              ${getThreatColor(item.analysis?.threatLevel)}
              ${
                selectedId === item.email.id
                  ? 'ring-2 ring-blue-500 shadow-md'
                  : 'hover:shadow-md'
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 truncate">
                    {item.email.from}
                  </p>
                  {item.loading && (
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  )}
                  {!item.loading && item.analysis?.isMalicious && (
                    <span className="text-red-600 text-xs font-bold">⚠️</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700 truncate mb-1">
                  {item.email.subject}
                </p>
                <p className="text-xs text-gray-500">
                  {/* Changed from .timestamp to .date */}
                  {formatDate(item.email.date)}
                </p>
              </div>
            </div>

            {/* Threat indicator */}
            {!item.loading && item.analysis && (
              <div className="flex items-center gap-2 mt-2">
                {item.analysis.isMalicious ? (
                  <>
                    <span className="text-xs font-medium text-red-700">
                      Threat: {ThreatLevel[item.analysis.threatLevel]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(item.analysis.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-medium text-green-700">
                    ✓ Safe
                  </span>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};