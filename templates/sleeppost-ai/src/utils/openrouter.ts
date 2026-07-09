const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

function getApiKey(): string {
  // Check localStorage first (user-configured via Settings)
  try {
    const stored = localStorage.getItem('sleeppost_api_key');
    if (stored) return stored;
  } catch { /* ignore */ }

  // Fallback to .env variable
  try {
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (envKey) return envKey;
  } catch { /* ignore */ }

  return '';
}

export function setApiKey(key: string): void {
  localStorage.setItem('sleeppost_api_key', key);
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

export async function generateWithAI(
  prompt: string,
  systemPrompt: string = 'You are a creative social media content generator.'
): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return generateSimulatedContent(prompt);
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SleepPost AI',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.warn('OpenRouter API error, falling back to simulated content');
      return generateSimulatedContent(prompt);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || generateSimulatedContent(prompt);
  } catch (error) {
    console.warn('OpenRouter API call failed, using simulated content:', error);
    return generateSimulatedContent(prompt);
  }
}

function generateSimulatedContent(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('tweet') || lowerPrompt.includes('twitter')) {
    return pickRandom([
      'Just shipped a new feature that our users have been requesting for months. The feedback loop is everything. Building in public is the way. #BuildInPublic #SaaS',
      'Hot take: The best marketing is making something people actually want to talk about. Stop gaming algorithms, start solving problems. #StartupLife',
      '3 things I learned this week:\n1. Speed > perfection\n2. Users tell you exactly what to build\n3. Sleep is not optional (but AI posting is)\n#LessonsLearned',
      'Our AI agent just generated its 10,000th post today. The content quality keeps improving. This is the future of social media management. #AI #Automation',
      'Unpopular opinion: Most social media advice is generic garbage. Your audience is unique. Your content should be too. #ContentStrategy',
    ]);
  }

  if (lowerPrompt.includes('linkedin')) {
    return pickRandom([
      'I am excited to share that we just crossed 10,000 active users on SleepPost AI.\n\nWhen we started this journey, people said AI-generated social media content would feel robotic.\n\nThey were wrong.\n\nOur users report 3x higher engagement rates compared to manual posting.\n\nThe key insight: AI does not replace creativity. It amplifies it.\n\nHere is what we learned building autonomous social media agents:\n\n1. Personalization is non-negotiable\n2. Timing matters more than content quality\n3. Consistency beats virality every time\n\n#AI #SocialMedia #Startup #Growth',
      'The future of work is not humans vs AI.\n\nIt is humans WITH AI.\n\nOur marketing agent autonomously creates campaigns, writes blog posts, and tracks performance 24/7.\n\nThe result? Our team focuses on strategy while AI handles execution.\n\nWe have saved 40+ hours per week on content creation alone.\n\nThis is not science fiction. This is Tuesday.\n\n#FutureOfWork #AI #Productivity',
    ]);
  }

  if (lowerPrompt.includes('instagram')) {
    return pickRandom([
      'Your brand does not sleep. Neither should your content. \n\nMeet SleepPost AI - the social media manager that works while you dream. \n\n#SocialMediaMarketing #AI #ContentCreation #DigitalMarketing #BrandBuilding',
      'POV: You wake up to 200 new followers because your AI agent posted the perfect content at 3 AM.\n\nThis is not a dream. This is SleepPost AI.\n\n#AIMarketing #GrowthHacking #SocialMedia #ContentStrategy',
    ]);
  }

  if (lowerPrompt.includes('blog') || lowerPrompt.includes('article')) {
    return pickRandom([
      '## How AI Agents Are Revolutionizing Social Media Management\n\nThe social media landscape has changed dramatically. With platforms demanding more content than ever, creators and businesses are turning to AI-powered solutions.\n\nSleepPost AI represents the next evolution: autonomous agents that not only create content but manage your entire social media presence.\n\n### The Problem\n\nManaging social media across multiple platforms is a full-time job. Most creators spend 4-6 hours daily on content creation alone.\n\n### The Solution\n\nAI agents that understand your brand voice, create platform-specific content, and post at optimal times.',
      '## Why Autonomous Marketing Agents Are the Future\n\nImagine having a marketing team that works 24/7, never takes breaks, and continuously optimizes your campaigns.\n\nThat is exactly what autonomous marketing agents deliver.\n\n### What Makes Them Different?\n\nUnlike traditional marketing tools, autonomous agents do not just schedule posts. They create entire campaigns, analyze performance, and adapt strategies in real-time.',
    ]);
  }

  if (lowerPrompt.includes('marketing') || lowerPrompt.includes('promotional')) {
    return pickRandom([
      'Stop spending hours on social media. Let AI handle it while you sleep. Try SleepPost AI free today.',
      'Your competitors are already using AI for social media. Get ahead with autonomous content agents that work 24/7.',
      'What if your social media grew while you slept? With SleepPost AI, it does. AI avatars, smart scheduling, and autonomous content generation.',
    ]);
  }

  return pickRandom([
    'The future of social media is autonomous. AI agents that create, schedule, and optimize your content around the clock.',
    'Consistency is the key to social media growth. AI makes consistency effortless.',
    'Your online presence should not depend on how many hours you can stay awake. Let AI handle the posting.',
    'Great content takes time. AI gives you that time back while maintaining quality.',
  ]);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
