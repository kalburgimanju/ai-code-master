'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import VideoStudio from '@/components/VideoStudio';
import {
  ImagePlus,
  Film,
  AudioLines,
  Layers,
  Wand2,
  Repeat,
  Music2,
  Scissors,
  ArrowRight,
  Sparkles,
  Star,
  Check,
} from 'lucide-react';

const FEATURES = [
  { icon: Layers, title: 'Multimodal Input', desc: 'Feed images, video, audio and text together. Highfi reasons across every modality.' },
  { icon: ImagePlus, title: 'Reference Anything', desc: 'Lock characters, products and scenes consistent across every shot.' },
  { icon: Wand2, title: 'Edit Anything', desc: 'Instruct edits in natural language — restyle, replace, re-light without reshoots.' },
  { icon: Repeat, title: 'Motion Replication', desc: 'Reference a clip and replicate its exact motion onto new subjects.' },
  { icon: Scissors, title: 'Video Extension', desc: 'Extend any clip forward or backward to build longer sequences.' },
  { icon: Music2, title: 'Native Audio', desc: 'Generate synchronized dialogue, ambience and music straight from the model.' },
];

const SHOWCASE = [
  { t: 'Liquid gold', tag: 'Product', c: 'from-amber-400/30 to-orange-500/10' },
  { t: 'Cyber samurai', tag: 'Character', c: 'from-brand-400/30 to-purple-500/10' },
  { t: 'Aurora timelapse', tag: 'Nature', c: 'from-emerald-400/30 to-teal-500/10' },
  { t: 'Neon city', tag: 'Scene', c: 'from-fuchsia-400/30 to-pink-500/10' },
];

const USECASES = [
  { icon: Film, title: 'Filmmakers', desc: 'Previs, B-roll and effects plates in minutes.' },
  { icon: Sparkles, title: 'Marketers', desc: 'On-brand video ads at infinite variants.' },
  { icon: Layers, title: 'Product Teams', desc: 'Showcase products in any environment.' },
  { icon: AudioLines, title: 'Creators', desc: 'Talking avatars with synced audio.' },
];

const STEPS = [
  { n: 1, t: 'Reference', d: 'Upload up to 9 images, 3 videos or 3 audio clips as context.' },
  { n: 2, t: 'Describe', d: 'Write a prompt. Agents enhance it into a camera-ready brief.' },
  { n: 3, t: 'Generate', d: 'Pick a model and resolution, then render stills & motion.' },
];

const FAQ = [
  { q: 'What can I reference?', a: 'Up to 9 images, 3 videos and 3 audio clips per generation, combined with a text prompt.' },
  { q: 'Which models are available?', a: 'Highfi 2.0, Highfi 2.0 Fast and Highfi 2.0 Mini, plus older 1.5/1.0 series.' },
  { q: 'How are credits charged?', a: 'Credits are reserved on submit and charged on success, refunded on failure.' },
  { q: 'Can I use it via API?', a: 'Yes — async video generation with webhook callbacks, documented under /api-docs.' },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="aurora relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-300">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" /> Powered by OpenRouter agents
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Reference anything. <span className="gradient-text">Edit anything.</span> Create anything.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-300">
            The multimodal AI studio that turns text, images, video and audio into cinematic video and images — orchestrated by
            intelligent Highfi agents.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="#studio" className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400">
              Start creating
            </Link>
            <Link href="/agents" className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-ink-200 hover:bg-white/5">
              Meet the agents
            </Link>
          </div>
        </div>

        <div id="studio" className="mx-auto max-w-5xl px-4 pb-20">
          <VideoStudio />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Built for total creative control</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-5 transition hover:border-brand-400/40">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-medium text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section className="border-y border-white/5 bg-ink-900/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Showcase</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {SHOWCASE.map((s) => (
              <div key={s.t} className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${s.c} p-6`}>
                <div className="aspect-[4/5] rounded-xl bg-ink-950/40" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{s.t}</span>
                  <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs text-ink-200">{s.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Made for every creator</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USECASES.map((u) => (
            <div key={u.title} className="rounded-2xl border border-white/10 bg-ink-900/40 p-5">
              <u.icon className="h-6 w-6 text-brand-300" />
              <h3 className="mt-3 font-medium text-white">{u.title}</h3>
              <p className="mt-1 text-sm text-ink-300">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-lg font-semibold text-white">
                {s.n}
              </span>
              <h3 className="mt-4 font-medium text-white">{s.t}</h3>
              <p className="mt-1 text-sm text-ink-300">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-white/5 bg-ink-900/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { q: 'Cut our previs time from days to an afternoon.', n: 'Indie Director' },
              { q: 'Finally a tool that keeps our product on-brand across shots.', n: 'Brand Lead' },
              { q: 'The audio agent alone replaced three separate tools.', n: 'Content Creator' },
            ].map((t, i) => (
              <div key={i} className="glass rounded-2xl p-5">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm text-ink-200">“{t.q}”</p>
                <p className="mt-3 text-xs text-ink-400">— {t.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Simple credit pricing</h2>
        <p className="mt-2 text-center text-sm text-ink-400">Credits are reserved on submit, charged on success, refunded on failure.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { name: 'Starter', price: '$0', cr: '120 free credits', feats: ['Highfi 2.0 Mini', '480p exports', 'Community support'] },
            { name: 'Pro', price: '$29', cr: '1,000 credits/mo', feats: ['All models', 'Up to 4K', 'API access', 'Priority queue'], hot: true },
            { name: 'Studio', price: '$99', cr: '5,000 credits/mo', feats: ['Everything in Pro', 'Webhooks', 'Team seats', 'SLA'] },
          ].map((p) => (
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
              <Link
                href="/pricing"
                className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-400"
              >
                Choose {p.name} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">FAQ</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-xl border border-white/10 bg-ink-900/40 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                {f.q}
                <span className="text-brand-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-ink-300">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="aurora rounded-3xl border border-white/10 p-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Start creating with Highfi 2</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-300">Generate your first video or image in under a minute.</p>
          <Link
            href="#studio"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-medium text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400"
          >
            <Sparkles className="h-5 w-5" /> Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-950 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="text-sm text-ink-400">© {new Date().getFullYear()} Highfi 2 Clone · built with OpenRouter</span>
        <div className="flex gap-4 text-sm text-ink-400">
          <Link href="/guide" className="hover:text-white">Guide</Link>
          <Link href="/api-docs" className="hover:text-white">API</Link>
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
        </div>
      </div>
    </footer>
  );
}
