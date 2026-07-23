import { NodeDefinition } from './types';

export const NODE_DEFINITIONS: NodeDefinition[] = [
  // ─── TRIGGERS ────────────────────────────────────────────
  {
    type: 'trigger', subtype: 'manual', label: 'Manual Start',
    icon: 'Play', color: '#f59e0b', gradient: 'from-amber-500 to-orange-500',
    description: 'Click to manually trigger this workflow',
    inputs: [], outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {},
  },
  {
    type: 'trigger', subtype: 'schedule', label: 'Schedule',
    icon: 'Clock', color: '#f59e0b', gradient: 'from-amber-500 to-orange-500',
    description: 'Run on a schedule (cron)',
    inputs: [], outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {
      cron: { label: 'Cron Expression', type: 'text', default: '0 9 * * 1-5' },
      timezone: { label: 'Timezone', type: 'select', options: ['Asia/Kolkata', 'UTC', 'America/New_York'], default: 'Asia/Kolkata' },
    },
  },
  {
    type: 'trigger', subtype: 'webhook', label: 'Webhook',
    icon: 'Globe', color: '#f59e0b', gradient: 'from-amber-500 to-orange-500',
    description: 'Trigger via external HTTP request',
    inputs: [], outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {
      url: { label: 'Webhook URL', type: 'text', default: '/api/webhook/trigger' },
    },
  },

  // ─── AI MODELS ───────────────────────────────────────────
  {
    type: 'ai_model', subtype: 'gpt4o', label: 'GPT-4o',
    icon: 'Brain', color: '#8b5cf6', gradient: 'from-purple-500 to-pink-500',
    description: 'OpenAI GPT-4o via OpenRouter',
    inputs: [{ id: 'in', label: 'Input', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {
      prompt: { label: 'System Prompt', type: 'textarea', default: 'You are a real estate marketing expert.' },
      temperature: { label: 'Temperature', type: 'number', default: 0.7 },
      maxTokens: { label: 'Max Tokens', type: 'number', default: 1024 },
    },
  },
  {
    type: 'ai_model', subtype: 'claude', label: 'Claude',
    icon: 'Brain', color: '#8b5cf6', gradient: 'from-purple-500 to-pink-500',
    description: 'Anthropic Claude via OpenRouter',
    inputs: [{ id: 'in', label: 'Input', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {
      prompt: { label: 'System Prompt', type: 'textarea', default: 'You are a real estate marketing expert.' },
      temperature: { label: 'Temperature', type: 'number', default: 0.7 },
      maxTokens: { label: 'Max Tokens', type: 'number', default: 1024 },
    },
  },
  {
    type: 'ai_model', subtype: 'gemini', label: 'Gemini',
    icon: 'Brain', color: '#8b5cf6', gradient: 'from-purple-500 to-pink-500',
    description: 'Google Gemini via OpenRouter',
    inputs: [{ id: 'in', label: 'Input', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {
      prompt: { label: 'System Prompt', type: 'textarea', default: 'You are a real estate marketing expert.' },
      temperature: { label: 'Temperature', type: 'number', default: 0.7 },
    },
  },
  {
    type: 'ai_model', subtype: 'llama', label: 'LLaMA',
    icon: 'Brain', color: '#8b5cf6', gradient: 'from-purple-500 to-pink-500',
    description: 'Meta LLaMA via OpenRouter',
    inputs: [{ id: 'in', label: 'Input', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {
      prompt: { label: 'System Prompt', type: 'textarea', default: 'You are a real estate marketing expert.' },
      temperature: { label: 'Temperature', type: 'number', default: 0.7 },
    },
  },

  // ─── CONTENT TOOLS ───────────────────────────────────────
  {
    type: 'content', subtype: 'text_generator', label: 'Text Generator',
    icon: 'FileText', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-500',
    description: 'Generate post copy and descriptions',
    inputs: [{ id: 'in', label: 'Input', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {
      template: { label: 'Template', type: 'textarea', default: 'Write a marketing post about {property} in {city}. Highlight key features and pricing.' },
      tone: { label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Urgent', 'Luxury', 'Friendly'], default: 'Professional' },
    },
  },
  {
    type: 'content', subtype: 'image_prompt', label: 'Image Prompt',
    icon: 'Image', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-500',
    description: 'Generate image prompts for visual content',
    inputs: [{ id: 'in', label: 'Input', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {
      style: { label: 'Style', type: 'select', options: ['Photorealistic', 'Illustration', 'Minimalist', 'Luxury'], default: 'Photorealistic' },
    },
  },
  {
    type: 'content', subtype: 'hashtag_generator', label: 'Hashtag Generator',
    icon: 'Hash', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-500',
    description: 'Generate trending hashtags for posts',
    inputs: [{ id: 'in', label: 'Input', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {
      count: { label: 'Number of Hashtags', type: 'number', default: 10 },
      platform: { label: 'Platform', type: 'select', options: ['Instagram', 'Twitter', 'LinkedIn', 'All'], default: 'All' },
    },
  },
  {
    type: 'content', subtype: 'seo_optimizer', label: 'SEO Optimizer',
    icon: 'Search', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-500',
    description: 'Optimize content for search engines',
    inputs: [{ id: 'in', label: 'Input', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Output', direction: 'output' }],
    config: {
      keywords: { label: 'Target Keywords', type: 'text', default: 'real estate, property, investment' },
    },
  },

  // ─── SOCIAL MEDIA ────────────────────────────────────────
  {
    type: 'social', subtype: 'youtube', label: 'YouTube',
    icon: 'Youtube', color: '#ef4444', gradient: 'from-red-500 to-red-600',
    description: 'Post video content to YouTube',
    inputs: [{ id: 'in', label: 'Content', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Result', direction: 'output' }],
    config: {
      title: { label: 'Video Title', type: 'text', default: '' },
      description: { label: 'Description', type: 'textarea', default: '' },
      tags: { label: 'Tags', type: 'text', default: 'real estate, property' },
      visibility: { label: 'Visibility', type: 'select', options: ['Public', 'Unlisted', 'Private'], default: 'Public' },
    },
  },
  {
    type: 'social', subtype: 'linkedin', label: 'LinkedIn',
    icon: 'Linkedin', color: '#0a66c2', gradient: 'from-blue-600 to-blue-500',
    description: 'Post professional content to LinkedIn',
    inputs: [{ id: 'in', label: 'Content', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Result', direction: 'output' }],
    config: {
      postType: { label: 'Post Type', type: 'select', options: ['Text', 'Article', 'Image', 'Video', 'Carousel'], default: 'Text' },
      hashtags: { label: 'Hashtags', type: 'text', default: '#RealEstate #PropertyInvestment' },
    },
  },
  {
    type: 'social', subtype: 'facebook', label: 'Facebook',
    icon: 'Facebook', color: '#1877f2', gradient: 'from-blue-500 to-blue-600',
    description: 'Post to Facebook Pages',
    inputs: [{ id: 'in', label: 'Content', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Result', direction: 'output' }],
    config: {
      pageId: { label: 'Page ID', type: 'text', default: '' },
      postType: { label: 'Post Type', type: 'select', options: ['Text', 'Image', 'Link', 'Video', 'Carousel'], default: 'Text' },
    },
  },
  {
    type: 'social', subtype: 'twitter', label: 'Twitter/X',
    icon: 'Twitter', color: '#1da1f2', gradient: 'from-sky-400 to-sky-500',
    description: 'Post tweets to Twitter/X',
    inputs: [{ id: 'in', label: 'Content', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Result', direction: 'output' }],
    config: {
      threadMode: { label: 'Thread Mode', type: 'toggle', default: false },
      maxChars: { label: 'Max Characters', type: 'number', default: 280 },
    },
  },
  {
    type: 'social', subtype: 'instagram', label: 'Instagram',
    icon: 'Instagram', color: '#e4405f', gradient: 'from-pink-500 to-purple-500',
    description: 'Post to Instagram Feed/Stories/Reels',
    inputs: [{ id: 'in', label: 'Content', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Result', direction: 'output' }],
    config: {
      postType: { label: 'Post Type', type: 'select', options: ['Feed Post', 'Story', 'Reel', 'Carousel'], default: 'Feed Post' },
      hashtags: { label: 'Hashtags', type: 'text', default: '' },
    },
  },
  {
    type: 'social', subtype: 'whatsapp', label: 'WhatsApp Business',
    icon: 'MessageSquare', color: '#25d366', gradient: 'from-green-500 to-green-400',
    description: 'Send WhatsApp Business messages',
    inputs: [{ id: 'in', label: 'Content', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Result', direction: 'output' }],
    config: {
      phoneNumberId: { label: 'Phone Number ID', type: 'text', default: '' },
      templateName: { label: 'Template Name', type: 'text', default: '' },
    },
  },
  {
    type: 'social', subtype: 'email', label: 'Email Marketing',
    icon: 'Mail', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-500',
    description: 'Send email campaigns',
    inputs: [{ id: 'in', label: 'Content', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Result', direction: 'output' }],
    config: {
      subject: { label: 'Email Subject', type: 'text', default: '' },
      fromName: { label: 'From Name', type: 'text', default: 'FinPlanner' },
      fromEmail: { label: 'From Email', type: 'text', default: 'noreply@finplanner.com' },
    },
  },
  {
    type: 'social', subtype: 'sms', label: 'SMS Campaign',
    icon: 'Send', color: '#10b981', gradient: 'from-emerald-500 to-teal-500',
    description: 'Send SMS campaigns',
    inputs: [{ id: 'in', label: 'Content', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Result', direction: 'output' }],
    config: {
      senderId: { label: 'Sender ID', type: 'text', default: 'FINPLANNER' },
      maxChars: { label: 'Max Characters', type: 'number', default: 160 },
    },
  },

  // ─── ACTIONS ─────────────────────────────────────────────
  {
    type: 'action', subtype: 'post', label: 'Publish Post',
    icon: 'Send', color: '#22c55e', gradient: 'from-green-500 to-emerald-500',
    description: 'Publish content immediately',
    inputs: [{ id: 'in', label: 'Content', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Result', direction: 'output' }],
    config: {},
  },
  {
    type: 'action', subtype: 'schedule_post', label: 'Schedule Post',
    icon: 'Calendar', color: '#22c55e', gradient: 'from-green-500 to-emerald-500',
    description: 'Schedule content for later publishing',
    inputs: [{ id: 'in', label: 'Content', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Result', direction: 'output' }],
    config: {
      datetime: { label: 'Schedule Date/Time', type: 'text', default: '' },
      timezone: { label: 'Timezone', type: 'select', options: ['Asia/Kolkata', 'UTC'], default: 'Asia/Kolkata' },
    },
  },
  {
    type: 'action', subtype: 'analyze', label: 'Analyze Results',
    icon: 'BarChart3', color: '#22c55e', gradient: 'from-green-500 to-emerald-500',
    description: 'Analyze campaign performance',
    inputs: [{ id: 'in', label: 'Data', direction: 'input' }],
    outputs: [{ id: 'out', label: 'Report', direction: 'output' }],
    config: {
      metrics: { label: 'Metrics to Track', type: 'text', default: 'reach, clicks, conversions, engagement' },
    },
  },
  {
    type: 'action', subtype: 'ab_test', label: 'A/B Test',
    icon: 'Split', color: '#22c55e', gradient: 'from-green-500 to-emerald-500',
    description: 'Split test content variants',
    inputs: [{ id: 'in', label: 'Content A', direction: 'input' }, { id: 'in_b', label: 'Content B', direction: 'input' }],
    outputs: [{ id: 'out_a', label: 'Variant A', direction: 'output' }, { id: 'out_b', label: 'Variant B', direction: 'output' }, { id: 'winner', label: 'Winner', direction: 'output' }],
    config: {
      splitRatio: { label: 'Split Ratio (%)', type: 'number', default: 50 },
      duration: { label: 'Test Duration (hours)', type: 'number', default: 24 },
    },
  },
];

export function getNodeDefinition(type: string, subtype: string): NodeDefinition | undefined {
  return NODE_DEFINITIONS.find(n => n.type === type && n.subtype === subtype);
}

export function getNodesByCategory(type: string): NodeDefinition[] {
  return NODE_DEFINITIONS.filter(n => n.type === type);
}

export function createDefaultNode(def: NodeDefinition, x: number, y: number) {
  const config: Record<string, any> = {};
  Object.entries(def.config).forEach(([key, cfg]) => { config[key] = cfg.default; });
  return {
    id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: def.type,
    subtype: def.subtype,
    label: def.label,
    x, y,
    config,
    status: 'idle' as const,
  };
}
