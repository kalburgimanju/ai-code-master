import type { Video, PipelineStage } from '@/types';
import * as db from './db';
import { generateScript } from './ai';
import { generateVoiceover } from './voiceover';
import { generateVideo } from './video';
import { generateThumbnail } from './thumbnail';
import { uploadToYouTube } from './youtube';
import { discoverTrendingTopics, selectBestTopic } from './trends';
import { trackCost, COSTS } from './cost-tracker';

export interface PipelineResult {
  success: boolean;
  videoId?: string;
  youtubeUrl?: string;
  error?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

async function updateStatus(
  videoId: string,
  status: PipelineStage,
  extra?: Partial<Video>
): Promise<void> {
  await db.updateVideo(videoId, {
    status,
    statusDetail: extra?.statusDetail,
    ...extra,
  });
}

export async function runDailyPipeline(channelId: string): Promise<PipelineResult> {
  const channel = await db.getChannel(channelId);
  if (!channel || !channel.isActive) {
    return { success: false, error: 'Channel inactive or not found' };
  }

  // Check if already ran today
  const todayVideo = await db.getTodayVideoForChannel(channelId);
  if (todayVideo) {
    return { success: false, error: 'Already ran today', videoId: todayVideo.id };
  }

  // Create video record
  const video = await db.createVideo({
    channelId,
    title: '',
    description: '',
    tags: [],
    niche: channel.niche,
    status: 'trending_fetched',
    statusDetail: 'Pipeline started',
    script: '',
    scriptWordCount: 0,
    voiceoverUrl: '',
    videoUrl: '',
    thumbnailUrl: '',
    combinedUrl: '',
    youtubeVideoId: '',
    youtubeUrl: '',
    youtubeUploadDate: '',
    estimatedCostCents: 0,
    startedAt: new Date().toISOString(),
    completedAt: '',
  });

  try {
    // Step 1: Fetch trending topics
    await updateStatus(video.id, 'trending_fetched', { statusDetail: 'Discovering trending topics...' });
    const topics = await discoverTrendingTopics([channel.niche]);

    // Step 2: Select best topic
    const bestTopic = await selectBestTopic(topics);
    await updateStatus(video.id, 'idea_selected', {
      title: bestTopic.title,
      niche: bestTopic.niche,
      tags: bestTopic.keywords,
      statusDetail: `Selected: ${bestTopic.title}`,
    });

    // Step 3: Generate script
    await updateStatus(video.id, 'script_generated', { statusDetail: 'Generating script with AI...' });
    const script = await retryWithBackoff(() =>
      generateScript(bestTopic.title, bestTopic.niche)
    );
    trackCost('openrouter', COSTS.OPENROUTER_SCRIPT, 'Script generation');
    await updateStatus(video.id, 'script_generated', {
      title: script.title,
      script: script.fullText,
      scriptWordCount: script.wordCount,
      tags: script.tags,
      description: script.seoDescription,
      statusDetail: `Script generated: ${script.wordCount} words`,
    });

    // Step 4: Generate voiceover
    await updateStatus(video.id, 'voiceover_generated', { statusDetail: 'Generating voiceover...' });
    const voiceoverUrl = await retryWithBackoff(() =>
      generateVoiceover(script.fullText)
    );
    trackCost('voiceover', COSTS.VOICEOVER_SCRIPT, 'Voiceover script');
    await updateStatus(video.id, 'voiceover_generated', {
      voiceoverUrl,
      statusDetail: 'Voiceover complete',
    });

    // Step 5: Generate video
    await updateStatus(video.id, 'video_generated', { statusDetail: 'Generating video clips...' });
    const videoUrl = await retryWithBackoff(() =>
      generateVideo({
        script: script.sections,
        voiceoverUrl,
        style: 'cinematic',
      })
    );
    trackCost('video', COSTS.HTML_VIDEO, 'HTML video generation');
    await updateStatus(video.id, 'video_generated', {
      videoUrl,
      statusDetail: 'Video clips generated',
    });

    // Step 6: Generate thumbnail
    await updateStatus(video.id, 'thumbnail_generated', { statusDetail: 'Generating thumbnail...' });
    const thumbnailUrl = await retryWithBackoff(() =>
      generateThumbnail(script.title, video.niche || 'tech')
    );
    trackCost('pollinations', COSTS.POLLINATIONS_THUMBNAIL, 'Thumbnail generation');
    await updateStatus(video.id, 'thumbnail_generated', {
      thumbnailUrl,
      statusDetail: 'Thumbnail generated',
    });

    // Step 7: Combine (for now, videoUrl is the final)
    await updateStatus(video.id, 'combined', {
      combinedUrl: videoUrl,
      statusDetail: 'Assets combined',
    });

    // Step 8: Upload to YouTube
    await updateStatus(video.id, 'uploaded', { statusDetail: 'Uploading to YouTube...' });
    const { youtubeVideoId, youtubeUrl } = await retryWithBackoff(() =>
      uploadToYouTube({
        videoUrl,
        thumbnailUrl,
        title: script.seoTitle,
        description: script.seoDescription,
        tags: script.tags,
        channelId,
        privacyStatus: 'public',
      })
    );

    // Step 9: Mark complete
    await db.updateVideo(video.id, {
      status: 'uploaded',
      youtubeVideoId,
      youtubeUrl,
      youtubeUploadDate: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      estimatedCostCents: COSTS.OPENROUTER_SCRIPT + COSTS.VOICEOVER_SCRIPT + COSTS.HTML_VIDEO + COSTS.POLLINATIONS_THUMBNAIL,
    });

    // Update idea status
    const ideas = await db.getIdeas('discovered');
    const usedIdea = ideas.find((i) => i.title === bestTopic.title);
    if (usedIdea) {
      await db.updateIdea(usedIdea.id, {
        status: 'used',
        usedInVideo: video.id,
        selectedAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      videoId: video.id,
      youtubeUrl,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await db.updateVideo(video.id, {
      status: 'failed',
      statusDetail: errorMsg,
      completedAt: new Date().toISOString(),
    });

    return {
      success: false,
      videoId: video.id,
      error: errorMsg,
    };
  }
}

export async function getPipelineStatus(videoId: string): Promise<{
  video: Video | null;
  progress: {
    stage: PipelineStage;
    status: 'completed' | 'in_progress' | 'failed' | 'pending';
  }[];
} | null> {
  const video = await db.getVideo(videoId);
  if (!video) return null;

  const stages: PipelineStage[] = [
    'trending_fetched',
    'idea_selected',
    'script_generated',
    'voiceover_generated',
    'video_generated',
    'thumbnail_generated',
    'combined',
    'uploaded',
  ];

  const currentStageIndex = stages.indexOf(video.status);
  const isFailed = video.status === 'failed';

  const progress = stages.map((stage, index) => {
    let status: 'completed' | 'in_progress' | 'failed' | 'pending';

    if (index < currentStageIndex) {
      status = 'completed';
    } else if (index === currentStageIndex) {
      status = isFailed ? 'failed' : 'in_progress';
    } else {
      status = 'pending';
    }

    return { stage, status };
  });

  return { video, progress };
}
