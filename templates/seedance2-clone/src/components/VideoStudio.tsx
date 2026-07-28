'use client';

import { useState } from 'react';
import { ImagePlus, Film, Music, Wand2, Loader2, Check, AlertCircle, Download, RefreshCw, Sparkles } from 'lucide-react';

const MODELS = [
  { id: 'highfi-2.0', label: 'Highfi 2.0', note: '1080p · 30 cr/s' },
  { id: 'highfi-2.0-fast', label: 'Highfi 2.0 Fast', note: 'faster render' },
  { id: 'highfi-2.0-mini', label: 'Highfi 2.0 Mini', note: 'half credits' },
];

const RES = ['480p', '720p', '1080p', '4K'];
const DURATIONS = [3, 5, 8, 10];

export default function VideoStudio() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(MODELS[0].id);
  const [resolution, setResolution] = useState('1080p');
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState<'idle' | 'queued' | 'running' | 'succeeded' | 'failed'>('idle');
  const [taskId, setTaskId] = useState('');
  const [enhanced, setEnhanced] = useState('');
  const [storyboard, setStoryboard] = useState<string[]>([]);
  const [frames, setFrames] = useState<{ b64: string; shot: string }[]>([]);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState(0);

  async function start() {
    if (!prompt.trim()) return;
    setStatus('queued');
    setError('');
    setEnhanced('');
    setStoryboard([]);
    setFrames([]);
    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, resolution, durationSec: duration }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'failed to start');
      setTaskId(data.id);
      setCredits(data.credits_reserved);
      poll(data.id);
    } catch (e) {
      setStatus('failed');
      setError(e instanceof Error ? e.message : 'error');
    }
  }

  async function poll(id: string) {
    let ticks = 0;
    const timer = setInterval(async () => {
      ticks++;
      try {
        const res = await fetch(`/api/video?id=${id}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'not found');
        setStatus(data.status);
        if (data.enhancedPrompt) setEnhanced(data.enhancedPrompt);
        if (data.storyboard) setStoryboard(data.storyboard);
        if (data.frames) setFrames(data.frames);
        if (data.status === 'succeeded' || data.status === 'failed') {
          clearInterval(timer);
          if (data.status === 'failed') setError(data.error || 'production failed');
        }
      } catch (e) {
        clearInterval(timer);
        setStatus('failed');
        setError(e instanceof Error ? e.message : 'error');
      }
      if (ticks > 120) clearInterval(timer);
    }, 2500);
  }

  const busy = status === 'queued' || status === 'running';

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* Generator panel */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2 text-sm text-ink-300">
          <Wand2 className="h-4 w-4 text-brand-400" /> Multimodal prompt — reference anything, edit anything
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Describe your video… e.g. A golden retriever surfing a neon wave at sunset, slow-motion, cinematic."
          className="w-full resize-none rounded-xl border border-white/10 bg-ink-900/60 p-3 text-sm text-white placeholder:text-ink-400 outline-none focus:border-brand-400/60"
        />

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: ImagePlus, label: '9 Images' },
            { icon: Film, label: '3 Videos' },
            { icon: Music, label: '3 Audio' },
          ].map((b) => (
            <button
              key={b.label}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-ink-900/40 p-3 text-ink-300 transition hover:border-brand-400/50 hover:text-white"
            >
              <b.icon className="h-5 w-5" />
              <span className="text-xs">{b.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-ink-400">
            Model
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900/60 px-2 py-2 text-sm text-white outline-none focus:border-brand-400/60"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-ink-400">
            Resolution
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900/60 px-2 py-2 text-sm text-white outline-none focus:border-brand-400/60"
            >
              {RES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-ink-400">
            Duration
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900/60 px-2 py-2 text-sm text-white outline-none focus:border-brand-400/60"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}s
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          onClick={start}
          disabled={busy || !prompt.trim()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 px-4 py-3 font-medium text-white shadow-lg shadow-brand-500/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {busy ? 'Generating…' : 'Generate Video'}
        </button>

        {credits > 0 && (
          <p className="mt-2 text-center text-xs text-ink-400">
            Reserved {credits} credits · {MODELS.find((m) => m.id === model)?.label} · {resolution} · {duration}s
          </p>
        )}
        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
      </div>

      {/* Result / status panel */}
      <div className="glass flex flex-col rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Production</span>
          <StatusBadge status={status} />
        </div>

        {status === 'idle' && (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-ink-400">
            <Film className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Your generated frames will appear here.</p>
          </div>
        )}

        {enhanced && (
          <div className="mb-3 rounded-xl border border-white/10 bg-ink-900/50 p-3">
            <p className="mb-1 text-xs font-medium text-brand-300">Enhanced prompt</p>
            <p className="text-xs leading-relaxed text-ink-200">{enhanced}</p>
          </div>
        )}

        {storyboard.length > 0 && (
          <ol className="mb-3 space-y-1">
            {storyboard.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs text-ink-300">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-brand-500/20 text-brand-300">{i + 1}</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        )}

        {frames.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {frames.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`data:image/png;base64,${f.b64}`} alt={f.shot} className="aspect-video w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {status === 'succeeded' && (
          <div className="mt-3 flex gap-2">
            <button 
              onClick={() => {
                frames.forEach((f, i) => {
                  const link = document.createElement('a');
                  link.href = `data:image/png;base64,${f.b64}`;
                  link.download = `highfi-frame-${i + 1}.png`;
                  link.click();
                });
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={start}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-ink-200 hover:bg-white/5"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: typeof Check }> = {
    idle: { label: 'Idle', cls: 'text-ink-400 bg-white/5', icon: Check },
    queued: { label: 'Queued', cls: 'text-amber-300 bg-amber-400/10', icon: Loader2 },
    running: { label: 'Running', cls: 'text-brand-300 bg-brand-500/10', icon: Loader2 },
    succeeded: { label: 'Ready', cls: 'text-green-300 bg-green-400/10', icon: Check },
    failed: { label: 'Failed', cls: 'text-red-300 bg-red-400/10', icon: AlertCircle },
  };
  const s = map[status] || map.idle;
  const Icon = status === 'queued' || status === 'running' ? Loader2 : s.icon;
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${s.cls}`}>
      <Icon className={`h-3.5 w-3.5 ${status === 'queued' || status === 'running' ? 'animate-spin' : ''}`} />
      {s.label}
    </span>
  );
}
