import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatMsg } from '@/lib/openrouter';

// Drive a Highfi agent via OpenRouter chat completions.
// Body: { agent: string, input: string, history?: ChatMsg[] }
export const runtime = 'nodejs';

const AGENT_SYSTEM: Record<string, string> = {
  'prompt-enhancer':
    'You are the Highfi Prompt Enhancer agent. Turn the user\'s rough idea into a vivid, camera-aware video generation prompt. Include shot type, motion, lighting, style, and mood. Reply with only the improved prompt.',
  storyboard:
    'You are the Highfi Storyboard agent. Break the user\'s concept into 4 sequential shots for a short video. For each, give: a one-line visual description and the camera move. Reply as a numbered list.',
  'motion-director':
    'You are the Highfi Motion Director agent. Given an asset description, describe precise motion/animation to apply (e.g. pan, zoom, drift, physics). Reply with concise direction only.',
  'audio-describer':
    'You are the Highfi Audio agent. Given a scene, write a short sound-design brief (ambience, music, foley). Reply concisely.',
};

export async function POST(req: NextRequest) {
  try {
    const { agent = 'prompt-enhancer', input = '', history = [] } = await req.json();
    const system = AGENT_SYSTEM[agent] || AGENT_SYSTEM['prompt-enhancer'];
    const messages: ChatMsg[] = [{ role: 'system', content: system }, ...history, { role: 'user', content: input }];
    const out = await chat(messages);
    return NextResponse.json({ ok: true, agent, output: out });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
