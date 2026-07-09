import type { MarketingCampaign } from '../types';
import { generateWithAI } from '../utils/openrouter';

const campaignTemplates = [
  {
    name: 'Social Media Growth Campaign',
    type: 'social' as const,
    prompt: 'Write a promotional social media campaign for SleepPost AI - an autonomous social media management tool. Create 3 post variations.',
  },
  {
    name: 'Blog Post: AI Content Creation',
    type: 'blog' as const,
    prompt: 'Write a 200-word blog excerpt about how AI agents are revolutionizing social media management. Include a call to action for SleepPost AI.',
  },
  {
    name: 'Email Drip: Onboarding Sequence',
    type: 'email' as const,
    prompt: 'Write a short welcome email for new SleepPost AI users. Highlight key features: AI avatars, autonomous posting, and analytics.',
  },
  {
    name: 'Ad Copy: Conversion Campaign',
    type: 'ad' as const,
    prompt: 'Write 3 short ad copy variations for SleepPost AI. Focus on the benefit: grow your social media while you sleep.',
  },
  {
    name: 'Content Marketing: Thought Leadership',
    type: 'blog' as const,
    prompt: 'Write a thought leadership piece about the future of autonomous AI agents in marketing. Position SleepPost AI as an innovator.',
  },
];

export async function generateCampaign(): Promise<MarketingCampaign> {
  const template = campaignTemplates[Math.floor(Math.random() * campaignTemplates.length)];

  try {
    const content = await generateWithAI(
      template.prompt,
      'You are a marketing expert writing promotional content for SleepPost AI. Be persuasive but authentic.'
    );

    return {
      id: `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: template.name,
      type: template.type,
      content,
      status: 'active',
      metrics: {
        impressions: Math.floor(Math.random() * 5000),
        clicks: Math.floor(Math.random() * 200),
        conversions: Math.floor(Math.random() * 20),
        revenue: Math.floor(Math.random() * 500),
      },
      createdAt: new Date().toISOString(),
    };
  } catch {
    return {
      id: `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: template.name,
      type: template.type,
      content: generateFallbackContent(template.type),
      status: 'active',
      metrics: {
        impressions: Math.floor(Math.random() * 5000),
        clicks: Math.floor(Math.random() * 200),
        conversions: Math.floor(Math.random() * 20),
        revenue: Math.floor(Math.random() * 500),
      },
      createdAt: new Date().toISOString(),
    };
  }
}

function generateFallbackContent(type: string): string {
  const fallbacks: Record<string, string> = {
    social: 'Stop managing your social media manually. SleepPost AI creates, schedules, and posts content while you sleep. Try it free today.',
    blog: 'The Future of Social Media is Autonomous: How AI agents are changing the way brands create and distribute content online.',
    email: 'Welcome to SleepPost AI! Your autonomous social media manager is ready. Let us set up your first AI avatar and start generating content.',
    ad: 'Grow while you sleep. AI-powered social media management that works 24/7. Start free.',
  };
  return fallbacks[type] || fallbacks.social;
}

export function updateCampaignMetrics(campaign: MarketingCampaign): MarketingCampaign {
  return {
    ...campaign,
    metrics: {
      impressions: campaign.metrics.impressions + Math.floor(Math.random() * 100),
      clicks: campaign.metrics.clicks + Math.floor(Math.random() * 10),
      conversions: campaign.metrics.conversions + (Math.random() > 0.7 ? 1 : 0),
      revenue: campaign.metrics.revenue + Math.floor(Math.random() * 10),
    },
  };
}
