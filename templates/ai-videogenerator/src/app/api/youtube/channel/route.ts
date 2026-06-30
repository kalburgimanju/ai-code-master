import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  try {
    const channels = await db.getAllChannels();
    const channel = channels.length > 0 ? channels[0] : null;

    return NextResponse.json({
      channel: channel
        ? {
            id: channel.id,
            name: channel.name,
            youtubeChannelId: channel.youtubeChannelId,
            thumbnailUrl: channel.thumbnailUrl,
            subscriberCount: channel.subscriberCount,
          }
        : null,
    });
  } catch (error) {
    console.error('Failed to fetch channel:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch channel' },
      { status: 500 }
    );
  }
}
