"""Email settings page component."""

import { Routes, Route } from 'react-router-dom';
import EmailSettings from '../components/EmailSettings';
import EmailHistory from '../components/EmailHistory';

export default function EmailSettingsPage() {
  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="settings" replace />} />
          <Route path="settings" element={<EmailSettings />} />
          <Route path="history" element={<EmailHistory />} />
        </Routes>
      </div>
    </div>
  );
}