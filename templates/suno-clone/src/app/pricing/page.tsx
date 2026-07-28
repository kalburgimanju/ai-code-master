'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    cr: 'Unlimited generations',
    feats: ['OpenRouter free lyrics', 'Hugging Face music', 'Pollinations cover art', 'WAV download'],
    hot: true,
  },
  {
    name: 'Creator',
    price: '$9',
    cr: 'Faster queue',
    feats: ['Everything in Free', 'Priority worker warm-up', 'Longer audio clips', 'API access'],
  },
  {
    name: 'Studio',
    price: '$29',
    cr: 'Team seats',
    feats: ['Everything in Creator', 'Higher rate limits', 'Custom style presets', 'SLA'],
  },
];

export default function Pricing() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="aurora relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:pt-24">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Simple, free-first pricing</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-300">
            The studio runs on free models by default. Paid tiers are optional and not required to create songs.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-6 ${
                  p.hot ? 'border-brand-400/50 bg-brand-500/5 shadow-lg shadow-brand-500/20' : 'border-white/10 bg-ink-900/40'
                }`}
              >
                {p.hot && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">
                    Default
                  </span>
                )}
                <h3 className="text-lg font-medium text-white">{p.name}</h3>
                <p className="mt-2 text-3xl font-semibold">
                  {p.price}
                  <span className="text-sm font-normal text-ink-400">/mo</span>
                </p>
                <p className="mt-1 text-sm text-brand-300">{p.cr}</p>
                <ul className="mt-4 space-y-2">
                  {p.feats.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-200">
                      <Check className="h-4 w-4 text-brand-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/"
                  className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-400"
                >
                  Choose {p.name} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-sm text-ink-400">
            <Sparkles className="h-4 w-4 text-brand-400" /> Free tier uses OpenRouter + Hugging Face free models — no card needed.
          </p>
        </div>
      </section>
    </main>
  );
}
