import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/openrouter';

// Generate a still frame / thumbnail via an OpenRouter image model.
// Body: { prompt: string, size?: string }
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt, size } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ ok: false, error: 'prompt is required' }, { status: 400 });
    }
    const img = await generateImage(prompt, { size });
    return NextResponse.json({ ok: true, ...img });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
