import type { Channel, Video, Idea } from '@/types';

// In-memory store for development (replace with Vercel KV in production)
const store = {
  channels: new Map<string, Channel>(),
  videos: new Map<string, Video>(),
  ideas: new Map<string, Idea>(),
};

// Helper to generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// ===== CHANNELS =====

export async function getChannel(id: string): Promise<Channel | null> {
  return store.channels.get(id) || null;
}

export async function getAllChannels(): Promise<Channel[]> {
  return Array.from(store.channels.values());
}

export async function getActiveChannels(): Promise<Channel[]> {
  return Array.from(store.channels.values()).filter((c) => c.isActive);
}

export async function createChannel(data: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Channel> {
  const now = new Date().toISOString();
  const channel: Channel = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  store.channels.set(channel.id, channel);
  return channel;
}

export async function updateChannel(id: string, data: Partial<Channel>): Promise<Channel | null> {
  const existing = store.channels.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  store.channels.set(id, updated);
  return updated;
}

export async function deleteChannel(id: string): Promise<boolean> {
  return store.channels.delete(id);
}

// ===== VIDEOS =====

export async function getVideo(id: string): Promise<Video | null> {
  return store.videos.get(id) || null;
}

export async function getVideosByChannel(channelId: string, limit?: number): Promise<Video[]> {
  const videos = Array.from(store.videos.values())
    .filter((v) => v.channelId === channelId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return limit ? videos.slice(0, limit) : videos;
}

export async function getTodayVideoForChannel(channelId: string): Promise<Video | null> {
  const today = new Date().toISOString().split('T')[0];
  return Array.from(store.videos.values()).find(
    (v) => v.channelId === channelId && v.createdAt.startsWith(today)
  ) || null;
}

export async function createVideo(data: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video> {
  const now = new Date().toISOString();
  const video: Video = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  store.videos.set(video.id, video);
  return video;
}

export async function updateVideo(id: string, data: Partial<Video>): Promise<Video | null> {
  const existing = store.videos.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  store.videos.set(id, updated);
  return updated;
}

// ===== IDEAS =====

export async function getIdea(id: string): Promise<Idea | null> {
  return store.ideas.get(id) || null;
}

export async function getIdeas(status?: string): Promise<Idea[]> {
  const ideas = Array.from(store.ideas.values());
  if (status) {
    return ideas.filter((i) => i.status === status);
  }
  return ideas.sort((a, b) => b.trendScore - a.trendScore);
}

export async function createIdea(data: Omit<Idea, 'id' | 'createdAt'>): Promise<Idea> {
  const idea: Idea = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  store.ideas.set(idea.id, idea);
  return idea;
}

export async function updateIdea(id: string, data: Partial<Idea>): Promise<Idea | null> {
  const existing = store.ideas.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  store.ideas.set(id, updated);
  return updated;
}
