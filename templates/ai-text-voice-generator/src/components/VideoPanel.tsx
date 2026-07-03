'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { Film, Download, Loader2, Play, Pause, Trash2, Maximize2, X, Layout, Type, AlertCircle, RefreshCw } from 'lucide-react';
import { VideoConfigPanel, VideoConfig, DEFAULT_VIDEO_CONFIG } from './ConfigControls';

// ─── PRESENTATION THEMES ──────────────────────────────────
const PRESENTATION_THEMES = [
  {
    id: 'youtube-dark', label: 'YouTube Dark', desc: 'Classic dark mode with accent colors',
    bg1: '#0f0f0f', bg2: '#1a1a2e', accent: '#ff4444', textColor: '#ffffff', subText: '#aaaaaa',
    titleFont: 'Arial', bodyFont: 'Arial', logo: '▶'
  },
  {
    id: 'youtube-light', label: 'YouTube Light', desc: 'Clean white background',
    bg1: '#ffffff', bg2: '#f5f5f5', accent: '#cc0000', textColor: '#0f0f0f', subText: '#606060',
    titleFont: 'Arial', bodyFont: 'Arial', logo: '▶'
  },
  {
    id: 'corporate', label: 'Corporate', desc: 'Professional brand colors',
    bg1: '#1a237e', bg2: '#283593', accent: '#448aff', textColor: '#ffffff', subText: '#90caf9',
    titleFont: 'Arial', bodyFont: 'Arial', logo: '◆'
  },
  {
    id: 'tech', label: 'Tech', desc: 'Modern dark with gradient',
    bg1: '#0d1117', bg2: '#161b22', accent: '#58a6ff', textColor: '#f0f6fc', subText: '#8b949e',
    titleFont: 'Arial', bodyFont: 'Arial', logo: '⚡'
  },
  {
    id: 'nature', label: 'Nature', desc: 'Earth tones, calm vibe',
    bg1: '#1b4332', bg2: '#2d6a4f', accent: '#95d5b2', textColor: '#ffffff', subText: '#b7e4c7',
    titleFont: 'Arial', bodyFont: 'Arial', logo: '🌿'
  },
  {
    id: 'sunset', label: 'Sunset', desc: 'Warm vibrant gradient',
    bg1: '#2d1b69', bg2: '#ff6b35', accent: '#ffd700', textColor: '#ffffff', subText: '#ffd700',
    titleFont: 'Arial', bodyFont: 'Arial', logo: '✦'
  },
];

// ─── PARSE SCRIPT INTO SLIDES ────────────────────────────
interface Slide {
  type: 'title' | 'content' | 'bullet' | 'quote' | 'cta';
  title: string;
  lines: string[];
  duration: number;
}

function parseScriptToSlides(script: string): Slide[] {
  const paragraphs = script.split('\n\n').filter((p) => p.trim().length > 0);
  if (paragraphs.length === 0) return [];
  const slides: Slide[] = [];

  // Title slide
  const firstPara = paragraphs[0].trim();
  const titleWords = firstPara.split(/\s+/);
  slides.push({ type: 'title', title: titleWords.slice(0, 8).join(' '), lines: [''], duration: 4 });

  // Content slides
  for (let i = 1; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    const words = p.split(/\s+/);
    const title = words.slice(0, Math.min(6, words.length)).join(' ');
    const bodyWords = words.slice(6);
    const lines: string[] = [];
    let currentLine = '';
    for (const word of bodyWords) {
      if ((currentLine + ' ' + word).length > 50 && currentLine) {
        lines.push(currentLine.trim()); currentLine = word;
      } else currentLine += (currentLine ? ' ' : '') + word;
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    const slideType = i === paragraphs.length - 1 ? 'cta' : words.length < 15 ? 'quote' : words.length > 30 ? 'bullet' : 'content';
    const readingTime = Math.max(3, Math.ceil(words.length / 2.5));
    slides.push({ type: slideType, title, lines, duration: readingTime });
  }

  // End screen
  slides.push({ type: 'cta', title: 'Thanks for Watching', lines: ['Like • Subscribe • Share'], duration: 4 });
  return slides;
}

// ─── GET BEST SUPPORTED MIME TYPE ────────────────────────
function getBestVideoMimeType(): string {
  const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return 'video/webm';
}

// ─── Generate speech WAV for audio sync ────────────────
function generateSpeechAudioBlob(text: string): Blob {
  const sr = 44100;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return new Blob([], { type: 'audio/wav' });
  const bp = 150;
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
  const wf = (o: number, str: string) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  wf(0, 'RIFF'); v.setUint32(4, 36 + ns * 2, true); wf(8, 'WAVE'); wf(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  wf(36, 'data'); v.setUint32(40, ns * 2, true);
  for (let i = 0; i < ns; i++) v.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, Math.round(s[i] * 32767))), true);
  return new Blob([buf], { type: 'audio/wav' });
}

// ─── GENERATE PRESENTATION VIDEO WITH AUDIO ─────────────
type VideoResult = { blob: Blob; thumbnail: string; duration: number; slideCount: number };

async function generatePresentationVideo(
  script: string, themeId: string, config: VideoConfig, onProgress: (p: number) => void,
  logoImg?: HTMLImageElement | null
): Promise<VideoResult> {
  const slides = parseScriptToSlides(script);
  if (slides.length === 0) throw new Error('No slides to generate');
  const theme = PRESENTATION_THEMES.find((t) => t.id === themeId) || PRESENTATION_THEMES[0];
  const [fw, fh] = config.resolution.split('x').map(Number);
  const W = fw || 1280, H = fh || 720;
  const fps = config.fps;
  const mimeType = getBestVideoMimeType();

  // Generate audio from script
  const audioBlob = generateSpeechAudioBlob(script);
  const audioBuf = await audioBlob.arrayBuffer();

  // Set up audio context and destination
  const audioCtx = new AudioContext();
  const audioDest = audioCtx.createMediaStreamDestination();
  let audioDuration = 0;
  let audioSource: AudioBufferSourceNode | null = null;

  try {
    const decodedAudio = await audioCtx.decodeAudioData(audioBuf);
    audioDuration = decodedAudio.duration;
    audioSource = audioCtx.createBufferSource();
    audioSource.buffer = decodedAudio;
    audioSource.connect(audioDest);
  } catch {
    // Audio decode failed — use estimated duration
    audioDuration = slides.reduce((sum, s) => sum + s.duration, 0);
  }

  // Use max of audio duration and slide-based duration
  const slideDuration = slides.reduce((sum, s) => sum + s.duration, 0);
  const totalDuration = Math.max(audioDuration, slideDuration);
  const totalFrames = Math.ceil(totalDuration * fps);
  const slideFrames = slides.map((s) => Math.round(s.duration * fps));

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false })!;

  // Combine video and audio streams
  const canvasStream = canvas.captureStream(fps);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks(),
  ]);

  const recorder = new MediaRecorder(combinedStream, { mimeType });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      audioCtx.close();
      if (chunks.length === 0) { reject(new Error('No data captured')); return; }
      const blob = new Blob(chunks, { type: mimeType });
      const thumb = document.createElement('canvas');
      thumb.width = 320; thumb.height = 180;
      thumb.getContext('2d')!.drawImage(canvas, 0, 0, 320, 180);
      resolve({ blob, thumbnail: thumb.toDataURL('image/jpeg', 0.7), duration: totalDuration, slideCount: slides.length });
    };
    recorder.onerror = () => { audioCtx.close(); reject(new Error('MediaRecorder error')); };

    try {
      recorder.start(100);
      // Start audio playback synced with recording
      if (audioSource) {
        audioSource.start(0);
      }
    } catch (e) {
      audioCtx.close();
      reject(new Error('Failed to start recorder: ' + (e as Error).message));
      return;
    }

    let frame = 0;

    const draw = () => {
      if (frame >= totalFrames) { recorder.stop(); return; }

      // Determine current slide
      let frameAccum = 0, slideIdx = 0, frameInSlide = 0;
      for (let i = 0; i < slideFrames.length; i++) {
        if (frame < frameAccum + slideFrames[i]) { slideIdx = i; frameInSlide = frame - frameAccum; break; }
        frameAccum += slideFrames[i];
        if (i === slideFrames.length - 1) { slideIdx = i; frameInSlide = frame - frameAccum; }
      }
      const slide = slides[slideIdx] || slides[0];
      const t = frame / totalFrames;
      const slideT = slide.duration > 0 ? frameInSlide / (slide.duration * fps) : 0;
      const easeIn = Math.min(1, slideT * 4);
      const fadeOut = slideT > 0.9 ? 1 - ((slideT - 0.9) / 0.1) : 1;

      // ── Background ──
      const bgGrad = ctx.createLinearGradient(0, 0, W * 0.3, H);
      bgGrad.addColorStop(0, theme.bg1); bgGrad.addColorStop(1, theme.bg2);
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

      // Subtle particles
      ctx.globalAlpha = 0.04; ctx.fillStyle = theme.textColor;
      for (let i = 0; i < 15; i++) {
        const px = (i * 97 + frame * 0.5) % W;
        const py = (i * 137 + Math.sin(frame * 0.02 + i) * 10) % H;
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Accent bar
      ctx.fillStyle = theme.accent; ctx.fillRect(0, 0, 6, H);

      // ── Brand Logo (top-right corner) ──
      if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        const logoMaxW = Math.round(W * 0.08); // 8% of video width
        const logoMaxH = Math.round(H * 0.06); // 6% of video height
        const logoScale = Math.min(logoMaxW / logoImg.naturalWidth, logoMaxH / logoImg.naturalHeight, 1);
        const logoW = Math.round(logoImg.naturalWidth * logoScale);
        const logoH = Math.round(logoImg.naturalHeight * logoScale);
        const logoX = W - logoW - 18;
        const logoY = 10;

        // Logo background pill
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.roundRect(logoX - 8, logoY - 4, logoW + 16, logoH + 8, 6);
        ctx.fill();

        // Logo image
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
        ctx.restore();
      }

      // Top bar
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, W, 46);
      ctx.fillStyle = theme.accent; ctx.font = `bold 20px ${theme.titleFont}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(theme.logo, 18, 24);
      ctx.fillStyle = theme.textColor; ctx.font = `13px ${theme.bodyFont}`;
      ctx.fillText(`Slide ${slideIdx + 1}/${slides.length}`, W - 115, 24);

      // ── Content ──
      const cx = 50, labelY = 80;
      ctx.save();
      ctx.globalAlpha = easeIn * fadeOut;

      if (slide.type === 'title') {
        ctx.textAlign = 'center';
        ctx.fillStyle = theme.accent; ctx.font = `bold 15px ${theme.bodyFont}`;
        ctx.fillText('PRESENTATION', W / 2, H * 0.32);
        ctx.fillStyle = theme.textColor; ctx.font = `bold ${Math.min(44, Math.round(W * 0.035))}px ${theme.titleFont}`;
        wrapText(ctx, slide.title, W / 2, H * 0.43, W * 0.8, 55, 'center');
        ctx.fillStyle = theme.subText; ctx.font = `${Math.min(16, Math.round(W * 0.013))}px ${theme.bodyFont}`;
        ctx.fillText('AI Generated Video', W / 2, H * 0.56);
        ctx.strokeStyle = theme.accent; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(W / 2 - 35, H * 0.60); ctx.lineTo(W / 2 + 35, H * 0.60); ctx.stroke();
      } else if (slide.type === 'bullet') {
        ctx.fillStyle = theme.accent; ctx.font = `bold 13px ${theme.bodyFont}`; ctx.textAlign = 'left';
        ctx.fillText('▸ TOPICS', cx, labelY);
        ctx.fillStyle = theme.textColor; ctx.font = `bold ${Math.min(26, Math.round(W * 0.021))}px ${theme.titleFont}`;
        ctx.fillText(slide.title, cx, labelY + 28);
        let ly = labelY + 50;
        const show = Math.floor(easeIn * slide.lines.length);
        for (let i = 0; i < Math.min(show, slide.lines.length); i++) {
          ctx.globalAlpha = Math.min(1, Math.max(0, (easeIn * slide.lines.length - i) * 2)) * fadeOut;
          ctx.fillStyle = theme.accent; ctx.beginPath(); ctx.arc(cx + 6, ly + 5, 4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = theme.textColor; ctx.font = `${Math.min(18, Math.round(W * 0.015))}px ${theme.bodyFont}`;
          ctx.fillText(slide.lines[i], cx + 20, ly + 7); ly += 30;
        }
      } else if (slide.type === 'quote') {
        ctx.textAlign = 'center';
        ctx.fillStyle = theme.accent; ctx.font = `42px serif`; ctx.fillText('"', W / 2, H * 0.33);
        ctx.fillStyle = theme.textColor; ctx.font = `italic ${Math.min(26, Math.round(W * 0.021))}px ${theme.bodyFont}`;
        wrapText(ctx, slide.title, W / 2, H * 0.40, W * 0.7, 34, 'center');
        if (slide.lines[0]) { ctx.fillStyle = theme.subText; ctx.font = `${Math.min(16, Math.round(W * 0.013))}px ${theme.bodyFont}`; ctx.fillText(slide.lines[0], W / 2, H * 0.53); }
      } else if (slide.type === 'cta') {
        ctx.textAlign = 'center';
        ctx.fillStyle = theme.accent; ctx.font = `bold ${Math.min(18, Math.round(W * 0.015))}px ${theme.bodyFont}`;
        ctx.fillText('◼ END SCREEN', W / 2, H * 0.28);
        ctx.fillStyle = theme.textColor; ctx.font = `bold ${Math.min(36, Math.round(W * 0.029))}px ${theme.titleFont}`;
        ctx.fillText(slide.title, W / 2, H * 0.40);
        if (slide.lines[0]) { ctx.fillStyle = theme.accent; ctx.font = `${Math.min(22, Math.round(W * 0.018))}px ${theme.bodyFont}`; ctx.fillText(slide.lines[0], W / 2, H * 0.50); }
        ctx.strokeStyle = theme.accent; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
        ctx.strokeRect(W * 0.15, H * 0.56, W * 0.7, H * 0.12); ctx.setLineDash([]);
        ctx.fillStyle = theme.subText; ctx.font = `${Math.min(14, Math.round(W * 0.012))}px ${theme.bodyFont}`;
        ctx.fillText('Subscribe for more content', W / 2, H * 0.64);
      } else {
        ctx.fillStyle = theme.accent; ctx.font = `bold 13px ${theme.bodyFont}`; ctx.textAlign = 'left';
        ctx.fillText('▸ CONTENT', cx, labelY);
        ctx.fillStyle = theme.textColor; ctx.font = `bold ${Math.min(28, Math.round(W * 0.022))}px ${theme.titleFont}`;
        ctx.fillText(slide.title, cx, labelY + 28);
        let ly = labelY + 50;
        const show = Math.floor(easeIn * slide.lines.length);
        for (let i = 0; i < Math.min(show, slide.lines.length); i++) {
          ctx.globalAlpha = Math.min(1, Math.max(0, (easeIn * slide.lines.length - i) * 2)) * fadeOut;
          ctx.fillStyle = theme.textColor; ctx.font = `${Math.min(18, Math.round(W * 0.015))}px ${theme.bodyFont}`;
          ctx.fillText(slide.lines[i], cx, ly); ly += 28;
        }
      }
      ctx.restore();

      // ── Bottom progress bar ──
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, H - 4, W, 4);
      for (let i = 0; i < slides.length; i++) {
        const x = (i / slides.length) * W, segW = W / slides.length;
        ctx.fillStyle = i <= slideIdx ? (i === slideIdx ? theme.accent : 'rgba(255,255,255,0.3)') : 'rgba(255,255,255,0.08)';
        ctx.fillRect(x, H - 4, segW - 1, 4);
      }

      // ── Bottom bar ──
      const mins = Math.floor(t * totalDuration / 60), secs = Math.floor((t * totalDuration) % 60);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, H - 28, W, 24);
      ctx.fillStyle = theme.subText; ctx.font = `11px ${theme.bodyFont}`; ctx.textAlign = 'left';
      ctx.fillText(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`, 12, H - 10);
      ctx.textAlign = 'right';
      ctx.fillText(`${String(Math.floor(totalDuration / 60)).padStart(2, '0')}:${String(Math.floor(totalDuration % 60)).padStart(2, '0')}`, W - 12, H - 10);
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.subText;
      ctx.fillText(slide.title.slice(0, 35), W / 2, H - 10);

      frame++;
      onProgress(Math.round(t * 100));
      requestAnimationFrame(draw);
    };
    draw();
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, align: CanvasTextAlign) {
  const words = text.split(' '); let line = '', lineY = y;
  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    if (ctx.measureText(testLine).width > maxWidth && line) { ctx.textAlign = align; ctx.fillText(line, x, lineY); line = word; lineY += lineHeight; }
    else line = testLine;
  }
  ctx.textAlign = align; ctx.fillText(line, x, lineY);
}

// ─── SVG Fallback Generator (if Canvas fails) ────────────
function generateFallbackVideo(script: string, themeId: string): VideoResult {
  const theme = PRESENTATION_THEMES.find((t) => t.id === themeId) || PRESENTATION_THEMES[0];
  const slides = parseScriptToSlides(script);
  const duration = slides.reduce((s, sl) => s + sl.duration, 0);

  // Build an SVG with colored frames
  const svgParts: string[] = [];
  for (let i = 0; i < slides.length; i++) {
    const sl = slides[i];
    const colors = {
      bg1: theme.bg1, bg2: theme.bg2, accent: theme.accent,
      text: theme.textColor, sub: theme.subText
    };
    const typeLabel = sl.type === 'title' ? 'PRESENTATION' : sl.type === 'cta' ? 'END SCREEN' : 'SLIDE ' + (i + 1);

    svgParts.push(`
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs><linearGradient id="bg${i}" x1="0%" y1="0%" x2="30%" y2="100%">
    <stop offset="0%" stop-color="${colors.bg1}"/><stop offset="100%" stop-color="${colors.bg2}"/>
  </linearGradient></defs>
  <rect width="1280" height="720" fill="url(#bg${i})"/>
  <rect x="0" y="0" width="6" height="720" fill="${colors.accent}"/>
  <rect y="0" width="1280" height="48" fill="rgba(0,0,0,0.4)"/>
  <text x="18" y="32" fill="${colors.accent}" font-size="20" font-weight="bold">${theme.logo}</text>
  <text x="1165" y="32" fill="${colors.text}" font-size="14">Slide ${i + 1}/${slides.length}</text>
  <text x="640" y="${sl.type === 'title' ? '260' : '200'}" fill="${sl.type === 'title' ? colors.accent : colors.accent}" font-size="${sl.type === 'title' ? '18' : '16'}" text-anchor="middle" font-weight="bold">${sl.type === 'title' ? typeLabel : '▸ ' + typeLabel}</text>
  <text x="640" y="${sl.type === 'title' ? '320' : '240'}" fill="${colors.text}" font-size="${sl.type === 'title' ? '44' : '28'}" text-anchor="middle" font-weight="bold">${sl.title}</text>
  ${sl.lines.slice(0, 3).map((line, li) => `
    <text x="${sl.type === 'title' ? '640' : '80'}" y="${(sl.type === 'title' ? 380 : 280) + li * 32}" fill="${colors.sub}" font-size="16" text-anchor="${sl.type === 'title' ? 'middle' : 'start'}">${sl.type === 'bullet' ? '• ' : ''}${line}</text>
  `).join('')}
  <rect y="716" width="1280" height="4" fill="rgba(0,0,0,0.4)"/>
  <rect x="${(i / slides.length) * 1280}" y="716" width="${1280 / slides.length - 1}" height="4" fill="${colors.accent}"/>
  <rect y="694" width="1280" height="22" fill="rgba(0,0,0,0.3)"/>
  <text x="12" y="708" fill="${colors.sub}" font-size="11">00:${String(i * sl.duration).padStart(2, '0')}</text>
  <text x="1268" y="708" fill="${colors.sub}" font-size="11" text-anchor="end">00:${String(duration).padStart(2, '0')}</text>
</svg>`);
  }

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  ${slides.map((sl, i) => `
  <g transform="translate(${i * 1280}, 0)">${svgParts[i]}</g>`).join('')}
</svg>`;

  const blob = new Blob([fullSvg], { type: 'image/svg+xml' });
  const thumbCanvas = document.createElement('canvas'); thumbCanvas.width = 320; thumbCanvas.height = 180;
  const tc = thumbCanvas.getContext('2d')!;
  tc.fillStyle = theme.bg1; tc.fillRect(0, 0, 320, 180);
  tc.fillStyle = theme.accent; tc.font = 'bold 14px Arial'; tc.textAlign = 'center';
  tc.fillText(`${slides.length} slides · ~${duration}s`, 160, 90);

  return { blob, thumbnail: thumbCanvas.toDataURL('image/jpeg', 0.7), duration, slideCount: slides.length };
}

// ─── VIDEO PLAYER MODAL ──────────────────────────────────
function VideoModal({ video, onClose }: { video: any; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { videoRef.current?.play().catch(() => {}); }, []);
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/60 hover:text-white"><X className="w-6 h-6" /></button>
        <video ref={videoRef} src={video.blobUrl} className="w-full rounded-lg shadow-2xl" controls />
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-gray-400">{video.name}</span>
          <span className="badge-blue text-xs">{video.theme}</span>
          <span className="badge-green text-xs">{video.duration}s · {video.slides} slides</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────
// ─── Load logo image from URL or file data ────────────────
function loadLogoImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load logo image'));
    img.src = src;
  });
}

export default function VideoPanel() {
  const [script, setScript] = useState('');
  const [themeId, setThemeId] = useState('youtube-dark');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videos, setVideos] = useState<any[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [modalVideo, setModalVideo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({ ...DEFAULT_VIDEO_CONFIG });
  const [brandLogo, setBrandLogo] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const previewSlides = script.trim() ? parseScriptToSlides(script) : [];
  const estimatedDuration = previewSlides.reduce((sum, s) => sum + s.duration, 0);
  const totalFrames = estimatedDuration * videoConfig.fps;

  async function handleGenerate() {
    if (!script.trim()) return;
    setGenerating(true); setProgress(0); setError(null);

    try {
      // Load brand logo if provided
      let logoImage: HTMLImageElement | undefined;
      if (brandLogo) {
        logoImage = await loadLogoImage(brandLogo);
      }

      // First try canvas-based generation
      let result: VideoResult;
      try {
        result = await generatePresentationVideo(script, themeId, videoConfig, setProgress, logoImage);
      } catch (canvasErr) {
        // Fallback to SVG-based generation
        console.warn('Canvas video failed, using SVG fallback:', canvasErr);
        result = generateFallbackVideo(script, themeId);
      }

      if (!result.blob || result.blob.size === 0) throw new Error('Generated video is empty');

      const blobUrl = URL.createObjectURL(result.blob);
      const clip = {
        id: uuid(), name: script.split('\n')[0]?.slice(0, 50) || 'Presentation',
        script: script.slice(0, 100), theme: themeId,
        blobUrl, thumbnailUrl: result.thumbnail, duration: result.duration,
        slides: result.slideCount, status: 'ready' as const,
        createdAt: new Date().toISOString(),
      };
      setVideos((prev) => [clip, ...prev]);
      setScript('');
    } catch (err) {
      const msg = (err as Error).message || 'Generation failed';
      setError(msg);
      console.error('Presentation generation failed:', err);
    }

    setGenerating(false); setProgress(0);
  }

  function handlePlay(id: string) {
    const v = videoRefs.current.get(id);
    if (!v) return;
    if (playingId === id) { v.pause(); setPlayingId(null); return; }
    if (playingId) videoRefs.current.get(playingId)?.pause();
    v.play(); setPlayingId(id);
  }

  function handleDownload(video: any) {
    const a = document.createElement('a');
    a.href = video.blobUrl; a.download = `presentation-${video.id.slice(0, 8)}.webm`; a.click();
  }

  function handleDelete(id: string) {
    const v = videos.find((vv) => vv.id === id);
    if (v?.blobUrl) URL.revokeObjectURL(v.blobUrl);
    setVideos((prev) => prev.filter((vv) => vv.id !== id));
    if (playingId === id) setPlayingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Film className="w-5 h-5 text-primary-400" /> YouTube Presentation Generator
        </h3>
        <div className="space-y-4">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Layout className="w-4 h-4 text-gray-500" /> Theme
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PRESENTATION_THEMES.map((t) => (
                <button key={t.id} onClick={() => setThemeId(t.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${themeId === t.id ? 'border-primary-500 bg-primary-600/10 shadow-lg shadow-primary-500/10' : 'border-dark-400 bg-dark-700/50 hover:border-dark-300'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{ background: `linear-gradient(135deg, ${t.bg1}, ${t.bg2})`, color: t.textColor }}>{t.logo}</div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white">{t.label}</span>
                      <p className="text-[10px] text-gray-500">{t.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[t.accent, t.bg1, t.bg2].map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Logo */}
          <details className="group border border-dark-500 rounded-lg overflow-hidden">
            <summary className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors p-3 hover:bg-dark-700/50 [&::-webkit-details-marker]:hidden">
              <svg className="w-4 h-4 text-gray-500 group-open:text-primary-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              Brand Logo
              <span className="ml-auto text-[10px] text-gray-600">{logoPreview ? '✓ Added' : 'Optional'}</span>
            </summary>
            <div className="px-3 pb-3 space-y-2">
              {logoPreview && (
                <div className="flex items-center gap-3 bg-dark-800 rounded-lg p-2 border border-dark-500">
                  <img src={logoPreview} alt="Brand logo" className="w-10 h-10 object-contain rounded" />
                  <span className="text-xs text-gray-400 flex-1">Logo will appear in top-right corner</span>
                  <button onClick={() => { setBrandLogo(''); setLogoPreview(null); }}
                    className="text-gray-500 hover:text-red-400 text-xs">Remove</button>
                </div>
              )}
              <div className="flex gap-2">
                <input type="text" value={brandLogo} onChange={(e) => {
                  setBrandLogo(e.target.value);
                  if (e.target.value) setLogoPreview(e.target.value);
                }}
                  className="input-field flex-1 text-sm" placeholder="Paste image URL..." />
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setBrandLogo(url);
                      setLogoPreview(url);
                    }
                  }} />
                <button onClick={() => logoInputRef.current?.click()}
                  className="btn-secondary text-sm px-3">Upload</button>
              </div>
            </div>
          </details>

          {/* Script Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-500" /> Script
            </label>
            <textarea value={script} onChange={(e) => setScript(e.target.value)}
              className="input-field min-h-[180px] resize-y font-mono text-sm leading-relaxed"
              placeholder={'Write your script. Each paragraph becomes a slide.\n\nExample:\nWelcome to AI video generation.\n\nFirst, let us explore the key concepts.\n\nBenefits include speed and scale.\n\nThanks for watching!'} />
          </div>

          {/* Slide Preview */}
          {previewSlides.length > 0 && (
            <div className="bg-dark-800/50 rounded-lg border border-dark-500 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Layout className="w-3 h-3" /> {previewSlides.length} slides · ~{estimatedDuration}s
                </span>
                <span className="text-xs text-gray-500">{totalFrames} frames @ {videoConfig.fps}fps</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {previewSlides.map((slide, idx) => (
                  <div key={idx} className="flex-shrink-0 w-28 h-20 rounded-lg border border-dark-500 bg-dark-700 p-1.5 overflow-hidden">
                    <span className="text-[10px] text-primary-400 font-medium block">
                      {idx === 0 ? 'Title' : slide.type === 'cta' ? 'CTA' : `Slide ${idx + 1}`}
                    </span>
                    <p className="text-[9px] text-gray-400 mt-0.5 leading-tight line-clamp-3">{slide.title}</p>
                    <span className="text-[8px] text-gray-600 block mt-0.5">{slide.duration}s</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-300 font-medium">Generation failed</p>
                <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
                <button onClick={() => setError(null)} className="text-xs text-red-400 hover:text-red-300 mt-2 underline">Dismiss</button>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {generating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  Rendering {estimatedDuration}s ({totalFrames} frames @ {videoConfig.fps}fps)...
                </span>
                <span className="text-primary-400">{progress}%</span>
              </div>
              <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={!script.trim() || generating}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Rendering... ({progress}%)</>
            ) : (
              <><Film className="w-5 h-5" /> Generate YouTube Presentation</>
            )}
          </button>
        </div>
      </div>

      {/* Video Configuration */}
      <VideoConfigPanel config={videoConfig} onChange={setVideoConfig} />

      {/* Generated Videos */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          Presentations ({videos.length})
        </h3>
        {videos.length === 0 ? (
          <div className="card text-center py-10">
            <Film className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No presentations yet. Write a script above and generate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="card-glow group">
                <div className="aspect-video bg-dark-800 rounded-lg mb-3 relative overflow-hidden cursor-pointer"
                  onClick={() => handlePlay(video.id)}>
                  <video ref={(el) => { if (el) videoRefs.current.set(video.id, el); }}
                    src={video.blobUrl} className="w-full h-full object-cover" loop muted
                    onPlay={() => setPlayingId(video.id)} onPause={() => { if (playingId === video.id) setPlayingId(null); }} />
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity ${playingId === video.id ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      {playingId === video.id ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-mono">{video.duration}s</div>
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded capitalize">{video.theme.replace('-', ' ')}</div>
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">{video.slides} slides</div>
                  <button onClick={(e) => { e.stopPropagation(); setModalVideo(video); }}
                    className="absolute bottom-2 left-2 bg-black/60 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
                <h4 className="text-sm font-medium text-white truncate">{video.name}</h4>
                <p className="text-xs text-gray-500 truncate mt-0.5">{video.script}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="badge-green">Ready</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDownload(video)} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download
                    </button>
                    <button onClick={() => handleDelete(video.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalVideo && <VideoModal video={modalVideo} onClose={() => setModalVideo(null)} />}
    </div>
  );
}
