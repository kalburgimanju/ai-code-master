import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Avatar, SocialPost, Agent, MarketingCampaign, RevenueMetrics, ActivityEvent, DashboardStats } from '../types';

interface AppContextType {
  // Avatars
  avatars: Avatar[];
  addAvatar: (avatar: Avatar) => void;
  removeAvatar: (id: string) => void;
  updateAvatar: (id: string, updates: Partial<Avatar>) => void;

  // Posts
  posts: SocialPost[];
  addPost: (post: SocialPost) => void;
  addPosts: (newPosts: SocialPost[]) => void;
  updatePost: (id: string, updates: Partial<SocialPost>) => void;

  // Agents
  agents: Agent[];
  updateAgent: (id: string, updates: Partial<Agent>) => void;

  // Marketing
  campaigns: MarketingCampaign[];
  addCampaign: (campaign: MarketingCampaign) => void;
  updateCampaign: (id: string, updates: Partial<MarketingCampaign>) => void;

  // Revenue
  revenue: RevenueMetrics;

  // Activity
  activity: ActivityEvent[];
  addActivity: (event: ActivityEvent) => void;

  // Stats
  stats: DashboardStats;

  // API
  apiKey: string;
  setApiKey: (key: string) => void;
}

const defaultAgents: Agent[] = [
  {
    id: 'content-agent',
    name: 'Content Creator',
    type: 'content',
    status: 'running',
    tasksCompleted: 0,
    lastActive: new Date().toISOString(),
    description: 'Generates social media posts, captions, and hashtags',
    icon: 'sparkles',
  },
  {
    id: 'marketing-agent',
    name: 'Marketing Manager',
    type: 'marketing',
    status: 'running',
    tasksCompleted: 0,
    lastActive: new Date().toISOString(),
    description: 'Creates campaigns and promotes your brand',
    icon: 'megaphone',
  },
  {
    id: 'revenue-agent',
    name: 'Revenue Analyst',
    type: 'revenue',
    status: 'running',
    tasksCompleted: 0,
    lastActive: new Date().toISOString(),
    description: 'Tracks earnings and optimizes pricing',
    icon: 'dollar-sign',
  },
  {
    id: 'scheduler-agent',
    name: 'Post Scheduler',
    type: 'scheduler',
    status: 'running',
    tasksCompleted: 0,
    lastActive: new Date().toISOString(),
    description: 'Schedules posts at optimal times',
    icon: 'clock',
  },
];

const defaultRevenue: RevenueMetrics = {
  totalEarnings: 0,
  monthlyRecurring: 0,
  activeSubscribers: 0,
  conversionRate: 0,
  churnRate: 0,
  ltv: 0,
  dailyRevenue: Array.from({ length: 30 }, () => 0),
  monthlyRevenue: Array.from({ length: 12 }, () => 0),
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [avatars, setAvatars] = useState<Avatar[]>(() =>
    loadFromStorage('sleeppost_avatars', [])
  );
  const [posts, setPosts] = useState<SocialPost[]>(() =>
    loadFromStorage('sleeppost_posts', [])
  );
  const [agents] = useState<Agent[]>(defaultAgents);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() =>
    loadFromStorage('sleeppost_campaigns', [])
  );
  const [revenue, setRevenue] = useState<RevenueMetrics>(() =>
    loadFromStorage('sleeppost_revenue', defaultRevenue)
  );
  const [activity, setActivity] = useState<ActivityEvent[]>(() =>
    loadFromStorage('sleeppost_activity', [])
  );
  const [apiKeyState, setApiKeyState] = useState(() =>
    loadFromStorage('sleeppost_api_key', '')
  );

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('sleeppost_avatars', JSON.stringify(avatars)); }, [avatars]);
  useEffect(() => { localStorage.setItem('sleeppost_posts', JSON.stringify(posts.slice(0, 200))); }, [posts]);
  useEffect(() => { localStorage.setItem('sleeppost_campaigns', JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem('sleeppost_revenue', JSON.stringify(revenue)); }, [revenue]);
  useEffect(() => { localStorage.setItem('sleeppost_activity', JSON.stringify(activity.slice(0, 100))); }, [activity]);

  const addAvatar = useCallback((avatar: Avatar) => {
    setAvatars(prev => [...prev, avatar]);
  }, []);

  const removeAvatar = useCallback((id: string) => {
    setAvatars(prev => prev.filter(a => a.id !== id));
  }, []);

  const updateAvatar = useCallback((id: string, updates: Partial<Avatar>) => {
    setAvatars(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const addPost = useCallback((post: SocialPost) => {
    setPosts(prev => [post, ...prev]);
  }, []);

  const addPosts = useCallback((newPosts: SocialPost[]) => {
    setPosts(prev => [...newPosts, ...prev].slice(0, 200));
  }, []);

  const updatePost = useCallback((id: string, updates: Partial<SocialPost>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const updateAgent = useCallback((_id: string, _updates: Partial<Agent>) => {
    // Agent state is managed internally
  }, []);

  const addCampaign = useCallback((campaign: MarketingCampaign) => {
    setCampaigns(prev => [campaign, ...prev]);
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<MarketingCampaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const addActivity = useCallback((event: ActivityEvent) => {
    setActivity(prev => [event, ...prev].slice(0, 100));
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem('sleeppost_api_key', key);
  }, []);

  // Compute stats
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const stats: DashboardStats = {
    totalPosts: posts.length,
    postsToday: posts.filter(p => new Date(p.createdAt) >= todayStart).length,
    totalEngagement: posts.reduce((sum, p) =>
      sum + p.engagement.likes + p.engagement.comments + p.engagement.shares, 0
    ),
    activeAvatars: avatars.length,
    agentsRunning: agents.filter(a => a.status === 'running').length,
    revenue: revenue.totalEarnings,
  };

  // Update revenue periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue(prev => {
        const newSubscribers = prev.activeSubscribers + (Math.random() > 0.7 ? 1 : 0);
        const monthlyRevenue = newSubscribers * 29;
        const daily = [...prev.dailyRevenue.slice(1), monthlyRevenue / 30 + Math.random() * 5];

        return {
          ...prev,
          totalEarnings: prev.totalEarnings + Math.random() * 2,
          monthlyRecurring: monthlyRevenue,
          activeSubscribers: newSubscribers,
          conversionRate: Math.min(15, prev.conversionRate + (Math.random() > 0.5 ? 0.1 : -0.05)),
          churnRate: Math.max(1, Math.min(5, prev.churnRate + (Math.random() > 0.5 ? 0.05 : -0.03))),
          ltv: monthlyRevenue > 0 ? Math.round(monthlyRevenue / Math.max(1, prev.churnRate / 100)) : 0,
          dailyRevenue: daily,
        };
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        avatars, addAvatar, removeAvatar, updateAvatar,
        posts, addPost, addPosts, updatePost,
        agents, updateAgent,
        campaigns, addCampaign, updateCampaign,
        revenue,
        activity, addActivity,
        stats,
        apiKey: apiKeyState, setApiKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
