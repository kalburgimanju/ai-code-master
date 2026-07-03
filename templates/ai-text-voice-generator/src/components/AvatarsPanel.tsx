'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { v4 as uuid } from 'uuid';
import { User, Download, Loader2, Eye, X, Trash2, RefreshCw, Star, Sparkles } from 'lucide-react';

const AVATAR_STYLES = [
  { id: 'professional', label: 'Professional', emoji: '👨‍💼' },
  { id: 'casual', label: 'Casual', emoji: '🧑‍🎤' },
  { id: 'anime', label: 'Anime', emoji: '🎌' },
  { id: 'realistic', label: 'Realistic', emoji: '🧑' },
  { id: 'cartoon', label: 'Cartoon', emoji: '🎨' },
  { id: '3d-render', label: '3D Render', emoji: '🧊' },
];

// ─── PRESET AVATARS ──────────────────────────────────────
const AVATAR_PRESETS = [
  // Male presets
  {
    id: 'male-professional', gender: 'male', name: 'James', style: 'professional',
    prompt: 'A professional businessman with short brown hair, blue eyes, light skin, wearing a navy blue suit with a red tie, serious expression, neat appearance',
    emoji: '👨‍💼'
  },
  {
    id: 'male-casual', gender: 'male', name: 'Alex', style: 'casual',
    prompt: 'A casual guy with messy black hair, hazel eyes, tan skin, wearing a gray hoodie, relaxed smile, friendly vibe',
    emoji: '🧑‍🎤'
  },
  {
    id: 'male-voiceover', gender: 'male', name: 'Marcus', style: 'professional',
    prompt: 'A calm male voiceover artist with short grey hair, green eyes, medium skin, wearing a polo shirt, warm smile, approachable look',
    emoji: '🎙️'
  },
  {
    id: 'male-tech', gender: 'male', name: 'Ethan', style: 'tech',
    prompt: 'A young tech professional with short blonde hair, wearing glasses, light skin, blue eyes, wearing a dark t-shirt with a blazer, slight smile, smart look',
    emoji: '🧑‍💻'
  },
  // Female presets
  {
    id: 'female-professional', gender: 'female', name: 'Sarah', style: 'professional',
    prompt: 'A professional businesswoman with long brown hair, light skin, green eyes, wearing a blue blazer and white blouse, confident smile, executive look',
    emoji: '👩‍💼'
  },
  {
    id: 'female-casual', gender: 'female', name: 'Emma', style: 'casual',
    prompt: 'A casual young woman with long blonde hair, fair skin, blue eyes, wearing a pink t-shirt, warm friendly smile, relaxed posture',
    emoji: '👩‍🎤'
  },
  {
    id: 'female-presenter', gender: 'female', name: 'Maya', style: 'realistic',
    prompt: 'A female news presenter with shoulder-length black hair, medium-dark skin, brown eyes, wearing a red dress, professional expression, elegant look, with earrings',
    emoji: '📺'
  },
  {
    id: 'female-creative', gender: 'female', name: 'Luna', style: 'cartoon',
    prompt: 'A creative cartoon-style woman with short purple hair, green eyes, fair skin, wearing a colorful hoodie, big happy smile, artistic vibe, with glasses',
    emoji: '🎨'
  },
];

function parsePromptFeatures(prompt: string) {
  const lower = prompt.toLowerCase();
  return {
    hairColor: lower.includes('blonde') ? '#F4D03F' :
      lower.includes('brown') ? '#8B4513' :
        lower.includes('red') || lower.includes('ginger') ? '#C0392B' :
          lower.includes('black') ? '#1C1C1C' :
            lower.includes('grey') || lower.includes('gray') ? '#808080' :
              lower.includes('pink') ? '#FF69B4' :
                lower.includes('purple') ? '#9B59B6' :
                  lower.includes('blue') ? '#3498DB' : '#5D4037',
    skinTone: lower.includes('dark') ? '#8D5524' :
      lower.includes('medium') ? '#C68642' :
        lower.includes('light') || lower.includes('pale') || lower.includes('fair') ? '#FDDBB5' :
          lower.includes('tan') ? '#C68642' : '#E0AC69',
    eyeColor: lower.includes('blue') ? '#2E86C1' :
      lower.includes('green') ? '#27AE60' :
        lower.includes('hazel') ? '#D4AC0D' :
          lower.includes('brown') || lower.includes('dark') ? '#5D4037' :
            lower.includes('grey') || lower.includes('gray') ? '#7F8C8D' : '#5D4037',
    gender: lower.includes('female') || lower.includes('woman') || lower.includes('girl') || lower.includes('businesswoman') || lower.includes('lady') ? 'female' : 'male',
    accessories: [
      lower.includes('glasses') || lower.includes('spectacles') ? 'glasses' : null,
      lower.includes('hat') || lower.includes('cap') ? 'hat' : null,
      lower.includes('earring') || lower.includes('earrings') ? 'earrings' : null,
      lower.includes('tie') ? 'tie' : null,
    ].filter(Boolean) as string[],
    clothing: lower.includes('blazer') || lower.includes('suit') ? 'blazer' :
      lower.includes('dress') ? 'dress' :
        lower.includes('hoodie') ? 'hoodie' :
          lower.includes('uniform') ? 'uniform' : 'shirt',
    expression: lower.includes('smile') || lower.includes('happy') || lower.includes('friendly') ? 'smile' :
      lower.includes('serious') ? 'serious' :
        lower.includes('laugh') ? 'laugh' : 'neutral',
  };
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xFF) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0xFF) * (1 - amount)));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function generateAvatarSVG(prompt: string, style: string): string {
  const f = parsePromptFeatures(prompt);
  const isFemale = f.gender === 'female';

  const hairPaths: Record<string, string> = {
    male_short: `<path d="M120 95 Q150 60 180 70 Q210 60 240 80 Q260 95 260 120 L260 100 Q250 70 200 55 Q150 70 120 100 Z" fill="${f.hairColor}"/>`,
    female_long: `<path d="M110 100 Q100 80 120 60 Q150 40 200 45 Q250 40 280 60 Q300 80 290 100 L300 180 Q295 220 280 250 Q270 230 265 180 L265 120 Q200 90 135 120 L135 180 Q130 230 120 250 Q105 220 100 180 Z" fill="${f.hairColor}"/>
      <path d="M120 60 Q150 40 200 45 Q250 40 280 60 Q260 50 200 48 Q140 50 120 60 Z" fill="${f.hairColor}" opacity="0.8"/>`,
    female_short: `<path d="M115 95 Q105 75 125 55 Q155 38 200 42 Q245 38 275 55 Q295 75 285 95 L290 130 Q200 100 110 130 Z" fill="${f.hairColor}"/>`,
  };
  const hairType = isFemale ? 'female_long' : 'male_short';

  const expressionPath: Record<string, string> = {
    smile: `<path d="M175 175 Q200 195 225 175" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    serious: `<line x1="178" y1="180" x2="222" y2="180" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>`,
    laugh: `<path d="M170 172 Q200 200 230 172" stroke="#333" stroke-width="2.5" fill="#FFF" stroke-linecap="round"/>`,
    neutral: `<path d="M180 178 Q200 185 220 178" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  };

  const clothingMap: Record<string, string> = {
    blazer: `<path d="M120 270 L140 240 L170 235 L200 230 L230 235 L260 240 L280 270 L300 380 L100 380 Z" fill="#2C3E50"/>
      <path d="M170 235 L185 380 L200 250 L215 380 L230 235" fill="#34495E" opacity="0.6"/>`,
    dress: `<path d="M130 250 Q165 235 200 232 Q235 235 270 250 L290 380 Q200 400 110 380 Z" fill="#E74C3C"/>`,
    hoodie: `<path d="M115 270 Q130 240 165 232 Q200 228 235 232 Q270 240 285 270 L300 380 L100 380 Z" fill="#7F8C8D"/>`,
    shirt: `<path d="M120 270 L140 240 L170 235 L200 230 L230 235 L260 240 L280 270 L300 380 L100 380 Z" fill="#ECF0F1"/>
      <line x1="200" y1="232" x2="200" y2="320" stroke="#BDC3C7" stroke-width="1"/>`,
  };

  const accessoryPaths: Record<string, string> = {
    glasses: `<circle cx="178" cy="148" r="16" fill="none" stroke="#333" stroke-width="2.5"/>
      <circle cx="222" cy="148" r="16" fill="none" stroke="#333" stroke-width="2.5"/>
      <path d="M194 148 L206 148" stroke="#333" stroke-width="2.5"/>
      <path d="M162 148 L148 142" stroke="#333" stroke-width="2"/>
      <path d="M238 148 L252 142" stroke="#333" stroke-width="2"/>`,
    hat: `<ellipse cx="200" cy="75" rx="65" ry="12" fill="#2C3E50"/>
      <path d="M150 75 Q155 30 200 25 Q245 30 250 75" fill="#34495E"/>`,
    earrings: `<circle cx="138" cy="165" r="4" fill="#F1C40F"/>
      <circle cx="138" cy="175" r="3" fill="#F1C40F"/>
      <circle cx="262" cy="165" r="4" fill="#F1C40F"/>
      <circle cx="262" cy="175" r="3" fill="#F1C40F"/>`,
    tie: `<path d="M195 235 L200 290 L205 235" fill="#E74C3C"/>`,
  };

  const bgGradients: Record<string, [string, string]> = {
    professional: ['#667eea', '#764ba2'], casual: ['#f093fb', '#f5576c'],
    anime: ['#4facfe', '#00f2fe'], realistic: ['#43e97b', '#38f9d7'],
    cartoon: ['#fa709a', '#fee140'], '3d-render': ['#a18cd1', '#fbc2eb'],
  };
  const [bg1, bg2] = bgGradients[style] || bgGradients.professional;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="skin" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${f.skinTone}"/><stop offset="100%" stop-color="${darkenColor(f.skinTone, 0.15)}"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" rx="40" fill="url(#bg)"/>
  ${clothingMap[f.clothing] || clothingMap.shirt}
  <rect x="185" y="210" width="30" height="30" rx="5" fill="${f.skinTone}"/>
  <ellipse cx="200" cy="155" rx="58" ry="65" fill="url(#skin)"/>
  <ellipse cx="142" cy="155" rx="10" ry="14" fill="${f.skinTone}"/>
  <ellipse cx="258" cy="155" rx="10" ry="14" fill="${f.skinTone}"/>
  ${hairPaths[hairType]}
  <ellipse cx="178" cy="148" rx="10" ry="8" fill="white"/>
  <ellipse cx="222" cy="148" rx="10" ry="8" fill="white"/>
  <circle cx="180" cy="148" r="5" fill="${f.eyeColor}"/>
  <circle cx="224" cy="148" r="5" fill="${f.eyeColor}"/>
  <circle cx="181" cy="147" r="2" fill="white"/>
  <circle cx="225" cy="147" r="2" fill="white"/>
  <path d="M165 133 Q178 128 191 133" stroke="${darkenColor(f.hairColor, 0.3)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M209 133 Q222 128 235 133" stroke="${darkenColor(f.hairColor, 0.3)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M197 158 Q200 168 203 158" stroke="${darkenColor(f.skinTone, 0.2)}" stroke-width="1.5" fill="none"/>
  ${expressionPath[f.expression] || expressionPath.neutral}
  ${f.accessories.map((a) => accessoryPaths[a] || '').join('\n')}
</svg>`;
}

// ─── Preview Modal ────────────────────────────────────────
function AvatarPreviewModal({ avatar, onClose, onDownload, onDownloadPNG }: {
  avatar: any; onClose: () => void; onDownload: () => void; onDownloadPNG: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl border border-dark-500 max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Avatar Preview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex justify-center mb-6">
          <div className="w-64 h-64 rounded-2xl overflow-hidden border-2 border-primary-500/30 shadow-lg shadow-primary-500/10">
            <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="text-center mb-4">
          <p className="text-white font-medium">{avatar.name}</p>
          <span className="badge-blue text-xs mt-1">{avatar.style}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={onDownload} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download SVG
          </button>
          <button onClick={onDownloadPNG} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AvatarsPanel() {
  const { currentProject, addAvatar } = useStore();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('professional');
  const [generating, setGenerating] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<any>(null);

  const avatars = currentProject?.avatars || [];

  async function handleGenerate(customPrompt?: string, customStyle?: string) {
    const p = customPrompt || prompt;
    const s = customStyle || style;
    if (!p.trim()) return;
    setGenerating(true);

    await new Promise((r) => setTimeout(r, 800));
    const svgContent = generateAvatarSVG(p, s);
    const imageUrl = URL.createObjectURL(new Blob([svgContent], { type: 'image/svg+xml' }));

    addAvatar({
      id: uuid(), projectId: currentProject?.id || '',
      name: (customPrompt ? p.split(',')[0] : p.slice(0, 50)),
      imageUrl, style: s, status: 'ready',
      createdAt: new Date().toISOString(),
    });

    if (!customPrompt) setPrompt('');
    setGenerating(false);
  }

  function handleDownload(avatar: any) {
    const a = document.createElement('a');
    a.href = avatar.imageUrl;
    a.download = `avatar-${avatar.style}-${avatar.id.slice(0, 8)}.svg`;
    a.click();
  }

  function handleDownloadPNG(avatar: any) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 512, 512);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `avatar-${avatar.style}-${avatar.id.slice(0, 8)}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = avatar.imageUrl;
  }

  return (
    <div className="space-y-6">
      {/* ─── Preset Avatars ─────────────────────────── */}
      <div className="card-glow border-primary-500/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" /> Avatar Presets
        </h3>
        <div className="mb-3">
          <span className="text-xs text-gray-500">Click any preset to instantly generate and preview</span>
        </div>

        {/* Men */}
        <div className="mb-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
            <span className="text-base">👨</span> Men
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AVATAR_PRESETS.filter((p) => p.gender === 'male').map((preset) => (
              <button key={preset.id} onClick={() => handleGenerate(preset.prompt, preset.style)}
                className="p-2.5 rounded-lg border border-dark-400 bg-dark-700/50 hover:border-primary-500/50 hover:bg-dark-700 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{preset.emoji}</span>
                  <div>
                    <span className="text-sm font-medium text-white block">{preset.name}</span>
                    <span className="text-[10px] text-gray-500 capitalize">{preset.style}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 line-clamp-2 leading-tight">{preset.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Women */}
        <div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
            <span className="text-base">👩</span> Women
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AVATAR_PRESETS.filter((p) => p.gender === 'female').map((preset) => (
              <button key={preset.id} onClick={() => handleGenerate(preset.prompt, preset.style)}
                className="p-2.5 rounded-lg border border-dark-400 bg-dark-700/50 hover:border-primary-500/50 hover:bg-dark-700 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{preset.emoji}</span>
                  <div>
                    <span className="text-sm font-medium text-white block">{preset.name}</span>
                    <span className="text-[10px] text-gray-500 capitalize">{preset.style}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 line-clamp-2 leading-tight">{preset.prompt}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Custom Avatar Generator ────────────────── */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-400" /> Custom Avatar
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {AVATAR_STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${style === s.id ? 'border-primary-500 bg-primary-600/10' : 'border-dark-400 bg-dark-700/50 hover:border-dark-300'}`}>
                  <span className="text-2xl block">{s.emoji}</span>
                  <span className="text-xs text-gray-300 mt-1 block">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
            className="input-field min-h-[80px] resize-y"
            placeholder="Describe the avatar... e.g. 'A friendly female presenter with brown hair, blue eyes, wearing a blue blazer, smiling, with glasses'" />
          <button onClick={() => handleGenerate()} disabled={!prompt.trim() || generating}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
            {generating ? 'Generating Avatar...' : 'Generate Custom Avatar'}
          </button>
        </div>
      </div>

      {/* ─── Gallery ────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3 h-3" /> Avatars ({avatars.length})
        </h3>
        {avatars.length === 0 ? (
          <div className="card text-center py-10">
            <User className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No avatars yet. Try a preset above or create a custom one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {avatars.map((avatar) => (
              <div key={avatar.id} className="card-glow text-center group">
                <div className="w-32 h-32 mx-auto mb-3 rounded-2xl overflow-hidden bg-dark-800 border border-dark-500 cursor-pointer hover:border-primary-500/50 transition-colors relative"
                  onClick={() => setPreviewAvatar(avatar)}>
                  <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-dark-800/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                    <Eye className="w-6 h-6 text-primary-400" />
                  </div>
                </div>
                <h4 className="text-sm font-medium text-white truncate px-2">{avatar.name}</h4>
                <span className="badge-blue text-xs mt-1">{avatar.style}</span>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button onClick={() => handleDownload(avatar)}
                    className="btn-secondary text-[10px] py-1 px-1.5 flex items-center gap-1">
                    <Download className="w-3 h-3" /> SVG
                  </button>
                  <button onClick={() => handleDownloadPNG(avatar)}
                    className="btn-secondary text-[10px] py-1 px-1.5 flex items-center gap-1">
                    <Download className="w-3 h-3" /> PNG
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewAvatar && (
        <AvatarPreviewModal avatar={previewAvatar} onClose={() => setPreviewAvatar(null)}
          onDownload={() => handleDownload(previewAvatar)} onDownloadPNG={() => handleDownloadPNG(previewAvatar)} />
      )}
    </div>
  );
}
