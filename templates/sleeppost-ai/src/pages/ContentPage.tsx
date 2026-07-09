import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ContentFeed from '../components/dashboard/ContentFeed';
import type { Platform } from '../types';

const ContentPage: React.FC = () => {
  const { posts } = useApp();
  const [filter, setFilter] = useState<Platform | 'all'>('all');

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.platform === filter);
  const platformCounts = posts.reduce((acc, p) => {
    acc[p.platform] = (acc[p.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Content</h1>
        <p className="text-gray-400">
          All AI-generated content across your platforms.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-brand-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          All ({posts.length})
        </button>
        {(['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok'] as Platform[]).map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === p
                ? 'bg-brand-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {p} ({platformCounts[p] || 0})
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Feed</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredPosts.slice(0, 20).map((post) => (
              <div key={post.id} className="glass rounded-xl p-4 glow-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-xs capitalize bg-brand-500/10 text-brand-400">
                    {post.platform}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    post.status === 'posted' ? 'bg-green-400/10 text-green-400' :
                    post.status === 'scheduled' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-gray-400/10 text-gray-400'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-3">{post.content}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.hashtags.map((tag, j) => (
                    <span key={j} className="text-brand-400 text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-4">Content Stats</h3>
          <div className="glass rounded-2xl p-6 space-y-4">
            {(['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok'] as Platform[]).map((p) => {
              const count = platformCounts[p] || 0;
              const pct = posts.length > 0 ? (count / posts.length) * 100 : 0;
              return (
                <div key={p}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{p}</span>
                    <span className="text-gray-500">{count} posts</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
