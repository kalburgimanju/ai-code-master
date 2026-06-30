export interface Channel {
  id: string;
  name: string;
  youtubeChannelId: string;
  niche: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  uploadHourUtc: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  channelId: string;
  title: string;
  description: string;
  tags: string[];
  niche: string;
  status: PipelineStage;
  statusDetail: string;
  script: string;
  scriptWordCount: number;
  voiceoverUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  combinedUrl: string;
  youtubeVideoId: string;
  youtubeUrl: string;
  youtubeUploadDate: string;
  estimatedCostCents: number;
  startedAt: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  channelId: string;
  title: string;
  niche: string;
  source: string;
  trendScore: number;
  competition: 'Low' | 'Medium' | 'High';
  estimatedViews: string;
  keywords: string[];
  status: 'discovered' | 'selected' | 'used' | 'expired';
  selectedAt: string;
  usedInVideo: string;
  expiresAt: string;
  createdAt: string;
}

export type PipelineStage =
  | 'trending_fetched'
  | 'idea_selected'
  | 'script_generated'
  | 'voiceover_generated'
  | 'video_generated'
  | 'thumbnail_generated'
  | 'combined'
  | 'uploaded'
  | 'failed';

export interface PipelineProgress {
  videoId: string;
  currentStage: PipelineStage;
  stages: {
    stage: PipelineStage;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
  }[];
  startedAt: string;
  estimatedCostCents: number;
}

export interface GeneratedScript {
  title: string;
  hook: string;
  sections: { heading: string; content: string }[];
  cta: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  fullText: string;
  wordCount: number;
}

export interface TrendingTopic {
  title: string;
  niche: string;
  trendScore: number;
  competition: 'Low' | 'Medium' | 'High';
  estimatedViews: string;
  keywords: string[];
  source: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  'trending_fetched',
  'idea_selected',
  'script_generated',
  'voiceover_generated',
  'video_generated',
  'thumbnail_generated',
  'combined',
  'uploaded',
];
