'use client';

import { useState } from 'react';
import {
  Music,
  Wand2,
  Loader2,
  Check,
  AlertCircle,
  Download,
  RefreshCw,
  Sparkles,
  Mic2,
  Image as ImageIcon,
  Disc3,
  Play,
  Square,
  Languages,
} from 'lucide-react';
import { LANGUAGES, type LanguageId } from '@/lib/openrouter';
import { renderSong, speakLyrics, pickVoice } from '@/lib/audio';

const STYLES = [
  'Pop',
  'Hip-Hop',
  'Rock',
  'Lo-fi',
  'EDM',
  'Acoustic',
  'Cinematic',
  'R&B',
];

type Status = 'idle' | 'queued' | 'running' | 'succeeded' | 'failed';

export default function SongStudio() {
  const [idea, setIdea] = useState('');
  const [style, setStyle] = useState('');
  const [customLyrics, setCustomLyrics] = useState('');
  const [lang, setLang] = useState<LanguageId>('en');
  const [status, setStatus] = useState<Status>('idle');
  const [taskId, setTaskId] = useState('');
  const [styleLine, setStyleLine] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [cover, setCover] = useState('');
  const [error, setError] = useState('');

  // Client-side audio state.
  const [melodyUrl, setMelodyUrl] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [ttsVoice, setTtsVoice] = useState('');

  function audioReady() {
    return !!melodyUrl;
  }

  // Build a real backing track in the browser (chords + bass + drums + melody).
  function buildAudio() {
    if (!lyrics) return;
    try {
      const { url } = renderSong(lyrics);
      setMelodyUrl(url);
    } catch {
      /* synth is best-effort */
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const v = pickVoice(lang);
      setTtsVoice(v ? v.name : 'default voice');
    } else {
      setTtsSupported(false);
    }
  }

  function playSpoken() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = speakLyrics(lyrics, lang);
    if (!u) return;
    const v = pickVoice(lang);
    if (v) u.voice = v;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  function stopSpoken() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  async function start() {
    if (!idea.trim() && !customLyrics.trim()) return;
    setStatus('queued');
    setError('');
    setStyleLine('');
    setLyrics('');
    setCover('');
    setMelodyUrl('');
    stopSpoken();
    try {
      const res = await fetch('/api/song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, style, lyrics: customLyrics, lang }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'failed to start');
      setTaskId(data.id);
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
        const res = await fetch(`/api/song?id=${id}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'not found');
        setStatus(data.status);
        if (data.styleLine) setStyleLine(data.styleLine);
        if (data.lyrics) setLyrics(data.lyrics);
        if (data.coverB64) setCover(data.coverB64);
        if (data.status === 'succeeded' || data.status === 'failed') {
          clearInterval(timer);
          if (data.status === 'succeeded') buildAudio();
          if (data.status === 'failed') setError(data.error || 'production failed');
        }
      } catch (e) {
        clearInterval(timer);
        setStatus('failed');
        setError(e instanceof Error ? e.message : 'error');
      }
      if (ticks > 140) clearInterval(timer);
    }, 3000);
  }

  const busy = status === 'queued' || status === 'running';

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      {/* Compose panel */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2 text-sm text-ink-300">
          <Wand2 className="h-4 w-4 text-brand-400" /> Describe a song — or paste your own lyrics
        </div>

        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={3}
          placeholder="A dreamy lo-fi track about late-night train rides through a quiet city…"
          className="w-full resize-none rounded-xl border border-white/10 bg-ink-900/60 p-3 text-sm text-white placeholder:text-ink-400 outline-none focus:border-brand-400/60"
        />

        {/* Language selector */}
        <div className="mt-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-ink-400">
            <Languages className="h-3.5 w-3.5" /> Language
          </p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  lang === l.id
                    ? 'border-brand-400/60 bg-brand-500/15 text-white'
                    : 'border-white/10 text-ink-300 hover:border-brand-400/40 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="mb-2 text-xs text-ink-400">Style tags (optional)</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle((cur) => (cur === s ? '' : s))}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  style === s
                    ? 'border-brand-400/60 bg-brand-500/15 text-white'
                    : 'border-white/10 text-ink-300 hover:border-brand-400/40 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <details className="mt-4 rounded-xl border border-white/10 bg-ink-900/40 p-3">
          <summary className="cursor-pointer text-sm text-ink-200">Write my own lyrics instead</summary>
          <textarea
            value={customLyrics}
            onChange={(e) => setCustomLyrics(e.target.value)}
            rows={6}
            placeholder="[Verse]&#10;Walking through the neon rain…"
            className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-ink-900/60 p-3 text-sm text-white placeholder:text-ink-400 outline-none focus:border-brand-400/60"
          />
        </details>

        <button
          onClick={start}
          disabled={busy || (!idea.trim() && !customLyrics.trim())}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 px-4 py-3 font-medium text-white shadow-lg shadow-brand-500/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {busy ? 'Composing…' : 'Create Song'}
        </button>

        <p className="mt-2 text-center text-xs text-ink-400">
          Free generation · OpenRouter lyrics + in-browser music + Pollinations art
        </p>
        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
      </div>

      {/* Result panel */}
      <div className="glass flex flex-col rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Your Song</span>
          <StatusBadge status={status} />
        </div>

        {status === 'idle' && (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-ink-400">
            <Disc3 className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">Your generated track, lyrics and cover will appear here.</p>
          </div>
        )}

        {cover && (
          <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/png;base64,${cover}`} alt="cover art" className="aspect-square w-full object-cover" />
          </div>
        )}

        {styleLine && (
          <div className="mb-3 rounded-xl border border-white/10 bg-ink-900/50 px-3 py-2">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-brand-300">
              <Mic2 className="h-3.5 w-3.5" /> Style
            </p>
            <p className="text-xs leading-relaxed text-ink-200">{styleLine}</p>
          </div>
        )}

        {audioReady() && (
          <div className="mb-3 rounded-xl border border-white/10 bg-ink-900/50 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-brand-300">
              <Music className="h-3.5 w-3.5" /> Instrumental track
            </p>
            <p className="mb-2 text-xs text-ink-400">
              Chords, bass, drums &amp; a melody derived from your lyrics — generated in your browser.
            </p>
            <audio controls src={melodyUrl} className="w-full" />
            <div className="mt-2 flex items-center gap-2">
              {speaking ? (
                <button
                  onClick={stopSpoken}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-ink-200 hover:bg-white/5"
                >
                  <Square className="h-3.5 w-3.5" /> Stop voice
                </button>
              ) : (
                <button
                  onClick={playSpoken}
                  disabled={!ttsSupported}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-ink-200 hover:bg-white/5 disabled:opacity-40"
                >
                  <Play className="h-3.5 w-3.5" /> Add vocal ({LANGUAGES.find((l) => l.id === lang)?.label})
                </button>
              )}
            </div>
            {!ttsSupported && (
              <p className="mt-2 text-xs text-ink-400">Vocal layer needs a browser with SpeechSynthesis.</p>
            )}
            {ttsSupported && ttsVoice && (
              <p className="mt-2 text-xs text-ink-400">Vocal voice: {ttsVoice}</p>
            )}
          </div>
        )}

        {lyrics && (
          <details open className="mb-3 rounded-xl border border-white/10 bg-ink-900/50 p-3">
            <summary className="cursor-pointer text-xs font-medium text-brand-300">Lyrics</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-ink-200">{lyrics}</pre>
          </details>
        )}

        {status === 'succeeded' && audioReady() && (
          <div className="mt-3 flex gap-2">
            <a
              href={melodyUrl}
              download="suno-clone-melody.wav"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400"
            >
              <Download className="h-4 w-4" /> Download
            </a>
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
  const map: Record<string, { label: string; cls: string }> = {
    idle: { label: 'Idle', cls: 'text-ink-400 bg-white/5' },
    queued: { label: 'Queued', cls: 'text-amber-300 bg-amber-400/10' },
    running: { label: 'Composing', cls: 'text-brand-300 bg-brand-500/10' },
    succeeded: { label: 'Ready', cls: 'text-green-300 bg-green-400/10' },
    failed: { label: 'Failed', cls: 'text-red-300 bg-red-400/10' },
  };
  const s = map[status] || map.idle;
  const spinning = status === 'queued' || status === 'running';
  const Icon = spinning ? Loader2 : Check;
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${s.cls}`}>
      <Icon className={`h-3.5 w-3.5 ${spinning ? 'animate-spin' : ''}`} />
      {s.label}
    </span>
  );
}
