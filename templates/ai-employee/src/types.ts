export interface AIEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  status: 'active' | 'inactive' | 'training';
  conversations: number;
  resolutionRate: number;
  avgResponseTime: string;
  createdAt: string;
  systemPrompt: string;
  knowledgeBase: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  defaultPrompt: string;
  category: string;
}

export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  employees: number;
  messages: number;
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
}

export interface Conversation {
  id: string;
  user: string;
  message: string;
  response: string;
  timestamp: string;
  resolved: boolean;
}

export type WizardStep = 'role' | 'prompt' | 'knowledge' | 'launch';

export interface ActivityEvent {
  id: string;
  agentId: string;
  agentName: string;
  user: string;
  message: string;
  response: string;
  timestamp: number;
  resolved: boolean;
  duration: number;
}

export interface DashboardStats {
  totalConversations: number;
  messagesToday: number;
  activeAgents: number;
  avgResolutionRate: number;
  avgResponseTime: number;
  conversationsPerHour: number;
  messagesTrend: number[];
  resolutionTrend: number[];
  responseTimeTrend: number[];
}

export interface AgentSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  humanHandoff: boolean;
}
