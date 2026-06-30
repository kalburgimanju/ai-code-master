import { NextRequest, NextResponse } from 'next/server';
import { generateAllIdeas, getNiches } from '@/lib/trends';

export async function GET() {
  try {
    const niches = getNiches();
    return NextResponse.json({
      availableNiches: niches,
      message: 'Use POST to generate ideas. GET returns available niches.',
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const niches = body.niches || getNiches();

    const ideas = await generateAllIdeas(niches);

    return NextResponse.json({
      generated: ideas.length,
      ideas,
    });
  } catch (error) {
    console.error('Auto-ideas generation failed:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
