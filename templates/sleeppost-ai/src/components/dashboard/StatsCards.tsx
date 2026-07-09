import React from 'react';
import { FileText, MessageCircle, Users, TrendingUp, Bot, DollarSign } from 'lucide-react';
import StatCard from '../shared/StatCard';
import { useApp } from '../../context/AppContext';

const StatsCards: React.FC = () => {
  const { stats } = useApp();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        icon={FileText}
        label="Total Posts"
        value={stats.totalPosts}
        change={12}
        color="from-blue-500 to-cyan-500"
      />
      <StatCard
        icon={MessageCircle}
        label="Posts Today"
        value={stats.postsToday}
        change={8}
        color="from-purple-500 to-pink-500"
      />
      <StatCard
        icon={TrendingUp}
        label="Total Engagement"
        value={stats.totalEngagement.toLocaleString()}
        change={15}
        color="from-green-500 to-emerald-500"
      />
      <StatCard
        icon={Users}
        label="Active Avatars"
        value={stats.activeAvatars}
        color="from-orange-500 to-amber-500"
      />
      <StatCard
        icon={Bot}
        label="Agents Running"
        value={stats.agentsRunning}
        color="from-brand-500 to-indigo-500"
      />
      <StatCard
        icon={DollarSign}
        label="Revenue"
        value={`$${stats.revenue.toFixed(2)}`}
        change={23}
        color="from-pink-500 to-rose-500"
      />
    </div>
  );
};

export default StatsCards;
