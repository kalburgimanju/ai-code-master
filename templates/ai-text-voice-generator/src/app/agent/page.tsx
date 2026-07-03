'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomAgent } from '@/types';
import { Play, Loader2, Share2, Check, Mic, Send, Volume2 } from 'lucide-react';

// ─── AGENT AVATAR GENERATOR ──────────────────────────────
function generateAvatarSVG(gender: 'male' | 'female', style: string, accent: string): string {
  const isFemale = gender === 'female';
  const skin = '#E0AC69';
  const hairColor = isFemale ? '#8B4513' : '#2C2C2C';
  const shirtColor = '#2C3E50';
  const bg1 = accent || '#4c6ef5';
  const bg2 = '#764ba2';

  const hair = isFemale
    ? `<path d="M110 100 Q100 80 120 60 Q150 40 200 45 Q250 40 280 60 Q300 80 290 100 L300 180 Q295 220 280 250 Q270 230 265 180 L265 120 Q200 90 135 120 L135 180 Q130 230 120 250 Q105 220 100 180 Z" fill="${hairColor}"/>`
    : `<path d="M120 95 Q150 60 180 70 Q210 60 240 80 Q260 95 260 120 L260 100 Q250 70 200 55 Q150 70 120 100 Z" fill="${hairColor}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/>
  </linearGradient></defs>
  <rect width="400" height="400" rx="50" fill="url(#bg)"/>
  <rect x="120" y="260" width="160" height="120" rx="8" fill="${shirtColor}"/>
  <rect x="185" y="210" width="30" height="50" rx="5" fill="${skin}"/>
  <ellipse cx="200" cy="155" rx="58" ry="65" fill="${skin}"/>
  <ellipse cx="142" cy="155" rx="10" ry="14" fill="${skin}"/>
  <ellipse cx="258" cy="155" rx="10" ry="14" fill="${skin}"/>
  ${hair}
  <ellipse cx="178" cy="148" rx="10" ry="8" fill="white"/>
  <ellipse cx="222" cy="148" rx="10" ry="8" fill="white"/>
  <circle cx="180" cy="148" r="5" fill="#5D4037"/><circle cx="224" cy="148" r="5" fill="#5D4037"/>
  <circle cx="181" cy="147" r="2" fill="white"/><circle cx="225" cy="147" r="2" fill="white"/>
  <path d="M165 133 Q178 128 191 133" stroke="#333" stroke-width="2" fill="none"/>
  <path d="M209 133 Q222 128 235 133" stroke="#333" stroke-width="2" fill="none"/>
  <path id="mouth" d="M178 178 Q200 192 222 178" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`;
}

// ─── SPEECH AUDIO GENERATION ────────────────────────────
function generateSpeechAudio(text: string, gender: 'male' | 'female'): Blob {
  const sr = 44100;
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return new Blob([], { type: 'audio/wav' });
  const bp = gender === 'male' ? 110 : 200;
  const ns = Math.floor((words.length * 0.31 + 0.3) * sr);
  const s = new Float32Array(ns);
  let si = Math.floor(sr * 0.03);
  for (let w = 0; w < words.length; w++) {
    const wf = Math.floor(0.26 * sr);
    const wp = bp + Math.sin(w * 1.3) * 12;
    for (let i = 0; i < wf && si < ns; i++) {
      const t = si / sr; const env = Math.sin(Math.PI * i / wf);
      const vib = 1 + Math.sin(2 * Math.PI * 6 * (i / sr)) * 0.03;
      let sample = 0;
      for (let h = 1; h <= 3; h++) sample += Math.sin(2 * Math.PI * wp * h * vib * t) * 0.25 / h;
      s[si] = Math.max(-0.85, Math.min(0.85, sample * env * 0.5)); si++;
    }
    si += Math.floor(0.05 * sr);
  }
  const fl = Math.min(Math.floor(sr * 0.06), ns - 50);
  for (let i = 0; i < fl; i++) { const idx = ns - 1 - i; if (idx >= 0) s[idx] *= (fl - i) / fl; }
  const buf = new ArrayBuffer(44 + ns * 2); const v = new DataView(buf);
  const w = (o: number, str: string) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + ns * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, ns * 2, true);
  for (let i = 0; i < ns; i++) v.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, Math.round(s[i] * 32767))), true);
  return new Blob([buf], { type: 'audio/wav' });
}

// ─── AGENT RESPONSE GENERATION ──────────────────────────
function generateAgentResponse(agent: CustomAgent, userInput?: string): string {
  const greetings: Record<string, string> = {
    telecaller: `Hello! This is ${agent.name} calling from our company. I'm reaching out because we have some exciting opportunities in the ${agent.industry} space that I believe would be valuable for you. I'd love to schedule a brief call to discuss how we can help grow your business.`,
    'sales-executive': `Hi there! ${agent.name} here, sales specialist for the ${agent.industry} sector. I've reviewed your requirements and I'm confident our solutions can address your needs. Let me walk you through how we've helped similar businesses achieve remarkable results.`,
    'customer-support': `Welcome! You're connected with ${agent.name}, your support specialist. I'm here to help resolve any issues you're experiencing. Could you tell me a bit more about what's happening so I can assist you effectively?`,
    receptionist: `Good day! You've reached the office. This is ${agent.name} speaking. How may I direct your call today? I can help with appointments, inquiries, or connecting you with the right department.`,
    interviewer: `Welcome to the interview process. I'm ${agent.name}, and I'll be conducting this session. I'm looking forward to learning more about your background and experience in the ${agent.industry} field.`,
    tutor: `Hi! I'm ${agent.name}, your tutor for today. I specialize in ${agent.industry} topics and I'm excited to help you learn. Let's start exploring the subject matter together.`,
    narrator: `Welcome. I'm ${agent.name}, your narrator. Today I'll be guiding you through the world of ${agent.industry}, bringing stories and information to life.`,
    custom: `Hello! I'm ${agent.name}, your AI assistant specializing in ${agent.industry}. I'm here to help with any questions you might have.`,
  };

  const intro = greetings[agent.role] || greetings.custom;
  if (userInput) {
    return `Thank you for sharing that. Based on my expertise in ${agent.industry}, I understand your situation regarding "${userInput}". I'd recommend we take a structured approach to address this. Let me outline the key steps we can take together. Please feel free to ask any follow-up questions.`;
  }
  return intro;
}

// ─── SHARED AGENT PAGE ──────────────────────────────────
function SharedAgentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agent, setAgent] = useState<CustomAgent | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoResponded, setAutoResponded] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveAnimRef = useRef<number>(0);

  useEffect(() => {
    const data = searchParams?.get('data');
    if (!data) { setLoading(false); return; }
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(data)));
      const a: CustomAgent = {
        id: 'shared', name: decoded.n, role: decoded.r,
        systemPrompt: decoded.p, voice: decoded.v,
        gender: decoded.g, avatarStyle: decoded.s,
        accentColor: decoded.c || '#4c6ef5', industry: decoded.i,
        runs: 0, createdAt: '', updatedAt: '',
      };
      setAgent(a);
      // Generate avatar SVG
      const svg = generateAvatarSVG(a.gender, a.avatarStyle, a.accentColor);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      setAvatarUrl(URL.createObjectURL(blob));
      setLoading(false);
    } catch { setLoading(false); }
  }, [searchParams]);

  // Auto-generate intro
  useEffect(() => {
    if (agent && !autoResponded && !loading) {
      setAutoResponded(true);
      triggerResponse(agent);
    }
  }, [agent, loading]);

  // Typewriter effect for captions
  useEffect(() => {
    if (output && textIndex < output.length) {
      const speed = speaking ? 25 : 5;
      const timer = setTimeout(() => {
        setDisplayedText(output.slice(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [output, textIndex, speaking]);

  // Waveform animation when speaking
  useEffect(() => {
    if (!speaking || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width, h = canvas.height;
    let phase = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const bars = 48;
      const barW = w / bars - 2;
      for (let i = 0; i < bars; i++) {
        const height = (Math.sin(phase + i * 0.4) * 0.35 + 0.5) * h * (0.6 + phase * 0.02 % 0.4);
        const alpha = 0.4 + Math.sin(phase + i * 0.3) * 0.3;
        ctx.fillStyle = (agent?.accentColor || '#4c6ef5') + Math.round(Math.abs(alpha) * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.roundRect(i * (barW + 2), (h - height) / 2, barW, height, 2);
        ctx.fill();
      }
      phase += 0.12;
      waveAnimRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(waveAnimRef.current);
  }, [speaking]);

  async function triggerResponse(currentAgent: CustomAgent, userMsg?: string) {
    setRunning(true);
    setOutput(null);
    setDisplayedText('');
    setTextIndex(0);
    setSpeaking(false);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const response = generateAgentResponse(currentAgent, userMsg);
    const blob = generateSpeechAudio(response.slice(0, 300), currentAgent.gender);
    const url = URL.createObjectURL(blob);

    setOutput(response);
    setAudioUrl(url);
    setRunning(false);

    // Auto-play audio
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().then(() => setSpeaking(true)).catch(() => {});
    }
  }

  function handleSendMessage() {
    if (!input.trim() || !agent) return;
    triggerResponse(agent, input);
    setInput('');
  }

  function handleCopyUrl() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="card text-center py-12 px-8 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto mb-4 text-4xl">🤖</div>
          <h2 className="text-xl font-bold text-white mb-2">Agent Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">This agent link is invalid or has expired.</p>
          <button onClick={() => router.push('/')} className="btn-primary">Go Home</button>
        </div>
      </div>
    );
  }

  const roleIcons: Record<string, string> = {
    telecaller: '📞', 'sales-executive': '💼', 'customer-support': '🎧',
    receptionist: '🏢', interviewer: '🎙️', tutor: '📚', narrator: '🎬', custom: '🤖'
  };
  const roleIcon = roleIcons[agent.role] || '🤖';

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Minimal Nav */}
      <nav className="border-b border-dark-500/30 bg-dark-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">{agent.name} · {agent.industry}</span>
          <button onClick={handleCopyUrl} className="text-gray-500 hover:text-white transition-colors p-1.5">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-2xl mx-auto w-full">
        {/* AI Avatar Display */}
        <div className="relative mb-6">
          <div className={`w-44 h-44 rounded-3xl overflow-hidden border-2 transition-all duration-500 ${speaking ? 'shadow-2xl shadow-primary-500/30 border-primary-400' : 'border-dark-400 shadow-lg'}`}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-dark-700 flex items-center justify-center text-6xl">{roleIcon}</div>
            )}
          </div>

          {/* Speaking ring animation */}
          {speaking && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-3xl border-2 border-primary-400/30 animate-ping" />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
              running ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' :
              speaking ? 'bg-green-500/15 border-green-500/30 text-green-300' :
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-amber-400 animate-pulse' : speaking ? 'bg-green-400' : 'bg-emerald-400'}`} />
              {running ? 'Thinking...' : speaking ? 'Speaking' : 'Ready'}
            </div>
          </div>
        </div>

        {/* Agent Name */}
        <h1 className="text-xl font-bold text-white mb-1">{agent.name}</h1>
        <p className="text-sm text-gray-500 mb-6 capitalize">{agent.role.replace('-', ' ')}</p>

        {/* Waveform (visible during speaking) */}
        <div className={`w-full max-w-lg mb-4 transition-all duration-500 ${speaking ? 'opacity-100 h-12' : 'opacity-30 h-8'}`}>
          <canvas ref={canvasRef} width={400} height={speaking ? 48 : 32} className="w-full h-full rounded-lg" />
        </div>

        {/* Caption / Response Text */}
        <div className="w-full max-w-lg mb-6 min-h-[100px]">
          {running && !output ? (
            <div className="flex items-center justify-center gap-1.5 py-4">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-sm text-gray-500 ml-2">{agent.name} is responding...</span>
            </div>
          ) : displayedText ? (
            <div className="bg-dark-800/60 rounded-2xl border border-dark-500 p-4 backdrop-blur-sm">
              <p className="text-sm text-gray-200 leading-relaxed">{displayedText}</p>
              {textIndex < (output?.length || 0) && (
                <span className="inline-block w-2 h-4 bg-primary-400 animate-pulse ml-0.5" />
              )}
            </div>
          ) : null}
        </div>

        {/* Audio element */}
        <audio ref={audioRef} onEnded={() => setSpeaking(false)} className="hidden" />

        {/* Input */}
        <div className="w-full max-w-lg">
          <div className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              className="input-field flex-1 text-sm" placeholder={`Message ${agent.name}...`}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); } }} />
            <button onClick={handleSendMessage} disabled={!input.trim() || running}
              className="btn-primary px-4 flex items-center justify-center">
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-600 text-center mt-2">
            {agent.gender === 'male' ? '👨' : '👩'} {agent.voice.replace('-', ' ')} · Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SharedAgentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
      </div>
    }>
      <SharedAgentContent />
    </Suspense>
  );
}
