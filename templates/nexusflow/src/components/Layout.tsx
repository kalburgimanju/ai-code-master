import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Workflow,
  Settings,
  Play,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/workflows', icon: Workflow, label: 'Workflows' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/workflow/') && location.pathname !== '/workflows';

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* Top Bar */}
      <header className="h-14 border-b border-surface-800 flex items-center justify-between px-4 bg-surface-900/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-nexus-600 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-white">NexusFlow</span>
          </div>
          {!isEditor && (
            <nav className="hidden md:flex items-center gap-1 ml-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-nexus-600/20 text-nexus-400'
                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
