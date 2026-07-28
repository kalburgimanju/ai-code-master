import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { writeLyrics, writeStyle, type LanguageId } from '@/lib/openrouter';
import { generateCover } from '@/lib/huggingface';

// Async song generation, mirroring Suno's API shape:
//   POST /api/song -> creates a task, returns task id
//   GET  /api/song?id=... -> returns task status (queued/running/succeeded/failed)
//
// Free-model orchestration:
//   - OpenRouter free chat writes the style + lyrics (any supported language)
//   - The CLIENT synthesizes playable audio locally (Web Audio + SpeechSynthesis)
//     so audio always works even when hosted music APIs are unreachable
//   - Pollinations (free) renders the cover art

export const runtime = 'nodejs';
export const maxDuration = 300;

type Status = 'queued' | 'running' | 'succeeded' | 'failed';

interface Task {
  id: string;
  status: Status;
  idea: string;
  customLyrics: string;
  style: string;
  lang: LanguageId;
  createdAt: number;
  styleLine?: string;
  lyrics?: string;
  coverB64?: string;
  error?: string;
}

const tasks = new Map<string, Task>();

async function produce(task: Task) {
  try {
    task.status = 'running';

    // 1. Derive a style line.
    if (!task.styleLine) {
      task.styleLine = await writeStyle(task.idea);
    }

    // 2. Write the lyrics (use user's own if provided) in the chosen language.
    task.lyrics = task.customLyrics.trim()
      ? task.customLyrics.trim()
      : await writeLyrics(task.idea, task.styleLine, task.lang);

    // 3. Cover art (best-effort, non-blocking on failure).
    const cover = await generateCover(`${task.styleLine}, album cover art, ${task.idea}`);
    if (cover.b64) task.coverB64 = cover.b64;

    task.status = 'succeeded';
  } catch (e) {
    task.status = 'failed';
    task.error = e instanceof Error ? e.message : 'production failed';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea = (body.idea || '').toString().trim();
    const customLyrics = (body.lyrics || '').toString();
    const style = (body.style || '').toString().trim();
    const lang = ((body.lang as LanguageId) || 'en') as LanguageId;

    if (!idea && !customLyrics.trim()) {
      return NextResponse.json({ ok: false, error: 'idea or lyrics is required' }, { status: 400 });
    }

    const id = uuid();
    const task: Task = {
      id,
      status: 'queued',
      idea: idea || customLyrics.slice(0, 60),
      customLyrics,
      style,
      lang,
      styleLine: style || undefined,
      createdAt: Date.now(),
    };
    tasks.set(id, task);

    void produce(task);

    return NextResponse.json({
      ok: true,
      id,
      status: task.status,
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
