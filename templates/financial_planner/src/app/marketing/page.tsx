'use client';
import { useState } from 'react';
import { Megaphone, Plus, TrendingUp, Users, DollarSign, Target, BarChart3, PieChart, Calendar, Play, Pause, CheckCircle, Phone, Mail, MessageSquare, ArrowRight } from 'lucide-react';
import { sampleCampaigns } from '@/lib/data';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'budget' | 'strategy'>('campaigns');

  const totalBudget = sampleCampaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = sampleCampaigns.reduce((s, c) => s + c.spent, 0);
  const totalLeads = sampleCampaigns.reduce((s, c) => s + c.leads, 0);
  const totalConversions = sampleCampaigns.reduce((s, c) => s + c.conversions, 0);
  const costPerLead = totalLeads > 0 ? Math.round(totalSpent / totalLeads) : 0;
  const conversionRate = totalLeads > 0 ? Math.round(totalConversions / totalLeads * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Marketing Dashboard</h1><p className="text-dark-400 text-sm mt-1">Plan campaigns, track ROI, and automate lead generation</p></div>
        <button className="btn-primary text-sm"><Plus className="w-4 h-4" /> New Campaign</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: DollarSign, label: 'Total Budget', value: `₹${(totalBudget / 1000).toFixed(0)}K`, color: 'from-finance-500 to-blue-600' },
          { icon: TrendingUp, label: 'Spent', value: `₹${(totalSpent / 1000).toFixed(0)}K`, color: 'from-amber-500 to-orange-600' },
          { icon: Users, label: 'Total Leads', value: totalLeads.toString(), color: 'from-prop-500 to-green-600' },
          { icon: Target, label: 'Cost/Lead', value: `₹${costPerLead}`, color: 'from-cyan-500 to-teal-600' },
          { icon: BarChart3, label: 'Conversion Rate', value: `${conversionRate}%`, color: 'from-purple-500 to-pink-600' },
        ].map((s, i) => (
          <div key={i} className="card-hover flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}><s.icon className="w-5 h-5 text-white" /></div>
            <div><div className="text-lg font-bold text-white">{s.value}</div><div className="text-[10px] text-dark-500">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 rounded-xl p-1 w-fit">
        {(['campaigns', 'budget', 'strategy'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200'}`}>{t}</button>
        ))}
      </div>

      {/* Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Campaigns</h2>
          <div className="space-y-3">
            {sampleCampaigns.map(c => (
              <div key={c.id} className="p-4 rounded-xl bg-dark-800/50 border border-dark-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.status === 'Active' ? 'bg-green-500/20' : 'bg-dark-700'}`}><Megaphone className={`w-4.5 h-4.5 ${c.status === 'Active' ? 'text-green-400' : 'text-dark-400'}`} /></div>
                    <div><h3 className="text-sm font-semibold text-white">{c.name}</h3><span className="badge-blue text-[10px]">{c.type}</span></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right"><div className="text-sm font-medium text-white">₹{(c.budget / 1000).toFixed(0)}K</div><div className="text-[10px] text-dark-500">Budget</div></div>
                    <div className="text-right"><div className="text-sm font-medium text-white">{c.leads}</div><div className="text-[10px] text-dark-500">Leads</div></div>
                    <div className="text-right"><div className="text-sm font-medium text-prop-400">{c.conversions}</div><div className="text-[10px] text-dark-500">Conv.</div></div>
                    <span className={`badge text-[10px] ${c.status === 'Active' ? 'badge-green' : c.status === 'Paused' ? 'badge-yellow' : 'badge-gray'}`}>{c.status}</span>
                    <button className="btn-ghost p-1.5">{c.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}</button>
                  </div>
                </div>
                <div className="mt-2 progress-bar"><div className="progress-fill" style={{ width: `${Math.round(c.spent / c.budget * 100)}%` }} /></div>
                <div className="flex items-center justify-between text-[10px] text-dark-500 mt-1"><span>Spent: ₹{(c.spent / 1000).toFixed(0)}K</span><span>{c.startDate} to {c.endDate}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Planner */}
      {activeTab === 'budget' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">📊 Budget Allocation</h2>
            {[
              { channel: 'Social Media Ads', amount: 65000, pct: 35, color: 'bg-blue-500' },
              { channel: 'Google Ads', amount: 55000, pct: 30, color: 'bg-green-500' },
              { channel: 'Email Marketing', amount: 25000, pct: 14, color: 'bg-purple-500' },
              { channel: 'Print Media', amount: 20000, pct: 11, color: 'bg-amber-500' },
              { channel: 'Events', amount: 18000, pct: 10, color: 'bg-pink-500' },
            ].map((ch, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1"><span className="text-dark-300">{ch.channel}</span><span className="text-white font-medium">₹{(ch.amount / 1000).toFixed(0)}K</span></div>
                <div className="progress-bar"><div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.pct}%` }} /></div>
              </div>
            ))}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-700"><span className="text-white font-semibold">Total Monthly Budget</span><span className="text-lg font-bold text-prop-400">₹1.83L</span></div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">📈 ROI Calculator</h2>
            <div className="space-y-4">
              {[
                { label: 'Monthly Budget (₹)', value: 183000, min: 10000, max: 1000000, step: 10000 },
                { label: 'Expected Cost Per Lead (₹)', value: 1500, min: 100, max: 10000, step: 100 },
                { label: 'Expected Conversion Rate (%)', value: 8, min: 1, max: 30, step: 1 },
                { label: 'Average Deal Value (₹)', value: 7000000, min: 100000, max: 50000000, step: 100000 },
              ].map(({ label, value, min, max, step }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-dark-400">{label}</span><span className="text-white font-medium">₹{value.toLocaleString('en-IN')}</span></div>
                  <input type="range" min={min} max={max} step={step} defaultValue={value} className="w-full accent-finance-500" />
                </div>
              ))}
              <div className="p-4 rounded-xl bg-finance-500/10 border border-finance-500/20 mt-2">
                <p className="text-sm text-dark-300">Estimated Leads: <span className="text-white font-bold">122</span> / mo</p>
                <p className="text-sm text-dark-300 mt-1">Estimated Conversions: <span className="text-white font-bold">~10</span> / mo</p>
                <p className="text-sm text-dark-300 mt-1">Projected Revenue: <span className="text-prop-400 font-bold">₹7Cr</span> / mo</p>
                <p className="text-xs text-dark-500 mt-2">ROI: <span className="text-green-400">3,725%</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategy */}
      {activeTab === 'strategy' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">🎯 Marketing Strategy Builder</h2>
            <p className="text-xs text-dark-400">Build a comprehensive marketing plan for your real estate projects:</p>
            {[
              { title: 'Social Media Campaign', desc: 'Instagram + Facebook ads targeting home buyers in Hubli, Bangalore, Mysore', budget: '₹45K', leads: '30-40' },
              { title: 'Google Ads - Local Intent', desc: 'Target "apartment in Hubli", "villa in Bangalore" keywords', budget: '₹55K', leads: '45-60' },
              { title: 'WhatsApp Broadcast', desc: 'Broadcast to saved leads and referrals with project updates', budget: '₹5K', leads: '10-15' },
              { title: 'Email Drip Campaign', desc: 'Automated email sequence for leads in pipeline', budget: '₹10K', leads: '20-25' },
              { title: 'Referral Program', desc: 'Incentivize existing buyers to refer friends and family', budget: '₹20K', leads: '15-20' },
            ].map((strat, i) => (
              <div key={i} className="p-3 rounded-xl bg-dark-800/50 border border-dark-800 hover:border-finance-500/20 transition-all">
                <div className="flex items-center justify-between"><h3 className="text-sm font-medium text-white">{strat.title}</h3><span className="badge-blue text-[10px]">{strat.budget}</span></div>
                <p className="text-xs text-dark-400 mt-1">{strat.desc}</p>
                <div className="text-[10px] text-dark-500 mt-1">Estimated leads: {strat.leads}/mo</div>
              </div>
            ))}
            <button className="btn-primary w-full text-sm justify-center mt-2"><Target className="w-4 h-4" /> Build Full Strategy with AI Agent</button>
          </div>

          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">📞 Outbound Channels</h2>
            {[
              { icon: Phone, title: 'Cold Calling', desc: 'Call leads directly from the platform. Track duration and outcomes.', active: true },
              { icon: MessageSquare, title: 'SMS Campaigns', desc: 'Send bulk SMS to leads with project updates and offers.', active: true },
              { icon: Mail, title: 'Email Automation', desc: 'Automated email sequences for lead nurturing.', active: true },
              { icon: Megaphone, title: 'Social Media', desc: 'Schedule and manage posts across platforms.', active: false },
            ].map((ch, i) => (
              <div key={i} className={`p-4 rounded-xl border ${ch.active ? 'bg-dark-800/50 border-dark-800' : 'bg-dark-900/50 border-dark-800 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${ch.active ? 'bg-finance-600/20' : 'bg-dark-800'} flex items-center justify-center`}><ch.icon className={`w-4.5 h-4.5 ${ch.active ? 'text-finance-400' : 'text-dark-500'}`} /></div>
                  <div className="flex-1"><h3 className="text-sm font-medium text-white">{ch.title}</h3><p className="text-xs text-dark-400 mt-0.5">{ch.desc}</p></div>
                  <button className={`btn-ghost text-xs ${ch.active ? '' : 'text-dark-600'}`}>{ch.active ? 'Configure' : 'Coming Soon'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
