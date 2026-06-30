export interface Channel {
  id: string;
  name: string;
  youtubeChannelId: string;
  thumbnailUrl: string;
  subscriberCount: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  createdAt: string;
}

export interface UploadRecord {
  id: string;
  channelId: string;
  title: string;
  description: string;
  tags: string[];
  privacy: 'public' | 'unlisted' | 'private';
  status: 'uploading' | 'completed' | 'failed';
  youtubeVideoId: string;
  youtubeUrl: string;
  errorMessage: string;
  createdAt: string;
}

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
