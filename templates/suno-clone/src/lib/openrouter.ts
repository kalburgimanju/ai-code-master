// Thin server-side client for the OpenRouter API.
// Drives the free chat models that write lyrics and shape a song's style.
// All models used here are FREE on OpenRouter.

const BASE = 'https://openrouter.ai/api/v1';

function key(): string {
  const k = process.env.OPENROUTER_API_KEY;
  if (!k) throw new Error('OPENROUTER_API_KEY is not set');
  return k;
}

// Default to a free model. Override via OPENROUTER_CHAT_MODEL.
export function chatModel(): string {
  return process.env.OPENROUTER_CHAT_MODEL || 'openrouter/auto';
}

export interface ChatMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(
  messages: ChatMsg[],
  opts?: { model?: string; temperature?: number }
): Promise<string> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_REFERER || '',
      'X-Title': process.env.OPENROUTER_SITE_NAME || 'Suno Clone',
    },
    body: JSON.stringify({
      model: opts?.model || chatModel(),
      messages,
      temperature: opts?.temperature ?? 0.8,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter chat failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// Languages the studio supports. Each maps to a BCP-47 tag used by the
// browser SpeechSynthesis API so regional lyrics can actually be spoken.
export const LANGUAGES = [
  { id: 'en', label: 'English', locale: 'en-US' },
  { id: 'hi', label: 'Hindi', locale: 'hi-IN' },
  { id: 'kn', label: 'Kannada', locale: 'kn-IN' },
  { id: 'mr', label: 'Marathi', locale: 'mr-IN' },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]['id'];

const LANG_NAMES: Record<LanguageId, string> = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  mr: 'Marathi',
};

// System prompts for the song-writing agents.
export function lyricSystem(lang: LanguageId): string {
  const name = LANG_NAMES[lang];
  return (
    `You are a professional songwriter who writes songs in ${name}. ` +
    'Given a short idea and a musical style, write complete, original song lyrics in ' +
    `${name} (Devanagari/Kannada script where applicable). ` +
    'Include a [Verse], [Chorus], [Verse], [Chorus], [Bridge], [Chorus] structure with section tags on their own lines. ' +
    'Do not repeat the style description, and do not add romanization or translation. Reply with only the lyrics.'
  );
}

export const STYLE_SYSTEM =
  'You are a music producer. Given a free-text idea, produce a concise Suno-style style/mood line ' +
  '(e.g. "upbeat synth-pop, bright major chords, punchy drums, 120 BPM"). Reply with only the style line, under 20 words.';

async function runAgent(system: string, user: string, temperature = 0.8): Promise<string> {
  return chat(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { temperature }
  );
}

export function writeStyle(idea: string): Promise<string> {
  return runAgent(STYLE_SYSTEM, idea, 0.6);
}

export function writeLyrics(idea: string, style: string, lang: LanguageId = 'en'): Promise<string> {
  return runAgent(lyricSystem(lang), `Idea: ${idea}\nStyle: ${style}`, 0.9);
}
