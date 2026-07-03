'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Wallet, Bot, TrendingUp, Users, Phone, Scale, MessageSquare, ArrowRight, DollarSign, Home, Activity, Megaphone, BarChart3 } from 'lucide-react';
import { projects, sampleLeads, sampleCampaigns } from '@/lib/data';
import { getItem, USER_KEY } from '@/lib/storage';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => { setUser(getItem(USER_KEY, null)); }, []);

  const totalProperties = projects.length;
  const totalCities = [...new Set(projects.map(p => p.city))].length;
  const priceRange = projects.reduce((a, b) => ({ priceMin: Math.min(a.priceMin, b.priceMin), priceMax: Math.max(a.priceMax, b.priceMax) }), { priceMin: Infinity, priceMax: 0 });
  const activeLeads = sampleLeads.filter(l => l.status !== 'Lost' && l.status !== 'Closed').length;
  const totalCampaignBudget = sampleCampaigns.reduce((s, c) => s + c.budget, 0);
  const totalLeads = sampleCampaigns.reduce((s, c) => s + c.leads, 0);
  const totalConversions = sampleCampaigns.reduce((s, c) => s + c.conversions, 0);

  const cityCounts = projects.reduce<Record<string, number>>((acc, p) => { acc[p.city] = (acc[p.city] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-finance-900/40 via-dark-900 to-prop-900/40 rounded-2xl p-6 lg:p-8 border border-finance-500/20">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {user ? `Welcome back, ${user.name}!` : 'Your Smart Financial Navigator'}
        </h1>
        <p className="text-dark-400 mt-2 max-w-2xl">Analyze real estate projects in Hubli, Bangalore & Mysore. Get AI-powered financial planning, investment advice, and property management — all in one place.</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link href="/properties" className="btn-primary"><Building2 className="w-4 h-4" /> Browse Properties</Link>
          <Link href="/planner" className="btn-secondary"><Wallet className="w-4 h-4" /> Financial Planner</Link>
          {!user && <Link href="/login" className="btn-secondary">Sign In for Full Access</Link>}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Home, label: 'Total Projects', value: totalProperties.toString(), sub: `${totalCities} cities`, color: 'from-finance-500 to-blue-600' },
          { icon: DollarSign, label: 'Price Range', value: `₹${priceRange.priceMin}L-${priceRange.priceMax < 100 ? '₹' + priceRange.priceMax + 'L' : '₹' + (priceRange.priceMax/100).toFixed(1) + 'Cr'}`, sub: 'Across all cities', color: 'from-prop-500 to-green-600' },
          { icon: Users, label: 'Active Leads', value: activeLeads.toString(), sub: `${sampleLeads.length} total leads`, color: 'from-cyan-500 to-blue-600' },
          { icon: TrendingUp, label: 'Campaign ROI', value: totalConversions.toString(), sub: `${totalLeads} leads generated`, color: 'from-purple-500 to-pink-600' },
        ].map((stat, i) => (
          <div key={i} className="card-hover flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}><stat.icon className="w-5 h-5 text-white" /></div>
            <div><div className="text-xl font-bold text-white">{stat.value}</div><div className="text-xs text-dark-400">{stat.label}</div><div className="text-[10px] text-dark-500 mt-0.5">{stat.sub}</div></div>
          </div>
        ))}
      </div>

      {/* City Breakdown & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Projects by City</h2>
          <div className="space-y-3">
            {Object.entries(cityCounts).map(([city, count]) => {
              const colors: Record<string, string> = { Hubli: 'from-amber-500 to-orange-600', Bangalore: 'from-blue-500 to-indigo-600', Mysore: 'from-emerald-500 to-green-600' };
              const pct = Math.round(count / totalProperties * 100);
              return (
                <div key={city} className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${colors[city] || 'from-gray-500 to-gray-600'}`} />
                  <span className="text-sm text-dark-200 w-24">{city}</span>
                  <div className="flex-1 progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  <span className="text-sm font-medium text-dark-300 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Bot, label: 'AI Advisor', href: '/agents', color: 'from-finance-500 to-indigo-600' },
              { icon: Scale, label: 'Legal Help', href: '/legal', color: 'from-amber-500 to-orange-600' },
              { icon: Megaphone, label: 'Marketing', href: '/marketing', color: 'from-pink-500 to-rose-600' },
              { icon: MessageSquare, label: 'Community', href: '/chat', color: 'from-cyan-500 to-teal-600' },
              { icon: Phone, label: 'Call Logs', href: '/leads', color: 'from-violet-500 to-purple-600' },
              { icon: BarChart3, label: 'Analytics', href: '/marketing', color: 'from-emerald-500 to-green-600' },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="card-hover flex items-center gap-3 p-4 hover:translate-y-[-2px]">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}><action.icon className="w-4.5 h-4.5 text-white" /></div>
                <span className="text-sm font-medium text-dark-200">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Featured Projects</h2>
          <Link href="/properties" className="text-sm text-finance-400 hover:text-finance-300 flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.slice(0, 4).map(p => (
            <Link key={p.id} href={`/properties/${p.id}`} className="card-hover group overflow-hidden">
              <div className="h-32 -mx-5 -mt-5 mb-4 bg-gradient-to-br from-finance-600/30 to-prop-600/30 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent z-10" />
                <div className="relative z-20 p-4 w-full">
                  <span className="badge-blue text-[10px]">{p.city}</span>
                  <h3 className="text-white font-semibold text-sm mt-1 truncate">{p.name}</h3>
                </div>
              </div>
              <p className="text-xs text-dark-400">{p.builder}</p>
              <p className="text-sm font-semibold text-prop-400 mt-1">{p.priceRange}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-dark-500">
                <span>{p.bedrooms}</span>
                <span>•</span>
                <span>{p.areaRange}</span>
                <span>•</span>
                <span className={p.status === 'Ready to Move' ? 'text-green-400' : 'text-yellow-400'}>{p.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Browse Cities */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Browse by City</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { city: 'Hubli', icon: Building2, desc: `${cityCounts.Hubli || 0} projects • Affordable • Growing`, color: 'from-amber-500/20 to-orange-600/20', border: 'border-amber-500/30' },
            { city: 'Bangalore', icon: Building2, desc: `${cityCounts.Bangalore || 0} projects • Premium • IT Hub`, color: 'from-blue-500/20 to-indigo-600/20', border: 'border-blue-500/30' },
            { city: 'Mysore', icon: Building2, desc: `${cityCounts.Mysore || 0} projects • Heritage • Value`, color: 'from-emerald-500/20 to-green-600/20', border: 'border-emerald-500/30' },
          ].map(({ city, icon: Icon, desc, color, border }) => (
            <Link key={city} href={`/properties?city=${city}`} className={`card-hover ${border} bg-gradient-to-br ${color} flex items-start gap-4`}>
              <div className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center"><Icon className="w-5 h-5 text-dark-300" /></div>
              <div><h3 className="text-base font-semibold text-white">{city}</h3><p className="text-xs text-dark-400 mt-0.5">{desc}</p></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
