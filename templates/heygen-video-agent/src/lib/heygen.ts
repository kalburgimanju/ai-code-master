const HEYGEN_API_BASE = 'https://api.heygen.com';

export interface GenerateVideoOptions {
  apiKey: string;
  prompt: string;
  /** Avatar ID(s) to use as visual reference. Provide 1-3 IDs. Leave empty for auto-selection. */
  avatarIds?: string[];
  title?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  /** Duration in seconds (4-15). Omit or set null for default (10s) */
  duration?: number;
  /** Let the model choose video length */
  autoDuration?: boolean;
  /** Enable server-side prompt enhancement */
  enhancePrompt?: boolean;
}

export interface GenerationResponse {
  video_id: string;
}

export interface VideoStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  error?: string;
  duration?: number;
  estimated_time?: number;
}

export interface AvatarInfo {
  id: string;
  name: string;
  gender: 'male' | 'female';
  preview_image_url: string;
  default_voice_id: string;
  looks_count: number;
  created_at: number;
}

export interface AvatarLook {
  id: string;
  name?: string;
  preview_image_url?: string;
  gender?: string;
}

export async function listAvatars(apiKey: string): Promise<AvatarInfo[]> {
  const response = await fetch(`${HEYGEN_API_BASE}/v3/avatars`, {
    headers: { 'x-api-key': apiKey },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to list avatars (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.data || [];
}

export async function getAvatarLooks(apiKey: string, avatarId: string): Promise<AvatarLook[]> {
  const response = await fetch(`${HEYGEN_API_BASE}/v3/avatars/${avatarId}/looks`, {
    headers: { 'x-api-key': apiKey },
  });

  if (!response.ok) {
    // Some avatars may not have separate looks; fallback gracefully
    if (response.status === 404) return [];
    const errorBody = await response.text();
    throw new Error(`Failed to get avatar looks (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.data || [];
}

export async function generateVideo(options: GenerateVideoOptions): Promise<GenerationResponse> {
  const {
    apiKey,
    prompt,
    avatarIds = [],
    aspectRatio = '16:9',
    title,
    duration,
    autoDuration = false,
    enhancePrompt = false,
  } = options;

  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  };

  const requestBody: Record<string, unknown> = {
    type: 'cinematic_avatar',
    prompt,
    aspect_ratio: aspectRatio,
    resolution: '720p',
    title: title || null,
  };

  // avatar_id is required - must provide at least 1 look ID
  // Use provided IDs, or fall back to default avatars
  if (avatarIds.length > 0) {
    requestBody.avatar_id = avatarIds;
  } else {
    // Use a default avatar (Marco - male presenter style)
    // The API expects look IDs, but for some avatars using the avatar ID directly may work
    requestBody.avatar_id = ['9fc2a78e642547b5a21ea8cf06a953d4'];
  }

  if (autoDuration) {
    requestBody.auto_duration = true;
  } else if (duration && duration >= 4 && duration <= 15) {
    requestBody.duration = duration;
  }

  if (enhancePrompt) {
    requestBody.enhance_prompt = true;
  }

  const response = await fetch(`${HEYGEN_API_BASE}/v3/videos`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `HeyGen v3 API error (${response.status}): ${errorBody || response.statusText}`
    );
  }

  const data = await response.json();

  return {
    video_id: data.data?.id || data.data?.video_id,
  };
}

export async function getVideoStatus(
  apiKey: string,
  videoId: string
): Promise<VideoStatusResponse> {
  const headers = { 'x-api-key': apiKey };

  const response = await fetch(
    `${HEYGEN_API_BASE}/v3/videos/${encodeURIComponent(videoId)}`,
    { headers }
  );

  if (!response.ok) {
    // Fallback to v1 legacy endpoint for backward compatibility
    if (response.status === 404) {
      const legacyResponse = await fetch(
        `${HEYGEN_API_BASE}/v1/video.status.get?video_id=${encodeURIComponent(videoId)}`,
        { headers }
      );

      if (!legacyResponse.ok) {
        const errorBody = await legacyResponse.text();
        throw new Error(
          `HeyGen status API error (${legacyResponse.status}): ${errorBody || legacyResponse.statusText}`
        );
      }

      const legacyData = await legacyResponse.json();
      return {
        status: legacyData.data?.status || 'processing',
        video_url: legacyData.data?.video_url,
        thumbnail_url: legacyData.data?.thumbnail_url,
        error: legacyData.data?.error,
        duration: legacyData.data?.duration,
      };
    }

    const errorBody = await response.text();
    throw new Error(
      `HeyGen v3 status API error (${response.status}): ${errorBody || response.statusText}`
    );
  }

  const data = await response.json();
  const videoData = data.data || data;

  return {
    status: videoData.status || 'processing',
    video_url: videoData.video_url,
    thumbnail_url: videoData.thumbnail_url,
    error: videoData.error || videoData.failure_reason,
    duration: videoData.duration,
  };
}
