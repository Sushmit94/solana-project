// dashboard/src/hooks/useMailchain.ts
import { useState, useEffect, useCallback } from 'react';
import {
  MailchainClient,
  EmailMessage,
  createMailchainClient,
} from  '@mailchain-service/mailchain-client';

interface UseMailchainResult {
  client: MailchainClient | null;
  emails: EmailMessage[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  sendEmail: (to: string, subject: string, body: string) => Promise<boolean>;
  initialized: boolean;
}

export const useMailchain = (): UseMailchainResult => {
  const [client, setClient] = useState<MailchainClient | null>(null);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize Mailchain client
  useEffect(() => {
    const initializeClient = async () => {
      try {
        // Get secret recovery phrase from environment or local storage
        const secretPhrase =
          process.env.REACT_APP_MAILCHAIN_SECRET ||
          localStorage.getItem('mailchain_secret');

        if (!secretPhrase) {
          setError('Mailchain secret not found. Please configure your account.');
          return;
        }

        const newClient = createMailchainClient({
          secretRecoveryPhrase: secretPhrase,
        });

        await newClient.initialize();
        setClient(newClient);
        setInitialized(true);
        console.log('✅ Mailchain initialized');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Mailchain');
        console.error('Failed to initialize Mailchain:', err);
      }
    };

    initializeClient();
  }, []);

  // Fetch emails
  const fetchEmails = useCallback(async () => {
    if (!client) {
      console.log('Client not initialized yet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedEmails = await client.fetchInbox(50);
      setEmails(fetchedEmails);
      console.log(`✅ Fetched ${fetchedEmails.length} emails`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emails';
      setError(errorMessage);
      console.error('Failed to fetch emails:', err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Auto-fetch on mount
  useEffect(() => {
    if (initialized && client) {
      fetchEmails();
    }
  }, [initialized, client, fetchEmails]);

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchEmails();
  }, [fetchEmails]);

  // Send email function
  const sendEmail = useCallback(
    async (to: string, subject: string, body: string): Promise<boolean> => {
      if (!client) {
        setError('Client not initialized');
        return false;
      }

      try {
        const success = await client.sendEmail(to, subject, body);
        if (success) {
          console.log('✅ Email sent successfully');
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send email');
        return false;
      }
    },
    [client]
  );

  return {
    client,
    emails,
    loading,
    error,
    refresh,
    sendEmail,
    initialized,
  };
};