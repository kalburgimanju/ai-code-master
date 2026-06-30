import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  const channels = await db.getAllChannels();
  return NextResponse.json({ channels });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, youtubeChannelId, niche } = body;

    if (!name || !youtubeChannelId || !niche) {
      return NextResponse.json(
        { error: 'name, youtubeChannelId, and niche are required' },
        { status: 400 }
      );
    }

    const channel = await db.createChannel({
      name,
      youtubeChannelId,
      niche,
      accessToken: '',
      refreshToken: '',
      tokenExpiresAt: new Date().toISOString(),
      subscriberCount: 0,
      totalViews: 0,
      videoCount: 0,
      uploadHourUtc: 12,
      isActive: true,
    });

    return NextResponse.json({ channel });
  } catch (error) {
    console.error('Channel creation failed:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Channel creation failed' },
      { status: 500 }
    );
  }
}
