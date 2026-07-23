'use client';
import { useState, useEffect } from 'react';
import { Megaphone, Plus, TrendingUp, Users, DollarSign, Target, BarChart3, Calendar, Play, Pause, CheckCircle, Phone, Mail, MessageSquare, ArrowRight, X, Share2, Facebook, Instagram, Send, ExternalLink, Zap, Globe, Repeat, Eye, MousePointer, Clock, AlertCircle } from 'lucide-react';
import { sampleCampaigns, projects } from '@/lib/data';
import { getItem, setItem, CAMPAIGNS_KEY, generateId } from '@/lib/storage';
import type { MarketingCampaign } from '@/lib/types';

const campaignTypes = ['Social Media', 'Google Ads', 'Email', 'SMS', 'Print', 'Event'] as const;
const campaignStatuses = ['Active', 'Paused', 'Completed'] as const;

const socialPlatforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-500', connected: true, followers: '12.5K', engagement: '3.2%' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500', connected: true, followers: '8.3K', engagement: '4.7%' },
  { id: 'whatsapp', name: 'WhatsApp Business', icon: MessageSquare, color: 'from-green-500 to-green-400', connected: true, followers: '2.1K', engagement: '12.8%' },
  { id: 'google', name: 'Google Ads', icon: Globe, color: 'from-yellow-500 to-orange-500', connected: false, followers: '—', engagement: '2.1%' },
  { id: 'email', name: 'Email Marketing', icon: Mail, color: 'from-cyan-500 to-blue-500', connected: true, followers: '5.6K', engagement: '18.2%' },
  { id: 'sms', name: 'SMS Campaigns', icon: Send, color: 'from-emerald-500 to-teal-500', connected: false, followers: '—', engagement: '8.5%' },
];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'budget' | 'strategy' | 'social'>('campaigns');
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showRunModal, setShowRunModal] = useState<string | null>(null);
  const [runConfig, setRunConfig] = useState({ duration: '7', dailyBudget: '1000', targetCities: 'Hubli,Bangalore,Mysore' });

  // Load campaigns from localStorage or use sample data
  useEffect(() => {
    const saved = getItem<MarketingCampaign[]>(CAMPAIGNS_KEY, []);
    if (saved.length > 0) {
      setCampaigns(saved);
    } else {
      setCampaigns(sampleCampaigns as MarketingCampaign[]);
      setItem(CAMPAIGNS_KEY, sampleCampaigns);
    }
  }, []);

  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'Social Media' as MarketingCampaign['type'],
    budget: 50000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    targetProperty: '',
    targetCities: 'Hubli,Bangalore,Mysore',
  });

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const costPerLead = totalLeads > 0 ? Math.round(totalSpent / totalLeads) : 0;
  const conversionRate = totalLeads > 0 ? Math.round(totalConversions / totalLeads * 100) : 0;

  const handleCreateCampaign = () => {
    if (!newCampaign.name.trim()) return;
    const campaign: MarketingCampaign = {
      id: generateId(),
      name: newCampaign.name,
      type: newCampaign.type,
      budget: newCampaign.budget,
      spent: 0,
      leads: 0,
      conversions: 0,
      status: 'Paused',
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
    };
    const updated = [...campaigns, campaign];
    setCampaigns(updated);
    setItem(CAMPAIGNS_KEY, updated);
    setShowNewCampaign(false);
    setNewCampaign({
      name: '',
      type: 'Social Media',
      budget: 50000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      targetProperty: '',
      targetCities: 'Hubli,Bangalore,Mysore',
    });
  };

  const handleToggleCampaign = (id: string) => {
    const updated = campaigns.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'Active' ? 'Paused' : 'Active';
        return { ...c, status: newStatus as MarketingCampaign['status'] };
      }
      return c;
    });
    setCampaigns(updated);
    setItem(CAMPAIGNS_KEY, updated);
  };

  const handleRunCampaign = (id: string) => {
    const updated = campaigns.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Active' as const,
          spent: Math.min(c.budget, c.spent + parseInt(runConfig.dailyBudget) * parseInt(runConfig.duration)),
          leads: c.leads + Math.floor(Math.random() * 15) + 5,
          conversions: c.conversions + Math.floor(Math.random() * 4) + 1,
        };
      }
      return c;
    });
    setCampaigns(updated);
    setItem(CAMPAIGNS_KEY, updated);
    setShowRunModal(null);
  };

  const handleDeleteCampaign = (id: string) => {
    const updated = campaigns.filter(c => c.id !== id);
    setCampaigns(updated);
    setItem(CAMPAIGNS_KEY, updated);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Plan campaigns, track ROI, and automate lead generation</p>
        </div>
        <button onClick={() => setShowNewCampaign(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
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
        {(['campaigns', 'budget', 'strategy', 'social'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200'}`}>{t === 'social' ? 'Social Media' : t}</button>
        ))}
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Campaigns</h2>
            <span className="text-xs text-dark-500">{campaigns.length} campaigns</span>
          </div>
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="p-4 rounded-xl bg-dark-800/50 border border-dark-800 hover:border-dark-700 transition-all">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.status === 'Active' ? 'bg-green-500/20' : 'bg-dark-700'}`}>
                      <Megaphone className={`w-4.5 h-4.5 ${c.status === 'Active' ? 'text-green-400' : 'text-dark-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="badge-blue text-[10px]">{c.type}</span>
                        {c.status === 'Active' && <span className="badge-green text-[10px]"><Zap className="w-3 h-3 mr-1" /> Running</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right"><div className="text-sm font-medium text-white">₹{(c.budget / 1000).toFixed(0)}K</div><div className="text-[10px] text-dark-500">Budget</div></div>
                    <div className="text-right"><div className="text-sm font-medium text-white">{c.leads}</div><div className="text-[10px] text-dark-500">Leads</div></div>
                    <div className="text-right"><div className="text-sm font-medium text-prop-400">{c.conversions}</div><div className="text-[10px] text-dark-500">Conv.</div></div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowRunModal(c.id)}
                        className="btn-ghost p-1.5 text-finance-400 hover:text-finance-300"
                        title="Run Campaign"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleCampaign(c.id)}
                        className="btn-ghost p-1.5"
                        title={c.status === 'Active' ? 'Pause' : 'Resume'}
                      >
                        {c.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setShowShareModal(c.id)}
                        className="btn-ghost p-1.5 text-prop-400 hover:text-prop-300"
                        title="Share Campaign"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(c.id)}
                        className="btn-ghost p-1.5 text-red-400 hover:text-red-300"
                        title="Delete Campaign"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 progress-bar"><div className="progress-fill" style={{ width: `${Math.round(c.spent / c.budget * 100)}%` }} /></div>
                <div className="flex items-center justify-between text-[10px] text-dark-500 mt-1">
                  <span>Spent: ₹{(c.spent / 1000).toFixed(0)}K ({Math.round(c.spent / c.budget * 100)}%)</span>
                  <span>{c.startDate} → {c.endDate}</span>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No campaigns yet. Create your first campaign!</p>
              </div>
            )}
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
              { icon: Megaphone, title: 'Social Media', desc: 'Schedule and manage posts across platforms.', active: true },
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

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* Connected Platforms */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">🔗 Connected Platforms</h2>
              <button className="btn-ghost text-xs"><Plus className="w-3.5 h-3.5" /> Connect New</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialPlatforms.map(p => (
                <div key={p.id} className={`p-4 rounded-xl border ${p.connected ? 'bg-dark-800/50 border-dark-700' : 'bg-dark-900/50 border-dark-800 border-dashed'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white">{p.name}</h3>
                      {p.connected ? (
                        <div className="flex items-center gap-3 text-[10px] text-dark-500 mt-0.5">
                          <span>{p.followers} followers</span>
                          <span>•</span>
                          <span className="text-prop-400">{p.engagement} engagement</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-dark-500 mt-0.5">Not connected</p>
                      )}
                    </div>
                    <button className={`text-xs ${p.connected ? 'btn-ghost text-prop-400' : 'btn-primary text-xs py-1.5 px-3'}`}>
                      {p.connected ? 'Manage' : 'Connect'}
                    </button>
                  </div>
                  {p.connected && (
                    <div className="mt-3 pt-3 border-t border-dark-700">
                      <div className="flex gap-2">
                        <button className="btn-ghost text-[10px] flex-1 justify-center"><Send className="w-3 h-3" /> Post</button>
                        <button className="btn-ghost text-[10px] flex-1 justify-center"><BarChart3 className="w-3 h-3" /> Analytics</button>
                        <button className="btn-ghost text-[10px] flex-1 justify-center"><Calendar className="w-3 h-3" /> Schedule</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Share */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">🚀 Quick Share</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-800">
                <label className="label text-xs">Campaign Content</label>
                <textarea className="input text-sm min-h-[100px]" placeholder="Write your campaign message... Include property details, offers, and a call-to-action."></textarea>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    {socialPlatforms.filter(p => p.connected).map(p => (
                      <button key={p.id} className={`p-2 rounded-lg bg-gradient-to-br ${p.color} text-white hover:opacity-80 transition-opacity`} title={`Share on ${p.name}`}>
                        <p.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                  <button className="btn-primary text-sm"><Share2 className="w-4 h-4" /> Share Now</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Shares & Analytics */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">📊 Platform Performance</h2>
              <div className="space-y-3">
                {[
                  { platform: 'Facebook', reach: '12,450', clicks: '892', conversions: 23, color: 'bg-blue-500' },
                  { platform: 'Instagram', reach: '8,320', clicks: '1,245', conversions: 18, color: 'bg-pink-500' },
                  { platform: 'WhatsApp', reach: '2,100', clicks: '680', conversions: 12, color: 'bg-green-500' },
                  { platform: 'Email', reach: '5,600', clicks: '2,340', conversions: 31, color: 'bg-cyan-500' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-dark-800/30">
                    <div className={`w-2.5 h-2.5 rounded-full ${stat.color}`} />
                    <span className="text-sm text-dark-200 w-24">{stat.platform}</span>
                    <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                      <div><div className="text-sm font-medium text-white">{stat.reach}</div><div className="text-[10px] text-dark-500">Reach</div></div>
                      <div><div className="text-sm font-medium text-white">{stat.clicks}</div><div className="text-[10px] text-dark-500">Clicks</div></div>
                      <div><div className="text-sm font-medium text-prop-400">{stat.conversions}</div><div className="text-[10px] text-dark-500">Conv.</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">📅 Scheduled Posts</h2>
              <div className="space-y-3">
                {[
                  { title: 'Sobha City — Monsoon Offer', platform: 'Facebook + Instagram', time: 'Today, 6:00 PM', status: 'Scheduled' },
                  { title: 'Prestige Enclave — Construction Update', platform: 'WhatsApp + Email', time: 'Tomorrow, 10:00 AM', status: 'Scheduled' },
                  { title: 'DLF MyTown — Investment Tips', platform: 'Instagram Reels', time: 'Jul 25, 12:00 PM', status: 'Draft' },
                ].map((post, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/30">
                    <div className="w-9 h-9 rounded-lg bg-finance-600/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-finance-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{post.title}</h3>
                      <p className="text-[10px] text-dark-500">{post.platform} • {post.time}</p>
                    </div>
                    <span className={`badge text-[10px] ${post.status === 'Scheduled' ? 'badge-green' : 'badge-gray'}`}>{post.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-lg mx-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-finance-400" /> New Campaign
              </h2>
              <button onClick={() => setShowNewCampaign(false)} className="p-1 text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label text-xs">Campaign Name *</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g., Hubli Monsoon Property Festival"
                  className="input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Campaign Type</label>
                  <select
                    value={newCampaign.type}
                    onChange={e => setNewCampaign({ ...newCampaign, type: e.target.value as MarketingCampaign['type'] })}
                    className="select text-sm"
                  >
                    {campaignTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Budget (₹)</label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={e => setNewCampaign({ ...newCampaign, budget: parseInt(e.target.value) || 0 })}
                    min={1000}
                    step={5000}
                    className="input text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Start Date</label>
                  <input
                    type="date"
                    value={newCampaign.startDate}
                    onChange={e => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="label text-xs">End Date</label>
                  <input
                    type="date"
                    value={newCampaign.endDate}
                    onChange={e => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                    className="input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Target Property</label>
                <select
                  value={newCampaign.targetProperty}
                  onChange={e => setNewCampaign({ ...newCampaign, targetProperty: e.target.value })}
                  className="select text-sm"
                >
                  <option value="">All Properties</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-xs">Target Cities</label>
                <input
                  type="text"
                  value={newCampaign.targetCities}
                  onChange={e => setNewCampaign({ ...newCampaign, targetCities: e.target.value })}
                  placeholder="Hubli, Bangalore, Mysore"
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="label text-xs">Description / Notes</label>
                <textarea
                  value={newCampaign.description}
                  onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  placeholder="Campaign goals, target audience, messaging strategy..."
                  className="input text-sm min-h-[80px]"
                />
              </div>

              {/* Quick Templates */}
              <div>
                <label className="label text-xs">Quick Templates</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'New Launch', name: 'New Property Launch Campaign', type: 'Social Media', budget: 75000 },
                    { label: 'Festival Offer', name: 'Festival Season Special Offer', type: 'Email', budget: 25000 },
                    { label: 'Lead Gen', name: 'Lead Generation Campaign', type: 'Google Ads', budget: 100000 },
                    { label: 'WhatsApp', name: 'WhatsApp Broadcast Campaign', type: 'SMS', budget: 10000 },
                  ].map((tmpl, i) => (
                    <button
                      key={i}
                      onClick={() => setNewCampaign({ ...newCampaign, name: tmpl.name, type: tmpl.type as MarketingCampaign['type'], budget: tmpl.budget })}
                      className="px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-[10px] text-dark-300 hover:text-dark-200 hover:border-finance-500/30 transition-all"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-4 border-t border-dark-700">
              <button onClick={() => setShowNewCampaign(false)} className="flex-1 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl text-sm text-dark-300 transition-all">
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={!newCampaign.name.trim()}
                className="flex-1 px-4 py-2.5 bg-finance-600 hover:bg-finance-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm text-white font-medium transition-all"
              >
                <Plus className="w-4 h-4 inline mr-1" /> Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Campaign Modal */}
      {showRunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-finance-400" /> Run Campaign
              </h2>
              <button onClick={() => setShowRunModal(null)} className="p-1 text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-dark-800/50 border border-dark-800">
                <p className="text-sm text-dark-300">Campaign: <span className="text-white font-medium">{campaigns.find(c => c.id === showRunModal)?.name}</span></p>
                <p className="text-xs text-dark-500 mt-1">Budget: ₹{((campaigns.find(c => c.id === showRunModal)?.budget || 0) / 1000).toFixed(0)}K</p>
              </div>

              <div>
                <label className="label text-xs">Run Duration (days)</label>
                <select
                  value={runConfig.duration}
                  onChange={e => setRunConfig({ ...runConfig, duration: e.target.value })}
                  className="select text-sm"
                >
                  <option value="1">1 Day</option>
                  <option value="3">3 Days</option>
                  <option value="7">7 Days</option>
                  <option value="14">14 Days</option>
                  <option value="30">30 Days</option>
                </select>
              </div>

              <div>
                <label className="label text-xs">Daily Budget (₹)</label>
                <input
                  type="number"
                  value={runConfig.dailyBudget}
                  onChange={e => setRunConfig({ ...runConfig, dailyBudget: e.target.value })}
                  min={500}
                  step={500}
                  className="input text-sm"
                />
                <p className="text-[10px] text-dark-500 mt-1">Total spend: ₹{(parseInt(runConfig.dailyBudget) * parseInt(runConfig.duration)).toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="label text-xs">Target Cities</label>
                <input
                  type="text"
                  value={runConfig.targetCities}
                  onChange={e => setRunConfig({ ...runConfig, targetCities: e.target.value })}
                  className="input text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-finance-500/10 border border-finance-500/20">
                <p className="text-xs text-finance-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Campaign will start immediately</p>
                <p className="text-xs text-dark-400 mt-1">The campaign will be activated and start running across all connected platforms.</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-4 border-t border-dark-700">
              <button onClick={() => setShowRunModal(null)} className="flex-1 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl text-sm text-dark-300 transition-all">
                Cancel
              </button>
              <button
                onClick={() => handleRunCampaign(showRunModal)}
                className="flex-1 px-4 py-2.5 bg-prop-600 hover:bg-prop-500 rounded-xl text-sm text-white font-medium transition-all"
              >
                <Play className="w-4 h-4 inline mr-1" /> Start Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Campaign Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-lg mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-prop-400" /> Share Campaign
              </h2>
              <button onClick={() => setShowShareModal(null)} className="p-1 text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-dark-800/50 border border-dark-800">
                <p className="text-sm text-dark-300">Sharing: <span className="text-white font-medium">{campaigns.find(c => c.id === showShareModal)?.name}</span></p>
              </div>

              <div>
                <label className="label text-xs">Custom Message (optional)</label>
                <textarea
                  className="input text-sm min-h-[80px]"
                  placeholder="Add a custom message to your campaign share..."
                />
              </div>

              <div>
                <label className="label text-xs">Share to Platforms</label>
                <div className="grid grid-cols-2 gap-3">
                  {socialPlatforms.map(p => (
                    <button
                      key={p.id}
                      className={`p-3 rounded-xl border ${p.connected ? 'bg-dark-800/50 border-dark-700 hover:border-finance-500/30' : 'bg-dark-900/50 border-dark-800 opacity-50 cursor-not-allowed'} transition-all`}
                      disabled={!p.connected}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                          <p.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-white">{p.name}</p>
                          <p className="text-[10px] text-dark-500">{p.connected ? 'Connected' : 'Not connected'}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-dark-800/30 border border-dark-800">
                <div className="flex items-center gap-2 text-xs text-dark-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Estimated reach: <span className="text-white font-medium">28,470</span> users</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-dark-400 mt-1">
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>Estimated clicks: <span className="text-white font-medium">~2,500</span></span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-4 border-t border-dark-700">
              <button onClick={() => setShowShareModal(null)} className="flex-1 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl text-sm text-dark-300 transition-all">
                Cancel
              </button>
              <button className="flex-1 px-4 py-2.5 bg-prop-600 hover:bg-prop-500 rounded-xl text-sm text-white font-medium transition-all">
                <Share2 className="w-4 h-4 inline mr-1" /> Share Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
