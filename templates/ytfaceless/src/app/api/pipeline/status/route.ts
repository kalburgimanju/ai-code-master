import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (videoId) {
      const video = await db.getVideo(videoId);
      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }
      return NextResponse.json({ video });
    }

    // Return all videos with their status
    const channels = await db.getAllChannels();
    const allVideos = [];

    for (const channel of channels) {
      const videos = await db.getVideosByChannel(channel.id, 10);
      allVideos.push(...videos);
    }

    return NextResponse.json({ videos: allVideos });
  } catch (error) {
    console.error('Pipeline status failed:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to get pipeline status' },
      { status: 500 }
    );
  }
}
