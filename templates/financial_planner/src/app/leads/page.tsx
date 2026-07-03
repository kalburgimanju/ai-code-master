'use client';
import { useState } from 'react';
import { Users, Phone, Plus, Search, Filter, UserPlus, Calendar, CheckCircle, XCircle, Clock, MessageSquare, ChevronDown, ChevronUp, TrendingUp, BarChart3 } from 'lucide-react';
import { sampleLeads, sampleCallLogs } from '@/lib/data';

const statusColors: Record<string, string> = {
  New: 'badge-blue', Contacted: 'badge-yellow', Qualified: 'badge-green',
  'Visit Scheduled': 'bg-purple-500/20 text-purple-400', Negotiation: 'bg-orange-500/20 text-orange-400',
  Closed: 'badge-green', Lost: 'badge-red',
};

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<'leads' | 'calls' | 'agents'>('leads');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const filteredLeads = sampleLeads.filter(l => {
    if (statusFilter !== 'All' && l.status !== statusFilter) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.phone.includes(search)) return false;
    return true;
  });

  const pipelineStages = ['New', 'Contacted', 'Qualified', 'Visit Scheduled', 'Negotiation', 'Closed'];
  const pipelineCounts = pipelineStages.map(s => ({ stage: s, count: sampleLeads.filter(l => l.status === s).length }));
  const conversionRate = Math.round(sampleLeads.filter(l => l.status === 'Closed').length / sampleLeads.length * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Leads & CRM</h1><p className="text-dark-400 text-sm mt-1">Manage leads, track calls, and follow up with agents</p></div>
        <button className="btn-primary text-sm"><UserPlus className="w-4 h-4" /> Add Lead</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 rounded-xl p-1 w-fit">
        {(['leads', 'calls', 'agents'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200'}`}>{t}</button>
        ))}
      </div>

      {/* Pipeline Overview */}
      {activeTab === 'leads' && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {pipelineCounts.map(({ stage, count }) => (
              <div key={stage} className="card text-center p-3"><div className="text-lg font-bold text-white">{count}</div><div className="text-[9px] text-dark-500 mt-0.5">{stage}</div></div>
            ))}
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" placeholder="Search leads..." /></div>
              {['All', 'New', 'Contacted', 'Qualified', 'Visit Scheduled', 'Negotiation', 'Closed', 'Lost'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-finance-600/20 text-finance-400 border border-finance-500/30' : 'text-dark-500 hover:text-dark-300'}`}>{s}</button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredLeads.map(lead => (
                <div key={lead.id} className="rounded-xl bg-dark-800/50 border border-dark-800">
                  <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}>
                    <div className="w-9 h-9 rounded-full bg-finance-600/20 flex items-center justify-center text-sm font-medium text-finance-400">{lead.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-sm font-medium text-white">{lead.name}</span><span className={statusColors[lead.status] || 'badge-gray'}>{lead.status}</span></div>
                      <div className="text-xs text-dark-500 mt-0.5">{lead.source} • {lead.propertyInterest}</div>
                    </div>
                    <div className="text-right hidden sm:block"><div className="text-sm text-dark-300">{lead.budget}</div><div className="text-[10px] text-dark-500">{lead.lastContact}</div></div>
                    <button className="btn-ghost p-1.5"><Phone className="w-4 h-4" /></button>
                    {expandedLead === lead.id ? <ChevronUp className="w-4 h-4 text-dark-500" /> : <ChevronDown className="w-4 h-4 text-dark-500" />}
                  </div>
                  {expandedLead === lead.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-dark-800 mt-2 pt-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div><span className="text-[10px] text-dark-500">Notes</span><p className="text-xs text-dark-300 mt-1">{lead.notes}</p></div>
                        <div><span className="text-[10px] text-dark-500">Assigned Agent</span><p className="text-xs text-dark-300 mt-1">{lead.assignedAgent}</p></div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="btn-primary text-xs py-1.5"><Phone className="w-3 h-3" /> Call</button>
                        <button className="btn-secondary text-xs py-1.5"><MessageSquare className="w-3 h-3" /> Message</button>
                        <button className="btn-ghost text-xs py-1.5"><CheckCircle className="w-3 h-3" /> Mark Qualified</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Call Logs */}
      {activeTab === 'calls' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">📞 Call Logs</h2>
          <div className="space-y-3">
            {sampleCallLogs.map(call => (
              <div key={call.id} className="p-4 rounded-xl bg-dark-800/50 border border-dark-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-green-400" /><span className="text-sm font-medium text-white">{call.leadName}</span></div>
                  <span className="text-xs text-dark-500">{Math.floor(call.duration / 60)}m {call.duration % 60}s</span>
                </div>
                <p className="text-xs text-dark-400 mt-2">Agent: {call.agentName} • {new Date(call.timestamp).toLocaleDateString()}</p>
                <p className="text-xs text-dark-300 mt-1">{call.notes}</p>
                <span className="badge-green text-[10px] mt-2 inline-block">{call.outcome}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-dark-800 border border-dark-700">
            <h3 className="text-sm font-medium text-white mb-2">Log a Call</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <select className="input text-sm"><option>Select lead...</option>{sampleLeads.map(l => <option key={l.id}>{l.name}</option>)}</select>
              <input type="text" className="input text-sm" placeholder="Duration (mins)" />
              <textarea className="input text-sm col-span-2" placeholder="Call notes..." rows={2} />
              <button className="btn-primary text-sm col-span-2"><Phone className="w-4 h-4" /> Log Call</button>
            </div>
          </div>
        </div>
      )}

      {/* Agent View */}
      {activeTab === 'agents' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">👥 Sales Agents</h2>
            {[
              { name: 'Rajesh Agent', leads: 8, calls: 15, deals: 3, revenue: '₹2.4 Cr', color: 'from-finance-500 to-blue-600' },
              { name: 'Priya Agent', leads: 6, calls: 12, deals: 2, revenue: '₹1.8 Cr', color: 'from-prop-500 to-green-600' },
              { name: 'Suresh Agent', leads: 5, calls: 9, deals: 1, revenue: '₹95 L', color: 'from-amber-500 to-orange-600' },
            ].map((agent, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-dark-800/50 border border-dark-800 mb-2">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center text-white font-medium text-sm`}>{agent.name.charAt(0)}</div>
                <div className="flex-1"><div className="text-sm font-medium text-white">{agent.name}</div><div className="text-xs text-dark-500">{agent.leads} leads • {agent.calls} calls</div></div>
                <div className="text-right"><div className="text-sm font-semibold text-prop-400">{agent.revenue}</div><div className="text-[10px] text-dark-500">{agent.deals} deals</div></div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">📊 Agent Performance</h2>
            {[
              { label: 'Total Leads', value: sampleLeads.length, pct: 100 },
              { label: 'Contacted', value: sampleLeads.filter(l => l.status !== 'New').length, pct: Math.round(sampleLeads.filter(l => l.status !== 'New').length / sampleLeads.length * 100) },
              { label: 'Qualified', value: sampleLeads.filter(l => ['Qualified','Visit Scheduled','Negotiation','Closed'].includes(l.status)).length, pct: Math.round(sampleLeads.filter(l => ['Qualified','Visit Scheduled','Negotiation','Closed'].includes(l.status)).length / sampleLeads.length * 100) },
              { label: 'Closed', value: sampleLeads.filter(l => l.status === 'Closed').length, pct: conversionRate },
            ].map((s, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1"><span className="text-dark-400">{s.label}</span><span className="text-white font-medium">{s.value} ({s.pct}%)</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${s.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
