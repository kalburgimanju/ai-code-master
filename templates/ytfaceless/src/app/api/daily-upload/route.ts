import { NextRequest, NextResponse } from 'next/server';
import { runDailyPipeline } from '@/lib/pipeline';
import * as db from '@/lib/db';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const channels = await db.getActiveChannels();
  if (channels.length === 0) {
    return NextResponse.json({ message: 'No active channels', uploaded: 0 });
  }

  const results = [];
  for (const channel of channels) {
    try {
      const result = await runDailyPipeline(channel.id);
      results.push({ channelId: channel.id, channelName: channel.name, ...result });
    } catch (error) {
      results.push({ channelId: channel.id, channelName: channel.name, success: false, error: (error as Error).message });
    }
  }

  return NextResponse.json({ message: `Pipeline complete for ${channels.length} channel(s)`, results });
}
