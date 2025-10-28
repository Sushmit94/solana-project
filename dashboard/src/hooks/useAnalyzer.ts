// dashboard/src/hooks/useAnalyzer.ts
import { useState, useCallback } from 'react';
import {
  MaliciousMailDetector,
  ThreatAnalysis,
  createDetector,
} from  '@analyzer/detector';
import { EmailMessage } from '@mailchain-service/mailchain-client';
import {
  ProofGenerator,
  ZKProof,
  createProofGenerator,
} from '@analyzer/proof-generator';

interface UseAnalyzerResult {
  detector: MaliciousMailDetector;
  proofGenerator: ProofGenerator;
  analyzeEmail: (email: EmailMessage) => Promise<ThreatAnalysis>;
  generateProof: (
    email: EmailMessage,
    analysis: ThreatAnalysis
  ) => Promise<ZKProof | null>;
  analyzing: boolean;
}

export const useAnalyzer = (): UseAnalyzerResult => {
  const [detector] = useState(() => createDetector());
  const [proofGenerator] = useState(() => createProofGenerator());
  const [analyzing, setAnalyzing] = useState(false);

  // Analyze email for threats
  const analyzeEmail = useCallback(
    async (email: EmailMessage): Promise<ThreatAnalysis> => {
      setAnalyzing(true);
      try {
        // Run detector
        const analysis = detector.analyze(email);
        
        console.log(`📧 Analyzed email from ${email.from}:`, {
          isMalicious: analysis.isMalicious,
          threatLevel: analysis.threatLevel,
          confidence: (analysis.confidence * 100).toFixed(1) + '%',
        });

        return analysis;
      } catch (error) {
        console.error('Error analyzing email:', error);
        throw error;
      } finally {
        setAnalyzing(false);
      }
    },
    [detector]
  );

  // Generate ZK proof for malicious email
  const generateProof = useCallback(
    async (
      email: EmailMessage,
      analysis: ThreatAnalysis
    ): Promise<ZKProof | null> => {
      if (!analysis.isMalicious) {
        console.log('Email is safe, no proof needed');
        return null;
      }

      try {
        const emailContent = `${email.subject}\n${email.body}`;
        const proof = await proofGenerator.generateProof(emailContent, analysis);
        
        console.log('✅ Generated ZK proof:', {
          eventType: proof.publicInputs.eventType,
          threatScore: proof.publicInputs.threatScore,
          proofSize: proof.proof.length,
        });

        return proof;
      } catch (error) {
        console.error('Error generating proof:', error);
        return null;
      }
    },
    [proofGenerator]
  );

  return {
    detector,
    proofGenerator,
    analyzeEmail,
    generateProof,
    analyzing,
  };
};