import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Eye, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Platform } from '../../types';

const platformColors: Record<Platform, string> = {
  twitter: 'text-blue-400 bg-blue-400/10',
  instagram: 'text-pink-400 bg-pink-400/10',
  linkedin: 'text-blue-500 bg-blue-500/10',
  facebook: 'text-blue-600 bg-blue-600/10',
  tiktok: 'text-red-400 bg-red-400/10',
};

const ContentFeed: React.FC = () => {
  const { posts } = useApp();
  const recentPosts = posts.slice(0, 10);

  if (recentPosts.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-gray-400">No posts yet. Create an avatar to start generating content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Recent Content</h3>
      {recentPosts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-xl p-4 glow-card"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${platformColors[post.platform]}`}>
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
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <Clock size={12} />
              {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <p className="text-gray-300 text-sm mb-3 line-clamp-3">{post.content}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            {post.hashtags.map((tag, j) => (
              <span key={j} className="text-brand-400 text-xs">{tag}</span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1"><Heart size={12} /> {post.engagement.likes}</span>
            <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.engagement.comments}</span>
            <span className="flex items-center gap-1"><Share2 size={12} /> {post.engagement.shares}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {post.engagement.views}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ContentFeed;
