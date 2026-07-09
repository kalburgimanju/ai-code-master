import type { SocialPost, Platform } from '../types';

const optimalHours: Record<Platform, number[]> = {
  twitter: [8, 12, 17, 20],
  instagram: [11, 13, 19, 21],
  linkedin: [7, 8, 12, 17],
  facebook: [9, 13, 15, 19],
  tiktok: [10, 14, 19, 22],
};

export function schedulePost(post: SocialPost): SocialPost {
  const hours = optimalHours[post.platform];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = Math.floor(Math.random() * 60);

  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setHours(hour, minute, 0, 0);

  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  return {
    ...post,
    scheduledAt: scheduled.toISOString(),
    status: 'scheduled',
  };
}

export function processScheduledPosts(posts: SocialPost[]): SocialPost[] {
  const now = new Date();

  return posts.map(post => {
    if (post.status === 'scheduled' && post.scheduledAt) {
      const scheduledTime = new Date(post.scheduledAt);
      if (scheduledTime <= now) {
        return {
          ...post,
          status: 'posted' as const,
          postedAt: now.toISOString(),
          engagement: {
            likes: Math.floor(Math.random() * 50),
            comments: Math.floor(Math.random() * 15),
            shares: Math.floor(Math.random() * 10),
            views: Math.floor(Math.random() * 500) + 100,
          },
        };
      }
    }

    if (post.status === 'posted') {
      return {
        ...post,
        engagement: {
          likes: post.engagement.likes + Math.floor(Math.random() * 3),
          comments: post.engagement.comments + (Math.random() > 0.7 ? 1 : 0),
          shares: post.engagement.shares + (Math.random() > 0.8 ? 1 : 0),
          views: post.engagement.views + Math.floor(Math.random() * 20),
        },
      };
    }

    return post;
  });
}
