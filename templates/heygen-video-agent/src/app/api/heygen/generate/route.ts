import { NextRequest, NextResponse } from 'next/server';
import { generateVideo, listAvatars } from '@/lib/heygen';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      apiKey: clientApiKey,
      prompt,
      aspectRatio = '16:9',
      avatarIds,
      title,
      duration,
      autoDuration = false,
      enhancePrompt = true,
    } = body;

    const apiKey = process.env.HEYGEN_API_KEY || clientApiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'HeyGen API key is required. Provide it in the request body or set HEYGEN_API_KEY in .env' },
        { status: 400 }
      );
    }

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'A prompt description is required' },
        { status: 400 }
      );
    }

    // Validate aspect ratio
    const validRatios = ['16:9', '9:16', '1:1'];
    const resolvedAspect = validRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    const result = await generateVideo({
      apiKey,
      prompt,
      avatarIds: avatarIds || [],
      aspectRatio: resolvedAspect as '16:9' | '9:16' | '1:1',
      title: title || prompt.slice(0, 60),
      duration: duration || undefined,
      autoDuration: autoDuration,
      enhancePrompt: enhancePrompt,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // GET /api/heygen/generate returns available avatars (discovery)
  try {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'HEYGEN_API_KEY not configured in .env' },
        { status: 400 }
      );
    }

    const avatars = await listAvatars(apiKey);
    return NextResponse.json({ avatars });
  } catch (error) {
    console.error('List avatars error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
