import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST() {
  try {
    const channels = await db.getAllChannels();
    for (const channel of channels) {
      await db.deleteChannel(channel.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect failed:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Disconnect failed' },
      { status: 500 }
    );
  }
}
