// mailchain-service/src/types.ts
// Shared type definitions for Mailchain-related data structures

/**
 * Represents configuration details for initializing Mailchain client.
 */
export interface MailchainConfig {
  /** The user's 12- or 24-word secret recovery phrase */
  secretRecoveryPhrase?: string;

  /** Optional private key (alternative authentication) */
  privateKey?: string;
}

/**
 * Represents an attachment included in a Mailchain message.
 */
export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
}

/**
 * Represents a full Mailchain email message.
 */
export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: number;
  headers: Record<string, string>;
  attachments?: EmailAttachment[];
}

/**
 * Represents a parsed email, containing extracted metadata
 * and useful analysis-ready information.
 */
export interface ParsedEmail {
  message: EmailMessage;
  plainText: string;
  htmlText: string;
  urls: string[];
  domains: string[];
  emailAddresses: string[];
  suspiciousPatterns: string[];
}

/**
 * Represents summary-level metadata for quick display.
 */
export interface EmailMetadata {
  id: string;
  from: string;
  to: string;
  subject: string;
  timestamp: number;
  hasAttachments: boolean;
  attachmentCount: number;
}

/**
 * Represents standardized structure for detected anomalies or patterns.
 */
export type SuspiciousPattern =
  | 'url_shortener'
  | 'urgency_language'
  | 'credential_request'
  | 'suspicious_attachment'
  | 'domain_mismatch';

/**
 * Represents possible categories for an email threat level.
 */
export type ThreatLevel = 'low' | 'medium' | 'high';

/**
 * Result structure for analyzer outputs.
 */
export interface ThreatAnalysisResult {
  emailId: string;
  threatLevel: ThreatLevel;
  score: number; // 0–100
  detectedPatterns: SuspiciousPattern[];
  analyzedAt: number;
}

