"""Email history component for viewing sent emails."""

import { useState, useEffect } from 'react';
import { Mail, Download, Eye, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailHistoryEntry {
  id: string;
  email_address: string;
  timestamp: string;
  recipient_count: number;
  job_count: number;
  filename: string;
  status: 'sent' | 'failed';
}

export default function EmailHistory() {
  const [history, setHistory] = useState<EmailHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/email-history');
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        } else {
          setError('Failed to load email history');
        }
      } catch (error) {
        setError('Failed to load email history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Email History</h3>
        <div className="text-sm text-gray-500">
          {history.length} {history.length === 1 ? 'email' : 'emails'} sent
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 border border-red-200 rounded-lg p-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {history.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Mail size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No emails sent yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((email) => (
            <div
              key={email.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(email.status)}`},
                    <div className="p-1 rounded-lg bg-white">
                      {getStatusIcon(email.status)}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Sent to: {email.email_address}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Clock size={14} className="inline mr-1" />
                      {formatTimestamp(email.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {email.job_count} {email.job_count === 1 ? 'job' : 'jobs'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {email.recipient_count} recipient{email.recipient_count !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View email"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download file"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}