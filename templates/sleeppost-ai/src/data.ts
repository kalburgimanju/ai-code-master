import type { PricingTier, Feature, Testimonial } from './types';

export const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for trying out AI-powered social media management.',
    posts: '3 posts/week',
    avatars: '1 avatar',
    features: [
      '1 AI Avatar',
      '3 posts per week',
      'Basic content generation',
      'Twitter & Instagram',
      'Community support',
    ],
    cta: 'Get Started Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    annualPrice: 290,
    description: 'For creators who want unlimited AI-powered content.',
    posts: 'Unlimited posts',
    avatars: '5 avatars',
    features: [
      '5 AI Avatars',
      'Unlimited posts',
      'Advanced AI content',
      'All 5 platforms',
      'Smart scheduling',
      'Analytics dashboard',
      'Priority support',
      'Custom branding',
    ],
    highlighted: true,
    cta: 'Start Pro Trial',
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 99,
    annualPrice: 990,
    description: 'For teams and agencies managing multiple brands.',
    posts: 'Unlimited + API',
    avatars: 'Unlimited',
    features: [
      'Unlimited Avatars',
      'Unlimited posts',
      'GPT-4 powered content',
      'All platforms + API',
      'Team collaboration',
      'White-label option',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
  },
];

export const features: Feature[] = [
  {
    icon: 'sparkles',
    title: 'AI Avatar Generation',
    description: 'Create unique, stunning avatars in 5 styles. Each avatar is uniquely generated to represent your brand.',
  },
  {
    icon: 'bot',
    title: 'Autonomous Content Agent',
    description: 'Our AI creates engaging posts, captions, and hashtags tailored to each platform — 24/7.',
  },
  {
    icon: 'megaphone',
    title: 'Self-Marketing Agent',
    description: 'The marketing agent autonomously promotes your brand, creates campaigns, and tracks performance.',
  },
  {
    icon: 'clock',
    title: 'Smart Scheduling',
    description: 'AI picks the optimal posting times for each platform to maximize engagement.',
  },
  {
    icon: 'trending-up',
    title: 'Revenue Automation',
    description: 'Track earnings, manage subscriptions, and optimize pricing with AI-driven insights.',
  },
  {
    icon: 'shield',
    title: 'Platform Safe',
    description: 'Built-in rate limiting and content guidelines to keep your accounts safe and compliant.',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Content Creator',
    company: '100K+ followers',
    quote: 'SleepPost AI changed my life. I set it up before bed and wake up to 50+ engagement notifications. My growth has tripled in 2 months.',
    rating: 5,
    avatar: 'SC',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Startup Founder',
    company: 'TechFlow',
    quote: 'We used to spend $3K/month on social media management. SleepPost AI does it better for a fraction of the cost. The marketing agent is incredible.',
    rating: 5,
    avatar: 'MJ',
  },
  {
    id: '3',
    name: 'Priya Sharma',
    role: 'Digital Agency Owner',
    company: 'GrowthFirst',
    quote: 'Managing 15 client accounts was impossible. Now the AI agents handle content creation and scheduling while I focus on strategy.',
    rating: 5,
    avatar: 'PS',
  },
  {
    id: '4',
    name: 'Alex Rivera',
    role: 'E-commerce Brand',
    company: 'StyleNest',
    quote: 'The avatar generation alone is worth it. We created 8 brand personas and the AI posts unique content for each. Revenue up 40%.',
    rating: 5,
    avatar: 'AR',
  },
];

export const faqs = [
  {
    q: 'How does the AI content generation work?',
    a: 'Our agents use advanced language models via OpenRouter to generate platform-specific content. Each post is crafted with relevant hashtags, optimal formatting, and an engaging tone tailored to your brand voice.',
  },
  {
    q: 'Is my social media account safe?',
    a: 'Absolutely. We use built-in rate limiting, content guidelines, and platform-compliant posting patterns. Your credentials are stored locally and never shared with third parties.',
  },
  {
    q: 'Can I customize the content style?',
    a: 'Yes! You can set your brand voice, preferred topics, content tone, and even specific keywords or phrases. The AI learns your style and improves over time.',
  },
  {
    q: 'What platforms are supported?',
    a: 'We support Twitter/X, Instagram, LinkedIn, Facebook, and TikTok. Each platform gets optimized content formatting and scheduling.',
  },
  {
    q: 'How do the autonomous agents work?',
    a: 'Our 4 agents — Content, Marketing, Revenue, and Scheduler — run continuously in the background. They generate posts, create marketing campaigns, track revenue, and schedule content at optimal times.',
  },
  {
    q: 'Can I try before I buy?',
    a: 'Yes! Our free tier gives you 1 avatar and 3 posts per week. Upgrade to Pro for unlimited content and advanced features.',
  },
  {
    q: 'Do I need to provide my own API key?',
    a: 'The app works with a free tier using simulated content. For real AI-generated content, you can add your OpenRouter API key (free tier available) in Settings.',
  },
];

export const stats = [
  { label: 'Posts Generated', value: '2.4M+' },
  { label: 'Active Avatars', value: '18,000+' },
  { label: 'Content Creators', value: '5,200+' },
  { label: 'Engagement Boost', value: '+340%' },
];

export const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];
