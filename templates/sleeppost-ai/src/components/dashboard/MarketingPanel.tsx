import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Eye, MousePointer, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MarketingPanel: React.FC = () => {
  const { campaigns } = useApp();
  const activeCampaigns = campaigns.filter(c => c.status === 'active').slice(0, 5);

  const totalMetrics = campaigns.reduce(
    (acc, c) => ({
      impressions: acc.impressions + c.metrics.impressions,
      clicks: acc.clicks + c.metrics.clicks,
      conversions: acc.conversions + c.metrics.conversions,
      revenue: acc.revenue + c.metrics.revenue,
    }),
    { impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  );

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Megaphone size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Marketing Agent</h3>
          <p className="text-gray-400 text-xs">{campaigns.length} campaigns created</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="text-center">
          <Eye size={16} className="text-gray-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{totalMetrics.impressions.toLocaleString()}</p>
          <p className="text-gray-500 text-xs">Impressions</p>
        </div>
        <div className="text-center">
          <MousePointer size={16} className="text-gray-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{totalMetrics.clicks.toLocaleString()}</p>
          <p className="text-gray-500 text-xs">Clicks</p>
        </div>
        <div className="text-center">
          <DollarSign size={16} className="text-gray-400 mx-auto mb-1" />
          <p className="text-white font-bold text-sm">{totalMetrics.conversions}</p>
          <p className="text-gray-500 text-xs">Conversions</p>
        </div>
        <div className="text-center">
          <DollarSign size={16} className="text-green-400 mx-auto mb-1" />
          <p className="text-green-400 font-bold text-sm">${totalMetrics.revenue}</p>
          <p className="text-gray-500 text-xs">Revenue</p>
        </div>
      </div>

      <div className="space-y-3">
        {activeCampaigns.map((campaign, i) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
          >
            <div className={`w-2 h-2 rounded-full ${
              campaign.type === 'blog' ? 'bg-blue-400' :
              campaign.type === 'social' ? 'bg-purple-400' :
              campaign.type === 'email' ? 'bg-green-400' : 'bg-orange-400'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{campaign.name}</p>
              <p className="text-gray-500 text-xs">{campaign.metrics.impressions} impressions</p>
            </div>
            <span className="text-gray-400 text-xs">${campaign.metrics.revenue}</span>
          </motion.div>
        ))}
        {activeCampaigns.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">Marketing agent is creating campaigns...</p>
        )}
      </div>
    </div>
  );
};

export default MarketingPanel;
