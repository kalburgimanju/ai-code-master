import React from 'react';
import { useApp } from '../context/AppContext';
import RevenueChart from '../components/dashboard/RevenueChart';
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';

const RevenuePage: React.FC = () => {
  const { revenue, posts, campaigns } = useApp();

  const totalCampaignRevenue = campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
  const totalEngagement = posts.reduce((sum, p) => sum + p.engagement.likes + p.engagement.comments + p.engagement.shares, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Revenue</h1>
        <p className="text-gray-400">
          Track your earnings, subscriber growth, and business metrics.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5 glow-card">
          <DollarSign size={20} className="text-green-400 mb-2" />
          <p className="text-gray-400 text-xs mb-1">Total Earnings</p>
          <p className="text-2xl font-bold text-white">${revenue.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="glass rounded-xl p-5 glow-card">
          <TrendingUp size={20} className="text-brand-400 mb-2" />
          <p className="text-gray-400 text-xs mb-1">Monthly Recurring</p>
          <p className="text-2xl font-bold text-white">${revenue.monthlyRecurring.toFixed(0)}</p>
        </div>
        <div className="glass rounded-xl p-5 glow-card">
          <Users size={20} className="text-purple-400 mb-2" />
          <p className="text-gray-400 text-xs mb-1">Active Subscribers</p>
          <p className="text-2xl font-bold text-white">{revenue.activeSubscribers}</p>
        </div>
        <div className="glass rounded-xl p-5 glow-card">
          <AlertTriangle size={20} className="text-yellow-400 mb-2" />
          <p className="text-gray-400 text-xs mb-1">Churn Rate</p>
          <p className="text-2xl font-bold text-white">{revenue.churnRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <RevenueChart />

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Business Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-gray-400 text-sm">Conversion Rate</span>
              <span className="text-white font-bold">{revenue.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-gray-400 text-sm">Customer LTV</span>
              <span className="text-white font-bold">${revenue.ltv}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-gray-400 text-sm">Campaign Revenue</span>
              <span className="text-green-400 font-bold">${totalCampaignRevenue}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-gray-400 text-sm">Total Engagement</span>
              <span className="text-white font-bold">{totalEngagement.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-gray-400 text-sm">Content Generated</span>
              <span className="text-white font-bold">{posts.length} posts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Revenue Insights</h3>
        <div className="space-y-3">
          {revenue.conversionRate > 5 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
              <TrendingUp size={16} className="text-green-400 mt-0.5" />
              <p className="text-gray-300 text-sm">Conversion rate is above 5% — strong performance. Consider scaling marketing spend.</p>
            </div>
          )}
          {revenue.churnRate > 5 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
              <AlertTriangle size={16} className="text-yellow-400 mt-0.5" />
              <p className="text-gray-300 text-sm">Churn rate is elevated. Focus on improving onboarding and engagement.</p>
            </div>
          )}
          {revenue.activeSubscribers > 20 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
              <Users size={16} className="text-brand-400 mt-0.5" />
              <p className="text-gray-300 text-sm">Great growth! With {revenue.activeSubscribers} subscribers, consider adding premium features.</p>
            </div>
          )}
          {revenue.totalEarnings < 100 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <DollarSign size={16} className="text-gray-400 mt-0.5" />
              <p className="text-gray-300 text-sm">Keep building! The marketing agent is working to drive conversions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
