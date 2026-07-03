'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/store';
import { v4 as uuid } from 'uuid';
import {
  Sparkles, Mic, Video, User, Zap, Loader2,
  Download, CheckCircle2, AlertCircle, Clock, Play, Pause, Volume2
} from 'lucide-react';

const GENERATION_TYPES = [
  { id: 'full', label: 'Full Video', icon: Sparkles, desc: 'Script + Voice + Avatar + Video', agent: 'orchestrator-1' },
  { id: 'audio', label: 'Voice Only', icon: Mic, desc: 'Text-to-Speech generation', agent: 'tts-agent-1' },
  { id: 'video', label: 'Video Only', icon: Video, desc: 'Video from text prompt', agent: 'video-agent-1' },
  { id: 'avatar', label: 'Avatar Only', icon: User, desc: 'AI avatar creation', agent: 'avatar-agent-1' },
];

const VOICE_OPTIONS = [
  { id: 'en-US-Standard', name: 'US English', lang: 'en-US' },
  { id: 'en-GB-Standard', name: 'British English', lang: 'en-GB' },
  { id: 'en-AU-Standard', name: 'Australian English', lang: 'en-AU' },
  { id: 'hi-IN-Standard', name: 'Hindi', lang: 'hi-IN' },
  { id: 'es-ES-Standard', name: 'Spanish', lang: 'es-ES' },
  { id: 'fr-FR-Standard', name: 'French', lang: 'fr-FR' },
];

const AVATAR_STYLES = [
  'professional', 'casual', 'anime', 'realistic', 'cartoon', '3d-render',
];

interface GenerationResult {
  id: string;
  type: string;
  prompt: string;
  status: 'generating' | 'ready' | 'error';
  progress: number;
  audioBlob?: Blob;
  audioUrl?: string;
  videoBlob?: Blob;
  videoUrl?: string;
  videoThumbnail?: string;
  avatarSvg?: string;
  avatarUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// TTS generation
function generateTTS(text: string, lang: string): Promise<Blob> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;

    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const dest = audioCtx.createMediaStreamDestination();
    oscillator.connect(gainNode);
    gainNode.connect(dest);
    gainNode.gain.value = 0;

    const mediaRecorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });
    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'audio/webm' }));
      audioCtx.close();
    };

    oscillator.start();
    mediaRecorder.start();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    utterance.onend = () => setTimeout(() => { mediaRecorder.stop(); oscillator.stop(); }, 200);
    utterance.onerror = () => { mediaRecorder.stop(); oscillator.stop(); resolve(new Blob([], { type: 'audio/webm' })); };
  });
}

// Avatar SVG generation (simplified)
function generateAvatarSVG(prompt: string, style: string): string {
  const lower = prompt.toLowerCase();
  const hairColor = lower.includes('blonde') ? '#F4D03F' : lower.includes('brown') ? '#8B4513' : lower.includes('red') ? '#C0392B' : lower.includes('black') ? '#1C1C1C' : '#5D4037';
  const skinTone = lower.includes('dark') ? '#8D5524' : lower.includes('light') || lower.includes('pale') ? '#FDDBB5' : '#E0AC69';
  const isFemale = lower.includes('female') || lower.includes('woman') || lower.includes('girl');
  const hasGlasses = lower.includes('glasses');
  const expression = lower.includes('smile') || lower.includes('happy') ? 'M175 175 Q200 195 225 175' : 'M180 178 Q200 185 220 178';

  const bgColors: Record<string, [string, string]> = {
    professional: ['#667eea', '#764ba2'], casual: ['#f093fb', '#f5576c'],
    anime: ['#4facfe', '#00f2fe'], realistic: ['#43e97b', '#38f9d7'],
    cartoon: ['#fa709a', '#fee140'], '3d-render': ['#a18cd1', '#fbc2eb'],
  };
  const [bg1, bg2] = bgColors[style] || bgColors.professional;

  const hairPath = isFemale
    ? `<path d="M110 100 Q100 80 120 60 Q150 40 200 45 Q250 40 280 60 Q300 80 290 100 L300 180 Q295 220 280 250 Q270 230 265 180 L265 120 Q200 90 135 120 L135 180 Q130 230 120 250 Q105 220 100 180 Z" fill="${hairColor}"/>`
    : `<path d="M120 95 Q150 60 180 70 Q210 60 240 80 Q260 95 260 120 L260 100 Q250 70 200 55 Q150 70 120 100 Z" fill="${hairColor}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="40" fill="url(#bg)"/>
  <rect x="120" y="260" width="160" height="120" rx="8" fill="#2C3E50"/>
  <rect x="185" y="210" width="30" height="50" rx="5" fill="${skinTone}"/>
  <ellipse cx="200" cy="155" rx="58" ry="65" fill="${skinTone}"/>
  <ellipse cx="142" cy="155" rx="10" ry="14" fill="${skinTone}"/>
  <ellipse cx="258" cy="155" rx="10" ry="14" fill="${skinTone}"/>
  ${hairPath}
  <ellipse cx="178" cy="148" rx="10" ry="8" fill="white"/>
  <ellipse cx="222" cy="148" rx="10" ry="8" fill="white"/>
  <circle cx="180" cy="148" r="5" fill="#5D4037"/><circle cx="224" cy="148" r="5" fill="#5D4037"/>
  <circle cx="181" cy="147" r="2" fill="white"/><circle cx="225" cy="147" r="2" fill="white"/>
  <path d="M165 133 Q178 128 191 133" stroke="#333" stroke-width="2.5" fill="none"/>
  <path d="M209 133 Q222 128 235 133" stroke="#333" stroke-width="2.5" fill="none"/>
  <path d="${expression}" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  ${hasGlasses ? '<circle cx="178" cy="148" r="16" fill="none" stroke="#333" stroke-width="2.5"/><circle cx="222" cy="148" r="16" fill="none" stroke="#333" stroke-width="2.5"/><path d="M194 148 L206 148" stroke="#333" stroke-width="2.5"/>' : ''}
</svg>`;
}

// Video generation using Canvas
async function generateVideo(prompt: string, style: string, onProgress: (p: number) => void): Promise<{ blob: Blob; thumbnail: string }> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;
  const fps = 30;
  const duration = 6;
  const totalFrames = duration * fps;
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const thumb = document.createElement('canvas');
      thumb.width = 320; thumb.height = 180;
      thumb.getContext('2d')!.drawImage(canvas, 0, 0, 320, 180);
      resolve({ blob, thumbnail: thumb.toDataURL('image/jpeg', 0.7) });
    };
    recorder.start();

    const styleColors: Record<string, string[]> = {
      cinematic: ['#1a1a2e', '#16213e', '#0f3460'],
      animated: ['#ff6b6b', '#feca57', '#48dbfb'],
      minimalist: ['#f8f9fa', '#dee2e6', '#adb5bd'],
      documentary: ['#2d3436', '#636e72', '#b2bec3'],
      social: ['#e84393', '#6c5ce7', '#00b894'],
      presentation: ['#2c3e50', '#3498db', '#ecf0f1'],
    };
    const colors = styleColors[style] || styleColors.cinematic;

    let frame = 0;
    const draw = () => {
      if (frame >= totalFrames) { recorder.stop(); return; }
      const t = frame / totalFrames;
      const time = frame / fps;

      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, colors[0]); bg.addColorStop(1, colors[1]);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 12; i++) {
        const x = (Math.sin(time * 0.5 + i * 0.8) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.3 + i * 1.2) * 0.5 + 0.5) * canvas.height;
        const size = 20 + Math.sin(time + i) * 15;
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = colors[i % 3];
        if (i % 3 === 0) { ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); }
        else if (i % 3 === 1) { ctx.fillRect(x - size / 2, y - size / 2, size, size); }
        else { ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size, y + size); ctx.lineTo(x - size, y + size); ctx.closePath(); ctx.fill(); }
      }
      ctx.globalAlpha = 1;

      for (let i = 0; i < 20; i++) {
        const px = (i * 37 + time * 20) % canvas.width;
        const py = (i * 53 + Math.sin(time + i) * 30) % canvas.height;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
      }

      const fadeIn = Math.min(1, t * 4);
      const fadeOut = t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1;
      ctx.globalAlpha = fadeIn * fadeOut;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, canvas.height * 0.65, canvas.width, 55);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      const title = prompt.length > 50 ? prompt.slice(0, 47) + '...' : prompt;
      ctx.fillText(title, canvas.width / 2, canvas.height * 0.72);
      ctx.font = '12px Arial';
      ctx.fillStyle = colors[2];
      ctx.fillText(`${style} · AI Generated`, canvas.width / 2, canvas.height * 0.82);
      ctx.globalAlpha = 1;

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, canvas.height - 4, canvas.width, 4);
      ctx.fillStyle = colors[2];
      ctx.fillRect(0, canvas.height - 4, canvas.width * t, 4);

      frame++;
      onProgress(Math.round(t * 100));
      requestAnimationFrame(draw);
    };
    draw();
  });
}

export default function GeneratePanel() {
  const { agents, currentProject, addAudioFile, addVideoClip, addAvatar } = useStore();
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('full');
  const [voice, setVoice] = useState('en-US-Standard');
  const [avatarStyle, setAvatarStyle] = useState('professional');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const activeResults = results.filter((r) => r.status === 'generating');
  const completedResults = results.filter((r) => r.status === 'ready');
  const errorResults = results.filter((r) => r.status === 'error');

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);

    const genId = uuid();
    const baseResult: GenerationResult = {
      id: genId, type, prompt: prompt.trim(), status: 'generating', progress: 0, createdAt: new Date().toISOString(),
    };
    setResults((prev) => [baseResult, ...prev]);

    try {
      const voiceOpt = VOICE_OPTIONS.find((v) => v.id === voice);
      const shouldAudio = type === 'full' || type === 'audio';
      const shouldVideo = type === 'full' || type === 'video';
      const shouldAvatar = type === 'full' || type === 'avatar';

      let audioBlob: Blob | undefined;
      let avatarSvg: string | undefined;
      let videoResult: { blob: Blob; thumbnail: string } | undefined;

      // Phase 1: Audio
      if (shouldAudio) {
        updateResult(genId, { progress: 20 });
        audioBlob = await generateTTS(prompt.trim(), voiceOpt?.lang || 'en-US');
      }

      // Phase 2: Avatar
      if (shouldAvatar) {
        updateResult(genId, { progress: 40 });
        avatarSvg = generateAvatarSVG(prompt.trim(), avatarStyle);
      }

      // Phase 3: Video
      if (shouldVideo) {
        updateResult(genId, { progress: 50 });
        videoResult = await generateVideo(prompt.trim(), type === 'full' ? 'cinematic' : styleFromType(type), (p) => {
          updateResult(genId, { progress: 50 + Math.round(p * 0.45) });
        });
      }

      // Build final result
      const audioUrl = audioBlob && audioBlob.size > 0 ? URL.createObjectURL(audioBlob) : undefined;
      const avatarUrl = avatarSvg ? URL.createObjectURL(new Blob([avatarSvg], { type: 'image/svg+xml' })) : undefined;
      const videoUrl = videoResult ? URL.createObjectURL(videoResult.blob) : undefined;

      updateResult(genId, {
        status: 'ready', progress: 100,
        audioBlob, audioUrl, avatarSvg, avatarUrl,
        videoBlob: videoResult?.blob, videoUrl, videoThumbnail: videoResult?.thumbnail,
        completedAt: new Date().toISOString(),
      });

      // Also add to project panels
      if (audioUrl && currentProject) addAudioFile({
        id: uuid(), projectId: currentProject.id, name: prompt.trim().slice(0, 50),
        url: audioUrl, duration: Math.max(3, Math.round(prompt.split(/\s+/).length / 150 * 60)),
        voice, status: 'ready', createdAt: new Date().toISOString(),
      });
      if (videoUrl && videoResult && currentProject) addVideoClip({
        id: uuid(), projectId: currentProject.id, name: prompt.trim().slice(0, 50),
        url: videoUrl, thumbnail: videoResult.thumbnail, duration: 6, status: 'ready', createdAt: new Date().toISOString(),
      });
      if (avatarUrl && currentProject) addAvatar({
        id: uuid(), projectId: currentProject.id, name: prompt.trim().slice(0, 50),
        imageUrl: avatarUrl, style: avatarStyle, status: 'ready', createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      updateResult(genId, { status: 'error', error: err.message || 'Generation failed' });
    }

    setGenerating(false);
    setPrompt('');
  }

  function updateResult(id: string, updates: Partial<GenerationResult>) {
    setResults((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r));
  }

  function styleFromType(t: string): string {
    if (t === 'audio') return 'presentation';
    if (t === 'avatar') return 'cartoon';
    return 'cinematic';
  }

  function handlePlayAudio(id: string, url: string) {
    if (playingId === id) {
      audioRefs.current.get(id)?.pause();
      setPlayingId(null);
      return;
    }
    if (playingId) audioRefs.current.get(playingId)?.pause();
    let audio = audioRefs.current.get(id);
    if (!audio) { audio = new Audio(url); audioRefs.current.set(id, audio); }
    audio.play();
    setPlayingId(id);
    audio.onended = () => setPlayingId(null);
  }

  function handlePlayVideo(id: string) {
    const video = videoRefs.current.get(id);
    if (!video) return;
    if (playingId === id) { video.pause(); setPlayingId(null); return; }
    if (playingId) { const prev = videoRefs.current.get(playingId); if (prev) prev.pause(); }
    video.play();
    setPlayingId(id);
    video.onended = () => setPlayingId(null);
  }

  function handleDownload(result: GenerationResult, format: string) {
    let blob: Blob | undefined;
    let filename = '';
    if (format === 'audio' && result.audioBlob) { blob = result.audioBlob; filename = `voice-${result.id.slice(0, 8)}.webm`; }
    else if (format === 'video' && result.videoBlob) { blob = result.videoBlob; filename = `video-${result.id.slice(0, 8)}.webm`; }
    else if (format === 'avatar' && result.avatarSvg) { blob = new Blob([result.avatarSvg], { type: 'image/svg+xml' }); filename = `avatar-${result.id.slice(0, 8)}.svg`; }
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="card-glow">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" /> AI Generation Studio
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">What to Generate</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {GENERATION_TYPES.map((gt) => (
                <button key={gt.id} onClick={() => setType(gt.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${type === gt.id ? 'border-primary-500 bg-primary-600/10 shadow-lg shadow-primary-500/10' : 'border-dark-400 bg-dark-700/50 hover:border-dark-300'}`}>
                  <gt.icon className={`w-5 h-5 mb-1 ${type === gt.id ? 'text-primary-400' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-white block">{gt.label}</span>
                  <span className="text-xs text-gray-500">{gt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {(type === 'full' || type === 'audio') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Voice</label>
              <select value={voice} onChange={(e) => setVoice(e.target.value)} className="input-field">
                {VOICE_OPTIONS.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          )}

          {(type === 'full' || type === 'avatar') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Avatar Style</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_STYLES.map((s) => (
                  <button key={s} onClick={() => setAvatarStyle(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${avatarStyle === s ? 'border-primary-500 bg-primary-600/15 text-primary-300' : 'border-dark-400 bg-dark-700/50 text-gray-400 hover:border-dark-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="input-field min-h-[120px] resize-y"
              placeholder={
                type === 'full' ? 'Describe your complete video... e.g. "A 60-second product demo with a professional female presenter explaining features"' :
                type === 'audio' ? 'Enter text for speech generation...' :
                type === 'video' ? 'Describe the video scene...' : 'Describe the avatar...'
              } />
          </div>

          <button onClick={handleGenerate} disabled={!prompt.trim() || generating}
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {generating ? 'Agents Working...' : 'Generate with AI Agents'}
          </button>
        </div>
      </div>

      {/* Active */}
      {activeResults.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3 h-3" /> In Progress ({activeResults.length})
          </h3>
          <div className="space-y-3">
            {activeResults.map((gen) => (
              <div key={gen.id} className="card border-primary-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                    <span className="text-sm font-medium text-white capitalize">{gen.type} Generation</span>
                  </div>
                  <span className="text-xs text-primary-400">{gen.progress}%</span>
                </div>
                <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
                    style={{ width: `${gen.progress}%` }} />
                </div>
                <p className="text-xs text-gray-500 truncate">{gen.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedResults.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed ({completedResults.length})
          </h3>
          <div className="space-y-4">
            {completedResults.map((gen) => (
              <div key={gen.id} className="card border-emerald-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white capitalize">{gen.type} Generation</span>
                    <p className="text-xs text-gray-500 truncate">{gen.prompt}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Audio preview */}
                  {gen.audioUrl && (
                    <div className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-2">
                      <button onClick={() => handlePlayAudio(gen.id, gen.audioUrl!)}
                        className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center">
                        {playingId === gen.id ? <Pause className="w-4 h-4 text-primary-400" /> : <Play className="w-4 h-4 text-primary-400" />}
                      </button>
                      <span className="text-xs text-gray-400">Voice</span>
                      <button onClick={() => handleDownload(gen, 'audio')} className="text-gray-500 hover:text-white">
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Video preview */}
                  {gen.videoUrl && (
                    <div className="relative rounded-lg overflow-hidden bg-dark-800" style={{ width: 200, height: 112 }}>
                      <video ref={(el) => { if (el) videoRefs.current.set(gen.id, el); }}
                        src={gen.videoUrl} className="w-full h-full object-cover" loop muted
                        onPlay={() => setPlayingId(gen.id)} onPause={() => { if (playingId === gen.id) setPlayingId(null); }} />
                      <button onClick={() => handlePlayVideo(gen.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
                        {playingId === gen.id ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                      </button>
                      <button onClick={() => handleDownload(gen, 'video')}
                        className="absolute bottom-1 right-1 bg-black/60 rounded p-1 text-white hover:bg-black/80">
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Avatar preview */}
                  {gen.avatarUrl && (
                    <div className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-2">
                      <img src={gen.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="text-xs text-gray-400">Avatar</span>
                      <button onClick={() => handleDownload(gen, 'avatar')} className="text-gray-500 hover:text-white">
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errorResults.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-red-400" /> Failed ({errorResults.length})
          </h3>
          <div className="space-y-3">
            {errorResults.map((gen) => (
              <div key={gen.id} className="card border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <span className="text-sm font-medium text-red-300 capitalize">{gen.type} — Failed</span>
                    <p className="text-xs text-gray-500">{gen.error}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && (
        <div className="card text-center py-12">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-300 mb-2">No generations yet</h4>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Enter a prompt above and click Generate. The AI agents will produce real audio, video, and avatars.
          </p>
        </div>
      )}
    </div>
  );
}
