import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/Students';
import ImportPage from './pages/Import';
import CampaignsPage from './pages/Campaigns';
import WorkflowsPage from './pages/Workflows';
import InboxPage from './pages/Inbox';
import PaymentsPage from './pages/Payments';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Route>
    </Routes>
  );
}
