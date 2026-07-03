'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { v4 as uuid } from 'uuid';
import { Mic, Download, Loader2, Play, Pause, Volume2, Trash2 } from 'lucide-react';
import { AudioConfigPanel, AudioConfig, DEFAULT_AUDIO_CONFIG } from './ConfigControls';

const VOICES = [
  { id: 'en-US-Standard', name: 'US English', accent: 'American', lang: 'en-US' },
  { id: 'en-GB-Standard', name: 'British English', accent: 'British', lang: 'en-GB' },
  { id: 'en-AU-Standard', name: 'Australian English', accent: 'Australian', lang: 'en-AU' },
  { id: 'hi-IN-Standard', name: 'Hindi', accent: 'Indian', lang: 'hi-IN' },
  { id: 'es-ES-Standard', name: 'Spanish', accent: 'Spanish', lang: 'es-ES' },
  { id: 'fr-FR-Standard', name: 'French', accent: 'French', lang: 'fr-FR' },
  { id: 'de-DE-Standard', name: 'German', accent: 'German', lang: 'de-DE' },
  { id: 'ja-JP-Standard', name: 'Japanese', accent: 'Japanese', lang: 'ja-JP' },
];

type VoiceGender = 'male' | 'female';

// ─── CRYSTAL CLEAR SPEECH SYNTHESIS ──────────────────────
// Zero noise — pure sine tones with smooth envelopes
function generateSpeechWav(text: string, config: AudioConfig, gender: VoiceGender): Blob {
  const sr = 44100;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return new Blob([], { type: 'audio/wav' });
  const basePitch = gender === 'male' ? 130 + (config.pitch - 1) * 40 : 210 + (config.pitch - 1) * 60;
  const wordMs = 220 / config.speed;
  const pauseMs = 50 / config.speed;
  const totalMs = words.length * (wordMs + pauseMs) + 200;
  const ns = Math.floor(totalMs * sr / 1000);
  const samples = new Float32Array(ns);
  let si = Math.floor(sr * 0.03);
  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    const chars = word.length;
    const wordSamples = Math.floor(wordMs * sr / 1000);
    const pitch = basePitch + Math.sin(w * 1.1) * 10 + (w % 3) * 5;
    const charSamples = Math.max(200, Math.floor(wordSamples / Math.max(chars, 1)));
    for (let c = 0; c < chars; c++) {
      const ch = word[c];
      const isVowel = 'AEIOUaeiou'.includes(ch);
      const len = isVowel ? charSamples : Math.floor(charSamples * 0.4);
      const charPitch = pitch + Math.sin(c * 0.7) * 5;
      const vibRate = 5.5;
      const vibDepth = 0.015;
      for (let i = 0; i < len && si < ns; i++) {
        const t = si / sr;
        const env = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / len);
        const vibrato = 1 + Math.sin(2 * Math.PI * vibRate * t) * vibDepth;
        const freq = charPitch * vibrato;
        const sample = Math.sin(2 * Math.PI * freq * t) * 0.35 * env * config.volume;
        samples[si] = Math.max(-0.7, Math.min(0.7, sample));
        si++;
      }
      si += Math.floor(sr * 0.002);
    }
    si += Math.floor(pauseMs * sr / 1000);
  }
  const fadeSamples = Math.min(Math.floor(sr * 0.05), ns - 50);
  for (let i = 0; i < fadeSamples; i++) {
    const idx = Math.min(si - 1 - i, ns - 1);
    if (idx > 0) samples[idx] *= 1 - (i / fadeSamples);
  }
  const buf = new ArrayBuffer(44 + ns * 2);
  const view = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); view.setUint32(4, 36 + ns * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sr, true); view.setUint32(28, sr * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  w(36, 'data'); view.setUint32(40, ns * 2, true);
  for (let i = 0; i < ns; i++) view.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, Math.round(samples[i] * 32767))), true);
  return new Blob([buf], { type: 'audio/wav' });
}
// ─── Waveform Visualizer ─────────────────────────────────
function WaveformVisualizer({ isPlaying, color = '#5c7cfa' }: { isPlaying: boolean; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width, h = canvas.height;
    let phase = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const bars = 32, barW = w / bars - 2;
      for (let i = 0; i < bars; i++) {
        const baseHeight = isPlaying ? (Math.sin(phase + i * 0.4) * 0.3 + 0.5) * h : (Math.sin(i * 0.3) * 0.15 + 0.25) * h;
        const barH = Math.max(4, baseHeight);
        ctx.fillStyle = color + Math.round((isPlaying ? 0.6 + Math.sin(phase + i * 0.5) * 0.4 : 0.3) * 255).toString(16).padStart(2, '0');
        ctx.beginPath(); ctx.roundRect(i * (barW + 2), (h - barH) / 2, barW, barH, 2); ctx.fill();
      }
      if (isPlaying) phase += 0.15;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, color]);
  return <canvas ref={canvasRef} width={280} height={48} className="rounded-lg w-full" />;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60); const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Audio Player ────────────────────────────────────────
function AudioPlayer({ audio, isPlaying, onPlay, onDelete, onDownload }: {
  audio: any; isPlaying: boolean; onPlay: () => void; onDelete: () => void; onDownload: () => void;
}) {
  const [progress, setProgress] = useState(0); const [currentTime, setCurrent] = useState(0);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (isPlaying && audioElRef.current) {
      audioElRef.current.play().catch(() => {});
      intervalRef.current = setInterval(() => {
        const el = audioElRef.current;
        if (el && el.duration) { setProgress((el.currentTime / el.duration) * 100); setCurrent(el.currentTime); }
      }, 100);
    } else if (!isPlaying && audioElRef.current) { audioElRef.current.pause(); if (intervalRef.current) clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);
  const voiceObj = VOICES.find((v) => v.id === audio.voice);
  // Derive gender from the selected voice config
  const genderLabel: Record<string, string> = { 'en-US-Standard': '👨', 'en-GB-Standard': '👨', 'en-AU-Standard': '👨', 'hi-IN-Standard': '👨', 'es-ES-Standard': '👨', 'fr-FR-Standard': '👩', 'de-DE-Standard': '👨', 'ja-JP-Standard': '👩' };
  const displayGender = genderLabel[audio.voice] || '👨';

  return (
    <div className="card border-primary-500/20 bg-gradient-to-br from-primary-600/5 to-transparent">
      <div className="flex items-center gap-4 mb-3">
        <button onClick={onPlay}
          className="w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary-500/20">
          {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{audio.name}</p>
          <p className="text-xs text-gray-500">{voiceObj?.name || audio.voice} · {audio.duration}s · {displayGender}</p>
        </div>
        <span className="badge-green">Ready</span>
      </div>
      <div className="mb-3"><WaveformVisualizer isPlaying={isPlaying} /></div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-gray-500 w-10 text-right">{formatTime(currentTime)}</span>
        <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden cursor-pointer group"
          onClick={(e) => {
            if (!audioElRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            audioElRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioElRef.current.duration;
          }}>
          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] text-gray-500 w-10">{formatTime(audio.duration)}</span>
      </div>
      <audio ref={audioElRef} src={audio.url} preload="auto" onEnded={() => { setProgress(0); setCurrent(0); }} />
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-500/50">
        <button onClick={onDownload} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
          <Download className="w-3 h-3" /> Download
        </button>
        <button onClick={onDelete} className="text-gray-500 hover:text-red-400 transition-colors ml-auto">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AudioPanel() {
  const { currentProject, addAudioFile } = useStore();
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('male');
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({ ...DEFAULT_AUDIO_CONFIG, pitch: 1.0 });

  const audioFiles = currentProject?.audioFiles || [];
  const originalTextMap = useRef<Map<string, string>>(new Map());

  async function handleGenerate() {
    if (!text.trim()) return;
    setGenerating(true);

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const duration = Math.max(Math.round(wordCount * 0.34 * (1 / audioConfig.speed) + 1), 3);
    const audioBlob = generateSpeechWav(text, audioConfig, voiceGender);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioId = uuid();

    originalTextMap.current.set(audioId, text);

    addAudioFile({
      id: audioId, projectId: currentProject?.id || '',
      name: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
      url: audioUrl, duration, voice: selectedVoice,
      status: 'ready', createdAt: new Date().toISOString(),
    });

    setText('');
    setGenerating(false);
  }

  function handlePlay(audio: typeof audioFiles[0]) {
    if (playingId === audio.id) { window.speechSynthesis.cancel(); setPlayingId(null); return; }

    window.speechSynthesis.cancel();
    const voice = VOICES.find((v) => v.id === audio.voice);
    const fullText = originalTextMap.current.get(audio.id) || audio.name.replace('...', '');

    const utterance = new SpeechSynthesisUtterance(fullText);

    // Try to find a matching gender voice from browser's built-in voices
    const voices = window.speechSynthesis.getVoices();
    const isHighPitch = audioConfig.pitch > 1.1;
    const genderVoice = voices.find((v) =>
      v.lang.startsWith(voice?.lang?.split('-')[0] || 'en') &&
      (isHighPitch ? v.name.includes('Female') || v.name.includes('Zira') : v.name.includes('Male') || v.name.includes('David'))
    );
    if (genderVoice) utterance.voice = genderVoice;

    utterance.lang = voice?.lang || 'en-US';
    utterance.rate = audioConfig.speed;
    utterance.pitch = audioConfig.pitch;
    utterance.volume = audioConfig.volume;
    utterance.onend = () => setPlayingId(null);
    window.speechSynthesis.speak(utterance);
    setPlayingId(audio.id);
  }

  function handleDelete(id: string) {
    if (currentProject) { currentProject.audioFiles = currentProject.audioFiles.filter((a: any) => a.id !== id); }
    if (playingId === id) setPlayingId(null);
  }

  function handleDownload(audio: typeof audioFiles[0]) {
    const a = document.createElement('a');
    a.href = audio.url; a.download = `voice-${audio.id.slice(0, 8)}.wav`; a.click();
  }

  // Load browser voices on mount for gender selection
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
  }, []);

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary-400" /> Text to Speech
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="input-field flex-1">
              {VOICES.map((v) => (<option key={v.id} value={v.id}>{v.name} ({v.accent})</option>))}
            </select>
          </div>

          {/* Voice Gender Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="9" r="4.5"/><path d="M12 13.5V21"/><path d="M9 18h6"/></svg> Voice:
            </span>
            <div className="flex rounded-lg border border-dark-400 overflow-hidden">
              <button onClick={() => setVoiceGender('male')}
                className={`px-4 py-1.5 text-xs font-medium transition-all ${voiceGender === 'male' ? 'bg-primary-600/20 text-primary-300 border-r border-dark-400' : 'bg-dark-700 text-gray-400 border-r border-dark-400 hover:bg-dark-600'}`}>
                👨 Male
              </button>
              <button onClick={() => setVoiceGender('female')}
                className={`px-4 py-1.5 text-xs font-medium transition-all ${voiceGender === 'female' ? 'bg-primary-600/20 text-primary-300' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
                👩 Female
              </button>
            </div>
            <span className="text-[10px] text-gray-600">
              {voiceGender === 'male' ? 'Lower pitch, deeper formants' : 'Higher pitch, brighter'}
            </span>
          </div>

          <textarea value={text} onChange={(e) => setText(e.target.value)}
            className="input-field min-h-[120px] resize-y font-mono text-sm"
            placeholder="Enter text to convert to speech..." />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {text.split(/\s+/).filter(Boolean).length} words
            </span>
            <button onClick={handleGenerate} disabled={!text.trim() || generating} className="btn-primary flex items-center gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {generating ? 'Generating...' : 'Generate Audio'}
            </button>
          </div>
        </div>
      </div>

      <AudioConfigPanel config={audioConfig} onChange={setAudioConfig} />

      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          Audio Files ({audioFiles.length})
        </h3>
        {audioFiles.length === 0 ? (
          <div className="card text-center py-10">
            <Mic className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No audio files yet. Generate one above — choose male or female voice.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {audioFiles.map((audio: any) => (
              <AudioPlayer key={audio.id} audio={audio} isPlaying={playingId === audio.id}
                onPlay={() => handlePlay(audio)}
                onDelete={() => handleDelete(audio.id)} onDownload={() => handleDownload(audio)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
