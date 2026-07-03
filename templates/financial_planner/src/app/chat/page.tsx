'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, MessageCircle, Plus, Send, Building2, ThumbsUp, Repeat2, ChevronDown } from 'lucide-react';
import { samplePosts } from '@/lib/data';
import { getItem, setItem, USER_KEY, POSTS_KEY } from '@/lib/storage';
import { getTimeAgo } from '@/lib/utils';

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState(samplePosts);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => { setUser(getItem(USER_KEY, null)); }, []);

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: `p${Date.now()}`,
      userId: user?.id || 'u0',
      userName: user?.name || 'Anonymous',
      content: newPost,
      likes: 0,
      shares: 0,
      comments: [],
      timestamp: new Date().toISOString(),
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleShare = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
  };

  const handleComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: [...p.comments, { id: `c${Date.now()}`, userId: user?.id || 'u0', userName: user?.name || 'Anonymous', content: text, timestamp: new Date().toISOString() }] };
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Community</h1><p className="text-dark-400 text-sm mt-1">Share, discuss, and connect with property buyers and investors</p></div>
        <span className="text-xs text-dark-500 bg-dark-800 px-3 py-1.5 rounded-full">{posts.length} posts</span>
      </div>

      {/* Create Post */}
      <div className="card">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-finance-600/20 flex items-center justify-center text-sm font-medium text-finance-400 shrink-0">{user?.name?.charAt(0) || '?'}</div>
          <div className="flex-1">
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)} className="input min-h-[80px] resize-none" placeholder={user ? "Share something about properties, investments, or ask the community..." : "Sign in to post..."} disabled={!user} />
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2">{user && <button className="btn-ghost text-xs"><Building2 className="w-3.5 h-3.5" /> Tag Property</button>}</div>
              <button onClick={handlePost} disabled={!newPost.trim() || !user} className="btn-primary text-sm py-1.5"><Send className="w-3.5 h-3.5" /> Post</button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="card">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-finance-500 to-prop-500 flex items-center justify-center text-sm font-bold text-white shrink-0">{post.userName.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-sm font-semibold text-white">{post.userName}</span><span className="text-[10px] text-dark-500">{getTimeAgo(post.timestamp)}</span></div>
                <p className="text-sm text-dark-300 mt-2 whitespace-pre-wrap">{post.content}</p>

                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => handleLike(post.id)} className="btn-ghost text-xs gap-1.5"><ThumbsUp className="w-3.5 h-3.5" /> {post.likes}</button>
                  <button onClick={() => handleShare(post.id)} className="btn-ghost text-xs gap-1.5"><Repeat2 className="w-3.5 h-3.5" /> {post.shares}</button>
                  <button onClick={() => setShowComments(showComments === post.id ? null : post.id)} className="btn-ghost text-xs gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> {post.comments.length}</button>
                </div>

                {showComments === post.id && (
                  <div className="mt-3 pt-3 border-t border-dark-800 space-y-2">
                    {post.comments.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {post.comments.map((c: any) => (
                          <div key={c.id} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-[9px] font-medium text-dark-300 shrink-0">{c.userName.charAt(0)}</div>
                            <div><div className="text-xs text-dark-300"><span className="font-medium text-dark-200">{c.userName}</span> {c.content}</div><div className="text-[9px] text-dark-600 mt-0.5">{getTimeAgo(c.timestamp)}</div></div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input value={commentInputs[post.id] || ''} onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleComment(post.id)} className="input text-sm" placeholder="Write a comment..." />
                      <button onClick={() => handleComment(post.id)} className="btn-primary shrink-0"><Send className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
