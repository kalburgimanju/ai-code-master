'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Wand2, Mic2, Music, Image as ImageIcon, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: Wand2,
    t: 'Describe your song',
    d: 'Type a short idea — “a chill lo-fi beat about rainy Sundays” — or pick a style tag (Pop, Lo-fi, Rock…).',
  },
  {
    icon: Mic2,
    t: 'Let the models write',
    d: 'A free OpenRouter chat model drafts a style line and full lyrics with verses and a chorus.',
  },
  {
    icon: Music,
    t: 'Generate the audio',
    d: 'A free Hugging Face music model (musicgen-small) renders a short WAV clip from your style + first line.',
  },
  {
    icon: ImageIcon,
    t: 'Get cover art',
    d: 'Pollinations.ai generates free album art that appears next to your player.',
  },
];

export default function Guide() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="aurora relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-16 text-center sm:pt-24">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            How to make a <span className="gradient-text">song</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-300">
            Suno Clone turns a text prompt into lyrics, music and cover art using only free models.
          </p>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-20">
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="glass flex gap-4 rounded-2xl p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-medium text-white">
                    {i + 1}. {s.t}
                  </h3>
                  <p className="mt-1 text-sm text-ink-300">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-2xl border border-white/10 bg-ink-900/40 p-5">
            <h3 className="flex items-center gap-2 font-medium text-white">
              <Sparkles className="h-4 w-4 text-brand-400" /> Tips
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-300">
              <li>• Be specific about mood and genre for better results.</li>
              <li>• Paste your own lyrics to keep full creative control.</li>
              <li>• First generation is slowest — the free model warms up a worker.</li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-medium text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400">
              Try the studio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
