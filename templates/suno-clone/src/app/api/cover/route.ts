import { NextRequest, NextResponse } from 'next/server';
import { generateCover } from '@/lib/huggingface';

// Free cover-art generation via Pollinations.
// Body: { prompt: string }
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ ok: false, error: 'prompt is required' }, { status: 400 });
    }
    const cover = await generateCover(prompt);
    if (cover.error) return NextResponse.json({ ok: false, error: cover.error }, { status: 502 });
    return NextResponse.json({ ok: true, ...cover });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
