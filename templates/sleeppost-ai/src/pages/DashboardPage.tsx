import React, { useState } from 'react';
import StatsCards from '../components/dashboard/StatsCards';
import ContentFeed from '../components/dashboard/ContentFeed';
import AgentStatus from '../components/dashboard/AgentStatus';
import RevenueChart from '../components/dashboard/RevenueChart';
import CreateAvatarModal from '../components/CreateAvatarModal';
import { useApp } from '../context/AppContext';

const DashboardPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { avatars } = useApp();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          {avatars.length === 0
            ? 'Create your first AI avatar to start generating content.'
            : 'Your AI agents are working 24/7 to grow your presence.'}
        </p>
      </div>

      <StatsCards />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContentFeed />
        </div>
        <div className="space-y-6">
          <AgentStatus />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <RevenueChart />
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowModal(true)}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-500/20 text-left hover:border-brand-500/40 transition-colors"
            >
              <p className="text-white font-medium text-sm">Create New Avatar</p>
              <p className="text-gray-400 text-xs mt-1">Generate a unique AI avatar for your brand</p>
            </button>
            <button className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:border-white/20 transition-colors">
              <p className="text-white font-medium text-sm">View Analytics</p>
              <p className="text-gray-400 text-xs mt-1">Track engagement and growth metrics</p>
            </button>
            <button className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:border-white/20 transition-colors">
              <p className="text-white font-medium text-sm">Configure Agents</p>
              <p className="text-gray-400 text-xs mt-1">Adjust content topics and posting frequency</p>
            </button>
          </div>
        </div>
      </div>

      <CreateAvatarModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default DashboardPage;
