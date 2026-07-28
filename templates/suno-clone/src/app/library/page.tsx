'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Music, Sparkles } from 'lucide-react';

export default function Library() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="aurora relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 pb-20 pt-16 text-center sm:pt-24">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Your Library</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-300">
            Songs you generate are kept in this server session. Create a few and they’ll appear here.
          </p>

          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-ink-900/40 p-12 text-ink-400">
            <Music className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">No songs yet.</p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-medium text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400"
            >
              <Sparkles className="h-5 w-5" /> Create your first song
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
