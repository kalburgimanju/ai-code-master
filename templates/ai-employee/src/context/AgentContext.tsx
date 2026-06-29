import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AIEmployee, ActivityEvent, DashboardStats } from '../types';

interface AgentContextType {
  agents: AIEmployee[];
  activityFeed: ActivityEvent[];
  stats: DashboardStats;
  addAgent: (agent: AIEmployee) => void;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<AIEmployee>) => void;
  addActivity: (event: ActivityEvent) => void;
}

const defaultStats: DashboardStats = {
  totalConversations: 0,
  messagesToday: 0,
  activeAgents: 0,
  avgResolutionRate: 0,
  avgResponseTime: 0,
  conversationsPerHour: 0,
  messagesTrend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  resolutionTrend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  responseTimeTrend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

const AgentContext = createContext<AgentContextType | null>(null);

export const useAgentContext = () => {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgentContext must be used within AgentProvider');
  return ctx;
};

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<AIEmployee[]>(() =>
    loadFromStorage('myai_agents', [])
  );
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>(() =>
    loadFromStorage('myai_activity', [])
  );

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('myai_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('myai_activity', JSON.stringify(activityFeed.slice(0, 100)));
  }, [activityFeed]);

  const addAgent = useCallback((agent: AIEmployee) => {
    setAgents((prev) => [...prev, agent]);
  }, []);

  const removeAgent = useCallback((id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAgent = useCallback((id: string, updates: Partial<AIEmployee>) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const addActivity = useCallback((event: ActivityEvent) => {
    setActivityFeed((prev) => [event, ...prev].slice(0, 100));
  }, []);

  // Compute stats from live data
  const stats: DashboardStats = {
    totalConversations: agents.reduce((sum, a) => sum + a.conversations, 0),
    messagesToday: activityFeed.filter(
      (e) => Date.now() - e.timestamp < 24 * 60 * 60 * 1000
    ).length,
    activeAgents: agents.filter((a) => a.status === 'active').length,
    avgResolutionRate:
      agents.length > 0
        ? Math.round(agents.reduce((s, a) => s + a.resolutionRate, 0) / agents.length)
        : 0,
    avgResponseTime:
      agents.length > 0
        ? parseFloat(
            (
              agents.reduce(
                (s, a) => s + parseFloat(a.avgResponseTime),
                0
              ) / agents.length
            ).toFixed(1)
          )
        : 0,
    conversationsPerHour: Math.round(
      activityFeed.filter((e) => Date.now() - e.timestamp < 3600000).length
    ),
    messagesTrend: generateTrend(agents.reduce((s, a) => s + a.conversations, 0)),
    resolutionTrend: agents.map((a) => a.resolutionRate),
    responseTimeTrend: agents.map((a) => parseFloat(a.avgResponseTime)),
  };

  return (
    <AgentContext.Provider
      value={{
        agents,
        activityFeed,
        stats,
        addAgent,
        removeAgent,
        updateAgent,
        addActivity,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

function generateTrend(total: number): number[] {
  const points = 12;
  const base = Math.floor(total / points);
  return Array.from({ length: points }, (_, i) => {
    const variation = Math.floor(Math.random() * base * 0.3);
    return base + variation;
  });
}
