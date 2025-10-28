// dashboard/src/components/ThreatBadge.tsx
import React from 'react';
import { ThreatLevel, EventType } from '@analyzer/detector';

interface ThreatBadgeProps {
  analysis: {
    threatLevel: ThreatLevel;
    eventType: EventType;
    confidence: number;
    isMalicious: boolean;
  };
  size?: 'sm' | 'md' | 'lg';
}

export const ThreatBadge: React.FC<ThreatBadgeProps> = ({
  analysis,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const getLevelStyles = () => {
    switch (analysis.threatLevel) {
      case ThreatLevel.Critical:
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          icon: '🚨',
          label: 'CRITICAL',
        };
      case ThreatLevel.High:
        return {
          bg: 'bg-orange-500',
          text: 'text-white',
          icon: '⚠️',
          label: 'HIGH RISK',
        };
      case ThreatLevel.Medium:
        return {
          bg: 'bg-yellow-500',
          text: 'text-white',
          icon: '⚡',
          label: 'MEDIUM',
        };
      case ThreatLevel.Low:
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          icon: 'ℹ️',
          label: 'LOW RISK',
        };
      case ThreatLevel.Safe:
      default:
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          icon: '✓',
          label: 'SAFE',
        };
    }
  };

  const getEventTypeLabel = () => {
    switch (analysis.eventType) {
      case EventType.Phishing:
        return 'Phishing';
      case EventType.Spam:
        return 'Spam';
      case EventType.Malware:
        return 'Malware';
      case EventType.SocialEngineering:
        return 'Social Engineering';
      default:
        return 'Unknown';
    }
  };

  const styles = getLevelStyles();

  if (!analysis.isMalicious) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full font-bold ${styles.bg} ${styles.text} ${sizeClasses[size]}`}
      >
        <span>{styles.icon}</span>
        <span>{styles.label}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <div
        className={`inline-flex items-center gap-2 rounded-full font-bold ${styles.bg} ${styles.text} ${sizeClasses[size]}`}
      >
        <span>{styles.icon}</span>
        <span>{styles.label}</span>
        <span className="opacity-75">
          ({(analysis.confidence * 100).toFixed(0)}%)
        </span>
      </div>
      <div className="text-xs text-gray-600 text-center">
        {getEventTypeLabel()}
      </div>
    </div>
  );
};