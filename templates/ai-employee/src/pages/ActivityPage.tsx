import React from 'react';
import { useAgentLoop } from '../hooks/useAgentLoop';
import ActivityFeed from '../components/dashboard/ActivityFeed';

const ActivityPage: React.FC = () => {
  useAgentLoop();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <p className="text-dark-400 text-sm mt-1">Live feed of all agent conversations in real-time.</p>
      </div>
      <div className="h-[calc(100vh-200px)]">
        <ActivityFeed />
      </div>
    </div>
  );
};

export default ActivityPage;
