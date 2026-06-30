import type { Channel, UploadRecord } from '@/types';

// In-memory store for development (replace with a database in production)
const store = {
  channels: new Map<string, Channel>(),
  uploads: new Map<string, UploadRecord>(),
};

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

export async function createChannel(data: Omit<Channel, 'id' | 'createdAt'>): Promise<Channel> {
  const channel: Channel = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  store.channels.set(channel.id, channel);
  return channel;
}

export async function updateChannel(id: string, data: Partial<Channel>): Promise<Channel | null> {
  const existing = store.channels.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  store.channels.set(id, updated);
  return updated;
}

export async function deleteChannel(id: string): Promise<boolean> {
  return store.channels.delete(id);
}

// ===== UPLOADS =====

export async function getUploads(channelId?: string): Promise<UploadRecord[]> {
  const uploads = Array.from(store.uploads.values());
  if (channelId) {
    return uploads
      .filter((u) => u.channelId === channelId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return uploads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createUpload(data: Omit<UploadRecord, 'id' | 'createdAt'>): Promise<UploadRecord> {
  const upload: UploadRecord = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  store.uploads.set(upload.id, upload);
  return upload;
}

export async function updateUpload(id: string, data: Partial<UploadRecord>): Promise<UploadRecord | null> {
  const existing = store.uploads.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  store.uploads.set(id, updated);
  return updated;
}
