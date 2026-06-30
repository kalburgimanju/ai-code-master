import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { discoverTrendingTopics } from '@/lib/trends';

export async function GET() {
  try {
    const ideas = await db.getIdeas();
    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Get ideas failed:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to get ideas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niches } = body;

    if (!niches || !Array.isArray(niches) || niches.length === 0) {
      return NextResponse.json(
        { error: 'niches array is required' },
        { status: 400 }
      );
    }

    const topics = await discoverTrendingTopics(niches);

    // Save discovered ideas to database
    const savedIdeas = [];
    for (const topic of topics) {
      const idea = await db.createIdea({
        channelId: '',
        title: topic.title,
        niche: topic.niche,
        source: topic.source,
        trendScore: topic.trendScore,
        competition: topic.competition,
        estimatedViews: topic.estimatedViews,
        keywords: topic.keywords,
        status: 'discovered',
        selectedAt: '',
        usedInVideo: '',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      savedIdeas.push(idea);
    }

    return NextResponse.json({ ideas: savedIdeas });
  } catch (error) {
    console.error('Discover ideas failed:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to discover ideas' },
      { status: 500 }
    );
  }
}
