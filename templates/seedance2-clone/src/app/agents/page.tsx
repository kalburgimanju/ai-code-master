'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import {
  Wand2,
  Film,
  Repeat,
  Music2,
  Bot,
  Loader2,
  Sparkles,
  Send,
  ScrollText,
} from 'lucide-react';

const AGENTS = [
  { id: 'prompt-enhancer', icon: Wand2, name: 'Prompt Enhancer', color: 'from-brand-500 to-blue-500', desc: 'Turns a rough idea into a vivid, camera-aware generation prompt.' },
  { id: 'storyboard', icon: ScrollText, name: 'Storyboard', color: 'from-purple-500 to-fuchsia-500', desc: 'Breaks a concept into sequential, camera-ready shots.' },
  { id: 'motion-director', icon: Repeat, name: 'Motion Director', color: 'from-emerald-500 to-teal-500', desc: 'Describes precise motion and physics to apply to assets.' },
  { id: 'audio-describer', icon: Music2, name: 'Audio Agent', color: 'from-amber-500 to-orange-500', desc: 'Writes a sound-design brief: ambience, music, foley.' },
] as const;

type AgentId = (typeof AGENTS)[number]['id'];

const PRESETS: Record<AgentId, string> = {
  'prompt-enhancer': 'a cat astronaut drinking coffee on the moon',
  storyboard: 'a lone explorer discovering a hidden city in the clouds',
  'motion-director': 'a flag waving on a windswept cliff at dawn',
  'audio-describer': 'a quiet forest at first light with distant birdsong',
};

export default function AgentsPage() {
  const [active, setActive] = useState<AgentId>('prompt-enhancer');
  const [input, setInput] = useState(PRESETS['prompt-enhancer']);
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);

  function selectAgent(id: AgentId) {
    setActive(id);
    setInput(PRESETS[id]);
    setOutput('');
  }

  async function run() {
    if (!input.trim() || busy) return;
    setBusy(true);
    setOutput('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: active, input }),
      });
      const data = await res.json();
      setOutput(data.ok ? data.output : `Error: ${data.error}`);
    } catch (e) {
      setOutput(e instanceof Error ? e.message : 'request failed');
    } finally {
      setBusy(false);
    }
  }

  const ActiveIcon = AGENTS.find((a) => a.id === active)!.icon;

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="aurora px-4 pb-20 pt-14">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-300">
            <Bot className="h-3.5 w-3.5 text-brand-400" /> Highfi Agent Studio
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Agents that <span className="gradient-text">direct your video</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-300">
            Each agent is a specialized OpenRouter model. Compose them into a pipeline: enhance → storyboard → direct motion → score audio.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[280px_1fr]">
          {/* Agent list */}
          <div className="space-y-2">
            {AGENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => selectAgent(a.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                  active === a.id ? 'border-brand-400/50 bg-white/5' : 'border-white/10 bg-ink-900/40 hover:bg-white/5'
                }`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${a.color} text-white`}>
                  <a.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">{a.name}</span>
                  <span className="block text-xs text-ink-400">{a.desc}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Agent console */}
          <div className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 text-white">
                <ActiveIcon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-white">{AGENTS.find((a) => a.id === active)!.name}</span>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder="Describe your idea…"
              className="w-full resize-none rounded-xl border border-white/10 bg-ink-900/60 p-3 text-sm text-white placeholder:text-ink-400 outline-none focus:border-brand-400/60"
            />

            <button
              onClick={run}
              disabled={busy || !input.trim()}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/30 transition hover:opacity-90 disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {busy ? 'Running agent…' : 'Run agent'}
            </button>

            {output && (
              <div className="mt-4 rounded-xl border border-white/10 bg-ink-900/50 p-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-300">
                  <Sparkles className="h-3.5 w-3.5" /> Agent output
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-100">{output}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
