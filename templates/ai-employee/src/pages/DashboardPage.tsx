import React from 'react';
import { useAgentContext } from '../context/AgentContext';
import { useAgentLoop } from '../hooks/useAgentLoop';
import StatsCards from '../components/dashboard/StatsCards';
import UsageMetrics from '../components/dashboard/UsageMetrics';
import AgentList from '../components/dashboard/AgentList';
import ActivityFeed from '../components/dashboard/ActivityFeed';

const DashboardPage: React.FC = () => {
  useAgentLoop();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 text-sm mt-1">Monitor your AI employees in real-time.</p>
      </div>
      <StatsCards />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UsageMetrics />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
      <AgentList />
    </div>
  );
};

export default DashboardPage;
