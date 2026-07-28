export interface GenerationConfig {
  prompt: string;
  avatar: string;
  duration: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  useScript: boolean;
  script?: string;
  style?: string;
  colors?: string;
  mediaPreferences?: string[];
  sceneByScene?: Scene[];
}

export interface Scene {
  number: number;
  title: string;
  sceneType: string;
  visual: string;
  voiceOver: string;
  duration: string;
}

export interface VideoRecord {
  id: string;
  title: string;
  videoId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  prompt: string;
  createdAt: string;
  duration?: number;
  error?: string;
}

export type AppStatus = 'idle' | 'generating' | 'processing' | 'completed' | 'failed';
