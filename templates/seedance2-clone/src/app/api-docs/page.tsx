'use client';

import Navbar from '@/components/Navbar';
import { Code2, Webhook, KeyRound, Coins } from 'lucide-react';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/video',
    desc: 'Submit an async video generation task. Reserves credits, returns a task id.',
    body: '{ "prompt": "string", "model": "highfi-2.0", "resolution": "1080p", "durationSec": 5 }',
  },
  {
    method: 'GET',
    path: '/api/video?id=...',
    desc: 'Poll task status. Returns queued | running | succeeded | failed plus frames.',
    body: '',
  },
  {
    method: 'POST',
    path: '/api/image',
    desc: 'Generate a still image via the OpenRouter image model.',
    body: '{ "prompt": "string", "size": "1024x1024" }',
  },
  {
    method: 'POST',
    path: '/api/chat',
    desc: 'Run a Highfi agent (prompt-enhancer, storyboard, motion-director, audio-describer).',
    body: '{ "agent": "prompt-enhancer", "input": "string" }',
  },
];

const CURL = `curl -X POST https://your-host/api/video \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"a fox in a bookstore","model":"highfi-2.0","resolution":"1080p","durationSec":5}'`;

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-4 pb-20 pt-14">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-semibold tracking-tight">API Reference</h1>
          <p className="mt-2 text-ink-300">
            Async, OpenRouter-backed generation. Credits are reserved on submit and charged on success, refunded on failure.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: KeyRound, t: 'Auth', d: 'Server reads OPENROUTER_API_KEY from env' },
              { icon: Coins, t: 'Credits', d: 'Reserved up-front, refunded on failure' },
              { icon: Webhook, t: 'Webhooks', d: 'Notify on task completion (extend as needed)' },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-white/10 bg-ink-900/40 p-4">
                <c.icon className="h-5 w-5 text-brand-300" />
                <h3 className="mt-2 text-sm font-medium text-white">{c.t}</h3>
                <p className="mt-1 text-xs text-ink-400">{c.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-4">
            {ENDPOINTS.map((e) => (
              <div key={e.path} className="rounded-2xl border border-white/10 bg-ink-900/40 p-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-brand-500/20 px-2 py-1 text-xs font-semibold text-brand-300">{e.method}</span>
                  <code className="text-sm text-white">{e.path}</code>
                </div>
                <p className="mt-2 text-sm text-ink-300">{e.desc}</p>
                {e.body && (
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-950 p-3 text-xs text-ink-200">
                    <code>{e.body}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <Code2 className="h-4 w-4 text-brand-300" /> Example request
            </div>
            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950 p-4 text-xs text-ink-200">
              <code>{CURL}</code>
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
