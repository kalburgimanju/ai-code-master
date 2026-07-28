"""Email settings component for managing email notifications."""

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Mail, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailSettings {
  enabled: boolean;
  default_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  subject_template: string;
}

export default function EmailSettings() {
  const [settings, setSettings] = useState<EmailSettings>({
    enabled: false,
    default_email: 'manjunathkhubli85@gmail.com',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    subject_template: 'AI Job Scraper - {count} Opportunities Found',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load email settings from server
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/email-settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load email settings' });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Email settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save email settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save email settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
            <Mail size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Email Settings</h2>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Enable Email Notifications</h3>
              <p className="text-sm text-gray-600">Send emails when new jobs are found</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* Email Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">SMTP Configuration</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Server Host
              </label>
              <input
                type="text"
                value={settings.smtp_host}
                onChange={(e) => setSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_port: parseInt(e.target.value) || 587 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={settings.smtp_user}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtp_user: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="your-email@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={settings.smtp_pass}
                onChange={(e) => setSettings(prev => ({ ...prev, smtp_pass: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your SMTP password"
              />
            </div>
          </div>

          {/* Default Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Email Address
            </label>
            <input
              type="email"
              value={settings.default_email}
              onChange={(e) => setSettings(prev => ({ ...prev, default_email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Subject Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject Template
            </label>
            <input
              type="text"
              value={settings.subject_template}
              onChange={(e) => setSettings(prev => ({ ...prev, subject_template: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="AI Job Scraper - {count} Opportunities Found"
            />
            <p className="text-xs text-gray-500 mt-1">Use {'{count}'} for the number of jobs found</p>
          </div>

          {/* Test Email */}
          <div className="pt-4 border-t border-gray-200">
            <button
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
              disabled={saving || !settings.smtp_host || !settings.smtp_user || !settings.smtp_pass}
            >
              {saving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  Save Email Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}