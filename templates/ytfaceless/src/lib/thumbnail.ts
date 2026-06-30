import { uploadBuffer } from './storage';

// Use Pollinations.ai for free image generation (no API key needed)
const POLLINATIONS_URL = 'https://image.pollinations.ai/prompt';

export async function generateThumbnail(
  title: string,
  niche: string
): Promise<string> {
  const prompt = generateThumbnailPrompt(title, niche);

  // Pollinations.ai is free and requires no API key
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `${POLLINATIONS_URL}/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true`;

  // Fetch the image
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Image generation failed: ${response.statusText}`);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());

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

  return `YouTube thumbnail for video titled "${title}". Style: ${style}. Requirements: High contrast colors, bold readable text overlay max 5 words, expressive or intriguing imagery, no real faces faceless channel style, 16:9 composition adapted to square, professional quality click-worthy`;
}
