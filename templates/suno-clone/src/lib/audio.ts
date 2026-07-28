// Client-side music studio. Renders an actual SONG in the browser with no
// network calls — a chord progression, bassline, drum pattern and a melody
// whose pitches are derived from the lyrics, all mixed to one WAV.
//
// This guarantees the user gets real music (not just spoken lyrics) even when
// every hosted music API is unreachable from the server. TTS (SpeechSynthesis)
// remains available as an optional "sing the words" layer on top.

import type { LanguageId } from '@/lib/openrouter';

const LOCALE: Record<LanguageId, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
};

// ---------- deterministic noise from text (so a lyric => a stable song) ----------
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- music theory ----------
const NOTE_HZ = (semi: number) => 440 * Math.pow(2, (semi - 9) / 12); // semi relative to A4=440, A4 = midi 69 -> we use 0=low
// Scale degrees in semitones for a major pentatonic, used for melody.
const PENTA = [0, 2, 4, 7, 9, 12, 9, 7, 4, 2];
// Four-chord progressions (scale degrees, root=0) for different moods.
const PROGRESSIONS: number[][] = [
  [0, 5, 9, 7], // I–IV–vi–V (pop)
  [0, 9, 5, 7], // I–vi–IV–V
  [0, 3, 4, 4], // I–iii–IV
  [0, 7, 9, 5], // I–V–vi–IV
];
const CHORD_SHAPES: number[][] = [
  [0, 4, 7], // major
  [0, 3, 7], // minor
  [0, 4, 7],
  [0, 4, 7],
];

// Map a character to a melodic pitch (syllable tracking) for a sung feel.
function pitchForChar(ch: string, rng: () => number, base: number): number {
  const code = ch.toLowerCase().charCodeAt(0);
  if (!/[a-z0-9ऀ-෿]/i.test(ch)) return -1; // skip punctuation/spaces
  const idx = code % PENTA.length;
  return base + PENTA[idx] + (rng() > 0.8 ? 12 : 0);
}

// ---------- synthesis primitives ----------
function adsr(i: number, len: number, sr: number, a = 0.01, d = 0.08, s = 0.6, r = 0.12): number {
  const t = i / sr;
  const dur = len / sr;
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t > dur - r) return Math.max(0, s * ((dur - t) / r));
  return s;
}

function addTone(
  buf: Float32Array,
  sr: number,
  startSample: number,
  durSamples: number,
  hz: number,
  gain: number,
  type: 'sine' | 'tri' | 'saw' | 'square' = 'sine',
  detune = 1
) {
  for (let i = 0; i < durSamples; i++) {
    const idx = startSample + i;
    if (idx >= buf.length) break;
    const t = i / sr;
    const env = adsr(i, durSamples, sr);
    let s = 0;
    if (type === 'sine') s = Math.sin(2 * Math.PI * hz * t);
    else if (type === 'tri') s = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * hz * t));
    else if (type === 'saw') s = 2 * (hz * t - Math.floor(0.5 + hz * t));
    else s = Math.sign(Math.sin(2 * Math.PI * hz * t));
    buf[idx] += s * env * gain;
  }
  // optional second oscillator for warmth
  if (detune !== 1) {
    for (let i = 0; i < durSamples; i++) {
      const idx = startSample + i;
      if (idx >= buf.length) break;
      const t = i / sr;
      const env = adsr(i, durSamples, sr);
      buf[idx] += Math.sin(2 * Math.PI * hz * detune * t) * env * gain * 0.4;
    }
  }
}

function addKick(buf: Float32Array, sr: number, start: number) {
  for (let i = 0; i < sr * 0.18; i++) {
    const idx = start + i;
    if (idx >= buf.length) break;
    const t = i / sr;
    const env = Math.exp(-t * 30);
    const hz = 120 * Math.exp(-t * 30) + 40;
    buf[idx] += Math.sin(2 * Math.PI * hz * t) * env * 0.9;
  }
}
function addHat(buf: Float32Array, sr: number, start: number) {
  for (let i = 0; i < sr * 0.05; i++) {
    const idx = start + i;
    if (idx >= buf.length) break;
    const t = i / sr;
    const env = Math.exp(-t * 80);
    buf[idx] += (Math.random() * 2 - 1) * env * 0.18;
  }
}
function addSnare(buf: Float32Array, sr: number, start: number) {
  for (let i = 0; i < sr * 0.12; i++) {
    const idx = start + i;
    if (idx >= buf.length) break;
    const t = i / sr;
    const env = Math.exp(-t * 40);
    buf[idx] += (Math.random() * 2 - 1) * env * 0.25;
    buf[idx] += Math.sin(2 * Math.PI * 180 * t) * env * 0.15;
  }
}

// ---------- main render ----------
export interface SynthResult {
  url: string;
  durationSec: number;
}

export function renderSong(lyrics: string, seedText = lyrics): SynthResult {
  const rng = mulberry32(hash(seedText));
  const sr = 44100;
  const bpm = 92 + Math.floor(rng() * 36); // 92–128
  const beat = 60 / bpm;
  const barLen = beat * 4;
  const bars = 8;
  const total = Math.ceil(barLen * bars * sr);
  const buf = new Float32Array(total);

  const prog = PROGRESSIONS[Math.floor(rng() * PROGRESSIONS.length)];
  const rootSemi = 48 + Math.floor(rng() * 5); // around C3-ish

  // Drums every bar
  for (let b = 0; b < bars; b++) {
    const barStart = Math.floor(b * barLen * sr);
    addKick(buf, sr, barStart);
    addKick(buf, sr, barStart + Math.floor(beat * 2 * sr));
    addSnare(buf, sr, barStart + Math.floor(beat * 1 * sr));
    addSnare(buf, sr, barStart + Math.floor(beat * 3 * sr));
    for (let h = 0; h < 8; h++) addHat(buf, sr, barStart + Math.floor((beat / 2) * h * sr));
  }

  // Chords + bass per bar
  for (let b = 0; b < bars; b++) {
    const chordRoot = rootSemi + prog[b % prog.length];
    const shape = CHORD_SHAPES[b % CHORD_SHAPES.length];
    const barStart = Math.floor(b * barLen * sr);
    const chordDur = Math.floor(barLen * sr);
    // pad chord (soft saws)
    for (const off of shape) {
      addTone(buf, sr, barStart, chordDur, NOTE_HZ(chordRoot + off), 0.10, 'saw', 1.005);
    }
    // bass on beats 1 & 3
    addTone(buf, sr, barStart, Math.floor(beat * sr), NOTE_HZ(chordRoot - 12), 0.32, 'square');
    addTone(buf, sr, barStart + Math.floor(beat * 2 * sr), Math.floor(beat * sr), NOTE_HZ(chordRoot - 12), 0.32, 'square');
  }

  // Melody tracked to lyrics syllables, looping through the words
  const words = lyrics.replace(/\[[^\]]+\]/g, ' ').split(/\s+/).filter(Boolean);
  const melBase = rootSemi + 12; // an octave up for the lead
  let wordIdx = 0;
  const leadRng = mulberry32(hash(seedText + 'lead'));
  for (let b = 0; b < bars; b++) {
    const barStart = Math.floor(b * barLen * sr);
    const steps = 8;
    for (let s = 0; s < steps; s++) {
      const w = words[wordIdx % Math.max(1, words.length)] || 'a';
      wordIdx++;
      const ch = w[Math.floor(leadRng() * w.length)] || 'a';
      const semi = pitchForChar(ch, leadRng, melBase);
      if (semi < 0) continue;
      const noteStart = barStart + Math.floor((s * barLen * sr) / steps);
      const noteDur = Math.floor((barLen * sr) / steps) * 0.9;
      addTone(buf, sr, noteStart, noteDur, NOTE_HZ(semi), 0.22, 'sine', 1.003);
    }
  }

  // normalize
  let peak = 0;
  for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
  if (peak > 0) {
    const g = 0.92 / peak;
    for (let i = 0; i < buf.length; i++) buf[i] *= g;
  }

  const wav = encodeWav(buf, sr);
  const blob = new Blob([wav], { type: 'audio/wav' });
  return { url: URL.createObjectURL(blob), durationSec: total / sr };
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return buffer;
}

// Optional: read the lyrics aloud in the chosen language (adds a vocal layer).
export function speakLyrics(lyrics: string, lang: LanguageId): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const text = lyrics.replace(/\[[^\]]+\]/g, '').trim();
  if (!text) return null;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LOCALE[lang];
  u.rate = 0.92;
  u.pitch = 1.0;
  return u;
}

export function pickVoice(lang: LanguageId): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const locale = LOCALE[lang];
  return (
    voices.find((v) => v.lang === locale) ||
    voices.find((v) => v.lang.startsWith(locale.split('-')[0])) ||
    null
  );
}
