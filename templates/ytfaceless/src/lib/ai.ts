import type { GeneratedScript } from '@/types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function generateScript(
  topic: string,
  niche: string,
  targetDurationSeconds: number = 600
): Promise<GeneratedScript> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // Calculate target word count (avg 130 words/minute for narration)
  const targetWords = Math.round((targetDurationSeconds / 60) * 130);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
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
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  // Build full text for voiceover
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
