"""Sidebar navigation for the AI Job Scraper dashboard."""

import { Bot, Play, Mail, Settings, Users, BarChart3, Download, Upload, CreditCard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Bot, label: 'Dashboard' },
    { path: '/scraper', icon: Play, label: 'Run Scraper' },
    { path: '/email', icon: Mail, label: 'Email Settings' },
    { path: '/bulk-actions', icon: Users, label: 'Bulk Actions' },
    { path: '/applications', icon: CreditCard, label: 'Applications' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-6 pl-2">
        <div className="bg-brand-600 text-white p-2 rounded-xl">
          <Bot size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Job Scraper</h2>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-brand-600' : 'text-gray-500'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="px-3 py-2 text-xs text-gray-500">
          Version 1.0.0
        </div>
      </div>
    </aside>
  );
}