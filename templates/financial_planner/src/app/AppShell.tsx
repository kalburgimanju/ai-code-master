'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Wallet, Bot, Users, Megaphone, Scale, MessageSquare, LogIn, LogOut, Menu, X, Phone, User, Settings, Key, Store } from 'lucide-react';
import { getItem, setItem, USER_KEY } from '@/lib/storage';
import type { User as UserType } from '@/lib/types';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/properties', icon: Building2, label: 'Properties' },
  { href: '/planner', icon: Wallet, label: 'Financial Planner' },
  { href: '/agents', icon: Bot, label: 'AI Agents' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/marketing', icon: Megaphone, label: 'Marketing' },
  { href: '/marketplace', icon: Store, label: 'Marketplace' },
  { href: '/legal', icon: Scale, label: 'Legal' },
  { href: '/chat', icon: MessageSquare, label: 'Community' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setUser(getItem(USER_KEY, null));
    const settings = getItem('settings', { openRouterKey: '' });
    if (settings.openRouterKey) setApiKey(settings.openRouterKey);
  }, []);

  const handleSaveSettings = () => {
    const settings = getItem('settings', { openRouterKey: '' });
    settings.openRouterKey = apiKey;
    setItem('settings', settings);
    setSettingsOpen(false);
  };

  const isLoginPage = pathname === '/login';

  const handleLogout = () => {
    setItem(USER_KEY, null);
    setUser(null);
  };

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-64 bg-dark-900/90 backdrop-blur-md border-r border-dark-800 flex flex-col shrink-0 ${mobileOpen ? 'fixed inset-0 z-50' : 'hidden lg:flex'}`}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-dark-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-finance-500 to-prop-500 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">FinPlanner</span>
            <span className="text-[10px] text-dark-500 block leading-tight">Real Estate & Finance</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto p-1 text-dark-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === href || (pathname.startsWith(href) && href !== '/')
                  ? 'bg-finance-600/20 text-finance-400 border border-finance-500/20'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800 border border-transparent'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-dark-800">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-finance-600/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-finance-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-dark-200 truncate">{user.name}</div>
                  <div className="text-[10px] text-dark-500 truncate">{user.email}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-ghost w-full justify-center text-xs gap-1.5 text-red-400 hover:text-red-300"><LogOut className="w-3.5 h-3.5" /> Logout</button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary w-full justify-center text-sm"><LogIn className="w-4 h-4" /> Sign In</Link>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-dark-800 bg-dark-900/60 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 text-dark-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm text-dark-400">Welcome{user ? `, ${user.name}` : ''} 👋</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSettingsOpen(true)} className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-dark-600 bg-dark-800 px-2 py-1 rounded-full">Hubli • Bangalore • Mysore</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-finance-400" /> Settings
              </h2>
              <button onClick={() => setSettingsOpen(false)} className="p-1 text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-300 flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-finance-400" /> OpenRouter API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-finance-500 transition-all"
                />
                <p className="text-[10px] text-dark-500 mt-2">
                  Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-finance-400 hover:underline">openrouter.ai/keys</a>
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setSettingsOpen(false)} className="flex-1 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl text-sm text-dark-300 transition-all">
                  Cancel
                </button>
                <button onClick={handleSaveSettings} className="flex-1 px-4 py-2.5 bg-finance-600 hover:bg-finance-500 rounded-xl text-sm text-white font-medium transition-all">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
