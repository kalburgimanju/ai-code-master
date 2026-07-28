'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { ImagePlus, Loader2, Sparkles, Download, AlertCircle } from 'lucide-react';

const SIZES = ['1024x1024', '1024x1792', '1792x1024'];

export default function ImagePage() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState(SIZES[0]);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  const [revised, setRevised] = useState('');
  const [error, setError] = useState('');

  async function generate() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError('');
    setUrl('');
    setRevised('');
    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'generation failed');
      setUrl(`data:image/png;base64,${data.b64}`);
      if (data.revisedPrompt) setRevised(data.revisedPrompt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="aurora px-4 pb-20 pt-14">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Bring your vision to <span className="gradient-text">life</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-ink-300">
            Text & image to image with Nano Banana Pro. Generate stills, thumbnails and key frames.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="glass rounded-2xl p-5">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="A bioluminescent jellyfish drifting through a neon coral reef, 4K, volumetric light…"
              className="w-full resize-none rounded-xl border border-white/10 bg-ink-900/60 p-3 text-sm text-white placeholder:text-ink-400 outline-none focus:border-brand-400/60"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs ${
                    size === s ? 'bg-brand-500 text-white' : 'border border-white/10 text-ink-300 hover:bg-white/5'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={generate}
              disabled={busy || !prompt.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 px-4 py-3 font-medium text-white shadow-lg shadow-brand-500/30 transition hover:opacity-90 disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              {busy ? 'Generating…' : 'Generate'}
            </button>
            {error && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}
          </div>

          <div className="glass flex items-center justify-center rounded-2xl p-5">
            {url ? (
              <div className="w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="generated" className="w-full rounded-xl border border-white/10" />
                <div className="mt-3 flex gap-2">
                  <a
                    href={url}
                    download="highfi-image.png"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400"
                  >
                    <Download className="h-4 w-4" /> Save
                  </a>
                </div>
                {revised && <p className="mt-2 text-xs text-ink-400">Revised: {revised}</p>}
              </div>
            ) : (
              <div className="text-center text-ink-400">
                <Sparkles className="mx-auto mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">Your image will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
