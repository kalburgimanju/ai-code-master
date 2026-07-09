import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Moon, LayoutDashboard, Image, FileText, Megaphone, DollarSign, Settings, Menu, X } from 'lucide-react';
import { useContentAgent } from '../hooks/useContentAgent';
import { useMarketingAgent } from '../hooks/useMarketingAgent';
import { useRevenueAgent } from '../hooks/useRevenueAgent';
import { useSchedulerAgent } from '../hooks/useSchedulerAgent';

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/avatars', label: 'Avatars', icon: Image },
  { path: '/dashboard/content', label: 'Content', icon: FileText },
  { path: '/dashboard/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/dashboard/revenue', label: 'Revenue', icon: DollarSign },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Activate all agents
  useContentAgent();
  useMarketingAgent();
  useRevenueAgent();
  useSchedulerAgent();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden glass rounded-xl p-2 text-gray-400 hover:text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 glass border-r border-white/5 z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <Moon size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Sleep<span className="gradient-text">Post</span></span>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-400 font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <div>
              <p className="text-white text-sm font-medium">User</p>
              <p className="text-gray-500 text-xs">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
