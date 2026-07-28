import { NextRequest, NextResponse } from 'next/server';
import { getVideoStatus } from '@/lib/heygen';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('video_id');
    const clientApiKey = searchParams.get('api_key');
    const apiKey = process.env.HEYGEN_API_KEY || clientApiKey;

    if (!videoId) {
      return NextResponse.json(
        { error: 'video_id query parameter is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Provide it via the api_key query param or set HEYGEN_API_KEY in .env' },
        { status: 400 }
      );
    }

    const result = await getVideoStatus(apiKey, videoId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
