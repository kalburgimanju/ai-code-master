export interface VideoSettings {
  voiceName: string;
  videoSource: 'pexels' | 'pixabay' | 'coverr' | 'local';
  aspectRatio: '9:16' | '16:9' | '1:1';
  clipDuration: number;
  bgmType: 'none' | 'random' | 'custom';
  subtitleEnabled: boolean;
}

export interface VideoProject {
  id: string;
  topic: string;
  script: string;
  settings: VideoSettings;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  stage: string;
  videoFile?: string;
  audioDuration?: number;
  error?: string;
  createdAt: string;
  taskDir?: string;
}

export const DEFAULT_SETTINGS: VideoSettings = {
  voiceName: 'en-IN-NeerjaNeural-Female',
  videoSource: 'pexels',
  aspectRatio: '9:16',
  clipDuration: 5,
  bgmType: 'random',
  subtitleEnabled: true,
};

export const VOICE_OPTIONS = [
  { id: 'en-IN-NeerjaNeural-Female', label: 'Indian English Female (Neerja)', lang: 'en-IN' },
  { id: 'en-IN-PallaviNeural-Female', label: 'Indian English Female (Pallavi)', lang: 'en-IN' },
  { id: 'en-IN-MS-Neural-Female', label: 'Indian English Female (Rekha)', lang: 'en-IN' },
  { id: 'en-US-JennyNeural-Female', label: 'US English Female (Jenny)', lang: 'en-US' },
  { id: 'en-US-GuyNeural-Male', label: 'US English Male (Guy)', lang: 'en-US' },
  { id: 'en-GB-SoniaNeural-Female', label: 'UK English Female (Sonia)', lang: 'en-GB' },
  { id: 'en-AU-NatashaNeural-Female', label: 'Australian English Female (Natasha)', lang: 'en-AU' },
  { id: 'zh-CN-XiaoxiaoNeural-Female', label: 'Chinese Female (Xiaoxiao)', lang: 'zh-CN' },
];

export const ASPECT_OPTIONS = [
  { id: '9:16' as const, label: 'Portrait 9:16 (TikTok/Reels)' },
  { id: '16:9' as const, label: 'Landscape 16:9 (YouTube)' },
  { id: '1:1' as const, label: 'Square 1:1 (Instagram)' },
];
