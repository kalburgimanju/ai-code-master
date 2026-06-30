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
  description: string;
  targetAudience: string;
  videoLength: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
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
Return JSON with: ideas (array of {title, niche, estimatedViews, competition, keywords, description, targetAudience, videoLength, difficulty}).
Each idea should be a viral YouTube video title (click-worthy but not clickbait).
competition must be "Low", "Medium", or "High".
estimatedViews should be realistic (e.g. "100K-500K").
keywords should be 3-5 relevant tags.
description should be a 2-3 sentence summary of what the video covers, why it would perform well, and the key angle.
targetAudience should describe who would watch this (e.g. "tech enthusiasts", "small business owners").
videoLength should be a realistic duration (e.g. "10:00", "15:00", "8:00").
difficulty should be "Easy", "Medium", or "Hard" based on production complexity.
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
    (idea: { title: string; niche: string; estimatedViews: string; competition: string; keywords: string[]; description: string; targetAudience: string; videoLength: string; difficulty: string }) => ({
      id: crypto.randomUUID(),
      title: idea.title,
      niche: idea.niche || niches[0],
      trendScore: Math.round(70 + Math.random() * 30),
      competition: (['Low', 'Medium', 'High'].includes(idea.competition) ? idea.competition : 'Medium') as 'Low' | 'Medium' | 'High',
      estimatedViews: idea.estimatedViews || '100K-500K',
      keywords: idea.keywords || [],
      source: 'ai_generated',
      createdAt: new Date().toISOString(),
      description: idea.description || 'No description available',
      targetAudience: idea.targetAudience || 'General audience',
      videoLength: idea.videoLength || '10:00',
      difficulty: (['Easy', 'Medium', 'Hard'].includes(idea.difficulty) ? idea.difficulty : 'Medium') as 'Easy' | 'Medium' | 'Hard',
    })
  );
}

function getFallbackTopics(niche: string): GeneratedIdea[] {
  const fallbackData: Record<string, { title: string; description: string; targetAudience: string; videoLength: string; difficulty: 'Easy' | 'Medium' | 'Hard' }[]> = {
    AI: [
      { title: '10 AI Agents That Run Your Entire Business', description: 'Explore the top AI agents that are revolutionizing business operations in 2026. From customer service bots to autonomous decision-makers, these tools are changing how companies operate at scale.', targetAudience: 'Tech entrepreneurs', videoLength: '12:00', difficulty: 'Easy' },
      { title: 'Why AI Will Replace 50% of Jobs by 2027', description: 'A deep dive into which industries are most vulnerable to AI automation and how workers can prepare. Includes statistics, expert predictions, and actionable career pivot strategies.', targetAudience: 'Working professionals', videoLength: '15:00', difficulty: 'Medium' },
      { title: 'The AI Tool That Writes Code Better Than Senior Devs', description: 'We benchmarked the latest AI coding assistants against senior developers in real-world projects. The results are shocking — find out which tools came out on top.', targetAudience: 'Software developers', videoLength: '18:00', difficulty: 'Hard' },
    ],
    startups: [
      { title: 'How I Built a $1M Startup in 6 Months', description: 'A transparent breakdown of how I took an idea to $1M ARR in just 6 months. Covers product-market fit, pricing strategy, and the exact playbook I followed.', targetAudience: 'Aspiring founders', videoLength: '20:00', difficulty: 'Medium' },
      { title: '5 Startup Mistakes That Kill 90% of Companies', description: 'After analyzing 500+ failed startups, these are the most common fatal errors. Learn from others mistakes before they cost you everything.', targetAudience: 'Early-stage founders', videoLength: '14:00', difficulty: 'Easy' },
      { title: 'The Lean Startup Method Nobody Talks About', description: 'Beyond the basics of lean methodology — uncover the advanced techniques that successful founders use to validate ideas in days, not months.', targetAudience: 'Product managers', videoLength: '16:00', difficulty: 'Medium' },
    ],
    realestate: [
      { title: 'How to Start in Real Estate with No Money', description: 'Creative financing strategies that let you break into real estate without a large down payment. Includes seller financing, house hacking, and partnership models.', targetAudience: 'First-time investors', videoLength: '22:00', difficulty: 'Medium' },
      { title: 'The Real Estate Strategy That Made Me $500K', description: 'My exact strategy for building wealth through rental properties. I share every detail — from finding deals to managing tenants and scaling your portfolio.', targetAudience: 'Real estate investors', videoLength: '25:00', difficulty: 'Hard' },
      { title: 'Why Real Estate Is the Best Investment in 2026', description: 'With inflation rising and markets volatile, real estate stands out as the most reliable wealth builder. Data-backed analysis of why now is the time to invest.', targetAudience: 'General investors', videoLength: '18:00', difficulty: 'Easy' },
    ],
    automation: [
      { title: 'How to Automate Your Entire Business with AI', description: 'A step-by-step guide to automating every aspect of your business using free and low-cost AI tools. Save 40+ hours per week with these proven systems.', targetAudience: 'Small business owners', videoLength: '20:00', difficulty: 'Medium' },
      { title: '5 Automations That Save 20 Hours Per Week', description: 'These five automations have transformed how I work. Each one saves hours every week and they work together to create a fully automated workflow.', targetAudience: 'Freelancers', videoLength: '12:00', difficulty: 'Easy' },
      { title: 'No-Code Automation Tools You Need Right Now', description: 'The best no-code tools for building powerful automations without writing a single line of code. Includes setup tutorials and workflow templates.', targetAudience: 'Non-technical users', videoLength: '15:00', difficulty: 'Easy' },
    ],
    productivity: [
      { title: 'The Morning Routine That Changed My Life', description: 'After testing hundreds of morning routines, I found the one that actually works. This 60-minute routine has 10x my output and energy levels.', targetAudience: 'High performers', videoLength: '10:00', difficulty: 'Easy' },
      { title: 'How to 10x Your Productivity in 30 Days', description: 'A proven 30-day challenge that systematically eliminates distractions, builds focus habits, and creates systems that compound over time.', targetAudience: 'Students and professionals', videoLength: '16:00', difficulty: 'Medium' },
      { title: 'Why Most Productivity Advice Is Wrong', description: 'The productivity industry is built on myths. This video debunks the most popular advice and replaces it with what actually works based on neuroscience.', targetAudience: 'Self-improvement enthusiasts', videoLength: '14:00', difficulty: 'Easy' },
    ],
    finance: [
      { title: '5 Passive Income Ideas for 2026', description: 'Realistic passive income streams you can build this year. No get-rich-quick schemes — just proven methods that require upfront work but pay dividends.', targetAudience: 'Side hustlers', videoLength: '18:00', difficulty: 'Medium' },
      { title: 'How to Build Wealth from Scratch', description: 'Starting with zero savings? This step-by-step wealth-building framework covers budgeting, investing, and compound growth strategies that actually work.', targetAudience: 'Young adults', videoLength: '22:00', difficulty: 'Easy' },
      { title: 'The Truth About Cryptocurrency Nobody Tells You', description: 'Beyond the hype — a realistic look at crypto investing in 2026. What works, what doesnt, and how to protect yourself from common traps.', targetAudience: 'Investors', videoLength: '16:00', difficulty: 'Medium' },
    ],
    tech: [
      { title: '10 Hidden Features on Your Phone You Never Knew', description: 'Your smartphone has powerful features hiding in plain sight. From developer options to automation shortcuts, these tips will change how you use your device.', targetAudience: 'General tech users', videoLength: '10:00', difficulty: 'Easy' },
      { title: 'The Tech Startup That Will Change Everything', description: 'Inside the stealth startup that VCs are calling the next unicorn. Exclusive look at their product, team, and the massive market they are targeting.', targetAudience: 'Tech enthusiasts', videoLength: '14:00', difficulty: 'Medium' },
      { title: 'Why Everyone Is Switching to This New Browser', description: 'A privacy-focused browser has taken the tech world by storm. We explore why millions are switching and whether it lives up to the hype.', targetAudience: 'Privacy-conscious users', videoLength: '12:00', difficulty: 'Easy' },
    ],
    psychology: [
      { title: 'Dark Psychology Tricks That Actually Work', description: 'Uncover the psychological techniques used by top negotiators, salespeople, and influencers. Understanding these gives you a massive social advantage.', targetAudience: 'Self-improvement enthusiasts', videoLength: '15:00', difficulty: 'Medium' },
      { title: 'Why Your Brain Lies to You Every Day', description: 'Cognitive biases shape every decision you make. This video reveals the most common biases and how to override them for better decision-making.', targetAudience: 'General audience', videoLength: '12:00', difficulty: 'Easy' },
      { title: 'The Science Behind Procrastination', description: 'Procrastination is not laziness — its a complex psychological phenomenon. Neuroscience reveals why we procrastinate and the proven methods to stop.', targetAudience: 'Students and professionals', videoLength: '14:00', difficulty: 'Easy' },
    ],
    motivation: [
      { title: 'Why Successful People Wake Up at 5 AM', description: 'The science behind early rising and how it correlates with success. Includes practical tips for becoming a morning person without burning out.', targetAudience: 'Aspiring achievers', videoLength: '10:00', difficulty: 'Easy' },
      { title: 'The 5-Second Rule That Changes Everything', description: 'A simple psychological trick that can transform your confidence, productivity, and courage. Backed by research and real-world success stories.', targetAudience: 'General audience', videoLength: '12:00', difficulty: 'Easy' },
      { title: 'How to Build Unbreakable Discipline', description: 'Discipline is not about willpower — its about systems. Learn the framework that helps you stay consistent even when motivation fades.', targetAudience: 'Goal-oriented individuals', videoLength: '16:00', difficulty: 'Medium' },
    ],
    entertainment: [
      { title: 'Scary Facts That Sound Fake But Are 100% True', description: 'A collection of mind-blowing facts that will make you question reality. From deep ocean mysteries to space anomalies — each one is verified and terrifying.', targetAudience: 'Curious minds', videoLength: '14:00', difficulty: 'Easy' },
      { title: 'The Most Bizarre Things Found on Google Maps', description: 'Google Maps has revealed some truly strange discoveries. From mysterious structures to unexplained phenomena, these finds will leave you speechless.', targetAudience: 'Mystery enthusiasts', videoLength: '12:00', difficulty: 'Easy' },
      { title: 'Movies That Predicted the Future', description: 'Filmmakers predicted technology and events decades before they happened. A fascinating look at cinema that saw the future before anyone else.', targetAudience: 'Movie fans', videoLength: '18:00', difficulty: 'Medium' },
    ],
  };

  const topics = fallbackData[niche] || fallbackData.tech;

  return topics.map((topic, i) => ({
    id: crypto.randomUUID(),
    title: topic.title,
    niche,
    trendScore: Math.round(70 + Math.random() * 30),
    competition: (['Low', 'Medium', 'High'] as const)[i % 3],
    estimatedViews: `${Math.floor(Math.random() * 500 + 100)}K`,
    keywords: topic.title.toLowerCase().split(' ').filter((w) => w.length > 3).slice(0, 4),
    source: 'fallback',
    createdAt: new Date().toISOString(),
    description: topic.description,
    targetAudience: topic.targetAudience,
    videoLength: topic.videoLength,
    difficulty: topic.difficulty,
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
