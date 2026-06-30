import type { TrendingTopic } from '@/types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const NICHES = [
  'AI',
  'startups',
  'realestate',
  'automation',
  'productivity',
  'finance',
  'tech',
  'psychology',
  'motivation',
  'entertainment',
];

// Free models with fallback
const FREE_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-31b-it:free',
  'openai/gpt-oss-120b:free',
];

export function getNiches(): string[] {
  return NICHES;
}

export interface GeneratedIdea {
  id: string;
  title: string;
  niche: string;
  trendScore: number;
  competition: 'Low' | 'Medium' | 'High';
  estimatedViews: string;
  keywords: string[];
  source: string;
  createdAt: string;
}

// Generate ideas across all niches
export async function generateAllIdeas(niches: string[]): Promise<GeneratedIdea[]> {
  if (!OPENROUTER_API_KEY) {
    return niches.flatMap((n) => getFallbackTopics(n));
  }

  for (const model of FREE_MODELS) {
    try {
      return await generateWithModel(model, niches);
    } catch {
      continue;
    }
  }

  return niches.flatMap((n) => getFallbackTopics(n));
}

async function generateWithModel(model: string, niches: string[]): Promise<GeneratedIdea[]> {
  const nicheList = niches.join(', ');
  const countPerNiche = Math.ceil(30 / niches.length);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://ytfaceless.vercel.app',
      'X-Title': 'FaceFlow Ideas',
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a YouTube trend analyst. Generate exactly 30 trending video ideas across these niches: ${nicheList}.
Assign ${countPerNiche} ideas per niche (30 total).
Return JSON with: ideas (array of {title, niche, estimatedViews, competition, keywords}).
Each idea should be a viral YouTube video title (click-worthy but not clickbait).
competition must be "Low", "Medium", or "High".
estimatedViews should be realistic (e.g. "100K-500K").
keywords should be 3-5 relevant tags.
The niche field must exactly match one of: ${nicheList}`,
        },
        {
          role: 'user',
          content: `Generate 30 trending YouTube video ideas — ${countPerNiche} per niche across: ${nicheList}. Focus on topics trending in 2026. Make titles click-worthy and viral.`,
        },
      ],
      temperature: 0.9,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  const rawIdeas = content.ideas || content;

  if (!Array.isArray(rawIdeas)) {
    throw new Error('Invalid response format');
  }

  return rawIdeas.map(
    (idea: { title: string; niche: string; estimatedViews: string; competition: string; keywords: string[] }) => ({
      id: crypto.randomUUID(),
      title: idea.title,
      niche: idea.niche || niches[0],
      trendScore: Math.round(70 + Math.random() * 30),
      competition: (['Low', 'Medium', 'High'].includes(idea.competition) ? idea.competition : 'Medium') as 'Low' | 'Medium' | 'High',
      estimatedViews: idea.estimatedViews || '100K-500K',
      keywords: idea.keywords || [],
      source: 'ai_generated',
      createdAt: new Date().toISOString(),
    })
  );
}

function getFallbackTopics(niche: string): GeneratedIdea[] {
  const topicsByNiche: Record<string, string[]> = {
    AI: [
      '10 AI Agents That Run Your Entire Business',
      'Why AI Will Replace 50% of Jobs by 2027',
      'The AI Tool That Writes Code Better Than Senior Devs',
    ],
    startups: [
      'How I Built a $1M Startup in 6 Months',
      '5 Startup Mistakes That Kill 90% of Companies',
      'The Lean Startup Method Nobody Talks About',
    ],
    realestate: [
      'How to Start in Real Estate with No Money',
      'The Real Estate Strategy That Made Me $500K',
      'Why Real Estate Is the Best Investment in 2026',
    ],
    automation: [
      'How to Automate Your Entire Business with AI',
      '5 Automations That Save 20 Hours Per Week',
      'No-Code Automation Tools You Need Right Now',
    ],
    productivity: [
      'The Morning Routine That Changed My Life',
      'How to 10x Your Productivity in 30 Days',
      'Why Most Productivity Advice Is Wrong',
    ],
    finance: [
      '5 Passive Income Ideas for 2026',
      'How to Build Wealth from Scratch',
      'The Truth About Cryptocurrency Nobody Tells You',
    ],
    tech: [
      '10 Hidden Features on Your Phone You Never Knew',
      'The Tech Startup That Will Change Everything',
      'Why Everyone Is Switching to This New Browser',
    ],
    psychology: [
      'Dark Psychology Tricks That Actually Work',
      'Why Your Brain Lies to You Every Day',
      'The Science Behind Procrastination',
    ],
    motivation: [
      'Why Successful People Wake Up at 5 AM',
      'The 5-Second Rule That Changes Everything',
      'How to Build Unbreakable Discipline',
    ],
    entertainment: [
      'Scary Facts That Sound Fake But Are 100% True',
      'The Most Bizarre Things Found on Google Maps',
      'Movies That Predicted the Future',
    ],
  };

  const titles = topicsByNiche[niche] || topicsByNiche.tech;

  return titles.map((title, i) => ({
    id: crypto.randomUUID(),
    title,
    niche,
    trendScore: Math.round(70 + Math.random() * 30),
    competition: (['Low', 'Medium', 'High'] as const)[i % 3],
    estimatedViews: `${Math.floor(Math.random() * 500 + 100)}K`,
    keywords: title.toLowerCase().split(' ').filter((w) => w.length > 3).slice(0, 4),
    source: 'fallback',
    createdAt: new Date().toISOString(),
  }));
}

export async function selectBestTopic(topics: TrendingTopic[]): Promise<TrendingTopic> {
  const competitionWeights = { Low: 0.2, Medium: 0.5, High: 0.8 };
  const scored = topics.map((t) => ({
    ...t,
    finalScore: t.trendScore * (1 - competitionWeights[t.competition] * 0.5),
  }));
  scored.sort((a, b) => b.finalScore - a.finalScore);
  return scored[0];
}
