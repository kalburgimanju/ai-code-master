'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { BookOpen, Upload, Wand2, Film, ArrowRight } from 'lucide-react';

const STEPS = [
  { icon: Upload, t: '1. Gather references', d: 'Collect up to 9 images, 3 videos and 3 audio clips that define your look, subjects and mood.' },
  { icon: Wand2, t: '2. Write a prompt', d: 'Describe the scene in natural language. The Prompt Enhancer agent upgrades it to a camera-ready brief.' },
  { icon: Film, t: '3. Pick a model & render', d: 'Choose Highfi 2.0 / Fast / Mini, set resolution and duration, then generate your frames.' },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-4 pb-20 pt-14">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 text-brand-300">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Guide</span>
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Creating your first video</h1>
          <p className="mt-2 text-ink-300">A quick walkthrough of the Highfi 2 workflow, end to end.</p>

          <div className="mt-10 space-y-5">
            {STEPS.map((s) => (
              <div key={s.t} className="flex gap-4 rounded-2xl border border-white/10 bg-ink-900/40 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-medium text-white">{s.t}</h3>
                  <p className="mt-1 text-sm text-ink-300">{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/agents" className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-400">
              Explore agents <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/api-docs" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-ink-200 hover:bg-white/5">
              Read API docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
