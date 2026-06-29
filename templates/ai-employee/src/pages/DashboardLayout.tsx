import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Bot, Activity, Settings, Zap, Search, Bell } from 'lucide-react';
import { useAgentContext } from '../context/AgentContext';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { to: '/dashboard/agents', icon: <Bot size={18} />, label: 'Agents' },
  { to: '/dashboard/activity', icon: <Activity size={18} />, label: 'Activity' },
  { to: '/dashboard/settings', icon: <Settings size={18} />, label: 'Settings' },
];

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { activityFeed, agents } = useAgentContext();
  const recentCount = activityFeed.filter((e) => Date.now() - e.timestamp < 60000).length;

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-dark-900 border-r border-white/5 flex flex-col transition-all duration-300 shrink-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          {sidebarOpen && (
            <a href="/" className="flex items-center gap-2 font-bold text-lg">
              <Zap size={22} className="text-brand-400" />
              <span className="text-brand-400">MyAI</span>
              <span className="text-white">Employee</span>
            </a>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-dark-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarOpen ? (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                } ${!sidebarOpen ? 'justify-center' : ''}`
              }
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Agent count badge */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/5">
            <div className="glass-card p-3 text-center">
              <p className="text-xs text-dark-400">Active Agents</p>
              <p className="text-2xl font-bold text-brand-400">{agents.filter((a) => a.status === 'active').length}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
              <input
                type="text"
                placeholder="Search agents, conversations..."
                className="w-64 bg-dark-800 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-dark-500 outline-none focus:border-brand-500/30"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-dark-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              <Bell size={20} />
              {recentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full text-[10px] font-bold text-dark-900 flex items-center justify-center">
                  {recentCount > 9 ? '9+' : recentCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-emerald-300 flex items-center justify-center text-dark-900 font-bold text-sm">
              U
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
