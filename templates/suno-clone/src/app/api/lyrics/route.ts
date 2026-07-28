import { NextRequest, NextResponse } from 'next/server';
import { writeLyrics, writeStyle, type LanguageId } from '@/lib/openrouter';

// Quick lyrics + style generation via OpenRouter free chat.
// Body: { idea: string, style?: string, lyrics?: string, lang?: string }
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { idea = '', style = '', lyrics = '', lang = 'en' } = await req.json();
    const language = (lang as LanguageId) || 'en';
    if (!idea && !lyrics.trim()) {
      return NextResponse.json({ ok: false, error: 'idea or lyrics is required' }, { status: 400 });
    }

    const styleLine = style.trim() || (await writeStyle(idea));
    const text = lyrics.trim() || (await writeLyrics(idea, styleLine, language));

    return NextResponse.json({ ok: true, style: styleLine, lyrics: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
