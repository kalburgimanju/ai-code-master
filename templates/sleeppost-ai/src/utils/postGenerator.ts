import type { Platform, SocialPost, Avatar } from '../types';
import { generateWithAI } from './openrouter';

const platformLimits: Record<Platform, number> = {
  twitter: 280,
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
  tiktok: 2200,
};

const platformPrompts: Record<Platform, string> = {
  twitter: 'Write a concise, engaging tweet (under 280 chars). Use emojis sparingly. Include 2-3 relevant hashtags.',
  instagram: 'Write an engaging Instagram caption. Start with a hook, tell a brief story or share insight, end with a call to action. Include 5-8 relevant hashtags.',
  linkedin: 'Write a professional LinkedIn post. Start with a compelling first line, share insights or experience, use line breaks for readability, end with a question to drive engagement.',
  facebook: 'Write a conversational Facebook post. Be relatable and authentic. Ask a question to encourage comments.',
  tiktok: 'Write a short, punchy TikTok caption. Use trending language, include a hook in the first line, add 3-5 hashtags.',
};

const topicSuggestions = [
  'productivity tips for remote workers',
  'the future of AI in daily life',
  'building a personal brand on social media',
  'lessons learned from failing forward',
  'why consistency beats perfection',
  'the power of compound growth in business',
  'how to stay creative in a busy world',
  'morning routines of successful people',
  'the art of saying no to grow',
  'why automation is not replacing humans',
  'tips for first-time founders',
  'the psychology of great content',
];

const hashtagSets: Record<Platform, string[]> = {
  twitter: ['#TechTips', '#Productivity', '#AI', '#StartupLife', '#GrowthMindset', '#Innovation', '#FutureOfWork', '#BuildInPublic'],
  instagram: ['#ContentCreator', '#DigitalMarketing', '#SocialMediaTips', '#GrowthHacking', '#PersonalBranding', '#Entrepreneurship', '#AIMarketing', '#CreatorEconomy'],
  linkedin: ['#Leadership', '#Innovation', '#CareerGrowth', '#ProfessionalDevelopment', '#AI', '#FutureOfWork', '#StartupLife', '#BusinessStrategy'],
  facebook: ['#TechCommunity', '#Lifestyle', '#Motivation', '#BusinessTips', '#Innovation'],
  tiktok: ['#TechTok', '#LearnOnTikTok', '#AI', '#LifeHacks', '#ProductivityHacks', '#FutureTech'],
};

export async function generatePost(
  avatar: Avatar,
  platform: Platform
): Promise<SocialPost> {
  const topic = topicSuggestions[Math.floor(Math.random() * topicSuggestions.length)];
  const prompt = `${platformPrompts[platform]}\n\nTopic: ${topic}\nBrand voice: Modern, authentic, insightful`;

  const content = await generateWithAI(
    prompt,
    `You are a social media content expert creating posts for a brand called "${avatar.name}". Write only the post content, nothing else. Be authentic and engaging.`
  );

  const hashtags = pickHashtags(platform, 3 + Math.floor(Math.random() * 3));
  const now = new Date();
  const scheduledTime = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000);

  return {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    avatarId: avatar.id,
    avatarName: avatar.name,
    content: content.slice(0, platformLimits[platform]),
    hashtags,
    platform,
    scheduledAt: scheduledTime.toISOString(),
    status: 'scheduled',
    engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
    generatedBy: 'content-agent',
    createdAt: now.toISOString(),
  };
}

export function generateQuickPost(avatar: Avatar, platform: Platform): SocialPost {
  const topic = topicSuggestions[Math.floor(Math.random() * topicSuggestions.length)];
  const content = generateFallbackContent(platform, topic);
  const hashtags = pickHashtags(platform, 3 + Math.floor(Math.random() * 3));
  const now = new Date();

  return {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    avatarId: avatar.id,
    avatarName: avatar.name,
    content,
    hashtags,
    platform,
    status: 'draft',
    engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
    generatedBy: 'content-agent',
    createdAt: now.toISOString(),
  };
}

function pickHashtags(platform: Platform, count: number): string[] {
  const pool = [...hashtagSets[platform]];
  const picked: string[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function generateFallbackContent(platform: Platform, topic: string): string {
  const templates: Record<Platform, string[]> = {
    twitter: [
      `Just discovered something amazing about ${topic}. Thread coming soon. The future is here. #BuildInPublic`,
      `${topic} is changing everything. Here is what most people miss: the compound effect is real. Start now. #GrowthMindset`,
      `Hot take on ${topic}: Most advice is outdated. The new playbook is simple — ship fast, learn faster. #StartupLife`,
    ],
    instagram: [
      `The secret to ${topic} that nobody talks about...\n\nIt is not about working harder. It is about working smarter.\n\nHere is what I have learned after years of trial and error:\n\n1. Start before you are ready\n2. Focus on progress, not perfection\n3. Let AI handle the repetitive stuff\n\nWhat is your experience with ${topic}? Drop a comment below.\n\n#ContentCreator #DigitalMarketing #GrowthMindset`,
      `POV: You discovered the ultimate ${topic} hack.\n\nStep 1: Set up your AI agent\nStep 2: Go to sleep\nStep 3: Wake up to engagement\n\nYes, it is really that simple.\n\n#AIMarketing #SocialMediaTips #Automation`,
    ],
    linkedin: [
      `I spent 6 months studying ${topic}.\n\nHere are the 3 biggest lessons:\n\n1. Consistency > Virality\n2. Data beats intuition\n3. AI amplifies human creativity\n\nThe companies that embrace this shift will dominate the next decade.\n\nWhat is your take on ${topic}?\n\n#Innovation #FutureOfWork #AI`,
    ],
    facebook: [
      `Can we talk about ${topic} for a minute?\n\nI have been thinking about this a lot lately, and I think most people are overcomplicating it.\n\nThe simple truth: start small, stay consistent, and let technology work for you.\n\nWhat do you think? Agree or disagree?`,
    ],
    tiktok: [
      `${topic} in 60 seconds. This changed my entire perspective. #LearnOnTikTok #TechTok #AI`,
      `POV: You finally figured out ${topic} and your mind is blown #Mindset #ProductivityHacks #GrowthHacking`,
    ],
  };

  const options = templates[platform];
  return options[Math.floor(Math.random() * options.length)];
}
