import type { AgentTemplate, PricingTier, Feature, Testimonial, Conversation } from './types';

export const agentTemplates: AgentTemplate[] = [
  {
    id: 'support',
    name: 'Support Agent',
    role: 'Customer Support',
    description: 'Handles customer queries 24/7 with empathy and precision.',
    icon: 'headphones',
    color: 'from-blue-500 to-cyan-500',
    defaultPrompt: 'You are a friendly customer support agent. Answer questions about our products and services, help resolve issues, and escalate complex cases to human agents when needed. Always be empathetic and professional.',
    category: 'Support',
  },
  {
    id: 'sales',
    name: 'Sales Closer',
    role: 'Sales',
    description: 'Qualifies leads, answers objections, and books demos.',
    icon: 'trending-up',
    color: 'from-emerald-500 to-teal-500',
    defaultPrompt: 'You are a skilled sales development representative. Your goal is to qualify inbound leads, understand their needs, address objections, and book a demo call. Be persuasive but not pushy.',
    category: 'Sales',
  },
  {
    id: 'hr',
    name: 'HR Assistant',
    role: 'Human Resources',
    description: 'Onboarding, policies, leave management, and employee queries.',
    icon: 'users',
    color: 'from-purple-500 to-pink-500',
    defaultPrompt: 'You are an HR assistant. Help employees with onboarding questions, explain company policies, manage leave requests, and provide information about benefits. Be warm and helpful.',
    category: 'HR',
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    role: 'Analytics',
    description: 'Answers business questions from your data in plain English.',
    icon: 'bar-chart-3',
    color: 'from-orange-500 to-amber-500',
    defaultPrompt: 'You are a data analyst. Users will ask you questions about their business data. You have access to their sales, marketing, and operations data. Provide clear, actionable insights with supporting numbers.',
    category: 'Analytics',
  },
];

export const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 2999,
    annualPrice: 2399,
    description: 'Perfect for small businesses getting started with AI.',
    employees: 1,
    messages: 5000,
    features: [
      '1 AI Employee',
      '5,000 messages/month',
      'Web widget embed',
      'Basic analytics',
      'Email support',
      'Knowledge base upload',
    ],
    cta: 'Start Free Trial',
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 7999,
    annualPrice: 6399,
    description: 'For growing teams that need multiple AI employees.',
    employees: 3,
    messages: 25000,
    features: [
      '3 AI Employees',
      '25,000 messages/month',
      'Web + Slack + WhatsApp',
      'Advanced analytics dashboard',
      'Priority support',
      'API access',
      'Custom branding',
      'Human handoff',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 24999,
    annualPrice: 19999,
    description: 'For organizations that need custom AI at scale.',
    employees: 10,
    messages: 100000,
    features: [
      '10 AI Employees',
      '100,000 messages/month',
      'All channels + custom integrations',
      'Real-time analytics',
      'Dedicated support manager',
      'Custom model fine-tuning',
      'SLA guarantee (99.9%)',
      'White-label option',
      'Webhook integrations',
      'SSO & advanced security',
    ],
    cta: 'Contact Sales',
  },
];

export const features: Feature[] = [
  {
    icon: 'message-square',
    title: 'Natural Language Training',
    description: 'Train your AI employee with a simple prompt. No coding required — just describe the role like you would to a new hire.',
  },
  {
    icon: 'globe',
    title: 'Multi-Channel Deploy',
    description: 'Embed on your website, connect to Slack, WhatsApp, or use the API. Your AI employee works everywhere your customers are.',
  },
  {
    icon: 'bar-chart-3',
    title: 'Analytics Dashboard',
    description: 'Track conversations, resolution rates, response times, and customer satisfaction in real-time.',
  },
  {
    icon: 'database',
    title: 'Knowledge Base Integration',
    description: 'Upload docs, paste FAQs, or connect URLs. Your AI employee learns from your content to give accurate answers.',
  },
  {
    icon: 'users',
    title: 'Human Handoff',
    description: 'When the AI can\'t help, it seamlessly transfers the conversation to a human agent with full context.',
  },
  {
    icon: 'palette',
    title: 'Custom Branding',
    description: 'Match the widget to your brand colors, logo, and voice. Your customers won\'t know it\'s AI.',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Mehta',
    role: 'Head of Support',
    company: 'QuickCommerce',
    quote: 'We replaced our entire night shift support team with one AI employee. Response time dropped from 2 hours to 8 seconds. Our CSAT score actually went up.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Arjun Nair',
    role: 'Founder & CEO',
    company: 'GrowthStack',
    quote: 'Our AI sales agent books 30+ demos per week on autopilot. It qualifies leads better than most SDRs I\'ve hired. The ROI was visible in week one.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Sneha Patel',
    role: 'VP of Operations',
    company: 'TechFlow India',
    quote: 'Onboarding new hires used to take 2 weeks of HR time. Now our AI HR assistant handles it in 2 days. HR team focuses on culture instead of paperwork.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Vikram Singh',
    role: 'CTO',
    company: 'DataPulse',
    quote: 'Our data analyst AI answers 200+ queries per day from the sales team. They stopped bugging the data engineering team for simple reports.',
    rating: 5,
  },
];

export const faqs = [
  {
    q: 'How does the AI employee actually work?',
    a: 'You provide a system prompt describing the role, personality, and knowledge. Our platform uses this to create a fine-tuned AI agent that handles conversations autonomously. It learns from your knowledge base and improves over time.',
  },
  {
    q: 'Do I need coding skills?',
    a: 'Not at all. The entire process is prompt-based. Describe what you want the AI employee to do in plain English, and our platform builds the agent for you. Embedding it on your site is a one-line code snippet.',
  },
  {
    q: 'Can the AI handle complex queries?',
    a: 'Yes. Our agents use advanced language models with your knowledge base for context. For truly complex cases, the human handoff feature seamlessly transfers the conversation to your team with full context.',
  },
  {
    q: 'What happens when the AI doesn\'t know the answer?',
    a: 'The agent will either: (1) search your knowledge base for relevant information, (2) ask clarifying questions, or (3) trigger a human handoff. It never makes up answers.',
  },
  {
    q: 'Can I customize the AI\'s personality?',
    a: 'Absolutely. In the prompt step, you can set the tone (professional, friendly, casual), response style, and even specific phrases or formats the agent should use.',
  },
  {
    q: 'Is my data secure?',
    a: 'We\'re SOC 2 compliant. All data is encrypted at rest and in transit. Your knowledge base and conversations are isolated to your account. We never train on your data.',
  },
  {
    q: 'Can I try before I buy?',
    a: 'Yes! Every plan comes with a 14-day free trial. No credit card required. Create your AI employee, test it with real conversations, and only pay when you\'re satisfied.',
  },
  {
    q: 'What integrations do you support?',
    a: 'Starter: Web widget. Growth: Web + Slack + WhatsApp. Enterprise: Everything plus custom API integrations, webhooks, and CRM connectors.',
  },
];

export const demoConversations: Conversation[] = [
  {
    id: '1',
    user: 'Rahul K.',
    message: 'Hi, I need help with my order #4521',
    response: 'Hi Rahul! I can see your order #4521 was shipped yesterday and is expected to arrive by June 30. Would you like the tracking link?',
    timestamp: '2 min ago',
    resolved: true,
  },
  {
    id: '2',
    user: 'Sneha M.',
    message: 'What\'s your return policy?',
    response: 'Our return policy allows returns within 30 days of delivery. Items must be unused and in original packaging. I can initiate a return for you if needed!',
    timestamp: '5 min ago',
    resolved: true,
  },
  {
    id: '3',
    user: 'Amit T.',
    message: 'I want to schedule a demo for your enterprise plan',
    response: 'Great choice, Amit! I\'d love to set that up. What day and time works best for you this week? I\'ll send a calendar invite.',
    timestamp: '12 min ago',
    resolved: false,
  },
  {
    id: '4',
    user: 'Priya S.',
    message: 'How do I reset my password?',
    response: 'You can reset your password by going to Settings > Security > Reset Password. I\'ll send the reset link to your registered email right now.',
    timestamp: '18 min ago',
    resolved: true,
  },
];

export const stats = [
  { label: 'AI Employees Deployed', value: '1,200+' },
  { label: 'Messages Handled', value: '2.4M+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Avg Response Time', value: '<1s' },
];

export const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];
