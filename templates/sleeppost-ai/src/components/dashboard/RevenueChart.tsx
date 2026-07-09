import React from 'react';
import { useApp } from '../../context/AppContext';

const RevenueChart: React.FC = () => {
  const { revenue } = useApp();
  const data = revenue.dailyRevenue;
  const max = Math.max(...data, 1);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Revenue (30 days)</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">${revenue.totalEarnings.toFixed(2)}</p>
          <p className="text-green-400 text-xs">+{revenue.conversionRate.toFixed(1)}% conversion</p>
        </div>
      </div>

      <div className="flex items-end gap-1 h-32">
        {data.map((value, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500 hover:from-brand-500 hover:to-brand-300"
            style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
            title={`Day ${i + 1}: $${value.toFixed(2)}`}
          />
        ))}
      </div>

      <div className="flex justify-between mt-3 text-xs text-gray-500">
        <span>30 days ago</span>
        <span>Today</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5">
        <div>
          <p className="text-gray-400 text-xs">MRR</p>
          <p className="text-white font-bold">${revenue.monthlyRecurring.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Subscribers</p>
          <p className="text-white font-bold">{revenue.activeSubscribers}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">LTV</p>
          <p className="text-white font-bold">${revenue.ltv}</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
