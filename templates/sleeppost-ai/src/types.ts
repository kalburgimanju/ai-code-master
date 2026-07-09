export type AvatarStyle = 'professional' | 'creative' | 'fantasy' | 'minimal' | 'cyberpunk';

export type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok';

export type AgentType = 'content' | 'marketing' | 'revenue' | 'scheduler';

export type PostStatus = 'draft' | 'scheduled' | 'posted' | 'failed';

export interface Avatar {
  id: string;
  name: string;
  style: AvatarStyle;
  svgData: string;
  platforms: Platform[];
  createdAt: string;
  postsGenerated: number;
}

export interface SocialPost {
  id: string;
  avatarId: string;
  avatarName: string;
  content: string;
  hashtags: string[];
  platform: Platform;
  scheduledAt?: string;
  postedAt?: string;
  status: PostStatus;
  engagement: EngagementMetrics;
  generatedBy: string;
  createdAt: string;
}

export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: 'running' | 'paused' | 'idle';
  tasksCompleted: number;
  lastActive: string;
  description: string;
  icon: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'blog' | 'social' | 'email' | 'ad';
  content: string;
  status: 'draft' | 'active' | 'completed';
  metrics: CampaignMetrics;
  createdAt: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface RevenueMetrics {
  totalEarnings: number;
  monthlyRecurring: number;
  activeSubscribers: number;
  conversionRate: number;
  churnRate: number;
  ltv: number;
  dailyRevenue: number[];
  monthlyRevenue: number[];
}

export interface DashboardStats {
  totalPosts: number;
  postsToday: number;
  totalEngagement: number;
  activeAvatars: number;
  agentsRunning: number;
  revenue: number;
}

export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  posts: string;
  avatars: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatar: string;
}

export interface ActivityEvent {
  id: string;
  agentName: string;
  agentType: AgentType;
  action: string;
  details: string;
  timestamp: number;
}
