import type { GeneratedScript } from '@/types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Free models on OpenRouter (no cost)
const FREE_MODELS = [
  'openrouter/free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-31b-it:free',
  'openai/gpt-oss-120b:free',
];

export async function generateScript(
  topic: string,
  niche: string,
  targetDurationSeconds: number = 600
): Promise<GeneratedScript> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const targetWords = Math.round((targetDurationSeconds / 60) * 130);

  // Try free models in order, fall back to next if one fails
  let lastError: string = '';

  for (const model of FREE_MODELS) {
    try {
      const result = await tryGenerateScript(model, topic, niche, targetWords, targetDurationSeconds);
      return result;
    } catch (err) {
      lastError = (err as Error).message;
      console.warn(`Model ${model} failed: ${lastError}, trying next...`);
    }
  }

  throw new Error(`All free models failed. Last error: ${lastError}`);
}

async function tryGenerateScript(
  model: string,
  topic: string,
  niche: string,
  targetWords: number,
  targetDurationSeconds: number
): Promise<GeneratedScript> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://ytfaceless.vercel.app',
      'X-Title': 'FaceFlow YouTube Automation',
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert YouTube scriptwriter for faceless channels in the ${niche} niche.
Write engaging, viral scripts optimized for watch time and retention.
Target length: ~${targetWords} words (${targetDurationSeconds} seconds of narration).
Return JSON with: title, hook, sections (array of {heading, content}), cta, tags, seoTitle, seoDescription.
The hook must grab attention in the first 5 seconds.
Each section should be 2-3 paragraphs.
CTA should encourage subscribing and watching the next video.
seoTitle should be under 60 characters with the main keyword.
seoDescription should be 2-3 sentences with keywords naturally included.
Tags should be 10-15 relevant tags.`,
        },
        {
          role: 'user',
          content: `Create a complete YouTube script about: "${topic}" in the ${niche} niche.
Make it engaging, informative, and optimized for algorithm performance.
The title should be click-worthy but not clickbait.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(`OpenRouter API error (${model}): ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  const fullText = [
    content.hook,
    ...content.sections.flatMap((s: { heading: string; content: string }) => [
      s.heading,
      s.content,
    ]),
    content.cta,
  ].join('\n\n');

  return {
    title: content.title,
    hook: content.hook,
    sections: content.sections,
    cta: content.cta,
    tags: content.tags || [],
    seoTitle: content.seoTitle || content.title,
    seoDescription: content.seoDescription || '',
    fullText,
    wordCount: fullText.split(/\s+/).length,
  };
}

// Get available free models
export async function getFreeModels(): Promise<string[]> {
  return FREE_MODELS;
}
