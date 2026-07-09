import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { processScheduledPosts } from '../agents/schedulerAgent';
import type { ActivityEvent } from '../types';

export function useSchedulerAgent() {
  const { posts, updatePost, addActivity } = useApp();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const scheduledPosts = posts.filter(p => p.status === 'scheduled');
      const postedPosts = posts.filter(p => p.status === 'posted');

      // Process scheduled posts
      if (scheduledPosts.length > 0) {
        const processed = processScheduledPosts(scheduledPosts);
        processed.forEach(post => {
          if (post.status === 'posted' && post.postedAt) {
            updatePost(post.id, {
              status: 'posted',
              postedAt: post.postedAt,
              engagement: post.engagement,
            });

            const event: ActivityEvent = {
              id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              agentName: 'Post Scheduler',
              agentType: 'scheduler',
              action: 'Post published',
              details: `${post.platform} post for "${post.avatarName}"`,
              timestamp: Date.now(),
            };
            addActivity(event);
          }
        });
      }

      // Update engagement on posted posts
      if (postedPosts.length > 0) {
        const post = postedPosts[Math.floor(Math.random() * postedPosts.length)];
        const updated = processScheduledPosts([post])[0];
        if (updated.status === 'posted') {
          updatePost(post.id, { engagement: updated.engagement });
        }
      }
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [posts, updatePost, addActivity]);
}
