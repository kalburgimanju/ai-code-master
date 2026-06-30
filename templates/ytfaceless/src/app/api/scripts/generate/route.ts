import { NextRequest, NextResponse } from 'next/server';
import { generateScript } from '@/lib/ai';
import { trackCost, COSTS } from '@/lib/cost-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, niche, duration } = body;

    if (!topic || !niche) {
      return NextResponse.json(
        { error: 'topic and niche are required' },
        { status: 400 }
      );
    }

    const script = await generateScript(topic, niche, duration || 600);
    trackCost('openai', COSTS.OPENAI_SCRIPT, `Script: ${topic}`);

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Script generation failed:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Script generation failed' },
      { status: 500 }
    );
  }
}
