'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SongStudio from '@/components/SongStudio';
import {
  Music,
  Wand2,
  Mic2,
  Image as ImageIcon,
  Sparkles,
  Star,
  Check,
  ArrowRight,
  Disc3,
  Globe,
  Languages,
} from 'lucide-react';

const FEATURES = [
  { icon: Wand2, title: 'Prompt to Song', desc: 'Type an idea and get full lyrics, a style line and a finished track.' },
  { icon: Mic2, title: 'Write Your Own', desc: 'Paste your own lyrics and let the models produce the music around them.' },
  { icon: Languages, title: 'Multilingual', desc: 'Create songs in English, Hindi, Kannada and Marathi — lyrics and voice.' },
  { icon: ImageIcon, title: 'AI Cover Art', desc: 'Every song ships with free generated cover art from Pollinations.' },
  { icon: Music, title: 'Playable Audio', desc: 'A melody synth plus text-to-speech voice, rendered in your browser — always audible.' },
  { icon: Globe, title: '100% Free', desc: 'OpenRouter free chat for words, in-browser audio, Pollinations for art.' },
];

const GENRES = [
  { t: 'Midnight Drive', tag: 'Synthwave', c: 'from-fuchsia-400/30 to-purple-500/10' },
  { t: 'Rainy Window', tag: 'Lo-fi', c: 'from-brand-400/30 to-teal-500/10' },
  { t: 'Golden Fields', tag: 'Acoustic', c: 'from-amber-400/30 to-orange-500/10' },
  { t: 'Neon Heart', tag: 'Pop', c: 'from-pink-400/30 to-rose-500/10' },
];

const STEPS = [
  { n: 1, t: 'Describe', d: 'Write a short idea or pick a style tag like Pop or Lo-fi.' },
  { n: 2, t: 'Generate', d: 'Free models write the lyrics, style and music in the background.' },
  { n: 3, t: 'Listen', d: 'Stream the track, view the art, and download your WAV.' },
];

const FAQ = [
  { q: 'Is it really free?', a: 'Yes — lyrics come from OpenRouter free chat models, audio is synthesized in your browser (Web Audio + SpeechSynthesis), and cover art from Pollinations. No paid APIs.' },
  { q: 'Which languages are supported?', a: 'English, Hindi, Kannada and Marathi. Lyrics are written in the chosen language and the voice reads them aloud in that locale (hi-IN, kn-IN, mr-IN).' },
  { q: 'Why is the audio synthesized in the browser?', a: 'Hosted free music APIs (Hugging Face / Pollinations audio) are often unreachable from the server, so we render a melody and spoken voice locally — guaranteeing playable audio everywhere.' },
  { q: 'Can I use my own lyrics?', a: 'Absolutely. Expand “Write my own lyrics instead” and paste your text; the studio will compose the melody and voice around it.' },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="aurora relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-300">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" /> Powered by OpenRouter + Hugging Face (free)
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Turn a thought into a <span className="gradient-text">song</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-300">
            Describe a vibe and watch the lyrics, music and cover art come to life — composed entirely with free AI models.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="#studio" className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400">
              Start creating
            </Link>
            <Link href="/guide" className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-ink-200 hover:bg-white/5">
              How it works
            </Link>
          </div>
        </div>

        <div id="studio" className="mx-auto max-w-5xl px-4 pb-20">
          <SongStudio />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Everything you need to make a track</h2>
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

      <section className="border-y border-white/5 bg-ink-900/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Fresh from the studio</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {GENRES.map((s) => (
              <div key={s.t} className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${s.c} p-6`}>
                <Disc3 className="absolute right-4 top-4 h-6 w-6 opacity-40" />
                <div className="aspect-square rounded-xl bg-ink-950/40" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{s.t}</span>
                  <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs text-ink-200">{s.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="border-y border-white/5 bg-ink-900/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { q: 'Made our intro jingle in one prompt.', n: 'Indie Podcaster' },
              { q: 'Finally a free way to mock up songs before the studio.', n: 'Bedroom Producer' },
              { q: 'The cover art alone is worth it.', n: 'Content Creator' },
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

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="aurora rounded-3xl border border-white/10 p-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Make your first song</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-300">Free, no sign-up required to try the studio.</p>
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
        <span className="text-sm text-ink-400">© {new Date().getFullYear()} Suno Clone · built with OpenRouter + Hugging Face</span>
        <div className="flex gap-4 text-sm text-ink-400">
          <Link href="/guide" className="hover:text-white">Guide</Link>
          <Link href="/api-docs" className="hover:text-white">API</Link>
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
        </div>
      </div>
    </footer>
  );
}
