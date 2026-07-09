import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { generateContentForAvatar } from '../agents/contentAgent';
import type { ActivityEvent } from '../types';

export function useContentAgent() {
  const { avatars, addPost, addActivity } = useApp();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (avatars.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const generate = async () => {
      const avatar = avatars[Math.floor(Math.random() * avatars.length)];
      if (!avatar) return;

      try {
        const post = await generateContentForAvatar(avatar);
        addPost(post);

        const event: ActivityEvent = {
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          agentName: 'Content Creator',
          agentType: 'content',
          action: 'Generated post',
          details: `New ${post.platform} post for "${avatar.name}"`,
          timestamp: Date.now(),
        };
        addActivity(event);
      } catch (err) {
        console.warn('Content agent error:', err);
      }
    };

    // Generate initial post after a short delay
    const initialTimeout = setTimeout(generate, 5000);

    intervalRef.current = setInterval(generate, 30000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [avatars, addPost, addActivity]);
}
