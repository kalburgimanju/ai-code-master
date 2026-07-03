'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import {
  Play, FileText, Mic, Video, User, Sparkles,
  LogOut, FolderPlus, ChevronDown, Zap, Bot
} from 'lucide-react';
import { DashboardTab } from '@/types';

const tabs: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
  { id: 'scripts', label: 'Scripts', icon: FileText },
  { id: 'audio', label: 'Audio', icon: Mic },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'avatars', label: 'Avatars', icon: User },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'generate', label: 'Generate', icon: Sparkles },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, activeTab, currentProject, agents, generations, setActiveTab, logout } = useStore();

  function handleLogout() {
    localStorage.removeItem('token');
    logout();
    router.push('/');
  }

  const activeGenerations = generations.filter((g) => g.status === 'generating' || g.status === 'queued');

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 border-r border-dark-500/50 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="h-16 border-b border-dark-500/50 px-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Play className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">AI Video Studio</span>
        </div>

        {/* Project */}
        <div className="px-3 py-3 border-b border-dark-500/50">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-dark-700/50 border border-dark-500/50">
            <FolderPlus className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-gray-300 truncate flex-1">
              {currentProject?.name || 'No Project'}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'generate' && activeGenerations.length > 0 && (
                <span className="ml-auto badge-green text-[10px]">{activeGenerations.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Agents Status */}
        <div className="px-3 py-3 border-t border-dark-500/50">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 px-2">
            Agents
          </div>
          <div className="space-y-1.5">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-dark-700/50"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    agent.status === 'idle'
                      ? 'bg-emerald-400'
                      : agent.status === 'busy'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-gray-500'
                  }`}
                />
                <span className="text-xs text-gray-400 truncate">{agent.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User / Logout */}
        <div className="px-3 py-3 border-t border-dark-500/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-400">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-300 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-dark-500/50 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-white capitalize">{activeTab}</h1>
            {activeGenerations.length > 0 && (
              <div className="flex items-center gap-1.5 bg-primary-600/10 border border-primary-500/20 rounded-full px-3 py-1">
                <Zap className="w-3 h-3 text-primary-400 animate-pulse" />
                <span className="text-xs text-primary-300">
                  {activeGenerations.length} generating
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            {agents.filter((a) => a.status === 'idle').length}/{agents.length} agents ready
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
