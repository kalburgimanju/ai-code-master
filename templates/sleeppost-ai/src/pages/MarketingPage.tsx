import React from 'react';
import { useApp } from '../context/AppContext';
import MarketingPanel from '../components/dashboard/MarketingPanel';
import ScheduleCalendar from '../components/dashboard/ScheduleCalendar';

const MarketingPage: React.FC = () => {
  const { campaigns } = useApp();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Marketing</h1>
        <p className="text-gray-400">
          Your autonomous marketing agent creates and manages campaigns 24/7.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <MarketingPanel />
        <ScheduleCalendar />
      </div>

      {campaigns.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">All Campaigns</h3>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                      campaign.type === 'blog' ? 'bg-blue-400/10 text-blue-400' :
                      campaign.type === 'social' ? 'bg-purple-400/10 text-purple-400' :
                      campaign.type === 'email' ? 'bg-green-400/10 text-green-400' :
                      'bg-orange-400/10 text-orange-400'
                    }`}>
                      {campaign.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      campaign.status === 'active' ? 'bg-green-400/10 text-green-400' :
                      campaign.status === 'completed' ? 'bg-gray-400/10 text-gray-400' :
                      'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white font-medium text-sm mb-1">{campaign.name}</p>
                <p className="text-gray-400 text-sm line-clamp-2">{campaign.content}</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span>{campaign.metrics.impressions} impressions</span>
                  <span>{campaign.metrics.clicks} clicks</span>
                  <span>{campaign.metrics.conversions} conversions</span>
                  <span className="text-green-400">${campaign.metrics.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingPage;
