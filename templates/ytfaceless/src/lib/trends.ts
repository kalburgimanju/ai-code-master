import type { TrendingTopic } from '@/types';
import * as db from './db';

// Google Trends RSS feed URLs by category
const TREND_RSS_URLS: Record<string, string> = {
  tech: 'https://trends.google.com/trending/rss?geo=US&category=5',  // Technology
  psychology: 'https://trends.google.com/trending/rss?geo=US&category=9',  // Health
  motivation: 'https://trends.google.com/trending/rss?geo=US&category=6',  // People & Society
  finance: 'https://trends.google.com/trending/rss?geo=US&category=7',  // Business
  entertainment: 'https://trends.google.com/trending/rss?geo=US&category=3',  // Entertainment
  culture: 'https://trends.google.com/trending/rss?geo=US&category=4',  // Travel
};

export async function discoverTrendingTopics(
  niches: string[]
): Promise<TrendingTopic[]> {
  const allTopics: TrendingTopic[] = [];

  for (const niche of niches) {
    try {
      const topics = await fetchTrendsForNiche(niche);
      allTopics.push(...topics);
    } catch (error) {
      console.error(`Failed to fetch trends for ${niche}:`, error);
      // Fallback to mock data
      allTopics.push(...getFallbackTopics(niche));
    }
  }

  // Sort by trend score descending
  return allTopics.sort((a, b) => b.trendScore - a.trendScore);
}

async function fetchTrendsForNiche(niche: string): Promise<TrendingTopic[]> {
  const rssUrl = TREND_RSS_URLS[niche.toLowerCase()] || TREND_RSS_URLS.tech;

  // In production, parse RSS feed
  // For now, generate realistic trending topics
  return getFallbackTopics(niche);
}

function getFallbackTopics(niche: string): TrendingTopic[] {
  const topicsByNiche: Record<string, { title: string; keywords: string[] }[]> = {
    tech: [
      { title: '10 AI Tools Nobody Is Talking About in 2026', keywords: ['ai tools', 'artificial intelligence', 'productivity'] },
      { title: 'Why Everyone Is Switching to This New Browser', keywords: ['browser', 'chrome alternative', 'privacy'] },
      { title: 'The Secret Feature in Your Phone You Never Knew', keywords: ['smartphone', 'hidden feature', 'tips'] },
    ],
    psychology: [
      { title: 'Dark Psychology Tricks That Actually Work', keywords: ['dark psychology', 'manipulation', 'body language'] },
      { title: 'Why Your Brain Lies to You Every Day', keywords: ['brain', 'cognitive bias', 'psychology'] },
      { title: 'The Science Behind Procrastination', keywords: ['procrastination', 'productivity', 'psychology'] },
    ],
    motivation: [
      { title: 'Why Successful People Wake Up at 5 AM', keywords: ['morning routine', 'success', 'productivity'] },
      { title: 'The 5-Second Rule That Changes Everything', keywords: ['motivation', 'habit', 'change'] },
      { title: 'How to Build Unbreakable Discipline', keywords: ['discipline', 'habits', 'self-improvement'] },
    ],
    finance: [
      { title: '5 Passive Income Ideas for 2026', keywords: ['passive income', 'side hustle', 'money'] },
      { title: 'Why Your Savings Account Is Losing Money', keywords: ['savings', 'inflation', 'investing'] },
      { title: 'The Truth About Cryptocurrency Nobody Tells You', keywords: ['crypto', 'bitcoin', 'investing'] },
    ],
    entertainment: [
      { title: 'Scary Facts That Sound Fake But Are 100% True', keywords: ['facts', 'scary', 'mystery'] },
      { title: 'The Most Bizarre Things Found on Google Maps', keywords: ['google maps', 'mystery', 'bizarre'] },
      { title: 'Movies That Predicted the Future', keywords: ['movies', 'predictions', 'future'] },
    ],
    culture: [
      { title: 'Why Japan Is Nothing Like You Think', keywords: ['japan', 'culture', 'travel'] },
      { title: 'Countries That Don\'t Exist Anymore', keywords: ['countries', 'history', 'geography'] },
      { title: 'The Most Dangerous Places on Earth', keywords: ['dangerous', 'travel', 'adventure'] },
    ],
  };

  const topics = topicsByNiche[niche.toLowerCase()] || topicsByNiche.tech;

  return topics.map((t, i) => ({
    title: t.title,
    niche,
    trendScore: 90 - i * 5 + Math.random() * 10,
    competition: (['Low', 'Medium', 'High'] as const)[Math.floor(Math.random() * 3)],
    estimatedViews: `${Math.floor(Math.random() * 500 + 100)}K`,
    keywords: t.keywords,
    source: 'google_trends',
  }));
}

export async function selectBestTopic(topics: TrendingTopic[]): Promise<TrendingTopic> {
  // Score = trendScore * (1 - competitionWeight)
  // Low competition = 0.2 weight, Medium = 0.5, High = 0.8
  const competitionWeights = { Low: 0.2, Medium: 0.5, High: 0.8 };

  const scored = topics.map((t) => ({
    ...t,
    finalScore: t.trendScore * (1 - competitionWeights[t.competition] * 0.5),
  }));

  // Sort by final score and return the best
  scored.sort((a, b) => b.finalScore - a.finalScore);
  return scored[0];
}
