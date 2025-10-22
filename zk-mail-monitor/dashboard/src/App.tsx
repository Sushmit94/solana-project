import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, Mail, Clock, User, TrendingUp } from 'lucide-react';
import './index.css';
// Type definitions matching the Solana program
enum EventType {
  Phishing = 0,
  Spam = 1,
  Malware = 2,
  SocialEngineering = 3,
}

interface FlaggedEvent {
  eventId: number;
  timestamp: number;
  eventType: EventType;
  submitter: string;
  verified: boolean;
  txSignature?: string;
}

// Mock data for demonstration
const generateMockEvents = (): FlaggedEvent[] => {
  return [
    {
      eventId: 1,
      timestamp: Date.now() - 3600000,
      eventType: EventType.Phishing,
      submitter: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      verified: true,
      txSignature: '5j7s6NiJS3JAkvgkoc18WVAsiSaci2pxB2A6ueCJP4tprXvUNvv',
    },
    {
      eventId: 2,
      timestamp: Date.now() - 7200000,
      eventType: EventType.Spam,
      submitter: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      verified: true,
      txSignature: '3hVqkx8MhqSZ5xq9PQ8bY7VDxC2kU3rPGS2vW9n5R7g9vT8nYh',
    },
    {
      eventId: 3,
      timestamp: Date.now() - 10800000,
      eventType: EventType.Malware,
      submitter: 'FwR3PbjS5iyqzLiLugrBqKSa9tVMEZzNdj7t9Dqw9Vh4',
      verified: true,
      txSignature: '2kFgH7wQ9vN3xS8bL5mY6pR4tU9nW7jK3hT8vX2cZ5nM7fJ6s',
    },
    {
      eventId: 4,
      timestamp: Date.now() - 14400000,
      eventType: EventType.SocialEngineering,
      submitter: '8pQ4AJz3TgWb7vY9cH5nK2mX6rU8dL4wT7jV3sN5qP9R',
      verified: true,
      txSignature: '4nH8kL2pV7xW9sY3mQ6tR5jN8vU2cK7wF4hT9xZ5nP8bJ6m',
    },
    {
      eventId: 5,
      timestamp: Date.now() - 18000000,
      eventType: EventType.Phishing,
      submitter: '3vY7kN5mP2xT8wL9cH4jU6rQ8sV3nZ7hK2fW5tR9pJ6M',
      verified: true,
      txSignature: '7pK3mV9xL2wT5nY8cR4jH6sU9vQ2fN7kW3hZ8tP5mJ6L',
    },
  ];
};

const ZKMailMonitorDashboard: React.FC = () => {
  const [events, setEvents] = useState<FlaggedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<EventType | 'all'>('all');

  // Simulate fetching data from Solana
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      
      // In production, replace this with actual Solana program account fetching:
      // const connection = new Connection('https://api.devnet.solana.com');
      // const programId = new PublicKey('YourProgramIdHere');
      // const accounts = await connection.getProgramAccounts(programId);
      // Parse and deserialize the account data using Borsh
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  // Filter events based on selected type
  const filteredEvents = selectedFilter === 'all' 
    ? events 
    : events.filter(e => e.eventType === selectedFilter);

  // Calculate statistics
  const stats = {
    total: events.length,
    phishing: events.filter(e => e.eventType === EventType.Phishing).length,
    spam: events.filter(e => e.eventType === EventType.Spam).length,
    malware: events.filter(e => e.eventType === EventType.Malware).length,
    socialEngineering: events.filter(e => e.eventType === EventType.SocialEngineering).length,
  };

  // Get event type label and color
  const getEventTypeInfo = (type: EventType) => {
    switch (type) {
      case EventType.Phishing:
        return { label: 'Phishing', color: 'bg-red-100 text-red-800', icon: '🎣' };
      case EventType.Spam:
        return { label: 'Spam', color: 'bg-yellow-100 text-yellow-800', icon: '📧' };
      case EventType.Malware:
        return { label: 'Malware', color: 'bg-purple-100 text-purple-800', icon: '🦠' };
      case EventType.SocialEngineering:
        return { label: 'Social Engineering', color: 'bg-orange-100 text-orange-800', icon: '🎭' };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">ZK Mail Monitor</h1>
          </div>
          <p className="text-slate-600">
            Zero-knowledge proof verified malicious mail detection on Solana
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Phishing</p>
                <p className="text-3xl font-bold text-slate-800">{stats.phishing}</p>
              </div>
              <span className="text-3xl">🎣</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Spam</p>
                <p className="text-3xl font-bold text-slate-800">{stats.spam}</p>
              </div>
              <Mail className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Malware</p>
                <p className="text-3xl font-bold text-slate-800">{stats.malware}</p>
              </div>
              <span className="text-3xl">🦠</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Social Eng.</p>
                <p className="text-3xl font-bold text-slate-800">{stats.socialEngineering}</p>
              </div>
              <span className="text-3xl">🎭</span>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-700 mr-2">Filter:</span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setSelectedFilter(EventType.Phishing)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === EventType.Phishing
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🎣 Phishing
            </button>
            <button
              onClick={() => setSelectedFilter(EventType.Spam)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === EventType.Spam
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📧 Spam
            </button>
            <button
              onClick={() => setSelectedFilter(EventType.Malware)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === EventType.Malware
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🦠 Malware
            </button>
            <button
              onClick={() => setSelectedFilter(EventType.SocialEngineering)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === EventType.SocialEngineering
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🎭 Social Eng.
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              Flagged Events ({filteredEvents.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading events from Solana...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No events found matching your filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Event ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Submitter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredEvents.map((event) => {
                    const typeInfo = getEventTypeInfo(event.eventType);
                    return (
                      <tr key={event.eventId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-slate-900">
                              #{event.eventId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${typeInfo.color}`}>
                            <span>{typeInfo.icon}</span>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {formatTimestamp(event.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-600">
                            <User className="w-4 h-4 mr-2" />
                            <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                              {truncateAddress(event.submitter)}
                            </code>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.verified ? (
                            <span className="px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <Shield className="w-3 h-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.txSignature && (
                            <a
                              href={`https://explorer.solana.com/tx/${event.txSignature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs font-mono hover:underline"
                            >
                              {truncateAddress(event.txSignature)}
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">About Zero-Knowledge Proofs</p>
              <p>
                All events shown here have been verified using zero-knowledge proofs, ensuring that 
                malicious content was detected without revealing the actual message contents on-chain. 
                This preserves user privacy while maintaining a transparent audit trail of security events.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZKMailMonitorDashboard;