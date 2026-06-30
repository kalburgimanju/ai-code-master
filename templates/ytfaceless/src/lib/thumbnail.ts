import { uploadBuffer } from './storage';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function generateThumbnail(
  title: string,
  niche: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const prompt = generateThumbnailPrompt(title, niche);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DALL-E API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const imageBuffer = Buffer.from(data.data[0].b64_json, 'base64');

  const thumbnailUrl = await uploadBuffer(
    imageBuffer,
    `thumbnail-${Date.now()}.png`,
    'image/png'
  );

  return thumbnailUrl;
}

function generateThumbnailPrompt(title: string, niche: string): string {
  const nicheStyles: Record<string, string> = {
    tech: 'futuristic, neon lights, digital, cyberpunk aesthetic',
    psychology: 'mysterious, dark, thought-provoking, brain imagery',
    motivation: 'inspiring, sunrise, mountain peak, success imagery',
    finance: 'money, growth charts, professional, clean design',
    entertainment: 'colorful, fun, exaggerated expressions, pop art',
    culture: 'world map, diverse, cultural symbols, travel vibes',
  };

  const style = nicheStyles[niche.toLowerCase()] || 'eye-catching, bold, vibrant';

  return `YouTube thumbnail for video titled "${title}".
Style: ${style}.
Requirements:
- High contrast colors
- Bold, readable text overlay (max 5 words)
- Expressive or intriguing imagery
- No real faces (faceless channel style)
- 16:9 composition adapted to square
- Professional quality, click-worthy`;
}
