import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { chat, generateImage, ChatMsg } from '@/lib/openrouter';

// Async video generation, mirroring Highfi 2's API shape:
//   POST /api/video  -> creates a task, reserves credits, returns task id
//   GET  /api/video?id=... -> returns task status (queued/running/succeeded/failed)
//
// OpenRouter has no video model, so the "agent" orchestrates the production:
// the prompt-enhancer + storyboard agents plan the shot, and the image agent
// renders representative still frames. The client shows these as the result.
export const runtime = 'nodejs';

type Status = 'queued' | 'running' | 'succeeded' | 'failed';

interface Task {
  id: string;
  status: Status;
  prompt: string;
  model: string;
  resolution: string;
  durationSec: number;
  credits: number;
  createdAt: number;
  enhancedPrompt?: string;
  storyboard?: string[];
  frames: { b64: string; shot: string }[];
  error?: string;
}

// In-memory task store (per server instance). Swap for Redis/DB in prod.
const tasks = new Map<string, Task>();

const CREDIT_PER_SEC: Record<string, number> = {
  'highfi-2.0': 30,
  'highfi-2.0-fast': 20,
  'highfi-2.0-mini': 15,
};

function reserveCredits(model: string, durationSec: number): number {
  const per = CREDIT_PER_SEC[model] || 30;
  return per * durationSec;
}

async function runAgent(system: string, user: string): Promise<string> {
  const messages: ChatMsg[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
  return chat(messages, { temperature: 0.7 });
}

async function produce(task: Task) {
  try {
    task.status = 'running';

    // 1. Enhance the prompt
    task.enhancedPrompt = await runAgent(
      'You are the Highfi Prompt Enhancer. Rewrite the idea as a vivid, camera-aware video prompt (shot, motion, lighting, style, mood). Reply with the prompt only.',
      task.prompt
    );

    // 2. Storyboard into shots
    const sb = await runAgent(
      'You are the Highfi Storyboard agent. Break the concept into 4 sequential shots. For each, a one-line visual description. Reply as a plain numbered list, one shot per line, no extra text.',
      task.enhancedPrompt
    );
    task.storyboard = sb
      .split('\n')
      .map((l) => l.replace(/^\s*\d+[.)]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 4);

    // 3. Render a still frame per shot via the image model
    const shots = task.storyboard.length ? task.storyboard : [task.enhancedPrompt];
    for (const shot of shots) {
      try {
        const img = await generateImage(`${shot}. Cinematic, ${task.resolution} resolution.`);
        if (img.b64) task.frames.push({ b64: img.b64, shot });
      } catch {
        // A single failed frame should not kill the whole task.
      }
    }

    task.status = 'succeeded';
  } catch (e) {
    task.status = 'failed';
    task.error = e instanceof Error ? e.message : 'production failed';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = (body.prompt || '').toString().trim();
    const model = body.model || 'highfi-2.0';
    const resolution = body.resolution || '1080p';
    const durationSec = Math.max(1, Math.min(10, Number(body.durationSec) || 5));

    if (!prompt) {
      return NextResponse.json({ ok: false, error: 'prompt is required' }, { status: 400 });
    }

    const id = uuid();
    const credits = reserveCredits(model, durationSec);
    const task: Task = {
      id,
      status: 'queued',
      prompt,
      model,
      resolution,
      durationSec,
      credits,
      createdAt: Date.now(),
      frames: [],
    };
    tasks.set(id, task);

    // Fire-and-forget production (status polled via GET).
    void produce(task);

    return NextResponse.json({
      ok: true,
      id,
      status: task.status,
      credits_reserved: credits,
      model,
      resolution,
      durationSec,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
  const task = tasks.get(id);
  if (!task) return NextResponse.json({ ok: false, error: 'task not found' }, { status: 404 });
  return NextResponse.json({ ok: true, ...task });
}
