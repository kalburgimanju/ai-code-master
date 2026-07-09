import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Platform } from '../../types';

const platformDots: Record<Platform, string> = {
  twitter: 'bg-blue-400',
  instagram: 'bg-pink-400',
  linkedin: 'bg-blue-500',
  facebook: 'bg-blue-600',
  tiktok: 'bg-red-400',
};

const ScheduleCalendar: React.FC = () => {
  const { posts } = useApp();

  const scheduledPosts = posts
    .filter(p => p.status === 'scheduled' && p.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, 8);

  const postedToday = posts.filter(p => {
    if (p.status !== 'posted' || !p.postedAt) return false;
    const posted = new Date(p.postedAt);
    const today = new Date();
    return posted.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
          <Calendar size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Schedule</h3>
          <p className="text-gray-400 text-xs">{postedToday} posts published today</p>
        </div>
      </div>

      <div className="space-y-3">
        {scheduledPosts.map((post) => {
          const time = new Date(post.scheduledAt!);
          return (
            <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className={`w-2 h-2 rounded-full ${platformDots[post.platform]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{post.content.slice(0, 60)}...</p>
                <p className="text-gray-500 text-xs capitalize">{post.platform}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs flex items-center gap-1">
                  <Clock size={10} />
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {scheduledPosts.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No scheduled posts</p>
        )}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
