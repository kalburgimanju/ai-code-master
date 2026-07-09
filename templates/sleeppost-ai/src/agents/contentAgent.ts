import type { Avatar, SocialPost, Platform } from '../types';
import { generateWithAI } from '../utils/openrouter';
import { generateQuickPost } from '../utils/postGenerator';

const platforms: Platform[] = ['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok'];

const contentPrompts = [
  'Write an engaging social media post about productivity tips for entrepreneurs.',
  'Create a thought leadership post about the future of AI in everyday life.',
  'Write a motivational post about overcoming challenges in business.',
  'Create an educational post explaining a complex topic in simple terms.',
  'Write a post sharing lessons learned from a recent project or experience.',
  'Create an engaging question post to drive audience interaction.',
  'Write a behind-the-scenes post about building a product or company.',
  'Create a post celebrating a small win or milestone.',
];

export async function generateContentForAvatar(
  avatar: Avatar,
  platform?: Platform
): Promise<SocialPost> {
  const targetPlatform = platform || platforms[Math.floor(Math.random() * platforms.length)];
  const prompt = contentPrompts[Math.floor(Math.random() * contentPrompts.length)];

  try {
    const content = await generateWithAI(
      `${prompt}\n\nPlatform: ${targetPlatform}\nBrand: ${avatar.name}\nKeep it authentic and engaging.`,
      `You are a social media expert creating content for "${avatar.name}". Write ONLY the post content. Be authentic, engaging, and platform-appropriate.`
    );

    const hashtagMatch = content.match(/#\w+/g);
    const hashtags = hashtagMatch || [`#${targetPlatform}Content`, '#AI'];

    return {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      avatarId: avatar.id,
      avatarName: avatar.name,
      content: content.replace(/#\w+/g, '').trim().slice(0, 500),
      hashtags: hashtags.slice(0, 5),
      platform: targetPlatform,
      status: 'draft',
      engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
      generatedBy: 'content-agent',
      createdAt: new Date().toISOString(),
    };
  } catch {
    return generateQuickPost(avatar, targetPlatform);
  }
}
