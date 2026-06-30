import type { Channel } from '@/types';
import * as db from './db';

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/youtube/callback';

export interface UploadParams {
  videoBuffer: Uint8Array | ArrayBuffer;
  videoFilename: string;
  title: string;
  description: string;
  tags: string[];
  channelId: string;
  privacyStatus?: 'public' | 'unlisted' | 'private';
}

export interface UploadResult {
  youtubeVideoId: string;
  youtubeUrl: string;
}

export function getYouTubeAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID || '',
    redirect_uri: YOUTUBE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: YOUTUBE_CLIENT_ID || '',
      client_secret: YOUTUBE_CLIENT_SECRET || '',
      redirect_uri: YOUTUBE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

async function refreshAccessToken(channel: Channel): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID || '',
      client_secret: YOUTUBE_CLIENT_SECRET || '',
      refresh_token: channel.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await db.updateChannel(channel.id, {
    accessToken: data.access_token,
    tokenExpiresAt: newExpiresAt,
  });

  return data.access_token;
}

async function getValidAccessToken(channel: Channel): Promise<string> {
  if (new Date(channel.tokenExpiresAt).getTime() < Date.now() + 5 * 60 * 1000) {
    return refreshAccessToken(channel);
  }
  return channel.accessToken;
}

export async function getChannelInfo(accessToken: string): Promise<{
  channelId: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
}> {
  const response = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch channel info');
  }

  const data = await response.json();
  const channel = data.items[0];

  return {
    channelId: channel.id,
    title: channel.snippet.title,
    thumbnailUrl: channel.snippet.thumbnails?.default?.url || '',
    subscriberCount: channel.statistics.subscriberCount,
    viewCount: channel.statistics.viewCount,
    videoCount: channel.statistics.videoCount,
  };
}

export async function uploadToYouTube(params: UploadParams): Promise<UploadResult> {
  const channel = await db.getChannel(params.channelId);
  if (!channel) {
    throw new Error('Channel not found');
  }

  const accessToken = await getValidAccessToken(channel);

  const videoBlob = new Blob([params.videoBuffer], { type: 'video/webm' });

  const metadata = {
    snippet: {
      title: params.title,
      description: params.description,
      tags: params.tags,
      categoryId: '22', // People & Blogs
    },
    status: {
      privacyStatus: params.privacyStatus || 'public',
      selfDeclaredMadeForKids: false,
    },
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('video', videoBlob, params.videoFilename);

  const uploadResponse = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`YouTube upload failed: ${error}`);
  }

  const uploadData = await uploadResponse.json();
  const videoId = uploadData.id;

  return {
    youtubeVideoId: videoId,
    youtubeUrl: `https://youtu.be/${videoId}`,
  };
}
