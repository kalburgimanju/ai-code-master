import { NextRequest, NextResponse } from 'next/server';
import { generateAllIdeas } from '@/lib/trends';

export async function GET() {
  return NextResponse.json({ message: 'Use /api/auto-ideas instead' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niches } = body;

    if (!niches || !Array.isArray(niches) || niches.length === 0) {
      return NextResponse.json({ error: 'niches array is required' }, { status: 400 });
    }

    const ideas = await generateAllIdeas(niches);
    return NextResponse.json({ ideas, count: ideas.length });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
