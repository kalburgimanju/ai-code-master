'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { VideoRecord, AppStatus } from '@/types';

interface AvatarOption {
  id: string;
  name: string;
  gender: string;
  preview: string;
}

const SAMPLE_PROMPTS = [
  {
    label: 'Compliance Training',
    prompt: 'Use a professional avatar. Make a compliance training video explaining phishing in detail. Use examples and list top watch-outs. Leverage motion graphics as A-roll overlay and B-roll to help explain core concepts.',
  },
  {
    label: 'Educational Explainer',
    prompt: 'Create a 1-minute video about camera aperture. Use minimal scientific diagrams and visualizations. No avatar needed, only voice-over. Cool neutrals (navy, cyan), thin-line diagrams, and slow elegant motion. B-roll is abstract scientific illustrations. Sequencing: definition → diagram expansion → conceptual layering, with fade-through transitions.',
  },
  {
    label: 'Brand Story',
    prompt: 'Make a video telling the story of how HeyGen started. Use cartoon-style animations and overlays. Use HeyGen colors and fonts. Use motion graphics overlays and AI-generated B-roll.',
  },
  {
    label: 'Product Launch',
    prompt: 'Create a product launch video for a new AI writing assistant. Scene 1: Animated logo reveal with particle effects, brand colors sweep. Scene 2: Avatar on branded background with text overlay "Write 10x Faster". Scene 3: Stock footage of frustrated person at computer, then clock ticking. Scene 4: Avatar speaking, animated product logo appears. Scene 5: Animated screen recording showing interface with callouts. Scene 6: Three benefits animate in one by one with icons. Scene 7: Avatar with confident pose, CTA text overlay. Scene 8: Logo, tagline, website URL end card.',
  },
  {
    label: 'Productivity Demo',
    prompt: 'Introduce HeyGen to knowledge workers, talk about its Talking Avatar models, how people use it, and mention Video Agent at the end.',
  },
];

const STYLE_PROMPT = `Use minimal, clean styled visuals. Blue, black, and white as main colors. Leverage motion graphics as B-rolls and A-roll overlays. Use AI videos when necessary. When real-world footage is needed, use Stock Media. Include an intro sequence, outro sequence, and chapter breaks using Motion Graphics.`;

export default function HomePage() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [script, setScript] = useState('');
  const [useScript, setUseScript] = useState(false);
  const [selectedAvatars, setSelectedAvatars] = useState<string[]>([]);
  const [availableAvatars, setAvailableAvatars] = useState<AvatarOption[]>([]);
  const [durationSec, setDurationSec] = useState<number>(10);
  const [autoDuration, setAutoDuration] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [useStylePrompt, setUseStylePrompt] = useState(true);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [currentVideo, setCurrentVideo] = useState<VideoRecord | null>(null);
  const [history, setHistory] = useState<VideoRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [avatarsLoading, setAvatarsLoading] = useState(false);

  // Fetch available avatars on mount
  useEffect(() => {
    (async () => {
      setAvatarsLoading(true);
      try {
        const res = await fetch('/api/heygen/generate');
        if (res.ok) {
          const data = await res.json();
          if (data.avatars?.length) {
            setAvailableAvatars(
              data.avatars.map((a: { id: string; name: string; gender: string; preview_image_url: string }) => ({
                id: a.id,
                name: a.name,
                gender: a.gender,
                preview: a.preview_image_url,
              }))
            );
          }
        }
      } catch {
        // Avatars unavailable via API — user may not have .env set, fallback silently
      } finally {
        setAvatarsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPolling = useCallback((videoId: string, recordId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const params = new URLSearchParams({ video_id: videoId });
        if (apiKey) params.set('api_key', apiKey);

        const res = await fetch(`/api/heygen/status?${params}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to check status');
        }

        const data = await res.json();

        setHistory(prev =>
          prev.map(v =>
            v.id === recordId
              ? { ...v, status: data.status, videoUrl: data.video_url, thumbnailUrl: data.thumbnail_url, error: data.error, duration: data.duration }
              : v
          )
        );

        if (data.status === 'completed') {
          setStatus('completed');
          setProgressMessage('Video generated successfully!');
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;

          setCurrentVideo(prev =>
            prev?.id === recordId
              ? { ...prev, status: 'completed', videoUrl: data.video_url, duration: data.duration }
              : prev
          );
        } else if (data.status === 'failed') {
          setStatus('failed');
          setError(data.error || 'Video generation failed');
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
        } else {
          setProgressMessage(data.status === 'pending' ? 'Queued...' : 'Generating your video...');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
  }, [apiKey]);

  const handleGenerate = async () => {
    const finalPrompt = useScript ? script : prompt;
    if (!finalPrompt?.trim()) return;

    setError(null);
    setStatus('generating');
    setProgressMessage('Initiating video generation...');
    setCurrentVideo(null);

    try {
      let fullPrompt = finalPrompt.trim();
      if (useStylePrompt) {
        fullPrompt = `${fullPrompt}\n\n${STYLE_PROMPT}`;
      }

      const res = await fetch('/api/heygen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey || undefined,
          prompt: fullPrompt,
          aspectRatio,
          avatarIds: selectedAvatars.length > 0 ? selectedAvatars : undefined,
          title: fullPrompt.slice(0, 60),
          duration: autoDuration ? undefined : durationSec,
          autoDuration,
          enhancePrompt,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate video');
      }

      const data = await res.json();

      if (!data.video_id) {
        throw new Error('No video_id returned from API');
      }

      setStatus('processing');
      setProgressMessage('Video queued. Waiting for generation...');

      const record: VideoRecord = {
        id: crypto.randomUUID(),
        title: fullPrompt.slice(0, 80) + (fullPrompt.length > 80 ? '...' : ''),
        videoId: data.video_id,
        status: 'processing',
        prompt: fullPrompt,
        createdAt: new Date().toISOString(),
      };

      setCurrentVideo(record);
      setHistory(prev => [record, ...prev]);
      setPrompt('');
      setScript('');

      startPolling(data.video_id, record.id);
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleReset = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = null;
    setStatus('idle');
    setCurrentVideo(null);
    setError(null);
    setProgressMessage('');
  };

  const applySamplePrompt = (sample: string) => {
    setPrompt(sample);
    setUseScript(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  };

  const toggleAvatar = (id: string) => {
    setSelectedAvatars(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [id]
    );
  };

  const isGenerating = status === 'generating' || status === 'processing';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-surface-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-surface-900">HeyGen Video Agent</h1>
              <p className="text-xs text-surface-400">AI Video Generation Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-sm text-surface-500 hover:text-surface-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {showGuide ? 'Close Guide' : 'Prompt Guide'}
            </button>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-sm text-surface-500 hover:text-surface-800 px-3 py-1.5 rounded-lg hover:bg-surface-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              API Key
            </button>
          </div>
        </div>
        {showApiKey && (
          <div className="border-t border-surface-100 bg-surface-50 px-4 sm:px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <label className="text-xs font-medium text-surface-500 whitespace-nowrap">HeyGen API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your HeyGen API key..."
                className="flex-1 max-w-md px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white"
              />
              <a
                href="https://app.heygen.com/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand hover:text-brand-light underline"
              >
                Get API key →
              </a>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 flex">
        {/* Prompt Guide Sidebar */}
        {showGuide && (
          <aside className="w-72 lg:w-80 border-r border-surface-100 bg-surface-50 overflow-y-auto shrink-0 hidden md:block">
            <div className="p-5 space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Quick Tips</h3>
                <ul className="space-y-2">
                  <li className="text-xs text-surface-600 flex items-start gap-2">
                    <span className="text-brand mt-0.5 shrink-0">•</span>
                    <span><strong>Be specific</strong> — describe scenes, visuals, and style in detail</span>
                  </li>
                  <li className="text-xs text-surface-600 flex items-start gap-2">
                    <span className="text-brand mt-0.5 shrink-0">•</span>
                    <span><strong>Define style</strong> — mention colors, motion graphics, stock media</span>
                  </li>
                  <li className="text-xs text-surface-600 flex items-start gap-2">
                    <span className="text-brand mt-0.5 shrink-0">•</span>
                    <span><strong>Duration</strong> — video length is 4–15 seconds</span>
                  </li>
                  <li className="text-xs text-surface-600 flex items-start gap-2">
                    <span className="text-brand mt-0.5 shrink-0">•</span>
                    <span><strong>Prompt enhancement</strong> — on by default for better results</span>
                  </li>
                  <li className="text-xs text-surface-600 flex items-start gap-2">
                    <span className="text-brand mt-0.5 shrink-0">•</span>
                    <span><strong>More context</strong> = better videos</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Media Types</h3>
                <div className="space-y-2">
                  <div className="text-xs text-surface-600">
                    <span className="font-medium text-surface-800">Motion Graphics</span>
                    <p className="text-surface-400 mt-0.5">Animated text, icons, charts, transitions</p>
                  </div>
                  <div className="text-xs text-surface-600">
                    <span className="font-medium text-surface-800">AI Generated</span>
                    <p className="text-surface-400 mt-0.5">Images & clips created from descriptions</p>
                  </div>
                  <div className="text-xs text-surface-600">
                    <span className="font-medium text-surface-800">Stock Media</span>
                    <p className="text-surface-400 mt-0.5">Real-world footage for authentic scenes</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

            {/* Prompt Input Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-surface-900">Describe Your Video</h2>
                  <p className="text-sm text-surface-400">Tell the AI Agent what to create. Be specific about scenes, style, and tone.</p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Describe your video...\n\nExample:\n"A professional presenter introduces AI video generation in a modern studio. Clean blue and white visuals with motion graphics overlays. Chapter breaks between sections. Professional, confident tone."`}
                  rows={6}
                  className="w-full px-4 py-3.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-surface-300 resize-y leading-relaxed"
                  disabled={isGenerating}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      showAdvanced ? 'bg-brand/10 border-brand/30 text-brand' : 'bg-white border-surface-200 text-surface-400 hover:border-surface-300'
                    }`}
                  >
                    {showAdvanced ? 'Hide' : '+ Settings'}
                  </button>
                  <span className="text-xs text-surface-300">{prompt.length} chars</span>
                </div>
              </div>

              {!prompt && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SAMPLE_PROMPTS.map((sample, i) => (
                    <button
                      key={i}
                      onClick={() => applySamplePrompt(sample.prompt)}
                      className="text-xs px-2.5 py-1 rounded-full border border-surface-200 bg-white text-surface-500 hover:border-brand/40 hover:text-brand hover:bg-brand/5 transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Avatar Selection */}
            {availableAvatars.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-surface-800 mb-3">Choose Avatar</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
                  <button
                    onClick={() => setSelectedAvatars([])}
                    className={`snap-start shrink-0 w-20 p-2 rounded-xl border-2 text-center transition-all ${
                      selectedAvatars.length === 0
                        ? 'border-brand bg-brand/5'
                        : 'border-surface-100 hover:border-surface-200 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-surface-50 flex items-center justify-center mb-1">
                      <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-medium text-surface-500 block leading-tight">Auto</span>
                  </button>
                  {availableAvatars.map(avatar => (
                    <button
                      key={avatar.id}
                      onClick={() => toggleAvatar(avatar.id)}
                      className={`snap-start shrink-0 w-20 p-2 rounded-xl border-2 text-center transition-all ${
                        selectedAvatars.includes(avatar.id)
                          ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                          : 'border-surface-100 hover:border-surface-200 bg-white'
                      }`}
                    >
                      <img
                        src={avatar.preview}
                        alt={avatar.name}
                        className="w-12 h-12 mx-auto rounded-full object-cover mb-1 bg-surface-50"
                        loading="lazy"
                      />
                      <span className="text-[10px] font-medium text-surface-600 block leading-tight">{avatar.name}</span>
                      <span className="text-[9px] text-surface-300 capitalize">{avatar.gender}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {avatarsLoading && (
              <section className="flex items-center gap-2 text-xs text-surface-400">
                <span className="w-2 h-2 bg-brand/40 rounded-full animate-pulse-dot" />
                Loading avatars...
              </section>
            )}

            {/* Advanced Style Settings */}
            {showAdvanced && (
              <section className="bg-surface-50 rounded-xl border border-surface-100 p-5 space-y-5">
                <h3 className="text-sm font-semibold text-surface-800">Video Configuration</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Aspect Ratio */}
                  <div>
                    <label className="text-xs font-medium text-surface-600 block mb-1.5">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={e => setAspectRatio(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white"
                      disabled={isGenerating}
                    >
                      <option value="16:9">Landscape (16:9)</option>
                      <option value="9:16">Portrait (9:16)</option>
                      <option value="1:1">Square (1:1)</option>
                    </select>
                  </div>

                  {/* Duration Mode */}
                  <div>
                    <label className="text-xs font-medium text-surface-600 block mb-1.5">Duration</label>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoDuration}
                          onChange={e => setAutoDuration(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-surface-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand"></div>
                      </label>
                      <span className="text-xs text-surface-500">Auto</span>
                    </div>
                    {!autoDuration && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="range"
                          min={4}
                          max={15}
                          value={durationSec}
                          onChange={e => setDurationSec(Number(e.target.value))}
                          className="flex-1 accent-brand"
                        />
                        <span className="text-xs font-medium text-surface-600 w-10 text-right">{durationSec}s</span>
                      </div>
                    )}
                  </div>

                  {/* Enhance Prompt */}
                  <div>
                    <label className="text-xs font-medium text-surface-600 block mb-1.5">Prompt Enhancement</label>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enhancePrompt}
                          onChange={e => setEnhancePrompt(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-surface-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand"></div>
                      </label>
                      <span className="text-xs text-surface-500">Server-side rewrite for better results</span>
                    </div>
                  </div>

                  {/* Style Prompt */}
                  <div>
                    <label className="text-xs font-medium text-surface-600 block mb-1.5">Style Prompt</label>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useStylePrompt}
                          onChange={e => setUseStylePrompt(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-surface-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand"></div>
                      </label>
                      <span className="text-xs text-surface-500">Blue/black/white + motion graphics style</span>
                    </div>
                  </div>
                </div>

                {useStylePrompt && (
                  <div className="bg-white border border-surface-200 rounded-lg p-3">
                    <p className="text-xs text-surface-400 leading-relaxed">{STYLE_PROMPT}</p>
                  </div>
                )}
              </section>
            )}

            {/* Generate Button */}
            <div className="flex items-center justify-between">
              <div>
                {error && (
                  <div className="text-sm text-red-500 flex items-center gap-1.5 max-w-lg">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="break-all">{error}</span>
                  </div>
                )}
                {progressMessage && !error && status !== 'idle' && (
                  <p className="text-sm text-surface-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse-dot" />
                    {progressMessage}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {isGenerating && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 text-sm font-medium text-surface-600 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                    isGenerating
                      ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                      : 'bg-brand text-white hover:bg-brand-dark shadow-sm hover:shadow-md active:scale-[0.98]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      Generate Video
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Video Result / Player */}
            {(currentVideo || status === 'completed') && (
              <section className="bg-surface-50 rounded-xl border border-surface-100 overflow-hidden">
                <div className="p-4 border-b border-surface-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-surface-800">Generated Video</h3>
                  {currentVideo?.status === 'completed' && currentVideo?.duration && (
                    <span className="text-xs text-surface-400">
                      Duration: {Math.round(currentVideo.duration)}s
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {currentVideo?.videoUrl ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        key={currentVideo.videoUrl}
                        src={currentVideo.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full"
                        playsInline
                      >
                        Your browser does not support video playback.
                      </video>
                    </div>
                  ) : status === 'processing' || status === 'generating' ? (
                    <div className="aspect-video bg-surface-100 rounded-lg flex flex-col items-center justify-center gap-4">
                      <div className="flex gap-2">
                        <span className="w-3 h-3 bg-brand rounded-full animate-pulse-dot" style={{ animationDelay: '0s' }} />
                        <span className="w-3 h-3 bg-brand rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                        <span className="w-3 h-3 bg-brand rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <p className="text-sm text-surface-400">{progressMessage}</p>
                    </div>
                  ) : null}
                </div>
              </section>
            )}

            {/* History Section */}
            {history.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-surface-800 mb-3">Generation History</h3>
                <div className="space-y-2">
                  {history.map(record => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-white border border-surface-100 rounded-lg hover:border-surface-200 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium text-surface-800 truncate">{record.title}</p>
                        <p className="text-xs text-surface-400 mt-0.5">
                          {new Date(record.createdAt).toLocaleString()} · ID: {record.videoId.slice(0, 12)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {record.status === 'completed' && record.videoUrl && (
                          <button
                            onClick={() => setCurrentVideo(record)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-brand/10 text-brand font-medium hover:bg-brand/20 transition-colors"
                          >
                            Play
                          </button>
                        )}
                        {record.status === 'processing' && (
                          <span className="text-xs text-amber-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse-dot" />
                            Processing
                          </span>
                        )}
                        {record.status === 'failed' && (
                          <span className="text-xs text-red-400">Failed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {status === 'idle' && !currentVideo && (
              <section className="text-center py-12 border-2 border-dashed border-surface-100 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-surface-600">Ready to Create</h3>
                <p className="text-xs text-surface-400 mt-1 max-w-md mx-auto">
                  Describe your video above, choose an avatar, and click Generate.
                  The AI Agent will produce a professional cinematic video based on your direction.
                </p>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-surface-400">
                  <span className="flex items-center gap-1">⌘ Enter to generate</span>
                  <span className="w-px h-3 bg-surface-200" />
                  <span>Click sample prompts to get started</span>
                </div>
              </section>
            )}

          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <p className="text-xs text-surface-400">
            Powered by HeyGen Video Agent V2 · Cinematic Avatar
          </p>
          <p className="text-xs text-surface-300">
            Generate professional AI videos from a single prompt
          </p>
        </div>
      </footer>
    </div>
  );
}
