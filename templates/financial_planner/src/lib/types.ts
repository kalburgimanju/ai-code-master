export type City = 'Hubli' | 'Bangalore' | 'Mysore';

export type PropertyType = 'Apartment' | 'Villa' | 'Plot' | 'Penthouse' | 'Commercial';

export type PropertyStatus = 'Ready to Move' | 'Under Construction' | 'Pre-Launch';

export interface ProjectContact {
  salesPhone: string;
  email: string;
  officeAddress: string;
  website: string;
  siteTimings: string;
  salesOffice: string;
}

export interface Project {
  id: string;
  name: string;
  builder: string;
  city: City;
  location: string;
  type: PropertyType;
  status: PropertyStatus;
  priceRange: string;
  priceMin: number; // lakhs
  priceMax: number;
  areaRange: string;
  bedrooms: string;
  description: string;
  amenities: string[];
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  possession?: string;
  rera: string;
  tags: string[];
  coordinates: { lat: number; lng: number };
  contact: ProjectContact;
}

export interface PropertyListing {
  id: string;
  projectId: string;
  type: 'Sale' | 'Rent';
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor: string;
  facing: string;
  description: string;
  listedBy: string;
  contact: string;
  images: string[];
  postedDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: City;
  isLoggedIn: boolean;
}

export interface FinancialProfile {
  monthlySalary: number;
  savings: number;
  monthlyExpenses: number;
  currentEMIs: number;
  emergencyFund: number;
  targetPropertyBudget: number;
  targetSavingsPerMonth: number;
  investmentType: 'Conservative' | 'Moderate' | 'Aggressive';
  riskTolerance: number; // 1-10
  age: number;
  retirementAge: number;
  dependents: number;
}

export type AgentType = 'financial-planner' | 'investment-advisor' | 'legal-expert' | 'marketing-guru' | 'lead-qualifier' | 'property-analyst';

export interface Agent {
  id: AgentType;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  expertise: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  agentType?: AgentType;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  propertyInterest: string;
  budget: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Visit Scheduled' | 'Negotiation' | 'Closed' | 'Lost';
  notes: string;
  assignedAgent: string;
  createdAt: string;
  lastContact: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'Social Media' | 'Google Ads' | 'Email' | 'SMS' | 'Print' | 'Event';
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  status: 'Active' | 'Paused' | 'Completed';
  startDate: string;
  endDate: string;
}

export interface CommunicationPost {
  id: string;
  userId: string;
  userName: string;
  content: string;
  propertyId?: string;
  likes: number;
  shares: number;
  comments: Comment[];
  timestamp: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface LegalOpinionRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  userId: string;
  questions: string;
  opinion: string;
  status: 'Requested' | 'In Progress' | 'Completed';
  createdAt: string;
  completedAt?: string;
}

export interface CallLog {
  id: string;
  leadId?: string;
  leadName: string;
  agentName: string;
  duration: number;
  notes: string;
  outcome: string;
  timestamp: string;
}

export const AGENTS: Agent[] = [
  { id: 'financial-planner', name: 'Financial Planner', title: 'Personal Finance Advisor', description: 'Plan your finances, budget for your dream home, and achieve savings goals with AI-powered insights.', icon: 'Wallet', color: '#6366f1', expertise: ['Budget Planning', 'Goal Setting', 'EMI Calculation', 'Tax Planning'] },
  { id: 'investment-advisor', name: 'Investment Advisor', title: 'Smart Investment Guide', description: 'Get personalized investment advice, compare options, and build a portfolio aligned with your risk tolerance.', icon: 'TrendingUp', color: '#22c55e', expertise: ['Mutual Funds', 'Stocks', 'Fixed Deposits', 'Real Estate'] },
  { id: 'legal-expert', name: 'Legal Expert', title: 'Property Legal Advisor', description: 'Get legal opinions on property documents, RERA compliance, title deeds, and registration processes.', icon: 'Scale', color: '#f59e0b', expertise: ['Title Deeds', 'RERA Compliance', 'Registration', 'Due Diligence'] },
  { id: 'marketing-guru', name: 'Marketing Guru', title: 'Real Estate Marketing Strategist', description: 'Plan marketing campaigns, budget allocation, lead generation strategies, and ROI optimization.', icon: 'Megaphone', color: '#ec4899', expertise: ['Campaign Planning', 'Budget Allocation', 'Lead Gen', 'ROI Analysis'] },
  { id: 'lead-qualifier', name: 'Lead Qualifier', title: 'AI Lead Scoring & Follow-up', description: 'Automatically score leads, schedule follow-ups, and prioritize high-intent buyers for your team.', icon: 'Users', color: '#06b6d4', expertise: ['Lead Scoring', 'Follow-up Automation', 'Priority Ranking', 'Conversion'] },
  { id: 'property-analyst', name: 'Property Analyst', title: 'Real Estate Market Analyst', description: 'Analyze property values, market trends, ROI potential, and compare projects across cities.', icon: 'BarChart3', color: '#f97316', expertise: ['Market Analysis', 'Price Trends', 'ROI Calculator', 'City Comparison'] },
];
