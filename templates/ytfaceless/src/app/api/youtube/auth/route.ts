import { NextResponse } from 'next/server';
import { getYouTubeAuthUrl } from '@/lib/youtube';

export async function GET() {
  try {
    const url = getYouTubeAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('YouTube auth failed:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'YouTube auth failed' },
      { status: 500 }
    );
  }
}
