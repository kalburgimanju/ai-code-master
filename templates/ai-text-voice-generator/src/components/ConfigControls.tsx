'use client';

import { ReactNode } from 'react';
import { Sliders, Mic, Video, User, Sparkles } from 'lucide-react';

// ─── Slider Control ──────────────────────────────────────
export function SliderControl({
  label, icon, value, min, max, step, unit, onChange,
}: {
  label: string; icon?: ReactNode; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-300 flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className="text-primary-400 font-mono font-medium">
          {step && step < 1 ? value.toFixed(step < 0.1 ? 2 : 1) : value}
          {unit && <span className="text-gray-500 ml-0.5">{unit}</span>}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step || 1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-dark-600 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500
            [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary-500/30
            [&::-webkit-slider-thumb]:hover:bg-primary-400 [&::-webkit-slider-thumb]:transition-colors
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:border-0"
          style={{
            background: `linear-gradient(to right, #5c7cfa ${pct}%, #2C2E33 ${pct}%)`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Toggle Control ──────────────────────────────────────
export function ToggleControl({
  label, icon, value, options, onChange,
}: {
  label: string; icon?: ReactNode; value: string; options: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs text-gray-300">
        {icon}
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              value === opt.id
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/40 shadow-sm shadow-primary-500/10'
                : 'bg-dark-600/50 text-gray-400 border border-dark-400 hover:border-dark-300 hover:text-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Config Section Wrapper ──────────────────────────────
export function ConfigSection({ title, icon, children, defaultOpen }: {
  title: string; icon?: ReactNode; children: ReactNode; defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-dark-700/50 [&::-webkit-details-marker]:hidden">
        <Sliders className="w-3.5 h-3.5 text-gray-500 group-open:text-primary-400 transition-colors" />
        {icon}
        {title}
        <span className="ml-auto text-[10px] text-gray-600 group-open:text-gray-500">▼</span>
      </summary>
      <div className="pt-3 pb-1 px-3 space-y-3">
        {children}
      </div>
    </details>
  );
}

// ─── Preset Buttons ──────────────────────────────────────
export type AudioPreset = 'natural' | 'deep' | 'energetic' | 'soft' | 'robotic';
export type VideoPreset = 'standard' | 'presentation' | 'cinematic' | 'fast-cut' | 'smooth' | 'vibrant';

export const AUDIO_PRESETS: Record<AudioPreset, { pitch: number; speed: number; clarity: number; emotion: string; label: string; desc: string }> = {
  natural: { pitch: 1.0, speed: 0.9, clarity: 0.85, emotion: 'neutral', label: 'Natural', desc: 'Human-like balanced voice' },
  deep: { pitch: 0.8, speed: 0.85, clarity: 0.8, emotion: 'serious', label: 'Deep', desc: 'Low, authoritative male tone' },
  energetic: { pitch: 1.15, speed: 1.2, clarity: 0.9, emotion: 'excited', label: 'Energetic', desc: 'Upbeat, fast delivery' },
  soft: { pitch: 1.1, speed: 0.85, clarity: 0.75, emotion: 'calm', label: 'Soft', desc: 'Gentle, warm female tone' },
  robotic: { pitch: 0.6, speed: 1.0, clarity: 0.95, emotion: 'neutral', label: 'Robotic', desc: 'Mechanical synth voice' },
};

export const VIDEO_PRESETS: Record<VideoPreset, { fps: number; motionBlur: number; colorIntensity: number; sceneSpeed: number; particleCount: number; label: string; desc: string }> = {
  standard: { fps: 30, motionBlur: 0.2, colorIntensity: 0.6, sceneSpeed: 0.85, particleCount: 15, label: 'Standard', desc: 'Balanced quality' },
  presentation: { fps: 30, motionBlur: 0.15, colorIntensity: 0.7, sceneSpeed: 0.75, particleCount: 12, label: 'Presentation', desc: 'YouTube talk style' },
  cinematic: { fps: 24, motionBlur: 0.7, colorIntensity: 0.8, sceneSpeed: 0.7, particleCount: 30, label: 'Cinematic', desc: 'Film-like 24fps' },
  'fast-cut': { fps: 30, motionBlur: 0.1, colorIntensity: 0.6, sceneSpeed: 1.5, particleCount: 10, label: 'Fast Cut', desc: 'Quick scene changes' },
  smooth: { fps: 60, motionBlur: 0.5, colorIntensity: 0.4, sceneSpeed: 0.8, particleCount: 25, label: 'Smooth', desc: '60fps fluid motion' },
  vibrant: { fps: 30, motionBlur: 0.2, colorIntensity: 1.0, sceneSpeed: 1.2, particleCount: 40, label: 'Vibrant', desc: 'High color & particles' },
};

// ─── Audio Config Panel ──────────────────────────────────
export interface AudioConfig {
  pitch: number;
  speed: number;
  clarity: number;
  volume: number;
  emotion: string;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  pitch: 1.0, speed: 0.9, clarity: 0.85, volume: 0.85, emotion: 'neutral',
};

export function AudioConfigPanel({ config, onChange }: { config: AudioConfig; onChange: (c: AudioConfig) => void }) {
  const set = (key: keyof AudioConfig, value: number | string) => onChange({ ...config, [key]: value });
  const currentPreset = Object.entries(AUDIO_PRESETS).find(([, p]) =>
    Math.abs(p.pitch - config.pitch) < 0.05 &&
    Math.abs(p.speed - config.speed) < 0.05 &&
    Math.abs(p.clarity - config.clarity) < 0.05 &&
    p.emotion === config.emotion
  )?.[0] as AudioPreset | undefined;

  return (
    <ConfigSection title="Voice Configuration" icon={<Mic className="w-3.5 h-3.5" />} defaultOpen>
      {/* Presets */}
      <div className="mb-2">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Quick Presets</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {(Object.entries(AUDIO_PRESETS) as [AudioPreset, typeof AUDIO_PRESETS['natural']][]).map(([id, p]) => (
            <button
              key={id}
              onClick={() => { set('pitch', p.pitch); set('speed', p.speed); set('clarity', p.clarity); set('emotion', p.emotion); }}
              className={`px-2 py-1.5 rounded-lg text-xs border transition-all text-left ${
                currentPreset === id
                  ? 'border-primary-500/50 bg-primary-600/10 text-primary-300'
                  : 'border-dark-400 bg-dark-700/30 text-gray-400 hover:border-dark-300'
              }`}
            >
              <span className="font-medium block">{p.label}</span>
              <span className="text-[10px] opacity-70">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <SliderControl label="Pitch" value={config.pitch} min={0.5} max={1.8} step={0.05} unit="x" onChange={(v) => set('pitch', v)} />
      <SliderControl label="Speed" value={config.speed} min={0.5} max={2.0} step={0.05} unit="x" onChange={(v) => set('speed', v)} />
      <SliderControl label="Clarity" value={config.clarity} min={0} max={1} step={0.05} onChange={(v) => set('clarity', v)} />
      <SliderControl label="Volume" value={config.volume} min={0} max={1} step={0.05} onChange={(v) => set('volume', v)} />
      <ToggleControl label="Emotion" value={config.emotion}
        options={[
          { id: 'neutral', label: 'Neutral' },
          { id: 'happy', label: 'Happy' },
          { id: 'serious', label: 'Serious' },
          { id: 'calm', label: 'Calm' },
          { id: 'excited', label: 'Excited' },
        ]}
        onChange={(v) => set('emotion', v)}
      />
    </ConfigSection>
  );
}

// ─── Video Config Panel ──────────────────────────────────
export interface VideoConfig {
  fps: number;
  motionBlur: number;
  colorIntensity: number;
  sceneSpeed: number;
  particleCount: number;
  resolution: string;
  temperature: number;
  creativity: number;
}

export const DEFAULT_VIDEO_CONFIG: VideoConfig = {
  fps: 30, motionBlur: 0.2, colorIntensity: 0.6, sceneSpeed: 0.85,
  particleCount: 15, resolution: '1280x720', temperature: 0.7, creativity: 0.5,
};

export function VideoConfigPanel({ config, onChange }: { config: VideoConfig; onChange: (c: VideoConfig) => void }) {
  const set = (key: keyof VideoConfig, value: number | string) => onChange({ ...config, [key]: value });
  const currentPreset = Object.entries(VIDEO_PRESETS).find(([, p]) =>
    p.fps === config.fps &&
    Math.abs(p.motionBlur - config.motionBlur) < 0.05 &&
    Math.abs(p.colorIntensity - config.colorIntensity) < 0.05 &&
    Math.abs(p.sceneSpeed - config.sceneSpeed) < 0.05 &&
    p.particleCount === config.particleCount
  )?.[0] as VideoPreset | undefined;

  return (
    <ConfigSection title="Video Configuration" icon={<Video className="w-3.5 h-3.5" />} defaultOpen>
      {/* Presets */}
      <div className="mb-2">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Quick Presets</div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(VIDEO_PRESETS) as [VideoPreset, typeof VIDEO_PRESETS['standard']][]).map(([id, p]) => (
            <button
              key={id}
              onClick={() => { set('fps', p.fps); set('motionBlur', p.motionBlur); set('colorIntensity', p.colorIntensity); set('sceneSpeed', p.sceneSpeed); set('particleCount', p.particleCount); }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                currentPreset === id
                  ? 'border-primary-500/50 bg-primary-600/10 text-primary-300'
                  : 'border-dark-400 bg-dark-700/30 text-gray-400 hover:border-dark-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <SliderControl label="FPS" value={config.fps} min={12} max={60} step={1} unit="fps" onChange={(v) => set('fps', v)} />
      <SliderControl label="Scene Speed" value={config.sceneSpeed} min={0.3} max={2.0} step={0.1} unit="x" onChange={(v) => set('sceneSpeed', v)} />
      <SliderControl label="Motion Blur" value={config.motionBlur} min={0} max={1} step={0.05} onChange={(v) => set('motionBlur', v)} />
      <SliderControl label="Color Intensity" value={config.colorIntensity} min={0} max={1} step={0.05} onChange={(v) => set('colorIntensity', v)} />
      <SliderControl label="Particles" value={config.particleCount} min={0} max={80} step={1} onChange={(v) => set('particleCount', v)} />
      <SliderControl label="Temperature" value={config.temperature} min={0} max={1.5} step={0.05} onChange={(v) => set('temperature', v)} />
      <SliderControl label="Creativity" value={config.creativity} min={0} max={1} step={0.05} onChange={(v) => set('creativity', v)} />
      <ToggleControl label="Resolution" value={config.resolution}
        options={[
          { id: '320x180', label: '180p' },
          { id: '640x360', label: '360p' },
          { id: '854x480', label: '480p' },
          { id: '1280x720', label: '720p' },
        ]}
        onChange={(v) => set('resolution', v)}
      />
    </ConfigSection>
  );
}
