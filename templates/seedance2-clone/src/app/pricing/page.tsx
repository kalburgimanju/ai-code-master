'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Check, Sparkles } from 'lucide-react';

const PLANS = [
  { name: 'Starter', price: '$0', cr: '120 free credits', feats: ['Highfi 2.0 Mini', '480p exports', 'Community support'] },
  { name: 'Pro', price: '$29', cr: '1,000 credits/mo', feats: ['All models', 'Up to 4K', 'API access', 'Priority queue'], hot: true },
  { name: 'Studio', price: '$99', cr: '5,000 credits/mo', feats: ['Everything in Pro', 'Webhooks', 'Team seats', 'SLA'] },
];

const PER_SEC = [
  { model: 'Highfi 2.0', rate: '30 credits/sec', note: '1080p flagship quality' },
  { model: 'Highfi 2.0 Fast', rate: '20 credits/sec', note: 'accelerated render' },
  { model: 'Highfi 2.0 Mini', rate: '15 credits/sec', note: 'half the cost' },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="aurora px-4 pb-20 pt-14">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pricing</h1>
          <p className="mx-auto mt-3 max-w-md text-ink-300">
            Pay only for what you generate. Credits are reserved on submit, charged on success, refunded on failure.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-6 ${
                p.hot ? 'border-brand-400/50 bg-brand-500/5 shadow-lg shadow-brand-500/20' : 'border-white/10 bg-ink-900/40'
              }`}
            >
              {p.hot && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">
                  Popular
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
              <button className="mt-6 w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-400">
                Choose {p.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-xl font-semibold">Credit rates</h2>
          <div className="mt-6 space-y-3">
            {PER_SEC.map((r) => (
              <div key={r.model} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 p-4">
                <div>
                  <p className="text-sm font-medium text-white">{r.model}</p>
                  <p className="text-xs text-ink-400">{r.note}</p>
                </div>
                <span className="text-sm text-brand-300">{r.rate}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400">
              <Sparkles className="h-5 w-5" /> Start creating
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
