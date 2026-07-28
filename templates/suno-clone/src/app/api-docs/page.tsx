'use client';

import Navbar from '@/components/Navbar';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/song',
    body: '{ idea: string, style?: string, lyrics?: string }',
    desc: 'Create an async song task (lyrics + music + cover). Returns { ok, id, status }.',
  },
  {
    method: 'GET',
    path: '/api/song?id=…',
    body: '—',
    desc: 'Poll a song task. Returns styleLine, lyrics, audioB64, coverB64 and status.',
  },
  {
    method: 'POST',
    path: '/api/lyrics',
    body: '{ idea: string, style?: string, lyrics?: string }',
    desc: 'Synchronously return { style, lyrics } from the free chat model.',
  },
  {
    method: 'POST',
    path: '/api/cover',
    body: '{ prompt: string }',
    desc: 'Return free cover-art image as base64 PNG.',
  },
];

export default function ApiDocs() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="aurora relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 pb-20 pt-16 sm:pt-24">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">API</h1>
          <p className="mt-4 max-w-xl text-ink-300">
            All generation runs on free models. Songs are produced asynchronously — create a task, then poll for results.
          </p>

          <div className="mt-10 space-y-4">
            {ENDPOINTS.map((e) => (
              <div key={e.path} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-brand-500/15 px-2.5 py-1 text-xs font-medium text-brand-300">{e.method}</span>
                  <code className="text-sm text-white">{e.path}</code>
                </div>
                <p className="mt-3 text-sm text-ink-300">{e.desc}</p>
                <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-ink-950/60 p-3 text-xs text-ink-200">
                  {e.body}
                </pre>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-semibold tracking-tight">Example</h2>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/60 p-4 text-xs leading-relaxed text-ink-200">
{`// 1. Create
const { id } = await fetch('/api/song', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idea: 'a hopeful indie folk song about spring' }),
}).then(r => r.json());

// 2. Poll until status === 'succeeded'
const song = await fetch('/api/song?id=' + id).then(r => r.json());
// song.lyrics, song.audioB64 (WAV), song.coverB64 (PNG)`}
          </pre>
        </div>
      </section>
    </main>
  );
}
