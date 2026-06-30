import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getChannelInfo } from '@/lib/youtube';
import * as db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    const tokens = await exchangeCodeForTokens(code);
    const channelInfo = await getChannelInfo(tokens.accessToken);

    // Create or update channel
    const existingChannels = await db.getAllChannels();
    const existingChannel = existingChannels.find(
      (c) => c.youtubeChannelId === channelInfo.channelId
    );

    if (existingChannel) {
      await db.updateChannel(existingChannel.id, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        subscriberCount: channelInfo.subscriberCount,
      });
    } else {
      await db.createChannel({
        name: channelInfo.title,
        youtubeChannelId: channelInfo.channelId,
        thumbnailUrl: channelInfo.thumbnailUrl,
        subscriberCount: channelInfo.subscriberCount,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
      });
    }

    return NextResponse.redirect(new URL('/?connected=true', request.url));
  } catch (error) {
    console.error('YouTube callback failed:', error);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent((error as Error).message)}`, request.url)
    );
  }
}
