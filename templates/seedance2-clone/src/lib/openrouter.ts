// Thin server-side client for the OpenRouter API.
// Used by the API routes to drive the Highfi agents:
//  - chat/orchestration models for prompt enhancement & storyboards
//  - image-generation models for still frames / thumbnails

const BASE = 'https://openrouter.ai/api/v1';

function key(): string {
  const k = process.env.OPENROUTER_API_KEY;
  if (!k) throw new Error('OPENROUTER_API_KEY is not set');
  return k;
}

export function chatModel(): string {
  return process.env.OPENROUTER_CHAT_MODEL || 'anthropic/claude-3.5-sonnet';
}

export function imageModel(): string {
  return process.env.OPENROUTER_IMAGE_MODEL || 'openai/dall-e-3';
}

export interface ChatMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(messages: ChatMsg[], opts?: { model?: string; temperature?: number }): Promise<string> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_REFERER || '',
      'X-Title': process.env.OPENROUTER_SITE_NAME || 'Highfi 2 Clone',
    },
    body: JSON.stringify({
      model: opts?.model || chatModel(),
      messages,
      temperature: opts?.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter chat failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || '';
}

export interface ImageResult {
  url?: string;
  b64?: string;
  revisedPrompt?: string;
}

import fs from 'fs';
import path from 'path';

// Pollinations.ai free image-generation endpoint
export async function generateImage(prompt: string, opts?: { model?: string; size?: string; n?: number }): Promise<ImageResult> {
  const sizeString = opts?.size || '1024x1024';
  const [width, height] = sizeString.split('x');
  
  // We add a random seed to bypass caching if needed, though prompt changes usually suffice.
  const seed = Math.floor(Math.random() * 10000000);
  const encodedPrompt = encodeURIComponent(prompt);
  
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
  
  const res = await fetch(url, {
    method: 'GET'
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image generation failed (${res.status}): ${text}`);
  }
  
  // Pollinations returns binary image data directly
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const b64 = buffer.toString('base64');
  
  // Store the generated image into public/assets folder
  try {
    const assetsDir = path.join(process.cwd(), 'public', 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    const filename = `generated-${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
    fs.writeFileSync(path.join(assetsDir, filename), buffer);
  } catch (e) {
    console.error('Failed to save image to public/assets:', e);
  }

  return {
    b64,
  };
}
