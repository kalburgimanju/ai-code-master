'use client';

import { useState, useEffect } from 'react';
import { Youtube, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import ChannelCard from '@/components/ChannelCard';
import type { Channel } from '@/types';

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: '', youtubeChannelId: '', niche: 'tech' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      const data = await res.json();
      setChannels(data.channels || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchChannels(); }, []);

  const handleAdd = async () => {
    if (!newChannel.name || !newChannel.youtubeChannelId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChannel),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Channel added! Connect YouTube OAuth to enable auto-publish.' });
        setNewChannel({ name: '', youtubeChannelId: '', niche: 'tech' });
        setShowAdd(false);
        fetchChannels();
      } else {
        setMessage({ type: 'error', text: 'Failed to add channel' });
      }
    } catch { setMessage({ type: 'error', text: 'Network error' }); }
    setSaving(false);
  };

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/channels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: active }),
    });
    fetchChannels();
  };

  return (
    <div className="min-h-screen bg-dark-50">
      <div className="bg-gradient-to-br from-brand-600 to-fire-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <Youtube size={16} />
            Channel Management
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Your Channels</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Connect YouTube channels, set niches, and enable auto-publishing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm ${
            message.type === 'success' ? 'bg-neon-50 text-neon-700 border border-neon-200' : 'bg-fire-50 text-fire-700 border border-fire-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-dark-800">Connected Channels ({channels.length})</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Add Channel
          </button>
        </div>

        {showAdd && (
          <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6 mb-8">
            <h3 className="text-lg font-bold text-dark-800 mb-4">Add New Channel</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                placeholder="Channel name"
                className="px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              />
              <input
                type="text"
                value={newChannel.youtubeChannelId}
                onChange={(e) => setNewChannel({ ...newChannel, youtubeChannelId: e.target.value })}
                placeholder="YouTube Channel ID"
                className="px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              />
              <select
                value={newChannel.niche}
                onChange={(e) => setNewChannel({ ...newChannel, niche: e.target.value })}
                className="px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              >
                <option value="tech">Tech & AI</option>
                <option value="psychology">Psychology</option>
                <option value="motivation">Motivation</option>
                <option value="finance">Finance</option>
                <option value="entertainment">Entertainment</option>
                <option value="culture">Culture</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={saving || !newChannel.name || !newChannel.youtubeChannelId}
                className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Channel'}
              </button>
              <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl bg-dark-100 text-dark-600 text-sm font-medium hover:bg-dark-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16"><Loader2 className="animate-spin text-brand-500 mx-auto" size={32} /></div>
        ) : channels.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dark-100">
            <div className="text-5xl mb-4">📺</div>
            <h3 className="text-xl font-bold text-dark-800 mb-2">No Channels Yet</h3>
            <p className="text-dark-500 mb-6">Add a YouTube channel to start auto-publishing.</p>
            <button onClick={() => setShowAdd(true)} className="px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors">
              Add Your First Channel
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} onToggleActive={handleToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
