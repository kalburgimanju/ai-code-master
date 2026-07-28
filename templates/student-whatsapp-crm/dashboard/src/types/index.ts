export interface Student {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  course?: string;
  currentProfession?: string;
  leadSource?: string;
  status: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  message?: string;
  status: string;
  createdAt: string;
}

export interface Message {
  id: string;
  studentId: string;
  campaignId?: string;
  status: string;
  body?: string;
  provider?: string;
  opened: boolean;
  replied: boolean;
  clicked: boolean;
  sentAt: string;
}

export interface Workflow {
  id: string;
  name: string;
  jsonConfig: string;
  status: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  city?: string;
  role: string;
}

export interface Conversation {
  id: string;
  studentId: string;
  assignedTo?: string;
  status: string;
  lastMessageAt: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  sender: 'student' | 'counselor' | 'ai';
  body: string;
  authorName?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  providerRef?: string;
  description?: string;
  createdAt: string;
}

export interface AnalyticsOverview {
  students: number;
  messagesSent: number;
  delivered: number;
  deliveryRate: number;
  opened: number;
  clicked: number;
  replied: number;
  responseRate: number;
  enrolled: number;
  paidCount: number;
  enrollmentRate: number;
  revenue: number;
  avgLeadScore: number;
}
