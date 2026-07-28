// Free generative media via Hugging Face + Pollinations.
//  - Music: facebook/musicgen-small through the HF Inference API (free tier).
//  - Cover art: pollinations.ai free text-to-image (no key required).
//
// Musicgen produces ~10s loops from a text prompt on CPU, so it is slow and
// best-effort. We return base64 WAV and degrade gracefully on failure.

import fs from 'fs';
import path from 'path';

const HF_BASE = 'https://api-inference.huggingface.co/models';

function hfToken(): string | undefined {
  return process.env.HF_TOKEN;
}

export interface AudioResult {
  b64?: string;
  format?: string;
  error?: string;
}

// Generate a short music clip from a text prompt using a free HF model.
export async function generateMusic(prompt: string): Promise<AudioResult> {
  const model = process.env.HF_MUSIC_MODEL || 'facebook/musicgen-small';
  const url = `${HF_BASE}/${model}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = hfToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: prompt.slice(0, 220),
        // 10s @ 32kHz is musicgen-small's default output length.
        parameters: { max_new_tokens: 512 },
      }),
      // Free tier can be slow to spin up a worker.
      signal: AbortSignal.timeout(120_000),
    });

    if (res.status === 503) {
      return { error: 'Hugging Face model is loading — retry in a few seconds.' };
    }
    if (!res.ok) {
      const text = await res.text();
      return { error: `Hugging Face music failed (${res.status}): ${text.slice(0, 200)}` };
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) return { error: 'Hugging Face returned an empty audio buffer.' };
    return { b64: buf.toString('base64'), format: 'wav' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'music generation failed';
    return { error: msg };
  }
}

// Free cover-art generation via Pollinations.ai (no API key needed).
export async function generateCover(prompt: string): Promise<{ b64?: string; error?: string }> {
  const seed = Math.floor(Math.random() * 10_000_000);
  const encoded = encodeURIComponent(prompt.slice(0, 200));
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=640&height=640&seed=${seed}&nologo=true`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { error: `Cover art failed (${res.status})` };
    const buf = Buffer.from(await res.arrayBuffer());

    // Persist into public/assets so it can be served as a static file.
    try {
      const dir = path.join(process.cwd(), 'public', 'assets');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const filename = `cover-${Date.now()}-${Math.floor(Math.random() * 1e4)}.png`;
      fs.writeFileSync(path.join(dir, filename), buf);
    } catch {
      /* non-fatal */
    }

    return { b64: buf.toString('base64') };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'cover art failed' };
  }
}
