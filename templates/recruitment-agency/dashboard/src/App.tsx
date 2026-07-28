import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Agents } from './pages/Agents'
import { AgentDetail } from './pages/AgentDetail'
import { Companies } from './pages/Companies'
import { Contacts } from './pages/Contacts'
import { Campaigns } from './pages/Campaigns'
import { Pipeline } from './pages/Pipeline'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}