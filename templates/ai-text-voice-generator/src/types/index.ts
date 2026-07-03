export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  scripts: Script[];
  audioFiles: AudioFile[];
  videoClips: VideoClip[];
  avatars: Avatar[];
  generations: Generation[];
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  id: string;
  projectId: string;
  title: string;
  content: string;
  language: string;
  createdAt: string;
}

export interface AudioFile {
  id: string;
  projectId: string;
  name: string;
  url: string;
  duration: number;
  voice: string;
  scriptId?: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  createdAt: string;
}

export interface VideoClip {
  id: string;
  projectId: string;
  name: string;
  url: string;
  thumbnail: string;
  duration: number;
  scriptId?: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  createdAt: string;
}

export interface Avatar {
  id: string;
  projectId: string;
  name: string;
  imageUrl: string;
  style: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  createdAt: string;
}

export interface Generation {
  id: string;
  projectId: string;
  type: 'audio' | 'video' | 'avatar' | 'full';
  prompt: string;
  scriptId?: string;
  agentId: string;
  status: 'queued' | 'generating' | 'processing' | 'ready' | 'error';
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Agent {
  id: string;
  name: string;
  type: 'tts' | 'video' | 'avatar' | 'orchestrator';
  description: string;
  status: 'idle' | 'busy' | 'offline';
  model: string;
  capabilities: string[];
}

// Custom user-created agents
export interface CustomAgent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  voice: string;
  gender: 'male' | 'female';
  avatarStyle: string;
  accentColor: string;
  industry: string;
  runs: number;
  createdAt: string;
  updatedAt: string;
}

export type DashboardTab = 'scripts' | 'audio' | 'video' | 'avatars' | 'generate' | 'agents';
