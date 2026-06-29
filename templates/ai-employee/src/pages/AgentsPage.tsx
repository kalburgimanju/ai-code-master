import React from 'react';
import { useAgentLoop } from '../hooks/useAgentLoop';
import AgentList from '../components/dashboard/AgentList';

const AgentsPage: React.FC = () => {
  useAgentLoop();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agents</h1>
        <p className="text-dark-400 text-sm mt-1">Manage all your AI employees in one place.</p>
      </div>
      <AgentList />
    </div>
  );
};

export default AgentsPage;
